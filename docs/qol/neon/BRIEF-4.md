# Neon's handoff brief: batch 4

Batch 3 (`neon/qol-batch-3`) passed with one note and is merged into `main`, with no fix-up. Your grade is in
`docs/qol/neon/REPORT-3.md`: read it first. This batch is the same tier, a little longer:

- three carry-overs from batch 3 (your own "Noticed, not touched" list, and the reviewer's note on C2);
- three new tickets from 1D/1E, each inside one area.

Nothing here touches the core files. Every ticket was checked on 20 November and is still open, but R1 still applies:
reproduce it on `origin/main` before you edit, and stop that ticket if it is already true.

## 0 · Setting up (you, once)

Keep the same folder (`/Users/fj/Developer/KurenaiOS-neon`), so the test dependencies and the C# runtime stay. The
reviewer gives the user the exact command to cut `neon/qol-batch-4` from `origin/main`. The Antigravity settings are
the same as batch 3: Gemini 4 Neon, thinking HIGH; the plan and terminal commands need review; not Turbo.

## 1 · The prompt to paste

> You are Neon, the junior developer on KurenaiOS. Batch 3 passed with one note and no fix-up. This is batch 4, on
> branch `neon/qol-batch-4`, cut from `origin/main`. The same senior reviewer (Claude) grades it line by line against
> `docs/qol/neon/REVIEW.md`.
>
> **Read before you plan anything:**
> 1. `docs/qol/neon/REPORT-3.md`: your batch 3 grade. Keep the three habits it names (counting checks, an R1 that
>    reports what it finds, invariants copied from your plan) and add its one new point: **when a change moves what a
>    chart or a list shows, check the words around it too** (titles, labels, printed figures).
> 2. `docs/qol/neon/REVIEW.md`, section **R** above all (R1 reproduce first, R2 test before committing, R3 line
>    discipline). A fail on any R rule fails the ticket.
> 3. `AGENTS.md`; in `CLAUDE.md` the sections "Architecture", "Invariants" and "Files to edit deliberately";
>    `docs/ownership.md`.
> 4. For each ticket, the `docs/invariants/<domain>.md` file it names, in full for every id you cite.
> 5. The tickets: `docs/qol/neon/BRIEF-4.md` §2.
>
> **How to work** (as batch 3):
> - `/plan` first, one section per ticket: how you will reproduce it (R1); the file and lines; the existing helper or
>   pattern you will reuse and where it lives; the invariants; the checks (that can fail) and suites you will run
>   before committing. Wait for approval.
> - One commit per ticket: `fix(qol): <key> — <what changed>` with the trailer `Agent: Gemini 4 Neon (Antigravity)`.
>   Stage by name. Push after each commit: `git push origin neon/qol-batch-4`.
> - The core files are off limits:
>   - `js/core/store.js`, `js/core/cloud*.js`, `js/core/redraw.js`, `js/core/router.js`;
>   - `js/core/sessions.js`, `js/core/governor.js`, `js/core/ui.js`, `js/core/lazy.js`;
>   - `js/core/money.js`, `js/core/creatives.js`, `js/core/ja*.js`, `js/core/goals*.js`, `js/core/reminders.js`,
>     `js/core/achievements*.js`, `js/core/ach*.js`, `js/core/assignments.js`, `js/core/mind*.js`;
>   - `sw.js`, `index.html`, `js/env*.js`, `supabase/`, `art-source/`, `.claude/`, `docs/memory/`.
>
>   Never hand-edit the generated files (`js/data/compsci.js`, `maths.js`, `it.js`, `lazy-index.js`). If a ticket
>   seems to need a forbidden file, stop and say so.
> - Style as before: `k-` classes are presentational only and logic and tests read `data-ui`; tokens for every value;
>   only the five width breakpoints; spoken messages through `KOS.a11y.announce`; dialogs through `KOS.ui.openDialog`;
>   confirmations through `KOS.ui.confirm`; a hand-ranked list through `KOS.ui.reorder` (invariant 89a). A new
>   interactive element gets a `data-ui` hook in its area's naming, a real `<button>` or link, and a hit area of 32 px
>   (44 px on a coarse pointer).
>
> **Testing:**
> - Per ticket, before its commit: the suites the ticket names, anything else that greps for what you changed
>   (`grep -l <name> tools/smoke*.test.js`), `node tools/gen_lazy_index.mjs --check` when the file is in a lazy bundle,
>   and the browser at 1470×832 and 820×1180.
> - **Boot budget:** `node tools/smoke142.test.js` after any ticket that touches a file loaded at boot (`goals.js`,
>   `creatives.js`, `achievements.js`, `assignments.js` are). Boot is within about 10 KB of its budget; if a ticket
>   takes it over, stop and say so rather than moving files between bundles (that is the reviewer's call).
> - At the end: `SMOKE_JOBS=3 npm test`, with every suite passing (whatever `main` has when you start). Paste the
>   summary.
> - The local test copy only (`python3 tools/dev_server.py 8765`; Settings › Data › Sample for a filled-in account).
>   Never sign in to anything.
>
> **Finish with a Walkthrough**: per ticket, how you reproduced it, the commit, the files and lines, the helper reused,
> the invariants and the suites run (in order: run, then commit); screenshots; the full gate's summary; "Noticed, not
> touched"; your uncertainties. Don't claim something passed unless you ran it and saw it pass.

## 2 · The tickets

In a suggested order, warm-up first. Each names where to look; how to do it is part of the test.

### D1 · Goals: Archive on a missed goal says so in a toast (S; your batch 3 note)

- **Where:** `js/modules/goals.js`, the missed card's Archive (around `:535`) and the Done section's Missed row
  (around `:559`).
- **What's wrong:** both announce "Archived · <goal>" but show nothing, while Restart (your C1) shows a toast.
- **What to do:** show the same message as a toast, spoken once, the way C1 does. If the file already offers an Undo
  for archiving anywhere, give this one the same Undo; if not, don't invent one (say which in the Walkthrough).
- **Invariants:** `core.md` 5b; `ui.md` 66.
- **Tests:** `smoke84`–`smoke87`, and any suite that greps `goal.archive`.

### D2 · Money: the Year view's words match its bars (M; the reviewer's note on C2, invariant 26d)

- **Where:** `js/modules/money.js`, `yearView` (around `:1673`), and `css/views/money.css` (`k-mn-yfig`, `k-mn-ybars`).
- **What's wrong:** since C2 the card shows outgoings and income, but its title and the strip's accessible name still
  say "Outgoings by month", and the figure printed above each month is the outgoings alone. In a month where income
  is larger, that figure sits over the taller, green income bar and reads as the income.
- **What to do:** retitle the card (and the strip's name) for what it shows, and make each printed figure belong
  visibly to its own bar: for example a figure over each bar, or the outgoings figure placed over the outgoings bar
  with the income figure in the legend's green, or the income figure under the month. Your choice, argued in the plan;
  it must stay readable at 820 px with twelve months, and "Hide amounts" must still hide every figure.
- **Invariants:** `ui.md` 26d, 76, 77, 168; `core.md` 5a.
- **Tests:** `smoke84`–`smoke87`, `smoke119`, any suite that greps `money.year`; `gen_lazy_index --check`. Your check
  must read, for two months (one income-heavy), each printed figure, the bar it belongs to, and that bar's height.

### D3 · Creatives: three loose ends in the Practice Log and Portfolio (M; your batch 3 notes and the reviewer's)

- **Where:** `js/modules/creatives.js`: `workRow` (`:544`), `portfolioPage` (around `:686`), and C3's `loadThumb`.
- **What to do:**
  1. `workRow` prints `L.id + "·" + w.study`, so a piece with a lesson but no study reads "A1.1·null". Print the
     lesson alone then.
  2. `portfolioPage` reads each picture with `CR().files.get` and no view token, so leaving mid-load writes into a
     page that has gone. Guard it the way C3's `loadThumb` does (`KOS.view.token()`).
  3. C3's thumbnail `<img>` decodes the full picture to show it at 32 px. Add `decoding="async"` and
     `loading="lazy"` to it (and to the Portfolio's pictures if they lack them).
- **Invariants:** `spaces.md` 154, 156; `ui.md` 166, 168.
- **Tests:** `smoke108`, `smoke131`, `smoke192`, any suite that greps `cr.work` or `cr.portfolio`. Reproduce 1 with a
  seeded piece; reproduce 2 by leaving the Portfolio while its reads are pending and counting nodes written after.

### D4 · The Badge Wall: drag to reorder the showcase (M; `rm:showcase-reorder`)

- **Where:** `js/modules/achievements.js`, the showcase picker (around `:420`–`:440`: the picker `pk = showcasePicker(views)`, its Save
  `ach.save-showcase` and the leave guard `unsaved()`).
- **What to do:** the badges chosen for the showcase can be put in order by dragging, and by keyboard (Space to lift,
  ↑↓ to move), through `KOS.ui.reorder` (invariant 89a) — the same primitive the routine editor's steps use. The order
  is part of the draft: Save keeps it, and leaving with a changed order asks first, as a changed choice already does.
  The Wall then shows the badges in that order.
- **Invariants:** `core.md` 161–163; `ui.md` 50, 89a (in `study.md`: copy it from there), 166.
- **Tests:** `smoke113`, `smoke136`, `smoke146` (they grep `showcase`), any that greps `ach.`, `smoke119`, `smoke142`. Your check moves a badge
  by keyboard, saves, reloads, and reads the Wall's order.

### D5 · Japanese: a lesson's session goes back to the lesson; a checkpoint asks before it is left (M; `ja-mind#1`, `ja-mind#3`)

- **Where:** `js/modules/jarun.js` (the end screens' "Back to the desk", around `:536`, `:558`, `:574`) and
  `js/modules/japanese.js` (the checkpoint's ✕, around `:642`).
- **What to do, part 1:** a learn or practice session opened from a lesson ends with "Back to the lesson", opening that
  lesson's page; a reviews session keeps "Back to the desk".
- **What to do, part 2:** the checkpoint's ✕ discards a checkpoint in progress silently. Once anything has been
  answered, ask first through `KOS.ui.confirm` (the learn session's own "Leave the session?" is the pattern), and say
  what is lost. Nothing answered: leave at once.
- **Invariants:** `spaces.md` 112–116; `ui.md` 49, 166.
- **Tests:** every suite that greps `jarun`, `ja.exit` or `checkpoint`; `node tools/ja_valid_check.mjs`;
  `gen_lazy_index --check`.

### D6 · Assignments: deleting a subtask has an Undo (S; `study-core#7`)

- **Where:** `js/modules/assignments.js`, the subtask ✕ (around `:241`), which calls `A().subRemove` at once.
- **What to do:** keep the immediate delete, and offer Undo on the toast (the toast queue's Undo, as C5 used) that
  puts the subtask back where it was, with its text and tick.
- **Invariants:** `ui.md` 27, 66; `sync.md` 33a (a subtask's id is a random id since 1A: Undo must put back the SAME
  id, not mint a new one — check how `A()` adds one).
- **Tests:** `smoke33`, `smoke34`, `smoke104`, `smoke143`, `smoke144`, `smoke192` (they grep `asg.` or `subRemove`), and `smoke133`.

## 3 · What the reviewer is doing meanwhile

Claude works on batch 1C: the pacing plan (shift by N weeks, the plan inside calendar blocks), folders for loose notes,
ink, Code's editor and the Collection's watch link. To keep your merge clean, 1C stays out of `goals.js`, `money.js`,
`creatives.js`, `achievements.js`, `jarun.js`, `japanese.js` and `assignments.js` until this branch is merged, and
you stay out of `pacing.js`, `calendar.js`, the notes and Files modules, `ink*.js`, the Code modules, `medview.js`,
the vault modules and `routines.js`/`routineplayer.js`. If you need a file outside your tickets, say so in the
Walkthrough rather than editing it.
