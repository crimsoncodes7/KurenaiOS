/* Kurenai OS — js/core/ledgerarchive.js · KOS.ledgerArchive
   The session ledger's archive (quality programme W1, RC5; DI-10).

   The ledger in the state document keeps its newest 2,000 entries
   (sessions.js CAP, cloudmerge's cap). An entry pushed past the cap used to
   be dropped; now it is ARCHIVED here first, in its own IndexedDB
   (`kurenai-os-ledger` + the data namespace's suffix), one record per
   entry keyed by `<id>|<ts>` (ids are per-device counters, so the time
   keeps two devices' entries apart; putting one twice changes nothing).

   It is history only: every reader still reads the live ledger (streaks,
   Reports, goals, the Badge Wall's rollup), and nothing here pays, logs or
   syncs. It rides the full backup (store.snapshotFull → `ledger`,
   importFull) and so every repair's checkpoint. Local to this device:
   another device archives what IT trims.

     archive(entries) → Promise<number>   entries put (idempotent)
     capped(before, after) → the entries a merge's cap dropped
     exportAll(cb)    → cb(err, [entries]) oldest first
     importAll(rows, cb) → replaces the archive with the backup's
     count()          → Promise<number>                                  */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};
  var DB_NAME = "kurenai-os-ledger" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), DB_VER = 1, STORE = "entries";
  var dbp = null;

  function available() { return !!window.indexedDB; }
  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      if (!available()) { rej(new Error("IndexedDB unavailable")); return; }
      var rq = window.indexedDB.open(DB_NAME, DB_VER);
      rq.onupgradeneeded = function () {
        var d = rq.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: "k" }).createIndex("ts", "ts");
      };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { dbp = null; rej(rq.error || new Error("The ledger archive could not open.")); };
    });
    return dbp;
  }
  function keyOf(e) { return String(e.id) + "|" + String(e.ts || 0); }
  function plain(e) { return JSON.parse(JSON.stringify(e)); }
  function archive(entries) {
    var list = (Array.isArray(entries) ? entries : []).filter(function (e) { return e && typeof e === "object" && e.id != null; });
    if (!list.length || !available()) return Promise.resolve(0);
    /* copied NOW: the caller is about to splice them out of the state */
    var rows = list.map(function (e) { var r = { k: keyOf(e), ts: e.ts || 0, e: plain(e) }; return r; });
    return open().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(STORE, "readwrite"), os = t.objectStore(STORE);
        rows.forEach(function (r) { os.put(r); });
        t.oncomplete = function () { res(rows.length); };
        t.onerror = function () { rej(t.error); };
        t.onabort = function () { rej(t.error || new Error("aborted")); };
      });
    });
  }
  function all() {
    if (!available()) return Promise.resolve([]);
    return open().then(function (d) {
      return new Promise(function (res, rej) {
        var rq = d.transaction(STORE, "readonly").objectStore(STORE).index("ts").getAll();
        rq.onsuccess = function () { res((rq.result || []).map(function (r) { return r.e; })); };
        rq.onerror = function () { rej(rq.error); };
      });
    });
  }
  /* the entries a merge's cap pushed out: in `before`, not in `after`, and no
     newer than the oldest entry kept (a deletion elsewhere in the ledger is
     not an archive) */
  function capped(before, after) {
    before = Array.isArray(before) ? before : []; after = Array.isArray(after) ? after : [];
    if (!before.length) return [];
    var kept = {}, oldest = Infinity;
    after.forEach(function (e) { if (e && e.id != null) { kept[keyOf(e)] = true; if ((e.ts || 0) < oldest) oldest = e.ts || 0; } });
    return before.filter(function (e) { return e && e.id != null && !kept[keyOf(e)] && (e.ts || 0) <= oldest; });
  }
  function exportAll(cb) { all().then(function (rows) { cb(null, rows); }, function (e) { cb(e); }); }
  function importAll(rows, cb) {
    rows = Array.isArray(rows) ? rows : [];
    open().then(function (d) {
      var t = d.transaction(STORE, "readwrite"), os = t.objectStore(STORE);
      os.clear();
      rows.forEach(function (e) { if (e && typeof e === "object" && e.id != null) os.put({ k: keyOf(e), ts: e.ts || 0, e: e }); });
      t.oncomplete = function () { cb && cb(null, { entries: rows.length }); };
      t.onerror = function () { cb && cb(t.error); };
    }, function (e) { cb && cb(e); });
  }
  function count() {
    if (!available()) return Promise.resolve(0);
    return open().then(function (d) {
      return new Promise(function (res) {
        var rq = d.transaction(STORE, "readonly").objectStore(STORE).count();
        rq.onsuccess = function () { res(rq.result || 0); };
        rq.onerror = function () { res(0); };
      });
    });
  }

  /* opened at start, so a backup's export does not wait on the first open */
  if (available()) open().catch(function () { /* reported when used */ });
  KOS.ledgerArchive = { available: available, archive: archive, capped: capped, all: all, exportAll: exportAll, importAll: importAll, count: count, name: DB_NAME };
})();
