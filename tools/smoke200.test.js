/* Kurenai OS — smoke200.test.js
   Study Content, Layout & Deduplication Cleanup regressions (neon/study-cleanup-1).
   DO NOT touch smoke198.test.js or smoke199.test.js.

     A · Rich block rendering (KOS.content.rich) in Exam Qs, Quizzes, Mark Schemes & Flashcards
     B · Wide trace tables stack vertically & scroll horizontally instead of clipping
     C · examFromWorked never leaks { lab } blocks or notes-only variations; it.try renders below question stem

   Run: node tools/smoke200.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const ROOT = path.join(__dirname, "..");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b));
  }
}

let app, K, doc;

step("boot", async () => {
  app = await boot({ eager: true, clock: "2026-11-22T12:00:00" });
  K = app.KOS;
  doc = app.document;
  await app.settle();
});

step("A · Rich block rendering in Exam Qs, Quizzes, Mark Schemes & Flashcards", async () => {
  assert(typeof K.content.rich === "function", "KOS.content.rich exists");

  /* Fast-path inline vs rich block markdown */
  assert(!/<figure|<table|<ul/.test(K.content.rich("Simple inline `x = 1` text.")), "plain inline text stays inline");
  const codeHtml = K.content.rich("Trace this algorithm:\n\n```pseudo\nPos ← −1\nWHILE Current ≠ −1\n  Pos ← Pos + 1\nENDWHILE\n```\n\nState the ADT.");
  assert(/data-ui="content\.code"/.test(codeHtml), "fenced pseudocode renders as content.code figure");
  const tableHtml = K.content.rich("Given the table:\n\n| A | B | Q |\n|---|---|---|\n| 0 | 1 | 1 |");
  assert(/<table\b/.test(tableHtml), "markdown pipe table renders as real <table>");

  /* Exam Q stem + mark scheme code preservation through examFromWorked */
  const w = {
    worked: {
      tag: "exam",
      title: "Tree walk",
      src: "A-level June 2024 · P1 Q06.4 · 2 marks",
      q: "An algorithm walks a binary tree:\n\n```pseudo\nPos ← −1\nWHILE Current ≠ −1\n  Pos ← Pos + 1\nENDWHILE\n```\n\nState the ADT.",
      steps: [
        { m: "A stack — last in, first out.", mk: "1" },
        { m: "Example push:\n\n```pseudo\nPos ← Pos + 1\nTemp[Pos] ← Current\n```", mk: "1" }
      ],
      result: "Stack"
    }
  };
  const derived = K.content.examFromWorked([w], "AQA")[0];
  assert(derived && derived.ms.some((l) => /```pseudo\nPos ← Pos \+ 1/.test(l)), "examFromWorked preserves fenced code newlines in mark-scheme steps");

  const hostEx = doc.createElement("div");
  doc.body.appendChild(hostEx);
  K.quiz.mountExam(hostEx, "compsci", "4.2.3.1", [derived], { bare: true });
  assert(hostEx.querySelector("[data-ui~='quiz.part'] [data-ui~='content.code']"), "Exam Q renders fenced pseudocode as a code figure");
  hostEx.querySelector("[data-ui~='quiz.reveal']").click();
  await app.settle();
  assert(hostEx.querySelector("[data-ui~='quiz.ms'] [data-ui~='content.code']"), "Exam mark scheme renders fenced code as a code figure");
  hostEx.remove();

  /* Quiz MCQ renders fenced code */
  const hostQz = doc.createElement("div");
  doc.body.appendChild(hostQz);
  K.quiz.mountMCQ(hostQz, "compsci", "4.2.3.1", [
    { q: "What does this output?\n\n```pseudo\nx ← 3\nOUTPUT x * 2\n```", opts: ["6", "3", "9", "5"], ans: 0, why: "3 * 2 = 6." }
  ], { bare: true, onFinish: () => {} });
  assert(hostQz.querySelector("[data-ui~='quiz.q'] [data-ui~='content.code']"), "MCQ stem renders fenced code as a code figure");
  hostQz.remove();

  /* Flashcards render fenced code */
  const hostFc = doc.createElement("div");
  doc.body.appendChild(hostFc);
  K.flashcards.session(hostFc, [
    { key: "test:fc:0", sid: "compsci", ref: "4.2.3.1", q: "Trace:\n\n```pseudo\nOUTPUT 1 + 2\n```", a: "Outputs `3`.", custom: true }
  ], { sid: "compsci", ref: "4.2.3.1" });
  assert(hostFc.querySelector("[data-ui~='content.code']"), "Flashcard face renders fenced code as a code figure");
  hostFc.remove();
});

step("B · Wide trace tables stack vertically & scroll horizontally instead of clipping", () => {
  const WIDE = {
    code: "ItemsCount ← 4\nNewItems[0] ← Items[0]",
    lang: "pseudo",
    cols: ["LoopA", "LoopB", "Done", "NewItemsCount", "NewItems[0]", "NewItems[1]", "NewItems[2]", "NewItems[3]"],
    rows: [["", "", "", "1", "7", "0", "0", "0"], ["1", "0", "True", "1", "7", "0", "0", "0"]],
    given: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [1, 0]]
  };
  const host = doc.createElement("div");
  doc.body.appendChild(host);
  host.innerHTML = K.content.renderBlocks([{ trace: WIDE }]);
  K.content.typeset(host);
  const split = host.querySelector(".k-fill-split");
  assert(split && split.hasAttribute("data-wide"), "wide trace table (>=5 cols) sets data-wide to stack vertically");
  const scroller = host.querySelector(".k-fill-scroll[data-scroller='true']");
  assert(scroller && scroller.querySelector(".k-fill-grid"), "trace grid is wrapped in a horizontal scroller shell");
  host.remove();

  const css = fs.readFileSync(path.join(ROOT, "css/views/study.css"), "utf8");
  assert(/\.k-fill-scroll\s*\{[^}]*overflow-x:\s*auto/.test(css), "study.css enables horizontal scroll on .k-fill-scroll");
  assert(/\.k-fill-split\[data-wide\]\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(css), "study.css stacks .k-fill-split[data-wide]");
  assert(!/\.k-fill-grid\s*\{[^}]*overflow:\s*hidden/.test(css), ".k-fill-grid does not clip columns with overflow: hidden");
});

step("C · examFromWorked blocks { lab } and notes-only variations; it.try sits below question stem", () => {
  /* 1. { lab } stripped from exam items */
  const withLab = {
    worked: {
      tag: "exam", title: "Undo", src: "A-level June 2017 · P1 Q06.1 · 5 marks",
      q: "Explain how a single stack implements undo and repeat.",
      steps: [{ m: "Push actions.", mk: "1" }],
      try: [{ lab: "tl-stack" }]
    }
  };
  const exLab = K.content.examFromWorked([withLab], "AQA")[0];
  assert(!exLab.try || exLab.try.length === 0, "examFromWorked strips { lab } blocks from Exam Questions");

  /* 2. Notes-only "Your turn" variation stripped from exam items */
  const withVariation = {
    worked: {
      tag: "exam", title: "Dry run", src: "A-level June 2022 · P1 Q03 · 4 marks",
      q: "Trace with A = 4 and B = 3.",
      steps: [{ m: "Loop runs 3 times.", mk: "4" }],
      try: [{ trace: { code: "A ← 5", cols: ["A"], rows: [["5"]], given: [], cap: "**Your turn.** The same loop with A = 5 and B = 2." } }]
    }
  };
  const exVar = K.content.examFromWorked([withVariation], "AQA")[0];
  assert(!exVar.try || exVar.try.length === 0, "examFromWorked drops Notes-only Your turn variations");

  /* 3. Zero shipped exam items carry a { lab } block */
  const C = app.window.KOS_CONTENT || {};
  const leakedLabs = [];
  for (const k of Object.keys(C)) {
    (C[k].exam || []).forEach((e, i) => {
      (e.try || []).forEach((b) => { if (b && b.lab) leakedLabs.push(k + "#" + i + ":" + b.lab); });
    });
  }
  eq(leakedLabs, [], "zero shipped Exam Questions embed interactive { lab } widgets");

  /* 4. Valid matching it.try renders AFTER question text in mountExam */
  const host = doc.createElement("div");
  doc.body.appendChild(host);
  K.quiz.mountExam(host, "compsci", "4.1.1.2", [{
    q: "Complete the trace table below for total.",
    marks: 2,
    ms: ["i = 1, total = 1 [1]", "i = 2, total = 3 [1]"],
    try: [{ trace: { code: "total ← 0\nFOR i ← 1 TO 2\n  total ← total + i\nENDFOR", cols: ["i", "total"], rows: [["1", "1"], ["2", "3"]], given: [[0, 0], [1, 0]] } }]
  }], { bare: true });
  const qEl = host.querySelector("[data-ui~='quiz.part'] .k-qz-part-q");
  const tryEl = host.querySelector("[data-ui~='quiz.try']");
  assert(qEl && tryEl, "both question stem and interactive try part exist");
  assert(!!(qEl.compareDocumentPosition(tryEl) & 4), "interactive try widget appears AFTER question prompt in DOM order");
  host.remove();

  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? `\nSMOKE200 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE200 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
