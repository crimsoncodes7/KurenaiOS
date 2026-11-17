/* Kurenai OS — smoke162.test.js
   Held updates (W2, design turn 36; js/core/redraw.js).

     A · the chip: in a page header's action slot, or beside a topic's ‹ ›;
         "Updated on another device · Refresh", then "3 updates"; its menu
         lists the areas with counts only, where it came from and when,
         then Refresh and Later. Later keeps it; Refresh applies and hides.
     B · another window on this device says so.
     C · on the phone it rides the app's header.
     D · a safe moment applies it: a note page turned, a tab changed — but
         never under unsaved work or a dialog.
     E · applied, only the values that changed take a ring.
     F · in a flashcard run a line under the progress replaces the chip;
         a card rated on another device mid-run is shown for a beat and
         skipped, never asked twice; the run's end gives the chip back.
     G · navigation clears it; no errors.

   Run: node tools/smoke162.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, d, w;
const $ = (sel, root) => (root || d).querySelector(sel);
const $$ = (sel, root) => Array.from((root || d).querySelectorAll(sel));
const text = (n) => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
const chip = () => $("[data-ui~='shell.refresh']");
const shown = () => { const c = chip(); return !!c && !c.hidden && c.isConnected; };
const pull = (keys, source) => K.rerender({ background: "hard", changed: keys, source: source || "device" });
const TOPIC = { subject: "compsci", ref: "4.2.3.1" };
async function topic(tab) {
  K.show("ref", TOPIC); await app.settle();
  if (tab) {
    const t = $$("#main [role='tab']").find((x) => new RegExp("^" + tab).test(text(x)));
    t.click(); await app.settle();
  }
}

step("boot", async () => {
  app = await boot({ longTimers: true });
  K = app.KOS; d = app.document; w = app.window;
  await seedAccount(app);
  await app.settle();
  assert(!app.errors.filter((e) => /LOAD FAIL/.test(e)).length, "scripts load");
});

step("A · the chip, its words and what changed", async () => {
  await topic("Notes");
  pull(["progress"]); await app.settle();
  assert(shown(), "a change arrived: the chip");
  assert(chip().parentNode.classList.contains("k-topic-steps"), "beside the topic's ‹ ›, never over the notes");
  assert(/Updated on another device/.test(text(chip())) && /Refresh/.test(text(chip())), "its words: " + text(chip()));
  eq(chip().getAttribute("data-state"), "arrived", "arrived");
  pull(["srs"]); pull(["srs"]); await app.settle();
  assert(/3 updates/.test(text(chip())), "several: " + text(chip()));
  eq(chip().getAttribute("data-state"), "several", "several");
  chip().click(); await app.settle();
  const panel = $("[data-ui~='ui.menu-panel']");
  const lines = text(panel);
  assert(/^Another device · \d\d:\d\d/.test(lines), "where and when: " + lines);
  assert(/Flashcards · 2 updates/.test(lines) && /Topic progress · updated/.test(lines), "areas with counts only: " + lines);
  const items = $$("[role='menuitem']", panel).map((b) => text($("[data-ui~='ui.menu-item']", b)));
  eq(items, ["Refresh", "Later"], "Refresh and Later");
  $$("[role='menuitem']", panel)[1].click(); await app.settle();
  assert(shown() && K.changes.held().count === 3, "Later keeps it");
  chip().click(); await app.settle();
  $$("[role='menuitem']", $("[data-ui~='ui.menu-panel']"))[0].click(); await app.settle();
  assert(!shown() && !K.changes.held(), "Refresh applies it");
  /* a page with a header: the action slot */
  K.show("exams"); await app.settle();
  pull(["exams"]); await app.settle();
  assert(shown() && chip().parentNode.classList.contains("k-pagehead-actions"), "in the page header's action slot");
  K.changes.apply(); await app.settle();
});

step("B · another window on this device", async () => {
  await topic("Notes");
  pull(["progress"], "tab"); await app.settle();
  assert(/Updated in another window/.test(text(chip())), "worded: " + text(chip()));
  chip().click(); await app.settle();
  assert(/^Another window on this device/.test(text($("[data-ui~='ui.menu-panel']"))), "the menu says so");
  K.ui.closeDialogs(); d.body.click(); await app.settle();
  K.changes.apply(); await app.settle();
});

step("C · on the phone it rides the app's header", async () => {
  const mm = w.matchMedia;
  w.matchMedia = (q) => ({ matches: /max-width: (700|860)px/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  try {
    await topic("Notes");
    pull(["progress"]); await app.settle();
    assert(shown() && chip().parentNode.classList.contains("k-topbar-end"), "in #topbar beside the bell");
    assert(/bar/.test(chip().getAttribute("data-state")), "drawn as the dot and Refresh");
    eq(chip().getAttribute("aria-label"), "Updated on another device. What changed, and Refresh", "the words are its name");
    K.changes.apply(); await app.settle();
    assert(!shown(), "gone once applied");
  } finally { w.matchMedia = mm; }
});

step("D · a safe moment applies it, never under work or a dialog", async () => {
  await topic("Notes");
  pull(["progress"]); await app.settle();
  const next = $("[data-ui='topic.page'][data-state='next']");
  assert(next, "a paged note");
  next.click(); await app.settle();
  assert(!K.changes.held() && !shown(), "a page turned: applied");
  pull(["srs"]); await app.settle();
  $$("#main [role='tab']").find((x) => /^Specification/.test(text(x))).click(); await app.settle();
  assert(!K.changes.held(), "a tab changed: applied");
  /* unsaved work holds it */
  await topic("Notes");
  let work = true;
  K.view.hold(() => work);
  pull(["progress"]); await app.settle();
  $("[data-ui='topic.page'][data-state='next']").click(); await app.settle();
  assert(K.changes.held(), "held under unsaved work");
  work = false;
  eq(K.changes.safePoint("idle"), true, "once the work is saved, the next safe moment applies it");
  /* a dialog holds it */
  await topic("Notes");
  pull(["progress"]); await app.settle();
  K.ui.confirm({ title: "A dialog", body: "Open", confirm: "OK" }, () => {});
  await app.settle();
  eq(K.changes.safePoint("turn"), false, "not with a dialog open");
  K.ui.closeDialogs(); await app.settle();
  K.changes.apply(); await app.settle();
});

step("E · only the values that changed take a ring", async () => {
  await topic("Notes");
  const before = text($("[data-ui~='topic.status-chip']"));
  const key = "compsci:4.2.3.1";
  const P = K.store.state.progress;
  P[key] = Object.assign({}, P[key] || {}, { check: [true, true, true, true], status: "done" });
  pull(["progress"]); await app.settle();
  K.changes.apply();
  /* looked at at once: the ring lasts a second */
  const rung = $$("#main [data-state~='changed']");
  assert(rung.length >= 1, "something rang");
  assert(rung.some((n) => /topic\.status-chip/.test(n.getAttribute("data-ui"))) && text($("[data-ui~='topic.status-chip']")) !== before, "the status that moved: " + rung.map((n) => n.getAttribute("data-ui")).join(", "));
  assert(!rung.some((n) => /topic\.title|topic\.ref/.test(n.getAttribute("data-ui") || "")), "nothing that did not move");
});

step("F · a flashcard run: the line, the skip, the end", async () => {
  await topic("Flashcards");
  const line = $("[data-ui~='fc.held']");
  assert(line && line.hasAttribute("data-run-line") && line.hidden, "the run has a hidden line under its progress");
  pull(["srs"]); await app.settle();
  assert(!line.hidden && /Updated on another device · it applies when this run ends/.test(text(line)), "the line: " + text(line));
  assert(!shown(), "no chip mid-run");
  eq(K.changes.safePoint("turn"), false, "nothing applies mid-run");
  /* the next card is rated on another device while this one is up */
  const all = K.srs.cardsFor("compsci", "4.2.3.1");
  assert(all.length >= 3, "a deck");
  const upNow = text($("[data-ui~='fc.front'] .k-fc-text"));
  const second = all.map((c) => c.key)[1];
  const rec = K.store.state.srs[second] = Object.assign({}, K.store.state.srs[second] || {});
  rec.last = K.srs.todayISO();
  const left = () => (text($("[data-ui~='fc.count']")).match(/(\d+) left of (\d+)/) || []).slice(1).map(Number);
  const [l0, t0] = left();
  $("[data-ui~='fc.card']").click(); await app.settle();
  $$("[data-ui~='fc.r']")[2].click(); await app.settle();
  /* the skipped card is shown for a beat, then the run moves on */
  const shownSkip = $("[data-ui~='fc.elsewhere']");
  if (shownSkip) {
    assert(/Already reviewed on another device/.test(text(shownSkip)), "said once");
    for (let i = 0; i < 6; i++) await app.settle();
  }
  const [l1, t1] = left();
  eq([l1, t1], [l0 - 2, t0 - 1], "one rated, one skipped and not counted (" + upNow.slice(0, 30) + ")");
  assert(!$("[data-ui~='fc.elsewhere']"), "and the run went on");
  /* finish the run: the chip comes back */
  for (let i = 0; i < 80 && $("[data-ui~='fc.card']") && !/Session complete/.test(text($("[data-ui~='fc.front']"))); i++) {
    if ($("[data-ui~='fc.elsewhere']")) { await app.settle(); continue; }
    $("[data-ui~='fc.card']").click(); await app.settle();
    const r = $$("[data-ui~='fc.r']")[3]; if (r) r.click();
    await app.settle();
  }
  assert(/Session complete/.test(text($("[data-ui~='fc.front']"))), "the run ended");
  await app.settle();
  assert(!line.hasAttribute("data-run-line") && line.hidden, "the line is gone");
  assert(shown(), "the chip is offered again");
});

step("G · navigation clears it; no errors", async () => {
  K.show("help"); await app.settle();
  assert(!shown() && !K.changes.held(), "cleared");
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke162: " + failed + " failed" : "smoke162: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
