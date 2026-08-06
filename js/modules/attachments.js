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

  var DB_NAME = "kurenai-os-files", STORE = "files";
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
    var rq = window.indexedDB.open(DB_NAME, 2);
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
      if (e.oldVersion > 0 && e.oldVersion < 2) {
        var cur = os.openCursor();
        cur.onsuccess = function (ev) {
          var c = ev.target.result;
          if (!c) return;
          var v = c.value;
          if (!v.fileId) {
            v.fileId = genId();
            v.updatedAt = v.updatedAt || v.added || Date.now();
            c.update(v);
          }
          c.continue();
        };
      }
    };
    rq.onsuccess = function () { db = rq.result; cb(null, db); };
    rq.onerror = function () { cb(rq.error || new Error("Could not open the file store")); };
  }
  function tx(mode, cb) {
    open(function (err, d) {
      if (err) { cb(err); return; }
      cb(null, d.transaction(STORE, mode).objectStore(STORE));
    });
  }

  function add(sid, ref, file, cb) {
    if (file.size > MAX_BYTES) { cb(new Error("Over the 25 MB per-file limit — link it as a resource instead")); return; }
    tx("readwrite", function (err, os) {
      if (err) { cb(err); return; }
      var rq = os.add({
        subject: sid, ref: ref, name: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size, blob: file, note: "", added: Date.now(),
        fileId: genId(), updatedAt: Date.now()
      });
      rq.onsuccess = function () { noteCloud(); cb(null, rq.result); };
      rq.onerror = function () { cb(rq.error); };
    });
  }
  function list(sid, ref, cb) {
    tx("readonly", function (err, os) {
      if (err) { cb(err, []); return; }
      var rq = os.index("topic").getAll(window.IDBKeyRange.only([sid, ref]));
      rq.onsuccess = function () { cb(null, rq.result || []); };
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
        var p = os.put(rec);
        p.onsuccess = function () { noteCloud(); cb && cb(null, rec); };
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
              updatedAt: rec.updatedAt || rec.added || null };
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
            updatedAt: item.updatedAt || item.added || Date.now() };
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
            updatedAt: rec.updatedAt || rec.added || null, hasBlob: !!rec.blob };
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
        if (blob && blob.size != null) rec.size = blob.size;
        var rq = os.put(rec);
        rq.onsuccess = function () { cb && cb(null, rec); };
        rq.onerror = function () { cb && cb(rq.error); };
      });
    });
  }

  /* ---------------- the Files tab ---------------- */
  function fmtSize(b) {
    return b > 1048576 ? (b / 1048576).toFixed(1) + " MB"
      : b > 1024 ? Math.round(b / 1024) + " KB" : b + " B";
  }
  function icon(mime) {
    if (mime.indexOf("image/") === 0) return "🖼";
    if (mime === "application/pdf") return "📄";
    if (mime.indexOf("text/") === 0) return "📃";
    return "📎";
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

  function mountTab(panel, sid, ref) {
    var wrap = el("div", { class: "att-wrap" });
    panel.appendChild(wrap);

    if (!available()) {
      wrap.appendChild(el("div", { class: "att-unavail" }, [
        el("p", { class: "sub", text: "File attachments need IndexedDB, which this browser/context doesn't provide. Use the subject's resource table for links instead." })
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

    /* ---- header: lead + attach ---- */
    var fileIn = el("input", { type: "file", style: "display:none", onchange: function () {
      if (!fileIn.files[0]) return;
      add(sid, ref, fileIn.files[0], function (err, id) {
        if (err) KOS.ui.toast("Upload failed: " + err.message, true);
        else { KOS.ui.toast("Attached to " + ref + "."); selectedId = id; render(); }
        fileIn.value = "";
      });
    } });
    var replaceIn = el("input", { type: "file", style: "display:none", onchange: function () {
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

    wrap.appendChild(el("div", { class: "att-lead-row" }, [
      el("p", { class: "sub att-lead", text:
        "Stored in this browser's IndexedDB and included in the full backup export. Images and PDFs preview inline; every document carries its own notes." }),
      el("button", { class: "btn primary", text: "⇪ Attach a file…", onclick: function () { fileIn.click(); } })
    ]));

    var body = el("div", { class: "att-body" });
    wrap.appendChild(body);
    var listEl = el("div", { class: "att-files", role: "listbox", "aria-label": "Attached files" });
    var stage = el("section", { class: "att-stage", "aria-label": "Document preview" });
    body.appendChild(listEl);
    body.appendChild(stage);

    /* ---- the file list ---- */
    function renderList() {
      listEl.innerHTML = "";
      if (!items.length) {
        listEl.appendChild(el("p", { class: "fc-empty att-empty", text: "Nothing attached to this topic yet." }));
        return;
      }
      items.forEach(function (rec) {
        var st = health(rec);
        var node = el("button", { class: "att-file" + (rec.id === selectedId ? " selected" : "") + (st !== "ok" ? " degraded" : ""),
          role: "option", "aria-selected": rec.id === selectedId ? "true" : "false",
          onclick: function () { selectedId = rec.id; previewOpen = true; renderList(); renderStage(); } }, [
          el("span", { class: "att-ico", "aria-hidden": "true", text: icon(rec.mime) }),
          el("span", { class: "att-file-txt" }, [
            el("span", { class: "att-name", text: rec.name, title: rec.name }),
            el("span", { class: "att-file-meta", text: kindLabel(rec.mime) + " · " + fmtSize(rec.size) })
          ]),
          st === "cloud-only" ? el("span", { class: "att-badge", title: "Metadata synced; the file itself is on another device", text: "☁" })
            : st === "damaged" ? el("span", { class: "att-badge bad", title: "Stored but empty", text: "!" }) : null
        ].filter(Boolean));
        listEl.appendChild(node);
      });
    }

    /* ---- the preview stage ---- */
    function renderStage() {
      releaseUrl();
      stage.innerHTML = "";
      var rec = selected();
      if (!rec) {
        stage.appendChild(el("div", { class: "att-stage-empty" }, [
          el("span", { class: "ase-g", "aria-hidden": "true", text: "📄" }),
          el("p", { class: "sub", text: items.length ? "Select a file to preview it." : "Attach a worksheet, mark scheme or scan and it previews here." })
        ]));
        return;
      }
      var st = health(rec);

      /* --- metadata head + actions (Part D) --- */
      var nameEl = el("h3", { class: "att-stage-name", text: rec.name, title: rec.name });
      stage.appendChild(el("div", { class: "att-stage-head" }, [
        el("div", { class: "att-stage-id" }, [
          nameEl,
          el("dl", { class: "att-meta" }, [
            metaPair("Type", kindLabel(rec.mime)),
            metaPair("Size", fmtSize(rec.size)),
            metaPair("Added", fmtDate(rec.added)),
            metaPair("Topic", subjectLabel(rec.subject) + " · " + rec.ref)
          ].reduce(function (a, b) { return a.concat(b); }, []))
        ]),
        el("div", { class: "att-actions" }, [
          el("button", { class: "mini-btn", text: "✎ Rename", onclick: function () { renameFlow(rec); } }),
          el("button", { class: "mini-btn", text: "⇄ Replace", title: "Swap the file, keep the notes and links",
            onclick: function () { replaceIn.click(); } }),
          el("button", { class: "mini-btn danger", text: "✕ Remove", onclick: function () { removeFlow(rec); } })
        ])
      ]));

      /* --- the control bar (Part B) --- */
      var inlineable = st === "ok" && canInline(rec.mime);
      var bar = el("div", { class: "att-bar" });
      if (inlineable) {
        bar.appendChild(el("div", { class: "att-bar-group", role: "group", "aria-label": "Fit" }, [
          fitBtn("Fit width", FIT.WIDTH),
          fitBtn("Fit page", FIT.PAGE)
        ]));
        bar.appendChild(el("div", { class: "att-bar-group", role: "group", "aria-label": "Zoom" }, [
          el("button", { class: "mini-btn", text: "−", "aria-label": "Zoom out", onclick: function () { stepZoom(-1); } }),
          el("span", { class: "att-zoom", text: zoom + "%" }),
          el("button", { class: "mini-btn", text: "+", "aria-label": "Zoom in", onclick: function () { stepZoom(1); } })
        ]));
        bar.appendChild(el("button", { class: "mini-btn", text: previewOpen ? "▾ Collapse" : "▸ Expand",
          title: previewOpen ? "Hide the preview" : "Show the preview",
          onclick: function () { previewOpen = !previewOpen; renderStage(); } }));
        bar.appendChild(el("button", { class: "mini-btn", text: "⤢ Full screen", onclick: function () { openFullscreen(rec); } }));
      }
      bar.appendChild(el("span", { class: "att-bar-sp" }));
      if (st === "ok") {
        bar.appendChild(el("button", { class: "mini-btn", text: "↗ Open", title: "Open in a new tab", onclick: function () { openExternally(rec); } }));
        bar.appendChild(el("button", { class: "mini-btn", text: "⤓ Download", onclick: function () { download(rec); } }));
      }
      if (st === "cloud-only") bar.appendChild(cloudDownloadBtn(rec));
      stage.appendChild(bar);

      /* --- the preview itself --- */
      if (!previewOpen) {
        stage.appendChild(el("p", { class: "sub att-collapsed", text: "Preview hidden — Expand to bring it back." }));
      } else if (st === "cloud-only") {
        stage.appendChild(unusableCard("☁", "On another device",
          "The metadata for this file synced, but its content hasn't been downloaded here yet."));
      } else if (st === "damaged") {
        stage.appendChild(unusableCard("!", "This file is empty",
          "The record is stored but its content is 0 bytes — the upload was interrupted or the data was lost. Replace it with a fresh copy, or remove it."));
      } else if (!canInline(rec.mime)) {
        stage.appendChild(unusableCard(icon(rec.mime), kindLabel(rec.mime) + " — no in-browser preview",
          inlineNote(rec.mime), [
            el("button", { class: "btn", text: "↗ Open", onclick: function () { openExternally(rec); } }),
            el("button", { class: "btn primary", text: "⤓ Download", onclick: function () { download(rec); } })
          ]));
      } else {
        stage.appendChild(previewNode(rec, false));
      }

      /* --- notes, always BENEATH the preview (Part C) --- */
      var note = el("textarea", { class: "note-area att-note", rows: 3,
        placeholder: "Notes on this document — page refs, what to revisit, corrections…",
        oninput: debounce(function () { setNote(rec.id, note.value); }, 400) });
      note.value = rec.note || "";
      stage.appendChild(el("div", { class: "att-notes" }, [
        el("h4", { text: "Document notes" }),
        note
      ]));

      function fitBtn(label, mode) {
        return el("button", { class: "mini-btn" + (fit === mode ? " on" : ""), text: label,
          onclick: function () { fit = mode; zoom = 100; renderStage(); } });
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
      return el("div", { class: "att-unusable" }, [
        el("span", { class: "au-g", "aria-hidden": "true", text: glyph }),
        el("b", { text: title }),
        body ? el("p", { class: "sub", text: body }) : null,
        actions ? el("div", { class: "lab-controls", style: "justify-content:center" }, actions) : null
      ].filter(Boolean));
    }

    /* the one place a preview node is built — used inline AND full screen */
    function previewNode(rec, full) {
      var url = URL.createObjectURL(rec.blob);
      if (!full) objUrl = url;
      var host = el("div", { class: "att-preview" + (full ? " is-full" : "") + " fit-" + fit });

      if (rec.mime.indexOf("image/") === 0) {
        var img = el("img", { class: "att-img", src: url, alt: rec.name });
        if (fit === FIT.ZOOM) img.style.width = zoom + "%";
        img.addEventListener("error", function () {
          host.innerHTML = "";
          host.appendChild(unusableCard("!", "This image could not be decoded",
            "The stored data is corrupt or in a format this browser can't read. Replace it, or download it to inspect."));
        });
        host.appendChild(img);
      } else if (rec.mime === "application/pdf") {
        /* PDF viewer fragment params. The toolbar is NEVER suppressed —
           the embedded viewer's own controls stay available, and the frame
           is given real height so they can't be clipped. */
        var frag = fit === FIT.PAGE ? "#view=Fit" : fit === FIT.ZOOM ? "#zoom=" + zoom : "#view=FitH";
        host.appendChild(el("iframe", { class: "att-pdf", src: url + frag, title: rec.name,
          allow: "fullscreen" }));
      } else {
        var pre = el("pre", { class: "att-text" });
        if (fit === FIT.ZOOM) pre.style.fontSize = (12.5 * zoom / 100).toFixed(1) + "px";
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

    /* ---- expanded / full-screen preview ---- */
    function openFullscreen(rec) {
      var overlay = el("div", { class: "att-fs", role: "dialog", "aria-label": rec.name + " preview" });
      var node = previewNode(rec, true);
      function close() {
        document.removeEventListener("keydown", onKey, true);
        node.dispatchEvent(new window.CustomEvent("kos-release"));
        overlay.remove();
      }
      function onKey(e) { if (e.key === "Escape") { e.stopPropagation(); close(); } }
      document.addEventListener("keydown", onKey, true);
      overlay.appendChild(el("div", { class: "att-fs-bar" }, [
        el("b", { class: "att-fs-name", text: rec.name }),
        el("span", { class: "att-bar-sp" }),
        el("button", { class: "mini-btn", text: "↗ Open", onclick: function () { openExternally(rec); } }),
        el("button", { class: "mini-btn", text: "⤓ Download", onclick: function () { download(rec); } }),
        el("button", { class: "mini-btn", text: "✕ Close", onclick: close })
      ]));
      overlay.appendChild(node);
      overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
      document.body.appendChild(overlay);
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
      var b = el("button", { class: "mini-btn", text: "⇣ Download from cloud", onclick: function () {
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
      } });
      return b;
    }

    /* ---- rename / remove ---- */
    function renameFlow(rec) {
      var overlay = KOS.medview.modalOverlay();
      var input = el("input", { type: "text", class: "todo-in", value: rec.name,
        onkeydown: function (e) { if (e.key === "Enter") save(); } });
      function save() {
        var v = input.value.trim();
        if (!v) { KOS.ui.toast("A file needs a name.", true); return; }
        rename(rec.id, v, function (err) {
          if (err) { KOS.ui.toast("Rename failed: " + err.message, true); return; }
          overlay.close(); render();
        });
      }
      overlay.appendChild(el("div", { class: "modal modal-sm" }, [
        el("div", { class: "modal-h" }, [el("b", { text: "Rename file" }),
          el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", onclick: overlay.close })]),
        el("div", { class: "med-form" }, [KOS.medview.field("Filename", input)]),
        el("div", { class: "lab-controls med-modal-foot" }, [
          el("span", { style: "flex:1" }),
          el("button", { class: "btn", text: "Cancel", onclick: overlay.close }),
          el("button", { class: "btn primary", text: "Save", onclick: save })
        ])
      ]));
      document.body.appendChild(overlay);
      input.focus();
    }
    function removeFlow(rec) {
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
          listEl.appendChild(el("p", { class: "sub", text: "Could not read the file store: " + err.message }));
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

  KOS.attach = {
    available: available,
    add: add,
    list: list,
    get: get,
    setNote: setNote,
    rename: rename,
    replace: replace,
    remove: remove,
    mountTab: mountTab,
    exportAll: exportAll,
    importAll: importAll,
    /* Build 4a — cloud sync surface */
    listMeta: listMeta,
    getByFileId: getByFileId,
    putRemoteMeta: putRemoteMeta,
    setBlob: setBlob
  };
})();
