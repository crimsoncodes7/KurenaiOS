/* Kurenai OS — smoke197.test.js
   Roadmap 5.21, the flashcard quality pass (1B): a flashcard is quick
   recall, so its front says what to recall and its back is worth having.

     A · THE CHECKER IS CLEAN. tools/card_lint.mjs --check passes over every
         Computer Science, Maths and IT card: no bare label, no bare yes/no,
         no back over 35 words, no CS worked calculation, except the reviewed
         entries in tools/card_lint-allow.json (each with its reason, none
         stale).
     B · THE RULES FLAG WHAT THEY ARE FOR and pass a good card: "Protocol?",
         "Read-ahead pattern?", "CIR holds…", "Yes.", "No — not enough.", a
         paragraph, "Convert 193 to hexadecimal." and "Normalise 00011010
         0011." are flagged; their rewrites are not.
     C · A MOVED CARD KEEPS NOTHING ELSE MOVING (invariants 87, 111c). The 34
         CS calculations that left their decks are gone from them, every
         later card of those decks keeps its schedule key (a pinned third
         element), keys stay unique, and each topic's quiz gained them as
         items keyed "150" upwards at its end, so no shipped quiz item's key
         shifted.

   Run: node tools/smoke197.test.js */
"use strict";
const path = require("path");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const ROOT = path.join(__dirname, "..");
let app, K, C, L;

/* topic → the card keys that moved to its quiz */
const MOVED = {
  "compsci:4.1.1.12": [5], "compsci:4.2.8.1": [11],
  "compsci:4.5.2.1": [3, 4, 5, 10, 11, 12, 16], "compsci:4.5.4.3": [5, 12, 13, 15],
  "compsci:4.5.4.4": [2, 3, 8, 9, 11, 12, 13, 14, 15, 16, 17], "compsci:4.5.4.5": [3],
  "compsci:4.5.4.8": [2, 4, 5, 6, 11], "compsci:4.5.6.4": [8], "compsci:4.5.6.7": [5, 13, 14]
};
/* the keys each of those decks must still hold, as before the pass */
const KEPT = {
  "compsci:4.5.2.1": [0, 1, 2, 6, 7, 8, 9, 13, 14, 15, 17],
  "compsci:4.5.4.4": [0, 1, 4, 6, 7, 10, 18, 19],
  "compsci:4.5.4.8": [1, 3, 8, 9, 10, 12, 13, 14, 15, 16]
};

step("boot", async () => {
  app = await boot({ clock: "2026-11-16T10:00:00" });
  await app.settle();
  K = app.KOS; C = app.window.KOS_CONTENT;
  L = await import(pathToFileURL(path.join(__dirname, "card_lint.mjs")).href);
});

step("A · card_lint --check is clean", () => {
  let out = "";
  try { out = execFileSync(process.execPath, [path.join(__dirname, "card_lint.mjs"), "--check"], { cwd: ROOT, encoding: "utf8" }); }
  catch (e) { throw new Error("card_lint --check failed:\n" + String(e.stdout || e.message).split("\n").slice(0, 30).join("\n")); }
  assert(/card_lint: clean/.test(out), "no clean line: " + out.slice(-300));
  const allow = L.readAllow();
  allow.cards.concat(allow.leaves).forEach((e) => assert(e.why && e.why.length > 10, "an allowlist entry without a reason: " + JSON.stringify(e)));
  allow.leaves.forEach((e) => assert(C[e.leaf], "an allowlisted leaf that does not exist: " + e.leaf));
});

step("B · the rules", () => {
  const rules = (sid, q, a) => L.lint(sid, q, a).map((f) => f.rule).sort().join(",");
  const para = Array(40).fill("word").join(" ") + ".";
  const cases = [
    ["compsci", "Protocol?", "A set of rules.", "label"],
    ["compsci", "Read-ahead pattern?", "Input before the loop.", "label"],
    ["compsci", "CIR holds…", "the instruction being executed.", "label"],
    ["compsci", "Wires crossing without a dot?", "Not joined.", "label"],
    ["compsci", "Are functions first-class in a functional language?", "Yes.", "yesno"],
    ["compsci", "Is \"stored as equations\" acceptable?", "No — not enough.", "yesno"],
    ["it", "Describe the funnel.", para, "long"],
    ["compsci", "Convert 193 to hexadecimal.", "C1.", "calc"],
    ["compsci", "Normalise 00011010 0011.", "01101000 0001.", "calc"],
    ["compsci", "C57₁₆ in decimal?", "3159.", "calc,label"],
    ["compsci", "What is a protocol?", "A set of rules governing communication between devices.", ""],
    ["compsci", "What does the read-ahead pattern do, and where are its two reads?", "One before the loop, one at the end of its body.", ""],
    ["compsci", "Are functions first-class in a functional language?", "Yes — they can be passed, returned and assigned like any value.", ""],
    ["compsci", "Is 11000000 normalised?", "No — a negative normalised mantissa starts 10.", ""],
    ["compsci", "What is the range of 8-bit two's complement?", "−128 to 127.", ""],
    ["maths", "Derivative of $e^{kx}$?", "$ke^{kx}$.", ""],
    ["maths", "Convert 193 to hexadecimal.", "C1.", ""]
  ];
  const bad = cases.filter(([s, q, a, want]) => rules(s, q, a) !== want).map(([s, q, a, want]) => q + " → " + (rules(s, q, a) || "nothing") + ", wanted " + (want || "nothing"));
  assert(!bad.length, "rules:\n  " + bad.join("\n  "));
});

step("C · moved cards: gone from the deck, neighbours keep their keys, quiz items 150+", () => {
  const bad = [];
  Object.keys(MOVED).forEach((t) => {
    const sid = t.slice(0, t.indexOf(":")), ref = t.slice(sid.length + 1);
    const keys = (C[t].flashcards || []).map((c, i) => L.shippedKey(sid, ref, c, i));
    if (new Set(keys).size !== keys.length) bad.push(t + ": duplicate card keys");
    MOVED[t].forEach((k) => { if (keys.indexOf(t + ":" + k) >= 0) bad.push(t + ":" + k + " is still a card"); });
    if (KEPT[t]) KEPT[t].forEach((k) => { if (keys.indexOf(t + ":" + k) < 0) bad.push(t + ":" + k + " lost its key"); });
    const quiz = C[t].quiz || [];
    const ours = quiz.map((it, i) => ({ it, i })).filter((x) => x.it.qk != null && +x.it.qk >= 150);
    if (ours.length !== MOVED[t].length) bad.push(t + ": " + ours.length + " quiz items 150+, wanted " + MOVED[t].length);
    ours.forEach((x, n) => {
      if (x.it.qk !== String(150 + n)) bad.push(t + ": quiz key " + x.it.qk + " out of order");
      if (x.i < quiz.length - ours.length) bad.push(t + ": a 150+ item is not at the end of the quiz");
      if ((x.it.opts || []).length !== 4 || !(x.it.ans >= 0 && x.it.ans < 4) || !x.it.why) bad.push(t + ": item " + x.it.qk + " is not a four-option item with a reason");
      if (K.questions.keyOf("quiz", sid, ref, x.it, x.i) !== "q:" + t + ":" + x.it.qk) bad.push(t + ": item " + x.it.qk + " has key " + K.questions.keyOf("quiz", sid, ref, x.it, x.i));
    });
    if (L.lint(sid, "x", "x") && (C[t].flashcards || []).some((c) => L.isCalc(c[0]))) bad.push(t + ": a calculation is still a card");
  });
  assert(!bad.length, "moved cards:\n  " + bad.join("\n  "));
  assert(!app.errors.length, "no page errors: " + app.errors.slice(0, 3).join(" | "));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.message || e).split("\n").slice(0, 40).join("\n       ")); }
  }
  console.log(failed ? `\nSMOKE197 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE197 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
