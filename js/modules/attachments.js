/* Kurenai OS — modules/attachments.js
   Document attachments per topic (FR-2.5): upload, store, view, and annotate
   with a notes field.

   Storage is IndexedDB ("kurenai-os-files"), NOT localStorage — file blobs
   would blow straight through localStorage's size ceiling and its API is
   synchronous. Metadata + blob live together in one object store indexed by
   [subject, ref].

   SCOPE (explicit): "annotate" = a notes field attached to each document.
   Inline markup/highlighting on the file itself is a much larger feature and
   was deliberately scoped out — see PROGRESS.md.                            */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var DB_NAME = "kurenai-os-files" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), STORE = "files";
  var MAX_BYTES = 25 * 1024 * 1024;   // 25 MB per file — keep the DB sane
  var db = null;

  function available() { return !!window.indexedDB; }

  /* Build 4a — cloud plumbing. Identity generation rides mediadb's shared
     UUID helper; file deletions queue a tombstone in the media kv store so
     cloud sync can propagate them; local mutations nudge the sync engine.
     All of it is best-effort and inert when cloud sync is absent. */
  function genId() {
    return (window.KOS && KOS.mediadb && KOS.mediadb.genSyncId)
      ? KOS.mediadb.genSyncId()
      : Date.now().toString(16) + "-" + Math.random().toString(16).slice(2);
  }
  var FILE_TOMBSTONE_KEY = "cloudsync.filesPendingDeletes", FILE_TOMBSTONE_CAP = 500;
  function recordFileTombstone(rec, cb) {
    if (!rec || !rec.fileId || !window.KOS || !KOS.mediadb || !KOS.mediadb.available()) { cb && cb(null); return; }
    KOS.mediadb.getKV(FILE_TOMBSTONE_KEY, function (err, q) {
      if (err) { cb && cb(null); return; }
      q = Array.isArray(q) ? q : [];
      /* name rides along so the sync engine can also remove the uploaded
         binary at <uid>/<fileId>/<safeName> when it pushes the tombstone */
      q.push({ fileId: rec.fileId, name: rec.name || null, ts: Date.now() });
      if (q.length > FILE_TOMBSTONE_CAP) q = q.slice(q.length - FILE_TOMBSTONE_CAP);
      KOS.mediadb.setKV(FILE_TOMBSTONE_KEY, q, function () { cb && cb(null); });
    });
  }
  function noteCloud() {
    if (window.KOS && KOS.cloudsync && KOS.cloudsync.noteChange) KOS.cloudsync.noteChange("files");
  }

  function open(cb) {
    if (!available()) { cb(new Error("IndexedDB unavailable")); return; }
    if (db) { cb(null, db); return; }
    var rq = window.indexedDB.open(DB_NAME, 3);
    rq.onupgradeneeded = function (e) {
      var d = e.target.result, os;
      if (!d.objectStoreNames.contains(STORE)) {
        os = d.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        os.createIndex("topic", ["subject", "ref"], { unique: false });
      } else {
        os = e.target.transaction.objectStore(STORE);
      }
      /* v2 (Build 4a — cloud sync): fileId is the device-independent
         identity a kos_files row keys on; updatedAt drives per-record
         last-write-wins. Backfilled for pre-v2 rows. */
      if (!os.indexNames.contains("fileId")) {
        os.createIndex("fileId", "fileId", { unique: false });
      }
      /* v3 (files plan R1, invariant 150): ONE FILE, MANY LINKS. `hash`
         (SHA-256 of the content) finds a file added twice; `linkKeys`
         (multiEntry) lists every place it is linked — the home topic or
         assignment it was added to, then every "Attach to…". */
      if (!os.indexNames.contains("hash")) os.createIndex("hash", "hash", { unique: false });
      if (!os.indexNames.contains("links")) os.createIndex("links", "linkKeys", { unique: false, multiEntry: true });
      if (e.oldVersion > 0 && e.oldVersion < 3) {
        var cur = os.openCursor();
        cur.onsuccess = function (ev) {
          var c = ev.target.result;
          if (!c) return;
          var v = c.value;
          if (!v.fileId) {
            v.fileId = genId();
            v.updatedAt = v.updatedAt || v.added || Date.now();
          }
          v.linkKeys = keysOf(v);
          c.update(v);
          c.continue();
        };
      }
    };
    rq.onsuccess = function () { db = rq.result; cb(null, db); };
    rq.onerror = function () { cb(rq.error || new Error("Could not open the file store")); };
  }

  /* ---------------- links (files plan §3, invariant 150) ----------------
     A link is {kind, id}: topic ("sid:ref"), assignment, exam (an
     assessment), event, goal, paper ("<paper>:<sitting>"). The record's
     subject/ref is its HOME link (the place it was first added, read by
     the older readers); `links` holds the rest. */
  var LINK_KINDS = ["topic", "assignment", "exam", "event", "goal", "paper"];
  function homeLink(rec) {
    if (!rec || !rec.ref || rec.ref === "_") return null;
    var m = /^assignment:(.+)$/.exec(rec.ref);
    if (m) return { kind: "assignment", id: m[1] };
    if (rec.subject && rec.subject !== "_") return { kind: "topic", id: rec.subject + ":" + rec.ref };
    return null;
  }
  function cleanLinks(list) {
    var out = [], seen = {};
    (Array.isArray(list) ? list : []).forEach(function (l) {
      if (!l || LINK_KINDS.indexOf(l.kind) < 0 || l.id == null || l.id === "") return;
      var k = l.kind + ":" + String(l.id).slice(0, 120);
      if (seen[k]) return;
      seen[k] = true;
      out.push({ kind: l.kind, id: String(l.id).slice(0, 120) });
    });
    return out.slice(0, 60);
  }
  function linksOf(rec) {
    var h = homeLink(rec), all = (h ? [h] : []).concat(rec && rec.links || []);
    return cleanLinks(all);
  }
  function keysOf(rec) { return linksOf(rec).map(function (l) { return l.kind + ":" + l.id; }); }
  /* kind only ever moves UP, by this order (files plan §3, adjusted) */
  var KIND_ORDER = ["other", "photo", "handout", "notes", "worksheet", "scheme", "paper"];
  function promote(cur, next) {
    var a = KIND_ORDER.indexOf(cur), b = KIND_ORDER.indexOf(next);
    return b > a ? next : (a >= 0 ? cur : (b >= 0 ? next : "other"));
  }
  function guessKind(name, mime) {
    var n = String(name || "").toLowerCase();
    if (/\b(qp|question paper)\b/.test(n)) return "paper";
    if (/\b(ms|mark scheme)\b/.test(n)) return "scheme";
    if (/worksheet|homework|exercise/.test(n)) return "worksheet";
    if (/notes?\b|revision|summary/.test(n)) return "notes";
    if (/^image\//.test(mime || "")) return "photo";
    if (/handout|slides?|lesson|pdf$/.test(n) || mime === "application/pdf") return "handout";
    return "other";
  }
  /* SHA-256 of a blob, hex; null where the browser has no WebCrypto */
  function hashOf(blob, cb) {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle || !blob || typeof blob.arrayBuffer !== "function") { cb(null); return; }
    blob.arrayBuffer().then(function (buf) { return subtle.digest("SHA-256", buf); }).then(function (h) {
      var b = new Uint8Array(h), s = "";
      for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? "0" : "") + b[i].toString(16);
      cb(s);
    }, function () { cb(null); });
  }
  function notifyFiles() {
    try { window.dispatchEvent(new window.CustomEvent("kos-files")); } catch (e) { /* old engine */ }
  }
  function tx(mode, cb) {
    open(function (err, d) {
      if (err) { cb(err); return; }
      cb(null, d.transaction(STORE, mode).objectStore(STORE));
    });
  }

  /* add(sid, ref, file, cb, opts) — cb(err, id, {linked, matched})
     ONE COPY (invariant 150): a file whose SHA-256 is already stored is
     linked again, not stored again; its name and kind are kept, the new
     filename joins `aliases`, and `kind` only moves up. opts: {kind,
     origin, links, local} */
  function add(sid, ref, file, cb, opts) {
    opts = opts || {};
    if (file.size > MAX_BYTES) { cb(new Error("Over the 25 MB per-file limit — link it as a resource instead")); return; }
    hashOf(file, function (hash) {
      var want = cleanLinks((homeLink({ subject: sid, ref: ref }) ? [homeLink({ subject: sid, ref: ref })] : []).concat(opts.links || []));
      function fresh() {
        tx("readwrite", function (err, os) {
          if (err) { cb(err); return; }
          var rec = {
            subject: sid, ref: ref, name: file.name || "file",
            mime: file.type || "application/octet-stream",
            size: file.size, blob: file, note: "", added: Date.now(),
            fileId: genId(), updatedAt: Date.now(),
            hash: hash, kind: opts.kind || guessKind(file.name, file.type), aliases: [],
            links: cleanLinks(opts.links || []), origin: opts.origin || null
          };
          if (opts.local) rec.local = true;
          rec.linkKeys = keysOf(rec);
          var rq = os.add(rec);
          rq.onsuccess = function () { noteCloud(); notifyFiles(); cb(null, rq.result, { linked: false }); };
          rq.onerror = function () { cb(rq.error); };
        });
      }
      if (!hash) { fresh(); return; }
      tx("readwrite", function (err, os) {
        if (err) { cb(err); return; }
        var q = os.index("hash").get(window.IDBKeyRange.only(hash));
        q.onsuccess = function () {
          var rec = q.result;
          if (!rec) { fresh(); return; }
          var have = keysOf(rec), added = want.filter(function (l) { return have.indexOf(l.kind + ":" + l.id) < 0; });
          var nm = file.name || "";
          if (nm && nm !== rec.name && (rec.aliases || []).indexOf(nm) < 0) rec.aliases = (rec.aliases || []).concat([nm]).slice(-20);
          if (opts.kind) rec.kind = promote(rec.kind || "other", opts.kind);
          if (!rec.blob && file) { rec.blob = file; rec.evicted = false; }
          if (!homeLink(rec) && added.length && added[0].kind === "topic") {
            var i = added[0].id.indexOf(":");
            rec.subject = added[0].id.slice(0, i); rec.ref = added[0].id.slice(i + 1);
            added = added.slice(1);
          } else if (!homeLink(rec) && added.length && added[0].kind === "assignment") {
            rec.subject = sid; rec.ref = "assignment:" + added[0].id; added = added.slice(1);
          }
          rec.links = cleanLinks((rec.links || []).concat(added));
          rec.linkKeys = keysOf(rec);
          rec.updatedAt = Date.now();
          var p = os.put(rec);
          p.onsuccess = function () { noteCloud(); notifyFiles(); cb(null, rec.id, { linked: true, matched: true, fileId: rec.fileId }); };
          p.onerror = function () { cb(p.error); };
        };
        q.onerror = function () { fresh(); };
      });
    });
  }
  /* a patch to the file's own record: links, kind (only up), refs, note */
  function updateFile(fileId, fn, cb) {
    getByFileId(fileId, function (err, rec) {
      if (err || !rec) { cb && cb(err || new Error("That file is no longer in the store.")); return; }
      tx("readwrite", function (e2, os) {
        if (e2) { cb && cb(e2); return; }
        fn(rec);
        rec.links = cleanLinks(rec.links);
        rec.linkKeys = keysOf(rec);
        rec.updatedAt = Date.now();
        var p = os.put(rec);
        p.onsuccess = function () { noteCloud(); notifyFiles(); cb && cb(null, rec); };
        p.onerror = function () { cb && cb(p.error); };
      });
    });
  }
  function addLink(fileId, link, cb) {
    updateFile(fileId, function (rec) {
      if (!homeLink(rec) && link.kind === "topic") { var i = link.id.indexOf(":"); rec.subject = link.id.slice(0, i); rec.ref = link.id.slice(i + 1); return; }
      rec.links = (rec.links || []).concat([link]);
    }, cb);
  }
  /* removing a link never deletes the file (invariant 150) */
  function removeLink(fileId, link, cb) {
    updateFile(fileId, function (rec) {
      var h = homeLink(rec);
      if (h && h.kind === link.kind && h.id === String(link.id)) {
        var next = (rec.links || []).filter(function (l) { return l.kind === "topic" || l.kind === "assignment"; })[0];
        if (next && next.kind === "topic") { var i = next.id.indexOf(":"); rec.subject = next.id.slice(0, i); rec.ref = next.id.slice(i + 1); }
        else if (next) { rec.ref = "assignment:" + next.id; }
        else { rec.subject = "_"; rec.ref = "_"; }
        if (next) rec.links = rec.links.filter(function (l) { return l !== next; });
        return;
      }
      rec.links = (rec.links || []).filter(function (l) { return !(l.kind === link.kind && l.id === String(link.id)); });
    }, cb);
  }
  function setKind(fileId, kind, cb) {
    if (KIND_ORDER.indexOf(kind) < 0) { cb && cb(new Error("Unknown kind")); return; }
    /* a hand-picked kind may go down too: only a MATCH never demotes */
    updateFile(fileId, function (rec) { rec.kind = kind; }, cb);
  }
  /* "Free up space" (files plan §7, adjusted): the local BINARY goes; the
     record, its text index and its ink stay. Only for a file safe in the
     cloud — the caller checks that it was uploaded. */
  function evict(fileId, cb) {
    getByFileId(fileId, function (err, rec) {
      if (err || !rec) { cb && cb(err || new Error("gone")); return; }
      tx("readwrite", function (e2, os) {
        if (e2) { cb && cb(e2); return; }
        rec.blob = null; rec.evicted = true;
        var p = os.put(rec);
        p.onsuccess = function () { notifyFiles(); cb && cb(null); };
        p.onerror = function () { cb && cb(p.error); };
      });
    });
  }
  /* a topic's (or an assignment's) files: those added there, and those
     linked there since (invariant 150) */
  function list(sid, ref, cb) {
    var key = /^assignment:/.test(ref) ? ref : "topic:" + sid + ":" + ref;
    tx("readonly", function (err, os) {
      if (err) { cb(err, []); return; }
      var rq = os.index("topic").getAll(window.IDBKeyRange.only([sid, ref]));
      rq.onsuccess = function () {
        var rows = rq.result || [], seen = {};
        rows.forEach(function (r) { seen[r.id] = true; });
        var lq = os.index("links").getAll(window.IDBKeyRange.only(key));
        lq.onsuccess = function () {
          (lq.result || []).forEach(function (r) { if (!seen[r.id]) { seen[r.id] = true; rows.push(r); } });
          cb(null, rows);
        };
        lq.onerror = function () { cb(null, rows); };
      };
      rq.onerror = function () { cb(rq.error, []); };
    });
  }
  function setNote(id, note, cb) {
    tx("readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var rq = os.get(id);
      rq.onsuccess = function () {
        var rec = rq.result;
        if (!rec) { cb && cb(new Error("gone")); return; }
        rec.note = note;
        rec.updatedAt = Date.now();
        var p = os.put(rec);
        p.onsuccess = function () { noteCloud(); cb && cb(null); };
        p.onerror = function () { cb && cb(p.error); };
      };
      rq.onerror = function () { cb && cb(rq.error); };
    });
  }
  /* the S6–S9 → M6–M9 Mechanics rename (KOS.store.renamedRef): a file
     filed under an old ref moves to the new one, restamped so its
     metadata syncs. Idempotent; run once per boot (and harmless after a
     pull from a device that has not updated yet). cb(err, moved) */
  function renameRefs(cb) {
    if (!available() || !KOS.store.renamedRef) { cb && cb(null, 0); return; }
    tx("readwrite", function (err, os) {
      if (err) { cb && cb(err, 0); return; }
      var moved = 0, cur = os.openCursor();
      cur.onsuccess = function (ev) {
        var c = ev.target.result;
        if (!c) { if (moved) noteCloud(); cb && cb(null, moved); return; }
        var rec = c.value, to = KOS.store.renamedRef(rec.subject, rec.ref), hit = to != null;
        if (hit) rec.ref = to;
        /* its other topic links follow too, and the link index with them */
        (rec.links || []).forEach(function (l) {
          if (l.kind !== "topic") return;
          var i = l.id.indexOf(":"), t2 = KOS.store.renamedRef(l.id.slice(0, i), l.id.slice(i + 1));
          if (t2 != null) { l.id = l.id.slice(0, i) + ":" + t2; hit = true; }
        });
        if (hit) { rec.links = cleanLinks(rec.links); rec.linkKeys = keysOf(rec); rec.updatedAt = Date.now(); c.update(rec); moved++; }
        c.continue();
      };
      cur.onerror = function () { cb && cb(cur.error, moved); };
    });
  }
  function get(id, cb) {
    tx("readonly", function (err, os) {
      if (err) { cb(err, null); return; }
      var rq = os.get(id);
      rq.onsuccess = function () { cb(null, rq.result || null); };
      rq.onerror = function () { cb(rq.error, null); };
    });
  }
  /* rename keeps the record's identity (id AND fileId) — a rename must not
     read as a delete-plus-add to cloud sync or to the backup */
  function rename(id, name, cb) {
    name = String(name || "").trim();
    if (!name) { cb && cb(new Error("A file needs a name.")); return; }
    tx("readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var rq = os.get(id);
      rq.onsuccess = function () {
        var rec = rq.result;
        if (!rec) { cb && cb(new Error("That file is no longer in the store.")); return; }
        rec.name = name;
        rec.updatedAt = Date.now();
        var p = os.put(rec);
        p.onsuccess = function () { noteCloud(); cb && cb(null, rec); };
        p.onerror = function () { cb && cb(p.error); };
      };
      rq.onerror = function () { cb && cb(rq.error); };
    });
  }
  /* replace swaps the binary but preserves id, fileId, topic and NOTES —
     the note is about the document, not about that particular upload */
  function replace(id, file, cb) {
    if (file.size > MAX_BYTES) { cb && cb(new Error("Over the 25 MB per-file limit — link it as a resource instead")); return; }
    tx("readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var rq = os.get(id);
      rq.onsuccess = function () {
        var rec = rq.result;
        if (!rec) { cb && cb(new Error("That file is no longer in the store.")); return; }
        rec.blob = file;
        rec.mime = file.type || "application/octet-stream";
        rec.size = file.size;
        rec.replacedAt = Date.now();
        rec.updatedAt = Date.now();
        rec.evicted = false;
        rec.hash = null;
        var p = os.put(rec);
        p.onsuccess = function () {
          noteCloud(); notifyFiles();
          /* the new content's hash, written after: a replace is never held up */
          hashOf(file, function (h) { if (h) updateFile(rec.fileId, function (r) { r.hash = h; }); });
          cb && cb(null, rec);
        };
        p.onerror = function () { cb && cb(p.error); };
      };
      rq.onerror = function () { cb && cb(rq.error); };
    });
  }
  function remove(id, cb, opts) {
    tx("readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var gq = os.get(id);
      gq.onsuccess = function () {
        var victim = gq.result || null;
        var rq = os.delete(id);
        rq.onsuccess = function () {
          notifyFiles();
          if (victim && !(opts && opts.skipTombstone)) {
            recordFileTombstone(victim, function () { noteCloud(); cb && cb(null); });
          } else {
            cb && cb(null);
          }
        };
        rq.onerror = function () { cb && cb(rq.error); };
      };
      gq.onerror = function () { cb && cb(gq.error); };
    });
  }

  /* ---------------- bulk export / import (R3 full-coverage backup) ------- */
  function blobToBase64(blob, cb) {
    /* arrayBuffer() works on both browser Blobs and Node.js Blobs (the latter
       appears when fake-indexeddb structuredClone-s a stored File in tests).
       Fall back to FileReader for environments that lack the Promise API. */
    var mime = (blob && blob.type) || "application/octet-stream";
    /* Fail FAST on anything that is not encodable. Before this guard a record
       holding a non-Blob simply never called back, and one such record hung
       the entire backup export with no error to show for it. */
    var encodable = blob && (typeof blob.arrayBuffer === "function" ||
      (typeof Blob !== "undefined" && blob instanceof Blob));
    if (!encodable) { cb(new Error("Attachment content is not readable")); return; }
    if (blob && typeof blob.arrayBuffer === "function") {
      blob.arrayBuffer().then(function (buf) {
        var bytes = new Uint8Array(buf), binary = "";
        for (var i = 0; i < bytes.length; i++) { binary += String.fromCharCode(bytes[i]); }
        cb(null, "data:" + mime + ";base64," + btoa(binary));
      }).catch(function (e) { cb(e); });
    } else if (typeof FileReader !== "undefined") {
      var reader = new FileReader();
      reader.onload = function () { cb(null, reader.result); };
      reader.onerror = function () { cb(reader.error || new Error("Could not encode attachment")); };
      reader.readAsDataURL(blob);
    } else {
      cb(new Error("Cannot encode attachment: no arrayBuffer or FileReader API"));
    }
  }

  function base64ToBlob(dataUrl) {
    var comma = dataUrl.indexOf(",");
    if (comma === -1) throw new Error("Invalid data URL");
    var meta = dataUrl.slice(0, comma);
    var mimeMatch = meta.match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid data URL MIME");
    var mime = mimeMatch[1];
    var bstr = atob(dataUrl.slice(comma + 1));
    var u8 = new Uint8Array(bstr.length);
    for (var i = 0; i < bstr.length; i++) { u8[i] = bstr.charCodeAt(i); }
    return new Blob([u8], { type: mime });
  }

  function exportAll(cb) {
    tx("readonly", function (err, os) {
      if (err) { cb(err); return; }
      var rq = os.getAll();
      rq.onsuccess = function () {
        var items = rq.result || [];
        if (!items.length) { cb(null, []); return; }
        var result = new Array(items.length);
        var pending = items.length, fired = false;
        items.forEach(function (rec, i) {
          function fill(b64) {
            result[i] = { id: rec.id, subject: rec.subject, ref: rec.ref,
              name: rec.name, mime: rec.mime, size: rec.size,
              note: rec.note || "", added: rec.added, blobBase64: b64,
              fileId: rec.fileId || null,
              updatedAt: rec.updatedAt || rec.added || null,
              hash: rec.hash || null, kind: rec.kind || null, aliases: rec.aliases || [], links: rec.links || [],
              origin: rec.origin || null, local: !!rec.local, evicted: !!rec.evicted };
            if (!--pending) { fired = true; cb(null, result); }
          }
          /* a cloud-metadata-only record has no local blob yet (Build 4a) —
             it still rides the backup as metadata */
          if (!rec.blob) { fill(null); return; }
          blobToBase64(rec.blob, function (e, b64) {
            if (fired) return;
            if (e) { fired = true; cb(e); return; }
            fill(b64);
          });
        });
      };
      rq.onerror = function () { cb(rq.error); };
    });
  }

  function importAll(items, cb) {
    tx("readwrite", function (err, os) {
      if (err) { cb(err); return; }
      var clearRq = os.clear();
      clearRq.onsuccess = function () {
        if (!items.length) { cb(null); return; }
        var pending = items.length, fired = false;
        items.forEach(function (item) {
          var blob = null;
          if (item.blobBase64) {
            try { blob = base64ToBlob(item.blobBase64); }
            catch (e) { if (!fired) { fired = true; cb(new Error("Could not decode " + (item.name || "attachment"))); } return; }
          }
          var rec = { id: item.id, subject: item.subject, ref: item.ref,
            name: item.name, mime: item.mime, size: item.size,
            blob: blob, note: item.note || "", added: item.added,
            fileId: item.fileId || genId(),
            updatedAt: item.updatedAt || item.added || Date.now(),
            hash: item.hash || null, kind: item.kind || guessKind(item.name, item.mime), aliases: Array.isArray(item.aliases) ? item.aliases : [],
            links: cleanLinks(item.links), origin: item.origin || null };
          if (item.local) rec.local = true;
          if (!blob && item.evicted) rec.evicted = true;
          rec.linkKeys = keysOf(rec);
          var putRq = os.put(rec);
          putRq.onsuccess = function () { if (!fired && !--pending) { fired = true; cb(null); } };
          putRq.onerror = function () { if (!fired) { fired = true; cb(putRq.error); } };
        });
      };
      clearRq.onerror = function () { cb(clearRq.error); };
    });
  }

  /* ---------------- cloud-sync helpers (Build 4a) ----------------
     Metadata in, metadata out — the sync engine never touches this store's
     transactions directly. Blobs move only through setBlob (explicit
     download) and getByFileId (explicit upload). */
  function listMeta(cb) {
    tx("readonly", function (err, os) {
      if (err) { cb(err, []); return; }
      var rq = os.getAll();
      rq.onsuccess = function () {
        cb(null, (rq.result || []).map(function (rec) {
          return { id: rec.id, fileId: rec.fileId || null, subject: rec.subject,
            ref: rec.ref, name: rec.name, mime: rec.mime, size: rec.size,
            note: rec.note || "", added: rec.added,
            updatedAt: rec.updatedAt || rec.added || null, hasBlob: !!rec.blob,
            hash: rec.hash || null, kind: rec.kind || guessKind(rec.name, rec.mime), aliases: rec.aliases || [],
            links: linksOf(rec), origin: rec.origin || null, local: !!rec.local, evicted: !!rec.evicted, replacedAt: rec.replacedAt || null };
        }));
      };
      rq.onerror = function () { cb(rq.error, []); };
    });
  }
  function getByFileId(fileId, cb) {
    tx("readonly", function (err, os) {
      if (err) { cb(err, null); return; }
      var rq = os.index("fileId").get(window.IDBKeyRange.only(fileId));
      rq.onsuccess = function () { cb(null, rq.result || null); };
      rq.onerror = function () { cb(rq.error, null); };
    });
  }
  /* upsert a remote metadata record by fileId. An existing record keeps its
     local blob; a new one lands blob-less ("cloud only" in the Files tab,
     with an explicit download action). Never notifies the sync engine —
     this IS the sync engine writing. */
  function putRemoteMeta(meta, cb) {
    getByFileId(meta.fileId, function (err, existing) {
      if (err) { cb && cb(err); return; }
      tx("readwrite", function (e2, os) {
        if (e2) { cb && cb(e2); return; }
        var rec = existing || { blob: null, added: meta.added || Date.now() };
        rec.fileId = meta.fileId;
        rec.subject = meta.subject;
        rec.ref = meta.ref;
        rec.name = meta.name;
        rec.mime = meta.mime || "application/octet-stream";
        rec.size = meta.size || 0;
        rec.note = meta.note || "";
        rec.updatedAt = meta.updatedAt || Date.now();
        /* the file layer's fields ride meta_json (files plan R1) */
        if (meta.kind) rec.kind = meta.kind;
        if (Array.isArray(meta.aliases)) rec.aliases = meta.aliases.slice(0, 20);
        if (Array.isArray(meta.links)) rec.links = cleanLinks(meta.links);
        if (meta.hash) rec.hash = meta.hash;
        if (meta.origin) rec.origin = meta.origin;
        rec.linkKeys = keysOf(rec);
        var rq = os.put(rec);
        rq.onsuccess = function () { rec.id = rec.id != null ? rec.id : rq.result; cb && cb(null, rec); };
        rq.onerror = function () { cb && cb(rq.error); };
      });
    });
  }
  function setBlob(fileId, blob, cb) {
    getByFileId(fileId, function (err, rec) {
      if (err || !rec) { cb && cb(err || new Error("No local record for that file.")); return; }
      tx("readwrite", function (e2, os) {
        if (e2) { cb && cb(e2); return; }
        rec.blob = blob;
        rec.evicted = false;
        if (blob && blob.size != null) rec.size = blob.size;
        var rq = os.put(rec);
        rq.onsuccess = function () { notifyFiles(); cb && cb(null, rec); };
        rq.onerror = function () { cb && cb(rq.error); };
      });
    });
  }

  /* ---------------- the Files tab ---------------- */
  function fmtSize(b) {
    return b > 1048576 ? (b / 1048576).toFixed(1) + " MB"
      : b > 1024 ? Math.round(b / 1024) + " KB" : b + " B";
  }
  function canInline(mime) {
    return mime.indexOf("image/") === 0 || mime === "application/pdf" || mime.indexOf("text/") === 0;
  }
  function inlineNote(mime) {
    if (canInline(mime)) return null;
    if (/word|officedocument|msword/.test(mime)) return "Word documents can't preview inside a browser — Open ↗ hands it to the app that can.";
    return "This format has no in-browser preview — Open ↗ opens or downloads it.";
  }
  var debounce = KOS.ui.debounce;
  /* ================= the Files tab (Build 6.3) =================
     A selectable file list on the left, one preview stage on the right.
     Selecting a file previews it; the stage owns fit/zoom/expand/collapse
     and the document's own notes sit beneath the preview, never beside it. */

  var FIT = { WIDTH: "width", PAGE: "page", ZOOM: "zoom" };
  var ZOOM_STEPS = [50, 75, 100, 125, 150, 200, 300, 400];

  function fmtDate(ts) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  function kindLabel(mime) {
    if (!mime) return "Unknown";
    if (mime === "application/pdf") return "PDF";
    if (mime.indexOf("image/") === 0) return mime.slice(6).toUpperCase();
    if (mime.indexOf("text/") === 0) return mime.slice(5).toUpperCase() + " text";
    if (/wordprocessingml|msword/.test(mime)) return "Word";
    if (/spreadsheetml|ms-excel/.test(mime)) return "Spreadsheet";
    if (/presentationml|ms-powerpoint/.test(mime)) return "Slides";
    if (/zip|compressed/.test(mime)) return "Archive";
    return mime;
  }
  /* A record can be unusable in two distinct ways and the UI must say which.
     Note the deliberate strictness: an UNKNOWN blob size (some environments
     hand back a structured clone without the accessor) is not the same as a
     size of zero, and must not be reported as damage. Only a real 0 — on the
     blob or on the stored metadata — means the content was lost. */
  /* Blob.text() is the happy path; fall back to FileReader for older engines
     and report failure rather than leaving an empty frame. */
  function readText(blob, cb) {
    if (blob && typeof blob.text === "function") {
      blob.text().then(function (t) { cb(null, t); }).catch(function (e) { cb(e); });
      return;
    }
    if (typeof FileReader !== "undefined" && blob instanceof Blob) {
      var r = new FileReader();
      r.onload = function () { cb(null, String(r.result)); };
      r.onerror = function () { cb(r.error || new Error("unreadable")); };
      r.readAsText(blob);
      return;
    }
    cb(new Error("no text API"));
  }
  function health(rec) {
    if (!rec.blob) return "cloud-only";                   // metadata synced, binary elsewhere
    if (rec.blob.size === 0 || rec.size === 0) return "damaged";
    return "ok";
  }

  /* the list badge: what a file is at a glance, in the design's words */
  function badge(mime) {
    if (!mime) return "FILE";
    if (mime === "application/pdf") return "PDF";
    if (mime.indexOf("image/") === 0) return "IMG";
    if (mime.indexOf("text/") === 0) return "TXT";
    if (/wordprocessingml|msword/.test(mime)) return "DOC";
    if (/spreadsheetml|ms-excel/.test(mime)) return "XLS";
    if (/presentationml|ms-powerpoint/.test(mime)) return "PPT";
    return "FILE";
  }

  /* Graphite (frame 8i): the file list on the left — Attach, one row per
     file, and why the inspector has folded — and one preview card on the
     right: the name with its actions, the fit/zoom bar, the preview, then
     the document's own notes beneath it. */
  function mountTab(panel, sid, ref) {
    var wrap = el("div", { class: "k-att", "data-ui": "attach.wrap" });
    panel.appendChild(wrap);

    if (!available()) {
      wrap.appendChild(el("div", { "data-ui": "attach.unavail" }, [
        KOS.ui.emptyState({ compact: true, title: "Attachments need IndexedDB",
          body: "This browser or context doesn't provide it. Use the subject's resources for links instead." })
      ]));
      return;
    }

    var items = [];
    var selectedId = null;
    var fit = FIT.WIDTH;
    var zoom = 100;
    var previewOpen = true;
    var objUrl = null;

    function releaseUrl() {
      if (objUrl) { URL.revokeObjectURL(objUrl); objUrl = null; }
    }
    function selected() {
      return items.find(function (x) { return x.id === selectedId; }) || null;
    }

    var fileIn = el("input", { type: "file", multiple: "", class: "sr-only", tabindex: "-1", "aria-hidden": "true", onchange: function () {
      var fs = [].slice.call(fileIn.files || []);
      fileIn.value = "";
      if (!fs.length) return;
      if (KOS.files) { KOS.files.add(fs, { link: { kind: "topic", id: sid + ":" + ref } }, function (err, res) { KOS.files.report(res); selectedId = null; render(); }); return; }
      add(sid, ref, fs[0], function (err, id) {
        if (err) KOS.ui.toast("Upload failed: " + err.message, true);
        else { KOS.ui.toast("Attached to " + ref + "."); selectedId = id; render(); }
      });
    } });
    var replaceIn = el("input", { type: "file", class: "sr-only", tabindex: "-1", "aria-hidden": "true", onchange: function () {
      var rec = selected();
      if (!replaceIn.files[0] || !rec) return;
      replace(rec.id, replaceIn.files[0], function (err) {
        if (err) KOS.ui.toast("Replace failed: " + err.message, true);
        else { KOS.ui.toast("File replaced — notes and links kept."); render(); }
        replaceIn.value = "";
      });
    } });
    wrap.appendChild(fileIn);
    wrap.appendChild(replaceIn);

    var listEl = el("div", { class: "k-att-files", "data-ui": "attach.files", role: "listbox", "aria-label": "Attached files" });
    var side = el("div", { class: "k-att-side" }, [
      el("button", { type: "button", class: "k-btn k-att-add", "data-intent": "primary", "data-ui": "attach.add", text: "⇪ Attach files…", onclick: function () { fileIn.click(); } }),
      KOS.fileScan ? el("button", { type: "button", class: "k-btn k-att-add", "data-ui": "attach.scan", text: "◫ Scan pages", onclick: function () {
        KOS.fileScan.open({ onDone: function (file) { KOS.files.add([file], { link: { kind: "topic", id: sid + ":" + ref }, kind: "worksheet" }, function (err, res) { KOS.files.report(res); render(); }); } });
      } }) : null,
      listEl,
      el("p", { class: "k-att-lead", text: "Drop files here, or paste a picture. Stored in this browser, in the full backup, and in your private cloud when signed in. A file already in Files is linked, not stored twice." })
    ].filter(Boolean));
    /* drop anywhere and paste (files plan §6) */
    if (KOS.files) {
      KOS.files.dropTarget(wrap, { kind: "topic", id: sid + ":" + ref }, function () { selectedId = null; render(); });
      var onPaste = function (e) {
        if (!wrap.isConnected) { document.removeEventListener("paste", onPaste); return; }
        var t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA)$/.test(t.tagName))) return;
        var fs = [].slice.call((e.clipboardData && e.clipboardData.files) || []);
        if (!fs.length) return;
        e.preventDefault();
        KOS.files.add(fs.map(function (f) { return KOS.files.named(f); }), { link: { kind: "topic", id: sid + ":" + ref } }, function (err, res) { KOS.files.report(res); render(); });
      };
      document.addEventListener("paste", onPaste);
    }
    var stage = el("section", { class: "k-card k-att-stage", "data-ui": "attach.stage", "aria-label": "Document preview" });
    wrap.appendChild(side);
    wrap.appendChild(stage);

    /* ---- the file list ---- */
    function renderList() {
      listEl.innerHTML = "";
      if (!items.length) {
        listEl.appendChild(el("p", { class: "k-att-empty", "data-ui": "attach.empty", text: "Nothing attached to this topic yet." }));
        return;
      }
      items.forEach(function (rec) {
        var st = health(rec);
        var on = rec.id === selectedId;
        var node = el("button", { type: "button", class: "k-att-file", "data-ui": "attach.file", role: "option", "aria-selected": String(on),
          "data-state": [on ? "selected" : null, st !== "ok" ? "degraded" : null].filter(Boolean).join(" ") || null,
          onclick: function () { selectedId = rec.id; previewOpen = true; renderList(); renderStage(); } }, [
          el("span", { class: "k-att-badge", "data-kind": badge(rec.mime), "aria-hidden": "true", text: badge(rec.mime) }),
          el("span", { class: "k-att-file-txt" }, [
            el("span", { class: "k-att-name", text: rec.name, title: rec.name }),
            el("span", { class: "k-att-file-meta", text: fmtSize(rec.size) + " · " + shortDate(rec.added) })
          ]),
          st === "cloud-only" ? el("span", { class: "k-chip", "data-tone": "muted", title: "Metadata synced; the file itself is on another device", text: "☁" })
            : st === "damaged" ? el("span", { class: "k-chip", "data-tone": "red", title: "Stored but empty", text: "!" }) : null
        ].filter(Boolean));
        listEl.appendChild(node);
      });
    }
    function shortDate(ts) {
      return ts ? new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";
    }
    function act(text, fn, attrs) {
      return el("button", Object.assign({ type: "button", class: "k-att-act", text: text, onclick: fn }, attrs || {}));
    }

    /* ---- the preview card ---- */
    function renderStage() {
      releaseUrl();
      stage.innerHTML = "";
      var rec = selected();
      if (!rec) {
        stage.appendChild(el("div", { "data-ui": "attach.stage-empty" }, [
          KOS.ui.emptyState({ compact: true, mark: "紙", body: items.length ? "Select a file to preview it." : "Attach a worksheet, mark scheme or scan and it previews here." })
        ]));
        return;
      }
      var st = health(rec);
      var inlineable = st === "ok" && canInline(rec.mime);

      var actions = el("div", { class: "k-att-actions", "data-ui": "attach.actions" }, [
        act("✎ Rename", function () { renameFlow(rec); }),
        act("⇄ Replace", function () { replaceIn.click(); }, { title: "Swap the file, keep the notes and links" }),
        KOS.filesUI ? act("⊕ Attach to…", function () { KOS.filesUI.attachTo(rec.fileId, render); }, { "data-ui": "attach.attach-to", title: "Link it to another topic, assignment or assessment" }) : null,
        act("✕ Remove", function () { removeFlow(rec); }, { "data-intent": "danger" })
      ].filter(Boolean));
      stage.appendChild(el("div", { class: "k-att-head" }, [
        el("h2", { class: "k-att-title", "data-ui": "attach.stage-name", text: rec.name, title: rec.name }),
        actions
      ]));
      stage.appendChild(el("dl", { class: "k-att-meta", "data-ui": "attach.meta" }, [
        metaPair("Type", kindLabel(rec.mime)),
        metaPair("Size", fmtSize(rec.size)),
        metaPair("Added", fmtDate(rec.added)),
        metaPair("Topic", subjectLabel(rec.subject) + " · " + rec.ref)
      ].reduce(function (a, b) { return a.concat(b); }, [])));

      /* the control bar: how the document is laid out, then where it goes */
      var bar = el("div", { class: "k-att-bar", "data-ui": "attach.bar" });
      if (inlineable) {
        bar.appendChild(el("div", { class: "k-att-group", role: "group", "aria-label": "Fit" }, [
          fitBtn("Fit width", FIT.WIDTH),
          fitBtn("Fit page", FIT.PAGE)
        ]));
        bar.appendChild(el("div", { class: "k-att-group", role: "group", "aria-label": "Zoom" }, [
          act("−", function () { stepZoom(-1); }, { "aria-label": "Zoom out" }),
          el("span", { class: "k-mono k-att-zoom", "data-ui": "attach.zoom", text: zoom + "%" }),
          act("+", function () { stepZoom(1); }, { "aria-label": "Zoom in" })
        ]));
        bar.appendChild(act(previewOpen ? "▾ Collapse" : "▸ Expand", function () { previewOpen = !previewOpen; renderStage(); },
          { title: previewOpen ? "Hide the preview" : "Show the preview" }));
        bar.appendChild(act("⤢ Full screen", function () { if (rec.mime === "application/pdf" && KOS.files) KOS.files.openRec(rec); else openFullscreen(rec); }));
        if ((rec.mime === "application/pdf" || /^image\//.test(rec.mime)) && KOS.pdfView) bar.appendChild(act("✎ Write on it", function () { if (KOS.files) KOS.files.openRec(rec); else openViewer(rec); }, { "data-ui": "attach.write", title: "Open in the viewer with ink; the file itself never changes" }));
      }
      bar.appendChild(el("span", { class: "k-spacer" }));
      if (st === "ok") {
        bar.appendChild(act("↗ Open", function () { openExternally(rec); }, { title: "Open in a new tab" }));
        bar.appendChild(act("⤓ Download", function () { download(rec); }));
      }
      if (st === "cloud-only") bar.appendChild(cloudDownloadBtn(rec));
      stage.appendChild(bar);

      if (!previewOpen) {
        stage.appendChild(el("p", { class: "k-att-collapsed", "data-state": "att-collapsed", text: "Preview hidden — Expand to bring it back." }));
      } else if (st === "cloud-only") {
        stage.appendChild(unusableCard("☁", "On another device",
          "The metadata for this file synced, but its content hasn't been downloaded here yet."));
      } else if (st === "damaged") {
        stage.appendChild(unusableCard("!", "This file is empty",
          "The record is stored but its content is 0 bytes — the upload was interrupted or the data was lost. Replace it with a fresh copy, or remove it."));
      } else if (!canInline(rec.mime)) {
        stage.appendChild(unusableCard(badge(rec.mime), kindLabel(rec.mime) + " — no in-browser preview",
          inlineNote(rec.mime), [
            el("button", { type: "button", class: "k-btn", text: "↗ Open", onclick: function () { openExternally(rec); } }),
            el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "⤓ Download", onclick: function () { download(rec); } })
          ]));
      } else {
        stage.appendChild(previewNode(rec, false));
      }

      /* notes, always BENEATH the preview */
      var note = el("textarea", { class: "k-input k-att-note", "data-ui": "ui.note-area", rows: 3, "aria-label": "Notes on " + rec.name,
        placeholder: "Notes on this document — page refs, what to revisit, corrections…",
        oninput: debounce(function () { setNote(rec.id, note.value); }, 400) });
      note.value = rec.note || "";
      stage.appendChild(el("div", { class: "k-att-notes", "data-ui": "attach.notes" }, [
        el("h3", { class: "k-kicker", text: "Document notes" }),
        note
      ]));

      function fitBtn(label, mode) {
        return act(label, function () { fit = mode; zoom = 100; renderStage(); }, { "aria-pressed": String(fit === mode) });
      }
    }

    function metaPair(k, v) {
      return [el("dt", { text: k }), el("dd", { text: v })];
    }
    function subjectLabel(s) {
      return (window.KOS_DATA && KOS_DATA[s] && KOS_DATA[s].name) || s || "—";
    }
    function stepZoom(dir) {
      var i = ZOOM_STEPS.indexOf(zoom);
      if (i === -1) { i = ZOOM_STEPS.indexOf(100); }
      i = Math.max(0, Math.min(ZOOM_STEPS.length - 1, i + dir));
      zoom = ZOOM_STEPS[i];
      fit = FIT.ZOOM;
      renderStage();
    }
    function unusableCard(glyph, title, body, actions) {
      return el("div", { class: "k-att-unusable", "data-ui": "attach.unusable" }, [
        el("span", { class: "k-att-badge", "aria-hidden": "true", text: glyph }),
        el("b", { text: title }),
        body ? el("p", { text: body }) : null,
        actions ? el("div", { class: "k-att-group", "data-ui": "lab.controls" }, actions) : null
      ].filter(Boolean));
    }

    /* the one place a preview node is built — used inline AND full screen */
    function previewNode(rec, full) {
      var url = URL.createObjectURL(rec.blob);
      if (!full) objUrl = url;
      var host = el("div", { class: "k-att-preview", "data-ui": "attach.preview", "data-fit": fit, "data-state": full ? "is-full" : null });

      if (rec.mime.indexOf("image/") === 0) {
        var img = el("img", { class: "k-att-img", "data-ui": "attach.img", src: url, alt: rec.name });
        if (fit === FIT.ZOOM) img.style.setProperty("--att-img-width", zoom + "%");
        img.addEventListener("error", function () {
          host.innerHTML = "";
          host.appendChild(unusableCard("!", "This image could not be decoded",
            "The stored data is corrupt or in a format this browser can't read. Replace it, or download it to inspect."));
        });
        host.appendChild(img);
      } else if (rec.mime === "application/pdf") {
        /* ONE VIEWER (invariant 152): a PDF previews as its first page,
           drawn by pdf.js; it opens in the app's viewer, never the
           browser's */
        var openBtn = el("button", { type: "button", class: "k-att-pdfcard", "data-ui": "attach.pdf", "aria-label": "Open " + rec.name + " in the viewer",
          onclick: function () { if (KOS.files) KOS.files.openRec(rec); else openViewer(rec); } }, [el("span", { class: "k-att-pdfpage" }), el("span", { class: "k-att-pdfcta", text: "Open in the viewer ›" })]);
        host.appendChild(openBtn);
        if (KOS.pdfView) KOS.pdfView.load(rec.blob).then(function (pdf) {
          return pdf.getPage(1).then(function (pg) {
            if (!openBtn.isConnected) { pdf.destroy(); return; }
            var v1 = pg.getViewport({ scale: 1 }), w = Math.min(900, openBtn.clientWidth || 600), vp = pg.getViewport({ scale: w / v1.width * Math.min(2, window.devicePixelRatio || 1) });
            var c = el("canvas", { class: "k-att-pdfcanvas", "aria-hidden": "true" });
            c.width = Math.round(vp.width); c.height = Math.round(vp.height);
            openBtn.querySelector(".k-att-pdfpage").appendChild(c);
            return pg.render({ canvasContext: c.getContext("2d"), viewport: vp, intent: "print" }).promise.then(function () {
              host.addEventListener("kos-release", function () { c.width = 0; c.height = 0; });
              pdf.destroy();
            });
          });
        }).catch(function () { /* the card still opens it */ });
      } else {
        var pre = el("pre", { class: "k-att-text" });
        if (fit === FIT.ZOOM) pre.style.setProperty("--att-zoom", String(zoom / 100));
        host.appendChild(pre);
        readText(rec.blob, function (err, t) {
          pre.textContent = err ? "This text file could not be read." : t.slice(0, 200000);
        });
      }
      if (full) {
        host.addEventListener("kos-release", function () { URL.revokeObjectURL(url); });
      }
      return host;
    }

    /* ---- the full-screen preview ---- */
    function openFullscreen(rec) {
      var overlay = el("div", { class: "k-att-fs", "data-ui": "attach.fs", role: "dialog", "aria-label": rec.name + " preview" });
      var node = previewNode(rec, true);
      function close() {
        document.removeEventListener("keydown", onKey, true);
        node.dispatchEvent(new window.CustomEvent("kos-release"));
        overlay.remove();
      }
      function onKey(e) { if (e.key === "Escape") { e.stopPropagation(); close(); } }
      document.addEventListener("keydown", onKey, true);
      overlay.appendChild(el("div", { class: "k-att-bar", "data-ui": "attach.fs-bar" }, [
        el("b", { class: "k-att-title", text: rec.name }),
        el("span", { class: "k-spacer" }),
        act("↗ Open", function () { openExternally(rec); }),
        canShare() ? act("⇪ Share", function () { shareFile(rec); }, { "data-ui": "attach.share" }) : null,
        act("⤓ Download", function () { download(rec); }),
        act("✕ Close", close)
      ].filter(Boolean)));
      overlay.appendChild(node);
      overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
      KOS.ui.openDialog(overlay);
      return overlay;
    }

    /* ---- external open / download ---- */
    function openExternally(rec) {
      var u = URL.createObjectURL(rec.blob);
      var w = window.open(u, "_blank");
      if (!w) {
        var a = el("a", { href: u, download: rec.name });
        document.body.appendChild(a); a.click(); a.remove();
      }
      setTimeout(function () { URL.revokeObjectURL(u); }, 30000);
    }
    function download(rec) {
      var u = URL.createObjectURL(rec.blob);
      var a = el("a", { href: u, download: rec.name });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 30000);
    }
    function cloudDownloadBtn(rec) {
      var b = act("⇣ Download from cloud", function () {
        if (!window.KOS || !KOS.cloudsync || !KOS.cloudsync.downloadFile) {
          KOS.ui.toast("Cloud sync isn't available here — this file's content lives on another device.", true);
          return;
        }
        b.disabled = true; b.textContent = "Downloading…";
        KOS.cloudsync.downloadFile(rec.fileId, function (err) {
          if (err) {
            b.disabled = false; b.textContent = "⇣ Download from cloud";
            KOS.ui.toast("Download failed: " + err.message, true);
          } else { KOS.ui.toast("File downloaded."); render(); }
        });
      });
      return b;
    }

    /* ---- rename / remove ---- */
    function renameFlow(rec) {
      var input = el("input", { type: "text", class: "k-input", "aria-label": "Filename",
        onkeydown: function (e) { if (e.key === "Enter") save(); } });
      input.value = rec.name;
      var overlay = el("div", { class: "k-dialog-overlay" });
      function close() { overlay.remove(); }
      function save() {
        var v = input.value.trim();
        if (!v) { KOS.ui.toast("A file needs a name.", true); return; }
        rename(rec.id, v, function (err) {
          if (err) { KOS.ui.toast("Rename failed: " + err.message, true); return; }
          close(); render();
        });
      }
      overlay.appendChild(el("div", { class: "k-dialog", "data-ui": "ui.dialog" }, [
        el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Rename file" })]),
        el("div", { class: "k-dialog-body" }, [input]),
        el("div", { class: "k-dialog-foot" }, [
          el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: close }),
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Save", onclick: save })
        ])
      ]));
      KOS.ui.openDialog(overlay);
      input.focus();
    }
    function removeFlow(rec) {
      if (KOS.files) { releaseUrl(); KOS.files.detach(rec, { kind: "topic", id: sid + ":" + ref }, function () { selectedId = null; render(); }); return; }
      KOS.ui.confirm({ title: "Delete file?", body: "Delete “" + rec.name + "” and its notes?", danger: true, confirm: "Delete" },
        function () {
          releaseUrl();
          remove(rec.id, function (err) {
            if (err) KOS.ui.toast("Delete failed: " + err.message, true);
            else { KOS.ui.toast("File deleted."); selectedId = null; render(); }
          });
        });
    }

    /* ---- the one read path ---- */
    function render() {
      list(sid, ref, function (err, rows) {
        if (err) {
          listEl.innerHTML = "";
          listEl.appendChild(el("p", { class: "k-att-empty", text: "Could not read the file store: " + err.message }));
          return;
        }
        items = (rows || []).slice().sort(function (a, b) { return b.added - a.added; });
        /* keep the selection across a reload when the record still exists */
        if (selectedId != null && !items.some(function (x) { return x.id === selectedId; })) selectedId = null;
        if (selectedId == null && items.length) selectedId = items[0].id;
        renderList();
        renderStage();
      });
    }
    render();
  }

  /* ONE VIEWER (files plan R0 and invariant 152, as far as R0 goes): any
     attachment opens here — a PDF in the app's own viewer with ink
     (`file:<fileId>:default`), anything else full screen — with Share
     (the share sheet on the iPad and the phone), Download and Open. */
  function shareFile(rec) {
    var f = null;
    try { f = new File([rec.blob], rec.name, { type: rec.mime || rec.blob.type }); } catch (e) { f = null; }
    if (f && navigator.canShare && navigator.canShare({ files: [f] }) && navigator.share) {
      navigator.share({ files: [f], title: rec.name }).catch(function (e) { if (e && e.name !== "AbortError") KOS.ui.toast("Sharing didn't work here — download it instead.", true); });
      return;
    }
    KOS.ui.toast("This browser can't share files — download it instead.");
  }
  function canShare() { return !!(navigator.share && navigator.canShare); }
  function saveCopy(rec) {
    var u = URL.createObjectURL(rec.blob), a = KOS.ui.el("a", { href: u, download: rec.name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 30000);
  }
  function openViewer(rec, opts) {
    opts = opts || {};
    if (!rec || !rec.blob || !rec.blob.size) { KOS.ui.toast(rec && rec.fileId ? "This file's content is on another device — download it from the topic's Files tab." : "This file is empty.", true); return; }
    var el = KOS.ui.el;
    if (rec.mime === "application/pdf" && KOS.pdfView && opts.ink !== false) {
      KOS.pdfView.open({ title: rec.name, kind: "file", fileId: rec.fileId || ("att" + rec.id), refs: rec.subject && rec.subject !== "_" && rec.ref && !/^asg:/.test(rec.ref) ? [rec.subject + ":" + rec.ref] : [],
        getBlob: function (cb) { cb(null, rec.blob); } });
      return;
    }
    var url = URL.createObjectURL(rec.blob);
    var overlay = el("div", { class: "k-att-fs", "data-ui": "attach.fs", role: "dialog", "aria-label": rec.name + " preview" });
    var node;
    if (/^image\//.test(rec.mime)) node = el("img", { class: "k-att-img", src: url, alt: rec.name });
    else if (rec.mime === "application/pdf") node = el("iframe", { class: "k-att-pdf", src: url + "#view=FitH", title: rec.name });
    else if (/^text\/|json|markdown/.test(rec.mime || "")) { node = el("pre", { class: "k-att-text" }); readText(rec.blob, function (err, t) { node.textContent = err ? "This text file could not be read." : t.slice(0, 200000); }); }
    else node = el("div", { class: "k-att-unusable" }, [el("b", { text: rec.name }), el("p", { text: "No in-app preview for this kind of file. Download it, or share it to an app that opens it." })]);
    function close() { URL.revokeObjectURL(url); document.removeEventListener("keydown", onKey, true); overlay.remove(); }
    function onKey(e) { if (e.key === "Escape") { e.stopPropagation(); close(); } }
    document.addEventListener("keydown", onKey, true);
    overlay.appendChild(el("div", { class: "k-att-bar", "data-ui": "attach.fs-bar" }, [
      el("b", { class: "k-att-title", text: rec.name }), el("span", { class: "k-spacer" }),
      canShare() ? el("button", { type: "button", class: "k-att-act", "data-ui": "attach.share", text: "⇪ Share", onclick: function () { shareFile(rec); } }) : null,
      el("button", { type: "button", class: "k-att-act", text: "⤓ Download", onclick: function () { saveCopy(rec); } }),
      el("button", { type: "button", class: "k-att-act", text: "✕ Close", onclick: close })
    ].filter(Boolean)));
    overlay.appendChild(el("div", { class: "k-att-preview", "data-state": "is-full" }, [node]));
    KOS.ui.openDialog(overlay);
  }

  KOS.attach = {
    openViewer: openViewer,
    share: shareFile,
    available: available,
    add: add,
    list: list,
    get: get,
    setNote: setNote,
    rename: rename,
    replace: replace,
    remove: remove,
    renameRefs: renameRefs,
    mountTab: mountTab,
    /* the file layer (files plan R1, invariant 150) */
    addLink: addLink, removeLink: removeLink, setKind: setKind, evict: evict, updateFile: updateFile,
    linksOf: linksOf, homeLink: homeLink, cleanLinks: cleanLinks, keysOf: keysOf, hashOf: hashOf,
    guessKind: guessKind, promote: promote, KIND_ORDER: KIND_ORDER, MAX_BYTES: MAX_BYTES,
    exportAll: exportAll,
    importAll: importAll,
    /* Build 4a — cloud sync surface */
    listMeta: listMeta,
    getByFileId: getByFileId,
    putRemoteMeta: putRemoteMeta,
    setBlob: setBlob
  };
})();
