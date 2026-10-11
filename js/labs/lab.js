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
     });
     lab.draw(function (d) { …; return { w, h, count, noun }; });
     lab.steps(frames, render, { autoplay })   load a run of frames
     lab.now(body, meta) · lab.values(rows) · lab.legend(items)
     lab.section(id, title, body, meta)        any other readout section */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var NS = "http://www.w3.org/2000/svg";
  var VW = 800, VH = 450, FLOOR = 0.7;
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
      role: "img", "aria-label": o.label || "Simulation stage", "data-ui": "lab.svg" }, [defs, world]);
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

    panel.appendChild(el("div", { class: "k-lab-body", "data-ui": "lab.body" }, [stage, read]));
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
      inner.innerHTML = "";
      var ext = (drawFn && drawFn(d)) || {};
      v.ext = { w: Math.max(1, ext.w || VW), h: Math.max(1, ext.h || VH) };
      v.count = ext.count; v.noun = ext.noun; v.tail = ext.note;
      place();
    };
    lab.d = d;
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

  KOS.lab = { create: create, svg: svg, field: field, choice: choice, action: action, toggle: toggle, sep: sep, VW: VW, VH: VH, FLOOR: FLOOR };
})();
