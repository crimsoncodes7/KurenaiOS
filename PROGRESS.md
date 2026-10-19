# KurenaiOS delivery status

This file is the current delivery snapshot, not a turn-by-turn work diary. The
previous 4,000-line chronological record was consolidated on 9 August 2026; durable
architecture and safety rules remain in `CLAUDE.md` and `AGENTS.md`.

## Current state

**Category 7 Phases A–G is complete, integrated, deployed and
production-verified. The cloud three-way merge and the editable curriculum /
study editor are deployed on top of it (17 September 2026); the Collection
AniList mirror and the notification centre followed on 19 September 2026
(`b482f68`, `8dfe2d1`). The Graphite UI rebuild replaced the whole
presentation layer on 27 September 2026 (`28ef508`, fixes `8ea878d`).**

| Item | Current value |
|---|---|
| Production | https://kurenai-os.pages.dev |
| Category 7 release checkpoint | `f81f2962dacfa07431355234737c8fbaa4070b7f` |
| Runtime release commit | `ff7a8e3` (Code capstone 3: a shop with plugins and LINQ reports — stage 3 complete), immutable https://6c888d02.kurenai-os.pages.dev — deployed 17 October 2026; before it `2fe14b4` (Code units 8 and 9: interfaces and inheritance, LINQ and generics, on the full runtime), immutable https://549e4efa.kurenai-os.pages.dev — deployed 17 October 2026; before it `04be041` (Code unit 7: classes and objects, on the full runtime), immutable https://2b2c8f4d.kurenai-os.pages.dev — deployed 17 October 2026; before it `19f1c27` (Code in Reports and the Assistant), immutable https://dd88bfe1.kurenai-os.pages.dev — deployed 17 October 2026; before it `4ec25bc` (katas, Code → GitHub v1, "Coming later" for units 7–12, Home's desks in one row), immutable https://d5ae99db.kurenai-os.pages.dev — deployed 16 October 2026; before it `0a4b471` (Code in Focus and the pickers, the spread stage path, Study until laid out), immutable https://685eec63.kurenai-os.pages.dev — deployed 16 October 2026; before it `aa19532` (Pacing under Study, the folding skill map, Code progress from covered lessons), immutable https://3df72dfb.kurenai-os.pages.dev — deployed 16 October 2026; before it `b4b4a25` (Code Bridge B, the Rider workflow, binary files and the full C# runtime), immutable https://59471e17.kurenai-os.pages.dev — deployed 16 October 2026; before it `efaf9b1` (Code capstone 2 and the topic gaps), immutable https://ef5cbf9d.kurenai-os.pages.dev — deployed 16 October 2026; before it `d2477d1` (Code unit 6: files, exceptions and debugging), immutable https://9d7e3d9b.kurenai-os.pages.dev — deployed 16 October 2026; before it `0a35674` (Code unit 5: text), immutable https://7a5ea20f.kurenai-os.pages.dev — deployed 16 October 2026; before it `b33d2ab` (Code unit 4: collections), immutable https://baee7dfc.kurenai-os.pages.dev — deployed 16 October 2026; before it `1b6d4de` (capstone review: the brief & build workspace, the study quiz, full-width steps), immutable https://243503b2.kurenai-os.pages.dev — deployed 16 October 2026; before it `6be96f1` (Code capstone 1: the capstone checkpoint and the text adventure engine), immutable https://d66c19bc.kurenai-os.pages.dev — deployed 16 October 2026; before it `ad8fce8` (Code unit 3: methods and scope; the inspector's status menu), immutable https://e89ae424.kurenai-os.pages.dev — deployed 15 October 2026; before it `4b74156` (Code unit 2: decisions and loops; tidier note pages; the Topic status component in the inspector), immutable https://e30bd0f2.kurenai-os.pages.dev — deployed 15 October 2026; before it `9e2a3b7` (Code review fixes: the path in the hero, no strand letters, the map reflowed, the inspector's reading count), immutable https://f239971c.kurenai-os.pages.dev — deployed 15 October 2026; before it `d8f90be` (Code: the fourth study space, platform and unit 1), immutable https://792e267a.kurenai-os.pages.dev — deployed 15 October 2026; before it `406cf55` (the Reports pages rebuilt to the design, the Home card in the middle row), immutable https://fea75f93.kurenai-os.pages.dev — deployed 13 October 2026; before it `345273e` (Reports phases 6–7: months, terms, years, replication), immutable https://8913f1e2.kurenai-os.pages.dev — deployed 13 October 2026; before it `fb2cb60` (Reports, roadmap 5.1 phases 1–5), immutable https://ecbddb95.kurenai-os.pages.dev — deployed 12 October 2026; before that `55c19b2` (scheduled messages and the text labs), https://633db8f0.kurenai-os.pages.dev; before that `6442704` (flashcard clean-up and merged CS leaves, capped at about 30 cards each), immutable https://eaf09f62.kurenai-os.pages.dev — deployed 9 October 2026; before it `232769b` (personal plan re-laid out, class plan extended to Easter), https://26ba91af.kurenai-os.pages.dev; before that `87ee60c` (Computer Science at depth, with the UI review fixes), https://bfb13afc.kurenai-os.pages.dev; before that `9eac539` (Mechanics M6–M9 at depth), https://32db7dba.kurenai-os.pages.dev; before that `fdc954a` (Statistics S1–S5, Home/Pacing/picker), https://2022f878.kurenai-os.pages.dev |
| Phase G implementation | `a5cfe92831b88b047c32307ce32b7920c889dc25` |
| Release tags | `milestone/graphite-ui-rebuild` (latest), `milestone/category-7-ui-ux-overhaul` |
| Service-worker cache | `kos-code-18` |
| Smoke gate | 79 suites (smoke79: Code → GitHub against a fake GitHub); 78 suites (smoke77–78: the full C# runtime's wiring, Bridge B and the Rider workflow); 76 suites (smoke73–76: Code's runner and checker, pay and evidence, the content gate, capstones; plus `tools/cs_diff.mjs` against .NET); 72 at `406cf55` (smoke68–72: the Reports history, model, pages, longer periods and replication); 70 at `fb2cb60`; 67 at `55c19b2` (smoke67 guards the merged CS leaves); 66 suites at the Computer Science release (smoke65: CS Paper 2; smoke66: CS Paper 1 and the NEA); 64 at `9eac539` and `fdc954a`. smoke39 needs a working `git`/`node` toolchain on the host |
| Latest release date | 17 October 2026 (Code stage 3; Reports: 13 October; Computer Science: 2 October; Category 7: 9 August 2026) |
| Branch | `claude/roadmap-code-study-space` is the live line (all releases above are on it; `main` is 49 commits behind). Docs baseline commits mark each release. 12 commits after `ff7a8e3` were unpushed on 19 October 2026 |
| In flight | Japanese study space (roadmap 5.5): plan revision 3.1 ([japanese-plan.md](docs/japanese-plan.md)); the vertical slice in `prototypes/japanese-space/` is closed on real data (`03505a9`; voice bake-off `bc75349`). Nothing in the app changed; the platform release (plan §17) is next, when asked |
| Working across accounts | [docs/HANDOFF.md](docs/HANDOFF.md); shared memory in [docs/memory/](docs/memory/MEMORY.md) |
| Latest delivery | The Reports pages rebuilt to the design after review: the words in full on the Reports page and the headline in each report's story hero; design measures for cards, tiles, charts (drawn at their card's width) and the overviews; no dead space (rows close themselves, uneven cards in measured masonry columns, the shorter column rides along); Home's middle row as Study hours · the latest report · the week's plan under Up next · Today · Upcoming, the card staying full after reading; drawn, centred icons (story controls, Assistant and Habits plus buttons, the IDE tab close); the app frame no longer scrolls on a chapter jump; the phone story full screen. 72/72 suites, the responsive audit 0 findings over 108 cells; service worker `kos-reports-3`, deployed 13 October 2026. Before it, Reports completed (phases 6–7): monthly, termly and yearly reports (terms from the school weeks; the year as seven chapters), their stories, and a copy of every saved report and snapshot in the owner-only `kos_reports` table (migration applied); the responsive audit over every report page at five widths in Graphite and Dawn reports 0 findings; service worker `kos-reports-2`, deployed 13 October 2026. Before it, Reports (roadmap 5.1, phases 1–5 of [docs/reports-plan.md](docs/reports-plan.md)): the history reports need now collected (a media activity journal, AniList tags/country/length and VNDB language, awards on session entries, an Assistant tally, boundary snapshots), weekly reports saved each Monday 07:00 with a marked backfill since 1 September, the Reports page under Home with one week's dashboard and its Study, Focus and plan, and Collection overviews, Kurenai's words from totals only, the story player, the share card and export, the `reports` bell kind, a Home card and search; service worker `kos-reports-1`, deployed 12 October 2026. Before it, scheduled messages (the Assistant's Scheduled tab: a prompt sent at a time while the app is open, read-only, the reply as a notification), the eight text labs rebuilt on the lab system's text kind (BNF derivations, the SQL plan, LMC on the transport; the last lab canvas retired), and `gemini-3.6-flash` as the default with one retry on a busy provider; service worker `kos-schedule-1`, deployed 12 October 2026. Before it, the Assistant repaired: every online request had failed since late September (115 tools against `ai-chat`'s limit of 96; now 128, mirrored and ranked by the client), the retired `gemini-3.5-flash` replaced by `gemini-3.8-flash`, live model listing in Settings, the labs in its tools and feature map, and the no-change and Markdown follow-ups; `ai-chat` v5 and service worker `kos-assistant-2`, deployed 12 October 2026. Before it, the phone batch: notes tables wider than a phone in the shared scroller, the OOP IDE's phone layout, labs cropped to their drawing on a phone (floating point and subnetting with phone layouts) and the Trace Lab's structure column restored below 700px; the responsive audit at 390/360 reports 0 findings; service worker `kos-phone-1`, deployed 12 October 2026. Before it, every simulation rebuilt on the lab system (design part 2, frame 20): one SVG stage with the overflow rule, the transport and the readout, by archetype — diagrams, graph, plots, bits, machines and the three-column Trace Lab ([ROADMAP](docs/ROADMAP.md) 3.3); service worker `kos-labs-1`, deployed 12 October 2026. Before it, flashcard clean-up (4,969 → 4,468) and twelve groups of tiny Computer Science sub-points merged into one leaf each (157 → 131); service worker `kos-cs-merge-2`, deployed 9 October 2026. Before it, the weekly plan re-laid out: the personal CS and Maths plan from w/c 12 Oct and the class plan extended to Easter (Christmas, Feb half term and Easter are breaks); service worker `kos-plan-reflow-1`, deployed 7 October 2026. Before it, Computer Science at full depth — both AQA papers in C# and the NEA as a project companion — with the UI review fixes (below); service worker `kos-cs-depth-1`. Before it, Mechanics M6–M9 at full depth (below), completing Roadmap Phase 4 content; deployed 1 October 2026 (service worker `kos-mech-notes-1`). Before it, Statistics S1–S5 at full depth and the Mechanics M6–M9 rename (below), with the Home Focus ladder, class lesson dating, the paper-level topic picker and status tones; deployed 1 October 2026 (service worker `kos-stats-notes-1`). Before it, design part 2 (frames 15–23) built on the Phase 1 backend and the Phase 2 clean-up: phone views, Focus modes, the topic picker, the IT units panel, the OOP IDE, the lab system, Dawn and the 23 themes, cosmetics and the drag pattern. Merged to `main` and deployed on 28 September 2026 (service worker `kos-graphite-4`, immutable https://ade0184c.kurenai-os.pages.dev) ([ROADMAP](docs/ROADMAP.md) Phase 1 status) |
| Still to do | [docs/ROADMAP.md](docs/ROADMAP.md) |

Production deployment is separate from Git push and is performed only through
`tools/deploy_pages.sh`. The immutable Category 7 deployment is
https://bb17097f.kurenai-os.pages.dev.

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

- All 47 jsdom smoke suites passed after the final integration.
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

Run all suites with:

```sh
for i in "" {2..72}; do node "tools/smoke${i}.test.js"; done
```

## Remaining work and external gates

Everything still to build or deliberately deferred — Tier C, the design
work waiting on Claude Design (phone, Dawn and the shop themes, the labs),
the Statistics/Mechanics notes, the IT unit grades and the M14 clean-up —
is ordered in [docs/ROADMAP.md](docs/ROADMAP.md). External gates that no
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

Historical implementation detail remains recoverable from Git history and the
Category 7 audit (`KURENAIOS_FULL_UI_UX_AUDIT.md`); it is intentionally not
duplicated here.
