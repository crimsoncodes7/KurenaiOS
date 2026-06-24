/* Kurenai OS — labs/worked.js
   Worked Example Engine: parameterised, step-by-step solutions.
   Each generator declares its inputs, validates them, and emits an
   ordered list of steps {h: heading, m: monospace working, n: note}. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  /* ---------- numeric helpers ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function frac(n, d) {
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(Math.round(n), Math.round(d));
    n /= g; d /= g;
    return d === 1 ? String(n) : n + "/" + d;
  }
  function fmt(x, dp) {
    if (!isFinite(x)) return String(x);
    var r = Math.round(x * 1e9) / 1e9;
    if (Number.isInteger(r)) return String(r);
    return dp !== undefined ? r.toFixed(dp) : String(r);
  }
  function surd(n) { // simplify √n -> [k, m] with k√m
    n = Math.round(n);
    var k = 1;
    for (var i = 2; i * i <= n; i++) {
      while (n % (i * i) === 0) { n /= i * i; k *= i; }
    }
    return [k, n];
  }
  function sgn(x) { return x < 0 ? " − " + fmt(Math.abs(x)) : " + " + fmt(x); }
  function toBin(n, bits) {
    var s = (n >>> 0).toString(2);
    while (s.length < bits) s = "0" + s;
    return s.slice(-bits);
  }
  function nCr(n, r) { // exact binomial coefficient
    if (r < 0 || r > n) return 0;
    var x = 1; for (var i = 0; i < r; i++) x = x * (n - i) / (i + 1);
    return Math.round(x);
  }
  function binPmf(n, p, k) { return nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k); }
  function binCdf(n, p, k) { var s = 0; for (var i = 0; i <= k; i++) s += binPmf(n, p, i); return s; }

  /* ---------- tiny polynomial parser: "3x^4 - 5x^2 + 2x - 7" ---------- */
  function parsePoly(src) {
    var s = src.replace(/\s+/g, "").replace(/−/g, "-");
    if (!s) return null;
    var terms = [], re = /([+-]?)(\d*\.?\d*)(x?)(?:\^(-?\d+))?/g, m, seen = 0;
    while ((m = re.exec(s)) !== null && m.index < s.length) {
      if (!m[0]) { re.lastIndex++; continue; }
      var sign = m[1] === "-" ? -1 : 1;
      var coef = m[2] === "" ? 1 : parseFloat(m[2]);
      var hasX = m[3] === "x";
      var pow = m[4] !== undefined ? parseInt(m[4], 10) : (hasX ? 1 : 0);
      if (!hasX && m[2] === "") return null; // bare sign / garbage
      terms.push({ c: sign * coef, p: hasX ? pow : 0 });
      seen += m[0].length;
    }
    if (!terms.length || seen < s.length * 0.6) return null;
    // merge like powers, sort descending
    var map = {};
    terms.forEach(function (t) { map[t.p] = (map[t.p] || 0) + t.c; });
    return Object.keys(map).map(function (p) { return { c: map[p], p: +p }; })
      .filter(function (t) { return t.c !== 0; })
      .sort(function (a, b) { return b.p - a.p; });
  }
  function polyStr(terms) {
    if (!terms.length) return "0";
    return terms.map(function (t, i) {
      var c = t.c, p = t.p, out = "";
      var mag = Math.abs(c);
      out += i === 0 ? (c < 0 ? "−" : "") : (c < 0 ? " − " : " + ");
      if (mag !== 1 || p === 0) out += fmt(mag);
      if (p >= 1) out += "x";
      if (p > 1 || p < 0) out += "^" + p;
      return out;
    }).join("");
  }
  function polyEval(terms, x) {
    return terms.reduce(function (a, t) { return a + t.c * Math.pow(x, t.p); }, 0);
  }

  /* ---------- generators ---------- */
  var GENS = [
  {
    id: "quad", cat: "pure", subject: "maths", ref: "2.3",
    title: "Quadratic: discriminant, roots & vertex",
    blurb: "Solve ax² + bx + c = 0 by the formula, then complete the square to read the vertex.",
    inputs: [
      { k: "a", label: "a", def: 2, type: "number" },
      { k: "b", label: "b", def: -4, type: "number" },
      { k: "c", label: "c", def: -6, type: "number" }
    ],
    random: function () { 
      var a = [1,1,2,2,3][Math.floor(Math.random()*5)];
      return { a: a, b: Math.floor(Math.random()*13)-6, c: Math.floor(Math.random()*13)-6 };
    },
    validate: function (v) { if (v.a === 0) return "a must be non-zero (otherwise it isn't a quadratic)."; },
    solve: function (v) {
      var a = v.a, b = v.b, c = v.c;
      var D = b * b - 4 * a * c;
      var steps = [];
      steps.push({ h: "State the discriminant", 
        m: "D = b² − 4ac\nD = (" + fmt(b) + ")² − 4(" + fmt(a) + ")(" + fmt(c) + ")\nD = " + fmt(b*b) + " − " + fmt(4*a*c) + " = " + fmt(D),
        n: "Quote the formula before substituting — the structure line is a method mark." });
      var nature = D > 0 ? "D > 0 → two distinct real roots" : D === 0 ? "D = 0 → one repeated real root" : "D < 0 → no real roots";
      steps.push({ h: "Interpret the discriminant", m: nature });
      if (D >= 0) {
        var sd = surd(D), root = "";
        if (sd[1] === 1) root = fmt(sd[0]);
        else if (sd[0] === 1) root = "√" + sd[1];
        else root = sd[0] + "√" + sd[1];
        steps.push({ h: "Apply the quadratic formula",
          m: "x = (−b ± √D) / 2a\nx = (" + fmt(-b) + " ± √" + fmt(D) + ") / " + fmt(2*a) +
             (sd[1] !== D ? "\n√" + fmt(D) + " simplifies to " + root : ""),
          n: "Simplify the surd before dividing — un-simplified surds lose accuracy marks." });
        var x1 = (-b + Math.sqrt(D)) / (2*a), x2 = (-b - Math.sqrt(D)) / (2*a);
        steps.push({ h: "Evaluate the roots",
          m: D === 0 ? "x = " + fmt(x1, 3)
            : "x₁ = (" + fmt(-b) + " + " + root + ") / " + fmt(2*a) + " = " + fmt(x1, 3) +
              "\nx₂ = (" + fmt(-b) + " − " + root + ") / " + fmt(2*a) + " = " + fmt(x2, 3) });
      }
      // completing the square: a(x + b/2a)^2 + c - b^2/4a
      var p = frac(b, 2*a), q = frac(4*a*c - b*b, 4*a);
      steps.push({ h: "Complete the square",
        m: fmt(a) + "x² " + (b ? sgn(b).trim() + "x " : "") + (c ? sgn(c).trim() : "") +
           "\n= " + (a !== 1 ? fmt(a) : "") + "(x " + (b/(2*a) >= 0 ? "+ " : "− ") + frac(Math.abs(b), 2*a) + ")² " +
           ((4*a*c - b*b) / (4*a) >= 0 ? "+ " : "− ") + frac(Math.abs(4*a*c - b*b), Math.abs(4*a)),
        n: a !== 1 ? "Factor a out of the x-terms first when a ≠ 1." : undefined });
      steps.push({ h: "Read off the vertex",
        m: "Vertex at ( " + frac(-b, 2*a) + " , " + q + " )  →  " +
           (a > 0 ? "minimum point (a > 0, ∪-shaped)" : "maximum point (a < 0, ∩-shaped)"),
        n: "Watch the sign: (x + p)² has its vertex at x = −p." });
      return { steps: steps, answer: D >= 0
        ? "Roots: x = " + fmt((-b + Math.sqrt(D))/(2*a), 3) + (D > 0 ? "  and  x = " + fmt((-b - Math.sqrt(D))/(2*a), 3) : " (repeated)")
        : "No real roots (D = " + fmt(D) + " < 0); vertex at (" + frac(-b,2*a) + ", " + q + ")" };
    }
  },
  {
    id: "diff", cat: "pure", subject: "maths", ref: "7.2 / 7.3",
    title: "Differentiate a polynomial & find the tangent",
    blurb: "Term-by-term differentiation, gradient at a point, then the tangent line.",
    inputs: [
      { k: "poly", label: "f(x) =", def: "3x^3 - 5x^2 + 2x - 7", type: "text", w: 230 },
      { k: "x0", label: "at x =", def: 2, type: "number" }
    ],
    random: function () {
      function r(n){return Math.floor(Math.random()*n*2+1)-n;}
      return { poly: (r(4)||2)+"x^3 "+(r(6)>=0?"+":"-")+" "+Math.abs(r(6)||3)+"x^2 "+(r(6)>=0?"+":"-")+" "+Math.abs(r(6)||2)+"x "+(r(8)>=0?"+":"-")+" "+Math.abs(r(8)||5), x0: Math.floor(Math.random()*5)-2 };
    },
    validate: function (v) {
      if (!parsePoly(v.poly)) return "Couldn't read that polynomial — use terms like 3x^2, -5x, 7.";
    },
    solve: function (v) {
      var terms = parsePoly(v.poly), x0 = +v.x0;
      var d = terms.map(function (t) { return { c: t.c * t.p, p: t.p - 1 }; })
                   .filter(function (t) { return t.c !== 0; });
      var steps = [];
      steps.push({ h: "State the rule", m: "d/dx (axⁿ) = n·a·xⁿ⁻¹",
        n: "Multiply by the power, subtract one from the power — constants vanish." });
      steps.push({ h: "Differentiate term by term",
        m: "f(x)  = " + polyStr(terms) + "\nf′(x) = " + polyStr(d) });
      var g = polyEval(d, x0), y0 = polyEval(terms, x0);
      steps.push({ h: "Gradient at x = " + fmt(x0),
        m: "f′(" + fmt(x0) + ") = " + polyStr(d).replace(/x/g, "(" + fmt(x0) + ")") + " = " + fmt(g, 3) });
      steps.push({ h: "Point on the curve",
        m: "f(" + fmt(x0) + ") = " + fmt(y0, 3) + "   →   point (" + fmt(x0) + ", " + fmt(y0, 3) + ")" });
      steps.push({ h: "Equation of the tangent",
        m: "y − y₁ = m(x − x₁)\ny − " + fmt(y0,3) + " = " + fmt(g,3) + "(x − " + fmt(x0) + ")\ny = " + fmt(g,3) + "x " + sgn(y0 - g*x0),
        n: "For the NORMAL, use gradient −1/m instead." });
      return { steps: steps, answer: "f′(x) = " + polyStr(d) + "   ·   tangent: y = " + fmt(g,3) + "x" + sgn(y0 - g*x0) };
    }
  },
  {
    id: "trig", cat: "pure", subject: "maths", ref: "5.7",
    title: "Solve a trig equation on an interval",
    blurb: "sin / cos / tan (kx) = v for 0° ≤ x < 360°, with every secondary value found.",
    inputs: [
      { k: "fn", label: "function", def: "sin", type: "select", opts: ["sin", "cos", "tan"] },
      { k: "kk", label: "k (multiple of x)", def: 2, type: "number" },
      { k: "v", label: "= value", def: 0.5, type: "number", step: "any" }
    ],
    random: function () {
      var fns = ["sin","cos","tan"], vals = [0.5, -0.5, 0.866, -0.866, 1, 0.25, 0.75];
      return { fn: fns[Math.floor(Math.random()*3)], kk: [1,2,3][Math.floor(Math.random()*3)],
               v: vals[Math.floor(Math.random()*vals.length)] };
    },
    validate: function (v) {
      if (v.kk <= 0 || !Number.isInteger(+v.kk)) return "k must be a positive integer.";
      if ((v.fn === "sin" || v.fn === "cos") && Math.abs(v.v) > 1) return "|value| > 1 has no solutions for sin or cos — try tan, or a value in [−1, 1].";
    },
    solve: function (v) {
      var fn = v.fn, k = +v.kk, val = +v.v;
      var steps = [];
      var hi = 360 * k;
      steps.push({ h: "Transform the interval",
        m: "Let u = " + (k === 1 ? "x" : k + "x") + ".\n0° ≤ x < 360°  →  0° ≤ u < " + hi + "°",
        n: "Multiply the interval by k FIRST — solving then dividing back finds every solution." });
      var pv;
      if (fn === "sin") pv = Math.asin(val) * 180 / Math.PI;
      else if (fn === "cos") pv = Math.acos(val) * 180 / Math.PI;
      else pv = Math.atan(val) * 180 / Math.PI;
      steps.push({ h: "Principal value",
        m: "u = " + fn + "⁻¹(" + fmt(val) + ") = " + fmt(pv, 2) + "°" });
      // base solutions in [0,360)
      var base = [];
      function norm(a) { a %= 360; if (a < 0) a += 360; return a; }
      if (fn === "sin") { base = [norm(pv), norm(180 - pv)]; }
      else if (fn === "cos") { base = [norm(pv), norm(360 - pv)]; }
      else { base = [norm(pv), norm(pv + 180)]; }
      base = base.filter(function (a, i) { return base.indexOf(a) === i; }).sort(function(a,b){return a-b;});
      var rule = fn === "sin" ? "second solution: 180° − u" : fn === "cos" ? "second solution: 360° − u" : "tan repeats every 180°: u + 180°";
      steps.push({ h: "Secondary values (" + fn + " symmetry)",
        m: rule + "\nbase solutions in [0°, 360°): " + base.map(function(a){return fmt(a,2)+"°";}).join(", "),
        n: "Forgetting the secondary value is the single most common lost mark here." });
      var us = [];
      for (var c = 0; c < k; c++) base.forEach(function (b) { var u = b + 360*c; if (u < hi) us.push(u); });
      us.sort(function(a,b){return a-b;});
      steps.push({ h: "Extend across the enlarged interval",
        m: "add 360° repeatedly while u < " + hi + "°:\nu = " + us.map(function(a){return fmt(a,2)+"°";}).join(", ") });
      var xs = us.map(function (u) { return u / k; });
      steps.push({ h: "Divide back by k",
        m: "x = u / " + k + "\nx = " + xs.map(function(a){return fmt(a,2)+"°";}).join(", "),
        n: "Sanity check: " + fn + " " + (k>1 ? k + "x" : "x") + " completes " + k + " cycle" + (k>1?"s":"") + " on the interval, so expect up to " + (2*k) + " solutions." });
      return { steps: steps, answer: "x = " + xs.map(function(a){return fmt(a,2)+"°";}).join(", ") + "  (" + xs.length + " solutions)" };
    }
  },
  {
    id: "logs", cat: "pure", subject: "maths", ref: "6.5",
    title: "Solve aˣ = b with logarithms",
    blurb: "Take logs of both sides, bring the power down, evaluate.",
    inputs: [
      { k: "a", label: "a (base)", def: 3, type: "number", step: "any" },
      { k: "b", label: "b", def: 40, type: "number", step: "any" }
    ],
    random: function () { return { a: [2,3,5,7][Math.floor(Math.random()*4)], b: Math.floor(Math.random()*180)+5 }; },
    validate: function (v) {
      if (v.a <= 0 || v.a === 1) return "Base a must be positive and ≠ 1.";
      if (v.b <= 0) return "b must be positive (aˣ is always positive).";
    },
    solve: function (v) {
      var a = +v.a, b = +v.b;
      var x = Math.log(b) / Math.log(a);
      return { steps: [
        { h: "Take logs of both sides", m: "aˣ = b\nlog(aˣ) = log b", n: "Any base works — ln and log₁₀ both score." },
        { h: "Bring the power down", m: "x · log a = log b", n: "Power law: log(aˣ) = x log a. Quote it." },
        { h: "Isolate x", m: "x = log b / log a\nx = log " + fmt(b) + " / log " + fmt(a) },
        { h: "Evaluate", m: "x = " + fmt(Math.log10(b), 5) + " / " + fmt(Math.log10(a), 5) + " = " + fmt(x, 4),
          n: "Check: " + fmt(a) + "^" + fmt(x, 4) + " ≈ " + fmt(Math.pow(a, x), 3) + " ✓" }
      ], answer: "x = " + fmt(x, 4) };
    }
  },
  {
    id: "bin", cat: "cs", subject: "compsci", ref: "4.5.4.2 / 4.5.4.3",
    title: "Denary → binary, hex & two's complement",
    blurb: "8-bit unsigned conversion, the hex shortcut, and the negative as two's complement.",
    inputs: [{ k: "n", label: "denary (1–127)", def: 53, type: "number" }],
    random: function () { return { n: Math.floor(Math.random() * 126) + 1 }; },
    validate: function (v) {
      if (!Number.isInteger(+v.n) || v.n < 1 || v.n > 127) return "Enter an integer from 1 to 127 so the negative fits in 8 bits.";
    },
    solve: function (v) {
      var n = +v.n;
      var bits = [128,64,32,16,8,4,2,1], rem = n, picks = [];
      var rows = bits.map(function (b) {
        var take = rem >= b ? 1 : 0;
        if (take) { rem -= b; picks.push(b); }
        return String(b).padStart(3) + " → " + take;
      });
      var bin = toBin(n, 8);
      var steps = [];
      steps.push({ h: "Place-value subtraction",
        m: "Place values: 128 64 32 16 8 4 2 1\n" + rows.join("\n") + "\n\n" + fmt(n) + " = " + picks.join(" + "),
        n: "Show the table — examiners credit the method even with one slipped bit." });
      steps.push({ h: "8-bit binary", m: fmt(n) + " = " + bin.replace(/(.{4})(.{4})/, "$1 $2") + "₂" });
      var hex = n.toString(16).toUpperCase().padStart(2, "0");
      steps.push({ h: "Hex via nibbles",
        m: bin.slice(0,4) + " → " + parseInt(bin.slice(0,4),2).toString(16).toUpperCase() +
           "\n" + bin.slice(4) + " → " + parseInt(bin.slice(4),2).toString(16).toUpperCase() +
           "\n" + fmt(n) + " = " + hex + "₁₆",
        n: "Split into 4-bit groups from the right; convert each group independently." });
      var flipped = bin.split("").map(function(c){return c==="0"?"1":"0";}).join("");
      var twos = toBin((~n + 1) & 0xFF, 8);
      steps.push({ h: "Two's complement of −" + fmt(n),
        m: "  " + bin + "   (+" + fmt(n) + ")\n→ " + flipped + "   (flip every bit)\n→ " + twos + "   (add 1)\n\n−" + fmt(n) + " = " + twos.replace(/(.{4})(.{4})/, "$1 $2") + "₂",
        n: "Check the MSB is 1 — negative two's complement numbers always start with 1." });
      steps.push({ h: "Verify",
        m: "MSB weight is −128:\n−128×" + twos[0] + " + " + [64,32,16,8,4,2,1].map(function(b,i){return b+"×"+twos[i+1];}).join(" + ") +
           " = " + fmt(-128*(+twos[0]) + [64,32,16,8,4,2,1].reduce(function(a,b,i){return a + b*(+twos[i+1]);},0)) });
      return { steps: steps, answer: fmt(n) + " = " + bin + "₂ = " + hex + "₁₆ ;  −" + fmt(n) + " = " + twos + "₂ (two's complement)" };
    }
  },
  {
    id: "float", cat: "cs", subject: "compsci", ref: "4.5.4.4",
    title: "Floating point: normalise mantissa & exponent",
    blurb: "AQA's simplified form — 8-bit two's complement mantissa, 4-bit two's complement exponent.",
    inputs: [{ k: "x", label: "denary value", def: 5.75, type: "number", step: "any" }],
    random: function () {
      var v = (Math.floor(Math.random() * 96) + 4) / 8 * (Math.random() < 0.35 ? -1 : 1);
      return { x: v };
    },
    validate: function (v) {
      var x = +v.x;
      if (x === 0) return "Zero is a special case — pick a non-zero value.";
      if (Math.abs(x) > 100 || Math.abs(x) < 0.01) return "Keep the value between 0.01 and 100 so it fits 4-bit exponents comfortably.";
    },
    solve: function (v) {
      var x = +v.x, MB = 8, EB = 4;
      var steps = [];
      // find exponent e with x / 2^e in [0.5,1) for +ve, [-1,-0.5) for -ve
      var e = 0, m = x;
      if (x > 0) { while (m >= 1) { m /= 2; e++; } while (m < 0.5) { m *= 2; e--; } }
      else { while (m < -1) { m /= 2; e++; } while (m >= -0.5) { m *= 2; e--; } }
      var fb = MB - 1; // fractional bits after the sign bit
      var raw = Math.round(m * (1 << fb));
      var stored = raw & ((1 << MB) - 1);
      var mbits = toBin(stored, MB);
      var ebits = toBin(e & ((1 << EB) - 1), EB);
      var mBack = (stored >= (1 << (MB-1)) ? stored - (1 << MB) : stored) / (1 << fb);
      var back = mBack * Math.pow(2, e);
      steps.push({ h: "Target form",
        m: "value = mantissa × 2^exponent\nmantissa: " + MB + "-bit two's complement, point after the sign bit\nexponent: " + EB + "-bit two's complement",
        n: "Normalised means the mantissa starts 0.1 (positive) or 1.0 (negative)." });
      steps.push({ h: "Find the exponent",
        m: fmt(x) + " = " + fmt(m, 6) + " × 2^" + e,
        n: "Halve/double until the mantissa lands in [0.5, 1) for positives or [−1, −0.5) for negatives; count the moves." });
      steps.push({ h: "Encode the mantissa (" + MB + " bits)",
        m: "m × 2^" + fb + " = " + fmt(m, 6) + " × " + (1 << fb) + " = " + raw + (raw !== m * (1<<fb) ? "  (rounded)" : "") +
           "\ntwo's complement over " + MB + " bits → " + mbits[0] + "." + mbits.slice(1),
        n: mbits[0] === "0" ? "Starts 0.1 — correctly normalised positive." : "Starts 1.0 — correctly normalised negative." });
      steps.push({ h: "Encode the exponent (" + EB + " bits)",
        m: "exponent " + e + " → " + ebits + " (two's complement)" });
      steps.push({ h: "Verify by decoding",
        m: "mantissa " + mbits[0] + "." + mbits.slice(1) + " = " + fmt(mBack, 6) +
           "\n" + fmt(mBack, 6) + " × 2^" + e + " = " + fmt(back, 6) +
           (Math.abs(back - x) < 1e-9 ? "  ✓ exact" : "  (≈ " + fmt(x) + " — rounding error of " + fmt(Math.abs(back - x), 6) + ")"),
        n: Math.abs(back - x) < 1e-9 ? undefined : "Some values cannot be represented exactly — that sentence is itself worth a mark." });
      return { steps: steps,
        answer: "mantissa " + mbits[0] + "." + mbits.slice(1) + "   exponent " + ebits + "   (= " + fmt(back, 6) + ")" };
    }
  },
  {
    id: "suvat", cat: "applied", subject: "maths", ref: "S7.3",
    title: "suvat: pick the formula, solve the motion",
    blurb: "Given u, a, t — list the variables, choose the equations, find v and s.",
    inputs: [
      { k: "u", label: "u (m s⁻¹)", def: 4, type: "number", step: "any" },
      { k: "a", label: "a (m s⁻²)", def: 2.5, type: "number", step: "any" },
      { k: "t", label: "t (s)", def: 6, type: "number", step: "any" }
    ],
    random: function () { return { u: Math.floor(Math.random()*20)-5, a: (Math.floor(Math.random()*16)-6)/2, t: Math.floor(Math.random()*9)+2 }; },
    validate: function (v) { if (v.t <= 0) return "Time must be positive."; },
    solve: function (vv) {
      var u = +vv.u, a = +vv.a, t = +vv.t;
      var v = u + a * t, s = u * t + 0.5 * a * t * t;
      return { steps: [
        { h: "List the five variables", m: "s = ?\nu = " + fmt(u) + "\nv = ?\na = " + fmt(a) + "\nt = " + fmt(t),
          n: "Always write the suvat list first — it makes the right formula obvious and earns the method mark." },
        { h: "Find v (no s needed → v = u + at)",
          m: "v = u + at\nv = " + fmt(u) + " + (" + fmt(a) + ")(" + fmt(t) + ")\nv = " + fmt(v, 3) + " m s⁻¹" },
        { h: "Find s (no v needed → s = ut + ½at²)",
          m: "s = ut + ½at²\ns = (" + fmt(u) + ")(" + fmt(t) + ") + ½(" + fmt(a) + ")(" + fmt(t) + ")²\ns = " + fmt(u*t, 3) + " + " + fmt(0.5*a*t*t, 3) + " = " + fmt(s, 3) + " m",
          n: "These only hold for CONSTANT acceleration — if a varies, integrate instead (spec 7.4)." },
        { h: "Check with v² = u² + 2as",
          m: "u² + 2as = " + fmt(u*u, 3) + " + " + fmt(2*a*s, 3) + " = " + fmt(u*u + 2*a*s, 3) +
             "\nv² = " + fmt(v*v, 3) + "  ✓" }
      ], answer: "v = " + fmt(v, 3) + " m s⁻¹ ,  s = " + fmt(s, 3) + " m" };
    }
  },
  {
    id: "binom", cat: "pure", subject: "maths", ref: "4.1",
    title: "Binomial expansion (a + bx)\u207F",
    blurb: "Pascal-coefficient expansion for positive integer n, term by term.",
    inputs: [
      { k: "a", label: "a", def: 2, type: "number" },
      { k: "b", label: "b", def: -3, type: "number" },
      { k: "n", label: "n (2\u20136)", def: 4, type: "number" }
    ],
    random: function () { return { a: Math.floor(Math.random()*5)+1, b: Math.floor(Math.random()*9)-4 || 2, n: Math.floor(Math.random()*4)+2 }; },
    validate: function (v) {
      if (!Number.isInteger(+v.n) || v.n < 2 || v.n > 6) return "Keep n an integer from 2 to 6.";
      if (v.b === 0) return "b = 0 makes this just a\u207F \u2014 give b a value.";
    },
    solve: function (v) {
      var a = +v.a, b = +v.b, n = +v.n;
      function nCr(n, r) { var x = 1; for (var i = 0; i < r; i++) x = x * (n - i) / (i + 1); return Math.round(x); }
      var coefs = [], terms = [];
      for (var r = 0; r <= n; r++) {
        coefs.push(nCr(n, r));
        terms.push({ C: nCr(n, r), apow: n - r, bpow: r, val: nCr(n, r) * Math.pow(a, n - r) * Math.pow(b, r) });
      }
      var steps = [];
      steps.push({ h: "Write the general expansion",
        m: "(a + bx)\u207F = \u03A3 \u207FC\u1D63 \u00B7 a\u207F\u207B\u02B3 \u00B7 (bx)\u02B3   for r = 0 \u2026 n",
        n: "Powers of a fall as powers of bx rise \u2014 they always sum to n." });
      steps.push({ h: "Pascal's triangle row n = " + n,
        m: "coefficients: " + coefs.join("  ") });
      steps.push({ h: "Build each term",
        m: terms.map(function (t, r) {
          return "r=" + r + ":  " + t.C + " \u00D7 " + fmt(a) + "^" + t.apow + " \u00D7 (" + fmt(b) + "x)^" + t.bpow + " = " + fmt(t.val) + (t.bpow ? "x" + (t.bpow > 1 ? "^" + t.bpow : "") : "");
        }).join("\n"),
        n: "Bracket the bx \u2014 forgetting to raise b to the power r is THE classic error." });
      var poly = terms.map(function (t) { return { c: t.val, p: t.bpow }; }).filter(function (t) { return t.c !== 0; }).sort(function (x, y) { return x.p - y.p; });
      var expansion = poly.map(function (t, i) {
        var mag = Math.abs(t.c), out = i === 0 ? (t.c < 0 ? "\u2212" : "") : (t.c < 0 ? " \u2212 " : " + ");
        if (mag !== 1 || t.p === 0) out += fmt(mag);
        if (t.p >= 1) out += "x"; if (t.p > 1) out += "^" + t.p;
        return out;
      }).join("");
      steps.push({ h: "Collect ascending powers", m: "(" + fmt(a) + (b < 0 ? " \u2212 " : " + ") + fmt(Math.abs(b)) + "x)^" + n + " = " + expansion });
      return { steps: steps, answer: expansion };
    }
  },
  {
    id: "defint", cat: "pure", subject: "maths", ref: "8.3",
    title: "Definite integral: area under a polynomial",
    blurb: "Integrate term by term, substitute both limits, subtract \u2014 the full F(b) \u2212 F(a) layout.",
    inputs: [
      { k: "poly", label: "f(x) =", def: "3x^2 - 4x + 5", type: "text", w: 200 },
      { k: "lo", label: "from a =", def: 1, type: "number", step: "any" },
      { k: "hi", label: "to b =", def: 3, type: "number", step: "any" }
    ],
    random: function () {
      function r(n){return Math.floor(Math.random()*n*2+1)-n;}
      return { poly: Math.abs(r(4)||2)+"x^2 "+(r(6)>=0?"+":"-")+" "+Math.abs(r(6)||3)+"x "+(r(8)>=0?"+":"-")+" "+Math.abs(r(8)||4), lo: 0, hi: Math.floor(Math.random()*3)+2 };
    },
    validate: function (v) {
      if (!parsePoly(v.poly)) return "Couldn't read that polynomial \u2014 terms like 3x^2, -4x, 5.";
      if (+v.lo === +v.hi) return "The limits are equal \u2014 the area is trivially 0.";
    },
    solve: function (v) {
      var terms = parsePoly(v.poly), lo = +v.lo, hi = +v.hi;
      var F = terms.map(function (t) { return { c: t.c / (t.p + 1), p: t.p + 1 }; });
      var Fhi = polyEval(F, hi), Flo = polyEval(F, lo);
      var steps = [];
      steps.push({ h: "Integrate term by term",
        m: "\u222B " + polyStr(terms) + " dx = " + polyStr(F) + " (+ c)",
        n: "Raise the power, divide by the new power. The constant cancels in a definite integral \u2014 but say so." });
      steps.push({ h: "Substitute the upper limit",
        m: "F(" + fmt(hi) + ") = " + polyStr(F).replace(/x/g, "(" + fmt(hi) + ")") + " = " + fmt(Fhi, 4) });
      steps.push({ h: "Substitute the lower limit",
        m: "F(" + fmt(lo) + ") = " + polyStr(F).replace(/x/g, "(" + fmt(lo) + ")") + " = " + fmt(Flo, 4) });
      steps.push({ h: "Subtract: F(b) \u2212 F(a)",
        m: fmt(Fhi, 4) + " \u2212 (" + fmt(Flo, 4) + ") = " + fmt(Fhi - Flo, 4),
        n: "Bracket the lower value before subtracting \u2014 sign slips here cost the accuracy mark." });
      if (Fhi - Flo < 0) steps.push({ h: "Interpret the sign",
        m: "The integral is negative \u2192 the region (or its majority) lies BELOW the x-axis.\nArea = |" + fmt(Fhi - Flo, 4) + "| = " + fmt(Math.abs(Fhi - Flo), 4),
        n: "If the curve crosses the axis between the limits, split the integral at the root." });
      return { steps: steps, answer: "\u222B from " + fmt(lo) + " to " + fmt(hi) + " = " + fmt(Fhi - Flo, 4) };
    }
  },
  {
    id: "normal", cat: "applied", subject: "maths", ref: "S4.2",
    title: "Normal distribution: standardise & find P",
    blurb: "Sketch \u2192 standardise \u2192 look up. Z-value and probability for X ~ N(\u03BC, \u03C3\u00B2).",
    inputs: [
      { k: "mu", label: "\u03BC (mean)", def: 50, type: "number", step: "any" },
      { k: "sg", label: "\u03C3 (sd)", def: 4, type: "number", step: "any" },
      { k: "x", label: "P(X < x), x =", def: 56, type: "number", step: "any" }
    ],
    random: function () { var mu = Math.floor(Math.random()*60)+20, sg = Math.floor(Math.random()*8)+2;
      return { mu: mu, sg: sg, x: mu + (Math.floor(Math.random()*13)-6) }; },
    validate: function (v) { if (v.sg <= 0) return "\u03C3 must be positive."; },
    solve: function (v) {
      var mu = +v.mu, sg = +v.sg, x = +v.x;
      var z = (x - mu) / sg;
      function phi(z) { // \u03A6 via Abramowitz-Stegun erf approximation
        var t = 1 / (1 + 0.2316419 * Math.abs(z));
        var d = 0.3989423 * Math.exp(-z * z / 2);
        var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return z > 0 ? 1 - p : p;
      }
      var P = phi(z);
      return { steps: [
        { h: "State the model and sketch", m: "X ~ N(" + fmt(mu) + ", " + fmt(sg) + "\u00B2)\nSketch: bell centred on " + fmt(mu) + ", shade everything left of x = " + fmt(x) + ".",
          n: "The sketch IS a mark on many papers \u2014 and it catches \u2018wrong tail\u2019 errors before they happen." },
        { h: "Standardise", m: "Z = (X \u2212 \u03BC) / \u03C3 = (" + fmt(x) + " \u2212 " + fmt(mu) + ") / " + fmt(sg) + " = " + fmt(z, 4),
          n: "Write this line even when the calculator does the lookup \u2014 it is the method mark." },
        { h: "Probability", m: "P(X < " + fmt(x) + ") = P(Z < " + fmt(z, 4) + ") = \u03A6(" + fmt(z, 4) + ") = " + fmt(P, 4) },
        { h: "Complements you might need", m: "P(X > " + fmt(x) + ") = 1 \u2212 " + fmt(P, 4) + " = " + fmt(1 - P, 4) +
          "\nP(" + fmt(2*mu - x) + " < X < " + fmt(x) + ") = " + fmt(Math.abs(2 * P - 1), 4) + "  (symmetric interval about \u03BC)",
          n: "Points of inflection sit at \u03BC \u00B1 \u03C3 = " + fmt(mu - sg) + " and " + fmt(mu + sg) + " \u2014 quotable fact." }
      ], answer: "Z = " + fmt(z, 4) + " ,  P(X < " + fmt(x) + ") = " + fmt(P, 4) };
    }
  },
  {
    id: "arithseq", cat: "pure", subject: "maths", ref: "4.4",
    title: "Arithmetic sequence: nth term & sum",
    blurb: "Find uₙ = a + (n−1)d and the series sum Sₙ = n/2[2a + (n−1)d].",
    inputs: [
      { k: "a", label: "first term a", def: 3, type: "number", step: "any" },
      { k: "d", label: "common diff d", def: 5, type: "number", step: "any" },
      { k: "n", label: "term n", def: 12, type: "number" }
    ],
    random: function () { return { a: Math.floor(Math.random()*11)-3, d: Math.floor(Math.random()*9)-4 || 3, n: Math.floor(Math.random()*15)+6 }; },
    validate: function (v) { if (!Number.isInteger(+v.n) || v.n < 1) return "n must be a positive whole number."; },
    solve: function (v) {
      var a = +v.a, d = +v.d, n = +v.n;
      var un = a + (n - 1) * d;
      var Sn = n / 2 * (2 * a + (n - 1) * d);
      return { steps: [
        { h: "Identify a and d", m: "a = " + fmt(a) + " ,  d = " + fmt(d) + "  (each term adds d)",
          n: "d is term₂ − term₁. A negative d means the sequence decreases." },
        { h: "nth term formula", m: "uₙ = a + (n − 1)d\nu_" + n + " = " + fmt(a) + " + (" + n + " − 1)(" + fmt(d) + ") = " + fmt(a) + " + " + fmt((n-1)*d) + " = " + fmt(un) },
        { h: "Sum of the first n terms", m: "Sₙ = n/2 [2a + (n − 1)d]\nS_" + n + " = " + n + "/2 [2(" + fmt(a) + ") + (" + (n-1) + ")(" + fmt(d) + ")] = " + fmt(n/2) + " × " + fmt(2*a + (n-1)*d) + " = " + fmt(Sn),
          n: "Equivalent form Sₙ = n/2 (a + L) where L = uₙ = " + fmt(un) + " is the last term." }
      ], answer: "u_" + n + " = " + fmt(un) + " ,  S_" + n + " = " + fmt(Sn) };
    }
  },
  {
    id: "geomseq", cat: "pure", subject: "maths", ref: "4.5",
    title: "Geometric sequence: nth term, sum & sum to infinity",
    blurb: "uₙ = arⁿ⁻¹, Sₙ = a(1−rⁿ)/(1−r), and S∞ = a/(1−r) when |r| < 1.",
    inputs: [
      { k: "a", label: "first term a", def: 4, type: "number", step: "any" },
      { k: "r", label: "ratio r", def: 0.5, type: "number", step: "any" },
      { k: "n", label: "term n", def: 6, type: "number" }
    ],
    random: function () { var rs = [0.5, -0.5, 2, 3, 0.25, -2, 1.5]; return { a: Math.floor(Math.random()*8)+1, r: rs[Math.floor(Math.random()*rs.length)], n: Math.floor(Math.random()*6)+4 }; },
    validate: function (v) {
      if (!Number.isInteger(+v.n) || v.n < 1) return "n must be a positive whole number.";
      if (+v.r === 1) return "r = 1 is not geometric (it is constant) — pick another ratio.";
      if (+v.r === 0) return "r = 0 collapses the sequence — pick a non-zero ratio.";
    },
    solve: function (v) {
      var a = +v.a, r = +v.r, n = +v.n;
      var un = a * Math.pow(r, n - 1);
      var Sn = a * (1 - Math.pow(r, n)) / (1 - r);
      var steps = [
        { h: "Identify a and r", m: "a = " + fmt(a) + " ,  r = " + fmt(r) + "  (each term multiplies by r)",
          n: "r is term₂ ÷ term₁. Check the sign — a negative r makes terms alternate." },
        { h: "nth term", m: "uₙ = a rⁿ⁻¹\nu_" + n + " = " + fmt(a) + " × (" + fmt(r) + ")^" + (n-1) + " = " + fmt(un, 4) },
        { h: "Sum of first n terms", m: "Sₙ = a(1 − rⁿ)/(1 − r)\nS_" + n + " = " + fmt(a) + "(1 − (" + fmt(r) + ")^" + n + ")/(1 − " + fmt(r) + ") = " + fmt(Sn, 4) }
      ];
      if (Math.abs(r) < 1) {
        var Sinf = a / (1 - r);
        steps.push({ h: "Sum to infinity (|r| < 1 ✓)", m: "S∞ = a/(1 − r) = " + fmt(a) + "/(1 − " + fmt(r) + ") = " + fmt(Sinf, 4),
          n: "Convergent because |r| = " + fmt(Math.abs(r)) + " < 1. Always state this condition for the method mark." });
        return { steps: steps, answer: "u_" + n + " = " + fmt(un, 4) + " ,  S_" + n + " = " + fmt(Sn, 4) + " ,  S∞ = " + fmt(Sinf, 4) };
      }
      steps.push({ h: "Sum to infinity?", m: "|r| = " + fmt(Math.abs(r)) + " ≥ 1 → the series DIVERGES, so S∞ does not exist.",
        n: "Sum to infinity only exists when −1 < r < 1." });
      return { steps: steps, answer: "u_" + n + " = " + fmt(un, 4) + " ,  S_" + n + " = " + fmt(Sn, 4) + "  (diverges, no S∞)" };
    }
  },
  {
    id: "sinecos", cat: "pure", subject: "maths", ref: "5.1",
    title: "Triangle: cosine rule side + sine rule angle",
    blurb: "Two sides a, b and the included angle C → third side c, the area, then a remaining angle.",
    inputs: [
      { k: "a", label: "side a", def: 7, type: "number", step: "any" },
      { k: "b", label: "side b", def: 9, type: "number", step: "any" },
      { k: "C", label: "angle C°", def: 50, type: "number", step: "any" }
    ],
    random: function () { return { a: Math.floor(Math.random()*8)+4, b: Math.floor(Math.random()*8)+4, C: Math.floor(Math.random()*100)+30 }; },
    validate: function (v) {
      if (v.a <= 0 || v.b <= 0) return "Side lengths must be positive.";
      if (v.C <= 0 || v.C >= 180) return "Angle C must be strictly between 0° and 180°.";
    },
    solve: function (v) {
      var a = +v.a, b = +v.b, C = +v.C, rad = Math.PI / 180;
      var c = Math.sqrt(a*a + b*b - 2*a*b*Math.cos(C*rad));
      var area = 0.5 * a * b * Math.sin(C*rad);
      var sinA = a * Math.sin(C*rad) / c;
      var A = Math.asin(Math.min(1, Math.max(-1, sinA))) / rad;
      return { steps: [
        { h: "Cosine rule for the unknown side", m: "c² = a² + b² − 2ab cos C\nc² = " + fmt(a) + "² + " + fmt(b) + "² − 2(" + fmt(a) + ")(" + fmt(b) + ")cos " + fmt(C) + "° = " + fmt(a*a+b*b-2*a*b*Math.cos(C*rad), 4),
          n: "Use the cosine rule when you have two sides and the angle BETWEEN them (SAS)." },
        { h: "Take the square root", m: "c = " + fmt(c, 4),
          n: "Keep full accuracy here — don’t round before the next step." },
        { h: "Area of the triangle", m: "Area = ½ ab sin C = ½(" + fmt(a) + ")(" + fmt(b) + ")sin " + fmt(C) + "° = " + fmt(area, 4) },
        { h: "Sine rule for angle A", m: "sin A / a = sin C / c\nsin A = a sin C / c = " + fmt(a) + " sin " + fmt(C) + "° / " + fmt(c, 4) + " = " + fmt(sinA, 4) + "\nA = " + fmt(A, 2) + "°",
          n: "Angle B then follows from A + B + C = 180° → B = " + fmt(180 - C - A, 2) + "°." }
      ], answer: "c = " + fmt(c, 3) + " ,  area = " + fmt(area, 3) + " ,  A = " + fmt(A, 1) + "°" };
    }
  },
  {
    id: "vectors", cat: "pure", subject: "maths", ref: "10.4",
    title: "Vectors: displacement, magnitude & unit vector",
    blurb: "From position vectors A and B → the vector AB, its magnitude (distance) and the unit vector.",
    inputs: [
      { k: "ax", label: "Aₓ", def: 1, type: "number", step: "any" },
      { k: "ay", label: "Aᵧ", def: 2, type: "number", step: "any" },
      { k: "bx", label: "Bₓ", def: 4, type: "number", step: "any" },
      { k: "by", label: "Bᵧ", def: 6, type: "number", step: "any" }
    ],
    random: function () { function r(){return Math.floor(Math.random()*13)-6;} return { ax: r(), ay: r(), bx: r(), by: r() }; },
    validate: function (v) { if (+v.ax === +v.bx && +v.ay === +v.by) return "A and B are the same point — AB would be the zero vector."; },
    solve: function (v) {
      var ax = +v.ax, ay = +v.ay, bx = +v.bx, by = +v.by;
      var dx = bx - ax, dy = by - ay;
      var mag = Math.sqrt(dx*dx + dy*dy);
      var sr = surd(dx*dx + dy*dy);
      var surdStr = sr[0] === 1 ? "√" + sr[1] : (sr[1] === 1 ? String(sr[0]) : fmt(sr[0]) + "√" + sr[1]);
      return { steps: [
        { h: "Subtract position vectors", m: "AB = b − a = (" + fmt(bx) + " − " + fmt(ax) + ", " + fmt(by) + " − " + fmt(ay) + ") = (" + fmt(dx) + ", " + fmt(dy) + ")",
          n: "AB goes from A to B, so it is the destination minus the start: b − a (not a − b)." },
        { h: "Magnitude (Pythagoras)", m: "|AB| = √(" + fmt(dx) + "² + " + fmt(dy) + "²) = √" + fmt(dx*dx + dy*dy) + " = " + surdStr + " ≈ " + fmt(mag, 4),
          n: "This is also the distance between the two points." },
        { h: "Unit vector in the direction of AB", m: "ÂB = AB / |AB| = (1/" + fmt(mag, 4) + ")(" + fmt(dx) + ", " + fmt(dy) + ") = (" + fmt(dx/mag, 4) + ", " + fmt(dy/mag, 4) + ")",
          n: "A unit vector has magnitude 1 — check: " + fmt(dx/mag,3) + "² + " + fmt(dy/mag,3) + "² ≈ 1." }
      ], answer: "AB = (" + fmt(dx) + ", " + fmt(dy) + ") ,  |AB| = " + surdStr + " ≈ " + fmt(mag, 3) };
    }
  },
  {
    id: "newraph", cat: "pure", subject: "maths", ref: "9.3",
    title: "Newton–Raphson iteration",
    blurb: "xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ) — three iterations from your starting value.",
    inputs: [
      { k: "poly", label: "f(x) =", def: "x^3 - 2x - 5", type: "text", w: 200 },
      { k: "x0", label: "x₀", def: 2, type: "number", step: "any" }
    ],
    random: function () { var ps = ["x^3 - 2x - 5", "x^3 - x - 2", "x^2 - 3", "x^3 + x - 1", "x^3 - 6x + 2"]; return { poly: ps[Math.floor(Math.random()*ps.length)], x0: Math.floor(Math.random()*3)+1 }; },
    validate: function (v) {
      if (!parsePoly(v.poly)) return "Couldn’t read that polynomial — terms like x^3, -2x, 5.";
    },
    solve: function (v) {
      var f = parsePoly(v.poly), x0 = +v.x0;
      var fp = f.map(function (t) { return { c: t.c * t.p, p: t.p - 1 }; }).filter(function (t) { return t.c !== 0 && t.p >= 0; });
      if (polyEval(fp, x0) === 0) throw new Error("f'(x0)=0");
      var steps = [
        { h: "Differentiate f(x)", m: "f(x) = " + polyStr(f) + "\nf′(x) = " + polyStr(fp),
          n: "Newton–Raphson needs the gradient function f′(x)." },
        { h: "State the iterative formula", m: "xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)" }
      ];
      var x = x0, rows = [];
      for (var i = 0; i < 3; i++) {
        var fx = polyEval(f, x), fpx = polyEval(fp, x);
        if (fpx === 0) break;
        var xn = x - fx / fpx;
        rows.push("x_" + i + " = " + fmt(x, 6) + "  →  f = " + fmt(fx, 5) + " , f′ = " + fmt(fpx, 5) + "  →  x_" + (i+1) + " = " + fmt(xn, 6));
        x = xn;
      }
      steps.push({ h: "Iterate three times from x₀ = " + fmt(x0), m: rows.join("\n"),
        n: "Each row feeds its result into the next — keep every decimal place your calculator shows." });
      steps.push({ h: "Root estimate", m: "x ≈ " + fmt(x, 5) + "  (f(" + fmt(x,5) + ") ≈ " + fmt(polyEval(f, x), 5) + ")",
        n: "To justify accuracy to d.p., show a sign change of f across the rounding interval." });
      return { steps: steps, answer: "x ≈ " + fmt(x, 5) };
    }
  },
  {
    id: "binomprob", cat: "applied", subject: "maths", ref: "S4.1",
    title: "Binomial distribution: P(X = k) and P(X ≤ k)",
    blurb: "X ~ B(n, p): exact, cumulative and tail probabilities, plus the mean and variance.",
    inputs: [
      { k: "n", label: "trials n", def: 10, type: "number" },
      { k: "p", label: "p (success)", def: 0.3, type: "number", step: "any" },
      { k: "k", label: "k", def: 4, type: "number" }
    ],
    random: function () { var ps=[0.2,0.25,0.3,0.4,0.5,0.6,0.7]; var n=Math.floor(Math.random()*12)+6; return { n: n, p: ps[Math.floor(Math.random()*ps.length)], k: Math.floor(Math.random()*(n-1))+1 }; },
    validate: function (v) {
      if (!Number.isInteger(+v.n) || v.n < 1) return "n must be a positive whole number.";
      if (!Number.isInteger(+v.k) || v.k < 0 || v.k > v.n) return "k must be a whole number from 0 to n.";
      if (v.p <= 0 || v.p >= 1) return "p must be strictly between 0 and 1.";
    },
    solve: function (v) {
      var n = +v.n, p = +v.p, k = +v.k;
      var pmf = binPmf(n, p, k), cdf = binCdf(n, p, k);
      var ge = 1 - binCdf(n, p, k - 1);
      return { steps: [
        { h: "State the model", m: "X ~ B(" + n + ", " + fmt(p) + ")\nP(X = r) = ⁿCᵣ pʳ (1−p)ⁿ⁻ʳ",
          n: "Binomial conditions: fixed n, two outcomes, constant p, independent trials." },
        { h: "Exact probability P(X = " + k + ")", m: "= " + nCr(n, k) + " × " + fmt(p) + "^" + k + " × " + fmt(1-p) + "^" + (n-k) + " = " + fmt(pmf, 5),
          n: "ⁿCᵣ = " + n + "C" + k + " = " + nCr(n, k) + "." },
        { h: "Cumulative P(X ≤ " + k + ")", m: "= Σ P(X = 0 … " + k + ") = " + fmt(cdf, 5),
          n: "On the exam use the calculator’s binomialCD — but write the probability statement first." },
        { h: "Upper tail P(X ≥ " + k + ")", m: "= 1 − P(X ≤ " + (k-1) + ") = " + fmt(ge, 5),
          n: "Watch the boundary: P(X ≥ k) = 1 − P(X ≤ k−1), NOT 1 − P(X ≤ k)." },
        { h: "Mean and variance", m: "E(X) = np = " + fmt(n*p) + "\nVar(X) = np(1−p) = " + fmt(n*p*(1-p)) + "  (sd = " + fmt(Math.sqrt(n*p*(1-p)), 4) + ")" }
      ], answer: "P(X = " + k + ") = " + fmt(pmf, 4) + " ,  P(X ≤ " + k + ") = " + fmt(cdf, 4) };
    }
  },
  {
    id: "hyptest", cat: "applied", subject: "maths", ref: "S5.2",
    title: "Binomial hypothesis test (one-tailed)",
    blurb: "Test a claim about a proportion p: state H₀/H₁, find the tail probability, compare with the significance level.",
    inputs: [
      { k: "n", label: "sample n", def: 20, type: "number" },
      { k: "p0", label: "claimed p", def: 0.3, type: "number", step: "any" },
      { k: "x", label: "observed x", def: 10, type: "number" },
      { k: "tail", label: "tail", def: "upper", type: "select", opts: ["upper", "lower"] },
      { k: "sig", label: "sig level %", def: 5, type: "number", step: "any" }
    ],
    random: function () { var ps=[0.2,0.25,0.3,0.4,0.5]; var n=Math.floor(Math.random()*16)+15; return { n: n, p0: ps[Math.floor(Math.random()*ps.length)], x: Math.floor(Math.random()*n), tail: Math.random()<0.5?"upper":"lower", sig: [5,10,1][Math.floor(Math.random()*3)] }; },
    validate: function (v) {
      if (!Number.isInteger(+v.n) || v.n < 1) return "n must be a positive whole number.";
      if (!Number.isInteger(+v.x) || v.x < 0 || v.x > v.n) return "x must be a whole number from 0 to n.";
      if (v.p0 <= 0 || v.p0 >= 1) return "The claimed p must be strictly between 0 and 1.";
      if (v.sig <= 0 || v.sig >= 50) return "Significance level should be a small percentage (e.g. 5).";
    },
    solve: function (v) {
      var n = +v.n, p0 = +v.p0, x = +v.x, tail = v.tail, sig = +v.sig / 100;
      var upper = tail === "upper";
      var prob = upper ? (1 - binCdf(n, p0, x - 1)) : binCdf(n, p0, x);
      var reject = prob < sig;
      return { steps: [
        { h: "Define the parameter and hypotheses", m: "Let p = P(success). Under H₀ assume X ~ B(" + n + ", " + fmt(p0) + ").\nH₀: p = " + fmt(p0) + "\nH₁: p " + (upper ? ">" : "<") + " " + fmt(p0) + "   (" + (sig*100) + "% one-tailed)",
          n: "H₁ sets the tail: '>' → upper tail, '<' → lower tail." },
        { h: "Find the tail probability at x = " + x, m: (upper
            ? "P(X ≥ " + x + ") = 1 − P(X ≤ " + (x-1) + ") = " + fmt(prob, 5)
            : "P(X ≤ " + x + ") = " + fmt(prob, 5)),
          n: "Use the side the alternative hypothesis points to." },
        { h: "Compare with the significance level", m: fmt(prob, 5) + (reject ? " < " : " > ") + fmt(sig, 4) + "  →  the result is " + (reject ? "in" : "NOT in") + " the critical region",
          n: "Reject H₀ only if the tail probability is LESS than the significance level." },
        { h: "Conclusion (in context)", m: (reject
            ? "Reject H₀. There is sufficient evidence at the " + (sig*100) + "% level that p " + (upper ? ">" : "<") + " " + fmt(p0) + "."
            : "Do not reject H₀. Insufficient evidence at the " + (sig*100) + "% level to say p " + (upper ? ">" : "<") + " " + fmt(p0) + "."),
          n: "Always write the conclusion in the words of the original claim — a pure 'reject/accept' loses the final mark." }
      ], answer: (upper ? "P(X ≥ " + x + ") = " : "P(X ≤ " + x + ") = ") + fmt(prob, 4) + " → " + (reject ? "reject H₀" : "do not reject H₀") };
    }
  },
  {
    id: "partialfrac", cat: "pure", subject: "maths", ref: "2.10",
    title: "Partial fractions (distinct linear factors)",
    blurb: "Split (px + q) / ((x − a)(x − b)) into A/(x − a) + B/(x − b) by the cover-up rule.",
    inputs: [
      { k: "p", label: "numerator px + q : p", def: 3, type: "number", step: "any" },
      { k: "q", label: "q", def: 1, type: "number", step: "any" },
      { k: "a", label: "root a", def: 1, type: "number", step: "any" },
      { k: "b", label: "root b", def: -2, type: "number", step: "any" }
    ],
    random: function () { function r(){return Math.floor(Math.random()*7)-3;} var a=r(),b=r(); while(b===a)b=r(); return { p: Math.floor(Math.random()*5)+1, q: r(), a: a, b: b }; },
    validate: function (v) { if (+v.a === +v.b) return "The two roots must be different for distinct linear factors."; },
    solve: function (v) {
      var p = +v.p, q = +v.q, a = +v.a, b = +v.b;
      var A = (p * a + q) / (a - b), B = (p * b + q) / (b - a);
      function fac(r) { return r === 0 ? "x" : (r < 0 ? "(x + " + fmt(-r) + ")" : "(x − " + fmt(r) + ")"); }
      function num() { return fmt(p) + "x" + (q < 0 ? " − " + fmt(-q) : q > 0 ? " + " + fmt(q) : ""); }
      return { steps: [
        { h: "Set up the identity", m: "(" + num() + ") / [" + fac(a) + fac(b) + "] ≡ A/" + fac(a) + " + B/" + fac(b) +
            "\nMultiply through: " + num() + " ≡ A" + fac(b) + " + B" + fac(a),
          n: "Same denominator on both sides, so the numerators are identically equal for all x." },
        { h: "Cover-up for A: let x = " + fmt(a), m: "A = (" + fmt(p) + "·" + fmt(a) + " + " + fmt(q) + ") / (" + fmt(a) + " − " + fmt(b) + ") = " + fmt(p*a+q) + " / " + fmt(a-b) + " = " + fmt(A, 4),
          n: "Substituting x = a kills the B term, leaving A directly." },
        { h: "Cover-up for B: let x = " + fmt(b), m: "B = (" + fmt(p) + "·" + fmt(b) + " + " + fmt(q) + ") / (" + fmt(b) + " − " + fmt(a) + ") = " + fmt(p*b+q) + " / " + fmt(b-a) + " = " + fmt(B, 4) },
        { h: "Write the partial fractions", m: "(" + num() + ") / [" + fac(a) + fac(b) + "] = " + fmt(A, 4) + "/" + fac(a) + " + " + fmt(B, 4) + "/" + fac(b),
          n: "Check by substituting one easy value (e.g. x = 0) into both forms." }
      ], answer: "A = " + fmt(A, 4) + " ,  B = " + fmt(B, 4) };
    }
  },
  {
    id: "kinematics", cat: "applied", subject: "maths", ref: "S7.4",
    title: "Kinematics by calculus: s → v → a",
    blurb: "Differentiate a displacement function to velocity then acceleration, and evaluate all three at a chosen time.",
    inputs: [
      { k: "poly", label: "s(t) =", def: "t^3 - 4t^2 + 2t", type: "text", w: 200 },
      { k: "t", label: "at t =", def: 3, type: "number", step: "any" }
    ],
    random: function () { var ps = ["t^3 - 4t^2 + 2t", "2t^3 - 9t^2 + 12t", "t^3 - 6t^2 + 9t", "5t^2 - t^3", "t^3 - 3t"]; return { poly: ps[Math.floor(Math.random()*ps.length)], t: Math.floor(Math.random()*4)+1 }; },
    validate: function (v) { if (!parsePoly((v.poly||"").replace(/t/g, "x"))) return "Couldn’t read s(t) — use terms like t^3, -4t^2, 2t."; },
    solve: function (v) {
      var s = parsePoly(v.poly.replace(/t/g, "x")), t = +v.t;
      var vel = s.map(function (k) { return { c: k.c * k.p, p: k.p - 1 }; }).filter(function (k) { return k.c !== 0 && k.p >= 0; });
      var acc = vel.map(function (k) { return { c: k.c * k.p, p: k.p - 1 }; }).filter(function (k) { return k.c !== 0 && k.p >= 0; });
      function show(terms) { return polyStr(terms).replace(/x/g, "t"); }
      var sv = polyEval(s, t), vv = polyEval(vel, t), av = polyEval(acc, t);
      return { steps: [
        { h: "Displacement", m: "s(t) = " + show(s) + "\ns(" + fmt(t) + ") = " + fmt(sv, 4),
          n: "Velocity is the rate of change of displacement: v = ds/dt." },
        { h: "Differentiate for velocity", m: "v(t) = ds/dt = " + show(vel) + "\nv(" + fmt(t) + ") = " + fmt(vv, 4),
          n: "v = 0 marks the instant the object is momentarily at rest (turning point of s)." },
        { h: "Differentiate again for acceleration", m: "a(t) = dv/dt = " + show(acc) + "\na(" + fmt(t) + ") = " + fmt(av, 4),
          n: "a = 0 gives maximum/minimum velocity. Negative a with positive v means decelerating." }
      ], answer: "s = " + fmt(sv, 3) + " ,  v = " + fmt(vv, 3) + " ,  a = " + fmt(av, 3) + "  (at t = " + fmt(t) + ")" };
    }
  },
  {
    id: "expmodel", cat: "pure", subject: "maths", ref: "6.7",
    title: "Exponential growth & decay: A = A₀e^{kt}",
    blurb: "Evaluate an exponential model at time t, and find the doubling time or half-life from the rate k.",
    inputs: [
      { k: "A0", label: "initial A₀", def: 500, type: "number", step: "any" },
      { k: "k", label: "rate k", def: -0.08, type: "number", step: "any" },
      { k: "t", label: "time t", def: 10, type: "number", step: "any" }
    ],
    random: function () { var k = (Math.floor(Math.random()*30)+3) / 100 * (Math.random()<0.5?-1:1); return { A0: (Math.floor(Math.random()*9)+1)*100, k: Math.round(k*100)/100, t: Math.floor(Math.random()*15)+3 }; },
    validate: function (v) {
      if (+v.A0 <= 0) return "Initial amount A₀ must be positive.";
      if (+v.k === 0) return "k = 0 gives a constant — pick a non-zero rate.";
    },
    solve: function (v) {
      var A0 = +v.A0, k = +v.k, t = +v.t;
      var A = A0 * Math.exp(k * t);
      var grow = k > 0;
      var period = Math.log(2) / Math.abs(k);
      return { steps: [
        { h: "State the model", m: "A = A₀ e^{kt} = " + fmt(A0) + " e^{" + fmt(k) + "t}",
          n: "k " + (grow ? "> 0 → growth (A increases)" : "< 0 → decay (A decreases towards 0)") + "." },
        { h: "Substitute t = " + fmt(t), m: "A = " + fmt(A0) + " e^{" + fmt(k) + " × " + fmt(t) + "} = " + fmt(A0) + " e^{" + fmt(k*t, 4) + "} = " + fmt(A, 4),
          n: "Keep the exponent exact until the final evaluation to avoid rounding error." },
        { h: grow ? "Doubling time" : "Half-life", m: (grow ? "A = 2A₀ ⇒ e^{kt} = 2 ⇒ t = ln 2 / k" : "A = ½A₀ ⇒ e^{kt} = ½ ⇒ t = ln 2 / |k|") +
            "\nt = ln 2 / " + fmt(Math.abs(k)) + " = " + fmt(period, 4),
          n: "This " + (grow ? "doubling time" : "half-life") + " is constant — independent of the starting amount." }
      ], answer: "A(" + fmt(t) + ") = " + fmt(A, 3) + " ,  " + (grow ? "doubling time" : "half-life") + " = " + fmt(period, 3) };
    }
  }];

  /* ---------- shared mount so notes pages can embed a generator ---------- */
  function mountGenerator(panel, g) {
    panel.appendChild(KOS.ui.el("p", { class: "sub", style: "margin-top:0", text: g.blurb }));
    panel.appendChild(KOS.ui.el("div", { class: "specref", style: "font-family:var(--mono);font-size:10.5px;color:var(--faint);margin-bottom:10px",
      text: (g.subject === "maths" ? "Edexcel 9MA0 \u00B7 " : "AQA 7517 \u00B7 ") + g.ref }));

    var fields = {};
    var controls = KOS.ui.el("div", { class: "lab-controls" });
    g.inputs.forEach(function (inp) {
      var f;
      if (inp.type === "select") {
        f = KOS.ui.el("select", {}, inp.opts.map(function (o) { return KOS.ui.el("option", { value: o, text: o }); }));
        f.value = inp.def;
      } else {
        f = KOS.ui.el("input", { type: inp.type, value: inp.def });
        if (inp.step) f.step = inp.step;
        if (inp.w) f.style.width = inp.w + "px";
      }
      fields[inp.k] = f;
      controls.appendChild(KOS.ui.el("label", {}, [inp.label, f]));
    });
    controls.appendChild(KOS.ui.el("button", { class: "btn primary", text: "Generate working", onclick: run }));
    controls.appendChild(KOS.ui.el("button", { class: "btn gold", text: "\u2684 Randomise", onclick: function () {
      var r = g.random();
      Object.keys(r).forEach(function (k) { if (fields[k]) fields[k].value = r[k]; });
      run();
    }}));
    panel.appendChild(controls);
    var out = KOS.ui.el("div", {});
    panel.appendChild(out);

    function run() {
      out.innerHTML = "";
      var vals = {};
      Object.keys(fields).forEach(function (k) {
        var f = fields[k];
        vals[k] = f.type === "number" ? parseFloat(f.value) : f.value;
      });
      for (var k in vals) {
        if (typeof vals[k] === "number" && isNaN(vals[k])) {
          KOS.ui.toast("Fill in every input with a number first.", true); return;
        }
      }
      var err = g.validate && g.validate(vals);
      if (err) { KOS.ui.toast(err, true); return; }
      var result;
      try { result = g.solve(vals); }
      catch (e) { console.error(e); KOS.ui.toast("That input broke the generator \u2014 try different values.", true); return; }

      var revealed = 0;
      var stepEls = result.steps.map(function (st, i) {
        var d = KOS.ui.el("div", { class: "step", style: i === 0 ? "" : "display:none" }, [
          KOS.ui.el("div", { class: "sh", text: "Step " + (i + 1) + " \u2014 " + st.h }),
          KOS.ui.el("div", { class: "sm", text: st.m }),
          st.n ? KOS.ui.el("div", { class: "sn", text: st.n }) : null
        ]);
        if (i === 0) d.classList.add("revealed");
        return d;
      });
      var ansEl = KOS.ui.el("div", { class: "answerline", style: "display:none", text: "\u25B8 " + result.answer });
      var nextBtn = KOS.ui.el("button", { class: "btn", text: "Reveal next step", onclick: function () { reveal(1); } });
      var allBtn = KOS.ui.el("button", { class: "btn gold", text: "Reveal all", onclick: function () { reveal(99); } });
      function reveal(n) {
        while (n-- > 0 && revealed < stepEls.length - 1) {
          revealed++;
          stepEls[revealed].style.display = "";
          stepEls[revealed].classList.add("revealed");
        }
        if (revealed >= stepEls.length - 1) {
          ansEl.style.display = "";
          nextBtn.disabled = true; allBtn.disabled = true;
        }
      }
      stepEls.forEach(function (d) { out.appendChild(d); });
      out.appendChild(ansEl);
      if (stepEls.length > 1) {
        out.appendChild(KOS.ui.el("div", { class: "lab-controls", style: "margin-top:14px" }, [nextBtn, allBtn]));
      } else { ansEl.style.display = ""; }
    }
    run();
  }

  /* generators wired straight onto spec refs — a generator's own `ref` field is
     a human-readable label (e.g. "7.2 / 7.3"), so matching needs an explicit map.
     Mirrors KOS.sims.forRef so the ref page surfaces a Worked tab automatically. */
  var GENWIRE = {
    "maths:2.3": ["quad"],
    "maths:2.10": ["partialfrac"],
    "maths:4.1": ["binom"],
    "maths:4.4": ["arithseq"],
    "maths:4.5": ["geomseq"],
    "maths:5.1": ["sinecos"],
    "maths:5.7": ["trig"],
    "maths:6.5": ["logs"],
    "maths:6.7": ["expmodel"],
    "maths:7.2": ["diff"], "maths:7.3": ["diff"],
    "maths:8.3": ["defint"],
    "maths:9.3": ["newraph"],
    "maths:10.1": ["vectors"], "maths:10.4": ["vectors"],
    "maths:S4.1": ["binomprob"],
    "maths:S4.2": ["normal"],
    "maths:S5.2": ["hyptest"],
    "maths:S7.3": ["suvat"], "maths:S7.4": ["kinematics"],
    "compsci:4.5.4.2": ["bin"], "compsci:4.5.4.3": ["bin"],
    "compsci:4.5.4.4": ["float"]
  };

  KOS.worked = {
    byIds: function (ids) { return (ids || []).map(function (id) {
      return GENS.find(function (g) { return g.id === id; }); }).filter(Boolean); },
    forRef: function (sid, ref) {
      return (GENWIRE[sid + ":" + ref] || []).map(function (id) {
        return GENS.find(function (g) { return g.id === id; }); }).filter(Boolean);
    },
    mount: mountGenerator,
    all: function () { return GENS.slice(); },
    /* shared maths helpers (sims.js reuses these) */
    parsePoly: parsePoly, polyStr: polyStr, polyEval: polyEval
  };

  /* ---------- view: grouped by subject area ---------- */
  var CATS = [["pure", "Pure Maths"], ["applied", "Stats & Mechanics"], ["cs", "Computer Science"]];

  KOS.views.worked = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Worked Example Engine" }),
      el("p", { class: "sub", text: "Mark-scheme-shaped walkthroughs with your own numbers. Grouped by paper so Pure, Applied and Computer Science never blur together." })
    ]));

    var saved = store.state.worked.last || "quad";
    var savedGen = GENS.find(function (g) { return g.id === saved; }) || GENS[0];
    var curCat = savedGen.cat;

    var catRow = el("div", { class: "cat-pills" });
    var tabs = el("div", { class: "lab-tabs" });
    var panel = el("div", { class: "lab-panel lab-wrap" });

    CATS.forEach(function (c) {
      catRow.appendChild(el("button", {
        class: "cat-pill" + (c[0] === curCat ? " active" : ""),
        onclick: function () {
          curCat = c[0];
          catRow.querySelectorAll(".cat-pill").forEach(function (b, i) {
            b.classList.toggle("active", CATS[i][0] === curCat); });
          buildTabs();
        }
      }, [c[1]]));
    });
    main.appendChild(catRow);
    main.appendChild(tabs);
    main.appendChild(panel);

    function buildTabs() {
      tabs.innerHTML = "";
      var gens = GENS.filter(function (g) { return g.cat === curCat; });
      var cur = gens.find(function (g) { return g.id === store.state.worked.last; }) || gens[0];
      gens.forEach(function (g) {
        tabs.appendChild(el("button", {
          class: "lab-tab" + (g === cur ? " active" : ""),
          onclick: function () {
            store.state.worked.last = g.id; store.save();
            tabs.querySelectorAll(".lab-tab").forEach(function (b, i) {
              b.classList.toggle("active", gens[i] === g); });
            openGen(g);
          }
        }, [g.title]));
      });
      openGen(cur);
    }
    function openGen(g) {
      store.state.worked.last = g.id; store.save();
      panel.innerHTML = "";
      mountGenerator(panel, g);
    }
    buildTabs();
  };
})();
