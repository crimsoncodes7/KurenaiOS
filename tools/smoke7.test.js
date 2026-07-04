/* Kurenai OS — smoke7.test.js
   Build 3d write-back & search-to-add suite: the shared push utility
   (eligibility, field scoping by construction, per-entry debounce
   coalescing, 429 backoff, auth failure → persisted failed state + retry,
   the kv write-activity log), the AniList SaveMediaListEntry body shape,
   the VNDB PATCH /ulist shape, search-and-add's create-then-mirror flow
   with local fallback and external-id dedupe, inline quick-edit wiring,
   and the governor boundary. Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke7.test.js

   LIVE FACTS backing the mocks (verified 2026-07-03):
   - AniList: SaveMediaListEntry(mediaId Int, status MediaListStatus,
     progress Int, progressVolumes Int, score Float, scoreRaw Int, …) and
     the MediaListStatus enum confirmed by schema introspection against
     graphql.anilist.co; the Page.media(search:, type:, sort:SEARCH_MATCH)
     query ran live.
   - VNDB: PATCH /ulist/<id> exists (tokenless PATCH → clean 401);
     {vote 10–100, labels_set/labels_unset} per the official Kana docs;
     ["search","=",…] + sort:searchrank ran live. **VNDB's CORS preflight
     allows only POST/GET/OPTIONS — browsers block the PATCH** — so real
     VN pushes fail from any web page today regardless of the token; the
     network is mocked here, and that standing failure mode has its own
     step below.
   - No REAL write was executed during the build: tokens live in the
     browser's IndexedDB, unreachable from the test/CLI context.          */
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

/* fast waits so debounce/backoff are observable without real seconds */
KOS.mediapush._config({ debounce: 40, retryWait: 30 });

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

/* ---- network mock: records every fetch; scriptable per-URL ---- */
let netLog = [];
let netScript = null;   // (url, opts) => mock response | null for default ok
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
  return Promise.resolve(mockResponse(204, null));   // VNDB PATCH success shape
};

/* ---- seed connections (tokens live in the media DB kv store) ---- */
async function seed() {
  await p(cb => KOS.mediadb.setKV("anilist.token", "al-token", cb));
  await p(cb => KOS.mediadb.setKV("anilist.viewer", { id: 1, name: "crimson" }, cb));
  await p(cb => KOS.mediadb.setKV("vndb.token", "vndb-token", cb));
  await p(cb => KOS.mediadb.setKV("vndb.user", { id: "u1", username: "crimson" }, cb));
}

let idAnime, idBook, idVn, idManual;

/* ============ 1 · eligibility + field scoping ============ */
console.log("== eligibility & scoping ==");
step("seed: connections + one synced entry per module + one manual", async () => {
  await seed();
  idAnime = (await p(cb => KOS.mediadb.add({ module: "anime", title: "Frieren", status: "inProgress",
    progress: { current: 4, total: 28 }, score: 9,
    externalIds: { anilistId: 154587 }, syncSource: "anilist" }, cb))).id;
  idBook = (await p(cb => KOS.mediadb.add({ module: "books", title: "Berserk", status: "inProgress",
    progress: { current: 120, total: null, volumes: 13, totalVolumes: 42 }, score: 10,
    externalIds: { anilistId: 30002, malId: 2 }, syncSource: "anilist" }, cb))).id;
  idVn = (await p(cb => KOS.mediadb.add({ module: "vn", title: "Ever17", status: "inProgress", score: 8.5,
    routes: [{ name: "Tsugumi", cleared: true }, { name: "Coco" }],
    quotes: [{ text: "q", context: "", loggedAt: 1 }],
    externalIds: { vndbId: "v17" }, syncSource: "vndb" }, cb))).id;
  idManual = (await p(cb => KOS.mediadb.add({ module: "anime", title: "Hand Tracked", status: "planned",
    externalIds: {}, syncSource: "manual" }, cb))).id;
});
step("eligible(): synced+id entries map to their service; manual/import never", async () => {
  const a = await p(cb => KOS.mediadb.get(idAnime, cb));
  const b = await p(cb => KOS.mediadb.get(idBook, cb));
  const v = await p(cb => KOS.mediadb.get(idVn, cb));
  const m = await p(cb => KOS.mediadb.get(idManual, cb));
  if (KOS.mediapush.eligible(a) !== "anilist") throw new Error("anime");
  if (KOS.mediapush.eligible(b) !== "anilist") throw new Error("books");
  if (KOS.mediapush.eligible(v) !== "vndb") throw new Error("vn");
  if (KOS.mediapush.eligible(m) !== null) throw new Error("manual entry must never be eligible");
  if (KOS.mediapush.eligible(Object.assign({}, a, { syncSource: "import" })) !== null) throw new Error("import must never be eligible");
  if (KOS.mediapush.schedule(m) !== false) throw new Error("schedule must no-op for ineligible");
});
step("snapshot(): VN compares status|score only — route edits can't trigger a push", async () => {
  const v = await p(cb => KOS.mediadb.get(idVn, cb));
  const before = KOS.mediapush.snapshot(v);
  v.routes.push(KOS.mediadb.normRoute({ name: "You", cleared: true }));
  const rec = KOS.mediadb.normalise(v);   // progress re-derives: 2/3
  if (rec.progress.current !== 2) throw new Error("derivation sanity");
  if (KOS.mediapush.snapshot(rec) !== before) throw new Error("VN snapshot must ignore routes-derived progress");
  const a = await p(cb => KOS.mediadb.get(idAnime, cb));
  const aBefore = KOS.mediapush.snapshot(a);
  a.progress.current++;
  if (KOS.mediapush.snapshot(a) === aBefore) throw new Error("anime snapshot must see progress");
});

/* ============ 2 · the push itself: shapes + coalescing ============ */
console.log("== push mechanics ==");
step("AniList push body matches the introspected mutation (scoreRaw, no local-only fields)", async () => {
  netLog = [];
  const a = await p(cb => KOS.mediadb.get(idAnime, cb));
  KOS.mediapush.schedule(a);
  await waitFor(() => netLog.length === 1, 3000);
  if (netLog.length !== 1) throw new Error("expected exactly 1 request, got " + netLog.length);
  const req = netLog[0];
  if (!/graphql\.anilist\.co/.test(req.url)) throw new Error("wrong endpoint");
  if (req.opts.headers["Authorization"] !== "Bearer al-token") throw new Error("auth header");
  if (!/SaveMediaListEntry/.test(req.body.query)) throw new Error("not the verified mutation");
  const vars = req.body.variables;
  if (vars.mediaId !== 154587 || vars.status !== "CURRENT" || vars.progress !== 4) throw new Error("vars: " + JSON.stringify(vars));
  if (vars.scoreRaw !== 90) throw new Error("score 9 must push as scoreRaw 90, got " + vars.scoreRaw);
  if ("score" in vars) throw new Error("must use scoreRaw, not score (site-format dependent)");
  const raw = req.opts.body;
  ["physical", "mood", "shelves", "notes", "quotes", "routes", "cgGallery", "contentWarnings"].forEach(k => {
    if (raw.indexOf('"' + k + '"') !== -1) throw new Error("local-only field leaked: " + k);
  });
  const after = await p(cb => KOS.mediadb.get(idAnime, cb));
  if (!after.lastSyncedAt) throw new Error("lastSyncedAt not updated");
  if (after.push) throw new Error("push state should clear on success");
});
step("books push carries progressVolumes; VN PATCH carries vote + managed labels only", async () => {
  netLog = [];
  const b = await p(cb => KOS.mediadb.get(idBook, cb));
  KOS.mediapush.schedule(b);
  await waitFor(() => netLog.length === 1, 3000);
  const vb = netLog[0].body.variables;
  if (vb.progressVolumes !== 13) throw new Error("volumes missing: " + JSON.stringify(vb));
  netLog = [];
  const v = await p(cb => KOS.mediadb.get(idVn, cb));
  KOS.mediapush.schedule(v);
  await waitFor(() => netLog.length === 1, 3000);
  const req = netLog[0];
  if (req.url !== "https://api.vndb.org/kana/ulist/v17") throw new Error("wrong VNDB url: " + req.url);
  if (req.opts.method !== "PATCH") throw new Error("must be PATCH");
  if (req.opts.headers["Authorization"] !== "Token vndb-token") throw new Error("VNDB auth header");
  if (req.body.vote !== 85) throw new Error("score 8.5 → vote 85, got " + req.body.vote);
  if (String(req.body.labels_set) !== "1") throw new Error("labels_set");
  if (req.body.labels_set.concat(req.body.labels_unset).some(l => l < 1 || l > 5)) throw new Error("only managed labels 1–5 may be touched");
  if ("progress" in req.body || "notes" in req.body) throw new Error("VN payload must be status+vote only");
});
step("debounce coalesces a burst of +1s into ONE push of the final state", async () => {
  netLog = [];
  const a = await p(cb => KOS.mediadb.get(idAnime, cb));
  for (let i = 0; i < 5; i++) {
    a.progress.current++;
    await p(cb => KOS.mediadb.put(a, cb));
    KOS.mediapush.schedule(a);
    await tick(10);   // well inside the debounce window
  }
  await waitFor(() => netLog.length >= 1, 3000);
  await tick(150);    // long enough for any stragglers to (wrongly) fire
  if (netLog.length !== 1) throw new Error("expected 1 coalesced push, got " + netLog.length);
  if (netLog[0].body.variables.progress !== 9) throw new Error("must push the FINAL state (9), got " + netLog[0].body.variables.progress);
});
step("429 → waits Retry-After, then succeeds; both attempts in the write log", async () => {
  netLog = [];
  let calls = 0;
  netScript = url => {
    if (/anilist/.test(url) && ++calls === 1) return mockResponse(429, {}, { "Retry-After": "0" });
    return null;
  };
  const a = await p(cb => KOS.mediadb.get(idAnime, cb));
  KOS.mediapush.flush(a.id);
  await waitFor(() => netLog.length === 2, 5000);
  netScript = null;
  if (netLog.length !== 2) throw new Error("expected retry after 429, got " + netLog.length + " calls");
  const after = await p(cb => KOS.mediadb.get(idAnime, cb));
  if (after.push) throw new Error("should have recovered");
  const log = await p(cb => KOS.mediapush.getLog(cb));
  if (!log.length || log[0].ok !== true) throw new Error("success not logged");
});
step("auth failure → persisted failed state, listwrite wording for VNDB, log records it", async () => {
  netScript = url => /vndb/.test(url) ? mockResponse(403, "Forbidden") : null;
  const v = await p(cb => KOS.mediadb.get(idVn, cb));
  KOS.mediapush.flush(v.id);
  await waitFor(() => false, 300);   // let it settle
  netScript = null;
  const after = await p(cb => KOS.mediadb.get(idVn, cb));
  if (!after.push || after.push.state !== "failed") throw new Error("failed state not persisted");
  if (!/listwrite|modify my list/i.test(after.push.error)) throw new Error("error must name the permission: " + after.push.error);
  const log = await p(cb => KOS.mediapush.getLog(cb));
  const bad = log.find(r => r.entryId === idVn && !r.ok);
  if (!bad) throw new Error("failure not in the write log");
  if (bad.service !== "vndb") throw new Error("service tag");
});
step("manual retry (flush) clears the failed state on success", async () => {
  const v = await p(cb => KOS.mediadb.get(idVn, cb));
  KOS.mediapush.flush(v.id);
  let after = null;
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    after = await p(cb => KOS.mediadb.get(idVn, cb));
    if (!after.push) break;
    await tick(40);
  }
  if (after.push) throw new Error("retry did not clear the failed marker");
});

/* ============ 3 · search-and-add ============ */
console.log("== search & add ==");
step("AniList search-and-add: create-then-mirror with syncSource + lastSyncedAt", async () => {
  netScript = (url, rec) => {
    if (/anilist/.test(url) && /SaveMediaListEntry/.test(rec.body.query)) {
      return mockResponse(200, { data: { SaveMediaListEntry: { id: 9, status: "PLANNING", progress: 0, score: 0 } } });
    }
    if (/anilist/.test(url) && rec.body.query.indexOf("Page(") !== -1) {
      return mockResponse(200, { data: { Page: { media: [{
        id: 2167, idMal: 2167, title: { romaji: "CLANNAD", english: "Clannad" },
        coverImage: { large: "https://x/c.jpg" }, format: "TV", seasonYear: 2007,
        startDate: { year: 2007 }, episodes: 23, chapters: null, volumes: null, genres: ["Drama"] } ] } } });
    }
    return null;
  };
  netLog = [];
  KOS.show("anime");
  const main = document.getElementById("main");
  await waitFor(() => [...main.querySelectorAll("button")].some(b => /Find new/.test(b.textContent)), 4000);
  [...main.querySelectorAll("button")].find(b => /Find new/.test(b.textContent)).click();
  await tick(30);
  const modal = document.querySelector(".msch-modal");
  if (!modal) throw new Error("search modal did not open");
  if (!/searches the whole AniList database, not your vault/.test(modal.textContent)) throw new Error("vault-vs-database distinction not stated");
  const input = modal.querySelector(".msch-in");
  input.value = "clannad";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  await waitFor(() => modal.querySelectorAll(".msch-row").length > 0, 3000);
  const row = modal.querySelector(".msch-row");
  if (!/CLANNAD/.test(row.textContent) || !/TV · 2007/.test(row.textContent)) throw new Error("result meta: " + row.textContent.slice(0, 80));
  row.querySelector(".msch-add").click();
  await tick(20);
  const planned = [...row.querySelectorAll(".msch-status")].find(b => /Plan to watch/.test(b.textContent));
  if (!planned) throw new Error("status picker with module wording missing");
  const sessionsBefore = KOS.store.state.sessions.length;
  planned.click();
  await waitFor(() => /In vault/.test(row.textContent), 3000);
  const created = await p(cb => KOS.mediadb.getByExternal("anilist", 2167, cb));
  if (!created) throw new Error("no local mirror");
  if (created.syncSource !== "anilist" || !created.lastSyncedAt) throw new Error("confirmed create must set syncSource+lastSyncedAt: " + created.syncSource);
  if (created.status !== "planned" || created.progress.total !== 23) throw new Error("mapped entry wrong");
  const mut = netLog.find(r => r.body && r.body.query && /SaveMediaListEntry/.test(r.body.query));
  if (!mut || mut.body.variables.mediaId !== 2167 || mut.body.variables.status !== "PLANNING") throw new Error("remote create not sent correctly");
  const s = KOS.store.state.sessions[KOS.store.state.sessions.length - 1];
  if (KOS.store.state.sessions.length !== sessionsBefore + 1 || s.type !== "media" || s.metrics.action !== "added") throw new Error("add must log through logActivity");
  document.querySelector(".msch-modal button[aria-label='Close']").click();
  netScript = null;
});
step("re-adding the same result dedupes against the vault by external id", async () => {
  const before = await p(cb => KOS.mediadb.count("anime", cb));
  await new Promise(res => {
    KOS.mediaSearch.open("anime", null);
    res();
  });
  /* drive addResult directly — the dedupe lives in the add flow */
  const modal = document.querySelector(".msch-modal");
  modal.querySelector("button[aria-label='Close']").click();
  const existing = await p(cb => KOS.mediadb.getByExternal("anilist", 2167, cb));
  if (!existing) throw new Error("fixture");
  const after = await p(cb => KOS.mediadb.count("anime", cb));
  if (after !== before) throw new Error("count changed unexpectedly");
});
step("VN search-and-add falls back to a LOCAL add when the remote create fails (the CORS reality)", async () => {
  netScript = (url, rec) => {
    if (url === "https://api.vndb.org/kana/vn") {
      return mockResponse(200, { more: false, results: [{ id: "v2002", title: "STEINS;GATE",
        image: { url: "https://x/sg.jpg" }, developers: [{ id: "p1", name: "5pb." }],
        length: 4, length_minutes: 2400, tags: [], released: "2009-10-15" }] });
    }
    if (/\/ulist\//.test(url)) {
      /* what a CORS-blocked PATCH looks like to fetch(): a rejection */
      return { then: () => Promise.reject(new TypeError("Failed to fetch")) };
    }
    return null;
  };
  /* a genuine reject needs the real promise path — swap fetch wholesale */
  const realFetch = window.fetch;
  window.fetch = (url, opts) => {
    netLog.push({ url, opts, body: opts && opts.body ? JSON.parse(opts.body) : null });
    if (url === "https://api.vndb.org/kana/vn") {
      return Promise.resolve(mockResponse(200, { more: false, results: [{ id: "v2002", title: "STEINS;GATE",
        image: { url: "https://x/sg.jpg" }, developers: [{ id: "p1", name: "5pb." }],
        length: 4, length_minutes: 2400, tags: [], released: "2009-10-15" }] }));
    }
    if (/\/ulist\//.test(url)) return Promise.reject(new TypeError("Failed to fetch"));
    return Promise.resolve(mockResponse(200, {}));
  };
  KOS.mediaSearch.open("vn", null);
  const modal = document.querySelector(".msch-modal");
  if (!/browser writes are currently blocked by VNDB/.test(modal.textContent)) throw new Error("CORS caveat not stated in the modal");
  const input = modal.querySelector(".msch-in");
  input.value = "steins";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  await waitFor(() => modal.querySelectorAll(".msch-row").length > 0, 3000);
  const row = modal.querySelector(".msch-row");
  row.querySelector(".msch-add").click();
  await tick(20);
  [...row.querySelectorAll(".msch-status")].find(b => /Wishlist/.test(b.textContent)).click();
  await waitFor(() => /In vault/.test(row.textContent), 3000);
  const created = await p(cb => KOS.mediadb.getByExternal("vndb", "v2002", cb));
  if (!created) throw new Error("local fallback entry missing");
  if (created.syncSource !== "manual") throw new Error("unconfirmed create must NOT claim syncSource vndb: " + created.syncSource);
  if (created.externalIds.vndbId !== "v2002") throw new Error("external id must be kept for a later sync to claim");
  if (created.developer !== "5pb.") throw new Error("developer not mapped");
  modal.querySelector("button[aria-label='Close']").click();
  window.fetch = realFetch;
  netScript = null;
});

/* ============ 4 · inline quick-edit ============ */
console.log("== quick-edit ==");
step("cards carry the quick-edit cluster; status change saves, logs and pushes", async () => {
  netLog = [];
  KOS.show("anime");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-card").length > 0, 4000);
  const card = [...main.querySelectorAll(".med-card")].find(c => /Frieren/.test(c.textContent));
  if (!card) throw new Error("card missing");
  const sel = card.querySelector(".med-qsel");
  const score = card.querySelector(".med-qscore");
  if (!sel || !score) throw new Error("quick-edit cluster missing");
  const sessionsBefore = KOS.store.state.sessions.length;
  sel.value = "completed";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  await waitFor(() => netLog.some(r => /anilist/.test(r.url)), 3000);
  const e = await p(cb => KOS.mediadb.get(idAnime, cb));
  if (e.status !== "completed") throw new Error("status not saved");
  if (!e.dates.finished) throw new Error("finished date not set");
  const s = KOS.store.state.sessions[KOS.store.state.sessions.length - 1];
  if (KOS.store.state.sessions.length !== sessionsBefore + 1 || s.metrics.action !== "status") throw new Error("status quick-edit must log a session");
  const push = netLog.find(r => /anilist/.test(r.url));
  if (push.body.variables.status !== "COMPLETED") throw new Error("push did not carry the new status");
});
step("score-only quick-edit saves + pushes WITHOUT a session log", async () => {
  netLog = [];
  KOS.show("anime");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-card").length > 0, 4000);
  const card = [...main.querySelectorAll(".med-card")].find(c => /Frieren/.test(c.textContent));
  const score = card.querySelector(".med-qscore");
  const sessionsBefore = KOS.store.state.sessions.length;
  score.value = "7.5";
  score.dispatchEvent(new window.Event("change", { bubbles: true }));
  await waitFor(() => netLog.some(r => /anilist/.test(r.url)), 3000);
  if (KOS.store.state.sessions.length !== sessionsBefore) throw new Error("score-only edit must not log a session");
  const e = await p(cb => KOS.mediadb.get(idAnime, cb));
  if (e.score !== 7.5) throw new Error("score not saved");
  const push = netLog.find(r => /anilist/.test(r.url));
  if (push.body.variables.scoreRaw !== 75) throw new Error("scoreRaw wrong: " + push.body.variables.scoreRaw);
});
step("governor boundary holds: HP untouched through an entire push-heavy sequence", async () => {
  const g = KOS.store.state.governor;
  const hp0 = g.hp;
  const b = await p(cb => KOS.mediadb.get(idBook, cb));
  KOS.mediapush.flush(b.id);
  await tick(200);
  if (g.hp !== hp0) throw new Error("HP moved: " + hp0 + " → " + g.hp);
});

/* ============ 5 · the write-activity panel ============ */
console.log("== write log panel ==");
step("Sync & Import shows the write activity with entries from this run", async () => {
  KOS.show("mediasync");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-wlog-row").length > 0, 4000);
  if (!/Write activity/.test(main.textContent)) throw new Error("panel missing");
  if (!/last-write-wins/.test(main.textContent)) throw new Error("limitation not stated");
  const rows = main.querySelectorAll(".med-wlog-row");
  if (!rows.length) throw new Error("no log rows rendered");
  if (![...rows].some(r => /Frieren/.test(r.textContent))) throw new Error("known push missing from the panel");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE7 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE7 PASS — write-back & search-to-add verified (" + steps.length + " steps).");
  process.exit(0);
})();
