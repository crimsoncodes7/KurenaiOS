/* Kurenai OS — labs/sims-algorithms.js
   Algorithm labs drawn as 20a diagrams on the lab system: sorting (bubble
   and merge), linear and binary search, the Reverse Polish evaluator and
   recursion's call stack. Every algorithm is run once, up front, into a
   list of frames; the stage and readout replay them (Step ›, ▶ Run), so
   what is drawn is always a state the algorithm really passed through. */
(function () {
  "use strict";
  var el = KOS.ui.el, L = KOS.lab;

  function numIn(v, w) { return el("input", { type: "number", value: v, inputmode: "numeric", style: "--w: " + (w || 64) + "px" }); }
  function readNum(input, lo, hi) {
    var t = String(input.value).trim(), n = Number(t);
    if (t === "" || !isFinite(n) || n < lo || n > hi) { KOS.ui.toast("Enter a number from " + lo + " to " + hi + ".", true); return null; }
    return n;
  }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function stepMeta(i, n) { return n > 1 ? "Step " + (i + 1) + " of " + n : null; }

  /* =================== sorting: bubble and merge =================== */
  function sortLab(panel) {
    var alg = "bubble", size = 12, data = [], shown = null;
    var lab = L.create(panel, {
      controls: [
        L.choice([["bubble", "Bubble"], ["merge", "Merge"]], alg, function (a) { alg = a; build(); }, "Algorithm"),
        L.choice([["8", "8"], ["12", "12"], ["16", "16"]], String(size), function (n) { size = +n; fresh(); }, "Items"),
        L.action("New data", fresh)
      ],
      transport: true, speed: true, tick: 520, label: "Sorting bar chart",
      onReset: function () { build(); }
    });
    lab.legend([["fill-hot", "being compared"], ["fill-front", "just moved"], ["fill-done", "in its final place"], ["area-ink", "merge run"]]);
    function fresh() { data = []; for (var i = 0; i < size; i++) data.push(rnd(5, 99)); build(); }

    function build() {
      var a = data.slice(), out = [], comps = 0, moves = 0, n = a.length;
      function F(o) { o.a = a.slice(); o.comps = comps; o.moves = moves; o.tones = o.tones || {}; out.push(o); }
      F({ say: [alg === "bubble" ? "Bubble sort compares neighbours and swaps any pair in the wrong order. After each pass the largest unsorted value has bubbled to the end." : "Merge sort splits the list into halves until each run is one item long, then merges runs back in order."] });
      if (alg === "bubble") {
        var done = n;
        for (var pass = 0; pass < n - 1; pass++) {
          var swapped = false;
          for (var i = 0; i < n - 1 - pass; i++) {
            comps++;
            var t = sortedTones(done); t[i] = "hot"; t[i + 1] = "hot";
            var big = a[i] > a[i + 1];
            F({ tones: t, pass: pass + 1, say: ["Pass " + (pass + 1) + ": compare ", [a[i], "hot"], " and ", [a[i + 1], "hot"], big ? " — the left is larger, so swap." : " — already in order."] });
            if (big) {
              var s = a[i]; a[i] = a[i + 1]; a[i + 1] = s; moves++; swapped = true;
              var t2 = sortedTones(done); t2[i] = "front-wash"; t2[i + 1] = "front-wash";
              F({ tones: t2, pass: pass + 1, say: ["Swapped: ", [a[i], "front"], " now sits before ", [a[i + 1], "front"], "."] });
            }
          }
          done = n - 1 - pass;
          if (!swapped) {
            F({ tones: sortedTones(0), pass: pass + 1, say: ["Pass " + (pass + 1) + " made no swaps, so the list is sorted and bubble sort stops early."] });
            done = 0; break;
          }
          F({ tones: sortedTones(done), pass: pass + 1, say: ["End of pass " + (pass + 1) + ": ", [a[done], "done"], " is in its final place."] });
        }
        F({ tones: sortedTones(0), say: ["Sorted after " + plural(comps, "comparison") + " and " + plural(moves, "swap") + ". Bubble sort is O(n²): double n and the comparisons roughly quadruple."] });
      } else {
        (function ms(lo, hi) {
          if (lo >= hi) return;
          var mid = (lo + hi) >> 1;
          ms(lo, mid); ms(mid + 1, hi);
          var left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1), i = 0, j = 0, k = lo, merged = [];
          F({ band: [lo, hi], split: mid, say: ["Merge the runs [" + left.join(", ") + "] and [" + right.join(", ") + "]."] });
          while (i < left.length && j < right.length) {
            comps++;
            var t = {}; t[lo + i] = "hot"; t[mid + 1 + j] = "hot";
            var takeL = left[i] <= right[j];
            F({ band: [lo, hi], split: mid, tones: t, out: merged.slice(), say: ["Compare ", [left[i], "hot"], " and ", [right[j], "hot"], ": take the smaller, " + (takeL ? left[i] : right[j]) + "."] });
            merged.push(takeL ? left[i++] : right[j++]);
          }
          while (i < left.length) merged.push(left[i++]);
          while (j < right.length) merged.push(right[j++]);
          for (var m = 0; m < merged.length; m++) { a[k + m] = merged[m]; moves++; }
          var t3 = {}; for (var q = lo; q <= hi; q++) t3[q] = "front-wash";
          F({ band: [lo, hi], tones: t3, say: ["Write the merged run back: [" + merged.join(", ") + "]."] });
        })(0, n - 1);
        F({ tones: sortedTones(0), say: ["Sorted after " + plural(comps, "comparison") + " and " + plural(moves, "write") + ". Merge sort is O(n log n) whatever the order of the input, at the cost of extra memory for the runs."] });
      }
      function sortedTones(from) { var t = {}; for (var x = from; x < n; x++) t[x] = "done"; return t; }
      lab.steps(out, render);
    }
    function render(f, i, n) {
      shown = f;
      lab.draw(paint);
      lab.now(f.say, stepMeta(i, n));
      lab.values([["comparisons", String(f.comps)], [alg === "bubble" ? "swaps" : "writes", String(f.moves)], f.pass ? ["pass", String(f.pass)] : null, ["items", String(f.a.length)]]);
    }
    function paint(d) {
      var f = shown, n = f.a.length, X0 = 40, W = 720, gap = 6, bw = (W - gap * (n - 1)) / n, base = 364, top = 64;
      if (f.band) {
        var bx = X0 + f.band[0] * (bw + gap) - gap / 2, ex = X0 + (f.band[1] + 1) * (bw + gap) - gap / 2;
        d.rect(bx, top - 24, ex - bx, base - top + 56, { rx: 12, cls: "k-sv-area" });
        if (f.split != null) { var sx = X0 + (f.split + 1) * (bw + gap) - gap / 2; d.line(sx, top - 16, sx, base + 24, { tone: "line", dash: true }); }
      }
      f.a.forEach(function (v, i) {
        var h = (base - top) * v / 100, x = X0 + i * (bw + gap), tn = f.tones[i];
        d.rect(x, base - h, bw, h, { rx: 6, tone: tn || "soft" });
        d.text(x + bw / 2, base - h - 8, String(v), { size: 14, tone: tn === "hot" ? "hot" : tn === "done" ? "done" : tn === "front-wash" ? "front" : "sub" });
        d.text(x + bw / 2, base + 22, String(i), { size: 14, tone: "mute" });
      });
      return { w: 800, h: 450, count: n, noun: "item" };
    }
    fresh();
  }

  /* =================== searching: linear and binary =================== */
  function searchLab(panel, kind) {
    var N = kind === "binary" ? 15 : 12, arr = [], shown = null;
    var tIn = numIn(0);
    var lab = L.create(panel, {
      controls: [L.field("Target", tIn), L.action("Search", search, true), L.action(kind === "binary" ? "New sorted array" : "New array", fresh)],
      transport: true, label: (kind === "binary" ? "Binary" : "Linear") + " search diagram",
      onReset: function () { idle(); }
    });
    lab.legend(kind === "binary"
      ? [["fill-hot", "mid"], ["ring-ink", "still in range"], ["fill-done", "found"], ["fill-mute", "discarded"]]
      : [["fill-hot", "comparing"], ["fill-mute", "checked"], ["fill-done", "found"]]);
    function fresh() {
      arr = [];
      if (kind === "binary") { var v = rnd(1, 8); for (var i = 0; i < N; i++) { arr.push(v); v += rnd(2, 8); } }
      else for (var k = 0; k < N; k++) arr.push(rnd(1, 30));
      tIn.value = arr[rnd(0, N - 1)];
      idle();
    }
    function idle() {
      lab.steps([{ lo: 0, hi: N - 1, tones: {}, comps: 0,
        say: kind === "binary" ? ["Binary search needs a sorted array. Each comparison with the middle item discards half of what is left."]
                               : ["Linear search checks each item in turn from the start. It works on any array, sorted or not."] }], render);
    }
    function search() {
      var t = readNum(tIn, -999, 9999); if (t == null) return;
      var out = [], comps = 0;
      if (kind === "binary") {
        var lo = 0, hi = N - 1, gone = {};
        while (lo <= hi) {
          var mid = (lo + hi) >> 1, tn = {};
          comps++;
          Object.keys(gone).forEach(function (k) { tn[k] = "well"; });
          tn[mid] = arr[mid] === t ? "done" : "hot";
          if (arr[mid] === t) {
            out.push({ lo: lo, hi: hi, mid: mid, tones: tn, comps: comps, say: ["mid = (" + lo + " + " + hi + ") div 2 = " + mid + ", and a[" + mid + "] = ", [t, "done"], ". Found after " + plural(comps, "comparison") + "."] });
            return lab.steps(out, render, { autoplay: true });
          }
          var less = arr[mid] < t;
          out.push({ lo: lo, hi: hi, mid: mid, tones: tn, comps: comps,
            say: ["mid = (" + lo + " + " + hi + ") div 2 = " + mid + ". a[" + mid + "] = ", [arr[mid], "hot"], less ? " is less than " + t + ", so discard it and everything left of it: lo ← " + (mid + 1) + "." : " is greater than " + t + ", so discard it and everything right of it: hi ← " + (mid - 1) + "."] });
          if (less) { for (var a = lo; a <= mid; a++) gone[a] = 1; lo = mid + 1; } else { for (var b = mid; b <= hi; b++) gone[b] = 1; hi = mid - 1; }
        }
        var tg = {}; Object.keys(gone).forEach(function (k) { tg[k] = "well"; });
        out.push({ lo: lo, hi: hi, tones: tg, comps: comps, say: ["lo (" + lo + ") has passed hi (" + hi + "): the range is empty, so ", [t, "hot"], " is not in the array. " + plural(comps, "comparison") + " for " + N + " items — at most ⌈log₂(" + (N + 1) + ")⌉ = " + Math.ceil(Math.log2(N + 1)) + "."] });
      } else {
        for (var i = 0; i < N; i++) {
          comps++;
          var tl = {}; for (var j = 0; j < i; j++) tl[j] = "well";
          tl[i] = arr[i] === t ? "done" : "hot";
          if (arr[i] === t) { out.push({ i: i, tones: tl, comps: comps, say: ["a[" + i + "] = ", [t, "done"], ". Found after " + plural(comps, "comparison") + "."] }); return lab.steps(out, render, { autoplay: true }); }
          out.push({ i: i, tones: tl, comps: comps, say: ["a[" + i + "] = ", [arr[i], "hot"], " is not " + t + ", so move on to index " + (i + 1) + "."] });
        }
        var tw = {}; for (var q = 0; q < N; q++) tw[q] = "well";
        out.push({ tones: tw, comps: comps, say: ["Reached the end: ", [t, "hot"], " is not in the array. A miss always costs all " + N + " comparisons — O(n)."] });
      }
      lab.steps(out, render, { autoplay: true });
    }
    function render(f, i, n) {
      shown = f;
      lab.draw(paint);
      lab.now(f.say, stepMeta(i, n));
      lab.values(kind === "binary"
        ? [["lo", String(f.lo)], ["mid", f.mid != null ? String(f.mid) : "—", "hot"], ["hi", String(f.hi)], ["comparisons", String(f.comps)]]
        : [["i", f.i != null ? String(f.i) : "—", "hot"], ["comparisons", String(f.comps)]]);
    }
    function paint(d) {
      var f = shown, cw = 46, gap = 6, X0 = (800 - (N * cw + (N - 1) * gap)) / 2, Y = 200;
      arr.forEach(function (v, i) {
        var x = X0 + i * (cw + gap), tn = f.tones[i];
        var inRange = kind !== "binary" || (i >= f.lo && i <= f.hi);
        d.rect(x, Y, cw, 52, { tone: tn || (inRange && kind === "binary" ? "ink" : null) });
        d.text(x + cw / 2, Y + 32, String(v), { weight: "bold", tone: tn === "hot" || tn === "done" ? "on" : tn === "well" ? "mute" : null });
        d.text(x + cw / 2, Y + 78, String(i), { size: 14, tone: "mute" });
      });
      function ptr(i, name, tone, up) {
        if (i == null || i < 0 || i >= N) return;
        var x = X0 + i * (cw + gap) + cw / 2, y0 = Y - 6 - up;
        d.line(x, y0 - 24, x, y0, { tone: tone, arrow: true });
        d.text(x, y0 - 32, name, { size: 14, tone: tone, weight: "bold" });
      }
      if (kind === "binary") {
        if (f.lo <= f.hi) {
          var same = f.lo === f.hi;
          ptr(f.lo, same ? "lo = hi" : "lo", "ink", 0);
          if (!same) ptr(f.hi, "hi", "ink", 0);
        }
        if (f.mid != null) ptr(f.mid, "mid", "hot", f.mid === f.lo || f.mid === f.hi ? 46 : 0);
      } else ptr(f.i, "i", "hot", 0);
      return { w: 800, h: 450, count: N, noun: "item" };
    }
    fresh();
  }

  /* =================== Reverse Polish evaluation =================== */
  function rpnLab(panel) {
    var exprIn = el("input", { type: "text", value: "3 4 + 5 2 - *", style: "--w: 220px", spellcheck: "false" }), shown = null;
    var lab = L.create(panel, {
      controls: [L.field("Postfix", exprIn), L.action("Evaluate", evaluate, true),
        L.choice([["3 4 + 5 2 - *", "(3+4)×(5−2)"], ["2 3 4 * +", "2+3×4"], ["8 2 / 3 -", "8÷2−3"]], "3 4 + 5 2 - *", function (e) { exprIn.value = e; evaluate(); }, "Examples")],
      transport: true, label: "Postfix evaluation: the tokens and the stack",
      onReset: function () { evaluate(true); }
    });
    lab.legend([["fill-hot", "current token"], ["ring-done", "pushed"], ["fill-front", "popped"]]);
    function norm(s) { return s.replace(/×/g, "*").replace(/÷/g, "/").replace(/[−–]/g, "-"); }
    function isOp(t) { return /^[-+*/^]$/.test(t); }
    function evaluate(quiet) {
      var toks = norm(exprIn.value).trim().split(/\s+/).filter(Boolean), st = [], out = [];
      if (!toks.length) { KOS.ui.toast("Type a postfix expression, tokens separated by spaces.", true); return; }
      if (toks.length > 21) { KOS.ui.toast("Keep it to 21 tokens or fewer.", true); return; }
      out.push({ toks: toks, at: -1, st: [], say: ["Read the tokens left to right. A number is pushed; an operator pops two values, applies itself, and pushes the result."] });
      for (var i = 0; i < toks.length; i++) {
        var t = toks[i];
        if (isOp(t)) {
          if (st.length < 2) { out.push({ toks: toks, at: i, st: st.slice(), err: true, say: [["Stack underflow", "hot"], " at '" + t + "': an operator needs two values and the stack holds " + st.length + ". The expression is not valid postfix."] }); break; }
          var b = st.pop(), a = st.pop(), r = t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : t === "/" ? (b === 0 ? NaN : a / b) : Math.pow(a, b);
          r = Math.round(r * 1e6) / 1e6;
          out.push({ toks: toks, at: i, st: st.concat([a, b]), popped: 2, say: ["Operator ", [t, "hot"], ": pop ", [b, "front"], " (the right operand), then pop ", [a, "front"], "."] });
          st.push(r);
          out.push({ toks: toks, at: i, st: st.slice(), pushed: true, say: ["Push " + a + " " + t + " " + b + " = ", [isNaN(r) ? "undefined" : r, "done"], "."] });
        } else {
          var n = Number(t);
          if (!isFinite(n)) { out.push({ toks: toks, at: i, st: st.slice(), err: true, say: ["'" + t + "' is ", ["neither a number nor an operator", "hot"], "."] }); break; }
          st.push(n);
          out.push({ toks: toks, at: i, st: st.slice(), pushed: true, say: ["Operand ", [n, "done"], ": push it."] });
        }
        if (i === toks.length - 1) {
          out.push({ toks: toks, at: toks.length, st: st.slice(), say: st.length === 1 ? ["End of input with one value on the stack: the result is ", [st[0], "done"], "."] : [["Malformed", "hot"], ": " + st.length + " values are left on the stack, so an operator is missing."] });
        }
      }
      lab.steps(out, render, { autoplay: !quiet });
    }
    function render(f, i, n) {
      shown = f;
      lab.draw(paint);
      lab.now(f.say, stepMeta(i, n));
      lab.values([["stack", f.st.length ? "[" + f.st.join(", ") + "]" : "empty"], ["depth", String(f.st.length)], ["token", f.at >= 0 && f.at < f.toks.length ? f.toks[f.at] : "—", "hot"]]);
    }
    function paint(d) {
      var f = shown, tw = 40, gap = 6, n = f.toks.length, X0 = Math.max(24, (800 - (n * tw + (n - 1) * gap)) / 2);
      d.text(X0, 40, "input", { size: 14, tone: "mute", anchor: "start" });
      f.toks.forEach(function (t, i) {
        var x = X0 + i * (tw + gap), tone = i === f.at ? (f.err ? "hot-ring" : "hot") : i < f.at ? "well" : null;
        d.rect(x, 54, tw, 40, { rx: 8, tone: tone });
        d.text(x + tw / 2, 80, t, { size: 15, weight: "bold", tone: tone === "hot" ? "on" : tone === "well" ? "mute" : null });
      });
      /* the stack, bottom up, with the top marked */
      var SW = 150, SH = 40, SX = 400 - SW / 2, base = 396;
      d.path("M" + (SX - 10) + " " + (base - 270) + " V" + (base + 6) + " H" + (SX + SW + 10) + " V" + (base - 270), { tone: "line" });
      var top = f.st.length - 1;
      f.st.forEach(function (v, i) {
        var y = base - (i + 1) * (SH + 6), popping = f.popped && i > top - f.popped;
        d.rect(SX, y, SW, SH, { rx: 8, tone: popping ? "front-wash" : i === top && f.pushed ? "done-ring" : null });
        d.text(SX + SW / 2, y + 26, String(v), { weight: "bold" });
      });
      if (f.st.length) {
        var ty = base - (top + 1) * (SH + 6) + SH / 2;
        d.line(SX + SW + 70, ty, SX + SW + 16, ty, { arrow: true, tone: "ink" });
        d.text(SX + SW + 78, ty + 5, "top", { size: 14, tone: "ink", anchor: "start" });
      } else d.text(400, base - 20, "empty", { size: 14, tone: "mute" });
      return { w: 800, h: 450 + Math.max(0, f.st.length - 5) * 46, count: n, noun: "token" };
    }
    evaluate(true);
  }

  /* =================== recursion: the call stack and the call tree =================== */
  function recursionLab(panel) {
    var fn = "fact", nIn = numIn(4, 56), shown = null;
    var lab = L.create(panel, {
      controls: [L.choice([["fact", "factorial(n)"], ["fib", "fib(n)"], ["sum", "sum(n)"]], fn, function (f) { fn = f; run(true); }, "Function"),
        L.field("n", nIn), L.action("Call", function () { run(); }, true)],
      transport: true, speed: true, tick: 760, label: "Recursion: the call stack and the call tree",
      onReset: function () { run(true); }
    });
    lab.legend([["fill-hot", "running now"], ["ring-front", "waiting on a call"], ["ring-done", "base case"], ["fill-done", "returned"]]);
    var DEF = {
      fact: { name: "fact", base: function (n) { return n <= 1; }, kids: function (n) { return [n - 1]; }, baseV: function () { return 1; },
        join: function (n, r) { return { v: n * r[0], s: n + " × " + r[0] + " = " + n * r[0] }; }, code: "fact(n) = 1 if n ≤ 1, else n × fact(n − 1)" },
      sum: { name: "sum", base: function (n) { return n <= 1; }, kids: function (n) { return [n - 1]; }, baseV: function (n) { return n; },
        join: function (n, r) { return { v: n + r[0], s: n + " + " + r[0] + " = " + (n + r[0]) }; }, code: "sum(n) = n if n ≤ 1, else n + sum(n − 1)" },
      fib: { name: "fib", base: function (n) { return n <= 1; }, kids: function (n) { return [n - 1, n - 2]; }, baseV: function (n) { return n; },
        join: function (n, r) { return { v: r[0] + r[1], s: r[0] + " + " + r[1] + " = " + (r[0] + r[1]) }; }, code: "fib(n) = n if n ≤ 1, else fib(n − 1) + fib(n − 2)" }
    };
    function run(quiet) {
      var max = fn === "fib" ? 7 : 8, n = readNum(nIn, 0, max); if (n == null) return;
      if (Math.floor(n) !== n) { KOS.ui.toast("n must be a whole number.", true); return; }
      var D = DEF[fn], nodes = [], out = [], stack = [], calls = 0;
      /* the call tree, laid out by leaves; every call is one node */
      function make(v, depth, parent) {
        var nd = { id: nodes.length, v: v, depth: depth, parent: parent, kids: [], state: "idle", ret: null };
        nodes.push(nd);
        if (!D.base(v)) D.kids(v).forEach(function (k) { nd.kids.push(make(k, depth + 1, nd.id).id); });
        return nd;
      }
      make(n, 0, null);
      var leaf = 0;
      (function lay(nd) {
        if (!nd.kids.length) { nd.x = leaf++; return; }
        nd.kids.forEach(function (k) { lay(nodes[k]); });
        nd.x = nd.kids.reduce(function (a, k) { return a + nodes[k].x; }, 0) / nd.kids.length;
      })(nodes[0]);
      function snap(say, vals) {
        out.push({ nodes: nodes.map(function (x) { return { v: x.v, depth: x.depth, x: x.x, kids: x.kids, state: x.state, ret: x.ret, base: !x.kids.length }; }),
          stack: stack.slice(), say: say, calls: calls, leaves: leaf, code: D.code, vals: vals });
      }
      snap(["Each call pushes a frame holding its own n and where to return to. Nothing is worked out until a base case returns."]);
      (function call(id, from) {
        var nd = nodes[id], label = D.name + "(" + nd.v + ")";
        calls++;
        stack.push({ label: label, id: id, base: D.base(nd.v) });
        nd.state = "hot";
        if (stack.length > 1) nodes[stack[stack.length - 2].id].state = "front";
        if (D.base(nd.v)) {
          snap(["Call ", [label, "hot"], (from ? " from " + from : "") + ": n ≤ 1 is the ", ["base case", "done"], ", so it returns " + D.baseV(nd.v) + " without calling again."], [["depth", String(stack.length)]]);
          nd.ret = D.baseV(nd.v);
        } else {
          snap(["Call ", [label, "hot"], (from ? " from " + from : "") + ": not a base case, so it calls " + nd.kids.map(function (k) { return D.name + "(" + nodes[k].v + ")"; }).join(" and ") + " and waits."], [["depth", String(stack.length)]]);
          var rs = nd.kids.map(function (k) { var r = call(k, label); nd.state = "hot"; return r; });
          var j = D.join(nd.v, rs);
          nd.ret = j.v;
          snap(["Back in ", [label, "hot"], ": " + j.s + "."], [["depth", String(stack.length)]]);
        }
        stack.pop();
        nd.state = "done";
        if (stack.length) nodes[stack[stack.length - 1].id].state = "hot";
        snap(stack.length ? ["Return ", [nd.ret, "done"], " from " + label + " and pop its frame. Control goes back to " + stack[stack.length - 1].label + "."]
                          : [label + " returns ", [nd.ret, "done"], " to main. The stack is empty again after " + plural(calls, "call") + "."], [["depth", String(stack.length)], ["returned", String(nd.ret), "done"]]);
        return nd.ret;
      })(0, "main");
      lab.steps(out, render, { autoplay: !quiet });
    }
    function render(f, i, n) {
      shown = f;
      lab.draw(paint);
      lab.now(f.say, stepMeta(i, n));
      lab.values([["calls so far", String(f.calls)]].concat(f.vals || []).concat([["rule", f.code]]));
    }
    function paint(d) {
      var f = shown, FW = 190, FH = 34, FX = 24, base = 392;
      /* the call stack, bottom up: the running frame on top */
      d.text(FX, 40, "call stack", { size: 14, tone: "mute", anchor: "start" });
      d.rect(FX, base - 26, FW, 26, { rx: 6, tone: "well" });
      d.text(FX + FW / 2, base - 8, "main", { size: 14, tone: "mute" });
      f.stack.forEach(function (fr, i) {
        var y = base - 26 - (i + 1) * (FH + 4), top = i === f.stack.length - 1;
        var tn = top ? "hot" : "front";
        d.rect(FX, y, FW, FH, { rx: 8, tone: top ? tn : fr.base ? "done-ring" : tn });
        d.text(FX + FW / 2, y + 23, fr.label, { size: 15, weight: "bold", tone: top ? "on" : null });
      });
      /* the call tree */
      var TX = FX + FW + 60, dx = 46, dy = 64, top0 = 60, maxD = 0;
      f.nodes.forEach(function (nd) { maxD = Math.max(maxD, nd.depth); });
      d.text(TX, 40, "call tree", { size: 14, tone: "mute", anchor: "start" });
      function at(nd) { return { x: TX + 22 + nd.x * dx, y: top0 + 26 + nd.depth * dy }; }
      f.nodes.forEach(function (nd) {
        nd.kids.forEach(function (k) {
          var a = at(nd), b = at(f.nodes[k]);
          d.line(a.x, a.y + 17, b.x, b.y - 17, { tone: f.nodes[k].state === "idle" ? "line" : f.nodes[k].state === "done" ? "done" : "mute" });
        });
      });
      f.nodes.forEach(function (nd) {
        var p = at(nd), tn = nd.state === "hot" ? "hot" : nd.state === "front" ? "front" : nd.state === "done" ? "done" : nd.base ? "ghost" : "ghost";
        d.rect(p.x - 21, p.y - 17, 42, 34, { rx: 10, tone: tn });
        d.text(p.x, p.y + 6, String(nd.v), { size: 15, weight: "bold", tone: tn === "hot" || tn === "done" ? "on" : nd.state === "idle" ? "mute" : null });
        if (nd.ret != null && nd.state === "done") d.text(p.x + 26, p.y - 14, "→" + nd.ret, { size: 14, tone: "done", anchor: "start" });
      });
      var W = Math.max(800, TX + 22 + (f.leaves - 1) * dx + 60), H = Math.max(450, top0 + 26 + maxD * dy + 40);
      return { w: W, h: H, count: f.nodes.length, noun: "call" };
    }
    run(true);
  }

  [
    { id: "sort-viz", title: "Sorting", subject: "compsci", ref: "4.3.5.1",
      desc: "Bubble sort and merge sort on the same data, one comparison at a time, with the counts that make O(n²) and O(n log n) concrete.", mount: sortLab },
    { id: "linear-search", title: "Linear search", subject: "compsci", ref: "4.3.4.1",
      desc: "Check each item in turn until the target is found or the array runs out — O(n), and it works on unsorted data.", mount: function (p) { searchLab(p, "linear"); } },
    { id: "binary-search", title: "Binary search", subject: "compsci", ref: "4.3.4.2",
      desc: "lo, mid and hi close in on the target, halving the range each comparison — O(log n) on a sorted array.", mount: function (p) { searchLab(p, "binary"); } },
    { id: "rpn-eval", title: "Reverse Polish evaluation", subject: "compsci", ref: "4.3.3.1",
      desc: "Evaluate a postfix expression token by token: numbers push, operators pop two and push the result.", mount: rpnLab },
    { id: "recursion-viz", title: "Recursion", subject: "compsci", ref: "4.1.1.16",
      desc: "Frames pile up on the call stack until a base case returns, then the results flow back — beside the full call tree.", mount: recursionLab }
  ].forEach(function (s) { KOS.sims.register(s); });
})();
