/* Kurenai OS — smoke41.test.js
   The cloud staleness guard (Category 7, the P0 that followed Phase A).

   THE INCIDENT THIS EXISTS FOR — 8 August 2026. A phone that had not been
   opened for weeks was launched. Its local state document was a stale
   snapshot; the laptop's was level 53 with 12,476 gold, 1,664 sessions, a
   chosen avatar and banner, and a populated Budget Planner. Under
   whole-document last-write-wins the phone's copy won, and every one of
   those was replaced by the older values. Nothing was corrupted — the
   newer document was simply outvoted.

   Phase A closed the TRIGGER (a page view no longer marks the document
   dirty, so merely opening the app cannot push). It did not close the
   CLASS: one genuine edit on the stale device still clobbered everything.

   The guard added here answers a narrower question than a merge would:
   is the document we are about to upload a DESCENDANT of the one already
   in the cloud, or a fork of an older ancestor? Every push stamps a
   monotonic __seq; a pull records the seq it received. A device whose seq
   is behind the cloud's refuses to push and raises a conflict instead.

   This is NOT field-level merging — invariant #33 still holds. It is a
   refusal to overwrite, plus an explicit two-way resolution.

   TESTED PROPERTIES:
   1.  A push stamps a monotonic __seq; a pull adopts it.
   2.  THE INCIDENT, as a regression test: a stale device with one real
       edit does NOT overwrite a newer, richer cloud copy.
   3.  The refusal is not an error — it raises staleStatus() and the
       status chip says action is needed, with nothing overwritten.
   4.  resolveStale("cloud") takes the cloud copy and clears the conflict.
   5.  resolveStale("device") forces this device's copy over the cloud and
       lands AFTER it in the sequence (so the other device sees it).
   6.  The ordinary two-device round trip is unaffected: pull, edit, push
       never raises a conflict.
   7.  Explicit user decisions still overwrite: a restore re-baseline
       pushes even when this device is behind.
   8.  __seq never leaks into app state (it would feed the dirty hash).

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke41.test.js                                            */
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
window.fetch = () => Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
  json: () => Promise.resolve({}), text: () => Promise.resolve("") });
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB; window.IDBKeyRange = IDBKeyRange;
window.IntersectionObserver = function (cb, opts) {
  const self = { cb, opts: opts || {}, targets: [], observe: t => self.targets.push(t), unobserve: noop, disconnect: noop };
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

/* ---------------- the mocked Supabase boundary ---------------- */
let clock = Date.parse("2026-08-01T00:00:00Z");
const sv = { state: null, calls: { upsertState: 0, fetchState: 0 } };
const stamp = () => new Date(clock += 1000).toISOString();
const api = {
  fetchState: cb => { sv.calls.fetchState++; cb(null, sv.state ? clone(sv.state) : null); },
  upsertState: (json, cb) => { sv.calls.upsertState++; sv.state = { state_json: clone(json), updated_at: stamp() }; cb(null, { updated_at: sv.state.updated_at }); },
  fetchMediaSince: (i, o, cb) => cb(null, []), upsertMedia: (r, cb) => cb(null, []),
  countMedia: cb => cb(null, 0), listMediaIds: (o, cb) => cb(null, []),
  fetchFilesSince: (i, o, cb) => cb(null, []), upsertFiles: (r, cb) => cb(null, []),
  listFileIds: (o, cb) => cb(null, []), markUploaded: (f, cb) => cb(null, [{}]),
  uploadBinary: (a, b, c, cb) => cb(null, {}), downloadBinary: (a, cb) => cb(new Error("none")),
  removeBinary: (a, cb) => cb(null)
};
KOS.cloudsync._config({ api, session: { userId: "u1", email: "e@t" }, quiet: true,
  pushDebounce: 10 * 60 * 1000, minPullGap: 0, bootDelay: 0 });
const sync = () => p(cb => KOS.cloudsync.syncNow(cb));

/* the two documents, modelled on the real incident */
const RICH = () => ({
  v: 1, progress: { "compsci:4.1.1.1": { status: "done", check: [true, true, true, true], note: "" } },
  sessions: Array.from({ length: 1664 }, (_, i) => ({ id: "s" + i, ts: 1, date: "2026-08-08", type: "media", dur: 60, metrics: {} })),
  governor: { hp: 1, gold: 12476, xp: 72312, owned: ["theme-celestial-duality"], theme: "celestial-duality",
    avatar: { kind: "img", id: "a", img: "LAPTOP-AVATAR", crop: null, frame: "f4" }, banner: "LAPTOP-BANNER" },
  wishlist: { nextId: 9, budget: { monthlyLimit: 60, currency: "GBP", history: [] },
    items: [{ id: 1, module: "books", title: "planned purchase" }] }
});
const STALE = () => ({
  v: 1, progress: {},
  sessions: Array.from({ length: 400 }, (_, i) => ({ id: "old" + i, ts: 1, date: "2026-07-22", type: "focus", dur: 60, metrics: {} })),
  governor: { hp: 60, gold: 3000, xp: 20000, owned: [], theme: "",
    avatar: { kind: "none", id: "", img: "", crop: null, frame: "" }, banner: "" },
  wishlist: { nextId: 1, budget: { monthlyLimit: 0, currency: "GBP", history: [] }, items: [] }
});
const cloudDoc = () => sv.state && sv.state.state_json;
const gold = () => cloudDoc().governor.gold;

/* Put this device in the position of the laptop: rich state, in the cloud,
   in step. Returns the document the cloud now holds. */
async function beLaptop() {
  /* steps share one engine — start from a settled state */
  if (KOS.cloudsync.staleStatus()) await p(cb => KOS.cloudsync.resolveStale("device", cb));
  KOS.store.replaceState(RICH());
  await sync();
  if (!sv.state && KOS.cloudsync.linkStatus() === "localOnly") await p(cb => KOS.cloudsync.migrateUp(cb));
  assert(sv.state, "setup: the laptop never established the cloud copy");
  return clone(sv.state.state_json);
}
/* Put this device in the position of the dormant phone: a stale document
   whose sync sequence sits BEHIND the cloud's, because the other device
   kept writing while this one was closed.

   Modelled without touching the engine's meta: this device legitimately
   pushes its own (stale) document, and the other device is then shown to
   have written several times afterwards — which is precisely what "our
   copy descends from an older ancestor" means. */
async function bePhone(laptopDoc) {
  KOS.store.replaceState(STALE());
  await sync();                                   // this device's own baseline
  assert(gold() === 3000, "setup: the phone's baseline did not push");
  const ahead = clone(laptopDoc);
  ahead.__seq = (+cloudDoc().__seq || 0) + 4;     // the laptop kept working
  sv.state = { state_json: ahead, updated_at: stamp() };
  KOS.store.replaceState(STALE());                // reopened, still stale
}

const steps = [];
function step(name, fn) { steps.push([name, fn]); }

/* ============ 1 · the sequence ============ */
step("a push stamps a monotonic __seq", async () => {
  await beLaptop();
  const first = cloudDoc().__seq;
  assert(typeof first === "number" && first >= 1, "no __seq on the pushed document: " + first);
  KOS.store.state.progress["compsci:bump"] = { status: "started", check: [false, false, false, false], note: "" };
  KOS.store.save();
  await sync();
  assert(cloudDoc().__seq > first, "__seq did not advance: " + first + " -> " + cloudDoc().__seq);
});

step("__seq never leaks into app state", async () => {
  await beLaptop();
  const row = { state_json: Object.assign(clone(cloudDoc()), { __seq: 99 }), updated_at: stamp() };
  row.state_json.governor.gold = 999;
  sv.state = row;
  await sync();
  assert(!("__seq" in KOS.store.state), "__seq landed in app state — it would feed the dirty hash");
});

/* ============ 2 · the incident, as a regression test ============ */
step("THE INCIDENT: a stale device with one real edit does not clobber a newer cloud copy", async () => {
  const laptop = await beLaptop();
  await bePhone(laptop);

  KOS.store.state.progress["compsci:one-real-edit"] = { status: "started", check: [false, false, false, false], note: "" };
  KOS.store.save();
  await sync();

  assert(gold() === 12476, "the laptop's gold was overwritten: 12476 -> " + gold());
  assert(cloudDoc().sessions.length === 1664, "the session ledger was truncated to " + cloudDoc().sessions.length);
  assert(cloudDoc().governor.avatar.img === "LAPTOP-AVATAR", "the avatar was lost");
  assert(cloudDoc().governor.banner === "LAPTOP-BANNER", "the banner was lost");
  assert(cloudDoc().wishlist.items.length === 1, "the Budget Planner was emptied");
});

step("the refusal raises a conflict rather than an error, and overwrites nothing", async () => {
  const st = KOS.cloudsync.staleStatus();
  assert(st, "no staleStatus() after a refused push");
  assert(st.remoteSeq > st.localSeq, "staleStatus is not actually behind: " + JSON.stringify(st));
  let seen = null;
  KOS.cloudsync.onStatus(st => { seen = st; });
  assert(seen && seen.state === "attention",
    "expected an attention status, got " + (seen && seen.state));
  assert(/behind the cloud/.test(seen.detail), "unhelpful conflict message: " + seen.detail);
  assert(gold() === 12476, "the cloud changed while a conflict was pending");
});

/* ============ 3 · the two resolutions ============ */
step('resolveStale("cloud") takes the cloud copy and clears the conflict', async () => {
  const laptop = await beLaptop();
  await bePhone(laptop);
  KOS.store.state.progress["compsci:doomed-edit"] = { status: "started", check: [false, false, false, false], note: "" };
  KOS.store.save();
  await sync();
  assert(KOS.cloudsync.staleStatus(), "setup: no conflict was raised");

  await p(cb => KOS.cloudsync.resolveStale("cloud", cb));
  assert(!KOS.cloudsync.staleStatus(), "the conflict survived resolution");
  assert(KOS.store.state.governor.gold === 12476,
    "the cloud copy was not adopted locally: " + KOS.store.state.governor.gold);
  assert(!KOS.store.state.progress["compsci:doomed-edit"], "the discarded local edit survived");
  assert(gold() === 12476, "the cloud copy changed");
});

step('resolveStale("device") forces this device over the cloud, landing after it', async () => {
  const laptop = await beLaptop();
  const laptopSeq = laptop.__seq;
  await bePhone(laptop);
  KOS.store.state.progress["compsci:insisted"] = { status: "started", check: [false, false, false, false], note: "" };
  KOS.store.save();
  await sync();
  assert(KOS.cloudsync.staleStatus(), "setup: no conflict was raised");

  await p(cb => KOS.cloudsync.resolveStale("device", cb));
  assert(!KOS.cloudsync.staleStatus(), "the conflict survived resolution");
  assert(gold() === 3000, "the forced push did not land: cloud gold is " + gold());
  assert(cloudDoc().progress["compsci:insisted"], "the insisted-on edit did not reach the cloud");
  assert(cloudDoc().__seq > laptopSeq,
    "the forced document did not land after the laptop's (" + cloudDoc().__seq + " vs " + laptopSeq + ")");
});

/* ============ 4 · the guard does not cry wolf ============ */
step("the ordinary two-device round trip raises no conflict", async () => {
  await beLaptop();
  /* the other device writes, we pull it, we edit, we push — the everyday case.
     Pulling first is what keeps us in step, which is exactly the discipline
     the guard is there to enforce. */
  for (let round = 0; round < 3; round++) {
    const remote = clone(cloudDoc());
    remote.governor.gold += 10;
    remote.__seq = remote.__seq + 1;
    sv.state = { state_json: remote, updated_at: stamp() };
    await sync();                                   // pull the other device's write
    assert(!KOS.cloudsync.staleStatus(), "a plain pull raised a conflict on round " + round);
    assert(KOS.store.state.governor.gold === remote.governor.gold,
      "round " + round + ": the other device's write was not adopted");
    KOS.store.state.progress["compsci:round" + round] = { status: "started", check: [false, false, false, false], note: "" };
    KOS.store.save();
    await sync();                                   // our own edit goes up
    assert(!KOS.cloudsync.staleStatus(), "an in-step push raised a conflict on round " + round);
    assert(cloudDoc().progress["compsci:round" + round], "the in-step push did not land on round " + round);
  }
});

step("an explicit restore re-baseline still overwrites a newer cloud copy", async () => {
  const laptop = await beLaptop();
  await bePhone(laptop);
  /* a restore is the user saying "this backup is the truth for this account" */
  KOS.store.state.progress["compsci:from-backup"] = { status: "done", check: [true, true, true, true], note: "" };
  KOS.store.save();
  await p(cb => { KOS.cloudsync.noteRestore(); setTimeout(() => cb(null), 0); });
  await sync();
  assert(!KOS.cloudsync.staleStatus(), "a restore was blocked by the staleness guard");
  assert(cloudDoc().progress["compsci:from-backup"], "the restored document did not reach the cloud");
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
    console.log("SMOKE41 FAILURES (" + fails.length + "):");
    fails.forEach(f => console.log("  - " + f));
    process.exit(1);
  }
  console.log("SMOKE41 PASS — the cloud staleness guard verified (" + pass + " steps).");
  process.exit(0);
})();
