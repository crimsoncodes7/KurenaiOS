/* Kurenai OS — core/exampapers.js
   The paper library (roadmap 5.8, docs/exams-plan.md §4.5, frame 29z):
   YOUR OWN copies of past papers and mark schemes, opened in the app and
   never sent anywhere.

   Storage is its own IndexedDB, `kurenai-os-papers` (decision as built:
   the topic attachments in `kurenai-os-files` replicate their metadata
   automatically, invariant 36, and ride the full backup — a paper library
   must do neither). Nothing here is in the state document, the cloud, a
   backup or the deploy (invariant 125): the past papers stay on the
   device that added them.

   Two ways in:
     · Add PDFs or a folder (every browser): the files are COPIED into the
       store, each matched to a sitting by its path or name;
     · Connect a folder (Chrome and Edge, the File System Access API): the
       folder's handle is kept and its files are read in place, no copy.
   A file matches by its path ("Past Papers/Maths (Edexcel)/A-level/Paper 2
   - Pure/Question Papers/2023-06 QP.pdf") or a name carrying the board
   code ("9MA0-01-2019-06 QP.pdf"); one that does not is listed, never
   dropped, and can be matched by hand.

   Teacher feedback photos (§16.6) live here too, keyed by the attempt.  */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var DB_NAME = "kurenai-os-papers" + ((KOS.dataMode && KOS.dataMode.suffix) || "");
  var FILES = "files", KV = "kv";
  var MAX_BYTES = 40 * 1024 * 1024;
  var db = null, listeners = [];

  function available() { return !!window.indexedDB; }
  function open(cb) {
    if (!available()) { cb(new Error("IndexedDB unavailable")); return; }
    if (db) { cb(null, db); return; }
    var rq = window.indexedDB.open(DB_NAME, 1);
    rq.onupgradeneeded = function (e) {
      var d = e.target.result;
      if (!d.objectStoreNames.contains(FILES)) {
        var os = d.createObjectStore(FILES, { keyPath: "id" });
        os.createIndex("paper", "paper", { unique: false });
        os.createIndex("attempt", "attempt", { unique: false });
      }
      if (!d.objectStoreNames.contains(KV)) d.createObjectStore(KV);
    };
    rq.onsuccess = function () { db = rq.result; cb(null, db); };
    rq.onerror = function () { cb(rq.error || new Error("open failed")); };
  }
  function tx(store, mode, fn, cb) {
    open(function (err, d) {
      if (err) { cb && cb(err); return; }
      var t = d.transaction(store, mode), os = t.objectStore(store), out;
      try { out = fn(os); } catch (e) { cb && cb(e); return; }
      t.oncomplete = function () { cb && cb(null, out && out.result !== undefined ? out.result : out); };
      t.onerror = function () { cb && cb(t.error || new Error("tx failed")); };
    });
  }
  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { /* a listener never breaks a write */ } }); }
  function genId() { return "pp" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* ---------------- matching (pure) ---------------- */
  var MONTHS = { january: "01", february: "02", march: "03", april: "04", may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12", jan: "01", jun: "06", nov: "11", oct: "10" };
  function match(path) {
    var p = String(path || "").replace(/\\/g, "/");
    if (!/\.pdf$/i.test(p)) return null;
    var name = p.split("/").pop();
    var subject = /computer science|\b75(17|16)\b|\baqa\b/i.test(p) ? "compsci"
      : /\bmaths?\b|mathematics|\b[98]ma0\b|edexcel/i.test(p) ? "maths"
      : /\bf2\d\d\b|\bocr\b/i.test(p) ? "it" : null;
    if (!subject) return null;
    var as = /\bas[- ]level\b|\bas\b(?! level)|8ma0|7516/i.test(p.replace(/\bas\b(?=[- ]level)/i, "AS-level"));
    var paperN = (/\bpaper\s*(\d)\b/i.exec(p) || /\b[98]ma0[-_\s\/]?0?(\d)\b/i.exec(p) || /\b751[67][-_\s\/](\d)\b/i.exec(p) || [])[1] || null;
    var sitting = null, ym = /\b(20\d\d)-(\d\d)\b/.exec(name) || /\b(20\d\d)[-_](\d\d)\b/.exec(p);
    if (ym) sitting = ym[1] + "-" + ym[2];
    else {
      var mw = /\b(january|february|march|april|may|june|july|october|november|jan|jun|oct|nov)\w*\s*(20\d\d)\b/i.exec(name);
      if (mw) sitting = mw[2] + "-" + MONTHS[mw[1].toLowerCase()];
      else if (/specimen/i.test(name)) sitting = "specimen";
      else if (/\bsample\b/i.test(name)) sitting = "sample";
    }
    var kind = /\bQP\d?\b|question paper/i.test(name) ? "qp" : /\bMS\d?\b|mark scheme/i.test(name) ? "ms"
      : /\bMA\b|model answers?/i.test(name) ? "ma" : /\bER\b|examiner/i.test(name) ? "er" : null;
    var part = /\(statistics\)/i.test(name) ? "S" : /\(mechanics\)/i.test(name) ? "M" : null;
    var paper = null;
    if (subject === "it") { var u = /\b(F2\d\d)\b/i.exec(p); paper = u ? "ocr-" + u[1].toLowerCase() : null; }
    else if (paperN) paper = subject === "compsci" ? "aqa-" + (as ? "7516" : "7517") + "-" + paperN : "edexcel-" + (as ? "8ma0" : "9ma0") + "-" + paperN;
    if (/mock/i.test(p)) return { subject: subject, paper: null, sitting: null, kind: kind, part: part, mock: true };
    return { subject: subject, paper: paper, sitting: sitting, kind: kind, part: part };
  }
  function matched(m) { return !!(m && m.paper && m.sitting && m.kind); }

  /* ---------------- the store ---------------- */
  function meta(r) {
    return { id: r.id, name: r.name, path: r.path, size: r.size || 0, paper: r.paper || null, sitting: r.sitting || null, kind: r.kind || null,
      part: r.part || null, subject: r.subject || null, added: r.added, linked: !!r.fh, attempt: r.attempt || null, photo: !!r.photo, mock: !!r.mock,
      hash: r.hash || null, cloud: !!r.cloud, hasBlob: !!(r.blob || r.fh) };
  }
  function list(cb) {
    tx(FILES, "readonly", function (os) { return os.getAll(); }, function (err, rows) {
      if (err) { cb(err, []); return; }
      var own = (rows || []).filter(function (r) { return !r.photo; }).map(meta);
      withCloudCopies(own, function (all) { cb(null, all); });
    });
  }
  /* A PAPER YOU OPTED INTO YOUR CLOUD (files plan §7): "Keep in my cloud"
     copies it into the synced file store (kind paper or scheme, linked to
     its sitting, origin papers:<id>), so its binary reaches your private
     bucket and your other devices. Those copies join the library here as
     ids "f:<fileId>" — unless this device holds the paper itself. Never
     the deploy (invariant 125). */
  function withCloudCopies(own, cb) {
    if (!KOS.attach || !KOS.attach.available || !KOS.attach.available()) { cb(own); return; }
    KOS.attach.listMeta(function (err, items) {
      if (err) { cb(own); return; }
      var have = {};
      own.forEach(function (r) { have[r.id] = true; if (r.hash) have["h:" + r.hash] = true; if (r.paper && r.sitting) have[r.paper + "|" + r.sitting + "|" + r.kind + "|" + (r.part || "")] = true; });
      (items || []).forEach(function (m) {
        var o = /^papers:(.+)$/.exec(m.origin || "");
        if (!o || have[o[1]] || (m.hash && have["h:" + m.hash])) return;
        var pl = (m.links || []).filter(function (l) { return l.kind === "paper"; })[0];
        if (!pl) return;
        var j = pl.id.lastIndexOf(":"), paper = pl.id.slice(0, j), sitting = pl.id.slice(j + 1);
        var kind = m.kind === "scheme" ? "ms" : "qp", part = (/\|([SM])$/.exec(m.note || "") || [])[1] || null;
        if (have[paper + "|" + sitting + "|" + kind + "|" + (part || "")]) return;
        own.push({ id: "f:" + m.fileId, name: m.name, path: m.name, size: m.size || 0, paper: paper, sitting: sitting, kind: kind, part: part,
          subject: /^aqa/.test(paper) ? "compsci" : /^edexcel/.test(paper) ? "maths" : /^ocr/.test(paper) ? "it" : null,
          added: m.added, linked: false, attempt: null, photo: false, mock: false, cloud: true, fileId: m.fileId, hasBlob: m.hasBlob });
      });
      cb(own);
    });
  }
  /* copy one paper into the synced store: cb(err, fileId) */
  function keepInCloud(id, cb) {
    get(id, function (err, blob, m) {
      if (err || !blob) { cb && cb(err || new Error("unreadable")); return; }
      var file;
      try { file = new File([blob], m.name || "paper.pdf", { type: "application/pdf" }); } catch (e) { file = blob; }
      var links = m.paper && m.sitting ? [{ kind: "paper", id: m.paper + ":" + m.sitting }] : [];
      KOS.attach.add("_", "_", file, function (e2, aid, info) {
        if (e2) { cb && cb(e2); return; }
        tx(FILES, "readwrite", function (os) {
          var rq = os.get(id);
          rq.onsuccess = function () { var r = rq.result; if (r) { r.cloud = true; os.put(r); } };
        }, function () { emit(); cb && cb(null, info && info.fileId); });
      }, { kind: m.kind === "ms" ? "scheme" : m.kind === "qp" ? "paper" : m.kind === "ma" ? "notes" : "handout", links: links, origin: "papers:" + id });
    });
  }
  /* NOTHING IS SKIPPED SILENTLY (files plan R0, invariant 153): every file
     gets an outcome and a reason in `report` — added and matched to a
     sitting, added for matching by hand (a school mock, a name with no
     sitting), added as its own kind (a model answer, an examiner's report),
     or skipped and why (not a PDF, over 40 MB, already here). */
  var KIND_NAME = { qp: "question paper", ms: "mark scheme", ma: "model answers", er: "examiner's report" };
  function outcomeOf(r) {
    if (r.mock) return { outcome: "added", why: "a school mock: match it to an assessment from the list" };
    if (matched(r)) return { outcome: "matched", why: KIND_NAME[r.kind] + " · " + r.sitting };
    return { outcome: "added", why: r.paper ? "no sitting in its name: match it by hand" : "no paper in its path or name: match it by hand" };
  }
  function rowFor(path, m, extra) {
    return Object.assign({ id: genId(), name: path.split("/").pop(), path: path, paper: m.paper || null, sitting: m.sitting || null,
      kind: m.kind || (m.mock ? "qp" : null), part: m.part || null, subject: m.subject || null, mock: !!m.mock, added: Date.now() }, extra);
  }
  /* add copied files: [{file, path}] → {added, matched, skipped, report} */
  function add(items, cb) {
    list(function (e0, have) {
      var seen = {};
      (have || []).forEach(function (h) { seen[h.path + "|" + h.size] = true; });
      var rows = [], skipped = 0, report = [];
      (items || []).forEach(function (it) {
        var f = it.file, path = it.path || (f && (f.webkitRelativePath || f.name)) || "";
        if (!f) return;
        if (!/\.pdf$/i.test(path)) { skipped++; report.push({ path: path, outcome: "skipped", why: "not a PDF" }); return; }
        if (f.size > MAX_BYTES) { skipped++; report.push({ path: path, outcome: "skipped", why: "over 40 MB" }); return; }
        if (seen[path + "|" + f.size]) { skipped++; report.push({ path: path, outcome: "skipped", why: "already in the library" }); return; }
        seen[path + "|" + f.size] = true;
        var r = rowFor(path, match(path) || {}, { name: f.name, size: f.size, blob: f });
        rows.push(r);
        report.push(Object.assign({ path: path }, outcomeOf(r)));
      });
      if (!rows.length) { cb && cb(null, { added: 0, matched: 0, skipped: skipped, report: report }); return; }
      tx(FILES, "readwrite", function (os) { rows.forEach(function (r) { os.put(r); }); }, function (err) {
        emit();
        cb && cb(err, { added: rows.length, matched: rows.filter(function (r) { return matched(r); }).length, skipped: skipped, report: report });
        /* each copy's SHA-256, in the background: the report never waits
           (files plan §3), and a paper already attached elsewhere is then
           shown as one file and its kind promoted (invariant 150) */
        if (!err) hashRows(rows.map(function (r) { return r.id; }));
      });
    });
  }
  function hashRows(ids) {
    if (!KOS.attach || !KOS.attach.hashOf || !ids.length) return;
    var id = ids.shift();
    tx(FILES, "readonly", function (os) { return os.get(id); }, function (err, r) {
      if (err || !r || !r.blob || r.hash) { setTimeout(function () { hashRows(ids); }, 30); return; }
      KOS.attach.hashOf(r.blob, function (h) {
        if (!h) { hashRows(ids); return; }
        tx(FILES, "readwrite", function (os) { var q = os.get(id); q.onsuccess = function () { if (q.result) { q.result.hash = h; os.put(q.result); } }; },
          function () { setTimeout(function () { hashRows(ids); }, 30); if (!ids.length) emit(); });
      });
    });
  }
  function get(id, cb) {
    var f = /^f:(.+)$/.exec(String(id || ""));
    if (f) {
      KOS.attach.getByFileId(f[1], function (err, rec) {
        if (err || !rec) { cb(err || new Error("not found")); return; }
        if (!rec.blob) { cb(new Error("cloud")); return; }
        cb(null, rec.blob, { id: id, name: rec.name, size: rec.size, cloud: true, fileId: rec.fileId });
      });
      return;
    }
    tx(FILES, "readonly", function (os) { return os.get(id); }, function (err, r) {
      if (err || !r) { cb(err || new Error("not found")); return; }
      if (r.blob) { cb(null, r.blob, meta(r)); return; }
      if (r.fh && r.fh.getFile) {
        var go = function () { r.fh.getFile().then(function (f) { cb(null, f, meta(r)); }, function (e) { cb(e); }); };
        if (r.fh.queryPermission) r.fh.queryPermission({ mode: "read" }).then(function (st) {
          if (st === "granted") go();
          else r.fh.requestPermission({ mode: "read" }).then(function (s2) { if (s2 === "granted") go(); else cb(new Error("permission")); }, cb);
        }, function () { go(); });
        else go();
        return;
      }
      cb(new Error("no file"));
    });
  }
  function setMatch(id, m, cb) {
    tx(FILES, "readwrite", function (os) {
      var rq = os.get(id);
      rq.onsuccess = function () {
        var r = rq.result;
        if (!r) return;
        r.paper = m.paper || null; r.sitting = m.sitting || null; r.kind = m.kind || r.kind || "qp";
        os.put(r);
      };
    }, function (err) { emit(); cb && cb(err); });
  }
  function remove(id, cb) {
    tx(FILES, "readwrite", function (os) { os.delete(id); }, function (err) { emit(); cb && cb(err); });
  }
  function usage(cb) {
    tx(FILES, "readonly", function (os) { return os.getAll(); }, function (err, rows) {
      rows = (rows || []).filter(function (r) { return !r.photo; });
      cb(err, { files: rows.length, bytes: rows.reduce(function (s, r) { return s + (r.blob ? r.size || 0 : 0); }, 0), linked: rows.filter(function (r) { return r.fh; }).length });
    });
  }
  /* the library by sitting: { "<paper>:<sitting>": {qp, ms} } of file ids */
  function bySitting(rows) {
    var out = {};
    (rows || []).forEach(function (r) {
      if (!matched(r)) return;
      var k = r.paper + ":" + r.sitting, o = out[k] || (out[k] = { qp: null, ms: null, parts: {} });
      if (r.part) (o.parts[r.part] = o.parts[r.part] || {})[r.kind] = r.id;
      if (!o[r.kind]) o[r.kind] = r.id;
    });
    return out;
  }

  /* ---------------- Connect a folder (Chrome and Edge) ---------------- */
  function canConnect() { return typeof window.showDirectoryPicker === "function"; }
  function walk(dir, prefix, out, done) {
    var it = dir.values(), pending = [];
    function step() {
      it.next().then(function (r) {
        if (r.done) { Promise.all(pending).then(function () { done(); }, function () { done(); }); return; }
        var h = r.value, path = prefix + h.name;
        if (h.kind === "directory") pending.push(new Promise(function (res) { walk(h, path + "/", out, res); }));
        else if (/\.pdf$/i.test(h.name)) out.push({ path: path, fh: h });
        step();
      }, function () { done(); });
    }
    step();
  }
  function connect(cb) {
    if (!canConnect()) { cb(new Error("unsupported")); return; }
    window.showDirectoryPicker({ mode: "read" }).then(function (dir) {
      var found = [];
      walk(dir, dir.name + "/", found, function () {
        list(function (e0, have) {
          var seen = {};
          (have || []).forEach(function (h) { seen[h.path] = true; });
          var rows = [], report = [];
          found.forEach(function (f) {
            if (seen[f.path]) { report.push({ path: f.path, outcome: "skipped", why: "already in the library" }); return; }
            var r = rowFor(f.path, match(f.path) || {}, { size: 0, fh: f.fh });
            rows.push(r);
            report.push(Object.assign({ path: f.path }, outcomeOf(r)));
          });
          tx(KV, "readwrite", function (os) { os.put(dir, "folder"); }, function () {
            tx(FILES, "readwrite", function (os) { rows.forEach(function (r) { os.put(r); }); }, function (err) {
              emit();
              cb(err, { added: rows.length, matched: rows.filter(matched).length, folder: dir.name, report: report });
            });
          });
        });
      });
    }, function (e) { cb(e && e.name === "AbortError" ? null : e, null); });
  }
  function folder(cb) { tx(KV, "readonly", function (os) { return os.get("folder"); }, function (err, d) { cb(err, d ? d.name : null); }); }

  /* ---------------- teacher feedback photos (§16.6) ---------------- */
  function putPhoto(attempt, file, cb) {
    if (!file || file.size > MAX_BYTES) { cb && cb(new Error("too big")); return; }
    var id = genId();
    tx(FILES, "readwrite", function (os) { os.put({ id: id, photo: true, attempt: attempt, name: file.name || "photo", size: file.size, blob: file, added: Date.now() }); },
      function (err) { emit(); cb && cb(err, id); });
  }
  function getPhoto(id, cb) {
    tx(FILES, "readonly", function (os) { return os.get(id); }, function (err, r) { cb(err || (!r ? new Error("gone") : null), r && r.blob); });
  }

  KOS.examPapers = {
    DB_NAME: DB_NAME, available: available, match: match, matched: matched, outcomeOf: outcomeOf, KIND_NAME: KIND_NAME,
    list: list, add: add, get: get, setMatch: setMatch, remove: remove, usage: usage, bySitting: bySitting,
    canConnect: canConnect, connect: connect, folder: folder,
    putPhoto: putPhoto, getPhoto: getPhoto, keepInCloud: keepInCloud, hashRows: hashRows,
    onChange: function (fn) { listeners.push(fn); }
  };
})();
