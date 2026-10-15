/* Kurenai OS — smoke74.test.js
   Code (roadmap 5.3), part 2: the model and what it pays.

     A · PAY ONCE. A task's first pass pays its tier (+3 HP) through the
         session ledger; a re-run pays nothing; a pass after "See the
         answer" pays nothing and proves nothing; hints never reduce it.
     B · THE PHONE. A phone pass pays half the XP and gold and +1 HP; the
         same task passed later on a computer pays exactly the rest.
     C · RETRIEVAL. Grades are derived (first try → Easy, a hint → Hard,
         three misses → Again); at most 10 retrieval rewards a day, and
         past the cap a card still moves on the schedule.
     D · EVIDENCE. A lesson's four checks come from evidence only: pages
         read and listings run tick the first two, a proven task the third,
         a retrieval the fourth — reading alone never completes a lesson.
     E · RENDER PURITY. The desk, a lesson, the map, a task, the skill map,
         retrieval and settings write nothing to the store when drawn.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke74.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const PASS = { passed: true }, FAIL = { passed: false };

step("A · a task pays once, on its first proven pass", async (app) => {
  const K = app.KOS, g = K.store.state.governor;
  const xp0 = g.xp, gold0 = g.gold;
  g.hp = 50;
  assert(!K.code.recordCheck("1.1-box", FAIL).paid, "a failing check pays nothing");
  K.code.openHint("1.1-box");
  const o = K.code.recordCheck("1.1-box", PASS);
  assert(o.paid && o.pay.xp === 18 && o.pay.gold === 2 && o.pay.hp === 3, "a core task pays 18/2/3: " + JSON.stringify(o));
  assert(g.xp - xp0 === 18 && g.gold - gold0 === 2 && g.hp === 53, "the Governor paid it: xp +" + (g.xp - xp0) + " gold +" + (g.gold - gold0) + " hp " + g.hp);
  const e = K.sessions.all().slice(-1)[0];
  assert(e.type === "code" && e.metrics.kind === "task" && e.award.xp === 18, "one ledger entry with its award");
  const again = K.code.recordCheck("1.1-box", PASS);
  assert(!again.paid && again.why === "already passed" && g.xp - xp0 === 18, "a re-run pays nothing");
  assert(K.code.state().proven.writeline, "the pass proved its concepts");
});
step("A · after See the answer, a pass pays and proves nothing", async (app) => {
  const K = app.KOS, xp0 = K.store.state.governor.xp;
  K.code.seeAnswer("1.2-types");
  const o = K.code.recordCheck("1.2-types", PASS);
  assert(!o.paid && o.why === "answer opened", "no reward once the answer is open: " + JSON.stringify(o));
  assert(K.store.state.governor.xp === xp0, "nothing paid");
  assert(!K.code.state().proven["char-string"], "the skill stays studied, not proven");
  assert(!K.code.taskState("1.2-types").passAt, "no proven pass recorded");
});

step("B · a phone pass pays half; a computer pass later pays the rest", async (app) => {
  const K = app.KOS, g = K.store.state.governor;
  g.hp = 50; const xp0 = g.xp, gold0 = g.gold;
  const p = K.code.recordCheck("1.3-total", PASS, { phone: true });
  assert(p.paid && p.phone && p.pay.xp === 9 && p.pay.gold === 1 && p.pay.hp === 1, "phone: half XP and gold, +1 HP: " + JSON.stringify(p.pay));
  assert(!K.code.recordCheck("1.3-total", PASS, { phone: true }).paid, "a second phone pass pays nothing");
  const d = K.code.recordCheck("1.3-total", PASS);
  assert(d.paid && d.pay.xp === 9 && d.pay.gold === 1 && d.pay.hp === 2, "the computer pays the rest: " + JSON.stringify(d.pay));
  assert(g.xp - xp0 === 18 && g.gold - gold0 === 2 && g.hp === 53, "never more than one full reward in total");
  assert(!K.code.recordCheck("1.3-total", PASS).paid, "and nothing after that");
  assert(K.code.phoneFit(K.code.task("1.1-box")) && !K.code.phoneFit({ lesson: "4.3" }), "phone tasks are units 1–3 only");
});

step("C · retrieval grades are derived from what happened", (app) => {
  const g = app.KOS.code.grade;
  assert(g({ passed: true, tries: 1, secs: 40 }) === "easy", "first try, quick → Easy");
  assert(g({ passed: true, tries: 1, secs: 400 }) === "good", "first try, slow → Good");
  assert(g({ passed: true, tries: 2, secs: 40 }) === "good", "second try → Good");
  assert(g({ passed: true, tries: 1, hint: true }) === "hard", "a hint grades it Hard");
  assert(g({ passed: false, tries: 3 }) === "again", "three misses → Again");
});
step("C · at most 10 retrieval rewards a day; the schedule still moves", async (app) => {
  const K = app.KOS, today = K.srs.todayISO();
  const st = K.code.state();
  const xp0 = K.store.state.governor.xp;
  let paid = 0, capped = 0;
  for (let i = 0; i < 12; i++) {
    st.cards["u1-swap"] = { due: today, ivl: 2, ef: 2.5, reps: 0, lapses: 0, n: 1 };
    const r = K.code.recordCard("u1-swap", { passed: true, tries: 1, secs: 30 });
    if (r.paid) paid++; if (r.capped) capped++;
    assert(r.next > today, "a proven card moves on: " + r.next);
  }
  assert(paid === 10 && capped === 2, "paid " + paid + ", capped " + capped);
  assert(K.store.state.governor.xp - xp0 === 40, "10 × 4 XP");
  st.cards["u1-swap"] = { due: today, ivl: 9, ef: 2.5, reps: 3, lapses: 0, n: 4 };
  const again = K.code.recordCard("u1-swap", { passed: false, tries: 3 });
  assert(again.grade === "again" && again.ivl === 1 && st.cards["u1-swap"].lapses === 1 && !again.paid, "Again: back tomorrow, a lapse, no reward");
  assert(st.cards["u1-swap"].n === 5, "each review asks the next variation");
});
step("C · a first proof schedules the skill's card; variations differ", (app) => {
  const K = app.KOS;
  K.code.prove(["interpolation"], "task", "t");
  const c = K.code.state().cards["u1-interp"];
  assert(c && c.due > K.srs.todayISO(), "the card is scheduled after the proof");
  const a = K.code.variation("u1-swap", 1), b = K.code.variation("u1-swap", 2);
  assert(a && b && (a.starter !== b.starter || a.params.join() !== b.params.join()), "two variations differ");
  assert(JSON.stringify(K.code.variation("u1-swap", 3).params) === JSON.stringify(K.code.variation("u1-swap", 3).params), "a variation is deterministic");
});

step("D · four checks from evidence; reading alone never completes a lesson", async (app) => {
  const K = app.KOS, ref = "1.4";
  const ev0 = K.code.evidence(ref);
  assert(!ev0.checks.some(Boolean), "a fresh lesson has no ticks");
  for (let i = 0; i < ev0.pages; i++) K.code.markPage(ref, i);
  K.code.listingsOf(ref).forEach((l) => K.code.markListing(ref, l.id));
  let p = K.store.peekProgress("code", ref);
  assert(p.check[0] && p.check[1] && !p.check[2] && p.status !== "done", "read and ran: two ticks, not done");
  K.code.recordCheck("1.4-hours", PASS);
  K.code.state().cards["u1-intdiv"] = { due: K.srs.todayISO(), ivl: 2, ef: 2.5, reps: 0, lapses: 0, n: 1 };
  K.code.recordCard("u1-intdiv", { passed: true, tries: 1, secs: 20 });
  p = K.store.peekProgress("code", ref);
  assert(p.check.every(Boolean) && p.status === "done", "a proven task and a retrieval complete it: " + JSON.stringify(p));
});
step("D · the day's plan is computed, stable through the day and reads Done", async (app) => {
  const K = app.KOS;
  const a = K.code.planDay(), b = K.code.planDay();
  assert(a && b && a.task.id === b.task.id, "the same pick twice");
  K.code.recordCheck(a.task.id, PASS);
  const c = K.code.planDay();
  assert(c.task.id === a.task.id && c.done, "after passing it, today's pick holds and reads Done");
  assert(!("plan" in K.code.state()), "the plan is never stored");
});

step("E · Code's pages write nothing when drawn", async (app) => {
  const K = app.KOS;
  K.show("subject", "compsci"); await app.settle();
  K.store.flush && K.store.flush();
  const pages = [["subject", "code"], ["ref", { subject: "code", ref: "1.3" }], ["code", { page: "map" }], ["code", { page: "task", id: "1.5-label" }],
    ["code", { page: "skills" }], ["code", { page: "retrieval" }], ["code", { page: "settings" }], ["code", { page: "track", id: "T2" }]];
  for (const [v, a] of pages) {
    const before = JSON.stringify(K.store.state.code) + JSON.stringify(K.store.state.progress) + JSON.stringify(K.store.state.governor);
    K.show(v, a); await app.settle();
    const after = JSON.stringify(K.store.state.code) + JSON.stringify(K.store.state.progress) + JSON.stringify(K.store.state.governor);
    assert(before === after, v + " " + JSON.stringify(a) + " wrote to the store while drawing");
  }
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

(async () => {
  let failed = 0;
  const app = await boot();
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE74 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE74 PASS — Code's model and rewards (" + steps.length + " steps).");
})();
