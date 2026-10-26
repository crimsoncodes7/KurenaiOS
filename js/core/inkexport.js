/* Kurenai OS — core/inkexport.js · KOS.inkExport
   Export (roadmap 6.1, design 30q): a page as a PNG, a notebook as a PDF,
   made on the device. Exports go on white paper with the ink layer in
   Atelier Dawn (data-theme="atelier-dawn"), so the same roles read on
   paper as on screen: Ink is near-black and Accent stays 4.5 : 1 (30q).
   The paper's rules are drawn here, in the theme's own --line, because a
   CSS background never reaches a picture.

   PDFs are built with pdf-lib (assets/pdf/pdf-lib/, vendored, MIT), loaded
   the first time something exports; the same loader serves the files
   plan's flattened export. The result is shared through the share sheet
   where the device has one (the iPad), else downloaded. Nothing is sent
   anywhere.                                                              */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var I = KOS.ink;
  function el() { return KOS.ui.el.apply(null, arguments); }

  /* ---------- the libraries, loaded once ---------- */
  var libP = null;
  function pdfLib() {
    if (window.PDFLib) return Promise.resolve(window.PDFLib);
    if (libP) return libP;
    libP = new Promise(function (res, rej) {
      var sc = document.createElement("script");
      sc.src = "assets/pdf/pdf-lib/pdf-lib.min.js";
      sc.onload = function () { window.PDFLib ? res(window.PDFLib) : rej(new Error("pdf-lib did not load")); };
      sc.onerror = function () { libP = null; rej(new Error("pdf-lib could not be loaded — offline?")); };
      document.head.appendChild(sc);
    });
    return libP;
  }

  /* a token's colour on a Dawn host, as rgb a canvas takes */
  function dawnHost() {
    var h = el("div", { class: "k-ink-exporthost", "data-theme": "atelier-dawn", "aria-hidden": "true" });
    document.body.appendChild(h);
    return h;
  }
  function tokenColour(host, name) {
    var probe = el("span", { class: "k-ink-probe", "aria-hidden": "true" });
    probe.style.setProperty("--ink-c", "var(" + name + ")");
    host.appendChild(probe);
    var c = getComputedStyle(probe).color;
    probe.remove();
    if (/^rgb/.test(c)) return c;
    try {
      var cv = document.createElement("canvas"); cv.width = cv.height = 1;
      var x = cv.getContext("2d", { willReadFrequently: true });
      x.fillStyle = "#000"; x.fillStyle = c; x.fillRect(0, 0, 1, 1);
      var d = x.getImageData(0, 0, 1, 1).data;
      return "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")";
    } catch (e) { return "rgb(200,200,200)"; }
  }

  /* ---------- the paper, drawn (page units) ---------- */
  var RULE = 46, SQUARE = I.MM * 5, CUE = 300, MARGIN = 100, MARKS = 880;
  function drawPaper(ctx, paper, h, line, accent, muted) {
    ctx.save();
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = line;
    function hLines(from) { for (var y = from; y < h; y += RULE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(I.W, y); ctx.stroke(); } }
    if (paper === "lined") hLines(RULE * 2);
    else if (paper === "squared") {
      for (var x = 0; x <= I.W; x += SQUARE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (var y = 0; y <= h; y += SQUARE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(I.W, y); ctx.stroke(); }
    } else if (paper === "dotted") {
      ctx.fillStyle = muted;
      for (var dx = RULE; dx < I.W; dx += RULE) for (var dy = RULE; dy < h; dy += RULE) { ctx.beginPath(); ctx.arc(dx, dy, 1.9, 0, Math.PI * 2); ctx.fill(); }
    } else if (paper === "cornell") {
      hLines(RULE * 2);
      ctx.strokeStyle = accent; ctx.beginPath(); ctx.moveTo(CUE, 0); ctx.lineTo(CUE, h * 0.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, h * 0.8); ctx.lineTo(I.W, h * 0.8); ctx.stroke();
    } else if (paper === "booklet") {
      hLines(RULE * 2);
      [MARGIN, MARKS].forEach(function (x) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); });
    }
    ctx.restore();
  }

  /* one page as a canvas: white paper, its rules, its ink in Dawn.
     `under` (a canvas or image) is drawn first — a PDF page's own picture */
  function pageCanvas(page, opts, cb) {
    opts = opts || {};
    var h = I.pageH(page), px = opts.px || 1654, k = px / I.W;
    var c = document.createElement("canvas");
    c.width = px; c.height = Math.round(h * k);
    var ctx = c.getContext("2d");
    var host = dawnHost();
    var pal = KOS.inkUI.palette(host), line = tokenColour(host, "--line"), accent = pal.accent, muted = tokenColour(host, "--muted");
    host.remove();
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    if (opts.under) { try { ctx.drawImage(opts.under, 0, 0, c.width, c.height); } catch (e) { /* tainted or gone */ } }
    ctx.setTransform(k, 0, 0, k, 0, 0);
    if (!opts.under) drawPaper(ctx, page.paper || "lined", h, line, accent, muted);
    ctx.__inkScale = k;
    /* pictures load before the page is read back */
    var pending = (page.items || []).filter(function (it) { return it.k === "img" && it.src; }).map(function (it) {
      return new Promise(function (res) { var im = new Image(); im.onload = im.onerror = function () { res(); }; im.src = it.src; });
    });
    Promise.all(pending).then(function () {
      KOS.inkUI.drawItems(ctx, page.items || [], pal, function () {});
      cb(c);
    });
  }
  function canvasBlob(c, type) {
    return new Promise(function (res, rej) {
      if (c.toBlob) c.toBlob(function (b) { b ? res(b) : rej(new Error("The page could not be read back.")); }, type || "image/png");
      else rej(new Error("This browser cannot export a picture."));
    });
  }

  /* hand a file to the share sheet, else download it */
  function deliver(blob, name) {
    var file = null;
    try { file = new File([blob], name, { type: blob.type }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      return navigator.share({ files: [file], title: name }).catch(function (e) { if (e && e.name !== "AbortError") download(blob, name); });
    }
    download(blob, name);
    return Promise.resolve();
  }
  function download(blob, name) {
    var url = URL.createObjectURL(blob), a = el("a", { href: url, download: name, class: "k-ink-file" });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function safeName(t) { return String(t || "Kurenai notes").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "Kurenai notes"; }

  function exportPNG(page, title) {
    return new Promise(function (res, rej) {
      pageCanvas(page, {}, function (c) { canvasBlob(c).then(function (b) { return deliver(b, safeName(title) + ".png"); }).then(res, rej); });
    });
  }
  /* pages → one PDF at A4 width; a page of its own height keeps it */
  function pagesPDF(pages, unders) {
    return pdfLib().then(function (L) {
      return L.PDFDocument.create().then(function (doc) {
        var chain = Promise.resolve();
        pages.forEach(function (p, i) {
          chain = chain.then(function () {
            return new Promise(function (res) { pageCanvas(p, { under: unders && unders[i] }, res); })
              .then(function (c) { return canvasBlob(c, "image/jpeg"); })
              .then(function (b) { return b.arrayBuffer(); })
              .then(function (buf) { return doc.embedJpg(buf); })
              .then(function (img) {
                var wPt = 595.28, hPt = wPt * I.pageH(p) / I.W;
                var pg = doc.addPage([wPt, hPt]);
                pg.drawImage(img, { x: 0, y: 0, width: wPt, height: hPt });
              });
          });
        });
        return chain.then(function () { return doc.save(); });
      });
    }).then(function (bytes) { return new Blob([bytes], { type: "application/pdf" }); });
  }
  function exportPDF(pages, title) {
    if (!pages.length) return Promise.reject(new Error("Nothing written yet."));
    return pagesPDF(pages).then(function (b) { return deliver(b, safeName(title) + ".pdf"); });
  }
  /* a doc by its key: every page, in order */
  function exportDoc(key, title) {
    return new Promise(function (res, rej) {
      I.listPages(key, function (err, pages) {
        if (err) { rej(err); return; }
        exportPDF(pages.filter(function (p) { return (p.items || []).length; }), title).then(res, rej);
      });
    });
  }

  KOS.inkExport = { pdfLib: pdfLib, pageCanvas: pageCanvas, drawPaper: drawPaper, exportPNG: exportPNG, exportPDF: exportPDF,
    exportDoc: exportDoc, pagesPDF: pagesPDF, deliver: deliver, safeName: safeName, canvasBlob: canvasBlob };
})();
