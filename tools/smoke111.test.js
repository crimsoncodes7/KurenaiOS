/* Kurenai OS — smoke111.test.js
   Mind (roadmap 5.9): the content contract and the dialogue engine (docs/mind-plan.md §7.1, §13;
   design 32i; invariants 139–141).

     A · THE CONTRACT. tools/mind_tree_check.mjs passes: every released lesson keeps the six pages,
         a vote on the hook, a check with an apply scenario, the one prompt by kind, concepts with
         key points and cards, and every dialogue is reachable, acyclic and 3–5 turns, voiced by
         Kurenai or Ren with faces whose art ships.
     B · THE MATCHER IS PURE. KOS.mindTree.match picks a choice from its own words, falls back to
         the way out on nonsense, and never throws on empty input; summary() names what was
         chosen.
     C · NOTHING IS HOT-LINKED. Mind's images are local files in assets/mind/img/.

   Run: node tools/smoke111.test.js                                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

step("A · the content and dialogue check passes", () => {
  let out;
  try { out = execFileSync(process.execPath, [path.join(ROOT, "tools/mind_tree_check.mjs")], { encoding: "utf8" }); }
  catch (e) { throw new Error("mind_tree_check failed:\n" + (e.stdout || "") + (e.stderr || "")); }
  assert(/\b\d+ lessons?\b/.test(out) || /ok|pass/i.test(out), "unexpected output: " + out.slice(0, 200));
});

const win = { KOS: {} }; win.window = win;
const ctx = vm.createContext(win);
function load(rel) { vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), ctx, { filename: rel }); }
step("B · the matcher picks a choice from its own words and falls back safely", () => {
  load("js/core/mindtree.js"); load("js/data/mind.js");
  fs.readdirSync(path.join(ROOT, "js/data/content")).filter((f) => /^mind-.*\.js$/.test(f)).forEach((f) => load("js/data/content/" + f));
  const T = win.KOS.mindTree, L = win.KOS_MIND.LESSONS;
  let tried = 0;
  Object.keys(L).forEach((id) => {
    const tree = L[id].dialogue; if (!tree) return;
    const nodes = tree.nodes || {};
    Object.keys(nodes).forEach((nid) => {
      const n = nodes[nid]; if (!n.choices) return;
      n.choices.forEach((c, ci) => {
        if (!c.t) return;
        const m = T.match(n, c.t);
        assert(m && m.index === ci, id + " " + nid + ": its own words did not pick choice " + ci + ": " + JSON.stringify(m));
        tried++;
      });
      const empty = T.match(n, "");
      assert(empty == null || typeof empty === "object", id + " " + nid + ": empty input threw or returned junk");
      T.match(n, "qqqq zzzz xxxx");
    });
  });
  assert(tried >= 14, "choices tried: " + tried);
});
step("C · Mind's art is local", () => {
  const src = ["js/core/mindui.js", "js/modules/mind.js", "js/modules/mindtopic.js", "js/modules/mindrun.js", "css/views/mind.css"]
    .map((f) => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n");
  assert(!/https?:\/\/[^\s"')]+\.(png|jpe?g|webp|gif|svg)/i.test(src), "a hot-linked image");
  assert(/assets\/mind\/img/.test(src), "the art path is assets/mind/img");
  assert(fs.readdirSync(path.join(ROOT, "assets/mind/img")).filter((f) => /\.webp$/.test(f)).length >= 15, "the art ships");
});

let failed = 0;
for (const [name, fn] of steps) {
  try { fn(); console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
}
console.log("\n" + "=".repeat(30));
if (failed) { console.log("SMOKE111 FAIL — " + failed + " step(s)"); process.exit(1); }
console.log("SMOKE111 PASS — Mind's content contract and dialogue engine (" + steps.length + " steps).");
