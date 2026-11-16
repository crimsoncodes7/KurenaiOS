/* Kurenai OS — smoke143.test.js
   W1 RC6: Todoist and Google bookkeeping (quality audit findings DI-01,
   DI-05, DI-06, DI-07, DI-08, DI-12, DI-16, DI-17, DI-23; invariants
   33a and 157–160).

   The claims:

     A · DI-01 — ONE REMINDER, ONE TASK. The account's document is taken in
         before a provider is read and sent before the lease is given up;
         a second device whose link arrives with it imports nothing; a
         reminder not linked yet is LINKED to its task, never imported as a
         second one; two reminders on one task fold into the same one on
         every device.
     B · DI-05 — A FULL READ ONLY ADDS. Linking another list re-reads
         Todoist whole; a ticked sub-task (which a full read leaves out) is
         neither removed here nor sent again as a new one.
     C · DI-06 — A REPEAT TODOIST OWNS IS CLOSED THERE. Ticking one sends
         item_close, never a new due string; Todoist's next date comes back
         in the same cycle; a rule only Todoist can read behaves the same;
         Undo before the sync takes the close back.
     D · DI-07 — A RE-KEYED RECORD TAKES ITS REFERENCES WITH IT: goals, an
         exam's link, a session and its stretches, the running Focus
         session, the Daily Review's picks and triage.
     E · DI-08 — "NOT FOUND" NEVER DELETES. A 404 on an update unlinks the
         reminder or event and keeps it; connecting a different account
         clears the old links and deletes nothing; the same account picks
         up where it left.
     F · DI-12 — A REFUSED COMMAND IS NAMED AND NOT SENT AGAIN UNCHANGED.
         Connections says how many and why; "not found" unlinks; a refused
         deletion waits a day.
     G · DI-16 — A MOVE MADE IN TODOIST moves the reminder here and is not
         undone; a move made here moves the task.
     H · DI-17 — A REMINDER MOVED OUT OF ITS SERVICE'S LISTS takes its
         remote copy with it and is not copied or orphaned; unlinking or
         deleting a list unlinks its reminders and deletes nothing there.
     I · DI-23 — A REMINDER DELETED HERE does not come back for a cycle
         when its task was edited there meanwhile.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke143.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const B32HEX = /^[0-9a-v]{5,1024}$/;
const ACCESS = { google: "ya29.GOOGLEACCESS", todoist: "TODOISTACCESS1" };

/* ---------------- a fake Todoist (the Sync API) ----------------
   Like Todoist: a full read holds only what is open; item_close on a
   repeating task rolls its date (to `st.nextDue`) instead of finishing it;
   `st.reject[id]` makes every command on that task fail with that error. */
function fakeTodoist(log) {
  const st = { seq: 0, items: {}, projects: [{ id: "P1", name: "School" }, { id: "P2", name: "Home" }], calls: [], reads: [], uuids: {}, reject: {}, nextDue: "2026-11-06" };
  function res(status, json) { return Promise.resolve({ ok: status < 300, status, text: () => Promise.resolve(JSON.stringify(json)) }); }
  st.put = (it) => { st.items[it.id] = Object.assign({ checked: false, is_deleted: false, priority: 1, labels: [], description: "", parent_id: null, child_order: 1 }, st.items[it.id] || {}, it, { seq: ++st.seq }); return st.items[it.id]; };
  st.cmds = () => st.calls.reduce((a, b) => a.concat(b), []);
  st.fetch = (url, init) => {
    if ((init.headers || {}).Authorization !== "Bearer " + ACCESS.todoist) return res(401, {});
    const form = new URLSearchParams(init.body), out = {};
    if (form.get("commands")) {
      const cmds = JSON.parse(form.get("commands"));
      st.calls.push(cmds);
      if (log) log.push("td:write");
      out.sync_status = {}; out.temp_id_mapping = {};
      cmds.forEach((c) => {
        if (st.uuids[c.uuid]) { out.sync_status[c.uuid] = "ok"; Object.assign(out.temp_id_mapping, st.uuids[c.uuid]); return; }
        const a = c.args, map = {};
        if (a.id && st.reject[a.id]) { out.sync_status[c.uuid] = st.reject[a.id]; return; }
        const real = (id) => out.temp_id_mapping[id] || id;
        if (c.type === "item_add") {
          /* a sub-task is in its parent's project, as in Todoist */
          const id = "T" + (++st.seq), parent = a.parent_id ? real(a.parent_id) : null;
          map[c.temp_id] = id; out.temp_id_mapping[c.temp_id] = id;
          st.put(Object.assign({}, a, { id, parent_id: parent, project_id: a.project_id || (parent && st.items[parent] ? st.items[parent].project_id : undefined), child_order: st.seq }));
        }
        else if (c.type === "item_update") st.put(Object.assign({}, a));
        else if (c.type === "item_close") {
          const cur = st.items[a.id];
          if (cur && cur.due && cur.due.is_recurring) st.put({ id: a.id, due: Object.assign({}, cur.due, { date: st.nextDue }), closed: (cur.closed || 0) + 1 });
          else st.put({ id: a.id, checked: true });
        }
        else if (c.type === "item_uncomplete") st.put({ id: a.id, checked: false });
        else if (c.type === "item_delete") st.put({ id: a.id, is_deleted: true });
        else if (c.type === "item_move") { st.put({ id: a.id, project_id: a.project_id }); Object.values(st.items).forEach((k) => { if (k.parent_id === a.id) st.put({ id: k.id, project_id: a.project_id }); }); }
        st.uuids[c.uuid] = map;
        out.sync_status[c.uuid] = "ok";
      });
      return res(200, out);
    }
    const tok = form.get("sync_token"), since = tok === "*" ? 0 : +tok.slice(1);
    st.reads.push(tok);
    if (log) log.push("td:read");
    const types = JSON.parse(form.get("resource_types") || "[]");
    /* a whole read ("*") holds only what is open; a read by token holds every change */
    if (types.indexOf("items") !== -1) out.items = Object.values(st.items).filter((i) => i.seq > since && (tok !== "*" || (!i.checked && !i.is_deleted)));
    if (types.indexOf("projects") !== -1) out.projects = st.projects;
    out.full_sync = tok === "*";
    out.sync_token = "t" + st.seq;
    return res(200, out);
  };
  return st;
}
function fakeGtasks() {
  const st = { seq: 0, lists: { L1: {} }, calls: [] };
  function res(status, json) { return Promise.resolve({ ok: status < 300, status, text: () => Promise.resolve(json === undefined ? "" : JSON.stringify(json)) }); }
  function stamp(t) { t.updated = new Date(Date.UTC(2026, 9, 29, 10, 0, ++st.seq)).toISOString(); return t; }
  st.put = (l, t) => { st.lists[l][t.id] = stamp(Object.assign({ status: "needsAction" }, st.lists[l][t.id] || {}, t)); return st.lists[l][t.id]; };
  st.fetch = (url, init) => {
    init = init || {};
    const m = init.method || "GET", u = new URL(url), p = decodeURIComponent(u.pathname.replace("/tasks/v1", ""));
    const body = init.body ? JSON.parse(init.body) : null;
    st.calls.push({ m, p, body });
    if ((init.headers || {}).Authorization !== "Bearer " + ACCESS.google) return res(401, {});
    let mm;
    if (p === "/users/@me/lists") return res(200, { items: [{ id: "L1", title: "My Tasks" }] });
    if ((mm = /^\/lists\/([^/]+)\/tasks$/.exec(p))) {
      const L = st.lists[mm[1]];
      if (m === "POST") { const id = "gt" + (++st.seq); return res(200, st.put(mm[1], Object.assign({}, body, { id, parent: u.searchParams.get("parent") || undefined }))); }
      const since = u.searchParams.get("updatedMin");
      return res(200, { items: Object.values(L).filter((t) => !since || t.updated >= since) });
    }
    if ((mm = /^\/lists\/([^/]+)\/tasks\/([^/]+)$/.exec(p))) {
      const L = st.lists[mm[1]], t = L[mm[2]];
      if (!t) return res(404, {});
      if (m === "PATCH") return res(200, st.put(mm[1], Object.assign({}, body, { id: t.id })));
      if (m === "DELETE") { st.put(mm[1], { id: t.id, deleted: true }); return res(204); }
    }
    return res(404, {});
  };
  return st;
}
function fakeGcal() {
  const st = { seq: 0, cals: { primary: {} }, calls: [] };
  function bump(ev) { ev.seq = ++st.seq; ev.etag = '"e' + st.seq + '"'; return ev; }
  function res(status, json) { return Promise.resolve({ ok: status < 300, status, text: () => Promise.resolve(json === undefined ? "" : JSON.stringify(json)) }); }
  st.fetch = (url, init) => {
    init = init || {};
    const m = init.method || "GET", u = new URL(url), p = decodeURIComponent(u.pathname.replace("/calendar/v3", ""));
    const body = init.body ? JSON.parse(init.body) : null;
    st.calls.push({ m, p, body });
    let mm;
    if ((mm = /^\/calendars\/([^/]+)\/events\/([^/]+)\/instances$/.exec(p))) return res(200, { items: [] });
    if ((mm = /^\/calendars\/([^/]+)\/events$/.exec(p))) {
      const cal = st.cals[mm[1]];
      if (!cal) return res(404, {});
      if (m === "POST") {
        const id = body.id || "g" + (++st.seq);
        if (!B32HEX.test(id)) return res(400, {});
        if (cal[id]) return res(409, {});
        cal[id] = bump(Object.assign({ status: "confirmed" }, body, { id }));
        return res(200, cal[id]);
      }
      const tok = u.searchParams.get("syncToken"), since = tok ? +tok.slice(1) : 0;
      return res(200, { items: Object.values(cal).filter((e) => e.seq > since).map((e) => JSON.parse(JSON.stringify(e))), nextSyncToken: "s" + st.seq });
    }
    if ((mm = /^\/calendars\/([^/]+)\/events\/([^/]+)$/.exec(p))) {
      const cal = st.cals[mm[1]] || {}, ev = cal[mm[2]];
      if (m === "GET") return ev ? res(200, ev) : res(404, {});
      if (m === "PATCH") {
        if (st.gone && st.gone[mm[2]]) return res(410, {});
        if (!ev) return res(404, {});
        Object.keys(body).forEach((k) => { ev[k] = body[k]; });
        return res(200, bump(ev));
      }
      if (m === "DELETE") { if (!ev) return res(410, {}); ev.status = "cancelled"; bump(ev); return res(204); }
    }
    return res(404, {});
  };
  return st;
}

/* ---------------- a device ---------------- */
async function device(env, seed) {
  const app = await boot({ clock: "2026-10-29T10:00:00", seed: seed || 143 });
  const K = app.KOS, X = K.ext;
  K.cloud.signedIn = () => true; K.cloud.userId = () => "u1";
  const d = { app, K, X, log: env.log, cloud: () => {} };
  X._setEdge((body) => {
    if (body.action === "token") return Promise.resolve({ token: ACCESS[body.provider], expires_at: new app.window.Date(app.window.Date.now() + 3600e3).toISOString() });
    if (body.action === "lease") { env.log.push("lease"); return Promise.resolve({ ok: true }); }
    if (body.action === "release") { env.log.push("release"); return Promise.resolve({ ok: true }); }
    if (body.action === "start") return Promise.resolve({ url: "https://example.test/auth?state=" + body.state });
    if (body.action === "complete") return Promise.resolve({ account: env.account[body.provider], scopes: "https://www.googleapis.com/auth/tasks" });
    if (body.action === "unlink") return Promise.resolve({ ok: true });
    return Promise.reject(new Error("?"));
  });
  X._setCloud(() => { env.log.push("cloud"); return d.cloud(); });
  const plain = app.window.fetch;
  app.window.fetch = (url, init) => {
    const s = String(url);
    if (s.indexOf("https://www.googleapis.com/calendar/v3") === 0) return env.gc.fetch(url, init);
    if (s.indexOf("https://api.todoist.com/") === 0) return env.td.fetch(url, init);
    if (s.indexOf("https://tasks.googleapis.com/") === 0) return env.gt.fetch(url, init);
    return plain(url, init);
  };
  d.connect = async (p) => {
    app.window.sessionStorage.setItem("kos.ext.state", "ext-" + p + "-abcdefabcdef12");
    return X.complete(new URLSearchParams("code=CODE123456&state=ext-" + p + "-abcdefabcdef12"));
  };
  d.sync = async (p) => { const r = await X.syncProvider(p || "todoist", "test"); for (let i = 0; i < 4; i++) await app.settle(); return r; };
  d.rem = (title) => K.reminders.all().filter((x) => x.title === title);
  if (app.errors.length) throw new Error("boot errors: " + app.errors[0]);
  return d;
}
function world() {
  const log = [];
  return { log, td: fakeTodoist(log), gt: fakeGtasks(), gc: fakeGcal(), account: { google: "kai@example.com", todoist: "kai@example.com" } };
}
/* a device with Todoist connected and School → P1 */
async function school(env, seed) {
  const d = await device(env || world(), seed);
  const c = await d.connect("todoist");
  assert(c.ok && d.X.S().todoist.on, "Todoist connected");
  d.list = d.K.reminders.addList("School");
  d.K.extTasks.link(d.list.id, "todoist", { id: "P1", name: "School" });
  return d;
}
const types = (env) => env.td.cmds().map((c) => c.type);

/* ---------------- A ---------------- */
step("A · the account's document is taken in before the provider is read, and sent before the lease is given up", async () => {
  const env = world(), d = await school(env);
  d.K.reminders.add({ title: "Made on A", listId: d.list.id });
  env.log.length = 0;
  const r = await d.sync();
  assert(r.ok, "the cycle: " + JSON.stringify(r));
  eq(env.log, ["lease", "cloud", "td:read", "td:write", "cloud", "release"], "the order of one cycle");
  eq(env.td.reads, ["*"], "a first cycle reads Todoist whole, once");
  /* the cycle it asks for is an AUTOMATIC one (it keeps the first link's
     backup backoff), never "Sync now"; a cloud that cannot answer does not
     stop the provider's cycle */
  const asked = [];
  d.X._setCloud(null);
  d.K.cloudsync.cycleNow = (cb) => { asked.push("cycleNow"); cb(asked.length === 1 ? new Error("offline") : null); };
  d.K.cloudsync.syncNow = () => { asked.push("syncNow"); };
  d.K.cloudsync.isRunning = () => false;
  d.K.reminders.add({ title: "Second", listId: d.list.id });
  env.td.calls.length = 0;
  const r2 = await d.sync();
  eq([asked, r2.ok, types(env)], [["cycleNow", "cycleNow"], true, ["item_add"]], "two automatic cycles, and the push went ahead after the first failed");
});
step("A · a second device whose link arrives with the lease imports nothing; an unlinked twin is linked, not imported", async () => {
  const env = world(), a = await school(env, 1);
  const made = a.K.reminders.add({ title: "Made on A", listId: a.list.id, priority: 2 });
  a.K.reminders.subAdd(made.id, "Section B");
  await a.sync();
  const onA = a.K.reminders.get(made.id);
  assert(onA.ext && onA.ext.id && onA.subs[0].x, "linked on A, the sub-task too");
  /* device B: the same list and link; A's reminder arrives WITH its link
     when B asks for the account's document, as the cycle now does first */
  const b = await school(env, 2);
  b.cloud = () => {
    if (b.rem("Made on A").length) return;
    b.X.inbound(() => b.K.reminders.add({ title: onA.title, listId: b.list.id, priority: onA.priority, uid: onA.uid, subs: onA.subs, ext: onA.ext }));
  };
  env.td.calls.length = 0;
  await b.sync();
  eq(b.rem("Made on A").map((x) => x.ext && x.ext.id), [onA.ext.id], "one reminder on B, linked to A's task");
  eq(types(env), [], "B sent nothing");
  /* device C: the reminder arrived BEFORE its link, and no document comes */
  const c = await school(env, 3);
  const twin = c.K.reminders.add({ title: "Made on A", listId: c.list.id, priority: 2, uid: onA.uid });
  c.K.reminders.subAdd(twin.id, "Section B");
  env.td.calls.length = 0;
  await c.sync();
  const onC = c.rem("Made on A");
  eq(onC.map((x) => [x.id, x.ext && x.ext.id]), [[twin.id, onA.ext.id]], "the one reminder C held is linked to the task");
  eq(onC[0].subs.map((x) => x.x), [onA.subs[0].x], "its sub-task took the remote one's id");
  eq(types(env), [], "and C added nothing to Todoist");
  eq(Object.values(env.td.items).filter((i) => i.content === "Made on A" && !i.is_deleted).length, 1, "one task in Todoist");
});
step("A · two reminders on one task fold into the smaller uid, on every device alike, and delete nothing there", async () => {
  const env = world(), d = await school(env);
  const K = d.K;
  const uids = ["bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"];
  d.X.inbound(() => {
    K.reminders.add({ title: "Twice", listId: d.list.id, uid: uids[0], alerts: [10], completions: [1790000000000], ext: { p: "todoist", id: "T60", list: "P1", base: null } });
    K.reminders.add({ title: "Twice", listId: d.list.id, uid: uids[1], ext: { p: "todoist", id: "T60", list: "P1", base: null } });
  });
  eq(d.rem("Twice").length, 2, "two before");
  eq(K.extTasks.foldTwins("todoist"), 1, "one fold");
  const left = d.rem("Twice");
  eq(left.map((x) => [x.uid, x.alerts, x.completions]), [[uids[1], [10], [1790000000000]]], "the smaller uid stays, with the other's alerts and history");
  eq(Object.keys(d.X.S().deletes), [], "nothing is queued for deletion there");
  eq(K.extTasks.foldTwins("todoist"), 0, "a second pass folds nothing");
});

/* ---------------- B ---------------- */
step("B · linking another list re-reads Todoist whole: a ticked sub-task is neither removed here nor sent again", async () => {
  const env = world(), d = await school(env), K = d.K;
  const essay = K.reminders.add({ title: "Essay", listId: d.list.id });
  K.reminders.subAdd(essay.id, "Plan"); K.reminders.subAdd(essay.id, "Draft");
  await d.sync();
  const subs0 = K.reminders.get(essay.id).subs;
  assert(subs0.every((s) => s.x), "both sub-tasks linked");
  env.td.put({ id: subs0[0].x, checked: true });
  await d.sync();
  eq(K.reminders.get(essay.id).subs.map((s) => [s.text, s.done]), [["Plan", true], ["Draft", false]], "ticked there, ticked here");
  /* a second list is linked: the cycle reads the changes, then everything */
  const home = K.reminders.addList("Home");
  K.extTasks.link(home.id, "todoist", { id: "P2", name: "Home" });
  env.td.reads.length = 0; env.td.calls.length = 0;
  await d.sync();
  eq(env.td.reads.length, 2, "two reads: " + env.td.reads);
  assert(env.td.reads[0] !== "*" && env.td.reads[1] === "*", "the changes first, then the whole: " + env.td.reads);
  eq(K.reminders.get(essay.id).subs.map((s) => [s.text, s.done]), [["Plan", true], ["Draft", false]], "the ticked sub-task survived the full read");
  eq(types(env), [], "and nothing was sent");
  /* edited here as well, then another full read */
  K.reminders.subAdd(essay.id, "Proofread");
  K.extTasks.link(home.id, "todoist", null);
  env.td.calls.length = 0;
  await d.sync();
  const adds = env.td.cmds().filter((c) => c.type === "item_add");
  eq(adds.map((c) => c.args.content), ["Proofread"], "only the new sub-task is added");
  const tid = K.reminders.get(essay.id).ext.id;
  eq(Object.values(env.td.items).filter((i) => i.parent_id === tid && !i.is_deleted).map((i) => i.content).sort(), ["Draft", "Plan", "Proofread"], "three sub-tasks there, none twice");
  eq(K.reminders.get(essay.id).subs.map((s) => s.text), ["Plan", "Draft", "Proofread"], "and three here");
  /* a device that never read them: the reminder arrives with its link, and
     that device's FIRST read is whole, so the ticked sub-task is not in it */
  const onA = K.reminders.get(essay.id);
  K.extTasks.link(d.list.id, "todoist", { id: "P1", name: "School" });
  const b = await school(env, 7);
  b.cloud = () => { if (!b.rem("Essay").length) b.X.inbound(() => b.K.reminders.add({ title: onA.title, listId: b.list.id, uid: onA.uid, subs: onA.subs, ext: onA.ext })); };
  env.td.calls.length = 0; env.td.reads.length = 0;
  await b.sync();
  eq(env.td.reads, ["*"], "the new device reads Todoist whole");
  eq(b.rem("Essay")[0].subs.map((s) => [s.text, s.done]), [["Plan", true], ["Draft", false], ["Proofread", false]], "the ticked sub-task is still there on the new device");
  eq(types(env), [], "and the new device sent nothing");
  await b.sync();
  eq([b.rem("Essay")[0].subs.length, types(env)], [3, []], "nor on its next cycle");
});

/* ---------------- C ---------------- */
step("C · ticking a repeat Todoist owns sends item_close, never a due string, and its next date comes back at once", async () => {
  const env = world(), d = await school(env), K = d.K;
  const r0 = K.reminders.add({ title: "Laundry", listId: d.list.id, due: "2026-10-29", recur: "weekly" });
  await d.sync();
  const linked = K.reminders.get(r0.id);
  assert(linked.ext.id, "linked");
  const nS = K.store.state.sessions.length;
  K.reminders.complete(r0.id, true);
  let cur = K.reminders.get(r0.id);
  eq([cur.done, cur.due, cur.ext.close, cur.ext.cn, cur.ext.closeDue], [false, "2026-11-05", 1, 1, "2026-11-05"], "rolled here, one close to send");
  eq(K.store.state.sessions.slice(nS).map((s) => s.type), ["todo"], "paid once, as any tick");
  env.td.calls.length = 0; env.td.reads.length = 0;
  const res = await d.sync();
  const cmds = env.td.cmds();
  eq(cmds.map((c) => c.type), ["item_close"], "one close and nothing else");
  eq(cmds[0].uuid, d.X.uuidOf("close|" + cur.uid + "|1"), "named once, so a retry is the same command");
  eq(res.counts.todoist.closed, 1, "counted");
  eq(env.td.reads.length, 2, "read again after the close");
  cur = K.reminders.get(r0.id);
  eq([cur.due, cur.done, cur.recur, cur.ext.close, cur.ext.closeDue], ["2026-11-06", false, "weekly", undefined, undefined], "Todoist's next date, in the same cycle");
  eq(env.td.items[cur.ext.id].closed, 1, "closed once there");
  /* the echo */
  env.td.calls.length = 0;
  await d.sync();
  eq(types(env), [], "the echo sends nothing");
});
step("C · a rule only Todoist can read behaves the same, and Undo before the sync takes the close back", async () => {
  const env = world(), d = await school(env), K = d.K;
  env.td.put({ id: "T901", content: "Gym", project_id: "P1", due: { date: "2026-11-02", is_recurring: true, string: "every mon, fri" } });
  await d.sync();
  const gym = d.rem("Gym")[0];
  eq([gym.recur, gym.ext.rs], [null, "x:every mon, fri"], "Todoist's rule kept");
  K.reminders.complete(gym.id, true);
  let cur = K.reminders.get(gym.id);
  eq([cur.done, cur.due, cur.ext.close], [false, "2026-11-02", 1], "not closed for good: it keeps its date until Todoist's arrives");
  env.td.calls.length = 0;
  await d.sync();
  eq(types(env), ["item_close"], "closed there");
  cur = K.reminders.get(gym.id);
  eq([cur.done, cur.due, cur.ext.rs, cur.ext.close], [false, "2026-11-06", "x:every mon, fri", undefined], "and it has Todoist's next date");
  /* Undo before the sync */
  const u = K.reminders.completeUndoable(gym.id);
  eq(K.reminders.get(gym.id).ext.close, 1, "a close queued");
  u.undo();
  eq(K.reminders.get(gym.id).ext.close, undefined, "taken back");
  env.td.calls.length = 0;
  await d.sync();
  eq(types(env), [], "nothing is sent for a tick that was undone");
  /* a reminder Todoist does not own rolls as it always did */
  const own = K.reminders.add({ title: "Water plants", due: "2026-10-29", recur: "daily" });
  K.reminders.complete(own.id, true);
  eq([K.reminders.get(own.id).due, K.reminders.get(own.id).ext], ["2026-10-30", null], "an unlinked repeat is this app's own");
});

/* ---------------- D ---------------- */
step("D · a re-keyed assignment, event, reminder and plan row take every reference with them", async () => {
  const d = await device(world()), M = d.K.cloudmerge;
  const base = { assignments: { items: [], nextId: 1 }, reminders: { items: [], lists: [], nextId: 1 }, calendar: { events: [], nextId: 1, notified: {} }, pacing: { entries: [], nextId: 1 }, goals: { items: [], nextId: 1 }, sessions: [] };
  const local = JSON.parse(JSON.stringify(base));
  local.assignments = { nextId: 2, items: [{ id: 1, title: "Local essay", subject: "compsci", due: "2026-11-10", created: "2026-10-28", status: "inProgress" }] };
  local.reminders = { nextId: 2, lists: [], items: [{ id: 1, title: "Local reminder", due: "2026-11-01", created: "2026-10-28", uid: "a".repeat(32) }] };
  local.calendar = { nextId: 2, notified: {}, events: [{ id: 1, title: "Local block", date: "2026-11-03", time: "16:00", type: "study", assignmentId: 1, created: "2026-10-28" }] };
  local.pacing = { nextId: 2, entries: [{ id: "p1", title: "Local plan row", wb: "2026-10-26", subject: "maths", kind: "personal" }] };
  local.goals = { nextId: 3, items: [{ id: 1, type: "assignment", title: "Finish it", links: { assignmentId: 1 } }, { id: 2, type: "event", title: "Be there", links: { eventId: 1 } }] };
  local.exams = { v: 1, assessments: { x1: { id: "x1", title: "NEA", links: { assignmentId: 1 } } } };
  local.sessions = [{ id: 1, ts: 1790000000000, date: "2026-10-28", type: "focus", dur: 30, metrics: { assignmentId: 1, segments: [{ subject: "compsci", assignmentId: 1, secs: 900 }, { subject: "maths", assignmentId: null, secs: 900 }] } }];
  local.focus = { active: { assignmentId: 1, segs: [{ assignmentId: 1, w: 0 }] } };
  local.dayReview = { days: { "2026-10-29": {
    morning: { three: [{ kind: "assignment", id: 1 }, { kind: "reminder", id: 1 }, { kind: "plan", id: "p1" }], first: { kind: "event", id: 1, action: "" } },
    evening: { tomorrow: { first: { kind: "assignment", id: 1, action: "open it" } }, triaged: { "assignment:1": "tomorrow", "reminder:1": "week", "topic:compsci:4.1.1.1": "week" } } } } };
  const remote = JSON.parse(JSON.stringify(base));
  remote.assignments = { nextId: 2, items: [{ id: 1, title: "Remote lab report", subject: "it", due: "2026-12-01", created: "2026-10-20", status: "notStarted" }] };
  remote.reminders = { nextId: 2, lists: [], items: [{ id: 1, title: "Remote reminder", due: "2026-12-05", created: "2026-10-21", uid: "b".repeat(32) }] };
  remote.calendar = { nextId: 2, notified: {}, events: [{ id: 1, title: "Remote dentist", date: "2026-12-09", time: "09:00", type: "personal", created: "2026-10-22" }] };
  remote.pacing = { nextId: 2, entries: [{ id: "p1", title: "Remote plan row", wb: "2026-11-02", subject: "it", kind: "school" }] };
  remote.goals = { nextId: 2, items: [{ id: 1, type: "assignment", title: "Remote goal", links: { assignmentId: 1 } }] };
  const r = M.merge(base, local, remote);
  assert(r.rekeyed >= 4, "the four collisions were re-keyed: " + r.rekeyed);
  const doc = r.doc, by = (arr, t) => arr.filter((x) => x.title === t)[0];
  const asg = by(doc.assignments.items, "Local essay"), rem = by(doc.reminders.items, "Local reminder"), ev = by(doc.calendar.events, "Local block"), row = by(doc.pacing.entries, "Local plan row");
  assert(asg.id !== 1 && rem.id !== 1 && ev.id !== 1 && row.id !== "p1", "each local record has a new id: " + [asg.id, rem.id, ev.id, row.id]);
  eq(by(doc.assignments.items, "Remote lab report").id, 1, "the other device's assignment keeps its id");
  eq(ev.assignmentId, asg.id, "the study block");
  eq(by(doc.goals.items, "Finish it").links.assignmentId, asg.id, "the goal's assignment");
  eq(by(doc.goals.items, "Be there").links.eventId, ev.id, "the goal's event");
  eq(by(doc.goals.items, "Remote goal").links.assignmentId, 1, "the other device's goal still means ITS assignment");
  eq(doc.exams.assessments.x1.links.assignmentId, asg.id, "the exam's coursework link");
  const ses = doc.sessions.filter((s) => s.type === "focus")[0];
  eq([ses.metrics.assignmentId, ses.metrics.segments.map((s) => s.assignmentId)], [asg.id, [asg.id, null]], "the session and its stretches");
  eq([doc.focus.active.assignmentId, doc.focus.active.segs[0].assignmentId], [asg.id, asg.id], "the Focus session running on this device");
  const day = doc.dayReview.days["2026-10-29"];
  eq(day.morning.three.map((x) => x.id), [asg.id, rem.id, row.id], "today's three");
  eq([day.morning.first.id, day.evening.tomorrow.first.id], [ev.id, asg.id], "the first tasks");
  eq(Object.keys(day.evening.triaged).sort(), ["assignment:" + asg.id, "reminder:" + rem.id, "topic:compsci:4.1.1.1"].sort(), "the triage map's keys");
});

/* ---------------- E ---------------- */
step("E · a 404 on an update unlinks the reminder and keeps it (Google Tasks); it is sent again as a new task", async () => {
  const env = world(), d = await device(env), K = d.K;
  await d.connect("google");
  d.X.S().google.tasks = true; d.X.S().google.cal = false; d.X.S().google.export.on = false;
  K.extTasks.link(null, "gtasks", { id: "L1", name: "My Tasks" });
  const r0 = K.reminders.add({ title: "Return library book", due: "2026-11-07" });
  await d.sync("google");
  const gid = K.reminders.get(r0.id).ext.id;
  assert(gid, "linked");
  delete env.gt.lists.L1[gid];                         // not there any more, and no pull says it was deleted
  K.reminders.update(r0.id, { title: "Return the library book" });
  const res = await d.sync("google");
  const cur = K.reminders.get(r0.id);
  assert(cur, "the reminder is still here");
  eq([cur.title, cur.ext], ["Return the library book", { gen: 1 }], "kept, unlinked (only the count of unlinkings is left)");
  eq(res.counts.tasks.unlinked, 1, "and counted");
  await d.sync("google");
  const again = K.reminders.get(r0.id);
  assert(again.ext && again.ext.id && again.ext.id !== gid, "sent again as a new task");
  eq(Object.values(env.gt.lists.L1).filter((t) => !t.deleted).map((t) => t.title), ["Return the library book"], "one task there");
});
step("E · a 404 unlinks a Calendar event and keeps it; a 410 (Google says deleted) removes it", async () => {
  const env = world(), d = await device(env), K = d.K;
  await d.connect("google");
  d.X.S().google.tasks = false; d.X.S().google.export.on = false;
  const e1 = K.calendar.addEvent({ title: "Revision block", date: "2026-11-02", time: "16:00", endTime: "17:00" });
  const e2 = K.calendar.addEvent({ title: "Open evening", date: "2026-11-04", time: "18:00", endTime: "19:00" });
  await d.sync("google");
  const g1 = K.calendar.getEvent(e1.id).ext.g.id, g2 = K.calendar.getEvent(e2.id).ext.g.id;
  assert(g1 && g2, "both linked");
  delete env.gc.cals.primary[g1];
  env.gc.gone = {}; env.gc.gone[g2] = true;
  K.calendar.updateEvent(e1.id, { title: "Revision block (moved)" });
  K.calendar.updateEvent(e2.id, { title: "Open evening (moved)" });
  const res = await d.sync("google");
  const kept = K.calendar.getEvent(e1.id);
  assert(kept && kept.title === "Revision block (moved)", "the event Google could not find is kept");
  assert(!(kept.ext && kept.ext.g && kept.ext.g.id), "unlinked: " + JSON.stringify(kept.ext));
  eq(res.counts.calendar.unlinked, 1, "counted");
  assert(!K.calendar.getEvent(e2.id), "the one Google says was deleted is removed here");
});
step("E · the same account picks up where it left; a different account clears the links and deletes nothing", async () => {
  const env = world(), d = await school(env), K = d.K;
  const r0 = K.reminders.add({ title: "Past paper 2", listId: d.list.id });
  await d.sync();
  const tid = K.reminders.get(r0.id).ext.id;
  /* disconnect, then the same account */
  await d.X.disconnect("todoist");
  eq([d.X.S().todoist.on, d.X.S().todoist.was], [false, "kai@example.com"], "disconnected, the account remembered");
  let c = await d.connect("todoist");
  eq([c.ok, !!c.other, K.reminders.get(r0.id).ext.id, K.extTasks.linkOfList(d.list.id).id], [true, false, tid, "P1"], "the same account keeps every link");
  env.td.calls.length = 0;
  await d.sync();
  eq(types(env), [], "and sends nothing");
  /* a reminder deleted while connected is queued; then ANOTHER account */
  const r1 = K.reminders.add({ title: "To delete", listId: d.list.id });
  await d.sync();
  K.reminders.remove(r1.id);
  assert(Object.keys(d.X.S().deletes).length === 1, "one deletion queued");
  await d.X.disconnect("todoist");
  env.account.todoist = "other@example.com";
  env.td.calls.length = 0;
  c = await d.connect("todoist");
  eq([c.ok, c.other, d.X.S().todoist.account], [true, true, "other@example.com"], "a different account is noticed");
  const cur = K.reminders.get(r0.id);
  assert(cur && cur.title === "Past paper 2", "the reminder is still here");
  eq([cur.ext, K.extTasks.linkOfList(d.list.id), Object.keys(d.X.S().deletes)], [{ gen: 1 }, null, []], "its link, the list's link and the queue are cleared");
  await d.sync();
  eq(types(env), [], "nothing is deleted, moved or added in the new account until a list is linked");
  assert(!env.td.items[tid].is_deleted, "the old account's task was not touched");
});

/* ---------------- F ---------------- */
step("F · a refused command is counted and named, and not sent again until the reminder changes; not found unlinks", async () => {
  const env = world(), d = await school(env), K = d.K;
  const r0 = K.reminders.add({ title: "Past paper 2", listId: d.list.id });
  const r1 = K.reminders.add({ title: "Buy folders", listId: d.list.id });
  await d.sync();
  const t0 = K.reminders.get(r0.id).ext.id, t1 = K.reminders.get(r1.id).ext.id;
  env.td.reject[t0] = { error_code: 40, error: "Invalid label name", http_code: 400 };
  K.reminders.update(r0.id, { tags: ["bad label"] });
  K.reminders.update(r1.id, { priority: 2 });
  env.td.calls.length = 0;
  let res = await d.sync();
  eq([res.ok, res.counts.todoist.refused, res.counts.todoist.refusedWhy, res.counts.todoist.pushed], [true, 1, "Invalid label name", 1], "one refused and named, the other went up");
  eq(K.reminders.get(r1.id).ext.base.priority, 2, "the one Todoist took is rebased on its own");
  assert(K.reminders.get(r0.id).ext.refused, "the refusal is remembered on the reminder");
  /* Connections says so */
  d.K.show("connections");
  await d.app.settle(); await d.app.settle();
  const line = d.app.document.querySelector("[data-ui='cx.todoist-status']");
  assert(line && /1 change refused \(Invalid label name\)/.test(line.textContent), "Connections names it: " + (line && line.textContent));
  /* not sent again unchanged, still shown */
  env.td.calls.length = 0;
  res = await d.sync();
  eq([types(env), res.counts.todoist.refused], [[], 1], "nothing is sent again, and it is still reported");
  /* changed: sent again */
  delete env.td.reject[t0];
  K.reminders.update(r0.id, { tags: ["cs"] });
  env.td.calls.length = 0;
  res = await d.sync();
  eq([types(env), res.counts.todoist.refused, K.reminders.get(r0.id).ext.refused], [["item_update"], undefined, undefined], "after an edit it goes, and the refusal is cleared");
  /* not found: unlinked, kept, and added again as a new task */
  env.td.reject[t1] = { error_code: 22, error: "Item not found", http_code: 404 };
  K.reminders.update(r1.id, { title: "Buy ring binders" });
  res = await d.sync();
  const cur = K.reminders.get(r1.id);
  assert(cur && cur.title === "Buy ring binders", "the reminder is kept");
  eq([cur.ext, res.counts.todoist.unlinked], [{ gen: 1 }, 1], "unlinked and counted");
  env.td.calls.length = 0;
  await d.sync();
  eq(types(env), ["item_add"], "then sent as a new task");
  assert(env.td.cmds()[0].uuid !== d.X.uuidOf("add|" + cur.uid), "under a new command id, not the first add's (which Todoist would answer with the task that is gone)");
  assert(K.reminders.get(r1.id).ext.id && K.reminders.get(r1.id).ext.id !== t1, "linked to the new task: " + JSON.stringify(K.reminders.get(r1.id).ext));
  eq(Object.values(env.td.items).filter((i) => i.content === "Buy ring binders" && !i.is_deleted).length, 1, "one such task there");
});
step("F · a deletion Todoist refuses is asked again a day later, not every cycle; one already gone is dropped", async () => {
  const env = world(), d = await school(env), K = d.K;
  const r0 = K.reminders.add({ title: "One", listId: d.list.id }), r1 = K.reminders.add({ title: "Two", listId: d.list.id });
  await d.sync();
  const t0 = K.reminders.get(r0.id).ext.id, t1 = K.reminders.get(r1.id).ext.id;
  env.td.reject[t0] = { error_code: 500, error: "Try again later", http_code: 500 };
  env.td.reject[t1] = { error_code: 22, error: "Item not found", http_code: 404 };
  K.reminders.remove(r0.id); K.reminders.remove(r1.id);
  let res = await d.sync();
  const q = d.X.S().deletes;
  eq(Object.keys(q), ["todoist:task:" + t0], "the one already gone is dropped; the refused one waits");
  assert(q["todoist:task:" + t0].refusedAt, "with the time it was refused");
  eq(res.counts.todoist.refused, 1, "counted");
  env.td.calls.length = 0;
  await d.sync();
  eq(types(env), [], "not asked again the next cycle");
  q["todoist:task:" + t0].refusedAt -= 25 * 3600 * 1000;
  delete env.td.reject[t0];
  await d.sync();
  eq([types(env), Object.keys(d.X.S().deletes)], [["item_delete"], []], "asked again a day later, and done");
});

/* ---------------- G ---------------- */
step("G · a move made in Todoist moves the reminder here and is not undone; a move made here moves the task", async () => {
  const env = world(), d = await school(env), K = d.K;
  const home = K.reminders.addList("Home");
  K.extTasks.link(home.id, "todoist", { id: "P2", name: "Home" });
  const r0 = K.reminders.add({ title: "Past paper 2", listId: d.list.id });
  await d.sync();
  const tid = K.reminders.get(r0.id).ext.id;
  env.td.put({ id: tid, project_id: "P2" });
  env.td.calls.length = 0;
  await d.sync();
  let cur = K.reminders.get(r0.id);
  eq([cur.listId, cur.ext.list], [home.id, "P2"], "the reminder followed to Home");
  eq(types(env), [], "and no move was sent back");
  eq(env.td.items[tid].project_id, "P2", "the task is where it was moved");
  /* moved here */
  K.reminders.update(r0.id, { listId: d.list.id });
  assert(K.reminders.get(r0.id).ext.id === tid, "a move inside one service keeps the link");
  env.td.calls.length = 0;
  await d.sync();
  eq(env.td.cmds().map((c) => [c.type, c.args.project_id]), [["item_move", "P1"]], "the task is moved");
  cur = K.reminders.get(r0.id);
  eq([cur.listId, cur.ext.list, env.td.items[tid].project_id], [d.list.id, "P1", "P1"], "both sides agree");
  /* moved on BOTH sides: this app's wins */
  K.reminders.update(r0.id, { listId: home.id });
  env.td.put({ id: tid, content: "Past paper 2 (renamed there)" });
  env.td.calls.length = 0;
  await d.sync();
  cur = K.reminders.get(r0.id);
  eq([cur.listId, cur.title, env.td.items[tid].project_id], [home.id, "Past paper 2 (renamed there)", "P2"], "the rename came down and the move went up");
});

/* ---------------- H ---------------- */
step("H · moved to a list with no link, the reminder takes its Todoist task with it and is not synced or copied", async () => {
  const env = world(), d = await school(env), K = d.K;
  const plain = K.reminders.addList("Plain");
  const r0 = K.reminders.add({ title: "Past paper 2", listId: d.list.id });
  await d.sync();
  const tid = K.reminders.get(r0.id).ext.id;
  K.reminders.update(r0.id, { listId: plain.id });
  eq([K.reminders.get(r0.id).ext, Object.keys(d.X.S().deletes)], [{ gen: 1 }, ["todoist:task:" + tid]], "unlinked, its task queued for deletion");
  env.td.calls.length = 0;
  await d.sync();
  eq([types(env), env.td.items[tid].is_deleted], [["item_delete"], true], "deleted there");
  K.reminders.update(r0.id, { title: "Past paper 2, edited" });
  env.td.calls.length = 0;
  await d.sync();
  eq([types(env), d.rem("Past paper 2, edited").length, K.reminders.all().length], [[], 1, 1], "an edit is not sent, and nothing came back as a second reminder");
});
step("H · moved to a list linked to the other service: one reminder, one task in the new service, none left in the old", async () => {
  const env = world(), d = await school(env), K = d.K;
  await d.connect("google");
  d.X.S().google.tasks = true; d.X.S().google.cal = false; d.X.S().google.export.on = false;
  const g = K.reminders.addList("Errands");
  K.extTasks.link(g.id, "gtasks", { id: "L1", name: "My Tasks" });
  const r0 = K.reminders.add({ title: "Post parcel", listId: d.list.id });
  await d.sync();
  const tid = K.reminders.get(r0.id).ext.id;
  K.reminders.update(r0.id, { listId: g.id });
  await d.sync("todoist"); await d.sync("google");
  const cur = K.reminders.get(r0.id);
  eq([cur.ext.p, K.reminders.all().length], ["gtasks", 1], "one reminder, now Google's");
  eq(env.td.items[tid].is_deleted, true, "its Todoist task is gone");
  eq(Object.values(env.gt.lists.L1).filter((t) => !t.deleted).map((t) => t.title), ["Post parcel"], "one task in Google Tasks");
  await d.sync("todoist"); await d.sync("google");
  eq(K.reminders.all().length, 1, "and still one after another round");
});
step("H · unlinking a list, or deleting it, unlinks its reminders and deletes nothing there", async () => {
  const env = world(), d = await school(env), K = d.K;
  const home = K.reminders.addList("Home");
  K.extTasks.link(home.id, "todoist", { id: "P2", name: "Home" });
  const r0 = K.reminders.add({ title: "In School", listId: d.list.id }), r1 = K.reminders.add({ title: "In Home", listId: home.id });
  await d.sync();
  const t0 = K.reminders.get(r0.id).ext.id, t1 = K.reminders.get(r1.id).ext.id;
  K.extTasks.link(d.list.id, "todoist", null);
  eq([K.reminders.get(r0.id).ext, K.reminders.get(r0.id).listId], [{ gen: 1 }, d.list.id], "unlinked with its list, still in it");
  K.reminders.deleteList(home.id);
  eq([K.reminders.get(r1.id).ext, K.reminders.get(r1.id).listId], [{ gen: 1 }, null], "the deleted list's reminder is kept, unlinked, with no list");
  eq(Object.keys(d.X.S().deletes), [], "nothing queued for deletion");
  env.td.calls.length = 0;
  await d.sync();
  eq([types(env), env.td.items[t0].is_deleted, env.td.items[t1].is_deleted], [[], false, false], "nothing sent, both tasks still there");
  /* edits are not sent from an unlinked list, and a rename there does not land */
  K.reminders.update(r0.id, { title: "In School, edited" });
  env.td.put({ id: t0, content: "Renamed there" });
  env.td.calls.length = 0;
  await d.sync();
  eq([types(env), K.reminders.get(r0.id).title, K.reminders.all().length], [[], "In School, edited", 2], "the two are separate now");
  /* linked again: the same thing on both sides meets, it is not doubled */
  K.reminders.update(r0.id, { title: "Renamed there" });
  K.extTasks.link(d.list.id, "todoist", { id: "P1", name: "School" });
  env.td.calls.length = 0;
  await d.sync();
  eq([K.reminders.get(r0.id).ext.id, d.rem("Renamed there").length, types(env)], [t0, 1, []], "linked back to its own task, nothing added");
});

/* ---------------- I ---------------- */
step("I · a reminder deleted here does not come back when its task was edited there before the cycle", async () => {
  const env = world(), d = await school(env), K = d.K;
  const r0 = K.reminders.add({ title: "Past paper 2", listId: d.list.id });
  await d.sync();
  const tid = K.reminders.get(r0.id).ext.id;
  K.reminders.remove(r0.id);
  env.td.put({ id: tid, content: "Past paper 2, edited there" });
  env.td.calls.length = 0;
  await d.sync();
  eq(K.reminders.all().map((x) => x.title), [], "it did not come back");
  eq([types(env), env.td.items[tid].is_deleted], [["item_delete"], true], "and it was deleted there");
  /* Google Tasks: the same */
  await d.connect("google");
  d.X.S().google.tasks = true; d.X.S().google.cal = false; d.X.S().google.export.on = false;
  K.extTasks.link(null, "gtasks", { id: "L1", name: "My Tasks" });
  const g0 = K.reminders.add({ title: "Return library book" });
  await d.sync("google");
  const gid = K.reminders.get(g0.id).ext.id;
  K.reminders.remove(g0.id);
  env.gt.put("L1", { id: gid, title: "Return library book, edited there" });
  await d.sync("google");
  eq([K.reminders.all().map((x) => x.title), env.gt.lists.L1[gid].deleted], [[], true], "Google Tasks: not imported again, deleted there");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack || e)); }
  }
  console.log(failed ? `\n${failed} of ${steps.length} step(s) failed` : `\nall ${steps.length} steps passed`);
  process.exit(failed ? 1 : 0);
})();
