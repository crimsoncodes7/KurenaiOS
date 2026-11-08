/* Kurenai OS — smoke114.test.js
   Provider identity is per MODULE (invariant 11; quality audit DI-27, UR-21).

   MyAnimeList numbers anime and manga separately: MAL 21 is both One Piece
   (TV) and the Death Note manga. bulkUpsert used to look up the GLOBAL
   anilist/mal/vndb indexes, so an anime pull merged One Piece INTO the
   Death Note books row, and the books pull 2.5 s later merged it back —
   paying a sync reward on every autosync cycle (1,741 ledger entries on the
   user's account by 8 Nov 2026) and never creating the anime's own row.

   The claims:

     A · a manga row and an anime sharing its MAL id are TWO rows; the manga
         row keeps its module, title, status and volumes through every pull.
     B · repeated anime + books pulls pay nothing after the first silent
         absorb (no reward on an unchanged echo, invariant 17), and the
         manga's journal gains no volumes or status ping-pong.
     C · a real advance on the manga still pays once (the fix does not
         silence genuine progress).
     D · within one module the anilist and mal matches still merge (no
         duplicate row for the same title).

   Run: node tools/smoke114.test.js */
"use strict";
const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB; window.IDBKeyRange = IDBKeyRange;
const loadErrors = [];
for (const m of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(fs.readFileSync(path.join(ROOT, m[1]), "utf8")); } catch (e) { loadErrors.push(m[1] + ": " + e.message); }
}
const K = window.KOS;
if (K.autosync && K.autosync.stop) K.autosync.stop();

function assert(c, msg) { if (!c) throw new Error(msg); }
function eq(a, b, msg) { if (a !== b) throw new Error(msg + " — expected " + JSON.stringify(b) + ", got " + JSON.stringify(a)); }
const p = (fn) => new Promise((res, rej) => fn((e, o) => e ? rej(e) : res(o)));
const clone = (x) => JSON.parse(JSON.stringify(x));
const up = (list, mod) => p((cb) => K.mediadb.bulkUpsert(clone(list), K.media.mirrorOpts(mod, []), cb));
const all = () => p((cb) => K.mediadb.query({}, cb));

const manga = [
  { module: "books", title: "Death Note", status: "onHold", format: "MANGA", syncSource: "anilist", ownership: "unset",
    externalIds: { anilistId: 30021, malId: 21 }, progress: { current: 0, total: 108, volumes: 8, totalVolumes: 12 } },
  { module: "books", title: "Bleach", status: "completed", format: "MANGA", syncSource: "anilist", ownership: "unset",
    externalIds: { anilistId: 30012, malId: 12 }, progress: { current: 686, total: 686, volumes: 74, totalVolumes: 74 } },
];
const anime = [
  { module: "anime", title: "ONE PIECE", status: "planned", format: "TV", syncSource: "anilist",
    externalIds: { anilistId: 21, malId: 21 }, progress: { current: 0, total: null } },
  { module: "anime", title: "Clannad", status: "completed", format: "TV", syncSource: "anilist",
    externalIds: { anilistId: 2167, malId: 2167 }, progress: { current: 23, total: 23 } },
];

const steps = [];
const step = (name, fn) => steps.push([name, fn]);
let paid = [];

step("A · a manga and an anime sharing a MAL id are two rows", async () => {
  await up(manga, "books");
  for (let c = 0; c < 3; c++) {
    const a = await up(anime, "anime");
    const mid = await all();
    const dn = mid.find((r) => r.module === "books" && r.title === "Death Note");
    assert(dn, "the Death Note books row survives the anime pull (cycle " + (c + 1) + ")");
    eq(dn.status, "onHold", "the manga keeps its status through the anime pull");
    const b = await up(manga, "books");
    paid.push(a.rewards.length + b.rewards.length);
  }
  const rows = await all();
  eq(rows.length, 4, "four rows: two manga, two anime");
  const op = rows.find((r) => r.module === "anime" && r.externalIds.anilistId === 21);
  assert(op && op.title === "ONE PIECE", "One Piece has its own anime row");
  const dn = rows.find((r) => r.module === "books" && r.externalIds.malId === 21);
  eq(dn.title, "Death Note", "the manga row is still Death Note");
  eq(dn.externalIds.anilistId, 30021, "the manga keeps its own AniList id");
  eq(dn.progress.volumes, 8, "the manga keeps its volumes");
});

step("B · repeated pulls pay nothing and journal no ping-pong", async () => {
  eq(paid.reduce((s, n) => s + n, 0), 0, "no sync reward over three anime + books cycles");
  const dn = (await all()).find((r) => r.module === "books" && r.title === "Death Note");
  const pingPong = (dn.journal || []).filter((e) => e[1] === "volumes" || e[1] === "status");
  eq(pingPong.length, 0, "no volumes/status events from echoes: " + JSON.stringify(dn.journal));
});

step("C · a genuine advance on the manga still pays once", async () => {
  const next = clone(manga);
  next[0].status = "inProgress"; next[0].progress.current = 12;
  const b = await up(next, "books");
  eq(b.rewards.length, 1, "one reward for the real advance");
  eq(b.rewards[0].title, "Death Note", "for Death Note");
  const again = await up(next, "books");
  eq(again.rewards.length, 0, "its echo pays nothing");
});

step("D · within one module the identity still merges", async () => {
  const renamed = clone(anime);
  renamed[0].title = "One Piece";          // same ids, AniList's English title
  await up(renamed, "anime");
  const rows = await all();
  eq(rows.filter((r) => r.module === "anime" && r.externalIds.anilistId === 21).length, 1, "still one One Piece row");
  eq(rows.length, 4, "no duplicate made");
  assert(loadErrors.length === 0, "scripts loaded: " + loadErrors.join(" | "));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke114: " + failed + " failed" : "smoke114: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
