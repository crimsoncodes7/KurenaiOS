/* Kurenai OS — smoke12.test.js
   Build 3j suite: reward-on-sync (the watermark + unified diff), the
   autonomous sync engine, VN chapters, the profile tab split + the VNDB
   profile page, the rebalanced gold shop with Matrix cosmetics, and the
   season picker. Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke12.test.js

   THE core correctness property of the whole reward feature is step
   "push → echoing pull = exactly ONE reward": a local edit rewards once
   through logActivity, absorbs the watermark, pushes to AniList; a pull
   that then echoes the very same state back must produce ZERO reward
   events — one watermark, updated by whichever path acts first.

   LIVE FACTS backing the mocks (verified 2026-07-04):
   - VNDB GET /user?q=<uid>&fields=lengthvotes,lengthvotes_sum answers
     keyed by the query ({"u2":{...}}); GET /ulist_labels?user=<uid>
     &fields=count returns every label INCLUDING customs with counts;
     GET /stats returns site totals. The Kana API has NO favourites/
     followers/activity/notifications endpoints — the VNDB profile view
     states that instead of faking panels.                                */
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

KOS.mediapush._config({ debounce: 30, retryWait: 30 });
KOS.autosync._config({ pullGap: 20, drainWait: 1500 });

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(err.message || String(err))) : res(out))); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
async function waitFor(cond, ms) {
  const deadline = Date.now() + (ms || 3000);
  while (Date.now() < deadline) {
    if (cond()) return true;
    await tick(25);
  }
  return cond();
}

/* ---- network mock (same harness as smoke7) ---- */
let netLog = [];
let netScript = null;
function mockResponse(status, jsonBody, headers) {
  return {
    ok: status >= 200 && status < 300, status,
    headers: { get: h => (headers && headers[h]) || null },
    json: () => Promise.resolve(jsonBody === undefined ? {} : jsonBody),
    text: () => Promise.resolve(typeof jsonBody === "string" ? jsonBody : JSON.stringify(jsonBody || {}))
  };
}
window.fetch = (url, opts) => {
  const rec = { url, opts, body: opts && opts.body ? JSON.parse(opts.body) : null };
  netLog.push(rec);
  const scripted = netScript && netScript(url, rec);
  if (scripted) return Promise.resolve(scripted);
  if (/graphql\.anilist\.co/.test(url)) {
    return Promise.resolve(mockResponse(200, { data: { SaveMediaListEntry: { id: 1, status: "CURRENT", progress: 5, score: 8 } } }));
  }
  return Promise.resolve(mockResponse(204, null));
};

async function seedConnections() {
  await p(cb => KOS.mediadb.setKV("anilist.token", "al-token", cb));
  await p(cb => KOS.mediadb.setKV("anilist.viewer", { id: 1, name: "crimson" }, cb));
  await p(cb => KOS.mediadb.setKV("vndb.token", "vndb-token", cb));
  await p(cb => KOS.mediadb.setKV("vndb.user", { id: "u9", username: "crimson", permissions: ["listread"] }, cb));
}
/* a mapped AniList pull row, the shape KOS.anilist.mapListEntry emits */
function pulled(anilistId, title, status, progress, extra) {
  return Object.assign({
    module: "anime", title, status,
    progress: { current: progress, total: 24 },
    score: 8, genres: ["Drama"],
    dates: { started: null, finished: null },
    externalIds: { anilistId, malId: null },
    coverUrl: null, syncSource: "anilist", lastSyncedAt: Date.now(),
    extra: { format: "TV", season: "SPRING", seasonYear: 2026, studio: null, titleEnglish: null, volumes: null }
  }, extra || {});
}
function goldXp() { const g = KOS.store.state.governor; return { gold: g.gold, xp: g.xp }; }
function sessionCount() { return KOS.store.state.sessions.length; }

let idA;

/* ============ 1 · the watermark ============ */
console.log("== reward watermark ==");
step("normalise: chapters default [], reward defaults null; add() initialises the watermark", async () => {
  const bare = KOS.mediadb.normalise({ module: "vn", title: "X" });
  if (!Array.isArray(bare.chapters) || bare.chapters.length) throw new Error("chapters default");
  if (bare.reward !== null) throw new Error("reward must default null (uninitialised)");
  const ch = KOS.mediadb.normChapter({ name: "Ch 1", status: "inProgress", notes: "n" });
  if (ch.name !== "Ch 1" || ch.status !== "inProgress" || ch.notes !== "n") throw new Error("normChapter shape");
  if (KOS.mediadb.normChapter({ status: "bogus" }).status !== "planned") throw new Error("bad status must fall back");
  await seedConnections();
  const rec = await p(cb => KOS.mediadb.add({ module: "anime", title: "Frieren", status: "inProgress",
    progress: { current: 4, total: 24 }, score: 8,
    externalIds: { anilistId: 154587 }, syncSource: "anilist" }, cb));
  idA = rec.id;
  if (!rec.reward || rec.reward.progress !== 4 || rec.reward.status !== "inProgress") {
    throw new Error("add() must initialise the watermark: " + JSON.stringify(rec.reward));
  }
});
step("rewardDelta: null watermark absorbs silently; regression never rewards", async () => {
  const e = { progress: { current: 9, volumes: null }, status: "inProgress" };
  if (KOS.mediadb.rewardDelta(null, e) !== null) throw new Error("null watermark must not reward");
  if (KOS.mediadb.rewardDelta({ progress: 12, volumes: null, status: "inProgress" }, e) !== null) throw new Error("lower progress must not reward");
  const d = KOS.mediadb.rewardDelta({ progress: 4, volumes: null, status: "inProgress" }, e);
  if (!d || d.units !== 5 || d.statusAdvanced) throw new Error("progress 4→9 must reward 5 units: " + JSON.stringify(d));
  const d2 = KOS.mediadb.rewardDelta({ progress: 9, volumes: null, status: "inProgress" },
    { progress: { current: 9, volumes: null }, status: "completed" });
  if (!d2 || d2.units !== 0 || !d2.statusAdvanced) throw new Error("status advance alone must reward");
  if (KOS.mediadb.rewardDelta({ progress: 9, volumes: null, status: "inProgress" },
    { progress: { current: 9, volumes: null }, status: "dropped" }) !== null) throw new Error("dropping must never reward");
});

/* ============ 2 · THE core property ============ */
console.log("== push → echoing pull = ONE reward ==");
step("local edit rewards once, pushes; the echoing pull rewards NOTHING", async () => {
  netLog = [];
  /* the local edit, exactly as the +1 path does it: mutate, put, logActivity, schedule */
  const e = await p(cb => KOS.mediadb.get(idA, cb));
  const g0 = goldXp(), s0 = sessionCount();
  e.progress.current = 5;
  const rec = await p(cb => KOS.mediadb.put(e, cb));
  KOS.media.logActivity(rec, "progress");
  KOS.mediapush.schedule(rec);
  if (sessionCount() !== s0 + 1) throw new Error("local edit must log exactly one session");
  const goldAfterLocal = goldXp().gold;
  if (goldAfterLocal !== g0.gold + 1) throw new Error("local trickle must be +1 gold");
  /* watermark absorbed at put time — before the push even fires */
  if (rec.reward.progress !== 5) throw new Error("put() must absorb the watermark");
  await waitFor(() => netLog.some(r => /anilist/.test(r.url)), 3000);
  if (!netLog.some(r => /SaveMediaListEntry/.test(r.body && r.body.query || ""))) throw new Error("push did not fire");
  /* the echo: a pull carrying exactly the state we just pushed */
  const res = await p(cb => KOS.mediadb.bulkUpsert([pulled(154587, "Frieren", "inProgress", 5)], {}, cb));
  if (!res.rewards) throw new Error("bulkUpsert must return a rewards array");
  if (res.rewards.length !== 0) throw new Error("ECHO REWARDED TWICE: " + JSON.stringify(res.rewards));
  const logged = KOS.media.logSyncRewards("anime", res.rewards);
  if (logged !== null) throw new Error("no events → no session");
  if (sessionCount() !== s0 + 1) throw new Error("echo pull must not add sessions");
  if (goldXp().gold !== goldAfterLocal) throw new Error("echo pull must not add gold");
});
step("a pull discovering EXTERNAL progress rewards once, proportionally; repeat pull is silent", async () => {
  const g0 = goldXp(), s0 = sessionCount();
  /* mal-sync moved AniList to ep 9 + still inProgress */
  const res = await p(cb => KOS.mediadb.bulkUpsert([pulled(154587, "Frieren", "inProgress", 9)], {}, cb));
  if (res.rewards.length !== 1) throw new Error("expected 1 reward event, got " + res.rewards.length);
  if (res.rewards[0].units !== 4) throw new Error("progress 5→9 must be 4 units: " + JSON.stringify(res.rewards[0]));
  KOS.media.logSyncRewards("anime", res.rewards);
  if (sessionCount() !== s0 + 1) throw new Error("one sync = one session");
  const s = KOS.store.state.sessions[KOS.store.state.sessions.length - 1];
  if (s.type !== "media" || s.metrics.action !== "sync-reward" || s.metrics.units !== 4) throw new Error("session shape: " + JSON.stringify(s.metrics));
  const g1 = goldXp();
  if (g1.xp - g0.xp !== 4 + 4) throw new Error("xp must be proportional (4 base + 4 units): got +" + (g1.xp - g0.xp));
  if (g1.gold - g0.gold !== 1 + 1) throw new Error("gold: 1 base + floor(4/4): got +" + (g1.gold - g0.gold));
  /* the same pull again — watermark already absorbed */
  const res2 = await p(cb => KOS.mediadb.bulkUpsert([pulled(154587, "Frieren", "inProgress", 9)], {}, cb));
  if (res2.rewards.length !== 0) throw new Error("identical re-pull must be silent");
});
step("status advance via pull rewards; regression lowers the watermark with no clawback", async () => {
  const g0 = goldXp();
  const res = await p(cb => KOS.mediadb.bulkUpsert([pulled(154587, "Frieren", "completed", 24)], {}, cb));
  if (res.rewards.length !== 1 || !res.rewards[0].statusAdvanced) throw new Error("completion must reward: " + JSON.stringify(res.rewards));
  KOS.media.logSyncRewards("anime", res.rewards);
  const gAfter = goldXp();
  if (gAfter.gold <= g0.gold) throw new Error("completion reward missing");
  /* rewatch from scratch on the site: progress drops to 0, status inProgress */
  const res2 = await p(cb => KOS.mediadb.bulkUpsert([pulled(154587, "Frieren", "inProgress", 0)], {}, cb));
  if (res2.rewards.length !== 0) throw new Error("regression must not reward");
  if (goldXp().gold !== gAfter.gold) throw new Error("regression must not claw back");
  const e = await p(cb => KOS.mediadb.get(idA, cb));
  if (e.reward.progress !== 0 || e.reward.status !== "inProgress") throw new Error("watermark must follow the regression down: " + JSON.stringify(e.reward));
  /* the rewatch then advances — re-earning is the accepted, stated behaviour */
  const res3 = await p(cb => KOS.mediadb.bulkUpsert([pulled(154587, "Frieren", "inProgress", 3)], {}, cb));
  if (res3.rewards.length !== 1 || res3.rewards[0].units !== 3) throw new Error("rewatch progress must re-earn");
});
step("a FIRST sync (mass import) initialises every watermark silently", async () => {
  const s0 = sessionCount(), g0 = goldXp();
  const res = await p(cb => KOS.mediadb.bulkUpsert([
    pulled(1001, "Show A", "completed", 12),
    pulled(1002, "Show B", "inProgress", 7),
    pulled(1003, "Show C", "planned", 0)
  ], {}, cb));
  if (res.added !== 3) throw new Error("fixture: adds");
  if (res.rewards.length !== 0) throw new Error("brand-new rows must never reward: " + JSON.stringify(res.rewards));
  if (sessionCount() !== s0 || goldXp().gold !== g0.gold) throw new Error("mass import minted rewards");
  const b = await p(cb => KOS.mediadb.getByExternal("anilist", 1002, cb));
  if (!b.reward || b.reward.progress !== 7) throw new Error("insert must still initialise the watermark");
});
step("governor prices sync-reward proportionally and NEVER moves HP", async () => {
  const g = KOS.store.state.governor;
  const hp0 = g.hp, x0 = g.xp;
  KOS.sessions.log({ type: "media", subject: null, ref: null, dur: null,
    metrics: { module: "anime", action: "sync-reward", entries: 3, units: 20, advances: 2 } });
  if (g.hp !== hp0) throw new Error("HP moved on a media session");
  if (g.xp - x0 !== Math.min(4 + 20 + 6, 60)) throw new Error("proportional xp wrong: +" + (g.xp - x0));
  /* the cap holds for absurd catch-ups */
  const x1 = g.xp;
  KOS.sessions.log({ type: "media", subject: null, ref: null, dur: null,
    metrics: { module: "anime", action: "sync-reward", entries: 100, units: 900, advances: 40 } });
  if (g.xp - x1 !== 60) throw new Error("xp cap must hold: +" + (g.xp - x1));
});

/* ============ 3 · the autosync engine ============ */
console.log("== autosync ==");
step("runOnce pulls AniList (anime+manga) + VNDB, rewards discoveries, stamps the report", async () => {
  /* AniList: Frieren advanced to ep 6 externally (watermark sits at 3) */
  netScript = (url, rec) => {
    if (/anilist/.test(url) && rec.body && /MediaListCollection/.test(rec.body.query)) {
      const isAnime = rec.body.variables.type === "ANIME";
      return mockResponse(200, { data: { MediaListCollection: { lists: isAnime ? [{ name: "Watching", status: "CURRENT", entries: [{
        id: 77, status: "CURRENT", score: 8, progress: 6,
        startedAt: {}, completedAt: {},
        media: { id: 154587, idMal: 52991, title: { romaji: "Frieren" }, coverImage: {}, genres: [],
                 season: "FALL", seasonYear: 2023, format: "TV", episodes: 28, chapters: null, volumes: null,
                 studios: { nodes: [] } } }] }] : [] } } });
    }
    if (/api\.vndb\.org\/kana\/ulist$/.test(url)) {
      return mockResponse(200, { more: false, results: [] });
    }
    return null;
  };
  const s0 = sessionCount();
  const report = await new Promise(res => KOS.autosync.runOnce((e, r) => res(r)));
  netScript = null;
  if (!report) throw new Error("cycle did not run");
  if (!report.anilist.anime) throw new Error("anime pull missing from report: " + JSON.stringify(report.errors));
  if (report.anilist.anime.rewards.length !== 1) throw new Error("external ep 3→6 must reward once: " + JSON.stringify(report.anilist.anime.rewards));
  if (report.anilist.anime.rewards[0].units !== 3) throw new Error("units 3 expected");
  if (sessionCount() !== s0 + 1) throw new Error("one module with rewards = one session");
  const lastReport = await p(cb => KOS.mediadb.getKV("autosync.lastReport", cb));
  if (!lastReport || lastReport.ts !== report.ts) throw new Error("report not persisted");
  if (KOS.autosync.lastRun() === 0) throw new Error("lastRun not stamped");
});
step("the toggle kills the loop; the online event schedules a cycle", async () => {
  await p(cb => KOS.autosync.setEnabled(false, cb));
  const r = await new Promise(res => KOS.autosync.runOnce((e, rep) => res(rep)));
  if (r !== null) throw new Error("disabled autosync must refuse to run");
  await p(cb => KOS.autosync.setEnabled(true, cb));
  /* the online listener path: start() installs it; fire the event and
     watch a cycle hit the network */
  KOS.autosync._config({ bootDelay: 999999, interval: 999999 });
  KOS.autosync.start();
  netLog = [];
  netScript = (url, rec) => {
    if (/anilist/.test(url) && rec.body && /MediaListCollection/.test(rec.body.query)) {
      return mockResponse(200, { data: { MediaListCollection: { lists: [] } } });
    }
    if (/api\.vndb\.org\/kana\/ulist$/.test(url)) return mockResponse(200, { more: false, results: [] });
    return null;
  };
  window.dispatchEvent(new window.Event("online"));
  const hit = await waitFor(() => netLog.some(r2 => /MediaListCollection/.test((r2.body && r2.body.query) || "")), 6000);
  netScript = null;
  if (!hit) throw new Error("online event did not trigger a pull cycle");
});

/* ============ 4 · VN chapters ============ */
console.log("== VN chapters ==");
let idVn;
step("chapters ride the schema, survive a sync merge, count as local data", async () => {
  const rec = await p(cb => KOS.mediadb.add({ module: "vn", title: "Umineko", status: "inProgress",
    externalIds: { vndbId: "v24" }, syncSource: "vndb",
    chapters: [{ name: "Legend", status: "completed" }, { name: "Turn", status: "inProgress", notes: "ep2" }],
    routes: [{ name: "Main", cleared: false }] }, cb));
  idVn = rec.id;
  if (rec.chapters.length !== 2 || rec.chapters[0].status !== "completed") throw new Error("chapters not persisted");
  if (rec.progress.current !== 0 || rec.progress.total !== 1) throw new Error("chapters must NOT drive progress (routes do)");
  if (!KOS.mediadb.hasLocalData({ chapters: [{ name: "x" }] })) throw new Error("chapters must count as local data");
  /* a VNDB pull must not eat the chapters */
  const res = await p(cb => KOS.mediadb.bulkUpsert([{
    module: "vn", title: "Umineko", status: "completed",
    progress: { current: 0, total: null }, score: 9.5,
    externalIds: { vndbId: "v24" }, syncSource: "vndb", lastSyncedAt: Date.now(),
    genres: [], dates: { started: null, finished: null }, extra: {}
  }], {}, cb));
  if (res.updated !== 1) throw new Error("merge expected");
  const after = await p(cb => KOS.mediadb.get(idVn, cb));
  if (after.chapters.length !== 2 || after.chapters[1].notes !== "ep2") throw new Error("sync ate the chapters");
  if (after.status !== "completed") throw new Error("sync must still win list state");
  if (res.rewards.length !== 1 || !res.rewards[0].statusAdvanced) throw new Error("VN status advance via pull must reward");
});
step("editor CRUD: add a chapter in the modal, save → persisted + a 'chapter' session", async () => {
  const e = await p(cb => KOS.mediadb.get(idVn, cb));
  KOS.vnEditor(e, null);
  await tick(30);
  const modal = document.querySelector(".vn-modal");
  if (!modal) throw new Error("editor did not open");
  const chWrap = modal.querySelector(".vn-chapters");
  if (!chWrap) throw new Error("chapters section missing");
  /* chapter names live in input values, not text nodes */
  const rows = [...chWrap.querySelectorAll(".vn-ch-row")];
  if (!rows.some(r => r.querySelector(".vn-route-name").value === "Legend")) throw new Error("existing chapters not rendered");
  /* complete "Turn" via its status select */
  const turnRow = rows.find(r => r.querySelector(".vn-route-name").value === "Turn");
  const st = turnRow.querySelector(".vn-ch-status");
  st.value = "completed";
  st.dispatchEvent(new window.Event("change", { bubbles: true }));
  await tick(10);
  /* add a new chapter */
  const nameIn = [...modal.querySelectorAll(".vn-chapters .vn-route-add .vn-route-name")].pop();
  nameIn.value = "Banquet";
  [...modal.querySelectorAll(".vn-chapters button")].find(b => /Add chapter/.test(b.textContent)).click();
  await tick(10);
  const s0 = sessionCount();
  [...modal.querySelectorAll("button")].find(b => b.textContent === "Save").click();
  await waitFor(() => !document.querySelector(".vn-modal"), 3000);
  const after = await p(cb => KOS.mediadb.get(idVn, cb));
  if (after.chapters.length !== 3) throw new Error("added chapter not saved: " + after.chapters.length);
  if (!after.chapters.some(c => c.name === "Banquet" && c.status === "planned")) throw new Error("new chapter shape");
  if (!after.chapters.some(c => c.name === "Turn" && c.status === "completed")) throw new Error("status edit lost");
  if (sessionCount() !== s0 + 1) throw new Error("chapter completion must log one session");
  const s = KOS.store.state.sessions[KOS.store.state.sessions.length - 1];
  if (s.metrics.action !== "chapter") throw new Error("expected a 'chapter' action, got " + s.metrics.action);
  if (KOS.vn.chapterProgress(after).done !== 2) throw new Error("chapterProgress derivation");
});

/* ============ 5 · profiles ============ */
console.log("== profiles ==");
step("AniList profile: tabs render from ONE cached fetch — switching never refetches", async () => {
  netScript = (url, rec) => {
    if (/anilist/.test(url) && rec.body && /Viewer/.test(rec.body.query)) {
      return mockResponse(200, { data: {
        Viewer: { id: 1, name: "crimson", about: "hi", avatar: {}, bannerImage: null, siteUrl: "https://anilist.co/user/crimson",
          createdAt: 1600000000, unreadNotificationCount: 2,
          statistics: { anime: { count: 650, episodesWatched: 9000, minutesWatched: 200000, meanScore: 78,
              genres: [{ genre: "Drama", count: 200 }], statuses: [{ status: "COMPLETED", count: 500 }] },
            manga: { count: 80, chaptersRead: 4000, volumesRead: 300, meanScore: 80, genres: [] } },
          favourites: { anime: { nodes: [{ id: 1, title: { romaji: "Clannad" }, coverImage: {} }] },
            manga: { nodes: [] }, characters: { nodes: [] }, staff: { nodes: [] }, studios: { nodes: [] } } },
        followers: { pageInfo: { total: 3 }, followers: [{ id: 2, name: "friend", avatar: {} }] },
        following: { pageInfo: { total: 5 }, following: [] },
        activity: { activities: [{ __typename: "ListActivity", id: 9, status: "watched episode", progress: "5 - 8",
          createdAt: Math.floor(Date.now() / 1000) - 60, media: { title: { romaji: "Frieren" }, coverImage: {} } }] },
        notifications: { notifications: [{ __typename: "AiringNotification", id: 1, episode: 7,
          contexts: ["Episode ", " of ", " aired."], createdAt: Math.floor(Date.now() / 1000) - 120,
          media: { title: { romaji: "Frieren" } } }] }
      } });
    }
    return null;
  };
  netLog = [];
  KOS.show("aniprofile");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelector(".ap-tabs"), 4000);
  const fetches = () => netLog.filter(r => /Viewer/.test((r.body && r.body.query) || "")).length;
  if (fetches() !== 1) throw new Error("expected exactly 1 profile fetch, got " + fetches());
  if (!/Anime overview/.test(main.textContent)) throw new Error("Overview tab not default");
  if (/Followers & following/.test(main.querySelector(".ap-pane").textContent)) throw new Error("Social content leaked into Overview");
  function clickTab(name) {
    [...main.querySelectorAll(".ap-tabs .study-tab")].find(b => b.textContent === name).click();
  }
  clickTab("Favourites");
  if (!/Clannad/.test(main.querySelector(".ap-pane").textContent)) throw new Error("Favourites tab content");
  clickTab("Social");
  if (!/3 followers · 5 following/.test(main.querySelector(".ap-pane").textContent)) throw new Error("Social tab content");
  clickTab("Activity");
  if (!/watched episode 5 - 8 of Frieren/.test(main.querySelector(".ap-pane").textContent)) throw new Error("Activity tab content");
  clickTab("Notifications");
  if (!/Episode 7 of Frieren aired\./.test(main.querySelector(".ap-pane").textContent)) throw new Error("Notifications tab content");
  if (fetches() !== 1) throw new Error("tab switching refetched: " + fetches());
  netScript = null;
});
step("VNDB profile: labels/lengthvotes/site stats render; the API's gaps are stated", async () => {
  netScript = url => {
    if (/\/kana\/ulist_labels\?user=u9/.test(url)) {
      return mockResponse(200, { labels: [
        { id: 1, label: "Playing", private: false, count: 2 },
        { id: 2, label: "Finished", private: false, count: 40 },
        { id: 13, label: "Waiting", private: false, count: 7 }
      ] });
    }
    if (/\/kana\/user\?q=u9/.test(url)) {
      return mockResponse(200, { u9: { id: "u9", username: "crimson", lengthvotes: 4, lengthvotes_sum: 7200 } });
    }
    if (/\/kana\/stats/.test(url)) {
      return mockResponse(200, { chars: 166303, producers: 29123, releases: 151941, staff: 52691, tags: 3014, traits: 3327, vn: 64354 });
    }
    return null;
  };
  KOS.show("vndbprofile");
  const main = document.getElementById("main");
  await waitFor(() => /List labels/.test(main.textContent), 4000);
  if (!/crimson/.test(main.textContent)) throw new Error("identity missing");
  const labels = main.querySelectorAll(".vp-label");
  if (labels.length !== 3) throw new Error("expected 3 label chips, got " + labels.length);
  if (![...labels].some(l => /Waiting/.test(l.textContent) && /custom/.test(l.textContent))) throw new Error("custom label not marked");
  if (!/Length votes/.test(main.textContent)) throw new Error("length-vote stats missing");
  if (!/64354/.test(main.textContent)) throw new Error("site stats missing");
  if (!/no favourites, no followers\/following, no activity feed, no notifications/i.test(main.textContent)) throw new Error("the honest API-gap statement is missing");
  if (!/Routes cleared/.test(main.textContent)) throw new Error("vault-derived stats missing");
  netScript = null;
});

/* ============ 6 · gold shop ============ */
console.log("== gold shop ==");
step("catalog: rebalanced prices + the new kinds exist; cosmetics apply their classes", async () => {
  const cat = KOS.governor.catalog();
  if (KOS.governor.item("trace").price !== 180) throw new Error("big-lab price");
  if (KOS.governor.item("logic-lab").price !== 100) throw new Error("sim price");
  /* Build 4.0: the four crimson-era themes are retired; the 23 theme-lab
     palettes replaced them (each carries a body[data-theme] block + swatches) */
  ["theme-ember-wraith", "theme-sakura-skyline", "theme-lycoris-radiata",
   "seal-sakura", "seal-rai", "seal-hoshi", "frame-amethyst"].forEach(id => {
    if (!KOS.governor.item(id)) throw new Error("missing item " + id);
  });
  if (cat.filter(c => c.kind === "theme").length !== 23) throw new Error("23 lab themes expected");
  if (!cat.filter(c => c.kind === "theme").every(c => Array.isArray(c.sw) && c.sw.length === 3)) throw new Error("theme swatches missing");
  if (cat.filter(c => c.kind === "shelfskin").length !== 3) throw new Error("3 shelf skins expected");
  if (cat.filter(c => c.kind === "shrinestyle").length !== 3) throw new Error("3 shrine styles expected");
  const g = KOS.store.state.governor;
  g.gold = 500;
  let r = KOS.governor.buy("shelf-walnut");
  if (!r.ok) throw new Error("buy shelfskin: " + r.msg);
  r = KOS.governor.buy("shrine-neon");
  if (!r.ok) throw new Error("buy shrinestyle: " + r.msg);
  KOS.governor.setShelfSkin("shelf-walnut");
  KOS.governor.setShrineStyle("shrine-neon");
  if (g.shelfSkin !== "shelf-walnut" || g.shrineStyle !== "shrine-neon") throw new Error("apply state");
  /* the Shrine hall carries the purchased class */
  const fav = await p(cb => KOS.mediadb.get(idA, cb));
  fav.favourite = true;
  await p(cb => KOS.mediadb.put(fav, cb));
  KOS.show("shrine");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelector(".shrine-hall"), 4000);
  if (!main.querySelector(".shrine-hall").classList.contains("shrine-neon")) throw new Error("shrine style class not applied");
});
step("boundaries hold: cosmetics buyable while strained, labs suspended, HP untouched", async () => {
  const g = KOS.store.state.governor;
  const hp0 = g.hp;
  g.hp = 45;   // strained
  let r = KOS.governor.buy("seal-sakura");
  if (!r.ok) throw new Error("cosmetics must stay buyable while strained: " + r.msg);
  r = KOS.governor.buy("logic-lab");
  if (r.ok) throw new Error("labs must be suspended while strained");
  g.hp = hp0;
  KOS.store.save();
  /* shop UI shows the new groups */
  KOS.show("governor", "shop");
  const main = document.getElementById("main");
  await waitFor(() => /Bookshelf skins/.test(main.textContent), 4000);
  if (!/Shrine card styles/.test(main.textContent)) throw new Error("shop group missing");
});

/* ============ 7 · season picker ============ */
console.log("== season picker ==");
step("seasonal view defaults to today and re-filters on picker changes", async () => {
  await p(cb => KOS.mediadb.add({ module: "anime", title: "Spring 2026 Show", status: "inProgress",
    progress: { current: 1, total: 12 }, externalIds: { anilistId: 9101 }, syncSource: "anilist",
    extra: { season: "SPRING", seasonYear: 2026 } }, cb));
  await p(cb => KOS.mediadb.add({ module: "anime", title: "Fall 2023 Show", status: "completed",
    progress: { current: 12, total: 12 }, externalIds: { anilistId: 9102 }, syncSource: "anilist",
    extra: { season: "FALL", seasonYear: 2023 } }, cb));
  /* the season the view derives from the device date, so the test derives it the same way */
  const cur = KOS.anime.currentSeason();
  await p(cb => KOS.mediadb.add({ module: "anime", title: "Current Season Show", status: "inProgress",
    progress: { current: 2, total: 12 }, externalIds: { anilistId: 9103 }, syncSource: "anilist",
    extra: { season: cur.season, seasonYear: cur.year } }, cb));
  KOS.show("seasonal");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelector(".season-picker"), 4000);
  await waitFor(() => /Current Season Show/.test(main.textContent), 4000);
  if (!/Current Season Show/.test(main.textContent)) throw new Error("current season not the default");
  if (/Fall 2023 Show/.test(main.textContent)) throw new Error("other seasons leaked into the default view");
  /* jump to Fall 2023 via the selects */
  const seasonSel = main.querySelector(".season-picker .status-sel");
  const yearIn = main.querySelector(".season-yr");
  seasonSel.value = "FALL";
  seasonSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  yearIn.value = "2023";
  yearIn.dispatchEvent(new window.Event("change", { bubbles: true }));
  await waitFor(() => /Fall 2023 Show/.test(main.textContent), 4000);
  if (!/Fall 2023 Show/.test(main.textContent)) throw new Error("picker did not re-filter");
  if (/Current Season Show/.test(main.textContent)) throw new Error("old season still shown");
  if (!main.querySelector(".season-view").classList.contains("s-fall")) throw new Error("palette class must follow the selection");
  /* Today resets */
  [...main.querySelectorAll("button")].find(b => /Today/.test(b.textContent)).click();
  await waitFor(() => /Current Season Show/.test(main.textContent), 4000);
  if (!/Current Season Show/.test(main.textContent)) throw new Error("Today button did not reset");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE12 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE12 PASS — Build 3j verified (" + steps.length + " steps).");
  process.exit(0);
})();
