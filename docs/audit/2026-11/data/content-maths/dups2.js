const { win } = require("./load.js");
const C = win.KOS_CONTENT;
const canon = s => String(s).toLowerCase().replace(/\\[dt]frac/g, "\\frac").replace(/\\left|\\right|\\displaystyle|\\[,;!]|\\quad/g, "").replace(/\\text\{([^}]*)\}/g, "$1").replace(/[\s$?.:=,]+/g, "").replace(/≡|\\equiv/g, "");
const grams = s => { const g = new Set(); for (let i = 0; i < s.length - 2; i++) g.add(s.slice(i, i + 3)); return g; };
const jac = (A, B) => { let i = 0; A.forEach(t => B.has(t) && i++); return i / (A.size + B.size - i || 1); };
const res = [];
const keys = Object.keys(C).filter(k => k.startsWith("maths:"));
const all = [];
for (const k of keys) {
  const e = C[k], it = [];
  (e.flashcards || []).forEach((f, i) => it.push({ k, id: "fc" + i + (f.__bank ? "b" : ""), q: f[0], a: f[1] }));
  (e.quiz || []).forEach((q, i) => it.push({ k, id: "qz" + i + (q.__bank ? "b" : ""), q: q.q, a: (q.opts || [])[q.ans] }));
  it.forEach(x => { x.cq = canon(x.q); x.ca = canon(x.a); x.g = grams(x.cq + "|" + x.ca); x.gq = grams(x.cq); all.push(x); });
  for (let i = 0; i < it.length; i++) for (let j = i + 1; j < it.length; j++) {
    const a = it[i], b = it[j];
    const s = jac(a.g, b.g), sq = jac(a.gq, b.gq), sameA = a.ca && a.ca === b.ca && a.ca.length > 3;
    if (s >= 0.6 || sq >= 0.8 || (sameA && sq >= 0.35)) res.push({ k, a: a.id, b: b.id, s: +s.toFixed(2), sq: +sq.toFixed(2), sameA, A: a.q + " → " + a.a, B: b.q + " → " + b.a });
  }
}
const cross = [];
for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { const a = all[i], b = all[j]; if (a.k === b.k) continue; const s = jac(a.g, b.g); if (s >= 0.6 && a.cq.length > 12) cross.push({ a: a.k + " " + a.id, b: b.k + " " + b.id, s: +s.toFixed(2), A: a.q + " → " + a.a, B: b.q + " → " + b.a }); }
require("fs").writeFileSync(__dirname + "/dups2.json", JSON.stringify({ res, cross }, null, 1));
const byK = {}; res.forEach(r => byK[r.k] = (byK[r.k] || 0) + 1);
console.log(res.length, cross.length, JSON.stringify(byK));
