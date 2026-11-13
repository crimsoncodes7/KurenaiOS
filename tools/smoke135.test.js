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

/* ---------------- RC5 review: the sync fixes ---------------- */
const TITLES = (K) => titles(K.store.state.reminders.items);
/* another device pushed `change(doc)` to the account */
function otherDevicePush(sv, change) {
  const doc = JSON.parse(JSON.stringify(sv.state.state_json));
  change(doc);
  doc.__seq = (doc.__seq || 0) + 1;
  sv.state = { state_json: doc, updated_at: sv.stamp() };
}
/* run `during` once, in the middle of the copy kept before a replace */
function duringPreReplace(K, during) {
  const real = K.mediadb.setKV;
  let ran = 0;
  K.mediadb.setKV = function (key, val, cb) {
    if (/^cloudsync\.prereplace\./.test(String(key)) && !ran++) during();
    return real.apply(this, arguments);
  };
  return () => { K.mediadb.setKV = real; return ran; };
}

step("H · an edit made while a pull is landing is kept, on this device and in the cloud (merge)", async () => {
  const sv = makeServer();
  const { app, K, sync } = await linkedApp(sv, "user-h");
  K.reminders.add({ title: "Mine" });
  await sync();
  eq(titles(sv.state.state_json.reminders.items), ["Mine"], "linked: the device's copy is the account's");
  otherDevicePush(sv, (d) => d.reminders.items.push({ id: 900, title: "Other device", created: 5 }));
  K.reminders.add({ title: "Local2" });             /* this device is dirty: the pull merges */
  const undo = duringPreReplace(K, () => K.reminders.add({ title: "RACE edit" }));
  await sync();
  eq(undo(), 1, "the edit was made during the pre-replace copy");
  eq(TITLES(K), ["Local2", "Mine", "Other device", "RACE edit"], "this device keeps the edit");
  eq(titles(sv.state.state_json.reminders.items), ["Local2", "Mine", "Other device", "RACE edit"], "and so does the cloud copy");
  eq(app.errors, [], "no page errors");
});

step("H · the same on the adopt path: a clean device takes the cloud copy and keeps the edit", async () => {
  const sv = makeServer();
  const { app, K, sync } = await linkedApp(sv, "user-h2");
  K.reminders.add({ title: "Mine" });
  await sync();
  otherDevicePush(sv, (d) => d.reminders.items.push({ id: 900, title: "Other device", created: 5 }));
  const undo = duringPreReplace(K, () => K.reminders.add({ title: "RACE adopt" }));
  await sync();
  eq(undo(), 1, "the edit was made during the pre-replace copy");
  eq(TITLES(K), ["Mine", "Other device", "RACE adopt"], "this device keeps the edit and takes the cloud's");
  await sync();
  eq(titles(sv.state.state_json.reminders.items), ["Mine", "Other device", "RACE adopt"], "the cloud copy has it too");
  eq(app.errors, [], "no page errors");
});

const noSamples = (doc) => {
  doc.calendar.events = [];
  doc.exams.assessments = {};
  return doc;
};
const sampleTitles = (doc) => (doc.calendar.events || []).map((e) => e.title)
  .concat(Object.values((doc.exams && doc.exams.assessments) || {}).map((a) => a.title)).filter((t) => /SAMPLE/.test(t));

step("I · opening the Daily Review is not user data: the device adopts, and no SAMPLE row reaches the account", async () => {
  const sv = makeServer();
  const { app, K, sync } = await linkedApp(sv, "user-i");
  assert(sampleTitles(K.store.state).length >= 4, "a fresh boot plants the samples");
  K.dayReview.markShown("morning");
  K.dayReview.markShown("evening");
  K.store.save();
  assert(Object.keys(K.store.state.dayReview.days).length, "the review left its view markers");
  eq(K.cloudsync.userData(K.store.state), null, "a review only LOOKED at is not user data");
  const doc0 = noSamples(remoteDoc({ progress: PROG }));
  doc0.reminders.items = [{ id: 1, title: "Cloud reminder", created: 1 }];
  sv.state = { state_json: doc0, updated_at: sv.stamp() };
  await sync();
  await sync();
  eq(sampleTitles(sv.state.state_json), [], "the account, which deleted its samples, got none back");
  eq(sampleTitles(K.store.state), [], "and this device took the account's calendar");
  eq(TITLES(K), ["Cloud reminder"], "adopted");
  /* a review really DONE is the user's */
  K.dayReview.finish("morning", "done");
  assert(K.cloudsync.userData(K.store.state), "a finished review counts");
  eq(app.errors, [], "no page errors");
});

step("I · a device with real data and untouched samples: its data merges in, its samples and plan seed do not", async () => {
  const sv = makeServer();
  const { app, K, sync } = await linkedApp(sv, "user-i2");
  K.reminders.add({ title: "Device reminder" });
  const doc0 = noSamples(remoteDoc({ progress: PROG }));
  /* the account ticked a plan row this device still holds as the seed left it */
  const row = doc0.pacing.entries.filter((e) => !e.done)[0];
  row.done = true; row.doneAt = "2026-09-20";
  sv.state = { state_json: doc0, updated_at: sv.stamp() };
  await sync();
  await sync();
  const doc = sv.state.state_json;
  eq(sampleTitles(doc), [], "no SAMPLE event or assessment was pushed back into the account");
  assert(doc.reminders.items.some((r) => r.title === "Device reminder"), "the device's reminder reached the account");
  const got = doc.pacing.entries.filter((e) => String(e.id) === String(row.id))[0];
  assert(got && got.done, "the account's plan tick was not reverted by this device's untouched seed");
  eq(doc.pacing.entries.length, doc0.pacing.entries.length, "and no seed row was doubled");
  eq(app.errors, [], "no page errors");
});

step("J · every kind of user evidence counts as user data", async () => {
  const { K } = await linkedApp(makeServer(), "user-j");
  const fresh = () => JSON.parse(JSON.stringify(K.store.state));
  eq(K.cloudsync.userData(fresh()), null, "the fresh document holds none");
  const cases = {
    "code.projects": (d) => { d.code.projects.bridge = { reports: 1 }; },
    "code.capstones": (d) => { d.code.capstones.c1 = { draft: "x" }; },
    "itUnits.year1": (d) => { d.itUnits.year1.grade = "Merit"; },
    "itUnits.target": (d) => { d.itUnits.target = "Distinction"; },
    "srsCfg.retention": (d) => { d.srsCfg.retention = 0.85; },
    "srsCfg.examRetention": (d) => { d.srsCfg.examRetention = 0; },
    "japanese.fluency": (d) => { d.japanese.fluency["2026-09-20"] = { n: 1 }; },
    "oop.links": (d) => { d.oop.links.push({ from: 1, to: 2, kind: "inherits" }); },
    "exams.prefs": (d) => { d.exams.prefs.extraTime = 25; },
    "governor.about": (d) => { d.governor.about = "Hello"; },
    "governor.status": (d) => { d.governor.status = "Revising"; },
    "governor.avatar": (d) => { d.governor.avatar.kind = "custom"; d.governor.avatar.file = "profile-avatar-x"; },
    "governor.banner": (d) => { d.governor.bannerImg = "data:image/png;base64,AAAA"; },
    "governor.theme": (d) => { d.governor.theme = "dawn"; },
    "artSlots": (d) => { d.artSlots["home.season"] = { pick: "a" }; },
    "todo.autoChecked": (d) => { d.todo.autoChecked["2026-09-24"] = { a: 1 }; },
    "dayReview.days (a note)": (d) => { d.dayReview = d.dayReview || {}; d.dayReview.days = { "2026-09-24": { evening: { note: "A good day" } } }; }
  };
  Object.keys(cases).forEach((name) => {
    const d = fresh();
    cases[name](d);
    assert(K.cloudsync.userData(d), name + " alone must count as user data");
  });
  const seen = fresh();
  seen.dayReview = seen.dayReview || {};
  seen.dayReview.days = { "2026-09-24": { morning: { seenAt: 1 }, afternoon: { state: "folded" }, words: { morning: { text: "Hi", at: 1 } } } };
  eq(K.cloudsync.userData(seen), null, "seen, folded and the review's words are not");
});

step("K · the copy from before the first link is pinned: later pulls never overwrite it", async () => {
  const sv = makeServer();
  const { app, K, sync } = await linkedApp(sv, "user-k");
  K.reminders.add({ title: "Before linking" });
  sv.state = { state_json: remoteDoc({ progress: PROG }), updated_at: sv.stamp() };
  await sync();
  assert(K.store.state.progress["maths:cloud-marker"], "linked and merged");
  otherDevicePush(sv, (d) => d.reminders.items.push({ id: 901, title: "Later, elsewhere", created: 9 }));
  await sync();
  assert(TITLES(K).indexOf("Later, elsewhere") >= 0, "a later pull landed");
  const last = await p((cb) => K.cloudsync.preReplaced(cb));
  assert(last && last.state.progress["maths:cloud-marker"], "the rolling copy now holds the linked device");
  assert(K.cloudsync.preLinked, "KOS.cloudsync.preLinked exists");
  const first = await p((cb) => K.cloudsync.preLinked(cb));
  assert(first && first.state, "the pre-link copy is still there");
  assert(!first.state.progress["maths:cloud-marker"], "and it is the device as it was BEFORE it was linked");
  eq(titles(first.state.reminders.items), ["Before linking"], "with its own data");
  assert(first.user, "it names what the device held: " + first.user);
  eq(app.errors, [], "no page errors");
});

step("L · a first-link backup that cannot verify backs off, and the user may link without it", async () => {
  const sv = makeServer();
  const { app, K, sync } = await linkedApp(sv, "user-l");
  K.reminders.add({ title: "Device reminder" });
  sv.state = { state_json: remoteDoc({ progress: PROG }), updated_at: sv.stamp() };
  const real = K.backup.checkpoint;
  let asked = 0;
  K.backup.checkpoint = () => { asked++; return Promise.resolve({ ok: false, id: null, reason: "the saved copy could not be read back" }); };
  assert(K.cloudsync._cycle, "the cycle seam exists");
  const auto = (why) => run(app, new Promise((res) => K.cloudsync._cycle(why, (err) => res(err || null))));
  let err = await auto("auth");
  assert(err && /not linked yet/.test(err.message), "the link stopped: " + (err && err.message));
  eq(asked, 1, "one backup tried");
  err = await auto("interval");
  eq(asked, 1, "the next automatic cycle does NOT start another full backup");
  assert(err && /not linked yet/.test(err.message), "and still says why: " + (err && err.message));
  await auto("focus");
  eq(asked, 1, "nor the one after");
  await sync().catch(() => null);                       /* Sync now: the user asked */
  eq(asked, 2, "a manual sync tries again");
  await sync().catch(() => null);
  eq(asked, 3, "and again");
  const blocked = K.cloudsync.linkBlocked && K.cloudsync.linkBlocked();
  assert(blocked && blocked.n === 3 && /read back/.test(blocked.reason), "the block is readable: " + JSON.stringify(blocked));
  assert(!K.store.state.progress["maths:cloud-marker"], "nothing was combined without a backup");
  await run(app, p((cb) => K.cloudsync.linkWithoutBackup(cb)));
  eq(asked, 3, "the consent links without asking for a backup");
  assert(K.store.state.progress["maths:cloud-marker"], "the account's data combined in");
  assert(sv.state.state_json.reminders.items.some((r) => r.title === "Device reminder"), "and the device's reached the account");
  eq(K.cloudsync.linkBlocked(), null, "no longer blocked");
  const pre = await p((cb) => K.cloudsync.preLinked(cb));
  eq(titles(pre.state.reminders.items), ["Device reminder"], "the pinned pre-link copy is still taken");
  K.backup.checkpoint = real;
  eq(app.errors, [], "no page errors");
});

step("L · one attachment that cannot be read no longer fails the whole backup", async () => {
  const app = await boot();
  const K = app.KOS;
  await app.settle();
  /* fake-indexeddb's structured clone strips a jsdom Blob (smoke13), which
     is exactly a stored blob the browser can no longer read */
  await run(app, p((cb) => K.attach.add("compsci", "4.1.1", new app.window.File(["hello"], "lost.pdf", { type: "application/pdf" }), cb)));
  const items = await run(app, p((cb) => K.attach.exportAll(cb)));
  eq(items.map((i) => [i.name, i.blobBase64, !!i.unreadable]), [["lost.pdf", null, true]], "it rides the backup by its record, marked unreadable");
  const cp = await run(app, K.backup.checkpoint("with an unreadable file"));
  assert(cp.ok, "the checkpoint verifies: " + JSON.stringify(cp.reason));
  eq(cp.unreadable, ["lost.pdf"], "and names the file it could not read");
  eq(app.errors, [], "no page errors");
});

const { sharedStorage, fakeLocks: sharedLocks } = require("./lib/app-harness");
step("M · two tabs of one account: the cloud cycle runs one tab at a time and a pulled change counts once", async () => {
  const sv = makeServer(), ls = sharedStorage(), locks = sharedLocks();
  const fake = require("fake-indexeddb");
  const idb = new fake.IDBFactory();
  const api = makeApi(sv);
  async function tab(seed) {
    const app = await boot({ localStorage: ls, indexedDB: idb, locks, seed });
    await app.settle();
    app.KOS.cloudsync._config({ api, session: { userId: "user-m", email: "m@test" }, quiet: true,
      pushDebounce: 10 * 60 * 1000, minPullGap: 0, bootDelay: 0 });
    return app;
  }
  const t1 = await tab(1), t2 = await tab(2);
  async function both(p1, p2) {
    let n = 0;
    const d = () => { n++; };
    p1.then(d, d); p2.then(d, d);
    for (let i = 0; i < 600 && n < 2; i++) { await t1.settle(); await t2.settle(); ls.deliver(); }
    for (let i = 0; i < 6; i++) { await t1.settle(); await t2.settle(); ls.deliver(); }
    return Promise.all([p1, p2]);
  }
  const syncOf = (t) => p((cb) => t.KOS.cloudsync.syncNow(cb));
  t1.KOS.reminders.add({ title: "Mine" });
  await both(syncOf(t1), syncOf(t2));
  assert(sv.state, "linked");
  const gold0 = sv.state.state_json.governor.gold || 0;
  otherDevicePush(sv, (d) => {
    d.governor.gold = gold0 + 50; d.governor.xp = (d.governor.xp || 0) + 100;
    d.sessions.push({ id: 7001, ts: Date.parse("2026-09-24T09:30:00Z"), date: "2026-09-24", type: "todo", metrics: {}, award: { xp: 100, gold: 50 } });
  });
  locks.log.length = 0;
  await both(syncOf(t1), syncOf(t2));
  const name = "kos-cloudsync" + ((t1.KOS.dataMode && t1.KOS.dataMode.suffix) || "");
  eq(locks.log.filter((l) => l === "grant " + name).length, 2, "each tab's cycle ran under the account's one lock");
  eq([t1.KOS.store.state.governor.gold, t2.KOS.store.state.governor.gold], [gold0 + 50, gold0 + 50], "both tabs hold the pulled gold once");
  eq(JSON.parse(ls.getItem("kurenai-os-v1")).governor.gold, gold0 + 50, "so does the stored document");
  await both(syncOf(t1), syncOf(t2));
  eq(sv.state.state_json.governor.gold, gold0 + 50, "and the account");
  eq(sv.state.state_json.sessions.filter((e) => e.id === 7001).length, 1, "with the session once");
  eq(t1.errors.concat(t2.errors), [], "no page errors");
});

const MINED = { mL: { text: "猫が好きです。", reading: "ねこがすきです。", en: "I like cats.", src: { kind: "anime", title: "A show" }, at: 1700000000000 } };
step("N · lines mined on a device still on the old version: taken in here, and never deleted from its copy", async () => {
  const sv = makeServer();
  const { app, K, sync } = await linkedApp(sv, "user-n");
  K.reminders.add({ title: "Mine" });
  await sync();
  /* the old version keeps mined lines in the state document and pushes them */
  otherDevicePush(sv, (d) => { d.japanese = d.japanese || {}; d.japanese.mined = JSON.parse(JSON.stringify(MINED)); });
  await sync();
  assert(!("mined" in K.store.state.japanese), "this device's state holds no mined text");
  const rows = await run(app, K.jaMined.all());
  eq(rows.map((l) => [l.id, l.text, l.at]), [["mL", MINED.mL.text, MINED.mL.at]], "the line was taken into this device's own store");
  K.reminders.add({ title: "A later edit here" });
  await sync();
  const doc = sv.state.state_json;
  assert(doc.reminders.items.some((r) => r.title === "A later edit here"), "this device pushed");
  eq(doc.japanese && doc.japanese.mined, MINED, "and the document it pushed still carries the old device's lines, unchanged");
  /* a second line from the old device, after ours */
  otherDevicePush(sv, (d) => { d.japanese.mined.mM = { text: "犬もいい。", at: 1700000001000 }; });
  K.reminders.add({ title: "Dirty during the pull" });
  await sync();
  eq(Object.keys(sv.state.state_json.japanese.mined).sort(), ["mL", "mM"], "a merge passes the newer map through too");
  eq((await run(app, K.jaMined.all())).map((l) => l.id).sort(), ["mL", "mM"], "and takes the new line in");
  eq(app.errors, [], "no page errors");
});

const PNG = (bytes) => "data:image/png;base64," + Buffer.from(bytes).toString("base64");
const OLD_PIC = PNG([137, 80, 78, 71, 1, 1, 1]), NEW_PIC = PNG([137, 80, 78, 71, 2, 2, 2, 2]);
step("O · the picture move waits for this session's first pull, and a newer picture from an old device wins", async () => {
  const sv = makeServer();
  const { app, K, sync } = await linkedApp(sv, "user-o");
  app.window.Blob = Blob;                               /* bytes that survive fake-indexeddb (smoke134) */
  const g = K.store.state.governor;
  g.avatar = { kind: "custom", id: "seal-ember", img: OLD_PIC, crop: null, frame: null };
  K.store.save();
  assert(K.cloudsync.settled, "KOS.cloudsync.settled exists");
  eq(K.cloudsync.settled(), false, "signed in and not pulled yet: not settled");
  const early = await run(app, K.repairs.runAuto());
  eq(g.avatar.img, OLD_PIC, "the move does not run before the first pull: " + JSON.stringify(early[K.profilePics.REPAIR] || null));
  await sync();
  eq(K.cloudsync.settled(), true, "settled after the first good cycle");
  for (let i = 0; i < 400 && g.avatar.img; i++) await app.settle();
  eq(g.avatar.img, null, "then the move runs by itself");
  const F = g.avatar.file;
  assert(F, "leaving the reference");
  /* the old-version device uploads a NEW picture before it hears of the move */
  otherDevicePush(sv, (d) => { d.governor.avatar = { kind: "custom", id: "seal-ember", img: NEW_PIC, crop: null, frame: null }; });
  await sync();
  for (let i = 0; i < 400 && K.store.state.governor.avatar.img; i++) await app.settle();
  await sync();
  const a = K.store.state.governor.avatar;
  assert(a.file && a.file !== F && !a.img, "the newer picture took the slot and was moved: " + JSON.stringify({ file: a.file, img: !!a.img }));
  const rec = await run(app, p((cb) => K.attach.getByFileId(a.file, cb)));
  eq(Array.from(new Uint8Array(await rec.blob.arrayBuffer())), [137, 80, 78, 71, 2, 2, 2, 2], "its bytes are the NEW picture's");
  const ca = sv.state.state_json.governor.avatar;
  assert(ca.img === NEW_PIC || ca.file === a.file, "the account never lost it: " + JSON.stringify({ img: !!ca.img, file: ca.file }));
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
