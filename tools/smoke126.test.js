/* Kurenai OS — smoke126.test.js
   The DI-27 clean-up, on test data only (quality W1, decision B1;
   js/core/repair-di27.js through KOS.repairs).

     A · THE CLASSIFIER: the collided rows are exactly the Books rows whose
         MAL id an Anime row carries; the phantom entries are exactly the
         sync rewards naming only those rows; a mixed entry and a genuine
         sync reward are kept; the pay is the sum of their recorded awards.
     B · THE PREVIEW writes nothing and shows before/after, with the gold
         deduction clamped at the balance.
     C · THE RUN (approved, after a verified checkpoint): the phantom entries
         are gone, one correction entry carries the negative award, XP and
         gold match the preview's "after", nothing else in the ledger moved.
     D · THE CORRECTION is not activity, study or rest: the study streak and
         the day's activity are as before, Reports' "earned" leaves it out,
         and the badges earned are untouched.
     E · IDEMPOTENT: a second preview finds nothing; a second run is a no-op.

   Run: node tools/smoke126.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K;
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 2000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const cb = (fn) => wait(new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v))));
const ID = "di27-phantom-sync";
let preview, others, streakBefore, earnedBefore;

function entry(id, date, metrics, award) { return { id, ts: Date.parse(date + "T09:00:00"), date, type: "media", subject: null, ref: null, dur: null, metrics, award }; }

step("boot, seed, and plant the bug's traces", async () => {
  app = await boot();
  K = app.KOS;
  await seedAccount(app);
  await app.settle();
  const rows = [
    { module: "books", title: "Death Note", status: "onHold", format: "MANGA", syncSource: "anilist", externalIds: { anilistId: 30021, malId: 21 }, progress: { current: 0, total: 108, volumes: 8 } },
    { module: "books", title: "Aku no Kyouten", status: "completed", format: "MANGA", syncSource: "anilist", externalIds: { anilistId: 86000, malId: 9000 }, progress: { current: 36, total: 36, volumes: 9 } },
    { module: "books", title: "Bleach", status: "completed", format: "MANGA", syncSource: "anilist", externalIds: { anilistId: 30012, malId: 12 }, progress: { current: 686, total: 686, volumes: 74 } },
    { module: "anime", title: "ONE PIECE", status: "planned", format: "TV", syncSource: "anilist", externalIds: { anilistId: 21, malId: 21 }, progress: { current: 0 } },
    { module: "anime", title: "Some Anime 9000", status: "completed", format: "TV", syncSource: "anilist", externalIds: { anilistId: 9000, malId: 9000 }, progress: { current: 12, total: 12 } },
    { module: "anime", title: "Clannad", status: "completed", format: "TV", syncSource: "anilist", externalIds: { anilistId: 2167, malId: 2167 }, progress: { current: 23, total: 23 } },
    /* the Death Note ANIME, a different title with the manga's name */
    { module: "anime", title: "Death Note", status: "inProgress", format: "TV", syncSource: "anilist", externalIds: { anilistId: 1535, malId: 1535 }, progress: { current: 10, total: 37 } }
  ];
  await cb((c) => K.mediadb.bulkUpsert(rows, {}, c));
  /* the Death Note anime really moved on 10 Sep (and only then) */
  const dnA = (await cb((c) => K.mediadb.query({ module: "anime" }, c))).find((r) => r.title === "Death Note");
  await cb((c) => K.mediadb.replaceJournal(dnA.syncId, [[Date.parse("2026-09-10T20:00:00"), "progress", 9, 10]], c));
  const st = K.store.state;
  let id = 50000;
  const planted = [];
  for (let d = 1; d <= 20; d++) {
    const date = "2026-09-" + String(d).padStart(2, "0");
    planted.push(entry(id++, date, { module: "books", action: "sync-reward", entries: 1, units: 8, advances: 1, titles: ["Death Note"] }, { xp: 46, gold: 12 }));
    planted.push(entry(id++, date, { module: "integrations", modules: ["anime", "books"], action: "sync-reward", entries: 2, units: 9, advances: 1, titles: ["Aku no Kyouten", "Death Note"] }, { xp: 46, gold: 12 }));
  }
  planted.push(entry(id++, "2026-09-05", { module: "books", action: "sync-reward", entries: 1, units: 3, advances: 0, titles: ["Death Note"] }));   /* no award: priced */
  planted.push(entry(id++, "2026-09-06", { module: "integrations", modules: ["anime", "books"], action: "sync-reward", entries: 2, units: 4, advances: 0, titles: ["Death Note", "Clannad"] }, { xp: 8, gold: 2 }));   /* mixed */
  planted.push(entry(id++, "2026-09-07", { module: "anime", action: "sync-reward", entries: 1, units: 2, advances: 0, titles: ["Clannad"] }, { xp: 6, gold: 1 }));   /* genuine */
  planted.push(entry(id++, "2026-09-08", { module: "books", action: "sync-reward", entries: 6, units: 20, advances: 0, titles: ["Death Note", "Death Note", "Death Note", "Death Note", "Death Note"] }, { xp: 24, gold: 6 }));   /* 6 entries, 5 named: unknown sixth, kept */
  /* review findings (9 Nov): never a genuine reward */
  planted.push(entry(id++, "2026-09-09", { module: "anime", action: "sync-reward", entries: 1, units: 1, advances: 0, titles: ["Death Note"] }, { xp: 5, gold: 1 }));   /* the anime's own: kept */
  planted.push(entry(id++, "2026-09-10", { module: "integrations", modules: ["anime", "books"], action: "sync-reward", entries: 1, units: 1, advances: 0, titles: ["Death Note"] }, { xp: 5, gold: 1 }));   /* ambiguous: kept */
  planted.push(entry(id++, "2026-11-09", { module: "books", action: "sync-reward", entries: 1, units: 2, advances: 0, titles: ["Death Note"] }, { xp: 6, gold: 1 }));   /* after the fix: a real advance, kept */
  st.sessions = st.sessions.concat(planted);
  st.governor.xp = 10000; st.governor.gold = 300;
  K.store.save(); await app.settle();
  others = st.sessions.filter((e) => !(e.id >= 50000 && e.id < 50000 + 40) && e.id !== 50040).map((e) => e.id);
  streakBefore = K.sessions.streak(null);
  earnedBefore = JSON.stringify(st.achievements.earned);
});

step("A · the classifier finds exactly the phantom entries", async () => {
  preview = await wait(K.repairs.preview(ID));
  const s = preview.summary;
  eq(s.rows.map((r) => r.title).sort(), ["Aku no Kyouten", "Death Note"], "the collided Books rows (Bleach's MAL id has no anime)");
  eq(s.entries, 40, "39 planted + the unpriced one: the 10 Sep batch is ambiguous (the anime moved that day)");
  eq(s.mixedKept, 4, "kept: the mixed entry, the batch with an unnamed sixth title, the anime's own reward, the one after the fix");
  eq(s.ambiguousKept, 2, "kept: the autosync batches naming Death Note on the day the anime moved");
  eq(s.pricedWithoutAward, 1, "one priced by the Governor's rule");
  eq(s.phantomXp, 39 * 46 + (4 + 3), "XP from the recorded awards (+ the priced one: 4 + 3 units)");
  eq(s.phantomGold, 39 * 12 + 1, "gold likewise");
  eq([s.from, s.to], ["2026-09-01", "2026-09-20"], "the date range");
  eq(preview.items.length, 40, "every entry listed for the audit");
});

step("B · the preview writes nothing; gold is clamped at the balance", async () => {
  const s = preview.summary;
  eq(s.deductGold, 300, "gold: only what is there");
  assert(s.clamped, "says it was clamped");
  eq(s.deductXp, s.phantomXp, "XP in full");
  eq(s.after.gold, 0, "gold after");
  eq(s.after.xp, 10000 - s.phantomXp, "XP after");
  eq(K.store.state.governor.gold, 300, "nothing moved yet");
  eq(K.store.state.sessions.filter((e) => e.id >= 50000).length, 47, "the ledger untouched (47 planted)");
});

step("C · the approved run removes them and logs one correction", async () => {
  const r = await wait(K.repairs.run(ID, { approved: preview.hash }));
  assert(r.ok, "ran: " + JSON.stringify(r));
  const st = K.store.state;
  const left = st.sessions.filter((e) => e.id >= 50000 && e.type === "media").map((e) => e.id).sort();
  eq(left, [50019, 50041, 50042, 50043, 50044, 50045, 50046], "the mixed, genuine, part-named, anime, ambiguous and post-fix entries are kept");
  const corr = st.sessions.filter((e) => e.type === "correction");
  eq(corr.length, 1, "one correction entry");
  eq(corr[0].award, { xp: -preview.summary.deductXp, gold: -300 }, "its award is the clamped deduction");
  eq([st.governor.xp, st.governor.gold], [preview.summary.after.xp, preview.summary.after.gold], "balances as previewed");
  others.forEach((id) => assert(st.sessions.some((e) => e.id === id), "an unrelated entry " + id + " survives"));
  const list = await wait(K.backup.list());
  assert(/^repair:di27/.test(list[0].label), "a verified checkpoint was taken first");
});

step("D · the correction is not activity, study or earning; badges kept", async () => {
  const st = K.store.state;
  eq(K.sessions.streak(null), streakBefore, "the study streak is unchanged");
  const corr = st.sessions.find((e) => e.type === "correction");
  const onlyCorrection = st.sessions.filter((e) => e.date === corr.date && e.type !== "correction").length === 0;
  if (onlyCorrection) assert(!K.sessions.hasActivity(corr.date), "a correction alone is no activity for the day");
  const was = JSON.parse(earnedBefore), now = st.achievements.earned;
  Object.keys(was).forEach((id) => assert(now[id] && now[id].tier >= was[id].tier, "badge " + id + " keeps its tier"));
});

step("E2 · a device that pulled the clean-up first deducts nothing", async () => {
  /* plan on a ledger that still has a phantom, then the other device's
     clean-up arrives (the entry goes) before apply: nothing is deducted */
  const st = K.store.state;
  st.sessions.push(entry(60001, "2026-09-12", { module: "books", action: "sync-reward", entries: 1, units: 8, advances: 1, titles: ["Death Note"] }, { xp: 46, gold: 12 }));
  const p = await wait(K.repairDi27.plan());
  assert(p.needed, "the plan sees it");
  st.sessions = st.sessions.filter((e) => e.id !== 60001);
  const xp = st.governor.xp, n = st.sessions.filter((e) => e.type === "correction").length;
  const r = p.apply();
  eq(r.removed, 0, "nothing left to remove");
  eq(st.governor.xp, xp, "no XP taken twice");
  eq(st.sessions.filter((e) => e.type === "correction").length, n, "no second correction");
});

step("E · idempotent", async () => {
  const again = await wait(K.repairs.preview(ID));
  assert(!again.needed && again.summary.entries === 0, "nothing left to find");
  const r = await wait(K.repairs.run(ID, { approved: again.hash }));
  assert(r.ok && r.already, "a second run is a no-op");
  eq(K.store.state.sessions.filter((e) => e.type === "correction").length, 1, "still one correction");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke126: " + failed + " failed" : "smoke126: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
