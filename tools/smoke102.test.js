/* Kurenai OS — smoke102.test.js
   The Daily Review's core (roadmap 5.10, docs/routines-plan.md §6–9;
   invariants 144–146), before its overlay ships.

   The claims:

     A · ON AT BOOT, WITH ITS KIND: the notification kind is known; a
         tick before the morning time pushes nothing.
     B · SETTINGS through one gate: defaults, bad times refused, weekday
         and weekend times.
     C · ONE ON SCREEN (invariant 145): due(now) offers at most one review
         — none before the morning time, the latest slot passed, never a
         done or skipped one; earlier slots fold into it; 00:30 is still
         that evening; yesterday's evening is never offered the next
         morning, which says "Yesterday, quickly" instead; a slot turned
         off is passed over.
     D · SHOWN FOLDS: showing a review marks the earlier open slots
         folded; the afternoon then carries the morning's still-relevant
         part.
     E · REVIEWS READ, OWNERS WRITE (invariant 144): triage moves a
         reminder's date, adds an assignment's work-on day (never its
         deadline), leaves a plan row in its week, completes through the
         owner; Undo puts both back; the review keeps only refs and its
         own choices; nothing it does itself pays.
     F · THE STEPS: last night's first task opens the morning; today's
         three resolve live; a step with nothing to show is left out; the
         evening lists what is unfinished and tomorrow.
     G · THE WORDS (invariant 146): the template at once and the same
         twice; Kurenai's when written, once, cached; a failure keeps the
         template; the payload holds titles and counts and never the note,
         mood or energy.
     H · NOTICES (when on): review:<slot>:<day>, a closed slot never; the
         outlook carries them.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke102.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-10-21";               // a Wednesday
function day(n, from) {
  const [y, m, d] = (from || TODAY).split("-").map(Number);
  const x = new Date(y, m - 1, d + n);
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}
function at(d, hm) { const [y, m, dd] = d.split("-").map(Number); const [h, mi] = hm.split(":").map(Number); return new Date(y, m - 1, dd, h, mi).getTime(); }

let app, K, V;
function gov() { const g = K.store.state.governor; return [g.xp, g.gold, g.hp, K.store.state.sessions.length]; }

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; V = K.dayReview;
  K.store.state.calendar.events = [];
  K.store.state.reminders.items = [];
  K.store.state.assignments.items = [];
  eq(app.errors, [], "boot errors");
});

step("A · on at boot, with its kind", () => {
  eq(V.enabled(), true, "on");
  assert(K.notify.KINDS.review, "the kind");
  const n = (K.store.state.notify.items || []).length;
  V.tick(at(TODAY, "06:30"));
  eq((K.store.state.notify.items || []).length, n, "nothing before the morning time");
});

step("B · settings", () => {
  const c = V.cfg();
  eq([c.slots.morning.weekday, c.slots.afternoon.weekday, c.slots.evening.weekday, c.words, c.dayStart], ["07:00", "16:30", "22:00", "kurenai", "04:00"], "defaults");
  V.setConfig({ slots: { morning: { on: true, weekday: "25:00", weekend: "08:30" } }, dayStart: "11:00" });
  eq([V.cfg().slots.morning.weekday, V.cfg().slots.morning.weekend, V.cfg().dayStart], ["07:00", "08:30", "04:00"], "bad times refused, good ones kept");
  eq(V.slotTime("morning", TODAY), "07:00", "a weekday");
  eq(V.slotTime("morning", "2026-10-24"), "08:30", "a Saturday");
  V.setConfig({ slots: { morning: { on: true, weekday: "07:00", weekend: "09:00" } } });
});

step("C · one on screen", () => {
  const d = (hm, on) => V.due(at(on || TODAY, hm));
  eq(d("06:30"), null, "before the morning time");
  eq([d("07:30").slot, d("07:30").folded], ["morning", []], "the morning");
  eq([d("17:00").slot, d("17:00").folded], ["afternoon", ["morning"]], "an open morning folds into the afternoon");
  eq([d("23:00").slot, d("23:00").folded], ["evening", ["morning", "afternoon"]], "both into the evening");
  eq([d("00:30", day(1)).slot, d("00:30", day(1)).day], ["evening", TODAY], "00:30 is still that evening");
  eq(d("07:30", day(1)).yesterday, true, "a missed evening: Yesterday, quickly");
  K.store.state.dayReview.days[TODAY] = { morning: { state: "skipped" } };
  eq(d("17:00").folded, [], "a skipped morning folds nothing");
  K.store.state.dayReview.days[TODAY].afternoon = { state: "done" };
  eq(d("17:00"), null, "a done slot is never offered");
  eq(d("22:30").slot, "evening", "the next one is");
  V.setConfig({ slots: { afternoon: { on: false } } });
  eq(d("17:00"), null, "the afternoon off: the done morning... nothing");
  K.store.state.dayReview.days[TODAY] = {};
  eq(d("17:00").slot, "morning", "with the afternoon off, 17:00 is still the morning's");
  V.setConfig({ slots: { afternoon: { on: true, weekday: "16:30", weekend: "15:00" } } });
  K.store.state.dayReview.days[day(1)] = {};
  K.store.state.dayReview.days[TODAY] = { evening: { state: "done" } };
  eq(d("07:30", day(1)).yesterday, false, "an evening done: nothing from yesterday");
  K.store.state.dayReview.days = {};
});

step("D · shown folds", () => {
  V.markShown("afternoon", at(TODAY, "17:00"));
  eq(K.store.state.dayReview.days[TODAY].morning.state, "folded", "the morning folded");
  const c = V.content("afternoon", { now: at(TODAY, "17:00") });
  const ids = c.steps.map((s) => s.id);
  eq(ids.slice(0, 2), ["sofar", "three"], "the afternoon gains the morning's Three, after So far");
  assert(c.steps[1].folded, "marked as from this morning");
  K.store.state.dayReview.days = {};
});

let ids = {};
step("E · reviews read, owners write", () => {
  ids.rem = K.reminders.add({ title: "Email Mr Hart", due: TODAY, dueTime: "16:00" }).id;
  ids.asg = K.assignments.add({ title: "Stats homework", due: day(2), subject: "maths" }).id;
  const g0 = gov();
  let r = V.triage({ kind: "reminder", id: ids.rem }, "tomorrow", { now: at(TODAY, "22:10") });
  assert(r.ok, "triaged");
  eq([K.reminders.get(ids.rem).due, K.reminders.get(ids.rem).dueTime], [day(1), "16:00"], "the reminder moved by its owner");
  eq(K.store.state.dayReview.days[TODAY].evening.triaged["reminder:" + ids.rem], "tomorrow", "the review keeps its choice");
  r.undo();
  eq(K.reminders.get(ids.rem).due, TODAY, "Undo puts it back");
  assert(!K.store.state.dayReview.days[TODAY].evening.triaged["reminder:" + ids.rem], "and the choice");
  r = V.triage({ kind: "assignment", id: ids.asg }, "tomorrow", { now: at(TODAY, "22:10") });
  eq([K.assignments.get(ids.asg).due, K.assignments.get(ids.asg).workOn], [day(2), [day(1)]], "a work-on day, never the deadline");
  r.undo();
  eq("workOn" in K.assignments.get(ids.asg), false, "undone");
  eq(V.triage({ kind: "assignment", id: ids.asg }, "week", { now: at(TODAY, "22:10") }).ok, false, "a week choice needs its day");
  V.triage({ kind: "assignment", id: ids.asg }, "leave", { now: at(TODAY, "22:10") });
  eq(gov(), g0, "moving and leaving pay nothing and log nothing");
  const plan = K.pacing.entries().find((e) => e.source === "personal" && !e.done);
  if (plan) {
    const p = V.triage({ kind: "plan", id: plan.id }, "tomorrow", { now: at(TODAY, "22:10") });
    assert(p.ok && /stay in their week/.test(p.note), "a plan row stays in its week");
    eq(K.pacing.entryById(plan.id).wb, plan.wb, "unmoved");
  }
  V.setThree([{ kind: "assignment", id: ids.asg }, { kind: "reminder", id: ids.rem }, { kind: "bogus", id: 1 }], at(TODAY, "07:20"));
  eq(K.store.state.dayReview.days[TODAY].morning.three, [{ kind: "assignment", id: ids.asg }, { kind: "reminder", id: ids.rem }], "refs only, and only real kinds");
  V.markShown("morning", at(TODAY, "07:20"));
  V.finish("morning", "done", at(TODAY, "07:25"));
  V.setWindDown({ note: "A good day.", mood: 4, energy: 9 }, at(TODAY, "22:20"));
  eq([K.store.state.dayReview.days[TODAY].evening.mood, "energy" in K.store.state.dayReview.days[TODAY].evening], [4, false], "1–5 only");
  eq(gov(), g0, "nothing the review does itself pays");
});

step("F · the steps", () => {
  /* the evening sets tomorrow's first task; the next morning opens with it */
  V.setFirst({ kind: "assignment", id: ids.asg }, "Open the stats sheet and do Q1", at(TODAY, "22:15"), true);
  const m = V.content("morning", { now: at(day(1), "07:10") });
  const ln = m.steps.find((s) => s.id === "lastNight");
  eq([ln.first.title, ln.first.action], ["Stats homework", "Open the stats sheet and do Q1"], "last night's first task");
  eq(m.steps.find((s) => s.id === "start").first.title, "Stats homework", "and it is the start");
  assert(!m.steps.find((s) => s.id === "routine"), "no routines on: no routine step");
  const ev = V.content("evening", { now: at(TODAY, "22:00") });
  const un = ev.steps.find((s) => s.id === "unfinished");
  assert(un && un.items.some((x) => x.ref.kind === "assignment" && x.ref.id === ids.asg && x.why === "three"), "an open pick is unfinished");
  const tm = ev.steps.find((s) => s.id === "tomorrow");
  eq(tm.date, day(1), "tomorrow");
  eq(tm.first.title, "Stats homework", "tomorrow's first task");
  K.reminders.complete(ids.rem, true);
  const three = V.content("afternoon", { now: at(TODAY, "16:40") }).steps.find((s) => s.id === "sofar").three;
  eq(three.map((x) => [x.title, x.done]), [["Stats homework", false], ["Email Mr Hart", true]], "the three resolve live");
});

step("G · the words", async () => {
  const c = V.content("evening", { now: at(TODAY, "22:00") });
  const t1 = V.template("evening", c), t2 = V.template("evening", c);
  eq(t1, t2, "deterministic");
  assert(t1.text.length > 10 && t1.line, "words");
  const p = JSON.stringify(V.payload("evening", c));
  assert(p.indexOf("A good day.") === -1 && p.indexOf("mood") === -1 && p.indexOf("energy") === -1, "never the note, mood or energy");
  assert(p.indexOf("Stats homework") !== -1, "titles are sent");
  eq(V.words("evening", c).byKurenai, false, "the template until she writes");
  /* Kurenai answers once */
  let calls = 0;
  const realChat = K.ai.chat;
  K.ai.chat = (cat, opts, cb) => { calls++; setTimeout(() => cb(null, { text: JSON.stringify({ line: "Good evening.", text: "A steady day: some Focus, one thing still open. Tomorrow starts with stats." }) }), 0); return {}; };
  await new Promise((res) => V.ensureWords("evening", { now: at(TODAY, "22:00") }, res));
  await new Promise((res) => V.ensureWords("evening", { now: at(TODAY, "22:00") }, res));
  eq(calls, 1, "written once");
  const w = V.words("evening", V.content("evening", { now: at(TODAY, "22:00") }));
  eq([w.byKurenai, w.line], [true, "Good evening."], "hers when written");
  /* a failure keeps the template */
  K.ai.chat = (cat, opts, cb) => { calls++; setTimeout(() => cb({ kind: "rate" }), 0); return {}; };
  let err = null;
  await new Promise((res) => V.ensureWords("afternoon", { now: at(TODAY, "16:40") }, (e) => { err = e; res(); }));
  assert(err, "the error comes back");
  eq(V.words("afternoon", V.content("afternoon", { now: at(TODAY, "16:40") })).byKurenai, false, "the template stays");
  V.setConfig({ words: "template" });
  eq(V.words("evening", V.content("evening", { now: at(TODAY, "22:00") })).byKurenai, false, "the setting picks the template");
  V.setConfig({ words: "kurenai" });
  K.ai.chat = realChat;
});

step("H · notices", async () => {
  const items = V.forecast(at(TODAY, "06:00"), at(day(2), "06:00"));
  const ids2 = items.map((x) => x.id);
  assert(ids2.indexOf("review:morning:" + TODAY) === -1, "a done morning is not forecast");
  assert(ids2.indexOf("review:evening:" + TODAY) !== -1 && ids2.indexOf("review:morning:" + day(1)) !== -1, "the rest are");
  eq(items.find((x) => x.id === "review:evening:" + TODAY).at, at(TODAY, "22:00"), "at its time");
  const out = await new Promise((res) => K.outlook.build((e, o) => res(o), { now: at(TODAY, "10:00") }));
  assert(out.items.some((x) => x.kind === "review"), "the outlook carries them");
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke102: " + failed + " failed" : "smoke102: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
