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
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const css = read("css/main.css");

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
  const strip = main().querySelector(".cardstats-stat-strip");
  assert(strip, "Card Stats lost its page-specific responsive metric grid");
  assert(strip.querySelectorAll(".stat-card").length === 1,
    "a fresh Card Stats view renders zero/em-dash tiles again");
  assert(main().querySelector(".cardstats-empty.empty-state.compact"),
    "Card Stats does not use the compact EmptyState contract");
  assert(!main().querySelector(".cs-chart"), "Card Stats drew charts without review evidence");
});

step("Card Stats never presents one review as a trend", () => {
  const first = KOS.srs.allCards()[0];
  KOS.srs.rate(first.key, 2);
  KOS.show("cardstats");
  assert(main().querySelector(".cardstats-lowdata"), "one review is not identified as low data");
  assert(!main().querySelector(".cs-chart"), "one review produced a dashboard of charts");
});

step("Exams & Papers collapses an empty summary instead of printing four zero tiles", () => {
  KOS.show("tracker");
  assert(main().querySelector(".tracker-empty.empty-state.compact"), "tracker empty state is bespoke");
  assert(!main().querySelector(".tracker-stat-strip"), "tracker prints a zero summary before any record exists");
});

step("Goals suppresses the whole metric strip when every summary count is zero", async () => {
  KOS.show("goals");
  assert(await waitFor(() => main().querySelector(".goal-overview")), "Goals did not render");
  assert(main().querySelector(".goal-overview.no-metrics"), "zero Goals summary is not marked compact");
  assert(!main().querySelector(".goal-summary-metric"), "Goals restored a zero-value summary tile");
  assert(main().querySelector(".goal-empty-v2.empty-state.compact"), "Goals empty tab bypasses EmptyState");
});

console.log("== B · one empty-state grammar ==");

step("Personal Deck uses the shared compact absence treatment", () => {
  KOS.show("personaldeck");
  assert(main().querySelector(".flashcards-empty.empty-state.compact"),
    "the empty deck is still a lone paragraph");
});

step("Seasonal uses a compact state with both existing next actions", async () => {
  KOS.show("seasonal");
  assert(await waitFor(() => main().querySelector(".seasonal-empty")), "Seasonal did not render its empty state");
  const empty = main().querySelector(".seasonal-empty.empty-state.compact");
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
  const gold = main().querySelector(".gstat-gold");
  assert(gold, "Governor Gold instrument missing");
  assert(gold.classList.contains("no-meter"), "Gold is not marked as a balance-only instrument");
  assert(!gold.querySelector(".gstat-bar"), "Gold still appears as a progress bar");
  assert(gold.querySelector(".gstat-v").textContent.includes(KOS.ui.num(KOS.governor.profile().gold)),
    "Gold bypasses the shared number formatter");
});

step("Gold Shop omits zero affordability and em-dash completion facts", () => {
  KOS.show("governor", "shop");
  const copy = main().querySelector(".tre-facts").textContent;
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

step("the final polish block raises visible target microcopy to 11px", () => {
  const block = css.slice(css.indexOf("Category 7 · Phase G"));
  [".stat-card .k", ".goal-summary-metric small", ".cal-ev", ".gstat-k", ".asst-tab-group-label", ".fx-deal h4"]
    .forEach(sel => assert(block.includes(sel), sel + " is not covered by the final type treatment"));
  assert(/\.fx-deal-list li strong[^}]*font-family:\s*var\(--sans\)/s.test(block),
    "Focus reward prose is still forced into mono");
});

step("surface elevation derives from the active background tokens", () => {
  assert(/--shadow-ink:\s*color-mix\([^;]*var\(--bg0\)/.test(css), "shadow ink is not derived from --bg0");
  ["sm", "md", "lg"].forEach(size => assert(new RegExp("--shadow-" + size + ":[^;]*var\\(--shadow-ink\\)").test(css),
    "--shadow-" + size + " bypasses the theme-derived shadow ink"));
  assert(/\.asst-drawer\s*\{\s*box-shadow:\s*var\(--shadow-lg\)/.test(css.slice(css.indexOf("Category 7 · Phase G"))),
    "the raised Assistant drawer keeps a literal shadow");
});

console.log("== D · deliberate compact controls ==");

step("Card Stats uses an intrinsic grid and no bespoke breakpoint", () => {
  assert(/\.cardstats-stat-strip\s*\{[^}]*display:\s*grid[^}]*auto-fit[^}]*minmax/s.test(css),
    "Card Stats is not intrinsically responsive");
});

step("phone Governor and tracker tab groups have intentional equal columns", () => {
  const phase = css.slice(css.indexOf("Category 7 · Phase G"));
  assert(/\.gov-head \.gov-tabs\s*\{[^}]*grid-template-columns:\s*repeat\(2/s.test(phase),
    "Governor can regress to a 3+1 phone wrap");
  assert(/Record type[^}]*grid-template-columns:\s*repeat\(2/s.test(phase),
    "tracker kinds can regress to an uneven phone stack");
});

step("Shrine missing art and its hall-note action retain branded visual treatment", () => {
  const phase = css.slice(css.indexOf("Category 7 · Phase G"));
  assert(/\.shrine-note-btn\s*\{[^}]*wash-brass/s.test(phase), "hall note still reads as plain text");
  assert(/\.shrine-feature:not\(\.has-banner\)[^{]*\{[^}]*radial-gradient/s.test(phase),
    "a missing Shrine cover is still an empty hero");
});

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
