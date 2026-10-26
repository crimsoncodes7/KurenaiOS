/* Kurenai OS — core/files.js · KOS.files
   ONE FILE LAYER for the whole app (roadmap 5.11, docs/files-plan.md
   R1–R4, invariants 150–153).

   AN INDEX, NOT A NEW STORE (decision A). The blobs stay where they are:
   topic and assignment files in `kurenai-os-files` (KOS.attach: synced
   metadata, the binary to your private bucket), past papers in
   `kurenai-os-papers` (KOS.examPapers: this device only, invariant 125).
   KOS.files reads both into one list of records, kept in memory so the
   Files page, search and every record's own files read it at once:

     {fileId, store "files"|"papers", id, name, aliases, mime, size, kind,
      hash, links [{kind, id}], subject, note, added, updatedAt, hasBlob,
      evicted, local, paper, sitting, pkind, part, origin}

   ONE FILE, MANY LINKS (invariant 150). A file stored twice (the same
   SHA-256) is linked again; a paper and an attachment with one hash show
   as ONE file, and the attachment's kind is promoted (only ever up).

   TEXT INSIDE FILES (§3, adjusted). Each PDF's text layer is read once,
   on the device, by pdf.js in its own worker — a background queue, one
   file at a time, a page per idle slice — into `kurenai-os-filetext`
   ({fileId, pages, at}). A folder import never waits on it; a file still
   queued says "Indexing…". No OCR: a scan has no text. Freeing space
   (invariant 150) keeps the text and the ink.

   ONE VIEWER (invariant 152). KOS.files.open is the one way a file
   opens: a PDF in the app's viewer with its ink layer, a picture made
   into a one-page PDF in memory so it takes ink the same way (the
   original is never changed, invariant 151), text and anything else full
   screen with Share and Download.

   Reads write nothing; a change dispatches `kos-files`.                 */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var KINDS = ["paper", "scheme", "worksheet", "notes", "handout", "photo", "other"];
  var KIND_NAME = { paper: "Question paper", scheme: "Mark scheme", worksheet: "Worksheet", notes: "Notes", handout: "Handout", photo: "Photo", other: "Other" };
  var PKIND = { qp: "paper", ms: "scheme", ma: "notes", er: "handout" };
  var recs = [], byId = {}, loaded = false, waiting = [], loading = false;

  function A() { return KOS.attach; }
  function P() { return KOS.examPapers; }
  function emit() { try { window.dispatchEvent(new window.CustomEvent("kos-files-index")); } catch (e) { /* old engine */ } }

  /* ---------------- the index ---------------- */
  function fromAttach(m) {
    var links = A().cleanLinks(m.links || []);
    var topic = links.filter(function (l) { return l.kind === "topic"; })[0];
    var pl = links.filter(function (l) { return l.kind === "paper"; })[0];
    var r = { fileId: m.fileId, store: "files", id: m.id, name: m.name, aliases: m.aliases || [], mime: m.mime || "application/octet-stream",
      size: m.size || 0, kind: m.kind || "other", hash: m.hash || null, links: links,
      subject: topic ? topic.id.split(":")[0] : (m.subject && m.subject !== "_" ? m.subject : null),
      note: m.note || "", added: m.added || 0, updatedAt: m.updatedAt || m.added || 0, hasBlob: !!m.hasBlob, evicted: !!m.evicted,
      local: !!m.local, origin: m.origin || null };
    if (pl) { var j = pl.id.lastIndexOf(":"); r.paper = pl.id.slice(0, j); r.sitting = pl.id.slice(j + 1); r.pkind = r.kind === "scheme" ? "ms" : "qp"; }
    return r;
  }
  function fromPaper(p) {
    var links = p.paper && p.sitting ? [{ kind: "paper", id: p.paper + ":" + p.sitting }] : [];
    return { fileId: p.id, store: "papers", id: p.id, name: p.name, aliases: [], mime: p.photo ? "image/jpeg" : "application/pdf", size: p.size || 0,
      kind: p.mock ? "paper" : PKIND[p.kind] || "other", hash: p.hash || null, links: links, subject: p.subject || null, note: "",
      added: p.added || 0, updatedAt: p.added || 0, hasBlob: p.hasBlob !== false, evicted: false, local: !p.cloud, paper: p.paper || null,
      sitting: p.sitting || null, pkind: p.kind || null, part: p.part || null, mock: !!p.mock, folder: !!p.linked, origin: null };
  }
  function build(att, pap) {
    var out = [], hashes = {};
    att.forEach(function (m) { var r = fromAttach(m); out.push(r); if (r.hash) hashes[r.hash] = r; });
    pap.forEach(function (p) {
      if (/^f:/.test(p.id)) return;                       // a cloud copy: already an attachment
      var r = fromPaper(p), twin = r.hash && hashes[r.hash];
      if (twin) {
        /* one file, many links: the paper joins the attachment, which is
           promoted to the paper's kind (never demoted) */
        twin.alsoPaper = r.id;
        r.links.forEach(function (l) { if (!twin.links.some(function (x) { return x.kind === l.kind && x.id === l.id; })) twin.links.push(l); });
        if (!twin.paper && r.paper) { twin.paper = r.paper; twin.sitting = r.sitting; twin.pkind = r.pkind; }
        var up = A().promote(twin.kind, r.kind);
        if (up !== twin.kind) { twin.kind = up; A().updateFile(twin.fileId, function (rec) { rec.kind = A().promote(rec.kind || "other", up); }); }
        return;
      }
      out.push(r);
    });
    return out.sort(function (a, b) { return (b.updatedAt || b.added) - (a.updatedAt || a.added); });
  }
  function refresh(cb) {
    if (loading) { if (cb) waiting.push(cb); return; }
    loading = true;
    if (cb) waiting.push(cb);
    var att = null, pap = null;
    function done() {
      if (att === null || pap === null) return;
      recs = build(att, pap);
      byId = {};
      recs.forEach(function (r) { byId[r.fileId] = r; });
      loaded = true; loading = false;
      var w = waiting; waiting = [];
      w.forEach(function (f) { try { f(null, recs); } catch (e) { /* a reader never breaks the index */ } });
      emit();
      queueIndexing(null);
      askToKeep();
    }
    if (A() && A().available()) A().listMeta(function (e, items) { att = e ? [] : items || []; done(); }); else att = [];
    if (P() && P().available()) P().list(function (e, rows) { pap = e ? [] : rows || []; done(); }); else pap = [];
    done();
  }
  /* persistent storage (invariant 39): asked ONCE, when the library passes
     200 MB, never promised; Settings › Storage can ask again */
  function askToKeep() {
    var ui = KOS.store.state.ui;
    if (ui.persistAsked || !navigator.storage || !navigator.storage.persist) return;
    var bytes = recs.reduce(function (s, r) { return s + (r.hasBlob && !r.folder ? r.size || 0 : 0); }, 0);
    if (bytes < 200 * 1048576) return;
    ui.persistAsked = Date.now();
    KOS.store.save();
    navigator.storage.persist().catch(function () { /* the browser decides */ });
  }
  function ready(cb) { if (loaded) cb(null, recs); else refresh(cb); }
  function all() { return recs.slice(); }
  function get(fileId) { return byId[fileId] || null; }
  function linkedTo(kind, id) {
    var k = kind + ":" + id;
    return recs.filter(function (r) { return r.links.some(function (l) { return l.kind + ":" + l.id === k; }); });
  }
  var refreshT = null;
  function soon() { clearTimeout(refreshT); refreshT = setTimeout(function () { refresh(); }, 120); }
  window.addEventListener("kos-files", soon);
  if (P() && P().onChange) P().onChange(soon);

  /* ---------------- names and places ---------------- */
  function linkLabel(l) {
    try {
      if (l.kind === "topic") { var n = KOS.spec.node ? KOS.spec.node(l.id) : null; return n ? n.ref + " · " + n.title : l.id; }
      if (l.kind === "assignment") { var a = (KOS.assignments.all() || []).filter(function (x) { return String(x.id) === String(l.id); })[0]; return a ? "Assignment · " + a.title : "An assignment"; }
      if (l.kind === "exam") { var x = KOS.exams.get ? KOS.exams.get(l.id) : null; return x ? x.title : "An assessment"; }
      if (l.kind === "paper") { var j = l.id.lastIndexOf(":"), pid = l.id.slice(0, j), ix = window.KOS_EXAMS && KOS_EXAMS.index, pp = ix && ix.papers[pid];
        return (pp ? pp.title : pid.toUpperCase()) + " · " + (KOS.examIndex ? KOS.examIndex.sittingLabel(l.id.slice(j + 1)) : l.id.slice(j + 1)); }
      if (l.kind === "event") return "A calendar event";
      if (l.kind === "goal") return "A goal";
    } catch (e) { /* a place that has gone */ }
    return l.kind;
  }
  function openLink(l) {
    if (l.kind === "topic") { var i = l.id.indexOf(":"); KOS.show("ref", { subject: l.id.slice(0, i), ref: l.id.slice(i + 1), tab: "files" }); return; }
    if (l.kind === "assignment") { KOS.show("assignments", { id: isNaN(+l.id) ? l.id : +l.id }); return; }
    if (l.kind === "exam") { KOS.show("exams", l.id); return; }
    if (l.kind === "paper") { KOS.show("exams", "library"); return; }
    if (l.kind === "goal") { KOS.show("goals", l.id); return; }
    KOS.show("calendar");
  }
  function inkPrefix(r) { return (r.store === "papers" || r.alsoPaper ? "paper:" : "file:") + (r.store === "papers" ? r.id : r.fileId) + ":"; }
  /* "has my writing": any ink layer on it with a stroke */
  function writing(r) {
    if (!KOS.ink || !KOS.ink.docsWith) return 0;
    var n = 0;
    KOS.ink.docsWith(inkPrefix(r)).concat(r.alsoPaper ? KOS.ink.docsWith("paper:" + r.alsoPaper + ":") : []).forEach(function (d) {
      Object.keys(d.inked || {}).forEach(function (k) { if (d.inked[k]) n++; });
    });
    return n;
  }
  function badge(r) {
    var m = r.mime || "";
    if (m === "application/pdf") return "PDF";
    if (/^image\//.test(m)) return "IMG";
    if (/^text\/|markdown|json/.test(m)) return "TXT";
    if (/wordprocessingml|msword/.test(m)) return "DOC";
    if (/spreadsheetml|ms-excel/.test(m)) return "XLS";
    if (/presentationml|ms-powerpoint/.test(m)) return "PPT";
    if (/^audio\//.test(m)) return "AUD";
    if (/^video\//.test(m)) return "VID";
    return "FILE";
  }

  /* ---------------- getting files in ---------------- */
  /* add(files, {link, kind, origin}, cb) — cb(err, results): every file
     gets an outcome and a reason (invariant 153): added, linked (it was
     already here) or skipped and why */
  function add(files, o, cb) {
    o = o || {};
    files = [].slice.call(files || []);
    var out = [], link = o.link || null;
    var sid = "_", ref = "_", links = [];
    if (link && link.kind === "topic") { var i = link.id.indexOf(":"); sid = link.id.slice(0, i); ref = link.id.slice(i + 1); }
    else if (link && link.kind === "assignment") { ref = "assignment:" + link.id; sid = o.subject || "_"; }
    else if (link) links = [link];
    (function next() {
      if (!files.length) { refresh(function () { if (cb) cb(null, out); }); return; }
      var f = files.shift();
      if (!f) { next(); return; }
      if (f.size > A().MAX_BYTES) { out.push({ name: f.name, outcome: "skipped", why: "over 25 MB" }); next(); return; }
      if (!f.size) { out.push({ name: f.name, outcome: "skipped", why: "empty" }); next(); return; }
      A().add(sid, ref, f, function (err, id, info) {
        out.push(err ? { name: f.name, outcome: "skipped", why: err.message } : info && info.linked ? { name: f.name, outcome: "linked", why: "already here — linked, not stored twice", fileId: info.fileId } : { name: f.name, outcome: "added", why: "" });
        next();
      }, { kind: o.kind, links: links, origin: o.origin });
    })();
  }
  /* a pasted or dropped image with no name gets one */
  function named(blob, base) {
    if (blob && blob.name) return blob;
    var ext = ((blob && blob.type) || "image/png").split("/")[1].replace("jpeg", "jpg");
    try { return new File([blob], (base || "Pasted") + " " + new Date().toLocaleString("en-GB").replace(/[/:,]/g, "-") + "." + ext, { type: blob.type }); }
    catch (e) { return blob; }
  }
  /* DROP ANYWHERE (files plan §6): files dropped on a target attach there */
  function dropTarget(node, link, after) {
    if (!node || node.__kosDrop) return;
    node.__kosDrop = true;
    function has(e) { var t = e.dataTransfer && e.dataTransfer.types; return t && [].indexOf.call(t, "Files") >= 0; }
    node.addEventListener("dragover", function (e) { if (!has(e)) return; e.preventDefault(); KOS.ui.state(node, "drop-over", true); });
    node.addEventListener("dragleave", function (e) { if (e.target === node) KOS.ui.state(node, "drop-over", false); });
    node.addEventListener("drop", function (e) {
      if (!has(e)) return;
      e.preventDefault(); e.stopPropagation();
      KOS.ui.state(node, "drop-over", false);
      var fs = [].slice.call(e.dataTransfer.files || []);
      if (!fs.length) return;
      add(fs, { link: typeof link === "function" ? link() : link }, function (err, res) { report(res); if (after) after(res); });
    });
  }
  function report(res) {
    res = res || [];
    var a = res.filter(function (r) { return r.outcome === "added"; }).length, l = res.filter(function (r) { return r.outcome === "linked"; }).length, s = res.filter(function (r) { return r.outcome === "skipped"; });
    var parts = [];
    if (a) parts.push(a + (a === 1 ? " file added" : " files added"));
    if (l) parts.push(l + " already here, linked");
    if (s.length) parts.push(s.length + " skipped (" + s.map(function (x) { return x.name + ": " + x.why; }).join("; ") + ")");
    if (parts.length) KOS.ui.toast(parts.join(" · ") + ".", !a && !l);
  }

  /* ---------------- opening (invariant 152) ---------------- */
  function blobOf(r, cb) {
    if (r.store === "papers") { P().get(r.id, function (err, b) { cb(err, b); }); return; }
    A().getByFileId(r.fileId, function (err, rec) {
      if (err || !rec) { cb(err || new Error("gone")); return; }
      if (!rec.blob) { cb(new Error(r.evicted ? "evicted" : "cloud")); return; }
      cb(null, rec.blob, rec);
    });
  }
  /* a picture as a one-page PDF, in memory, so it takes ink like a PDF */
  function imagePdf(blob) {
    return KOS.inkExport.pdfLib().then(function (L) {
      var png = /png/.test(blob.type), jpg = /jpe?g/.test(blob.type);
      var bytesP = png || jpg ? blob.arrayBuffer() : (window.createImageBitmap ? createImageBitmap(blob) : Promise.reject(new Error("unreadable"))).then(function (bm) {
        var c = document.createElement("canvas"), k = Math.min(1, 3000 / Math.max(bm.width, bm.height));
        c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k);
        c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height);
        if (bm.close) bm.close();
        return KOS.inkExport.canvasBlob(c).then(function (b) { c.width = 0; c.height = 0; png = true; return b.arrayBuffer(); });
      });
      return Promise.all([L.PDFDocument.create(), bytesP]).then(function (x) {
        var doc = x[0];
        return (png ? doc.embedPng(x[1]) : doc.embedJpg(x[1])).then(function (img) {
          var w = 595, h = Math.round(595 * img.height / img.width);
          doc.addPage([w, h]).drawImage(img, { x: 0, y: 0, width: w, height: h });
          return doc.save();
        });
      });
    }).then(function (bytes) { return new Blob([bytes], { type: "application/pdf" }); });
  }
  function topicRefs(r) { return r.links.filter(function (l) { return l.kind === "topic"; }).map(function (l) { return l.id; }); }
  function open(x, opts) {
    opts = opts || {};
    var r = typeof x === "string" ? get(x) : x;
    if (!r) { KOS.ui.toast("That file is not in the index any more.", true); return; }
    if (r.store === "files" && !r.hasBlob) { cloudOnly(r); return; }
    /* a past paper: the paper's own viewer, with its attempts and scheme */
    if (r.paper && r.sitting && KOS.examPractice && KOS.examPractice.openPaper && (r.pkind === "qp" || r.pkind === "ms")) {
      var pid = r.store === "papers" ? r.id : (r.alsoPaper || "f:" + r.fileId);
      var siblings = recs.filter(function (s) { return s.paper === r.paper && s.sitting === r.sitting && s !== r && (s.part || null) === (r.part || null); });
      var ms = siblings.filter(function (s) { return s.pkind === "ms"; })[0], qp = siblings.filter(function (s) { return s.pkind === "qp"; })[0];
      var idOf = function (s) { return s.store === "papers" ? s.id : (s.alsoPaper || "f:" + s.fileId); };
      if (r.pkind === "qp") KOS.examPractice.openPaper(r.paper, r.sitting, { qp: pid, ms: ms ? idOf(ms) : null });
      else KOS.examPractice.openScheme(r.paper, r.sitting, pid);
      void qp;
      return;
    }
    blobOf(r, function (err, blob) {
      if (err || !blob) { if (err && /cloud|evicted/.test(err.message)) cloudOnly(r); else KOS.ui.toast("That file is not readable here" + (err && err.message === "permission" ? ": the browser needs your permission to read that folder again." : "."), true); return; }
      var rec = { name: r.name, mime: r.mime || blob.type, blob: blob, fileId: r.store === "papers" ? r.id : r.fileId, subject: r.subject, ref: null };
      var refs = topicRefs(r);
      if (rec.mime === "application/pdf" && KOS.pdfView && opts.ink !== false) {
        KOS.pdfView.open({ title: r.name, kind: "file", fileId: rec.fileId, refs: refs, record: r, getBlob: function (cb) { cb(null, blob); } });
        return;
      }
      if (/^image\//.test(rec.mime) && KOS.pdfView && KOS.inkExport && opts.ink !== false) {
        var made = null;
        KOS.pdfView.open({ title: r.name, kind: "file", fileId: rec.fileId, refs: refs, record: r, image: true,
          getBlob: function (cb) { cb(null, blob); },
          getPdf: function (cb) { if (made) { cb(null, made); return; } imagePdf(blob).then(function (b) { made = b; cb(null, b); }, function (e) { cb(e); }); } });
        return;
      }
      A().openViewer(rec, { ink: false });
    });
  }
  /* FREED OR ON ANOTHER DEVICE (files plan §7, adjusted): the record, its
     text and its ink are still here; the binary downloads on request */
  function cloudOnly(r) {
    var el = KOS.ui.el, layers = writing(r);
    KOS.inkUI.dialog({ title: r.name, className: "k-files-clouddlg", hook: "files.cloud", render: function (body, close, foot) {
      var online = navigator.onLine !== false, signed = KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn();
      body.appendChild(el("p", { class: "k-drill-p", text: r.evicted ? "This file is safe in your cloud; its copy here was removed to free up space." : "This file's metadata synced, but its content is on another device or in your cloud." }));
      if (layers) body.appendChild(el("p", { class: "k-drill-p", text: "Your writing on it (" + layers + (layers === 1 ? " page" : " pages") + ") is kept on this device and opens with it." }));
      if (!online) body.appendChild(el("p", { class: "k-drill-p", "data-tone": "danger", text: "Downloading it needs a connection." }));
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Close", onclick: close }));
      if (online && signed && KOS.cloudsync && KOS.cloudsync.downloadFile) foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "files.download-cloud", text: "Download and open", onclick: function (e) {
        var b = e.currentTarget; b.disabled = true; b.textContent = "Downloading…";
        KOS.cloudsync.downloadFile(r.fileId, function (err) {
          if (err) { b.disabled = false; b.textContent = "Download and open"; KOS.ui.toast("Download failed: " + err.message, true); return; }
          close();
          refresh(function () { open(r.fileId); });
        });
      } }));
      else if (!signed) foot.appendChild(el("span", { class: "k-muted", text: "Sign in to cloud sync to download it." }));
    } });
  }

  /* open a raw store record (a topic's or an assignment's own list) */
  function openRec(raw) {
    if (!raw) return;
    var id = raw.fileId;
    if (id && get(id)) { open(id); return; }
    refresh(function () { if (id && get(id)) open(id); else A().openViewer(raw); });
  }
  /* "Remove" from one place: the link goes; the file is deleted only when
     nothing else links it, and only after a confirm (invariant 150) */
  function detach(raw, link, cb) {
    var links = A().linksOf(raw), others = links.filter(function (l) { return !(l.kind === link.kind && l.id === String(link.id)); });
    if (others.length) {
      A().removeLink(raw.fileId, link, function (err) {
        KOS.ui.toast(err ? "That didn't work — " + err.message : "Removed from here. It's still linked to " + others.map(linkLabel).slice(0, 2).join(", ") + ".", !!err);
        if (cb) cb(err);
      });
      return;
    }
    KOS.ui.confirm({ title: "Delete “" + raw.name + "”?", body: "Nothing else links this file, so removing it deletes it" + (writing(fromAttach(Object.assign({ links: [] }, raw))) ? " (your writing on it stays in your ink)" : "") + ".", danger: true, confirm: "Delete" }, function () {
      A().remove(raw.id, function (err) { KOS.ui.toast(err ? "Delete failed: " + err.message : "File deleted.", !!err); if (cb) cb(err); });
    });
  }

  /* ---------------- text inside files (§3, adjusted) ---------------- */
  var TDB = "kurenai-os-filetext" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), tdb = null;
  function topen(cb) {
    if (!window.indexedDB) { cb(new Error("no IndexedDB")); return; }
    if (tdb) { cb(null, tdb); return; }
    var rq = window.indexedDB.open(TDB, 1);
    rq.onupgradeneeded = function (e) { var d = e.target.result; if (!d.objectStoreNames.contains("text")) d.createObjectStore("text", { keyPath: "fileId" }); };
    rq.onsuccess = function () { tdb = rq.result; cb(null, tdb); };
    rq.onerror = function () { cb(rq.error || new Error("open failed")); };
  }
  function ttx(mode, fn, cb) {
    topen(function (err, d) {
      if (err) { if (cb) cb(err); return; }
      var t = d.transaction("text", mode), os = t.objectStore("text"), out = fn(os);
      t.oncomplete = function () { if (cb) cb(null, out && out.result !== undefined ? out.result : out); };
      t.onerror = function () { if (cb) cb(t.error); };
    });
  }
  var text = null, textLoading = false, queue = [], indexing = null, indexed = {};
  /* the text index in memory: {fileId: [page text]}, read once */
  function loadText(cb) {
    if (text) { if (cb) cb(null, text); return; }
    if (textLoading) { setTimeout(function () { loadText(cb); }, 80); return; }
    textLoading = true;
    ttx("readonly", function (os) { return os.getAll(); }, function (err, rows) {
      text = {};
      (rows || []).forEach(function (r) { text[r.fileId] = r.pages || []; indexed[r.fileId] = true; });
      textLoading = false;
      if (cb) cb(err || null, text);
    });
  }
  function textState(r) {
    if (!r) return "none";
    if (indexed[r.fileId]) return "done";
    if (indexing === r.fileId || queue.indexOf(r.fileId) >= 0) return "queued";
    return /pdf|^text\//.test(r.mime || "") ? "waiting" : "none";
  }
  var idle = window.requestIdleCallback ? function (fn) { window.requestIdleCallback(fn, { timeout: 1500 }); } : function (fn) { setTimeout(fn, 120); };
  /* queueIndexing({now}) — `now` starts at once (the Files page's own
     refresh waits a moment, so the page draws first) */
  function queueIndexing(o) {
    loadText(function () {
      recs.forEach(function (r) {
        if (indexed[r.fileId] || queue.indexOf(r.fileId) >= 0 || indexing === r.fileId || r.folder) return;
        if (!r.hasBlob || !/pdf|^text\/|markdown|json/.test(r.mime || "")) return;
        queue.push(r.fileId);
      });
      if (!indexing && queue.length) { if (o && o.now) nextIndex(); else setTimeout(nextIndex, 2500); }
    });
  }
  /* one file at a time, a page per idle slice, inside pdf.js's worker */
  function nextIndex() {
    if (indexing || !queue.length) return;
    var fid = queue.shift(), r = get(fid);
    if (!r) { nextIndex(); return; }
    indexing = fid;
    function finish(pages) {
      var row = { fileId: fid, pages: pages, at: Date.now(), n: pages.length };
      ttx("readwrite", function (os) { os.put(row); }, function () {
        text[fid] = pages; indexed[fid] = true; indexing = null;
        emit();
        idle(nextIndex);
      });
    }
    blobOf(r, function (err, blob) {
      if (err || !blob) { indexing = null; idle(nextIndex); return; }
      if (!/pdf/.test(r.mime || blob.type)) {
        blob.text().then(function (t) { finish([String(t).slice(0, 200000)]); }, function () { finish([]); });
        return;
      }
      if (!KOS.pdfView) { indexing = null; return; }
      KOS.pdfView.load(blob).then(function (pdf) {
        var pages = [], n = Math.min(pdf.numPages, 200);
        (function page(i) {
          if (i > n) { try { pdf.destroy(); } catch (e) { /* gone */ } finish(pages); return; }
          idle(function () {
            pdf.getPage(i).then(function (pg) { return pg.getTextContent(); }).then(function (tc) {
              pages.push(tc.items.map(function (it) { return it.str; }).join(" ").replace(/\s+/g, " ").trim().slice(0, 20000));
              page(i + 1);
            }, function () { pages.push(""); page(i + 1); });
          });
        })(1);
      }, function () { finish([]); });
    });
  }
  function textOf(fileId) { return text && text[fileId] ? text[fileId] : null; }

  /* ---------------- search (invariant 71) ---------------- */
  function norm(s) { return String(s == null ? "" : s).toLowerCase(); }
  /* search(q) → [{rec, where: "name"|"text", page, snippet}] — names and
     aliases at once; the text once its index has loaded (loadText) */
  function search(q, limit) {
    var ts = norm(q).trim().split(/\s+/).filter(Boolean);
    if (!ts.length) return [];
    var out = [];
    recs.forEach(function (r) {
      var hay = norm(r.name + " " + (r.aliases || []).join(" ") + " " + r.note + " " + (KIND_NAME[r.kind] || ""));
      if (ts.every(function (t) { return hay.indexOf(t) >= 0; })) { out.push({ rec: r, where: "name" }); return; }
      var pages = textOf(r.fileId);
      if (!pages) return;
      for (var i = 0; i < pages.length; i++) {
        var p = norm(pages[i]);
        if (ts.every(function (t) { return p.indexOf(t) >= 0; })) {
          var at = p.indexOf(ts[0]), raw = pages[i];
          out.push({ rec: r, where: "text", page: i + 1, snippet: (at > 40 ? "…" : "") + raw.slice(Math.max(0, at - 40), at + 80).trim() + "…" });
          return;
        }
      }
    });
    return out.slice(0, limit || 200);
  }

  /* ---------------- the Assistant (R4, decision G) ----------------
     Read tools only. file_text sends the pages asked for and no more;
     "Ask Kurenai about this page" in the viewer shows that text first. */
  function registerTools() {
    var T = KOS.ai && KOS.ai.tools;
    if (!T || !T.define) return;
    T.define("files_list", {
      desc: "The learner's files (Files page): name, kind, size, pages of text indexed, where each is linked. Filter by search text, kind or subject. Never the content.",
      category: "study", tier: "read", read: true,
      params: { q: { type: "string", maxLen: 80 }, kind: { type: "string", enum: KINDS }, subject: { type: "string", maxLen: 20 } },
      run: function (args, cb) {
        ready(function () {
          loadText(function () {
            var list = args.q ? search(args.q, 60).map(function (h) { return h.rec; }) : recs.slice();
            if (args.kind) list = list.filter(function (r) { return r.kind === args.kind; });
            if (args.subject) list = list.filter(function (r) { return r.subject === args.subject; });
            cb(null, { total: list.length, files: list.slice(0, 40).map(function (r) {
              var t = textOf(r.fileId);
              return { fileId: r.fileId, name: r.name, kind: r.kind, size: r.size, pages: t ? t.length : null, textIndexed: !!t,
                linked: r.links.map(linkLabel).slice(0, 6), deviceOnly: !!r.local };
            }) });
          });
        });
      } });
    T.define("file_text", {
      desc: "The text of pages of ONE file (from its PDF text layer; scans have none). Ask only for the pages needed: at most 10 pages, 12,000 characters.",
      category: "study", tier: "read", read: true,
      params: { fileId: { type: "string", required: true, maxLen: 80 }, from: { type: "integer", min: 1 }, to: { type: "integer", min: 1 } },
      run: function (args, cb) {
        ready(function () {
          loadText(function () {
            var r = get(args.fileId);
            if (!r) { cb(new Error("No file with that id.")); return; }
            var pages = textOf(r.fileId);
            if (!pages) { cb(null, { fileId: r.fileId, name: r.name, text: null, why: textState(r) === "queued" ? "still indexing" : "this file has no text layer (a scan or a picture)" }); return; }
            var from = Math.max(1, args.from || 1), to = Math.min(pages.length, args.to || from, from + 9), out = [], used = 0;
            for (var i = from; i <= to && used < 12000; i++) { var t = pages[i - 1].slice(0, 12000 - used); used += t.length; out.push({ page: i, text: t }); }
            cb(null, { fileId: r.fileId, name: r.name, pageCount: pages.length, pages: out });
          });
        });
      } });
  }

  /* ---------------- Share to KurenaiOS (Web Share Target) ----------------
     The service worker files what another app shared under the cache
     `kos-share-inbox`; the app takes it in here, once, into the Files page. */
  function takeShared(cb) {
    if (!window.caches) { if (cb) cb(null, []); return; }
    caches.open("kos-share-inbox").then(function (c) {
      return c.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return c.match(k).then(function (res) {
            return res.blob().then(function (b) {
              var name = decodeURIComponent(res.headers.get("x-name") || "Shared file");
              var f; try { f = new File([b], name, { type: res.headers.get("content-type") || b.type }); } catch (e) { f = b; }
              return c.delete(k).then(function () { return f; });
            });
          });
        }));
      });
    }).then(function (files) {
      if (!files.length) { if (cb) cb(null, []); return; }
      add(files, {}, function (err, res) { report(res); if (cb) cb(err, res); });
    }, function () { if (cb) cb(null, []); });
  }

  function boot() {
    registerTools();
    /* the index after the page has drawn; the text queue after that */
    setTimeout(function () { refresh(); }, 1200);
  }

  KOS.files = {
    KINDS: KINDS, KIND_NAME: KIND_NAME,
    ready: ready, refresh: refresh, all: all, get: get, linkedTo: linkedTo,
    add: add, named: named, dropTarget: dropTarget, report: report,
    open: open, openRec: openRec, detach: detach, blobOf: blobOf, imagePdf: imagePdf, cloudOnly: cloudOnly,
    linkLabel: linkLabel, openLink: openLink, writing: writing, inkPrefix: inkPrefix, badge: badge,
    loadText: loadText, textOf: textOf, textState: textState, search: search, indexNow: queueIndexing,
    takeShared: takeShared, boot: boot,
    /* tests */
    _build: build
  };
  boot();
})();
