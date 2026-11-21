/* Kurenai OS — smoke198.test.js
   Neon's batch 6 (1E features): one failing-without-fix step per size M ticket.

   The claims:

     A · productivity#5   Reminders inspector: "Place in a free block" makes a
                          study block with Undo and shows "Placed HH:MM";
                          "Focus on this" opens Focus pre-filled without starting.
     B · productivity#9   Calendar: "Skip this showing" on a repeating local
                          event skips one date (single record, Undo restores,
                          skipped detail says so, not offered on Google-linked).
     C · mind#3           Mind desk shows "Review my Mind cards (N due)" only
                          when due; runs the due cards outside Daily 15 using
                          FSRS rating without touching ui.daily or Focus.

   Run: node tools/smoke198.test.js                                         */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-11-21";
let app, K, D;
const q = (s, r) => (r || D).querySelector(s);
const qa = (s, r) => [...(r || D).querySelectorAll(s)];
const click = (n) => { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); };

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; D = app.document;
  await app.settle();
  eq(app.errors, [], "boot errors");
});

/* ---------------- A · productivity#5 ---------------- */
step("A · Reminders inspector offers Place in a free block (with Undo) and Focus on this (productivity#5)", async () => {
  const r = K.reminders.add({ title: "Revise sorting algorithms", due: TODAY });
  K.show("reminders", { id: r.id, section: "all" });
  await app.settle();

  const placeBtn = q("[data-ui~='rem.place']");
  const focusBtn = q("[data-ui~='rem.focus']");
  assert(placeBtn, "Place in a free block menu button is rendered");
  assert(focusBtn, "Focus on this button is rendered");

  /* Place in a free block -> creates study event, updates to Placed HH:MM, Undo removes it */
  const beforeCount = K.calendar.eventsOn(TODAY).filter((e) => e.type === "study" && e.title === r.title).length;
  eq(beforeCount, 0, "no study block yet");
  click(placeBtn); await app.settle();
  const menuItem = q("[data-ui~='ui.menu-panel'] [role='menuitem'], [role='menu'] [role='menuitem']");
  assert(menuItem, "a free-block menu item is offered");
  click(menuItem); await app.settle();

  const placed = K.calendar.eventsOn(TODAY).filter((e) => e.type === "study" && e.title === r.title);
  eq(placed.length, 1, "one study block created on today's calendar");
  const chip = q("[data-ui~='rem.placed']");
  assert(chip && chip.textContent === "Placed " + placed[0].time, "inspector shows Placed " + placed[0].time + ": " + (chip && chip.textContent));

  const undoBtn = qa("[data-ui~='shell.toast-row'] button").find((b) => /Undo/i.test(b.textContent));
  assert(undoBtn, "Undo toast action is shown");
  click(undoBtn); await app.settle();
  eq(K.calendar.eventsOn(TODAY).filter((e) => e.type === "study" && e.title === r.title).length, 0, "Undo removes the study block");
  assert(q("[data-ui~='rem.place']"), "Place button returns after Undo");

  /* Focus on this -> opens Focus pre-filled with title, never starts a session (invariant 4e) */
  click(q("[data-ui~='rem.focus']")); await app.settle();
  eq(K.currentNav().viewId, "focus", "navigated to Focus");
  const objIn = q("[data-ui~='focus.obj-in']");
  assert(objIn && objIn.value === r.title, "Focus objective pre-filled: " + (objIn && objIn.value));
  eq(K.focus.state(), "idle", "Focus did not auto-start (invariant 4e)");
  eq(app.errors, [], "no page errors");
});

/* ---------------- B · productivity#9 ---------------- */
step("B · Calendar: Skip this showing skips one date with Undo, shows skipped detail, and hides on Google-linked events (productivity#9)", async () => {
  /* 1. normalise keeps only valid ISO dates, sorted & unique; non-repeating clears skip */
  const n1 = K.calendar.normalise({ title: "Lab", date: TODAY, recur: "weekly", skip: ["2026-12-05", "bad", "2026-11-28", "2026-11-28"] });
  eq(n1.skip, ["2026-11-28", "2026-12-05"], "normalise keeps valid sorted unique ISO dates");
  const n2 = K.calendar.normalise({ title: "Once", date: TODAY, recur: "none", skip: ["2026-11-28"] });
  eq(n2.skip, [], "non-repeating clears skip");

  /* 2. repeating local event: Skip this showing removes only that date from one record, Undo restores */
  const nextWk = K.srs.addDays(TODAY, 7);
  const ev = K.calendar.addEvent({ title: "Weekly seminar", type: "lesson", date: TODAY, time: "14:00", durationMins: 60, recur: "weekly" });
  const beforeLen = K.store.state.calendar.events.length;
  eq(K.calendar.occursOn(ev, TODAY), true, "occurs on first date");
  eq(K.calendar.occursOn(ev, nextWk), true, "occurs next week");

  K.show("calendar"); await app.settle();
  K.calendar.eventDetail(ev, TODAY); await app.settle();
  const skipBtn = q("[data-ui~='cal.skip']");
  assert(skipBtn, "Skip this showing button is offered on local repeating event");
  click(skipBtn); await app.settle();

  const updated = K.calendar.getEvent(ev.id);
  eq(K.store.state.calendar.events.length, beforeLen, "still ONE record (invariant 43)");
  eq(updated.skip, [TODAY], "date recorded in skip");
  eq(K.calendar.occursOn(updated, TODAY), false, "skipped date no longer occurs");
  eq(K.calendar.occursOn(updated, nextWk), true, "next week still occurs");
  eq(K.calendar.eventsOn(TODAY).some((x) => x.id === ev.id), false, "absent from eventsOn(skippedDate)");

  /* 3. detail of the skipped date says so */
  K.calendar.eventDetail(updated, TODAY); await app.settle();
  const skipNote = q("[data-ui~='cal.skipped-note']");
  assert(skipNote && /Skipped/.test(skipNote.textContent), "detail of skipped date says so: " + (skipNote && skipNote.textContent));
  assert(!q("[data-ui~='cal.skip']"), "Skip button not shown when already skipped");
  qa(".k-dialog-overlay").forEach((o) => o.close ? o.close() : o.remove());

  /* Undo restores the showing */
  const undoBtn = qa("[data-ui~='shell.toast-row'] button").find((b) => /Undo/i.test(b.textContent));
  assert(undoBtn, "Undo toast action is shown");
  click(undoBtn); await app.settle();
  const restored = K.calendar.getEvent(ev.id);
  eq(restored.skip, [], "Undo clears skip");
  eq(K.calendar.occursOn(restored, TODAY), true, "showing occurs again after Undo");

  /* 4. Google-linked repeating event does NOT offer Skip this showing (invariant 159) */
  const gev = K.calendar.addEvent({ title: "Google weekly", type: "personal", date: TODAY, time: "16:00", recur: "weekly", ext: { g: { id: "gcal123" } } });
  K.calendar.eventDetail(gev, TODAY); await app.settle();
  assert(!q("[data-ui~='cal.skip']"), "Skip not offered on Google-linked event (invariant 159)");
  qa(".k-dialog-overlay").forEach((o) => o.close ? o.close() : o.remove());
  eq(app.errors, [], "no page errors");
});

/* ---------------- C · mind#3 ---------------- */
step("C · Mind desk offers Review my Mind cards (N due) only when due and runs them outside Daily 15 (mind#3)", async () => {
  K.store.state.mind = K.mind.normalise({});
  if (K.store.state.ui && K.store.state.ui.mind) delete K.store.state.ui.mind.daily;
  K.store.save();

  /* 0 due -> entry is absent */
  K.show("subject", "mind"); await app.settle();
  assert(!q("[data-ui~='mind.review-cards']"), "hidden when 0 Mind cards are due");

  /* Seed 2 due cards -> entry appears and desk draw writes nothing */
  const cid = K.mind.concepts()[0].id;
  K.mind.introduce(cid, K.srs.addDays(TODAY, -2));
  K.store.save();
  const dueBefore = K.mind.due(TODAY, true);
  assert(dueBefore.length >= 2, "seeded due cards: " + dueBefore.length);
  const snap = JSON.stringify(K.store.state.mind);
  K.show("subject", "mind"); await app.settle();
  eq(JSON.stringify(K.store.state.mind), snap, "drawing Mind desk writes nothing (invariant 137)");

  const btn = q("[data-ui~='mind.review-cards']");
  assert(btn && btn.textContent.includes("Review my Mind cards (" + dueBefore.length + " due)"), "desk shows Review my Mind cards (N due): " + (btn && btn.textContent));

  /* Open standalone card review -> ui.daily untouched, Focus idle */
  const sessBefore = K.sessions.all().filter((s) => s.type === "mind" && s.metrics && s.metrics.kind === "reviews").length;
  click(btn); await app.settle();
  eq(K.currentNav().viewId, "mind", "on mind view");
  eq(K.currentNav().arg, { page: "cards" }, "on #/mind/cards");
  assert(!(K.store.state.ui && K.store.state.ui.mind && K.store.state.ui.mind.daily), "ui.daily untouched");
  eq(K.focus.state(), "idle", "no Focus stopwatch started");

  /* Rate every due card through the shared FSRS stage */
  for (let i = 0; i < dueBefore.length; i++) {
    assert(q("[data-ui~='mind.review-card']"), "card " + (i + 1) + " rendered");
    click(q("[data-ui~='mind.show-answer']")); await app.settle();
    const good = q("[data-ui~='mind.grade'][data-grade='good']");
    assert(good, "Good rating button rendered");
    click(good); await app.settle();
  }
  assert(q("[data-ui~='mind.cards-done']"), "completion screen rendered");
  eq(K.mind.due(TODAY, true).length, 0, "all due cards rescheduled via FSRS");
  const sessAfter = K.sessions.all().filter((s) => s.type === "mind" && s.metrics && s.metrics.kind === "reviews").length;
  eq(sessAfter, sessBefore + 1, "one mind review ledger entry logged");
  assert(!(K.store.state.ui && K.store.state.ui.mind && K.store.state.ui.mind.daily), "ui.daily still untouched after finish");

  /* Returning to Mind desk hides the entry and does not double-log on dispose */
  K.show("subject", "mind"); await app.settle();
  assert(!q("[data-ui~='mind.review-cards']"), "hidden once all cards are reviewed");
  eq(K.sessions.all().filter((s) => s.type === "mind" && s.metrics && s.metrics.kind === "reviews").length, sessBefore + 1, "no double-log on dispose");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 6).join("\n       ")); }
  }
  console.log(failed ? `\nSMOKE198 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE198 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
