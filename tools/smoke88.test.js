/* Kurenai OS — smoke88.test.js
   FSRS, phase 1 (roadmap 5.6, docs/fsrs-plan.md): one scheduler for every
   card, and the switch from SM-2 without losing a card's history.

   The claims:

     A · THE CORE. KOS.fsrs is FSRS-6: a new card's first stability is
         w[g-1]; the SM-2 conversion gives s = the interval at r = 0.9, and
         the next on-time Good multiplies it by the old ease (the plan's
         table). tools/fsrs_check.mjs holds the rest against py-fsrs.
     B · THE MIGRATION. KOS.srs.migrate() gives every rated card s, d and
         fl, moves no due date, keeps views, lapses, reps and ef, leaves a
         never-rated card alone, relearns a lapsed one, and a second pass
         converts nothing.
     C · AN OLDER COPY OF THE APP. A card it rated after the switch (its
         `last` moved, `fl` did not) converts again from its ease and
         interval, before the next rating and at the next boot; the cloud
         merge of such a card keeps a readable schedule.
     D · RATING. The preview on each button is what the rating schedules;
         Again stays due today; every rating writes one review-log row
         (key, grade, elapsed, memory before and after), never card text.
     E · TARGET RETENTION is clamped to 0.80–0.95, synced in the state
         document, and a higher target brings a card back sooner.
     F · FUZZ is deterministic (key + day): the same card on the same day
         always gets the same interval, and cards learnt together spread.
     G · CODE. Retrieval cards convert at boot and schedule through the same
         core with their derived grade; an Again waits the forget interval
         (no requeue), and the log marks the row "code".
     H · BACKUP. The full backup carries the review log, and a restore puts
         it back exactly.
     I · RENDERS WRITE NOTHING. Card stats, Due today and a topic's deck
         draw from unconverted cards without writing state (the boot pass
         is the only writer), and the ease figures are gone.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke88.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
function near(a, b, m, tol) { if (!(Math.abs(a - b) <= (tol || 1e-3))) throw new Error(m + ": got " + a + ", want " + b); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }

const TODAY = "2026-10-19";
function day(n) {
  const [y, m, d] = TODAY.split("-").map(Number);
  const x = new Date(y, m - 1, d + n);
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}

/* a returning user's SM-2 deck, written by the release before the switch */
const SM2 = {
  "compsci:4.2.3.1:0": { ef: 2.5, ivl: 6, reps: 3, due: day(2), last: day(-4), views: 5, lapses: 0, lastRating: 2 },
  "compsci:4.2.3.1:1": { ef: 2.6, ivl: 15, reps: 4, due: day(-3), last: day(-18), views: 6, lapses: 1, lastRating: 3 },
  "compsci:4.2.3.1:2": { ef: 1.96, ivl: 0, reps: 0, due: TODAY, last: TODAY, views: 4, lapses: 2, lastRating: 0 },
  "compsci:4.2.3.1:3": { ef: 2.5, ivl: 0, reps: 0, due: null, last: null, views: 0, lapses: 0, lastRating: null },
  "maths:2.3:0": { ef: 1.7, ivl: 4, reps: 2, due: day(1), last: day(-3), views: 3, lapses: 1, lastRating: 1 }
};
const clone = (o) => JSON.parse(JSON.stringify(o));

let app, K;

step("boot a returning SM-2 user", async () => {
  app = await boot({ clock: TODAY + "T10:00:00", storage: { "kurenai-os-v1": JSON.stringify({ progress: {}, srs: clone(SM2) }) } });
  K = app.KOS;
  assert(K.fsrs && K.srs.migrate && K.reviewLog, "the core, the switch and the log are loaded");
  eq(app.errors, [], "boot errors");
});

/* ---------------- A ---------------- */
step("A · the core is FSRS-6 and the conversion reproduces SM-2's next Good", () => {
  const F = K.fsrs;
  eq(F.W.length, 21, "21 parameters");
  near(F.memory(null, 3, 0).s, 2.3065, "first Good stability = w[2]");
  const table = [[2.5, 6, 7.25, 15], [2.6, 15, 6.34, 39], [2.36, 6, 7.6, 14], [2.18, 3, 8.37, 7], [1.7, 4, 9.36, 7]];
  table.forEach(([ef, ivl, d, good]) => {
    const c = F.fromSM2(ef, ivl, 0.9);
    near(c.s, ivl, `s for ease ${ef}, ${ivl}d`);
    near(c.d, d, `d for ease ${ef}, ${ivl}d`, 0.01);
    eq(F.interval(c.s, 0.9), ivl, "the due date does not move");
    eq(F.interval(F.memory(c, 3, ivl).s, 0.9), good, `next on-time Good for ease ${ef}, ${ivl}d`);
  });
});

/* ---------------- B ---------------- */
step("B · the boot pass converted every rated card and moved no due date", () => {
  const srs = K.store.state.srs;
  ["compsci:4.2.3.1:0", "compsci:4.2.3.1:1", "maths:2.3:0"].forEach((k) => {
    const m = srs[k], o = SM2[k];
    near(m.s, o.ivl, k + " s = the SM-2 interval");
    assert(m.d >= 1 && m.d <= 10, k + " difficulty in range");
    eq([m.due, m.last, m.fl, m.views, m.lapses, m.reps, m.ef, m.ivl], [o.due, o.last, o.last, o.views, o.lapses, o.reps, o.ef, o.ivl], k + " kept");
  });
  const lapsed = srs["compsci:4.2.3.1:2"];
  assert(lapsed.s > 0 && lapsed.s < 1, "a lapsed card relearns from a short stability: " + lapsed.s);
  eq(lapsed.due, TODAY, "and stays due today");
  const fresh = srs["compsci:4.2.3.1:3"];
  assert(fresh.s === undefined && fresh.fl === undefined, "a never-rated card is left alone");
  eq(K.srs.migrate(), 0, "a second pass converts nothing");
});

/* ---------------- C ---------------- */
step("C · a card an older copy rated after the switch converts again", () => {
  const k = "maths:2.3:0";
  const m = K.store.state.srs[k];
  // the old release rates it Good two days later: SM-2 moves ef/ivl/last, never s/d/fl
  Object.assign(m, { ivl: 7, ef: 1.7, last: day(-1), due: day(6), reps: 3, views: 4 });
  const mem = K.fsrs.recordMemory(m);
  near(mem.s, 7, "read from the SM-2 fields, not the stale s");
  eq(K.srs.migrate(), 1, "the boot pass converts it again");
  eq([m.fl, m.due], [day(-1), day(6)], "fl catches up; the old copy's due date stands");
});

step("C · the cloud merge of an old-copy edit and a new-copy edit stays readable", () => {
  const k = "compsci:4.2.3.1:0";
  const base = { srs: { [k]: clone(K.store.state.srs[k]) } };
  const local = clone(base), remote = clone(base);
  // this device (FSRS) rates it today
  Object.assign(local.srs[k], { s: 15.2, d: 7.1, fl: TODAY, last: TODAY, ivl: 15, due: day(15), views: 6, reps: 4 });
  // another device on the old release rated it yesterday
  Object.assign(remote.srs[k], { ivl: 15, ef: 2.5, last: day(-1), due: day(14), views: 6, reps: 4 });
  const doc = K.cloudmerge.merge(base, local, remote).doc;
  const mem = K.fsrs.recordMemory(doc.srs[k]);
  assert(mem && mem.s > 0 && mem.d >= 1 && mem.d <= 10, "a schedule can still be read: " + JSON.stringify(doc.srs[k]));
});

/* ---------------- D ---------------- */
step("D · the button's preview is the schedule; Again stays due today; one log row per rating", async () => {
  const k = "compsci:4.2.3.1:1";
  const before = await p((cb) => K.reviewLog.count(cb));
  const previews = [0, 1, 2, 3].map((r) => K.srs.preview(k, r));
  const m = K.srs.rate(k, 2);
  eq(m.ivl, previews[2], "Good scheduled what its button said");
  eq([m.fl, m.last, m.due], [TODAY, TODAY, day(m.ivl)], "dates");
  assert(m.ivl > 15, "a success 18 days after the last review (3 overdue) grows the interval: " + m.ivl);
  const a = K.srs.rate(k, 0);
  eq([a.ivl, a.due, a.reps], [0, TODAY, 0], "Again: due today, reps reset");
  await app.settle();
  const rows = await p((cb) => K.reviewLog.all(cb));
  eq(rows.length - before, 2, "two ratings, two rows");
  const row = rows[rows.length - 2];
  eq([row.key, row.g, row.el, row.src, row.day], [k, 3, 18, "flashcards", TODAY], "the Good row");
  near(row.s0, 15, "memory before");
  assert(row.s1 > row.s0, "memory after");
  assert(!("q" in row) && !("a" in row), "no card text in the log");
});

/* ---------------- E ---------------- */
step("E · target retention: clamped, synced, and a higher target comes back sooner", () => {
  eq(K.srs.retention(), 0.9, "default");
  eq(K.srs.setRetention(0.99), 0.95, "clamped high");
  eq(K.srs.setRetention(0.5), 0.8, "clamped low");
  K.srs.setRetention(0.8);
  const lo = K.srs.preview("compsci:4.2.3.1:0", 2);
  K.srs.setRetention(0.95);
  const hi = K.srs.preview("compsci:4.2.3.1:0", 2);
  assert(hi < lo, "95% schedules sooner than 80%: " + hi + " vs " + lo);
  eq(K.store.state.srsCfg.retention, 0.95, "kept in the synced state document");
  K.srs.setRetention(0.9);
});

/* ---------------- F ---------------- */
step("F · fuzz is deterministic and spreads cards learnt together", () => {
  const F = K.fsrs;
  const mem = { s: 20, d: 5 };
  const one = F.schedule(mem, 3, 20, { retention: 0.9, seed: "compsci:1:1|" + TODAY }).ivl;
  const two = F.schedule(mem, 3, 20, { retention: 0.9, seed: "compsci:1:1|" + TODAY }).ivl;
  eq(one, two, "same card, same day, same interval");
  const spread = new Set();
  for (let i = 0; i < 50; i++) spread.add(F.schedule(mem, 3, 20, { retention: 0.9, seed: "compsci:1:" + i + "|" + TODAY }).ivl);
  assert(spread.size >= 3, "50 cards with the same memory spread over several days: " + [...spread]);
  const plain = F.schedule(mem, 3, 20, { retention: 0.9 }).ivl;
  const [lo, hi] = F.fuzzRange(plain);
  [...spread].forEach((v) => assert(v >= lo && v <= hi, "inside py-fsrs's fuzz window: " + v));
  eq(F.schedule(null, 3, 0, {}).ivl, 2, "a new card's first Good is 2 days");
  for (let i = 0; i < 20; i++) eq(F.schedule(null, 3, 0, { seed: "new:" + i }).ivl, 2, "no fuzz under 2.5 days");
});

/* ---------------- G ---------------- */
step("G · Code's retrieval cards: converted at boot, scheduled by the same core", async () => {
  const C = K.code;
  const id = Object.keys(window_KOS_CODE().CARDS)[0];
  assert(id, "a Code card to test with");
  const st = C.state();
  st.cards[id] = { due: day(-1), ivl: 5, ef: 2.3, reps: 2, lapses: 0, last: day(-6), n: 3, grade: "good" };
  eq(C.migrateCards(), 1, "the boot pass converts it");
  near(st.cards[id].s, 5, "s = its interval");
  eq(st.cards[id].due, day(-1), "its due date stands");
  const out = C.recordCard(id, { passed: false, tries: 1, hint: false, secs: 30 });
  eq(out.grade, "again", "a failed card is Again");
  assert(st.cards[id].due > TODAY, "a Code Again waits the forget interval, not today: " + st.cards[id].due);
  eq(st.cards[id].fl, TODAY, "moved by FSRS");
  await app.settle();
  const rows = await p((cb) => K.reviewLog.all(cb));
  const last = rows[rows.length - 1];
  eq([last.key, last.src, last.g], ["code:" + id, "code", 1], "logged as a Code review");
});
function window_KOS_CODE() { return app.window.KOS_CODE; }

/* ---------------- H ---------------- */
step("H · the full backup carries the review log and a restore puts it back", async () => {
  const snap = await p((cb) => K.store.snapshotFull(cb));
  assert(Array.isArray(snap.reviews) && snap.reviews.length >= 3, "reviews in the backup: " + (snap.reviews || []).length);
  assert(snap.reviews.every((r) => !("id" in r)), "no local ids exported");
  await p((cb) => K.reviewLog.importAll([], cb));
  eq(await p((cb) => K.reviewLog.count(cb)), 0, "cleared");
  await p((cb) => K.reviewLog.importAll(snap.reviews, cb));
  eq(await p((cb) => K.reviewLog.count(cb)), snap.reviews.length, "restored exactly");
});

/* ---------------- I ---------------- */
step("I · Card stats, Due today and a deck draw unconverted cards without writing", async () => {
  // a card in the old shape arrives (a pull from an older device) and is not yet converted
  K.store.state.srs["compsci:4.2.3.1:4"] = { ef: 2.2, ivl: 9, reps: 3, due: day(3), last: day(-6), views: 4, lapses: 0, lastRating: 2 };
  const before = JSON.stringify(K.store.state.srs);
  for (const [view, arg] of [["cardstats", undefined], ["review", { tab: "due" }], ["cardstats", { subject: "compsci" }]]) {
    K.show(view, arg);
    await app.settle();
    eq(JSON.stringify(K.store.state.srs), before, view + " wrote to the schedule while drawing");
  }
  const page = app.document.body.textContent;
  assert(!/Average ease|Ease distribution|Avg ease/.test(page), "the ease figures are gone");
  assert(/Recall today/.test(page) && /Target retention/.test(page) && /Difficulty/.test(page), "the FSRS figures are drawn");
  assert(app.document.querySelector('[data-ui~="review.retention"]'), "the retention picker is on Card stats");
  eq(app.errors, [], "window errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("FAIL  " + name + "\n      " + e.message); }
  }
  console.log(failed ? "\n" + failed + " step(s) failed" : "\nsmoke88: all " + steps.length + " steps passed");
  process.exit(failed ? 1 : 0);
})();
