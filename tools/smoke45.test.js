/* Kurenai OS — smoke45.test.js
   Category 7 Phase E — responsive/mobile shell contracts.

   Pins the mobile information hierarchy without taking ownership away from
   routing/search modules: canonical rail buttons are reused, the one search
   node is moved and restored, compact subnav keeps its nav landmark, and
   tall filter rails disclose through the Dialog primitive. It also defends
   the Focus min-content repair, phone Calendar composition and the single
   safe-area clearance contract.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke45.test.js                                      */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "css/main.css"), "utf8");
const cssRules = css.replace(/\/\*[\s\S]*?\*\//g, "");
const src = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const shellSrc = src("js/modules/mobile-shell.js");
const calendarSrc = src("js/modules/calendar.js");
const auditSrc = src("tools/responsive_audit.mjs");
const phoneAuditSrc = src("tools/phone_overflow.mjs");

const dom = new JSDOM(html, {
  url: "http://localhost/index.html",
  runScripts: "outside-only",
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;
const errors = [];
const noop = () => {};
window.addEventListener("error", e => errors.push("window error: " + e.message));
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true;
window.__kosAutoConfirm = true;
window.fetch = () => Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
  json: () => Promise.resolve({}), text: () => Promise.resolve("") });
const mediaQueries = new Map();
window.matchMedia = query => {
  if (mediaQueries.has(query)) return mediaQueries.get(query);
  const listeners = new Set();
  const mql = {
    media: query,
    matches: /max-width:\s*(700|860)px/.test(query),
    addListener(fn) { listeners.add(fn); },
    removeListener(fn) { listeners.delete(fn); },
    addEventListener(type, fn) { if (type === "change") listeners.add(fn); },
    removeEventListener(type, fn) { if (type === "change") listeners.delete(fn); },
    setMatches(next) {
      if (this.matches === next) return;
      this.matches = next;
      listeners.forEach(fn => fn({ matches: next, media: query }));
    }
  };
  mediaQueries.set(query, mql);
  return mql;
};
window.IntersectionObserver = function () {
  return { observe: noop, unobserve: noop, disconnect: noop };
};
const ctxStub = new Proxy({}, {
  get: (target, key) => key === "measureText" ? () => ({ width: 10 }) : noop,
  set: () => true
});
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

for (const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(src(match[1])); }
  catch (error) { errors.push("LOAD FAIL " + match[1] + ": " + error.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const click = node => node.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
const key = (name, target) => (target || document).dispatchEvent(
  new window.KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true })
);
const tick = ms => new Promise(resolve => setTimeout(resolve, ms || 0));
function assert(condition, message) { if (!condition) throw new Error(message); }
const steps = [];
const step = (name, fn) => steps.push([name, fn]);

console.log("== E1: Focus reflows instead of clipping ==");

step("the compact Focus track can shrink below a long assignment option", () => {
  assert(/@media \(max-width: 1080px\) \{ \.fx-setup \{ grid-template-columns: minmax\(0, 1fr\)/.test(css),
    "compact .fx-setup still has an automatic min-content track");
  assert(/\.fx-link-row \{ display: grid; grid-template-columns: minmax\(0, 1fr\)/.test(css),
    "the phone links did not become a single shrinkable column");
  assert(/\.fx-modes \{ grid-template-columns: minmax\(0, 1fr\)/.test(css),
    "the phone mode cards still compete side by side");
});

step("Focus phone controls and the Start action use the full form width", () => {
  assert(/\.fx-link-row > \.cal-field, \.fx-link-row \.status-sel \{ width: 100%; min-width: 0; \}/.test(css),
    "linked Focus selects can still establish an off-screen width");
  assert(/\.fx-obj-field \{ max-width: none; \}/.test(css), "the objective keeps its desktop cap");
  assert(/\.fx-start \{ width: 100%; \}/.test(css), "Start is not the clear phone CTA");
  assert(/body\.fx-minimised \.fx-dock \{[\s\S]*display: grid;[\s\S]*grid-template-columns: auto auto auto/.test(css),
    "the populated minimised dock still competes in one shrinking row");
  assert(/\.fx-dock-ctl \.mini-btn \{ min-width: 44px; min-height: 44px; \}/.test(css),
    "the minimised phone controls cannot retain coarse-pointer targets");
  assert(/body\.fx-minimised #cols \{[\s\S]*padding-top: calc\(104px \+ env\(safe-area-inset-top\)\)/.test(css),
    "page content does not clear the two-row minimised dock");
});

console.log("== E2/E3: secondary and primary navigation ==");

step("the Phase E module loads before main binds the canonical rail", () => {
  const shellAt = html.indexOf('src="js/modules/mobile-shell.js"');
  const mainAt = html.indexOf('src="js/main.js"');
  assert(shellAt !== -1 && shellAt < mainAt, "mobile-shell.js is missing or loads after main.js");
  assert($$("#rail > .rail-item").length === 7, "a canonical desktop rail destination was removed");
});

step("phone navigation is four primary destinations plus More, with no cloned routes", () => {
  const more = $("#mobile-more");
  assert(more, "the More destination was not mounted");
  assert(!more.classList.contains("rail-item"), "main.js will incorrectly bind More as a canonical rail route");
  assert($("[data-section=productivity] .lbl").textContent === "Focus",
    "the phone bar still tries to squeeze the word Productivity");
  ["governor", "assistant", "system"].forEach(section => {
    assert(new RegExp('data-section="' + section + '"').test(html), section + " was hidden by deletion");
  });
  assert(/\.mobile-shell-ready #rail \.rail-item\[data-section="governor"\],[\s\S]*\.mobile-shell-ready #rail \.rail-item\[data-section="assistant"\],[\s\S]*\.mobile-shell-ready #rail \.rail-item\[data-section="system"\] \{ display: none/.test(css),
    "the three low-frequency destinations are not presentation-only hidden at the phone tier");
  assert(/\.mobile-shell-ready #searchbox \{ display: none; \}/.test(css) &&
    /\.mobile-shell-ready \.mobile-search-trigger \{/.test(css) &&
    /\.mobile-shell-ready #rail \.mobile-more \{ display: flex/.test(css),
    "a failed mobile-shell load can hide canonical search/nav without mounting replacements");
});

step("More is a focus-managed surface over the three hidden original buttons", async () => {
  const more = $("#mobile-more");
  click(more);
  const sheet = $(".mobile-nav-sheet");
  assert(sheet && sheet.getAttribute("role") === "dialog", "More did not use openDialog");
  assert(document.body.classList.contains("modal-open"), "More does not lock background scroll");
  const labels = $$(".mobile-sheet-destination b").map(node => node.textContent);
  assert(labels.join("|") === "Governor|Assistant|Archive", "More routes are " + labels.join(", "));
  assert(sheet.contains(document.activeElement), "focus did not enter More");
  click($(".mobile-sheet-destination"));
  await tick();
  assert(KOS.currentNav().viewId === "governor", "More bypassed the Governor's canonical landing");
  assert(!$(".mobile-nav-sheet") && !document.body.classList.contains("modal-open"),
    "More did not close after navigation");
  assert(more.classList.contains("active") && more.getAttribute("aria-current") === "page",
    "More does not reflect the current hidden section");
});

step("compact subnav is one declared scroller without changing the nav landmark", async () => {
  KOS.show("subject", "compsci");
  await tick(20);
  const nav = $("#subnav");
  const wrap = nav.parentElement;
  assert(wrap.classList.contains("subnav-scroller") && wrap.dataset.scroller === "true",
    "the compact section strip is an undeclared raw scroller");
  assert(nav.tagName === "NAV" && nav.getAttribute("aria-label") === "Section",
    "the native Section nav landmark was replaced");
  assert(!nav.hasAttribute("role") && !nav.hasAttribute("tabindex"),
    "responsive scrolling overwrote Phase F's navigation seam");
  assert(/flex-wrap: nowrap/.test(css) && /\.subnav-item, \.subnav-scroller \.subnav-sep \{ flex: 0 0 auto/.test(css),
    "the compact strip can still wrap");
  KOS.show("wishlist");
  await tick(20);
  assert($("#subnav .subnav-item.active .lbl").textContent === "Planner",
    "a rebuilt Collection strip lost its active destination");
  assert(/\.sec-head \.sec-title \{ min-width: 0; flex: 1 1 0; \}/.test(css),
    "a long spine title can still orphan its count/arrow onto another flex line");
});

console.log("== E4: one global search, reachable on phones ==");

step("mobile search moves and restores the exact existing searchbox", async () => {
  const trigger = $("#mobile-search-trigger");
  const searchbox = $("#searchbox");
  const originalParent = searchbox.parentNode;
  trigger.focus();
  click(trigger);
  assert($("#searchbox") === searchbox, "mobile search cloned the canonical node");
  assert(searchbox.closest(".mobile-search-sheet"), "the canonical searchbox did not enter the sheet");
  assert(document.activeElement === $("#search"), "the search input was not focused on open");
  assert(trigger.getAttribute("aria-expanded") === "true", "the search trigger does not expose its state");
  key("Escape", document.activeElement);
  await tick();
  assert(searchbox.parentNode === originalParent, "closing search did not restore its topbar position");
  assert(document.activeElement === trigger, "closing search did not restore trigger focus");
  assert(trigger.getAttribute("aria-expanded") === "false", "the search trigger stayed expanded");
});

step("a preserved mobile query repaints and result activation closes before routing", async () => {
  const trigger = $("#mobile-search-trigger");
  click(trigger);
  const input = $("#search");
  input.value = "binary";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert($("#search-results").classList.contains("open") && $("#search-results .sr-item"),
    "the populated canonical result list did not open");
  let dismissOpts = null;
  KOS.hub.dismissSearch = opts => {
    dismissOpts = opts;
    $("#search-results").classList.remove("open");
  };
  key("Escape", input);
  await tick();
  assert(dismissOpts && dismissOpts.preserveQuery === true,
    "closing the presentation bypassed the canonical async/ARIA cancel seam");
  delete KOS.hub.dismissSearch;
  click(trigger);
  await tick(10);
  assert($("#search-results").classList.contains("open") && $("#search-results .sr-item"),
    "reopening search left a preserved query with stale hidden results");
  click($("#search-results .sr-item"));
  assert(!$(".mobile-search-sheet"), "result navigation left a delayed search teardown");
  assert(KOS.currentNav().viewId === "ref", "mobile result activation bypassed canonical search routing");
  assert(/KOS\.mobileShell\.openSearch = openSearch/.test(shellSrc),
    "Phase F has no narrow seam for its canonical shortcut to open the phone presentation");
  assert(/if \(!phone\.matches\) return false;[\s\S]*return true;/.test(shellSrc),
    "the canonical shortcut cannot tell whether phone search handled its request");
});

step("the slash shortcut opens the phone search surface instead of a hidden input", async () => {
  click($("#mobile-more"));
  key("/", document.body);
  assert($(".mobile-nav-sheet") && !$(".mobile-search-sheet"),
    "slash stacked Search over an existing dialog");
  key("Escape", document.activeElement);
  await tick();
  key("/", document.body);
  await tick();
  assert($(".mobile-search-sheet") && document.activeElement === $("#search"),
    "slash focused an invisible topbar input");
  key("Escape", document.activeElement);
});

step("the responsive audit opens a real Computer Science topic", () => {
  assert(/const REF_FIXTURE = \{ subject: "compsci", ref: "4\.2\.1\.3" \}/.test(auditSrc) &&
    /view === "ref" \? JSON\.stringify\(REF_FIXTURE\)/.test(auditSrc),
    "the Ref fixture is mutable profile history or still captures Subject instead");
  assert(/KOS\.store\.state\.ui\.treeClosed = \$\{width <= 860\}/.test(auditSrc),
    "compact Study/Ref screenshots can be replaced by a stale open drawer state");
  assert(/!n\.closest\("\[data-scroller\]"\)/.test(phoneAuditSrc),
    "the phone probe reports declared navigation disclosure as clipped page content");
  assert(/\.n-code pre \{ white-space: pre-wrap; overflow-x: hidden; \}/.test(css) &&
    /\.n-code code \{ white-space: inherit; overflow-wrap: anywhere; word-break: break-word; \}/.test(css),
    "long Ref-page code still establishes a hidden desktop-width inline box on phones");
});

console.log("== E5/E6: safe shell and compact disclosure ==");

step("the viewport and bottom clearance have one safe-area-aware contract", () => {
  assert(/#app \{[^}]*height: 100vh; height: 100dvh/.test(cssRules), "#app lost its vh/dvh fallback pair");
  assert(/--tabbar-h: 64px/.test(css) && /padding-block-end: calc\(var\(--tabbar-h\)[^;]*safe-area-inset-bottom/.test(css),
    "#main does not reserve the bar and home indicator");
  assert(!/#cols\.tree-closed #main\s*\{/.test(cssRules),
    "the retired Spec-spine clearance still double-pads phone pages");
  assert(/\.toast \{ bottom: calc\(var\(--tabbar-h\)[^;]*safe-area-inset-bottom/.test(css),
    "toasts can still render behind the fixed phone bar");
});

step("bottom labels are readable words, never ellipsis", () => {
  const labelRule = css.match(/#rail :is\(\.rail-item, \.mobile-more\) \.lbl \{([^}]*)\}/);
  assert(labelRule, "the shared phone label rule is missing");
  assert(/font-size: 11px/.test(labelRule[1]), "phone nav labels are still miniaturised");
  assert(!/text-overflow|overflow: hidden/.test(labelRule[1]), "phone nav labels still truncate");
});

step("Reminders' tall taxonomy moves into and back out of one dialog", async () => {
  KOS.show("reminders");
  await tick(30);
  const trigger = $(".reminders-disclosure-trigger");
  const side = $(".rem-side");
  const grid = $(".rem-grid");
  assert(trigger && side && side.parentNode === grid, "Reminders was not enhanced for compact disclosure");
  click(trigger);
  assert(side.closest(".mobile-compact-sheet"), "the real Reminders taxonomy did not move into the dialog");
  assert(trigger.getAttribute("aria-expanded") === "true", "the Reminders trigger stayed collapsed");
  key("Escape", document.activeElement);
  await tick();
  assert(side.parentNode === grid, "the Reminders taxonomy was cloned or lost on close");
  assert(trigger.getAttribute("aria-expanded") === "false", "the Reminders trigger stayed expanded");
});

step("all four vaults share the same compact status/list disclosure seam", () => {
  assert(/main\.querySelectorAll\("\.med-layout"\)\.forEach\(enhanceVaultDisclosure\)/.test(shellSrc),
    "vault disclosure is module-specific");
  assert(/\.mobile-shell-ready \.rem-grid > \.rem-side,[\s\S]*\.mobile-shell-ready \.med-layout > \.med-filter-rail \{ display: none; \}/.test(css),
    "compact side rails hide without a successfully mounted disclosure module");
  assert(/slot\.appendChild\(node\)/.test(shellSrc) && /origin\.insertBefore\(node/.test(shellSrc),
    "compact filters are cloned rather than moved and restored");
  assert(shellSrc.indexOf('classList.add("mobile-shell-ready")') > shellSrc.indexOf("syncShell();"),
    "the no-JS fallback is disabled before mobile-shell setup succeeds");
});

console.log("== E7: the phone Calendar discloses instead of miniaturising ==");

step("phone Month is a density overview with every day available in the day sheet", async () => {
  KOS.calendar.addEvent({ title: "A deliberately long mobile calendar title", date: KOS.srs.todayISO(), type: "study" });
  KOS.store.state.ui.calMode = "month";
  KOS.show("calendar");
  await tick();
  const summary = $(".cal-day-summary");
  assert(summary, "phone Month still paints unreadable event-title chips");
  assert(/daySheet\(dISO, onChanged\)/.test(calendarSrc), "the phone density control has no full-detail path");
  click(summary);
  assert($(".cal-day-modal"), "a month's density control did not open the existing day sheet");
  $(".cal-day-modal").closest(".modal-ov").remove();
});

step("phone Week is a seven-day agenda, not seven squeezed time columns", async () => {
  KOS.store.state.ui.calMode = "week";
  KOS.show("calendar");
  await tick();
  assert($(".cal-phone-week"), "the phone still renders the desktop time grid");
  assert($$(".cal-phone-day").length === 7, "the phone agenda lost a day");
  assert(!$(".cal-week"), "desktop Week columns survived in the phone composition");
});

step("a mounted Calendar recomposes across the phone breakpoint in both directions", async () => {
  const phoneMql = mediaQueries.get("(max-width: 700px)");
  assert(phoneMql, "mobile-shell did not subscribe to the sanctioned phone tier");
  phoneMql.setMatches(false);
  await tick(20);
  assert($(".cal-week") && !$(".cal-phone-week"),
    "orientation to tablet left the phone agenda frozen in place");
  phoneMql.setMatches(true);
  await tick(20);
  assert($(".cal-phone-week") && !$(".cal-week"),
    "orientation to phone left the desktop time columns frozen in place");
});

step("Calendar defers orientation redraw until its dialog closes and restores useful focus", async () => {
  const phoneMql = mediaQueries.get("(max-width: 700px)");
  const opener = $(".cal-phone-date");
  opener.focus();
  click(opener);
  assert($(".cal-day-modal"), "the phone Calendar day dialog did not open");
  phoneMql.setMatches(false);
  await tick(20);
  assert($(".cal-day-modal") && $(".cal-phone-week") && !$(".cal-week"),
    "orientation destroyed an open editor or recomposed behind its stale callback");
  key("Escape", document.activeElement);
  await tick(30);
  assert(!$(".cal-day-modal") && $(".cal-week") && !$(".cal-phone-week"),
    "the deferred Calendar composition did not apply after dialog close");
  assert(document.activeElement && document.activeElement.isConnected && document.activeElement !== document.body &&
    (document.activeElement.classList.contains("cw-day") || document.activeElement === $("#main")),
    "deferred Calendar recomposition discarded the dialog's restored focus");
  phoneMql.setMatches(true);
});

step("Calendar Save keeps a connected focus target after a deferred breakpoint crossing", async () => {
  const phoneMql = mediaQueries.get("(max-width: 700px)");
  await tick(20);
  const add = $(".cal-phone-day .mini-btn");
  click(add);
  const editor = $(".cal-ev-modal");
  assert(editor, "the phone Calendar event editor did not open");
  editor.querySelector('input[type="text"]').value = "Orientation focus contract";
  phoneMql.setMatches(false);
  await tick(20);
  assert($(".cal-ev-modal") && $(".cal-phone-week") && !$(".cal-week"),
    "orientation recomposed behind the live event editor");
  click($$(".cal-ev-modal button").find(button => button.textContent.trim() === "Add event"));
  await tick(30);
  assert(!$(".cal-ev-modal") && $(".cal-week") && !$(".cal-phone-week"),
    "saving did not apply the deferred Calendar composition");
  assert(document.activeElement && document.activeElement.isConnected && document.activeElement !== document.body,
    "saving after a deferred breakpoint crossing left focus on the document body");
  phoneMql.setMatches(true);
});

/* ---- run ---- */
(async () => {
  let pass = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); pass++; }
    catch (error) {
      errors.push('STEP "' + name + '": ' + (error.message || error));
      console.log("FAIL  " + name);
    }
  }
  if (errors.length) {
    console.log("\nSMOKE45 FAILURES (" + errors.length + "):");
    errors.forEach(error => console.log("  - " + error));
    process.exit(1);
  }
  console.log("\nSMOKE45 PASS — Category 7 Phase E responsive/mobile contracts verified (" + pass + " steps).");
  process.exit(0);
})();
