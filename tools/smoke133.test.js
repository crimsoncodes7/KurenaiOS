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
  assert(m.rev > +ls7.getItem(REV), "with a rev past localStorage's, so the next boot takes it");

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

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke133: " + failed + " failed" : "smoke133: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
