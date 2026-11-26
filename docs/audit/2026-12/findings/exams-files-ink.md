# exams-files-ink — December 2026 audit (Phase 2, Batch 1)

Auditor slot 2, branch `audit/2026-12`, app at `fa4264d0` (sw `kos-qol-4`).
Evidence: `/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/exams-files-ink/`.

**Result:** 15 new findings, EX-50 to EX-64: 0 P0, 3 P1 (EX-54, EX-59, EX-63), 9 P2 and 3 P3.
The reworked hub (invariant 130b, built 18 Nov) had not been audited before, because November's audit ran on `4c3fc33`. Many of November's open items name surfaces that the rework replaced: the Exam Room, the Planner and the readiness band.

## Accounts

- **dense:** the seeded slot account. I also made three assessments through the New assessment form: an OCR F201 real exam, an AQA 7517 Paper 2 real exam and an Edexcel Pure mock. Most of the testing used these. I logged two timed sittings of F201 papers 2 and 3.
- **sample:** All exams, the CS Paper 2 mock's Revise and timed card drill, Files, and a Maths topic.
- **empty:** All exams, Timetable, Results, Practice › Paper files, Files, and Pen and ink, at mac and iphone.
- **copy:** not run. The user's data copy was not available; a separate pass will cover it.

## Routes × sizes

| Surface | mac | ipadl | ipad | iphone | split | slide | Accounts |
|---|---|---|---|---|---|---|---|
| All exams (Exams, Timetable, Results, Practice, Load) | cold + shot | – | shot (sample) | shot | – | – | dense, sample, empty |
| Exam sections (Today, Plan, Topics, Revise, Questions, Papers, Review, On the day) | all 8, cold | Today, Topics, Questions, Plan | Questions, Day, Topics, Review | Today, Revise, Papers | Today, Topics, Papers | via EX-52 rule | dense |
| Revise › timed card drill (T4) | – | ✓ | – | ✓ | – | – | sample, dense |
| Topics confidence chip cycle | – | ✓ (EX-62) | – | – | – | – | dense |
| F201 papers 1–3 (authored, 1B): view, Print A4 PDF (paper + scheme) | ✓ 19/18/19 sheets, all A4, all labelled | – | ✓ | ✓ | – | – | dense |
| A paper sat full screen: Start timed, Write pad, typed answer, reload mid-way, Finish, mark beside the answer, Finish and log | ✓ | ✓ | – | – | – | – | dense |
| Review: score, grade, Marks lost, timing, Get feedback pack, + Log error (U8) | ✓ | ✓ | ✓ | – | – | – | dense |
| Post-mortem costly cards' + Log error pill (U8) | ✓ | – | – | – | – | – | dense |
| Paper library import + report (153) | ✓ | – | – | – | – | – | dense, empty |
| Marks by question (EX-01 recheck) | ✓ | – | – | – | – | – | dense |
| Files: add, folders (new, open, add in, reload, delete), viewer, Download with my writing | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | dense, empty, sample |
| PDF viewer (cold from Files, draw, menu) | – | ✓ | – | – | – | – | dense |
| Topic Handwritten tab: draw, redraw mid-stroke, scroll kept (T2), table, rich text, colour menu, lasso, Copy as TeX, Paste + Undo, + Log error | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | dense |
| Drills: Blurt (Start), Write it out menu | ✓ | ✓ | – | – | – | – | dense |
| Pen and ink, Storage | cold | – | – | ✓ | – | – | dense, empty |

### 1F cold loads

I reloaded the app directly on every one of these routes:

- the exams routes, including `paper/1`, `deep`, the tracker and the library
- `#/files`, `#/pen` and `#/storage`

Every route drew with no lazy misses and no console errors. A topic's ink tab, the viewer opened from Files, a sat paper and the Review all worked from a cold load.

The 1F problem is U8's Error Log capture. On a cold load its first press does nothing, because it calls `KOS.lazy.ensure`, which does not exist (EX-57).

### Ink invariant 132

I drew strokes with CDP mouse events, which the engine treats like a pen. In both the timed paper's pad and the topic page, I forced a redraw in the middle of a stroke. The canvas was not replaced while the stroke was in progress, and the stroke was saved whole. The queued redraw ran after the 1.5 s idle.

## Not covered

- Lasso across pages, or across part of a picture (UR-9), was not driven end to end.
- Scan pages (camera) and Share to KurenaiOS.
- Ink sync and the clash dialog. Both need a cloud sign-in, which the rules forbid.
- Mark with Kurenai and Check my working. Both need a provider.
- Side by side and All pages were seen but not exercised.
- Real Pencil pressure.
- Print of Revise's guide, and of bank-drawn papers.
- The user's copy account.

## November re-check

| Verdict | Items |
|---|---|
| Fixed | EX-01, EX-33, EX-39, EX-40, EX-24, EX-25, EX-27, EX-45, EX-47, EX-49 |
| Fixed, read in the code (300 files not seeded) | EX-16 |
| Still open and made worse by 1C | EX-38, now EX-58 |
| Still open | EX-03, EX-08 (the new marking chips repeat EX-08's problem: EX-56) |
