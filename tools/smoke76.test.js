/* Kurenai OS — smoke76.test.js
   Code (roadmap 5.3), part 4: capstones (frame 26l).

     A · THE CONTENT. A written capstone has a five-question quiz linked to
         written lessons, a brief, a starter, milestones of acceptance cases
         and a rubric with one automatic row. Its reference answer passes
         every case (with its files on the in-app disk); its starter passes
         none; it uses its stage's language only (stage 1: no arrays, lists
         or classes; stage 2: no classes or LINQ; stage 3 shows its
         design: an interface, classes and LINQ). A sandbox capstone (stage
         3) runs on the full runtime, nullable on, as in the app.
     B · THE STEPS. The quiz never locks: under 3 of 5 it recommends two
         lessons. Correctness comes from the acceptance runs and cannot be
         set by hand. Submitting refuses until every milestone passes, the
         rubric is marked and the write-up is long enough.
     C · PAY ONCE. A pass pays the capstone's reward through the ledger
         once; a second submission pays nothing.
     D · THE PAGE. Every step draws without writing to the store; the
         stage path's diamond and the map row open it.
     E · A RIDER CAPSTONE (stage 4). C4's build is its project's validator
         milestones: the quiz, brief and rubric as above, a project with
         its checks and no reward of its own; a real report
         (tools/fixtures/planner-report-solved.json) passes the milestones,
         the project pays nothing, and the capstone pays once when
         submitted. Its steps draw without writing.
   tools/cs_diff.mjs additionally runs the reference against .NET.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke76.test.js                                            */
"use strict";
const { loadCode } = require("./lib/code-content.js");
const { loadWasm } = require("./lib/cs-wasm-node.js");
const { boot } = require("./lib/app-harness");
const { K, content, CSI } = loadCode();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const norm = (s) => String(s == null ? "" : s).replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
let WASM = null;
const run = async (src, stdin, fs, where) => where === "sandbox"
  ? WASM.run({ files: [{ name: "Program.cs", src }], stdin: stdin || "", fs: fs, nullable: true })
  : CSI.run({ files: [{ name: "Program.cs", src }], stdin: stdin || "", fs: fs });
const written = Object.keys(K.CAPSTONES).filter((id) => K.CAPSTONES[id].milestones);
const riderCaps = Object.keys(K.CAPSTONES).filter((id) => K.CAPSTONES[id].project);

step("A · every written capstone is whole, and its answer passes", async () => {
  assert(written.indexOf("C1") >= 0 && written.indexOf("C2") >= 0 && written.indexOf("C3") >= 0, "capstones 1, 2 and 3 ship");
  if (written.some((id) => K.CAPSTONES[id].where === "sandbox")) {
    WASM = await loadWasm();
    assert(WASM, "a sandbox capstone needs the full runtime — run tools/build_cs_wasm.sh");
  }
  for (const id of written) {
    const c = K.CAPSTONES[id];
    assert(c.quiz.length === 5 && c.quiz.every((q) => q.opts && q.ans >= 0 && q.ans < q.opts.length && q.why && content["code:" + q.lesson]), id + ": the quiz (5, each linked to a written lesson)");
    assert(c.brief && c.brief.length && c.starter && c.answer && c.reward, id + ": brief, starter, answer, reward");
    assert(c.rubric.filter((r) => r.auto).length === 1 && c.rubric.every((r) => r.max > 0), id + ": one automatic rubric row");
    assert(c.milestones.length >= 3 && c.milestones.every((m) => m.cases.length && m.cases.some((x) => !x.hidden)), id + ": milestones each with a visible case");
    for (const m of c.milestones) for (const [i, x] of m.cases.entries()) {
      const fs = x.fs || m.fs || c.fs;
      const r = await run(c.answer, x.stdin, fs, c.where);
      assert(r.ok && norm(r.stdout) === norm(x.out), id + " " + m.id + " case " + (i + 1) + ": the answer fails\n" + (r.ok ? r.stdout : JSON.stringify(r.error)));
      if (c.where === "sandbox") assert(!(r.warnings || []).length, id + ": the answer has compiler warnings " + JSON.stringify(r.warnings));
      const s = await run(c.starter, x.stdin, fs, c.where);
      assert(!(s.ok && norm(s.stdout) === norm(x.out)), id + " " + m.id + " case " + (i + 1) + ": the starter already passes");
    }
    if (c.stage === 1) assert(!/\[\s*\]|\bnew\b|\bclass\b|List</.test(c.answer), id + ": stage 1 only — no arrays, lists or classes");
    if (c.stage === 2) assert(!/\b(class|record|struct|interface)\b|System\.Linq|\.(Select|Where|OrderBy|GroupBy|Sum|Average)\(/.test(c.answer), id + ": stage 2 only — no classes or LINQ");
    if (c.stage === 3) assert(/\binterface\b/.test(c.answer) && /\bclass\b/.test(c.answer) && /\bevent\b/.test(c.answer) && /\.GroupBy\(/.test(c.answer), id + ": stage 3 shows its design — an interface, classes, an event and LINQ");
  }
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

step("E · capstone 4 is built in Rider: validator milestones, the capstone pays once", async () => {
  assert(riderCaps.join() === "C4", "capstone 4 is the Rider capstone");
  const c = K.CAPSTONES.C4, p = K.PROJECTS[c.project];
  assert(c.where === "rider" && c.stage === 4 && p && p.capstone === "C4" && !p.reward && p.files && p.files["RevisionPlanner.sln"], "C4's project: its scaffold, linked back, no reward of its own");
  assert(c.quiz.length === 5 && c.quiz.every((q) => q.opts && q.ans >= 0 && q.ans < q.opts.length && q.why && content["code:" + q.lesson]), "the quiz (5, each linked to a written lesson)");
  assert(c.rubric.filter((r) => r.auto).length === 1 && c.brief.length && c.reward.xp === 300 && c.writeupMin >= 80, "brief, one automatic rubric row, the reward");
  assert(p.milestones.length === 5 && p.milestones[0].checks.some((x) => x.type === "mutants") && p.protected.indexOf("src/Planner.Core/Priority.cs") >= 0, "milestones with planted bugs; the rule is protected");
  const fsx = require("fs"), path = require("path");
  const app = await boot(), KOS = app.KOS, g = KOS.store.state.governor, doc = app.document;
  KOS.codeProject._setValidator(fsx.readFileSync(path.join(__dirname, "..", "assets/code/validator/validate.cs"), "utf8"));
  const j = JSON.parse(fsx.readFileSync(path.join(__dirname, "fixtures/planner-report-solved.json"), "utf8")), now = app.window.Date.now();
  j.startedAt = new Date(now - 3600000).toISOString().slice(0, 19) + "Z"; j.finishedAt = new Date(now - 3500000).toISOString().slice(0, 19) + "Z";
  assert(KOS.code.capStage("C4") !== "passed" && !KOS.code.capView("C4").build.all, "before: the build is open");
  const snap = () => JSON.stringify(KOS.store.state.code) + JSON.stringify(KOS.store.state.governor) + JSON.stringify(KOS.store.state.progress);
  for (const s of KOS.code.CAP_STEPS.map((x) => x[0])) {
    KOS.store.state.ui.code.capStep = { C4: s };
    const before = snap();
    KOS.show("code", { page: "capstone", id: "C4" }); await app.settle();
    assert(doc.querySelector('[data-step="' + s + '"][aria-selected="true"]'), s + ": the stepper marks it");
    assert(snap() === before, "C4 " + s + " wrote to the store while drawing");
  }
  KOS.store.state.ui.code.capStep = { C4: "build" };
  KOS.show("code", { page: "capstone", id: "C4" }); await app.settle();
  assert(doc.querySelectorAll("[data-ui~='code.cap-m-badge']").length === 5 && doc.querySelector("[data-ui~='code.cap-bring']") && !doc.querySelector("[data-ui~='code.cap-workspace']"), "the build step lists five milestones and links to the project, no in-app editor");
  const xp0 = g.xp, gold0 = g.gold;
  const res = await KOS.codeProject.check(JSON.stringify(j));
  assert(res.outcome === "accepted" && !res.completes && !res.reward, "accepted; the project itself shows no reward: " + (res.msg || JSON.stringify(res.mismatched)));
  const r = KOS.codeProject.apply(res);
  assert(r.ok && r.all && !r.pay && g.xp === xp0 && g.gold === gold0, "every milestone passes and the project pays nothing");
  const v = KOS.code.capView("C4");
  assert(v.build.all && v.build.pass === 5 && v.rubric.rows.filter((x) => x.auto)[0].value === 12, "the capstone's build reads the project: correctness 12 / 12");
  assert(!KOS.code.submitCapstone("C4").passed, "submit refuses before the rubric and write-up");
  c.rubric.filter((x) => !x.auto).forEach((x) => KOS.code.setRubric("C4", x.id, 3));
  KOS.code.setWriteup("C4", Array(c.writeupMin + 5).fill("word").join(" "));
  const sub = KOS.code.submitCapstone("C4");
  assert(sub.passed && sub.paid && sub.pay.xp === 300 && g.xp - xp0 === 300 && g.gold - gold0 === 75, "the capstone pays once: " + JSON.stringify(sub.pay));
  assert(!KOS.code.submitCapstone("C4").paid && g.xp - xp0 === 300 && KOS.code.capStage("C4") === "passed", "a second submission pays nothing");
  KOS.show("code", { page: "project", id: c.project }); await app.settle();
  assert(/Capstone 4/.test(doc.querySelector("#main").textContent) && doc.querySelector("[data-ui~='code.project-capstone']"), "the project's page names its capstone and links back");
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
