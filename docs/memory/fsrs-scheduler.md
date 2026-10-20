---
name: fsrs-scheduler
description: Roadmap 5.6 — flashcards and Code retrieval moved from SM-2 to one FSRS-6 core; phase 1 built on feat/fsrs (not released); phase 2 the exam-aware cap; the user's ~200 SM-2 cards must keep their schedules
metadata:
  type: project
---

On 2026-10-20 the user asked to replace SM-2 with FSRS. They have about 200 reviewed cards and required a seamless migration: no lost history, no starting from scratch. The plan is `docs/fsrs-plan.md` (revision 2; decisions A–G taken, invariant 111).

**Phase 1 is built on `feat/fsrs`** and not yet merged or deployed:
- `js/core/fsrs.js` (`KOS.fsrs`, FSRS-6), checked by `tools/fsrs_check.mjs` against py-fsrs 6.3.2;
- `js/core/reviewlog.js` (IndexedDB `kurenai-os-reviews`);
- `srs.js` and Code's `schedule` on the core;
- the boot conversion: `KOS.srs.migrate`, `KOS.code.migrateCards`;
- Card stats shows Recall today, Difficulty and Target retention;
- tests: smoke88; the gate is now 84 suites.

The user's decisions:
- B: a FIXED 0.90 conversion retention, chosen for strict `S = interval` parity, not measured.
- E: phase 2 cap with a safeguard. Leave a card uncapped if its predicted recall on the exam date is already at or above the target; otherwise spread it over a 7–14 day pre-exam window using the hash.

The user also wants a new Study section for exams and deadlines. It is not a prerequisite for FSRS. My suggestions for it were given on 2026-10-20 and are waiting for their reply.

The order the user agreed for later work (roadmap 5.7): server runner + Web Push → GitHub App → Creatives plan → Code content.

**Why:** Japanese, whose plan also wants FSRS, is blocked on the other account until Thursday 2026-10-22. It will reuse `KOS.fsrs` (its draft invariants were renumbered 112–118).

**How to apply:** don't release without a go-ahead. Run `fsrs_check` after any edit to `fsrs.js`.

Related: [[japanese-study-space]], [[code-study-space]], [[project-branch-and-release-state]].
