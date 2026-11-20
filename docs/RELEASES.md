# Release history

Moved out of `CLAUDE.md` on 17 November 2026 (W8, AP-20): that file is
loaded into every session, and this diary was most of its baseline. Newest
first. A new release adds its entry at the top of "Latest release" here and
changes only the two lines in `CLAUDE.md`'s Current baseline (the release and
the service-worker version). Git holds the rest.

- Category 7 A–G, the Graphite UI rebuild (review A and B), Reports and
  Code (platform, the whole core path — stages 1–4, Bridge B and four capstones; the whole of Tracks T1 and T2 with their capstones; units 7–9, 11 and 12 on the full runtime, unit 10 and capstone 4 in Rider) are integrated and deployed. What is still to do is kept in one place:
  [`docs/ROADMAP.md`](docs/ROADMAP.md).
- Production: https://kurenai-os.pages.dev
- Release source checkpoint: `f83148c` (Code, the fourth study space: the
  platform from design turn 26 and unit 1; on top of the Reports rebuild
  `5bece3e`). `ai-chat` is deployed as version 6 (images for Gemini, 26 October 2026); the
  `kos_reports` migration `20261012000001` is applied; so is `kos_money`
  (`20261019000001`, 19 October 2026), live since the Money and Goals release.
- Latest release: sw `kos-qol-2` (20 November 2026, `feat/qol-1a` into
  main; immutable IMMUTABLE_URL): the QoL review's 1C (the
  user's own requests) and Neon's batches 3 and 4. 1C: routines inside
  routines; Shift the plan by N weeks, the plan inside a lesson's calendar
  block, the Class days fix; folders for loose notes on Files; ink — Paste,
  the lasso across pages (and "Copy this part of the picture"), rich text
  and ruled tables, Copy as TeX checked by KaTeX, the colour menu ticking
  its pick; Code's live errors and suggestions as you type, from Roslyn in
  the full runtime (`csw-1.2`, `Runner.Assist`); the Collection's watch
  link and the title's own pages, shown as the service's icon (CC0 Simple
  Icons, a monogram, or your own picture). The Steam link's sign-in tab now
  comes back into the app (`steam-auth` answers with a 303 to
  `/?steam=<code>`; redeployed after the app as STEAM_VER). Neon's batches: a
  missed goal's Restart and Archive, the Money Year view's in and out,
  Creatives' thumbnails and loose ends, Practise again on a passed lesson,
  Tomorrow on an overdue reminder, the showcase put in order by dragging,
  a lesson's session back to its lesson and a checkpoint that asks before
  it is left, Undo on a deleted subtask. Boot: Settings' Storage and
  Connections, the Matrix, the notification feed and the IT desk load on
  first use (budget 7.77 MB). Gate 179.
- Before it: sw `kos-qol-1` (20 November 2026, `feat/qol-1a` into
  main; immutable https://1a3b6623.kurenai-os.pages.dev): the QoL review's batches 1A and 1B,
  with Neon's batches 1 and 2. 1A: Due today measured per subject and by
  time on a plan row; review counts from the review log; the Writing Desk
  draft kept on close; the toast queue with stacked Undo and ⌘Z; a cloud
  pull taken in place (no stale copies); random ids for assignments,
  reminders, lists, steps and events, the Assistant's tools taking either;
  one "what changed" report after a restore or a first link, with
  "Download a copy of this device first"; Money's typed entry matched to
  its statement row, and the Bookkeeper counting distinct entries. 1B: F201
  practice papers 2 and 3; Maths' seven thin Pure leaves deepened; CS's
  thin leaves and quiz top-ups; the flashcard pass with its checker
  (`tools/card_lint.mjs`); one shape for exam source labels; worked totals,
  tariff counts and "Q5 of 17". Boot: the sample account, Creatives' pages
  and Data load on first use (budget 7.78 MB). The server-function
  clean-ups (EF-01 to EF-08) were deployed the same day: `ai-chat` v13,
  `runner` v11, `github-token` v7, `ext-token` v3, `vndb-ulist` v6,
  `steam-auth` v8, `steam-owned-games` v7, `igdb-search` v7. Gate 179
  (180–197).
- Before it: sw `kos-integrity-23` (19 November 2026,
  `feat/w1w7-rest` into main; immutable https://62721e6a.kurenai-os.pages.dev;
  the `runner` Edge Function deployed as version 10 the same day): the rest
  of the quality audit's W1 (a restore replaces handwriting and files, one
  file size, Storage measures every database) and every W7 finding with no
  design — Goals judge only what happened while they existed; search finds
  pages, Code, Creatives and the Wall and ranks titles first; Home, Reports
  and the Wall (heat grid hours, one time classifier, no empty reports,
  sessions' own awards, earned/complete badges); the study spaces' fixes
  (Code, Creatives, Japanese, Mind, the study pages); Collection, Money and
  Productivity (the Books rail by lens, Hide amounts everywhere, an
  unchanged re-import, Money's In and This view, Today holds overdue
  reminders, kept-late routines, a notice opens its record); then the
  spaces join the OS — Japanese and Mind in Reports and Goals, a
  Creatives-project goal, each space's day and Money's next bill in the day
  model and on Home, the Assistant's Japanese tools — and Study hours counts
  study only. Boot went down: the routine player, the report share card and
  Card stats load on first use (budget 7.89 MB). Gate 177 (180–195).
- Before it: sw `kos-exams-4` (18 November 2026, `feat/exams-audit`
  into main): the Exams & Papers audit (docs/exams-audit-2026-11-18.md) —
  papers on A4 sheets the same on screen and in print (questions flowing,
  answer lines carried over, a footer on every page, white paper), Print
  as the paper, the paper and its scheme, or the scheme, never the app;
  OCR's F201 SAM in the past-paper index, OCR file names matched (the
  annotated SAM as its scheme); past papers in each exam's Papers section
  with Sit, Print, Scheme and Log marks, and a PDF attached to an exam
  usable as a past paper; one paper count; Log a result's grade as the
  subject's scale, a plain prediction line, and results for topic and
  retrieval tests; attempts edited and deleted (with Undo) from Review;
  Edit, Archive and Delete on every exam and an Archived list; the viewer
  finding OCR's questions and asking "Which page is…?" for any it cannot,
  remembered per paper; Exams settings, Results, Load and Today tidied;
  the hub's Library tab named Practice. With W8: readiness, the boot's
  exam pass and badge measuring computed once per change (smoke186),
  hub.js split by surface (AP-09), and nine page bundles on first use
  (boot 8.78 → 7.87 MB). Gate 169.
  Before it sw `kos-exams-3` (18 November 2026, main): Maths' mark
  codes (CM-15: DM1, dA1, dB1, M1d, M1dd and A1ft read by the tally, the
  Companion and exam questions; a worked answer's Answer line no longer
  read as marks); every assessment tier right on the new exam pages (a
  retrieval quiz's five sections and quiz card, a topic test without
  timed-practice cells, the assessment's Files, Notes and preparation
  checklist back); the old Readiness, Season and Companion guide pages
  removed; the assessment editor's required fields marked, each paper
  named once, IT graded Distinction, Merit or Pass; W8's SH-31, SH-42,
  EX-16 (Files' Show more) and AP-11's Habits CSS.
  Before it sw `kos-exams-2` (18 November 2026, `feat/exams-rework`
  fast-forwarded into main): Exams & Papers reworked around one exam, from
  design turns 45–47 — All exams; an exam's eight sections (Today, Plan,
  Topics, Revise, Questions, Papers, Review, On the day) with an iPad strip
  and sheet and a phone list; scope from a pasted list; Revise's paged
  chapters and the timed card drill; Questions one at a time through the
  study engine; papers sat full screen with a pad under every part and
  marked beside the answer (levels by level); Review with the estimated
  grade, marks lost by topic, command word and objective, minutes per mark
  and pacing; Get and Add feedback (nothing sent, a reply validated before
  storing) and targets. Typical grade boundaries for AQA 7517 (AQA's June
  2025 and 2026 tables) and Edexcel 9MA0 (Pearson's June 2026 document),
  AO1–AO3 for both in Exam essentials. The engine and pages load on first
  use (`exams-pages`); smoke185, invariant 130b.
  Before it sw `kos-integrity-22` (18 November 2026,
  `release/integrity-22`: `feat/exams-fixes`, `feat/exams-p1-guide` and
  `feat/exams-sync` merged into main): the exam fixes with no design
  (CC-25 one point a mark, dM/ddM read everywhere, CM-21, EX-29, EX-40
  start-by in days with "Start now", EX-47 "needs:", EX-42 the reload
  notice), Exam essentials for each December mock first in the guide
  (`js/data/exam-essentials.js`), CS Paper 1's partial full Companion for
  the PPE's seven topics with guides that read several papers
  (`KOS.examDeep.papersFor`), and recorded attempts replicating to
  `kos_attempts` (migration `20261118000001`, applied); smoke183, 184.
  Before it sw `kos-integrity-21` (18 November 2026,
  `release/integrity-21`: `feat/exams-engine` and `feat/exam-cap-ink`
  merged into main): the headless half of the Exams & Papers rework
  (`docs/exams-rework-plan.md`) — recorded attempts (`KOS.attempts`,
  IndexedDB `kurenai-os-attempts`, invariant 130a: events per part, timing
  figures on the device), the review pack for Claude or Gemini and its
  tolerant JSON reader (`KOS.reviewPack`), the timed paper recording with
  EX-32 fixed; authored, board-faithful papers (invariant 127): OCR F201
  practice paper 1 on the SAM's blueprint (1 h 30, 60 marks; the F201
  preset is now 90 minutes), the CS pre-public exam paper 1 (2 h 30, 100
  marks) and the Maths Pure mock paper 1 (2 h, 100 marks), with their own
  presets; the run-up — no interval over a third of the days to a near
  exam (invariant 111a); ink travels with every downloaded or shared file
  (invariant 151); CLAUDE.md 46 KB with the invariants in
  `docs/invariants/`; the gate's tail batch; smoke180–182.
  Before it sw `kos-integrity-20` (17 November 2026): the welcome
  looks after DOMContentLoaded, once `js/env.local.js` and the sync library
  (both `defer`) are in — on production its first look, made before them,
  read cloud sync as not configured and gave up, so it was never seen — and
  opens `persist`, so a page change never closes it; smoke164 H. Sw `kos-integrity-18` and `-19` the same day were the first
  two halves of that fix.
  Before it sw `kos-integrity-17` (17 November 2026,
  `release/integrity-17`: `fix/it-notes-flat`, `feat/w4-pages`,
  `feat/w2-held` and `feat/w7-first-open` (with `feat/w7-home`) merged into
  main): IT notes with no block inside a callout (a callout holds text,
  its table or list beside it, as in CS; the validator refuses the shape),
  W4's Money pages from design turn 39 (smoke161), held updates from turn
  36 (smoke162), Home reading every study space with the Wardrobe, Edit
  your seat at 1:1 and Focus minimised from turn 40 (smoke163), and the
  first open from turn 41 (smoke164); the boot budget 8.85 MB.
  Before it sw `kos-integrity-16` (17 November 2026, `fix/it-lazy-pages`,
  `feat/w1-di09` and `feat/w4-import` merged into main): the F201 notes
  draw on every page again (29 callouts had one block as their body, so 15
  pages threw and "Next page" stopped; the renderer now takes one block as
  that block and the validator refuses the shape; smoke160), a lesson no
  longer waits for another subject's download (lazy bundles run in their own
  order, preloaded together, and the warm-up steps aside while a page
  waits); the backup file written and read in pieces (DI-09, smoke150); and
  W4's import engine (MG-02…MG-08, MG-24; smoke149): Santander's exports
  read, merchants and learned payee rules, a statement's row as the
  recurring payment it pays, imports on record with Undo and Replace in the
  engine, the app's own export read back without loss — the Money pages
  from design turn 39 are still to come.
  Before it sw `kos-integrity-15` (16 November 2026): an exam
  question written in OCR's style says "OCR-style", never "modelled on" a
  paper that does not exist. Before it sw `kos-integrity-14` (16 November 2026,
  `feat/519-it-notes`, main fast-forwarded to it): roadmap 5.19 item 1 for
  F201 — all fifteen leaves of IT's Big data and machine learning rewritten
  from the OCR specification and its SAM (`it-f201a/b/c.js`, smoke156): paged
  notes, 34 figures, 92 OCR-style worked answers with a levels-of-response
  one per leaf, fill-in tables, quick-recall flashcards and quizzes with no
  length tell. F206 waits until January 2027.
  Before it sw `kos-integrity-13` (16 November 2026,
  `feat/519-review`, main fast-forwarded to it): roadmap 5.19 item 4 —
  quiz and exam questions on the review schedule, graded from their marks
  and capped per subject a day, beside cards and redo items on Due today;
  a quiz's history weakest first and an exam question's marks over time;
  an unmarked iPad attempt carried on; the subject desk's review strip;
  78 several-step Maths cards moved to exam questions with their schedules
  (invariants 111c and 132, smoke155) — and the IT desk in the shared
  order with its current unit beside the course units and no Resources
  card (26f). Roadmap 5.21, a flashcard quality pass, is on the backlog.
  Before it sw `kos-integrity-12` (16 November 2026, `feat/w2-lazy`
  and `feat/w1-rc6` merged into main): loading on first use (W2 AP-01
  stage 1, invariant 168, smoke142 — the notes, banks, past-paper index,
  Companions and Code's lessons load when a page first needs them: 8.4 MB
  of 17.0 MB at boot; splitting the page modules, stage 2, is left for
  later) and W1's RC6, Todoist and Google bookkeeping (invariants 33a,
  157, 158, 160; smoke143): the account's document taken in before a
  provider is read and sent before the lease is given up, a twin linked
  one to one and never imported, two reminders on one task folded after a
  verified checkpoint with every field kept, a full read that only adds,
  a repeat Todoist owns closed there with its date read back, every
  stored id re-keyed, "not found" unlinking, a different account clearing
  links, the list as a three-way field, a move out of a linked list only
  unlinking (the task is left in Todoist and never imported as a second
  reminder), refused commands named, a queued deletion skipped on import.
  Not yet tried against a live Todoist or Google account.
  Before it sw `kos-integrity-11` (16 November 2026,
  `feat/519-figures`, main fast-forwarded to it): roadmap 5.19 items 2–3
  and the rest of W5. Figures on the notes' worked examples and variations
  across Maths, CS and the CS Paper 2 Companion, and parts to fill in that
  the app marks — trace tables, tables to complete, SQL run on each
  question's own database, circuits, predict-then-Run C#, labs in the notes
  (invariant 89b, smoke153, `tools/fill_check.mjs`); IT units done at
  school archived and F201 the current unit (26f, smoke154); W5's Try on for
  every kind with the Stage as the fitting room, owned sheets, the
  Wardrobe's pictures, the repainted first sixteen cosmetics, a locked lab
  sold where it is, the Shrine card's finish, frame bleed kept clear, no
  seal in the header and the Assistant's dark emblem (smoke151 K–Q, 152).
  Before it sw `kos-integrity-10` (16 November 2026,
  `feat/w5-shop`, main fast-forwarded to it): W5's shop and cosmetics —
  every recolour theme retired and refunded once (`theme-refund`), Buy
  behind a confirm, the worn seal beside the brand mark and on the share
  card, the share card's Washi, Foil and Film finishes with a Finish row,
  pen sets that colour only the strokes written with them (a stroke's
  `ps`), painted frames sized by their measured openings with previews
  that never inherit the worn frame, the CSS frames retired, absolute
  shelf-skin URLs and the twelve avatars as discs (smoke151).
  Before it sw `kos-integrity-9` (16 November 2026,
  `feat/w6-content`, main fast-forwarded to it): W6's second batch —
  the Maths spec typeset from the Edexcel PDF (`tools/maths_spec.py`),
  quiz options with no length tell (`tools/quiz_bias.mjs`, smoke138 H),
  CS and Maths duplicates and misfiled items removed with every schedule
  key kept, explanations written out, honest generators, the tally with
  its scheme lines, exact predicted papers, stale forks named (CM-04),
  Japanese, Mind and Code fixes, and Seasonal's "N behind" (smoke148).
  Before it sw `kos-integrity-8` (16 November 2026,
  `feat/w2-opus`, main fast-forwarded to it): the Focus page owning a
  session's set-up (invariant 4e, smoke144: About to Study with no timer of
  its own); the Assistant's Undo on its action cards and a thread that opens
  at the newest message (smoke145); W2's smaller items with the iPhone's
  screen going off (smoke146); W1's remaining P2/P3s, Reports and pot
  pictures in the backup (smoke147).
  Before it sw `kos-integrity-7` (14 November 2026,
  `feat/w1-integrity`, main fast-forwarded to it): the quality programme's
  batch after RC5 — W2's redraw policy, change bus and view lifecycle
  (invariants 164–166, smoke139) and sessions in progress (167, smoke140);
  the side stores' sync status and pull overlap (36d, smoke141); RC4's store
  registry, Reset everything and checkpoints with Restore (smoke134); W7's
  honest numbers with GO-02 (Collection goals by their own period; the
  `goal-getter-whole-vault` repair takes back Goal getter tiers the old rule
  paid) and GO-23 (topic colours from evidence; smoke136); W3's floors
  (smoke137); W6's quiz shuffle and self-marking by mark codes (smoke138);
  Edit seat keeping other devices' choices and the afternoon review's flood.
  Before it sw `kos-integrity-6` (13 November 2026,
  `feat/w1-integrity`, main fast-forwarded to it): the quality programme's
  RC5 — two tabs and the state document's storage (invariant 33c), a cloud
  document landing in one step (33d), the profile pictures and mined
  Japanese lines out of the synced document (invariants 7, 115, 150; the
  picture move is an automatic repair after the first good sync), first
  sign-in keeping the device's data (34), the Todoist/Google lease and
  bookkeeping (157, 160), with the 26 findings of its review fixed
  (smoke133–135); record in [`docs/HANDOFF-W1-RC5.md`](docs/HANDOFF-W1-RC5.md).
  Before it sw `kos-integrity-5` (9 November 2026): rewards with
  receipts (RC21; smoke130–132) — the Daily goal sealed by evidence, Undo
  on ticks, routine top-ups, Mind checkpoints and Japanese lessons paying
  only on a pass, Creatives projects only with work attached. Before it sw
  `kos-integrity-4` (9 November 2026): the one-off
  saved-reports rebuild after DI-27 (a consent repair, not yet run), report
  and snapshot revisions that win the merge, and pinned repair checkpoints
  (smoke129). Before it sw `kos-integrity-3` (9 November 2026): three W1 fixes —
  streak-milestone gold pays once per run (HR-16, smoke128), an invalid IT
  mark writes nothing and clearing one asks first (ST-26, smoke58), and
  Focus's "General study — no link" stays unlinked through About to Study,
  whose "Just start" starts exactly the Focus page's choice (PR-03,
  smoke104). Before it sw `kos-integrity-2` (9 November 2026): the DI-27
  journal scrub also removes the flips that lasted days (any status or
  progress step to or from the anime's value, only among events before the
  fix), approved by the user after the live run. Before it sw
  `kos-integrity-1` (9 November 2026,
  `feat/w1-integrity`, on `feat/w0-safety-net`): the quality programme's
  W0 safety net and the first W1 pass — verified backups and safe repairs
  (`KOS.backup`, `KOS.repairs`), Import backup asking first, the P0s
  (JM-06, ST-25, MG-01/MG-23, SY-18), activity not any event (HR-31,
  CL-45), and the DI-27 clean-up as a consent repair, run once after the
  deploy on the reconciliation the user approved; smoke115–127. Before it
  sw `kos-malfix-1` (8 November 2026,
  `fix/mal-cross-module`): a HOTFIX from the quality audit (DI-27, UR-21) —
  `bulkUpsert` matches a provider id only within the row's own module
  (`sameModule` in js/core/mediadb.js; MAL numbers anime and manga
  separately, so MAL 21 is One Piece and the Death Note manga), and no merge
  across modules pays a reward; smoke114. It stops a manga row being flipped
  to an anime and back on every autosync, which paid a sync reward each
  cycle. Cleaning up the past entries is a separate decision. Before it sw `kos-redraw-1` (3 November 2026,
  `fix/background-redraw-stopgap`): a STOPGAP from the quality audit —
  background redraws (cloud pull, habit auto-tick, picture loads, the Daily
  Review closing) are held back on study/work pages until you navigate, and
  elsewhere while typing, a dialog is open or within 45 s of a touch; every
  redraw keeps the real scroller's position (`KOS.rerender({background})`
  in js/core/ui.js; findings SY-01…SY-08). To be replaced by the proper
  redraw policy. Before it sw `kos-artshop-1` (1 November 2026, `feat/art-shop`,
  main fast-forwarded to it) — https://87dad81e.kurenai-os.pages.dev: the
  art and shop audit (roadmap 5.13–5.14, design turn 34, docs/app-art.md):
  `KOS.art` (painted slots, Decorative art, the picture drawer with
  rotation and "Your own picture" unlocks, `js/modules/artslot.js`), Home's
  seasons, desks, Spotlights, the Focus scene, the Exam Room, Shrine halls,
  empty-state spots, page header bands, Exams and story covers; Kurenai's
  redesign on the Assistant (states, outfits, Hide, the phone portrait);
  the Gold Shop on the Stage with 116,700 gold of new items and Try on;
  Avatar & profile on the Stage with a Wardrobe; four themes; share-card
  finishes, notebook papers and pen sets; no migration or Edge Function.
  Before it sw `kos-achievements-2` (31 October 2026) —
  https://75433675.kurenai-os.pages.dev: the Finish a series goal editor's
  second "Title" field is "Linked title" (found by the visual audit, which
  runs clean end to end again). Before it sw `kos-achievements-1` (31 October 2026, `feat/art-review`,
  main fast-forwarded to it) — https://65c61e27.kurenai-os.pages.dev:
  Achievements, the Badge Wall (roadmap 5.16–5.17, design turn 35;
  invariants 161–163, smoke113): the engine and its 254-badge catalogue,
  the Wall (#/achievements) with every badge, panorama and set spot
  imported, the unlock overlay and ping, the Governor's Seat as the Stage
  with the five states and Edit your seat (#/governor/edit), the term/year
  story and the share card's showcase; with it the review of all 322 app
  images and prompt 18's four small passes; no migration or Edge Function.
  Before it sw `kos-creatives-1` (30 October 2026, `feat/creatives`,
  main fast-forwarded to it) — https://1e058d00.kurenai-os.pages.dev:
  Creatives, the sixth study space (roadmap 5.7 item 3, design turn 31;
  invariants 154–156, smoke108): Platform 1 — the desk, the lesson, the
  check, the Practice Log and Portfolio, projects, the Daily Creative, the
  Writing Desk with Writing units 1–3, Graphic design's six drills with
  Design units 1–2, the reference generator, Kurenai's critique on request,
  the Goals and Reports joins, the phone desk — and Art units 1–3 on the
  sketchbook with the user's 48 pictures; no migration or Edge Function.
  Before it sw `kos-connect-2` (30 October 2026, `1398282`) —
  https://dc66d2aa.kurenai-os.pages.dev: Todoist is sent the app's address
  without a trailing slash (its console refuses the bare domain with one).
  Before it sw `kos-connect-1` (30 October 2026, `feat/integrations`
  at `5adc978`, main fast-forwarded to it) — https://d47701df.kurenai-os.pages.dev:
  Google Calendar, Google Tasks and Todoist (roadmap 5.15,
  docs/integrations-plan.md; invariants 157–160, smoke112): the Calendar's
  own events two-way with the primary Google calendar, what it derives one
  way to a "KurenaiOS" calendar, Reminders lists linked to Todoist projects
  or Google Tasks lists, Archive › Connections; the `ext-token` Edge Function
  (version 1, its GOOGLE_* and TODOIST_* secrets set) and migration
  `20261030000001` `kos_ext` applied. Before it sw `kos-mind-1` (29 October 2026, `feat/mind` at
  `cc2bc15`, main fast-forwarded to it) — https://2f7e2aa8.kurenai-os.pages.dev:
  Mind, the fifth study space (roadmap 5.9, design turn 32; invariants
  137–141, smoke109–111; migration `20261029000001` `kos_mind` applied):
  the platform and unit F1, What makes an argument good, with the desks
  and lesson tab row cleaned up across subjects. Before it sw `kos-japanese-5` (27 October 2026, `feat/art-audit`) —
  https://fc302f55.kurenai-os.pages.dev: the Japanese media path's labels
  no longer overlap at phone width (a stone is as wide as its longest word;
  the strip is a declared `KOS.ui.scroller`), on top of kos-pencil-4; with
  it the art and shop audit (roadmap 5.13, proposed). Before it sw `kos-pencil-4` (27 October 2026) —
  https://0f3ac3cd.kurenai-os.pages.dev: Kurenai's marking reasons draw as
  maths (`KOS.inkAI.mathText`), and 274 LaTeX `\\;` restored in the Pure
  notes (smoke107 K lints js/data). Before it sw `kos-pencil-3` (27 October 2026, `feat/pencil-fixes`)
  — https://f054551b.kurenai-os.pages.dev: Mark with Kurenai waits out
  Gemini's "high demand" (three patient retries, 3/8/15 s, shown; `busyRetries`
  on `KOS.ai.chatWith`), and a long Start button ends in … inside its card
  (`.k-fit-btn`). Before it the Pencil follow-up (sw `kos-pencil-2`, 27 October
  2026, `feat/pencil-fixes`) — immutable deployment https://e2203d56.kurenai-os.pages.dev:
  Mark with Kurenai's reply no longer cut off (`ai-chat` gives Gemini's
  thinking its own 8192 tokens on top of the answer's), maths in "What is
  sent", Paper on answer pads (remembered per kind, `state.ui.padPaper`),
  Dock in the palette's ⠿ menu. Before it the Pencil fixes (sw `kos-pencil-1`, 27 October 2026,
  `feat/pencil-fixes`) — immutable deployment https://4e6dd91c.kurenai-os.pages.dev:
  the first day with the Apple Pencil Pro (lasso chips, colours after a
  redraw, the kept tab, options and sizes for every tool, finger scroll,
  stray samples, a faster PDF open), the review's words backing off, a
  finished review kept on the chip, and the Assistant's daily cap at 300
  (`ai-chat` redeployed); smoke107. Before it Files R1–R4, airing on a closed app, CI-verified Rider
  evidence and habits several times a day (sw `kos-files-1`, 26 October
  2026, `feat/files`) — immutable deployment
  https://445e2aae.kurenai-os.pages.dev, with the `runner` Edge Function
  version 7 and `github-token` version 4 (invariants 36, 37, 39, 109, 125,
  131, 142, 150–153; smoke106). Before it the rest of the iPad build and Files R0 (sw `kos-pen-1`,
  26 October 2026, `feat/ipad-files`) — immutable deployment
  https://f73adfd3.kurenai-os.pages.dev: the floating palette and ruler,
  paste and export, ink sync (`kos_ink`), Pen and ink, answer pads,
  Kurenai reading handwriting when asked (off by default), flashcards by
  hand, the drills, working beside any tab, the PDF viewer for papers, and
  Files R0 (invariants 132–136 widened, 150–153). Before it the Routines follow-up (sw `kos-routines-2`, 26 October
  2026, `feat/routines` at the release commit) — immutable deployment
  https://ff0df878.kurenai-os.pages.dev: Daily habits as one fixed routine
  with its own editor (repeats, time, auto-tracking), History two cards a
  line and read-only, switched Focus sessions shown by stretch, the
  Review and Wishlist class collisions fixed, the Calendar's Show menu;
  and the `runner` Edge Function (version 6) writing Kurenai's review
  words ahead (decision D, invariant 146). Planned beside it: Files
  (roadmap 5.11, docs/files-plan.md). Before it Routines and the Daily
  Review (roadmap 5.10, sw
  `kos-routines-1`, 26 October 2026, `feat/routines` at `3c471b2`) —
  immutable deployment https://5598f36e.kurenai-os.pages.dev. Routines
  replace Habits (habits moved in with their days and streaks), the three
  reviews with the header chip, About to Study before Focus, Today's three
  on Home, and the derived surfaces (countdown Pin/Unpin, "From your plan"
  in Reminders, routine chips in the Calendar's week); invariants 142–149,
  smoke101–104.
  Before it polish (sw `kos-polish-3`, 25 October 2026,
  `feat/polish-1025`): strips redrawn by their page keep their scroll
  (`KOS.ui.scroller({keep, reveal})`; the term ribbon, the braid, the
  edge-marked tabs; the ink bar holds its own), Home's Today drops a
  timed event once it is over, Study hours' daily goal follows a
  repeating study-hours goal (`KOS.homeDailyGoalMins`), Productivity
  opens on its last page (`state.ui.lastProd`), and closed-app pushes
  were fixed (invariant 131: presence means in use; Send a test).
  Before it the iPad fixes on every view and the Handwritten tab's
  Side by side with Clip to page (sw `kos-ink-2`, `8a092b7`) — immutable
  deployment https://caffcf65.kurenai-os.pages.dev (25 October 2026;
  `feat/ipad-polish`: design 30e, smoke100 G, smoke43's per-visit drawer).
  Before it the ink engine and a topic's Handwritten tab (sw
  `kos-ink-1`, `052b27c`) — immutable deployment https://f47cbd39.kurenai-os.pages.dev
  (25 October 2026; `feat/ink`: roadmap 6.1–6.2 from design turn 30a–30d,
  invariants 132–136, smoke100). Before it Japanese Stage 1 unit F2, Days and times (sw
  `kos-japanese-4`) — immutable deployment https://e424163d.kurenai-os.pages.dev
  (24 October 2026; `feat/japanese-f2`: lessons 2.1–2.6 — the time, the days
  and でした, から・まで, dates, the next train, phone numbers — with checkpoint
  cp-F2, the clock and phone panels). Before it unit F1, First conversations
  (sw `kos-japanese-3`) — immutable deployment https://40739699.kurenai-os.pages.dev
  (23 October 2026; `feat/japanese-s1`: lessons 1.1–1.6 on the eight-page
  contract, VN scenes and manga panels over the user's art, Makoto joins the
  cast, and the audio pack — the cast on ElevenLabs, the narrator on
  VOICEVOX:No.7, `tools/bake_ja_audio.mjs`). Before it the rest of Code's
  Track T1 (sw `kos-code-24`) —
  immutable deployment https://f6ddf42e.kurenai-os.pages.dev (23 October
  2026; `feat/code-t1-rest`: T1D HTTP and REST in the app with fake
  servers, T1E Networking and T1F Building an API in Rider, the Weather
  client, Loopback chat and the track's capstone CT1, The Planner goes
  online; the full runtime is `csw-1.1`). Before it the Code spine's
  Core/Tracks split (sw `kos-code-23`),
  https://b0ccc028.kurenai-os.pages.dev (23 October 2026; `feat/code-t2`: Core or Tracks, never both; Projects shows two;
  real track states). Before it `8ff3751`,
  https://b7cc2382.kurenai-os.pages.dev (23 October 2026; `feat/code-t2`:
  the whole of Code's Track T2 — 20 Rider lessons in Avalonia, four
  projects tested headless and the first track capstone, The Planner on
  the desktop; validator 1.1.1). Before it `2db0b4f`,
  https://2c5de69f.kurenai-os.pages.dev (23 October 2026; `feat/code-t1b`:
  Code T1B, SQL from C#, and T1C, Entity Framework Core — nine Rider
  lessons, Contacts on SQLite and The Lending Library on EF Core). Before
  it `07b3520`, https://4eef907a.kurenai-os.pages.dev (23 October 2026; `feat/code-t1`:
  Code's SQL sandbox (Spike S) and T1A, Databases — eight SQL lessons and
  The Case of the Missing Mug). Before it `a1bc5c5`,
  https://a53c4f26.kurenai-os.pages.dev (23 October 2026; `feat/code-stage4`:
  Code stage 4 — units 10–12, capstone 4 and validator 1.1.0; the core
  path complete). Before it `ee1a746`,
  https://0714e554.kurenai-os.pages.dev (22 October 2026; `feat/japanese`:
  the Japanese review fixes — one navigation, the path in the desk's hero,
  aligned rows). Before it `d061169`,
  https://6a6bcfa7.kurenai-os.pages.dev (22 October 2026; `feat/japanese`:
  the Japanese platform release, roadmap 5.5 — the backend, the pages from
  design turn 28 and Stage 0's sixteen kana lessons). Before it `87f9437`,
  https://982f307b.kurenai-os.pages.dev (22 October 2026; `feat/ipad`: the
  iPad layout, roadmap 6.0 — the rail opens over the page at 701–1080px,
  topic pages no longer collapse at 1081–1240px). Before it `13cef94`,
  https://3191f2e6.kurenai-os.pages.dev (22 October 2026; `feat/after-fsrs`:
  switching mid-Focus, FSRS phase 3, what reaches a closed app, Code →
  GitHub as a GitHub App). The `runner` and `github-token` Edge Functions
  are deployed with their secrets, the `kos-runner` pg_cron job runs every
  five minutes, and migrations `20261022000001`–`03` are applied. Before
  it `3b39ae1` (21 October 2026; the Exams & Deadlines hub),
  https://e94eede7.kurenai-os.pages.dev.
- Last milestone tag: `milestone/graphite-ui-rebuild`
- Service-worker version: `kos-integrity-20`
- Branches: `main` is the line. On 20 October 2026 it was fast-forwarded to
  `feat/money-goals` (Money and Goals), then to `feat/fsrs` (FSRS), on 21
  October to `feat/exams-hub` (the Exams hub), and on 22 October to
  `feat/after-fsrs`, then to `feat/ipad`, then to `feat/japanese`, and on
  23 October to `feat/code-stage4`, then to `feat/code-t1`, then to `feat/japanese-s1`, then to `feat/japanese-f2`, on 25 October to `feat/ink`, and on 26 October to `feat/routines` (Routines and the Daily Review), so
  `claude/roadmap-code-study-space` (at `771e967`) is behind it with
  nothing of its own. Check `git log` for later drift; branch new work from
  `main`.
- In flight: Japanese (roadmap 5.5, [`docs/japanese-plan.md`](docs/japanese-plan.md)
  revision 3.2), branch `feat/japanese`. The vertical slice in
  `prototypes/japanese-space/` is closed on real data. The platform release
  (plan §17) was RELEASED on 22 October 2026 (`d061169`, sw
  `kos-japanese-1`): the backend (the
  model, the facet scheduler, kana, conjugation, validators, strokes;
  invariants 112–118, smoke81 and smoke83), the pages drawn to design turn
  28 (`js/core/jaui.js`, `js/modules/japanese.js`, `jatopic.js`, `jarun.js`,
  `css/views/japanese.css`; the desk, the lesson, the session, Kana, Skills,
  the path, checkpoints, settings and licences; smoke80) and Stage 0's
  sixteen lessons (`js/data/content/ja-s0.js`, six pages each; smoke82).
  Stage 1 is released one unit at a time: unit F1, First conversations
  (`js/data/ja-s1.js`, `js/data/content/ja-f1.js`, eight pages each, VN scenes
  and manga panels through `KOS.jaUI.scene`/`panel`), RELEASED 23 October 2026
  (sw `kos-japanese-3`), and F2, Days and times (`ja-f2.js`), RELEASED 24 October
  2026 (sw `kos-japanese-4`); F3–F6 are outlined in docs/japanese-plan.md §3.1.
  ElevenLabs' free tier holds three designed voices (Akari, Yōta, Makoto):
  ask the user before a fourth voiced character.
  The reader, media and immersion pages (28h, 28i, 28l) come later.
- Released 20 October 2026: FSRS (roadmap 5.6, [`docs/fsrs-plan.md`](docs/fsrs-plan.md)),
  phases 1–2. It is one FSRS-6 core for flashcards and Code's retrieval
  cards, with the SM-2 switch at boot, the review log, the exam-aware cap
  against an exam-day target, leeches and Rework, topic memory, and Card
  stats' fitted charts. Held by smoke88 and `tools/fsrs_check.mjs`. Phase 3
  (the optimiser, `KOS.fsrsOpt`, and the review log's replication to
  `kos_reviews`, migration `20261022000001`; smoke96) was released on 22
  October 2026; Optimise stays off until 1,000 reviews are logged.
- Released 22 October 2026 (`feat/after-fsrs`): switching a Focus session's
  subject, topic or assignment mid-way (invariant 4a, smoke95); what
  reaches a closed app (roadmap 5.7 item 1, [`docs/server-runner-plan.md`](docs/server-runner-plan.md):
  the outlook, Web Push and the `runner` Edge Function; invariants 98,
  71b, 131; smoke97; migration `20261022000002` applied; `runner` deployed
  22 October 2026 with its VAPID and `CRON_SECRET` secrets; the cron job is
  the SQL in the gitignored `supabase/runner-cron.sql.local`); Code → GitHub as a GitHub
  App (roadmap 5.7 item 2, [`docs/github-app-plan.md`](docs/github-app-plan.md);
  invariant 110; smoke98; migration `20261022000003` applied;
  `github-token` deployed 22 October 2026; the App itself and its
  `GITHUB_*` secrets are not created yet).
- Released 21 October 2026: the Exams & Deadlines hub (roadmap 5.8,
  [`docs/exams-plan.md`](docs/exams-plan.md) revision 2), branch
  `feat/exams-hub`. Phases 1 (the assessment record, migration, Scope
  Builder, the cap by scope, the widened attempt, redo items, start-by;
  smoke89), 2 (the past-paper index, boundaries, the report fetcher;
  smoke90) and 3 (readiness, analytics, the planner and its send, Exam
  Season and the Exam Room, the joins, the post-mortem, the Paper library,
  timetable import, the load view, feedback, what changed, results day;
  smoke91) and 4 (the five exam goal types, linked by `examId`, the 29c
  templates, app-checked checklist rules, the Assistant's hub tools;
  smoke92) and 5 (the archetype catalogue, the assembled Companion, the
  three playbooks, trend and likelihood, the paper engine, the revision
  pack, accessibility; smoke93) and 6 for CS Paper 2 (the exhaustive
  Companion: every shape of 4.5–4.12 with worked variations, report-cited
  traps, practice sets, subtopic packs, predicted papers and the
  recognition drill; smoke94) are released, and the pages
  are drawn to design turn 29 (frames 29a–29ac). Next: the full Companion
  for CS Paper 1, then Maths Papers 1–3 and F201, one paper per release.
- Released 20 October 2026: Money and Goals (roadmap 5.4), built whole
  from design prompt 11 (frames 27a–27s) — the Money core and the Goals
  engine (smoke84–85), the joins (kos_money replication, the Assistant's
  money tools, Reports' facts, goal and money notices; smoke86) and the
  pages (Money's six views, Goals and a goal's page, Home's Goals switch,
  the Wishlist's purchase handoff, Calendar's derived chips, Reports' Money
  and Goals cards; smoke87).
- Planned 22 October 2026 (`feat/ipad`): the iPad and the Pencil (roadmap
  Phase 6, [`docs/ipad-plan.md`](docs/ipad-plan.md); 6.0, the iPad layout,
  is RELEASED as `87f9437`, sw `kos-ipad-1`) and the Creatives study space (roadmap 5.7 item 3,
  [`docs/creatives-plan.md`](docs/creatives-plan.md) revision 2, decisions
  A–H approved; design prompts 14 and 15 are written, frames 30a and 31a
  onwards).
- Released 31 October 2026 (`feat/art-review`, sw `kos-achievements-1`):
  Achievements, the Badge Wall (roadmap 5.16–5.17, [`docs/achievements-plan.md`](docs/achievements-plan.md));
  every achievement image is imported. Prompt 18 is ONE combined prompt
  still to send to Claude Design; not built from design turn 35: dragging
  to reorder the showcase and Edit seat's leave-with-changes prompt.
- Working from another Claude account or machine: [`docs/HANDOFF.md`](docs/HANDOFF.md)
  and the shared project memory in [`docs/memory/`](docs/memory/MEMORY.md).
