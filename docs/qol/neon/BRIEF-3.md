# Neon's handoff brief: batch 3

Batch 2 (`neon/qol-batch-2`) passed after one fix-up and is merged into `main`. Your grade, the fix-up and the
reviewer's re-check are in `docs/qol/neon/REPORT-2.md`: read them first. This batch is the same size as batch 2:

- three M tickets, each inside a single module;
- two S tickets.

Nothing here touches the core files. Every ticket was checked on 20 November and is still open, but R1 still
applies: reproduce it on `origin/main` before you edit, and stop that ticket if it is already true.

## 0 · Setting up (you, once)

Keep the same folder, so the test dependencies and the C# runtime you built stay:

```bash
cd /Users/fj/Developer/KurenaiOS-neon && git restore package.json package-lock.json && git fetch origin && git switch -c neon/qol-batch-3 origin/main
```

Cut the branch only once `main` holds the release of 1A/1B (the reviewer tells the user when; `git log origin/main`
then shows `release: sw kos-qol-1`). The Antigravity settings are the same as batch 2: Gemini 4 Neon, thinking HIGH;
the plan and terminal commands need review; not Turbo; the same commands refused.

## 1 · The prompt to paste

> You are Neon, the junior developer on KurenaiOS. Batch 2 passed after one fix-up. This is batch 3, on branch
> `neon/qol-batch-3`, cut from `origin/main`. The same senior reviewer (Claude) grades it line by line against
> `docs/qol/neon/REVIEW.md`.
>
> **Read before you plan anything:**
> 1. `docs/qol/neon/REPORT-2.md`: your batch 2 grade, the fix-up and "What it should do differently next time".
>    Its three points are now part of the grade:
>    - **A check must be able to fail.** Count the rows, find the one you expect, compare the numbers on screen.
>      "Something is shown" is not a check.
>    - **Write the Walkthrough from what you saw.** A sentence you did not measure says "by design" or goes.
>    - **Copy invariant numbers from your plan**, and their domain file with them (`ui.md` 168, not `spaces.md`).
> 2. `docs/qol/neon/REVIEW.md`, section **R** above all (R1 reproduce first, R2 test before committing, R3 line
>    discipline). A fail on any R rule fails the ticket.
> 3. `AGENTS.md`; in `CLAUDE.md` the sections "Architecture", "Invariants" and "Files to edit deliberately";
>    `docs/ownership.md`.
> 4. For each ticket, the `docs/invariants/<domain>.md` file it names, in full for every id you cite.
> 5. The tickets: `docs/qol/neon/BRIEF-3.md` §2.
>
> **How to work** (as batch 2):
> - `/plan` first, one section per ticket: how you will reproduce it (R1); the file and lines; the existing helper
>   or pattern you will reuse and where it lives; the invariants; the checks (that can fail) and suites you will
>   run before committing. Wait for approval.
> - One commit per ticket: `fix(qol): <key> — <what changed>` with the trailer `Agent: Gemini 4 Neon (Antigravity)`.
>   Stage by name. Push after each commit: `git push origin neon/qol-batch-3`.
> - The core files are off limits:
>   - `js/core/store.js`, `js/core/cloud*.js`, `js/core/redraw.js`, `js/core/router.js`;
>   - `js/core/sessions.js`, `js/core/governor.js`, `js/core/ui.js`, `js/core/lazy.js`;
>   - `js/core/money.js`, `js/core/creatives.js`, `js/core/ja*.js`, `js/core/goals*.js`, `js/core/reminders.js`;
>   - `sw.js`, `index.html`, `js/env*.js`, `supabase/`, `art-source/`, `.claude/`, `docs/memory/`.
>
>   Never hand-edit the generated files (`js/data/compsci.js`, `maths.js`, `it.js`, `lazy-index.js`). If a ticket
>   seems to need a forbidden file, stop and say so.
> - Style as before: `k-` classes are presentational only and logic and tests read `data-ui`; tokens for every
>   value; only the five width breakpoints; spoken messages through `KOS.a11y.announce`; dialogs through
>   `KOS.ui.openDialog`. A new interactive element gets a `data-ui` hook in its area's naming, a real `<button>` or
>   link, and a hit area of 32 px (44 px on a coarse pointer).
>
> **Testing:**
> - Per ticket, before its commit: the suites the ticket names, anything else that greps for what you changed
>   (`grep -l <name> tools/smoke*.test.js`), `node tools/gen_lazy_index.mjs --check` when the file is in a lazy
>   bundle, and the browser at 1470×832 and 820×1180.
> - At the end: `SMOKE_JOBS=3 npm test`, with every suite passing (whatever `main` has when you start). Paste the
>   summary.
> - The local test copy only (`python3 tools/dev_server.py 8765`; Settings › Data › Sample for a filled-in
>   account). Never sign in to anything.
>
> **Finish with a Walkthrough**: per ticket, how you reproduced it, the commit, the files and lines, the helper
> reused, the invariants and the suites run (in order: run, then commit); screenshots; the full gate's summary;
> "Noticed, not touched"; your uncertainties. Don't claim something passed unless you ran it and saw it pass.

## 2 · The tickets

In a suggested order, warm-up first. Each names where to look; how to do it is part of the test.

### C1 · Goals: Restart names the new dates (S; `goals#3`)

- **Where:** `js/modules/goals.js`, `restart(g)` (around `:538`).
- **What's wrong:** it announces "<goal> restarted for <this month>", but the new span runs from today for the old
  span's length, so the words can name the wrong month and never say the dates. The button reads "Restart"; the
  announcement and any toast should name the new span ("restarted · 20 Nov – 19 Dec").
- **How:** the file's own date helpers (`shortDate`, `addDays`, `between`). A goal with no deadline has no span to
  name: say what it does then.
- **Invariants:** `docs/invariants/core.md` 5b.
- **Tests:** `node tools/smoke84.test.js`, `smoke85` to `smoke87`, and any suite that greps `goal.restart`.

### C2 · Money: the Year view draws income at its height (M; `money-goals#1`)

- **Where:** `js/modules/money.js`, `yearView` (around `:1673`), in the `page-money` bundle; its styles in
  `css/views/money.css` (`k-mn-ybar`, `k-mn-yin`).
- **What's wrong:** each month's bar is its outgoings scaled to the year's largest (`--hv`); income is only a mark
  (`k-mn-yin`) with no height, so in against out can't be read at a glance.
- **What to do:** draw income beside or behind the outgoings bar at its own height, on the same scale (the scale's
  top is then the larger of the two across the year). The accessible names already say "out …, in …"; keep them.
  The legend says which is which.
- **How:** extend the existing `--hv` pattern (a second custom property); no chart library, no new colours outside
  the tokens (income and outgoings already have tones on Overview: reuse them).
- **Invariants:** `core.md` 5a; `ui.md` 26d (a bar matches its printed value), 76, 77, 168.
- **Tests:** `smoke84`–`smoke87`, `smoke119`, any suite that greps `money.year`; `node tools/gen_lazy_index.mjs --check`.
  Your check must compare a bar's height with its number for at least two months, one where income is larger.

### C3 · Creatives: Practice Log thumbnails for picture works (M; `creatives#1`)

- **Where:** `js/modules/creatives.js`, `workRow` (`:544`) draws the track glyph (`kindMark`, `:79`) for every
  piece.
- **What to do:** a piece with a picture shows a small thumbnail in place of the glyph; a piece without one keeps
  the glyph. Thumbnails load only for the rows drawn (the 60-row batches from your batch 2), and their object URLs
  are revoked when the page is disposed or the rows are redrawn.
- **How:** find how `openWork` already shows a piece's picture and reuse that read; do not add a second store or
  copy the image. The image is decorative here (`alt=""`): the row's title is its name.
- **Invariants:** `spaces.md` 154, 156 (drawn only when opened); `ui.md` 59, 166, 168.
- **Tests:** `node tools/smoke108.test.js`, `smoke131`, `smoke192`, any suite that greps `cr.work` or `cr.log`.
  Check that 60 rows make at most 60 image reads, and that leaving the page revokes them (count the URLs).

### C4 · Japanese: practise a finished lesson again, moving nothing (M; `bk:ja-mind#1`)

- **Where:** `js/modules/jarun.js` (the learn run and its end card, around `:443`–`:530`) and the lesson's entry in
  `js/modules/japanese.js` or `jatopic.js`, whichever draws a passed lesson's actions.
- **What to do:** a passed lesson offers "Practise again". It runs the lesson's items as a practice: the validator
  still marks each answer (invariant 114), but nothing is scheduled, rated, synced as a session or paid: no
  `KOS.ja.syncSession`, no `finishLesson`, no facet change. The end card says so in one line.
- **How:** the run already has an "early"/misses path that skips pay; find the existing flag and reuse it rather
  than a second runner.
- **Invariants:** `spaces.md` 113, 114, 116.
- **Tests:** every suite that greps `jarun` or `ja.learn` (find them), plus `node tools/ja_valid_check.mjs`. Your
  check reads the facets and the ledger before and after a practice and finds them identical.

### C5 · Reminders: "Tomorrow" on an overdue reminder (S; `productivity#7`)

- **Where:** `js/modules/reminders.js`, the Overdue group's rows (`R().isOverdue`, around `:314`).
- **What to do:** an overdue row offers "Tomorrow", which moves its due date to tomorrow at the same time of day,
  with an Undo toast. If the Daily Review already offers a Tomorrow action for reminders, reuse that exact path
  (find it first: `grep -rn "Tomorrow" js/modules js/core`).
- **Invariants:** `productivity.md` 95, 144, 147; `ui.md` 27.
- **Tests:** `node tools/smoke102.test.js` to `smoke104`, `smoke133`, `smoke135`, and any suite that greps `rem.`.

## 3 · What the reviewer is doing meanwhile

Claude starts batch 1C (your own requests: routines inside routines, pacing, ink, notes, the Code editor, the
Collection link). To keep your merge clean, 1C stays out of `goals.js`, `money.js`, `creatives.js`, `jarun.js`,
`japanese.js`, `jatopic.js` and `reminders.js` until this branch is merged. If you need a file outside your tickets,
say so in the Walkthrough rather than editing it.

## Triaged out on 20 November (already true on `main`; not tickets)

- `goals#5` (exam goal Save announcing "Goal added" on edit): Save now says "Goal saved" for an existing goal.
- `study-core#9` (assignment subject filter order): the filter already reads `KOS.subjects.ids()`.
- `mind#3` ("just review my Mind cards"): the Mind desk has "Just reviews · 5′".
