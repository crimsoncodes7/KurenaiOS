/* Kurenai OS — smoke96.test.js
   FSRS phase 3 (roadmap 5.6, docs/fsrs-plan.md §4): the optimiser, the
   fitted parameters in the scheduler, and the review log's replication
   (invariant 111).

   The claims:

     A · THE FIT (KOS.fsrsOpt, pure): on a simulated learner whose memory
         is not the defaults, the fit beats the defaults' log loss and comes
         close to the true model's; every parameter stays in its bounds; a
         log under 1,000 reviews is refused and says why; a fit that cannot
         beat the parameters in use changes nothing; a card the log meets
         mid-life starts from the memory its first row records.
     B · THE SCHEDULER READS THE FIT: setFit keeps an accepted result in
         state.srsCfg.fit and KOS.srs.weights() returns it; a rating's
         interval and Code's retrieval card schedule with it; an invalid
         stored set reads as the defaults; resetFit goes back. No due date
         moves when a fit is kept.
     C · ONE FIT MERGES WHOLE: two devices' fits never mix element-wise.
     D · THE REVIEW LOG REPLICATES: signed out nothing is sent; signed in,
         this device's rows go up once (keyed by uid), another device's
         arrive marked `rm` and are never pushed back.
     E · CARD STATS: the "Fitted to your reviews" card draws without
         writing; under 1,000 reviews Optimise is off and says how many to
         go; with enough, Optimise previews what changes and "Use these
         parameters" keeps the fit.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke96.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");
const F = require("../js/core/fsrs.js");
const O = require("../js/core/fsrsopt.js");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const p = (fn) => new Promise((res, rej) => fn((e, v) => (e ? rej(e) : res(v))));

/* a learner whose memory is not FSRS-6's defaults */
const TRUE = F.W.slice();
TRUE[0] = 0.6; TRUE[2] = 4.5; TRUE[8] = 1.4; TRUE[11] = 2.2; TRUE[20] = 0.3;
function simulate(nCards, perCard, s0) {
  let seed = s0 || 7;
  const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const rows = []; let ts = 1700000000000;
  for (let c = 0; c < nCards; c++) {
    const mid = c % 3 === 0;
    let mem = mid ? { s: 5 + rnd() * 20, d: 3 + rnd() * 5 } : null;
    for (let i = 0; i < perCard; i++) {
      const el = !mem ? 0 : Math.max(1, Math.round(F.interval(mem.s, 0.9) * (0.6 + rnd() * 0.9)));
      const recalled = mem ? rnd() < F.retrievability(el, mem.s, TRUE) : rnd() < 0.7;
      const g = !recalled ? 1 : rnd() < 0.15 ? 2 : rnd() < 0.85 ? 3 : 4;
      const nm = F.memory(mem, g, el, TRUE);
      rows.push({ key: "compsci:sim:" + c, ts: ts++, day: "2026-10-01", g, el, s0: mem ? mem.s : null, d0: mem ? mem.d : null, s1: nm.s, d1: nm.d, ivl: 1, src: "flashcards" });
      mem = nm;
    }
  }
  return rows;
}

let fitRes;
step("A · the fit beats the defaults and stays in bounds", () => {
  const rows = simulate(400, 6);
  fitRes = O.fit(rows);
  assert(fitRes.ok, "accepted: " + fitRes.why);
  const truth = O.evaluate(TRUE, O.prepare(rows)).loss;
  assert(fitRes.after.loss < fitRes.defaults.loss - 0.003, "beats the defaults: " + fitRes.after.loss + " vs " + fitRes.defaults.loss);
  assert(fitRes.after.loss - truth < 0.002, "close to the true model: " + fitRes.after.loss + " vs " + truth);
  assert(O.valid(fitRes.w), "every parameter in bounds");
  assert(Math.abs(fitRes.after.predicted - fitRes.after.actual) < 0.02, "calibrated");
  for (let i = 1; i < 4; i++) assert(fitRes.w[i] >= fitRes.w[i - 1], "first stabilities non-decreasing");
});
step("A · too few reviews, and no better, change nothing", () => {
  const small = O.fit(simulate(50, 4));
  eq([small.ok, small.why, small.reviews], [false, "reviews", 200], "under 1,000 is refused");
  const rows = simulate(400, 6);
  const again = O.fit(rows, { current: fitRes.w });
  assert(!again.ok && again.why === "no-better" || again.after.loss < again.before.loss, "a fit is kept only when it beats what is in use");
  const d = O.prepare([{ key: "k", ts: 1, g: 3, el: 10, s0: 12, d0: 5 }]);
  eq([d.items, d.seqs[0].init], [1, { s: 12, d: 5 }], "a mid-life card starts from its recorded memory");
});

let app, K;
step("boot", async () => {
  app = await boot({ clock: "2026-10-22T10:00:00" });
  K = app.KOS;
  eq(app.errors, [], "boot errors");
});

step("B · the scheduler reads the fit", () => {
  const S = K.srs;
  eq(S.weights(), F.W, "defaults at first");
  const key = S.allCards()[0].key;
  const m = S.meta(key);
  Object.assign(m, { last: "2026-10-12", due: "2026-10-22", s: 10, d: 5, fl: "2026-10-12", reps: 3, views: 3 });
  const dueBefore = m.due;
  const before = S.preview(key, 2);
  S.setFit(fitRes);
  eq(S.weights(), fitRes.w, "the fit is in use");
  eq(m.due, dueBefore, "keeping a fit moves no due date");
  eq(K.store.state.srsCfg.fit.reviews, fitRes.reviews, "kept with its reviews");
  const want = F.schedule({ s: 10, d: 5 }, 3, 10, { retention: S.retention(), seed: key + "|2026-10-22", againToday: true, w: fitRes.w }).ivl;
  eq(S.preview(key, 2), want, "a rating schedules with the fit");
  assert(want !== before, "and the fit moved it (" + before + " → " + want + ")");
  K.store.state.srsCfg.fit.w = [1, 2, 3];
  eq(S.weights(), F.W, "an invalid stored set reads as the defaults");
  S.setFit(fitRes);
  S.resetFit();
  eq(S.weights(), F.W, "reset goes back");
  assert(!K.store.state.srsCfg.fit, "and forgets the fit");
});

step("C · one fit merges whole", () => {
  const a = fitRes.w.slice(), b = fitRes.w.map((x, i) => i === 3 ? x + 1 : x);
  const c = fitRes.w.map((x, i) => i === 5 ? x * 0.9 : x);
  const base = { srsCfg: { retention: 0.9, fit: { w: F.W.slice(), at: 1 } } };
  const out = K.cloudmerge.merge(base, { srsCfg: { retention: 0.9, fit: { w: b, at: 2 } } }, { srsCfg: { retention: 0.9, fit: { w: c, at: 3 } } }).doc;
  assert(JSON.stringify(out.srsCfg.fit.w) === JSON.stringify(b) || JSON.stringify(out.srsCfg.fit.w) === JSON.stringify(c), "one side's set, never a mix");
  void a;
});

step("D · the review log replicates", async () => {
  const L = K.reviewLog;
  const rows = new Map(); let n = 0;
  const ts = () => "2026-10-22T10:00:" + String(n++).padStart(2, "0");
  L._setCloudApi({
    since(stamp, offset, cb) {
      const list = [...rows.values()].filter((r) => !stamp || r.updated_at > stamp).sort((x, y) => (x.updated_at < y.updated_at ? -1 : 1));
      cb(null, list.slice(offset, offset + 500));
    },
    upsert(batch, cb) { batch.forEach((r) => { if (!rows.has(r.uid)) rows.set(r.uid, Object.assign({}, r, { updated_at: ts() })); }); cb(null, []); }
  });
  K.cloud.signedIn = () => false;
  eq((await p((cb) => L.syncCloud(cb))).skipped, true, "signed out, nothing is sent");
  await p((cb) => L.importAll([], cb));
  await p((cb) => L.add({ key: "compsci:4.1.1:0", ts: 111, day: "2026-10-22", g: 3, el: 2, s0: 3, d0: 5, s1: 6, d1: 5, ivl: 6 }, cb));
  await p((cb) => L.add({ key: "compsci:4.1.1:1", ts: 112, day: "2026-10-22", g: 1, el: 4, s0: 3, d0: 5, s1: 1, d1: 6, ivl: 0 }, cb));
  K.cloud.signedIn = () => true; K.cloud.userId = () => "u1";
  const up = await p((cb) => L.syncCloud(cb));
  eq(up.pushed, 2, "this device's rows go up");
  assert(rows.has("compsci:4.1.1:0|111"), "keyed by uid");
  assert(!("id" in rows.get("compsci:4.1.1:0|111").data_json), "without the local id");
  rows.set("maths:P1.1:0|500", { uid: "maths:P1.1:0|500", data_json: { key: "maths:P1.1:0", ts: 500, g: 4, el: 9, s0: 4, d0: 4, s1: 20, d1: 3 }, updated_at: ts() });
  const down = await p((cb) => L.syncCloud(cb));
  eq([down.pulled, down.pushed], [1, 0], "another device's row arrives; our own echo is skipped");
  const local = await p((cb) => L.all(cb));
  eq(local.length, 3, "three rows here");
  eq(local.find((r) => r.key === "maths:P1.1:0").rm, 1, "the pulled row is marked");
  const again = await p((cb) => L.syncCloud(cb));
  eq([again.pulled, again.pushed], [0, 0], "and is never pushed back");
  K.cloud.signedIn = () => false;
});

step("E · Card stats' fit card", async () => {
  const $ = (s) => app.document.querySelector(s);
  await p((cb) => K.reviewLog.importAll([], cb));
  /* enough scheduled cards for the charts (invariant 76) */
  K.srs.allCards().slice(0, 6).forEach((c, i) => Object.assign(K.srs.meta(c.key),
    { last: "2026-10-15", due: "2026-10-2" + (i % 9), s: 6 + i, d: 4 + i / 3, fl: "2026-10-15", reps: 2, views: 2 }));
  K.store.save();
  const bare = () => JSON.stringify(Object.assign({}, K.store.state, { ui: null }));
  const snap = bare();
  K.show("cardstats"); await app.settle(); await app.settle();
  const card = $("[data-ui~='review.fit']");
  assert(card, "the card is drawn");
  assert($("[data-ui~='review.fit-run']").disabled, "Optimise is off under 1,000 reviews");
  assert(/1,000 to go/.test($("[data-ui~='review.fit-status']").textContent), "and says how many to go: " + $("[data-ui~='review.fit-status']").textContent);
  eq(bare(), snap, "drawing writes nothing (navigation's own ui aside)");
  await p((cb) => K.reviewLog.importAll(simulate(400, 6, 11), cb));
  K.show("cardstats"); await app.settle(); await app.settle();
  assert(!$("[data-ui~='review.fit-run']").disabled, "Optimise is on");
  $("[data-ui~='review.fit-run']").click();
  for (let i = 0; i < 20 && !$("[data-ui~='review.fit-preview']"); i++) await app.settle();
  const prev = $("[data-ui~='review.fit-preview']");
  assert(prev && /log loss/.test(prev.textContent) && /predicted/.test(prev.textContent), "the preview says what changes");
  $("[data-ui~='review.fit-use']").click(); await app.settle();
  assert(K.srs.fitted(), "the fit is kept");
  assert(/Fitted .* to 2,400 reviews/.test($("[data-ui~='review.fit-status']").textContent), "the card says so");
  assert($("[data-ui~='review.fit-reset']"), "and offers the defaults back");
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke96: " + failed + " failed" : "smoke96: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
