---
name: notes-layout-and-diagrams
description: "User feedback on study notes — prose not cramped (short lines/lists), annotated inline diagrams wherever a visual helps, and never a block (table/list/kv) inside a callout"
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

3. **No block inside a block** (2026-11-17, with a screenshot of an IT
   levels table inside an info callout: "tacky and annoying to read"): a
   callout holds TEXT only; its table or kv goes right after it, a list
   becomes the callout's lines, and a callout that was only a table
   becomes that section's `{h}` heading — the CS/Maths layout.
   `tools/validate_content.js` now refuses the shape.

**Why:** they learn from the app directly; a wall of text or a missing
picture sends them elsewhere.

**How to apply:** use the `{fig:{...}}` block (`js/core/figures.js`,
rendered by content.js; also allowed as `fig` on a worked step and inside
a worked `q`) whenever a topic has a natural picture; write prose as short
lines and lists. See [[maths-notes-depth-rewrite]].
