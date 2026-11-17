# Exams & Papers, reworked: plan

**Status:** APPROVED, 17 November 2026, with the decisions in §13. The
design prompt (D-Exams, `docs/design-prompts.md`) goes to Claude Design.
Its handoff is the guide for the pages, not a 1:1 spec.

**Replaces:** UR-28 in the quality programme's backlog. It builds on
`docs/exams-plan.md` (revision 2). That plan's records stay: assessments,
scopes, attempts, the index, boundaries, FSRS caps and goals. What changes
is how they are presented, plus the parts listed in §4–§9.

**Why now:** the mocks are about a month away. In your words (13 November),
Exams & Papers is "overall just not as helpful as it should be". Of the
Companion you said (17 November): "the manner in which it displays
information is jarring and useless. Way too much content in not a clean
manner, displays all exam questions with no place for working, drill is
also ugly."

---

## 1. The December mocks this plan serves first

| Mock | Scope | Format |
|---|---|---|
| IT F201 | the whole unit (Topic Areas 1–5) | **1 h 30, 60 marks** (OCR's SAM, v3.0, Nov 2024). One organisation as the context for every question. Lettered parts, some (i)/(ii) parts that depend on each other, one 6-mark and one 9-mark levels-of-response question. The real exam is in January 2027. |
| CS pre-public exam | Y1: logic gates and Boolean algebra, hardware (I/O, storage), OOP, stacks, queues. Y2: recursion, graphs, trees, sorting and searching, assembly language, consequences of computing, databases | **2 h 30**, written. A topic list across AQA's two papers, not a board paper. |
| Maths | Pure only: all of AS Pure, plus the A2 chapters on advanced algebraic methods, sequences and series, functions and graphs (with proof), radians, trigonometric functions, advanced trig and 3D vectors | Edexcel style |

**Sources of truth:**
- **F201:** OCR's specification and the SAM with its mark scheme, in Drive at
  `…/Information Technology/IT/Data Analytics/` (the specification,
  `OCR_Big_Data_and_Machine_Learning.pdf` and its `_Annotated` copy).
- **CS and Maths:** the board papers, schemes and topic practice in Drive at
  `…/A-Level Materials/A-Level/` (`Past Papers/`, `Topic Practice/`, 303
  files). The index generator now reads that folder:
  `python3 tools/gen_exam_index.py --root "<that path>"`.
  `~/Downloads/A-level` no longer exists.
- There are no Edexcel examiner's reports in the folder. A Maths trap cites
  a series only if you ask me to fetch the reports first.

---

## 2. What was reviewed

**Open findings (the audit, `findings.json`).** About 50 belong to this
area. The ones that matter here:
- **Papers:**
  - EX-28: the navigator's squares are 7px wide on iPad.
  - EX-32: Pause hides the clock while time runs on, and time-up never fires.
  - EX-42: a reload does not come back paused.
- **Marking:**
  - CC-25: IT schemes award marks in steps of 2.
  - CM-15: 24 Maths worked examples have marks that do not add up.
  - CM-21: an exam item's scheme covers more marks than the item.
  - EX-29: a post-mortem reads "40 of null".
  - EX-01: a question added with "＋ Question" cannot be given its Max or topic.
- **Companion:** EX-30 (a drill offered with nothing to drill) and EX-31
  (unlabelled columns).
- **Honesty:**
  - EX-40: start-by is born "passed".
  - EX-47: a limiting signal is named with no evidence.
  - EX-20: the Exam Room's countdown.
  - EX-24: Analytics opens on an exam with no evidence.
- **Layout and touch on phone and iPad:** EX-02, 03, 05, 06, 08, 10, 11, 12,
  14, 15, 21, 22, 34, 36, 38, 41, 46.
- **Performance:** AP-03 (first render up to 2.8 s) and AP-18 (readiness
  computed about fifteen times at boot).

Already fixed: EX-01, EX-25, EX-33 (scheme lines in the tally), CC-14,
CC-17, CM-14 and UR-26.

**Your reports:**
- UR-26: Cram did nothing (fixed).
- UR-27: the drill seemed to show wrong answers (not reproduced).
- UR-28: the area as a whole.
- 17 November: the Companion, as quoted above.
- 17 November: Kurenai's built-in model is too unreliable for feedback on
  your work. Rate limits and a Flash model make it practically useless for
  real analysis (§8).

**The pages, on a test copy** (17 November, with mocks set up like yours):
- **Navigation is five levels deep.** The section tabs, then Timetable ·
  Readiness · Planner · Practice · Companion, then Attempts · Analytics ·
  Library, then Exams & assessments · Practice papers & questions, plus
  List · Load.
- **A mock's page is four readiness readings** that say "Not enough
  evidence" until weeks of data exist.
- **The Companion's Key notes are walls of text.** Callouts are flattened
  into one paragraph.
- **The F201 "Practice paper 1" is not an OCR paper.**
  - It has 19 separate questions, each with its own made-up organisation.
  - It uses Edexcel's "(Total for Question 1 is 1 mark)" and "show your working".
  - It is 60 marks in 1 h 12, a guess: the preset has no duration, and the SAM says 1 h 30.
  - You made your own paper outside the app (`F201_Lumen_Live_2_Hour_Question_Paper`).

**The revision documents you made with AI before.** These are references
only, not copies. What each contributes:

| Document | What it contributes |
|---|---|
| F201 master revision guide (TA1–2) | The paper at a glance; the three Performance Objectives (PO1–PO3); command words; the 6- and 9-mark level grids and how to structure them (PEEL + a conclusion); numbered lists to learn ("the 8 cleaning techniques"); the SAM questions worked |
| F200 revision guide | Minutes per mark; spotting the PO from a question's stem; "what is NOT examinable"; Level-3 terminology lists; a Level-3 answer template |
| F200 mock paper | The mark scheme with estimated grade boundaries and a self-marking tally sheet |
| F200 subtopic and practice packs | Questions per subtopic with their schemes right after them |
| CS data structures companion | Trace-table rules; pseudocode to memorise side by side; misconceptions per module; a pre-exam checklist |
| CS AS mock revision (Markdown) | Exam-technique rules first; mark-scheme phrasing; a mnemonic table; numbered misconceptions; answer templates by command word; one-line definitions; a night-before checklist with tick boxes |
| AS Pure revision guide | The paper's structure; **what the formula booklet gives you, and what you must memorise**; calculator set-up (FX-991CW); "six question variations"; Method 1/2/3 |
| Statistics cheatsheet | **"Ten ways you lose marks — from your own marked work"**; hardest topics first; sticky chip navigation; conclusion templates; numbers checked by program; an exam routine |
| AS Pure interactive page | A sidebar of sections with weights and done ticks; a progress band; a formulae drawer; graph labs; MCQ and exam parts with the scheme revealed |

They point to the same shape again and again. Exam technique comes first,
then one chapter per topic: what to learn, how it is asked, how it is
marked, the traps, then practice with the scheme beside it. Then a
checklist for the night before. And "where I lose marks", taken from your
own attempts.

---

## 3. Principles

1. **Built around one exam.** You open an exam and everything for it is
   there, at most two levels deep. Things that span all exams (Timetable,
   Load, Results, the Library) live on one "All exams" page.
2. **Every page says what to do next.** Missing evidence is shown as a
   step to take ("Do 20 cards to see recall"), never as a band that reads
   "Not enough evidence".
3. **Reuse the study engines.**
   - Questions run through `KOS.quiz.mountExam`, with Type · Write · On
     paper for working, the tally and the question history.
   - Quizzes run through `KOS.quiz.mountMCQ`; cards through
     `KOS.flashcards.mount`.
   - Notes are drawn by `KOS.content`, so callouts stay callouts and
     figures stay figures.
   - No second, plainer copy of any of them.
4. **Paged, sectioned and navigable.**
   - A sidebar table of contents with progress ticks, and an in-page
     contents list for a long chapter.
   - Previous/next, and the address keeps your place.
   - A page never shows "all the exam questions" at once.
5. **A place to work for every question.** No question is shown without
   room to answer it.
6. **Board-faithful papers.** A paper looks and is timed like the board's.
7. **No in-app AI judgement of your work** (§8). The app records, measures
   and exports. A model you choose does the reviewing, and its feedback
   comes back in.
8. **Your layout rules hold:** short lines, no block inside a callout, no
   dead space, and the same rhythm as CS and Maths notes.
9. **Content is data.** New papers and revision chapters are authored files
   the pages read, so a later redesign keeps them.

---

## 4. The new structure

### 4.1 All exams (`#/exams`)

- **The next exam** as one hero: its countdown, today's session for it
  (§4.3) and Start.
- **Upcoming:** every assessment as a row (kind, date, days left, a
  one-word state) that opens its page.
- **Shared tools, one tab row only:** Timetable · Results · Library · Load.
  Today's Readiness, Planner, Practice and Companion tabs move INTO each
  exam.
- **Add:** New assessment, Import timetable, Log a result (a teacher-marked
  mock, §7.4).

### 4.2 An exam (`#/exams/<id>[/<section>]`)

A left sidebar (a sheet on the phone) lists the sections, each with a
progress mark:

| Section | What it is |
|---|---|
| **Today** | Today's session for this exam, with Start (§4.3) |
| **Plan** | The countdown: days to the exam, sessions placed by the planner, send to Pacing (existing `KOS.examPlan`) |
| **Topics** | The scope as a checklist (§4.4) |
| **Revise** | The revision guide, which replaces the Companion (§5) |
| **Questions** | Practice by topic with working space (§6) |
| **Papers** | Board-faithful and custom papers, timed (§7) |
| **Review** | Results, recorded attempts, imported feedback and targets (§8) |
| **On the day** | The Exam Room: room, seat, checklist, final recall |

There are no tabs inside these sections beyond the section's own filters.

### 4.3 Today's session

It is computed, never stored. It follows the ladder the planner already
uses, worded as steps:

1. due cards in the scope;
2. redo items;
3. the weakest topic's next step (read the chapter, then 5 questions);
4. a paper on paper days;
5. one target from imported feedback (§8.5).

Each step opens where the work is done and comes back. Readiness's four
signals become the reasons behind the steps ("Recall 62% · 30 cards
due"), never a band on its own.

### 4.4 Topics: the scope as a checklist

This takes the place of your school's Personal Learning Checklist. One row
per topic in the scope, with:
- your confidence (RAG);
- recall;
- best marks on its questions;
- the date you last practised it.

A row opens three things: the chapter in Revise, its questions, and its
cards. The list sorts by "weakest first" or spec order.

**Scope from a list:** paste or type a topic list like the PPE slide. The
app matches each line to specification topics, shows the matches, and you
confirm. Nothing guesses silently: an unmatched line stays visible.

**A mock that spans two board papers** (the CS PPE) is supported. It keeps
both papers' Companion material and blueprints (§9.2).

---

## 5. Revise: the revision guide (replaces the Companion)

It is a paged guide, one chapter per page, with a sidebar of chapters
showing read ticks and an in-page contents list. Chapters:

1. **Exam essentials**, one per board paper:
   - the paper at a glance (time, marks, sections, minutes per mark);
   - command words with what earns the marks;
   - performance objectives (F201's PO1–PO3, read from the stem);
   - levels-of-response grids, with a structure for 6- and 9-mark answers;
   - what the formula booklet gives you and what you must memorise (Maths);
   - calculator set-up (FX-991CW);
   - what is NOT examinable.

   Built from `js/data/exam-playbook.js` and new authored text (§10).
2. **One chapter per topic in the scope**, ordered weakest first (or spec
   order). Each chapter:
   - the key notes, drawn by `KOS.content` with real callouts, figures and
     tables;
   - must-memorise lists and mnemonics;
   - how it is asked: the shapes from the full Companion where they exist,
     each with ONE worked answer shown and "more" behind a button;
   - the traps;
   - **answer templates** for that topic's common command words;
   - at the end, "Practise this": 5 questions (§6) and its cards.
3. **Where you lose marks:** made from YOUR attempts and imported feedback
   (§8), in the manner of the statistics cheatsheet's "ten ways you lose
   marks". It is empty, and says how it fills, until there is evidence.
4. **Cheat sheet:** every mnemonic, definition and formula in the scope on
   one printable page.
5. **The night before:** a checklist to tick (per exam, synced), the
   routine for the exam and the Exam Room's list.

Print gives the whole guide or one chapter, laid out for paper.

**What goes:**
- the six-section scroll;
- the flattened text;
- the rapid drill as a page of its own. A drill becomes a mode of the
  flashcard engine: a timed run of the scope's must-memorise cards.

---

## 6. Questions

- The scope's exam questions through `KOS.quiz.mountExam`, so each has
  Type · Write (the answer pad) · On paper, the tally, the model answer and
  its history.
- **Filters:** topic, marks (1–2 · 3–5 · 6+), command word, not tried,
  dropped marks last time.
- **Sets of five:** "5 from my weakest topic", "5 six-markers", "the ones
  I got wrong". The page shows one question at a time with ‹ › and a set
  navigator. The address holds the place.
- Redo items from papers appear here too, marked as such.

---

## 7. Papers

### 7.1 Board-faithful papers

A paper definition gains a FORMAT per board:
- **OCR (F201):**
  - one context for the paper, introduced in short stems with data or
    tables where needed;
  - numbered questions with lettered parts and (i)/(ii) parts;
  - `[n]` marks and answer lines;
  - one 6-mark and one 9-mark levels-of-response question;
  - 60 marks, 1 h 30;
  - the SAM's cover page wording, but "written by KurenaiOS, not an OCR
    paper".
- **AQA and Edexcel:** their own conventions (the Edexcel total line stays
  for Edexcel only).

**Authored papers (§10):**
- **F201:** three original papers, each its own organisation, to the SAM's
  blueprint and mark distribution, with full mark schemes in OCR's form
  ("one mark for identifying… one for…") and level descriptors for the
  extended answers.
- **CS PPE:** a 2 h 30 paper over the PPE's topic list in AQA's style,
  drawn from the full Companion's variations for Paper 2 topics and new
  ones for the seven Paper 1 topics.
- **Maths Pure:** two papers over the mock's chapters in Edexcel's style,
  every number checked by program.

### 7.2 A custom-scope paper

Any assessment can build a paper to its own time and scope (the PPE's
2 h 30). It is labelled "built from your scope" and uses the same blueprint
rules as a predicted paper (marks to the time, short to long).

### 7.3 Sitting it

**On the iPad**, a paper runs full screen:
- an answer pad under every part (Write by default, Type for code);
- a navigator of parts with flags ("come back");
- the clock with extra time.

Pause rules (EX-32, EX-42): Pause stops the clock and hides the paper;
time-up fires on time; a reload comes back paused. Everything is recorded
(§8.1).

**On paper:** print it, sit it, then log marks per part (§7.4).

### 7.4 Marking and logging

- **The tally:** you mark beside your own answer, with the scheme in a
  second pane. Each mark point is a chip that names the point. An A mark
  needs its M.
- **Levels-of-response questions** are marked by choosing a level against
  its descriptors, then a mark within the level, with the indicative
  content as a list to tick.
- **Logging is automatic.** Marks per part, topics and tags are logged as
  ONE attempt (invariant 124), with the estimated grade from boundaries
  where they exist. Nothing is retyped.
- **A teacher-marked mock** logs fast: scan or photograph it (Scan pages
  exists), then type the marks per question in a grid with Tab between
  cells.

---

## 8. Recording an attempt, and feedback from a model you choose

This is your idea, adapted. As you asked, no in-app model judges your
work: Kurenai's Flash model is too unreliable and rate-limited. The app
records and measures. You take an export to Claude or Gemini on your own
subscriptions, and bring the reply back.

### 8.1 What is recorded (events only, never video)

While a paper, a set of questions or a timed question runs in the app, an
event journal records for each part:
- when you opened it, and the time to your first stroke or keystroke;
- writing time and idle gaps (over 20 s, counted and summed);
- pauses of the clock;
- returns to a part;
- erasures, undos and crossings-out (the eraser and lasso-delete);
- the order you answered in;
- flags;
- parts skipped;
- time left at the end.

Strokes already carry timing inside each stroke. Each stroke gains a
start time.

**Storage:** a new IndexedDB store `kurenai-os-attempts` (one record per
attempt: the events and the derived figures). It is listed in the store
registry (invariant 7) and rides the full backup. It syncs (decision D1):
replicated to an owner-only table `kos_attempts` (a migration), local
first, wrapped by `KOS.sideSync` like the review log (invariant 36d).

### 8.2 Diagnostics on the device (no model)

Computed the same way every time, from the journal and the marks:
- **minutes per mark** by part, topic, command word and mark band, against
  the paper's budget;
- **parts that took a lot of time for few marks**, and parts rushed for
  few marks;
- **hesitation:** a long delay before starting, set against marks lost;
- **parts with heavy erasing;**
- **pacing:** your marks gathered against time, beside the ideal line;
- **marks lost** by topic, by performance objective (F201), by tag and by
  level on extended answers;
- **the trend** across attempts for the same paper type.

These show on the attempt's Review page as short lines and small charts,
each with evidence (invariant 76: no chart without enough data).

### 8.3 The review pack (export)

"Get feedback on this attempt" builds ONE pack. It is two things to paste
or drag (decision D2):

1. **One clipboard copy** ("Copy for Claude or Gemini"), a single text in
   strict XML-tagged sections (Appendix A):
   - the instructions;
   - the paper (each part's question, marks and scheme, with the level
     descriptors where they apply);
   - your typed answers;
   - your mark-scheme results per part (the points ticked and missed);
   - the event figures per part (§8.1–8.2);
   - the answer format.
2. **The written pages as 2–4 files** ("Download pages"):
   - whole answer pages, merged in paper order (`KOS.inkExport`), never a
     crop per sub-part;
   - one PDF for the paper, or as few PNGs as the page count allows (up to
     four, each a stack of pages);
   - each page labelled in its header with the parts it holds, so the
     model can match them to `<part id>`.

Nothing is sent anywhere by the app. The pages leave the device only by
your own copy or download.

### 8.4 Feedback back in (import)

"Add feedback" takes the model's whole reply pasted in. The prompt asks
for its readable part inside `<review>` and for ONE fenced ```json block
(Appendix B): findings, each tied to parts, with an `error_type`, evidence
and one prescription. The parser reads the JSON block and nothing else.
The same template works with Claude Opus (mostly used) and Gemini 4 Argon
(decision D6).
- The app validates it. A reply that does not fit is shown with what is
  wrong, and nothing is stored.
- Accepted feedback is stored on the attempt as `feedback`, keyed by
  source and date, so you can import from Claude and Gemini and compare.

### 8.5 Targets

Each prescription can become a **target**: "Use PEEL with a conclusion on
9-markers", "Spend ≤ 1.5 min per mark on 2-markers", "Revise data
wrangling". A target:
- links to what practises it (a chapter, a question set, a card run, a
  checklist item);
- shows on the exam's Today as one step (§4.3);
- is **checked by evidence where it can be:** a later attempt's figures
  ("minutes per mark on 2-markers: 1.9 → 1.3") or marks on that topic. You
  close it, or the evidence closes it after two attempts meet it.

"Where you lose marks" (§5) is drawn from the feedback and the targets.

---

## 9. Data and engine changes

### 9.1 Facts and fixes

- `ocr-f201`'s preset: `mins: 90` (SAM), its sections, and the PO tags.
- **Marking fixes:**
  - CC-25: IT schemes as one point a mark;
  - CM-15: the 24 Maths worked examples' marks;
  - CM-21: an item citing two questions;
  - EX-29: "of null".
- **Timed-paper fixes:** EX-32 and EX-42.
- **Honesty fixes:** EX-40 (start-by sized to the scope and the days left)
  and EX-47 (no limiting signal without evidence).

### 9.2 Multi-paper scopes

An assessment may carry several board papers (`presets: []`, with
`preset` kept as the first for older readers). The Companion material and
the paper blueprint read every paper the scope touches.

### 9.3 The paper format

`KOS.examPaper` definitions gain:
- `format` (ocr-case, aqa, edexcel);
- `context` (an organisation's stem and data);
- `parts` with `dependsOn` ((i)/(ii));
- `level` grids for extended answers.

Authored papers live in `js/data/exams/papers/<board-paper>-<n>.js`,
labelled and original. They are inside a lazy bundle (invariant 168).

### 9.4 New records

- **`kurenai-os-attempts`** (§8.1).
- **`state.exams.targets`:** synced, keyed by a random id: text, the
  exam, links, the evidence rule and the state.
- **`state.exams.checklists`:** the night-before ticks per exam.

### 9.4a Added by the user, 18 November 2026

- **No interval longer than the run-up to a near exam.** While a REAL
  exam (or a mock with its cap on) whose scope holds a card's leaf is 60
  days away or less, no review may be scheduled more than a fraction of
  the days left (proposed: a third of them, at least 3 days, at most 21),
  so every card comes back at least two or three times before the exam;
  a card already scheduled past that is brought forward once, the way
  `examPass` does (invariant 111a, widened). For every exam subject, not
  only IT; F201's January sitting is the first case.
- **Ink travels with a file.** "Save a copy with my writing" exists only
  in the PDF viewer's ⋯ menu. Every Download, Share and Attach-elsewhere
  of a file that has ink (a topic's Files tab, an assignment's
  attachments, Files) offers "With my writing" FIRST and "The original"
  second, with a per-device choice of which is the default — so homework
  written on the iPad can be submitted as one PDF. It reuses the viewer's
  pdf-lib flattening, as the review pack's pages do.

### 9.5 Revise's reading progress

Per device, like a lesson's pages.

### 9.6 Performance

- Readiness memoised per render and once at boot (AP-18).
- The first render under 0.5 s on the dense account (AP-03).

### 9.7 Invariants to write when it is built

- 124 (the attempt's journal and feedback);
- 127 (authored, board-faithful papers);
- 130 (multi-paper scopes);
- a new one for the journal, the export and the import: local, nothing
  sent by the app, and an import validated before anything is stored.

---

## 10. Content to author, for the mocks only

| Item | Size | Checked by |
|---|---|---|
| F201 exam essentials chapter | 1 chapter | the SAM and its scheme |
| F201 papers 1–3 (case studies, schemes, level grids) | 3 × 60 marks | the SAM's blueprint: marks per topic area, PO spread, one 6 and one 9 |
| AQA exam essentials (Paper 1 and 2) | 2 chapters | AQA's command words and reports |
| CS full Companion for the PPE's seven Paper 1 topics (OOP, stacks, queues, recursion, graphs, trees, sorting and searching) | shapes, worked variations, practice | `cs_diff`, a trace check, the index |
| CS PPE practice paper | 1 × 2 h 30 | the index blueprint |
| Edexcel Pure exam essentials, the formula booklet and memorise list, the calculator | 1 chapter | the Edexcel formula booklet |
| Maths Pure mock papers | 2 papers | every answer computed by program |
| Answer templates by command word | per board | the schemes |

---

## 11. Findings, mapped

| How | Findings |
|---|---|
| Fixed by the new structure (the old page goes) | EX-02, 05, 06, 09, 10, 11, 14, 19, 20, 21, 22, 23, 24, 30, 31, 41, 46, 47, 48 and UR-28 |
| Fixed in code in this rework | EX-28, 29, 32, 40, 42, 49 (to re-check), CC-25, CM-15, CM-21, AP-03, AP-18 |
| Ink and Files, outside this area: left to W3/W9 unless a page here needs them | EX-03, 04, 07, 08, 12, 13, 15, 16, 17, 18, 26, 27, 34, 35, 36, 37, 38, 43, 44, 45 |
| Already fixed | EX-01, 25, 33, CC-14, CC-17, CM-14, UR-26 |
| Closed, not reproduced | UR-27 (reopen with a screenshot) |

---

## 12. Phases and dates

| Phase | What | When |
|---|---|---|
| 0 | W8's CLAUDE.md trim, so every session after it is cheaper | first, half a session |
| 1 | The design prompt D-Exams (Appendix C) → you send it to Claude Design | right after approval |
| 2 | Content (§10) while the design is out: F201 first, then CS, then Maths | ~3 sessions |
| 3 | Engine work that needs no design: §9.1–9.4, the journal, the pack and its import | ~2 sessions |
| 4 | The pages from the handoff | ~3 sessions |
| 5 | iPad and phone checks, the gate, your go-ahead, deploy | target **1 December**, and no later than **Friday 4 December**: the mocks are all in the week of 14 December (exact dates not known yet), so this leaves at least ten days of use |

The rest of W8 and the W1/W7 P2/P3s come after the deploy. W3 and W9 stay
the other account's.

---

## 13. Decisions (yours, 17 November 2026)

- **D1. Recorded attempts sync between devices: yes.** They replicate like
  the review log (an owner-only table, local first, a migration).
- **D2. Written pages go in the pack: yes, with your tweak.** The question
  text, your mark-scheme results and the prompt go to the clipboard as ONE
  copy. The written pages are exported as merged whole pages, so there are
  only 2–4 files to drag in, never a crop per sub-part (§8.3).
- **D3. The old Companion's address redirects: yes.** Its pages become
  Revise's "how it is asked" sections.
- **D4. Mock dates:** not known yet, but all in the week of **14 December**.
  The deploy lands by 4 December at the latest.
- **D5. The phone: yes.** It covers Today, Topics, Revise, cards and
  Review. Papers are on the iPad and Mac.
- **D6. Feedback models:** mostly Claude Opus, sometimes Gemini 4 Argon.
  The template uses STRICT XML tags for every section and field the model
  reads, and ONE fenced JSON block for the reply, so it works the same on
  both and the paste-back parser never depends on prose.

---

## Appendix A — the review-pack prompt (draft)

Every section is in an XML tag, and every field the model must echo back
(a part's id, the attempt's uid) is an attribute, so both models copy it
exactly.

```xml
<instructions>
You are reviewing one exam attempt by a sixth-form student so they can
improve before their next paper. Judge ONLY against the <scheme> and
<levels> given; refer to parts by their id attribute; never invent a mark
scheme or a board rule. The handwritten pages are attached as files; each
page's header names the parts on it.
Do three things:
1. Diagnose where marks were lost and why, each finding with evidence
   from the answer or the <timing>.
2. Check the self-marking: flag a mark that looks too generous or too
   strict against the scheme.
3. Prescribe at most 6 actions, most valuable first, each specific
   enough to practise this week.
Reply with your readable review inside <review>…</review>, then ONE fenced
```json block exactly as in <answer_format>. Nothing after it.
</instructions>
<attempt uid="{uid}" board="{board}" paper="{paper}" sat="{date}"
         timed="{yes|no}" time="{mins}" marks="{got}/{max}"
         budget_min_per_mark="{budget}" extra_time="{n}%"/>
<paper>
  <context>{the case study, for OCR}</context>
  <part id="1(a)" marks="1" topic="F201.1.1" command="State">
    <question>…</question>
    <scheme>…</scheme>
    <levels>{level descriptors, for 6/9-mark parts}</levels>
    <typed_answer>{if typed}</typed_answer>
    <marking marked_by="self|teacher" got="1">
      <point code="1" ticked="yes">…</point>
    </marking>
    <timing first_mark_s="…" writing_s="…" idle_s="…" idle_gaps="…"
            erasures="…" returns="…" min_per_mark="…" flagged="no"/>
  </part>
  …
</paper>
<error_types>knowledge method technique command_word timing presentation misread</error_types>
<answer_format>{Appendix B}</answer_format>
```

## Appendix B — the import format (draft)

```json
{
  "kos": "exam-feedback/1",
  "attempt": "<attempt uid, copied from the pack>",
  "model": "Claude Opus 5.5 | Gemini …",
  "summary": "two or three sentences",
  "remark": [{ "part": "3(b)", "was": 2, "should": 1, "why": "…" }],
  "findings": [{
    "parts": ["6(c)"], "error_type": "technique",
    "what": "No conclusion on the 9-marker", "evidence": "…",
    "lost": 3
  }],
  "actions": [{
    "text": "Write a judgement paragraph on every 9-marker",
    "kind": "technique | topic | timing | practice",
    "topic": "it:F201.2.6 (optional)",
    "measure": "optional: what a later attempt should show"
  }]
}
```

The validator takes only these fields, caps the text lengths, checks every
part named exists in the attempt, and shows what it would store before it
stores it.

## Appendix C — the design prompt (outline; written in full after approval)

D-Exams covers:
- All exams;
- an exam's sidebar with its eight sections at Mac, iPad (both
  orientations) and phone;
- Today with a step running;
- Topics with the paste-a-list scope;
- a Revise chapter (notes, how it is asked, traps, templates, practise
  this) and the night-before checklist;
- Questions with a set of five and the answer pad;
- a paper being sat on the iPad (navigator, flags, the clock) and its
  OCR case-study layout;
- the tally beside the answer, and a levels-of-response marking sheet;
- an attempt's Review (diagnostics, the pack's Copy and Download, Add
  feedback with its validation states, targets);
- empty and thin-evidence states throughout.

It uses the app's Graphite and Dawn tokens and existing components; your
revision documents are named as the reference for what a good guide
contains.
