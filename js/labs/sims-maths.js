/* Kurenai OS — labs/sims-maths.js
   Maths simulations (Edexcel 9MA0) on the lab system's plot frame (design
   part 2, frame 20c), registered on KOS.sims so each one mounts INLINE on
   its topic's Simulate tab and appears in the Simulations view:
     trapezium-rule (9.4)  cobweb-iteration (9.2)  newton-raphson-viz (9.3)
     tangent-gradient (7.1) sector-explorer (5.1)  sequence-explorer (4.4)
     normal-curve (S4.2)   binomial-test-viz (S5.2) sampling-lab (S1.1)
     scatter-regression (S2.2) projectile-lab (M7.5) vt-graph-builder (M7.2)
     vector-playground (10.3) incline-forces (M8.6) moments-beam (M9.1)
   Plots share one frame: fixed margins, gridlines at a round step, the
   function in the subject hue, shaded areas at 24% of it, and the axes
   rescaled to the data so a curve never runs off the stage. The readout
   leads with the answer in large mono type, then the working, then a
   values table. Loaded after lab.js and sims.js. */
(function () {
  "use strict";
  var el = KOS.ui.el, L = KOS.lab;

  /* ---------- shared toolkit ---------- */
  function num(x, dp) { if (!isFinite(x)) return "—"; var r = Math.round(x * 1e9) / 1e9; return Number.isInteger(r) ? String(r) : r.toFixed(dp === undefined ? 3 : dp); }
  function sf(x, s) { if (!isFinite(x)) return "—"; if (x === 0) return "0"; return Number(x.toPrecision(s || 3)).toString(); }
  function sub(n) { return String(n).replace(/\d/g, function (d) { return "₀₁₂₃₄₅₆₇₈₉"[d]; }); }
  function plot(panel, o) { return L.create(panel, Object.assign({ zoom: false }, o)); }

  /* tiny safe expression compiler: x, + - * / ^ ( ), sin cos tan exp ln sqrt abs, pi, e */
  function mkFn(src) {
    var s = String(src || "").toLowerCase().replace(/\s+/g, "").replace(/−/g, "-").replace(/\^/g, "**")
      .replace(/ln\(/g, "log(").replace(/π/g, "pi");
    if (!s || !/^[0-9x+\-*/().,a-z]*$/.test(s)) return null;
    var ok = { x: 1, sin: 1, cos: 1, tan: 1, exp: 1, log: 1, sqrt: 1, abs: 1, pi: 1, e: 1 };
    var ids = s.match(/[a-z]+/g) || [];
    if (ids.some(function (i) { return !ok[i]; })) return null;
    s = s.replace(/(\d)([a-z(])/g, "$1*$2").replace(/\)([0-9a-z(])/g, ")*$1")
         .replace(/x(?=[(\dx])/g, "x*").replace(/pi(?=[\dx(])/g, "pi*");
    try {
      var f = new Function("x", "var sin=Math.sin,cos=Math.cos,tan=Math.tan,exp=Math.exp,log=Math.log,sqrt=Math.sqrt,abs=Math.abs,pi=Math.PI,e=Math.E;return (" + s + ");");
      var t = f(0.7); if (typeof t !== "number") return null;
      return f;
    } catch (err) { return null; }
  }
  function autoRange(f, a, b) {
    var lo = Infinity, hi = -Infinity;
    for (var i = 0; i <= 200; i++) { var y = f(a + (b - a) * i / 200); if (isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
    if (!isFinite(lo)) { lo = -1; hi = 1; }
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    var m = (hi - lo) * 0.12; return [Math.min(0, lo - m), Math.max(0, hi + m)];
  }
  function fnIn(def, onEnter, w) {
    var inp = el("input", { type: "text", value: def, spellcheck: "false", autocomplete: "off", style: "--w: " + (w || 190) + "px" });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); onEnter(); } });
    inp.addEventListener("change", onEnter);
    return inp;
  }
  function numIn(v, step, w, on) {
    var inp = el("input", { type: "number", value: v, step: step || "any", style: "--w: " + (w || 64) + "px" });
    if (on) inp.addEventListener("change", on);
    return inp;
  }
  function bad(lab, text) { lab.now([[text, "hot"]]); }
  /* normal and binomial helpers */
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)); var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x < 0 ? -y : y; }
  function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function PhiInv(p) { var lo = -8, hi = 8; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  function nCr(n, r) { if (r < 0 || r > n) return 0; var x = 1; for (var i = 0; i < r; i++) x = x * (n - i) / (i + 1); return x; }
  function binPmf(n, p, k) { return nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k); }
  function dragOn(lab, getP, pick, move, done) { lab.drag(getP, pick, move, done); }

  /* =================== TRAPEZIUM RULE (20c) =================== */
  KOS.sims.register({
    id: "trapezium-rule", title: "Trapezium rule", subject: "maths", ref: "9.4",
    desc: "Type a function, set the limits and the strips, and watch the trapezia hug the curve. The ordinates are tabulated the way the mark scheme expects, with the error against the true area.",
    mount: function (panel) {
      var n = 4, exact = false, showTable = true;
      var fIn = fnIn("x^2", redraw), aIn = numIn(0, "0.5", 56, redraw), bIn = numIn(2, "0.5", 56, redraw);
      var sl = L.slider("Strips n", 1, 20, 1, n, function (v) { n = v; redraw(); });
      var lab = plot(panel, { label: "Graph of f with the trapezia under it", readout: ["now", "values", "ord", "legend"],
        controls: [L.field("f(x) =", fIn), sl.node, L.field("a", aIn), L.field("b", bIn), L.sep(),
          L.toggle("Show exact area", exact, function (on) { exact = on; redraw(); }),
          L.toggle("Values table", showTable, function (on) { showTable = on; redraw(); })] });
      lab.legend([["area-ink", "trapezia"], ["fill-ink", "ordinates yᵢ"]]);
      function redraw() {
        var f = mkFn(fIn.value); if (!f) return bad(lab, "Could not read that function — use x, + − × ÷ ^ and sin, cos, exp, ln, sqrt.");
        var a = parseFloat(aIn.value), b = parseFloat(bIn.value);
        if (!(b > a)) return bad(lab, "The upper limit b must be greater than a.");
        var h = (b - a) / n, xs = [], ys = [], i;
        for (i = 0; i <= n; i++) { xs.push(a + i * h); ys.push(f(a + i * h)); }
        var inner = 0; for (i = 1; i < n; i++) inner += ys[i];
        var T = h / 2 * (ys[0] + ys[n] + 2 * inner);
        var m = 2000, hh = (b - a) / m, S = f(a) + f(b);
        for (i = 1; i < m; i++) S += (i % 2 ? 4 : 2) * f(a + i * hh);
        S *= hh / 3;
        lab.draw(function () {
          var span = b - a, yr = autoRange(f, a - span * 0.1, b + span * 0.1);
          var P = lab.plot(a - span * 0.12, b + span * 0.25, yr[0], yr[1]);
          P.axes();
          if (exact) P.area(f, a, b, { tone: "sub" });
          for (var k = 0; k < n; k++) {
            P.poly([[xs[k], 0], [xs[k], ys[k]], [xs[k + 1], ys[k + 1]], [xs[k + 1], 0]], { fill: true });
            P.line(xs[k + 1], 0, xs[k + 1], ys[k + 1], { tone: "ink" });
          }
          P.line(xs[0], 0, xs[0], ys[0], { tone: "ink" });
          P.curve(f);
          xs.forEach(function (x, j) { P.dot(x, ys[j], { hollow: true, r: 5 }); });
          P.label(b + span * 0.03, f(b), "y = " + fIn.value.trim(), { anchor: "start", tone: "ink", dy: 4 });
        });
        var conc = 0;
        for (i = 1; i < 200; i++) { var x = a + (b - a) * i / 200, d2 = f(x + 1e-3) - 2 * f(x) + f(x - 1e-3); conc += d2 > 0 ? 1 : d2 < 0 ? -1 : 0; }
        var verdict = Math.abs(conc) > 150 ? (conc > 0 ? "over" : "under") : "mixed";
        lab.answer("Estimate", num(T, 4), "h = " + num(h, 4) + " · ½h [y₀ + 2(y₁ + … + y" + sub(n - 1) + ") + y" + sub(n) + "]");
        lab.values([["exact ∫", num(S, 4)], ["error", (T - S >= 0 ? "+" : "") + num(T - S, 4) + (verdict === "mixed" ? "" : " (" + verdict + ")"), verdict === "over" ? "front" : verdict === "under" ? "done" : null],
          ["strips", String(n)], ["h", num(h, 4)]]);
        lab.section("ord", "Ordinates", showTable ? [lab.table(null, [["x"].concat(xs.map(function (x) { return num(x, 3); })), ["y"].concat(ys.map(function (y) { return num(y, 4); }))], null, { hook: "content.table" })] : null,
          verdict === "mixed" ? "concavity changes" : verdict === "over" ? "convex → over-estimate" : "concave → under-estimate");
      }
      redraw();
    }
  });

  /* =================== ITERATION x = g(x): COBWEB / STAIRCASE =================== */
  KOS.sims.register({
    id: "cobweb-iteration", title: "Iteration x = g(x)", subject: "maths", ref: "9.2",
    desc: "Iterate xₙ₊₁ = g(xₙ) and watch the path bounce between y = g(x) and y = x: a staircase when g′ > 0 at the root, a cobweb when g′ < 0, and divergence when |g′(α)| > 1.",
    mount: function (panel) {
      var seq = [], g = null, ok = true;
      var gIn = fnIn("sqrt(3x + 2)", build), x0In = numIn(0.5, "0.1", 64, build);
      var lab = plot(panel, { label: "Cobweb diagram of y = g(x) and y = x", transport: true, speed: true, tick: 1000, readout: ["now", "values", "tbl", "legend"],
        controls: [L.field("g(x) =", gIn), L.field("x₀", x0In), L.action("Iterate", build, true)], onReset: build });
      lab.legend([["line-ink", "y = g(x)"], ["line-mute", "y = x"], ["line-hot", "the iteration path"]]);
      function build() {
        g = mkFn(gIn.value); if (!g) return bad(lab, "Could not read g(x).");
        var x = parseFloat(x0In.value); seq = [x]; ok = true;
        for (var i = 0; i < 20; i++) { x = g(x); if (!isFinite(x) || Math.abs(x) > 1e6) { ok = false; break; } seq.push(x); if (i > 4 && Math.abs(seq[i + 1] - seq[i]) < 1e-9) break; }
        var frames = seq.map(function (_, k) { return { k: k }; });
        lab.steps(frames, render, { at: Math.min(frames.length - 1, 0) });
      }
      function render(fr, i, n) {
        var k = fr.k, shown = seq.slice(0, k + 1);
        var lo = Math.min.apply(null, seq), hi = Math.max.apply(null, seq), span = Math.max(hi - lo, 1), m = span * 0.45;
        lab.draw(function () {
          var P = lab.plot(lo - m, hi + m, lo - m, hi + m, { square: true });
          P.axes();
          P.curve(function (t) { return t; }, { tone: "sub" });
          P.curve(g);
          var pen = [shown[0], 0];
          for (var j = 0; j < shown.length - 1; j++) {
            P.line(pen[0], pen[1], shown[j], shown[j + 1], { tone: j === shown.length - 2 ? "hot" : "front" });
            P.line(shown[j], shown[j + 1], shown[j + 1], shown[j + 1], { tone: j === shown.length - 2 ? "hot" : "front", dash: true });
            pen = [shown[j + 1], shown[j + 1]];
          }
          P.dot(shown[0], 0, { tone: "front" });
          P.label(shown[0], 0, "x₀", { dy: 22, tone: "front" });
          if (k) P.dot(shown[k], shown[k], { tone: "hot" });
        });
        var last = shown[k], gp = (g(last + 1e-4) - g(last - 1e-4)) / 2e-4;
        lab.answer(k ? "x" + sub(k) : "Start", num(last, 5), k ? "x" + sub(k) + " = g(x" + sub(k - 1) + ") = g(" + num(shown[k - 1], 5) + ")" : "Step › to iterate: up to the curve, across to y = x.", n > 1 ? "Iteration " + k + " of " + (n - 1) : null);
        lab.values([["pattern", gp >= 0 ? "staircase (g′ > 0)" : "cobweb (g′ < 0)"], ["|g′(xₙ)|", num(Math.abs(gp), 3), Math.abs(gp) < 1 ? "done" : "hot"],
          ["verdict", !ok && k === n - 1 ? "diverged" : Math.abs(gp) < 1 ? "converges" : "diverges from this root", Math.abs(gp) < 1 ? "done" : "hot"]]);
        lab.section("tbl", "Iterates", [lab.table(["n", "xₙ"], shown.map(function (v, j) { return [String(j), num(v, 5)]; }), k)], "write more figures than you need");
      }
      build();
    }
  });

  /* =================== NEWTON–RAPHSON (20c, 720 frame) =================== */
  KOS.sims.register({
    id: "newton-raphson-viz", title: "Newton–Raphson", subject: "maths", ref: "9.3",
    desc: "Each step slides down the tangent at xₙ to where it crosses the axis. A start near a turning point fires the next estimate far away; a good start converges fast.",
    mount: function (panel) {
      var seq = [], f = null, broke = "";
      var fIn = fnIn("x^3 - 2x - 5", build), x0In = numIn(3, "0.1", 64, build);
      var lab = plot(panel, { label: "Graph of f with the Newton–Raphson tangents", transport: true, speed: true, tick: 1200, readout: ["now", "values", "tbl", "legend"],
        controls: [L.field("f(x) =", fIn), L.field("x₀", x0In)], onReset: build });
      lab.legend([["line-ink", "y = f(x)"], ["line-hot", "tangent at xₙ"], ["fill-front", "xₙ"]]);
      function d1(x) { return (f(x + 1e-5) - f(x - 1e-5)) / 2e-5; }
      function build() {
        f = mkFn(fIn.value); if (!f) return bad(lab, "Could not read f(x).");
        var x = parseFloat(x0In.value); seq = [x]; broke = "";
        for (var i = 0; i < 8; i++) {
          var fp = d1(x);
          if (Math.abs(fp) < 1e-9) { broke = "The tangent at x" + sub(i) + " is horizontal, so it never meets the axis — the method fails."; break; }
          var nx = x - f(x) / fp;
          if (!isFinite(nx) || Math.abs(nx) > 1e6) { broke = "x" + sub(i + 1) + " shot off to " + sf(nx, 3) + " — a start near a turning point."; break; }
          seq.push(nx); x = nx;
          if (Math.abs(seq[i + 1] - seq[i]) < 1e-10) break;
        }
        lab.steps(seq.map(function (_, k) { return { k: k }; }), render);
      }
      function render(fr, i, n) {
        var k = fr.k, lo = Math.min.apply(null, seq), hi = Math.max.apply(null, seq), span = Math.max(hi - lo, 1);
        lab.draw(function () {
          var xa = lo - span * 0.35, xb = hi + span * 0.35, yr = autoRange(f, xa, xb);
          var P = lab.plot(xa, xb, yr[0], yr[1]);
          P.axes();
          P.curve(f);
          for (var j = 0; j < k; j++) {
            var cur = j === k - 1;
            P.line(seq[j], 0, seq[j], f(seq[j]), { tone: "sub", dash: true });
            P.line(seq[j], f(seq[j]), seq[j + 1], 0, { tone: cur ? "hot" : "faint" });
            P.dot(seq[j], f(seq[j]), { tone: cur ? "hot" : "front", r: 4 });
          }
          for (j = 0; j <= k; j++) { P.dot(seq[j], 0, { tone: j === k ? "front" : "mute", r: 4 }); P.label(seq[j], 0, "x" + sub(j), { dy: 22, tone: j === k ? "front" : "mute" }); }
        });
        var last = seq[k];
        lab.answer(k ? "Iteration " + k : "Start", "x" + sub(k) + " = " + num(last, 4),
          k ? "x" + sub(k) + " = x" + sub(k - 1) + " − f(x" + sub(k - 1) + ")/f′(x" + sub(k - 1) + ") = " + num(seq[k - 1], 4) + " − (" + num(f(seq[k - 1]), 4) + ")/(" + num(d1(seq[k - 1]), 4) + ")" : "Step › to slide down the tangent.");
        if (broke && k === n - 1) lab.now([["The iteration broke down. ", "hot"], broke]);
        lab.values(seq.slice(1, k + 1).map(function (v, j) { return ["x" + sub(j + 1), num(v, 4), j === k - 1 ? "front" : null]; }));
        lab.section("tbl", "Table", k ? [lab.table(["n", "xₙ", "f(xₙ)", "f′(xₙ)"], seq.slice(0, k).map(function (v, j) { return [String(j), num(v, 5), num(f(v), 5), num(d1(v), 5)]; }), k - 1)] : null);
      }
      build();
    }
  });

  /* =================== GRADIENT: CHORD TO TANGENT =================== */
  KOS.sims.register({
    id: "tangent-gradient", title: "Chord to tangent", subject: "maths", ref: "7.1",
    desc: "Slide the second point towards the first and watch the chord's gradient settle on the tangent's: [f(x + h) − f(x)]/h → f′(x) as h → 0.",
    mount: function (panel) {
      var x0 = 1.5, h = 1.5, f = null;
      var fIn = fnIn("x^2 - 2x", redraw);
      var s1 = L.slider("x", -4, 4, 0.1, x0, function (v) { x0 = v; redraw(); }, function (v) { return num(v, 1); });
      var s2 = L.slider("h", 0.01, 3, 0.01, h, function (v) { h = v; redraw(); }, function (v) { return num(v, 2); });
      var lab = plot(panel, { label: "A curve with a chord and the tangent", readout: ["now", "values", "legend"],
        controls: [L.field("f(x) =", fIn), s1.node, s2.node, L.action("Let h → 0", shrink, true)] });
      lab.legend([["line-ink", "y = f(x)"], ["line-hot", "chord"], ["line-done", "tangent"]]);
      var timer = null;
      function shrink() {
        clearInterval(timer);
        var steps = [1.5, 1, 0.6, 0.3, 0.15, 0.05, 0.01], i = 0;
        timer = setInterval(function () { if (i >= steps.length || !panel.isConnected) { clearInterval(timer); return; } h = steps[i++]; s2.set(h); redraw(); }, 650);
      }
      function redraw() {
        f = mkFn(fIn.value); if (!f) return bad(lab, "Could not read f(x).");
        var y0 = f(x0), y1 = f(x0 + h), chord = (y1 - y0) / h, tang = (f(x0 + 1e-5) - f(x0 - 1e-5)) / 2e-5;
        lab.draw(function () {
          var yr = autoRange(f, -5, 5), P = lab.plot(-5, 5, yr[0], yr[1]);
          P.axes();
          P.curve(f);
          P.line(P.x0, y0 + tang * (P.x0 - x0), P.x1, y0 + tang * (P.x1 - x0), { tone: "done", dash: true });
          P.line(P.x0, y0 + chord * (P.x0 - x0), P.x1, y0 + chord * (P.x1 - x0), { tone: "hot" });
          P.line(x0, y0, x0 + h, y0, { tone: "sub", dash: true }); P.line(x0 + h, y0, x0 + h, y1, { tone: "sub", dash: true });
          P.label(x0 + h / 2, y0, "h", { dy: 20, tone: "sub" });
          P.dot(x0, y0, { tone: "front", r: 6 }); P.dot(x0 + h, y1, { tone: "hot" });
        });
        lab.answer("Chord gradient", num(chord, 4), "[f(" + num(x0, 2) + " + " + num(h, 2) + ") − f(" + num(x0, 2) + ")] / " + num(h, 2) + " = (" + num(y1, 4) + " − " + num(y0, 4) + ") / " + num(h, 2));
        lab.values([["f′(" + num(x0, 2) + ")", num(tang, 4), "done"], ["gap", num(Math.abs(chord - tang), 4)], ["h", num(h, 2)]]);
      }
      redraw();
    }
  });

  /* =================== RADIANS: ARC, SECTOR AND SEGMENT =================== */
  KOS.sims.register({
    id: "sector-explorer", title: "Arc, sector and segment", subject: "maths", ref: "5.1",
    desc: "Drag the angle in radians: arc length rθ, sector area ½r²θ and the segment cut off by the chord update, with degrees alongside.",
    mount: function (panel) {
      var r = 5, th = 1.2;
      var s1 = L.slider("r", 1, 10, 0.5, r, function (v) { r = v; redraw(); });
      var s2 = L.slider("θ (rad)", 0.1, 6.2, 0.05, th, function (v) { th = v; redraw(); }, function (v) { return num(v, 2); });
      function preset(t, label) { return L.action(label, function () { th = t; s2.set(num(t, 2)); th = t; redraw(); }); }
      var lab = plot(panel, { label: "A circle with a sector and its segment", readout: ["now", "values", "legend"],
        controls: [s1.node, s2.node, preset(Math.PI / 3, "π/3"), preset(Math.PI / 2, "π/2"), preset(Math.PI, "π")] });
      lab.legend([["area-ink", "sector"], ["fill-hot", "segment"], ["line-front", "arc"]]);
      function redraw() {
        lab.draw(function (d) {
          var cx = 330, cy = 230, R = 180, ex = cx + R * Math.cos(th), ey = cy - R * Math.sin(th), large = th > Math.PI ? 1 : 0;
          d.circle(cx, cy, R, { tone: "ghost" });
          d.path("M" + cx + " " + cy + " L" + (cx + R) + " " + cy + " A" + R + " " + R + " 0 " + large + " 0 " + ex.toFixed(2) + " " + ey.toFixed(2) + " Z", { fill: true });
          d.path("M" + (cx + R) + " " + cy + " A" + R + " " + R + " 0 " + large + " 0 " + ex.toFixed(2) + " " + ey.toFixed(2) + " Z", { fill: true, tone: "hot" });
          d.path("M" + (cx + R) + " " + cy + " A" + R + " " + R + " 0 " + large + " 0 " + ex.toFixed(2) + " " + ey.toFixed(2), { tone: "front", cls: "k-sv-curve" });
          d.line(cx, cy, cx + R, cy, { tone: "ink" }); d.line(cx, cy, ex, ey, { tone: "ink" });
          d.line(cx + R, cy, ex, ey, { tone: "hot", dash: true });
          var ar = 38;
          d.path("M" + (cx + ar) + " " + cy + " A" + ar + " " + ar + " 0 " + large + " 0 " + (cx + ar * Math.cos(th)).toFixed(2) + " " + (cy - ar * Math.sin(th)).toFixed(2), { tone: "sub" });
          d.text(cx + 58 * Math.cos(th / 2), cy - 58 * Math.sin(th / 2) + 5, "θ", { size: 16, weight: "bold" });
          d.text(cx + R / 2, cy + 22, "r = " + r, { size: 14, tone: "sub" });
          d.dot(cx, cy, 4, "ink");
          return { w: 800, h: 450 };
        });
        var arc = r * th, area = 0.5 * r * r * th, seg = 0.5 * r * r * (th - Math.sin(th)), chord = 2 * r * Math.sin(th / 2);
        lab.answer("θ = " + num(th, 3) + " rad", num(th * 180 / Math.PI, 1) + "°", "Formulas need θ in radians: π rad = 180°.");
        lab.values([["arc rθ", num(arc, 3), "front"], ["sector ½r²θ", num(area, 3), "ink"], ["segment ½r²(θ − sin θ)", num(seg, 3), "hot"], ["chord 2r sin(θ/2)", num(chord, 3)],
          ["sector perimeter 2r + rθ", num(2 * r + arc, 3)]]);
      }
      redraw();
    }
  });

  /* =================== SEQUENCES AND SERIES =================== */
  KOS.sims.register({
    id: "sequence-explorer", title: "Sequences and series", subject: "maths", ref: "4.4",
    desc: "Arithmetic or geometric: the terms as bars and the running sum Sₙ as a line, with a geometric series converging to a/(1 − r) when |r| < 1 — or refusing to.",
    mount: function (panel) {
      var type = "geo", n = 12;
      var aIn = numIn(8, "0.5", 64, redraw), kIn = numIn(0.6, "0.1", 64, redraw), kField = L.field("r", kIn);
      var sl = L.slider("n", 2, 30, 1, n, function (v) { n = v; redraw(); });
      var lab = plot(panel, { label: "Terms and partial sums of a sequence", readout: ["now", "values", "tbl", "legend"],
        controls: [L.choice([["arith", "Arithmetic"], ["geo", "Geometric"]], type, function (t) { type = t; kField.firstChild.textContent = t === "geo" ? "r" : "d"; redraw(); }, "Sequence"),
          L.field("a", aIn), kField, sl.node] });
      lab.legend([["fill-ink", "terms uₙ"], ["line-front", "partial sums Sₙ"], ["line-done", "S∞"]]);
      function redraw() {
        var a = parseFloat(aIn.value), k = parseFloat(kIn.value);
        if (!isFinite(a) || !isFinite(k)) return bad(lab, "Enter numbers for a and " + (type === "geo" ? "r" : "d") + ".");
        var terms = [], sums = [], S = 0;
        for (var i = 1; i <= n; i++) { var u = type === "geo" ? a * Math.pow(k, i - 1) : a + (i - 1) * k; terms.push(u); S += u; sums.push(S); }
        var all = terms.concat(sums).concat([0]), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
        if (!isFinite(lo) || !isFinite(hi) || Math.abs(hi) > 1e12) return bad(lab, "The values overflow — reduce n or r.");
        var Sinf = type === "geo" && Math.abs(k) < 1 ? a / (1 - k) : null;
        lab.draw(function () {
          var pad = (hi - lo) * 0.1 || 1, P = lab.plot(0, n + 1, lo - pad, hi + pad);
          P.axes("n", null, { xstep: n > 20 ? 5 : n > 10 ? 2 : 1 });
          terms.forEach(function (u, j) { P.bar(j + 1, 0.5, u); });
          P.poly(sums.map(function (s, j) { return [j + 1, s]; }), { tone: "front" });
          sums.forEach(function (s, j) { P.dot(j + 1, s, { tone: "front", r: 3.5 }); });
          if (Sinf != null) { P.line(0, Sinf, n + 1, Sinf, { tone: "done", dash: true }); P.label(n + 0.8, Sinf, "S∞", { anchor: "end", tone: "done" }); }
        });
        lab.answer("S" + sub(n), sf(sums[n - 1], 6), type === "geo" ? "Sₙ = a(1 − rⁿ)/(1 − r)" : "Sₙ = n/2 [2a + (n − 1)d]");
        lab.values([["u" + sub(n), sf(terms[n - 1], 6)], type === "geo" ? ["S∞", Sinf != null ? sf(Sinf, 6) : "none — |r| ≥ 1", Sinf != null ? "done" : "hot"] : ["d", String(k)],
          ["uₙ", type === "geo" ? "arⁿ⁻¹" : "a + (n − 1)d"]]);
        var cut = Math.min(n, 10);
        lab.section("tbl", "First terms", [lab.table(["n", "uₙ", "Sₙ"], terms.slice(0, cut).map(function (u, j) { return [String(j + 1), sf(u, 4), sf(sums[j], 4)]; }), null, { hook: "content.table" })], n > cut ? "first " + cut + " of " + n : null);
      }
      redraw();
    }
  });

  /* =================== NORMAL DISTRIBUTION (20c, 720 frame) =================== */
  KOS.sims.register({
    id: "normal-curve", title: "Normal distribution", subject: "maths", ref: "S4.2",
    desc: "Set μ and σ, pick the probability, and drag the bounds: the shaded area, the z-values and the calculator statement move together. Inverse mode finds x for a given probability.",
    mount: function (panel) {
      var mu = 100, sg = 15, mode = "lt", a = 115, b = 130, p = 0.9;
      var muIn = numIn(mu, "1", 64, rescale), sgIn = numIn(sg, "0.5", 64, rescale);
      var sa = L.slider("a", 40, 160, 0.5, a, function (v) { a = v; redraw(); });
      var sb = L.slider("b", 40, 160, 0.5, b, function (v) { b = v; redraw(); });
      var sp = L.slider("p", 0.001, 0.999, 0.001, p, function (v) { p = v; redraw(); }, function (v) { return num(v, 3); });
      var lab = plot(panel, { label: "The normal curve with the probability shaded", readout: ["now", "values", "legend"],
        controls: [L.field("μ", muIn), L.field("σ", sgIn),
          L.choice([["lt", "P(X < a)"], ["gt", "P(X > a)"], ["between", "between"], ["inv", "inverse"]], mode, function (m) { mode = m; redraw(); }, "Probability"),
          sa.node, sb.node, sp.node] });
      lab.legend([["line-ink", "the pdf"], ["area-ink", "probability"], ["line-mute", "μ and μ ± σ"]]);
      function rescale() {
        mu = parseFloat(muIn.value); sg = Math.max(0.1, parseFloat(sgIn.value) || 1);
        [sa, sb].forEach(function (s) { s.input.min = mu - 4 * sg; s.input.max = mu + 4 * sg; s.input.step = sg / 20; });
        a = Math.max(mu - 4 * sg, Math.min(mu + 4 * sg, a)); b = Math.max(a, Math.min(mu + 4 * sg, b));
        sa.set(a); sb.set(b); redraw();
      }
      function redraw() {
        sb.node.hidden = mode !== "between"; sa.node.hidden = mode === "inv"; sp.node.hidden = mode !== "inv";
        var x0 = mu - 4 * sg, x1 = mu + 4 * sg, peak = 1 / (sg * Math.sqrt(2 * Math.PI));
        var pdf = function (x) { return peak * Math.exp(-0.5 * Math.pow((x - mu) / sg, 2)); };
        var lo, hi, prob, stmt, z = (a - mu) / sg, calc;
        if (mode === "lt") { lo = x0; hi = a; prob = Phi(z); stmt = "P(X < " + num(a, 2) + ")"; calc = "Normal CD: lower −1×10⁹⁹, upper " + num(a, 2); }
        else if (mode === "gt") { lo = a; hi = x1; prob = 1 - Phi(z); stmt = "P(X > " + num(a, 2) + ")"; calc = "Normal CD: lower " + num(a, 2) + ", upper 1×10⁹⁹"; }
        else if (mode === "between") { lo = Math.min(a, b); hi = Math.max(a, b); prob = Phi((hi - mu) / sg) - Phi((lo - mu) / sg); stmt = "P(" + num(lo, 2) + " < X < " + num(hi, 2) + ")"; calc = "Normal CD: lower " + num(lo, 2) + ", upper " + num(hi, 2); }
        else { z = PhiInv(p); lo = x0; hi = mu + z * sg; prob = p; stmt = "x"; calc = "Inverse Normal: area " + num(p, 3) + ", σ " + num(sg, 2) + ", μ " + num(mu, 2); }
        lab.draw(function () {
          var P = lab.plot(x0, x1, 0, peak * 1.15);
          P.axes(null, null, { xstep: L.nice(sg), yfmt: function (v) { return String(Number(v.toPrecision(2))); } });
          P.area(pdf, lo, hi);
          P.curve(pdf);
          P.line(mu, 0, mu, peak, { tone: "sub", dash: true });
          [-1, 1].forEach(function (k) { P.line(mu + k * sg, 0, mu + k * sg, pdf(mu + k * sg), { tone: "line", dash: true }); });
          var mark = mode === "inv" ? hi : a;
          P.line(mark, 0, mark, pdf(mark), { tone: "hot" });
          P.label((Math.max(lo, x0) + Math.min(hi, x1)) / 2, pdf((Math.max(lo, x0) + Math.min(hi, x1)) / 2) * 0.4, num(prob, 4), { tone: "ink", weight: "bold", size: 16 });
        });
        if (mode === "inv") lab.answer("Result", "x = " + num(hi, 3), "P(X < x) = " + num(p, 3) + " ⇒ z = " + num(z, 4) + " ⇒ x = μ + zσ");
        else lab.answer("Result", stmt + " = " + num(prob, 4), mode === "between" ? "Φ(" + num((hi - mu) / sg, 4) + ") − Φ(" + num((lo - mu) / sg, 4) + ")" : null);
        lab.values([["z", mode === "inv" ? num(z, 4) : "(" + num(a, 2) + " − " + num(mu, 2) + ") / " + num(sg, 2) + " = " + num(z, 4)], ["fx-991CW", calc], ["X ~ N(μ, σ²)", "N(" + num(mu, 2) + ", " + num(sg, 2) + "²)"]]);
      }
      rescale();
    }
  });

  /* =================== BINOMIAL HYPOTHESIS TEST =================== */
  KOS.sims.register({
    id: "binomial-test-viz", title: "Binomial hypothesis test", subject: "maths", ref: "S5.2",
    desc: "Set n and p under H₀, the tail and the level: the bars shade the critical region, and the observed value gives the p-value and a conclusion worded the way the mark scheme wants.",
    mount: function (panel) {
      var n = 20, p = 0.25, tail = "upper", alpha = 0.05, x = 9;
      var sn = L.slider("n", 5, 60, 1, n, function (v) { n = v; sx.input.max = n; x = Math.min(x, n); sx.set(x); redraw(); });
      var sp = L.slider("p (H₀)", 0.02, 0.98, 0.01, p, function (v) { p = v; redraw(); }, function (v) { return num(v, 2); });
      var sx = L.slider("observed x", 0, n, 1, x, function (v) { x = v; redraw(); });
      var lab = plot(panel, { label: "Bar chart of X ~ B(n, p) with the critical region", readout: ["now", "values", "legend"],
        controls: [sn.node, sp.node, L.choice([["upper", "p > p₀"], ["lower", "p < p₀"], ["two", "p ≠ p₀"]], tail, function (t) { tail = t; redraw(); }, "H₁"),
          L.choice([["0.1", "10%"], ["0.05", "5%"], ["0.01", "1%"]], "0.05", function (v) { alpha = parseFloat(v); redraw(); }, "Level"), sx.node] });
      lab.legend([["fill-hot", "critical region"], ["fill-front", "observed x"], ["area-ink", "P(X = x) under H₀"]]);
      function redraw() {
        var pm = [], cdf = [], c = 0, k;
        for (k = 0; k <= n; k++) { pm.push(binPmf(n, p, k)); c += pm[k]; cdf.push(c); }
        var tl = tail === "two" ? alpha / 2 : alpha, lowCR = -1, highCR = n + 1;
        if (tail !== "upper") for (k = 0; k <= n; k++) if (cdf[k] <= tl) lowCR = k;
        if (tail !== "lower") for (k = n; k >= 0; k--) if (1 - (k > 0 ? cdf[k - 1] : 0) <= tl) highCR = k;
        var actual = (lowCR >= 0 ? cdf[lowCR] : 0) + (highCR <= n ? 1 - (highCR > 0 ? cdf[highCR - 1] : 0) : 0);
        var pLow = cdf[x], pHigh = 1 - (x > 0 ? cdf[x - 1] : 0), pval = tail === "upper" ? pHigh : tail === "lower" ? pLow : 2 * Math.min(pLow, pHigh);
        var inCR = x <= lowCR || x >= highCR, peak = Math.max.apply(null, pm);
        lab.draw(function () {
          var P = lab.plot(-0.8, n + 0.8, 0, peak * 1.15);
          P.axes("x", "P(X = x)", { xstep: n > 30 ? 5 : n > 15 ? 2 : 1, yfmt: function (v) { return String(Number(v.toPrecision(2))); } });
          pm.forEach(function (v, j) { P.bar(j, 0.76, v, { tone: j === x ? "front-wash" : j <= lowCR || j >= highCR ? "hot" : "soft" }); });
        });
        var h1 = tail === "upper" ? "p > " + p : tail === "lower" ? "p < " + p : "p ≠ " + p, cr = [];
        if (tail !== "upper") cr.push(lowCR >= 0 ? "X ≤ " + lowCR : "no lower region");
        if (tail !== "lower") cr.push(highCR <= n ? "X ≥ " + highCR : "no upper region");
        lab.answer(inCR ? "Reject H₀" : "Do not reject H₀", (tail === "upper" ? "P(X ≥ " + x + ")" : tail === "lower" ? "P(X ≤ " + x + ")" : "p-value") + " = " + num(pval, 4),
          (inCR ? "There is evidence at the " : "There is insufficient evidence at the ") + alpha * 100 + "% level that " + h1 + ".");
        lab.values([["H₀ / H₁", "p = " + p + " / " + h1], ["X ~", "B(" + n + ", " + p + ")"], ["critical region", cr.join(" and "), "hot"], ["actual level", num(actual, 4) + " (" + num(actual * 100, 2) + "%)"],
          ["each tail", "≤ " + num(tl, 3) + " (Edexcel)"]]);
      }
      redraw();
    }
  });

  /* =================== SAMPLING LAB =================== */
  KOS.sims.register({
    id: "sampling-lab", title: "Sampling methods", subject: "maths", ref: "S1.1",
    desc: "A population of 240 heights in three strata. Draw samples by each method, compare the sample mean with the population mean, and build up the spread of sample means.",
    mount: function (panel) {
      var POP = [], STRATA = ["Year 12", "Year 13", "Staff"], SIZE = [120, 90, 30], MEANS = [168, 172, 175], TONE = ["ink", "done", "front"];
      var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      function gauss() { var u = rnd() || 1e-9, v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
      SIZE.forEach(function (s, g) { for (var i = 0; i < s; i++) POP.push({ g: g, v: Math.round((MEANS[g] + 7 * gauss()) * 10) / 10 }); });
      var popMean = POP.reduce(function (a, q) { return a + q.v; }, 0) / POP.length;
      var method = "random", nS = 24, sample = [], means = [];
      var sl = L.slider("n", 6, 60, 6, nS, function (v) { nS = v; means = []; sample = []; draw(); });
      var lab = plot(panel, { label: "The population, the sample, and the sample means", readout: ["now", "values", "legend"],
        controls: [L.choice([["random", "Random"], ["systematic", "Systematic"], ["stratified", "Stratified"], ["opportunity", "Opportunity"]], method, function (m) { method = m; means = []; sample = []; draw(); }, "Method"),
          sl.node, L.action("Take a sample", function () { take(); draw(); }, true), L.action("Take 50", function () { for (var i = 0; i < 50; i++) take(); draw(); }), L.action("Clear", function () { sample = []; means = []; draw(); })] });
      lab.legend(STRATA.map(function (s, g) { return ["fill-" + TONE[g], s + " (" + SIZE[g] + ")"]; }).concat([["ring-mute", "not sampled"]]));
      function take() {
        var idx = [], i;
        if (method === "random") { var pool = POP.map(function (_, j) { return j; }); for (i = 0; i < nS; i++) idx.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); }
        else if (method === "systematic") { var k = Math.floor(POP.length / nS), st = Math.floor(Math.random() * k); for (i = 0; i < nS; i++) idx.push(st + i * k); }
        else if (method === "stratified") SIZE.forEach(function (s, g) { var want = Math.round(nS * s / POP.length), pg = []; POP.forEach(function (q, j) { if (q.g === g) pg.push(j); }); for (var w = 0; w < want; w++) idx.push(pg.splice(Math.floor(Math.random() * pg.length), 1)[0]); });
        else for (i = 0; i < nS; i++) idx.push(i);
        sample = idx;
        means.push(idx.reduce(function (a, j) { return a + POP[j].v; }, 0) / idx.length);
      }
      function draw() {
        var inS = {}; sample.forEach(function (i) { inS[i] = true; });
        lab.draw(function (d) {
          var cols = 20, cell = 17, ox = 26, oy = 28;
          d.text(ox, 20, "population · 240", { size: 14, tone: "mute", anchor: "start" });
          POP.forEach(function (q, i) {
            var x = ox + (i % cols) * cell + cell / 2, y = oy + Math.floor(i / cols) * cell + cell / 2;
            if (inS[i]) d.dot(x, y, 6, TONE[q.g]);
            else d.el("circle", { cx: x, cy: y, r: 3.2, class: "k-sv-ring", "data-tone": TONE[q.g], opacity: "0.55" });
          });
          var P = lab.plot(popMean - 8, popMean + 8, 0, 1, { l: 420, t: 40, r: 24, b: 56 });
          var bins = 16, cnt = [], b;
          for (b = 0; b < bins; b++) cnt.push(0);
          means.forEach(function (m) { var bi = Math.floor((m - (popMean - 8)) / 16 * bins); if (bi >= 0 && bi < bins) cnt[bi]++; });
          var mx = Math.max(1, Math.max.apply(null, cnt));
          P.axes("x̄", null, { xstep: 4, noYTicks: true, yn: 4, xfmt: function (v) { return String(Math.round(v)); } });
          cnt.forEach(function (c, j) { if (c) P.bar(popMean - 8 + (j + 0.5) * 1, 0.86, c / mx * 0.92, { tone: "soft" }); });
          P.line(popMean, 0, popMean, 1, { tone: "hot", dash: true });
          P.label(popMean, 1, "μ", { tone: "hot", dy: 14, anchor: "start", size: 14 });
          d.text(420, 26, "sample means · " + means.length, { size: 14, tone: "mute", anchor: "start" });
          return { w: 800, h: 450 };
        });
        var last = means.length ? means[means.length - 1] : null, avg = means.reduce(function (a, m) { return a + m; }, 0) / (means.length || 1);
        var sd = means.length > 1 ? Math.sqrt(means.reduce(function (a, m) { return a + Math.pow(m - avg, 2); }, 0) / means.length) : null;
        var note = { random: "Every member is equally likely: it needs a numbered sampling frame.",
          systematic: "k = 240 ÷ n: a random start in the first k, then every kth. Cheap, but a hidden pattern in the list can bias it.",
          stratified: "Year 12 : Year 13 : Staff = 120 : 90 : 30, sampled in proportion and at random within each, so the sample keeps the population's structure.",
          opportunity: "The first n in the list are all Year 12: quick, but the mean is biased low. It is not random." }[method];
        if (last == null) lab.now([note + " Take a sample."]);
        else lab.answer("Sample mean x̄", num(last, 2), note);
        lab.values([["population mean μ", num(popMean, 2)], last != null ? ["error x̄ − μ", num(last - popMean, 2), Math.abs(last - popMean) > 2 ? "hot" : null] : null,
          sd != null ? ["sd of " + means.length + " means", num(sd, 2)] : null]);
      }
      draw();
    }
  });

  /* =================== SCATTER, PMCC AND REGRESSION =================== */
  KOS.sims.register({
    id: "scatter-regression", title: "Correlation and regression", subject: "maths", ref: "S2.2",
    desc: "Drag the points and watch r and the least-squares line y = a + bx respond. One point dropped far away shows how an outlier drags the line.",
    mount: function (panel) {
      var pts = [[1, 2.2], [2, 2.9], [3, 3.1], [4, 4.6], [5, 4.9], [6, 6.2], [7, 6.4], [8, 7.9], [9, 8.1], [10, 9.6]], res = false, lastP = null;
      var lab = plot(panel, { label: "Scatter diagram with the regression line; drag a point", hint: "drag any point", readout: ["now", "values", "legend"],
        controls: [L.toggle("Residuals", res, function (on) { res = on; draw(); }), L.sep(),
          L.action("Straighten", function () { pts = pts.map(function (q, i) { return [i + 1, 1.2 + 0.8 * (i + 1)]; }); draw(); }),
          L.action("Scatter", function () { pts = pts.map(function (q, i) { return [i + 1, 1 + Math.random() * 9]; }); draw(); }),
          L.action("Curve", function () { pts = pts.map(function (q, i) { return [i + 1, 0.1 * Math.pow(i + 1, 2) + 0.5]; }); draw(); })] });
      lab.legend([["fill-front", "data"], ["line-hot", "y = a + bx"], ["fill-done", "(x̄, ȳ)"]]);
      function stats() {
        var n = pts.length, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
        pts.forEach(function (q) { sx += q[0]; sy += q[1]; sxx += q[0] * q[0]; syy += q[1] * q[1]; sxy += q[0] * q[1]; });
        var Sxx = sxx - sx * sx / n, Syy = syy - sy * sy / n, Sxy = sxy - sx * sy / n, b = Sxy / Sxx;
        return { a: sy / n - b * sx / n, b: b, r: Sxy / Math.sqrt(Sxx * Syy), Sxx: Sxx, Syy: Syy, Sxy: Sxy, xm: sx / n, ym: sy / n };
      }
      function draw() {
        var s = stats();
        lab.draw(function () {
          var P = lastP = lab.plot(0, 11, 0, 11, { square: true });
          P.axes("x", "y");
          P.line(0, s.a, 11, s.a + 11 * s.b, { tone: "hot" });
          pts.forEach(function (q) { if (res) P.line(q[0], q[1], q[0], s.a + s.b * q[0], { tone: "sub", dash: true }); P.dot(q[0], q[1], { tone: "front", r: 7 }); });
          P.dot(s.xm, s.ym, { tone: "done", r: 5 });
        });
        var word = Math.abs(s.r) > 0.8 ? "strong" : Math.abs(s.r) > 0.5 ? "moderate" : Math.abs(s.r) > 0.2 ? "weak" : "little or no";
        lab.answer("PMCC r", num(s.r, 4), word + (s.r > 0.05 ? " positive" : s.r < -0.05 ? " negative" : "") + " correlation. b is the change in y for each unit increase in x; predicting outside 1 ≤ x ≤ 10 is extrapolation.");
        lab.values([["y = a + bx", num(s.a, 3) + " + " + num(s.b, 3) + "x", "hot"], ["(x̄, ȳ)", "(" + num(s.xm, 2) + ", " + num(s.ym, 2) + ")", "done"],
          ["Sxx", num(s.Sxx, 3)], ["Syy", num(s.Syy, 3)], ["Sxy", num(s.Sxy, 3)], ["b = Sxy / Sxx", num(s.b, 4)]]);
      }
      dragOn(lab, function () { return lastP; }, function (x, y, P) {
        var best = -1, bd = 0.6;
        pts.forEach(function (q, i) { var dd = Math.hypot(q[0] - x, q[1] - y); if (dd < bd) { bd = dd; best = i; } });
        return best < 0 ? null : best;
      }, function (i, x, y) { pts[i] = [Math.max(0.2, Math.min(10.8, x)), Math.max(0.2, Math.min(10.8, y))]; draw(); });
      draw();
    }
  });

  /* =================== PROJECTILES =================== */
  KOS.sims.register({
    id: "projectile-lab", title: "Projectiles", subject: "maths", ref: "M7.5",
    desc: "Choose the speed, angle and launch height, then fire or drag time: the path, the velocity components and the readout of range, greatest height and time of flight, with the suvat lines behind them.",
    mount: function (panel) {
      var U = 20, ang = 40, h0 = 0, g = 9.8, t = 0, timer = null;
      var sU = L.slider("U (m/s)", 5, 40, 1, U, function (v) { U = v; reset(); });
      var sA = L.slider("α (°)", 5, 85, 1, ang, function (v) { ang = v; reset(); });
      var sH = L.slider("height (m)", 0, 40, 1, h0, function (v) { h0 = v; reset(); });
      var sT = L.slider("t (s)", 0, 1, 0.01, 0, function (v) { stop(); t = v * params().T; draw(); }, function (v) { return num(v * params().T, 2); });
      var lab = plot(panel, { label: "The projectile's path", readout: ["now", "values", "legend"],
        controls: [sU.node, sA.node, sH.node, L.action("▶ Fire", fire, true), sT.node] });
      lab.legend([["line-ink", "path"], ["line-done", "horizontal velocity"], ["line-hot", "vertical velocity"]]);
      function params() {
        var a = ang * Math.PI / 180, ux = U * Math.cos(a), uy = U * Math.sin(a), T = (uy + Math.sqrt(uy * uy + 2 * g * h0)) / g;
        return { ux: ux, uy: uy, T: T, R: ux * T, H: h0 + uy * uy / (2 * g), tH: uy / g, vy: uy - g * T };
      }
      function stop() { if (timer) cancelAnimationFrame(timer); timer = null; }
      function reset() { stop(); t = 0; sT.set(0); draw(); }
      function fire() {
        stop();
        var start = performance.now(), T = params().T;
        (function step(now) { if (!panel.isConnected) return; t = Math.min(T, (now - start) / 1000 * 1.2); sT.set(t / T); draw(); if (t < T) timer = requestAnimationFrame(step); else timer = null; })(start);
      }
      function draw() {
        var p = params(), tc = Math.min(t, p.T), x = p.ux * tc, y = h0 + p.uy * tc - 0.5 * g * tc * tc, vy = p.uy - g * tc;
        lab.draw(function () {
          var xm = Math.max(10, p.R * 1.08), ym = Math.max(5, p.H * 1.2);
          var P = lab.plot(0, xm, 0, ym, { square: xm / ym < 4 && xm / ym > 0.6 });
          P.axes("x (m)", "y (m)");
          if (h0) P.line(0, 0, 0, h0, { tone: "sub" });
          P.param(function (s) { return p.ux * s; }, function (s) { return h0 + p.uy * s - 0.5 * g * s * s; }, 0, p.T, { dash: true, tone: "sub" });
          P.param(function (s) { return p.ux * s; }, function (s) { return h0 + p.uy * s - 0.5 * g * s * s; }, 0, Math.max(tc, 1e-6));
          var sc = xm / 60;
          P.line(x, y, x + p.ux * sc, y, { tone: "done", arrow: true });
          if (Math.abs(vy) > 0.05) P.line(x, y, x, y + vy * sc, { tone: "hot", arrow: true });
          P.dot(x, y, { tone: "front", r: 7 });
          P.dot(p.ux * p.tH, p.H, { tone: "mute", r: 3 }); P.label(p.ux * p.tH, p.H, "H", { tone: "mute", dy: -10 });
        });
        lab.answer("Range", num(p.R, 2) + " m", "x = uₓT with uₓ = U cos α = " + num(p.ux, 3) + " m/s");
        lab.values([["time of flight T", num(p.T, 3) + " s"], ["greatest height", num(p.H, 2) + " m at t = " + num(p.tH, 2) + " s"],
          ["impact speed", num(Math.hypot(p.ux, p.vy), 2) + " m/s"], ["uᵧ = U sin α", num(p.uy, 3) + " m/s"], ["now: t", num(tc, 2) + " s", "front"], ["vᵧ = uᵧ − gt", num(vy, 2) + " m/s", "hot"]]);
      }
      draw();
    }
  });

  /* =================== VELOCITY–TIME GRAPHS =================== */
  KOS.sims.register({
    id: "vt-graph-builder", title: "Velocity–time graphs", subject: "maths", ref: "M7.2",
    desc: "Build a three-phase journey — accelerate, cruise, decelerate — and read distance as the area under the line and acceleration as its gradient, with the displacement–time curve beneath.",
    mount: function (panel) {
      var V = 20, t1 = 8, t2 = 20, t3 = 12, v0 = 0;
      function s(label, lo, hi, val, set) { return L.slider(label, lo, hi, 1, val, function (v) { set(v); draw(); }).node; }
      var lab = plot(panel, { label: "A velocity–time graph above its displacement–time graph", readout: ["now", "values", "legend"],
        controls: [s("V (m/s)", 2, 40, V, function (v) { V = v; }), s("u (m/s)", 0, 20, v0, function (v) { v0 = v; }),
          s("accelerate (s)", 1, 30, t1, function (v) { t1 = v; }), s("cruise (s)", 0, 60, t2, function (v) { t2 = v; }), s("decelerate (s)", 1, 30, t3, function (v) { t3 = v; })] });
      lab.legend([["area-ink", "area = distance"], ["line-ink", "v–t"], ["line-front", "s–t"]]);
      function draw() {
        var T = t1 + t2 + t3, A1 = (v0 + V) / 2 * t1, A2 = V * t2, A3 = V / 2 * t3, S = A1 + A2 + A3;
        lab.draw(function () {
          var P = lab.plot(0, T * 1.05, 0, Math.max(V, v0) * 1.25, { t: 16, b: 252 });
          P.axes(null, "v (m/s)", { yn: 3, noXTicks: true });
          P.poly([[0, 0], [0, v0], [t1, V], [t1, 0]], { fill: true });
          P.poly([[t1, 0], [t1, V], [t1 + t2, V], [t1 + t2, 0]], { fill: true, tone: "done" });
          P.poly([[t1 + t2, 0], [t1 + t2, V], [T, 0]], { fill: true, tone: "front" });
          P.poly([[0, v0], [t1, V], [t1 + t2, V], [T, 0]], { tone: "ink", cls: "k-sv-curve" });
          P.label(t1 / 2, (v0 + V) / 4, num(A1, 1) + " m", { tone: "ink", dy: 6 });
          if (t2) P.label(t1 + t2 / 2, V / 2, num(A2, 1) + " m", { tone: "done", dy: 6 });
          P.label(t1 + t2 + t3 / 3, V / 4, num(A3, 1) + " m", { tone: "front", dy: 6 });
          var Q = lab.plot(0, T * 1.05, 0, S * 1.15, { t: 230, b: 44 });
          Q.axes("t (s)", "s (m)", { yn: 3 });
          Q.curve(function (t) {
            if (t <= t1) return v0 * t + 0.5 * ((V - v0) / t1) * t * t;
            if (t <= t1 + t2) return A1 + V * (t - t1);
            if (t <= T) { var u = t - t1 - t2; return A1 + A2 + V * u - 0.5 * (V / t3) * u * u; }
            return S;
          }, { tone: "front", to: T });
        });
        lab.answer("Distance", num(S, 1) + " m", "area = ½(" + v0 + " + " + V + ")(" + t1 + ") + " + V + "(" + t2 + ") + ½(" + V + ")(" + t3 + ")");
        lab.values([["acceleration", "(" + V + " − " + v0 + ") ÷ " + t1 + " = " + num((V - v0) / t1, 3) + " m/s²", "ink"], ["deceleration", V + " ÷ " + t3 + " = " + num(V / t3, 3) + " m/s²", "front"],
          ["total time", T + " s"], ["average speed", num(S / T, 2) + " m/s"]]);
      }
      draw();
    }
  });

  /* =================== VECTORS =================== */
  KOS.sims.register({
    id: "vector-playground", title: "Vectors", subject: "maths", ref: "10.3",
    desc: "Drag the heads of a and b: the parallelogram shows a + b, the dashed vector a − b, and λ scales a. Magnitudes, bearings and the i, j forms update as you drag.",
    mount: function (panel) {
      var a = [4, 2], b = [-1, 3], lam = 1.5, lastP = null;
      var sl = L.slider("λ", -3, 3, 0.1, lam, function (v) { lam = v; draw(); }, function (v) { return num(v, 1); });
      var lab = plot(panel, { label: "Vectors a and b on a grid; drag their heads", hint: "drag the heads of a and b", readout: ["now", "values", "legend"], controls: [sl.node] });
      lab.legend([["line-ink", "a"], ["line-front", "b"], ["line-done", "a + b"], ["line-hot", "a − b"]]);
      function bearing(v) { var d = Math.atan2(v[0], v[1]) * 180 / Math.PI; if (d < 0) d += 360; return num(d, 1) + "°"; }
      function col(v) { return num(v[0], 2) + "i " + (v[1] < 0 ? "− " : "+ ") + num(Math.abs(v[1]), 2) + "j"; }
      function draw() {
        var sum = [a[0] + b[0], a[1] + b[1]], diff = [a[0] - b[0], a[1] - b[1]], la = [lam * a[0], lam * a[1]];
        lab.draw(function () {
          var P = lastP = lab.plot(-8, 8, -8, 8, { square: true });
          P.axes("i", "j", { xstep: 2, ystep: 2 });
          P.line(a[0], a[1], sum[0], sum[1], { tone: "line", dash: true }); P.line(b[0], b[1], sum[0], sum[1], { tone: "line", dash: true });
          P.line(0, 0, la[0], la[1], { tone: "faint", arrow: true });
          P.line(0, 0, sum[0], sum[1], { tone: "done", arrow: true });
          P.line(0, 0, a[0], a[1], { tone: "ink", arrow: true });
          P.line(0, 0, b[0], b[1], { tone: "front", arrow: true });
          P.line(b[0], b[1], a[0], a[1], { tone: "hot", dash: true, arrow: true });
          P.label(a[0], a[1], "a", { tone: "ink", weight: "bold", dx: 12 }); P.label(b[0], b[1], "b", { tone: "front", weight: "bold", dx: -12 });
          P.label(sum[0], sum[1], "a + b", { tone: "done" }); P.label(la[0], la[1], "λa", { tone: "sub", dy: 18 });
          P.dot(a[0], a[1], { tone: "ink", r: 6 }); P.dot(b[0], b[1], { tone: "front", r: 6 });
        });
        lab.answer("|a + b|", num(Math.hypot(sum[0], sum[1]), 3), "≤ |a| + |b| = " + num(Math.hypot(a[0], a[1]) + Math.hypot(b[0], b[1]), 3) + ": the triangle inequality.");
        lab.values([["a", col(a), "ink"], ["|a| · bearing", num(Math.hypot(a[0], a[1]), 3) + " · " + bearing(a)], ["b", col(b), "front"], ["|b|", num(Math.hypot(b[0], b[1]), 3)],
          ["a + b", col(sum), "done"], ["a − b", col(diff), "hot"], ["λa", col(la)]]);
      }
      dragOn(lab, function () { return lastP; }, function (x, y) {
        return Math.hypot(a[0] - x, a[1] - y) < 0.9 ? a : Math.hypot(b[0] - x, b[1] - y) < 0.9 ? b : null;
      }, function (v, x, y) { v[0] = Math.round(Math.max(-7.5, Math.min(7.5, x)) * 2) / 2; v[1] = Math.round(Math.max(-7.5, Math.min(7.5, y)) * 2) / 2; draw(); });
      draw();
    }
  });

  /* =================== ROUGH INCLINED PLANE =================== */
  KOS.sims.register({
    id: "incline-forces", title: "Rough inclined plane", subject: "maths", ref: "M8.6",
    desc: "Tilt the plane, set μ, the mass and a force up the slope: the weight resolves into mg sin θ and mg cos θ, the friction needed is compared with μR, and you see whether the block stays put or slides — and which way friction points.",
    mount: function (panel) {
      var th = 25, mu = 0.3, m = 5, Pf = 0, g = 9.8;
      function s(label, lo, hi, step, val, set, show) { return L.slider(label, lo, hi, step, val, function (v) { set(v); draw(); }, show).node; }
      var lab = plot(panel, { label: "A block on a rough slope with its forces", readout: ["now", "values", "legend"],
        controls: [s("θ (°)", 0, 60, 1, th, function (v) { th = v; }), s("μ", 0, 1, 0.01, mu, function (v) { mu = v; }, function (v) { return num(v, 2); }),
          s("mass (kg)", 1, 20, 1, m, function (v) { m = v; }), s("P up slope (N)", 0, 150, 1, Pf, function (v) { Pf = v; })] });
      lab.legend([["line-hot", "weight mg"], ["line-ink", "reaction R"], ["line-done", "P"], ["line-front", "friction F"]]);
      function draw() {
        var t = th * Math.PI / 180, W = m * g, R = W * Math.cos(t), down = W * Math.sin(t), net = Pf - down, Fmax = mu * R, F, state, acc = 0, fdir;
        if (Math.abs(net) <= Fmax + 1e-9) { F = -net; state = Math.abs(Math.abs(net) - Fmax) < 1e-6 && Fmax > 0 ? "Limiting equilibrium" : "At rest"; fdir = net > 0 ? "down the slope" : net < 0 ? "up the slope" : "none needed"; }
        else { F = net > 0 ? -Fmax : Fmax; acc = (net + F) / m; state = "Slides " + (net > 0 ? "up" : "down"); fdir = net > 0 ? "down the slope" : "up the slope"; }
        lab.draw(function (d) {
          var bx = 90, by = 400, Lr = 560, tx = bx + Lr * Math.cos(t), ty = by - Lr * Math.sin(t);
          if (ty < 40) { var k = (by - 40) / (by - ty); tx = bx + (tx - bx) * k; ty = 40; }
          d.path("M" + bx + " " + by + " L" + tx.toFixed(1) + " " + by + " L" + tx.toFixed(1) + " " + ty.toFixed(1) + " Z", { fill: true, tone: "sub" });
          d.line(bx, by, tx, ty, { cls: "k-sv-axis" });
          var ar = 54;
          d.path("M" + (bx + ar) + " " + by + " A" + ar + " " + ar + " 0 0 0 " + (bx + ar * Math.cos(t)).toFixed(1) + " " + (by - ar * Math.sin(t)).toFixed(1), { tone: "sub" });
          d.text(bx + ar + 12, by - 10, th + "°", { size: 14, tone: "sub", anchor: "start" });
          var mx = (bx + tx) / 2, my = (by + ty) / 2, ux = Math.cos(t), uy = -Math.sin(t), nx = -Math.sin(t), ny = -Math.cos(t);
          var g2 = d.group({ transform: "translate(" + mx.toFixed(1) + " " + my.toFixed(1) + ") rotate(" + (-th) + ")" });
          d.rect(-40, -52, 80, 52, { rx: 8, tone: "front-wash" }, g2);
          var cx = mx + nx * 26, cy = my + ny * 26, fs = 140 / Math.max(W, R, Pf, Math.abs(F), 1);
          function vec(dx, dy, len, tone, label) {
            var k2 = Math.max(30, len * fs); if (len < 0.05) return;
            d.line(cx, cy, cx + dx * k2, cy + dy * k2, { tone: tone, arrow: true });
            d.text(cx + dx * (k2 + 26), cy + dy * (k2 + 26) + 5, label, { size: 14, tone: tone, weight: "bold" });
          }
          vec(0, 1, W, "hot", "mg " + num(W, 1));
          vec(nx, ny, R, "ink", "R " + num(R, 1));
          if (Pf > 0) vec(ux, uy, Pf, "done", "P " + Pf);
          if (Math.abs(F) > 0.05) vec(F > 0 ? ux : -ux, F > 0 ? uy : -uy, Math.abs(F), "front", "F " + num(Math.abs(F), 1));
          return { w: 800, h: 450 };
        });
        lab.answer(state, acc ? "a = " + num(Math.abs(acc), 3) + " m/s²" : "F = " + num(Math.abs(F), 2) + " N", "Friction " + num(Math.abs(F), 2) + " N acts " + fdir + ". On the point of sliding with P = 0, μ = tan θ = " + num(Math.tan(t), 3) + ".");
        lab.values([["R = mg cos θ", num(R, 2) + " N", "ink"], ["μR", num(Fmax, 2) + " N"], ["mg sin θ", num(down, 2) + " N down", "hot"],
          ["friction needed", num(Math.abs(net), 2) + " N " + (Math.abs(net) <= Fmax ? "≤ μR" : "> μR"), Math.abs(net) <= Fmax ? "done" : "hot"]]);
      }
      draw();
    }
  });

  /* =================== MOMENTS: BEAM ON TWO SUPPORTS =================== */
  KOS.sims.register({
    id: "moments-beam", title: "Moments and tilting", subject: "maths", ref: "M9.1",
    desc: "A beam rests on two supports with a load you can slide along it. Take moments about each support for the reactions; when one reaches zero the beam is on the point of tilting.",
    mount: function (panel) {
      var Lb = 6, Wb = 30, cm = 3, sA = 1, sB = 4, load = 40, lx = 2.5, g = 9.8;
      function s(label, lo, hi, step, val, set) { return L.slider(label, lo, hi, step, val, function (v) { set(v); draw(); }, step < 1 ? function (v) { return num(v, 1); } : null).node; }
      var lab = plot(panel, { label: "A beam on two supports with its forces", readout: ["now", "values", "tip", "legend"],
        controls: [s("beam (kg)", 5, 80, 5, Wb, function (v) { Wb = v; }), s("G from A (m)", 0.5, 5.5, 0.1, cm, function (v) { cm = v; }),
          s("C at (m)", 0, 5, 0.1, sA, function (v) { sA = v; }), s("D at (m)", 1, 6, 0.1, sB, function (v) { sB = v; }),
          s("load (kg)", 0, 100, 5, load, function (v) { load = v; }), s("load at (m)", 0, 6, 0.1, lx, function (v) { lx = v; })] });
      lab.legend([["line-ink", "reactions"], ["line-hot", "beam's weight"], ["line-front", "load"]]);
      function draw() {
        var c = Math.min(sA, sB), dd = Math.max(sA, sB); if (dd - c < 0.2) dd = c + 0.2;
        var W = Wb * g, Lw = load * g, RD = (W * (cm - c) + Lw * (lx - c)) / (dd - c), RC = W + Lw - RD;
        var tip = RC < -1e-6 ? "Tilts about D" : RD < -1e-6 ? "Tilts about C" : Math.min(RC, RD) < 1 ? "On the point of tilting" : "In equilibrium";
        lab.draw(function (d) {
          var x0 = 80, x1 = 720, y = 250, sc = (x1 - x0) / Lb;
          function X(v) { return x0 + v * sc; }
          d.rect(X(0), y - 10, X(Lb) - X(0), 20, { rx: 4, tone: "soft" });
          d.text(X(0), y + 40, "A", { size: 15, tone: "sub", weight: "bold" }); d.text(X(Lb), y + 40, "B", { size: 15, tone: "sub", weight: "bold" });
          [[c, RC, "C"], [dd, RD, "D"]].forEach(function (q) {
            d.path("M" + X(q[0]) + " " + (y + 10) + " l-14 28 h28 z", { fill: true, tone: q[1] < -1e-6 ? "hot" : "ink" });
            d.text(X(q[0]), y + 60, q[2], { size: 15, weight: "bold" });
            if (q[1] > 0.05) {
              var k = Math.min(150, 26 + q[1] / 8);
              d.line(X(q[0]), y - 11, X(q[0]), y - 11 - k, { tone: "ink", arrow: true });
              d.text(X(q[0]), y - 22 - k, "R" + q[2] + " " + num(q[1], 1), { size: 14, tone: "ink", weight: "bold" });
            }
          });
          /* a weight: an arrow from above, ending on the beam */
          function down(xv, F, tone, label) {
            var k = Math.min(150, 26 + F / 8);
            d.line(X(xv), y - 11 - k, X(xv), y - 12, { tone: tone, arrow: true });
            d.text(X(xv), y - 20 - k, label, { size: 14, tone: tone, weight: "bold" });
          }
          down(cm, W, "hot", "W " + num(W, 1));
          if (load > 0) down(lx, Lw, "front", "load " + num(Lw, 1));
          return { w: 800, h: 450 };
        });
        lab.answer(tip, "R_C " + num(Math.max(0, RC), 1) + " · R_D " + num(Math.max(0, RD), 1), "M(C): R_D × " + num(dd - c, 1) + " = " + num(W, 1) + " × " + num(cm - c, 1) + " + " + num(Lw, 1) + " × " + num(lx - c, 1));
        lab.values([["R_D", num(RD, 1) + " N", RD < -1e-6 ? "hot" : "ink"], ["R_C = W + load − R_D", num(RC, 1) + " N", RC < -1e-6 ? "hot" : "ink"], ["resolve ↑", num(W + Lw, 1) + " N"]]);
        lab.section("tip", "Tipping", ["On the point of tilting about one support, the other reaction is zero: set it to 0 and take moments about the near support."]);
      }
      draw();
    }
  });
})();
