/* Kurenai OS — smoke55.test.js
   UI rebuild M2: the legacy presentation cannot come back.

   M2 deleted the old presentation layer outright (docs/ui-rebuild/PLAN.md
   §2.1): css/main.css, the three design mockups at the repository root,
   the decorative petal backdrop and the Google Fonts link. This suite keeps
   them deleted, and holds every rebuilt file to the new vocabulary.

   A · the purge       the stylesheet, mockups, backdrop and font link are
                       gone from the tree, the page, the service worker and
                       the deploy script; the new layer files exist, are
                       linked in cascade order and each wraps its rules in
                       its own @layer block.
   B · the frozen      tools/ui-legacy-classes.json (every class main.css
       vocabulary      selected, generated before the delete) is intact.
   C · every sheet     under css/: classes are k- (or the two utility names
                       the plan keeps), never legacy; no selector reads a
                       [data-ui] hook (hooks are for logic and tests);
                       colour literals live only in the tokens and themes
                       layers; raw px lengths only in tokens (1px hairlines
                       aside); breakpoints are the five tiers; and every
                       sheet is listed in tools/ui-migration.json.
   D · rebuilt markup  each JS/HTML file listed as migrated uses only k-
                       classes, no legacy name and no static inline style
                       (custom properties carry data and are allowed).
   E · depth budget    each view listed as migrated renders (tools/lib/
                       app-harness.js) within its wrapper-depth budget:
                       at most N <div> levels between a <section> and a
                       leaf (PLAN §2.3, default 4).
   F · the guards bite every guard above is run against a fixture it must
                       reject, so a guard that silently passes everything
                       fails here instead.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke55.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { stylesheets, LAYERS } = require("./lib/css");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const LEGACY_FILE = "tools/ui-legacy-classes.json";
const MIGRATION_FILE = "tools/ui-migration.json";
const LEGACY = JSON.parse(read(LEGACY_FILE));
const LEGACY_SET = new Set(LEGACY.classes);
const MIGRATION = JSON.parse(read(MIGRATION_FILE));

/* the two utility names PLAN §3.2 keeps in base.css (shared, meaningful
   and referenced from JS far beyond any one view), and KaTeX's own */
const ALLOW = new Set(["sr-only", "skip-link",
  /* third-party output the base layer harmonises (KaTeX renders it) */
  "katex", "katex-display"]);
const TIERS = [1240, 1080, 860, 700, 560];
const COLOUR_LAYERS = new Set([LAYERS.tokens, LAYERS.themes]);
const MOCKUPS = ["kurenai-os-mockup.html", "kurenai-os-direction-lab-v3.html", "kurenaios_ui_overhaul_concept.html"];
const DEFAULT_DEPTH = 4;

const steps = [];
const step = (name, fn) => steps.push([name, fn]);
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const list = (a, n = 8) => a.slice(0, n).join(", ") + (a.length > n ? ` … (+${a.length - n})` : "");

/* ======================= the guards (pure) ======================= */

/* comments and string contents removed, so neither can trip a guard */
function stripCss(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""');
}
/* every block prelude in source order: { prelude, at } — at-rules keep
   their "@", selectors do not */
function preludes(src) {
  const text = stripCss(src);
  const out = [];
  let buf = "";
  for (const ch of text) {
    if (ch === "{") { out.push(buf.trim()); buf = ""; }
    else if (ch === "}" || ch === ";") buf = "";
    else buf += ch;
  }
  return out.filter(Boolean);
}
const selectors = (src) => preludes(src).filter((p) => !p.startsWith("@") && !/^(from|to|\d+(\.\d+)?%)(\s*,|$)/.test(p));
function classesInCss(src) {
  const out = [];
  for (const sel of selectors(src)) {
    for (const m of sel.replace(/\[[^\]]*\]/g, "").matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) out.push(m[1]);
  }
  return [...new Set(out)];
}
const legacyClassesInCss = (src) => classesInCss(src).filter((c) => LEGACY_SET.has(c) && !ALLOW.has(c));
const nonKClassesInCss = (src) => classesInCss(src).filter((c) => !/^k-/.test(c) && !ALLOW.has(c));
const hookSelectors = (src) => selectors(src).filter((s) => /\[\s*data-ui\b/.test(s));

const NAMED = ["black", "white", "red", "green", "blue", "yellow", "orange", "purple", "pink", "gray", "grey",
  "silver", "gold", "navy", "teal", "maroon", "olive", "lime", "aqua", "fuchsia", "crimson", "ivory", "beige",
  "tan", "brown", "coral", "salmon", "khaki", "plum", "orchid", "indigo", "violet", "turquoise", "lavender"];
/* colour literals in declaration values */
function colourLiterals(src) {
  const text = stripCss(src);
  const out = [];
  for (const m of text.matchAll(/(?:^|[;{\s])(--[\w-]+|[a-z-]+)\s*:\s*([^;{}]+)/gi)) {
    const value = m[2];
    const hex = value.match(/#[0-9a-f]{3,8}\b/gi);
    if (hex) out.push(...hex);
    /* a colour function built only from tokens (oklch(var(--cal-l)
       var(--cal-c) var(--ev-hue)), the calendar and placeholder hues) is
       derived, not a literal: flag it only when a channel is a number */
    for (const fn of value.matchAll(/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/gi)) {
      if (/\d/.test(fn[1].replace(/var\([^()]*\)/g, ""))) out.push(fn[0].slice(0, 40));
    }
    /* a custom property's NAME (var(--gold)) is not a colour */
    const bare = value.toLowerCase().replace(/--[\w-]+/g, "");
    const named = bare.match(new RegExp("\\b(" + NAMED.join("|") + ")\\b", "g"));
    if (named && !/^--/.test(m[1]) && !/font|animation|grid|content|counter|quotes/.test(m[1])) out.push(...named);
  }
  return out;
}
/* raw px lengths outside at-rule preludes; 0 and 1px hairlines are fine */
function rawPx(src) {
  const text = stripCss(src).replace(/@[^{;]*[{;]/g, "@;");
  return [...text.matchAll(/(?<![\w.-])(\d*\.?\d+)px\b/g)].map((m) => m[1] + "px")
    .filter((v) => !/^(0|0?\.0+|1)px$/.test(v));
}
/* width queries off the five tiers, and any min-width band */
function badBreakpoints(src) {
  const out = [];
  for (const p of preludes(src).filter((x) => /^@(media|container)\b/.test(x))) {
    for (const m of p.matchAll(/\b(max|min)-width:\s*(\d+)px/g)) {
      if (m[1] === "min") out.push(p);
      else if (!TIERS.includes(+m[2])) out.push(p);
    }
  }
  return [...new Set(out)];
}
/* one @layer <expected> block holding everything; the tokens file alone
   also carries the cascade-order statement */
function layerProblems(src, expected, isFirst) {
  const text = stripCss(src).trim();
  const problems = [];
  let rest = text;
  if (isFirst) {
    const order = /^@layer\s+tokens,\s*base,\s*layout,\s*components,\s*views,\s*themes\s*;/;
    if (!order.test(rest)) problems.push("the first sheet does not open with the cascade-order statement");
    rest = rest.replace(order, "").trim();
  } else if (/@layer\s+[\w\s,]+;/.test(rest)) problems.push("a layer-order statement outside the first sheet");
  const open = new RegExp("^@layer\\s+" + expected.replace("/", "\\/") + "\\s*\\{");
  if (!open.test(rest)) { problems.push("does not wrap its rules in @layer " + expected); return problems; }
  let depth = 0, end = -1;
  for (let i = rest.indexOf("{"); i < rest.length; i++) {
    if (rest[i] === "{") depth++;
    else if (rest[i] === "}" && --depth === 0) { end = i; break; }
  }
  if (end === -1) problems.push("the @layer " + expected + " block is not closed");
  else if (rest.slice(end + 1).trim()) problems.push("rules outside the @layer " + expected + " block");
  return problems;
}

/* markup: the string literals in class contexts of JS or HTML source */
function classStrings(src) {
  const out = [];
  const ctx = /\bclass\s*:\s*|\bclassName\s*[+]?=\s*|\bsetClass\s*\([^,]+,\s*|\bclassList\.(?:add|remove|toggle|contains)\s*\(\s*|\bclass\s*=\s*/g;
  let m;
  while ((m = ctx.exec(src))) {
    /* the expression that follows, up to the first , ) } or ; at depth 0 */
    let depth = 0, i = m.index + m[0].length, expr = "";
    for (; i < src.length && i < m.index + 400; i++) {
      const ch = src[i];
      if ("([{".includes(ch)) depth++;
      else if (")]}".includes(ch)) { if (depth === 0) break; depth--; }
      else if ((ch === "," || ch === ";" || ch === "\n") && depth === 0) break;
      expr += ch;
    }
    for (const s of expr.matchAll(/"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|`((?:\\.|[^`\\])*)`/g)) {
      out.push(s[1] != null ? s[1] : s[2] != null ? s[2] : s[3]);
    }
  }
  return out;
}
function markupProblems(src) {
  const tokens = classStrings(src).flatMap((s) => s.replace(/\$\{[^}]*\}/g, " ").split(/\s+/)).filter(Boolean);
  return {
    legacy: [...new Set(tokens.filter((t) => LEGACY_SET.has(t) && !ALLOW.has(t)))],
    nonK: [...new Set(tokens.filter((t) => !/^k-/.test(t) && !ALLOW.has(t)))]
  };
}
/* a static inline style is anything but custom properties */
function staticStyles(src) {
  const out = [];
  for (const m of src.matchAll(/\bstyle\s*[:=]\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
    const decls = m[2].split(";").map((d) => d.trim()).filter(Boolean);
    if (decls.some((d) => !/^--[\w-]+\s*:/.test(d))) out.push(m[2].slice(0, 50));
  }
  for (const m of src.matchAll(/\.style\.(?!setProperty|getPropertyValue|removeProperty)([a-zA-Z]+)\s*=(?!=)/g)) out.push(".style." + m[1]);
  for (const m of src.matchAll(/\.style\.setProperty\(\s*(["'])(?!--)([^"']+)\1/g)) out.push("setProperty(" + m[2] + ")");
  return out;
}
/* the most <div> wrappers between a <section> and any leaf under it */
function maxDepth(root) {
  let max = 0;
  for (const section of root.querySelectorAll("section")) {
    for (const leaf of section.querySelectorAll("*")) {
      if (leaf.children.length) continue;
      let n = 0;
      for (let a = leaf.parentElement; a && a !== section; a = a.parentElement) if (a.tagName === "DIV") n++;
      max = Math.max(max, n);
    }
  }
  return max;
}

/* ======================= A · the purge ======================= */
console.log("== A · the purge ==");

step("the legacy stylesheet and the design mockups are gone", () => {
  assert(!exists("css/main.css"), "css/main.css is back");
  const back = MOCKUPS.filter(exists);
  assert(!back.length, "design mockups are back at the root (anchoring risk): " + back.join(", "));
});

step("nothing links, precaches or deploys the legacy stylesheet", () => {
  const html = read("index.html"), sw = read("sw.js"), deploy = read("tools/deploy_pages.sh");
  assert(!/main\.css/.test(html), "index.html still links main.css");
  assert(!/main\.css/.test(sw.replace(/\/\*[\s\S]*?\*\//g, "")), "sw.js still precaches main.css");
  assert(/css\/main\.css.*leaked into dist/.test(deploy), "the deploy script no longer refuses a stray main.css");
  assert(/linked by index\.html but was not staged/.test(deploy), "the deploy script no longer checks every linked sheet is staged");
});

step("the page carries no petal backdrop and no Google Fonts", () => {
  const html = read("index.html");
  assert(!/bg-flora|class="petal/.test(html), "the decorative petal backdrop is back");
  assert(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html), "the Google Fonts link is back (M3 chooses the families)");
  assert(!/"bg-flora"/.test(read("js/core/ui-hooks.js")), "the backdrop's hook row outlived the backdrop");
});

step("the layer files exist, are linked in cascade order and each wraps one @layer", () => {
  const linked = stylesheets();
  const expected = Object.values(LAYERS);
  assert(JSON.stringify(linked) === JSON.stringify(expected),
    "index.html links " + linked.join(", ") + " — expected, in cascade order, " + expected.join(", "));
  Object.entries(LAYERS).forEach(([name, file], i) => {
    assert(exists(file), file + " is missing");
    const layer = name.startsWith("views/") ? "views" : name;
    const problems = layerProblems(read(file), layer, i === 0);
    assert(!problems.length, file + ": " + problems.join("; "));
  });
  const onDisk = [];
  const walk = (dir) => fs.readdirSync(path.join(ROOT, dir)).forEach((f) => {
    const rel = dir + "/" + f;
    if (fs.statSync(path.join(ROOT, rel)).isDirectory()) walk(rel);
    else if (/\.css$/.test(f)) onDisk.push(rel);
  });
  walk("css");
  const stray = onDisk.filter((f) => !linked.includes(f));
  assert(!stray.length, "stylesheets on disk that index.html does not link: " + stray.join(", "));
});

/* ======================= B · the frozen vocabulary ======================= */
console.log("== B · the frozen vocabulary ==");

step("the legacy class manifest is intact", () => {
  assert(LEGACY.source === "css/main.css" && /^[0-9a-f]{7,}$/.test(LEGACY.revision), "the manifest lost its provenance");
  assert(LEGACY.count === LEGACY.classes.length, "count and list disagree");
  assert(LEGACY.classes.length >= 2300, "only " + LEGACY.classes.length + " names — the manifest was truncated");
  const sorted = [...LEGACY.classes].sort();
  assert(JSON.stringify(sorted) === JSON.stringify(LEGACY.classes), "the manifest is not sorted");
  assert(LEGACY_SET.size === LEGACY.classes.length, "the manifest has duplicates");
  ["rail-item", "med-cover", "study-tab", "modal-ov", "asst-mascot", "toast"].forEach((c) =>
    assert(LEGACY_SET.has(c), "a known legacy class is missing from the manifest: " + c));
  assert(![...LEGACY_SET].some((c) => /^k-/.test(c)), "a k- name is in the legacy manifest — the prefix would collide");
});

/* ======================= C · every stylesheet ======================= */
console.log("== C · every stylesheet ==");

const SHEETS = Object.values(LAYERS);

step("every stylesheet is listed as migrated", () => {
  const listed = new Set(MIGRATION.files || []);
  const missing = SHEETS.filter((f) => !listed.has(f));
  assert(!missing.length, "not in " + MIGRATION_FILE + ": " + missing.join(", "));
  const gone = [...listed].filter((f) => !exists(f));
  assert(!gone.length, MIGRATION_FILE + " lists files that do not exist: " + gone.join(", "));
});

step("classes are k- (or the two kept utilities) and never legacy", () => {
  for (const f of SHEETS) {
    const src = read(f);
    const legacy = legacyClassesInCss(src);
    assert(!legacy.length, f + " reintroduces legacy classes: " + list(legacy));
    const nonK = nonKClassesInCss(src);
    assert(!nonK.length, f + " styles classes without the k- prefix: " + list(nonK));
  }
});

step("no stylesheet selects a data-ui hook", () => {
  for (const f of SHEETS) {
    const bad = hookSelectors(read(f));
    assert(!bad.length, f + " styles by hook — hooks are for logic and tests, never CSS: " + list(bad, 3));
  }
});

step("colour literals live only in the tokens and themes layers", () => {
  for (const f of SHEETS) {
    if (COLOUR_LAYERS.has(f)) continue;
    const bad = colourLiterals(read(f));
    assert(!bad.length, f + " hard-codes colour: " + list(bad) + " — derive it from a token");
  }
});

step("raw px lengths live only in the tokens layer (1px hairlines aside)", () => {
  for (const f of SHEETS) {
    if (f === LAYERS.tokens) continue;
    const bad = rawPx(read(f));
    assert(!bad.length, f + " uses raw px lengths: " + list(bad) + " — use a spacing/size token");
  }
});

step("width queries use only the five tiers", () => {
  for (const f of SHEETS) {
    const bad = badBreakpoints(read(f));
    assert(!bad.length, f + " adds a breakpoint off 1240/1080/860/700/560 (or a min-width band): " + list(bad, 3));
  }
});

/* ======================= D · rebuilt markup ======================= */
console.log("== D · rebuilt markup ==");

const MARKUP = (MIGRATION.files || []).filter((f) => /\.(js|html)$/.test(f));

step("rebuilt JS and HTML use k- classes, no legacy name and no static inline style", () => {
  console.log("       " + MARKUP.length + " rebuilt markup file(s)");
  for (const f of MARKUP) {
    assert(exists(f), f + " is listed but missing");
    const src = read(f);
    const { legacy, nonK } = markupProblems(src);
    assert(!legacy.length, f + " still uses legacy classes: " + list(legacy));
    assert(!nonK.length, f + " uses classes without the k- prefix: " + list(nonK));
    const styles = staticStyles(src);
    assert(!styles.length, f + " writes static inline styles (only --custom-properties may ride style): " + list(styles, 4));
  }
});

/* ======================= E · depth budget ======================= */
console.log("== E · depth budget ==");

step("each rebuilt view renders within its wrapper-depth budget", async () => {
  const views = Object.entries(MIGRATION.views || {});
  console.log("       " + views.length + " rebuilt view(s)");
  if (!views.length) return;
  const { boot } = require("./lib/app-harness");
  const { seedAccount } = require("./lib/seed");
  const app = await boot();
  await seedAccount(app);
  for (const [view, spec] of views) {
    const budget = (spec && spec.depth) || DEFAULT_DEPTH;
    app.KOS.show(view, spec && spec.arg);
    await app.settle();
    const depth = maxDepth(app.document.getElementById("main"));
    assert(depth <= budget, view + " nests " + depth + " <div> levels under a section (budget " + budget + ")");
  }
});

/* ======================= F · the guards bite ======================= */
console.log("== F · the guards bite ==");

step("each guard rejects a fixture built to trip it", () => {
  const fixtureCss = `
    /* .rail-item in a comment is fine */
    .rail-item { color: var(--text); }
    .plain-box { padding: 12px; }
    [data-ui~="vault.card"] { display: grid; }
    .k-card { background: #fff; border: 1px solid rgb(0 0 0 / 10%); color: white; }
    @media (max-width: 900px) { .k-card { gap: 0; } }
    @media (min-width: 700px) { .k-card { gap: 0; } }`;
  assert(legacyClassesInCss(fixtureCss).join() === "rail-item", "the legacy-class guard missed .rail-item");
  assert(nonKClassesInCss(fixtureCss).includes("plain-box"), "the k- prefix guard missed .plain-box");
  assert(hookSelectors(fixtureCss).length === 1, "the data-ui selector guard missed it");
  const colours = colourLiterals(fixtureCss);
  assert(colours.includes("#fff") && colours.some((c) => /rgb\(/.test(c)) && colours.includes("white"),
    "the colour guard missed a literal: " + colours.join(", "));
  assert(!colourLiterals(".k-a { color: var(--gold); background: color-mix(in srgb, var(--accent) 40%, transparent); }").length,
    "the colour guard flags a token reference");
  assert(!colourLiterals(".k-ev { background: oklch(var(--cal-l) var(--cal-c) var(--ev-hue)); }").length,
    "the colour guard flags a colour built only from tokens");
  assert(colourLiterals(".k-ev { background: oklch(60% var(--cal-c) 30); }").length,
    "the colour guard misses a colour function with a literal channel");
  assert(rawPx(fixtureCss).join() === "12px", "the raw px guard is off: " + rawPx(fixtureCss).join());
  assert(badBreakpoints(fixtureCss).length === 2, "the breakpoint guard missed the 900px tier or the min-width band");
  assert(layerProblems("@layer views {\n.k-a { gap: 0; }\n}\n.k-b { gap: 0; }", "views", false).length,
    "the layer guard missed a rule outside the block");
  assert(!layerProblems("@layer views {\n.k-a { gap: 0; }\n}\n", "views", false).length, "the layer guard rejects a clean file");
  assert(!legacyClassesInCss(".skip-link:focus { outline: 0; } .sr-only { gap: 0; }").length,
    "the kept utilities were rejected");

  const fixtureJs = [
    'el("div", { class: "med-cover k-card" + (on ? " active" : ""), style: "margin-top:18px" });',
    'el("span", { class: "k-chip", style: "--ev-hue: 30" });',
    'node.style.width = "4px"; node.style.setProperty("--crop-x", "50%"); node.style.setProperty("color", "red");',
    'KOS.ui.setClass(t, "toast show");'
  ].join("\n");
  const m = markupProblems(fixtureJs);
  assert(m.legacy.includes("med-cover") && m.legacy.includes("active") && m.legacy.includes("toast"),
    "the markup guard missed a legacy class: " + m.legacy.join(", "));
  assert(!m.nonK.includes("k-card") && m.nonK.includes("show"), "the markup k- guard is off: " + m.nonK.join(", "));
  const st = staticStyles(fixtureJs);
  assert(st.length === 3 && st.some((x) => /margin-top/.test(x)) && st.includes(".style.width") && st.includes("setProperty(color)"),
    "the inline-style guard is off: " + st.join(" | "));

  const { JSDOM } = require("jsdom");
  const doc = new JSDOM("<main><section><div><div><div><div><div><p>deep</p></div></div></div></div></div></section>" +
    "<section><div><p>shallow</p></div></section></main>").window.document;
  assert(maxDepth(doc.querySelector("main")) === 5, "the depth guard miscounted: " + maxDepth(doc.querySelector("main")));
});

/* ======================= run ======================= */
(async () => {
  let pass = 0;
  const failures = [];
  for (const [name, fn] of steps) {
    try { await fn(); pass++; console.log("  ok  " + name); }
    catch (e) { failures.push(name + ": " + e.message); console.log("FAIL  " + name + "\n      " + e.message); }
  }
  console.log("\n==============================");
  if (failures.length) {
    console.log(`SMOKE55 FAIL — ${failures.length} of ${steps.length} steps failed.`);
    process.exit(1);
  }
  console.log(`SMOKE55 PASS — the legacy presentation stays deleted; ${LEGACY.count} frozen names, ` +
    `${SHEETS.length} sheets and ${MARKUP.length} rebuilt markup file(s) checked (${pass} steps).`);
  process.exit(0);
})();
