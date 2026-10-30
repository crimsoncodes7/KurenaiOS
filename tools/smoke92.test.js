/* Kurenai OS — smoke92.test.js
   The Exams & Deadlines hub, phase 4 (roadmap 5.8, docs/exams-plan.md §14,
   frame 29v and 29c's last step): goals linked to an exam.

   The claims:

     A · FIVE TYPES in the Study domain (grade or score, projected recall,
         topics green or covered, papers done, checklist), each linked by
         `links.examId`, which the goal's gate keeps (and drops when junk).
     B · THE DEADLINE FOLLOWS THE EXAM: read live from the assessment, so
         moving the exam moves the goal; an earlier "By" wins.
     C · PROGRESS READS ITS SOURCE (invariant 128): papers done counts the
         exam's timed, marked attempts since the goal began; a grade goal
         reads the result once logged (and is judged then, not on the
         exam's date), or the best timed paper, against a % or a grade's
         cut from the boundaries.
     D · RECALL IS HELD ON THE DATE: projected recall at or above the
         target before the date is still open; on the date it is met or
         missed; its straight line starts at the figure at creation.
     E · TOPICS count the scope's Green leaves, or the covered ones, or
         all of the scope.
     F · THE CHECKLIST goal reads the checklist; app-checked rules (every
         topic Green, N mocks sat, recall ≥ x) tick themselves and refuse a
         hand.
     G · TEMPLATES by tier (29c): a real exam or mock offers all five, a
         topic test four, a quiz recall only, a deadline none; only ticked
         rows are made, linked and ending on the date; the pre-exam
         checklist brings its standard items once.
     H · DELETING AN EXAM UNLINKS ITS GOALS and never deletes one: kept,
         marked removed, measured as nothing, no pace and no notices,
         archived at the next judgement (a later day's tick); linking it
         to another exam picks it up again.
     I · ZERO GOVERNOR TRAFFIC (invariant 129): no goal op logs a session
         or moves XP, gold or HP; a met goal records one activity-only
         receipt.
     J · THE ASSISTANT READS THE HUB (plan §15): exams_overview lists what
         is ahead with its band, exam_detail the four signals apart and
         the linked goals, exam_attempts the marks — read tools, no notes.
     K · RENDERS WRITE NOTHING: Goals, a goal's page, an assessment with
         its Goals card, the templates dialog and the editor draw without
         writing, and with no errors.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke92.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function diff(a, b, at, out) {
  out = out || [];
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  if (a && b && typeof a === "object" && typeof b === "object") {
    Object.keys(Object.assign({}, a, b)).forEach((k) => diff(a[k], b[k], (at ? at + "." : "") + k, out));
  } else out.push(at + ": " + JSON.stringify(a) + " → " + JSON.stringify(b));
  return out;
}
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-10-20";
function day(n, from) {
  const [y, m, d] = (from || TODAY).split("-").map(Number);
  const x = new Date(y, m - 1, d + n);
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}

let app, K, G, X;
function rows() { let out = null; G.compute((e, r) => { out = r; }); return out; }
function row(id) { return rows().find((r) => r.id === id); }
function gov() { const g = K.store.state.governor || {}; return JSON.stringify([g.xp, g.gold, g.hp, (K.store.state.sessions || []).length]); }
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

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; G = K.goals; X = K.exams;
  K.store.state.calendar.events = [];
  Object.keys(K.store.state.exams.assessments).forEach((id) => X.remove(id));
  K.store.state.goals = { v: 3, nextId: 1, items: [], completionLedger: {} };
  eq(app.errors, [], "boot errors");
});

let real, govBefore;
step("A · five exam types in Study, linked by examId", () => {
  const ids = G.types({ domain: "study" }).filter((t) => t.exam).map((t) => t.id);
  eq(ids, ["exam_grade", "exam_recall", "exam_topics_green", "exam_papers_done", "exam_checklist"], "the five");
  eq(K.goalsExams.TYPES, ids, "the same list");
  eq(G.normalise({ type: "exam_recall", links: { examId: "ab12cd" } }).links.examId, "ab12cd", "kept");
  eq(G.normalise({ type: "exam_recall", links: { examId: "<b>" } }).links.examId, undefined, "junk dropped");
  real = X.add({ preset: "aqa-7517-2", tier: "real_exam", date: day(200), title: "CS Paper 2" });
  govBefore = gov();
});

let papers;
step("B · the deadline follows the exam; an earlier By wins", () => {
  papers = G.add({ type: "exam_papers_done", title: "4 papers", target: 4, links: { examId: real.id, subject: "compsci" }, deadline: real.date });
  eq(row(papers.id).deadline, day(200), "the exam's date");
  X.update(real.id, { date: day(210) });
  eq(row(papers.id).deadline, day(210), "moved with the exam");
  const by = G.add({ type: "exam_papers_done", title: "2 by Easter", target: 2, links: { examId: real.id }, params: { by: day(150) }, deadline: day(150) });
  eq(row(by.id).deadline, day(150), "an earlier By");
  G.update(by.id, { params: { by: day(400) } });
  eq(row(by.id).deadline, day(210), "a By after the exam is ignored");
  G.remove(by.id);
});

step("C · papers and grade goals read the exam's attempts and boundaries", () => {
  const T = K.tracker;
  T.add({ kind: "paper", paper: "June 2023", subject: "compsci", marks: 60, max: 100, timed: true, mins: 150, date: day(-1), assessmentId: real.id });
  T.add({ kind: "paper", paper: "untimed", subject: "compsci", marks: 40, max: 100, timed: false, date: TODAY, assessmentId: real.id });
  T.add({ kind: "paper", paper: "June 2022", subject: "compsci", marks: 72, max: 100, timed: true, mins: 150, date: TODAY, assessmentId: real.id });
  let r = row(papers.id);
  eq([r._current, r._target], [1, 4], "timed and marked, since the goal began (yesterday's is before it)");
  assert(["early", "on-track", "ahead", "behind"].indexOf(r._pace) !== -1 || r._pace === null, "a pace from the engine");
  const res = G.add({ type: "exam_grade", title: "≥ 70%", target: 70, links: { examId: real.id }, params: { basis: "result" }, deadline: real.date });
  r = row(res.id);
  eq([r._current, r._status, r._pace], [null, "active", null], "the result is not in yet: open, no pace");
  const best = G.add({ type: "exam_grade", title: "best ≥ 70", target: 70, links: { examId: real.id }, params: { basis: "best" }, deadline: real.date });
  eq([row(best.id)._current, row(best.id)._status], [72, "completed"], "the best timed paper met it");
  const cut = K.goalsExams.gradeCut(X.get(real.id), "A");
  assert(cut > 0 && cut < 100, "a grade's cut from the boundaries: " + cut);
  const grade = G.add({ type: "exam_grade", title: "an A", target: 1, links: { examId: real.id }, params: { basis: "best", grade: "A" }, deadline: real.date });
  eq(row(grade.id)._target, cut, "the target is the cut");
  const it = X.add({ tier: "real_exam", subject: "it", date: day(90), title: "IT unit", scope: { include: ["it:F201"] } });
  const nog = G.add({ type: "exam_grade", title: "a D*", target: 1, links: { examId: it.id }, params: { grade: "A" }, deadline: it.date });
  assert(row(nog.id)._current === null && /No boundaries/.test(row(nog.id)._meta), "no boundaries, no grade claim");
  [best, grade, nog].forEach((g) => G.remove(g.id));
  X.remove(it.id);
  /* the result is logged: judged then (after the exam), never on the date */
  const past = X.add({ preset: "aqa-7517-1", tier: "real_exam", date: day(-30), title: "Sat in June" });
  const pg = G.add({ type: "exam_grade", title: "≥ 70% on the day", target: 70, links: { examId: past.id }, params: { basis: "result" }, deadline: past.date });
  eq(row(pg.id)._status, "active", "the date passed but no result: still open (results day comes later)");
  T.add({ kind: "paper", paper: "Result", subject: "compsci", marks: 75, max: 100, role: "result", date: TODAY, assessmentId: past.id });
  eq([row(pg.id)._current, row(pg.id)._status], [75, "completed"], "the result met it");
  G.remove(res.id); G.remove(pg.id);
});

step("D · recall is held on the date, its line from the figure at creation", () => {
  rate("compsci:Paper 2", 30, 5, 20);
  const rd = X.readiness(X.get(real.id));
  assert(!rd.signals.recall.thin, "recall has evidence");
  const now = Math.round(100 * rd.signals.recall.value);
  const g = G.add({ type: "exam_recall", title: "recall", target: Math.max(1, now - 5), links: { examId: real.id }, deadline: real.date });
  eq(G.get(g.id).params.baseline, now, "the baseline is today's figure");
  let r = row(g.id);
  eq([r._current, r._status], [now, "active"], "at the target before the date is still open");
  eq(r._base, now, "the line starts at the baseline");
  const pastQ = X.add({ tier: "topic_test", subject: "compsci", date: day(-2), title: "Last week's test", scope: { include: ["compsci:Paper 2"] } });
  const met = G.add({ type: "exam_recall", title: "held", target: 50, links: { examId: pastQ.id }, deadline: pastQ.date });
  const miss = G.add({ type: "exam_recall", title: "too high", target: 100, links: { examId: pastQ.id }, deadline: pastQ.date });
  eq([row(met.id)._status, row(miss.id)._status], ["completed", "failed"], "judged on the date");
  [met, miss].forEach((x) => G.remove(x.id));
  X.remove(pastQ.id);
  G.remove(g.id);
});

step("E · topics count Green, or covered, or all of the scope", () => {
  const ls = X.leaves(X.get(real.id));
  ls.slice(0, 3).forEach((k) => { const p = K.spec.parse(k); K.rag.setManual(p.subject, p.ref, "g"); });
  const green = G.add({ type: "exam_topics_green", title: "green", target: 10, links: { examId: real.id }, params: { basis: "green" }, deadline: real.date });
  const r = row(green.id);
  assert(r._current >= 3 && r._target === 10 && /leaves in scope/.test(r._meta), "green leaves of the scope: " + r._current);
  const all = G.add({ type: "exam_topics_green", title: "all", target: 1, links: { examId: real.id }, params: { basis: "covered", all: true }, deadline: real.date });
  eq(row(all.id)._target, ls.length, "all of the scope");
  [green, all].forEach((x) => G.remove(x.id));
});

let chk;
step("F · the checklist goal, and app-checked rules", () => {
  X.addCheck(real.id, null, "prep", "all-green");
  X.addCheck(real.id, null, "prep", "recall:50");
  X.addCheck(real.id, null, "prep", "mocks:2");
  eq(X.addCheck(real.id, null, "prep", "nonsense"), null, "an unknown rule refuses");
  X.addCheck(real.id, null, "prep", "all-green");
  const items = X.checklist(X.get(real.id));
  const rules = items.filter((c) => c.rule);
  eq(rules.map((c) => c.rule), ["all-green", "recall:50", "mocks:2"], "each once");
  assert(rules.every((c) => c.auto), "app-checked");
  eq(rules.map((c) => c.done), [false, true, false], "not all Green; recall over 50; no mocks sat");
  eq(X.tickCheck(real.id, rules[0].id, true), null, "a rule refuses a hand");
  X.add({ tier: "mock", subject: "compsci", date: day(-40), title: "Mock 1", scope: { include: ["compsci:4.5"] } });
  X.add({ tier: "mock", subject: "compsci", date: day(-20), title: "Mock 2", scope: { include: ["compsci:4.5"] } });
  eq(X.checklist(X.get(real.id)).find((c) => c.rule === "mocks:2").done, true, "two mocks sat");
  chk = G.add({ type: "exam_checklist", title: "checklist", target: 1, links: { examId: real.id }, deadline: real.date });
  const all = X.checklist(X.get(real.id));
  const r = row(chk.id);
  eq([r._current, r._target, r._pace], [all.filter((c) => c.done).length, all.length, null], "done of all, no pace");
  assert(/ticked by the app/.test(r._meta), "who ticked them: " + r._meta);
});

step("G · templates by tier; only ticked rows are made", () => {
  const types = (a) => K.goalsExams.templates(a).map((r) => r.type);
  eq(types(X.get(real.id)), ["exam_grade", "exam_recall", "exam_topics_green", "exam_papers_done", "exam_checklist"], "a real exam: all five");
  const mock = X.add({ preset: "edexcel-9ma0-1", tier: "mock", date: day(51), title: "Maths Pure mock", calculator: "allowed" });
  eq(types(mock), ["exam_grade", "exam_recall", "exam_topics_green", "exam_papers_done", "exam_checklist"], "a mock: all five");
  const tt = X.add({ tier: "topic_test", subject: "compsci", date: day(9), title: "Unit test", scope: { include: ["compsci:4.5"] } });
  eq(types(tt), ["exam_grade", "exam_recall", "exam_topics_green", "exam_checklist"], "a topic test: four");
  const q = X.add({ tier: "retrieval_test", subject: "compsci", date: day(2), title: "Quiz", scope: { include: ["compsci:4.5"] } });
  eq(types(q), ["exam_recall"], "a quiz: recall");
  const d = X.add({ tier: "deadline", subject: "it", date: day(30), title: "NEA" });
  eq(types(d), [], "a deadline: none");
  const before = G.all().length;
  const rows0 = K.goalsExams.templates(mock);
  eq(rows0.filter((r) => r.on).map((r) => r.type), ["exam_grade", "exam_recall", "exam_papers_done"], "29c's default ticks");
  eq(G.all().length, before, "offering writes nothing");
  const made = K.goalsExams.add(mock, rows0.map((r) => Object.assign({}, r, { on: r.on || r.type === "exam_checklist" })));
  eq(made.length, 4, "the ticked ones");
  assert(made.every((g) => g.links.examId === mock.id && g.deadline === mock.date && g.links.subject === "maths"), "linked, ending on the date, the subject's hue");
  const texts = X.checklist(X.get(mock.id)).map((c) => c.text);
  ["Calculator packed", "Calculator in Degree mode", "Formula booklet", "ID and equipment", "Room and arrival time"].forEach((t) => assert(texts.indexOf(t) !== -1, "standard item " + t));
  K.goalsExams.add(X.get(mock.id), [Object.assign({}, rows0.find((r) => r.type === "exam_checklist"), { on: true })]);
  eq(X.checklist(X.get(mock.id)).filter((c) => c.text === "ID and equipment").length, 1, "brought once");
  [tt, q, d].forEach((a) => X.remove(a.id));
});

step("H · deleting an exam unlinks its goals and keeps them", () => {
  const mock = X.all().find((a) => a.title === "Maths Pure mock");
  const linked = G.byExam(mock.id);
  assert(linked.length >= 4, "linked goals");
  const n = G.all().length;
  X.remove(mock.id);
  eq(G.all().length, n, "none deleted");
  const g = G.get(linked[0].id);
  assert(!g.links.examId && g.params.examGone && g.params.examGone.title === "Maths Pure mock" && g.params.examGone.at === TODAY, "marked removed");
  const r = row(g.id);
  eq([r._unlinked, r._current, r._pace, r._status], [true, null, null, "active"], "measured as nothing, no pace");
  eq(G.notices(rows(), TODAY).filter((x) => x.id.indexOf("goal:" + g.id + ":") === 0), [], "no notices");
  G.tick();
  eq(G.get(g.id).archived, false, "not on the same day");
  eq(G.judgeUnlinked(day(1)) >= 1, true, "the next judgement");
  eq(G.get(g.id).archived, true, "archived");
  G.linkExam(g.id, real.id);
  const back = G.get(g.id);
  eq([back.links.examId, back.params.examGone, back.archived, back.deadline], [real.id, undefined, false, X.get(real.id).date], "linked again, nothing lost");
});

step("I · zero Governor traffic; a met goal records an activity-only receipt", () => {
  const T = K.tracker;
  const s0 = gov();
  const met = G.add({ type: "exam_papers_done", title: "1 paper", target: 1, links: { examId: real.id }, deadline: X.get(real.id).date });
  rows();
  eq(G.get(met.id).status, "completed", "met");
  eq(K.store.state.goals.completionLedger[met.id].payout, "activity-only", "the receipt");
  eq(gov(), s0, "no session, XP, gold or HP from goals");
  void T; void govBefore;
});

step("J · the Assistant's read tools for the hub", async () => {
  const tool = (name, args) => new Promise((res) => K.ai.tools.execute(name, args, (err, result) => res({ err, result })));
  K.tracker.add({ kind: "paper", paper: "Noted", subject: "compsci", marks: 50, max: 100, timed: true, date: TODAY, assessmentId: real.id, notes: "SECRET-NOTE" });
  const ov = await tool("exams_overview", {});
  assert(!ov.err, ov.err && ov.err.message);
  const r = ov.result.upcoming.find((x) => x.id === real.id);
  assert(r && r.tier === "real_exam" && r.daysLeft > 0 && "band" in r, "the real exam with its band");
  const d = await tool("exam_detail", { id: real.id });
  assert(!d.err && d.result.signals && Object.keys(d.result.signals).length === 4, "four signals apart");
  assert(d.result.goals.length >= 1, "its linked goals");
  const at = await tool("exam_attempts", { id: real.id });
  assert(!at.err && at.result.attempts.length >= 3, "the attempts");
  assert(!JSON.stringify(at.result).includes("SECRET-NOTE"), "never notes");
  const bad = await tool("exam_detail", { id: "nope" });
  assert(bad.err || (bad.result && bad.result.error), "an unknown id says so");
  rows();
});

step("K · Goals, a goal, the assessment and the dialogs draw without writing", async () => {
  rows();
  const snap = () => { const s = JSON.parse(JSON.stringify(K.store.state)); delete s.ui; return s; };
  /* the Badge Wall's evaluation after the setup's own writes lands first:
     it is not the page's write (roadmap 5.16, invariant 163) */
  for (let i = 0; i < 600 && K.achievements && K.achievements._busy(); i++) await app.settle();
  const before = snap();
  const pages = [["goals"], ["goals", "all"], ["goals", { id: chk.id }], ["goals", { id: papers.id }], ["exams", real.id]];
  for (const [v, a] of pages) {
    K.show(v, a); await app.settle();
    assert(app.document.querySelector("#main").children.length, "drew " + JSON.stringify(a));
  }
  assert(app.document.querySelector("[data-ui~='exams.goals']"), "the assessment's Goals card");
  assert(app.document.querySelectorAll("[data-ui~='exams.goal']").length >= 2, "its linked goals");
  K.show("goals"); await app.settle();
  assert(app.document.querySelector("[data-ui~='goal.exam-chip']"), "a card's exam chip");
  eq(diff(before, snap()).slice(0, 6), [], "no page wrote the state");
  const ov = K.examGoalTemplates(X.get(real.id)); await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='exams.goal-template']").length === 5, "five template rows");
  ov.close();
  K.goalsUI.goalDialog(null, { type: "exam_recall" }); await app.settle();
  assert(app.document.querySelector("[data-ui~='goal.exam']"), "the editor's exam field");
  app.document.querySelector("[data-ui~='goal.editor']").parentNode.remove();
  K.goalsUI.newGoal(); await app.settle();
  assert(app.document.querySelector("[data-ui~='goal.exam-types']"), "the picker's Exams group");
  app.document.querySelector("[data-ui~='goal.new-dialog']").parentNode.remove();
  eq(diff(before, snap()).slice(0, 6), [], "opening dialogs writes nothing");
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke92: " + failed + " failed" : "smoke92: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
