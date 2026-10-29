/* Kurenai OS — smoke109.test.js
   Google Calendar, Google Tasks and Todoist (roadmap 5.15,
   docs/integrations-plan.md; invariants 157–160).

   The claims:

     A · IDS: a record gets a 32-hex `uid` at birth, a record from before
         derives the same one on every device, and every Google event id is
         base32hex (a–v, 0–9, 5–1024) — a hyphenated UUID is cleaned, a
         short string hashed.
     B · THE THREE-WAY RULE: one side changed takes that side; both, this
         app's; no base, the caller's lead.
     C · THE PAGE reads only: drawing Connections writes nothing.
     D · THE CALENDAR MAPPING: the five repeats read and written (BYDAY,
         INTERVAL=2, COUNT and UNTIL), several days, past midnight, another
         rule or RDATE are read-only, EXDATE becomes a skipped date, and a
         local event survives the round trip unchanged.
     E · TWO-WAY with a fake Google: a local event goes up under its
         gcalId; Google's echo pushes NOTHING; a pull's write never
         schedules a push (noteLocal is silent inside inbound); a remote
         edit comes down; a local edit goes up with If-Match and only its
         field; both edited, this app's wins; a remote event is imported, one
         carrying another device's kosUid is not; a remote cancel deletes
         here without queueing; a local delete goes through the queue; a
         rule this calendar can't hold is drawn read-only, and a moved
         showing is skipped on the record and drawn at its new time; a 409
         links instead of copying; two links to one event fold to one.
     F · THE EXPORT: the "KurenaiOS" calendar is made once; what the
         Calendar derives goes there; an unchanged second cycle writes
         nothing; a finished item is removed; bills carry no amount.
     G · TODOIST with a fake server: a linked list's reminder goes up as
         item_add (its command id derived from the uid) with its sub-task;
         the echo sends nothing; a remote completion ticks it here and logs
         ONE todo session that pays NOTHING; a remote task is imported with
         priority, labels and time; a local edit goes up as item_update of
         that field only; a rule this app can't hold is kept as Todoist
         wrote it; a local delete goes up as item_delete.
     H · GOOGLE TASKS: the reminders with no list link to a task list; the
         date goes up without the time; a remote completion ticks it here.
     I · SIGN-IN: blocked signed out; a return with another state is
         refused; the access token lives in memory only (not the kv, the
         state document or a backup); GitHub's return handler leaves a
         Google return alone. THE SERVER: redirects only to the app, an
         offline Google consent, the JWT checked, nothing logged, RLS on
         with no policy, the lease callable by the service role only.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke109.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const ROOT = path.join(__dirname, "..");
const B32HEX = /^[0-9a-v]{5,1024}$/;

let app, K, X;
const ACCESS = { google: "ya29.GOOGLEACCESS", todoist: "TODOISTACCESS1" };

/* ---------------- a fake Google Calendar ---------------- */
function fakeGcal() {
  const st = { seq: 0, cals: { primary: {} }, calls: [], instances: {} };
  function bump(ev) { ev.seq = ++st.seq; ev.etag = '"e' + st.seq + '"'; ev.htmlLink = "https://calendar.google.com/event?eid=" + ev.id; return ev; }
  function res(status, json) { return Promise.resolve({ ok: status < 300, status, text: () => Promise.resolve(json === undefined ? "" : JSON.stringify(json)) }); }
  st.put = (cal, ev) => { st.cals[cal] = st.cals[cal] || {}; st.cals[cal][ev.id] = bump(Object.assign({ status: "confirmed" }, ev)); return st.cals[cal][ev.id]; };
  st.fetch = (url, init) => {
    init = init || {};
    const m = init.method || "GET", u = new URL(url), p = decodeURIComponent(u.pathname.replace("/calendar/v3", ""));
    const body = init.body ? JSON.parse(init.body) : null;
    st.calls.push({ m, p, q: u.search, body, h: init.headers || {} });
    if ((init.headers || {}).Authorization !== "Bearer " + ACCESS.google) return res(401, {});
    let mm;
    if (m === "POST" && p === "/calendars") { const id = "kos" + (++st.seq) + "@group.calendar.google.com"; st.cals[id] = {}; return res(200, { id }); }
    if ((mm = /^\/calendars\/([^/]+)$/.exec(p)) && m === "GET") return st.cals[mm[1]] ? res(200, { id: mm[1] }) : res(404, {});
    if ((mm = /^\/calendars\/([^/]+)\/events\/([^/]+)\/instances$/.exec(p))) return res(200, { items: st.instances[mm[2]] || [] });
    if ((mm = /^\/calendars\/([^/]+)\/events$/.exec(p))) {
      const cal = st.cals[mm[1]];
      if (!cal) return res(404, {});
      if (m === "POST") {
        const id = body.id || "g" + (++st.seq);
        if (!B32HEX.test(id)) return res(400, { error: "Invalid resource id value." });
        if (cal[id]) return res(409, {});
        return res(200, st.put(mm[1], Object.assign({}, body, { id })));
      }
      const tok = u.searchParams.get("syncToken");
      const since = tok ? +tok.slice(1) : 0;
      const items = Object.values(cal).filter((e) => e.seq > since).map((e) => JSON.parse(JSON.stringify(e)));
      return res(200, { items, nextSyncToken: "s" + st.seq });
    }
    if ((mm = /^\/calendars\/([^/]+)\/events\/([^/]+)$/.exec(p))) {
      const cal = st.cals[mm[1]] || {}, ev = cal[mm[2]];
      if (m === "GET") return ev ? res(200, ev) : res(404, {});
      if (m === "DELETE") { if (!ev || ev.status === "cancelled") return res(410, {}); ev.status = "cancelled"; bump(ev); return res(204); }
      if (m === "PUT") { if (!ev) return res(404, {}); return res(200, st.put(mm[1], Object.assign({ id: ev.id }, body))); }
      if (m === "PATCH") {
        if (!ev) return res(404, {});
        if (init.headers["If-Match"] && init.headers["If-Match"] !== ev.etag) return res(412, {});
        Object.keys(body).forEach((k) => { ev[k] = body[k]; });
        return res(200, bump(ev));
      }
    }
    return res(404, {});
  };
  return st;
}

/* ---------------- a fake Todoist ---------------- */
function fakeTodoist() {
  const st = { seq: 0, items: {}, projects: [{ id: "P1", name: "School" }, { id: "P2", name: "Home" }], calls: [], uuids: {} };
  function res(status, json) { return Promise.resolve({ ok: status < 300, status, text: () => Promise.resolve(JSON.stringify(json)) }); }
  st.put = (it) => { st.items[it.id] = Object.assign({ checked: false, is_deleted: false, priority: 1, labels: [], description: "", parent_id: null, child_order: 1 }, st.items[it.id] || {}, it, { seq: ++st.seq }); return st.items[it.id]; };
  st.fetch = (url, init) => {
    if ((init.headers || {}).Authorization !== "Bearer " + ACCESS.todoist) return res(401, {});
    const form = new URLSearchParams(init.body), out = {};
    if (form.get("commands")) {
      const cmds = JSON.parse(form.get("commands"));
      st.calls.push(cmds);
      out.sync_status = {}; out.temp_id_mapping = {};
      cmds.forEach((c) => {
        if (st.uuids[c.uuid]) { out.sync_status[c.uuid] = "ok"; Object.assign(out.temp_id_mapping, st.uuids[c.uuid]); return; }
        const a = c.args, map = {};
        const real = (id) => out.temp_id_mapping[id] || id;
        if (c.type === "item_add") { const id = "T" + (++st.seq); map[c.temp_id] = id; out.temp_id_mapping[c.temp_id] = id; st.put(Object.assign({}, a, { id, parent_id: a.parent_id ? real(a.parent_id) : null, child_order: st.seq })); }
        else if (c.type === "item_update") st.put(Object.assign({}, a));
        else if (c.type === "item_close") st.put({ id: a.id, checked: true });
        else if (c.type === "item_uncomplete") st.put({ id: a.id, checked: false });
        else if (c.type === "item_delete") st.put({ id: a.id, is_deleted: true });
        else if (c.type === "item_move") st.put({ id: a.id, project_id: a.project_id });
        st.uuids[c.uuid] = map;
        out.sync_status[c.uuid] = "ok";
      });
      return res(200, out);
    }
    const tok = form.get("sync_token"), since = tok === "*" ? 0 : +tok.slice(1);
    const types = JSON.parse(form.get("resource_types") || "[]");
    if (types.indexOf("items") !== -1) out.items = Object.values(st.items).filter((i) => i.seq > since && (since || (!i.checked && !i.is_deleted)));
    if (types.indexOf("projects") !== -1) out.projects = st.projects;
    out.full_sync = tok === "*";
    out.sync_token = "t" + st.seq;
    return res(200, out);
  };
  return st;
}

/* ---------------- a fake Google Tasks ---------------- */
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

let gc, td, gt, edgeCalls;
const saved = () => JSON.parse(JSON.stringify(Object.assign({}, K.store.state, { ui: null })));
step("boot", async () => {
  app = await boot({ clock: "2026-10-29T10:00:00" });
  K = app.KOS; X = K.ext;
  K.cloud.signedIn = () => true; K.cloud.userId = () => "u1";
  edgeCalls = [];
  X._setEdge((body) => {
    edgeCalls.push(body.action);
    if (body.action === "token") return Promise.resolve({ token: ACCESS[body.provider], expires_at: new app.window.Date(app.window.Date.now() + 3600e3).toISOString() });
    if (body.action === "lease" || body.action === "release") return Promise.resolve({ ok: true });
    if (body.action === "start") return Promise.resolve({ url: "https://accounts.google.com/o/oauth2/v2/auth?state=" + body.state });
    if (body.action === "complete") return Promise.resolve({ account: body.provider === "google" ? "kai@example.com" : "Kai", scopes: "https://www.googleapis.com/auth/tasks" });
    if (body.action === "unlink") return Promise.resolve({ ok: true });
    return Promise.reject(new Error("?"));
  });
  gc = fakeGcal(); td = fakeTodoist(); gt = fakeGtasks();
  const plain = app.window.fetch;
  app.window.fetch = (url, init) => {
    const s = String(url);
    if (s.indexOf("https://www.googleapis.com/calendar/v3") === 0) return gc.fetch(url, init);
    if (s.indexOf("https://api.todoist.com/") === 0) return td.fetch(url, init);
    if (s.indexOf("https://tasks.googleapis.com/") === 0) return gt.fetch(url, init);
    return plain(url, init);
  };
  eq(app.errors, [], "boot errors");
});

step("A · ids", () => {
  const ev = K.calendar.addEvent({ title: "Uid check", date: "2026-11-02" });
  assert(X.uidOk(ev.uid), "an event has a uid at birth: " + ev.uid);
  assert(B32HEX.test(X.gcalId(ev.uid)) && X.gcalId(ev.uid) === ev.uid, "a uid is already a Google id");
  const hy = X.gcalId("123E4567-E89B-12D3-A456-426614174000");
  assert(B32HEX.test(hy) && hy.indexOf("-") < 0 && hy === hy.toLowerCase(), "a hyphenated UUID is cleaned: " + hy);
  assert(B32HEX.test(X.gcalId("xyz")), "a short id is hashed into range");
  assert(B32HEX.test(X.gcalId("wxyz-wxyz-wxyz")), "letters past v are dropped, then hashed when too short");
  const legacy = { id: 7, created: 1700000000000 };
  eq(X.legacyUid("ev", legacy), X.legacyUid("ev", Object.assign({}, legacy)), "a record from before derives the same uid everywhere");
  const upd = K.calendar.updateEvent(ev.id, { title: "Uid check 2" });
  eq(upd.uid, ev.uid, "an edit keeps the uid");
  const r = K.reminders.add({ title: "Uid reminder" });
  assert(X.uidOk(r.uid), "a reminder has a uid too");
  assert(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/.test(X.uuidOf("x")), "a Todoist command id is UUID-shaped");
  K.calendar.deleteEvent(ev.id); K.reminders.remove(r.id);
});

step("B · the three-way rule", () => {
  const F = ["a", "b", "c"];
  let m = X.merge3({ a: 1, b: 2, c: 3 }, { a: 1, b: 9, c: 3 }, { a: 1, b: 2, c: 3 }, F);
  eq([m.pull, m.push, m.merged.b], [["b"], [], 9], "a remote change comes down");
  m = X.merge3({ a: 5, b: 2, c: 3 }, { a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 }, F);
  eq([m.pull, m.push], [[], ["a"]], "a local change goes up");
  m = X.merge3({ a: 5, b: 2, c: 3 }, { a: 6, b: 2, c: 3 }, { a: 1, b: 2, c: 3 }, F);
  eq([m.push, m.merged.a], [["a"], 5], "both changed: this app's wins");
  m = X.merge3({ a: 5 }, { a: 6 }, null, ["a"]);
  eq(m.pull, ["a"], "no base: the remote by default");
  m = X.merge3({ a: 5 }, { a: 6 }, null, ["a"], true);
  eq(m.push, ["a"], "no base, local leads: ours");
});

step("C · the page reads only", async () => {
  const before = JSON.stringify(saved());
  K.show("connections"); for (let i = 0; i < 4; i++) await app.settle();
  K.rerender(); for (let i = 0; i < 4; i++) await app.settle();
  const $ = (s) => app.document.querySelector(s);
  assert($("[data-ui~='cx.google']") && $("[data-ui~='cx.todoist']") && $("[data-ui~='cx.lists']"), "the three cards");
  assert($("[data-ui~='cx.google-connect']"), "Connect Google offered");
  eq(JSON.stringify(saved()), before, "drawing Connections wrote nothing");
});

step("D · the calendar mapping", () => {
  const G = K.extGcal;
  eq(G.parseRule("FREQ=WEEKLY;BYDAY=TH", "2026-10-29"), { recur: "weekly", until: null }, "weekly on its own day");
  eq(G.parseRule("FREQ=WEEKLY;BYDAY=MO", "2026-10-29"), null, "weekly on another day: no word for it");
  eq(G.parseRule("FREQ=WEEKLY;INTERVAL=2", "2026-10-29").recur, "fortnightly", "every two weeks");
  eq(G.parseRule("FREQ=DAILY;COUNT=5", "2026-10-29").until, "2026-11-02", "a count is an end date");
  eq(G.parseRule("FREQ=MONTHLY;UNTIL=20261231T235959Z", "2026-10-29").until, "2026-12-31", "UNTIL in UTC");
  eq(G.parseRule("FREQ=MONTHLY;BYDAY=1MO", "2026-10-29"), null, "the first Monday: no word for it");
  eq(G.fromRemote({ start: { date: "2026-10-29" }, end: { date: "2026-11-01" } }), null, "several days: read-only");
  eq(G.fromRemote({ start: { dateTime: "2026-10-29T22:00:00Z" }, end: { dateTime: "2026-10-30T02:00:00Z" } }), null, "past midnight: read-only");
  eq(G.fromRemote({ start: { date: "2026-10-29" }, end: { date: "2026-10-30" }, recurrence: ["RRULE:FREQ=DAILY", "RDATE:20261201"] }), null, "RDATE: read-only");
  const ex = G.fromRemote({ start: { date: "2026-10-29" }, end: { date: "2026-10-30" }, recurrence: ["RRULE:FREQ=WEEKLY", "EXDATE;VALUE=DATE:20261105"] });
  eq([ex.f.rule.recur, ex.skip, ex.rx.length], ["weekly", ["2026-11-05"], 1], "EXDATE is a skipped date, kept to send back");
  const local = { title: "Physics", date: "2026-11-03", time: "09:15", endTime: "10:45", allDay: false, recur: "fortnightly", recurUntil: "2027-03-30",
    location: "Lab 2", description: "Bring goggles", alerts: [15, 1440] };
  const L = G.fromLocal(local), body = G.toBody(L, G.FIELDS);
  assert(/^RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=2027033\dT\d{6}Z$/.test(body.recurrence[0]), "the rule written: " + body.recurrence[0]);
  eq(body.reminders, { useDefault: false, overrides: [{ method: "popup", minutes: 15 }, { method: "popup", minutes: 1440 }] }, "alerts map to popups");
  const back = G.fromRemote({ summary: body.summary, location: body.location, description: body.description, reminders: body.reminders, recurrence: body.recurrence,
    start: { dateTime: "2026-11-03T09:15:00Z" }, end: { dateTime: "2026-11-03T10:45:00Z" } });
  eq(back.f, L, "a local event survives the round trip");
  eq(G.fromLocal({ title: "x", date: "2026-11-03", allDay: true, alerts: [] }).alerts, [], "no alerts");
  eq(G.toBody(G.fromLocal({ title: "x", date: "2026-11-03", allDay: true, alerts: [] }), ["alerts"]).reminders, { useDefault: true }, "no alerts is Google's default");
});

let evA;
async function gsync() { const r = await X.syncProvider("google", "test"); for (let i = 0; i < 4; i++) await app.settle(); return r; }
step("E · two-way with Google Calendar", async () => {
  /* connect: the round trip through the function */
  const r = await X.connect("google");
  assert(r.ok, "connect: " + JSON.stringify(r));
  const state = app.window.sessionStorage.getItem("kos.ext.state");
  assert(/^ext-google-[0-9a-f]{24}$/.test(state), "a one-time state: " + state);
  const done = await X.complete(new URLSearchParams("code=4/0AbCdEf&state=" + state));
  eq([done.ok, X.S().google.on, X.S().google.account], [true, true, "kai@example.com"], "connected");
  X.S().google.export.on = false; X.S().google.tasks = false;

  evA = K.calendar.addEvent({ title: "Revision block", date: "2026-11-02", time: "16:00", endTime: "17:30", recur: "weekly", alerts: [15], location: "Library" });
  let res = await gsync();
  assert(res.ok, "the first cycle: " + JSON.stringify(res));
  const gid = X.gcalId(evA.uid);
  const remoteA = gc.cals.primary[gid];
  assert(remoteA && remoteA.summary === "Revision block", "pushed under its gcalId");
  eq(remoteA.extendedProperties.private.kosUid, evA.uid, "it carries its uid");
  evA = K.calendar.getEvent(evA.id);
  eq([evA.ext.g.id, evA.ext.g.etag], [gid, remoteA.etag], "linked");

  /* the echo: Google returns it in the next incremental list → nothing pushed */
  gc.calls.length = 0;
  let scheduled = 0; const real = X.noteLocal;
  X.noteLocal = function (k) { const r2 = real(k); if (r2) scheduled++; return r2; };
  K.ext.noteLocal = X.noteLocal;
  await gsync();
  eq(gc.calls.filter((c) => c.m !== "GET").length, 0, "the echo pushes nothing");

  /* a remote edit comes down; the pull's write schedules nothing */
  gc.put("primary", Object.assign({}, gc.cals.primary[gid], { summary: "Revision · maths" }));
  gc.calls.length = 0;
  await gsync();
  eq(K.calendar.getEvent(evA.id).title, "Revision · maths", "a remote edit comes down");
  eq(gc.calls.filter((c) => c.m !== "GET").length, 0, "and is not pushed back");
  eq(scheduled, 0, "a pull's write never schedules a push");
  eq(X.isInbound(), false, "inbound ends with the pull");

  /* a local edit goes up with If-Match and only its field */
  K.calendar.updateEvent(evA.id, { location: "Room 12" });
  eq(scheduled, 1, "a local edit does schedule one");
  gc.calls.length = 0;
  await gsync();
  const patch = gc.calls.filter((c) => c.m === "PATCH");
  eq(patch.length, 1, "one PATCH");
  eq(Object.keys(patch[0].body), ["location"], "only the field that changed");
  assert(/^"e\d+"$/.test(patch[0].h["If-Match"]), "If-Match sent");
  X.noteLocal = real; K.ext.noteLocal = real;

  /* both changed: this app's wins */
  gc.put("primary", Object.assign({}, gc.cals.primary[gid], { summary: "Theirs" }));
  K.calendar.updateEvent(evA.id, { title: "Mine" });
  await gsync();
  eq([K.calendar.getEvent(evA.id).title, gc.cals.primary[gid].summary], ["Mine", "Mine"], "both edited: this app's wins on both sides");

  /* imported; another device's not */
  gc.put("primary", { id: "remoteb1", summary: "Dentist", start: { date: "2026-11-04" }, end: { date: "2026-11-05" } });
  gc.put("primary", { id: "remotec1", summary: "In flight", start: { date: "2026-11-04" }, end: { date: "2026-11-05" }, extendedProperties: { private: { kosUid: "f".repeat(32) } } });
  await gsync();
  const imp = K.store.state.calendar.events.filter((e) => e.ext && e.ext.g && e.ext.g.id === "remoteb1");
  eq([imp.length, imp[0] && imp[0].type, imp[0] && imp[0].allDay], [1, "personal", true], "a Google event is imported");
  eq(K.store.state.calendar.events.filter((e) => e.title === "In flight").length, 0, "another device's event waits for the cloud");

  /* a remote cancel deletes here, queueing nothing */
  gc.cals.primary.remoteb1.status = "cancelled"; gc.put("primary", gc.cals.primary.remoteb1);
  await gsync();
  eq(K.store.state.calendar.events.filter((e) => e.title === "Dentist").length, 0, "cancelled there, deleted here");
  eq(Object.keys(X.S().deletes).length, 0, "and nothing queued to send back");

  /* a rule it can't hold: read-only chips */
  gc.instances.complex1 = [
    { id: "complex1_a", recurringEventId: "complex1", summary: "Choir", start: { dateTime: "2026-11-02T18:00:00Z" }, end: { dateTime: "2026-11-02T19:00:00Z" } },
    { id: "complex1_b", recurringEventId: "complex1", summary: "Choir", start: { dateTime: "2026-11-04T18:00:00Z" }, end: { dateTime: "2026-11-04T19:00:00Z" } }];
  gc.put("primary", { id: "complex1", summary: "Choir", start: { dateTime: "2026-11-02T18:00:00Z" }, end: { dateTime: "2026-11-02T19:00:00Z" }, recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO,WE"] });
  /* a moved showing of the local weekly event */
  gc.put("primary", { id: gid + "_20261109", recurringEventId: gid, summary: "Mine", originalStartTime: { dateTime: "2026-11-09T16:00:00Z" },
    start: { dateTime: "2026-11-10T16:00:00Z" }, end: { dateTime: "2026-11-10T17:30:00Z" } });
  await gsync();
  eq(K.store.state.calendar.events.filter((e) => e.title === "Choir").length, 0, "a rule it can't hold is not stored");
  eq(K.calendar.derivedOn("2026-11-04").filter((d) => d.kind === "google").map((d) => d.title), ["Choir"], "it is drawn read-only");
  eq(K.calendar.occursOn(K.calendar.getEvent(evA.id), "2026-11-09"), false, "the moved showing is skipped on the record");
  eq(K.calendar.derivedOn("2026-11-10").filter((d) => d.kind === "google").map((d) => d.time), ["16:00"], "and drawn at its new time");
  eq(K.extGcal.exportItems ? 1 : 0, 1, "export items exist");
  eq(K.calendar.derivedOn("2026-11-04", { all: true }).filter((d) => d.kind === "google").length, 0, "read-only chips are never exported");

  /* a 409 links instead of copying */
  const evD = K.calendar.addEvent({ title: "Made twice", date: "2026-11-06" });
  gc.put("primary", { id: X.gcalId(evD.uid), summary: "Made twice", start: { date: "2026-11-06" }, end: { date: "2026-11-07" }, extendedProperties: { private: { kosUid: evD.uid } } });
  const n0 = Object.keys(gc.cals.primary).length;
  await gsync();
  eq([Object.keys(gc.cals.primary).length, K.calendar.getEvent(evD.id).ext.g.id], [n0, X.gcalId(evD.uid)], "a 409 links, no copy");

  /* a local delete goes through the queue */
  K.calendar.deleteEvent(evD.id);
  assert(Object.keys(X.S().deletes).length === 1, "a linked delete is queued");
  await gsync();
  eq([Object.keys(X.S().deletes).length, gc.cals.primary[X.gcalId(evD.uid)].status], [0, "cancelled"], "deleted there, queue cleared");

  /* two links to one event fold to one */
  const twin = K.calendar.addEvent({ title: "Mine", date: "2026-11-02" });
  X.inbound(() => K.calendar.updateEvent(twin.id, { ext: { g: { id: gid, base: K.extGcal.fromLocal(K.calendar.getEvent(twin.id)) } } }));
  await gsync();
  eq(K.store.state.calendar.events.filter((e) => e.ext && e.ext.g && e.ext.g.id === gid).length, 1, "two links fold to the first");
  assert(K.calendar.getEvent(evA.id), "the first is kept");
});

step("F · the KurenaiOS calendar", async () => {
  X.S().google.export.on = true; X.S().google.cal = false;
  const a = K.assignments.add({ title: "Essay draft", due: "2026-11-05", subject: "compsci" });
  gc.calls.length = 0;
  await gsync();
  const made = gc.calls.filter((c) => c.m === "POST" && c.p === "/calendars");
  eq(made.length, 1, "the calendar is made once");
  const cal = X.S().google.exportCal;
  assert(cal && gc.cals[cal], "and remembered in the synced settings");
  const mine = Object.values(gc.cals[cal]).filter((e) => e.status !== "cancelled");
  assert(mine.some((e) => e.summary === "Due · Essay draft" && e.start.date === "2026-11-05"), "an assignment due goes there");
  assert(mine.every((e) => B32HEX.test(e.id)), "every exported id is base32hex");
  gc.calls.length = 0;
  await gsync();
  eq(gc.calls.filter((c) => c.m !== "GET").length, 0, "an unchanged second cycle writes nothing");
  K.assignments.update(a.id, { status: "complete" });
  await gsync();
  assert(!Object.values(gc.cals[cal]).some((e) => e.summary === "Due · Essay draft" && e.status !== "cancelled"), "a finished one is removed");
  const src = fs.readFileSync(path.join(ROOT, "js/core/extgcal.js"), "utf8");
  assert(/"Bill · " \+ x\.rule\.name/.test(src) && !/M\.format|x\.minor/.test(src.slice(src.indexOf("function exportItems"), src.indexOf("function ensureCal"))), "bills carry no amount");
  X.S().google.export.on = false; X.S().google.cal = true;
});

let rem1;
async function tsync() { const r = await X.syncProvider("todoist", "test"); for (let i = 0; i < 4; i++) await app.settle(); return r; }
step("G · Todoist", async () => {
  app.window.sessionStorage.setItem("kos.ext.state", "ext-todoist-abcdefabcdef12");
  const c = await X.complete(new URLSearchParams("code=TDCODE123&state=ext-todoist-abcdefabcdef12"));
  assert(c.ok && X.S().todoist.on, "Todoist connected");
  const list = K.reminders.addList("School");
  K.extTasks.link(list.id, "todoist", { id: "P1", name: "School" });
  rem1 = K.reminders.add({ title: "Past paper 2", listId: list.id, due: "2026-11-01", dueTime: "18:00", priority: 3, tags: ["cs"] });
  K.reminders.subAdd(rem1.id, "Section B");
  let r = await tsync();
  assert(r.ok, "a cycle: " + JSON.stringify(r));
  const adds = td.calls[0].filter((x) => x.type === "item_add");
  eq(adds.length, 2, "the reminder and its sub-task");
  eq(adds[0].uuid, X.uuidOf("add|" + rem1.uid), "the add's command id is derived from the uid");
  eq([adds[0].args.project_id, adds[0].args.priority, adds[0].args.labels, adds[0].args.due.date], ["P1", 4, ["cs"], "2026-11-01T18:00:00"], "fields go up");
  eq(adds[1].args.parent_id, adds[0].temp_id, "the sub-task under it");
  rem1 = K.reminders.get(rem1.id);
  assert(rem1.ext.id && rem1.subs[0].x, "linked, the sub too");
  /* the echo sends nothing */
  td.calls.length = 0;
  await tsync();
  eq(td.calls.length, 0, "the echo sends nothing");
  /* a remote completion: ticked here, activity, no pay */
  const gold = K.store.state.governor ? K.store.state.governor.gold : null, xp = K.store.state.governor ? K.store.state.governor.xp : null;
  const nS = K.store.state.sessions.length;
  td.put({ id: rem1.ext.id, checked: true });
  await tsync();
  eq(K.reminders.get(rem1.id).done, true, "completed there, ticked here");
  const ses = K.store.state.sessions.slice(nS);
  eq(ses.length, 1, "ONE session for the cycle");
  eq([ses[0].type, ses[0].metrics.external, ses[0].award], ["todo", true, { xp: 0, gold: 0 }], "a todo that pays nothing");
  if (gold != null) eq([K.store.state.governor.gold, K.store.state.governor.xp], [gold, xp], "gold and XP unchanged");
  eq(td.calls.length, 0, "and nothing sent back");
  /* imported with priority, labels and time */
  td.put({ id: "T900", content: "Buy folders", project_id: "P1", priority: 2, labels: ["shop", "admin"], due: { date: "2026-11-03T09:30:00", is_recurring: false, string: "3 Nov at 9:30" } });
  await tsync();
  const imp = K.reminders.all().filter((x) => x.title === "Buy folders")[0];
  assert(imp, "a remote task is imported");
  eq([imp.listId, imp.priority, imp.tags, imp.due, imp.dueTime], [list.id, 1, ["admin", "shop"], "2026-11-03", "09:30"], "with its fields");
  /* a local edit: only that field */
  K.reminders.update(imp.id, { priority: 3 });
  td.calls.length = 0;
  await tsync();
  const up = td.calls[0].filter((x) => x.type === "item_update");
  eq(up.length === 1 ? Object.keys(up[0].args).sort() : null, ["id", "priority"], "only the priority goes up");
  eq(up[0].args.priority, 4, "0–3 here is 1–4 there");
  /* a rule this app can't hold is kept */
  td.put({ id: "T901", content: "Gym", project_id: "P1", due: { date: "2026-11-02", is_recurring: true, string: "every mon, fri" } });
  await tsync();
  const gym = K.reminders.all().filter((x) => x.title === "Gym")[0];
  eq([gym.recur, gym.ext.rs], [null, "x:every mon, fri"], "Todoist's rule kept as it was");
  K.reminders.update(gym.id, { title: "Gym session" });
  td.calls.length = 0;
  await tsync();
  const gu = td.calls[0].filter((x) => x.type === "item_update")[0];
  eq([gu.args.content, gu.args.due], ["Gym session", undefined], "a title edit leaves the rule alone");
  /* a local delete */
  K.reminders.remove(imp.id);
  td.calls.length = 0;
  await tsync();
  eq(td.calls[0].map((x) => x.type), ["item_delete"], "deleted there");
});

step("H · Google Tasks", async () => {
  X.S().google.tasks = true; X.S().google.cal = false;
  K.extTasks.link(null, "gtasks", { id: "L1", name: "My Tasks" });
  const r = K.reminders.add({ title: "Return library book", due: "2026-11-07", dueTime: "12:00", priority: 2 });
  await gsync();
  const posted = gt.calls.filter((c) => c.m === "POST")[0];
  assert(posted, "it goes up");
  eq([posted.body.title, posted.body.due], ["Return library book", "2026-11-07T00:00:00.000Z"], "the date without the time");
  assert(!("priority" in posted.body), "priority stays here");
  const linked = K.reminders.get(r.id);
  eq(linked.ext.p, "gtasks", "linked");
  gt.put("L1", { id: linked.ext.id, status: "completed" });
  const nS = K.store.state.sessions.length;
  await gsync();
  eq([K.reminders.get(r.id).done, K.reminders.get(r.id).dueTime], [true, "12:00"], "ticked here, the time kept");
  eq(K.store.state.sessions.slice(nS).map((s) => [s.metrics.source, s.award && s.award.xp]), [["gtasks", 0]], "activity, no pay");
  X.S().google.cal = true;
});

step("I · sign-in and the server", async () => {
  /* the token lives in memory only */
  const kvDump = await new Promise((res) => K.store.exportFull((e, b) => res(JSON.stringify(b || {}))));
  [ACCESS.google, ACCESS.todoist].forEach((t) => {
    assert(JSON.stringify(K.store.state).indexOf(t) < 0, "no token in the state document");
    assert(kvDump.indexOf(t) < 0, "none in a backup");
  });
  app.window.sessionStorage.setItem("kos.ext.state", "ext-google-aaaaaaaaaaaa11");
  const bad = await X.complete(new URLSearchParams("code=4/x123456&state=ext-google-forged0000000"));
  assert(!bad.ok && /did not come from this app/.test(bad.why), "another state is refused");
  K.cloud.signedIn = () => false;
  eq((await X.connect("todoist")).ok, false, "signed out: no connect");
  K.cloud.signedIn = () => true;
  const cg = fs.readFileSync(path.join(ROOT, "js/core/codegit.js"), "utf8");
  assert(/!\/\[\?&\]state=ext-\/\.test\(location\.search\)/.test(cg), "GitHub's return handler leaves a Google or Todoist return alone");
  const L = await import(path.join(ROOT, "supabase/functions/ext-token/logic.ts"));
  assert(L.redirectAllowed("https://kurenai-os.pages.dev/", "https://kurenai-os.pages.dev"), "the app may receive a code");
  assert(L.redirectAllowed("http://localhost:8765/", "https://kurenai-os.pages.dev"), "so may a dev host");
  assert(!L.redirectAllowed("https://evil.example/", "https://kurenai-os.pages.dev") && !L.redirectAllowed("https://kurenai-os.pages.dev/?x=1", "https://kurenai-os.pages.dev"), "nowhere else");
  const url = new URL(L.authorizeUrl("google", "cid", "https://kurenai-os.pages.dev/", "ext-google-abcdefabcdef12"));
  eq([url.searchParams.get("access_type"), url.searchParams.get("prompt")], ["offline", "consent"], "Google is asked for a refresh token");
  assert(/calendar\.events/.test(url.searchParams.get("scope")) && /calendar\.app\.created/.test(url.searchParams.get("scope")) && /\/auth\/tasks/.test(url.searchParams.get("scope")), "the three scopes");
  assert(!L.stateOk("forged") && L.stateOk("ext-todoist-abcdefabcdef12"), "the state shape");
  const src = fs.readFileSync(path.join(ROOT, "supabase/functions/ext-token/index.ts"), "utf8");
  assert(/requireUserId/.test(src) && !/console\.(log|warn|error|info|debug)/.test(src), "JWT checked, nothing logged");
  assert(/\[functions\.ext-token\]\s*\nverify_jwt = true/.test(fs.readFileSync(path.join(ROOT, "supabase/config.toml"), "utf8")), "verify_jwt on");
  const sql = fs.readFileSync(path.join(ROOT, "supabase/migrations/20261030000001_kos_ext.sql"), "utf8");
  assert(/enable row level security/.test(sql) && !/create policy/.test(sql), "kos_ext: RLS on, no policy");
  assert(/revoke all on function public\.kos_ext_lease[^;]+from public, anon, authenticated/.test(sql), "the lease: service role only");
  const ext = fs.readFileSync(path.join(ROOT, "js/core/ext.js"), "utf8");
  assert(!/setKv\([^)]*token/i.test(ext.replace(/sync/g, "")), "the client never stores an access token");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke109: " + failed + " failed" : "smoke109: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
