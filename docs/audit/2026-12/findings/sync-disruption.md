# Sync disruption — December 2026 audit (Phase 2, Batch 1)

Prefix SY, slot 4, ids SY-28 to SY-40. Code audited: `main` `fa4264d0`
(sw `kos-qol-4`). Evidence and helper scripts:
`/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/sync-disruption/`.

## Result

13 findings: **P0 1** (SY-38), **P1 1** (SY-33), P2 6 (SY-28, 29, 30, 31,
37, 40), P3 5 (SY-32, 34, 35, 36, 39). Of November's 27 items, 23 re-check
as fixed, 1 as not reproducible (SY-07: default view only), and 3 as still
open: SY-10 and SY-13 (expected open), and SY-17 (expected fixed; filed
again as SY-39).

- **SY-38 (P0).** A pull re-keys a colliding counter-id record while that
  record's editor is open. Goals still mint per-device counter ids, so two
  devices that each add a goal before syncing collide. Save then writes the
  edit onto the other device's record, and the next push spreads the
  overwrite. Reproduced with the goal editor and the assignment editor.
- **SY-33 (P1).** Mind's card reviews (the cards page and the Daily 15)
  throw `KOS.fsrs.recall is not a function` on every card reviewed before.
  This came in with T3 (29ee1108). The page is left half drawn and the
  address stays on the previous page.

## How background changes were made

- **Cloud pulls.** I installed smoke135's fake api in the page through
  `KOS.cloudsync._config` and linked once. Each "pull" then put a changed
  account copy on the fake server and ran `syncNow`. So every pull went
  through cloudsync's own `land()` → `KOS.store.replaceState` (in place) →
  `rerenderCurrent` → `KOS.rerender({background:"hard", changed})`.
- **Another tab.** A second CDP page on the same origin saved through
  `KOS.store`.
- **Google/Todoist.** I drove the write path directly with
  `KOS.ext.inbound(…)` and `KOS.ext.changed()`. No provider was called.
- **App update.** I dispatched `controllerchange` in a tab that had a
  controller.
- **Daily Review.** Opened with `KOS.reviewSheet.open` and closed with Later.

## Covered

| Surface | What was checked | Sizes |
|---|---|---|
| Topic notes | Note page and scroll through a held pull and Refresh; the chip and how it reflows the title | ipad, ipadl, split, mac, iphone |
| Topic Flashcards / Quiz / Exam tabs | Run lines; card index; a card rated elsewhere is skipped; one ledger entry; quiz place; typed exam answer; the held line lost between tabs (SY-28) | ipad, ipadl, split |
| Study editor (Flashcards) | SY-18 re-check: a pulled card survives saves | ipad |
| Due today | Run kept; one `due-review` entry | ipad |
| Code lesson | Listing edit through Refresh and a plain redraw; chip reflow | ipad, split, mac |
| Japanese learn session | Answers, question and typed text kept; renumbering (SY-35) | ipad, split |
| Mind cards page | Crash on reviewed cards (SY-33); a redraw splits the run (SY-34). The Daily 15 by code read only | ipad |
| Creatives Writing Desk | Text kept; focus lost (SY-36) | ipad, mac |
| Focus | Set-up reset (SY-30, dense and empty, pull and tab); running session through a pull; another tab during Focus | ipad, mac |
| Error Log | Capture sheet through a pull (both records kept); Quick Error Drill restarts (SY-31) | ipad, split |
| Pacing Shift dialog | Held while open; preview differs from what is confirmed (SY-32) | ipad |
| Handwritten tab | Held; stage scroll kept through Refresh | ipadl, ipad |
| Edit your seat | Holds; draft and tab kept | ipad |
| Reminders quick add, Notifications tabs, Collection Overview tabs, CS desk strip, #/anime vault | Typed text, tab, strip and deep scroll kept; touch-scroll right after a restore is respected | ipad, ipadl |
| Scroll restoration (Neon T2) | #/home, assignments, goals, notifications, calendar, reminders, matrix, governor: scroll kept, the floor cleared, no extra height left | ipadl, ipad, split, slide |
| Daily Review closing | No redraw; the scroll jump comes from the dialog's focus return (SY-37) | ipad, mac |
| Re-key collision with an editor open | Assignment (numeric id) and goal (counter id) (SY-38) | ipad |
| Lazy page loading | Background change while #/goals' bundle loads: drawn once | ipad |
| App update | Another tab reloads over unsaved work (SY-40) | ipad, split |
| Accounts | Dense throughout. Sample: run held behind another tab's save. Empty: Focus set-up reset by another tab | |

## Not covered

- **The user's own data copy.** It was not available for this run; a
  separate pass will do it.
- Not run:
  - the Side by side Handwritten panes;
  - a real service-worker update;
  - real Google/Todoist pulls;
  - the Daily 15 end to end (code read only);
  - SY-10 menus (expected open).
- **Not filed, not reproduced.** In one of three ipad runs, #/goals lost
  its scroll after the 600 ms floor cleared (height 2485→1120). Two
  targeted re-runs kept it.
- **Not filed, my own test data.** A pulled progress record with no `check`
  crashes every render (hub.js:87). Only my synthetic copy produced one; I
  found no writer that does.
