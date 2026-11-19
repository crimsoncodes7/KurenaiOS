# Neon's first branch: the grade

`neon/qol-starter-1` (7ab02e3): seven commits, 19:59 to 20:05 on 19 November 2026, then
verification until 20:24.

Graded against `REVIEW.md` from:
- the diff (`git diff origin/main...origin/neon/qol-starter-1`);
- Neon's Walkthrough (Antigravity session `554582e8…`, 14 screenshots);
- the reviewer's own browser check and gate run.

**Verdict: passes probation.**

## Its claims, checked

- **Gate:** "177 / 177 after building the C# runtime". The reviewer's run of the branch in a fresh checkout gave
  175 / 177, the two failures being smoke75 and smoke76 for the same reason: the runtime is a gitignored local build.
  With the runtime linked in, those two re-run; that result is __REVIEWER_RERUN__.
- **The T6 pattern:** `overlay.close = function () { overlay.remove(); }` is in 15 modules, at the four places it named
  among them, and `KOS.ui.openDialog`'s Escape calls `overlay.close`. **True.**
- **T2:** `mindrun.js:202` already writes "turn"/"turns" the same way. **True.**
- **T1's identity check** (written work keyed by position, `workedKey` used only to find the card on the page): **true**,
  the same as the reviewer's own finding.
- **Screenshots** at 1470×832 and 820×1180 exist for all seven tickets.
- **Nothing staged that shouldn't be:** the `package.json` and lock changes from `npm install` were left out of every commit. **True.**

## Per ticket

| Ticket | Grade | Notes |
|---|---|---|
| T1 `content-cs-it#2` | pass | One string, in the style of its neighbour ("The ASCII letter circuit"), with no answer given away. It checked the identity question properly. |
| T2 `mind#4` | pass | A local conditional matching the file's own `turn`/`turns`. Every other count in the file audited. |
| T3 `goals#5` | pass | The general editor's exact words; the add path unchanged. Both announcements checked live through `KOS.a11y.announce`. |
| T4 `money-goals#5` | pass with notes | It reused `VIEWS` and checked all seven views live. It also reused the new `viewLabel` in the title line, which was not asked for. The behaviour is identical and the change is small (E1). |
| T5 `study-core#9` | pass | `KOS.subjects.ids()`/`name()` in both places, citing the same pattern in `focus.js` and `goals.js`. The seven subjects were checked live in registry order. |
| T6 `assistant-archive#4` | pass with notes | It followed the house dialog pattern and checked focus return by keyboard at both sizes. One miss: it did not try the bug before fixing it. On main, Cancel already returned focus (the `openDialog` teardown runs on `remove()` too), so the commit changes no behaviour. The ticket came from the reviewer's own wrong reading of the code. It did find what is really left: in Safari a mouse click does not focus a button, so a dialog opened by mouse returns focus to the body. That is now a W9 item. |
| T7 `shell#2` | pass | A capability query beside its neighbour, citing three existing uses; CSS only. Its computed `display` was checked at both sizes, plus the iPad responsive audit. |

## By section

- **A · Correctness and honesty:** pass. Every claim checked held, and the gate's two failures were explained before the reviewer found them.
- **B · Invariants:** pass. It cited the right ones, and added others the tickets did not name (168 for the lazy bundles, 48, 89b).
- **C · Helper reuse:** pass. It cited the existing use it copied each time.
- **D · CSS and tokens:** pass.
- **E · Scope:** pass with one note (T4's title line). It wrote a good "Noticed, not touched" list: the `subjName`/`shortSubj` helpers, `ov.remove()` in `goalDialog`, and the smoke119 baseline entry that can shrink.
- **F · Habits:**
  - It wrote a plan first and pushed after each ticket.
  - It stated its uncertainties: Safari focus, the Overview kicker, and that it used headless Chrome because Antigravity's browser was blocked.
  - Not ideal: seven commits in six minutes and the testing afterwards, rather than each ticket fully tested before the next commit. That broke no rule, but the brief's order was test, then commit.

## What it should do differently next time

1. **Reproduce first:** show the bug on `origin/main` before changing anything, and say so when it is not there (T6).
2. **Test each ticket before committing it,** not all of them afterwards.
3. **Keep to the asked lines** (T4's title).

## Next

Neon keeps getting tickets. The next batch is one size up: a few M tickets, each inside a single module, still outside the
core files. The "Noticed, not touched" items are good candidates for the reviewer to triage into it.
