/* Kurenai OS — smoke153.test.js
   Roadmap 5.19 item 3 (design turn 43): figures and parts to fill in.

     A · the pure helpers: a typed cell against the expected one, SQL rows as
         a multiset, a circuit's truth table, the tables an SQL setup makes.
     B · a block names a part; renderBlocks emits its placeholder and
         typeset() mounts it, once, for every kind.
     C · a table to complete: Check counts the right cells, names the first
         wrong row, offers Show expected; Clear empties it.
     D · a circuit with a hidden gate: the wrong gate names the first row it
         breaks, the right one matches every row; switching an input fills
         the table's "Q now".
     E · predict: Run waits for an answer.
     F · a worked example's own figure and its "Your turn"; an exam item made
         from it keeps both; the quiz, exam and Companion draw figures.
     G · tools/fill_check.mjs exists and is the checker content runs.

   Run: node tools/smoke153.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const ROOT = path.join(__dirname, "..");
let app, K, doc;

const TRACE = { code: "total ← 0\nFOR i ← 1 TO 2\n  total ← total + i\nENDFOR", cols: ["i", "total"], rows: [["1", "1"], ["2", "3"]], given: [[0, 0], [1, 0]] };
const CIRCUIT = { inputs: ["A", "B", "C"], gates: [{ id: "g1", type: "AND", in: ["A", "B"] }, { id: "g2", type: "OR", in: ["g1", "C"] }], out: "g2", pick: "g2" };

function mountOne(block) {
  const host = doc.createElement("div");
  doc.body.appendChild(host);
  host.innerHTML = K.content.renderBlocks([block]);
  K.content.typeset(host);
  return host;
}

step("boot", async () => {
  app = await boot({ clock: "2026-11-16T10:00:00" });
  K = app.KOS; doc = app.document;
});

step("A · the pure helpers", () => {
  const F = K.fillIns;
  assert(F.cellSame(" 4.0 ", "4") && F.cellSame("True", "true") && F.cellSame("-", "") && F.cellSame("'Ada'", "Ada"), "cells compare by value");
  assert(!F.cellSame("10", "1") && !F.cellSame("", "0"), "and not loosely");
  const s = (rows) => ({ columns: ["a", "b"], rows });
  assert(F.sameRows(s([[1, "x"], [2, "y"]]), s([[2, "y"], [1, "x"]])), "rows as a multiset");
  assert(!F.sameRows(s([[1, "x"], [2, "y"]]), s([[2, "y"], [1, "x"]]), true), "unless ordered");
  assert(!F.sameRows(s([[1, "x"]]), s([[1, "x"], [1, "x"]])), "a duplicate counts");
  const t = F.truth(CIRCUIT);
  eq(t.map((r) => r.want), [0, 1, 0, 1, 0, 1, 1, 1], "(A AND B) OR C");
  eq(F.gateEval(CIRCUIT, { A: 1, B: 1, C: 0 }, { g2: "NOR" }).g2, 0, "a type override");
  eq(F.tablesOf("CREATE TABLE Student (StudentID INTEGER PRIMARY KEY, Forename TEXT, PRIMARY KEY (StudentID));\nCREATE TABLE Club (ClubID INTEGER, ClubName TEXT);"),
    [{ name: "Student", cols: ["StudentID", "Forename"] }, { name: "Club", cols: ["ClubID", "ClubName"] }], "tables from the setup");
});

step("B · every kind mounts from its block, once", () => {
  const kinds = { grid: TRACE, trace: TRACE, gates: CIRCUIT, predict: { code: "Console.WriteLine(1);" },
    sql: { setup: "CREATE TABLE T (a INTEGER);\nINSERT INTO T VALUES (1);", answer: "SELECT a FROM T;" } };
  Object.keys(kinds).forEach((k) => {
    const host = mountOne({ [k]: kinds[k] });
    const slot = host.querySelector("[data-ui~='content.fill']");
    assert(slot && slot.getAttribute("data-kind") === k, k + " placeholder");
    assert(slot.querySelector("[data-ui~='fill.part']"), k + " mounted");
    K.content.typeset(host);
    eq(host.querySelectorAll("[data-ui~='fill.part']").length, 1, k + " mounts once");
    host.remove();
  });
  const fig = mountOne({ fig: { x: [0, 1], y: [0, 1], items: [{ fn: "x" }] } });
  assert(!fig.querySelector("[data-ui~='content.fill']"), "a figure block is not a fill-in (a fig's own grid:false never is)");
  fig.remove();
});

step("C · a table to complete", () => {
  const host = mountOne({ trace: TRACE });
  const ins = host.querySelectorAll("input");
  eq(ins.length, 2, "the given cells are not typed");
  ins[0].value = "1"; ins[1].value = "2";
  host.querySelector("[data-ui~='fill.check']").click();
  const v = host.querySelector("[data-ui~='fill.verdict']").textContent;
  assert(/1 of 2 cells/.test(v) && /row 2 \(i = 2\)/.test(v), "the count and the first wrong row: " + v);
  eq(ins[1].getAttribute("data-state"), "wrong", "the wrong cell is marked");
  const show = host.querySelector("[data-ui~='fill.show']");
  assert(!show.hidden, "Show expected is offered");
  show.click();
  assert(!ins[1].parentNode.querySelector(".k-fill-exp").hidden && ins[0].parentNode.querySelector(".k-fill-exp").hidden, "expected shown under the wrong cell only");
  ins[1].value = "3";
  host.querySelector("[data-ui~='fill.check']").click();
  assert(/Every cell right/.test(host.querySelector("[data-ui~='fill.verdict']").textContent), "all right");
  host.querySelector("[data-ui~='fill.clear']").click();
  assert([...ins].every((i) => i.value === "" && !i.hasAttribute("data-state")), "Clear empties it");
  host.remove();
});

step("D · a circuit with a hidden gate", () => {
  const host = mountOne({ gates: CIRCUIT });
  const check = () => { host.querySelector("[data-ui~='fill.check']").click(); return host.querySelector("[data-ui~='fill.verdict']").textContent; };
  assert(/Pick a gate/.test(check()), "a pick is asked for first");
  host.querySelector("[data-gate='AND']").click();
  assert(/Not this one/.test(check()), "the wrong gate is refused, naming a row");
  host.querySelector("[data-gate='OR']").click();
  assert(/Matches every row/.test(check()), "the right gate matches");
  host.querySelector("[data-ui~='fill.input']").click();
  const now = [...host.querySelectorAll("[data-now]")].filter((c) => c.textContent !== "");
  assert(now.length >= 2, "switching an input fills Q now for the rows tried");
  assert(host.querySelector("svg .k-fill-gate[data-hidden]"), "the hidden gate is drawn dashed");
  host.remove();
});

step("E · predict: Run waits for an answer", () => {
  const host = mountOne({ predict: { code: "Console.WriteLine(2 + 3);" } });
  const run = host.querySelector("[data-ui~='fill.run']"), ta = host.querySelector("textarea");
  assert(run.disabled, "Run is locked before an answer");
  ta.value = "5"; ta.dispatchEvent(new app.window.Event("input"));
  assert(!run.disabled, "and opens once there is one");
  host.remove();
});

step("F · figures on worked examples, exam items, quiz, Companion", () => {
  const w = { worked: { tag: "exam", title: "T", src: "June 2022 · P1 Q3 · 4 marks", q: "Sketch it.", fig: { x: [0, 2], y: [0, 4], items: [{ fn: "x^2" }] },
    steps: [{ m: "Work.", mk: "M1" }], try: [{ trace: TRACE }] } };
  const host = mountOne(w);
  assert(host.querySelector("[data-ui~='content.worked'] .k-n-wrow svg"), "the question's figure in the Given row");
  assert(host.querySelector("[data-ui~='content.worked-try'] [data-ui~='fill.part']"), "Your turn mounts its part");
  host.remove();
  const item = K.content.examFromWorked([w], "Edexcel")[0];
  assert(item.fig && item.try, "the exam item keeps the figure and the part");
  const quiz = fs.readFileSync(path.join(ROOT, "js/engines/quiz.js"), "utf8");
  assert(/item\.fig \? el\("div", \{ class: "k-prose k-qz-fig"/.test(quiz) && /if \(it\.fig\)/.test(quiz) && /if \(it\.try\)/.test(quiz), "quiz and exam cards draw them");
  const deep = fs.readFileSync(path.join(ROOT, "js/modules/examdeep.js"), "utf8");
  assert(/v\.fig \?/.test(deep) && /v\.try \?/.test(deep) && /s\.fig && KOS\.figures/.test(deep), "the Companion's variations and steps draw them");
  eq(app.errors, [], "no page errors");
});

step("G · the content checker", () => {
  assert(fs.existsSync(path.join(ROOT, "tools/fill_check.mjs")), "tools/fill_check.mjs");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? `\nSMOKE153 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE153 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
