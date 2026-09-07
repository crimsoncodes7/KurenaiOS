/* Kurenai OS — smoke48.test.js
   The free-tier egress contract. Two mechanisms keep this account inside a
   free Supabase plan, and both are the kind of thing a later "tidy-up"
   removes without noticing, because nothing about them is visible in the
   UI. Run:  node tools/smoke48.test.js

   1 · A NO-OP MERGE MUST NOT RESTAMP updatedAt (mediadb).
       normalise() stamps updatedAt on every row it touches. Neither
       AniList nor VNDB offers a since-cursor, so autosync re-reads the
       WHOLE list every cycle and every row goes back through the
       bulkUpsert merge. Before the fix each cycle restamped all ~1,800
       entries, cloudsync's dirtiness check (entry.updatedAt vs
       meta.cleanLocal) saw the entire vault as edited, pushed it, and then
       pulled it all straight back as echoes — several MB every quarter
       hour, in perpetuity, for a list that had not changed. A real change
       must still restamp, or nothing would ever sync again: both
       directions are asserted here.

   2 · AN IDLE CYCLE MUST NOT DOWNLOAD THE STATE DOCUMENT (cloudsync).
       The document holds every session, every progress record and the
       whole planner, and both of its readers decide on a scalar — the
       staleness guard on __seq, the pull on updated_at. Fetching those
       two through a json-path select instead of the document turned the
       common case (nothing changed) from a full copy of the account into
       a few bytes. The guard, the genuine pull and the fail-soft
       fallback all still have to work, so all three are asserted.        */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true; window.__kosAutoConfirm = true;

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB; window.IDBKeyRange = IDBKeyRange;
window.IntersectionObserver = function () {
  const self = { targets: [], observe: t => self.targets.push(t), unobserve: noop, disconnect: noop };
  return self;
};
for (const src of [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1])) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const p = fn => new Promise((res, rej) => fn((e, o) => e ? rej(e instanceof Error ? e : new Error(e.message || String(e))) : res(o)));
const clone = o => JSON.parse(JSON.stringify(o));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const steps = [];
function step(name, fn) { steps.push([name, fn]); }

/* ============ 1 · the no-op merge ============ */

/* one AniList-shaped row, exactly as the mapper emits it — lastSyncedAt
   included, because both mappers stamp Date.now() on every single run and
   it must NOT be mistaken for a change */
function row(progress) {
  return {
    module: "anime", title: "Frieren", status: "inProgress",
    progress: { current: progress, total: 28 },
    score: 9, genres: ["Adventure", "Fantasy"], tags: [],
    externalIds: { anilistId: 154587, malId: 52991 },
    coverUrl: "https://img/frieren.jpg", syncSource: "anilist",
    lastSyncedAt: Date.now(),
    extra: { season: "FALL", seasonYear: 2023, studio: "Madhouse" }
  };
}
const only = async () => (await p(cb => KOS.mediadb.query({ module: "anime" }, cb)))[0];

let afterFirst = null, afterSecond = null;

step("a re-pull of an unchanged list leaves updatedAt alone", async () => {
  await p(cb => KOS.mediadb.open(cb));
  await p(cb => KOS.mediadb.bulkUpsert([row(12)], {}, cb));
  afterFirst = await only();
  await sleep(25);                       // Date.now() would differ if restamped
  const res = await p(cb => KOS.mediadb.bulkUpsert([row(12)], {}, cb));
  afterSecond = await only();
  assert(afterSecond.updatedAt === afterFirst.updatedAt,
    "a no-op merge restamped updatedAt — the whole vault will push every autosync cycle");
  assert(res.updated === 1 && res.added === 0,
    "the merge stopped happening altogether; only the timestamp should be held back");
});

step("a no-op merge invents no reward and damages no data", async () => {
  const res = await p(cb => KOS.mediadb.bulkUpsert([row(12)], {}, cb));
  const e = await only();
  assert((res.rewards || []).length === 0, "a no-op merge produced a reward event");
  assert(e.title === "Frieren" && e.progress.current === 12 && e.score === 9 &&
         e.externalIds.anilistId === 154587 && e.extra.studio === "Madhouse",
    "the merge damaged the row it decided not to restamp");
});

step("a real change still restamps, still rewards, still syncs", async () => {
  await sleep(25);
  const res = await p(cb => KOS.mediadb.bulkUpsert([row(13)], {}, cb));
  const e = await only();
  assert(e.updatedAt > afterSecond.updatedAt,
    "a genuine progress change did not restamp — this entry would never sync again");
  assert(e.progress.current === 13, "the change did not land");
  assert((res.rewards || []).length === 1, "new ground stopped rewarding");
});

step("a direct put() is untouched — only the merge path holds the stamp", async () => {
  const e = await only();
  const before = e.updatedAt;
  await sleep(25);
  e.notes = "rewatching";
  const saved = await p(cb => KOS.mediadb.put(e, cb));
  assert(saved.updatedAt > before, "put() stopped restamping; local edits would never sync");
});

/* ============ 2 · the state-document probe ============ */

let clock = Date.parse("2026-08-01T00:00:00Z");
const stamp = () => new Date(clock += 1000).toISOString();
const sv = { state: null, calls: { fetchState: 0, fetchStateMeta: 0 }, probeBroken: false };
const api = {
  fetchState: cb => { sv.calls.fetchState++; cb(null, sv.state ? clone(sv.state) : null); },
  /* the real column shape: updated_at plus the aliased json path ONLY —
     if the engine needs anything else from here it is reading the document */
  fetchStateMeta: cb => {
    sv.calls.fetchStateMeta++;
    if (sv.probeBroken) { cb(new Error("json path unsupported")); return; }
    cb(null, sv.state ? { updated_at: sv.state.updated_at, seq: sv.state.state_json.__seq } : null);
  },
  upsertState: (json, cb) => { sv.state = { state_json: clone(json), updated_at: stamp() }; cb(null, { updated_at: sv.state.updated_at }); },
  fetchMediaSince: (i, o, cb) => cb(null, []), upsertMedia: (r, cb) => cb(null, []),
  countMedia: cb => cb(null, 0), listMediaIds: (o, cb) => cb(null, []),
  fetchFilesSince: (i, o, cb) => cb(null, []), upsertFiles: (r, cb) => cb(null, []),
  listFileIds: (o, cb) => cb(null, []), markUploaded: (f, cb) => cb(null, [{}]),
  uploadBinary: (a, b, c, cb) => cb(null, {}), downloadBinary: (a, cb) => cb(new Error("none")),
  removeBinary: (a, cb) => cb(null)
};
const sync = () => p(cb => KOS.cloudsync.syncNow(cb));
const DOC = () => ({
  v: 1, progress: { "compsci:4.1.1.1": { status: "done", check: [true, true, true, true], note: "" } },
  sessions: Array.from({ length: 800 }, (_, i) => ({ id: "s" + i, ts: 1, date: "2026-08-08", type: "focus", dur: 60, metrics: {} })),
  governor: { hp: 60, gold: 900, xp: 5000, owned: [], theme: "" }
});

step("an idle cycle decides from the probe, never downloading the document", async () => {
  KOS.cloudsync._config({ api, session: { userId: "u1", email: "e@t" }, quiet: true,
    pushDebounce: 10 * 60 * 1000, minPullGap: 0, bootDelay: 0 });
  KOS.store.replaceState(DOC());
  await sync();
  if (!sv.state && KOS.cloudsync.linkStatus() === "localOnly") await p(cb => KOS.cloudsync.migrateUp(cb));
  assert(sv.state, "setup: the cloud copy was never established");

  sv.calls.fetchState = 0; sv.calls.fetchStateMeta = 0;
  await sync();
  assert(sv.calls.fetchState === 0,
    "an idle cycle downloaded the whole state document — the largest egress source is back");
  assert(sv.calls.fetchStateMeta >= 1, "the probe was not consulted at all");
});

step("a genuinely newer cloud copy is still downloaded and applied", async () => {
  const remote = clone(sv.state.state_json);
  remote.governor.gold = 4242;
  remote.__seq = (remote.__seq || 0) + 1;
  sv.state = { state_json: remote, updated_at: stamp() };
  sv.calls.fetchState = 0;
  await sync();
  assert(sv.calls.fetchState >= 1, "the document was never fetched, so it could not have been applied");
  assert(KOS.store.state.governor.gold === 4242, "a newer cloud copy failed to apply — the probe broke the pull");
});

step("the staleness guard still detects a fork through the probe", async () => {
  const ahead = clone(sv.state.state_json);
  ahead.governor.gold = 9999;
  ahead.__seq = (ahead.__seq || 0) + 5;
  sv.state = { state_json: ahead, updated_at: stamp() };
  KOS.store.state.governor.xp = 61234;          // a divergent local edit
  KOS.store.save();
  await sync();
  const stale = KOS.cloudsync.staleStatus();
  assert(stale, "the guard stopped seeing a stale device — the 8 Aug 2026 incident is live again");
  assert(stale.remoteSeq > stale.localSeq, "the guard reported a fork it cannot describe");
  assert(sv.state.state_json.governor.gold === 9999, "the cloud copy was overwritten while the conflict stood");
});

step("the conflict still resolves onto the document the guard captured", async () => {
  await p(cb => KOS.cloudsync.resolveStale("cloud", cb));
  assert(KOS.store.state.governor.gold === 9999, "resolveStale('cloud') did not apply the cloud copy");
  assert(!KOS.cloudsync.staleStatus(), "the conflict outlived its resolution");
});

step("a backend that refuses the json path degrades once, not every cycle", async () => {
  sv.probeBroken = true;
  sv.calls.fetchState = 0; sv.calls.fetchStateMeta = 0;
  await sync();
  const probes = sv.calls.fetchStateMeta;
  assert(sv.calls.fetchState >= 1, "a refused probe did not fall back to the full read");
  await sync();
  await sync();
  assert(sv.calls.fetchStateMeta === probes,
    "the refusal is not latched — every cycle now pays for a probe that cannot work");
});

(async () => {
  let pass = 0;
  const fails = [];
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); pass++; }
    catch (e) { fails.push(`STEP "${name}": ${e.message}`); console.log("  FAIL " + name + " — " + e.message); }
  }
  if (errors.length) fails.push(...errors);
  console.log("");
  if (fails.length) {
    console.log("SMOKE48 FAILURES (" + fails.length + "):");
    fails.forEach(f => console.log("  - " + f));
    process.exit(1);
  }
  console.log("SMOKE48 PASS — the free-tier egress contract verified (" + pass + " steps).");
  process.exit(0);
})();
