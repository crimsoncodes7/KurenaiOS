/* Kurenai OS — smoke47.test.js
   Category 7 Phase G: final visual consistency and release polish.

   This suite pins the small contracts that are easy to lose in a future
   content or responsive pass: honest low-data summaries, one EmptyState
   grammar, the Gold balance without a progress metaphor, readable chart
   labels, and deliberate compact tab compositions.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke47.test.js                                           */
const { JSDOM } = require("jsdom");
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
const fs = require("fs");
const path = require("path");
const { readCss, pending } = require("./lib/css");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const css = readCss();

const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
const errors = [];
const noop = () => {};
window.addEventListener("error", e => errors.push("window error: " + e.message));
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true;
window.fetch = () => Promise.reject(new Error("network disabled in smoke47"));
window.matchMedia = q => ({ matches: false, media: q, addListener: noop, removeListener: noop,
  addEventListener: noop, removeEventListener: noop });
window.IntersectionObserver = function () { return { observe: noop, unobserve: noop, disconnect: noop }; };
window.ResizeObserver = function () { return { observe: noop, unobserve: noop, disconnect: noop }; };
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : noop, set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;

for (const m of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(read(m[1])); }
  catch (e) { errors.push("LOAD FAIL " + m[1] + ": " + e.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();

const main = () => document.getElementById("main");
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
async function waitFor(cond, ms) {
  const end = Date.now() + (ms || 4000);
  while (Date.now() < end) { if (cond()) return true; await tick(20); }
  return cond();
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const steps = [];
const step = (name, fn) => steps.push([name, fn]);

console.log("== A · honest low-data composition ==");

step("Card Stats keeps one useful scope figure and one shared low-data state", () => {
  KOS.show("cardstats");
  const strip = main().querySelector("[data-ui~='review.stats-strip']");
  assert(strip, "Card Stats lost its page-specific responsive metric grid");
  assert(strip.querySelectorAll("[data-ui~='ui.stat']").length === 1,
    "a fresh Card Stats view renders zero/em-dash tiles again");
  assert(main().querySelector("[data-ui~='review.stats-empty'][data-ui~='ui.empty'][data-state~='compact']"),
    "Card Stats does not use the compact EmptyState contract");
  assert(!main().querySelector("[data-ui~='chart.chart']"), "Card Stats drew charts without review evidence");
});

step("Card Stats never presents one review as a trend", () => {
  const first = KOS.srs.allCards()[0];
  KOS.srs.rate(first.key, 2);
  KOS.show("cardstats");
  assert(main().querySelector("[data-ui~='review.stats-lowdata']"), "one review is not identified as low data");
  assert(!main().querySelector("[data-ui~='chart.chart']"), "one review produced a dashboard of charts");
});

step("Exams & Papers collapses an empty summary instead of printing four zero tiles", () => {
  KOS.show("tracker");
  assert(main().querySelector("[data-ui~='tracker.empty'][data-ui~='ui.empty'][data-state~='compact']"), "tracker empty state is bespoke");
  assert(!main().querySelector("[data-ui~='tracker.strip']"), "tracker prints a zero summary before any record exists");
});

step("Goals suppresses the whole metric strip when every summary count is zero", async () => {
  KOS.show("goals");
  assert(await waitFor(() => main().querySelector("[data-ui~='goal.overview']")), "Goals did not render");
  assert(main().querySelector("[data-ui~='goal.overview'][data-ui~='goal.no-metrics']"), "zero Goals summary is not marked compact");
  assert(!main().querySelector("[data-ui~='goal.metric']"), "Goals restored a zero-value summary tile");
  assert(main().querySelector("[data-ui~='goal.empty'][data-ui~='ui.empty'][data-state~='compact']"), "Goals empty tab bypasses EmptyState");
});

console.log("== B · one empty-state grammar ==");

step("Personal Deck uses the shared compact absence treatment", () => {
  KOS.show("personaldeck");
  assert(main().querySelector("[data-ui~='fc.empty'][data-ui~='ui.empty'][data-state~='compact']"),
    "the empty deck is still a lone paragraph");
});

step("Seasonal uses a compact state with both existing next actions", async () => {
  KOS.show("seasonal");
  assert(await waitFor(() => main().querySelector("[data-ui~='anime.season-empty']")), "Seasonal did not render its empty state");
  const empty = main().querySelector("[data-ui~='anime.season-empty'][data-ui~='ui.empty'][data-state~='compact']");
  assert(empty, "Seasonal still reserves a full med-empty card");
  assert(empty.querySelectorAll("button").length === 2, "Seasonal lost Sync or Find new");
});

step("provider profile guidance says where the token lives", () => {
  const ani = read("js/modules/aniprofile.js"), vn = read("js/modules/vndbprofile.js");
  assert(/token stays in this browser on this device/.test(ani), "AniList token guidance is incomplete");
  assert(/token stays in this browser on this device/.test(vn), "VNDB token guidance is incomplete");
  assert(/KOS\.ui\.emptyState/.test(ani) && /KOS\.ui\.emptyState/.test(vn),
    "a signed-out provider profile bypasses EmptyState");
});

console.log("== C · numbers, charts and typography ==");

step("Gold is a locale-formatted balance without a progress bar", () => {
  KOS.show("governor");
  const gold = main().querySelector("[data-ui~='gov.stat'][data-kind='gold']");
  assert(gold, "Governor Gold instrument missing");
  assert(gold.matches('[data-state~="no-meter"]'), "Gold is not marked as a balance-only instrument");
  assert(!gold.querySelector("[data-ui~='gov.vital-bar']"), "Gold still appears as a progress bar");
  assert(gold.querySelector("[data-ui~='gov.vital-v']").textContent.includes(KOS.ui.num(KOS.governor.profile().gold)),
    "Gold bypasses the shared number formatter");
});

step("Gold Shop omits zero affordability and em-dash completion facts", () => {
  KOS.show("governor", "shop");
  const copy = main().querySelector("[data-ui~='gov.treasury-facts']").textContent;
  assert(!/0\s*affordable now|—/.test(copy), "Gold Shop restored a zero/em-dash treasury fact: " + copy);
  assert(/next:|all wares owned/.test(copy), "Gold Shop gives no useful next state");
});

step("every shared chart label keeps the 11px floor", () => {
  const charts = read("js/core/charts.js");
  const sizes = [...charts.matchAll(/"font-size":\s*(?:String\(FONT\)|"([0-9.]+)")/g)]
    .map(m => m[1] == null ? 11 : Number(m[1]));
  assert(sizes.length > 8, "chart label scan found too few labels");
  assert(!sizes.some(n => n < 11), "shared chart source contains a label below 11px: " + sizes.filter(n => n < 11));
});

/* UI rebuild M2: the "final polish block" step listed legacy selectors
   (.stat-card .k, .cal-ev, .gstat-k …) inside the deleted stylesheet. Its
   requirement — no visible text under 11px (invariant 63) — outlives it,
   so it is stated for the whole stylesheet instead: whatever the rebuild
   names things, nothing may set a smaller font size. */
step("no stylesheet sets text below the 11px floor", () => {
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");
  /* 0 is a deliberate "hide the text node", not a size */
  const small = n => n > 0 && n < 11;
  const px = [...rules.matchAll(/font-size:\s*([\d.]+)px/g)].map(m => +m[1]).filter(small);
  const rem = [...rules.matchAll(/font-size:\s*([\d.]+)rem/g)].map(m => +m[1]).filter(n => small(n * 16));
  const tokens = [...rules.matchAll(/--(?:font|text|fs)[\w-]*:\s*([\d.]+)(px|rem)\b/g)]
    .map(m => (m[2] === "rem" ? +m[1] * 16 : +m[1])).filter(small);
  assert(!px.length && !rem.length && !tokens.length,
    "text below the 11px floor: " + px.map(n => n + "px").concat(rem.map(n => n + "rem"), tokens.map(n => n + "px (token)")).join(", "));
});

step("surface elevation derives from the active background tokens", () => {
  if (pending("tokens", "--shadow-ink and the --elev-* scale (invariant 79)")) return;
  /* M3 re-point: the ink derives from each theme's own darkest neutral
     (--shadow-base), and the scale is --elev-1..4 */
  assert(/--shadow-ink:\s*color-mix\([^;]*var\(--shadow-base\)/.test(css), "shadow ink is not derived from a theme token");
  /* Graphite is the one designed theme: its shadow base is its own deepest
     tone, which a later theme overrides like any other colour role */
  assert(/--shadow-base:\s*oklch\(0\.1\d* /.test(css), "the shadow base is not the theme's deepest tone");
  [1, 2, 3, 4].forEach(n => assert(new RegExp("--elev-" + n + ":[^;]*var\\(--shadow-ink\\)").test(css),
    "--elev-" + n + " bypasses the theme-derived shadow ink"));
  /* the Assistant drawer's "no literal shadow" is general now: smoke55
     bans colour literals outside the tokens and themes layers */
});

console.log("== D · deliberate compact controls ==");

/* UI rebuild M2: "Card Stats uses an intrinsic grid" pinned the legacy
   .cardstats-stat-strip rule; no bespoke breakpoint is smoke42/smoke55's
   stylesheet-wide rule. */
/* UI rebuild M2: "phone Governor and tracker tab groups have intentional
   equal columns" pinned rules of the deleted "Category 7 · Phase G" block. */
/* UI rebuild M2: "Shrine missing art and its hall-note action retain
   branded visual treatment" pinned .shrine-note-btn/.shrine-feature rules
   of the deleted stylesheet; the Shrine is rebuilt in M10. */
step("Governor and Shrine remaining empty surfaces use the shared primitive", () => {
  assert(/KOS\.ui\.emptyState/.test(read("js/modules/governor-ui.js")), "Governor keeps a bespoke absence panel");
  assert(/className:\s*"shrine-empty"/.test(read("js/modules/shrine.js")), "Shrine empty Hall bypasses EmptyState");
});

step("the compact reminder hint keeps the existing search control readable", () => {
  assert(/placeholder:\s*"Search reminders…"/.test(read("js/modules/reminders.js")),
    "the phone reminder placeholder is crowded again");
});

step("the release cache version is deliberate and matches the recorded baseline", () => {
  // Invariant 38 requires VERSION to be bumped for every asset deployment, so
  // pinning one literal here would fail on each release. What must hold is that
  // the shipped version is deliberate and is the one CLAUDE.md records, so the
  // shell cache can never quietly go stale or drift from the documentation.
  const m = /VERSION\s*=\s*"([^"]+)"/.exec(read("sw.js"));
  assert(m && m[1].trim(), "sw.js has no release cache VERSION");
  const doc = /Service-worker version:\s*`([^`]+)`/.exec(read("CLAUDE.md"));
  assert(doc, "CLAUDE.md no longer records the service-worker version");
  assert(doc[1] === m[1],
    "sw.js VERSION (" + m[1] + ") and the CLAUDE.md baseline (" + doc[1] + ") disagree");
});

(async () => {
  let passed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok ", name); passed++; }
    catch (e) { console.error("  FAIL", name + "\n      " + e.message); }
  }
  if (errors.length) errors.forEach(e => console.error("  LOAD", e));
  const failed = steps.length - passed + errors.length;
  if (failed) {
    console.error(`\nSMOKE47 FAIL — ${passed}/${steps.length} steps passed; ${failed} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log(`\nSMOKE47 PASS — Category 7 Phase G visual consistency verified (${passed} steps).`);
  }
  dom.window.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
