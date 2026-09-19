/* Kurenai OS — smoke41.test.js
   The cloud three-way merge (core/cloudmerge.js) and the compare-and-set
   push that drives it (core/cloudsync.js).

   THE INCIDENT THIS STILL EXISTS FOR — 8 August 2026. A phone that had
   not been opened for weeks was launched. Its local state document was a
   stale snapshot; the laptop's was level 53 with 12,476 gold, 1,664
   sessions, a chosen avatar and banner, and a populated Budget Planner.
   Under whole-document last-write-wins the phone's copy won, and every
   one of those was replaced by the older values.

   The first answer was a guard: refuse the push and ask the user which
   copy to keep. That closed the loss and opened a dialog — an ordinary
   two-device day now needed a decision, and a decision is exactly what a
   sync engine is for. This suite replaces the guard with a merge: the
   push is a compare-and-set on the document's sequence, a lost race
   pulls the cloud copy in, merges it three-way against the last agreed
   document, and pushes the result. Nothing is outvoted and nobody is
   asked.

   TESTED PROPERTIES:
   1.  Records merge by id: additions from both sides survive, a deletion
       on either side wins, a record edited on both keeps the later edit
       field by field.
   2.  Gold, XP and HP are additive against the base (base + Δ + Δ,
       clamped); without a base they take the larger value.
   3.  Owned cosmetics union; nextId counters take the max.
   4.  Two devices minting the same id for different records: the local
       record is re-keyed and every reference to it rewritten (calendar
       study block → assignment, custom card → srs schedule, notified
       keys); nested counters are respected.
   5.  Sessions union by id+origin, sort by ts and keep the cap.
   6.  progress merges per topic with the checklist element-wise, and the
       status agrees with the checklist afterwards.
   7.  THE INCIDENT as a regression: the stale device's one edit lands
       and the richer cloud copy loses nothing — automatically.
   8.  A push that loses the compare-and-set race merges and retries; two
       devices editing between each other's syncs both land.
   9.  A pull onto a device with unsynced edits merges instead of
       replacing, and the merged document is pushed in the same cycle.
   10. Without a stored base (an upgrade from the whole-document era) the
       merge still combines and never doubles a counter.
   11. focus.active is per-device: a running timer never lands elsewhere.
   12. The ordinary two-device round trip raises nothing.
   13. An explicit restore still overwrites a newer cloud copy.
   14. __seq never leaks into app state.
   15. The engine exposes no decision: linkStatus() is null and no
       "attention" state is ever emitted.

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
const merge = (b, l, r) => KOS.cloudmerge.merge(b, l, r);

/* ============ 1 · the pure merge ============ */
const steps = [];
function step(name, fn) { steps.push([name, fn]); }

const rec = (id, extra) => Object.assign({ id, title: "r" + id, created: 1700000000000 + id, updatedAt: 1700000000000 + id }, extra || {});

step("records merge by id: both additions survive, a deletion on either side wins", () => {
  const base = { v: 1, progress: {}, reminders: { nextId: 4, items: [rec(1), rec(2), rec(3)], lists: [] } };
  const local = clone(base);
  local.reminders.items = [rec(1), rec(3), rec(4)];                 // deleted 2, added 4
  local.reminders.nextId = 5;
  const remote = clone(base);
  remote.reminders.items = [rec(1, { notes: "edited elsewhere" }), rec(2), rec(5)];   // deleted 3, added 5, edited 1
  remote.reminders.nextId = 6;
  const out = merge(base, local, remote).doc;
  const ids = out.reminders.items.map(r => r.id).sort();
  assert(ids.join(",") === "1,4,5", "expected items 1,4,5 — got " + ids.join(","));
  assert(out.reminders.items.find(r => r.id === 1).notes === "edited elsewhere", "the remote edit to a kept record was lost");
  assert(out.reminders.nextId === 6, "nextId did not take the max: " + out.reminders.nextId);
});

step("a record edited on both sides keeps the later edit field by field", () => {
  const base = { v: 1, progress: {}, assignments: { nextId: 2, items: [rec(1, { status: "todo", notes: "", progress: 0 })] } };
  const local = clone(base);
  local.assignments.items[0].notes = "my notes";                       // local: notes
  local.assignments.items[0].updatedAt = 1700000005000;
  const remote = clone(base);
  remote.assignments.items[0].status = "done";                        // remote: status
  remote.assignments.items[0].progress = 100;
  remote.assignments.items[0].updatedAt = 1700000009000;
  /* and both touched the same field — the later stamp wins it */
  local.assignments.items[0].title = "local title";
  remote.assignments.items[0].title = "remote title";
  const it = merge(base, local, remote).doc.assignments.items[0];
  assert(it.notes === "my notes", "the local field edit was lost");
  assert(it.status === "done" && it.progress === 100, "the remote field edits were lost");
  assert(it.title === "remote title", "the same-field war was not settled by updatedAt: " + it.title);
  assert(it.updatedAt === 1700000009000, "updatedAt did not follow the later edit");
});

step("gold, XP and HP are additive against the base; without a base they take the max", () => {
  const base = { v: 1, progress: {}, governor: { hp: 80, gold: 100, xp: 1000, owned: ["a"] } };
  const local = clone(base); local.governor.gold = 50;   local.governor.xp = 1100; local.governor.hp = 70;   // spent 50, earned 100, lost 10
  const remote = clone(base); remote.governor.gold = 130; remote.governor.xp = 1300; remote.governor.hp = 95; // earned 30 & 300, gained 15
  const g = merge(base, local, remote).doc.governor;
  assert(g.gold === 80, "gold should be 100 - 50 + 30 = 80, got " + g.gold);
  assert(g.xp === 1400, "xp should be 1000 + 100 + 300 = 1400, got " + g.xp);
  assert(g.hp === 85, "hp should be 80 - 10 + 15 = 85, got " + g.hp);
  const clampL = clone(base); clampL.governor.hp = 100;
  const clampR = clone(base); clampR.governor.hp = 100;
  assert(merge(base, clampL, clampR).doc.governor.hp === 100, "hp exceeded its clamp");
  const nb = merge(null, local, remote).doc.governor;
  assert(nb.gold === 130 && nb.xp === 1300, "no-base counters should take the max, got " + nb.gold + "/" + nb.xp);
});

step("owned cosmetics union; a purchase on each device survives", () => {
  const base = { v: 1, progress: {}, governor: { owned: ["theme:a"] } };
  const local = clone(base); local.governor.owned.push("theme:b");
  const remote = clone(base); remote.governor.owned.push("frame:c");
  const owned = merge(base, local, remote).doc.governor.owned;
  assert(owned.indexOf("theme:a") !== -1 && owned.indexOf("theme:b") !== -1 && owned.indexOf("frame:c") !== -1,
    "owned did not union: " + owned.join(","));
  assert(owned.length === 3, "owned duplicated: " + owned.join(","));
});

step("colliding ids re-key the local record and rewrite every reference", () => {
  const base = {
    v: 1, progress: {},
    assignments: { nextId: 3, items: [rec(1), rec(2)] },
    calendar: { nextId: 2, events: [{ id: 1, title: "old", created: 1, assignmentId: 2 }], notified: { "2026-08-08|1|2026-08-08|30": true } },
    custom: { nextId: 2, cards: [{ id: 1, q: "q1", a: "a1", created: "2026-08-01" }] },
    srs: { "u1": { reps: 3 } }
  };
  const local = clone(base);
  local.assignments.items.push(rec(3, { title: "LOCAL assignment", created: 1700000000003 }));
  local.assignments.nextId = 4;
  local.calendar.events.push({ id: 2, title: "local block", created: 1700000000010, assignmentId: 3 });
  local.calendar.notified["2026-08-09|2|2026-08-09|30"] = true;
  local.calendar.nextId = 3;
  local.custom.cards.push({ id: 2, q: "local q", a: "local a", created: "2026-08-09" });
  local.custom.nextId = 3;
  local.srs.u2 = { reps: 1, tag: "local" };
  const remote = clone(base);
  remote.assignments.items.push(rec(3, { title: "REMOTE assignment", created: 1700000000999 }));
  remote.assignments.nextId = 4;
  remote.calendar.events.push({ id: 2, title: "remote exam", created: 1700000000020, assignmentId: null });
  remote.calendar.nextId = 3;
  remote.custom.cards.push({ id: 2, q: "remote q — entirely different", a: "remote a — entirely different", created: "2026-08-09" });
  remote.custom.nextId = 3;
  remote.srs.u2 = { reps: 7, tag: "remote" };

  const res = merge(base, local, remote);
  const out = res.doc;
  assert(res.rekeyed === 3, "expected 3 re-keyed records, got " + res.rekeyed);
  const as = out.assignments.items;
  assert(as.length === 4, "an assignment was lost to the collision: " + as.length);
  const loc = as.find(a => a.title === "LOCAL assignment"), rem = as.find(a => a.title === "REMOTE assignment");
  assert(rem.id === 3, "the remote record must keep its id (its device already holds it)");
  assert(loc.id === 4, "the local record was not re-keyed past every id in play: " + loc.id);
  assert(out.assignments.nextId === 5, "nextId did not move past the re-keyed id: " + out.assignments.nextId);
  const block = out.calendar.events.find(e => e.title === "local block");
  assert(block && block.assignmentId === 4, "the study block still points at the old assignment id");
  assert(block.id === 3, "the colliding event was not re-keyed: " + block.id);
  assert(out.calendar.notified["2026-08-09|3|2026-08-09|30"] === true && !out.calendar.notified["2026-08-09|2|2026-08-09|30"],
    "the notified key still names the old event id");
  assert(out.calendar.events.find(e => e.title === "remote exam").id === 2, "the remote event lost its id");
  const card = out.custom.cards.find(c => c.q === "local q");
  assert(card && card.id === 3, "the local card was not re-keyed: " + (card && card.id));
  assert(out.srs.u3 && out.srs.u3.tag === "local", "the local card's schedule did not follow it to u3");
  assert(out.srs.u2 && out.srs.u2.tag === "remote", "the remote card's schedule was overwritten");
});

step("the same record seen twice with the same id is one record, not a collision", () => {
  /* no base (an upgrade): the same reminder edited on one side */
  const a = { id: 7, title: "Buy ink", notes: "", done: false, created: "2026-08-01", updatedAt: 1700000001000 };
  const b = { id: 7, title: "Buy ink", notes: "black, 0.5", done: true, created: "2026-08-01", updatedAt: 1700000002000 };
  const out = merge(null, { v: 1, progress: {}, reminders: { nextId: 8, items: [a] } },
                          { v: 1, progress: {}, reminders: { nextId: 8, items: [b] } }).doc;
  assert(out.reminders.items.length === 1, "one reminder became two: " + out.reminders.items.length);
  assert(out.reminders.items[0].done === true && out.reminders.items[0].notes === "black, 0.5", "the later edit did not win");
});

step("sessions union by id and origin, sort by ts, keep the cap", () => {
  const S = (id, ts) => ({ id, ts, date: "2026-08-08", type: "focus", dur: 60, metrics: {} });
  const base = { v: 1, progress: {}, sessions: [S(1, 1000), S(2, 2000)] };
  const local = clone(base); local.sessions.push(S(3, 3000));
  const remote = clone(base); remote.sessions.push(S(3, 3500), S(4, 4000));   // a different session that also minted 3
  const out = merge(base, local, remote).doc.sessions;
  assert(out.length === 5, "sessions did not union: " + out.length);
  const ts = out.map(s => s.ts);
  assert(ts.join(",") === "1000,2000,3000,3500,4000", "sessions not in ts order: " + ts.join(","));
  const ids = out.map(s => s.id);
  assert(new Set(ids).size === 5, "session ids collide after the merge: " + ids.join(","));
  assert(out.find(s => s.ts === 3500).id === 3, "the remote session lost its id");
  /* the cap */
  const big = { v: 1, progress: {}, sessions: Array.from({ length: 1990 }, (_, i) => S(i + 1, i + 1)) };
  const bl = clone(big); for (let i = 0; i < 10; i++) bl.sessions.push(S(2000 + i, 5000 + i));
  const br = clone(big); for (let i = 0; i < 10; i++) br.sessions.push(S(3000 + i, 6000 + i));
  const capped = merge(big, bl, br).doc.sessions;
  assert(capped.length === 2000, "the session cap was not honoured: " + capped.length);
  assert(capped[capped.length - 1].ts === 6009 && capped[0].ts === 11, "the cap dropped the wrong end");
});

step("progress merges per topic, the checklist element-wise, and status agrees afterwards", () => {
  const base = { v: 1, progress: { "cs:1": { status: "started", check: [true, false, false, false], note: "" } } };
  const local = clone(base);
  local.progress["cs:1"].check = [true, true, true, false];
  local.progress["cs:1"].note = "local note";
  local.progress["cs:2"] = { status: "started", check: [false, false, false, false], note: "" };
  const remote = clone(base);
  remote.progress["cs:1"].check = [true, false, false, true];
  remote.progress["cs:3"] = { status: "done", check: [true, true, true, true], note: "" };
  const out = merge(base, local, remote).doc.progress;
  assert(out["cs:1"].check.join() === "true,true,true,true", "checks did not merge element-wise: " + out["cs:1"].check.join());
  assert(out["cs:1"].status === "done", "status did not follow a fully ticked checklist: " + out["cs:1"].status);
  assert(out["cs:1"].note === "local note", "the local note was lost");
  assert(out["cs:2"] && out["cs:3"], "a topic added on one side was lost");
});

/* ============ 2 · the engine ============ */
let clock = Date.parse("2026-08-01T00:00:00Z");
const sv = { state: null, calls: { upsertState: 0, fetchState: 0, conflicts: 0 }, statuses: [] };
const stamp = () => new Date(clock += 1000).toISOString();
const remoteSeq = () => sv.state ? (sv.state.state_json.__seq || 0) : 0;
const api = {
  fetchState: cb => { sv.calls.fetchState++; cb(null, sv.state ? clone(sv.state) : null); },
  /* compare-and-set, exactly as the real row filter behaves */
  upsertState: (json, expected, cb) => {
    sv.calls.upsertState++;
    if (expected !== null && expected !== undefined) {
      const lost = expected === 0 ? !!sv.state : remoteSeq() !== expected;
      if (lost) { sv.calls.conflicts++; cb(null, null); return; }
    }
    sv.state = { state_json: clone(json), updated_at: stamp() };
    cb(null, { updated_at: sv.state.updated_at });
  },
  fetchMediaSince: (i, o, cb) => cb(null, []), upsertMedia: (r, cb) => cb(null, []),
  countMedia: cb => cb(null, 0), listMediaIds: (o, cb) => cb(null, []),
  fetchFilesSince: (i, o, cb) => cb(null, []), upsertFiles: (r, cb) => cb(null, []),
  listFileIds: (o, cb) => cb(null, []), markUploaded: (f, cb) => cb(null, [{}]),
  uploadBinary: (a, b, c, cb) => cb(null, {}), downloadBinary: (a, cb) => cb(new Error("none")),
  removeBinary: (a, cb) => cb(null)
};
KOS.cloudsync._config({ api, session: { userId: "u1", email: "e@t" }, quiet: true,
  pushDebounce: 10 * 60 * 1000, minPullGap: 0, bootDelay: 0 });
KOS.cloudsync.onStatus(s => sv.statuses.push(s.state));
const sync = () => p(cb => KOS.cloudsync.syncNow(cb));

/* the two documents, modelled on the real incident */
const RICH = () => ({
  v: 1, progress: { "compsci:4.1.1.1": { status: "done", check: [true, true, true, true], note: "" } },
  sessions: Array.from({ length: 1664 }, (_, i) => ({ id: i + 1, ts: 1700000000000 + i * 1000, date: "2026-08-08", type: "media", dur: 60, metrics: {} })),
  governor: { hp: 1, gold: 12476, xp: 72312, owned: ["theme-celestial-duality"], theme: "celestial-duality",
    avatar: { kind: "img", id: "a", img: "LAPTOP-AVATAR", crop: null, frame: "f4" }, banner: "LAPTOP-BANNER" },
  wishlist: { nextId: 9, budget: { monthlyLimit: 60, currency: "GBP", history: [] },
    items: [{ id: 1, module: "books", title: "planned purchase", addedAt: 1700000000000 }] }
});
const STALE = () => ({
  v: 1, progress: {},
  sessions: Array.from({ length: 400 }, (_, i) => ({ id: i + 1, ts: 1700000000000 + i * 1000, date: "2026-07-22", type: "focus", dur: 60, metrics: {} })),
  governor: { hp: 60, gold: 3000, xp: 20000, owned: [], theme: "",
    avatar: { kind: "none", id: "", img: "", crop: null, frame: "" }, banner: "" },
  wishlist: { nextId: 1, budget: { monthlyLimit: 0, currency: "GBP", history: [] }, items: [] }
});
const cloudDoc = () => sv.state && sv.state.state_json;
const gold = () => cloudDoc().governor.gold;
const baseKey = "cloudsync.base.u1";

/* Put this device in the position of the laptop: rich state, in the cloud,
   in step. Returns the document the cloud now holds. */
async function beLaptop() {
  KOS.store.replaceState(RICH());
  await sync();
  assert(sv.state, "setup: the laptop never established the cloud copy");
  return clone(sv.state.state_json);
}
/* Put this device in the position of the dormant phone: it last agreed
   with the cloud on the STALE document (its base), the laptop has since
   written the rich one several times over, and the phone is reopened
   still holding its stale copy. */
async function bePhone(laptopDoc) {
  KOS.store.replaceState(STALE());
  await sync();                                   // this device's own baseline (and its base)
  assert(gold() === 3000, "setup: the phone's baseline did not push");
  const ahead = clone(laptopDoc);
  ahead.__seq = remoteSeq() + 4;                  // the laptop kept working
  sv.state = { state_json: ahead, updated_at: stamp() };
  KOS.store.replaceState(STALE());                // reopened, still stale
}

step("THE INCIDENT: a stale device with one real edit merges into the richer cloud copy — nothing lost, nobody asked", async () => {
  const laptop = await beLaptop();
  await bePhone(laptop);
  sv.statuses.length = 0;

  KOS.store.state.progress["compsci:one-real-edit"] = { status: "started", check: [false, false, false, false], note: "" };
  KOS.store.save();
  await sync();

  assert(gold() === 12476, "the laptop's gold was overwritten: 12476 -> " + gold());
  assert(cloudDoc().sessions.length === 1664, "the session ledger was truncated to " + cloudDoc().sessions.length);
  assert(cloudDoc().governor.avatar.img === "LAPTOP-AVATAR", "the avatar was lost");
  assert(cloudDoc().governor.banner === "LAPTOP-BANNER", "the banner was lost");
  assert(cloudDoc().governor.theme === "celestial-duality", "the theme was lost");
  assert(cloudDoc().wishlist.items.length === 1, "the Budget Planner was emptied");
  assert(cloudDoc().progress["compsci:one-real-edit"], "the phone's own edit never reached the cloud");
  assert(cloudDoc().progress["compsci:4.1.1.1"], "the laptop's progress was lost");
  assert(KOS.store.state.governor.gold === 12476, "the phone did not adopt the laptop's gold locally");
  assert(sv.statuses.indexOf("attention") === -1, "the engine asked the user to decide");
  assert(sv.statuses[sv.statuses.length - 1] === "synced", "the cycle did not end synced: " + sv.statuses.join(" → "));
  assert(KOS.cloudsync.getStatus().state === "synced", "status is not synced");
});

step("a push that loses the compare-and-set race merges the newer copy and retries", async () => {
  await beLaptop();
  /* the other device writes between our pull and our push */
  const other = clone(cloudDoc());
  other.governor.gold += 10;
  other.progress["maths:other"] = { status: "started", check: [false, false, false, false], note: "" };
  other.__seq = remoteSeq() + 1;
  sv.state = { state_json: other, updated_at: stamp() };
  KOS.store.state.progress["compsci:mine"] = { status: "started", check: [false, false, false, false], note: "" };
  KOS.store.state.governor.gold += 5;
  KOS.store.save();
  sv.calls.conflicts = 0;
  await sync();
  assert(sv.calls.conflicts >= 1, "the fake never reported a lost race — the test proves nothing");
  assert(cloudDoc().progress["compsci:mine"] && cloudDoc().progress["maths:other"], "one side's edit was lost in the race");
  assert(gold() === 12476 + 15, "gold should combine both deltas (12476 + 10 + 5), got " + gold());
  assert(KOS.store.state.governor.gold === gold(), "local and cloud gold disagree after the merge");
  assert(cloudDoc().__seq === other.__seq + 1, "the merged document did not land after the other device's write");
});

step("a pull onto a device holding unsynced edits merges and pushes in the same cycle", async () => {
  await beLaptop();
  /* make the push phase a no-op for the state doc so the PULL sees the
     dirt: the hash says clean, but the document has moved */
  const other = clone(cloudDoc());
  other.governor.xp += 500;
  other.__seq = remoteSeq() + 1;
  sv.state = { state_json: other, updated_at: stamp() };
  const localXp = KOS.store.state.governor.xp;
  KOS.store.state.governor.xp = localXp + 20;
  KOS.store.state.progress["it:pull-merge"] = { status: "started", check: [false, false, false, false], note: "" };
  KOS.store.save();
  const pushes = sv.calls.upsertState;
  await sync();
  assert(KOS.store.state.governor.xp === localXp + 520, "xp did not combine on the pull: " + KOS.store.state.governor.xp);
  assert(cloudDoc().governor.xp === localXp + 520, "the merged xp did not reach the cloud in the same cycle");
  assert(cloudDoc().progress["it:pull-merge"], "the local edit did not reach the cloud in the same cycle");
  assert(sv.calls.upsertState > pushes, "no push happened at all");
  assert(KOS.cloudsync.getStatus().state === "synced", "not synced after the merge cycle");
});

step("without a stored base the merge still combines and never doubles a counter", async () => {
  await beLaptop();
  const other = clone(cloudDoc());
  other.governor.gold = 12476 + 100;
  other.progress["maths:no-base"] = { status: "started", check: [false, false, false, false], note: "" };
  other.__seq = remoteSeq() + 1;
  sv.state = { state_json: other, updated_at: stamp() };
  await p(cb => KOS.mediadb.setKV(baseKey, null, cb));          // the base is gone
  KOS.store.state.progress["compsci:no-base"] = { status: "started", check: [false, false, false, false], note: "" };
  KOS.store.save();
  await sync();
  assert(gold() === 12576, "no-base gold should take the larger value, got " + gold());
  assert(cloudDoc().sessions.length === 1664, "sessions doubled or were lost: " + cloudDoc().sessions.length);
  assert(cloudDoc().progress["compsci:no-base"] && cloudDoc().progress["maths:no-base"], "an edit was lost without a base");
  const base = await p(cb => KOS.mediadb.getKV(baseKey, cb));
  assert(base && base.progress, "the successful push did not write a fresh base");
});

step("focus.active is per-device: a running timer on another device never lands here", async () => {
  await beLaptop();
  KOS.store.state.focus.active = null;
  KOS.store.save();
  await sync();
  const other = clone(cloudDoc());
  other.focus = { active: { id: "f9", mode: "pomodoro", startedAt: 1 }, nextId: 10, lastConfig: { mode: "pomodoro" } };
  other.__seq = remoteSeq() + 1;
  sv.state = { state_json: other, updated_at: stamp() };
  await sync();
  assert(KOS.store.state.focus.active === null, "another device's running timer landed on this one");
  /* and ours never leaves */
  KOS.store.state.focus.active = { id: "f11", mode: "pomodoro", startedAt: 2 };
  KOS.store.state.progress["compsci:with-timer"] = { status: "started", check: [false, false, false, false], note: "" };
  KOS.store.save();
  await sync();
  assert(!(cloudDoc().focus && cloudDoc().focus.active), "this device's running timer was pushed");
  KOS.store.state.focus.active = null;
});

step("the ordinary two-device round trip raises nothing", async () => {
  await beLaptop();
  for (let round = 0; round < 3; round++) {
    const remote = clone(cloudDoc());
    remote.governor.gold += 10;
    remote.__seq = remote.__seq + 1;
    sv.state = { state_json: remote, updated_at: stamp() };
    await sync();                                   // pull the other device's write
    assert(KOS.store.state.governor.gold === remote.governor.gold,
      "round " + round + ": the other device's write was not adopted");
    KOS.store.state.progress["compsci:round" + round] = { status: "started", check: [false, false, false, false], note: "" };
    KOS.store.save();
    await sync();                                   // our own edit goes up
    assert(cloudDoc().progress["compsci:round" + round], "the in-step push did not land on round " + round);
    assert(KOS.cloudsync.getStatus().state === "synced", "round " + round + " did not end synced");
  }
});

step("two ticked progress checks survive every direction of a two-device day", async () => {
  /* the report: "I ticked two boxes, the next day they were unticked". Walk
     the real store path (setCheck) through every cloud direction a second
     device can introduce and assert the ticks are never lost. */
  const KEY = "compsci:4.2.1.3";
  const ticks = doc => ((doc.progress || {})[KEY] || { check: [] }).check.join();
  await beLaptop();
  KOS.store.setCheck("compsci", "4.2.1.3", 0, true);
  KOS.store.setCheck("compsci", "4.2.1.3", 1, true);
  const st = KOS.store.state.progress[KEY];
  assert(st.check.join() === "true,true,false,false" && st.status === "started", "setCheck did not record the ticks");

  /* 1 · the phone pushed an unrelated change BEFORE the laptop's push: the
     laptop loses the compare-and-set race, merges and retries */
  const phone1 = clone(cloudDoc());                 // the phone's copy predates the ticks
  phone1.governor.gold += 5;
  phone1.__seq = remoteSeq() + 1;
  sv.state = { state_json: phone1, updated_at: stamp() };
  await sync();
  assert(ticks(cloudDoc()) === "true,true,false,false", "1: the ticks lost the push race: " + ticks(cloudDoc()));
  assert(KOS.store.state.governor.gold === phone1.governor.gold, "1: the phone's gold was not merged in");

  /* 2 · the phone, still holding its stale base and stale local copy, runs
     ITS cycle: it merges the cloud (with the ticks) against its base the
     way the engine does, and pushes the result with one more edit */
  const phoneBase = clone(phone1); delete phoneBase.__seq;
  const phoneLocal = clone(phoneBase);
  phoneLocal.progress["maths:phone-edit"] = { status: "started", check: [false, false, false, false], note: "" };
  const cloudNow = clone(cloudDoc()); delete cloudNow.__seq;
  const phoneMerged = KOS.cloudmerge.merge(phoneBase, phoneLocal, cloudNow).doc;
  assert(ticks(phoneMerged) === "true,true,false,false", "2: the phone's merge dropped the ticks: " + ticks(phoneMerged));
  phoneMerged.__seq = remoteSeq() + 1;
  sv.state = { state_json: phoneMerged, updated_at: stamp() };

  /* 3 · the laptop is CLEAN (nothing changed since its push) and pulls the
     phone's newer copy — the wholesale adopt path */
  await sync();
  assert(KOS.store.state.progress[KEY].check.join() === "true,true,false,false", "3: adopting the phone's copy unticked the boxes");
  assert(KOS.store.state.progress["maths:phone-edit"], "3: the phone's edit did not arrive");

  /* 4 · the next day: the laptop reopens with the ticks, the phone has
     pushed twice more without touching the topic — merge, adopt, merge */
  for (let day = 0; day < 2; day++) {
    const next = clone(cloudDoc());
    next.governor.xp += 100;
    next.__seq = next.__seq + 1;
    sv.state = { state_json: next, updated_at: stamp() };
    KOS.store.state.progress["it:day" + day] = { status: "started", check: [false, false, false, false], note: "" };
    KOS.store.save();
    await sync();
    assert(ticks(cloudDoc()) === "true,true,false,false" && KOS.store.state.progress[KEY].check.join() === "true,true,false,false",
      "4: day " + day + " lost the ticks: cloud " + ticks(cloudDoc()));
  }
  /* 5 · and a stale phone with NO base (fresh install adopting the account)
     must still not erase them */
  await p(cb => KOS.mediadb.setKV(baseKey, null, cb));
  const fresh = clone(cloudDoc()); fresh.__seq = fresh.__seq + 1;
  sv.state = { state_json: fresh, updated_at: stamp() };
  await sync();
  assert(ticks(cloudDoc()) === "true,true,false,false", "5: a no-base cycle lost the ticks");
  assert(KOS.cloudsync.getStatus().state === "synced", "the day did not end synced");
});

step("an explicit restore re-baseline still overwrites a newer cloud copy", async () => {
  const laptop = await beLaptop();
  await bePhone(laptop);
  /* a restore is the user saying "this backup is the truth for this account" */
  KOS.store.state.progress["compsci:from-backup"] = { status: "done", check: [true, true, true, true], note: "" };
  KOS.store.save();
  await p(cb => { KOS.cloudsync.noteRestore(); setTimeout(() => cb(null), 0); });
  await sync();
  assert(cloudDoc().progress["compsci:from-backup"], "the restored document did not reach the cloud");
  assert(gold() === 3000, "the restore did not overwrite: cloud gold is " + gold());
});

step("__seq never leaks into app state", async () => {
  await beLaptop();
  const row = { state_json: Object.assign(clone(cloudDoc()), { __seq: remoteSeq() + 1 }), updated_at: stamp() };
  row.state_json.governor.gold = 999;
  sv.state = row;
  await sync();
  assert(!("__seq" in KOS.store.state), "__seq landed in app state — it would feed the dirty hash");
  assert(KOS.store.state.governor.gold === 999, "the newer copy did not apply");
});

step("the engine exposes no decision", () => {
  assert(KOS.cloudsync.linkStatus() === null, "linkStatus reports a pending decision");
  assert(typeof KOS.cloudsync.resolveStale === "undefined" && typeof KOS.cloudsync.resolveBoth === "undefined",
    "the decision-era resolutions are still exported");
  assert(sv.statuses.indexOf("attention") === -1, "an attention state was emitted during the suite");
  const src = fs.readFileSync(path.join(ROOT, "js/modules/cloudui.js"), "utf8");
  assert(!/Use the cloud copy|Keep this device/.test(src), "the Archive card still offers a which-copy dialog");
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
  console.log("SMOKE41 PASS — the cloud three-way merge verified (" + pass + " steps).");
  process.exit(0);
})();
