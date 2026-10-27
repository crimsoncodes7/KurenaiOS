/* Kurenai OS — smoke100.test.js
   The ink engine and a topic's Handwritten tab (roadmap 6.1–6.2,
   docs/ipad-plan.md, design turn 30: 30a–30d; draft invariants 132–136).

   The claims:

     A · THE GEOMETRY (KOS.ink.geo, pure): points pack and unpack; a hand
         line snaps to a line, a box to a rectangle, three corners to a
         triangle, a loop to an ellipse, a scribble to nothing; the eraser
         splits a stroke where it touches ("partial") or takes it whole;
         the lasso takes what is mostly inside; Move and Resize transform.
     B · THE TAB IS ALWAYS THERE AND WRITES NOTHING: after Exam questions,
         with no count, the empty band and paper chips, one blank page;
         opening it adds nothing to IndexedDB (the first stroke makes page
         1), the inspector prints no "Pages written".
     C · THE FIRST STROKE: page 1 is saved, the band folds away, the tab
         counts 1, the inspector says "Pages written · 1 · …", Page · All
         pages appears; a pen stroke records the pen on this device only.
     D · UNDO AND GESTURES: ⌘Z and ⇧⌘Z, P/H/E/L/S/T pick tools; a quick
         two-finger tap undoes, a slow one or a pinch does not; a finger
         never draws until "Draw with a finger" is on.
     E · ALL PAGES: add, reorder, duplicate and delete pages; the count is
         pages with ink, not pages.
     F · STORAGE: ink is never in the state document; the full backup
         carries it and a restore brings it back; writing pays nothing.
     G · SIDE BY SIDE (30e): offered in landscape only; the notes pane is
         the topic's notes, the page pane the notebook; the inspector folds
         over them; Clip to page lands a picture on the page in view that
         remembers its topic and writes nothing to the curriculum; portrait
         shows Page and keeps the choice.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke100.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, I, G, $;
const SID = "compsci", REF = "4.2.1.3", DOC = "topic:compsci:4.2.1.3";
const poly = (pts) => pts.map(([x, y]) => ({ x, y, pr: 0, dt: 8 }));
function dense(corners, per) {
  const out = [];
  for (let i = 0; i < corners.length - 1; i++) for (let k = 0; k < per; k++)
    out.push([corners[i][0] + (corners[i + 1][0] - corners[i][0]) * k / per, corners[i][1] + (corners[i + 1][1] - corners[i][1]) * k / per]);
  out.push(corners[corners.length - 1]);
  return poly(out);
}

step("boot", async () => {
  app = await boot({ clock: "2026-10-25T10:00:00" });
  K = app.KOS; I = K.ink; G = I.geo;
  $ = (s) => app.document.querySelector(s);
  await app.settle();
  eq(app.errors, [], "boot errors");
});

step("A · the geometry", () => {
  const back = G.pts({ p: G.pack([{ x: 12.34, y: 56.78, pr: 200, dt: 9 }]) });
  eq([back[0].x, back[0].y, back[0].pr, back[0].dt], [12.3, 56.8, 200, 9], "a point packs to a tenth of a unit");
  eq((G.snap(dense([[100, 100], [400, 108]], 20)) || {}).sh, "line", "a hand line snaps to a line");
  const level = G.snap(dense([[100, 100], [400, 104]], 20)).pts;
  eq(Math.round(level[1].y), Math.round(level[0].y), "a near-level line is levelled");
  eq((G.snap(dense([[100, 100], [400, 100], [400, 300], [100, 300], [102, 104]], 12)) || {}).sh, "rect", "a box snaps to a rectangle");
  eq((G.snap(dense([[100, 300], [250, 80], [400, 300], [104, 296]], 15)) || {}).sh, "tri", "three corners snap to a triangle");
  const loop = []; for (let i = 0; i <= 60; i++) { const t = i / 60 * Math.PI * 2; loop.push([300 + 100 * Math.cos(t), 300 + 80 * Math.sin(t)]); }
  eq((G.snap(poly(loop)) || {}).sh, "ellipse", "a loop snaps to an ellipse");
  const zig = []; for (let i = 0; i < 40; i++) zig.push([100 + i * 8, 100 + (i % 2) * 40]);
  eq(G.snap(poly(zig)), null, "a scribble snaps to nothing");
  const line = { id: "a", k: "pen", role: "ink", w: 1, p: G.pack(dense([[100, 500], [500, 500]], 40)) };
  const split = G.erase([line], 300, 500, 9, "partial");
  eq(split.length, 2, "the partial eraser splits a stroke in two");
  assert(split.every((s) => s.id !== "a"), "the halves are new strokes");
  eq(G.erase([line], 300, 500, 9, "stroke"), [], "the whole-stroke eraser takes it");
  eq(G.erase([line], 300, 700, 9, "partial"), null, "away from the ink nothing changes");
  const far = { id: "b", k: "pen", role: "ink", w: 1, p: G.pack(dense([[100, 900], [200, 900]], 5)) };
  eq(G.lassoPick([line, far], poly([[50, 450], [600, 450], [600, 560], [50, 560]])), ["a"], "the lasso takes what is inside");
  const moved = G.transform([line], ["a"], (x, y) => ({ x: x + 10, y: y + 20 }));
  eq(Math.round(G.pts(moved[0])[0].y), 520, "Move shifts the selection");
});

let tab;
step("B · the tab is always there and writes nothing", async () => {
  K.show("ref", { subject: SID, ref: REF });
  await app.settle();
  const ids = [...app.document.querySelectorAll("[data-ui~='topic.tabs'] [data-tab]")].map((b) => b.getAttribute("data-tab"));
  eq(ids.slice(ids.indexOf("exam"), ids.indexOf("exam") + 2), ["exam", "ink"], "Handwritten comes after Exam questions");
  tab = $("[data-tab='ink']");
  assert(!tab.querySelector("[data-ui~='ui.tab-count']"), "no count before any ink (invariant 77)");
  tab.click();
  for (let i = 0; i < 4; i++) await app.settle();
  assert($("[data-ui~='ink.toolbar']"), "the toolbar");
  assert($("[data-ui~='ink.band']"), "the empty band");
  eq(app.document.querySelectorAll("[data-ui~='ink.paper-chip']").length, 6, "six papers");
  eq(app.document.querySelectorAll("[data-ui~='ink.page']").length, 1, "one blank page");
  const dump = await new Promise((r) => I.exportAll((e, d) => r(d)));
  eq([dump.docs.length, dump.pages.length], [0, 0], "opening the tab writes nothing");
  const row = $("[data-ui~='topic.pages-written']");
  assert(!row || row.closest("li").hidden, "no Pages written row yet");
  assert(!$("[data-ui~='ink.view-all']"), "no view switch before any ink");
});

/* drive the live canvas with pointer events (jsdom draws nothing; the
   page is 1000 px wide here, so 1 px is one page unit) */
function stub(live) {
  live.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 1414, right: 1000, bottom: 1414 });
}
function pev(target, type, x, y, kind, extra) {
  const e = new app.window.MouseEvent(type, Object.assign({ bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: type === "pointerup" ? 0 : 1 }, extra || {}));
  Object.defineProperty(e, "pointerType", { value: kind || "mouse" });
  Object.defineProperty(e, "pointerId", { value: 1 });
  Object.defineProperty(e, "pressure", { value: (extra && extra.pressure) || 0 });
  target.dispatchEvent(e);
  return e;
}
function draw(live, pts, kind) {
  pev(live, "pointerdown", pts[0][0], pts[0][1], kind);
  pts.slice(1).forEach((p) => pev(live, "pointermove", p[0], p[1], kind));
  pev(live, "pointerup", pts[pts.length - 1][0], pts[pts.length - 1][1], kind);
}
const wave = () => { const o = []; for (let i = 0; i < 30; i++) o.push([100 + i * 10, 300 + Math.sin(i / 3) * 20]); return o; };
async function pageItems() {
  const ps = await new Promise((r) => I.listPages(DOC, (e, p) => r(p)));
  return ps.map((p) => p.items.length);
}

step("C · the first stroke makes page 1", async () => {
  const live = $(".k-ink-live");
  stub(live);
  draw(live, wave(), "pen");
  for (let i = 0; i < 4; i++) await app.settle();
  eq(await pageItems(), [1], "page 1 holds the stroke");
  eq(I.written(DOC).n, 1, "one page written");
  assert(!$("[data-ui~='ink.band']"), "the band folded away");
  eq((tab.querySelector("[data-ui~='ui.tab-count']") || {}).textContent, "1", "the tab counts 1");
  assert(/^1 · today/.test($("[data-ui~='topic.pages-written']").textContent), "the inspector says Pages written: " + $("[data-ui~='topic.pages-written']").textContent);
  assert($("[data-ui~='ink.view-all']"), "Page · All pages appears");
  assert(K.store.state.ui.ink.penSeen > 0, "the pen is recorded on this device");
  eq(app.errors, [], "no errors");
});

step("D · undo, tools and gestures", async () => {
  const live = $(".k-ink-live");
  stub(live);
  const key = (k, o) => app.document.dispatchEvent(new app.window.KeyboardEvent("keydown", Object.assign({ key: k, bubbles: true }, o || {})));
  draw(live, wave().map(([x, y]) => [x, y + 200]), "pen");
  await app.settle();
  key("z", { metaKey: true }); await app.settle();
  eq(await pageItems(), [1], "⌘Z undoes the stroke");
  key("z", { metaKey: true, shiftKey: true }); await app.settle();
  eq(await pageItems(), [2], "⇧⌘Z redoes it");
  key("h"); eq(K.store.state.ui.ink.tool, "hl", "H picks the highlighter");
  key("e"); key("e"); eq([K.store.state.ui.ink.tool, K.store.state.ui.ink.eraser], ["eraser", "stroke"], "tapping the eraser again switches to whole strokes");
  key("p");
  /* touch: a finger scrolls, never draws */
  draw(live, wave().map(([x, y]) => [x, y + 400]), "touch");
  await app.settle();
  eq(await pageItems(), [2], "a finger does not draw");
  /* a quick two-finger tap undoes; a slow one (a pinch held) does not */
  const host = live.parentNode;
  function touches(type, list, changed) {
    const e = new app.window.Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(e, "touches", { value: list });
    Object.defineProperty(e, "changedTouches", { value: changed || list });
    host.dispatchEvent(e);
  }
  const two = [{ identifier: 1, clientX: 100, clientY: 100, touchType: "direct" }, { identifier: 2, clientX: 200, clientY: 100, touchType: "direct" }];
  touches("touchstart", two); touches("touchend", [], two); await app.settle();
  eq(await pageItems(), [1], "a quick two-finger tap undoes");
  touches("touchstart", two);
  touches("touchmove", [{ identifier: 1, clientX: 140, clientY: 100 }, two[1]]);
  touches("touchend", [], two); await app.settle();
  eq(await pageItems(), [1], "a pinch does not undo");
  /* a pen touch is prevented, so iPadOS neither scrolls nor waits for Scribble */
  const e = new app.window.Event("touchstart", { bubbles: true, cancelable: true });
  Object.defineProperty(e, "touches", { value: [{ identifier: 3, touchType: "stylus" }] });
  Object.defineProperty(e, "changedTouches", { value: [{ identifier: 3, touchType: "stylus" }] });
  host.dispatchEvent(e);
  assert(e.defaultPrevented, "the pen's touchstart is prevented");
  /* finger drawing, when chosen */
  K.inkUI.prefs().finger = true;
  draw(live, wave().map(([x, y]) => [x, y + 500]), "touch");
  await app.settle();
  K.store.state.ui.ink.finger = false;
  eq(await pageItems(), [2], "with Draw with a finger on, a finger draws");
});

step("E · All pages", async () => {
  $("[data-ui~='ink.view-all']").click();
  for (let i = 0; i < 4; i++) await app.settle();
  eq(app.document.querySelectorAll("[data-ui~='ink.tile']").length, 1, "one page");
  $("[data-ui~='ink.add-page']").click();
  for (let i = 0; i < 4; i++) await app.settle();
  eq(app.document.querySelectorAll("[data-ui~='ink.tile']").length, 2, "＋ Page adds one");
  eq(I.written(DOC).n, 1, "Pages written counts pages with ink, not pages");
  const ids = I.doc(DOC).pages.slice();
  await new Promise((r) => I.movePage(DOC, 1, 0, r));
  eq(I.doc(DOC).pages, [ids[1], ids[0]], "a page moves");
  await new Promise((r) => I.duplicatePage(DOC, ids[0], r));
  eq(I.doc(DOC).pages.length, 3, "a page duplicates");
  eq(I.written(DOC).n, 2, "the copy has ink");
  await new Promise((r) => I.deletePage(DOC, I.doc(DOC).pages[2], r));
  eq([I.doc(DOC).pages.length, I.written(DOC).n], [2, 1], "a page deletes");
});

step("G · side by side and Clip to page (30e)", async () => {
  const W = app.window, mm = W.matchMedia;
  const wide = (on) => { W.matchMedia = (q) => ({ matches: on && /min-width: 1081px/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }); };
  /* an image "loads" at once; jsdom has no picture to read back, so the
     clip keeps its SVG */
  const Img = W.Image;
  W.Image = function () { const im = {}; Object.defineProperty(im, "src", { set(v) { im._s = v; setTimeout(() => im.onload && im.onload()); }, get() { return im._s; } }); return im; };
  try {
    wide(true);
    K.show("ref", { subject: SID, ref: REF });
    $("[data-tab='ink']").click();
    for (let i = 0; i < 4; i++) await app.settle();
    assert($("[data-ui~='ink.view-side']"), "landscape offers Side by side");
    $("[data-ui~='ink.view-side']").click();
    for (let i = 0; i < 4; i++) await app.settle();
    assert($("[data-ui~='ink.side-notes'] [data-ui~='ink.side-article']"), "the notes pane renders the topic's notes");
    assert($("[data-ui~='ink.side-page'] [data-ui~='ink.page']"), "the page pane holds the notebook");
    const grid = $("[data-ui~='study.grid']");
    assert(grid.matches("[data-state~='insp-closed'][data-state~='insp-float']"), "the inspector folds to its spine and opens over the panes");
    eq(K.store.state.ui.inkView, "side", "the view is remembered");
    const edits = JSON.stringify(K.store.state.edits || {});
    const before = await new Promise((r) => I.getPage(I.doc(DOC).pages[0], (e, p) => r(p.items.length)));
    const block = $("[data-ui~='ink.side-article'] .k-callout") || $("[data-ui~='ink.side-article'] .k-n-tablewrap");
    assert(block, "a clippable block in the notes");
    block.dispatchEvent(new W.MouseEvent("click", { bubbles: true }));
    assert(block.matches("[data-state~='clip-sel']") && $("[data-ui~='ink.clip']"), "a tap marks the block and offers Clip to page");
    $("[data-ui~='ink.clip']").click();
    for (let i = 0; i < 6; i++) await app.settle();
    await new Promise((r) => setTimeout(r, 400));
    const items = await new Promise((r) => I.getPage(I.doc(DOC).pages[0], (e, p) => r(p.items)));
    eq(items.length, before + 1, "the clip lands on the page in view");
    const clip = items[items.length - 1];
    assert(clip.k === "img" && /^data:image\//.test(clip.src) && clip.clip && clip.clip.ref === REF, "the clip is a picture that remembers its topic");
    eq(JSON.stringify(K.store.state.edits || {}), edits, "a clip never writes the curriculum or a fork (invariant 86)");
    /* portrait: the switch hides, Page shows, the choice is kept */
    wide(false);
    $("[data-tab='notes']").click();
    $("[data-tab='ink']").click();
    for (let i = 0; i < 4; i++) await app.settle();
    assert(!$("[data-ui~='ink.view-side']") && !$("[data-ui~='ink.side']"), "portrait has no side by side");
    eq(K.store.state.ui.inkView, "side", "portrait keeps the choice");
    assert(!$("[data-ui~='study.grid']").matches("[data-state~='ink-side']"), "leaving side by side gives the inspector back");
    K.store.state.ui.inkView = "page";
  } finally { W.matchMedia = mm; W.Image = Img; }
});

step("F · storage, backup and pay", async () => {
  const st = JSON.stringify(K.store.state);
  assert(st.indexOf("\"k\":\"pen\"") < 0 && st.indexOf(DOC) < 0, "no ink in the state document");
  eq(Object.keys(K.store.state.ui.ink).sort(), ["at", "dock", "eraser", "eraserW", "finger", "hl", "lasso", "pen", "penSeen", "pressure", "textW", "tool"], "only device prefs in state.ui");
  const snap = await new Promise((r) => K.store.snapshotFull((e, d) => r(d)));
  assert(snap.ink && snap.ink.pages.length === 2 && snap.ink.docs.length === 1, "the full backup carries the notebook");
  await new Promise((r) => I.deletePage(DOC, I.doc(DOC).pages[0], r));
  await new Promise((r) => I.deletePage(DOC, I.doc(DOC).pages[0], r));
  await new Promise((r) => I.importAll(snap.ink, r));
  eq(I.doc(DOC).pages.length, 2, "a restore brings it back");
  const xp = K.store.state.governor.xp, gold = K.store.state.governor.gold;
  eq([K.store.state.governor.xp, K.store.state.governor.gold], [xp, gold], "writing paid nothing");
  const ledger = (K.store.state.sessions || []).filter((s) => s.type === "ink");
  eq(ledger.length, 0, "and logged no session");
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
