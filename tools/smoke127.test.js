/* Kurenai OS — smoke127.test.js
   Activity, not any event (quality W1; HR-31, CL-45) and the DI-27
   journal scrub on every device (decision of 9 November 2026).

     A · ONE DEFINITION: KOS.mediadb.activeEvent — a step forward from a real
         number, a finish, a start from planned; not a score, a pause, a step
         from nothing (DI-27's "volumes null → 8") or a step back.
     B · REPORTS (HR-31): a week whose only events on a title are a score
         change, a pause or a step from nothing leaves it out of the
         Collection; a progress step puts it in, with its range and minutes.
     C · RECENTLY UPDATED (CL-45): a pull that only changes metadata (tags,
         cover) leaves the order unchanged; a pull with a progress step, or
         the provider's own list stamp, moves the title to the top.
     D · THE SCRUB WAITS: before the DI-27 clean-up is approved this device's
         scrub finds nothing to do and records no receipt.
     E · THE SCRUB: after approval it removes exactly the traces on the
         collided Books row (steps from nothing, a status flip and back
         across midnight), keeps its real history, takes a verified
         checkpoint, records a DEVICE receipt (media kv, not the synced
         state) and runs once.

   Run: node tools/smoke127.test.js */
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
const T = (d, h) => Date.parse(d + "T" + String(h || 12).padStart(2, "0") + ":00:00");
const clone = (x) => JSON.parse(JSON.stringify(x));

step("boot and seed", async () => {
  app = await boot();
  K = app.KOS;
  await seedAccount(app);
  await app.settle();
});

step("A · one definition of doing something", async () => {
  const A = K.mediadb.activeEvent;
  assert(A([1, "progress", 3, 5]) && A([1, "volumes", 2, 3]) && A([1, "hours", 1.5, 3]) && A([1, "route", 0, 1]), "steps forward count");
  assert(A([1, "status", "inProgress", "completed"]) && A([1, "status", "planned", "inProgress"]) && A([1, "status", null, "inProgress"]), "a finish and a start count");
  assert(!A([1, "score", 7, 9]), "a score does not");
  assert(!A([1, "status", "inProgress", "onHold"]) && !A([1, "status", "onHold", "planned"]) && !A([1, "status", "onHold", "inProgress"]), "a pause, a move to planned, a resume from a pause do not");
  assert(!A([1, "volumes", null, 8]) && !A([1, "progress", null, 12]), "a step from nothing does not (DI-27)");
  assert(!A([1, "progress", 5, 3]), "a step back does not");
});

let ids = {};
step("B · Reports count only real activity (HR-31)", async () => {
  const rows = [
    { module: "anime", title: "Scored Only", status: "inProgress", syncSource: "anilist", externalIds: { anilistId: 7001, malId: 7001 }, progress: { current: 4, total: 12 } },
    { module: "anime", title: "Watched Two", status: "inProgress", syncSource: "anilist", externalIds: { anilistId: 7002, malId: 7002 }, progress: { current: 6, total: 12 } },
    { module: "books", title: "Echo Manga", status: "onHold", syncSource: "anilist", externalIds: { anilistId: 7003, malId: 7003 }, progress: { current: 0, volumes: 8 } },
    { module: "anime", title: "Paused One", status: "onHold", syncSource: "anilist", externalIds: { anilistId: 7004, malId: 7004 }, progress: { current: 3, total: 12 } }
  ];
  await cb((c) => K.mediadb.bulkUpsert(rows, {}, c));
  const all = await cb((c) => K.mediadb.query({}, c));
  for (const r of all) ids[r.title] = r.syncId;
  await cb((c) => K.mediadb.replaceJournal(ids["Scored Only"], [[T("2026-09-22"), "score", 6, 8]], c));
  await cb((c) => K.mediadb.replaceJournal(ids["Watched Two"], [[T("2026-09-22"), "progress", 4, 6], [T("2026-09-23"), "score", 0, 8]], c));
  await cb((c) => K.mediadb.replaceJournal(ids["Echo Manga"], [[T("2026-09-21"), "volumes", null, 8], [T("2026-09-22"), "volumes", null, 8], [T("2026-09-22", 23), "status", "onHold", "planned"]], c));
  await cb((c) => K.mediadb.replaceJournal(ids["Paused One"], [[T("2026-09-23"), "status", "inProgress", "onHold"]], c));
  const rep = await wait(new Promise((res) => K.report.build(K.report.week("2026-09-24"), {}, res)));
  const titles = (rep.collection && rep.collection.titles || []).map((t) => t.title);
  assert(titles.indexOf("Watched Two") >= 0, "a progress step puts the title in: " + JSON.stringify(titles));
  ["Scored Only", "Echo Manga", "Paused One"].forEach((t) => assert(titles.indexOf(t) < 0, t + " is not in the week (only a score, a step from nothing, a pause)"));
  const w2 = rep.collection.titles.find((t) => t.title === "Watched Two");
  assert(w2.mins > 0, "its minutes are counted: " + JSON.stringify(w2));
});

step("C · Recently updated is about you (CL-45)", async () => {
  const order = async () => (await cb((c) => K.mediadb.query({ module: "anime", sort: "updated" }, c))).map((r) => r.title);
  /* a known starting order from the providers' own stamps */
  const base = [
    { module: "anime", title: "Old Show", status: "completed", syncSource: "anilist", externalIds: { anilistId: 8001, malId: 8001 }, progress: { current: 12, total: 12 }, activityAt: T("2026-01-01") },
    { module: "anime", title: "Mid Show", status: "inProgress", syncSource: "anilist", externalIds: { anilistId: 8002, malId: 8002 }, progress: { current: 5, total: 12 }, activityAt: T("2026-06-01") },
    { module: "anime", title: "New Show", status: "inProgress", syncSource: "anilist", externalIds: { anilistId: 8003, malId: 8003 }, progress: { current: 2, total: 12 }, activityAt: T("2026-09-20") }
  ];
  await cb((c) => K.mediadb.bulkUpsert(clone(base), {}, c));
  const before = (await order()).filter((t) => /Show$/.test(t));
  eq(before, ["New Show", "Mid Show", "Old Show"], "ordered by the providers' stamps");
  /* a metadata-only pull: tags reordered, a new cover — no list change */
  const meta = clone(base).map((r) => Object.assign(r, { coverUrl: "https://example.test/" + r.title + ".jpg", extra: { aniTags: ["b", "a"] } }));
  await cb((c) => K.mediadb.bulkUpsert(meta, {}, c));
  eq((await order()).filter((t) => /Show$/.test(t)), before, "metadata alone moves nothing");
  /* AniList says Old Show's entry was edited now, with a step forward */
  const step2 = clone(meta);
  step2[0].progress.current = 12; step2[0].activityAt = T("2026-09-24", 9);
  await cb((c) => K.mediadb.bulkUpsert(step2, {}, c));
  eq((await order()).filter((t) => /Show$/.test(t))[0], "Old Show", "the provider's own stamp moves it to the top");
  /* a step forward pulled with no stamp counts as now */
  const step3 = clone(step2);
  step3[1].progress.current = 6; delete step3[1].activityAt;
  await cb((c) => K.mediadb.bulkUpsert(step3, {}, c));
  eq((await order()).filter((t) => /Show$/.test(t))[0], "Mid Show", "a progress step with no stamp moves it to the top");
});

const SCRUB = "di27-journal-scrub";
let dnJournal;
step("C2 · a row from another device keeps its stamp; a newer provider stamp is sent", async () => {
  const rows = await cb((c) => K.mediadb.query({ module: "anime" }, c));
  const mid = rows.find((r) => r.title === "Mid Show");
  /* the cloud copy: a step made on another device on 3 May */
  const remote = clone(mid);
  remote.progress.current = 7;
  remote.activityAt = T("2026-05-03");
  remote.journal = (remote.journal || []).concat([[T("2026-05-03"), "progress", 6, 7]]);
  const before = mid.activityAt;
  await cb((c) => K.mediadb.put(remote, c));
  const got = (await cb((c) => K.mediadb.query({ module: "anime" }, c))).find((r) => r.syncId === mid.syncId);
  eq(got.activityAt, Math.max(before || 0, T("2026-05-03")), "the cloud row keeps the stamps it carries, not the time it arrived");
  /* a pull whose only change is a newer provider stamp restamps the row,
     so cloud sync sends it */
  const all = await cb((c) => K.mediadb.query({ module: "anime" }, c));
  const old = all.find((r) => r.title === "Old Show");
  const pull = [{ module: "anime", title: "Old Show", status: old.status, syncSource: "anilist", externalIds: { anilistId: 8001, malId: 8001 }, progress: clone(old.progress), activityAt: T("2026-09-24", 9) + 60000 }];
  await cb((c) => K.mediadb.bulkUpsert(pull, {}, c));
  const o2 = (await cb((c) => K.mediadb.query({ module: "anime" }, c))).find((r) => r.syncId === old.syncId);
  assert(o2.updatedAt !== old.updatedAt, "the row is restamped, so it syncs");
  /* a write that is not activity (a list rename) does not lift a row with no stamp */
  const local = { module: "anime", title: "Hand Made", status: "planned", syncSource: "manual", progress: { current: 0 }, createdAt: T("2026-01-02") };
  await cb((c) => K.mediadb.add(local, c));
  const hm = (await cb((c) => K.mediadb.query({ module: "anime" }, c))).find((r) => r.title === "Hand Made");
  const ord = async () => (await cb((c) => K.mediadb.query({ module: "anime", sort: "updated" }, c))).map((r) => r.title);
  const o1 = await ord();
  for (let i = 0; i < 5; i++) await app.settle();      /* time passes */
  hm.customLists = ["Renamed list"];
  await cb((c) => K.mediadb.put(hm, c));
  const o3 = await ord();
  eq(o3, o1, "a list rename is not activity: the order does not move");
  assert(o3.indexOf("Hand Made") > o3.indexOf("Old Show"), "a title made in January sorts below this week's");
});

step("D · the scrub waits for the clean-up's approval", async () => {
  /* a collided pair and the bug's traces on this device */
  await cb((c) => K.mediadb.bulkUpsert([
    { module: "books", title: "Death Note", status: "onHold", syncSource: "anilist", externalIds: { anilistId: 30021, malId: 21 }, progress: { current: 0, total: 108, volumes: 8 } },
    { module: "anime", title: "ONE PIECE", status: "planned", syncSource: "anilist", externalIds: { anilistId: 21, malId: 21 }, progress: { current: 0 } }
  ], {}, c));
  const dn = (await cb((c) => K.mediadb.query({ module: "books" }, c))).find((r) => r.title === "Death Note");
  dnJournal = [
    [T("2026-09-01"), "volumes", 7, 8],                      /* real: bought volume 8 */
    [T("2026-09-02"), "volumes", null, 8],                   /* trace */
    [T("2026-09-03"), "progress", null, 0],                  /* trace */
    [T("2026-09-04", 23), "status", "onHold", "planned"],    /* trace: a flip … */
    [T("2026-09-05", 1), "status", "planned", "onHold"],     /* … and back after midnight */
    [T("2026-09-10"), "status", "inProgress", "onHold"],     /* real: paused */
    [T("2026-09-11"), "volumes", null, 8]                    /* trace */
  ];
  await cb((c) => K.mediadb.replaceJournal(dn.syncId, dnJournal, c));
  ids.dn = dn.syncId;
  const r = await wait(K.repairs.run(SCRUB));
  assert(r.ok && r.noop, "nothing to do before approval: " + JSON.stringify(r));
  eq(await wait(K.repairs.receiptOf(SCRUB)), null, "no receipt, so it runs once approval arrives");
  /* a no-op receipt of the clean-up is not an approval */
  K.store.state.repairs["di27-phantom-sync"] = { at: Date.now(), noop: true };
  const r2 = await wait(K.repairs.run(SCRUB));
  assert(r2.ok && r2.noop, "a no-op receipt does not start the scrub");
  delete K.store.state.repairs["di27-phantom-sync"];
  const now = (await cb((c) => K.mediadb.query({ module: "books" }, c))).find((x) => x.syncId === ids.dn);
  eq(now.journal.length, 7, "the journal is untouched");
});

step("E · after approval: exactly the traces go; again only if they come back", async () => {
  /* the approval: the clean-up's receipt (synced) — here as the run leaves it */
  K.store.state.repairs["di27-phantom-sync"] = { at: Date.now(), hash: "approved-in-test" };
  const nb = (await wait(K.backup.list())).length;
  const pv = await wait(K.repairs.preview(SCRUB));
  eq(pv.summary, { rows: 1, events: 5 }, "five traces on one row");
  const r = await wait(K.repairs.runAuto());
  assert(r[SCRUB] && r[SCRUB].ok && !r[SCRUB].noop, "the auto run scrubbed: " + JSON.stringify(r[SCRUB]));
  const now = (await cb((c) => K.mediadb.query({ module: "books" }, c))).find((x) => x.syncId === ids.dn);
  eq(now.journal.map((e) => e[1] + ":" + e[2] + "→" + e[3]), ["volumes:7→8", "status:inProgress→onHold"], "its real history is kept");
  eq((await wait(K.backup.list())).length, nb + 1, "a verified checkpoint first");
  assert(!K.store.state.repairs[SCRUB], "nothing in the synced state");
  const again = await wait(K.repairs.run(SCRUB));
  assert(again.ok && again.noop, "a second start finds nothing to do (no checkpoint)");
  eq((await wait(K.backup.list())).length, nb + 1, "no second checkpoint");
  /* a device still on the old journal sends the traces back (the cloud
     union): the next start tidies them again */
  await cb((c) => K.mediadb.replaceJournal(ids.dn, (rec) => rec.journal.concat([[T("2026-09-12"), "volumes", null, 8]]), c));
  const back = await wait(K.repairs.run(SCRUB));
  assert(back.ok && !back.noop, "traces that came back are tidied again");
  const after = (await cb((c) => K.mediadb.query({ module: "books" }, c))).find((x) => x.syncId === ids.dn);
  eq(after.journal.length, 2, "only the real history");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke127: " + failed + " failed" : "smoke127: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
