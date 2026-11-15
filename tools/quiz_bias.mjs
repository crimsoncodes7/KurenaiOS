#!/usr/bin/env node
/* Kurenai OS — tools/quiz_bias.mjs
   The longest-option tell (W6, CC-03's second half): a quiz item whose
   right answer is the one long, careful option can be answered without
   knowing anything. Shuffling fixed the position tell (smoke138 A); this
   reports the length tell.

   An item is FLAGGED when its correct option is the unique longest AND at
   least 1.3 times the length of the next longest (characters). The share
   of items whose correct option is the longest at all is reported per
   group too (chance is about 25% with four options).

     node tools/quiz_bias.mjs                    every file with a flagged item
     node tools/quiz_bias.mjs <file> [<file>…]   each flagged item with its line
     node tools/quiz_bias.mjs --summary          per-group totals only

   Reads the content files as text (opts: [...], ans: n), so it needs no
   browser. smoke138 G holds the totals. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";

const DIR = "js/data/content";
export const RATIO = 1.3;

export function scan(file) {
  const src = fs.readFileSync(file, "utf8");
  const re = /opts\s*:\s*\[([\s\S]*?)\]\s*,\s*ans\s*:\s*(\d)/g;
  const items = [];
  let m;
  while ((m = re.exec(src))) {
    let opts;
    try { opts = vm.runInNewContext("[" + m[1] + "]"); } catch (e) { continue; }
    if (!Array.isArray(opts) || opts.length < 3) continue;
    const ans = +m[2];
    const L = opts.map((x) => String(x).length);
    const s = L.slice().sort((a, b) => b - a);
    const longest = L[ans] === s[0] && s[0] > s[1];
    const flagged = longest && s[0] >= RATIO * s[1];
    const line = src.slice(0, m.index).split("\n").length;
    items.push({ line, opts, ans, longest, flagged });
  }
  return items;
}

export function group(f) {
  const b = path.basename(f);
  if (/^bank-cs|^cs-/.test(b)) return "compsci";
  if (/^bank-maths|^maths-/.test(b)) return "maths";
  if (/^code-/.test(b)) return "code";
  if (/^it-/.test(b)) return "it";
  return "other";
}

export function totals() {
  const g = {};
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".js"))) {
    const items = scan(path.join(DIR, f));
    if (!items.length) continue;
    const k = group(f);
    const t = g[k] = g[k] || { items: 0, longest: 0, flagged: 0 };
    items.forEach((it) => { t.items++; if (it.longest) t.longest++; if (it.flagged) t.flagged++; });
  }
  return g;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.includes("--summary") || !args.length) {
    const t = totals();
    for (const [k, v] of Object.entries(t)) console.log(k.padEnd(8), v.items, "items ·", Math.round(100 * v.longest / v.items) + "% longest ·", v.flagged, "flagged");
    if (!args.length) {
      for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".js"))) {
        const n = scan(path.join(DIR, f)).filter((x) => x.flagged).length;
        if (n) console.log("  " + f + ": " + n);
      }
    }
  } else {
    for (const f of args) {
      const items = scan(f).filter((x) => x.flagged);
      console.log(f + ": " + items.length + " flagged");
      items.forEach((it) => console.log("  line " + it.line + " · ans " + it.ans + " · " + it.opts.map((o, i) => (i === it.ans ? "✓" : "·") + String(o).length).join(" ")));
    }
  }
}
