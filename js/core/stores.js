/* Kurenai OS — core/stores.js
   THE STORE REGISTRY (quality W1, RC4; DI-14, DI-21, AA-26; invariant 7).

   One row per IndexedDB database the app opens: what it holds, whether the
   full backup carries it (and under which key), how to count it and what
   Reset everything does to it. Every surface that speaks about "all of your
   data on this device" reads this table — Backup & Restore's "What a backup
   covers" and its "Not in the file" line, and Reset everything — so a new
   store cannot be forgotten by one of them (smoke134 U fails when the app
   opens a database the table does not list).

   The rows name databases by their base name; the data namespace's suffix
   (KOS.dataMode.suffix, "-empty"/"-sample") is added here, so a review
   namespace only ever counts or clears its own.

   Clearing is generic: open the database as it is (no version change, so
   the owner's own open connection is untouched), clear every object store
   in one transaction. A database that was never created is left uncreated.
   Reset everything reloads the page after, so no owner keeps a cache of
   what was cleared.

     KOS.stores.list()               → the rows
     KOS.stores.get(id)              → one row
     KOS.stores.name(id)             → its database name in this namespace
     KOS.stores.count(id, cb)        → cb(err, n | null)
     KOS.stores.clear(id, cb)        → cb(err)
     KOS.stores.clearAll(cb)         → cb(err, ids cleared): every row but
                                       the checkpoints and the state's mirror */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};
  function suffix() { return (KOS.dataMode && KOS.dataMode.suffix) || ""; }

  /* backup: the key the full backup file carries it under (null: not in
     the file, and `why` says why). count: the object store whose rows are
     counted, or a function(cb). keep: Reset everything leaves it. */
  var ROWS = [
    { id: "media", db: "kurenai-os-media", backup: "mediaEntries", mark: "蒐", tone: "anime", count: "entries", unit: ["title", "titles"],
      label: "The Collection: anime, books, visual novels and games, with routes, quotes and physical volumes",
      /* the AniList, VNDB and GitHub sign-ins stay through a reset (they are
         never in a backup either); every other key goes, the cloud sync's
         base copy and watermarks with them, so a signed-in device links
         again as a fresh install and takes the account's copy back down */
      keepKey: function (key) { return !!(KOS.mediadb && KOS.mediadb.tokenKeys && KOS.mediadb.tokenKeys[key]); } },
    { id: "files", db: "kurenai-os-files", backup: "attachments", mark: "档", tone: "muted", unit: ["file", "files"],
      label: "Files and attachments, with your profile picture and banner",
      count: function (cb) {
        if (!KOS.attach || !KOS.attach.available || !KOS.attach.available() || !KOS.attach.listMeta) { cb(null, null); return; }
        KOS.attach.listMeta(function (err, rows) {
          /* the profile picture and banner ride the backup but are not documents */
          cb(err, (rows || []).filter(function (r) { return !(typeof r.origin === "string" && /^profile:/.test(r.origin)); }).length);
        });
      } },
    { id: "money", db: "kurenai-os-money", backup: "money", mark: "円", tone: "books", count: "tx", unit: ["transaction", "transactions"],
      label: "Money's transactions" },
    { id: "reviews", db: "kurenai-os-reviews", backup: "reviews", mark: "復", tone: "teal", count: "rev", unit: ["rating", "ratings"],
      label: "The review log: every flashcard rating" },
    { id: "ink", db: "kurenai-os-ink", backup: "ink", mark: "筆", tone: "muted", count: "pages", unit: ["page", "pages"],
      label: "Handwriting: notebooks and their pages" },
    { id: "mind", db: "kurenai-os-mind", backup: "mind", mark: "心", tone: "teal", count: "entries", unit: ["entry", "entries"],
      label: "Mind's Journal" },
    { id: "creatives", db: "kurenai-os-creatives", backup: "creatives", mark: "創", tone: "amber", count: "files", unit: ["piece", "pieces"],
      label: "Creatives' work and Writing Desk drafts" },
    { id: "ledger", db: "kurenai-os-ledger", backup: "ledger", mark: "録", tone: "gold", count: "entries", unit: ["session", "sessions"],
      label: "Older sessions, past the ledger's 2,000" },
    { id: "jaMined", db: "kurenai-os-ja-mined", backup: "jaMined", mark: "語", tone: "amber", count: "lines", unit: ["line", "lines"],
      label: "Japanese lines you saved" },
    /* ---- not in the file ---- */
    { id: "papers", db: "kurenai-os-papers", backup: null, count: "files", unit: ["paper", "papers"],
      label: "The Paper library's own PDFs", why: "a paper you Keep in my cloud is also copied into Files, which the file does carry" },
    { id: "reports", db: "kurenai-os-reports", backup: null, count: "reports", unit: ["report", "reports"],
      label: "Saved Reports and snapshots", why: "kept in your cloud when you are signed in" },
    { id: "filetext", db: "kurenai-os-filetext", backup: null, count: null,
      label: "The text read from your PDFs, for search", why: "read again from the files" },
    { id: "backups", db: "kurenai-os-backups", backup: null, count: "backups", unit: ["checkpoint", "checkpoints"], keep: true,
      label: "Checkpoints, the last five", why: "they are copies themselves; Reset everything keeps them" },
    { id: "statemirror", db: "kurenai-os-statemirror", backup: null, count: null, keep: true, state: true,
      label: "A copy of the state document", why: "the state document itself is in the file" }
  ];
  var BY_ID = {};
  ROWS.forEach(function (r) { BY_ID[r.id] = r; });

  function idb() { try { return window.indexedDB || null; } catch (e) { return null; } }
  function name(id) { var r = BY_ID[id]; return r ? r.db + suffix() : null; }

  /* open a database AS IT IS: cb(null, db) or cb(null, null) when it was
     never created (the open is aborted so it stays uncreated) */
  function openExisting(dbName, cb) {
    var I = idb();
    if (!I) { cb(null, null); return; }
    var created = false, rq;
    try { rq = I.open(dbName); } catch (e) { cb(e); return; }
    rq.onupgradeneeded = function () { created = true; try { rq.transaction.abort(); } catch (e) {} };
    rq.onsuccess = function () { cb(null, rq.result); };
    rq.onerror = function (e) {
      if (created) { if (e && e.preventDefault) e.preventDefault(); cb(null, null); return; }
      cb(rq.error || new Error("open failed"));
    };
    rq.onblocked = function () {};
  }

  function count(id, cb) {
    var r = BY_ID[id];
    if (!r || r.count == null) { cb(null, null); return; }
    if (typeof r.count === "function") { r.count(cb); return; }
    openExisting(name(id), function (err, db) {
      if (err || !db) { cb(err || null, db ? null : 0); return; }
      if (!db.objectStoreNames.contains(r.count)) { db.close(); cb(null, 0); return; }
      var rq = db.transaction(r.count, "readonly").objectStore(r.count).count();
      rq.onsuccess = function () { db.close(); cb(null, rq.result); };
      rq.onerror = function () { db.close(); cb(rq.error || new Error("count failed")); };
    });
  }

  function clear(id, cb) {
    var r = BY_ID[id];
    if (!r) { cb(new Error("No store " + id)); return; }
    openExisting(name(id), function (err, db) {
      if (err) { cb(err); return; }
      if (!db) { cb(null); return; }
      var stores = Array.prototype.slice.call(db.objectStoreNames);
      if (!stores.length) { db.close(); cb(null); return; }
      var t = db.transaction(stores, "readwrite");
      stores.forEach(function (s) {
        var os = t.objectStore(s);
        if (!r.keepKey) { os.clear(); return; }
        /* a store with keys to keep: delete the others one by one */
        var cur = os.openCursor();
        cur.onsuccess = function () {
          var c = cur.result;
          if (!c) return;
          if (!r.keepKey(String(c.key))) c.delete();
          c.continue();
        };
      });
      t.oncomplete = function () { db.close(); cb(null); };
      t.onerror = function () { db.close(); cb(t.error || new Error("clear failed")); };
      t.onabort = function () { db.close(); cb(t.error || new Error("clear aborted")); };
    });
  }

  function clearAll(cb) {
    var ids = ROWS.filter(function (r) { return !r.keep; }).map(function (r) { return r.id; }), done = [];
    (function next(i) {
      if (i >= ids.length) { cb(null, done); return; }
      clear(ids[i], function (err) {
        if (err) { cb(new Error(BY_ID[ids[i]].label + ": " + (err.message || err)), done); return; }
        done.push(ids[i]);
        next(i + 1);
      });
    })(0);
  }

  KOS.stores = {
    list: function () { return ROWS.slice(); },
    get: function (id) { return BY_ID[id] || null; },
    name: name,
    count: count,
    clear: clear,
    clearAll: clearAll
  };
})();
