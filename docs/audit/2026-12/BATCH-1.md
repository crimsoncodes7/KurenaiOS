# Batch 1: what Carbon verifies

Areas: productivity (PR), exams-files-ink (EX), study-core (ST),
sync-disruption (SY), data-integrity (DI) and architecture-perf (AP). All six
are complete, plus one pass on the user's own data (the copy account, slot 7).
`FINDINGS.md` lists the batch: 67 findings, of which 1 P0, 8 P1, 35 P2 and 23 P3.

- **Findings:** `findings/<area>.json`, `.jsonl` and `.md`.
- **Copy pass:** its new findings are in `findings/<area>.copy.jsonl`, with ids
  from 90 up. Its measurements of existing findings are in
  `findings/copy-batch1.md`.

## The P0, and what was fixed at once

**Shipped 27 Nov 2026 as sw `kos-qol-5`** (main `0c93408a`; immutable
https://7a10f634.kurenai-os.pages.dev). Carbon approved SY-33 and AP-21 and
held SY-38. The hold was answered on the same branch (19afe3f0): the
two-tab adopt and merge now follow a record by its creation stamp, the three
remaining merge sites pass their renames, and the assignment detail follows
its live record (smoke196 G3, clean and dirty). The audit branch now carries
`main`, so Batch 2 runs on `kos-qol-5`. In production after a reload the
stand-ins are in at 225 ms with the due count right, and a reviewed Mind
card's memory reads (recall 0.81).

Each fix is on its own branch, cut from `main` (`fa4264d0`), with a
regression step and the full gate (183/183). None is merged: verify them first.

| Branch | Fixes | Test |
|---|---|---|
| `fix/2026-12-SY-38` | **SY-38 (P0):** a pull that re-keys a record held by an open editor, so Save overwrote the other device's record. **DI-33 (P1):** rows that share an id folded into one object on every in-place take-in. The fix: `cloudmerge.merge` returns `renames`, `KOS.store.replaceState(doc, renames)` moves each live object to its new id first, and each live object is reused by one incoming row at most, keyed by id and `kind`. Invariant 33d is updated. | smoke196 G2 |
| `fix/2026-12-AP-21` | **AP-21** (and ST-52 and ST-51), fixed as a P0 at the user's request: `js/data/lazy-index.js` now runs below the last content `<template data-lazy>` (after `code-projects`), so `install()` sees every bundle it stands in for. In headless Chrome after a reload, the stand-ins are in at once (269 topics, against 0) and the due count is right at boot. A new Sample account gets 442 card schedules (was 0). Invariant 168 is updated. Gate 183/183. | smoke142 A (fails on the old `index.html`) |
| `fix/2026-12-SY-33` | **SY-33:** the Mind cards page and the Daily 15's reviews threw `KOS.fsrs.recall is not a function` on any card reviewed before. On the user's data, all 6 reviewed Mind cards were due and could not be opened. The fix: `KOS.fsrs.retrievability(el, s, w)`. | smoke201 E |

## Severities the lead questions (please rule on them)

- **SY-33** is filed P1, but the lead treated it as P0 grade: a core daily flow
  that fails on real data with no way round. Rule CONFIRMED or RECLASSIFY.
- **AP-21** (the root cause of ST-52 and ST-51) is filed P1. On every page load
  the due queue is short for about 6 s and an open Review never corrects. Under
  Save-Data, or offline with nothing cached, it never corrects at all, and a
  Due run of the visible cards paid the backlog bonus while cards were still
  due. On the copy, Review and Home read 0 due after a reload. The user had it
  fixed at once (`fix/2026-12-AP-21`); rule on the severity all the same.

## Verify first

Start with the P0 and P1s: SY-38, SY-33, AP-21 (with ST-52 and ST-51), ST-44,
EX-54, EX-59, EX-63 and DI-33. Then the Phase 1 P2s, which the README's
`phase1` field marks.
