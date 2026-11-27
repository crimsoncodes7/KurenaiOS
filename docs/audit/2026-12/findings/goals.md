# Goals — December 2026 audit (Phase 2, Batch 2)

Code: `0c93408a` (sw kos-qol-5), harness slot 2. Accounts: dense (seeded), Sample, Empty. Sizes: mac, ipadl, ipad, iphone, split, slide.

## Findings

| id | sev | title |
|---|---|---|
| GO-28 | P0 | After a pull re-keys a colliding goal, the goal page's Delete and Archive act on the OTHER device's goal (the confirm names yours) |
| GO-29 | P1 | A title goal (Finish a series / Complete a specific title) stores the vault's per-device row id, so on the other device it measures a different title |
| GO-30 | P2 | Restart on a missed exam goal says 'restarted · 27 Nov – 14 Dec' but the goal stays Missed: its deadline is still read from the exam |
| GO-31 | P1 | Restart on a repeating goal whose week runs from its start day deletes every recorded week ('Every period, kept … never deleted') |
| GO-32 | P2 | Editing an exam goal whose exam has passed shows another exam in the Exam field (the hint names the real one), and that exam cannot be picked |
| GO-33 | P2 | Sample account: its four goals are saved with type 'manual' (no such type), so the counts 7 of 12 and 6 of 10 read 0 and the goals offer 'Collection' instead of +1 |
| GO-34 | P2 | 'Keep Mind Daily 15 days' drops a day the Daily 15 was done without its own Focus entry as soon as the next Daily 15 is done |
| GO-35 | P2 | A Money goal's notice prints the raw amount ('£4500 of £600') even with Money's Hide amounts on, and unformatted |
| GO-36 | P3 | Goal editor's line says 'one about every 1 days' and money lines lack the currency ('6.3 a day') |
| GO-37 | P3 | Goals hero counts 'Too early to call' goals as 'on track now' (16 on track beside 2 On-track chips) |
| GO-38 | P3 | A title goal's Target field is offered and saved but ignored: 'Finish a series' always reads the title's own episode total |

## What was covered

- **Goals page** `#/goals` (All, This week, This month, Done) at all six sizes on dense; mac/ipad/iphone/split on Sample; all six on Empty (first-goal templates) and Done empty.
- **Goal page** `#/goals/<id>` at all six sizes (weekly goal); ⋯ Restart / Archive / Delete; Pin; Edit.
- **Dialogs**: New goal (templates and the type list) at mac/ipad/iphone/slide; the editor for an exam goal at four sizes; every entry point's seeded editor driven and saved.
- **Entry points (1E)**: Routines › Routines tab card; Money › Pots card; Money › Budgets ⋯; vault editor; exam Today. The exam ⋯ menu is Edit details / Archive / Delete….
- **Types measured against their owners**: study-hours and focus-blocks vs the ledger (and Home's subject Focus time) across a week and a month boundary on a fake clock (judged once, stable, no pay); cards-reviewed/ja-facets vs Reports' m.n; routine-days vs KOS.routines.summary; money types vs Money's evidence window; gov-gold (never pays, Met without buying, no notice); exam_recall (GO-27 null baseline); topics-green (GO-23).
- **Notices**: tick() sends done/missed/due once each; display-only goals none; money amounts not masked (GO-35).
- **Joins**: exam (link, deadline from exam, past exam in the editor GO-32), routine, pot, category, vault title (cross-device GO-29).
- **Two-device collision** (SY-38 follow-up): editor Save now correct; page actions are not (GO-28).
- **Home** goals card (days-left caption) at mac/iphone/ipad.

## Not covered

- Reports' goal periods were checked by code only (GO-09); the closed-app runner outlook for goals not exercised.
- Creatives, Code and Collection journal types (cr-*, code-*, episodes/volumes/routes/hours) were read in code, not driven.
- The user's own copy (slot 7) was not used, as instructed.
