/* Kurenai OS — smoke71.test.js
   Reports, phase 6 (roadmap 5.1, design 24c–24e, 24j, 25e): the month,
   the term and the year.

   The claims:

     A · SAVED WHEN READY. A month is saved on the 1st at 07:00 after it, a
         term the morning after its last week — terms are runs of SCHOOL
         weeks split by two weeks without one, so a personal plan studied
         through Christmas still ends the autumn term — and a year on
         1 September.
     B · THE MONTH'S FACTS. The busiest day, the peak hour's share, the
         plan's totals for its weeks, mastery by unit from the two boundary
         snapshots (units that did not move left out), results dated in it,
         the study persona, and comparisons with the saved month before;
         the template leads with that comparison.
     C · THE TERM'S FACTS. The plan against class a cell a week from the
         braid, weakest and strongest from 20+ reviews only, the strip of
         its saved weeks, and a roll-up of their totals when the session
         history no longer reaches the term's start.
     D · THE YEAR'S FACTS. Its months strip, records with dates, dated
         milestones; seven chapters, each ending ↑ Contents / Next.
     E · THE PAGES. The period switch routes to each list; the month page's
         tiles and chart; a month with one study day is marked, not charted
         (24g); the term page's class cells; the year's chapters and chip;
         a render writes nothing.
     F · THE STORIES. Each period's slides are its saved list, and every
         layout (dna, flow, compare, cards included) draws.
     G · TWO AT ONCE. A morning that saves a week and a month lists both
         on Home.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke71.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }

let seq = 1;
function at(date, hh, mm) { const [y, m, d] = date.split("-").map(Number); return new Date(y, m - 1, d, hh, mm || 0).getTime(); }
function focus(date, endH, mins, sid, refs) {
  return { id: seq++, ts: at(date, endH), date, type: "focus", subject: sid || "compsci", ref: null, refs: refs || ["compsci:4.1.1.1"],
    dur: mins * 60, metrics: { complete: true, mode: "pomodoro" }, award: { xp: 10 + mins, gold: 3 } };
}
function cards(date, n, again, ref) {
  return { id: seq++, ts: at(date, 12), date, type: "flashcards", subject: "compsci", ref: null, refs: [ref || "compsci:4.1.1.2"],
    metrics: { cards: n, again: again, hard: 0, good: n - again, easy: 0 }, award: { xp: 20, gold: 3 } };
}
function input(extra) { return Object.assign({ ledger: [], rows: [], tally: {}, reminders: [], habits: [], tracker: [], itUnits: [] }, extra); }
const main = (app) => app.document.getElementById("main");
async function show(app, arg) { app.KOS.show("reports", arg); await app.settle(); }
async function put(app, p0, facts) {
  const rep = { id: p0.id, period: p0.period, start: p0.start, end: p0.end, savedAt: app.window.Date.now(), facts,
    words: { mode: "template", headline: null, narrative: null, writtenAt: null, status: "idle" } };
  await p(cb => app.KOS.reportStore.putReport(rep, cb));
  return rep;
}
function snap(app) { const s = JSON.parse(JSON.stringify(app.KOS.store.state)); delete s.ui; return JSON.stringify(s); }

/* ============ A · saved when ready ============ */
step("A · months on the 1st at 07:00, terms by school weeks, years on 1 September", async (app) => {
  const KOS = app.KOS, R = KOS.report, rs = KOS.reportStore;
  const P = KOS.pacing, real = { weeks: P.weeks, isBreak: P.isBreak };
  const wk = (wb, school, personal) => ({ wb, schoolWk: school ? 1 : null, personalWk: personal ? 1 : null });
  const plan = [wk("2026-09-07", 1, 1), wk("2026-09-14", 1, 1), wk("2026-09-21", 1, 1),
    wk("2026-09-28", 0, 1), wk("2026-10-05", 0, 0),          // personal study through a two-week school break
    wk("2026-10-12", 1, 1)];
  P.weeks = () => plan;
  try {
    const ts = R.terms();
    eq(ts.map(t => [t.start, t.end]), [["2026-09-07", "2026-09-27"], ["2026-10-12", "2026-10-18"]], "a term ends at two weeks without school, whatever the personal plan did");
    const S = KOS.store.state;
    S.sessions.length = 0;
    S.sessions.push(focus("2026-09-08", 19, 45), focus("2026-09-16", 19, 60), focus("2026-09-23", 20, 30));
    const early = await p(cb => rs.ensureReports(cb, at("2026-10-01", 6, 59)));
    assert(!early.some(r => r.period === "month"), "September waits for 07:00 on 1 October");
    const saved = early.concat(await p(cb => rs.ensureReports(cb, at("2026-10-01", 7, 0))));
    const m = saved.find(r => r.id === "month:2026-09");
    assert(m && m.facts.study.mins === 135, "September saved with its study (" + (m && m.facts.study.mins) + ")");
    const t = saved.find(r => r.period === "term");
    assert(t && t.id === "term:2026-09-07" && t.facts.study.mins === 135, "the term that ended on 27 September is saved");
    assert(!saved.some(r => r.period === "year"), "no year until 1 September");
    const y = R.year("2027-09-01");
    eq([y.start, y.end, new Date(R.readyAt(R.year("2026-10-01"))).getMonth()], ["2027-09-01", "2028-08-31", 8], "a year is ready on 1 September");
  } finally { P.weeks = real.weeks; P.isBreak = real.isBreak; }
});

/* ============ B · the month ============ */
const SEP = { period: "month", id: "month:2026-09", start: "2026-09-01", end: "2026-09-30" };
step("B · the month's facts and words", async (app) => {
  const R = app.KOS.report, Wd = app.KOS.reportWords;
  const ledger = [focus("2026-09-02", 19, 60), focus("2026-09-03", 19, 30), focus("2026-09-27", 20, 250), focus("2026-09-28", 19, 40),
    cards("2026-09-05", 60, 6)];
  const snapStart = { topics: { "compsci:4.1.1.1": ["a", "started", 40], "compsci:4.1.1.2": ["r", "started", 10], "compsci:4.2.1.1": ["g", "done", 90] } };
  const snapEnd = { topics: { "compsci:4.1.1.1": ["g", "started", 80], "compsci:4.1.1.2": ["a", "started", 30], "compsci:4.2.1.1": ["g", "done", 90] } };
  const tracker = [{ paper: "CS Paper 1", kind: "practice", date: "2026-09-20", marks: 58, max: 75, grade: "A", subject: "compsci" },
    { paper: "Old", kind: "exam", date: "2026-08-20", marks: 10, max: 20 }];
  const f = R.compute(input({ ledger, snapStart, snapEnd, tracker, prev: { mins: 120, recall: 80, days: 2, bySubject: { compsci: 120 } },
    planRows: [{ source: "personal", done: true, wb: "2026-09-07" }, { source: "personal", done: false, wb: "2026-09-14" }] }), SEP);
  eq(f.study.busiest, { date: "2026-09-27", mins: 250 }, "the busiest day");
  assert(f.focus.peakShare > 0 && f.focus.peakShare <= 100 && f.focus.peakHour >= 15 && f.focus.peakHour <= 19, "the peak hour and its share: " + f.focus.peakHour + " " + f.focus.peakShare);
  eq([f.plan.planned, f.plan.ticked, f.plan.carried], [2, 1, 1], "the plan's totals for the month's weeks");
  assert(f.mastery && f.mastery.length === 1 && f.mastery[0].green === 1 && f.mastery[0].ref === "4.1", "mastery: the unit that moved, +1 Green: " + JSON.stringify(f.mastery));
  assert(f.results && f.results.list.length === 1 && f.results.list[0].pct === 77, "results dated in the month only");
  assert(f.studyPersona && f.studyPersona.name, "the study persona");
  assert(f.stories[0] === "intro" && f.stories.indexOf("compare") !== -1 && f.stories[f.stories.length - 1] === "recap", "the month's stories: " + f.stories);
  const w = Wd.template(f);
  assert(/^6h 20m studied, more than double Aug/.test(w.headline), "the month leads with its comparison: " + w.headline);
  assert(/Your busiest day was Sunday 27 September/.test(w.narrative), "the busiest day in the words: " + w.narrative);
  const pay = JSON.stringify(Wd.payload({ facts: f }));
  assert(!/CS Paper 1/.test(pay) && /practice 77% A/.test(pay), "the payload sends a result's kind, mark and grade, never its name: " + pay);
});

/* ============ C · the term ============ */
step("C · the term: class cells, weakest/strongest, the strip, the roll-up", async (app) => {
  const R = app.KOS.report, P = app.KOS.pacing;
  const T = { period: "term", id: "term:2026-09-07", start: "2026-09-07", end: "2026-09-27" };
  const realW = P.weeks, realA = P.alignment;
  P.weeks = () => [{ wb: "2026-09-07", schoolWk: 1, personalWk: 1 }, { wb: "2026-09-14", schoolWk: 2, personalWk: 2 }, { wb: "2026-09-21", schoolWk: 3, personalWk: 3 }];
  P.alignment = (wb, sid) => sid === "compsci" ? { evidence: true, ahead: wb === "2026-09-21" ? 2 : 0, behind: 0 } : sid === "maths" ? { evidence: true, ahead: 0, behind: 1 } : { evidence: false };
  try {
    const ledger = [cards("2026-09-08", 30, 15, "compsci:4.1.1.1"), cards("2026-09-09", 25, 1, "compsci:4.1.1.2"), cards("2026-09-10", 12, 0, "compsci:4.2.1.1"),
      focus("2026-09-15", 19, 60)];
    const weekFacts = (start, mins) => ({ id: "week:" + start, start, study: { mins, bySubject: { compsci: mins }, days: 3, reviews: 100, recall: 90, again: 10 }, focus: { blocks: 4 }, collection: null });
    const parts = [weekFacts("2026-09-07", 600), weekFacts("2026-09-14", 500)];
    const f = R.compute(input({ ledger, parts, weekParts: parts }), T);
    eq(f.vsClass.rows.map(r => [r.sid, r.cells.join(","), r.end.pos, r.end.n]), [["compsci", "aligned,aligned,ahead", "ahead", 2], ["maths", "behind,behind,behind", "behind", 1]], "a cell a week, the end position");
    eq(f.weakest.map(t => t.key), ["compsci:4.1.1.1", "compsci:4.1.1.2"], "weakest/strongest only from topics with 20+ reviews");
    eq(f.strip.map(c => c.f ? c.f.mins : null), [600, 500, null], "the strip of saved weeks");
    assert(!f.rolledUp, "the ledger reaches the start: no roll-up");
    const capped = [];
    for (let i = 0; i < 1950; i++) capped.push({ id: 100000 + i, ts: at("2026-09-25", 9), date: "2026-09-25", type: "todo", metrics: {} });
    const g = R.compute(input({ ledger: capped, parts, weekParts: parts }), T);
    assert(g.rolledUp && g.study.mins === 1100, "a capped ledger rolls the saved weeks up (" + g.study.mins + ")");
  } finally { P.weeks = realW; P.alignment = realA; }
});

/* ============ D · the year ============ */
const YEAR = { period: "year", id: "year:2026", start: "2026-09-01", end: "2027-08-31", label: "2026–27" };
let yearFacts = null;
step("D · the year: months strip, records, milestones", async (app) => {
  const R = app.KOS.report;
  const ledger = [];
  ["2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13", "2026-10-02"].forEach(d => ledger.push(focus(d, 19, 50), cards(d, 300, 30)));
  const monthF = (id, start, mins) => ({ id, start, study: { mins, bySubject: { compsci: mins }, days: 4, reviews: 1200, recall: 90 }, focus: { blocks: 4 }, collection: null });
  const parts = [monthF("month:2026-09", "2026-09-01", 200), monthF("month:2026-10", "2026-10-01", 50)];
  const weekParts = [{ start: "2026-09-07", study: { reviews: 1200, recall: 90 } }, { start: "2026-09-28", study: { reviews: 300, recall: 94 } }];
  yearFacts = R.compute(input({ ledger, parts, weekParts }), YEAR);
  const f = yearFacts;
  eq(f.strip.length, 12, "twelve months");
  eq([f.strip[0].label, f.strip[0].f.mins, f.strip[2].f], ["Sep", 200, null], "the strip reads the saved months");
  eq([f.records.streak.days, f.records.streak.start, f.records.streak.end], [4, "2026-09-10", "2026-09-13"], "the longest streak with its dates");
  eq([f.records.recallWeek.start, f.records.recallWeek.recall], ["2026-09-28", 94], "the best recall week");
  assert(f.milestones && f.milestones[0].what === "First 1,000 reviews this year" && f.milestones[0].date === "2026-09-13", "a dated milestone: " + JSON.stringify(f.milestones));
  assert(f.stories.indexOf("records") !== -1 && f.stories.indexOf("months") === -1, "the year's stories keep what has evidence: " + f.stories);
});

/* ============ E · the pages ============ */
step("E · the period switch, the month, one study day, the term, the year", async (app) => {
  const KOS = app.KOS, R = KOS.report;
  await show(app, { period: "month" });
  assert(/first monthly report arrives on the 1st/.test(main(app).textContent) || main(app).querySelector("[data-ui~='reports.list']"), "the month list");
  const tabs = [...main(app).querySelectorAll(".k-rp-periods [data-ui~='ui.tab']")];
  eq(tabs.map(b => b.textContent), ["Weekly", "Monthly", "Termly", "Yearly"], "the period switch");
  tabs[3].click(); await app.settle();
  assert(app.window.location.hash === "#/reports/year", "the switch routes: " + app.window.location.hash);
  /* a full month */
  const ledger = [focus("2026-09-02", 19, 60), focus("2026-09-09", 19, 30), focus("2026-09-27", 20, 90), cards("2026-09-05", 60, 6)];
  await put(app, SEP, R.compute(input({ ledger, prev: { mins: 60, days: 1, dayAvg: 2, bySubject: { compsci: 60 } } }), SEP));
  let before = snap(app);
  await show(app, { period: "month", start: "2026-09-01" });
  assert(snap(app) === before, "the month page renders without writing");
  const labels = [...main(app).querySelectorAll("[data-ui~='reports.tiles'] [data-ui~='part.label']")].map(n => n.textContent);
  assert(["Studied", "Study days", "Busiest day", "Peak hour", "Recall", "Focus"].every(l => labels.indexOf(l) !== -1), "the month's tiles: " + labels);
  assert(main(app).querySelector(".k-rp-avg-line"), "last month's daily average is dashed across the chart");
  /* one study day */
  const AUG = { period: "month", id: "month:2026-08", start: "2026-08-01", end: "2026-08-31" };
  await put(app, AUG, R.compute(input({ ledger: [focus("2026-08-15", 11, 80)] }), AUG));
  await show(app, { period: "month", start: "2026-08-01" });
  assert(main(app).querySelector("[data-ui~='reports.one-day']") && /One day isn't a pattern/.test(main(app).textContent), "one study day: the day marked, no chart");
  assert(![...main(app).querySelectorAll("[data-ui~='part.label']")].some(n => /Busiest day|Peak hour/.test(n.textContent)), "no busiest day or peak hour from one day");
  /* the year */
  await put(app, YEAR, yearFacts);
  before = snap(app);
  await show(app, { period: "year", start: "2026-09-01" });
  assert(snap(app) === before, "the year renders without writing");
  const ch = main(app).querySelectorAll("[data-ui~='reports.chapter']");
  eq(ch.length, 7, "seven chapters");
  assert(main(app).querySelectorAll("[data-ui~='reports.chapter-next']").length === 6 && main(app).querySelectorAll("[data-ui~='reports.chapter-up']").length === 7, "each ends ↑ Contents, all but the last Next");
  assert(main(app).querySelector("[data-ui~='reports.chapter-bar']"), "the sticky chapter chip is there");
  assert(main(app).querySelector("[data-ui~='reports.year-table']"), "the month-by-month strip");
  main(app).querySelector("[data-ui~='reports.chapter-chip']").click(); await app.settle();
  const dlg = app.document.querySelector("[data-ui~='reports.chapters']");
  assert(dlg && dlg.querySelectorAll("button.k-rp-contents-chip").length === 7, "the chip opens the seven chapters");
  dlg.querySelector("[data-ui~='ui.dialog-close']").click(); await app.settle();
});

/* ============ F · the stories ============ */
step("F · every period's story draws, every layout included", async (app) => {
  const KOS = app.KOS, doc = app.document;
  for (const id of ["month:2026-09", "year:2026"]) {
    const rep = await p(cb => KOS.reportStore.getReport(id, cb));
    const sl = KOS.reportStory.slides(rep);
    eq(sl.map(x => x.id), rep.facts.stories, id + ": the slides are the saved list");
    const h = KOS.reportStory.open(rep, 0);
    for (let i = 0; i < sl.length; i++) {
      doc.querySelectorAll("[data-ui~='reports.story-chip']")[i].click();
      const t = doc.querySelector("[data-ui~='reports.story-title']");
      assert(t && t.textContent.length > 2, id + " story " + sl[i].id + " drew a title");
    }
    h.close(); await app.settle();
  }
  /* the four layouts the week never uses */
  const f = KOS.report.compute(input({ ledger: [focus("2026-09-02", 19, 60, "maths", ["maths:3.3"]), cards("2026-09-02", 60, 6), focus("2026-09-02", 21, 30, "compsci"), cards("2026-09-03", 40, 4),
    focus("2026-09-03", 22, 30, "maths", ["maths:3.3"]), focus("2026-09-03", 23, 20, "compsci")], prev: { mins: 30, days: 1, titles: 2 } }), SEP);
  f.stories = ["intro", "compare", "flow", "next", "recap"];
  f.study.flow = f.study.flow || [{ from: "maths", to: "cards", n: 2 }, { from: "cards", to: "compsci", n: 2 }];
  f.study.next = [{ key: "compsci:4.1.1.2", sid: "compsci", ref: "4.1.1.2", title: "x", recall: 50 }];
  f.collection = { count: 3, byModule: { anime: 3 }, genres: [{ name: "Drama", n: 2, pct: 66 }, { name: "Comedy", n: 1, pct: 33 }, { name: "Action", n: 1, pct: 33 }], tags: [], titles: [], status: {}, units: {}, countries: [], formats: [] };
  f.stories.splice(3, 0, "dna");
  const rep = await put(app, { period: "month", id: "month:2026-11", start: "2026-11-01", end: "2026-11-30" }, f);
  const sl = KOS.reportStory.slides(rep);
  eq(sl.map(x => x.t), ["intro", "compare", "flow", "dna", "cards", "summary"], "compare, flow, dna and cards are drawn from facts");
  const h = KOS.reportStory.open(rep, 1);
  ["k-rp-st-compare", "k-rp-st-flow", "k-rp-st-dna", "k-rp-st-cards"].forEach((cls, i) => {
    doc.querySelectorAll("[data-ui~='reports.story-chip']")[i + 1].click();
    assert(doc.querySelector("." + cls), cls + " draws");
  });
  h.close(); await app.settle();
});

/* ============ G · two at once ============ */
step("G · a week and a month on one morning are both on Home", async (app) => {
  const KOS = app.KOS, R = KOS.report;
  const W1 = { period: "week", id: "week:2026-09-14", start: "2026-09-14", end: "2026-09-20" };
  await put(app, W1, R.compute(input({ ledger: [focus("2026-09-15", 19, 30)] }), W1));
  KOS.show("home"); await app.settle();
  const card = main(app).querySelector("[data-ui~='reports.home-card']");
  assert(card && /Ready this morning/.test(card.textContent), "Ready this morning");
  assert(card.querySelectorAll("[data-ui~='reports.home-open']").length >= 2, "a row each");
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
  console.log(fails ? "\nSMOKE71: " + fails + " failure(s)" : "\nSMOKE71: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
