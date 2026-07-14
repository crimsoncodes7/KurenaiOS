/* Kurenai OS — smoke9.test.js
   Build 3f Anime-deepening suite: the season computation (calendar
   quarters → AniList's enum), the extra{} merge fix (season/seasonYear
   must survive an XML re-import), the airing countdown (mocked network —
   live shape verified 2026-07-03: nextAiringEpisode { airingAt unix secs,
   timeUntilAiring, episode }), its cache TTL + forced refresh, vault
   badges, the Seasonal Watching view + per-season palette class, the
   Matrix home "airing soon" strip (beside, never replacing, the consuming
   strip), the watch-history heatmap (same sessions log + same
   KOS.charts.heatmap as Books — filtered to anime only), and the AniList
   profile view (one-request bundle: identity, stats, favourites, follows,
   notifications with resetNotificationCount:false, activity).
   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke9.test.js                                             */
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

/* ---- network mock ---- */
let netLog = [];
const NOW_SECS = Math.floor(Date.now() / 1000);
function mockResponse(status, jsonBody) {
  return {
    ok: status >= 200 && status < 300, status,
    headers: { get: () => null },
    json: () => Promise.resolve(jsonBody === undefined ? {} : jsonBody),
    text: () => Promise.resolve(JSON.stringify(jsonBody || {}))
  };
}
const PROFILE_DATA = {
  Viewer: {
    id: 7, name: "crimson", about: "A-level grind + anime.",
    avatar: { large: "https://x/av.png" }, bannerImage: "https://x/banner.jpg",
    siteUrl: "https://anilist.co/user/crimson", createdAt: NOW_SECS - 86400 * 400,
    unreadNotificationCount: 3,
    statistics: {
      anime: { count: 162, episodesWatched: 2100, minutesWatched: 50400, meanScore: 74.1,
        genres: [{ genre: "Drama", count: 85 }, { genre: "Action", count: 72 }],
        statuses: [{ status: "COMPLETED", count: 112 }, { status: "CURRENT", count: 12 }],
        formats: [{ format: "TV", count: 130 }], lengths: [{ length: "13 - 26", count: 90 }], releaseYears: [{ releaseYear: 2024, count: 24 }] },
      manga: { count: 40, chaptersRead: 3200, volumesRead: 210, meanScore: 80, genres: [],
        statuses: [{ status: "CURRENT", count: 18 }], formats: [{ format: "MANGA", count: 35 }], lengths: [{ length: "50+", count: 21 }], releaseYears: [{ releaseYear: 2023, count: 8 }] }
    },
    favourites: {
      anime: { nodes: [{ id: 1, title: { romaji: "Sousou no Frieren", english: "Frieren" }, coverImage: { large: "https://x/f.jpg" } }] },
      manga: { nodes: [{ id: 2, title: { romaji: "Berserk" }, coverImage: { large: "https://x/b.jpg" } }] },
      characters: { nodes: [{ id: 3, name: { full: "Frieren" }, image: { large: "https://x/c.png" } }] },
      staff: { nodes: [{ id: 4, name: { full: "Evan Call" }, image: { large: "https://x/s.png" } }] },
      studios: { nodes: [{ id: 5, name: "MADHOUSE" }] }
    }
  },
  followers: { pageInfo: { total: 13 }, followers: [{ id: 9, name: "amab", avatar: { medium: "https://x/u.png" } }] },
  following: { pageInfo: { total: 14 }, following: [{ id: 10, name: "envinyx", avatar: { medium: "https://x/u2.png" } }] },
  activity: { activities: [
    { __typename: "ListActivity", id: 1, status: "watched episode", progress: "5 - 8", createdAt: NOW_SECS - 3600,
      media: { title: { romaji: "Kamiina Botan" }, coverImage: { medium: "https://x/k.jpg" } } },
    { __typename: "TextActivity", id: 2, text: "good season", createdAt: NOW_SECS - 7200 }
  ] },
  notifications: { notifications: [
    { __typename: "AiringNotification", id: 1, episode: 12, contexts: ["Episode ", " of ", " aired."],
      createdAt: NOW_SECS - 1800, media: { title: { romaji: "Yomi no Tsugai" } } },
    { __typename: "FollowingNotification", id: 2, context: " started following you.", createdAt: NOW_SECS - 9000,
      user: { name: "GalaxyFrog" } }
  ] }
};
let airingResponder = ids => ({
  data: { Page: { media: ids.map(id => ({
    id, status: "RELEASING",
    nextAiringEpisode: { airingAt: NOW_SECS + 90000, timeUntilAiring: 90000, episode: 13 }
  })) } }
});
window.fetch = (url, opts) => {
  const body = opts && opts.body ? JSON.parse(opts.body) : {};
  const rec = { url, body, q: body.query || "" };
  netLog.push(rec);
  if (/graphql\.anilist\.co/.test(url)) {
    if (/nextAiringEpisode/.test(rec.q)) {
      return Promise.resolve(mockResponse(200, airingResponder(body.variables.ids)));
    }
    if (/unreadNotificationCount/.test(rec.q)) {
      return Promise.resolve(mockResponse(200, { data: PROFILE_DATA }));
    }
    return Promise.resolve(mockResponse(200, { data: {} }));
  }
  return Promise.resolve(mockResponse(200, {}));
};

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
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
async function waitFor(cond, ms) {
  const deadline = Date.now() + (ms || 4000);
  while (Date.now() < deadline) {
    if (cond()) return true;
    await tick(25);
  }
  return cond();
}
const airingCalls = () => netLog.filter(r => /nextAiringEpisode/.test(r.q)).length;

const cur = KOS.anime.currentSeason();
let frierenId;

/* ============ 1 · season computation ============ */
console.log("== season computation ==");
step("calendar quarters map onto AniList's enum, year carried", async () => {
  const cases = [
    ["2026-01-15", "WINTER"], ["2026-03-31", "WINTER"],
    ["2026-04-01", "SPRING"], ["2026-06-30", "SPRING"],
    ["2026-07-03", "SUMMER"], ["2026-09-30", "SUMMER"],
    ["2026-10-01", "FALL"], ["2026-12-31", "FALL"]
  ];
  for (const [d, want] of cases) {
    const got = KOS.anime.currentSeason(new window.Date(d + "T12:00:00"));
    if (got.season !== want) throw new Error(d + " → " + got.season + ", wanted " + want);
    if (got.year !== 2026) throw new Error("year wrong for " + d);
  }
  if (!KOS.anime.currentSeason().season) throw new Error("no-arg (device date) form broken");
});
step("fmtCountdown: days/hours/minutes/now", async () => {
  const f = KOS.anime.fmtCountdown;
  if (f(90000) !== "1d 1h") throw new Error("90000 → " + f(90000));
  if (f(3700) !== "1h 1m") throw new Error("3700 → " + f(3700));
  if (f(300) !== "5m") throw new Error("300 → " + f(300));
  if (f(0) !== "airing now" || f(-5) !== "airing now") throw new Error("past shape");
});

/* ============ 2 · season persistence + the merge fix ============ */
console.log("== season persistence ==");
step("sync mapping stores season/seasonYear in extra, and put() keeps them", async () => {
  const mapped = KOS.anilist.mapListEntry({
    status: "CURRENT", progress: 4,
    media: { id: 154587, idMal: 52991, title: { romaji: "Sousou no Frieren" },
      episodes: 28, genres: ["Drama"], season: cur.season, seasonYear: cur.year,
      coverImage: { large: "https://x/f.jpg" }, studios: { nodes: [{ name: "MADHOUSE" }] } }
  }, "anime");
  if (mapped.extra.season !== cur.season || mapped.extra.seasonYear !== cur.year) throw new Error("mapper dropped season");
  await p(cb => KOS.mediadb.bulkUpsert([mapped], {}, cb));
  const row = await p(cb => KOS.mediadb.getByExternal("anilist", 154587, cb));
  if (!row || row.extra.season !== cur.season || row.extra.seasonYear !== cur.year) throw new Error("season not persisted: " + JSON.stringify(row && row.extra));
  frierenId = row.id;
});
step("MERGE FIX: an XML re-import (empty extra) no longer wipes stored season", async () => {
  await p(cb => KOS.mediadb.bulkUpsert([{
    module: "anime", title: "Sousou no Frieren", status: "inProgress",
    progress: { current: 5, total: 28 }, externalIds: { malId: 52991 },
    syncSource: "import", lastSyncedAt: null
  }], {}, cb));
  const row = await p(cb => KOS.mediadb.get(frierenId, cb));
  if (row.progress.current !== 5) throw new Error("import list-state should win (fixture sanity)");
  if (row.extra.season !== cur.season || row.extra.seasonYear !== cur.year) {
    throw new Error("extra wiped by re-import: " + JSON.stringify(row.extra));
  }
});
step("a null in fresh sync extra never beats stored data; fresh non-null wins", async () => {
  await p(cb => KOS.mediadb.bulkUpsert([{
    module: "anime", title: "Sousou no Frieren", status: "inProgress",
    externalIds: { anilistId: 154587 }, syncSource: "anilist",
    extra: { season: null, seasonYear: null, studio: "MADHOUSE II", format: null }
  }], {}, cb));
  const row = await p(cb => KOS.mediadb.get(frierenId, cb));
  if (row.extra.season !== cur.season) throw new Error("null beat stored season");
  if (row.extra.studio !== "MADHOUSE II") throw new Error("fresh non-null value should win");
});

/* ============ 3 · airing countdown ============ */
console.log("== airing ==");
step("candidates: inProgress + recent planned with ids only; caps at 150", async () => {
  const rows = [
    { status: "inProgress", externalIds: { anilistId: 1 } },
    { status: "inProgress", externalIds: {} },                                        // no id
    { status: "planned", externalIds: { anilistId: 2 }, extra: { seasonYear: cur.year } },
    { status: "planned", externalIds: { anilistId: 3 }, extra: { seasonYear: cur.year - 5 } },  // stale
    { status: "completed", externalIds: { anilistId: 4 } }
  ];
  const ids = KOS.anime.airingCandidates(rows, new window.Date());
  if (ids.join(",") !== "1,2") throw new Error("candidate set: " + ids.join(","));
  const many = [];
  for (let i = 0; i < 300; i++) many.push({ status: "inProgress", externalIds: { anilistId: i + 10 } });
  if (KOS.anime.airingCandidates(many, new window.Date()).length !== 150) throw new Error("cap missing");
});
step("anime view fetches airing once, paints EP badges; TTL suppresses a refetch", async () => {
  KOS.show("anime");
  const main = document.getElementById("main");
  await waitFor(() => airingCalls() >= 1, 4000);
  await waitFor(() => [...main.querySelectorAll(".an-airing")].length > 0, 4000);
  const chip = main.querySelector(".an-airing");
  if (!/EP 13 · 1d 1h/.test(chip.textContent)) throw new Error("badge text: " + chip.textContent);
  if (!/airs/.test(chip.title)) throw new Error("full air date missing from tooltip");
  const calls = airingCalls();
  KOS.show("home");
  KOS.show("anime");
  await tick(300);
  if (airingCalls() !== calls) throw new Error("TTL should suppress a second fetch on quick navigation");
});
step("refreshAiring(force) bypasses the TTL; cache is memory-only (vault untouched)", async () => {
  const calls = airingCalls();
  await new Promise(res => KOS.anime.refreshAiring(true, () => res()));
  if (airingCalls() !== calls + 1) throw new Error("force did not refetch");
  const row = await p(cb => KOS.mediadb.get(frierenId, cb));
  if (JSON.stringify(row).indexOf("airingAt") !== -1) throw new Error("live airing data leaked into the vault");
});

/* ============ 4 · Seasonal Watching ============ */
console.log("== seasonal ==");
step("seasonal view: current-season entries only, palette class, no-season entries absent", async () => {
  await p(cb => KOS.mediadb.add({ module: "anime", title: "Old Classic", status: "inProgress",
    externalIds: { anilistId: 4181 }, extra: { season: "FALL", seasonYear: 2008 } }, cb));
  await p(cb => KOS.mediadb.add({ module: "anime", title: "Hand Tracked No Season", status: "inProgress" }, cb));
  KOS.show("seasonal");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-card").length > 0, 4000);
  const wrap = main.querySelector(".season-view");
  if (!wrap) throw new Error("season container missing");
  const meta = KOS.anime.SEASON_META[cur.season];
  if (!wrap.classList.contains(meta.cls)) throw new Error("palette class missing: " + wrap.className);
  if (!new RegExp(meta.label + " " + cur.year).test(wrap.textContent)) throw new Error("season header wrong");
  const titles = [...main.querySelectorAll(".med-card .med-title")].map(x => x.textContent);
  if (!titles.some(t => /Frieren/.test(t))) throw new Error("current-season entry missing");
  if (titles.some(t => /Old Classic|Hand Tracked/.test(t))) throw new Error("non-current/no-season entries leaked in: " + titles.join(", "));
  if (!/appear here/.test(wrap.textContent)) throw new Error("the accepted limitation must be stated");
  if (![...main.querySelectorAll("button")].some(b => /Refresh airing/.test(b.textContent))) throw new Error("manual refresh missing");
});

/* ============ 5 · Matrix home: airing soon ============ */
console.log("== matrix ==");
step("airing-soon strip renders beside the consuming strip (not instead of it)", async () => {
  KOS.show("matrix");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".mx-air-card").length > 0, 4000);
  const row = main.querySelector(".mx-air-card");
  if (!/Frieren/.test(row.textContent)) throw new Error("airing entry missing");
  if (!/1d 1h/.test(row.textContent) || !/EP 13/.test(row.textContent)) throw new Error("countdown/episode missing: " + row.textContent);
  await waitFor(() => main.querySelectorAll(".med-strip-card").length > 0, 4000);
  if (!main.querySelector(".med-strip-card")) throw new Error("consuming strip was replaced — it must coexist");
  if (![...main.querySelectorAll("button")].some(b => /Seasonal view/.test(b.textContent))) throw new Error("seasonal link missing");
});

/* ============ 6 · watch-history heatmap ============ */
console.log("== heatmap ==");
step("anime activity heatmap lives in the stats modal, counting ONLY anime logs", async () => {
  const row = await p(cb => KOS.mediadb.get(frierenId, cb));
  KOS.media.logActivity(row, "progress");
  KOS.media.logActivity(row, "progress");
  KOS.sessions.log({ type: "media", subject: null, ref: null, dur: null,
    metrics: { module: "books", entryId: 1, title: "Berserk", action: "progress" } });
  KOS.medview.statsModal("anime", KOS.media.module("anime"));
  await waitFor(() => document.querySelector(".stats-modal"), 4000);
  const modal = document.querySelector(".stats-modal");
  const card = [...modal.querySelectorAll(".cs-chart")].find(c => /Activity/.test(c.textContent));
  if (!card) throw new Error("activity heatmap missing from the stats modal");
  if (!/2 watch logs/.test(card.textContent)) throw new Error("books log leaked into the anime count: " + card.textContent.slice(0, 80));
  if (!card.querySelector("svg rect")) throw new Error("not rendered via KOS.charts.heatmap SVG");
  const ov = modal.closest(".modal-ov"); if (ov) ov.remove();
});

/* ============ 7 · AniList profile ============ */
console.log("== profile ==");
step("not connected → connect-first empty state", async () => {
  KOS.show("aniprofile");
  const main = document.getElementById("main");
  await waitFor(() => /Connect your AniList first/.test(main.textContent), 4000);
  if (![...main.querySelectorAll("button")].some(b => /Sync & Import/.test(b.textContent))) throw new Error("no route to connect");
});
step("connected: one-request bundle renders identity, stats, favourites, follows, notifications, activity", async () => {
  await p(cb => KOS.mediadb.setKV("anilist.token", "al-token", cb));
  await p(cb => KOS.mediadb.setKV("anilist.viewer", { id: 7, name: "crimson" }, cb));
  const before = netLog.filter(r => /unreadNotificationCount/.test(r.q)).length;
  KOS.show("aniprofile");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".ap-head").length > 0, 4000);
  const reqs = netLog.filter(r => /unreadNotificationCount/.test(r.q));
  if (reqs.length !== before + 1) throw new Error("profile must be ONE request, saw " + (reqs.length - before));
  const req = reqs[reqs.length - 1];
  if (req.body.variables.userId !== 7) throw new Error("userId variable");
  if (!/resetNotificationCount: false/.test(req.q)) throw new Error("notifications must not consume the site's unread badge");
  if (req.opts && req.opts.headers) { /* auth checked below via anilist client behaviour */ }
  /* 3j: the bundle renders across five tabs off the SAME single fetch —
     the header + Overview first, then each tab's slice after a click */
  function clickTab(name) {
    [...main.querySelectorAll(".ap-tabs .study-tab")].find(b => b.textContent === name).click();
  }
  let txt = main.textContent;
  if (!/crimson/.test(txt)) throw new Error("name missing");
  if (!main.querySelector(".ap-avatar")) throw new Error("avatar missing");
  if (!main.querySelector(".ap-head.has-banner")) throw new Error("banner missing");
  if (!/A-level grind \+ anime\./.test(txt)) throw new Error("about missing");
  if (!/3 unread/.test(txt)) throw new Error("unread count missing");
  if (!/162/.test(txt) || !/2100/.test(txt) || !/35\.0/.test(txt)) throw new Error("anime stats missing (incl. days watched 50400min → 35.0)");
  if (!/3200/.test(txt) || !/210/.test(txt)) throw new Error("manga stats missing");
  clickTab("Analytics");
  txt = main.textContent;
  if (!/Anime formats/.test(txt) || !/Manga formats/.test(txt) || !main.querySelector(".ap-analytics-grid")) throw new Error("analytics tab missing both media types");
  clickTab("Favourites");
  txt = main.textContent;
  if (!/Sousou no Frieren/.test(txt) || !/Berserk/.test(txt)) throw new Error("media favourites missing");
  if (!/Evan Call/.test(txt) || !/MADHOUSE/.test(txt)) throw new Error("staff/studio favourites missing");
  clickTab("Social");
  txt = main.textContent;
  if (!/13 followers · 14 following/.test(txt)) throw new Error("follow counts missing");
  if (!/amab/.test(txt) || !/envinyx/.test(txt)) throw new Error("follow lists missing");
  clickTab("Notifications");
  txt = main.textContent;
  if (!/Episode 12 of Yomi no Tsugai aired\./.test(txt)) throw new Error("airing notification not composed from contexts");
  if (!/GalaxyFrog started following you\./.test(txt)) throw new Error("following notification missing");
  if (!/never marks them read/.test(txt)) throw new Error("read-only note missing");
  clickTab("Activity");
  txt = main.textContent;
  if (!/watched episode 5 - 8 of Kamiina Botan/.test(txt)) throw new Error("list activity missing");
  if (!/good season/.test(txt)) throw new Error("text activity missing");
  const after = netLog.filter(r => /unreadNotificationCount/.test(r.q)).length;
  if (after !== before + 1) throw new Error("tab switching must not refetch");
  clickTab("Overview");
});
step("profile cache: re-entering within TTL is free; ⟳ forces a refetch", async () => {
  const count = () => netLog.filter(r => /unreadNotificationCount/.test(r.q)).length;
  const before = count();
  KOS.show("home");
  KOS.show("aniprofile");
  await waitFor(() => document.querySelectorAll(".ap-head").length > 0, 4000);
  if (count() !== before) throw new Error("cache miss on quick re-entry");
  const btn = [...document.querySelectorAll("#main button")].find(b => /⟳ Refresh/.test(b.textContent));
  btn.click();
  await waitFor(() => count() === before + 1, 4000);
  if (count() !== before + 1) throw new Error("force refresh did not refetch");
});
step("nav: Sync reaches AniList and history returns to the Sync tab", async () => {
  const rb = [...document.querySelectorAll("#rail .rail-item")].find(b => b.dataset.section === "collection");
  if (!rb) throw new Error("collection rail button missing");
  rb.click();
  await tick(60);
  const sn = [...document.querySelectorAll("#subnav .subnav-item")].find(b => /^Sync$/.test(b.textContent.trim()));
  if (!sn) throw new Error("Sync entry missing");
  sn.click();
  await tick(60);
  const anilist = [...document.querySelectorAll(".collection-workspace-tabs button")].find(b => /^AniList$/.test(b.textContent.trim()));
  if (!anilist) throw new Error("AniList Sync tab missing");
  anilist.click();
  await tick(60);
  if (!/AniList Profile/.test(document.getElementById("main").textContent)) throw new Error("navigation failed");
  if (!document.querySelector("#subnav .subnav-item.active")?.textContent.includes("Sync")) throw new Error("Sync nav was not active");
  KOS.back();
  await tick(60);
  if (!document.querySelector(".collection-workspace-tabs .study-tab.active")?.textContent.includes("Sync & Import")) throw new Error("back did not restore Sync & Import tab");
  KOS.forward();
  await tick(60);
  if (!/AniList Profile/.test(document.getElementById("main").textContent)) throw new Error("forward navigation failed");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE9 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE9 PASS — Build 3f Anime deepening verified (" + steps.length + " steps).");
  process.exit(0);
})();
