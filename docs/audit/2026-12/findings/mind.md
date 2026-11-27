# Mind — December 2026 audit (Batch 2, slot 4)

App at `0c93408a` (sw `kos-qol-5`). Harness slot 4, dense (seeded, Mind state built by hand: F1.1–F1.5 finished, cards aged to be due), Empty and Sample (Sample carries no Mind data). No copy account, no model call, no provider.

## Findings (9: P0 0 · P1 3 · P2 3 · P3 3)

| Id | Sev | Title |
|---|---|---|
| MI-20 | P1 | The desk's "One more card set" rates cards but logs no entry and pays nothing; a redraw wipes the set (mind.js:696) |
| MI-22 | P1 | #/mind/cards: a reload, closed tab or evicted PWA loses the run's ledger entry (cards rescheduled, never logged or paid) |
| MI-27 | P1 | iPhone / Slide Over: a lesson's tabs collapse to a 0–5 px scroller (same shared row as CO-43, Mind's own switch) |
| MI-21 | P2 | Restart in the Daily 15 and #/mind/cards re-asks rated cards and counts them twice in the entry |
| MI-24 | P2 | A lesson's Cards tab is a live FSRS review with no ledger entry; ticks retrieval/Recall before the lesson is finished |
| MI-28 | P2 | Position sheet foot on phones: "Ask Kurenai to push back" spills over "Take this position" |
| MI-23 | P3 | Daily 15's 15-card cap grows after a reload or redraw mid-run |
| MI-25 | P3 | Today/Home's Mind cards item opens the finished Daily 15 instead of #/mind/cards |
| MI-26 | P3 | Inspector on a three-check lesson: "2 of 3 checks · 50%" |

## Coverage

- **Desk** (`#/subject/mind`): hero, Daily card (exam and normal, done, resume), Continue, the Phase 1 "Review my Mind cards (N due)" bar, analytics, Journal card, path strip, milestones. All six sizes on dense, mac and iphone on Empty and first run.
- **Daily 15** (`#/mind/daily`): driven end to end twice — Exam Season (reviews only) on dense and empty, and the full three parts on empty (2 reviews → F1.1 sitting with the dwell → Big Question captured with "Make it the Big Question" → today's line → done, Focus stopwatch started and ended, one reviews entry +2 XP). Field Guide question on dense. Done screen's and desk's "One more card set" (MI-20). Reload mid-run (results kept; MI-23), Restart (MI-21), the 15 XP cap (held: 18 ratings → pay 15).
- **#/mind/cards**: cold route (ink-ui loaded, modes present), Type, Write (ink strip mounts, Show waits for ink), Think, Card stats (recall from `KOS.fsrs.retrievability`, SY-33 fix holds), redraw (SY-34 re-confirmed), reload (MI-22), empty state.
- **Lessons** (`#/ref/mind/F1.1–F1.8`): pager, dwell marking, Check on the canonical quiz markup with 1–4 / Enter keys, Cards tab Study and Deck (MI-24), inspector status select, RAG and checks (MI-26), Ask Kurenai — What is sent shown, nothing sent (no network entry while open), sheets close on navigation; explain-back and position sheets at iphone and mac (MI-28); the inline dialogue run to its summary offline; phone tab row (MI-27).
- **Checkpoint F1.8**: cards (k-fc flip), apply scenarios, map (neutral claims), synthesis rubric, pass pays 50/12/+4 once, retake pays nothing and lowers nothing.
- **Journal, Positions, Path** at all six sizes on dense; empty states on Empty; position revisit Keep (moves to stage 1, pays nothing).
- **Contracts (Carbon's sweep)**: `READS.mind` (CARBON-1-2's `exams` gap known); `mind.cards` in `FACET_PATH` — a three-way merge keeps the newer card whole (CARBON-1-3 confirmed for Mind); `kurenai-os-mind` in `KOS.stores` and the backup; Reports and the Assistant read Journal counts/times only (invariant 139); Mind goal sources read `metrics.cards`/`passed` (MI-21 inflates them, MI-20/22 lose them).
- **Study-cleanup batch 7**: it touched no Mind content (`67aa2aa7` changes Code files only), so no concept card lost its item or schedule.

## Not covered

The copy account; tensions (none authored); Ask Kurenai Send and the offline queue (never sent, by rule); Undo (the shared session has none). November's open Phase 3 items MI-07, MI-13, MI-14, MI-17, MI-18 and MI-19 were not re-driven.

## November re-check

Fixed: MI-01, MI-03, MI-04, MI-05, MI-06, MI-10, MI-15, MI-16, JM-02, JM-04. Still open (Phase 3, not worse): MI-02 (mac Daily card still hides its button; the other sizes now fit), MI-09, MI-12. Not reproducible: MI-11. Batch 1: SY-34 re-confirmed (MI-22 is its loss case); CARBON-1-3 confirmed for Mind cards.
