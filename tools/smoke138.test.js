/* Kurenai OS — smoke138.test.js
   Content and marking (quality W6).

     A · CC-03, CM-02: a quiz question's options are shuffled for each
         attempt (the right answer was A or B in 94% of questions), the
         click and the stored pick are the AUTHORED index, and options that
         name each other ("All of the above", "Both A and B") keep their
         order. CM-25: no Maths question leans on the one before it.
     B · CM-14, CC-14, CC-17: the self-mark reads a point's mark codes —
         "[M1 A1]" is worth 2, "[3 marks]" 3; the worked "Answer:" is a
         model answer, never a tickable point; ticking every real step
         reaches full marks; an A needs its M even when the codes trail the
         step; "any 3 from 5" still caps at the total.
     C · EX-01: Marks by question takes an out-of and a topic for a
         question added by hand.
     D · CO-04: a Code task's Run input is the whole first example, one
         line per ReadLine.
     E · CC-01, CC-02: IT's spec text has no assessment dump, no empty
         bullet, no run-on "include:" guidance, and every ref is unique —
         F206.6.1 is "Ways to reflect" again.

   Run: node tools/smoke138.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, doc;
const $ = (s, r) => (r || doc).querySelector(s);
const $$ = (s, r) => Array.from((r || doc).querySelectorAll(s));

step("boot", async () => {
  app = await boot();
  K = app.KOS; doc = app.document;
  await app.settle();
});

step("A · options are shuffled, the pick is the authored index; self-referring options keep their order", async () => {
  const item = { q: "Pick the right one", opts: ["right", "wrong 1", "wrong 2", "wrong 3"], ans: 0, why: "" };
  const pos = new Set();
  for (let i = 0; i < 40; i++) {
    const h = doc.createElement("div"); doc.body.appendChild(h);
    K.quiz.mountMCQ(h, "compsci", "4.1.1.1", [item], { onFinish: () => {} });
    const opts = $$("[data-ui~='quiz.option']", h);
    pos.add(opts.findIndex((b) => b.getAttribute("data-oi") === "0"));
    h.remove();
  }
  assert(pos.size >= 3, "the right answer lands in different places: " + [...pos].join(","));
  /* the pick handed back is the authored index */
  let picks = null;
  const h = doc.createElement("div"); doc.body.appendChild(h);
  K.quiz.mountMCQ(h, "compsci", "4.1.1.1", [item], { onFinish: (p, c) => { picks = [p, c]; } });
  $$("[data-ui~='quiz.option']", h).find((b) => b.getAttribute("data-oi") === "0").click(); await app.settle();
  eq(picks, [[0], 1], "the right option, wherever it was drawn, is pick 0 and counts");
  h.remove();
  /* "All of the above" stays last */
  const ref = { q: "Which?", opts: ["a", "b", "c", "All of the above"], ans: 3 };
  for (let i = 0; i < 10; i++) {
    const g = doc.createElement("div"); doc.body.appendChild(g);
    K.quiz.mountMCQ(g, "compsci", "4.1.1.1", [ref], { onFinish: () => {} });
    eq($$("[data-ui~='quiz.option']", g).map((b) => b.getAttribute("data-oi")), ["0", "1", "2", "3"], "a self-referring set keeps its order");
    g.remove();
  }
  /* CM-25: no question opens by leaning on the one before */
  const src = fs.readFileSync(path.join(__dirname, "../js/data/content/bank-maths-mech.js"), "utf8");
  assert(!/q:\s*"Tension then:"/.test(src), "M8.4's 'Tension then:' says what it is about");
});

async function examWith(parts) {
  const h = doc.createElement("div"); doc.body.appendChild(h);
  K.quiz.mountExam(h, "maths", "1.1", [{ src: "test", marks: parts.marks, q: "Q", ms: parts.ms }]);
  await app.settle();
  const reveal = $("[data-ui~='quiz.reveal']", h);
  assert(reveal, "a Reveal mark scheme button");
  reveal.click(); await app.settle();
  const boxes = $$("[data-ui~='quiz.selfmark'] input[type='checkbox']", h);
  const award = () => +$("[data-ui~='quiz.award']", h).textContent;
  return { h, boxes, award, tick: async (i) => { boxes[i].checked = true; boxes[i].dispatchEvent(new app.window.Event("change", { bubbles: true })); await app.settle(); } };
}

step("B · the self-mark reads mark codes; the Answer line is a model answer", async () => {
  /* CM-14: the audit's maths 1.1 Q1 shape — 3 marks */
  let x = await examWith({ marks: 3, ms: ["Expand the bracket [M1 A1]", "Collect like terms [A1]", "**Answer:** $x = 2$"] });
  eq(x.boxes.length, 2, "two real points; the Answer line is not a checkbox");
  assert($("[data-ui~='quiz.model-answer']", x.h) && /Model answer/.test($("[data-ui~='quiz.model-answer']", x.h).textContent), "the Answer is shown as the model answer");
  await x.tick(0);
  eq(x.award(), 2, "the [M1 A1] step is worth 2");
  await x.tick(1);
  eq(x.award(), 3, "both steps: full marks");
  x.h.remove();
  /* an A with its codes trailing still needs its M */
  x = await examWith({ marks: 2, ms: ["Use the formula [M1]", "Correct value [A1]"] });
  await x.tick(1);
  eq([x.boxes[1].checked, x.award()], [false, 0], "the A cannot be ticked before its M");
  x.h.remove();
  /* CC-17: steps of 3/1/1 for a 7-mark question (plus the Answer line) */
  x = await examWith({ marks: 7, ms: ["Trace the loop [3 marks]", "State the output [1 mark]", "Explain why [1 mark]", "**Answer:** 42"] });
  eq(x.boxes.length, 3, "three real points");
  await x.tick(0); await x.tick(1); await x.tick(2);
  eq(x.award(), 7, "every real step ticked reaches full marks (it gave 5 of 7)");
  x.h.remove();
  /* any 3 from 5 */
  x = await examWith({ marks: 3, ms: ["a", "b", "c", "d", "e"] });
  for (let i = 0; i < 4; i++) await x.tick(i);
  eq(x.award(), 3, "four of five ticked caps at 3");
  x.h.remove();
});

step("C · EX-01: a question added by hand takes its out-of and its topic", async () => {
  const e = K.tracker.add ? K.tracker.add({ subject: "compsci", paper: "Class mock", date: K.srs.todayISO(), marks: 10, max: 40, timed: true, mins: 60 }) : null;
  assert(e && e.uid, "an attempt");
  K.show("exams", { attempt: e.uid, page: "marks" }); await app.settle();
  const add = $$("button").find((b) => /＋ Question/.test(b.textContent));
  assert(add, "＋ Question");
  add.click(); await app.settle();
  const max = $("[data-ui~='exams.max']");
  assert(max, "an out-of field on the new row");
  max.value = "6"; max.dispatchEvent(new app.window.Event("input", { bubbles: true })); await app.settle();
  assert($("[data-ui~='exams.q-topic']"), "a topic picker on the current row");
  eq(app.errors, [], "no page errors");
});

step("D · CO-04: the Run input is the whole first example", async () => {
  const T = app.window.KOS_CODE && app.window.KOS_CODE.TASKS;
  const t = Object.values(T || {}).find((x) => x.examples && x.examples[0] && String(x.examples[0].stdin || "").split("\n").filter(Boolean).length >= 3);
  assert(t, "a task with multi-line input");
  K.show("code", { page: "task", id: t.id }); await app.settle();
  const box = $("[data-ui~='code.stdin']");
  assert(box, "the task page draws its Run input");
  eq(box.tagName, "TEXTAREA", "several lines");
  eq(box.value.split("\n").length, String(t.examples[0].stdin).replace(/\n$/, "").split("\n").length, "every line of the example");
});

step("E · CC-01, CC-02: IT's spec text is readable and its refs unique", () => {
  const it = app.window.KOS_DATA.it, refs = {}, bad = [];
  (function walk(n) {
    if (n.ref) refs[n.ref] = (refs[n.ref] || 0) + 1;
    ["content", "info"].forEach((k) => (n[k] || []).forEach((x) => {
      if (typeof x !== "string") return;
      if (x.length > 300) bad.push(n.ref + " long " + x.length);
      if (/^(not )?include:/i.test(x)) bad.push(n.ref + " include:");
      if (x.trim() === "□") bad.push(n.ref + " empty bullet");
      if (/Assessment (criteria|guidance)|in the set assignment for this unit/.test(x)) bad.push(n.ref + " assessment dump");
    }));
    (n.children || n.sections || []).forEach(walk);
  })(it);
  eq(bad, [], "no damaged string");
  eq(Object.keys(refs).filter((r) => refs[r] > 1), [], "every ref once");
  const leaf = K.hub.LEAVES.it.find((l) => l.ref === "F206.6.1");
  eq(leaf && leaf.title, "Ways to reflect", "F206.6.1 is Ways to reflect");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke138: " + failed + " failed" : "smoke138: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
