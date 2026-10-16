/* Kurenai OS — smoke76.test.js
   Code (roadmap 5.3), part 4: capstones (frame 26l).

     A · THE CONTENT. A written capstone has a five-question quiz linked to
         written lessons, a brief, a starter, milestones of acceptance cases
         and a rubric with one automatic row. Its reference answer passes
         every case (with its files on the in-app disk); its starter passes
         none; it uses its stage's language only (stage 1: no arrays, lists
         or classes; stage 2: no classes or LINQ).
     B · THE STEPS. The quiz never locks: under 3 of 5 it recommends two
         lessons. Correctness comes from the acceptance runs and cannot be
         set by hand. Submitting refuses until every milestone passes, the
         rubric is marked and the write-up is long enough.
     C · PAY ONCE. A pass pays the capstone's reward through the ledger
         once; a second submission pays nothing.
     D · THE PAGE. Every step draws without writing to the store; the
         stage path's diamond and the map row open it.
   tools/cs_diff.mjs additionally runs the reference against .NET.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke76.test.js                                            */
"use strict";
const { loadCode } = require("./lib/code-content.js");
const { boot } = require("./lib/app-harness");
const { K, content, CSI } = loadCode();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const norm = (s) => String(s == null ? "" : s).replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
const run = (src, stdin, fs) => CSI.run({ files: [{ name: "Program.cs", src }], stdin: stdin || "", fs: fs });
const written = Object.keys(K.CAPSTONES).filter((id) => K.CAPSTONES[id].milestones);

step("A · every written capstone is whole, and its answer passes", () => {
  assert(written.indexOf("C1") >= 0 && written.indexOf("C2") >= 0, "capstones 1 and 2 ship");
  written.forEach((id) => {
    const c = K.CAPSTONES[id];
    assert(c.quiz.length === 5 && c.quiz.every((q) => q.opts && q.ans >= 0 && q.ans < q.opts.length && q.why && content["code:" + q.lesson]), id + ": the quiz (5, each linked to a written lesson)");
    assert(c.brief && c.brief.length && c.starter && c.answer && c.reward, id + ": brief, starter, answer, reward");
    assert(c.rubric.filter((r) => r.auto).length === 1 && c.rubric.every((r) => r.max > 0), id + ": one automatic rubric row");
    assert(c.milestones.length >= 3 && c.milestones.every((m) => m.cases.length && m.cases.some((x) => !x.hidden)), id + ": milestones each with a visible case");
    c.milestones.forEach((m) => m.cases.forEach((x, i) => {
      const fs = x.fs || m.fs || c.fs;
      const r = run(c.answer, x.stdin, fs);
      assert(r.ok && norm(r.stdout) === norm(x.out), id + " " + m.id + " case " + (i + 1) + ": the answer fails\n" + (r.ok ? r.stdout : JSON.stringify(r.error)));
      const s = run(c.starter, x.stdin, fs);
      assert(!(s.ok && norm(s.stdout) === norm(x.out)), id + " " + m.id + " case " + (i + 1) + ": the starter already passes");
    }));
    if (c.stage === 1) assert(!/\[\s*\]|\bnew\b|\bclass\b|List</.test(c.answer), id + ": stage 1 only — no arrays, lists or classes");
    if (c.stage === 2) assert(!/\b(class|record|struct|interface)\b|System\.Linq|\.(Select|Where|OrderBy|GroupBy|Sum|Average)\(/.test(c.answer), id + ": stage 2 only — no classes or LINQ");
  });
});

step("B · the quiz never locks; correctness is automatic; submit waits", async () => {
  const app = await boot(), KOS = app.KOS, id = "C1", c = KOS.code.capstone(id);
  const wrong = c.quiz.map((q) => (q.ans + 1) % q.opts.length);
  const q = KOS.code.answerQuiz(id, wrong);
  assert(q.score === 0 && q.recommend.length === 2, "0 of 5 recommends two lessons: " + JSON.stringify(q));
  assert(KOS.code.answerQuiz(id, c.quiz.map((x) => x.ans)).score === 5, "a retake scores again");
  KOS.code.setRubric(id, "correct", 12);
  assert(KOS.code.rubricView(id).rows[0].value === 0, "the automatic row cannot be set by hand");
  let o = KOS.code.submitCapstone(id);
  assert(!o.passed && o.missing.length === 3, "nothing built, marked or written: three things missing");
  c.milestones.forEach((m) => KOS.code.recordMilestone(id, m.id, m.cases.length - 1, m.cases.length));
  assert(!KOS.code.buildView(id).all && KOS.code.rubricView(id).rows[0].value < 12, "one failing case per milestone is not built");
  c.milestones.forEach((m) => KOS.code.recordMilestone(id, m.id, m.cases.length, m.cases.length));
  assert(KOS.code.buildView(id).all && KOS.code.rubricView(id).rows[0].value === 12, "every case passing fills correctness");
  c.rubric.filter((r) => !r.auto).forEach((r) => KOS.code.setRubric(id, r.id, 3));
  KOS.code.setWriteup(id, "too short");
  o = KOS.code.submitCapstone(id);
  assert(!o.passed && o.missing.length === 1 && o.missing[0].step === "writeup", "a short write-up still holds it");
  assert(KOS.code.capStage(id) !== "passed", "not passed yet");
  app.window.close();
});

step("C · a pass pays once", async () => {
  const app = await boot(), KOS = app.KOS, id = "C1", c = KOS.code.capstone(id), g = KOS.store.state.governor;
  c.milestones.forEach((m) => KOS.code.recordMilestone(id, m.id, m.cases.length, m.cases.length));
  c.rubric.filter((r) => !r.auto).forEach((r) => KOS.code.setRubric(id, r.id, 4));
  KOS.code.setWriteup(id, Array(60).fill("word").join(" "));
  g.hp = 50;
  const xp0 = g.xp, gold0 = g.gold;
  const o = KOS.code.submitCapstone(id);
  assert(o.passed && o.paid && o.pay.xp === c.reward.xp, "passed and paid: " + JSON.stringify(o));
  assert(g.xp - xp0 === c.reward.xp && g.gold - gold0 === c.reward.gold && g.hp === 50 + c.reward.hp, "the Governor paid the reward");
  const e = KOS.sessions.all().slice(-1)[0];
  assert(e.type === "code" && e.metrics.kind === "capstone" && e.award.xp === c.reward.xp, "one ledger entry with its award");
  const again = KOS.code.submitCapstone(id);
  assert(again.passed && !again.paid && g.xp - xp0 === c.reward.xp, "a second submission pays nothing");
  assert(KOS.code.capStage(id) === "passed" && KOS.code.stats().capstones === 1, "the path and the desk count it");
  app.window.close();
});

step("D · every step draws without writing; the path and map open it", async () => {
  const app = await boot(), KOS = app.KOS, doc = app.document;
  KOS.show("code", { page: "map" }); await app.settle();
  const row = doc.querySelector("[data-ui~='code.map-capstone']");
  assert(row, "the map's capstone row is a button");
  row.click(); await app.settle();
  assert(doc.querySelector("[data-ui~='code.capstone']"), "the map row opens the capstone");
  const snap = () => JSON.stringify(KOS.store.state.code) + JSON.stringify(KOS.store.state.governor) + JSON.stringify(KOS.store.state.progress);
  for (const s of KOS.code.CAP_STEPS.map((x) => x[0])) {
    KOS.store.state.ui.code.capStep = { C1: s };
    const before = snap();
    KOS.show("code", { page: "capstone", id: "C1" }); await app.settle();
    assert(doc.querySelector("[data-ui~='code.cap-step']"), s + ": a step body");
    assert(doc.querySelector('[data-step="' + s + '"][aria-selected="true"]'), s + ": the stepper marks it");
    assert(snap() === before, s + " wrote to the store while drawing");
  }
  KOS.show("subject", "code"); await app.settle();
  const dia = doc.querySelector("[data-ui~='code.path-capstone']");
  assert(dia, "the stage path's diamond is a button");
  dia.click(); await app.settle();
  assert(doc.querySelector("[data-ui~='code.capstone']"), "the diamond opens it");
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
  app.window.close();
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE76 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE76 PASS — Code's capstones (" + steps.length + " steps).");
  process.exit(0);
})();
