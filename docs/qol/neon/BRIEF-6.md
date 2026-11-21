# Neon's handoff brief: batch 6 (the rest of 1E)

Batch 5 (all of 1D, 39 tickets) passed with no note and shipped in `kos-qol-3` with the reviewer's 1F. Your grade is
in `docs/qol/neon/REPORT-5.md`: read it first.

This batch finishes Phase 1: **the plan's 1E list, features across areas**. These are bigger than 1D's fixes. Most
are size M, and some touch saved records (Money, the Japanese schedule), so the rules for those rounds are stricter
and are named up front.

**The reviewer is not available while you work.** The user approves each round's plan in Antigravity. The reviewer
grades the whole branch at once after you finish, so you don't wait between rounds. That makes the stops matter
more: if a ticket needs something this brief does not allow, stop that ticket, write why in the Walkthrough with
numbers, and go on to the next.

## What is not in this batch

1E lists 23 items. Seven are not yours:

- **Already built by you (batches 2–4), so crossed off:**
  - `creatives#1` (Practice Log thumbnails);
  - `creatives#2` and `creatives#8` (Practice Log filters and 60-row batches). The one leftover piece of `#8` is
    ticket A1 below;
  - `creatives#4` (milestones linked to their work);
  - `money-goals#1` (the Year view's income bars);
  - `bk:ja-mind#1` (practise a lesson again without moving the schedule);
  - `rm:showcase-reorder` (the showcase order list).
- **Held back for design:** `rm:creatives-assistant`. The user wants Creatives' reviews sent to Gemini or Claude on
  the web, as Exams & Papers does, and that design comes first. Don't build it.

That leaves **16 tickets in five rounds**:

| Round | Area | Tickets |
|---|---|---|
| A | Page features | 6 |
| B | Code's runner status | 2 |
| C | Goals | 3 |
| D | Money | 3 |
| E | Japanese | 2 |

R1 still applies: reproduce each ticket on your branch before you edit it, and stop that ticket if it is already
true.

## 0 · Setting up (you, once)

Same folder (`/Users/fj/Developer/KurenaiOS-neon`). The user cuts `neon/qol-batch-6` from `origin/main`. Same
Antigravity settings as batch 5:

- model: Gemini 4 Neon, thinking HIGH;
- the plan and terminal commands need review;
- not Turbo.

## 1 · The prompt to paste

> You are Neon, the junior developer on KurenaiOS. Batch 5 passed with no note and shipped. This is batch 6, on branch
> `neon/qol-batch-6`, cut from `origin/main`: the plan's 1E list, 16 feature tickets in five rounds. The same senior
> reviewer (Claude) grades it line by line against `docs/qol/neon/REVIEW.md`, but only once the whole branch is done:
> the user approves your plans in the meantime.
>
> **Read before you plan anything:**
> 1. `docs/qol/neon/REPORT-5.md`: your batch 5 grade, and its "What to keep doing".
> 2. `docs/qol/neon/REVIEW.md`, section **R** above all (R1 reproduce first, R2 test before committing, R3 line
>    discipline). A fail on any R rule fails the ticket.
> 3. `AGENTS.md`; in `CLAUDE.md` the sections "Architecture", "Invariants" and "Files to edit deliberately";
>    `docs/ownership.md`.
> 4. For each ticket, the `docs/invariants/<domain>.md` file it names, in full for every id you cite. Rounds D and E
>    have a **contract** in §2 naming the invariants that must hold: read every one before planning those rounds.
> 5. The tickets: `docs/qol/neon/BRIEF-6.md` §2.
>
> **How to work:**
> - **Plan one round at a time.** `/plan` round A first, one section per ticket:
>   - how you will reproduce it (R1);
>   - the file and lines;
>   - the existing helper or pattern you will reuse, and where it lives;
>   - the invariants;
>   - any core-file exception you will use, quoting the brief's wording for it;
>   - the checks (that can fail) and the suites you will run before committing.
>
>   Wait for the user's approval. When a round is done, plan the next one the same way.
> - **Commits:** one commit per ticket: `feat(qol): <key> — <what changed>` (`fix(qol):` for A1), with the trailer
>   `Agent: Gemini 4 Neon (Antigravity)`. Stage by name. Push after each commit: `git push origin neon/qol-batch-6`.
> - **The end of a round:**
>   - run the full gate (`SMOKE_JOBS=3 npm test`);
>   - add that round's section to the Walkthrough;
>   - push;
>   - go straight on to plan the next round.
> - **The core files are off limits**, except for the exceptions written into a ticket in §2. Each exception is
>   exact: the file, what may change, and nothing else there.
>   - `js/core/store.js`, `js/core/cloud*.js`, `js/core/redraw.js`, `js/core/router.js`;
>   - `js/core/sessions.js`, `js/core/governor.js`, `js/core/ui.js`, `js/core/lazy.js`;
>   - `js/core/money.js`, `js/core/moneyimport.js`, `js/core/creatives.js`, `js/core/ja*.js`, `js/core/goals*.js`,
>     `js/core/reminders.js`, `js/core/achievements*.js`, `js/core/ach*.js`, `js/core/assignments.js`,
>     `js/core/mind*.js`, `js/core/report.js`, `js/core/srs.js`, `js/core/fsrs*.js`;
>   - `sw.js`, `index.html`, `js/main.js`, `js/env*.js`, `supabase/`, `art-source/`, `.claude/`, `docs/memory/`.
>
>   Never hand-edit the generated files (`js/data/compsci.js`, `maths.js`, `it.js`, `lazy-index.js`). Never move a
>   file between bundles. If a ticket seems to need anything else that is forbidden, stop that ticket and say so.
> - **1F split many pages into a boot part and a page part.** Edit page code in the page file:
>   - `achievementspage.js`, `assistantpage.js`, `calpage.js`, `reminderspage.js`, `wishlistpage.js`;
>   - `goals.js` (page-goals; the words Home reads are `goalwords.js`);
>   - `routines.js` (page-routines; `KOS.rtUI` is `rtkit.js`).
>
>   A function defined in a page file does not exist until its page loads. Another page that calls one loads its
>   bundle first, as `goals.js`'s "Add an exam first" does (`KOS.lazy.need("<bundle>").then(...)`). A ticker,
>   listener or registration never goes in a page file (invariant 168). After changing any file inside a
>   `<template data-lazy>` block, run `node tools/gen_lazy_index.mjs` and commit its output.
> - **Style, as before:**
>   - `k-` classes are presentational only; logic and tests read `data-ui`.
>   - Tokens for every value, and only the five width breakpoints.
>   - Spoken messages go through `KOS.a11y.announce`, and a toast speaks itself.
>   - Dialogs go through `KOS.ui.openDialog`, confirmations through `KOS.ui.confirm`, and an Undo is the toast
>     queue's action.
>   - A new interactive element gets:
>     - a `data-ui` hook in its area's naming;
>     - a real `<button>` or link;
>     - a hit area of 32 px (44 px on a coarse pointer).
>   - **Words:** sentence case, plain, and no "Successfully".
>   - **Layout:** a new panel or card leaves no empty column or gap at 1440 (CLAUDE.md, "Files to edit
>     deliberately").
>
> **Testing:**
> - **Per ticket, before its commit:**
>   - the suites the ticket names;
>   - anything else that greps for what you changed (`grep -l <name> tools/smoke*.test.js`);
>   - `node tools/gen_lazy_index.mjs --check` when the file is in a lazy bundle;
>   - the browser at 1470×832, 820×1180 and 375×812.
> - **New tests:** these are features, so each ticket of size M adds at least one step that fails without it.
>   Put them in a new suite, `tools/smoke198.test.js` (batch 6's own suite, in the style of `smoke196`). Check that
>   `npm test` runs it, and report the gate's new count.
> - **Boot budget:** run `node tools/smoke142.test.js` after any ticket that touches a file loaded at boot.
>   - On `main` today, boot has about **44 KB** free under 5.15 MB.
>   - Report boot bytes per round.
>   - If a ticket takes boot over, stop that ticket and say so.
> - **Gate:** at the end of each round, `SMOKE_JOBS=3 npm test`, with every suite passing. Paste the summary.
> - **Where to test:** the local test copy only (`python3 tools/dev_server.py 8765`; Settings › Data › Sample for a
>   filled-in account). Never sign in to anything, and never import a real bank statement: make a small test file.
>
> **The Walkthrough has one section per round.** For each ticket:
> - how you reproduced it;
> - the commit;
> - the files and lines;
> - the helper reused;
> - the invariants, and any exception used;
> - the suites run (in order: run, then commit).
>
> Then, per round:
> - screenshots;
> - the gate's summary;
> - boot bytes;
> - "Noticed, not touched";
> - your uncertainties.
>
> Copy the finished Walkthrough into the repo as `docs/qol/neon/WALKTHROUGH-6.md` (screenshots stay in Antigravity)
> and push it with the last commit, so the reviewer reads it from the branch.
>
> Don't claim something passed unless you ran it and saw it pass.

## 2 · The tickets

The key, where to look, and what is wrong. How to do it is part of the test, unless a ticket says otherwise. "Tests"
names the suites the reviewer knows of. Add any suite that greps what you change.

### Round A · Page features (6)

- **A1 `creatives#8`, the leftover** (S).
  - **Where:** the Practice Log rows (`js/modules/creatives.js`, `logPage`; `needsCheck(w)` at `:609`).
  - **What to do:** the filter has "Check to do" already. What is missing is the row itself: a saved study whose
    check is not passed shows a small "Check to do" pill, as the study card says. Reuse the chip the log already
    draws; no second filter.
  - **Invariants:** `spaces.md` 154, 156.
  - **Tests:** `smoke108`, `smoke131`, `smoke192`.
- **A2 `productivity#5`** Reminders: "Place in a free block" and "Focus on this" (M).
  - **Where:** the Reminders page's inspector (`js/modules/reminderspage.js`).
  - **What to do:**
    - "Place in a free block" offers today's free blocks from `KOS.today.build` and makes a study block with
      `KOS.calendar.addEvent`, with Undo. Reuse the Daily Review's `placeRow` (`js/modules/dayreview.js`),
      including its "Placed 15:30" state.
    - "Focus on this" opens the Focus page pre-filled (`KOS.show("focus", {...})`). It never starts a session itself
      (invariant 4e).
  - **Invariants:** `productivity.md` 147, 149; `core.md` 4e; `ui.md` 27, 45.
  - **Tests:** `smoke35`, `smoke101`–`smoke104`, `smoke193`.
- **A3 `productivity#9`** Calendar: "Skip this showing" for a repeating event (M).
  - **Where:** the event detail (`js/modules/calpage.js`) and the schema gate (`js/modules/calendar.js`,
    `normalise` and `occursOn`).
  - **Exception:** `js/modules/calendar.js` may gain one event field, `skip` (an array of ISO dates). It is read by
    `normalise` (kept only as valid dates, sorted, unique) and by `occursOn`, which returns false for a skipped
    date. It is the same idea as the Google link's `ext.g.skip` at `:420`.
  - **Rules:**
    - recurrence stays computed from one record, never copied (invariant 43);
    - an event linked to Google keeps its own path, and the action is not offered on it (invariant 159);
    - Skip has Undo, and the detail of a skipped date says so.
  - **Invariants:** `ui.md` 41, 43, 45, 46; `productivity.md` 158, 159.
  - **Tests:** `smoke35`, `smoke46`, `smoke87`, `smoke112`, `smoke196` W.
- **A4 `achievements-governor#3`** Autosave the Wall's showcase (S).
  - **Where:** the showcase editor (`js/modules/achievementspage.js`, `showcasePicker` and its draft; your D4 from
    batch 4).
  - **What to do:** a pick, a removal or a reorder saves at once, with Undo for a removal. The "Leave without
    saving?" guard then has nothing to guard: remove it, and its Save button with it.
  - **Invariants:** `core.md` 161–163; `ui.md` 66, 166; `study.md` 89a.
  - **Tests:** `smoke113`, `smoke136`, `smoke146`.
- **A5 `mind#3`** Review Mind's cards outside the Daily 15 (M).
  - **Where:** Mind's desk (`js/modules/mind.js`) and its runs (`js/modules/mindrun.js`). The due list is
    `KOS.mind.due(t)` in `js/core/mind.js`.
  - **What to do:** a "Review my Mind cards (N due)" entry on Mind's desk, shown only when cards are due. It runs
    the due cards with the same rating path the Daily 15 uses. If that path cannot run outside the Daily without a
    change to `js/core/mind*.js`, stop this ticket and say exactly what is missing.
  - **Invariants:** `spaces.md` 137 (Mind pays nothing for writing), 140; `study.md` 111.
  - **Tests:** `smoke109`, `smoke110`, `smoke111`.
- **A6 `bk:home-reports#2`** One subject registry for Reports (S).
  - **Where:** `js/core/report.js:30` (`var SUBJECTS = ["compsci", "maths", "it"]`), and the hard-coded subject
    maps in `js/modules/reports.js` (`:34`, `:44`, `:1084`).
  - **Exception:** `js/core/report.js` may change that one line to read `KOS.subjects` (the exam subjects, as
    `reports.js:39` already does). Nothing else there.
  - **Rules:** a report's facts are computed once and saved (invariants 101, 102). A saved report is never
    recomputed, so a page draws whatever subjects a saved report holds. An old report with three subjects still
    draws.
  - **Invariants:** `productivity.md` 100–102a; `spaces.md` 103.
  - **Tests:** `smoke69`, `smoke70`, `smoke142`.

### Round B · Code's runner status (2)

- **B1 `bk:code-space#1`** One runner status shared by tasks, listings, retrieval and capstones (M). Do this before
  B2.
  - **Where:** `js/core/coderun.js` (`runtime()` at `:90`, `status()` at `:256`) and the places that run code
    (`js/core/codeui.js`, `js/modules/code.js`, `codecap.js`, `codetopic.js`).
  - **What to do:** one status per runner: booting, ready, busy or failed. Every Run button reads it, so a time-out
    while a runner boots never reads as the learner's code being wrong.
  - **Rules:** learner code still runs only on the device, in sealed workers with the watchdog (invariant 105).
    Don't change a time-out value or the watchdog itself.
  - **Invariants:** `spaces.md` 104, 105, 106, 108.
  - **Tests:** `smoke70`, `smoke73`, `smoke75`, `smoke76`, `smoke77`, `smoke196` T. Run
    `node tools/cs_wasm_check.mjs` if you touch the full runtime's path.
- **B2 `code-space#1`** Run says what it is waiting for (S).
  - **What to do:** while a runner boots, Run shows "Loading SQLite…" or "Starting .NET…" from B1's status, and the
    time limit is shown beside it.
  - **Invariants and tests:** as B1.

### Round C · Goals (3)

- **C1 `bk:goals#3`** Japanese and Mind goal types (S).
  - **Where:** the type registry (`js/core/goals.js`; `G.register` in `goals-exams.js:85` shows the shape).
  - **Exception:** `js/core/goals.js` may gain new `G.register({...})` calls for these types, in the existing
    pattern, and nothing else there.
  - **The types:** Japanese facets reviewed; Japanese lessons finished; Mind Daily 15 days kept. Each one is
    measured by reading its owner's record. A goal stores no progress of its own.
  - **Invariants:** `core.md` 5b; `spaces.md` 112, 116, 137.
  - **Tests:** `smoke84`, `smoke85`, `smoke86`, `smoke87`, `smoke146`.
- **C2 `shop-cosmetics#2`** "Save gold for X" as a goal (M).
  - **Exception:** as C1: one new type in `js/core/goals.js`. Its target is the item's price, and its current
    value is the gold balance. It is met when the gold reaches the price.
  - **What to do:** the Shop's "Pin as a goal" also offers "Add to Goals", so the pin shows with the other goals.
  - **Rules:**
    - gold gates only labs, simulations and uploading your own picture (invariant 2);
    - a goal pays nothing, and the goal never buys (W5 42d: buying always asks first).
  - **Invariants:** `core.md` 1, 2, 5b.
  - **Tests:** `smoke117`, `smoke146`, `smoke160`, `smoke162`.
- **C3 `bk:goals#2`** "Make this a goal" where the data lives (M).
  - **Where to add it:** a routine, a Money pot, an exam's readiness, a Collection title, and a Money budget.
  - **What to do:** each opens the goal editor pre-filled: `KOS.goalsUI.newGoal(preset)` (`js/modules/goals.js:772`).
    The editor is in `page-goals`, so each entry point loads it first with `KOS.lazy.need("page-goals")`.
  - **Rules:** a goal links to its source through its existing link fields (for an exam, `links.examId`, invariant
    128). No new link field.
  - **Invariants:** `core.md` 5a, 5b; `exams.md` 128, 129; `media.md` 6.
  - **Tests:** `smoke84`–`smoke87`, `smoke146`, plus each page's own suites.

### Round D · Money (3)

**The contract for round D.** Read each of these in full before planning:

- `core.md` **5a**: Money has zero Governor and network traffic, amounts are integer minor units, and imports are
  undoable;
- `ui.md` **43**: a repeat is computed from one rule, never copied;
- `sync.md` **31**, **32**, **33a** and **36d**: transactions live in `kurenai-os-money` with tombstones and stable
  ids, and replicate through the side sync.

Every write goes through `KOS.money`'s existing functions. The only exception is D1's, and it is exact. Test with a
small file you make. Never import a real statement.

- **D1 `bk:money-goals#3`** What a Santander student needs from an import (S).
  - **Where:** `js/core/moneyimport.js` (the readers, and `guess` at `:134`).
  - **Exception:** `js/core/moneyimport.js` may gain one pure function that tidies a merchant name, called where a
    row's name is set. For example, "HERON FOODS HOYLAND (VIA APPLE PAY), ON 29-10-2026" becomes "Heron Foods
    Hoyland". The statement's own text is kept on the row (its note or raw field), so nothing is lost.
  - **Tests:** `smoke149` (and its golden rows), `smoke84`.
- **D2 `bk:money-goals#4`** Import history (S).
  - **What to do:** a page (Money › Imports) listing every import with its file name, date range and counts
    (added, duplicates, unreadable), and its existing Undo.
  - **Rules:** derive the list from the transactions' own import identity. If rows carry no import id, stop this
    ticket and say what is missing: don't add a store.
  - **Tests:** `smoke149`, `smoke84`–`smoke87`.
- **D3 `bk:money-goals#6`** A "Not yet confirmed" queue for Recurring (M).
  - **Where:** `KOS.money.occurrences` (`:405`), `confirm` (`:465`), `skip` (`:495`) and `confirmWith` (`:1603`),
    with no change to them.
  - **What to do:** every past occurrence that is neither confirmed nor skipped, with:
    - Confirm, Skip, and Confirm all / Skip all, which ask first and have Undo;
    - a suggested match to an imported row of the same amount within a few days. The match is confirmed through
      `confirmWith` only on the user's press, never automatically.
  - **Tests:** `smoke84`–`smoke87`, `smoke149`.

### Round E · Japanese (2)

**The contract for round E.** Read each of these in full before planning:

- `study.md` **111**: one scheduler, and renders never write;
- `study.md` **111b**: how a flashcard leech comes back (`KOS.srs.unleech`, `js/core/srs.js:264`), which E1
  mirrors;
- `spaces.md` **113**: a facet's grade comes from the validator's verdict and is never chosen;
- `spaces.md` **114** and **116**: pay goes through `KOS.ja.award`, a session is one ledger entry, and self-marked
  work pays nothing;
- `core.md` **4a** and **4e**: Focus pay is one definition, and set-up happens only on the Focus page.

- **E1 `bk:ja-mind#4`** Leech recovery (M).
  - **Where:** `js/core/jasrs.js` (`LEECH` at `:28`, `leech(f)` at `:104`). A leech is left out of the queue
    (`:115`) and never comes back.
  - **Exception:** `js/core/jasrs.js` may gain one exported `unleech(key)` that mirrors `KOS.srs.unleech`: it
    brings the facet back into the schedule and lets it be set aside again after more lapses (a `leechBase`, as
    flashcards do). Its lapse history is never erased. Nothing else in `ja*.js` changes.
  - **What to do:** the Japanese desk lists set-aside facets with "Relearn from the lesson" (opens the lesson) and
    "Back in the schedule" (`unleech`, with Undo).
  - **Tests:** `smoke82`, `smoke83`, `smoke115`–`smoke117`, `smoke132`, `smoke148`; `node tools/ja_valid_check.mjs`.
- **E2 `bk:ja-mind#5`** Logging immersion through Focus (M).
  - **What to do:** the Focus page offers Japanese immersion (input: watching, reading, listening) as a choice for
    a session on Japanese. It is an ordinary Focus session tagged as immersion, paid by `KOS.governor.focusAward`
    as any Focus session is (4a). There is no second pay rule. The Japanese desk shows immersion minutes, read from
    the ledger.
  - **Rules:** if this needs a change to `js/core/sessions.js`, `governor.js` or `ja*.js`, stop and say what is
    missing.
  - **Invariants:** as the contract, plus `core.md` 3 and 4.
  - **Tests:** `smoke3`, `smoke61`, `smoke82`, `smoke116`, `smoke142`.

## 3 · When you finish

Push the last commit with `docs/qol/neon/WALKTHROUGH-6.md`, then tell the user the branch is done. The reviewer grades
it as `REPORT-6.md`, merges it, and deploys it with the user's go-ahead. That closes Phase 1.
