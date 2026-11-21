/* Kurenai OS — smoke198.test.js
   Neon's batch 6 (1E features): one failing-without-fix step per size M ticket.

   The claims:

     A · productivity#5   Reminders inspector: "Place in a free block" makes a
                          study block with Undo and shows "Placed HH:MM";
                          "Focus on this" opens Focus pre-filled without starting.

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

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 6).join("\n       ")); }
  }
  console.log(failed ? `\nSMOKE198 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE198 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
