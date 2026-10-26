/* Kurenai OS — core/pdfview.js · KOS.pdfView
   The file viewer for PDFs (roadmap 6.4, design 30h–30j; docs/files-plan.md
   R1–R2): the PDF drawn in the app by pdf.js (assets/pdf/pdfjs/, vendored,
   Apache-2.0, loaded the first time a PDF opens), with an ink layer on
   every page.

   THE ORIGINAL IS NEVER CHANGED (files plan invariant 151). Writing is an
   ink doc of its own: `file:<fileId>:default` for a handout or a note, and
   one doc per ATTEMPT on a past paper, `paper:<fileId>:<attemptId>`, so a
   paper sat in January and sat again blank in April keeps both. The
   layer switcher lists the earlier attempts (read-only unless reopened)
   and "Start a fresh attempt" makes a new empty layer, never copying ink.
   Ink pages carry `n`, the PDF page they lie on, and the PDF's own
   proportions (ipad-plan decision C). On white paper the ink is drawn in
   Atelier Dawn (30q).

   CANVAS MEMORY ON iPAD SAFARI (files plan §4): a page's canvases exist
   only within about a screen of the view; off screen they are sized to
   nothing and removed, so WebKit frees them at once. The pixel ratio is 2
   with one pane, 1.5 with the mark scheme open, and no backing store
   exceeds 4096 px a side.

   PAPERS (30h–30j): Jump to a question from the paper's index (found in
   the PDF's own text, read in the background a page per idle slice), the
   Exam Room's clock with extra time, the mark scheme in a second pane
   with "Follow the question" (not while the clock runs), and the marking
   sheet: marks by question log ONE attempt (invariant 124) with the ink
   layer linked, and the ticked questions become redo items. Nothing here
   pays (invariant 129); the attempt logs its session as ever.

   Clip (asked for 26 October 2026): drag a box over any part of a page,
   and that region, with your writing on it, goes to a topic's notebook as
   a picture. Export: "Save a copy with my writing" (pdf-lib) makes a new
   PDF; the original is untouched.                                       */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var I = KOS.ink;
  function el() { return KOS.ui.el.apply(null, arguments); }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }

  /* ---------- pdf.js, loaded once ---------- */
  var libP = null;
  function base() { return new URL("assets/pdf/pdfjs/", document.baseURI).href; }
  function lib() {
    if (libP) return libP;
    libP = import(base() + "pdf.min.mjs").then(function (m) {
      m.GlobalWorkerOptions.workerSrc = base() + "pdf.worker.min.mjs";
      return m;
    }, function (e) { libP = null; throw new Error("The PDF reader could not be loaded — offline?"); });
    return libP;
  }
  function load(blob) {
    return Promise.all([lib(), blob.arrayBuffer()]).then(function (r) {
      return r[0].getDocument({ data: new Uint8Array(r[1]), cMapUrl: base() + "cmaps/", cMapPacked: true,
        standardFontDataUrl: base() + "standard_fonts/", wasmUrl: base() + "wasm/", isEvalSupported: false }).promise;
    });
  }

  /* ---------- the text of a PDF, read in the background ----------
     One page per idle slice, so a big import or a 30-page paper never
     blocks the page (files plan §3). Returns a promise per page. */
  var idle = window.requestIdleCallback ? function (fn) { window.requestIdleCallback(fn, { timeout: 800 }); } : function (fn) { setTimeout(fn, 60); };
  function textOf(pdf) {
    var pages = [], waiting = [], done = false;
    (function next(i) {
      if (i > pdf.numPages) { done = true; waiting.forEach(function (f) { f(); }); return; }
      idle(function () {
        pdf.getPage(i).then(function (pg) { return pg.getTextContent().then(function (tc) { return { pg: pg, tc: tc }; }); })
          .then(function (r) {
            var vw = r.pg.getViewport({ scale: 1 }).width;
            pages[i - 1] = r.tc.items.map(function (it) { return { s: it.str, x: it.transform[4] / vw, y: it.transform[5] }; });
            next(i + 1);
          }, function () { pages[i - 1] = []; next(i + 1); });
      });
    })(1);
    return { pages: pages, ready: function (fn) { if (done) fn(); else waiting.push(fn); } };
  }
  /* a question label's pages: AQA's "0 7 . 1" boxes and Edexcel's "7"
     at the left margin, read from the page's text. A label's pieces can
     sit a fraction of a point apart, so a line is every margin item within
     3 points of the first; the label must lead its line. Returns every
     page it leads a line on (a lone number can also be something else). */
  function questionPages(text, label) {
    var core = String(label).replace(/^Q/i, "");
    var aqa = /^(\d\d)\.?(\d)?$/.exec(core), edx = /^(\d{1,2})([a-z]?)$/i.exec(core), out = [];
    function leads(t, lab) { return t.indexOf(lab) === 0 && !/\d/.test(t.charAt(lab.length)); }
    for (var p = 0; p < text.length; p++) {
      var items = (text[p] || []).filter(function (it) { return it.x < 0.185 && it.s.trim(); }).slice().sort(function (a, b) { return b.y - a.y || a.x - b.x; });
      var lines = [];
      items.forEach(function (it) {
        var ln = lines.filter(function (l) { return Math.abs(l.y - it.y) < 3; })[0];
        if (ln) ln.parts.push(it); else lines.push({ y: it.y, parts: [it] });
      });
      var hit = lines.some(function (l) {
        l.parts.sort(function (a, b) { return a.x - b.x; });
        var t = l.parts.map(function (x) { return x.s; }).join("").replace(/\s+/g, "");
        /* "07.1" on the paper; "07" "1" in a mark scheme's Qu · Pt columns */
        if (aqa) return leads(t, aqa[1] + (aqa[2] ? "." + aqa[2] : "")) || (aqa[2] && leads(t, aqa[1] + aqa[2])) || (!aqa[2] && leads(t, aqa[1] + ".1"));
        /* Edexcel: the line's first piece is the number with its full
           stop ("7."), which a page number never has */
        return edx && l.parts[0].s.replace(/\s+/g, "") === edx[1] + ".";
      });
      if (hit) out.push(p);
    }
    return out;
  }
  function findQuestion(text, label) { var ps = questionPages(text, label); return ps.length ? ps[0] : null; }
  /* every label of a paper at once: questions run forward through the
     paper, so each takes its first candidate page at or after the last */
  function mapQuestions(text, labels) {
    var out = {}, at = 0;
    labels.forEach(function (lab) {
      var ps = questionPages(text, lab).filter(function (p) { return p >= at; });
      if (ps.length) { out[lab] = ps[0]; at = ps[0]; }
    });
    return out;
  }

  /* ---------- the ink layers of a file ---------- */
  function layersOf(prefix) {
    return I.docsWith(prefix).sort(function (a, b) { return (b.created || b.at || 0) - (a.created || a.at || 0); });
  }
  function stamp(ts) {
    var d = new Date(ts || Date.now());
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  /* ================= the viewer =================
     o: {title, getBlob(cb), fileId, kind: "paper" | "file" | "scheme",
         paper: {pid, sitting, subject, title} (a past paper's index entry),
         scheme: {title, getBlob(cb)}, refs: ["sid:ref"] (where clips go) } */
  function open(o) {
    o = o || {};
    var ink = o.kind !== "scheme";
    var prefix = (o.kind === "paper" ? "paper:" : "file:") + o.fileId + ":";
    var layers = ink ? layersOf(prefix) : [], docKey = null, readOnly = false;
    if (ink) {
      if (o.kind === "paper") { docKey = layers.length ? layers[0].key : prefix + I.uid(); }
      else docKey = prefix + "default";
    }
    var pdf = null, sizes = [], boxes = [], mounted = {}, layerPages = {}, text = null, qPage = {};
    var schemeOn = false, follow = true, cur = 0, destroyed = false, clipMode = false;
    var dk = KOS.inkUI.desk({ dprCap: 2 });
    var overlay = el("div", { class: "k-pv", "data-ui": "pv.viewer", role: "dialog", "aria-label": (o.title || "Document") + " viewer" });
    var head = el("div", { class: "k-pv-head", "data-ui": "pv.head" });
    var barSlot = el("div", { class: "k-pv-bar" });
    var thumbs = el("nav", { class: "k-pv-thumbs", "data-ui": "pv.thumbs", "aria-label": "Pages" });
    var stage = el("div", { class: "k-pv-stage", "data-ui": "pv.stage", tabindex: "0", "aria-label": "Pages of " + (o.title || "the document") });
    var pagesEl = el("div", { class: "k-pv-pages" });
    stage.appendChild(pagesEl);
    var schemePane = el("aside", { class: "k-pv-scheme", "data-ui": "pv.scheme", "aria-label": "Mark scheme", hidden: "" });
    var body = el("div", { class: "k-pv-body" }, [thumbs, stage, schemePane]);
    overlay.appendChild(head); overlay.appendChild(barSlot); overlay.appendChild(body);
    var status = el("p", { class: "k-pv-status", "aria-live": "polite" });
    pagesEl.appendChild(status);
    status.textContent = "Opening…";

    function close() {
      if (destroyed) return;
      destroyed = true;
      stopClock();
      Object.keys(mounted).forEach(function (i) { unmount(+i); });
      if (io) io.disconnect();
      if (tio) tio.disconnect();
      if (scheme) scheme.destroy();
      dk.destroy();
      if (unkey) unkey();
      if (pdf) { try { pdf.destroy(); } catch (e) { /* gone */ } }
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("hashchange", close);
      overlay.remove();
    }
    overlay.close = close;
    /* a navigation (Back, a notification, a link) leaves the viewer */
    window.addEventListener("hashchange", close);
    function onKey(e) {
      if (e.key === "Escape" && !document.querySelector(".k-dialog-overlay:not(.k-pv)")) { e.stopPropagation(); close(); return; }
      var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (typing) return;
      if (e.key === "PageDown") { e.preventDefault(); go(Math.min(sizes.length - 1, cur + 1)); }
      if (e.key === "PageUp") { e.preventDefault(); go(Math.max(0, cur - 1)); }
    }
    document.addEventListener("keydown", onKey, true);
    KOS.ui.openDialog(overlay, { label: (o.title || "Document") + " viewer" });
    var unkey = ink ? KOS.inkUI.shortcuts(dk, overlay) : null;

    /* ---------- the head ---------- */
    var clockEl = el("span", { class: "k-pv-clock k-mono", "data-ui": "pv.clock" });
    var pageInfo = el("span", { class: "k-pv-pageinfo k-mono", "aria-hidden": "true" });
    function paintHead() {
      head.innerHTML = "";
      head.appendChild(el("b", { class: "k-pv-title", text: o.title || "Document" }));
      head.appendChild(pageInfo);
      if (o.kind === "paper") head.appendChild(layerMenu());
      if (o.kind === "paper" && o.paper) head.appendChild(questionMenu());
      head.appendChild(el("span", { class: "k-spacer" }));
      if (o.kind === "paper") head.appendChild(clockArea());
      if (schemeOn) head.appendChild(followBox);
      if (o.scheme) head.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "pv.scheme-btn", "aria-pressed": String(schemeOn),
        text: clock && clock.running ? "Mark scheme · after you end" : schemeOn ? "Hide mark scheme" : "Mark scheme", disabled: clock && clock.running ? "" : null,
        title: clock && clock.running ? "Opens when you end and mark" : "", onclick: function () { setScheme(!schemeOn); } }));
      if (ink) head.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "pv.clip", "aria-pressed": String(clipMode), text: clipMode ? "Clipping · drag a box" : "Clip to notes",
        onclick: function () { clipMode = !clipMode; KOS.ui.state(stage, "clip", clipMode); paintHead(); if (clipMode) announce("Drag a box over the part of a page to clip."); } }));
      var more = [];
      if (ink) more.push({ label: "Save a copy with my writing", onSelect: exportCopy });
      more.push({ label: "Download the original", onSelect: function () { o.getBlob(function (err, b) { if (b) KOS.inkExport.deliver(b, safe(o.title) + ".pdf"); }); } });
      if (o.kind === "paper") more.push({ label: localDoc() ? "Sync this paper's writing" : "Keep this paper's writing on this device", onSelect: toggleLocal });
      head.appendChild(KOS.ui.menu({ label: "⋯", className: "k-btn--sm k-btn--quiet", align: "end", hint: "More", items: more }));
      head.appendChild(el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "pv.close", "aria-label": "Close the viewer", text: "✕", onclick: close }));
    }
    function safe(t) { return KOS.inkExport.safeName(t || "document"); }
    function localDoc() { var d = docKey && I.doc(docKey); return !!(d && d.local); }
    function toggleLocal() {
      var on = !localDoc();
      I.setDocMeta(docKey, { local: on || null });
      KOS.ui.toast(on ? "This attempt's writing stays on this device." : "This attempt's writing syncs with your other ink.");
      setTimeout(paintHead, 50);
    }

    /* ---------- layers: one per attempt (files plan §5, adjusted) ---------- */
    function layerMenu() {
      var cur = layers.filter(function (d) { return d.key === docKey; })[0];
      var label = cur ? (cur.title || "Attempt") + (readOnly ? " · read-only" : "") : "New attempt";
      var items = layers.map(function (d) {
        return { label: (d.key === docKey ? "✓ " : "") + (d.title || "Attempt") + (d.logged ? " · logged" : ""), onSelect: function () { setLayer(d.key, d !== layers[0]); } };
      });
      if (readOnly) items.unshift({ label: "Reopen this attempt to write on it", onSelect: function () { readOnly = false; repaintInk(); paintHead(); } });
      items.push({ label: "Start a fresh attempt", onSelect: function () {
        docKey = prefix + I.uid(); readOnly = false;
        repaintInk(); paintHead();
        announce("A fresh attempt: a clean paper. Earlier attempts are kept.");
      } });
      return KOS.ui.menu({ label: label, className: "k-btn--sm", align: "start", hint: "Your attempts on this paper", items: items });
    }
    function setLayer(key, ro) {
      docKey = key; readOnly = !!ro;
      repaintInk(); paintHead();
      announce(readOnly ? "An earlier attempt, read-only." : "Your latest attempt.");
    }
    var metaDone = {};
    dk.onChange(function () {
      if (!docKey || metaDone[docKey]) return;
      var any = Object.keys(layerPages).some(function (n) { return layerPages[n].items.length; });
      if (!any) return;
      metaDone[docKey] = true;
      var d = I.doc(docKey);
      if (!d || !d.title) I.setDocMeta(docKey, { title: (o.kind === "paper" ? "Attempt · " : "My writing · ") + stamp(), file: o.fileId, kind: o.kind, created: Date.now() }, function () { layers = layersOf(prefix); paintHead(); });
    });

    /* ---------- the clock (the Exam Room's, 29t) ---------- */
    var clock = null, clockT = null;
    function minsFor() {
      var pr = (window.KOS_EXAM_PRESETS && KOS_EXAM_PRESETS.papers || []).filter(function (p) { return o.paper && p.id === o.paper.pid; })[0];
      var mins = pr && pr.mins ? pr.mins : 120;
      var extra = KOS.exams && KOS.exams.prefs ? KOS.exams.prefs().extraTime || 0 : 0;
      return { mins: Math.round(mins * (1 + extra / 100)), extra: extra };
    }
    function clockArea() {
      var box = el("span", { class: "k-pv-clockbox" });
      if (!clock) {
        var m = minsFor();
        box.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "pv.start-timed", text: "Start timed · " + hm(m.mins) + (m.extra ? " (+" + m.extra + "%)" : ""), onclick: function () {
          clock = { left: m.mins * 60000, running: true, at: Date.now(), mins: m.mins, pauses: 0, warned: {} };
          tickClock(); clockT = setInterval(tickClock, 1000);
          if (schemeOn) setScheme(false);
          paintHead();
          announce("Timed. " + hm(m.mins) + ".");
        } }));
        if (o.paper) box.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-ui": "pv.mark", text: "Mark", onclick: function () { markSheet(false); } }));
        return box;
      }
      box.appendChild(clockEl);
      box.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "pv.pause", text: clock.running ? "Pause" : "Resume", onclick: function () {
        if (clock.running) { clock.left -= Date.now() - clock.at; clock.running = false; clock.pauses++; }
        else { clock.running = true; clock.at = Date.now(); }
        paintHead(); tickClock();
      } }));
      box.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-ui": "pv.end", text: "End and mark", onclick: function () {
        if (clock.running) { clock.left -= Date.now() - clock.at; clock.running = false; }
        stopClock(); paintHead(); markSheet(true);
      } }));
      tickClock();
      return box;
    }
    function hm(m) { return m >= 60 ? Math.floor(m / 60) + "h" + (m % 60 ? " " + (m % 60) + "m" : "") : m + " min"; }
    function tickClock() {
      if (!clock) return;
      var left = clock.running ? clock.left - (Date.now() - clock.at) : clock.left;
      left = Math.max(0, left);
      var mins = Math.ceil(left / 60000);
      /* once a minute until the last ten (29t) */
      clockEl.textContent = mins > 10 ? hm(mins) + " left" : Math.floor(left / 60000) + ":" + String(Math.floor(left % 60000 / 1000)).padStart(2, "0");
      KOS.ui.state(clockEl, "low", mins <= 10);
      [15, 10, 5].forEach(function (w) { if (mins === w && !clock.warned[w]) { clock.warned[w] = true; announce(w + " minutes left."); } });
      if (!left && clock.running) { clock.running = false; clock.left = 0; announce("Time."); paintHead(); }
    }
    function stopClock() { clearInterval(clockT); clockT = null; }

    /* ---------- Jump to a question ---------- */
    function questions() {
      var ix = window.KOS_EXAMS && KOS_EXAMS.index;
      if (!ix || !o.paper) return [];
      return ix.questions.filter(function (q) { return q[0] === o.paper.pid && q[1] === o.paper.sitting; })
        .map(function (q) { return { label: q[3], marks: q[4], leaves: q[5] || [], section: q[2] }; });
    }
    function questionMenu() {
      var qs = questions();
      if (!qs.length) return el("span");
      return KOS.ui.menu({ label: "Jump to a question", className: "k-btn--sm", align: "start", hint: "From the paper's index", items: qs.map(function (q) {
        var p = qPage[q.label];
        return { label: q.label + " · " + q.marks + (q.marks === 1 ? " mark" : " marks") + (p == null ? (text ? " · set its page" : "") : " · page " + (p + 1)), onSelect: function () {
          if (qPage[q.label] == null) {
            if (!text) { KOS.ui.toast("Still reading the paper's text; try again in a moment."); return; }
            qPage[q.label] = cur;
            KOS.ui.toast(q.label + " set to page " + (cur + 1) + ", the page in view.");
            return;
          }
          go(qPage[q.label]);
          announce("Page " + (qPage[q.label] + 1) + " of " + sizes.length + ". Question " + q.label.replace(/^Q0?/, "") + ".");
        } };
      }) });
    }
    function questionOn(page) {
      var best = null;
      Object.keys(qPage).forEach(function (k) { if (qPage[k] != null && qPage[k] <= page && (best == null || qPage[k] >= qPage[best])) best = k; });
      return best;
    }

    /* ---------- pages ---------- */
    var io = null, tio = null;
    function dpr() { return schemeOn ? 1.5 : 2; }
    function pageBox(i) {
      var s = sizes[i];
      var b = el("div", { class: "k-pv-page", "data-ui": "pv.page", "data-n": String(i), role: "img", "aria-label": "Page " + (i + 1) });
      b.style.setProperty("--pv-ar", (s.w / s.h).toFixed(5));
      return b;
    }
    function inkPage(i) {
      if (layerPages[i]) return layerPages[i];
      var h = Math.round(I.W * sizes[i].h / sizes[i].w);
      var p = I.blankPage(docKey, "none", h);
      p.n = i;
      layerPages[i] = p;
      return p;
    }
    function mount(i) {
      if (mounted[i] || destroyed || !pdf) return;
      var b = boxes[i], m = mounted[i] = { canvas: el("canvas", { class: "k-pv-canvas", "aria-hidden": "true" }), task: null, sf: null };
      b.appendChild(m.canvas);
      pdf.getPage(i + 1).then(function (pg) {
        if (mounted[i] !== m) return;
        var vp1 = pg.getViewport({ scale: 1 }), cssW = b.clientWidth || 600, cssH = cssW * vp1.height / vp1.width;
        var k = Math.min(dpr(), 4096 / cssW, 4096 / cssH);
        var vp = pg.getViewport({ scale: cssW / vp1.width * k });
        m.canvas.width = Math.round(vp.width); m.canvas.height = Math.round(vp.height);
        m.task = pg.render({ canvasContext: m.canvas.getContext("2d"), viewport: vp });
        m.task.promise.catch(function () { /* cancelled */ });
      });
      if (ink && docKey) {
        var host = el("div", { class: "k-ink-page k-pv-ink", "data-paper": "none", "data-theme": "atelier-dawn" });
        b.appendChild(host);
        m.host = host;
        m.sf = KOS.inkUI.surface(host, inkPage(i), dk, { readOnly: readOnly || clipMode, dprCap: dpr() });
      }
    }
    function unmount(i) {
      var m = mounted[i];
      if (!m) return;
      delete mounted[i];
      if (m.task) { try { m.task.cancel(); } catch (e) { /* done */ } }
      m.canvas.width = 0; m.canvas.height = 0;
      m.canvas.remove();
      if (m.sf) m.sf.destroy();
      if (m.host) m.host.remove();
    }
    function repaintInk() {
      layers = layersOf(prefix);
      layerPages = {};
      Object.keys(mounted).forEach(function (i) { unmount(+i); });
      var doIt = function () {
        boxes.forEach(function (b, i) { var r = b.getBoundingClientRect(); if (r.bottom > -window.innerHeight && r.top < window.innerHeight * 2) mount(i); });
        paintThumbDots();
      };
      if (!docKey || !I.doc(docKey)) { doIt(); return; }
      I.listPages(docKey, function (err, pages) {
        (pages || []).forEach(function (p) { if (p.n != null) layerPages[p.n] = p; });
        doIt();
      });
    }
    function go(i) {
      var b = boxes[i];
      if (b && b.scrollIntoView) b.scrollIntoView({ block: "start" });
      cur = i;
      paintCurrent();
    }
    function paintCurrent() {
      pageInfo.textContent = sizes.length ? "Page " + (cur + 1) + " of " + sizes.length : "";
      [].forEach.call(thumbs.children, function (t, i) { if (t.setAttribute) t.setAttribute("aria-current", i === cur ? "true" : "false"); });
      if (schemeOn && follow && scheme) scheme.follow(questionOn(cur));
    }
    stage.addEventListener("scroll", function () {
      var best = 0, most = -Infinity, sr = stage.getBoundingClientRect();
      boxes.forEach(function (b, i) { var r = b.getBoundingClientRect(), v = Math.min(r.bottom, sr.bottom) - Math.max(r.top, sr.top); if (v > most) { most = v; best = i; } });
      if (best !== cur) { cur = best; paintCurrent(); }
    }, { passive: true });

    /* ---------- thumbnails (✎ where there is ink) ---------- */
    function buildThumbs() {
      thumbs.innerHTML = "";
      sizes.forEach(function (s, i) {
        var t = el("button", { type: "button", class: "k-pv-thumb", "data-ui": "pv.thumb", "data-n": String(i), "aria-label": "Page " + (i + 1), onclick: function () { go(i); } }, [
          el("span", { class: "k-pv-thumb-paper" }), el("span", { class: "k-pv-thumb-n k-mono", text: String(i + 1) }), el("span", { class: "k-pv-thumb-dot", "aria-hidden": "true", text: "✎" })]);
        t.querySelector(".k-pv-thumb-paper").style.setProperty("--pv-ar", (s.w / s.h).toFixed(5));
        thumbs.appendChild(t);
      });
      if (typeof IntersectionObserver === "function") {
        tio = new IntersectionObserver(function (en) {
          en.forEach(function (e) {
            var i = +e.target.getAttribute("data-n"), slot = e.target.querySelector(".k-pv-thumb-paper"), c = slot.querySelector("canvas");
            if (e.isIntersecting && !c) {
              c = el("canvas", { "aria-hidden": "true" }); slot.appendChild(c);
              pdf.getPage(i + 1).then(function (pg) {
                if (!c.isConnected) return;
                var v1 = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: 110 / v1.width });
                c.width = Math.round(vp.width); c.height = Math.round(vp.height);
                pg.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise.catch(function () {});
              });
            } else if (!e.isIntersecting && c) { c.width = 0; c.height = 0; c.remove(); }
          });
        }, { root: thumbs, rootMargin: "400px 0px" });
        [].forEach.call(thumbs.children, function (t) { tio.observe(t); });
      }
      paintThumbDots();
    }
    function paintThumbDots() {
      [].forEach.call(thumbs.children, function (t, i) { KOS.ui.state(t, "ink", !!(layerPages[i] && layerPages[i].items.length)); });
    }
    dk.onChange(paintThumbDots);

    /* ---------- the mark scheme pane (30i) ---------- */
    var scheme = null;
    function setScheme(on) {
      if (on && clock && clock.running) { KOS.ui.toast("The mark scheme opens when you end and mark."); return; }
      schemeOn = on;
      schemePane.hidden = !on;
      KOS.ui.state(overlay, "scheme", on);
      if (on && !scheme) scheme = schemeViewer(schemePane, o.scheme, function () { follow = false; paintFollow(); }, questions().map(function (q) { return q.label; }));
      if (!on && scheme) { scheme.destroy(); scheme = null; }
      /* the pixel ratio drops with two panes: redraw what is mounted */
      Object.keys(mounted).forEach(function (i) { unmount(+i); });
      boxes.forEach(function (b, i) { var r = b.getBoundingClientRect(); if (r.bottom > 0 && r.top < window.innerHeight * 1.5) mount(i); });
      paintHead();
      if (on) { announce("Mark scheme open" + (questionOn(cur) ? " at question " + questionOn(cur).replace(/^Q0?/, "") : "") + "."); paintCurrent(); }
    }
    var followBox = el("label", { class: "k-pv-follow" }, [el("input", { type: "checkbox", class: "k-box", checked: "", "data-ui": "pv.follow", onchange: function (e) { follow = e.target.checked; if (follow) paintCurrent(); } }), el("span", { text: "Follow the question" })]);
    function paintFollow() { followBox.querySelector("input").checked = follow; }

    /* ---------- marking the paper (30j) ---------- */
    function markSheet(timed) {
      var qs = questions();
      if (!qs.length) { KOS.ui.toast("This paper has no questions in the index: log it from Practice instead."); return; }
      var marks = {}, redo = {};
      KOS.inkUI.dialog({ title: "Mark it · " + (o.paper.title || o.title), className: "k-pv-markdlg", wide: true, hook: "pv.marking", render: function (body, closeIt, foot) {
        body.appendChild(el("p", { class: "k-drill-p", text: "Enter the marks for each question against your scheme. A question that lost three or more marks is ticked for Redo; choose the rest." }));
        var table = el("div", { class: "k-pv-marks", role: "table", "aria-label": "Marks by question" });
        body.appendChild(table);
        var total = el("b", { class: "k-mono", "aria-live": "polite" });
        function sum() {
          var got = 0, max = 0;
          qs.forEach(function (q) { max += q.marks; if (marks[q.label] != null) got += marks[q.label]; });
          total.textContent = got + " / " + max;
          return { got: got, max: max };
        }
        function row(q) {
          var r = el("div", { class: "k-pv-mrow", role: "row" });
          function paint() {
            r.innerHTML = "";
            var v = marks[q.label], lost = v == null ? null : q.marks - v;
            var num = el("input", { type: "number", class: "k-input k-pv-mnum", min: "0", max: String(q.marks), value: v == null ? "" : String(v), "aria-label": "Marks for " + q.label, "data-ui": "pv.mnum" });
            num.addEventListener("change", function () { set(num.value === "" ? null : Math.max(0, Math.min(q.marks, parseInt(num.value, 10) || 0))); });
            function set(nv) {
              marks[q.label] = nv;
              if (nv != null && q.marks - nv >= 3 && redo[q.label] == null) redo[q.label] = true;
              if (nv != null && nv >= q.marks) redo[q.label] = false;
              paint(); sum();
              announce("Question " + q.label.replace(/^Q0?/, "") + ": " + (nv == null ? "unmarked" : nv + " of " + q.marks) + ".");
            }
            r.appendChild(el("button", { type: "button", class: "k-pv-mq k-mono", text: q.label, title: "See its page", onclick: function () { if (qPage[q.label] != null) go(qPage[q.label]); } }));
            r.appendChild(el("button", { type: "button", class: "k-qz-step", "aria-label": "One mark fewer", text: "−", onclick: function () { set(Math.max(0, (v == null ? q.marks : v) - 1)); } }));
            r.appendChild(num);
            r.appendChild(el("button", { type: "button", class: "k-qz-step", "aria-label": "One mark more", text: "+", onclick: function () { set(Math.min(q.marks, (v == null ? -1 : v) + 1)); } }));
            r.appendChild(el("span", { class: "k-mono k-muted", text: "/ " + q.marks }));
            r.appendChild(lost ? el("span", { class: "k-pv-lost k-mono", "data-tone": lost >= 3 ? "danger" : null, text: (lost >= 3 ? "▼ " : "") + "−" + lost }) : el("span", { class: "k-pv-lost k-muted", text: v != null ? "✓ full" : "" }));
            if (lost) {
              var cb = el("input", { type: "checkbox", class: "k-box", "aria-label": "Redo " + q.label, onchange: function () { redo[q.label] = cb.checked; } });
              cb.checked = !!redo[q.label];
              r.appendChild(el("label", { class: "k-pv-redo" }, [cb, el("span", { text: "Redo" })]));
            } else r.appendChild(el("span"));
          }
          paint();
          return r;
        }
        qs.forEach(function (q) { table.appendChild(row(q)); });
        sum();
        foot.appendChild(el("span", {}, [el("span", { class: "k-muted", text: "Total " }), total]));
        foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: closeIt }));
        foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "pv.log", text: "Log one attempt", onclick: function () {
          var miss = qs.filter(function (q) { return marks[q.label] == null; })[0];
          if (miss) { KOS.ui.toast("Mark question " + miss.label.replace(/^Q0?/, "") + " (or set it to 0)."); return; }
          var s = sum(), spent = clock ? Math.round((clock.mins * 60000 - Math.max(0, clock.left)) / 60000) : null;
          var e = KOS.tracker.add({
            kind: "paper", paper: o.paper.title + " · " + (KOS.examIndex ? KOS.examIndex.sittingLabel(o.paper.sitting) : o.paper.sitting), topic: o.paper.title, subject: o.paper.subject,
            marks: s.got, max: s.max, date: KOS.srs.todayISO(), role: "practice",
            source: { kind: "past-paper", ref: o.paper.pid + ":" + o.paper.sitting },
            timed: !!timed, mins: timed ? spent : null, conditions: timed ? "exam" : "untimed",
            questions: qs.map(function (q) { return { q: q.label, max: q.marks, got: marks[q.label], refs: q.leaves, redo: !!redo[q.label] }; }),
            notes: clock && clock.pauses ? "Pauses: " + clock.pauses : ""
          });
          if (docKey && I.doc(docKey)) I.setDocMeta(docKey, { logged: Date.now(), attemptUid: e.uid, marks: s.got, max: s.max }, function () { layers = layersOf(prefix); paintHead(); });
          closeIt();
          var nRedo = qs.filter(function (q) { return redo[q.label]; }).length;
          announce("Logged: " + s.got + " of " + s.max + (nRedo ? ", " + nRedo + " redo item" + (nRedo === 1 ? "" : "s") : "") + ".");
          KOS.ui.toast("Logged " + s.got + " / " + s.max + (nRedo ? " · " + nRedo + " to redo" : "") + ".");
        } }));
      } });
    }

    /* ---------- Clip to notes: a region of a page → a topic's notebook ---------- */
    var drag = null, rectEl = null;
    stage.addEventListener("pointerdown", function (e) {
      if (!clipMode) return;
      var b = e.target.closest(".k-pv-page");
      if (!b || b.closest(".k-pv-scheme")) return;
      e.preventDefault(); e.stopPropagation();
      var r = b.getBoundingClientRect();
      drag = { b: b, r: r, x0: e.clientX - r.left, y0: e.clientY - r.top };
      rectEl = el("div", { class: "k-pv-cliprect", "aria-hidden": "true" });
      b.appendChild(rectEl);
      try { stage.setPointerCapture(e.pointerId); } catch (x) { /* refused */ }
    }, true);
    stage.addEventListener("pointermove", function (e) {
      if (!drag) return;
      e.stopPropagation();
      var x = Math.max(0, Math.min(drag.r.width, e.clientX - drag.r.left)), y = Math.max(0, Math.min(drag.r.height, e.clientY - drag.r.top));
      drag.x1 = x; drag.y1 = y;
      rectEl.style.setProperty("--cx", Math.min(drag.x0, x) + "px"); rectEl.style.setProperty("--cy", Math.min(drag.y0, y) + "px");
      rectEl.style.setProperty("--cw", Math.abs(x - drag.x0) + "px"); rectEl.style.setProperty("--ch", Math.abs(y - drag.y0) + "px");
    }, true);
    stage.addEventListener("pointerup", function (e) {
      if (!drag) return;
      e.stopPropagation();
      var d = drag; drag = null;
      if (rectEl) { rectEl.remove(); rectEl = null; }
      if (d.x1 == null || Math.abs(d.x1 - d.x0) < 12 || Math.abs(d.y1 - d.y0) < 12) return;
      var i = +d.b.getAttribute("data-n");
      var fx = Math.min(d.x0, d.x1) / d.r.width, fy = Math.min(d.y0, d.y1) / d.r.height, fw = Math.abs(d.x1 - d.x0) / d.r.width, fh = Math.abs(d.y1 - d.y0) / d.r.height;
      clipRegion(i, { x: fx, y: fy, w: fw, h: fh });
    }, true);
    function clipRegion(i, f) {
      pdf.getPage(i + 1).then(function (pg) {
        var v1 = pg.getViewport({ scale: 1 }), W = 1600, vp = pg.getViewport({ scale: W / v1.width });
        var full = document.createElement("canvas");
        full.width = Math.round(vp.width); full.height = Math.round(vp.height);
        /* "print" renders without waiting on animation frames: a clip is
           drawn off screen, and must finish in a background tab too */
        return pg.render({ canvasContext: full.getContext("2d"), viewport: vp, intent: "print" }).promise.then(function () { return full; });
      }).then(function (full) {
        /* your writing on top, in Dawn on the white page */
        var p = layerPages[i];
        if (p && p.items.length) {
          var host = el("div", { class: "k-ink-exporthost", "data-theme": "atelier-dawn" });
          document.body.appendChild(host);
          var pal = KOS.inkUI.palette(host);
          host.remove();
          var ctx = full.getContext("2d"), k = full.width / I.W;
          ctx.setTransform(k, 0, 0, k, 0, 0); ctx.__inkScale = k;
          KOS.inkUI.drawItems(ctx, p.items, pal, function () {});
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        var cw = Math.max(1, Math.round(f.w * full.width)), ch = Math.max(1, Math.round(f.h * full.height));
        var cut = document.createElement("canvas");
        cut.width = cw; cut.height = ch;
        cut.getContext("2d").drawImage(full, Math.round(f.x * full.width), Math.round(f.y * full.height), cw, ch, 0, 0, cw, ch);
        full.width = 0; full.height = 0;
        var src = cut.toDataURL("image/png");
        var wUnits = Math.min(I.W * 0.86, f.w * I.W * 1.1), hUnits = wUnits * ch / cw;
        chooseTopic(i, function (key, label) {
          I.appendImage(I.topicDoc(key.split(":")[0], key.slice(key.indexOf(":") + 1)), { w: Math.round(wUnits), h: Math.round(Math.min(hUnits, I.H * 0.7)), src: src, clip: { file: o.fileId, page: i + 1 } },
            function (err) {
              KOS.ui.toast(err ? "The clip could not be saved — " + err.message : "Clipped to " + label + "'s notebook.", !!err);
              announce(err ? "The clip could not be saved." : "Clipped to " + label + "'s Handwritten tab.");
            });
        });
      }).catch(function (e) { KOS.ui.toast("That part could not be clipped — " + e.message, true); });
    }
    /* where a clip goes: the topics of the question on that page, the
       file's own topics, or any topic you pick */
    function chooseTopic(i, cb) {
      var keys = [];
      var q = questionOn(i);
      if (q) questions().forEach(function (x) { if (x.label === q) keys = keys.concat(x.leaves); });
      (o.refs || []).forEach(function (r) { if (keys.indexOf(r) < 0) keys.push(r); });
      keys = keys.filter(function (k, j) { return keys.indexOf(k) === j; });
      KOS.inkUI.dialog({ title: "Clip to which topic?", className: "k-pv-clipdlg", render: function (body, closeIt) {
        if (keys.length) body.appendChild(el("p", { class: "k-drill-p", text: q ? "The topics " + q + " is about:" : "This file's topics:" }));
        keys.forEach(function (k) {
          var n = KOS.spec.node ? KOS.spec.node(k) : null;
          body.appendChild(el("button", { type: "button", class: "k-btn k-pv-topicbtn", text: (n ? n.ref + " · " + n.title : k), onclick: function () { closeIt(); cb(k, n ? n.ref : k); } }));
        });
        if (typeof KOS.topicPicker === "function") {
          var picker = KOS.topicPicker({ label: keys.length ? "Or another topic" : "A topic", multi: false, levels: ["leaf"], value: [],
            onChange: function (refs) { var k = (refs || [])[0]; if (k) { closeIt(); var n = KOS.spec.node ? KOS.spec.node(k) : null; cb(k, n ? n.ref : k.slice(k.indexOf(":") + 1)); } } });
          body.appendChild(picker.el);
        }
      } });
    }

    /* ---------- Save a copy with my writing (pdf-lib) ---------- */
    function exportCopy() {
      var pages = Object.keys(layerPages).filter(function (n) { return layerPages[n].items.length; });
      if (!pages.length) { KOS.ui.toast("Nothing written on this layer yet."); return; }
      KOS.ui.toast("Making the copy…");
      Promise.all([KOS.inkExport.pdfLib(), new Promise(function (res, rej) { o.getBlob(function (err, b) { if (err || !b) rej(err || new Error("unreadable")); else res(b); }); })])
        .then(function (r) { return r[1].arrayBuffer().then(function (buf) { return r[0].PDFDocument.load(buf).then(function (doc) { return { L: r[0], doc: doc }; }); }); })
        .then(function (x) {
          var host = el("div", { class: "k-ink-exporthost", "data-theme": "atelier-dawn" });
          document.body.appendChild(host);
          var pal = KOS.inkUI.palette(host);
          host.remove();
          var chain = Promise.resolve();
          pages.forEach(function (n) {
            chain = chain.then(function () {
              var p = layerPages[n], c = document.createElement("canvas"), k = 1600 / I.W;
              c.width = 1600; c.height = Math.round(I.pageH(p) * k);
              var ctx = c.getContext("2d"); ctx.setTransform(k, 0, 0, k, 0, 0); ctx.__inkScale = k;
              KOS.inkUI.drawItems(ctx, p.items, pal, function () {});
              return KOS.inkExport.canvasBlob(c).then(function (b) { return b.arrayBuffer(); }).then(function (buf) { return x.doc.embedPng(buf); }).then(function (img) {
                var pg = x.doc.getPage(+n), sz = pg.getSize();
                pg.drawImage(img, { x: 0, y: 0, width: sz.width, height: sz.height });
                c.width = 0; c.height = 0;
              });
            });
          });
          return chain.then(function () { return x.doc.save(); });
        })
        .then(function (bytes) { return KOS.inkExport.deliver(new Blob([bytes], { type: "application/pdf" }), safe(o.title) + " (with my writing).pdf"); })
        .catch(function (e) { KOS.ui.toast("The copy could not be made — " + e.message, true); });
    }

    /* ---------- open ---------- */
    if (ink) {
      var barWrap = KOS.inkUI.dockable(dk, {});
      barSlot.appendChild(barWrap);
    }
    paintHead();
    o.getBlob(function (err, blob) {
      if (err || !blob) { status.textContent = "This file is not readable here" + (err && err.message === "permission" ? ": the browser needs your permission to read that folder again." : "."); return; }
      load(blob).then(function (doc) {
        if (destroyed) { doc.destroy(); return; }
        pdf = doc;
        var all = [];
        for (var i = 1; i <= doc.numPages; i++) all.push(doc.getPage(i).then(function (pg) { var v = pg.getViewport({ scale: 1 }); return { w: v.width, h: v.height }; }));
        return Promise.all(all).then(function (sz) {
          sizes = sz;
          status.remove();
          boxes = sizes.map(function (_, i) { var b = pageBox(i); pagesEl.appendChild(b); return b; });
          buildThumbs();
          if (typeof IntersectionObserver === "function") {
            io = new IntersectionObserver(function (en) {
              en.forEach(function (e) { var i = +e.target.getAttribute("data-n"); if (e.isIntersecting) mount(i); else unmount(i); });
            }, { root: stage, rootMargin: "100% 0px" });
            boxes.forEach(function (b) { io.observe(b); });
          } else boxes.slice(0, 3).forEach(function (b, i) { mount(i); });
          repaintInk();
          paintCurrent();
          if (o.kind === "paper" && o.paper) {
            text = textOf(pdf);
            text.ready(function () {
              var m = mapQuestions(text.pages, questions().map(function (q) { return q.label; }));
              Object.keys(m).forEach(function (k) { qPage[k] = m[k]; });
              paintHead();
            });
          }
        });
      }).catch(function (e) { status.textContent = e.message || "This PDF could not be opened."; });
    });
    return { close: close };
  }

  /* the mark scheme in its own pane: read-only pages, the same
     virtualisation, and Follow the question by the scheme's headings */
  function schemeViewer(host, sch, onManualScroll, labels) {
    var pdf = null, boxes = [], mounted = {}, io = null, text = null, gone = false, auto = false, smap = {};
    host.innerHTML = "";
    var head = el("div", { class: "k-pv-schead" }, [el("b", { text: sch.title || "Mark scheme" })]);
    host.appendChild(head);
    var list = el("div", { class: "k-pv-pages k-pv-schpages" });
    host.appendChild(list);
    host.addEventListener("scroll", function () { if (auto) { auto = false; return; } onManualScroll(); }, { passive: true });
    sch.getBlob(function (err, blob) {
      if (err || !blob) { list.appendChild(el("p", { class: "k-pv-status", text: "The mark scheme is not readable here." })); return; }
      load(blob).then(function (doc) {
        if (gone) { doc.destroy(); return; }
        pdf = doc;
        var all = [];
        for (var i = 1; i <= doc.numPages; i++) all.push(doc.getPage(i).then(function (pg) { var v = pg.getViewport({ scale: 1 }); return { w: v.width, h: v.height }; }));
        Promise.all(all).then(function (sz) {
          boxes = sz.map(function (s, i) {
            var b = el("div", { class: "k-pv-page", "data-n": String(i), role: "img", "aria-label": "Mark scheme page " + (i + 1) });
            b.style.setProperty("--pv-ar", (s.w / s.h).toFixed(5));
            list.appendChild(b);
            return b;
          });
          io = new IntersectionObserver(function (en) {
            en.forEach(function (e) {
              var i = +e.target.getAttribute("data-n");
              if (e.isIntersecting && !mounted[i]) {
                var c = mounted[i] = el("canvas", { class: "k-pv-canvas", "aria-hidden": "true" });
                e.target.appendChild(c);
                pdf.getPage(i + 1).then(function (pg) {
                  if (mounted[i] !== c) return;
                  var v1 = pg.getViewport({ scale: 1 }), w = e.target.clientWidth || 400, k = Math.min(1.5, 4096 / w);
                  var vp = pg.getViewport({ scale: w / v1.width * k });
                  c.width = Math.round(vp.width); c.height = Math.round(vp.height);
                  pg.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise.catch(function () {});
                });
              } else if (!e.isIntersecting && mounted[i]) { var c2 = mounted[i]; delete mounted[i]; c2.width = 0; c2.height = 0; c2.remove(); }
            });
          }, { root: host, rootMargin: "100% 0px" });
          boxes.forEach(function (b) { io.observe(b); });
          text = textOf(pdf);
          text.ready(function () { smap = mapQuestions(text.pages, labels || []); });
        });
      }).catch(function () { list.appendChild(el("p", { class: "k-pv-status", text: "The mark scheme could not be opened." })); });
    });
    return {
      follow: function (label) {
        if (!label || !text) return;
        /* the scheme's own Qu · Pt columns, mapped in order; a part it
           does not show goes to the nearest earlier one it does */
        var li = (labels || []).indexOf(label);
        for (var k = li; k >= 0; k--) {
          var pg = smap[labels[k]];
          if (pg != null && boxes[pg]) { auto = true; boxes[pg].scrollIntoView({ block: "start" }); return; }
        }
        var core = String(label).replace(/^Q/i, ""), n = core.split(".")[0], num = String(parseInt(n, 10));
        var re = new RegExp("^(question|qu\\.?|q)\\s*0?" + num + "\\b", "i");
        for (var p = 0; p < text.pages.length; p++) {
          var hit = (text.pages[p] || []).some(function (it) { return re.test(it.s.trim()); });
          if (hit && boxes[p]) { auto = true; boxes[p].scrollIntoView({ block: "start" }); return; }
        }
      },
      destroy: function () {
        gone = true;
        if (io) io.disconnect();
        Object.keys(mounted).forEach(function (i) { mounted[i].width = 0; mounted[i].height = 0; mounted[i].remove(); });
        if (pdf) { try { pdf.destroy(); } catch (e) { /* gone */ } }
        host.innerHTML = "";
      }
    };
  }

  KOS.pdfView = { open: open, load: load, lib: lib, textOf: textOf, findQuestion: findQuestion, mapQuestions: mapQuestions };
})();
