# code-space — December 2026 audit (Batch 2, slot 5)

Code space on kos-qol-5. Pay (tasks, phone top-up, See the answer, retrieval, Rider project) matches invariant 106 to the unit; checks and coverage follow invariants 107–108; study-cleanup batch 7's Code card keys are sound. New: one P1 layout (a Code lesson's tabs collapse to 0–5 px on iPhone and Slide Over), two P2 runner issues from Phase 1 (SQL boot timeout still kills the loading worker so retries never succeed on a slow link; live help re-downloads the 10 MB runtime on editor focus once its cache is gone, and Settings claims it is on the device) and six P3s. Cite, don't refile: CARBON-1-2 (READS.code omits errorLog — the new Log mistake pill), CARBON-1-3 (state.code.cards merges field by field).

Counts: P0 0 · P1 1 · P2 2 · P3 6

## Findings

- **CO-43** (P1, layout) iPhone and Slide Over: a Code lesson's tabs (Notes, Practice, Flashcards, Quiz, Tasks, Files) shrink to a 0–5 px strip — only two overlapping chevrons show — `css/views/code.css:240 (.k-topic-tabrow > .k-cx-mode { flex: 0 0 auto }) adds a 166 px fixed item to the row built in js/modules/topic.js (scroller + k-topic-more + Working :359 + Edit :348); css/views/study.css:208/211 gives the scroller flex: 1 1 auto; min-inline-size: 0, so it alone absorbs the shortfall down to 0. No phone tier wraps the row or moves the switch.`
- **CO-39** (P2, bug) SQL on a slow link: the new boot timeout kills a SQLite still loading, so 'Try again' restarts the 700 KB download from zero and never succeeds — `js/core/coderun.js:268-276`
- **CO-40** (P2, bug) Live help silently re-downloads the 10 MB full runtime when you merely focus any C# editor (even unit 1) once its cache has gone — `js/core/coderun.js:189-192`
- **CO-41** (P3, copy) Run now says '4 s limit' but a Check timeout card says 'Stopped after 2 seconds in case 1' — after 112 ms, stopped by the step budget — `js/core/codeui.js:266`
- **CO-42** (P3, ui) Check's 'Checking…' label lasts only until the first case answers: the shared runner status puts '✓ Check · N tests' back mid-check — `js/core/codeui.js bindRun apply(): on every status emit it rewrites btn.textContent to baseLabel when state is 'ready' (emitted by coderun.js after each case's reply, e.g. :80, :250) and sets btn.disabled = active, overriding the page's own 'Checking…' / disabled set in js/modules/code.js:745-749; check() runs cases one by one so status returns to 'ready' between them.`
- **CO-44** (P3, data) '+ Log mistake' on a task files the task's title as the lesson's title: the Error Log shows '1.2 · Halves' for lesson 1.2 'Values and types' — `js/modules/code.js:802`
- **CO-45** (P3, a11y) Capstone Result: the new 'missing' links (and every step change) drop keyboard focus to the page body — `js/modules/codecap.js:89-95`
- **CO-46** (P3, content) T1.2 retrieval card asks to 'List the bakery that cost less than £2.00' — `js/data/content/code-t1a.js:939 CATS = ['drinks','bakery'] and :944 'List the ' + cat + ' that cost …'`
- **CO-47** (P3, bug) Unit 7+ lesson listings: live help checks with nullable off, so it shows no warning where Run then reports CS8600/CS8602 — `js/core/codeui.js:724`

## Coverage

Accounts: dense (mine, seeded), sample, empty

Sizes: mac, ipadl, ipad, iphone, split, slide

Routes:
- #/subject/code
- #/code/map
- #/code/task/1.1-box
- #/code/task/T1.2-cheap
- #/code/task/7.1-tally
- #/ref/code/1.1
- #/ref/code/T1.2
- #/code/settings
- #/code/capstone/C1
- #/code/skills
- #/code/kata
- #/code/retrieval
- #/code/track/T1
- #/code/project/rp-u10-library (dense, 6 sizes)
- #/subject/code, retrieval, kata, skills (empty, 6 sizes)
- #/subject/code, #/code/task/1.1-hello (sample, 6 sizes)
- cold reloads of #/ref/code/1.2, task 7.1-tally, capstone C3, project rp-bridge-hello, desk

Flows exercised:
- task fail (compile) → pass → re-run (interp): 12/1/3 once, then 'already passed'
- stretch task 2.9-average 26/3/3
- phone pass 9/1/1 then computer top-up 9/1/2 then nothing
- See the answer → pass pays 0
- infinite loop Run and Check (interp step budget, wasm step budget)
- SQL Run/Check warm and cold; boot timeout under a throttled service worker (300 and 500 kbps)
- full runtime offer, dialog sizes, download, 'Run it', compile error, loop, pass 12/1/3
- Roslyn live help: squiggles, gutter, problem line, completion after 'Console.'; runtime cache evicted
- listing live help on unit 7
- reload mid-Check on the full runtime
- + Log mistake, Undo present, Error Log hub, Go to source
- topic page reading: dwell + Next + every listing → checks 1–2, studied (1.1, 1.2, 7.1, T1.2)
- retrieval (SQL card) proven: +4 XP, FSRS row, cap counter
- kata intro and first question
- Rider report import (bridge solved fixture): preview, Import 120/30/8, duplicate rejected
- capstone Result missing links (C1, C2)
- Code goal measures vs the ledger (tasks 5, retrievals 1)
- study-cleanup batch 7: every Code flashcard and quiz key unique, explicit keys match original positions, no orphan srs keys

Not covered:
- GitHub (never, by rule)
- Kurenai capstone review (no AI)
- a capstone submitted to the end and its pay
- Rider projects other than Bridge B's import
- Track T2 pages and the remaining capstones beyond a render
- copy account (slot 7) pass
- the full runtime's 60 s boot kill on a slow download (CO-39 fix note names it)

## November re-check

- CO-04: **fixed** — 2.9-guess: Run's input is a textarea holding the whole example ('42\n50\n30\n42'); the answer runs ('Correct in 3 guesses').
- CO-06: **fixed** — With 1.1 and 1.2 studied, Continue points at 1.3.
- CO-07: **fixed** — Retrieval lists 'Next reviews will ask… a different variation each time' with no SM-2 dates; the rating schedules through KOS.fsrs (s 8.2956, d 1, ivl 6, fl set).
- CO-17: **fixed** — KOS_CODE.CONCEPTS: validation → 3.6, form-validation → T2.17, validation-reports → B.8; KOS_CODE.DUPES empty.
- CO-32: **fixed** — Desk tile reads 'Tasks passed 3 / 227' (passed of core tasks).
- CO-38: **fixed** — Search groups 'Code lessons' and, in the UI's second pass, 'Code projects and tasks' (found 'box of stars').
- CO-01: **still open** — Sampled: iPhone desk stage path still shows skewed diamonds and tall squares.
- CO-02: **still open** — Sampled: iPhone Daily 20 and Continue side by side.
- CO-09: **still open** — Sampled: task/kata pages on iPhone titled 'Code'.
- CO-15: **still open** — Partly addressed by 1D code-space#5 (Next task / Back to the lesson after a pass); the clock was not re-checked.
- CO-16: **still open** — Daily 20 'Done today' still says 'haven't proven Input loops in code yet'.
- CO-19: **still open** — Partly: 1E names a boot timeout ('SQLite took too long to start — your code was not run') and the SQL limit chip; the kill-and-retry-cold half remains and is filed as CO-39.
- CO-20: **still open** — SQL task still shows STDIN and an '(none)' input column.
- CO-24: **still open** — Settings still says 'time limit 2 seconds a run'; Phase 1's new '4 s limit' chip makes three limits (CO-41).
- CO-25: **still open** — 'See the answer?' still says 'today's first pass will pay no reward'.
- CO-26: **still open** — Problems tab 0 after a Run compile error; live help now shows a third count in the status bar.
- CO-27: **still open** — Task runtime card still says 'read the listing and its output below'.
- CO-21: **still open** — Partly: 1E colours the runtime/runner card head --code (code.css); the compile-error head was not re-measured.

Evidence: /Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/code-space/ (screenshots, and the t*.js / cdp.mjs / swthrottle.mjs helpers).
