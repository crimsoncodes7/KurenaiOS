# Neon's third branch: the grade

`neon/qol-batch-3` (2564a54f): five commits, 10:42 to 10:56 on 20 November 2026, one per ticket, then the full
gate.

Graded against `REVIEW.md` (sections R and A–F) and `BRIEF-3.md` from:
- the diff (`git diff origin/main...origin/neon/qol-batch-3`);
- Neon's plan and Walkthrough (Antigravity session `554582e8…`, 10 new screenshots);
- the reviewer's own browser check of every ticket, on a separate origin with its own seeded data;
- the reviewer's own gate run in a fresh checkout (C# runtime linked in): 179 / 179 (none needing a re-run).

**Verdict: passes, with one note.** Merged to `main`. No fix-up. This is the first batch with no fail and no
behaviour note: every claim in the Walkthrough was true when the reviewer measured it, every check could fail, and
every invariant number is right.

## The three rules

| Rule | Grade | Evidence |
|---|---|---|
| R1 · Reproduce first | pass | Each ticket shows the gap on `origin/main` with numbers: "Restart for November" with no dates and no toast; Year bars 2 px for income and scaled to the wrong top; 0 thumbnail reads over 60 rows; "Nothing due right now" from a passed lesson's Practise again; no Tomorrow on two overdue rows. C4's R1 found more than the brief said: the button already existed and was broken. |
| R2 · Test before committing | pass | Commits are 3 to 4 minutes apart; each ticket lists `node --check`, its live check, its suites, then the commit. The gate ran once, after the last push. |
| R3 · Line discipline | pass | 105 lines added over nine files, each one the ticket's. Three things it saw and left alone are under "Noticed, not touched", all real (see below). C1's button text and C3's hoisted `live` token are inside their tickets. |

## Its claims, checked

Every claim below was measured again by the reviewer, on its own data.

- **C1:** a goal missed 11 days ago with a 29-day span restarts as 20 Nov – 19 Dec; the button reads "Restart"; the
  toast (and its spoken copy) reads "QA missed goal restarted · 20 Nov – 19 Dec". **True.**
- **C2:** with September at out 40 / in 100 and October at out 80 / in 20 (any unit), the bars measure 56 / 140 and
  112 / 28 px: one scale, top 140 px. Names keep "out …, in …". **True.**
- **C3:** a picture saved as a data URL and one saved as a Blob both show a thumbnail (`alt=""`); a text piece keeps
  its glyph and reads nothing; the one object URL made is revoked on leaving the page. **True.**
- **C4:** a passed lesson's "▶ Practise again" opens `#/japanese/session/practice-H1`, runs all 20 exercises through
  the validators, ends with "Practice only — nothing was scheduled, rated or paid", and the facets, lessons,
  sessions, Governor and runs are identical before and after. **True.** Leaving mid-practice asks nothing, since
  nothing would be lost.
- **C5:** only the overdue row gets Tomorrow (32 px on desktop); it moves the reminder to tomorrow keeping 14:30;
  Undo puts back the old day and time. **True.**
- **Gate:** "179 / 179". The reviewer's run: 179 / 179 (none needing a re-run). **True.**

## Per ticket

| Ticket | Grade | Notes |
|---|---|---|
| C1 `goals#3` | pass | The file's own `today`/`addDays`/`between`/`shortDate`; the toast speaks once through `KOS.a11y` (66). A goal with no deadline says "restarted from 20 Nov". |
| C2 `money-goals#1` | pass with notes | The `--hv` pattern extended with `--hi`, tokens only, the scale's top now the larger of the two, and the empty-income slot kept so widths stay even. **The note:** the figure printed above each month is still the outgoings, and it now sits over whichever bar is taller. In a month where income is larger (September above), "£40,000" stands over the green income bar, so the eye reads it as income. Invariant 26d wants a bar to match its printed value; the income bar has none. The card is still titled "Outgoings by month". Not a fail: the brief asked for the bars and the names, and both are right. |
| C3 `creatives#1` | pass | One read per picture row only, through the existing `CR().files.get`; a paint generation drops a late answer; every object URL is revoked on redraw and on dispose (166). **An observation, not a note:** a thumbnail decodes the full picture to show it at 32 px; on an iPad with 60 large photos that is real memory. `decoding="async"` and `loading="lazy"` on the `<img>` would soften it. |
| C4 `bk:ja-mind#1` | pass | Reuses the existing `ex.reask` path (no record, no result, no sync) instead of a second runner, as the brief asked, and guards `keepRun`, `restore`, `reask` and the end screen. The first-run Practise button and the passed lesson's button both route by `doneAt`. 113, 114 and 116 all hold. |
| C5 `productivity#7` | pass | Copies the Daily Review's Tomorrow (same `prev`, same toast, `dueTime` kept) without writing review state (144). The accessible name starts with its visible word ("Tomorrow: move …"), the lesson of B4. |

## By section

- **R · Probation rules:** pass.
- **A · Correctness and honesty:** pass. No unmeasured sentence this time; the Walkthrough's numbers are the
  reviewer's numbers. No stored field, no Governor traffic, no forbidden or generated file.
- **B · Invariants:** pass. Every id it cites exists in the file it names (`core.md` 5a/5b, `ui.md` 26–27, 47–50,
  59, 66, 69, 76–77, 166, 168, `spaces.md` 113–116, 154, 156, `productivity.md` 95, 144, 147). Last batch's
  "copy the number from the plan" correction landed.
- **C · Helper reuse:** pass. Every helper is an existing one, named with its file and line.
- **D · CSS and tokens:** pass. Tokens only; no new breakpoint.
- **E · Scope:** pass. "Noticed, not touched" is three real findings:
  - `workRow` prints "A1.1·null" for a piece with a lesson but no study (visible in its own screenshot);
  - `portfolioPage` reads files without a view token, so leaving mid-load can write into a detached page;
  - a missed goal's Archive announces but shows no toast.
- **F · Habits:** pass. It planned per ticket, pushed after each, ran its own headless Chrome over CDP when
  Antigravity's browser failed (and said so), and flagged the speaking facets as an open question.

## What to keep doing

1. **Counting checks.** Rows, reads, URLs made and revoked, byte-for-byte state before and after. This is what
   caught nothing wrong this time, because nothing was.
2. **R1 that finds more than the brief.** C4's "the button exists and is broken" is the kind of thing a reviewer
   wants to hear before the plan, not after.
3. **The plan's invariants, copied.**

One thing to add: when a change moves what a chart shows, check the words around it too (C2's title and the figure
over the bar).

## Next

Neon gets batch 4 of the same size. Its three "Noticed, not touched" findings go into the next tickets (the
`·null` subtitle and the Portfolio token are one Creatives ticket; the Archive toast is S). Once this batch ships,
C2's note (an income figure, and the card's title) is a candidate for a C2 follow-up of its own.
