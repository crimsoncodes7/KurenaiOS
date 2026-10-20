---
name: fsrs-scheduler
description: Roadmap 5.6 — flashcards and Code retrieval moved from SM-2 to one FSRS-6 core; phases 1–2 RELEASED 2026-10-20 (fbea5d5, sw kos-fsrs-1); next the Exams & Deadlines hub
metadata:
  type: project
---

On 2026-10-20 the user asked to replace SM-2 with FSRS. They have about 200 reviewed cards and required a seamless migration: no lost history, no starting from scratch. The plan is `docs/fsrs-plan.md` (revision 2; decisions A–G taken, invariant 111).

**Phases 1–2 were released on 2026-10-20** (`fbea5d5`, sw `kos-fsrs-1`, https://a6e211c9.kurenai-os.pages.dev). Phase 1 delivered:
- `js/core/fsrs.js` (`KOS.fsrs`, FSRS-6), checked by `tools/fsrs_check.mjs` against py-fsrs 6.3.2;
- `js/core/reviewlog.js` (IndexedDB `kurenai-os-reviews`);
- `srs.js` and Code's `schedule` on the core;
- the boot conversion: `KOS.srs.migrate`, `KOS.code.migrateCards`;
- Card stats shows Recall today, Difficulty and Target retention;
- tests: smoke88; the gate is now 84 suites.

The user's decisions:
- B: a FIXED 0.90 conversion retention, chosen for strict `S = interval` parity, not measured.
- E: phase 2 cap with a safeguard. Leave a card uncapped if its predicted recall on the exam date is already at or above the target; otherwise spread it over a 7–14 day pre-exam window using the hash.

**Phase 2 is built too:** the exam cap, leeches and Rework (8 lapses), and `topicMemory`. smoke88 now has 18 steps.

The exam cap is built against an EXAM-DAY target (`srsCfg.examRetention`, default 0.95, 0 = off), not the everyday target, and the user approved this. Card stats charts use `KOS.charts.fit`, which fills the card: the user objected to a fixed chart height leaving gaps.

Next: the Exams & Deadlines hub. The user has additions for it: test classifications, flexible scopes, exhaustive study guides and predicted papers, and Goals integration. Wait for those before planning.

The order the user agreed for later work (roadmap 5.7): server runner + Web Push → GitHub App → Creatives plan → Code content.

**Why:** Japanese, whose plan also wants FSRS, is blocked on the other account until Thursday 2026-10-22. It will reuse `KOS.fsrs` (its draft invariants were renumbered 112–118).

**How to apply:** don't release without a go-ahead. Run `fsrs_check` after any edit to `fsrs.js`.

Related: [[japanese-study-space]], [[code-study-space]], [[project-branch-and-release-state]].
