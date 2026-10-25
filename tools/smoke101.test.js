/* Kurenai OS — smoke101.test.js
   The day model and the joins (roadmap 5.10, docs/routines-plan.md §3,
   §10; invariants 147, 149).

   The claims:

     A · TODAY IS A READ (invariant 149): KOS.today.build gathers the day's
         lessons, events, study blocks, reminders, assignments, plan rows,
         exam warnings and Focus time from their owners, refs and not
         copies, and writes nothing.
     B · DUE: an overdue reminder and today's; an assignment due within
         three days, one already started, one on a work-on day; nothing
         complete.
     C · FREE TIME: the gaps between timed items, school hours on a school
         day, to the evening review; a gap under 15 minutes is not free.
     D · NEXT is Home's ladder (KOS.homeFocusPlan), read, never re-derived.
     E · WORK-ON DAYS: an assignment keeps a set of dates (valid, unique,
         sorted), only while it has some; the merge treats them as a set.
     F · PINNED GOALS: at most three, never an archived goal; absent unless
         set; Today lists them.
     G · THE COUNTDOWN RULE (decision J): coursework, NEA or a project,
         High, 3 h or more, or due within 3 days; Pin and Unpin are
         actions that fall back to the rule when they agree with it; a
         checkbox-marked assignment stays pinned through the switch.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke101.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-10-21";               // a Wednesday in term
function day(n, from) {
  const [y, m, d] = (from || TODAY).split("-").map(Number);
  const x = new Date(y, m - 1, d + n);
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}
function at(d, hm) { const [y, m, dd] = d.split("-").map(Number); const [h, mi] = hm.split(":").map(Number); return new Date(y, m - 1, dd, h, mi).getTime(); }

let app, K, snapBefore;
function snap() { return JSON.stringify(K.store.state); }

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS;
  K.store.state.calendar.events = [];
  K.store.state.reminders.items = [];
  K.store.state.assignments.items = [];
  eq(app.errors, [], "boot errors");
});

let ids = {};
step("A · today is a read", () => {
  const C = K.calendar;
  ids.block = C.addEvent({ type: "study", title: "Maths block", date: TODAY, time: "17:00", durationMins: 60, subject: "maths" }).id;
  ids.ev = C.addEvent({ type: "event", title: "Club", date: TODAY, time: "19:30", endTime: "20:00" }).id;
  ids.remLate = K.reminders.add({ title: "Return library book", due: day(-2) }).id;
  ids.remToday = K.reminders.add({ title: "Email Mr Hart", due: TODAY }).id;
  ids.remLater = K.reminders.add({ title: "Later thing", due: day(9) }).id;
  ids.asgSoon = K.assignments.add({ title: "Stats homework", due: day(2), subject: "maths" }).id;
  ids.asgStarted = K.assignments.add({ title: "NEA analysis", due: day(6), status: "inProgress", type: "coursework", subject: "compsci" }).id;
  ids.asgFar = K.assignments.add({ title: "Essay plan", due: day(20) }).id;
  ids.asgDone = K.assignments.add({ title: "Done thing", due: day(1), status: "complete" }).id;
  K.sessions.log({ type: "focus", subject: "maths", dur: 50 * 60, metrics: { complete: true, mins: 50, secs: 3000, rule: "blocks" } });
  snapBefore = snap();
  const T = K.today.build(TODAY, { now: at(TODAY, "10:00") });
  eq(snap(), snapBefore, "building the day wrote nothing");
  const kinds = T.timeline.map((x) => x.kind);
  assert(kinds.indexOf("study") !== -1 && kinds.indexOf("event") !== -1, "events and the study block");
  const lessons = T.timeline.filter((x) => x.kind === "lesson");
  assert(lessons.length > 0 && lessons.every((l) => l.ref.kind === "plan" && l.ref.lesson), "the timetable's lessons, by plan ref");
  assert(T.isSchoolDay, "a school day");
  const blk = T.timeline.find((x) => x.kind === "study");
  eq([blk.start, blk.end, blk.ref], ["17:00", "18:00", { kind: "event", id: ids.block }], "a ref, not a copy");
  eq(T.focus.mins, 50, "Focus so far");
  eq(T.focus.bySubject.maths, 50, "by subject");
});

step("B · due", () => {
  const T = K.today.build(TODAY, { now: at(TODAY, "10:00") });
  const ref = (k, id) => T.due.find((x) => x.ref.kind === k && x.ref.id === id);
  assert(ref("reminder", ids.remLate) && ref("reminder", ids.remLate).overdue, "the overdue reminder");
  assert(ref("reminder", ids.remToday), "today's reminder");
  assert(!ref("reminder", ids.remLater), "not a later one");
  eq(ref("assignment", ids.asgSoon).why, "soon", "due within three days");
  eq(ref("assignment", ids.asgStarted).why, "started", "started and due within a week");
  assert(!ref("assignment", ids.asgFar) && !ref("assignment", ids.asgDone), "neither far nor complete");
  eq(T.due[0].overdue, true, "overdue first");
  K.assignments.update(ids.asgFar, { workOn: [TODAY] });
  eq(K.today.build(TODAY, { now: at(TODAY, "10:00") }).due.find((x) => x.ref.id === ids.asgFar && x.ref.kind === "assignment").why, "workOn", "a work-on day");
  K.assignments.update(ids.asgFar, { workOn: [] });
  eq(K.today.build(day(1), { now: at(TODAY, "10:00") }).due.some((x) => x.overdue), false, "another day has no overdue rows");
});

step("C · free time", () => {
  const T = K.today.build(TODAY, { now: at(TODAY, "10:00") });
  eq(T.free, [
    { from: "15:30", to: "17:00", mins: 90 },
    { from: "18:00", to: "19:30", mins: 90 },
    { from: "20:00", to: "22:00", mins: 120 }
  ], "after school, around the block and the club, to 22:00");
  const late = K.today.build(TODAY, { now: at(TODAY, "21:50") });
  eq(late.free, [], "ten minutes is not free time");
  K.store.state.dayReview = { v: 1, days: {}, school: { from: "09:00", to: "15:00" } };
  eq(K.today.build(TODAY, { now: at(TODAY, "10:00") }).free[0].from, "15:00", "school hours from the settings");
  delete K.store.state.dayReview;
});

step("D · next is Home's ladder", () => {
  const T = K.today.build(TODAY, { now: at(TODAY, "16:40") });
  const H = K.homeFocusPlan(new Date(at(TODAY, "16:40")));
  eq([T.next.kind, T.next.title], [H.kind, H.label], "the same rung");
  eq(K.today.build(day(1), { now: at(TODAY, "16:40") }).next, null, "only for today");
});

step("E · work-on days", () => {
  const a = K.assignments.update(ids.asgSoon, { workOn: [day(1), "nope", day(1), TODAY] });
  eq(a.workOn, [TODAY, day(1)], "valid, unique, sorted");
  eq("workOn" in K.assignments.update(ids.asgSoon, { workOn: [] }), false, "absent when empty");
  const base = { assignments: { items: [{ id: 1, title: "x", workOn: [TODAY], updatedAt: 1 }] } };
  const l = JSON.parse(JSON.stringify(base)), r = JSON.parse(JSON.stringify(base));
  l.assignments.items[0].workOn = [TODAY, day(1)]; l.assignments.items[0].updatedAt = 2;
  r.assignments.items[0].workOn = [TODAY, day(2)]; r.assignments.items[0].updatedAt = 3;
  eq(K.cloudmerge.merge(base, l, r).doc.assignments.items[0].workOn.slice().sort(), [TODAY, day(1), day(2)], "a set in the merge");
});

step("F · pinned goals", () => {
  K.store.state.goals = { v: 3, nextId: 1, items: [], completionLedger: {} };
  const G = K.goals;
  const gs = [1, 2, 3, 4].map((i) => G.add({ type: "custom-manual", title: "Goal " + i, target: 5 }));
  eq("pinned" in G.get(gs[0].id), false, "absent unless set");
  gs.slice(0, 3).forEach((g) => assert(G.pin(g.id, true).ok, "pinned " + g.id));
  eq(G.pin(gs[3].id, true).ok, false, "three at most");
  G.archive(gs[0].id);
  eq(G.pinned().length, 2, "an archived goal drops out");
  assert(G.pin(gs[3].id, true).ok, "room again");
  const T = K.today.build(TODAY, { now: at(TODAY, "10:00") });
  eq(T.goals.map((g) => g.title).sort(), ["Goal 2", "Goal 3", "Goal 4"], "Today lists them");
});

step("G · the countdown rule", () => {
  const A = K.assignments;
  const mk = (p) => A.add(Object.assign({ title: "t", due: day(10) }, p));
  eq(A.isMajor(mk({})), false, "ordinary homework, far off");
  eq(A.isMajor(mk({ type: "coursework" })), true, "coursework");
  eq(A.isMajor(mk({ priority: 3 })), true, "High");
  eq(A.isMajor(mk({ estimateMins: 180 })), true, "3 h");
  eq(A.isMajor(mk({ due: day(3) })), true, "within 3 days");
  const plain = mk({});
  eq(A.pinCountdown(plain.id, true).countdown, "pin", "pinned");
  eq(A.isMajor(A.get(plain.id)), true, "and counts down");
  eq("countdown" in A.pinCountdown(plain.id, false), false, "unpinned falls back to the rule");
  const cw = mk({ type: "coursework" });
  eq(A.pinCountdown(cw.id, false).countdown, "hide", "coursework unpinned is hidden");
  const marked = mk({ showInCountdown: true });
  eq(A.migrateCountdown(), 1, "the checkbox-marked one");
  eq(A.get(marked.id).countdown, "pin", "stays pinned");
  eq(A.migrateCountdown(), 0, "once");
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke101: " + failed + " failed" : "smoke101: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
