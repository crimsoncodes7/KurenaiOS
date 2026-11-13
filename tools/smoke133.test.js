/* Kurenai OS — smoke133.test.js
   Two tabs save the state document safely; the store's own storage is
   durable (quality W1, RC5; DI-04, DI-10; js/core/store.js, js/core/pwa.js).

   Two jsdom "tabs" boot over ONE localStorage (tools/lib/app-harness
   sharedStorage(): a tab hears another's write only when the suite calls
   deliver()), one IndexedDB factory and one navigator.locks (fakeLocks()).

     A · both tabs boot and converge; the stored rev is set.
     B · tab A adds a reminder, tab B a calendar event, both save: the
         stored document holds both, the rev rose with each write, and each
         tab's memory converges after the storage event.
     C · a STALE tab (B never hears of A's write) saves later: A's change
         survives, and the reminder both tabs minted under the same id is
         re-keyed — nothing lost.
     D · gold earned in both tabs adds up (base + both).
     E · an interrupted write (the rev written, the document not) is
         harmless: the next write needs no merge and the rev moves past it.
     F · lock contention: with the lock held, both tabs' saves wait (one
         queued request a tab however many saves), then both land.
     G · an unreadable stored document is set aside before anything can
         overwrite it, and a persistent notice says so; when the copy does
         not fit in localStorage it goes to the IndexedDB mirror and the
         document is not overwritten meanwhile.
     H · the mirror wins at boot when its rev is newer (merged in), and is
         adopted when localStorage held nothing.
     I · a full localStorage switches this session to the mirror, with a
         persistent warning; a save failing in BOTH stores is reported as
         failed and never flashes "saved".
     J · pwa.js: a controller change reloads every tab that had a
         controller (the update confirmed in another tab), not a first
         install.
     K–P · the RC5 review's findings: the same external document applied in
         two tabs counts once (P0); the day's HP drain runs once; a running
         Focus session belongs to one tab and is paid once; with
         localStorage full two tabs still merge; a write that raced
         another tab's is merged; quarantined copies do not pile up.

   Run: node tools/smoke133.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, sharedStorage, fakeLocks, ROOT } = require("./lib/app-harness");
const fake = require("fake-indexeddb");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const KEY = "kurenai-os-v1", REV = KEY + ".rev", LOCK = "kos-state-write";

let ls, idb, locks, A, B;
const stored = () => JSON.parse(ls.getItem(KEY));
const rev = () => +ls.getItem(REV);
async function settleBoth() { await A.settle(); await B.settle(); await A.settle(); }
async function sync() {
  for (let i = 0; i < 12; i++) { await settleBoth(); if (!ls.deliver()) { await settleBoth(); return; } }
}
const titles = (K) => K.store.state.reminders.items.map((r) => r.title);
function mirrorGet(win, id) {
  return new Promise((res, rej) => {
    const rq = win.indexedDB.open("kurenai-os-statemirror", 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore("doc", { keyPath: "id" });
    rq.onsuccess = () => { const db = rq.result; const g = db.transaction("doc").objectStore("doc").get(id);
      g.onsuccess = () => { db.close(); res(g.result || null); }; g.onerror = () => rej(g.error); };
    rq.onerror = () => rej(rq.error);
  });
}
function mirrorAll(win) {
  return new Promise((res, rej) => {
    const rq = win.indexedDB.open("kurenai-os-statemirror", 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore("doc", { keyPath: "id" });
    rq.onsuccess = () => { const db = rq.result; const g = db.transaction("doc").objectStore("doc").getAll();
      g.onsuccess = () => { db.close(); res(g.result || []); }; g.onerror = () => rej(g.error); };
    rq.onerror = () => rej(rq.error);
  });
}

step("A · two tabs boot over one storage and converge", async () => {
  ls = sharedStorage(); idb = new fake.IDBFactory(); locks = fakeLocks();
  A = await boot({ localStorage: ls, indexedDB: idb, locks, seed: 1 });
  B = await boot({ localStorage: ls, indexedDB: idb, locks, seed: 2 });
  await sync();
  assert(rev() > 0, "a rev is stored beside the document");
  eq(A.errors.concat(B.errors), [], "no load errors");
  assert(typeof A.KOS.store.health === "function", "KOS.store.health exists");
});

step("B · a reminder in A and an event in B both survive; rev monotonic; memories converge", async () => {
  const K = A.KOS, L = B.KOS;
  const r0 = rev();
  K.reminders.add({ title: "Tab A reminder" });
  await A.settle();
  const r1 = rev();
  assert(r1 > r0, "A's write raised the rev");
  L.calendar.addEvent({ title: "Tab B event", date: "2026-09-30", type: "other" });
  await B.settle();
  const r2 = rev();
  assert(r2 > r1, "B's write raised it again (" + r1 + " → " + r2 + ")");
  const s = stored();
  assert(s.reminders.items.some((r) => r.title === "Tab A reminder"), "A's reminder is stored");
  assert(s.calendar.events.some((e) => e.title === "Tab B event"), "B's event is stored");
  assert(titles(L).includes("Tab A reminder"), "B merged A's reminder into memory as it saved");
  await sync();
  assert(K.store.state.calendar.events.some((e) => e.title === "Tab B event"), "A converged after the storage event");
  eq(JSON.stringify(K.store.state), JSON.stringify(L.store.state), "both tabs hold the same document");
  assert(rev() >= r2, "the rev never goes back");
});

step("C · a stale tab does not erase A's change; the same id minted twice is re-keyed", async () => {
  const K = A.KOS, L = B.KOS;
  const next = K.store.state.reminders.nextId;
  eq(L.store.state.reminders.nextId, next, "both tabs would mint the same id");
  const a = K.reminders.add({ title: "Stale case A" });
  await A.settle();
  ls.drop();                       // B never hears of it
  const b = L.reminders.add({ title: "Stale case B" });
  eq(a.id, b.id, "the same id was minted in both tabs");
  await B.settle();
  const items = stored().reminders.items;
  const sa = items.filter((r) => r.title === "Stale case A"), sb = items.filter((r) => r.title === "Stale case B");
  eq([sa.length, sb.length], [1, 1], "both reminders are stored once");
  assert(sa[0].id !== sb[0].id, "one was re-keyed (" + sa[0].id + ", " + sb[0].id + ")");
  assert(stored().reminders.nextId > Math.max(sa[0].id, sb[0].id), "the counter passes both");
  await sync();
  eq(titles(K).filter((t) => /^Stale case/.test(t)).sort(), ["Stale case A", "Stale case B"], "A converged");
  eq(JSON.stringify(K.store.state), JSON.stringify(L.store.state), "both tabs hold the same document");
});

step("D · gold earned in both tabs adds up", async () => {
  const K = A.KOS, L = B.KOS;
  const g0 = K.store.state.governor.gold, x0 = K.store.state.governor.xp;
  eq(L.store.state.governor.gold, g0, "the tabs agree before");
  K.sessions.log({ type: "todo", metrics: { item: "A's habit" } });
  const ga = K.store.state.governor.gold - g0, xa = K.store.state.governor.xp - x0;
  L.sessions.log({ type: "todo", metrics: { item: "B's habit" } });
  const gb = L.store.state.governor.gold - g0, xb = L.store.state.governor.xp - x0;
  assert(ga > 0 && gb > 0, "both tabs earned gold (" + ga + ", " + gb + ")");
  await A.settle(); await B.settle();
  eq(stored().governor.gold, g0 + ga + gb, "stored gold is the base plus both");
  eq(stored().governor.xp, x0 + xa + xb, "and XP");
  await sync();
  eq([K.store.state.governor.gold, L.store.state.governor.gold], [g0 + ga + gb, g0 + ga + gb], "both tabs hold the sum");
  const items = stored().sessions.map((e) => e.metrics && e.metrics.item);
  assert(items.includes("A's habit") && items.includes("B's habit"), "both sessions are in the ledger");
});

step("E · an interrupted write (rev moved, document unchanged) is harmless", async () => {
  const K = A.KOS;
  await sync();
  const r0 = rev(), doc0 = ls.getItem(KEY);
  ls.setItem(REV, String(r0 + 5));   // a tab died between the two writes
  ls.drop();
  eq(ls.getItem(KEY), doc0, "the document did not move");
  const m0 = K.store.health().merges;
  K.reminders.add({ title: "After the interruption" });
  await A.settle();
  eq(rev(), r0 + 6, "the next write passes the moved rev");
  eq(K.store.health().merges, m0, "it needed no merge");
  assert(stored().reminders.items.some((r) => r.title === "After the interruption"), "the write landed");
  await sync();
  eq(JSON.stringify(A.KOS.store.state), JSON.stringify(B.KOS.store.state), "both tabs hold the same document");
});

step("F · lock contention: saves wait for the lock, queue once a tab, then both land", async () => {
  const K = A.KOS, L = B.KOS;
  await sync();
  const doc0 = ls.getItem(KEY);
  const release = locks.hold(LOCK);
  await A.settle();
  K.reminders.add({ title: "Queued in A" });
  await A.settle();
  K.reminders.add({ title: "Queued in A, again" });
  await A.settle();
  L.calendar.addEvent({ title: "Queued in B", date: "2026-10-02", type: "other" });
  await B.settle();
  eq(ls.getItem(KEY), doc0, "nothing is written while another holds the lock");
  eq(locks.pending(LOCK), 2, "one waiting request a tab");
  release();
  await settleBoth();
  const s = stored();
  assert(s.reminders.items.some((r) => r.title === "Queued in A") && s.reminders.items.some((r) => r.title === "Queued in A, again"), "both of A's changes landed");
  assert(s.calendar.events.some((e) => e.title === "Queued in B"), "B's landed");
  await sync();
  eq(JSON.stringify(K.store.state), JSON.stringify(L.store.state), "both tabs hold the same document");
});

step("G · an unreadable document is set aside first; a persistent notice says so", async () => {
  const broken = '{"v":1,"sessions":[{"id":1,"type":"focus"' + "x".repeat(400);
  const ls2 = sharedStorage();
  ls2.setItem(KEY, broken);
  const C = await boot({ localStorage: ls2, indexedDB: new fake.IDBFactory() });
  await C.settle();
  eq(ls2.getItem(KEY + ".quarantine"), broken, "the unreadable copy is kept, byte for byte");
  assert(C.document.querySelector('[data-banner="store-quarantine"]'), "a persistent notice is shown");
  eq(C.KOS.store.health().quarantine.where, "localStorage", "health() reports where it went");
  C.KOS.store.save(); await C.settle();
  eq(ls2.getItem(KEY + ".quarantine"), broken, "a save never touches the copy");

  /* the copy does not fit in localStorage: it goes to the mirror, and the
     document's key is not overwritten before that is confirmed */
  const ls3 = sharedStorage();
  ls3.setItem(KEY, broken);
  ls3.setQuota(ls3.raw.get(KEY).length + KEY.length + 300);
  const idb3 = new fake.IDBFactory();
  const D = await boot({ localStorage: ls3, indexedDB: idb3 });
  await D.settle();
  eq(ls3.getItem(KEY), broken, "the unreadable document was never overwritten");
  const recs = await mirrorAll(D.window);
  const q = recs.find((r) => /^quarantine-/.test(r.id));
  assert(q && q.json === broken, "the copy is in the IndexedDB mirror");
  eq(D.KOS.store.health().quarantine.where, "indexeddb", "health() says the mirror holds it");
  assert(D.document.querySelector('[data-banner="store-quarantine"]'), "the notice is shown");
});

step("H · the mirror wins at boot when its rev is newer; adopted over an empty store", async () => {
  /* a document saved by tab A, then a NEWER one only the mirror holds */
  const base = stored();
  const lsDoc = JSON.stringify(base);
  const newer = JSON.parse(lsDoc);
  newer.reminders.items.push({ id: 9001, title: "Only in the mirror", done: false });
  newer.reminders.nextId = 9002;
  const idb4 = new fake.IDBFactory();
  const ls4 = sharedStorage();
  ls4.setItem(KEY, lsDoc); ls4.setItem(REV, "5");
  /* seed the mirror through a throwaway window of the same factory */
  const seedTab = await boot({ localStorage: sharedStorage(), indexedDB: idb4 });
  await new Promise((res) => {
    const rq = seedTab.window.indexedDB.open("kurenai-os-statemirror", 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore("doc", { keyPath: "id" });
    rq.onsuccess = () => { const db = rq.result; const tx = db.transaction("doc", "readwrite");
      tx.objectStore("doc").put({ id: "state", rev: 50, json: JSON.stringify(newer), at: 1 });
      tx.oncomplete = () => { db.close(); res(); }; };
  });
  const E = await boot({ localStorage: ls4, indexedDB: idb4 });
  const got = await E.KOS.store.recovery;
  await E.settle();
  assert(got && got.from === "indexeddb" && got.merged, "the newer mirror was merged in");
  assert(E.KOS.store.state.reminders.items.some((r) => r.title === "Only in the mirror"), "its reminder is in memory");
  assert(JSON.parse(ls4.getItem(KEY)).reminders.items.some((r) => r.title === "Only in the mirror"), "and saved to localStorage");
  assert(+ls4.getItem(REV) > 50, "the rev passes the mirror's");
  const before = await mirrorGet(E.window, "before-recovery");
  eq(before && before.json, lsDoc, "the loaded document was kept in the mirror before the merge");

  /* an OLDER mirror does not win */
  const ls5 = sharedStorage();
  ls5.setItem(KEY, lsDoc); ls5.setItem(REV, "99");
  const F = await boot({ localStorage: ls5, indexedDB: idb4 });
  eq(await F.KOS.store.recovery, null, "an older mirror is left alone");
  assert(!F.KOS.store.state.reminders.items.some((r) => r.title === "Only in the mirror"), "its document is not merged in");

  /* localStorage empty: adopted */
  const idb6 = new fake.IDBFactory();
  const seed6 = await boot({ localStorage: sharedStorage(), indexedDB: idb6 });
  await new Promise((res) => {
    const rq = seed6.window.indexedDB.open("kurenai-os-statemirror", 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore("doc", { keyPath: "id" });
    rq.onsuccess = () => { const db = rq.result; const tx = db.transaction("doc", "readwrite");
      tx.objectStore("doc").put({ id: "state", rev: 3, json: JSON.stringify(newer), at: 1 });
      tx.oncomplete = () => { db.close(); res(); }; };
  });
  const ls6 = sharedStorage();
  const G = await boot({ localStorage: ls6, indexedDB: idb6 });
  const g = await G.KOS.store.recovery;
  await G.settle();
  assert(g && g.from === "indexeddb" && !g.merged, "adopted over an empty localStorage");
  assert(G.KOS.store.state.reminders.items.some((r) => r.title === "Only in the mirror"), "the mirror's document is in memory");
});

step("I · a full localStorage switches to the mirror; failing in both is a failure", async () => {
  const ls7 = sharedStorage(), idb7 = new fake.IDBFactory();
  const T = await boot({ localStorage: ls7, indexedDB: idb7 });
  await T.settle();
  let flashes = 0;
  T.KOS.ui.flashSaved = () => { flashes++; };
  const docBefore = ls7.getItem(KEY);
  let size = 0; ls7.raw.forEach((v, k) => { size += k.length + v.length; });
  ls7.setQuota(size + 10);
  T.KOS.reminders.add({ title: "Written while full" });
  await T.settle();
  const h = T.KOS.store.health();
  eq(h.primary, "indexeddb", "the mirror is the primary for the session");
  eq(h.lastSaveOk, true, "the save succeeded there");
  assert(flashes === 1, "and was reported saved once");
  assert(T.document.querySelector('[data-banner="store-quota"]'), "a persistent warning is shown");
  eq(ls7.getItem(KEY), docBefore, "localStorage was left as it was");
  const m = await mirrorGet(T.window, "state");
  assert(m && JSON.parse(m.json).reminders.items.some((r) => r.title === "Written while full"), "the mirror holds the change");
  eq(ls7.getItem(REV), m.rev + "m", "and the stored rev is the mirror's, marked: the next boot takes the mirror");

  /* both stores refuse */
  flashes = 0;
  T.window.indexedDB.open = () => { throw new Error("IndexedDB refused"); };
  T.KOS.reminders.add({ title: "Nowhere to go" });
  await T.settle();
  const h2 = T.KOS.store.health();
  eq(h2.lastSaveOk, false, "the save is reported failed");
  assert(/refused/.test(h2.lastError), "with its reason");
  eq(flashes, 0, "flashSaved never fired");
  assert(T.document.querySelector('[data-banner="store-failed"]'), "a persistent notice says the save failed");
});

step("J · pwa.js: every tab with a controller reloads on a controller change", async () => {
  const T = await boot({ clock: "2026-10-20T12:00:00" });
  const W = T.window;
  function container(controller) {
    const L = {};
    const reg = { waiting: null, installing: null, addEventListener: () => {} };
    const c = { controller, register: () => Promise.resolve(reg),
      addEventListener: (t, fn) => { (L[t] = L[t] || []).push(fn); }, _emit: (t) => (L[t] || []).forEach((fn) => fn({})) };
    Object.defineProperty(W.navigator, "serviceWorker", { value: c, configurable: true });
    return c;
  }
  const run = () => W.eval(fs.readFileSync(path.join(ROOT, "js/core/pwa.js"), "utf8"));
  /* a tab that did not confirm, but had a controller: it reloads */
  let c = container({});
  run(); await T.settle();
  let reloads = 0, flushed = 0;
  assert(T.KOS.pwa.reloadPage, "KOS.pwa.reloadPage exists");
  const realFlush = T.KOS.store.flush;
  T.KOS.store.flush = () => { flushed++; };
  T.KOS.pwa.reloadPage = ((orig) => () => { reloads++; })(T.KOS.pwa.reloadPage);
  c._emit("controllerchange");
  eq(reloads, 1, "an update confirmed in another tab reloads this one");
  c._emit("controllerchange");
  eq(reloads, 1, "once");
  /* a first install (no controller before) reloads nothing */
  c = container(null);
  run(); await T.settle();
  T.KOS.pwa.reloadPage = () => { reloads++; };
  c._emit("controllerchange");
  eq(reloads, 1, "a first install does not reload");
  /* the real reloadPage writes the document first */
  run();
  try { T.KOS.pwa.reloadPage(); } catch (e) { /* jsdom cannot reload */ }
  assert(flushed >= 1, "reloadPage flushes the store first");
  T.KOS.store.flush = realFlush;
});


/* ================= the RC5 review's findings (9 Nov 2026) ================= */

step("K · P0: the same external document applied in two tabs counts once", async () => {
  const K = A.KOS, L = B.KOS;
  await sync();
  const g0 = K.store.state.governor.gold, x0 = K.store.state.governor.xp;
  const inc = JSON.parse(JSON.stringify(K.store.state));
  inc.governor.gold = g0 + 50; inc.governor.xp = x0 + 100;
  inc.sessions.push({ id: 99001, type: "todo", ts: Date.now(), day: "2026-09-24", metrics: { item: "From the cloud" }, award: { xp: 100, gold: 50 } });
  K.store.replaceState(JSON.parse(JSON.stringify(inc)));
  await A.settle();
  ls.drop();                                   // B never hears of A's write
  L.store.replaceState(JSON.parse(JSON.stringify(inc)));
  await B.settle();
  eq([stored().governor.gold - g0, stored().governor.xp - x0], [50, 100], "the pulled gold and XP are stored once");
  await sync();
  eq([K.store.state.governor.gold - g0, L.store.state.governor.gold - g0], [50, 50], "both tabs hold it once");
  eq(stored().sessions.filter((e) => e.id === 99001).length, 1, "and its session once");

  /* the merge's own rule: equal deltas are summed only when both sides
     logged sessions of their own */
  const M = K.cloudmerge, T0 = 1790000000000;
  const base = { governor: { gold: 10, xp: 0, hp: 80 }, sessions: [] };
  const pulled = { governor: { gold: 60, xp: 100, hp: 80 }, sessions: [{ id: 1, ts: T0, type: "todo" }] };
  eq(M.merge(base, pulled, pulled, { sumEqual: true }).doc.governor.gold, 60, "the same session on both sides: one change");
  const drained = { governor: { gold: 10, xp: 0, hp: 35 }, sessions: [] };
  eq(M.merge(base, drained, drained, { sumEqual: true }).doc.governor.hp, 35, "an equal change with no session behind it: one change");
  const mine = { governor: { gold: 14, xp: 0, hp: 80 }, sessions: [{ id: 1, ts: T0 + 1, type: "todo", metrics: { item: "a" } }] };
  const theirs = { governor: { gold: 14, xp: 0, hp: 80 }, sessions: [{ id: 2, ts: T0 + 2, type: "todo", metrics: { item: "b" } }] };
  eq(M.merge(base, mine, theirs, { sumEqual: true }).doc.governor.gold, 18, "each side's own session: summed");
});

step("L · the day's HP drain runs once however many tabs tick (P1)", async () => {
  const K = A.KOS, L = B.KOS;
  await sync();
  const today = K.srs.todayISO();
  K.store.state.governor.hp = 80;
  K.store.state.governor.lastTick = K.srs.addDays(today, -3);
  K.store.state.governor.lastBacklogDrain = today;
  K.store.save();
  await sync();
  eq([L.store.state.governor.hp, L.store.state.governor.lastTick], [80, K.srs.addDays(today, -3)], "both tabs start three days behind");
  K.governor.tick();
  L.governor.tick();
  await settleBoth();
  eq(stored().governor.hp, 35, "three missed days drained once (80 − 45)");
  await sync();
  eq([K.store.state.governor.hp, L.store.state.governor.hp], [35, 35], "both tabs agree");
  eq(stored().governor.lastTick, today, "the tick is recorded");
});

step("M · a running Focus session belongs to one tab; it is paid once (P1, P2)", async () => {
  const K = A.KOS;
  await sync();
  const cal = K.store.state.calendar, evs = cal.events;
  K.focus.start({ kind: "study", mode: "stopwatch" });
  await A.settle();
  const S = K.focus.session();
  assert(S && S.state === "running", "A's session runs");
  await sync();
  /* a third tab opens while A runs */
  const C = await boot({ localStorage: ls, indexedDB: idb, locks, seed: 3 });
  await C.settle(); await sync();
  eq(C.KOS.focus.session(), null, "the new tab did not take A's session");
  eq(stored().focus.active && stored().focus.active.state, "running", "the stored session still runs");
  C.KOS.reminders.add({ title: "From the third tab" });
  await C.settle(); await sync();
  assert(K.store.state.focus.active === K.focus.session(), "A's live session is still the one in its state after a merge");
  assert(K.store.state.calendar === cal && K.store.state.calendar.events === evs, "a merge keeps the objects modules hold");
  eq(K.focus.session().state, "running", "and still runs");
  eq(C.KOS.focus.start({ kind: "study", mode: "stopwatch" }) || null, null, "the other tab cannot start a second one");
  await C.settle();
  eq(C.KOS.focus.session(), null, "nothing started there");
  const n0 = stored().sessions.filter((e) => e.type === "focus").length;
  K.focus.endEarly({ confirmed: true, review: false });
  await A.settle(); await sync();
  eq(stored().focus.active, null, "ended in A");
  eq(stored().sessions.filter((e) => e.type === "focus").length, n0 + 1, "logged once");
  eq(C.KOS.focus.session(), null, "the other tab has nothing to end");

  /* an orphan (its tab closed) is picked up by the next tab that asks */
  K.focus.start({ kind: "study", mode: "stopwatch" });
  await A.settle(); await sync();
  const id2 = K.focus.session().id;
  assert(locks.kill("kos-focus"), "A held the Focus lock");
  C.KOS.focus.start({ kind: "study", mode: "stopwatch" });
  await C.settle();
  const S2 = C.KOS.focus.session();
  assert(S2 && S2.id === id2, "the open tab restored the orphaned session instead of starting another");
  eq(S2.state, "paused", "paused, as a recovery is");
  C.KOS.focus.endEarly({ confirmed: true, review: false });
  await C.settle(); await sync();

  /* finishing is idempotent by session: a copy of a session the ledger
     already holds logs nothing */
  const ls9 = sharedStorage();
  const T = await boot({ localStorage: ls9, indexedDB: new fake.IDBFactory() });
  T.KOS.focus.start({ kind: "study", mode: "stopwatch" });
  T.KOS.store.flush();
  const running = JSON.parse(ls9.getItem(KEY)).focus.active;
  T.KOS.focus.endEarly({ confirmed: true, review: false });
  T.KOS.store.flush();
  const after = JSON.parse(ls9.getItem(KEY));
  const logged = after.sessions.filter((e) => e.type === "focus").length;
  eq(logged, 1, "the session was logged");
  after.focus.active = running;
  const ls10 = sharedStorage();
  ls10.setItem(KEY, JSON.stringify(after));
  const U = await boot({ localStorage: ls10, indexedDB: new fake.IDBFactory(), clock: "2026-09-24T11:00:00" });
  await U.settle();
  assert(U.KOS.focus.session(), "the stale copy was restored (no other tab is alive)");
  U.KOS.focus.endEarly({ confirmed: true, review: false });
  await U.settle();
  eq(U.KOS.store.state.sessions.filter((e) => e.type === "focus").length, logged, "ending it again logged nothing");
  eq(U.KOS.store.state.focus.active, null, "and cleared it");
});

step("N · with localStorage full, two tabs still merge: nothing is overwritten (P1)", async () => {
  const lsq = sharedStorage(), idbq = new fake.IDBFactory(), lq = fakeLocks();
  const C = await boot({ localStorage: lsq, indexedDB: idbq, locks: lq, seed: 5 });
  const D = await boot({ localStorage: lsq, indexedDB: idbq, locks: lq, seed: 6 });
  const both = async () => { await C.settle(); await D.settle(); await C.settle(); };
  const hear = async () => { for (let i = 0; i < 8; i++) { await both(); if (!lsq.deliver()) break; } await both(); };
  await hear();
  let size = 0; lsq.raw.forEach((v, k) => { size += k.length + v.length; });
  lsq.setQuota(size + 40);
  C.KOS.reminders.add({ title: "C1" }); await both();
  eq(C.KOS.store.health().primary, "indexeddb", "C saves to the mirror");
  lsq.drop();                                  // D hears nothing
  D.KOS.reminders.add({ title: "D1" }); await both();
  eq(D.KOS.store.health().primary, "indexeddb", "D too");
  lsq.drop();
  C.KOS.reminders.add({ title: "C2" }); await both();
  const m = await mirrorGet(C.window, "state");
  eq(JSON.parse(m.json).reminders.items.map((r) => r.title).filter((t) => /^[CD]\d$/.test(t)).sort(), ["C1", "C2", "D1"], "the mirror holds every tab's reminder");
  await hear();
  eq(D.KOS.store.state.reminders.items.map((r) => r.title).filter((t) => /^[CD]\d$/.test(t)).sort(), ["C1", "C2", "D1"], "the other tab hears of it and merges");
  assert(/m$/.test(String(lsq.getItem(REV))), "the stored rev says the mirror is the primary");
  /* a tab still on localStorage that hears of it switches too */
  const E = await boot({ localStorage: lsq, indexedDB: idbq, locks: lq, seed: 7 });
  await E.settle();
  assert(E.KOS.store.state.reminders.items.some((r) => r.title === "D1"), "a fresh boot recovers every reminder");
  /* a save in mirror mode can be awaited (pwa.js waits for it before a reload) */
  C.KOS.reminders.add({ title: "C3" });
  const p = C.KOS.store.flush();
  assert(p && typeof p.then === "function", "flush returns a promise");
  await p;
  const m2 = await mirrorGet(C.window, "state");
  assert(JSON.parse(m2.json).reminders.items.some((r) => r.title === "C3"), "resolved once the mirror holds the change");
  let order = [];
  const realFlush = C.KOS.store.flush;
  C.KOS.store.flush = () => new Promise((res) => setTimeout(() => { order.push("flushed"); res(true); }, 20));
  C.KOS.pwa._reload = () => { order.push("reload"); };
  C.KOS.pwa.reloadPage();
  eq(order, [], "reloadPage does not reload before the write");
  await new Promise((r) => setTimeout(r, 60));
  eq(order, ["flushed", "reload"], "it reloads once the write is done");
  C.KOS.store.flush = realFlush;
});

step("O · a write that raced another tab's (same rev, different document) is merged, not dropped (P3)", async () => {
  const K = A.KOS, L = B.KOS;
  await sync();
  const s0 = ls.getItem(KEY), r0 = rev();
  L.calendar.addEvent({ title: "B's locked write", date: "2026-10-05", type: "other" });
  await B.settle();
  eq(rev(), r0 + 1, "B wrote the next rev");
  ls.drop();
  /* a tab that had read the same document wrote at the same moment (a
     pagehide flush outside the lock): the same rev, without B's change */
  const racing = JSON.parse(s0);
  racing.reminders.items.push({ id: racing.reminders.nextId, title: "From the racing flush", done: false, created: Date.now() });
  racing.reminders.nextId++;
  ls.setItem(KEY, JSON.stringify(racing));
  await sync();
  const s = stored();
  assert(s.calendar.events.some((e) => e.title === "B's locked write"), "B's change survived being overwritten");
  assert(s.reminders.items.some((r) => r.title === "From the racing flush"), "and the racing write's change is kept");
  eq(JSON.stringify(K.store.state), JSON.stringify(L.store.state), "both tabs hold the same document");
});

step("P · quarantined copies: one in localStorage at most, the rest in the mirror, each listed and removable (P3)", async () => {
  const b0 = '{"v":1,"broken":0' + "y".repeat(200), b1 = '{"v":1,"broken":1' + "z".repeat(200);
  const lsx = sharedStorage(), idbx = new fake.IDBFactory();
  lsx.setItem(KEY + ".quarantine", b0);
  lsx.setItem(KEY + ".quarantine.meta", JSON.stringify({ at: 1, why: "earlier", where: "localStorage", key: KEY + ".quarantine", told: true }));
  lsx.setItem(KEY, b1);
  const T = await boot({ localStorage: lsx, indexedDB: idbx });
  await T.settle();
  eq([...lsx.raw.keys()].filter((k) => k.indexOf(KEY + ".quarantine.") === 0 && k !== KEY + ".quarantine.meta"), [], "no timestamped copy piles up in localStorage");
  const list = await T.KOS.store.quarantines();
  eq(list.length, 2, "both copies are listed");
  const inMirror = list.find((q) => q.where === "indexeddb");
  assert(inMirror, "the second went to the mirror");
  eq(await T.KOS.store.quarantineRead(inMirror.key), b1, "and reads back byte for byte");
  await T.KOS.store.quarantineDrop(inMirror.key);
  await T.KOS.store.quarantineDrop(KEY + ".quarantine");
  eq((await T.KOS.store.quarantines()).length, 0, "each can be removed");
  eq(lsx.getItem(KEY + ".quarantine"), null, "freeing its space");
});

step("Q · Storage lists every copy set aside, with Download and Delete for each", async () => {
  const b0 = '{"v":1,"broken":0' + "y".repeat(200), b1 = '{"v":1,"broken":1' + "z".repeat(200);
  const lsx = sharedStorage(), idbx = new fake.IDBFactory();
  lsx.setItem(KEY + ".quarantine", b0);
  lsx.setItem(KEY + ".quarantine.meta", JSON.stringify({ at: 1, why: "earlier", where: "localStorage", key: KEY + ".quarantine", told: true }));
  lsx.setItem(KEY, b1);
  const T = await boot({ localStorage: lsx, indexedDB: idbx });
  await T.settle();
  T.window.__kosAutoConfirm = true;
  T.KOS.show("storage");
  for (let i = 0; i < 20; i++) await T.settle();
  const one = (s) => T.document.querySelector(s), all = (s) => [...T.document.querySelectorAll(s)];
  const card = one("[data-ui~='storage.kept']");
  assert(card && !card.hidden, "the card is shown when there is a copy");
  eq(all("[data-ui~='storage.kept-row']").length, 2, "both copies are listed");
  assert(all("[data-ui~='storage.kept-download']").length === 2, "each can be downloaded");
  const before = JSON.stringify(T.KOS.store.state);
  for (let n = 2; n > 0; n--) {
    one("[data-ui~='storage.kept-delete']").click();
    for (let i = 0; i < 20; i++) await T.settle();
  }
  eq((await T.KOS.store.quarantines()).length, 0, "Delete took each copy away");
  const after = one("[data-ui~='storage.kept']");
  assert(!after || after.hidden, "and the card goes with the last one");
  eq(JSON.stringify(T.KOS.store.state), before, "none of it touched the state");
  eq(T.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke133: " + failed + " failed" : "smoke133: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
