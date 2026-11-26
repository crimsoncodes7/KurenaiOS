# Productivity — December 2026 audit (Phase 2)

Code audited: `fa4264d0` (sw `kos-qol-4`). Harness slot 1. Evidence:
`/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/productivity/`.

**Result:** 9 findings (PR-44 to PR-52): 0 P0, 0 P1, 7 P2, 2 P3.

| Id | Sev | Title |
|---|---|---|
| PR-44 | P2 | Pacing row menu "Move to previous/next week": the toast reads "Moved to undefined." and the hint names a week the row does not go to |
| PR-45 | P2 | A hidden plan row still counts in the exam scope, in "next in pacing" and in the month, term and year reports' plan totals |
| PR-46 | P2 | Pacing "Move up/down" and "→ here" have no Undo |
| PR-47 | P2 | Countdowns still count down to a skipped showing (nextOccurrence ignores `skip`) |
| PR-48 | P2 | Switching the review times from Per day back to Simple silently overwrites every weekday time with Monday's |
| PR-49 | P2 | The routine player drops a run step two levels down, so the routine can't be finished there |
| PR-50 | P3 | The tick boxes in a Calendar block's "This week's plan" shrink beside long titles |
| PR-51 | P3 | The Shift summary starts a sentence in lower case |
| PR-52 | P2 | Reminders on iPad: the inspector, with its new actions, opens off screen below the list |

## How "cold" was tested

The harness's `#/route` navigation is a same-document hash change. Lazy
bundles also warm up a few seconds after boot. Neither one is a cold start.
For a real cold start I reloaded the page with a new query string and
`window.KOS_LAZY_HOOK = {mode: "lazy", warm: false}` injected before load.
`KOS.lazy.timing().loaded` read 0 at boot.

## Coverage: route × size × account

| Surface | mac | ipadl | ipad | iphone | split | slide | Accounts |
|---|---|---|---|---|---|---|---|
| `#/focus` set-up | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | dense, sample, empty |
| Focus running, About to Study (Start / Just start), mini player and phone dock, end early with confirm, review modal, reload mid-session (comes back paused, 4c) | ✓ | | | ✓ | | ✓ (dock) | dense, sample |
| Japanese immersion field (shows and hides with the subject, chip on stage, `metrics.immersion` logged) | ✓ | | | | | | dense |
| `#/reminders` list, inspector, Place in a free block (menu hit-test, create, Placed chip, Undo), Focus on this, Tomorrow with Undo | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | dense, sample, empty |
| `#/routines` Today / Routines / Templates / History / Settings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | sample, empty |
| Routine editor per-day windows (U5), player, routines inside routines (mirror, chain Undo, loop and self refused, nested two deep), kept late in History | ✓ | | | | | | sample |
| Daily Review: afternoon Time left (Place, Placed, Undo), per-day review times (U6) | ✓ | | | | | | sample |
| `#/calendar` month and week (week opening position, Agenda on phone) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | dense, empty |
| Event detail: plan section ticks through KOS.pacing, Skip this showing + Undo, countdown after a skip | ✓ | | | ✓ | | | dense, empty |
| `#/pacing` week | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | dense, sample, empty |
| `#/pacing/braid` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | dense, empty |
| Shift dialog, step 1 and 2, My plan / In class / Both, From this week on, Confirm, Undo | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | dense |
| Row menu: move previous/next + Undo, Move up/down, Hide + Undo, "→ here"; phone tools menu | ✓ | | | ✓ | | | dense |
| `#/tasks` (alias of Routines) | ✓ | | | | | | sample |
| Boot tickers with no page bundle loaded (reminder, calendar and routine alerts, autoSync, review due, countdowns, today.build, lessonsOn); dialog forwarders (daySheet, About to Study, the player) cold | ✓ | | | | | | sample |

Phase 1 checks that passed: the 1F splits work cold, and so do their boot
parts. Nothing outside the Pacing page calls the shift and row-edit methods
moved on 26 Nov. 1C routines inside routines work one level deep (pay,
mirror, Undo). The Shift preview matches what Confirm writes, and Undo
restores the plan exactly, added weeks included. These items all work:
U5, U6, productivity#1, #2 (code read only), #3, #4, #5, #7, #8 and #9, and
bk:ja-mind#5.

## Not covered

- The copy account: no backup was supplied in this batch.
- The Calendar week view opening outside 07:00–22:00: the clock was not mocked.
- The morning and evening reviews in full.
- PR-04: the long title on the running Focus stage.
- The dense account after the Sample/Empty passes: the harness refused the
  `account 1 mine` switch late in the run, so the later routine and review
  work used Sample.

## November re-check

| Verdict | Ids |
|---|---|
| Fixed | PR-02, PR-03, PR-11, PR-23, PR-24 (code read), PR-26, PR-27, PR-28, PR-35 |
| No longer reproducible (was open, Phase 3) | PR-01 |
| Still open (Phase 3, not re-reported) | PR-04, PR-06 (Agenda scrapped by decision), PR-08, PR-09, PR-10, PR-13, PR-15 |
| Not re-checked | PR-20, PR-32 |

The full list is in `productivity.json` (`novRecheck`).
