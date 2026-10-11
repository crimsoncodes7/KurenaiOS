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

  /* =================== graphs: Dijkstra, BFS and DFS on one graph (20b) ===================
     One graph, three algorithms: switching resets the run on the same
     graph so they can be compared. Node states are the same in all three:
     visited teal, current crimson, frontier an amber ring, unvisited grey;
     the edge being relaxed or explored is crimson, the tree built so far
     teal. The structure the algorithm runs on (priority queue, queue,
     stack) and a step log sit in the readout. */
  var G_SEED = {
    nodes: [["A", 90, 222], ["B", 247, 95], ["C", 247, 350], ["D", 437, 202], ["E", 447, 372], ["F", 620, 95], ["G", 712, 297]],
    edges: [["A", "B", 4], ["A", "C", 2], ["B", "C", 1], ["B", "D", 5], ["C", "D", 8], ["C", "E", 10], ["D", "E", 2], ["D", "F", 6], ["E", "G", 5], ["F", "G", 3]]
  };
  var GR = 22, NAMES = "ABCDEFG";

  function graphLab(panel, first) {
    var g = cloneG(G_SEED), alg = first, start = "A", target = "G", editing = false, shown = null;
    function cloneG(x) { return { nodes: x.nodes.map(function (n) { return n.slice(); }), edges: x.edges.map(function (e) { return e.slice(); }) }; }
    function ids() { return g.nodes.map(function (n) { return n[0]; }); }
    function sel(v, on) {
      var s = el("select", { style: "--w: 64px" }, ids().map(function (k) { return el("option", { value: k, text: k, selected: k === v ? "" : null }); }));
      s.onchange = function () { on(s.value); };
      return s;
    }
    var startSel = sel(start, function (v) { start = v; build(); });
    var targetSel = sel(target, function (v) { target = v; build(); });
    var targetField = L.field("Target", targetSel);
    var editBtn = L.action("✎ Edit graph", function () { setEditing(!editing); });
    editBtn.setAttribute("aria-pressed", "false");
    var lab = L.create(panel, {
      controls: [L.choice([["dijkstra", "Dijkstra"], ["bfs", "BFS"], ["dfs", "DFS"]], alg, function (a) { alg = a; build(); }, "Algorithm"),
        L.field("Start", startSel), targetField, editBtn, L.action("New graph", newGraph)],
      transport: true, speed: true, tick: 1100, label: "Weighted graph",
      readout: ["now", "struct", "values", "edges", "log", "legend"],
      onReset: function () { build(); }
    });
    lab.legend([["fill-done", "visited"], ["fill-hot", "current"], ["ring-front", "frontier"], ["fill-mute", "unvisited"], ["line-done", "tree edge"]]);

    function adj() {
      var a = {};
      ids().forEach(function (k) { a[k] = []; });
      g.edges.forEach(function (e) { a[e[0]].push([e[1], e[2]]); a[e[1]].push([e[0], e[2]]); });
      Object.keys(a).forEach(function (k) { a[k].sort(function (x, y) { return x[0] < y[0] ? -1 : 1; }); });
      return a;
    }
    function ek(a, b) { return a < b ? a + "-" + b : b + "-" + a; }
    function fmt(d) { return d === Infinity ? "∞" : String(d); }

    function build() {
      targetField.hidden = alg !== "dijkstra";
      lab.stop();
      var out = alg === "dijkstra" ? dijkstra() : traverse(alg);
      lab.steps(out, render);
    }
    function dijkstra() {
      var A = adj(), dist = {}, prev = {}, done = {}, out = [], log = [], k = 0;
      ids().forEach(function (n) { dist[n] = Infinity; });
      dist[start] = 0;
      function pq(popped, notes) {
        return ids().filter(function (n) { return !done[n] && dist[n] < Infinity || n === popped; })
          .sort(function (a, b) { return dist[a] - dist[b] || (a < b ? -1 : 1); })
          .map(function (n) { return { k: n, v: fmt(dist[n]), note: n === popped ? "popped" : notes[n] || "", live: n === popped }; });
      }
      function snap(o) {
        var st = {}, tree = {};
        ids().forEach(function (n) { st[n] = done[n] ? "done" : dist[n] < Infinity ? "front" : null; if (prev[n]) tree[ek(n, prev[n])] = "done"; });
        if (o.cur) st[o.cur] = "hot";
        Object.keys(o.edges || {}).forEach(function (e) { tree[e] = o.edges[e]; });
        out.push({ st: st, edges: tree, dist: JSON.parse(JSON.stringify(dist, function (x, v) { return v === Infinity ? "∞" : v; })), labels: "dist",
          struct: { title: "Priority queue", meta: "dist", items: o.pq }, log: log.slice(), say: o.say, path: o.path, vals: o.vals });
      }
      snap({ pq: pq(null, {}), say: ["Start at ", [start, "hot"], " with d = 0; every other node is ∞. The priority queue always hands back the unvisited node with the smallest distance."] });
      while (true) {
        var u = null;
        ids().forEach(function (n) { if (!done[n] && dist[n] < Infinity && (u === null || dist[n] < dist[u] || (dist[n] === dist[u] && n < u))) u = n; });
        if (u === null) break;
        k++;
        var notes = {}, said = ["Visit ", [u + " (" + dist[u] + ")", "hot"], ". "], hot = {}, parts = [];
        var poppedList = pq(u, {});
        done[u] = true;
        A[u].forEach(function (p) {
          var v = p[0], w = p[1];
          if (done[v]) return;
          var nd = dist[u] + w;
          if (nd < dist[v]) {
            var was = dist[v];
            hot[ek(u, v)] = "hot";
            if (was === Infinity) { said.push(v + " is new at " + nd + ". "); notes[v] = "new"; parts.push(v + " = " + nd); }
            else { said.push("The edge " + u + " → " + v + " gives " + dist[u] + " + " + w + " = " + nd + ", which beats " + v + "'s " + was + ", so " + v + " becomes " + nd + " via " + u + ". "); notes[v] = "was " + was; parts.push(v + " " + was + " → " + nd); }
            dist[v] = nd; prev[v] = u;
          }
        });
        if (!parts.length) said.push("No neighbour improves.");
        log.push({ n: k, t: "Visit " + u + " (" + dist[u] + ")" + (parts.length ? " · " + parts.join(", ") : "") });
        var list = pq(null, notes); list.unshift({ k: u, v: String(dist[u]), note: "popped", live: true });
        snap({ cur: u, edges: hot, pq: list, say: said });
      }
      var path = [];
      if (dist[target] < Infinity) { for (var x = target; x; x = prev[x]) path.unshift(x); }
      var pe = {};
      for (var i = 1; i < path.length; i++) pe[ek(path[i - 1], path[i])] = "hot";
      snap({ edges: pe, path: path, pq: [], say: dist[target] < Infinity
        ? ["Every node is settled. The shortest path from " + start + " to " + target + " is ", [path.join(" → "), "hot"], ", length ", [String(dist[target]), "hot"], "."]
        : [target + " cannot be reached from " + start + "."], vals: [["shortest " + start + " → " + target, fmt(dist[target]), "hot"]] });
      return out;
    }
    function traverse(kind) {
      var A = adj(), seen = {}, order = [], out = [], log = [], box = [start], parent = {};
      seen[start] = true;
      var name = kind === "bfs" ? "Queue" : "Stack", meta = kind === "bfs" ? "FIFO" : "LIFO";
      function snap(cur, hot, say) {
        var st = {}, tree = {};
        ids().forEach(function (n) { st[n] = order.indexOf(n) >= 0 ? "done" : box.indexOf(n) >= 0 ? "front" : null; if (parent[n] && order.indexOf(n) >= 0) tree[ek(n, parent[n])] = "done"; });
        if (cur) st[cur] = "hot";
        Object.keys(hot || {}).forEach(function (e) { tree[e] = hot[e]; });
        var items = (kind === "bfs" ? box.slice() : box.slice().reverse()).map(function (n, i) { return { k: n, v: "", note: i === 0 ? (kind === "bfs" ? "← front" : "← top") : "" }; });
        out.push({ st: st, edges: tree, order: order.slice(), labels: "order", struct: { title: name, meta: meta, items: items }, log: log.slice(), say: say });
      }
      snap(null, null, [kind === "bfs" ? "Enqueue " : "Push ", [start, "front"], " and mark it seen. " + (kind === "bfs" ? "BFS visits by number of edges, not by weight." : "DFS goes as deep as it can before backing up.")]);
      while (box.length) {
        var u = kind === "bfs" ? box.shift() : box.pop();
        if (kind === "dfs" && order.indexOf(u) >= 0) continue;
        order.push(u);
        var nb = A[u].map(function (p) { return p[0]; }).filter(function (v) { return kind === "bfs" ? !seen[v] : order.indexOf(v) < 0; });
        var hot = {};
        if (kind === "bfs") nb.forEach(function (v) { seen[v] = true; parent[v] = u; box.push(v); hot[ek(u, v)] = "hot"; });
        else nb.slice().reverse().forEach(function (v) { parent[v] = u; box.push(v); hot[ek(u, v)] = "hot"; });
        log.push({ n: order.length, t: (kind === "bfs" ? "Dequeue " : "Pop ") + u + (nb.length ? " · " + (kind === "bfs" ? "enqueue " : "push ") + nb.join(", ") : "") });
        snap(u, hot, [(kind === "bfs" ? "Dequeue " : "Pop "), [u, "hot"], nb.length
          ? (kind === "bfs" ? ", enqueue its unvisited neighbours " : ", push its unvisited neighbours ") + nb.join(" and ") + (kind === "dfs" && nb.length > 1 ? " (in reverse, so " + nb[0] + " comes off first)" : "") + "."
          : ": every neighbour is already " + (kind === "bfs" ? "seen" : "visited") + "."]);
      }
      snap(null, null, ["The " + name.toLowerCase() + " is empty: every node reachable from " + start + " is visited, in the order ", [order.join(" "), "done"], "."]);
      return out;
    }
    function render(f, i, n) {
      shown = f;
      lab.draw(paint);
      lab.now(f.say, i ? "Step " + i + " of " + (n - 1) : null);
      var s = f.struct;
      lab.section("struct", s.title, s.items.length ? [el("ul", { class: "k-lab-rlist" }, s.items.map(function (it) {
        return el("li", { "data-state": it.live ? "live" : null }, [el("b", { class: "k-mono", text: it.k }), it.v !== "" ? el("span", { class: "k-mono", text: it.v }) : null, el("span", { class: "k-lab-rlist-v", text: it.note })].filter(Boolean));
      }))] : [el("p", { class: "k-lab-now", text: "empty" })], s.meta);
      lab.section("log", "Step log", f.log.length ? [el("ol", { class: "k-lab-rlist" }, f.log.map(function (l, j) {
        return el("li", { "data-state": j === f.log.length - 1 ? null : "done" }, [el("span", { class: "k-lab-rlist-n", text: String(l.n) }), l.t]);
      }))] : null);
      lab.values(f.vals || null);
      editRows();
    }
    function paint(d) {
      var f = shown, pos = {};
      g.nodes.forEach(function (n) { pos[n[0]] = { x: n[1], y: n[2] }; });
      var weighted = alg === "dijkstra";
      g.edges.forEach(function (e) {
        var a = pos[e[0]], b = pos[e[1]], len = Math.hypot(b.x - a.x, b.y - a.y), ux = (b.x - a.x) / len, uy = (b.y - a.y) / len;
        var tn = f.edges[ek(e[0], e[1])] || "mute";
        d.line(a.x + ux * GR, a.y + uy * GR, b.x - ux * GR, b.y - uy * GR, { tone: tn });
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        d.rect(mx - 13, my - 12, 26, 24, { rx: 8, tone: "well" });
        d.text(mx, my + 5, String(e[2]), { size: 14, tone: tn === "hot" ? "hot" : weighted ? "sub" : "mute" });
      });
      g.nodes.forEach(function (n) {
        var p = pos[n[0]], st = f.st[n[0]];
        var c = d.circle(p.x, p.y, GR, { tone: st || null, cls: editing ? "k-sv-drag" : null });
        c.setAttribute("data-node", n[0]);
        d.text(p.x, p.y + 6, n[0], { size: 16, weight: "bold", tone: st === "hot" || st === "done" ? "on" : null });
        if (f.labels === "dist") {
          var dv = f.dist[n[0]];
          d.text(p.x, p.y + GR + 22, "d = " + dv, { size: 14, tone: st === "hot" ? "hot" : st === "done" ? "done" : st === "front" ? "front" : "mute" });
        } else {
          var oi = f.order.indexOf(n[0]);
          if (oi >= 0) d.text(p.x + GR + 4, p.y - GR + 4, String(oi + 1), { size: 14, tone: "done", anchor: "start" });
        }
      });
      return { w: 800, h: 450, count: g.nodes.length, noun: "node", note: g.edges.length + " edges" + (weighted ? "" : " · " + alg.toUpperCase() + " ignores weights") };
    }

    /* ✎ Edit graph: drag the nodes, type the weights; the layout never
       leaves the viewBox, and every change restarts the run */
    function setEditing(on) {
      editing = on;
      editBtn.setAttribute("aria-pressed", String(on));
      editBtn.textContent = on ? "✓ Done editing" : "✎ Edit graph";
      KOS.ui.state(lab.stage, "editing", on);
      lab.draw(); editRows();
    }
    function editRows() {
      if (!editing) { lab.section("edges", "Edges", null); return; }
      lab.section("edges", "Edges", [el("div", { class: "k-lab-edges" }, g.edges.map(function (e) {
        var inp = el("input", { type: "number", min: 1, max: 99, value: e[2], style: "--w: 56px", "aria-label": "Weight of " + e[0] + "–" + e[1] });
        inp.onchange = function () {
          var w = Math.round(Number(inp.value));
          if (!(w >= 1 && w <= 99)) { inp.value = e[2]; KOS.ui.toast("A weight is a whole number from 1 to 99.", true); return; }
          e[2] = w; build();
        };
        return el("label", { class: "k-lab-field" }, [el("span", { text: e[0] + "–" + e[1] }), inp]);
      }))], "drag a node to move it");
    }
    lab.stage.addEventListener("pointerdown", function (e) {
      if (!editing) return;
      var t = e.target && e.target.getAttribute && e.target.getAttribute("data-node");
      if (!t) return;
      e.preventDefault(); e.stopPropagation();
      var node = g.nodes.filter(function (n) { return n[0] === t; })[0];
      function move(ev) {
        var p = lab.toWorld(ev.clientX, ev.clientY); if (!p) return;
        node[1] = Math.round(Math.min(800 - GR - 10, Math.max(GR + 10, p.x)));
        node[2] = Math.round(Math.min(450 - GR - 46, Math.max(GR + 10, p.y)));
        lab.draw();
      }
      function up() { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); build(); }
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    }, true);

    function newGraph() {
      var cells = [];
      for (var r = 0; r < 2; r++) for (var c = 0; c < 4; c++) cells.push([110 + c * 190 + rnd(-40, 40), 110 + r * 220 + rnd(-40, 40)]);
      cells.sort(function () { return Math.random() - 0.5; });
      var nodes = [];
      for (var i = 0; i < 7; i++) nodes.push([NAMES[i], cells[i][0], cells[i][1]]);
      nodes.sort(function (a, b) { return a[1] - b[1]; });
      nodes.forEach(function (n, i) { n[0] = NAMES[i]; });
      function dd(a, b) { return Math.hypot(a[1] - b[1], a[2] - b[2]); }
      var edges = [], has = {};
      function add(a, b) { var key = ek(a[0], b[0]); if (has[key] || a === b) return false; has[key] = 1; edges.push([a[0], b[0], rnd(1, 9)]); return true; }
      /* a spanning tree to the nearest connected node, then a few short extras */
      for (var j = 1; j < nodes.length; j++) {
        var best = nodes.slice(0, j).sort(function (p, q) { return dd(p, nodes[j]) - dd(q, nodes[j]); })[0];
        add(best, nodes[j]);
      }
      var pairs = [];
      nodes.forEach(function (a, x) { nodes.forEach(function (b, y) { if (x < y) pairs.push([dd(a, b), a, b]); }); });
      pairs.sort(function (p, q) { return p[0] - q[0]; });
      var extra = 0;
      pairs.forEach(function (p) { if (extra < 4 && p[0] < 300 && add(p[1], p[2])) extra++; });
      g = { nodes: nodes, edges: edges };
      if (ids().indexOf(start) < 0) start = "A";
      if (ids().indexOf(target) < 0) target = "G";
      build();
    }
    build();
  }

  [
    { id: "dijkstra", title: "Shortest path", subject: "compsci", ref: "4.3.6.1",
      desc: "Dijkstra, BFS and DFS on the same weighted graph: the priority queue, queue or stack beside it and a step log you can read back.", mount: function (p) { graphLab(p, "dijkstra"); } },
    { id: "graph-traversal", title: "Graph traversal", subject: "compsci", ref: "4.3.1.1",
      desc: "Breadth-first and depth-first search side by side: BFS dequeues from a queue, DFS pops a stack, on the same graph.", mount: function (p) { graphLab(p, "bfs"); } },
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
