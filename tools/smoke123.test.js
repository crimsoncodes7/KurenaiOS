/* Kurenai OS — smoke123.test.js
   The backup-before-change safeguard (quality programme W0, plan §B1;
   js/core/backup.js; invariants 7 and 35).

   The claims:

     A · CHECKPOINT: a checkpoint of a used account is ok, names an id,
         counts every part (state, media entries, kv, attachments, money,
         reviews, Mind, ink, Creatives) and its bytes; it is listed, and
         the stored copy verifies against its own hashes.
     B · NO SECRETS: the stored text carries no provider or GitHub token
         and no cloudsync.* kv, though the live kv holds them.
     C · ROUND TRIP: mutate the state and the vault after a checkpoint,
         restore it, and the state, the vault and every part's hash are
         exactly as checkpointed.
     D · CORRUPTION: a stored copy edited afterwards fails verify, and
         restore refuses it (nothing changes); a checkpoint whose read-back
         is corrupt is ok:false and leaves no copy behind.
     E · KEEP FIVE: seven checkpoints leave the newest five.
     F · WITHCHECKPOINT: fn runs only after a verified checkpoint, with it;
         when verification fails fn never runs.
     G · ZERO GOVERNOR TRAFFIC: none of this logs a session or moves XP,
         gold or HP.

   Run: node tools/smoke123.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, B;
/* the harness's timers are virtual: drive a promise to its end */
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 2000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const cbp = (fn) => wait(new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v))));
function gov() { const g = K.store.state.governor; return JSON.stringify([g.xp, g.gold, g.hp, K.store.state.sessions.length]); }
let govBefore;

step("boot and seed", async () => {
  app = await boot();
  K = app.KOS; B = K.backup;
  assert(B && B.available(), "KOS.backup loads and has IndexedDB");
  await seedAccount(app);
  await app.settle();
  /* secrets and sync watermarks that must never ride a backup */
  for (const [k, v] of [["anilist.token", "tok-SECRET-1"], ["vndb.token", "tok-SECRET-2"], ["github.token", "tok-SECRET-3"],
    ["cloudsync.base.u1", { a: 1 }], ["hero.anime", { src: "x" }]]) await cbp((cb) => K.mediadb.setKV(k, v, cb));
  govBefore = gov();
  const errs = app.errors.filter((e) => /LOAD FAIL/.test(e));
  assert(!errs.length, "scripts load: " + errs.join(" | "));
});

let first;
step("A · a checkpoint is verified, counted and listed", async () => {
  first = await wait(B.checkpoint("smoke A"));
  assert(first.ok, "ok: " + first.reason);
  assert(/^bk-/.test(first.id), "an id");
  assert(first.bytes > 1000, "bytes: " + first.bytes);
  eq(Object.keys(first.counts).sort(), B.PARTS.slice().sort(), "every part counted");
  assert(first.counts.state > 10, "the state's keys are counted");
  assert(first.counts.mediaEntries > 0, "the vault is counted: " + first.counts.mediaEntries);
  assert(first.counts.mediaKV >= 1, "the non-secret kv is counted");
  const list = await wait(B.list());
  eq(list.map((x) => x.id), [first.id], "listed");
  assert(!("text" in list[0]), "the listing carries no backup text");
  eq((await wait(B.verify(first.id))).ok, true, "the stored copy verifies");
});

step("B · no credential or cloud watermark rides the backup", async () => {
  const rec = await wait(B._raw.get(first.id));
  assert(!/tok-SECRET/.test(rec.text), "no token text in the backup");
  const kv = JSON.parse(rec.text).mediaKV.map((x) => x.key);
  ["anilist.token", "vndb.token", "github.token", "cloudsync.base.u1"].forEach((k) => assert(kv.indexOf(k) < 0, "left out: " + k));
  assert(kv.indexOf("hero.anime") >= 0, "an ordinary kv key is kept");
});

step("C · checkpoint → mutate → restore round trip", async () => {
  const cp = await wait(B.checkpoint("before mutate"));
  assert(cp.ok, "checkpoint ok: " + cp.reason);
  const stateBefore = JSON.stringify(K.store.state);
  const rowsBefore = (await cbp((cb) => K.mediadb.query({}, cb))).length;
  const digestBefore = await wait(new Promise((res, rej) => K.store.snapshotFull((e, s) => e ? rej(e) : res(s))).then(B.digest));
  /* the change a repair might make */
  K.store.state.governor.gold = 1; K.store.state.sessions.splice(0, 20);
  K.store.state.ui.smokeMarker = "after";
  await cbp((cb) => K.mediadb.bulkUpsert([{ module: "anime", title: "Smoke Added Row", status: "planned", syncSource: "manual", progress: { current: 0, total: 1 } }], {}, cb));
  eq((await cbp((cb) => K.mediadb.query({}, cb))).length, rowsBefore + 1, "the mutation added a row");
  const report = await wait(B.restore(cp.id));
  assert(report.restoredSections && report.restoredSections.length, "importFull reports what it restored");
  eq((await cbp((cb) => K.mediadb.query({}, cb))).length, rowsBefore, "the vault is back to its rows");
  eq(K.store.state.governor.gold, JSON.parse(stateBefore).governor.gold, "gold is back");
  eq(K.store.state.sessions.length, JSON.parse(stateBefore).sessions.length, "the ledger is back");
  assert(!("smokeMarker" in K.store.state.ui), "the state is the checkpoint's");
  const digestAfter = await wait(new Promise((res, rej) => K.store.snapshotFull((e, s) => e ? rej(e) : res(s))).then(B.digest));
  ["mediaEntries", "mediaKV", "money", "reviews", "mind", "ink", "creatives"].forEach((p) =>
    eq(digestAfter.hashes[p], digestBefore.hashes[p], "part " + p + " restored exactly"));
  /* the state document: every synced key as checkpointed (state.ui is per
     device and the boot's own evaluations may touch it after a restore) */
  const noUi = (s) => { const c = JSON.parse(JSON.stringify(s)); delete c.ui; return B.canon(c); };
  eq(noUi(K.store.state), noUi(JSON.parse(stateBefore)), "the state document restored exactly (key order aside)");
});

step("D · a corrupted backup fails verification and is never restored", async () => {
  const cp = await wait(B.checkpoint("to corrupt"));
  assert(cp.ok, "checkpoint ok");
  const rec = await wait(B._raw.get(cp.id));
  const bad = JSON.parse(rec.text); bad.state.governor.gold = 999999;
  rec.text = JSON.stringify(bad);
  await wait(B._raw.put(rec));
  const v = await wait(B.verify(cp.id));
  eq(v.ok, false, "the edited copy fails verify");
  assert(/state/.test(v.reason), "the reason names the part: " + v.reason);
  const goldNow = K.store.state.governor.gold;
  let refused = null;
  try { await wait(B.restore(cp.id)); } catch (e) { refused = e; }
  assert(refused && /did not verify/.test(refused.message), "restore refuses a corrupt copy");
  eq(K.store.state.governor.gold, goldNow, "nothing was restored");
  /* truncated text */
  rec.text = rec.text.slice(0, 200); await wait(B._raw.put(rec));
  eq((await wait(B.verify(cp.id))).ok, false, "truncated text fails verify");
  /* a checkpoint whose read-back is corrupt */
  const before = (await wait(B.list())).length;
  B._seam.afterRead = (t) => t.replace(/"gold":\s*\d+/, '"gold":-1');
  const failed = await wait(B.checkpoint("read-back corrupt"));
  B._seam.afterRead = null;
  eq(failed.ok, false, "a checkpoint that reads back wrong is never ok");
  assert(failed.id === null && /saved copy/.test(failed.reason), "it says why: " + failed.reason);
  eq((await wait(B.list())).length, before, "no unverified copy is kept");
});

step("E · the last five are kept", async () => {
  const ids = [];
  for (let i = 0; i < 7; i++) {
    await app.settle();
    const r = await wait(B.checkpoint("rot " + i));
    assert(r.ok, "checkpoint " + i);
    ids.push(r.id);
  }
  const list = await wait(B.list());
  eq(list.length, 5, "five kept");
  eq(list.map((x) => x.id).sort(), ids.slice(2).sort(), "the newest five");
});

step("F · withCheckpoint runs fn only after a verified checkpoint", async () => {
  let ran = 0, seen = null;
  const good = await wait(B.withCheckpoint("repair", (cp) => { ran++; seen = cp; return 42; }));
  assert(good.ok && good.value === 42 && ran === 1, "fn ran once and its value came back");
  assert(seen && seen.ok && seen.id === good.checkpoint.id, "fn got the verified checkpoint");
  B._seam.afterRead = () => "{not json";
  const bad = await wait(B.withCheckpoint("repair", () => { ran++; }));
  B._seam.afterRead = null;
  eq(ran, 1, "fn never ran when verification failed");
  assert(bad.ok === false && /No verified backup/.test(bad.reason), "it says why: " + bad.reason);
  /* the store cannot snapshot */
  const real = K.store.snapshotFull;
  K.store.snapshotFull = (cb) => cb(new Error("disk gone"));
  const broken = await wait(B.withCheckpoint("repair", () => { ran++; }));
  K.store.snapshotFull = real;
  eq(ran, 1, "fn never ran when the snapshot failed");
  assert(!broken.ok && /disk gone/.test(broken.reason), "the error is the reason");
});

step("G · zero Governor traffic", async () => {
  /* C's restore put the state back as checkpointed, which was after seeding */
  eq(gov(), govBefore, "XP, gold, HP and the ledger as they were");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke123: " + failed + " failed" : "smoke123: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
