/* Kurenai OS — smoke66.test.js
   Computer Science Paper 1 (AQA 7517/1, spec 4.1–4.4) at full depth, and the
   NEA (component 3) as a project companion.

   The claims:

     A · PAPER 1 NOTES. Every rewritten Paper 1 leaf is paged, opens on its
         whole-topic overview, carries worked examples with AQA marks, ends
         with an exam toolkit, and has flashcards and a quiz.
     B · PAPER 1 EXAM ITEMS derive from the exam-tagged worked cards, name
         AQA and keep their marks.
     C · ONE OWNER. No older CS file still defines a rewritten leaf, and
         every new file is loaded.
     D · NOTHING LOST. A sim or generator an old entry listed is still wired.
     E · THE NEA IS A PROJECT, NOT AN EXAM. NEA.0–NEA.5 exist in the spec,
         each is a project guide (level ladder, checklist, worked judgement
         cards) and NONE carries an exam item — there is no NEA paper.
     F · THE NEA TOOLS WORK AND ARE FREE. The objective checker and the mark
         estimator are registered in the NEA area, open without gold, flag
         AQA's own weak objectives, and add up to AQA's 75 marks (with the
         two-level penalty for a project not of A-level standard).

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke66.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

/* the Paper 1 leaves rewritten so far, by file */
const DONE = {
};
const LEAVES = [].concat.apply([], Object.keys(DONE).map(f => DONE[f]));
/* sims/gens the old entries named explicitly — they must survive */
const KEEP = {
};
const NEA = ["NEA.0", "NEA.1", "NEA.2", "NEA.3", "NEA.4", "NEA.5"];

let app, KOS;

step("A · every rewritten Paper 1 leaf is paged, worked and ends with a toolkit", () => {
  LEAVES.forEach(ref => {
    const c = app.window.KOS_CONTENT["compsci:" + ref];
    assert(c, "content for " + ref);
    const n = c.notes;
    assert(/— the whole topic on one page$/.test((n[0] && n[0].h) || ""), ref + " opens on its overview");
    assert(n.filter(b => b && b.page).length >= 2, ref + " is paged");
    const worked = n.filter(b => b && b.worked);
    assert(worked.length >= 3, ref + " has worked examples (" + worked.length + ")");
    assert(worked.some(b => (b.worked.steps || []).some(s => s && s.mk)), ref + " annotates marks");
    assert(n.some(b => b && b.page === "Exam toolkit"), ref + " ends with an exam toolkit");
    assert((c.flashcards || []).length >= 8 && (c.quiz || []).length >= 4, ref + " flashcards and quiz");
  });
});

step("B · Paper 1 exam items derive from the worked cards and name AQA", () => {
  LEAVES.forEach(ref => {
    const c = app.window.KOS_CONTENT["compsci:" + ref];
    const derived = KOS.content.examFromWorked(c.notes, "AQA");
    assert(derived.length >= 1, ref + " derives exam items");
    const qs = (c.exam || []).map(x => x.q);
    derived.forEach(x => {
      assert(qs.indexOf(x.q) >= 0, ref + " a derived item is registered");
      assert(/^AQA /.test(x.src) && !/Edexcel/.test(x.src), ref + " names AQA: " + x.src);
      assert(Number.isInteger(x.marks) && x.marks > 0 && x.ms.length, ref + " marks and scheme");
    });
    c.notes.filter(b => b && b.worked && b.worked.tag === "exam" && /^AS\b/.test(b.worked.src)).forEach(b => {
      const it = (c.exam || []).find(x => x.q === b.worked.q);
      assert(it && it.level === "AS", ref + " AS item flagged: " + b.worked.src);
    });
  });
});

step("C · no older CS file still defines a rewritten leaf; every new file is loaded", () => {
  const dir = path.join(__dirname, "..", "js", "data", "content");
  fs.readdirSync(dir).filter(f => /^cs-/.test(f) && !DONE[f]).forEach(f => {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    LEAVES.forEach(ref => assert(src.indexOf('"compsci:' + ref + '"') < 0, f + " still defines " + ref));
  });
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  Object.keys(DONE).concat(["cs-nea.js"]).forEach(f => assert(html.indexOf("js/data/content/" + f) > 0, f + " is loaded"));
  assert(html.indexOf("js/labs/nea-tools.js") > 0, "nea-tools.js is loaded");
});

step("D · sims and generators the old entries named are still wired", () => {
  Object.keys(KEEP).forEach(ref => {
    const c = app.window.KOS_CONTENT["compsci:" + ref];
    (KEEP[ref].sims || []).forEach(id => assert((c.sims || []).indexOf(id) >= 0, ref + " keeps sim " + id));
    (KEEP[ref].gens || []).forEach(id => assert((c.gens || []).indexOf(id) >= 0, ref + " keeps gen " + id));
  });
});

step("E · the NEA leaves are project guides with no exam items", () => {
  const sec = app.window.KOS_DATA.compsci.sections.find(s => s.ref === "NEA");
  assert(sec, "the NEA section exists");
  assert(JSON.stringify(sec.children.map(c => c.ref)) === JSON.stringify(NEA), "NEA.0–NEA.5 in order: " + sec.children.map(c => c.ref));
  NEA.forEach(ref => {
    const c = app.window.KOS_CONTENT["compsci:" + ref];
    assert(c, "content for " + ref);
    const n = c.notes;
    assert(/— the project guide$/.test((n[0] && n[0].h) || ""), ref + " opens as a project guide");
    assert(n.filter(b => b && b.page).length >= 5, ref + " is paged");
    assert(n.some(b => b && /^Before you (hand it in|commit)$/.test(b.page || "")), ref + " ends with a checklist");
    if (ref !== "NEA.0") assert(n.some(b => b && b.page === "The level ladder"), ref + " decodes the level ladder");
    assert(n.some(b => b && /^How the exemplar/.test(b.page || "") || b && b.page === "The exemplar's choice"), ref + " reads the exemplar");
    const worked = n.filter(b => b && b.worked);
    assert(worked.length >= 1 && worked.every(b => b.worked.tag !== "exam"), ref + " worked cards are judgements, not exam items");
    assert(!(c.exam || []).length, ref + " carries no exam items (there is no NEA paper)");
    assert((c.flashcards || []).length >= 8 && (c.quiz || []).length >= 4, ref + " flashcards and quiz");
  });
  /* the weekly plan links NEA.1 and NEA.2 — they must still resolve */
  ["NEA.1", "NEA.2"].forEach(ref => assert(KOS.spec.resolve("compsci:" + ref).length, ref + " still resolves for the plan"));
});

step("F · the NEA tools are free, grouped, and get AQA's rules right", () => {
  const doc = app.window.document;
  ["nea-objectives", "nea-marks"].forEach(id => {
    const s = KOS.sims.get(id);
    assert(s && typeof s.mount === "function", id + " is registered");
    assert(KOS.governor.simAccess(id).ok, id + " is not gated by gold");
    assert(KOS.sims.areaOf(s).id === "project", id + " sits in the NEA project area");
  });
  /* the objective checker: AQA's weak examples (1–4) are flagged, the strong ones (5–8) pass */
  KOS.store.state.ui.neaObjectives = undefined;
  let panel = doc.createElement("div");
  KOS.sims.get("nea-objectives").mount(panel);
  const verdicts = Array.from(panel.querySelectorAll("td[data-verdict]")).map(td => td.getAttribute("data-verdict"));
  assert(verdicts.length === 8, "eight sample objectives judged: " + verdicts.length);
  assert(verdicts.slice(0, 4).every(v => v !== "good"), "AQA's weak objectives are flagged: " + verdicts.slice(0, 4));
  assert(verdicts.slice(4).every(v => v === "good"), "the measurable objectives pass: " + verdicts.slice(4));
  /* the estimator: top of every level = 75; not A-level standard drops all but the technical solution two levels */
  const top = { lv: { analysis: 3, design: 4, complete: 3, testing: 4, evaluation: 4 },
    pos: { analysis: "high", design: "high", complete: "high", testing: "high", evaluation: "high" },
    tech: { A0: true }, style: { excellent0: true, excellent1: true, excellent2: true, excellent3: true, excellent4: true, excellent5: true }, standard: true };
  function estimate(st) {
    KOS.store.state.ui.neaEstimate = JSON.parse(JSON.stringify(st));
    const p = doc.createElement("div");
    KOS.sims.get("nea-marks").mount(p);
    const m = /Estimate:\s*(\d+)\s*\/\s*75/.exec(p.querySelector("[data-ui~='lab.nea-total']").textContent);
    return m && +m[1];
  }
  assert(estimate(top) === 75, "top of every level sums to 75: " + estimate(top));
  assert(estimate(Object.assign({}, top, { standard: false })) === 57, "not A-level standard: 3+6+15+27+4+2 = 57, got " + estimate(Object.assign({}, top, { standard: false })));
  const groupB = Object.assign({}, top, { tech: { B2: true }, style: {} });
  KOS.store.state.ui.neaEstimate = undefined;
  assert(estimate(groupB) === 9 + 12 + 15 + 10 + 8 + 4, "a Group B audit with no excellent style suggests level 2, low: " + estimate(groupB));
});

(async () => {
  app = await boot();
  KOS = app.KOS;
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.message)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE66: " + fails + " failure(s)" : "\nSMOKE66: all " + steps.length + " steps passed (" + LEAVES.length + " Paper 1 leaves, " + NEA.length + " NEA leaves)");
  process.exit(fails ? 1 : 0);
})();
