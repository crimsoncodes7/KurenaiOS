/* Kurenai OS — core/mindtree.js (KOS.mindTree)
   Mind's authored Socratic dialogues (docs/mind-plan.md §7.1, design 32i–32j). The default
   companion: offline, free and the same every time. Pure — no store, no DOM — so the same code runs
   in the page and in tools/mind_tree_check.mjs.

   A tree:
     { id, title, lead?, start, nodes: { <id>: node } }
     node: { who: "kurenai" | "ren", face?, say, choices: [choice], other?: choice, other: … }
           | { end: true, who, face?, say }                              the closing line
     choice: { t, keys: [words or "two word" phrases], next, took }      took: one sentence of the
           summary, in the second person ("You started strict: …")
   The summary is the line the learner took: lead + every chosen `took` + the end node's say.

   validate(tree) → [problems]   the release check (a tree with a problem never ships):
     the start exists; every next exists; every node is reachable; no node is a dead end (each one
     reaches an end); no cycle; a question offers 2–4 choices and a way out ("other"); every path
     is 3–5 turns.
   match(node, text) → { index, score } | null   a typed answer, by keywords, to the closest choice;
     null means "none of these" (the node's other)
   step(tree, nodeId, index) → the next node id (index -1 = other)
   summary(tree, path) → the line you took, as one paragraph                                       */
(function (root) {
  "use strict";

  function words(s) {
    return String(s || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
  }
  /* a key matches a word by its stem: "true" matches "truth"? no — keys are authored stems, so
     "chang" matches change, changed, changing */
  function keyScore(key, ws, text) {
    key = String(key).toLowerCase();
    if (key.indexOf(" ") >= 0) return text.indexOf(key) >= 0 ? 2 : 0;
    for (var i = 0; i < ws.length; i++) if (ws[i].indexOf(key) === 0) return 1;
    return 0;
  }
  function match(node, text) {
    if (!node || !node.choices) return null;
    var ws = words(text), joined = " " + ws.join(" ") + " ";
    if (!ws.length) return null;
    var best = null;
    node.choices.forEach(function (c, i) {
      var sc = (c.keys || []).reduce(function (a, k) { return a + keyScore(k, ws, joined); }, 0);
      if (sc > 0 && (!best || sc > best.score)) best = { index: i, score: sc };
    });
    return best;
  }
  function step(tree, nodeId, index) {
    var n = tree && tree.nodes ? tree.nodes[nodeId] : null;
    if (!n || n.end) return null;
    var c = index >= 0 ? (n.choices || [])[index] : n.other;
    return c ? c.next : null;
  }
  function choiceAt(tree, nodeId, index) {
    var n = tree.nodes[nodeId];
    return n ? (index >= 0 ? (n.choices || [])[index] : n.other) : null;
  }
  /* path: [{ node, index }] the turns taken, in order; the last node reached is an end */
  function summary(tree, path) {
    var bits = [];
    if (tree.lead) bits.push(tree.lead);
    var last = tree.start;
    (path || []).forEach(function (p) {
      var c = choiceAt(tree, p.node, p.index);
      if (c && c.took) bits.push(c.took);
      if (c) last = c.next;
    });
    var end = tree.nodes[last];
    if (end && end.end && end.say) bits.push(end.say);
    return bits.join(" ");
  }
  function turns(tree, path) { return (path || []).length; }

  function validate(tree) {
    var out = [];
    if (!tree || typeof tree !== "object") return ["not a tree"];
    var N = tree.nodes || {};
    if (!tree.id) out.push("no id");
    if (!N[tree.start]) { out.push("start node missing: " + tree.start); return out; }
    Object.keys(N).forEach(function (id) {
      var n = N[id];
      if (!n.say) out.push(id + ": says nothing");
      if (n.who !== "kurenai" && n.who !== "ren") out.push(id + ": unknown speaker " + n.who);
      if (n.end) { if (n.choices) out.push(id + ": an end with choices"); return; }
      var cs = n.choices || [];
      if (cs.length < 2 || cs.length > 4) out.push(id + ": " + cs.length + " choices (2–4)");
      if (!n.other) out.push(id + ": no way out for a typed answer (other)");
      cs.concat(n.other ? [n.other] : []).forEach(function (c, i) {
        if (!c.next || !N[c.next]) out.push(id + ": choice " + i + " goes nowhere (" + c.next + ")");
        if (!c.took) out.push(id + ": choice " + i + " has no summary line");
        if (c !== n.other && (!c.t || !c.keys || !c.keys.length)) out.push(id + ": choice " + i + " needs words and keys");
      });
    });
    if (out.length) return out;
    /* reachability, cycles, dead ends and path lengths: walk every path from the start */
    var seen = {}, lens = [], cyc = false;
    (function walk(id, depth, stack) {
      seen[id] = true;
      if (stack[id]) { cyc = true; return; }
      var n = N[id];
      if (n.end) { lens.push(depth); return; }
      stack[id] = true;
      (n.choices || []).concat([n.other]).forEach(function (c) { walk(c.next, depth + 1, stack); });
      delete stack[id];
    })(tree.start, 0, {});
    if (cyc) out.push("a cycle: a dialogue must end");
    Object.keys(N).forEach(function (id) { if (!seen[id]) out.push(id + ": unreachable"); });
    lens.forEach(function (d) { if (d < 3 || d > 5) out.push("a path of " + d + " turns (3–5)"); });
    if (!lens.length) out.push("no ending is reached");
    return out.filter(function (x, i, a) { return a.indexOf(x) === i; });
  }

  var api = { words: words, match: match, step: step, summary: summary, turns: turns, validate: validate, choiceAt: choiceAt };
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) { root.KOS = root.KOS || {}; root.KOS.mindTree = api; }
})(typeof window !== "undefined" ? window : null);
