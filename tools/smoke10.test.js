/* Kurenai OS — smoke10.test.js
   Build 3h suite: the VNDB duplication bug (root cause: the live Kana
   /ulist response does NOT return `vn.id` inside the nested vn record —
   the VN id only exists at the TOP LEVEL of each row, so mapListEntry
   built vndbId = null and every re-sync inserted the whole list fresh),
   the title-claim fallback that lets a fixed sync adopt damaged/manual
   rows, the one-time dedup pass, and the import-mode control
   (update-and-add vs replace-from-source) for AniList, VNDB and XML.
   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke10.test.js

   LIVE FACT backing every mock in this file (verified 2026-07-04):
     POST https://api.vndb.org/kana/ulist with fields
     "id, vote, labels.id, labels.label, vn.id, vn.title" answers rows
     shaped {"id":"v1","labels":[…],"vn":{"title":"…"},"vote":30} —
     `vn.id` is requested but NEVER returned; the row's own `id` IS the
     VN id. smoke6's original mocks invented a vn.id field reality never
     sends, which is why the duplication shipped.                        */
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

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();   // no timer-driven pulls polluting netLog mid-suite (3j)

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(err.message || String(err))) : res(out))); }

/* one ulist row EXACTLY as the live API answers it — the nested vn
   record carries NO id, even when vn.id is in the requested fields */
function liveUlistRow(id, title, labelId, vote, extra) {
  return Object.assign({
    id: id,                       // the VN id lives HERE, nowhere else
    vote: vote != null ? vote : null,
    notes: "", started: null, finished: null,
    labels: [{ id: labelId, label: "x" }],
    vn: {                         // ← no `id` key, matching reality
      title: title, alttitle: null,
      image: { url: "https://t.vndb.org/cv/x.jpg" },
      length: 3, length_minutes: null,
      developers: [{ name: "Key" }],
      tags: [{ name: "Drama", category: "cont", rating: 2.4, spoiler: 0 }]
    }
  }, extra || {});
}
const vnRows = mod => p(cb => KOS.mediadb.query({ module: mod || "vn" }, cb));

/* ============ 1 · the duplication bug itself ============ */
console.log("== root cause: vndbId from the live ulist shape ==");
step("mapListEntry takes the VN id from the ROW (vn.id does not exist live)", async () => {
  const m = KOS.vndb.mapListEntry(liveUlistRow("v17", "Ever17", 2, 80));
  if (m.externalIds.vndbId !== "v17")
    throw new Error("vndbId must come from the row id — got " + JSON.stringify(m.externalIds.vndbId));
  if (m.title !== "Ever17" || m.status !== "completed" || m.score !== 8) throw new Error("mapping regressed");
});

step("re-running an identical VNDB sync updates — NEVER duplicates", async () => {
  const mapped1 = [liveUlistRow("v17", "Ever17", 2, 80), liveUlistRow("v11", "Air", 1, null)]
    .map(KOS.vndb.mapListEntry);
  const r1 = await p(cb => KOS.mediadb.bulkUpsert(mapped1, {}, cb));
  if (r1.added !== 2) throw new Error("first sync should insert 2, got " + JSON.stringify(r1));
  const mapped2 = [liveUlistRow("v17", "Ever17", 2, 90), liveUlistRow("v11", "Air", 2, 70)]
    .map(KOS.vndb.mapListEntry);
  const r2 = await p(cb => KOS.mediadb.bulkUpsert(mapped2, {}, cb));
  if (r2.added !== 0 || r2.updated !== 2)
    throw new Error("re-sync must match by vndbId (0 added, 2 updated) — got " + JSON.stringify(r2));
  const rows = await vnRows();
  if (rows.length !== 2) throw new Error("vault must hold 2 rows, holds " + rows.length);
  const e17 = rows.find(e => e.externalIds.vndbId === "v17");
  if (!e17 || e17.score !== 9) throw new Error("second sync's list state must win");
});

/* ============ 2 · title-claim fallback for damaged/manual rows ============ */
console.log("== title-claim fallback ==");
step("a synced row with an id claims a same-title vn row that has none", async () => {
  /* exactly what the bug left behind: syncSource vndb, vndbId null,
     with manual data the user built on top */
  const damaged = await p(cb => KOS.mediadb.add({
    module: "vn", title: "Steins;Gate", status: "inProgress",
    externalIds: { vndbId: null }, syncSource: "vndb",
    routes: [{ name: "Kurisu", cleared: true, completedAt: "2026-06-01" }],
    quotes: [{ text: "El Psy Kongroo", context: "", loggedAt: 1 }],
    notes: "my notes"
  }, cb));
  const r = await p(cb => KOS.mediadb.bulkUpsert(
    [KOS.vndb.mapListEntry(liveUlistRow("v2002", "Steins;Gate", 2, 100))], {}, cb));
  if (r.added !== 0 || r.updated !== 1) throw new Error("must claim, not insert — got " + JSON.stringify(r));
  const row = await p(cb => KOS.mediadb.get(damaged.id, cb));
  if (row.externalIds.vndbId !== "v2002") throw new Error("claim must backfill the id");
  if (row.routes.length !== 1 || row.quotes.length !== 1 || row.notes !== "my notes")
    throw new Error("claim must keep the manual layer");
  if (row.status !== "completed" || row.score !== 10) throw new Error("claim must take the synced list state");
  if ((await vnRows()).length !== 3) throw new Error("no extra row may appear");
});

step("the claim never grabs a row that carries a DIFFERENT vndbId, and never crosses modules", async () => {
  await p(cb => KOS.mediadb.add({ module: "vn", title: "Same Name",
    externalIds: { vndbId: "v100" }, syncSource: "manual" }, cb));
  await p(cb => KOS.mediadb.add({ module: "anime", title: "Clannad", status: "completed",
    externalIds: {}, syncSource: "manual" }, cb));
  const r = await p(cb => KOS.mediadb.bulkUpsert([
    KOS.vndb.mapListEntry(liveUlistRow("v200", "Same Name", 5, null)),   // different id, same title
    KOS.vndb.mapListEntry(liveUlistRow("v4", "Clannad", 5, null))        // same title exists only as anime
  ], {}, cb));
  if (r.added !== 2) throw new Error("both must insert fresh — got " + JSON.stringify(r));
  const rows = await vnRows();
  if (rows.filter(e => e.titleLower === "same name").length !== 2) throw new Error("v100 and v200 must stay separate");
  if ((await vnRows("anime")).length !== 1) throw new Error("the anime row must be untouched");
});

/* ============ 3 · one-time dedup pass ============ */
console.log("== dedup pass ==");
step("dedupe merges same-id and same-title duplicates, unioning the manual layer", async () => {
  /* the real damage pattern: several null-id copies from repeated syncs +
     manual data spread across them */
  await p(cb => KOS.mediadb.add({ module: "vn", title: "Muv-Luv", status: "completed", score: 9,
    externalIds: { vndbId: null }, syncSource: "vndb",
    routes: [{ name: "Sumika", cleared: true }], notes: "route notes" }, cb));
  await p(cb => KOS.mediadb.add({ module: "vn", title: "Muv-Luv", status: "completed", score: 9,
    externalIds: { vndbId: null }, syncSource: "vndb",
    quotes: [{ text: "line", context: "", loggedAt: 1 }],
    cgGallery: { totalKnown: 50, unlockedCount: 12 }, contentWarnings: ["war"] }, cb));
  await p(cb => KOS.mediadb.add({ module: "vn", title: "Muv-Luv", status: "inProgress",
    externalIds: { vndbId: "v92" }, syncSource: "manual", favourite: true }, cb));
  const before = (await vnRows()).length;
  const rep = await p(cb => KOS.media.dedupeVault("vn", cb));
  if (rep.removed !== 2) throw new Error("must remove 2 redundant Muv-Luv rows — " + JSON.stringify(rep));
  const rows = await vnRows();
  if (rows.length !== before - 2) throw new Error("row count wrong after dedupe");
  const ml = rows.filter(e => e.titleLower === "muv-luv");
  if (ml.length !== 1) throw new Error("one Muv-Luv must remain");
  const m = ml[0];
  if (m.externalIds.vndbId !== "v92") throw new Error("the known id must survive the merge");
  if (m.routes.length !== 1 || m.quotes.length !== 1) throw new Error("routes+quotes must union");
  if (m.cgGallery.totalKnown !== 50 || m.cgGallery.unlockedCount !== 12) throw new Error("CG counter must survive");
  if (m.contentWarnings.indexOf("war") === -1) throw new Error("warnings must survive");
  if (m.notes.indexOf("route notes") === -1) throw new Error("notes must survive");
  if (!m.favourite) throw new Error("favourite must survive");
  if (m.progress.current !== 1 || m.progress.total !== 1) throw new Error("progress must re-derive from merged routes");
});

step("dedupe is safe to re-run and never merges distinct ids", async () => {
  const before = (await vnRows()).length;
  const rep = await p(cb => KOS.media.dedupeVault("vn", cb));
  if (rep.removed !== 0) throw new Error("second run must be a no-op — " + JSON.stringify(rep));
  if ((await vnRows()).length !== before) throw new Error("row count changed on a no-op run");
});

/* ============ 4 · import mode control ============ */
console.log("== import modes ==");
step("replace-from-source wipes bare synced rows, keeps rows with your own data", async () => {
  /* vndb-sourced rows at this point: v17/v200/v4 (bare), v11 (bare but in
     the incoming import), Steins;Gate v2002 (routes/quotes/notes) —
     replace with an import holding ONLY v11 */
  const rep = await p(cb => KOS.mediadb.bulkUpsert(
    [KOS.vndb.mapListEntry(liveUlistRow("v11", "Air", 2, 80))],
    { replace: { module: "vn", source: "vndb" } }, cb));
  if (rep.removed !== 3) throw new Error("bare v17/v200/v4 must be removed — " + JSON.stringify(rep));
  if (rep.kept !== 1) throw new Error("Steins;Gate must be kept for its manual data — " + JSON.stringify(rep));
  if (rep.updated !== 1) throw new Error("v11 must update in place — " + JSON.stringify(rep));
  const rows = await vnRows();
  for (const gone of ["v17", "v200", "v4"]) {
    if (rows.some(e => e.externalIds.vndbId === gone)) throw new Error(gone + " must be gone");
  }
  const sg = rows.find(e => e.externalIds.vndbId === "v2002");
  if (!sg || sg.routes.length !== 1) throw new Error("the kept row must still hold its routes");
  const air = rows.find(e => e.externalIds.vndbId === "v11");
  if (!air || air.score !== 8) throw new Error("v11 must carry the new import's state");
});

step("replace never touches manual/other-source rows or other modules", async () => {
  const rows = await vnRows();
  if (!rows.some(e => e.externalIds.vndbId === "v92")) throw new Error("the manual Muv-Luv row must survive a vndb replace");
  if (!rows.some(e => e.externalIds.vndbId === "v100")) throw new Error("manual rows are not part of the source wipe");
  if ((await vnRows("anime")).length !== 1) throw new Error("anime module must be untouched by a vn replace");
});

step("replace works for an AniList module the same way", async () => {
  await p(cb => KOS.mediadb.bulkUpsert([
    { module: "anime", title: "Old Synced", status: "completed", externalIds: { anilistId: 1 }, syncSource: "anilist" },
    { module: "anime", title: "Kept Synced", status: "completed", externalIds: { anilistId: 2 }, syncSource: "anilist", notes: "keep me" }
  ], {}, cb));
  const rep = await p(cb => KOS.mediadb.bulkUpsert(
    [{ module: "anime", title: "Fresh", status: "planned", externalIds: { anilistId: 3 }, syncSource: "anilist" }],
    { replace: { module: "anime", source: "anilist" } }, cb));
  if (rep.removed !== 1 || rep.kept !== 1 || rep.added !== 1)
    throw new Error("anime replace: expected 1 removed / 1 kept / 1 added — " + JSON.stringify(rep));
  const rows = await vnRows("anime");
  if (rows.some(e => e.title === "Old Synced")) throw new Error("bare synced row must be gone");
  if (!rows.some(e => e.title === "Kept Synced")) throw new Error("noted row must be kept");
});

step("default mode stays pure update-and-add (opts {} untouched)", async () => {
  const before = (await vnRows("anime")).length;
  const r = await p(cb => KOS.mediadb.bulkUpsert(
    [{ module: "anime", title: "Fresh", status: "completed", externalIds: { anilistId: 3 }, syncSource: "anilist" }], {}, cb));
  if (r.added !== 0 || r.updated !== 1 || r.removed) throw new Error("plain upsert must not remove — " + JSON.stringify(r));
  if ((await vnRows("anime")).length !== before) throw new Error("row count must not change");
});

/* ============ run ============ */
(async () => {
  let pass = 0, fail = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ✓ " + name); pass++; }
    catch (e) { console.error("  ✗ " + name + "\n    " + (e && e.message)); fail++; }
  }
  for (const e of errors) { console.error("  ✗ " + e); fail++; }
  console.log(`\nsmoke10: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
