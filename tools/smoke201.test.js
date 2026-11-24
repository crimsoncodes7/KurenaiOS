/* Kurenai OS — smoke201.test.js
   UX Polish & Design Standardisation (neon/ux-polish-1, user-authorised):
     A · T1: Home hero -> Rotate -> By condition row layout contract (no crushed
         label column or undefined k-input--sm class).
     B · T2: iPad scroll-to-top jolt protection — active Handwriting/Ink tab is
         held against safePoint("idle") teardowns while manual Refresh still
         works; scrolled views keep scrollTop across redraws and clear the
         temporary #main minBlockSize floor on navigation and dispose.
     C · T3: Mind flashcards & quizzes standardisation — Daily 15 Reviews and
         Mind Lesson Cards tabs use the canonical KOS.flashcards engine (Study |
         Deck, Type | Write | Think, 札 watermark card, THIS CARD / THIS DECK /
         KEYS panel) while preserving state.mind.cards keys, single-entry 15 XP
         review pay, and read-only render invariants; Lesson Check uses canonical
         .k-qz-* markup with keyboard shortcuts.
     D · T4: Exams Card drill empty state uses KOS.ui.emptyState.

   Run: node tools/smoke201.test.js                                           */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, ROOT } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

step("A · T1: Home hero Rotate By condition modal layout contract", async (app) => {
  const { KOS, document } = app;
  KOS.show("home");
  await app.settle();
  KOS.art.setCfg("home", { mode: "rotate", by: "condition", period: "season", conds: {} });
  KOS.artSlot.open("home");
  await app.settle();
  const rows = [...document.querySelectorAll(".k-art-cond")];
  eq(rows.length, 3, "three condition rows (Exam Season, streak milestone, Weekend)");
  rows.forEach((row) => {
    const sel = row.querySelector("select");
    assert(sel, "condition row has select");
    assert(sel.classList.contains("k-input"), "select carries canonical .k-input");
    assert(!sel.classList.contains("k-input--sm"), "undefined .k-input--sm removed");
  });
  const css = fs.readFileSync(path.join(ROOT, "css/components.css"), "utf8");
  assert(/\.k-art-cond\s*>\s*select\s*\{[^}]*inline-size:\s*auto/.test(css),
    "components.css overrides inline-size: auto on .k-art-cond > select");
  assert(/\.k-art-cond\s*>\s*div\s*\{[^}]*flex:\s*1\s+1\s+var\(--/.test(css),
    "components.css gives .k-art-cond > div a token flex-basis");
  KOS.ui.closeDialogs();
  await app.settle();
});

step("B · T2: active Ink tab held on background sync & scroll offset preserved without stale floor", async (app) => {
  const { KOS, document } = app;
  KOS.show("ref", { subject: "compsci", ref: "4.2.3.1" });
  await app.settle();
  const docKey = KOS.ink.topicDoc("compsci", "4.2.3.1");
  await new Promise((r) => KOS.ink.ready(r));
  const pg = await new Promise((r) => KOS.ink.addPage(docKey, { paper: "lined" }, (e, p) => r(p)));
  pg.items = [{ id: KOS.ink.uid(), k: "pen", role: "ink", w: 4, p: [100, 100, 500, 0, 400, 400, 500, 20] }];
  await new Promise((r) => KOS.ink.savePage(pg, r));
  const inkTabBtn = [...document.querySelectorAll("#main [role='tab']")].find((b) => b.dataset.tab === "ink");
  assert(inkTabBtn, "Handwritten tab present");
  inkTabBtn.click();
  await app.settle();

  const stage = document.getElementById("stage");
  const main = document.getElementById("main");
  const inkRoot = document.querySelector("[data-ui~='ink.tab']");
  assert(inkRoot, "Ink tab mounted");
  inkRoot.__smoke201Marker = "intact";
  /* Simulate tall scrolled page in jsdom */
  Object.defineProperty(main, "scrollHeight", { configurable: true, get: () => 4200 });
  stage.scrollTop = 1400;

  /* Background sync arrives: held, and safePoint("idle") must NOT tear down the Ink tab */
  KOS.rerender({ background: "hard", changed: ["db:ink", "progress"], source: "device" });
  await app.settle();
  assert(KOS.changes.held(), "background update is held behind chip on Ink tab");
  eq(KOS.changes.safePoint("idle"), false, "safePoint('idle') refuses to tear down active Ink tab");
  assert(document.querySelector("[data-ui~='ink.tab']") === inkRoot && inkRoot.__smoke201Marker === "intact",
    "Ink tab DOM node survived background sync + idle safePoint");
  eq(stage.scrollTop, 1400, "stage scrollTop unchanged while Ink tab held");
  const savedPages = await new Promise((r) => KOS.ink.listPages(docKey, (e, ps) => r(ps || [])));
  assert(savedPages.some((p) => p.items && p.items.length === 1), "Ink strokes remain intact");

  /* Manual Refresh must still work, apply minBlockSize floor, and preserve scrollTop */
  const applied = KOS.changes.apply();
  eq(applied, true, "manual Refresh still applies held update");
  eq(stage.scrollTop, 1400, "stage scrollTop preserved after manual Refresh");
  assert(main.style.minBlockSize === "4200px", "temporary minBlockSize floor holds #main height during rebuild");

  /* Navigating away clears the temporary minBlockSize floor immediately so short views never inherit it */
  KOS.show("home");
  await app.settle();
  eq(main.style.minBlockSize, "", "route navigation clears #main minBlockSize floor");

  /* Non-task scrolled page keeps scrollTop on redraw and does not zero #main.scrollTop */
  KOS.show("subject", "compsci");
  await app.settle();
  stage.scrollTop = 650;
  main.scrollTop = 120;
  KOS.rerender();
  eq(stage.scrollTop, 650, "scrolled subject desk keeps stage.scrollTop on redraw");
  eq(main.scrollTop, 120, "KOS.ui.redrawing preserves main.scrollTop");
  KOS.show("home");
  await app.settle();
  eq(main.style.minBlockSize, "", "subsequent navigation leaves minBlockSize cleared");
});

step("C · T3: Mind Daily 15, Lesson Cards tab, and Lesson Check use canonical engines and preserve Mind SRS", async (app) => {
  const { KOS, document, window } = app;
  const M = KOS.mind;
  const firstLesson = M.lessons()[0];
  assert(firstLesson, "Mind has a first lesson");

  /* Pure read check on Mind Lesson Cards tab (invariant 137 / smoke110 D) */
  const mindBefore = JSON.stringify(KOS.store.state.mind);
  const srsBefore = JSON.stringify(KOS.store.state.srs);
  KOS.show("ref", { subject: "mind", ref: firstLesson.id });
  await app.settle();
  const cardsTab = [...document.querySelectorAll("#main [role='tab']")].find((b) => b.dataset.tab === "cards");
  assert(cardsTab, "Mind lesson has Cards tab");
  cardsTab.click();
  await app.settle();
  eq(JSON.stringify(KOS.store.state.mind), mindBefore, "rendering Mind Cards tab writes nothing to state.mind");
  eq(JSON.stringify(KOS.store.state.srs), srsBefore, "rendering Mind Cards tab writes nothing to state.srs");
  assert(document.querySelector("[data-ui~='fc.card']"), "Mind Cards tab renders canonical fc.card");
  assert(document.querySelector(".k-fc-mark"), "Mind Cards tab renders 札 watermark");
  assert(document.querySelector("[data-ui~='fc.panel']"), "Mind Cards tab renders THIS CARD / THIS DECK / KEYS panel");
  assert(document.querySelector("[data-ui~='fc.modes']"), "Mind Cards tab renders Type | Write | Think modes");
  const modeTabs = [...document.querySelectorAll("[data-ui~='fc.mode']")];
  assert(modeTabs.some((b) => b.textContent.trim() === "Study") && modeTabs.some((b) => /^Deck \(/.test(b.textContent.trim())),
    "Mind Cards tab renders Study | Deck (N) switcher");
  /* Switch to Deck tab */
  modeTabs.find((b) => /^Deck \(/.test(b.textContent.trim())).click();
  assert(document.querySelector("[data-ui~='fc.manage']") && document.querySelectorAll("[data-ui~='fc.row']").length > 0,
    "Mind Deck tab renders canonical fc.manage and fc.row list");

  /* Mind Lesson Check uses canonical .k-qz-* classes and keyboard shortcuts */
  const lessonTab = [...document.querySelectorAll("#main [role='tab']")].find((b) => b.dataset.tab === "lesson");
  lessonTab.click();
  await app.settle();
  const checkIdx = firstLesson.pages.findIndex((p) => p.kind === "check");
  assert(checkIdx >= 0, "Mind lesson has check page");
  const pageSel = document.querySelector("[data-ui~='topic.reader-page-select']");
  pageSel.value = String(checkIdx);
  pageSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  await app.settle();
  assert(document.querySelector(".k-qz-card") && document.querySelectorAll(".k-qz-opt").length >= 2,
    "Mind Lesson Check uses canonical .k-qz-card and .k-qz-opt");
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "1", bubbles: true }));
  assert(document.querySelector(".k-qz-why"), "pressing key 1 answers Mind Check question and shows explanation");

  /* Mind Daily 15 Reviews: canonical engine + preserves state.mind.cards keys + 1 ledger entry */
  const today = KOS.srs.todayISO();
  const introducedKeys = [];
  (firstLesson.concepts || []).slice(0, 1).forEach((cid) => {
    M.introduce(cid, today);
    M.cardKeys(cid).forEach((k) => { KOS.store.state.mind.cards[k].due = today; introducedKeys.push(k); });
  });
  assert(introducedKeys.length >= 2, "seeded at least 2 due Mind cards");
  KOS.store.state.ui.mind = KOS.store.state.ui.mind || {};
  KOS.store.state.ui.mind.daily = { day: today, step: "reviews", parts: {}, results: [], only: "reviews" };
  KOS.store.save();
  const sessionsBefore = KOS.sessions.all().length;
  const srsKeysBefore = Object.keys(KOS.store.state.srs || {}).length;

  KOS.show("mind", { page: "daily", mode: "reviews" });
  await app.settle();
  assert(document.querySelector("[data-ui~='fc.card']"), "Daily 15 Reviews renders canonical fc.card");
  assert(document.querySelector(".k-fc-mark"), "Daily 15 Reviews renders 札 watermark");
  assert(document.querySelector("[data-ui~='fc.modes']"), "Daily 15 Reviews renders Type | Write | Think");
  assert(document.querySelector("[data-ui~='fc.panel']"), "Daily 15 Reviews renders THIS CARD / THIS DECK / KEYS");
  assert(!document.querySelector(".k-mind-flash") && !document.querySelector(".k-mind-grade"),
    "bespoke .k-mind-flash and .k-mind-grade are gone");

  /* Rate every due card via canonical flip + Good button */
  for (let i = 0; i < introducedKeys.length; i++) {
    const cardBtn = document.querySelector("[data-ui~='fc.card']");
    assert(cardBtn, "fc.card present for card " + i);
    cardBtn.click();
    const goodBtn = document.querySelector("[data-ui~='fc.r'][data-kind='good']");
    assert(goodBtn, "canonical Good button present");
    goodBtn.click();
  }
  await app.settle();
  /* Verify Mind's SRS keys were updated, state.srs untouched, and exactly ONE type:'mind' review session logged */
  introducedKeys.forEach((k) => {
    const rec = KOS.store.state.mind.cards[k];
    assert(rec && rec.last === today && rec.reps >= 1 && rec.due > today,
      "Mind card " + k + " rescheduled in state.mind.cards");
  });
  eq(Object.keys(KOS.store.state.srs || {}).length, srsKeysBefore, "Mind ratings do not pollute state.srs");
  const addedSessions = KOS.sessions.all().slice(sessionsBefore).filter((s) => s.type === "mind" && s.metrics && s.metrics.kind === "reviews");
  eq(addedSessions.length, 1, "Daily 15 Reviews logs exactly ONE type:'mind' review session");
  eq(addedSessions[0].metrics.passed, introducedKeys.length, "passed count matches rated Mind cards");
  eq(addedSessions[0].metrics.pay, Math.min(15, introducedKeys.length), "review pay is +1 XP per passed card under 15 XP cap");
});

step("D · T4: Exams Card drill empty state uses KOS.ui.emptyState", async (app) => {
  const { KOS, document } = app;
  const a = KOS.exams.add({ title: "Empty Scope Mock", subject: "compsci", kind: "mock", date: "2026-12-20", refs: [] });
  KOS.show("exams", { id: a.id, tab: "revise", sub: "drill" });
  await app.settle();
  const empty = document.querySelector("[data-ui~='exams.drill'] [data-ui~='ui.empty']");
  assert(empty, "Exams Card drill renders canonical KOS.ui.emptyState when scope has no cards");
});

(async () => {
  const app = await boot();
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.error("  FAIL " + name + "\n       " + (e && e.stack ? e.stack : e)); }
  }
  console.log("\nsmoke201: " + (steps.length - failed) + " / " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
