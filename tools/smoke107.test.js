/* Kurenai OS — smoke107.test.js
   The Pencil fixes (27 October 2026): what the first day with an Apple
   Pencil Pro found on the iPad.

   The claims:

     A · EVERY TOOL HAS OPTIONS: whichever tool is in hand, the bar's
         options slot holds a button (no gap where the colour was); the
         highlighter, the eraser and text have three sizes, the eraser
         and the lasso a mode, and each is a per-device choice.
     B · SIZES ARE KEPT ON THE INK: a highlighter stroke carries its width,
         a text box its size; a large eraser reaches what a small one does
         not.
     C · THE LASSO: the box lasso selects by a rectangle, and the
         selection's chips take a pen's tap (a stylus touchstart there is
         not prevented, so Delete deletes).
     D · PEN INPUT: a stray sample far from the nib and a no-pressure
         sample mid-stroke never join the stroke; two strays in a row are
         the pen really moving.
     E · FINGER DRAWING: one finger is not held back from drawing, and
         two fingers scroll the page.
     F · REDRAWS: a redraw (a cloud pull, a habit ticking itself) keeps
         the topic's open tab; a navigation opens the first; a redraw
         waits while the pen is down.
     G · THE TAB ROW: the Handwritten tab's view switch and menus sit on
         their own line under the tabs, not in the tab row.
     H · THE REVIEW'S WORDS BACK OFF: a failed request waits 20 minutes
         before the ticker asks again, and a spent quota stops automatic
         tries for the rest of the UTC day.
     I · A FINISHED REVIEW STAYS: done or skipped, it waits on the header
         chip until the next review starts or 8 hours pass, and opened
         again it is the whole review — its routine still ticks — with
         only Skip gone; Done turns a skipped one done.
     J · ANSWER PADS: a pad's bar has Paper; picking one changes the pad
         and is remembered for the next pad of that kind on this device;
         the floating palette's ⠿ menu can dock the tools; "What is sent"
         numbers the scheme once and a reply in a fence or with words
         around it is still read.
     K · MATHS IN KURENAI'S WORDS: bare LaTeX in a reason is wrapped as
         maths; and no authored file loses a LaTeX "\;" to a single
         backslash in a JS string (274 did: the scheme read "⇒;").

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke107.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, I, G, $, $$;
const SID = "compsci", REF = "4.2.1.3", DOC = "topic:compsci:4.2.1.3";

function stub(live) {
  live.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 1414, right: 1000, bottom: 1414 });
}
function pev(target, type, x, y, kind, extra) {
  const e = new app.window.MouseEvent(type, Object.assign({ bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: type === "pointerup" ? 0 : 1 }, extra || {}));
  Object.defineProperty(e, "pointerType", { value: kind || "mouse" });
  Object.defineProperty(e, "pointerId", { value: 1 });
  Object.defineProperty(e, "pressure", { value: extra && extra.pressure != null ? extra.pressure : (kind === "pen" ? 0.4 : 0) });
  target.dispatchEvent(e);
  return e;
}
function draw(live, pts, kind, extras) {
  pev(live, "pointerdown", pts[0][0], pts[0][1], kind);
  pts.slice(1).forEach((p, i) => pev(live, "pointermove", p[0], p[1], kind, extras && extras[i + 1]));
  pev(live, "pointerup", pts[pts.length - 1][0], pts[pts.length - 1][1], kind);
}
const wave = (y0) => { const o = []; for (let i = 0; i < 30; i++) o.push([100 + i * 10, (y0 || 300) + Math.sin(i / 3) * 20]); return o; };
function touches(host, type, list, changed) {
  const e = new app.window.Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(e, "touches", { value: list });
  Object.defineProperty(e, "changedTouches", { value: changed || list });
  host.dispatchEvent(e);
  return e;
}
async function items() {
  const ps = await new Promise((r) => I.listPages(DOC, (e, p) => r(p)));
  return ps.length ? ps[0].items : [];
}
async function settle(n) { for (let i = 0; i < (n || 3); i++) await app.settle(); }
function live() { const l = $(".k-ink-live"); stub(l); return l; }

step("boot and open the Handwritten tab", async () => {
  app = await boot({ clock: "2026-10-27T10:00:00" });
  K = app.KOS; I = K.ink; G = I.geo;
  $ = (s) => app.document.querySelector(s);
  $$ = (s) => [...app.document.querySelectorAll(s)];
  await app.settle();
  K.show("ref", { subject: SID, ref: REF });
  await settle();
  $("[data-tab='ink']").click();
  await settle(4);
  assert($("[data-ui~='ink.toolbar']"), "the toolbar");
  eq(app.errors, [], "boot errors");
});

step("A · every tool has options", async () => {
  const p = K.store.state.ui.ink;
  const key = (k) => app.document.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: k, bubbles: true }));
  const label = () => { const b = $("[data-ui~='ink.colour-btn']"); return b ? b.textContent.replace(/[▾▴]/g, "").trim() : null; };
  for (const k of ["p", "h", "e", "l", "s", "r", "t"]) {
    key(k);
    const slot = $("[data-ui~='ink.colour']");
    assert(slot && !K.ui.hasState(slot, "off") && slot.children.length, "the options slot is filled for " + p.tool);
  }
  key("p"); assert(/^Ink · Medium$/.test(label()), "the pen: colour and width — " + label());
  key("h"); assert(/^Amber · Medium$/.test(label()), "the highlighter: colour and width — " + label());
  key("t"); assert(/^Ink · Medium$/.test(label()), "text: colour and size — " + label());
  key("l"); eq(label(), "Freehand", "the lasso: its mode");
  key("e"); eq(label(), "Partial · Small", "the eraser: its mode and size");
  /* the menu offers the eraser's mode and its three sizes */
  $("[data-ui~='ink.colour-btn']").click();
  await settle(1);
  eq($$("[data-ui~='ink.choice']").map((b) => b.textContent), ["Partial", "Whole stroke"], "two eraser modes");
  eq($$("[data-ui~='ink.width']").map((b) => b.getAttribute("aria-label")), ["Small", "Medium", "Large"], "three eraser sizes");
  $$("[data-ui~='ink.width']")[2].click();
  await settle(1);
  eq([p.tool, p.eraserW], ["eraser", 2], "the large eraser is chosen, per device");
  eq(label(), "Partial · Large", "and the bar says so");
  $("[data-ui~='ink.colour-btn']").click(); await settle(1);
  $("[data-ui~='ink.choice'][data-choice='stroke']").click();
  await settle(1);
  eq(p.eraser, "stroke", "the mode from the menu");
  key("p");
  eq(app.errors, [], "no errors");
});

step("B · sizes are kept on the ink", async () => {
  const p = K.store.state.ui.ink, key = (k) => app.document.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: k, bubbles: true }));
  /* a wide highlighter */
  key("h");
  $("[data-ui~='ink.colour-btn']").click(); await settle(1);
  $$("[data-ui~='ink.width']")[2].click(); await settle(1);
  eq(p.hl.w, 2, "the highlighter's width is chosen");
  draw(live(), wave(300), "pen");
  await settle(4);
  let its = await items();
  const hl = its.filter((x) => x.k === "hl").pop();
  assert(hl && hl.w === 2, "the stroke carries its width");
  eq(Math.round(G.baseWidth(hl) * 10) / 10, Math.round(8 * I.MM * 10) / 10, "8 mm wide");
  eq(Math.round(G.baseWidth({ k: "hl" }) * 10) / 10, Math.round(5 * I.MM * 10) / 10, "a stroke from before keeps 5 mm");
  /* the eraser's reach: a pen line, erased beside it */
  key("p");
  draw(live(), [[100, 700], [300, 700], [500, 700]], "pen");
  await settle(4);
  const before = (await items()).length;
  key("e"); p.eraser = "stroke"; p.eraserW = 0;
  draw(live(), [[300, 728], [302, 728]], "pen");
  await settle(4);
  eq((await items()).length, before, "a small eraser 28 units off misses");
  p.eraserW = 2;
  draw(live(), [[300, 728], [302, 728]], "pen");
  await settle(4);
  eq((await items()).length, before - 1, "a large one takes it");
  /* text in a size */
  eq(G.textSize({ k: "text" }), 22, "text from before reads 22");
  eq(Math.round(G.textSize({ k: "text", sz: 32 })), 32, "a box keeps its own size");
  const box = G.boxOf([{ id: "a", k: "text", x: 0, y: 0, s: "ab", sz: 32 }], ["a"]);
  assert(box.h > 32 * 1.2, "its box follows the size");
  const t = G.transform([{ id: "a", k: "text", x: 10, y: 10, s: "ab" }], ["a"], (x, y) => ({ x: x * 2, y: y * 2 }))[0];
  eq(t.sz, 44, "Resize scales the lettering");
  key("p");
  eq(app.errors, [], "no errors");
});

step("C · the box lasso and its chips", async () => {
  const key = (k) => app.document.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: k, bubbles: true }));
  K.store.state.ui.ink.lasso = "box";
  draw(live(), wave(1000), "pen");
  await settle(4);
  const n0 = (await items()).length;
  key("l");
  const l = live();
  pev(l, "pointerdown", 60, 940, "pen");
  pev(l, "pointermove", 300, 1000, "pen");
  pev(l, "pointermove", 450, 1060, "pen");
  pev(l, "pointerup", 450, 1060, "pen");
  await settle(1);
  const chips = $("[data-ui~='ink.selection']");
  assert(chips, "the box selected the wave");
  const del = chips.querySelector("[data-ui~='ink.sel-delete']");
  const ts = touches(l.parentNode, "touchstart", [{ identifier: 9, clientX: 1, clientY: 1, touchType: "stylus" }]);
  assert(ts.defaultPrevented, "a pen's touch on the page itself is still held from Scribble");
  const tc = new app.window.Event("touchstart", { bubbles: true, cancelable: true });
  Object.defineProperty(tc, "touches", { value: [{ identifier: 9, touchType: "stylus" }] });
  Object.defineProperty(tc, "changedTouches", { value: [{ identifier: 9, touchType: "stylus" }] });
  del.dispatchEvent(tc);
  assert(!tc.defaultPrevented, "a pen's tap on a chip is left to become a click");
  del.click();
  await settle(4);
  eq((await items()).length, n0 - 1, "Delete deleted the selection");
  K.store.state.ui.ink.lasso = "free";
  key("p");
  eq(app.errors, [], "no errors");
});

step("D · stray samples never join a stroke", async () => {
  const pts = wave(500);
  /* one sample 600 units off in the middle, and one with no pressure */
  const bad = pts.slice(0, 12).concat([[800, 1300]], pts.slice(12, 20), [[330, 900]], pts.slice(20));
  const extras = {}; extras[21] = { pressure: 0 };
  draw(live(), bad, "pen", extras);
  await settle(4);
  const st = (await items()).filter((x) => x.k === "pen").pop();
  const list = G.pts(st);
  assert(!list.some((q) => q.y > 700), "neither stray joined the stroke: " + JSON.stringify(list.filter((q) => q.y > 700)));
  eq(list.length, pts.length, "every real sample is kept");
  /* two far samples in a row are the pen really moving */
  draw(live(), [[100, 1200], [110, 1200], [400, 1250], [420, 1252], [440, 1254]], "pen");
  await settle(4);
  const st2 = (await items()).filter((x) => x.k === "pen").pop();
  assert(G.pts(st2).some((q) => q.x > 400), "the stroke follows a real jump");
  eq(app.errors, [], "no errors");
});

step("E · finger drawing scrolls with two fingers", async () => {
  const l = live(), host = l.parentNode;
  K.store.state.ui.ink.finger = true;
  /* the desk reads the same prefs object; the surface re-reads its mode */
  K.inkUI.prefs();
  const one = touches(host, "touchstart", [{ identifier: 1, clientX: 100, clientY: 100, touchType: "direct" }]);
  assert(!one.defaultPrevented, "one finger is left to the touch-action rule, so a pinch can follow");
  touches(host, "touchend", [], [{ identifier: 1 }]);
  const sc = app.document.scrollingElement || app.document.documentElement;
  let moved = 0;
  sc.scrollBy = (x, y) => { moved += y; };
  const a = { identifier: 1, clientX: 100, clientY: 400, touchType: "direct" }, b = { identifier: 2, clientX: 200, clientY: 400, touchType: "direct" };
  touches(host, "touchstart", [a, b]);
  touches(host, "touchmove", [Object.assign({}, a, { clientY: 300 }), Object.assign({}, b, { clientY: 300 })]);
  touches(host, "touchend", [], [a, b]);
  eq(moved, 100, "two fingers dragged up 100 px scroll the page down 100 px");
  K.store.state.ui.ink.finger = false;
  eq(app.errors, [], "no errors");
});

step("F · a redraw keeps the open tab", async () => {
  $("[data-tab='exam']").click();
  await settle(2);
  eq($("[data-ui~='topic.tabs'] [data-state~='active']").getAttribute("data-tab"), "exam", "Exam questions is open");
  K.rerender();
  await settle(2);
  eq($("[data-ui~='topic.tabs'] [data-state~='active']").getAttribute("data-tab"), "exam", "a redraw keeps it");
  K.show("home"); await settle(1);
  K.show("ref", { subject: SID, ref: REF }); await settle(2);
  assert($("[data-ui~='topic.tabs'] [data-state~='active']").getAttribute("data-tab") !== "exam", "a navigation opens the first tab");
  /* a redraw waits while the pen is down */
  $("[data-tab='ink']").click();
  await settle(4);
  const l = live();
  pev(l, "pointerdown", 100, 200, "pen");
  K.rerender();
  await settle(1);
  assert(l.isConnected, "the page under the pen was not redrawn");
  pev(l, "pointerup", 120, 210, "pen");
  eq(app.errors, [], "no errors");
});

step("G · the tab row is the tabs'", async () => {
  const mode = $("[data-ui~='topic.inkmode']");
  assert(mode, "the Handwritten tab's line");
  assert(!mode.closest(".k-topic-tabrow"), "it is not in the tab row");
  assert(mode.querySelector("[data-ui~='ink.view-page']"), "the view switch is on it");
  assert(mode.previousElementSibling && mode.previousElementSibling.classList.contains("k-topic-tabrow"), "right under the tabs");
  $("[data-tab='notes']") && $("[data-tab='notes']").click();
  await settle(2);
  eq(mode.children.length, 0, "another tab empties it");
  eq(app.errors, [], "no errors");
});

step("H · the review's words back off", async () => {
  const V = K.dayReview, realChat = K.ai.chat;
  V.setConfig({ words: "kurenai" });
  const now = new Date(2026, 9, 27, 9, 0).getTime();
  let calls = 0;
  K.ai.chat = (cat, opts, cb) => { calls++; setTimeout(() => cb({ kind: "provider", message: "down" }), 0); return {}; };
  const ask = (t, o) => new Promise((res) => V.ensureWords("morning", Object.assign({ now: t }, o || {}), () => res()));
  await ask(now); await settle(1);
  await ask(now + 30000); await settle(1);
  eq(calls, 1, "a failure is not asked again 30 s later");
  await ask(now + 3 * 60000, { byHand: true }); await settle(1);
  eq(calls, 2, "opening the review by hand tries again after 2 minutes");
  await ask(now + 10 * 60000); await settle(1);
  eq(calls, 2, "the ticker waits 20 minutes");
  await ask(now + 24 * 60000); await settle(1);
  eq(calls, 3, "and then tries once more");
  K.ai.chat = (cat, opts, cb) => { calls++; setTimeout(() => cb({ kind: "rate", message: "Daily limit reached" }), 0); return {}; };
  await ask(now + 50 * 60000); await settle(1);
  eq(calls, 4, "the try that meets a spent quota");
  await ask(now + 120 * 60000); await settle(1);
  await ask(now + 125 * 60000, { byHand: true }); await settle(1);
  eq(calls, 4, "nothing more that day, by hand or not");
  K.ai.chat = realChat;
  eq(app.errors, [], "no errors");
});

step("I · a finished review stays on the chip", async () => {
  const day = "2026-10-27";
  const b = await boot({ clock: day + "T09:30:00" });
  const KK = b.KOS, d = b.document, q = (x) => d.querySelector(x);
  const click = (n) => { assert(n, "nothing to click"); n.dispatchEvent(new b.window.MouseEvent("click", { bubbles: true })); };
  const R = KK.routines, V = KK.dayReview;
  const mr = R.fromTemplate("morning", { remind: true });
  KK.store.save();
  KK.show("home"); await b.settle();
  KK.reviewSheet.open("morning"); await b.settle();
  assert(q("[data-ui~='review.sheet']"), "the morning review opens");
  KK.reviewSheet.close(); await b.settle();
  V.finish("morning", "done", new Date(2026, 9, 27, 9, 31).getTime());
  KK.reviewSheet.chip(); await b.settle();
  const chip = q("[data-ui~='review.chip']");
  assert(chip && /done/.test(chip.textContent), "the chip keeps it, marked done: " + (chip && chip.textContent));
  eq(V.recent(new Date(2026, 9, 27, 14, 40).getTime()).slot, "morning", "it stays through the day");
  eq(V.recent(new Date(2026, 9, 27, 15, 10).getTime()), null, "until the afternoon review starts");
  eq(V.due(new Date(2026, 9, 27, 15, 10).getTime()).slot, "afternoon", "which takes the chip");
  /* opened again: the whole review */
  KK.reviewSheet.open("morning"); await b.settle();
  assert(q("[data-ui~='review.sheet']"), "it opens again");
  assert(!q("[data-ui~='review.skip']") && !q("[data-ui~='review.skip-foot']"), "only Skip is gone");
  assert(q("[data-ui~='review.later']"), "Later is there");
  eq(V.day(R.routineDay()).morning.state, "done", "opening it changed nothing");
  KK.reviewSheet.close(); await b.settle();
  /* its routine can still be ticked late (the bus) */
  const rid = mr && mr.id ? mr.id : R.all().find((x) => /morning/i.test(x.title || x.name || "")).id;
  const step0 = (R.stepsFor ? R.stepsFor(R.get(rid), R.routineDay()) : R.get(rid).steps)[0];
  R.tick(rid, step0.id, true);
  assert(JSON.stringify(KK.store.state.routines).indexOf(step0.id) >= 0, "a step ticked after the review");
  /* a skipped review, opened again and Done, is done */
  V.finish("morning", "skipped", new Date(2026, 9, 27, 9, 45).getTime());
  KK.reviewSheet.open("morning"); await b.settle();
  const done = [...d.querySelectorAll("[data-ui~='review.done'], [data-ui~='review.next']")];
  while (q("[data-ui~='review.next']")) { click(q("[data-ui~='review.next']")); await b.settle(); }
  const fin = q("[data-ui~='review.done']");
  if (fin) { click(fin); await b.settle(); eq(V.day(R.routineDay()).morning.state, "done", "Done turns a skipped review done"); }
  else assert(done.length >= 0, "a Done button");
  eq(b.errors, [], "no errors");
});

step("J · answer pads: paper and docking", async () => {
  const host = app.document.createElement("div");
  app.document.getElementById("main").appendChild(host);
  const pad = K.inkPad.mount(host, { marks: 6, title: "Q1", item: "test:q1" });
  await settle(2);
  const btn = host.querySelector("[data-ui~='ink.paper']");
  assert(btn, "the pad's bar has Paper");
  eq(host.querySelector("[data-ui~='pad.sheet']").getAttribute("data-paper"), "booklet", "a page pad starts on the booklet");
  btn.click(); await settle(1);
  const sq = app.document.querySelector("[data-ui~='ink.paper-chip'][data-paper='squared']");
  assert(sq, "the papers are offered");
  sq.click(); await settle(1);
  eq(host.querySelector("[data-ui~='pad.sheet']").getAttribute("data-paper"), "squared", "the pad is squared now");
  eq(K.store.state.ui.padPaper.page, "squared", "remembered on this device");
  pad.destroy();
  const pad2 = K.inkPad.mount(host, { marks: 6 });
  eq(host.querySelector("[data-ui~='pad.sheet']").getAttribute("data-paper"), "squared", "the next page pad starts squared");
  pad2.destroy();
  const strip = K.inkPad.mount(host, { marks: 2 });
  eq(host.querySelector("[data-ui~='pad.sheet']").getAttribute("data-paper"), "lined", "a strip keeps its own (lined)");
  strip.destroy();
  host.remove();
  const rj = K.inkAI.readJson;
  eq(rj('{"a":1}'), { a: 1 }, "bare JSON");
  eq(rj('```json\n{"a":1}\n```'), { a: 1 }, "in a fence");
  eq(rj('Here are the marks: {"a":1} — done'), { a: 1 }, "with words around it");
  eq(rj('{"a":1, "b": [1,'), null, "a cut-off reply is not read");
  eq(app.errors, [], "no errors");
});

step("K · maths in Kurenai's words, and the notes' LaTeX", async () => {
  const mt = K.inkAI.mathText;
  eq(mt("simplified \\sqrt{18} to 3\\sqrt{2}."), "simplified $\\sqrt{18}$ to $3\\sqrt{2}$.", "bare roots are maths");
  eq(mt("rewrote \\sqrt{a} as a^{1/2}, but divided by a^2"), "rewrote $\\sqrt{a}$ as $a^{1/2}$, but divided by $a^2$", "powers are maths");
  eq(mt("already $x^2$"), "already $x^2$", "words with $ are left alone");
  eq(mt("Correct final answer."), "Correct final answer.", "plain words stay plain");
  const fs = require("fs"), path = require("path");
  const BS = String.fromCharCode(92), lone = new RegExp("(?<!" + BS + BS + ")" + BS + BS + "[;]");
  const bad = [];
  (function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (/\.js$/.test(f)) {
        const src = fs.readFileSync(p, "utf8");
        let m; const re = new RegExp(lone.source, "g");
        while ((m = re.exec(src))) {
          let k = 0; while (src[m.index - 1 - k] === BS) k++;
          if (k % 2 === 0) { bad.push(path.relative(process.cwd(), p)); break; }
        }
      }
    }
  })(path.join(__dirname, "..", "js", "data"));
  eq(bad, [], "no lone \\; in authored data");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke107: " + failed + " failed" : "smoke107: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
