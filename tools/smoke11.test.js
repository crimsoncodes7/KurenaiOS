/* Kurenai OS — smoke11.test.js
   Build 3i suite: the Books Physical/Digital tab split (navigation only —
   the owned-vs-read comparison must survive it), the external book lookup
   client (Open Library + Google Books), barcode-scanner capability
   degradation, reading sessions on the Focus Timer state machine (the
   Collection Matrix governor boundary), and ranked shelves. Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke11.test.js

   WHAT WAS VERIFIED LIVE vs WHAT IS MOCKED (2026-07-04):
   - Open Library: VERIFIED LIVE. GET openlibrary.org/search.json answers
     with `access-control-allow-origin: *` for both free-text q= and
     q=isbn:… — the OL doc shape used in the mocks below is pasted from a
     real response (鬼滅の刃 1 / Demon Slayer vol 1, isbn 9781974700523).
   - Google Books: CORS VERIFIED LIVE (access-control-allow-origin echoes
     Origin: null) BUT every keyless request answered HTTP 429 with
     quota_limit_value 0 for the shared anonymous consumer project
     (624717413613) — Google has zeroed keyless Books quota, so the
     RESPONSE BODY shape below follows the documented volumes API format
     and could NOT be re-verified live. That is exactly why Open Library
     is the primary provider and Google Books only a fallback.
   - BarcodeDetector: capability-DETECTED at runtime, never assumed; jsdom
     has no BarcodeDetector, which conveniently exercises the degradation
     path (the manual-ISBN note) below.
   The network is mocked here for repeatability.                          */
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
if (!window.AbortController) window.AbortController = class { constructor() { this.signal = {}; } abort() {} };

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

/* ---- controllable fetch mock ---- */
let fetchLog = [];
let fetchRoutes = [];   // [{match, respond(url) → Promise<res-like>}]
window.fetch = url => {
  fetchLog.push(String(url));
  for (const r of fetchRoutes) if (String(url).includes(r.match)) return r.respond(String(url));
  return Promise.reject(new TypeError("fetch: no route for " + url));
};
const okJson = body => () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
const httpErr = status => () => Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) });
const netFail = () => () => Promise.reject(new TypeError("network down"));

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
/* bookapi's cbs are (err, results, meta) — a 3-arg promisifier */
function p3(fn) { return new Promise((res, rej) => fn((err, results, meta) => err ? rej(Object.assign(new Error(err.message), err)) : res({ results, meta }))); }

/* the REAL Open Library doc shape (live response, 2026-07-04) */
const OL_DOC = {
  author_name: ["Koyoharu Gotoge"], cover_i: 9364005, first_publish_year: 2016,
  isbn: ["9781974700523", "8542629280", "4088807235", "1974700526"],
  key: "/works/OL19751404W", number_of_pages_median: 192, title: "鬼滅の刃 1"
};
const OL_BODY = { numFound: 1, docs: [OL_DOC] };
/* Google Books volumes shape per the documented API format (live
   re-verification blocked — keyless quota is zero, see header) */
const GB_BODY = { items: [{ volumeInfo: {
  title: "Demon Slayer 1", authors: ["Koyoharu Gotoge"],
  industryIdentifiers: [{ type: "ISBN_10", identifier: "1974700526" }, { type: "ISBN_13", identifier: "9781974700523" }],
  imageLinks: { thumbnail: "http://books.google.com/books/content?id=x" },
  publishedDate: "2018-07-03", pageCount: 192
} }] };

/* ============ 1 · ISBN utilities (pure) ============ */
console.log("== bookapi: ISBN utilities ==");
step("cleanIsbn/isValidIsbn: hyphens, spaces, ISBN-10 X check digit", async () => {
  const b = KOS.bookapi;
  if (b.cleanIsbn("978-1-974700-52-3") !== "9781974700523") throw new Error("hyphens");
  if (!b.isValidIsbn("978 1 974700 52 3")) throw new Error("spaces");
  if (!b.isValidIsbn("043942089x")) throw new Error("lower-case X ISBN-10");
  if (b.isValidIsbn("12345")) throw new Error("junk accepted");
  if (b.isValidIsbn("9771974700523")) throw new Error("977 prefix accepted (not a bookland ISBN)");
});
step("toIsbn13: the textbook conversion 0306406152 → 9780306406157", async () => {
  const b = KOS.bookapi;
  if (b.toIsbn13("0-306-40615-2") !== "9780306406157") throw new Error(b.toIsbn13("0-306-40615-2"));
  if (b.toIsbn13("9781974700523") !== "9781974700523") throw new Error("13 not passthrough");
  if (b.toIsbn13("garbage") !== null) throw new Error("junk not null");
});
step("pickIsbn13: first 13 wins; converts a lone 10; null on nothing", async () => {
  const b = KOS.bookapi;
  if (b.pickIsbn13(OL_DOC.isbn) !== "9781974700523") throw new Error("first 13");
  if (b.pickIsbn13(["0306406152"]) !== "9780306406157") throw new Error("10 → 13");
  if (b.pickIsbn13([]) !== null || b.pickIsbn13(null) !== null) throw new Error("empty");
});

/* ============ 2 · result mapping ============ */
console.log("== bookapi: mapping ==");
step("Open Library doc (real live shape) maps: author join, cover id URL, isbn pick", async () => {
  const r = KOS.bookapi._fromOpenLibrary(OL_DOC);
  if (r.title !== "鬼滅の刃 1" || r.author !== "Koyoharu Gotoge") throw new Error(JSON.stringify(r));
  if (r.isbn13 !== "9781974700523") throw new Error("isbn13: " + r.isbn13);
  if (r.coverUrl !== "https://covers.openlibrary.org/b/id/9364005-M.jpg") throw new Error("cover: " + r.coverUrl);
  if (r.year !== 2016 || r.pages !== 192 || r.source !== "openlibrary") throw new Error(JSON.stringify(r));
});
step("Google Books item maps: ISBN_13 preferred, http cover upgraded to https, year parsed", async () => {
  const r = KOS.bookapi._fromGoogleBooks(GB_BODY.items[0]);
  if (r.isbn13 !== "9781974700523") throw new Error("isbn13");
  if (!/^https:\/\//.test(r.coverUrl)) throw new Error("cover not upgraded: " + r.coverUrl);
  if (r.year !== 2018 || r.pages !== 192 || r.source !== "googlebooks") throw new Error(JSON.stringify(r));
  /* ISBN_10-only item converts */
  const r10 = KOS.bookapi._fromGoogleBooks({ volumeInfo: { title: "x",
    industryIdentifiers: [{ type: "ISBN_10", identifier: "0306406152" }] } });
  if (r10.isbn13 !== "9780306406157") throw new Error("10-only not converted");
});

/* ============ 3 · provider order + fallback ============ */
console.log("== bookapi: fallback ==");
step("Open Library answers → it is the provider, Google Books never called", async () => {
  fetchLog = [];
  fetchRoutes = [{ match: "openlibrary.org", respond: okJson(OL_BODY) },
                 { match: "googleapis.com", respond: okJson(GB_BODY) }];
  const { results, meta } = await p3(cb => KOS.bookapi.search("demon slayer", cb));
  if (meta.provider !== "openlibrary" || results.length !== 1) throw new Error(JSON.stringify(meta));
  if (fetchLog.some(u => u.includes("googleapis"))) throw new Error("Google Books called needlessly");
});
step("Open Library down → Google Books answers, with an honest note", async () => {
  fetchLog = [];
  fetchRoutes = [{ match: "openlibrary.org", respond: httpErr(500) },
                 { match: "googleapis.com", respond: okJson(GB_BODY) }];
  const { results, meta } = await p3(cb => KOS.bookapi.search("demon slayer", cb));
  if (meta.provider !== "googlebooks" || results.length !== 1) throw new Error(JSON.stringify(meta));
  if (!/Open Library/.test(meta.note || "")) throw new Error("no fallback note");
});
step("Open Library empty → Google Books consulted before giving up", async () => {
  fetchLog = [];
  fetchRoutes = [{ match: "openlibrary.org", respond: okJson({ numFound: 0, docs: [] }) },
                 { match: "googleapis.com", respond: okJson(GB_BODY) }];
  const { meta } = await p3(cb => KOS.bookapi.search("obscure title", cb));
  if (meta.provider !== "googlebooks") throw new Error("fallback on empty not taken");
});
step("both down (OL network, GB the live 429 quota-zero) → one combined error", async () => {
  fetchRoutes = [{ match: "openlibrary.org", respond: netFail() },
                 { match: "googleapis.com", respond: httpErr(429) }];
  let err = null;
  await p3(cb => KOS.bookapi.search("anything", cb)).catch(e => { err = e; });
  if (!err) throw new Error("no error surfaced");
});
step("byIsbn: rejects junk without a request; normalises 10→13 into the query; backfills isbn13", async () => {
  fetchLog = [];
  fetchRoutes = [{ match: "openlibrary.org", respond: okJson({ numFound: 1,
    docs: [{ title: "Zen", author_name: ["A"], isbn: [] }] }) }];
  let inputErr = null;
  await p3(cb => KOS.bookapi.byIsbn("not-an-isbn", cb)).catch(e => { inputErr = e; });
  if (!inputErr || inputErr.kind !== "input") throw new Error("junk ISBN not rejected");
  if (fetchLog.length) throw new Error("junk ISBN still hit the network");
  const { results } = await p3(cb => KOS.bookapi.byIsbn("0-306-40615-2", cb));
  if (!fetchLog[0].includes(encodeURIComponent("isbn:9780306406157"))) throw new Error("query not normalised: " + fetchLog[0]);
  if (results[0].isbn13 !== "9780306406157") throw new Error("scanned ISBN not backfilled onto the result");
});

/* ============ 4 · schema ============ */
console.log("== schema ==");
step("normalise keeps externalIds.isbn13 (the single schema gate)", async () => {
  const n = KOS.mediadb.normalise({ module: "books", title: "X",
    externalIds: { isbn13: "9781974700523" } });
  if (n.externalIds.isbn13 !== "9781974700523") throw new Error("isbn13 stripped by normalise");
  const bare = KOS.mediadb.normalise({ module: "books", title: "Y" });
  if (bare.externalIds.isbn13 !== null) throw new Error("isbn13 default not null");
});

/* ============ 5 · reading sessions — the governor boundary ============ */
console.log("== reading sessions ==");
step("completed reading session: type media, module books, exact duration, trickle only", async () => {
  const g = KOS.store.state.governor;
  g.hp = 47;
  const xp0 = g.xp, gold0 = g.gold;
  const study0 = KOS.sessions.streak(null);
  KOS.focus.start({ kind: "reading", mode: "custom", workMin: 1, breakMin: 0,
    book: { id: 5, title: "Test Book" } });
  if (KOS.focus.kind() !== "reading") throw new Error("kind not reading");
  KOS.focus._debugAdvance(61);
  KOS.focus.tick();                              // crosses the target → auto-complete
  if (KOS.focus.state() !== "idle") throw new Error("session did not auto-complete");
  const s = KOS.sessions.all()[KOS.sessions.all().length - 1];
  if (s.type !== "media") throw new Error("logged type: " + s.type);
  if (s.metrics.module !== "books" || s.metrics.action !== "reading-session") throw new Error(JSON.stringify(s.metrics));
  if (s.metrics.entryId !== 5 || s.metrics.title !== "Test Book") throw new Error("book link lost");
  if (s.dur !== 60) throw new Error("duration double-counted or wrong: " + s.dur);   // the no-break bank fix
  if (s.metrics.mins !== 1 || s.metrics.complete !== true) throw new Error(JSON.stringify(s.metrics));
  if (s.subject !== null || s.ref !== null) throw new Error("reading session carries a subject — study leak");
  if (g.xp !== xp0 + 4 || g.gold !== gold0 + 1) throw new Error("media trickle wrong");
  if (g.hp !== 47) throw new Error("HP moved — boundary broken");
  if (KOS.sessions.streak(null) !== study0) throw new Error("study streak moved");
  if (KOS.sessions.restStreak() < 1) throw new Error("rest streak not fed");
  if (KOS.sessions.hasActivity(today, null)) throw new Error("reading counts as study activity");
});
step("tab-switch during reading never logs a distraction or drains HP", async () => {
  const g = KOS.store.state.governor;
  g.hp = 47;
  KOS.focus.start({ kind: "reading", mode: "custom", workMin: 30, breakMin: 0, book: null });
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
  document.dispatchEvent(new window.Event("visibilitychange"));
  document.dispatchEvent(new window.Event("visibilitychange"));
  document.dispatchEvent(new window.Event("visibilitychange"));
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
  if (g.hp !== 47) throw new Error("HP drained during reading");
  if (KOS.focus.session().distractions.length !== 0) throw new Error("distraction logged during reading");
});
step("ending a reading session early still logs the time — nothing forfeited", async () => {
  const g = KOS.store.state.governor;
  const xp0 = g.xp;
  KOS.focus._debugAdvance(120);                  // 2 minutes on the clock
  KOS.focus.endEarly();                          // window.confirm is stubbed true
  if (KOS.focus.state() !== "idle") throw new Error("did not end");
  const s = KOS.sessions.all()[KOS.sessions.all().length - 1];
  if (s.type !== "media" || s.metrics.complete !== false) throw new Error(JSON.stringify(s.metrics));
  if (s.dur < 115 || s.dur > 125) throw new Error("early-end duration wrong: " + s.dur);
  if (g.xp !== xp0 + 4) throw new Error("early reading end forfeited the trickle — it shouldn't");
});
step("a STUDY focus session still drains HP on repeat distractions (boundary is one-way)", async () => {
  const g = KOS.store.state.governor;
  g.hp = 47;
  KOS.focus.start({ kind: "study", mode: "custom", workMin: 30, breakMin: 0 });
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
  document.dispatchEvent(new window.Event("visibilitychange"));   // free one
  document.dispatchEvent(new window.Event("visibilitychange"));   // −2 HP
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
  if (g.hp !== 45) throw new Error("study distraction drain broken by 3i: hp=" + g.hp);
  KOS.focus.endEarly();
  KOS.sessions.all().pop();                      // drop the forfeited study log so streak checks stay clean
});

/* ============ 6 · ranked shelves ============ */
console.log("== ranked shelves ==");
step("applyShelfOrder: ranked ids lead in order, strangers keep their sort, junk ignored", async () => {
  const rows = [{ id: 1, t: "a" }, { id: 2, t: "b" }, { id: 3, t: "c" }];
  const out = KOS.books.applyShelfOrder(rows, [3, 1]);
  if (out.map(r => r.id).join() !== "3,1,2") throw new Error(out.map(r => r.id).join());
  if (KOS.books.applyShelfOrder(rows, []).map(r => r.id).join() !== "1,2,3") throw new Error("empty order changed things");
  if (KOS.books.applyShelfOrder(rows, [99, 2]).map(r => r.id).join() !== "2,1,3") throw new Error("unknown id broke ordering");
});
step("setShelfOrder/getShelfOrders round-trip through the media kv store", async () => {
  await p(cb => KOS.books.setShelfOrder("faves", [9, 7, 8], cb));
  await p(cb => KOS.books.setShelfOrder("loans", [1], cb));
  const all = await p(cb => KOS.books.getShelfOrders(cb));
  if (all.faves.join() !== "9,7,8" || all.loans.join() !== "1") throw new Error(JSON.stringify(all));
  await p(cb => KOS.books.setShelfOrder("faves", [7, 9, 8], cb));
  const again = await p(cb => KOS.books.getShelfOrders(cb));
  if (again.faves.join() !== "7,9,8" || again.loans.join() !== "1") throw new Error("update clobbered a sibling shelf");
});

/* ============ 7 · the tab split (views) ============ */
console.log("== tab split ==");
let idOwned, idDigital, ranked = [];
step("seed: one dual-tracked series, one digital-only, three shelved", async () => {
  const owned = await p(cb => KOS.mediadb.add({ module: "books", title: "Berserk", author: "Kentarou Miura",
    status: "inProgress", progress: { current: 40, total: 380 },
    physical: { owned: true, volumes: [{ number: 1 }, { number: 2, condition: "worn" }] } }, cb));
  idOwned = owned.id;
  const dig = await p(cb => KOS.mediadb.add({ module: "books", title: "Frieren",
    status: "inProgress", progress: { current: 10, total: 60 } }, cb));
  idDigital = dig.id;
  for (const t of ["Alpha", "Beta", "Gamma"]) {
    const r = await p(cb => KOS.mediadb.add({ module: "books", title: t, shelves: ["ranked"] }, cb));
    ranked.push(r.id);
  }
});
step("digital tab (default): both series show; physical tab: owned only, bookshelf layout", async () => {
  KOS.store.state.media.books = { layout: "grid", sort: "title", tab: "digital", physLayout: "shelf" };
  KOS.show("books");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".bk-card").length >= 2, 5000);
  const tabs = main.querySelectorAll(".bk-tab");
  if (tabs.length !== 2) throw new Error("tab count: " + tabs.length);
  if (!tabs[0].classList.contains("active")) throw new Error("digital not default");
  const titles = [...main.querySelectorAll(".med-title")].map(x => x.textContent).join(" ");
  if (!/Berserk/.test(titles) || !/Frieren/.test(titles)) throw new Error("digital tab hides entries: " + titles);
  /* → physical */
  tabs[1].click();
  await waitFor(() => main.querySelectorAll(".bk-shelf-series").length === 1, 5000);
  const series = main.querySelectorAll(".bk-shelf-series");
  if (series.length !== 1 || !/Berserk/.test(series[0].textContent)) throw new Error("physical lens wrong");
  if (main.querySelectorAll(".bk-spine").length !== 2) throw new Error("volume-level detail missing");
  if (/Frieren/.test(main.querySelector(".bk-shelves").textContent)) throw new Error("digital-only series on the physical shelf");
  if (!/with owned volumes/.test(main.querySelector(".med-count").textContent)) throw new Error("count line not lens-aware");
});
step("a pre-3i saved 'shelf' layout migrates to the Physical tab", async () => {
  KOS.store.state.media.books = { layout: "shelf", sort: "updated" };
  KOS.show("books");
  const m = KOS.store.state.media.books;
  if (m.tab !== "physical" || m.physLayout !== "shelf" || m.layout === "shelf") throw new Error(JSON.stringify(m));
});
step("owned-vs-read comparison lives in the editor — reachable from either tab", async () => {
  const e = await p(cb => KOS.mediadb.get(idOwned, cb));
  await new Promise(res => {
    KOS.booksEditor(e, null);
    res();
  });
  const modal = document.querySelector(".bk-modal");
  if (!modal) throw new Error("editor did not open");
  const cmp = modal.querySelector(".bk-compare");
  if (!cmp) throw new Error("comparison panel missing from the entry detail");
  if (cmp.querySelectorAll(".bk-compare-row").length !== 2) throw new Error("owned + read rows expected");
  if (!/Read/.test(cmp.textContent) || !/Owned/.test(cmp.textContent)) throw new Error("labels missing");
  modal.querySelector("button[aria-label='Close']").click();
  /* digital-only entry still carries the panel (with the hint state) */
  const d = await p(cb => KOS.mediadb.get(idDigital, cb));
  KOS.booksEditor(d, null);
  const modal2 = document.querySelector(".bk-modal");
  if (!modal2.querySelector(".bk-compare")) throw new Error("panel missing on digital-only entry");
  modal2.querySelector("button[aria-label='Close']").click();
});
step("selecting a shelf in list layout unlocks ranking; ▼ persists the new order", async () => {
  KOS.store.state.media.books = { layout: "list", sort: "title", tab: "digital", physLayout: "shelf" };
  KOS.show("books");
  const main = document.getElementById("main");
  const shelfSel = main.querySelector("select[aria-label='Filter by shelf']");
  await waitFor(() => shelfSel.options.length >= 2, 4000);
  shelfSel.value = "ranked";
  shelfSel.dispatchEvent(new window.Event("change"));
  await waitFor(() => main.querySelectorAll(".bk-rank-row").length === 3, 5000);
  if (!/rank this shelf/.test(main.querySelector(".med-count").textContent)) throw new Error("no ranking hint");
  if (!main.querySelector("select[aria-label='Sort']").disabled) throw new Error("sort not locked while a shelf is ranked");
  let rows = [...main.querySelectorAll(".bk-rank-row")];
  if (!/Alpha/.test(rows[0].textContent)) throw new Error("initial order unexpected");
  rows[0].querySelector("button[aria-label^='Move'][aria-label$='down']").click();
  await waitFor(() => {
    const r = [...main.querySelectorAll(".bk-rank-row")];
    return r.length === 3 && /Beta/.test(r[0].textContent);
  }, 3000);
  rows = [...main.querySelectorAll(".bk-rank-row")];
  if (!/Beta/.test(rows[0].textContent) || !/Alpha/.test(rows[1].textContent)) throw new Error("▼ did not move the row");
  /* the DOM repaints synchronously; the kv write commits async — poll it */
  const want = [ranked[1], ranked[0], ranked[2]].join();
  let orders = null;
  await waitFor(() => { KOS.books.getShelfOrders((e2, o) => { orders = o; }); return orders && orders.ranked; }, 3000);
  if (!orders || !orders.ranked) throw new Error("shelf order never persisted");
  if (orders.ranked.join() !== want) throw new Error("persisted: " + orders.ranked.join() + " want " + want);
  /* the saved order survives a full re-render */
  KOS.show("books");
  const main2 = document.getElementById("main");
  const sel2 = main2.querySelector("select[aria-label='Filter by shelf']");
  await waitFor(() => sel2.options.length >= 2, 4000);
  sel2.value = "ranked";
  sel2.dispatchEvent(new window.Event("change"));
  await waitFor(() => main2.querySelectorAll(".bk-rank-row").length === 3, 5000);
  if (!/Beta/.test([...main2.querySelectorAll(".bk-rank-row")][0].textContent)) throw new Error("order lost on re-render");
});

/* ============ 8 · lookup modal end-to-end ============ */
console.log("== lookup modal ==");
step("no BarcodeDetector (jsdom) → the degradation note shows, manual ISBN stays", async () => {
  fetchRoutes = [{ match: "openlibrary.org", respond: okJson(OL_BODY) }];
  KOS.books.openLookup(true, null);
  const modal = document.querySelector(".bk-lookup");
  if (!modal) throw new Error("lookup modal missing");
  if (!modal.querySelector(".bk-scan-none")) throw new Error("no capability-degradation note");
  if ([...modal.querySelectorAll("button")].some(b => /Scan barcode/.test(b.textContent))) throw new Error("scan button offered without the API");
  if (!modal.querySelector(".bk-isbn-in")) throw new Error("manual ISBN input missing");
});
step("ISBN → result row (Open Library) → + Use prefills the add form, physical intent = vol 1", async () => {
  const modal = document.querySelector(".bk-lookup");
  modal.querySelector(".bk-isbn-in").value = "978-1-974700-52-3";
  [...modal.querySelectorAll("button")].find(b => b.textContent === "Look up").click();
  await waitFor(() => modal.querySelectorAll(".msch-row").length === 1, 4000);
  const row = modal.querySelector(".msch-row");
  if (!/Open Library/.test(row.querySelector(".bk-src-chip").textContent)) throw new Error("source chip wrong");
  row.querySelector(".msch-add").click();
  await waitFor(() => document.querySelector(".bk-modal"), 4000);
  if (document.querySelector(".bk-lookup")) throw new Error("lookup modal left open under the editor");
  const ed = document.querySelector(".bk-modal");
  if (ed.querySelector("input[placeholder='Series title']").value !== "鬼滅の刃 1") throw new Error("title not prefilled");
  if (!/Koyoharu Gotoge/.test(ed.querySelector("input[placeholder^='Author']").value)) throw new Error("author not prefilled");
  if (!/covers\.openlibrary\.org/.test(ed.querySelector("input[type='url']").value)) throw new Error("cover not prefilled");
  if (!/1 volume owned/.test(ed.textContent)) throw new Error("physical intent did not shelve volume 1");
  if ([...ed.querySelectorAll("button")].every(b => b.textContent !== "Add")) throw new Error("prefilled draft not treated as NEW");
  /* save it: the added entry carries the isbn and logs 'added' */
  const g = KOS.store.state.governor;
  const xp0 = g.xp;
  const saved = await new Promise(res => {
    const closeBtn = [...ed.querySelectorAll("button")].find(b => b.textContent === "Add");
    KOS.booksEditor; // (no-op; the editor was opened by the lookup with its own onSaved)
    /* re-open path: click Add and watch the vault instead */
    closeBtn.click();
    setTimeout(async () => {
      const rows = await p(cb => KOS.mediadb.query({ module: "books", search: "鬼滅の刃" }, cb));
      res(rows[0] || null);
    }, 300);
  });
  if (!saved) throw new Error("lookup add did not reach the vault");
  if (saved.externalIds.isbn13 !== "9781974700523") throw new Error("isbn13 not stored");
  if (!saved.physical || saved.physical.volumes.length !== 1) throw new Error("volume 1 lost on save");
  if (g.xp !== xp0 + 4) throw new Error("added entry did not log the media trickle");
});

/* ============ 9 · heatmap pickup ============ */
console.log("== heatmap ==");
step("reading sessions surface on the existing reading heatmap with zero extra wiring", async () => {
  KOS.store.state.media.books = { layout: "grid", sort: "updated", tab: "digital", physLayout: "shelf" };
  KOS.show("books");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelector(".bk-heat svg"), 5000);
  const card = [...main.querySelectorAll(".cs-chart")].find(c => /Reading heatmap/.test(c.textContent));
  if (!card) throw new Error("heatmap card missing");
  const mLogs = card.textContent.match(/(\d+) logs in/);
  /* 2 reading sessions + the add + any bump = at least 3 media logs today */
  if (!mLogs || parseInt(mLogs[1], 10) < 3) throw new Error("heatmap not counting reading sessions: " + (mLogs && mLogs[0]));
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE11 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE11 PASS — Build 3i verified: tab split + comparison survival, lookup clients, scanner degradation, reading sessions on the focus machine, ranked shelves (" + steps.length + " steps).");
  process.exit(0);
})();
