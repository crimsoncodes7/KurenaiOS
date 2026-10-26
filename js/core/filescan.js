/* Kurenai OS — core/filescan.js · KOS.fileScan
   Scan pages with the camera (files plan §6, adjusted: kept light).

   The capture is the device's own camera or photo picker
   (`<input type=file accept=image/* capture>`); no library is bundled and
   nothing detects edges. Each shot gets four corner handles, placed a
   little inside the photo, that you drag onto the page's corners; Straighten
   maps that quadrilateral onto an upright A4 page by a projective warp on a
   canvas (the homography solved from the four pairs, each output pixel
   sampled bilinearly from the photo). The pages become ONE PDF (pdf-lib),
   handed back as a File; nothing is stored until the caller adds it.

   Memory (files plan §4): a photo is drawn at most 2400 px on its long
   side, a page is 1240 × 1754 (A4 at 150 dpi), and every canvas is sized
   to nothing when its page is done.                                      */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  function el() { return KOS.ui.el.apply(null, arguments); }
  var MAX_SIDE = 2400, PW = 1240, PH = 1754;

  /* ---------- the warp (pure, exposed for tests) ---------- */
  /* the 3×3 homography taking (x, y) in the unit page to the photo: four
     pairs give eight equations in the eight unknowns h0…h7 (h8 = 1) */
  function solve(A, b) {
    var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var p = c;
      for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      var t = M[c]; M[c] = M[p]; M[p] = t;
      if (Math.abs(M[c][c]) < 1e-12) return null;
      for (var r2 = 0; r2 < n; r2++) {
        if (r2 === c) continue;
        var f = M[r2][c] / M[c][c];
        for (var k = c; k <= n; k++) M[r2][k] -= f * M[c][k];
      }
    }
    return M.map(function (r, i) { return r[n] / r[i]; });
  }
  /* src: the photo's four corners [tl, tr, br, bl] as [x, y]; the page's
     corners are (0,0) (W,0) (W,H) (0,H) */
  function homography(src, W, H) {
    var dst = [[0, 0], [W, 0], [W, H], [0, H]], A = [], b = [];
    for (var i = 0; i < 4; i++) {
      var x = dst[i][0], y = dst[i][1], u = src[i][0], v = src[i][1];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    var h = solve(A, b);
    return h ? h.concat([1]) : null;
  }
  function mapPoint(h, x, y) {
    var w = h[6] * x + h[7] * y + h[8];
    return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w];
  }
  /* the straightened page, as a canvas */
  function warp(img, corners, W, H) {
    W = W || PW; H = H || PH;
    var h = homography(corners, W, H);
    if (!h) return null;
    var sw = img.width, sh = img.height;
    var sc = document.createElement("canvas");
    sc.width = sw; sc.height = sh;
    var sctx = sc.getContext("2d");
    sctx.drawImage(img, 0, 0);
    var src = sctx.getImageData(0, 0, sw, sh).data;
    sc.width = 0; sc.height = 0;
    var out = document.createElement("canvas");
    out.width = W; out.height = H;
    var octx = out.getContext("2d"), od = octx.createImageData(W, H), d = od.data;
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var w = h[6] * x + h[7] * y + 1;
        var u = (h[0] * x + h[1] * y + h[2]) / w, v = (h[3] * x + h[4] * y + h[5]) / w;
        var o = (y * W + x) * 4;
        if (u < 0 || v < 0 || u >= sw - 1 || v >= sh - 1) { d[o] = d[o + 1] = d[o + 2] = 255; d[o + 3] = 255; continue; }
        var x0 = u | 0, y0 = v | 0, fx = u - x0, fy = v - y0, i00 = (y0 * sw + x0) * 4, i10 = i00 + 4, i01 = i00 + sw * 4, i11 = i01 + 4;
        for (var c = 0; c < 3; c++) {
          d[o + c] = (src[i00 + c] * (1 - fx) + src[i10 + c] * fx) * (1 - fy) + (src[i01 + c] * (1 - fx) + src[i11 + c] * fx) * fy;
        }
        d[o + 3] = 255;
      }
    }
    octx.putImageData(od, 0, 0);
    return out;
  }

  /* ---------- reading a photo, scaled down ---------- */
  function readPhoto(file) {
    var url = URL.createObjectURL(file);
    return new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () {
        var k = Math.min(1, MAX_SIDE / Math.max(im.naturalWidth, im.naturalHeight));
        var c = document.createElement("canvas");
        c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c);
      };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error("That photo could not be read.")); };
      im.src = url;
    });
  }

  /* ---------- the dialog ---------- */
  /* open({onDone(file), title}) */
  function open(o) {
    o = o || {};
    var shots = [];          // [{photo canvas, corners, page canvas|null}]
    KOS.inkUI.dialog({ title: o.title || "Scan pages", className: "k-scan", wide: true, hook: "scan.dialog", onClose: cleanup, render: function (body, close, foot) {
      var cam = el("input", { type: "file", accept: "image/*", capture: "environment", class: "sr-only", tabindex: "-1", "aria-hidden": "true", "data-ui": "scan.camera" });
      var pick = el("input", { type: "file", accept: "image/*", multiple: "", class: "sr-only", tabindex: "-1", "aria-hidden": "true", "data-ui": "scan.pick" });
      var stage = el("div", { class: "k-scan-stage", "data-ui": "scan.stage" });
      var strip = el("ol", { class: "k-scan-strip", "data-ui": "scan.pages", "aria-label": "Pages" });
      var make = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "scan.make", text: "Make the PDF", disabled: "" });
      body.appendChild(cam); body.appendChild(pick);
      body.appendChild(el("div", { class: "k-cluster k-scan-add" }, [
        el("button", { type: "button", class: "k-btn", "data-ui": "scan.take", text: "📷 Take a photo", onclick: function () { cam.click(); } }),
        el("button", { type: "button", class: "k-btn", "data-ui": "scan.choose", text: "Choose photos", onclick: function () { pick.click(); } }),
        el("span", { class: "k-muted", text: "Drag the four corners onto the page's corners, then Straighten." })
      ]));
      body.appendChild(el("div", { class: "k-scan-body" }, [stage, strip]));
      var active = -1;
      function take(input) {
        var fs = [].slice.call(input.files || []);
        input.value = "";
        var chain = Promise.resolve();
        fs.forEach(function (f) {
          chain = chain.then(function () { return readPhoto(f).then(function (c) {
            var ix = c.width * 0.06, iy = c.height * 0.06;
            shots.push({ photo: c, corners: [[ix, iy], [c.width - ix, iy], [c.width - ix, c.height - iy], [ix, c.height - iy]], page: null });
          }); });
        });
        chain.then(function () { if (shots.length) edit(shots.length - fs.length); paintStrip(); }, function (e) { KOS.ui.toast(e.message, true); });
      }
      cam.addEventListener("change", function () { take(cam); });
      pick.addEventListener("change", function () { take(pick); });

      function edit(i) {
        active = Math.max(0, Math.min(shots.length - 1, i));
        var s = shots[active];
        stage.innerHTML = "";
        if (!s) { stage.appendChild(el("p", { class: "k-muted k-scan-empty", text: "Take a photo of a page, or choose photos you already have." })); return; }
        var frame = el("div", { class: "k-scan-frame" });
        var view = el("canvas", { class: "k-scan-photo", "aria-label": "Photo " + (active + 1), role: "img" });
        /* the photo fits the dialog, so the footer never covers it */
        var maxW = Math.min(stage.clientWidth || 640, 900), maxH = Math.max(220, Math.min(560, (window.innerHeight || 800) - 360));
        var k = Math.min(1, maxW / s.photo.width, maxH / s.photo.height);
        view.width = Math.round(s.photo.width * k); view.height = Math.round(s.photo.height * k);
        view.getContext("2d").drawImage(s.photo, 0, 0, view.width, view.height);
        frame.style.setProperty("--scan-w", view.width + "px");
        frame.style.setProperty("--scan-h", view.height + "px");
        frame.appendChild(view);
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "k-scan-quad"); svg.setAttribute("viewBox", "0 0 " + view.width + " " + view.height); svg.setAttribute("aria-hidden", "true");
        var poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        svg.appendChild(poly);
        frame.appendChild(svg);
        var names = ["top left", "top right", "bottom right", "bottom left"];
        function paintQuad() { poly.setAttribute("points", s.corners.map(function (c) { return (c[0] * k).toFixed(1) + "," + (c[1] * k).toFixed(1); }).join(" ")); }
        s.corners.forEach(function (c, ci) {
          var hnd = el("button", { type: "button", class: "k-scan-handle", "data-ui": "scan.handle", "aria-label": "The page's " + names[ci] + " corner. Arrow keys move it." });
          function place() { hnd.style.setProperty("--hx", (c[0] * k) + "px"); hnd.style.setProperty("--hy", (c[1] * k) + "px"); }
          place();
          hnd.addEventListener("pointerdown", function (e) {
            e.preventDefault();
            try { hnd.setPointerCapture(e.pointerId); } catch (x) { /* refused */ }
            var r = view.getBoundingClientRect();
            function mv(ev) {
              c[0] = Math.max(0, Math.min(s.photo.width, (ev.clientX - r.left) / k));
              c[1] = Math.max(0, Math.min(s.photo.height, (ev.clientY - r.top) / k));
              place(); paintQuad();
            }
            function up() { hnd.removeEventListener("pointermove", mv); hnd.removeEventListener("pointerup", up); hnd.removeEventListener("pointercancel", up); s.page = null; paintStrip(); }
            hnd.addEventListener("pointermove", mv); hnd.addEventListener("pointerup", up); hnd.addEventListener("pointercancel", up);
          });
          hnd.addEventListener("keydown", function (e) {
            var step = e.shiftKey ? 20 / k : 4 / k, dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0, dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
            if (!dx && !dy) return;
            e.preventDefault();
            c[0] = Math.max(0, Math.min(s.photo.width, c[0] + dx)); c[1] = Math.max(0, Math.min(s.photo.height, c[1] + dy));
            place(); paintQuad(); s.page = null;
          });
          frame.appendChild(hnd);
        });
        paintQuad();
        stage.appendChild(el("div", { class: "k-cluster k-scan-actions" }, [
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "scan.straighten", text: s.page ? "✓ Straightened" : "Straighten", onclick: function () {
            var page = warp(s.photo, s.corners);
            if (!page) { KOS.ui.toast("Those corners don't make a page — move them apart.", true); return; }
            if (s.page) { s.page.width = 0; s.page.height = 0; }
            s.page = page;
            KOS.a11y.announce("Page " + (active + 1) + " straightened.");
            paintStrip();
            if (active < shots.length - 1) edit(active + 1); else edit(active);
          } }),
          el("button", { type: "button", class: "k-btn", "data-ui": "scan.whole", text: "Use the whole photo", onclick: function () {
            s.corners = [[0, 0], [s.photo.width, 0], [s.photo.width, s.photo.height], [0, s.photo.height]]; s.page = null; edit(active);
          } }),
          el("button", { type: "button", class: "k-btn k-btn--quiet", "data-intent": "danger", "data-ui": "scan.drop", text: "Remove this page", onclick: function () {
            var gone = shots.splice(active, 1)[0];
            free(gone);
            paintStrip(); edit(active);
          } })
        ]));
        stage.appendChild(frame);
      }
      function paintStrip() {
        strip.innerHTML = "";
        shots.forEach(function (s, i) {
          var th = el("canvas", { class: "k-scan-thumb", "aria-hidden": "true" }), src = s.page || s.photo, tk = 84 / src.width;
          th.width = 84; th.height = Math.round(src.height * tk);
          th.getContext("2d").drawImage(src, 0, 0, th.width, th.height);
          strip.appendChild(el("li", {}, [el("button", { type: "button", class: "k-scan-pg", "aria-current": String(i === active), "aria-label": "Page " + (i + 1) + (s.page ? ", straightened" : ""), onclick: function () { edit(i); } },
            [th, el("span", { class: "k-mono", text: (i + 1) + (s.page ? " ✓" : "") })])]));
        });
        var ready = shots.length && shots.every(function (s) { return s.page; });
        if (ready) make.removeAttribute("disabled"); else make.setAttribute("disabled", "");
        make.textContent = shots.length && !ready ? "Straighten every page first" : "Make the PDF" + (shots.length ? " · " + shots.length + (shots.length === 1 ? " page" : " pages") : "");
      }
      make.addEventListener("click", function () {
        make.setAttribute("disabled", ""); make.textContent = "Making the PDF…";
        build(shots.map(function (s) { return s.page; })).then(function (blob) {
          var name = (o.name || "Scan") + " " + new Date().toLocaleDateString("en-GB").replace(/\//g, "-") + ".pdf", file;
          try { file = new File([blob], name, { type: "application/pdf" }); } catch (e) { file = blob; file.name = name; }
          close();
          if (o.onDone) o.onDone(file);
        }, function (e) { KOS.ui.toast("The PDF could not be made — " + e.message, true); paintStrip(); });
      });
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: close }));
      foot.appendChild(make);
      edit(-1);
      paintStrip();
    } });
    function free(s) { if (!s) return; [s.photo, s.page].forEach(function (c) { if (c) { c.width = 0; c.height = 0; } }); }
    function cleanup() { shots.forEach(free); shots = []; }
  }
  /* the pages as one PDF, A4, a JPEG a page */
  function build(pages) {
    return KOS.inkExport.pdfLib().then(function (L) {
      return L.PDFDocument.create().then(function (doc) {
        var chain = Promise.resolve();
        pages.forEach(function (c) {
          chain = chain.then(function () {
            return new Promise(function (res) { c.toBlob(function (b) { res(b); }, "image/jpeg", 0.85); })
              .then(function (b) { return b.arrayBuffer(); }).then(function (buf) { return doc.embedJpg(buf); })
              .then(function (img) { doc.addPage([595.28, 841.89]).drawImage(img, { x: 0, y: 0, width: 595.28, height: 841.89 }); });
          });
        });
        return chain.then(function () { return doc.save(); });
      });
    }).then(function (bytes) { return new Blob([bytes], { type: "application/pdf" }); });
  }

  KOS.fileScan = { open: open, homography: homography, mapPoint: mapPoint, warp: warp, build: build };
})();
