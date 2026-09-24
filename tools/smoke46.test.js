/* Kurenai OS — smoke46.test.js
   Category 7 Phase E — responsive/mobile shell contracts.

   Pins the mobile information hierarchy without taking ownership away from
   routing/search modules: canonical rail buttons are reused, the one search
   node is moved and restored, compact subnav keeps its nav landmark, and
   tall filter rails disclose through the Dialog primitive. It also defends
   the Focus min-content repair, phone Calendar composition and the single
   safe-area clearance contract.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke46.test.js                                      */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const { byName } = require("./lib/ui-query");
const { readCss, pending } = require("./lib/css");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = readCss();
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

/* UI rebuild M2: "the compact Focus track can shrink below a long
   assignment option" pinned .fx-setup/.fx-link-row/.fx-modes rules of the
   deleted stylesheet; Focus is rebuilt in M8. */
/* UI rebuild M2: "Focus phone controls and the Start action use the full
   form width" pinned .fx-* and body.fx-minimised rules; the 44px phone
   targets survive as the components layer's coarse-pointer contract
   (smoke45) and the dock clearance as the layout layer's (below). */
console.log("== E2/E3: secondary and primary navigation ==");

step("the Phase E module loads before main binds the canonical rail", () => {
  const shellAt = html.indexOf('src="js/modules/mobile-shell.js"');
  const mainAt = html.indexOf('src="js/main.js"');
  assert(shellAt !== -1 && shellAt < mainAt, "mobile-shell.js is missing or loads after main.js");
  assert($$("#rail > [data-ui~='shell.rail-item']").length === 7, "a canonical desktop rail destination was removed");
});

step("phone navigation is four primary destinations plus More, with no cloned routes", () => {
  const more = $("#mobile-more");
  assert(more, "the More destination was not mounted");
  assert(!more.matches('[data-ui~="shell.rail-item"]'), "main.js will incorrectly bind More as a canonical rail route");
  assert($("[data-section=productivity] [data-ui~='shell.rail-label']").textContent === "Focus",
    "the phone bar still tries to squeeze the word Productivity");
  ["governor", "assistant", "system"].forEach(section => {
    assert(new RegExp('data-section="' + section + '"').test(html), section + " was hidden by deletion");
  });
  /* M2, invariant 72 without the legacy classes: the enhanced phone shell
     is <html data-shell="ready">, and ANY rule that hides the canonical
     search or a rail destination must be gated on it, so a failed
     mobile-shell load leaves the unenhanced controls usable */
  if (pending("layout", "phone-tier hiding is gated on data-shell=ready")) return;
  assert(/\[data-shell="ready"\]/.test(css), "nothing in the stylesheet waits for the enhanced shell");
  const hides = (css.match(/[^{}]*\{[^{}]*display:\s*none[^{}]*\}/g) || [])
    .map(r => r.split("{")[0]).filter(sel => /#searchbox|#rail\b[^,]*data-section/.test(sel));
  assert(hides.length, "the three low-frequency destinations are not presentation-only hidden at the phone tier");
  assert(hides.every(sel => sel.split(",").every(part => !/#searchbox|data-section/.test(part) || /\[data-shell="ready"\]/.test(part))),
    "a failed mobile-shell load can hide canonical search/nav without mounting replacements: " + hides.join(" | "));
});

step("More is a focus-managed surface over the three hidden original buttons", async () => {
  const more = $("#mobile-more");
  click(more);
  const sheet = $("[data-ui~='shell.mobile-nav-sheet']");
  assert(sheet && sheet.getAttribute("role") === "dialog", "More did not use openDialog");
  assert(document.documentElement.hasAttribute("data-scroll-lock"), "More does not lock background scroll");
  const labels = $$("[data-ui~='shell.mobile-sheet-destination'] b").map(node => node.textContent);
  assert(labels.join("|") === "Governor|Assistant|Archive", "More routes are " + labels.join(", "));
  assert(sheet.contains(document.activeElement), "focus did not enter More");
  click($("[data-ui~='shell.mobile-sheet-destination']"));
  await tick();
  assert(KOS.currentNav().viewId === "governor", "More bypassed the Governor's canonical landing");
  assert(!$("[data-ui~='shell.mobile-nav-sheet']") && !document.documentElement.hasAttribute("data-scroll-lock"),
    "More did not close after navigation");
  assert(more.matches('[data-state~="active"]') && more.getAttribute("aria-current") === "page",
    "More does not reflect the current hidden section");
});

step("compact subnav is one declared scroller without changing the nav landmark", async () => {
  KOS.show("subject", "compsci");
  await tick(20);
  const nav = $("#subnav");
  const wrap = nav.parentElement;
  assert(wrap.matches('[data-ui~="shell.subnav-scroller"]') && wrap.dataset.scroller === "true",
    "the compact section strip is an undeclared raw scroller");
  assert(nav.tagName === "NAV" && nav.getAttribute("aria-label") === "Section",
    "the native Section nav landmark was replaced");
  assert(!nav.hasAttribute("role") && !nav.hasAttribute("tabindex"),
    "responsive scrolling overwrote Phase F's navigation seam");
  KOS.show("wishlist");
  await tick(20);
  assert($("#subnav [data-ui~='shell.subnav-item'][data-state~='active'] [data-ui~='part.text']").textContent === "Planner",
    "a rebuilt Collection strip lost its active destination");
});

console.log("== E4: one global search, reachable on phones ==");

step("the user panel rides the topbar on phones and returns to the rail above 700px", () => {
  const foot = $("#hud").closest("[data-ui~='shell.rail-foot']");
  assert(foot && foot.parentNode === $("[data-ui~='shell.header-actions']"), "on a phone the ONE #hud node must sit in .topbar-right (not float fixed over the page)");
  const phone = window.matchMedia("(max-width: 700px)");
  phone.setMatches(false);
  assert(foot.parentNode === $("#rail"), "above 700px the panel must return to the rail");
  phone.setMatches(true);
  assert(foot.parentNode === $("[data-ui~='shell.header-actions']"), "crossing back must move it again");
});

step("mobile search moves and restores the exact existing searchbox", async () => {
  const trigger = $("#mobile-search-trigger");
  const searchbox = $("#searchbox");
  const originalParent = searchbox.parentNode;
  trigger.focus();
  click(trigger);
  assert($("#searchbox") === searchbox, "mobile search cloned the canonical node");
  assert(searchbox.closest("[data-ui~='shell.search-sheet']"), "the canonical searchbox did not enter the sheet");
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
  assert($("#search-results").matches('[data-state~="open"]') && $("#search-results [data-ui~='search.result']"),
    "the populated canonical result list did not open");
  let dismissOpts = null;
  /* Phase F supplies a real dismissSearch since the E+F integration, so the
     spy has to WRAP it and put it back — deleting it would strip a live API
     for every step after this one. */
  const realDismiss = KOS.hub.dismissSearch;
  KOS.hub.dismissSearch = opts => {
    dismissOpts = opts;
    if (typeof realDismiss === "function") realDismiss(opts);
    else $("#search-results").classList.remove("open");
  };
  key("Escape", input);
  await tick();
  assert(dismissOpts && dismissOpts.preserveQuery === true,
    "closing the presentation bypassed the canonical async/ARIA cancel seam");
  if (realDismiss) KOS.hub.dismissSearch = realDismiss; else delete KOS.hub.dismissSearch;
  click(trigger);
  await tick(10);
  assert($("#search-results").matches('[data-state~="open"]') && $("#search-results [data-ui~='search.result']"),
    "reopening search left a preserved query with stale hidden results");
  click($("#search-results [data-ui~='search.result']"));
  assert(!$("[data-ui~='shell.search-sheet']"), "result navigation left a delayed search teardown");
  assert(KOS.currentNav().viewId === "ref", "mobile result activation bypassed canonical search routing");
  assert(/KOS\.mobileShell\.openSearch = openSearch/.test(shellSrc),
    "Phase F has no narrow seam for its canonical shortcut to open the phone presentation");
  assert(/if \(!phone\.matches\) return false;[\s\S]*return true;/.test(shellSrc),
    "the canonical shortcut cannot tell whether phone search handled its request");
});

step("the slash shortcut opens the phone search surface instead of a hidden input", async () => {
  click($("#mobile-more"));
  key("/", document.body);
  assert($("[data-ui~='shell.mobile-nav-sheet']") && !$("[data-ui~='shell.search-sheet']"),
    "slash stacked Search over an existing dialog");
  key("Escape", document.activeElement);
  await tick();
  key("/", document.body);
  await tick();
  assert($("[data-ui~='shell.search-sheet']") && document.activeElement === $("#search"),
    "slash focused an invisible topbar input");
  key("Escape", document.activeElement);
});

step("the responsive audit opens a real Computer Science topic", () => {
  /* `viewId` is the RESOLVED view — the audit's loop variable now carries
     pseudo-views (pacing-braid) that resolve to a view plus an argument, so
     the fixture is read off the resolved id. The contract is unchanged: the
     Ref screenshot must be a fixed leaf, never mutable profile history. */
  assert(/const REF_FIXTURE = \{ subject: "compsci", ref: "4\.2\.1\.3" \}/.test(auditSrc) &&
    /viewId === "ref" \? JSON\.stringify\(REF_FIXTURE\)/.test(auditSrc),
    "the Ref fixture is mutable profile history or still captures Subject instead");
  assert(/KOS\.store\.state\.ui\.treeClosed = \$\{width <= 860\}/.test(auditSrc),
    "compact Study/Ref screenshots can be replaced by a stale open drawer state");
  assert(/!n\.closest\("\[data-scroller\]"\)/.test(phoneAuditSrc),
    "the phone probe reports declared navigation disclosure as clipped page content");
});

console.log("== E5/E6: safe shell and compact disclosure ==");

step("the viewport and bottom clearance have one safe-area-aware contract", () => {
  if (!pending("layout", "#app's vh/dvh pair and #main's tab-bar clearance")) {
    assert(/#app \{[^}]*height: 100vh; height: 100dvh/.test(cssRules), "#app lost its vh/dvh fallback pair");
    assert(/--tabbar-h: 64px/.test(css) && /padding-block-end: calc\(var\(--tabbar-h\)[^;]*safe-area-inset-bottom/.test(css),
      "#main does not reserve the bar and home indicator");
  }
  /* M2: the toast is rebuilt in M4/M5; whatever selects it, the components
     layer must lift it over the bar and the home indicator */
  if (!pending("components", "the toast clears the phone tab bar"))
    assert(/bottom:\s*calc\(var\(--tabbar-h\)[^;]*safe-area-inset-bottom/.test(css),
      "toasts can still render behind the fixed phone bar");
});

/* UI rebuild M2: "bottom labels are readable words, never ellipsis" read
   the legacy #rail .rail-item .lbl rule; the 11px floor is stylesheet-wide
   now (smoke47) and the phone bar is rebuilt in M4. */
step("Reminders' tall taxonomy moves into and back out of one dialog", async () => {
  KOS.show("reminders");
  await tick(30);
  const trigger = $("[data-ui~='rem.disclosure-trigger']");
  const side = $("[data-ui~='rem.side']");
  const grid = $("[data-ui~='rem.layout']");
  assert(trigger && side && side.parentNode === grid, "Reminders was not enhanced for compact disclosure");
  click(trigger);
  assert(side.closest("[data-ui~='shell.compact-sheet']"), "the real Reminders taxonomy did not move into the dialog");
  assert(trigger.getAttribute("aria-expanded") === "true", "the Reminders trigger stayed collapsed");
  key("Escape", document.activeElement);
  await tick();
  assert(side.parentNode === grid, "the Reminders taxonomy was cloned or lost on close");
  assert(trigger.getAttribute("aria-expanded") === "false", "the Reminders trigger stayed expanded");
});

step("all four vaults share the same compact status/list disclosure seam", () => {
  /* the one seam: every vault layout, found by its hook, not a module list */
  assert(/main\.querySelectorAll\("\[data-ui~='vault\.layout'\]"\)\.forEach\(enhanceVaultDisclosure\)/.test(shellSrc),
    "vault disclosure is module-specific");
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
  const summary = $("[data-ui~='cal.day-summary']");
  assert(summary, "phone Month still paints unreadable event-title chips");
  assert(/daySheet\(dISO, onChanged\)/.test(calendarSrc), "the phone density control has no full-detail path");
  click(summary);
  assert($("[data-ui~='cal.day-modal']"), "a month's density control did not open the existing day sheet");
  $("[data-ui~='cal.day-modal']").closest("[data-ui~='ui.dialog-overlay']").remove();
});

step("phone Week is a seven-day agenda, not seven squeezed time columns", async () => {
  KOS.store.state.ui.calMode = "week";
  KOS.show("calendar");
  await tick();
  assert($("[data-ui~='cal.phone-week']"), "the phone still renders the desktop time grid");
  assert($$("[data-ui~='cal.phone-day']").length === 7, "the phone agenda lost a day");
  assert(!$("[data-ui~='cal.week']"), "desktop Week columns survived in the phone composition");
});

step("a mounted Calendar recomposes across the phone breakpoint in both directions", async () => {
  const phoneMql = mediaQueries.get("(max-width: 700px)");
  assert(phoneMql, "mobile-shell did not subscribe to the sanctioned phone tier");
  phoneMql.setMatches(false);
  await tick(20);
  assert($("[data-ui~='cal.week']") && !$("[data-ui~='cal.phone-week']"),
    "orientation to tablet left the phone agenda frozen in place");
  phoneMql.setMatches(true);
  await tick(20);
  assert($("[data-ui~='cal.phone-week']") && !$("[data-ui~='cal.week']"),
    "orientation to phone left the desktop time columns frozen in place");
});

step("Calendar defers orientation redraw until its dialog closes and restores useful focus", async () => {
  const phoneMql = mediaQueries.get("(max-width: 700px)");
  const opener = $("[data-ui~='cal.phone-date']");
  opener.focus();
  click(opener);
  assert($("[data-ui~='cal.day-modal']"), "the phone Calendar day dialog did not open");
  phoneMql.setMatches(false);
  await tick(20);
  assert($("[data-ui~='cal.day-modal']") && $("[data-ui~='cal.phone-week']") && !$("[data-ui~='cal.week']"),
    "orientation destroyed an open editor or recomposed behind its stale callback");
  key("Escape", document.activeElement);
  await tick(30);
  assert(!$("[data-ui~='cal.day-modal']") && $("[data-ui~='cal.week']") && !$("[data-ui~='cal.phone-week']"),
    "the deferred Calendar composition did not apply after dialog close");
  assert(document.activeElement && document.activeElement.isConnected && document.activeElement !== document.body &&
    (document.activeElement.matches('[data-ui~="cal.day"]') || document.activeElement === $("#main")),
    "deferred Calendar recomposition discarded the dialog's restored focus");
  phoneMql.setMatches(true);
});

step("Calendar Save keeps a connected focus target after a deferred breakpoint crossing", async () => {
  const phoneMql = mediaQueries.get("(max-width: 700px)");
  await tick(20);
  const add = byName($("[data-ui~='cal.phone-day']"), /^New event on /);
  click(add);
  const editor = $("[data-ui~='cal.ev-modal']");
  assert(editor, "the phone Calendar event editor did not open");
  editor.querySelector('input[type="text"]').value = "Orientation focus contract";
  phoneMql.setMatches(false);
  await tick(20);
  assert($("[data-ui~='cal.ev-modal']") && $("[data-ui~='cal.phone-week']") && !$("[data-ui~='cal.week']"),
    "orientation recomposed behind the live event editor");
  click($$("[data-ui~='cal.ev-modal'] button").find(button => button.textContent.trim() === "Add event"));
  await tick(30);
  assert(!$("[data-ui~='cal.ev-modal']") && $("[data-ui~='cal.week']") && !$("[data-ui~='cal.phone-week']"),
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
    console.log("\nSMOKE46 FAILURES (" + errors.length + "):");
    errors.forEach(error => console.log("  - " + error));
    process.exit(1);
  }
  console.log("\nSMOKE46 PASS — Category 7 Phase E responsive/mobile contracts verified (" + pass + " steps).");
  process.exit(0);
})();
