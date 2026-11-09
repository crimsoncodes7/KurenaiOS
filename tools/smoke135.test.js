/* Kurenai OS — smoke135.test.js
   Quality W1, RC5: first sign-in (DI-03), the Todoist/Google lease across
   tabs (DI-19) and the goal's linked title (GO-25).

   DI-03 — a device whose data was reminders, assignments, assessments or
   routines counted as EMPTY, so its first sign-in to an account with data
   adopted the cloud copy over it (replaceState, no merge, no backup).
     A · a fresh device (shipped defaults and boot seeds only) is not user
         data, and still adopts the account: nothing of its own is merged
         in, and the copy kept before the replace reads back.
     B · a device holding ONLY reminders, an assignment, a routine and an
         assessment signs in to an account with data: every record
         survives, reaches the cloud copy, the account's data combines in,
         a VERIFIED checkpoint was taken first, and the pre-replace copy
         restores the device as it was.
     C · the reverse: a cloud copy holding only a reminder is merged, not
         overwritten by the device's upload; a cloud copy of shipped
         defaults only is replaced by the device's data.
   DI-19 — the lease did not exclude a second tab and was never renewed.
     D · two tabs share a Web Lock: the second tab's cycle is SKIPPED (no
         lease asked, no adapter run) while the first holds it, and runs
         once it is free; each tab leases as its own holder.
     E · a Todoist push of two chunks renews the lease between them; a
         renewal the server refuses stops the cycle before the second
         chunk, runs no later adapter and releases nothing.
   GO-25 — the Linked title select listed in-progress titles only, capped at
   60, so editing a goal linked to anything else rewrote its link on Save.
     F · a goal linked to a COMPLETED title keeps it through Edit and Save.
     G · so does one linked to title #200 of a 210-title vault, and any
         title (any status) can be found by search and picked.

   Run: node tools/smoke135.test.js */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(String(err))) : res(out))); }
/* a promise that waits on the app's virtual timers */
async function run(app, promise) {
  let done = false;
  promise.then(() => { done = true; }, () => { done = true; });
  for (let i = 0; i < 400 && !done; i++) await app.settle();
  return promise;
}

/* ---------------- the mock Supabase boundary (smoke17's) ---------------- */
function makeServer() {
  return { clock: Date.parse("2026-09-24T09:00:00Z"), state: null, media: new Map(), files: new Map(), storage: new Map(), calls: { upsertState: 0 } };
}
function makeApi(sv) {
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const stamp = () => new Date(sv.clock += 1000).toISOString();
  const since = (map, iso) => [...map.values()].filter((r) => !iso || Date.parse(r.updated_at) > Date.parse(iso))
    .sort((a, b) => Date.parse(a.updated_at) - Date.parse(b.updated_at));
  sv.stamp = stamp;
  return {
    fetchState: (cb) => cb(null, sv.state ? clone(sv.state) : null),
    upsertState: (json, expected, cb) => {
      sv.calls.upsertState++;
      if (expected !== null && expected !== undefined) {
        const cur = sv.state ? (sv.state.state_json.__seq || 0) : 0;
        if (expected === 0 ? !!sv.state : cur !== expected) { cb(null, null); return; }
      }
      sv.state = { state_json: clone(json), updated_at: stamp() };
      cb(null, { updated_at: sv.state.updated_at });
    },
    fetchMediaSince: (iso, offset, cb) => cb(null, since(sv.media, iso).slice(offset, offset + 500).map(clone)),
    upsertMedia: (rows, cb) => cb(null, rows.map((r) => { const rec = Object.assign(clone(r), { updated_at: stamp() }); sv.media.set(r.entry_id, rec); return { entry_id: r.entry_id, updated_at: rec.updated_at }; })),
    countMedia: (cb) => cb(null, [...sv.media.values()].filter((r) => !r.deleted).length),
    listMediaIds: (offset, cb) => cb(null, [...sv.media.values()].filter((r) => !r.deleted).slice(offset, offset + 1000).map((r) => ({ entry_id: r.entry_id }))),
    fetchFilesSince: (iso, offset, cb) => cb(null, since(sv.files, iso).slice(offset, offset + 500).map(clone)),
    upsertFiles: (rows, cb) => cb(null, rows.map((r) => { const rec = Object.assign(clone(r), { binary_uploaded: false, updated_at: stamp() }); sv.files.set(r.file_id, rec); return { file_id: r.file_id, updated_at: rec.updated_at }; })),
    listFileIds: (offset, cb) => cb(null, []),
    markUploaded: (fileId, cb) => cb(null, [{ updated_at: null }]),
    uploadBinary: (p2, blob, mime, cb) => { sv.storage.set(p2, blob); cb(null, {}); },
    downloadBinary: (p2, cb) => cb(new Error("object not found")),
    removeBinary: (paths, cb) => cb(null)
  };
}
async function linkedApp(sv, user) {
  const app = await boot();
  const K = app.KOS;
  await app.settle();
  K.cloudsync._config({ api: makeApi(sv), session: { userId: user, email: user + "@test" }, quiet: true,
    pushDebounce: 10 * 60 * 1000, minPullGap: 0, bootDelay: 0 });
  return { app, K, sync: () => run(app, p((cb) => K.cloudsync.syncNow(cb))) };
}
/* the account's copy: what another device pushed (a fresh boot's defaults,
   plus the given data) */
let DEFAULTS = null;
function remoteDoc(extra) {
  const d = JSON.parse(JSON.stringify(DEFAULTS));
  delete d.ui;
  return Object.assign(d, extra || {}, { __seq: 1 });
}
const PROG = { "maths:cloud-marker": { status: "started", check: [true, false, false, false], note: "from the other device" } };
const titles = (arr) => (arr || []).map((x) => x.title || x.name).sort();

step("A · a fresh device is not user data, and adopts the account", async () => {
  const sv = makeServer();
  const { app, K, sync } = await linkedApp(sv, "user-a");
  DEFAULTS = JSON.parse(JSON.stringify(K.store.state));
  eq(K.cloudsync.userData && K.cloudsync.userData(K.store.state), null, "a freshly booted device (defaults, sample events, the plan seed) holds no user data");
  sv.state = { state_json: remoteDoc({ progress: PROG }), updated_at: sv.stamp() };
  sv.state.state_json.reminders.items = [{ id: 1, title: "Cloud reminder", created: 1 }];
  await sync();
  assert(K.store.state.progress["maths:cloud-marker"], "the account's state was adopted");
  eq(titles(K.store.state.reminders.items), ["Cloud reminder"], "the account's reminders, nothing of this device merged in");
  const doc = sv.state.state_json;
  eq(Object.keys(doc.progress), ["maths:cloud-marker"], "the cloud copy gained no junk progress");
  eq(titles(doc.reminders.items), ["Cloud reminder"], "nor reminders");
  const pre = await p((cb) => K.cloudsync.preReplaced(cb));
  assert(pre && pre.state && pre.reason === "adopt", "a copy was kept before the replace: " + JSON.stringify(pre && pre.reason));
  assert(!pre.state.progress["maths:cloud-marker"], "and it is the device as it was, before the adopt");
  eq(pre.user, null, "it records that the device held no user data");
  eq(app.errors, [], "no page errors");
});

let B;
step("B · a device holding only reminders, an assignment, a routine and an assessment keeps them all on first link", async () => {
  const sv = makeServer();
  B = await linkedApp(sv, "user-b");
  const { K, sync } = B;
  K.reminders.add({ title: "Device reminder" });
  K.assignments.add({ title: "Device essay", subject: "compsci", due: "2026-10-10" });
  const rt = K.routines.add({ name: "Device routine", steps: [{ id: "s1", text: "Stretch" }] });
  assert(rt, "the routine was added");
  K.exams.add({ title: "Device mock", tier: "mock", subject: "maths", date: "2026-11-20" });
  K.store.save();
  const counted = K.cloudsync.userData && K.cloudsync.userData(K.store.state);
  sv.state = { state_json: remoteDoc({ progress: PROG }), updated_at: sv.stamp() };
  await sync();
  const st = K.store.state;
  assert(st.reminders.items.some((r) => r.title === "Device reminder"), "the reminder survived the first link");
  assert(st.assignments.items.some((a) => a.title === "Device essay"), "the assignment survived");
  assert(st.routines.items.some((r) => r.name === "Device routine"), "the routine survived");
  assert(Object.values(st.exams.assessments).some((a) => a.title === "Device mock"), "the assessment survived");
  assert(st.progress["maths:cloud-marker"], "the account's data combined in");
  const doc = sv.state.state_json;
  assert(doc.reminders.items.some((r) => r.title === "Device reminder"), "the reminder reached the cloud copy");
  assert(doc.assignments.items.some((a) => a.title === "Device essay"), "the assignment reached the cloud copy");
  assert(doc.routines.items.some((r) => r.name === "Device routine"), "the routine reached the cloud copy");
  assert(Object.values(doc.exams.assessments).some((a) => a.title === "Device mock"), "the assessment reached the cloud copy");
  assert(doc.progress["maths:cloud-marker"], "the cloud copy kept its own data");
  assert(counted, "the device's records count as user data");
  const cps = await K.backup.list();
  const cp = cps.filter((c) => /Before linking this device/.test(c.label))[0];
  assert(cp, "a checkpoint was taken before the first link: " + JSON.stringify(cps.map((c) => c.label)));
  eq((await K.backup.verify(cp.id)).ok, true, "and it verifies");
});

step("B · the copy kept before the replace reads back and restores the device", async () => {
  const { K } = B;
  const pre = await p((cb) => K.cloudsync.preReplaced(cb));
  assert(pre && pre.state, "a pre-replace copy exists");
  eq(pre.reason, "merge", "taken before the merge landed");
  assert(pre.user, "it records the device's own data: " + pre.user);
  assert(!pre.state.progress["maths:cloud-marker"], "it is the device BEFORE the account's data came in");
  K.store.replaceState(JSON.parse(JSON.stringify(pre.state)));
  assert(K.store.state.reminders.items.some((r) => r.title === "Device reminder"), "restoring it brings the device back");
  assert(!K.store.state.progress["maths:cloud-marker"], "exactly as it was");
  eq(B.app.errors, [], "no page errors");
});

step("C · a cloud copy holding only a reminder is merged with the device, not overwritten", async () => {
  const sv = makeServer();
  const { app, K, sync } = await linkedApp(sv, "user-c");
  K.store.state.progress["compsci:device-marker"] = { status: "done", check: [true, true, true, true], note: "" };
  K.store.save();
  const doc0 = remoteDoc();
  doc0.reminders.items = [{ id: 1, title: "Only in the cloud", created: 1 }];
  sv.state = { state_json: doc0, updated_at: sv.stamp() };
  await sync();
  const doc = sv.state.state_json;
  assert(doc.reminders.items.some((r) => r.title === "Only in the cloud"), "the cloud's reminder was NOT overwritten by the upload");
  assert(doc.progress["compsci:device-marker"], "the device's data reached the cloud");
  assert(K.store.state.reminders.items.some((r) => r.title === "Only in the cloud"), "and the reminder reached the device");
  assert(K.cloudsync.userData(doc0), "a reminder is user data in the cloud copy too");
  eq(app.errors, [], "no page errors");
});

step("C · a cloud copy of shipped defaults only is replaced by the device's data", async () => {
  const sv = makeServer();
  const { K, sync } = await linkedApp(sv, "user-c2");
  K.reminders.add({ title: "Mine" });
  const doc0 = remoteDoc();
  eq(K.cloudsync.userData(doc0), null, "defaults are not user data");
  sv.state = { state_json: doc0, updated_at: sv.stamp() };
  await sync();
  eq(titles(sv.state.state_json.reminders.items), ["Mine"], "the device's copy is the account's copy");
});

/* ---------------- DI-19 ---------------- */
const ACCESS = { google: "ya29.test-google", todoist: "td-test-token" };
function fakeTodoist() {
  const st = { seq: 0, items: {}, projects: [{ id: "P1", name: "School" }], calls: [], uuids: {} };
  function res(status, json) { return Promise.resolve({ ok: status < 300, status, text: () => Promise.resolve(JSON.stringify(json)) }); }
  st.fetch = (url, init) => {
    const form = new URLSearchParams(init.body), out = {};
    if (form.get("commands")) {
      const cmds = JSON.parse(form.get("commands"));
      st.calls.push(cmds);
      out.sync_status = {}; out.temp_id_mapping = {};
      cmds.forEach((c) => {
        if (c.type === "item_add") { const id = "T" + (++st.seq); out.temp_id_mapping[c.temp_id] = id; st.items[id] = Object.assign({}, c.args, { id, seq: st.seq }); }
        out.sync_status[c.uuid] = "ok";
      });
      return res(200, out);
    }
    out.items = []; out.projects = st.projects; out.full_sync = form.get("sync_token") === "*"; out.sync_token = "t" + st.seq;
    return res(200, out);
  };
  return st;
}
/* a Web Locks stand-in shared by the tabs (ifAvailable only) */
function fakeLocks() {
  const held = new Set();
  return {
    held,
    request(name, opts, fn) {
      if (held.has(name)) return Promise.resolve(fn(null));
      held.add(name);
      return Promise.resolve().then(() => fn({ name })).finally(() => held.delete(name));
    }
  };
}
async function extTab(locks, edge, seed) {
  const app = await boot({ clock: "2026-10-29T10:00:00", seed: seed || 20260924 });
  const K = app.KOS, X = K.ext;
  await app.settle();
  K.cloud.signedIn = () => true; K.cloud.userId = () => "u1";
  const calls = [];
  X._setEdge((body) => {
    calls.push(body);
    if (body.action === "token") return Promise.resolve({ token: ACCESS[body.provider], expires_at: new app.window.Date(app.window.Date.now() + 3600e3).toISOString() });
    if (body.action === "lease") return Promise.resolve({ ok: edge ? edge(body, calls) : true });
    if (body.action === "release") return Promise.resolve({ ok: true });
    return Promise.reject(new Error("?"));
  });
  if (X._setLocks) X._setLocks(locks);
  X.S().todoist.on = true;
  return { app, K, X, calls };
}

step("D · a second tab skips the cycle while the first holds the Web Lock", async () => {
  const locks = fakeLocks();
  const t1 = await extTab(locks), t2 = await extTab(locks, null, 77);   /* another page load */
  /* both tabs share the device id (state.ui.extDevice), as two tabs do */
  t2.K.store.state.ui.extDevice = t1.X.device();
  let release, ran1 = 0, ran2 = 0;
  const gate = new Promise((r) => { release = r; });
  t1.X.register({ name: "probe", provider: "todoist", on: () => true, cycle: () => { ran1++; return gate.then(() => ({ n: 1 })); } });
  t2.X.register({ name: "probe", provider: "todoist", on: () => true, cycle: () => { ran2++; return { n: 1 }; } });
  const first = t1.X.syncProvider("todoist", "test");
  for (let i = 0; i < 40 && !ran1; i++) await t1.app.settle();
  eq(ran1, 1, "the first tab is in its cycle");
  const leases2 = () => t2.calls.filter((c) => c.action === "lease").length;
  const r2 = await run(t2.app, t2.X.syncProvider("todoist", "test"));
  eq([r2.busy, ran2, leases2()], [true, 0, 0], "the second tab skipped: no lease asked, no adapter run");
  release();
  const r1 = await run(t1.app, first);
  assert(r1.ok && !r1.busy, "the first tab finished: " + JSON.stringify(r1));
  assert(!locks.held.size, "the lock is free again");
  const r3 = await run(t2.app, t2.X.syncProvider("todoist", "test"));
  assert(!r3.busy && ran2 === 1 && leases2() === 1, "with the lock free the second tab runs: " + JSON.stringify(r3));
  assert(locks.held.size === 0, "and frees it");
  eq(t1.X.lockName && t1.X.lockName("todoist"), "kos-ext-todoist" + ((t1.K.dataMode && t1.K.dataMode.suffix) || ""), "the lock is per provider and data namespace");
  assert(t1.X.holder() !== t2.X.holder() && t1.X.holder().indexOf(t1.X.device()) === 0, "each tab leases as its own holder: " + t1.X.holder() + " / " + t2.X.holder());
  eq(t2.calls.filter((c) => c.action === "lease")[0].holder, t2.X.holder(), "the second tab leased as itself");
});

step("E · the lease is renewed between chunks; a refused renewal stops the cycle", async () => {
  let refuse = false;
  const t = await extTab(fakeLocks(), () => !refuse);
  const { app, K, X, calls } = t;
  const td = fakeTodoist();
  const plain = app.window.fetch;
  app.window.fetch = (url, init) => String(url).indexOf("https://api.todoist.com/") === 0 ? td.fetch(url, init) : plain(url, init);
  const list = K.reminders.addList("School");
  K.extTasks.link(list.id, "todoist", { id: "P1", name: "School" });
  for (let i = 0; i < 100; i++) K.reminders.add({ title: "Chunked " + i, listId: list.id });
  let later = 0;
  X.register({ name: "later", provider: "todoist", on: () => true, cycle: () => { later++; return {}; } });
  if (X._config) X._config({ renewMs: 0 });                 /* every heartbeat renews */
  const leases = () => calls.filter((c) => c.action === "lease").length;
  const releases = () => calls.filter((c) => c.action === "release").length;
  let r = await run(app, X.syncProvider("todoist", "test"));
  assert(r.ok, "a two-chunk push: " + JSON.stringify(r));
  eq(td.calls.length, 2, "100 commands in two chunks");
  eq(leases(), 3, "the lease taken once and renewed before each chunk");
  eq([later, releases()], [1, 1], "the later adapter ran and the lease was released");

  /* again, with the server refusing the renewal before the second chunk */
  for (let i = 0; i < 100; i++) K.reminders.add({ title: "Second batch " + i, listId: list.id });
  td.calls.length = 0; calls.length = 0; later = 0;
  let n = 0;
  X._setEdge((body) => {
    calls.push(body);
    if (body.action === "token") return Promise.resolve({ token: ACCESS[body.provider], expires_at: new app.window.Date(app.window.Date.now() + 3600e3).toISOString() });
    if (body.action === "lease") return Promise.resolve({ ok: ++n <= 2 });   /* take, renew, then refused */
    if (body.action === "release") return Promise.resolve({ ok: true });
    return Promise.reject(new Error("?"));
  });
  r = await run(app, X.syncProvider("todoist", "test"));
  eq([r.ok, r.aborted], [false, true], "the cycle stopped: " + JSON.stringify(r));
  assert(/took over syncing Todoist/.test(r.why), "and says why: " + r.why);
  eq(td.calls.length, 1, "the second chunk was never sent");
  eq(later, 0, "no later adapter ran");
  eq(releases(), 0, "a lease that is not ours is not released");
  eq(((await run(app, X.status("todoist"))) || {}).ok, false, "the status records the stop");
  eq(app.errors, [], "no page errors");
});

/* ---------------- GO-25 ---------------- */
let G5;
async function editAndSave(app, K, goalId) {
  K.goalEditor(K.goals.get(goalId));
  /* let the editor's vault read finish (a cursor turn a row) before Save */
  for (let i = 0; i < 150; i++) await app.settle();
  const save = app.document.querySelector("[data-ui~='goal.save']");
  assert(save, "the editor opened");
  save.click();
  await app.settle();
  return K.goals.get(goalId);
}
step("F · a goal linked to a completed title keeps its link through Edit and Save", async () => {
  const app = await boot();
  const K = app.KOS;
  await app.settle();
  G5 = { app, K };
  const a = await p((cb) => K.mediadb.add({ module: "anime", title: "Aria in progress", status: "inProgress" }, cb));
  const b = await p((cb) => K.mediadb.add({ module: "anime", title: "Beta completed", status: "completed" }, cb));
  G5.a = a; G5.b = b;
  const g = K.goals.add({ title: "Finish Beta", type: "specific-title", target: 1, linkedEntryId: b.id });
  const after = await editAndSave(app, K, g.id);
  eq(after.linkedEntryId, b.id, "the link is kept (it used to become the first in-progress title, " + a.id + ")");
  eq(app.errors, [], "no page errors");
});

step("G · title #200 of a large vault keeps its link, and any title can be found by search", async () => {
  const { app, K } = G5;
  const made = [];
  for (let i = 1; i <= 210; i++) {
    made.push(await p((cb) => K.mediadb.add({ module: "books", title: "Volume " + String(i).padStart(3, "0"), status: i % 2 ? "planned" : "inProgress" }, cb)));
  }
  const t200 = made[199];
  const g = K.goals.add({ title: "Read #200", type: "finish-series", target: 1, linkedEntryId: t200.id });
  eq((await editAndSave(app, K, g.id)).linkedEntryId, t200.id, "title #200 is kept on Save");

  /* search the whole vault, any status, and pick */
  K.goalEditor(K.goals.get(g.id));
  await app.settle();
  const $ = (s) => app.document.querySelector(s);
  assert(/Volume 200/.test($("[data-ui~='goal.link-chosen']").textContent), "the current title is shown: " + $("[data-ui~='goal.link-chosen']").textContent);
  const q = $("[data-ui~='goal.link-search']");
  q.value = "beta completed";
  q.dispatchEvent(new app.window.Event("input"));
  /* the cursor walks the whole vault, a turn a row under fake-indexeddb */
  for (let i = 0; i < 300 && !app.document.querySelector("[data-ui~='goal.link-results']").textContent; i++) await app.settle();
  const hits = [...app.document.querySelectorAll("[data-ui~='goal.link-hit']")];
  eq(hits.map((h) => h.getAttribute("data-id")), [String(G5.b.id)], "a completed title is found by search");
  hits[0].click();
  await app.settle();
  $("[data-ui~='goal.save']").click();
  await app.settle();
  eq(K.goals.get(g.id).linkedEntryId, G5.b.id, "the picked title is saved");
  q.value = "";
  const shown = app.document.querySelectorAll("[data-ui~='goal.link-hit']").length;
  assert(shown <= 8, "never more than eight hits drawn: " + shown);
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke135: " + failed + " failed" : "smoke135: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
