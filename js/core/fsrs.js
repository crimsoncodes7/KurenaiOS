/* Kurenai OS — core/fsrs.js
   The one spaced-repetition model (roadmap 5.6, docs/fsrs-plan.md): FSRS-6
   with its 21 default parameters. Pure — no clock, no store, no DOM — so
   flashcards (srs.js), Code's retrieval cards (code.js) and, later, the
   Japanese facets all schedule through the same functions, and Node runs
   it unchanged (tools/fsrs_check.mjs holds it to py-fsrs 6.3.2).

   A card's memory is two numbers:
     s  stability — days until recall falls to 90%
     d  difficulty — 1..10
   Grades are 1 Again, 2 Hard, 3 Good, 4 Easy. Days are whole days; the
   caller turns its own dates into `elapsed`.

   The step follows py-fsrs `review_card` exactly:
     - the first review sets s = w[g-1], d = D0(g);
     - a review under a day after the last takes the short-term rule
       (w[17..19]); any later one the recall or forget rule at the
       retrievability of that moment;
     - every review after the first moves d (linear damping, then mean
       reversion towards D0(Easy)).

   fromSM2 is fsrs-rs `memory_state_from_sm2` (model_v6.rs): the state an
   SM-2 card (ease, interval) converts to, assuming SM-2 set that interval
   for recall `r` at the due date. At r = 0.9, s IS the interval, so a
   converted card stays due when it was. */
(function (root) {
  "use strict";

  var W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666,
    0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  var S_MIN = 0.001, D_MIN = 1, D_MAX = 10, MAX_IVL = 36500;
  var RETENTION = 0.9, RETENTION_MIN = 0.8, RETENTION_MAX = 0.95;
  /* fuzz (py-fsrs FUZZ_RANGES): a window that widens with the interval */
  var FUZZ = [[2.5, 7, 0.15], [7, 20, 0.1], [20, Infinity, 0.05]];

  function decay(w) { return -w[20]; }
  function factor(w) { return Math.pow(0.9, 1 / decay(w)) - 1; }
  function clampD(d) { return Math.min(D_MAX, Math.max(D_MIN, d)); }
  function clampS(s) { return Math.max(S_MIN, s); }
  function clampRetention(r) {
    r = +r;
    return isFinite(r) && r > 0 ? Math.min(RETENTION_MAX, Math.max(RETENTION_MIN, r)) : RETENTION;
  }

  /* the chance of recall `elapsed` days after the last review */
  function retrievability(elapsed, s, w) {
    w = w || W;
    if (!(s > 0)) return 0;
    return Math.pow(1 + factor(w) * Math.max(0, elapsed) / s, decay(w));
  }

  function initS(g, w) { return clampS(w[g - 1]); }
  function initD(g, w, clamp) {
    var d = w[4] - Math.exp(w[5] * (g - 1)) + 1;
    return clamp === false ? d : clampD(d);
  }
  function nextD(d, g, w) {
    var delta = -(w[6] * (g - 3));
    var damped = d + (10 - d) * delta / 9;
    return clampD(w[7] * initD(4, w, false) + (1 - w[7]) * damped);
  }
  function shortS(s, g, w) {
    var inc = Math.exp(w[17] * (g - 3 + w[18])) * Math.pow(s, -w[19]);
    if (g >= 2) inc = Math.max(inc, 1);
    return clampS(s * inc);
  }
  function forgetS(d, s, r, w) {
    var long = w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp((1 - r) * w[14]);
    var short = s / Math.exp(w[17] * w[18]);
    return Math.min(long, short);
  }
  function recallS(d, s, r, g, w) {
    return s * (1 + Math.exp(w[8]) * (11 - d) * Math.pow(s, -w[9]) *
      (Math.exp((1 - r) * w[10]) - 1) * (g === 2 ? w[15] : 1) * (g === 4 ? w[16] : 1));
  }

  /* memory(prev, g, elapsed) → the next {s, d}. prev null = a new card. */
  function memory(prev, g, elapsed, w) {
    w = w || W;
    if (!prev || !(prev.s > 0) || !(prev.d > 0)) return { s: initS(g, w), d: initD(g, w) };
    var s;
    if (elapsed < 1) s = shortS(prev.s, g, w);
    else {
      var r = retrievability(elapsed, prev.s, w);
      s = clampS(g === 1 ? forgetS(prev.d, prev.s, r, w) : recallS(prev.d, prev.s, r, g, w));
    }
    return { s: s, d: nextD(prev.d, g, w) };
  }

  /* the whole days until recall falls to `retention` */
  function interval(s, retention, w, max) {
    w = w || W;
    var ivl = Math.round(s / factor(w) * (Math.pow(clampRetention(retention), 1 / decay(w)) - 1));
    return Math.min(Math.max(ivl, 1), max || MAX_IVL);
  }

  /* a stable 32-bit hash (FNV-1a) → [0, 1), so a fuzzed interval is the
     same on every device and in every preview */
  function unit(seed) {
    var h = 0x811c9dc5;
    seed = String(seed);
    for (var i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h / 4294967296;
  }
  function fuzzRange(ivl, max) {
    var delta = 1;
    FUZZ.forEach(function (f) { delta += f[2] * Math.max(Math.min(ivl, f[1]) - f[0], 0); });
    var lo = Math.max(2, Math.round(ivl - delta)), hi = Math.min(Math.round(ivl + delta), max || MAX_IVL);
    return [Math.min(lo, hi), hi];
  }
  function fuzz(ivl, seed, max) {
    if (ivl < 2.5 || seed == null) return ivl;
    var r = fuzzRange(ivl, max);
    /* floor, not py-fsrs's round, so the pick is uniform over the window
       and never one day past its end */
    return Math.min(Math.floor(unit(seed) * (r[1] - r[0] + 1)) + r[0], max || MAX_IVL);
  }

  /* schedule(prev, g, elapsed, opts) → {s, d, ivl}: one review, start to
     finish. opts: retention, w, seed (fuzz; omit for none), max, and
     againToday — an Again that stays due today (ivl 0), as flashcards do
     because the session requeues it; Code's cards wait the forget
     interval instead. */
  function schedule(prev, g, elapsed, opts) {
    opts = opts || {};
    var w = opts.w || W;
    var m = memory(prev, g, elapsed, w);
    var ivl;
    if (g === 1 && opts.againToday) ivl = 0;
    else {
      ivl = interval(m.s, opts.retention, w, opts.max);
      if (g > 1 || !opts.againToday) ivl = fuzz(ivl, opts.seed, opts.max);
    }
    return { s: m.s, d: m.d, ivl: ivl };
  }

  /* ---- the exam-aware cap (roadmap 5.6 phase 2, decision E) ----
     examDay(examDays, seed) → the day, counted from today, a review held
     for an exam lands on: inside the 7–14 days before it, picked by the
     seed (the card key and the exam date) so capped cards spread across
     the window instead of piling up; when the exam is under a week away,
     any day before it. null when there is no day left before it.        */
  function examDay(examDays, seed) {
    var u = unit(seed);
    var d = examDays - (7 + Math.floor(u * 8));
    if (d >= 1) return d;
    var span = examDays - 1;
    return span >= 1 ? 1 + Math.floor(u * span) : null;
  }
  /* examCap(ivl, s, examDays, target, seed) → {ivl, capped}. A review
     that would land on or after the exam is brought into that window —
     UNLESS the card's predicted recall on the exam date (from this review,
     at stability s) already meets the EXAM-DAY target, which needs no extra
     look. The exam-day target must sit above the everyday one to do
     anything: an interval runs until recall falls to the everyday target,
     so a review after the exam always means recall on the day is above
     that. It only ever shortens an interval. */
  function examCap(ivl, s, examDays, target, seed, w) {
    var keep = { ivl: ivl, capped: false };
    if (!(target > 0) || !(examDays >= 2) || ivl < examDays) return keep;
    if (retrievability(examDays, s, w || W) >= target) return keep;
    var d = examDay(examDays, seed);
    return d != null && d < ivl ? { ivl: d, capped: true } : keep;
  }

  /* fsrs-rs memory_state_from_sm2 */
  function fromSM2(ease, ivl, r, w) {
    w = w || W;
    r = r || RETENTION;
    var dec = decay(w), fac = factor(w);
    var s = Math.max(+ivl || 0, S_MIN) * fac / (Math.pow(r, 1 / dec) - 1);
    var d = 11 - ((+ease || 2.5) - 1) / (Math.exp(w[8]) * Math.pow(s, -w[9]) * (Math.exp((1 - r) * w[10]) - 1));
    if (!isFinite(s) || !isFinite(d)) return null;
    return { s: s, d: clampD(d) };
  }

  /* recordMemory(m) → the memory a STORED card carries, or null when it
     was never reviewed (no `last`). A card FSRS last moved (fl === last)
     carries its own s and d. Anything else — a card from before the switch,
     or one an older copy of the app rated since (its `last` moved and `fl`
     did not) — converts from its SM-2 ease and interval at r = 0.9. An
     SM-2 card that lapsed has interval 0 and no record of the interval it
     had: it relearns from the forget stability of a one-day memory. */
  function recordMemory(m, w) {
    w = w || W;
    if (!m || !m.last) return null;
    if (m.s > 0 && m.d > 0 && m.fl === m.last) return { s: m.s, d: m.d };
    if (m.ivl > 0) return fromSM2(m.ef || 2.5, m.ivl, RETENTION, w);
    var c = fromSM2(m.ef || 2.5, 1, RETENTION, w);
    return c && { s: clampS(forgetS(c.d, c.s, RETENTION, w)), d: c.d };
  }

  var api = {
    W: W,
    RETENTION: RETENTION, RETENTION_MIN: RETENTION_MIN, RETENTION_MAX: RETENTION_MAX,
    MAX_IVL: MAX_IVL,
    clampRetention: clampRetention,
    retrievability: retrievability,
    memory: memory,
    interval: interval,
    fuzz: fuzz,
    fuzzRange: fuzzRange,
    unit: unit,
    schedule: schedule,
    fromSM2: fromSM2,
    recordMemory: recordMemory,
    examDay: examDay,
    examCap: examCap,
    initS: function (g, w) { return initS(g, w || W); },
    initD: function (g, w) { return initD(g, w || W); },
    forgetS: function (d, s, r, w) { return forgetS(d, s, r, w || W); }
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) { root.KOS = root.KOS || {}; root.KOS.fsrs = api; }
})(typeof window !== "undefined" ? window : null);
