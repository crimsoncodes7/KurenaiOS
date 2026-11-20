# Neon's fourth branch: the grade

`neon/qol-batch-4` (ce90b3e7): six commits, one per ticket, and one merge of `main` (`f50beca1`) that the reviewer
asked for, then the full gate.

Graded against `REVIEW.md` (sections R and A–F) and `BRIEF-4.md`, from:
- the diff (`git diff origin/main...origin/neon/qol-batch-4`);
- Neon's Walkthrough (Antigravity session `554582e8…`, 13 new screenshots);
- the reviewer's own browser check of every ticket, on a separate origin with the Sample account and its own seeded
  records;
- the reviewer's own gate run in a fresh checkout: 179 / 179, none needing a re-run.

**Verdict: passes.** Merged to `main` with no fix-up. This is the second batch in a row with no fail, and the first
with no note. Every number in the Walkthrough matched the reviewer's own measurement.

## The stop at D4

The brief said boot had "about 10 KB" of room. That was wrong: the reviewer had measured its own branch. On `main` there
were 1,762 bytes. Neon:
- measured boot after every ticket;
- found D4 42 bytes over the budget;
- stopped before committing;
- reported exact bytes;
- and did not move a file between bundles itself.

This is exactly what the brief asked for, and it is what a reviewer most wants from a junior: an honest stop with
numbers, instead of a quiet workaround. The reviewer made room on `main` (`5bd244d4`). Neon merged it as told and
recorded the merge and its reason in the Walkthrough. It ends the batch with 10,051 bytes free.

## The three rules

| Rule | Grade | Evidence |
|---|---|---|
| R1 · Reproduce first | pass | Each ticket's gap is shown on `origin/main` with numbers: no toast on either missed-goal Archive; "Outgoings by month" with `inFig: null`; "A1.1·null" and 2 nodes written after leaving; no `[data-reorder]`; "Back to the desk" from two lesson sessions and a silent ✕ after one answer; a deleted subtask with no Undo. D1's R1 also checked every other archive call site for an Undo before deciding not to invent one. |
| R2 · Test before committing | pass | Each ticket lists `node --check`, its live check, its suites and `smoke142`, then the commit. The gate ran once, at the end. |
| R3 · Line discipline | pass | 80 lines added over nine files, each one belonging to its ticket. Three things Neon saw and left alone are under "Noticed, not touched", all real. |

## Its claims, checked

- **D1:** a missed goal's Archive shows "Archived · QA missed" as a toast and speaks it once. The goal is archived.
  **True.** (The next spoken line, "3 goals", is the page's existing count after a redraw; it is not new.)
- **D2:**
  - The card and the strip are both named "In and out by month".
  - With September at out £40 / in £100 and October at out £24.99 / in £1,000:
    - each month prints its income figure in the bars' green (`oklch(0.72 0.13 150)` for both the figure and the
      bar) above the outgoings figure;
    - the bars keep one scale (October's income bar is 140 px);
    - a month with no income prints no green figure.
  - "Hide amounts" leaves no digit in any figure.
  - **True.**
- **D3:**
  - A piece with a lesson and no study reads "Art · A1.1 · 20 Nov".
  - The thumbnail is `decoding="async"`, `loading="lazy"`.
  - **True.** The Portfolio guard is the same `KOS.view.token()` pattern as `loadThumb`.
- **D4:**
  - Three badges picked; Space, ↓↓, Space moves the first to third.
  - The tray follows, and focus stays on the moved row's grip.
  - Leaving asks "Leave without saving?".
  - Save and a reload keep the order `regular, in-the-zone, week-by-week`, and the Governor's seat shows them in that
    order.
  - **True.**
- **D5:**
  - The button's target `#/ref/ja/H1` opens the lesson "あ and か rows".
  - **The reviewer did not re-run every end screen and the checkpoint**: a checkpoint needs its unlock, and the Sample
    account has none open. These were read in the code instead:
    - `backBtn` picks the lesson from `lessonId`, which is null for reviews;
    - `answered` counts each mounted answer, and `finished` is set before the result;
    - the confirm copies `jarun.js`'s own "Leave the session?" call.
  - Neon's live run covered all four end screens and both ✕ cases. **True as far as checked.**
- **D6:**
  - The assignment has four subtasks, two ticked (50%). Deleting the second ticked one shows "Subtask deleted ·
    Interview transcript 2" with Undo, and progress drops to 33%.
  - Undo puts back the same id (`2`) at the same place, ticked, with progress 50% and the checkboxes repainted.
  - **True.**
- **Boot:** 8,137,384 bytes, 10,051 free under 7.77 MB. **True** (`smoke142` passes in the reviewer's gate).
- **Gate:** "179 / 179". The reviewer's run: 179 / 179. **True.**

## Per ticket

| Ticket | Grade | Notes |
|---|---|---|
| D1 goals archive toast | pass | `U.toast` speaks through `KOS.a11y` (66), as C1 does. The R1 found no Undo for archiving anywhere and left none in, as the brief asked. |
| D2 `money-goals#1` | pass | The brief's second option: the income figure is coloured like its bar, so a figure in a month with tall income no longer reads as income. Tokens only, and `said()` keeps "Hide amounts" whole. The R1's report on C2 ("check the words around it") landed: the title and the strip's name both changed. |
| D3 Creatives loose ends | pass | Three small changes, each the brief's, and each reusing the file's own pattern. |
| D4 `rm:showcase-reorder` | pass | `KOS.ui.reorder` (89a) on a numbered order list under the tray, rather than a second drag system on the medals. That is a sound call: the medals are small round targets, and the list gives a 32 / 44 px grip and a name to announce. The draft and leave guard needed no new code, because `unsaved()` already compares the arrays. |
| D5 `ja-mind#1`, `ja-mind#3` | pass | One `backBtn` for all three end screens, and a confirm only when something would be lost. |
| D6 `study-core#7` | pass | The same id comes back (33a), at its old index, through `A().update`. **An observation, not a note:** the Undo repeats the core's own "a ticked subtask moves notStarted to inProgress" rule in the page. It is correct today, but if `syncProgress` ever changes, the two can drift. A `subRestore` in `js/core/assignments.js` would own it there; that is a core file, so leaving it out was right for this batch. |

## By section

- **R · Probation rules:** pass.
- **A · Correctness and honesty:** pass. The one place the reviewer could not measure (D5's checkpoint) agrees with
  the code.
- **B · Invariants:** pass. Every id cited exists in the file named (`core.md` 5a, 5b, 161–163; `ui.md` 26, 26d,
  27, 47–50, 66, 69, 76, 77, 166, 168; `study.md` 89a; `spaces.md` 112–116, 154, 156; `sync.md` 33a).
- **C · Helper reuse:** pass. `KOS.ui.reorder`, `.k-grip`, `KOS.ui.toast` with an action, `KOS.ui.confirm`,
  `KOS.view.token`, `said()`: all existing helpers, named with their file and line.
- **D · CSS and tokens:** pass. Tokens only, the coarse-pointer grip size included; no new breakpoint.
- **E · Scope:** pass. "Noticed, not touched" holds three real findings:
  - the goal Restore buttons still announce without a toast;
  - `KOS.achUI.governorCard` lists the showcase in catalogue order (it has no caller today);
  - a lesson session's ✕ with nothing answered still goes to the desk.
- **F · Habits:** pass. The stop at D4 is the habit this whole trial is testing for.

## What to keep doing

1. **Stopping with numbers.** "42 bytes over, here is every ticket's delta" let the reviewer fix the real cause in
   one commit.
2. **Counting checks.** Every claim was a measurement: ids, heights, nodes written after leaving, the order after a
   reload.
3. **Reading the brief's options as options.** D2 and D4 each chose a route and said why.

## Next

The three "Noticed, not touched" findings are small (S). They can go into a later batch or be folded into the
reviewer's own work. The D6 observation (a `subRestore` in the core) waits for a batch where a core file is in
scope.
