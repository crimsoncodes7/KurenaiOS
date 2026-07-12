/* Kurenai OS — smoke6.test.js
   Build 3c Visual Novels suite: the VN schema (routes → derived progress,
   CG counter, quote log, content warnings, vndbId), the v3→v4 IndexedDB
   migration, the VNDB Kana client (label→status mapping, vote 10–100 →
   score /10, tags→genres, blacklist skip, paged ulist sync — network
   mocked for repeatability), merge preservation of the manual layer
   through bulkUpsert, the flashcard PERSONAL bucket + quote→card routing,
   the governor boundary (0 HP), and the VN / Personal Deck / Matrix views.
   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke6.test.js

   LIVE FACTS backing the mocks (verified 2026-07-03 against the OFFICIAL
   endpoint https://api.vndb.org/kana — NOT the community proxy):
   - CORS: OPTIONS preflight with Origin:null → 204, access-control-allow-
     origin: null, allow-headers Content-Type+Authorization; POST /vn →
     200 with access-control-allow-origin: * → works from file:// pages.
   - POST /ulist (public list, no token) returned rows shaped exactly as
     mocked below: vote 10–100, labels [{id,label}], nested vn record.
   - GET /authinfo without a token → clean 401 with CORS headers intact. */
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

/* ============ 1 · v3 → v4 migration ============ */
/* Seed a REAL v3 database (the 3b shape, no vndb/developer indexes), so
   KOS.mediadb's first open runs the upgrade path a live browser will hit. */
console.log("== migration ==");
step("a v3 DB upgrades to v4 with vndb + developer indexes, rows intact", async () => {
  await new Promise((res, rej) => {
    const rq = window.indexedDB.open("kurenai-os-media", 3);
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
      os.createIndex("mood", "mood", { multiEntry: true });
      os.createIndex("shelves", "shelves", { multiEntry: true });
      os.createIndex("author", "author");
      d.createObjectStore("kv", { keyPath: "key" });
    };
    rq.onsuccess = () => {
      const d = rq.result;
      const tx = d.transaction("entries", "readwrite");
      tx.objectStore("entries").add({
        module: "anime", title: "Clannad", titleLower: "clannad",
        status: "completed", progress: { current: 23, total: 23 },
        ownership: "digital", score: 10, tags: [], genres: ["Drama"],
        dates: { started: null, finished: null },
        externalIds: { anilistId: 2167, malId: 2167, steamAppId: null },
        coverUrl: null, notes: "", favourite: true,
        syncSource: "anilist", lastSyncedAt: 1, createdAt: 1, updatedAt: 1, extra: {},
        author: "", format: null, mood: [], shelves: [], dnf: { isDnf: false, reason: "" }, physical: null
      });
      tx.oncomplete = () => { d.close(); res(); };
      tx.onerror = () => rej(tx.error);
    };
    rq.onerror = () => rej(rq.error);
  });
  /* first KOS.mediadb call → opens at v4 → upgrade runs */
  const rows = await p(cb => KOS.mediadb.query({ module: "anime" }, cb));
  if (rows.length !== 1 || rows[0].title !== "Clannad") throw new Error("pre-v4 row lost: " + rows.length);
  const db = await p(cb => KOS.mediadb.open(cb));
  const names = db.transaction("entries").objectStore("entries").indexNames;
  if (!names.contains("vndb") || !names.contains("developer")) throw new Error("v4 indexes missing");
});

/* ============ 2 · schema: VN axes ============ */
console.log("== schema ==");
step("normalise: VN axes default benignly on every module", async () => {
  const a = KOS.mediadb.normalise({ title: "X", module: "anime" });
  if (a.developer !== "" || a.contentWarnings.length || a.routes.length ||
      a.quotes.length || a.cgGallery.totalKnown !== null || a.cgGallery.unlockedCount !== 0 ||
      a.externalIds.vndbId !== null) throw new Error(JSON.stringify(a));
});
step("normalise: routes normalise and DERIVE a VN's progress", async () => {
  const v = KOS.mediadb.normalise({ title: "Ever17", module: "vn",
    routes: [{ name: "Tsugumi", cleared: true, completedAt: "2026-06-01" },
             { name: "You" }, { name: "Coco (True)", cleared: false, completedAt: "2026-01-01" }],
    progress: { current: 99, total: 99 } });   // bogus incoming progress must lose
  if (v.progress.current !== 1 || v.progress.total !== 3) throw new Error("derived progress: " + JSON.stringify(v.progress));
  if (v.routes[1].cleared !== false || v.routes[1].completedAt !== null) throw new Error("route defaults");
  if (v.routes[2].completedAt !== null) throw new Error("uncleared route kept a completedAt");
  /* routeless VN keeps whatever progress it was given (nothing to derive) */
  const bare = KOS.mediadb.normalise({ title: "Y", module: "vn" });
  if (bare.progress.current !== 0 || bare.progress.total !== null) throw new Error("bare progress");
});
step("normalise: quotes + cgGallery + warnings survive a round trip", async () => {
  const v = KOS.mediadb.normalise({ title: "Q", module: "vn",
    quotes: [{ text: "The universe has a beginning, but no end.", context: "prologue", loggedAt: 1234 }],
    cgGallery: { totalKnown: 40, unlockedCount: 12 },
    contentWarnings: ["existential dread"] });
  if (v.quotes[0].text.indexOf("universe") === -1 || v.quotes[0].loggedAt !== 1234) throw new Error("quote lost");
  if (v.cgGallery.totalKnown !== 40 || v.cgGallery.unlockedCount !== 12) throw new Error("cg lost");
  if (v.contentWarnings[0] !== "existential dread") throw new Error("warnings lost");
});

/* ============ 3 · VNDB client (network mocked to the live-verified shape) ============ */
console.log("== vndb client ==");
step("label → status: precedence, replay, blacklist skip", async () => {
  const s = KOS.vndb.statusFromLabels;
  if (s([{ id: 2, label: "Finished" }, { id: 7, label: "Voted" }]) !== "completed") throw new Error("finished");
  if (s([{ id: 1, label: "Playing" }, { id: 2, label: "Finished" }]) !== "inProgress") throw new Error("replay should read as playing");
  if (s([{ id: 3 }]) !== "onHold" || s([{ id: 4 }]) !== "dropped" || s([{ id: 5 }]) !== "planned") throw new Error("basic labels");
  if (s([{ id: 6, label: "Blacklist" }, { id: 2 }]) !== null) throw new Error("blacklist must skip");
  if (s([{ id: 42, label: "custom" }]) !== "planned") throw new Error("custom-only labels default to planned");
});
step("tags → genres: cont only, no spoilers, rating ≥ 2, top 6", async () => {
  const g = KOS.vndb.genresFromTags([
    { name: "Mystery", category: "cont", rating: 2.75, spoiler: 0 },
    { name: "ADV", category: "tech", rating: 2.84, spoiler: 0 },          // tech → out
    { name: "Identity Crisis", category: "cont", rating: 2.73, spoiler: 1 }, // spoiler → out
    { name: "Comedy", category: "cont", rating: 1.27, spoiler: 0 },       // weak → out
    { name: "Off Screen Sex Only", category: "ero", rating: 2.1, spoiler: 2 }, // ero → out
    { name: "Drama", category: "cont", rating: 2.36, spoiler: 0 }
  ]);
  if (g.join(",") !== "Mystery,Drama") throw new Error("got: " + g.join(","));
});
step("mapListEntry: vote/10, dates, developer, vndbId — the live ulist shape", async () => {
  /* this row is byte-for-byte the shape POST /ulist returned live —
     note the nested vn record has NO id field even when requested (the
     Build 3h fact): the row-level id IS the VN id */
  const m = KOS.vndb.mapListEntry({
    id: "v3", vote: 90, notes: null, started: "2026-01-05", finished: null,
    labels: [{ id: 2, label: "Finished" }, { id: 7, label: "Voted" }],
    vn: { title: "Utawarerumono", alttitle: "うたわれるもの",
      image: { url: "https://t.vndb.org/cv/27/89127.jpg" }, length: 3, length_minutes: 2205,
      developers: [{ id: "p21", name: "Leaf" }, { id: "p87", name: "AQUAPLUS" }], tags: [] }
  });
  if (m.module !== "vn" || m.status !== "completed") throw new Error("status");
  if (m.score !== 9) throw new Error("vote 90 should be score 9, got " + m.score);
  if (m.externalIds.vndbId !== "v3" || m.developer !== "Leaf") throw new Error("identity");
  if (m.dates.started !== "2026-01-05" || m.extra.lengthMinutes !== 2205) throw new Error("dates/length");
  if (KOS.vndb.mapListEntry({ id: "v9", labels: [{ id: 6 }], vn: { title: "Z" } }) !== null) throw new Error("blacklist row must map to null");
});
step("syncList: pages until more:false, auth header, results land mapped", async () => {
  const calls = [];
  window.fetch = (url, opts) => {
    calls.push({ url, opts });
    const body = JSON.parse(opts.body);
    const page = body.page;
    const mk = n => ({ id: "v" + n, vote: 80, started: null, finished: null, notes: "",
      labels: [{ id: 1, label: "Playing" }],
      vn: { title: "VN " + n, image: null, length: null, length_minutes: null, developers: [], tags: [] } });
    return Promise.resolve({
      ok: true, status: 200, headers: { get: () => null },
      json: () => Promise.resolve(page === 1 ? { more: true, results: [mk(1), mk(2)] } : { more: false, results: [mk(3)] })
    });
  };
  /* neutralise the inter-page pacing gap for the test */
  const realTimeout = window.setTimeout;
  window.setTimeout = (fn, ms) => realTimeout(fn, ms > 50 ? 0 : ms);
  const mapped = await new Promise((res, rej) => KOS.vndb.syncList("tok-abc", {}, (e, m) => e ? rej(new Error(e.message)) : res(m)));
  window.setTimeout = realTimeout;
  if (mapped.length !== 3 || mapped[2].title !== "VN 3") throw new Error("mapped: " + mapped.length);
  if (calls.length !== 2) throw new Error("expected 2 paged calls, got " + calls.length);
  if (calls[0].url !== "https://api.vndb.org/kana/ulist") throw new Error("wrong endpoint: " + calls[0].url);
  if (calls[0].opts.headers["Authorization"] !== "Token tok-abc") throw new Error("auth header format");
  if (JSON.parse(calls[0].opts.body).user !== null) throw new Error("user must be null (the token's owner)");
});
step("client error mapping: 401 → auth kind, 429 → ratelimit with retryAfter", async () => {
  window.fetch = () => Promise.resolve({ ok: false, status: 401, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("Unauthorized") });
  const e1 = await new Promise(res => KOS.vndb.api("/authinfo", null, "bad", (err) => res(err)));
  if (!e1 || e1.kind !== "auth") throw new Error("401 kind: " + (e1 && e1.kind));
  window.fetch = () => Promise.resolve({ ok: false, status: 429, headers: { get: h => h === "Retry-After" ? "7" : null }, json: () => Promise.resolve({}), text: () => Promise.resolve("Throttled") });
  const e2 = await new Promise(res => KOS.vndb.api("/vn", { filters: [] }, null, (err) => res(err)));
  if (!e2 || e2.kind !== "ratelimit" || e2.retryAfter !== 7) throw new Error("429 mapping: " + JSON.stringify(e2));
});

/* ============ 4 · bulkUpsert: vndb matching + manual-layer preservation ============ */
console.log("== upsert & merge ==");
let vnId;
step("first sync inserts; second sync matches by vndbId — never duplicates", async () => {
  const inc = KOS.vndb.mapListEntry({
    id: "v17", vote: 85, started: null, finished: null, notes: "",
    labels: [{ id: 1, label: "Playing" }],
    vn: { title: "Ever17 -the out of infinity-", image: { url: "https://t.vndb.org/cv/12/79412.jpg" },
      length: 4, length_minutes: 1992, developers: [{ id: "p8", name: "KID" }],
      tags: [{ name: "Mystery", category: "cont", rating: 2.75, spoiler: 0 }] }
  });
  const r1 = await p(cb => KOS.mediadb.bulkUpsert([inc], {}, cb));
  if (r1.added !== 1 || r1.updated !== 0) throw new Error(JSON.stringify(r1));
  const r2 = await p(cb => KOS.mediadb.bulkUpsert([inc], {}, cb));
  if (r2.added !== 0 || r2.updated !== 1) throw new Error("dup: " + JSON.stringify(r2));
  const rows = await p(cb => KOS.mediadb.query({ module: "vn" }, cb));
  if (rows.length !== 1) throw new Error("rows: " + rows.length);
  vnId = rows[0].id;
});
step("a sync NEVER eats routes, quotes, CG counts or warnings; status/score do update", async () => {
  const e = await p(cb => KOS.mediadb.get(vnId, cb));
  e.routes = [KOS.mediadb.normRoute({ name: "Tsugumi", cleared: true, completedAt: today }),
              KOS.mediadb.normRoute({ name: "Coco (True)" })];
  e.quotes = [KOS.mediadb.normQuote({ text: "You only lose what you cling to.", context: "Coco" })];
  e.cgGallery = { totalKnown: 60, unlockedCount: 21 };
  e.contentWarnings = ["drowning"];
  await p(cb => KOS.mediadb.put(e, cb));
  /* the next sync says: finished it, vote 100 — list state must win,
     the manual layer must survive, progress re-derives from routes */
  const inc = KOS.vndb.mapListEntry({
    id: "v17", vote: 100, started: null, finished: "2026-07-01", notes: "",
    labels: [{ id: 2, label: "Finished" }],
    vn: { title: "Ever17 -the out of infinity-", image: { url: "https://t.vndb.org/cv/12/79412.jpg" },
      length: 4, length_minutes: 1992, developers: [{ id: "p8", name: "KID" }], tags: [] }
  });
  await p(cb => KOS.mediadb.bulkUpsert([inc], {}, cb));
  const after = await p(cb => KOS.mediadb.get(vnId, cb));
  if (after.status !== "completed" || after.score !== 10) throw new Error("sync should win list state");
  if (after.routes.length !== 2 || after.routes[0].name !== "Tsugumi") throw new Error("routes eaten");
  if (after.quotes.length !== 1) throw new Error("quotes eaten");
  if (after.cgGallery.totalKnown !== 60 || after.cgGallery.unlockedCount !== 21) throw new Error("cg eaten");
  if (after.contentWarnings[0] !== "drowning") throw new Error("warnings eaten");
  if (after.progress.current !== 1 || after.progress.total !== 2) throw new Error("progress must re-derive from surviving routes: " + JSON.stringify(after.progress));
  if (after.developer !== "KID") throw new Error("developer");
});

/* ============ 5 · flashcards: the PERSONAL bucket ============ */
console.log("== personal flashcard bucket ==");
let cardId;
step("a VN quote becomes a personal card — outside every curriculum subject", async () => {
  const before = KOS.srs.allCards().length;
  const card = KOS.srs.addCustom(KOS.srs.PERSONAL_SID, "vn",
    "Complete the quote — Ever17 (Coco): “You only lose…”",
    "You only lose what you cling to.",
    { src: { module: "vn", entryId: vnId, title: "Ever17 -the out of infinity-" } });
  cardId = card.id;
  if (card.sid !== "personal" || card.ref !== "vn") throw new Error("bucket");
  if (!card.src || card.src.module !== "vn") throw new Error("origin metadata lost");
  if (KOS.srs.allCards().length !== before + 1) throw new Error("not in the global card set");
  const refs = KOS.srs.personalRefs();
  if (refs.length !== 1 || refs[0].ref !== "vn" || refs[0].count !== 1) throw new Error(JSON.stringify(refs));
  if (["compsci", "maths", "it"].some(s => KOS.srs.allCards().some(c => c.sid === s && c.id === cardId))) throw new Error("leaked into a subject");
});
step("personal cards ride the normal SM-2 schedule and the due queue", async () => {
  const key = "u" + cardId;
  const m = KOS.srs.rate(key, 0);   // Again → due today
  if (m.due !== today) throw new Error("lapse should be due today: " + m.due);
  const due = KOS.srs.dueCards();
  const mine = due.find(c => c.key === key);
  if (!mine) throw new Error("personal card missing from the due queue");
  if (mine.sid !== "personal") throw new Error("sid mangled in the queue");
});
step("the Personal Deck view mounts the standard flashcard engine over the bucket", async () => {
  KOS.show("personaldeck");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelector(".fc-card"), 3000);
  if (!main.querySelector(".fc-card")) throw new Error("no session stage");
  if (!/Personal Deck/.test(main.textContent)) throw new Error("view header");
});
step("Due Today shows the Personal column and the deck launcher", async () => {
  KOS.show("due");
  const main = document.getElementById("main");
  await waitFor(() => /Personal/.test(main.textContent), 2000);
  const cards = [...main.querySelectorAll(".stat-card")];
  const personal = cards.find(c => /Personal/.test(c.textContent));
  if (!personal) throw new Error("no Personal stat");
  if (personal.querySelector(".v").textContent !== "1") throw new Error("count: " + personal.querySelector(".v").textContent);
  if (![...main.querySelectorAll("button")].some(b => /Personal deck/.test(b.textContent))) throw new Error("no deck launcher");
});

/* ============ 6 · governor boundary ============ */
console.log("== governor boundary ==");
step("a VN log action gives +4 XP / +1 gold / 0 HP and feeds only the rest streak", async () => {
  const g = KOS.store.state.governor;
  const hp0 = g.hp, xp0 = g.xp, gold0 = g.gold;
  const e = await p(cb => KOS.mediadb.get(vnId, cb));
  KOS.media.logActivity(e, "route");
  if (g.hp !== hp0) throw new Error("HP moved: " + hp0 + " → " + g.hp);
  if (g.xp !== xp0 + 4 || g.gold !== gold0 + 1) throw new Error("trickle wrong: +" + (g.xp - xp0) + " XP, +" + (g.gold - gold0) + " gold");
  if (KOS.sessions.restStreak() < 1) throw new Error("rest streak not fed");
});

/* ============ 7 · views ============ */
console.log("== views ==");
step("VN vault renders: card, developer line, route progress, stats strip", async () => {
  KOS.show("vn");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".vn-card, .vn-row").length > 0, 5000);
  const card = main.querySelector(".vn-card") || main.querySelector(".vn-row");
  if (!card || !/Ever17/.test(card.textContent)) throw new Error("entry card missing");
  if (!/KID/.test(card.textContent)) throw new Error("developer line missing");
  if (!/1\/2 routes/.test(card.textContent)) throw new Error("route progress missing: " + card.textContent.slice(0, 120));
  await waitFor(() => main.querySelectorAll(".stat-card").length > 0, 3000);
  if (!/Routes cleared/.test(main.textContent)) throw new Error("stats strip missing");
});
step("VN editor opens with routes, CG counter, quote log and warnings", async () => {
  const main = document.getElementById("main");
  (main.querySelector(".vn-card") || main.querySelector(".vn-row")).click();
  await tick(60);
  const modal = document.querySelector(".vn-modal");
  if (!modal) throw new Error("editor did not open");
  if (!modal.querySelector(".vn-route-row")) throw new Error("routes section");
  if (!/CG gallery/.test(modal.textContent)) throw new Error("CG section");
  if (!modal.querySelector(".vn-quote")) throw new Error("quote log");
  if (![...modal.querySelectorAll("button")].some(b => /flashcard/.test(b.textContent))) throw new Error("send-to-flashcards action");
  modal.querySelector("button[aria-label='Close']").click();
});
step("Matrix home: VN module card is live (Games live too since 3e)", async () => {
  KOS.show("matrix");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-mod-card, .soon-card").length >= 4, 5000);
  const live = [...main.querySelectorAll(".med-mod-card")];
  if (!live.some(c => /Visual Novels/.test(c.textContent) && /VNDB-synced/.test(c.textContent))) throw new Error("VN card not live");
  if (main.querySelectorAll(".soon-card").length) throw new Error("no placeholders should remain since 3e");
  if (!live.some(c => /Games/.test(c.textContent) && /Manual-first/.test(c.textContent))) throw new Error("Games card not live");
});
step("the Shrine routes a VN favourite to the VN editor", async () => {
  const e = await p(cb => KOS.mediadb.get(vnId, cb));
  e.favourite = true;
  await p(cb => KOS.mediadb.put(e, cb));
  KOS.show("shrine");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".shrine-card").length > 0, 5000);
  const card = [...main.querySelectorAll(".shrine-card")].find(c => /Ever17/.test(c.textContent));
  if (!card) throw new Error("VN favourite not in the Shrine");
  card.click();
  await tick(60);
  const modal = document.querySelector(".vn-modal");
  if (!modal) throw new Error("Shrine opened the wrong editor for a VN entry");
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
    console.log("SMOKE6 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE6 PASS — Visual Novels layer verified (" + steps.length + " steps).");
  process.exit(0);
})();
