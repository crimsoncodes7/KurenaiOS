---
name: december-mocks-2026
description: "The user's December 2026 mocks — Maths Pure only (AS + six A2 chapters), CS a topic list over both papers, IT F201 the only full paper (real exam Jan 2027); what the exam Companion work should target"
metadata:
  node_type: memory
  type: project
  originSessionId: 04c027ef-86ba-4c56-80ec-65e818f91578
  modified: 2026-11-17T17:55:41.118Z
---

Told 17 November 2026 (with a slide of the CS pre-public exam):

- **Maths mock: Pure only.** All of AS Pure plus the A2 chapters covered
  so far: advanced algebraic methods, sequences and series, functions and
  graphs (with proof), radians, trigonometric functions, advanced trig, 3D
  vectors. No Statistics or Mechanics.
- **CS pre-public exam (PPE): 2 h 30, NOT a full board paper.** Y1: logic
  gates and Boolean algebra (P2), hardware — input, output, storage (P2),
  OOP (P1), stacks (P1), queues (P1). Y2: recursion, graphs, trees,
  sorting and searching (P1), assembly language, consequences of computing,
  databases (P2). So it mixes both AQA papers.
- **IT F201: the only full paper** — a mock in December, then the real
  exam in January 2027. F201 has no past papers or examiner reports yet
  (only OCR's SAM), and its preset is `indexed: false`.

**Why:** the user does not want every exam Companion built now — only what
serves these mocks.

**How to apply:** the full ("deep") Companion is tied to ONE board paper
through the assessment's preset (`KOS.examCompanion.indexPaperOf`), so a
mock whose scope spans two papers shows only one paper's. Build Companion
content only for the leaves above (CS Paper 1's seven topics; Maths Pure's
chapters; F201 whole), not whole papers. Exams & Papers as a whole is due a
redesign (UR-28, design first) — new content should be data the pages read,
so a redesign keeps it. Related: [[exams-hub]], [[it-units-sitting]].
