/* Kurenai OS — smoke130.test.js
   Productivity's rewards with receipts (quality W1, RC21).

     A · ST-20: several streak milestones new at once pay only the highest,
         the lower ones recorded as reached without pay, and the note names
         the milestone paid once (it said "36-day streak" four times).
     B · HR-18 (decision B2): Home's Daily goal directives cannot be ticked
         by hand and pay nothing; they seal from evidence (an exam's
         revision time met, a study block's Focus done).
     C · HR-21: Home's one-tap reminder tick offers Undo, which puts the
         reminder back and reverses the pay through ONE correction entry
         (the todo session stays).
     D · PR-27: completing a REPEATING reminder can be undone (its date,
         alerts and sub-tasks come back) and leaves a completion history,
         kept through the normaliser.
     E · HR-21: Home's habit tick offers Undo the same way.
     F · PR-24: a routine kept at its minimum, then in full, is topped up by
         the difference once, never twice; unticking refunds nothing.
     G · PR-23 (decision B10): a routine with every step optional is refused.
     H · RC21: tick → untick → re-tick pays ONCE for a reminder, a habit, a
         routine step and a hand-ticked task.

   Run: node tools/smoke130.test.js */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, doc, today, day;
const $ = (s, r) => (r || doc).querySelector(s);
const $$ = (s, r) => Array.from((r || doc).querySelectorAll(s));
function click(n) { n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }
function G() { return K.store.state.governor; }
function last() { const L = K.store.state.sessions; return L[L.length - 1]; }
function count(type) { return K.store.state.sessions.filter((e) => e.type === type).length; }
function studyOn(date, id) {
  return { id, ts: Date.parse(date + "T10:00:00"), date, type: "flashcards", subject: "compsci", ref: "4.1.1.1", dur: 300, metrics: { cards: 5 }, award: { xp: 20, gold: 3 } };
}
function undoBtn() { return $("#toast button"); }

step("boot", async () => {
  app = await boot();
  K = app.KOS; doc = app.document;
  await app.settle();
  today = K.srs.todayISO();
  day = (n) => K.srs.addDays(today, n);
  K.store.state.sessions = [];
  K.store.save();
});

step("A · ST-20: only the highest new milestone pays, named once", async () => {
  const st = K.store.state;
  st.sessions = [];
  for (let i = 36; i >= 1; i--) st.sessions.push(studyOn(day(-i), 3000 + i));
  G().milestones = {};
  eq(K.sessions.streak(null), 36, "a 36-day run ending yesterday");
  K.sessions.log({ type: "todo", metrics: { item: "A tick" } });
  eq(last().award.gold, 1 + 30, "the tick's 1 gold and the 30-day bonus only");
  eq(K.governor.lastAward().notes, ["30-day streak"], "one note, naming the milestone paid");
  ["streak3", "streak7", "streak14", "streak30"].forEach((k) => assert(G().milestones[k], k + " recorded as reached"));
  assert(!G().milestones.streak60, "60 not reached");
  K.sessions.log({ type: "todo", metrics: { item: "Another tick" } });
  eq(last().award.gold, 1, "nothing again");
  st.sessions = [];
  K.store.save();
});

step("B · HR-18: the Daily goal pays nothing by hand and seals from evidence", async () => {
  const exam = K.calendar.addEvent({ type: "exam", title: "Physics mock", date: day(2), time: "09:00", subject: "compsci" });
  const blk = K.calendar.addEvent({ type: "study", title: "Graphs block", date: today, time: "16:00", endTime: "17:00", subject: "maths" });
  K.show("home"); await app.settle();
  const rows = $$("[data-ui~='habit.panel'] [data-ui~='habit.tick']");
  const row = rows.find((b) => /Physics mock/.test(b.getAttribute("aria-label") || ""));
  assert(row, "the exam's directive is on Home: " + rows.map((b) => b.getAttribute("aria-label")).join(" | "));
  const xp = G().xp, gold = G().gold, n = K.store.state.sessions.length;
  click(row); await app.settle();
  eq([G().xp, G().gold, K.store.state.sessions.length], [xp, gold, n], "a press pays and logs nothing");
  assert(typeof (K.todo.setChecked) !== "function", "no hand tick in the API");
  const item = () => K.todo.autoItems().find((a) => a.key === "ev" + exam.id);
  eq(item().done, false, "not sealed without evidence");
  /* the exam's revision time today, from Focus */
  K.sessions.log({ type: "focus", subject: "compsci", dur: 3 * 3600, metrics: { objective: "Revise for Physics mock", mins: 180, complete: true } });
  eq(item().done, true, "sealed once its revision time is met");
  eq(K.todo.isChecked("ev" + exam.id), true, "isChecked reads the same evidence");
  const b = () => K.todo.autoItems().find((a) => a.key === "blk" + blk.id);
  eq(b().done, false, "the block is open");
  K.sessions.log({ type: "focus", subject: "maths", dur: 3600, metrics: { mins: 60, complete: true } });
  eq(b().done, true, "a Focus session in its subject seals the block");
  K.calendar.deleteEvent(exam.id); K.calendar.deleteEvent(blk.id);
  K.store.state.sessions = [];
  K.store.save();
});

step("C · HR-21: Home's reminder tick has Undo, reversed by one correction", async () => {
  const r = K.reminders.add({ title: "Post the form", due: today });
  K.show("home"); await app.settle();
  const tick = $$("[data-ui~='home.reminder-tick']").find((b) => /Post the form/.test(b.getAttribute("aria-label")));
  assert(tick, "the reminder is on Home");
  G().hp = 50;                          /* below the cap, so the tick restores HP */
  const xp = G().xp, gold = G().gold, hp = G().hp;
  click(tick); await app.settle();
  eq(K.reminders.get(r.id).done, true, "completed");
  assert(G().hp > hp, "the tick restored HP");
  eq([G().xp - xp, G().gold - gold], [5, 1], "paid the trickle");
  const paid = last();
  eq(paid.type, "todo", "one todo session");
  const u = undoBtn();
  assert(u && /Undo/.test(u.textContent), "the toast offers Undo");
  click(u); await app.settle();
  eq(K.reminders.get(r.id).done, false, "back as it was");
  eq(K.reminders.get(r.id).completedAt, null, "no completion time");
  eq([G().xp, G().gold, G().hp], [xp, gold, hp], "the pay is reversed, HP included (no farming HP by tick and Undo)");
  const c = last();
  eq([c.type, c.metrics.xp, c.metrics.gold], ["correction", -5, -1], "through one correction entry");
  assert(K.store.state.sessions.some((e) => e.id === paid.id), "the session is never deleted");
  K.reminders.remove(r.id);
});

step("D · PR-27: a repeating reminder's completion can be undone and is recorded", async () => {
  const r = K.reminders.add({ title: "Water the plants", due: today, dueTime: "09:00", recur: "daily", alerts: [0] });
  K.reminders.subAdd(r.id, "Kitchen");
  K.reminders.subToggle(r.id, K.reminders.get(r.id).subs[0].id, true);
  K.reminders.get(r.id).alerted = { x: 1 };
  const before = JSON.parse(JSON.stringify(K.reminders.get(r.id)));
  const xp = G().xp;
  const res = K.reminders.completeUndoable(r.id);
  eq(res.item.due, day(1), "rolled to tomorrow");
  eq(res.item.completions.length, 1, "a completion is recorded");
  eq(res.prev.due, today, "the previous date is handed back");
  eq(res.prev.alerted, { x: 1 }, "and its alerts");
  eq(res.prev.subs[0].done, true, "and its sub-tasks");
  res.undo();
  const now = K.reminders.get(r.id);
  eq([now.due, now.alerted, now.subs[0].done, now.completions.length], [before.due, before.alerted, true, 0], "Undo restores it exactly");
  eq(G().xp, xp, "and the pay is reversed");
  /* the history survives an edit (the normaliser keeps it) */
  K.reminders.complete(r.id, true);
  K.reminders.update(r.id, { notes: "outside too" });
  eq(K.reminders.get(r.id).completions.length, 1, "kept through update");
  K.reminders.remove(r.id);
});

step("E · HR-21: Home's habit tick has Undo", async () => {
  const h = K.routines.addHabit("Stretch");
  K.show("home"); await app.settle();
  const tick = $$("[data-ui~='home.routine-tick']").find((b) => /Stretch/.test(b.getAttribute("aria-label")));
  assert(tick, "the habit is on Home");
  const rday = K.routines.routineDay();
  const xp = G().xp, gold = G().gold;
  click(tick); await app.settle();
  eq(K.routines.stateOn(h, rday), "done", "kept");
  assert(G().xp > xp, "paid");
  const u = undoBtn();
  assert(u && /Undo/.test(u.textContent), "the toast offers Undo");
  click(u); await app.settle();
  eq(K.routines.entry(h.id, rday), null, "the day back as it was");
  eq([G().xp, G().gold], [xp, gold], "the pay is reversed");
  eq(last().type, "correction", "through a correction entry");
  K.routines.remove(h.id);
});

step("F · PR-24: a minimum day kept in full is topped up once", async () => {
  const r = K.routines.add({ name: "Wind down", kind: "custom", days: [], steps: [{ text: "Teeth", minimum: true }, { text: "Read" }, { text: "Lights" }] });
  const s = K.routines.get(r.id).steps;
  const xp = G().xp, n = count("todo");
  let res = K.routines.tick(r.id, s[0].id, true);
  eq(res.state, "min", "the minimum");
  eq(G().xp - xp, 5, "the minimum's pay");
  K.routines.tick(r.id, s[1].id, true);
  res = K.routines.tick(r.id, s[2].id, true);
  eq(res.state, "done", "kept in full");
  const full = K.governor.routineAward({ req: 3 }).xp;
  eq(G().xp - xp, full, "topped up to the full award");
  eq(count("todo") - n, 2, "by one extra todo entry");
  K.routines.tick(r.id, s[2].id, false);
  eq(G().xp - xp, full, "unticking refunds nothing");
  K.routines.tick(r.id, s[2].id, true);
  eq([G().xp - xp, count("todo") - n], [full, 2], "never twice");
  K.routines.remove(r.id);
});

step("G · PR-23: every step optional is refused", async () => {
  const msg = "At least one step must be required";
  eq(K.routines.check([{ text: "a", optional: true }, { text: "b", optional: true }]), msg, "check says why");
  eq(K.routines.add({ name: "Never", kind: "custom", steps: [{ text: "a", optional: true }, { text: "b", optional: true }] }), null, "add refuses");
  const ok = K.routines.add({ name: "Fine", kind: "custom", steps: [{ text: "a" }, { text: "b", optional: true }] });
  assert(ok && ok.id, "one required step saves");
  eq(K.routines.update(ok.id, { steps: [{ text: "a", optional: true }] }), null, "update refuses");
  eq(K.routines.get(ok.id).steps.length, 2, "nothing written");
  assert(K.routines.update(ok.id, { name: "Still fine" }), "an edit without steps still saves");
  /* the editor says it and saves nothing */
  K.show("routines", { edit: ok.id }); await app.settle();
  const opt = $$("[data-ui~='routine.editor'] input[aria-label='Optional']");
  assert(opt.length === 2, "two optional switches: " + opt.length);
  opt.forEach((x) => { if (!x.checked) { x.checked = true; x.dispatchEvent(new app.window.Event("change", { bubbles: true })); } });
  await app.settle();
  click($("[data-ui~='routine.save']")); await app.settle();
  assert(/At least one step must be required/.test($("#toast").textContent), "the toast: " + $("#toast").textContent);
  assert(K.routines.get(ok.id).steps.some((x) => !x.optional), "the routine keeps a required step");
  K.routines.remove(ok.id);
});

step("H · RC21: tick → untick → re-tick pays once", async () => {
  /* a reminder */
  const r = K.reminders.add({ title: "Bin day" });
  let xp = G().xp;
  K.reminders.complete(r.id, true); K.reminders.complete(r.id, false); K.reminders.complete(r.id, true);
  eq(G().xp - xp, 5, "a reminder");
  /* a habit */
  const h = K.routines.addHabit("Floss");
  xp = G().xp;
  const sid = K.routines.get(h.id).steps[0].id;
  K.routines.tick(h.id, sid, true); K.routines.tick(h.id, sid, false); K.routines.tick(h.id, sid, true);
  eq(G().xp - xp, 5, "a habit");
  /* a routine step */
  const rt = K.routines.add({ name: "Morning", kind: "custom", days: [], steps: [{ text: "Up" }, { text: "Wash" }] });
  const st = K.routines.get(rt.id).steps;
  xp = G().xp;
  K.routines.tick(rt.id, st[0].id, true); K.routines.tick(rt.id, st[1].id, true);
  K.routines.tick(rt.id, st[1].id, false); K.routines.tick(rt.id, st[1].id, true);
  eq(G().xp - xp, K.governor.routineAward({ req: 2 }).xp, "a routine");
  /* a hand-ticked task (the old list) */
  K.store.state.todo.manual = [{ id: 901, text: "Old task", done: false }];
  xp = G().xp;
  K.todo.toggleManual(901, true, "Old task"); K.todo.toggleManual(901, false, "Old task"); K.todo.toggleManual(901, true, "Old task");
  eq(G().xp - xp, 5, "a task");
  K.store.state.todo.manual = [];
  /* an assignment marked complete, reopened, completed again */
  const as = K.assignments.add({ title: "Lab write-up", subject: "compsci", due: today });
  xp = G().xp;
  K.assignments.setStatus(as.id, "complete"); K.assignments.setStatus(as.id, "inProgress"); K.assignments.setStatus(as.id, "complete");
  eq(G().xp - xp, 5, "an assignment");
  eq(K.assignments.get(as.id).status, "complete", "(it really went back and forth)");
  eq(app.errors, [], "no page errors");
});

/* ---------- the review's findings on the RC21 work ---------- */
function ex(name, args) { return new Promise((res) => K.ai.tools.execute(name, args, (err, result, undo) => res({ err, result, undo }))); }
function corrections() { return K.store.state.sessions.filter((e) => e.type === "correction").length; }

step("I · an undone reminder gives back its place in the day's reward cap", async () => {
  K.store.state.reminders.rewardLog = {};
  for (let i = 0; i < 8; i++) {
    const r = K.reminders.add({ title: "Cycle " + i });
    K.reminders.completeUndoable(r.id).undo();
    K.reminders.remove(r.id);
  }
  const r = K.reminders.add({ title: "The real one" });
  eq(K.reminders.rewardState(K.reminders.get(r.id)).pays, true, "a real completion still pays after eight Undos");
  const xp = G().xp;
  K.reminders.complete(r.id, true);
  eq(G().xp - xp, 5, "and it is paid");
  K.reminders.remove(r.id);
});

step("J · an undone routine completion gives back its place in the eight a day", async () => {
  const made = [];
  for (let i = 0; i < 8; i++) {
    const h = K.routines.addHabit("Cycle habit " + i); made.push(h.id);
    const res = K.routines.tick(h.id, K.routines.get(h.id).steps[0].id, true);
    K.routines.undoTick(res.undo);
  }
  const h = K.routines.addHabit("The real habit"); made.push(h.id);
  const res = K.routines.tick(h.id, K.routines.get(h.id).steps[0].id, true);
  assert(res.award && res.award.xp > 0, "the real habit is paid: " + JSON.stringify(res.award));
  assert(!last().metrics.capped, "and not as capped");
  made.forEach((id) => K.routines.remove(id));
});

step("K · a tick undone at once is not the day's activity", async () => {
  K.store.state.sessions = [];
  const r = K.reminders.add({ title: "Undo me" });
  K.store.state.reminders.rewardLog = {};
  K.reminders.completeUndoable(r.id).undo();
  eq(K.sessions.hasActivity(today), false, "no activity left for the day-drain");
  K.reminders.complete(r.id, true);
  eq(K.sessions.hasActivity(today), true, "a kept tick still is");
  K.reminders.remove(r.id);
});

step("L · Undo runs once: a second press takes back nothing more", async () => {
  K.store.state.reminders.rewardLog = {};
  const r = K.reminders.add({ title: "Twice" });
  const g0 = [G().xp, G().gold, G().hp], c0 = corrections();
  const res = K.reminders.completeUndoable(r.id);
  res.undo(); res.undo();
  eq([G().xp, G().gold, G().hp], g0, "a reminder: back exactly to where it was");
  eq(corrections() - c0, 1, "one correction");
  K.reminders.remove(r.id);
  const h = K.routines.addHabit("Twice habit");
  const g1 = [G().xp, G().gold, G().hp], c1 = corrections();
  const t = K.routines.tick(h.id, K.routines.get(h.id).steps[0].id, true);
  eq(K.routines.undoTick(t.undo), true, "the first Undo runs");
  eq(K.routines.undoTick(t.undo), false, "the second does nothing");
  eq([G().xp, G().gold, G().hp], g1, "a habit: back exactly");
  eq(corrections() - c1, 1, "one correction");
  K.routines.remove(h.id);
});

step("M · Undo takes back only what its tick changed", async () => {
  const rt = K.routines.add({ name: "Evening", kind: "custom", days: [], steps: [{ text: "Teeth" }, { text: "Read", optional: true }] });
  const s = K.routines.get(rt.id).steps, rday = K.routines.routineDay();
  const t = K.routines.tick(rt.id, s[0].id, true);
  eq(t.state, "done", "kept");
  K.routines.tick(rt.id, s[1].id, true);
  K.routines.undoTick(t.undo);
  const e = K.routines.entry(rt.id, rday);
  assert(e && e.steps[s[1].id], "the optional step ticked after it survives the Undo");
  assert(!e.steps[s[0].id], "the undone step is unticked");
  assert(!e.paid, "and the day is no longer paid");
  K.routines.remove(rt.id);
  /* a repeating reminder completed twice; the FIRST completion undone */
  K.store.state.reminders.rewardLog = {};
  const r = K.reminders.add({ title: "Feed the cat", due: today, recur: "daily" });
  const first = K.reminders.completeUndoable(r.id);
  K.reminders.completeUndoable(r.id);
  eq(K.reminders.get(r.id).due, day(2), "rolled twice");
  first.undo();
  eq(K.reminders.get(r.id).due, day(2), "the second completion's date stays");
  eq(K.reminders.get(r.id).completions.length, 1, "only the first completion's record goes");
  K.reminders.remove(r.id);
});

step("N · a day paid in full on another device is never topped up again", async () => {
  const r = K.routines.add({ name: "Wind down 2", kind: "custom", days: [], steps: [{ text: "Teeth", minimum: true }, { text: "Read" }] });
  const s = K.routines.get(r.id).steps, rday = K.routines.routineDay();
  K.routines.tick(r.id, s[0].id, true);
  /* the other device's full pay for the same routine day, merged in */
  K.store.state.sessions.push({ id: 99001, ts: Date.now(), date: today, type: "todo", subject: null, ref: null, dur: null,
    metrics: { item: "Routine kept: Wind down 2", routine: r.id, rday, req: 2, min: false, kind: "custom" }, award: { xp: 20, gold: 2, hp: 2 } });
  const xp = G().xp, n = count("todo");
  const res = K.routines.tick(r.id, s[1].id, true);
  eq(res.state, "done", "kept in full here too");
  eq([G().xp - xp, count("todo") - n], [0, 0], "no top-up: the day was already paid in full");
  K.routines.remove(r.id);
});

step("O · a deadline with no topics seals from work in its subject", async () => {
  const ev = K.calendar.addEvent({ title: "NEA draft", date: day(2), type: "deadline", subject: "compsci" });
  const find = () => K.todo.autoItems().find((a) => a.kind === "ev" && a.ev && a.ev.title === "NEA draft");
  assert(find(), "the directive is offered");
  eq(find().done, false, "not sealed before the work");
  K.sessions.log({ type: "focus", subject: "compsci", dur: 1800, metrics: { complete: true, mode: "custom" } });
  eq(find().done, true, "sealed by half an hour of Computer Science");
  K.calendar.deleteEvent(ev.id);
});

step("P · the Assistant's Undo of a habit tick takes the pay back", async () => {
  const h = K.routines.addHabit("Assistant habit");
  const g = [G().xp, G().gold, G().hp];
  const res = await ex("routine_tick_step", { id: String(h.id), done: true });
  assert(!res.err, "the tool ran: " + JSON.stringify(res.err));
  assert(G().xp > g[0], "paid");
  await new Promise((ok) => res.undo.run(ok));
  eq([G().xp, G().gold, G().hp], g, "the Undo reverses the pay");
  const e = K.routines.entry(h.id, K.routines.routineDay());
  assert(!e || !e.paid, "and the day is not left paid");
  K.routines.remove(h.id);
});

step("Q · the study-block marks keep a fortnight, pruned off render", async () => {
  const m = K.store.state.todo.autoChecked = {};
  m[day(-30) + "|blk1"] = true; m[day(-15) + "|blk2"] = true; m[day(-3) + "|blk3"] = true; m[today + "|blk4"] = true;
  K.show("home"); await app.settle();
  eq(Object.keys(K.store.state.todo.autoChecked).length, 4, "a render prunes nothing");
  K.todo.pruneAuto(true);
  eq(Object.keys(K.store.state.todo.autoChecked).sort(), [day(-3) + "|blk3", today + "|blk4"].sort(), "older than 14 days go");
});

step("R · Help no longer says directives earn XP", async () => {
  const src = require("fs").readFileSync(require("path").join(__dirname, "../js/modules/help.js"), "utf8");
  assert(!/Ticks earn XP/.test(src), "the old line is gone");
  assert(/sealed by the work itself/.test(src), "it says how a directive is sealed");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke130: " + failed + " failed" : "smoke130: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
