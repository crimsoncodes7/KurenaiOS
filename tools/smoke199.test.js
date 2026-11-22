/* Kurenai OS — smoke199.test.js
   User-directed feature & customisation branch (neon/user-custom-1).
   Run:
     node tools/smoke199.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const ROOT = path.resolve(__dirname, "..");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b));
  }
}

let app, K, doc;
const q = (s) => doc.querySelector(s);
const qa = (s) => [...doc.querySelectorAll(s)];
function click(n) { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }

step("boot", async () => {
  app = await boot({ clock: "2026-11-22T13:00:00" });
  K = app.KOS; doc = app.document;
  eq(app.errors, [], "boot errors");
});

/* ---------------- A · U1 Kurenai panel centring, aura & animation clipping ---------------- */
step("A · Kurenai panel centres figure, aligns aura behind body, and prevents animation clipping (U1)", () => {
  const css = fs.readFileSync(path.join(ROOT, "css/views/assistant.css"), "utf8");

  const presence = css.match(/\.k-asst-presence\s*\{[^}]*\}/);
  assert(presence && /radial-gradient\([^)]*at\s+50%\s+4[5-9]%/.test(presence[0]),
    "presence radial aura should centre behind her body (50% 45–49%), got: " + (presence && presence[0]));

  const stage = css.match(/\.k-asst-stage\s*\{[^}]*\}/);
  assert(stage && /padding-block-start:\s*var\(--sp-/.test(stage[0]),
    "stage reserves top headroom with a spacing token, got: " + (stage && stage[0]));

  const frame = css.match(/\.k-asst-stage\s+\.k-asst-mascot-frame\s*\{[^}]*\}/);
  assert(frame && /margin-block:\s*auto/.test(frame[0]),
    "stage mascot frame vertically centres with margin-block: auto, got: " + (frame && frame[0]));
  assert(frame && /overflow:\s*visible/.test(frame[0]),
    "stage mascot frame allows overflow: visible so idle animation never clips her head, got: " + (frame && frame[0]));
  assert(frame && /max-block-size:\s*calc\(100%\s*-\s*var\(--sp-/.test(frame[0]),
    "stage mascot frame reserves headroom via max-block-size calc, got: " + (frame && frame[0]));

  const aura = css.match(/\.k-asst-stage\s+\.k-asst-mascot-frame::before\s*\{[^}]*\}/);
  assert(aura && /inset:\s*14%\s+-8%\s+14%/.test(aura[0]),
    "stage aura sits centred behind her body without clipping on narrow frame edges, got: " + (aura && aura[0]));

  const drawerFrame = css.match(/\.k-asst-drawer\[data-state~="is-empty"\]\s+\.k-asst-mascot-frame\s*\{[^}]*\}/);
  assert(drawerFrame && /overflow:\s*visible/.test(drawerFrame[0]),
    "empty drawer mascot frame prevents head clipping too, got: " + (drawerFrame && drawerFrame[0]));
});

/* ---------------- B · U2 Home hero lighter blue overlay ---------------- */
step("B · Home hero lightens blue scrim overlay and lets artwork breathe in Graphite and Dawn (U2)", () => {
  const tokens = fs.readFileSync(path.join(ROOT, "css/tokens.css"), "utf8");
  const themes = fs.readFileSync(path.join(ROOT, "css/themes.css"), "utf8");
  const home = fs.readFileSync(path.join(ROOT, "css/views/home.css"), "utf8");

  assert(/--home-art-op:\s*0\.8\d/.test(tokens), "tokens.css defines raised --home-art-op for Graphite");
  assert(/--home-art-op:\s*0\.6\d/.test(themes), "themes.css defines raised --home-art-op for Dawn");
  assert(/\.k-home-hero\s*>\s*\.k-art\s*\{[^}]*--art-op:\s*var\(--home-art-op\)/.test(home),
    "home.css binds --art-op: var(--home-art-op) on .k-home-hero > .k-art");

  const duskScrim = tokens.match(/--home-hero-scrim:\s*([^;]+);/);
  assert(duskScrim, "Graphite --home-hero-scrim exists");
  const duskPeak = Math.max(...[...duskScrim[1].matchAll(/\/\s*(0?\.\d+)\)/g)].map((m) => parseFloat(m[1])));
  assert(duskPeak <= 0.55, "Graphite --home-hero-scrim peak alpha should be lightened (<= 0.55), got " + duskPeak);

  const dawnScrim = themes.match(/--home-hero-scrim:\s*([^;]+);/);
  assert(dawnScrim, "Dawn --home-hero-scrim exists");
  const dawnPeak = Math.max(...[...dawnScrim[1].matchAll(/\/\s*(0?\.\d+)\)/g)].map((m) => parseFloat(m[1])));
  assert(dawnPeak <= 0.60, "Dawn --home-hero-scrim peak alpha should be lightened (<= 0.60), got " + dawnPeak);
});

/* ---------------- C · U3 Home Routines (4 habits + smart rotation) & Reminders (3 rows) ---------------- */
step("C · Home shows 4 habits with smart rotation on completion and 3 reminders (U3)", async () => {
  const R = K.routines;
  const today = K.srs.todayISO();
  K.store.state.welcome = { seen: true, mode: "own" };
  /* Add a routine due now (clock is 13:00) so dueNow is active */
  R.add({
    name: "Midday Reset", kind: "custom", mark: "昼", tone: "teal",
    days: [0, 1, 2, 3, 4, 5, 6], window: { from: "12:00", to: "15:00" },
    steps: [{ title: "Step 1" }]
  });
  const names = ["H1 Water", "H2 Read", "H3 Stretch", "H4 Anki", "H5 Desk", "H6 Walk"];
  names.forEach((n) => R.add({ name: n, kind: "habit", days: [0, 1, 2, 3, 4, 5, 6], steps: [{ title: n }] }));
  ["R1 One", "R2 Two", "R3 Three", "R4 Four", "R5 Five"].forEach((t, i) => {
    K.reminders.add({ title: t, due: K.srs.addDays(today, i - 1) });
  });
  K.store.save();

  K.show("home"); await app.settle();
  const snap = () => { const c = Object.assign({}, K.store.state); delete c.ui; return JSON.stringify(c); };
  const beforeRender = snap();
  K.rerender(); await app.settle();
  eq(snap(), beforeRender, "Home render writes nothing");

  const habitNames = () => qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']").map((n) => (n.getAttribute("aria-label") || "").replace(/^(?:Tick|Untick) /, "").replace(/ for today$/, ""));
  assert(q("[data-ui~='home.routine-now']"), "dueNow routine is active");
  eq(habitNames(), ["H1 Water", "H2 Read", "H3 Stretch", "H4 Anki"], "4 habits visible even when dueNow is active");

  /* Tick H1: completed habit rotates out, H5 surfaces into the 4 visible slots */
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  eq(habitNames(), ["H2 Read", "H3 Stretch", "H4 Anki", "H5 Desk"], "completed H1 rotated out and H5 surfaced");

  /* Tick H2 and H3: 3 undone remain (H4, H5, H6), so 1st completed (H1) backfills slot 4 */
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  eq(habitNames(), ["H4 Anki", "H5 Desk", "H6 Walk", "H1 Water"], "undone habits stay first and completed H1 backfills 4th slot");

  /* Tick remaining 3 undone: all 6 done -> first 4 completed stay cleanly populated */
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  eq(habitNames(), ["H1 Water", "H2 Read", "H3 Stretch", "H4 Anki"], "all done backfills all 4 slots");

  /* Reminders card shows 3 open rows and reports 3 of 5 */
  const remCard = q("[data-ui~='rem.sum']");
  assert(remCard && /3 of 5/.test(remCard.textContent), "Reminders meta reports 3 of 5: " + (remCard && remCard.textContent));
  eq(qa("[data-ui~='rem.sum'] [data-ui~='home.reminder-tick']").length, 3, "Reminders shows 3 rows on Home");
  eq(app.errors, [], "no page errors");
});

/* ---------------- D · U4 Pacing full customisation & 2-step Shift preview ---------------- */
step("D · Pacing shifts In class / Both with preview, Undo, and per-row customisation (U4)", async () => {
  const PC = K.pacing;
  PC.ensureSeeded();
  const S = PC.state();
  const govBefore = JSON.stringify(K.store.state.governor);
  const sessBefore = K.store.state.sessions.length;
  const snapAll = () => JSON.stringify({
    w: S.weeks.map((w) => [w.wb, w.schoolWk, w.personalWk]),
    e: S.entries.map((e) => [e.id, e.wb, e.wk, !!e.hidden, e.order == null ? null : e.order, e.day == null ? null : e.day])
  });
  const baseSnap = snapAll();

  /* 1. Shift In class (school) Maths +2 school weeks, stepping over breaks, leaving My plan & ticked rows anchored */
  assert(typeof PC.shiftPreview === "function", "KOS.pacing.shiftPreview exists");
  const schoolWks = PC.weeks().filter((w) => w.schoolWk != null).map((w) => w.wb);
  const mathsSchool = S.entries.filter((e) => e.source === "school" && e.subject === "maths" && !e.done && !e.hidden);
  const persSnap = S.entries.filter((e) => e.source === "personal").map((e) => e.id + "@" + e.wb).join(",");
  assert(mathsSchool.length >= 2 && schoolWks.length >= 4, "seeded plan has school maths rows");
  const m0 = mathsSchool[0], mTick = mathsSchool[1];
  mTick.done = true;
  const m0Idx = schoolWks.indexOf(m0.wb);
  const prev = PC.shiftPreview(2, { source: "school", subject: "maths" });
  eq(prev.moves.length, mathsSchool.length - 1, "preview counts unticked school maths rows");
  assert(prev.windowWeeks && prev.windowWeeks.length >= 2 && prev.windowWeeks.length <= 4, "preview builds 2–4 week window");
  eq(snapAll(), baseSnap, "shiftPreview is pure and writes nothing");

  const rSchool = PC.shiftPlan(2, { source: "school", subject: "maths" });
  eq(rSchool.moved, mathsSchool.length - 1, "shifted unticked school maths rows");
  eq(m0.wb, schoolWks[Math.min(m0Idx + 2, schoolWks.length - 1)], "school row stepped 2 school weeks over breaks");
  eq(m0.wk, PC.weekAt(m0.wb).schoolWk, "school row wk derived from destination schoolWk (invariant 84)");
  eq(S.entries.filter((e) => e.source === "personal").map((e) => e.id + "@" + e.wb).join(","), persSnap, "personal rows untouched");
  assert(!rSchool.undo.rows.some((u) => u[0] === mTick.id), "ticked school row stayed anchored");
  PC.undoShift(rSchool.undo);
  mTick.done = false;
  eq(snapAll(), baseSnap, "undoShift restored school rows and weeks exactly");

  /* 2. Shift Both including ticked and exam-planner rows, and earlier with from floor */
  const examRow = PC.addEntry({ source: "personal", subject: "maths", wb: schoolWks[3], title: "Exam drill", tag: "exam:ex1" });
  mTick.done = true;
  const rBoth = PC.shiftPlan(-2, { source: "both", subject: "maths", from: schoolWks[2], includeDone: true, includeExam: true });
  assert(rBoth.schoolMoved > 0 && rBoth.personalMoved > 0, "Both moved both school and personal rows");
  assert(rBoth.undo.rows.some((u) => u[0] === examRow.id), "includeExam moved exam-planner row");
  assert(S.entries.filter((e) => rBoth.undo.rows.some((u) => u[0] === e.id)).every((e) => e.wb >= schoolWks[2]), "floor respected");
  PC.undoShift(rBoth.undo);
  mTick.done = false;
  PC.removeEntry(examRow.id);
  eq(snapAll(), baseSnap, "undoShift restored Both shift cleanly");

  /* 3. Per-row customisation: moveEntryWeek, reorderEntry, setEntryDay, setHidden */
  const wbTest = m0.wb;
  const cAdd = PC.addEntry({ source: "school", subject: "maths", wb: wbTest, title: "Custom class row" });
  const beforeOrder = PC.entriesFor(wbTest, "maths", "school").map((e) => e.id);
  assert(beforeOrder.indexOf(cAdd.id) > 0, "added row sits after existing row");
  PC.reorderEntry(cAdd.id, -1);
  const afterOrder = PC.entriesFor(wbTest, "maths", "school").map((e) => e.id);
  assert(afterOrder.indexOf(cAdd.id) === beforeOrder.indexOf(cAdd.id) - 1, "reorderEntry moved row up");

  PC.setEntryDay(cAdd.id, 4);
  eq(PC.entryById(cAdd.id).day, 4, "setEntryDay stored weekday override");
  eq(PC.lessonPlan(PC.entryById(cAdd.id))[0].days, [4], "lessonPlan honours single-lesson class day override");

  const mvRes = PC.moveEntryWeek(cAdd.id, 1);
  assert(mvRes.ok && PC.entryById(cAdd.id).wb !== wbTest, "moveEntryWeek moved single class row +1 week");
  PC.moveEntryWeek(cAdd.id, wbTest);
  eq(PC.entryById(cAdd.id).wb, wbTest, "moveEntryWeek moved row back by wb");

  PC.setHidden(cAdd.id, true);
  assert(!PC.entriesFor(wbTest, "maths", "school").some((e) => e.id === cAdd.id), "hidden row omitted from entriesFor");
  assert(PC.entriesFor(wbTest, "maths", "school", { includeHidden: true }).some((e) => e.id === cAdd.id), "hidden row returned with includeHidden");
  PC.setHidden(cAdd.id, false);
  assert(PC.entriesFor(wbTest, "maths", "school").some((e) => e.id === cAdd.id), "unhidden row restored");
  PC.removeEntry(cAdd.id);

  /* 4. 2-step Shift UI (Configure -> Preview -> Back -> Confirm shift) + per-register + & row menu */
  K.show("pacing", { wb: wbTest }); await app.settle(); await app.settle();
  assert(qa("[data-ui~='pace.add-reg']").length >= 6, "per-register + buttons rendered across subjects");
  assert(qa("[data-ui~='pace.row-menu']").length >= 1, "row action menus rendered");

  click(q("[data-ui~='pace.shift']")); await app.settle();
  assert(q("[data-ui~='pace.shift-source']"), "Step 1 shows Register selector");
  assert(/Computer Science/.test(q("[data-ui~='pace.shift-subject']").textContent), "Subject uses Computer Science");
  assert(!q("[data-ui~='pace.shift-visual']"), "Step 1 does not crowd inline visual preview");
  const inClassBtn = [...qa("[data-ui~='pace.shift-source'] button")].find((b) => /In class/.test(b.textContent));
  click(inClassBtn); await app.settle();
  click(q("[data-ui~='pace.shift-next']")); await app.settle();
  assert(q("[data-ui~='pace.shift-visual']"), "Step 2 shows real Pacing card shift preview");
  assert(q("[data-ui~='pace.shift-back']"), "Step 2 offers Back button");
  assert(q("[data-ui~='pace.shift-go']"), "Step 2 offers Confirm shift button");
  click(q("[data-ui~='pace.shift-back']")); await app.settle();
  assert(q("[data-ui~='pace.shift-source']"), "Back returns to Step 1 preserving state");
  K.ui.closeDialogs(); await app.settle();

  eq(JSON.stringify(K.store.state.governor), govBefore, "Pacing customisation creates zero Governor traffic (invariant 82)");
  eq(K.store.state.sessions.length, sessBefore, "Pacing customisation logs zero sessions");
  eq(app.errors, [], "no page errors");
});

/* ---------------- E · U5 Routines per-day flexible schedules ---------------- */
step("E · Routines support per-day time windows across scheduler, player, reminders and editor (U5)", async () => {
  const K = app.KOS;
  const R = K.routines;
  R.enable(true);

  /* 1. Core per-day dayWindows normalise, resolution, pastWindow, today, forecast & legacy fallback */
  const mon = "2026-11-23"; /* Monday (dow 1) */
  const tue = "2026-11-24"; /* Tuesday (dow 2) */
  const wed = "2026-11-25"; /* Wednesday (dow 3) */
  const sat = "2026-11-28"; /* Saturday (dow 6) */

  const legacy = R.add({
    name: "Legacy Morning", kind: "morning",
    steps: [{ text: "Hydrate", mins: 5 }],
    days: [], window: { from: "07:00", to: "08:00" },
    weekend: { days: [0, 6], window: { from: "09:00", to: "10:30" } }
  });
  eq(R.windowOn(legacy, mon), { from: "07:00", to: "08:00" }, "legacy weekday window preserved");
  eq(R.windowOn(legacy, sat), { from: "09:00", to: "10:30" }, "legacy weekend window preserved");

  const flex = R.add({
    name: "College Morning", kind: "morning",
    steps: [{ text: "Shower", mins: 15 }, { text: "Breakfast", mins: 20 }, { text: "Pack", mins: 10 }],
    days: [1, 2, 3, 4, 5],
    window: { from: "07:00", to: "08:30" },
    dayWindows: {
      "1": { from: "07:00", to: "08:15" },
      "2": { from: "09:30", to: "11:00" },
      "3": { from: "07:15", to: "07:50" } /* 35m < 45m steps -> tight/over */
    },
    remind: true
  });
  assert(flex.dayWindows && flex.dayWindows["2"].from === "09:30", "dayWindows normalised and persisted");
  eq(R.windowOn(flex, mon), { from: "07:00", to: "08:15" }, "Monday resolves per-day window");
  eq(R.windowOn(flex, tue), { from: "09:30", to: "11:00" }, "Tuesday resolves later college-day window");
  eq(R.windowOn(flex, wed), { from: "07:15", to: "07:50" }, "Wednesday resolves tight window");

  /* pastWindow uses that specific day's window: 08:30 is late on Mon (to 08:15) but NOT late on Tue (to 11:00) */
  const mon0830 = new Date(2026, 10, 23, 8, 30).getTime();
  const tue0830 = new Date(2026, 10, 24, 8, 30).getTime();
  assert(R.pastWindow(flex, mon, mon0830) === true, "pastWindow true on Mon at 08:30");
  assert(R.pastWindow(flex, tue, tue0830) === false, "pastWindow false on Tue at 08:30");

  /* today() & forecast() emit Tuesday's 09:30–11:00 window */
  const tueToday = R.today(tue0830).find((x) => x.id === flex.id);
  eq(tueToday.window, { from: "09:30", to: "11:00" }, "today() resolves Tuesday window");
  const tueFrom = new Date(2026, 10, 24, 9, 0).getTime();
  const tueTo = new Date(2026, 10, 24, 10, 0).getTime();
  const fc = R.forecast(tueFrom, tueTo).filter((n) => n.id.indexOf(flex.id) !== -1);
  eq(fc.length, 1, "forecast fires reminder at Tuesday's 09:30 start");

  /* 2. Editor UI: Per day mode renders, Copy Mon guard works, tightest readout warns, Save persists */
  K.show("routines", { edit: flex.id }); await app.settle(); await app.settle();
  assert(q("[data-ui~='routine.sched-mode']"), "Schedule mode toggle rendered");
  assert(q("[data-ui~='routine.pdays']"), "Per day table opens automatically for routine with dayWindows");
  const totalTxt = q("[data-ui~='routine.total']").textContent;
  assert(/Wed/i.test(totalTxt) && /over/i.test(totalTxt), "totalBox flags Wednesday as over-window: " + totalTxt);

  /* Copy Mon -> weekdays updates Tue from 09:30 to 07:00 */
  click(q("[data-ui~='routine.copy-mon']")); await app.settle();
  const tueFromIn = q("[data-ui~='routine.pday-from'][data-day='2']");
  eq(tueFromIn.value, "07:00", "Copy Mon -> weekdays copied Monday start to Tuesday");

  /* Disable Monday -> Copy Mon button becomes disabled */
  click(q("[data-ui~='routine.pday-toggle'][data-day='1']")); await app.settle();
  assert(q("[data-ui~='routine.copy-mon']").disabled, "Copy Mon -> weekdays disabled when Monday is off");
  /* Re-enable Monday and change Tuesday back to 10:00-11:30 then Save */
  click(q("[data-ui~='routine.pday-toggle'][data-day='1']")); await app.settle();
  const tueF = q("[data-ui~='routine.pday-from'][data-day='2']");
  const tueT = q("[data-ui~='routine.pday-to'][data-day='2']");
  tueF.value = "10:00"; tueF.dispatchEvent(new app.window.Event("change", { bubbles: true }));
  tueT.value = "11:30"; tueT.dispatchEvent(new app.window.Event("change", { bubbles: true }));
  click(q("[data-ui~='routine.save']")); await app.settle();
  eq(R.windowOn(R.get(flex.id), tue), { from: "10:00", to: "11:30" }, "Editor save persisted updated per-day window");

  R.remove(legacy.id);
  R.remove(flex.id);
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 5).join("\n       ")); }
  }
  console.log(failed ? `\nSMOKE199 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE199 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
