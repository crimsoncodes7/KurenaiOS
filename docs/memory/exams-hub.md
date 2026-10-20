---
name: exams-hub
description: Roadmap 5.8 Exams & Deadlines Hub — plan docs/exams-plan.md rev 1 + design prompt 13 (frames 29a–29x) on branch feat/exams-hub; decisions A–N awaiting review; evidence base is ~/Downloads/A-level
metadata:
  type: project
---

On 2026-10-20 the user specified the Exams & Deadlines Hub. Their spec covers:
- tiers: real_exam, mock, topic_test, retrieval_test, plus my addition, deadline;
- the Scope Builder, with "Covered in Pacing so far" and exclusions;
- four-signal readiness;
- a read-only planner with one send to Pacing;
- Exam Season, start-by dates and mock post-mortems with optional tags;
- an exhaustive Companion beyond the topic notes, with likelihood analysis and predicted papers;
- five KOS.goals exam types linked by examId.

I wrote the plan (`docs/exams-plan.md`, revision 1) and design prompt 13 (frames 29a–29x, after Japanese's 28a+). Both are on branch `feat/exams-hub`.

**The evidence base:** `~/Downloads/A-level`:
- Past Papers (291 PDFs);
- Topic Practice with `Question Index.xlsx`: Maths 912 question rows over 44 sittings, CS 1,158 over 36, each with marks and topic;
- `_build/*/manifest/classification.csv`.

**Gaps:** there are NO examiner's reports in that folder (a fetch step is planned), and IT has little past-paper evidence.

**Why:** the PDFs are copyrighted. Decision C is to store references only and show original questions.

**How to apply:**
- Wait for the user to review decisions A–N before building.
- Numbering: invariants 120–129, smokes 89+, so Japanese keeps 112–118 and 80–83.
- Phase 1 is the core, phase 2 the evidence pipeline (`tools/gen_exam_index.py` + `map.csv`).

Related: [[fsrs-scheduler]], [[it-units-sitting]], [[japanese-study-space]], [[no-dead-space-layout]].
