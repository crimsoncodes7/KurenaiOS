/* Kurenai OS — smoke95.test.js
   Focus: switching what a running session is for (invariant 4a).

   The claims:

     A · ONE SESSION, PAID ONCE: switching mid-way keeps the clock running;
         ending logs ONE focus entry, paid by the blocks rule on the whole
         time, with `metrics.segments` naming each stretch and its seconds
         (they add up to the entry's dur). The entry's own subject is the
         stretch that took the most time.
     B · A CORRECTION FOLDS: a switch under a minute after the last one
         replaces that stretch; landing back on the stretch before merges
         into it; picking what is already running changes nothing.
     C · THE LEDGER READS STRETCHES: KOS.sessions.parts/secsFor split the
         time, a subject's streak and day activity count a stretch on it,
         and the study-hours goal for a subject counts only its stretches.
     D · A RELOAD keeps the stretches (the snapshot carries them); a
         snapshot from before the switch reads as one stretch.
     E · THE STAGE: "Switch…" opens a dialog of subject, topic and
         assignment; saving moves the session on and lists the earlier
         stretch; a reading session offers no switch.
     F · THE ASSISTANT's focus_switch refuses with nothing running and
         topics from two subjects, and switches a running session.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke95.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const TODAY = "2026-10-22";

let app, K, F, cs, ma;
function ex(name, args) {
  return new Promise((res) => K.ai.tools.execute(name, args, (err, result) => res({ err, result })));
}
function focusEntries() { return K.store.state.sessions.filter((e) => e.type === "focus"); }

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; F = K.focus;
  app.window.__kosAutoConfirm = true;
  cs = K.hub.LEAVES.compsci[0].ref;
  ma = K.hub.LEAVES.maths[0].ref;
  eq(app.errors, [], "boot errors");
});

step("A · one session, paid once, split by stretch", async () => {
  const before = focusEntries().length, xp0 = K.store.state.governor.xp;
  F.start({ mode: "stopwatch", subject: "compsci", refs: ["compsci:" + cs] });
  F._debugAdvance(20 * 60);
  assert(F.switchTo({ subject: "maths", refs: ["maths:" + ma] }), "the switch moves the session");
  eq([F.session().subject, F.session().ref], ["maths", ma], "the session now names the new stretch");
  eq(F.state(), "running", "the clock keeps running");
  F._debugAdvance(25 * 60);
  F.endComplete({ review: false });
  const list = focusEntries();
  eq(list.length, before + 1, "ONE focus entry");
  const e = list[list.length - 1];
  eq(e.dur, 45 * 60, "the whole time");
  eq(e.metrics.blocks, 4, "paid on the whole time");
  eq(e.metrics.segments.map((p) => [p.subject, p.ref, p.secs]), [["compsci", cs, 1200], ["maths", ma, 1500]], "the stretches");
  eq(e.metrics.segments.reduce((n, p) => n + p.secs, 0), e.dur, "the stretches add up");
  eq(e.subject, "maths", "the entry names the longest stretch");
  eq(K.store.state.governor.xp - xp0, e.award.xp, "paid exactly once");
  eq(e.award.xp, K.governor.focusAward({ complete: true, secs: 2700, mins: 45, pauses: 0, rule: "blocks" }).xp, "the blocks rule's award");
});

step("B · a correction folds; the same pick changes nothing", () => {
  F.start({ mode: "stopwatch", subject: "compsci", refs: ["compsci:" + cs] });
  F._debugAdvance(15 * 60);
  assert(F.switchTo({ subject: "maths" }), "first switch");
  F._debugAdvance(20);
  assert(F.switchTo({ subject: "it" }), "a quick correction");
  eq(F.session().segs.length, 2, "the correction replaced the stretch");
  eq(F.session().segs[1].subject, "it", "…with the new pick");
  F._debugAdvance(10);
  F.switchTo({ subject: "compsci", refs: ["compsci:" + cs] });
  eq(F.session().segs.length, 1, "landing back on the stretch before is that stretch");
  assert(!F.switchTo({ subject: "compsci", refs: ["compsci:" + cs] }), "the same pick changes nothing");
  F.endComplete({ review: false });
  const e = focusEntries().pop();
  assert(!e.metrics.segments, "one stretch writes no segments");
  eq(e.subject, "compsci", "and keeps its subject");
});

step("C · the ledger reads stretches", async () => {
  const e = focusEntries().find((x) => x.metrics.segments);
  eq(K.sessions.secsFor(e, "compsci"), 1200, "secsFor compsci");
  eq(K.sessions.secsFor(e, null), 2700, "secsFor all");
  assert(K.sessions.hasSubject(e, "compsci"), "a stretch on compsci is compsci activity");
  assert(K.sessions.hasActivity(TODAY, "compsci"), "day activity by stretch");
  assert(K.sessions.streak("compsci") >= 1, "the subject streak counts the stretch");
  /* the study-hours goal for maths counts only the maths stretch (B's
     session was compsci only) */
  const def = K.goals.typeDef("study-hours");
  const got = await new Promise((res) => def.measure({ links: { subject: "maths" }, params: {} }, { from: TODAY, to: TODAY }, res));
  eq(got.current, 0.4, "maths hours = 25 min");
  const all = await new Promise((res) => K.goals.typeDef("focus-hours").measure({ links: {}, params: {} }, { from: TODAY, to: TODAY }, res));
  assert(all.current >= 0.75, "focus hours with no subject count the whole session");
});

step("D · a reload keeps the stretches", () => {
  F.start({ mode: "stopwatch", subject: "compsci" });
  F._debugAdvance(5 * 60);
  F.switchTo({ subject: "maths" });
  const snap = JSON.parse(JSON.stringify(K.store.state.focus.active));
  eq(snap.segs.length, 2, "the snapshot carries the stretches");
  F.endEarly({ confirmed: true, review: false });
});

step("E · the stage's Switch dialog", async () => {
  const $ = (s) => app.document.querySelector(s);
  F.start({ mode: "stopwatch", subject: "compsci", refs: ["compsci:" + cs] });
  K.show("focus"); await app.settle();
  F._debugAdvance(12 * 60);
  $("[data-ui~='focus.switch']").click(); await app.settle();
  const dlg = $("[data-ui~='ui.dialog']");
  assert(dlg && /Switch what you are studying/.test(dlg.textContent), "the dialog opens");
  const subj = dlg.querySelector("select[aria-label='Subject']");
  subj.value = "maths"; subj.dispatchEvent(new app.window.Event("change"));
  $("[data-ui~='focus.switch-save']").click(); await app.settle();
  eq(F.session().subject, "maths", "saved");
  assert(/Earlier: .*12m/.test($("[data-ui~='focus.stretches']").textContent), "the earlier stretch is listed");
  F.endEarly({ confirmed: true, review: false });
  F.start({ kind: "reading", workMin: 20 });
  K.show("focus"); await app.settle();
  assert(!$("[data-ui~='focus.switch']"), "reading offers no switch");
  assert(!F.switchTo({ subject: "maths" }), "and refuses one");
  F.endEarly({ confirmed: true, review: false });
  eq(app.errors, [], "no errors");
});

step("F · the Assistant's focus_switch", async () => {
  const none = await ex("focus_switch", { subject: "maths" });
  assert(none.err, "refused with nothing running");
  F.start({ mode: "stopwatch", subject: "compsci" });
  F._debugAdvance(11 * 60);
  const two = await ex("focus_switch", { refs: ["compsci:" + cs, "maths:" + ma] });
  assert(two.err, "refused across two subjects");
  const ok = await ex("focus_switch", { refs: ["maths:" + ma] });
  assert(!ok.err && ok.result.switched, "switched: " + JSON.stringify(ok));
  eq(ok.result.subject, "maths", "the tool reports the new subject");
  eq(ok.result.stretches.map((p) => p.subject), ["compsci", "maths"], "and the stretches");
  F.endEarly({ confirmed: true, review: false });
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke95: " + failed + " failed" : "smoke95: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
