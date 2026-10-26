/* Kurenai OS — smoke100.test.js
   Routines (roadmap 5.10, docs/routines-plan.md §4–5, §11; invariants 142,
   143, 148): the core, before its page ships.

   The claims:

     A · ON AT BOOT: routines are on, with their notification kind, goal
         types and tools; Habits moved in at boot.
     B · HABITS MOVE IN WHOLE: each habit becomes a one-step routine with
         a deterministic id ("h:<id>") and every kept day; the habits stay,
         frozen; a second pass adds nothing; KOS.todo, the habits view and
         the streak read the same as before; a habit made later on an older
         copy of the app is picked up by the next pass.
     C · THE GATE AND THE TEMPLATES: a template copies with fresh ids and
         its flags (optional, minimum, checked in the morning, on demand);
         one minimum at most; a bad link is dropped.
     D · THE SNAPSHOT (invariant 142): editing a routine never changes a
         day already started; the next day takes the new steps.
     E · PAY ONCE (invariant 143): a kept day logs ONE todo session with
         metrics.routine, priced by routineAward (a habit 5/1/+2; seven
         steps 23/2/+4); untick and re-tick pays nothing; past eight a
         calendar day the session logs and pays nothing; steps and an
         on-demand run pay nothing; a completion is never study.
     F · STREAKS AND REST DAYS (decision C): scheduled days only; today
         never breaks it; a missed day does; a planned rest day keeps it,
         one in any seven, never after the window or for a past day.
     G · LATE TICKS COUNT FOR LAST NIGHT (decision F, invariant 148): the
         evening routine stays open until the Morning Review closes or
         noon; a step checked in the morning is asked Yes or No; a tick
         after 00:00 and before 04:00 belongs to the day before.
     H · THE MERGE: two devices' ticks on one day union per step; the
         routine records merge by their string ids.
     I · GOALS AND TOOLS (when on): routine-days and routine-streak read
         the log; habit-streak follows the habit into its routine; the
         Assistant lists, adds from a template, ticks with an undo.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke100.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-10-26";               // a Monday
function day(n, from) {
  const [y, m, d] = (from || TODAY).split("-").map(Number);
  const x = new Date(y, m - 1, d + n);
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}
function at(d, hm) { const [y, m, dd] = d.split("-").map(Number); const [h, mi] = hm.split(":").map(Number); return new Date(y, m - 1, dd, h, mi).getTime(); }

let app, K, R;
function sessions() { return K.store.state.sessions; }
function routineSessions() { return sessions().filter((e) => e.type === "todo" && e.metrics && e.metrics.routine); }
function ex(name, args) { return new Promise((res) => K.ai.tools.execute(name, args, (err, result, undo) => res({ err, result, undo }))); }

step("boot", async () => {
  const habits = [
    { id: 7, text: "Drink water", created: day(-30), days: { [day(-3)]: true, [day(-2)]: true, [day(-1)]: true } },
    { id: 9, text: "Stretch", created: day(-30), days: { [day(-10)]: true } }
  ];
  const stored = { todo: { nextId: 12, manual: [], autoChecked: {}, habits } };
  app = await boot({ clock: TODAY + "T07:30:00", storage: { "kurenai-os-v1": JSON.stringify(stored) } });
  K = app.KOS; R = K.routines;
  eq(app.errors, [], "boot errors");
});

step("A · on at boot", () => {
  eq(R.enabled(), true, "on");
  eq(R.migrated(), true, "Habits moved in at boot");
  assert(K.notify.KINDS.routine, "the notification kind");
  assert(K.goals.typeDef("routine-days").id === "routine-days", "the goal types");
  assert(K.ai.tools.get("routines_list"), "the tools");
});

step("B · habits move in whole", () => {
  const w = R.get("h:7");
  assert(w && w.kind === "habit" && w.steps.length === 1 && w.legacyHabit === "7", "a one-step routine with its legacy id");
  eq(K.store.state.todo.habits.length, 2, "the habits are kept, frozen");
  eq(K.store.state.todo.habitsMovedTo, "routines", "and marked moved");
  eq(R.migrate(), 0, "a second pass adds nothing");
  const view = K.todo.habits().map((h) => [h.id, h.text, Object.keys(h.days).sort(), K.todo.habitStreak(h)]);
  eq(view, [[7, "Drink water", [day(-3), day(-2), day(-1)], 3], [9, "Stretch", [day(-10)], 0]], "KOS.todo reads the same habits, days and streaks");
  eq(R.streak("h:7"), 3, "the streak: three days to yesterday, today not yet broken");
  eq(R.best("h:9"), 1, "best");
  /* an older copy of the app adds a habit after the move */
  K.store.state.todo.habits.push({ id: 11, text: "Floss", created: TODAY, days: {} });
  eq(R.migrate(), 1, "picked up by the next pass");
  assert(R.get("h:11"), "as h:11");
  R.remove("h:11");
});

step("C · the gate and the templates", () => {
  const ev = R.fromTemplate("evening");
  eq(ev.steps.length, 9, "nine steps");
  const last = ev.steps[8];
  assert(last.checkMorning && last.optional, "Asleep by 00:00 is checked in the morning and optional");
  assert(ev.steps[6].optional && ev.steps[6].link.kind === "view", "the light novel: optional, a link");
  eq([ev.kind, ev.anchor, ev.template], ["evening", "review:evening", "evening"], "kind, anchor, template");
  const st = R.fromTemplate("study");
  eq(st.days, null, "About to Study is on demand");
  eq(R.scheduledOn(st, TODAY), false, "never scheduled");
  const n = R.normalise({ name: "x", steps: [{ text: "a", minimum: true }, { text: "b", minimum: true }, { text: "c", link: { kind: "url", to: "http://x" } }] });
  eq(n.steps.filter((s) => s.minimum).length, 1, "one minimum at most");
  assert(!n.steps[2].link, "an http link is dropped");
  eq(R.normalise({ days: [0, 1, 2, 3, 4, 5, 6] }).days, [], "every day is []");
  R.remove(st.id);
});

let morning;
step("D · the snapshot: editing never changes a started day", () => {
  morning = R.fromTemplate("morning", { remind: false });
  const s0 = morning.steps[0].id;
  assert(R.tick(morning.id, s0, true, { now: at(TODAY, "06:50") }).ok, "ticked");
  const e = R.entry(morning.id, TODAY);
  eq(e.snap.length, 7, "seven steps frozen");
  R.update(morning.id, { steps: morning.steps.slice(0, 3).concat([{ text: "New step" }]) });
  eq(R.verdict(R.get(morning.id), R.entry(morning.id, TODAY)).of, 7, "today is still judged against seven");
  eq(R.verdict(R.get(morning.id), null).of, 4, "the next day takes the four");
  R.update(morning.id, { steps: morning.steps });   // back as it was
});

step("E · pay once", () => {
  const g0 = Object.assign({}, K.store.state.governor), n0 = routineSessions().length;
  const r = R.get(morning.id);
  let res;
  r.steps.forEach((s) => { res = R.tick(r.id, s.id, true, { now: at(TODAY, "07:10") }); });
  eq(res.state, "done", "kept");
  eq(res.award, { xp: 23, gold: 2, hp: 4 }, "seven required steps");
  eq(routineSessions().length, n0 + 1, "ONE session");
  const e = routineSessions().slice(-1)[0];
  eq([e.metrics.routine, e.metrics.req, e.award.xp], [r.id, 7, 23], "metrics and the recorded award");
  eq(K.store.state.governor.xp - g0.xp, 23, "XP moved once");
  R.tick(r.id, r.steps[2].id, false, { now: at(TODAY, "07:11") });
  R.tick(r.id, r.steps[2].id, true, { now: at(TODAY, "07:12") });
  eq(routineSessions().length, n0 + 1, "untick and re-tick pays nothing");
  assert(!K.sessions.studyEntry || !K.sessions.studyEntry(e), "a completion is not study");
  eq(K.governor.routineAward({ req: 1 }), { xp: 5, gold: 1, hp: 2 }, "a habit pays what it always did");
  eq(K.governor.routineAward({ req: 3 }), { xp: 11, gold: 1, hp: 3 }, "three steps");
  eq(K.governor.routineAward({ req: 12 }), { xp: 25, gold: 2, hp: 4 }, "the ceiling");
  eq(K.governor.routineAward({ req: 9, min: true }), { xp: 5, gold: 1, hp: 2 }, "a minimum day");
  /* the cap: eight rewarded a calendar day, counting this one */
  const made = [];
  for (let i = 0; i < 8; i++) made.push(R.addHabit("Habit " + i));
  const paid = made.map((h) => R.tick(h.id, h.steps[0].id, true, { now: at(TODAY, "08:00") }).award);
  eq(paid.filter((a) => a.xp).length, 7, "seven more pay (eight in all)");
  eq(paid.slice(-1)[0], { xp: 0, gold: 0, hp: 0 }, "the ninth is past the cap");
  const last = routineSessions().slice(-1)[0];
  eq([last.metrics.capped, last.award.xp], [true, 0], "logged, capped, paid nothing");
  made.forEach((h) => R.remove(h.id));
  /* an on-demand routine pays nothing */
  const st = R.fromTemplate("study"), n1 = routineSessions().length;
  R.tickAll(st.id, { now: at(TODAY, "09:00") });
  eq(routineSessions().length, n1, "About to Study pays nothing");
  R.remove(st.id);
});

step("F · streaks and rest days", () => {
  const r = R.add({ name: "Weekdays", steps: [{ text: "Read" }], days: [1, 2, 3, 4, 5], window: { from: "19:00", to: "21:00" }, createdAt: at(day(-21), "12:00") });
  const s = r.steps[0].id;
  /* last week Monday–Friday kept (written as the log would hold them) */
  const log = K.store.state.routines.log;
  for (let i = -7; i <= -3; i++) log[r.id + "|" + day(i)] = { steps: { [s]: 1 }, done: 1, snap: [[s, "Read", 0, 0, 0]], paid: true };
  eq(R.streak(r.id, at(TODAY, "09:00")), 5, "the weekend is not scheduled, today not yet broken");
  delete log[r.id + "|" + day(-5)];
  eq(R.streak(r.id, at(TODAY, "09:00")), 2, "a missed weekday breaks it");
  log[r.id + "|" + day(-5)] = { steps: {}, rest: true, snap: [[s, "Read", 0, 0, 0]] };
  eq(R.streak(r.id, at(TODAY, "09:00")), 4, "a rest day keeps it");
  eq(R.setRest(r.id, true, { now: at(TODAY, "09:00") }).ok, false, "a second rest within seven days is refused");
  delete log[r.id + "|" + day(-5)];
  log[r.id + "|" + day(-5)] = { steps: { [s]: 1 }, done: 1, snap: [[s, "Read", 0, 0, 0]], paid: true };
  eq(R.setRest(r.id, true, { now: at(TODAY, "22:00") }).why, "Its window has closed for today.", "not after the window");
  eq(R.setRest(r.id, true, { now: at(TODAY, "09:00"), day: day(-1) }).ok, false, "not for a past day");
  assert(R.setRest(r.id, true, { now: at(TODAY, "09:00") }).ok, "planned ahead today");
  eq(R.stateOn(r, TODAY, at(TODAY, "23:00")), "rest", "today is a rest day");
  eq(R.streak(r.id, at(TODAY, "23:00")), 5, "and the run holds");
  const sum = R.summary(r.id, day(-7), day(-1), at(TODAY, "09:00"));
  eq([sum.kept, sum.scheduled], [5, 5], "kept of scheduled");
  R.remove(r.id);
});

step("G · late ticks count for last night", () => {
  const ev = R.fromTemplate("evening", { remind: false });
  const last = TODAY;                        // the evening of the 26th…
  const step0 = ev.steps[0].id, sleep = ev.steps[8].id;
  eq(R.routineDay(at(day(1), "00:40")), last, "00:40 belongs to the day before");
  assert(R.tick(ev.id, step0, true, { now: at(day(1), "00:40") }).ok, "ticked after midnight");
  assert(R.entry(ev.id, last).steps[step0], "…into last night");
  /* the next morning */
  const morn = at(day(1), "07:15");
  const ln = R.lastNight(morn).find((x) => x.id === ev.id);
  assert(ln && ln.check.some((c) => c.id === sleep), "Asleep by 00:00 is asked this morning");
  eq(ln.left.length, 6, "six of the seven required steps were left");
  assert(R.tick(ev.id, ev.steps[1].id, true, { now: morn, day: last }).ok, "a late tick lands on last night");
  assert(R.answerNo(ev.id, sleep, { now: morn }).ok, "No is recorded");
  assert(R.entry(ev.id, last).no[sleep], "…as no");
  eq(R.tick(ev.id, ev.steps[2].id, true, { now: at(day(1), "12:30"), day: last }).ok, false, "after noon it has closed");
  /* the Morning Review closing closes it too */
  K.store.state.dayReview = { v: 1, days: { [day(1)]: { morning: { state: "done" } } } };
  eq(R.canTick(ev, last, at(day(1), "08:00")), false, "closed once the morning review is done");
  delete K.store.state.dayReview;
  /* finishing last night late pays once, into the day it was ticked */
  const n0 = routineSessions().length;
  ev.steps.filter((s) => !s.optional && !s.checkMorning).forEach((s) => R.tick(ev.id, s.id, true, { now: morn, day: last }));
  eq(R.stateOn(R.get(ev.id), last, morn), "done", "last night is kept");
  eq(routineSessions().length, n0 + 1, "paid once");
  eq(routineSessions().slice(-1)[0].metrics.late, true, "marked late");
  R.remove(ev.id);
});

step("H · the merge folds two devices per step", () => {
  const base = { routines: { items: [{ id: "r_a", name: "A", steps: [{ id: "s1" }, { id: "s2" }], updatedAt: 1 }], log: {} } };
  const local = JSON.parse(JSON.stringify(base)), remote = JSON.parse(JSON.stringify(base));
  local.routines.log["r_a|" + TODAY] = { steps: { s1: 10 }, snap: [["s1", "a"], ["s2", "b"]] };
  remote.routines.log["r_a|" + TODAY] = { steps: { s2: 20 }, snap: [["s1", "a"], ["s2", "b"]] };
  remote.routines.items.push({ id: "r_b", name: "B", steps: [], updatedAt: 2 });
  const out = K.cloudmerge.merge(base, local, remote).doc;
  eq(out.routines.log["r_a|" + TODAY].steps, { s1: 10, s2: 20 }, "both ticks");
  eq(out.routines.items.map((r) => r.id), ["r_a", "r_b"], "records by id");
});

step("I · goals and tools", async () => {
  assert(K.goals.typeDef("routine-days").id === "routine-days" && K.goals.typeDef("routine-streak").id === "routine-streak", "registered");
  let rows = null;
  const g = K.goals.add({ type: "habit-streak", title: "water", target: 10, params: { habit: 7 } });
  const g2 = K.goals.add({ type: "routine-streak", title: "water 2", target: 10, params: { routine: "h:7" } });
  K.goals.compute((e, r) => { rows = r; });
  const row = (id) => rows.find((r) => r.id === id);
  eq([row(g.id)._current, row(g2.id)._current], [3, 3], "the old goal follows the habit into its routine");
  K.goals.remove(g.id); K.goals.remove(g2.id);
  const list = await ex("routines_list", { templates: true });
  assert(!list.err && list.result.routines.some((r) => r.id === "h:7") && list.result.templates.length >= 3, "listed");
  const made = await ex("routine_add", { template: "sunday" });
  assert(!made.err && R.get(made.result.id), "made from a template");
  const hab = await ex("routine_tick_step", { id: "7", done: true });
  assert(!hab.err && hab.result.state === "done", "a habit ticked by its old id");
  await new Promise((res) => hab.undo.run(res));
  eq(R.stateOn(R.get("h:7"), R.routineDay()), "open", "undone");
  await new Promise((res) => made.undo.run(res));
  assert(!R.get(made.result.id), "the add undone");
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke100: " + failed + " failed" : "smoke100: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
