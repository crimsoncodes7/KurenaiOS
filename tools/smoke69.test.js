/* Kurenai OS — smoke69.test.js
   Reports, phase 2 (roadmap 5.1, docs/reports-plan.md): the periods, the
   facts and the saved report, against the README's "Rules".

   The claims:

     A · PERIODS. A week is Monday–Sunday, a month a calendar month, a
         year 1 Sep – 31 Aug, a term a run of plan weeks split by two or
         more break weeks (a one-week half term stays inside); a week is
         READY on the following Monday at 07:00 (rule 8).
     B · FACTS ARE THE LEDGER'S. Study time is Focus time (an early-ended
         session's time counts, its day does not keep the streak); reviews
         and recall come from the card sessions; topic time splits across
         the leaves a session linked.
     C · ZEROS (rule 1). A supporting zero is absent, not printed: no plan
         block without plan rows, no empty status buckets, no tasks block
         without a completion — while "studied 0" stays (the study block is
         always there).
     D · EVIDENCE (rule 2). Recall only from 50 reviews; the day chart
         from 3 active days; a persona from 5 Focus blocks; a story without
         evidence is dropped and the week keeps at least four.
     E · COMPARISONS (rule 5). "▲ … on last week" / "▼ …" / "same as" /
         "new this week" — never a bare 0 or "+∞%".
     F · REWARDS (rule 6). Earned XP/gold is the sum of the awards the
         ledger recorded; when any entry predates the awards it is left
         out rather than guessed.
     G · STATUS MOVES come from the boundary snapshots; with none (a
         rebuild from history) there is no "to Green" claim at all.
     H · THE COLLECTION reads the journal: "ep 14–16" ranges, finished /
         started / paused / dropped, ≈ minutes from episode length, highs
         and lows; a rebuild still sees titles finished or started in range
         from their dates.
     I · WORDS. The template is deterministic and follows the order of
         24f (largest share, recall, Green, peak hour, carry-overs).
     J · SAVED (rule 7). A week is saved once it is ready and never
         recomputed; only its words change; weeks before the first
         snapshot are backfilled and marked rebuilt; an empty rebuilt week
         is not saved.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke69.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }

/* a fixed week: Mon 5 – Sun 11 October 2026 */
const W = { period: "week", id: "week:2026-10-05", start: "2026-10-05", end: "2026-10-11" };
let seq = 1;
function at(date, hh, mm) { const [y, m, d] = date.split("-").map(Number); return new Date(y, m - 1, d, hh, mm || 0).getTime(); }
function focus(date, endH, mins, opts = {}) {
  return { id: seq++, ts: at(date, endH), date, type: "focus", subject: opts.sid || "compsci", ref: opts.ref || "4.1.1.1",
    refs: opts.refs, dur: mins * 60, metrics: Object.assign({ complete: true, mode: opts.mode || "pomodoro" }, opts.m || {}),
    award: opts.noAward ? undefined : { xp: 10 + mins, gold: 3 } };
}
function cards(date, n, again, opts = {}) {
  return { id: seq++, ts: at(date, 12), date, type: "flashcards", subject: opts.sid || "compsci", ref: opts.ref || "4.1.1.1",
    metrics: { cards: n, again: again, hard: 0, good: n - again, easy: 0 }, award: { xp: 15 + n, gold: 3 } };
}
function input(extra) { return Object.assign({ ledger: [], rows: [], tally: {}, reminders: [], habits: [] }, extra); }

/* ============ A · periods ============ */
step("A · weeks, months, years and terms", async (app) => {
  const R = app.KOS.report;
  eq(R.week("2026-10-08"), { period: "week", id: "week:2026-10-05", start: "2026-10-05", end: "2026-10-11" }, "a Thursday's week");
  eq(R.week("2026-10-11").start, "2026-10-05", "Sunday belongs to the week before it");
  eq(R.month("2026-02-14"), { period: "month", id: "month:2026-02", start: "2026-02-01", end: "2026-02-28" }, "February");
  eq([R.year("2026-08-31").id, R.year("2026-09-01").id, R.year("2026-09-01").label], ["year:2025", "year:2026", "2026–27"], "the academic year turns on 1 Sep");
  eq(R.previous(W).id, "week:2026-09-28", "the week before");
  eq(R.previous(R.month("2026-01-10")).id, "month:2025-12", "the month before crosses the year");
  const ready = R.readyAt(W);
  assert(!R.isReady(W, ready - 1) && R.isReady(W, ready), "ready at Monday 07:00");
  eq(new Date(ready).getHours() + ":" + new Date(ready).getDate(), "7:12", "the following Monday, 07:00");
  /* terms from the plan: a one-week half term stays inside, two weeks split */
  const P = app.KOS.pacing, real = { weeks: P.weeks, isBreak: P.isBreak };
  const wk = (wb, br) => ({ wb, schoolWk: br ? null : 1, personalWk: br ? null : 1 });
  const plan = [wk("2026-09-07"), wk("2026-09-14"), wk("2026-10-26", true), wk("2026-11-02"),
    wk("2026-12-21", true), wk("2026-12-28", true), wk("2027-01-04"), wk("2027-01-11")];
  P.weeks = () => plan; P.isBreak = (w) => w.schoolWk == null;
  const ts = R.terms();
  P.weeks = real.weeks; P.isBreak = real.isBreak;
  eq(ts.map(t => [t.start, t.end, t.label]), [["2026-09-07", "2026-11-08", "Autumn term 2026"], ["2027-01-04", "2027-01-17", "Spring term 2027"]], "terms split at a two-week break only");
});

/* ============ B, C, D · the ledger, zeros and evidence ============ */
step("B · study time, reviews and topic time come from the ledger", async (app) => {
  const R = app.KOS.report;
  const ledger = [
    focus("2026-10-05", 19, 60, { sid: "compsci", refs: ["compsci:4.1.1.1", "compsci:4.1.1.2"] }),
    focus("2026-10-06", 20, 30, { sid: "maths", ref: "P1", refs: undefined }),
    focus("2026-10-07", 21, 20, { m: { complete: false } }),   // ended early: time, not a streak day
    cards("2026-10-05", 30, 3),
    focus("2026-10-12", 10, 90)                                 // next week: not counted
  ];
  const f = R.compute(input({ ledger }), W);
  eq(f.study.mins, 110, "Focus minutes, an early end included");
  eq(f.study.sessions, 3, "three Focus sessions");
  eq(f.study.days, 2, "an early-ended session's day is not a study day");
  eq(f.study.bySubject, { compsci: 80, maths: 30 }, "minutes by subject");
  eq(f.study.reviews, 30, "reviews from the card session");
  const t1 = f.study.topics.find(t => t.key === "compsci:4.1.1.1"), t2 = f.study.topics.find(t => t.key === "compsci:4.1.1.2");
  assert(t1 && t2 && t1.mins === 30 + 20 && t2.mins === 30, "a session's time splits across its leaves (" + (t1 && t1.mins) + "/" + (t2 && t2.mins) + ")");
  eq(f.study.dayMins.length, 7, "seven day buckets");
});

step("C · supporting zeros are absent; the study block always stays", async (app) => {
  const R = app.KOS.report;
  const f = R.compute(input({}), W);
  assert(f.study && f.study.mins === 0, "studied 0 stays: it is the point");
  assert(!("plan" in f) && !("tasks" in f) && !("collection" in f) && !("kurenai" in f), "no empty plan/tasks/collection/kurenai blocks");
  assert(f.study.recall === null && f.study.toGreen === null, "no recall and no Green claim without evidence");
  const g = R.compute(input({ planRows: [{ id: "a", source: "personal", title: "Revise", done: true }], planWb: W.start,
    reminders: [{ title: "x", done: true, completedAt: at("2026-10-06", 9) }, { title: "old", done: true, completedAt: at("2026-09-01", 9) }] }), W);
  assert(g.plan && g.plan.ticked === 1 && !("carried" in g.plan), "a fully ticked plan has no carried figure");
  eq(g.tasks.reminders, 1, "only reminders completed inside the week");
});

step("D · evidence floors: recall 50, chart 3 days, persona 5 blocks, at least 4 stories", async (app) => {
  const R = app.KOS.report;
  assert(R.compute(input({ ledger: [cards("2026-10-05", 49, 5)] }), W).study.recall === null, "49 reviews: no recall");
  eq(R.compute(input({ ledger: [cards("2026-10-05", 50, 5)] }), W).study.recall, 90, "50 reviews: recall 90%");
  const two = R.compute(input({ ledger: [focus("2026-10-05", 19, 30), focus("2026-10-06", 19, 30)] }), W);
  assert(two.study.chartDays === false, "two active days: no chart claim");
  assert(!two.focus.persona, "two blocks: no persona");
  assert(two.stories.length >= 4 && two.stories[0] === "intro" && two.stories[two.stories.length - 1] === "recap", "the week keeps at least four stories: " + two.stories);
  const evening = ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09"].map(d => focus(d, 20, 35));
  const five = R.compute(input({ ledger: evening }), W);
  assert(five.study.chartDays === true, "five active days: the chart");
  assert(five.focus.persona && five.focus.persona.id === "evening", "five evening blocks: Evening Sprinter, got " + JSON.stringify(five.focus.persona));
  assert(/100% of your Focus came after 18:00, in blocks of about 35 minutes\./.test(five.focus.persona.fact), "the persona's fact line: " + five.focus.persona.fact);
  assert(five.stories.indexOf("persona") !== -1 && five.stories.indexOf("quiz") !== -1, "persona and quiz stories once evidenced: " + five.stories);
  eq(five.focus.heat[0][20 - 7 - 1], 35, "Monday's 19:25–20:00 block lands in the 19:00 heat cell");
  eq(five.focus.peakHour, 19, "the peak hour");
});

/* ============ E · comparisons ============ */
step("E · comparisons say up, down, same or new — never 0 or ∞", async (app) => {
  const c = app.KOS.reportWords.compare;
  eq(c(700, 585, "last week", "mins"), { dir: "up", text: "▲ 1h 55m on last week" }, "up, in time");
  eq(c(80, 100, "Aug"), { dir: "down", text: "▼ 20% on Aug" }, "down, as a share");
  eq(c(84, 81, "Aug", "pct"), { dir: "up", text: "▲ 3 pts on Aug" }, "points for a percentage");
  eq(c(5, 5, "last week"), { dir: "same", text: "same as last week" }, "equal");
  eq(c(5, 0, "last week"), { dir: "new", text: "new this week" }, "from nothing");
  assert(c(0, 0, "last week").text === "same as last week" && c(3, null, "x") === null, "nothing to compare is no comparison");
});

/* ============ F · rewards ============ */
step("F · earned is the recorded awards, or nothing", async (app) => {
  const R = app.KOS.report;
  const all = R.compute(input({ ledger: [focus("2026-10-05", 19, 30), cards("2026-10-06", 20, 1)] }), W);
  eq([all.gov.xp, all.gov.gold], [40 + 35, 6], "the sum of the awards");
  const gap = R.compute(input({ ledger: [focus("2026-10-05", 19, 30), focus("2026-10-06", 19, 30, { noAward: true })] }), W);
  assert(!("xp" in gap.gov) && !("gold" in gap.gov), "an entry with no recorded award leaves earnings out");
  const streak = R.compute(input({ ledger: ["2026-10-09", "2026-10-10", "2026-10-11"].map(d => cards(d, 5, 0)) }), W);
  eq(streak.gov.streak, 3, "the streak at the week's end");
});

/* ============ G · status moves ============ */
step("G · moves to Green come from the snapshots, or are not claimed", async (app) => {
  const R = app.KOS.report;
  const ledger = [focus("2026-10-05", 19, 60, { refs: ["compsci:4.1.1.1"] })];
  const snapStart = { id: "2026-10-05", topics: { "compsci:4.1.1.1": ["a", "started", 40], "compsci:4.1.1.2": ["r", "started", 10] }, gov: { level: 3 } };
  const snapEnd = { id: "2026-10-12", topics: { "compsci:4.1.1.1": ["g", "started", 70], "compsci:4.1.1.2": ["r", "started", 12] }, gov: { level: 4 } };
  const f = R.compute(input({ ledger, snapStart, snapEnd }), W);
  eq(f.study.toGreen, 1, "one topic to Green");
  const t = f.study.topics.find(x => x.key === "compsci:4.1.1.1");
  eq([t.from, t.to], ["a", "g"], "the topic row says Amber → Green");
  eq([f.gov.levelFrom, f.gov.level], [3, 4], "a level gained in the week");
  const r = R.compute(input({ ledger, rebuilt: true }), W);
  assert(r.rebuilt === true && r.study.toGreen === null && r.study.moves === null, "a rebuild makes no Green claim");
});

/* ============ H · the Collection ============ */
step("H · titles, ranges, statuses and estimates from the journal", async (app) => {
  const R = app.KOS.report;
  const d = (date, h) => at(date, h);
  const rows = [
    { id: 1, syncId: "s1", module: "anime", title: "Frieren", status: "inProgress", score: 9, genres: ["Adventure", "Fantasy"],
      extra: { duration: 24, country: "JP", aniTags: ["Travel"], studio: "Madhouse", format: "TV" },
      journal: [[d("2026-10-06", 20), "progress", 13, 16]] },
    { id: 2, syncId: "s2", module: "books", title: "Spice and Wolf", status: "completed", score: 10, format: "lightNovel", genres: ["Romance"],
      journal: [[d("2026-10-10", 15), "volumes", 4, 5], [d("2026-10-10", 15), "status", "inProgress", "completed"]] },
    { id: 3, syncId: "s3", module: "anime", title: "Pupa", status: "dropped", score: 3, genres: ["Horror"], extra: {},
      journal: [[d("2026-10-07", 22), "progress", 3, 4], [d("2026-10-07", 22), "status", "inProgress", "dropped"]] },
    { id: 4, syncId: "s4", module: "game", title: "Outer Wilds", status: "inProgress", score: 0, extra: {},
      journal: [[d("2026-10-08", 23), "hours", 2, 6.5]] },
    { id: 5, syncId: "s5", module: "anime", title: "Old", status: "completed", score: 7, extra: {}, journal: [[d("2026-09-01", 9), "progress", 1, 2]] }
  ];
  const f = R.compute(input({ rows }), W);
  const c = f.collection;
  eq(c.count, 4, "four titles moved this week (one only last month)");
  eq(c.byModule, { anime: 2, books: 1, game: 1 }, "by medium");
  const fr = c.titles.find(t => t.title === "Frieren");
  eq([fr.range, fr.mins], ["ep 14–16", 72], "ep 14–16, ≈ 3 × 24 minutes");
  eq(c.titles.find(t => t.title === "Spice and Wolf").range, "vol 5", "one volume read");
  eq(c.titles.find(t => t.title === "Outer Wilds").range, "4h 30m", "hours played");
  eq(c.status, { finished: 1, continued: 2, dropped: 1 }, "statuses in their fixed order, zeros absent");
  eq([c.hi.title, c.lo.title], ["Spice and Wolf", "Pupa"], "highest and lowest scores");
  eq(c.countries, [{ name: "JP", n: 1 }], "where it came from");
  eq(c.estMins, 72 + 240 + 24 + 270, "≈ minutes across the week");
  /* a rebuild still sees dates */
  const old = [{ id: 9, syncId: "s9", module: "books", title: "Wotakoi", status: "completed", score: 8, dates: { started: "2026-10-05", finished: "2026-10-09" }, journal: [] }];
  const r = R.compute(input({ rows: old, rebuilt: true }), W);
  eq([r.collection.count, r.collection.status.finished, r.collection.titles[0].range], [1, 1, null], "a dated finish counts; no invented range");
});

/* ============ I · words ============ */
step("I · the template words, in the order of 24f", async (app) => {
  const R = app.KOS.report, Wd = app.KOS.reportWords;
  const ledger = [
    focus("2026-10-05", 19, 310, { sid: "compsci" }), focus("2026-10-06", 20, 290, { sid: "maths", ref: "P1" }),
    focus("2026-10-07", 20, 100, { sid: "it", ref: "F201" }), cards("2026-10-05", 312, 44)
  ];
  const snapStart = { topics: { "compsci:4.1.1.1": ["a", "started", 1] } }, snapEnd = { topics: { "compsci:4.1.1.1": ["g", "started", 2] } };
  const f = R.compute(input({ ledger, snapStart, snapEnd, prev: { mins: 585 },
    planRows: [{ id: "a", source: "personal", title: "x", done: true }, { id: "b", source: "personal", title: "y", done: false }], planWb: W.start }), W);
  const w = Wd.template(f);
  eq(w.headline, "11h 40m studied and 1 topic to Green.", "the headline");
  const order = ["Computer Science took the largest share, 5h 10m of 11h 40m", "1h 55m more than last week", "Recall was 86% across 312 reviews",
    "moved to Green", "Most Focus came around", "1 of 2 plan rows ticked; 1 row carried on"];
  let at0 = -1;
  order.forEach(s => { const i = w.narrative.indexOf(s); assert(i > at0, "“" + s + "” in order in: " + w.narrative); at0 = i; });
  eq(Wd.template(f), w, "deterministic");
  eq(Wd.template(R.compute(input({}), W)).headline, "A quiet week for study.", "an empty week says so plainly");
});

/* ============ J · the saved report ============ */
step("J · saved once when ready, never recomputed, words only; backfill marked", async (app) => {
  const KOS = app.KOS, rs = KOS.reportStore, R = KOS.report;
  const S = KOS.store.state;
  S.sessions.length = 0;
  S.sessions.push(focus("2026-09-08", 19, 45), focus("2026-09-29", 19, 50), focus("2026-10-06", 19, 60), cards("2026-10-07", 20, 2));
  /* the baseline snapshot: taken Monday 5 Oct */
  await p(cb => rs.putSnapshot({ id: "2026-10-05", boundary: "2026-10-05", takenAt: at("2026-10-05", 9), topics: {}, gov: { xp: 0, gold: 0, level: 1 }, media: {} }, cb));
  /* Monday 12 Oct, 06:59 — last week is not ready yet */
  let saved = await p(cb => rs.ensureReports(cb, at("2026-10-12", 6, 59)));
  assert(!saved.some(r => r.id === "week:2026-10-05"), "not before 07:00");
  assert(saved.some(r => r.id === "week:2026-09-07" && r.rebuilt) && saved.some(r => r.id === "week:2026-09-28" && r.rebuilt),
    "weeks before the first snapshot are backfilled and marked rebuilt: " + saved.map(r => r.id + (r.rebuilt ? "*" : "")));
  assert(!saved.some(r => r.id === "week:2026-09-14"), "an empty rebuilt week is not saved");
  saved = await p(cb => rs.ensureReports(cb, at("2026-10-12", 7, 0)));
  const rep = saved.find(r => r.id === "week:2026-10-05");
  assert(rep && !rep.rebuilt, "saved at 07:00, not rebuilt (the snapshot existed)");
  eq([rep.facts.study.mins, rep.facts.study.reviews], [60, 20], "its facts");
  eq(rep.facts.prev && rep.facts.prev.mins, 50, "it compares with the saved week before");
  /* the ledger moves; the saved report does not */
  S.sessions.push(focus("2026-10-08", 19, 120));
  saved = await p(cb => rs.ensureReports(cb, at("2026-10-12", 9, 0)));
  eq(saved.length, 0, "nothing is re-saved");
  const again = await p(cb => rs.getReport("week:2026-10-05", cb));
  eq(again.facts.study.mins, 60, "facts are never recomputed");
  await p(cb => rs.setWords("week:2026-10-05", { mode: "kurenai", headline: "A good week.", narrative: "…", status: "idle", writtenAt: 1 }, cb));
  const w = await p(cb => rs.getReport("week:2026-10-05", cb));
  eq([w.words.mode, w.words.headline, w.facts.study.mins], ["kurenai", "A good week.", 60], "only the words changed");
  eq(KOS.reportWords.current(w).byKurenai, true, "Kurenai's words read as Kurenai's");
  const listed = await p(cb => rs.list("week", cb));
  eq(listed.map(r => r.id)[0], "week:2026-10-05", "newest first");
});

(async () => {
  const app = await boot();
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.message)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE69: " + fails + " failure(s)" : "\nSMOKE69: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
