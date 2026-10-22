/* Kurenai OS — smoke81.test.js
   Japanese: what pays, and what a read may not do (roadmap 5.5, docs/japanese-plan.md decision G,
   invariants 1, 2, 5, 113, 116).

   The claims:

     A · ONE SESSION, ONE ENTRY. A review session logs ONE ledger entry however many facets it
         rated (invariant 5), and the Governor pays it through KOS.ja.award: +1 XP a passed facet.
     B · THE DAILY CAP. Review XP stops at 30 a day across sessions; past it a session still
         schedules, logs, and pays nothing.
     C · PAY ONCE. A lesson's first finish pays 15 XP, 2 gold, +3 HP; a second finish pays
         nothing. A checkpoint passes at 80% in every skill it tests, pays once, and can be retaken.
     D · NOTHING ELSE PAYS. A self-marked result moves no schedule; input tallies and a mined
         line log no session (immersion pays only through Focus).
     E · READS WRITE NOTHING. due, nextLesson, planDay, skills, timeline and peek leave the state
         document exactly as it was — including on a device that has never opened Japanese.
     F · THE GATE. settings are clamped (furigana one of three, daily minutes 15–120) and a
         malformed state.japanese is rebuilt as keyed maps.

   Run: node tools/smoke81.test.js                                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-10-22";
let app, K;
const xp = () => K.store.state.governor.xp;
const jaEntries = () => K.sessions.all().filter((e) => e.type === "ja");
function rateAll(keys, verdict) { return keys.map((k) => Object.assign({ key: k }, K.ja.record(k, { verdict: verdict || "correct", ms: 2000 }))); }

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS;
  eq(app.errors, [], "boot errors");
});

/* ---------------- E (first: a device that never opened Japanese) ---------------- */
step("E · reads write nothing, even before Japanese was ever opened", () => {
  delete K.store.state.japanese;
  const before = JSON.stringify(K.store.state);
  K.ja.due(); K.ja.nextLesson(); K.ja.planDay(); K.ja.skills(); K.ja.timeline(); K.ja.peek();
  eq(JSON.stringify(K.store.state), before, "the state document is untouched");
});

/* ---------------- A ---------------- */
step("A · a session is one ledger entry, paid through KOS.ja.award", () => {
  K.ja.startLesson("H1");
  const due = K.ja.due();
  assert(due.length >= 8, "lesson 1 is due: " + due.length);
  const n0 = jaEntries().length, x0 = xp();
  const res = rateAll(due.slice(0, 8)).concat(rateAll(due.slice(8, 10), "wrong"));
  const out = K.ja.finishSession(res);
  eq(jaEntries().length, n0 + 1, "one entry");
  eq([out.passed, out.paid], [8, 8], "eight passed, eight paid");
  eq(xp() - x0, 8, "the Governor paid +1 XP each");
  const e = jaEntries().slice(-1)[0];
  eq([e.metrics.kind, e.metrics.n, e.metrics.paid], ["session", 10, 8], "the entry records the session");
  eq(e.award, { xp: 8, gold: 0 }, "and what it paid (invariant 100)");
});

/* ---------------- B ---------------- */
step("B · the daily cap is 30 XP across sessions", () => {
  K.ja.startLesson("H2"); K.ja.startLesson("H3");
  const keys = Object.keys(K.store.state.japanese.facets).filter((k) => !K.store.state.japanese.facets[k].reps).slice(0, 40);
  const x0 = xp();
  const out1 = K.ja.finishSession(rateAll(keys.slice(0, 15)));
  eq(out1.paid, 15, "15 more paid (8 already today)");
  const out2 = K.ja.finishSession(rateAll(keys.slice(15, 30)));
  eq([out2.paid, out2.capped], [7, true], "only 7 left under the cap");
  const out3 = K.ja.finishSession(rateAll(keys.slice(30, 35)));
  eq([out3.paid, out3.capped], [0, true], "past the cap: nothing");
  eq(xp() - x0, 22, "22 XP in all");
  eq(K.ja.paidToday(), 30, "30 paid today");
  const last = K.store.state.japanese.facets[keys[32]];
  assert(last.reps === 1 && last.due > TODAY, "past the cap the facet still moved");
  eq(jaEntries().slice(-1)[0].award, { xp: 0, gold: 0 }, "and its entry records zero");
});

/* ---------------- C ---------------- */
step("C · a lesson pays once; a checkpoint passes at 80% and pays once", () => {
  const x0 = xp(), g0 = K.store.state.governor.gold;
  const a = K.ja.finishLesson("H1");
  eq([a.paid, a.pay], [true, { xp: 15, gold: 2, hp: 3 }], "first finish");
  eq([xp() - x0, K.store.state.governor.gold - g0], [15, 2], "paid by the Governor");
  const b = K.ja.finishLesson("H1");
  eq([b.paid, b.why], [false, "already finished"], "second finish");
  eq(xp() - x0, 15, "nothing more");
  const miss = K.ja.recordCheckpoint("cp-H", { R: 0.95, W: 0.7, L: 0.9 });
  eq([miss.pass, miss.weak, miss.paid], [false, ["W"], false], "W under 80%: not passed, W to rework");
  const x1 = xp();
  const pass = K.ja.recordCheckpoint("cp-H", { R: 0.9, W: 0.85, L: 0.8 });
  eq([pass.pass, pass.paid], [true, true], "retaken: passed and paid");
  eq(xp() - x1, 60, "60 XP");
  const again = K.ja.recordCheckpoint("cp-H", { R: 1, W: 1, L: 1 });
  eq([again.pass, again.paid], [true, false], "a later pass pays nothing");
  assert(K.store.state.japanese.checkpoints["cp-H"].passAt, "the pass is kept");
});

/* ---------------- D ---------------- */
step("D · self-marked, input and mining pay nothing", () => {
  const n0 = jaEntries().length, x0 = xp();
  K.ja.addInput("raw", 25); K.ja.addInput("jpSub", 40); K.ja.addInput("nonsense", 10);
  eq(K.store.state.japanese.input[TODAY], { raw: 25, jpSub: 40 }, "tallies only, known kinds only");
  const id = K.ja.mine({ text: "これはなんですか。", en: "What is this?", src: { kind: "scene", title: "In the café" } });
  assert(K.store.state.japanese.facets["x:" + id + "|L"], "a mined line becomes a listening facet");
  eq(K.ja.mine({ text: "これはなんですか。" }), id, "mining the same line twice keeps one");
  const k = Object.keys(K.store.state.japanese.facets)[0], before = JSON.stringify(K.store.state.japanese.facets[k]);
  const r = K.ja.record(k, { verdict: "correct", selfMarked: true });
  eq(K.ja.finishSession([Object.assign({ key: k }, r)]), { passed: 0, paid: 0, capped: false }, "a self-marked session logs nothing");
  eq(JSON.stringify(K.store.state.japanese.facets[k]), before, "and moved nothing");
  eq([jaEntries().length, xp()], [n0, x0], "no entry, no XP");
});

/* ---------------- E (again, with data) ---------------- */
step("E · reads write nothing with a full state", () => {
  const before = JSON.stringify(K.store.state);
  const plan = K.ja.planDay(TODAY), sk = K.ja.skills(), tl = K.ja.timeline(TODAY), due = K.ja.due();
  eq(JSON.stringify(K.store.state), before, "untouched");
  assert(plan.reviews.n === due.length && plan.total > 0, "the plan reads the queue: " + JSON.stringify(plan));
  assert(sk.skills.R.started > 0 && sk.skills.W.started > 0 && sk.skills.S.started === 0, "skills derived from the facets (kana have R and W, no S)");
  assert(tl.calibrating, "a first day is calibrating");
});

/* ---------------- F ---------------- */
step("F · the gate", () => {
  eq(K.ja.setSettings({ furigana: "loud", dailyMin: 500 }), { furigana: "unknown", dailyMin: 120, speech: false }, "clamped");
  eq(K.ja.setSettings({ furigana: "none", dailyMin: 5, speech: 1 }), { furigana: "none", dailyMin: 15, speech: true }, "clamped low");
  const n = K.ja.normalise({ facets: [], lessons: "x", v: 7 });
  eq(Object.keys(n), ["v", "facets", "lessons", "checkpoints", "mined", "input", "settings", "fluency"], "every part");
  assert(!Array.isArray(n.facets) && typeof n.lessons === "object", "keyed maps, never arrays");
  K.store.state.japanese = { v: 1, facets: null };
  assert(K.ja.startLesson("H4").length > 0 && K.store.state.japanese.facets["k:ま|R"], "a broken state is rebuilt on write");
  eq(app.errors, [], "window errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("FAIL  " + name + "\n      " + e.message); }
  }
  console.log(failed ? "\n" + failed + " step(s) failed" : "\nsmoke81: all " + steps.length + " steps passed");
  process.exit(failed ? 1 : 0);
})();
