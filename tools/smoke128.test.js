/* Kurenai OS — smoke128.test.js
   Streak-milestone gold pays once per run (quality W1, RC21; HR-16).

   The receipt for a milestone is the day the run REACHED it, counted from
   the run's real last day. It used to be counted from TODAY, so a run that
   ends yesterday (a habit tick or an episode logged before studying) wrote
   one key, studying later the same day wrote another, and the bonus paid
   twice.

     A · a run of 7 study days ending yesterday: the first session today (a
         habit tick) pays the 7-day bonus once (the 3 is recorded,
         unpaid: only the highest new milestone pays, ST-20).
     B · a second tick pays no bonus.
     C · studying later that day (the run now ends today, 8 days) pays no
         bonus again — the case that paid twice.
     D · a key stored one day off (the old reckoning of the same run) is
         honoured: no repayment after the update.
     E · a new run after a gap re-earns the 3-day bonus.

   Run: node tools/smoke128.test.js */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, today, day;
function studyOn(date, id) {
  return { id, ts: Date.parse(date + "T10:00:00"), date, type: "flashcards", subject: "compsci", ref: "4.1.1.1", dur: 300, metrics: { cards: 5 }, award: { xp: 20, gold: 3 } };
}
function last() { const L = K.store.state.sessions; return L[L.length - 1]; }
function tick() { K.sessions.log({ type: "todo", metrics: { item: "A habit" } }); return last(); }

step("boot", async () => {
  app = await boot();
  K = app.KOS;
  await app.settle();
  today = K.srs.todayISO();
  day = (n) => K.srs.addDays(today, n);
});

step("A · the first session today pays the 7-day bonus once, the 3 recorded", async () => {
  const st = K.store.state;
  st.sessions = [];
  for (let i = 7; i >= 1; i--) st.sessions.push(studyOn(day(-i), 1000 + i));
  st.governor.milestones = {};
  eq(K.sessions.streak(null), 7, "a 7-day run ending yesterday");
  const e = tick();
  eq(e.award.gold, 1 + 7, "the tick's 1 gold plus the 7-day bonus (only the highest new one pays, ST-20)");
  eq(st.governor.milestones.streak7, day(-1), "keyed to the day the run reached 7");
  eq(st.governor.milestones.streak3, day(-5), "and 3");
});

step("B · a second tick pays no bonus", async () => {
  eq(tick().award.gold, 1, "the tick's own gold only");
});

step("C · studying later the same day pays no bonus again (HR-16)", async () => {
  K.sessions.log({ type: "flashcards", subject: "compsci", ref: "4.1.1.1", dur: 300, metrics: { cards: 5 } });
  eq(K.sessions.streak(null), 8, "the run now ends today");
  eq(last().award.gold, 3, "a flashcard session's 3 gold, no milestone");
});

step("D · a key one day off (the old reckoning) is honoured", async () => {
  const g = K.store.state.governor;
  g.milestones.streak7 = day(0);          /* the old off-by-one key */
  eq(tick().award.gold, 1, "no repayment of the 7-day bonus");
});

step("E · a new run after a gap re-earns the 3-day bonus", async () => {
  const st = K.store.state;
  st.sessions = [studyOn(day(-12), 2001), studyOn(day(-11), 2002), studyOn(day(-10), 2003),   /* an old run of 3 */
    studyOn(day(-3), 2004), studyOn(day(-2), 2005), studyOn(day(-1), 2006)];                 /* a new run of 3 */
  st.governor.milestones = { streak3: day(-10) };
  eq(tick().award.gold, 1 + 3, "the new run earns its 3-day bonus");
  eq(st.governor.milestones.streak3, day(-1), "keyed to the new run");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke128: " + failed + " failed" : "smoke128: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
