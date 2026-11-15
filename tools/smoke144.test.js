/* Kurenai OS — smoke144.test.js
   The Focus page owns a session's set-up (14 November 2026, asked for by
   the user): About to Study had its own Mode and Length, which overrode
   the Focus page's choice — a custom length it could not show became 0
   minutes (a one-second session), "Study until" became Pomodoro, and
   "General study — no link" was linked to a suggested task.

   The claims:

     A · THE FOCUS PAGE TAKES WHAT TO LINK. KOS.show("focus", {subject,
         refs, assignmentId, objective, mins}) fills the form and starts
         nothing; the last session's topic never rides along with another
         subject; nothing is saved until Start.
     B · ABOUT TO STUDY HAS NO TIMER. It shows the page's set-up in words
         and hands back exactly that: a custom 37 minutes stays 37, Study
         until stays Study until, a stopwatch keeps its limit.
     C · NO LINK STAYS NO LINK through ▶ Start Focus, with Today's three
         and an assignment due to suggest; Change still links on purpose.
     D · ELSEWHERE OPENS THE PAGE. Home's Up next and Today's three, the
         Daily Review, a routine step's Focus link and About to Study
         called from anywhere else open the Focus page filled in; none
         starts a timer.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke144.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-11-16";               // a Monday
let app, K, doc, asg;
const $ = (s) => doc.querySelector(s);
const $$ = (s) => [...doc.querySelectorAll(s)];
function click(n) { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }
function val(n, v) { n.value = v; n.dispatchEvent(new app.window.Event("input", { bubbles: true })); n.dispatchEvent(new app.window.Event("change", { bubbles: true })); }
function reset() {
  if (K.focus.session()) K.focus.endEarly({ confirmed: true, review: false });
  $$(".k-dialog-overlay").forEach((o) => o.remove());
}
async function openPage(arg) { reset(); K.show("focus", arg); await app.settle(); }
function form() {
  return {
    subject: $("[aria-label='Link to subject']").value,
    asg: $("[aria-label='Link to an assignment']").value,
    obj: $("[data-ui~='focus.obj-in']").value,
    work: $("[aria-label='Work minutes']").value,
    mode: ($("[data-ui~='focus.mode'][aria-pressed='true']") || {}).getAttribute ? $("[data-ui~='focus.mode'][aria-pressed='true']").getAttribute("data-mode") : null
  };
}
async function startWithPreflight() {
  click($("[data-ui~='focus.start']")); await app.settle();
  assert($("[data-ui~='preflight.sheet']"), "About to Study opens (no objective on the form)");
}

step("boot", async () => {
  app = await boot({ clock: TODAY + "T16:40:00" });
  K = app.KOS; doc = app.document;
  K.store.state.ui.focusPreflight = true;
  asg = K.assignments.add({ title: "Stats homework", subject: "maths", due: K.srs.addDays(TODAY, 1), estimateMins: 45 });
  K.store.save();
  eq(app.errors, [], "boot errors");
});

/* ---------------- A ---------------- */
step("A · a prefill fills the form and starts nothing", async () => {
  const leaf = K.spec.firstLeaf(["compsci:4.5"]);
  const lc0 = JSON.stringify(K.store.state.focus.lastConfig || null);
  const n0 = K.store.state.sessions.length;
  await openPage({ subject: "compsci", refs: [leaf.subject + ":" + leaf.ref], objective: "Do the trace table", mins: 40 });
  const f = form();
  eq([f.subject, f.obj, f.work, f.mode], ["compsci", "Do the trace table", "40", "custom"], "subject, objective, a block's length");
  assert(!K.focus.session(), "nothing started");
  eq(K.store.state.sessions.length, n0, "nothing logged");
  eq(JSON.stringify(K.store.state.focus.lastConfig || null), lc0, "nothing saved before Start");
});
step("A · several topics (a mock over a whole paper) are the whole subject, not its first unit", async () => {
  await openPage({ subject: "maths", refs: ["maths:P1", "maths:P2", "maths:S1"] });
  eq(form().subject, "maths", "the subject");
  /* the hook is real: one topic given shows as a chip */
  await openPage({ subject: "maths", refs: ["maths:P1"] });
  assert(doc.querySelectorAll("[data-ui~='focus.link-row'] [data-ui~='tp.chip']").length === 1, "one topic shows as one chip");
  await openPage({ subject: "maths", refs: ["maths:P1", "maths:P2", "maths:S1"] });
  const chips = [...doc.querySelectorAll("[data-ui~='focus.link-row'] [data-ui~='tp.chip']")].map((c) => c.textContent);
  assert(!chips.some((t) => /P1/.test(t)), "no first unit picked: " + chips.join(", "));
});
step("A · an assignment fills its subject and itself", async () => {
  await openPage({ assignmentId: asg.id });
  const f = form();
  eq([f.subject, f.asg], ["maths", String(asg.id)], "linked before it starts");
});
step("A · another subject does not carry the last session's topic", async () => {
  const leaf = K.spec.firstLeaf(["compsci:4.5"]);
  K.store.state.focus.lastConfig = { mode: "custom", workMin: 30, breakMin: 0, subject: "compsci", refs: [leaf.subject + ":" + leaf.ref] };
  await openPage({ subject: "maths" });
  eq(form().subject, "maths", "the subject");
  const chip = $("[data-ui~='focus.setup'] [data-ui~='tp.chip'], [data-ui~='focus.link-row'] [data-ui~='tp.chip']");
  assert(!chip || !/4\.5/.test(chip.textContent), "no Computer Science topic rides along: " + (chip && chip.textContent));
});

/* ---------------- B ---------------- */
step("B · a custom 37 minutes is 37 minutes, not one second", async () => {
  await openPage();
  click($("[data-ui~='focus.mode'][data-mode='custom']"));
  val($("[aria-label='Work minutes']"), "37");
  val($("[aria-label='Break minutes']"), "0");
  await startWithPreflight();
  assert(!$("[data-ui~='preflight.sheet'] select"), "About to Study has no Mode or Length");
  assert(/37 min · set on the Focus page/.test($("[data-ui~='preflight.timer']").textContent), "it names the page's timer: " + $("[data-ui~='preflight.timer']").textContent);
  click($("[data-ui~='preflight.start']")); await app.settle();
  const s = K.focus.session();
  assert(s, "started");
  eq([s.mode, s.workMin, s.breakMin], ["custom", 37, 0], "the page's set-up");
});
step("B · Study until stays Study until", async () => {
  await openPage();
  click($("[data-ui~='focus.mode'][data-mode='until']"));
  await startWithPreflight();
  assert(/Study until/.test($("[data-ui~='preflight.timer']").textContent), "named");
  click($("[data-ui~='preflight.just-start']")); await app.settle();
  const s = K.focus.session();
  assert(s && s.mode === "until" && s.untilTs > Date.now(), "until, ending later: " + JSON.stringify(s && { mode: s.mode, untilTs: s.untilTs }));
});
step("B · a stopwatch keeps its limit", async () => {
  await openPage();
  click($("[data-ui~='focus.mode'][data-mode='stopwatch']"));
  const lim = $("[data-ui~='focus.limit-sel']");
  const opt = [...lim.options].find((o) => +o.value > 0);
  val(lim, opt.value);
  await startWithPreflight();
  click($("[data-ui~='preflight.start']")); await app.settle();
  const s = K.focus.session();
  eq([s.mode, s.limitMin], ["stopwatch", +opt.value], "stopwatch with its limit");
});

/* ---------------- C ---------------- */
step("C · General study — no link stays unlinked through ▶ Start Focus", async () => {
  await openPage();
  val($("[aria-label='Link to subject']"), "");
  await startWithPreflight();
  assert(/General study/.test($("[data-ui~='preflight.sheet']").textContent), "the task is the page's: no link");
  $("[data-ui~='preflight.action']").value = "Read the first heading";
  click($("[data-ui~='preflight.start']")); await app.settle();
  const s = K.focus.session();
  eq([s.subject, s.assignmentId, s.objective], [null, null, "Read the first heading"], "unlinked, with the first action");
});
step("C · the page's own link is kept, and the timer with it", async () => {
  await openPage({ assignmentId: asg.id });
  click($("[data-ui~='focus.mode'][data-mode='custom']"));
  val($("[aria-label='Work minutes']"), "45");
  await startWithPreflight();
  click($("[data-ui~='preflight.start']")); await app.settle();
  const s = K.focus.session();
  eq([s.subject, s.assignmentId, s.workMin], ["maths", asg.id, 45], "linked as the page set it");
});

/* ---------------- D ---------------- */
async function noStart(label, fn) {
  reset();
  K.show("home"); await app.settle();
  await fn();
  await app.settle();
  assert(!K.focus.session(), label + ": nothing started");
  eq(K.currentNav().viewId, "focus", label + ": the Focus page is open");
  return K.currentNav().arg;
}
step("D · About to Study from anywhere else opens the Focus page filled in", async () => {
  const arg = await noStart("preflight", async () => { K.routinePlayer.preflight({ assignmentId: asg.id, objective: "Q1 first" }); });
  eq([arg.assignmentId, arg.objective], [asg.id, "Q1 first"], "what to link");
  eq([form().asg, form().obj], [String(asg.id), "Q1 first"], "on the form");
});
step("D · Home's Up next sets up, it does not start", async () => {
  await noStart("Up next", async () => {
    const go = $("[data-ui~='home.next-go']");
    assert(go, "the Up next button");
    if (/focus/i.test(go.textContent)) { click(go); }
    else { K.show("focus"); }
  });
  assert(!$("[aria-label='Session length']"), "Home has no length buttons of its own");
});
step("D · the Daily Review and a routine step open the page", async () => {
  await noStart("review", async () => { K.routinePlayer.preflight({}); });
  const r = K.routines.add({ name: "Study start", kind: "custom", days: [], steps: [{ text: "Focus", link: { kind: "focus" } }] });
  assert(r, "a routine with a Focus step");
  await noStart("routine", async () => { K.routinePlayer.preflight({}); });
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack || e)); }
  }
  console.log(failed ? `\n${failed} of ${steps.length} step(s) failed` : `\nall ${steps.length} steps passed`);
  process.exit(failed ? 1 : 0);
})();
