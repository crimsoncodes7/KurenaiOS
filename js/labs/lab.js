/* Kurenai OS — labs/lab.js
   The lab system (design part 2, frame 20). Every lab is one card in four
   parts: the header (sims.js labHead), a control bar, a stage and a
   readout. This file owns the last three, so every archetype — 20a
   diagram, 20b graph, 20c plot, 20d bits, 20e machine — is a drawing on
   the same stage rather than a canvas of its own.

   The stage is a fixed 16:9 box drawn as ONE SVG with an 800 × 450
   viewBox, so it scales as a whole and nothing a sim draws can pass its
   edge. A sim draws its world in its own units and reports the extent;
   the overflow rule places it:
     - it fits → shown at 100%, centred;
     - wider or taller → scaled down, to a floor of 70% (SVG text is at
       least 14 units, so it stays at least 11px in the 720 embed);
     - past the floor → it pans: drag the stage (or arrow keys on it), and
       a minimap appears in the lower right;
     - − and + step by 10%; Fit always returns to the whole drawing.
   The note in the lower left says which state it is in ("8 nodes · fits
   at 100%", "14 nodes · 70%, drag to pan").

   Colour is the stylesheet's (css/views/labs.css), by data-tone: ink is
   the subject hue, the current step crimson ("hot"), frontier or pending
   amber ("front"), visited or done teal ("done"). Nothing here names a
   colour, so a theme re-tints every lab.

     var lab = KOS.lab.create(panel, {
       controls: [nodes],         the left of the control bar
       transport: true,           ↺ Reset · ▶ Run · Step › and the counter
       speed: true,               a speed slider beside the transport
       tick: 900,                 ms per frame at 1× (a sort runs faster)
       onReset: fn,               what ↺ Reset does
       zoom: false,               no zoom control (a bits stage)
       hint: "Tap a bit…",        a fixed note in the stage's top right
       label: "…",                the stage's accessible name
       readout: ["now", "values", "legend"]   section order
       before: [node], kind: "trace"           a column ahead of the stage
       vb: [480, 600]                          a viewBox other than 800 × 450
       work: [node]                            a TEXT lab: a work pane (editor
                                               and output) where the stage sits
     });
     lab.draw(function (d) { …; return { w, h, count, noun }; });
     lab.steps(frames, render, { autoplay })   load a run of frames
     lab.now(body, meta) · lab.values(rows) · lab.legend(items)
     lab.section(id, title, body, meta)        any other readout section */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var NS = "http://www.w3.org/2000/svg";
  var DVW = 800, DVH = 450, FLOOR = 0.7;
  /* the phone crop: below NARROW the frame closes in on the drawing when
     that enlarges it by at least CROP_GAIN; margins in screen pixels */
  var NARROW = 0.6, CROP_GAIN = 1.15, CROP_PAD = 10, CROP_HINT = 30, CROP_TALL = 1.25;
  var TIPS = ["", "hot", "done", "front", "ink"];
  var seq = 0;

  /* an SVG element; `text` sets its text, null attributes are left out */
  function svg(tag, attrs, kids) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "text") n.textContent = String(v);
      else n.setAttribute(k, String(v));
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function num(v) { return Math.round(v * 100) / 100; }
  /* a round step near v: 1, 2 or 5 × a power of ten */
  function nice(v) { var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
  /* the words of a rich body, for an announcement */
  function plain(body) {
    if (body == null) return "";
    if (!Array.isArray(body)) return typeof body === "object" ? body.textContent || "" : String(body);
    return body.map(function (b) { return Array.isArray(b) ? String(b[0]) : plain(b); }).join("");
  }

  /* rich text for the readout: strings, nodes, or [text, tone] pairs */
  function rich(body) {
    if (body == null) return [];
    if (!Array.isArray(body)) body = [body];
    return body.map(function (b) {
      if (Array.isArray(b)) return el("b", { class: "k-lab-em", "data-tone": b[1] || null, text: String(b[0]) });
      return typeof b === "string" || typeof b === "number" ? document.createTextNode(String(b)) : b;
    });
  }

  function create(panel, o) {
    o = o || {};
    var id = "kl" + (++seq);
    /* the viewBox: 800 × 450 (16:9) unless a lab asks for another shape —
       the Trace Lab's structure column is portrait */
    var VW = o.vb ? o.vb[0] : DVW, VH = o.vb ? o.vb[1] : DVH;
    var lab = { id: id };

    /* ---------- the control bar ---------- */
    var bar = el("div", { class: "k-lab-bar", "data-ui": "lab.controls" }, (o.controls || []).slice());
    lab.bar = bar;
    var counter = null, stepBtn = null, runBtn = null, speedIn = null;
    if (o.transport) {
      runBtn = el("button", { type: "button", class: "k-lab-tp-b", "data-ui": "lab.run", text: "▶ Run", onclick: function () { toggleRun(); } });
      stepBtn = el("button", { type: "button", class: "k-lab-tp-b", "data-intent": "primary", "data-ui": "lab.step", text: "Step ›",
        onclick: function () { stopRun(); advance(true); } });
      counter = el("span", { class: "k-lab-count k-mono", "data-ui": "lab.counter" });
      bar.appendChild(el("span", { class: "k-lab-bar-gap", "aria-hidden": "true" }));
      bar.appendChild(el("div", { class: "k-lab-tp", role: "group", "aria-label": "Run controls" }, [
        el("button", { type: "button", class: "k-lab-tp-b", "data-ui": "lab.reset", text: "↺ Reset",
          onclick: function () { stopRun(); if (o.onReset) o.onReset(); } }),
        runBtn, stepBtn
      ]));
      bar.appendChild(counter);
      if (o.speed) {
        speedIn = el("input", { type: "range", min: "0.5", max: "3", step: "0.5", value: "1", "aria-label": "Speed" });
        var speedV = el("b", { class: "k-mono", text: "1×" });
        speedIn.oninput = function () { speedV.textContent = speedIn.value + "×"; if (timer) { stopRun(); toggleRun(); } };
        bar.appendChild(el("label", { class: "k-lab-speed" }, ["Speed", speedIn, speedV]));
      }
    }
    panel.appendChild(bar);

    /* ---------- the stage ---------- */
    var defs = svg("defs", {}, TIPS.map(function (t) {
      return svg("marker", { id: id + "-a" + (t ? "-" + t : ""), viewBox: "0 0 10 10", refX: 9, refY: 5,
        markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" },
        [svg("path", { class: "k-sv-tip", "data-tone": t || null, d: "M0 0L10 5L0 10z" })]);
    }));
    var inner = svg("g", { id: id + "-w" });
    var world = svg("g", { class: "k-sv-world" }, [inner]);
    var root = svg("svg", { class: "k-sv", viewBox: "0 0 " + VW + " " + VH, preserveAspectRatio: "xMidYMid meet",
      role: o.interactive ? "group" : "img", "aria-label": o.label || "Simulation stage", "data-ui": "lab.svg" }, [defs, world]);
    var stage = el("div", { class: "k-lab-stage", "data-ui": "lab.stage" }, [root]);
    var v = { mode: "auto", zoom: 1, s: 1, px: 0, py: 0, ext: { w: VW, h: VH }, canPan: false };
    var pct = null, note = null, mini = null, miniView = null;
    if (o.zoom !== false) {
      pct = el("span", { class: "k-lab-zoom-v k-mono", "data-ui": "lab.zoom-value", text: "100%" });
      stage.appendChild(el("div", { class: "k-lab-zoom", "data-ui": "lab.zoom", role: "group", "aria-label": "Zoom" }, [
        el("button", { type: "button", class: "k-lab-zoom-b", "aria-label": "Zoom out", text: "−",
          onclick: function () { v.mode = "manual"; v.zoom = Math.max(0.3, Math.round((v.s - 0.1) * 10) / 10); place(); } }),
        pct,
        el("button", { type: "button", class: "k-lab-zoom-b", "aria-label": "Zoom in", text: "+",
          onclick: function () { v.mode = "manual"; v.zoom = Math.min(2, Math.round((v.s + 0.1) * 10) / 10); place(); } }),
        el("button", { type: "button", class: "k-lab-zoom-b k-lab-zoom-fit", "data-ui": "lab.zoom-fit", text: "Fit",
          onclick: function () { v.mode = "fit"; v.px = v.py = 0; place(); } })
      ]));
      note = el("span", { class: "k-lab-stage-note k-mono", "data-ui": "lab.stage-note" });
      stage.appendChild(note);
      miniView = svg("rect", { class: "k-sv-mini-v" });
      mini = svg("svg", { class: "k-lab-mini", "aria-hidden": "true", "data-ui": "lab.minimap" },
        [svg("use", { href: "#" + id + "-w" }), miniView]);
      stage.appendChild(mini);
    }
    if (o.hint) stage.appendChild(el("span", { class: "k-lab-stage-hint", text: o.hint }));

    /* ---------- the readout ---------- */
    var order = o.readout || ["now", "values", "legend"];
    var read = el("aside", { class: "k-lab-readout", "data-ui": "lab.readout", "aria-label": "Readout" });
    var secs = {};
    function section(sid, title, body, meta) {
      var s = secs[sid];
      if (!s) {
        s = secs[sid] = { box: el("section", { class: "k-lab-rs", "data-ui": "lab.read-" + sid, "data-sec": sid }) };
        var at = order.indexOf(sid), placed = false;
        if (at >= 0) Object.keys(secs).forEach(function (k) {
          if (placed || k === sid) return;
          var j = order.indexOf(k);
          if (j > at && secs[k].box.parentNode === read) { read.insertBefore(s.box, secs[k].box); placed = true; }
        });
        if (!placed) read.appendChild(s.box);
      }
      var empty = body == null || (Array.isArray(body) && !body.length);
      s.box.hidden = empty;
      s.box.innerHTML = "";
      if (empty) return s.box;
      s.box.appendChild(el("div", { class: "k-lab-rs-h" }, [
        el("h3", { class: "k-kicker", text: title }),
        meta != null ? el("span", { class: "k-lab-rs-meta k-mono", text: String(meta) }) : null
      ].filter(Boolean)));
      var b = el("div", { class: "k-lab-rs-b" }, rich(body));
      s.box.appendChild(b);
      return s.box;
    }
    lab.section = section;
    lab.now = function (body, meta) { return section("now", o.nowTitle || "Now", body ? [el("p", { class: "k-lab-now" }, rich(body))] : null, meta); };
    lab.values = function (rows, title) {
      rows = (rows || []).filter(Boolean);
      return section("values", title || "Values", rows.length ? [el("dl", { class: "k-lab-kv" }, rows.reduce(function (acc, r) {
        acc.push(el("dt", { text: r[0] }));
        acc.push(el("dd", { class: "k-mono", "data-tone": r[2] || null }, rich(r[1])));
        return acc;
      }, []))] : null);
    };
    lab.legend = function (items) {
      return section("legend", "Legend", items && items.length ? [el("ul", { class: "k-lab-keys" }, items.map(function (it) {
        return el("li", {}, [el("span", { class: "k-lab-key", "data-mark": it[0], "aria-hidden": "true" }), it[1]]);
      }))] : null);
    };
    /* a small table for the readout: head row, then rows; `live` marks one */
    lab.table = function (head, rows, live, opts) {
      opts = opts || {};
      return el("table", { class: "k-lab-rtable", "data-ui": opts.hook || null }, [
        head ? el("thead", {}, [el("tr", {}, head.map(function (h) { return el("th", { scope: "col", text: h }); }))]) : null,
        el("tbody", {}, rows.map(function (r, i) {
          return el("tr", { "data-state": i === live ? "live" : (opts.rowState ? opts.rowState(r, i) : null) },
            r.map(function (c) { return el("td", { class: "k-mono" }, rich(c)); }));
        }))
      ].filter(Boolean));
    };
    lab.em = function (t, tone) { return el("b", { class: "k-lab-em", "data-tone": tone || null, text: String(t) }); };

    /* `before`: columns ahead of the stage (the Trace Lab's code pane).
       `work`: a text lab (BNF, SQL, regex, LMC, the NEA tools…) has no
       drawing — its editor and output fill the stage's column, and the
       readout beside it works exactly as it does for a drawn lab */
    var work = o.work ? el("div", { class: "k-lab-workpane", "data-ui": "lab.work" }, o.work) : null;
    panel.appendChild(el("div", { class: "k-lab-body", "data-ui": "lab.body", "data-kind": o.kind || (work ? "text" : null) },
      (o.before || []).concat([work || stage, read])));
    lab.work = work;
    lab.stage = stage;
    lab.readout = read;

    /* ---------- drawing ---------- */
    var d = {
      el: function (tag, attrs, parent) { var n = svg(tag, attrs); (parent || inner).appendChild(n); return n; },
      group: function (attrs) { return d.el("g", attrs || {}); },
      rect: function (x, y, w, h, op, parent) {
        op = op || {};
        return d.el("rect", { x: num(x), y: num(y), width: num(w), height: num(h), rx: op.rx != null ? op.rx : 10,
          class: "k-sv-node" + (op.cls ? " " + op.cls : ""), "data-tone": op.tone || null }, parent);
      },
      circle: function (cx, cy, r, op, parent) {
        op = op || {};
        return d.el("circle", { cx: num(cx), cy: num(cy), r: num(r),
          class: "k-sv-node" + (op.cls ? " " + op.cls : ""), "data-tone": op.tone || null }, parent);
      },
      dot: function (cx, cy, r, tone, parent) {
        return d.el("circle", { cx: num(cx), cy: num(cy), r: num(r || 3.5), class: "k-sv-dot", "data-tone": tone || null }, parent);
      },
      line: function (x1, y1, x2, y2, op, parent) {
        op = op || {};
        return d.el("line", { x1: num(x1), y1: num(y1), x2: num(x2), y2: num(y2),
          class: "k-sv-edge" + (op.cls ? " " + op.cls : ""), "data-tone": op.tone || null, "data-dash": op.dash ? "" : null,
          "marker-end": op.arrow ? "url(#" + id + "-a" + (op.tone && TIPS.indexOf(op.tone) > 0 ? "-" + op.tone : "") + ")" : null }, parent);
      },
      path: function (p, op, parent) {
        op = op || {};
        return d.el("path", { d: p, class: (op.fill ? "k-sv-area" : "k-sv-edge") + (op.cls ? " " + op.cls : ""),
          "data-tone": op.tone || null, "data-dash": op.dash ? "" : null,
          "marker-end": op.arrow ? "url(#" + id + "-a" + (op.tone && TIPS.indexOf(op.tone) > 0 ? "-" + op.tone : "") + ")" : null }, parent);
      },
      text: function (x, y, t, op, parent) {
        op = op || {};
        return d.el("text", { x: num(x), y: num(y), text: t, "font-size": Math.max(14, op.size || 16),
          "text-anchor": op.anchor || "middle", "dominant-baseline": op.baseline || null,
          class: "k-sv-t" + (op.cls ? " " + op.cls : ""), "data-tone": op.tone || null, "data-w": op.weight || null }, parent);
      }
    };
    var drawFn = null;
    lab.draw = function (fn) {
      if (fn) drawFn = fn;
      /* a redraw keeps keyboard focus on the same control (by data-key) */
      var ae = document.activeElement, fk = ae && inner.contains(ae) ? ae.getAttribute("data-key") : null;
      inner.innerHTML = "";
      v.drawnNarrow = lab.narrow ? lab.narrow() : false;
      var ext = (drawFn && drawFn(d)) || {};
      if (fk) { var back = inner.querySelector('[data-key="' + fk + '"]'); if (back && back.focus) back.focus(); }
      v.ext = { w: Math.max(1, ext.w || VW), h: Math.max(1, ext.h || VH) };
      v.count = ext.count; v.noun = ext.noun; v.tail = ext.note;
      place();
    };
    lab.d = d;
    /* make a drawn element a control: Enter, Space and click; `key` keeps
       focus on it across a redraw. A stage with controls is created with
       {interactive: true}, so it is a group rather than an image. */
    d.hit = function (node, name, fn, op) {
      op = op || {};
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", op.role || "button");
      node.setAttribute("aria-label", name);
      if (op.checked != null) node.setAttribute("aria-checked", String(!!op.checked));
      if (op.key != null) node.setAttribute("data-key", String(op.key));
      node.setAttribute("class", (node.getAttribute("class") || "") + " k-sv-hit");
      KOS.a11y.activate(node, fn);
      return node;
    };

    /* ---------- the plot frame (20c) ----------
       Fixed margins, gridlines at a round step with mono tick labels, the
       axes in --text-2, the function in the subject hue and shaded areas
       at 24% of it. Everything is clipped to the frame; where a curve
       leaves it, a small arrow at the edge shows which way it went.
       Called inside a draw: var P = lab.plot(x0, x1, y0, y1, {square}). */
    var clipSeq = 0;
    lab.plot = function (x0, x1, y0, y1, op) {
      op = op || {};
      var L0 = op.l != null ? op.l : 62, T0 = op.t != null ? op.t : 22;
      var W = VW - L0 - (op.r != null ? op.r : 24), H = VH - T0 - (op.b != null ? op.b : 44);
      if (op.square) {
        var k = Math.min(W / (x1 - x0), H / (y1 - y0)), w2 = k * (x1 - x0), h2 = k * (y1 - y0);
        L0 += (W - w2) / 2; T0 += (H - h2) / 2; W = w2; H = h2;
      }
      var cid = id + "-c" + (++clipSeq);
      d.el("clipPath", { id: cid }).appendChild(svg("rect", { x: num(L0), y: num(T0), width: num(W), height: num(H) }));
      var clip = "url(#" + cid + ")";
      var P = { x0: x0, x1: x1, y0: y0, y1: y1, box: { l: L0, t: T0, w: W, h: H } };
      P.X = function (x) { return L0 + (x - x0) / (x1 - x0) * W; };
      P.Y = function (y) { return T0 + (y1 - y) / (y1 - y0) * H; };
      P.invX = function (px) { return x0 + (px - L0) / W * (x1 - x0); };
      P.invY = function (py) { return y1 - (py - T0) / H * (y1 - y0); };
      function cy(y) { var s = y1 - y0; return Math.max(y0 - s, Math.min(y1 + s, y)); }
      function fmt(v, f) { if (f) return f(v); var r = Math.round(v * 1e6) / 1e6; return String(Number(r.toPrecision(4))); }
      P.axes = function (xl, yl, ao) {
        ao = ao || {};
        var sx = ao.xstep || nice((x1 - x0) / (ao.xn || 8)), sy = ao.ystep || nice((y1 - y0) / (ao.yn || 6));
        var g = d.group({ class: "k-sv-grid" });
        for (var gx = Math.ceil(x0 / sx - 1e-9) * sx; gx <= x1 + 1e-9; gx += sx) {
          d.line(P.X(gx), T0, P.X(gx), T0 + H, { tone: "line" }, g);
          if (!ao.noXTicks) d.text(P.X(gx), T0 + H + 22, fmt(gx, ao.xfmt), { size: 14, tone: "mute" });
        }
        for (var gy = Math.ceil(y0 / sy - 1e-9) * sy; gy <= y1 + 1e-9; gy += sy) {
          d.line(L0, P.Y(gy), L0 + W, P.Y(gy), { tone: "line" }, g);
          if (!ao.noYTicks) d.text(L0 - 8, P.Y(gy) + 5, fmt(gy, ao.yfmt), { size: 14, tone: "mute", anchor: "end" });
        }
        if (y0 <= 0 && y1 >= 0) d.line(L0, P.Y(0), L0 + W, P.Y(0), { cls: "k-sv-axis" });
        if (x0 <= 0 && x1 >= 0) d.line(P.X(0), T0, P.X(0), T0 + H, { cls: "k-sv-axis" });
        if (xl) d.text(L0 + W - 4, T0 + H - 8, xl, { size: 14, tone: "sub", anchor: "end" });
        if (yl) d.text(L0 + 8, T0 + 18, yl, { size: 14, tone: "sub", anchor: "start" });
      };
      /* y = f(x) across [from, to]; breaks where f is undefined */
      P.curve = function (f, co) {
        co = co || {};
        var a = co.from != null ? co.from : x0, b = co.to != null ? co.to : x1, n = co.n || 360, dd = "", pen = false, prevIn = null, exits = [];
        for (var i = 0; i <= n; i++) {
          var x = a + (b - a) * i / n, y = f(x);
          if (!isFinite(y)) { pen = false; prevIn = null; continue; }
          var inside = y >= y0 && y <= y1;
          if (prevIn !== null && prevIn !== inside) exits.push([x, y > y1 ? "up" : y < y0 ? "down" : prevIn ? null : null]);
          prevIn = inside;
          dd += (pen ? "L" : "M") + num(P.X(x)) + " " + num(P.Y(cy(y)));
          pen = true;
        }
        if (dd) d.el("path", { d: dd, class: "k-sv-edge k-sv-curve" + (co.cls ? " " + co.cls : ""), "data-tone": co.tone || "ink", "data-dash": co.dash ? "" : null, "clip-path": clip });
        if (co.arrows !== false) exits.forEach(function (e) {
          if (!e[1]) return;
          var px = P.X(e[0]), py = e[1] === "up" ? T0 + 2 : T0 + H - 2, s = e[1] === "up" ? -1 : 1;
          d.el("path", { d: "M" + num(px - 6) + " " + num(py - 7 * s) + "L" + num(px) + " " + num(py) + "L" + num(px + 6) + " " + num(py - 7 * s) + "z", class: "k-sv-clipmark", "data-tone": co.tone || "ink" });
        });
      };
      /* (x(t), y(t)) for t in [t0, t1] */
      P.param = function (fx, fy, t0, t1, co) {
        co = co || {};
        var n = co.n || 200, dd = "";
        for (var i = 0; i <= n; i++) { var t = t0 + (t1 - t0) * i / n, x = fx(t), y = fy(t); if (!isFinite(x) || !isFinite(y)) continue; dd += (dd ? "L" : "M") + num(P.X(x)) + " " + num(P.Y(cy(y))); }
        if (dd) d.el("path", { d: dd, class: "k-sv-edge k-sv-curve", "data-tone": co.tone || "ink", "data-dash": co.dash ? "" : null, "clip-path": clip });
      };
      /* the region between y = f(x) and y = 0 over [a, b] */
      P.area = function (f, a, b, co) {
        co = co || {};
        var n = co.n || 160, dd = "M" + num(P.X(a)) + " " + num(P.Y(cy(0)));
        for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n, y = f(x); dd += "L" + num(P.X(x)) + " " + num(P.Y(cy(isFinite(y) ? y : 0))); }
        dd += "L" + num(P.X(b)) + " " + num(P.Y(cy(0))) + "z";
        d.el("path", { d: dd, class: "k-sv-area", "data-tone": co.tone || null, "clip-path": clip });
      };
      /* a polygon or polyline through data points */
      P.poly = function (pts, co) {
        co = co || {};
        var dd = pts.map(function (p, i) { return (i ? "L" : "M") + num(P.X(p[0])) + " " + num(P.Y(cy(p[1]))); }).join("") + (co.close || co.fill ? "z" : "");
        d.el("path", { d: dd, class: co.fill ? "k-sv-area" : "k-sv-edge", "data-tone": co.tone || null, "data-dash": co.dash ? "" : null, "clip-path": clip });
      };
      P.line = function (xa, ya, xb, yb, co) {
        co = co || {};
        var ln = d.line(P.X(xa), P.Y(cy(ya)), P.X(xb), P.Y(cy(yb)), co);
        if (!co.arrow) ln.setAttribute("clip-path", clip);
        return ln;
      };
      P.dot = function (x, y, co) {
        co = co || {};
        if (!isFinite(x) || !isFinite(y) || y < y0 || y > y1 || x < x0 || x > x1) return null;
        return d.el("circle", { cx: num(P.X(x)), cy: num(P.Y(y)), r: co.r || 5, class: co.hollow ? "k-sv-ring" : "k-sv-dot", "data-tone": co.tone || "ink" });
      };
      P.label = function (x, y, t, co) {
        co = co || {};
        return d.text(P.X(x) + (co.dx || 0), P.Y(cy(y)) + (co.dy != null ? co.dy : -8), t, { size: co.size || 14, tone: co.tone || "sub", anchor: co.anchor || "middle", weight: co.weight });
      };
      /* a bar from 0 up to y, w data units wide, centred on x */
      P.bar = function (x, w, y, co) {
        co = co || {};
        var top = Math.min(P.Y(cy(y)), P.Y(cy(0))), h = Math.abs(P.Y(cy(y)) - P.Y(cy(0)));
        return d.rect(P.X(x - w / 2), top, Math.max(0, P.X(x + w / 2) - P.X(x - w / 2)), h, { rx: co.rx != null ? co.rx : 3, tone: co.tone || "soft" });
      };
      return P;
    };
    /* drag something on a plot: pick(x, y, P) names what was grabbed (or
       null), move(it, x, y) follows the pointer, both in data units */
    lab.drag = function (getP, pick, move, done) {
      stage.addEventListener("pointerdown", function (e) {
        var P = getP(); if (!P) return;
        var w = lab.toWorld(e.clientX, e.clientY); if (!w) return;
        var it = pick(P.invX(w.x), P.invY(w.y), P);
        if (it == null) return;
        e.preventDefault(); e.stopPropagation();
        KOS.ui.state(stage, "dragging", true);
        function mv(ev) { var q = lab.toWorld(ev.clientX, ev.clientY); if (q) move(it, P.invX(q.x), P.invY(q.y)); }
        function up() { KOS.ui.state(stage, "dragging", false); document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); if (done) done(); }
        document.addEventListener("pointermove", mv);
        document.addEventListener("pointerup", up);
      }, true);
      KOS.ui.state(stage, "draggable", true);
    };
    lab.answer = function (title, big, rest, meta, tone) {
      return section("now", title, [el("b", { class: "k-lab-big", "data-ui": "lab.answer", "data-tone": tone || null, text: String(big) }), rest != null ? el("p", { class: "k-lab-work" }, rich(rest)) : null].filter(Boolean), meta);
    };
    /* a pointer position in the drawing's own units (for dragging a node) */
    lab.toWorld = function (cx, cy) {
      var m = inner.getScreenCTM && inner.getScreenCTM();
      if (!m || !root.createSVGPoint) return null;
      var p = root.createSVGPoint(); p.x = cx; p.y = cy;
      p = p.matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    };

    function place() {
      var w = v.ext.w, h = v.ext.h;
      var fitS = Math.min(1, VW / w, VH / h);
      var sc = v.mode === "fit" ? fitS : v.mode === "manual" ? v.zoom : Math.max(FLOOR, fitS);
      var cw = w * sc, ch = h * sc;
      var maxX = Math.max(0, cw - VW), maxY = Math.max(0, ch - VH);
      v.px = Math.min(Math.max(0, v.px), maxX); v.py = Math.min(Math.max(0, v.py), maxY);
      var ox = cw <= VW ? (VW - cw) / 2 : -v.px, oy = ch <= VH ? (VH - ch) / 2 : -v.py;
      v.s = sc; v.canPan = maxX > 0.5 || maxY > 0.5;
      world.setAttribute("transform", "translate(" + num(ox) + " " + num(oy) + ") scale(" + num(sc) + ")");
      KOS.ui.state(stage, "pannable", v.canPan);
      crop(ox, oy, sc);
      root.setAttribute("tabindex", v.canPan ? "0" : "-1");
      if (pct) pct.textContent = Math.round(sc * 100) + "%";
      if (note) {
        var p = Math.round(sc * 100), lead = v.count != null ? v.count + " " + (v.noun || "item") + (v.count === 1 || /s$/.test(v.noun || "") ? "" : "s") : "";
        var state = v.canPan ? p + "%, drag to pan" : p === 100 ? "fits at 100%" : "fits at " + p + "%";
        note.textContent = [lead, v.tail, state].filter(Boolean).join(" · ");
      }
      if (mini) {
        KOS.ui.state(mini, "on", v.canPan);
        if (v.canPan) {
          mini.setAttribute("viewBox", "0 0 " + num(w) + " " + num(h));
          miniView.setAttribute("x", num(v.px / sc)); miniView.setAttribute("y", num(v.py / sc));
          miniView.setAttribute("width", num(Math.min(w, VW / sc))); miniView.setAttribute("height", num(Math.min(h, VH / sc)));
        }
      }
    }
    /* A phone (a stage drawing the 800-wide frame below NARROW of its
       size): the viewBox closes in on what was actually drawn, so a row of
       bits fills the width instead of a third of it. The frame only ever
       grows within a stage width — stepping never makes the stage jump —
       and it is off while the drawing pans, at a manual zoom, or for a lab
       with a shape of its own (the Trace Lab). */
    function crop(ox, oy, sc) {
      var cw = stage.clientWidth, c = null;
      if (cw !== v.cropFor) { v.crop = null; v.cropFor = cw; }
      if (cw && !o.vb && cw / VW < NARROW && !v.canPan && v.mode === "auto" && inner.getBBox) {
        var bb = null;
        try { bb = inner.getBBox(); } catch (e) { bb = null; }
        if (bb && bb.width > 0 && bb.height > 0) {
          var x0 = ox + bb.x * sc, y0 = oy + bb.y * sc, x1 = x0 + bb.width * sc, y1 = y0 + bb.height * sc;
          if (v.crop) { x0 = Math.min(x0, v.crop[0]); y0 = Math.min(y0, v.crop[1]); x1 = Math.max(x1, v.crop[2]); y1 = Math.max(y1, v.crop[3]); }
          v.crop = [x0, y0, x1, y1];
          /* a margin in screen pixels, with headroom for the hint */
          var u = (x1 - x0) / Math.max(1, cw - 2 * CROP_PAD);
          var top = (o.hint ? CROP_HINT : CROP_PAD) * u, side = CROP_PAD * u;
          var w = x1 - x0 + 2 * side, h = y1 - y0 + top + side;
          if (h > w * CROP_TALL) { x0 -= (h / CROP_TALL - w) / 2; w = h / CROP_TALL; }   /* at most a little portrait */
          if (w < VW / CROP_GAIN) c = [x0 - side, y0 - top, w, h];
        }
      }
      root.setAttribute("viewBox", c ? c.map(num).join(" ") : "0 0 " + VW + " " + VH);
      if (c) stage.style.setProperty("--lab-ar", num(c[2]) + " / " + num(c[3]));
      else stage.style.removeProperty("--lab-ar");
      KOS.ui.state(stage, "cropped", !!c);
    }
    /* is the stage a phone's? A sim may lay itself out for it (floating
       point stacks its exponent under the mantissa); crossing the line
       redraws, any other width change only re-places */
    lab.narrow = function () { var cw = stage.clientWidth; return !!cw && cw / VW < NARROW; };
    if (typeof window.ResizeObserver === "function") {
      try {
        new window.ResizeObserver(function () {
          if (stage.clientWidth === v.cropFor) return;
          if (drawFn && lab.narrow() !== v.drawnNarrow) lab.draw(); else place();
        }).observe(stage);
      } catch (e) { /* jsdom */ }
    }
    /* drag (or arrow keys) to pan, in viewBox units */
    root.addEventListener("pointerdown", function (e) {
      if (!v.canPan) return;
      var k = VW / (root.clientWidth || VW), sx = e.clientX, sy = e.clientY, px0 = v.px, py0 = v.py;
      if (root.setPointerCapture) root.setPointerCapture(e.pointerId);
      KOS.ui.state(stage, "panning", true);
      function move(ev) { v.px = px0 - (ev.clientX - sx) * k; v.py = py0 - (ev.clientY - sy) * k; place(); }
      function up() {
        KOS.ui.state(stage, "panning", false);
        root.removeEventListener("pointermove", move); root.removeEventListener("pointerup", up); root.removeEventListener("pointercancel", up);
      }
      root.addEventListener("pointermove", move);
      root.addEventListener("pointerup", up);
      root.addEventListener("pointercancel", up);
    });
    root.addEventListener("keydown", function (e) {
      if (!v.canPan) return;
      var dx = { ArrowLeft: -40, ArrowRight: 40 }[e.key] || 0, dy = { ArrowUp: -40, ArrowDown: 40 }[e.key] || 0;
      if (!dx && !dy) return;
      e.preventDefault(); v.px += dx; v.py += dy; place();
    });
    lab.view = v;

    /* ---------- the transport: a run of frames ---------- */
    var frames = [], at = -1, render = null, timer = null;
    function paintCounter() {
      if (!counter) return;
      counter.textContent = frames.length > 1 ? (at + 1) + " / " + frames.length : "";
      stepBtn.disabled = !frames.length || at >= frames.length - 1;
      runBtn.disabled = !frames.length || at >= frames.length - 1;
      if (!timer) runBtn.textContent = "▶ Run";
    }
    function show(i, said) {
      at = i;
      if (render) render(frames[at], at, frames.length);
      paintCounter();
      if (said && KOS.a11y && KOS.a11y.announce && frames[at] && frames[at].say) KOS.a11y.announce(plain(frames[at].say));
    }
    function advance(said) {
      if (at < frames.length - 1) show(at + 1, said);
      if (at >= frames.length - 1) stopRun();
    }
    function stopRun() {
      if (timer) { clearInterval(timer); timer = null; }
      if (runBtn) { runBtn.textContent = "▶ Run"; runBtn.setAttribute("aria-pressed", "false"); }
      paintCounter();
    }
    function toggleRun() {
      if (timer) { stopRun(); return; }
      if (at >= frames.length - 1) return;
      var ms = Math.round((o.tick || 900) / (speedIn ? parseFloat(speedIn.value) || 1 : 1));
      timer = setInterval(function () { if (!panel.isConnected) { stopRun(); return; } advance(false); }, ms);
      runBtn.textContent = "❚❚ Pause"; runBtn.setAttribute("aria-pressed", "true");
    }
    /* frames: snapshots a sim renders; the sim commits its model when it
       loads them, so a run cut short never leaves the structure half-done */
    lab.steps = function (list, fn, op) {
      stopRun();
      frames = list || []; render = fn || render;
      if (frames.length) show(op && op.at != null ? op.at : 0); else { at = -1; paintCounter(); }
      if (op && op.autoplay && frames.length > 1) toggleRun();
    };
    lab.stop = stopRun;
    lab.frame = function () { return at; };
    lab.last = function () { if (frames.length) { stopRun(); show(frames.length - 1); } };
    if (o.transport) paintCounter();
    return lab;
  }

  /* a labelled field for a control bar: "Value [27]" on one line */
  function field(label, input) {
    return el("label", { class: "k-lab-field" }, [el("span", { text: label }), input]);
  }
  /* a pill group where one choice is on (Dijkstra · BFS · DFS) */
  function choice(items, on, pick, label) {
    var box = el("div", { class: "k-seg k-lab-seg", role: "group", "aria-label": label || null });
    function paint(cur) {
      box.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === cur)); });
    }
    items.forEach(function (it) {
      box.appendChild(el("button", { type: "button", class: "k-seg-item", "data-v": it[0], "data-ui": "lab.choice",
        "aria-pressed": String(it[0] === on), text: it[1], onclick: function () { paint(it[0]); pick(it[0]); } }));
    });
    box.set = paint;
    return box;
  }
  /* an action pill; the primary one is the light pill of the frame */
  function action(text, fn, primary) {
    return el("button", { type: "button", class: "k-lab-pill", "data-intent": primary ? "primary" : null, text: text, onclick: fn });
  }
  /* a switch with its label ("Show indices") */
  function toggle(text, on, fn) {
    var b = el("button", { type: "button", class: "k-lab-toggle", role: "switch", "aria-checked": String(!!on), onclick: function () {
      var nv = b.getAttribute("aria-checked") !== "true";
      b.setAttribute("aria-checked", String(nv)); fn(nv);
    } }, [el("span", { class: "k-lab-toggle-t", "aria-hidden": "true" }), text]);
    return b;
  }
  function sep() { return el("span", { class: "k-lab-bar-sep", "aria-hidden": "true" }); }
  /* a text lab's work-pane panel: a kicker (and a tag) over its body */
  function pane(title, kids, opts) {
    opts = opts || {};
    return el("section", { class: "k-lab-pane", "data-ui": "lab.pane" + (opts.hook ? " " + opts.hook : ""), "aria-label": title }, [
      el("header", { class: "k-lab-pane-h" }, [
        el("span", { class: "k-kicker", text: title }),
        opts.tag != null ? el("span", { class: "k-lab-pane-tag k-mono", "data-ui": "lab.pane-tag", text: String(opts.tag) }) : null
      ].filter(Boolean))
    ].concat((kids || []).filter(Boolean)));
  }
  /* the editor a text lab is written in: monospace unless told otherwise */
  function editor(label, value, opts) {
    opts = opts || {};
    var ta = el("textarea", { class: "k-lab-editor", "data-ui": "lab.editor", spellcheck: "false", autocomplete: "off",
      rows: String(opts.rows || 6), "aria-label": label, "data-mono": opts.mono === false ? null : "" });
    ta.value = value == null ? "" : String(value);
    return ta;
  }
  /* a table that may outgrow a phone: the shared scroller (invariant 50),
     a tab stop only while it overflows */
  function scrollTable(node) {
    node.classList.add("k-lab-tablewrap");
    return KOS.ui.scroller(node, { label: "Table", className: "k-lab-tablescroll", tabWhenScrolls: true,
      prevLabel: "Scroll the table left", nextLabel: "Scroll the table right" });
  }
  /* a text output block (ciphertext, an encoding, highlighted matches) */
  function out(hook) { return el("div", { class: "k-lab-pane-out k-mono", "data-ui": "lab.output" + (hook ? " " + hook : "") }); }
  /* a slider with its value printed beside it (20c: every slider shows its value) */
  function slider(label, min, max, step, val, onchange, show) {
    show = show || String;
    var inp = el("input", { type: "range", min: min, max: max, step: step, value: val });
    var out = el("b", { class: "k-lab-sl-v k-mono", text: show(val) });
    inp.oninput = function () { var x = parseFloat(inp.value); out.textContent = show(x); onchange(x); };
    return { node: el("label", { class: "k-lab-field k-lab-sl" }, [el("span", { text: label }), inp, out]), input: inp,
      set: function (x) { inp.value = x; out.textContent = show(parseFloat(inp.value)); } };
  }

  KOS.lab = { create: create, svg: svg, field: field, choice: choice, action: action, toggle: toggle, sep: sep, slider: slider,
    pane: pane, editor: editor, out: out, scrollTable: scrollTable, nice: nice, VW: DVW, VH: DVH, FLOOR: FLOOR };
})();
