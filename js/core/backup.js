/* Kurenai OS — js/core/backup.js
   The backup-before-change safeguard (quality programme W0, plan §B1).

   Before any one-off repair or migration runs on a real account, a FULL
   backup is taken and checked against what it was taken from:

     KOS.backup.checkpoint(label)        → Promise<{ok, id, counts, bytes, reason?}>
     KOS.backup.withCheckpoint(label, fn) → Promise<{ok, checkpoint, value?, reason?}>
     KOS.backup.list()                   → Promise<[{id, label, at, bytes, counts}]> newest first
     KOS.backup.verify(id)               → Promise<{ok, reason?}>  (the stored copy against its own hashes)
     KOS.backup.download(id)             → Promise   (the share sheet, else a download)
     KOS.backup.restore(id)              → Promise<report>  (verified first, then store.importFull)

   The backup IS `KOS.store.snapshotFull` — the one serialiser of "all of
   the user's data", so it carries exactly what the full backup file
   carries and leaves out exactly what it leaves out (provider and GitHub
   tokens, cloudsync.* kv; cloud sessions are not in any store it reads;
   invariants 7 and 35). It lives in its own IndexedDB,
   `kurenai-os-backups`, never synced and never in a backup itself; the
   last KEEP (5) verified checkpoints are kept.

   VERIFIED means: the text saved is read back from IndexedDB and parsed,
   each part's record count and SHA-256 matches the snapshot it was made
   from, AND a second snapshot of the live stores taken after the save
   matches them too (so nothing moved while it was taken). Anything less is
   ok:false, the unverified copy is deleted, and withCheckpoint does not run
   its change. Nothing here touches the Governor, the network or the cloud. */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};

  /* scoped like every store by the data namespace (KOS.dataMode), so a
     checkpoint taken in the Sample or a review namespace never lands beside
     — or rotates out — the real account's */
  var DB = "kurenai-os-backups" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), STORE = "backups", KEEP = 5, TRIES = 2;
  var PARTS = ["state", "mediaEntries", "mediaKV", "attachments", "money", "reviews", "mind", "ink", "creatives", "ledger", "jaMined"];
  /* the kv keys a backup must never carry (mediadb's TOKEN_KV_KEYS, and the
     cloud's own watermarks); checked on every checkpoint as a guard */
  var SECRET_KV = /^(anilist\.(clientId|token|viewer)|vndb\.(token|user)|github\.token|code\.github\.(outbox|status)|cloudsync\.)/;

  var seam = { afterRead: null };   /* tests only: tamper with the text read back */

  /* ---------------- IndexedDB ---------------- */
  var dbp = null;
  function idb() { return window.indexedDB || null; }
  function available() { return !!idb(); }
  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      if (!idb()) { rej(new Error("This browser has no IndexedDB.")); return; }
      var rq = idb().open(DB, 1);
      rq.onupgradeneeded = function () {
        var d = rq.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: "id" }).createIndex("at", "at");
      };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { dbp = null; rej(rq.error || new Error("The backup store could not open.")); };
    });
    return dbp;
  }
  function run(mode, fn) {
    return open().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(STORE, mode), out;
        t.oncomplete = function () { res(out); };
        t.onerror = function () { rej(t.error || new Error("Backup store error")); };
        t.onabort = function () { rej(t.error || new Error("Backup store aborted")); };
        fn(t.objectStore(STORE), function (v) { out = v; });
      });
    });
  }
  function getRec(id) { return run("readonly", function (os, set) { var r = os.get(id); r.onsuccess = function () { set(r.result || null); }; }); }
  function putRec(rec) { return run("readwrite", function (os) { os.put(rec); }); }
  function delRec(id) { return run("readwrite", function (os) { os.delete(id); }); }
  function allMeta() {
    return run("readonly", function (os, set) {
      var r = os.getAll();
      r.onsuccess = function () {
        set((r.result || []).map(function (x) { return { id: x.id, label: x.label, at: x.at, bytes: x.bytes, counts: x.counts }; })
          .sort(function (a, b) { return b.at - a.at || (b.id < a.id ? -1 : 1); }));
      };
    });
  }

  /* ---------------- hashing and counting ---------------- */
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function sha256(text) {
    var subtle = window.crypto && window.crypto.subtle;
    if (subtle && window.TextEncoder) {
      return subtle.digest("SHA-256", new window.TextEncoder().encode(text)).then(hex);
    }
    if (KOS.codeZip && KOS.codeZip.sha256) return Promise.resolve(KOS.codeZip.sha256(text));
    return Promise.reject(new Error("No SHA-256 available."));
  }
  function count(v) {
    if (v == null) return 0;
    if (Array.isArray(v)) return v.length;
    if (typeof v === "object") {
      var n = 0, arrays = false;
      Object.keys(v).forEach(function (k) { if (Array.isArray(v[k])) { arrays = true; n += v[k].length; } });
      return arrays ? n : Object.keys(v).length;
    }
    return 1;
  }
  /* key-sorted JSON: a restore re-merges the state under the store's
     defaults, which reorders keys without changing a value */
  function canon(v) {
    if (v === null || typeof v !== "object") return JSON.stringify(v);
    if (Array.isArray(v)) return "[" + v.map(function (x) { return x === undefined ? "null" : canon(x); }).join(",") + "]";
    return "{" + Object.keys(v).sort().filter(function (k) { return v[k] !== undefined && typeof v[k] !== "function"; })
      .map(function (k) { return JSON.stringify(k) + ":" + canon(v[k]); }).join(",") + "}";
  }
  /* {counts, hashes} of a backup object, part by part */
  function digest(obj) {
    var counts = {}, hashes = {};
    return PARTS.reduce(function (p, part) {
      return p.then(function () {
        var v = obj ? obj[part] : undefined;
        counts[part] = count(v);
        return sha256(v === undefined ? "" : canon(v)).then(function (h) { hashes[part] = h; });
      });
    }, Promise.resolve()).then(function () { return { counts: counts, hashes: hashes }; });
  }
  function differs(a, b) {
    for (var i = 0; i < PARTS.length; i++) {
      var k = PARTS[i];
      /* a checkpoint saved before a part existed (the ledger archive and the mined
         lines, RC5) did not hash it: that part is not compared */
      if (!Object.prototype.hasOwnProperty.call(a.hashes || {}, k)) continue;
      if (a.counts[k] !== b.counts[k]) return k + " count " + b.counts[k] + " ≠ " + a.counts[k];
      if (a.hashes[k] !== b.hashes[k]) return k + " content differs";
    }
    return null;
  }

  function snapshot() {
    return new Promise(function (res, rej) {
      if (!KOS.store || !KOS.store.snapshotFull) { rej(new Error("The store is not loaded.")); return; }
      KOS.store.snapshotFull(function (err, r) { err ? rej(err) : res(r); });
    });
  }
  function leak(obj) {
    var kv = (obj && obj.mediaKV) || [];
    for (var i = 0; i < kv.length; i++) if (SECRET_KV.test(String(kv[i] && kv[i].key))) return kv[i].key;
    return null;
  }
  function byteLen(text) { try { return new Blob([text]).size; } catch (e) { return text.length; } }
  function newId(at) { return "bk-" + at + "-" + Math.random().toString(36).slice(2, 8); }
  var lastAt = 0;   /* two checkpoints in one millisecond still order */
  function stamp() { var t = Date.now(); lastAt = t > lastAt ? t : lastAt + 1; return lastAt; }

  /* keep the newest KEEP — and never a checkpoint a repair's receipt names:
     a later repair may need it (the reports rebuild reads the DI-27
     clean-up's), so it is pinned and does not count towards KEEP */
  function pinned() {
    var out = {}, r = (KOS.store && KOS.store.state && KOS.store.state.repairs) || {};
    Object.keys(r).forEach(function (k) { if (r[k] && r[k].checkpoint) out[r[k].checkpoint] = true; });
    return out;
  }
  function rotate() {
    return allMeta().then(function (list) {
      var pin = pinned();
      return list.filter(function (m) { return !pin[m.id]; }).slice(KEEP).reduce(function (p, m) { return p.then(function () { return delRec(m.id); }); }, Promise.resolve());
    });
  }

  /* one attempt: snapshot → save → read back → compare with the snapshot and the live stores */
  function attempt(label) {
    var snap, text, mine, rec;
    return snapshot().then(function (s) {
      snap = s;
      var k = leak(snap);
      if (k) throw new Error("A credential would ride the backup: " + k);
      text = JSON.stringify(snap);
      return digest(snap);
    }).then(function (d) {
      mine = d;
      var at = stamp();
      rec = { id: newId(at), label: String(label || "checkpoint"), at: at, bytes: byteLen(text),
        counts: d.counts, hashes: d.hashes, text: text };
      return putRec(rec);
    }).then(function () {
      return getRec(rec.id);
    }).then(function (back) {
      if (!back || typeof back.text !== "string") return { ok: false, reason: "the saved copy could not be read back" };
      var t = seam.afterRead ? seam.afterRead(back.text) : back.text;
      var parsed;
      try { parsed = JSON.parse(t); } catch (e) { return { ok: false, reason: "the saved copy does not parse" }; }
      return digest(parsed).then(function (d) {
        var why = differs(mine, d);
        if (why) return { ok: false, reason: "saved copy: " + why };
        return snapshot().then(digest).then(function (live) {
          var w = differs(mine, live);
          return w ? { ok: false, reason: "the live stores moved while checking: " + w, retry: true } : { ok: true };
        });
      });
    }).then(function (v) {
      /* files the browser could not read ride by their records only: named */
      var lost = ((snap && snap.attachments) || []).filter(function (a) { return a && a.unreadable; }).map(function (a) { return a.name || "a file"; });
      if (v.ok) return rotate().then(function () { return { ok: true, id: rec.id, label: rec.label, at: rec.at, counts: rec.counts, bytes: rec.bytes, unreadable: lost }; });
      return delRec(rec.id).then(function () { return { ok: false, id: null, counts: mine.counts, bytes: rec.bytes, reason: v.reason, retry: v.retry }; });
    });
  }

  function checkpoint(label) {
    var n = 0;
    function go() {
      n++;
      return attempt(label).then(function (r) {
        if (!r.ok && r.retry && n < TRIES) return go();
        delete r.retry;
        return r;
      });
    }
    return go().catch(function (e) { return { ok: false, id: null, counts: null, bytes: 0, reason: (e && e.message) || String(e) }; });
  }

  function withCheckpoint(label, fn) {
    return checkpoint(label).then(function (cp) {
      if (!cp.ok) return { ok: false, checkpoint: cp, reason: "No verified backup, so nothing was changed: " + cp.reason };
      return Promise.resolve().then(function () { return fn(cp); }).then(function (value) {
        return { ok: true, checkpoint: cp, value: value };
      });
    });
  }

  /* the stored copy against the hashes it was saved with */
  function load(id) {
    return getRec(id).then(function (rec) {
      if (!rec) return { ok: false, reason: "no such backup" };
      var parsed;
      try { parsed = JSON.parse(rec.text); } catch (e) { return { ok: false, reason: "the saved copy does not parse", rec: rec }; }
      return digest(parsed).then(function (d) {
        var why = differs({ counts: rec.counts, hashes: rec.hashes }, d);
        return why ? { ok: false, reason: why, rec: rec } : { ok: true, rec: rec, parsed: parsed };
      });
    });
  }
  function verify(id) { return load(id).then(function (r) { return r.ok ? { ok: true } : { ok: false, reason: r.reason }; }); }

  function fileName(rec) {
    var d = new Date(rec.at), p = function (n) { return ("0" + n).slice(-2); };
    return "kurenai-os-checkpoint-" + d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes()) + ".json";
  }
  function download(id) {
    return load(id).then(function (r) {
      if (!r.ok) throw new Error("This backup did not verify: " + r.reason);
      var blob = new Blob([r.rec.text], { type: "application/json" });
      if (KOS.inkExport && KOS.inkExport.deliver) return KOS.inkExport.deliver(blob, fileName(r.rec));
      var url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = fileName(r.rec); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    });
  }

  function restore(id) {
    return load(id).then(function (r) {
      if (!r.ok) throw new Error("This backup did not verify, so nothing was restored: " + r.reason);
      return new Promise(function (res, rej) {
        KOS.store.importFull(new Blob([r.rec.text], { type: "application/json" }), function (err, report) {
          err ? rej(err) : res(report || {});
        });
      });
    });
  }

  KOS.backup = {
    DB: DB, KEEP: KEEP, PARTS: PARTS.slice(),
    available: available,
    checkpoint: checkpoint,
    withCheckpoint: withCheckpoint,
    list: allMeta,
    verify: verify,
    download: download,
    restore: restore,
    digest: digest,
    canon: canon,
    sha256: sha256,
    _seam: seam,
    _raw: { get: getRec, put: putRec }
  };
})();
