/* Kurenai OS — labs/worked-extra.js
   Additional Worked Example generators, registered through KOS.worked.register
   (worked.js) so they appear in the Worked Example Engine and on their topic
   pages' Worked tab. Same contract as worked.js: inputs → validate → solve →
   ordered steps {h, m, n} with a one-line answer. */
(function () {
  "use strict";
  var W = KOS.worked;
  function fmt(x, dp) { if (!isFinite(x)) return String(x); var r = Math.round(x * 1e9) / 1e9; if (Number.isInteger(r)) return String(r); return dp !== undefined ? r.toFixed(dp) : String(r); }
  function sf(x, s) { if (!isFinite(x)) return "—"; if (x === 0) return "0"; return Number(x.toPrecision(s || 3)).toString(); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(Math.round(n), Math.round(d)); n /= g; d /= g; return d === 1 ? String(n) : n + "/" + d; }
  function sgn(x) { return x < 0 ? " − " + fmt(Math.abs(x)) : " + " + fmt(x); }
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)); var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x < 0 ? -y : y; }
  function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function PhiInv(p) { var lo = -8, hi = 8; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  var g = 9.8;
  function deg(r) { return r * 180 / Math.PI; }
  function rad(d) { return d * Math.PI / 180; }

  /* ---------------- PURE ---------------- */
  W.register({
    id: "trapezium", cat: "pure", subject: "maths", ref: "9.4",
    title: "Trapezium rule with a table of ordinates",
    blurb: "Estimate ∫ p(x) dx for a polynomial with n strips, set out as the mark scheme wants: h, the ordinate table, the bracket, then the estimate and its error.",
    inputs: [{ k: "poly", label: "p(x)", def: "x^2 + 1", type: "text", w: 170 }, { k: "a", label: "a", def: 0, type: "number" }, { k: "b", label: "b", def: 2, type: "number" }, { k: "n", label: "strips n", def: 4, type: "number" }],
    random: function () { return { poly: pick(["x^2 + 1", "x^3 - x + 2", "2x^2 - 3x + 4", "x^2 + 2x"]), a: ri(0, 2), b: ri(3, 6), n: pick([2, 4, 5, 6]) }; },
    validate: function (v) { if (!W.parsePoly(v.poly)) return "Could not read p(x) — use terms like 3x^2 - 2x + 1."; if (!(v.b > v.a)) return "Need b > a."; if (!(v.n >= 1 && v.n <= 12 && Number.isInteger(v.n))) return "n must be a whole number from 1 to 12."; },
    solve: function (v) {
      var P = W.parsePoly(v.poly), h = (v.b - v.a) / v.n, xs = [], ys = [];
      for (var i = 0; i <= v.n; i++) { xs.push(v.a + i * h); ys.push(W.polyEval(P, v.a + i * h)); }
      var inner = ys.slice(1, -1).reduce(function (s, y) { return s + y; }, 0);
      var T = h / 2 * (ys[0] + ys[v.n] + 2 * inner);
      var exact = P.reduce(function (s, t) { return s + t.c * (Math.pow(v.b, t.p + 1) - Math.pow(v.a, t.p + 1)) / (t.p + 1); }, 0);
      return { steps: [
        { h: "Find the strip width", m: "h = (b − a)/n = (" + fmt(v.b) + " − " + fmt(v.a) + ")/" + v.n + " = " + fmt(h, 4), n: "n strips means n + 1 ordinates." },
        { h: "Tabulate the ordinates", m: "x: " + xs.map(function (x) { return fmt(x, 3); }).join("   ") + "\ny: " + ys.map(function (y) { return fmt(y, 4); }).join("   "), n: "Keep at least 4 d.p. — rounding here is the usual lost accuracy mark." },
        { h: "Quote and fill the rule", m: "∫ ≈ h/2 [y₀ + yₙ + 2(y₁ + … + yₙ₋₁)]\n  = " + fmt(h / 2, 4) + " [" + fmt(ys[0], 4) + " + " + fmt(ys[v.n], 4) + " + 2(" + fmt(inner, 4) + ")]", n: "The bracket shape is the method mark." },
        { h: "Evaluate", m: "≈ " + fmt(T, 4) },
        { h: "Compare with the exact integral", m: "∫ p(x) dx = " + fmt(exact, 4) + "   error = " + fmt(T - exact, 4) + (T > exact ? "  (over-estimate: convex curve, chords above it)" : T < exact ? "  (under-estimate: concave curve, chords below it)" : ""), n: "Doubling n roughly quarters the error; a question may ask how to improve the estimate — 'use more strips'." }
      ], answer: "∫ ≈ " + fmt(T, 4) + " (exact " + fmt(exact, 4) + ")" };
    }
  }, ["maths:9.4", "maths:9.5"]);

  W.register({
    id: "chainrule", cat: "pure", subject: "maths", ref: "7.4",
    title: "Chain, product & quotient rules",
    blurb: "Differentiate a composite, a product or a quotient with the substitution written out — u, du/dx, then the rule quoted and applied.",
    inputs: [{ k: "form", label: "form", def: "(ax + b)^n", type: "select", opts: ["(ax + b)^n", "e^(kx)·x^m", "sin(kx)/x^m", "ln(ax + b)", "x^m·sin(kx)"] },
      { k: "a", label: "a (or k)", def: 3, type: "number" }, { k: "b", label: "b", def: -2, type: "number" }, { k: "n", label: "n (or m)", def: 4, type: "number" }],
    random: function () { return { form: pick(["(ax + b)^n", "e^(kx)·x^m", "sin(kx)/x^m", "ln(ax + b)", "x^m·sin(kx)"]), a: pick([2, 3, 4, 5, -2]), b: ri(-5, 5), n: pick([2, 3, 4, 5]) }; },
    validate: function (v) { if (v.a === 0) return "a (or k) must be non-zero."; if (v.n === 0) return "n (or m) must be non-zero."; },
    solve: function (v) {
      var a = v.a, b = v.b, n = v.n, s = [], ans;
      if (v.form === "(ax + b)^n") {
        s.push({ h: "Identify the inner function", m: "y = (" + fmt(a) + "x" + sgn(b) + ")^" + n + "\nlet u = " + fmt(a) + "x" + sgn(b) + ",  so y = u^" + n });
        s.push({ h: "Differentiate each layer", m: "du/dx = " + fmt(a) + "      dy/du = " + n + "u^" + (n - 1) });
        s.push({ h: "Chain rule", m: "dy/dx = dy/du × du/dx = " + n + "u^" + (n - 1) + " × " + fmt(a), n: "Quote the rule before substituting." });
        ans = fmt(n * a) + "(" + fmt(a) + "x" + sgn(b) + ")^" + (n - 1);
        s.push({ h: "Substitute back", m: "dy/dx = " + ans });
      } else if (v.form === "ln(ax + b)") {
        s.push({ h: "Identify the inner function", m: "y = ln(" + fmt(a) + "x" + sgn(b) + ")\nu = " + fmt(a) + "x" + sgn(b) + ",  y = ln u" });
        s.push({ h: "Differentiate each layer", m: "du/dx = " + fmt(a) + "      dy/du = 1/u" });
        ans = fmt(a) + "/(" + fmt(a) + "x" + sgn(b) + ")";
        s.push({ h: "Chain rule", m: "dy/dx = (1/u)(" + fmt(a) + ") = " + ans, n: "Pattern: d/dx ln(f(x)) = f′(x)/f(x)." });
      } else if (v.form === "e^(kx)·x^m") {
        s.push({ h: "Identify u and v", m: "y = x^" + n + " e^(" + fmt(a) + "x)\nu = x^" + n + "      v = e^(" + fmt(a) + "x)" });
        s.push({ h: "Differentiate each", m: "u′ = " + n + "x^" + (n - 1) + "      v′ = " + fmt(a) + "e^(" + fmt(a) + "x)" });
        s.push({ h: "Product rule", m: "dy/dx = u′v + uv′ = " + n + "x^" + (n - 1) + " e^(" + fmt(a) + "x) + " + fmt(a) + "x^" + n + " e^(" + fmt(a) + "x)" });
        ans = "x^" + (n - 1) + " e^(" + fmt(a) + "x)(" + n + sgn(a).replace(/\s/g, "") + "x)";
        s.push({ h: "Factorise", m: "dy/dx = " + ans, n: "Factorised form is what 'find where dy/dx = 0' needs: x = 0 or x = " + frac(-n, a) + "." });
      } else if (v.form === "x^m·sin(kx)") {
        s.push({ h: "Identify u and v", m: "y = x^" + n + " sin(" + fmt(a) + "x)\nu = x^" + n + "      v = sin(" + fmt(a) + "x)" });
        s.push({ h: "Differentiate each", m: "u′ = " + n + "x^" + (n - 1) + "      v′ = " + fmt(a) + "cos(" + fmt(a) + "x)   (chain rule inside)" });
        ans = n + "x^" + (n - 1) + " sin(" + fmt(a) + "x) + " + fmt(a) + "x^" + n + " cos(" + fmt(a) + "x)";
        s.push({ h: "Product rule", m: "dy/dx = u′v + uv′ = " + ans });
      } else {
        s.push({ h: "Identify u and v", m: "y = sin(" + fmt(a) + "x) / x^" + n + "\nu = sin(" + fmt(a) + "x)      v = x^" + n });
        s.push({ h: "Differentiate each", m: "u′ = " + fmt(a) + "cos(" + fmt(a) + "x)      v′ = " + n + "x^" + (n - 1) });
        s.push({ h: "Quotient rule", m: "dy/dx = (u′v − uv′)/v² = [" + fmt(a) + "x^" + n + " cos(" + fmt(a) + "x) − " + n + "x^" + (n - 1) + " sin(" + fmt(a) + "x)] / x^" + (2 * n), n: "Order matters: u′v first." });
        ans = "[" + fmt(a) + "x cos(" + fmt(a) + "x) − " + n + " sin(" + fmt(a) + "x)] / x^" + (n + 1);
        s.push({ h: "Simplify by cancelling x^" + (n - 1), m: "dy/dx = " + ans });
      }
      return { steps: s, answer: "dy/dx = " + ans };
    }
  }, ["maths:7.4", "maths:7.2"]);

  W.register({
    id: "circle", cat: "pure", subject: "maths", ref: "3.2",
    title: "Circle: centre & radius from the expanded form",
    blurb: "Complete the square on x² + y² + Dx + Ey + F = 0 to find the centre and radius, then test whether a given point lies inside, on or outside.",
    inputs: [{ k: "D", label: "D", def: -6, type: "number" }, { k: "E", label: "E", def: 4, type: "number" }, { k: "F", label: "F", def: -12, type: "number" }, { k: "px", label: "point x", def: 1, type: "number" }, { k: "py", label: "point y", def: 2, type: "number" }],
    random: function () { var a = ri(-5, 5), b = ri(-5, 5), r = ri(1, 6); return { D: -2 * a, E: -2 * b, F: a * a + b * b - r * r, px: ri(-6, 6), py: ri(-6, 6) }; },
    validate: function (v) { if (v.D * v.D / 4 + v.E * v.E / 4 - v.F <= 0) return "That is not a real circle: D²/4 + E²/4 − F must be positive."; },
    solve: function (v) {
      var a = -v.D / 2, b = -v.E / 2, r2 = a * a + b * b - v.F, r = Math.sqrt(r2);
      var d2 = Math.pow(v.px - a, 2) + Math.pow(v.py - b, 2);
      return { steps: [
        { h: "Group and complete the square", m: "x² " + sgn(v.D).trim() + "x + y² " + sgn(v.E).trim() + "y " + sgn(v.F).trim() + " = 0\n(x " + sgn(-a).trim() + ")² − " + fmt(a * a) + " + (y " + sgn(-b).trim() + ")² − " + fmt(b * b) + " " + sgn(v.F).trim() + " = 0", n: "Halve the coefficient, square it, subtract it." },
        { h: "Read off centre and radius", m: "(x " + sgn(-a).trim() + ")² + (y " + sgn(-b).trim() + ")² = " + fmt(r2) + "\ncentre (" + fmt(a) + ", " + fmt(b) + "),  r = √" + fmt(r2) + " = " + fmt(r, 3) },
        { h: "Test the point (" + fmt(v.px) + ", " + fmt(v.py) + ")", m: "(" + fmt(v.px) + " − " + fmt(a) + ")² + (" + fmt(v.py) + " − " + fmt(b) + ")² = " + fmt(d2) + (d2 < r2 ? " < " + fmt(r2) + "  → inside" : d2 > r2 ? " > " + fmt(r2) + "  → outside" : " = r²  → on the circle") },
        { h: "Tangent at a point on the circle", m: "gradient of radius = (y − " + fmt(b) + ")/(x − " + fmt(a) + ");  tangent gradient is its negative reciprocal", n: "The tangent is perpendicular to the radius — the standard follow-up." }
      ], answer: "centre (" + fmt(a) + ", " + fmt(b) + "), radius " + fmt(r, 3) };
    }
  }, ["maths:3.2"]);

  W.register({
    id: "line", cat: "pure", subject: "maths", ref: "3.1",
    title: "Straight line through two points, and its perpendicular bisector",
    blurb: "Gradient, equation in the form ax + by + c = 0, length, midpoint and the perpendicular bisector — the five things every coordinate-geometry part (a) asks for.",
    inputs: [{ k: "x1", label: "x₁", def: 1, type: "number" }, { k: "y1", label: "y₁", def: 2, type: "number" }, { k: "x2", label: "x₂", def: 5, type: "number" }, { k: "y2", label: "y₂", def: 8, type: "number" }],
    random: function () { var x1 = ri(-5, 5), x2 = ri(-6, 8); if (x2 === x1) x2 += 1; return { x1: x1, y1: ri(-5, 5), x2: x2, y2: ri(-6, 8) }; },
    validate: function (v) { if (v.x1 === v.x2 && v.y1 === v.y2) return "The two points must be different."; if (v.x1 === v.x2) return "Vertical line: x = " + v.x1 + " — pick points with different x for the general method."; },
    solve: function (v) {
      var m = (v.y2 - v.y1) / (v.x2 - v.x1), mx = (v.x1 + v.x2) / 2, my = (v.y1 + v.y2) / 2, len = Math.hypot(v.x2 - v.x1, v.y2 - v.y1);
      var dy = v.y2 - v.y1, dx = v.x2 - v.x1, gg = gcd(dy, dx); dy /= gg; dx /= gg;
      /* dy·x − dx·y + (dx·y1 − dy·x1) = 0 */
      var c = dx * v.y1 - dy * v.x1;
      var perp = m === 0 ? "x = " + fmt(mx) : "y − " + fmt(my) + " = " + frac(-dx, dy) + "(x − " + fmt(mx) + ")";
      return { steps: [
        { h: "Gradient", m: "m = (y₂ − y₁)/(x₂ − x₁) = (" + fmt(v.y2) + " − " + fmt(v.y1) + ")/(" + fmt(v.x2) + " − " + fmt(v.x1) + ") = " + frac(v.y2 - v.y1, v.x2 - v.x1) },
        { h: "Equation through (x₁, y₁)", m: "y − " + fmt(v.y1) + " = " + frac(dy, dx) + "(x − " + fmt(v.x1) + ")\n" + fmt(dy) + "x − " + fmt(dx) + "y " + sgn(c).trim() + " = 0", n: "'ax + by + c = 0 with integers' means clear the fraction and collect everything on one side." },
        { h: "Length and midpoint", m: "|AB| = √((" + fmt(dx * gg) + ")² + (" + fmt(dy * gg) + ")²) = √" + fmt(len * len) + " = " + fmt(len, 3) + "\nM = (" + fmt(mx) + ", " + fmt(my) + ")" },
        { h: "Perpendicular gradient", m: "m⊥ = −1/m = " + (m === 0 ? "no gradient — the perpendicular is vertical" : frac(-dx, dy)), n: "Product of gradients of perpendicular lines is −1." },
        { h: "Perpendicular bisector", m: perp, n: "Through the midpoint with the perpendicular gradient." }
      ], answer: fmt(dy) + "x − " + fmt(dx) + "y " + sgn(c).trim() + " = 0; bisector " + perp };
    }
  }, ["maths:3.1"]);

  W.register({
    id: "rform", cat: "pure", subject: "maths", ref: "5.6",
    title: "R cos(x − α) form: maximum, minimum & solving",
    blurb: "Write a cos x + b sin x as R cos(x − α), read off the maximum and minimum with where they occur, then solve a cos x + b sin x = c on 0° ≤ x < 360°.",
    inputs: [{ k: "a", label: "a (cos x)", def: 3, type: "number" }, { k: "b", label: "b (sin x)", def: 4, type: "number" }, { k: "c", label: "= c", def: 2, type: "number" }],
    random: function () { var a = ri(1, 7), b = ri(1, 7); return { a: a, b: b, c: ri(-Math.floor(Math.hypot(a, b)), Math.floor(Math.hypot(a, b))) }; },
    validate: function (v) { if (v.a <= 0 || v.b <= 0) return "Keep a and b positive for this template (α in the first quadrant)."; },
    solve: function (v) {
      var R = Math.hypot(v.a, v.b), al = deg(Math.atan2(v.b, v.a));
      var s = [
        { h: "Expand the target form", m: "R cos(x − α) = R cos α cos x + R sin α sin x\nso R cos α = " + fmt(v.a) + ",  R sin α = " + fmt(v.b) },
        { h: "Find R and α", m: "R = √(" + fmt(v.a) + "² + " + fmt(v.b) + "²) = √" + fmt(v.a * v.a + v.b * v.b) + " = " + fmt(R, 3) + "\ntan α = " + fmt(v.b) + "/" + fmt(v.a) + "  ⇒  α = " + fmt(al, 2) + "°", n: "R is always positive; α to 2 d.p. (or 3 s.f.)." },
        { h: "Maximum and minimum", m: "max " + fmt(R, 3) + " when cos(x − α) = 1, x = " + fmt(al, 1) + "°\nmin −" + fmt(R, 3) + " when x = " + fmt(al + 180, 1) + "°" }
      ];
      var sols = [];
      if (Math.abs(v.c) <= R) {
        var t = deg(Math.acos(v.c / R));
        [t, -t].forEach(function (k) { var x = ((al + k) % 360 + 360) % 360; sols.push(x); });
        sols.sort(function (p, q) { return p - q; });
        s.push({ h: "Solve " + fmt(v.a) + "cos x + " + fmt(v.b) + "sin x = " + fmt(v.c), m: fmt(R, 3) + " cos(x − " + fmt(al, 2) + "°) = " + fmt(v.c) + "\ncos(x − α) = " + fmt(v.c / R, 4) + "  ⇒  x − α = ±" + fmt(t, 2) + "° (+360°k)\nx = " + sols.map(function (x) { return fmt(x, 1) + "°"; }).join(", "), n: "Adjust the range for x − α before adding α back." });
      } else s.push({ h: "Solve", m: "|c| = " + fmt(Math.abs(v.c)) + " > R, so no solutions" });
      return { steps: s, answer: fmt(R, 3) + " cos(x − " + fmt(al, 2) + "°); " + (sols.length ? "x = " + sols.map(function (x) { return fmt(x, 1); }).join("°, ") + "°" : "no solutions") };
    }
  }, ["maths:5.6"]);

  W.register({
    id: "byparts", cat: "pure", subject: "maths", ref: "8.5",
    title: "Integration by parts",
    blurb: "∫ x·e^(kx), x·sin(kx), x·cos(kx) or xⁿ ln x — choose u and dv/dx with the LATE rule, quote the formula, integrate, then evaluate between limits.",
    inputs: [{ k: "form", label: "integrand", def: "x·e^(kx)", type: "select", opts: ["x·e^(kx)", "x·sin(kx)", "x·cos(kx)", "x^n·ln x"] }, { k: "k", label: "k (or n)", def: 2, type: "number" }, { k: "a", label: "lower limit", def: 0, type: "number" }, { k: "b", label: "upper limit", def: 1, type: "number" }],
    random: function () { var f = pick(["x·e^(kx)", "x·sin(kx)", "x·cos(kx)", "x^n·ln x"]); return { form: f, k: f === "x^n·ln x" ? ri(1, 4) : pick([1, 2, 3, -1]), a: f === "x^n·ln x" ? 1 : 0, b: f === "x^n·ln x" ? pick([2, 3, 4]) : pick([1, 2]) }; },
    validate: function (v) { if (v.k === 0) return "k must be non-zero."; if (v.form === "x^n·ln x" && v.a <= 0) return "ln x needs positive limits."; },
    solve: function (v) {
      var k = v.k, a = v.a, b = v.b, s = [], F, ans;
      if (v.form === "x·e^(kx)") {
        F = function (x) { return x * Math.exp(k * x) / k - Math.exp(k * x) / (k * k); };
        s.push({ h: "Choose u and dv/dx (LATE: Log, Algebra, Trig, Exp)", m: "u = x  →  du/dx = 1\ndv/dx = e^(" + fmt(k) + "x)  →  v = e^(" + fmt(k) + "x)/" + fmt(k) });
        s.push({ h: "Quote and apply ∫u dv = uv − ∫v du", m: "= x e^(" + fmt(k) + "x)/" + fmt(k) + " − ∫ e^(" + fmt(k) + "x)/" + fmt(k) + " dx\n= x e^(" + fmt(k) + "x)/" + fmt(k) + " − e^(" + fmt(k) + "x)/" + fmt(k * k) + " + c" });
        ans = "(x/" + fmt(k) + " − 1/" + fmt(k * k) + ") e^(" + fmt(k) + "x)";
      } else if (v.form === "x·sin(kx)") {
        F = function (x) { return -x * Math.cos(k * x) / k + Math.sin(k * x) / (k * k); };
        s.push({ h: "Choose u and dv/dx", m: "u = x  →  du/dx = 1\ndv/dx = sin(" + fmt(k) + "x)  →  v = −cos(" + fmt(k) + "x)/" + fmt(k) });
        s.push({ h: "Apply the formula", m: "= −x cos(" + fmt(k) + "x)/" + fmt(k) + " + ∫ cos(" + fmt(k) + "x)/" + fmt(k) + " dx\n= −x cos(" + fmt(k) + "x)/" + fmt(k) + " + sin(" + fmt(k) + "x)/" + fmt(k * k) + " + c", n: "Two sign changes — write the minus signs explicitly." });
        ans = "−x cos(" + fmt(k) + "x)/" + fmt(k) + " + sin(" + fmt(k) + "x)/" + fmt(k * k);
      } else if (v.form === "x·cos(kx)") {
        F = function (x) { return x * Math.sin(k * x) / k + Math.cos(k * x) / (k * k); };
        s.push({ h: "Choose u and dv/dx", m: "u = x  →  du/dx = 1\ndv/dx = cos(" + fmt(k) + "x)  →  v = sin(" + fmt(k) + "x)/" + fmt(k) });
        s.push({ h: "Apply the formula", m: "= x sin(" + fmt(k) + "x)/" + fmt(k) + " − ∫ sin(" + fmt(k) + "x)/" + fmt(k) + " dx\n= x sin(" + fmt(k) + "x)/" + fmt(k) + " + cos(" + fmt(k) + "x)/" + fmt(k * k) + " + c" });
        ans = "x sin(" + fmt(k) + "x)/" + fmt(k) + " + cos(" + fmt(k) + "x)/" + fmt(k * k);
      } else {
        var n = k;
        F = function (x) { return Math.pow(x, n + 1) * Math.log(x) / (n + 1) - Math.pow(x, n + 1) / ((n + 1) * (n + 1)); };
        s.push({ h: "Choose u and dv/dx (ln x must be u — it has no elementary integral)", m: "u = ln x  →  du/dx = 1/x\ndv/dx = x^" + n + "  →  v = x^" + (n + 1) + "/" + (n + 1) });
        s.push({ h: "Apply the formula", m: "= x^" + (n + 1) + " ln x/" + (n + 1) + " − ∫ x^" + (n + 1) + "/" + (n + 1) + " · 1/x dx\n= x^" + (n + 1) + " ln x/" + (n + 1) + " − x^" + (n + 1) + "/" + ((n + 1) * (n + 1)) + " + c" });
        ans = "x^" + (n + 1) + " ln x/" + (n + 1) + " − x^" + (n + 1) + "/" + ((n + 1) * (n + 1));
      }
      var val = F(b) - F(a);
      s.push({ h: "Evaluate between " + fmt(a) + " and " + fmt(b), m: "[" + ans + "] from " + fmt(a) + " to " + fmt(b) + "\n= " + fmt(F(b), 5) + " − (" + fmt(F(a), 5) + ") = " + fmt(val, 4), n: "Exam answers are usually exact (in terms of e, π or ln); this is the decimal check." });
      return { steps: s, answer: "∫ = " + ans + " + c;  definite value " + fmt(val, 4) };
    }
  }, ["maths:8.5"]);

  W.register({
    id: "iteration", cat: "pure", subject: "maths", ref: "9.2",
    title: "Iteration xₙ₊₁ = ⁿ√(a xₙ + b) with a change-of-sign check",
    blurb: "The exam's favourite rearrangement: show f(x) = xⁿ − ax − b = 0 rearranges to x = ⁿ√(ax + b), iterate from x₀, then confirm the root to the required accuracy with a sign change.",
    inputs: [{ k: "n", label: "root index n", def: 2, type: "number" }, { k: "a", label: "a", def: 3, type: "number" }, { k: "b", label: "b", def: 2, type: "number" }, { k: "x0", label: "x₀", def: 3, type: "number" }, { k: "its", label: "iterations", def: 4, type: "number" }],
    random: function () { return { n: pick([2, 3]), a: ri(1, 5), b: ri(1, 9), x0: ri(1, 4), its: pick([3, 4, 5]) }; },
    validate: function (v) { if (!(v.n === 2 || v.n === 3)) return "n must be 2 or 3."; if (v.its < 1 || v.its > 10) return "1–10 iterations."; if (v.n === 2 && v.a * v.x0 + v.b < 0) return "a·x₀ + b must be non-negative for a square root."; },
    solve: function (v) {
      var gfn = function (x) { var t = v.a * x + v.b; return v.n === 2 ? Math.sqrt(t) : Math.cbrt(t); }, f = function (x) { return Math.pow(x, v.n) - v.a * x - v.b; };
      var x = v.x0, lines = [];
      for (var i = 1; i <= v.its; i++) { x = gfn(x); lines.push("x" + i + " = " + (v.n === 2 ? "√" : "∛") + "(" + fmt(v.a) + "(" + fmt(i === 1 ? v.x0 : lines[i - 2].val, 4) + ")" + sgn(v.b).trim() + ") = " + fmt(x, 4)); lines[i - 1] = { val: x, txt: lines[i - 1] }; }
      var r = Math.round(x * 100) / 100, lo = r - 0.005, hi = r + 0.005;
      return { steps: [
        { h: "Show the rearrangement", m: "f(x) = x^" + v.n + " − " + fmt(v.a) + "x − " + fmt(v.b) + " = 0\nx^" + v.n + " = " + fmt(v.a) + "x + " + fmt(v.b) + "  ⇒  x = " + (v.n === 2 ? "√" : "∛") + "(" + fmt(v.a) + "x + " + fmt(v.b) + ")", n: "Every algebraic line must be shown — 'show that' means no jumps." },
        { h: "Iterate from x₀ = " + fmt(v.x0), m: lines.map(function (l) { return l.txt; }).join("\n"), n: "Write each xₙ to 4 d.p. even when the question asks for 3 — the last figure justifies the rounding." },
        { h: "Confirm the root to 2 d.p. with a change of sign", m: "f(" + fmt(lo, 3) + ") = " + fmt(f(lo), 4) + "   f(" + fmt(hi, 3) + ") = " + fmt(f(hi), 4) + (f(lo) * f(hi) < 0 ? "\nchange of sign and f continuous ⇒ root in [" + fmt(lo, 3) + ", " + fmt(hi, 3) + "] ⇒ α = " + fmt(r, 2) : "\nno sign change yet — iterate further"), n: "Use the interval that rounds to your answer, state 'change of sign' and 'f is continuous'." }
      ], answer: "α ≈ " + fmt(x, 4) + " (" + fmt(r, 2) + " to 2 d.p.)" };
    }
  }, ["maths:9.2", "maths:9.1"]);

  /* ---------------- STATISTICS ---------------- */
  W.register({
    id: "meansd", cat: "applied", subject: "maths", ref: "S2.3",
    title: "Mean & standard deviation from summary statistics (with coding)",
    blurb: "From n, Σy and Σy² of coded data y = (x − a)/b, find the mean and standard deviation of y, then decode to x — subtracting shifts the mean only, dividing scales both.",
    inputs: [{ k: "n", label: "n", def: 30, type: "number" }, { k: "sy", label: "Σy", def: 96, type: "number" }, { k: "syy", label: "Σy²", def: 1200, type: "number" }, { k: "a", label: "a (y = (x − a)/b)", def: 1010, type: "number" }, { k: "b", label: "b", def: 1, type: "number" }],
    random: function () { var n = pick([10, 12, 20, 25, 30]), m = ri(-10, 40); var sy = m * n + ri(-9, 9); var syy = Math.round(sy * sy / n + n * ri(4, 60)); return { n: n, sy: sy, syy: syy, a: pick([0, 100, 1000, 50]), b: pick([1, 1, 2, 5, 10]) }; },
    validate: function (v) { if (v.n <= 1) return "n must be at least 2."; if (v.b === 0) return "b must be non-zero."; if (v.syy / v.n - Math.pow(v.sy / v.n, 2) < 0) return "Σy² is too small for that Σy — the variance would be negative."; },
    solve: function (v) {
      var ym = v.sy / v.n, vy = v.syy / v.n - ym * ym, sy = Math.sqrt(vy), xm = v.a + v.b * ym, sx = Math.abs(v.b) * sy;
      return { steps: [
        { h: "Mean of the coded data", m: "ȳ = Σy/n = " + fmt(v.sy) + "/" + fmt(v.n) + " = " + fmt(ym, 4) },
        { h: "Standard deviation of the coded data", m: "σ_y = √(Σy²/n − ȳ²) = √(" + fmt(v.syy) + "/" + fmt(v.n) + " − " + fmt(ym, 4) + "²)\n    = √(" + fmt(v.syy / v.n, 4) + " − " + fmt(ym * ym, 4) + ") = √" + fmt(vy, 4) + " = " + fmt(sy, 4), n: "Quote the formula; the mark scheme accepts the n − 1 version if you say so." },
        { h: "Decode: x = a + by", m: "x̄ = " + fmt(v.a) + " + " + fmt(v.b) + " × " + fmt(ym, 4) + " = " + fmt(xm, 4) + "\nσ_x = |b| σ_y = " + fmt(Math.abs(v.b)) + " × " + fmt(sy, 4) + " = " + fmt(sx, 4), n: "Adding a does not change the spread; multiplying by b scales it." }
      ], answer: "x̄ = " + fmt(xm, 3) + ", σ = " + fmt(sx, 3) };
    }
  }, ["maths:S2.3"]);

  W.register({
    id: "interp", cat: "applied", subject: "maths", ref: "S2.3",
    title: "Linear interpolation for a median or quartile",
    blurb: "Given the class containing the required position, interpolate: lower bound + (position − cf before)/(class frequency) × class width. Edexcel uses n/2, n/4 and 3n/4 without the +½.",
    inputs: [{ k: "which", label: "statistic", def: "median (n/2)", type: "select", opts: ["median (n/2)", "Q1 (n/4)", "Q3 (3n/4)"] }, { k: "n", label: "n", def: 60, type: "number" }, { k: "L", label: "class lower bound", def: 10, type: "number" }, { k: "w", label: "class width", def: 10, type: "number" }, { k: "cf", label: "cf before class", def: 22, type: "number" }, { k: "f", label: "class frequency", def: 22, type: "number" }],
    random: function () { var n = pick([40, 60, 80, 100]), which = pick(["median (n/2)", "Q1 (n/4)", "Q3 (3n/4)"]); var pos = which[0] === "m" ? n / 2 : which[1] === "1" ? n / 4 : 3 * n / 4; var f = ri(8, 25), cf = pos - ri(1, f - 1); return { which: which, n: n, L: pick([5, 10, 20, 30]), w: pick([5, 10, 20]), cf: cf, f: f }; },
    validate: function (v) { var pos = v.which[0] === "m" ? v.n / 2 : v.which[1] === "1" ? v.n / 4 : 3 * v.n / 4; if (pos < v.cf || pos > v.cf + v.f) return "Position " + fmt(pos) + " is not inside that class (cf " + v.cf + " to " + (v.cf + v.f) + ")."; if (v.f <= 0 || v.w <= 0) return "Frequency and width must be positive."; },
    solve: function (v) {
      var pos = v.which[0] === "m" ? v.n / 2 : v.which[1] === "1" ? v.n / 4 : 3 * v.n / 4;
      var val = v.L + (pos - v.cf) / v.f * v.w;
      return { steps: [
        { h: "Locate the position", m: v.which + " → position " + fmt(pos) + " of " + fmt(v.n) + "\ncumulative frequency before the class = " + fmt(v.cf) + ", class frequency = " + fmt(v.f) + " → it lies in this class" },
        { h: "Set up the proportion", m: "(value − " + fmt(v.L) + ")/" + fmt(v.w) + " = (" + fmt(pos) + " − " + fmt(v.cf) + ")/" + fmt(v.f), n: "Assumes values are evenly spread through the class — say so if asked for an assumption." },
        { h: "Solve", m: "value = " + fmt(v.L) + " + " + fmt(pos - v.cf) + "/" + fmt(v.f) + " × " + fmt(v.w) + " = " + fmt(val, 3) }
      ], answer: v.which.split(" ")[0] + " ≈ " + fmt(val, 3) };
    }
  }, ["maths:S2.3", "maths:S2.1"]);

  W.register({
    id: "outliers", cat: "applied", subject: "maths", ref: "S2.4",
    title: "Outliers by the quartile rule",
    blurb: "Fences at Q₁ − k×IQR and Q₃ + k×IQR, then classify a list of suspect values and say what the box plot should show.",
    inputs: [{ k: "q1", label: "Q₁", def: 8, type: "number" }, { k: "q3", label: "Q₃", def: 17, type: "number" }, { k: "k", label: "k", def: 1.5, type: "number", step: "0.5" }, { k: "vals", label: "values to test (comma-separated)", def: "3, 28, 32, -4", type: "text", w: 200 }],
    random: function () { var q1 = ri(5, 30), iqr = ri(4, 15); return { q1: q1, q3: q1 + iqr, k: pick([1, 1.5, 2]), vals: [q1 - ri(0, 3 * iqr), q1 + iqr + ri(0, 3 * iqr), q1 + iqr + ri(0, 2 * iqr)].join(", ") }; },
    validate: function (v) { if (v.q3 <= v.q1) return "Q₃ must exceed Q₁."; if (!/^[\s\d.,+-]+$/.test(v.vals)) return "List numbers separated by commas."; },
    solve: function (v) {
      var iqr = v.q3 - v.q1, lo = v.q1 - v.k * iqr, hi = v.q3 + v.k * iqr;
      var vals = v.vals.split(",").map(function (s) { return parseFloat(s); }).filter(function (x) { return isFinite(x); });
      var outs = vals.filter(function (x) { return x < lo || x > hi; });
      return { steps: [
        { h: "Interquartile range", m: "IQR = Q₃ − Q₁ = " + fmt(v.q3) + " − " + fmt(v.q1) + " = " + fmt(iqr) },
        { h: "Fences", m: "lower: " + fmt(v.q1) + " − " + fmt(v.k) + " × " + fmt(iqr) + " = " + fmt(lo) + "\nupper: " + fmt(v.q3) + " + " + fmt(v.k) + " × " + fmt(iqr) + " = " + fmt(hi), n: "Calculate BOTH fences even if only one side has suspects — it is a mark." },
        { h: "Classify", m: vals.map(function (x) { return fmt(x) + ": " + (x < lo ? "< " + fmt(lo) + " → outlier" : x > hi ? "> " + fmt(hi) + " → outlier" : "inside → not an outlier"); }).join("\n") },
        { h: "On the box plot", m: outs.length ? "mark " + outs.map(fmt).join(", ") + " with crosses; draw the whisker to the largest/smallest value that is NOT an outlier" : "no outliers — whiskers reach the min and max", n: "Remove an outlier only if it is an error; a genuine extreme value stays in the data." }
      ], answer: outs.length ? "outliers: " + outs.map(fmt).join(", ") : "no outliers" };
    }
  }, ["maths:S2.4"]);

  W.register({
    id: "condprob", cat: "applied", subject: "maths", ref: "S3.2",
    title: "Two events: union, conditional, independence, mutual exclusivity",
    blurb: "From P(A), P(B) and P(A ∩ B): fill the Venn regions, then find P(A ∪ B), P(A | B), P(B | A), P(A | B′) and test both independence and mutual exclusivity with numbers.",
    inputs: [{ k: "pa", label: "P(A)", def: 0.6, type: "number", step: "0.01" }, { k: "pb", label: "P(B)", def: 0.2, type: "number", step: "0.01" }, { k: "pab", label: "P(A ∩ B)", def: 0.12, type: "number", step: "0.01" }],
    random: function () { var a = ri(2, 7) / 10, b = ri(2, 7) / 10; var lo = Math.max(0, Math.round((a + b - 1) * 100)), hi = Math.round(Math.min(a, b) * 100); return { pa: a, pb: b, pab: ri(lo, hi) / 100 }; },
    validate: function (v) { if (v.pa < 0 || v.pa > 1 || v.pb < 0 || v.pb > 1) return "Probabilities must be between 0 and 1."; if (v.pab > Math.min(v.pa, v.pb) + 1e-9 || v.pab < 0) return "P(A ∩ B) cannot exceed P(A) or P(B)."; if (v.pa + v.pb - v.pab > 1 + 1e-9) return "P(A ∪ B) would exceed 1."; },
    solve: function (v) {
      var un = v.pa + v.pb - v.pab, aOnly = v.pa - v.pab, bOnly = v.pb - v.pab, none = 1 - un;
      var ind = Math.abs(v.pa * v.pb - v.pab) < 1e-9, me = Math.abs(v.pab) < 1e-9;
      return { steps: [
        { h: "Venn regions", m: "A only = " + fmt(aOnly, 4) + "   A ∩ B = " + fmt(v.pab, 4) + "   B only = " + fmt(bOnly, 4) + "   neither = " + fmt(none, 4), n: "Regions must total 1." },
        { h: "Union", m: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = " + fmt(v.pa) + " + " + fmt(v.pb) + " − " + fmt(v.pab) + " = " + fmt(un, 4) },
        { h: "Conditional probabilities", m: "P(A | B) = P(A ∩ B)/P(B) = " + fmt(v.pab) + "/" + fmt(v.pb) + " = " + (v.pb ? fmt(v.pab / v.pb, 4) : "undefined") + "\nP(B | A) = " + fmt(v.pab) + "/" + fmt(v.pa) + " = " + (v.pa ? fmt(v.pab / v.pa, 4) : "undefined") + "\nP(A | B′) = P(A ∩ B′)/P(B′) = " + fmt(aOnly, 4) + "/" + fmt(1 - v.pb, 4) + " = " + (v.pb < 1 ? fmt(aOnly / (1 - v.pb), 4) : "undefined"), n: "Restrict the sample space to the condition — the denominator is the whole of that event." },
        { h: "Independence test", m: "P(A) × P(B) = " + fmt(v.pa * v.pb, 4) + (ind ? " = P(A ∩ B) → independent" : " ≠ P(A ∩ B) = " + fmt(v.pab, 4) + " → NOT independent") },
        { h: "Mutually exclusive?", m: me ? "P(A ∩ B) = 0 → mutually exclusive" : "P(A ∩ B) = " + fmt(v.pab) + " ≠ 0 → not mutually exclusive", n: "Mutually exclusive events with non-zero probabilities can never be independent." }
      ], answer: "P(A ∪ B) = " + fmt(un, 4) + "; P(A|B) = " + (v.pb ? fmt(v.pab / v.pb, 4) : "—") + "; " + (ind ? "independent" : "not independent") };
    }
  }, ["maths:S3.2", "maths:S3.1"]);

  var RTAB = { 4: [0.8, 0.9, 0.95, 0.98, 0.99], 5: [0.687, 0.8054, 0.8783, 0.9343, 0.9587], 6: [0.6084, 0.7293, 0.8114, 0.8822, 0.9172], 7: [0.5509, 0.6694, 0.7545, 0.8329, 0.8745], 8: [0.5067, 0.6215, 0.7067, 0.7887, 0.8343], 9: [0.4716, 0.5822, 0.6664, 0.7498, 0.7977], 10: [0.4428, 0.5494, 0.6319, 0.7155, 0.7646], 11: [0.4187, 0.5214, 0.6021, 0.6851, 0.7348], 12: [0.3981, 0.4973, 0.576, 0.6581, 0.7079], 13: [0.3802, 0.4762, 0.5529, 0.6339, 0.6835], 14: [0.3646, 0.4575, 0.5324, 0.612, 0.6614], 15: [0.3507, 0.4409, 0.514, 0.5923, 0.6411], 16: [0.3383, 0.4259, 0.4973, 0.5742, 0.6226], 17: [0.3271, 0.4124, 0.4821, 0.5577, 0.6055], 18: [0.317, 0.4, 0.4683, 0.5425, 0.5897], 19: [0.3077, 0.3887, 0.4555, 0.5285, 0.5751], 20: [0.2992, 0.3783, 0.4438, 0.5155, 0.5614], 25: [0.2653, 0.3365, 0.3961, 0.4622, 0.5052], 30: [0.2407, 0.3061, 0.361, 0.4226, 0.4629], 40: [0.207, 0.2638, 0.312, 0.3665, 0.4026], 50: [0.1843, 0.2353, 0.2787, 0.3281, 0.361], 60: [0.1678, 0.2144, 0.2542, 0.2997, 0.3301] };
  var RLEV = [0.1, 0.05, 0.025, 0.01, 0.005];
  W.register({
    id: "pmcctest", cat: "applied", subject: "maths", ref: "S5.1",
    title: "Hypothesis test for correlation (PMCC)",
    blurb: "Test whether a sample correlation coefficient r gives evidence of correlation in the population: hypotheses in ρ, the table critical value for n, comparison, and the conclusion in context words.",
    inputs: [{ k: "r", label: "r", def: -0.915, type: "number", step: "0.001" }, { k: "n", label: "n", def: 8, type: "number" }, { k: "tail", label: "H₁", def: "ρ < 0", type: "select", opts: ["ρ < 0", "ρ > 0", "ρ ≠ 0"] }, { k: "lvl", label: "level", def: "5%", type: "select", opts: ["10%", "5%", "1%"] }],
    random: function () { return { r: Math.round((Math.random() * 1.6 - 0.8) * 1000) / 1000, n: pick([6, 8, 10, 12, 15, 20, 25, 30]), tail: pick(["ρ < 0", "ρ > 0", "ρ ≠ 0"]), lvl: pick(["10%", "5%", "1%"]) }; },
    validate: function (v) { if (Math.abs(v.r) > 1) return "|r| cannot exceed 1."; if (v.n < 4) return "Need n ≥ 4."; },
    solve: function (v) {
      var lvl = parseFloat(v.lvl) / 100, two = v.tail === "ρ ≠ 0", tailLvl = two ? lvl / 2 : lvl;
      var keys = Object.keys(RTAB).map(Number).sort(function (a, b) { return a - b; }), n = v.n;
      var use = keys.filter(function (k) { return k <= n; }).pop() || 4;
      var cv = RTAB[use][RLEV.indexOf(tailLvl)];
      var sig = v.tail === "ρ < 0" ? v.r < -cv : v.tail === "ρ > 0" ? v.r > cv : Math.abs(v.r) > cv;
      return { steps: [
        { h: "Hypotheses", m: "H₀: ρ = 0    H₁: " + v.tail, n: "ρ is the population correlation; r is the sample statistic." },
        { h: "Critical value from the PMCC table", m: "n = " + n + (use !== n ? " (nearest tabulated n = " + use + ")" : "") + ", " + (two ? "two-tailed so " + fmt(tailLvl * 100, 1) + "% in each tail" : "one-tailed " + v.lvl) + "\ncritical value = " + (v.tail === "ρ < 0" ? "−" : two ? "±" : "") + fmt(cv, 4) },
        { h: "Compare", m: "r = " + fmt(v.r, 4) + (sig ? " lies in the critical region" : " does not lie in the critical region") + "  (" + (two ? "|r| = " + fmt(Math.abs(v.r), 4) : "r") + (sig ? " beyond " : " within ") + fmt(cv, 4) + ")" },
        { h: "Conclusion", m: sig ? "Reject H₀. There is evidence at the " + v.lvl + " level of " + (v.tail === "ρ < 0" ? "negative" : v.tail === "ρ > 0" ? "positive" : "") + " correlation between the two variables." : "Do not reject H₀. Insufficient evidence at the " + v.lvl + " level of " + (v.tail === "ρ < 0" ? "negative" : v.tail === "ρ > 0" ? "positive" : "") + " correlation.", n: "Name the variables in the last sentence — that is the context mark." }
      ], answer: (sig ? "reject H₀" : "do not reject H₀") + " (cv " + fmt(cv, 4) + ")" };
    }
  }, ["maths:S5.1", "maths:S2.2"]);

  W.register({
    id: "normtest", cat: "applied", subject: "maths", ref: "S5.3",
    title: "Hypothesis test for the mean of a normal distribution",
    blurb: "With σ known: distribution of the sample mean, test statistic z, p-value or critical value, and a conclusion in context — plus the critical sample-mean boundary examiners often ask for.",
    inputs: [{ k: "mu", label: "μ₀ (H₀)", def: 10, type: "number" }, { k: "sg", label: "σ", def: 3, type: "number" }, { k: "n", label: "n", def: 20, type: "number" }, { k: "xb", label: "x̄", def: 11.5, type: "number", step: "0.1" }, { k: "tail", label: "H₁", def: "μ > μ₀", type: "select", opts: ["μ > μ₀", "μ < μ₀", "μ ≠ μ₀"] }, { k: "lvl", label: "level", def: "5%", type: "select", opts: ["10%", "5%", "1%"] }],
    random: function () { var mu = ri(20, 200), sg = ri(2, 20), n = pick([10, 16, 25, 36, 50]); return { mu: mu, sg: sg, n: n, xb: Math.round((mu + (Math.random() * 6 - 3) * sg / Math.sqrt(n)) * 10) / 10, tail: pick(["μ > μ₀", "μ < μ₀", "μ ≠ μ₀"]), lvl: pick(["10%", "5%", "1%"]) }; },
    validate: function (v) { if (v.sg <= 0 || v.n < 1) return "σ and n must be positive."; },
    solve: function (v) {
      var se = v.sg / Math.sqrt(v.n), z = (v.xb - v.mu) / se, lvl = parseFloat(v.lvl) / 100, two = v.tail === "μ ≠ μ₀";
      var p = v.tail === "μ > μ₀" ? 1 - Phi(z) : v.tail === "μ < μ₀" ? Phi(z) : 2 * (1 - Phi(Math.abs(z)));
      var zc = PhiInv(1 - (two ? lvl / 2 : lvl)), sig = p < lvl;
      var cvx = v.tail === "μ > μ₀" ? v.mu + zc * se : v.tail === "μ < μ₀" ? v.mu - zc * se : null;
      return { steps: [
        { h: "Hypotheses", m: "H₀: μ = " + fmt(v.mu) + "    H₁: " + v.tail.replace("μ₀", fmt(v.mu)) },
        { h: "Distribution of the sample mean", m: "X̄ ~ N(" + fmt(v.mu) + ", " + fmt(v.sg) + "²/" + fmt(v.n) + ") = N(" + fmt(v.mu) + ", " + fmt(se * se, 4) + ")", n: "Stating this distribution is a mark on its own." },
        { h: "Test statistic", m: "z = (x̄ − μ)/(σ/√n) = (" + fmt(v.xb) + " − " + fmt(v.mu) + ")/(" + fmt(v.sg) + "/√" + fmt(v.n) + ") = " + fmt(z, 4) },
        { h: "p-value and critical value", m: "p = " + fmt(p, 4) + "   critical z = " + (two ? "±" : v.tail === "μ < μ₀" ? "−" : "") + fmt(zc, 4) + (cvx !== null ? "\ncritical value of x̄ = " + fmt(v.mu) + " " + (v.tail === "μ > μ₀" ? "+" : "−") + " " + fmt(zc, 4) + " × " + fmt(se, 4) + " = " + fmt(cvx, 4) : "") },
        { h: "Conclusion", m: (sig ? "p < " + v.lvl + " → reject H₀: evidence that the mean has " + (v.tail === "μ > μ₀" ? "increased" : v.tail === "μ < μ₀" ? "decreased" : "changed") : "p > " + v.lvl + " → do not reject H₀: insufficient evidence that the mean has " + (v.tail === "μ > μ₀" ? "increased" : v.tail === "μ < μ₀" ? "decreased" : "changed")), n: "Assumption: σ is unchanged; the sample is random." }
      ], answer: "z = " + fmt(z, 3) + ", p = " + fmt(p, 4) + " → " + (sig ? "reject H₀" : "do not reject H₀") };
    }
  }, ["maths:S5.3"]);

  W.register({
    id: "normparams", cat: "applied", subject: "maths", ref: "S4.2",
    title: "Find μ and σ from two probability statements",
    blurb: "P(X < x₁) = p₁ and P(X < x₂) = p₂ give two z-equations; solve them simultaneously for μ and σ with the inverse-normal values quoted to 4 d.p.",
    inputs: [{ k: "x1", label: "x₁", def: 160, type: "number" }, { k: "p1", label: "P(X < x₁)", def: 0.4, type: "number", step: "0.01" }, { k: "x2", label: "x₂", def: 170, type: "number" }, { k: "p2", label: "P(X < x₂)", def: 0.85, type: "number", step: "0.01" }],
    random: function () { var mu = ri(20, 200), sg = ri(2, 15); var z1 = pick([-1.5, -1, -0.5, 0.25]), z2 = pick([0.5, 1, 1.5, 2]); return { x1: Math.round(mu + z1 * sg), p1: Math.round(Phi(z1) * 100) / 100, x2: Math.round(mu + z2 * sg), p2: Math.round(Phi(z2) * 100) / 100 }; },
    validate: function (v) { if (v.p1 <= 0 || v.p1 >= 1 || v.p2 <= 0 || v.p2 >= 1) return "Probabilities must be strictly between 0 and 1."; if ((v.x2 - v.x1) * (v.p2 - v.p1) <= 0) return "The larger x must have the larger probability."; },
    solve: function (v) {
      var z1 = PhiInv(v.p1), z2 = PhiInv(v.p2), sg = (v.x2 - v.x1) / (z2 - z1), mu = v.x1 - z1 * sg;
      return { steps: [
        { h: "Standardise each statement", m: "P(Z < (" + fmt(v.x1) + " − μ)/σ) = " + fmt(v.p1) + "  ⇒  (" + fmt(v.x1) + " − μ)/σ = " + fmt(z1, 4) + "\nP(Z < (" + fmt(v.x2) + " − μ)/σ) = " + fmt(v.p2) + "  ⇒  (" + fmt(v.x2) + " − μ)/σ = " + fmt(z2, 4), n: "Inverse normal on the calculator; quote z to 4 d.p. (accuracy is marked)." },
        { h: "Two linear equations", m: fmt(v.x1) + " = μ + " + fmt(z1, 4) + "σ\n" + fmt(v.x2) + " = μ + " + fmt(z2, 4) + "σ" },
        { h: "Subtract to find σ", m: fmt(v.x2 - v.x1) + " = " + fmt(z2 - z1, 4) + "σ  ⇒  σ = " + fmt(sg, 4) },
        { h: "Back-substitute for μ", m: "μ = " + fmt(v.x1) + " − " + fmt(z1, 4) + " × " + fmt(sg, 4) + " = " + fmt(mu, 4) }
      ], answer: "μ = " + fmt(mu, 3) + ", σ = " + fmt(sg, 3) };
    }
  }, ["maths:S4.2"]);

  /* ---------------- MECHANICS ---------------- */
  W.register({
    id: "projectile", cat: "applied", subject: "maths", ref: "S7.5",
    title: "Projectile from a height: flight time, range, greatest height, impact speed",
    blurb: "Resolve U at angle α, then run the four standard parts with the suvat line for each — including the quadratic in T when the launch point is above the landing level.",
    inputs: [{ k: "U", label: "U (m/s)", def: 14, type: "number" }, { k: "ang", label: "α (°)", def: 36.87, type: "number", step: "0.01" }, { k: "h", label: "launch height (m)", def: 44.8, type: "number", step: "0.1" }],
    random: function () { return { U: ri(10, 40), ang: pick([30, 40, 45, 53.13, 60]), h: pick([0, 0, 10, 20, 45]) }; },
    validate: function (v) { if (v.U <= 0 || v.ang <= 0 || v.ang >= 90 || v.h < 0) return "Need U > 0, 0 < α < 90 and h ≥ 0."; },
    solve: function (v) {
      var a = rad(v.ang), ux = v.U * Math.cos(a), uy = v.U * Math.sin(a);
      var T = (uy + Math.sqrt(uy * uy + 2 * g * v.h)) / g, R = ux * T, H = uy * uy / (2 * g), vy = Math.sqrt(uy * uy + 2 * g * v.h);
      return { steps: [
        { h: "Resolve the initial velocity", m: "uₓ = U cos α = " + fmt(v.U) + " cos " + fmt(v.ang) + "° = " + fmt(ux, 3) + "\nu_y = U sin α = " + fmt(v.U) + " sin " + fmt(v.ang) + "° = " + fmt(uy, 3), n: "Horizontal: constant velocity. Vertical: a = −9.8 (up positive)." },
        { h: "Time of flight (vertical, s = −h)", m: "−" + fmt(v.h) + " = " + fmt(uy, 3) + "T − 4.9T²\n4.9T² − " + fmt(uy, 3) + "T − " + fmt(v.h) + " = 0  ⇒  T = " + fmt(T, 3) + " s", n: "Reject the negative root." },
        { h: "Range (horizontal)", m: "R = uₓT = " + fmt(ux, 3) + " × " + fmt(T, 3) + " = " + fmt(R, 2) + " m" },
        { h: "Greatest height (v_y = 0)", m: "0 = u_y² − 2g s  ⇒  s = " + fmt(uy, 3) + "²/19.6 = " + fmt(H, 3) + " m above the launch point\n= " + fmt(H + v.h, 2) + " m above the landing level, at t = u_y/g = " + fmt(uy / g, 3) + " s" },
        { h: "Speed on impact", m: "v_y² = u_y² + 2g h = " + fmt(uy * uy, 3) + " + " + fmt(2 * g * v.h, 3) + "  ⇒  v_y = " + fmt(vy, 3) + "\nspeed = √(uₓ² + v_y²) = " + fmt(Math.hypot(ux, vy), 3) + " m/s", n: "Direction: tan θ = v_y/uₓ below the horizontal." }
      ], answer: "T = " + fmt(T, 2) + " s, range " + fmt(R, 1) + " m, max height " + fmt(H + v.h, 1) + " m, impact speed " + fmt(Math.hypot(ux, vy), 1) + " m/s" };
    }
  }, ["maths:S7.5"]);

  W.register({
    id: "pulley", cat: "applied", subject: "maths", ref: "S8.4",
    title: "Connected particles over a pulley (table & hanging mass)",
    blurb: "Particle A on a horizontal table (smooth or rough) connected over a smooth pulley to hanging B: an equation of motion for each, add to find a, back-substitute for T, then the force on the pulley.",
    inputs: [{ k: "mA", label: "m_A on table (kg)", def: 3, type: "number", step: "0.1" }, { k: "mB", label: "m_B hanging (kg)", def: 2, type: "number", step: "0.1" }, { k: "mu", label: "μ (0 = smooth)", def: 0, type: "number", step: "0.05" }],
    random: function () { var mA = ri(2, 8), mu = pick([0, 0, 0.2, 0.25, 0.4]); return { mA: mA, mB: ri(Math.ceil(mu * mA) + 1, Math.ceil(mu * mA) + 6), mu: mu }; },
    validate: function (v) { if (v.mA <= 0 || v.mB <= 0) return "Masses must be positive."; if (v.mu < 0) return "μ cannot be negative."; if (v.mB * g <= v.mu * v.mA * g) return "μ m_A g ≥ m_B g — friction holds the system at rest; reduce μ or increase m_B."; },
    solve: function (v) {
      var F = v.mu * v.mA * g, a = (v.mB * g - F) / (v.mA + v.mB), T = v.mA * a + F;
      return { steps: [
        { h: "Forces", m: "B: weight " + fmt(v.mB) + "g = " + fmt(v.mB * g, 2) + " N down, tension T up\nA: tension T along the table" + (v.mu ? ", friction F = μR = " + fmt(v.mu) + " × " + fmt(v.mA * g, 2) + " = " + fmt(F, 2) + " N opposing motion" : ", smooth so no friction") + "; R = " + fmt(v.mA) + "g vertically", n: "Light inextensible string: same T throughout, same a for both." },
        { h: "Equation of motion for each particle", m: "B (down):  " + fmt(v.mB) + "g − T = " + fmt(v.mB) + "a\nA (along):  T" + (v.mu ? " − " + fmt(F, 2) : "") + " = " + fmt(v.mA) + "a", n: "Two separate equations score the marks; the whole-system equation alone does not give T." },
        { h: "Add to eliminate T", m: fmt(v.mB * g, 2) + (v.mu ? " − " + fmt(F, 2) : "") + " = " + fmt(v.mA + v.mB) + "a  ⇒  a = " + fmt(a, 3) + " m/s²" },
        { h: "Tension", m: "T = " + fmt(v.mA) + " × " + fmt(a, 3) + (v.mu ? " + " + fmt(F, 2) : "") + " = " + fmt(T, 2) + " N" },
        { h: "Force on the pulley", m: "two perpendicular tensions: √(T² + T²) = T√2 = " + fmt(T * Math.SQRT2, 2) + " N at 45° below the horizontal", n: "For two vertical strands (both particles hanging) it is simply 2T." }
      ], answer: "a = " + fmt(a, 3) + " m/s², T = " + fmt(T, 2) + " N" };
    }
  }, ["maths:S8.4", "maths:S8.2"]);

  W.register({
    id: "incline", cat: "applied", subject: "maths", ref: "S8.6",
    title: "Particle on a rough inclined plane",
    blurb: "Resolve perpendicular for R, along the slope for the net force, decide whether friction can hold the particle, then find the acceleration or state limiting equilibrium.",
    inputs: [{ k: "m", label: "mass (kg)", def: 5, type: "number", step: "0.5" }, { k: "th", label: "θ (°)", def: 30, type: "number" }, { k: "mu", label: "μ", def: 0.4, type: "number", step: "0.05" }, { k: "P", label: "force up the slope (N)", def: 0, type: "number" }],
    random: function () { return { m: ri(2, 10), th: pick([20, 25, 30, 35, 40, 45]), mu: pick([0.2, 0.25, 0.3, 0.4, 0.5]), P: pick([0, 0, 20, 40, 60]) }; },
    validate: function (v) { if (v.m <= 0 || v.th <= 0 || v.th >= 90 || v.mu < 0) return "Need m > 0, 0 < θ < 90, μ ≥ 0."; },
    solve: function (v) {
      var t = rad(v.th), Wt = v.m * g, R = Wt * Math.cos(t), down = Wt * Math.sin(t), net = v.P - down, Fmax = v.mu * R;
      var steps = [
        { h: "Resolve perpendicular to the plane", m: "R = mg cos θ = " + fmt(Wt, 2) + " cos " + fmt(v.th) + "° = " + fmt(R, 3) + " N", n: "No acceleration perpendicular to the plane." },
        { h: "Resolve along the plane (without friction)", m: "weight component down the slope: mg sin θ = " + fmt(down, 3) + " N" + (v.P ? "\napplied force up the slope: " + fmt(v.P) + " N" : "") + "\nnet (up positive) = " + fmt(net, 3) + " N" },
        { h: "Maximum friction available", m: "μR = " + fmt(v.mu) + " × " + fmt(R, 3) + " = " + fmt(Fmax, 3) + " N" }
      ], ans;
      if (Math.abs(net) <= Fmax + 1e-9) {
        steps.push({ h: "Compare", m: "|net| = " + fmt(Math.abs(net), 3) + " ≤ μR, so friction " + fmt(Math.abs(net), 3) + " N acting " + (net > 0 ? "down" : "up") + " the slope holds it: " + (Math.abs(Math.abs(net) - Fmax) < 1e-6 ? "limiting equilibrium" : "equilibrium, not limiting"), n: "At rest, F takes only what is needed — do not write F = μR unless it is limiting." });
        ans = "at rest; friction " + fmt(Math.abs(net), 2) + " N";
      } else {
        var Fr = net > 0 ? -Fmax : Fmax, acc = (net + Fr) / v.m;
        steps.push({ h: "Compare", m: "|net| = " + fmt(Math.abs(net), 3) + " > μR, so the particle moves " + (net > 0 ? "up" : "down") + " the slope with friction = μR = " + fmt(Fmax, 3) + " N opposing" });
        steps.push({ h: "Newton's second law along the slope", m: fmt(net, 3) + " " + (Fr < 0 ? "− " : "+ ") + fmt(Fmax, 3) + " = " + fmt(v.m) + "a  ⇒  a = " + fmt(Math.abs(acc), 3) + " m/s² " + (net > 0 ? "up" : "down") + " the slope" });
        ans = "a = " + fmt(Math.abs(acc), 3) + " m/s² " + (net > 0 ? "up" : "down") + " the slope";
      }
      return { steps: steps, answer: ans };
    }
  }, ["maths:S8.6", "maths:S8.5"]);

  W.register({
    id: "moments", cat: "applied", subject: "maths", ref: "S9.1",
    title: "Beam on two supports: reactions & the tipping point",
    blurb: "Take moments about one support to find the other reaction, resolve vertically for the second, then find how far a load can travel before the beam tilts.",
    inputs: [{ k: "L", label: "beam length (m)", def: 6, type: "number", step: "0.5" }, { k: "Wb", label: "beam mass (kg)", def: 30, type: "number" }, { k: "cm", label: "centre of mass from A (m)", def: 2.5, type: "number", step: "0.1" }, { k: "c", label: "support C from A (m)", def: 1, type: "number", step: "0.1" }, { k: "d", label: "support D from A (m)", def: 4, type: "number", step: "0.1" }, { k: "load", label: "load mass (kg)", def: 40, type: "number" }, { k: "lx", label: "load from A (m)", def: 3, type: "number", step: "0.1" }],
    random: function () { var L = pick([4, 5, 6, 8]); return { L: L, Wb: ri(10, 60), cm: Math.round(L / 2 * 10 + ri(-10, 10)) / 10, c: ri(0, 1), d: L - ri(1, 2), load: ri(20, 80), lx: Math.round(Math.random() * L * 10) / 10 }; },
    validate: function (v) { if (v.d <= v.c) return "Support D must be to the right of C."; if (v.cm < 0 || v.cm > v.L || v.lx < 0 || v.lx > v.L) return "Positions must lie on the beam."; },
    solve: function (v) {
      var W = v.Wb * g, Lw = v.load * g, RD = (W * (v.cm - v.c) + Lw * (v.lx - v.c)) / (v.d - v.c), RC = W + Lw - RD;
      var tipX = v.d + W * (v.cm - v.d) / Lw * -1; /* R_C = 0: moments about D: W (cm − d) [anticlockwise if cm<d] = Lw (x − d) */
      tipX = v.d + W * (v.d - v.cm) / Lw;
      return { steps: [
        { h: "Forces on the beam", m: "W = " + fmt(v.Wb) + "g = " + fmt(W, 1) + " N at " + fmt(v.cm) + " m;  load " + fmt(v.load) + "g = " + fmt(Lw, 1) + " N at " + fmt(v.lx) + " m;  R_C up at " + fmt(v.c) + " m;  R_D up at " + fmt(v.d) + " m", n: "A uniform beam's weight acts at its midpoint; here the centre of mass is given." },
        { h: "Moments about C (eliminates R_C)", m: "R_D × " + fmt(v.d - v.c) + " = " + fmt(W, 1) + " × " + fmt(v.cm - v.c) + " + " + fmt(Lw, 1) + " × " + fmt(v.lx - v.c) + "\nR_D = " + fmt(RD, 2) + " N", n: "Choose the pivot where an unknown force acts." },
        { h: "Resolve vertically", m: "R_C + R_D = " + fmt(W + Lw, 1) + "  ⇒  R_C = " + fmt(RC, 2) + " N" + (RC < 0 ? "   (negative: the beam has already tilted about D)" : "") },
        { h: "Tipping about D", m: "on the point of tilting, R_C = 0.  M(D): " + fmt(W, 1) + " × " + fmt(v.d - v.cm) + " = " + fmt(Lw, 1) + " × (x − " + fmt(v.d) + ")\nx = " + fmt(tipX, 3) + " m from A" + (tipX > v.L ? " — beyond the end, so it never tilts" : ""), n: "'On the point of tilting' = the far reaction is zero." }
      ], answer: "R_C = " + fmt(RC, 1) + " N, R_D = " + fmt(RD, 1) + " N; tilts when the load passes " + fmt(tipX, 2) + " m" };
    }
  }, ["maths:S9.1"]);

  /* ---------------- COMPUTER SCIENCE ---------------- */
  W.register({
    id: "rpn", cat: "cs", subject: "compsci", ref: "4.3.3.1",
    title: "Infix → Reverse Polish (shunting-yard) and evaluation",
    blurb: "Convert an infix expression to postfix with the operator stack shown at every token, then evaluate the RPN with a value stack — both trace tables the exam asks for.",
    inputs: [{ k: "expr", label: "infix expression", def: "3 + 4 * (2 - 1) ^ 2", type: "text", w: 220 }],
    random: function () { return { expr: pick(["3 + 4 * 2", "(1 + 2) * (3 + 4)", "8 / 2 - 3 * 2", "2 ^ 3 + 4 * 5", "7 - (2 + 3) * 2", "(5 + 3) / 4 ^ 2"]) }; },
    validate: function (v) { if (!/^[\d\s+\-*/^().]+$/.test(v.expr)) return "Use digits, + − * / ^ and brackets."; },
    solve: function (v) {
      var toks = v.expr.match(/\d+\.?\d*|[+\-*/^()]/g) || [], PREC = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 }, RIGHT = { "^": true };
      var out = [], st = [], rows = [];
      toks.forEach(function (t) {
        if (/\d/.test(t)) out.push(t);
        else if (t === "(") st.push(t);
        else if (t === ")") { while (st.length && st[st.length - 1] !== "(") out.push(st.pop()); st.pop(); }
        else { while (st.length && st[st.length - 1] !== "(" && (PREC[st[st.length - 1]] > PREC[t] || (PREC[st[st.length - 1]] === PREC[t] && !RIGHT[t]))) out.push(st.pop()); st.push(t); }
        rows.push(t.padEnd(5) + " | stack: " + (st.join(" ") || "—").padEnd(12) + " | output: " + out.join(" "));
      });
      while (st.length) { out.push(st.pop()); rows.push("(end) | stack: " + (st.join(" ") || "—").padEnd(12) + " | output: " + out.join(" ")); }
      var vs = [], ev = [], ok = true;
      out.forEach(function (t) {
        if (/\d/.test(t)) vs.push(parseFloat(t));
        else { var b = vs.pop(), a = vs.pop(); if (a === undefined) { ok = false; return; } var r = t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : t === "/" ? a / b : Math.pow(a, b); vs.push(r); ev.push(t + ": pop " + fmt(b) + ", pop " + fmt(a) + " → push " + fmt(a) + " " + t + " " + fmt(b) + " = " + fmt(r)); }
      });
      return { steps: [
        { h: "Shunting-yard: operators wait on a stack until a lower-precedence one arrives", m: rows.join("\n"), n: "Left-to-right operands go straight out; '(' pushes; ')' pops until its '('." },
        { h: "Reverse Polish form", m: out.join(" "), n: "No brackets needed — the order of operators encodes precedence, so a compiler can evaluate it in one pass with a stack." },
        { h: "Evaluate with a value stack", m: ev.join("\n") || "(single value)" }
      ], answer: ok && vs.length === 1 ? out.join(" ") + "  =  " + fmt(vs[0]) : "malformed expression" };
    }
  }, ["compsci:4.3.3.1"]);

  W.register({
    id: "filesize", cat: "cs", subject: "compsci", ref: "4.5.6.4 / 4.5.6.7",
    title: "File size of a bitmap image or a sound sample",
    blurb: "Resolution × colour depth for images; sample rate × resolution × seconds for sound — with the unit conversions written out and the effect of doubling one factor.",
    inputs: [{ k: "kind", label: "type", def: "image", type: "select", opts: ["image", "sound"] }, { k: "a", label: "width px / sample rate Hz", def: 1920, type: "number" }, { k: "b", label: "height px / seconds", def: 1080, type: "number" }, { k: "c", label: "colour depth / resolution (bits)", def: 24, type: "number" }],
    random: function () { return Math.random() < 0.5 ? { kind: "image", a: pick([640, 800, 1024, 1920, 3840]), b: pick([480, 600, 768, 1080, 2160]), c: pick([1, 8, 16, 24]) } : { kind: "sound", a: pick([8000, 22050, 44100, 48000]), b: ri(3, 300), c: pick([8, 16, 24]) }; },
    validate: function (v) { if (v.a <= 0 || v.b <= 0 || v.c <= 0) return "All three values must be positive."; },
    solve: function (v) {
      var bits = v.a * v.b * v.c, bytes = bits / 8;
      var img = v.kind === "image";
      return { steps: [
        { h: img ? "Number of pixels" : "Number of samples", m: img ? fmt(v.a) + " × " + fmt(v.b) + " = " + (v.a * v.b).toLocaleString() + " pixels" : fmt(v.a) + " samples/s × " + fmt(v.b) + " s = " + (v.a * v.b).toLocaleString() + " samples" },
        { h: "Bits", m: (v.a * v.b).toLocaleString() + " × " + fmt(v.c) + " bits = " + bits.toLocaleString() + " bits", n: img ? "Colour depth = bits per pixel; 2^depth colours available." : "Resolution = bits per sample; 2^bits amplitude levels." },
        { h: "Convert", m: "÷ 8 = " + bytes.toLocaleString() + " bytes\n÷ 1000 = " + fmt(bytes / 1000, 2) + " kB   ÷ 1000² = " + fmt(bytes / 1e6, 3) + " MB\n(binary prefixes: " + fmt(bytes / 1024, 2) + " KiB, " + fmt(bytes / 1048576, 3) + " MiB)", n: "AQA: kilo = 1000, kibi = 1024. Metadata (header) adds a little on top." },
        { h: "Sensitivity", m: img ? "doubling width AND height → ×4 file size; one extra bit of depth → +1 bit per pixel" : "doubling the sample rate → ×2; doubling the resolution → ×2; stereo → ×2" }
      ], answer: bytes.toLocaleString() + " bytes ≈ " + fmt(bytes / 1e6, 2) + " MB" };
    }
  }, ["compsci:4.5.6.4", "compsci:4.5.6.7", "compsci:4.5.3.2"]);

  W.register({
    id: "parity", cat: "cs", subject: "compsci", ref: "4.5.5.3",
    title: "Parity bit, majority vote & checksum for a byte",
    blurb: "Compute the parity bit for 7 data bits under even or odd parity, then show a checksum over a small block and what a single corrupted bit does to each check.",
    inputs: [{ k: "bits", label: "7 data bits", def: "1011001", type: "text", w: 120 }, { k: "par", label: "parity", def: "even", type: "select", opts: ["even", "odd"] }, { k: "flip", label: "flip bit (1–8, 0 = none)", def: 3, type: "number" }],
    random: function () { var s = ""; for (var i = 0; i < 7; i++) s += Math.random() < 0.5 ? "0" : "1"; return { bits: s, par: pick(["even", "odd"]), flip: ri(0, 8) }; },
    validate: function (v) { if (!/^[01]{7}$/.test(v.bits)) return "Enter exactly 7 binary digits."; if (v.flip < 0 || v.flip > 8) return "flip must be 0–8."; },
    solve: function (v) {
      var ones = v.bits.split("").filter(function (b) { return b === "1"; }).length, p = v.par === "even" ? ones % 2 : 1 - ones % 2;
      var sent = String(p) + v.bits, recv = sent.split("");
      if (v.flip) recv[v.flip - 1] = recv[v.flip - 1] === "1" ? "0" : "1";
      recv = recv.join("");
      var onesR = recv.split("").filter(function (b) { return b === "1"; }).length, okP = v.par === "even" ? onesR % 2 === 0 : onesR % 2 === 1;
      var block = [parseInt(v.bits, 2), 37, 200, 91], sum = block.reduce(function (a, b) { return a + b; }, 0) % 256;
      var blockR = [parseInt(recv.slice(1), 2), 37, 200, 91], sumR = blockR.reduce(function (a, b) { return a + b; }, 0) % 256;
      return { steps: [
        { h: "Count the ones", m: v.bits + " has " + ones + " ones" },
        { h: "Choose the parity bit", m: v.par + " parity needs an " + v.par + " total, so P = " + p + "\ntransmitted byte (P first): " + sent, n: "The parity bit is usually the most significant bit; the exam will say which end." },
        { h: "Receiver check", m: "received " + recv + (v.flip ? " (bit " + v.flip + " flipped)" : "") + " → " + onesR + " ones → " + (okP ? "parity OK" : "parity FAILS → error detected, retransmit"), n: "An even number of flipped bits passes undetected — parity cannot correct, only detect." },
        { h: "Checksum over a block", m: "block [" + block.join(", ") + "] → sum mod 256 = " + sum + "\nreceived block sums to " + sumR + (sumR === sum ? " ✓" : " ✗ mismatch → error detected") },
        { h: "Majority voting", m: "send each bit three times: " + v.bits.slice(0, 3).split("").map(function (b) { return b + b + b; }).join(" ") + " …; a single flip is outvoted 2:1, so it is CORRECTED, at the cost of tripling the data" }
      ], answer: "parity bit " + p + ", byte " + sent + (v.flip ? "; flip " + (okP ? "NOT detected" : "detected") : "") };
    }
  }, ["compsci:4.5.5.3"]);

  W.register({
    id: "subnet", cat: "cs", subject: "compsci", ref: "4.9.4.4",
    title: "Subnet mask: network ID, host range & broadcast",
    blurb: "AND the address with the mask octet by octet in binary, count the host bits, then list the usable range — set out as the four-line answer the exam rewards.",
    inputs: [{ k: "ip", label: "IPv4 address", def: "192.168.10.77", type: "text", w: 150 }, { k: "prefix", label: "prefix /n", def: 26, type: "number" }],
    random: function () { return { ip: pick(["10.0.5.130", "172.16.40.9", "192.168.1.200", "192.168.10.77", "10.20.30.40"]), prefix: pick([8, 16, 20, 22, 24, 25, 26, 27, 28, 30]) }; },
    validate: function (v) { var p = v.ip.trim().split("."); if (p.length !== 4 || p.some(function (o) { return !/^\d{1,3}$/.test(o) || +o > 255; })) return "Address must be four numbers 0–255."; if (!(v.prefix >= 1 && v.prefix <= 30)) return "Prefix 1–30."; },
    solve: function (v) {
      var ip = v.ip.trim().split(".").map(Number), mask = [0, 0, 0, 0];
      for (var i = 0; i < 32; i++) if (i < v.prefix) mask[Math.floor(i / 8)] |= 128 >> (i % 8);
      var net = ip.map(function (o, i) { return o & mask[i]; }), bc = ip.map(function (o, i) { return o | (~mask[i] & 255); });
      var hb = 32 - v.prefix, hosts = Math.pow(2, hb) - 2, first = net.slice(), last = bc.slice(); first[3]++; last[3]--;
      function bin(o) { return o.map(function (x) { var s = x.toString(2); while (s.length < 8) s = "0" + s; return s; }).join("."); }
      return { steps: [
        { h: "Write the mask from the prefix", m: "/" + v.prefix + " → " + v.prefix + " ones then " + hb + " zeros\n" + bin(mask) + " = " + mask.join(".") },
        { h: "Address in binary", m: bin(ip) },
        { h: "AND address with mask → network ID", m: bin(net) + " = " + net.join("."), n: "Network bits copied, host bits zeroed." },
        { h: "Host part", m: hb + " host bits → 2^" + hb + " = " + Math.pow(2, hb).toLocaleString() + " addresses, minus network ID and broadcast = " + hosts.toLocaleString() + " usable hosts" },
        { h: "Range and broadcast", m: "first host " + first.join(".") + "\nlast host  " + last.join(".") + "\nbroadcast  " + bc.join(".") + " (host bits all 1)" }
      ], answer: "network " + net.join(".") + "/" + v.prefix + ", hosts " + first.join(".") + "–" + last.join(".") + ", broadcast " + bc.join(".") };
    }
  }, ["compsci:4.9.4.4", "compsci:4.9.4.3"]);

  W.register({
    id: "bigo", cat: "cs", subject: "compsci", ref: "4.4.4.3",
    title: "Time complexity from a loop structure",
    blurb: "Describe up to three nested loops (over n, over log n, or a fixed count) and derive the step count, then reduce it to Big-O by dropping constants and lower-order terms.",
    inputs: [{ k: "l1", label: "outer loop", def: "n", type: "select", opts: ["n", "log n", "constant k", "none"] }, { k: "l2", label: "middle loop", def: "n", type: "select", opts: ["n", "log n", "constant k", "none"] }, { k: "l3", label: "inner loop", def: "none", type: "select", opts: ["n", "log n", "constant k", "none"] }, { k: "c", label: "steps in the body", def: 3, type: "number" }],
    random: function () { var o = ["n", "log n", "constant k", "none"]; return { l1: pick(o.slice(0, 3)), l2: pick(o), l3: pick(o), c: ri(1, 6) }; },
    validate: function (v) { if (v.c <= 0) return "The body needs at least one step."; },
    solve: function (v) {
      var loops = [v.l1, v.l2, v.l3].filter(function (l) { return l !== "none"; });
      var nPow = loops.filter(function (l) { return l === "n"; }).length, logs = loops.filter(function (l) { return l === "log n"; }).length, ks = loops.filter(function (l) { return l === "constant k"; }).length;
      var term = (nPow ? "n" + (nPow > 1 ? "^" + nPow : "") : "") + (logs ? (nPow ? " · " : "") + "(log n)" + (logs > 1 ? "^" + logs : "") : "");
      var big = term ? "O(" + term.replace(/ · /g, " ") + ")" : "O(1)";
      var count = fmt(v.c) + (ks ? " × k" + (ks > 1 ? "^" + ks : "") : "") + (term ? " × " + term : "");
      var name = !term ? "constant" : nPow === 0 ? (logs === 1 ? "logarithmic" : "polylogarithmic") : nPow === 1 && !logs ? "linear" : nPow === 1 && logs ? "linearithmic (n log n)" : nPow === 2 && !logs ? "quadratic" : nPow === 3 && !logs ? "cubic" : "polynomial";
      return { steps: [
        { h: "Count iterations of each loop", m: loops.length ? loops.map(function (l, i) { return "loop " + (i + 1) + ": " + (l === "constant k" ? "k times (fixed, independent of n)" : l === "log n" ? "log n times (halving each pass)" : "n times"); }).join("\n") : "no loops — the body runs once" },
        { h: "Multiply for nested loops", m: "T(n) = " + count + " steps", n: "Nested → multiply; sequential loops → add." },
        { h: "Drop constants and lower-order terms", m: "constants (" + fmt(v.c) + (ks ? ", k" : "") + ") do not change the growth rate\nT(n) is " + big },
        { h: "Name the class", m: big + " — " + name + " time" + (nPow >= 2 ? "; tractable (polynomial) but slow for large n" : nPow === 1 ? "; scales directly with the input" : "") }
      ], answer: big + " (" + name + ")" };
    }
  }, ["compsci:4.4.4.3", "compsci:4.4.4.2", "compsci:4.4.4.1"]);

})();
