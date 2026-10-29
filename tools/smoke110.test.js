/* Kurenai OS — smoke110.test.js
   Mind (roadmap 5.9, design turn 32): the registry and the pages.

     A · THE REGISTRY. Mind is a subject (`mind`, not an exam subject) in the study-space group
         with Code and Japanese; the --mind hue and its ink are tokens in Graphite and in every
         theme block; the spine carries every released lesson as a leaf.
     B · THE ROUTES. #/subject/mind (the desk), #/ref/mind/<lesson> (a lesson, a checkpoint) and
         every #/mind/<page> render their own hooks with no error; Study is lit on the rail, the
         subject pills are the study spaces, and Mind's own pages have no spine.
     C · THE DESK READS AS EVERY DESK. Its hero is the shared mastery ring (a percentage, as
         Code's and Japanese's), with no streak of its own (decision C), and a lesson page carries
         Mind's Ask Kurenai in the inspector rather than the generic exam strip.
     D · A RENDER WRITES NOTHING. Drawing the desk, the path, the Journal, the positions and a
         lesson leaves state.mind as it was (invariant 137: reads write nothing).

   Run: node tools/smoke110.test.js                                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, ROOT } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

step("A · Mind is a study space, not an exam subject", async (app) => {
  const S = app.KOS.subjects;
  assert(S.ids().indexOf("mind") >= 0, "ids: " + S.ids());
  assert(S.ids("exam").indexOf("mind") < 0, "Mind is not an exam subject");
  assert(S.hue("mind") === "var(--mind)", "Mind's hue is the --mind role");
  const n = app.KOS.mind.lessons().length;
  assert(n >= 8 && app.KOS.hub.LEAVES.mind.length === n, "every released lesson is a leaf: " + app.KOS.hub.LEAVES.mind.length + " of " + n);
});
step("A · the --mind hue is a token in Graphite and every theme", () => {
  const tokens = fs.readFileSync(path.join(ROOT, "css/tokens.css"), "utf8");
  assert(/--mind:/.test(tokens) && /--mind-ink:/.test(tokens), "Graphite carries --mind and --mind-ink");
  const themes = fs.readFileSync(path.join(ROOT, "css/themes.css"), "utf8");
  const blocks = themes.match(/:root\[data-theme="[\w-]+"\][^{]*\{[^}]*\}/g) || [];
  assert(blocks.length >= 25, "theme blocks found: " + blocks.length);
  blocks.forEach((b) => assert(/--mind:/.test(b) && /--mind-ink:/.test(b), "a theme without --mind: " + b.slice(0, 60)));
});
step("B · routes: the desk, a lesson, the checkpoint and every Mind page", async (app) => {
  const K = app.KOS;
  for (const [v, a, id, spine] of [["subject", "mind", "mind.hero", true], ["ref", { subject: "mind", ref: "F1.1" }, "mind.ask-open", true],
    ["ref", { subject: "mind", ref: "F1.8" }, "study.grid", true],
    ["mind", { page: "path" }, "mind.path-card", false], ["mind", { page: "journal" }, "ui.page-head", false],
    ["mind", { page: "positions" }, "ui.page-head", false], ["mind", { page: "daily" }, "mind.daily-strip", false]]) {
    K.show(v, a); await app.settle();
    assert(app.document.querySelector('[data-ui~="' + id + '"]'), v + " " + JSON.stringify(a) + " did not render " + id);
    assert(app.document.querySelector('[data-ui~="shell.rail-item"][data-section="study"][aria-current="page"]'), v + " " + JSON.stringify(a) + " does not light Study");
    const pills = [...app.document.querySelectorAll("#subnav [data-ui~='shell.subnav-item']")].map((b) => b.textContent.trim());
    assert(pills.some((t) => /Mind/.test(t)) && pills.some((t) => /Japanese/.test(t)) && !pills.some((t) => /Maths|Mathematics|Computer Science/.test(t)),
      v + ": the subject pills are not the study spaces: " + pills.join(", "));
    if (!spine) assert(app.document.querySelector("#cols").getAttribute("data-tree") === "none", v + " " + JSON.stringify(a) + " keeps the spine");
    if (v === "mind" && a.page === "daily") { K.show("subject", "mind"); await app.settle(); }
  }
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});
step("C · the desk's hero is the shared mastery ring, with no streak", async (app) => {
  const K = app.KOS;
  K.show("subject", "mind"); await app.settle();
  const ring = app.document.querySelector('[data-ui~="mind.hero"] .k-subj-ring');
  assert(ring && /% mastery$/.test(ring.getAttribute("aria-label")), "the ring is a mastery percentage: " + (ring && ring.getAttribute("aria-label")));
  assert(/^--p: \d+%/.test(ring.getAttribute("style") || ""), "and it is drawn by --p");
  assert(!/streak/i.test(app.document.querySelector('[data-ui~="mind.hero"]').textContent), "Mind has no streak of its own");
});
step("C · a lesson's inspector carries Mind's Ask Kurenai, not the generic exam strip", async (app) => {
  const K = app.KOS;
  K.show("ref", { subject: "mind", ref: "F1.1" }); await app.settle();
  assert(!app.document.querySelector('[data-ui~="asst.ctx"]'), "the generic strip is gone");
  K.show("ref", { subject: "ja", ref: "H1" }); await app.settle();
  assert(app.document.querySelector('[data-ui~="asst.ctx"]') || !K.assistant, "other subjects keep theirs");
});
step("D · drawing the desk and the reading pages writes nothing", async (app) => {
  const K = app.KOS;
  K.show("home"); await app.settle();
  const before = JSON.stringify(K.store.state.mind || null);
  for (const [v, a] of [["subject", "mind"], ["mind", { page: "path" }], ["mind", { page: "journal" }],
    ["mind", { page: "positions" }], ["ref", { subject: "mind", ref: "F1.8" }]]) {
    K.show(v, a); await app.settle();
    assert(JSON.stringify(K.store.state.mind || null) === before, v + " " + JSON.stringify(a) + " changed the Mind record");
  }
});

(async () => {
  let failed = 0;
  const app = await boot();
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE110 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE110 PASS — Mind's registry, routes and pages (" + steps.length + " steps).");
})();
