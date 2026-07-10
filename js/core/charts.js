/* Kurenai OS — core/charts.js
   The shared inline-SVG chart helpers: bar charts, chart cards and the
   GitHub-style calendar heatmap. Hand-built SVG, no charting library —
   the standing rule for every chart in the app (invariant #27).

   Born inside modules/cardstats.js (Build 2c) and consumed from there by
   the whole Collection Matrix; moved to core so consumers stop guarding
   on load order with `if (KOS.charts)`. */
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
      g.appendChild(svgNode("rect", { x: x, y: d.value ? y : H - padB - 1, width: bw,
        height: d.value ? Math.max(2, h) : 1, rx: 3,
        fill: d.color || opts.color || "#8C7CFF", opacity: d.value ? "0.9" : "0.25" }));
      if (d.value && bw > 16) {
        g.appendChild(svgNode("text", { x: x + bw / 2, y: y - 4, "text-anchor": "middle",
          "font-size": "9", fill: "#a99fc0", text: String(d.value) }));
      }
      if (d.label && (n <= 16 || i % Math.ceil(n / 16) === 0)) {
        g.appendChild(svgNode("text", { x: x + bw / 2, y: H - padB + 13, "text-anchor": "middle",
          "font-size": "8.5", fill: "#6e6488", text: d.label }));
      }
      s.appendChild(g);
    });
    s.appendChild(svgNode("line", { x1: padL, y1: H - padB, x2: W - padR, y2: H - padB,
      stroke: "#342a49", "stroke-width": "1" }));
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
      s.appendChild(svgNode("text", { x: 2, y: padT + (i * 2) * (cell + gap) + cell - 2,
        "font-size": "8", fill: "#6e6488", text: lbl }));
    });
    var lastMonth = "";
    days.forEach(function (d, i) {
      var slot = i + firstDow;
      var col = Math.floor(slot / 7), row = slot % 7;
      var x = padL + col * (cell + gap), y = padT + row * (cell + gap);
      var mon = d.date.slice(0, 7);
      if (row === 0 && mon !== lastMonth) {
        lastMonth = mon;
        s.appendChild(svgNode("text", { x: x, y: padT - 4, "font-size": "8", fill: "#6e6488",
          text: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(mon.slice(5), 10) - 1] }));
      }
      var g = svgNode("g", {});
      g.appendChild(svgNode("title", { text: d.hint || (d.date + ": " + d.value) }));
      g.appendChild(svgNode("rect", { x: x, y: y, width: cell, height: cell, rx: 2.5,
        fill: d.value ? (opts.color || "#8C7CFF") : "#141a28",
        opacity: d.value ? String(0.3 + 0.7 * d.value / max) : "1" }));
      s.appendChild(g);
    });
    return s;
  }

  KOS.charts = { svgEl: svgEl, svgNode: svgNode, barChart: barChart, chartCard: chartCard, heatmap: heatmap };
})();
