# The Exams & Deadlines hub

Release contracts, moved out of `CLAUDE.md` on 17 November 2026 (W8)
word for word; `CLAUDE.md` keeps a one-line index. The historical
numbering is kept: tests, source comments and audit notes cite it.
Read this file before editing or testing anything in its domain.
### The Exams & Deadlines hub (120–130)

120. ONE ASSESSMENT RECORD. `state.exams.assessments` (synced, keyed by a
    random string id; `KOS.exams.normalise` is the gate) is canonical for
    every exam, mock, topic test, retrieval test and deadline. One-off
    calendar exams and IT units still to sit with a date moved into it once
    at boot (`KOS.exams.migrate`); a moved event is kept, hidden
    (`migratedTo`), so a rollback finds it; a recurring exam stays an
    event. The calendar draws assessments as DERIVED events
    (`KOS.exams.eventViews`, id `x:<id>`, `assessmentId`) through its own
    reads (`eventsOn`, `deadlines`, alerts), never stores one, and opens
    the hub on a click; a new one-off exam made in the Calendar is an
    assessment. An IT unit's sitting date and its assessment's follow each
    other (`KOS.itUnits.setUnit` ↔ `KOS.exams.syncItUnit`), and unit marks
    stay `KOS.itUnits`' (invariant 26f). The tier (`real_exam`, `mock`,
    `topic_test`, `retrieval_test`, `deadline`) decides capability; a tier
    change recomputes on read.
121. A SCOPE IS STORED AS PICKED and resolved on read:
    `KOS.exams.leaves(a)` = resolve(include) ∪ covered-in-Pacing −
    resolve(exclude); exclusions always win. "Covered in Pacing so far" is
    a rule while the assessment is ahead and FREEZES into a leaf list
    (`pacing.frozen`) once its date passes or its result is logged
    (`freezePass` at boot, `recordResult`), so a past scope never moves.
    Every reader (the cap, the pages, readiness, goals) uses `leaves`.
    `include`/`exclude` merge as sets (`SET_FIELDS`).
122. THE FSRS CAP IS BY SCOPE: only a real exam, or a mock with `cap` on
    (decision L), whose resolved scope holds the card's leaf can hold a
    card (111a); subject-wide matching is gone for assessments.
123. READINESS IS FOUR SIGNALS, never blended (phase 3; `KOS.exams.readiness`
    over the pure `KOS.examStats`): coverage (RAG, silent under 3 rated
    leaves), recall (silent under 20 rated cards), practice (a trend from
    1 timed paper, a range from 3) and calibration (5 predictions). The
    band is Thin when two or more are silent; At risk when a signal falls
    below the straight line from start-by to the window's start, naming
    that signal; Ready when every target is met (coverage ≥ 95%, no red
    leaves, recall ≥ the exam-day target, the last timed paper ≥ the
    target grade's cut or 70%); On track otherwise. A predicted grade is a
    range from the boundaries, saying which series it used, and the
    prediction at the exam (`predictedAtExam`) is kept once at boot.
    Exam Season is on while a real exam is within 28 days, through the
    series (gaps ≤ 28 days); an override is keyed to the series' last date
    and lapses with it, and "quiet the rest" holds the airing, wishlist,
    money, goal, reports and assistant kinds from the feed, bell and
    device alerts while the ledger keeps them.
124. ATTEMPTS ARE THE TRACKER RECORD (decision B), widened with optional
    fields: `uid` (a random string every attempt carries), `assessmentId`,
    `role` (`practice` | `result`), `source`, `timed`, `mins`,
    `conditions`, `predicted`, `questions` [{q, max, got, refs, tags,
    redo, note}]. A quick log is as quick as before; typed question marks
    fill a blank total and never override a typed one; tags are a fixed
    vocabulary of ten and never have to explain every lost mark. A
    `result` attempt fills its assessment's `result` (a link: the attempt's
    uid and its marks) and an IT unit's raw mark through
    `KOS.itUnits.setUnit`; deleting it clears the link. A question marked
    `redo` is an FSRS review item `x:<uid>:<q>` (decision G): due the day
    after, on its question's leaf, self-marked, weighing its marks in topic
    memory (`KOS.srs.weightOf`); unmarked or deleted, its schedule goes.
125. EVIDENCE DATA IS GENERATED from the user's own index
    (`tools/gen_exam_index.py` + the hand-checked `tools/exam-index/map.csv`
    → `js/data/exam-index.js`, committed) and the boundaries table
    (`confirmed` per row). No past-paper text or images are bundled or
    deployed (the deploy is a public URL): references and numbers only,
    file paths relative to the user's folder. A paper stays on the device
    that added it unless you press "Keep in my cloud" for that file, which
    copies it to your PRIVATE bucket through the file store (invariant
    150); never the deploy. Examiner's reports are saved
    to the user's folder (`tools/fetch_reports.py`) and paraphrased into
    notes citing their series; nothing invents an examiner's comment.
    smoke90 holds the mapping, the reconciliation and the no-text rule.
    The notes reach the app as `js/data/exam-reports.js`, generated from
    them (smoke93 holds it current); the archetype catalogue tags every
    indexed question or names it unique by its own tag text.
126. THE PLANNER WRITES ONLY ON CONFIRM (phase 3), and only personal Pacing
    rows tagged `exam:<assessment>` (`KOS.examPlan.send`); never the
    Calendar. The week's plan is computed, never stored; a send replaces
    that week's unticked tagged rows, found by tag (never by id, which the
    merge may re-key), keeps ticked ones, and is undoable.
127. A PAPER IS DERIVED AND LABELLED (phase 5, `KOS.examPaper`): never
    stored, rebuilt from its assessment and seed (the same seed, the same
    paper), to the board paper's blueprint from the index (marks, short to
    long, at most two items a leaf, weighted to the paper's high-yield
    leaves). Every page says "written by KurenaiOS, not a board paper";
    until each paper's original predicted questions arrive (phase 6) a
    practice paper is drawn from the topic banks and names the past paper
    each item is modelled on. The tally ticks mark points (a dM or an A
    needs its M) and logs ONE attempt with marks by question, its source
    `custom-mock` and `<assessment>:<seed>`. Where a paper has its full
    Companion (phase 6, invariant 130) the paper is PREDICTED: its
    original practice questions only, weighted to the high-yield leaves
    and the shapes due by pattern, one extended answer last; `pack-<ref>`
    and `set-<ref>` are a leaf's subtopic pack and practice set. A paper is the board paper's
    marks exactly where its items allow (topped up with the largest item that fits the gap) and
    then takes the board paper's own time (EX-25). The tally prints each scheme line beside
    its chips, so marking needs no trip to the scheme (EX-33). A timed session is per device
    (`state.ui.examPaperSess`) and starts only on Start; extra time is
    the assessment's own, else `prefs.extraTime`. The Companion is
    ASSEMBLED on read (`KOS.examCompanion`) from the scope's notes, their
    callouts (formula, memorise, mnemonic, miscon, warn), items, cards,
    labs, the playbook and the report notes — nothing stored, nothing new;
    the rapid drill is self-marked and rates nothing.
    AUTHORED PAPERS (the Exams & Papers rework §7.1, smoke181): a paper
    written whole for a preset (`KOS_EXAMS.papers[preset]`,
    `js/data/exams/papers/<preset>-<n>.js`, loaded with the `exams-deep`
    bundle, original and labelled "written
    by KurenaiOS") is paper n while one exists (`KOS.examPaper.authored`),
    kind `authored`; it keeps the board's own time and marks (F201: the
    SAM's 1 h 30 and 60), its FORMAT (`ocr-case`: ONE organisation's
    context for every question, lettered and (i)/(ii) parts, `[n]` marks,
    no Edexcel total line), data tables and tables to complete, and a
    levels-of-response part is marked by mark with its level descriptors
    and indicative content in the scheme. Each paper meets the contract in
    smoke181 (marks add up, a real leaf and a scheme for every part, levels
    for 6+ marks, (ii) after its (i)).
128. EXAM GOALS READ THEIR SOURCES (phase 4, `js/core/goals-exams.js`):
    five Study types — grade or score (the result once logged, judged
    then and not on the date, or the best timed paper; a % or a grade's
    cut from the boundaries), projected recall (held ON the date; its line
    starts at the figure at creation), topics Green or covered, papers
    done, and the checklist (no pace). Each is linked by `links.examId`
    (kept by `cleanLinks`), takes the exam's subject, and its deadline is
    READ from the exam (an earlier `params.by` wins), so moving the exam
    moves it. Deleting an exam unlinks its goals and never deletes one
    (`KOS.goals.unlinkExam`): kept as it was with `params.examGone`,
    measured as nothing, no pace and no notices, archived at its next
    judgement (the first tick on a later day); `linkExam` picks it up
    again. Templates are offered when an assessment is made (29c) and
    only ticked rows are added; the pre-exam checklist brings its
    standard items once. App-checked checklist items carry a `rule`
    (`all-green`, `mocks:N`, `recall:x`), tick themselves and refuse a
    hand.
129. ZERO GOVERNOR TRAFFIC from assessments, scopes, start-by, planning and
    analytics. An attempt logs its `tracker` session exactly as before; a
    redo item pays nothing (a review batch of only redo items logs no
    session; a mixed batch counts only its flashcards). Pages only read
    (smoke89 I).
130. THE FULL COMPANION IS AUTHORED, ORIGINAL AND MEASURED (phase 6, one
    board paper per release; CS Paper 2 first). Every question and worked
    answer in `js/data/exams/` is written by KurenaiOS and says so on
    every page; real questions appear only as references (series and
    number, "Log this question"), and every trap that cites a series is a
    paraphrase of our own report notes. The content contract holds per
    leaf of the paper (smoke94): at least one shape; three or more worked
    variations each, whose steps' mark points add up to its marks;
    six or more practice questions at all three difficulties whose
    schemes add up (so the tally can mark them); every indexed question
    of the paper linked from a shape (the catalogue's tag, or the shape's
    own pattern) or a one-off; a shape the reports speak about carries a
    trap citing one of those notes. Numbers, programs and SQL are checked
    by program before they are written. The Companion is READ
    (`KOS.examDeep`); "worked" is per device (`state.ui.examWorked`), as
    is the open variation (`state.ui.examDeepVar`).
    A SCHOOL'S MOCK (an assessment with no board paper of its own, e.g. the
    CS pre-public exam's topic list; the rework §9.2, smoke183) takes its
    GUIDE from the paper with a full Companion whose leaves its scope
    overlaps most (`KOS.examDeep.paperOf(a)`); the paper engine's predicted
    and pack papers never borrow one (`paperOf(a, true)`).
130a. AN ATTEMPT IS RECORDED, MEASURED ON THE DEVICE AND REVIEWED OUTSIDE
    THE APP (the Exams & Papers rework, `docs/exams-rework-plan.md` §8,
    decisions D1, D2, D6; smoke180). While a paper, a set or a timed
    question runs, `KOS.attempts` (`js/core/attempts.js`, IndexedDB
    `kurenai-os-attempts`, in the store registry and the full backup)
    records EVENTS per part — opened, each stroke's start and length
    (`t0` on the ink item, the `kos-ink-act` window event from the ink
    UI, read only for a doc bound with `bindDoc`), erasures, undos,
    keystrokes, flags, pauses, the end — never the ink or any text. It is
    saved as it goes and picked up after a reload (`resume`). `figures()`
    is pure and the same every time: time per part (pauses left out), time
    to the first mark, writing time, idle gaps over 20 s, returns, minutes
    a mark against the paper's budget, skipped and flagged parts, the
    pacing line, and with marks what was lost by part, topic and command
    word. NO MODEL IN THE APP judges an attempt (the user's decision, 17
    November 2026): `KOS.reviewPack.build` makes ONE text for the
    clipboard in strict XML-tagged sections — every field a model must
    echo (the attempt's uid, a part's id) an attribute — and the written
    pages are merged into whole A4 pages, each headed with the parts it
    holds (`plan`, `pagesPDF`: one PDF, never a crop a part). Nothing is
    sent by the app. A reply comes back through `KOS.reviewPack.parse`: it
    reads one fenced JSON block (or the object carrying "kos"), forgives
    prose around it, smart quotes, trailing commas and comments, maps loose
    part ids ("Q3 (b)" → "3(b)"), and REFUSES another version, another
    attempt, an unknown part or a re-mark out of range — on an error
    nothing is stored. Accepted feedback is kept on the attempt
    (`addFeedback`). Replication to `kos_attempts` is to come (D1).
