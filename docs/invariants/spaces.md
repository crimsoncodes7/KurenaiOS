# The study spaces: Code, Japanese, Creatives and Mind

Release contracts, moved out of `CLAUDE.md` on 17 November 2026 (W8)
word for word; `CLAUDE.md` keeps a one-line index. The historical
numbering is kept: tests, source comments and audit notes cite it.
Read this file before editing or testing anything in its domain.
### Code (103–110)

103. The subject list is `KOS.subjects` (`js/core/subjects.js`): four
    subjects, and only CS, Maths and IT are exam subjects
    (`ids("exam")` — papers, Pacing, Exams & Papers, Reports' subject
    split). A reader that needs every subject asks `ids()`; none writes the
    list out. Code's hue is `--code` (Sky; the deep variant in Dawn, a
    clear hue in each shop theme) and pass/fail never use it. A bare ref
    with no subject never resolves to Code (its lesson refs would make CS
    units ambiguous).
104. Code's content is authored, released ONE UNIT AT A TIME and whole
    (smoke75 A); a lesson added to a released unit later (5.9) ships whole
    in one release too. Every lesson meets the notes contract (`docs/code-plan.md`
    §4.3: the required pages in order, Quick reference last, ≥ 6 runnable
    `{run}` listings, a compile-error pitfall, flashcards, quiz, practice);
    a concept, task or card id is registered ONCE across every file (CO-17: `KOS_CODE.DUPES`,
    smoke75 A0 — unit 3's "validation" had been replaced by Bridge B's; B.8's is now
    "validation-reports" and T2.17's "form-validation", proofs moved on read by `splitValidation`);
    lessons are authored as layers and registered through `KOS_CODE.lesson`,
    whose `compose` gives text-only layers of a few lines no page of their own
    (the closing three share one; others join the page before) — layers
    with code always keep their page;
    a lesson done in Rider (Bridge B) holds the Rider form instead — the
    same pages, at least three command, file or listing blocks, a Pitfalls
    page of at least two cases, flashcards, a quiz, and a project
    milestone as its task — and its retrieval cards are COMMAND cards (the
    typed command against anchored patterns, a label that never gives the
    answer away);
    every listing, practice item, task answer and retrieval variation runs
    under the interpreter (or, for units 7+, the full runtime) AND agrees
    with .NET byte for byte
    (`node tools/cs_diff.mjs`, run before every content release). A task's
    answer passes its own cases and rules; its starter does not. A capstone
    (frame 26l, smoke76) ships whole too: a five-question quiz linked to
    written lessons, the brief, a starter that passes no acceptance case,
    milestones of acceptance cases, a rubric with ONE automatic row, and a
    reference answer that passes every case under its runner (both
    runners where they agree; a stage 3 capstone, where "sandbox", on the
    full runtime with no compiler warnings) using only its stage's
    language (stage 1: no arrays, lists or classes; stage 2: no classes
    or LINQ; stage 3 shows its design: an interface, classes, an event
    and LINQ). A stage 4 capstone is built in RIDER (`project`): its
    build is its Rider project's validator milestones, passed only by an
    accepted report (`KOS.code.buildView` reads `projectView`), the
    project carries no reward of its own, and its scaffold is validated
    fresh and solved by `tools/validator_check.mjs`; the review sends a
    file the learner pastes. A TRACK's capstone (Track T1's `CT1` and
    Track T2's `CT2`: `track`, no `stage`) is a Rider capstone the same
    way — its build is the track's last part's project (T1F's, T2E's), its
    page and the hub name it "Track T1 capstone" (or T2), and the track page links
    to it from that part (smoke76 F–G). A program may read and write FILES: a listing,
    task, card or capstone carries `fs` (`{name: text}`), the in-memory
    disk the runner starts from (`req.fs`, returned as the final `fs`),
    and `tools/cs_diff.mjs` runs that program in a fresh folder holding
    the same files, so both runners read exactly the same text.
    A TRACK joins the spine part by part (docs/code-plan.md §3.3): each
    part is a section marked `track` (T1A …, refs `T1.<n>`), released
    whole like a unit, and the core surfaces — the desk's units, the stage
    path, the lesson counts — read the core only (`KOS.code.coreUnits`,
    `coreLessons`). An SQL part (`where: "sql"`, T1A) holds the same
    contract: its listings, practice, tasks and cards are SQL run on the
    part's dataset (`db`, `KOS_CODE.DATASETS`), its error pitfall is an
    SQLite error, a task is checked by its result tables on the café AND
    its twin (`cafe2`, so a typed-in answer fails), a predicted answer may
    give just the values, a card's expected tables come from its own
    answer on the same data, and every program agrees with native SQLite
    (`node tools/sql_diff.mjs`) as C# agrees with .NET.
105. THE SANDBOX. Learner code runs only on the device, in one of two
    runners — three with SQL. Units 1–6: `js/labs/cs-interp.js`, in a Worker with
    fetch, XMLHttpRequest, importScripts and WebSocket removed, no DOM and
    no app data; the page's watchdog terminates it after 4 s; only file://
    and the test harness run it in the page. The sandbox units (7–9, 11, 12,
    `KOS.code.runnerFor`): the FULL RUNTIME, Roslyn and .NET in WebAssembly,
    in a module worker (`cs-wasm-worker.js`) that removes fetch,
    XMLHttpRequest, WebSocket, EventSource, IndexedDB, Cache Storage and
    BroadcastChannel after its warm-up and before any learner program; the
    program stops itself past its step budget or 3 s (each statement is
    marked), and a 9 s watchdog is the backstop. That runtime is an
    optional download, offered (26g) and never fetched until the device
    asks (`state.ui.code.runtime`); the service worker keeps it cache-first
    in `kos-csharp-<id>`, which a deploy's clean-up leaves alone. SQL
    (T1A, `KOS.code.runnerFor` = "sql"): SQLite in WebAssembly (sql.js,
    vendored in `assets/code/sqlite/`) in its own worker
    (`js/labs/sql-worker.js`) that removes the network after SQLite loads
    and before any learner statement; made on the first SQL run, a fresh
    in-memory database each run, the same 4 s watchdog; SQLite is cached
    cache-first in `kos-sqlite-<version>`, kept across deploys. Nullable
    reference types are off in units 1–6 and on from unit 7. A
    capstone's Kurenai review sends only what is ticked in its "What is
    sent" dialog (Cancel first), once per press, and is skippable.
106. PAY ONCE. `KOS.code.award()` is the one definition the Governor pays
    by (type `code`): a task's first proven pass pays its tier (warm-up
    12/1, core 18/2, stretch 26/3) and +3 HP; a phone task (units 1–3 only)
    pays half the XP and gold and +1 HP, and a later computer pass pays
    exactly the rest. A re-run, a pass after "See the answer" (which also
    proves nothing), lesson practice and a failed card pay nothing. A
    retrieval proven pays +4 XP, at most 10 a day, counted from today's
    ledger; past the cap the card still moves. Every no-reward case shows
    "No reward · why". HP gates nothing (invariant 2). A capstone pays its
    `reward` (stage 1: 150 XP, 40 gold, +10 HP; stage 2: 200 XP, 50 gold,
    +10 HP; stage 3: 250 XP, 60 gold, +10 HP; stage 4: 300 XP, 75 gold,
    +10 HP; Tracks T1's and T2's: 250 XP, 60 gold, +10 HP each) once ever — a track project made of clue tasks (T1A's Missing
    Mug: five stretch tasks) pays as its tasks do — and a Rider project pays its own (Bridge B: 120 XP,
    30 gold, +8 HP; unit 10: 150 XP, 40 gold, +8 HP; a track part's — T2A's taster, Your first window: 100 XP, 25 gold,
    +6 HP; T2B's The Reading List: 120 XP, 30 gold, +8 HP; T2C's Markdown
    notes and T2D's Focus timer: 140 XP, 35 gold, +8 HP each; T1C's The Lending Library on EF Core: 150 XP,
    40 gold, +8 HP; T1D's Weather client: 140 XP, 35 gold, +8 HP; T1E's
    Loopback chat: 120 XP, 30 gold, +8 HP; T1B's
    Contacts on SQLite: 120 XP, 30 gold, +8 HP; a capstone's project
    nothing: its capstone pays) once, when every milestone has passed at any evidence
    level (invariant 109) —, on the first
    submission that holds: every milestone passing, the self-marked rubric
    rows marked (correctness is derived from the acceptance runs, never
    set by hand) and a write-up of at least `writeupMin` words. The quiz and
    the review never gate it; a capstone is never locked.
107. STATUS FROM EVIDENCE. A Code lesson's four checks (notes read, listings
    run, a task passed, a retrieval passed) are derived from evidence in
    `state.code` and written to the shared progress record only by
    `KOS.code.syncChecks`; the inspector shows them read-only. The status
    beside the confidence (Not started · Started · Paused · Completed) follows
    them by itself — its first earned check (or a task tried) makes it
    Started, four checks Completed
    (`store.setCheck`) — and may still be set by hand, as in a subject. Reading alone
    never completes a lesson. A tick means complete: EVERY page of the
    shipped lesson read (a filed "Your notes" page never counts), every
    listing run. A page counts as read after a 2.5 s dwell, or on moving on
    with Next after 1.5 s (in Reference, once it has filled half the screen
    for the dwell) — never by a render. The inspector also lists every
    material (pages, listings, practice, flashcards, quiz, tasks). Retrieval grades
    are derived from tries, hints and time — never self-reported — and each
    review asks the next seeded variation.
108. THE COMPUTED PLAN. A lesson is COVERED (`KOS.code.studied`) once its
    first two checks are earned — every page read, every listing run — or
    its work has passed; a page glanced at is not study. Only covered
    lessons feed the Daily 20, the frontier and the skill map's "not
    proven" (everything else reads Later); with nothing covered the Daily
    20 names the lesson to finish instead of a task. The skill map is one
    stack of unit cards that fold open (per device, `state.ui.code.skillOpen`;
    a unit with anything covered opens by default), every status pill one
    size. The Daily 20 (`KOS.code.planDay`) is computed from
    the date and the evidence, never stored: the pick holds all day and
    reads Done once passed. `state.code` is keyed maps throughout (the
    cloud merge folds two devices per key); drafts, the task panel's
    collapse, the reading mode and phone choices are per device in
    `state.ui.code`. Code pages write nothing when drawn (smoke74 E).

109. RIDER EVIDENCE. Work done in Rider comes back only as a validator
    report (`assets/code/validator/validate.cs`: real build, SARIF, TRX,
    scripted runs, a Git check; since 1.1.0 also the learner's own tests
    by name prefix, source patterns a file must or must not hold, a
    warnings ceiling, and PLANTED BUGS — each mutant applied alone in a
    throw-away copy, the learner's tests run against it, an unchanged run
    passing first; a step that did not run is a failure; protected files
    hashed; since 1.1.1 a diagnostic the compiler marks suppressed in
    source — a `#pragma` in generated code, such as CommunityToolkit.Mvvm's
    — is not counted as a warning). A report from an earlier validator is still accepted while its
    version meets the project's `minValidator`: its own validate.cs hash
    (`EARLIER` in `codeproj.js`) stands in for this app's. `KOS.codeProject.check(text)` is pure and runs
    docs/code-plan.md §9.4 in order — 256 KB, JSON and a strict shape
    (unknown fields dropped), one of these projects, a known scaffold, a
    validator new enough, a sane date, then the file's SHA-256 (the same
    report twice changes nothing) — and compares the protected hashes with
    the app's OWN, not the report's or the project file's. CI-VERIFIED
    (docs/github-app-plan.md §7): "Add the workflow" commits
    `.github/workflows/kurenai-validate.yml` (an allowed path; it needs
    Workflows: write) to the linked repository, which runs the same
    validator in GitHub Actions for every folder holding
    `kurenai.project.json` and posts the report as a check run "Kurenai ·
    <project>"; `KOS.codeGit.ciReport` reads the latest one on the branch
    (Checks: read; the `github-token` function asks for both and falls back
    to Contents only) and the report goes through the SAME `check` before
    the preview's Import records it `level: "ci"` (◆ CI-verified). A
    check's conclusion is never trusted on its own, and a milestone shows
    the strongest evidence that passed it. Nothing changes
    until the preview's Import; `KOS.code.recordReport` is the one gate
    (`normaliseEvidence`): a practice-only report marks nothing, a passed
    milestone stays passed and proves its lessons' concepts (their
    retrieval starts), and a lesson's task check reads its project
    milestones. The export is a zip made on the device; the app never
    creates a repository. A project's scaffold is real files
    (`tools/code-projects/`), validated end to end by
    `tools/validator_check.mjs` before a release.

110. CODE → GITHUB. Your work goes only to a repository YOU created and
    connected with a fine-grained token you typed (`KOS.codeGit.connect`
    checks it exists and that the token can write; the app never creates
    or deletes a repository). The token, the queue (outbox) and the last
    status are per device in the media kv (`github.token`,
    `code.github.outbox`, `code.github.status`) — never in the state
    document, a backup (`TOKEN_KV_KEYS`) or a log; the link and the mode
    (`state.code.github = {repo, branch, mode, via}`) sync. v2
    (`via: "app"`): you install the KurenaiOS GitHub App on ONE repository
    ("Connect with GitHub"; a one-time `state` in sessionStorage must come
    back with the Setup URL's `installation_id` and `code`). The
    `github-token` function proves the installation is in your own
    `/user/installations` before it stores `{installation_id, repo}` in
    `kos_github` (RLS on, no policy), and mints a one-hour token for that
    one repository with Contents write on each `token` call; the device
    keeps it in memory only (`tokenFor`, refreshed five minutes before it
    expires), never in the kv, the state or a backup, and needs cloud
    sign-in. Disconnect unlinks it; uninstalling stays on GitHub. Off queues nothing;
    a task's FIRST pass, a submitted capstone and an accepted Rider report
    are queued; Checkpoints push on Push, Automatic about 30 s later. A
    push is ONE commit (Git Data API: a tree on the head, a commit, a
    fast-forward, never force; a moved head is rebuilt on, an empty
    repository gets a first commit) of app-owned paths only (an
    allowlist), within 1 MB a file and 5 MB a push, and a secret scan
    blocks it with the reason. Local first: a failed push never blocks
    progress, and GitHub moves no XP, gold or HP. Katas
    (`KOS.code.kataDraw`, `#/code/kata`) draw five practice questions from
    covered lessons, are recorded in `state.code.katas` and pay nothing.
    In Reports, `f.code` (`programming()` in `report.js`) counts what the
    LEDGER says was proven in the period — first passes (never a seen
    answer), skills proven, retrievals and grades, katas, practice,
    capstones, Rider projects — zero facts absent; the words' payload gets
    those totals only. The Assistant reads Code through `code_overview`,
    `code_lesson` and `code_skills` and has no Code write tool: evidence is
    earned in the app, never set by a tool.

### Japanese (112–118)

112. The subject is `ja` in `KOS.subjects` (not an exam subject, hue `--ja`, 朱); it is live only
    once `KOS_DATA.ja` loads, so a backend release shows nothing.
113. A FACET is one item × one skill (`state.japanese.facets["<item>|<skill>"]`), scheduled through
    `KOS.fsrs` with `KOS.srs.weights()` and the target retention (invariant 111). Its grade is
    DERIVED from the validator's verdict, hints and time (`KOS.jaSrs.gradeOf`), never chosen; a
    self-marked result moves nothing. Facets unlock in order: words and grammar start with R and
    L, W (and S for a word) only once R holds a week, and S only for a lesson's production set.
    Two facets of one item never share a day unless both are over two days overdue; 8 lapses set
    a facet aside. Among facets of equal standing Reading comes first (R, L, W, S), and a facet
    whose sibling was reviewed TODAY waits for another day unless it is over two days overdue
    (JM-10, JM-11). A kana's Writing shows its model only on the first meeting; after that the
    prompt is the reading and "Show the model" (or the stroke animation) counts as a hint, and a
    checkpoint's Writing shows none; a checkpoint draws its questions per attempt (JM-16, JM-20).
    A facet merges WHOLE in the cloud merge: changed on both devices, the one
    reviewed later wins every field. Every rating writes one review-log row (`src: "ja"`).
114. Validators (`KOS.jaValid`) are pure and return one of four verdicts — correct, accepted,
    near, wrong — with a diagnosis; nothing is AI-graded. A new exercise ships only when its
    expected answers pass `tools/ja_valid_check.mjs`.
115. Personal media never leaves the device (saved lines in IndexedDB only; never synced or in a
    backup as binaries). Mined lines live in `kurenai-os-ja-mined` (`KOS.jaMined`; in the full
    backup); the state holds only each line's facet, added once the line is stored. A device
    still on an older version keeps them in `state.japanese.mined` and pushes them: a pull
    takes those lines into this device's store and every push hands that map back UNCHANGED,
    so the older device never sees its lines deleted (smoke135 N). A line already stored is
    never overwritten.
116. PAY ONCE (`KOS.ja.award`, type `ja`): a review session is ONE ledger entry paying +1 XP a
    facet answered correct or accepted (a hint still counts; a near or a wrong pays nothing),
    at most 30 a day, kept up to date answer by answer and paid by difference however the session
    ends or is left (invariant 167); a lesson's first PASS 15 XP, 2
    gold, +3 HP — a pass is every facet the lesson asked answered correct or accepted at
    least once (`KOS.ja.lessonPass`), and none of its misses from an earlier sitting left
    (`lessons[id].miss`, keyed, cleared by a right answer, asked again as practice);
    otherwise "Not passed yet", nothing paid, dated or ticked; a checkpoint
    (80% in every skill it tests) 60/15/+5; a stage gate 150/40/+10. Self-marked work, input
    tallies and mining pay nothing; immersion pays only through Focus. Reads (`due`, `planDay`,
    `skills`, `timeline`, `peek`) write nothing.
117. The timeline is a derived projection: "calibrating" under two weeks of history, then a
    RANGE (rate ± one standard deviation, at least ±15%), never one date, never stored.
118. Generated data carries its attribution: `js/data/ja-strokes.js` from KanjiVG (CC BY-SA 3.0),
    regenerated by `tools/gen_ja_strokes.mjs`, never hand-edited.

### Creatives (154–156; docs/creatives-plan.md revision 2, design turn 31)

154. CREATIVE EVIDENCE IS MADE, NOT CLAIMED. `state.creatives` (synced,
    keyed maps, `KOS.creatives.normalise`) holds evidence and records
    only: pages read, WORKS (a small record each — lesson, study, kind,
    title, words, the self-marked check, `portfolio`), projects by
    milestone, `paid` keys and Firsts. A lesson's four checks — every
    notes page read, every micro-study saved, every study's check passed,
    one theory card held — are derived (`evidence`) and written to the
    shared progress record only by `KOS.creatives.syncChecks`; reading
    alone never completes a lesson. The check is self-marked against the
    unit's "Good for this unit" (one or two rows, the unit's ONE skill,
    the later skills struck through): every row "Yes, mostly" passes,
    "Not yet" is a normal answer that ticks and pays nothing. PAY ONCE
    (`KOS.creatives.award`, type `creatives`): a study's first pass 8 XP
    and 1 gold (`study:<lesson>.<s>`), a drill batch 6 XP once a day per
    type (`drill:<type>:<day>`) — only a batch where a round's controls moved
    (CR-32; Check and Next alone are not work, and such a batch logs nothing), a unit's project 150 XP, 40 gold, +10 HP
    when every milestone is reached AND has a saved work attached (`project:<unit>`; a hand
    "Mark done" is progress only; a piece attaches only when it is on no milestone, of the
    project's track, and named in no other project's receipt `projects[<unit>].paidWith`;
    once paid the page says "Paid on <date> · no further reward"). Volume (words,
    reps, strokes), re-saving, redoing, promoting and critiques pay
    nothing; Creatives Focus time pays by the Focus rules (it is study,
    never leisure); theory cards are ordinary flashcards keyed
    `creatives:<lesson>:<i>` (invariant 111). There is no Creatives
    streak, and nothing is locked: a project is OFFERED after its
    studies, with "Try it anyway". The Daily Creative (`planDay`) is
    computed from the date and the evidence, never stored: one study (or
    a project milestone) and the due cards, only on the chosen days
    (per device, `state.ui.creatives.settings`), paused in Exam Season
    (on by default). Pages write nothing when drawn (smoke108 C).
155. KURENAI CRITIQUES, NEVER CREATES. No tool generates, rewrites or
    finishes a piece. A critique (31r, `KOS.crCritique`) sends only what
    its "What is sent" dialog shows (`KOS.creatives.critiqueRequest`,
    pure: the picture, or the text's first 600 words — never its title —
    the brief, the unit and its ONE skill, "Good for this unit" and the
    instruction), once per press, Cancel first; Gemini for a picture,
    the tutor route for text. The reply is two parts, what worked and ONE
    thing to try; one that names a later skill of the lesson's "ignore"
    list or compares with professionals is refused (`stray`). "Keep with
    this rep" keeps it on the work (`critique`); "Try it on the next rep"
    pins the tip to the study per device (`ui.creatives.tips`). It pays,
    rates and ticks nothing. The Assistant gets read tools and no write
    tool for evidence.
156. PRACTICE IS PRIVATE, THE PORTFOLIO IS CHOSEN. The Practice Log
    (`#/creatives/log`) is drawn only when opened: never on the desk (one
    private link), Home, Reports, a share or Kurenai's context. Only a
    deliberate "Promote" puts work in the Portfolio, and it pays nothing.
    A work's text or picture and every Writing Desk draft (`doc:<id>`,
    with its versions) live in their own IndexedDB, `kurenai-os-creatives`
    (`KOS.creatives.files`), never in the state document; they ride the
    full backup and stay on the device (upload on request comes later).
    References are generated or the user's own; nothing is bundled or
    hot-linked. A month's, term's or year's report keeps the ids of the
    pieces promoted in it (`promotedIds`, never in the words' payload);
    its "Made this month" strip shows them only when "Portfolio in month
    reports" is on (per device, off by default), reading each live, so a
    piece taken out of the Portfolio leaves it. The phone desk (31s)
    reviews and reads: no path strip, Continue card, unit path or Practice
    Log link, and a study made elsewhere puts the cards first. THE
    PICTURES come from `art-source/creatives/manifest.json` (Art units
    1–3's step pictures and beginner pages, the empty-state spots), drawn
    by `KOS.crArt` only once imported into `assets/creatives/img/` and
    listed in `KOS_CR.ART` (smoke108 M); a step list draws its pictures
    all four or none, and each caption is its manifest caption word for
    word (smoke108 N). Writing's and Design's examples are words and type
    and stay live. THE SKETCHBOOK draws an Art study on the ink engine
    (its ink in `kurenai-os-ink` under `sketch:`); Save keeps the page as
    a picture in `kurenai-os-creatives`. MOMENTUM, offered by a study's
    `momentum`, is per device (`ui.creatives.momentum`) and chosen before
    the first stroke: the desk's undo does nothing (`desk({noUndo})`), the
    bar has no undo, redo or eraser, and the work is marked `momentum`. THE JOINS read, never write: Goals' Creatives domain
    (`cr-studies`, `cr-drill-days`, `cr-words`; Creatives hours are
    Study hours with the subject) reads the ledger and the works;
    Reports' `f.creatives` (`creativeFacts`) holds totals only — studies
    passed, drill batches and days, pieces, words, promoted, projects —
    from the works' dates, track, words and promotion (gather never reads
    a title or a text), and the words' payload gets four of them.

### Mind (137–141; docs/mind-plan.md revision 2, design turn 32)

137. A CONCEPT IS THE UNIT OF RETENTION. Concepts (`KOS_MIND.CONCEPTS`,
    authored in `js/data/content/mind-<unit>.js`) have stable ids; cards
    (`state.mind.cards["<concept>:<i>"]`, on `KOS.fsrs` like every card,
    invariant 111, review-log `src: "mind"`, merged WHOLE like a Japanese
    facet), checks and Journal links point at the id. A concept's ladder —
    Recall (every card rated Hard or better), Explain (an explain-back
    ticking 60% of its key points, or a checkpoint rubric row), Apply (a
    scenario answered right), Evaluate (a position with an objection
    answered, or a rubric row) — is DERIVED from evidence by `KOS.mind`
    and never stored or ticked. A concept's REACHABLE rungs (`KOS.mind.reach`,
    MI-03) are read from the same authored sources; a rung no exercise leads to is drawn "not in
    this unit yet" and the desk's bars and "furthest" count only concepts that can reach it.
    A lesson asks ONE written prompt by its
    `kind` (an explain-back, or a position for a contested lesson);
    "Later" parks it and never blocks the other checks. A lesson's checks
    (pages read with the 2.5 s dwell, the check passed, the prompt, a
    first retrieval) reach the shared progress record only through
    `KOS.mind.syncChecks`; the desk's ring is mastery like every subject's
    (the mean of the released lessons' checks). Mind is a study space, not
    an exam subject (`KOS.subjects`, hue `--mind`, Fuji), and has NO
    streak of its own: it feeds the study streak only. PAY ONCE
    (`KOS.mind.award`, type `mind`): a review block is ONE entry paying +1
    XP a passed card, at most 15 a day; a lesson's first finish 12 XP, 2
    gold, +2 HP; a unit checkpoint 50/12/+4 on its FIRST PASS only (at least two thirds of
    the scenarios right and half the rubric in one attempt, `KOS.mind.cpRule`, stated on the
    page; the record keeps the best of every attempt, so a retake never lowers a rung); a path 120/30/+8. Writing —
    explain-backs, positions, the Journal, dialogues, Ask Kurenai — pays
    nothing. The Daily 15 is computed from the date and the evidence
    (`planDay`: reviews · one sitting · one question; 5 minutes of reviews
    in Exam Season), run as a Focus stopwatch and paid by the Focus rule.
    Reads write nothing (smoke109 A, smoke110 D).
138. POSITIONS ARE VERSIONED, NEVER OVERWRITTEN. A revision appends a
    dated version under its own random key (`positions[lesson].versions`,
    so two devices' revisions both survive the merge) with its reason and,
    on a revise, "what changed my mind". Revisits come at about 14, 60 and
    180 days (Keep · Revise · Retire; retired is kept, struck). Tensions
    are authored (`KOS_MIND.TENSIONS`), never inferred.
139. THE JOURNAL IS PRIVATE AND LOCAL FIRST. Insights, quotes, questions
    and reflections live in IndexedDB `kurenai-os-mind` (`entries`, `del`
    tombstones; `KOS.mindJournal`), ride the full backup and replicate to
    the owner-only `kos_mind` (migration `20261029000001`, applied 29
    October 2026) on Money's pattern. Reports count entries and never
    quote them; the Assistant's `mind_overview`/`mind_concept` read counts
    and ladders, never an entry or a position's reasons.
140. KURENAI DISCUSSES, NEVER GRADES. The Socratic dialogues are AUTHORED
    trees (`KOS.mindTree`, pure: 2–4 choices and a way out at every
    question, every path 3–5 turns, voiced by Kurenai or Ren, held by
    `tools/mind_tree_check.mjs` and smoke111) and work offline. Ask
    Kurenai (four modes, on request) sends only what "What is sent" shows,
    once per press, and never sets mastery, a position or a checkpoint. A
    Mind lesson's inspector carries it in place of the generic exam strip
    (`cx.assistStrip = false`).
141. CLAIMS CARRY THEIR EVIDENCE. Every psychology finding is marked
    Robust, Debated or Failed to replicate (`KOS.mindUI.finding`) and names
    its study on the lesson's Sources tab. Primary sources come from
    public-domain translations only. Numbers (Bayes, payoffs, odds) are
    checked by program before they are written. The art is original and
    AI-assisted (Gemini; one philosopher card in ChatGPT), credited on the
    Path page.
