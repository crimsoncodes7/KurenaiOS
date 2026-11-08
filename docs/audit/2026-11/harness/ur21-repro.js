/* UR-21 repro: an AniList ANIME entry whose MAL id equals a MANGA row's MAL id
   (MAL numbers anime and manga separately; mediadb's "mal" index is global).
   Run from the repo root: node audit-evidence/2026-11/qa/ur21/repro.js */
const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../../../..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB; window.IDBKeyRange = IDBKeyRange;
for (const m of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(fs.readFileSync(path.join(ROOT, m[1]), "utf8")); } catch (e) { console.log("LOAD FAIL", m[1], e.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
const p = fn => new Promise((res, rej) => fn((e, o) => e ? rej(e) : res(o)));

const manga = [{ module: "books", title: "Death Note", status: "onHold", format: "MANGA", syncSource: "anilist", ownership: "unset",
  externalIds: { anilistId: 30021, malId: 21 }, progress: { current: 0, total: 108, volumes: 8, totalVolumes: 12 } },
  { module: "books", title: "Bleach", status: "completed", format: "MANGA", syncSource: "anilist", ownership: "unset",
  externalIds: { anilistId: 30012, malId: 12 }, progress: { current: 686, total: 686, volumes: 74, totalVolumes: 74 } }];
/* One Piece (TV): AniList 21, MAL 21 — planned in the anime list */
const anime = [{ module: "anime", title: "ONE PIECE", status: "planned", format: "TV", syncSource: "anilist",
  externalIds: { anilistId: 21, malId: 21 }, progress: { current: 0, total: null } },
  { module: "anime", title: "Clannad", status: "completed", format: "TV", syncSource: "anilist",
  externalIds: { anilistId: 2167, malId: 2167 }, progress: { current: 23, total: 23 } }];

(async () => {
  KOS.store.state.sessions = [];
  const clone = x => JSON.parse(JSON.stringify(x));
  // the manga list first (the books row exists before the anime is ever pulled)
  await p(cb => KOS.mediadb.bulkUpsert(clone(manga), KOS.media.mirrorOpts("books", []), cb));
  for (let cycle = 1; cycle <= 3; cycle++) {
    const a = await p(cb => KOS.mediadb.bulkUpsert(clone(anime), KOS.media.mirrorOpts("anime", []), cb));
    const all1 = await p(cb => KOS.mediadb.query({}, cb));
    const dn1 = all1.find(r => r.externalIds.malId === 21);
    const b = await p(cb => KOS.mediadb.bulkUpsert(clone(manga), KOS.media.mirrorOpts("books", []), cb));
    const ses = KOS.media.logSyncRewardBatch([{ module: "anime", events: a.rewards }, { module: "books", events: b.rewards }]);
    const all = await p(cb => KOS.mediadb.query({}, cb));
    const dn = all.find(r => r.externalIds.malId === 21);
    console.log(`cycle ${cycle}: anime pull added=${a.added} updated=${a.updated}; row after anime pull = ${dn1.module}/${dn1.title}/${dn1.status} ani=${dn1.externalIds.anilistId} reward=${JSON.stringify(dn1.reward)}`);
    console.log(`         books pull rewards=${JSON.stringify(b.rewards.map(r => [r.title, r.units, r.statusAdvanced]))} session award=${JSON.stringify(ses && ses.award)}`);
    console.log(`         after: rows=${all.length} [${all.map(r => r.module + ":" + r.title).join(", ")}] DN journal=${JSON.stringify(dn.journal.map(e => e.slice(1)))}`);
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
