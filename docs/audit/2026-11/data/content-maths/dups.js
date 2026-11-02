const { win } = require("./load.js");
const C = win.KOS_CONTENT;
const STOP = new Set("the a an of to and is in for on what which with by its it at be as are that this when how find give state write use using from x y".split(" "));
const norm = s => String(s).toLowerCase().replace(/\\(dfrac|frac|tfrac|left|right|text|mathrm|displaystyle|quad|,|;)/g, " ").replace(/[^a-z0-9]+/g, " ").split(" ").filter(t => t && !STOP.has(t));
const jac = (a, b) => { const A = new Set(a), B = new Set(b); let i = 0; A.forEach(t => B.has(t) && i++); return i / (A.size + B.size - i || 1); };
const keys = Object.keys(C).filter(k => k.startsWith("maths:"));
const out = { within: [], cross: [], quizBad: [], fmt: [] };
const all = [];
for (const k of keys) {
  const e = C[k];
  const items = [];
  (e.flashcards || []).forEach((f, i) => items.push({ k, kind: "fc", i, q: f[0], a: f[1], bank: !!f.__bank }));
  (e.quiz || []).forEach((q, i) => {
    items.push({ k, kind: "qz", i, q: q.q, a: (q.opts || [])[q.ans], bank: !!q.__bank });
    if (!Array.isArray(q.opts) || q.ans == null || q.ans < 0 || q.ans >= q.opts.length) out.quizBad.push([k, i, "ans out of range", q.q]);
    else { const s = new Set(q.opts.map(o => String(o).trim())); if (s.size < q.opts.length) out.quizBad.push([k, i, "duplicate options", q.q, q.opts]); if (q.opts.length < 3) out.quizBad.push([k, i, "few opts", q.q]); if (!q.why) out.quizBad.push([k, i, "no why", q.q]); }
  });
  items.forEach(it => { it.t = norm(it.q + " " + it.a); it.tq = norm(it.q); all.push(it); });
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const s = jac(items[i].t, items[j].t), sq = jac(items[i].tq, items[j].tq);
    if (s >= 0.55 || (sq >= 0.7 && items[i].tq.length >= 3)) out.within.push([k, items[i].kind + items[i].i + (items[i].bank ? "b" : ""), items[j].kind + items[j].i + (items[j].bank ? "b" : ""), +s.toFixed(2), +sq.toFixed(2), items[i].q, "→", items[i].a, "||", items[j].q, "→", items[j].a]);
  }
  // formatting
  const strs = [];
  (e.flashcards || []).forEach((f, i) => { strs.push(["fc" + i + "q", f[0]]); strs.push(["fc" + i + "a", f[1]]); });
  (e.quiz || []).forEach((q, i) => { strs.push(["qz" + i + "q", q.q]); (q.opts || []).forEach((o, j) => strs.push(["qz" + i + "o" + j, o])); strs.push(["qz" + i + "why", q.why]); });
  for (const [id, s0] of strs) {
    if (s0 == null) { out.fmt.push([k, id, "null/undefined"]); continue; }
    const s = String(s0);
    const d = (s.replace(/\\\$/g, "").match(/\$/g) || []).length;
    if (d % 2) out.fmt.push([k, id, "odd $", s]);
    if ((s.match(/\*\*/g) || []).length % 2) out.fmt.push([k, id, "odd **", s]);
    if (/\\\\[a-z]/i.test(s)) out.fmt.push([k, id, "double backslash", s]);
    if (/\n/.test(s)) out.fmt.push([k, id, "newline", s]);
    if (/[a-z]\^[0-9]{2,}|\bx2\b|\bsqrt\(/i.test(s.replace(/\$[^$]*\$/g, ""))) out.fmt.push([k, id, "math outside $", s]);
    if (/\\(frac|sqrt|int|sum|theta|alpha|pi|mu|sigma|times|le|ge)\b/.test(s.replace(/\$[^$]*\$/g, ""))) out.fmt.push([k, id, "latex outside $", s]);
    const w = (s.match(/\S+/g) || []).length;
    if (id.endsWith("a") && id.startsWith("fc") && w > 45) out.fmt.push([k, id, "long answer " + w + "w", s.slice(0, 160)]);
  }
}
// cross-leaf near duplicates (flashcards only, not trivial)
for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
  const a = all[i], b = all[j]; if (a.k === b.k || a.t.length < 4) continue;
  const s = jac(a.t, b.t); if (s >= 0.7) out.cross.push([a.k, a.kind + a.i, b.k, b.kind + b.i, +s.toFixed(2), a.q, "→", a.a, "||", b.q, "→", b.a]);
}
require("fs").writeFileSync(__dirname + "/dups.json", JSON.stringify(out, null, 1));
console.log("within", out.within.length, "cross", out.cross.length, "quizBad", out.quizBad.length, "fmt", out.fmt.length);
const byK = {}; out.within.forEach(r => byK[r[0]] = (byK[r[0]] || 0) + 1); console.log(byK);
const fk = {}; out.fmt.forEach(r => fk[r[2].replace(/\d+w/, "")] = (fk[r[2].replace(/\d+w/, "")] || 0) + 1); console.log(fk);
