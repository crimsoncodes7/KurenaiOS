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
  var LABEL = "var(--muted)";
  var AXIS = "var(--line)";
  var DEFAULT_C = "var(--accent)";

  /* vertical bar chart: data = [{label, value, color?, hint?}] */
  function barChart(data, opts) {
    opts = opts || {};
    var W = 560, H = 170, padB = 26, padT = 16, padL = 8, padR = 8;
    var s = svgEl(W, H);
    var max = Math.max(1, opts.max || data.reduce(function (a, d) { return Math.max(a, d.value); }, 0));
    var n = data.length;
    var gap = 6;
    var bw = Math.max(4, (W - padL - padR - gap * (n - 1)) / n);
    data.forEach(function (d, i) {
      var h = Math.round((H - padB - padT) * d.value / max);
      var x = padL + i * (bw + gap);
      var y = H - padB - h;
      var g = svgNode("g", {});
      if (d.hint || d.value) g.appendChild(svgNode("title", { text: (d.hint || d.label + ": " + d.value) }));
      var rect = svgNode("rect", { x: x, y: d.value ? y : H - padB - 1, width: bw,
        height: d.value ? Math.max(2, h) : 1, rx: 3, opacity: d.value ? "0.9" : "0.3" });
      paint(rect, "fill", d.color || opts.color || DEFAULT_C);
      g.appendChild(rect);
      if (d.value && bw > 16) {
        var vt = svgNode("text", { x: x + bw / 2, y: y - 4, "text-anchor": "middle", "font-size": "9", text: String(d.value) });
        paint(vt, "fill", LABEL);
        g.appendChild(vt);
      }
      if (d.label && (n <= 16 || i % Math.ceil(n / 16) === 0)) {
        var lt = svgNode("text", { x: x + bw / 2, y: H - padB + 13, "text-anchor": "middle", "font-size": "8.5", text: d.label });
        paint(lt, "fill", LABEL);
        g.appendChild(lt);
      }
      s.appendChild(g);
    });
    var axis = svgNode("line", { x1: padL, y1: H - padB, x2: W - padR, y2: H - padB, "stroke-width": "1" });
    paint(axis, "stroke", AXIS);
    s.appendChild(axis);
    return s;
  }

  /* horizontal bar chart — better for ranked label-heavy data (genres,
     platforms). data = [{label, value, color?}] */
  function hbarChart(data, opts) {
    opts = opts || {};
    var W = 560, rowH = 24, padL = 4, padR = 40, labelW = opts.labelW || 130;
    var H = data.length * rowH + 6;
    var s = svgEl(W, H);
    var max = Math.max(1, data.reduce(function (a, d) { return Math.max(a, d.value); }, 0));
    data.forEach(function (d, i) {
      var y = i * rowH + 4;
      var w = Math.max(2, (W - padL - labelW - padR) * d.value / max);
      var g = svgNode("g", {});
      g.appendChild(svgNode("title", { text: d.label + ": " + d.value }));
      var lt = svgNode("text", { x: padL + labelW - 8, y: y + 12, "text-anchor": "end", "font-size": "10.5", text: d.label.length > 20 ? d.label.slice(0, 19) + "…" : d.label });
      paint(lt, "fill", "var(--text2)");
      g.appendChild(lt);
      var track = svgNode("rect", { x: padL + labelW, y: y + 3, width: W - padL - labelW - padR, height: 10, rx: 5 });
      paint(track, "fill", "var(--well)");
      g.appendChild(track);
      var bar = svgNode("rect", { x: padL + labelW, y: y + 3, width: w, height: 10, rx: 5 });
      paint(bar, "fill", d.color || opts.color || DEFAULT_C);
      g.appendChild(bar);
      var vt = svgNode("text", { x: padL + labelW + w + 8, y: y + 12, "font-size": "10", "font-weight": "600", text: String(d.value) });
      paint(vt, "fill", LABEL);
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
    var W = 560, H = 150, padB = 22, padT = 12, padL = 8, padR = 8;
    var s = svgEl(W, H);
    if (!points.length) return s;
    var max = Math.max(1, points.reduce(function (a, p) { return Math.max(a, p.value); }, 0));
    var stepX = points.length > 1 ? (W - padL - padR) / (points.length - 1) : 0;
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
        var lt = svgNode("text", { x: c[0], y: H - padB + 13, "text-anchor": "middle", "font-size": "8.5", text: p.label });
        paint(lt, "fill", LABEL);
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
    var cell = 11, gap = 3, padT = 14, padL = 26;
    var max = Math.max(1, days.reduce(function (a, d) { return Math.max(a, d.value); }, 0));
    var firstDow = days.length ? (new Date(days[0].date + "T00:00:00").getDay() + 6) % 7 : 0;  // Mon = 0
    var weeks = Math.ceil((days.length + firstDow) / 7);
    var s = svgEl(padL + weeks * (cell + gap), padT + 7 * (cell + gap));
    ["Mon", "Wed", "Fri"].forEach(function (lbl, i) {
      var t = svgNode("text", { x: 2, y: padT + (i * 2) * (cell + gap) + cell - 2, "font-size": "8", text: lbl });
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
        var mt = svgNode("text", { x: x, y: padT - 4, "font-size": "8",
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
    chartCard: chartCard, heatmap: heatmap };
})();
