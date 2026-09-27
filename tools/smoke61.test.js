/* Kurenai OS — smoke61.test.js
   Roadmap 1.6: Focus — the stopwatch, "study until", the per-10-minute
   award, the idle watch and the mini-player's place.

   The claims:

     A · STOPWATCH counts up with no interval, is ended with Stop, and pays
         every full 10 minutes (invariant 4a); under 10 minutes it is logged,
         pays nothing and is not complete (so no streak).
     B · STUDY UNTIL takes a clock time a minute to 12 hours away, ends by
         itself at that time (pauses do not move it), and pays like Custom.
     C · CUSTOM keeps the blocks it earned when ended early.
     D · 4b/4c HOLD: the session is logged and paid before any review; a
         page hide banks the count-up clock; a reload restores it paused
         with the time intact.
     E · THE IDLE WATCH: 30 minutes untouched warns (a "focus"
         notification); an interaction clears it; 5 more minutes untouched
         ends the session and credits only the focus before the last
         interaction. Reading and paused sessions are never watched.
     F · THE MINI-PLAYER: one pure clamp keeps it inside the viewport,
         within the size limits and snapped to an edge it nears; its place
         is per device (state.ui) and re-clamped when read.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke61.test.js                                            */
"use strict";
const { boot, CLOCK } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": " + JSON.stringify(a) + " vs " + JSON.stringify(b)); }

let app, KOS;
const F = () => KOS.focus;
const G = () => KOS.store.state.governor;
const last = () => KOS.sessions.all()[KOS.sessions.all().length - 1];
const now = () => app.window.Date.now();
function clear() { if (F().session()) F().endEarly({ confirmed: true, review: false }); }

/* ============ A · stopwatch ============ */
step("A · a stopwatch counts up, has no interval, and Stop pays every full 10 minutes", () => {
  clear();
  const s = F().start({ mode: "stopwatch", subject: "compsci", refs: ["compsci:4.1"] });
  assert(s && s.mode === "stopwatch" && s.workMin === null, "started as a stopwatch: " + JSON.stringify(s && s.mode));
  F()._debugAdvance(1250);
  F().tick();
  assert(F().session() && F().session().cycles === 0, "no interval ends a stopwatch");
  const clock = app.document.querySelector("[data-ui~='focus.clock']");
  F().tick();
  assert(clock && /^\d+:\d{2}$/.test(clock.textContent) && clock.textContent === "20:50", "the clock counts up: " + (clock && clock.textContent));
  assert(F().canComplete(), "Stop is always available");
  const xp0 = G().xp, gold0 = G().gold;
  F().endComplete({ review: false });
  const e = last();
  eq([e.type, e.dur, e.metrics.mode, e.metrics.rule, e.metrics.blocks, e.metrics.complete], ["focus", 1250, "stopwatch", "blocks", 2, true], "the logged session");
  eq([G().xp - xp0, G().gold - gold0], [24, 2], "two blocks: 24 XP, 2 gold");
});

step("A · under 10 minutes: logged, not complete, nothing paid", () => {
  clear();
  F().start({ mode: "stopwatch" });
  F()._debugAdvance(540);
  const xp0 = G().xp, streak0 = KOS.sessions.streak(null);
  F().endComplete({ review: false });
  eq([last().metrics.complete, last().metrics.blocks], [false, 0], "incomplete, no block");
  eq(G().xp, xp0, "no award");
  assert(/under 10 minutes/.test(KOS.governor.lastAward().notes.join()), "the award says why");
  assert(KOS.sessions.streak(null) === streak0, "an incomplete session moves no streak");
});

/* ============ B · study until ============ */
step("B · untilTarget: a clock time a minute to 12 hours away, else refused", () => {
  const t0 = now();
  const hm = ms => { const d = new app.window.Date(t0 + ms); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const in30 = F().untilTarget(hm(30 * 60000), t0) - t0;
  assert(in30 > 29 * 60000 && in30 <= 30 * 60000 && new app.window.Date(t0 + in30).getSeconds() === 0, "30 minutes from now, on the minute: " + in30);
  eq(F().untilTarget(hm(0), t0), null, "now is not a target");
  eq(F().untilTarget(hm(13 * 3600000), t0), null, "more than 12 hours");
  eq(F().untilTarget(hm(-60 * 60000), t0), null, "an hour ago is refused, not read as tomorrow");
  eq([F().untilTarget("25:00", t0), F().untilTarget("nope", t0)], [null, null], "malformed");
  const late = new app.window.Date(t0); late.setHours(23, 0, 0, 0);
  const at = F().untilTarget("00:30", late.getTime());
  eq(at - late.getTime(), 90 * 60000, "past midnight rolls to tomorrow");
});

step("B · a study-until session ends itself at its time, and a pause does not move it", () => {
  clear();
  const t0 = now();
  const hm = new app.window.Date(t0 + 45 * 60000);
  const until = String(hm.getHours()).padStart(2, "0") + ":" + String(hm.getMinutes()).padStart(2, "0");
  eq(F().start({ mode: "until", until: "99:99" }), null, "a bad time starts nothing");
  const s = F().start({ mode: "until", until: until, subject: "maths" });
  const target = s.untilTs;
  F().pause(); F().resume();
  eq(F().session().untilTs, target, "pausing does not move the end");
  /* the clock reaches the time: 30 minutes ran */
  F().session().phaseStartTs = now() - 30 * 60000;
  F().session().untilTs = now();
  F().tick();
  assert(!F().session(), "the session ended itself");
  eq([last().metrics.mode, last().metrics.ended, last().metrics.blocks, last().metrics.until], ["until", "until", 3, until], "logged");
});

/* ============ C · custom ============ */
step("C · a Custom session ended early keeps its blocks", () => {
  clear();
  F().start({ mode: "custom", workMin: 60, breakMin: 0 });
  F()._debugAdvance(25 * 60);
  const xp0 = G().xp;
  F().endEarly({ confirmed: true, review: false });
  eq([last().metrics.rule, last().metrics.blocks, last().metrics.complete, last().metrics.ended], ["blocks", 2, true, "early"], "two blocks kept");
  eq(G().xp - xp0, 24, "paid for them");
});

/* ============ D · 4b / 4c ============ */
step("D · paid before the review; a page hide banks the count-up clock", () => {
  clear();
  F().start({ mode: "stopwatch" });
  F()._debugAdvance(700);
  app.window.dispatchEvent(new app.window.Event("pagehide"));
  const s = F().session();
  assert(s.state === "running" && Math.round(s.phaseAccum) === 700, "banked without pausing: " + s.phaseAccum);
  app.window.dispatchEvent(new app.window.Event("pageshow"));
  const n0 = KOS.sessions.all().length;
  F().endComplete();                                  // the review opens — after the log
  eq(KOS.sessions.all().length, n0 + 1, "logged before the review");
  assert(KOS.governor.lastAward().xp === 12, "paid before the review");
  const ov = app.document.querySelector("[data-ui~='ui.dialog-overlay']");
  if (ov) ov.remove();
});

step("D · a reload restores a stopwatch paused, with its time", async () => {
  const base = Date.parse(CLOCK);
  const snap = { id: "f9", kind: "study", mode: "stopwatch", workMin: null, breakMin: 0, subject: null, ref: null, refs: [],
    state: "running", phase: "work", phaseAccum: 0, phaseStartTs: base - 20 * 60000, lastBeat: base - 5 * 60000,
    workAccum: 0, cycles: 0, pauses: 0, distractions: [], startedAt: base - 20 * 60000 };
  const b = await boot({ storage: { "kurenai-os-v1": JSON.stringify({ progress: {}, focus: { active: snap, nextId: 10 } }) } });
  const s = b.KOS.focus.session();
  eq([s.state, Math.round(b.KOS.focus.workSeconds()), s.restores], ["paused", 900, 1], "paused, 15 minutes kept, recovery counted");
  b.KOS.focus.endComplete({ review: false });
  const e = b.KOS.sessions.all().pop();
  eq([e.dur, e.metrics.blocks], [900, 1], "paid for what it held");
});

/* ============ E · the idle watch ============ */
step("E · idleVerdict is the one rule", () => {
  const W = F().IDLE.warn, g = F().IDLE.grace;
  eq([W, g], [30 * 60000, 5 * 60000], "30 + 5 minutes");
  eq([F().idleVerdict(W - 1, 0, null), F().idleVerdict(W, 0, null), F().idleVerdict(W + g - 1, 0, W), F().idleVerdict(W + g, 0, W)],
    ["ok", "warn", "ok", "end"], "verdicts");
});

step("E · 30 minutes untouched warns; an interaction clears it", () => {
  clear();
  F().start({ mode: "custom", workMin: 90, breakMin: 0 });
  F()._debugAdvance(40 * 60);
  const s = F().session();
  s.lastActiveTs = now() - 31 * 60000; s.activeWork = 600;
  F().tick();
  assert(s.idleWarnedAt != null, "warned");
  assert(KOS.store.state.notify.items.some(i => i.kind === "focus" && i.id.indexOf("focus:idle:" + s.id) === 0), "a focus notification");
  app.document.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: "a" }));
  assert(s.idleWarnedAt === null && s.lastActiveTs === now(), "an interaction restarts the 30 minutes");
  assert(Math.round(s.activeWork) === 2400, "and marks the focus done by then");
});

step("E · 5 more minutes untouched ends it, crediting only what came before", () => {
  const s = F().session();
  const id = s.id;
  s.lastActiveTs = now() - 36 * 60000; s.activeWork = 1300; s.activeCycles = 0;
  s.idleWarnedAt = now() - 6 * 60000;
  const xp0 = G().xp;
  F().tick();
  assert(!F().session(), "ended");
  const e = last();
  eq([e.dur, e.metrics.ended, e.metrics.blocks, e.metrics.complete], [1300, "idle", 2, true], "credited to the last interaction");
  eq(G().xp - xp0, 24, "paid for the credited blocks only");
  assert(KOS.store.state.notify.items.some(i => i.id === "focus:ended:" + id), "the end is a notification too");
});

step("E · reading and paused sessions are never watched", () => {
  clear();
  F().start({ kind: "reading", workMin: 60 });
  F().session().lastActiveTs = now() - 60 * 60000;
  F().tick();
  assert(F().session() && F().session().idleWarnedAt === null, "reading is rest");
  clear();
  F().start({ mode: "stopwatch" });
  F().pause();
  F().session().lastActiveTs = now() - 60 * 60000;
  F().tick();
  assert(F().session() && F().session().idleWarnedAt === null, "a paused session accrues nothing and is not watched");
  clear();
});

/* ============ F · the mini-player ============ */
step("F · clampMini: inside the viewport, within the limits, snapped to a near edge", () => {
  const C = F().clampMini, M = F().MINI;
  eq(C({ x: -50, y: 10, w: 300, h: 80 }, 1280, 800), { x: 8, y: 8, w: 300, h: 80 }, "pulled in and snapped to the corner");
  eq(C({ x: 2000, y: 400, w: 300, h: 80 }, 1280, 800), { x: 972, y: 400, w: 300, h: 80 }, "kept on the right edge");
  eq(C({ x: 960, y: 700, w: 300, h: 80 }, 1280, 800).x, 972, "snapped flush when within 16px");
  eq(C({ x: 100, y: 100, w: 50, h: 10 }, 1280, 800), { x: 100, y: 100, w: M.minW, h: M.minH }, "minimum size");
  eq(C({ x: 100, y: 100, w: 9000, h: 9000 }, 1280, 800), { x: 100, y: 100, w: M.maxW, h: M.maxH }, "maximum size");
  eq(C({ x: 0, y: 0, w: 300, h: 80 }, 150, 800).w, 134, "a viewport narrower than the minimum fits it anyway");
  eq(C({ x: "a", y: 0, w: 1, h: 1 }, 1280, 800), null, "junk is refused");
});

step("F · the place is per device and re-clamped when read", () => {
  const r = F().setMiniRect({ x: 900, y: 500, w: 320, h: 120 }, 1280, 800);
  eq(KOS.store.state.ui.focusMini, r, "stored in state.ui");
  const smaller = F().miniRect(1000, 600);
  assert(smaller.x + smaller.w <= 1000 - 8 && smaller.y + smaller.h <= 600 - 8, "a smaller window never strands it: " + JSON.stringify(smaller));
  eq(KOS.store.state.ui.focusMini, r, "reading writes nothing");
  eq(F().setMiniRect(null), null, "cleared");
  assert(!("focusMini" in KOS.store.state.ui), "back to the default dock");
  eq(F().setMiniRect({ x: "?" }, 1280, 800), null, "junk writes nothing");
});

(async () => {
  app = await boot();
  KOS = app.KOS;
  app.window.__kosAutoConfirm = false;
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.stack ? e.stack.split("\n").slice(0, 2).join(" | ") : e)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE61: " + fails + " failure(s)" : "\nSMOKE61: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
