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

  function mountTab(panel, sid, ref) {
    var wrap = el("div", { class: "att-wrap" });
    panel.appendChild(wrap);

    if (!available()) {
      wrap.appendChild(el("div", { class: "att-unavail" }, [
        el("p", { class: "sub", text: "File attachments need IndexedDB, which this browser/context doesn't provide. Use the subject's resource table for links instead." })
      ]));
      return;
    }

    wrap.appendChild(el("p", { class: "sub att-lead", text:
      "Attach worksheets, mark schemes, scanned notes — stored in this browser's IndexedDB. Included in the full backup export (Backup & Restore). Images and PDFs preview inline; each file carries its own notes field." }));

    var file = el("input", { type: "file", style: "display:none", onchange: function () {
      if (!file.files[0]) return;
      add(sid, ref, file.files[0], function (err) {
        if (err) KOS.ui.toast("Upload failed: " + err.message, true);
        else { KOS.ui.toast("Attached to " + ref + "."); render(); }
        file.value = "";
      });
    } });
    wrap.appendChild(file);
    wrap.appendChild(el("div", { class: "lab-controls" }, [
      el("button", { class: "btn primary", text: "⇪ Attach a file…", onclick: function () { file.click(); } })
    ]));

    var listEl = el("div", { class: "att-list" });
    wrap.appendChild(listEl);

    function render() {
      list(sid, ref, function (err, items) {
        listEl.innerHTML = "";
        if (err) { listEl.appendChild(el("p", { class: "sub", text: "Could not read the file store: " + err.message })); return; }
        if (!items.length) { listEl.appendChild(el("p", { class: "fc-empty", text: "Nothing attached to this topic yet." })); return; }
        items.sort(function (a, b) { return b.added - a.added; });
        items.forEach(function (rec) { listEl.appendChild(row(rec)); });
      });
    }

    function row(rec) {
      var viewer = el("div", { class: "att-viewer", style: "display:none" });
      var objUrl = null;
      function closeViewer() {
        viewer.style.display = "none";
        viewer.innerHTML = "";
        if (objUrl) { URL.revokeObjectURL(objUrl); objUrl = null; }
      }
      var r = el("div", { class: "att-row" });
      /* Build 4a — a record whose binary lives only in cloud storage (synced
         metadata from another device). View/Open need the blob; offer the
         explicit download instead. */
      var cloudOnly = !rec.blob;
      var dlBtn = cloudOnly ? el("button", { class: "mini-btn", text: "⇣ Download from cloud", onclick: function () {
        if (!window.KOS || !KOS.cloudsync || !KOS.cloudsync.downloadFile) {
          KOS.ui.toast("Cloud sync isn't available here — this file's content lives on another device.", true);
          return;
        }
        dlBtn.disabled = true;
        dlBtn.textContent = "Downloading…";
        KOS.cloudsync.downloadFile(rec.fileId, function (err) {
          if (err) {
            dlBtn.disabled = false;
            dlBtn.textContent = "⇣ Download from cloud";
            KOS.ui.toast("Download failed: " + err.message, true);
          } else {
            KOS.ui.toast("File downloaded.");
            render();
          }
        });
      } }) : null;
      r.appendChild(el("div", { class: "att-head" }, [
        el("span", { class: "att-ico", "aria-hidden": "true", text: icon(rec.mime) }),
        el("span", { class: "att-name", text: rec.name, title: rec.mime }),
        el("span", { class: "att-size", text: fmtSize(rec.size) }),
        cloudOnly ? el("span", { class: "sub att-nopreview", text: "☁ metadata synced — the file itself hasn't been downloaded to this device" }) : null,
        dlBtn,
        !cloudOnly && canInline(rec.mime) ? el("button", { class: "mini-btn", text: "View", onclick: function () {
          if (viewer.style.display !== "none") { closeViewer(); return; }
          objUrl = URL.createObjectURL(rec.blob);
          viewer.innerHTML = "";
          if (rec.mime.indexOf("image/") === 0) {
            viewer.appendChild(el("img", { src: objUrl, alt: rec.name }));
          } else if (rec.mime.indexOf("text/") === 0) {
            var pre = el("pre", { class: "att-text" });
            viewer.appendChild(pre);
            rec.blob.text().then(function (t) { pre.textContent = t.slice(0, 200000); });
          } else {
            viewer.appendChild(el("iframe", { src: objUrl, title: rec.name }));
          }
          viewer.style.display = "";
        } }) : null,
        cloudOnly ? null : el("button", { class: "mini-btn", text: "Open ↗", title: "Open in a new tab / download", onclick: function () {
          var u = URL.createObjectURL(rec.blob);
          var w = window.open(u, "_blank");
          if (!w) {
            var a = el("a", { href: u, download: rec.name });
            document.body.appendChild(a); a.click(); a.remove();
          }
          setTimeout(function () { URL.revokeObjectURL(u); }, 30000);
        } }),
        !cloudOnly && !canInline(rec.mime) ? el("span", { class: "sub att-nopreview", text: inlineNote(rec.mime) }) : null,
        el("button", { class: "mini-btn danger", text: "✕", "aria-label": "Delete file", onclick: function () {
          KOS.ui.confirm({ title: "Delete file?", body: "Delete “" + rec.name + "” and its notes?", danger: true, confirm: "Delete" }, function () {
            closeViewer();
            remove(rec.id, function (err) {
              if (err) KOS.ui.toast("Delete failed: " + err.message, true);
              else { KOS.ui.toast("File deleted."); render(); }
            });
          });
        } })
      ]));
      r.appendChild(viewer);
      var note = el("textarea", { class: "note-area att-note", rows: 2,
        placeholder: "Notes on this document — page refs, what to revisit, corrections…",
        oninput: debounce(function () { setNote(rec.id, note.value); }, 400) });
      note.value = rec.note || "";
      r.appendChild(note);
      return r;
    }
    render();
  }

  KOS.attach = {
    available: available,
    add: add,
    list: list,
    setNote: setNote,
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
