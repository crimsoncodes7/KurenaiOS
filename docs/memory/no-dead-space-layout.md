---
name: no-dead-space-layout
description: "Every new view must fill its width — no empty gaps, wasted space or inconsistent alignment; reuse existing app components (e.g. study's quiz) rather than inventing bare ones"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 3d5afeb1-07c4-4170-ae80-798d64481d12
  modified: 2026-10-15T23:17:04.782Z
---

When designing or building any view: no empty gaps, no unnecessarily wasted space, no inconsistent alignment. Content capped at a reading width (e.g. `max-inline-size: 860px`) on a wide page leaves a dead right-hand column — either fill it (a side panel, a second column, a grid) or keep the margins proportional on both sides. Reuse the app's existing components (the study quiz, task editor, cards) instead of building bare new versions.

**Why:** the user has had to repeat this many times (Reports review, Code desk/map review, capstone 1 on 16 Oct 2026 — "the quiz layout is dead… the empty space on the right… on basically all views"). It is now also a CLAUDE.md design rule.

**How to apply:** before calling a view done, look at the 1440 screenshot specifically for empty columns, ragged right edges and misaligned blocks, and fix them; check that a familiar pattern from Study/the task editor isn't being reinvented. Related: [[graphite-review-feedback]], [[code-study-space]].
