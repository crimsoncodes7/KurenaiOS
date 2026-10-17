/* The facet scheduler (docs/japanese-plan.md §8–§9): FSRS-4.5 memory model per item × skill,
   derived grades, facet unlocking, sibling burying and load control. Pure: every function takes
   the state and a day number and returns new values; nothing reads the clock. Throwaway slice code. */
(function (G) {
  "use strict";
  var JA = G.JA = G.JA || {};

  // FSRS-4.5 default parameters
  var W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
  var DECAY = -0.5, FACTOR = 19 / 81, RETAIN = 0.9;
  var clampD = function (d) { return Math.min(10, Math.max(1, d)); };

  function retrievability(t, s) { return Math.pow(1 + FACTOR * t / s, DECAY); }
  function interval(s) { return Math.max(1, Math.round(s / FACTOR * (Math.pow(RETAIN, 1 / DECAY) - 1))); }
  function d0(g) { return clampD(W[4] - (g - 3) * W[5]); }

  /* review(card, grade 1–4, day) → the card's next state. A new card is {}. */
  function review(c, g, day) {
    var n = {};
    if (!c.reps) {
      n.s = W[g - 1]; n.d = d0(g);
    } else {
      var t = Math.max(0, day - c.last), r = retrievability(t, c.s);
      var d = c.d - W[6] * (g - 3);
      n.d = clampD(W[7] * d0(3) + (1 - W[7]) * d);
      if (g === 1) {
        n.s = Math.min(c.s, W[11] * Math.pow(c.d, -W[12]) * (Math.pow(c.s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r)));
      } else {
        n.s = c.s * (Math.exp(W[8]) * (11 - c.d) * Math.pow(c.s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1)
          * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1) + 1);
      }
    }
    n.reps = (c.reps || 0) + 1;
    n.lapses = (c.lapses || 0) + (g === 1 && c.reps ? 1 : 0);
    n.last = day;
    n.due = day + (g === 1 ? 1 : interval(n.s));
    if (c.firstAt == null) n.firstAt = day; else n.firstAt = c.firstAt;
    return n;
  }

  /* The grade is derived from the check, never chosen (invariant 107's rule, applied here):
     wrong → Again; near → Hard; accepted or helped by a hint → Good at best; a first-try
     answer inside the item's time target → Easy. */
  function gradeOf(res, targetMs) {
    if (res.verdict === "wrong") return 1;
    if (res.verdict === "near") return 2;
    if (res.hints) return 2;
    if (res.verdict === "accepted") return 3;
    return res.ms != null && targetMs && res.ms <= targetMs ? 4 : 3;
  }

  // seconds a review of each skill takes, for load forecasts
  var SECS = { R: 8, L: 10, W: 15, S: 20 };
  var SKILLS = ["R", "W", "L", "S"];
  var LEECH = 8, STABLE = 21;

  function key(item, skill) { return item + "|" + skill; }
  function split(k) { var i = k.lastIndexOf("|"); return { item: k.slice(0, i), skill: k.slice(i + 1) }; }

  /* Which facets an item has. A word gets R and L at once, W and S once its R holds for a week
     (never produce what you cannot yet recognise). Kana: R and W (handwriting) at once. Kanji: R only
     (handwriting lives in the opt-in deep track, decision J). Grammar: R, L, then W. */
  function facetsFor(item, facets) {
    var kind = item.split(":")[0];
    var r = facets[key(item, "R")];
    var held = r && r.s >= 7;
    if (kind === "k") return ["R", "W"];
    if (kind === "j") return ["R"];
    if (kind === "x") return ["L"]; // a saved line from your media: reviewed by ear
    if (kind === "g") return held ? ["R", "L", "W"] : ["R", "L"];
    // W and S only for words in a production set (a lesson's speaking/writing list); the rest
    // are reading and listening vocabulary, met again in input (plan §8)
    return held && JA.srs.produces(item) ? ["R", "L", "W", "S"] : ["R", "L"];
  }

  /* introduce(facets, item, day): creates the item's first facets, due today. */
  function introduce(facets, item, day) {
    var out = Object.assign({}, facets);
    facetsFor(item, facets).forEach(function (s) { if (!out[key(item, s)]) out[key(item, s)] = { due: day, isNew: true }; });
    return out;
  }
  /* After a review, any facet the item has just earned appears (due tomorrow). */
  function unlock(facets, item, day) {
    var out = facets;
    facetsFor(item, facets).forEach(function (s) {
      if (!out[key(item, s)]) { if (out === facets) out = Object.assign({}, facets); out[key(item, s)] = { due: day + 1, isNew: true }; }
    });
    return out;
  }

  /* The day's queue: due facets, most overdue first, leeches set aside, and two facets of one item
     never on the same day unless both are more than two days overdue (sibling burying). */
  function queue(facets, day) {
    var due = Object.keys(facets).filter(function (k) { var f = facets[k]; return f.due <= day && !(f.lapses >= LEECH); })
      .map(function (k) { var f = facets[k]; return { k: k, over: day - f.due, r: f.reps ? retrievability(day - f.last, f.s) : 0 }; })
      .sort(function (a, b) { return b.over - a.over || a.r - b.r || (a.k < b.k ? -1 : 1); });
    var seen = {}, out = [];
    due.forEach(function (x) {
      var it = split(x.k).item;
      if (seen[it] && !(x.over > 2 && seen[it].over > 2)) return;
      if (!seen[it]) seen[it] = x;
      out.push(x.k);
    });
    // interleave skills so two of one kind rarely sit together
    return interleave(out);
  }
  function interleave(keys) {
    var by = {}; keys.forEach(function (k) { var s = split(k).skill; (by[s] = by[s] || []).push(k); });
    var out = [], any = true;
    while (any) { any = false; SKILLS.forEach(function (s) { if (by[s] && by[s].length) { out.push(by[s].shift()); any = true; } }); }
    return out;
  }

  /* Load control: forecast review minutes over the next 7 days, and how many new items fit
     into dailyMin with the review, input and output blocks (§2's table). */
  function forecast(facets, day, days) {
    var mins = [];
    for (var d = 0; d < (days || 7); d++) {
      var secs = 0;
      // each facet counted once, on its due day (a backlog lands on today)
      Object.keys(facets).forEach(function (k) {
        var f = facets[k]; if (f.lapses >= LEECH) return;
        if (d === 0 ? f.due <= day : f.due === day + d) secs += SECS[split(k).skill];
      });
      mins.push(secs / 60);
    }
    return mins;
  }
  function newBudget(facets, day, opts) {
    opts = opts || {};
    var dailyMin = opts.dailyMin || 40, input = opts.inputMin || 8, output = opts.outputMin || 7;
    var perNew = opts.perNewMin || 1.2; // a new word: introduce, two learning reps, a sentence
    var f = forecast(facets, day, 7);
    var avg = f.reduce(function (a, b) { return a + b; }, 0) / f.length;
    var review = Math.max(f[0], avg);
    var room = dailyMin - input - output - review;
    return { reviewMin: Math.round(review * 10) / 10, newItems: Math.max(0, Math.min(opts.maxNew || 20, Math.floor(room / perNew))) };
  }

  /* Skill figures, derived (never stored): per skill, facets started and facets stable (s ≥ 21 days). */
  function skills(facets) {
    var out = {}; SKILLS.forEach(function (s) { out[s] = { started: 0, stable: 0 }; });
    Object.keys(facets).forEach(function (k) {
      var f = facets[k], s = split(k).skill;
      if (!f.reps) return;
      out[s].started++; if (f.s >= STABLE) out[s].stable++;
    });
    return out;
  }

  JA.srs = { review: review, gradeOf: gradeOf, retrievability: retrievability, interval: interval, key: key, split: split,
    facetsFor: facetsFor, introduce: introduce, unlock: unlock, queue: queue, forecast: forecast, newBudget: newBudget,
    skills: skills, produces: function () { return true; }, SECS: SECS, SKILLS: SKILLS, LEECH: LEECH, STABLE: STABLE };
})(typeof window !== "undefined" ? window : globalThis);
