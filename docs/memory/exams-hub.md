---
name: exams-hub
description: Roadmap 5.8 Exams & Deadlines Hub — plan rev 2 approved; phases 1–2 BUILT on feat/exams-hub (not deployed); smoke89–90; next = examiner reports fetch (needs user OK) + design turn 29 + phase 3
metadata:
  type: project
---

The user approved decisions A–N on 2026-10-20 with five refinements (R1–R5):
- R1 the Pacing scope rule freezes once the exam passes or its result is in;
- R2 redo items weigh their marks in recall;
- R3 the generated index is committed and the generator fails gracefully;
- R4 CS Paper 1's Sections B–D are in the blueprint;
- R5 the Phase 6+ paper order is flexible (the nearest sitting goes first).
Suggestions 1, 2, 4, 6–10 are in the plan; 3 and 5 stay optional.

**Built on 2026-10-20 (branch `feat/exams-hub`, not deployed):**
- Phase 1: `js/core/exams.js`, `js/modules/exams.js`, the widened tracker attempt, redo items `x:<uid>:<q>`, the calendar's derived views (smoke89).
- Phase 2: `tools/gen_exam_index.py`, `tools/exam-index/map.csv`, `js/data/exam-index.js`, `js/data/boundaries.js`, `tools/fetch_reports.py` (smoke90).
- Invariants 120–129 are in CLAUDE.md. The gate is 86 suites (84–90).

**Copyright answer given to the user:** the papers stay out of the code and the deploy, because pages.dev is public. The user's own copies can be opened on their device via a phase 3 "Paper library" (§4.5).

**Why:** the examiner's report notes can't be written until the reports are downloaded.

**How to apply:**
- `fetch_reports.py` downloads files, so ask the user before running it.
- Boundaries: AQA 7517 2023 and 2024 are confirmed; Edexcel 9MA0 2023–25 are unconfirmed (third-party).
- When design turn 29 arrives, restyle the hub's pages, then start phase 3.

Related: [[fsrs-scheduler]], [[it-units-sitting]], [[japanese-study-space]], [[no-dead-space-layout]].
