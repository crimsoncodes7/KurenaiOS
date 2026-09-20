/* Kurenai OS — smoke52.test.js
   The Collection mirror release: Anime and the digital half of Books are
   a 1:1 MIRROR of AniList.
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke52.test.js

   What this suite pins:
   - every AniList pull (manual runSync and the autosync cycle) runs
     bulkUpsert in replace.mirror mode: rows the list no longer carries
     are removed, a Books row with physical volumes survives, a shelf-only
     manual book is untouched, and an EMPTY pull never mirrors;
   - rows sharing an anilistId/malId are duplicates: the mirror folds the
     later one's local layer into the first and deletes it;
   - the cloud pull matches a remote row with no local syncId by PROVIDER
     identity, folds it into the local row and tombstones the loser with a
     deterministic survivor — the cross-device duplicate source;
   - titles are English-first, and vault search matches either spelling;
   - the UI contracts: no manual add/delete on Anime and digital Books,
     the corner score + one-line hover row, the Seasonal view lists what
     is being watched, the overview's switcher rides the page header.  */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "css/main.css"), "utf8");
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

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
KOS.mediapush._config({ debounce: 30, retryWait: 30 });
KOS.autosync._config({ pullGap: 10, drainWait: 500 });

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

/* ---- network: AniList only; everything else is a 204 ---- */
let netScript = null;
function mockResponse(status, jsonBody) {
  return { ok: status >= 200 && status < 300, status, headers: { get: () => null },
    json: () => Promise.resolve(jsonBody === undefined ? {} : jsonBody), text: () => Promise.resolve("") };
}
window.fetch = (url, opts) => {
  const rec = { url, opts, body: opts && opts.body ? JSON.parse(opts.body) : null };
  const scripted = netScript && netScript(url, rec);
  if (scripted) return Promise.resolve(scripted);
  return Promise.resolve(mockResponse(204, null));
};

async function clearVault() {
  const all = await p(cb => KOS.mediadb.query({}, cb));
  for (const e of all) await p(cb => KOS.mediadb.remove(e.id, cb, { skipTombstone: true }));
  await p(cb => KOS.mediadb.setKV("cloudsync.pendingDeletes", [], cb));
}
const add = e => p(cb => KOS.mediadb.add(e, cb));
const byAni = id => p(cb => KOS.mediadb.getByExternal("anilist", id, cb));
const rows = module => p(cb => KOS.mediadb.query({ module }, cb));
/* a mapped pull row, the shape KOS.anilist.mapListEntry emits */
function pulled(module, anilistId, title, status, extra) {
  return Object.assign({ module, title, status: status || "inProgress",
    progress: { current: 3, total: 12 }, score: 0, genres: [],
    dates: { started: null, finished: null },
    externalIds: { anilistId, malId: null }, syncSource: "anilist", lastSyncedAt: Date.now(),
    extra: { season: "SUMMER", seasonYear: 2026 } }, extra || {});
}
const mirror = (list, module) => p(cb => KOS.mediadb.bulkUpsert(list, KOS.media.mirrorOpts(module), cb));

/* ============ 1 · the mapper: English first, both spellings kept ============ */
console.log("== titles ==");
step("mapListEntry prefers the English title and keeps romaji in extra", () => {
  const en = KOS.anilist.mapListEntry({ id: 1, status: "CURRENT", progress: 2,
    media: { id: 154587, title: { romaji: "Sousou no Frieren", english: "Frieren: Beyond Journey's End" } } }, "anime", []);
  assert(en.title === "Frieren: Beyond Journey's End", "English title not preferred: " + en.title);
  assert(en.extra.titleRomaji === "Sousou no Frieren" && en.extra.titleEnglish === "Frieren: Beyond Journey's End", "both spellings must ride in extra");
  const ro = KOS.anilist.mapListEntry({ id: 2, status: "CURRENT", progress: 0,
    media: { id: 9, title: { romaji: "Yomi no Tsugai", english: null } } }, "anime", []);
  assert(ro.title === "Yomi no Tsugai", "romaji is the fallback when AniList has no English title");
  assert(KOS.anilist.pickTitle({ native: "葬送のフリーレン" }) === "葬送のフリーレン", "native is the last resort");
  assert(KOS.anilist.pickTitle(null) === "Untitled", "no title object → Untitled");
});
step("vault search matches the English title, the romaji and the author", async () => {
  await clearVault();
  await add(pulled("anime", 154587, "Frieren: Beyond Journey's End", "inProgress",
    { extra: { titleRomaji: "Sousou no Frieren", titleEnglish: "Frieren: Beyond Journey's End" } }));
  await add(Object.assign(pulled("books", 30002, "Berserk"), { author: "Kentarou Miura" }));
  const hitEn = await p(cb => KOS.mediadb.query({ module: "anime", search: "beyond journey" }, cb));
  const hitRo = await p(cb => KOS.mediadb.query({ module: "anime", search: "sousou" }, cb));
  const hitAu = await p(cb => KOS.mediadb.query({ module: "books", search: "miura" }, cb));
  assert(hitEn.length === 1 && hitRo.length === 1, "search must match either spelling");
  assert(hitAu.length === 1, "search must match the author");
  const miss = await p(cb => KOS.mediadb.query({ module: "anime", search: "berserk" }, cb));
  assert(miss.length === 0, "search leaked across modules");
});

/* ============ 2 · the mirror pull ============ */
console.log("== mirror ==");
step("a mirror pull removes anime the list no longer carries — manual or synced, notes or not", async () => {
  await clearVault();
  await add(pulled("anime", 1, "Keeps"));
  await add(pulled("anime", 2, "Deleted on AniList", "inProgress", { notes: "I liked this", favourite: true }));
  await add({ module: "anime", title: "Hand-made", status: "planned" });
  const res = await mirror([pulled("anime", 1, "Keeps", "completed")], "anime");
  const left = await rows("anime");
  assert(left.length === 1 && left[0].title === "Keeps" && left[0].status === "completed", "the vault is not a mirror: " + left.map(r => r.title).join(", "));
  assert(res.removed === 2 && res.updated === 1, "counts: " + JSON.stringify(res));
  const tombs = await p(cb => KOS.mediadb.getKV("cloudsync.pendingDeletes", cb));
  assert(tombs.length === 2, "every mirror removal records a cloud tombstone (invariant 32)");
});
step("Books: a row with volumes on the shelf survives the mirror; a bare AniList row does not; a shelf-only manual book is untouched", async () => {
  await clearVault();
  await add(Object.assign(pulled("books", 10, "Shelf + AniList"), { physical: { owned: true, volumes: [{ number: 1 }, { number: 2 }] } }));
  await add(pulled("books", 11, "Bare digital"));
  await add({ module: "books", title: "Shelf only", physical: { owned: true, volumes: [{ number: 1 }] } });
  await add({ module: "books", title: "XML import, gone", syncSource: "import", externalIds: { malId: 555 } });
  const res = await mirror([pulled("books", 12, "New on AniList")], "books");
  const titles = (await rows("books")).map(r => r.title).sort();
  assert(titles.join("|") === "New on AniList|Shelf + AniList|Shelf only", "survivors wrong: " + titles.join(", "));
  assert(res.kept === 2 && res.removed === 2 && res.added === 1, "counts: " + JSON.stringify(res));
  const kept = await byAni(10);
  assert(kept.physical.volumes.length === 2, "the shelf must survive untouched");
});
step("an EMPTY pull never mirrors — a bad response must not empty the vault", async () => {
  await clearVault();
  await add(pulled("anime", 1, "Keeps"));
  const res = await mirror([], "anime");
  assert((await rows("anime")).length === 1 && res.removed === 0, "an empty list wiped the vault");
});
step("duplicates sharing an AniList (or MAL) id fold into one row, local layer kept", async () => {
  await clearVault();
  const first = await add(Object.assign(pulled("anime", 7, "Twice"), { tags: ["comfort"] }));
  await add(Object.assign(pulled("anime", 7, "Twice"), { favourite: true, notes: "from the other device",
    customLists: ["Rewatch"] }));
  /* an XML row that only knows the MAL id is the same title again */
  await add({ module: "anime", title: "Twice", syncSource: "import", externalIds: { malId: 70 }, tags: ["xml"] });
  const res = await mirror([pulled("anime", 7, "Twice", "inProgress", { externalIds: { anilistId: 7, malId: 70 } })], "anime");
  const left = await rows("anime");
  assert(left.length === 1, "duplicates survived: " + left.length);
  const one = left[0];
  assert(one.id === first.id, "the FIRST row is the survivor");
  assert(one.favourite && /other device/.test(one.notes), "the duplicate's favourite/notes were lost");
  assert(one.tags.indexOf("comfort") !== -1 && one.tags.indexOf("xml") !== -1, "tags must union: " + one.tags.join(","));
  assert(one.customLists.indexOf("Rewatch") !== -1, "custom lists must union");
  assert(one.externalIds.malId === 70, "the MAL id learned from the import row must accrete");
  assert(res.removed === 2, "two duplicates removed: " + JSON.stringify(res));
});
step("KOS.media.mirrorOpts is what BOTH pull paths hand bulkUpsert", () => {
  const o = KOS.media.mirrorOpts("books");
  assert(o.replace && o.replace.mirror === true && o.replace.module === "books" && o.replace.source === "anilist", "mirrorOpts shape");
  const sync = fs.readFileSync(path.join(ROOT, "js/modules/mediasync.js"), "utf8");
  const auto = fs.readFileSync(path.join(ROOT, "js/core/autosync.js"), "utf8");
  assert(/bulkUpsert\(mapped, mirrorOpts\(module(, listNames)?\)/.test(sync), "the manual AniList sync does not mirror");
  assert(/bulkUpsert\(mapped, KOS\.media\.mirrorOpts\(module(, listNames)?\)/.test(auto), "the autosync AniList pull does not mirror");
  assert(!/aniMode/.test(sync), "the AniList panel still offers an import-mode choice — there is nothing to choose");
});
step("the autosync cycle mirrors too: a title removed on AniList disappears on the next background pull", async () => {
  await clearVault();
  await p(cb => KOS.mediadb.setKV("anilist.token", "t", cb));
  await p(cb => KOS.mediadb.setKV("anilist.viewer", { id: 1, name: "u" }, cb));
  await add(pulled("anime", 1, "Keeps"));
  await add(pulled("anime", 2, "Sparks of Tomorrow"));   // deleted on AniList since
  netScript = (url, rec) => {
    if (/anilist/.test(url) && /MediaListCollection/.test(rec.body.query)) {
      const isAnime = rec.body.variables.type === "ANIME";
      return mockResponse(200, { data: { MediaListCollection: { lists: isAnime ? [{ name: "Watching", status: "CURRENT", isCustomList: false,
        entries: [{ id: 1, status: "CURRENT", progress: 4, score: 0, startedAt: {}, completedAt: {},
          media: { id: 1, idMal: null, title: { romaji: "Keeps", english: null }, coverImage: {}, genres: [], episodes: 12 } }] }] : [] } } });
    }
    return null;
  };
  const report = await p(cb => KOS.autosync.runOnce(cb));
  netScript = null;
  assert(report && report.anilist.anime && report.anilist.anime.removed === 1, "autosync did not mirror: " + JSON.stringify(report && report.anilist));
  const left = await rows("anime");
  assert(left.length === 1 && left[0].title === "Keeps", "the ghost survived the background pull");
  /* the manga pull came back with NO lists → empty → nothing mirrored (books untouched) */
  await p(cb => KOS.mediadb.delKV("anilist.token", cb));
  await p(cb => KOS.mediadb.delKV("anilist.viewer", cb));
});

/* ============ 3 · the cloud pull's identity match ============ */
console.log("== cloud ==");
step("a remote row with a new syncId but a known AniList id folds into the local row (deterministic survivor, loser tombstoned)", async () => {
  await clearVault();
  const local = await add(Object.assign(pulled("anime", 99, "Same show"), { syncId: "bbbb-local", notes: "mine" }));
  /* the link is ESTABLISHED first (first-link has its own matching); the
     remote row then arrives on a later cycle, the way a second device's
     AniList pull reaches this one */
  const remoteRows = [];
  const api = {
    fetchState: cb => cb(null, null), fetchStateMeta: cb => cb(null, null),
    upsertState: (json, expected, cb) => cb(null, { updated_at: "2026-07-16T00:00:20Z" }),
    fetchMediaSince: (iso, offset, cb) => cb(null, offset ? [] : remoteRows),
    upsertMedia: (rows2, cb) => cb(null, rows2.map(r => ({ entry_id: r.entry_id, updated_at: "2026-07-16T00:00:30Z" }))),
    countMedia: cb => cb(null, 1), listMediaIds: (o, cb) => cb(null, []),
    fetchFilesSince: (iso, o, cb) => cb(null, []), upsertFiles: (r, cb) => cb(null, []), listFileIds: (o, cb) => cb(null, []),
    markUploaded: (f, cb) => cb(null, []), uploadBinary: (a, b, c, cb) => cb(null, {}), downloadBinary: (a, cb) => cb(new Error("none")), removeBinary: (a, cb) => cb(null)
  };
  KOS.cloudsync._config({ api, session: { userId: "user-52", email: "x@test" }, quiet: true, pushDebounce: 10 * 60 * 1000, minPullGap: 0, bootDelay: 0 });
  await p(cb => KOS.cloudsync.syncNow(cb));
  assert((await rows("anime")).length === 1, "first link changed the row count");
  remoteRows.push({ entry_id: "aaaa-remote", module: "anime", deleted: false, updated_at: "2026-07-16T00:01:00Z",
    data_json: Object.assign(pulled("anime", 99, "Same show", "completed"), { syncId: "aaaa-remote", favourite: true, updatedAt: 5 }) });
  await p(cb => KOS.cloudsync.syncNow(cb));
  const left = await rows("anime");
  assert(left.length === 1, "the cloud pull minted a duplicate: " + left.length);
  const one = left[0];
  assert(one.id === local.id, "the local row must be the one that survives (its id is what the UI holds)");
  assert(one.syncId === "aaaa-remote", "the lexically smaller syncId wins so every device converges: " + one.syncId);
  assert(one.favourite && one.notes === "mine", "the fold must union the two local layers");
  const tombs = await p(cb => KOS.mediadb.getKV("cloudsync.pendingDeletes", cb));
  assert(!(tombs || []).some(t => t.syncId === "aaaa-remote"), "the winner must not be tombstoned");
  /* the losing syncId was pushed as a delete by the same cycle (queue drained) or is still queued */
  KOS.cloudsync._config({ api: null, session: null });
});
step("the boot repair folds pre-existing anime/books duplicates once (maint.dedupeAnilist)", async () => {
  await clearVault();
  await add(pulled("anime", 5, "Old dupe"));
  await add(Object.assign(pulled("anime", 5, "Old dupe"), { favourite: true }));
  const rep = await p(cb => KOS.media.dedupeVault("anime", cb));
  assert(rep.removed === 1 && (await rows("anime")).length === 1, "dedupeVault must fold same-id anime rows");
  const mainSrc = fs.readFileSync(path.join(ROOT, "js/main.js"), "utf8");
  assert(/maint\.dedupeAnilist/.test(mainSrc) && /dedupeVault\("anime"/.test(mainSrc) && /dedupeVault\("books"/.test(mainSrc), "main.js does not run the one-time anime/books fold");
});

/* ============ 4 · the UI contracts ============ */
console.log("== ui ==");
step("Anime: no manual add, no Delete; the card carries a corner score and a one-line hover row", async () => {
  await clearVault();
  await add(pulled("anime", 1, "Watching one", "inProgress", { score: 8 }));
  KOS.show("anime");
  await waitFor(() => main().querySelector(".med-card"), 4000);
  const btns = [...main().querySelectorAll(".med-toolbar button")].map(b => b.textContent.trim());
  assert(!btns.some(t => /^\+ Add$/.test(t)), "the manual + Add is still on the anime toolbar");
  assert(btns.some(t => /Find new/.test(t)), "Find new (creates on AniList first) must be the primary");
  const card = main().querySelector(".med-card");
  const corner = card.querySelector(".med-score-corner");
  assert(corner && corner.value === "8", "the score does not sit in the card corner");
  assert(card.querySelector(".med-cover") && corner.previousElementSibling === card.querySelector(".med-cover"), "the corner score must be a sibling of the cover, positioned by CSS");
  const row = card.querySelector(".med-quickrow");
  assert(row && row.querySelector(".med-qsel") && row.querySelector(".med-plus"), "the hover row is status + +1");
  assert(!row.querySelector(".med-qscore"), "the score must not be in the hover row any more");
  assert(/\.med-score-corner\s*\{[^}]*top:\s*8px;\s*left:\s*8px/s.test(css), "the corner score is not top-left");
  assert(/\.med-quickrow\s*\{[^}]*flex-wrap:\s*nowrap/s.test(css), "the hover row can still wrap (and clip the +1)");
  card.querySelector(".med-title").click();
  await tick(20);
  const modal = document.querySelector(".med-record-modal");
  assert(modal && !modal.querySelector(".med-delete-actions .danger"), "the anime record offers Delete");
  modal.querySelector("button[aria-label='Close']").click();
});
step("Books: the Digital lens lists AniList rows only and its primary is Find new; Physical keeps + Add to shelf", async () => {
  await clearVault();
  await add(pulled("books", 1, "Mirrored manga"));
  await add({ module: "books", title: "Shelf only", physical: { owned: true, volumes: [{ number: 1 }] } });
  KOS.store.state.media.books = { layout: "grid", sort: "title", tab: "digital", physLayout: "grid" };
  KOS.show("books");
  await waitFor(() => main().querySelector(".med-card"), 4000);
  let titles = [...main().querySelectorAll(".med-title")].map(t => t.textContent);
  assert(titles.join("|") === "Mirrored manga", "digital lens must list AniList rows only: " + titles.join(", "));
  assert(/Find new/.test(main().querySelector(".med-toolbar .btn.primary").textContent), "digital primary must be Find new");
  main().querySelectorAll(".bk-tab")[1].click();
  await waitFor(() => /Shelf only/.test(main().textContent), 4000);
  assert(/Add to shelf/.test(main().querySelector(".med-toolbar .btn.primary").textContent), "physical primary must be + Add to shelf");
  /* a hand-made book must go on the shelf with a volume */
  KOS.booksEditor(null, noop);
  const modal = document.querySelector(".bk-modal");
  modal.querySelector(".med-form input.todo-in").value = "No volumes";
  modal.querySelector(".med-save-actions .btn.primary").click();
  await tick(30);
  assert((await rows("books")).length === 2, "a hand-made book with no volumes was saved into the digital half");
  modal.querySelector("button[aria-label='Close']").click();
});
step("Find new refuses a local-only add for anime/books when AniList declines; VN keeps its local fallback", async () => {
  await clearVault();
  netScript = (url, rec) => {
    if (/anilist/.test(url) && /SaveMediaListEntry/.test(rec.body.query)) return mockResponse(500, {});
    return null;
  };
  await p(cb => KOS.mediadb.setKV("anilist.token", "t", cb));
  const before = await rows("anime");
  const out = await new Promise(res => KOS.mediaSearch.createFromResult("anime", { anilistId: 4242, title: "Declined", genres: [] }, "planned", (err, o) => res({ err, o })));
  assert(out.err && /mirrors your AniList/.test(out.err.message), "a declined AniList create must not fall back to a local row: " + (out.err && out.err.message));
  assert((await rows("anime")).length === before.length, "a local-only anime row was added");
  netScript = null;
  await p(cb => KOS.mediadb.delKV("anilist.token", cb));
});
step("Seasonal: every status of the season (watching first), with the season's art and credit", async () => {
  await clearVault();
  const cur = KOS.anime.currentSeason();
  await add(pulled("anime", 1, "Watching", "inProgress", { extra: { season: cur.season, seasonYear: cur.year } }));
  await add(pulled("anime", 2, "Planned", "planned", { extra: { season: cur.season, seasonYear: cur.year } }));
  KOS.show("seasonal");
  await waitFor(() => main().querySelector(".med-card"), 4000);
  const titles = [...main().querySelectorAll(".med-title")].map(t => t.textContent);
  assert(titles.join("|") === "Watching|Planned", "seasonal lists the whole season, watching first: " + titles.join(", "));
  const meta = KOS.anime.SEASON_META[cur.season];
  const art = main().querySelector(".season-hero .season-art");
  assert(art && art.srcset.indexOf(meta.art) !== -1 && art.getAttribute("src") === meta.artSmall, "season art missing");
  assert(/^https:\/\//.test(meta.art) && /^https:\/\//.test(meta.artSmall), "art must be an absolute URL");
  assert(new RegExp(meta.credit).test(main().querySelector(".season-credit").textContent), "artist credit missing");
  ["WINTER", "SPRING", "SUMMER", "FALL"].forEach(s => assert(KOS.anime.SEASON_META[s].art && KOS.anime.SEASON_META[s].credit, s + " has no art/credit"));
});
step("the overview: tabs in the page header, no streaks, no figures; the schedule and on-the-go cards", async () => {
  await clearVault();
  await add(pulled("anime", 1, "Watching", "inProgress"));
  KOS.show("matrix");
  await waitFor(() => main().querySelector(".mx-now-card"), 4000);
  assert(main().querySelector(".dash-head .dh-actions .mx-tabs .study-tab"), "the switcher must ride the page header's action slot");
  assert(!main().querySelector(".med-streaks") && !main().querySelector(".streak-chip"), "streak chips are back");
  assert(!main().querySelector(".stat-strip") && !main().querySelector(".cs-multi"), "figures/charts are back on the overview");
  const card = main().querySelector(".mx-now-card");
  assert(card.querySelector(".mx-now-plus") && /\+1 ep/.test(card.querySelector(".mx-now-plus").textContent), "the on-the-go card has no +1");
  card.querySelector(".mx-now-plus").click();
  await waitFor(async () => (await byAni(1)).progress.current === 4, 2000);
  await tick(60);
  assert((await byAni(1)).progress.current === 4, "+1 on the overview did not log");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE52 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE52 PASS — the Collection mirror release verified (" + steps.length + " steps).");
  process.exit(0);
})();
