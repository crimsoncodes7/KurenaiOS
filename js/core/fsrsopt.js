/* Kurenai OS — core/fsrsopt.js
   FSRS phase 3 (roadmap 5.6, docs/fsrs-plan.md §4): the optimiser. It fits
   the FSRS-6 parameters to this learner's own review log. Pure — no clock,
   no store, no DOM — so Node runs it unchanged (smoke96 holds it).

   Why not fsrs-browser (the plan's first idea): its WebAssembly is built
   with threads, which need a cross-origin-isolated page, and isolating
   this app would block every hot-linked cover and season picture. This
   is the same model trained the same way, written to run anywhere:

     1. PREPARE: the log grouped by card, in time order. A card first rated
        here starts new; a card the log meets mid-life (rated before the log
        existed) starts from the memory its first row records (`s0`, `d0`).
        Every review a day or more after the one before is a prediction to
        score: did recall (any grade above Again) happen at the
        retrievability the model gave it?
     2. PRETRAIN the four first-rating stabilities (w0–w3) from new cards'
        second reviews alone, a one-dimensional fit each, pulled towards
        the default by a prior worth PRIOR_N reviews; a rating seen fewer
        than MIN_FIRST times keeps its default; then they are made
        non-decreasing (Again ≤ Hard ≤ Good ≤ Easy).
     3. TRAIN w4–w20 by Adam on the mean log loss over every prediction,
        replaying each card's history through KOS.fsrs.memory, with a
        penalty that keeps each parameter near its default unless the
        reviews say otherwise (GAMMA, scaled by SD). Gradients are central
        differences: the model's clamps make it piecewise, and 17
        parameters over a few thousand reviews is quick.
     4. ACCEPT only a fit whose log loss beats the parameters in use, on
        the same reviews. A fit that cannot do better changes nothing.

   The fitted parameters are the learner's (state.srsCfg.fit, synced);
   KOS.srs reads them through weights(). The figures a caller shows are
   the log loss and the predicted against the actual recall rate. */
(function (root) {
  "use strict";
  var F = typeof module === "object" && module.exports ? require("./fsrs.js") : root.KOS.fsrs;

  var MIN_REVIEWS = 1000;      // the log size the plan waits for
  var MIN_ITEMS = 200;         // predictions (reviews a day or more apart)
  var MIN_FIRST = 8;           // second reviews needed to move one w0–w3
  var PRIOR_N = 20;            // the default S0 counts as this many reviews
  var GAMMA = 2;               // the pull towards the defaults
  var STEPS = 160, LR = 0.04, H = 1e-4;
  /* the range each parameter may take (fsrs-rs parameter_clipper, v6) */
  var BOUNDS = [[0.001, 100], [0.001, 100], [0.001, 100], [0.001, 100],
    [1, 10], [0.001, 4], [0.001, 4], [0.001, 0.75], [0, 4.5], [0, 0.8], [0.001, 3.5],
    [0.001, 5], [0.001, 0.25], [0.001, 0.9], [0, 4], [0, 1], [1, 6], [0, 2], [0, 2], [0, 0.8], [0.1, 0.8]];
  /* how far each parameter typically sits from its default across many
     learners: the scale of the penalty */
  var SD = [6.43, 9.66, 17.58, 27.85, 0.57, 0.28, 0.6, 0.12, 0.39, 0.18, 0.33,
    0.3, 0.09, 0.16, 0.57, 0.25, 1.03, 0.31, 0.32, 0.14, 0.27];

  function clip(w) {
    return w.map(function (x, i) { return Math.min(BOUNDS[i][1], Math.max(BOUNDS[i][0], x)); });
  }
  /* a stored parameter set the scheduler may use */
  function valid(w) {
    return Array.isArray(w) && w.length === 21 && w.every(function (x, i) {
      return typeof x === "number" && isFinite(x) && x >= BOUNDS[i][0] && x <= BOUNDS[i][1];
    });
  }
  function clampP(p) { return Math.min(1 - 1e-6, Math.max(1e-6, p)); }
  /* one review's identity, the same on every device (KOS.reviewLog uid) */
  function uidOf(r) { return r.uid || r.key + "|" + r.ts; }

  /* ---- 1. prepare ---- */
  function prepare(rows) {
    var seen = {}, byKey = {}, reviews = 0;
    (rows || []).forEach(function (r) {
      /* a redo item is a past-paper question marked by hand, not a card */
      if (!r || typeof r.key !== "string" || !(r.g >= 1 && r.g <= 4) || r.src === "redo") return;
      var u = uidOf(r);
      if (seen[u]) return;
      seen[u] = true;
      reviews++;
      (byKey[r.key] = byKey[r.key] || []).push(r);
    });
    var seqs = [], items = 0, first = [[], [], [], []];
    Object.keys(byKey).forEach(function (k) {
      var L = byKey[k].sort(function (a, b) { return a.ts - b.ts; });
      var init = L[0].s0 > 0 && L[0].d0 > 0 ? { s: L[0].s0, d: L[0].d0 } : null;
      var steps = L.map(function (r) { return [r.g, Math.max(0, +r.el || 0)]; });
      var n = 0;
      for (var i = init ? 0 : 1; i < steps.length; i++) if (steps[i][1] >= 1) n++;
      if (!init && steps.length > 1 && steps[1][1] >= 1) first[steps[0][0] - 1].push([steps[1][1], steps[1][0] > 1 ? 1 : 0]);
      if (n) { seqs.push({ init: init, steps: steps }); items += n; }
    });
    return { seqs: seqs, items: items, reviews: reviews, first: first };
  }

  /* ---- the score: mean log loss of every prediction ---- */
  function evaluate(w, data) {
    var sum = 0, n = 0, pSum = 0, ySum = 0;
    data.seqs.forEach(function (q) {
      var st = q.init;
      for (var i = 0; i < q.steps.length; i++) {
        var g = q.steps[i][0], el = q.steps[i][1];
        if (st && el >= 1) {
          var p = clampP(F.retrievability(el, st.s, w)), y = g > 1 ? 1 : 0;
          sum -= y ? Math.log(p) : Math.log(1 - p);
          n++; pSum += p; ySum += y;
        }
        st = F.memory(st, g, el, w);
      }
    });
    return { loss: n ? sum / n : 0, n: n, predicted: n ? pSum / n : 0, actual: n ? ySum / n : 0 };
  }
  function penalty(w, n) {
    var p = 0;
    for (var i = 4; i < 21; i++) { var z = (w[i] - F.W[i]) / SD[i]; p += z * z; }
    return GAMMA * p / Math.max(1, n);
  }
  function objective(w, data) { return evaluate(w, data).loss + penalty(w, data.items); }

  /* ---- 2. pretrain w0–w3 ---- */
  function fitS0(points, s0, decayW) {
    function cost(x) {
      var s = Math.exp(x), c = 0;
      points.forEach(function (pt) {
        var p = clampP(F.retrievability(pt[0], s, decayW));
        c -= pt[1] ? Math.log(p) : Math.log(1 - p);
      });
      var z = x - Math.log(s0);
      return c + PRIOR_N * 0.5 * z * z;
    }
    /* golden-section search over log-stability */
    var a = Math.log(0.01), b = Math.log(100), k = (Math.sqrt(5) - 1) / 2;
    var c1 = b - k * (b - a), c2 = a + k * (b - a), f1 = cost(c1), f2 = cost(c2);
    for (var it = 0; it < 60; it++) {
      if (f1 < f2) { b = c2; c2 = c1; f2 = f1; c1 = b - k * (b - a); f1 = cost(c1); }
      else { a = c1; c1 = c2; f1 = f2; c2 = a + k * (b - a); f2 = cost(c2); }
    }
    return Math.exp((a + b) / 2);
  }
  function pretrain(data, w) {
    var out = w.slice();
    for (var g = 0; g < 4; g++) {
      if (data.first[g].length >= MIN_FIRST) out[g] = fitS0(data.first[g], F.W[g], F.W);
    }
    for (var i = 1; i < 4; i++) out[i] = Math.max(out[i], out[i - 1]);
    return clip(out);
  }

  /* ---- 3. train: a job that runs one Adam step at a time, so a page can
     yield between steps and draw progress ---- */
  function job(rows, opts) {
    opts = opts || {};
    var data = prepare(rows);
    var current = valid(opts.current) ? opts.current : F.W;
    var steps = opts.steps || STEPS;
    var st = { data: data, done: false, step: 0, steps: steps, result: null };
    if (data.reviews < (opts.minReviews != null ? opts.minReviews : MIN_REVIEWS)) {
      st.done = true;
      st.result = { ok: false, why: "reviews", reviews: data.reviews, need: opts.minReviews != null ? opts.minReviews : MIN_REVIEWS };
      return st;
    }
    if (data.items < (opts.minItems != null ? opts.minItems : MIN_ITEMS)) {
      st.done = true;
      st.result = { ok: false, why: "items", reviews: data.reviews, items: data.items, need: opts.minItems != null ? opts.minItems : MIN_ITEMS };
      return st;
    }
    var w = pretrain(data, F.W.slice());
    var m = new Array(21).fill(0), v = new Array(21).fill(0);
    var B1 = 0.9, B2 = 0.999, EPS = 1e-8;
    st.tick = function () {
      if (st.done) return st;
      var t = ++st.step;
      var lr = LR * 0.5 * (1 + Math.cos(Math.PI * (t - 1) / steps));
      var next = w.slice();
      for (var i = 4; i < 21; i++) {
        var h = H * Math.max(1, Math.abs(w[i]));
        var up = w.slice(), dn = w.slice();
        up[i] += h; dn[i] -= h;
        var grad = (objective(up, data) - objective(dn, data)) / (2 * h);
        m[i] = B1 * m[i] + (1 - B1) * grad;
        v[i] = B2 * v[i] + (1 - B2) * grad * grad;
        var mh = m[i] / (1 - Math.pow(B1, t)), vh = v[i] / (1 - Math.pow(B2, t));
        next[i] = w[i] - lr * mh / (Math.sqrt(vh) + EPS);
      }
      w = clip(next);
      if (st.step >= steps) finish();
      return st;
    };
    function round(x) { return Math.round(x * 1e4) / 1e4; }
    function finish() {
      st.done = true;
      var fitted = w.map(round);
      var before = evaluate(current, data), after = evaluate(fitted, data), defaults = evaluate(F.W, data);
      st.result = {
        ok: after.loss < before.loss - 1e-6,
        why: after.loss < before.loss - 1e-6 ? null : "no-better",
        w: fitted, reviews: data.reviews, items: data.items,
        before: before, after: after, defaults: defaults
      };
    }
    return st;
  }
  /* the whole fit at once (Node, tests) */
  function fit(rows, opts) {
    var j = job(rows, opts);
    while (!j.done) j.tick();
    return j.result;
  }

  /* what a parameter set would change for the cards held now: each
     card's next Good interval (unfuzzed) and its recall today, under the
     old and the new. mems = [{s, d, el}]. */
  function changes(mems, wOld, wNew, retention) {
    var out = { n: 0, longer: 0, shorter: 0, same: 0, medOld: null, medNew: null, rOld: null, rNew: null };
    var a = [], b = [], ro = 0, rn = 0;
    (mems || []).forEach(function (c) {
      if (!c || !(c.s > 0) || !(c.d > 0)) return;
      var el = Math.max(0, c.el || 0);
      var io = F.schedule({ s: c.s, d: c.d }, 3, el, { retention: retention, w: wOld }).ivl;
      var nw = F.schedule({ s: c.s, d: c.d }, 3, el, { retention: retention, w: wNew }).ivl;
      a.push(io); b.push(nw);
      if (nw > io) out.longer++; else if (nw < io) out.shorter++; else out.same++;
      ro += F.retrievability(el, c.s, wOld); rn += F.retrievability(el, c.s, wNew);
    });
    out.n = a.length;
    function med(x) { x = x.slice().sort(function (p, q) { return p - q; }); return x.length ? x[Math.floor((x.length - 1) / 2)] : null; }
    if (out.n) { out.medOld = med(a); out.medNew = med(b); out.rOld = ro / out.n; out.rNew = rn / out.n; }
    return out;
  }

  var api = {
    MIN_REVIEWS: MIN_REVIEWS, MIN_ITEMS: MIN_ITEMS, BOUNDS: BOUNDS,
    valid: valid, uidOf: uidOf, prepare: prepare, evaluate: evaluate,
    pretrain: pretrain, job: job, fit: fit, changes: changes
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) { root.KOS = root.KOS || {}; root.KOS.fsrsOpt = api; }
})(typeof window !== "undefined" ? window : null);
