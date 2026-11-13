/* Kurenai OS — smoke137.test.js
   W3's global fixes: the floors no page may undo, and round controls that
   stay round (quality W3, RC17 and the rest of RC2).

     A · AX-01: the 16px phone field rule lives in the LAST cascade layer
         (`floors`, declared last in css/tokens.css and linked after every
         other local stylesheet), so no component or view class can bring
         back the iOS zoom; it covers text inputs, selects, textareas and
         editable areas and leaves checkboxes, radios and ranges alone.
     B · SH-03/AG-01: a painted page header is stacked ABOVE the page body
         (a z-index on its isolated context), so the Seat's ⋯ popover is not
         painted under the Stage; the ⋯ is a 44px circle on touch.
     C · invariant 69: every round control the audit found as an oval on
         touch sets its width with its height (AA-14 the Assistant's day
         toggles, CR-07 Creatives' days, AG-06 a set's badge chips, JM-25
         Japanese checkpoint stops), and the day letters are centred.

   jsdom has no cascade layers or layout, so this holds the CSS contract
   by reading it; the computed sizes were measured in a browser at 375px.

   Run: node tools/smoke137.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

/* the declarations a selector gets inside `@media (<cond>)` blocks of a file */
function inMedia(src, cond, selector) {
  const out = [];
  const re = new RegExp("@media\\s*\\(" + cond.replace(/[()]/g, "\\$&") + "\\)\\s*\\{", "g");
  let m;
  while ((m = re.exec(src))) {
    let depth = 1, i = m.index + m[0].length, start = i;
    for (; i < src.length && depth; i++) { if (src[i] === "{") depth++; else if (src[i] === "}") depth--; }
    const body = src.slice(start, i - 1);
    for (const r of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (r[1].split(",").map((x) => x.trim()).includes(selector)) out.push(r[2]);
    }
  }
  return out.join(";");
}
const decl = (body, prop) => { const m = new RegExp("(?:^|;|\\s)" + prop + "\\s*:\\s*([^;]+)").exec(body); return m ? m[1].trim() : null; };

step("A · AX-01: the 16px field rule is in the last layer, linked last", () => {
  const tokens = strip(read("css/tokens.css"));
  const order = /@layer\s+([\w\s,]+);/.exec(tokens);
  assert(order, "the cascade-order statement");
  const layers = order[1].split(",").map((s) => s.trim());
  assert(layers[layers.length - 1] === "floors", "floors is declared last: " + layers.join(", "));
  const html = read("index.html");
  const local = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="(css\/[^"]+)"/g)].map((m) => m[1]);
  assert(local[local.length - 1] === "css/floors.css", "floors.css is the last local stylesheet: " + local.slice(-2).join(", "));
  const floors = strip(read("css/floors.css"));
  assert(/^\s*@layer\s+floors\s*\{/.test(floors), "it is one @layer floors block");
  const ph = /@media\s*\(max-width:\s*700px\)\s*\{([\s\S]*?)\}\s*\}/.exec(floors);
  assert(ph, "a phone-tier block");
  const sel = ph[1];
  ["input:not([type=\"checkbox\"])", "select", "textarea", "[contenteditable=\"true\"]"].forEach((s) => assert(sel.indexOf(s) !== -1, "covers " + s));
  ["checkbox", "radio", "range"].forEach((t) => assert(sel.indexOf(':not([type="' + t + '"])') !== -1, "leaves " + t + " alone"));
  assert(/font-size:\s*max\(var\(--fs-16\),\s*1em\)/.test(sel), "16px or more");
  assert(/--fs-16:\s*16px/.test(tokens), "--fs-16 is 16px");
});

step("B · SH-03/AG-01: a painted header stacks above the page; the ⋯ is round on touch", () => {
  const comp = strip(read("css/components.css"));
  const r = /\.k-pagehead\[data-state~="has-art"\]\s*\{([^}]*)\}/.exec(comp);
  assert(r && /isolation:\s*isolate/.test(r[1]) && /z-index:\s*var\(--z-stage\)/.test(r[1]), "isolated AND raised above the body: " + (r && r[1]));
  const gov = strip(read("css/views/governor.css"));
  const b = inMedia(gov, "pointer: coarse", ".k-gv-tools-btn");
  assert(decl(b, "inline-size") === "var(--hit-coarse)" && decl(b, "block-size") === "var(--hit-coarse)", "44 × 44 on touch: " + b);
});

step("C · invariant 69: the round controls the audit found as ovals stay circles", () => {
  const cases = [
    ["css/views/assistant.css", ".k-asst-day", "AA-14"],
    ["css/views/creatives.css", ".k-cr-day", "CR-07"],
    ["css/views/japanese.css", ".k-ja-cp", "JM-25"]
  ];
  for (const [file, sel, id] of cases) {
    const b = inMedia(strip(read(file)), "pointer: coarse", sel);
    const w = decl(b, "inline-size"), h = decl(b, "block-size");
    assert(w && h && w === h, id + " " + sel + ": width and height set together on touch (" + w + " × " + h + ")");
    const mh = decl(b, "min-block-size");
    assert(!mh || mh === h, id + " " + sel + ": the 44px floor does not make it taller than wide (min-block-size " + mh + ")");
  }
  const ach = strip(read("css/views/achievements.css"));
  const chip = /\.k-ach-dlg-chip\s*\{([^}]*)\}/.exec(ach);
  assert(chip && /aspect-ratio:\s*1/.test(chip[1]) && /place-items:\s*center/.test(chip[1]), "AG-06: the chip is square and centres its medal");
  const cb = inMedia(ach, "pointer: coarse", ".k-ach-dlg-chip");
  assert(decl(cb, "min-inline-size") === decl(cb, "min-block-size"), "AG-06: as wide as tall on touch");
  const cr = /\.k-cr-day\s*\{([^}]*)\}/.exec(strip(read("css/views/creatives.css")));
  assert(cr && /place-items:\s*center/.test(cr[1]), "CR-07: the day letter is centred");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.message)); }
  }
  console.log(failed ? "smoke137: " + failed + " failed" : "smoke137: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
