---
name: notes-layout-and-diagrams
description: "User feedback (2026-09-19) on study notes — prose must not be cramped (bullets / one sentence per line), and annotated inline diagrams are wanted wherever a visual helps, including inside worked examples and exam questions"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 531209f8-0cc2-4072-a257-71072190ff1f
  modified: 2026-09-19T20:58:03.981Z
---

Two rules the user gave after approving the binomial depth:

1. **Layout**: long paragraphs feel cramped and hard to read. Prefer bullet
   points, or start each sentence/idea on a new line. Keep paragraphs to
   1–3 short sentences; enumerations become `ul`/`ol`/`kv`.
2. **Inline visualisations**: annotated diagrams (trig graphs, unit circle,
   triangles with labelled sides/angles, circles with tangents, vectors,
   areas under curves, force diagrams, tree diagrams, box plots, normal
   curves…) so they never have to leave the app to Google a picture.
   Include them in notes AND in worked examples / exam questions where a
   diagram is part of the question.

**Why:** they learn from the app directly; a wall of text or a missing
picture sends them elsewhere.

**How to apply:** use the `{fig:{...}}` block (`js/core/figures.js`,
rendered by content.js; also allowed as `fig` on a worked step and inside
a worked `q`) whenever a topic has a natural picture; write prose as short
lines and lists. See [[maths-notes-depth-rewrite]].
