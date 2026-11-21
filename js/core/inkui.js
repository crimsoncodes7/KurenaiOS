/* Kurenai OS — core/inkui.js
   The ink engine's surfaces and toolbar (roadmap 6.1, design turn 30:
   30a the docked toolbar, 30b colour, width and paper, 30s the edges).
   The model and the geometry are js/core/ink.js.

   A DESK is one place that writes (a topic's Handwritten tab today; an
   answer pad, a paper, a drill later): it holds the tool settings and the
   page that was last touched, so Undo and the toolbar act on it. A SURFACE
   is one page drawn into an element: two canvases (the page's ink, and a
   live layer for the stroke being drawn, the lasso, the eraser ring and
   the selection) under a small DOM layer (the selection's chips, a text
   box being typed).

   INPUT (decision A, 30a "Empty and error"):
   - the pen draws, and so does a mouse; a finger scrolls, two pinch, and
     a two-finger TAP undoes (both down and up within 200 ms, moved under
     10 px), so starting a pinch never undoes;
   - a finger draws only with "Draw with a finger" on (per device);
   - pen touches call preventDefault on touchstart and pointerdown, so
     iPadOS neither scrolls under the pen nor holds the stroke's start
     while it checks for Scribble handwriting;
   - the palm never draws, because a finger never does.
   Width follows pressure only once the pen has reported pressure (the
   Pencil Pro does; the USB-C Pencil does not), else speed.
   Tool settings, Pen only and what the app saw of the pen are per device
   (state.ui.ink, like state.ui); nothing about the pen syncs.           */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var I = KOS.ink, G = I.geo;
  function el() { return KOS.ui.el.apply(null, arguments); }

  /* ---------- per-device settings ---------- */
  var TOOLS = [
    ["pen", "Pen", "P"], ["hl", "Highlight", "H"], ["eraser", "Eraser", "E"],
    ["lasso", "Lasso", "L"], ["shape", "Shape", "S"], ["ruler", "Ruler", "R"], ["text", "Text", "T"]
  ];
  function prefs() {
    var ui = KOS.store.state.ui;
    var p = ui.ink && typeof ui.ink === "object" && !Array.isArray(ui.ink) ? ui.ink : {};
    var roles = I.PEN_ROLES.map(function (r) { return r[0]; }), hls = I.HL_ROLES.map(function (r) { return r[0]; });
    var out = {
      tool: TOOLS.some(function (t) { return t[0] === p.tool; }) ? p.tool : "pen",
      /* the floating palette (30b): docked or floating, and where it sits
         per orientation, like the Focus mini-player */
      dock: p.dock === "float" ? "float" : "dock",
      at: p.at && typeof p.at === "object" ? { land: p.at.land || null, port: p.at.port || null } : { land: null, port: null },
      pen: { role: p.pen && roles.indexOf(p.pen.role) >= 0 ? p.pen.role : "ink", w: p.pen && p.pen.w >= 0 && p.pen.w <= 2 ? p.pen.w : 1 },
      hl: { role: p.hl && hls.indexOf(p.hl.role) >= 0 ? p.hl.role : "amber", w: p.hl && p.hl.w >= 0 && p.hl.w <= 2 ? p.hl.w : 1 },
      eraser: p.eraser === "stroke" ? "stroke" : "partial",
      /* each tool's size, a step of three (I.ERASER_SIZES, I.TEXT_SIZES),
         and the lasso's shape */
      eraserW: p.eraserW >= 0 && p.eraserW <= 2 ? p.eraserW : 0,
      textW: p.textW >= 0 && p.textW <= 2 ? p.textW : 1,
      lasso: p.lasso === "box" ? "box" : "free",
      finger: p.finger === true,
      penSeen: +p.penSeen || 0,
      pressure: p.pressure === true
    };
    /* normalised IN PLACE: a desk holds this very object, so a change made
       through it is the one saved */
    if (ui.ink !== p) ui.ink = p;
    Object.keys(p).forEach(function (k) { if (!(k in out)) delete p[k]; });
    return Object.assign(p, out);
  }
  function savePrefs() { KOS.store.save(); }

  /* ---------- colours: roles read live from the theme ---------- */
  var ROLES = ["ink", "accent", "teal", "amber", "green", "bloom"];
  var palCache = {}, probe = null, probeEl = null;
  function resolve(host, role, ps) {
    /* a token may be oklch(from …): let the browser compute it on an
       element, then paint it on a 1px canvas and read back rgb, which
       every canvas takes. A host not in the document has no computed
       style, so the probe goes on the body instead (every colour read
       black on the iPad when a page was drawn before it was placed). */
    if (!host || !host.isConnected) host = document.body;
    try {
      if (!probeEl) { probeEl = document.createElement("span"); probeEl.setAttribute("aria-hidden", "true"); probeEl.className = "k-ink-probe"; }
      /* the role's colour comes from ink.css (.k-ink-probe[data-role]) */
      probeEl.setAttribute("data-role", role);
      if (ps) probeEl.setAttribute("data-penset", ps); else probeEl.removeAttribute("data-penset");
      host.appendChild(probeEl);
      var c = getComputedStyle(probeEl).color;
      probeEl.remove();
      if (/^rgb/.test(c)) return c;
      if (!probe) { probe = document.createElement("canvas"); probe.width = probe.height = 1; }
      var x = probe.getContext && probe.getContext("2d", { willReadFrequently: true });
      if (!x) return c || "currentColor";
      x.clearRect(0, 0, 1, 1); x.fillStyle = "#000"; x.fillStyle = c; x.fillRect(0, 0, 1, 1);
      var d = x.getImageData(0, 0, 1, 1).data;
      return "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")";
    } catch (e) { return "currentColor"; }
  }
  /* a palette per pen set: `ps` is the set a stroke was written with
     (none = the theme's own roles); `forSet` reads another set's */
  function palette(host, ps) {
    var themed = host.closest && host.closest("[data-theme]");
    var key = ((themed && themed.getAttribute("data-theme")) || document.documentElement.getAttribute("data-theme") || "") + "|" + (ps || "");
    if (palCache[key]) return palCache[key];
    var out = {}, sure = !!(host && host.isConnected);
    ROLES.forEach(function (r) { out[r] = resolve(host, r, ps); if (!/^rgb/.test(out[r])) sure = false; });
    Object.defineProperty(out, "forSet", { value: function (s2) { return s2 === ps ? out : palette(host, s2); } });
    /* only a reading from the page itself is kept; a host still being
       built reads again once it is placed */
    if (sure) palCache[key] = out;
    return out;
  }
  try {
    if (window.MutationObserver) new MutationObserver(function () { palCache = {}; })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-penset"] });
  } catch (e) { /* no observers */ }

  /* a NEW item records the pen set worn as it is written (SC-34); an
     edited text box keeps the set it had */
  function withSet(it, was) {
    var ps = was ? was.ps : document.documentElement.getAttribute("data-penset");
    if (ps) it.ps = ps;
    return it;
  }

  /* ---------- drawing ---------- */
  function strokePath(list, ws) {
    /* each segment a quadrilateral and each point a disc, all wound the
       same way, so one nonzero fill is their union */
    var path = new Path2D();
    function disc(q, r) { path.moveTo(q.x + r, q.y); path.arc(q.x, q.y, r, 0, Math.PI * 2, false); }
    for (var i = 0; i < list.length; i++) {
      disc(list[i], ws[i] / 2);
      if (!i) continue;
      var a = list[i - 1], b = list[i], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      if (!L) continue;
      var nx = -dy / L, ny = dx / L, ra = ws[i - 1] / 2, rb = ws[i] / 2;
      var quad = [{ x: a.x + nx * ra, y: a.y + ny * ra }, { x: b.x + nx * rb, y: b.y + ny * rb },
        { x: b.x - nx * rb, y: b.y - ny * rb }, { x: a.x - nx * ra, y: a.y - ny * ra }];
      var area = 0;
      for (var k = 0; k < 4; k++) { var p = quad[k], q = quad[(k + 1) % 4]; area += p.x * q.y - q.x * p.y; }
      if (area < 0) quad.reverse();
      path.moveTo(quad[0].x, quad[0].y);
      for (var j = 1; j < 4; j++) path.lineTo(quad[j].x, quad[j].y);
      path.closePath();
    }
    return path;
  }
  /* a page is often drawn at half its paper size, so a nib is kept to a
     legible floor on screen (css px); the stored stroke never changes */
  var FLOOR = [1.5, 2.1, 3.1];
  function nib(it, k) {
    var base = G.baseWidth(it);
    if (it.k !== "pen" || !k) return base;
    return Math.max(base, FLOOR[it.w == null ? 1 : it.w] / k);
  }
  var imgCache = {};
  function drawItem(ctx, it, pal, onImage) {
    var k = ctx.__inkScale || 0;
    if (it.k === "hl") {
      var hl = G.pts(it);
      ctx.save();
      ctx.globalAlpha = I.HL_ALPHA;
      ctx.strokeStyle = pal[it.role] || pal.amber;
      ctx.lineWidth = G.baseWidth(it); ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      hl.forEach(function (q, i) { if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
      if (hl.length === 1) ctx.lineTo(hl[0].x + 0.1, hl[0].y);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (it.k === "pen") {
      var list = G.pts(it), base = nib(it, k);
      ctx.fillStyle = ctx.strokeStyle = pal[it.role] || pal.ink;
      if (it.sh) {
        ctx.lineWidth = base; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath();
        list.forEach(function (q, i) { if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
        ctx.stroke();
        return;
      }
      if (typeof Path2D !== "function") return;
      var sm = G.smooth(list);
      ctx.fill(strokePath(sm, G.widths(sm, base)));
      return;
    }
    if (it.k === "text" && it.tex) {
      /* TeX kept beside the writing (UR-13): its source, as typed */
      ctx.fillStyle = pal[it.role] || pal.ink;
      var xs = G.textSize(it);
      ctx.font = xs + "px " + ((getComputedStyle(document.documentElement).getPropertyValue("--font-mono") || "monospace").trim() || "monospace");
      ctx.textBaseline = "top";
      String(it.s || "").split("\n").forEach(function (line, i) { ctx.fillText(line, it.x, it.y + i * xs * 1.3); });
      return;
    }
    if (it.k === "text") {
      ctx.fillStyle = pal[it.role] || pal.ink;
      var tsz = G.textSize(it);
      ctx.textBaseline = "top";
      String(it.s || "").split("\n").forEach(function (line, i) { richLine(ctx, line, it.x, it.y + i * tsz * 1.3, tsz); });
      return;
    }
    /* a table (1C, UR-12): its rules in the box's colour, each cell's text */
    if (it.k === "table") {
      var col = pal[it.role] || pal.ink, sz = +it.sz || 22, tw = it.cw.reduce(function (a, b) { return a + b; }, 0), th = it.rh.reduce(function (a, b) { return a + b; }, 0);
      ctx.save();
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, 1.4 / Math.max(k || 1, 0.2)); ctx.globalAlpha = 0.8;
      ctx.strokeRect(it.x, it.y, tw, th);
      ctx.beginPath();
      for (var ci = 0, cx = it.x; ci < it.cw.length - 1; ci++) { cx += it.cw[ci]; ctx.moveTo(cx, it.y); ctx.lineTo(cx, it.y + th); }
      for (var ri = 0, ry = it.y; ri < it.rh.length - 1; ri++) { ry += it.rh[ri]; ctx.moveTo(it.x, ry); ctx.lineTo(it.x + tw, ry); }
      ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.textBaseline = "top";
      for (var r = 0, y0 = it.y; r < it.rh.length; y0 += it.rh[r], r++) {
        for (var c = 0, x0 = it.x; c < it.cw.length; x0 += it.cw[c], c++) {
          var txt = (it.c[r] && it.c[r][c]) || "";
          if (!txt) continue;
          ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, it.cw[c], it.rh[r]); ctx.clip();
          txt.split("\n").forEach(function (line, li) { richLine(ctx, line, x0 + sz * 0.4, y0 + sz * 0.4 + li * sz * 1.3, sz); });
          ctx.restore();
        }
      }
      ctx.restore();
      return;
    }
    if (it.k === "img" && it.src) {
      var im = imgCache[it.src];
      if (!im) {
        im = imgCache[it.src] = new Image();
        im.onload = onImage;
        im.src = it.src;
      }
      if (im.complete && im.naturalWidth) ctx.drawImage(im, it.x, it.y, it.w, it.h);
    }
  }
  /* one line of rich text: a bullet or number hung in the margin, then
     its runs, bold and italic each in their own face */
  var uiFont = null;
  function richLine(ctx, line, x, y, sz) {
    if (uiFont == null) uiFont = (getComputedStyle(document.documentElement).getPropertyValue("--font-ui") || "sans-serif").trim() || "sans-serif";
    var r = G.parseRich(line), at = x;
    function font(b, i) { ctx.font = (i ? "italic " : "") + (b ? "600 " : "") + sz + "px " + uiFont; }
    if (r.list) {
      font(false, false);
      ctx.fillText(r.list, at, y);
      at += sz * (r.list === "•" ? 1 : 1.4);
    }
    r.runs.forEach(function (run) {
      font(run.b, run.i);
      ctx.fillText(run.t, at, y);
      at += ctx.measureText ? ctx.measureText(run.t).width : run.t.length * sz * 0.52;
    });
  }
  /* highlighters under everything, pictures under the ink (30b: "a
     highlighter stroke sits under the ink, never over it") */
  var ORDER = { hl: 0, img: 1, pen: 2, text: 3, table: 3 };
  function drawItems(ctx, items, pal, onImage) {
    items.slice().sort(function (a, b) { return (ORDER[a.k] || 0) - (ORDER[b.k] || 0); })
      .forEach(function (it) { drawItem(ctx, it, it.ps && pal.forSet ? pal.forSet(it.ps) : pal, onImage); });
  }

  function roleName(list, id) { return (list.filter(function (r) { return r[0] === id; })[0] || list[0])[1]; }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }

  /* a dialog the ink surfaces open (a paper, a clash, what is sent, a
     drill): head with its title and ✕, a body the caller fills, through
     the one modal route (invariant 49). render(body, close, foot). */
  function dialog(o) {
    var overlay = el("div", { class: "k-dialog-overlay" });
    var title = el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: o.title || "" });
    var closed = false;
    function close() { if (closed) return; closed = true; overlay.remove(); if (o.onClose) o.onClose(); }
    overlay.close = close;
    var xBtn = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close", text: "✕", onclick: close });
    var body = el("div", { class: "k-ink-dlg-body" });
    var foot = el("div", { class: "k-dialog-foot" });
    var box = el("div", { class: "k-dialog " + (o.className || ""), "data-ui": "ui.dialog " + (o.hook || "") }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [title, xBtn]), body, foot]);
    if (o.wide) KOS.ui.state(box, "wide", true);
    overlay.appendChild(box);
    if (o.scrimClose !== false) overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    o.render(body, close, foot);
    if (!foot.childNodes.length) foot.remove();
    KOS.ui.openDialog(overlay, { labelledBy: title, initialFocus: o.focus ? o.focus() : null });
    return { close: close, body: body };
  }
  /* the notes' "Write it out" buttons (js/core/content.js), wherever notes
     are drawn: one listener at boot, which loads the drills (ink-ui) first */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-ui~='content.writeout']");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (KOS.inkDrills) { KOS.inkDrills.writeOutFrom(b); return; }
    if (KOS.lazy && KOS.lazy.need) KOS.lazy.need("ink-ui").then(function () { if (KOS.inkDrills && b.isConnected) KOS.inkDrills.writeOutFrom(b); },
      function () { KOS.ui.toast("Write it out couldn't load; try again online.", true); });
  }, true);
  /* the surfaces, the toolbar and the palette load with the ink-ui bundle
     (js/core/inksurface.js, 1F); until then nothing is being written */
  KOS.inkUI = { busy: function () { return false; }, prefs: prefs, palette: palette, drawItems: drawItems, drawItem: drawItem,
    strokePath: strokePath, nib: nib, withSet: withSet, savePrefs: savePrefs, roleName: roleName, announce: announce, TOOLS: TOOLS, dialog: dialog };
})();
