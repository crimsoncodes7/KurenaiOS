/* Kurenai OS — smoke53.test.js
   The notification centre (core/notify.js + modules/notifications.js) and
   the seasonal hero's user art.
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke53.test.js

   What this suite pins:
   - the ledger: deterministic ids dedupe, read state, unread count, cap,
     retention, clear; the feed rides state.notify and the cloud merge
     knows the array;
   - every source lands a line: a fired calendar alert, a fired reminder
     alert, a fired assignment alert, an aired episode remembered from the
     airing cache, a Planner release day, an autosync with new entries;
   - the bell in the global header with its unread badge and five-row
     popover; the page under Archive with section filters and Mark all;
   - device alerts are a per-device opt-in gated on permission AND the
     switch; the service worker opens what a tapped notification is about;
   - the favicon is wired; the seasonal art kv key is honoured.          */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true; window.__kosAutoConfirm = true;
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.fetch = () => Promise.resolve({ ok: true, status: 204, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("") });

/* a fake Notification API so the device-alert path is observable */
const shown = [];
function FakeNotification(title, opts) { shown.push({ title, opts }); this.onclick = null; }
FakeNotification.permission = "default";
FakeNotification.requestPermission = cb => { FakeNotification.permission = "granted"; if (cb) cb("granted"); return Promise.resolve("granted"); };
window.Notification = FakeNotification;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(err.message || String(err))) : res(out))); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
async function waitFor(cond, ms) {
  const deadline = Date.now() + (ms || 3000);
  while (Date.now() < deadline) { if (cond()) return true; await tick(25); }
  return cond();
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const main = () => document.getElementById("main");
const N = () => KOS.notify;

/* ============ 1 · the ledger ============ */
console.log("== ledger ==");
step("push dedupes on the deterministic id; read state and the unread count follow", () => {
  N().clear();
  assert(N().push({ id: "t:1", kind: "reminder", title: "One", body: "b" }) === true, "first push must be new");
  assert(N().push({ id: "t:1", kind: "reminder", title: "One again" }) === false, "a repeated id must be ignored");
  assert(N().push({ id: "t:2", kind: "nope", title: "bad kind" }) === false, "an unknown kind is refused");
  N().push({ id: "t:3", kind: "calendar", title: "Three", ts: Date.now() - 1000 });
  assert(N().all().length === 2 && N().all()[0].id === "t:1", "newest first: " + N().all().map(i => i.id).join(","));
  assert(N().unread() === 2, "unread count");
  N().markRead("t:1");
  assert(N().unread() === 1 && N().isRead(N().all()[0]), "markRead did not take");
  N().markAllRead();
  assert(N().unread() === 0, "markAllRead did not take");
  assert(KOS.store.state.notify.items.length === 2 && Object.keys(KOS.store.state.notify.read).length === 2, "the ledger must live in state.notify");
});
step("the ledger is capped at 200 and drops rows older than 45 days (and their read marks)", () => {
  N().clear();
  N().push({ id: "old", kind: "system", title: "old", ts: Date.now() - 60 * 86400000 });
  assert(N().all().length === 0, "a 60-day-old row must not be kept");
  for (let i = 0; i < 230; i++) N().push({ id: "c:" + i, kind: "system", title: "row " + i, ts: Date.now() - i * 1000 });
  assert(N().all().length === 200, "cap: " + N().all().length);
  assert(N().all()[0].id === "c:0" && !N().all().some(r => r.id === "c:229"), "the cap keeps the newest");
  N().clear();
  assert(N().all().length === 0 && N().unread() === 0, "clear");
});
step("the cloud merge knows the ledger as a natural-key record array", () => {
  const src = fs.readFileSync(path.join(ROOT, "js/core/cloudmerge.js"), "utf8");
  assert(/path:\s*"notify\.items",\s*id:\s*"id"/.test(src), "notify.items is not in cloudmerge's RECORDS");
  const base = { progress: {}, notify: { items: [], read: {} } };
  const local = { progress: {}, notify: { items: [{ id: "a", kind: "reminder", title: "A", ts: 2 }], read: { a: 5 } } };
  const remote = { progress: {}, notify: { items: [{ id: "b", kind: "calendar", title: "B", ts: 1 }], read: { b: 6 } } };
  const out = KOS.cloudmerge.merge(base, local, remote).doc;
  assert(out.notify.items.length === 2 && out.notify.read.a === 5 && out.notify.read.b === 6, "two devices' feeds must union: " + JSON.stringify(out.notify));
});

/* ============ 2 · the sources ============ */
console.log("== sources ==");
step("a fired calendar alert lands in the feed once, keyed by the ticker's own key", async () => {
  N().clear();
  const today = KOS.srs.todayISO();
  const ev = KOS.calendar.addEvent({ type: "exam", title: "AQA 7517 Paper 2 mock", date: today, time: "23:59", alerts: [1440] });
  const fired = KOS.calendar.checkReminders();
  assert(fired.some(f => f.ev.id === ev.id), "the calendar alert did not fire");
  const item = N().all().find(i => i.kind === "calendar" && /Paper 2/.test(i.title));
  assert(item && item.id === "cal:" + ev.id + ":" + today + ":1440" && /Exam/.test(item.body) && item.view === "calendar", "calendar item wrong: " + JSON.stringify(item));
  KOS.calendar.checkReminders();
  assert(N().all().filter(i => i.id === item.id).length === 1, "the same alert landed twice");
});
step("a fired reminder alert and a fired assignment alert land in the feed", async () => {
  const today = KOS.srs.todayISO();
  const hm = new Date(Date.now() + 60000);
  const dueTime = ("0" + hm.getHours()).slice(-2) + ":" + ("0" + hm.getMinutes()).slice(-2);
  const r = KOS.reminders.add({ title: "Email the exams officer", due: today, dueTime, alerts: [5] });
  const rf = KOS.reminders.checkAlerts();
  assert(rf.some(f => f.item.id === r.id), "reminder alert did not fire");
  /* the modules' tickers are what hand the alert over — run the same code path */
  rf.forEach(f => N().push({ id: "rem:" + f.item.id + ":" + f.item.due + ":" + (f.item.dueTime || "") + ":" + f.minutes, kind: "reminder", title: f.item.title, body: "Reminder" }));
  assert(N().all().some(i => i.kind === "reminder" && /exams officer/.test(i.title)), "reminder item missing");
  const a = KOS.assignments.add({ title: "NEA — Analysis", subject: "compsci", due: today, dueTime, alerts: [5] });
  const af = KOS.assignments.checkAlerts();
  assert(af.some(f => f.assignment.id === a.id), "assignment alert did not fire");
  const remSrc = fs.readFileSync(path.join(ROOT, "js/modules/reminders.js"), "utf8");
  const asgSrc = fs.readFileSync(path.join(ROOT, "js/modules/assignments.js"), "utf8");
  assert(/KOS\.notify\.push\(\{ id: "rem:"/.test(remSrc) && /KOS\.notify\.push\(\{ id: "asg:"/.test(asgSrc), "the reminder/assignment tickers do not hand their alerts to the feed");
});
step("an episode airing: the cache is remembered per watched title and announced once it has aired", async () => {
  N().clear();
  const rows = [
    { id: 1, status: "inProgress", title: "Frieren", coverUrl: "https://c/f.jpg", externalIds: { anilistId: 154587 } },
    { id: 2, status: "planned", title: "Planned show", externalIds: { anilistId: 9 } }
  ];
  const now = Math.floor(Date.now() / 1000);
  N().recordAiring({ 154587: { airingAt: now - 30, timeUntilAiring: -30, episode: 13 }, 9: { airingAt: now - 30, episode: 1 } }, rows);
  const st = KOS.store.state.notify.airing;
  assert(st["154587"] && st["154587"].ep === 13 && !st["9"], "only WATCHED titles are remembered: " + JSON.stringify(st));
  N().tick();
  const item = N().all().find(i => i.kind === "airing");
  assert(item && item.id === "air:154587:13" && /Episode 13 of Frieren aired/.test(item.title) && item.cover === "https://c/f.jpg", "airing item wrong: " + JSON.stringify(item));
  assert(!KOS.store.state.notify.airing["154587"], "an announced episode must leave the watch map");
  N().recordAiring({ 154587: { airingAt: now + 3600, episode: 14 } }, rows);
  N().tick();
  assert(N().all().filter(i => i.kind === "airing").length === 1, "a future episode must not be announced yet");
  const animeSrc = fs.readFileSync(path.join(ROOT, "js/modules/anime.js"), "utf8");
  assert(/KOS\.notify\.recordAiring\(byId, rows\)/.test(animeSrc), "refreshAiring does not hand the cache to the feed");
});
step("a Planner item reaching its release day lands once; an autosync with new entries lands once", () => {
  const today = KOS.srs.todayISO();
  const it = KOS.wishlist.add({ module: "books", title: "Frieren Vol. 14", status: "waitingForRelease", releaseDate: today });
  N().tick(); N().tick();
  const w = N().all().filter(i => i.kind === "wishlist");
  assert(w.length === 1 && w[0].id === "wish:" + it.id + ":" + today && /Vol\. 14 is out/.test(w[0].title), "wishlist item wrong: " + JSON.stringify(w));
  const autoSrc = fs.readFileSync(path.join(ROOT, "js/core/autosync.js"), "utf8");
  assert(/KOS\.notify\.push\(\{ id: "sync:" \+ report\.ts/.test(autoSrc), "autosync does not report new entries to the feed");
});

/* ============ 3 · the surfaces ============ */
console.log("== surfaces ==");
step("the bell rides the global header with an unread badge and a five-row popover", async () => {
  N().clear();
  for (let i = 0; i < 7; i++) N().push({ id: "b:" + i, kind: i % 2 ? "reminder" : "calendar", title: "Row " + i, ts: Date.now() - i * 1000 });
  const bell = document.querySelector("#topbar .topbar-right .notify-bell");
  assert(bell, "no bell in the header");
  assert(/7 unread/.test(bell.getAttribute("aria-label")), "the bell's name does not carry the unread count: " + bell.getAttribute("aria-label"));
  const badge = bell.querySelector(".notify-badge");
  assert(badge && badge.textContent === "7" && badge.classList.contains("is-on"), "badge wrong");
  bell.click();
  await tick(30);
  const panel = document.querySelector(".menu-panel.notify-panel");
  assert(panel, "the popover did not open");
  assert(panel.querySelectorAll(".nt-row").length === 5, "the popover must show the five most recent, got " + panel.querySelectorAll(".nt-row").length);
  assert(/Row 0/.test(panel.querySelector(".nt-row").textContent), "newest first");
  const all = [...panel.querySelectorAll("button")].find(b => /View all notifications/.test(b.textContent));
  assert(all, "no way through to the page");
  all.click();
  await waitFor(() => KOS.store.state.ui.view === "notifications", 3000);
  assert(KOS.store.state.ui.view === "notifications", "View all must open the page");
  assert(!document.querySelector(".menu-panel.notify-panel"), "the popover must close");
});
step("the page lives under Archive: section filters, day groups, Mark all, device-alert opt-in", async () => {
  assert(KOS.sectionOf("notifications") === "system", "the page is not in the Archive section");
  const nav = document.getElementById("subnav");
  assert(nav && /Notifications/.test(nav.textContent), "Archive's section nav does not list Notifications");
  await waitFor(() => main().querySelectorAll(".nt-list .nt-row").length === 7, 3000);
  assert(main().querySelector(".dash-head .dh-actions .btn"), "Mark all as read must ride the page header's action slot");
  assert(main().querySelector(".nt-day") && /Today/.test(main().querySelector(".nt-day").textContent), "rows are grouped by day");
  const tabs = [...main().querySelectorAll(".nt-tabs-list .study-tab")];
  assert(tabs.length === 4, "expected All / Study / Productivity / Collection");
  tabs[2].click();
  await tick(20);
  assert(main().querySelectorAll(".nt-list .nt-row").length === 7, "calendar + reminders are Productivity: " + main().querySelectorAll(".nt-list .nt-row").length);
  tabs[3].click();
  await tick(20);
  assert(main().querySelector(".nt-list .empty-state"), "an empty filter must show an empty state");
  [...main().querySelectorAll(".dash-head .dh-actions .btn")].find(b => /Mark all/.test(b.textContent)).click();
  await tick(20);
  assert(N().unread() === 0 && !document.querySelector(".notify-badge").classList.contains("is-on"), "Mark all must clear the badge too");
  /* clicking a row opens what it is about and reads it */
  tabs[0].click(); await tick(20);
  N().push({ id: "b:cal", kind: "calendar", title: "Open me", view: "calendar" });
  await tick(20);
  const row = [...main().querySelectorAll(".nt-list .nt-row")].find(r => /Open me/.test(r.textContent));
  row.click();
  await waitFor(() => KOS.store.state.ui.view === "calendar", 3000);
  assert(KOS.store.state.ui.view === "calendar" && N().isRead({ id: "b:cal" }), "a row must open its view and count as read");
});
step("device alerts: off until permission AND the switch; a fresh item then shows a system notification", async () => {
  const nat = N().native;
  assert(nat.supported() && nat.permission() === "default" && !nat.enabled(), "initial state");
  shown.length = 0;
  N().push({ id: "d:1", kind: "reminder", title: "Quiet" });
  assert(shown.length === 0, "no device alert before opting in");
  await new Promise(res => nat.request(ok => { assert(ok, "permission not granted"); res(); }));
  assert(nat.enabled() && KOS.store.state.ui.notifyDevice === true, "the opt-in is a per-device ui flag");
  /* the page is in the background (a focused, visible page relies on the
     bell and the toast instead), so the alert path runs */
  document.hasFocus = () => false;
  N().push({ id: "d:2", kind: "airing", title: "Episode 12 aired", body: "b", view: "anime" });
  assert(shown.length === 1 && shown[0].title === "Episode 12 aired" && shown[0].opts.tag === "d:2", "a fresh item must show a device alert: " + JSON.stringify(shown));
  N().push({ id: "d:3", kind: "wishlist", title: "Old news", ts: Date.now() - 3600000 });
  assert(shown.length === 1, "an hour-old item must not alert (it arrived from elsewhere)");
  nat.setEnabled(false);
  N().push({ id: "d:4", kind: "reminder", title: "Off" });
  assert(shown.length === 1, "the switch must silence alerts without touching permission");
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  assert(/notificationclick/.test(sw) && /kos-open/.test(sw), "the service worker does not open a tapped notification");
  const pwa = fs.readFileSync(path.join(ROOT, "js/core/pwa.js"), "utf8");
  assert(/kos-open/.test(pwa) && /KOS\.show\(e\.data\.view/.test(pwa), "the page does not honour the worker's open message");
});
step("the favicon is wired and the seasonal hero honours a user picture from kv", async () => {
  assert(document.querySelector('link[rel="icon"][href="icons/favicon.svg"]') && fs.existsSync(path.join(ROOT, "icons/favicon.svg")), "no favicon");
  await p(cb => KOS.mediadb.setKV("hero.season.WINTER", { source: "https://x/mine.jpg", crop: { x: 40, y: 60, zoom: 1.2 } }, cb));
  KOS.show("seasonal");
  await waitFor(() => main().querySelector(".season-picker"), 3000);
  const sel = main().querySelector(".season-picker .status-sel");
  sel.value = "WINTER";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  await waitFor(() => (main().querySelector(".season-art") || {}).src === "https://x/mine.jpg", 3000);
  const art = main().querySelector(".season-art");
  assert(art.src === "https://x/mine.jpg" && art.classList.contains("crop-media") && !art.getAttribute("srcset"), "the user's picture is not painted through the crop vars");
  assert(/your picture/.test(main().querySelector(".season-credit").textContent), "the credit must say it is yours");
  await p(cb => KOS.mediadb.delKV("hero.season.WINTER", cb));
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE53 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE53 PASS — the notification centre verified (" + steps.length + " steps).");
  process.exit(0);
})();
