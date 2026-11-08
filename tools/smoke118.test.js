/* Kurenai OS — smoke118.test.js
   A menu opened inside a dialog must be on top of that dialog
   (quality audit W0 §A7 "menus: every menu opened inside a dialog can be
   clicked"; findings PR-01 — the Afternoon review's "Place in a free
   block" opens BEHIND the review — and UR-24 — the pen toolbar's colours
   in Files; the fix is W3's RC2).

   KOS.ui.menu appends its panel to <body> at z-index var(--z-menu) (110);
   openDialog's overlay sits at var(--z-modal) (120). So a menu opened from
   a control inside a dialog is painted under the scrim and a tap lands on
   the dialog. jsdom has no layout, so `elementFromPoint` cannot answer;
   this suite decides "on top" from the two facts that settle it: the panel
   is mounted INSIDE the dialog's overlay (it then stacks within it), or the
   z-index token the panel's rule resolves to is above the overlay's.

     A · the tokens: --z-menu and --z-modal are read from css/tokens.css,
         and the panel's and overlay's z-index are resolved through
         css/components.css.
     B · the primitive: in a booted app, openDialog an overlay holding a
         KOS.ui.menu, open the menu → is the panel on top? (Today: NO. The
         answer is ratcheted: a known violation passes, and the suite says
         so; once fixed it passes for real and asks for the baseline to
         drop it.) The item still runs its onSelect when clicked.
     C · the call sites: a static scan lists every KOS.ui.menu call that can
         be opened inside a dialog — in a file that opens dialogs itself, or
         in a module a dialog-opening file mounts (the ink toolbar inside
         the PDF viewer). While B's violation stands, a NEW such call site
         fails the suite.

   RATCHETED: tools/baselines/smoke118-menus.json.

   Run:
     node tools/smoke118.test.js
     node tools/smoke118.test.js --write-baseline   (re-record today's)  */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const ROOT = path.join(__dirname, "..");
const BASELINE = path.join(ROOT, "tools", "baselines", "smoke118-menus.json");
const WRITE = process.argv.includes("--write-baseline");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

const tokens = {}, zOf = {};
let app, K, primitiveOk = null, primitiveWhy = "", sites = [];

/* the z-index a rule for `cls` in components.css sets, resolved through the tokens */
function ruleZ(css, cls) {
  const re = new RegExp("(^|\\})\\s*\\." + cls.replace(/-/g, "\\-") + "\\s*\\{([^}]*)\\}", "m");
  const m = re.exec(css);
  if (!m) return null;
  const z = /z-index\s*:\s*([^;]+);?/.exec(m[2]);
  if (!z) return null;
  const v = z[1].trim();
  const t = /^var\((--[\w-]+)\)$/.exec(v);
  return t ? { token: t[1], value: tokens[t[1]] } : { token: null, value: parseFloat(v) };
}

step("A · the stacking tokens resolve", () => {
  const tok = fs.readFileSync(path.join(ROOT, "css/tokens.css"), "utf8");
  for (const m of tok.matchAll(/(--z-[\w-]+)\s*:\s*(-?\d+)\s*;/g)) tokens[m[1]] = +m[2];
  assert(typeof tokens["--z-menu"] === "number" && typeof tokens["--z-modal"] === "number", "--z-menu and --z-modal are numbers in tokens.css");
  const comp = fs.readFileSync(path.join(ROOT, "css/components.css"), "utf8");
  zOf.panel = ruleZ(comp, "k-menu-panel");
  zOf.overlay = ruleZ(comp, "k-dialog-overlay");
  assert(zOf.panel && zOf.panel.value != null, ".k-menu-panel has a z-index");
  assert(zOf.overlay && zOf.overlay.value != null, ".k-dialog-overlay has a z-index");
  console.log("       menu panel z " + zOf.panel.value + " (" + (zOf.panel.token || "literal") + "), dialog overlay z " +
    zOf.overlay.value + " (" + (zOf.overlay.token || "literal") + ")");
});

step("B · a menu opened inside openDialog is on top of it (ratcheted)", async () => {
  app = await boot();
  K = app.KOS;
  const doc = app.document, el = K.ui.el;
  let picked = 0;
  const m = K.ui.menu({ label: "Pick", items: [{ label: "First", onSelect: () => { picked++; } }, { label: "Second" }] });
  const box = el("div", { "data-ui": "ui.dialog" }, [el("h2", { text: "A dialog" }), m]);
  const overlay = el("div", {}, [box]);
  doc.body.appendChild(overlay);
  K.ui.openDialog(overlay, { label: "A dialog" });
  m.click();
  await app.settle();
  const panel = doc.querySelector("[data-ui~='ui.menu-panel']");
  assert(panel, "the menu opened a panel");
  assert(m.getAttribute("aria-expanded") === "true", "the button says it is open");
  const inside = overlay.contains(panel);
  const above = zOf.panel.value > zOf.overlay.value;
  primitiveOk = inside || above;
  primitiveWhy = "panel parent <" + panel.parentNode.nodeName.toLowerCase() + ">" + (inside ? " inside the overlay" : " outside the overlay") +
    ", z " + zOf.panel.value + " vs overlay " + zOf.overlay.value;
  const item = panel.querySelector("[role='menuitem']");
  item.click();
  assert(picked === 1, "the item's onSelect ran once");
  assert(!doc.querySelector("[data-ui~='ui.menu-panel']"), "choosing an item closed the menu");
  console.log("       " + (primitiveOk ? "ON TOP: " : "BEHIND the dialog: ") + primitiveWhy);
});

/* ---- static scan ---- */
/* strip comments and string/template contents (kept as blanks) so braces in text don't count */
function blankText(src) {
  let out = "", i = 0, q = null;
  while (i < src.length) {
    const ch = src[i], nx = src[i + 1];
    if (q) {
      if (ch === "\\") { out += "  "; i += 2; continue; }
      if (ch === q) { q = null; out += ch; i++; continue; }
      out += ch === "\n" ? "\n" : " "; i++; continue;
    }
    if (ch === "/" && nx === "/") { while (i < src.length && src[i] !== "\n") { out += " "; i++; } continue; }
    if (ch === "/" && nx === "*") { const e = src.indexOf("*/", i + 2); const end = e < 0 ? src.length : e + 2; out += src.slice(i, end).replace(/[^\n]/g, " "); i = end; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { q = ch; out += ch; i++; continue; }
    out += ch; i++;
  }
  return out;
}
function jsFiles(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? jsFiles(path.join(dir, d.name)) : d.name.endsWith(".js") ? [path.join(dir, d.name)] : []);
}

step("C · every menu that can open inside a dialog is listed (ratcheted)", () => {
  const files = ["js/core", "js/modules", "js/engines", "js/labs"].flatMap(jsFiles);
  const text = {}; files.forEach((f) => { text[f] = fs.readFileSync(path.join(ROOT, f), "utf8"); });
  const opensDialog = files.filter((f) => /\bopenDialog\s*\(/.test(text[f]) && !/js\/core\/ui\.js$/.test(f));
  /* a module a dialog-opening file mounts: it defines KOS.<ns> and a dialog file reads KOS.<ns>. */
  function hostedBy(f) {
    const ns = [...text[f].matchAll(/\bKOS\.(\w+)\s*=/g)].map((m) => m[1]).filter((n) => !/^(views|ui)$/.test(n));
    return opensDialog.filter((d) => d !== f && ns.some((n) => new RegExp("\\bKOS\\." + n + "\\.").test(text[d])));
  }
  sites = [];
  files.forEach((f) => {
    if (/js\/core\/ui\.js$/.test(f)) return;
    const src = text[f], blank = blankText(src);
    const calls = [...src.matchAll(/KOS\.ui\.menu\s*\(/g)];
    if (!calls.length) return;
    const own = opensDialog.indexOf(f) >= 0, hosts = hostedBy(f);
    if (!own && !hosts.length) return;
    calls.forEach((m) => {
      const at = m.index;
      const line = src.slice(0, at).split("\n").length;
      const lab = /label\s*:\s*("([^"]*)"|'([^']*)'|([^,}]+))/.exec(src.slice(at, at + 400));
      const label = lab ? (lab[2] != null ? lab[2] : lab[3] != null ? lab[3] : lab[4].trim()) : "?";
      /* lexical: is the call inside a function body (not the file's IIFE) that itself opens a dialog? */
      let depth = 0, lexical = false;
      for (let i = at; i >= 0; i--) {
        const ch = blank[i];
        if (ch === "}") depth++;
        else if (ch === "{") {
          if (depth) { depth--; continue; }
          let d = 0, j = i;
          for (; j < blank.length; j++) { if (blank[j] === "{") d++; else if (blank[j] === "}" && --d === 0) break; }
          const body = src.slice(i, j);
          if (body.length < src.length * 0.8 && /\bopenDialog\s*\(/.test(body)) { lexical = true; break; }
        }
      }
      sites.push({ key: f + " · " + label, where: f + ":" + line,
        how: lexical ? "inside a function that opens a dialog" : own ? "in a file that opens dialogs" : "mounted by " + hosts.join(", ") });
    });
  });
  const keys = [...new Set(sites.map((s) => s.key))].sort();
  console.log("       " + sites.length + " menu call site(s) that can open inside a dialog:");
  sites.forEach((s) => console.log("         " + s.where + "  \"" + s.key.split(" · ").slice(1).join(" · ") + "\"  — " + s.how));

  if (WRITE) {
    fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
    fs.writeFileSync(BASELINE, JSON.stringify({
      _about: "smoke118: KOS.ui.menu inside KOS.ui.openDialog. `primitiveBehind` records that today the panel is painted BEHIND the dialog " +
        "(PR-01/UR-24, fixed in W3 RC2); `sites` are the menu call sites (file · label) a static scan finds that can open inside a dialog. " +
        "While the primitive is behind, a call site not listed here fails. Re-record with --write-baseline.",
      primitiveBehind: primitiveOk === false,
      sites: keys
    }, null, 2) + "\n");
    console.log("       wrote " + path.relative(ROOT, BASELINE));
    return;
  }
  assert(fs.existsSync(BASELINE), "the baseline exists (run with --write-baseline once)");
  const base = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
  if (primitiveOk) {
    if (base.primitiveBehind) console.log("       FIXED (shrink the baseline): the menu primitive is now on top inside a dialog; set primitiveBehind to false");
    return;
  }
  assert(base.primitiveBehind, "a menu opened inside a dialog is BEHIND it (" + primitiveWhy + ") — this regressed from a fixed baseline");
  const known = new Set(base.sites || []);
  const fresh = keys.filter((k) => !known.has(k));
  const gone = [...known].filter((k) => keys.indexOf(k) < 0);
  if (gone.length) console.log("       no longer found (shrink the baseline): " + gone.join("; "));
  assert(!fresh.length, "new menu(s) that can open inside a dialog while menus still open behind dialogs (PR-01): " + fresh.join("; ") +
    " — mount the panel in the dialog (W3 RC2) or open it outside a dialog");
  console.log("       known violation: menus open behind dialogs (PR-01/UR-24), baselined until W3");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  if (app && app.errors.length) console.log("       app errors: " + app.errors.join(" | "));
  console.log(failed ? "smoke118: " + failed + " failed" : "smoke118: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
