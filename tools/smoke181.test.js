/* Kurenai OS — smoke181.test.js
   Authored, board-faithful papers (the Exams & Papers rework §7.1 and
   §10; invariant 127): the papers in js/data/exams/papers/.

     A · the contract, for every authored paper: its marks add up (each part,
         each question, the paper), its time and format are the board's,
         every part has a scheme and a specification leaf that exists, a
         levels-of-response part has its level descriptors and indicative
         content, an (ii) names the (i) it builds on and comes after it, a
         table to complete has blanks, a data table is rectangular.
     B · OCR F201 paper 1 follows the SAM's blueprint: 1 h 30, 60 marks, eight
         questions of 9 · 9 · 5 · 5 · 2 · 18 · 8 · 4, one 6-mark Analyse and
         one 9-mark Discuss, one organisation named in the context.
     C · an assessment on the preset gets it as paper 1 (paper 2 onwards is
         generated until more are written); the paper page draws the
         context, the data table, the table to complete, [n] marks and no
         Edexcel total line; the scheme prints the levels; timed mode shows
         the case study and the tally marks a 9-marker by mark.
     D · no errors, no request.

   Run: node tools/smoke181.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K, PAPERS;
const BOARD = { "ocr-f201": { board: "OCR", format: "ocr-case", mins: 90, marks: 60 },
  "aqa-7517-ppe": { board: "AQA", format: "aqa", mins: 150, marks: 100 },
  "edexcel-9ma0-pure-mock": { board: "Edexcel", format: "edexcel", mins: 120, marks: 100 } };

step("boot", async () => {
  app = await boot(); K = app.KOS; await app.settle();
  PAPERS = app.window.KOS_EXAMS.papers;
  assert(PAPERS && Object.keys(PAPERS).length, "authored papers registered");
});

step("A · every authored paper meets the contract", async () => {
  let n = 0;
  Object.keys(PAPERS).forEach((pid) => {
    const pr = K.exams.preset(pid);
    assert(pr, pid + " is a preset");
    PAPERS[pid].forEach((paper, i) => {
      n++;
      const tag = pid + " #" + (i + 1);
      const want = BOARD[pid];
      if (want) eq([paper.board, paper.format, paper.mins, paper.marks], [want.board, want.format, want.mins, want.marks], tag + " board, format, time, marks");
      eq(paper.n, i + 1, tag + " numbered in order");
      let total = 0;
      paper.questions.forEach((q, qi) => {
        eq(q.n, qi + 1, tag + " question numbers");
        const labels = q.parts.map((p) => p.label);
        q.parts.forEach((p) => {
          const at = tag + " Q" + q.n + p.label;
          assert(p.marks > 0 && Number.isInteger(p.marks), at + " marks");
          assert(p.q && p.q.length > 20, at + " question text");
          assert(Array.isArray(p.ms) && p.ms.length, at + " has a scheme");
          assert(p.ref && K.spec.resolve([pr.subject + ":" + p.ref]).length, at + " names a leaf that exists (" + p.ref + ")");
          assert(p.command, at + " command word");
          if (p.marks >= 6) {
            assert(Array.isArray(p.levels) && p.levels.length >= 3, at + " level descriptors");
            assert(Array.isArray(p.indicative) && p.indicative.length >= 4, at + " indicative content");
          }
          if (p.dependsOn) assert(labels.indexOf(p.dependsOn) >= 0 && labels.indexOf(p.dependsOn) < labels.indexOf(p.label), at + " builds on an earlier part");
          if (p.fill) assert(p.fill.rows.some((r) => r.some((c) => c === "")), at + " a table to complete has blanks");
          [p.table, p.fill].filter(Boolean).forEach((t) => t.rows.forEach((r) => eq(r.length, t.head.length, at + " table rows are rectangular")));
          total += p.marks;
        });
      });
      eq(total, paper.marks, tag + " parts add up to the paper");
      if (paper.format === "ocr-case") assert(paper.context && paper.org && paper.context.indexOf(paper.org) >= 0, tag + " one organisation, named in the context");
    });
  });
  assert(n >= 1, "at least one paper");
});

step("B · F201 paper 1 is the SAM's blueprint", async () => {
  const p = PAPERS["ocr-f201"][0];
  eq(p.questions.map((q) => q.parts.reduce((s, x) => s + x.marks, 0)), [9, 9, 5, 5, 2, 18, 8, 4], "marks a question");
  const ext = [].concat(...p.questions.map((q) => q.parts)).filter((x) => x.levels).map((x) => [x.marks, x.command]);
  eq(ext, [[6, "Analyse"], [9, "Discuss"]], "one 6-mark Analyse and one 9-mark Discuss");
  const leaves = new Set([].concat(...p.questions.map((q) => q.parts.map((x) => x.ref.split(".").slice(0, 2).join(".")))));
  ["F201.1", "F201.2", "F201.3", "F201.4", "F201.5"].forEach((ta) => assert(leaves.has(ta), "covers topic area " + ta));
});

step("C · the paper page, the scheme and timed mode", async () => {
  const a = K.exams.add({ preset: "ocr-f201", tier: "mock", title: "F201 mock", date: "2026-12-15", time: "09:00" }, { quiet: true });
  eq(a.durationMins, 90, "the preset's time is the SAM's");
  const paper = K.examPaper.build(a, 1);
  eq([paper.kind, paper.marks, paper.mins, paper.format], ["authored", 60, 90, "ocr-case"], "paper 1 is the authored paper");
  assert(K.examPaper.build(a, 2).kind !== "authored", "paper 2 is generated until more are written");
  K.show("exams", { id: a.id, tab: "paper", sub: "1" }); await app.settle();
  const main = app.document.querySelector("#main");
  assert(main.querySelector("[data-ui~='exams.pcontext']") && /Coastline Energy/.test(main.textContent), "the context");
  assert(main.querySelectorAll(".k-ex-ptable").length >= 2 && main.querySelector("td[data-blank]"), "a data table and a table to complete");
  assert(/\[9\]/.test(main.textContent) && !/Total for Question/.test(main.textContent), "OCR's [n] and no total line");
  assert(/Time: 1 h 30 min/.test(main.textContent), "1 h 30 on the cover");
  const pages = K.examPaperView.pageEls(a, paper, true);
  const ms = pages.filter((p) => p.classList.contains("k-ex-ms-page"))[0];
  assert(ms && /Level 3 \(7–9 marks\)/.test(ms.textContent) && /Indicative content/.test(ms.textContent), "the scheme prints levels and indicative content");
  app.document.querySelector("[data-ui~='exams.timed-start']").click(); await app.settle();
  assert(app.document.querySelector("[data-ui~='exams.tcontext']"), "timed mode shows the case study");
  app.document.querySelector("[data-ui~='exams.tend']").click(); await app.settle();
  const rows = [...app.document.querySelectorAll("[data-ui~='exams.tally-row']")];
  eq(rows.length, paper.questions.reduce((s, q) => s + q.parts.length, 0), "a tally row a part");
  const nine = rows.filter((r) => /time series/.test(r.textContent))[0];
  assert(nine && nine.querySelectorAll("[data-ui~='exams.mchip']").length === 9, "the 9-marker is marked by mark");
  app.document.querySelector("[data-ui~='exams.tally-dialog']").parentNode.close();
  K.exams.remove(a.id);
});

step("D · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke181: " + failed + " failed" : "smoke181: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
