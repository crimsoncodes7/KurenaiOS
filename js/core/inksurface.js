/* Kurenai OS — core/inksurface.js
   The ink engine's surfaces, desk and toolbar (js/core/inkui.js's page
   part, 1F): loaded with the ink-ui bundle by the pages that write (the
   topic page, Review, the exams pages, Creatives) and before a file opens
   in the viewer. The settings, palette, drawing and dialog stay at boot
   in inkui.js, which this file extends. */
(function () {
  "use strict";
  var I = KOS.ink, G = I.geo, U = KOS.inkUI;
  function el() { return KOS.ui.el.apply(null, arguments); }
  var prefs = U.prefs, savePrefs = U.savePrefs, palette = U.palette, drawItems = U.drawItems, drawItem = U.drawItem,
    strokePath = U.strokePath, nib = U.nib, withSet = U.withSet, roleName = U.roleName, announce = U.announce, TOOLS = U.TOOLS, dialog = U.dialog;

  /* what a long press says (30b): the tool, its mode, the gesture that
     changes it */
  var TIPS = {
    pen: function (p) { return ["Pen · " + roleName(I.PEN_ROLES, p.pen.role) + " · " + I.WIDTHS[p.pen.w][0], "Hold still at the end of a stroke to snap it to a shape. Colour and width are beside the tools."]; },
    hl: function (p) { return ["Highlight · " + roleName(I.HL_ROLES, p.hl.role), "Sits under the ink, never over it."]; },
    eraser: function (p) { return p.eraser === "partial" ? ["Eraser · Partial", "Erases only what it touches, splitting the stroke. Tap the eraser again for Whole stroke."] : ["Eraser · Whole stroke", "Takes the whole stroke it touches. Tap the eraser again for Partial."]; },
    lasso: function () { return ["Lasso", "Loop round ink to Move, Resize, Recolour, Copy or Delete it."]; },
    shape: function () { return ["Shape", "Every stroke snaps to a line, rectangle, triangle or ellipse."]; },
    ruler: function () { return ["Ruler", "Two fingers place and turn it (drag it with a mouse); the pen draws along its edge."]; },
    text: function () { return ["Text", "Tap the page for a box that takes typing or Scribble."]; },
    image: function () { return ["Image", "A picture from Photos or Files. You can also paste one, or drop it on the page."]; },
    table: function () { return ["Table", "A ruled table on the page. Tap a cell with Text to type in it; select it with the Lasso to add or take away rows and columns."]; },
    paste: function () { return ["Paste", "Puts the picture on your clipboard onto the page (a screenshot, or one copied from Photos or Safari)."]; },
    undo: function () { return ["Undo", "Or tap the page with two fingers, or ⌘Z."]; },
    redo: function () { return ["Redo", "⇧⌘Z."]; },
    paper: function () { return ["Paper", "For new pages; pages already written keep theirs."]; },
    float: function () { return ["Float", "Turns the bar into a palette you can drag anywhere."]; }
  };
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
      /* the size step of the tool in hand */
      setWidth: function (w) {
        var t = d.prefs.tool;
        if (t === "hl") d.prefs.hl.w = w;
        else if (t === "eraser") d.prefs.eraserW = w;
        else if (t === "text") d.prefs.textW = w;
        else d.prefs.pen.w = w;
        savePrefs(); d.changed(); announce(d.describe());
      },
      setEraser: function (mode) { d.prefs.eraser = mode === "stroke" ? "stroke" : "partial"; savePrefs(); d.changed(); announce(d.describe()); },
      setLasso: function (mode) { d.prefs.lasso = mode === "box" ? "box" : "free"; savePrefs(); d.changed(); announce(d.describe()); },
      dprCap: opts.dprCap || 2,
      describe: function () {
        var p = d.prefs, t = p.tool;
        if (t === "eraser") return (p.eraser === "partial" ? "Eraser, partial, " : "Eraser, whole stroke, ") + I.ERASER_SIZES[p.eraserW][0].toLowerCase() + ".";
        if (t === "hl") return "Highlighter, " + roleName(I.HL_ROLES, p.hl.role).toLowerCase() + ", " + I.HL_WIDTHS[p.hl.w][0].toLowerCase() + ".";
        if (t === "text") return "Text, " + roleName(I.PEN_ROLES, p.pen.role).toLowerCase() + ", " + I.TEXT_SIZES[p.textW][0].toLowerCase() + ".";
        if (t === "lasso") return p.lasso === "box" ? "Lasso, box." : "Lasso, freehand.";
        var name = (TOOLS.filter(function (x) { return x[0] === t; })[0] || TOOLS[0])[1];
        if (t === "pen" || t === "shape" || t === "ruler") return name + ", " + roleName(I.PEN_ROLES, p.pen.role).toLowerCase() + ", " + I.WIDTHS[p.pen.w][0].toLowerCase() + ".";
        return name + ".";
      },
      /* Momentum (Creatives' timed drills): every line is committed, so undo does nothing */
      undo: function () { if (opts.noUndo) return; var s = d.active; if (s && s.undo()) announce("Undid a stroke."); },
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
      setDock: function (mode) {
        d.prefs.dock = mode === "float" ? "float" : "dock";
        savePrefs();
        if (d.onDock) d.onDock();
        d.changed();
        announce(mode === "float" ? "Tools floating. Drag ⠿ to move them." : "Tools docked.");
      },
      /* a picture on the page in use, under its last ink (or the next page
         when it does not fit, through the host's own `place`) */
      placeImage: function (src, iw, ih, extra) {
        var sf = d.active && d.active.host.isConnected ? d.active : d.surfaces.filter(function (x) { return x.host.isConnected && !x.readOnly; })[0];
        if (!sf) { announce("Open a page to put the picture on."); return false; }
        if (opts.placeImage) return opts.placeImage(sf, src, iw, ih, extra);
        var hgt0 = I.pageH(sf.page), wdt = Math.min(600, iw), hgt = wdt * ih / Math.max(1, iw);
        if (hgt > hgt0 * 0.7) { hgt = hgt0 * 0.7; wdt = hgt * iw / Math.max(1, ih); }
        var y = Math.min(hgt0 - hgt - 30, Math.max(40, sf.lastInkBottom() + 30));
        sf.addItems([Object.assign({ id: I.uid(), k: "img", x: 60, y: Math.max(10, Math.round(y)), w: Math.round(wdt), h: Math.round(hgt), src: src }, extra || {})]);
        announce("Picture added to the page.");
        return true;
      },
      /* a 3 × 3 table under the page's last ink, selected so it can be moved */
      placeTable: function () {
        var sf = d.active && d.active.host.isConnected && !d.active.readOnly ? d.active : d.surfaces.filter(function (x) { return x.host.isConnected && !x.readOnly; })[0];
        if (!sf) { announce("Open a page to put the table on."); return null; }
        var sz = I.TEXT_SIZES[d.prefs.textW][1], t = G.newTable(60, 0, 3, 3, sz);
        var bx = G.itemBox(t), hgt = I.pageH(sf.page);
        t.y = Math.round(Math.max(40, Math.min(hgt - bx.h - 30, sf.lastInkBottom() + 30)));
        t.role = d.prefs.pen.role;
        sf.addItems([t]);
        announce("A 3 by 3 table added. Tap a cell with the Text tool to type in it.");
        return t;
      },
      onDestroy: function (fn) { d.destroyers.push(fn); },
      destroyers: [],
      nearEnd: opts.nearEnd || null,
      destroy: function () {
        d.surfaces.slice().forEach(function (s) { s.destroy(); });
        d.listeners = [];
        d.destroyers.splice(0).forEach(function (fn) { try { fn(); } catch (e) { /* one */ } });
      }
    };
    /* paste and drop (asked for 26 October 2026): a picture on the
       clipboard, or dropped on a page, lands on the page in use */
    function onPaste(e) {
      if (!d.surfaces.some(function (x) { return x.host.isConnected; })) { document.removeEventListener("paste", onPaste); return; }
      var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (typing) return;
      var files = [].filter.call((e.clipboardData && e.clipboardData.files) || [], function (f) { return /^image\//.test(f.type); });
      if (!files.length) {
        var items = [].filter.call((e.clipboardData && e.clipboardData.items) || [], function (it) { return it.kind === "file" && /^image\//.test(it.type); });
        files = items.map(function (it) { return it.getAsFile(); }).filter(Boolean);
      }
      if (!files.length) return;
      e.preventDefault();
      files.forEach(function (f) { readImage(f, function (src, iw, ih) { d.placeImage(src, iw, ih); }); });
    }
    document.addEventListener("paste", onPaste);
    d.onDestroy(function () { document.removeEventListener("paste", onPaste); });
    d.dropOn = function (node) {
      node.addEventListener("dragover", function (e) { if (e.dataTransfer && [].some.call(e.dataTransfer.types || [], function (x) { return x === "Files"; })) { e.preventDefault(); KOS.ui.state(node, "drop", true); } });
      node.addEventListener("dragleave", function () { KOS.ui.state(node, "drop", false); });
      node.addEventListener("drop", function (e) {
        KOS.ui.state(node, "drop", false);
        var files = [].filter.call((e.dataTransfer && e.dataTransfer.files) || [], function (f) { return /^image\//.test(f.type); });
        if (!files.length) return;
        e.preventDefault();
        var hostSf = d.surfaces.filter(function (x) { return x.host.contains(e.target); })[0];
        if (hostSf) d.active = hostSf;
        files.forEach(function (f) { readImage(f, function (src, iw, ih) { d.placeImage(src, iw, ih); }); });
      });
    };
    return d;
  }
  /* ---------- one page ---------- */
  /* the backing store's ceiling (files plan §4, iPad Safari's canvas
     memory): a ratio of 2 with one pane, 1.5 with two, and no side over
     4096 px. The cap lowers the ratio, never the page. */
  var MAX_SIDE = 4096;
  /* every surface on screen, and when a pen last touched one: a page is
     not redrawn under writing in progress (KOS.rerender asks busy()) */
  var allSurfaces = [], lastInk = 0;
  function busy() {
    if (Date.now() - lastInk < 1500) return true;
    return allSurfaces.some(function (x) { return x.host.isConnected && x.busy(); });
  }
  function surface(host, page, dk, opts) {
    opts = opts || {};
    var cap = opts.dprCap || dk.dprCap || 2;
    var dpr = Math.max(1, Math.min(cap, window.devicePixelRatio || 1));
    var ink = el("canvas", { class: "k-ink-canvas", "aria-hidden": "true" });
    var live = el("canvas", { class: "k-ink-live", "aria-hidden": "true" });
    var layer = el("div", { class: "k-ink-layer" });
    host.appendChild(ink); host.appendChild(live); host.appendChild(layer);
    var s = { page: page, host: host, readOnly: !!opts.readOnly };
    var past = [], future = [], saveT = null, sel = [], selMode = "move";
    var scale = 1, w = 0;

    function ctxOf(c) { return c.getContext ? c.getContext("2d") : null; }
    function ph() { return I.pageH(page); }
    host.style.setProperty("--ink-h", String(ph()));
    function size() {
      w = host.clientWidth || 0;
      scale = w / I.W;
      var hpx = w * ph() / I.W, k = Math.min(dpr, MAX_SIDE / Math.max(1, w), MAX_SIDE / Math.max(1, hpx));
      k = Math.max(0.5, k);
      s.k = k;
      [ink, live].forEach(function (c) {
        c.width = Math.max(1, Math.round(w * k));
        c.height = Math.max(1, Math.round(hpx * k));
      });
    }
    function redraw() {
      var ctx = ctxOf(ink);
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ink.width, ink.height);
      ctx.setTransform(scale * s.k, 0, 0, scale * s.k, 0, 0);
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
      ctx.setTransform(scale * s.k, 0, 0, scale * s.k, 0, 0);
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
        ctx.beginPath(); ctx.arc(liveState.ring.x, liveState.ring.y, eraseR(), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      if (dk.prefs.tool === "ruler") drawRuler(ctx, pal);
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
    /* ---- the ruler (30a: two fingers place it, the pen draws along it) ----
       One ruler a desk, in page units of the page it was placed on: its
       centre, its angle and its length. Its top edge is the line a stroke
       started near it is laid on. */
    var RULER_LEN = 860, RULER_T = 64, RULER_NEAR = 34;
    function ruler() {
      if (!dk.ruler || dk.ruler.page !== page.id) dk.ruler = { page: page.id, x: I.W / 2, y: Math.min(ph() / 2, 420), a: 0 };
      return dk.ruler;
    }
    function rulerEdge() {
      var r = ruler(), c = Math.cos(r.a), sn = Math.sin(r.a), nx = sn, ny = -c;
      var ox = r.x + nx * RULER_T / 2, oy = r.y + ny * RULER_T / 2;
      return { a: { x: ox - c * RULER_LEN / 2, y: oy - sn * RULER_LEN / 2 }, b: { x: ox + c * RULER_LEN / 2, y: oy + sn * RULER_LEN / 2 } };
    }
    function onRulerBody(q) {
      var r = ruler(), dx = q.x - r.x, dy = q.y - r.y, c = Math.cos(-r.a), sn = Math.sin(-r.a);
      var lx = dx * c - dy * sn, ly = dx * sn + dy * c;
      return Math.abs(lx) <= RULER_LEN / 2 && Math.abs(ly) <= RULER_T / 2;
    }
    function nearRulerEdge(q) {
      var e = rulerEdge(), d = segDistP(q, e.a, e.b);
      return d <= RULER_NEAR;
    }
    function segDistP(p, a, b) {
      var dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
      var t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0;
      return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
    }
    function alongRuler(list) {
      var e = rulerEdge(), dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, L = dx * dx + dy * dy;
      return list.map(function (q) {
        var t = L ? ((q.x - e.a.x) * dx + (q.y - e.a.y) * dy) / L : 0;
        t = Math.max(0, Math.min(1, t));
        return { x: e.a.x + t * dx, y: e.a.y + t * dy, pr: q.pr, dt: q.dt };
      });
    }
    function drawRuler(ctx, pal) {
      var r = ruler();
      ctx.save();
      ctx.translate(r.x, r.y); ctx.rotate(r.a);
      ctx.globalAlpha = 0.18; ctx.fillStyle = pal.ink;
      ctx.fillRect(-RULER_LEN / 2, -RULER_T / 2, RULER_LEN, RULER_T);
      ctx.globalAlpha = 0.7; ctx.strokeStyle = pal.ink; ctx.lineWidth = 1.2 / Math.max(scale, 0.2);
      ctx.strokeRect(-RULER_LEN / 2, -RULER_T / 2, RULER_LEN, RULER_T);
      /* a tick every 5 mm, longer every centimetre */
      for (var x = 0, n = 0; x <= RULER_LEN; x += 5 * I.MM, n++) {
        var X = -RULER_LEN / 2 + x;
        ctx.beginPath(); ctx.moveTo(X, -RULER_T / 2); ctx.lineTo(X, -RULER_T / 2 + (n % 2 ? 9 : 18)); ctx.stroke();
      }
      ctx.globalAlpha = 0.85; ctx.fillStyle = pal.ink;
      ctx.font = (12 / Math.max(scale, 0.3)) + "px " + (getComputedStyle(document.documentElement).getPropertyValue("--font-mono") || "monospace");
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(Math.round((((r.a * 180 / Math.PI) % 360) + 360) % 360) + "°", 0, RULER_T / 6);
      ctx.restore();
    }

    function corners(b) {
      return [{ x: b.x - 6, y: b.y - 6, c: "nw" }, { x: b.x + b.w + 6, y: b.y - 6, c: "ne" }, { x: b.x + b.w + 6, y: b.y + b.h + 6, c: "se" }, { x: b.x - 6, y: b.y + b.h + 6, c: "sw" }];
    }

    /* ---- history and saving ---- */
    /* what the pen did, for a recorded attempt (KOS.attempts): a stroke with
       its start and length, an erasure, an undo — never the ink itself */
    function act(kind, extra) {
      try { window.dispatchEvent(new CustomEvent("kos-ink-act", { detail: Object.assign({ doc: page.doc, kind: kind, at: Date.now() }, extra || {}) })); } catch (e) { /* no CustomEvent */ }
    }
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
      future.push(page.items); page.items = past.pop(); sel = []; redraw(); schedule(); dk.changed(); act("undo"); return true;
    };
    s.redo = function () {
      if (!future.length) return false;
      past.push(page.items); page.items = future.pop(); sel = []; redraw(); schedule(); dk.changed(); return true;
    };
    s.canUndo = function () { return past.length > 0; };
    s.canRedo = function () { return future.length > 0; };
    /* the lasso first: switching tools clears every selection */
    s.addItems = function (items) { commit(page.items.concat(items)); dk.setTool("lasso", true); sel = items.map(function (x) { return x.id; }); paintLive(); };
    s.lastInkBottom = function () {
      var b = G.boxOf(page.items, page.items.map(function (x) { return x.id; }));
      return b ? b.y + b.h : 0;
    };

    /* ---- selection (the lasso's chips, 30a) ---- */
    var chips = null;
    /* a selection spread over pages (1C, UR-9): every page's own box is
       drawn, and the chips sit on the first page, acting on them all */
    function group() { var g = dk.selGroup; return g && g.length > 1 && g.indexOf(s) !== -1 ? g : null; }
    function each(fn) { (group() || [s]).forEach(fn); }
    function paintChips(box) {
      if (chips) { chips.remove(); chips = null; }
      if ((!box && !s.cut) || dk.prefs.tool !== "lasso") return;
      var g = group();
      if (g && g[0] !== s) return;
      chips = el("div", { class: "k-ink-chips", role: "toolbar", "aria-label": "Selection", "data-ui": "ink.selection" }, box ? [
        chip("Move", "move"), g ? null : chip("Resize", "resize"),
        KOS.ui.menu({ label: "Recolour", className: "k-btn--sm k-ink-chip", align: "start",
          items: I.PEN_ROLES.map(function (r) { return { label: r[1], onSelect: function () { each(function (x) { x._recolour(r[0]); }); } }; }) }),
        el("button", { type: "button", class: "k-btn k-btn--sm k-ink-chip", "data-ui": "ink.sel-copy", text: "Copy", onclick: function () { each(function (x) { x._copySel(); }); announce("Copied the selection."); } }),
        el("button", { type: "button", class: "k-btn k-btn--sm k-ink-chip", "data-ui": "ink.sel-delete", "data-tone": "danger", text: "Delete", onclick: function () {
          var n = 0; each(function (x) { n += x._deleteSel(); });
          dk.selGroup = null;
          announce(n === 1 ? "Deleted one item." : "Deleted " + n + " items.");
        } }),
        s.cut ? cropChip() : null,
        !g && hasWriting() ? el("button", { type: "button", class: "k-btn k-btn--sm k-ink-chip", "data-ui": "ink.sel-tex", text: "Copy as TeX…", onclick: function () {
          /* the dialog loads on first use (js/modules/inktex.js, the ink-tex bundle) */
          var ids = sel.slice();
          var go = function () { if (KOS.inkTeX) KOS.inkTeX.open(s, ids); };
          if (KOS.inkTeX) go(); else if (KOS.lazy && KOS.lazy.need) KOS.lazy.need("ink-tex").then(go, function () { KOS.ui.toast("Copy as TeX couldn't load; try again online.", true); });
        } }) : null
      ].concat(tableChips()).filter(Boolean) : [cropChip()]);
      var at = box || G.bbox(s.cut.poly);
      chips.style.setProperty("--ink-chip-x", Math.round(Math.max(0, at.x) * scale) + "px");
      chips.style.setProperty("--ink-chip-y", Math.round((Math.min(ph() - 40, at.y + at.h) + 14) * scale) + "px");
      layer.appendChild(chips);
    }
    function hasWriting() { var set = {}; sel.forEach(function (id) { set[id] = 1; }); return page.items.some(function (it) { return set[it.id] && it.k === "pen"; }); }
    /* a table chosen alone: a row or a column more, or one fewer */
    function tableChips() {
      if (sel.length !== 1 || group()) return [];
      var t = page.items.filter(function (it) { return it.id === sel[0] && it.k === "table"; })[0];
      if (!t) return [];
      function op(label, code, ui) {
        return el("button", { type: "button", class: "k-btn k-btn--sm k-ink-chip", "data-ui": "ink.table-" + ui, text: label, onclick: function () {
          var n = G.tableEdit(t, code);
          if (!n) { announce(code.slice(-1) === "-" ? "A table keeps at least one row and one column." : "That's as big as a table gets."); return; }
          commit(page.items.map(function (it) { return it.id === t.id ? n : it; }));
          paintLive();
          announce(n.rh.length + " rows, " + n.cw.length + " columns.");
        } });
      }
      return [op("+ Row", "row+", "row-add"), op("+ Column", "col+", "col-add"), op("− Row", "row-", "row-del"), op("− Column", "col-", "col-del")];
    }
    function cropChip() {
      return el("button", { type: "button", class: "k-btn k-btn--sm k-ink-chip", "data-ui": "ink.sel-crop", text: "Copy this part of the picture", onclick: cropPart });
    }
    /* PARTS OF A PICTURE (UR-9): the loop's part of a picture becomes a new
       picture beside it; the picture itself never changes (invariant 151) */
    function cropPart() {
      var c = s.cut;
      if (!c) return;
      s.cut = null;
      var im = new Image();
      im.onload = function () {
        var cr = G.cropOf(c.it, c.poly, im.naturalWidth || c.it.w, im.naturalHeight || c.it.h);
        var cv = document.createElement("canvas"), x = cv.getContext && cv.getContext("2d");
        if (!cr || !x) { KOS.ui.toast("That part of the picture is too small to copy.", true); paintLive(); return; }
        var k = Math.min(1, 1400 / Math.max(cr.sw, cr.sh));
        cv.width = Math.max(1, Math.round(cr.sw * k)); cv.height = Math.max(1, Math.round(cr.sh * k));
        x.scale(k, k);
        x.beginPath(); cr.clip.forEach(function (q, i) { if (i) x.lineTo(q.x, q.y); else x.moveTo(q.x, q.y); }); x.closePath(); x.clip();
        x.drawImage(im, cr.sx, cr.sy, cr.sw, cr.sh, 0, 0, cr.sw, cr.sh);
        s.addItems([{ id: I.uid(), k: "img", x: Math.round(cr.x + 24), y: Math.round(cr.y + 24), w: Math.round(cr.w), h: Math.round(cr.h), src: cv.toDataURL("image/png") }]);
        announce("Copied that part of the picture. The picture itself is unchanged.");
      };
      im.onerror = function () { KOS.ui.toast("That picture can't be read here.", true); paintLive(); };
      im.src = c.it.src;
    }
    function chip(label, mode) {
      var b = el("button", { type: "button", class: "k-btn k-btn--sm k-ink-chip", "aria-pressed": String(selMode === mode), text: label,
        onclick: function () { selMode = mode; paintLive(); } });
      KOS.ui.state(b, "on", selMode === mode);
      return b;
    }
    s._recolour = function (role) { if (sel.length) recolour(role); };
    s._copySel = function () { if (sel.length) copySel(true); };
    s._deleteSel = function () { var n = sel.length; if (n) deleteSel(true); return n; };
    function recolour(role) {
      var set = {}; sel.forEach(function (id) { set[id] = 1; });
      commit(page.items.map(function (it) { return set[it.id] && it.k !== "img" ? Object.assign({}, it, { role: it.k === "hl" ? (I.HL_ROLES.some(function (r) { return r[0] === role; }) ? role : it.role) : role }) : it; }));
    }
    function copySel(quiet) {
      var set = {}; sel.forEach(function (id) { set[id] = 1; });
      var copies = page.items.filter(function (it) { return set[it.id]; }).map(function (it) { return Object.assign({}, it, { id: I.uid() }); });
      var ids = copies.map(function (c) { return c.id; });
      var moved = G.transform(copies, ids, function (x, y) { return { x: x + 24, y: y + 24 }; });
      commit(page.items.concat(moved));
      sel = ids; paintLive();
      if (!quiet) announce("Copied the selection.");
    }
    function deleteSel(quiet) {
      var set = {}; sel.forEach(function (id) { set[id] = 1; });
      var n = sel.length;
      sel = [];
      commit(page.items.filter(function (it) { return !set[it.id]; }));
      if (!quiet) announce(n === 1 ? "Deleted one item." : "Deleted " + n + " items.");
    }
    /* the group's moving parts: every page moves its own selection by the
       same amount, and what lands on another page moves into it */
    var moveBase = null;
    s._sel = function () { return sel.slice(); };
    s._pickPoly = function (poly) { sel = G.lassoPick(page.items, poly); selMode = "move"; s.cut = null; paintLive(); return sel.slice(); };
    s._beginMove = function () { moveBase = page.items; };
    s._moveBy = function (dx, dy) { if (!moveBase) return; page.items = G.transform(moveBase, sel, function (x, y) { return { x: x + dx, y: y + dy }; }); redraw(); };
    s._endMove = function () { if (!moveBase) return; var moved = page.items; page.items = moveBase; moveBase = null; if (moved !== page.items) commit(moved); };
    s._dropIds = function (ids) {
      var set = {}; ids.forEach(function (id) { set[id] = 1; });
      sel = sel.filter(function (id) { return !set[id]; });
      commit(page.items.filter(function (it) { return !set[it.id]; }));
    };
    s._take = function (items) { commit(page.items.concat(items)); sel = sel.concat(items.map(function (x) { return x.id; })); paintLive(); };
    s.clearSelection = function () { if (sel.length) { sel = []; paintLive(); } closeText(true); };

    /* ---- text boxes (Scribble works in them) ---- */
    var textBox = null;
    /* the format bar over a text box (UR-12): bold, italic and the two
       lists, written as the box's own small markup; a press keeps the
       box's focus, so it never closes the box */
    function formatBar(ta, at) {
      function btn(label, aria, ui, fn) {
        var b = el("button", { type: "button", class: "k-btn k-btn--sm k-ink-chip", "aria-label": aria, "data-ui": "ink.fmt-" + ui, text: label, onclick: function () { fn(); ta.focus(); } });
        b.addEventListener("pointerdown", function (e) { e.preventDefault(); });
        b.addEventListener("mousedown", function (e) { e.preventDefault(); });
        return b;
      }
      function wrap(mark) {
        var a = ta.selectionStart, z = ta.selectionEnd, v = ta.value;
        ta.value = v.slice(0, a) + mark + v.slice(a, z) + mark + v.slice(z);
        ta.selectionStart = a + mark.length; ta.selectionEnd = z + mark.length;
      }
      function list(numbered) {
        var v = ta.value, a = v.lastIndexOf("\n", ta.selectionStart - 1) + 1, z = v.indexOf("\n", ta.selectionEnd); if (z < 0) z = v.length;
        var lines = v.slice(a, z).split("\n"), n = 0;
        var on = lines.every(function (l) { return numbered ? /^\s*\d{1,3}[.)]\s+/.test(l) : /^\s*[-•]\s+/.test(l); });
        var out = lines.map(function (l) {
          var bare = l.replace(/^\s*([-•]|\d{1,3}[.)])\s+/, "");
          if (on) return bare;
          n++;
          return (numbered ? n + ". " : "- ") + bare;
        }).join("\n");
        ta.value = v.slice(0, a) + out + v.slice(z);
        ta.selectionStart = a; ta.selectionEnd = a + out.length;
      }
      var bar = el("div", { class: "k-ink-chips k-ink-fmt", role: "toolbar", "aria-label": "Format", "data-ui": "ink.format" }, [
        btn("B", "Bold", "bold", function () { wrap("**"); }),
        btn("I", "Italic", "italic", function () { wrap("*"); }),
        btn("• List", "Bulleted list", "bullets", function () { list(false); }),
        btn("1. List", "Numbered list", "numbers", function () { list(true); })
      ]);
      bar.style.setProperty("--ink-chip-x", Math.round(at.x * scale) + "px");
      bar.style.setProperty("--ink-chip-y", Math.max(0, Math.round(at.y * scale) - 44) + "px");
      return bar;
    }
    function openText(at, existing, cell) {
      closeText(false);
      var ta = el("textarea", { class: "k-ink-text", "data-ui": "ink.text", rows: "2", "aria-label": cell ? "Table cell, row " + (cell.r + 1) + ", column " + (cell.c + 1) : "Text on the page" });
      ta.value = cell ? ((cell.item.c[cell.r] && cell.item.c[cell.r][cell.c]) || "") : existing ? existing.s : "";
      ta.style.setProperty("--ink-chip-x", Math.round(at.x * scale) + "px");
      ta.style.setProperty("--ink-chip-y", Math.round(at.y * scale) + "px");
      if (cell) { ta.style.setProperty("--ink-text-w", Math.round(cell.w * scale) + "px"); KOS.ui.state(ta, "cell", true); }
      var tsz = cell ? (+cell.item.sz || 22) : existing ? G.textSize(existing) : I.TEXT_SIZES[dk.prefs.textW][1];
      ta.style.setProperty("--ink-text-size", (tsz * scale).toFixed(1) + "px");
      var fmt = formatBar(ta, at);
      layer.appendChild(fmt);
      layer.appendChild(ta);
      textBox = { ta: ta, fmt: fmt, at: at, id: existing ? existing.id : null, sz: tsz, cell: cell || null };
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
      if (tb.fmt) tb.fmt.remove();
      /* a table's cell: the table takes the new text, nothing else moves */
      if (tb.cell) {
        var cur = page.items.filter(function (x) { return x.id === tb.cell.item.id; })[0];
        var was0 = cur && cur.c[tb.cell.r] ? cur.c[tb.cell.r][tb.cell.c] || "" : "";
        if (keep && cur && was0 !== txt) {
          var nt = JSON.parse(JSON.stringify(cur));
          nt.c[tb.cell.r][tb.cell.c] = txt.slice(0, 400);
          commit(page.items.map(function (x) { return x.id === cur.id ? nt : x; }));
        } else redraw();
        return;
      }
      var rest = page.items.filter(function (x) { return !tb.was || x.id !== tb.was.id; });
      if (tb.was) page.items = rest.concat([tb.was]); /* put it back before deciding */
      if (keep && txt) {
        var item = withSet({ id: tb.was ? tb.was.id : I.uid(), k: "text", role: tb.was ? tb.was.role : dk.prefs.pen.role, x: tb.at.x, y: tb.at.y, s: txt, sz: tb.sz }, tb.was);
        commit(rest.concat([item]));
      } else if (keep && tb.was) {
        commit(rest);
      } else redraw();
    }

    /* ---- input ---- */
    function eraseR() { return I.ERASER_SIZES[dk.prefs.eraserW][1]; }
    function toPage(e) {
      var r = live.getBoundingClientRect();
      return { x: (e.clientX - r.left) / (r.width || 1) * I.W, y: (e.clientY - r.top) / (r.height || 1) * ph() };
    }
    s.rect = function () { return live.getBoundingClientRect(); };
    s.ph = ph;
    function draws(e) {
      if (opts.readOnly) return false;
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
      lastInk = Date.now();
      if (e.pointerType === "pen") dk.penSeen(e.pressure > 0 && e.pressure !== 0.5);
      if (dk.claim) dk.claim();
      e.preventDefault();
      try { live.setPointerCapture(e.pointerId); } catch (x) { /* capture refused */ }
      dk.active = s;
      var tool = dk.prefs.tool, q = toPage(e);
      if (tool === "ruler" && e.pointerType === "mouse" && onRulerBody(q) && !nearRulerEdge(q)) {
        var r0 = ruler();
        stroke = { kind: "ruler-move", from: q, x: r0.x, y: r0.y };
        return;
      }
      if (tool === "text") {
        var tbl = page.items.filter(function (it) { return it.k === "table" && G.cellAt(it, q.x, q.y); }).pop();
        if (tbl) { var cl = G.cellAt(tbl, q.x, q.y); openText({ x: cl.x + 2, y: cl.y + 2 }, null, { item: tbl, r: cl.r, c: cl.c, w: cl.w }); return; }
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
            stroke = { kind: (corner || selMode === "resize") && !group() ? "resize" : "move", from: q, base: page.items, box: box, corner: corner ? corner.c : "se" };
            if (stroke.kind === "move" && group()) group().forEach(function (x) { if (x !== s) x._beginMove(); });
            return;
          }
          sel = [];
        }
        if (dk.selGroup) { dk.selGroup.forEach(function (x) { if (x !== s) x._select([]); }); dk.selGroup = null; }
        s.cut = null;
        stroke = { kind: "lasso", list: [q], o: q, box: dk.prefs.lasso === "box" };
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
      stroke = { kind: tool, list: [first], last: first, ruled: tool === "ruler" && nearRulerEdge(first), t0: Date.now() };
      liveState = { item: liveItem() };
      lastMoveAt = first.at;
      startHold();
      paintLive();
    }
    function liveItem(list) {
      var p = dk.prefs, k = p.tool === "hl" ? "hl" : "pen";
      var l = list || stroke.list;
      if (stroke && stroke.ruled && l.length > 1) l = alongRuler([l[0], l[l.length - 1]]);
      var it = withSet({ id: "live", k: k, role: k === "hl" ? p.hl.role : p.pen.role, w: k === "hl" ? p.hl.w : p.pen.w, p: G.pack(l) });
      if (stroke && stroke.ruled) it.sh = "line";
      return it;
    }
    function eraseAt(q) {
      /* a fast swipe samples sparsely: erase along the path between
         samples too, so nothing it crossed is skipped */
      var from = stroke.at || q, n = Math.max(1, Math.ceil(Math.hypot(q.x - from.x, q.y - from.y) / (eraseR() * 0.8)));
      var changed = false;
      for (var i = 1; i <= n; i++) {
        var x = from.x + (q.x - from.x) * i / n, y = from.y + (q.y - from.y) * i / n;
        var out = G.erase(stroke.items, x, y, eraseR(), dk.prefs.eraser);
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
      if (stroke.kind === "lasso") {
        if (stroke.box) {
          /* the box lasso: a rectangle from where it started */
          var o = stroke.o, c = toPage(e);
          stroke.list = [o, { x: c.x, y: o.y }, c, { x: o.x, y: c.y }, o];
          liveState.lasso = stroke.list;
        } else evs.forEach(function (x) { stroke.list.push(toPage(x)); });
        requestPaint();
        return;
      }
      if (stroke.kind === "ruler-move") {
        var qm = toPage(e), rr = ruler();
        rr.x = stroke.x + qm.x - stroke.from.x; rr.y = stroke.y + qm.y - stroke.from.y;
        paintLive();
        return;
      }
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
        if (stroke.kind === "move" && group()) group().forEach(function (x) { if (x !== s) x._moveBy(dx, dy); });
        redraw();
        return;
      }
      evs.forEach(function (x) {
        /* a pen sample with no pressure mid-stroke is the pen lifting, not
           a point; one out of order is a repeat */
        if (x.pointerType === "pen" && x.pressure === 0) return;
        var q = pointOf(x, stroke.last);
        if (q.at < stroke.last.at) return;
        var jump = Math.hypot(q.x - stroke.last.x, q.y - stroke.last.y);
        if (jump < 0.6) return;
        /* the occasional stray sample far from the nib (the "spike" seen on
           the iPad): faster than a hand moves, and alone. Two in a row are
           the pen really moving, and the stroke follows. */
        if (jump > 60 && q.dt < 12 && !stroke.strayed) { stroke.strayed = true; return; }
        stroke.strayed = false;
        stroke.list.push(q); stroke.last = q;
        if (Math.hypot(q.x - stroke.list[Math.max(0, stroke.list.length - 4)].x, q.y - stroke.list[Math.max(0, stroke.list.length - 4)].y) > 2) {
          if (liveState.snapped) { liveState.snapped = null; }
          startHold();
        }
      });
      /* where the pen is about to be (Chrome predicts; Safari does not),
         drawn on the live stroke only, so the ink keeps up with the nib */
      var pred = e.getPredictedEvents ? e.getPredictedEvents() : null;
      var ahead = pred && pred.length && stroke.list.length > 2 ? pred.slice(0, 2).map(function (x) { return pointOf(x, stroke.last); }) : null;
      liveState.item = liveItem(ahead ? stroke.list.concat(ahead) : null);
      requestPaint();
    }
    /* one paint a frame: a Pencil reports 240 points a second */
    var paintRaf = 0;
    function requestPaint() {
      if (paintRaf) return;
      if (typeof window.requestAnimationFrame !== "function") { paintLive(); return; }
      paintRaf = window.requestAnimationFrame(function () { paintRaf = 0; paintLive(); });
    }
    function onUp(e) {
      clearTimeout(holdT);
      if (stroke) lastInk = Date.now();
      if (paintRaf) { window.cancelAnimationFrame(paintRaf); paintRaf = 0; }
      if (!stroke) return;
      var st = stroke;
      stroke = null;
      try { live.releasePointerCapture(e.pointerId); } catch (x) { /* released */ }
      if (st.kind === "ruler-move") return;
      if (st.kind === "erase") {
        liveState = null;
        if (st.items !== st.base) { page.items = st.base; commit(st.items); act("erase"); } else paintLive();
        return;
      }
      if (st.kind === "lasso") { finishLasso(st.list); return; }
      if (st.kind === "move" || st.kind === "resize") {
        var moved = page.items;
        page.items = st.base;
        if (moved !== st.base) commit(moved);
        var gm = group();
        if (st.kind === "move" && gm) gm.forEach(function (x) { if (x !== s) x._endMove(); });
        if (st.kind === "move") rehome(gm || [s]);
        return;
      }
      var snapped = st.ruled ? null : (liveState && liveState.snapped || (st.kind === "shape" ? G.snap(st.list) : null));
      stroke = st;
      var item = liveItem(st.list);
      stroke = null;
      item.id = I.uid();
      if (st.ruled && st.list.length < 2) { liveState = null; paintLive(); return; }
      if (snapped) { item.p = G.pack(snapped.pts.map(function (q) { return { x: q.x, y: q.y }; })); item.sh = snapped.sh; item.k = "pen"; }
      liveState = null;
      if (st.list.length === 1 && !snapped) item.p = G.pack([st.list[0], { x: st.list[0].x + 0.2, y: st.list[0].y, pr: st.list[0].pr, dt: 16 }]);
      /* the stroke's start time (an attempt's recording reads it, KOS.attempts) */
      if (st.t0) item.t0 = st.t0;
      commit(page.items.concat([item]));
      act("stroke", { t0: st.t0 || Date.now(), dur: Date.now() - (st.t0 || Date.now()) });
      var bottom = G.bbox(G.pts(item)).y + G.bbox(G.pts(item)).h;
      if (opts.grow && bottom > ph() - 70) grow();
      else if (opts.nearEnd && bottom > ph() - 90) opts.nearEnd(s);
    }
    /* a strip or a pad grows when you write near its edge (30f) */
    function grow() {
      var max = opts.grow.max || I.H * 2;
      if (ph() >= max) return;
      page.h = Math.min(max, ph() + (opts.grow.step || 220));
      host.style.setProperty("--ink-h", String(page.h));
      size(); redraw(); schedule();
    }
    s.grow = grow;
    /* the lasso let go: pick on this page, and on every page the loop
       reaches past its edge; a picture it cuts offers its part */
    function finishLasso(list) {
      liveState = null;
      if (dk.selGroup) { dk.selGroup.forEach(function (x) { if (x !== s) x._select([]); }); dk.selGroup = null; }
      sel = G.lassoPick(page.items, list);
      selMode = "move";
      /* past the page's edge: the same loop on every page it covers */
      var g = sel.length ? [s] : [];
      if (G.leavesPage(list, ph())) {
        var from = s.rect();
        dk.surfaces.forEach(function (o) {
          if (o === s || o.readOnly || !o.host.isConnected) return;
          var mp = G.mapPoints(list, from, ph(), o.rect(), o.ph());
          if (!mp.some(function (q) { return q.y >= 0 && q.y <= o.ph(); })) return;
          if (o._pickPoly(mp).length) g.push(o);
        });
      }
      dk.selGroup = g.length > 1 ? g : null;
      /* a loop through a picture it did not take offers its part */
      s.cut = null;
      var cut = G.cutPicture(page.items, list, sel);
      if (cut) s.cut = { it: cut, poly: list.slice() };
      paintLive();
      /* every page of it draws again now the group is known (its chips sit on the first) */
      g.forEach(function (x) { if (x !== s) x._select(x._sel()); });
      var total = 0; g.forEach(function (x) { total += x._sel().length; });
      if (total) announce((total === 1 ? "One item selected" : total + " items selected") + (g.length > 1 ? " on " + g.length + " pages." : "."));
      else if (s.cut) announce("The loop cuts a picture: Copy this part makes a new picture of it.");
    }
    s._lasso = finishLasso;
    /* an item moved past its page's edge goes to the page it now sits on,
       when there is one (else it stays, and the page keeps it) */
    function rehome(list) {
      var n = 0;
      list.forEach(function (x) {
        var r = x.rect(), h = x.ph(), set = {};
        x._sel().forEach(function (id) { set[id] = 1; });
        var out = {};
        x.page.items.forEach(function (it) {
          if (!set[it.id]) return;
          var b = G.itemBox(it), cy = b.y + b.h / 2;
          if (cy >= 0 && cy <= h) return;
          var cx = r.left + (b.x + b.w / 2) / I.W * r.width, cyc = r.top + cy / Math.max(1, h) * r.height;
          var t = dk.surfaces.filter(function (o) {
            if (o === x || o.readOnly || !o.host.isConnected) return false;
            var rr = o.rect();
            return cx >= rr.left && cx <= rr.right && cyc >= rr.top && cyc <= rr.bottom;
          })[0];
          if (!t) return;
          var key = dk.surfaces.indexOf(t);
          (out[key] = out[key] || { t: t, items: [] }).items.push(it);
        });
        Object.keys(out).forEach(function (key) {
          var o = out[key], tr = o.t.rect(), th = o.t.ph();
          var moved = o.items.map(function (it) {
            return G.transform([it], [it.id], function (px, py) { var m = G.mapPoints([{ x: px, y: py }], r, h, tr, th)[0]; return { x: m.x, y: m.y }; })[0];
          });
          x._dropIds(o.items.map(function (it) { return it.id; }));
          o.t._take(moved);
          n += moved.length;
        });
      });
      if (n) announce(n === 1 ? "One item moved to the next page." : n + " items moved onto the page they were dragged to.");
      return n;
    }
    s._rehome = function (list) { return rehome(list || [s]); };
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
      /* the selection's chips and a text box take their own taps: a
         preventDefault here would swallow the click (the lasso's Resize,
         Recolour, Copy and Delete did nothing with the pen) */
      if (e.target !== live && layer.contains(e.target)) return;
      var ts = e.touches, stylus = [].some.call(e.changedTouches || [], function (t) { return t.touchType === "stylus"; });
      if (stylus) { e.preventDefault(); return; }
      /* finger drawing: one finger draws (touch-action keeps the browser
         off it), two scroll and pinch */
      if (dk.prefs.finger && ts.length === 2) {
        pan = { x: (ts[0].clientX + ts[1].clientX) / 2, y: (ts[0].clientY + ts[1].clientY) / 2, el: scrollerOf(host) };
      }
      if (ts.length === 2 && dk.prefs.tool === "ruler") {
        e.preventDefault();
        placeRuler(ts);
        two = null; rulerTouch = true;
        return;
      }
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
    var rulerTouch = false, pan = null;
    function scrollerOf(n) {
      for (var p = n.parentElement; p && p !== document.body; p = p.parentElement) {
        var oy = getComputedStyle(p).overflowY;
        if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) return p;
      }
      return document.scrollingElement || document.documentElement;
    }
    function placeRuler(ts) {
      var r = live.getBoundingClientRect(), a = ts[0], b = ts[1];
      var pa = { x: (a.clientX - r.left) / (r.width || 1) * I.W, y: (a.clientY - r.top) / (r.height || 1) * ph() };
      var pb = { x: (b.clientX - r.left) / (r.width || 1) * I.W, y: (b.clientY - r.top) / (r.height || 1) * ph() };
      var rr = ruler();
      rr.x = (pa.x + pb.x) / 2; rr.y = (pa.y + pb.y) / 2;
      var ang = Math.atan2(pb.y - pa.y, pb.x - pa.x);
      /* within 3° of level or upright, it is level or upright */
      var step = Math.PI / 4, near = Math.round(ang / step) * step;
      rr.a = Math.abs(ang - near) < 3 * Math.PI / 180 ? near : ang;
      paintLive();
    }
    function onTouchMove(e) {
      if (rulerTouch && e.touches.length === 2) { e.preventDefault(); placeRuler(e.touches); return; }
      if (pan && e.touches.length === 2) {
        var mx = (e.touches[0].clientX + e.touches[1].clientX) / 2, my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        pan.el.scrollBy(pan.x - mx, pan.y - my);
        pan.x = mx; pan.y = my;
      }
      if (!two) return;
      [].forEach.call(e.touches, function (t) {
        var p = two.pts.filter(function (q) { return q.id === t.identifier; })[0];
        if (p) two.moved = Math.max(two.moved, Math.hypot(t.clientX - p.x, t.clientY - p.y));
      });
    }
    function onTouchEnd(e) {
      if (e.touches.length < 2) pan = null;
      if (rulerTouch && e.touches.length < 2) { rulerTouch = false; return; }
      if (!two || e.touches.length) return;
      var t = two;
      two = null;
      if (Date.now() - t.at < 200 && t.moved < 10) { dk.active = s; dk.undo(); }
    }
    host.addEventListener("touchstart", onTouchStart, { passive: false });
    host.addEventListener("touchmove", onTouchMove, { passive: false });
    host.addEventListener("touchend", onTouchEnd);

    s.syncMode = function () {
      KOS.ui.state(host, "finger", dk.prefs.finger);
      KOS.ui.state(host, "readonly", !!opts.readOnly);
      host.setAttribute("data-tool", dk.prefs.tool);
      if (dk.prefs.tool !== "lasso" && sel.length) { sel = []; }
      if (dk.prefs.tool !== "lasso") { s.cut = null; if (dk.selGroup) dk.selGroup = null; }
      paintLive();
    };
    var ro = null;
    if (typeof window.ResizeObserver === "function") {
      try { ro = new window.ResizeObserver(function () { if ((host.clientWidth || 0) !== w) { size(); redraw(); } }); ro.observe(host); } catch (e) { ro = null; }
    }
    s.redraw = function () { size(); redraw(); };
    s.busy = function () { return !!stroke || !!textBox; };
    s.destroy = function () {
      s.flush();
      closeText(true);
      if (ro) ro.disconnect();
      host.removeEventListener("touchstart", onTouchStart);
      host.removeEventListener("touchmove", onTouchMove);
      host.removeEventListener("touchend", onTouchEnd);
      /* WebKit frees a canvas's backing store at once only when it is
         sized to nothing before it goes (files plan §4) */
      [ink, live].forEach(function (c) { c.width = 0; c.height = 0; });
      [ink, live, layer].forEach(function (n) { n.remove(); });
      dk.surfaces = dk.surfaces.filter(function (x) { return x !== s; });
      allSurfaces = allSurfaces.filter(function (x) { return x !== s; });
      if (dk.active === s) dk.active = null;
    };
    /* for tests: draw a stroke without pointer events */
    s._stroke = function (points, kind) {
      var it = withSet({ id: I.uid(), k: kind === "hl" ? "hl" : "pen", role: kind === "hl" ? dk.prefs.hl.role : dk.prefs.pen.role, w: kind === "hl" ? dk.prefs.hl.w : dk.prefs.pen.w, p: G.pack(points), t0: Date.now() });
      commit(page.items.concat([it]));
      act("stroke", { t0: it.t0, dur: 0 });
      return it;
    };
    s._select = function (ids) { sel = ids.slice(); paintLive(); };
    /* for tests: the Text tool's tap, and a box closed as a tap away does */
    s._textAt = function (q) {
      var tbl = page.items.filter(function (it) { return it.k === "table" && G.cellAt(it, q.x, q.y); }).pop();
      if (tbl) { var cl = G.cellAt(tbl, q.x, q.y); openText({ x: cl.x + 2, y: cl.y + 2 }, null, { item: tbl, r: cl.r, c: cl.c, w: cl.w }); return textBox && textBox.ta; }
      var hit = page.items.filter(function (it) { return it.k === "text" && G.hitItem(it, q.x, q.y, 4); }).pop();
      openText(hit ? { x: hit.x, y: hit.y } : q, hit || null);
      return textBox && textBox.ta;
    };
    s._closeText = function () { closeText(true); };
    s.syncMode();
    size();
    redraw();
    dk.surfaces.push(s);
    allSurfaces.push(s);
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
    paste: [["rect", { x: "6", y: "4", width: "12", height: "17", rx: "2" }], ["path", { d: "M9 4V3h6v1" }], ["path", { d: "M9 11h6M9 15h4" }]],
    table: [["rect", { x: "3", y: "5", width: "18", height: "14", rx: "1.5" }], ["path", { d: "M3 10h18M3 15h18M9 5v14M15 5v14" }]],
    undo: [["path", { d: "M9 7L4 12l5 5" }], ["path", { d: "M4 12h10a6 6 0 010 12h-3", transform: "translate(0 -6)" }]],
    redo: [["path", { d: "M15 7l5 5-5 5" }], ["path", { d: "M20 12H10a6 6 0 000 12h3", transform: "translate(0 -6)" }]],
    paper: [["rect", { x: "5", y: "3", width: "14", height: "18", rx: "2" }], ["path", { d: "M8 8h8M8 12h8M8 16h5" }]],
    ruler: [["g", { transform: "rotate(-25 12 12)" }, [["rect", { x: "2.5", y: "9", width: "19", height: "6.5", rx: "1.5" }], ["path", { d: "M6 9v2.6M9.5 9v1.8M13 9v2.6M16.5 9v1.8" }]]]],
    float: [["rect", { x: "4", y: "8", width: "16", height: "9", rx: "3" }], ["path", { d: "M8 5h8" }]],
    dock: [["path", { d: "M5 4h14" }], ["path", { d: "M12 20V8M7 13l5-5 5 5" }]],
    more: [["circle", { cx: "6", cy: "12", r: "1.3" }], ["circle", { cx: "12", cy: "12", r: "1.3" }], ["circle", { cx: "18", cy: "12", r: "1.3" }]],
    grip: [["path", { d: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01", "stroke-width": "3" }]]
  };
  function glyph(name) {
    var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8"); svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("class", "k-ink-glyph");
    function add(to, part) {
      var n = document.createElementNS(NS, part[0]);
      Object.keys(part[1]).forEach(function (k) { n.setAttribute(k, part[1][k]); });
      (part[2] || []).forEach(function (c) { add(n, c); });
      to.appendChild(n);
    }
    (GLYPH[name] || []).forEach(function (part) { add(svg, part); });
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
    /* a strip's bar keeps Pen, Highlight, Eraser and the colour (30f) */
    var set = opts.tools || TOOLS.map(function (t) { return t[0]; });
    TOOLS.filter(function (t) { return set.indexOf(t[0]) >= 0; }).forEach(function (t) {
      tools.appendChild(toolBtn(t[0], t[1], { role: "radio", title: t[1] + " (" + t[2] + ")", onclick: function () { dk.setTool(t[0]); } }));
    });
    var imgInput = imageInput(dk, opts);
    if (opts.image !== false) {
      tools.appendChild(toolBtn("image", "Image", { title: "A picture from Photos or Files", "data-ui": "ink.tool ink.image", onclick: function () { imgInput.click(); } }));
      tools.appendChild(imgInput);
      /* UR-10 (1C): on the iPad there is no ⌘V without a keyboard, so the
         clipboard's picture has a button of its own */
      tools.appendChild(toolBtn("paste", "Paste", { title: "Paste the picture on the clipboard", "data-ui": "ink.tool ink.paste", onclick: function () { pasteClipboard(dk); } }));
    }
    /* UR-12 (1C): a ruled table on the page in use */
    if (opts.table !== false && !opts.tools) tools.appendChild(toolBtn("table", "Table", { title: "Add a table", "data-ui": "ink.tool ink.table", onclick: function () { dk.placeTable(); } }));

    /* colour and width: inline when the bar has room, else one button */
    var colour = el("div", { class: "k-ink-group k-ink-colour", "data-ui": "ink.colour" });
    var undoB = toolBtn("undo", "Undo", { title: "Undo (⌘Z)", "data-ui": "ink.undo", onclick: function () { dk.undo(); } });
    var redoB = toolBtn("redo", "Redo", { title: "Redo (⇧⌘Z)", "data-ui": "ink.redo", onclick: function () { dk.redo(); } });
    var hist = el("div", { class: "k-ink-group" }, [undoB, redoB]);
    var paperSlot = el("div", { class: "k-ink-group" });
    var extra = el("div", { class: "k-ink-group k-ink-extra" });
    bar.appendChild(tools); bar.appendChild(colour); if (opts.history !== false) bar.appendChild(hist); bar.appendChild(paperSlot); bar.appendChild(extra);
    if (opts.extra) opts.extra.forEach(function (n) { extra.appendChild(n); });
    if (opts.float !== false) extra.appendChild(toolBtn("float", "Float", { title: "Float the tools", "data-ui": "ink.tool ink.float", onclick: function () { dk.setDock("float"); } }));
    if (opts.paper === undefined && opts.tools) paperSlot.remove();
    longPress(bar, dk);

    function paintColour() {
      colour.innerHTML = "";
      KOS.ui.state(colour, "off", false);
      if (KOS.ui.hasState(bar, "wide")) {
        optionParts(dk).forEach(function (pt) { colour.appendChild(pt[1]); });
        return;
      }
      colour.appendChild(optionsMenu(dk, "k-ink-tool k-ink-colour-btn"));
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
        if (b.getAttribute("data-tool") === "eraser")
          b.title = dk.prefs.eraser === "partial" ? "Eraser · erases only what it touches (tap again for whole strokes)" : "Eraser · whole strokes (tap again to erase only what it touches)";
      });
      undoB.disabled = !dk.canUndo();
      redoB.disabled = !dk.canRedo();
      /* the colour and paper groups are rebuilt: emptied, the bar's scroll
         width shrinks and the browser clamps it back to the start, so a
         tap on Undo at the far end jumped the bar to Pen. Hold it. */
      var left = bar.scrollLeft;
      paintColour();
      paintPaper();
      bar.scrollLeft = left;
    }
    dk.onChange(paint);

    /* room for the swatches inline? (30a: only with both side panels
       folded in landscape) */
    function measure() {
      var wide = (bar.clientWidth || 0) >= 900;
      if (wide !== KOS.ui.hasState(bar, "wide")) { var left = bar.scrollLeft; KOS.ui.state(bar, "wide", wide); paintColour(); bar.scrollLeft = left; }
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
    bar.colourMenu = function () { return colour; };
    return bar;
  }

  /* the image input every bar and palette shares: the picture lands on
     the page in use (the desk places it) */
  function imageInput(dk, opts) {
    var imgInput = el("input", { type: "file", accept: "image/*", class: "k-ink-file", "aria-hidden": "true", tabindex: "-1" });
    imgInput.addEventListener("change", function () {
      var f = imgInput.files && imgInput.files[0];
      imgInput.value = "";
      if (!f) return;
      readImage(f, function (src, iw, ih) { if (opts && opts.onImage) opts.onImage(src, iw, ih); else dk.placeImage(src, iw, ih); });
    });
    return imgInput;
  }

  /* ---------- names on long press (30b) ----------
     500 ms on a tool (or a pen held on it) shows its name, its mode and the
     gesture that changes it; it goes on release, and that release does not
     also press the button. */
  var tipEl = null;
  function hideTip() { if (tipEl) { tipEl.remove(); tipEl = null; } }
  function longPress(root, dk) {
    var t = null, shown = false;
    root.addEventListener("pointerdown", function (e) {
      var b = e.target.closest(".k-ink-tool, .k-ink-pal-grip");
      if (!b || !root.contains(b)) return;
      shown = false;
      clearTimeout(t);
      t = setTimeout(function () {
        var id = b.getAttribute("data-tool") || (b.classList.contains("k-ink-pal-grip") ? "grip" : null);
        var words = id === "grip" ? ["Palette", "Drag to move it. Tap for Text, Image and Paper."] : TIPS[id] ? TIPS[id](dk.prefs) : null;
        if (!words) return;
        hideTip();
        var r = b.getBoundingClientRect();
        tipEl = el("div", { class: "k-ink-tip", role: "tooltip", "data-ui": "ink.tip" }, [
          el("strong", { class: "k-ink-tip-t", text: words[0] }), el("span", { class: "k-ink-tip-s", text: words[1] })]);
        document.body.appendChild(tipEl);
        var tw = tipEl.offsetWidth || 220, th = tipEl.offsetHeight || 60;
        var x = Math.max(8, Math.min(window.innerWidth - tw - 8, r.left + r.width / 2 - tw / 2));
        var y = r.top - th - 10 < 8 ? r.bottom + 10 : r.top - th - 10;
        tipEl.style.setProperty("--tip-x", Math.round(x) + "px");
        tipEl.style.setProperty("--tip-y", Math.round(y) + "px");
        shown = true;
        announce(words[0] + ".");
      }, 500);
    });
    function end() { clearTimeout(t); setTimeout(hideTip, shown ? 900 : 0); }
    root.addEventListener("pointerup", end);
    root.addEventListener("pointercancel", end);
    root.addEventListener("pointerleave", end);
    root.addEventListener("click", function (e) { if (shown) { e.stopPropagation(); e.preventDefault(); shown = false; } }, true);
    root.addEventListener("contextmenu", function (e) { if (e.target.closest(".k-ink-tool")) e.preventDefault(); });
  }

  /* ---------- the floating palette (30b, 30r) ----------
     The same tools as the bar, in a small palette you drag by ⠿: the six
     used most, the colour, Undo and Redo, and Dock. Vertical against a
     side in landscape, one row in portrait, and always one row under 700
     (the phone tier, 30r), where the docked bar is not offered. It
     settles against the nearest edge, 20 px in, and remembers where per
     orientation (per device, state.ui.ink.at). */
  var PHONE_Q = "(max-width: 700px)";
  function phone() { return !!(window.matchMedia && window.matchMedia(PHONE_Q).matches); }
  function orient() { return window.innerWidth > window.innerHeight ? "land" : "port"; }
  function floatPalette(dk, opts) {
    opts = opts || {};
    var root = el("div", { class: "k-ink-pal", role: "toolbar", "aria-label": "Ink tools, floating", "data-ui": "ink.palette" });
    var grip = el("button", { type: "button", class: "k-ink-pal-grip", "data-ui": "ink.pal-grip", "aria-label": "Move the palette, or more tools" }, [glyph("grip")]);
    root.appendChild(grip);
    var tools = el("div", { class: "k-ink-pal-group", role: "radiogroup", "aria-label": "Tool" });
    var six = (opts.tools || TOOLS.map(function (t) { return t[0]; })).slice(0, 6);
    TOOLS.filter(function (t) { return six.indexOf(t[0]) >= 0; }).forEach(function (t) {
      tools.appendChild(toolBtn(t[0], t[1], { role: "radio", title: t[1] + " (" + t[2] + ")", onclick: function () { dk.setTool(t[0]); } }));
    });
    root.appendChild(tools);
    var colourSlot = el("div", { class: "k-ink-pal-group" });
    root.appendChild(colourSlot);
    var undoB = toolBtn("undo", "Undo", { "data-ui": "ink.undo", onclick: function () { dk.undo(); } });
    var redoB = toolBtn("redo", "Redo", { "data-ui": "ink.redo", onclick: function () { dk.redo(); } });
    if (opts.history !== false) root.appendChild(el("div", { class: "k-ink-pal-group" }, [undoB, redoB]));
    var dockB = toolBtn("dock", "Dock", { "data-ui": "ink.tool ink.dock", onclick: function () { dk.setDock("dock"); } });
    if (!phone()) root.appendChild(dockB);
    var imgInput = imageInput(dk, opts);
    root.appendChild(imgInput);
    longPress(root, dk);

    function paint() {
      [].forEach.call(tools.querySelectorAll("[role='radio']"), function (b) {
        var on = b.getAttribute("data-tool") === dk.prefs.tool;
        b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; KOS.ui.state(b, "on", on);
      });
      undoB.disabled = !dk.canUndo(); redoB.disabled = !dk.canRedo();
      colourSlot.innerHTML = "";
      var m = optionsMenu(dk, "k-ink-tool k-ink-pal-colour");
      colourSlot.appendChild(m);
      KOS.ui.state(root, "row", phone() || orient() === "port");
      KOS.ui.state(root, "icons", phone() && window.innerWidth < 420);
    }
    dk.onChange(paint);

    /* ⠿: drag to move; a tap opens the rest (Text, Image, Paper) */
    var drag = null;
    grip.addEventListener("pointerdown", function (e) {
      var r = root.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, moved: false, id: e.pointerId };
      try { grip.setPointerCapture(e.pointerId); } catch (x) { /* refused */ }
      KOS.ui.state(root, "lifted", true);
    });
    grip.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      drag.moved = true;
      place(drag.l + dx, drag.t + dy, false);
    });
    function endDrag(e) {
      if (!drag) return;
      var d = drag;
      drag = null;
      KOS.ui.state(root, "lifted", false);
      try { grip.releasePointerCapture(e.pointerId); } catch (x) { /* released */ }
      if (!d.moved) { more(); return; }
      var r = root.getBoundingClientRect();
      /* dragged to the top edge: it docks again */
      if (r.top < 40 && !phone()) { dk.setDock("dock"); return; }
      place(r.left, r.top, true);
    }
    grip.addEventListener("pointerup", endDrag);
    grip.addEventListener("pointercancel", endDrag);
    grip.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 60 : 20, r = root.getBoundingClientRect(), mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (!mv) return;
      e.preventDefault();
      place(r.left + mv[0], r.top + mv[1], true);
    });
    function more() {
      var items = [
        { label: "Text", onSelect: function () { dk.setTool("text"); } },
        { label: "Image…", onSelect: function () { imgInput.click(); } }
      ];
      if (opts.paper) items.push({ label: "Paper…", onSelect: function () { paperDialog(dk, opts.paper); } });
      if (!phone()) items.push({ label: "Dock the tools", onSelect: function () { dk.setDock("dock"); } });
      var m = KOS.ui.menu({ label: "More tools", className: "k-ink-pal-more", items: items });
      root.appendChild(m);
      m.click();
      setTimeout(function () { m.remove(); }, 0);
    }
    /* settle against the nearest edge, 20 px in, clear of the home bar */
    function place(x, y, settle) {
      var w = root.offsetWidth || 68, h = root.offsetHeight || 400, W = window.innerWidth, H = window.innerHeight, pad = 20;
      var bottomPad = phone() ? 96 : 28;
      x = Math.max(pad, Math.min(W - w - pad, x)); y = Math.max(pad, Math.min(H - h - bottomPad, y));
      if (settle) {
        var dl = x - pad, dr = W - w - pad - x, dt = y - pad, db = H - h - bottomPad - y, m = Math.min(dl, dr, dt, db);
        if (m === dl) x = pad; else if (m === dr) x = W - w - pad; else if (m === dt) y = pad; else y = H - h - bottomPad;
        dk.prefs.at[orient()] = { x: Math.round(x / W * 1000) / 1000, y: Math.round(y / H * 1000) / 1000 };
        savePrefs();
      }
      root.style.setProperty("--pal-x", Math.round(x) + "px");
      root.style.setProperty("--pal-y", Math.round(y) + "px");
    }
    function home() {
      var at = dk.prefs.at[orient()], w = root.offsetWidth || 68, h = root.offsetHeight || 400;
      if (at) { place(at.x * window.innerWidth, at.y * window.innerHeight, false); return; }
      if (KOS.ui.hasState(root, "row")) place((window.innerWidth - w) / 2, window.innerHeight - h - (phone() ? 96 : 44), false);
      else place(window.innerWidth - w - 28, Math.max(90, (window.innerHeight - h) / 2), false);
    }
    function onResize() { paint(); home(); }
    window.addEventListener("resize", onResize);
    root.home = home;
    root.paint = paint;
    root.destroy = function () { window.removeEventListener("resize", onResize); hideTip(); root.remove(); };
    paint();
    return root;
  }
  /* ---------- each tool's options (asked for 26 October 2026) ----------
     Colour where the tool leaves colour, a size of three steps, and the
     eraser's and the lasso's mode. Every tool has some, so the bar's slot
     never empties into a gap when the tool changes. */
  function hasColour(t) { return t !== "eraser" && t !== "lasso"; }
  function sizesOf(dk) {
    var p = dk.prefs, t = p.tool;
    if (t === "lasso") return null;
    if (t === "hl") return { list: I.HL_WIDTHS, cur: p.hl.w, label: "Width", mm: true };
    if (t === "eraser") return { list: I.ERASER_SIZES, cur: p.eraserW, label: "Size" };
    if (t === "text") return { list: I.TEXT_SIZES, cur: p.textW, label: "Size" };
    return { list: I.WIDTHS, cur: p.pen.w, label: "Width", mm: true };
  }
  /* the choice just made shows in its own group at once (the colour and
     size menu stays open while you pick, 1C): only the toolbar's button
     used to follow, and the open menu kept the old tick */
  function markIn(btn) {
    var g = btn.parentNode;
    if (!g) return;
    [].forEach.call(g.querySelectorAll("[role='radio']"), function (x) {
      var on = x === btn;
      x.setAttribute("aria-checked", String(on));
      if (KOS.ui.hasState(x, "on") !== on && x.classList.contains("k-ink-choice")) KOS.ui.state(x, "on", on);
    });
  }
  function swatchGroup(dk) {
    var hl = dk.prefs.tool === "hl", roles = hl ? I.HL_ROLES : I.PEN_ROLES, cur = hl ? dk.prefs.hl.role : dk.prefs.pen.role;
    return el("div", { class: "k-ink-swatches", role: "radiogroup", "aria-label": hl ? "Highlighter colour" : "Pen colour" }, roles.map(function (r) {
      var b = el("button", { type: "button", class: "k-ink-swatch", role: "radio", "aria-checked": String(r[0] === cur), "aria-label": r[1], title: r[1],
        "data-role": r[0], "data-ui": "ink.swatch", onclick: function () { markIn(b); dk.setRole(r[0]); } });
      if (hl) KOS.ui.state(b, "hl", true);
      return b;
    }));
  }
  function widthGroup(dk) {
    var sz = sizesOf(dk);
    if (!sz) return null;
    return el("div", { class: "k-ink-widths", role: "radiogroup", "aria-label": sz.label }, sz.list.map(function (wd, i) {
      var b = el("button", { type: "button", class: "k-ink-width", role: "radio", "aria-checked": String(sz.cur === i), "aria-label": wd[0], title: wd[0] + (sz.mm ? " · " + wd[1] + " mm" : ""),
        "data-w": String(i), "data-ui": "ink.width", onclick: function () { markIn(b); dk.setWidth(i); } }, [el("span", { class: "k-ink-width-dot", "aria-hidden": "true" })]);
      return b;
    }));
  }
  function choiceGroup(label, list, cur, onPick) {
    return el("div", { class: "k-ink-choices", role: "radiogroup", "aria-label": label }, list.map(function (c) {
      var b = el("button", { type: "button", class: "k-chip k-ink-choice", role: "radio", "aria-checked": String(c[0] === cur), "data-ui": "ink.choice", "data-choice": c[0],
        onclick: function () { markIn(b); onPick(c[0]); } }, [el("span", { text: c[1] })]);
      KOS.ui.state(b, "on", c[0] === cur);
      return b;
    }));
  }
  function optionParts(dk) {
    var p = dk.prefs, t = p.tool, out = [];
    if (hasColour(t)) out.push([t === "hl" ? "Highlighter" : "Colour", swatchGroup(dk)]);
    if (t === "eraser") out.push(["Erases", choiceGroup("Eraser", [["partial", "Partial"], ["stroke", "Whole stroke"]], p.eraser, dk.setEraser)]);
    if (t === "lasso") out.push(["Selects", choiceGroup("Lasso", [["free", "Freehand"], ["box", "Box"]], p.lasso, dk.setLasso)]);
    var sz = sizesOf(dk);
    if (sz) out.push([sz.label, widthGroup(dk)]);
    return out;
  }
  function optionLabel(dk) {
    var p = dk.prefs, t = p.tool, sz = sizesOf(dk);
    var first = t === "eraser" ? (p.eraser === "partial" ? "Partial" : "Whole stroke")
      : t === "lasso" ? (p.lasso === "box" ? "Box" : "Freehand")
      : roleName(t === "hl" ? I.HL_ROLES : I.PEN_ROLES, t === "hl" ? p.hl.role : p.pen.role);
    return sz ? first + " · " + sz.list[sz.cur][0] : first;
  }
  function optionsMenu(dk, className) {
    var t = dk.prefs.tool;
    var m = KOS.ui.menu({ label: optionLabel(dk), className: className, align: "start", panelClass: "k-ink-pop",
      render: function (panel) {
        /* each heading names what is chosen now ("Colour · Teal"), and
           follows a pick made in the open menu */
        var heads = [];
        function now(label) {
          var p = dk.prefs, sz = sizesOf(dk);
          if (label === "Colour" || label === "Highlighter") return roleName(p.tool === "hl" ? I.HL_ROLES : I.PEN_ROLES, p.tool === "hl" ? p.hl.role : p.pen.role);
          if (sz && label === sz.label) return sz.list[sz.cur][0];
          if (label === "Erases") return p.eraser === "partial" ? "Partial" : "Whole stroke";
          if (label === "Selects") return p.lasso === "box" ? "Box" : "Freehand";
          return "";
        }
        optionParts(dk).forEach(function (pt) {
          var h = el("div", { class: "k-kicker", "data-ui": "ink.option-head", text: pt[0] + (now(pt[0]) ? " · " + now(pt[0]) : "") });
          heads.push([h, pt[0]]);
          panel.appendChild(h); panel.appendChild(pt[1]);
        });
        panel.addEventListener("click", function () {
          setTimeout(function () { heads.forEach(function (x) { var v = now(x[1]); x[0].textContent = x[1] + (v ? " · " + v : ""); }); }, 0);
        });
        if (t === "pen" || t === "shape" || t === "ruler")
          panel.appendChild(el("p", { class: "k-ink-pop-note", text: dk.prefs.pressure ? "Width follows your pressure." : "This pen reports no pressure, so the width follows your speed." }));
      } });
    m.setAttribute("data-ui", "ui.menu-button ink.colour-btn");
    m.insertBefore(hasColour(t) ? el("span", { class: "k-ink-dot", "data-role": t === "hl" ? dk.prefs.hl.role : dk.prefs.pen.role, "aria-hidden": "true" }) : glyph(t), m.firstChild);
    return m;
  }
  function paperDialog(dk, paper) {
    dialog({ title: "Paper", className: "k-ink-paper-dialog", render: function (body, close) {
      body.appendChild(papersPicker(paper.get(), function (p) { paper.set(p); close(); }));
      body.appendChild(el("p", { class: "k-ink-pop-note", text: "Changing it here changes this page and the pages you add next; other pages keep their paper." }));
    } });
  }

  /* ---------- the bar and the palette together ----------
     A surface host mounts its bar through here: docked, the bar sits in
     its scroller where the host put it; floating (or under 700) the bar
     folds away and the palette floats over the page. Returns the bar's
     wrapper; destroy() takes the palette too. */
  /* one palette on screen at a time: it belongs to the desk last written
     on (an exam page can hold several pads) */
  var palDesk = null, palSyncs = [];
  function claimPalette(dk) {
    if (palDesk === dk) return;
    palDesk = dk;
    palSyncs.slice().forEach(function (fn) { fn(); });
  }
  function dockable(dk, opts) {
    opts = opts || {};
    var bar = toolbar(dk, opts);
    var wrap = KOS.ui.scroller(bar, { keepRole: true, className: "k-ink-barwrap", prevLabel: "Earlier tools", nextLabel: "More tools" });
    var pal = null;
    function sync() {
      var float = opts.float !== false && (dk.prefs.dock === "float" || phone());
      function shown(d) { return d.surfaces.some(function (x) { return x.host.isConnected && x.host.offsetParent !== null; }); }
      if (float && (!palDesk || !shown(palDesk)) && shown(dk)) palDesk = dk;
      if (palDesk !== dk) float = false;
      KOS.ui.state(wrap, "floating", float);
      if (float && !pal) {
        pal = floatPalette(dk, opts); document.body.appendChild(pal); pal.home();
        /* the palette lives on <body>: it goes with its page */
        var watch = setInterval(function () { if (!wrap.isConnected) { clearInterval(watch); if (pal) { pal.destroy(); pal = null; } if (palDesk === dk) palDesk = null; } }, 800);
      }
      else if (!float && pal) { pal.destroy(); pal = null; }
      if (pal) {
        pal.paint();
        /* a desk inside a dialog: the palette rides above its scrim */
        KOS.ui.state(pal, "over-modal", dk.surfaces.some(function (x) { return !!(x.host.closest && x.host.closest(".k-dialog-overlay")); }));
      }
    }
    var mq = window.matchMedia ? window.matchMedia(PHONE_Q) : null;
    function onMq() { if (!wrap.isConnected) { off(); return; } sync(); }
    function off() { if (mq) { if (mq.removeEventListener) mq.removeEventListener("change", onMq); else if (mq.removeListener) mq.removeListener(onMq); } }
    if (mq) { if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq); }
    dk.onDock = sync;
    dk.claim = function () { claimPalette(dk); };
    palSyncs.push(sync);
    dk.onDestroy(function () {
      off();
      palSyncs = palSyncs.filter(function (f) { return f !== sync; });
      if (pal) { pal.destroy(); pal = null; }
      if (palDesk === dk) { palDesk = null; palSyncs.slice().forEach(function (fn) { fn(); }); }
    });
    setTimeout(sync, 0);
    wrap.bar = bar;
    wrap.sync = sync;
    return wrap;
  }

  /* a picture, downscaled to at most 1400 px and kept as a data URL */
  /* the Paste button: the first picture on the clipboard, placed as a
     paste is; says why when there is none or the browser refuses */
  function pasteClipboard(dk) {
    var cb = navigator.clipboard;
    if (!cb || !cb.read) { KOS.ui.toast("This browser can't read the clipboard from a button. Paste with ⌘V, or drop the picture on the page.", true); return; }
    cb.read().then(function (items) {
      var found = null;
      (items || []).some(function (it) {
        var t = (it.types || []).filter(function (x) { return /^image\//.test(x); })[0];
        if (t) found = { it: it, type: t };
        return !!found;
      });
      if (!found) { KOS.ui.toast("There's no picture on the clipboard. Copy one first (a screenshot, or Copy in Photos)."); return; }
      return found.it.getType(found.type).then(function (blob) {
        readImage(blob, function (src, iw, ih) { dk.placeImage(src, iw, ih); });
      });
    }).catch(function () {
      KOS.ui.toast("The clipboard wasn't shared. Allow Paste when the browser asks, or paste with ⌘V.", true);
    });
  }
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
    KOS.view.listen(root, document, "keydown", onKey);
    return function () { document.removeEventListener("keydown", onKey); };
  }

  Object.assign(KOS.inkUI, { pasteClipboard: pasteClipboard, busy: busy, desk: desk, surface: surface, toolbar: toolbar, shortcuts: shortcuts,
    papersPicker: papersPicker, glyph: glyph, dockable: dockable, floatPalette: floatPalette, readImage: readImage,
    swatchGroup: swatchGroup, widthGroup: widthGroup, phone: phone });
})();
