/* Kurenai OS — core/reviewlog.js
   The review log (roadmap 5.6, docs/fsrs-plan.md §4, decision C): one row
   per rating, from every source that schedules through KOS.fsrs, kept so
   the 21 FSRS parameters can later be fitted to this learner's own memory
   (phase 3). A rating used to overwrite the card's state and leave no
   trace; from the switch on, every one is kept here.

   Row: {id (auto), key, ts, day:"YYYY-MM-DD", g (1–4), el (days since the
   last review), s0, d0 (memory before; null for a new card), s1, d1, ivl,
   src: "flashcards"|"code"}. Counts and numbers only, never card text.

   Storage is its own IndexedDB, `kurenai-os-reviews`, outside the synced
   state document (thousands of rows would be too heavy for it). It rides
   the full backup (store.snapshotFull / importFull); replication to
   Supabase is phase 3. A failed write never blocks a rating: the schedule
   lives in the state document either way.                               */
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
      ivl: num(r.ivl), src: String(r.src || "flashcards")
    };
  }

  function add(row, cb) {
    var r = normalise(row);
    if (!r) { cb && cb(new Error("bad review row")); return; }
    txn("readwrite", function (err, t) {
      if (err) { cb && cb(err); return; }
      t.objectStore(REV).add(r);
      t.oncomplete = function () { cb && cb(null); };
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

  /* opened once at load, so the first rating or backup never waits on the
     database's creation */
  if (available()) open(function () {});

  KOS.reviewLog = {
    available: available,
    add: add,
    all: all,
    count: count,
    exportAll: exportAll,
    importAll: importAll
  };
})();
