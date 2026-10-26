# KurenaiOS delivery status

This file is the current delivery snapshot, not a turn-by-turn work diary. The
previous 4,000-line chronological record was consolidated on 9 August 2026; durable
architecture and safety rules remain in `CLAUDE.md` and `AGENTS.md`.

## Current state

**Everything through Files is integrated, deployed and production-verified
(26 October 2026).** The foundations are Category 7 (Phases A–G, 9 August
2026), the cloud three-way merge and the editable curriculum (17
September), the AniList mirror and notification centre (19 September) and
the Graphite UI rebuild (27 September); since then Reports, Code, Money and
Goals, FSRS, the Exams hub, the closed-app runner, the iPad layout,
Japanese, Routines and the Daily Review, the ink engine and the iPad and
Pencil build, and Files have shipped (sections below; CLAUDE.md's "Latest
release" keeps each one's deployment).

| Item | Current value |
|---|---|
| Production | https://kurenai-os.pages.dev |
| Latest release | Files R1–R4, airing on a closed app, CI-verified Rider evidence, habits several times a day (sw `kos-files-1`), immutable DEPLOY_URL, 26 October 2026 |
| Service-worker cache | `kos-files-1` |
| Smoke gate | 106 / 106 suites (`""` and 2–106; 80–83 are Japanese's, 99 is Code's SQL runner, 100 and 105 the ink engine and the iPad build, 101–104 Routines, 106 Files), plus `tools/cs_diff.mjs`, `sql_diff.mjs`, `ja_valid_check.mjs`, `fsrs_check.mjs`, `validator_check.mjs` |
| Release tags | `milestone/graphite-ui-rebuild` (latest), `milestone/category-7-ui-ux-overhaul` |
| Branch | `main` is the line; each release is fast-forwarded to it from its `feat/...` branch (last: `feat/files`). `claude/roadmap-code-study-space` is behind it with nothing of its own |
| In flight | Japanese Stage 1: F3 (Things and places) next, F4–F6 outlined in [japanese-plan.md](docs/japanese-plan.md) §3.1; the reader, media and immersion pages later. Exams hub: the full Companion for CS Paper 1, then Maths Papers 1–3 and F201, one paper per release. Creatives and Mind: planned, waiting for a go-ahead. The art and gold-shop audit (roadmap 5.13) |
| Working across accounts | [docs/HANDOFF.md](docs/HANDOFF.md); shared memory in [docs/memory/](docs/memory/MEMORY.md) |
| Still to do | [docs/ROADMAP.md](docs/ROADMAP.md) |

Release history is in the sections below (newest first) and in Git: every
release commit is titled `release: …` and names its service-worker version.
Production deployment is separate from Git push and is performed only through
`tools/deploy_pages.sh`.

## Released 26 October 2026 — Files, airing on a closed app, CI evidence, habits several times a day

- Files (roadmap 5.11, R1–R4): the `KOS.files` index over the file store and
  the Paper library — one file stored once and linked many times, aliases,
  kind only up — the Files page and Storage under Archive, one viewer
  (pictures take ink as a one-page PDF), pinned notes, drop and paste
  anywhere, Scan pages, Share to KurenaiOS, text search inside PDFs,
  automatic upload under 25 MB with Free up space, papers kept in your
  cloud, an assessment's files, the Assistant's file tools, Ask Kurenai about
  this page and redo items clipped from a marked paper. Invariants 150–153;
  smoke106.
- The runner (version 7) sends new episodes of the shows you watch from
  AniList's public schedule, and Wishlist release days (invariant 131).
- Rider projects: a GitHub Actions workflow runs the validator on every push;
  its report comes back ◆ CI-verified (invariant 109).
- Habits several times a day (invariant 142).

## Released 26 October 2026 — the rest of the iPad build, Files R0 (sw `kos-pen-1`) and Routines (sw `kos-routines-1`, `-2`)

See CLAUDE.md's "Latest release" and docs/ROADMAP.md 5.10 and Phase 6.

## Released 24 October 2026 — Japanese Stage 1 unit F2: Days and times

`5bffba6`, sw `kos-japanese-4`, immutable https://e424163d.kurenai-os.pages.dev.

- Lessons 2.1–2.6 (the time, the days and でした, から・まで, dates, the next
  train, phone numbers) on the eight-page contract, with checkpoint cp-F2
  and the clock and phone panels; every line voiced.

## Released 23 October 2026 — Japanese Stage 1 unit F1: First conversations

`7aeaa5d`, sw `kos-japanese-3`, immutable https://40739699.kurenai-os.pages.dev.

- Lessons 1.1–1.6 on the eight-page contract (Hook … Quick reference), VN
  scenes and manga panels over the user's own art, Makoto joins the cast.
- The audio pack: the cast on ElevenLabs, the narrator on VOICEVOX:No.7,
  baked by `tools/bake_ja_audio.mjs` into `js/data/ja-audio.js`.

## Released 22 October 2026 — Japanese platform and review fixes

`d061169` (sw `kos-japanese-1`), then `ee1a746` (sw `kos-japanese-2`).

- Japanese as the fifth subject: the backend (facet scheduler on FSRS, kana,
  conjugation, validators, strokes from KanjiVG; invariants 112–118,
  smoke81, smoke83), the pages drawn to design turn 28 (desk, lesson,
  session, Kana, Skills, path, checkpoints, settings, licences; smoke80) and
  Stage 0's sixteen kana lessons (smoke82).
- Review fixes: no rail item (a Study subject), one navigation, the path in
  the desk's hero, aligned rows.

## Released 22 October 2026 — the iPad layout (roadmap 6.0)

`87f9437`, sw `kos-ipad-1`. The rail opens over the page at 701–1080px and
topic pages no longer collapse at 1081–1240px
([ipad-plan.md](docs/ipad-plan.md)).

## Released 22 October 2026 — after FSRS

`13cef94`, sw `kos-runner-2`.

- Switching a Focus session's subject, topic or assignment mid-way
  (invariant 4a, smoke95).
- FSRS phase 3: the optimiser and the replicated review log (migration
  `20261022000001`; smoke96).
- What reaches a closed app: the outlook, Web Push and the `runner` Edge
  Function with a five-minute cron (invariant 131; smoke97; migration
  `20261022000002`).
- Code → GitHub as a GitHub App (invariant 110; smoke98; `github-token`
  deployed, migration `20261022000003`; the App itself is not created yet).

## Released 21 October 2026 — the Exams & Deadlines hub

`3b39ae1`, sw `kos-exams-1`. Phases 1–6 of [exams-plan.md](docs/exams-plan.md):
the assessment record, Scope Builder, readiness, planner, Exam Room, Paper
library, goals, the archetype catalogue and Companion, and the exhaustive
Companion for CS Paper 2 (smoke89–94). Next paper: CS Paper 1.

## Released 20 October 2026 — FSRS and Money and Goals

- FSRS phases 1–2 (`fbea5d5`, sw `kos-fsrs-1`): one FSRS-6 scheduler for
  flashcards and Code's cards, the SM-2 switch, the review log, the
  exam-aware cap, leeches and Rework (smoke88).
- Money and Goals (`084a628`, sw `kos-money-1`): the Money core, the Goals
  engine, the joins and the pages (smoke84–87; migration `20261019000001`).


## Released 23 October 2026 — Code Track T1 complete

sw `kos-code-24`, immutable https://f6ddf42e.kurenai-os.pages.dev
(branch `feat/code-t1-rest`).

- **T1D, HTTP and REST**: five lessons in the app on the full runtime
  (methods, status codes and headers; HttpClient and JSON; retries,
  timeouts and cancellation; REST design; API keys, OAuth and JWTs), with
  10 tasks and 6 cards. Each program ends with its own fake server (an
  `HttpMessageHandler`), so HttpClient runs unchanged with the network
  sealed. Every program agrees with .NET (`cs_diff`).
- The full runtime is now `csw-1.1`: it roots `System.Private.Uri`, because
  trimming had removed `Uri.Query`, `Segments` and `Authority`. A device
  that downloaded `csw-1.0` downloads the new one once, and the old cache
  is cleared.
- **The Weather client** (T1D's project, in Rider): HttpClient with
  retries and backoff, a deadline per attempt, an API key from user
  secrets; tested against a fake server; 140 XP, 35 gold, +8 HP.
- **T1E, Networking**: three Rider lessons (IP, DNS and ports; TCP and
  UDP; sockets) and **Loopback chat**, a `TcpListener` chat server tested
  with real TcpClients over loopback; 120 XP, 30 gold, +8 HP.
- **T1F, Building an API**: three Rider lessons (minimal APIs; persistence,
  configuration and secrets; testing with WebApplicationFactory) and
  Track T1's capstone **CT1, The Planner goes online**: an ASP.NET Core API
  over EF Core with migrations and an API key, with five milestones;
  250 XP, 60 gold, +10 HP.
- A unit 11 listing with two equal delays (it printed in either order) now
  waits 30 and 130 ms.

## Released 23 October 2026 — Code's spine: Core or Tracks

sw `kos-code-23`, immutable https://b0ccc028.kurenai-os.pages.dev.

- The lesson list shows the core path OR the tracks (their written parts as
  sections, then tracks to come and deepening), with the count and filter
  for the group shown; the open lesson's group is selected; the switch
  spans the list.
- The desk's Projects card shows the two that matter now ("2 of 8");
  tracks with written parts say "3 of 6 parts" / "All 5 parts".

## Released 23 October 2026 — Code Track T2: desktop apps with Avalonia

Release `8ff3751`, sw `kos-code-22`, immutable https://b7cc2382.kurenai-os.pages.dev.

- **The whole of Track T2** (T1 paused after T1C): five parts, 20 Rider
  lessons, 16 command cards, all on Avalonia 12 — T2A Your first window,
  T2B XAML, styles and binding, T2C MVVM (CommunityToolkit.Mvvm), T2D async
  apps and services (DI, a fake `TimeProvider`), T2E a complete app
  (navigation, validation, accessibility, responsive layout, publishing).
- **Four projects and the track's capstone**, every acceptance suite
  driving real windows on Avalonia.Headless (find by name, type, click,
  Tab, resize): *Your first window* (taster, 100/25/6), *The Reading List*
  (120/30/8), *Markdown notes* and *Focus timer* (140/35/8 each), and
  *The Planner on the desktop* — the first track capstone (`CT2`,
  250/60/10).
- XAML blocks are highlighted in the notes; every Pitfalls message comes
  from a real build or run.
- Validator 1.1.1: a diagnostic suppressed in source (the MVVM toolkit's
  generated code) no longer counts as a warning; 1.1.0 reports still import.
- 99/99 suites; `tools/validator_check.mjs` runs all ten projects fresh,
  solved and with a planted mistake.

## Released 23 October 2026 — Code T1B and T1C: SQL from C# and Entity Framework Core

Release `2db0b4f`, sw `kos-code-21`, immutable https://2c5de69f.kurenai-os.pages.dev.

- **T1B, SQL from C# (in Rider):** three lessons (Microsoft.Data.Sqlite,
  parameters and injection, transactions and a repository), three command
  cards and *Contacts on SQLite* — four milestones; the validator refuses
  SQL glued together. 120 XP, 30 gold, +8 HP once.
- **T1C, Entity Framework Core (in Rider):** six lessons (entities and
  DbContext, what LINQ translates, migrations, relationships and loading,
  change tracking, N+1), four command cards and *The Lending Library on EF
  Core* — seven milestones whose acceptance tests run on SQLite in memory,
  read the SQL EF sends and count the queries (`Members()` ships as an
  N+1 to fix). 150 XP, 40 gold, +8 HP once.
- Both scaffolds pin the native SQLite past advisory GHSA-2m69-gcr7-jv3q;
  `tools/validator_check.mjs` runs both fresh, solved (a real
  `dotnet ef` migration for T1C) and broken.
- Code spans no longer pair `$` signs as maths; smoke97 reads the app's
  clock. 99/99 suites.

## Released 23 October 2026 — Code's SQL sandbox and T1A, Databases

Release `07b3520`, sw `kos-code-20`, immutable https://4eef907a.kurenai-os.pages.dev.

- **The SQL sandbox (Spike S):** SQLite in WebAssembly (sql.js 1.14.2,
  vendored) in a sealed worker, fetched on the first SQL run (~700 KB) and
  kept offline; results as text tables; held to native SQLite by
  `tools/sql_diff.mjs` (324 of 324 programs) and smoke99.
- **Tracks join the curriculum:** T1's six parts are in the Study spine
  (Track T1), the T1 page lists parts, lessons and the project; the core
  surfaces stay core-only.
- **T1A, Databases:** eight lessons (tables and keys to transactions and
  indexes), 16 tasks checked on two cafés, 6 retrieval cards, and The Case
  of the Missing Mug — five clue queries.
- 99/99 suites.

## Released 23 October 2026 — Code stage 4: the core path complete

Release `a1bc5c5`, sw `kos-code-19`, immutable https://a53c4f26.kurenai-os.pages.dev.


- **Unit 10, testing and design (in Rider):** ten lessons in the Rider
  form with typed command cards, and the project *The Lending Library*: pin
  a legacy late-fees module down with your own tests, prove they catch
  planted bugs, then give it a clock and a notifier under their
  protection. Six milestones; 150 XP, 40 gold, +8 HP once.
- **Unit 11, async, events and I/O** and **unit 12, data structures and
  algorithms:** 9 and 14 lessons on the full runtime (unit 12 moved there:
  its lists, trees and graphs are classes).
- **Capstone 4, *The Revision Planner*:** a four-project service built in
  Rider — a planner over interfaces, async JSON storage, a priority queue,
  a command line and the learner's tests. Its build is its validator
  milestones; the capstone pays 300 XP, 75 gold, +10 HP once.
- **Validator 1.1.0:** the learner's own tests, source checks, a warnings
  ceiling and planted bugs (each mutant in a throw-away copy). Bridge B
  reports from 1.0.0 are still accepted. Run end to end on macOS for all
  three projects (`tools/validator_check.mjs`).
- 3,623 of 3,623 Code programs identical to .NET; 98/98 suites.

## Released 16 October 2026 — Bridge B, binary files and the full C# runtime

- **Lesson 6.10, binary files:** bytes and encodings, `File.WriteAllBytes`,
  `BinaryWriter`/`BinaryReader`, hex dumps, file signatures, fixed-size
  records and XOR; two tasks and a card. The runner learned `byte`,
  `Encoding`, `BitConverter`, `FileStream`, `sizeof`, `args` and the file
  locks .NET keeps on macOS and Linux.
- **Bridge B, your real toolkit:** eight lessons done in Rider, with
  command retrieval cards (the typed command is checked, never
  self-marked), and the Bridge project *Hello, Kurenai*: export a zip made
  on the device, build it in Rider, run the validator, import its report
  through a preview. The validator was run end to end on macOS in four
  scenarios; the project pays 120 XP, 30 gold and +8 HP once.
- **The full C# runtime for units 7+:** Roslyn and .NET 10 in WebAssembly
  as an optional, offline download (26g), with nullable warnings; 26 of 26
  stage 3–4 programs identical to native .NET. Code settings show and
  remove it.
- smoke77 (the runtime's wiring) and smoke78 (Bridge B and the Rider
  workflow); the gate is 78 suites.

## Released 16 October 2026 — Code capstone 2 and the topic gaps

- **Capstone 2, the gradebook from a CSV:** load a CSV of marks from the
  in-app disk (a clean, a messy and an empty file), survive its bad lines,
  list, ask about a student or a subject, rank, grade, correct and save —
  five milestones, eleven acceptance cases; stage 2 pays 200 XP, 50 gold
  and +10 HP once. The capstone page shows the files and what a run wrote.
- **Topic gaps closed:** a new lesson 5.9, dates, times and durations
  (`DateTime`, `TimeSpan`, `DateOnly`, formats, parsing; two tasks and a
  card); three-dimensional arrays in 4.6; empty and ended input from
  `Console.ReadLine` in 2.8; ten lessons added to units 8, 9, 11 and 12
  (interface or abstract class, the stack and the heap, a vector type,
  aggregation and composition, higher-order functions, extension methods,
  binary files, bitwise operators, Reverse Polish notation, Dijkstra and
  A*). The core path is 131 lessons.
- **The runner learned dates:** `DateTime`, `DateOnly`, `TimeOnly` and
  `TimeSpan` with their arithmetic, standard and custom formats in five
  cultures, `Parse`/`ParseExact`/`TryParseExact`, and the escapes in an
  interpolation's format; a bare `default` takes its declared type. 2,088
  of 2,088 programs identical to .NET 10.
- A phone task card shows the task's files.

## Released 16 October 2026 — Code unit 6: files, exceptions and debugging

- **Nine lessons:** exceptions, reading and writing files, try/catch/
  finally, throwing your own, validating input, a debugging method, stack
  traces, and a log analyser; 18 tasks and 6 retrieval cards.
- **An in-memory disk:** listings, tasks and cards bring their own files,
  shown above the code, and the page shows what a run wrote; the .NET
  differential runs each such program in a folder holding the same files.
  2,045 of 2,045 programs identical to .NET 10.

## Released 16 October 2026 — Code unit 5: text

- **Eight lessons:** strings are immutable, Split and Join, formatting
  numbers (standard and custom formats, alignment), parsing safely with
  TryParse, StringBuilder, culture and comparison, characters and Unicode,
  and a first look at regular expressions; 16 tasks and 8 retrieval cards.
- **The runner learned unit 5:** ranges and `^` indexes, raw string
  literals, combined `StringSplitOptions` and a split count, `CultureInfo`
  (en-GB, en-US, de-DE, fr-FR and invariant, with ICU's digits and
  spacing), culture-aware `TryParse`, ordinal and case-insensitive
  comparison, the rest of `StringBuilder`, `Regex` (match, groups numbered
  as .NET numbers them, replace, split), `long.Parse`, and the using
  directives .NET does not import for you. 1,730 of 1,730 programs
  identical to .NET 10.

## Released 16 October 2026 — Code unit 4: collections

- **Eleven lessons, stage 2 begins:** arrays, `List<T>`, counting with
  `Dictionary` (the plan's depth reference, written in full), `HashSet`,
  queues and stacks, 2-D and jagged arrays, tuples, sorting and searching,
  choosing a collection, collections and methods, and an inventory to
  practise on; 22 tasks and 10 retrieval cards.
- **The runner learned unit 4:** `int[,]` grids, `SortedDictionary`/
  `SortedSet`, `StringComparer.OrdinalIgnoreCase` keys, the rest of the set
  and queue API, `BinarySearch`, `Clone`, named tuple literals and tuples
  copied by value, and the compile errors the lessons teach (CS1955, CS1586,
  CS1503 for a list's item type, CS0022, CS8132, CS0021 on `Keys`). 1,445 of
  1,445 programs identical to .NET 10.

## Released 16 October 2026 — Code capstone 1: the text adventure engine

- **The capstone checkpoint (frames 26l, 26k):** six steps — a
  closed-book quiz on the study quiz engine that never locks (under 3 of 5
  it recommends two lessons), the brief & build in one IDE-style workspace
  (the editor, a Run · Tests · Problems tool window, and a Milestones window
  with each milestone's examples and the whole brief; the code saves on the
  device as it is typed) against five milestones of acceptance
  tests, the rubric (correctness filled from the tests), an optional Kurenai
  review behind "What is sent", the write-up and the result. Passing pays
  +150 XP, +40 gold and +10 HP once.
- **Capstone 1:** a text adventure in stage 1 C# only — rooms, exits,
  items, a locked door and forgiving input; the reference answer matches
  .NET on every case (1,073 of 1,073 programs).
- **Reached from** the stage path's diamond, the curriculum map and the
  desk's Capstones tile. The curriculum map no longer overlaps its columns
  on a phone.
- 76/76 suites (smoke76: capstones); the responsive audit is clean.

## Released 15 October 2026 — Code unit 3: methods and scope

- **Eight lessons:** why methods, parameters and return values, scope and
  lifetime, overloads with optional and named arguments, `out` and `ref`,
  guard clauses and validation, a first look at recursion, and decomposing
  a problem; 16 tasks and 8 retrieval cards.
- **The runner learned unit 3:** named and optional arguments, `params`,
  `out`/`ref` (and `out _`) on local methods, decimals that keep their
  scale (`9.00m` prints `9.00`), the argument exceptions' messages, and the
  compile errors the lessons teach (CS0161, CS0177, CS1620, CS1503, CS1737,
  CS1739, CS0128, CS0136, CS8421). 1,062 of 1,062 programs identical to
  .NET 10.
- **The inspector's status menu** (Not started · Started · Paused ·
  Completed) sits beside the confidence as in a subject, and follows the
  evidence by itself.

## Released 15 October 2026 — Code: the fourth study space (platform and unit 1)

- **A fourth subject:** Code sits beside CS, Maths and IT on the subject
  switch, the spine, search, Focus and Home (once started), with its Sky hue
  in every theme. One subject registry (`KOS.subjects`) replaces the
  hand-written lists.
- **Built from design turn 26:** the desk (Daily 20, Retrieval due, the
  stage path, strand bars), the curriculum map with tracks and deepening
  modules, lessons in Learn and Reference modes with runnable listings and
  an evidence inspector, the Practice tab, the task editor with every
  result state, retrieval, the skill map, settings, track pages and the
  phone (phone tasks at a reduced reward, "Best on a computer").
- **Runs on the device:** a C# interpreter in a sandboxed worker, held
  byte-for-byte to .NET 10 by `tools/cs_diff.mjs` (245 of 245 programs).
- **Unit 1 at full depth:** 8 lessons, 17 tasks and 9 retrieval cards.
- **Rewards:** a task pays once on its first proven pass; retrieval +4 XP,
  10 a day; grades derived, never self-reported.
- **Audit:** 0 overflowing elements, 0 cut text over the Code pages at five
  widths in Graphite and Dawn; 75/75 suites.
- **Next:** units 2 and 3 and capstone 1, one unit at a time.

## Released 13 October 2026 — Reports: months, terms, years and sync

- **Longer periods:** a month is saved on the 1st, a term the morning after
  its last school week, a year on 1 September. They add mastery by unit,
  results with the IT units still to sit, the plan against class from the
  braid, weakest and strongest topics, Focus habits, and for the year seven
  chapters (Study month by month, Results, Focus, the plan, Collection,
  Records, Milestones) with a sticky chapter chip. Totals roll up from the
  saved weeks or months when the session history no longer reaches back.
- **Stories:** monthly, termly and yearly lists with the ranked bars, flow,
  compare and three-card layouts.
- **Sync:** signed in, saved reports and snapshots replicate through
  `kos_reports`, converging on the facts saved first and the words changed
  last.
- **Audit:** every report page at 1920/1440/820/390/360 in Graphite and
  Dawn: 0 overflowing elements, 0 cut text.

## Released 12 October 2026 — Reports (weekly)

- **History, collected from now on:** every media row keeps a capped
  activity journal (synced with it); AniList adds tags, country and episode
  length, VNDB the original language; each session entry records its award;
  the Assistant keeps a daily tally (counts only); the state at each week and
  month boundary is snapshotted in the new `kurenai-os-reports` store.
- **Weekly reports:** saved on the first open after Monday 07:00 and never
  recomputed; weeks since 1 September are rebuilt from history and marked.
  The README's zero, evidence and comparison rules are applied when the
  facts are built.
- **Pages:** the Reports page (24a), one week (25a) and its three full
  overviews (25b–25d), low-data day tiles, phone layouts; the `reports` bell
  kind, a Home card, a link on Study hours and a search entry.
- **Words and story:** template words, or Kurenai's from totals only (one
  request, cancellable, falling back in place); the story player with the
  weekly story's layouts; the 1080 × 1350 gold share card and PNG/PDF/text/
  CSV export, Collection titles off by default.
- Months, terms, years and sync followed on 13 October (above).

## 9 October 2026 — flashcard clean-up and merged CS leaves

- **Flashcards:** 4,969 → 4,468. 501 duplicate and paraphrase twins removed
  (CS −379, Maths −121, IT −1) and 64 cards that leaned on a neighbouring
  card or a past-paper diagram rewritten to stand alone. A card whose
  position moved carries its original position as an optional third element
  so no SM-2 schedule slides onto another card (invariant 87).
- **Computer Science leaves:** twelve groups of tiny sub-points are one leaf
  each (157 → 131; `CS_MERGES` in `tools/gen_data.py`, content in
  `js/data/content/cs-m-*.js`, old refs renamed by `REF_ALIASES`). Each
  merged leaf has one overview, one page per concept, one worked-examples
  page, one toolkit and one past-paper page, with de-duplicated practice.
  Left unmerged by choice: Big-O comparison, Sound and MIDI, range/precision/
  normalisation, all of 4.9, all of 4.12 and the searching algorithms.

## Released 2 October 2026 — Computer Science at full depth

Roadmap Phase 4, Computer Science. Built on `feat/cs-p2-depth` and
`feat/cs-p1-nea`, merged to `main` as `87ee60c` and deployed (immutable
https://bfb13afc.kurenai-os.pages.dev, service worker `kos-cs-depth-1`).

- **Paper 2 (4.5–4.13):** 88 leaves in `js/data/content/cs-p2-*.js` — 419
  pages, 653 worked examples, 600 exam items derived from them. Every way
  AQA examined each topic (June 2017–2025) is worked in the mark scheme's
  own format; answers were checked by program (an AQA assembly
  interpreter, SQLite, Python mirrors of the functional code).
- **Paper 1 (4.1–4.4):** 63 leaves in `js/data/content/cs-p1-*.js` — 311
  pages, 312 worked examples, 226 exam items, 100 C# listings, every one
  compiled and run under .NET 10 with the papers' own test data. Where a
  paper's figure could not be reproduced, the state diagram is redrawn so
  the mark scheme's labels and answers hold, and the caption says so.
  Three leaves AQA has never examined on their own (4.4.1.5, 4.4.1.6,
  4.4.4.1) are taught with variations and say so.
- **The NEA:** NEA.0–NEA.5 follow the AQA criteria as project guides (the
  level ladder, what to include, how the exemplar did it, C# templates, a
  hand-in checklist) with no exam items, plus two free labs in a new "NEA
  project" area: an objective checker and a mark estimator.
- Every pre-rewrite CS content file is retired (`cs-programming`,
  `cs-databases-sys`, `cs-datastructures`, `cs-algorithms(-2)`, `cs-theory`,
  `cs-theory-computation(-2)`, `cs-advanced`, `cs-architecture`,
  `cs-networking-ethics`); their labs stay wired. CS notes carry no bare
  paragraphs (`tools/validate_content.js` is clean for `cs-*`).
- **UI review fixes (`8daa00f`):** a drawn search icon; Home's exam goal
  counts only revision for that exam; Home's lessons grouped per class row
  ("Done", not "Sat"); the seasonal anime controls laid out for phones;
  tap-to-copy on touch screens.
- smoke43 now picks a topic with three or more pages; smoke56 records the
  seeded due-card figures (203 → 210) that follow Paper 1's flashcards.
- Smoke gate 66/66.

## Released 1 October 2026 — Mechanics at full depth

Roadmap Phase 4, Mechanics half. Merged to `main` as `9eac539` and deployed
(immutable https://32db7dba.kurenai-os.pages.dev, service worker
`kos-mech-notes-1`).

- The 13 Mechanics leaves are paged notes in `js/data/content/maths-mech-m7.js`
  (M6.1 units and modelling, M7.1–M7.5 kinematics), `maths-mech-m8.js`
  (M8.1–M8.6 forces and Newton's laws) and `maths-mech-m9.js` (M9.1
  moments), built like Pure and Statistics: overview, concept pages, worked
  examples for every Mechanics question in the Topic Practice packs (AS
  Paper 2 and A-level Paper 3, Specimen to June 2025) with M1/A1/B1 marks,
  diagrams drawn from the numbers (velocity-time graphs, projectile paths,
  force diagrams on floors and slopes, pulleys, ladders and hinged beams),
  an exam toolkit, flashcards and quizzes; 91 exam items derived from the
  worked cards. Every number was recomputed (sympy).
- `maths-applied.js` is retired: Mechanics no longer has an outline file.
  smoke50 checks both banks load after their notes; smoke63 checks every
  Statistics and Mechanics leaf.
- Smoke gate 64/64.

## Released 1 October 2026 — Statistics at full depth

Roadmap Phase 4, Statistics half. Merged to `main` as `fdc954a` and deployed
(immutable https://2022f878.kurenai-os.pages.dev, service worker
`kos-stats-notes-1`). Mechanics M6–M9 at depth is next.

- The 14 Statistics leaves are paged notes in `js/data/content/maths-stats-s1.js`
  … `s5.js`, built like Pure: overview, concept pages, worked examples
  modelled on every Edexcel question shape in the Topic Practice packs (AS
  Paper 2 and A-level Paper 3, Specimen to June 2025) with M1/A1/B1 marks,
  diagrams drawn from the numbers (histograms, box plots, Venn and tree
  diagrams, binomial critical regions, Normal curves), an exam toolkit,
  flashcards and quizzes; 125 exam items derived from the worked cards.
  Every number was recomputed with scipy. `maths-applied.js` now holds
  Mechanics only.
- Mechanics refs are **M6–M9** (were S6–S9): Edexcel's Paper 3 section
  numbers kept, the letter fixed. `tools/gen_data.py --mech-refs` renamed
  the checked-in tree; content, labs, intel and the plan seed follow; the
  lab index's Statistics/Mechanics split no longer files 6.1 under
  Statistics. Stored state is renamed at the store's gate and attachments
  once per boot.
- Smoke gate 64/64 at release (smoke63 new; smoke64 from the Home/Pacing work).

## Released 27 September 2026 — the Graphite UI rebuild

The whole presentation layer rebuilt on the Graphite design handoff
(`docs/ui-rebuild/`): one `@layer` per stylesheet, `k-` classes and
`data-ui` hooks only, guarded by smoke55 (legacy vocabulary) and smoke56
(render purity and control parity). Review A and three passes of review B
followed on every surface — Pacing's per-lesson ticks and commit-graph
braid, the record editors as 11c drawers (a tab per book volume and per VN
chapter, quote logs for every medium), the Shrine podium and share card,
the Collection numbers, Seasonal's in-progress default and more; the
invariants each change touched (26, 26a, 37, 50a, 82, 85, 89, 92, 94, 98)
are rewritten in `CLAUDE.md`.

- Release `28ef508` (service worker `kos-graphite-1`), then `8ea878d`
  (`kos-graphite-2`, immutable https://406887be.kurenai-os.pages.dev):
  a navigation now serves the page shell cached with the worker's own
  version, so a deploy can no longer pair a new shell with the previous
  version's scripts (the half-styled "Update ready" page); the Home
  study-hours goal line is drawn on the bars' own scale with its label in
  its own column; Airing soon shows the next two episodes with their
  covers and one column of countdowns.
- The app icon (browser tab, installed app, phone home screen) is the
  header's bloom on the Graphite ground (`tools/gen_icons.mjs`), with the
  manifest's splash and theme colours on Graphite (`e2a5931`,
  `kos-graphite-3`, immutable https://12e5c6df.kurenai-os.pages.dev).
- Graphite is the only theme; the phone composition runs on the new shell
  unrestyled. Tier C and the deferred extras are in
  [docs/ROADMAP.md](docs/ROADMAP.md).

## Earlier on `main`

**Collection — VN progress by routes, chapters, hours or a percentage; the
VNDB write relay; half-full bars for series still releasing.** Deployed
20 September 2026 (`79e7c1b`); `vndb-ulist` deployed to Supabase.

- A VN's progress is derived from ONE source, chosen in the editor's
  "What counts" (`progressMode`) or picked automatically from what the
  entry carries: routes cleared, then chapters/parts completed, then
  hours played against VNDB's length estimate (`playtimeHours` vs
  `extra.lengthMinutes`, or the 1–5 length bucket as a rough figure),
  then a percentage the user sets (`progressPercent`). A kinetic novel
  counts by chapters and gets "+1 ch" on its card (the last chapter
  completes it); a first playthrough of an unstructured title logs hours
  and gets "+1 hr"; the percentage is the last resort. The derived
  `progress` carries its `unit` and an `estimate` flag; the shared
  `progressText` prints "2 / 4 ch", "12 / ~40 hr" and "40%". The source
  survives a VNDB pull, folds through `mergeRows`/`foldLocal` and counts
  as local data.
- VNDB still refuses `PATCH` from browsers (re-verified 20 September
  2026), so the write goes through a new `vndb-ulist` Edge Function
  (JWT-verified; the user's own token rides the one request and is never
  stored) whenever the user is signed in to cloud sync. `KOS.cloud.invoke`
  is the shared Edge Function call (ex `gameapi`). Signed out, the direct
  PATCH is still tried and its failure names the sign-in that fixes it.
  The token needs "modify my list" on vndb.org; Sync & Import says which
  it has.
- `KOS.media.progressFill/progressBar`: a known total is the honest
  fraction; a series still releasing (progress made, no total) is a
  half-full bar whose fill fades out and whose title says why; nothing
  started is no bar. Anime cards, the Books dual bar and compare panel,
  VN cards, the vault hero and the Overview "now" cards all read it.
- Follow-up (same day): AniList-owned custom lists now MIRROR — `syncList`
  reports every AniList list name and the merge lets AniList give and take
  membership in those, while app-only lists still union. The Books card bar
  is the shared `.med-track` fill (it was a 3px line in the unlifted accent,
  near-black on the card gradient) and every card fill lifts the accent
  toward white. The VN card no longer prints the quote count.
- Follow-up: a Books row read by the VOLUME (light novels — no chapter
  count, volumes read) now fills the bar against the series' volume count,
  or half-full/open without one; the Books card appends the identical
  shared `progressBar` at the same 4px as Anime and VN (the owned-vs-read
  comparison stays in the editor).
- `smoke54` covers the layer; gate 54/54.

**Pure Mathematics P1–P10 rewritten to full A-level depth, with diagrams
and self-marking past-paper practice.** Deployed 20 September 2026
(`e9c6350`).

- Every Pure sub-topic (1.1 through 10.5) is now paged notes in
  `js/data/content/maths-pure-p1.js` … `maths-pure-p10.js`: overview,
  concept pages in the specification's order, worked examples modelled on
  the Edexcel papers with M1/A1/B1 pills and a note on why each mark is
  earned or lost, fx-991CW routes, and an exam-toolkit page (command
  words, misconceptions, mnemonics). Prose is short lines and lists. The
  outline entries in `maths-pure.js` are gone; the file is deleted.
- `js/core/figures.js` renders declarative SVG diagrams from theme tokens
  (graphs with π axes, shaded areas, cobweb/staircase paths, triangles,
  vectors, trapezium strips) in notes and inside worked steps.
- `js/core/content.js` renders the worked-example card and derives each
  section's exam items from its exam-tagged cards
  (`KOS.content.examFromWorked`), so a question is authored once; the
  4.1 bank was re-verified against the real papers and two bank-a items
  corrected. Statistics and Mechanics were unchanged then; Statistics
  followed on 1 October 2026 (below), Mechanics (now M6–M9) is next.
- Service-worker `kos-pure-notes-1`; smoke gate 53/53.

**Pacing — my rows are ticked off, the unticked carry over, and the plan
links out.** Deployed 19 September 2026 (`bf28dbe`, `37ed66d`).

- A personal plan row carries a tick (`done`/`doneAt`, zero Governor
  traffic). An unticked row whose week has ended carries into every later
  week — derived, never moved — in a "Carried over · N behind" band with its
  origin week and how many weeks late, a "→ here" action to reschedule it,
  and a marker on the term ribbon. The week sub-line counts ticks and
  carry-overs.
- Links: class mocks, assessments and NEA milestones stand in the Countdown
  rail (Home, subject desks, the next-action ladder) dated by their week;
  Home carries a tickable "This week's plan" card that leads with what is
  behind and a "Behind on the plan" next action; the week page lists
  assignments due inside the week under each subject; a row's dialog offers
  the tick and "Remind me by the week's end" (a real reminder, tagged
  `pacing`); the week rolling over with work left is one notification.
- A class row now lists the week's lessons one per line (`lessonsOf` splits
  the scheme of work's own semicolon list; assessments and NEA items are
  toned) instead of one run-on line. Invariants 82/82a/82b; smoke49 §H;
  service-worker `kos-pacing-tick-2`.

**The notification centre, seasonal art of your own, the favicon.**
Deployed 19 September 2026 (`8dfe2d1`).

- `js/core/notify.js` is one ledger (`state.notify`) for everything the app
  used to only toast: fired calendar, reminder and assignment alerts (handed
  over by their own tickers, keyed by their once-only keys), an episode
  airing for a watched title (remembered from the airing cache and announced
  once it has aired), a Planner item reaching its release day. Housekeeping
  (sync, cloud) is deliberately not a notification. Read state syncs
  through the state document.
- `js/modules/notifications.js`: the bell in the global header with an
  unread badge and a five-row popover, and the full page under Archive with
  section filters, day groups, Mark all as read and the device-alert opt-in.
  Device alerts show as system notifications on a Mac or an installed phone
  app while Kurenai is open (no push server); `sw.js` opens what a tapped
  one is about.
- Seasonal lists every status of the season (watching first) — the overview
  schedule stays watching-only. The hero's scenery can be replaced with your
  own picture (upload or URL, positioned with the shared cropper, kept in
  media kv `hero.season.<SEASON>`), and the scrim now covers the art edge to
  edge. `icons/favicon.svg` gives the browser tab the 紅 seal.
  `smoke53` covers the layer; service-worker version `kos-notify-1`; gate
  53 suites.

**The Collection mirror — Anime and digital Books are 1:1 with AniList.**
Deployed 19 September 2026 (`b482f68`).

- Every AniList pull (Sync now and the autosync cycle) mirrors the list:
  `bulkUpsert` `replace.mirror` removes what AniList no longer carries (the
  "deleted on AniList but still here" ghosts), folds rows that share an
  AniList/MAL id into one, records tombstones, and refuses to act on an empty
  pull. The physical shelf and shelf-only hand-made books are untouched.
- The cross-device duplicate source is closed: the cloud media pull matches a
  remote row by provider identity when no local `syncId` matches, folds the
  two with a deterministic survivor and tombstones the loser; a one-time boot
  pass (`maint.dedupeAnilist`) folds what already accumulated.
- No manual add, metadata edit or Delete for Anime and mirrored Books: the
  record editor shows AniList's facts read-only and edits list state (pushed
  back) plus the personal layer. "Find new" creates on AniList first. The
  Books Digital lens lists AniList rows only; the Physical lens keeps its
  full CRUD and "+ Add to shelf".
- Titles are English-first (`KOS.anilist.pickTitle`), search matches either
  spelling; the vault card carries the score in the cover's top-left corner
  and a one-line status + "+1" hover row that no longer clips.
- Seasonal view lists in-progress titles only, under a credited scenery hero
  per season. The Collection overview is "what next?" only: an airing
  schedule grouped by day, on-the-go cards with their +1, the four vault
  doors; the figures and the status comparison moved to Analytics; the
  streak chips went; the Overview/Analytics switcher rides the page header.
  `smoke52` covers the layer; service-worker version
  `kos-collection-mirror-1`; gate 52 suites.

**Topic navigator — one control language, one status surface.** Deployed
18 September 2026 (`7e6d64f`).

- The topic page's material tabs, note-page pills and Edit pill were three
  competing systems. They are now one navigator: material tabs in a quiet
  inset tray with count chips; note pages as a direct Previous / named page /
  Next reader control (a `<select>`, so every page is one keystroke away with
  no wrap and no scroller); Edit as the one distinct utility action. The
  neighbour cards carry a directional accent edge instead of a card shadow.
- The header's status dot + dropdown duplicated the Inspector, which already
  owns status, progress checks and confidence. The Inspector is now the sole
  status surface. Service-worker version `kos-topic-nav-1`; gate 51 suites.

**The editable curriculum — every topic tab edits in place.** Deployed
17 September 2026 (`420388f`).

- `js/core/edits.js` forks a topic's material per kind (Specification, Notes,
  Flashcards, Quiz, Exam questions) into `state.edits`; readers take the
  effective material through `KOS.content.get()` and `KOS.srs.curriculumCards()`.
  Shipped files are never written; Reset to curriculum restores them exactly.
  Forked flashcards keep their SM-2 keys. Rows carry ids (deterministic for
  shipped rows) so the cloud merge folds two devices' forks of one topic.
- `js/modules/editor.js` is the study editor: an Edit control on the tab row
  opens it in the inspector's column (sticky beside the live page); block
  editor for Notes/Spec covering every renderer block type plus a new Markdown
  block and page breaks; row editors for cards, MCQs and multi-part exam items;
  formatting help; live re-render; per-device `ui.editing` survives redraws.
- `content.js` gains `{p}`/`{md}` blocks, a Markdown renderer (headings,
  fences, tables, lists, quotes, safe links) and math-safe inline markup.
- Study UI: the note-page stepper/disclosure is replaced by one numbered page
  strip in a declared scroller with chevrons; the article footer and the
  topic's previous/next are one shared card shape; the flashcard "Manage"
  panel is a clean deck browser with per-card history and hands off to the
  editor. Notes/Quiz/Exam tabs always exist with empty states that open the
  editor. `smoke51` covers the layer; service-worker version
  `kos-study-editor-2`; gate 51 suites.

**Cloud sync — devices merge instead of overwriting.** Deployed 17 September
2026 (`9bdec2f`).

- The state document was whole-document last-write-wins, then last-write-wins
  behind a guard that refused a stale push and asked which copy to keep. Both
  are gone. `js/core/cloudmerge.js` is a pure three-way merge against the last
  document this device and the cloud agreed on (`cloudsync.base.<uid>` kv):
  records by id with additions from both sides kept and deletions honoured,
  same-record edits combined field by field on `updatedAt`, gold/XP/HP additive
  against the base, owned cosmetics unioned, keyed maps per key. Per-device id
  collisions are detected and the local record re-keyed with its references
  rewritten.
- The push is a compare-and-set on `__seq` (`update … where state_json->>__seq
  = expected`); a lost race fetches, merges and retries. A pull onto a device
  with unsynced edits merges and pushes in the same cycle.
- First link never asks: an empty device adopts, an empty account receives, two
  histories merge with no base. The "Upload local data", "Keep this device" and
  "Use the cloud copy" dialogs and the `attention` chip state are removed.
- `focus.active` joined `state.ui` as per-device. A successful push broadcasts a
  data-free "changed" note on a Realtime channel (`kos-sync-<uid>`) so other
  open devices pull within seconds; timers stay the safety net.
- `smoke41` is now the merge suite (the 8 Aug 2026 incident stays as a
  regression test, expecting a merge with nothing lost); `smoke17`/`smoke48`
  fakes model the compare-and-set. Service-worker version `kos-cloud-merge-1`.

**Pacing — the integrated weekly timeline (Productivity → Pacing).**
Deployed 14 September 2026 (`6bd8e30`); the week page and braid were
redrawn in the Graphite rebuild (invariants 82 and 85 record the current
shape).

- The school scheme of work, both personal curriculums and IT F201 were imported
  once from Notion into `state.pacing` (191 rows across 16 weeks, plus the week
  hub's school/personal offset). Notion is not read again; the store is the
  source of truth and rides localStorage, the standard full backup and the cloud
  state document.
- 144 of the 146 personal-curriculum topics are linked to existing generated
  specification leaves. Two Computer Science rows are deliberately unlinked
  because AQA 7517 names neither as a topic of its own: *Bitwise manipulation &
  masks* and *Linked lists*.
- The page reads study progress through those links and writes none; it logs no
  session and performs no network request.
- Two readings, one route: **Week** (`#/pacing/YYYY-MM-DD`) is the term ribbon
  over one week in three subject columns; **Braid** (`#/pacing/braid`) is the
  same evidence as a commit graph — a class spine per subject, my planned weeks
  ticked beneath it, and one packed branch per specification point the two
  share. Every branch is repeated as a button, which is the accessible route.
- The plan is fully editable: weeks and rows can be created, edited and deleted,
  with a searchable specification picker, derived week numbers, week moves that
  take their rows with them, and a cascade delete that says what it would take.
- Also fixed here: the phone tab bar's **More** entry never had `align-items`,
  so its 余 glyph pinned left of its label while the other four centred.
- Shared header clean-up that came out of the same review:
  `KOS.ui.pageHeader({sub})` now emits the canonical `.dh-sub > span.board`
  (14px/`--muted`) instead of a bare `<p>` that inherited body type — which
  also brings Mangaka and Collection Overview into line; and Reminders and
  Habits no longer restate the Productivity section nav in their own headers,
  where it was the same three destinations twice, 60px apart.
- Gate at this point: **49 / 49 smoke suites**, plus the responsive matrix
  (208 cells across both Pacing tabs, zero findings) and the visual audit.

## Past-paper question banks and the labs expansion (September 2026)

- Every CS (AQA 7517) and Maths (Edexcel 9MA0) leaf gained a bank of exam
  items, quiz questions and flashcards re-written from the Topic Practice
  compilation of past papers — 17 `bank-*.js` files loaded through the new
  `KOS.content.extend`. Totals now: CS 2597 cards / 1734 quiz / 923 exam items
  (1074 parts); Maths 1553 cards / 1025 quiz / 565 exam items (918 parts).
  Most leaves also carry a "Past-paper patterns" notes page distilling the
  mark-scheme phrasing. IT is untouched.
- The exam engine renders multi-part items with a provenance line, lettered
  parts, tariff filter chips, shuffle, per-part reveal and mark buttons, and a
  single self-mark log per item; the MCQ engine offers "Retry the N missed".
- 27 new simulations (15 maths: trapezium rule, cobweb, Newton–Raphson,
  tangent/first principles, sectors, sequences, normal curve, binomial test,
  sampling, scatter/regression, projectiles, v–t graphs, vectors, inclined
  plane, moments beam; 12 CS: Turing machine, BNF checker, Big-O curves,
  BFS/DFS, floating-point bits, character codes, error checking, ADC sampling,
  bitmap lab, compression, ciphers, subnetting) and 23 new worked-example
  generators, all wired to their topic pages.
- The Simulations view is a categorised, searchable card grid with an open
  state (back, spec ref, open-topic link, siblings); the Worked Example Engine
  gained search, Enter-to-generate and topic links; lab canvases now take their
  ink from the theme (`KOS.labPalette`) instead of a fixed dark palette.
- The topic page's study-nav row is static rather than sticky.
- HP no longer suspends anything: labs, simulations and the gold shop stay
  open at any HP (gold unlocks unchanged). HP keeps its state label, drains,
  recovery checklist and the halved restore trickle while Critical.
- Gate: **50 / 50 smoke suites** (smoke50 covers the banks and labs).
  Deployed 14 September 2026 (`9f4ca59`).

## Delivered product

### Curriculum and study

- 355 generated leaf specification points: AQA 7517 Computer Science (151),
  Edexcel 9MA0 Mathematics (89) and OCR AAQ IT (115).
- Deep content for all Computer Science and Mathematics leaves plus IT F201:
  structured notes, flashcards, quizzes, exam questions, mark schemes and
  examiner guidance.
- Inline worked-example generators, simulations, trace labs and free-form
  sandboxes.
- A single specification spine, content-first topic pages, topic inspector,
  progress/RAG evidence, Review workspace, assignments, attachments and topic
  comparison.

### Organisation, focus and economy

- Canonical assignment, reminder and calendar records; recurrence, countdowns,
  day/week/month compositions and derived cross-surface chips.
- Focus setup, running/minimised states, persistence, Pomodoro/custom timing,
  assignment linkage and completion review.
- SM-2 card scheduling, the session ledger, study/rest streaks and the Governor's
  HP/gold/XP economy with anti-farming boundaries.

### Collection and profiles

- Shared IndexedDB schema and UI across Anime, Books, Visual Novels and Games.
- AniList/VNDB sync, narrowly scoped write-back, provider profiles and history,
  optional IGDB/Steam server integrations, custom lists and lazy vault rendering.
- Budget Planner, Collection Goals v2, Shrine Hall of Fame, shared analytics and
  non-destructive image positioning.

### Cloud, PWA and Assistant

- Optional Supabase replication for state, media, tombstones and attachment
  metadata/binaries, while local writes remain authoritative. The state
  document merges three-way across devices; media rows are per-entry.
- Installable PWA with safe update prompts, derived shell precache and strict API
  cache exclusions.
- Kurenai Assistant provider layer, constrained tools, orchestration,
  conversations/projects, explicit-consent memory, full-page/drawer surfaces,
  static character states, voice cues, Markdown and mathematics.

## Category 7 closure

| Phase | Outcome |
|---|---|
| A — audit | Established the visual, responsive, accessibility and interaction baseline. |
| B — foundations | Consolidated theme tokens, five breakpoints and shared UI primitives. |
| C — Study/Home | Rebuilt the subject desk, topic shell and priority-led Home surface. |
| D — Collection | Unified vault shells, rebuilt Mangaka and refined Collection Overview. |
| E — responsive | Added canonical mobile search/navigation, compact sheets, calendar composition and Focus fixes. |
| F — accessibility | Added browser-owned hash routing, announcements, semantic interaction, search domains and target refinements. |
| E+F integration | Reconciled search lifecycle, focus restoration, mobile readiness and test numbering. |
| G — release quality | Closed theme/elevation/chart/empty-state inconsistencies and completed deployment verification. |

### Durable Category 7 contracts

- Five CSS breakpoints only: 1240, 1080, 860, 700 and 560 pixels.
- `KOS.ui.openDialog()` is the only modal insertion route; shared tabs, empty
  states, stat tiles, scrollers and headers use `KOS.ui` primitives.
- Browser history is the navigation history. Hash routes preserve `file://` and
  static-host compatibility; redraws never become navigations.
- `KOS.a11y.announce()` is the only live-region route; visible toast output is not
  announced a second time.
- Compact presentation moves and restores canonical controls rather than cloning
  routing, search, filters or data logic.
- Charts require enough evidence to be meaningful; zeros and meters are shown
  only when they communicate a decision-relevant fact.
- Shared elevation tokens are theme-derived and must preserve equivalent hierarchy
  in Dawn and Dusk.

Full engineering detail is in `CLAUDE.md` invariants 47–79.

## Release verification

### Automated gates

- The Category 7 release passed all 47 jsdom smoke suites; the gate is now 99 (see Current state).
- Pre-deployment responsive matrix: **1,192 cells**, zero overflow, amputated text
  or tab-bar overlap.
- Breakpoint-edge matrix: **912 cells**, zero findings.
- Omitted-view matrix: **16 cells**, zero findings.
- Mobile/tablet device audit: **46 captures**, all valid.
- Production Dawn/Dusk responsive audit: **72 cells**, zero findings.
- Production specialised visual audit: **34 captures**, all passed.
- Deployment staging passed its secret, environment-template and Live2D/Cubism
  leak checks. `js/env.example.js` is explicitly excluded from runtime output.

### Live acceptance

The production alias and immutable deployment were verified to serve identical
HTML, CSS and service-worker assets. Browser history, deep links, mobile More and
search, search choice/cancellation, canonical filter sheets, dialog Escape/focus
restoration, Calendar phone/tablet compositions and Focus compact states were
exercised on the deployed build.

## Test suite inventory

The numbered suites form one release gate:

- `smoke.test.js`–`smoke3.test.js`: core study engines, content, Governor, Focus,
  calendar and daily work.
- `smoke4.test.js`–`smoke17.test.js`: Collection schema, vaults, sync, planner,
  goals, shrine and image positioning.
- `smoke18.test.js`–`smoke20.test.js`: PWA/deployment, cloud replication and
  server-backed integrations.
- `smoke21.test.js`–`smoke28.test.js`: Assistant providers, tools,
  orchestration, memory, surfaces and live-integration contracts.
- `smoke29.test.js`–`smoke41.test.js`: Governor refinement, reminders,
  assignments, Focus, Calendar, shared media, static/Live2D character contracts
  and the cloud three-way merge (smoke41).
- `smoke42.test.js`–`smoke47.test.js`: Category 7 shared foundations, Study,
  Collection, accessibility/routing, responsive integration and Phase G release
  consistency.
- `smoke48.test.js`–`smoke51.test.js`: free-tier egress, the later Pacing and
  labs/bank work, and the editable curriculum / study editor.
- `smoke52.test.js`: the Collection AniList mirror — mirror pulls, duplicate
  folding, the cloud identity match, English titles and the UI contracts.
- `smoke53.test.js`: the notification centre — the ledger, every source, the
  bell and the page, device alerts, the favicon and the seasonal user art.
- `smoke54.test.js`: VN progress sources, the VNDB write relay and the
  open-ended progress bar.
- `smoke55.test.js`: the Graphite rebuild's presentation guard — no legacy
  class, `k-` classes only, no `[data-ui]` selector, colour literals only in
  tokens/themes, raw px only in `tokens.css`, the five tiers, the layer order.
- `smoke56.test.js`: render purity (a view never writes state while it
  draws) and control parity against `tools/baselines/render-purity.json`.
- `smoke57.test.js`–`smoke62.test.js`: the Phase 1 backend — the topic
  picker's spec index, IT units, the quick note and drag order, the Shrine
  order, the Focus modes and the OOP IDE.
- `smoke63.test.js`: Statistics S1–S5 at depth (every leaf paged, worked,
  marked and examined) and the Mechanics rename S6–S9 → M6–M9 — the
  generated tree, the labs, the plan seed, and the stored-state migration
  at boot, on import/pull, and for attachments.

- `smoke64.test.js`–`smoke99.test.js`: CS depth, Reports (68–72), Code
  (73–79, 99), Money and Goals (84–87), FSRS (88, 96), the Exams hub
  (89–94), Focus switching (95), the closed-app runner (97), the GitHub App
  (98) and Japanese (80–83). Each suite's header says what it holds.

Run all suites with:

```sh
for i in "" {2..99}; do node "tools/smoke${i}.test.js"; done
```

## Remaining work and external gates

Everything still to build or deliberately deferred — Tier C, the design
work waiting on Claude Design (phone, Dawn and the shop themes, the labs),
the Statistics/Mechanics notes, the IT unit grades and the M14 clean-up —
is ordered in [docs/ROADMAP.md](docs/ROADMAP.md) (as of 24 October 2026: the
rest of Japanese Stage 1, the Exams Companion paper by paper, the iPad and
Pencil, Creatives, and Code's remaining tracks). External gates that no
code change resolves:

- Live2D remains development-only. No Cubism runtime/model is deployable until
  the licensing question in `LICENSE_REQUEST.md` is resolved in writing and the
  manually drawn rig is complete.
- Real provider accounts, cloud projects, Supabase secrets and API credentials
  are operator-owned. Never commit them; use local environment files and platform
  secret stores.
- Any future custom domain, provider-policy change or commercial use requires a
  fresh operational/licensing review.

## Milestone summary

| Milestone | What it established |
|---|---|
| Builds 1–2 | Specification/content system, engines, labs, Governor, Focus and tracking. |
| Build 3 | Collection Matrix, provider sync/write-back, planner, goals and shrine. |
| Builds 4–5 | Cloud/PWA/server integrations and the Atelier visual/image foundation. |
| Category 6 | Kurenai Assistant, provider/tool/orchestrator layers and polished surfaces. |
| Builds 6.2–6.6 | Reminders, files, assignments, Focus and Calendar end-to-end workflows. |
| Category 7 | Complete responsive, accessible, visually consistent UI/UX release. |
| Sept 2026 | Pacing, past-paper banks, the editable curriculum, three-way cloud merge, the AniList mirror, notifications, Pure maths at full depth. |
| Graphite | The presentation layer rebuilt from the Graphite design handoff, guarded by smoke55/56. |
| Oct 2026 | Reports, Code (core path and Tracks T1–T2), Money and Goals, FSRS, the Exams hub, the closed-app runner, the iPad layout, Japanese (platform, Stage 0, units F1–F2). |

Historical implementation detail remains recoverable from Git history and the
Category 7 audit (`KURENAIOS_FULL_UI_UX_AUDIT.md`); it is intentionally not
duplicated here.
