/* Kurenai OS — core/mindjournal.js (KOS.mindJournal)
   Mind's Journal (docs/mind-plan.md §9, design 32n–32o; invariant 139): insights, quotes, questions
   and reflections — text the learner writes and wants to keep. Positions live in state.mind
   (versioned, KOS.mind.positions) and show in the same list; this store holds the other four kinds.

   Entry: { id, kind: insight | quote | question | reflection, title, text, concepts: [ids],
            lesson, src: { kind: "stories" | "dialogue" | "kurenai" | "capture" | "bq", … }, source
            (a quote's), at, updatedAt }

   PRIVATE AND LOCAL FIRST. Its own IndexedDB, `kurenai-os-mind` (entries by id; `del` tombstones),
   in the full backup, replicated to the owner-only table `kos_mind` (migration 20261029000001) the
   way Money's transactions are: push then pull, a per-row stamp in the media kv (`mind.sync.<uid>`)
   so this device's echo is skipped, a remote deletion applied without a tombstone of its own.
   Reports count entries and never quote them; Kurenai sees an entry only when it is sent by hand;
   global search never reads entry text. The list is kept in memory (ready()) so the desk and the
   lesson read it synchronously; a change dispatches `kos-mind-journal`.                          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var DB_NAME = "kurenai-os-mind" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), DB_VER = 1;
  var ENT = "entries", DEL = "del";
  var KINDS = ["insight", "quote", "question", "reflection"];
  var db = null, cache = null, waiting = [];

  function available() { return !!window.indexedDB; }
  function open(cb) {
    if (!available()) { cb(new Error("IndexedDB unavailable")); return; }
    if (db) { cb(null, db); return; }
    var rq = window.indexedDB.open(DB_NAME, DB_VER);
    rq.onupgradeneeded = function (e) {
      var d = e.target.result;
      if (!d.objectStoreNames.contains(ENT)) d.createObjectStore(ENT, { keyPath: "id" }).createIndex("at", "at", { unique: false });
      if (!d.objectStoreNames.contains(DEL)) d.createObjectStore(DEL, { keyPath: "id" });
    };
    rq.onsuccess = function () { db = rq.result; db.onversionchange = function () { db.close(); db = null; }; cb(null, db); };
    rq.onerror = function () { cb(rq.error); };
  }
  function txn(stores, mode, fn) {
    open(function (err, d) {
      if (err) { fn(err); return; }
      try { fn(null, d.transaction(stores, mode)); } catch (e) { fn(e); }
    });
  }
  function rid() { return "j-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function clip(s, n) { return String(s == null ? "" : s).replace(/\r\n/g, "\n").trim().slice(0, n); }
  function normalise(e) {
    if (!e || typeof e !== "object" || KINDS.indexOf(e.kind) < 0) return null;
    var text = clip(e.text, 4000), title = clip(e.title, 160);
    if (!text && !title) return null;
    return {
      id: typeof e.id === "string" && e.id ? e.id : rid(), kind: e.kind, title: title || text.split("\n")[0].slice(0, 120), text: text,
      concepts: Array.isArray(e.concepts) ? e.concepts.filter(function (c) { return typeof c === "string"; }).slice(0, 8) : [],
      lesson: typeof e.lesson === "string" ? e.lesson : null,
      src: e.src && typeof e.src === "object" ? { kind: String(e.src.kind || "capture"), ref: e.src.ref != null ? String(e.src.ref) : null } : { kind: "capture", ref: null },
      source: clip(e.source, 200),
      at: +e.at || Date.now(), updatedAt: +e.updatedAt || +e.at || Date.now()
    };
  }

  function changed() { document.dispatchEvent(new window.CustomEvent("kos-mind-journal")); soonSync(); }
  function sorted(list) { return list.slice().sort(function (a, b) { return b.at - a.at; }); }
  /* ready(cb): the list in memory; every later read is synchronous */
  function ready(cb) {
    if (cache) { cb && cb(null, cache); return; }
    if (cb) waiting.push(cb);
    if (waiting.length > 1) return;
    if (!available()) { cache = []; flush(null); return; }
    txn([ENT], "readonly", function (err, t) {
      if (err) { cache = []; flush(err); return; }
      var rq = t.objectStore(ENT).getAll();
      t.oncomplete = function () { cache = sorted((rq.result || []).map(normalise).filter(Boolean)); flush(null); };
      t.onerror = function () { cache = []; flush(t.error); };
    });
    function flush(err) { var w = waiting; waiting = []; w.forEach(function (f) { f(err, cache); }); }
  }
  function list() { return cache ? cache.slice() : []; }
  function loaded() { return !!cache; }
  function get(id) { return (cache || []).filter(function (e) { return e.id === id; })[0] || null; }

  function put(entry, cb) {
    var e = normalise(entry);
    if (!e) { cb && cb(new Error("An entry needs a kind and some words.")); return null; }
    e.updatedAt = Math.max(Date.now(), (get(e.id) || {}).updatedAt + 1 || 0);
    var write = function () {
      txn([ENT, DEL], "readwrite", function (err, t) {
        if (err) { cb && cb(err); return; }
        t.objectStore(ENT).put(e);
        t.objectStore(DEL).delete(e.id);
        t.oncomplete = function () { cache = sorted((cache || []).filter(function (x) { return x.id !== e.id; }).concat([e])); changed(); cb && cb(null, e); };
        t.onerror = function () { cb && cb(t.error); };
      });
    };
    if (cache) write(); else ready(write);
    return e;
  }
  function add(o, cb) { return put(Object.assign({}, o, { id: null, at: Date.now() }), cb); }
  function remove(id, cb) {
    txn([ENT, DEL], "readwrite", function (err, t) {
      if (err) { cb && cb(err); return; }
      t.objectStore(ENT).delete(id);
      t.objectStore(DEL).put({ id: id, at: Date.now() });
      t.oncomplete = function () { cache = (cache || []).filter(function (x) { return x.id !== id; }); changed(); cb && cb(null); };
      t.onerror = function () { cb && cb(t.error); };
    });
  }
  /* counts only — what Reports and the desk may read (invariant 139) */
  function counts() {
    var out = { all: 0 };
    KINDS.forEach(function (k) { out[k] = 0; });
    (cache || []).forEach(function (e) { out[e.kind]++; out.all++; });
    return out;
  }
  /* search inside entry text — run only on the Journal page, never by global search */
  function search(q, rows) {
    var ws = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
    return (rows || list()).filter(function (e) {
      var hay = (e.title + " " + e.text + " " + (e.source || "")).toLowerCase();
      return ws.every(function (w) { return hay.indexOf(w) >= 0; });
    });
  }

  /* ---------------- the commonplace book (Markdown, made on the device) ---------------- */
  var LABEL = { insight: "Insight", quote: "Quote", question: "Question", reflection: "Reflection", position: "Position" };
  function iso(ts) { var d = new Date(ts); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function markdown(o) {
    o = o || {};
    var C = (window.KOS_MIND && window.KOS_MIND.CONCEPTS) || {};
    var rows = list().filter(function (e) { return !o.concept || e.concepts.indexOf(o.concept) >= 0; });
    var ps = KOS.mind ? KOS.mind.positions().filter(function (p) { var l = KOS.mind.lesson(p.lesson); return !o.concept || (l && (l.concepts || []).indexOf(o.concept) >= 0); }) : [];
    var out = ["# Commonplace book" + (o.concept && C[o.concept] ? " · " + C[o.concept].name : ""), "", "_From Mind in KurenaiOS, " + iso(Date.now()) + ". Private: it stays on this device until you save it somewhere._", ""];
    rows.forEach(function (e) {
      out.push("## " + LABEL[e.kind] + " · " + e.title.replace(/\n/g, " "));
      out.push("");
      out.push("_" + iso(e.at) + (e.concepts.length ? " · " + e.concepts.map(function (c) { return C[c] ? C[c].name : c; }).join(", ") : "") + "_");
      out.push("");
      if (e.kind === "quote") out.push("> " + e.text.replace(/\n/g, "\n> ") + (e.source ? "\n>\n> — " + e.source : ""));
      else if (e.text && e.text !== e.title) out.push(e.text);
      out.push("");
    });
    ps.forEach(function (p) {
      out.push("## Position · " + p.q);
      out.push("");
      p.versions.slice().reverse().forEach(function (v) {
        out.push("- **v" + v.n + "** (" + iso(v.at) + "): " + p.options[v.answer] + ", " + v.conf + "%" + (v.reason ? " — " + v.reason : "") +
          (v.changed ? " _What changed my mind: " + v.changed + "_" : "") + (p.retiredAt && v === p.current ? " (retired)" : ""));
      });
      out.push("");
    });
    return out.join("\n");
  }

  /* ---------------- backup ---------------- */
  function readAll(cb) {
    txn([ENT, DEL], "readonly", function (err, t) {
      if (err) { cb(err); return; }
      var a = t.objectStore(ENT).getAll(), b = t.objectStore(DEL).getAll();
      t.oncomplete = function () { cb(null, a.result || [], b.result || []); };
      t.onerror = function () { cb(t.error); };
    });
  }
  function exportAll(cb) { readAll(function (err, rows, dels) { if (err) { cb(err); return; } cb(null, { entries: rows, del: dels }); }); }
  /* a restore is authoritative: the Journal becomes exactly the backup's */
  function importAll(dump, cb) {
    var rows = ((dump && dump.entries) || []).map(normalise).filter(Boolean), dels = (dump && dump.del) || [];
    txn([ENT, DEL], "readwrite", function (err, t) {
      if (err) { cb(err); return; }
      t.objectStore(ENT).clear(); t.objectStore(DEL).clear();
      rows.forEach(function (r) { t.objectStore(ENT).put(r); });
      dels.forEach(function (d) { if (d && d.id) t.objectStore(DEL).put({ id: String(d.id), at: +d.at || Date.now() }); });
      t.oncomplete = function () { cache = sorted(rows); changed(); cb(null, { entries: rows.length }); };
      t.onerror = function () { cb(t.error); };
    });
  }

  /* ---------------- replication: kos_mind ----------------
     Local first (invariant 31): signed out, or in a review namespace, nothing is sent. PUSH then
     PULL (invariant 33): every entry or tombstone whose stamp differs from what this device last
     pushed is upserted; then the rows changed on the server since the cursor are applied — this
     device's own echo skipped, a remote deletion deleted here without a tombstone of its own. */
  var cloudApi = null, syncing = false, syncTimer = null, syncStarted = false;
  var SYNC_PAGE = 200, PUSH_CHUNK = 100;
  function realCloud() {
    function c() { return KOS.cloud.client(); }
    function run(b, cb) {
      b.then(function (res) { res.error ? cb(new Error(res.error.message || "Journal sync failed.")) : cb(null, res.data); })
        .catch(function (e) { cb(new Error((e && e.message) || "Journal sync failed — network?")); });
    }
    return {
      since: function (stamp, offset, cb) {
        var q = c().from("kos_mind").select("sync_id, deleted, stamp, data_json, updated_at");
        if (stamp) q = q.gt("updated_at", stamp);
        run(q.order("updated_at", { ascending: true }).range(offset, offset + SYNC_PAGE - 1), cb);
      },
      upsert: function (rows, cb) { run(c().from("kos_mind").upsert(rows, { onConflict: "user_id,sync_id" }).select("sync_id"), cb); }
    };
  }
  function cloud() { return cloudApi || realCloud(); }
  function canSync() {
    return !!(KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn() && KOS.mediadb && KOS.mediadb.available() &&
      available() && !(KOS.dataMode && KOS.dataMode.mode));
  }
  function syncCloud(cb) {
    if (syncing || !canSync()) { cb && cb(null, { pushed: 0, pulled: 0, skipped: true }); return; }
    syncing = true;
    var uid = KOS.cloud.userId(), key = "mind.sync." + uid, out = { pushed: 0, pulled: 0, deleted: 0 };
    function finish(err, meta) { KOS.mediadb.setKV(key, meta, function () { syncing = false; if (out.pulled || out.deleted) { cache = null; ready(function () { changed(); }); } cb && cb(err || null, out); }); }
    KOS.mediadb.getKV(key, function (e0, meta) {
      meta = meta && typeof meta === "object" ? meta : {};
      meta.pushed = meta.pushed || {};
      readAll(function (e1, rows, dels) {
        if (e1) { syncing = false; cb && cb(e1, out); return; }
        var up = [];
        rows.forEach(function (r) { var st = String(r.updatedAt || 0); if (meta.pushed[r.id] !== st) up.push({ user_id: uid, sync_id: r.id, deleted: false, stamp: st, data_json: r }); });
        dels.forEach(function (d) { if (meta.pushed[d.id] !== "del") up.push({ user_id: uid, sync_id: d.id, deleted: true, stamp: "del", data_json: {} }); });
        var j = 0;
        (function chunk() {
          if (j >= up.length) { pull(); return; }
          var slice = up.slice(j, j + PUSH_CHUNK); j += PUSH_CHUNK;
          cloud().upsert(slice, function (e2) {
            if (e2) { finish(e2, meta); return; }
            slice.forEach(function (r) { meta.pushed[r.sync_id] = r.stamp; });
            out.pushed += slice.length; chunk();
          });
        })();
      });
      function pull() {
        var offset = 0, maxTs = meta.cursor || null;
        (function page() {
          cloud().since(meta.cursor || null, offset, function (e3, rows) {
            if (e3) { finish(e3, meta); return; }
            rows = rows || [];
            var puts = [], gone = [];
            rows.forEach(function (row) {
              if (!maxTs || row.updated_at > maxTs) maxTs = row.updated_at;
              if (meta.pushed[row.sync_id] === row.stamp) return;
              if (row.deleted) { gone.push(row.sync_id); meta.pushed[row.sync_id] = "del"; return; }
              var e = normalise(row.data_json);
              if (!e || e.id !== row.sync_id) return;
              puts.push(e); meta.pushed[e.id] = String(e.updatedAt || 0);
            });
            txn([ENT, DEL], "readwrite", function (e4, t) {
              if (e4) { finish(e4, meta); return; }
              gone.forEach(function (id) { t.objectStore(ENT).delete(id); });
              puts.forEach(function (e) { t.objectStore(ENT).put(e); });
              t.oncomplete = function () {
                out.pulled += puts.length; out.deleted += gone.length;
                if (rows.length === SYNC_PAGE) { offset += SYNC_PAGE; page(); return; }
                meta.cursor = maxTs; finish(null, meta);
              };
              t.onerror = function () { finish(t.error, meta); };
            });
          });
        })();
      }
    });
  }
  function soonSync() {
    if (!syncStarted) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { syncTimer = null; syncCloud(); }, 2000);
  }
  /* once after boot, then every 30 minutes (invariant 36c: a safety net) */
  function start() {
    if (syncStarted || !available()) return;
    syncStarted = true;
    ready();
    setTimeout(function () { syncCloud(); }, 11000);
    setInterval(function () { syncCloud(); }, 30 * 60 * 1000);
  }

  KOS.mindJournal = {
    KINDS: KINDS, LABEL: LABEL, available: available, ready: ready, loaded: loaded, list: list, get: get,
    add: add, put: put, remove: remove, counts: counts, search: search, markdown: markdown,
    exportAll: exportAll, importAll: importAll, syncCloud: syncCloud, start: start, normalise: normalise,
    _setCloud: function (api) { cloudApi = api; }
  };
})();
