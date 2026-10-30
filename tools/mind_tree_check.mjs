#!/usr/bin/env node
/* Kurenai OS — tools/mind_tree_check.mjs
   Mind's release check for its authored dialogues and content (docs/mind-plan.md §7.1, §13; design
   32i: "a tree with an unreachable branch never ships"). Loads js/data/mind.js and every
   js/data/content/mind-*.js in a bare window, then for every lesson:
     · its dialogue passes KOS.mindTree.validate (reachable, no dead end, no cycle, 2–4 choices and
       a way out at every question, every path 3–5 turns), speakers are Kurenai or Ren, and every
       face is one whose art is in assets/mind/img/;
     · every typed answer made of a choice's own words matches that choice (the keyword matcher);
     · the six-page contract (Hook · The idea · The case · The pushback · Check · Close) for an
       explain or contested lesson, a vote on the hook, a check of 3+ items with an apply scenario
       naming a concept the lesson teaches, the one prompt by kind (decision J), concepts that
       exist, each with 3–5 key points and at least one card;
     · a contested lesson's prompt has options; an explain lesson names its main concept.
   Exit 1 on any problem.   Run: node tools/mind_tree_check.mjs                                  */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const win = { KOS: {} };
win.window = win;
const ctx = vm.createContext(win);
function load(rel) { vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), ctx, { filename: rel }); }
load("js/core/mindtree.js");
load("js/data/mind.js");
const files = fs.readdirSync(path.join(ROOT, "js/data/content")).filter((f) => /^mind-.*\.js$/.test(f)).sort();
files.forEach((f) => load("js/data/content/" + f));

const T = win.KOS.mindTree, M = win.KOS_MIND;
const img = new Set(fs.readdirSync(path.join(ROOT, "assets/mind/img")));
function faceOk(who, face) {
  if (!face || face === "neutral") return img.has("mind.base." + who + ".a.webp");
  return img.has("mind.face." + who + "." + face + ".webp");
}
const problems = [];
let trees = 0, lessons = 0;
const CONTRACT = ["Hook", "The idea", "The case", "The pushback", "Check", "Close"];

Object.keys(M.LESSONS).sort().forEach((id) => {
  const l = M.LESSONS[id];
  lessons++;
  const bad = (m) => problems.push(id + ": " + m);
  (l.concepts || []).forEach((c) => {
    const k = M.CONCEPTS[c];
    if (!k) return bad("unknown concept " + c);
    if (!k.keyPoints || k.keyPoints.length < 3 || k.keyPoints.length > 5) bad(c + ": " + (k.keyPoints || []).length + " key points (3–5)");
    if (!k.cards || !k.cards.length) bad(c + ": no card");
  });
  if (l.kind === "checkpoint") {
    const cp = M.CHECKPOINTS[l.unit];
    if (!cp) return bad("a checkpoint lesson with no checkpoint for " + l.unit);
    (cp.cards || []).forEach((k) => { const i = k.lastIndexOf(":"), c = M.CONCEPTS[k.slice(0, i)]; if (!c || !c.cards[+k.slice(i + 1)]) bad("checkpoint card " + k + " does not exist"); });
    if (!cp.apply || cp.apply.length < 2) bad("checkpoint: fewer than two apply scenarios");
    (cp.apply || []).forEach((a, i) => { if (!(a.a >= 0 && a.a < a.options.length)) bad("checkpoint apply " + i + ": no right answer"); if (!M.CONCEPTS[a.concept]) bad("checkpoint apply " + i + ": unknown concept"); });
    if (!cp.synthesis || !cp.synthesis.rubric || cp.synthesis.rubric.length < 3) bad("checkpoint: a rubric of 3+ rows");
    return;
  }
  const titles = (l.pages || []).map((p) => p.t);
  if (JSON.stringify(titles) !== JSON.stringify(CONTRACT)) bad("pages " + JSON.stringify(titles) + " (want the six-page contract)");
  const hook = (l.pages || [])[0];
  if (!hook || !hook.blocks.some((b) => b.vote && b.vote.options && b.vote.options.length >= 2)) bad("the hook has no vote");
  const chk = l.check || [];
  if (chk.length < 3) bad(chk.length + " check items (3+)");
  chk.forEach((it, i) => { if (!(it.a >= 0 && it.a < it.options.length)) bad("check " + i + ": no right answer"); if (!it.why) bad("check " + i + ": no explanation"); });
  if (!chk.some((it) => it.apply && (l.concepts || []).indexOf(it.concept) >= 0)) bad("no apply scenario naming one of its concepts");
  if (l.kind === "explain" && l.prompt && !M.CONCEPTS[l.main]) bad("an explain-back with no main concept");
  if (l.kind === "contested" && !(l.prompt && l.prompt.options && l.prompt.options.length >= 2)) bad("a contested lesson's position needs options");
  if (l.prompt && l.kind !== "explain" && l.kind !== "contested") bad("a prompt on a " + l.kind + " lesson");
  if (!l.stories) bad("no \"For your stories\" note");
  if (!l.ref) bad("no quick reference");
  (l.field || []).forEach((f, i) => { if (f.options.indexOf(f.a) < 0 || !M.CONCEPTS[f.a]) bad("field item " + i + ": its answer is not an option"); });

  const tr = l.dialogue;
  if (!tr) return bad("no dialogue");
  trees++;
  T.validate(tr).forEach((p) => bad("dialogue: " + p));
  Object.keys(tr.nodes).forEach((nid) => {
    const n = tr.nodes[nid];
    if (!faceOk(n.who, n.face)) bad("dialogue " + nid + ": no art for " + n.who + " " + (n.face || "neutral"));
    (n.choices || []).forEach((ch, i) => {
      const m = T.match(n, ch.t);
      if (!m || m.index !== i) bad("dialogue " + nid + ": typing choice " + i + "'s own words (\"" + ch.t + "\") matches " + (m ? "choice " + m.index : "nothing"));
    });
  });
});

if (problems.length) { console.error(problems.join("\n")); console.error("\n" + problems.length + " problem(s)"); process.exit(1); }
console.log("mind_tree_check: " + lessons + " lessons, " + trees + " dialogues, every one passes.");
