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

  KOS.worked = {
    byIds: function (ids) { return (ids || []).map(function (id) {
      return GENS.find(function (g) { return g.id === id; }); }).filter(Boolean); },
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
