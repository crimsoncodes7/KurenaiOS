/* Kurenai OS — smoke131.test.js
   Mind's checkpoint and Creatives' project pay with receipts (quality W1, RC21; MI-05, CR-20,
   CR-31). Every award pays once, never on a re-tick, never without evidence.

     A · MI-05. A checkpoint with nothing right pays nothing and is not passed; it says what is
         missing. The page states the pass rule in one line.
     B · The first PASS (2 of 3 scenarios right, 2 of 4 rubric points) pays 50 XP, 12 gold,
         +4 HP once, in one ledger entry, and finishes the checkpoint lesson.
     C · A worse retake pays nothing and lowers no rung: the best attempt is kept (invariant 137).
     D · A second pass pays nothing.
     E · CR-20. Three bare "Mark done" ticks reach every milestone and pay nothing; the page
         offers "Add your work" and promises no reward already given.
     F · Saving a work for each milestone pays the project once (150 XP, 40 gold, +10 HP).
     G · CR-31. Undo and redo of a paid milestone pays nothing, and the page says
         "Paid on <date> · no further reward".
     H · RC21 review P1. One set of pieces pays one project: a piece on another milestone, of
         another track or named in another project's receipt (paidWith) never attaches or counts;
         the dialog lists only what may be attached.

   Run: node tools/smoke131.test.js */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, M, CR;
const gov = () => K.store.state.governor;
const entries = (type) => K.sessions.all().filter((e) => e.type === type);
const snap = () => ({ xp: gov().xp, gold: gov().gold, hp: gov().hp });
const q = (sel) => app.document.querySelector('[data-ui~="' + sel + '"]');

step("boot", async () => {
  app = await boot();
  K = app.KOS; M = K.mind; CR = K.creatives;
  await app.settle();
  gov().hp = 50;   /* room for the HP to show */
});

/* ---------------- Mind ---------------- */
step("A · a checkpoint with nothing right pays nothing and is not passed (MI-05)", async () => {
  const s0 = snap(), n0 = entries("mind").length;
  const out = M.recordCheckpoint("F1", { cards: 0, apply: {}, synth: { bullets: ["I am not sure"], ticks: {} } });
  assert(out && out.pass === false && !out.paid, "nothing right is not a pass: " + JSON.stringify(out));
  eq(snap(), s0, "no XP, gold or HP");
  eq(entries("mind").length, n0, "no ledger entry");
  const r = K.store.state.mind.checkpoints.F1;
  assert(!r.doneAt && !r.paidAt, "the checkpoint is not marked passed");
  assert(!M.finished("F1.8"), "the checkpoint lesson is not finished");
  eq(out.missing, { apply: 2, rubric: 2 }, "it says what is missing");
  K.show("ref", { subject: "mind", ref: "F1.8" }); await app.settle();
  const rule = q("mind.cp-rule");
  assert(rule && /To pass: 2 of 3 scenarios right and 2 of 4 rubric points\./.test(rule.textContent), "the page states the rule: " + (rule && rule.textContent));
});

step("B · the first pass pays once (50 XP, 12 gold, +4 HP)", () => {
  const s0 = snap(), n0 = entries("mind").length;
  const out = M.recordCheckpoint("F1", { cards: 6, apply: { 0: true, 1: true }, synth: { bullets: ["no streak"], ticks: { 0: true, 1: true } } });
  assert(out.pass && out.paid, "a pass pays: " + JSON.stringify(out));
  eq([gov().xp - s0.xp, gov().gold - s0.gold, gov().hp - s0.hp, entries("mind").length - n0], [50, 12, 4, 1], "50 XP, 12 gold, +4 HP, one entry");
  assert(M.finished("F1.8"), "the checkpoint lesson is finished");
});

step("C · a worse retake pays nothing and lowers no rung (the best attempt is kept)", () => {
  const before = ["argument", "hidden-premise"].map((c) => M.ladder(c).rungs);
  assert(before[0][2] && before[1][1] && before[1][2], "the pass gave Apply and Explain: " + JSON.stringify(before));
  const s0 = snap(), n0 = entries("mind").length;
  const out = M.recordCheckpoint("F1", { cards: 0, apply: {}, synth: { bullets: ["again"], ticks: {} } });
  assert(!out.pass && !out.paid, "a failed retake pays nothing");
  eq(snap(), s0, "nothing moved");
  eq(entries("mind").length, n0, "no entry");
  eq(["argument", "hidden-premise"].map((c) => M.ladder(c).rungs), before, "no rung lowered");
  const r = K.store.state.mind.checkpoints.F1;
  assert(r.doneAt && r.apply[0] && r.apply[1] && r.synth.ticks[0] && r.synth.ticks[1], "the best answers are kept");
  assert(M.finished("F1.8"), "still passed");
});

step("D · a second pass pays nothing", () => {
  const s0 = snap(), n0 = entries("mind").length;
  const out = M.recordCheckpoint("F1", { cards: 8, apply: { 0: true, 1: true, 2: true }, synth: { bullets: ["all"], ticks: { 0: true, 1: true, 2: true, 3: true } } });
  assert(out.pass && !out.paid, "passed again, not paid");
  eq(snap(), s0, "nothing moved");
  eq(entries("mind").length, n0, "no entry");
});

/* ---------------- Creatives ---------------- */
step("E · bare ticks reach every milestone and pay nothing (CR-20)", async () => {
  const s0 = snap(), n0 = entries("creatives").length;
  const n = CR.project("W1").milestones.length;
  for (let i = 0; i < n; i++) CR.markMilestone("W1", i);
  const ps = CR.projectState("W1");
  assert(ps.done && !ps.ready && !ps.paidAt, "ticked, not ready, not paid");
  eq(snap(), s0, "no XP, gold or HP");
  eq(entries("creatives").length, n0, "no entry");
  K.show("creatives", { page: "project", id: "W1" }); await app.settle();
  assert(app.document.querySelectorAll('[data-ui~="cr.ms-attach"]').length === n, "every milestone offers Add your work");
  assert(/Add your work to each one/.test(q("cr.project-pay").textContent), "it says the work is missing: " + q("cr.project-pay").textContent);
});

step("F · a saved work for each milestone pays the project once", async () => {
  const s0 = snap(), n0 = entries("creatives").length;
  const n = CR.project("W1").milestones.length;
  /* one new piece, and two attached from the Practice Log */
  CR.addWork({ title: "draft", kind: "text", unit: "W1", ms: 0 });
  for (let i = 1; i < n; i++) {
    const id = CR.addWork({ title: "piece " + i, kind: "text" });
    eq(snap(), s0, "a work saved outside the project pays nothing");
    CR.attachWork(id, "W1", i);
  }
  const ps = CR.projectState("W1");
  assert(ps.ready && ps.paidAt, "ready and paid");
  eq([gov().xp - s0.xp, gov().gold - s0.gold, gov().hp - s0.hp, entries("creatives").length - n0], [150, 40, 10, 1], "150 XP, 40 gold, +10 HP, one entry");
});

step("G · undo and redo of a paid milestone pays nothing; the page says it was paid (CR-31)", async () => {
  const s0 = snap(), n0 = entries("creatives").length;
  CR.markMilestone("W1", 1, true);
  K.show("creatives", { page: "project", id: "W1" }); await app.settle();
  assert(/^Paid on .+ · no further reward$/.test(q("cr.project-pay").textContent), "an undone paid milestone promises nothing: " + q("cr.project-pay").textContent);
  CR.markMilestone("W1", 1);
  const extra = CR.addWork({ title: "again", kind: "text", unit: "W1", ms: 2 });
  assert(extra, "another piece saved");
  eq(snap(), s0, "nothing moved");
  eq(entries("creatives").length, n0, "no entry");
  K.rerender(); await app.settle();
  assert(/^Paid on .+ · no further reward$/.test(q("cr.project-pay").textContent), "the page says it was paid: " + q("cr.project-pay").textContent);
  eq(app.errors, [], "no page errors");
});

step("H · one set of pieces pays one project: W1's pieces never attach to W2 (RC21 review P1)", async () => {
  const s0 = snap(), n0 = entries("creatives").length;
  const used = CR.msWorks("W1").reduce((a, ids) => a.concat(ids), []);
  assert(used.length >= 3, "W1 was paid with its pieces: " + used.length);
  const n = CR.project("W2").milestones.length;
  for (let i = 0; i < n; i++) eq(CR.attachWork(used[i % used.length], "W2", i), null, "a piece on a W1 milestone is refused for W2 milestone " + i);
  eq(CR.msWorks("W1").reduce((a, ids) => a.concat(ids), []).sort(), used.slice().sort(), "W1 keeps its pieces");
  for (let i = 0; i < n; i++) CR.markMilestone("W2", i);
  const ps = CR.projectState("W2");
  assert(!ps.ready && !ps.paidAt, "W2 is not paid by W1's pieces");
  eq(snap(), s0, "no XP, gold or HP");
  eq(entries("creatives").length, n0, "no entry");
  /* a piece of another track never attaches; a free writing piece does */
  const art = CR.addWork({ title: "a sketch", kind: "image", track: "art" });
  eq(CR.attachWork(art, "W2", 0), null, "an Art piece is refused for a Writing project");
  /* the paid record names its pieces, and one moved there (an older copy, a merge) is not counted */
  const paidWith = Object.keys(K.store.state.creatives.projects.W1.paidWith || {});
  assert(paidWith.length === CR.project("W1").milestones.length && paidWith.every((id) => used.includes(id)), "W1's receipt names the pieces it paid with: " + JSON.stringify(paidWith));
  const w0 = K.store.state.creatives.works[paidWith[0]], was = [w0.unit, w0.ms];
  w0.unit = "W2"; w0.ms = 0;
  eq(CR.msWorks("W2")[0], [], "a piece that paid W1 does not count for W2");
  w0.unit = was[0]; w0.ms = was[1];
  /* the dialog lists only what may be attached: here the one free writing piece */
  const free = CR.addWork({ title: "fresh", kind: "text", track: "write" });
  K.show("creatives", { page: "project", id: "W2" }); await app.settle();
  q("cr.ms-attach").click(); await app.settle();
  const picks = [...app.document.querySelectorAll('[data-ui~="cr.attach-pick"]')];
  eq(picks.map((b) => b.textContent.split(" · ")[0]), ["fresh"], "the list leaves out W1's pieces and the Art piece");
  picks[0].click(); await app.settle();
  eq(CR.msWorks("W2")[0], [free], "a free writing piece attaches");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke131: " + failed + " failed" : "smoke131: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
