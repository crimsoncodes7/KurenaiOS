/* Kurenai OS — smoke5.test.js
   Build 3b Books suite: the dual-tracking schema (digital reading state +
   physical volume vault on one entry), the v2→v3 IndexedDB migration
   (manga/ln → books), the manga XML path with MAL-id semantics, MANGA-type
   AniList sync mapping (staff → author, progressVolumes, NOVEL/ONE_SHOT
   formats), merge preservation of local-only books fields, volume range
   CRUD, the owned-vs-read maths, deterministic spines, half-star ratings,
   the governor boundary, and the Books/Mangaka/shelf/heatmap views. Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke5.test.js

   CAVEAT stated plainly: the manga XML shape here follows the MAL export
   format by analogy with the anime export that WAS verified against a real
   file in 3a. No real AniList manga export has been inspected yet — worth a
   live check when one is available. The AniList MANGA query shapes (staff
   edges, progressVolumes, format enum) WERE validated against the live API
   on 2026-07-02; the network is mocked here for repeatability.            */
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
window.confirm = () => true;

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
const today = KOS.srs.todayISO();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(err.message || String(err))) : res(out))); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
async function waitFor(cond, ms) {
  const deadline = Date.now() + (ms || 3000);
  while (Date.now() < deadline) {
    if (cond()) return true;
    await tick(40);
  }
  return cond();
}

/* ============ 1 · v2 → v3 migration ============ */
/* Seed a REAL v2 database first (the pre-3b shape), so KOS.mediadb's first
   open runs the upgrade path a live user's browser will hit. */
console.log("== migration ==");
step("a v2 'manga' row migrates to module:books with format kept", async () => {
  await new Promise((res, rej) => {
    const rq = window.indexedDB.open("kurenai-os-media", 2);
    rq.onupgradeneeded = e => {
      const d = e.target.result;
      const os = d.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
      os.createIndex("module", "module");
      os.createIndex("status", "status");
      os.createIndex("mod_status", ["module", "status"]);
      os.createIndex("genres", "genres", { multiEntry: true });
      os.createIndex("tags", "tags", { multiEntry: true });
      os.createIndex("anilist", "externalIds.anilistId");
      os.createIndex("mal", "externalIds.malId");
      d.createObjectStore("kv", { keyPath: "key" });
    };
    rq.onsuccess = () => {
      const d = rq.result;
      const tx = d.transaction("entries", "readwrite");
      tx.objectStore("entries").add({
        module: "manga", title: "Vinland Saga", titleLower: "vinland saga",
        status: "inProgress", progress: { current: 50, total: null },
        ownership: "unset", score: 0, tags: [], genres: [],
        dates: { started: null, finished: null },
        externalIds: { anilistId: null, malId: 642, steamAppId: null },
        coverUrl: null, notes: "", favourite: false,
        syncSource: "import", lastSyncedAt: null, createdAt: 1, updatedAt: 1, extra: {}
      });
      tx.oncomplete = () => { d.close(); res(); };
      tx.onerror = () => rej(tx.error);
    };
    rq.onerror = () => rej(rq.error);
  });
  /* first KOS.mediadb call → opens at v3 → migration runs */
  const rows = await p(cb => KOS.mediadb.query({ module: "books" }, cb));
  if (rows.length !== 1 || rows[0].title !== "Vinland Saga") throw new Error("migrated rows: " + rows.length);
  if (rows[0].module !== "books" || rows[0].format !== "manga") throw new Error(JSON.stringify({ m: rows[0].module, f: rows[0].format }));
  if (rows[0].externalIds.malId !== 642) throw new Error("malId lost in migration");
});

/* ============ 2 · schema: dual-tracking defaults + volume CRUD ============ */
console.log("== schema + physical vault ==");
step("normalise: books axes default benignly, volumes normalise + sort", async () => {
  const n = KOS.mediadb.normalise({ title: "X", module: "books" });
  if (n.author !== "" || n.format !== null || n.mood.length || n.shelves.length ||
      n.dnf.isDnf !== false || n.physical !== null ||
      n.progress.volumes !== null || n.progress.totalVolumes !== null) throw new Error(JSON.stringify(n));
  const withPhys = KOS.mediadb.normalise({ title: "Y", module: "books",
    physical: { volumes: [{ number: 3, condition: "bogus", price: "7" }, { number: 1, condition: "mint", price: 5.5 }] } });
  const vols = withPhys.physical.volumes;
  if (vols.length !== 2 || vols[0].number !== 1 || vols[1].number !== 3) throw new Error("volume sort");
  if (vols[0].condition !== "mint" || vols[1].condition !== "good") throw new Error("condition default");
  if (vols[0].price !== 5.5 || vols[1].price !== null) throw new Error("price coercion");
  /* legacy module names normalise away entirely */
  const ln = KOS.mediadb.normalise({ title: "Z", module: "ln" });
  if (ln.module !== "books" || ln.format !== "lightNovel") throw new Error("ln legacy mapping");
});
let idBerserk;
step("range tool: 1–15 in one action, exceptions editable, no duplicate numbers", async () => {
  const rec = await p(cb => KOS.mediadb.add({
    module: "books", title: "Berserk", author: "Kentarou Miura", format: "manga",
    status: "inProgress", progress: { current: 120, total: 380, volumes: 12, totalVolumes: 41 },
    externalIds: { malId: 2 }, mood: ["dark"], shelves: ["top-shelf"]
  }, cb));
  idBerserk = rec.id;
  const added = KOS.books.addVolumeRange(rec, 1, 15, { condition: "good", purchaseDate: "2026-06-01", price: 9.99 });
  if (added !== 15 || rec.physical.volumes.length !== 15) throw new Error("range add: " + added);
  /* overlapping range only fills the gap — owned numbers are never duplicated */
  const more = KOS.books.addVolumeRange(rec, 10, 20, { condition: "mint" });
  if (more !== 5 || rec.physical.volumes.length !== 20) throw new Error("overlap add: " + more);
  if (KOS.books.nextVolumeNumber(rec) !== 21) throw new Error("next number");
  /* an exception: vol 3 was a worn gift */
  rec.physical.volumes[2].condition = "worn";
  rec.physical.volumes[2].price = null;
  await p(cb => KOS.mediadb.put(rec, cb));
  const back = await p(cb => KOS.mediadb.get(idBerserk, cb));
  if (back.physical.volumes.length !== 20 || back.physical.volumes[2].condition !== "worn" ||
      back.physical.volumes[2].price !== null || back.physical.volumes[0].price !== 9.99) throw new Error("roundtrip lost volume edits");
  if (back.mood.join() !== "dark" || back.shelves.join() !== "top-shelf" || back.author !== "Kentarou Miura") throw new Error("books axes lost on put");
});
step("owned% vs read%: real volume counts, and the chapter-derived estimate", async () => {
  const e = await p(cb => KOS.mediadb.get(idBerserk, cb));
  const o = KOS.books.ownership(e);
  // 20 of 41 vols owned = 49%; 120 of 380 chapters = 32%
  if (o.ownedVols !== 20 || o.totalVols !== 41 || o.est !== false ||
      o.ownedPct !== 49 || o.readPct !== 32) throw new Error(JSON.stringify(o));
  const est = KOS.books.ownership(KOS.mediadb.normalise({ module: "books", title: "E",
    progress: { current: 45, total: 90 }, physical: { volumes: [{ number: 1 }, { number: 2 }] } }));
  if (!est.est || est.totalVols !== 10 || est.ownedPct !== 20 || est.readPct !== 50) throw new Error(JSON.stringify(est));
});
step("deterministic spines + half-star text", async () => {
  const c1 = KOS.books.spineColor("Berserk"), c2 = KOS.books.spineColor("Berserk");
  if (c1 !== c2 || !/^#[0-9a-f]{6}$/i.test(c1)) throw new Error(c1 + " / " + c2);
  if (KOS.books.spineColor("Vinland Saga") === undefined) throw new Error("no colour");
  if (KOS.books.starText(9) !== "★★★★½" || KOS.books.starText(10) !== "★★★★★" ||
      KOS.books.starText(1) !== "½" || KOS.books.starText(0) !== "") throw new Error("star text");
});

/* ============ 3 · manga XML path (expected shape — see header caveat) ============ */
console.log("== manga XML ==");
step("manga export → Books entries: MAL ids, chapters+volumes, Plan to Read", async () => {
  const out = KOS.media.parseXML(`<?xml version="1.0"?><myanimelist>
    <myinfo><user_name>CrimsonK7</user_name></myinfo>
    <manga>
      <series_mangadb_id>13</series_mangadb_id>
      <series_title><![CDATA[One Piece]]></series_title>
      <series_type>Manga</series_type>
      <series_chapters>1100</series_chapters>
      <series_volumes>108</series_volumes>
      <my_read_chapters>450</my_read_chapters>
      <my_read_volumes>45</my_read_volumes>
      <my_score>9</my_score>
      <my_status>Reading</my_status>
      <my_start_date>2024-01-05</my_start_date><my_finish_date>0000-00-00</my_finish_date>
    </manga>
    <manga>
      <series_mangadb_id>117165</series_mangadb_id>
      <series_title><![CDATA[Ascendance of a Bookworm]]></series_title>
      <series_type>Light Novel</series_type>
      <series_chapters>0</series_chapters>
      <series_volumes>0</series_volumes>
      <my_read_chapters>0</my_read_chapters>
      <my_read_volumes>0</my_read_volumes>
      <my_score>0</my_score>
      <my_status>Plan to Read</my_status>
      <my_start_date>0000-00-00</my_start_date><my_finish_date>0000-00-00</my_finish_date>
    </manga>
  </myanimelist>`);
  if (out.error) throw new Error(out.error);
  if (out.module !== "books" || out.entries.length !== 2) throw new Error("shape");
  const [a, b] = out.entries;
  if (a.externalIds.malId !== 13 || a.externalIds.anilistId != null) throw new Error("MAL-id semantics broken: " + JSON.stringify(a.externalIds));
  if (a.progress.current !== 450 || a.progress.total !== 1100 ||
      a.progress.volumes !== 45 || a.progress.totalVolumes !== 108 ||
      a.format !== "manga" || a.syncSource !== "import") throw new Error(JSON.stringify(a));
  if (b.status !== "planned" || b.format !== "lightNovel" || b.progress.total !== null ||
      b.progress.totalVolumes !== null) throw new Error(JSON.stringify(b));
});
step("import + enrichment backfills anilistId, author, format, volume count", async () => {
  const parsed = KOS.media.parseXML(`<myanimelist><manga>
    <series_mangadb_id>44347</series_mangadb_id>
    <series_title><![CDATA[Oshi no Ko [manga]]]></series_title>
    <series_chapters>0</series_chapters><series_volumes>0</series_volumes>
    <my_read_chapters>80</my_read_chapters><my_read_volumes>0</my_read_volumes>
    <my_status>Reading</my_status><my_score>8.5</my_score>
    <my_start_date>0000-00-00</my_start_date><my_finish_date>0000-00-00</my_finish_date>
  </manga></myanimelist>`);
  if (parsed.error) throw new Error(parsed.error);
  await p(cb => KOS.mediadb.bulkUpsert(parsed.entries, {}, cb));
  /* mocked public enrichment: MAL 44347 → AniList 117195, with staff */
  window.fetch = (url, opts) => {
    const body = JSON.parse(opts.body);
    if (!/idMal_in/.test(body.query)) return Promise.reject(new Error("expected idMal_in for an XML row"));
    if (!/staff/.test(body.query)) return Promise.reject(new Error("books enrichment must request staff"));
    return Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
      json: () => Promise.resolve({ data: { Page: { pageInfo: { hasNextPage: false }, media: [{
        id: 117195, idMal: 44347, format: "MANGA", chapters: 166, volumes: 16,
        title: { romaji: "[Oshi no Ko]" }, coverImage: { extraLarge: "https://c/onk.png" }, genres: ["Drama"],
        studios: { nodes: [] },
        staff: { edges: [
          { role: "Translator (French)", node: { name: { full: "Wrong Person" } } },
          { role: "Story", node: { name: { full: "Aka Akasaka" } } },
          { role: "Art", node: { name: { full: "Mengo Yokoyari" } } }
        ] }
      }] } } }) });
  };
  const records = await new Promise((res, rej) => KOS.anilist.enrich({ mal: [44347] }, "books", {},
    (e, out) => e ? rej(new Error(e.message)) : res(out)));
  if (records.length !== 1) throw new Error("records: " + records.length);
  const r = records[0];
  if (r.anilistId !== 117195 || r.malId !== 44347 || r.author !== "Aka Akasaka" ||
      r.format !== "manga" || r.totalVolumes !== 16 || r.total !== 166) throw new Error(JSON.stringify(r));
});

/* ============ 4 · MANGA-type sync mapping + merge preservation ============ */
console.log("== MANGA sync ==");
step("syncList (books): query carries progressVolumes+staff, mapping fills the digital half", async () => {
  let sawQuery = "";
  const media = { id: 30002, idMal: 2, format: "NOVEL", chapters: 100, volumes: 12, episodes: null,
    title: { romaji: "Test LN", english: null }, coverImage: { extraLarge: "https://c/ln.png", large: null },
    genres: ["Fantasy"], season: null, seasonYear: null, studios: { nodes: [] },
    staff: { edges: [
      { role: "Translator (English)", node: { name: { full: "Not The Author" } } },
      { role: "Story & Art", node: { name: { full: "Real Author" } } }
    ] } };
  const entry = { id: 7, status: "CURRENT", score: 8.5, progress: 30, progressVolumes: 3,
    startedAt: { year: 2026, month: 5, day: 1 }, completedAt: { year: null }, media };
  window.fetch = (url, opts) => {
    sawQuery = JSON.parse(opts.body).query;
    return Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
      json: () => Promise.resolve({ data: { MediaListCollection: { lists: [
        { name: "Reading", status: "CURRENT", entries: [entry] },
        { name: "custom", status: null, entries: [entry] }
      ] } } }) });
  };
  const mapped = await new Promise((res, rej) => KOS.anilist.syncList("tok", 1, "books",
    (e, out) => e ? rej(new Error(e.message)) : res(out)));
  if (!/progressVolumes/.test(sawQuery) || !/staff/.test(sawQuery)) throw new Error("MANGA query missing fields");
  if (mapped.length !== 1) throw new Error("dedupe failed");
  const m = mapped[0];
  if (m.module !== "books" || m.format !== "lightNovel" || m.author !== "Real Author" ||
      m.progress.current !== 30 || m.progress.total !== 100 ||
      m.progress.volumes !== 3 || m.progress.totalVolumes !== 12 ||
      m.score !== 8.5 || m.externalIds.anilistId !== 30002 || m.externalIds.malId !== 2) throw new Error(JSON.stringify(m));
  /* the anime query must NOT pay for staff on 650 entries */
  await new Promise(res => { KOS.anilist.syncList("tok", 1, "anime", () => res()); });
  if (/staff/.test(sawQuery)) throw new Error("anime sync query carries staff");
});
step("sync merge: physical vault, mood, shelves, DNF survive; reading state updates", async () => {
  const before = await p(cb => KOS.mediadb.get(idBerserk, cb));
  before.dnf = { isDnf: true, reason: "hiatus grief" };
  await p(cb => KOS.mediadb.put(before, cb));
  const res = await p(cb => KOS.mediadb.bulkUpsert([{
    module: "books", title: "Berserk", status: "onHold", format: "manga",
    progress: { current: 130, total: 380, volumes: 13, totalVolumes: 42 },
    score: 10, author: "Kentarou Miura", genres: ["Dark Fantasy"],
    externalIds: { anilistId: 30002, malId: 2 }, syncSource: "anilist", lastSyncedAt: Date.now()
  }], {}, cb));
  if (res.added !== 0 || res.updated !== 1) throw new Error(JSON.stringify(res));
  const after = await p(cb => KOS.mediadb.get(idBerserk, cb));
  if (after.status !== "onHold" || after.progress.current !== 130) throw new Error("sync did not win on reading state");
  if (!after.physical || after.physical.volumes.length !== 20) throw new Error("PHYSICAL VAULT LOST ON SYNC");
  if (after.mood.join() !== "dark" || after.shelves.join() !== "top-shelf") throw new Error("mood/shelves lost");
  if (!after.dnf.isDnf || after.dnf.reason !== "hiatus grief") throw new Error("dnf lost");
  if (after.externalIds.anilistId !== 30002 || after.externalIds.malId !== 2) throw new Error("id accretion failed");
});
step("query filters: format, mood, shelf, owned, dnf", async () => {
  const byFmt = await p(cb => KOS.mediadb.query({ module: "books", format: "manga" }, cb));
  if (!byFmt.some(e => e.title === "Berserk")) throw new Error("format filter");
  const byMood = await p(cb => KOS.mediadb.query({ mood: "dark" }, cb));
  if (byMood.length !== 1 || byMood[0].title !== "Berserk") throw new Error("mood filter: " + byMood.length);
  const byShelf = await p(cb => KOS.mediadb.query({ shelf: "top-shelf" }, cb));
  if (byShelf.length !== 1) throw new Error("shelf filter");
  const owned = await p(cb => KOS.mediadb.query({ module: "books", owned: true }, cb));
  if (owned.length !== 1 || owned[0].title !== "Berserk") throw new Error("owned filter: " + owned.length);
  const dnf = await p(cb => KOS.mediadb.query({ module: "books", dnf: true }, cb));
  if (dnf.length !== 1 || dnf[0].title !== "Berserk") throw new Error("dnf filter");
});
step("stats aggregates volumes owned and spend", async () => {
  const agg = await p(cb => KOS.mediadb.stats(cb));
  const b = agg.modules.books;
  if (!b || b.volumesOwned !== 20) throw new Error("volumesOwned: " + JSON.stringify(b));
  // 15 vols at 9.99 minus vol 3's cleared price = 14 × 9.99 = 139.86
  if (Math.abs(b.spent - 139.86) > 0.001) throw new Error("spent: " + b.spent);
});

/* ============ 5 · governor boundary ============ */
console.log("== governor boundary ==");
step("books log: +4 XP/+1 gold, HP untouched, rest streak fed, study streak not", async () => {
  const g = KOS.store.state.governor;
  g.hp = 47;
  const xp0 = g.xp, gold0 = g.gold;
  const study0 = KOS.sessions.streak(null);
  KOS.media.logActivity({ id: idBerserk, module: "books", title: "Berserk" }, "progress");
  if (g.xp !== xp0 + 4 || g.gold !== gold0 + 1) throw new Error("trickle wrong");
  if (g.hp !== 47) throw new Error("HP moved — boundary broken");
  if (KOS.sessions.streak(null) !== study0) throw new Error("study streak moved");
  if (KOS.sessions.restStreak() < 1) throw new Error("rest streak did not start");
  if (KOS.sessions.hasActivity(today, null)) throw new Error("books log counts as study activity");
});

/* ============ 6 · views ============ */
console.log("== views ==");
step("books vault renders: toolbar, DNF pill, dual bar, author line, stats+heatmap", async () => {
  KOS.show("books");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".bk-card").length > 0, 5000);
  if (!main.querySelector(".med-toolbar")) throw new Error("no toolbar");
  const pillText = [...main.querySelectorAll(".study-tab")].map(b => b.textContent);
  if (!pillText.includes("DNF")) throw new Error("no DNF pill");
  if (!main.querySelector(".bk-dual")) throw new Error("no owned-vs-read bar");
  if (!main.querySelector(".bk-author")) throw new Error("no author line");
  await waitFor(() => main.querySelector(".bk-heat svg"), 3000);
  if (!main.querySelector(".bk-heat svg")) throw new Error("no reading heatmap");
  if (!/Volumes on the shelf/.test(main.textContent)) throw new Error("no vault stats");
});
step("shelf layout: one spine per owned volume, deterministic colour, condition mark", async () => {
  KOS.store.state.media.books.layout = "shelf";
  KOS.show("books");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".bk-spine").length > 0, 5000);
  const spines = main.querySelectorAll(".bk-spine");
  if (spines.length !== 20) throw new Error("spines: " + spines.length);
  const c = KOS.books.spineColor("Berserk");
  if (!spines[0].getAttribute("style").includes(c)) throw new Error("spine colour not deterministic in DOM");
  if (!main.querySelector(".bk-spine-cond.worn")) throw new Error("worn vol 3 not marked");
  KOS.store.state.media.books.layout = "grid";
});
step("editor modal: dual sections, stars, range tool adds volumes end-to-end", async () => {
  const saved = await new Promise((res) => {
    KOS.booksEditor(null, res);
    const modal = document.querySelector(".bk-modal");
    if (!modal) { res(null); return; }
    if (!modal.querySelector(".bk-stars")) { res(null); return; }
    modal.querySelector("input[placeholder='Series title']").value = "Frieren";
    const nums = [...modal.querySelectorAll(".bk-vol-add .med-num")];
    nums[0].value = "1"; nums[1].value = "12";
    [...modal.querySelectorAll("button")].find(b => b.textContent === "Add range").click();
    [...modal.querySelectorAll("button")].find(b => b.textContent === "Add").click();
  });
  if (!saved) throw new Error("editor did not save (modal/stars/inputs missing?)");
  if (saved.title !== "Frieren" || !saved.physical || saved.physical.volumes.length !== 12) throw new Error(JSON.stringify({ t: saved.title, v: saved.physical && saved.physical.volumes.length }));
  await p(cb => KOS.mediadb.remove(saved.id, cb));
});
step("mangaka page groups by author with aggregate stats", async () => {
  await p(cb => KOS.mediadb.add({ module: "books", title: "Gigant", author: "Hiroya Oku", format: "manga" }, cb));
  await p(cb => KOS.mediadb.add({ module: "books", title: "Gantz", author: "Hiroya Oku", format: "manga",
    physical: { volumes: [{ number: 1 }, { number: 2 }, { number: 3 }] } }, cb));
  KOS.show("mangaka");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".mk-card").length > 0, 5000);
  const cards = [...main.querySelectorAll(".mk-card")];
  const oku = cards.find(c => /Hiroya Oku/.test(c.textContent));
  if (!oku) throw new Error("author group missing");
  if (oku.querySelectorAll(".mk-work").length !== 2) throw new Error("works not grouped");
  if (!/2 works · 3 vols owned/.test(oku.textContent)) throw new Error("aggregate stats wrong: " + oku.textContent.slice(0, 120));
});
step("matrix home: Books is a live module card (all four live since 3e)", async () => {
  KOS.show("matrix");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-mod-card").length >= 3, 5000);
  const live = [...main.querySelectorAll(".med-mod-card")].map(c => c.textContent).join(" ");
  if (!/Books/.test(live) || !/Dual-tracked · live/.test(live)) throw new Error("Books card not live");
  if (main.querySelectorAll(".soon-card").length !== 0) throw new Error("no placeholders should remain since 3e");
  if (!/vols owned/.test(live)) throw new Error("Books card missing vault stats");
});
step("mediasync: manga import copy + three enrichment blocks (anime, books, vn since 3c)", async () => {
  KOS.show("mediasync");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-enrich-block").length === 3, 3000);
  if (main.querySelectorAll(".med-enrich-block").length !== 3) throw new Error("enrichment blocks");
  if (!/manga lands in Books/.test(main.textContent)) throw new Error("import copy not updated");
  if (!/MAL ids/.test(main.textContent)) throw new Error("stale AniList-id copy");
});
step("shrine routes a Books favourite through the Books editor", async () => {
  const e = await p(cb => KOS.mediadb.get(idBerserk, cb));
  e.favourite = true;
  await p(cb => KOS.mediadb.put(e, cb));
  KOS.show("shrine");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".shrine-card").length > 0, 5000);
  const card = [...main.querySelectorAll(".shrine-card")].find(c => /Berserk/.test(c.textContent));
  if (!card) throw new Error("Books favourite not in the Shrine");
  card.click();
  await tick(60);
  const modal = document.querySelector(".bk-modal");
  if (!modal) throw new Error("Shrine opened the wrong editor for a Books entry");
  modal.querySelector("button[aria-label='Close']").click();
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE5 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE5 PASS — Books dual-tracking layer verified (" + steps.length + " steps).");
  process.exit(0);
})();
