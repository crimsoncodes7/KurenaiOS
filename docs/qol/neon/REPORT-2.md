# Neon's second branch: the grade

`neon/qol-batch-2` (14e2d12): five commits, 21:18 to 21:37 on 19 November 2026, one per ticket,
then the full gate.

Graded against `REVIEW.md` (sections R and A–F, and the batch 2 table) from:
- the diff (`git diff origin/main...origin/neon/qol-batch-2`);
- Neon's plan and Walkthrough (Antigravity session `554582e8…`, 10 new screenshots);
- the reviewer's own browser check at 1470×832 and 820×1180, on a fresh origin with seeded data;
- the reviewer's own gate run: 177 / 177 in a fresh checkout (C# runtime linked in).

**Verdict (20 November, after the fix-up `e0fee7d`): passes, with notes.** Merged to `main`. The first
grade, "not yet: one fix-up", is kept below as it was written; the re-check is at the end.

B3 has a real bug that its own check could not see, and that is a fail on A1. Everything else holds.
The fix is one line, and the "Fix-up" section at the end is written to paste to Neon.

## The three rules

| Rule | Grade | Evidence |
|---|---|---|
| R1 · Reproduce first | pass | All five tickets show the missing behaviour on `origin/main` before any edit: smoke119's FIXED line, the day bar that did nothing, the Practice Log of 68 rows, the `<small>` that could not be clicked, and a before/after table of every subject's chip. B5's one difference (IT's colon becoming a middle dot) was reported and kept, as the brief asked. |
| R2 · Test before committing | pass | Commits are 3 to 7 minutes apart, and each ticket's Walkthrough lists its suites, then the commit. B2's live check caught a bug (a Moves filter left over when opening a day) and fixed it before committing. |
| R3 · Line discipline | pass with notes | Untouched neighbours went under "Noticed, not touched" (the class read in the chart's hover handler, `workRow`'s missing "check to do" pill). One rule reaches further than needed: B4's `.k-cr-project .k-link { min-block-size }` also changes the existing Mark done and Undo links. |

## Its claims, checked

- **Gate:** "177 / 177 (smoke32 passed alone after failing under load)". The reviewer's run: 177 / 177, none needing a re-run. **True.**
- **B2:** every claim was true in the browser.
  - A day bar opens Transactions for that day, with the range control naming it ("Wed 18 Nov") and only that day's entries showing.
  - Enter on the focused chart does the same.
  - A future day does nothing.
  - Choosing another range from the select drops the day option.
  - Pots' "Transactions →" opens with Moves pressed, showing the transfer only.
- **B3, filters and batches:** true. 60 rows, "Show 12 more · 60 of 72 shown", then all 72. "19 of 72 pieces" for Writing. The empty state offers Clear filters. Nothing is written to the state.
- **B3, the deep link:** "cleared the conflicting filter, expanded past row 60, highlighted the row and opened it". **The first and last parts are true; "expanded past row 60" is not.**
  - Its script only checked that *some* row had `data-state="open"`. It never checked where that row was, or how many rows there were.
  - What the code does is prepend the piece at the top, for every deep link (see B3 below).
  - This is not a fabricated result: the observed parts were measured. But one sentence of the Walkthrough described the plan, not what was seen. That is a note on A3.
- **B4, B5:** true. The milestone's "✓ work saved" is a button that opens the work. "‹ Writing 1 lessons" goes to `#/ref/creatives/W1.1`. The chips read `IT · Data Analytics`, `CS · Homework`, `No subject · Homework`.

## Per ticket

| Ticket | Grade | Notes |
|---|---|---|
| B1 smoke119 | pass | One line removed by hand, not re-recorded; the suite then lists nothing as FIXED. Exactly the answer. |
| B2 `money-goals#2/#3` | pass with notes | Built on `visit.tx.range` / `txRange()` and the existing kind control, with no new state and no core change, as asked. The Walkthrough's invariants line cites `core.md 6` and `spaces.md 159–162`, which do not exist. Its plan cited the right ones (5a, 168), so this is a copying slip in the write-up, not a missed read. The Walkthrough also names `M().fmtDay` for the label where the code uses `dayLabel`. |
| B3 `creatives#2/#8` | **fail (A1)** | Filters and batches are right, and so is the reuse (`KOS.view.memo`, the `files.js` Show more wording, pill selects). The deep link is broken; see below. |
| B4 `creatives#4` | pass with notes | `openWork`/`openUnit` reused, no new route, a real `<button>`, and the back link only on the standalone page, not inside the topic's Project tab (a good call). Two notes. (1) The CSS rule widens every link in the card, not only the two new ones. (2) The accessible name "Open saved work for milestone 1" does not contain the visible words "✓ work saved", so someone using voice control who says "click work saved" misses it (WCAG 2.5.3, label in name). |
| B5 subject chips | pass | The before/after table is exactly what R1 asked for. |

### B3's bug

Every deep link to a piece (`#/creatives/log/<id>`, used by search and by CR-01) draws that piece twice, and counts it twice.

Seen on a log of 72 pieces, opening the fourth piece:
- it is drawn at the top and again in its own place;
- the button reads "Show 13 more · 60 of 73 shown", while the head reads "72 pieces".

On `origin/main` the piece appears once, so this is a regression.

**Why it happens:**
- `target = CR().work(wid)` returns a **copy** of the record, not the object inside `CR().works()`.
- So `rows.indexOf(target)` is always -1.
- The code then takes the "hidden by a filter" branch every time and prepends the piece.
- For the same reason, the "expand the first batch past row 60" branch can never run.

**What would have caught it:** a check that counts. "The piece appears exactly once, and the number of rows equals the number of pieces", rather than "some row is open".

## By section

- **R · Probation rules:** pass. The three corrections from batch 1 all landed.
- **A · Correctness and honesty:**
  - B3 fails A1.
  - A3 has a note: one unmeasured sentence about B3, plus the wrong invariant numbers in B2's write-up.
  - A2, A4 and A5 pass: no stored field, no Governor traffic, no forbidden file.
- **B · Invariants:**
  - Pass.
  - It ran `gen_lazy_index --check` for the lazy files.
  - It kept the Practice Log drawn only when opened (156).
  - It used native buttons inside the milestone rows (67).
- **C · Helper reuse:** pass. Every helper is the existing one, and the local `pillSelect` is a three-line wrapper that matches the assignments page.
- **D · CSS and tokens:** pass. Tokens only, and the coarse-pointer rules are in the existing `@media (pointer: coarse)` block.
- **E · Scope:** pass with one note (B4's broad selector). Its "Noticed, not touched" list is useful.
- **F · Habits:**
  - It planned with file:line, helpers and invariants before editing.
  - It pushed after each ticket.
  - It flagged two real uncertainties: the blocked browser, and a moves list that opens on the current month.

## What it should do differently next time

1. **A check must be able to fail.** "Some row is open" passes whether the code is right or wrong. Count the rows, find the one you expect, and check that its place and the numbers on screen agree.
2. **Write the Walkthrough from what you saw, not what you planned.** If a sentence wasn't measured, say "by design" or leave it out.
3. **Copy invariant numbers from the plan, not from memory.**

## Fix-up for Neon (on `neon/qol-batch-2`, one commit)

> Batch 2 is graded (`docs/qol/neon/REPORT-2.md` on `origin/main`). One fix is needed before it merges,
> plus one small accessibility note. Same rules (R1–R3).
>
> **F1 · B3's deep link draws the piece twice.**
> - **R1:** on your branch, open `#/creatives/log/<id of any piece>` with no filter. The piece is drawn at the
>   top and again in its own place, and the Show more button counts one piece too many.
> - **Cause:** `CR().work(wid)` returns a copy, so `rows.indexOf(target)` is always -1.
> - **Fix:** take `target` from `all`, by id, so the existing `indexOf` logic works as you designed it.
> - **Then check, with a check that can fail:**
>   1. A deep link to a piece in the first 60: drawn once, in place, open.
>   2. A deep link to a piece past row 60: drawn once, the first batch extended to reach it.
>   3. A deep link to a piece hidden by a filter, during a redraw (with the dialog open): shown at the top, once.
>   4. In each case, the button's "N of M shown" agrees with the head's count.
>
> **F2 · B4's accessible name.** Make the milestone button's accessible name start with its visible words
> (for example "Work saved: open it, milestone 1"), or drop the `aria-label` if the visible text plus context
> is enough. WCAG 2.5.3.
>
> **Leave as it is:** the B4 selector width (noted, not worth a second change). The Walkthrough's B2
> invariants line: correct it in the Walkthrough only (5a, 168, ui.md 50).
>
> Run smoke108, smoke192 and smoke119, then the full gate once. Commit `fix(qol): creatives#2 — a deep-linked
> piece is drawn once`, push, and add an F section to the Walkthrough.

## The re-check (fix-up `e0fee7d`, 20 November)

**The diff is two lines in `creatives.js`, and nothing else changed.**
- F1: `target` now comes from `all`, by id.
- F2: the accessible name is "Work saved: open it, milestone 1".
- The B4 selector was left alone, as asked.

**R1–R3, all pass:**
- **R1:** it reproduced all three cases on `14e2d12` before editing, with the bad positions and counts recorded.
- **R2:** its checks could fail this time. They counted the rows, found the piece's position and compared the button with the head. They ran green, then the targeted suites ran, then it committed.
- **R3:** two lines, exactly.

**The reviewer's own checks** were on a 72-piece log at 1470 × 832:

| Deep link to | Before the fix | After the fix |
|---|---|---|
| Row 4 | drawn at rows 1 and 5; "60 of 73 shown" | drawn once, at row 4, open; "Show 12 more · 60 of 72 shown"; once after Show more |
| Row 66 | drawn at the top; the batch was never extended | the first batch is extended to 66, the piece drawn once at row 66, open; "66 of 72 shown" |
| A piece hidden by a filter, redrawn with its dialog open | — | shown once, at the top; the head reads "20 of 72 pieces" |

**Gate:** 177 / 177 in a fresh checkout (smoke17 failed once under load and passed alone).

**One note left:** the Walkthrough's B2 line now cites 5a, but files 168 under `spaces.md`. It is `ui.md`.

**B3 is now "pass with notes".** Batch 2 has three "with notes" (B2, B3 and B4), one over the two the checklist
allows for a clean pass. Every note is about wording, a citation or selector width, never behaviour, so the
branch merges.

## Next

Neon gets a third batch of the same size: M tickets, one module each, still outside the core files.
It keeps the habit that fixed B3: a check that counts.
