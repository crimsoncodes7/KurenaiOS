/* Kurenai OS — smoke64.test.js
   Home after design part 2: what the Focus card offers, when a class
   lesson happens, and what keeps a study streak.

   The claims:

     A · THE STUDY STREAK counts study only: a day whose one entry is a
         habit, reminder or assignment tick ("todo") does not keep it, but
         still counts as activity for the HP day-drain (invariant 4).
     B · THE CLASS TIMETABLE dates a class row's lessons: lesson i on the
         subject's i-th class day, extras sharing the last, a single-lesson
         row on every class day; a moved lesson keeps its own day, and
         moving it back to its timetabled day stores nothing.
     C · A CLASS MILESTONE counts down to the day of its milestone lesson
         and leaves the countdowns once that day has passed — not "0 days"
         from Monday to Sunday.
     D · THE FOCUS CARD's ladder: a study block from 30 minutes before it
         starts, an exam inside its kind's lead time (real 7, mock 5,
         end-of-topic 3, retrieval 1), an assignment within a week with its
         estimate as the goal, then the next exam with a 2-hour goal; never
         a class milestone.
     E · THE EXAM KIND is a calendar field, gated by the normaliser and
         kept only on exams.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke64.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": " + JSON.stringify(a) + " vs " + JSON.stringify(b)); }

let app, KOS;
const today = () => KOS.srs.todayISO();             /* the harness clock: Thu 24 Sep 2026 */
const day = n => KOS.srs.addDays(today(), n);
function at(hh, mm) { const d = new app.window.Date(today() + "T00:00:00"); d.setHours(hh, mm, 0, 0); return d; }
function blank() {
  KOS.store.state.sessions = [];
  KOS.store.state.calendar.events = [];
  KOS.store.state.assignments = { v: 1, nextId: 1, items: [] };
  KOS.store.state.pacing.entries = KOS.store.state.pacing.entries.filter(e => e.source !== "school" || e.kind === "Lessons");
}

/* ============ A · streak ============ */
step("A · a todo tick keeps neither the study streak nor the best run, but is still the day's activity", () => {
  blank();
  const S = KOS.store.state.sessions;
  const push = (date, type, extra) => S.push(Object.assign({ id: S.length + 1, ts: 0, date, type, subject: "compsci", ref: null, dur: 600, metrics: {} }, extra || {}));
  push(day(-2), "quiz");
  push(day(-1), "todo", { subject: null, dur: null });
  push(today(), "flashcards");
  eq(KOS.sessions.streak(null), 1, "Tuesday's tick bridged the gap");
  eq(KOS.sessions.streaks().best, 1, "best run");
  assert(KOS.sessions.hasActivity(day(-1)), "the tick is still activity for the HP day-drain");
  push(day(-1), "tracker");
  eq(KOS.sessions.streak(null), 3, "a logged paper is study");
  KOS.store.state.sessions = [];
});

/* ============ B · lessons ============ */
let row;
step("B · lessons fall on the timetable in order; a single lesson runs every class day", () => {
  const wb = KOS.pacing.weekFor(today()).wb;
  row = KOS.pacing.addEntry({ source: "school", subject: "compsci", wb, kind: "Lessons", title: "Test week",
    detail: "Feedback; Legislation; Consequences; NEA (Analysis Hand-In)" });
  const plan = KOS.pacing.lessonPlan(row);
  eq(KOS.pacing.timetable("compsci"), [1, 3, 5], "CS default days");
  eq(plan.map(l => l.days[0]), [1, 3, 5, 5], "lesson i on class day i, extras on the last");
  eq(plan[1].dates, [KOS.srs.addDays(wb, 2)], "dated in the row's week");
  const one = KOS.pacing.addEntry({ source: "school", subject: "it", wb, kind: "NEA Milestone", title: "Live NEA", detail: "Supervised coursework, continuing." });
  eq(KOS.pacing.lessonPlan(one)[0].days, [2, 4], "one lesson, every IT class day");
  const bare = KOS.pacing.addEntry({ source: "school", subject: "maths", wb, kind: "Mock", title: "Mock week" });
  eq(KOS.pacing.lessonPlan(bare).map(l => [l.text, l.whole, l.tone]), [["Mock week", true, "assess"]], "a row with no detail is one lesson under its title");
  const thu = KOS.pacing.lessonsOn(today()).map(x => x.entry.id);
  assert(thu.indexOf(one.id) !== -1 && thu.indexOf(row.id) === -1, "Thursday holds the IT lesson, not the CS ones: " + thu);
  KOS.pacing.removeEntry(one.id); KOS.pacing.removeEntry(bare.id);
});

step("B · a lesson moves day; back on its timetabled day it stores nothing; the timetable is editable", () => {
  KOS.pacing.setLessonDay(row.id, "Legislation", 4);
  const p = KOS.pacing.lessonPlan(KOS.pacing.entryById(row.id));
  eq([p[1].days, p[1].moved], [[4], true], "moved to Thursday");
  assert(KOS.pacing.lessonsOn(today()).some(x => x.lesson.text === "Legislation"), "Thursday now lists it");
  KOS.pacing.setLessonDay(row.id, "Legislation", 3);
  eq(KOS.pacing.entryById(row.id).lessonDays, {}, "back on Wednesday is no override");
  eq(KOS.pacing.normalise({ lessonDays: { a: 9, b: "2", "": 1 } }).lessonDays, { b: 2 }, "the gate keeps weekdays 1–7 only");
  assert(!("timetable" in KOS.store.state.pacing), "an untouched timetable writes nothing");
  eq(KOS.pacing.setTimetable("maths", [5, 1, 1, 9]), [1, 5], "set, de-duplicated and sorted");
  eq(KOS.pacing.timetable("maths"), [1, 5], "read back");
  delete KOS.store.state.pacing.timetable;
});

/* ============ C · milestones ============ */
step("C · a milestone counts down to its lesson's day and leaves once that day has passed", () => {
  const wb = KOS.pacing.weekFor(today()).wb;
  const m = KOS.pacing.updateEntry(row.id, { kind: "NEA Milestone" });
  let c = KOS.pacing.classMilestones("compsci").filter(x => x.entry.id === m.id)[0];
  eq([c.date, c.days], [KOS.srs.addDays(wb, 4), 1], "the NEA lesson is on Friday, tomorrow");
  KOS.pacing.setLessonDay(row.id, "NEA (Analysis Hand-In)", 2);
  c = KOS.pacing.classMilestones("compsci").filter(x => x.entry.id === m.id)[0];
  assert(!c, "moved to Tuesday, the milestone has passed: " + JSON.stringify(c && c.date));
  const cd = KOS.calendar.countdowns().filter(x => x.kind === "pacing" && x.entry.id === m.id);
  eq(cd.length, 0, "and the countdowns agree");
  const wb2 = KOS.pacing.weekFor(today()).wb;
  const run = KOS.pacing.addEntry({ source: "school", subject: "it", wb: wb2, kind: "NEA Milestone", title: "Live NEA", detail: "Supervised coursework, continuing." });
  assert(!KOS.pacing.classMilestones("it").some(x => x.entry.id === run.id), "a continuing lesson is a milestone once, on its first day (Tuesday), not again on Thursday");
  assert(KOS.pacing.lessonsOn(today()).some(x => x.entry.id === run.id), "it still stands in Thursday's lessons");
  KOS.pacing.removeEntry(run.id);
  KOS.pacing.removeEntry(row.id);
});

/* ============ D · the Focus card ============ */
const plan = (hh, mm) => KOS.homeFocusPlan(at(hh, mm));
step("D · a study block leads from 30 minutes before it starts; its length is the goal", () => {
  blank();
  const b = KOS.calendar.addEvent({ type: "study", title: "Recursion practice", date: today(), time: "11:00", endTime: "12:15", subject: "compsci" });
  assert(plan(10, 29).kind !== "block", "31 minutes out is too early");
  let p = plan(10, 35);
  eq([p.kind, p.label, p.mins, p.goal.k], ["block", "Recursion practice", 75, "Block"], "25 minutes before");
  assert(/starts in 25 min/.test(p.kicker), "kicker: " + p.kicker);
  p = plan(11, 45);
  eq([p.kind, p.mins], ["block", 30], "running: the rest of the block");
  assert(plan(12, 15).kind !== "block", "over at its end");
  KOS.calendar.deleteEvent(b.id);
});

step("D · an exam inside its kind's lead time outranks assignments; outside it, assignments first", () => {
  blank();
  const a = KOS.assignments.add({ title: "NEA write-up", due: day(2), subject: "compsci", estimateMins: 180, actualMins: 60 });
  let p = plan(10, 0);
  eq([p.kind, p.label, p.assignmentId, p.goal.k], ["assignment", "NEA write-up", a.id, "Left"], "the assignment");
  assert(/About 2h of 3h/.test(p.goal.v), "the estimate's remainder: " + p.goal.v);
  const t = KOS.calendar.addEvent({ type: "exam", examLevel: "topic", title: "Algebra test", date: day(4), subject: "maths" });
  eq(plan(10, 0).kind, "assignment", "an end-of-topic test 4 days out waits");
  KOS.calendar.updateEvent(t.id, { date: day(3) });
  p = plan(10, 0);
  eq([p.kind, p.label, p.goal.k], ["exam", "Revise for Algebra test", "Goal"], "3 days out it leads");
  assert(/^0 min of 1h for this exam today/.test(p.goal.v), "an end-of-topic test's goal is an hour, none done yet: " + p.goal.v);
  const S = KOS.store.state.sessions;
  S.push({ id: 9001, ts: 0, date: today(), type: "focus", subject: null, ref: null, dur: 1800, metrics: { complete: true } });
  S.push({ id: 9002, ts: 0, date: today(), type: "focus", subject: "compsci", ref: "4.1.1.1", dur: 1200, metrics: { complete: true } });
  assert(/^0 min of 1h/.test(plan(10, 0).goal.v), "a bare timer and another subject are not revision for it: " + plan(10, 0).goal.v);
  S.push({ id: 9003, ts: 0, date: today(), type: "focus", subject: "maths", ref: null, dur: 900, metrics: { complete: true, objective: "Revise for Algebra test" } });
  assert(/^15 min of 1h/.test(plan(10, 0).goal.v), "a session started from the card counts: " + plan(10, 0).goal.v);
  KOS.store.state.sessions = [];
  KOS.calendar.addEvent({ type: "exam", examLevel: "exam", title: "Paper 1", date: day(6), subject: "compsci" });
  eq(plan(10, 0).label, "Revise for Paper 1", "a real exam outranks a nearer topic test");
  const b = KOS.calendar.addEvent({ type: "study", title: "Block", date: today(), time: "10:10", endTime: "11:00" });
  eq(plan(10, 0).kind, "block", "a study block about to start still leads");
  KOS.calendar.deleteEvent(b.id);
  KOS.assignments.remove(a.id);
});

step("D · with nothing within a week: the next exam with a 2-hour goal; never a class milestone", () => {
  blank();
  KOS.calendar.addEvent({ type: "exam", examLevel: "retrieval", title: "Retrieval quiz", date: day(9), subject: "maths" });
  let p = plan(10, 0);
  eq([p.kind, p.label], ["exam", "Revise for Retrieval quiz"], "the next exam");
  assert(/of 2h for this exam today/.test(p.goal.v), "2-hour goal: " + p.goal.v);
  KOS.store.state.calendar.events = [];
  const wb = KOS.pacing.weekFor(today()).wb;
  const ms = KOS.pacing.addEntry({ source: "school", subject: "it", wb, kind: "NEA Milestone", title: "Live NEA", detail: "Coursework." });
  p = plan(10, 0);
  assert(p.kind === "general" && p.label !== "Live NEA", "a class milestone reached the Focus card: " + p.label);
  assert(/of 2h today/.test(p.goal.v), "the general goal is 2 hours");
  KOS.pacing.removeEntry(ms.id);
});

/* ============ E · the exam kind ============ */
step("E · the exam kind is gated and kept on exams only", () => {
  eq(KOS.calendar.normalise({ type: "exam", title: "x" }).examLevel, "exam", "default: a real exam");
  eq(KOS.calendar.normalise({ type: "exam", title: "x", examLevel: "mock" }).examLevel, "mock", "a mock");
  eq(KOS.calendar.normalise({ type: "exam", title: "x", examLevel: "nonsense" }).examLevel, "exam", "junk reads as a real exam");
  eq(KOS.calendar.normalise({ type: "study", title: "x", examLevel: "mock" }).examLevel, null, "only exams carry it");
  eq(KOS.calendar.EXAM_LEVELS.map(l => l.leadDays), [7, 5, 3, 1], "the lead times");
  eq(["Paper 2 mock", "Algebra topic test", "Retrieval quiz", "Database progress exam", "A-level Paper 1"].map(t => KOS.calendar.normalise({ type: "exam", title: t }).examLevel),
    ["mock", "topic", "retrieval", "topic", "exam"], "an exam with no kind reads it from its title");
  eq(KOS.calendar.normalise({ type: "exam", title: "Paper 2 mock", examLevel: "exam" }).examLevel, "exam", "a chosen kind wins over the title");
});

(async () => {
  app = await boot();
  KOS = app.KOS;
  app.window.__kosAutoConfirm = false;
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.stack ? e.stack.split("\n").slice(0, 2).join(" | ") : e)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE64: " + fails + " failure(s)" : "\nSMOKE64: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
