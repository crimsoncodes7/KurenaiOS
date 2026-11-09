/* Kurenai OS — smoke129.test.js
   The one-off rebuild of saved reports after the DI-27 clean-up (quality
   W1, decision B1; HR-02, HR-31; js/core/repair-reports.js), on test data.

     A · WAITS: before the clean-up has run there is nothing to rebuild.
     B · EXACT PAY: after the clean-up, each saved week's "earned" loses
         exactly the phantom pay inside it (from the clean-up's checkpoint,
         by its audit ids), and each snapshot's balance loses the phantom pay
         earned before it was taken; level re-read from the corrected
         snapshots.
     C · THE COLLECTION: a title a saved report listed only because of the
         bug's echo is removed; a real one stays; the stories are re-derived.
     D · FROZEN EMPTY: a saved week with nothing in it, whose build now has
         content, takes the fresh facts.
     E · SURGICAL: a report's study facts are left exactly as saved, even
         where the ledger no longer reaches them.
     F · CONSENT, CHECKPOINT, ONCE: it runs only with the approved hash,
         after a verified checkpoint; a second preview finds nothing.
     G · THE MERGE: a rebuilt report (higher factsRev) wins over an older
         copy of the same report, and an unrebuilt item's sync stamp is
         unchanged.

   Run: node tools/smoke129.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, RS;
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 4000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const cb = (fn) => wait(new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v))));
const ID = "reports-rebuild-di27";
const PH = { xp: 46, gold: 12 };          /* units 36, advances 2: the Governor's price */
let saved = {}, snaps0 = {}, weekA, weekB, weekEmpty;

step("boot, seed, plant the bug, and save reports while it is there", async () => {
  app = await boot({ clock: "2026-10-20T10:00:00" });
  K = app.KOS; RS = K.reportStore;
  await seedAccount(app);
  await app.settle();
  await cb((c) => K.mediadb.bulkUpsert([
    { module: "books", title: "Death Note", status: "onHold", syncSource: "anilist", externalIds: { anilistId: 30021, malId: 21 }, progress: { current: 0, volumes: 8 } },
    { module: "anime", title: "ONE PIECE", status: "planned", syncSource: "anilist", externalIds: { anilistId: 21, malId: 21 }, progress: { current: 0 } },
    { module: "anime", title: "Real Show", status: "inProgress", syncSource: "anilist", externalIds: { anilistId: 9101, malId: 9101 }, progress: { current: 4, total: 12 } }
  ], {}, c));
  const rows = await cb((c) => K.mediadb.query({}, c));
  const real = rows.find((r) => r.title === "Real Show");
  /* a real episode in the week of 5 Oct, so that week's Collection is real */
  await cb((c) => K.mediadb.replaceJournal(real.syncId, [[Date.parse("2026-10-07T20:00:00"), "progress", 3, 4]], c));
  /* phantom rewards: 3 a day, 1–18 Oct (with their recorded awards) */
  const st = K.store.state;
  let id = 70000;
  for (let d = 1; d <= 18; d++) {
    const date = "2026-10-" + String(d).padStart(2, "0");
    for (let k = 0; k < 3; k++) st.sessions.push({ id: id++, ts: Date.parse(date + "T0" + (k + 1) + ":00:00"), date, type: "media", subject: null, ref: null, dur: null,
      metrics: { module: "books", action: "sync-reward", entries: 1, units: 36, advances: 2, titles: ["Death Note"] }, award: { xp: 46, gold: 12 } });
  }
  st.governor.xp += 54 * PH.xp; st.governor.gold += 54 * PH.gold;
  /* every entry carries its recorded award, as entries since Reports do, so a
     week has an "earned" figure to correct */
  st.sessions.forEach((e) => { if (!e.award) e.award = { xp: 10, gold: 1 }; });
  K.store.save(); await app.settle();
  /* snapshots and saved reports, polluted as the live account's were */
  for (const d of ["2026-10-05", "2026-10-12", "2026-10-19"]) {
    const sn = await wait(new Promise((res) => RS.buildSnapshot(d, res)));
    sn.takenAt = Date.parse(d + "T08:00:00");
    await cb((c) => RS.putSnapshot(sn, c));
  }
  await cb((c) => RS.ensureReports(c, Date.parse("2026-10-20T10:00:00")));
  const reps = await cb((c) => RS.list("week", c));
  weekA = reps.find((r) => r.start === "2026-10-05");
  weekB = reps.find((r) => r.start === "2026-10-12");
  assert(weekA && weekB, "saved weeks of 5 and 12 Oct");
  /* the echo the old reader counted: Death Note in week B's Collection */
  weekB.facts.collection = weekB.facts.collection || { count: 0, titles: [] };
  weekB.facts.collection.titles.push({ title: "Death Note", module: "books", status: "continued", mins: 360 });
  weekB.facts.collection.count = weekB.facts.collection.titles.length;
  await cb((c) => RS.putReport(weekB, c));
  /* a week frozen empty (HR-02): 28 Sep, saved before anything arrived */
  weekEmpty = { id: "week:2026-09-28", period: "week", start: "2026-09-28", end: "2026-10-04", savedAt: Date.parse("2026-10-05T07:00:00"),
    facts: { period: "week", study: { mins: 0, reviews: 0, touched: 0, topics: [] }, focus: { blocks: 0, byDay: [] }, gov: {} }, words: { mode: "template" } };
  await cb((c) => RS.putReport(weekEmpty, c));
  const all = await cb((c) => RS.list(null, c));
  all.forEach((r) => { saved[r.id] = JSON.parse(JSON.stringify(r)); });
  (await cb((c) => RS.snapshots(c))).forEach((s) => { snaps0[s.id] = JSON.parse(JSON.stringify(s)); });
  /* a real session on 30 Sep the empty week can now find */
  st.sessions.push({ id: 69000, ts: Date.parse("2026-09-30T18:00:00"), date: "2026-09-30", type: "flashcards", subject: "compsci", ref: "4.1.1.1", dur: 600, metrics: { cards: 12 }, award: { xp: 27, gold: 3 } });
  K.store.save(); await app.settle();
});

step("A · nothing to rebuild before the clean-up has run", async () => {
  const pv = await wait(K.repairs.preview(ID));
  assert(!pv.needed && /has not run/.test(pv.summary.waiting), "waits: " + JSON.stringify(pv.summary));
});

let pv;
step("B · after the clean-up: exact pay out of each week and snapshot", async () => {
  const cp = await wait(K.repairs.preview("di27-phantom-sync"));
  eq(cp.summary.entries, 54, "the clean-up finds the 54");
  const r = await wait(K.repairs.run("di27-phantom-sync", { approved: cp.hash }));
  assert(r.ok, "clean-up ran: " + JSON.stringify(r));
  pv = await wait(K.repairs.preview(ID));
  assert(pv.needed, "now there is a rebuild: " + JSON.stringify(pv.summary));
  eq(pv.summary.phantomEntries, 54, "priced from the checkpoint, by the audit ids");
  const wa = pv.items.find((x) => x.id === weekA.id);
  assert(wa && wa.earned, "week A corrected: " + JSON.stringify(wa) + " saved gov " + JSON.stringify(saved[weekA.id].facts.gov));
  /* week of 5 Oct holds 5–11 Oct: 7 days × 3 */
  eq(wa.earned.after[0], wa.earned.before[0] - 21 * PH.xp, "week A's XP loses exactly its 21 phantom rewards");
  eq(wa.earned.after[1], wa.earned.before[1] - 21 * PH.gold, "and its gold");
  const s12 = pv.items.find((x) => x.snapshot === "2026-10-12");
  /* taken 12 Oct 08:00: every phantom from 1–11 Oct (33) and 12 Oct's three (01–03:00) */
  eq(s12.xp[1], s12.xp[0] - 36 * PH.xp, "the 12 Oct snapshot loses the 36 earned before it was taken");
});

step("H · review fixes: saved-after items left alone, a gone row's real title kept, rest corrected", async () => {
  /* a report and a snapshot saved AFTER the clean-up already exclude the
     phantoms: they must not be corrected again */
  const after = JSON.parse(JSON.stringify(saved[weekB.id]));
  after.id = "week:test-saved-after"; after.savedAt = Date.now() + 60000;
  await cb((c) => RS.putReport(after, c));
  const sn = JSON.parse(JSON.stringify(snaps0["2026-10-19"]));
  sn.id = "2026-10-26"; sn.boundary = "2026-10-26"; sn.takenAt = Date.now() + 60000;
  await cb((c) => RS.putSnapshot(sn, c));
  /* a real title whose row has since left the vault (the AniList mirror
     removed it): its saved history must stay */
  const real = (await cb((c) => K.mediadb.query({}, c))).find((r) => r.title === "Real Show");
  await cb((c) => K.mediadb.remove(real.id, c));
  pv = await wait(K.repairs.preview(ID));
  assert(!pv.items.some((x) => x.id === "week:test-saved-after"), "a report saved after the clean-up is left alone");
  assert(!pv.items.some((x) => x.snapshot === "2026-10-26"), "a snapshot taken after it too");
  eq(pv.summary.leftAlone.savedAfter, 1, "and counted");
  const wa = pv.items.find((x) => x.id === weekA.id);
  assert(!wa.collection || wa.collection.removed.indexOf("Real Show") < 0, "Real Show stays though its row is gone: " + JSON.stringify(wa.collection));
  const wb = pv.items.find((x) => x.id === weekB.id);
  assert(wb.rest && wb.rest.after < wb.rest.before, "week B's rest streak loses the phantom days: " + JSON.stringify(wb.rest || null) + " saved " + saved[weekB.id].facts.gov.rest);
});

step("C · a title listed only by the echo leaves the Collection; real ones stay", async () => {
  const wb = pv.items.find((x) => x.id === weekB.id);
  assert(wb.collection && wb.collection.removed.indexOf("Death Note") >= 0, "Death Note removed: " + JSON.stringify(wb.collection));
  const wa = pv.items.find((x) => x.id === weekA.id);
  assert(!wa.collection || wa.collection.removed.indexOf("Real Show") < 0, "Real Show stays in week A");
});

step("D · a week frozen empty takes the fresh facts", async () => {
  const we = pv.items.find((x) => x.id === weekEmpty.id);
  assert(we && we.emptyRebuilt, "the empty week is rebuilt: " + JSON.stringify(we));
});

step("F · runs with the approved hash, after a verified checkpoint, once", async () => {
  const nb = (await wait(K.backup.list())).length;
  const r = await wait(K.repairs.run(ID, { approved: pv.hash }));
  assert(r.ok, "ran: " + JSON.stringify(r));
  eq((await wait(K.backup.list())).length, nb + 1, "a verified checkpoint first");
  const again = await wait(K.repairs.preview(ID));
  assert(!again.needed, "nothing left: " + JSON.stringify(again.summary));
  const a = await cb((c) => RS.getReport(weekA.id, c));
  eq(a.factsRev, 1, "factsRev raised");
  assert(a.fix && a.fix.di27, "marked");
  const b = await cb((c) => RS.getReport(weekB.id, c));
  assert(!b.facts.collection || !b.facts.collection.titles.some((t) => t.title === "Death Note"), "Death Note gone from week B");
  assert(Array.isArray(b.facts.stories), "stories re-derived");
  const e = await cb((c) => RS.getReport(weekEmpty.id, c));
  assert(K.reportStore.hasContent(e.facts), "the empty week now has its study");
  const orig = await cb((c) => K.mediadb.getKV("repair.originals." + ID, c));
  assert(orig && orig.reports.length === r.value.reports && orig.snapshots.length === r.value.snapshots, "every original kept before writing");
  assert(orig.reports.some((x) => x.id === weekA.id && JSON.stringify(x.facts) === JSON.stringify(saved[weekA.id].facts)), "week A's original as saved");
  const kept = await cb((c) => RS.getReport(weekA.id, c));
  assert(kept.facts.collection && kept.facts.collection.titles.some((t) => t.title === "Real Show"), "Real Show still in week A");
  const rc = K.repairs.receipt("di27-phantom-sync");
  for (let i = 0; i < 6; i++) await wait(K.backup.checkpoint("filler " + i));
  assert((await wait(K.backup.list())).some((b) => b.id === rc.checkpoint), "the clean-up's checkpoint is pinned through rotation");
  const s = await cb((c) => RS.getSnapshot("2026-10-12", c));
  eq([s.rev, s.gov.xp], [1, snaps0["2026-10-12"].gov.xp - 36 * PH.xp], "the snapshot corrected, rev 1");
});

step("E · surgical: study facts stay exactly as saved", async () => {
  const a = await cb((c) => RS.getReport(weekA.id, c));
  eq(JSON.stringify(a.facts.study), JSON.stringify(saved[weekA.id].facts.study), "week A's study facts untouched");
  eq(JSON.stringify(a.facts.focus), JSON.stringify(saved[weekA.id].facts.focus), "and its focus");
});

step("G · the merge keeps the rebuild", async () => {
  const a = await cb((c) => RS.getReport(weekA.id, c));
  const older = saved[weekA.id];                     /* another device's copy, saved earlier */
  older.savedAt = a.savedAt - 1000;
  const m1 = RS.mergeReport(older, a), m2 = RS.mergeReport(a, older);
  eq([m1.factsRev, m2.factsRev], [1, 1], "the rebuilt copy wins either way round");
  eq(m1.facts.gov.xp, a.facts.gov.xp, "with its corrected pay");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke129: " + failed + " failed" : "smoke129: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
