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

  function open(cb) {
    if (!available()) { cb(new Error("IndexedDB unavailable")); return; }
    if (db) { cb(null, db); return; }
    var rq = window.indexedDB.open(DB_NAME, 1);
    rq.onupgradeneeded = function (e) {
      var d = e.target.result;
      if (!d.objectStoreNames.contains(STORE)) {
        var os = d.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        os.createIndex("topic", ["subject", "ref"], { unique: false });
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
        size: file.size, blob: file, note: "", added: Date.now()
      });
      rq.onsuccess = function () { cb(null, rq.result); };
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
        var p = os.put(rec);
        p.onsuccess = function () { cb && cb(null); };
        p.onerror = function () { cb && cb(p.error); };
      };
      rq.onerror = function () { cb && cb(rq.error); };
    });
  }
  function remove(id, cb) {
    tx("readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var rq = os.delete(id);
      rq.onsuccess = function () { cb && cb(null); };
      rq.onerror = function () { cb && cb(rq.error); };
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
          blobToBase64(rec.blob, function (e, b64) {
            if (fired) return;
            if (e) { fired = true; cb(e); return; }
            result[i] = { id: rec.id, subject: rec.subject, ref: rec.ref,
              name: rec.name, mime: rec.mime, size: rec.size,
              note: rec.note || "", added: rec.added, blobBase64: b64 };
            if (!--pending) { fired = true; cb(null, result); }
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
          var blob;
          try { blob = base64ToBlob(item.blobBase64); }
          catch (e) { if (!fired) { fired = true; cb(new Error("Could not decode " + (item.name || "attachment"))); } return; }
          var rec = { id: item.id, subject: item.subject, ref: item.ref,
            name: item.name, mime: item.mime, size: item.size,
            blob: blob, note: item.note || "", added: item.added };
          var putRq = os.put(rec);
          putRq.onsuccess = function () { if (!fired && !--pending) { fired = true; cb(null); } };
          putRq.onerror = function () { if (!fired) { fired = true; cb(putRq.error); } };
        });
      };
      clearRq.onerror = function () { cb(clearRq.error); };
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
      r.appendChild(el("div", { class: "att-head" }, [
        el("span", { class: "att-ico", "aria-hidden": "true", text: icon(rec.mime) }),
        el("span", { class: "att-name", text: rec.name, title: rec.mime }),
        el("span", { class: "att-size", text: fmtSize(rec.size) }),
        canInline(rec.mime) ? el("button", { class: "mini-btn", text: "View", onclick: function () {
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
        el("button", { class: "mini-btn", text: "Open ↗", title: "Open in a new tab / download", onclick: function () {
          var u = URL.createObjectURL(rec.blob);
          var w = window.open(u, "_blank");
          if (!w) {
            var a = el("a", { href: u, download: rec.name });
            document.body.appendChild(a); a.click(); a.remove();
          }
          setTimeout(function () { URL.revokeObjectURL(u); }, 30000);
        } }),
        !canInline(rec.mime) ? el("span", { class: "sub att-nopreview", text: inlineNote(rec.mime) }) : null,
        el("button", { class: "mini-btn danger", text: "✕", "aria-label": "Delete file", onclick: function () {
          if (!confirm("Delete “" + rec.name + "” and its notes?")) return;
          closeViewer();
          remove(rec.id, function (err) {
            if (err) KOS.ui.toast("Delete failed: " + err.message, true);
            else { KOS.ui.toast("File deleted."); render(); }
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
    importAll: importAll
  };
})();
