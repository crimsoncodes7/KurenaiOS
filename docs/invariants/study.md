# Study: the editable curriculum, spaced repetition and content authoring

Release contracts, moved out of `CLAUDE.md` on 17 November 2026 (W8)
word for word; `CLAUDE.md` keeps a one-line index. The historical
numbering is kept: tests, source comments and audit notes cite it.
Read this file before editing or testing anything in its domain.
### The editable curriculum (86–89)

86. Curriculum files (`js/data/content/*.js`, the generated specifications) are
    never written at runtime. A user edit FORKS one topic and one kind
    (`notes`, `spec`, `flashcards`, `quiz`, `exam`) into
    `state.edits.topics["sid:ref"]` through `KOS.edits.set()`, and every reader
    takes the EFFECTIVE material: `KOS.content.get()/has()` and
    `KOS.srs.curriculumCards()` consult `KOS.edits` first. `reset()` deletes the
    fork and the shipped material returns exactly.
87. A forked flashcard keeps the schedule key it shipped with (`sid:ref:i`) through
    every edit, reorder or neighbour deletion; a card added in the editor gets
    `sid:ref:<rowId>`. Rewording never resets a schedule. The same holds for
    the SHIPPED deck: when cards are removed from a content file, every card
    whose position moved carries its original position as an optional third
    element, `[q, a, 7]` (a string containing `:` is a whole key, for a card
    moved in from another deck). `srs.js` `shippedKey` and `edits.js`
    `shippedFlashcards` read it, so a removed duplicate never hands its
    schedule to the card that slid into its place. New cards need no third
    element; never renumber one that has it.
88. Every fork row carries an `id`: shipped rows a DETERMINISTIC `s<i>`, new
    rows a random string. The cloud merge keys nested record arrays on it, so
    two devices forking the same topic fold the shared rows and keep both
    devices' additions. Ids are never shown or referenced.
89. Two surfaces change a topic's material, and only two. The study editor
    (`KOS.editor.mount`) is the full one; the page beside it is the preview,
    re-rendered through `openTab({keep, reveal})`. The inspector's quick note
    is the second, and it is APPEND-ONLY: its draft is per device in
    `state.ui.quickNote["sid:ref"]`, and leaving the topic (any `KOS.show` that
    is not that topic, so also the first navigation after a reload) files it
    through `KOS.edits.appendSpec()` as ONE dated `{md}` block with an id at
    the end of the Spec fork's `info` list (`src: "quick-note"`, `date`). It
    never edits, moves or removes a block; an empty draft writes nothing, not
    even a fork. A FORK REMEMBERS ITS SHIPPED VERSION (CM-04): set()
    stamps `t.shipped[kind]` with a hash of the shipped kind when it makes
    the fork; when today's differs (a fork from before the stamp: its count
    of shipped rows differs) the tab says the curriculum moved and offers
    "New version + my additions" (the rows you added, at the end), "Use
    the new version" (danger confirm) or "Keep mine" (`KOS.edits.stale`,
    `takeNew`, `keepMine`; smoke148 H). `state.ui.editing` remembers an open editor per
    device so a redraw reopens it. The editor saves AGAINST WHAT IT LOADED
    (`KOS.edits.set(…, {base})`, SY-18): rows merge by id, so a row it did
    not touch takes the stored copy (another device's edit, addition or
    deletion survives) and its own edits, additions and deletions win. Content blocks may carry an `id`, which the
    renderer wraps in `.k-blk[data-ui="topic.note-block"][data-bid]`
    (display:contents) and otherwise
    ignores; `{p}` and `{md}` are renderer block types. Notes/Quiz/Exam tabs are
    always present on a topic — an empty tab is where material is added —
    and a zero count is never printed (invariant 77).
89a. Every hand-ranked list (the editor's blocks and rows, the Spec column
    break, the Shrine's tie order) uses `KOS.ui.reorder`: a ⠿ handle that
    drags, or Space lifts, ↑ ↓ move, Space drops, Esc puts back, announced.
    A reorder is a MOVE inside the fork (`KOS.edits.move(sid, ref, kind, id,
    to)`, `moveBy(…, ±1)` for the keyboard; Spec blocks may cross between its
    `content` and `info` lists). The row's id and a flashcard's schedule key ride
    with it (invariants 87, 88); a refused step writes nothing. Spec's
    optional column break is ONE stored block id, `colBreak` in the Spec fork
    (`setSpecBreak`, read as `specColumns()`): the second column starts at
    that block. With no break the columns balance themselves, and a break
    whose block is gone is dropped.

89b. FIGURES AND PARTS TO FILL IN (roadmap 5.19 item 3, design turn 43,
    notes first). A worked example may carry the question's own figure
    (`worked.fig`, drawn in its Given row), a figure on any step (`fig`)
    and a "Your turn" (`worked.try`: blocks); so may a Companion variation
    (`fig`, a step's fourth element, `try`), a quiz item (`fig`, above its
    options) and an exam item (`fig`, `try`; `examFromWorked` keeps both).
    A part to fill in is a block — `grid`/`trace` (a table to complete, a
    trace table with its code), `sql` (run on the question's own `setup`
    in Code's sealed SQLite worker; "Same rows", order ignored unless
    `ordered`), `gates` (a circuit: a hidden gate to `pick`, or the output
    to `fill`), `predict` (C#: Run unlocks after an answer, the in-app
    interpreter), `lab` (an existing lab embedded, `KOS.sims.embed`) —
    rendered by content.js as a placeholder and mounted by `typeset()`
    (`js/core/fillins.js`, `KOS.fillIns`). Nothing is stored, paid or
    rated: a fill-in is practice beside the notes. Every figure and part
    passes `node tools/fill_check.mjs` (figures compile, grids are well
    formed, every SQL answer runs in native SQLite and returns rows,
    every predict runs in the interpreter, every circuit resolves);
    smoke153.

### Spaced repetition (111)

111. ONE SCHEDULER. Every card that comes back on a schedule — flashcards
    (`srs.js`) and Code's retrieval cards (`code.js` `schedule`), and the
    Japanese facets when they are built — schedules through `KOS.fsrs`
    (`js/core/fsrs.js`): FSRS-6, pure, held to py-fsrs 6.3.2 by
    `tools/fsrs_check.mjs` (every stability, difficulty and interval), with
    the parameters `KOS.srs.weights()` returns — the 21 defaults, or this
    learner's FIT (phase 3). Every caller passes them; none reads `F.W`
    itself. The fit (`KOS.fsrsOpt`, pure) replays the review log per card
    (a card met mid-life starts from its first row's `s0`/`d0`; redo items
    are left out), pretrains w0–w3 from new cards' second reviews, trains
    w4–w20 by Adam on the log loss with a pull towards the defaults, and is
    offered only when it beats the parameters in use on the same reviews
    and the log holds 1,000. Nothing changes until the preview's "Use these
    parameters"; the fit is `state.srsCfg.fit` (synced; its `w` merges
    whole, `ATOMIC_PREFIX`), applies from each card's next review, moves no
    due date, and "Back to the defaults" undoes it. A card's memory is `s` (days until recall falls to 90%)
    and `d` (1–10); a review under a day after the last takes the
    short-term rule. The flashcard target retention is
    `state.srsCfg.retention` (synced, 0.80–0.95, default 0.90, set on Card
    stats); a new target applies from each card's next review and moves no
    due date. A flashcard Again stays due today (the session requeues it);
    a Code Again waits the forget interval. Fuzz is deterministic — seeded
    by the card key and the day — so a rating button's preview is exactly
    what it schedules, on every device, and it never fuzzes under 2.5 days.
    THE SWITCH FROM SM-2 (20 October 2026) converts a card's ease and
    interval the way Anki does (fsrs-rs `memory_state_from_sm2`, r = 0.9:
    `s` = the interval), so no due date moved and the next on-time Good
    matches SM-2. `KOS.srs.migrate()` and `KOS.code.migrateCards()` persist
    it at boot (idempotent); a render never writes (it reads through
    `KOS.fsrs.recordMemory`). `ef` stays on a card, frozen, and `fl` is the
    day FSRS last moved it: a card whose `last` moved without `fl` (an
    older copy of the app rated it) converts again from its ease and
    interval. Every rating appends ONE row to the review log
    (`KOS.reviewLog`, IndexedDB `kurenai-os-reviews`: key, grade, elapsed,
    memory before and after, interval, source — never card text), which
    rides the full backup and is not in the state document. It replicates
    to the owner-only table `kos_reviews` (migration `20261022000001`,
    `KOS.reviewLog.syncCloud`): each row keyed by its `uid` (key|ts),
    insert-or-ignore, local first; a pulled row is marked `rm` and never
    pushed back, so the fit reads every device's ratings. A rating pays
    exactly what it paid before; scheduling has zero Governor traffic.
111a. THE EXAM-AWARE CAP (phase 2; by scope since roadmap 5.8, invariant
    122). For an exam subject's card, the earliest assessment whose
    RESOLVED SCOPE holds its leaf (`KOS.srs.examFor` over
    `KOS.exams.capList`, read live: a real exam, or a mock with its cap
    turned on; never a test, a deadline, Code or the personal deck; a
    calendar exam not yet moved into the hub counts by its topic links or
    its whole subject until the next boot moves it) can bring a review
    forward. The rule is
    `KOS.fsrs.examCap`, against the EXAM-DAY target
    (`state.srsCfg.examRetention`, synced, default 0.95, 0 = off, set on Card
    stats): a review landing on or after the exam is left alone when the
    card's predicted recall on the exam day already meets that target;
    otherwise it lands in the 7–14 days before (any day before, under a
    week out), on the day `KOS.fsrs.examDay` picks from a hash of the key
    and the exam date, so capped cards spread instead of piling up. It only
    ever shortens, and it is the same rule at a rating (the button's
    preview included) and in `KOS.srs.examPass` — at boot, on saving an
    exam or an IT unit's date, or a new exam-day target — which brings
    forward cards already scheduled past an exam, once (`cap` records the
    exam). The exam-day target must sit above the everyday one to do
    anything: an interval ends when recall reaches the everyday target, so
    a review after the exam always means recall on the day is above it.
    THE RUN-UP (the user, 18 November 2026; smoke182): while such an exam
    is `KOS.fsrs.RUN_UP` (60) days away or less, no interval runs longer
    than a third of the days left, at least 3 and at most 21
    (`KOS.fsrs.runUp`/`runUpMax`, pure), whatever the card's recall, so
    every card comes back two or three times before it — at a rating (the
    button's preview included) and in `examPass`, which brings a card due
    further out in once, spread over the allowed days by a hash of its key
    and the exam (never all on one day, never later than it was). The
    exam-day target at 0 turns the run-up off with the rest of the cap.
111b. LEECHES AND TOPIC MEMORY (phase 2). A flashcard's 8th lapse (`LEECH`)
    sets it aside (`leech` = the day): out of the due queue and into Rework
    on Due today, which offers its topic's notes and "Back in the schedule"
    (`KOS.srs.unleech`; it may be set aside again after 4 more lapses,
    `leechBase`). Only a rating sets one. `KOS.srs.topicMemory(sid, ref)` is
    a pure read — recall today as the mean predicted recall of the rated
    cards, the weakest card, Rework and held-for-an-exam counts, null
    recall with nothing rated — and is what RAG, the topic inspector, Due
    today's topics, Home's Review line and the Assistant's due summary
    read.
111c. QUESTIONS ON THE SCHEDULE (roadmap 5.19 item 4, design turn 44;
    `js/core/questions.js`, `KOS.questions`; smoke155). A quiz item or an
    exam item of a topic is a QUESTION, keyed `q:`/`e:<sid>:<ref>:<id>`
    (the item's `qk`, else its `oi`, else a fork row's number or id, else
    its place), so edits and reorders keep it. Its HISTORY is
    `state.questions.items[key].tries`, a keyed map (a random key a try,
    so devices' tries union; the newest 30 kept): a quiz answer's `ok`, an
    exam self-mark's `got`/`max` and the points ticked per part (`pts`).
    Its SCHEDULE is an ordinary FSRS record in `state.srs[key]`, rated by
    `KOS.srs.rate` from the marks — under 50% Again, 50–79 Hard, 80–99
    Good, full Easy; a quiz item right Good, wrong Again — whose review-log
    rows say `src: "question"` and which the optimiser leaves out. The
    first answer anywhere schedules it; an answer before its day is
    history only; a miss waits until tomorrow; it is never a leech. Due
    today shows three kinds — Flashcards, Questions back, Redo items —
    and questions come back CAPPED per subject a day (`state.questions.cap`,
    synced, default 10; an answer back counts against it; 0 brings none;
    redo items are never capped, invariant 124); IT's archived units are
    left out (26f). The questions run asks each in its topic's own engine
    and logs exactly what that engine logs (an exam item its `exam`
    session; a quiz item nothing); scheduling pays nothing. A quiz's
    History lists its items weakest first ("Quiz the weakest N" asks them
    under their own keys) and the inspector's Quiz best opens it; an exam
    question's card draws its marks over time, "Again in N days" and the
    last answer by mark point. The subject desk's review analytics are ONE
    strip, Cards → Questions → Papers (timed attempts from the tracker).
    MOVED CARDS: Maths' flashcards that are several-step problems (listed
    in `js/data/moved-cards.js`, GENERATED by `tools/gen_moved_cards.mjs`,
    a list that only grows) leave their deck at the end of the Maths
    bundle (`KOS.questions.moveCards`; every other card keeps its key,
    invariant 87) and are the topic's exam questions (`qk` "c<i>", a model
    answer and M/A points); at boot `KOS.questions.migrate` copies a moved
    card's schedule to its question once. Reads write nothing.

### Deep content and labs

Every `KOS_CONTENT["subject:ref"]` entry follows `js/core/content.js`; use
`js/data/content/cs-p1-42b.js` as the depth reference.

- Twelve groups of tiny CS sub-points are taught as ONE leaf each
  (`tools/gen_data.py` `CS_MERGES`; 157 → 131 leaves): number systems,
  the kinds of abstraction, decomposition/composition/automation,
  tractability, computability and the halting problem, bits/bytes/units,
  unsigned binary and its arithmetic, rounding/absolute-relative error/
  over- and underflow, character codes, bit patterns with analogue/digital
  conversion, bitmap and vector graphics, and the arithmetic/relational/
  Boolean operators. The kept leaf is the group's first ref and carries
  every member's specification wording; its content is `cs-m-*.js`, which
  replaces the members' separate entries (their cards keep their schedule keys
  through a whole-key third element, invariant 87). A folded leaf's old
  ref is renamed to the kept one in stored state by `store.js`
  `REF_ALIASES` (exact refs only). Where the kept leaf already has a record
  the member's is MERGED into it (`foldRecord`: the further status, every
  check, the larger figures, both notes; CC-15), never dropped.
  Examiner intel (`intel.js`) is merged the same way. Adding to a merge
  means: the table in `gen_data.py`, `REF_ALIASES`, the sims/generators
  wired to the old refs, the plan seed refs, and smoke65/66's `DONE` lists.
- IT unit F201 (Big data and machine learning) is `it-f201a.js` (Topic
  Area 1), `it-f201b.js` (2) and `it-f201c.js` (3–5), written from the OCR
  specification and its Sample Assessment Material (there are no past
  papers yet): each leaf opens on its overview and "What the specification
  asks", is paged, ends with "In exam questions" (OCR-style worked answers
  in the mark scheme's own form, "identify (1) + apply (1)", at least one
  6- or 9-mark levels-of-response answer) and "Exam toolkit", and its exam
  items derive from those cards (`examFromWorked(notes, "OCR")`).
  Flashcards are quick recall: a front asks something specific (never a
  bare label or a bare yes/no), and a new card's third element is 100 or
  more so it never takes an old card's schedule (invariant 87). smoke156.
- Computer Science content is `cs-p1-*.js` (Paper 1, 4.1–4.4, code in C#),
  `cs-p2-*.js` (Paper 2, 4.5–4.13) and `cs-nea.js` (the NEA as a project
  guide: no exam items). smoke65 and smoke66 hold every leaf to the depth
  contract (paged, ≥3 worked cards with AQA marks, a mnemonic, a
  misconception callout, synoptic links, an exam toolkit, flashcards and a
  quiz); a leaf AQA has never examined on its own is listed in smoke66's
  `NOT_EXAMINED` and says so on the page. Exam items derive from worked
  cards through `KOS.content.examFromWorked(notes, "AQA")`, and no item is
  filed under two leaves. Notes carry no top-level bare paragraphs:
  `node tools/validate_content.js js/data/content/cs-*.js` reports no errors.

- Simulations auto-wire by their own `subject` + `ref`; `WIRE` adds extra refs.
- Worked generators use explicit `GENWIRE` because their displayed `ref` is a
  human label.
- Inline simulations implement `mount(panel)`, never a redirect.
- Content may explicitly list `sims`/`gens`; the topic page (`topic.js`) merges and deduplicates.
- Assign a textarea's `.value` property after creation; the HTML `value` attribute
  does not set its editable value.
- New generator `random()` output must be safe for `solve()`; guard all degenerate
  cases in validation.
- Past-paper question banks live in `js/data/content/bank-*.js`, load AFTER the
  base content file they extend, and add through `KOS.content.extend(key, patch)`
  (flashcards/quiz/exam concatenate, notes append, sims/gens union). Items are
  re-written from the Topic Practice compilation, never copied; `src` names the
  paper an item is modelled on, `level: "AS"` flags AS-only items, and a
  multi-part item is `{src, ctx, parts: [{q, marks, ms}]}` — the exam engine
  logs ONE session per item however many parts it has. IT content is untouched
  by the banks. A CS bank item that repeats a worked card's past-paper
  question (`KOS.content.paperKey`: level, year, paper, number and part) is
  dropped at load (CC-05; Maths' banks are new questions modelled on a paper
  and stay); every bank exam item keeps its original position as `oi`, the
  key its typed answer, handwriting and marks are stored under.
- Quiz options carry no tell: a right answer is never the one long option
  (`node tools/quiz_bias.mjs`; smoke138 H holds CS, Maths and Code at none
  flagged and the right answer the longest in at most 30%; IT ratchets until
  its rewrite). A distractor is the same shape and detail as the answer and
  unambiguously wrong.
- Callout kinds are info, def, tip, warn, miscon, mnemonic, memorise,
  formula and key (Key idea); `tools/validate_content.js` refuses any
  other. AQA shorthand in a scheme or a step's note (I. A. R. DPT) is
  written out at render (`KOS.content.aqaWords`, CC-12); `haskell` and
  `asm` are named code languages (CC-13); "5 m s$^{-1}$" is drawn as one
  piece of maths (CM-12).
- Additional generators register through `KOS.worked.register(gen, refs)` from
  `js/labs/worked-extra.js`.
- Every simulation is built on the lab system (design part 2, frame 20),
  `KOS.lab.create(panel, opts)` in `js/labs/lab.js`: a control bar, a stage
  drawn as ONE SVG (800 × 450 viewBox unless the lab asks for another, as the
  Trace Lab's portrait column does), and a readout (Now → Values → Legend,
  plus sections a sim adds). A sim draws through the stage's drawer and
  returns its extent; the overflow rule places it (100% if it fits, scale to
  a 70% floor, then pan with a minimap; − + Fit; the note says which). Colour
  is a `data-tone` the stylesheet maps to tokens — ink is the subject hue,
  the current step crimson (`hot`), frontier amber (`front`), visited or done
  teal (`done`) — so a sim never names a colour. An operation is run ONCE
  into a list of frames (the model commits when they load) and the
  transport replays them (`lab.steps`). Plots use `lab.plot()` (round-step
  grid, clipped curves, a square mode), drags `lab.drag()`, and a drawn
  control `d.hit()` on a stage created `{interactive: true}` (keyboard
  focus survives a redraw by `data-key`). On a phone (a stage under 60% of
  the frame's width) the viewBox crops to what was drawn — a crop that
  only grows, off while panning, at a manual zoom or with a lab's own
  `vb` — and `lab.narrow()` lets a sim choose a phone layout (floating
  point, subnetting); crossing that width redraws. Archetypes: diagram and algorithm
  labs (`sims-structures.js`, `sims-algorithms.js` with the 20b graph),
  plots (`sims-maths.js`, `sims-plots.js`), bits (`sims-bits.js`), machines
  (`sims-machines.js`), and the Trace Lab (`trace.js`: code · structure ·
  trace). The TEXT kind (`create({work: [panes]})`, `KOS.lab.pane`,
  `editor`, `out`, `scrollTable`) puts an editor and its output where the
  stage would be, with the same bar, transport and readout: BNF,
  compression and cipher (`sims-cs.js`), SQL, regex and LMC
  (`sandboxes.js`), the NEA tools (`nea-tools.js`). No lab draws on a
  canvas any more.
- The OOP sandbox's model is pure `KOS.oop` (`js/labs/oop.js`): `normalise`
  is its gate (it drops dangling/self/duplicate links but never "fixes" a
  modelling error), a class's `id` is its identity and its file name is
  derived from its name (`Name.cs`), and `validate` reports every C# rule the
  generated code would break (names, duplicates, single inheritance, cycles,
  abstract/virtual/override). The canvas pan/zoom, the Code/Diagram
  toggle, the tree's visibility (`side`), where C# shows (`cs`: side panel
  or tab) and whether the user has framed the canvas (`framed`; until then
  it fits itself) are per device in `state.ui.oopView`, never in the synced
  model. The IDE's drag-to-set-base refuses a cycle, and the base picker
  never offers a descendant. The first visit's example stays a draft until
  the first edit (smoke56).
- The lab index groups sims by area (`KOS.sims.areaOf`) with a subject
  switch; both picks are per device (`state.ui.simSubj`, `state.ui.simArea`).
  A topic's Simulate tab mounts the same lab through `KOS.sims.embed()`,
  which marks the card embedded so the readout moves under the stage. Never
  let a sim spill: the stage's overflow rule is the only way a drawing grows.
- No lab draws on a canvas now. A canvas added later takes every colour
  from `KOS.labPalette()` (`worked.js`: theme tokens, oklch included,
  resolved once per `data-theme` through a 1px canvas; smoke50 keeps it),
  never from a fixed hex palette — a fixed ink disappears on the other
  theme.
