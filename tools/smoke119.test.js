/* Kurenai OS — smoke119.test.js
   CSS: no component class defined twice with a conflicting meaning
   (quality audit W0 §A7 "no duplicate component class"; findings MG-18 —
   money.css's import stepper and first-run steps share .k-mn-steps /
   .k-mn-step — and CR-13 — creatives.css's inspector row and check page
   share .k-cr-check; W9 renames them .k-mn-istep / .k-cr-checkpage).

   A view stylesheet that defines `.k-x { display: flex }` in one place and
   `.k-x { display: grid }` in another (the same file further down, or
   another file in css/views/) gives one class two meanings: whichever rule
   comes later silently wins on BOTH surfaces. This suite parses every
   css/views/*.css, takes each rule whose selector list holds a bare
   component class (`.k-…`, nothing else on that selector) outside any
   conditional at-rule (@media, @supports, @container — @layer is not a
   condition), and reports every property two such rules set to DIFFERENT
   values. A refinement inside a media query is not a collision, and nor is
   the same value restated.

   RATCHETED: tools/baselines/smoke119-css.json holds today's collisions
   (class · property · files). The suite fails only on a collision not in
   it, and lists baseline entries that no longer occur so the file can be
   shrunk.

     A · every view stylesheet parses (balanced braces) and the scan finds
         rules to compare.
     B · no NEW conflicting duplicate component class.

   Run:
     node tools/smoke119.test.js
     node tools/smoke119.test.js --write-baseline   (re-record today's)  */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VIEWS = path.join(ROOT, "css", "views");
const BASELINE = path.join(ROOT, "tools", "baselines", "smoke119-css.json");
const WRITE = process.argv.includes("--write-baseline");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

/* ---- a small CSS reader: rules with their at-rule context, nesting-aware ---- */
function parseCss(src, file) {
  /* blank comments out but keep line numbers */
  src = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const rules = [];
  const stack = [];             /* frames: {at} | {sel, line, decl} */
  let prelude = "", preludeLine = 1, line = 1, quote = null, paren = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "\n") line++;
    const top = stack[stack.length - 1];
    if (quote) { if (ch === quote && src[i - 1] !== "\\") quote = null; prelude += ch; continue; }
    if (ch === '"' || ch === "'") { quote = ch; prelude += ch; continue; }
    if (ch === "(") paren++;
    if (ch === ")") paren = Math.max(0, paren - 1);
    if (ch === "{" && !paren) {
      const p = prelude.trim();
      if (p.startsWith("@")) stack.push({ at: p });
      else stack.push({ sel: p, line: preludeLine, decl: "" });
      prelude = "";
      continue;
    }
    if (ch === "}" && !paren) {
      if (top && top.sel != null) {
        top.decl += prelude;
        rules.push({ file, line: top.line, sel: top.sel, decl: top.decl,
          ctx: stack.filter((f) => f.at).map((f) => f.at),
          nested: stack.filter((f) => f.sel != null).length > 1 });
      }
      stack.pop();
      prelude = "";
      continue;
    }
    if (ch === ";" && !paren) {
      /* a declaration inside a rule, or a statement like `@layer x;` */
      if (top && top.sel != null) top.decl += prelude + ";";
      prelude = "";
      continue;
    }
    if (!prelude.trim()) preludeLine = line;
    prelude += ch;
  }
  if (stack.length) throw new Error(file + ": unbalanced braces (" + stack.length + " left open)");
  return rules;
}
function splitTop(s, sep) {
  const out = []; let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === sep && !depth) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  return out;
}
function decls(text) {
  const map = {};
  splitTop(text, ";").forEach((d) => {
    const i = d.indexOf(":");
    if (i < 0) return;
    const prop = d.slice(0, i).trim().toLowerCase();
    const val = d.slice(i + 1).trim().replace(/\s+/g, " ");
    if (prop && val) map[prop] = val;
  });
  return map;
}
const CONDITIONAL = /^@(media|supports|container|document)\b/i;

let defs = [], files = [];
let found = [];

step("A · every view stylesheet parses and has component rules", () => {
  files = fs.readdirSync(VIEWS).filter((f) => f.endsWith(".css")).sort();
  assert(files.length >= 10, "css/views/ holds the view stylesheets (found " + files.length + ")");
  files.forEach((f) => {
    const rel = "css/views/" + f;
    parseCss(fs.readFileSync(path.join(VIEWS, f), "utf8"), rel).forEach((r) => {
      if (r.nested) return;                                   /* `&` refinements belong to their parent */
      if (r.ctx.some((a) => CONDITIONAL.test(a))) return;     /* a media/feature refinement is not a second meaning */
      splitTop(r.sel, ",").map((s) => s.trim()).forEach((s) => {
        if (/^\.k-[\w-]+$/.test(s)) defs.push({ cls: s, file: r.file, line: r.line, d: decls(r.decl) });
      });
    });
  });
  assert(defs.length > 500, "found the bare component-class rules to compare (" + defs.length + ")");
});

step("B · no new conflicting duplicate component class (ratcheted)", () => {
  const byCls = {};
  defs.forEach((d) => { (byCls[d.cls] = byCls[d.cls] || []).push(d); });
  const hits = {};   /* key -> detail */
  Object.keys(byCls).sort().forEach((cls) => {
    const list = byCls[cls];
    if (list.length < 2) return;
    for (let a = 0; a < list.length; a++) {
      for (let b = a + 1; b < list.length; b++) {
        const A = list[a], B = list[b];
        if (A.file === B.file && A.line === B.line) continue;
        Object.keys(A.d).forEach((prop) => {
          if (!(prop in B.d) || A.d[prop] === B.d[prop]) return;
          const fs2 = [A.file, B.file].sort();
          const key = cls + " · " + prop + " · " + (fs2[0] === fs2[1] ? fs2[0] : fs2.join(" + "));
          (hits[key] = hits[key] || []).push(A.file + ":" + A.line + " `" + A.d[prop] + "` vs " + B.file + ":" + B.line + " `" + B.d[prop] + "`");
        });
      }
    }
  });
  found = Object.keys(hits).sort();
  if (WRITE) {
    fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
    fs.writeFileSync(BASELINE, JSON.stringify({
      _about: "smoke119: today's conflicting duplicate component classes in css/views/*.css (class · property · files). " +
        "The suite fails only on a collision NOT listed here. Shrink this list as W9 renames them; re-record with --write-baseline.",
      collisions: found
    }, null, 2) + "\n");
    console.log("       wrote " + path.relative(ROOT, BASELINE) + " (" + found.length + " collisions)");
    return;
  }
  assert(fs.existsSync(BASELINE), "the baseline exists (run with --write-baseline once)");
  const base = new Set(JSON.parse(fs.readFileSync(BASELINE, "utf8")).collisions);
  const fresh = found.filter((k) => !base.has(k));
  const gone = [...base].filter((k) => found.indexOf(k) < 0);
  console.log("       " + found.length + " known collision(s) across " + new Set(found.map((k) => k.split(" · ")[0])).size + " class(es)");
  if (gone.length) console.log("       FIXED (shrink the baseline): " + gone.join("; "));
  assert(!fresh.length, fresh.length + " new conflicting duplicate class definition(s):\n         " +
    fresh.map((k) => k + "\n           " + hits[k].join("\n           ")).join("\n         "));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.message ? e.message : e)); }
  }
  console.log(failed ? "smoke119: " + failed + " failed" : "smoke119: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
