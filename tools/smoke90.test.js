/* Kurenai OS — smoke90.test.js
   The Exams hub's evidence, phase 2 (roadmap 5.8, docs/exams-plan.md §4).

   The claims:

     A · EVERY QUESTION IS MAPPED. Each row of the generated past-paper
         index names at least one specification leaf that exists, and
         every row of tools/exam-index/map.csv names real leaves.
     B · MARKS RECONCILE. Every real sitting's questions add up to its
         paper's marks (a section of a paper — Edexcel's statistics and
         mechanics — to its share); CS Paper 1's Section A is the only part
         indexed, and what is left is Sections B–D. A specimen short of its
         total is listed here, never silently accepted.
     C · A PAPER FILLS THE LOG. paperFill gives every sitting a question
         list totalling the paper's marks, CS Paper 1 with one B–D row.
     D · BOUNDARIES are well formed: grades in order, below the maximum,
         each row confirmed or not, the series a date.
     E · PRESETS point at index papers that exist, and their scopes resolve.
     F · YEAR 2 ONLY is generated from the boards' markings and names real
         leaves (partial fractions is Year 2; quadratics is not).
     G · NO PAST-PAPER TEXT. The index holds references and numbers only:
         rows of seven fields, short tag reasons, no PDF in the repo, and
         none of the boards' printed boilerplate anywhere in js/.
     H · THE GENERATOR is up to date with the user's folder when that folder
         is on this machine (skipped, and said so, when it is not).

   Run:  node tools/smoke90.test.js                                        */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { boot, ROOT } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

/* specimens whose index is short of the paper (a question the compilation
   left out); listed so a new gap fails */
const SHORT = { "edexcel-9ma0-3 specimen Mechanics": 47, "edexcel-8ma0-2 specimen Mechanics": 29 };
const SECTION_MARKS = { "edexcel-9ma0-3": { Statistics: 50, Mechanics: 50 }, "edexcel-8ma0-2": { Statistics: 30, Mechanics: 30 } };

let app, K, IX;
step("boot", async () => {
  app = await boot({ clock: "2026-10-20T10:00:00" });
  K = app.KOS;
  IX = app.window.KOS_EXAMS && app.window.KOS_EXAMS.index;
  assert(IX && IX.questions.length > 1000, "the index loaded");
  eq(app.errors, [], "boot errors");
});

step("A · every question and every map row names real leaves", () => {
  const bad = IX.questions.filter((q) => !q[5].length || q[5].some((k) => K.spec.level.apply(null, k.split(":").length === 2 ? k.split(":") : [null]) !== "leaf"));
  eq(bad.slice(0, 3), [], "questions with no leaf or a missing one");
  const lines = fs.readFileSync(path.join(ROOT, "tools/exam-index/map.csv"), "utf8").trim().split("\n").slice(1);
  const parse = (l) => { const m = /^(\w+),("(?:[^"]|"")*"|[^,]*),([^,]*),/.exec(l); return m && { sid: m[1], leaves: m[3].split(" ").filter(Boolean) }; };
  lines.forEach((l) => {
    const r = parse(l);
    assert(r && r.leaves.length, "a map row without leaves: " + l);
    r.leaves.forEach((ref) => assert(K.spec.level(r.sid, ref) === "leaf", "map row names " + r.sid + ":" + ref + ", not a leaf"));
  });
});

step("B · every real sitting adds up to its paper", () => {
  const sums = {};
  IX.questions.forEach((q) => { const k = q[0] + " " + q[1] + " " + q[2]; sums[k] = (sums[k] || 0) + q[4]; });
  Object.keys(sums).forEach((k) => {
    const [pid, sit, sec] = k.split(" ");
    const p = IX.papers[pid];
    let want = SECTION_MARKS[pid] ? SECTION_MARKS[pid][sec] : p.marks;
    if (SHORT[k] != null) want = SHORT[k];
    if (/^aqa-751[67]-1$/.test(pid)) assert(sums[k] > 0 && sums[k] < p.marks, k + ": Section A is part of the paper (" + sums[k] + ")");
    else eq(sums[k], want, k + " adds up");
  });
});

step("C · a picked paper fills the log to the paper's marks", () => {
  Object.keys(IX.papers).forEach((pid) => {
    IX.papers[pid].sittings.forEach((s) => {
      const f = K.examIndex.paperFill(pid, s);
      const total = f.questions.reduce((a, q) => a + q.max, 0);
      const short = Object.keys(SHORT).filter((k) => k.indexOf(pid + " " + s + " ") === 0).length;
      if (!short) eq(total, f.max, pid + " " + s + " totals its marks");
      if (/^aqa-751[67]-1$/.test(pid)) assert(f.questions.some((q) => q.q === "B–D"), pid + " " + s + " has its programming sections");
    });
  });
  assert(/June 2019/.test(K.examIndex.paperFill("edexcel-9ma0-1", "2019-06").title), "a readable title");
});

step("D · boundaries are well formed", () => {
  const B = app.window.KOS_BOUNDARIES;
  assert(B && B.rows.length, "the table");
  B.rows.forEach((r) => {
    const tag = r.board + " " + r.qual + " " + r.component + " " + r.series;
    assert(/^\d{4}-\d{2}$/.test(r.series), tag + ": series");
    assert(typeof r.confirmed === "boolean", tag + ": confirmed is stated");
    const gs = B.grades.filter((g) => r.marks[g] != null);
    assert(gs.length >= 5, tag + ": grades");
    gs.forEach((g, i) => {
      assert(r.marks[g] <= r.max, tag + ": " + g + " above the maximum");
      if (i) assert(r.marks[g] < r.marks[gs[i - 1]], tag + ": " + g + " not below " + gs[i - 1]);
    });
    if (r.qual === "7517" || r.qual === "9MA0") assert(r.marks["A*"] != null || r.component === "NEA", tag + ": A-level rows carry A*");
  });
});

step("E · presets point at real index papers and resolve", () => {
  K.exams.presets().forEach((p) => {
    if (p.index) assert(IX.papers[p.index], p.id + ": no index paper " + p.index);
    assert(K.spec.resolve(p.include).length > 0, p.id + ": its scope resolves");
  });
});

step("F · Year 2 only is generated from the boards' markings", () => {
  const y = IX.year2Only;
  ["maths", "compsci"].forEach((sid) => {
    assert(y[sid].length > 5, sid + " has a Year 2 list");
    y[sid].forEach((k) => { const [s, r] = k.split(":"); assert(K.spec.level(s, r) === "leaf", k + " is a leaf"); });
  });
  assert(y.maths.indexOf("maths:2.10") !== -1, "partial fractions is Year 2");
  assert(y.maths.indexOf("maths:2.3") === -1, "quadratics is not");
  assert(y.compsci.indexOf("compsci:4.1.1.16") !== -1, "recursion is A-level only");
  assert(y.compsci.indexOf("compsci:4.2.3.1") === -1, "stacks are not");
});

step("G · references and numbers only", () => {
  IX.questions.forEach((q) => {
    assert(q.length === 7, "a row of seven fields");
    assert(typeof q[6] === "string" && q[6].length <= 140, "a short tag reason");
  });
  IX.packs.forEach((p) => assert(!/^\//.test(p.file) && !/^https?:/.test(p.file), "a pack path is relative to the user's folder: " + p.file));
  /* the specifications in Context/ are the boards' public specs, never
     shipped; nothing else may be a PDF */
  const pdfs = execFileSync("git", ["ls-files", "*.pdf"], { cwd: ROOT }).toString().trim().split("\n").filter((f) => f && !/^Context\//.test(f));
  eq(pdfs, [], "no past-paper PDF in the repo");
  const BOILER = [/Do not write outside the box/i, /Pearson Education Ltd/i, /Turn over for the next question/i, /Copyright © \d{4} AQA/i, /\bDO NOT WRITE IN THIS AREA\b/];
  (function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
      const p = path.join(dir, d.name);
      if (d.isDirectory()) return walk(p);
      if (!/\.js$/.test(d.name)) return;
      const src = fs.readFileSync(p, "utf8");
      BOILER.forEach((re) => assert(!re.test(src), path.relative(ROOT, p) + " carries a board's printed boilerplate: " + re));
    });
  })(path.join(ROOT, "js"));
});

step("H · the generator matches the user's folder (when it is here)", () => {
  const root = process.env.KOS_ALEVEL || path.join(require("os").homedir(), "Downloads", "A-level");
  if (!fs.existsSync(path.join(root, "Topic Practice", "Question Index.xlsx"))) { console.log("       (skipped: no evidence folder on this machine)"); return; }
  try { execFileSync("python3", [path.join(ROOT, "tools/gen_exam_index.py"), "--check"], { stdio: "pipe" }); }
  catch (e) {
    const msg = String(e.stderr || e.message);
    if (/needs openpyxl/.test(msg)) { console.log("       (skipped: openpyxl not installed)"); return; }
    throw new Error("js/data/exam-index.js is out of date: " + msg.trim());
  }
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke90: " + failed + " failed" : "smoke90: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
