/* Kurenai OS — smoke44.test.js
   Category 7 Phase D — the Collection: Mangaka, the shared vault shell and
   the Overview.

   smoke40 pinned the Phase A half of Mangaka (it stopped rendering the
   whole library). This suite defends what Phase D actually changed, and
   would otherwise regress the moment a fifth media module or a new facet
   is added:

     A · ONE toolbar across all four vaults — search + sort + layout
         visible, facets behind Filters ▾, commands behind Actions ▾, and
         never more than six controls above the grid (audit VLT-3 / U-13)
     B · ONE hero — a mandatory scrim on every path, a designed fallback
         when there is no banner, and no module-specific finish
         (VLT-4 / VLT-5 / U-14)
     C · the menu primitive — a popover, not a modal: real ARIA, Escape,
         focus restoration, and below the modal layer
     D · the facet split — genres, tags and rare tags, each counted, so a
         64-option soup is usable (VLT-8 / G-31 / U-26)
     E · Mangaka — bounded author cards, real filtering, letter dividers,
         and figures that describe the works actually shown (MNG-1 / MNG-2)
     F · the Overview — one comparison instead of four charts, no total
         printed twice, zero tiles suppressed, and no distribution drawn
         from one rated title (MTX-2 / MTX-3 / MTX-5)
     G · chart readability — a value axis, gridlines and an 11px label
         floor everywhere (MTX-4 / U-19)
     H · one progress grammar (MTX-6 / U-30)

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke44.test.js                                           */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "css/main.css"), "utf8");
/* a rule and a comment about a retired rule are different things — strip
   comments before asserting that something is gone from the stylesheet */
const cssRules = css.replace(/\/\*[\s\S]*?\*\//g, "");
const src = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const medviewSrc = src("js/modules/medview.js");
const uiSrc = src("js/core/ui.js");
const chartsSrc = src("js/core/charts.js");
const matrixSrc = src("js/modules/matrix.js");

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
window.__kosAutoConfirm = true;
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
/* the four vault views must not need the network to render — invariants
   #12/#20/#30 mean two of them must never touch it at all */
let networkCalls = [];
window.fetch = (u) => { networkCalls.push(String(u)); return Promise.reject(new Error("network disabled in smoke44")); };
window.matchMedia = q => ({ matches: false, media: q, addListener: noop, removeListener: noop,
  addEventListener: noop, removeEventListener: noop });
/* jsdom has no IntersectionObserver; the lazy area's chunk fallback would
   paint everything, which is the opposite of what these steps measure */
window.IntersectionObserver = function (cb) {
  const self = { targets: [], observe: t => self.targets.push(t), unobserve: noop, disconnect: noop };
  return self;
};

for (const m of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(src(m[1])); }
  catch (e) { errors.push("LOAD FAIL " + m[1] + ": " + e.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const main = () => document.getElementById("main");
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const key = (k, t) => (t || document).dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
const p = fn => new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(err.message || String(err))) : res(out)));
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
async function waitFor(cond, ms) {
  const deadline = Date.now() + (ms || 5000);
  while (Date.now() < deadline) { if (cond()) return true; await tick(20); }
  return cond();
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const steps = [];
const step = (n, f) => steps.push([n, f]);

const VAULTS = ["anime", "books", "vn", "game"];

/* ---- one seeded vault, shared by every step below ---- */
step("seed a vault with all four modules, long titles and a noisy facet", async () => {
  const existing = await p(cb => KOS.mediadb.query({}, cb));
  for (const e of existing) await p(cb => KOS.mediadb.remove(e.id, cb, { skipTombstone: true }));
  const GENRES = ["Action", "Adventure", "Comedy", "Romance"];
  const TAGS = ["Protagonist with a Tragic Past", "Small Coastal Town", "Unreliable Narrator"];
  const plan = [["anime", 40], ["books", 60], ["vn", 6], ["game", 20]];
  let i = 0;
  for (const [module, n] of plan) {
    for (let k = 0; k < n; k++, i++) {
      await p(cb => KOS.mediadb.add({
        module,
        title: (i % 7 === 0 ? "The Extraordinarily Long Title That Keeps Going " : "Entry ") + i,
        coverUrl: i % 5 === 0 ? "" : "/icons/icon-192.png",
        status: ["planned", "inProgress", "completed", "onHold", "dropped"][i % 5],
        score: i % 3 === 0 ? 1 + (i % 10) : 0,
        /* a facet mixing real genres with one-off tags — VLT-8's shape */
        genres: [GENRES[i % GENRES.length]].concat(i % 9 === 0 ? [TAGS[i % TAGS.length]] : []),
        author: module === "books" ? String.fromCharCode(65 + (k % 26)) + "oyama " + (k % 12) : "",
        format: module === "books" ? ["manga", "lightNovel", "oneShot"][k % 3] : "",
        playtimeHours: module === "game" ? (i % 40) : null,
        progress: { current: i % 20, total: module === "game" ? null : 40 },
        physical: module === "books" && k % 4 === 0
          ? { owned: true, volumes: [{ number: 1 }, { number: 2 }] } : { owned: false, volumes: [] },
        routes: module === "vn" ? [{ name: "Common", cleared: true }, { name: "True", cleared: k % 2 === 0 }] : []
      }, cb));
    }
  }
  const rows = await p(cb => KOS.mediadb.query({}, cb));
  assert(rows.length === 126, "seed failed: " + rows.length);
});

/* ============ A · one toolbar across all four vaults ============ */
console.log("== A: the shared vault toolbar (VLT-3 / U-13) ==");

async function openVault(id) {
  networkCalls = [];
  KOS.show(id);
  await waitFor(() => main().querySelector(".med-toolbar.mvt"), 6000);
  await tick(60);
  return main().querySelector(".med-toolbar.mvt");
}

step("every vault builds its toolbar from the shared primitive", async () => {
  for (const v of VAULTS) {
    const bar = await openVault(v);
    assert(bar, v + " does not use KOS.medview.toolbar");
    assert(bar.getAttribute("role") === "group" && bar.getAttribute("aria-label"),
      v + "'s toolbar is an unnamed div");
  }
});

step("no vault shows more than six controls above the grid", async () => {
  for (const v of VAULTS) {
    const bar = await openVault(v);
    const n = bar.children.length;
    assert(n <= 6, v + " shows " + n + " controls above the grid (the ceiling is six)");
    assert(bar.querySelector(".med-search"), v + " lost its search box");
    assert(bar.querySelector(".btn.primary"), v + " lost its one primary action");
    assert(bar.querySelectorAll(".btn.primary").length === 1,
      v + " has " + bar.querySelectorAll(".btn.primary").length + " primary actions; a view gets one");
  }
});

step("the facets moved into Filters ▾ and the commands into Actions ▾", async () => {
  for (const v of VAULTS) {
    const bar = await openVault(v);
    const filters = bar.querySelector(".mvt-filters-btn");
    const actions = bar.querySelector(".mvt-actions-btn");
    assert(filters, v + " has no Filters group");
    assert(actions, v + " has no Actions group");
    assert(filters.getAttribute("aria-haspopup") && filters.getAttribute("aria-expanded") === "false",
      v + "'s Filters button is not announced as a disclosure");
    /* the selects must be IN the group, not loose in the row */
    /* the sort control is the toolbar's own (.med-sort); anything else is
       a module facet and belongs in the group */
    assert(!bar.querySelector(":scope > select:not(.med-sort)"),
      v + " still puts a facet select directly in the toolbar");
  }
});

step("the Filters badge counts what is actually applied", async () => {
  const bar = await openVault("books");
  const btn = bar.querySelector(".mvt-filters-btn");
  assert(btn.querySelector(".menu-btn-n").textContent === "", "a fresh vault claims filters are applied");
  click(btn);
  const panel = $(".menu-panel");
  assert(panel, "the Filters panel did not open");
  const sel = panel.querySelector("select");
  sel.value = sel.options[1].value;
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  await waitFor(() => btn.querySelector(".menu-btn-n").textContent === "1", 3000);
  assert(btn.classList.contains("has-filters"), "a filtered vault does not say so with the panel shut");
  /* and clearing puts it back */
  const clear = $(".mvt-clear");
  assert(clear && !clear.disabled, "Clear filters is disabled while a filter is applied");
  click(clear);
  await waitFor(() => btn.querySelector(".menu-btn-n").textContent === "", 3000);
  KOS.ui.closeMenu();
});

step("a vault renders with no network traffic at all", async () => {
  /* invariants #12/#20/#30: games and VN must never reach the wire, and
     no vault may need it merely to paint */
  for (const v of VAULTS) {
    await openVault(v);
    assert(networkCalls.length === 0,
      v + " made " + networkCalls.length + " request(s) on render: " + networkCalls.join(", "));
  }
});

/* ============ B · one hero ============ */
console.log("== B: one spotlight hero, three backdrops (VLT-4 / VLT-5) ==");

step("every vault mounts the same hero component", async () => {
  for (const v of VAULTS) {
    await openVault(v);
    await waitFor(() => main().querySelector(".vault-hero"), 4000);
    const hero = main().querySelector(".vault-hero");
    assert(hero, v + " has no spotlight hero");
    assert(hero.querySelector(".vh-title") && hero.querySelector(".vh-actions"),
      v + "'s hero is a different composition");
    /* the cover plate stands on every hero now, banner or not */
    assert(hero.querySelector(".vh-cover, .vh-ph"), v + "'s hero has no cover plate");
  }
});

step("a hero without a banner still carries artwork and a scrim", async () => {
  await openVault("game");                       // games have no banner source, ever
  await waitFor(() => main().querySelector(".vault-hero"), 4000);
  const hero = main().querySelector(".vault-hero");
  assert(hero.classList.contains("vh-fallback"),
    "the games hero claims a banner it cannot have");
  assert(hero.querySelector(".vh-art"), "the fallback hero has no artwork layer");
  assert(hero.querySelector(".vh-scrim"), "the fallback hero has no scrim — VLT-5");
  assert(/--vh-hue/.test(hero.getAttribute("style") || ""),
    "the fallback gradient is not derived from the title");
});

step("the retired light 'painted' treatment is gone from both layers", () => {
  assert(!/vh-painted/.test(medviewSrc), "medview still emits the .vh-painted hero");
  assert(!/\.vh-painted/.test(cssRules), "the .vh-painted rules are still in the stylesheet");
  /* one text colour, not one per backdrop */
  assert(/\.vault-hero \{ color: #F6F1E6; \}/.test(css),
    "the hero's text colour is still conditional on the artwork");
});

step("the scrim is applied on every path, not only when a banner exists", () => {
  assert(/HERO_SCRIM/.test(medviewSrc), "the banner path lost its named scrim");
  assert(/\.vh-scrim \{[^}]*background: linear-gradient/s.test(css),
    "the fallback path has no scrim rule");
});

/* ============ C · the menu primitive ============ */
console.log("== C: KOS.ui.menu is a popover, not a modal ==");

step("an Actions menu is a real menu with real menuitems", async () => {
  const bar = await openVault("anime");
  const btn = bar.querySelector(".mvt-actions-btn");
  click(btn);
  const panel = $(".menu-panel");
  assert(panel, "the menu did not open");
  assert(panel.getAttribute("role") === "menu", "the panel is not a menu");
  assert(panel.querySelectorAll("[role=menuitem]").length >= 3, "the menu has no items");
  assert(btn.getAttribute("aria-expanded") === "true", "the button does not report its state");
  assert(document.activeElement === panel.querySelector("[role=menuitem]"),
    "opening a menu does not move focus into it");
});

step("arrow keys move through the menu and Escape restores focus", () => {
  const panel = $(".menu-panel");
  const items = [...panel.querySelectorAll("[role=menuitem]")];
  key("ArrowDown");
  assert(document.activeElement === items[1], "ArrowDown does not move to the next item");
  key("End");
  assert(document.activeElement === items[items.length - 1], "End does not reach the last item");
  key("Escape");
  assert(!$(".menu-panel"), "Escape left the menu open");
  assert(document.activeElement.classList.contains("mvt-actions-btn"),
    "focus was not restored to the button that opened the menu");
});

step("a Filters panel is a labelled group, not a menu of selects", async () => {
  const bar = await openVault("books");
  click(bar.querySelector(".mvt-filters-btn"));
  const panel = $(".menu-panel");
  assert(panel.getAttribute("role") === "group", "a panel of selects claims to be a menu");
  assert(panel.getAttribute("aria-label"), "the panel has no accessible name");
  assert(panel.querySelectorAll("select").length >= 2, "the facets did not make it into the panel");
  assert(!panel.querySelector("[role=menuitem]"), "a select was labelled as a menuitem");
  KOS.ui.closeMenu();
});

step("the menu sits below the modal layer and does not lock the page", () => {
  assert(/--z-menu:\s*110/.test(css) && /--z-modal:\s*120/.test(css),
    "the menu layer is not below the modal layer");
  assert(/\.menu-panel \{[^}]*z-index: var\(--z-menu\)/s.test(css), "the panel is not on the menu layer");
  /* invariant #49 is about MODALS; a menu must not go through openDialog,
     which traps focus and locks body scroll */
  assert(!/openDialog\([^)]*menu/i.test(uiSrc), "the menu was routed through the dialog primitive");
  assert(/KOS\.ui\.menu = menu/.test(uiSrc), "KOS.ui.menu is not exported");
});

/* ============ D · the facet split ============ */
console.log("== D: genres, tags and rare tags (VLT-8 / G-31 / U-26) ==");

step("a mixed facet is grouped rather than served as one flat list", () => {
  const sel = document.createElement("select");
  KOS.medview.fillFacetSel(sel, {
    Action: 30, Comedy: 12, Romance: 4,
    "Protagonist with a Tragic Past": 9,
    "Small Coastal Town": 2, "Unreliable Narrator": 1
  }, "All genres");
  const groups = [...sel.querySelectorAll("optgroup")].map(g => g.label);
  assert(groups.length === 3, "expected genre / tag / rare groups, got " + JSON.stringify(groups));
  assert(/^Genres/.test(groups[0]), "real genres are not first: " + groups[0]);
  assert(/^Tags/.test(groups[1]), "tags are not their own group: " + groups[1]);
  assert(/^Rare tags/.test(groups[2]), "one-off tags are not separated: " + groups[2]);
  /* nothing is hidden — a one-title tag is still reachable */
  assert([...sel.options].some(o => o.value === "Unreliable Narrator"),
    "a rare tag was dropped rather than demoted");
  /* and every option says how big it is */
  assert(/Action · 30/.test(sel.options[1].textContent), "options carry no count: " + sel.options[1].textContent);
});

step("the facet select keeps a selection that still exists, and drops one that does not", () => {
  const sel = document.createElement("select");
  KOS.medview.fillFacetSel(sel, { Action: 3, Comedy: 2 }, "All");
  sel.value = "Comedy";
  KOS.medview.fillFacetSel(sel, { Action: 3, Comedy: 2 }, "All");
  assert(sel.value === "Comedy", "a still-valid selection was cleared on refill");
  KOS.medview.fillFacetSel(sel, { Action: 3 }, "All");
  assert(sel.value === "", "a selection whose facet vanished was kept");
});

step("the vault fills its facet from its OWN rows", async () => {
  await openVault("game");
  const bar = main().querySelector(".med-toolbar.mvt");
  click(bar.querySelector(".mvt-filters-btn"));
  await waitFor(() => $(".menu-panel select optgroup"), 4000);
  const values = [...$(".menu-panel").querySelectorAll("select")]
    .map(s => [...s.options].map(o => o.value)).flat();
  const gameRows = await p(cb => KOS.mediadb.query({ module: "game" }, cb));
  const gameGenres = new Set();
  gameRows.forEach(r => (r.genres || []).forEach(g => gameGenres.add(g)));
  const offered = values.filter(v => v && KOS.medview.CANON_GENRES.indexOf(v) !== -1);
  assert(offered.every(v => gameGenres.has(v)),
    "the games facet offers a genre no game carries: " + offered.filter(v => !gameGenres.has(v)));
  KOS.ui.closeMenu();
});

/* ============ E · Mangaka ============ */
console.log("== E: Mangaka (MNG-1 / MNG-2) ==");

step("an author card is bounded, however many works the author has", async () => {
  /* give one author far more works than the card prints */
  for (let i = 0; i < 30; i++) {
    await p(cb => KOS.mediadb.add({ module: "books", title: "Prolific work " + i,
      author: "Aida Prolific", status: "completed", format: "manga" }, cb));
  }
  main().getBoundingClientRect = () => ({ top: 0, bottom: 800, height: 800, left: 0, right: 900, width: 900 });
  KOS.show("mangaka");
  await waitFor(() => main().querySelectorAll(".mk-card").length > 0, 6000);
  const card = [...main().querySelectorAll(".mk-card")]
    .find(c => /Aida Prolific/.test(c.querySelector(".mk-name").textContent));
  assert(card, "the prolific author is not in the first batch");
  const tiles = card.querySelectorAll(".mk-work").length;
  assert(tiles <= 8, "an author card printed " + tiles + " works inline");
  const more = card.querySelector(".mk-more");
  assert(more && /Show all 30 works/.test(more.textContent),
    "there is no way to see the rest: " + (more && more.textContent));
  click(more);
  assert(card.querySelectorAll(".mk-work").length === 30, "expanding did not print the rest");
  assert(more.getAttribute("aria-expanded") === "true", "the disclosure does not report its state");
  click(more);
  assert(card.querySelectorAll(".mk-work").length === 8, "collapsing did not fold it back");
});

step("the page has real filters, not just a search box (MNG-2)", async () => {
  const bar = main().querySelector(".med-toolbar.mvt.mk-toolbar");
  assert(bar, "Mangaka does not use the shared toolbar");
  click(bar.querySelector(".mvt-filters-btn"));
  const panel = $(".menu-panel");
  const labels = [...panel.querySelectorAll(".mvt-facet .k")].map(n => n.textContent);
  assert(labels.length >= 4, "Mangaka offers " + labels.length + " filters: " + JSON.stringify(labels));
  assert(labels.some(l => /format/i.test(l)), "no format filter");
  assert(labels.some(l => /status/i.test(l)), "no reading-status filter");
  assert(labels.some(l => /prolific/i.test(l)), "no works-threshold filter — the page's own question");
  assert(labels.some(l => /shelf/i.test(l)), "no physically-owned filter");
  KOS.ui.closeMenu();
});

step("filtering the works also recomputes the author's own figures", async () => {
  const bar = main().querySelector(".med-toolbar.mvt.mk-toolbar");
  click(bar.querySelector(".mvt-filters-btn"));
  const panel = $(".menu-panel");
  const fmt = [...panel.querySelectorAll("select")]
    .find(s => [...s.options].some(o => o.value === "lightNovel"));
  assert(fmt, "no format select in the panel");
  fmt.value = "lightNovel";
  fmt.dispatchEvent(new window.Event("change", { bubbles: true }));
  KOS.ui.closeMenu();
  await waitFor(() => /filtered/.test(main().querySelector(".med-count").textContent), 4000);
  const card = [...main().querySelectorAll(".mk-card")][0];
  const meta = card.querySelector(".mk-meta").textContent;
  const claimed = parseInt(/(\d+) works?/.exec(meta)[1], 10);
  assert(claimed === card.querySelectorAll(".mk-work").length ||
    card.querySelector(".mk-more"),
    "the meta line counts works the filter removed: " + meta);
  /* every visible work really is a light novel */
  fmt.value = "";
});

step("the meta line separates the name from its figures", async () => {
  KOS.show("mangaka");
  await waitFor(() => main().querySelector(".mk-card"), 6000);
  const card = main().querySelector(".mk-card");
  assert(card.querySelector(".mk-h-txt"), "the name and meta share one inline run");
  const name = card.querySelector(".mk-name").textContent;
  const meta = card.querySelector(".mk-meta").textContent;
  assert(!/\d/.test(name.slice(-1)) || !/^\d/.test(meta),
    "the name and the figure count run together: " + name + meta);
  assert(/works?/.test(meta), "the meta line does not say how many works: " + meta);
  /* an author with nothing spent must not be told "£0 spent" */
  assert(!/£0\b/.test(meta) && !/\b0 ch read/.test(meta),
    "the meta line prints figures that carry nothing: " + meta);
});

step("a long scroll always says which letter it is in", async () => {
  KOS.show("mangaka");
  await waitFor(() => main().querySelector(".mk-card"), 6000);
  const dividers = main().querySelectorAll(".mk-letter");
  assert(dividers.length >= 2, "no letter dividers in the flow — only " + dividers.length);
  assert(/position:\s*sticky/.test(/\.mk-letter \{[^}]*\}/s.exec(css)[0]),
    "the divider scrolls away with the list it labels");
});

step("Mangaka still mounts one lazy batch, not the whole directory", async () => {
  KOS.show("mangaka");
  await waitFor(() => main().querySelector(".mk-card"), 6000);
  const cards = main().querySelectorAll(".mk-card").length;
  assert(cards <= 60, "Mangaka mounted " + cards + " author cards at once");
  assert(main().querySelector(".med-sentinel"), "the view left the shared lazy area");
});

/* ============ F · the Overview ============ */
console.log("== F: Collection Overview (MTX-2 / MTX-3 / MTX-5) ==");

step("the four 'X by status' charts became one shared-scale comparison", async () => {
  KOS.show("matrix");
  await waitFor(() => main().querySelector(".stat-strip"), 6000);
  await tick(80);
  assert(!/by status", "the founding module/.test(matrixSrc), "the per-module status charts are back");
  const multi = main().querySelector(".cs-multi");
  assert(multi, "no small-multiples row");
  const panels = multi.querySelectorAll(".cs-multi-panel");
  assert(panels.length >= 3, "only " + panels.length + " media in the comparison");
  assert(multi.querySelectorAll(".cs-multi-legend").length === 1,
    "the row does not share one legend");
  /* the shared scale is the point: every panel's axis must top out the same */
  /* the AXIS labels are the end-anchored ones; the others are bar values */
  const tops = [...panels].map(pn => {
    const axis = [...pn.querySelectorAll('text[text-anchor="end"]')]
      .map(t => Number(t.textContent)).filter(n => !isNaN(n));
    return Math.max.apply(null, axis);
  });
  assert(new Set(tops).size === 1, "the panels are not on one scale: " + JSON.stringify(tops));
});

step("no total is printed twice on the overview", async () => {
  KOS.show("matrix");
  await waitFor(() => main().querySelector(".stat-strip"), 6000);
  await tick(80);
  const agg = await p(cb => KOS.mediadb.stats(cb));
  /* the whole-vault total belongs to exactly one tile */
  const tiles = [...main().querySelectorAll(".stat-strip .stat-card .v")].map(n => n.textContent.replace(/,/g, ""));
  assert(tiles.filter(t => t === String(agg.total)).length === 1,
    "the vault total appears " + tiles.filter(t => t === String(agg.total)).length + " times in the KPI row");
  /* and the per-module totals belong to the module cards, not the KPI row */
  VAULTS.forEach(id => {
    const total = String((agg.modules[id] || {}).total || 0);
    assert(!tiles.includes(total) || total === String(agg.total),
      "the KPI row repeats " + id + "'s total, which its card already carries");
  });
  /* one donut, not two of the same numbers */
  assert(main().querySelectorAll(".donut-wrap").length === 0,
    "the overview still draws a donut of totals it has already printed");
});

step("zero-value tiles are suppressed", async () => {
  KOS.show("matrix");
  await waitFor(() => main().querySelector(".stat-strip"), 6000);
  await tick(80);
  const zeros = [...main().querySelectorAll(".stat-strip .stat-card .v")]
    .filter(n => n.textContent.trim() === "0");
  assert(zeros.length === 0, zeros.length + " tiles read 0 on an account with 1,000+ entries");
});

step("the analytics tail is one tab away, and holds the long tail", async () => {
  KOS.show("matrix");
  await waitFor(() => main().querySelector(".mx-tabs"), 6000);
  await tick(80);
  const tabs = [...main().querySelectorAll(".mx-tabs .study-tab")];
  assert(tabs.length === 2, "expected Overview / Analytics, got " + tabs.length);
  assert(tabs[0].getAttribute("aria-selected") === "true", "the page does not open on the overview");
  click(tabs[1]);
  await waitFor(() => main().querySelector(".cs-grid"), 4000);
  assert(main().querySelector(".donut-wrap"), "the medium donut did not move to Analytics");
  assert(!main().querySelector(".cs-multi"), "the overview comparison leaked into Analytics");
  click(main().querySelectorAll(".mx-tabs .study-tab")[0]);
  await waitFor(() => main().querySelector(".cs-multi"), 4000);
});

step("a distribution is not drawn from one rated title (MTX-5)", async () => {
  /* clear every score, then ask for the analytics pane */
  const rows = await p(cb => KOS.mediadb.query({}, cb));
  for (const e of rows) { if (e.score) { e.score = 0; await p(cb => KOS.mediadb.put(e, cb)); } }
  const one = rows[0]; one.score = 8; await p(cb => KOS.mediadb.put(one, cb));
  KOS.show("matrix");
  await waitFor(() => main().querySelector(".mx-tabs"), 6000);
  await tick(80);
  click(main().querySelectorAll(".mx-tabs .study-tab")[1]);
  await waitFor(() => main().querySelector(".cs-grid"), 4000);
  const card = [...main().querySelectorAll(".cs-chart")]
    .find(c => /Score distribution/.test(c.textContent));
  assert(card, "the score card vanished entirely");
  assert(!card.querySelector("svg"), "a distribution was drawn from one rated title");
  assert(/at least five/.test(card.textContent), "the card does not say why it is empty: " + card.textContent);
});

/* ============ G · chart readability ============ */
console.log("== G: charts you can read (MTX-4 / U-19) ==");

step("a bar chart has a value axis with gridlines and its own labels", () => {
  const svg = KOS.charts.barChart([
    { label: "In progress", value: 139 }, { label: "Planned", value: 139 },
    { label: "Completed", value: 138 }
  ]);
  const grid = [...svg.querySelectorAll("line")].filter(l => l.getAttribute("stroke-dasharray"));
  assert(grid.length >= 2, "no gridlines — " + grid.length);
  const axisLabels = [...svg.querySelectorAll("text")].map(t => t.textContent);
  assert(axisLabels.includes("0"), "the axis has no zero label");
  assert([...svg.querySelectorAll("title")].length >= 3, "the bars carry no hover text");
});

step("no chart label is below 11px", () => {
  const svgs = [
    KOS.charts.barChart([{ label: "One", value: 3 }, { label: "Two", value: 5 }]),
    KOS.charts.hbarChart([{ label: "Slice of Life", value: 40 }, { label: "Comedy", value: 12 }]),
    KOS.charts.lineChart([{ label: "J", value: 2 }, { label: "F", value: 5 }, { label: "M", value: 1 }]),
    KOS.charts.heatmap([{ date: "2026-08-01", value: 1 }, { date: "2026-08-02", value: 0 }])
  ];
  svgs.forEach((svg, i) => {
    [...svg.querySelectorAll("text")].forEach(t => {
      const size = Number(t.getAttribute("font-size"));
      assert(!(size < 11), "chart " + i + " has a " + size + "px label: “" + t.textContent + "”");
    });
  });
  assert(!/"font-size": "[0-9]\."/.test(chartsSrc) && !/"font-size": "(7|8|9|10)"/.test(chartsSrc),
    "a sub-11px font-size literal is still in charts.js");
});

step("a long category label wraps rather than being cut to nine characters", () => {
  const svg = KOS.charts.barChart([
    { label: "Slice of Life", value: 5 }, { label: "Psychological", value: 3 }
  ], { width: 560 });
  const texts = [...svg.querySelectorAll("text")].map(t => t.textContent);
  assert(texts.some(t => /Slice/.test(t)), "the label vanished");
  assert(!texts.some(t => /^Slice of…$/.test(t)), "the label is still truncated mid-word");
});

step("the axis never prints the maximum on top of a round tick", () => {
  const t = KOS.charts.ticks(222);
  const gaps = t.slice(1).map((v, i) => v - t[i]);
  assert(Math.min.apply(null, gaps) > 0, "duplicate or descending ticks: " + JSON.stringify(t));
  assert(!(t[t.length - 1] === 222 && t[t.length - 2] === 200),
    "222 and 200 both printed: " + JSON.stringify(t));
});

/* ============ H · one progress grammar ============ */
console.log("== H: progress, said one way (MTX-6 / U-30) ==");

step("KOS.media.progressText is the one formatter", () => {
  const anime = { module: "anime", progress: { current: 36, total: 96, unit: "ep" } };
  assert(KOS.media.progressText(anime) === "36 / 96 ep", KOS.media.progressText(anime));
  const noTotal = { module: "anime", progress: { current: 13, total: null, unit: "ep" } };
  assert(KOS.media.progressText(noTotal) === "13 ep", KOS.media.progressText(noTotal));
  const game = { module: "game", playtimeHours: 71 };
  assert(KOS.media.progressText(game) === "71 hr", KOS.media.progressText(game));
  const fresh = { module: "anime", progress: { current: 0, total: null } };
  assert(KOS.media.progressText(fresh) === "", "an untouched entry claims progress");
  /* a whole word pluralises; an abbreviation does not */
  const vn = { module: "vn", progress: { current: 2, total: 2, unit: "route" } };
  assert(KOS.media.progressText(vn) === "2 / 2 routes", KOS.media.progressText(vn));
  assert(KOS.media.progressText(anime, { long: true }) === "36 of 96 episodes",
    KOS.media.progressText(anime, { long: true }));
});

step("progressPct only claims a percentage where one exists", () => {
  assert(KOS.media.progressPct({ module: "anime", progress: { current: 24, total: 48 } }) === 50);
  assert(KOS.media.progressPct({ module: "anime", progress: { current: 13, total: null } }) === null,
    "a series with no known total was given a percentage");
  assert(KOS.media.progressPct({ module: "game", playtimeHours: 71 }) === null,
    "a game with no end was given a percentage");
});

step("the vault views print progress through it, not a local convention", () => {
  ["js/modules/anime.js", "js/modules/books.js"].forEach(f => {
    assert(/KOS\.media\.progressText/.test(src(f)), f + " still formats progress itself");
  });
  assert(/KOS\.media\.progressText/.test(matrixSrc), "the overview still formats progress itself");
  assert(/KOS\.media\.progressText/.test(medviewSrc), "the hero still formats progress itself");
});

/* ============ housekeeping ============ */
step("no view left an open menu behind", () => {
  KOS.ui.closeMenu();
  assert(!$(".menu-panel"), "a menu panel survived the run");
});

/* ---- run ---- */
(async () => {
  let pass = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); pass++; }
    catch (e) { errors.push('STEP "' + name + '": ' + (e.message || e)); console.log("FAIL  " + name); }
  }
  if (errors.length) {
    console.log("\nSMOKE44 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("\nSMOKE44 PASS — Category 7 Phase D (Collection) verified (" + pass + " steps).");
  process.exit(0);
})();
