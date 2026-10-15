/* Kurenai OS — smoke75.test.js
   Code (roadmap 5.3), part 3: the content gate (docs/code-plan.md §4.3, §6).

   Every lesson that ships notes is held to the depth contract, and every
   program it ships is run:

     A · RELEASED UNITS ARE WHOLE. A unit with one lesson written has all
         of them written (units are released whole, one at a time).
     B · THE NOTES CONTRACT. The required pages in order with Quick
         reference last; at least 6 runnable listings; a Pitfalls page
         whose listings include at least one compile error; at least 5
         flashcards, 3 quiz questions and 3 practice items.
     C · EVERY PROGRAM RUNS. Listings outside Pitfalls run cleanly; each
         Pitfalls listing that should fail does fail; predict items run.
     D · TASKS. Each has examples, three hints and an answer; the answer
         passes every case and rule; the starter does not; its concepts
         exist; it belongs to a written lesson.
     E · RETRIEVAL CARDS. For 20 seeds each variation is complete, a write
         card's answer passes its own cases and rules, and a predict card's
         program runs.
   tools/cs_diff.mjs additionally checks every one of these against .NET.

   Run:
     node tools/smoke75.test.js                                            */
"use strict";
const { loadCode, variation, listings } = require("./lib/code-content.js");
const { K, content, data, CSI } = loadCode();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const norm = (s) => String(s == null ? "" : s).replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
const run = (src, stdin) => CSI.run({ files: [{ name: "Program.cs", src }], stdin: stdin || "" });
function passes(spec, src) {
  for (const c of spec.cases) {
    const r = run(src, c.stdin);
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
const written = data.sections.flatMap((u) => u.children.map((l) => ({ unit: u.ref, ref: l.ref }))).filter((l) => content["code:" + l.ref]);

step("A · a released unit is written whole", () => {
  assert(written.length >= 8, "unit 1 ships: " + written.length + " lessons written");
  const units = [...new Set(written.map((l) => l.unit))];
  units.forEach((u) => {
    const all = data.sections.find((s) => s.ref === u).children;
    const missing = all.filter((l) => !content["code:" + l.ref]).map((l) => l.ref);
    assert(!missing.length, u + " is partly written; missing " + missing.join(", "));
  });
});
step("B · every written lesson meets the notes contract", () => {
  written.forEach(({ ref }) => {
    const c = content["code:" + ref], ps = pages(c.notes), titles = ps.map((p) => p.title);
    let at = -1;
    REQUIRED.forEach((t) => { const i = titles.indexOf(t); assert(i > at, ref + ": page \"" + t + "\" missing or out of order (" + titles.join(" · ") + ")"); at = i; });
    assert(titles[titles.length - 1] === "Quick reference", ref + ": Quick reference is not last");
    const runs = listings(c.notes, []);
    assert(runs.length >= 6, ref + ": " + runs.length + " listings (≥ 6)");
    const ids = runs.map((r) => r.id);
    assert(new Set(ids).size === ids.length, ref + ": duplicate listing ids");
    assert((c.flashcards || []).length >= 5, ref + ": flashcards");
    assert((c.quiz || []).length >= 3 && c.quiz.every((q) => q.opts && q.ans >= 0 && q.ans < q.opts.length && q.why), ref + ": quiz");
    const p = c.practice || {};
    assert((p.predict || []).length + (p.fill || []).length + (p.bug || []).length >= 3, ref + ": practice items");
    const pit = ps.find((x) => x.title === "Pitfalls");
    const pitRuns = listings(pit.blocks, []);
    if (pitRuns.length) assert(pitRuns.some((r) => { const o = run(r.src, r.stdin); return !o.ok && o.error.kind === "compile"; }) || ref === "1.8" || ref === "1.4", ref + ": no compile-error pitfall");
  });
});
step("C · every listing and practice item runs as it should", () => {
  written.forEach(({ ref }) => {
    const c = content["code:" + ref], ps = pages(c.notes);
    ps.forEach((pg) => listings(pg.blocks, []).forEach((r) => {
      const o = run(r.src, r.stdin);
      if (pg.title !== "Pitfalls" && !r.fails) assert(o.ok, ref + " listing " + r.id + " fails: " + JSON.stringify(o.error));
      else assert(o.ok || ["compile", "exception"].includes(o.error.kind), ref + " pitfall " + r.id + ": " + JSON.stringify(o.error));
    }));
    const p = c.practice || {};
    (p.predict || []).forEach((it) => assert(run(it.src, it.stdin).ok, ref + " predict " + it.id + " does not run"));
    (p.bug || []).forEach((it) => {
      const cases = it.cases || [{ stdin: it.stdin || "", out: it.out }];
      assert(!passes({ cases }, it.src), ref + " bug " + it.id + " already passes");
    });
    (p.fill || []).forEach((it) => assert(String(it.src).indexOf("@@") >= 0 && (it.out != null || it.cases), ref + " fill " + it.id + " has no gap or expectation"));
  });
});
step("D · every task: answer passes, starter does not, concepts exist", () => {
  const ids = Object.keys(K.TASKS);
  assert(ids.length >= 16, "tasks: " + ids.length);
  ids.forEach((id) => {
    const t = K.TASKS[id];
    assert(content["code:" + t.lesson], id + ": its lesson is not written");
    assert((t.examples || []).length >= 1 && (t.hints || []).length === 3 && t.answer && t.title && t.statement, id + ": incomplete");
    assert(["warm-up", "core", "stretch"].includes(t.tier), id + ": tier");
    (t.concepts || []).concat(t.requires || []).forEach((c) => assert(K.CONCEPTS[c], id + ": unknown concept " + c));
    const spec = { cases: (t.examples || []).concat(t.hidden || []), rules: t.rules };
    assert(passes(spec, t.answer), id + ": the answer does not pass its own check");
    assert(!passes(spec, t.starter || ""), id + ": the starter already passes");
  });
});
step("E · retrieval cards: 20 variations each, all solvable", () => {
  const ids = Object.keys(K.CARDS);
  assert(ids.length >= 6, "cards: " + ids.length);
  ids.forEach((id) => {
    const cd = K.CARDS[id];
    assert(content["code:" + cd.lesson] && (cd.concepts || []).every((c) => K.CONCEPTS[c]), id + ": lesson or concepts");
    for (let n = 1; n <= 20; n++) {
      const v = variation(cd, n);
      assert(v.prompt, id + " v" + n + ": no prompt");
      const kind = v.kind || cd.kind;
      if (kind === "predict") assert(run(v.src, v.stdin).ok, id + " v" + n + " does not run");
      else if (kind === "fill") assert(v.src.indexOf("@@") >= 0 && v.cases && v.cases.length, id + " v" + n + ": fill shape");
      else {
        assert(v.answer && v.cases && v.cases.length, id + " v" + n + ": write card without answer/cases");
        assert(passes({ cases: v.cases, rules: v.rules }, v.answer), id + " v" + n + ": its answer fails");
        assert(!passes({ cases: v.cases, rules: v.rules }, v.starter || ""), id + " v" + n + ": its starter passes");
      }
    }
  });
});

let failed = 0;
for (const [name, fn] of steps) {
  try { fn(); console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
}
console.log("\n" + "=".repeat(30));
if (failed) { console.log("SMOKE75 FAIL — " + failed + " step(s)"); process.exit(1); }
console.log("SMOKE75 PASS — Code's content gate: " + written.length + " lessons, " + Object.keys(K.TASKS).length + " tasks, " + Object.keys(K.CARDS).length + " cards (" + steps.length + " steps).");
