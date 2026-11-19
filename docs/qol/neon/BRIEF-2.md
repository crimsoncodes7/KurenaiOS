# Neon's handoff brief: batch 2

Batch 1 (`neon/qol-starter-1`) passed probation and is merged into `main` (`ceee461`). Your grade
and the reviewer's notes are in `docs/qol/neon/REPORT-1.md`: read them first. This batch is one size up:

- three M tickets, each inside a single module;
- two S tickets, one of them from your own "Noticed, not touched" list.

Nothing here touches the core files.

## 0 · Setting up (you, once)

Keep the same folder, so the test dependencies and the C# runtime you built stay:

```bash
cd /Users/fj/Developer/KurenaiOS-neon && git restore package.json package-lock.json && git fetch origin && git switch -c neon/qol-batch-2 origin/main
```

`git restore` puts back the two files `npm install` changed. `node_modules` and
`assets/code/runtime/` are untouched. The Antigravity settings are the same as batch 1:

- model Gemini 4 Neon, thinking HIGH;
- the plan needs your review, terminal commands need review, and not Turbo;
- the same commands are refused.

## 1 · The prompt to paste

> You are Neon, the junior developer on KurenaiOS. You passed probation on batch 1. This is batch 2,
> on branch `neon/qol-batch-2`, cut from `origin/main`. The same senior reviewer (Claude) grades it
> line by line against `docs/qol/neon/REVIEW.md`.
>
> **Read before you plan anything:**
> 1. `docs/qol/neon/REPORT-1.md`: your batch 1 grade and the three corrections.
> 2. `docs/qol/neon/REVIEW.md`. Pay most attention to the new section **R**: these are now rules, and a
>    fail on any of them fails the ticket.
>    - **R1 · Reproduce first.** Before you edit, show the bug or the missing behaviour on
>      `origin/main`, in the browser or with a check that fails, and write down how. If it is not
>      there, STOP that ticket: commit nothing for it, and report what you saw.
>    - **R2 · Test before committing.** Run each ticket's own suites and checks, and see them pass,
>      BEFORE you commit that ticket. Then move on to the next. The full gate runs once, at the end.
>    - **R3 · Line discipline.** Touch only the lines the ticket needs. No cleanup of neighbouring
>      lines, however small. Anything else goes under "Noticed, not touched".
> 3. `AGENTS.md`, and in `CLAUDE.md` the sections "Architecture", "Invariants" and "Files to edit
>    deliberately"; then `docs/ownership.md`.
> 4. For each ticket, the `docs/invariants/<domain>.md` file it names, in full for every id you cite.
> 5. The tickets: `docs/qol/neon/BRIEF-2.md` §2.
>
> **How to work** (the same as batch 1, plus R1 to R3):
> - Use `/plan` first: one section per ticket. Each section gives:
>   - how you will reproduce it (R1);
>   - the file and lines;
>   - the existing helper or pattern you will reuse, and where it already lives;
>   - the invariants;
>   - the tests you will run before committing.
>
>   Wait for approval.
> - One commit per ticket: `fix(qol): <key> — <what changed>` with the trailer
>   `Agent: Gemini 4 Neon (Antigravity)`. Stage by name. Push after each commit:
>   `git push origin neon/qol-batch-2`.
> - The same forbidden files and commands as batch 1. The core files are off limits:
>   - `js/core/store.js`, `js/core/cloud*.js`, `js/core/redraw.js`, `js/core/router.js`;
>   - `js/core/sessions.js`, `js/core/governor.js`, `js/core/ui.js`, `js/core/lazy.js`;
>   - `js/core/money.js`, `js/core/creatives.js`;
>   - `sw.js`, `index.html`, `js/env*.js`, `supabase/`, `art-source/`, `.claude/`, `docs/memory/`.
>
>   Never hand-edit the generated files (`js/data/compsci.js`, `maths.js`, `it.js`, `lazy-index.js`). If a
>   ticket seems to need a forbidden file, stop and say so.
> - Style as before:
>   - `k-` classes, presentational only; logic and tests read `data-ui`;
>   - tokens for every value; only the five width breakpoints;
>   - spoken messages through `KOS.a11y.announce`; dialogs through `KOS.ui.openDialog`.
> - A new interactive element gets a `data-ui` hook in the area's own naming (`money.…`, `cr.…`,
>   `asg.…`), a real `<button>` or link, and a hit area of 32 px (44 px on a coarse pointer).
>
> **Testing:**
> - Per ticket, before its commit: the suites the ticket names, anything else that greps for what you
>   changed (`grep -l <name> tools/smoke*.test.js`), `node tools/gen_lazy_index.mjs --check` when the file is
>   in a lazy bundle, and the browser at 1470×832 and 820×1180.
> - At the end: `SMOKE_JOBS=3 npm test`, with every suite passing (177 / 177 on `main` at the time of writing, or
>   whatever `main` has when you start). Paste the summary.
> - Use the local test copy only (`python3 tools/dev_server.py 8765`; Settings › Data › Sample if you want a
>   filled-in account). Never sign in to anything.
>
> **Finish with a Walkthrough** with:
> - per ticket: how you reproduced it, the commit, the files and lines, the helper reused, the invariants,
>   and the suites run (in order: run, then commit);
> - screenshots;
> - the full gate's summary;
> - "Noticed, not touched";
> - your uncertainties.
>
> Don't claim something passed unless you ran it and saw it pass.

## 2 · The tickets

They are in a suggested order, warm-up first. Each one names where to look; how to do it is part of the test.

### B1 · smoke119's baseline lists a collision that is already gone (S; your own note)

- **Where:** `node tools/smoke119.test.js` prints
  `FIXED (shrink the baseline): .k-gv-frame · gap · css/views/governor.css`. The baseline is
  `tools/baselines/smoke119-css.json`.
- **What to do:** remove that one entry, so the ratchet is tight again. Read the suite's header about
  `--write-baseline` first, and decide whether it is the right tool here (R3).
- **Reproduce:** the FIXED line above, on `origin/main`.
- **Tests:** `node tools/smoke119.test.js`. Afterwards it should list nothing as FIXED.

### B2 · Money: open Transactions from a day, and from a pot's moves (M; `money-goals#2`, `money-goals#3`)

- **Where:** `js/modules/money.js`, in the `page-money` lazy bundle.
- **What to do, part 1:** on Overview, the day chart (`data-ui="money.daychart"`, around `:360`) shows a tooltip
  per day, by hover, focus and the arrow keys, but choosing a day does nothing. Choosing a day (a tap or
  click on its bar, or Enter on the focused day) should open Transactions showing that day only. The range
  control must say which day.
- **What to do, part 2:** on Pots, "Recent moves → Transactions" (around `:1375`) opens Transactions with
  every kind. It should open showing moves (transfers) only, and the kind control should offer that choice.
- **How:**
  - Transactions' filter state is `visit.tx`; the range is read by `txRange()` and the kind by the toolbar.
  - Extend those rather than adding a second filter.
  - The core list (`KOS.money.list`) already filters by `kind`, so this needs no core change.
  - "Clear filters" must still clear everything.
- **Invariants:** `docs/invariants/core.md` 5a (Money has no Governor or network traffic); `ui.md` 50, 168.
- **Tests:** `node tools/smoke84.test.js`, `smoke85` to `smoke87`, `smoke119`, `smoke161`, and any suite that greps
  `money.tx-` or `daychart`; `node tools/gen_lazy_index.mjs --check`.

### B3 · Creatives: filter the Practice Log, and draw it in batches (M; `creatives#2`, `creatives#8`)

- **Where:** `js/modules/creatives.js`. `logPage` (around `:590`) draws every piece at once, and `workRow` (`:544`)
  draws one row.
- **What to do:**
  - Add a filter by track (`CR().tracks()`).
  - Add a "Check to do" filter: a piece made for a lesson's study (`w.lesson`) whose check has not passed
    (`!w.check || !w.check.pass`).
  - Draw 60 rows, then a "Show more" button for the next 60.
  - The card head's count says how many pieces the filter shows, out of how many.
- **How:**
  - Reuse an existing filter row (the assignments page's pill selects are one) and an existing Show more (`js/modules/files.js:267`).
  - The filter is per visit, never stored.
  - A deep link to one piece (`#/creatives/log/<id>`) must still show and open that piece, even when the filter or the
    batch would hide it (read the CR-01 comment under `logPage`).
- **Invariants:** `docs/invariants/spaces.md` 154–156 (156: the Practice Log is private and drawn only when opened);
  `ui.md` 50, 166.
- **Tests:** `node tools/smoke108.test.js`, `smoke192`, plus any suite that greps `cr.log` or `cr.work`.

### B4 · Creatives: a project's milestones link to their work, and the page back to its unit (M; `creatives#4`)

- **Where:** `js/modules/creatives.js`, `projectView` (around `:625`).
- **What to do, part 1:** a done milestone with work attached says "✓ work saved", but you can't get to that work.
  The text should open it. A milestone's attached work ids come from `CR().projectState(uid).works[i]`.
- **What to do, part 2:** the project page should have a way back to the unit's lessons.
- **How:** use the existing `openWork`, and the existing link and button patterns in this file. No new route.
- **Invariants:** `docs/invariants/spaces.md` 154, 156; `ui.md` 67 (no card as a button with buttons inside).
- **Tests:** `node tools/smoke108.test.js`, `smoke131`, `smoke192`, and any suite that greps `cr.milestones` or `cr.project`.

### B5 · Assignments: the subject chips read the subject registry (S; your own note)

- **Where:** `js/modules/assignments.js:18-23`. `subjName` and `shortSubj` still read `window.KOS_DATA` and trim the name
  with `.replace`.
- **What to do:** read `KOS.subjects.name(sid)` and `KOS.subjects.short(sid)` instead, as batch 1's T5 did for the lists.
- **Reproduce (R1):**
  - Show what every subject's chip reads today and what it will read after.
  - If they are identical, the ticket is still worth doing (one source, invariant 103), but say so.
  - If they differ, show each difference in the Walkthrough and keep going.
- **Invariants:** `docs/invariants/spaces.md` 103.
- **Tests:** `node tools/smoke102.test.js`, `smoke103`, `smoke104`, `smoke33`.

### Triaged out: `ov.remove()` in `goalDialog` (your note)

**Not a ticket.** `KOS.ui.openDialog`'s teardown runs however a dialog leaves, `remove()` included, and
that dialog's `overlay.close` is itself `overlay.remove()`. Changing the call would change no
behaviour, and making that edit inside another ticket is exactly what R3 forbids.

## 3 · What the reviewer is doing meanwhile

Claude is finishing batch 1A on `feat/qol-1a` and the exam-season content (1B). To keep your merge clean:

- 1A stays out of `money.js`, `creatives.js` and `assignments.js` until this branch is merged.
- 1B touches only `js/data/content/`.

If you need a file outside your tickets, say so in the Walkthrough rather than editing it.
