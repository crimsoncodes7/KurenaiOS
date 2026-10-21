---
name: exams-hub
description: Roadmap 5.8 Exams & Deadlines Hub — phases 1–6 (CS Paper 2) RELEASED 2026-10-21 (3b39ae1, kos-exams-1); smoke89–94; next CS Paper 1's full Companion
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
- Phase 3 (2026-10-21, design turn 29 frames 29a–29ac): examstats/examplan/exampapers cores, examviews/examprac/examroom pages (smoke91).
- Phase 4 (2026-10-21): goals-exams.js (five types, 29c templates), checklist rules, Assistant read tools exams_overview/exam_detail/exam_attempts (smoke92).
- Phase 5 (2026-10-21): exam-archetypes.js (1,441/1,448 tagged), exam-playbook.js, exam-reports.js (gen_exam_reports.mjs), examcompanion/exampaper cores, examguide/exampaperview pages (smoke93). Practice papers come from the topic banks until phase 6's original predicted papers.
- Phase 6, CS Paper 2 (2026-10-21): js/data/exams/aqa-7517-2-{45,46,47,49,410}.js (98 shapes, 317 variations, 409 practice, extended answers), core examdeep.js, page examdeep.js (#/exams/<id>/deep[/<shape>]), predicted/pack-/set- papers in exampaper.build, recognition drill (smoke94, invariant 130). Verified by scratch scripts: fp/subnet maths, an AQA assembly interpreter, truth tables, SQLite.
- Invariants 120–130 are in CLAUDE.md. The gate is 90 suites (84–94).
- Phase 3 deviations (in plan §19): Companion tab waits for phase 5; the library has its own DB `kurenai-os-papers` (never synced or backed up); no "To Today" in the send dialog; no per-question minutes; the README's open decision went to the topic-test coverage card.

**Copyright answer given to the user:** the papers stay out of the code and the deploy, because pages.dev is public. The user's own copies can be opened on their device via a phase 3 "Paper library" (§4.5).

**Report notes (2026-10-20, user approved the fetch):** AQA's file store serves only its 2022–23 reports, so 7 were saved into ~/Downloads/A-level and paraphrased into `tools/exam-index/reports/aqa-75{16,17}-{1,2}.md`. smoke90 (I) checks each cited question and its marks. Edexcel needs URLs in `tools/exam-index/report-urls.txt`.

**Why:** the reports are copyrighted, so only paraphrased notes go in the repo.

**How to apply:**
- `fetch_reports.py` downloads files: ask the user before running it again.
- Boundaries: AQA 7517 2023 and 2024 are confirmed; Edexcel 9MA0 2023–25 are unconfirmed (third-party).
- 2026-10-21 the user said "start phase 6 with CS Paper 2, you can deploy after this" — RELEASED 2026-10-21: main fast-forwarded to 3b39ae1, sw kos-exams-1, https://e94eede7.kurenai-os.pages.dev. Later papers (CS P1, Maths P1–P3, F201) follow one per release; ask before deploying each.
- In the localhost preview, unregister the SW and clear caches before reloading, or stale scripts load.

Related: [[fsrs-scheduler]], [[it-units-sitting]], [[japanese-study-space]], [[no-dead-space-layout]].
