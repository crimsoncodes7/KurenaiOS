/* Kurenai OS — smoke83.test.js
   Japanese: the facet scheduler and the timeline (roadmap 5.5, docs/japanese-plan.md §8–§10).

   The claims:

     A · ONE SCHEDULER. A facet schedules through KOS.fsrs (invariant 111): the first Good sets
         s = w[2]; the same review on the same day gives the same interval (fuzz is seeded); an
         Again comes back tomorrow, not today, and counts a lapse.
     B · DERIVED GRADES. wrong → Again, near or a hint → Hard, accepted → Good, a first try
         inside the target → Easy; a self-marked result has no grade and moves nothing.
     C · FACETS UNLOCK IN ORDER. A word starts with R and L; W and S appear only once R holds a
         week AND the word is in a production set. Kana: R and W; a combined kana R only; a
         sound contrast and a saved line L only; grammar earns W.
     D · SIBLING BURYING. Two facets of one item never share a day unless both are over two days
         overdue; a leech (8 lapses) leaves the queue.
     E · LOAD CONTROL. The forecast counts each facet once, on its due day (a backlog on today);
         a heavy review day shrinks new items, and the input block is never cut.
     F · THE TIMELINE is "calibrating" under two weeks of history, then a range (from ≤ to, no
         NaN); a milestone already met carries no dates.
     G · THE CLOUD MERGE keeps a facet whole: changed on both devices, the one reviewed later
         wins every field.

   Run: node tools/smoke83.test.js                                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-10-22";
let app, K, S;

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; S = K.jaSrs;
  assert(K.ja && S && K.fsrs, "KOS.ja, KOS.jaSrs and KOS.fsrs are loaded");
  eq(app.errors, [], "boot errors");
});

/* ---------------- A ---------------- */
step("A · facets schedule through KOS.fsrs, deterministically", () => {
  const f1 = S.review({}, 3, TODAY, { retention: 0.9 });
  eq(f1.s, 2.3065, "first Good stability = w[2]");
  eq(f1.ivl, S.review({}, 3, TODAY, { retention: 0.9 }).ivl, "same review, same interval");
  const f2 = S.review(f1, 3, f1.due, { retention: 0.9, seed: "x" });
  assert(f2.ivl > f1.ivl && f2.reps === 2, "a second Good grows the interval: " + f2.ivl);
  const lapse = S.review(f2, 1, f2.due, { retention: 0.9 });
  eq([lapse.lapses, lapse.due], [1, S.addDays(f2.due, lapse.ivl)], "an Again counts a lapse");
  assert(lapse.ivl >= 1, "and never comes back the same day");
});

/* ---------------- B ---------------- */
step("B · grades are derived, never chosen", () => {
  eq([S.gradeOf({ verdict: "wrong" }), S.gradeOf({ verdict: "near" }), S.gradeOf({ verdict: "correct", hints: 1 }),
    S.gradeOf({ verdict: "accepted", ms: 100 }, 4000), S.gradeOf({ verdict: "correct", ms: 3000 }, 4000),
    S.gradeOf({ verdict: "correct", ms: 9000 }, 4000)], [1, 2, 2, 3, 4, 3], "the grade table");
  eq(S.gradeOf({ verdict: "correct", selfMarked: true }), null, "self-marked: no grade");
  K.ja.startLesson("H1");
  const before = JSON.stringify(K.store.state.japanese.facets["k:あ|R"]);
  const r = K.ja.record("k:あ|R", { verdict: "correct", selfMarked: true });
  eq(r.grade, null, "record: no grade");
  eq(JSON.stringify(K.store.state.japanese.facets["k:あ|R"]), before, "and the facet did not move");
});

/* ---------------- C ---------------- */
step("C · facets unlock in order", () => {
  const prod = { produces: () => true }, notProd = { produces: () => false };
  eq(S.facetsFor("w:kore", {}, prod), ["R", "L"], "a new word: R and L");
  const held = { "w:kore|R": { reps: 3, s: 8, d: 5 } };
  eq(S.facetsFor("w:kore", held, prod), ["R", "L", "W", "S"], "R holds a week and it is produced: W and S");
  eq(S.facetsFor("w:kore", held, notProd), ["R", "L"], "not in a production set: still R and L");
  eq(S.facetsFor("w:kore", { "w:kore|R": { reps: 2, s: 5 } }, prod), ["R", "L"], "R not yet held");
  eq(S.facetsFor("k:あ", {}), ["R", "W"], "kana: reading and handwriting");
  eq(S.facetsFor("k:きゃ", {}), ["R"], "a combined kana: reading only");
  eq([S.facetsFor("s:long", {}), S.facetsFor("x:m1", {})], [["L"], ["L"]], "a sound contrast and a saved line: listening");
  eq(S.facetsFor("g:te-form", { "g:te-form|R": { reps: 2, s: 9 } }), ["R", "L", "W"], "grammar earns W");
  const u = S.unlock(held, "w:kore", TODAY, prod);
  eq(u["w:kore|W"].due, S.addDays(TODAY, 1), "an unlocked facet starts tomorrow");
  assert(S.unlock(u, "w:kore", TODAY, prod) === u, "nothing new: the same object");
});

/* ---------------- D ---------------- */
step("D · sibling burying and leeches", () => {
  const facets = {
    "w:a|R": { due: TODAY, reps: 1, s: 2, d: 5, last: S.addDays(TODAY, -2) },
    "w:a|L": { due: TODAY, reps: 1, s: 2, d: 5, last: S.addDays(TODAY, -2) },
    "w:b|R": { due: S.addDays(TODAY, -4), reps: 1, s: 2, d: 5, last: S.addDays(TODAY, -6) },
    "w:b|L": { due: S.addDays(TODAY, -3), reps: 1, s: 2, d: 5, last: S.addDays(TODAY, -6) },
    "w:c|R": { due: TODAY, reps: 9, s: 1, d: 9, last: S.addDays(TODAY, -1), lapses: 8 }
  };
  const q = S.queue(facets, TODAY);
  assert(q.indexOf("w:a|R") >= 0 !== (q.indexOf("w:a|L") >= 0), "one facet of w:a today: " + q.join(","));
  assert(q.indexOf("w:b|R") >= 0 && q.indexOf("w:b|L") >= 0, "both of w:b — both over two days overdue");
  assert(q.indexOf("w:c|R") < 0, "a leech is set aside");
  eq(q[0], "w:b|R", "the most overdue first");
});

/* ---------------- E ---------------- */
step("E · load control: forecast once on its due day, new items shrink, input stays", () => {
  const facets = {};
  for (let i = 0; i < 30; i++) facets["w:t" + i + "|R"] = { due: S.addDays(TODAY, -i % 3), reps: 1, s: 3, d: 5 };
  for (let i = 0; i < 12; i++) facets["w:u" + i + "|L"] = { due: S.addDays(TODAY, 2), reps: 1, s: 3, d: 5 };
  const f = S.forecast(facets, TODAY, 7);
  eq(Math.round(f[0] * 60), 30 * 8, "today: the whole backlog once");
  eq(Math.round(f[2] * 60), 12 * 10, "day 2: its own facets only");
  eq(Math.round(f[1] * 60), 0, "day 1: nothing counted twice");
  const light = S.newBudget({}, TODAY, { dailyMin: 40 });
  const heavy = {}; for (let i = 0; i < 200; i++) heavy["w:h" + i + "|R"] = { due: TODAY, reps: 1, s: 3, d: 5 };
  const hb = S.newBudget(heavy, TODAY, { dailyMin: 40 });
  assert(light.newItems > hb.newItems, "a heavy day shrinks new items: " + light.newItems + " → " + hb.newItems);
  const st = K.store.state.japanese;
  const saved = st.facets; st.facets = heavy;
  const plan = K.ja.planDay(TODAY);
  st.facets = saved;
  eq(plan.input.min, 8, "the input block is never cut");
  assert(plan.learn && plan.learn.heavy, "and the plan says it is a heavy day");
});

/* ---------------- F ---------------- */
step("F · the timeline: calibrating, then a range", () => {
  const st = K.store.state.japanese, saved = st.facets;
  st.facets = { "w:x|R": { reps: 1, s: 2, d: 5, firstAt: S.addDays(TODAY, -3), last: TODAY, due: TODAY } };
  const cal = K.ja.timeline(TODAY);
  assert(cal.calibrating && cal.perWeek === null, "under two weeks: calibrating");
  assert(cal.milestones.every((m) => m.from === null && m.to === null), "and no dates");
  const f = {};
  for (let i = 0; i < 120; i++) f["w:y" + i + "|R"] = { reps: 2, s: 9, d: 5, firstAt: S.addDays(TODAY, -(i % 28) - 1), last: TODAY, due: TODAY };
  for (const ch of "あいうえおかきくけこ") f["k:" + ch + "|R"] = { reps: 3, s: 12, d: 4, firstAt: S.addDays(TODAY, -27), last: TODAY, due: TODAY };
  st.facets = f;
  const tl = K.ja.timeline(TODAY);
  st.facets = saved;
  assert(!tl.calibrating && tl.perWeek && tl.perWeek.lo <= tl.perWeek.mid && tl.perWeek.mid <= tl.perWeek.hi, "a rate range: " + JSON.stringify(tl.perWeek));
  tl.milestones.forEach((m) => {
    assert(!/NaN/.test(JSON.stringify(m)), "no NaN: " + m.id);
    if (m.done) eq([m.from, m.to], [null, null], m.id + " met: no dates");
    else if (m.unit === "words") assert(m.from && m.to && m.from <= m.to, m.id + " is a range: " + m.from + "–" + m.to);
  });
  eq(tl.milestones.find((m) => m.id === "reader1").done, false, "300 words not met with 120");
  eq(tl.milestones.find((m) => m.id === "kana").have, 10, "ten basic kana held");
});

/* ---------------- G ---------------- */
step("G · the cloud merge keeps a facet whole", () => {
  const k = "w:kore|R";
  const base = { japanese: { facets: { [k]: { s: 3, d: 5, ivl: 3, due: "2026-10-25", last: "2026-10-22", reps: 2 } } } };
  const local = JSON.parse(JSON.stringify(base)), remote = JSON.parse(JSON.stringify(base));
  local.japanese.facets[k] = { s: 9, d: 4.8, ivl: 9, due: "2026-11-03", last: "2026-10-25", reps: 3 };
  remote.japanese.facets[k] = { s: 1, d: 6.2, ivl: 1, due: "2026-10-27", last: "2026-10-26", reps: 3, lapses: 1 };
  const out = K.cloudmerge.merge(base, local, remote).doc.japanese.facets[k];
  eq(out, remote.japanese.facets[k], "the later review wins every field");
  const other = { japanese: { facets: { "w:sore|R": { s: 4, d: 5, due: "2026-10-30", last: "2026-10-26", reps: 1 } } } };
  const both = K.cloudmerge.merge({ japanese: { facets: {} } }, { japanese: { facets: base.japanese.facets } }, other).doc.japanese.facets;
  eq(Object.keys(both).sort(), ["w:kore|R", "w:sore|R"], "facets from both devices survive");
  eq(app.errors, [], "window errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("FAIL  " + name + "\n      " + e.message); }
  }
  console.log(failed ? "\n" + failed + " step(s) failed" : "\nsmoke83: all " + steps.length + " steps passed");
  process.exit(failed ? 1 : 0);
})();
