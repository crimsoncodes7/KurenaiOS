/* Kurenai OS — smoke17.test.js
   Build 4a cloud-sync suite. The Supabase boundary is mocked (an in-memory
   server behind the cloudsync api seam — server-generated timestamps, row
   maps, a storage bucket); everything else is the real engine over the real
   fake-indexeddb stores.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke17.test.js

   TESTED PROPERTIES:
   1.  mediadb v8: normalise mints a syncId, preserves an existing one; a
       bulkUpsert merge keeps the STORED row's syncId (cloud identity is
       never re-minted by a sync).
   2.  Deletion tombstones: remove() queues; skipTombstone doesn't; backups
       exclude every cloudsync.* kv key.
   3.  First link, empty/empty: links silently and pushes state.
   4.  Push: a new local entry uploads; an unchanged vault uploads NOTHING
       (echo-free by construction, not by luck).
   5.  Pull: a genuinely newer remote row applies locally, without a
       reward/session side effect, and does NOT push back afterwards.
   6.  Remote tombstone: deletes locally without re-queueing a tombstone.
   7.  Local delete: pushes a tombstone, drains the queue, remote row
       flagged deleted.
   8.  Empty-remote-state guard: a newer-but-empty remote state NEVER
       replaces meaningful local state; the next cycle overwrites remote.
   9.  State LWW: a newer meaningful remote state applies locally.
   10. First link, localOnly: nothing uploads until migrateUp confirms;
       migration is idempotent (second cycle uploads nothing new).
   11. First link, remoteOnly: local empty device adopts the account.
   12. First link, both: media merges per entry (external-id match adopts
       the remote syncId — ONE row, not two; newer copy wins) and the
       "keep this device" state choice pushes local state over remote.
   13. Attachments: metadata pushes automatically; binaries upload ONLY via
       uploadBinaries; a second run uploads zero (no duplicates); deleting
       locally tombstones the row and removes the storage object.
   14. downloadFile: a cloud-only record gains its blob.
   15. noteRestore: a restore re-baselines — remote rows missing from the
       restored vault are tombstoned, local rows re-push.                  */

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
window.fetch = () => Promise.resolve({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("") });

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();   // no background timers; cycles run by hand

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(String(err))) : res(out))); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }

/* ---------------- the mock Supabase boundary ---------------- */
function makeServer(startMs) {
  return {
    clock: startMs || Date.parse("2026-07-16T00:00:00Z"),
    state: null,            // {state_json, updated_at}
    media: new Map(),       // entry_id → row
    files: new Map(),       // file_id → row
    storage: new Map(),     // path → blob
    calls: { upsertState: 0, upsertMedia: 0, upsertFiles: 0, uploadBinary: 0 }
  };
}
function makeApi(sv) {
  const clone = o => JSON.parse(JSON.stringify(o));
  const stamp = () => new Date(sv.clock += 1000).toISOString();
  const since = (map, iso) => [...map.values()]
    .filter(r => !iso || Date.parse(r.updated_at) > Date.parse(iso))
    .sort((a, b) => Date.parse(a.updated_at) - Date.parse(b.updated_at));
  sv.stamp = stamp;
  return {
    fetchState: cb => cb(null, sv.state ? clone(sv.state) : null),
    upsertState: (json, cb) => {
      sv.calls.upsertState++;
      sv.state = { state_json: clone(json), updated_at: stamp() };
      cb(null, { updated_at: sv.state.updated_at });
    },
    fetchMediaSince: (iso, offset, cb) => cb(null, since(sv.media, iso).slice(offset, offset + 500).map(clone)),
    upsertMedia: (rows, cb) => {
      sv.calls.upsertMedia++;
      cb(null, rows.map(r => {
        const rec = Object.assign(clone(r), { updated_at: stamp() });
        sv.media.set(r.entry_id, rec);
        return { entry_id: r.entry_id, updated_at: rec.updated_at };
      }));
    },
    countMedia: cb => cb(null, [...sv.media.values()].filter(r => !r.deleted).length),
    listMediaIds: (offset, cb) => cb(null, [...sv.media.values()].filter(r => !r.deleted).slice(offset, offset + 1000).map(r => ({ entry_id: r.entry_id }))),
    fetchFilesSince: (iso, offset, cb) => cb(null, since(sv.files, iso).slice(offset, offset + 500).map(clone)),
    upsertFiles: (rows, cb) => {
      sv.calls.upsertFiles++;
      cb(null, rows.map(r => {
        const prev = sv.files.get(r.file_id);
        const rec = Object.assign(clone(r), {
          binary_uploaded: prev ? !!prev.binary_uploaded : false,
          updated_at: stamp()
        });
        sv.files.set(r.file_id, rec);
        return { file_id: r.file_id, updated_at: rec.updated_at };
      }));
    },
    listFileIds: (offset, cb) => cb(null, [...sv.files.values()].filter(r => !r.deleted).slice(offset, offset + 1000).map(r => ({ file_id: r.file_id }))),
    markUploaded: (fileId, cb) => {
      const r = sv.files.get(fileId);
      if (r) { r.binary_uploaded = true; r.updated_at = stamp(); }
      cb(null, [{ updated_at: r ? r.updated_at : null }]);
    },
    uploadBinary: (p2, blob, mime, cb) => { sv.calls.uploadBinary++; sv.storage.set(p2, blob); cb(null, {}); },
    downloadBinary: (p2, cb) => sv.storage.has(p2) ? cb(null, sv.storage.get(p2)) : cb(new Error("object not found")),
    removeBinary: (paths, cb) => { paths.forEach(x => sv.storage.delete(x)); cb(null); }
  };
}

let server = makeServer();
KOS.cloudsync._config({
  api: makeApi(server),
  session: { userId: "user-1", email: "one@test" },
  quiet: true,
  pushDebounce: 10 * 60 * 1000,   // debounced cycles never fire — syncNow only
  minPullGap: 0,
  bootDelay: 0
});

async function clearVault() {
  const all = await p(cb => KOS.mediadb.query({}, cb));
  for (const e of all) await p(cb => KOS.mediadb.remove(e.id, cb, { skipTombstone: true }));
  await p(cb => KOS.mediadb.setKV("cloudsync.pendingDeletes", [], cb));
}
const sync = () => p(cb => KOS.cloudsync.syncNow(cb));

/* ============ 1 · schema: syncId ============ */
console.log("== v8 schema: syncId ==");

step("normalise mints a syncId and preserves an existing one; put round-trips it", async () => {
  const fresh = KOS.mediadb.normalise({ module: "anime", title: "A" });
  assert(typeof fresh.syncId === "string" && fresh.syncId.length >= 8, "no syncId minted");
  const kept = KOS.mediadb.normalise({ module: "anime", title: "A", syncId: "keep-me" });
  assert(kept.syncId === "keep-me", "existing syncId not preserved");
  const rec = await p(cb => KOS.mediadb.add({ module: "anime", title: "Round Trip", syncId: "rt-1" }, cb));
  rec.title = "Round Trip 2";
  await p(cb => KOS.mediadb.put(rec, cb));
  const back = await p(cb => KOS.mediadb.get(rec.id, cb));
  assert(back.syncId === "rt-1", "syncId lost through put: " + back.syncId);
  await p(cb => KOS.mediadb.remove(rec.id, cb, { skipTombstone: true }));
});

step("a bulkUpsert merge keeps the STORED row's syncId", async () => {
  const rec = await p(cb => KOS.mediadb.add({ module: "anime", title: "Frieren", syncId: "stored-id",
    externalIds: { anilistId: 154587 }, syncSource: "anilist" }, cb));
  await p(cb => KOS.mediadb.bulkUpsert([{ module: "anime", title: "Frieren", status: "inProgress",
    progress: { current: 3 }, externalIds: { anilistId: 154587 }, syncSource: "anilist" }], {}, cb));
  const back = await p(cb => KOS.mediadb.get(rec.id, cb));
  assert(back.syncId === "stored-id", "merge re-minted syncId: " + back.syncId);
  assert(back.progress.current === 3, "merge didn't take list state");
  await p(cb => KOS.mediadb.remove(rec.id, cb, { skipTombstone: true }));
});

step("remove() queues a tombstone; backups exclude cloudsync.* kv keys", async () => {
  const rec = await p(cb => KOS.mediadb.add({ module: "vn", title: "Doomed", syncId: "doomed-1" }, cb));
  await p(cb => KOS.mediadb.remove(rec.id, cb));
  const q = await p(cb => KOS.mediadb.getKV("cloudsync.pendingDeletes", cb));
  assert(Array.isArray(q) && q.some(t => t.syncId === "doomed-1" && t.module === "vn"), "tombstone missing: " + JSON.stringify(q));
  await p(cb => KOS.mediadb.setKV("cloudsync.meta.user-x", { probe: 1 }, cb));
  const data = await p(cb => KOS.mediadb.exportAll(cb));
  assert(!data.kv.some(item => String(item.key).indexOf("cloudsync.") === 0), "cloudsync.* leaked into export");
  await p(cb => KOS.mediadb.setKV("cloudsync.pendingDeletes", [], cb));
});

/* ============ 2 · the engine over a mock account ============ */
console.log("== engine: push/pull/echo ==");

step("first link on an empty account + empty device links silently and pushes state", async () => {
  window.localStorage.clear();
  KOS.store.reset();
  await clearVault();
  await sync();
  assert(KOS.cloudsync.linkStatus() === null, "unexpected pending link: " + KOS.cloudsync.linkStatus());
  assert(KOS.cloudsync.getStatus().state === "synced", "status: " + KOS.cloudsync.getStatus().state);
  assert(server.state, "state document was not pushed");
});

step("a new local entry pushes; an unchanged vault pushes NOTHING", async () => {
  const rec = await p(cb => KOS.mediadb.add({ module: "anime", title: "Sousou no Frieren",
    status: "inProgress", progress: { current: 7, total: 28 }, externalIds: { anilistId: 154587 }, syncSource: "anilist" }, cb));
  await sync();
  const row = server.media.get(rec.syncId);
  assert(row && !row.deleted, "entry not on the server");
  assert(row.data_json.title === "Sousou no Frieren" && row.data_json.progress.current === 7, "payload wrong");
  assert(row.data_json.id === undefined, "device-local id leaked into data_json");
  const before = server.calls.upsertMedia;
  await sync();
  assert(server.calls.upsertMedia === before, "unchanged vault still upserted media");
});

step("a newer remote row applies locally — no session, no reward, no push-back", async () => {
  const all = await p(cb => KOS.mediadb.query({ module: "anime" }, cb));
  const local = all.find(e => e.title === "Sousou no Frieren");
  const row = server.media.get(local.syncId);
  row.data_json.progress.current = 12;                      // watched elsewhere
  row.updated_at = server.stamp();
  const sessionsBefore = KOS.store.state.sessions.length;
  const xpBefore = KOS.store.state.governor.xp;
  await sync();
  const after = await p(cb => KOS.mediadb.get(local.id, cb));
  assert(after.progress.current === 12, "remote progress not applied: " + after.progress.current);
  assert(KOS.store.state.sessions.length === sessionsBefore, "cloud pull logged a session");
  assert(KOS.store.state.governor.xp === xpBefore, "cloud pull moved XP");
  const before = server.calls.upsertMedia;
  await sync();
  assert(server.calls.upsertMedia === before, "pull-apply echoed back as a push");
  assert(server.media.get(local.syncId).data_json.progress.current === 12, "server overwritten by echo");
});

step("a remote tombstone deletes locally without re-queueing", async () => {
  const rec = await p(cb => KOS.mediadb.add({ module: "anime", title: "Short-lived", syncId: "shortlived-1" }, cb));
  await sync();
  const row = server.media.get("shortlived-1");
  row.deleted = true;
  row.data_json = {};
  row.updated_at = server.stamp();
  await sync();
  const gone = await p(cb => KOS.mediadb.get(rec.id, cb));
  assert(gone === null, "remote tombstone not applied locally");
  const q = await p(cb => KOS.mediadb.getKV("cloudsync.pendingDeletes", cb));
  assert(!(q || []).some(t => t.syncId === "shortlived-1"), "pulled deletion re-queued a tombstone (loop)");
});

step("a local delete pushes a tombstone and drains the queue", async () => {
  const rec = await p(cb => KOS.mediadb.add({ module: "game", title: "Uninstalled", syncId: "uninst-1" }, cb));
  await sync();
  assert(server.media.get("uninst-1") && !server.media.get("uninst-1").deleted, "precondition: pushed");
  await p(cb => KOS.mediadb.remove(rec.id, cb));
  await sync();
  assert(server.media.get("uninst-1").deleted === true, "tombstone not pushed");
  const q = await p(cb => KOS.mediadb.getKV("cloudsync.pendingDeletes", cb));
  assert(!(q || []).length, "tombstone queue not drained: " + JSON.stringify(q));
});

step("an empty remote state NEVER clobbers meaningful local state", async () => {
  KOS.store.state.progress["compsci:4.1.1.1"] = { status: "done", check: [true, true, true, true], note: "precious" };
  KOS.store.save();
  await sync();                                             // local state (meaningful) now pushed
  server.state = { state_json: { v: 1, progress: {}, sessions: [] }, updated_at: server.stamp() };  // hostile empty doc, newer
  await sync();
  assert(KOS.store.state.progress["compsci:4.1.1.1"], "EMPTY REMOTE DESTROYED LOCAL STATE");
  await sync();                                             // next cycle overwrites the empty remote
  assert(server.state.state_json.progress["compsci:4.1.1.1"], "local state did not re-push over the empty doc");
});

step("a newer MEANINGFUL remote state applies locally (document LWW)", async () => {
  const remoteDoc = JSON.parse(JSON.stringify(KOS.store.state));
  remoteDoc.progress["maths:remote-marker"] = { status: "started", check: [false, false, false, false], note: "from device B" };
  server.state = { state_json: remoteDoc, updated_at: server.stamp() };
  await sync();
  assert(KOS.store.state.progress["maths:remote-marker"], "newer remote state not applied");
});

/* ============ 3 · first-link matrix ============ */
console.log("== first link: localOnly / remoteOnly / both ==");

step("localOnly: nothing uploads until migrateUp; migration idempotent", async () => {
  const sv2 = makeServer();
  KOS.cloudsync._config({ api: makeApi(sv2), session: { userId: "user-2", email: "two@test" } });
  await sync();
  assert(KOS.cloudsync.linkStatus() === "localOnly", "expected localOnly, got " + KOS.cloudsync.linkStatus());
  assert(sv2.media.size === 0 && !sv2.state, "data uploaded WITHOUT explicit confirmation");
  const rep = await p(cb => KOS.cloudsync.migrateUp(cb));
  assert(rep && typeof rep.entries === "number", "migration report missing");
  const localCount = (await p(cb => KOS.mediadb.query({}, cb))).length;
  assert([...sv2.media.values()].filter(r => !r.deleted).length === localCount, "server rows ≠ local rows after migration");
  assert(sv2.state && sv2.state.state_json.progress["compsci:4.1.1.1"], "state doc not uploaded");
  const rows = sv2.media.size, calls = sv2.calls.upsertMedia;
  await sync();
  assert(sv2.media.size === rows && sv2.calls.upsertMedia === calls, "second cycle re-uploaded (not idempotent)");
});

step("remoteOnly: an empty device adopts the account", async () => {
  const sv3 = makeServer();
  const api3 = makeApi(sv3);
  sv3.state = { state_json: { v: 1, progress: { "it:adopted": { status: "done", check: [true, true, true, true], note: "" } }, sessions: [] }, updated_at: sv3.stamp() };
  sv3.media.set("adopt-1", { entry_id: "adopt-1", module: "anime", deleted: false, updated_at: sv3.stamp(),
    data_json: { module: "anime", title: "Adopted Anime", status: "completed", syncId: "adopt-1", progress: { current: 12, total: 12 } } });
  sv3.media.set("adopt-2", { entry_id: "adopt-2", module: "books", deleted: false, updated_at: sv3.stamp(),
    data_json: { module: "books", title: "Adopted Book", status: "planned", syncId: "adopt-2" } });
  window.localStorage.clear();
  KOS.store.reset();
  await clearVault();
  KOS.cloudsync._config({ api: api3, session: { userId: "user-3", email: "three@test" } });
  await sync();
  assert(KOS.cloudsync.linkStatus() === null, "remoteOnly did not auto-adopt");
  assert(KOS.store.state.progress["it:adopted"], "remote state not adopted");
  const anime = await p(cb => KOS.mediadb.getBySyncId("adopt-1", cb));
  const book = await p(cb => KOS.mediadb.getBySyncId("adopt-2", cb));
  assert(anime && anime.title === "Adopted Anime" && anime.progress.current === 12, "anime row not adopted");
  assert(book && book.module === "books", "book row not adopted");
});

step("both: media merges per entry (adopt, no duplicate), device state wins on 'device'", async () => {
  window.localStorage.clear();
  KOS.store.reset();
  await clearVault();
  KOS.store.state.progress["compsci:device-marker"] = { status: "done", check: [true, true, true, true], note: "" };
  KOS.store.save();
  const localRec = await p(cb => KOS.mediadb.add({ module: "anime", title: "Steins;Gate",
    status: "inProgress", progress: { current: 4, total: 24 }, externalIds: { anilistId: 9253 },
    syncSource: "anilist", notes: "my local notes" }, cb));
  const sv4 = makeServer(Date.now() + 10 * 60 * 1000);      // server writes are "newer" than the local edit
  const api4 = makeApi(sv4);
  sv4.state = { state_json: { v: 1, progress: { "maths:cloud-marker": { status: "started", check: [false, false, false, false], note: "" } }, sessions: [] }, updated_at: sv4.stamp() };
  sv4.media.set("remote-sg", { entry_id: "remote-sg", module: "anime", deleted: false, updated_at: sv4.stamp(),
    data_json: { module: "anime", title: "Steins;Gate", status: "inProgress", syncId: "remote-sg",
      progress: { current: 20, total: 24 }, externalIds: { anilistId: 9253 }, syncSource: "anilist" } });
  KOS.cloudsync._config({ api: api4, session: { userId: "user-4", email: "four@test" } });
  await sync();
  assert(KOS.cloudsync.linkStatus() === "both", "expected both, got " + KOS.cloudsync.linkStatus());
  await p(cb => KOS.cloudsync.resolveBoth("device", cb));
  const matches = (await p(cb => KOS.mediadb.query({ module: "anime", search: "steins" }, cb)));
  assert(matches.length === 1, "merge duplicated the entry: " + matches.length);
  assert(matches[0].syncId === "remote-sg", "remote identity not adopted: " + matches[0].syncId);
  assert(matches[0].progress.current === 20, "newer remote copy did not win: " + matches[0].progress.current);
  assert(matches[0].id === localRec.id, "merge replaced the local row instead of updating it");
  assert(KOS.store.state.progress["compsci:device-marker"], "device state lost");
  assert(!KOS.store.state.progress["maths:cloud-marker"], "cloud state applied despite 'device' choice");
  assert(sv4.state.state_json.progress["compsci:device-marker"], "device state not pushed over cloud copy");
  window.__sv4 = sv4;   // later steps continue on this account
});

/* ============ 4 · attachments ============ */
console.log("== attachments: metadata auto, binaries explicit ==");

step("metadata pushes automatically; binaries only via uploadBinaries; no duplicate uploads", async () => {
  const sv4 = window.__sv4;
  const file = new window.File(["mark scheme content"], "ms.txt", { type: "text/plain" });
  await p(cb => KOS.attach.add("compsci", "4.1.1.1", file, cb));
  await sync();
  const metaRows = [...sv4.files.values()].filter(r => !r.deleted);
  assert(metaRows.length === 1 && metaRows[0].name === "ms.txt", "metadata not pushed");
  assert(metaRows[0].binary_uploaded === false, "binary_uploaded true without an upload");
  assert(sv4.storage.size === 0, "a binary uploaded WITHOUT the explicit action");
  const rep1 = await p(cb => KOS.cloudsync.uploadBinaries(cb));
  assert(rep1.uploaded === 1 && rep1.failed.length === 0, "upload report: " + JSON.stringify(rep1));
  assert(sv4.storage.size === 1, "binary not in storage");
  assert([...sv4.files.values()][0].binary_uploaded === true, "binary_uploaded not set");
  const rep2 = await p(cb => KOS.cloudsync.uploadBinaries(cb));
  assert(rep2.uploaded === 0 && rep2.skipped >= 1, "duplicate upload: " + JSON.stringify(rep2));
  assert(sv4.calls.uploadBinary === 1, "storage hit twice for one file");
});

step("deleting an attachment tombstones the row and removes the storage object", async () => {
  const sv4 = window.__sv4;
  const items = await p(cb => KOS.attach.listMeta(cb));
  const mine = items.find(m => m.name === "ms.txt");
  await p(cb => KOS.attach.remove(mine.id, cb));
  await sync();
  assert(sv4.files.get(mine.fileId).deleted === true, "file tombstone not pushed");
  assert(sv4.storage.size === 0, "storage object not removed on delete");
  const q = await p(cb => KOS.mediadb.getKV("cloudsync.filesPendingDeletes", cb));
  assert(!(q || []).length, "file tombstone queue not drained");
});

step("downloadFile fills a cloud-only record's blob", async () => {
  const sv4 = window.__sv4;
  await p(cb => KOS.attach.putRemoteMeta({ fileId: "cloudonly-1", subject: "maths", ref: "1.1",
    name: "notes.txt", mime: "text/plain", size: 5, note: "", updatedAt: Date.now() }, cb));
  sv4.storage.set("user-4/cloudonly-1/notes.txt", new window.Blob(["hello"], { type: "text/plain" }));
  const before = await p(cb => KOS.attach.getByFileId("cloudonly-1", cb));
  assert(before && !before.blob, "precondition: record should be blob-less");
  await p(cb => KOS.cloudsync.downloadFile("cloudonly-1", cb));
  const after = await p(cb => KOS.attach.getByFileId("cloudonly-1", cb));
  assert(after.blob, "blob not stored");
  /* fake-indexeddb's structured clone strips jsdom Blob internals (same
     quirk smoke13 works around) — the record's size was refreshed from the
     REAL blob at write time, which still proves the storage → local
     round trip */
  assert(after.size === 5, "record size not refreshed from the blob: " + after.size);
});

/* ============ 5 · restore re-baseline ============ */
console.log("== restore reconcile ==");

step("noteRestore tombstones remote rows absent locally and re-pushes the vault", async () => {
  const sv4 = window.__sv4;
  sv4.media.set("ghost-1", { entry_id: "ghost-1", module: "anime", deleted: false, updated_at: sv4.stamp(),
    data_json: { module: "anime", title: "Ghost Row", syncId: "ghost-1" } });
  KOS.cloudsync.noteRestore();
  await tick(30);
  await sync();
  assert(sv4.media.get("ghost-1").deleted === true, "remote-only row not tombstoned after restore");
  const locals = await p(cb => KOS.mediadb.query({}, cb));
  for (const e of locals) {
    const row = sv4.media.get(e.syncId);
    assert(row && !row.deleted, "restored local row missing on server: " + e.title);
  }
  const ghost = await p(cb => KOS.mediadb.getBySyncId("ghost-1", cb));
  assert(!ghost, "ghost row resurrected locally");
});

/* ============ run ============ */
(async () => {
  let pass = 0;
  const fails = [];
  for (const [name, fn] of steps) {
    try {
      await fn();
      console.log("  ok  " + name);
      pass++;
    } catch (e) {
      fails.push(`STEP "${name}": ${e.message}`);
      console.log("  FAIL " + name + " — " + e.message);
    }
  }
  if (errors.length) fails.push(...errors);
  console.log("");
  if (fails.length) {
    console.log("SMOKE17 FAILURES (" + fails.length + "):");
    fails.forEach(f => console.log("  - " + f));
    process.exit(1);
  }
  console.log("SMOKE17 PASS — Build 4a cloud sync verified (" + pass + " steps).");
  process.exit(0);
})();
