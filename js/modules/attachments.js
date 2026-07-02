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
    return mime.indexOf("image/") === 0 || mime === "application/pdf";
  }
  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, a); }, ms);
    };
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

    wrap.appendChild(el("p", { class: "sub att-lead", text:
      "Attach worksheets, mark schemes, scanned notes — stored in this browser's IndexedDB (not the backup JSON; export files separately if you move machines). Images and PDFs preview inline; each file carries its own notes field." }));

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
    mountTab: mountTab
  };
})();
