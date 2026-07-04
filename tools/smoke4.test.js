/* Kurenai OS — smoke4.test.js
   Build 3a Collection Matrix suite: the IndexedDB media layer, the shared
   schema, XML import, AniList mapping + sync dedup, the enrichment pipeline
   (mocked network — 429 backoff included), the rest streak, the governor
   HP boundary, and all four new views. Run:
     npm install fake-indexeddb   (one-time, alongside jsdom)
     node tools/smoke4.test.js

   The network layer is mocked here for repeatability. The REAL endpoint was
   exercised live during Build 3a (2026-07-02): the public batch query
   returned 200 with access-control-allow-origin:* under Origin:null (i.e.
   file:// works), X-RateLimit-Limit was 30 (degraded state), and the
   MediaListCollection query ran verbatim against a real account.          */
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

/* fake IndexedDB — jsdom ships none */
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

/* async step runner */
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(err.message || String(err))) : res(out))); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
/* fake-indexeddb walks cursors ~one event-loop tick per record, so async
   view fills take ~200 ms at the 650-entry scale — poll, don't guess */
async function waitFor(cond, ms) {
  const deadline = Date.now() + (ms || 3000);
  while (Date.now() < deadline) {
    if (cond()) return true;
    await tick(40);
  }
  return cond();
}

/* ============ 1 · mediadb: schema + CRUD + indexed queries ============ */
console.log("== mediadb ==");
let idClannad;
step("normalise applies the shared-schema defaults (anime → digital)", async () => {
  const n = KOS.mediadb.normalise({ title: "X", module: "anime" });
  if (n.ownership !== "digital" || n.status !== "planned" || n.score !== 0 ||
      n.syncSource !== "manual" || n.lastSyncedAt !== null ||
      !Array.isArray(n.tags) || n.progress.total !== null) throw new Error(JSON.stringify(n));
  if (!n.createdAt || !n.updatedAt || n.titleLower !== "x") throw new Error("stamps missing");
});
step("add + get roundtrip", async () => {
  const rec = await p(cb => KOS.mediadb.add({
    module: "anime", title: "CLANNAD: After Story", status: "inProgress",
    progress: { current: 3, total: 24 }, genres: ["Drama", "Romance"],
    tags: ["comfort"], externalIds: { anilistId: 4181 }, favourite: true, score: 10
  }, cb));
  idClannad = rec.id;
  const got = await p(cb => KOS.mediadb.get(idClannad, cb));
  if (!got || got.title !== "CLANNAD: After Story" || got.progress.total !== 24) throw new Error("roundtrip failed");
});
step("put updates in place (same id, updatedAt moves)", async () => {
  const got = await p(cb => KOS.mediadb.get(idClannad, cb));
  const before = got.updatedAt;
  await tick(3);
  got.progress.current = 4;
  await p(cb => KOS.mediadb.put(got, cb));
  const again = await p(cb => KOS.mediadb.get(idClannad, cb));
  if (again.progress.current !== 4 || again.updatedAt <= before) throw new Error("update failed");
});
step("query narrows on the [module,status] index; genre/tag/search filters work", async () => {
  await p(cb => KOS.mediadb.add({ module: "anime", title: "GOSICK", status: "completed", genres: ["Mystery", "Drama"], externalIds: { anilistId: 8425 } }, cb));
  /* legacy "manga" module name — v3 normalises it into "books" */
  await p(cb => KOS.mediadb.add({ module: "manga", title: "Berserk", status: "inProgress", genres: ["Drama"] }, cb));
  const inProg = await p(cb => KOS.mediadb.query({ module: "anime", status: "inProgress" }, cb));
  if (inProg.length !== 1 || inProg[0].title !== "CLANNAD: After Story") throw new Error("mod_status query: " + inProg.length);
  const drama = await p(cb => KOS.mediadb.query({ module: "anime", genre: "Drama" }, cb));
  if (drama.length !== 2) throw new Error("genre query: " + drama.length);
  const tagged = await p(cb => KOS.mediadb.query({ tag: "comfort" }, cb));
  if (tagged.length !== 1) throw new Error("tag query: " + tagged.length);
  const found = await p(cb => KOS.mediadb.query({ module: "anime", search: "gosick" }, cb));
  if (found.length !== 1 || found[0].title !== "GOSICK") throw new Error("search failed");
  const favs = await p(cb => KOS.mediadb.query({ favourite: true }, cb));
  if (favs.length !== 1 || favs[0].id !== idClannad) throw new Error("favourite filter");
});
step("distinct() lists index keys; stats() aggregates once", async () => {
  const genres = await p(cb => KOS.mediadb.distinct("genres", cb));
  if (genres.join() !== "Drama,Mystery,Romance") throw new Error(genres.join());
  const agg = await p(cb => KOS.mediadb.stats(cb));
  if (agg.total !== 3 || agg.modules.anime.total !== 2 || agg.modules.books.inProgress !== 1 ||
      agg.genres.Drama !== 3 || agg.favourites !== 1) throw new Error(JSON.stringify(agg));
});
step("bulkUpsert matches by anilistId — keeps local notes/favourite, no dupes", async () => {
  const got = await p(cb => KOS.mediadb.get(idClannad, cb));
  got.notes = "kept";
  await p(cb => KOS.mediadb.put(got, cb));
  const res = await p(cb => KOS.mediadb.bulkUpsert([
    { module: "anime", title: "CLANNAD: After Story", status: "completed", progress: { current: 24, total: 24 }, externalIds: { anilistId: 4181 }, syncSource: "anilist", lastSyncedAt: Date.now() },
    { module: "anime", title: "Sousou no Frieren", status: "planned", externalIds: { anilistId: 154587 }, syncSource: "anilist" }
  ], {}, cb));
  if (res.added !== 1 || res.updated !== 1) throw new Error(JSON.stringify(res));
  const after = await p(cb => KOS.mediadb.get(idClannad, cb));
  if (after.status !== "completed" || after.notes !== "kept" || !after.favourite) throw new Error("merge lost local fields");
  const n = await p(cb => KOS.mediadb.count("anime", cb));
  if (n !== 3) throw new Error("count=" + n);
});
step("bulkUpsert enrichOnly fills art but never touches list state", async () => {
  await p(cb => KOS.mediadb.bulkUpsert([
    { module: "anime", title: "CLANNAD: After Story", status: "dropped", coverUrl: "https://img/x.png", genres: ["Drama", "Romance", "Slice of Life"], externalIds: { anilistId: 4181 } }
  ], { enrichOnly: true }, cb));
  const after = await p(cb => KOS.mediadb.get(idClannad, cb));
  if (after.status !== "completed") throw new Error("enrichOnly overwrote status");
  if (after.coverUrl !== "https://img/x.png" || after.genres.length !== 3) throw new Error("enrichment fields not applied");
});
step("650-entry scale: bulk insert + indexed filter stays correct", async () => {
  const batch = [];
  for (let i = 0; i < 650; i++) {
    batch.push({ module: "anime", title: "Bulk " + i,
      status: i % 5 === 0 ? "inProgress" : "planned",
      genres: [i % 2 ? "Action" : "Fantasy"], externalIds: { anilistId: 100000 + i } });
  }
  const t0 = Date.now();
  const res = await p(cb => KOS.mediadb.bulkUpsert(batch, {}, cb));
  if (res.added !== 650) throw new Error("added=" + res.added);
  const rows = await p(cb => KOS.mediadb.query({ module: "anime", status: "inProgress", genre: "Fantasy" }, cb));
  // i%5===0 AND i%2===0 (Fantasy) → i ≡ 0 (mod 10) → 65, plus CLANNAD is completed now → 65
  if (rows.length !== 65) throw new Error("filtered=" + rows.length);
  console.log("      (650 upserts + indexed query in " + (Date.now() - t0) + " ms)");
});

/* ============ 2 · XML import ============ */
console.log("== XML import ==");
const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8" ?>
<myanimelist>
  <myinfo><user_name>CrimsonK7</user_name></myinfo>
  <anime>
    <series_animedb_id>4181</series_animedb_id>
    <series_title><![CDATA[CLANNAD: After Story]]></series_title>
    <series_episodes>24</series_episodes>
    <my_watched_episodes>3</my_watched_episodes>
    <my_start_date>2026-04-27</my_start_date>
    <my_finish_date>0000-00-00</my_finish_date>
    <my_score>0</my_score>
    <my_status>Watching</my_status>
  </anime>
  <anime>
    <series_animedb_id>162314</series_animedb_id>
    <series_title><![CDATA[Shingeki no Kyojin: Kanketsu-hen]]></series_title>
    <series_episodes>0</series_episodes>
    <my_watched_episodes>0</my_watched_episodes>
    <my_start_date>0000-00-00</my_start_date>
    <my_finish_date>0000-00-00</my_finish_date>
    <my_score>8.5</my_score>
    <my_status>Plan to Watch</my_status>
  </anime>
  <anime>
    <series_animedb_id>21</series_animedb_id>
    <series_title><![CDATA[ONE PIECE]]></series_title>
    <series_episodes>0</series_episodes>
    <my_watched_episodes>1000</my_watched_episodes>
    <my_start_date>2020-01-01</my_start_date>
    <my_finish_date>0000-00-00</my_finish_date>
    <my_score>9</my_score>
    <my_status>On-Hold</my_status>
  </anime>
</myanimelist>`;
step("parses CDATA titles, 0000-00-00 sentinel, status map, unknown totals", async () => {
  const out = KOS.media.parseXML(SAMPLE_XML);
  if (out.error) throw new Error(out.error);
  if (out.module !== "anime" || out.userName !== "CrimsonK7" || out.entries.length !== 3) throw new Error("shape");
  const [a, b, c] = out.entries;
  /* the export's ids are MAL ids (verified live — they only coincide with
     AniList ids on old titles), so they land in externalIds.malId */
  if (a.title !== "CLANNAD: After Story" || a.status !== "inProgress" ||
      a.progress.current !== 3 || a.progress.total !== 24 ||
      a.dates.started !== "2026-04-27" || a.dates.finished !== null ||
      a.externalIds.malId !== 4181 || a.externalIds.anilistId != null ||
      a.syncSource !== "import" || a.lastSyncedAt !== null) throw new Error(JSON.stringify(a));
  if (b.status !== "planned" || b.progress.total !== null || b.score !== 8.5) throw new Error(JSON.stringify(b));
  if (c.status !== "onHold" || c.progress.current !== 1000) throw new Error(JSON.stringify(c));
});
step("rejects garbage and empty exports with readable messages", async () => {
  if (!KOS.media.parseXML("not xml <<<").error) throw new Error("garbage accepted");
  if (!KOS.media.parseXML("<wrong></wrong>").error) throw new Error("wrong root accepted");
  if (!KOS.media.parseXML("<myanimelist></myanimelist>").error) throw new Error("empty accepted");
});
step("manga export maps chapters via series_mangadb_id/my_read_chapters → Books (3b)", async () => {
  const out = KOS.media.parseXML(`<myanimelist><manga>
    <series_mangadb_id>30002</series_mangadb_id>
    <series_title><![CDATA[Berserk]]></series_title>
    <series_chapters>380</series_chapters>
    <my_read_chapters>120</my_read_chapters>
    <my_status>Reading</my_status>
    <my_score>10</my_score>
    <my_start_date>0000-00-00</my_start_date><my_finish_date>0000-00-00</my_finish_date>
  </manga></myanimelist>`);
  if (out.error) throw new Error(out.error);
  const m = out.entries[0];
  if (out.module !== "books" || m.status !== "inProgress" || m.progress.current !== 120 ||
      m.progress.total !== 380 || m.externalIds.malId !== 30002 || m.format !== "manga") throw new Error(JSON.stringify(m));
});

/* ============ 3 · AniList client (mocked network) ============ */
console.log("== anilist client ==");
function mockRes(status, body, headers) {
  return {
    ok: status >= 200 && status < 300, status,
    headers: { get: k => (headers || {})[k] != null ? String((headers || {})[k]) : null },
    json: () => Promise.resolve(body)
  };
}
step("authorize URL matches the documented implicit-grant shape", async () => {
  const u = KOS.anilist.authorizeUrl(" 12345 ");
  if (u !== "https://anilist.co/api/v2/oauth/authorize?client_id=12345&response_type=token") throw new Error(u);
});
step("fuzzy dates + status map", async () => {
  if (KOS.anilist.fuzzyToISO({ year: 2026, month: 4, day: 7 }) !== "2026-04-07") throw new Error("date pad");
  if (KOS.anilist.fuzzyToISO({ year: null, month: null, day: null }) !== null) throw new Error("null date");
  if (KOS.anilist.fuzzyToISO({ year: 2024 }) !== "2024-01-01") throw new Error("partial date");
  const m = KOS.anilist.STATUS_MAP;
  if (m.CURRENT !== "inProgress" || m.REPEATING !== "inProgress" || m.PLANNING !== "planned" ||
      m.PAUSED !== "onHold" || m.DROPPED !== "dropped" || m.COMPLETED !== "completed") throw new Error("status map");
});
step("syncList dedupes entries that AniList repeats in custom lists", async () => {
  const media = { id: 999, idMal: 555, title: { romaji: "Test", english: null }, coverImage: { extraLarge: "https://c/x.png", large: null }, genres: ["Drama"], season: "FALL", seasonYear: 2008, format: "TV", episodes: 24, chapters: null, volumes: null, studios: { nodes: [{ name: "KyoAni" }] } };
  const entry = { id: 55, status: "CURRENT", score: 8, progress: 3, startedAt: { year: 2026, month: 4, day: 27 }, completedAt: { year: null }, media };
  window.fetch = () => Promise.resolve(mockRes(200, { data: { MediaListCollection: { lists: [
    { name: "Watching", status: "CURRENT", entries: [entry] },
    { name: "━━━ ☾ ━━━", status: null, entries: [entry] }   // the duplicate, as seen live
  ] } } }));
  const mapped = await new Promise((res, rej) => KOS.anilist.syncList("tok", 1, "anime", (e, out) => e ? rej(new Error(e.message)) : res(out)));
  if (mapped.length !== 1) throw new Error("dedup failed: " + mapped.length);
  const e0 = mapped[0];
  if (e0.status !== "inProgress" || e0.progress.total !== 24 || e0.score !== 8 ||
      e0.coverUrl !== "https://c/x.png" || e0.externalIds.anilistId !== 999 ||
      e0.externalIds.malId !== 555 ||
      e0.dates.started !== "2026-04-27" || e0.syncSource !== "anilist" ||
      !e0.lastSyncedAt || e0.extra.studio !== "KyoAni") throw new Error(JSON.stringify(e0));
});
step("401 classifies as auth (reconnect prompt), 429 carries Retry-After", async () => {
  window.fetch = () => Promise.resolve(mockRes(401, {}));
  const err1 = await new Promise(res => KOS.anilist.gql("query{Viewer{id}}", {}, "bad", e => res(e)));
  if (!err1 || err1.kind !== "auth") throw new Error(JSON.stringify(err1));
  window.fetch = () => Promise.resolve(mockRes(429, {}, { "Retry-After": "7" }));
  const err2 = await new Promise(res => KOS.anilist.gql("query{Viewer{id}}", {}, null, e => res(e)));
  if (!err2 || err2.kind !== "ratelimit" || err2.retryAfter !== 7) throw new Error(JSON.stringify(err2));
});
step("enrich: partitions AniList vs MAL ids, survives a 429, reports progress", async () => {
  let calls = 0;
  const notes = [], fields = [];
  window.fetch = (url, opts) => {
    calls++;
    const body = JSON.parse(opts.body);
    fields.push(/idMal_in/.test(body.query) ? "mal" : "anilist");
    const vars = body.variables;
    if (calls === 1) return Promise.resolve(mockRes(429, {}, { "Retry-After": "0" }));
    return Promise.resolve(mockRes(200, { data: { Page: { pageInfo: { hasNextPage: false },
      media: vars.ids.map(id => ({ id: id < 5000 ? id : id + 100000, idMal: id,
        title: { romaji: "T" + id }, coverImage: { extraLarge: "https://c/" + id }, genres: ["G"], format: "TV", episodes: 12, studios: { nodes: [] } })) } } }));
  };
  const spec = {
    anilist: Array.from({ length: 60 }, (_, i) => 1000 + i),   // 2 chunks (id_in)
    mal: Array.from({ length: 10 }, (_, i) => 50000 + i)        // 1 chunk (idMal_in)
  };
  const records = await new Promise((res, rej) => KOS.anilist.enrich(spec, "anime", {
    onProgress: (d, t, note) => notes.push([d, t, note])
  }, (e, out) => e ? rej(new Error(e.message)) : res(out)));
  if (records.length !== 70) throw new Error("got " + records.length);
  const r0 = records.find(r => r.malId === 1000);
  if (!r0 || r0.coverUrl !== "https://c/1000" || r0.total !== 12) throw new Error(JSON.stringify(r0));
  const rMal = records.find(r => r.malId === 50000);
  if (!rMal || rMal.anilistId !== 150000) throw new Error("MAL record missing AniList backfill id: " + JSON.stringify(rMal));
  if (calls !== 4) throw new Error("expected 4 fetches (429 + 3 chunks), saw " + calls);
  if (fields[3] !== "mal") throw new Error("last chunk should query idMal_in, saw " + fields.join());
  if (!notes.some(n => n[2] && /rate limited/i.test(n[2]))) throw new Error("no rate-limit note surfaced");
});
step("bulkUpsert bridges id spaces: XML row (malId) matched by a later sync", async () => {
  const rec = await p(cb => KOS.mediadb.add({ module: "anime", title: "Oshi no Ko",
    status: "inProgress", progress: { current: 3, total: 11 },
    externalIds: { malId: 52034 }, syncSource: "import", notes: "from xml" }, cb));
  const res = await p(cb => KOS.mediadb.bulkUpsert([
    { module: "anime", title: "[Oshi no Ko]", status: "completed", progress: { current: 11, total: 11 },
      externalIds: { anilistId: 150672, malId: 52034 }, syncSource: "anilist", lastSyncedAt: Date.now() }
  ], {}, cb));
  if (res.added !== 0 || res.updated !== 1) throw new Error(JSON.stringify(res));
  const after = await p(cb => KOS.mediadb.get(rec.id, cb));
  if (after.externalIds.anilistId !== 150672 || after.externalIds.malId !== 52034 ||
      after.status !== "completed" || after.notes !== "from xml") throw new Error(JSON.stringify(after.externalIds) + " " + after.status);
});
step("connection kv: clientId + token live in IndexedDB, never localStorage", async () => {
  await p(cb => KOS.anilist.setClientId("777", cb));
  await p(cb => KOS.anilist.setToken("secret-token", cb));
  const conn = await p(cb => KOS.anilist.getConnection((e, c) => cb(e, c)));
  if (conn.clientId !== "777" || conn.token !== "secret-token") throw new Error(JSON.stringify(conn));
  const ls = JSON.stringify(window.localStorage);
  if (/secret-token/.test(JSON.stringify(KOS.store.state)) || /secret-token/.test(ls)) throw new Error("token leaked into localStorage state");
  await p(cb => KOS.anilist.disconnect(cb));
  const conn2 = await p(cb => KOS.anilist.getConnection((e, c) => cb(e, c)));
  if (conn2.token) throw new Error("disconnect kept the token");
});

/* ============ 4 · governor boundary + rest streak ============ */
console.log("== governor + rest streak ==");
step("media log: XP/gold trickle, HP untouched, study streak untouched", async () => {
  const g = KOS.store.state.governor;
  g.hp = 47;   // mid-range so movement in either direction would show
  const xp0 = g.xp, gold0 = g.gold;
  const study0 = KOS.sessions.streak(null);
  KOS.media.logActivity({ id: 1, module: "anime", title: "CLANNAD: After Story" }, "progress");
  if (g.xp !== xp0 + 4 || g.gold !== gold0 + 1) throw new Error("trickle wrong: xp+" + (g.xp - xp0) + " gold+" + (g.gold - gold0));
  if (g.hp !== 47) throw new Error("HP moved to " + g.hp + " — the boundary is broken");
  if (KOS.sessions.streak(null) !== study0) throw new Error("study streak moved");
  if (KOS.sessions.restStreak() < 1) throw new Error("rest streak did not start");
});
step("media days are invisible to the HP day-drain activity check", async () => {
  if (KOS.sessions.hasActivity(today, null)) throw new Error("media session counts as study activity — HP drain would be suppressed");
});
step("rest streak spans consecutive days, independent of subject sessions", async () => {
  KOS.store.state.sessions.push({ id: 9901, ts: Date.now(), date: KOS.srs.addDays(today, -1), type: "media", subject: null, ref: null, dur: null, metrics: { module: "anime" } });
  KOS.store.state.sessions.push({ id: 9902, ts: Date.now(), date: KOS.srs.addDays(today, -2), type: "media", subject: null, ref: null, dur: null, metrics: { module: "anime" } });
  if (KOS.sessions.restStreak() !== 3) throw new Error("restStreak=" + KOS.sessions.restStreak());
  if (KOS.sessions.streak(null) !== 0) throw new Error("study streak contaminated: " + KOS.sessions.streak(null));
});

/* ============ 5 · views ============ */
console.log("== views ==");
step("matrix home renders: streak pair, consuming strip, module cards", async () => {
  KOS.show("matrix");
  const main = document.getElementById("main");
  /* 3f adds async airing queries ahead of the strip query — wait, don't race */
  await waitFor(() => main.querySelector(".med-strip-card") && main.querySelectorAll(".med-mod-card").length === 4, 4000);
  if (!main.querySelector(".med-streaks")) throw new Error("no streak pair");
  if (!main.querySelector(".med-strip-card")) throw new Error("no consuming strip");
  if (main.querySelector(".soon-card")) throw new Error("no module should be a placeholder since 3e");
  if (main.querySelectorAll(".med-mod-card").length !== 4) throw new Error("expected 4 live module cards");
  if (!main.querySelector(".stat-strip")) throw new Error("no stats");
});
step("anime vault renders + lazy fallback paints all cards in jsdom", async () => {
  KOS.show("anime");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-card").length > 0, 5000);
  const cards = main.querySelectorAll(".med-card");
  if (!cards.length) throw new Error("no cards rendered");
  if (!main.querySelector(".med-toolbar")) throw new Error("no toolbar");
});
step("shrine renders favourites ranked, module-agnostic", async () => {
  KOS.show("shrine");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".shrine-card").length > 0, 5000);
  const cards = main.querySelectorAll(".shrine-card");
  if (cards.length !== 1) throw new Error("expected the 1 favourite, saw " + cards.length);
  if (!main.querySelector(".shrine-rank")) throw new Error("no rank badge");
});
step("mediasync renders all eight panels (AniList, VNDB, autosync, XML, maintenance, enrichment, games, write activity)", async () => {
  KOS.show("mediasync");
  await tick(60);
  const main = document.getElementById("main");
  if (main.querySelectorAll(".med-panel").length !== 8) throw new Error("panel count");   // +1 in 3j: Autonomous sync
  if (!/anilist\.co\/settings\/developer/.test(main.textContent)) throw new Error("setup steps missing");
  if (!/last-write-wins/.test(main.textContent)) throw new Error("write-back limitation not stated");
});
step("OS home shows the live Collection Matrix card (not Coming soon)", async () => {
  KOS.show("home");
  await tick(30);
  const card = document.querySelector(".med-home-card");
  if (!card) throw new Error("no live matrix card on home");
  if (!/Live/.test(card.textContent)) throw new Error("card not marked live");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE4 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE4 PASS — Collection Matrix layer verified (" + steps.length + " steps).");
  process.exit(0);
})();
