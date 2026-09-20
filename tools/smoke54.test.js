/* Kurenai OS — smoke54.test.js
   VN progress sources, the VNDB write relay and the open-ended progress
   bar. Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke54.test.js

   What this suite pins:
   - a VN's progress derives from ONE source — routes cleared, chapters
     completed or a percentage the user set — chosen by progressMode or,
     unset, by what the entry carries (routes first); the derived shape
     carries its unit and the shared progressText/progressPct read it;
   - the source survives a VNDB pull, folds through mergeRows/foldLocal
     and counts as local data;
   - the editor's "What counts" select and percentage field, the card's
     "+1 ch" for a chapter-counting VN (the last chapter completes it);
   - KOS.media.progressFill: a known total gives the fraction, a series
     still releasing gives a half-full `open` bar, nothing started gives
     no bar — and anime, books and VN cards all draw it;
   - the VNDB write: signed in to cloud sync it goes through the
     `vndb-ulist` Edge Function (POST {vndbId, token, body}), whose
     401/403/429 answers keep their error kinds; signed out it is the
     direct PATCH, whose network failure is not retried (invariant 19);
   - the function source and config: verify_jwt on, PATCH to Kana, an
     allow-listed payload, the token never logged.                       */
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

/* ---- network mock (the smoke7 harness) ---- */
let netLog = [];
let netScript = null;
function mockResponse(status, body, headers) {
  return {
    ok: status >= 200 && status < 300, status,
    headers: { get: h => (headers && headers[h]) || null },
    json: () => Promise.resolve(body === undefined ? {} : body),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body || {}))
  };
}
window.fetch = (url, opts) => {
  const rec = { url, opts, body: opts && opts.body ? JSON.parse(opts.body) : null };
  netLog.push(rec);
  const scripted = netScript && netScript(url, rec);
  if (scripted) return scripted.then ? scripted : Promise.resolve(scripted);
  return Promise.resolve(mockResponse(204, null));
};

/* ---- a fake Supabase client: cloud "configured" and the Edge Function
   call observable, nothing else ---- */
const fnLog = [];
let fnScript = null;
const fakeClient = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: noop } } }),
    getSession: () => Promise.resolve({ data: { session: null } })
  },
  functions: {
    invoke: (name, opts) => {
      fnLog.push({ name, body: opts && opts.body });
      const r = fnScript && fnScript(name, opts && opts.body);
      if (r && r.error) {
        const payload = r.payload || {};
        return Promise.resolve({ data: null, error: { message: r.message || "fn failed",
          context: { status: r.status, json: () => Promise.resolve(payload) } } });
      }
      return Promise.resolve({ data: (r && r.data) || { ok: true }, error: null });
    }
  },
  channel: () => ({ on() { return this; }, subscribe() { return this; }, unsubscribe: noop }),
  removeChannel: noop,
  from: () => ({ select: () => Promise.resolve({ data: [], error: null }) })
};
window.KOS_ENV = { SUPABASE_URL: "https://test.supabase.co", SUPABASE_ANON_KEY: "anon" };
window.supabase = { createClient: () => fakeClient };

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();
KOS.mediapush._config({ debounce: 20, retryWait: 20 });

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
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const main = () => document.getElementById("main");

/* ============ 1 · the derived progress ============ */
console.log("== VN progress sources ==");
let idRoutes, idKinetic, idPct;
step("routes still count first; chapters count when they are what the VN has; a set percentage counts last", async () => {
  const routed = await p(cb => KOS.mediadb.add({ module: "vn", title: "Ever17", status: "inProgress",
    routes: [{ name: "Tsugumi", cleared: true }, { name: "Coco", cleared: false }],
    chapters: [{ name: "Prologue", status: "completed" }] }, cb));
  idRoutes = routed.id;
  assert(routed.progress.current === 1 && routed.progress.total === 2 && routed.progress.unit === "route",
    "routes must count when present: " + JSON.stringify(routed.progress));
  assert(KOS.mediadb.vnSource(routed) === "routes", "source routes");
  assert(KOS.media.progressText(routed) === "1 / 2 routes", "grammar: " + KOS.media.progressText(routed));

  const kinetic = await p(cb => KOS.mediadb.add({ module: "vn", title: "Higurashi", status: "inProgress",
    chapters: [{ name: "Onikakushi", status: "completed" }, { name: "Watanagashi", status: "completed" },
      { name: "Tatarigoroshi", status: "inProgress" }, { name: "Himatsubushi", status: "planned" }] }, cb));
  idKinetic = kinetic.id;
  assert(KOS.mediadb.vnSource(kinetic) === "chapters", "a kinetic novel counts chapters");
  assert(kinetic.progress.current === 2 && kinetic.progress.total === 4 && kinetic.progress.unit === "ch",
    "chapters derive: " + JSON.stringify(kinetic.progress));
  assert(KOS.media.progressText(kinetic) === "2 / 4 ch", "chapter grammar: " + KOS.media.progressText(kinetic));
  assert(KOS.media.progressText(kinetic, { long: true }) === "2 of 4 chapters", "long chapter grammar: " + KOS.media.progressText(kinetic, { long: true }));
  assert(KOS.media.progressPct(kinetic) === 50, "pct from chapters");

  const loose = await p(cb => KOS.mediadb.add({ module: "vn", title: "Danganronpa", status: "inProgress",
    progressPercent: 40 }, cb));
  idPct = loose.id;
  assert(KOS.mediadb.vnSource(loose) === "percent", "a percentage counts when nothing else is there");
  assert(loose.progress.current === 40 && loose.progress.total === 100 && loose.progress.unit === "%", "percent derive: " + JSON.stringify(loose.progress));
  assert(KOS.media.progressText(loose) === "40%", "percent grammar: " + KOS.media.progressText(loose));
  assert(KOS.media.progressText(loose, { long: true }) === "40% through", "long percent grammar");
  assert(KOS.media.progressPct(loose) === 40, "pct from percent");

  const bare = KOS.mediadb.normalise({ module: "vn", title: "Nothing" });
  assert(bare.progress.current === 0 && bare.progress.total === null, "nothing tracked → empty progress");
  assert(bare.progressMode === null && bare.progressPercent === null, "defaults null");
  assert(KOS.media.progressText(bare) === "", "nothing tracked prints nothing");
});

step("progressMode overrides the automatic pick; bad values are dropped and the percentage is clamped", async () => {
  const e = await p(cb => KOS.mediadb.get(idRoutes, cb));
  e.progressMode = "chapters";
  const saved = await p(cb => KOS.mediadb.put(e, cb));
  assert(saved.progress.current === 1 && saved.progress.total === 1 && saved.progress.unit === "ch", "explicit chapters mode: " + JSON.stringify(saved.progress));
  saved.progressMode = "percent"; saved.progressPercent = 250;
  const s2 = await p(cb => KOS.mediadb.put(saved, cb));
  assert(s2.progressPercent === 100 && s2.progress.current === 100, "clamped to 100");
  s2.progressMode = "bogus"; s2.progressPercent = -3;
  const s3 = await p(cb => KOS.mediadb.put(s2, cb));
  assert(s3.progressMode === null && s3.progressPercent === 0, "unknown mode → null, negative → 0");
  assert(s3.progress.unit === "route", "back to automatic (routes)");
  s3.progressMode = null; s3.progressPercent = null;
  await p(cb => KOS.mediadb.put(s3, cb));
});

step("a VNDB pull never touches the source; mergeRows and foldLocal carry it; it is local data", async () => {
  const e = await p(cb => KOS.mediadb.get(idPct, cb));
  e.externalIds.vndbId = "v900"; e.syncSource = "vndb"; e.progressMode = "percent";
  await p(cb => KOS.mediadb.put(e, cb));
  const res = await p(cb => KOS.mediadb.bulkUpsert([{
    module: "vn", title: "Danganronpa", status: "completed",
    progress: { current: 0, total: null }, score: 8,
    externalIds: { vndbId: "v900" }, syncSource: "vndb", lastSyncedAt: Date.now(),
    genres: [], dates: { started: null, finished: null }, extra: {}
  }], {}, cb));
  assert(res.updated === 1, "merge expected");
  const after = await p(cb => KOS.mediadb.get(idPct, cb));
  assert(after.progressMode === "percent" && after.progressPercent === 40, "pull ate the source: " + after.progressMode + "/" + after.progressPercent);
  assert(after.progress.current === 40 && after.progress.unit === "%", "progress re-derived after the pull");
  assert(after.status === "completed", "list state still follows the pull");

  const merged = KOS.media.mergeRows([
    KOS.mediadb.normalise({ module: "vn", title: "A", externalIds: { vndbId: "v1" }, createdAt: 1 }),
    KOS.mediadb.normalise({ module: "vn", title: "A", progressMode: "percent", progressPercent: 70, createdAt: 2 }),
    KOS.mediadb.normalise({ module: "vn", title: "A", progressPercent: 30, createdAt: 3 })
  ]);
  assert(merged.progressMode === "percent" && merged.progressPercent === 70, "mergeRows: mode carried, higher percentage wins");
  assert(KOS.mediadb.hasLocalData({ progressPercent: 10 }) && KOS.mediadb.hasLocalData({ progressMode: "chapters" }), "the source is local data");
  assert(!KOS.mediadb.hasLocalData({ progressPercent: null, progressMode: null }), "null source is not");
});

step("hours played count against VNDB's length: crowd-sourced minutes, else the 1–5 bucket as a rough figure, else open", async () => {
  const timed = await p(cb => KOS.mediadb.add({ module: "vn", title: "Umineko", status: "inProgress",
    playtimeHours: 12, extra: { lengthMinutes: 2400, length: 5 } }, cb));
  assert(KOS.mediadb.vnSource(timed) === "time", "hours count when there are no routes/chapters");
  assert(timed.progress.current === 12 && timed.progress.total === 40 && timed.progress.unit === "hr" && timed.progress.estimate === true,
    "time derive: " + JSON.stringify(timed.progress));
  assert(KOS.media.progressText(timed) === "12 / ~40 hr", "the estimate is marked: " + KOS.media.progressText(timed));
  assert(KOS.media.progressText(timed, { long: true }) === "12 of ~40 hours", "long: " + KOS.media.progressText(timed, { long: true }));
  assert(KOS.media.progressPct(timed) === 30, "pct from hours");
  const len = KOS.mediadb.vnLengthHours({ extra: { length: 4 } });
  assert(len.hours === 40 && len.rough === true, "bucket fallback is rough: " + JSON.stringify(len));
  assert(KOS.mediadb.vnLengthHours({ extra: {} }) === null, "no length → null");
  const bucketed = KOS.mediadb.normalise({ module: "vn", title: "b", playtimeHours: 3, extra: { length: 2 } });
  assert(bucketed.progress.total === 6 && bucketed.progress.estimate, "bucket gives a total");
  const noLen = KOS.mediadb.normalise({ module: "vn", title: "c", playtimeHours: 5, extra: {} });
  assert(noLen.progress.total === null && KOS.media.progressText(noLen) === "5 hr", "no length: hours alone");
  const fill = KOS.media.progressFill(noLen);
  assert(fill.open && /no length estimate/.test(fill.title), "open bar says VNDB has no length: " + fill.title);
  /* explicit time mode beats routes; a pull keeps the hours; +1 hr bumps */
  timed.routes = [{ name: "Ep1", cleared: true }]; timed.progressMode = "time";
  const t2 = await p(cb => KOS.mediadb.put(timed, cb));
  assert(t2.progress.unit === "hr" && t2.progress.current === 12, "explicit time mode wins over routes");
  t2.externalIds.vndbId = "v24"; t2.syncSource = "vndb";
  await p(cb => KOS.mediadb.put(t2, cb));
  await p(cb => KOS.mediadb.bulkUpsert([{ module: "vn", title: "Umineko", status: "inProgress",
    progress: { current: 0, total: null }, score: 0, externalIds: { vndbId: "v24" }, syncSource: "vndb",
    lastSyncedAt: Date.now(), genres: [], dates: { started: null, finished: null }, extra: { lengthMinutes: 2400 } }], {}, cb));
  const t3 = await p(cb => KOS.mediadb.get(timed.id, cb));
  assert(t3.playtimeHours === 12 && t3.progress.current === 12, "a VNDB pull never eats the hours");
  const bump = KOS.vn.quickBump(t3);
  assert(bump && bump.unit === "hr", "+1 hr offered for a timed VN");
  const s0 = KOS.store.state.sessions.length;
  await p(cb => bump.run(t3, () => cb(null)));
  const t4 = await p(cb => KOS.mediadb.get(timed.id, cb));
  assert(t4.playtimeHours === 13 && t4.progress.current === 13, "+1 hr logged an hour: " + t4.playtimeHours);
  assert(KOS.store.state.sessions.length === s0 + 1, "one session per hour logged");
  assert(!KOS.vn.quickBump(KOS.mediadb.normalise({ module: "vn", title: "r", status: "inProgress", routes: [{ name: "a" }] })), "a routed VN has no bump");
  const merged = KOS.media.mergeRows([
    KOS.mediadb.normalise({ module: "vn", title: "A", externalIds: { vndbId: "v1" }, playtimeHours: 2, createdAt: 1 }),
    KOS.mediadb.normalise({ module: "vn", title: "A", playtimeHours: 9, createdAt: 2 })
  ]);
  assert(merged.playtimeHours === 9, "mergeRows keeps the higher hours");
});

/* ============ 2 · the editor and the card ============ */
console.log("== editor + card ==");
step("the editor's What-counts select and percentage field save; the field hides while something else counts", async () => {
  const e = await p(cb => KOS.mediadb.get(idKinetic, cb));
  KOS.vnEditor(e, null);
  const modal = document.querySelector(".vn-modal");
  assert(modal, "editor did not open");
  const sel = modal.querySelector("select[aria-label='What counts as progress']");
  const pctIn = modal.querySelector("input[aria-label='How far through, as a percentage']");
  assert(sel && pctIn, "controls missing");
  assert(sel.value === "", "automatic by default");
  assert(pctIn.closest(".med-field").hidden === true, "percentage hidden while chapters count");
  assert(/Counting chapters — 2 of 4/.test(modal.querySelector(".vn-prog-note:not(.vn-len-note)").textContent), "note names the source: " + modal.querySelector(".vn-prog-note:not(.vn-len-note)").textContent);
  const hoursIn = modal.querySelector("input[aria-label='Hours played']");
  assert(hoursIn && hoursIn.closest(".med-field").hidden === true, "hours hidden while chapters count");
  sel.value = "time";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(hoursIn.closest(".med-field").hidden === false, "hours show once chosen");
  assert(/VNDB has no length/.test(modal.querySelector(".vn-len-note").textContent), "the length note says VNDB has none for this title");
  sel.value = "percent";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(pctIn.closest(".med-field").hidden === false, "percentage shows once chosen");
  pctIn.value = "65";
  pctIn.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert(/65%/.test(modal.querySelector(".vn-prog-note:not(.vn-len-note)").textContent), "note follows the field");
  /* chapters live in the Progress section now, beside routes */
  assert(modal.querySelector(".med-edit-body .vn-chapters"), "chapters section present");
  [...modal.querySelectorAll("button")].find(b => /^Save/.test(b.textContent.trim())).click();
  await waitFor(() => !document.querySelector(".vn-modal"), 3000);
  const after = await p(cb => KOS.mediadb.get(idKinetic, cb));
  assert(after.progressMode === "percent" && after.progressPercent === 65, "saved: " + after.progressMode + "/" + after.progressPercent);
  assert(after.progress.current === 65 && after.progress.unit === "%", "progress re-derived on save");
  after.progressMode = null; after.progressPercent = null;
  await p(cb => KOS.mediadb.put(after, cb));
});

step("a chapter-counting VN gets +1 ch on its card; the last chapter completes the entry; a routed VN gets none", async () => {
  KOS.show("vn");
  await waitFor(() => main().querySelectorAll(".vn-card").length >= 3, 5000);
  const cards = [...main().querySelectorAll(".vn-card")];
  const kin = cards.find(c => /Higurashi/.test(c.textContent));
  const routed = cards.find(c => /Ever17/.test(c.textContent));
  assert(kin && routed, "cards missing");
  assert(/2 \/ 4 ch/.test(kin.querySelector(".med-prog").textContent), "card prints the chapter count: " + kin.querySelector(".med-prog").textContent);
  assert(kin.querySelector(".med-track") && kin.querySelector(".med-track .subj-fill").style.width === "50%", "chapter bar at 50%");
  assert(!routed.querySelector(".med-plus"), "a routed VN has no +1");
  const plus = kin.querySelector(".med-plus");
  assert(plus && /\+1 ch/.test(plus.textContent), "+1 ch missing on the kinetic novel");
  const sessions0 = KOS.store.state.sessions.length;
  plus.click();
  await waitFor(async () => (await p(cb => KOS.mediadb.get(idKinetic, cb))).progress.current === 3, 2000);
  let e = await p(cb => KOS.mediadb.get(idKinetic, cb));
  assert(e.progress.current === 3, "first +1 completed the next chapter: " + e.progress.current);
  assert(e.chapters[2].status === "completed" && e.chapters[3].status === "planned", "the FIRST unfinished chapter completes, in order");
  assert(e.status === "inProgress", "still in progress");
  assert(KOS.store.state.sessions.length === sessions0 + 1, "one session per +1");
  await p(cb => KOS.vn.bumpChapter(e, () => cb(null)));
  e = await p(cb => KOS.mediadb.get(idKinetic, cb));
  assert(e.progress.current === 4 && e.status === "completed" && e.dates.finished, "the last chapter completes the VN");
  assert(KOS.store.state.sessions.length === sessions0 + 2, "the completion is a session too");
  const n = KOS.store.state.sessions.length;
  await p(cb => KOS.vn.bumpChapter(e, () => cb(null)));
  assert(KOS.store.state.sessions.length === n, "nothing left to bump → no session");
});

/* ============ 3 · the open-ended bar ============ */
console.log("== progressFill ==");
step("a known total gives the fraction; still releasing gives half full and open; nothing started gives no bar; games none", () => {
  const f = KOS.media.progressFill;
  const known = f(KOS.mediadb.normalise({ module: "anime", title: "a", progress: { current: 6, total: 24 } }));
  assert(known && known.pct === 25 && known.open === false, "known total: " + JSON.stringify(known));
  const open = f(KOS.mediadb.normalise({ module: "books", title: "b", progress: { current: 130, total: null } }));
  assert(open && open.pct === 50 && open.open === true && /still releasing/.test(open.title), "open bar: " + JSON.stringify(open));
  assert(f(KOS.mediadb.normalise({ module: "anime", title: "c", progress: { current: 0, total: null } })) === null, "nothing started → no bar");
  assert(f(KOS.mediadb.normalise({ module: "game", title: "d", playtimeHours: 9 })) === null, "games have no bar");
  assert(f(KOS.mediadb.normalise({ module: "vn", title: "e" })) === null, "an untracked VN has no bar");
  const bar = KOS.media.progressBar(KOS.mediadb.normalise({ module: "anime", title: "a", progress: { current: 30, total: null } }));
  assert(bar.classList.contains("med-track") && bar.classList.contains("open") && bar.querySelector(".subj-fill").style.width === "50%", "progressBar draws the open bar");
  assert(bar.getAttribute("role") === "img" && /still releasing/.test(bar.getAttribute("aria-label")), "the bar says why it is half");
});

step("anime and books cards draw the half-full bar for a series still releasing", async () => {
  await p(cb => KOS.mediadb.add({ module: "anime", title: "One Piece", status: "inProgress",
    progress: { current: 1100, total: null }, externalIds: { anilistId: 21 }, syncSource: "anilist" }, cb));
  await p(cb => KOS.mediadb.add({ module: "anime", title: "Finished Show", status: "completed",
    progress: { current: 12, total: 12 } }, cb));
  await p(cb => KOS.mediadb.add({ module: "books", title: "Berserk", status: "inProgress", format: "manga",
    progress: { current: 370, total: null, volumes: null, totalVolumes: null }, externalIds: { anilistId: 30002 }, syncSource: "anilist" }, cb));
  KOS.show("anime");
  await waitFor(() => main().querySelectorAll(".med-card").length >= 2, 5000);
  let cards = [...main().querySelectorAll(".med-card")];
  const op = cards.find(c => /One Piece/.test(c.textContent));
  const fin = cards.find(c => /Finished Show/.test(c.textContent));
  assert(op && op.querySelector(".med-track.open") && op.querySelector(".subj-fill").style.width === "50%", "releasing anime: half-full open bar");
  assert(fin && fin.querySelector(".med-track") && !fin.querySelector(".med-track.open") && fin.querySelector(".subj-fill").style.width === "100%", "finished anime: full honest bar");
  KOS.show("books");
  await waitFor(() => [...main().querySelectorAll(".bk-card")].some(c => /Berserk/.test(c.textContent)), 5000);
  const bk = [...main().querySelectorAll(".bk-card")].find(c => /Berserk/.test(c.textContent));
  assert(bk, "Berserk card");
  const readBar = bk.querySelector(".bk-dual-read");
  assert(readBar && readBar.classList.contains("open") && readBar.style.width === "50%", "releasing manga: half-full open read bar");
  assert(/still releasing/.test(bk.querySelector(".bk-dual").title), "the bar's title says why");
  const o = KOS.books.ownership(KOS.mediadb.normalise({ module: "books", title: "x", progress: { current: 10, total: 100 } }));
  assert(o.readPct === 10 && o.readOpen === false, "a known total is still the honest fraction");
});

/* ============ 4 · the VNDB write relay ============ */
console.log("== VNDB relay ==");
let idVn;
step("signed out: the direct PATCH, whose network failure names the sign-in and is not retried", async () => {
  await p(cb => KOS.mediadb.setKV("vndb.token", "vndb-token", cb));
  await p(cb => KOS.mediadb.setKV("vndb.user", { id: "u9", username: "crimson", permissions: ["listread", "listwrite"] }, cb));
  idVn = (await p(cb => KOS.mediadb.add({ module: "vn", title: "Steins;Gate", status: "planned",
    externalIds: { vndbId: "v2002" }, syncSource: "vndb" }, cb))).id;
  assert(KOS.cloud.signedIn() === false, "fixture: signed out");
  netLog = [];
  netScript = url => /\/ulist\//.test(url) ? Promise.reject(new TypeError("Failed to fetch")) : null;
  const err = await new Promise(res => KOS.vndb.setUlist("vndb-token", "v2002", { status: "inProgress", score: 8 }, res));
  assert(err && err.kind === "network" && /Sign in to cloud sync/.test(err.message), "signed-out wording: " + (err && err.message));
  assert(netLog.length === 1 && netLog[0].opts.method === "PATCH", "exactly one direct PATCH");
  assert(fnLog.length === 0, "no Edge Function call while signed out");
  /* through mediapush: one attempt, failed chip, no retry loop */
  const e = await p(cb => KOS.mediadb.get(idVn, cb));
  e.status = "inProgress";
  await p(cb => KOS.mediadb.put(e, cb));
  netLog = [];
  KOS.mediapush.flush(idVn);
  await waitFor(() => !KOS.mediapush.isPending(idVn), 3000);
  await tick(150);
  assert(netLog.filter(r => /\/ulist\//.test(r.url)).length === 1, "the CORS wall is tried once, never retried: " + netLog.length);
  const after = await p(cb => KOS.mediadb.get(idVn, cb));
  assert(after.push && after.push.state === "failed", "failed chip set");
  netScript = null;
});

step("signed in: setUlist POSTs {vndbId, token, body} to vndb-ulist and nothing goes to VNDB directly", async () => {
  KOS.cloud._setSession({ user: { id: "user-1", email: "a@b.c" }, access_token: "jwt" });
  assert(KOS.cloud.signedIn() === true, "fixture: signed in");
  fnLog.length = 0; netLog = []; fnScript = null;
  const err = await new Promise(res => KOS.vndb.setUlist("vndb-token", "v2002", { status: "completed", score: 9.5 }, res));
  assert(!err, "relay success expected: " + (err && err.message));
  assert(fnLog.length === 1 && fnLog[0].name === "vndb-ulist", "one relay call: " + JSON.stringify(fnLog));
  const b = fnLog[0].body;
  assert(b.vndbId === "v2002" && b.token === "vndb-token", "id + token ride the body");
  assert(b.body.vote === 95 && b.body.labels_set[0] === 2 && b.body.labels_unset.indexOf(2) === -1 && b.body.labels_unset.length === 4,
    "the same payload shape as the direct PATCH: " + JSON.stringify(b.body));
  assert(netLog.filter(r => /vndb\.org/.test(r.url)).length === 0, "no direct VNDB request while relayed");
  /* an unrated entry omits vote — never clears a remote rating */
  fnLog.length = 0;
  await new Promise(res => KOS.vndb.setUlist("vndb-token", "v2002", { status: "planned", score: 0 }, res));
  assert(!("vote" in fnLog[0].body.body), "score 0 omits vote");
});

step("relay answers keep their kinds: 403 → auth naming listwrite, 401 → auth naming the session, 429 → ratelimit, 502 → http", async () => {
  fnScript = () => ({ error: true, status: 403, payload: { error: "Forbidden", upstream: 403 } });
  let err = await new Promise(res => KOS.vndb.setUlist("t", "v1", { status: "planned" }, res));
  assert(err.kind === "auth" && /listwrite/.test(err.message), "403 → auth/listwrite: " + JSON.stringify(err));
  fnScript = () => ({ error: true, status: 401, payload: { error: "Sign in to cloud sync to push changes to VNDB." } });
  err = await new Promise(res => KOS.vndb.setUlist("t", "v1", { status: "planned" }, res));
  assert(err.kind === "auth" && /sign in again/i.test(err.message), "401 without upstream → the cloud session: " + err.message);
  fnScript = () => ({ error: true, status: 429, payload: { error: "slow down", upstream: 429, retryAfter: 7 } });
  err = await new Promise(res => KOS.vndb.setUlist("t", "v1", { status: "planned" }, res));
  assert(err.kind === "ratelimit" && err.retryAfter === 7, "429 → ratelimit with Retry-After: " + JSON.stringify(err));
  fnScript = () => ({ error: true, status: 502, payload: { error: "VNDB returned HTTP 500.", upstream: 500 } });
  err = await new Promise(res => KOS.vndb.setUlist("t", "v1", { status: "planned" }, res));
  assert(err.kind === "http" && /HTTP 500/.test(err.message), "502 → http: " + JSON.stringify(err));
  fnScript = null;
});

step("through mediapush: a relayed push succeeds, clears the chip, logs the write; a relay outage retries", async () => {
  fnLog.length = 0;
  KOS.mediapush.flush(idVn);
  await waitFor(() => !KOS.mediapush.isPending(idVn), 3000);
  const e = await p(cb => KOS.mediadb.get(idVn, cb));
  assert(e.push === null && e.lastSyncedAt, "push succeeded through the relay");
  assert(fnLog.length === 1, "one relay call");
  const log = await p(cb => KOS.mediapush.getLog(cb));
  assert(log[0].ok === true && log[0].service === "vndb", "write log entry");
  /* the relay itself unreachable (no status) is transient — retried */
  let calls = 0;
  fnScript = () => { calls++; return calls < 3 ? { error: true, status: undefined, message: "Failed to send a request to the Edge Function" } : null; };
  KOS.mediapush.flush(idVn);
  await waitFor(() => !KOS.mediapush.isPending(idVn), 4000);
  assert(calls === 3, "a relay outage is retried until it answers: " + calls);
  const e2 = await p(cb => KOS.mediadb.get(idVn, cb));
  assert(e2.push === null, "and the eventual success clears the chip");
  fnScript = null;
  KOS.cloud._setSession(null);
});

/* ============ 5 · the function on disk ============ */
console.log("== edge function ==");
step("vndb-ulist: JWT-verified, PATCHes Kana with the user's token, allow-lists the payload, never logs the token", () => {
  const src = read("supabase/functions/vndb-ulist/index.ts");
  assert(src.includes("requireUserId(req)"), "must require the caller's JWT");
  assert(src.includes('method: "PATCH"') && src.includes("https://api.vndb.org/kana"), "PATCH to the official Kana endpoint");
  assert(src.includes("`Token ${token}`"), "VNDB token header format");
  assert(/labels_set/.test(src) && /labels_unset/.test(src) && /vote/.test(src), "the three ulist fields");
  assert(!/console\.log/.test(src), "nothing is logged");
  assert(!/serviceRest|SERVICE_ROLE/.test(src), "no service-role use — the relay stores nothing");
  const cfg = read("supabase/config.toml");
  assert(/\[functions\.vndb-ulist\]\s*\nverify_jwt = true/.test(cfg), "verify_jwt must be on for vndb-ulist");
  /* the client side */
  const cloud = read("js/core/cloud.js");
  assert(/invoke: invoke/.test(cloud) && /signedIn: signedIn/.test(cloud), "KOS.cloud.invoke / signedIn exported");
  const vndb = read("js/core/vndb.js");
  assert(/KOS\.cloud\.invoke\("vndb-ulist"/.test(vndb), "setUlist relays through vndb-ulist");
  const push = read("js/core/mediapush.js");
  assert(/vndbRelayed\(\)/.test(push), "mediapush keys the no-retry rule off the relay");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE54 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE54 PASS — VN progress sources, VNDB relay and open-ended bars verified (" + steps.length + " steps).");
  process.exit(0);
})();
