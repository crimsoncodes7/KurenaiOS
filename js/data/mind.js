/* Kurenai OS — data/mind.js (KOS_MIND)
   Mind, the study space for psychology and philosophy (roadmap 5.9, docs/mind-plan.md revision 2,
   design turn 32). AUTHORED, like Code's and Japanese's; released one unit at a time.

   KOS_MIND = {
     HEADERS:   [{ id, name, purpose }]                 Foundation · Psychology · Philosophy · Crossings
     PATHS:     [{ id, header, title, units: [{ id, title, n }], later?, sides? }]
                every path and unit the plan names (n = its planned lessons), released or not:
                the path page shows the whole map, the spine only what has shipped
     LESSONS:   { id: { id, unit, title, kind, concepts, prompt, sittings, pages… } }   by lesson()
     CONCEPTS:  { id: { id, name, gist, keyPoints, cards, confusables, links, evidence, lesson } }
     CHECKPOINTS: { unit: { unit, title, cards, apply, synthesis: { q, rubric } } }
     TENSIONS:  [{ id, a: { lesson, answer }, b: { lesson, answer }, q, tree }]   authored, never inferred
     ORDER:     the agreed order (F → Y1 → P1 → X3, then yours; decision 2.2)
   }
   A unit's content file (js/data/content/mind-f1.js …) registers its lessons, concepts and
   checkpoint through lesson() / concept() / checkpoint() and calls spine() again, so KOS_DATA.mind
   always lists every released unit. Loading KOS_DATA.mind is what makes Mind a live subject. */
(function () {
  "use strict";

  var HEADERS = [
    { id: "foundation", name: "Foundation", purpose: "tools every other path uses · suggested first" },
    { id: "psychology", name: "Psychology", purpose: "how minds work, tested where it can be · every finding carries its evidence tag" },
    { id: "philosophy", name: "Philosophy", purpose: "arguments about how to live and what is real · contested lessons end in your position" },
    { id: "crossings", name: "Crossings", purpose: "one question from both sides · suggested after a unit on each" }
  ];
  function u(id, title, n) { return { id: id, title: title, n: n }; }
  var PATHS = [
    { id: "F", header: "foundation", title: "Thinking well", units: [u("F1", "What makes an argument good", 8), u("F2", "Evidence and belief", 7)] },
    { id: "Y1", header: "psychology", title: "Learning and memory", units: [u("Y1.U1", "How memory works", 9), u("Y1.U2", "Learning on purpose", 7)] },
    { id: "Y2", header: "psychology", title: "Social psychology", units: [u("Y2.U1", "Conformity and obedience", 8), u("Y2.U2", "Attribution and persuasion", 7), u("Y2.U3", "The replication crisis, honestly", 6)] },
    { id: "Y3", header: "psychology", title: "Decisions and strategy", units: [u("Y3.1", "Biases and heuristics", 8), u("Y3.2", "Games and strategy", 9), u("Y3.3", "Decision paradoxes", 7)] },
    { id: "Y4", header: "psychology", title: "Emotion, motivation and habit", units: [u("Y4.U1", "Theories of emotion", 7), u("Y4.U2", "Motivation and habit", 8), u("Y4.U3", "Cognitive distortions", 6)] },
    { id: "Y5", header: "psychology", title: "Development and personality", units: [u("Y5.U1", "Attachment and identity", 7), u("Y5.U2", "Personality and the character lens", 6)] },
    { id: "Y6", header: "psychology", title: "Research methods", units: [u("Y6.U1", "Designs and variables", 7), u("Y6.U2", "Numbers that matter", 7)] },
    { id: "Y7", header: "psychology", title: "Mind and brain", units: [], later: true },
    { id: "P1", header: "philosophy", title: "Ethics", units: [u("P1.U1", "Living well: Aristotle", 9), u("P1.U2", "Consequences and duties", 8), u("P1.U3", "Applied cases", 7)] },
    { id: "P2", header: "philosophy", title: "Mind and self", units: [u("P2.U1", "The mind–body problem", 8), u("P2.U2", "Personal identity and free will", 6)] },
    { id: "P3", header: "philosophy", title: "Knowledge and reality", units: [u("P3.U1", "What can I know?", 8), u("P3.U2", "Rational choice", 6)] },
    { id: "P4", header: "philosophy", title: "How to live", units: [u("P4.U1", "Stoics and Epicureans", 7), u("P4.U2", "Existentialism and the absurd", 6), u("P4.U3", "East Asian thought", 7)] },
    { id: "P5", header: "philosophy", title: "Society and power", units: [], later: true },
    { id: "X1", header: "crossings", title: "Free will", units: [u("X1", "Free will", 6)], gist: "Libet and its critics ↔ compatibilism", sides: ["Y1", "P2"] },
    { id: "X2", header: "crossings", title: "Morality", units: [u("X2", "Morality", 6)], gist: "moral psychology ↔ normative ethics", sides: ["Y2", "P1"] },
    { id: "X3", header: "crossings", title: "Happiness", units: [u("X3", "Happiness", 6)], gist: "positive psychology ↔ eudaimonia", sides: ["Y4", "P1"] },
    { id: "X4", header: "crossings", title: "The self", units: [u("X4", "The self", 6)], gist: "reconstructed memory ↔ personal identity", sides: ["Y1", "P2"] },
    { id: "X5", header: "crossings", title: "Machine minds", units: [u("X5", "Machine minds", 6)], gist: "what language models do ↔ the Chinese room", sides: ["P2", "compsci"] },
    { id: "X6", header: "crossings", title: "Cooperation", units: [u("X6", "Cooperation", 6)], gist: "why cooperation evolves ↔ contract theory", sides: ["Y3", "P5"] }
  ];
  /* the agreed order (plan §2.2): the desk's core path, then "your choice" */
  var ORDER = ["F", "Y1", "P1", "X3"];

  var LESSONS = {}, CONCEPTS = {}, CHECKPOINTS = {}, TENSIONS = [];
  /* concept(def): { id, name, gist, keyPoints [3–5], cards [[q, a]…], confusables [ids], links
     [{ to, type }], evidence: robust | debated | failed | null, src } — authored once and reused
     by every lesson, card and edge that names it (invariant 137: the id is stable) */
  function concept(c) { CONCEPTS[c.id] = c; return c.id; }
  /* lesson(def): { id, unit, title, kind: explain | contested | checkpoint, concepts [ids], main
     (the concept the explain-back is about), prompt, sittings [page index a sitting ends after],
     pages [{ t, blocks }], check [{ q, options, a, why, apply, concept }], dialogue, stories, ref } */
  function lesson(l) { LESSONS[l.id] = l; return l.id; }
  function checkpoint(c) { CHECKPOINTS[c.unit] = c; return c.unit; }
  function tension(t) { TENSIONS.push(t); return t.id; }

  function released(unitId) {
    return Object.keys(LESSONS).filter(function (id) { return LESSONS[id].unit === unitId; })
      .sort(function (a, b) { return LESSONS[a].n - LESSONS[b].n; });
  }

  /* the spine every Study surface reads (units → lessons), like KOS_DATA.code and KOS_DATA.ja: only
     released units, each under its header (section.stage = the header's index) */
  function spine() {
    var sections = [];
    PATHS.forEach(function (p) {
      p.units.forEach(function (un) {
        var ids = released(un.id);
        if (!ids.length) return;
        sections.push({ ref: un.id, title: un.title, stage: HEADERS.map(function (h) { return h.id; }).indexOf(p.header), path: p.id,
          children: ids.map(function (id) { var l = LESSONS[id]; return { ref: id, title: l.title, content: [l.can || l.title] }; }) });
      });
    });
    window.KOS_DATA = window.KOS_DATA || {};
    if (!sections.length) { delete window.KOS_DATA.mind; return; }
    window.KOS_DATA.mind = {
      id: "mind", name: "Mind", board: "Psychology and philosophy",
      labelL: "What this lesson teaches", labelR: "Where it leads",
      sections: sections
    };
  }

  window.KOS_MIND = {
    HEADERS: HEADERS, PATHS: PATHS, ORDER: ORDER,
    LESSONS: LESSONS, CONCEPTS: CONCEPTS, CHECKPOINTS: CHECKPOINTS, TENSIONS: TENSIONS,
    concept: concept, lesson: lesson, checkpoint: checkpoint, tension: tension, released: released, spine: spine
  };
  spine();
})();
