# Neon's fifth branch: the grade

`neon/qol-batch-5` (8383a135): 39 tickets in five rounds (A–E, the whole of 1D), one commit per ticket plus one
follow-up (`dd374cf1`, A2's control parity for smoke56). Rounds A–D ran before 1F landed. The reviewer then merged
`main` in (`4d0bdbee`, carrying achievements-governor#2 and #4 into the new `achievementspage.js`), and round E ran on
top of it.

Graded against `REVIEW.md` (sections R and A–F) and `BRIEF-5.md`, from:
- the diff (`git diff origin/main origin/neon/qol-batch-5`: 42 files, +355 / −119);
- Neon's Walkthrough (Antigravity session `554582e8…`, all five rounds, screenshots at 1470, 820 and 375 px);
- the reviewer's own browser check on a separate origin with its own seeded records (E4, E5, E2 below);
- the reviewer's own gate run in a fresh checkout of the tip: 179 / 179, none needing a re-run.

**Verdict: passes.** Merged to `main` with no fix-up: a fast-forward, since the branch already held `main`. This is
the third batch in a row with no fail. It is also the largest batch so far (39 tickets against six), and it has no
note.

## The three rules

| Rule | Grade | Evidence |
|---|---|---|
| R1 · Reproduce first | pass | Every ticket's gap is measured on the commit before it. Some examples: a 150 px worked-step body at 375 px (A6); "15 cards graduated" (A5); a 77 / 112 px spacer (C6); the same item placeable twice (C1); 4 separate "Regular" rows (D5); "blocked" matching 0 permission rows (E3); a second toast overwriting the first, so no Undo (E4). |
| R2 · Test before committing | pass | Each ticket lists `node --check`, a live check with `failures: []`, its suites and `smoke142`, then the commit. The full gate ran at the end of every round: 179 / 179 five times. |
| R3 · Line discipline | pass | 355 lines over 42 files, each one belonging to its ticket. The brief's one exception (a single name string in `achcatalogue.js`, D4) was used exactly as given. Eleven findings are under "Noticed, not touched". |

## Its claims, checked

- **E4 (collection#4):** a game marked purchased says "Purchased Review Undo Quest (£15.00) · added to Collection ›
  Games." with Undo. Undo puts back:
  - the status (`wantToBuy`);
  - `linkedEntryId` and `collectionAppliedAt` (both null);
  - the budget history, and with it Money's `wl:` row, which mirrors the planner;
  - the Collection entry it created (gone).
  **True.** Read in the code as well:
  - a volume that was already on the shelf carries `duplicateVolume` only, so Undo never takes away a volume that
    was there before;
  - `update` keeps the cleared hand-off fields, so the item can be handed off again.
- **E5 (collection#5):** Games filtered to nothing shows "Nothing matches this filter." with Clear filters as the
  primary button. Clear filters empties the search and brings the seeded game back, with no console errors. **True.**
- **E2 (productivity#3):** a running session's compact player reads "CS · Finish past paper Q3" under the clock.
  **True.**
- **The rest** were read in the diff against the Walkthrough's numbers, and every function they call exists where
  it is called:
  - `C().tasksOf` and `taskState` (B3);
  - `CR().trackPlace`, `currentTrack`, `lesson` and `lessons` (B4);
  - `create` in `crwrite.js` (B4);
  - `subj` in `renderDock` (E2);
  - `reask`, `backBtn` and `KOS.ja.lessonPass` (D3);
  - `KOS.router.parse` (D11).
  D3's retry is `reask()`, the existing practice path, so nothing is scheduled or paid (116). **True as far as
  checked.**
- **Boot:** 44,175 bytes free under 5.15 MB after round E. **True** (`smoke142` passes in the reviewer's gate).
- **Gate:** 179 / 179 after each round. The reviewer's run on the tip: 179 / 179. **True.**

## Per round

| Round | Grade | Notes |
|---|---|---|
| A · Study (7) | pass | A2 kept the button's name and `hooks: ""` that smoke56's baseline records, and added a header and a `title` instead of renaming the control. That is the right reading of the baseline rule. |
| B · Code and Creatives (9) | pass | B2 found the only private byte formatters (all in Code) and named the one look-alike it left (a worked example that teaches the conversion). B7's Restore keeps the current text as a version first and pops it on Undo only if untouched. |
| C · Productivity, Home, Goals, Money (6) | pass | C6 compared two fixes with screenshots before choosing (`align-self: start` as well as dropping the spacer), and said why. |
| D · Japanese, Mind, the Wall, the Shop, the shell (11) | pass | D11 tells pages apart by route and `data-ui` hooks only, never classes (26). D6 honours reduced motion. |
| E · After 1F (6) | pass | Every page-code change went into 1F's page files (`calpage.js`, `assistantpage.js`, `wishlistpage.js`), and the lazy index was checked after each. E6's captions never claim Green without snapshots (smoke69 G). |

## By section

- **R · Probation rules:** pass.
- **A · Correctness and honesty:** pass. Two small inaccuracies in the Walkthrough's words:
  - D1's checkbox is described as "Make it this week's Big Question", but the code says "Make it the Big Question";
  - D5 and D6 cite `achievements.js` lines from before the 1F merge.
  Neither changes a result.
- **B · Invariants:** pass. Every id cited exists in the file named, including 5a, 5b, 26, 47–50b, 56, 58, 64–69,
  71a, 74, 77, 102a, 105–108, 111, 113–116, 137–139, 142–149, 154, 156, 161–163, 166 and 168.
- **C · Helper reuse:** pass. `KOS.ui.bytes`, `KOS.ui.toast` with an action, `KOS.ui.confirm`, `KOS.view.memo`,
  `mv.emptyState` and `mv.filterRail`, `KOS.calendar.eventsOn`, and `reask()`. **One observation:** `relDue` (A1) is
  exported as `KOS.relDue` from `assignments.js`, because `js/core/ui.js` was out of scope. It belongs in `KOS.ui`
  once Phase 5's duplicate-helper lint comes; it is correct where it is.
- **D · CSS and tokens:** pass. No raw colour, pixel value, z-index or new breakpoint in 200 lines of CSS diff.
- **E · Scope:** pass. "Noticed, not touched" holds real findings (listed under Next).
- **F · Habits:** pass. Two decisions were put to the user as options before building, and the choice is recorded
  each time: B5's strip (Option 1) and E2's mini player (Option 2).

## What to keep doing

1. **Measuring before and after.** Every ticket has a number on each side of the change.
2. **Respecting the baselines.** A2 read `render-purity.json` before touching a control, and smoke56 never needed
   re-baselining.
3. **Building on what moved.** Round E went straight into 1F's split files with no prompting beyond the merge note.

## Next

Neon's "Noticed, not touched" findings, all small (S), go to the follow-up list:
- the topic inspector's Next review shows a raw ISO date;
- Card stats says "≈ 1 reviews a day";
- a Code task's clock keeps ticking after a pass;
- Creatives Settings still lights "Creatives" in the strip (in `ui.js`);
- the Katakana badges share one name, as the Hiragana ones did;
- a Shop card's foot clips "more" at 375 px;
- the All routines heatmap does not mark late days;
- the Reviews and Recall tiles in Reports' Study overview have no caption;
- the Daily Review skips the Time step when placing fills the last free block.

The observation on `KOS.relDue` waits for Phase 5.
