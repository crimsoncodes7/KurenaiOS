# Neon's handoff brief: batch 5 (the whole of 1D)

Batch 4 passed with no note and is merged into `main`. It shipped in `kos-qol-2`. Your grade is in
`docs/qol/neon/REPORT-4.md`: read it first.

This batch is much larger: **all of 1D, the plan's daily-friction list, 39 tickets**. They are all small (S), and each
one sits inside one area. They come in five **rounds**:

- **Rounds A–D** (33 tickets) start now.
- **Round E** (6 tickets) waits until the reviewer's 1F work is on `main`. Its files are the ones 1F splits apart.

The reviewer grades each round as it lands, so you don't wait between rounds A–D.

Four of 1D's 43 open items are not yours:

- `study-core#1` and `shell#5` need `js/core/ui.js`.
- `productivity#6` changes the boot path that 1F rewrites.
- `achievements-governor#1` (an Undo on a shop purchase) is closed by the user's own decision W5 42d: buying asks
  first, with no timed Undo (`governor-ui.js:1043`). Don't build it.

Every ticket was checked on 19–20 November and is still open, but R1 still applies: reproduce it on `origin/main`
before you edit it, and stop that ticket if it is already true. Several are marked "partly" in the plan. For those,
your R1 says exactly which part is missing.

## 0 · Setting up (you, once)

Keep the same folder (`/Users/fj/Developer/KurenaiOS-neon`). The reviewer gives the user the exact command to cut
`neon/qol-batch-5` from `origin/main`. The Antigravity settings are the same as batch 4:

- model: Gemini 4 Neon, thinking HIGH;
- the plan and terminal commands need review;
- not Turbo.

## 1 · The prompt to paste

> You are Neon, the junior developer on KurenaiOS. Batch 4 passed with no note and shipped. This is batch 5, on branch
> `neon/qol-batch-5`, cut from `origin/main`: the whole of the plan's 1D list, 39 small tickets in five rounds. The same
> senior reviewer (Claude) grades it line by line against `docs/qol/neon/REVIEW.md`, round by round.
>
> **Read before you plan anything:**
> 1. `docs/qol/neon/REPORT-4.md`: your batch 4 grade. Keep its three habits:
>    - stop with numbers when something is in the way;
>    - make every check count something;
>    - read the brief's options as options.
> 2. `docs/qol/neon/REVIEW.md`, section **R** above all (R1 reproduce first, R2 test before committing, R3 line
>    discipline). A fail on any R rule fails the ticket.
> 3. `AGENTS.md`; in `CLAUDE.md` the sections "Architecture", "Invariants" and "Files to edit deliberately";
>    `docs/ownership.md`.
> 4. For each ticket, the `docs/invariants/<domain>.md` file it names, in full for every id you cite.
> 5. The tickets: `docs/qol/neon/BRIEF-5.md` §2.
>
> **How to work:**
> - **Plan one round at a time.** `/plan` round A first, one section per ticket:
>   - how you will reproduce it (R1);
>   - the file and lines;
>   - the existing helper or pattern you will reuse, and where it lives;
>   - the invariants;
>   - the checks (that can fail) and the suites you will run before committing.
>
>   Wait for approval. When a round is done, plan the next one the same way.
> - **Commits:** one commit per ticket: `fix(qol): <key> — <what changed>`, with the trailer
>   `Agent: Gemini 4 Neon (Antigravity)`. Stage by name. Push after each commit: `git push origin neon/qol-batch-5`.
> - **The end of a round:**
>   - run the full gate (`SMOKE_JOBS=3 npm test`);
>   - add that round's section to the Walkthrough;
>   - push;
>   - go straight on to plan the next round.
>
>   Don't start round E until the user tells you the reviewer's 1F work is on `main`. Then
>   `git fetch origin && git merge --no-edit origin/main` first, and say so in the Walkthrough.
> - **The core files are off limits:**
>   - `js/core/store.js`, `js/core/cloud*.js`, `js/core/redraw.js`, `js/core/router.js`;
>   - `js/core/sessions.js`, `js/core/governor.js`, `js/core/ui.js`, `js/core/lazy.js`;
>   - `js/core/money.js`, `js/core/creatives.js`, `js/core/ja*.js`, `js/core/goals*.js`, `js/core/reminders.js`,
>     `js/core/achievements*.js`, `js/core/ach*.js`, `js/core/assignments.js`, `js/core/mind*.js`;
>   - `sw.js`, `index.html`, `js/main.js`, `js/env*.js`, `supabase/`, `art-source/`, `.claude/`, `docs/memory/`.
>
>   **One exception:** `ja-mind#4` may change the one `name` string it names in `js/core/achcatalogue.js`, and
>   nothing else there.
>
>   Never hand-edit the generated files (`js/data/compsci.js`, `maths.js`, `it.js`, `lazy-index.js`). If a ticket
>   seems to need a forbidden file, stop that ticket and say so.
> - **Rounds A–D also stay out of 1F's files until round E:**
>   - `js/modules/focus.js`, `js/modules/assistant.js`, `js/core/aitools.js`;
>   - `js/modules/calendar.js`, `js/modules/reports.js`;
>   - `js/modules/medview.js`, `anime.js`, `books.js`, `vn.js`, `games.js`, `wishlist.js`.
> - **Style, as before:**
>   - `k-` classes are presentational only; logic and tests read `data-ui`.
>   - Tokens for every value, and only the five width breakpoints.
>   - Spoken messages go through `KOS.a11y.announce`, and a toast speaks itself.
>   - Dialogs go through `KOS.ui.openDialog`, confirmations through `KOS.ui.confirm`, and an Undo is the toast
>     queue's action (as D6 did).
>   - A new interactive element gets:
>     - a `data-ui` hook in its area's naming;
>     - a real `<button>` or link;
>     - a hit area of 32 px (44 px on a coarse pointer).
>   - **Words:** sentence case, plain, and no "Successfully".
>
> **Testing:**
> - **Per ticket, before its commit:**
>   - the suites the ticket names;
>   - anything else that greps for what you changed (`grep -l <name> tools/smoke*.test.js`);
>   - `node tools/gen_lazy_index.mjs --check` when the file is in a lazy bundle;
>   - the browser at 1470×832 and 820×1180.
>
>   A layout ticket also needs 375×812 (the phone) and the measurement that proves it: widths, a gap that is gone.
> - **Boot budget:** run `node tools/smoke142.test.js` after any ticket that touches a file loaded at boot.
>   - On `main` today, boot has **9,720 bytes** free under 7.77 MB.
>   - Report boot bytes per round.
>   - If a ticket takes boot over, stop that ticket and say so. Don't move files between bundles.
> - **Gate:** at the end of each round, `SMOKE_JOBS=3 npm test`, with every suite passing. Paste the summary.
> - **Where to test:** the local test copy only (`python3 tools/dev_server.py 8765`; Settings › Data › Sample for a
>   filled-in account). Never sign in to anything.
>
> **The Walkthrough has one section per round.** For each ticket:
> - how you reproduced it;
> - the commit;
> - the files and lines;
> - the helper reused;
> - the invariants;
> - the suites run (in order: run, then commit).
>
> Then, per round:
> - screenshots;
> - the gate's summary;
> - boot bytes;
> - "Noticed, not touched";
> - your uncertainties.
>
> Don't claim something passed unless you ran it and saw it pass.

## 2 · The tickets

The key, where to look, and what is wrong. How to do it is part of the test, unless a ticket says otherwise. "Tests"
names the suites the reviewer knows of. Add any suite that greps what you change.

### Round A · Study (7)

- **A1 `study-core#3`** Relative dates.
  - **Where:** assignment rows (`js/modules/assignments.js:44` say "Overdue · N days") and the study editor's dates
    (`js/modules/editor.js`).
  - **What to do:** both read as "due 29 Oct" or "4 days overdue". Reuse the date wording that assignments already
    has; don't write a second one.
  - **Invariants:** `ui.md` 27, 77.
  - **Tests:** `smoke33`, `smoke34`, `smoke104`.
- **A2 `study-core#4`** Card stats' table.
  - **Where:** `js/modules/cardstats.js:~344`. The last column ("charts →", `:357`) has an empty header.
  - **What to do:** give it a header, or make the whole row the link. Argue your choice in the plan; a row link must
    stay a real link or button with its name.
  - **Invariants:** `ui.md` 67, 68.
  - **Tests:** the suites that grep `cardstats`.
- **A3 `study-core#5`** The Remove resource dialog.
  - **Where:** `js/modules/subject.js:688`.
  - **What's wrong:** it says the resource "will be removed from the table", and there is no table. Name what it is
    removed from.
  - **Invariants:** `ui.md` 49.
- **A4 `study-core#6`** Card stats' targets.
  - **Where:** `js/modules/cardstats.js:283,292`.
  - **What's wrong:** changing the retention or exam-day target only redraws. Show a toast naming the new value.
  - **Invariants:** `ui.md` 66, 165; `study.md` 111.
- **A5 `study-core#8`** The flashcard session's end.
  - **Where:** `js/engines/flashcards.js:433`.
  - **What's wrong:** the end of every session says "N cards graduated", even when the cards moved only a few days.
    Say "N reviewed". Name "graduated" only where it is true, if the engine knows that.
  - **Invariants:** `study.md` 111.
  - **Tests:** the suites that grep `graduated` or `fc.`.
- **A6 `content-maths#4`** Worked steps on a phone.
  - **Where:** `css/views/study.css:352`. Each step (`.k-n-wrow`) keeps an 84 px label column at every width.
  - **What to do:** at the phone tier (700, a width that already exists), put the label above the working, so the
    maths gets the full width.
  - **Invariants:** `ui.md` 47, 48.
  - **Check:** measure the working's width at 375 before and after.
- **A7 `code-space#2`** A capstone's Result step.
  - **Where:** `js/modules/codecap.js:547`.
  - **What's wrong:** the "missing" items are buttons styled as muted text (`.k-link` in `css/components.css:23`), so
    they don't look clickable. Make them look like the links they act as, without changing `.k-link` for everyone.
  - **Invariants:** `ui.md` 26, 67, 69.

### Round B · Code and Creatives (9)

- **B1 `code-space#3`** The runtime dialog.
  - **Where:** `js/modules/code.js:1299-1322`.
  - **What to do:** show the download size beside the on-device size: "≈ 11 MB download · 30 MB on this device".
  - **Note:** both numbers are in the runtime's own manifest (`KOS.codeRun.runtimeSize()`).
  - **Invariants:** `spaces.md` 105.
- **B2 `exams-files-ink#3`** One file-size formatter.
  - **Where:** `KOS.ui.bytes` (`js/core/ui.js:371`) is the shared one. Private MB formatting remains at
    `js/modules/code.js:1322` and `js/core/codeui.js:317`.
  - **What to do:** use `KOS.ui.bytes` there. Don't change `ui.js`.
  - **R1:** list every other private copy you find with grep. Fix the ones in Code; name the rest under "Noticed".
  - **Invariants:** `ui.md` 50.
- **B3 `code-space#5`** After a task passes.
  - **Where:** the task page (`js/modules/code.js`, the results after a pass) and `js/modules/codetopic.js:410`.
  - **What's wrong:** only the end of a lesson offers "Next lesson ›".
  - **What to do:** after a task passes, offer "Next task" (the lesson's next unpassed task), or "Back to the lesson"
    when none is left.
  - **R1:** also report whether the task clock really keeps running after a pass. If it does, say so; don't fix it in
    this ticket.
  - **Invariants:** `spaces.md` 106–108.
  - **Tests:** `smoke73`, `smoke75`.
- **B4 `creatives#3`** Empty states with no action.
  - **Where:** the Practice Log (`js/modules/creatives.js` ~588) and the Writing Desk's "No drafts yet"
    (`js/modules/crwrite.js:82`).
  - **What's wrong:** neither has an action. Give the log "Start A1.1" (or the current lesson), and the Desk
    "New draft".
  - **Note:** the desk's own Start-here card (`creatives.js:212-216`) is the pattern.
  - **Invariants:** `spaces.md` 154, 156; `ui.md` 53.
- **B5 `creatives#7`** The subject strip.
  - **Where:** `js/modules/creatives.js:38` (`KOS.crPages`) and `:69`.
  - **What's wrong:** the strip lights "Creatives" on every page outside `KOS.crPages`: the log, settings, the
    check and the project.
  - **What to do:** light "Practice Log" or "Settings" on their own pages.
  - **Invariants:** `ui.md` 50, 50b.
- **B6 `creatives#9`** Taking a piece out of the Portfolio.
  - **What's wrong:** "Take out" calls `promote(wid, false)` and redraws, with no word.
  - **What to do:** show a toast with Undo that promotes it back.
  - **Invariants:** `spaces.md` 156; `ui.md` 66.
- **B7 `creatives#10`** Writing Desk versions.
  - **Where:** `js/modules/crwrite.js:194`. There is only "Compare with now".
  - **What to do:** add "Restore this version". Restoring keeps the current text as a version first, so nothing is
    lost, and offers Undo.
  - **Invariants:** `spaces.md` 154, 156.
- **B8 `creatives#11`** References.
  - **Where:** `js/modules/crrefs.js:31`. "Next" draws a random seed.
  - **What to do:**
    - add "Previous" (back through the seeds seen this visit);
    - add a way to type a seed.
  - **Note:** the page says that the same seed gives the same drawing.
  - **Invariants:** `spaces.md` 154.
- **B9 `creatives#12`** The Sketchbook brief's side card.
  - **What's wrong:** "Given / Your one variable" is a 122 px label column beside a 125 px answer column. At 1470,
    "Your one variable" wraps to about five lines (sketchbook A1.1.a).
  - **What to do:** stack the label over the value in the side card.
  - **Invariants:** `ui.md` 47.
  - **Check:** measure the line count before and after.

### Round C · Productivity, Home, Goals, Money (6)

- **C1 `productivity#1`** The Daily Review's Time left.
  - **Where:** `js/modules/dayreview.js:640-645`. Placing an item makes a study block, with an Undo.
  - **What to do:**
    - **R1:** whether the row and its free block stay offered after placing. If they do, mark the row
      "Placed 15:30" and take that free block away, so the same item can't be placed twice.
    - Undo puts both back.
  - **Invariants:** `productivity.md` 144–147.
  - **Tests:** the suites that grep `dayreview` or `rv.`.
- **C2 `productivity#4`** The routine player on a Mac.
  - **Where:** `js/modules/routineplayer.js:75` (✕) and `:108` ("Close").
  - **What's wrong:** both close the player. Keep one, and say which and why. The leave guard stays as it is.
  - **Invariants:** `ui.md` 49, 166; `productivity.md` 142–143.
- **C3 `productivity#8`** Routine History.
  - **What's wrong:** the player already shows "kept late" (`routineplayer.js:77`, PR-35), and `routines.js` stores
    the late time.
  - **What to do:** R1 whether History shows it; if not, show "kept late" there for that day.
  - **Invariants:** `productivity.md` 142, 148.
- **C4 `home-reports#1`** The Routines header on Home.
  - **Where:** `js/modules/home.js:422`.
  - **What's wrong:** while a routine is due, "<routine> due now" replaces "N of M habits today".
  - **What to do:** show both.
  - **Invariants:** `ui.md` 53, 77; `productivity.md` 149.
- **C5 `goals#4`** The Home goal ring.
  - **Where:** `js/modules/home.js` ~925, `data-ui` `home.goal-num`.
  - **What's wrong:** the number in the ring is `aria-hidden` and has no visible label.
  - **What to do:** say what it is ("days left"), visibly and to a screen reader, without making the ring larger.
  - **Invariants:** `core.md` 5b; `ui.md` 68, 76.
- **C6 `money-goals#4`** Overview's "Safe to spend" card.
  - **What's wrong:** in the low-data state, the spacer that pushes In/Out to the card's bottom (`.k-mn-spacer`) leaves
    a ~77 px gap at 1470 and on iPad landscape. With a figure it is 52 px.
  - **What to do:** keep the bottom alignment where the card has a figure, and close the gap where it doesn't.
  - **Check:** measure the gap at both sizes.
  - **Invariants:** `core.md` 5a; `ui.md` 47, 77.
  - **Tests:** `smoke84`–`smoke87`.

### Round D · Japanese, Mind, the Wall, the Shop, the shell (11)

- **D1 `mind#2`** The Big Question from the Daily.
  - **Where:** Journal entries of kind question offer "Make it the Big Question" (`js/modules/mind.js:335`).
  - **What to do:** offer the same at the Daily's capture step when what you capture is a question. Use the same
    write the Journal uses, not a second one.
  - **Invariants:** `spaces.md` 137–139.
  - **Tests:** `smoke109`–`smoke111`.
- **D2 `mind#5`** The Path page.
  - **Where:** `js/data/mind.js:23` gives each head a `purpose`. The section heads (`js/modules/mind.js:258-264`) show
    only the name and the path count.
  - **What to do:** show the purpose as the head's one sub-line.
  - **Invariants:** `ui.md` 50a.
- **D3 `ja-mind#2`** The ordinary session's end card.
  - **Where:** `js/modules/jarun.js` ~549. A lesson that isn't passed already has "Try the misses again"
    (`ja.retry-misses`).
  - **What to do:** list which answers were missed, and offer the same retry. It pays nothing and schedules nothing.
  - **Note:** reuse `reask`, as C4 did in batch 3.
  - **Invariants:** `spaces.md` 113, 114, 116.
  - **Tests:** every suite that greps `jarun`; `node tools/ja_valid_check.mjs`.
- **D4 `ja-mind#4`** The two "Hiragana" badges.
  - **Where:** `js/core/achcatalogue.js:357` (all 46 held) and `:651` (the checkpoint passed) share one name.
  - **What to do:** name the second one apart. This is the one string you may change in that file.
  - **R1:** check that a name change doesn't touch an earned tier: the id stays. Invariant 162.
  - **Invariants:** `core.md` 161–163.
  - **Tests:** `smoke113`, `smoke136`, `smoke146`.
- **D5 `achievements-governor#2`** The Wall's Recent tab.
  - **Where:** `drawRecent` (`js/modules/achievements.js:359-380`) lists one row per tier.
  - **What's wrong:** a badge that earned three tiers in one sweep fills three rows.
  - **What to do:** group them into one row ("Regular I–III").
  - **Invariants:** `core.md` 161, 163.
- **D6 `achievements-governor#4`** Titles.
  - **Where:** `detail()` (`js/modules/achievements.js:499`).
  - **What's wrong:** it redraws the side panel, but on a narrow screen the panel is below the fold.
  - **What to do:** scroll the detail into view on tap, and move focus as the shared pattern does.
  - **Invariants:** `ui.md` 65, 166.
- **D7 `shop-cosmetics#1`** The Shop stage's owned chips.
  - **Where:** `js/modules/governor-ui.js:1135` (`Object.keys(kinds).slice(0, 5)`).
  - **What's wrong:** it shows five kinds of up to 13, and says nothing about the rest.
  - **What to do:** add "+N more".
  - **Invariants:** `ui.md` 77.
- **D8 `shop-cosmetics#3`** The preview sheet.
  - **Where:** `governor-ui.js:1272`.
  - **What's wrong:** for an unaffordable item already pinned, the sheet says "Pinned" with the same Pin action.
  - **What to do:** offer Unpin there, as the stage does (`:1142`).
  - **Invariants:** `core.md` 2.
- **D9 `shop-cosmetics#4`** Outfits at 1470.
  - **What's wrong:** 7 cards in a 4-column grid leave an empty fourth cell.
  - **What to do:** centre the last row, or use columns that suit 7, without a new breakpoint.
  - **Check:** measure at 1470, 1240 and 820.
  - **Invariants:** `ui.md` 47.
- **D10 `shop-cosmetics#5`** The Edit seat dialog.
  - **What's wrong:** the empty "Upload an image" tile sits alone in a 2-column row (178 of 365 px), and its
    "2400 × 1350 or larger" line wraps.
  - **What to do:** let it fill the row.
  - **Check:** measure before and after.
  - **Invariants:** `ui.md` 47.
- **D11 `shell#4`** The hold-⌘ sheet.
  - **Where:** `js/core/desk.js:39-45` (`SHORTCUTS`).
  - **What's wrong:** the groups are one fixed list (Anywhere, Ink, PDF, Flashcards), shown on every page.
  - **What to do:** show "Anywhere", then only the group that belongs to the current page, first. Do it in `desk.js`
    only, from the route (`KOS.router` read-only).
  - **Invariants:** `ui.md` 64, 66.

### Round E · after 1F is on `main` (6)

- **E1 `productivity#2`** The Calendar's week view.
  - **Where:** `js/modules/calendar.js` ~1946.
  - **What's wrong:** a week holding today centres on now, even at 05:00.
  - **What to do:** when now is outside working hours, open on the first event, or 07:00.
  - **Invariants:** `ui.md` 74; `productivity.md` 147.
- **E2 `productivity#3`** The Focus mini player on a Mac.
  - **Where:** `js/modules/focus.js` ~1506.
  - **What's wrong:** the row is the grip, the ring, the clock, pause and expand. The ring is barely readable, and
    there is no subject.
  - **What to do:** show the subject or objective beside the clock.
  - **Invariants:** `core.md` 4c–4e.
- **E3 `assistant-archive#2`** Settings › Assistant › Permissions.
  - **Where:** `js/modules/assistant.js` ~2606.
  - **What's wrong:** the filter matches the tool's name only.
  - **What to do:** match the tier ("ask", "blocked") too.
  - **Invariants:** `ui.md` 71a.
- **E4 `collection#4`** Wishlist's Mark purchased.
  - **What's wrong:** it has no Undo. The vault delete already has one (`medview.js` ~1297); that is the pattern.
  - **Invariants:** `media.md` 15; `ui.md` 66.
- **E5 `collection#5`** A filtered empty vault.
  - **Where:** `anime.js:390-396`, and the same in `books.js`, `vn.js` and `games.js`.
  - **What's wrong:** it shows Sync and Find.
  - **What to do:** make "Clear filters" the primary action there. Keep Sync and Find for an empty vault with no
    filter.
  - **Invariants:** `ui.md` 56, 58.
- **E6 `home-reports#2`** Reports' Topics tile.
  - **Where:** `js/modules/reports.js:770,1123`.
  - **What's wrong:** it has a caption only when some topics are left to green.
  - **What to do:** give it one always, e.g. "all green" or the count.
  - **Invariants:** `productivity.md` 102a; `ui.md` 77.

## 3 · What the reviewer is doing meanwhile

Claude works on **1F, speed**: bringing boot from 7.77 MB towards ~4 MB. Focus, the Assistant, `aitools`, the
Calendar, Reports and the vaults are split into a boot part and a page part, and boot timings are shown in Storage. It
also does the three 1D items kept from you (`study-core#1`, `shell#5`, `productivity#6`), then 1E.

To keep the merge clean:

- 1F stays out of the files your rounds A–D touch.
- You stay out of 1F's files (listed above) until round E.
- If you need a file outside your tickets, say so in the Walkthrough rather than editing it.
