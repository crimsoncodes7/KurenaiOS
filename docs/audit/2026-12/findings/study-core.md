# study-core — December 2026 audit (Phase 2, Batch 1)

Slot 3, code at `fa4264d0` (sw `kos-qol-4`). New ids ST-44 to ST-57.
Evidence: `/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/study-core/`.

**14 findings: P0 0 · P1 2 · P2 5 · P3 7.**

| Id | Sev | Title |
|---|---|---|
| ST-44 | P1 | Error Log inline pill's "Undo" beside a re-shown question permanently deletes an older entry and its notes |
| ST-52 | P1 | Cold start: curriculum stand-ins never installed, so Review, Card stats and Home's goal read an empty due queue |
| ST-45 | P2 | Auto-log quiz misses re-creates entries on every redraw (Undo does not stick, resolved misses come back) |
| ST-46 | P2 | Error Log titles are raw markup ($LaTeX$, `code`, **bold**) and often the wrong line |
| ST-47 | P2 | "Tag reason" / openCapture does nothing before page-errorlog loads (KOS.lazy.ensure does not exist) |
| ST-50 | P2 | Due today's "Today so far" counts quiz answers and exam self-marks as reviewed cards |
| ST-51 | P2 | The Sample account is built with no card schedules (1A made sample.js lazy; content not loaded) |
| ST-48 | P3 | Quick Error Drill count and queue ignore the hub's filters |
| ST-49 | P3 | Drill: Undo on "Marked resolved" restarts the drill at card 1 |
| ST-53 | P3 | Inspector "Quiz best25% →" runs into its label |
| ST-54 | P3 | Quiz history rows take four lines on a phone |
| ST-55 | P3 | Same quiz miss from the topic and from Due's Questions back logs twice (dedupe key by list position) |
| ST-56 | P3 | Questions back: "See your score →" is a dead primary button |
| ST-57 | P3 | Card stats Due forecast: "over" and "today" overprint on a phone |

## What was covered

Accounts: **Sample** (full pass; rebuilt from scratch once to measure ST-51,
then given real ratings and 48 overdue records so Due today had a queue),
**Empty** (every route below at all six sizes), **dense** (`mine`: Maths
desk, Assignments, Review at mac/ipad/iphone; the study editor at
mac/iphone; the seed writes no card schedules). **Copy: not run** — the
user's backup was not supplied in this batch.

| Route / surface | Sizes × accounts | What was exercised |
|---|---|---|
| Subject desks `#/subject/compsci·maths·it` | mac sample; all six empty; mac/ipad/iphone dense | hero, analytics, Review strip, units, IT unit marks (ST-26) |
| Topic page `#/ref/…` (CS 4.2.1.2, 4.1.1.2, 4.1.1.16, 4.12.2.1; Maths S4.1; IT F201.1.2, F201.2.2, F201.3.1) | mac, iphone, slide (pill); wide trace all six | Spec; Notes paging and its memory across Back/rerender/reopen; 8-column trace in `.k-fill-scroll` stacked under its code; Flashcards Study/Deck: Again requeues, one ledger entry, reload mid-batch picks up, finish pays the flat part once; study editor (wording edit forks, key kept, Done); Quiz to the end, History, inspector; Exam questions: tariff chips, reveal, self-mark, "+ Log mistake", trace "try" part under the question; Files tab; the open-errors pill |
| Review / Due today `#/review`, `#/review/due/<run>`, `#/due` | all six sample (48 due) and empty | per-subject counts, kinds strip, whole-queue run (reload mid-run, bySubject), one-topic run (ST-30), Questions back (cap, pill, Next), Today so far vs the review log, cold loads |
| Card stats `#/review/stats` | mac/iphone sample; all six empty | strip, charts, rating mix, target retention + toast, Optimise status, per-topic table |
| Personal deck | mac sample; all six empty | cards made from Error Log entries |
| Assignments `#/assignments[/<id>]` | mac/iphone sample; mac/ipad/iphone dense; all six empty | new assignment (random string id), cold address, subtasks add/tick/delete/Undo, delete with a shared file (ST-25) |
| Error Log `#/errorlog`, `/<sid>[/<ref>]`, `/drill[/…]` | all six sample and empty | insights, filters, search, status tabs, capture dialog (manual, prefilled, edit, delete + Undo) at mac/iphone/slide, Drill (reveal, revisit, resolve + Undo, → Flashcard, keys), cold deep links, rail count, auto-log, exam pill, openCapture before the bundle, → flashcard routing, zero Governor traffic |

Phase 1 checks that passed: rich rendering in cards, quizzes, exam prompts
and mark points; wide trace tables scroll inside their box with no page
overflow; labs and "Your turn" variations are gone from exam items; the
dedup kept schedules: 3,897 shipped card keys unique, no duplicate quiz/exam
qk, and no position-keyed quiz or exam item moved between f479433b and
fa4264d0 (content replayed in a node vm); the flashcard engine's new
options left the Study decks as they were (invariant 167); 1A–1F items in
this area behave as described.

Not covered: the copy account; the Handwritten tab (exams-files-ink); the
Resources confirm wording (1D#5); the spine drawer on phones (ST-15, open)
beyond a glance; whether worked-example mark totals match their sources
(content areas). Seen and left to their areas: the phone header repeats
the page title on every Study page (shell), and at Slide Over width the
header's last icon is clipped (shell).

November re-check: ST-25 (P0), ST-03, ST-04 and ST-26 (P1) are fixed;
sampled fixed items ST-12, ST-19, ST-27, ST-30, ST-35, ST-36, ST-37,
ST-40 and ST-43 hold. Open items seen still open: ST-02, ST-09, ST-10,
ST-14, ST-18, ST-39, ST-42; none made worse by Phase 1.
