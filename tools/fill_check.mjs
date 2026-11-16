#!/usr/bin/env node
/* tools/fill_check.mjs — every figure and every part to fill in (roadmap
   5.19, design turn 43) checked before it ships:
     fig      every curve's expression compiles (KOS.figures.compile);
     grid     every row as wide as its columns, `given` inside the table;
     sql      the setup loads and the answer runs in native SQLite (sql.js in
              Node), returns at least one row, and a starter (if any) differs;
     gates    every input and gate id resolves, `pick` names a gate, a
              picked gate's real type is one of the six;
     predict  the code runs in the C# interpreter and, with `expect`, prints it.
   Walks the notes (worked examples, their `try`, `fig`), quiz and exam items
   and the Companion's variations.
     node tools/fill_check.mjs            all subjects
     node tools/fill_check.mjs maths      one subject id (compsci | maths | it)
   Exits 1 on any problem, printing where it is. */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { boot } = require("./lib/app-harness");
const { loadSql, KOSQL } = require("./lib/sql-node.js");
const CSI = require("../js/labs/cs-interp.js");

const only = process.argv[2] || null;
const app = await boot({ clock: "2026-11-16T10:00:00" });
const K = app.KOS, C = app.window.KOS_CONTENT, F = K.fillIns, FIG = K.figures;
const SQL = (await loadSql()).SQL;   /* loadSql gives {SQL, run} */
const problems = [];
let counts = { fig: 0, grid: 0, sql: 0, gates: 0, predict: 0, lab: 0 };
const bad = (where, msg) => problems.push(where + ": " + msg);

function checkFig(where, f) {
  counts.fig++;
  (f.items || []).forEach((it, i) => {
    const vars = ["x"];
    if (it.fn && !FIG.compile(it.fn, vars)) bad(where, "figure item " + i + " fn does not compile: " + it.fn);
    if (it.shade && it.shade.fn && !FIG.compile(it.shade.fn, vars)) bad(where, "figure shade fn does not compile: " + it.shade.fn);
    if (it.param && (!FIG.compile(it.param.x, ["t"]) || !FIG.compile(it.param.y, ["t"]))) bad(where, "figure param does not compile");
  });
  try { const svg = FIG.render(f); if (!/<svg/.test(svg)) bad(where, "figure renders no SVG"); } catch (e) { bad(where, "figure throws: " + e.message); }
}
async function checkFill(where, kind, s) {
  counts[kind === "trace" ? "grid" : kind]++;
  if (kind === "grid" || kind === "trace") {
    if (!Array.isArray(s.cols) || !s.cols.length || !Array.isArray(s.rows) || !s.rows.length) return bad(where, "grid needs cols and rows");
    s.rows.forEach((r, i) => { if (r.length !== s.cols.length) bad(where, "grid row " + (i + 1) + " has " + r.length + " cells for " + s.cols.length + " columns"); });
    (s.given || []).forEach((rc) => { if (!s.rows[rc[0]] || rc[1] >= s.cols.length) bad(where, "grid given cell outside the table: " + rc); });
    const typed = s.rows.length * s.cols.length - (s.given || []).length;
    if (!typed) bad(where, "grid has nothing to fill in");
  } else if (kind === "sql") {
    if (!s.setup || !s.answer) return bad(where, "sql needs setup and answer");
    const r = KOSQL.run(SQL, { src: s.answer, seed: s.setup });
    if (!r.ok) return bad(where, "sql answer fails: " + (r.error && r.error.msg));
    const set = r.sets[r.sets.length - 1];
    if (!set || !set.rows.length) bad(where, "sql answer returns no rows");
    if (!F.tablesOf(s.setup).length) bad(where, "sql setup names no table");
    if (s.starter && s.starter.trim() === s.answer.trim()) bad(where, "sql starter is the answer");
  } else if (kind === "gates") {
    const ids = new Set(s.inputs || []);
    (s.gates || []).forEach((g) => ids.add(g.id));
    (s.gates || []).forEach((g) => (g.in || []).forEach((i) => { if (!ids.has(i)) bad(where, "gate " + g.id + " reads unknown " + i); }));
    if (!ids.has(s.out)) bad(where, "gates out is unknown: " + s.out);
    if (s.pick) { const g = (s.gates || []).find((x) => x.id === s.pick); if (!g) bad(where, "gates pick names no gate"); else if (!["AND", "OR", "NOT", "NAND", "NOR", "XOR"].includes(g.type)) bad(where, "picked gate type not offered: " + g.type); }
    if (!s.pick && !s.fill) bad(where, "gates needs pick or fill");
    try { F.truth(s); } catch (e) { bad(where, "gates does not evaluate: " + e.message); }
  } else if (kind === "predict") {
    if (!s.code) return bad(where, "predict needs code");
    const r = await CSI.run({ files: [{ name: "Program.cs", src: s.code }], stdin: s.stdin || "" });
    if (!r.ok) return bad(where, "predict code fails: " + ((r.error && (r.error.msg || r.error.message)) || "error"));
    if (s.expect != null && K.codeRun.norm(s.expect) !== K.codeRun.norm(r.stdout)) bad(where, "predict expect differs from the output: " + JSON.stringify(r.stdout));
  } else if (kind === "lab") {
    if (!K.sims.get(s)) bad(where, "no lab " + s);
  }
}
const FILL = ["grid", "trace", "sql", "gates", "predict", "lab"];
async function walkBlocks(where, blocks) {
  for (const b of blocks || []) {
    if (!b || typeof b !== "object") continue;
    if (b.fig) checkFig(where, b.fig);
    for (const k of FILL) if (b[k] != null && typeof b[k] !== "boolean" && !b.worked) await checkFill(where, k, b[k]);
    if (b.worked) {
      const w = b.worked, wh = where + " · " + (w.title || w.src || "worked");
      if (w.fig) checkFig(wh, w.fig);
      for (const st of w.steps || []) if (st && st.fig) checkFig(wh, st.fig);
      await walkBlocks(wh + " · try", w.try);
      if (Array.isArray(w.q)) await walkBlocks(wh, w.q);
    }
    if (b.callout && Array.isArray(b.callout.body)) await walkBlocks(where, b.callout.body);
  }
}
for (const key of Object.keys(C)) {
  const sid = key.split(":")[0];
  if (only ? sid !== only : !/^(compsci|maths|it)$/.test(sid)) continue;
  const c = C[key];
  const pages = Array.isArray(c.notes) ? c.notes : [];
  for (const p of pages) await walkBlocks(key, p && p.blocks ? p.blocks : [p]);
  for (const [i, q] of (c.quiz || []).entries()) if (q.fig) checkFig(key + " quiz " + (i + 1), q.fig);
  for (const [i, q] of (c.exam || []).entries()) { if (q.fig) checkFig(key + " exam " + (i + 1), q.fig); await walkBlocks(key + " exam " + (i + 1), q.try); }
}
const E = app.window.KOS_EXAMS;
if (E && E.deep && (!only || only === "compsci")) {
  for (const p of Object.keys(E.deep)) for (const ref of Object.keys(E.deep[p].leaves)) for (const a of E.deep[p].leaves[ref].archetypes || []) for (const v of a.variations || []) {
    const wh = p + " " + ref + " " + a.id + " " + v.v;
    if (v.fig) checkFig(wh, v.fig);
    for (const s of v.steps || []) if (s[3]) checkFig(wh, s[3]);
    await walkBlocks(wh + " · try", v.try);
  }
}
console.log("fill_check: " + Object.entries(counts).map(([k, n]) => n + " " + k).join(", "));
if (problems.length) { console.log(problems.length + " problem(s):\n  " + problems.join("\n  ")); process.exit(1); }
console.log("fill_check: OK");
process.exit(0);
