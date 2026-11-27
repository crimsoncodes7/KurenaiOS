# Batch 1, the copy-account pass

The user's full backup of 26 Nov restored into harness slot 7 (offline,
signed out, default namespace). Shapes only: no titles, notes or amounts.
Measured 26-27 Nov 2026 on `fa4264d0`.

## What the copy holds

- State document: 678 KB in localStorage (`kurenai-os-v1`). Largest keys:
  sessions 168 KB (527 entries, ids 3480-5618, all numbers, none shared),
  calendar 119 KB (113 events), pacing 81 KB (257 rows, 34 weeks), notify
  56 KB (200 items), srs 51 KB (293 schedules), reminders 46 KB (60),
  dayReview 30 KB (25 days).
- IndexedDB: files 25, filetext 12, ink 59 docs / 140 pages, media 1,960
  rows, money 395 transactions, reviews 481 rows, reports 14 + 8
  snapshots, mind 4, attempts 0, papers 0 (the Paper library is not in the
  full backup, by design), ledger archive 0.
- Old numeric ids (pre-1A): 111 of 113 events, all 60 reminders, 12 of 13
  assignments, all 10 goals. Pacing rows are `p<n>` strings.

## Existing findings, measured on the copy

### Productivity

- **PR-45** (hidden Pacing rows still counted): measured on the copy: 0 of
  257 rows hidden — no impact today.
- **PR-47** (countdowns ignore Skip): measured on the copy: the only
  exam/deadline event left is a past one-off; no countdown is affected. 19
  weekly personal events (Google-imported) carry skipped dates (1-9 each);
  they reach `nextOccurrence` only through calpage.js:142 (opening an event
  with no date), not a countdown.
- Pacing Shift preview on the real plan (1 week): personal from this week
  111 rows, both 162 (51 school, 1 week added, 4 breaks stepped), personal
  over the whole plan 151 (the 40 carried rows included). 1.2 ms a preview.
  The week banner reads 0 of 18 personal rows, '40 behind'.
- Routines (12) and the Daily Review (25 days, 57 picks): every routine log
  key, step link and review pick resolves (plan 29/29, reminders,
  assignments, topics, spaces); no list holds two picks sharing an id.

### Exams, Files, ink

- **EX-54** (unmarked paper logged as 0/N): measured on the copy:
  `kurenai-os-attempts` is empty and the one tracker entry has no score —
  no false score exists yet.
- **EX-63** (written-on file hidden behind a matching paper): measured on
  the copy: no file has `alsoPaper`; 8 files have writing (9 `file:`
  layers), all 8 with a hash (2 papers, 4 handouts, a worksheet, a photo),
  so each would lose its ✎ the day the same PDF enters the Paper library.
  The Paper library itself is not in the backup, so whether the real
  device already pairs one cannot be read from the copy. See also EX-90:
  12 older files have no hash at all and so can never pair.

### Study

- **ST-52 / AP-21** (cold start, no stand-ins): measured on the copy with a
  real reload (Page.reload) at #/review: KOS_CONTENT holds 52 keys until the
  warm-up, the content arrives 7-9 s after reload (mac and iphone, 1×) and
  9-12 s at 4× CPU. No flashcard is due on the copy (the 42 due schedules
  are all removed cards), so the hero's '0 cards due' happens to be right;
  but 'Next 7 days' reads '15 scheduled' (Mind/Creatives/Japanese and the
  questions) instead of 46, and still reads 15 at 12 s because the page
  never redraws. Questions back (10 Code questions) are counted correctly
  in the window, since they count schedule keys.
- **ST-50** (Reviewed counts questions): measured on the copy: on 26 Nov
  Due today read 'Reviewed 6 · Accuracy 67%' for 1 flashcard and 5 Code quiz
  answers; on 23 Nov it would have read 11 for 1 card. 4 of the 34 days in
  the review log are inflated (481 rows).
- **ST-51**: Sample-only; not applicable to the copy.
- **DI-30** (orphan question schedules): measured on the copy: 0 orphan
  question schedules — the 25 question schedules (q:code:1.1-1.5) all have
  their items; 20 are due against a cap of 10, so 'questions back' is not
  affected. Flashcard schedules are the larger part: 56 of 268 card
  schedules have no card (removed by the clean-up), 42 of them overdue;
  they are kept out of the due queue correctly, and show only in Home's
  'learnt' (ST-90).
- Forks: 3 (one notes fork of 8 blocks where 43 ship today, two flashcard
  forks of 14 and 15 rows). All three are pre-stamp and stale; the topic
  page shows the 'updated after you edited them' notice with its three
  choices (checked on the notes fork).

### Sync and data integrity

- **DI-33** (rows sharing an id merged on apply): measured on the copy
  (the lead's scan): no array in the state has two rows sharing an id;
  sessions' ids are all numbers and unique. The exposure that remains is
  across kinds: one reminder id equals an assignment id, so a review whose
  three picks name both would collapse; no saved review does today.
- **DI-28** (re-key misses refs): measured on the copy: 0 sessions with
  `metrics.eventId`, 0 with `metrics.reverses`, `focus.active` empty, and 1
  assessment whose `links.calendarId` is a numeric id (its own migrated
  event) — the one reference a no-base merge could leave pointing at the
  other device's event.
- **DI-29** (first link drops U4 Pacing edits): measured on the copy: 0
  rows with `hidden`, `order` or `day` — nothing to lose; `dayReview.config`
  is empty.
- Goals: all 7 `links.examId` resolve to an assessment.
