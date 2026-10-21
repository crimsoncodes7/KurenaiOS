# Exams & Deadlines Hub (plan, revision 2)

Asked for on 20 October 2026, after FSRS shipped (`fbea5d5`). Roadmap 5.8.
This grows Study → **Exams & Papers** into the place where assessments,
revision priorities, readiness, practice evidence and goals meet. It
connects to `KOS.goals`, Home, Focus, Review, Pacing, Calendar, Reports and
the Assistant.

The core principle: **an assessment is not just a date.** It is a
classified event with a scope, a readiness model, a preparation workflow,
evidence from practice, and optional linked goals.

The design prompt is [design-prompts.md §13](design-prompts.md) (frames
29a–29x).

**Revision 2 (20 October 2026).** Decisions A–N approved, with five
refinements folded in (marked **R1–R5** below). Section 16's suggestions 1,
2, 4, 6, 7, 8, 9 and 10 are in the plan; 3 and 5 stay light and optional.
**Phases 1, 2 and 3 are built** (§19), phase 3 styled to design turn 29
(frames 29a–29ac).

| | Refinement | Where |
|---|---|---|
| R1 | "Covered in Pacing so far" is a live rule while the assessment is ahead and **freezes** into a leaf list once its date passes or its result is logged | §6.3 |
| R2 | A redo item **weighs its marks** in a leaf's recall (and R_exam), and a lapsed redo item flags the leaf | §3.3, §7 |
| R3 | `js/data/exam-index.js` is **committed**; the generator fails with a clear message when the folder is not on the machine | §4.1 |
| R4 | CS Paper 1's **Sections B–D** (write a program, the Skeleton Program) are part of the blueprint and the Companion, not only 4.1–4.4 | §6.2, §13.2 |
| R5 | The Phase 6+ paper order is **flexible**: the nearest mock or sitting goes first | §13.2 |

---

## Contents

0. [Summary](#0-summary)
1. [What exists today](#1-what-exists-today)
2. [Decisions](#2-decisions-proposed-for-your-review)
3. [The data model](#3-the-data-model)
4. [The evidence base: past-paper index, boundaries, examiner's reports](#4-the-evidence-base)
5. [Tiers: the assessment classifier](#5-tiers-the-assessment-classifier)
6. [The Scope Builder](#6-the-scope-builder)
7. [Readiness](#7-readiness)
8. [Practice and results: logging, post-mortems, redo items](#8-practice-and-results)
9. [Prescriptive analytics](#9-prescriptive-analytics)
10. [The revision planner](#10-the-revision-planner)
11. [Start-by dates and deadlines](#11-start-by-dates-and-deadlines)
12. [Exam Season mode and the Exam Room](#12-exam-season-mode-and-the-exam-room)
13. [The Study Companion](#13-the-study-companion)
14. [Goals](#14-goals)
15. [The rest of the app](#15-the-rest-of-the-app)
16. [More suggestions](#16-more-suggestions)
17. [Architecture](#17-architecture)
18. [Invariants](#18-invariants-this-would-add)
19. [Releases and gates](#19-releases-and-gates)
20. [Risks](#20-risks)

---

## 0. Summary

- **One canonical assessment record** (`state.exams.assessments`). It has a
  tier, a composable scope, logistics, a checklist, and links to its
  attempts and goals.
  - Calendar exam events and IT sitting dates migrate into it once.
  - The Calendar then draws assessments as derived chips, the way it
    already draws bills (invariant 44).
- **Four tiers** decide how much machinery an assessment gets:
  `real_exam` · `mock` · `topic_test` · `retrieval_test`. NEA and
  coursework deadlines are a fifth kind, `deadline`: no scope readiness,
  but start-by dates and milestones.
- **The Scope Builder** handles the mid-year mock problem: paper presets,
  "Covered in Pacing so far", a tree picker, and explicit exclusions with
  an "Excluded from this test" callout. **The FSRS exam cap switches from
  subject to scope.**
- **Readiness has four signals,** each explained, scaled by tier, and
  silent without evidence:
  1. Pacing coverage of the scope;
  2. RAG across the scope;
  3. projected exam-day recall (R_exam, from FSRS);
  4. timed practice.
- **Practice logging grows,** and stays quick by default:
  - a past paper picked from the index fills its marks and questions;
  - topic packs (ours and PMT's) can be logged too;
  - per-question marks and error tags are optional;
  - a missed question can become a **redo item** on FSRS.
- **Prescriptive analytics** turn the evidence into decisions:
  - where the next ten marks come from;
  - a predicted grade as a range;
  - error-pattern prescriptions;
  - your pace per mark;
  - how well your self-predictions match your actual marks.
- **A read-only revision planner** gives each week's allocation by topic.
  It has one approved action, "Send to Pacing / Today", and never writes
  calendar blocks.
- **Exam Season mode, start-by dates, and the Exam Room** (a calm final
  hour).
- **The Study Companion, scaled by tier:**
  - assembled from existing study material for small tests;
  - for real exams and mocks, an exhaustive authored layer **beyond the
    topic notes**: archetype catalogues with lettered variations,
    M1/A1/B1 annotations, method comparisons, board working rules, a
    playbook drawer, likelihood analysis from the real past-paper index,
    and original predicted papers with board-style mark schemes.
- **Five exam goal types** registered in `KOS.goals`, linked by `examId`,
  with templates offered when an exam is created.

---

## 1. What exists today

| Piece | Where | What it gives the hub |
|---|---|---|
| Exams & Papers | `js/core/tracker.js`, `js/modules/tracker.js` | One record, `kind: exam \| paper`: `subject`, `refs`, `paper`, `topic`, `marks`, `max`, `grade`, `date`, `well`/`badly`/`notes`, `reviewed`. A save logs a `tracker` session and feeds RAG. Becomes the **attempt** record (§8). |
| Calendar exams | `js/modules/calendar.js` | `type: "exam"` events with `examLevel` (exam · mock · topic · retrieval), `paper`, `room`, `durationMins`, `refs`. They lead Home's Focus card by kind (`EXAM_LEVELS` lead days and goal minutes). Migrated into assessments (§3.4). |
| IT units | `js/core/itunits.js`, `js/data/it-grades.js` | Unit marks, statuses, sitting dates and boundaries. F201 is an exam you sit; F204 and F206 are NEA (deadlines). The hub reads them; `KOS.hub.it` stays the grade owner. |
| FSRS | `js/core/fsrs.js`, `js/core/srs.js` | R per card, `topicMemory`, the exam cap (`examFor`, `examPass`, invariant 111a), leeches. R_exam and the cram decks come from here. |
| Pacing | `js/core/pacing.js` | Plan rows with spec leaves; coverage is READ from progress (invariant 82); `coverage(entry)`; carry-over. "Covered in Pacing so far" and the planner's send action land here. |
| RAG | `js/modules/rag.js` | The per-topic band, now FSRS-aware. |
| Goals | `js/core/goals.js` | Registry with `register(def)`; `links` already carry `subject` and `refs`; types `study-paper-score` and `topics-green` exist and are generalised (§14). |
| Spec papers | `js/core/spec.js` `KOS.spec.papers` | CS Paper 1 and 2, Maths Pure, Statistics and Mechanics, IT units. These are the Scope presets. |
| Content | `js/data/content/*`, `bank-*.js` | Every CS and Maths leaf already has paged notes, worked examples with board marks, an exam toolkit, misconceptions, flashcards, a quiz and derived exam items. The banks hold past-paper patterns per leaf. The Companion must go **beyond** these (§13), not repeat them. |
| Labs | `js/labs/lab.js` and archetypes | The lab system the Companion's sandboxes reuse. |
| Reports | `js/core/report.js` | Saved facts per period; exams add facts (§15). |

**Your folder (`~/Downloads/A-level`)** is the evidence base.
- **Past Papers:** 291 papers and booklets.
  - Edexcel 9MA0/8MA0: June 2018 to June 2025, plus the autumn series,
    Sample and Specimen.
  - AQA 7517/7516: June 2016 to June 2025, plus pre-release material.
- **Topic Practice, our compilation:**
  - Maths: 267 PDFs. CS: 242 PDFs.
  - `Question Index.xlsx`:
    - Maths: 912 question rows over 44 sittings;
    - CS: 1,158 rows over 36 sittings;
    - each row gives level, paper, session, question, **marks**, topic,
      sub-topics, and the reason for the tag.
  - Packs sheet: 510 packs.
- **Topic Practice, PMT:** topic sets, Solomon worksheets, cheat sheets and
  notes.
- **`_build/*/manifest/classification.csv`:** the hand-edited
  question-to-topic map, audited at a 16% sample with no mis-tags.

**Gaps.**
- **No examiner's reports.** The Misconceptions Blacklist and the
  discriminator post-mortems need them. The boards publish them free, so
  §4.4 adds a fetch step.
- **IT is a new qualification** (OCR Cambridge Advanced National), with
  only a sample and specimen paper or so. Its likelihood analysis is
  marked low-evidence.
- **The PDFs are copyrighted** and are never bundled or deployed. The app
  stores references (paper, session, question, marks, topic) and original
  material only (decision C). See §4.5 for how your own copies can still be
  opened inside the app, on your device.

**Your reference documents** set the floor, not the ceiling:
- `AS_Pure_Maths_Revision.docx`: exam essentials, booklet vs memorise,
  command words, FX-991CW, variations per topic, methods 1–3.
- `AS_Pure_Interactive.html`: 144 worked variations with B1/M1/A1 steps,
  10 labs, 36 self-marked exam items, MCQs, checklists, a formula drawer.
- `DataStructures_Revision.docx`: definition boxes, memory diagrams,
  comparison tables, trace tables.
- `F200_Mock_Paper_1.docx`: board-format cover sheet, PO-tagged mark
  scheme, levels of response.
- `F200_Subtopic_Questions.docx` and `F200_Practice_Questions.docx`:
  five questions per subtopic with marks.

The hub keeps all of that, adds evidence (real frequencies, your own
results), interactivity bound to the app's data, and scale (every leaf of
every paper).

---

## 2. Decisions (proposed, for your review)

| | Decision | Recommended |
|---|---|---|
| A | The canonical exam record | **A new `state.exams.assessments`.** Calendar exam events migrate once; the Calendar reads assessments as derived chips. One record, many readers (invariant 27). |
| B | Where attempts live | **The existing tracker record, widened** (`assessmentId`, `source`, `timed`, `mins`, `questions[]`, `tags`). Past results keep working; RAG, the ledger and Reports keep reading it. |
| C | Copyright | **No past-paper text or images in the app's code or the deploy** (the deploy is a public URL). Your own copies can be opened in the app from your device (§4.5). Store references and metadata. Every question the app shows is original and **modelled on** an archetype, as the banks already are. Examiner's reports are paraphrased, never quoted at length. |
| D | Evidence data | **Generated, never hand-edited** (invariant 24 style): `tools/gen_exam_index.py` reads `Question Index.xlsx` and a hand-checked mapping (`tools/exam-index/map.csv`, board sub-topic → spec leaves) and writes `js/data/exam-index.js`. |
| E | Readiness as one number | **No blended score.** Show the four signals, plus a band (Ready · On track · At risk · Not enough evidence) with its rule stated. A blend hides which lever to pull. |
| F | The planner | **Read-only allocation; one approved action** writes personal Pacing rows for this week (tagged `exam`), never Calendar blocks (as you specified). |
| G | Redo items | **A new review source on FSRS** (`x:<attemptId>:<q>`): "redo June 2019 P1 Q8", self-marked Again/Hard/Good/Easy, labelled Self-marked, paying nothing. Not a custom flashcard. |
| H | Grade boundaries | **A table, `js/data/boundaries.js`**, per board, qualification and series, each row `confirmed: true/false` like the IT table. A predicted grade uses the last three series' range and says so. |
| I | Companion content | **Authored, released one paper at a time, whole** (like Code units). A content contract and smoke per paper. Numbers checked by sympy/scipy, C# by `cs_diff`. |
| J | Predicted papers | **Original papers assembled from the archetype bank to the board's blueprint** (sections, marks, ramp, command-word mix). Labelled "Predicted practice paper — written by KurenaiOS, not a board paper". |
| K | Exam Season trigger | **Automatic** when a real exam is 28 days out; **manual** on/off at any time; off once the last real exam of the series has passed. |
| L | Mock cap | **Off by default** for a mock (opt in per mock). Always on for a real exam whose scope holds the card (invariant 111a, rewritten). |
| M | Error tags | A **fixed vocabulary of 10** (§8.3), optional and multi-select per question. Never required to sum to the marks lost. |
| N | Numbering | Frames **29a+**, invariants **120+**, smokes **89+** (Japanese keeps 28a+, 112–118 and 80–83). |

---

## 3. The data model

### 3.1 `state.exams` (synced, keyed maps, behind `KOS.exams.normalise`)

```js
state.exams = {
  v: 1,
  assessments: {                 // keyed by a random string id (cloudmerge-safe)
    "a7k2": {
      id, title,                 // "AQA CS Paper 1"
      tier: "real_exam" | "mock" | "topic_test" | "retrieval_test" | "deadline",
      subject,                   // "compsci" | "maths" | "it" | null (multi-subject mock)
      board, qual, paper,        // "AQA", "7517", "Paper 1"  (from a preset, editable)
      date, time, durationMins, location, seat,
      provisional: true,         // a date from a provisional board timetable
      scope: { presets: ["compsci:paper1"], prefixes: ["compsci:4.1"],
               include: ["compsci:4.2.3.1"], exclude: ["compsci:4.4.5.2"],
               pacingCovered: null | { upTo: "2026-12-04" } },
      cap: true | false,         // FSRS exam cap (forced true for real_exam)
      marks: 75, calculator: "fx-991cw" | "none" | null,
      extraTime: 0,              // access arrangement, % (25 = 25% extra)
      startBy: null | "2026-11-02",   // override; else derived (§11)
      checklist: [{ id, text, kind: "manual" | "auto", rule?, done?, at? }],
      season: null | true | false,    // manual override of Exam Season
      result: null | { marks, max, grade, ums, at, attemptId },
      milestones: [{ id, text, date, done }],   // deadline tier (NEA)
      links: { itUnit: "F201" | null, assignmentId: null, calendarId: null },
      created, updatedAt, archived: false
    }
  },
  prefs: { weeklyHours: null, seasonDays: 28, planWeekStart: "mon" }
}
```

- **Record ids are random strings,** so the cloud merge folds two devices
  per key and never re-keys (invariant 33a's lesson, as Money did).
- **The scope is stored as it was picked** and resolved on read
  (`KOS.exams.leaves(a)`), the way `refs` are (invariant 26e). A preset
  stays a preset, so a later spec change re-resolves it.
- **`result` is a link, not a copy:** it points at the attempt that
  records the real paper. For IT it mirrors into `state.itUnits` through
  `KOS.itUnits.setUnit`, which stays the owner of unit marks (invariant
  26f).

### 3.2 Attempts: the tracker record, widened (decision B)

```js
tracker.entries[i] = {
  …existing fields…,                   // kind, subject, refs, paper, topic, marks, max, grade, date, well, badly, notes
  assessmentId: null | "a7k2",         // which assessment it prepares for, or IS (the real result)
  role: "practice" | "result",         // a result is the real sitting of an assessment
  source: { kind: "past-paper" | "topic-pack" | "pmt-pack" | "predicted" | "custom-mock" | "class" | "other",
            ref: "edexcel:9ma0:p1:2019-06" | "pack:maths:P8:area-between-curves:A" | "kos:pred:9ma0-p1:1" | null },
  timed: true, mins: 112, conditions: "exam" | "open-book" | "untimed",
  predicted: null | 68,                // your guess before marking (calibration, §9.6)
  questions: [ { q: "8", max: 10, got: 6, refs: ["maths:P8.2"], archetype: "int.area-between", tags: ["method","slip"], redo: true } ],
  …
}
```

- **Quick log stays exactly as quick as today.** The new fields are all
  optional.
- **Picking a past paper from the index** fills `max`, the question list
  with each question's marks and leaves, and `source.ref`.
- **Per-question marks** fill `marks` when given. A total typed over them
  wins, with a small "questions add to 64, total says 66" note, never a
  block (your rule).
- **Normaliser and session behaviour.** `KOS.tracker.normalise` stays the
  gate. A save still logs one `tracker` session; a role of `result` is
  study evidence like any other entry.

### 3.3 Redo items (decision G)

- A question marked `redo` becomes an FSRS review item keyed
  `x:<entryId>:<q>`:
  - it is due the next day;
  - it shows "Redo · June 2019 Paper 1 Q8 · 10 marks · Area between
    curves", with your note and tags;
  - self-marked with the four buttons;
  - it carries its leaf, so topic memory, the scope's R_exam and the cram
    decks include it.
- **`srs.js` gains the source** (`allCards` lists redo items beside custom
  cards). The schedule record is the same shape, and the exam cap applies.
- **As built:** the key is `x:<uid>:<q>`, where `uid` is a random string
  every attempt now carries (tracker ids are per-device counters the merge
  may re-key, invariant 33a). A redo item pays nothing: a review batch of
  only redo items logs no session, and a mixed batch counts only the
  flashcards.
- **R2: a redo item weighs its marks.** In `KOS.srs.topicMemory` (and
  R_exam in phase 3) a redo item's recall counts `max(1, marks)` times, so
  ten easy definition cards cannot hide a failed 10-mark question. A redo
  item last marked Again, or not yet passed, flags its leaf
  (`redoLapsed`).

### 3.4 Migration (once, at boot, idempotent)

| From | To |
|---|---|
| Calendar `type: "exam"` events | One assessment each. Tier from `examLevel` (exam → real_exam, mock → mock, topic → topic_test, retrieval → retrieval_test). `refs` → `scope.include` (or `subject` → a whole-subject scope), plus `paper`, `room` → location, and `durationMins`. The event is kept but marked `migratedTo` and hidden; the calendar draws the assessment. |
| IT units `sitting` with a date | An assessment for each exam unit (F201: `real_exam`, preset `it:F201`); an NEA unit (F204, F206) becomes a `deadline` with its date. `links.itUnit` ties them. |
| Recurring exam events | Not migrated, because real exams do not recur. They stay calendar events. |

Afterwards: `KOS.srs.examIndex` reads assessments (§6.4); Home's Focus
ladder reads assessments with the same lead days; `EXAM_LEVELS` maps to
tiers.

### 3.5 Per-device state

`state.ui.exams`:
- the selected assessment;
- the Companion's last section;
- the drawer open or closed;
- the planner's week;
- Exam Room progress (a final-hour checklist is per device on the day).

---

## 4. The evidence base

### 4.1 The past-paper index (`js/data/exam-index.js`, generated)

```js
KOS_EXAMS.index = {
  boards: { aqa: {...}, edexcel: {...}, ocr: {...} },
  papers: { "edexcel:9ma0:p1": { title, level: "A", marks: 100, mins: 120,
            sittings: ["2018-06", …, "2025-06"] }, … },
  questions: [ ["edexcel:9ma0:p1:2019-06", "8", 10, ["maths:P8.2"], "int.area-between"], … ],
  packs: [ { id, source: "ours" | "pmt", subject, topic, sub, level, kind: "QP"|"MS", units, pages, file } ]
}
```

- **Built by `tools/gen_exam_index.py`** from `Question Index.xlsx` (the
  Maths and Computer Science sheets, and Packs) and the classification
  CSVs.
- **The mapping** `tools/exam-index/map.csv` takes each board sub-topic to
  one or more spec leaves:
  - hand-checked once, then held by a smoke;
  - every board sub-topic maps or is listed as "no leaf" with a reason;
  - a CS merged leaf (`CS_MERGES`) maps to its kept ref.
- **What it contains:** references and numbers only (decision C). The
  `file` paths stay relative to your own folder; the hub shows them as
  text ("Topic Practice/Maths — our compilation/Pure/08 Integration/…") so
  you can open them yourself, and never links into the deploy.
- **Rebuilt when your folder changes.** A new series is new rows; the
  likelihood figures move with it.
- **R3: committed and portable.** `js/data/exam-index.js` is in the repo,
  so a machine without the folder runs the app unchanged; the generator
  says so and exits 2 without touching the file (`--root` or `KOS_ALEVEL`
  point it elsewhere; `--check` compares).
- **As built (phase 2):** 9 papers, 1,448 questions (each question once,
  with every leaf its sub-topics map to), 890 packs (510 rows of ours
  folded into QP+MS packs, plus PMT's question packs by file name, linked
  at the unit), and the Year 2 lists. Every real sitting reconciles to its
  paper's marks; two specimens are short and listed in smoke90. CS Paper
  1's index covers Section A only (25–37 marks a sitting); the rest is
  Sections B–D.

### 4.2 Archetypes

- **An archetype is a recurring question shape within a leaf.** For
  example, `int.area-between` is "area between a curve and a line", with
  variations: a cubic and the axis, a curve and a tangent, a trapezium
  remainder, equal areas giving an equation, and so on.
- **The authored catalogue** (`js/data/exams/archetypes-*.js`) lists, per
  leaf: its archetypes, their variations A–n, and the index questions that
  are instances of each.
- **Tagging.** A first pass tags each indexed question by its "why this
  tag" text, and a review pass corrects it, held by a smoke: every indexed
  question has an archetype, or is "unique" with a reason.
- **This is what makes "the top archetypes cover ~50% of the paper"** a
  measured statement rather than a guess.

### 4.3 Grade boundaries (`js/data/boundaries.js`)

As built: AQA 7517 June 2023 and 2024 from AQA's own documents (subject out
of 375 and the notional component boundaries; confirmed), AQA 7516 Paper 2
June 2024, and Edexcel 9MA0 June 2023–2025 from three secondary tables that
agree (unconfirmed until checked against Pearson's document). AQA's June
2025 file was not reachable; add it when it is.


- Per board, qualification and series: raw marks for each grade, with
  `confirmed`.
- Sources: AQA and Pearson publish them per series.
- Used for a predicted grade (a range across the last three series), the
  `exam_grade` goal, and "marks needed".
- IT stays on `it-grades.js` (UMS).

### 4.4 Examiner's reports

- **Fetched** by an extension to `_build/fetch_pmt.py`, or a sibling
  `fetch_reports.py`, into `Past Papers/<board>/…/Examiner Reports/`.
- **Read once per series during authoring** into a paraphrased notes file,
  `tools/exam-index/reports/*.md`. For each low-scoring question: what was
  asked, what most candidates did, what earned the marks.
- **The app's Misconceptions Blacklist and discriminator post-mortems**
  are authored from those notes, each citing its series and question.
- If a report cannot be fetched, the item says "from the mark scheme"
  instead. It never invents an examiner comment.
- **As built:** `tools/fetch_reports.py` (AQA's file pattern for each
  year, plus any Pearson URLs listed in `tools/exam-index/report-urls.txt`)
  saves into your folder, idempotently (falling back to curl where
  Python has no CA certificates).
- **Fetched and written (20 October 2026):** AQA's file store still serves
  only its 2022 and 2023 reports, so seven were saved: 7517 Paper 1 (2022),
  7517 Paper 2 (2022, 2023), 7516 Papers 1 and 2 (2022, 2023). Their
  paraphrased notes are `tools/exam-index/reports/aqa-75{16,17}-{1,2}.md`,
  each point citing its series and question; smoke90 holds every cited
  question and its marks to the index. Pearson's feedback and the other
  AQA years wait for URLs in `tools/exam-index/report-urls.txt`.

### 4.5 Your own copies, opened in the app

The papers can't go in the code or the deploy: `kurenai-os.pages.dev` is a
public URL, so anything in the deploy is published to everyone, which is
redistribution (sites such as PMT and Maths Genie host them under their own
arrangements with the boards). On your own device it is a different matter:
a phase 3 "Paper library" lets you add your PDFs (or connect the folder,
where the browser allows it) into the existing on-device attachments store
(`kurenai-os-files`), matched to the index by file name. The hub then opens
the real paper and mark scheme beside a logged attempt or a Redo item. They
never sync unless you upload them yourself (invariant 36), and they are
never in a backup you share.

---

## 5. Tiers: the assessment classifier

| Capability | real_exam | mock | topic_test | retrieval_test | deadline |
|---|---|---|---|---|---|
| Examples | AQA 7517 P1/P2, Edexcel 9MA0 P1–P3, OCR F201 | December / March mocks | End-of-topic, chapter, unit test | Class quiz, formula check | NEA milestones, coursework, assignments |
| Scope | preset (editable) | Scope Builder | Scope Builder (usually 1 unit) | Scope Builder (a few leaves) | — |
| Readiness | 4 signals | 4 signals on its scope | R_exam + RAG (+ coverage) | R_today | milestones |
| FSRS cap | **always** | opt-in (decision L) | never | never | — |
| Cram deck (lowest R in scope) | ✓ | ✓ | ✓ | ✓ | — |
| Companion | exhaustive + predicted papers | scoped exhaustive + custom mock | assembled guide | rapid-recall sheet + 15-question drill | — |
| Likelihood analysis | ✓ | ✓ (within scope) | — | — | — |
| Post-mortem | result + practice | ✓ (the main one) | light | — | — |
| Exam Season | triggers it | joins it | — | — | — |
| Start-by date | ✓ | ✓ | ✓ | ✓ (short) | ✓ |
| Goals | all five types | all five | grade/score, recall, checklist | recall, checklist | checklist, milestones |
| Exam Room | ✓ | ✓ | short version | — | — |

**A tier change is allowed** (a "topic test" that turns out to be a mock).
It recomputes on read and moves nothing stored.

---

## 6. The Scope Builder

### 6.1 Shape

As built: `scope = { include, exclude, pacing }`. A preset is a board paper
(`a.preset`) whose `include` refs (`compsci:Paper 1`, `maths:Pure`) are
written into the scope when it is picked; a unit pick is an `include` ref
too, so `presets` and `prefixes` folded into `include`. `pacing` is
`null | { upTo, frozen, frozenAt, seen }`. Resolved by
`KOS.exams.leaves(a)` as:

```
leaves = resolve(presets) ∪ resolve(prefixes) ∪ resolve(include) ∪ covered(pacingCovered)
         − resolve(exclude)
```

- **Order:** union first, exclusions last, so an exclusion always wins.
- **Pure, never stored resolved.** The resolved list is what readiness,
  the cap, the companion and goals read.

### 6.2 Presets

These are `KOS.spec.papers` nodes plus board metadata:

| Preset | Leaves | Marks · time |
|---|---|---|
| AQA 7517 Paper 1 | 4.1–4.4 and 4.13 (Section A), plus Sections B–D on the Skeleton Program (R4) | 100 · 2 h 30 |
| AQA 7517 Paper 2 | 4.5–4.13 | 100 · 2 h 30 |
| Edexcel 9MA0 Paper 1 / Paper 2 (Pure) | P1–P10 | 100 · 2 h each |
| Edexcel 9MA0 Paper 3 (Stats + Mechanics) | S1–S5, M6–M9 | 100 · 2 h |
| AS variants (7516, 8MA0) | the AS subset | as published |
| OCR F201 | F201 | 60 · as published |

Marks and times are taken from the boards' specifications at build time
and checked into the preset table, never typed per exam.

### 6.3 "Covered in Pacing so far"

- **One click:** every spec leaf the plan covers (class or personal) in
  weeks ending on or before a date, by default the assessment date.
- **It is stored as a rule** (`pacing.upTo`), so the scope grows as the
  plan moves **while the assessment is ahead**.
- **R1: it freezes by itself.** Once the date has passed, or a `role:
  "result"` attempt is logged, the rule becomes a fixed leaf list
  (`pacing.frozen`, with `frozenAt`), at boot (`KOS.exams.freezePass`) or
  on the result. A past mock's scope never moves when Pacing is edited
  later.
- **The builder's preview** shows "+3 leaves since you made this test"
  when the rule has grown.

### 6.4 Tree picker, exclusions and the callout

- **The picker is the shared topic picker** (`KOS.topicPicker`) in
  multi-select with two modes, Include and Exclude, at subject, paper,
  unit, topic and leaf level.
- **Exclusions are listed,** and the assessment page draws an "Excluded
  from this test" callout:
  - every excluded unit or leaf, collapsed to its highest whole node;
  - one line on why exclusions matter ("these will not appear — don't
    revise them for this test").
- **A2-only quick exclusion** for AS-style and mid-year mocks: "Exclude
  Year 2 content", read from a `year2` flag on spec nodes, generated from
  the specification's AS/A-level markings.

### 6.5 The FSRS cap, by scope (invariant 111a rewritten)

- **The lookup changes.** `KOS.srs.examIndex` now lists assessments with
  `tier === "real_exam"`, or `tier === "mock" && cap`, whose date is after
  today, each with its resolved leaves.
- **`examFor(key)`** returns the earliest one whose scope **contains the
  card's leaf.**
- **Subject-wide matching is removed.** A Maths Pure card is not capped by
  Paper 3.
- **A redo item** carries its leaf and is treated the same.
- **What doesn't change:** the rest of 111a (the exam-day target, the 7–14
  day spread, "only ever shortens", the pass on save).

---

## 7. Readiness

Each signal is computed over the **resolved scope** and weighted by the
**leaf's mark weight** for that paper (§9.1), or uniform where there is no
index (IT, or a custom scope across papers).

| Signal | Definition | Shown as | Silent when |
|---|---|---|---|
| **Coverage** | share of scope leaves (mark-weighted) whose Pacing rows are ticked, or whose topic status is Started or Completed. Uses Pacing's own reads (invariant 82). | "78% covered · 6 leaves not yet met" + the list | the scope has no leaves |
| **RAG** | mark-weighted share at Green / Amber / Red (effective band, `KOS.rag.effective`), unrated shown apart | a three-part bar + "4 Red: …" | fewer than 3 rated leaves |
| **R_exam** | for each rated card in scope (flashcards and redo items): `R(examDate − last, s)`, averaged per leaf, then mark-weighted. Leaves with no rated card are listed as "no recall evidence", not counted as 0. | "Projected recall on 4 June: 84%" + the five weakest leaves | fewer than 20 rated cards in scope |
| **Practice** | timed attempts linked to the assessment or its board paper: count, last three percentages, trend, and a grade range from boundaries (§9.3) | "3 timed papers · 61 → 68 → 72% · predicted B–A" | none logged ("No timed paper yet — the first one sets the baseline") |

**The band** (decision E) reads all four:
- **Ready:** coverage ≥ 95%, no Red, R_exam ≥ the exam-day target, and
  the last timed paper at or above target.
- **On track:** the straight-line pace to those thresholds reaches them by
  the start of the 7–14 day window.
- **At risk:** otherwise.
- **Not enough evidence:** two or more signals are silent.

The page states the rule on hover or tap and names the one signal holding
the band down ("At risk — Practice: no timed paper yet").

**Scaling by tier:**
- a topic test shows R_exam and RAG, with coverage as a single line;
- a retrieval test shows R_today across its leaves and the cram deck;
- a deadline shows milestones and its start-by date only.

---

## 8. Practice and results

### 8.1 The log dialog (the existing one, extended)

- **Quick (default):**
  - fields: subject, paper (free text, or picked), score, out of, date,
    notes;
  - one Save;
  - the RAG preview stays.
- **Pick from the index:**
  - board → paper → session fills the title, max and duration;
  - offers "Enter marks per question" with the question list
    pre-filled (each question's marks and topic);
  - topic packs (ours and PMT's) come from the Packs catalogue, filling
    the topic links and the number of questions.
- **Per question (optional):** got / max per question; error tags; a redo
  toggle.
- **Before marking (optional):** "What do you think you got?" for
  calibration.
- **Timed?** A toggle with minutes, and the conditions (exam / open book /
  untimed).
- **Links:**
  - to an assessment ("Preparing for: CS Paper 1, 4 June"), defaulting to
    the nearest assessment whose scope covers the paper;
  - or "This IS the result of…".

### 8.2 The mock post-mortem (fast)

After a save with per-question marks, the post-mortem is one screen:
- marks lost by leaf and by archetype (bars);
- marks lost by error tag;
- the three questions that cost most;
- **one-click actions:**
  - make redo items;
  - add the weakest leaves to this week's planner priorities;
  - open the Companion at those archetypes;
  - write the "well / badly" notes (the existing fields).

There is **no validation that tags explain every lost mark** (your rule).
Untagged lost marks show as "untagged".

### 8.3 Error tags (decision M, fixed vocabulary)

| Tag | Prescription it feeds (§9.4) |
|---|---|
| `knowledge` — didn't know it | the leaf's notes and flashcards; R_exam weight |
| `recall` — knew it, couldn't retrieve | redo item; cram deck |
| `method` — wrong approach | the archetype's variations; Method 1 vs 2 |
| `slip` — arithmetic/algebra/syntax slip | the checking routine; calculator checks |
| `misread` — misread the question | the command-word decoder; underline-the-ask drill |
| `command` — answered a different command word | the command-word decoder |
| `working` — answer right, working insufficient | the board's working rules |
| `notation` — units, accuracy, notation, pseudocode conventions | board rules; the accuracy checklist |
| `time` — ran out of time / skipped | timing drills; the pace figure |
| `incomplete` — partial answer, stopped | "show that" structure; partial-credit strategy |

### 8.4 Real results

- **A real exam's result** is an attempt with `role: "result"`. It fills
  the assessment's `result`, the IT unit (`setUnit`) where linked, and
  Reports.
- **Calibration:** how far predicted grades were from the actual grade
  (§9.6).

### 8.5 Topic papers (PMT and ours)

- **The pack catalogue** lists every topic pack (subject, area, topic,
  sub-topic, level, number of questions, pages).
- **"Log a topic pack"** links the attempt to the pack's leaves.
- **The pack shelf** shows which packs you have done for each leaf (✓, last
  score) and suggests the next one from the planner's priorities ("Area
  between curves — A-Level, 3 questions, not yet done").

---

## 9. Prescriptive analytics

Every figure states its evidence and stays silent below its threshold
(invariants 76 and 77).

### 9.1 Mark weight (index)

- **Leaf weight** for a paper = the mean marks per sitting that the leaf's
  questions carry, over the sittings in the index.
- Shown as a table per paper: leaf · mean marks · % of the paper · sittings
  it appeared in.

### 9.2 Likelihood (index)

**For each leaf and archetype:**
- **appearance rate** (sittings containing it ÷ sittings);
- **marks when it appears**;
- **gap** (sittings since last seen);
- **trend** (first half vs second half of the run).

**Yield:**
- **High:** appearance ≥ 60%, or a mean of ≥ 6 marks.
- **Medium:** 30–60%.
- **Low:** under 30%.

**"Due" marker:** a leaf with a high appearance rate absent from the last
two sittings is marked "due by its pattern". This is shown with its
evidence and the standing caveat: "Anything in the specification can
appear; this ranks where marks have usually come from."

**"The core half of the paper":** the smallest set of archetypes whose
mean marks reach 50% of the paper, listed in order. This is the measured
version of "top recurring archetypes ≈ 50%".

IT is marked low-evidence (specimen and sample only).

### 9.3 Predicted grade

- **From the last three timed attempts** on the assessment's board paper
  (or its scope, for a mock):
  - a percentage range (min to max, or the mean ± the spread when there are
    5 or more);
  - mapped through the last three series' boundaries to a grade range
    ("B–A").
- **Needs 3 timed attempts.** Otherwise: "Two more timed papers give a
  prediction."
- **Target gap:** "Target A* (≥ 77% in recent series): you need about +8
  marks a paper."

### 9.4 Where the next ten marks come from

**For each leaf in scope:**

```
expected gain per hour = weight × likelihood × loss rate ÷ fix hours
```

- **weight:** marks per paper.
- **likelihood:** appearance rate.
- **loss rate:** the share of available marks lost on that leaf in your
  tagged attempts. Without attempts, it falls back to `1 − R_exam`, and
  then to the RAG band.
- **fix hours:** small for `recall` / `slip` / `notation`, larger for
  `knowledge` / `method`. A per-tag constant, shown.

The top items read as plain sentences:
> **Integration — area between curves** · ~9 marks a paper, on 6 of 8
> papers, you dropped 7 of 18 here (method × 2, slip × 1) → 2 sessions on
> Variations C–E, then redo June 2019 Q8.

**Error-pattern prescriptions** fire on 10 or more tagged questions:
- e.g. "40% of lost marks are `slip`" → the checking routine card, the
  calculator-check techniques, and a timed "spot the slip" drill;
- e.g. `time` on the last two papers → per-mark pace drills and the Exam
  Room's timing plan.

### 9.5 Pace

- **Minutes per mark** on timed attempts against the board budget (Maths
  1.2, CS 1.5, F201 per its time and marks).
- Also per section when per-question times are entered (optional).
- "Ran out" questions (`time` tag) are marked on the paper's question
  ramp.

### 9.6 Calibration

- **Predicted vs actual,** per attempt and on the real results.
- A small chart appears after 5 predictions: "you tend to under-predict by
  6%".
- Real results are compared with the hub's own predicted range, as an
  honest check on the model.

### 9.7 Real exam performance

The real results ledger (IT F200 already sat; future mocks and results)
adds two things:
- the actual vs predicted line;
- per-unit UMS against the target for IT (from `KOS.hub.it`).

---

## 10. The revision planner

**A read-only weekly guide** (decision F):

**1. Hours available this week.** From `prefs.weeklyHours`, else the
median of your last 4 weeks of study (Focus and the session ledger),
minus Pacing's class load. Editable.

**2. Split across assessments.** By urgency and tier weight:

```
share(a) ∝ tierWeight(a) × gap(a) ÷ max(1, weeksLeft(a))
```
- `tierWeight`: real 1, mock 0.8, topic 0.5, retrieval 0.2.
- `gap`: 1 − band progress.

**3. Split within an assessment across leaves.** By §9.4's expected gain
per hour, with these limits:
- at most 40% on one leaf;
- at least one slot for overdue FSRS reviews in scope;
- leaves not yet covered in Pacing are flagged "learn first".

**4. Output:**
- a list of rows, each "topic · suggested sessions (25-min blocks) · why";
- the week's practice paper suggestion (the next untried sitting, or a
  predicted paper);
- the cram deck size.

**One action: "Send this week's priorities to Pacing / Today".**
- It opens a confirm dialog listing what it will add.
- It writes **personal Pacing rows for this week** with the leaves, tagged
  `exam:<assessmentId>`, and optionally pins the first to Today.
- Nothing is written without that confirm, and nothing goes to the
  Calendar.
- **A disrupted week needs no clean-up:** next week's guide is computed
  afresh, and the sent rows carry over like any personal row (invariant
  82a).

---

## 11. Start-by dates and deadlines

```
hoursNeeded = base(tier) × scopeLeaves × (1 − readinessProgress)
startBy     = date − ceil(hoursNeeded ÷ weeklyHoursForThis) weeks − buffer(tier)
```

- **base(tier):** real 0.9 h a leaf, mock 0.6, topic 0.5, retrieval 0.15.
- **buffer(tier):** real 2 weeks (the 7–14 day window), mock 1 week, topic 3
  days, retrieval 1 day.
- **For a deadline,** the start-by comes from milestones and the assignment
  estimate (the existing `estimateMins`).

**Behaviour:**
- **Advisory and editable** (`startBy` override); the derivation is shown
  ("2 weeks of buffer + 14 h at your 6 h a week").
- **Surfaced** on Home's ladder ("Start CS Paper 1 prep — start-by today"),
  the bell (one notification, on the day), Reports ("2 assessments passed
  their start-by this week, 1 started"), and the timetable row.
- **"At risk" comes before "late":** a deadline whose remaining estimate
  exceeds the free time before it reads At risk in the alarm colour with
  the word.

---

## 12. Exam Season mode and the Exam Room

### 12.1 Exam Season (decision K)

**On** automatically when a real exam is 28 days out (`prefs.seasonDays`),
**or** by hand. **Off** after the series' last real exam, or by hand.

**While on:**
- **The hub opens on the Season view:**
  - the next exams with days remaining and their bands;
  - the highest-risk leaves across them;
  - due reviews within the scopes;
  - rapid recall;
  - the latest post-mortem;
  - each exam's checklist;
  - logistics (time, room, seat, equipment, travel).
- **Home** leads with the next exam card (it replaces "Up next" Focus
  when inside the lead days).
- **Focus** defaults its topic pick to the planner's first priority.
- **Review** offers "In scope for Paper 1 first" as the queue order.
- **The Assistant** has the season in its context.
- **Rest:** device notifications for non-exam kinds can be held by one
  toggle ("Quiet the rest during exam season").

### 12.2 The Exam Room

A calm surface for the last 60 minutes, opened from the exam card on the
day:
- **No dashboards and no new material.** Five blocks with a quiet
  countdown:
  1. **Breathe and check** (equipment from the checklist, calculator mode).
  2. **Rapid recall** (the 15 must-memorise items, one pass).
  3. **Your blacklist** (your three most frequent error tags and their
     fixes).
  4. **The plan** (minutes per section, the order you'll do it, the
     "move on after 90 seconds" rule).
  5. **Go** (travel and arrival time, then the page locks itself to the
     plan).
- **Reduced motion and minimal colour.** Focus is offered but not forced.

---

## 13. The Study Companion

**One Companion per assessment,** depth by tier (§5). It lives in the hub
(`#/exams/<id>/guide`), not on topic pages.

### 13.1 Topic tests and retrieval tests: assembled

Built at read time from what already exists for the resolved leaves:
- notes (the key pages, collapsed);
- labs and generators;
- flashcards;
- exam items;
- misconceptions;
- the board's exam toolkit.

It adds:
- **the command words** that appear in those leaves' exam items, with the
  decoder entries;
- **booklet vs must-memorise** for those leaves (from the playbook);
- **mark-scheme traps** drawn from the leaves' bank patterns;
- **the cram deck:** the scope's lowest R first, a Review run filtered to
  the scope;
- **the rapid-recall drill:** 15 questions mixed from the scope's
  flashcards and exam items, timed, self-marked or auto-marked where the
  item has an answer key.

### 13.2 Real exams and mocks: the exhaustive layer

**Authored content per board paper** (decision I), in
`js/data/exams/<paper>-*.js`. It is **not a re-hash of the topic notes.**
For each leaf in the paper:

1. **Archetype catalogue:**
   - every recurring shape (§4.2);
   - its real frequency ("8 times in 11 sittings, 4–10 marks");
   - the sittings it came up in, as references.
2. **Variations A–n.** Every significant variation of each archetype, as
   a fully worked solution with:
   - step-by-step **mark annotations** (M1, A1, B1, dM1, ft for Edexcel;
     AQA's mark points; OCR's PO1/PO2/PO3 and level descriptors);
   - **where marks are commonly lost**, cited from the examiner's reports
     (§4.4);
   - **Method 1 vs Method 2** where a choice exists, with when each is
     faster and which earns marks more safely;
   - **the board's working rules:**
     - Edexcel: accuracy (3 s.f. unless stated), "show that" conventions,
       exact forms, follow-through;
     - AQA: pseudocode conventions, trace table format, accepted
       alternatives;
     - OCR: PO-objective wording, levels of response.
3. **Sandboxes:** a lab or generator wherever practice benefits (reusing
   the lab system; new archetype labs when none fits), plus a generator
   per numeric archetype for unlimited instances.
4. **Practice set:** original questions per archetype, at three
   difficulty steps, each with a mark scheme. A CS code question is
   checked by `cs_diff`; a maths answer by sympy/scipy.
5. **Real-question pointers:** each instance in the index ("June 2019 P1
   Q8 · 10 marks · your pack: Area between curves, item 1"), with a "Log
   this question" shortcut.

**The content contract** (per leaf, a smoke per paper):
- at least one archetype, each with at least 3 variations, or every
  variation the index shows, whichever is more;
- mark annotations on every worked step that scores;
- at least one examiner's-report-grounded trap per archetype where a
  report exists;
- at least 6 practice questions with mark schemes;
- every index instance linked.

**Release order:** one paper per release, whole. **R5: the order is
flexible** — whichever mock or sitting is chronologically closest goes
first (the December mocks or OCR F201 can jump the queue). The default is
CS Paper 2 → CS Paper 1 → Maths Paper 1 → Maths Paper 2 → Maths Paper 3 →
OCR F201.

**R4: CS Paper 1's programming sections.** The Paper 1 Companion and
blueprint cover Sections B–D alongside 4.1–4.4: archetypes for "write a
program" (B), questions about the Skeleton Program (C: trace, explain,
identify) and modifications to it (D), drawn from that year's Preliminary
Material once it is released. The index cannot measure them (it covers
Section A), so their marks are the paper's 100 minus Section A's.

### 13.3 The playbook drawer (per board)

A slide-out drawer, available on every hub page for that assessment:
- **Formula booklet vs must-memorise R list** (Edexcel: the booklet's
  contents per paper and the list you must know; CS: the facts AQA expects
  from memory).
- **Command-word decoder:** the board's command words, each with what
  examiners want, the typical trap and a micro-example.
- **OCR levels of response:**
  - 6-mark questions: the level descriptors in plain words;
  - the band-climbing checklist (the "BLC" structure from your F200
    materials).
- **Calculator:** FX-991CW setup (reset, angle unit, Math I/O) and its
  techniques:
  - checking work: polynomial and simultaneous solvers, numerical
    derivative and integral, table mode for sign-change and iteration,
    statistics and distribution modes for S1–S5;
  - every technique checked against the calculator's manual before it
    ships.
- **Master mnemonics:** collected from the content's mnemonics, per paper.
- **Misconceptions Blacklist:** examiner-report items (§4.4) plus your
  own top error tags.

### 13.4 Trend and likelihood (per paper)

The §9.1 table, the §9.2 yield map (a leaf grid coloured High / Medium /
Low, with the word as well as the colour), "the core half of the paper",
and the discriminator post-mortems: the historically lowest-scoring
questions per the reports, what made them hard, and the variation that
teaches it.

### 13.5 Predicted and custom papers (decision J)

- **Blueprint per board paper:** sections, total marks, number of
  questions, a ramp (short to long), the command-word mix, and the
  topic-weight profile from §9.1.
- **Predicted paper:** original questions drawn from the archetype bank
  to the blueprint, weighted toward high-yield and "due" archetypes.
  - Labelled as KurenaiOS practice, not a board paper.
  - Several per paper (Predicted 1, 2, 3).
- **Format:** a board-style cover sheet, instructions, marks in brackets,
  answer space (print) or answer boxes (interactive). The mark scheme
  uses board conventions; levels of response for extended questions; a
  self-marking tally sheet whose per-question marks log straight into an
  attempt (§8.1).
- **Print:** an A4 print stylesheet (black on white, page breaks per
  question, no app chrome). Exported as PDF through the browser.
- **Interactive:** a strict timer (Focus in "paper" mode: no notes, the
  extra-time allowance applied), then marking.
- **Custom mock** for a mock tier: the same generator over the mock's
  **scope**, at a chosen length.
- **Subtopic packs:** 5 questions per subtopic with a mark scheme (as your
  F200 pack, for every leaf).
- **20-question mixed recognition drills:** timed, from the scope.

---

## 14. Goals

**Registered through `KOS.goals.register(def)`,** domain `study`, linked
to the hub.

- **Link to an exam.** Widen `cleanLinks` with `examId`. A linked goal:
  - inherits the subject hue;
  - takes the exam date as its deadline (shown read-only, following the
    exam);
  - is never deleted by the exam's deletion: it is marked
    "Exam removed · unlinked" and moved to Archived on its next judgement.
- **Progress always reads its source** (invariant 26d). Pace chips:
  ahead · on track · behind, with behind in the fixed alarm colour and the
  word (invariant 26a).

| Type | Measures | Source |
|---|---|---|
| `exam_grade` / `paper_score` | best or latest timed attempt for the exam (or the mock series) against a grade (via boundaries) or a % | attempts + `boundaries.js` |
| `exam_recall` | R_exam across the scope ≥ a threshold, measured live; met when it holds on the deadline, or N days before it if set | `KOS.fsrs` via §7 |
| `exam_topics_green` | N leaves, or 100% of the scope, ticked in Pacing or Green before the date; straight-line pace, projected finish | Pacing + RAG |
| `exam_papers_done` | N timed, marked papers linked to the scope before the date | attempts |
| `exam_checklist` | checklist items done; auto items verified by the app | the assessment's checklist |

**Auto-verifiable checklist rules:**
- `variations-done` (every variation in scope opened, with its practice
  attempted);
- `rapid-15` (a 15/15 rapid-recall run in the last 7 days);
- `blacklist-read`;
- `mocks-sat:N`;
- `all-green`;
- `recall≥x`.

Manual items are ticked by hand.

**Templates, offered when an exam is created** (one tap each, editable):
- "Get CS Paper 1 to 85% projected recall and 100% Green two weeks before
  the exam" (two goals, created as a pair);
- "Complete four marked Maths past papers before Paper 1";
- "Reach 100% Pacing coverage for the December mock scope";
- "Complete the pre-exam checklist for IT F201" (with the standard manual
  items: calculator packed, Degree mode, formula booklet, ID and
  equipment, room and arrival time).

**Retired types.** The existing `study-paper-score` and `topics-green`
keep working. New goals for an exam use the exam types; old goals are not
migrated.

---

## 15. The rest of the app

| Surface | What it gains |
|---|---|
| **Home** | Next-action ladder: exam inside lead days → start-by today → a deadline at risk. The Focus card's exam rung reads assessments. The Upcoming card lists assessments with tier chips. |
| **Focus** | A "paper" mode (strict timer for a timed attempt, extra time applied); topic default from the planner; a session started from an exam counts toward that exam's revision time (as invariant 53a). |
| **Review** | Scope-filtered runs ("Cram: Paper 1 scope, lowest recall first"); redo items as a source with their own chip. |
| **Calendar** | Assessments as derived chips with tier icons, and start-by markers; no stored events (invariant 44). |
| **Pacing** | The planner's sent rows (tagged `exam`); the "Covered in Pacing so far" read; class milestones (Mock, Assessment) offered as "Create an assessment from this". |
| **Reports** | Facts: attempts and their %, results, readiness band changes, start-bys passed, redo items cleared, papers done against goal. Week, month and term pages get an Exams card. Kurenai's payload gets totals only (invariant 102b). |
| **Notifications** | Kind `exam`: start-by today, exam tomorrow (logistics), season on, a result recorded. Per-device filter. |
| **Assistant** | Read tools `exams_overview`, `exam_detail` (readiness, scope, next marks) and `exam_attempts`. A write tool `exam_log_attempt` goes through the approval card. No tool edits a scope silently. |
| **Search** | Assessments, papers by session ("June 2019 P1"), archetypes. |
| **Backups and cloud** | `state.exams` rides the state document. Cloudmerge keys assessments by id, and the checklist, milestones and scope lists as id'd or set fields (`SET_FIELDS`). |

---

## 16. More suggestions

**Revision 2:** 1, 2, 4, 6, 7, 8, 9 and 10 are in the plan, built in the
phases named in §19; 3 and 5 stay light and optional.

1. **Timetable import:** paste the board's provisional timetable text (or
   an ICS) and pick your papers; dates are marked provisional until
   confirmed.
2. **Clash and load view:** two exams on one day, or three in 48 hours,
   flagged with recovery-day advice. The planner already front-loads
   around them.
3. **Paper rotation:** a past paper re-sat six weeks later as a spaced
   check, offered once per paper.
4. **Board-style answer habits:** a 30-second pre-flight per question type
   ("show that: start from the left-hand side, end on the exact
   statement").
5. **Exam-condition streak:** consecutive weeks with a timed paper, shown
   in the hub. A Governor-free stat.
6. **Teacher feedback capture:** a photo or note attached to an attempt,
   using the existing attachments store, never uploaded unless asked.
7. **Revision pack export:** the Companion for a scope as a printable
   PDF.
8. **"What changed since the mock":** after a re-test, a side-by-side by
   leaf of marks lost then and now.
9. **Results day:** a calm results page per series. IT shows UMS and the
   aggregate from `KOS.hub.it`; CS and Maths show the grade against
   prediction.
10. **Accessibility:** extra time in timers and the pace budget; a
    large-print option for printed papers.

---

## 17. Architecture

| File | Role |
|---|---|
| `js/core/exams.js` | `KOS.exams`: normalise, CRUD, migrate, scope resolve, tiers, start-by, readiness (pure reads), season, checklist rules |
| `js/core/examstats.js` | `KOS.examStats`: weights, likelihood, predicted grade, next-marks, error patterns, pace, calibration (pure; also in Node) |
| `js/core/examplan.js` | `KOS.examPlan`: the weekly allocation (pure) and the send-to-Pacing action |
| `js/core/exampaper.js` | `KOS.examPaper`: blueprint, predicted and custom paper assembly, mark-scheme model, tally → attempt |
| `js/core/tracker.js` | widened attempt record (decision B) |
| `js/core/srs.js` | redo items source; `examIndex` reads assessments by scope |
| `js/core/goals.js` | `examId` link; the five exam types |
| `js/data/exam-index.js` | generated (§4.1) |
| `js/data/boundaries.js` | grade boundaries table |
| `js/data/exam-presets.js` | paper presets: marks, times, calculator, blueprint |
| `js/data/exams/*.js` | the Companion content per paper (authored) |
| `js/data/exams/playbook-*.js` | per-board playbook (authored) |
| `js/modules/exams.js` | `KOS.views.exams`: hub, timetable, assessment page, scope builder, readiness, planner, season, Exam Room |
| `js/modules/examguide.js` | the Companion pages, drawer, papers (interactive and print) |
| `js/modules/tracker.js` | the log dialog extended; post-mortem |
| `css/views/exams.css`, `css/print.css` | views; A4 print |
| `tools/gen_exam_index.py`, `tools/exam-index/map.csv`, `tools/exam-index/reports/*.md` | evidence pipeline |

**Routes:**
- `#/exams` (hub; the Season view when on);
- `#/exams/timetable`;
- `#/exams/<id>` (overview);
- `#/exams/<id>/<scope | readiness | plan | practice | guide | papers | room>`;
- `#/exams/attempt/<entryId>` (post-mortem).

The old `#/tracker` route aliases to the hub's Practice tab.

---

## 18. Invariants this would add (draft, numbered 120+)

- **120: one assessment record.** `state.exams.assessments` is canonical.
  Calendar, Home and Reports derive from it, and the Calendar never stores
  an exam copy. Tiers decide capability (§5).
- **121: a scope is stored as picked and resolved on read.** Exclusions
  win. "Covered in Pacing" is a rule, not a list. Every reader uses
  `KOS.exams.leaves`.
- **122: the FSRS cap is by scope.** Only a real exam, or an opted-in
  mock, whose resolved scope holds the card's leaf can cap it
  (111a amended).
- **123: readiness is four signals, never blended.** Each is silent below
  its evidence threshold, and the band names its limiting signal.
- **124: attempts are the tracker record.** Per-question detail and tags
  are optional and never validated to sum. A result attempt fills the
  assessment's result, and the IT unit through `setUnit`.
- **125: evidence data is generated** from the user's own index and
  boundaries tables. No past-paper text or images are bundled or
  deployed. Examiner's reports are paraphrased with their series cited.
- **126: the planner writes only on the user's confirm,** and only
  personal Pacing rows tagged `exam`. It never writes to the Calendar.
- **127: predicted papers are original** and labelled. A tally logs one
  attempt. Generated papers are reproducible from a seed.
- **128: exam goals read their sources.** An exam deleted unlinks its
  goals and never deletes them.
- **129: zero Governor traffic from planning, readiness and analytics.**
  An attempt logs its session exactly as today; redo items pay nothing.

---

## 19. Releases and gates

| Phase | What | Gate |
|---|---|---|
| 0 | **Design** (prompt 13, frames 29a–29x) while the evidence pipeline is built | — |
| 1 ✓ | **Core** (built 20 October 2026): `state.exams`, tiers, Scope Builder (presets, Pacing rule, tree, exclusions), migration from Calendar and IT, Calendar derived chips, the cap by scope, timetable and assessment pages, widened log dialog (index pick, per-question, tags, timed, predicted), redo items, start-by dates | smoke89 (model, migration, scope, cap, attempts, redo, render purity) |
| 2 ✓ | **Evidence** (built, report notes included for the AQA reports still online; archetypes move to phase 5 with the Companion that uses them): `gen_exam_index.py` + `map.csv`, archetype first pass and review, boundaries table, examiner's reports fetch and notes | smoke90 (every question mapped and tagged, marks reconcile per paper, boundaries well-formed) |
| 3 ✓ | **Readiness and decisions** (built 21 October 2026, to design turn 29): four signals and band, analytics (§9), planner + send action, Exam Season, Exam Room, Home / Focus / Review / Reports / notifications / Assistant joins, the post-mortem (§8.2), the Paper library (§4.5), timetable import (#1), clash and load view (#2), teacher feedback capture (#6), "what changed since the mock" (#8), results day (#9) | smoke91 |
| 4 | **Goals:** `examId` links, five types, checklist rules, templates | smoke92 |
| 5 | **Companion, assembled tier and playbooks:** archetype catalogue and tagging (§4.2), topic and retrieval guides, cram deck, rapid drill, drawer for all three boards, answer habits (#4), trend and likelihood pages, paper engine (blueprint, print, interactive, tally), revision pack export (#7), large print and extra time (#10) | smoke93 |
| 6+ | **Exhaustive companion, one paper per release:** CS P2, CS P1, Maths P1, P2, P3, F201; each with its predicted papers and subtopic packs | a content smoke per paper (smoke94+), `cs_diff`, the maths checks |

**Deploy** after each phase on your go-ahead; the pre-deploy checklist
applies.

### Phase 3 as built: the deviations

- **The Companion tab** is not drawn yet. It arrives with the Companion in
  phase 5, so no tab opens onto nothing.
- **The Paper library** lives in its own IndexedDB, `kurenai-os-papers`, not
  in the files store (§4.5). Your PDFs never sync and stay out of backups;
  a connected folder is read through the File System Access API where the
  browser has it.
- **The send dialog** has no "To Today" section. The week's rows go to
  Pacing (invariant 126) and Today reads them from there.
- **Per-question minutes** are not recorded. An attempt keeps `mins` for
  the whole paper only.
- **On track** means every signal's ratio to the straight line from start-by
  to the window's start is at least 1. Ready means every target is met
  (coverage ≥ 95%, no red leaves, recall ≥ the exam-day target, the last
  timed paper ≥ the target grade's cut or 70%).
- **The topic-test coverage card.** The README's open decision is resolved
  as a card, so the overview leaves no dead column.

---

## 20. Risks

| Risk | Mitigation |
|---|---|
| Scope of authored content (six papers, exhaustive) | One paper per release, whole; the evidence (index, archetypes) first, so authoring is driven by measured frequency. |
| Likelihood read as prophecy | The caveat on every view; ranks by evidence; never hides low-yield leaves. |
| Copyright | Decision C; a smoke greps the deploy for PDF text fingerprints from the index; references only. |
| The mapping from board sub-topics to leaves | Hand-checked `map.csv`, held by smoke90; a question that maps to no leaf is listed, never dropped silently. |
| Over-complex logging | Quick log stays one screen; everything else is optional enrichment. |
| Boundaries out of date | `confirmed` flags; predicted grades say which series they used. |
| Migration surprises | Calendar exam events are kept (hidden, `migratedTo`), so a rollback finds them. |
| IT with little evidence | Marked low-evidence; the companion leans on the specification and the F200/F201 structure. |

---

## Next step

Phases 1–3 are built, with the AQA report notes, and phase 3 is styled to
design turn 29. Next: deploy on your go-ahead, then phase 4 (Goals) when
asked. Edexcel's reports wait for their URLs.
