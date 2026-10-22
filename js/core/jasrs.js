/* Kurenai OS — core/jasrs.js (KOS.jaSrs)
   The Japanese facet scheduler (docs/japanese-plan.md §8–§9). Pure — no clock, no store, no DOM —
   so Node runs it unchanged (smoke83).

   A FACET is one item × one skill, keyed "<item>|<skill>": "w:kore|R", "k:あ|W", "x:<id>|L".
   Its memory is KOS.fsrs's (invariant 111: ONE scheduler): s (stability, days), d (difficulty),
   with the caller's parameters and retention. Dates are ISO days ("2026-10-22"), as Code's cards.

     { s, d, ivl, due, last, reps, lapses, firstAt, isNew }

   Item kinds and their facets (§8):
     k:<kana>   R, W (W is handwriting); a combined kana (k:きゃ) R only
     j:<kanji>  R (H only in the Kanji deep track)
     w:<word>   R, L — then W and S once R holds a week, and only for a lesson's PRODUCTION set
     g:<point>  R, L — then W once R holds a week
     s:<pair>   L (a sound contrast: minimal pairs)
     x:<line>   L (a saved line from your media, reviewed as clip dictation)

   Grades are DERIVED from the check (invariant 113), never chosen: wrong → Again, near → Hard,
   a hint → Hard, accepted → Good, a first try inside the item's time target → Easy. */
(function (G) {
  "use strict";
  var KOS = G.KOS = G.KOS || {};
  var DAY = 864e5;

  var SKILLS = ["R", "W", "L", "S"];
  var SECS = { R: 8, L: 10, W: 15, S: 20, H: 15 }; // seconds a review takes, for the load forecast
  var LEECH = 8, STABLE = 21, HOLD = 7;

  function F() { return KOS.fsrs; }
  function addDays(iso, n) { var t = Date.parse(iso + "T12:00:00Z") + n * DAY, d = new Date(t); return d.toISOString().slice(0, 10); }
  function days(a, b) { return Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / DAY); }
  function r4(v) { return Math.round(v * 1e4) / 1e4; }

  function key(item, skill) { return item + "|" + skill; }
  function split(k) { var i = String(k).lastIndexOf("|"); return { item: k.slice(0, i), skill: k.slice(i + 1), kind: k.slice(0, k.indexOf(":")) }; }

  /* gradeOf(result, targetMs) → 1 Again · 2 Hard · 3 Good · 4 Easy, or null for a self-marked
     result (it never moves a schedule). result: { verdict, hints, ms, selfMarked } */
  function gradeOf(res, targetMs) {
    if (!res || res.selfMarked) return null;
    if (res.verdict === "wrong") return 1;
    if (res.verdict === "near" || res.hints) return 2;
    if (res.verdict === "accepted") return 3;
    return res.ms != null && targetMs && res.ms <= targetMs ? 4 : 3;
  }

  /* review(facet, grade, today, opts) → the facet's next state. opts: { w, retention, seed } */
  function review(f, g, today, opts) {
    opts = opts || {};
    f = f || {};
    var prev = f.reps && f.s > 0 && f.d > 0 ? { s: f.s, d: f.d } : null;
    var el = prev && f.last ? Math.max(0, days(f.last, today)) : 0;
    var nx = F().schedule(prev, g, el, { retention: opts.retention, seed: opts.seed || "ja|" + today, w: opts.w });
    var ivl = Math.max(1, nx.ivl); // no session requeues a facet: an Again comes back tomorrow
    return {
      s: r4(nx.s), d: r4(nx.d), ivl: ivl, due: addDays(today, ivl), last: today,
      reps: (f.reps || 0) + 1, lapses: (f.lapses || 0) + (g === 1 && f.reps ? 1 : 0),
      firstAt: f.firstAt || today
    };
  }

  /* Which facets an item has now. opts.produces(item) says whether a word is in a production
     set; deep(item) whether the Kanji deep track is on. */
  function facetsFor(item, facets, opts) {
    opts = opts || {};
    var kind = item.slice(0, item.indexOf(":"));
    var r = facets && facets[key(item, "R")], held = !!(r && r.reps && r.s >= HOLD);
    if (kind === "k") return item.length > 3 ? ["R"] : ["R", "W"]; // きゃ is written as two kana already practised
    if (kind === "j") return opts.deep && opts.deep(item) ? ["R", "H"] : ["R"];
    if (kind === "s" || kind === "x") return ["L"];
    if (kind === "g") return held ? ["R", "L", "W"] : ["R", "L"];
    if (kind === "w") return held && opts.produces && opts.produces(item) ? ["R", "L", "W", "S"] : ["R", "L"];
    return ["R"];
  }

  /* introduce(facets, item, today, opts) → a copy with the item's first facets, due today */
  function introduce(facets, item, today, opts) {
    var out = Object.assign({}, facets);
    facetsFor(item, facets, opts).forEach(function (s) { var k = key(item, s); if (!out[k]) out[k] = { due: today, isNew: true }; });
    return out;
  }
  /* unlock(facets, item, today, opts) → after a review, any facet the item has just earned
     appears, due tomorrow (the same object when nothing changed) */
  function unlock(facets, item, today, opts) {
    var out = facets;
    facetsFor(item, facets, opts).forEach(function (s) {
      var k = key(item, s);
      if (!out[k]) { if (out === facets) out = Object.assign({}, facets); out[k] = { due: addDays(today, 1), isNew: true }; }
    });
    return out;
  }

  function leech(f) { return !!(f && f.lapses >= LEECH); }
  function recall(f, today, w) { return f && f.reps && f.s > 0 ? F().retrievability(Math.max(0, days(f.last, today)), f.s, w) : 0; }

  /* queue(facets, today, w) → due facet keys: most overdue first, then the weakest; leeches set
     aside; two facets of one item never on the same day unless both are over two days overdue
     (sibling burying); skills interleaved so two of one kind rarely sit together. */
  function queue(facets, today, w) {
    var due = Object.keys(facets || {}).filter(function (k) { var f = facets[k]; return f && f.due && f.due <= today && !leech(f); })
      .map(function (k) { var f = facets[k]; return { k: k, over: days(f.due, today), r: recall(f, today, w) }; })
      .sort(function (a, b) { return b.over - a.over || a.r - b.r || (a.k < b.k ? -1 : 1); });
    var seen = {}, out = [];
    due.forEach(function (x) {
      var it = split(x.k).item;
      if (seen[it] && !(x.over > 2 && seen[it].over > 2)) return;
      if (!seen[it]) seen[it] = x;
      out.push(x.k);
    });
    return interleave(out);
  }
  function interleave(keys) {
    var by = {}, order = SKILLS.concat(["H"]);
    keys.forEach(function (k) { var s = split(k).skill; (by[s] = by[s] || []).push(k); });
    var out = [], any = true;
    while (any) { any = false; order.forEach(function (s) { if (by[s] && by[s].length) { out.push(by[s].shift()); any = true; } }); }
    return out;
  }

  /* forecast(facets, today, n) → review minutes for each of the next n days; each facet counted
     once, on its due day (a backlog lands on today) — §9: a cumulative count starved new words */
  function forecast(facets, today, n) {
    var mins = [];
    for (var d = 0; d < (n || 7); d++) {
      var day = addDays(today, d), secs = 0;
      Object.keys(facets || {}).forEach(function (k) {
        var f = facets[k]; if (!f || !f.due || leech(f)) return;
        if (d === 0 ? f.due <= today : f.due === day) secs += SECS[split(k).skill] || 10;
      });
      mins.push(secs / 60);
    }
    return mins;
  }
  /* newBudget(facets, today, opts) → { reviewMin, newItems }: what fits in dailyMin after the
     review forecast and the fixed input and output blocks (§2) */
  function newBudget(facets, today, opts) {
    opts = opts || {};
    var dailyMin = opts.dailyMin || 40, input = opts.inputMin == null ? 8 : opts.inputMin, output = opts.outputMin == null ? 7 : opts.outputMin;
    var perNew = opts.perNewMin || 1.2;
    var f = forecast(facets, today, 7), avg = f.reduce(function (a, b) { return a + b; }, 0) / f.length;
    var reviewMin = Math.max(f[0], avg);
    var room = dailyMin - input - output - reviewMin;
    return { reviewMin: Math.round(reviewMin * 10) / 10, newItems: Math.max(0, Math.min(opts.maxNew || 20, Math.floor(room / perNew))) };
  }

  /* skills(facets) → per skill { started, stable } (stable: s ≥ 21 days) — derived, never stored */
  function skills(facets) {
    var out = {}; SKILLS.concat(["H"]).forEach(function (s) { out[s] = { started: 0, stable: 0 }; });
    Object.keys(facets || {}).forEach(function (k) {
      var f = facets[k], s = split(k).skill;
      if (!f || !f.reps || !out[s]) return;
      out[s].started++; if (f.s >= STABLE) out[s].stable++;
    });
    return out;
  }

  KOS.jaSrs = {
    key: key, split: split, gradeOf: gradeOf, review: review, facetsFor: facetsFor, introduce: introduce, unlock: unlock,
    queue: queue, forecast: forecast, newBudget: newBudget, skills: skills, recall: recall, leech: leech,
    addDays: addDays, days: days, SKILLS: SKILLS, SECS: SECS, LEECH: LEECH, STABLE: STABLE, HOLD: HOLD
  };
})(typeof window !== "undefined" ? window : globalThis);
