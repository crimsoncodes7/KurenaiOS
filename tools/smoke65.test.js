/* Kurenai OS — smoke65.test.js
   Computer Science Paper 2 (AQA 7517/2, spec 4.5–4.13) at full depth.

   The claims, in the order they matter:

     A · THE NOTES. Every rewritten Paper 2 leaf is paged, opens on its
         whole-topic overview, carries worked examples with AQA marks
         annotated, ends with an exam toolkit, and has flashcards and a
         quiz.
     B · THE EXAM ITEMS. The exam-tagged worked cards derive self-marking
         exam items that name AQA (never Edexcel), keep their marks, flag
         AS papers, and are registered on the leaf.
     C · ONE OWNER. No rewritten leaf is still defined by an older CS file
         (an old entry loading later would silently replace the new one).
     D · NOTHING LOST. A sim or generator the old entry listed is still
         wired to the leaf.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke65.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

/* the leaves rewritten so far, by file */
const DONE = {
  "cs-p2-45a.js": ["4.5.1.1", "4.5.1.2", "4.5.1.3", "4.5.1.4", "4.5.1.5", "4.5.1.6", "4.5.1.7", "4.5.2.1", "4.5.3.1", "4.5.3.2"],
  "cs-p2-45b.js": ["4.5.4.1", "4.5.4.2", "4.5.4.3", "4.5.4.4", "4.5.4.5", "4.5.4.6", "4.5.4.7", "4.5.4.8", "4.5.4.9"],
  "cs-p2-455.js": ["4.5.5.1", "4.5.5.2", "4.5.5.3"],
  "cs-p2-456a.js": ["4.5.6.1", "4.5.6.2", "4.5.6.3", "4.5.6.4", "4.5.6.5", "4.5.6.6"],
  "cs-p2-456b.js": ["4.5.6.7", "4.5.6.8", "4.5.6.9", "4.5.6.10"],
  "cs-p2-46a.js": ["4.6.1.1", "4.6.1.2", "4.6.1.3", "4.6.1.4", "4.6.2.1", "4.6.3.1"],
  "cs-p2-46b.js": ["4.6.4.1", "4.6.5.1"],
  "cs-p2-47a.js": ["4.7.1.1", "4.7.2.1", "4.7.3.1", "4.7.3.2", "4.7.3.6"],
  "cs-p2-47b.js": ["4.7.3.3", "4.7.3.4", "4.7.3.5"],
  "cs-p2-47c.js": ["4.7.3.7", "4.7.4.1", "4.7.4.2"]
};
const LEAVES = [].concat.apply([], Object.keys(DONE).map(f => DONE[f]));
/* sims/gens the old entries named explicitly — they must survive */
const KEEP = {
  "4.5.4.4": { sims: ["binary-number"], gens: ["float", "bin"] },
  "4.7.3.2": { sims: ["cpu-fetch-execute"] }
};

let app, KOS;

step("A · every rewritten Paper 2 leaf is paged, worked and ends with a toolkit", () => {
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

step("B · exam items derive from the worked cards and name AQA", () => {
  LEAVES.forEach(ref => {
    const c = app.window.KOS_CONTENT["compsci:" + ref];
    const derived = KOS.content.examFromWorked(c.notes, "AQA");
    assert(derived.length >= 1, ref + " derives exam items");
    const qs = (c.exam || []).map(x => x.q);
    derived.forEach(x => {
      assert(qs.indexOf(x.q) >= 0, ref + " a derived item is registered");
      assert(/^AQA /.test(x.src) && !/Edexcel/.test(x.src), ref + " names AQA: " + x.src);
      assert(Number.isInteger(x.marks) && x.marks > 0 && x.ms.length, ref + " marks and scheme");
      assert(!/\d+\s*marks?\s*$/.test(x.src), ref + " mark count stripped from src");
    });
    c.notes.filter(b => b && b.worked && b.worked.tag === "exam" && /^AS\b/.test(b.worked.src)).forEach(b => {
      const it = (c.exam || []).find(x => x.q === b.worked.q);
      assert(it && it.level === "AS", ref + " AS item flagged: " + b.worked.src);
    });
  });
});

step("C · no older CS file still defines a rewritten leaf", () => {
  const dir = path.join(__dirname, "..", "js", "data", "content");
  fs.readdirSync(dir).filter(f => /^cs-/.test(f) && !DONE[f]).forEach(f => {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    LEAVES.forEach(ref => assert(src.indexOf('"compsci:' + ref + '"') < 0, f + " still defines " + ref));
  });
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  Object.keys(DONE).forEach(f => assert(html.indexOf("js/data/content/" + f) > 0, f + " is loaded"));
});

step("D · sims and generators the old entries named are still wired", () => {
  Object.keys(KEEP).forEach(ref => {
    const c = app.window.KOS_CONTENT["compsci:" + ref];
    (KEEP[ref].sims || []).forEach(id => assert((c.sims || []).indexOf(id) >= 0, ref + " keeps sim " + id));
    (KEEP[ref].gens || []).forEach(id => assert((c.gens || []).indexOf(id) >= 0, ref + " keeps gen " + id));
  });
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
  console.log(fails ? "\nSMOKE65: " + fails + " failure(s)" : "\nSMOKE65: all " + steps.length + " steps passed (" + LEAVES.length + " leaves)");
  process.exit(fails ? 1 : 0);
})();
