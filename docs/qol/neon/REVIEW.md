# Reviewing Neon's branch — the checklist

This is how the reviewer (Claude) grades `neon/qol-starter-1`.

- **Every point is checked against the diff** (`git diff origin/main...neon/qol-starter-1`) and by re-running
  the tests myself, never only against the Walkthrough.
- **Each ticket scores** pass / pass with notes / fail on each line below.
- **The branch passes probation** with no fail on an A or B line in any ticket, at most two "with notes"
  overall, and a gate that is green when I run it.

Phase 5 turns this file into the review checklist for every contributor.

## A · Correctness and honesty (a fail here fails the branch)

- **A1 · It does what the ticket asked,** on the screens it names, at 1470×832 and 820×1180. I check it in the browser.
- **A2 · No regression:** `SMOKE_JOBS=3 npm test` is green on the branch when I run it. The suites the
  ticket names pass.
- **A3 · The Walkthrough is true.** Every "passed" was run. Every screenshot is the changed screen. Every
  hash exists. A false claim fails the branch outright.
- **A4 · Nothing stored changes meaning:**
  - no schedule key, record id or stored field is renamed or reshaped (invariants 87, 88);
  - no new state key;
  - no Governor traffic (invariants 1, 5a, 129).
- **A5 · No forbidden file is touched,** and no generated file is hand-edited (the list is in BRIEF.md §1).

## B · Invariant compliance

- **B1 · Every invariant the ticket names was read in full,** cited in the plan, and is still true after the
  change.
- **B2 · Invariants the ticket didn't name but the change touches** are noticed. For example, 168 for a file in a lazy bundle (did it run `gen_lazy_index --check`?), 66 for anything spoken, 49 for dialogs, 103 for subject lists.
- **B3 · Accessibility holds:**
  - an accessible name is never placeholder text (68);
  - focus lands somewhere sensible;
  - hit areas are 32 px, or 44 px on coarse pointers (69).

## C · Helper reuse

- **C1 · The existing helper or pattern is used** where one exists: `KOS.subjects`, the dialog's close path, the
  announce wording already in the file, the `VIEWS` table, the existing `hover: none` pattern.
- **C2 · No new global helper,** no copy-paste of a helper into a second place when the existing one would do,
  and no private re-implementation of something `KOS.ui` or `KOS.a11y` already provides.
- **C3 · Where no shared helper exists** (for example, plurals in Mind), the fix is local and minimal, and it
  matches the closest existing convention instead of inventing a new one.

## D · CSS and token discipline

- **D1 · Values come from tokens:**
  - colours, spacing, radii, font sizes and z-index are `var(--…)`;
  - no hex, rgb or `px` literal where a token exists (`css/tokens.css`);
  - z-index from `--z-*` (70).
- **D2 · Media queries:** only the five widths (47), widest first (48). Capability queries (`hover`,
  `pointer`) follow the pattern already in the file.
- **D3 · Each rule sits in the right layer file and block,** next to the rule it modifies. Nothing goes in the
  `floors` layer unless it is a floor (40). `!important` only where the existing pattern uses it.
- **D4 · Classes stay presentational:** `k-` prefix; no logic or test reads a class (26).

## E · Scope discipline (no unrequested refactoring)

- **E1 · The diff is the smallest that does the job:** no reformatting, renaming, moved code, reordered lines,
  changed quotes or whitespace churn outside the changed lines.
- **E2 · One ticket per commit,** with the message format `fix(qol): <key> — …` and the agent trailer. Files are
  staged by name, and nothing unrelated is in a commit.
- **E3 · Things it noticed but didn't touch** are listed in the Walkthrough, not fixed.
- **E4 · No new files,** except a test if one was truly needed (and then numbered from the next free suite
  number, registered in `tools/run_smoke.mjs` and `docs/SMOKE.md`).

## F · Working habits (noted, not pass/fail)

- **F1 · The plan** named a file:line, a helper and the invariants before any edit.
- **F2 · Commits were pushed** after each ticket.
- **F3 · Uncertainty was stated** rather than guessed past.
- **F4 · Questions it asked** were ones the brief didn't answer.

## What I'll be looking for per ticket

| Ticket | A good answer shows |
|---|---|
| T1 | It checked whether the title is an identity. `KOS.content.workedKey` hashes the title, but only to find the example on the page as it is drawn; ink and exam histories don't use it. One string changed. |
| T2 | "1 bullet" / "n bullets" with a local conditional, matching how the file or the module writes other counts. Any other count in the file with the same fault fixed too. `gen_lazy_index --check` reported. |
| T3 | The edit path announces with the same words as `goals.js`'s general editor ("Goal saved · …"); the add path is unchanged. |
| T4 | The kicker comes from the existing `VIEWS` table (with sensible words for Overview and Settings), and the 円 mark is kept. No new list. Lazy-index check reported. |
| T5 | `KOS.subjects.ids()` is used in both places, with names from `KOS.subjects.name`. Today it gives the same seven subjects as the `.sections` test, in the registry's order (CS, Maths, IT, Code, Japanese, Mind, Creatives). It is not narrowed to `ids("exam")`. Invariant 103 cited. |
| T6 | Cancel goes through the shared dialog close path, so focus returns to "Reset everything…". `ui.js` is not edited. Shown in the browser with the keyboard. |
| T7 | A capability query (`hover: none` with `pointer: coarse`) beside `.k-search-key` in `css/layout.css`, following the existing pattern. No `index.html` edit and no width breakpoint. The Mac still shows the badge. |

## After grading

I write a short report: the score per ticket and per section, the three most important corrections, and
whether Neon gets a second batch. If it does, the next batch is one size up: an M ticket in a
single module, still outside the core files.
