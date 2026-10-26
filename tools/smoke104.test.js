/* Kurenai OS — smoke104.test.js
   Routines and the Daily Review on screen (roadmap 5.10, design turn 33,
   frames 33a–33v; invariants 142–149).

   The claims:

     A · THE PAGE READS: every Routines tab and the editor render with no
         error and write nothing; #/tasks still lands on Routines.
     B · THE REVIEW SHEET: it opens on the slot that is due with its steps;
         Next moves; Later minimises it to the header chip and keeps the
         place; Skip review marks it skipped and nothing else.
     C · THE FIRST TIME IT WAITS: a review never opens by itself until one
         has been opened once, then it does, once per slot.
     D · TRIAGE THROUGH THE OWNER: a choice in Unfinished moves the
         reminder; "Use these three" sets today's three, written only on
         the click.
     E · THE PLAYER PAYS ONCE: Done through every step keeps the routine,
         one session; the routine's habit-ticks on Home go through
         KOS.routines.
     F · ABOUT TO STUDY: the Focus page's Start with no objective opens the
         sheet; its Start hands the first action to the session as its
         objective; with an objective on the form it starts straight away.
     G · HOME: Today's three in the hero with Start, the real Routines card.
     H · DERIVED SURFACES: the assignment form asks nothing about where it
         shows; Pin to countdowns works from the page; routine chips are in
         the week view but not the month grid; Reminders' Today lists the
         plan's rows as "From your plan" and ticks them in the plan; a goal
         pins from its page; a week's report carries the Routines card.
     I · HABITS: Routines has no week grid (History has it, read-only, with
         no tick or add); a habit's name opens its editor, which saves a
         schedule and an auto-tracking rule; the Calendar's derived
         switches sit in its Show menu, not a card.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke104.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-10-21";               // a Wednesday
let app, K, doc;
const $ = (s) => doc.querySelector(s);
const $$ = (s) => [...doc.querySelectorAll(s)];
function click(n) { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }
/* the state without ui (navigating records the view there) */
function snap() { const c = Object.assign({}, K.store.state); delete c.ui; return JSON.stringify(c); }
function govSessions() { return K.store.state.sessions.length; }

step("boot", async () => {
  app = await boot({ clock: TODAY + "T16:40:00" });
  K = app.KOS; doc = app.document;
  const R = K.routines;
  R.fromTemplate("morning", { remind: true });
  R.fromTemplate("evening", { remind: true });
  R.fromTemplate("afterschool", { remind: true });
  R.fromTemplate("study");
  ["Water", "Stretch"].forEach((t) => R.addHabit(t));
  K.reminders.add({ title: "Email Mr Hart", due: TODAY, dueTime: "15:00" });
  K.assignments.add({ title: "Stats homework", subject: "maths", due: K.srs.addDays(TODAY, 1), estimateMins: 45 });
  K.store.save();
  eq(app.errors, [], "boot errors");
});

step("A · the page reads", async () => {
  const before = snap();
  for (const tab of [undefined, "routines", "templates", "history", "settings"]) {
    K.show("routines", tab); await app.settle();
    assert($("[data-ui~='routine.page']"), "the page for " + (tab || "today"));
  }
  K.show("routines", { edit: K.routines.all()[0].id }); await app.settle();
  assert($("[data-ui~='routine.editor']"), "the editor");
  eq(snap(), before, "drawing every tab wrote nothing");
  K.show("tasks"); await app.settle();
  assert($("[data-ui~='routine.page']"), "#/tasks lands on Routines");
  eq(app.errors, [], "no errors");
});

step("B · the review sheet", async () => {
  K.show("home"); await app.settle();
  K.reviewSheet.open(); await app.settle();
  const sheet = $("[data-ui~='review.sheet']");
  assert(sheet && sheet.getAttribute("data-slot") === "afternoon", "the afternoon is due at 16:40");
  const tabs = $$("[data-ui~='review.step-tab']");
  assert(tabs.length >= 2, "its steps: " + tabs.length);
  click($("[data-ui~='review.next']")); await app.settle();
  eq($("[data-ui~='review.body']").getAttribute("data-step") !== tabs[0].textContent, true, "Next moves");
  click($("[data-ui~='review.later']")); await app.settle();
  assert(!$("[data-ui~='review.sheet']"), "Later closes it");
  eq(K.store.state.ui.review.minimised.slot, "afternoon", "minimised, with its place");
  assert($("[data-ui~='review.chip']"), "the chip carries it");
  const n = govSessions(), before = JSON.stringify(K.store.state.governor);
  K.reviewSheet.open("afternoon"); await app.settle();
  click($("[data-ui~='review.skip']")); await app.settle();
  eq(K.dayReview.day(K.routines.routineDay()).afternoon.state, "skipped", "skipped");
  eq([govSessions(), JSON.stringify(K.store.state.governor)], [n, before], "a skip pays and logs nothing");
});

step("C · the first time it waits", async () => {
  const fresh = await boot({ clock: TODAY + "T07:05:00" });
  fresh.KOS.reviewSheet.maybeOpen(); await fresh.settle();
  assert(!fresh.document.querySelector("[data-ui~='review.sheet']"), "never opened before: it waits in the chip");
  assert(fresh.document.querySelector("[data-ui~='review.chip']"), "the chip shows it");
  fresh.KOS.reviewSheet.open("morning"); await fresh.settle();
  fresh.KOS.reviewSheet.close(); await fresh.settle();
  delete fresh.KOS.store.state.ui.review.minimised;
  delete fresh.KOS.store.state.ui.review.lastShown;
  fresh.KOS.reviewSheet.maybeOpen(); await fresh.settle();
  assert(fresh.document.querySelector("[data-ui~='review.sheet']"), "once opened before, it opens by itself");
  fresh.KOS.reviewSheet.close(); await fresh.settle();
  fresh.KOS.reviewSheet.maybeOpen(); await fresh.settle();
  assert(!fresh.document.querySelector("[data-ui~='review.sheet']"), "but once per slot");
  eq(fresh.errors, [], "no errors");
});

step("D · triage through the owner, and Use these three", async () => {
  const rem = K.reminders.all().find((r) => r.title === "Email Mr Hart");
  K.reviewSheet.open("evening"); await app.settle();
  const tabs = $$("[data-ui~='review.step-tab']");
  const i = tabs.findIndex((t) => /Unfinished/.test(t.textContent));
  assert(i >= 0, "an Unfinished step");
  click(tabs[i]); await app.settle();
  const row = $$("[data-ui~='review.triage']").find((r) => /Email Mr Hart/.test(r.textContent));
  assert(row, "the overdue reminder is in it");
  const before = snap();
  const tomorrow = [...row.querySelectorAll("[role=radio]")].find((b) => /Tomorrow/.test(b.textContent));
  click(tomorrow); await app.settle();
  eq(K.reminders.get(rem.id).due, K.srs.addDays(TODAY, 1), "moved by its owner");
  assert(snap() !== before, "and written");
  K.reviewSheet.close(true);
  K.reviewSheet.open("morning", { step: 0 }); await app.settle();
  const tabs2 = $$("[data-ui~='review.step-tab']");
  const j = tabs2.findIndex((t) => /Three/.test(t.textContent));
  click(tabs2[j]); await app.settle();
  const three0 = JSON.stringify((K.dayReview.day(K.routines.routineDay()).morning || {}).three || []);
  assert($$("[data-ui~='review.three-offer']").length > 0, "suggestions offered");
  eq(JSON.stringify((K.dayReview.day(K.routines.routineDay()).morning || {}).three || []), three0, "nothing written by showing them");
  click($("[data-ui~='review.three-use']")); await app.settle();
  assert(K.dayReview.day(K.routines.routineDay()).morning.three.length > 0, "set on the click");
  K.reviewSheet.close(true);
});

step("E · the player pays once", async () => {
  /* plain steps (a step linked to Focus would hand over to About to Study instead) */
  const r = K.routines.add({ name: "Tidy desk", kind: "custom", days: [], steps: [{ text: "Clear" }, { text: "Wipe" }, { text: "Stack books" }] });
  const n = K.store.state.sessions.filter((e) => e.metrics && e.metrics.routine === r.id).length;
  K.routinePlayer.open(r.id); await app.settle();
  for (let k = 0; k < 6 && $("[data-ui~='player.done']"); k++) { click($("[data-ui~='player.done']")); await app.settle(); }
  assert($("[data-ui~='player.finished']"), "the done screen");
  eq(K.routines.stateOn(r, K.routines.routineDay()), "done", "kept");
  eq(K.store.state.sessions.filter((e) => e.metrics && e.metrics.routine === r.id).length, n + 1, "one session");
  click($("[data-ui~='player.close-done']")); await app.settle();
});

step("F · About to Study", async () => {
  K.store.state.ui.focusPreflight = true;
  K.show("focus"); await app.settle();
  click($("[data-ui~='focus.start']")); await app.settle();
  assert($("[data-ui~='preflight.sheet']"), "no objective on the form: the sheet opens");
  const act = $("[data-ui~='preflight.action']");
  act.value = "Open the stats sheet and do Q1";
  click($("[data-ui~='preflight.start']")); await app.settle();
  const s = K.focus.session();
  assert(s && s.objective === "Open the stats sheet and do Q1", "the first action is the objective: " + (s && s.objective));
  K.focus.endEarly(); await app.settle();
  [...doc.querySelectorAll(".k-dialog-overlay")].forEach((o) => o.remove());
  /* the form already holding the first action is the pre-flight */
  const f2 = await boot({ clock: TODAY + "T16:40:00" });
  f2.KOS.show("focus"); await f2.settle();
  f2.document.querySelector("[data-ui~='focus.obj-in']").value = "Already planned";
  f2.document.querySelector("[data-ui~='focus.start']").dispatchEvent(new f2.window.MouseEvent("click", { bubbles: true })); await f2.settle();
  assert(!f2.document.querySelector("[data-ui~='preflight.sheet']") && f2.KOS.focus.session(), "an objective on the form starts straight away");
  eq(f2.KOS.focus.session().objective, "Already planned", "with it as the objective");
});

step("G · Home", async () => {
  K.show("home"); await app.settle();
  assert($("[data-ui~='home.three-start']"), "Today's three with its Start in the hero");
  assert($("[data-ui~='habit.panel']"), "the hero's goal panel is still there");
  const card = $("[data-ui~='home.routines']");
  assert(card && /All routines/.test(card.textContent), "the Routines card");
  const tick = card.querySelector("[data-ui~='home.routine-tick']");
  assert(tick, "a habit tick");
  const h = K.routines.all({ kind: "habit" })[0];
  const was = K.routines.stateOn(h, K.routines.routineDay());
  click(tick); await app.settle();
  assert(K.routines.stateOn(h, K.routines.routineDay()) !== was, "ticked through KOS.routines");
});

step("H · derived surfaces", async () => {
  /* the assignment form */
  K.show("assignments"); await app.settle();
  const a = K.assignments.all()[0];
  const form = (() => { const btn = $$("button").find((b) => /New assignment|Add assignment|＋/.test(b.textContent)); return btn; })();
  if (form) { click(form); await app.settle(); }
  const modal = $("[data-ui~='asg.modal']");
  if (modal) {
    assert(!/Show the deadline on the Calendar|major deadline/i.test(modal.textContent), "the form asks nothing about where it shows");
    assert(modal.querySelector("[data-ui~='asg.where']"), "it says where it shows");
    modal.parentNode.remove();
  }
  eq(K.assignments.isMajor(a), true, "due tomorrow: it counts down");
  K.assignments.pinCountdown(a.id, false);
  eq(K.assignments.isMajor(K.assignments.get(a.id)), false, "unpinned");
  K.assignments.pinCountdown(a.id, true);
  /* the calendar: routines in the week, not in the month grid */
  K.store.state.ui.calendar = Object.assign({}, K.store.state.ui.calendar || {}, { mode: "month" });
  K.show("calendar"); await app.settle();
  const today = $("[data-ui~='cal.cell'][data-state~='today']");
  assert(today && !today.querySelector("[data-kind='routine']"), "no routine chips in the month grid");
  /* reminders: the plan's rows, derived */
  const wk = K.pacing.dueThisWeek();
  if (wk.rows.length || wk.carried.length) {
    K.store.state.ui.reminders = Object.assign({}, K.store.state.ui.reminders || {}, { section: "today", listId: null, tag: null, priority: "" });
    K.show("reminders"); await app.settle();
    const pr = $("[data-ui~='rem.plan-row']");
    assert(pr && /From your plan/.test(pr.textContent), "From your plan rows");
    const id = (wk.carried[0] || {}).entry ? wk.carried[0].entry.id : wk.rows[0].id;
    click(pr.querySelector("[data-ui~='rem.plan-check']")); await app.settle();
    eq(K.pacing.entryById(id).done, true, "ticked in the plan");
  }
  /* a goal pinned from its page */
  const g = K.goals.add({ type: "custom-manual", title: "Pin me", target: 5 });
  K.show("goals", { id: g.id }); await app.settle();
  click($("[data-ui~='goal.pin']")); await app.settle();
  eq(K.goals.get(g.id).pinned, true, "pinned");
  /* a week's report with routines */
  const p = { period: "week", start: "2026-10-12", end: "2026-10-18", id: "w" };
  const f = K.report.compute({ ledger: [], rows: [], tally: {}, reminders: [], habits: [],
    routineDays: [{ id: "r", name: "Morning Routine", mark: "朝", kind: "morning", states: ["done", "done", "missed", "done", "rest", "off", "off"] }],
    reviewDays: { "2026-10-13": { morning: { state: "done" }, evening: { state: "done", mood: 4, energy: 2 } }, "2026-10-14": { evening: { state: "done", mood: 3, energy: 3 } } } }, p);
  eq([f.routines.kept, f.routines.of, f.routines.rows[0].rest, f.routines.reviews.evening, f.routines.mood], [3, 4, 1, 2, 3.5], "the Routines facts");
  const pay = JSON.stringify(K.reportWords.payload({ facts: Object.assign({ study: { bySubject: {}, sessions: 0, days: 0, of: 7 } }, f) }));
  assert(pay.indexOf("mood") === -1 && pay.indexOf("energy") === -1 && /routines_kept/.test(pay), "the payload: totals, never mood or energy");
  eq(app.errors, [], "no errors");
});

step("I · habits", async () => {
  const R = K.routines;
  K.show("routines", "routines"); await app.settle();
  assert(!$("[data-ui~='routine.habit-grid']"), "no week grid on Routines");
  K.show("routines", "history"); await app.settle();
  const grid = $("[data-ui~='routine.habit-grid']");
  assert(grid, "History has the week");
  assert(!grid.querySelector("button[data-ui~='routine.grid-tick']") && !grid.querySelector("input"), "read-only: no tick, no add");
  assert($$("[data-ui~='routine.history-row']").length >= 2, "a card per routine");
  K.show("routines"); await app.settle();
  const water = R.all({ kind: "habit" }).find((h) => h.name === "Water");
  click($$("[data-ui~='routine.habit-edit']").find((b) => /Water/.test(b.textContent))); await app.settle();
  const ed = $("[data-ui~='habit.editor']");
  assert(ed, "the editor opens");
  click([...ed.querySelectorAll("[data-ui~='habit.repeat']")].find((b) => /Weekdays/.test(b.textContent)));
  const src = ed.querySelector("[data-ui~='habit.auto-src']");
  src.value = "cards"; src.dispatchEvent(new app.window.Event("change", { bubbles: true }));
  const n = ed.querySelector("[data-ui~='habit.auto-n']");
  n.value = "15"; n.dispatchEvent(new app.window.Event("input", { bubbles: true }));
  click(ed.querySelector("[data-ui~='habit.save']")); await app.settle();
  const w = R.get(water.id);
  eq([w.days, w.auto], [[1, 2, 3, 4, 5], { src: "cards", n: 15 }], "the schedule and the rule saved");
  K.show("calendar"); await app.settle();
  assert(!$("[data-ui~='cal.derived-toggle']"), "no derived card on the page");
  click($$("[data-ui~='ui.menu-button']").find((b) => /Show/.test(b.textContent))); await app.settle();
  assert(doc.querySelectorAll("[data-ui~='cal.derived-toggle']").length >= 2, "the switches are in the Show menu");
  K.ui.closeMenu();
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke104: " + failed + " failed" : "smoke104: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
