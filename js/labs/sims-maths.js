/* Kurenai OS — labs/sims-maths.js
   Maths simulations (Edexcel 9MA0), registered on KOS.sims so each one mounts
   INLINE on its topic's Simulations tab and appears in the Simulations view:
     trapezium-rule (9.4)  cobweb-iteration (9.2)  newton-raphson-viz (9.3)
     tangent-gradient (7.1) sector-explorer (5.1)  sequence-explorer (4.4)
     normal-curve (S4.2)   binomial-test-viz (S5.2) sampling-lab (S1.1)
     scatter-regression (S2.2) projectile-lab (S7.5) vt-graph-builder (S7.2)
     vector-playground (10.3) incline-forces (S8.6) moments-beam (S9.1)
   Loaded after sims.js (KOS.sims.canvas / KOS.sims.COL) and worked.js. */
(function () {
  "use strict";
  var el = KOS.ui.el, COL = KOS.sims.COL, canvas = KOS.sims.canvas;
  function A(c, a) { return KOS.labPalette().alpha(c, a); }

  /* ---------- shared toolkit ---------- */
  function slider(label, min, max, step, val, onchange, show) {
    var inp = el("input", { type: "range", min: min, max: max, step: step, value: val, "aria-label": label });
    var out = el("b", { text: (show || String)(val) });
    inp.oninput = function () { var v = parseFloat(inp.value); out.textContent = (show || String)(v); onchange(v); };
    return { node: el("label", { class: "sim-slider" }, [el("span", {}, [label + " ", out]), inp]), input: inp,
      set: function (v) { inp.value = v; out.textContent = (show || String)(v); } };
  }
  function readout() { return el("div", { class: "sim-read" }); }
  function num(x, dp) { if (!isFinite(x)) return "—"; var r = Math.round(x * 1e9) / 1e9; return Number.isInteger(r) ? String(r) : r.toFixed(dp === undefined ? 3 : dp); }
  function sf(x, s) { if (!isFinite(x)) return "—"; if (x === 0) return "0"; return Number(x.toPrecision(s || 3)).toString(); }

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
  /* axis mapper for a canvas: world (x0..x1, y0..y1) -> pixels with padding */
  function plotter(cv, x0, x1, y0, y1) {
    var padL = 44, padR = 14, padT = 14, padB = 30;
    var W = cv.W - padL - padR, H = cv.H - padT - padB;
    var P = {
      X: function (x) { return padL + (x - x0) / (x1 - x0) * W; },
      Y: function (y) { return padT + (y1 - y) / (y1 - y0) * H; },
      invX: function (px) { return x0 + (px - padL) / W * (x1 - x0); },
      x0: x0, x1: x1, y0: y0, y1: y1,
      axes: function (xl, yl) {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        /* grid */
        var sx = nice((x1 - x0) / 8), sy = nice((y1 - y0) / 6);
        ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.font = "10.5px 'IBM Plex Mono', monospace";
        ctx.fillStyle = COL.mute; ctx.textAlign = "center"; ctx.textBaseline = "top";
        for (var gx = Math.ceil(x0 / sx) * sx; gx <= x1 + 1e-9; gx += sx) {
          ctx.beginPath(); ctx.moveTo(P.X(gx), padT); ctx.lineTo(P.X(gx), padT + H); ctx.stroke();
          ctx.fillText(num(gx, 2), P.X(gx), padT + H + 4);
        }
        ctx.textAlign = "right"; ctx.textBaseline = "middle";
        for (var gy = Math.ceil(y0 / sy) * sy; gy <= y1 + 1e-9; gy += sy) {
          ctx.beginPath(); ctx.moveTo(padL, P.Y(gy)); ctx.lineTo(padL + W, P.Y(gy)); ctx.stroke();
          ctx.fillText(num(gy, 2), padL - 5, P.Y(gy));
        }
        /* axes through the origin if visible */
        ctx.strokeStyle = COL.line; ctx.lineWidth = 1.2;
        if (y0 <= 0 && y1 >= 0) { ctx.beginPath(); ctx.moveTo(padL, P.Y(0)); ctx.lineTo(padL + W, P.Y(0)); ctx.stroke(); }
        if (x0 <= 0 && x1 >= 0) { ctx.beginPath(); ctx.moveTo(P.X(0), padT); ctx.lineTo(P.X(0), padT + H); ctx.stroke(); }
        if (xl) { ctx.fillStyle = COL.faint; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(xl, padL + W, padT + H - 3); }
        if (yl) { ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(yl, padL + 4, padT + 2); }
      },
      curve: function (f, colour, width) {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.strokeStyle = colour || COL.text; ctx.lineWidth = width || 2; ctx.beginPath();
        var pen = false;
        for (var i = 0; i <= W; i++) {
          var x = x0 + i / W * (x1 - x0), y = f(x);
          if (!isFinite(y) || Math.abs(y) > 1e6) { pen = false; continue; }
          var px = P.X(x), py = P.Y(Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y)));
          if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      },
      dot: function (x, y, colour, r) {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.fillStyle = colour || COL.gold; ctx.beginPath(); ctx.arc(P.X(x), P.Y(y), r || 5, 0, 7); ctx.fill();
      },
      line: function (xa, ya, xb, yb, colour, width, dash) {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.strokeStyle = colour || COL.text; ctx.lineWidth = width || 1.5; ctx.setLineDash(dash || []);
        ctx.beginPath(); ctx.moveTo(P.X(xa), P.Y(ya)); ctx.lineTo(P.X(xb), P.Y(yb)); ctx.stroke(); ctx.setLineDash([]);
      },
      label: function (x, y, txt, colour, align) {
        var ctx = cv.ctx; if (!ctx || !ctx.fillText) return;
        ctx.fillStyle = colour || COL.text; ctx.font = "600 11.5px 'IBM Plex Mono', monospace";
        ctx.textAlign = align || "left"; ctx.textBaseline = "bottom"; ctx.fillText(txt, P.X(x) + 4, P.Y(y) - 4);
      }
    };
    return P;
  }
  function nice(v) { var p = Math.pow(10, Math.floor(Math.log10(v))); var m = v / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
  function autoRange(f, a, b) {
    var lo = Infinity, hi = -Infinity;
    for (var i = 0; i <= 200; i++) { var y = f(a + (b - a) * i / 200); if (isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
    if (!isFinite(lo)) { lo = -1; hi = 1; }
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    var m = (hi - lo) * 0.15; return [Math.min(0, lo - m), Math.max(0, hi + m)];
  }
  function fnInput(def, onEnter) {
    var inp = el("input", { type: "text", value: def, style: "width:220px;font-family:var(--mono)", "aria-label": "function of x" });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); onEnter(); } });
    return inp;
  }
  function table(head, rows) {
    return el("div", { class: "sim-tablewrap", html:
      '<table class="n-table sim-table"><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table>" });
  }
  /* normal distribution helpers */
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)); var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x < 0 ? -y : y; }
  function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function PhiInv(p) { var lo = -8, hi = 8; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  function nCr(n, r) { if (r < 0 || r > n) return 0; var x = 1; for (var i = 0; i < r; i++) x = x * (n - i) / (i + 1); return x; }
  function binPmf(n, p, k) { return nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k); }

  /* =================== TRAPEZIUM RULE =================== */
  KOS.sims.register({
    id: "trapezium-rule", title: "Trapezium Rule Explorer", subject: "maths", ref: "9.4",
    desc: "Type a function, set the limits and the number of strips, and watch the trapezia hug the curve. The table of ordinates is laid out the way the mark scheme expects, with the error against the true area and whether the estimate is an over- or under-estimate.",
    mount: function (panel) {
      var fIn = fnInput("sqrt(1 + x^3)", redraw);
      var aIn = el("input", { type: "number", value: 0, step: "0.5", style: "width:70px" });
      var bIn = el("input", { type: "number", value: 2, step: "0.5", style: "width:70px" });
      var n = 4;
      var sl = slider("strips n", 1, 20, 1, n, function (v) { n = v; redraw(); });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["f(x)", fIn]), el("label", {}, ["a", aIn]), el("label", {}, ["b", bIn]), sl.node,
        el("button", { class: "btn primary", text: "Plot", onclick: redraw }), msg
      ]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 340);
      var read = readout(); panel.appendChild(read);
      var tbl = el("div", {}); panel.appendChild(tbl);
      aIn.onchange = bIn.onchange = redraw;

      function redraw() {
        msg.textContent = "";
        var f = mkFn(fIn.value); if (!f) { msg.textContent = "Could not read that function — use x, + − × ÷ ^ and sin/cos/exp/ln/sqrt."; return; }
        var a = parseFloat(aIn.value), b = parseFloat(bIn.value);
        if (!(b > a)) { msg.textContent = "Need b > a."; return; }
        var h = (b - a) / n, xs = [], ys = [];
        for (var i = 0; i <= n; i++) { xs.push(a + i * h); ys.push(f(a + i * h)); }
        var inner = 0; for (i = 1; i < n; i++) inner += ys[i];
        var T = h / 2 * (ys[0] + ys[n] + 2 * inner);
        /* "exact" via composite Simpson with 2000 strips */
        var m = 2000, hh = (b - a) / m, S = f(a) + f(b);
        for (i = 1; i < m; i++) S += (i % 2 ? 4 : 2) * f(a + i * hh);
        S *= hh / 3;
        var yr = autoRange(f, a - (b - a) * 0.1, b + (b - a) * 0.1);
        var P = plotter(cv, a - (b - a) * 0.15, b + (b - a) * 0.15, yr[0], yr[1]);
        P.axes("x", "y");
        var ctx = cv.ctx;
        if (ctx && ctx.beginPath) {
          for (i = 0; i < n; i++) {
            ctx.fillStyle = A(COL.jade, .22); ctx.strokeStyle = COL.jade; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(P.X(xs[i]), P.Y(0)); ctx.lineTo(P.X(xs[i]), P.Y(ys[i]));
            ctx.lineTo(P.X(xs[i + 1]), P.Y(ys[i + 1])); ctx.lineTo(P.X(xs[i + 1]), P.Y(0)); ctx.closePath(); ctx.fill(); ctx.stroke();
          }
        }
        P.curve(f, COL.text, 2.2);
        xs.forEach(function (x, i) { P.dot(x, ys[i], COL.gold, 4); });
        /* concavity across the interval decides over/under */
        var conc = 0; for (i = 1; i < 200; i++) { var x = a + (b - a) * i / 200, d2 = f(x + 1e-3) - 2 * f(x) + f(x - 1e-3); conc += d2 > 0 ? 1 : d2 < 0 ? -1 : 0; }
        var verdict = Math.abs(conc) > 150 ? (conc > 0 ? "over-estimate — the curve is convex (bends upward) so every chord lies above it" : "under-estimate — the curve is concave so every chord lies below it") : "mixed — the curve changes concavity on the interval, so compare with the true value";
        read.innerHTML = "<b>h = (b − a)/n = " + num(h, 4) + "</b><br>" +
          "T = h/2 [y₀ + yₙ + 2(y₁ + … + yₙ₋₁)] = " + num(h / 2, 4) + " × [" + num(ys[0], 4) + " + " + num(ys[n], 4) + " + 2(" + num(inner, 4) + ")] = <b>" + num(T, 4) + "</b><br>" +
          "true value ≈ " + num(S, 4) + " · error " + num(T - S, 4) + " (" + (Math.abs(S) > 1e-9 ? num(100 * (T - S) / S, 2) + "%" : "—") + ")<br>" +
          "<span style='color:var(--muted)'>" + verdict + ". Doubling n roughly quarters the error.</span>";
        tbl.innerHTML = "";
        tbl.appendChild(table(["i"].concat(xs.map(function (_, i) { return String(i); })),
          [["x"].concat(xs.map(function (x) { return num(x, 3); })), ["y"].concat(ys.map(function (y) { return num(y, 4); }))]));
      }
      redraw();
    }
  });

  /* =================== COBWEB / STAIRCASE =================== */
  KOS.sims.register({
    id: "cobweb-iteration", title: "Iteration x = g(x) — cobweb & staircase", subject: "maths", ref: "9.2",
    desc: "Iterate xₙ₊₁ = g(xₙ) from your starting value and watch the path bounce between y = g(x) and y = x. A staircase means g′ is positive at the root, a cobweb means negative; it diverges when |g′(α)| > 1.",
    mount: function (panel) {
      var gIn = fnInput("sqrt(3x + 2)", redraw);
      var x0In = el("input", { type: "number", value: 0.5, step: "0.1", style: "width:80px" });
      var steps = 8;
      var sl = slider("iterations", 1, 25, 1, steps, function (v) { steps = v; redraw(); });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["g(x)", gIn]), el("label", {}, ["x₀", x0In]), sl.node,
        el("button", { class: "btn primary", text: "Iterate", onclick: redraw }), msg
      ]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 360);
      var read = readout(); panel.appendChild(read);
      var tbl = el("div", {}); panel.appendChild(tbl);
      x0In.onchange = redraw;
      function redraw() {
        msg.textContent = "";
        var g = mkFn(gIn.value); if (!g) { msg.textContent = "Could not read g(x)."; return; }
        var x = parseFloat(x0In.value), seq = [x], ok = true;
        for (var i = 0; i < steps; i++) { x = g(x); if (!isFinite(x) || Math.abs(x) > 1e6) { ok = false; break; } seq.push(x); }
        var lo = Math.min.apply(null, seq), hi = Math.max.apply(null, seq), span = Math.max(hi - lo, 1), m = span * 0.6;
        var x0 = lo - m, x1 = hi + m;
        var P = plotter(cv, x0, x1, x0, x1);
        P.axes("x", "y");
        P.curve(function (t) { return t; }, COL.mute, 1.2);
        P.curve(g, COL.text, 2.2);
        var pen = [seq[0], 0];
        for (i = 0; i < seq.length - 1; i++) {
          P.line(pen[0], pen[1], seq[i], seq[i + 1], COL.crim, 1.4);       /* up/down to the curve */
          P.line(seq[i], seq[i + 1], seq[i + 1], seq[i + 1], COL.crim, 1.4, [4, 3]); /* across to y = x */
          pen = [seq[i + 1], seq[i + 1]];
        }
        P.dot(seq[0], 0, COL.gold, 5);
        var last = seq[seq.length - 1];
        var gp = (g(last + 1e-4) - g(last - 1e-4)) / 2e-4;
        var kind = gp >= 0 ? "staircase (g′ > 0)" : "cobweb (g′ < 0)";
        read.innerHTML = (ok ? "<b>x" + sub(seq.length - 1) + " = " + num(last, 5) + "</b>" : "<b style='color:var(--danger)'>diverged</b>") +
          " · pattern: " + kind + " · |g′(x)| ≈ " + num(Math.abs(gp), 3) +
          (Math.abs(gp) < 1 ? " <span style='color:var(--good)'>&lt; 1 → converges</span>" : " <span style='color:var(--danger)'>&gt; 1 → diverges from this root</span>") +
          "<br><span style='color:var(--muted)'>Exam habit: write each xₙ to more figures than the answer needs, then confirm the root with a change of sign in f(x) = g(x) − x.</span>";
        tbl.innerHTML = "";
        tbl.appendChild(table(["n", "xₙ", "g(xₙ)"], seq.map(function (v, i) { return [String(i), num(v, 5), i < seq.length - 1 ? num(seq[i + 1], 5) : "—"]; })));
      }
      function sub(n) { return String(n).replace(/\d/g, function (d) { return "₀₁₂₃₄₅₆₇₈₉"[d]; }); }
      redraw();
    }
  });

  /* =================== NEWTON–RAPHSON =================== */
  KOS.sims.register({
    id: "newton-raphson-viz", title: "Newton–Raphson — tangent chasing", subject: "maths", ref: "9.3",
    desc: "Each step slides down the tangent at xₙ to where it crosses the axis. See why a start near a turning point fires the next estimate off into the distance, and how fast it converges when it works.",
    mount: function (panel) {
      var fIn = fnInput("x^3 - 2x - 5", redraw);
      var x0In = el("input", { type: "number", value: 3, step: "0.1", style: "width:80px" });
      var steps = 4;
      var sl = slider("steps", 1, 10, 1, steps, function (v) { steps = v; redraw(); });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["f(x)", fIn]), el("label", {}, ["x₀", x0In]), sl.node,
        el("button", { class: "btn primary", text: "Run", onclick: redraw }), msg
      ]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 360);
      var read = readout(); panel.appendChild(read);
      var tbl = el("div", {}); panel.appendChild(tbl);
      x0In.onchange = redraw;
      function redraw() {
        msg.textContent = "";
        var f = mkFn(fIn.value); if (!f) { msg.textContent = "Could not read f(x)."; return; }
        var d = function (x) { return (f(x + 1e-5) - f(x - 1e-5)) / 2e-5; };
        var x = parseFloat(x0In.value), rows = [], seq = [x], blew = false;
        for (var i = 0; i < steps; i++) {
          var fx = f(x), fp = d(x);
          if (Math.abs(fp) < 1e-9) { blew = true; rows.push([String(i), num(x, 6), num(fx, 6), "≈ 0", "tangent is horizontal — method fails"]); break; }
          var nx = x - fx / fp;
          rows.push([String(i), num(x, 6), num(fx, 6), num(fp, 6), num(nx, 6)]);
          if (!isFinite(nx) || Math.abs(nx) > 1e6) { blew = true; break; }
          seq.push(nx); x = nx;
        }
        var lo = Math.min.apply(null, seq), hi = Math.max.apply(null, seq), span = Math.max(hi - lo, 1);
        var xa = lo - span * 0.5, xb = hi + span * 0.5;
        var yr = autoRange(f, xa, xb);
        var P = plotter(cv, xa, xb, yr[0], yr[1]);
        P.axes("x", "y");
        P.curve(f, COL.text, 2.2);
        for (i = 0; i < seq.length - 1; i++) {
          P.line(seq[i], 0, seq[i], f(seq[i]), COL.mute, 1, [3, 3]);
          P.line(seq[i], f(seq[i]), seq[i + 1], 0, COL.crim, 1.5);
          P.dot(seq[i], f(seq[i]), COL.gold, 4);
          P.label(seq[i], 0, "x" + i, COL.mute);
        }
        P.dot(seq[seq.length - 1], 0, COL.jade, 5);
        read.innerHTML = "<b>xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)</b> → " + (blew ? "<span style='color:var(--danger)'>the iteration broke down</span>" : "x" + (seq.length - 1) + " = <b>" + num(seq[seq.length - 1], 6) + "</b>") +
          "<br><span style='color:var(--muted)'>Quote the formula, show one substitution line, then list the iterates. Fails when f′(x₀) ≈ 0 (near a stationary point) or when the tangent lands in another root's basin.</span>";
        tbl.innerHTML = ""; tbl.appendChild(table(["n", "xₙ", "f(xₙ)", "f′(xₙ)", "xₙ₊₁"], rows));
      }
      redraw();
    }
  });

  /* =================== TANGENT / FIRST PRINCIPLES =================== */
  KOS.sims.register({
    id: "tangent-gradient", title: "Gradient of a curve — chord to tangent", subject: "maths", ref: "7.1",
    desc: "Slide the second point along the curve towards the first and watch the chord's gradient settle on the tangent's. This is differentiation from first principles made visible: as h → 0, [f(x+h) − f(x)]/h → f′(x).",
    mount: function (panel) {
      var fIn = fnInput("x^2 - 2x", redraw);
      var x0 = 1.5, h = 1.5;
      var s1 = slider("x", -4, 4, 0.1, x0, function (v) { x0 = v; redraw(); }, function (v) { return num(v, 1); });
      var s2 = slider("h", 0.01, 3, 0.01, h, function (v) { h = v; redraw(); }, function (v) { return num(v, 2); });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["f(x)", fIn]), s1.node, s2.node, el("button", { class: "btn primary", text: "Plot", onclick: redraw }), msg
      ]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 340);
      var read = readout(); panel.appendChild(read);
      function redraw() {
        msg.textContent = "";
        var f = mkFn(fIn.value); if (!f) { msg.textContent = "Could not read f(x)."; return; }
        var yr = autoRange(f, -5, 5);
        var P = plotter(cv, -5, 5, yr[0], yr[1]);
        P.axes("x", "y");
        P.curve(f, COL.text, 2.2);
        var y0 = f(x0), y1 = f(x0 + h);
        var chord = (y1 - y0) / h, tang = (f(x0 + 1e-5) - f(x0 - 1e-5)) / 2e-5;
        /* tangent line across the view */
        P.line(P.x0, y0 + tang * (P.x0 - x0), P.x1, y0 + tang * (P.x1 - x0), COL.jade, 1.4, [5, 4]);
        /* chord extended */
        P.line(P.x0, y0 + chord * (P.x0 - x0), P.x1, y0 + chord * (P.x1 - x0), COL.crim, 1.6);
        /* rise/run triangle */
        P.line(x0, y0, x0 + h, y0, COL.mute, 1, [2, 3]); P.line(x0 + h, y0, x0 + h, y1, COL.mute, 1, [2, 3]);
        P.dot(x0, y0, COL.gold, 6); P.dot(x0 + h, y1, COL.crim, 5);
        read.innerHTML = "chord gradient = [f(" + num(x0, 2) + " + " + num(h, 2) + ") − f(" + num(x0, 2) + ")] / " + num(h, 2) + " = (" + num(y1, 4) + " − " + num(y0, 4) + ") / " + num(h, 2) + " = <b style='color:var(--danger)'>" + num(chord, 4) + "</b>" +
          "<br>tangent gradient f′(" + num(x0, 2) + ") = <b style='color:var(--good)'>" + num(tang, 4) + "</b> · gap " + num(Math.abs(chord - tang), 4) +
          "<br><span style='color:var(--muted)'>First principles: f′(x) = lim<sub>h→0</sub> [f(x + h) − f(x)] / h. For f(x) = x², the bracket expands to (2xh + h²)/h = 2x + h → 2x.</span>";
      }
      redraw();
    }
  });

  /* =================== SECTOR EXPLORER =================== */
  KOS.sims.register({
    id: "sector-explorer", title: "Radians — arc, sector & segment", subject: "maths", ref: "5.1",
    desc: "Drag the angle in radians and watch the arc length rθ, sector area ½r²θ and the segment cut off by the chord update. Degrees are shown alongside so the conversion becomes automatic.",
    mount: function (panel) {
      var r = 5, th = 1.2;
      var s1 = slider("r", 1, 10, 0.5, r, function (v) { r = v; redraw(); });
      var s2 = slider("θ (rad)", 0.1, 6.2, 0.05, th, function (v) { th = v; redraw(); }, function (v) { return num(v, 2); });
      panel.appendChild(el("div", { class: "lab-controls" }, [s1.node, s2.node,
        el("button", { class: "btn", text: "θ = π/3", onclick: function () { th = Math.PI / 3; s2.set(num(th, 2)); redraw(); } }),
        el("button", { class: "btn", text: "θ = π/2", onclick: function () { th = Math.PI / 2; s2.set(num(th, 2)); redraw(); } }),
        el("button", { class: "btn", text: "θ = π", onclick: function () { th = Math.PI; s2.set(num(th, 2)); redraw(); } })
      ]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 320);
      var read = readout(); panel.appendChild(read);
      function redraw() {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var cx = cv.W / 2, cy = cv.H / 2 + 10, R = Math.min(cv.W, cv.H) / 2 - 40;
        ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
        /* sector */
        ctx.fillStyle = A(COL.jade, .25); ctx.strokeStyle = COL.jade; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, 0, -th, true); ctx.closePath(); ctx.fill(); ctx.stroke();
        /* chord + segment */
        var ex = cx + R * Math.cos(th), ey = cy - R * Math.sin(th);
        ctx.fillStyle = A(COL.crim, .3); ctx.beginPath(); ctx.moveTo(cx + R, cy); ctx.arc(cx, cy, R, 0, -th, true); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = COL.crim; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx + R, cy); ctx.lineTo(ex, ey); ctx.stroke();
        /* angle arc */
        ctx.strokeStyle = COL.gold; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, 28, 0, -th, true); ctx.stroke();
        ctx.fillStyle = COL.text; ctx.font = "600 12px 'IBM Plex Mono', monospace"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText("θ", cx + 34 * Math.cos(th / 2), cy - 34 * Math.sin(th / 2));
        ctx.fillStyle = COL.mute; ctx.fillText("r = " + r, cx + R / 2 * Math.cos(th) + 6, cy - R / 2 * Math.sin(th) - 8);
        var arc = r * th, area = 0.5 * r * r * th, seg = 0.5 * r * r * (th - Math.sin(th)), chord = 2 * r * Math.sin(th / 2);
        read.innerHTML = "<b>θ = " + num(th, 3) + " rad = " + num(th * 180 / Math.PI, 1) + "°</b>" +
          " &nbsp;·&nbsp; <span style='color:var(--good)'>arc = rθ = " + num(arc, 3) + "</span>" +
          " &nbsp;·&nbsp; sector = ½r²θ = " + num(area, 3) +
          "<br><span style='color:var(--danger)'>segment = ½r²(θ − sin θ) = " + num(seg, 3) + "</span> &nbsp;·&nbsp; chord = 2r sin(θ/2) = " + num(chord, 3) +
          "<br><span style='color:var(--muted)'>Formulas need θ in radians. Perimeter of a sector = 2r + rθ; of a segment = chord + arc.</span>";
      }
      redraw();
    }
  });

  /* =================== SEQUENCE EXPLORER =================== */
  KOS.sims.register({
    id: "sequence-explorer", title: "Sequences & series — terms and partial sums", subject: "maths", ref: "4.4",
    desc: "Arithmetic or geometric: set a and d (or r), see the terms plotted with the running sum Sₙ, and watch a geometric series converge to a/(1 − r) when |r| < 1 — or refuse to.",
    mount: function (panel) {
      var type = "geo", a = 8, k = 0.6, n = 12;
      var typeSel = el("select", {}, [el("option", { value: "arith", text: "arithmetic (a, d)" }), el("option", { value: "geo", text: "geometric (a, r)" })]);
      typeSel.value = type; typeSel.onchange = function () { type = typeSel.value; kLab.firstChild.textContent = type === "geo" ? "r " : "d "; redraw(); };
      var aIn = el("input", { type: "number", value: a, step: "0.5", style: "width:80px" });
      var kIn = el("input", { type: "number", value: k, step: "0.1", style: "width:80px" });
      var kLab = el("label", {}, ["r ", kIn]);
      var sl = slider("n", 2, 30, 1, n, function (v) { n = v; redraw(); });
      panel.appendChild(el("div", { class: "lab-controls" }, [el("label", {}, ["type", typeSel]), el("label", {}, ["a", aIn]), kLab, sl.node,
        el("button", { class: "btn primary", text: "Plot", onclick: redraw })]));
      aIn.onchange = kIn.onchange = redraw;
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 320);
      var read = readout(); panel.appendChild(read);
      var tbl = el("div", {}); panel.appendChild(tbl);
      function redraw() {
        a = parseFloat(aIn.value); k = parseFloat(kIn.value);
        var terms = [], sums = [], S = 0;
        for (var i = 1; i <= n; i++) { var u = type === "geo" ? a * Math.pow(k, i - 1) : a + (i - 1) * k; terms.push(u); S += u; sums.push(S); }
        var all = terms.concat(sums), lo = Math.min.apply(null, all.concat([0])), hi = Math.max.apply(null, all.concat([0]));
        if (!isFinite(lo) || !isFinite(hi)) { read.textContent = "Values overflow — reduce n or r."; return; }
        var P = plotter(cv, 0, n + 1, lo - (hi - lo) * 0.1, hi + (hi - lo) * 0.1);
        P.axes("n", "");
        var ctx = cv.ctx;
        terms.forEach(function (u, i) {
          if (ctx && ctx.fillRect) { ctx.fillStyle = A(COL.blue, .5); var x = P.X(i + 1); ctx.fillRect(x - 5, Math.min(P.Y(0), P.Y(u)), 10, Math.abs(P.Y(u) - P.Y(0))); }
        });
        for (i = 1; i < n; i++) P.line(i, sums[i - 1], i + 1, sums[i], COL.gold, 2);
        sums.forEach(function (s, i) { P.dot(i + 1, s, COL.gold, 3.5); });
        if (type === "geo" && Math.abs(k) < 1) P.line(0, a / (1 - k), n + 1, a / (1 - k), COL.jade, 1.3, [6, 4]);
        var formula = type === "geo"
          ? "uₙ = arⁿ⁻¹ · Sₙ = a(1 − rⁿ)/(1 − r)" + (Math.abs(k) < 1 ? " · S∞ = a/(1 − r) = <b>" + num(a / (1 - k), 4) + "</b> (|r| < 1, dashed line)" : " · <span style='color:var(--danger)'>|r| ≥ 1 so S∞ does not exist</span>")
          : "uₙ = a + (n − 1)d · Sₙ = n/2 [2a + (n − 1)d]";
        read.innerHTML = "<span style='color:var(--accent)'>bars: terms uₙ</span> · <span style='color:var(--accent2)'>line: partial sums Sₙ</span><br>" + formula +
          "<br>u" + n + " = " + num(terms[n - 1], 4) + " · S" + n + " = <b>" + num(sums[n - 1], 4) + "</b>";
        tbl.innerHTML = ""; tbl.appendChild(table(["n"].concat(terms.map(function (_, i) { return String(i + 1); })).slice(0, 13),
          [["uₙ"].concat(terms.map(function (u) { return sf(u, 4); })).slice(0, 13), ["Sₙ"].concat(sums.map(function (s) { return sf(s, 4); })).slice(0, 13)]));
      }
      redraw();
    }
  });

  /* =================== NORMAL CURVE =================== */
  KOS.sims.register({
    id: "normal-curve", title: "Normal Distribution — shade & standardise", subject: "maths", ref: "S4.2",
    desc: "Set μ and σ, choose the kind of probability, and drag the bounds: the shaded area, the z-values and the calculator-style probability statement update together. Switch to inverse mode to find the x with a given tail probability.",
    mount: function (panel) {
      var mu = 50, sg = 8, mode = "lt", a = 45, b = 60, p = 0.9;
      var modeSel = el("select", {}, [
        el("option", { value: "lt", text: "P(X < a)" }), el("option", { value: "gt", text: "P(X > a)" }),
        el("option", { value: "between", text: "P(a < X < b)" }), el("option", { value: "inv", text: "inverse: P(X < x) = p" })]);
      modeSel.value = mode; modeSel.onchange = function () { mode = modeSel.value; redraw(); };
      var muIn = el("input", { type: "number", value: mu, step: "1", style: "width:80px" });
      var sgIn = el("input", { type: "number", value: sg, step: "0.5", style: "width:80px" });
      var sa = slider("a", 0, 100, 0.5, a, function (v) { a = v; redraw(); });
      var sb = slider("b", 0, 100, 0.5, b, function (v) { b = v; redraw(); });
      var sp = slider("p", 0.001, 0.999, 0.001, p, function (v) { p = v; redraw(); }, function (v) { return num(v, 3); });
      panel.appendChild(el("div", { class: "lab-controls" }, [el("label", {}, ["μ", muIn]), el("label", {}, ["σ", sgIn]), el("label", {}, ["find", modeSel]), sa.node, sb.node, sp.node]));
      muIn.onchange = sgIn.onchange = function () {
        mu = parseFloat(muIn.value); sg = Math.max(0.1, parseFloat(sgIn.value));
        [sa, sb].forEach(function (s) { s.input.min = mu - 4 * sg; s.input.max = mu + 4 * sg; s.input.step = sg / 20; });
        a = Math.max(mu - 4 * sg, Math.min(mu + 4 * sg, a)); b = Math.max(a, Math.min(mu + 4 * sg, b)); sa.set(num(a, 2)); sb.set(num(b, 2)); redraw();
      };
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 300);
      var read = readout(); panel.appendChild(read);
      function redraw() {
        var x0 = mu - 4 * sg, x1 = mu + 4 * sg, peak = 1 / (sg * Math.sqrt(2 * Math.PI));
        var pdf = function (x) { return peak * Math.exp(-0.5 * Math.pow((x - mu) / sg, 2)); };
        var P = plotter(cv, x0, x1, 0, peak * 1.15);
        P.axes("x", "");
        var lo, hi, prob, stmt, zs;
        if (mode === "lt") { lo = x0; hi = a; prob = Phi((a - mu) / sg); stmt = "P(X < " + num(a, 2) + ") = P(Z < " + num((a - mu) / sg, 4) + ")"; }
        else if (mode === "gt") { lo = a; hi = x1; prob = 1 - Phi((a - mu) / sg); stmt = "P(X > " + num(a, 2) + ") = P(Z > " + num((a - mu) / sg, 4) + ") = 1 − Φ(" + num((a - mu) / sg, 4) + ")"; }
        else if (mode === "between") { lo = Math.min(a, b); hi = Math.max(a, b); prob = Phi((hi - mu) / sg) - Phi((lo - mu) / sg); stmt = "P(" + num(lo, 2) + " < X < " + num(hi, 2) + ") = Φ(" + num((hi - mu) / sg, 4) + ") − Φ(" + num((lo - mu) / sg, 4) + ")"; }
        else { var z = PhiInv(p); lo = x0; hi = mu + z * sg; prob = p; stmt = "P(X < x) = " + num(p, 3) + " ⇒ z = " + num(z, 4) + " ⇒ x = μ + zσ = <b>" + num(hi, 3) + "</b>"; }
        var ctx = cv.ctx;
        if (ctx && ctx.beginPath) {
          ctx.fillStyle = A(COL.jade, .3); ctx.beginPath(); ctx.moveTo(P.X(lo), P.Y(0));
          for (var i = 0; i <= 200; i++) { var x = lo + (hi - lo) * i / 200; ctx.lineTo(P.X(x), P.Y(pdf(x))); }
          ctx.lineTo(P.X(hi), P.Y(0)); ctx.closePath(); ctx.fill();
        }
        P.curve(pdf, COL.text, 2.2);
        P.line(mu, 0, mu, peak, COL.mute, 1, [4, 4]);
        [-1, 1].forEach(function (k) { P.line(mu + k * sg, 0, mu + k * sg, pdf(mu + k * sg), COL.grid, 1, [2, 3]); });
        P.label(mu, peak, "μ", COL.mute);
        read.innerHTML = "X ~ N(" + num(mu, 2) + ", " + num(sg, 2) + "²) &nbsp;·&nbsp; " + stmt + " = <b>" + num(prob, 4) + "</b>" +
          "<br><span style='color:var(--muted)'>Standardise with Z = (X − μ)/σ whenever μ or σ is unknown; write the probability statement — it is the method mark. Points of inflection at μ ± σ (faint lines); about 68% lies between them.</span>";
      }
      muIn.onchange();
    }
  });

  /* =================== BINOMIAL TEST VISUALISER =================== */
  KOS.sims.register({
    id: "binomial-test-viz", title: "Binomial Hypothesis Test — critical regions live", subject: "maths", ref: "S5.2",
    desc: "Set n and p under H₀, the tail and the significance level, and the bar chart shades the critical region; drag the observed value to read the p-value and the conclusion, worded the way the mark scheme wants.",
    mount: function (panel) {
      var n = 20, p = 0.25, tail = "upper", alpha = 0.05, x = 9;
      var sn = slider("n", 5, 60, 1, n, function (v) { n = v; sx.input.max = n; x = Math.min(x, n); sx.set(x); redraw(); });
      var sp = slider("p (H₀)", 0.02, 0.98, 0.01, p, function (v) { p = v; redraw(); }, function (v) { return num(v, 2); });
      var tailSel = el("select", {}, [el("option", { value: "upper", text: "H₁: p > p₀" }), el("option", { value: "lower", text: "H₁: p < p₀" }), el("option", { value: "two", text: "H₁: p ≠ p₀" })]);
      tailSel.value = tail; tailSel.onchange = function () { tail = tailSel.value; redraw(); };
      var aSel = el("select", {}, [el("option", { value: "0.1", text: "10%" }), el("option", { value: "0.05", text: "5%" }), el("option", { value: "0.01", text: "1%" })]);
      aSel.value = String(alpha); aSel.onchange = function () { alpha = parseFloat(aSel.value); redraw(); };
      var sx = slider("observed x", 0, n, 1, x, function (v) { x = v; redraw(); });
      panel.appendChild(el("div", { class: "lab-controls" }, [sn.node, sp.node, el("label", {}, ["alternative", tailSel]), el("label", {}, ["level", aSel]), sx.node]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 300);
      var read = readout(); panel.appendChild(read);
      function redraw() {
        var pm = [], cdf = [], c = 0;
        for (var k = 0; k <= n; k++) { pm.push(binPmf(n, p, k)); c += pm[k]; cdf.push(c); }
        var tailLevel = tail === "two" ? alpha / 2 : alpha;
        var lowCR = -1, highCR = n + 1;
        if (tail !== "upper") { for (k = 0; k <= n; k++) if (cdf[k] <= tailLevel) lowCR = k; }
        if (tail !== "lower") { for (k = n; k >= 0; k--) if (1 - (k > 0 ? cdf[k - 1] : 0) <= tailLevel) highCR = k; }
        var actual = (lowCR >= 0 ? cdf[lowCR] : 0) + (highCR <= n ? 1 - (highCR > 0 ? cdf[highCR - 1] : 0) : 0);
        var pLow = cdf[x], pHigh = 1 - (x > 0 ? cdf[x - 1] : 0);
        var pval = tail === "upper" ? pHigh : tail === "lower" ? pLow : 2 * Math.min(pLow, pHigh);
        var inCR = x <= lowCR || x >= highCR;
        var peak = Math.max.apply(null, pm);
        var P = plotter(cv, -0.7, n + 0.7, 0, peak * 1.15);
        P.axes("x", "P(X = x)");
        var ctx = cv.ctx, bw = (P.X(1) - P.X(0)) * 0.8;
        if (ctx && ctx.fillRect) pm.forEach(function (v, k) {
          var cr = k <= lowCR || k >= highCR;
          ctx.fillStyle = k === x ? COL.gold : cr ? A(COL.crim, .7) : A(COL.blue, .45);
          ctx.fillRect(P.X(k) - bw / 2, P.Y(v), bw, P.Y(0) - P.Y(v));
        });
        var crTxt = [];
        if (tail !== "upper") crTxt.push(lowCR >= 0 ? "X ≤ " + lowCR + " (P = " + num(cdf[lowCR], 4) + ")" : "no lower region (P(X = 0) = " + num(cdf[0], 4) + " > " + num(tailLevel, 3) + ")");
        if (tail !== "lower") crTxt.push(highCR <= n ? "X ≥ " + highCR + " (P = " + num(1 - (highCR > 0 ? cdf[highCR - 1] : 0), 4) + ")" : "no upper region");
        var h1 = tail === "upper" ? "p > " + p : tail === "lower" ? "p < " + p : "p ≠ " + p;
        var conclusion = inCR
          ? "<b style='color:var(--danger)'>reject H₀</b> — there is evidence at the " + (alpha * 100) + "% level that " + h1
          : "<b style='color:var(--good)'>do not reject H₀</b> — insufficient evidence at the " + (alpha * 100) + "% level that " + h1;
        read.innerHTML = "H₀: p = " + p + " &nbsp; H₁: " + h1 + " &nbsp; X ~ B(" + n + ", " + p + ") under H₀" +
          "<br><span style='color:var(--danger)'>critical region: " + crTxt.join(" and ") + "</span> · actual significance level " + num(actual, 4) + " (" + num(actual * 100, 2) + "%)" +
          "<br>observed x = " + x + ": " + (tail === "upper" ? "P(X ≥ " + x + ") = " + num(pHigh, 4) : tail === "lower" ? "P(X ≤ " + x + ") = " + num(pLow, 4) : "p-value (two-tailed) = " + num(pval, 4)) + " → " + conclusion +
          "<br><span style='color:var(--muted)'>Each tail's probability must be ≤ the tail level (Edexcel convention), not 'closest to'.</span>";
      }
      redraw();
    }
  });

  /* =================== SAMPLING LAB =================== */
  KOS.sims.register({
    id: "sampling-lab", title: "Sampling Lab — random, systematic, stratified", subject: "maths", ref: "S1.1",
    desc: "A population of 240 heights in three strata. Draw samples by each method, compare the sample mean with the true population mean, and build up the distribution of sample means to see why bigger samples vary less.",
    mount: function (panel) {
      var POP = [], STRATA = ["Year 12", "Year 13", "Staff"], SIZE = [120, 90, 30], MEANS = [168, 172, 175];
      /* deterministic pseudo-random population so the lab looks the same every visit */
      var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      function gauss() { var u = rnd() || 1e-9, v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
      SIZE.forEach(function (s, g) { for (var i = 0; i < s; i++) POP.push({ g: g, v: Math.round((MEANS[g] + 7 * gauss()) * 10) / 10 }); });
      var popMean = POP.reduce(function (a, p) { return a + p.v; }, 0) / POP.length;
      var method = "random", nS = 24, sample = [], means = [];
      var mSel = el("select", {}, [el("option", { value: "random", text: "simple random" }), el("option", { value: "systematic", text: "systematic" }), el("option", { value: "stratified", text: "stratified" }), el("option", { value: "opportunity", text: "opportunity (first n)" })]);
      mSel.onchange = function () { method = mSel.value; means = []; draw(); };
      var sl = slider("sample size n", 6, 60, 6, nS, function (v) { nS = v; means = []; draw(); });
      var read = readout();
      panel.appendChild(el("div", { class: "lab-controls" }, [el("label", {}, ["method", mSel]), sl.node,
        el("button", { class: "btn primary", text: "Take a sample", onclick: take }),
        el("button", { class: "btn gold", text: "Take 50 samples", onclick: function () { for (var i = 0; i < 50; i++) take(true); draw(); } }),
        el("button", { class: "btn", text: "Clear", onclick: function () { sample = []; means = []; draw(); } })]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 330);
      panel.appendChild(read);
      function take(silent) {
        var idx = [];
        if (method === "random") { var pool = POP.map(function (_, i) { return i; }); for (var i = 0; i < nS; i++) idx.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); }
        else if (method === "systematic") { var k = Math.floor(POP.length / nS), start = Math.floor(Math.random() * k); for (i = 0; i < nS; i++) idx.push(start + i * k); }
        else if (method === "stratified") { SIZE.forEach(function (s, g) { var want = Math.round(nS * s / POP.length), poolg = []; POP.forEach(function (p, i) { if (p.g === g) poolg.push(i); }); for (var j = 0; j < want; j++) idx.push(poolg.splice(Math.floor(Math.random() * poolg.length), 1)[0]); }); }
        else { for (i = 0; i < nS; i++) idx.push(i); }
        sample = idx;
        means.push(idx.reduce(function (a, i) { return a + POP[i].v; }, 0) / idx.length);
        if (!silent) draw();
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var cols = 24, cell = Math.min(16, Math.floor((cv.W - 20) / cols)), ox = 10, oy = 10;
        var inS = {}; sample.forEach(function (i) { inS[i] = true; });
        var tint = [COL.blue, COL.jade, COL.gold];
        POP.forEach(function (p, i) {
          var x = ox + (i % cols) * cell, y = oy + Math.floor(i / cols) * cell;
          ctx.fillStyle = inS[i] ? tint[p.g] : A(tint[p.g], .22);
          ctx.beginPath(); ctx.arc(x + cell / 2, y + cell / 2, inS[i] ? cell * 0.4 : cell * 0.28, 0, 7); ctx.fill();
        });
        /* sampling distribution histogram on the right */
        var hx = ox + cols * cell + 24, hw = cv.W - hx - 10, hy = 20, hh = cv.H - 60;
        if (hw > 80) {
          ctx.strokeStyle = COL.line; ctx.beginPath(); ctx.moveTo(hx, hy + hh); ctx.lineTo(hx + hw, hy + hh); ctx.stroke();
          var lo = popMean - 8, hi = popMean + 8, bins = 16, cnt = [];
          for (var b = 0; b < bins; b++) cnt.push(0);
          means.forEach(function (m) { var bi = Math.floor((m - lo) / (hi - lo) * bins); if (bi >= 0 && bi < bins) cnt[bi]++; });
          var mx = Math.max(1, Math.max.apply(null, cnt));
          cnt.forEach(function (c, b) { ctx.fillStyle = A(COL.crim, .55); var bw = hw / bins; ctx.fillRect(hx + b * bw + 1, hy + hh - c / mx * hh, bw - 2, c / mx * hh); });
          ctx.strokeStyle = COL.text; ctx.setLineDash([4, 3]); ctx.beginPath(); var px = hx + (popMean - lo) / (hi - lo) * hw; ctx.moveTo(px, hy); ctx.lineTo(px, hy + hh); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = COL.mute; ctx.font = "10.5px 'IBM Plex Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
          ctx.fillText("sample means (" + means.length + ")", hx + hw / 2, hy + hh + 4); ctx.fillText("μ = " + num(popMean, 1), px, hy + hh + 16);
        }
        var last = means.length ? means[means.length - 1] : null;
        var sd = means.length > 1 ? Math.sqrt(means.reduce(function (a, m) { return a + Math.pow(m - means.reduce(function (s, q) { return s + q; }, 0) / means.length, 2); }, 0) / means.length) : null;
        var note = { random: "every member equally likely — needs a numbered sampling frame.", systematic: "k = 240/n; random start in the first k then every kth — cheap, but a hidden pattern in the list can bias it.", stratified: "Year 12 : Year 13 : Staff = 120 : 90 : 30, sampled in proportion, random within each — reflects the population's structure.", opportunity: "the first n in the list are all Year 12 — quick, but the mean is biased low. Not random." }[method];
        read.innerHTML = "<span style='color:var(--accent)'>● Year 12</span> <span style='color:var(--good)'>● Year 13</span> <span style='color:var(--accent2)'>● Staff</span> · population mean μ = <b>" + num(popMean, 2) + "</b>" +
          (last !== null ? " · last sample mean x̄ = <b>" + num(last, 2) + "</b> (error " + num(last - popMean, 2) + ")" : "") +
          (sd !== null ? " · sd of the " + means.length + " sample means = " + num(sd, 2) : "") +
          "<br><span style='color:var(--muted)'>" + method + ": " + note + "</span>";
      }
      draw();
    }
  });

  /* =================== SCATTER & REGRESSION =================== */
  KOS.sims.register({
    id: "scatter-regression", title: "Scatter, PMCC & regression line", subject: "maths", ref: "S2.2",
    desc: "Drag the points and watch the product moment correlation coefficient and the least-squares line y = a + bx respond. Drop one point far away to see how a single outlier drags the line — and why r is not a proof of a linear model.",
    mount: function (panel) {
      var pts = [[1, 2.2], [2, 2.9], [3, 3.1], [4, 4.6], [5, 4.9], [6, 6.2], [7, 6.4], [8, 7.9], [9, 8.1], [10, 9.6]];
      var showRes = el("input", { type: "checkbox" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", { class: "chk", style: "flex-direction:row;align-items:center;gap:6px" }, [showRes, "show residuals"]),
        el("button", { class: "btn", text: "Straighten", onclick: function () { pts = pts.map(function (p, i) { return [i + 1, 1.2 + 0.8 * (i + 1)]; }); draw(); } }),
        el("button", { class: "btn", text: "Scatter randomly", onclick: function () { pts = pts.map(function (p, i) { return [i + 1, 1 + Math.random() * 9]; }); draw(); } }),
        el("button", { class: "btn", text: "Make it curved", onclick: function () { pts = pts.map(function (p, i) { return [i + 1, 0.1 * Math.pow(i + 1, 2) + 0.5]; }); draw(); } }),
        el("span", { class: "sim-msg", text: "drag any point" })]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 340);
      var read = readout(); panel.appendChild(read);
      var P;
      function stats() {
        var n = pts.length, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
        pts.forEach(function (p) { sx += p[0]; sy += p[1]; sxx += p[0] * p[0]; syy += p[1] * p[1]; sxy += p[0] * p[1]; });
        var Sxx = sxx - sx * sx / n, Syy = syy - sy * sy / n, Sxy = sxy - sx * sy / n;
        var b = Sxy / Sxx, a = sy / n - b * sx / n, r = Sxy / Math.sqrt(Sxx * Syy);
        return { a: a, b: b, r: r, Sxx: Sxx, Syy: Syy, Sxy: Sxy, xm: sx / n, ym: sy / n };
      }
      function draw() {
        P = plotter(cv, 0, 11, 0, 11); P.axes("x", "y");
        var s = stats();
        P.line(0, s.a, 11, s.a + 11 * s.b, COL.crim, 1.8);
        pts.forEach(function (p) { if (showRes.checked) P.line(p[0], p[1], p[0], s.a + s.b * p[0], COL.mute, 1, [3, 3]); P.dot(p[0], p[1], COL.gold, 6); });
        P.dot(s.xm, s.ym, COL.jade, 4);
        var word = Math.abs(s.r) > 0.8 ? "strong" : Math.abs(s.r) > 0.5 ? "moderate" : Math.abs(s.r) > 0.2 ? "weak" : "little or no";
        read.innerHTML = "r = <b>" + num(s.r, 4) + "</b> — " + word + (s.r > 0.05 ? " positive" : s.r < -0.05 ? " negative" : "") + " correlation" +
          " &nbsp;·&nbsp; regression line y = <b>" + num(s.a, 3) + " + " + num(s.b, 3) + "x</b> (passes through (x̄, ȳ) = (" + num(s.xm, 2) + ", " + num(s.ym, 2) + "), the green point)" +
          "<br>S<sub>xx</sub> = " + num(s.Sxx, 3) + " · S<sub>yy</sub> = " + num(s.Syy, 3) + " · S<sub>xy</sub> = " + num(s.Sxy, 3) + " · b = S<sub>xy</sub>/S<sub>xx</sub>, a = ȳ − bx̄" +
          "<br><span style='color:var(--muted'>Interpret b as 'y changes by b for each unit increase in x'; predicting outside 1 ≤ x ≤ 10 is extrapolation.</span>";
      }
      var drag = -1;
      function hit(e) { var r = cv.c.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, best = -1, bd = 14; pts.forEach(function (p, i) { var d = Math.hypot(P.X(p[0]) - mx, P.Y(p[1]) - my); if (d < bd) { bd = d; best = i; } }); return best; }
      cv.c.addEventListener("mousedown", function (e) { drag = hit(e); });
      window.addEventListener("mousemove", function (e) { if (drag < 0) return; var r = cv.c.getBoundingClientRect(); var x = P.invX(e.clientX - r.left), y = 11 - (e.clientY - r.top - 14) / (cv.H - 44) * 11; pts[drag] = [Math.max(0.2, Math.min(10.8, x)), Math.max(0.2, Math.min(10.8, y))]; draw(); });
      window.addEventListener("mouseup", function () { drag = -1; });
      cv.c.style.cursor = "grab"; showRes.onchange = draw;
      draw();
    }
  });

  /* =================== PROJECTILE LAB =================== */
  KOS.sims.register({
    id: "projectile-lab", title: "Projectile Lab — launch, trace, read the numbers", subject: "maths", ref: "S7.5",
    desc: "Choose speed, angle and launch height and fire. The trajectory draws with the velocity components shown at the peak and on landing, and the read-out gives time of flight, range, greatest height and impact speed — with the suvat lines that produce them.",
    mount: function (panel) {
      var U = 20, ang = 40, h0 = 0, g = 9.8, t = 0, timer = null;
      var sU = slider("U (m/s)", 5, 40, 1, U, function (v) { U = v; reset(); });
      var sA = slider("angle (°)", 5, 85, 1, ang, function (v) { ang = v; reset(); });
      var sH = slider("launch height (m)", 0, 40, 1, h0, function (v) { h0 = v; reset(); });
      panel.appendChild(el("div", { class: "lab-controls" }, [sU.node, sA.node, sH.node,
        el("button", { class: "btn primary", text: "▶ Fire", onclick: fire }),
        el("button", { class: "btn", text: "Reset", onclick: reset })]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 330);
      var read = readout(); panel.appendChild(read);
      function params() {
        var a = ang * Math.PI / 180, ux = U * Math.cos(a), uy = U * Math.sin(a);
        var T = (uy + Math.sqrt(uy * uy + 2 * g * h0)) / g;
        return { ux: ux, uy: uy, T: T, R: ux * T, H: h0 + uy * uy / (2 * g), tH: uy / g, vy: uy - g * T };
      }
      function draw(tt) {
        var p = params();
        var P = plotter(cv, 0, Math.max(10, p.R * 1.1), 0, Math.max(5, p.H * 1.25));
        P.axes("x (m)", "y (m)");
        P.line(0, h0, 0, 0, COL.mute, 3);
        var ctx = cv.ctx;
        if (ctx && ctx.beginPath) {
          ctx.strokeStyle = A(COL.text, .5); ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2; ctx.beginPath();
          for (var i = 0; i <= 100; i++) { var s = p.T * i / 100; var x = p.ux * s, y = h0 + p.uy * s - 0.5 * g * s * s; if (i === 0) ctx.moveTo(P.X(x), P.Y(y)); else ctx.lineTo(P.X(x), P.Y(y)); }
          ctx.stroke(); ctx.setLineDash([]);
        }
        var tc = Math.min(tt, p.T), x = p.ux * tc, y = h0 + p.uy * tc - 0.5 * g * tc * tc;
        /* velocity arrows */
        var vy = p.uy - g * tc, sc = 0.25;
        P.line(x, y, x + p.ux * sc, y, COL.jade, 2); P.line(x, y, x, y + vy * sc, COL.crim, 2);
        P.dot(x, y, COL.gold, 6);
        P.dot(p.ux * p.tH, p.H, COL.mute, 3); P.label(p.ux * p.tH, p.H, "max height", COL.mute, "center");
        read.innerHTML = "u<sub>x</sub> = U cos α = " + num(p.ux, 3) + " · u<sub>y</sub> = U sin α = " + num(p.uy, 3) + " · t = " + num(tc, 2) + " s" +
          "<br>time of flight: " + (h0 ? "−" + h0 : "0") + " = u<sub>y</sub>T − 4.9T² ⇒ <b>T = " + num(p.T, 3) + " s</b> · range = u<sub>x</sub>T = <b>" + num(p.R, 2) + " m</b>" +
          "<br>greatest height: v<sub>y</sub> = 0 ⇒ " + (h0 ? h0 + " + " : "") + "u<sub>y</sub>²/2g = <b>" + num(p.H, 2) + " m</b> at t = " + num(p.tH, 2) + " s · impact speed √(u<sub>x</sub>² + v<sub>y</sub>²) = <b>" + num(Math.hypot(p.ux, p.vy), 2) + " m/s</b>" +
          "<br><span style='color:var(--muted)'>green: horizontal velocity (constant) · red: vertical velocity (changes by 9.8 each second)</span>";
      }
      function reset() { if (timer) cancelAnimationFrame(timer); timer = null; t = 0; draw(0); }
      function fire() {
        if (timer) cancelAnimationFrame(timer);
        var start = performance.now(), T = params().T;
        (function step(now) { t = Math.min(T, (now - start) / 1000 * 1.2); draw(t); if (t < T) timer = requestAnimationFrame(step); else timer = null; })(start);
      }
      draw(0);
    }
  });

  /* =================== V–T GRAPH BUILDER =================== */
  KOS.sims.register({
    id: "vt-graph-builder", title: "Velocity–time graph builder", subject: "maths", ref: "S7.2",
    desc: "Build a three-phase journey — accelerate, cruise, decelerate — and read the areas and gradients straight off the graph: distance is the area under the line, acceleration its slope. The matching displacement–time curve draws beneath.",
    mount: function (panel) {
      var V = 20, t1 = 8, t2 = 20, t3 = 12, v0 = 0;
      var sV = slider("V (m/s)", 2, 40, 1, V, function (v) { V = v; draw(); });
      var s0 = slider("start speed", 0, 20, 1, v0, function (v) { v0 = v; draw(); });
      var s1 = slider("accelerate for (s)", 1, 30, 1, t1, function (v) { t1 = v; draw(); });
      var s2 = slider("constant for (s)", 0, 60, 1, t2, function (v) { t2 = v; draw(); });
      var s3 = slider("decelerate for (s)", 1, 30, 1, t3, function (v) { t3 = v; draw(); });
      panel.appendChild(el("div", { class: "lab-controls" }, [sV.node, s0.node, s1.node, s2.node, s3.node]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 260);
      var holder2 = el("div", { style: "margin-top:8px" }); panel.appendChild(holder2);
      var cv2 = canvas(holder2, 200);
      var read = readout(); panel.appendChild(read);
      function draw() {
        var T = t1 + t2 + t3;
        var P = plotter(cv, 0, T * 1.05, 0, Math.max(V, v0) * 1.2); P.axes("t (s)", "v (m/s)");
        var ctx = cv.ctx;
        var A1 = (v0 + V) / 2 * t1, A2 = V * t2, A3 = V / 2 * t3;
        if (ctx && ctx.beginPath) {
          function poly(pts, col) { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(P.X(p[0]), P.Y(p[1])); else ctx.moveTo(P.X(p[0]), P.Y(p[1])); }); ctx.closePath(); ctx.fill(); }
          poly([[0, 0], [0, v0], [t1, V], [t1, 0]], A(COL.jade, .25));
          poly([[t1, 0], [t1, V], [t1 + t2, V], [t1 + t2, 0]], A(COL.blue, .22));
          poly([[t1 + t2, 0], [t1 + t2, V], [T, 0]], A(COL.crim, .22));
        }
        P.line(0, v0, t1, V, COL.text, 2.2); P.line(t1, V, t1 + t2, V, COL.text, 2.2); P.line(t1 + t2, V, T, 0, COL.text, 2.2);
        P.label(t1 / 2, (v0 + V) / 2, num(A1, 1) + " m", COL.jade, "center"); P.label(t1 + t2 / 2, V / 2, num(A2, 1) + " m", COL.blue, "center"); P.label(t1 + t2 + t3 / 3, V / 3, num(A3, 1) + " m", COL.crim, "center");
        /* s–t */
        var S = A1 + A2 + A3;
        var Q = plotter(cv2, 0, T * 1.05, 0, S * 1.15); Q.axes("t (s)", "s (m)");
        Q.curve(function (t) {
          if (t <= t1) return v0 * t + 0.5 * ((V - v0) / t1) * t * t;
          if (t <= t1 + t2) return A1 + V * (t - t1);
          if (t <= T) { var u = t - t1 - t2; return A1 + A2 + V * u - 0.5 * (V / t3) * u * u; }
          return S;
        }, COL.gold, 2.2);
        read.innerHTML = "acceleration = gradient = (V − u)/t = (" + V + " − " + v0 + ")/" + t1 + " = <b>" + num((V - v0) / t1, 3) + " m/s²</b> · deceleration = " + V + "/" + t3 + " = <b>" + num(V / t3, 3) + " m/s²</b>" +
          "<br>distance = area = ½(" + v0 + " + " + V + ")(" + t1 + ") + " + V + "(" + t2 + ") + ½(" + V + ")(" + t3 + ") = " + num(A1, 1) + " + " + num(A2, 1) + " + " + num(A3, 1) + " = <b>" + num(S, 1) + " m</b> in " + T + " s · average speed " + num(S / T, 2) + " m/s" +
          "<br><span style='color:var(--muted)'>The s–t curve is a parabola while accelerating (increasing gradient), a straight line while cruising, and flattens while decelerating.</span>";
      }
      draw();
    }
  });

  /* =================== VECTOR PLAYGROUND =================== */
  KOS.sims.register({
    id: "vector-playground", title: "Vector Playground — add, subtract, scale", subject: "maths", ref: "10.3",
    desc: "Drag the heads of a and b. The parallelogram shows a + b, the dashed vector a − b, and the slider scales a by λ. Magnitudes, bearings and the i–j column forms update as you drag.",
    mount: function (panel) {
      var a = [4, 2], b = [-1, 3], lam = 1.5;
      var sl = slider("λ", -3, 3, 0.1, lam, function (v) { lam = v; draw(); }, function (v) { return num(v, 1); });
      panel.appendChild(el("div", { class: "lab-controls" }, [sl.node, el("span", { class: "sim-msg", text: "drag the heads of a (gold) and b (blue)" })]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 380);
      var read = readout(); panel.appendChild(read);
      var P;
      function arrow(v, col, label, from) {
        from = from || [0, 0];
        var tip = [from[0] + v[0], from[1] + v[1]];
        P.line(from[0], from[1], tip[0], tip[1], col, 2.4);
        var ctx = cv.ctx; if (ctx && ctx.beginPath) {
          var ang = Math.atan2(P.Y(tip[1]) - P.Y(from[1]), P.X(tip[0]) - P.X(from[0]));
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(P.X(tip[0]), P.Y(tip[1]));
          ctx.lineTo(P.X(tip[0]) - 11 * Math.cos(ang - 0.4), P.Y(tip[1]) - 11 * Math.sin(ang - 0.4));
          ctx.lineTo(P.X(tip[0]) - 11 * Math.cos(ang + 0.4), P.Y(tip[1]) - 11 * Math.sin(ang + 0.4)); ctx.closePath(); ctx.fill();
        }
        P.label(tip[0], tip[1], label, col);
      }
      function bearing(v) { var d = Math.atan2(v[0], v[1]) * 180 / Math.PI; if (d < 0) d += 360; return num(d, 1) + "°"; }
      function col(v) { return "(" + num(v[0], 2) + "i " + (v[1] < 0 ? "− " : "+ ") + num(Math.abs(v[1]), 2) + "j)"; }
      function draw() {
        P = plotter(cv, -8, 8, -8, 8); P.axes("i", "j");
        var sum = [a[0] + b[0], a[1] + b[1]], diff = [a[0] - b[0], a[1] - b[1]], la = [lam * a[0], lam * a[1]];
        P.line(a[0], a[1], sum[0], sum[1], COL.grid, 1, [4, 3]); P.line(b[0], b[1], sum[0], sum[1], COL.grid, 1, [4, 3]);
        arrow(la, A(COL.gold, .45), "λa");
        arrow(a, COL.gold, "a"); arrow(b, COL.blue, "b"); arrow(sum, COL.jade, "a + b");
        P.line(b[0], b[1], a[0], a[1], COL.crim, 1.6, [6, 4]); P.label((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, "a − b", COL.crim);
        read.innerHTML = "<span style='color:var(--accent2)'>a = " + col(a) + " · |a| = " + num(Math.hypot(a[0], a[1]), 3) + " · bearing " + bearing(a) + "</span>" +
          "<br><span style='color:var(--accent)'>b = " + col(b) + " · |b| = " + num(Math.hypot(b[0], b[1]), 3) + "</span>" +
          "<br><span style='color:var(--good)'>a + b = " + col(sum) + " · |a + b| = " + num(Math.hypot(sum[0], sum[1]), 3) + "</span> ≤ |a| + |b| = " + num(Math.hypot(a[0], a[1]) + Math.hypot(b[0], b[1]), 3) +
          " &nbsp;·&nbsp; <span style='color:var(--danger)'>a − b = " + col(diff) + "</span> (from the head of b to the head of a) &nbsp;·&nbsp; λa = " + col(la) +
          "<br><span style='color:var(--muted)'>Bearings are measured clockwise from j (north). Unit vector in the direction of a: a/|a|.</span>";
      }
      var drag = null;
      cv.c.addEventListener("mousedown", function (e) { var r = cv.c.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; drag = Math.hypot(P.X(a[0]) - mx, P.Y(a[1]) - my) < 16 ? a : Math.hypot(P.X(b[0]) - mx, P.Y(b[1]) - my) < 16 ? b : null; });
      window.addEventListener("mousemove", function (e) { if (!drag) return; var r = cv.c.getBoundingClientRect(); var x = P.invX(e.clientX - r.left), y = 8 - (e.clientY - r.top - 14) / (cv.H - 44) * 16; drag[0] = Math.round(Math.max(-7.5, Math.min(7.5, x)) * 2) / 2; drag[1] = Math.round(Math.max(-7.5, Math.min(7.5, y)) * 2) / 2; draw(); });
      window.addEventListener("mouseup", function () { drag = null; });
      cv.c.style.cursor = "grab";
      draw();
    }
  });

  /* =================== INCLINE & FRICTION =================== */
  KOS.sims.register({
    id: "incline-forces", title: "Rough Inclined Plane — resolve and decide", subject: "maths", ref: "S8.6",
    desc: "Tilt the plane, set μ, the mass and a force along the slope, and the diagram resolves weight into mg sin θ and mg cos θ, compares the friction needed with μR, and tells you whether the block stays put, is in limiting equilibrium, or accelerates — and which way friction points.",
    mount: function (panel) {
      var th = 25, mu = 0.3, m = 5, Pf = 0, g = 9.8;
      var s1 = slider("θ (°)", 0, 60, 1, th, function (v) { th = v; draw(); });
      var s2 = slider("μ", 0, 1, 0.01, mu, function (v) { mu = v; draw(); }, function (v) { return num(v, 2); });
      var s3 = slider("mass (kg)", 1, 20, 1, m, function (v) { m = v; draw(); });
      var s4 = slider("force up the slope (N)", 0, 150, 1, Pf, function (v) { Pf = v; draw(); });
      panel.appendChild(el("div", { class: "lab-controls" }, [s1.node, s2.node, s3.node, s4.node]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 320);
      var read = readout(); panel.appendChild(read);
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var t = th * Math.PI / 180, W = m * g, R = W * Math.cos(t), down = W * Math.sin(t);
        var net = Pf - down;                     /* along the slope, up positive, without friction */
        var Fmax = mu * R, F, state, acc = 0, fdir;
        if (Math.abs(net) <= Fmax + 1e-9) { F = -net; state = Math.abs(Math.abs(net) - Fmax) < 1e-6 ? "limiting equilibrium" : "equilibrium (at rest)"; fdir = net > 0 ? "down the slope" : net < 0 ? "up the slope" : "none needed"; }
        else { F = net > 0 ? -Fmax : Fmax; acc = (net + F) / m; state = "slides " + (net > 0 ? "up" : "down") + " the slope"; fdir = net > 0 ? "down the slope" : "up the slope"; }
        /* drawing */
        var bx = 60, by = cv.H - 40, L = Math.min(cv.W - 120, 520);
        var tx = bx + L, ty = by - L * Math.tan(t);
        ctx.fillStyle = A(COL.text, .06); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, by); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = COL.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.strokeStyle = COL.grid; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, by); ctx.stroke();
        /* block at the midpoint (slope goes up to the right, so "up the slope" is toward tx) */
        var mx = (bx + tx) / 2, my = (by + ty) / 2, ux = Math.cos(t), uy = -Math.sin(t), nx = Math.sin(t), ny = Math.cos(t);
        ctx.save(); ctx.translate(mx, my); ctx.rotate(-t);
        ctx.fillStyle = A(COL.gold, .35); ctx.strokeStyle = COL.gold; ctx.fillRect(-22, -30, 44, 30); ctx.strokeRect(-22, -30, 44, 30); ctx.restore();
        var cx = mx - nx * 15, cy = my - ny * 15;
        function vec(dx, dy, len, colr, label) {
          var k = Math.min(110, len * 0.55); if (k < 2) return;
          ctx.strokeStyle = colr; ctx.fillStyle = colr; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * k, cy + dy * k); ctx.stroke();
          var ang = Math.atan2(dy, dx); ctx.beginPath(); ctx.moveTo(cx + dx * k, cy + dy * k); ctx.lineTo(cx + dx * k - 9 * Math.cos(ang - 0.45), cy + dy * k - 9 * Math.sin(ang - 0.45)); ctx.lineTo(cx + dx * k - 9 * Math.cos(ang + 0.45), cy + dy * k - 9 * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill();
          ctx.font = "600 11px 'IBM Plex Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, cx + dx * (k + 16), cy + dy * (k + 16));
        }
        vec(0, 1, W, COL.crim, "mg = " + num(W, 1));
        vec(-nx, -ny, R, COL.blue, "R = " + num(R, 1));
        if (Pf > 0) vec(ux, uy, Pf, COL.jade, "P = " + Pf);
        if (Math.abs(F) > 0.05) vec(F > 0 ? ux : -ux, F > 0 ? uy : -uy, Math.abs(F), COL.gold, "F = " + num(Math.abs(F), 1));
        ctx.fillStyle = COL.mute; ctx.font = "11px 'IBM Plex Mono', monospace"; ctx.textAlign = "left"; ctx.fillText("θ = " + th + "°", bx + 30, by - 8);
        read.innerHTML = "perpendicular: R = mg cos θ = " + num(W, 1) + " × cos " + th + "° = <b>" + num(R, 2) + " N</b> · μR = <b>" + num(Fmax, 2) + " N</b>" +
          "<br>along the slope: mg sin θ = " + num(down, 2) + " N down" + (Pf ? ", P = " + Pf + " N up" : "") + " ⇒ friction needed for rest = " + num(Math.abs(net), 2) + " N " + (Math.abs(net) <= Fmax ? "≤ μR" : "&gt; μR") +
          "<br><b>" + state + "</b> · friction " + num(Math.abs(F), 2) + " N " + fdir + (acc ? " · a = (P − mg sin θ ∓ μR)/m = <b>" + num(Math.abs(acc), 3) + " m/s²</b>" : "") +
          "<br><span style='color:var(--muted)'>On the point of sliding with P = 0: μ = tan θ = " + num(Math.tan(t), 3) + ". Friction opposes the motion that would otherwise happen.</span>";
      }
      draw();
    }
  });

  /* =================== MOMENTS BEAM =================== */
  KOS.sims.register({
    id: "moments-beam", title: "Beam on two supports — reactions & tipping", subject: "maths", ref: "S9.1",
    desc: "A beam rests on two supports with a load you can slide along it. Reactions are found by taking moments about each support; when a reaction hits zero the beam is on the point of tilting. Move the centre of mass to make the beam non-uniform.",
    mount: function (panel) {
      var L = 6, Wb = 30, cm = 3, sA = 1, sB = 4, load = 40, lx = 2.5, g = 9.8;
      var s1 = slider("beam mass (kg)", 5, 80, 5, Wb, function (v) { Wb = v; draw(); });
      var s2 = slider("centre of mass from A (m)", 0.5, 5.5, 0.1, cm, function (v) { cm = v; draw(); }, function (v) { return num(v, 1); });
      var s3 = slider("support C at (m)", 0, 5, 0.1, sA, function (v) { sA = v; draw(); }, function (v) { return num(v, 1); });
      var s4 = slider("support D at (m)", 1, 6, 0.1, sB, function (v) { sB = v; draw(); }, function (v) { return num(v, 1); });
      var s5 = slider("load (kg)", 0, 100, 5, load, function (v) { load = v; draw(); });
      var s6 = slider("load at (m)", 0, 6, 0.1, lx, function (v) { lx = v; draw(); }, function (v) { return num(v, 1); });
      panel.appendChild(el("div", { class: "lab-controls" }, [s1.node, s2.node, s3.node, s4.node, s5.node, s6.node]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 260);
      var read = readout(); panel.appendChild(read);
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var c = Math.min(sA, sB), d = Math.max(sA, sB);
        if (d - c < 0.2) d = c + 0.2;
        var W = Wb * g, Lw = load * g;
        /* moments about C: R_D (d − c) = W (cm − c) + Lw (lx − c) */
        var RD = (W * (cm - c) + Lw * (lx - c)) / (d - c), RC = W + Lw - RD;
        var x0 = 50, x1 = cv.W - 50, y = 120, sc = (x1 - x0) / L;
        function X(v) { return x0 + v * sc; }
        ctx.fillStyle = A(COL.text, .1); ctx.strokeStyle = COL.text; ctx.lineWidth = 1.5; ctx.fillRect(X(0), y - 8, X(L) - X(0), 16); ctx.strokeRect(X(0), y - 8, X(L) - X(0), 16);
        ctx.fillStyle = COL.mute; ctx.font = "11px 'IBM Plex Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText("A", X(0), y + 12); ctx.fillText("B", X(L), y + 12);
        [[c, RC, "C"], [d, RD, "D"]].forEach(function (s) {
          ctx.fillStyle = s[1] < -1e-6 ? COL.crim : COL.blue; ctx.beginPath(); ctx.moveTo(X(s[0]), y + 8); ctx.lineTo(X(s[0]) - 12, y + 34); ctx.lineTo(X(s[0]) + 12, y + 34); ctx.closePath(); ctx.fill();
          ctx.fillStyle = COL.text; ctx.textBaseline = "top"; ctx.fillText(s[2] + " · R = " + num(Math.max(0, s[1]), 1) + " N", X(s[0]), y + 38);
          if (s[1] > 0) { ctx.strokeStyle = COL.blue; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(s[0]), y - 10); ctx.lineTo(X(s[0]), y - 10 - Math.min(70, s[1] / 12)); ctx.stroke(); }
        });
        function down(xv, F, colr, lab) { ctx.strokeStyle = colr; ctx.fillStyle = colr; ctx.lineWidth = 2; var k = Math.min(70, F / 12); ctx.beginPath(); ctx.moveTo(X(xv), y - 10 - k); ctx.lineTo(X(xv), y - 10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X(xv), y - 8); ctx.lineTo(X(xv) - 5, y - 16); ctx.lineTo(X(xv) + 5, y - 16); ctx.closePath(); ctx.fill(); ctx.textBaseline = "bottom"; ctx.fillText(lab, X(xv), y - 12 - k); }
        down(cm, W, COL.crim, "W = " + num(W, 1));
        if (load > 0) down(lx, Lw, COL.gold, "load " + num(Lw, 1));
        var tilt = RC < -1e-6 ? "tilts about D (R_C would be negative — the beam lifts off C)" : RD < -1e-6 ? "tilts about C (R_D negative)" : Math.min(RC, RD) < 1 ? "on the point of tilting — one reaction is zero" : "in equilibrium";
        read.innerHTML = "M(C): R<sub>D</sub> × " + num(d - c, 1) + " = " + num(W, 1) + " × " + num(cm - c, 1) + " + " + num(Lw, 1) + " × " + num(lx - c, 1) + " ⇒ <b>R<sub>D</sub> = " + num(RD, 1) + " N</b>" +
          "<br>resolve ↑: R<sub>C</sub> + R<sub>D</sub> = " + num(W + Lw, 1) + " ⇒ <b>R<sub>C</sub> = " + num(RC, 1) + " N</b> (check by M(D))" +
          "<br><b style='color:" + (tilt.indexOf("tilts") === 0 ? "var(--danger)" : "var(--good)") + "'>" + tilt + "</b>" +
          "<br><span style='color:var(--muted)'>Tipping question: set the far reaction to zero and take moments about the near support to find where the load can reach.</span>";
      }
      draw();
    }
  });

})();
