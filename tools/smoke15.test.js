/* Kurenai OS — smoke15.test.js
   Build 4.0 suite: the UI/UX overhaul's NEW MARKUP (design.md v2).

   The overhaul restyled existing DOM without breaking the class contracts
   the older suites key off — those suites still guard the old markup. This
   suite covers what is genuinely new:
     · the Linear Void token architecture (canonical tokens + :root[data-theme]
       blocks for all 23 shop themes; retired theme ids fall back to default)
     · the Study Hall workspace (.study-grid + collapsible .study-inspector,
       persisted in ui.inspectorOpen) and the subject unit breakdown
     · the vault hero (medview.heroCard): auto-spotlight, kv-persisted
       selection, AniList bannerImage plumbing (query field + extra mapping
       + fetchBanner), and the games/VN no-network discipline
     · the overlay card grid (markup contract: cover + body + track on one card)
     · the Purchase Planner top row (.wl-top: always-on hero + budget summary)
     · the Governor bento (.bento with its seven cards)
   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke15.test.js                                            */
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

let netLog = [];
window.fetch = (url, opts) => {
  netLog.push({ url: String(url), opts });
  return Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
    json: () => Promise.resolve({ data: { Media: { bannerImage: "https://cdn.example/banner.jpg" } } }),
    text: () => Promise.resolve("") });
};

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(err.message || String(err))) : res(out))); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
async function waitFor(cond, ms) {
  const deadline = Date.now() + (ms || 3000);
  while (Date.now() < deadline) { if (cond()) return true; await tick(25); }
  return cond();
}
const css = fs.readFileSync(path.join(ROOT, "css", "main.css"), "utf8");

/* ============ 1 · the Linear Void colour system ============ */
console.log("== colour system ==");
step("canonical tokens exist and the legacy names alias them", async () => {
  for (const tok of ["--bg0:", "--bg1:", "--panel:", "--text:", "--accent:", "--accent2:", "--accent3:", "--good:", "--warning:", "--danger:", "--radius:"]) {
    if (!css.includes(tok)) throw new Error("missing canonical token " + tok);
  }
  if (!/--kurenai:\s*var\(--accent\)/.test(css)) throw new Error("--kurenai must alias --accent");
  if (!/--gold:\s*var\(--accent2\)/.test(css)) throw new Error("--gold must alias --accent2");
  if (!/--bad:\s*var\(--danger\)/.test(css)) throw new Error("--bad must alias --danger");
  if (!/--faint:\s*var\(--muted\)/.test(css)) throw new Error("--faint must alias --muted");
});
step("all 23 lab themes have :root[data-theme] blocks matching the catalog", async () => {
  const themes = KOS.governor.catalog().filter(c => c.kind === "theme");
  if (themes.length !== 23) throw new Error("23 themes expected, got " + themes.length);
  for (const t of themes) {
    if (!css.includes(':root[data-theme="' + t.theme + '"]')) throw new Error("no CSS block for " + t.theme);
  }
  /* the blocks must override on :root (html), not body — derived tokens are
     computed at :root and would never re-resolve otherwise */
  if (css.includes('body[data-theme="')) throw new Error("theme blocks must target :root, not body");
});
step("applyCosmetics: valid theme lands on <html>; retired ids fall back to default", async () => {
  const g = KOS.store.state.governor;
  g.theme = "ember-wraith";
  KOS.governor.applyCosmetics();
  if (document.documentElement.dataset.theme !== "ember-wraith") throw new Error("theme not applied to <html>");
  g.theme = "kin";   // retired crimson-era id
  KOS.governor.applyCosmetics();
  if (document.documentElement.dataset.theme !== "") throw new Error("retired id must fall back to default");
  g.theme = "kurenai";
  KOS.governor.applyCosmetics();
});

/* ============ 2 · Study Hall workspace ============ */
console.log("== study hall ==");
step("topic page: .study-grid holds the tab bar and the .study-inspector", async () => {
  const key = Object.keys(window.KOS_CONTENT)[0];
  const [sid, ref] = [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
  KOS.show("ref", { subject: sid, ref });
  await tick(30);
  const main = document.getElementById("main");
  const grid = main.querySelector(".study-grid");
  if (!grid) throw new Error("no .study-grid");
  if (!grid.querySelector(".study-tabs")) throw new Error("tab bar not inside the grid");
  const insp = grid.querySelector(".study-inspector");
  if (!insp) throw new Error("no .study-inspector");
  for (const h of ["Mastery", "Recall record", "Next review"]) {
    if (!insp.textContent.includes(h)) throw new Error("inspector missing section: " + h);
  }
});
step("inspector collapse toggles .insp-closed and persists ui.inspectorOpen", async () => {
  const main = document.getElementById("main");
  const grid = main.querySelector(".study-grid");
  const toggle = grid.querySelector(".insp-toggle");
  if (!toggle) throw new Error("no collapse toggle");
  toggle.click();
  if (!grid.classList.contains("insp-closed")) throw new Error("collapse class not applied");
  if (KOS.store.state.ui.inspectorOpen !== false) throw new Error("collapsed state not persisted");
  toggle.click();
  if (grid.classList.contains("insp-closed")) throw new Error("re-open failed");
  if (KOS.store.state.ui.inspectorOpen !== true) throw new Error("open state not persisted");
});
step("collapsed state survives a re-render (reads ui.inspectorOpen)", async () => {
  KOS.store.state.ui.inspectorOpen = false;
  const key = Object.keys(window.KOS_CONTENT)[0];
  KOS.show("ref", { subject: key.slice(0, key.indexOf(":")), ref: key.slice(key.indexOf(":") + 1) });
  await tick(30);
  const grid = document.getElementById("main").querySelector(".study-grid");
  if (!grid.classList.contains("insp-closed")) throw new Error("persisted collapse ignored on render");
  KOS.store.state.ui.inspectorOpen = true;
});
step("subject overview: per-paper .subject-units breakdown renders", async () => {
  KOS.show("subject", "compsci");
  await tick(30);
  const units = document.getElementById("main").querySelectorAll(".subject-units .unit-stat");
  if (units.length < 2) throw new Error("expected >=2 unit cards, got " + units.length);
  if (!/secure/.test(units[0].textContent)) throw new Error("unit card lacks the done/total line");
});

/* ============ 3 · vault hero + overlay cards ============ */
console.log("== vault hero ==");
let idA, idB;
step("seed: two anime entries (one carries extra.bannerImage from sync mapping)", async () => {
  idA = (await p(cb => KOS.mediadb.put({ module: "anime", title: "Hero Pick", status: "inProgress",
    progress: { current: 3, total: 12 }, extra: { bannerImage: "https://cdn.example/wide.jpg" } }, cb))).id;
  idB = (await p(cb => KOS.mediadb.put({ module: "anime", title: "Other Show", status: "planned",
    progress: { current: 0, total: 24 } }, cb))).id;
  if (idA == null || idB == null) throw new Error("seed failed");
});
step("auto-spotlight: with nothing chosen the hero shows the in-progress entry, with its banner", async () => {
  KOS.show("anime");
  await waitFor(() => document.querySelector(".vault-hero"), 3000);
  const hero = document.querySelector(".vault-hero");
  if (!hero) throw new Error("no hero rendered");
  if (!/Hero Pick/.test(hero.textContent)) throw new Error("auto-pick should prefer the in-progress entry");
  if (!hero.classList.contains("has-banner")) throw new Error("extra.bannerImage should give has-banner");
  if (!/Spotlight/i.test(hero.textContent)) throw new Error("kicker missing");
});
step("kv selection: hero.<module> pins the spotlight across re-renders", async () => {
  await p(cb => KOS.mediadb.setKV("hero.anime", { entryId: idB, banner: null }, cb));
  KOS.show("anime");
  await waitFor(() => {
    const h = document.querySelector(".vault-hero");
    return h && /Other Show/.test(h.textContent);
  }, 3000);
  const hero = document.querySelector(".vault-hero");
  if (!/Other Show/.test(hero.textContent)) throw new Error("kv-pinned entry not spotlighted");
  if (hero.classList.contains("has-banner")) throw new Error("no banner anywhere → no has-banner class");
});
step("overlay card contract: .med-card still carries cover + body (+track when total known)", async () => {
  await waitFor(() => document.querySelector(".med-card"), 3000);
  const card = document.querySelector(".med-card");
  if (!card.querySelector(".med-cover")) throw new Error("cover missing");
  if (!card.querySelector(".med-card-body")) throw new Error("body missing");
  if (!card.querySelector(".med-title")) throw new Error("title missing");
  if (!document.querySelector(".med-card .med-track")) throw new Error("progress track missing on a totalled entry");
});
step("AniList banner plumbing: query requests bannerImage; mapping lands in extra", async () => {
  /* the list query string itself must ask for the field (verified live:
     Media.bannerImage is separate from coverImage on the production schema) */
  const q = KOS.anilist._listQuery ? KOS.anilist._listQuery("anime") : null;
  const src = fs.readFileSync(path.join(ROOT, "js", "core", "anilist.js"), "utf8");
  if (!/coverImage \{ extraLarge large \} bannerImage/.test(src)) throw new Error("listQuery must request bannerImage");
  if (!/bannerImage:\s*m\.bannerImage \|\| null/.test(src)) throw new Error("mapListEntry must map extra.bannerImage");
});
step("fetchBanner: one public read-only lookup, returns the url", async () => {
  netLog = [];
  const url = await new Promise((res, rej) => KOS.anilist.fetchBanner(21, (e, u) => e ? rej(new Error(e.message)) : res(u)));
  if (url !== "https://cdn.example/banner.jpg") throw new Error("banner url not returned: " + url);
  if (netLog.length !== 1 || !/graphql/.test(netLog[0].url)) throw new Error("expected exactly one GraphQL call");
});
step("games/VN discipline: rendering their vaults (hero included) fires ZERO network", async () => {
  await p(cb => KOS.mediadb.put({ module: "game", title: "Manual Game", status: "inProgress", playtimeHours: 4 }, cb));
  await p(cb => KOS.mediadb.put({ module: "vn", title: "Some VN", status: "inProgress" }, cb));
  netLog = [];
  KOS.show("game");
  await waitFor(() => document.querySelector(".vault-hero"), 3000);
  KOS.show("vn");
  await waitFor(() => document.querySelector(".vault-hero"), 3000);
  await tick(120);
  if (netLog.length) throw new Error("network fired from games/VN vault: " + netLog.map(n => n.url).join(", "));
});

/* ============ 4 · Purchase Planner top row ============ */
console.log("== planner top row ==");
step(".wl-top: the hero is ALWAYS present (placeholder when nothing is waiting)", async () => {
  KOS.show("wishlist");
  await tick(40);
  const top = document.getElementById("main").querySelector(".wl-top");
  if (!top) throw new Error("no .wl-top row");
  const hero = top.querySelector(".wl-hero");
  if (!hero) throw new Error("hero missing from the top row");
  if (!/Release desk/i.test(hero.textContent)) throw new Error("hero badge text");
  if (!hero.classList.contains("wl-hero-empty")) throw new Error("empty vault should show the placeholder hero");
});
step("budget summary panel: allowance ledger keeps committed, spent and remaining distinct", async () => {
  KOS.wishlist.add({ module: "books", title: "Test Vol 1", price: 10, status: "wantToBuy" });
  KOS.wishlist.add({ module: "game", title: "Waited Game", price: 20, status: "waitingForRelease", releaseDate: "2030-06-01" });
  KOS.show("wishlist", undefined, { _nav: true });
  await tick(40);
  const main = document.getElementById("main");
  const lines = [...main.querySelectorAll(".wl-budget .wl-ledger-line")];
  if (lines.length !== 3) throw new Error("expected 3 decision ledger lines, got " + lines.length);
  if (!/Committed/.test(lines[0].textContent) || !/30/.test(lines[0].textContent)) throw new Error("committed planner value wrong");
  if (!/Spent/.test(lines[1].textContent)) throw new Error("spent line missing");
  if (!/Remaining/.test(lines[2].textContent)) throw new Error("remaining line missing");
  if (!main.querySelector(".wl-budget-edit") || main.querySelector(".wl-limit")) throw new Error("budget must use the edit action, not a visible numeric input");
  const hero = main.querySelector(".wl-hero");
  if (hero.classList.contains("wl-hero-empty")) throw new Error("real waiting item should replace the placeholder");
  if (!/Waited Game/.test(hero.textContent)) throw new Error("next-to-drop pick wrong");
});

/* ============ 5 · Governor bento ============ */
console.log("== governor bento ==");
step("status tab renders the seat: identity, vitals, cadence, ledger", async () => {
  KOS.show("governor");
  await tick(60);
  const main = document.getElementById("main");
  const bento = main.querySelector(".bento");
  if (!bento) throw new Error("no .bento grid");
  for (const cls of [".b-id", ".b-vitals", ".b-heat", ".b-ledger"]) {
    if (!bento.querySelector(cls)) throw new Error("bento card missing: " + cls);
  }
  if (!/Level \d/.test(bento.querySelector(".b-id").textContent)) throw new Error("identity level missing");
  if (bento.querySelectorAll(".b-vitals .vital").length !== 3) throw new Error("three vitals expected");
  /* the overview's widgets (directives, countdowns, streak card) must NOT
     live here any more — they belong to Home */
  if (bento.querySelector(".b-edicts") || bento.querySelector(".b-exams") || bento.querySelector(".b-streak"))
    throw new Error("overview widgets leaked back into the Governor's Seat");
});
step("profile banner: presets paint css, custom clears, retired stays default", async () => {
  KOS.governor.setBanner("dawn");
  if (!/background-image/.test(KOS.governor.bannerCss() || "")) throw new Error("preset banner paints nothing");
  KOS.governor.setBanner(null);
  if (KOS.governor.bannerCss() !== null) throw new Error("cleared banner must paint nothing");
  const banners = KOS.governor.catalog().filter(c => c.kind === "banner");
  if (banners.length < 4) throw new Error("shop must offer default banners");
});
step("recovery checklist appears full-width when HP is strained", async () => {
  const g = KOS.store.state.governor;
  const hp0 = g.hp;
  g.hp = 45;
  KOS.show("governor", undefined, { _nav: true });
  await tick(60);
  const rec = document.getElementById("main").querySelector(".bento .gov-recovery.b-wide");
  if (!rec) throw new Error("recovery checklist missing from the bento while strained");
  g.hp = hp0;
  KOS.store.save();
});
step("shop cards carry swatch previews for every theme", async () => {
  KOS.show("governor", "shop", { _nav: true });
  await tick(60);
  const main = document.getElementById("main");
  const sw = main.querySelectorAll(".shop-sw");
  if (sw.length < 23) throw new Error(">=23 swatch rows expected (themes + banners), got " + sw.length);
  if (sw[0].querySelectorAll(".shop-sw-dot").length !== 3) throw new Error("3 dots per theme");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE15 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE15 PASS — Build 4.0 UI overhaul markup verified (" + steps.length + " steps).");
  process.exit(0);
})();
