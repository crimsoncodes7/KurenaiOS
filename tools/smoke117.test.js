/* Kurenai OS — smoke117.test.js
   Cosmetics: every shop item can be bought, worn and drawn
   (quality audit W0 §A7 "cosmetics: buy, apply and render every shop
   item"; finding SC-05 — the ten painted shelf skins and Shrine card
   styles set `--skin-art: url(assets/app/img/…)` inline, collection.css
   reads it as `background: var(--skin-art)`, and a relative url() inside a
   custom property resolves against the STYLESHEET that uses it, so the
   browser asks for /css/views/assets/app/img/… and draws nothing; the fix
   is W5).

     A · THE CATALOGUE: KOS.governor.catalog() has unique ids and names
         within a kind, a known kind for every item — one the shop lists
         (SHOP_GROUPS in js/modules/governor-ui.js) and one its Use path
         applies (wareUse's cases, or KOS.governor.wear's WEAR map, or a lab
         or unlock) — and a price.
     B · A DECLARED SURFACE: each item names what draws it — a picture
         (`art`) or the CSS hook its kind is styled by (a theme's
         [data-theme], a pen set's [data-penset], a paper's [data-paper], a
         shelf or Shrine skin's [data-skin], a CSS frame's [data-frame]), a
         seal's glyph, a preset banner's paint, a lab's gated sim or view,
         an unlock's area.
     C · ASSET URLS: every item's picture (KOS.art.src) exists in the repo
         when resolved against the page URL; and no script sets a custom
         property to a RELATIVE url() that a stylesheet in a sub-folder
         consumes (the SC-05 class: it resolves against the stylesheet, not
         the page) — each such pattern is listed with the path the browser
         would actually request.
     D · BUY AND WEAR: in a booted app with gold, the shop (#/governor/shop)
         is drawn, every item's Buy (or Use, for a free one) is pressed, and
         the item is then owned, its card says "In use" (a lab or unlock
         says owned), the record the kind writes holds it (g.theme, g.seal,
         g.avatar.frame/art, g.shelfSkin, g.shrineStyle, g.banner, g.outfit…),
         a theme or pen set reaches <html>, a lab's gated sim or view opens,
         and nothing throws. The Governor's page and Home draw afterwards
         with everything worn.

   RATCHETED: tools/baselines/smoke117-cosmetics.json holds today's
   violations (item or pattern · problem). The suite fails only on one not
   listed, and lists baseline entries that no longer occur.

   Run:
     node tools/smoke117.test.js
     node tools/smoke117.test.js --write-baseline   (re-record today's)  */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const ROOT = path.join(__dirname, "..");
const BASELINE = path.join(ROOT, "tools", "baselines", "smoke117-cosmetics.json");
const WRITE = process.argv.includes("--write-baseline");
const PAGE = "http://localhost/index.html";

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

const violations = {};          /* key -> detail */
function violate(key, detail) { violations[key] = detail || ""; }
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, decodeURIComponent(rel)));
/* the repo path a URL resolves to, from a base URL (page or stylesheet) */
function resolve(url, base) {
  const u = new URL(url, base);
  if (u.origin !== "http://localhost") return null;
  return u.pathname.replace(/^\//, "");
}

const CSS_ALL = ["css/tokens.css", "css/base.css", "css/layout.css", "css/components.css", "css/themes.css"]
  .concat(fs.readdirSync(path.join(ROOT, "css/views")).filter((f) => f.endsWith(".css")).map((f) => "css/views/" + f));
const cssText = CSS_ALL.map(read).join("\n");
const hasHook = (attr, val) => new RegExp("\\[" + attr + "=[\"']?" + String(val).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\"']?\\]").test(cssText);

let app, K, G, cat = [];
let handledKinds = new Set(), shopKinds = new Set();

step("boot", async () => {
  app = await boot();
  K = app.KOS;
  G = K.governor;
  cat = G.catalog();
  assert(cat.length > 50, "the catalogue is there (" + cat.length + " items)");
});

step("A · the catalogue: ids, kinds the shop lists and its Use path applies", () => {
  const gui = read("js/modules/governor-ui.js"), gov = read("js/core/governor.js");
  /* the shop's departments: `match: function (c) { return c.kind === "x"; }` */
  const groups = /var SHOP_GROUPS\s*=\s*\[([\s\S]*?)\];/.exec(gui) || /SHOP_GROUPS\s*=\s*\[([\s\S]*?)\];/.exec(gui);
  const groupSrc = groups ? groups[1] : gui;
  for (const m of groupSrc.matchAll(/c\.kind\s*===\s*"([\w-]+)"/g)) shopKinds.add(m[1]);
  /* what Use applies: wareUse's switch, else wear(kind) for WEAR's kinds */
  const use = /function wareUse\s*\([^)]*\)\s*\{([\s\S]*?)\n    \}/.exec(gui);
  assert(use, "found wareUse in governor-ui.js");
  for (const m of use[1].matchAll(/case\s+"([\w-]+)"/g)) handledKinds.add(m[1]);
  const wear = /var WEAR\s*=\s*\{([^}]*)\}/.exec(gov);
  assert(wear, "found WEAR in governor.js");
  for (const m of wear[1].matchAll(/([\w-]+)\s*:/g)) handledKinds.add(m[1]);
  handledKinds.add("lab"); handledKinds.add("unlock");   /* owned, never worn */
  const ids = new Set(), names = new Set();
  cat.forEach((it) => {
    if (ids.has(it.id)) violate(it.id + " · duplicate id");
    ids.add(it.id);
    const nk = it.kind + "|" + it.name;
    if (!it.retired && names.has(nk)) violate(it.id + " · duplicate name within its kind (" + it.name + ")");
    if (!it.retired) names.add(nk);
    if (!it.kind) violate(it.id + " · no kind");
    else {
      if (!shopKinds.has(it.kind)) violate(it.id + " · kind " + it.kind + " is in no shop department");
      if (!handledKinds.has(it.kind)) violate(it.id + " · kind " + it.kind + " has no Use path (wareUse / WEAR)");
    }
    if (typeof it.price !== "number" || it.price < 0) violate(it.id + " · no price");
  });
  console.log("       " + cat.length + " items, kinds: " + [...new Set(cat.map((c) => c.kind))].join(", "));
});

/* the sims and views each lab unlock gates (governor.js SIM_ITEM / VIEW_ITEM) */
const LAB_GATES = {};
step("B · every item declares what draws it", () => {
  const gov = read("js/core/governor.js");
  ["SIM_ITEM", "VIEW_ITEM"].forEach((map) => {
    const m = new RegExp("var " + map + "\\s*=\\s*\\{([\\s\\S]*?)\\};").exec(gov);
    if (!m) return;
    for (const p of m[1].matchAll(/"?([\w-]+)"?\s*:\s*"([\w-]+)"/g)) (LAB_GATES[p[2]] = LAB_GATES[p[2]] || []).push([map === "SIM_ITEM" ? "sim" : "view", p[1]]);
  });
  cat.forEach((it) => {
    const has = (ok, what) => { if (!ok) violate(it.id + " · declares no surface: " + what); };
    switch (it.kind) {
      case "theme": has(it.theme && hasHook("data-theme", it.theme), "no [data-theme=\"" + it.theme + "\"] block in the stylesheets"); break;
      case "penset": has(it.penset && hasHook("data-penset", it.penset), "no [data-penset=\"" + it.penset + "\"] rule"); break;
      case "paper": has(it.paper && hasHook("data-paper", it.paper), "no [data-paper=\"" + it.paper + "\"] rule"); break;
      case "shelfskin": case "shrinestyle": has(it.art || hasHook("data-skin", it.id), "no art and no [data-skin=\"" + it.id + "\"] rule"); break;
      case "frame": has(it.painted ? it.art : hasHook("data-frame", it.id), it.painted ? "a painted frame without art" : "no [data-frame=\"" + it.id + "\"] rule"); break;
      case "seal": has(it.glyph || it.art, "no glyph or art"); break;
      case "banner": has(it.painted ? it.art : G.bannerPresetCss(it.banner), it.painted ? "a painted banner without art" : "no preset paint for " + it.banner); break;
      case "outfit": case "scene": case "hall": case "finish": case "avatar": has(it.art, "no art"); break;
      case "lab": has(LAB_GATES[it.id], "gates no sim or view (SIM_ITEM / VIEW_ITEM)"); break;
      case "unlock": has(it.area && typeof K.art.canUpload === "function", "no upload area"); break;
      default: violate(it.id + " · unknown kind " + it.kind);
    }
  });
});

step("C · asset URLs resolve to files that exist", () => {
  let n = 0;
  cat.forEach((it) => {
    if (!it.art) return;
    const url = K.art.src(it.art);
    const rel = resolve(url, PAGE);
    n++;
    if (!rel || !exists(rel)) violate(it.id + " · art " + url + " is missing from the repo");
  });
  /* SC-05: a relative url() set inline in a custom property, consumed by a stylesheet below the root */
  const files = ["js/core", "js/modules", "js/engines", "js/labs"].flatMap(function walk(d) {
    return fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(d + "/" + e.name) : e.name.endsWith(".js") ? [d + "/" + e.name] : []);
  });
  const sets = [];
  files.forEach((f) => {
    const src = read(f);
    /* setProperty("--x", "url(rel…") and style strings "--x: url(rel…" */
    const pats = [/setProperty\(\s*["'](--[\w-]+)["']\s*,\s*["']url\(\s*["']?([^"')+]*)/g,
                  /["'`;]\s*(--[\w-]+)\s*:\s*url\(\s*["']?([^"')+;]*)/g];
    pats.forEach((re) => {
      for (const m of src.matchAll(re)) {
        const prefix = m[2].trim();
        if (!prefix || /^(data:|blob:|https?:|\/|#)/.test(prefix)) continue;
        sets.push({ file: f, line: src.slice(0, m.index).split("\n").length, prop: m[1], prefix });
      }
    });
  });
  sets.forEach((s) => {
    CSS_ALL.forEach((css) => {
      if (path.dirname(css) === ".") return;      /* a stylesheet at the root resolves like the page */
      if (!new RegExp("var\\(\\s*" + s.prop + "\\b").test(read(css))) return;
      const asked = resolve(s.prefix, "http://localhost/" + css);
      const meant = resolve(s.prefix, PAGE);
      if (asked === meant) return;
      /* which shop items reach this code path: the art ids it is fed */
      const kind = /books\.js$/.test(s.file) ? "shelfskin" : /shrine\.js$/.test(s.file) ? "shrinestyle" : null;   /* for the message only */
      const affected = cat.filter((it) => it.art && it.kind === kind && !exists(asked + it.art + ".webp") && exists(meant + it.art + ".webp"));
      violate(s.file + " · " + s.prop + " · relative url() resolved by " + css,
        s.file + ":" + s.line + " sets " + s.prop + ": url(" + s.prefix + "…), read by " + css + " → the browser requests /" + asked + "… (404), not /" + meant + "…" +
        (affected.length ? "; items drawing nothing: " + affected.map((it) => it.id).join(", ") : ""));
    });
  });
  console.log("       " + n + " item pictures checked; " + sets.length + " inline custom-property url() site(s) scanned");
});

step("D · buy and wear every item in the shop; it is owned, worn and drawn", async () => {
  const doc = app.document, g = K.store.state.governor;
  g.gold = 10000000;
  g.themeFollow = false;
  const before = app.errors.length;
  const labSeen = {};
  Object.keys(LAB_GATES).forEach((id) => {
    LAB_GATES[id].forEach(([k, key]) => { const a = k === "sim" ? G.simAccess(key) : G.viewAccess(key); labSeen[id + "|" + key] = a.ok; });
  });
  const shopCard = (it) => [...doc.querySelectorAll("[data-ui~='shop.card']")].find((c) => c.getAttribute("data-kind") === it.kind && c.getAttribute("aria-label") === it.name);
  K.show("governor", "shop");
  await app.settle();
  assert(doc.querySelector("[data-ui~='gov.shop']"), "the shop is drawn");
  const sold = cat.filter((it) => !it.retired);
  for (const it of sold) {
    const errs = app.errors.length;
    let card = shopCard(it);
    if (!card) { violate(it.id + " · no card in the shop"); continue; }
    try {
      const buy = card.querySelector("[data-ui~='shop.buy']");
      const use = card.querySelector("[data-ui~='shop.use']");
      if (buy) buy.click();
      else if (use) use.click();
      else if (card.getAttribute("data-ware") !== "on" && !G.owns(it.id)) { violate(it.id + " · its card offers neither Buy nor Use"); continue; }
      await app.settle();
    } catch (e) { violate(it.id + " · buying threw: " + e.message); continue; }
    if (app.errors.length > errs) violate(it.id + " · buying or wearing raised: " + app.errors.slice(errs).join(" | "));
    if (!G.owns(it.id)) { violate(it.id + " · not owned after Buy"); continue; }
    card = shopCard(it);
    const state = card && card.getAttribute("data-ware");
    const expectOn = it.kind !== "lab" && it.kind !== "unlock";
    if (expectOn && state !== "on") violate(it.id + " · its card is \"" + state + "\" after Buy, not in use");
    if (!expectOn && state !== "owned") violate(it.id + " · its card is \"" + state + "\" after Buy, not owned");
    /* the record each kind writes */
    const w = (k) => g[k];
    const rec = {
      theme: () => g.theme === it.theme && doc.documentElement.dataset.theme === (it.theme === "atelier-dusk" ? G.effectiveTheme() : it.theme),
      seal: () => g.seal === it.id,
      frame: () => g.avatar.frame === it.id && G.avatarNode(64).getAttribute("data-frame") === it.id,
      avatar: () => g.avatar.kind === "art" && g.avatar.art === it.id && !!G.avatarNode(64).querySelector("img"),
      shelfskin: () => g.shelfSkin === it.id && G.shelfSkin() === it.id,
      shrinestyle: () => g.shrineStyle === it.id && G.shrineStyle() === it.id,
      banner: () => g.banner === (it.painted ? it.id : it.banner),
      outfit: () => w("outfit") === it.id && G.outfit() === it.outfit,
      scene: () => G.scene() === it.scene && (w("scene") === it.id || (it.price === 0 && !w("scene"))),   /* the free one is the default */
      hall: () => w("hall") === it.id && G.hall() === it.hall,
      finish: () => w("finish") === it.id && G.wearing("finish") === it.id,
      paper: () => w("paper") === it.id && G.wearing("paper") === it.id,
      penset: () => w("penset") === it.id && doc.documentElement.getAttribute("data-penset") === it.penset,
      lab: () => (LAB_GATES[it.id] || []).every(([k, key]) => (k === "sim" ? G.simAccess(key) : G.viewAccess(key)).ok),
      unlock: () => true
    }[it.kind];
    try { if (rec && !rec()) violate(it.id + " · after Buy its kind's record does not hold it"); }
    catch (e) { violate(it.id + " · reading its record threw: " + e.message); }
  }
  /* a lab that was locked before is open after (the gate is real) */
  Object.keys(labSeen).forEach((k) => { if (labSeen[k] && !G.owns(k.split("|")[0])) violate(k + " · lab gate was open before buying"); });
  /* the Governor's page and Home draw with everything worn */
  for (const [v, a] of [["governor", "status"], ["home"], ["governor", "shop"]]) {
    const errs = app.errors.length;
    try { K.show(v, a); await app.settle(); } catch (e) { violate("view " + v + " · threw with everything worn: " + e.message); }
    if (app.errors.length > errs) violate("view " + v + " · raised with everything worn: " + app.errors.slice(errs).join(" | "));
  }
  assert(sold.length > 50, "pressed Buy on every item sold (" + sold.length + ")");
  console.log("       bought and wore " + sold.length + " items; app errors during the run: " + (app.errors.length - before));
});

step("the ratchet: no new cosmetics violation", () => {
  const found = Object.keys(violations).sort();
  if (WRITE) {
    fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
    fs.writeFileSync(BASELINE, JSON.stringify({
      _about: "smoke117: today's cosmetics violations (item or code path · problem). The suite fails only on one NOT listed here. " +
        "Shrink this list as W5 fixes them (SC-05 and friends); re-record with --write-baseline.",
      violations: found
    }, null, 2) + "\n");
    console.log("       wrote " + path.relative(ROOT, BASELINE) + " (" + found.length + " violations)");
    found.forEach((k) => console.log("         " + k + (violations[k] ? "\n           " + violations[k] : "")));
    return;
  }
  assert(fs.existsSync(BASELINE), "the baseline exists (run with --write-baseline once)");
  const base = new Set(JSON.parse(fs.readFileSync(BASELINE, "utf8")).violations);
  const fresh = found.filter((k) => !base.has(k));
  const gone = [...base].filter((k) => found.indexOf(k) < 0);
  console.log("       " + found.length + " known violation(s)");
  found.filter((k) => violations[k]).forEach((k) => console.log("         " + violations[k]));
  if (gone.length) console.log("       FIXED (shrink the baseline): " + gone.join("; "));
  assert(!fresh.length, fresh.length + " new cosmetics violation(s):\n         " + fresh.map((k) => k + (violations[k] ? " — " + violations[k] : "")).join("\n         "));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke117: " + failed + " failed" : "smoke117: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
