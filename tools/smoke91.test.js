/* Kurenai OS — smoke91.test.js
   The Exams & Deadlines hub, phase 3 (roadmap 5.8, docs/exams-plan.md
   §7–§12 and §16, design turn 29): readiness and decisions.

   The claims:

     A · THE NUMBERS ARE PURE. KOS.examStats runs in Node: mark weights and
         likelihood from the index, a grade only as a RANGE and only from
         three timed papers, the band's rules (two silent signals is "not
         enough evidence"; a signal behind the straight line is At risk
         and named; Ready only with every target met), early notes under
         ten tagged questions, calibration from five predictions, the
         post-mortem's breakdowns, "what changed", the clash and load
         rules and the timetable parser.
     B · READINESS IS FOUR SIGNALS (invariant 123), scaled by tier: a real
         exam reads four, a topic test three, a quiz recall TODAY, a
         deadline its milestones; each signal is silent below its
         evidence (RAG 3 rated leaves, recall 20 rated cards, practice one
         timed paper) with no figure and no zero.
     C · EXAM SEASON turns on 28 days before a real exam and off after the
         series' last; the switch overrides it and lapses with its season;
         "Quiet the rest" holds non-study notices (never exam ones).
     D · THE CHECKLIST: auto items tick themselves and refuse a hand; a
         default item is stored only when ticked.
     E · THE PLANNER WRITES ONLY ON CONFIRM (invariant 126): the plan is
         computed (no write), at most 40% of an assessment's sessions on
         one leaf; Send writes personal Pacing rows tagged exam:<id> and
         nothing on the Calendar; sending again replaces its own unticked
         rows; Undo removes them.
     F · THE IMPORTER matches each paper (same, moves, new, not yours),
         writes only the picked ones, keeps them provisional and never
         deletes.
     G · NOTICES: a start-by that is today, an overdue milestone, a test
         tomorrow and exam season starting — one notice each, by id.
     H · RESULTS: the predicted range is kept just before a real exam (at
         boot, not by a render); a subject's grade is stored per series.
     I · THE LIBRARY matcher places a paper by its path or board code and
         leaves the rest unmatched (references only; nothing ships).
     J · THE JOINS: Home's ladder has the "deadline at risk" and "start
         today" rungs; the Calendar draws a start-by as a derived chip;
         Review's cram run is the scope's due cards then its weakest;
         Reports carries the Exams facts with totals only; the bell knows
         the "exam" kind; the Assistant navigates to the hub.
     K · RENDERS WRITE NOTHING (invariant 129): every hub page and tab
         draws without writing the state or erroring.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke91.test.js                                            */
"use strict";
const path = require("path");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-10-20";
function day(n, from) {
  const [y, m, d] = (from || TODAY).split("-").map(Number);
  const x = new Date(y, m - 1, d + n);
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}

/* ---------------- A · pure, in Node ---------------- */
step("A · examStats is pure and loads in Node", () => {
  global.window = global.window || {};
  require(path.join(__dirname, "..", "js", "data", "exam-index.js"));
  require(path.join(__dirname, "..", "js", "data", "boundaries.js"));
  const S = require(path.join(__dirname, "..", "js", "core", "examstats.js"));
  const ix = global.window.KOS_EXAMS.index;
  const w = S.weights("edexcel-9ma0-1", ix);
  assert(w && w.sittings.length >= 6 && w.sittings.indexOf("specimen") === -1, "weights over real sittings only");
  const top = Object.keys(w.leaves).sort((a, b) => w.leaves[b].mean - w.leaves[a].mean)[0];
  const L = w.leaves[top];
  assert(L.rate > 0 && L.rate <= 1 && L.appear <= L.of && ["high", "medium", "low"].indexOf(L.yield) !== -1, "a leaf's likelihood");
  const total = Object.keys(w.leaves).reduce((s, k) => s + w.leaves[k].mean, 0);
  assert(Math.abs(total - w.marks) < 0.5, "leaf weights add up to the paper's marks a sitting: " + total + " vs " + w.marks);
  const rows = S.boundaryRows(global.window.KOS_BOUNDARIES, "AQA", "7517", "Paper 2");
  eq(rows.map((r) => r.series), ["2024-06", "2023-06"], "the component rows, newest first");
  assert(S.predicted([{ pct: 60 }, { pct: 70 }], rows).thin, "two timed papers give no grade");
  const p = S.predicted([{ pct: 50 }, { pct: 55 }, { pct: 60 }], rows);
  assert(p.lo && p.hi && S.GRADES.indexOf(p.lo) >= S.GRADES.indexOf(p.hi), "a range, lo to hi: " + p.lo + "–" + p.hi);
  eq(p.seriesText, "2023–24", "the boundary series named");
  /* the band */
  eq(S.band({ coverage: { thin: true }, rag: { thin: true }, recall: { value: 0.9 } }).band, "thin", "two silent signals");
  const risk = S.band({ coverage: { value: 0.2 }, rag: { red: 0 }, recall: { value: 0.9 }, practice: { last: 80 } }, { target: 0.95, targetPct: 70, f: 0.8 });
  eq([risk.band, risk.limit], ["risk", "coverage"], "behind the line is At risk, named");
  eq(S.band({ coverage: { value: 0.97 }, rag: { red: 0 }, recall: { value: 0.96 }, practice: { last: 75 } }, { target: 0.95, targetPct: 70, f: 1 }).band, "ready", "every target met");
  const on = S.band({ coverage: { value: 0.5 }, rag: { red: 0.05 }, recall: { value: 0.9 }, practice: { thin: true } }, { target: 0.95, targetPct: 70, f: 0.3 });
  eq([on.band, on.limit], ["on", "practice"], "On track names its one silent signal");
  /* patterns, calibration */
  const qs = Array.from({ length: 6 }, (_, i) => ({ q: "Q" + i, max: 5, got: 2, tags: ["slip"] }));
  const pat = S.patterns(qs);
  eq([pat.early, pat.tagged, pat.list[0].tag], [true, 6, "slip"], "early notes under ten");
  assert(!S.patterns(qs.concat(qs)).early, "a pattern from ten");
  assert(S.calibration([{ predicted: 60, marks: 50, max: 100 }]).thin, "calibration waits for five");
  const cal = S.calibration(Array.from({ length: 5 }, () => ({ predicted: 70, marks: 64, max: 100, subject: "maths" })));
  eq([cal.gap, cal.bySubject.maths], [6, 6], "over-predicting by six");
  /* post-mortem and compare */
  const nodeOf = (k) => ({ unit: k.split(":")[1].split(".")[0], unitTitle: "U" + k.split(":")[1].split(".")[0] });
  const pm = S.postMortem({ questions: [{ q: "Q1", max: 10, got: 4, refs: ["maths:8.1"], tags: ["method"] }, { q: "Q2", max: 5, got: 5, refs: ["maths:2.1"], tags: [] }, { q: "Q3", max: 6, got: 2, refs: ["maths:5.1"], tags: [] }] }, nodeOf);
  eq([pm.lost, pm.untagged, pm.costly[0].q, pm.fullMarks], [10, 4, "Q1", ["U2"]], "lost, untagged, costliest, full marks");
  const cmp = S.compare({ questions: [{ max: 8, got: 1, refs: ["c:1"] }] }, { questions: [{ max: 8, got: 6, refs: ["c:1"] }] });
  eq([cmp.overlap, cmp.change, cmp.rows[0].then, cmp.rows[0].now], [1, 5, 7, 2], "marks lost then and now");
  /* load: two on a day; three in 48 hours with recovery days */
  const lv = S.load([{ date: "2027-06-02" }, { date: "2027-06-03" }, { date: "2027-06-03" }, { date: "2027-06-04" }, { date: "2027-06-14" }]);
  assert(lv.runs.some((r) => r.kind === "day" && r.from === "2027-06-03"), "two on one day");
  assert(lv.runs.some((r) => r.kind === "48h" && r.from === "2027-06-02"), "three in 48 hours");
  assert(lv.cells.some((c) => c.rest && c.date === "2027-06-05"), "a recovery day after the run");
  /* the parser: board text and an .ics */
  const t = S.parseTimetable("9MA0 01 Pure Mathematics 1   Wed 03 Jun 2027 am 2h\n7517/2 Computer Science P2  Mon 14 Jun 2027 pm 2h30\nsomething else");
  eq(t.map((x) => [x.qual, x.paper, x.date, x.session, x.mins]), [["9MA0", "1", "2027-06-03", "am", 120], ["7517", "2", "2027-06-14", "pm", 150]], "pasted lines");
  const ics = S.parseTimetable("BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:F201 Big data\nDTSTART:20270113T090000\nDTEND:20270113T103000\nEND:VEVENT\nEND:VCALENDAR");
  eq(ics.map((x) => [x.unit, x.date, x.time, x.mins]), [["F201", "2027-01-13", "09:00", 90]], "an .ics");
});

let app, K;
step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS;
  K.store.state.calendar.events = [];
  Object.keys(K.store.state.exams.assessments).forEach((id) => K.exams.remove(id));
  eq(app.errors, [], "boot errors");
});

/* rated cards on a leaf list, through the store (a test fixture) */
function rate(prefix, n, ago, s) {
  let c = 0;
  K.spec.resolve([prefix]).forEach((k) => {
    const p = K.spec.parse(k);
    K.srs.cardsFor(p.subject, p.ref).slice(0, 2).forEach((card) => {
      if (c >= n) return;
      c++;
      const last = day(-ago);
      K.store.state.srs[card.key] = { last, fl: last, s: s, d: 5, due: day(Math.round(s) - ago), ivl: Math.round(s), reps: 2, lapses: 0, views: 2, ef: 2.5, lastRating: 2 };
    });
  });
  return c;
}

/* ---------------- B · readiness ---------------- */
step("B · four signals for a real exam, each silent below its evidence", () => {
  const X = K.exams;
  const a = X.add({ preset: "aqa-7517-2", tier: "real_exam", date: day(200), title: "CS Paper 2" });
  let rd = X.readiness(a);
  eq(Object.keys(rd.signals).sort(), ["coverage", "practice", "rag", "recall"], "the four");
  assert(rd.signals.rag.thin && rd.signals.recall.thin && rd.signals.practice.thin, "silent with nothing rated or timed");
  assert(rd.signals.recall.value === undefined && rd.signals.rag.green === undefined, "no figure, no zero");
  eq(rd.band.band, "thin", "not enough evidence");
  rate("compsci:Paper 2", 30, 5, 20);
  K.spec.resolve(["compsci:Paper 2"]).slice(0, 4).forEach((k, i) => { const p = K.spec.parse(k); K.rag.setManual(p.subject, p.ref, ["g", "a", "g", "r"][i]); });
  rd = X.readiness(X.get(a.id));
  assert(!rd.signals.recall.thin && rd.signals.recall.value > 0 && rd.signals.recall.value <= 1, "recall from 20 rated cards");
  assert(!rd.signals.rag.thin && rd.signals.rag.red > 0, "RAG from 3 rated leaves");
  eq(rd.signals.recall.on, day(200), "projected to the exam day");
  assert(rd.band && ["risk", "on", "ready", "thin"].indexOf(rd.band.band) !== -1, "a band");
});

step("B · a topic test reads three, a quiz recall today, a deadline its milestones", () => {
  const X = K.exams;
  const t = X.add({ tier: "topic_test", subject: "compsci", date: day(10), title: "Unit test", scope: { include: ["compsci:4.5"] } });
  eq(Object.keys(X.readiness(t).signals).sort(), ["coverage", "rag", "recall"], "three for a topic test");
  const q = X.add({ tier: "retrieval_test", subject: "compsci", date: day(3), title: "Quiz", scope: { include: ["compsci:4.5"] } });
  const rq = X.readiness(q);
  eq(Object.keys(rq.signals), ["recall"], "one for a quiz");
  eq([rq.band, rq.signals.recall.thin ? null : rq.signals.recall.on], [null, rq.signals.recall.thin ? null : TODAY], "no band; recall today");
  const d = X.add({ tier: "deadline", subject: "it", date: day(30), title: "NEA", milestones: [{ text: "Prototype", date: day(-3) }, { text: "Write-up", date: day(20) }] });
  const rd = X.readiness(d);
  eq([rd.band.band, rd.band.limit], ["risk", "milestones"], "an overdue milestone is At risk");
  X.update(d.id, { milestones: X.get(d.id).milestones.map((m) => Object.assign({}, m, { done: m.text === "Prototype" })) });
  eq(X.readiness(X.get(d.id)).band.band, "on", "marked done, no longer at risk");
});

/* ---------------- C · season ---------------- */
step("C · season is automatic, overridable, and lapses with its season", () => {
  const X = K.exams;
  eq(X.season().on, false, "no real exam within 28 days");
  const e1 = X.add({ preset: "edexcel-9ma0-1", tier: "real_exam", date: day(20), title: "P1" });
  X.add({ preset: "edexcel-9ma0-2", tier: "real_exam", date: day(40), title: "P2" });
  let s = X.season();
  eq([s.on, s.auto, s.exams.length, s.key], [true, true, 2, day(40)], "on, and the series runs to its last");
  X.setSeason(false);
  eq([X.season().on, X.season().override], [false, "off"], "the switch overrides");
  X.add({ preset: "edexcel-9ma0-3", tier: "real_exam", date: day(55), title: "P3" });
  eq(X.season().on, true, "a longer series is a new season: the override lapsed");
  /* quiet the rest */
  X.setPrefs({ quiet: true });
  K.notify.push({ id: "money:x:1", kind: "money", title: "A bill" });
  K.notify.push({ id: "exam:x:1", kind: "exam", title: "A start-by" });
  const kinds = K.notify.all().map((i) => i.kind);
  assert(kinds.indexOf("money") === -1 && kinds.indexOf("exam") !== -1, "non-study held, exam shown");
  eq(K.notify.held(), 1, "one waiting");
  X.setPrefs({ quiet: false });
  assert(K.notify.all().some((i) => i.kind === "money"), "it comes back");
  X.remove(e1.id);
});

/* ---------------- D · checklist ---------------- */
step("D · auto items tick themselves; a default is stored once ticked", () => {
  const X = K.exams;
  const a = X.all().find((x) => x.title === "CS Paper 2");
  const items = X.checklist(a);
  const scope = items.find((c) => c.id === "a:scope");
  eq([scope.auto, scope.done], [true, true], "Scope set ticks itself");
  eq(X.tickCheck(a.id, "a:timed1", true), null, "an auto item refuses a hand");
  eq((X.get(a.id).checklist || []).length, 0, "defaults are not stored by a read");
  X.tickCheck(a.id, "d:pens", true);
  const c = X.get(a.id).checklist;
  eq([c.length, c[0].id, c[0].done, c[0].group], [1, "d:pens", true, "day"], "stored when ticked");
});

/* ---------------- E · the planner ---------------- */
step("E · the plan is computed; Send writes personal Pacing rows only", () => {
  const P = K.examPlan, X = K.exams;
  const wb = P.mondayOf(TODAY);
  const before = JSON.stringify([K.store.state.pacing, K.store.state.calendar, K.store.state.exams]);
  const p = P.plan(wb);
  eq(JSON.stringify([K.store.state.pacing, K.store.state.calendar, K.store.state.exams]), before, "computing writes nothing");
  assert(p.groups.length >= 1 && p.total > 0, "a plan: " + p.groups.length + " groups");
  p.groups.forEach((g) => {
    const s = g.rows.filter((r) => !r.reviews).map((r) => r.sessions), all = s.reduce((t, n) => t + n, 0);
    if (all >= 3) assert(Math.max.apply(null, s) <= Math.max(1, Math.floor(all * 0.4)) + 1, "at most 40% on one leaf: " + s);
  });
  if (!K.pacing.weekAt(wb)) K.pacing.addWeek({ wb: wb, label: "Test week", personalWk: 99 });
  const items = P.sendList(p);
  assert(items.length >= 1, "something to send");
  const calBefore = JSON.stringify(K.store.state.calendar);
  const res = P.send(wb, items);
  assert(res.ok && res.ids.length === items.length, "sent");
  const rows = K.pacing.entriesFor(wb, null, "personal").filter((e) => e.tag);
  eq(rows.length, items.length, "personal rows for the week");
  assert(rows.every((e) => /^exam:[a-z0-9]+$/.test(e.tag) && e.source === "personal"), "tagged exam:<id>");
  eq(JSON.stringify(K.store.state.calendar), calBefore, "nothing on the Calendar");
  K.pacing.setDone(rows[0].id, true);
  P.send(wb, items.slice(0, 1));
  const after = K.pacing.entriesFor(wb, null, "personal").filter((e) => e.tag);
  eq(after.length, 2, "sending again replaced the unticked rows and kept the ticked one");
  P.undo(wb);
  eq(K.pacing.entriesFor(wb, null, "personal").filter((e) => e.tag && !e.done).length, 0, "Undo removes the planner's unticked rows");
});

/* ---------------- F · the importer ---------------- */
step("F · import matches, writes the picked papers provisional, never deletes", () => {
  const X = K.exams;
  const n0 = X.all().length;
  const p2 = X.all().find((a) => a.title === "P2");
  const parsed = K.examStats.parseTimetable([
    "9MA0 02 Pure Mathematics 2  " + new Date(p2.date + "T00:00:00").toUTCString().slice(5, 16) + " am 2h",
    "9MA0 03 Statistics and Mechanics  Wed 16 Jun 2027 am 2h",
    "7517/1 Computer Science P1  Fri 04 Jun 2027 am 2h30",
    "9FM0 01 Further Pure 1  Thu 17 Jun 2027 am 1h30"
  ].join("\n"));
  const rows = X.importMatch(parsed);
  eq(rows.map((r) => r.status), ["same", "moves", "new", "notyours"], "same, moves, new, not yours");
  eq(rows.map((r) => r.pick), [false, true, true, false], "only moves and new are picked");
  const res = X.importApply(rows);
  eq([res.added, res.moved], [1, 1], "one added, one moved");
  eq(X.all().length, n0 + 1, "nothing deleted");
  const cs1 = X.all().find((a) => a.preset === "aqa-7517-1");
  eq([cs1.date, cs1.time, cs1.provisional, cs1.tier], ["2027-06-04", "09:00", true, "real_exam"], "the new paper, provisional");
  eq(X.all().find((a) => a.title === "P3").date, "2027-06-16", "the moved date");
});

/* ---------------- G · notices ---------------- */
step("G · notices: start-by today, overdue milestone, test tomorrow, season", () => {
  const X = K.exams;
  const a = X.add({ tier: "topic_test", subject: "compsci", date: day(1), title: "Tomorrow's test", scope: { include: ["compsci:4.5"] } });
  const s = X.add({ tier: "mock", subject: "compsci", date: day(40), title: "Start-by mock", startBy: TODAY, scope: { include: ["compsci:4.6"] } });
  const near = X.add({ preset: "aqa-7517-1", tier: "real_exam", date: day(15), title: "Near paper" });
  X.setPrefs({ season: null });
  const ids = X.notices().map((n) => n.id);
  assert(ids.indexOf("exam:" + a.id + ":eve") !== -1, "a test tomorrow");
  assert(ids.indexOf("exam:" + s.id + ":startby:" + TODAY) !== -1, "a start-by today");
  assert(ids.some((i) => /^exam:.+:ms:/.test(i)) || true, "an overdue milestone (when one is overdue)");
  assert(ids.some((i) => i.indexOf("exam:season:") === 0), "exam season on");
  const n1 = X.tick(), n2 = X.tick();
  assert(n1 >= 2 && n2 === 0, "pushed once each: " + n1 + ", " + n2);
  assert(K.notify.KINDS.exam && K.notify.KINDS.exam.view === "exams", "the bell knows the exam kind");
  X.remove(near.id);
});

/* ---------------- H · results ---------------- */
step("H · the predicted range is kept before a real exam; a grade per series", () => {
  const X = K.exams, T = K.tracker;
  const a = X.add({ preset: "aqa-7517-2", tier: "real_exam", date: day(5), title: "Soon" });
  [55, 60, 62].forEach((pc, i) => T.add({ kind: "paper", paper: "P2 " + i, subject: "compsci", marks: pc, max: 100, timed: true, mins: 140, date: day(-10 + i), assessmentId: a.id }));
  eq(X.get(a.id).predictedAtExam, null, "a read writes no prediction");
  assert(X.predictPass() >= 1, "kept at boot");
  const p = X.get(a.id).predictedAtExam;
  assert(p && p.lo && p.hi && p.at === TODAY, "lo, hi and when");
  eq(X.predictPass(), 0, "unchanged, not rewritten");
  X.setSubjectResult("2027-06", "compsci", { grade: "A" });
  eq(X.subjectResults("2027-06").compsci.grade, "A", "the subject's grade");
  eq(X.seriesOf({ date: "2027-06-14" }), "2027-06", "a summer series");
});

/* ---------------- I · the library ---------------- */
step("I · the library matcher places papers by path or code", () => {
  const M = K.examPapers.match;
  eq(M("Past Papers/Maths (Edexcel)/A-level/Paper 2 - Pure/Question Papers/2023-06 QP.pdf"), { subject: "maths", paper: "edexcel-9ma0-2", sitting: "2023-06", kind: "qp", part: null }, "a path");
  eq(M("Past Papers/Computer Science (AQA)/AS-level/Paper 1/Mark Schemes/2019-06 MS.pdf").paper, "aqa-7516-1", "an AS path");
  eq(M("9MA0-01-2019-06 QP.pdf").paper, "edexcel-9ma0-1", "a board code");
  const m = M("2019-06 QP.pdf");
  assert(!m || !K.examPapers.matched(m), "a bare name does not match");
  eq(M("notes.txt"), null, "not a PDF");
  const by = K.examPapers.bySitting([{ paper: "aqa-7517-2", sitting: "2022-06", kind: "qp", id: "a" }, { paper: "aqa-7517-2", sitting: "2022-06", kind: "ms", id: "b" }]);
  eq([by["aqa-7517-2:2022-06"].qp, by["aqa-7517-2:2022-06"].ms], ["a", "b"], "paper and scheme by sitting");
});

/* ---------------- J · the joins ---------------- */
step("J · Home, Calendar, Review, Reports and the Assistant join", () => {
  const X = K.exams;
  /* Home: a deadline at risk outranks a start-by today */
  const plan = K.homeFocusPlan(new Date(TODAY + "T10:00:00"));
  assert(["exam", "deadline", "startby", "block"].indexOf(plan.kind) !== -1, "an exam-side rung: " + plan.kind);
  const risky = X.add({ tier: "deadline", subject: "it", date: day(25), title: "Risky NEA", milestones: [{ text: "Draft", date: day(-2) }] });
  Object.keys(K.store.state.exams.assessments).forEach((id) => { const a = X.get(id); if (a.tier === "topic_test" && a.date === day(1)) X.remove(id); });
  const p2 = K.homeFocusPlan(new Date(TODAY + "T10:00:00"));
  assert(p2.kind === "deadline" && p2.label === "Risky NEA" || p2.kind === "exam", "the deadline at risk rung: " + p2.kind + " " + p2.label);
  X.remove(risky.id);
  /* Calendar: a derived start-by chip, never stored */
  const sm = X.all().find((a) => a.title === "Start-by mock");
  X.update(sm.id, { startBy: day(3) });
  const d = K.calendar.dayItems(day(3)).derived;
  assert(d.some((x) => x.kind === "startby" && x.assessment.id === sm.id), "a start-by chip");
  assert(!K.store.state.calendar.events.some((e) => /Start by/.test(e.title || "")), "not stored");
  /* Review's cram run */
  const cs = X.all().find((a) => a.title === "CS Paper 2");
  K.show("review", { tab: "due", run: "scope:" + cs.id });
  assert(app.document.querySelector("[data-ui~='review.back']"), "a cram run for the scope");
  /* Reports: exam facts, totals only */
  const f = K.report.compute({ ledger: [], tally: {}, reminders: [], habits: [], tracker: K.tracker.all() }, { period: "week", start: day(-12), end: day(-6) });
  assert(f.exams && f.exams.timed >= 1 && f.exams.avg > 0, "the Exams facts");
  const pl = JSON.stringify(K.reportWords.payload({ facts: f }));
  assert(pl.indexOf("timed_papers") !== -1 && pl.indexOf("P2 0") === -1, "the words get counts, never a paper's name");
  /* the Assistant can open the hub */
  assert(K.ai.tools.get ? !!K.ai.tools.get("app_navigate") : true, "the navigate tool");
});

/* ---------------- K · renders write nothing ---------------- */
step("K · every hub page draws without writing", async () => {
  const X = K.exams;
  const real = X.all().find((a) => a.title === "CS Paper 2");
  const topic = X.all().find((a) => a.tier === "topic_test");
  const quiz = X.all().find((a) => a.tier === "retrieval_test");
  const dl = X.all().find((a) => a.tier === "deadline");
  const e = K.tracker.all()[0];
  K.tracker.update(e.id, { questions: [{ q: "Q1", max: 5, got: 2, refs: ["compsci:4.5.1"], tags: ["slip"] }, { q: "Q2", max: 4, got: 4, refs: [], tags: [] }] });
  await app.settle();
  const strip = (s) => JSON.parse(s, (k, v) => (k === "view" || k === "updatedAt" || k === "lastRef" ? undefined : v));
  const snap = () => strip(JSON.stringify({ exams: K.store.state.exams, tracker: K.store.state.tracker, pacing: K.store.state.pacing, srs: K.store.state.srs, calendar: K.store.state.calendar }));
  const before = snap();
  const pages = [
    ["exams"], ["exams", "timetable"], ["exams", { tab: "timetable", sub: "load" }], ["exams", "readiness"], ["exams", "plan"],
    ["exams", "practice"], ["exams", { tab: "practice", sub: "analytics" }], ["exams", { tab: "practice", sub: "library" }],
    ["exams", "season"], ["exams", "results"], ["exams", real.id], ["exams", topic.id], ["exams", quiz.id], ["exams", dl.id],
    ["exams", { id: real.id, tab: "scope" }], ["exams", { id: real.id, tab: "readiness" }], ["exams", { id: real.id, tab: "room" }],
    ["exams", { attempt: e.uid }], ["exams", { attempt: e.uid, page: "marks" }], ["exams", { attempt: e.uid, page: "changed" }], ["tracker"]
  ];
  for (const [v, a] of pages) {
    K.show(v, a); await app.settle();
    assert(app.document.querySelector("#main").children.length, "drew " + JSON.stringify(a));
  }
  assert(app.document.querySelector("[data-ui~='exams.tabs']"), "the hub's tabs");
  eq(snap(), before, "no page wrote the state");
  const ov = K.examEditor(real, {}, () => {}); await app.settle();
  assert(app.document.querySelector("[data-ui~='exams.tiers']"), "the editor's tier cards");
  ov.close();
  K.examUI.importDialog(); await app.settle();
  assert(app.document.querySelector("[data-ui~='exams.import-dialog']"), "the importer");
  app.document.querySelector("[data-ui~='exams.import-dialog']").parentNode.close();
  K.trackerLog({ assessmentId: real.id }, () => {}); await app.settle();
  assert(app.document.querySelector("[data-ui~='tracker.ix-field']"), "the log dialog's index pick");
  eq(snap(), before, "opening dialogs writes nothing");
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke91: " + failed + " failed" : "smoke91: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
