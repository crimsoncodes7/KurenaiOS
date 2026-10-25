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
   Pencil Pro does; the USB-C Pencil and the Metapen do not), else speed.
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
    ["lasso", "Lasso", "L"], ["shape", "Shape", "S"], ["text", "Text", "T"]
  ];
  function prefs() {
    var ui = KOS.store.state.ui;
    var p = ui.ink && typeof ui.ink === "object" && !Array.isArray(ui.ink) ? ui.ink : {};
    var roles = I.PEN_ROLES.map(function (r) { return r[0]; }), hls = I.HL_ROLES.map(function (r) { return r[0]; });
    var out = {
      tool: TOOLS.some(function (t) { return t[0] === p.tool; }) ? p.tool : "pen",
      pen: { role: p.pen && roles.indexOf(p.pen.role) >= 0 ? p.pen.role : "ink", w: p.pen && p.pen.w >= 0 && p.pen.w <= 2 ? p.pen.w : 1 },
      hl: { role: p.hl && hls.indexOf(p.hl.role) >= 0 ? p.hl.role : "amber" },
      eraser: p.eraser === "stroke" ? "stroke" : "partial",
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
  function resolve(host, role) {
    /* a token may be oklch(from …): let the browser compute it on an
       element, then paint it on a 1px canvas and read back rgb, which
       every canvas takes */
    try {
      if (!probeEl) { probeEl = document.createElement("span"); probeEl.setAttribute("aria-hidden", "true"); probeEl.className = "k-ink-probe"; }
      /* the role's colour comes from ink.css (.k-ink-probe[data-role]) */
      probeEl.setAttribute("data-role", role);
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
  function palette(host) {
    var themed = host.closest && host.closest("[data-theme]");
    var key = (themed && themed.getAttribute("data-theme")) || document.documentElement.getAttribute("data-theme") || "";
    if (palCache[key]) return palCache[key];
    var out = {};
    ROLES.forEach(function (r) { out[r] = resolve(host, r); });
    palCache[key] = out;
    return out;
  }
  try {
    if (window.MutationObserver) new MutationObserver(function () { palCache = {}; })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  } catch (e) { /* no observers */ }

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
      ctx.lineWidth = I.HL_WIDTH; ctx.lineCap = "round"; ctx.lineJoin = "round";
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
    if (it.k === "text") {
      ctx.fillStyle = pal[it.role] || pal.ink;
      ctx.font = I.TEXT_SIZE + "px " + (getComputedStyle(document.documentElement).getPropertyValue("--font-ui") || "sans-serif");
      ctx.textBaseline = "top";
      String(it.s || "").split("\n").forEach(function (line, i) { ctx.fillText(line, it.x, it.y + i * I.TEXT_SIZE * 1.3); });
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
  /* highlighters under everything, pictures under the ink (30b: "a
     highlighter stroke sits under the ink, never over it") */
  var ORDER = { hl: 0, img: 1, pen: 2, text: 3 };
  function drawItems(ctx, items, pal, onImage) {
    items.slice().sort(function (a, b) { return (ORDER[a.k] || 0) - (ORDER[b.k] || 0); })
      .forEach(function (it) { drawItem(ctx, it, pal, onImage); });
  }

  /* ---------- the desk ---------- */
  function desk(opts) {
    opts = opts || {};
    var d = {
      prefs: prefs(),
      surfaces: [],
      active: null,
      listeners: [],
      onChange: function (fn) { d.listeners.push(fn); },
      changed: function () { d.listeners.forEach(function (fn) { try { fn(); } catch (e) { /* one listener */ } }); },
      setTool: function (tool, quiet) {
        if (tool === "eraser" && d.prefs.tool === "eraser") d.prefs.eraser = d.prefs.eraser === "partial" ? "stroke" : "partial";
        d.prefs.tool = tool;
        savePrefs();
        d.surfaces.forEach(function (s) { s.clearSelection(); s.syncMode(); });
        d.changed();
        if (!quiet) announce(d.describe());
      },
      setRole: function (role) {
        if (d.prefs.tool === "hl") d.prefs.hl.role = role; else d.prefs.pen.role = role;
        savePrefs(); d.changed(); announce(d.describe());
      },
      setWidth: function (w) { d.prefs.pen.w = w; savePrefs(); d.changed(); announce(d.describe()); },
      describe: function () {
        var p = d.prefs, t = p.tool;
        if (t === "eraser") return p.eraser === "partial" ? "Eraser, partial." : "Eraser, whole stroke.";
        if (t === "hl") return "Highlighter, " + roleName(I.HL_ROLES, p.hl.role).toLowerCase() + ".";
        var name = (TOOLS.filter(function (x) { return x[0] === t; })[0] || TOOLS[0])[1];
        if (t === "pen" || t === "shape") return name + ", " + roleName(I.PEN_ROLES, p.pen.role).toLowerCase() + ", " + I.WIDTHS[p.pen.w][0].toLowerCase() + ".";
        return name + ".";
      },
      undo: function () { var s = d.active; if (s && s.undo()) announce("Undid a stroke."); },
      redo: function () { var s = d.active; if (s && s.redo()) announce("Redid a stroke."); },
      canUndo: function () { return !!(d.active && d.active.canUndo()); },
      canRedo: function () { return !!(d.active && d.active.canRedo()); },
      penSeen: function (pressure) {
        var first = !d.prefs.penSeen;
        d.prefs.penSeen = Date.now();
        if (pressure && !d.prefs.pressure) { d.prefs.pressure = true; first = true; }
        savePrefs();
        if (first) d.changed();
      },
      setFinger: function (on) { d.prefs.finger = !!on; savePrefs(); d.surfaces.forEach(function (s) { s.syncMode(); }); d.changed(); },
      nearEnd: opts.nearEnd || null,
      destroy: function () { d.surfaces.slice().forEach(function (s) { s.destroy(); }); d.listeners = []; }
    };
    return d;
  }
  function roleName(list, id) { return (list.filter(function (r) { return r[0] === id; })[0] || list[0])[1]; }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }

  /* ---------- one page ---------- */
  function surface(host, page, dk, opts) {
    opts = opts || {};
    var dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    var ink = el("canvas", { class: "k-ink-canvas", "aria-hidden": "true" });
    var live = el("canvas", { class: "k-ink-live", "aria-hidden": "true" });
    var layer = el("div", { class: "k-ink-layer" });
    host.appendChild(ink); host.appendChild(live); host.appendChild(layer);
    var s = { page: page, host: host };
    var past = [], future = [], saveT = null, sel = [], selMode = "move";
    var scale = 1, w = 0;

    function ctxOf(c) { return c.getContext ? c.getContext("2d") : null; }
    function size() {
      w = host.clientWidth || 0;
      scale = w / I.W;
      [ink, live].forEach(function (c) {
        c.width = Math.max(1, Math.round(w * dpr));
        c.height = Math.max(1, Math.round(w * I.H / I.W * dpr));
      });
    }
    function redraw() {
      var ctx = ctxOf(ink);
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ink.width, ink.height);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      ctx.__inkScale = scale;
      drawItems(ctx, page.items, palette(host), function () { redraw(); });
      paintLive();
    }
    var liveState = null;
    function paintLive() {
      var ctx = ctxOf(live);
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, live.width, live.height);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      ctx.__inkScale = scale;
      var pal = palette(host);
      if (liveState && liveState.item) drawItem(ctx, liveState.item, pal);
      if (liveState && liveState.snapped) {
        ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = pal[dk.prefs.pen.role] || pal.ink; ctx.lineWidth = nib({ k: "pen", w: dk.prefs.pen.w }, scale);
        ctx.beginPath(); liveState.snapped.pts.forEach(function (q, i) { if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.stroke(); ctx.restore();
      }
      if (liveState && liveState.lasso) {
        ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = pal.teal; ctx.lineWidth = 1.6 / scale;
        ctx.beginPath(); liveState.lasso.forEach(function (q, i) { if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.stroke(); ctx.restore();
      }
      if (liveState && liveState.ring) {
        ctx.save(); ctx.strokeStyle = pal.ink; ctx.globalAlpha = 0.6; ctx.lineWidth = 1 / scale;
        ctx.beginPath(); ctx.arc(liveState.ring.x, liveState.ring.y, ERASE_R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      var box = sel.length ? G.boxOf(page.items, sel) : null;
      if (box) {
        ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = pal.text || pal.ink; ctx.lineWidth = 1.4 / scale;
        ctx.strokeRect(box.x - 6, box.y - 6, box.w + 12, box.h + 12); ctx.setLineDash([]);
        ctx.fillStyle = pal.ink;
        corners(box).forEach(function (c) { ctx.beginPath(); ctx.arc(c.x, c.y, 7 / scale, 0, Math.PI * 2); ctx.fill(); });
        ctx.restore();
      }
      paintChips(box);
    }
    function corners(b) {
      return [{ x: b.x - 6, y: b.y - 6, c: "nw" }, { x: b.x + b.w + 6, y: b.y - 6, c: "ne" }, { x: b.x + b.w + 6, y: b.y + b.h + 6, c: "se" }, { x: b.x - 6, y: b.y + b.h + 6, c: "sw" }];
    }

    /* ---- history and saving ---- */
    function commit(items, quiet) {
      past.push(page.items);
      if (past.length > 200) past.shift();
      future = [];
      page.items = items;
      redraw();
      schedule();
      dk.active = s;
      dk.changed();
      if (!quiet && opts.onEdit) opts.onEdit(s);
    }
    function schedule() {
      clearTimeout(saveT);
      saveT = setTimeout(function () { saveT = null; I.savePage(page); }, 300);
    }
    s.flush = function () { if (saveT) { clearTimeout(saveT); saveT = null; I.savePage(page); } };
    s.undo = function () {
      if (!past.length) return false;
      future.push(page.items); page.items = past.pop(); sel = []; redraw(); schedule(); dk.changed(); return true;
    };
    s.redo = function () {
      if (!future.length) return false;
      past.push(page.items); page.items = future.pop(); sel = []; redraw(); schedule(); dk.changed(); return true;
    };
    s.canUndo = function () { return past.length > 0; };
    s.canRedo = function () { return future.length > 0; };
    s.addItems = function (items) { commit(page.items.concat(items)); sel = items.map(function (x) { return x.id; }); dk.setTool("lasso", true); redraw(); };
    s.lastInkBottom = function () {
      var b = G.boxOf(page.items, page.items.map(function (x) { return x.id; }));
      return b ? b.y + b.h : 0;
    };

    /* ---- selection (the lasso's chips, 30a) ---- */
    var chips = null;
    function paintChips(box) {
      if (chips) { chips.remove(); chips = null; }
      if (!box || dk.prefs.tool !== "lasso") return;
      chips = el("div", { class: "k-ink-chips", role: "toolbar", "aria-label": "Selection", "data-ui": "ink.selection" }, [
        chip("Move", "move"), chip("Resize", "resize"),
        KOS.ui.menu({ label: "Recolour", className: "k-btn--sm k-ink-chip", align: "start",
          items: I.PEN_ROLES.map(function (r) { return { label: r[1], onSelect: function () { recolour(r[0]); } }; }) }),
        el("button", { type: "button", class: "k-btn k-btn--sm k-ink-chip", "data-ui": "ink.sel-copy", text: "Copy", onclick: copySel }),
        el("button", { type: "button", class: "k-btn k-btn--sm k-ink-chip", "data-ui": "ink.sel-delete", "data-tone": "danger", text: "Delete", onclick: deleteSel })
      ]);
      chips.style.setProperty("--ink-chip-x", Math.round(box.x * scale) + "px");
      chips.style.setProperty("--ink-chip-y", Math.round((box.y + box.h + 14) * scale) + "px");
      layer.appendChild(chips);
    }
    function chip(label, mode) {
      var b = el("button", { type: "button", class: "k-btn k-btn--sm k-ink-chip", "aria-pressed": String(selMode === mode), text: label,
        onclick: function () { selMode = mode; paintLive(); } });
      KOS.ui.state(b, "on", selMode === mode);
      return b;
    }
    function recolour(role) {
      var set = {}; sel.forEach(function (id) { set[id] = 1; });
      commit(page.items.map(function (it) { return set[it.id] && it.k !== "img" ? Object.assign({}, it, { role: it.k === "hl" ? (I.HL_ROLES.some(function (r) { return r[0] === role; }) ? role : it.role) : role }) : it; }));
    }
    function copySel() {
      var set = {}; sel.forEach(function (id) { set[id] = 1; });
      var copies = page.items.filter(function (it) { return set[it.id]; }).map(function (it) { return Object.assign({}, it, { id: I.uid() }); });
      var ids = copies.map(function (c) { return c.id; });
      var moved = G.transform(copies, ids, function (x, y) { return { x: x + 24, y: y + 24 }; });
      commit(page.items.concat(moved));
      sel = ids; paintLive();
      announce("Copied the selection.");
    }
    function deleteSel() {
      var set = {}; sel.forEach(function (id) { set[id] = 1; });
      var n = sel.length;
      sel = [];
      commit(page.items.filter(function (it) { return !set[it.id]; }));
      announce(n === 1 ? "Deleted one item." : "Deleted " + n + " items.");
    }
    s.clearSelection = function () { if (sel.length) { sel = []; paintLive(); } closeText(true); };

    /* ---- text boxes (Scribble works in them) ---- */
    var textBox = null;
    function openText(at, existing) {
      closeText(false);
      var ta = el("textarea", { class: "k-ink-text", "data-ui": "ink.text", rows: "2", "aria-label": "Text on the page" });
      ta.value = existing ? existing.s : "";
      ta.style.setProperty("--ink-chip-x", Math.round(at.x * scale) + "px");
      ta.style.setProperty("--ink-chip-y", Math.round(at.y * scale) + "px");
      ta.style.setProperty("--ink-text-size", (I.TEXT_SIZE * scale).toFixed(1) + "px");
      layer.appendChild(ta);
      textBox = { ta: ta, at: at, id: existing ? existing.id : null };
      if (existing) { page.items = page.items.filter(function (x) { return x.id !== existing.id; }); textBox.was = existing; redraw(); }
      ta.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { e.preventDefault(); closeText(false); }
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); closeText(true); }
      });
      ta.addEventListener("blur", function () { setTimeout(function () { if (textBox && textBox.ta === ta) closeText(true); }, 0); });
      setTimeout(function () { ta.focus(); }, 0);
    }
    function closeText(keep) {
      if (!textBox) return;
      var tb = textBox, txt = tb.ta.value.replace(/\s+$/, "");
      textBox = null;
      tb.ta.remove();
      var rest = page.items.filter(function (x) { return !tb.was || x.id !== tb.was.id; });
      if (tb.was) page.items = rest.concat([tb.was]); /* put it back before deciding */
      if (keep && txt) {
        var item = { id: tb.was ? tb.was.id : I.uid(), k: "text", role: tb.was ? tb.was.role : dk.prefs.pen.role, x: tb.at.x, y: tb.at.y, s: txt };
        commit(rest.concat([item]));
      } else if (keep && tb.was) {
        commit(rest);
      } else redraw();
    }

    /* ---- input ---- */
    var ERASE_R = 9;
    function toPage(e) {
      var r = live.getBoundingClientRect();
      return { x: (e.clientX - r.left) / (r.width || 1) * I.W, y: (e.clientY - r.top) / (r.height || 1) * I.H };
    }
    function draws(e) {
      if (e.pointerType === "pen") return true;
      if (e.pointerType === "mouse") return e.button === 0;
      return dk.prefs.finger;
    }
    var stroke = null, holdT = null, lastMoveAt = 0;
    function startHold() {
      clearTimeout(holdT);
      if (dk.prefs.tool !== "pen" || !stroke) return;
      holdT = setTimeout(function () {
        if (!stroke) return;
        var sn = G.snap(stroke.list);
        if (sn) { liveState.snapped = sn; paintLive(); }
      }, 400);
    }
    function pointOf(e, prev) {
      var q = toPage(e), now = e.timeStamp || Date.now();
      var pr = e.pointerType === "pen" && e.pressure > 0 && e.pressure !== 0.5 ? Math.round(e.pressure * 255) : 0;
      q.pr = pr; q.dt = prev ? Math.max(0, now - prev.at) : 0; q.at = now;
      return q;
    }
    function onDown(e) {
      if (!draws(e)) return;
      if (e.pointerType === "pen") dk.penSeen(e.pressure > 0 && e.pressure !== 0.5);
      e.preventDefault();
      try { live.setPointerCapture(e.pointerId); } catch (x) { /* capture refused */ }
      dk.active = s;
      var tool = dk.prefs.tool, q = toPage(e);
      if (tool === "text") {
        var hit = page.items.filter(function (it) { return it.k === "text" && G.hitItem(it, q.x, q.y, 4); }).pop();
        openText(hit ? { x: hit.x, y: hit.y } : q, hit || null);
        return;
      }
      if (tool === "lasso") {
        var box = sel.length ? G.boxOf(page.items, sel) : null;
        if (box) {
          var corner = corners(box).filter(function (c) { return Math.hypot(c.x - q.x, c.y - q.y) < 22 / Math.max(scale, 0.3); })[0];
          var inside = q.x >= box.x - 6 && q.x <= box.x + box.w + 6 && q.y >= box.y - 6 && q.y <= box.y + box.h + 6;
          if (corner || inside) {
            stroke = { kind: corner || selMode === "resize" ? "resize" : "move", from: q, base: page.items, box: box, corner: corner ? corner.c : "se" };
            return;
          }
          sel = [];
        }
        stroke = { kind: "lasso", list: [q] };
        liveState = { lasso: stroke.list };
        paintLive();
        return;
      }
      if (tool === "eraser") {
        stroke = { kind: "erase", base: page.items, items: page.items };
        liveState = { ring: q };
        eraseAt(q);
        return;
      }
      var first = pointOf(e, null);
      stroke = { kind: tool, list: [first], last: first };
      liveState = { item: liveItem() };
      lastMoveAt = first.at;
      startHold();
      paintLive();
    }
    function liveItem(list) {
      var p = dk.prefs, k = p.tool === "hl" ? "hl" : "pen";
      return { id: "live", k: k, role: k === "hl" ? p.hl.role : p.pen.role, w: p.pen.w, p: G.pack(list || stroke.list) };
    }
    function eraseAt(q) {
      /* a fast swipe samples sparsely: erase along the path between
         samples too, so nothing it crossed is skipped */
      var from = stroke.at || q, n = Math.max(1, Math.ceil(Math.hypot(q.x - from.x, q.y - from.y) / (ERASE_R * 0.8)));
      var changed = false;
      for (var i = 1; i <= n; i++) {
        var x = from.x + (q.x - from.x) * i / n, y = from.y + (q.y - from.y) * i / n;
        var out = G.erase(stroke.items, x, y, ERASE_R, dk.prefs.eraser);
        if (out) { stroke.items = out; changed = true; }
      }
      stroke.at = q;
      if (changed) { page.items = stroke.items; redraw(); }
    }
    function onMove(e) {
      if (!stroke) {
        if (dk.prefs.tool === "eraser" && (e.pointerType === "pen" || e.pointerType === "mouse")) { liveState = { ring: toPage(e) }; paintLive(); }
        return;
      }
      e.preventDefault();
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      if (!evs || !evs.length) evs = [e];
      if (stroke.kind === "erase") { evs.forEach(function (x) { eraseAt(toPage(x)); }); liveState = { ring: toPage(e) }; paintLive(); return; }
      if (stroke.kind === "lasso") { evs.forEach(function (x) { stroke.list.push(toPage(x)); }); paintLive(); return; }
      if (stroke.kind === "move" || stroke.kind === "resize") {
        var q = toPage(e), b = stroke.box, fn;
        if (stroke.kind === "move") { var dx = q.x - stroke.from.x, dy = q.y - stroke.from.y; fn = function (x, y) { return { x: x + dx, y: y + dy }; }; }
        else {
          /* scale from the opposite corner */
          var ox = /w/.test(stroke.corner) ? b.x + b.w : b.x, oy = /n/.test(stroke.corner) ? b.y + b.h : b.y;
          var sx = Math.max(0.1, Math.abs(q.x - ox) / Math.max(1, b.w)), sy = Math.max(0.1, Math.abs(q.y - oy) / Math.max(1, b.h)), k = Math.max(sx, sy);
          fn = function (x, y) { return { x: ox + (x - ox) * k, y: oy + (y - oy) * k }; };
        }
        page.items = G.transform(stroke.base, sel, fn);
        redraw();
        return;
      }
      evs.forEach(function (x) {
        var q = pointOf(x, stroke.last);
        if (Math.hypot(q.x - stroke.last.x, q.y - stroke.last.y) < 0.6) return;
        stroke.list.push(q); stroke.last = q;
        if (Math.hypot(q.x - stroke.list[Math.max(0, stroke.list.length - 4)].x, q.y - stroke.list[Math.max(0, stroke.list.length - 4)].y) > 2) {
          if (liveState.snapped) { liveState.snapped = null; }
          startHold();
        }
      });
      liveState.item = liveItem();
      paintLive();
    }
    function onUp(e) {
      clearTimeout(holdT);
      if (!stroke) return;
      var st = stroke;
      stroke = null;
      try { live.releasePointerCapture(e.pointerId); } catch (x) { /* released */ }
      if (st.kind === "erase") {
        liveState = null;
        if (st.items !== st.base) { page.items = st.base; commit(st.items); } else paintLive();
        return;
      }
      if (st.kind === "lasso") {
        liveState = null;
        sel = G.lassoPick(page.items, st.list);
        selMode = "move";
        paintLive();
        if (sel.length) announce(sel.length === 1 ? "One item selected." : sel.length + " items selected.");
        return;
      }
      if (st.kind === "move" || st.kind === "resize") {
        var moved = page.items;
        page.items = st.base;
        if (moved !== st.base) commit(moved);
        return;
      }
      var snapped = liveState && liveState.snapped || (st.kind === "shape" ? G.snap(st.list) : null);
      var item = liveItem(st.list);
      item.id = I.uid();
      if (snapped) { item.p = G.pack(snapped.pts.map(function (q) { return { x: q.x, y: q.y }; })); item.sh = snapped.sh; item.k = "pen"; }
      liveState = null;
      if (st.list.length === 1 && !snapped) item.p = G.pack([st.list[0], { x: st.list[0].x + 0.2, y: st.list[0].y, pr: st.list[0].pr, dt: 16 }]);
      commit(page.items.concat([item]));
      var bottom = G.bbox(G.pts(item)).y + G.bbox(G.pts(item)).h;
      if (opts.nearEnd && bottom > I.H - 90) opts.nearEnd(s);
    }
    function onCancel() { clearTimeout(holdT); if (stroke && stroke.base) page.items = stroke.base; stroke = null; liveState = null; redraw(); }
    live.addEventListener("pointerdown", onDown);
    live.addEventListener("pointermove", onMove);
    live.addEventListener("pointerup", onUp);
    live.addEventListener("pointercancel", onCancel);
    live.addEventListener("pointerleave", function () { if (!stroke && liveState && liveState.ring) { liveState = null; paintLive(); } });

    /* touch: the pen never scrolls or waits for Scribble; a finger
       scrolls unless finger drawing is on; a quick two-finger tap undoes */
    var two = null;
    function onTouchStart(e) {
      var ts = e.touches, stylus = [].some.call(e.changedTouches || [], function (t) { return t.touchType === "stylus"; });
      if (stylus || (dk.prefs.finger && ts.length === 1)) { e.preventDefault(); return; }
      if (ts.length === 2) {
        two = { at: Date.now(), pts: [].map.call(ts, function (t) { return { id: t.identifier, x: t.clientX, y: t.clientY }; }), moved: 0 };
        /* in finger mode the first finger of the pair began a stroke: it is
           the gesture, not ink, so the undo reaches the stroke before it.
           A pen's stroke is never cancelled by a resting hand. */
        var penDown = [].some.call(ts, function (t) { return t.touchType === "stylus"; });
        if (stroke && !penDown) onCancel();
      }
      else if (ts.length > 2) two = null;
    }
    function onTouchMove(e) {
      if (!two) return;
      [].forEach.call(e.touches, function (t) {
        var p = two.pts.filter(function (q) { return q.id === t.identifier; })[0];
        if (p) two.moved = Math.max(two.moved, Math.hypot(t.clientX - p.x, t.clientY - p.y));
      });
    }
    function onTouchEnd(e) {
      if (!two || e.touches.length) return;
      var t = two;
      two = null;
      if (Date.now() - t.at < 200 && t.moved < 10) { dk.active = s; dk.undo(); }
    }
    host.addEventListener("touchstart", onTouchStart, { passive: false });
    host.addEventListener("touchmove", onTouchMove, { passive: true });
    host.addEventListener("touchend", onTouchEnd);

    s.syncMode = function () {
      KOS.ui.state(host, "finger", dk.prefs.finger);
      host.setAttribute("data-tool", dk.prefs.tool);
      if (dk.prefs.tool !== "lasso" && sel.length) { sel = []; paintLive(); }
    };
    var ro = null;
    if (typeof window.ResizeObserver === "function") {
      try { ro = new window.ResizeObserver(function () { if ((host.clientWidth || 0) !== w) { size(); redraw(); } }); ro.observe(host); } catch (e) { ro = null; }
    }
    s.redraw = function () { size(); redraw(); };
    s.destroy = function () {
      s.flush();
      closeText(true);
      if (ro) ro.disconnect();
      host.removeEventListener("touchstart", onTouchStart);
      [ink, live, layer].forEach(function (n) { n.remove(); });
      dk.surfaces = dk.surfaces.filter(function (x) { return x !== s; });
      if (dk.active === s) dk.active = null;
    };
    /* for tests: draw a stroke without pointer events */
    s._stroke = function (points, kind) {
      var it = { id: I.uid(), k: kind === "hl" ? "hl" : "pen", role: kind === "hl" ? dk.prefs.hl.role : dk.prefs.pen.role, w: dk.prefs.pen.w, p: G.pack(points) };
      commit(page.items.concat([it]));
      return it;
    };
    s._select = function (ids) { sel = ids.slice(); paintLive(); };
    s.syncMode();
    size();
    redraw();
    dk.surfaces.push(s);
    return s;
  }

  /* ---------- the toolbar (30a) ---------- */
  var GLYPH = {
    pen: [["path", { d: "M4 20l4-1 10-10-3-3L5 16z" }], ["path", { d: "M13.5 6.5l3 3" }]],
    hl: [["path", { d: "M6 15l3 3 9-9-3-3z" }], ["path", { d: "M5 21h7" }]],
    eraser: [["path", { d: "M4 16l8-8 6 6-6 6H8z" }], ["path", { d: "M10 20h10" }]],
    lasso: [["ellipse", { cx: "12", cy: "10", rx: "8", ry: "5", "stroke-dasharray": "3 2.5" }], ["path", { d: "M9 15c0 3 2 5 4 5" }]],
    shape: [["circle", { cx: "9", cy: "14", r: "5" }], ["rect", { x: "11", y: "4", width: "9", height: "9", rx: "1" }]],
    text: [["path", { d: "M5 6V4h14v2M12 4v16M9 20h6" }]],
    image: [["rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }], ["circle", { cx: "9", cy: "10", r: "1.6" }], ["path", { d: "M21 16l-5-5-9 8" }]],
    undo: [["path", { d: "M9 7L4 12l5 5" }], ["path", { d: "M4 12h10a6 6 0 010 12h-3", transform: "translate(0 -6)" }]],
    redo: [["path", { d: "M15 7l5 5-5 5" }], ["path", { d: "M20 12H10a6 6 0 000 12h3", transform: "translate(0 -6)" }]],
    paper: [["rect", { x: "5", y: "3", width: "14", height: "18", rx: "2" }], ["path", { d: "M8 8h8M8 12h8M8 16h5" }]]
  };
  function glyph(name) {
    var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8"); svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("class", "k-ink-glyph");
    (GLYPH[name] || []).forEach(function (part) {
      var n = document.createElementNS(NS, part[0]);
      Object.keys(part[1]).forEach(function (k) { n.setAttribute(k, part[1][k]); });
      svg.appendChild(n);
    });
    return svg;
  }
  function toolBtn(id, label, attrs) {
    return el("button", Object.assign({ type: "button", class: "k-ink-tool", "data-ui": "ink.tool", "data-tool": id }, attrs || {}), [
      glyph(id), el("span", { class: "k-ink-tool-l", text: label })]);
  }
  function papersPicker(current, onPick) {
    return el("div", { class: "k-ink-papers", role: "radiogroup", "aria-label": "Paper" }, I.PAPERS.map(function (p) {
      var on = p[0] === current;
      var b = el("button", { type: "button", class: "k-chip k-ink-paper-chip", role: "radio", "aria-checked": String(on), "data-ui": "ink.paper-chip", "data-paper": p[0],
        onclick: function () { onPick(p[0]); } }, [el("span", { class: "k-ink-paper-swatch", "data-paper": p[0], "aria-hidden": "true" }), el("span", { text: p[1] })]);
      KOS.ui.state(b, "on", on);
      return b;
    }));
  }
  function toolbar(dk, opts) {
    opts = opts || {};
    var bar = el("div", { class: "k-ink-bar", role: "toolbar", "aria-label": "Ink tools", "data-ui": "ink.toolbar" });
    var tools = el("div", { class: "k-ink-group", role: "radiogroup", "aria-label": "Tool" });
    TOOLS.forEach(function (t) {
      tools.appendChild(toolBtn(t[0], t[1], { role: "radio", title: t[1] + " (" + t[2] + ")", onclick: function () { dk.setTool(t[0]); } }));
    });
    var imgInput = el("input", { type: "file", accept: "image/*", class: "k-ink-file", "aria-hidden": "true", tabindex: "-1" });
    imgInput.addEventListener("change", function () {
      var f = imgInput.files && imgInput.files[0];
      imgInput.value = "";
      if (f && opts.onImage) readImage(f, opts.onImage);
    });
    tools.appendChild(toolBtn("image", "Image", { title: "A picture from Photos or Files", "data-ui": "ink.tool ink.image", onclick: function () { imgInput.click(); } }));
    tools.appendChild(imgInput);

    /* colour and width: inline when the bar has room, else one button */
    var colour = el("div", { class: "k-ink-group k-ink-colour", "data-ui": "ink.colour" });
    var undoB = toolBtn("undo", "Undo", { title: "Undo (⌘Z)", "data-ui": "ink.undo", onclick: function () { dk.undo(); } });
    var redoB = toolBtn("redo", "Redo", { title: "Redo (⇧⌘Z)", "data-ui": "ink.redo", onclick: function () { dk.redo(); } });
    var hist = el("div", { class: "k-ink-group" }, [undoB, redoB]);
    var paperSlot = el("div", { class: "k-ink-group" });
    var extra = el("div", { class: "k-ink-group k-ink-extra" });
    bar.appendChild(tools); bar.appendChild(colour); bar.appendChild(hist); bar.appendChild(paperSlot); bar.appendChild(extra);
    if (opts.extra) opts.extra.forEach(function (n) { extra.appendChild(n); });

    function swatches() {
      var hl = dk.prefs.tool === "hl", roles = hl ? I.HL_ROLES : I.PEN_ROLES, cur = hl ? dk.prefs.hl.role : dk.prefs.pen.role;
      return el("div", { class: "k-ink-swatches", role: "radiogroup", "aria-label": hl ? "Highlighter colour" : "Pen colour" }, roles.map(function (r) {
        var b = el("button", { type: "button", class: "k-ink-swatch", role: "radio", "aria-checked": String(r[0] === cur), "aria-label": r[1], title: r[1],
          "data-role": r[0], "data-ui": "ink.swatch", onclick: function () { dk.setRole(r[0]); } });
        if (hl) KOS.ui.state(b, "hl", true);
        return b;
      }));
    }
    function widthsGroup() {
      return el("div", { class: "k-ink-widths", role: "radiogroup", "aria-label": "Width" }, I.WIDTHS.map(function (wd, i) {
        return el("button", { type: "button", class: "k-ink-width", role: "radio", "aria-checked": String(dk.prefs.pen.w === i), "aria-label": wd[0], title: wd[0] + " · " + wd[1] + " mm",
          "data-w": String(i), "data-ui": "ink.width", onclick: function () { dk.setWidth(i); } }, [el("span", { class: "k-ink-width-dot", "aria-hidden": "true" })]);
      }));
    }
    function colourLabel() {
      var hl = dk.prefs.tool === "hl";
      return hl ? roleName(I.HL_ROLES, dk.prefs.hl.role) : roleName(I.PEN_ROLES, dk.prefs.pen.role) + " · " + I.WIDTHS[dk.prefs.pen.w][0];
    }
    function paintColour() {
      colour.innerHTML = "";
      var t = dk.prefs.tool, applies = t === "pen" || t === "hl" || t === "shape" || t === "text";
      KOS.ui.state(colour, "off", !applies);
      if (!applies) return;
      if (KOS.ui.hasState(bar, "wide")) {
        colour.appendChild(swatches());
        if (t !== "hl") colour.appendChild(widthsGroup());
        return;
      }
      var m = KOS.ui.menu({ label: colourLabel(), className: "k-ink-tool k-ink-colour-btn", align: "start", panelClass: "k-ink-pop",
        render: function (panel) {
          panel.appendChild(el("div", { class: "k-kicker", text: t === "hl" ? "Highlighter" : "Pen" }));
          panel.appendChild(swatches());
          if (t !== "hl") { panel.appendChild(el("div", { class: "k-kicker", text: "Width" })); panel.appendChild(widthsGroup()); }
          panel.appendChild(el("p", { class: "k-ink-pop-note", text: dk.prefs.pressure ? "Width follows your pressure." : "This pen reports no pressure, so the width follows your speed." }));
        } });
      m.setAttribute("data-ui", "ui.menu-button ink.colour-btn");
      m.insertBefore(el("span", { class: "k-ink-dot", "data-role": t === "hl" ? dk.prefs.hl.role : dk.prefs.pen.role, "aria-hidden": "true" }), m.firstChild);
      colour.appendChild(m);
    }
    function paintPaper() {
      paperSlot.innerHTML = "";
      if (!opts.paper) return;
      var cur = opts.paper.get();
      var m = KOS.ui.menu({ label: (I.PAPERS.filter(function (p) { return p[0] === cur; })[0] || I.PAPERS[1])[1], className: "k-ink-tool k-ink-paper-btn", align: "start", panelClass: "k-ink-pop",
        render: function (panel, close) {
          panel.appendChild(el("div", { class: "k-kicker", text: "Paper" }));
          panel.appendChild(papersPicker(cur, function (p) { opts.paper.set(p); close(); paintPaper(); }));
          panel.appendChild(el("p", { class: "k-ink-pop-note", text: "Changing it here changes this page and the pages you add next; other pages keep their paper." }));
        } });
      m.setAttribute("data-ui", "ui.menu-button ink.paper");
      m.insertBefore(glyph("paper"), m.firstChild);
      paperSlot.appendChild(m);
    }
    function paint() {
      [].forEach.call(tools.querySelectorAll("[role='radio']"), function (b) {
        var on = b.getAttribute("data-tool") === dk.prefs.tool;
        b.setAttribute("aria-checked", String(on));
        b.tabIndex = on ? 0 : -1;
        KOS.ui.state(b, "on", on);
        if (b.getAttribute("data-tool") === "eraser") {
          b.querySelector(".k-ink-tool-l").textContent = dk.prefs.eraser === "partial" ? "Eraser" : "Whole";
          b.title = dk.prefs.eraser === "partial" ? "Eraser · erases only what it touches (tap again for whole strokes)" : "Eraser · whole strokes (tap again to erase only what it touches)";
        }
      });
      undoB.disabled = !dk.canUndo();
      redoB.disabled = !dk.canRedo();
      paintColour();
      paintPaper();
    }
    dk.onChange(paint);

    /* room for the swatches inline? (30a: only with both side panels
       folded in landscape) */
    function measure() {
      var wide = (bar.clientWidth || 0) >= 900;
      if (wide !== KOS.ui.hasState(bar, "wide")) { KOS.ui.state(bar, "wide", wide); paintColour(); }
    }
    if (typeof window.ResizeObserver === "function") {
      try { new window.ResizeObserver(measure).observe(bar); } catch (e) { /* no layout */ }
    }
    /* one toolbar: arrows move, Space or Enter picks */
    bar.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var all = [].filter.call(bar.querySelectorAll("button"), function (b) { return !b.disabled && b.offsetParent !== null; });
      var i = all.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var n = all[(i + (e.key === "ArrowRight" ? 1 : all.length - 1)) % all.length];
      if (n) n.focus();
    });
    paint();
    measure();
    bar.paint = paint;
    return bar;
  }

  /* a picture, downscaled to at most 1400 px and kept as a data URL */
  function readImage(file, cb) {
    var rd = new FileReader();
    rd.onload = function () {
      var im = new Image();
      im.onload = function () {
        var k = Math.min(1, 1400 / Math.max(im.naturalWidth, im.naturalHeight));
        var c = document.createElement("canvas");
        c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        var x = c.getContext && c.getContext("2d");
        if (!x) { cb(rd.result, im.naturalWidth, im.naturalHeight); return; }
        x.drawImage(im, 0, 0, c.width, c.height);
        cb(c.toDataURL("image/jpeg", 0.86), c.width, c.height);
      };
      im.src = rd.result;
    };
    rd.readAsDataURL(file);
  }

  /* keyboard shortcuts while a desk is on screen: P H E L S T, ⌘Z ⇧⌘Z */
  function shortcuts(dk, root) {
    function onKey(e) {
      if (!root.isConnected) { document.removeEventListener("keydown", onKey); return; }
      var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z") && !typing) {
        e.preventDefault();
        if (e.shiftKey) dk.redo(); else dk.undo();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      var hit = TOOLS.filter(function (x) { return x[2].toLowerCase() === String(e.key).toLowerCase(); })[0];
      if (hit) { e.preventDefault(); dk.setTool(hit[0]); }
    }
    document.addEventListener("keydown", onKey);
    return function () { document.removeEventListener("keydown", onKey); };
  }

  KOS.inkUI = { prefs: prefs, palette: palette, desk: desk, surface: surface, toolbar: toolbar, shortcuts: shortcuts,
    papersPicker: papersPicker, glyph: glyph, drawItems: drawItems, TOOLS: TOOLS };
})();
