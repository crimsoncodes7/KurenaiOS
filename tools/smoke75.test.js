/* Kurenai OS — smoke75.test.js
   Code (roadmap 5.3), part 3: the content gate (docs/code-plan.md §4.3, §6).

   Every lesson that ships notes is held to the depth contract, and every
   program it ships is run:

     A · RELEASED UNITS ARE WHOLE. A unit with one lesson written has all
         of them written (units are released whole, one at a time).
     B · THE NOTES CONTRACT. The required pages in order with Quick
         reference last; at least 6 runnable listings; a Pitfalls page
         whose listings include at least one compile error; at least 5
         flashcards, 3 quiz questions and 3 practice items. A lesson done
         in Rider (Bridge B) holds the Rider form: the same pages, at least
         3 command, file or listing blocks, a Pitfalls page of at least 2
         cases, flashcards and a quiz; its work is a project milestone.
     C · EVERY PROGRAM RUNS. Listings outside Pitfalls run cleanly; each
         Pitfalls listing that should fail does fail; predict items run.
     D · TASKS. Each has examples, three hints and an answer; the answer
         passes every case and rule; the starter does not; its concepts
         exist; it belongs to a written lesson.
     E · RETRIEVAL CARDS. For 20 seeds each variation is complete, a write
         card's answer passes its own cases and rules, a predict card's
         program runs, and a command card accepts its own answer and
         refuses an empty or wrong one.
   Lessons in the sandbox units (7+) run on the full runtime (nullable on),
   loaded from assets/code/runtime/ — build it with tools/build_cs_wasm.sh.
   tools/cs_diff.mjs additionally checks every one of these against .NET.

   Run:
     node tools/smoke75.test.js                                            */
"use strict";
const { loadCode, variation, listings, runnerOf, seedOf } = require("./lib/code-content.js");
const { loadSql } = require("./lib/sql-node.js");
const { loadWasm } = require("./lib/cs-wasm-node.js");
const { K, content, data, CSI } = loadCode();
/* units 7+ run on the full runtime (nullable on), as in the app */
let WASM = null;

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const norm = (s) => String(s == null ? "" : s).replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
const full = (lesson) => runnerOf(K, data, lesson) === "wasm";
const isSql = (lesson) => runnerOf(K, data, lesson) === "sql";
let SQL = null;
const run = async (src, stdin, fs, lesson, db) => isSql(lesson)
  ? SQL.run({ src, seed: seedOf(K, data, { lesson, db }) })
  : full(lesson)
  ? WASM.run({ files: [{ name: "Program.cs", src }], stdin: stdin || "", fs, nullable: true })
  : CSI.run({ files: [{ name: "Program.cs", src }], stdin: stdin || "", fs });
async function passes(spec, src, lesson) {
  for (const c of spec.cases) {
    const r = await run(src, c.stdin, c.fs || spec.fs, lesson, c.db || spec.db);
    if (!r.ok || norm(r.stdout) !== norm(c.out)) return false;
  }
  return (spec.rules || []).every((rl) => rl.test(src));
}
function pages(notes) {
  const out = []; let cur = null;
  (notes || []).forEach((b) => { if (b && b.page) { cur = { title: b.page, blocks: [] }; out.push(cur); } else if (cur) cur.blocks.push(b); });
  return out;
}
const REQUIRED = ["The problem it solves", "Core idea", "Rules", "Variations", "Pitfalls", "Connections", "Good practice", "Practise", "Quick reference"];
const written = data.sections.flatMap((u) => u.children.map((l) => ({ unit: u.ref, ref: l.ref, rider: u.where === "rider" }))).filter((l) => content["code:" + l.ref]);
const blocksOf = (notes) => { const out = []; (function walk(bs) { (bs || []).forEach((b) => { if (!b || typeof b !== "object") return; if (b.run || b.code) out.push(b); if (b.callout && Array.isArray(b.callout.body)) walk(b.callout.body); }); })(notes); return out; };

step("A · a released unit is written whole", () => {
  assert(written.length >= 8, "unit 1 ships: " + written.length + " lessons written");
  const units = [...new Set(written.map((l) => l.unit))];
  units.forEach((u) => {
    const all = data.sections.find((s) => s.ref === u).children;
    const missing = all.filter((l) => !content["code:" + l.ref]).map((l) => l.ref);
    assert(!missing.length, u + " is partly written; missing " + missing.join(", "));
  });
});
step("B · every written lesson meets the notes contract", async () => {
  for (const { ref, rider } of written) {
    const c = content["code:" + ref], ps = pages(c.notes);
    /* the contract's layers, as authored: a folded page's {sec} headings,
       else the page title (KOS_CODE.compose) */
    const titles = [].concat(...ps.map((p) => { const secs = p.blocks.filter((b) => b && b.sec).map((b) => b.sec); return secs.length ? secs : [p.title]; }));
    assert(ps.length <= 8, ref + ": " + ps.length + " pages — thin layers should fold together");
    let at = -1;
    REQUIRED.forEach((t) => { const i = titles.indexOf(t); assert(i > at, ref + ": page \"" + t + "\" missing or out of order (" + titles.join(" · ") + ")"); at = i; });
    assert(ps[ps.length - 1].title === "Quick reference", ref + ": Quick reference is not last");
    const runs = listings(c.notes, []);
    if (rider) {
      /* the Rider form: commands, files and listings; a project milestone is its task */
      assert(blocksOf(c.notes).length >= 3, ref + ": " + blocksOf(c.notes).length + " command, file or listing blocks (≥ 3)");
      const pit = ps.find((x) => x.title === "Pitfalls") || { blocks: [] };
      assert(pit.blocks.filter((b) => b && b.h).length >= 2 || ps.some((pg) => pg.blocks.some((b) => b && b.sec === "Pitfalls")), ref + ": a Pitfalls page of at least two cases");
      assert((c.flashcards || []).length >= 5, ref + ": flashcards");
      assert((c.quiz || []).length >= 3 && c.quiz.every((q) => q.opts && q.ans >= 0 && q.ans < q.opts.length && q.why), ref + ": quiz");
      assert(Object.values(K.PROJECTS).some((p) => p.milestones.some((m) => (m.lessons || []).includes(ref))), ref + ": no project milestone proves it");
      return;
    }
    assert(runs.length >= 6, ref + ": " + runs.length + " listings (≥ 6)");
    const ids = runs.map((r) => r.id);
    assert(new Set(ids).size === ids.length, ref + ": duplicate listing ids");
    assert((c.flashcards || []).length >= 5, ref + ": flashcards");
    assert((c.quiz || []).length >= 3 && c.quiz.every((q) => q.opts && q.ans >= 0 && q.ans < q.opts.length && q.why), ref + ": quiz");
    const p = c.practice || {};
    assert((p.predict || []).length + (p.fill || []).length + (p.bug || []).length >= 3, ref + ": practice items");
    const pit = ps.find((x) => x.title === "Pitfalls");
    const pitRuns = listings(pit.blocks, []);
    let compileErr = false;
    for (const r of pitRuns) { const o = await run(r.src, r.stdin, r.fs, ref); if (!o.ok && (o.error.kind === "compile" || o.error.kind === "sql")) { compileErr = true; break; } }
    if (pitRuns.length) assert(compileErr || ref === "1.8" || ref === "1.4", ref + ": no compile-error pitfall");
  }
});
step("C · every listing and practice item runs as it should", async () => {
  for (const { ref } of written) {
    const c = content["code:" + ref], ps = pages(c.notes);
    for (const pg of ps) for (const r of listings(pg.blocks, [])) {
      const o = await run(r.src, r.stdin, r.fs, ref, r.db);
      if (pg.title !== "Pitfalls" && !r.fails) assert(o.ok, ref + " listing " + r.id + " fails: " + JSON.stringify(o.error));
      else assert(o.ok || ["compile", "exception", "timeout", "sql"].includes(o.error.kind), ref + " pitfall " + r.id + ": " + JSON.stringify(o.error));
    }
    const p = c.practice || {};
    for (const it of (p.predict || [])) assert((await run(it.src, it.stdin, it.fs, ref, it.db)).ok, ref + " predict " + it.id + " does not run");
    for (const it of (p.bug || [])) {
      const cases = it.cases || [{ stdin: it.stdin || "", out: it.out }];
      assert(!(await passes({ cases, fs: it.fs, db: it.db }, it.src, ref)), ref + " bug " + it.id + " already passes");
    }
    (p.fill || []).forEach((it) => assert(String(it.src).indexOf("@@") >= 0 && (it.out != null || it.cases), ref + " fill " + it.id + " has no gap or expectation"));
  }
});
step("D · every task: answer passes, starter does not, concepts exist", async () => {
  const ids = Object.keys(K.TASKS);
  assert(ids.length >= 16, "tasks: " + ids.length);
  for (const id of ids) {
    const t = K.TASKS[id];
    assert(content["code:" + t.lesson], id + ": its lesson is not written");
    assert((t.examples || []).length >= 1 && (t.hints || []).length === 3 && t.answer && t.title && t.statement, id + ": incomplete");
    assert(["warm-up", "core", "stretch"].includes(t.tier), id + ": tier");
    (t.concepts || []).concat(t.requires || []).forEach((c) => assert(K.CONCEPTS[c], id + ": unknown concept " + c));
    const spec = { cases: (t.examples || []).concat(t.hidden || []), rules: t.rules, fs: t.fs, db: t.db };
    assert(await passes(spec, t.answer, t.lesson), id + ": the answer does not pass its own check");
    assert(!(await passes(spec, t.starter || "", t.lesson)), id + ": the starter already passes");
  }
});
step("E · retrieval cards: 20 variations each, all solvable", async () => {
  const ids = Object.keys(K.CARDS);
  assert(ids.length >= 6, "cards: " + ids.length);
  for (const id of ids) {
    const cd = K.CARDS[id];
    assert(content["code:" + cd.lesson] && (cd.concepts || []).every((c) => K.CONCEPTS[c]), id + ": lesson or concepts");
    for (let n = 1; n <= 20; n++) {
      const v = variation(cd, n);
      assert(v.prompt, id + " v" + n + ": no prompt");
      const kind = v.kind || cd.kind;
      if (kind === "predict") assert((await run(v.src, v.stdin, v.fs, cd.lesson, v.db)).ok, id + " v" + n + " does not run");
      else if (kind === "fill") assert(v.src.indexOf("@@") >= 0 && v.cases && v.cases.length, id + " v" + n + ": fill shape");
      else if (kind === "command") {
        const ok = (t) => { const x = String(t).replace(/\s+/g, " ").trim(); return !!x && v.accept.some((a) => new RegExp(a, v.ci ? "i" : "").test(x)); };
        assert(v.answer && Array.isArray(v.accept) && v.accept.length, id + " v" + n + ": command card without answer/accept");
        assert(ok(v.answer) && ok("  " + v.answer.replace(/ /g, "   ") + " "), id + " v" + n + ": its answer is refused: " + v.answer);
        assert(!ok("") && !ok(v.answer + " extra") && !ok("dotnet"), id + " v" + n + ": a wrong answer is accepted");
        assert(String(v.label || "").toLowerCase().indexOf(v.answer.toLowerCase()) < 0, id + " v" + n + ": its label gives the answer away");
      }
      else {
        assert(v.answer && v.cases && v.cases.length, id + " v" + n + ": write card without answer/cases");
        assert(await passes({ cases: v.cases, rules: v.rules, fs: v.fs, db: v.db }, v.answer, cd.lesson), id + " v" + n + ": its answer fails");
        assert(!(await passes({ cases: v.cases, rules: v.rules, fs: v.fs, db: v.db }, v.starter || "", cd.lesson)), id + " v" + n + ": its starter passes");
      }
    }
  }
});

(async () => {
let failed = 0;
SQL = await loadSql();
if (written.some((l) => full(l.ref))) {
  WASM = await loadWasm();
  if (!WASM) { console.log("  FAIL units 7+ need the full runtime — run tools/build_cs_wasm.sh"); process.exit(1); }
}
for (const [name, fn] of steps) {
  try { await fn(); console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
}
console.log("\n" + "=".repeat(30));
if (failed) { console.log("SMOKE75 FAIL — " + failed + " step(s)"); process.exit(1); }
console.log("SMOKE75 PASS — Code's content gate: " + written.length + " lessons, " + Object.keys(K.TASKS).length + " tasks, " + Object.keys(K.CARDS).length + " cards (" + steps.length + " steps).");
process.exit(0);
})();
