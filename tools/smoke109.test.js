/* Kurenai OS — smoke109.test.js
   Mind (roadmap 5.9, docs/mind-plan.md revision 2): what pays, what a read may not do, the ladder
   and positions (invariants 1, 5, 33, 137–141).

   The claims:

     A · READS WRITE NOTHING. due, nextLesson, planDay, stats, milestones, tensionsDue,
         suggestedNext, positions, evidence and ladder leave the state document as it was —
         including on a device that has never opened Mind.
     B · A LESSON PAYS ONCE. Every page read and the check passed finishes a lesson: ONE ledger
         entry (type mind) paying 12 XP, 2 gold, +2 HP, and its concepts' cards join the schedule
         due tomorrow. A wrong check answer explains and costs nothing; finishing again pays
         nothing.
     C · REVIEWS ARE ONE ENTRY, CAPPED. A review block logs one entry paying +1 XP a passed card,
         at most 15 a day; past the cap the cards still move and the entry pays zero.
     D · THE LADDER IS EVIDENCE. Recall needs every card of the concept rated Hard or better;
         Explain needs an explain-back ticking 60% of the key points. Nothing is ticked by hand.
     E · POSITIONS ARE NEVER OVERWRITTEN. A revision is a new version under its own key; two
         devices' revisions both survive the cloud merge. Writing pays nothing.
     F · A CHECKPOINT PAYS ONCE (50 XP, 12 gold, +4 HP) and can be retaken.
     G · THE GATE. A malformed state.mind is rebuilt as keyed maps; a concept card merges whole.

   Run: node tools/smoke109.test.js                                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-10-29";
let app, K, M;
const gov = () => K.store.state.governor;
const mindEntries = () => K.sessions.all().filter((e) => e.type === "mind");
function finishLesson(id) {
  K.mind.pages(id).forEach((_, i) => K.mind.markPage(id, i));
  K.mind.checkItems(id).forEach((it, qi) => K.mind.answerCheck(id, qi, it.a));
}

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; M = K.mind;
  eq(app.errors, [], "boot errors");
  assert(M && app.window.KOS_MIND && M.lessons().length >= 8, "F1's eight lessons are released");
});

/* ---------------- A (first: a device that never opened Mind) ---------------- */
step("A · reads write nothing, even before Mind was ever opened", () => {
  delete K.store.state.mind;
  delete K.store.state.ui.mind;
  const before = JSON.stringify(K.store.state);
  M.due(); M.nextLesson(); M.planDay(); M.stats(); M.milestones(); M.tensionsDue(); M.suggestedNext();
  M.positions(); M.evidence("F1.1"); M.ladder("argument"); M.peek(); M.peekUi(); M.revisitsDue(); M.bq();
  eq(JSON.stringify(K.store.state), before, "the state document is untouched");
});

/* ---------------- B ---------------- */
step("B · a wrong check answer explains and costs nothing", () => {
  const it = M.checkItems("F1.1")[0], n0 = mindEntries().length, x0 = gov().xp;
  const r = M.answerCheck("F1.1", 0, (it.a + 1) % it.options.length);
  assert(r && r.ok === false && typeof r.why === "string", "a wrong answer says why");
  eq([mindEntries().length, gov().xp], [n0, x0], "no entry, no XP lost");
});
step("B · a lesson's first finish is one entry paying 12/2/+2, and its cards come tomorrow", () => {
  const n0 = mindEntries().length, x0 = gov().xp, g0 = gov().gold;
  finishLesson("F1.1");
  assert(M.finished("F1.1"), "finished");
  eq(mindEntries().length, n0 + 1, "one entry");
  const e = mindEntries().slice(-1)[0];
  eq([e.metrics.kind, e.metrics.first], ["lesson", true], "the entry is the lesson's first finish");
  eq([gov().xp - x0, gov().gold - g0], [12, 2], "12 XP and 2 gold");
  const keys = Object.keys(M.peek().cards);
  assert(keys.length >= 4, "the lesson's concept cards joined the schedule: " + keys.length);
  keys.forEach((k) => eq(M.peek().cards[k].due, "2026-10-30", k + " is due tomorrow"));
  eq(M.due().length, 0, "nothing due today");
});
step("B · finishing again pays nothing", () => {
  const n0 = mindEntries().length, x0 = gov().xp;
  M.maybeFinish("F1.1");
  M.answerCheck("F1.1", 0, M.checkItems("F1.1")[0].a);
  eq([mindEntries().length, gov().xp], [n0, x0], "no second payment");
});

/* ---------------- C ---------------- */
step("C · a review block is one entry, +1 XP a passed card", () => {
  const keys = Object.keys(M.peek().cards).slice(0, 4);
  const res = keys.map((k, i) => M.rateCard(k, i === 3 ? 1 : 3));
  const n0 = mindEntries().length, x0 = gov().xp;
  const out = M.finishReviews(res);
  eq(mindEntries().length, n0 + 1, "one entry");
  eq([out.passed, out.paid, gov().xp - x0], [3, 3, 3], "three passed, three paid");
  eq(mindEntries().slice(-1)[0].award, { xp: 3, gold: 0 }, "the entry records what it paid");
  assert(M.peek().cards[keys[0]].due > TODAY, "a passed card moved forward");
});
step("C · the daily cap is 15 XP; past it the entry pays zero", () => {
  const keys = Object.keys(M.peek().cards);
  const fake = Array.from({ length: 20 }, (_, i) => ({ key: keys[i % keys.length], grade: 3 }));
  const out1 = M.finishReviews(fake);
  eq([out1.paid, out1.capped], [12, true], "only 12 left under the cap");
  const out2 = M.finishReviews(fake.slice(0, 3));
  eq([out2.paid, out2.capped], [0, true], "past the cap: nothing");
  eq(M.paidToday(), 15, "15 paid today");
  eq(mindEntries().slice(-1)[0].award, { xp: 0, gold: 0 }, "and its entry records zero");
});

/* ---------------- D ---------------- */
step("D · Recall needs every card of the concept held", () => {
  const cid = "premise", ks = M.cardKeys(cid);
  assert(ks.length >= 1 && M.peek().cards[ks[0]], "premise's cards are scheduled");
  ks.forEach((k) => M.rateCard(k, 1));
  assert(!M.rung(cid, "Recall"), "a lapsed card holds nothing");
  ks.forEach((k) => M.rateCard(k, 3));
  assert(M.rung(cid, "Recall"), "every card rated Good: Recall");
});
step("D · Explain needs an explain-back ticking 60% of the key points", () => {
  const l = M.lesson("F1.1"), c = M.concept(l.main), n = c.keyPoints.length, need = Math.ceil(0.6 * n - 1e-9);
  const few = {}; for (let i = 0; i < need - 1; i++) few[i] = true;
  M.saveExplain("F1.1", ["an argument gives reasons for a claim"], few);
  assert(!M.rung(l.main, "Explain"), (need - 1) + " of " + n + " is not enough");
  const enough = {}; for (let i = 0; i < need; i++) enough[i] = true;
  const r = M.saveExplain("F1.1", ["an argument gives reasons for a claim", "the conclusion is what they support"], enough);
  assert(r.reached && M.rung(l.main, "Explain"), need + " of " + n + " reaches Explain");
});

/* ---------------- E ---------------- */
step("E · a revision is a new version; writing pays nothing", () => {
  const n0 = mindEntries().length, x0 = gov().xp;
  const v1 = M.takePosition("F1.7", { answer: 1, conf: 70, reason: "It keeps the talk honest." });
  const v2 = M.takePosition("F1.7", { answer: 2, conf: 60, reason: "Bad faith exists.", changed: "A reply in bad faith wastes it." });
  assert(v1 && v2 && v1.vid !== v2.vid, "two versions under their own keys");
  eq(v2.changedAnswer, true, "a different answer is a changed mind");
  const vs = M.versions("F1.7");
  eq(vs.map((v) => [v.n, v.answer]), [[1, 1], [2, 2]], "the first version is kept as it was");
  eq(M.stats().changed, 1, "one changed mind");
  eq([mindEntries().length, gov().xp], [n0, x0], "positions and explain-backs pay nothing");
  eq(M.peek().positions["F1.7"].revisit.due, "2026-11-12", "the first revisit is in two weeks");
});
step("E · two devices' revisions both survive the cloud merge", () => {
  const base = JSON.parse(JSON.stringify(K.store.state));
  const local = JSON.parse(JSON.stringify(base)), remote = JSON.parse(JSON.stringify(base));
  local.mind.positions["F1.7"].versions.aaa = { at: 3e12, day: TODAY, answer: 0, conf: 80, reason: "here", n: 3 };
  remote.mind.positions["F1.7"].versions.bbb = { at: 3e12 + 1, day: TODAY, answer: 3, conf: 55, reason: "there", n: 3 };
  const out = K.cloudmerge.merge(base, local, remote).doc.mind.positions["F1.7"].versions;
  assert(out.aaa && out.bbb && Object.keys(out).length === 4, "every version kept: " + Object.keys(out).join(", "));
});
step("E · a revisit kept moves to the next stage; a retired position stops coming back", () => {
  const r = M.keepPosition("F1.7");
  assert(r && r.stage === 1, "stage 1 after a keep");
  M.retirePosition("F1.7");
  eq(M.revisitsDue("2027-12-31").length, 0, "a retired position is never due");
  assert(M.versions("F1.7").length === 2, "and its versions are kept");
});

/* ---------------- F ---------------- */
step("F · a checkpoint pays once and can be retaken", () => {
  const x0 = gov().xp, g0 = gov().gold, n0 = mindEntries().length;
  const out = M.recordCheckpoint("F1", { cards: 8, apply: { 0: true, 1: true }, synth: { bullets: ["no streak"], ticks: { 0: true } } });
  assert(out && out.paid, "the first submission pays");
  eq([gov().xp - x0, gov().gold - g0, mindEntries().length - n0], [50, 12, 1], "50 XP, 12 gold, one entry");
  const again = M.recordCheckpoint("F1", { cards: 8, apply: {}, synth: { bullets: ["again"], ticks: {} } });
  assert(again && !again.paid, "a retake pays nothing");
  eq([gov().xp - x0, mindEntries().length - n0], [50, 1], "still once");
});

/* ---------------- I ---------------- */
step("I · the desk counts Completed lessons, as the spine does", () => {
  const done = M.lessons().filter((l) => { const p = K.store.peekProgress("mind", l.id); return p && p.status === "done"; }).length;
  eq(M.stats().done, done, "stats().done is the shared Completed count");
  assert(M.finished("F1.1"), "F1.1 is finished (it paid)");
  const p = K.store.peekProgress("mind", "F1.1");
  eq(p.status === "done", p.check.every(Boolean), "and Completed means every check");
});

/* ---------------- H ---------------- */
step("H · the Assistant reads Mind as counts, writes nothing, and never quotes the private text", async () => {
  const ex = (name, args) => new Promise((res) => K.ai.tools.execute(name, args, (err, result) => res({ err, result })));
  const before = JSON.stringify(K.store.state.mind);
  const o = await ex("mind_overview", {});
  assert(!o.err && o.result.lessonsReleased >= 8 && typeof o.result.mastery === "number" && o.result.positions === 1, "the overview: " + JSON.stringify(o.err || o.result));
  assert(!/keeps the talk honest|Bad faith/.test(JSON.stringify(o.result)), "a position's reasons are never sent");
  const c = await ex("mind_concept", { concept: "Premise" });
  assert(!c.err && c.result.id === "premise" && c.result.rungs[0].holds === true, "one concept's ladder: " + JSON.stringify(c.err || c.result));
  assert((await ex("mind_concept", { concept: "nothing-here" })).err, "an unknown concept is an error");
  eq(JSON.stringify(K.store.state.mind), before, "the tools wrote nothing");
});

/* ---------------- G ---------------- */
step("G · a malformed state.mind is rebuilt as keyed maps", () => {
  K.store.state.mind = { v: 1, cards: [], lessons: "x", positions: null };
  M.setVote("F1.2", 1);
  const m = K.store.state.mind;
  ["cards", "lessons", "explains", "positions", "parked", "checkpoints", "tensions", "bq", "paths"].forEach((k) =>
    assert(m[k] && typeof m[k] === "object" && !Array.isArray(m[k]), k + " is a keyed map"));
  eq(m.lessons["F1.2"].vote.i, 1, "and the write landed");
});
step("G · a concept card changed on both devices merges whole", () => {
  const k = "argument:0";
  const base = { mind: { cards: { [k]: { s: 2, d: 5, due: "2026-11-01", last: "2026-10-28", reps: 1 } } } };
  const local = { mind: { cards: { [k]: { s: 3, d: 4, due: "2026-11-03", last: "2026-10-29", reps: 2 } } } };
  const remote = { mind: { cards: { [k]: { s: 1, d: 6, due: "2026-10-30", last: "2026-10-29", reps: 2, lapses: 1 } } } };
  const out = K.cloudmerge.merge(base, local, remote).doc.mind.cards[k];
  assert(((out.s === 3 && out.d === 4) || (out.s === 1 && out.d === 6)), "one side's memory, never a mix: " + JSON.stringify(out));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE109 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE109 PASS — Mind's pay, reads, ladder and positions (" + steps.length + " steps).");
})();
