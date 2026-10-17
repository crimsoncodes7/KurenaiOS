// Simulates a learner on the facet scheduler to check that a day stays inside its budget
// (docs/japanese-plan.md §16 item 5). Run: node prototypes/japanese-space/sim.mjs [days] [dailyMin]
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require("./jasrs.js");
const S = globalThis.JA.srs;

const DAYS = +(process.argv[2] || 60), DAILY = +(process.argv[3] || 40), PROD = +(process.argv[4] || 100);
// the share of words in production sets (W and S facets); the rest are R and L only
S.produces = item => (+item.split(":")[1] * 37) % 100 < PROD;
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
// production is harder than recognition: the learner's real recall is a little below the model's
const SKILL_EASE = { R: 1, L: 0.97, W: 0.93, S: 0.9 };

let facets = {}, next = 1, worst = 0, total = 0, rows = [];
for (let day = 0; day < DAYS; day++) {
  const budget = S.newBudget(facets, day, { dailyMin: DAILY });
  for (let i = 0; i < budget.newItems; i++) facets = S.introduce(facets, "w:" + next++, day);
  const q = S.queue(facets, day);
  let secs = 0;
  for (const k of q) {
    const f = facets[k], { item, skill } = S.split(k);
    const r = f.reps ? S.retrievability(day - f.last, f.s) * SKILL_EASE[skill] : 0.75;
    const ok = rnd() < r, x = rnd();
    const g = !ok ? 1 : x < 0.1 ? 2 : x < 0.85 ? 3 : 4;
    facets = Object.assign({}, facets, { [k]: S.review(f, g, day) });
    facets = S.unlock(facets, item, day);
    secs += S.SECS[skill] * (ok ? 1 : 1.6); // a miss costs the feedback and a retry
  }
  const mins = secs / 60 + budget.newItems * 1.2 + 8 + 7;
  worst = Math.max(worst, mins); total += mins;
  const sk = S.skills(facets);
  rows.push({ day, mins: mins.toFixed(1), reviews: q.length, newItems: budget.newItems, words: next - 1, R: sk.R.stable, L: sk.L.stable, W: sk.W.stable, S: sk.S.stable });
}
const show = rows.filter(r => r.day % 10 === 9 || r.day < 3);
console.table(show);
const avg = total / DAYS;
console.log(`days ${DAYS} · budget ${DAILY} min · production ${PROD}% · average ${avg.toFixed(1)} min · worst day ${worst.toFixed(1)} min · words introduced ${next - 1}`);
const ok = worst <= DAILY * 1.15 && avg <= DAILY;
console.log(ok ? "✓ load stays within budget (worst day ≤ 115%)" : "✗ load exceeds budget");
process.exit(ok ? 0 : 1);
