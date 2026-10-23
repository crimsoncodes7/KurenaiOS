/* tools/code_unit_check.js — a fast check of ONE Code unit while it is
   being written, before smoke75 and tools/cs_diff.mjs (which cover every
   unit). It runs each program the unit ships on its own runner and prints
   what a writer needs to see: every Pitfalls listing's outcome, every
   predict item's real output beside its "why", any compiler warning in a
   listing that should be clean, a fill item's gap filled with its
   `answer` (an optional field only this tool reads), each task's answer
   and starter against every case, and 20 variations of each card.

     node tools/code_unit_check.js 12.        lessons 12.x, tasks 12.x-*, cards u12-*
     SHOW=1 node tools/code_unit_check.js 12.  also print every listing's output   */
"use strict";
const { loadCode, variation, listings, runnerOf, seedOf } = require("./lib/code-content.js");
const { loadSql } = require("./lib/sql-node.js");
const { loadWasm } = require("./lib/cs-wasm-node.js");
const { K, content, data, CSI } = loadCode();
const prefix = process.argv[2];
if (!prefix) { console.error("usage: node tools/code_unit_check.js <unit prefix, e.g. 12.>"); process.exit(2); }
const norm = (s) => String(s == null ? "" : s).replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");

(async () => {
  const W = await loadWasm();
  const SQ = await loadSql();
  const run = (src, stdin, fs, lesson, db) => runnerOf(K, data, lesson) === "sql"
    ? Promise.resolve(SQ.run({ src, seed: seedOf(K, data, { lesson, db }) }))
    : runnerOf(K, data, lesson) === "wasm"
    ? (W ? W.run({ files: [{ name: "Program.cs", src }], stdin: stdin || "", fs, nullable: true }) : Promise.reject(new Error("build the runtime: tools/build_cs_wasm.sh")))
    : Promise.resolve(CSI.run({ files: [{ name: "Program.cs", src }], stdin: stdin || "", fs }));
  let bad = 0;
  const say = (m) => { bad++; console.log("  ✗ " + m); };
  const warn = (where, r) => { if (r.warnings && r.warnings.length) console.log("  ⚠ " + where + " " + JSON.stringify(r.warnings.map((w) => w.code + " L" + w.line))); };
  async function passes(cases, rules, src, fs, lesson) {
    for (const c of cases) {
      const r = await run(src, c.stdin, c.fs || fs, lesson, c.db);
      if (!r.ok || norm(r.stdout) !== norm(c.out)) return { ok: false, got: r.ok ? r.stdout : JSON.stringify(r.error), c };
    }
    const br = (rules || []).find((rl) => !rl.test(src));
    return br ? { ok: false, got: "rule " + br.id } : { ok: true };
  }
  for (const key of Object.keys(content).filter((k) => k.indexOf("code:" + prefix) === 0)) {
    const ref = key.slice(5), c = content[key];
    console.log(ref);
    /* a Rider lesson (Bridge B, unit 10) holds the Rider form; smoke75 checks it */
    const unit = (data.sections || []).find((u) => u.children.some((l) => l.ref === ref));
    if (unit && unit.where === "rider") { console.log("  (Rider form: checked by smoke75)"); continue; }
    let page = null, pitCompile = false, nRun = 0;
    for (const b of c.notes) {
      if (b && b.page) { page = b.page; continue; }
      if (b && b.sec) { page = b.sec; continue; }
      for (const r of listings([b], [])) {
        nRun++;
        const o = await run(r.src, r.stdin, r.fs, ref, r.db);
        if (page === "Pitfalls") { console.log("    pit " + r.id + ": " + (o.ok ? "ok " + JSON.stringify(o.stdout) : o.error.kind + " " + (o.error.code || o.error.msg))); if (!o.ok && (o.error.kind === "compile" || o.error.kind === "sql")) pitCompile = true; }
        else if (!o.ok && !r.fails) say(r.id + " " + JSON.stringify(o.error));
        else { warn(r.id, o); if (process.env.SHOW) console.log("    " + r.id + ": " + JSON.stringify(o.stdout)); }
      }
    }
    if (nRun < 6) say("only " + nRun + " listings");
    if (!pitCompile) say("no compile-error pitfall");
    const p = c.practice || {};
    for (const it of p.predict || []) { const o = await run(it.src, it.stdin, it.fs, ref); if (!o.ok) say("predict " + it.id + " " + JSON.stringify(o.error)); else console.log("    predict " + it.id + " → " + JSON.stringify(o.stdout) + "   (" + it.why + ")"); }
    for (const it of p.bug || []) { const r = await passes([{ stdin: it.stdin || "", out: it.out }], [], it.src, it.fs, ref); if (r.ok) say("bug " + it.id + " already passes"); }
    for (const it of p.fill || []) {
      if (it.answer == null) { console.log("    (fill " + it.id + " has no answer to try)"); continue; }
      const ans = [].concat(it.answer); let g = 0;
      const r = await passes([{ stdin: it.stdin || "", out: it.out, db: it.db }], [], it.src.replace(/@@/g, () => ans[g++] || ""), it.fs, ref);
      if (!r.ok) say("fill " + it.id + " with " + it.answer + " → " + r.got);
    }
    if ((c.flashcards || []).length < 5) say("flashcards");
    if ((c.quiz || []).length < 3) say("quiz");
    if ((p.predict || []).length + (p.fill || []).length + (p.bug || []).length < 3) say("practice count");
  }
  for (const id of Object.keys(K.TASKS).filter((i) => i.indexOf(prefix) === 0)) {
    const t = K.TASKS[id], cases = t.examples.concat(t.hidden || []);
    const a = await passes(cases, t.rules, t.answer, t.fs, t.lesson);
    if (!a.ok) say("task " + id + " answer: " + JSON.stringify(a.got) + " case " + JSON.stringify(a.c));
    if ((await passes(cases, t.rules, t.starter || "", t.fs, t.lesson)).ok) say("task " + id + " starter passes");
    if ((t.hints || []).length !== 3) say("task " + id + " hints");
    (t.concepts || []).forEach((cn) => { if (!K.CONCEPTS[cn]) say("task " + id + " concept " + cn); });
    warn("task " + id, await run(t.answer, cases[0].stdin, cases[0].fs || t.fs, t.lesson));
  }
  const unit = "u" + prefix.replace(".", "");
  for (const id of Object.keys(K.CARDS).filter((i) => i.indexOf(unit + "-") === 0)) {
    const cd = K.CARDS[id];
    (cd.concepts || []).forEach((cn) => { if (!K.CONCEPTS[cn]) say("card " + id + " concept " + cn); });
    for (let n = 1; n <= 20; n++) {
      const v = variation(cd, n), kind = v.kind || cd.kind;
      if (kind === "predict") {
        const o = await run(v.src, v.stdin, v.fs, cd.lesson);
        if (!o.ok) say("card " + id + " v" + n + " " + JSON.stringify(o.error) + "\n" + v.src);
        else if (n <= 2) console.log("    card " + id + " v" + n + " → " + JSON.stringify(o.stdout));
      } else if (kind !== "command") {
        const a = await passes(v.cases, v.rules, v.answer, v.fs, cd.lesson);
        if (!a.ok) say("card " + id + " v" + n + " answer " + JSON.stringify(a.got) + " " + JSON.stringify(a.c));
        if ((await passes(v.cases, v.rules, v.starter || "", v.fs, cd.lesson)).ok) say("card " + id + " v" + n + " starter passes");
      }
    }
  }
  console.log(bad ? "\n" + bad + " problem(s)" : "\nclean");
  process.exit(bad ? 1 : 0);
})();
