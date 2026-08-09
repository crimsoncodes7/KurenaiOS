/* Kurenai OS — core/charts.js
   The shared inline-SVG chart helpers: bar charts, horizontal bars, donut
   rings, line charts, chart cards and the calendar heatmap. Hand-built SVG,
   no charting library — the standing rule for every chart in the app
   (invariant #27).

   Colours ride the theme tokens: SVG presentation attributes can't resolve
   var(), so anything token-driven is set through the style attribute. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;

  function svgEl(w, h) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 " + w + " " + h);
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");
    return s;
  }
  function svgNode(tag, attrs) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    return n;
  }
  /* resolve a paint that may be a css var() — attach via style so it works */
  function paint(node, prop, value) {
    node.style[prop] = value;
    return node;
  }
  var LABEL = "var(--text2)";
  var AXIS = "var(--line)";
  var DEFAULT_C = "var(--accent)";

  /* ---- readable axes (audit MTX-4 / U-19, Category 7 Phase D) ----
     "Charts have no axes, no gridlines, no tooltips; category labels
     render at ~7px." A chart nobody can read is decoration with a
     misleading claim to authority. Everything below now has:
       · a value axis with gridlines and its own labels,
       · an 11px label floor — the same floor Phase B set for the UI,
       · a <title> on every mark, so hovering says what it is,
       · honest label handling: a label that will not fit is wrapped or
         angled, never silently truncated to nine characters.          */
  var FONT = 11;          // the floor, everywhere
  var GRID = "var(--line)";

  /* pick ~3 round gridline values up to max */
  function ticks(max) {
    var step = Math.pow(10, Math.floor(Math.log(max) / Math.LN10));
    if (max / step < 2) step /= 2;
    else if (max / step > 5) step *= 2;
    step = Math.max(1, Math.round(step));
    var out = [];
    for (var v = 0; v <= max + 0.001; v += step) out.push(Math.round(v));
    if (out.length > 6) out = out.filter(function (_, i) { return i % 2 === 0; });
    /* the exact maximum is added ONLY when it clears the last round tick —
       otherwise "222" prints on top of "200" and the axis reads as noise */
    if (max - out[out.length - 1] > step * 0.45) out.push(Math.round(max));
    return out;
  }
  /* break a category label onto at most two lines rather than cutting it */
  function wrapLabel(label, chars) {
    var words = String(label).split(/\s+/), lines = [], line = "";
    words.forEach(function (w) {
      if (!line) { line = w; return; }
      if ((line + " " + w).length <= chars) line += " " + w;
      else { lines.push(line); line = w; }
    });
    if (line) lines.push(line);
    if (lines.length > 2) {
      lines = [lines[0], lines.slice(1).join(" ")];
      if (lines[1].length > chars) lines[1] = lines[1].slice(0, chars - 1) + "\u2026";
    }
    return lines;
  }

  /* vertical bar chart: data = [{label, value, color?, hint?}] */
  function barChart(data, opts) {
    opts = opts || {};
    var compact = !!opts.compact;
    var W = opts.width || 560, H = opts.height || (compact ? 132 : 196);
    var padB = compact ? 34 : 40, padT = 12, padL = opts.axis === false ? 8 : 34, padR = 10;
    var s = svgEl(W, H);
    var max = Math.max(1, opts.max || data.reduce(function (a, d) { return Math.max(a, d.value); }, 0));
    var n = data.length;
    var gap = compact ? 5 : 8;
    var bw = Math.max(4, (W - padL - padR - gap * (n - 1)) / n);
    var plotH = H - padB - padT;

    /* the value axis: gridlines and their own labels, so a bar height
       means a number rather than "bigger than the one beside it" */
    if (opts.axis !== false) {
      ticks(max).forEach(function (v) {
        var y = H - padB - plotH * v / max;
        var g = svgNode("line", { x1: padL, y1: y, x2: W - padR, y2: y, "stroke-width": "1",
          "stroke-dasharray": v ? "2 4" : "" });
        paint(g, "stroke", GRID);
        s.appendChild(g);
        var t = svgNode("text", { x: padL - 7, y: y + 3.5, "text-anchor": "end", "font-size": String(FONT), text: String(v) });
        paint(t, "fill", "var(--muted)");
        s.appendChild(t);
      });
    }

    data.forEach(function (d, i) {
      var h = Math.round(plotH * d.value / max);
      var x = padL + i * (bw + gap);
      var y = H - padB - h;
      var g = svgNode("g", {});
      g.appendChild(svgNode("title", { text: (d.hint || d.label + ": " + d.value) }));
      var rect = svgNode("rect", { x: x, y: d.value ? y : H - padB - 1, width: bw,
        height: d.value ? Math.max(2, h) : 1, rx: 3, opacity: d.value ? "0.92" : "0.3" });
      paint(rect, "fill", d.color || opts.color || DEFAULT_C);
      g.appendChild(rect);
      if (d.value && bw > 18) {
        var vt = svgNode("text", { x: x + bw / 2, y: y - 5, "text-anchor": "middle",
          "font-size": String(FONT), "font-weight": "600", text: String(d.value) });
        paint(vt, "fill", "var(--text2)");
        g.appendChild(vt);
      }
      if (d.label) {
        var lines = wrapLabel(d.label, Math.max(6, Math.floor(bw / 6)));
        lines.forEach(function (ln, k) {
          var lt = svgNode("text", { x: x + bw / 2, y: H - padB + 14 + k * 12, "text-anchor": "middle",
            "font-size": String(FONT), text: ln });
          paint(lt, "fill", "var(--text2)");
          g.appendChild(lt);
        });
      }
      s.appendChild(g);
    });
    var axis = svgNode("line", { x1: padL, y1: H - padB, x2: W - padR, y2: H - padB, "stroke-width": "1" });
    paint(axis, "stroke", AXIS);
    s.appendChild(axis);
    return s;
  }

  /* ---- small multiples (audit MTX-2 / U-18) ----
     Four near-identical "X by status" bar charts, same five categories,
     the VN and Games ones carrying a single bar each — four cards' worth
     of page for one comparison. This is that comparison: one card, one
     shared maximum so the panels are actually comparable, one legend.
     groups = [{label, sub, data:[{label,value,color}]}]                */
  function smallMultiples(groups, opts) {
    opts = opts || {};
    groups = (groups || []).filter(function (g) { return g && g.data && g.data.length; });
    var max = Math.max(1, groups.reduce(function (a, g) {
      return Math.max(a, g.data.reduce(function (b, d) { return Math.max(b, d.value); }, 0));
    }, 0));
    var wrap = el("div", { class: "cs-multi" });
    wrap.appendChild(el("div", { class: "cs-multi-row" }, groups.map(function (g) {
      return el("div", { class: "cs-multi-panel" }, [
        el("div", { class: "cs-multi-h" }, [
          el("b", { text: g.label }),
          g.sub ? el("span", { class: "sub", text: g.sub }) : null
        ].filter(Boolean)),
        barChart(g.data.map(function (d) {
          return { label: "", value: d.value, color: d.color, hint: g.label + " — " + d.label + ": " + d.value };
        }), { max: max, compact: true, width: 240, height: 128 })
      ]);
    })));
    /* one legend for the row — the categories are the same everywhere,
       which is the entire reason these belong in one card */
    var legend = el("div", { class: "legend cs-multi-legend" });
    (groups[0] ? groups[0].data : []).forEach(function (d) {
      var i = el("i", {});
      i.style.background = d.color || "var(--accent)";
      legend.appendChild(el("span", {}, [i, d.label]));
    });
    wrap.appendChild(legend);
    if (opts.note) wrap.appendChild(el("p", { class: "sub cs-multi-note", text: opts.note }));
    return wrap;
  }

  /* horizontal bar chart — better for ranked label-heavy data (genres,
     platforms). data = [{label, value, color?}] */
  function hbarChart(data, opts) {
    opts = opts || {};
    var W = 560, rowH = 26, padL = 4, padR = 44, labelW = opts.labelW || 150;
    var H = data.length * rowH + 8;
    var s = svgEl(W, H);
    var max = Math.max(1, data.reduce(function (a, d) { return Math.max(a, d.value); }, 0));
    var trackW = W - padL - labelW - padR;
    /* gridlines behind the bars, so a length reads as a value */
    ticks(max).forEach(function (v) {
      if (!v) return;
      var x = padL + labelW + trackW * v / max;
      var g = svgNode("line", { x1: x, y1: 2, x2: x, y2: H - 6, "stroke-width": "1", "stroke-dasharray": "2 4" });
      paint(g, "stroke", GRID);
      s.appendChild(g);
    });
    data.forEach(function (d, i) {
      var y = i * rowH + 4;
      var w = Math.max(2, trackW * d.value / max);
      var g = svgNode("g", {});
      g.appendChild(svgNode("title", { text: d.label + ": " + d.value }));
      var label = String(d.label);
      var fit = Math.floor(labelW / 6.2);
      var lt = svgNode("text", { x: padL + labelW - 8, y: y + 13, "text-anchor": "end",
        "font-size": String(FONT), text: label.length > fit ? label.slice(0, fit - 1) + "\u2026" : label });
      paint(lt, "fill", "var(--text2)");
      lt.appendChild(svgNode("title", { text: label }));
      g.appendChild(lt);
      var track = svgNode("rect", { x: padL + labelW, y: y + 4, width: trackW, height: 11, rx: 5.5 });
      paint(track, "fill", "var(--well)");
      g.appendChild(track);
      var bar = svgNode("rect", { x: padL + labelW, y: y + 4, width: w, height: 11, rx: 5.5 });
      paint(bar, "fill", d.color || opts.color || DEFAULT_C);
      g.appendChild(bar);
      var vt = svgNode("text", { x: padL + labelW + w + 8, y: y + 13, "font-size": String(FONT), "font-weight": "600", text: String(d.value) });
      paint(vt, "fill", "var(--text2)");
      g.appendChild(vt);
      s.appendChild(g);
    });
    return s;
  }

  /* donut ring — composition at a glance. data = [{label, value, color}];
     opts.centre = big number, opts.centreSub = small line under it. */
  function donutChart(data, opts) {
    opts = opts || {};
    var SZ = 160, R = 62, TH = opts.thickness || 18, C = SZ / 2;
    var s = svgEl(SZ, SZ);
    var total = data.reduce(function (a, d) { return a + d.value; }, 0);
    var track = svgNode("circle", { cx: C, cy: C, r: R, fill: "none", "stroke-width": TH });
    paint(track, "stroke", "var(--well)");
    s.appendChild(track);
    if (total > 0) {
      var circumference = 2 * Math.PI * R;
      var offset = -circumference / 4;   // start at 12 o'clock
      data.forEach(function (d) {
        if (!d.value) return;
        var frac = d.value / total;
        var arc = svgNode("circle", { cx: C, cy: C, r: R, fill: "none", "stroke-width": TH,
          "stroke-dasharray": (frac * circumference - 1.5) + " " + (circumference - frac * circumference + 1.5),
          "stroke-dashoffset": -offset, "stroke-linecap": "butt" });
        paint(arc, "stroke", d.color || DEFAULT_C);
        arc.appendChild(svgNode("title", { text: d.label + ": " + d.value + " (" + Math.round(100 * frac) + "%)" }));
        s.appendChild(arc);
        offset += frac * circumference;
      });
    }
    if (opts.centre != null) {
      var big = svgNode("text", { x: C, y: C + (opts.centreSub ? 0 : 6), "text-anchor": "middle", "font-size": "26", "font-weight": "600", text: String(opts.centre) });
      paint(big, "fill", "var(--text)");
      big.style.fontFamily = "var(--serif)";
      s.appendChild(big);
      if (opts.centreSub) {
        var sub = svgNode("text", { x: C, y: C + 17, "text-anchor": "middle", "font-size": "8.5", "letter-spacing": "1", text: opts.centreSub.toUpperCase() });
        paint(sub, "fill", LABEL);
        s.appendChild(sub);
      }
    }
    return s;
  }

  /* the standard donut + legend block */
  function donutWithLegend(data, opts) {
    var wrap = el("div", { class: "donut-wrap" });
    wrap.appendChild(donutChart(data, opts));
    var lg = el("div", { class: "legend" });
    data.forEach(function (d) {
      if (!d.value) return;
      var i = el("i", {});
      i.style.background = d.color || "var(--accent)";
      lg.appendChild(el("span", {}, [i, d.label + " " + d.value]));
    });
    wrap.appendChild(lg);
    return wrap;
  }

  /* line chart — a trend over time. points = [{label, value, hint?}] */
  function lineChart(points, opts) {
    opts = opts || {};
    var W = 560, H = 168, padB = 26, padT = 12, padL = 32, padR = 10;
    var s = svgEl(W, H);
    if (!points.length) return s;
    var max = Math.max(1, points.reduce(function (a, p) { return Math.max(a, p.value); }, 0));
    var stepX = points.length > 1 ? (W - padL - padR) / (points.length - 1) : 0;
    ticks(max).forEach(function (v) {
      var gy = H - padB - (H - padB - padT) * v / max;
      var gl = svgNode("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, "stroke-width": "1",
        "stroke-dasharray": v ? "2 4" : "" });
      paint(gl, "stroke", GRID);
      s.appendChild(gl);
      var gt = svgNode("text", { x: padL - 7, y: gy + 3.5, "text-anchor": "end", "font-size": String(FONT), text: String(v) });
      paint(gt, "fill", "var(--muted)");
      s.appendChild(gt);
    });
    function xy(p, i) {
      return [padL + i * stepX, H - padB - (H - padB - padT) * p.value / max];
    }
    var coords = points.map(xy);
    /* soft area fill */
    var area = "M" + coords.map(function (c) { return c[0] + "," + c[1]; }).join(" L") +
      " L" + coords[coords.length - 1][0] + "," + (H - padB) + " L" + coords[0][0] + "," + (H - padB) + " Z";
    var af = svgNode("path", { d: area, opacity: "0.14" });
    paint(af, "fill", opts.color || DEFAULT_C);
    s.appendChild(af);
    var line = svgNode("path", { d: "M" + coords.map(function (c) { return c[0] + "," + c[1]; }).join(" L"),
      fill: "none", "stroke-width": "2", "stroke-linejoin": "round", "stroke-linecap": "round" });
    paint(line, "stroke", opts.color || DEFAULT_C);
    s.appendChild(line);
    points.forEach(function (p, i) {
      var c = coords[i];
      var dot = svgNode("circle", { cx: c[0], cy: c[1], r: 3 });
      paint(dot, "fill", opts.color || DEFAULT_C);
      dot.appendChild(svgNode("title", { text: p.hint || (p.label + ": " + p.value) }));
      s.appendChild(dot);
      if (p.label && (points.length <= 12 || i % Math.ceil(points.length / 12) === 0)) {
        var lt = svgNode("text", { x: c[0], y: H - padB + 15, "text-anchor": "middle", "font-size": String(FONT), text: p.label });
        paint(lt, "fill", "var(--text2)");
        s.appendChild(lt);
      }
    });
    var axis = svgNode("line", { x1: padL, y1: H - padB, x2: W - padR, y2: H - padB, "stroke-width": "1" });
    paint(axis, "stroke", AXIS);
    s.appendChild(axis);
    return s;
  }

  function chartCard(title, sub, svg) {
    return el("div", { class: "cs-chart" }, [
      el("div", { class: "cs-chart-h" }, [el("b", { text: title }), el("span", { class: "sub", text: sub })]),
      svg
    ]);
  }

  /* calendar heatmap (Build 3b — the Books reading heatmap): GitHub-style
     week columns, 7 rows. days = [{date:"YYYY-MM-DD", value, hint?}] in
     ascending date order; cells scale opacity against the max value. */
  function heatmap(days, opts) {
    opts = opts || {};
    var cell = opts.cell || 11, gap = opts.gap || 3, padT = 16, padL = 32;
    var max = Math.max(1, days.reduce(function (a, d) { return Math.max(a, d.value); }, 0));
    var firstDow = days.length ? (new Date(days[0].date + "T00:00:00").getDay() + 6) % 7 : 0;  // Mon = 0
    var weeks = Math.ceil((days.length + firstDow) / 7);
    var W = padL + weeks * (cell + gap), H = padT + 7 * (cell + gap);
    var s = svgEl(W, H);
    /* intrinsic size, so the grid keeps GitHub-scale cells instead of being
       stretched to whatever the container is wide (which left the card mostly
       empty air). CSS caps it at 100% and scales height with it. */
    s.setAttribute("width", String(W));
    s.setAttribute("height", String(H));
    ["Mon", "Wed", "Fri"].forEach(function (lbl, i) {
      var t = svgNode("text", { x: 2, y: padT + (i * 2) * (cell + gap) + cell - 2, "font-size": "11", text: lbl });
      paint(t, "fill", LABEL);
      s.appendChild(t);
    });
    var lastMonth = "";
    days.forEach(function (d, i) {
      var slot = i + firstDow;
      var col = Math.floor(slot / 7), row = slot % 7;
      var x = padL + col * (cell + gap), y = padT + row * (cell + gap);
      var mon = d.date.slice(0, 7);
      if (row === 0 && mon !== lastMonth) {
        lastMonth = mon;
        var mt = svgNode("text", { x: x, y: padT - 4, "font-size": "11",
          text: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(mon.slice(5), 10) - 1] });
        paint(mt, "fill", LABEL);
        s.appendChild(mt);
      }
      var g = svgNode("g", {});
      g.appendChild(svgNode("title", { text: d.hint || (d.date + ": " + d.value) }));
      var r = svgNode("rect", { x: x, y: y, width: cell, height: cell, rx: 2.5,
        opacity: d.value ? String(0.3 + 0.7 * d.value / max) : "1" });
      paint(r, "fill", d.value ? (opts.color || DEFAULT_C) : "var(--well)");
      g.appendChild(r);
      s.appendChild(g);
    });
    return s;
  }

  KOS.charts = { svgEl: svgEl, svgNode: svgNode, barChart: barChart, hbarChart: hbarChart,
    donutChart: donutChart, donutWithLegend: donutWithLegend, lineChart: lineChart,
    smallMultiples: smallMultiples, ticks: ticks, chartCard: chartCard, heatmap: heatmap };
})();
