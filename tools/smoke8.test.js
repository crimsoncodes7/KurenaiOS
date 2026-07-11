/* Kurenai OS — smoke8.test.js
   Build 3e Games suite: the game schema (v5 — completion tiers, platform,
   manual playtime with derived progress, backlog priority, hand-entered
   steamAppId), the bulk paste-in parser + its one-session governor
   contract, the vault view + editor + quick actions, games analytics
   (tier/platform/genre + backlog burn-down), cross-media integration
   (Matrix strip/card/chart, Shrine routing, Sync & Import panel), and the
   no-network guarantee — a manual-only module must never emit a request.

   Steam sign-in: attempted and ABANDONED before this build shipped, from
   live tests on 2026-07-03 — steamcommunity.com/openid/login answers the
   check_authentication POST with NO Access-Control-Allow-Origin header,
   so a browser page can send the verification but never read is_valid
   (server required); file:// return URLs are browser-blocked outright.
   The testable consequence here is the absence: no sign-in code path, no
   steamcommunity request, and the dead end documented on Sync & Import.
   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke8.test.js                                             */
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

/* every fetch is recorded — a manual-only module must never need one */
let netLog = [];
window.fetch = (url, opts) => {
  netLog.push({ url, opts });
  return Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
    json: () => Promise.resolve({}), text: () => Promise.resolve("") });
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

let hadesId;

/* ============ 1 · schema ============ */
console.log("== schema (v5) ==");
step("game normalise: defaults, clamps, playtime-derived progress", async () => {
  const e = KOS.mediadb.normalise({ module: "game", title: "Hades" });
  if (e.completionTier !== "notStarted") throw new Error("tier default");
  if (e.platform !== "pc") throw new Error("platform default for games");
  if (e.playtimeHours !== null) throw new Error("playtime defaults null (unknown, not 0)");
  if (e.progress.current !== 0 || e.progress.total !== null) throw new Error("derived progress shape");
  if (e.backlogPriority !== null) throw new Error("priority default");
  if (e.publisher !== "") throw new Error("publisher default");
  const f = KOS.mediadb.normalise({ module: "game", title: "X", playtimeHours: 12.5,
    completionTier: "platinum", platform: "switch", backlogPriority: "high",
    progress: { current: 999, total: 999 } });
  if (f.progress.current !== 12.5 || f.progress.total !== null) throw new Error("progress must DERIVE from playtimeHours, ignoring supplied progress");
  if (f.completionTier !== "platinum" || f.platform !== "switch" || f.backlogPriority !== "high") throw new Error("valid values kept");
  const g = KOS.mediadb.normalise({ module: "game", title: "Y", playtimeHours: -3,
    completionTier: "nonsense", platform: "amiga", backlogPriority: "urgent" });
  if (g.playtimeHours !== null || g.completionTier !== "notStarted" || g.platform !== "pc" || g.backlogPriority !== null) {
    throw new Error("invalid values must fall back to defaults");
  }
});
step("non-game rows keep benign defaults (platform null, no derivation)", async () => {
  const a = KOS.mediadb.normalise({ module: "anime", title: "Frieren", progress: { current: 4, total: 28 } });
  if (a.platform !== null) throw new Error("anime rows must not claim a platform");
  if (a.progress.current !== 4 || a.progress.total !== 28) throw new Error("anime progress must not derive from playtime");
  if (a.completionTier !== "notStarted") throw new Error("benign tier default expected");
});
step("v5 indexes exist: platform + steam identity", async () => {
  await p(cb => KOS.mediadb.open(cb));
  await p(cb => KOS.mediadb.add({ module: "game", title: "Probe", platform: "xbox",
    externalIds: { steamAppId: 1091500 } }, cb));
  const byPlat = await p(cb => KOS.mediadb.query({ platform: "xbox" }, cb));
  if (byPlat.length !== 1 || byPlat[0].title !== "Probe") throw new Error("platform index query");
  const bySteam = await p(cb => KOS.mediadb.getByExternal("steam", 1091500, cb));
  if (!bySteam || bySteam.title !== "Probe") throw new Error("steam index lookup");
  await p(cb => KOS.mediadb.remove(bySteam.id, cb));
});
step("round-trip: every game axis survives put/get (normalise is the gate)", async () => {
  const rec = await p(cb => KOS.mediadb.add({ module: "game", title: "Elden Ring",
    developer: "FromSoftware", publisher: "Bandai Namco", status: "completed",
    completionTier: "storyComplete", platform: "playstation", ownership: "physical",
    playtimeHours: 90, score: 9.5, backlogPriority: "low",
    externalIds: { steamAppId: 1245620 }, genres: ["Action RPG"], tags: ["replay"] }, cb));
  const back = await p(cb => KOS.mediadb.get(rec.id, cb));
  if (back.publisher !== "Bandai Namco" || back.completionTier !== "storyComplete" ||
      back.platform !== "playstation" || back.playtimeHours !== 90 ||
      back.backlogPriority !== "low" || back.externalIds.steamAppId !== 1245620) {
    throw new Error("an axis was stripped: " + JSON.stringify(back));
  }
  if (back.progress.current !== 90) throw new Error("stored progress must equal playtime");
});
step("query filters: tier + platform + module compose", async () => {
  await p(cb => KOS.mediadb.add({ module: "game", title: "Hollow Knight", status: "completed",
    completionTier: "fullCompletion", platform: "switch", playtimeHours: 40 }, cb));
  const tiers = await p(cb => KOS.mediadb.query({ module: "game", tier: "fullCompletion" }, cb));
  if (tiers.length !== 1 || tiers[0].title !== "Hollow Knight") throw new Error("tier filter");
  const plats = await p(cb => KOS.mediadb.query({ module: "game", platform: "playstation" }, cb));
  if (plats.length !== 1 || plats[0].title !== "Elden Ring") throw new Error("platform filter");
});
step("stats(): games tally tiers + hours into the shared aggregate", async () => {
  const agg = await p(cb => KOS.mediadb.stats(cb));
  const g = agg.modules.game;
  if (!g || g.total !== 2) throw new Error("game module missing from stats: " + JSON.stringify(agg.modules));
  if (g.episodes !== 130) throw new Error("hours (generic units) wrong: " + g.episodes);
  if (!g.tiers || g.tiers.storyComplete !== 1 || g.tiers.fullCompletion !== 1) throw new Error("tier tally: " + JSON.stringify(g.tiers));
});

/* ============ 2 · bulk paste-in parser ============ */
console.log("== bulk paste-in ==");
step("parseBulkTitles: trims, skips blanks, dedupes paste + vault (case-insensitive)", async () => {
  const out = KOS.games.parseBulkTitles(
    "Hades\n  Outer Wilds  \n\n\nhades\nDisco Elysium\nELDEN RING\n" + "x".repeat(400),
    { "elden ring": true });
  if (out.titles.join("|") !== "Hades|Outer Wilds|Disco Elysium|" + "x".repeat(300)) {
    throw new Error("titles wrong: " + JSON.stringify(out.titles));
  }
  if (out.blank !== 2 || out.dupPaste !== 1 || out.dupVault !== 1) {
    throw new Error("skip counts wrong: " + JSON.stringify(out));
  }
  if (out.titles[3].length !== 300) throw new Error("length cap");
  const empty = KOS.games.parseBulkTitles("", {});
  if (empty.titles.length !== 0) throw new Error("empty input");
});
step("bulk add UI: drafts created, ONE session for the whole paste, gold minted once", async () => {
  KOS.show("game");
  const main = document.getElementById("main");
  await waitFor(() => [...main.querySelectorAll("button")].some(b => /Bulk add/.test(b.textContent)), 4000);
  [...main.querySelectorAll("button")].find(b => /Bulk add/.test(b.textContent)).click();
  await tick(30);
  const modal = document.querySelector(".gm-bulk-modal");
  if (!modal) throw new Error("bulk modal did not open");
  if (!/one title per line/i.test(modal.textContent)) throw new Error("instructions missing");
  const ta = modal.querySelector("textarea");
  ta.value = "Hades\nOuter Wilds\nCeleste\nhades\n\nElden Ring";
  const sessionsBefore = KOS.store.state.sessions.length;
  const goldBefore = KOS.store.state.governor.gold;
  [...modal.querySelectorAll("button")].find(b => /Create drafts/.test(b.textContent)).click();
  await waitFor(() => !document.querySelector(".gm-bulk-modal"), 4000);
  const rows = await p(cb => KOS.mediadb.query({ module: "game" }, cb));
  const titles = rows.map(r => r.title).sort().join("|");
  if (!/Celeste/.test(titles) || !/Hades/.test(titles) || !/Outer Wilds/.test(titles)) throw new Error("drafts missing: " + titles);
  if (rows.length !== 5) throw new Error("expected 5 games (2 fixtures + 3 new drafts), got " + rows.length);
  const drafts = rows.filter(r => r.title === "Hades" || r.title === "Outer Wilds" || r.title === "Celeste");
  if (!drafts.every(d => d.status === "planned" && d.syncSource === "manual")) throw new Error("draft defaults wrong");
  const sessions = KOS.store.state.sessions.slice(sessionsBefore);
  if (sessions.length !== 1) throw new Error("bulk paste must log exactly ONE session, got " + sessions.length);
  if (sessions[0].type !== "media" || sessions[0].metrics.action !== "bulk-add" || sessions[0].metrics.count !== 3) {
    throw new Error("bulk session shape: " + JSON.stringify(sessions[0].metrics));
  }
  const goldDelta = KOS.store.state.governor.gold - goldBefore;
  if (goldDelta > 1) throw new Error("bulk paste minted gold per row: +" + goldDelta);
  hadesId = rows.find(r => r.title === "Hades").id;
});
step("re-pasting the same list adds nothing (vault dedupe)", async () => {
  const before = await p(cb => KOS.mediadb.count("game", cb));
  KOS.games.bulkAdd(null);
  const modal = document.querySelector(".gm-bulk-modal");
  modal.querySelector("textarea").value = "Hades\nOuter Wilds\nCeleste";
  [...modal.querySelectorAll("button")].find(b => /Create drafts/.test(b.textContent)).click();
  await tick(200);
  const after = await p(cb => KOS.mediadb.count("game", cb));
  if (after !== before) throw new Error("dupes created: " + before + " → " + after);
  const still = document.querySelector(".gm-bulk-modal");
  if (!still || !/already in the vault/.test(still.textContent)) throw new Error("skip explanation missing");
  still.querySelector("button[aria-label='Close']").click();
});

/* ============ 3 · editor + everyday actions ============ */
console.log("== editor & actions ==");
step("editor: fleshing out a draft saves every axis; steam link is a working store URL", async () => {
  const e = await p(cb => KOS.mediadb.get(hadesId, cb));
  KOS.gamesEditor(e, null);
  const modal = document.querySelector(".gm-modal");
  if (!modal) throw new Error("editor did not open");
  if (!/manual entry — games have no live sync/.test(modal.textContent)) throw new Error("honesty line missing");
  modal.querySelector("input[placeholder='Developer']").value = "Supergiant Games";
  modal.querySelector("input[placeholder='Publisher']").value = "Supergiant Games";
  const hours = modal.querySelector("input[title*='no API exists']");
  hours.value = "35";
  const steamIn = modal.querySelector(".gm-steamid");
  steamIn.value = "1145360";
  steamIn.dispatchEvent(new window.Event("input", { bubbles: true }));
  const link = modal.querySelector(".gm-steamlink a");
  if (!link || link.href !== "https://store.steampowered.com/app/1145360/") throw new Error("store link: " + (link && link.href));
  const statusSel = modal.querySelectorAll("select")[0];
  statusSel.value = "inProgress";
  const sessionsBefore = KOS.store.state.sessions.length;
  [...modal.querySelectorAll("button")].find(b => b.textContent === "Save").click();
  await waitFor(() => !document.querySelector(".gm-modal"), 3000);
  const back = await p(cb => KOS.mediadb.get(hadesId, cb));
  if (back.developer !== "Supergiant Games" || back.playtimeHours !== 35 ||
      back.externalIds.steamAppId !== 1145360 || back.status !== "inProgress") {
    throw new Error("edit not saved: " + JSON.stringify({ d: back.developer, h: back.playtimeHours, s: back.externalIds.steamAppId, st: back.status }));
  }
  if (back.progress.current !== 35) throw new Error("progress must re-derive from hours");
  const s = KOS.store.state.sessions[KOS.store.state.sessions.length - 1];
  if (KOS.store.state.sessions.length !== sessionsBefore + 1 || s.metrics.action !== "status") throw new Error("status change must log");
});
step("tier change logs a 'tier' session and nudges status to completed", async () => {
  const e = await p(cb => KOS.mediadb.get(hadesId, cb));
  KOS.gamesEditor(e, null);
  const modal = document.querySelector(".gm-modal");
  const tierSel = [...modal.querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "platinum"));
  tierSel.value = "storyComplete";
  tierSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  const statusSel = modal.querySelectorAll("select")[0];
  if (statusSel.value !== "completed") throw new Error("tier→status nudge missing");
  const sessionsBefore = KOS.store.state.sessions.length;
  [...modal.querySelectorAll("button")].find(b => b.textContent === "Save").click();
  await waitFor(() => !document.querySelector(".gm-modal"), 3000);
  const back = await p(cb => KOS.mediadb.get(hadesId, cb));
  if (back.completionTier !== "storyComplete" || back.status !== "completed") throw new Error("tier not saved");
  if (!back.dates.finished) throw new Error("finished date not defaulted");
  const s = KOS.store.state.sessions[KOS.store.state.sessions.length - 1];
  if (KOS.store.state.sessions.length !== sessionsBefore + 1 || s.metrics.action !== "tier") throw new Error("tier session missing (tier outranks status in the same save)");
});
step("+1 hr bump: playtime + derived progress up, 'progress' session, HP + network untouched", async () => {
  const probe = await p(cb => KOS.mediadb.add({ module: "game", title: "Slay the Spire",
    status: "inProgress", playtimeHours: 10 }, cb));
  KOS.show("game");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-card").length > 0, 4000);
  const card = [...main.querySelectorAll(".med-card")].find(c => /Slay the Spire/.test(c.textContent));
  if (!card) throw new Error("card missing");
  const plus = [...card.querySelectorAll("button")].find(b => /\+1 hr/.test(b.textContent));
  if (!plus) throw new Error("+1 hr affordance missing on an in-progress card");
  const hp0 = KOS.store.state.governor.hp;
  const net0 = netLog.length;
  const sessionsBefore = KOS.store.state.sessions.length;
  plus.click();
  await waitFor(() => KOS.store.state.sessions.length > sessionsBefore, 3000);
  const back = await p(cb => KOS.mediadb.get(probe.id, cb));
  if (back.playtimeHours !== 11 || back.progress.current !== 11) throw new Error("bump wrong: " + back.playtimeHours);
  const s = KOS.store.state.sessions[KOS.store.state.sessions.length - 1];
  if (s.metrics.action !== "progress" || s.metrics.module !== "game") throw new Error("progress session shape");
  if (KOS.store.state.governor.hp !== hp0) throw new Error("HP moved");
  if (netLog.length !== net0) throw new Error("a manual-only module emitted a network request");
});
step("quick-edit on a game card saves + logs, and never attempts a push", async () => {
  KOS.show("game");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-card").length > 0, 4000);
  const card = [...main.querySelectorAll(".med-card")].find(c => /Celeste/.test(c.textContent));
  const sel = card.querySelector(".med-qsel");
  if (!sel) throw new Error("quick-edit missing");
  if (!/saved locally/.test(sel.title)) throw new Error("tooltip must not promise a push for games: " + sel.title);
  const net0 = netLog.length;
  const sessionsBefore = KOS.store.state.sessions.length;
  sel.value = "inProgress";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  await waitFor(() => KOS.store.state.sessions.length > sessionsBefore, 3000);
  await tick(500);   // longer than the push debounce — nothing may fire
  if (netLog.length !== net0) throw new Error("quick-edit pushed a manual game");
  const rows = await p(cb => KOS.mediadb.query({ module: "game", status: "inProgress" }, cb));
  if (!rows.some(r => r.title === "Celeste")) throw new Error("status not saved");
});
step("push eligibility: a game is never eligible, whatever its ids/syncSource claim", async () => {
  const e = KOS.mediadb.normalise({ module: "game", title: "X", syncSource: "anilist",
    externalIds: { steamAppId: 1, anilistId: 99 } });
  e.id = 12345;
  if (KOS.mediapush.eligible(e) !== null) throw new Error("game must never be push-eligible");
  if (KOS.mediapush.schedule(e) !== false) throw new Error("schedule must no-op");
});

/* ============ 4 · analytics ============ */
console.log("== analytics ==");
step("vault page: stat strip + tier/platform/backlog charts render", async () => {
  KOS.show("game");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".gm-stats .stat-card").length > 0, 4000);
  const strip = main.querySelector(".gm-stats .stat-strip");
  if (!/Games tracked/.test(strip.textContent) || !/Hours logged/.test(strip.textContent) ||
      !/100% \/ platinum/.test(strip.textContent)) throw new Error("stat strip labels");
  await waitFor(() => main.querySelectorAll(".gm-charts .cs-chart").length > 0, 4000);
  const charts = main.querySelector(".gm-charts").textContent;
  if (!/Completion tiers/.test(charts)) throw new Error("tier chart missing");
  if (!/Platforms/.test(charts)) throw new Error("platform chart missing");
  if (!/Backlog burn-down/.test(charts)) throw new Error("burn-down missing (adds + tier sessions exist this run)");
  if (!/backlog GREW|backlog SHRANK|held steady/.test(charts)) throw new Error("burn-down verdict missing");
});
step("backlogWeeks: bulk-add counts by its count, tier reaches count as done", async () => {
  const weeks = KOS.games.backlogWeeks(2);
  const thisWeek = weeks[weeks.length - 1];
  /* this run: bulk-add of 3 + 2 single adds (fixtures via mediadb.add don't
     log; the editor/quick paths logged: bulk-add(3) — adds; tier ×1 */
  if (thisWeek.added < 3) throw new Error("bulk-add count not expanded: " + JSON.stringify(thisWeek));
  if (thisWeek.done < 1) throw new Error("tier session not counted as done");
});

/* ============ 5 · cross-media integration ============ */
console.log("== cross-media ==");
step("Matrix home: dummy in-progress game appears in the consuming strip with the hr unit", async () => {
  /* the strip verification the spec asks for — Slay the Spire (11 hr,
     inProgress) is the live test entry */
  KOS.show("matrix");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-strip-card").length > 0, 4000);
  const gameCard = [...main.querySelectorAll(".med-strip-card")].find(c => /Slay the Spire/.test(c.textContent));
  if (!gameCard) throw new Error("game missing from the consuming strip");
  if (!/11 hr/.test(gameCard.textContent)) throw new Error("hr unit not shown: " + gameCard.textContent);
  if (!/遊/.test(gameCard.textContent)) throw new Error("module kanji badge missing");
});
step("Matrix home: Games is a live module card with stats, plus its status chart + quick action", async () => {
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-mod-card").length >= 4, 4000);
  if (main.querySelector(".soon-card")) throw new Error("a placeholder card remains");
  const gm = [...main.querySelectorAll(".med-mod-card")].find(c => /Games/.test(c.textContent));
  if (!gm) throw new Error("Games card missing");
  if (!/Manual-first · live/.test(gm.textContent)) throw new Error("badge wrong: " + gm.textContent);
  if (!/tracked/.test(gm.textContent) || !/hours logged/.test(gm.textContent)) throw new Error("stats line wrong");
  if (!/Games by status/.test(main.textContent)) throw new Error("games status chart missing");
  /* navigation to the vault now lives on the module card + subnav */
  if (!/Playing now/.test(main.textContent)) throw new Error("games stat missing from the strip");
});
step("Shrine: a favourite game routes to the games editor", async () => {
  const rows = await p(cb => KOS.mediadb.query({ module: "game", search: "hades" }, cb));
  const e = rows[0];
  e.favourite = true;
  await p(cb => KOS.mediadb.put(e, cb));
  KOS.show("shrine");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".shrine-card").length > 0, 4000);
  const card = [...main.querySelectorAll(".shrine-card")].find(c => /Hades/.test(c.textContent));
  if (!card) throw new Error("game not enshrined");
  if (!/Games/.test(card.textContent)) throw new Error("module chip missing");
  card.click();
  await tick(30);
  const modal = document.querySelector(".gm-modal");
  if (!modal) throw new Error("mediaEditor chain did not route to the games editor");
  modal.querySelector("button[aria-label='Close']").click();
});
step("Sync & Import: Games panel states the verified Steam dead end; no steamcommunity request ever fired", async () => {
  KOS.show("mediasync");
  const main = document.getElementById("main");
  await waitFor(() => main.querySelectorAll(".med-panel").length >= 8, 4000);
  if (main.querySelectorAll(".med-panel").length !== 8) throw new Error("panel count");   // 8 since 3j (Autonomous sync)
  const txt = main.textContent;
  if (!/Games — manual by design/.test(txt)) throw new Error("games panel missing");
  if (!/check_authentication/.test(txt) || !/CORS/.test(txt)) throw new Error("the verified reason must be stated");
  if (!/Bulk add/.test(txt)) throw new Error("the mitigation must be pointed to");
  if (netLog.some(r => /steam/i.test(r.url))) throw new Error("something called Steam: " + netLog.map(r => r.url).join(", "));
});
step("nav: Collection section + subnav reaches the Games vault", async () => {
  const rb = [...document.querySelectorAll("#rail .rail-item")].find(b => b.dataset.section === "collection");
  if (!rb) throw new Error("collection rail button missing");
  rb.click();
  await tick(60);
  const sn = [...document.querySelectorAll("#subnav .subnav-item")].find(b => /^Games/.test(b.textContent));
  if (!sn) throw new Error("subnav item missing");
  sn.click();
  await tick(60);
  if (!/Games/.test(document.getElementById("main").textContent)) throw new Error("navigation failed");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE8 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE8 PASS — Build 3e Games verified (" + steps.length + " steps).");
  process.exit(0);
})();
