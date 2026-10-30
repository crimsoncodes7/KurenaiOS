#!/usr/bin/env node
/* Write art-source/app/ach-defs.json from the Badge Wall's registry (roadmap 5.16–5.17): every
   badge with no unit picture, and every set — what tools/gen_ach_manifest.py writes art briefs for.
     node tools/gen_ach_defs.mjs && python3 -I tools/gen_ach_manifest.py                         */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
const require = createRequire(import.meta.url);
import { fileURLToPath } from "url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { boot } = require(path.join(ROOT, "tools/lib/app-harness.js"));
const app = await boot();
await app.settle();
const A = app.KOS.achievements;
const defs = A.defs().filter((d) => !/^app\.badge\./.test(d.art || "")).map((d) => ({ id: d.id, set: d.set, name: d.name, what: d.what, tiers: d.tiers, hidden: !!d.hidden, glyph: d.glyph }));
const sets = A.sets().map((s) => ({ id: s.id, name: s.name, hue: s.hue, glyph: s.glyph, kicker: s.kicker, units: !!s.units }));
fs.writeFileSync(path.join(ROOT, "art-source/app/ach-defs.json"), JSON.stringify({ defs, sets }, null, 1) + "\n");
console.log(defs.length, "badges and", sets.length, "sets written");
process.exit(0);
