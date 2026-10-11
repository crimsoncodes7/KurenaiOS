/* Kurenai OS — labs/sims-plots.js
   The remaining plot-shaped labs on the 20c frame: graph transformations,
   the unit circle, the definite integral, the binomial distribution, the
   CS vector lab, Big-O growth and analogue-to-digital sampling. Same rules
   as sims-maths.js: the axes rescale to the data, every slider prints its
   value, the readout leads with the answer. */
(function () {
  "use strict";
  var el = KOS.ui.el, L = KOS.lab;
  function n2(v, dp) { if (!isFinite(v)) return "—"; var r = Math.round(v * 1e9) / 1e9; return Number.isInteger(r) ? String(r) : r.toFixed(dp == null ? 2 : dp); }
  function plot(panel, o) { return L.create(panel, Object.assign({ zoom: false }, o)); }
  function numIn(v, step, w, on) { var i = el("input", { type: "number", value: v, step: step || "any", style: "--w: " + (w || 60) + "px" }); if (on) i.addEventListener("input", on); return i; }
  function nCr(n, r) { if (r < 0 || r > n) return 0; var x = 1; for (var i = 0; i < r; i++) x = x * (n - i) / (i + 1); return x; }

  /* =================== GRAPH TRANSFORMATIONS =================== */
  KOS.sims.register({
    id: "fn-transform", title: "Graph transformations", subject: "maths", ref: "2.9",
    desc: "Slide a, b, c and d in y = a·f(bx + c) + d and watch the curve move, with the transformation written in exam language.",
    mount: function (panel) {
      var FNS = { "x²": function (x) { return x * x; }, "x³": function (x) { return x * x * x; }, "sin x": Math.sin, "cos x": Math.cos,
        "|x|": Math.abs, "1/x": function (x) { return 1 / x; }, "√x": function (x) { return x >= 0 ? Math.sqrt(x) : NaN; }, "eˣ": Math.exp };
      var base = "x²", a = 1, b = 1, c = 0, d = 0;
      var fsel = el("select", { style: "--w: 96px" }, Object.keys(FNS).map(function (k) { return el("option", { value: k, text: k }); }));
      fsel.onchange = function () { base = fsel.value; draw(); };
      function s(label, lo, hi, val, set) { return L.slider(label, lo, hi, 0.5, val, function (v) { set(v); draw(); }); }
      var sa = s("a", -3, 3, a, function (v) { a = v; }), sb = s("b", -3, 3, b, function (v) { b = v; }), sc = s("c", -5, 5, c, function (v) { c = v; }), sd = s("d", -5, 5, d, function (v) { d = v; });
      var lab = plot(panel, { label: "y = f(x) and its transformation", readout: ["now", "desc", "legend"],
        controls: [L.field("f(x) =", fsel), sa.node, sb.node, sc.node, sd.node,
          L.action("Reset", function () { a = 1; b = 1; c = 0; d = 0; sa.set(1); sb.set(1); sc.set(0); sd.set(0); draw(); })] });
      lab.legend([["line-mute", "y = f(x)"], ["line-ink", "y = a·f(bx + c) + d"]]);
      function n(v) { return String(Math.round(v * 100) / 100); }
      function draw() {
        var f = FNS[base];
        lab.draw(function () {
          var P = lab.plot(-8, 8, -6, 6);
          P.axes(null, null, { xstep: 2, ystep: 2 });
          P.curve(f, { tone: "sub", dash: true, n: 600 });
          P.curve(function (x) { return b === 0 ? NaN : a * f(b * x + c) + d; }, { n: 600 });
        });
        var eq = "y = " + (a === 1 ? "" : a === -1 ? "−" : n(a) + "·") + "f(" + (b === 1 ? "" : b === -1 ? "−" : n(b)) + "x" + (c ? (c > 0 ? " + " : " − ") + n(Math.abs(c)) : "") + ")" + (d ? (d > 0 ? " + " : " − ") + n(Math.abs(d)) : "");
        lab.section("now", "Equation", [el("b", { class: "k-lab-big", "data-ui": "lab.fn-eq", text: eq }), el("p", { class: "k-lab-work", text: "where f(x) = " + base })]);
        var parts = [];
        if (c) parts.push("a translation by (" + n(-c / (b || 1)) + ", 0)" + (b !== 1 ? ": c acts before the stretch is undone, so the shift is −c ÷ b" : ""));
        if (b !== 1 && b !== 0) parts.push(b === -1 ? "a reflection in the y-axis" : "a stretch, scale factor " + n(1 / Math.abs(b)) + ", parallel to the x-axis" + (b < 0 ? ", with a reflection in the y-axis" : ""));
        if (a !== 1) parts.push(a === -1 ? "a reflection in the x-axis" : "a stretch, scale factor " + n(Math.abs(a)) + ", parallel to the y-axis" + (a < 0 ? ", with a reflection in the x-axis" : ""));
        if (d) parts.push("a translation by (0, " + n(d) + ")");
        lab.section("desc", "Exam wording", [el("p", { class: "k-lab-now", "data-ui": "lab.fn-desc", text: parts.length ? parts.join("; then ") + "." : "No transformation: this is f(x) itself." }),
          el("p", { class: "k-lab-work", text: "Inside the bracket: the x-direction, and it acts backwards. Outside: the y-direction, as written." })]);
      }
      draw();
    }
  });

  /* =================== THE UNIT CIRCLE =================== */
  KOS.sims.register({
    id: "trig-circle", title: "Unit circle", subject: "maths", ref: "5.3",
    desc: "Drag the point around the unit circle: the angle, sin, cos and tan update live, with the CAST diagram and the second solution in [0°, 360°).",
    mount: function (panel) {
      var theta = Math.PI / 6, cast = true, rel = "sin", lastP = null;
      var lab = plot(panel, { label: "The unit circle; drag the point", hint: "drag the point on the circle", readout: ["now", "values", "legend"],
        controls: [L.toggle("CAST", cast, function (on) { cast = on; draw(); }),
          L.choice([["sin", "sin θ = k"], ["cos", "cos θ = k"], ["tan", "tan θ = k"]], rel, function (r) { rel = r; draw(); }, "Second solution for")] });
      lab.legend([["line-hot", "sin θ"], ["line-done", "cos θ"], ["fill-front", "the point"], ["fill-ink", "second solution"]]);
      function deg(t) { var d = t * 180 / Math.PI % 360; return d < 0 ? d + 360 : d; }
      function second() { var d = deg(theta); return rel === "sin" ? (540 - d) % 360 : rel === "cos" ? (360 - d) % 360 : (d + 180) % 360; }
      function draw() {
        var c = Math.cos(theta), s = Math.sin(theta), s2 = second() * Math.PI / 180;
        lab.draw(function () {
          var P = lastP = lab.plot(-1.45, 1.45, -1.3, 1.3, { square: true });
          P.axes(null, null, { xstep: 0.5, ystep: 0.5 });
          P.param(Math.cos, Math.sin, 0, 2 * Math.PI, { tone: "sub" });
          if (cast) [["A", 1, 1], ["S", -1, 1], ["T", -1, -1], ["C", 1, -1]].forEach(function (q) { P.label(q[1] * 0.66, q[2] * 0.66, q[0], { tone: "front", size: 20, weight: "bold", dy: 7 }); });
          P.param(function (t) { return 0.22 * Math.cos(t); }, function (t) { return 0.22 * Math.sin(t); }, 0, deg(theta) * Math.PI / 180, { tone: "front" });
          P.line(0, 0, c, s, { tone: "sub" });
          P.line(0, 0, c, 0, { tone: "done" });
          P.line(c, 0, c, s, { tone: "hot" });
          P.dot(Math.cos(s2), Math.sin(s2), { tone: "ink", r: 6 });
          P.dot(c, s, { tone: "front", r: 8 });
          P.label(0.3 * Math.cos(theta / 2), 0.3 * Math.sin(theta / 2), "θ", { tone: "front", dy: 5, weight: "bold" });
        });
        var d = deg(theta), rad = d * Math.PI / 180;
        lab.answer("θ", d.toFixed(1) + "°", n2(rad, 3) + " rad = " + n2(rad / Math.PI, 3) + "π");
        lab.values([["sin θ", n2(s, 3), "hot"], ["cos θ", n2(c, 3), "done"], ["tan θ", Math.abs(c) < 1e-3 ? "undefined" : n2(s / c, 3)],
          ["second solution", second().toFixed(1) + "° (same " + rel + ")", "ink"]]);
      }
      lab.drag(function () { return lastP; }, function () { return true; }, function (_, x, y) {
        if (x || y) { theta = Math.atan2(y, x); if (theta < 0) theta += 2 * Math.PI; draw(); }
      });
      draw();
    }
  });

  /* =================== THE DEFINITE INTEGRAL =================== */
  KOS.sims.register({
    id: "integration-area", title: "Definite integrals and area", subject: "maths", ref: "8.3",
    desc: "Plot a polynomial, drag the two limits, and compare the signed integral with the total area — the part below the axis is why a region must be split.",
    mount: function (panel) {
      var terms = null, A = -1, B = 3, abs = false, lastP = null;
      var polyIn = el("input", { type: "text", value: "x^2 - 4", spellcheck: "false", style: "--w: 150px" });
      var aIn = numIn(A, "0.5", 56), bIn = numIn(B, "0.5", 56);
      var lab = plot(panel, { label: "A curve with the region between the limits shaded; drag a limit", hint: "drag a or b", readout: ["now", "values", "legend"],
        controls: [L.field("f(x) =", polyIn), L.field("a", aIn), L.field("b", bIn), L.toggle("Total area", abs, function (on) { abs = on; draw(); })] });
      lab.legend([["area-ink", "above the axis"], ["fill-hot", "below the axis"], ["line-front", "limits"]]);
      function f(x) { return KOS.worked.polyEval(terms, x); }
      function F(x) { return terms.reduce(function (s, t) { return s + t.c / (t.p + 1) * Math.pow(x, t.p + 1); }, 0); }
      function clampX(v) { return Math.max(-6, Math.min(6, Math.round(v * 2) / 2)); }
      function update() {
        var t = KOS.worked.parsePoly(polyIn.value);
        if (!t || t.some(function (x) { return x.p < 0; })) { lab.now([["Could not read that: try something like 3x^2 − 2x + 1, with whole-number powers.", "hot"]]); return; }
        terms = t; A = clampX(parseFloat(aIn.value) || 0); B = clampX(parseFloat(bIn.value) || 0);
        draw();
      }
      function draw() {
        if (!terms) return;
        var lo = Math.min(A, B), hi = Math.max(A, B), signed = F(B) - F(A), total = 0, N = 800, h = (hi - lo) / N, roots = [];
        for (var i = 0; i < N; i++) {
          var x0 = lo + i * h, y0 = f(x0), y1 = f(x0 + h);
          total += Math.abs((y0 + y1) / 2) * h;
          if (y0 === 0 || y0 * y1 < 0) roots.push(x0 + h * Math.abs(y0) / (Math.abs(y0) + Math.abs(y1) || 1));
        }
        lab.draw(function () {
          var yr = [Infinity, -Infinity];
          var xa = Math.max(-6, lo - 1.5), xb = Math.min(6, hi + 1.5);
          for (var k = 0; k <= 120; k++) { var y = f(xa + (xb - xa) * k / 120); if (isFinite(y)) { yr[0] = Math.min(yr[0], y); yr[1] = Math.max(yr[1], y); } }
          var lo2 = Math.min(0, yr[0]), hi2 = Math.max(0, yr[1]), pad = (hi2 - lo2) * 0.1 || 1;
          var P = lastP = lab.plot(-6, 6, Math.max(lo2 - pad, -40), Math.min(hi2 + pad, 40));
          P.axes(null, null, { xstep: 1 });
          P.area(function (x) { return abs ? Math.abs(f(x)) : Math.max(0, f(x)); }, lo, hi);
          if (!abs) P.area(function (x) { return Math.min(0, f(x)); }, lo, hi, { tone: "hot" });
          P.curve(f);
          [["a", A], ["b", B]].forEach(function (q) { P.line(q[1], P.y0, q[1], P.y1, { tone: "front", dash: true }); P.label(q[1], P.y1, q[0] + " = " + q[1], { tone: "front", dy: 18, weight: "bold" }); });
        });
        lab.answer(abs ? "Total area" : "Integral", n2(abs ? total : signed, 3), abs ? "Split at each root and add the sizes: " + (roots.length ? "f crosses the axis at x ≈ " + roots.map(function (r) { return n2(r, 2); }).join(", ") : "no root between the limits") + "."
          : "∫ from " + lo + " to " + hi + " of f(x) dx = F(" + hi + ") − F(" + lo + ")");
        lab.values([["signed", n2(signed, 3)], ["total area", n2(total, 3), "ink"], ["they differ by", n2(total - Math.abs(signed), 3), Math.abs(total - Math.abs(signed)) > 1e-6 ? "hot" : null]]);
      }
      lab.drag(function () { return lastP; }, function (x) {
        var da = Math.abs(x - A), db = Math.abs(x - B);
        return Math.min(da, db) > 0.5 ? null : da < db ? "a" : "b";
      }, function (w, x) { var v = clampX(x); if (w === "a") { A = v; aIn.value = v; } else { B = v; bIn.value = v; } draw(); });
      polyIn.addEventListener("input", update); aIn.addEventListener("input", update); bIn.addEventListener("input", update);
      update();
    }
  });

  /* =================== THE BINOMIAL DISTRIBUTION =================== */
  KOS.sims.register({
    id: "binom-dist", title: "Binomial distribution", subject: "maths", ref: "S4.1",
    desc: "Slide n and p to reshape X ~ B(n, p), and read P(X = k), P(X ≤ k), the mean and the variance off the bars.",
    mount: function (panel) {
      var n = 10, p = 0.3, k = 4;
      var sn = L.slider("n", 1, 40, 1, n, function (v) { n = v; sk.input.max = n; if (k > n) { k = n; sk.set(k); } draw(); });
      var sp = L.slider("p", 0.01, 0.99, 0.01, p, function (v) { p = v; draw(); }, function (v) { return v.toFixed(2); });
      var sk = L.slider("k", 0, n, 1, k, function (v) { k = v; draw(); });
      var lab = plot(panel, { label: "Bar chart of X ~ B(n, p)", readout: ["now", "values", "legend"], controls: [sn.node, sp.node, sk.node] });
      lab.legend([["fill-hot", "P(X = k)"], ["fill-front", "the rest of P(X ≤ k)"], ["area-ink", "P(X = x)"]]);
      function draw() {
        var bars = [], cum = 0, j;
        for (j = 0; j <= n; j++) bars.push(nCr(n, j) * Math.pow(p, j) * Math.pow(1 - p, n - j));
        for (j = 0; j <= k; j++) cum += bars[j];
        var peak = Math.max.apply(null, bars);
        lab.draw(function () {
          var P = lab.plot(-0.8, n + 0.8, 0, peak * 1.15);
          P.axes("x", "P(X = x)", { xstep: n > 30 ? 5 : n > 15 ? 2 : 1, yfmt: function (v) { return String(Number(v.toPrecision(2))); } });
          bars.forEach(function (v, x) { P.bar(x, 0.76, v, { tone: x === k ? "hot" : x < k ? "front-wash" : "soft" }); });
        });
        lab.answer("P(X = " + k + ")", bars[k].toFixed(4), "ⁿCₖ pᵏ(1 − p)ⁿ⁻ᵏ = " + nCr(n, k) + " × " + p.toFixed(2) + "^" + k + " × " + (1 - p).toFixed(2) + "^" + (n - k));
        lab.values([["P(X ≤ " + k + ")", cum.toFixed(4), "front"], ["P(X > " + k + ")", (1 - cum).toFixed(4)], ["mean np", n2(n * p, 2)], ["variance np(1 − p)", n2(n * p * (1 - p), 3)], ["X ~", "B(" + n + ", " + p.toFixed(2) + ")"]]);
      }
      draw();
    }
  });

  /* =================== CS: VECTORS =================== */
  KOS.sims.register({
    id: "cs-vector", title: "Vectors", subject: "compsci", ref: "4.2.8.1",
    desc: "Two 2-D vectors as arrows from the origin: a + b by the parallelogram rule, the scalar multiple k·a, the dot product a·b and a convex combination.",
    mount: function (panel) {
      var ax = numIn(3, "any", 52, draw), ay = numIn(1, "any", 52, draw), bx = numIn(1, "any", 52, draw), by = numIn(2, "any", 52, draw), kk = numIn(2, "any", 52, draw);
      var lam = 0.5;
      var sl = L.slider("λ", 0, 1, 0.05, lam, function (v) { lam = v; draw(); }, function (v) { return v.toFixed(2); });
      var lab = plot(panel, { label: "Vectors a and b from the origin", readout: ["now", "values", "legend"],
        controls: [L.field("a = (", ax), ay, el("span", { class: "k-lab-field", text: ")" }), L.field("b = (", bx), by, el("span", { class: "k-lab-field", text: ")" }), L.field("k", kk), sl.node] });
      lab.legend([["line-ink", "a"], ["line-front", "b"], ["line-hot", "a + b"], ["line-mute", "k·a"], ["fill-done", "(1 − λ)a + λb"]]);
      function v(i, dflt) { var x = parseFloat(i.value); return isNaN(x) ? dflt : x; }
      function draw() {
        var A = [v(ax, 0), v(ay, 0)], B = [v(bx, 0), v(by, 0)], k = v(kk, 1);
        var sum = [A[0] + B[0], A[1] + B[1]], ka = [k * A[0], k * A[1]], conv = [(1 - lam) * A[0] + lam * B[0], (1 - lam) * A[1] + lam * B[1]];
        var all = [A, B, sum, ka, [0, 0]], m = 1;
        all.forEach(function (q) { m = Math.max(m, Math.abs(q[0]), Math.abs(q[1])); });
        m = Math.ceil(m * 1.15);
        lab.draw(function () {
          var P = lab.plot(-m, m, -m, m, { square: true });
          P.axes(null, null, { xstep: L.nice(m / 4), ystep: L.nice(m / 4) });
          P.line(A[0], A[1], sum[0], sum[1], { tone: "line", dash: true }); P.line(B[0], B[1], sum[0], sum[1], { tone: "line", dash: true });
          P.line(0, 0, ka[0], ka[1], { tone: "sub", arrow: true });
          P.line(0, 0, sum[0], sum[1], { tone: "hot", arrow: true });
          P.line(0, 0, A[0], A[1], { tone: "ink", arrow: true });
          P.line(0, 0, B[0], B[1], { tone: "front", arrow: true });
          P.line(A[0], A[1], B[0], B[1], { tone: "line" });
          P.dot(conv[0], conv[1], { tone: "done", r: 6 });
          P.label(A[0], A[1], "a", { tone: "ink", weight: "bold", dx: 10 }); P.label(B[0], B[1], "b", { tone: "front", weight: "bold", dx: -10 });
          P.label(sum[0], sum[1], "a + b", { tone: "hot" }); P.label(ka[0], ka[1], k + "·a", { tone: "sub", dy: 18 });
        });
        var dot = A[0] * B[0] + A[1] * B[1], mA = Math.hypot(A[0], A[1]), mB = Math.hypot(B[0], B[1]), cosT = mA && mB ? dot / (mA * mB) : 0;
        lab.answer("a · b", n2(dot, 2), "a₁b₁ + a₂b₂ = " + A[0] + "×" + B[0] + " + " + A[1] + "×" + B[1]);
        lab.values([["a + b", "(" + n2(sum[0]) + ", " + n2(sum[1]) + ")", "hot"], [k + "·a", "(" + n2(ka[0]) + ", " + n2(ka[1]) + ")"], ["|a|", n2(mA, 3)],
          ["angle", (Math.acos(Math.max(-1, Math.min(1, cosT))) * 180 / Math.PI).toFixed(1) + "°"], ["convex λ = " + lam.toFixed(2), "(" + n2(conv[0]) + ", " + n2(conv[1]) + ")", "done"]]);
      }
      draw();
    }
  });

  /* =================== CS: BIG-O GROWTH =================== */
  KOS.sims.register({
    id: "big-o-plot", title: "Big-O growth", subject: "compsci", ref: "4.4.4.3",
    desc: "The standard complexity classes together: drag n to read how many steps each takes, and use the log scale to see why exponential and factorial time are intractable long before n = 100.",
    mount: function (panel) {
      var FN = [
        ["O(1)", function () { return 1; }, "hash table lookup"],
        ["O(log n)", function (n) { return Math.log2(Math.max(2, n)); }, "binary search"],
        ["O(n)", function (n) { return n; }, "linear search"],
        ["O(n log n)", function (n) { return n * Math.log2(Math.max(2, n)); }, "merge sort"],
        ["O(n²)", function (n) { return n * n; }, "bubble sort"],
        ["O(2ⁿ)", function (n) { return Math.pow(2, n); }, "every subset"],
        ["O(n!)", function (n) { return Math.pow(2, lfact(n)); }, "brute-force travelling salesman"]
      ];
      /* log₂ n!, joined smoothly between whole n so the curve is not a staircase */
      function lfact(x) { var k = Math.floor(x), s = 0; for (var i = 2; i <= k; i++) s += Math.log2(i); return s + (x - k) * Math.log2(k + 1); }
      var n = 20, log = true, maxN = 60;
      var sl = L.slider("n", 1, maxN, 1, n, function (v) { n = v; draw(); });
      var lab = plot(panel, { label: "Steps against n for each complexity class", readout: ["now", "values", "legend"],
        controls: [sl.node, L.toggle("Log scale", log, function (on) { log = on; draw(); })] });
      lab.legend(FN.map(function (f, i) { return ["line-s" + (i + 1), f[0]]; }));
      function fmt(v) { return v >= 1e6 ? v.toExponential(2).replace("e+", " × 10^") : Math.round(v).toLocaleString(); }
      function draw() {
        lab.draw(function () {
          var P = lab.plot(0, maxN, 0, log ? 40 : 2500);
          P.axes("n", log ? "steps (log₂)" : "steps", { xstep: 10, ystep: log ? 10 : 500, yfmt: log ? function (v) { return "2^" + v; } : null });
          FN.forEach(function (f, i) { P.curve(function (x) { var s = i === 6 ? null : f[1](Math.max(1, x)); return i === 6 ? (log ? lfact(x) : Math.pow(2, lfact(x))) : log ? Math.log2(Math.max(1, s)) : s; }, { tone: "s" + (i + 1), from: 1, n: maxN * 4 }); });
          P.line(n, P.y0, n, P.y1, { tone: "sub", dash: true });
        });
        lab.answer("n = " + n, fmt(FN[4][1](n)) + " steps", "for O(n²); a polynomial (or better) is tractable, an exponential or factorial is not — use a heuristic instead.");
        lab.values(FN.map(function (f, i) { return [f[0] + " · " + f[2], fmt(f[1](n)), i >= 5 ? "hot" : null]; }));
      }
      draw();
    }
  });

  /* =================== CS: ANALOGUE TO DIGITAL =================== */
  KOS.sims.register({
    id: "adc-sampling", title: "Analogue to digital", subject: "compsci", ref: "4.5.6.1",
    desc: "Sample an analogue wave at a rate you choose and quantise it to a bit depth you choose: watch the staircase drift from the original, and read the file size the settings imply.",
    mount: function (panel) {
      var rate = 12, bits = 3, freq = 1.5, secs = 30;
      var s1 = L.slider("rate (Hz)", 2, 60, 1, rate, function (v) { rate = v; draw(); });
      var s2 = L.slider("bits", 1, 8, 1, bits, function (v) { bits = v; draw(); });
      var s3 = L.slider("signal (Hz)", 0.5, 6, 0.5, freq, function (v) { freq = v; draw(); }, function (v) { return v.toFixed(1); });
      var lab = plot(panel, { label: "An analogue signal and its sampled, quantised reconstruction", readout: ["now", "values", "legend"], controls: [s1.node, s2.node, s3.node] });
      lab.legend([["line-mute", "analogue signal"], ["line-hot", "digital reconstruction"], ["fill-front", "samples"]]);
      function sig(t) { return 0.6 * Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2.7 * t + 1); }
      function draw() {
        var levels = Math.pow(2, bits), samples = [], err = 0;
        for (var i = 0; i <= 2 * rate; i++) {
          var t = i / rate; if (t > 2) break;
          var s = sig(t), q = Math.max(0, Math.min(levels - 1, Math.floor((s + 1) / 2 * levels))), qv = -1 + (q + 0.5) * 2 / levels;
          err += Math.abs(qv - s); samples.push([t, qv]);
        }
        lab.draw(function () {
          var P = lab.plot(0, 2, -1.05, 1.05);
          P.axes("t (s)", null, { xstep: 0.25, noYTicks: levels > 16, ystep: 2 / levels, yfmt: function () { return ""; } });
          for (var l = 0; l < levels && levels <= 64; l++) P.line(0, -1 + (l + 0.5) * 2 / levels, 2, -1 + (l + 0.5) * 2 / levels, { tone: "line" });
          P.curve(sig, { tone: "sub", n: 600 });
          var pts = [];
          samples.forEach(function (q, j) { if (j) pts.push([q[0], samples[j - 1][1]]); pts.push(q); });
          if (samples.length) pts.push([2, samples[samples.length - 1][1]]);
          P.poly(pts, { tone: "hot" });
          samples.forEach(function (q) { P.dot(q[0], q[1], { tone: "front", r: 3.5 }); });
        });
        var size = rate * bits * secs, maxF = freq * 2.7, ok = rate >= 2 * maxF;
        lab.answer("File size", size.toLocaleString() + " bits", "rate × resolution × seconds = " + rate + " × " + bits + " × " + secs + " = " + (size / 8).toLocaleString() + " bytes (mono)");
        lab.values([["levels", levels + " (" + bits + "-bit)"], ["mean quantisation error", (err / Math.max(1, samples.length)).toFixed(3)],
          ["Nyquist", "highest " + maxF.toFixed(1) + " Hz needs ≥ " + (2 * maxF).toFixed(0) + " Hz", ok ? "done" : "hot"], ["verdict", ok ? "no aliasing" : "aliasing: a false, lower frequency", ok ? "done" : "hot"]]);
      }
      draw();
    }
  });
})();
