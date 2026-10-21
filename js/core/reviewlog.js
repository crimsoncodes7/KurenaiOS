/* Kurenai OS — core/reviewlog.js
   The review log (roadmap 5.6, docs/fsrs-plan.md §4, decision C): one row
   per rating, from every source that schedules through KOS.fsrs, kept so
   the 21 FSRS parameters can later be fitted to this learner's own memory
   (phase 3). A rating used to overwrite the card's state and leave no
   trace; from the switch on, every one is kept here.

   Row: {id (auto), key, ts, day:"YYYY-MM-DD", g (1–4), el (days since the
   last review), s0, d0 (memory before; null for a new card), s1, d1, ivl,
   src: "flashcards"|"code", uid, rm}. Counts and numbers only, never card
   text. `uid` is the review's identity on every device (key|ts); `rm`
   marks a row pulled from the cloud, so it is never pushed back.

   Storage is its own IndexedDB, `kurenai-os-reviews`, outside the synced
   state document (thousands of rows would be too heavy for it). It rides
   the full backup (store.snapshotFull / importFull) and replicates to the
   owner-only table `kos_reviews` (phase 3, syncCloud below) so the
   optimiser fits every device's ratings. A failed write never blocks a
   rating: the schedule lives in the state document either way.          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var DB_NAME = "kurenai-os-reviews" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), DB_VER = 1;
  var REV = "rev";
  var db = null;

  function available() { return !!window.indexedDB; }
  function open(cb) {
    if (!available()) { cb(new Error("IndexedDB unavailable")); return; }
    if (db) { cb(null, db); return; }
    var rq = window.indexedDB.open(DB_NAME, DB_VER);
    rq.onupgradeneeded = function (e) {
      var d = e.target.result;
      if (!d.objectStoreNames.contains(REV)) {
        var os = d.createObjectStore(REV, { keyPath: "id", autoIncrement: true });
        os.createIndex("key", "key", { unique: false });
        os.createIndex("day", "day", { unique: false });
      }
    };
    rq.onsuccess = function () {
      db = rq.result;
      db.onversionchange = function () { db.close(); db = null; };
      cb(null, db);
    };
    rq.onerror = function () { cb(rq.error); };
  }
  function txn(mode, fn) {
    open(function (err, d) {
      if (err) { fn(err); return; }
      try { fn(null, d.transaction(REV, mode)); } catch (e) { fn(e); }
    });
  }

  function num(v) { return typeof v === "number" && isFinite(v) ? Math.round(v * 1e4) / 1e4 : null; }
  function normalise(r) {
    if (!r || typeof r.key !== "string" || !r.key) return null;
    var g = +r.g;
    if (!(g >= 1 && g <= 4)) return null;
    return {
      key: r.key, ts: +r.ts || Date.now(), day: String(r.day || ""), g: g,
      el: num(r.el), s0: num(r.s0), d0: num(r.d0), s1: num(r.s1), d1: num(r.d1),
      ivl: num(r.ivl), src: String(r.src || "flashcards"),
      uid: typeof r.uid === "string" && r.uid ? r.uid : r.key + "|" + (+r.ts || 0),
      rm: r.rm ? 1 : 0
    };
  }

  function add(row, cb) {
    var r = normalise(row);
    if (!r) { cb && cb(new Error("bad review row")); return; }
    txn("readwrite", function (err, t) {
      if (err) { cb && cb(err); return; }
      t.objectStore(REV).add(r);
      t.oncomplete = function () { cb && cb(null); soonSync(); };
      t.onerror = function () { cb && cb(t.error); };
    });
  }
  function all(cb) {
    txn("readonly", function (err, t) {
      if (err) { cb(err); return; }
      var rq = t.objectStore(REV).getAll();
      t.oncomplete = function () { cb(null, rq.result || []); };
      t.onerror = function () { cb(t.error); };
    });
  }
  function count(cb) {
    txn("readonly", function (err, t) {
      if (err) { cb(err); return; }
      var rq = t.objectStore(REV).count();
      t.oncomplete = function () { cb(null, rq.result || 0); };
      t.onerror = function () { cb(t.error); };
    });
  }

  /* ---------------- backup ---------------- */
  function exportAll(cb) {
    all(function (err, rows) {
      if (err) { cb(err); return; }
      cb(null, rows.map(function (r) { var o = Object.assign({}, r); delete o.id; return o; }));
    });
  }
  /* a restore is authoritative: the log becomes exactly the backup's */
  function importAll(rows, cb) {
    var list = (rows || []).map(normalise).filter(Boolean);
    txn("readwrite", function (err, t) {
      if (err) { cb(err); return; }
      var os = t.objectStore(REV);
      os.clear();
      list.forEach(function (r) { os.add(r); });
      t.oncomplete = function () { cb(null, { rows: list.length }); };
      t.onerror = function () { cb(t.error); };
    });
  }

  /* ---------------- replication (FSRS phase 3) ----------------
     `kos_reviews` holds every device's ratings, one row per review keyed
     by its uid, never changed once written. Local first (invariant 31):
     signed out, or in a review namespace, nothing is sent. Pull the rows
     newer than this device's cursor (kept in the media kv), add the ones
     it has not got (marked `rm`), then push this device's own rows past
     the last local id it pushed. */
  var cloudApi = null, syncing = false, syncTimer = null, timer = null;
  var SYNC_PAGE = 500, PUSH_CHUNK = 200;
  function realCloud() {
    function c() { return KOS.cloud.client(); }
    function run(b, cb) {
      b.then(function (res) { res.error ? cb(new Error(res.error.message || "Review log sync failed.")) : cb(null, res.data); })
        .catch(function (e) { cb(new Error((e && e.message) || "Review log sync failed — network?")); });
    }
    return {
      since: function (iso, offset, cb) {
        var q = c().from("kos_reviews").select("uid, data_json, updated_at");
        if (iso) q = q.gt("updated_at", iso);
        run(q.order("updated_at", { ascending: true }).range(offset, offset + SYNC_PAGE - 1), cb);
      },
      upsert: function (rows, cb) {
        run(c().from("kos_reviews").upsert(rows, { onConflict: "user_id,uid", ignoreDuplicates: true }), cb);
      }
    };
  }
  function cloud() { return cloudApi || realCloud(); }
  function canSync() {
    return !!(KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn() && KOS.mediadb && KOS.mediadb.available() &&
      !(KOS.dataMode && KOS.dataMode.mode));
  }
  function wire(r) { var o = Object.assign({}, r); delete o.id; delete o.rm; return o; }
  function syncCloud(cb) {
    if (syncing || !available() || !canSync()) { cb && cb(null, { pushed: 0, pulled: 0, skipped: true }); return; }
    syncing = true;
    var uid = KOS.cloud.userId(), key = "reviews.sync." + uid, out = { pushed: 0, pulled: 0 };
    function finish(err) { syncing = false; cb && cb(err || null, out); }
    KOS.mediadb.getKV(key, function (e0, meta) {
      meta = meta && typeof meta === "object" ? meta : {};
      all(function (e1, local) {
        if (e1) { finish(e1); return; }
        var have = {};
        local.forEach(function (r) { have[r.uid || r.key + "|" + r.ts] = true; });
        var fresh = [], offset = 0, maxTs = meta.cursor || null;
        (function page() {
          cloud().since(meta.cursor || null, offset, function (e2, rows) {
            if (e2) { finish(e2); return; }
            rows = rows || [];
            rows.forEach(function (row) {
              if (!maxTs || row.updated_at > maxTs) maxTs = row.updated_at;
              if (have[row.uid]) return;
              var r = normalise(Object.assign({}, row.data_json || {}, { uid: row.uid, rm: 1 }));
              if (r) { have[r.uid] = true; fresh.push(r); }
            });
            if (rows.length === SYNC_PAGE) { offset += SYNC_PAGE; page(); return; }
            store(fresh, function (e3) {
              if (e3) { finish(e3); return; }
              out.pulled = fresh.length;
              meta.cursor = maxTs;
              push();
            });
          });
        })();
        function push() {
          var last = meta.lastId || 0;
          var mine = local.filter(function (r) { return !r.rm && r.id > last; }).sort(function (a, b) { return a.id - b.id; });
          var j = 0;
          (function chunk() {
            if (j >= mine.length) { KOS.mediadb.setKV(key, meta, function () { finish(null); }); return; }
            var slice = mine.slice(j, j + PUSH_CHUNK);
            j += PUSH_CHUNK;
            cloud().upsert(slice.map(function (r) {
              return { user_id: uid, uid: r.uid || r.key + "|" + r.ts, data_json: wire(r) };
            }), function (e4) {
              if (e4) { KOS.mediadb.setKV(key, meta, function () { finish(e4); }); return; }
              meta.lastId = slice[slice.length - 1].id;
              out.pushed += slice.length;
              chunk();
            });
          })();
        }
      });
    });
  }
  function store(rows, cb) {
    if (!rows.length) { cb(null); return; }
    txn("readwrite", function (err, t) {
      if (err) { cb(err); return; }
      var os = t.objectStore(REV);
      rows.forEach(function (r) { os.add(r); });
      t.oncomplete = function () { cb(null); };
      t.onerror = function () { cb(t.error); };
    });
  }
  function soonSync() {
    if (!canSync()) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { syncTimer = null; syncCloud(); }, 30000);
  }
  function start() {
    if (timer || !available()) return;
    setTimeout(syncCloud, 10000);
    timer = setInterval(syncCloud, 30 * 60 * 1000);
  }

  /* opened once at load, so the first rating or backup never waits on the
     database's creation */
  if (available()) open(function () {});

  KOS.reviewLog = {
    available: available,
    add: add,
    all: all,
    count: count,
    exportAll: exportAll,
    importAll: importAll,
    syncCloud: syncCloud,
    start: start,
    /* test seam: a fake kos_reviews API (since, upsert) */
    _setCloudApi: function (a) { cloudApi = a || null; }
  };
})();
