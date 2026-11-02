const { win } = require("./load.js");
const C = win.KOS_CONTENT, D = win.KOS_DATA.maths;
const leaves = [];
const walk = (n, sec) => { if (!n.children || !n.children.length) leaves.push({ ref: n.ref, title: n.title, sec }); else n.children.forEach(c => walk(c, sec)); };
D.sections.forEach(s => s.children.forEach(c => walk(c, s.ref)));
const words = s => (String(s).match(/[A-Za-z]{2,}/g) || []).length;
function textOf(b) {
  if (b == null) return "";
  if (typeof b === "string") return b;
  if (Array.isArray(b)) return b.map(textOf).join(" ");
  if (typeof b === "object") return Object.keys(b).filter(k => !["fig", "c", "x", "y", "axes", "items"].includes(k)).map(k => textOf(b[k])).join(" ");
  return "";
}
const rows = [];
for (const l of leaves) {
  const e = C["maths:" + l.ref];
  if (!e) { rows.push({ ref: l.ref, title: l.title, missing: true }); continue; }
  const notes = e.notes || [];
  let pages = 0, worked = 0, workedEx = 0, figs = 0, callouts = 0, longPara = 0, w = 0, blocks = 0, bankPages = 0;
  const cnt = b => {
    if (!b || typeof b !== "object") return;
    if (b.worked) { worked++; if (b.worked.tag === "exam") workedEx++; (b.worked.steps || []).forEach(s => { if (s.fig) figs++; }); if (b.worked.fig) figs++; }
    if (b.fig) figs++;
    if (b.callout) { callouts++; (Array.isArray(b.callout.body) ? b.callout.body : [b.callout.body]).forEach(cnt); }
  };
  notes.forEach(b => {
    if (b && b.page) { pages++; if (/past-paper|patterns/i.test(b.page)) bankPages++; return; }
    blocks++; cnt(b);
    const t = typeof b === "string" ? b : (b && (b.p || b.md)) || "";
    if (t && words(t) > 70) longPara++;
    w += words(textOf(b));
  });
  const fc = (e.flashcards || []), qz = (e.quiz || []), ex = (e.exam || []);
  const ans = {}; qz.forEach(q => ans[q.ans] = (ans[q.ans] || 0) + 1);
  rows.push({ ref: l.ref, title: l.title, pages, blocks, words: w, worked, workedEx, figs, callouts, longPara,
    fc: fc.length, fcBank: fc.filter(x => x.__bank).length, quiz: qz.length, quizBank: qz.filter(x => x.__bank).length,
    exam: ex.length, examDerived: ex.filter(x => x.__derived).length, examBank: ex.filter(x => x.__bank).length,
    ans0: ans[0] || 0, ansDist: JSON.stringify(ans), sims: (e.sims || []).length, gens: (e.gens || []).length });
}
require("fs").writeFileSync(__dirname + "/metrics.json", JSON.stringify(rows, null, 1));
const pad = (s, n) => String(s).padEnd(n);
console.log(pad("ref", 7), pad("title", 34), "pg blk  words wk wkEx fig co lp | fc(b) quiz(b) exam(d/b) ans0/qz");
rows.forEach(r => r.missing ? console.log(pad(r.ref, 7), pad(r.title.slice(0, 33), 34), "MISSING") :
  console.log(pad(r.ref, 7), pad(r.title.slice(0, 33), 34), pad(r.pages, 2), pad(r.blocks, 4), pad(r.words, 6), pad(r.worked, 2), pad(r.workedEx, 4), pad(r.figs, 3), pad(r.callouts, 2), pad(r.longPara, 2), "|", pad(r.fc + "(" + r.fcBank + ")", 6), pad(r.quiz + "(" + r.quizBank + ")", 7), pad(r.exam + "(" + r.examDerived + "/" + r.examBank + ")", 10), r.ans0 + "/" + r.quiz));
