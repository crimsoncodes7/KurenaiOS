/* Kurenai OS — smoke186.test.js
   W8's speed work (the quality audit's AP-18, AP-03, AX-25, AG-08,
   AP-15): derived reads computed once and reused while nothing they read
   has moved — and never reused once it has.

     A · THE STORE'S COUNTERS. KOS.store.epoch() moves on every save and
         transaction; docEpoch() only when a whole document is taken in.
     B · READINESS, ONCE. KOS.exams.readiness(a) asked twice is the same
         answer, computed once; a save, an edit of the exam or another day
         computes it again.
     C · THE EXAM PASS AT BOOT. examPass({ifChanged: true}) skips when
         nothing it reads has changed since the last pass (the signature
         kept per device), and runs when a card is rated or added; a pass
         without the option (a saved exam, a changed target) always runs.
     D · THE BADGES' READS. The vault, Money and the review log each count
         their write transactions (gen); badge values are kept between
         list() calls, so a second list measures nothing, and a vault
         write, a new ledger entry, an owner event (touch) or a document
         taken in measures again.
     E · no errors.

   Run: node tools/smoke186.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K;
const day = (n) => K.srs.addDays(K.srs.todayISO(), n);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];

step("boot", async () => {
  app = await boot(); K = app.KOS; await app.settle();
  app.window.addEventListener("error", (e) => errors.push(String(e.message)));
});

step("A · the store's counters", () => {
  const e0 = K.store.epoch(), d0 = K.store.docEpoch();
  K.store.save();
  assert(K.store.epoch() > e0, "a save moves the epoch");
  eq(K.store.docEpoch(), d0, "a save does not move the document counter");
  const e1 = K.store.epoch();
  K.store.transact(() => {});
  assert(K.store.epoch() > e1, "a transaction moves the epoch");
});

step("B · readiness is computed once until something moves", () => {
  const a = K.exams.add({ preset: "ocr-f201", tier: "mock", title: "F201 mock", date: day(27), time: "09:00" }, { quiet: true });
  const r1 = K.exams.readiness(a), r2 = K.exams.readiness(a);
  assert(r1 && r1 === r2, "asked twice, the same answer: computed once");
  K.store.save();
  const r3 = K.exams.readiness(a);
  assert(r3 !== r1, "a save computes it again");
  eq(Object.keys(r3.signals).sort(), Object.keys(r1.signals).sort(), "and it is the same reading");
  assert(K.exams.readiness(a, day(1)) !== r3, "another day is another answer");
  K.exams.update(a.id, { date: day(29) });
  const a2 = K.exams.get ? K.exams.get(a.id) : K.exams.all().filter((x) => x.id === a.id)[0];
  assert(K.exams.readiness(a2) !== r3, "an edited exam is read again");
  eq(K.exams.readiness(null), null, "no exam, no reading");
});

step("C · the boot's exam pass skips when nothing it reads has changed", () => {
  const S = K.srs, srs = K.store.state.srs;
  K.store.state.calendar.events = [];
  K.calendar.addEvent({ type: "exam", title: "Paper 1", date: day(30), subject: "compsci", examLevel: "exam" });
  srs["compsci:4.2.3.1:5"] = { s: 40, d: 5, fl: day(-1), last: day(-1), ivl: 40, due: day(39), views: 3, reps: 2, lapses: 0, lastRating: 2, ef: 2.5 };
  S.setExamTarget(0.95);                       // runs the pass
  const moved = srs["compsci:4.2.3.1:5"].due;
  assert(moved <= day(10), "the first pass brings the card in: " + moved);
  eq(S.examPass({ ifChanged: true }), 0, "nothing changed: the boot pass does nothing");
  assert(K.store.state.ui.examPassSig, "the signature is kept per device");
  /* a card it would move, written behind its back with the same count and
     the same last rating: the boot's pass cannot know, and skips */
  srs["compsci:4.2.3.1:5"].due = day(60);
  eq(S.examPass({ ifChanged: true }), 0, "unchanged signature: skipped");
  eq(srs["compsci:4.2.3.1:5"].due, day(60), "so the card is untouched");
  /* any pass that is not the boot's always runs */
  eq(S.examPass(), 1, "a saved exam's pass runs whatever the signature");
  assert(srs["compsci:4.2.3.1:5"].due <= day(10), "and moves the card");
  /* a new card changes what the pass reads: the boot pass runs */
  srs["compsci:4.2.3.1:6"] = { s: 300, d: 4, fl: day(-1), last: day(-1), ivl: 300, due: day(299), views: 9, reps: 8, lapses: 0, lastRating: 2, ef: 2.8 };
  eq(S.examPass({ ifChanged: true }), 1, "a card added: the boot pass runs");
  /* a rating changes `last`: the boot pass runs */
  srs["compsci:4.2.3.1:5"].last = K.srs.todayISO(); srs["compsci:4.2.3.1:5"].due = day(40);
  assert(S.examPass({ ifChanged: true }) >= 1, "a card rated: the boot pass runs");
  /* another exam: the boot pass runs */
  const sig = K.store.state.ui.examPassSig;
  K.calendar.addEvent({ type: "exam", title: "Topic paper", date: day(12), refs: ["compsci:4.2.3.1"], examLevel: "exam" });
  S.examPass({ ifChanged: true });
  assert(K.store.state.ui.examPassSig !== sig, "a new exam is a new signature");
});

step("D · badge values are kept between opens, and measured again when their reads move", async () => {
  const A = K.achievements;
  assert(typeof K.mediadb.gen === "function" && typeof K.money.gen === "function" && typeof K.reviewLog.gen === "function", "each store counts its writes");
  A._resetCache();
  /* count the measuring of one study badge and one vault badge */
  const study = A.defs().filter((d) => d.v && d.owners.indexOf("study") >= 0 && !d.soon)[0];
  const vaultB = A.defs().filter((d) => d.measure && d.owners.indexOf("collection") >= 0 && !d.soon)[0];
  assert(study && vaultB, "a study badge and a vault badge to watch");
  let ns = 0, nv = 0;
  const v0 = study.v, m0 = vaultB.measure;
  study.v = function (ctx) { ns++; return v0(ctx); };
  vaultB.measure = function (ctx, cb) { nv++; return m0(ctx, cb); };
  const list = () => new Promise((r) => A.list(r));
  try {
    const first = await list();
    eq([ns, nv], [1, 1], "the first list measures");
    const second = await list();
    eq([ns, nv], [1, 1], "the second list measures nothing");
    eq(second.map((v) => v.value), first.map((v) => v.value), "and reads the same values");
    /* a vault write */
    const g = K.mediadb.gen();
    await new Promise((r) => K.mediadb.put({ module: "anime", title: "Kept test", status: "watching", progress: { current: 1 } }, () => r()));
    assert(K.mediadb.gen() > g, "a vault write moves the vault's counter");
    await list();
    eq([ns, nv], [2, 2], "a vault write measures again");
    /* an owner event drops only its own badges */
    A.touch("study");
    await list();
    eq([ns, nv], [3, 2], "touch('study') re-measures the study badge alone");
    /* a new ledger entry clears them all */
    K.store.state.sessions.push({ id: "smoke186-" + Date.now(), ts: Date.now(), type: "todo", date: K.srs.todayISO() });
    await list();
    eq([ns, nv], [4, 3], "a ledger entry measures again");
    /* evaluate measures afresh and leaves its values for list */
    await new Promise((r) => A.evaluate(null, r));
    const n1 = [ns, nv];
    await list();
    eq([ns, nv], n1, "a list after a sweep reuses the sweep's values");
  } finally { study.v = v0; vaultB.measure = m0; }
});

step("E · no errors", async () => {
  await wait(50);
  eq(errors, [], "no uncaught errors");
});

(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { console.error("  FAIL " + name + "\n       " + (e && e.stack || e)); process.exit(1); }
  }
  console.log("smoke186: all " + steps.length + " steps passed");
  process.exit(0);
})();
