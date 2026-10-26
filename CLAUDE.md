# KurenaiOS engineering reference

Despite the historical filename, this is the canonical engineering reference for
any contributor or coding agent. `README.md` describes the product,
`PROGRESS.md` records the current delivery state, and `AGENTS.md` is the concise
execution contract. Keep implementation history in Git rather than rebuilding a
chronological diary here.

## Current baseline

- Category 7 A–G, the Graphite UI rebuild (review A and B), Reports and
  Code (platform, the whole core path — stages 1–4, Bridge B and four capstones; the whole of Tracks T1 and T2 with their capstones; units 7–9, 11 and 12 on the full runtime, unit 10 and capstone 4 in Rider) are integrated and deployed. What is still to do is kept in one place:
  [`docs/ROADMAP.md`](docs/ROADMAP.md).
- Production: https://kurenai-os.pages.dev
- Release source checkpoint: `f83148c` (Code, the fourth study space: the
  platform from design turn 26 and unit 1; on top of the Reports rebuild
  `5bece3e`). `ai-chat` is deployed as version 5; the
  `kos_reports` migration `20261012000001` is applied; so is `kos_money`
  (`20261019000001`, 19 October 2026), live since the Money and Goals release.
- Latest release: Japanese Stage 1 unit F2, Days and times (sw
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
- Service-worker version: `kos-japanese-4`
- Required smoke gate: 103 / 103 suites (`""` and 2–103; 80–83 are Japanese's, 99 is Code's SQL runner, 100–103 are Routines and the Daily Review).
- Branches: `main` is the line. On 20 October 2026 it was fast-forwarded to
  `feat/money-goals` (Money and Goals), then to `feat/fsrs` (FSRS), on 21
  October to `feat/exams-hub` (the Exams hub), and on 22 October to
  `feat/after-fsrs`, then to `feat/ipad`, then to `feat/japanese`, and on
  23 October to `feat/code-stage4`, then to `feat/code-t1`, then to `feat/japanese-s1`, then to `feat/japanese-f2`, so
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
- Working from another Claude account or machine: [`docs/HANDOFF.md`](docs/HANDOFF.md)
  and the shared project memory in [`docs/memory/`](docs/memory/MEMORY.md).

## Run, test and deploy

There is no build step or bundler. Classic script tags allow `index.html` to run
from `file://`. Use HTTP for PWA, cloud and browser-audit work.

```sh
python3 tools/dev_server.py 8765       # http.server with no-store, so edits show on one reload
npm install jsdom fake-indexeddb       # test-only dependencies, once
for i in "" {2..99}; do node "tools/smoke${i}.test.js"; done
node tools/ja_valid_check.mjs          # Japanese: kana, conjugation, every validator, strokes on every kana
node tools/gen_ja_strokes.mjs --check  # the kana stroke data matches KanjiVG
node tools/bake_ja_audio.mjs           # Japanese's audio pack: the cast on ElevenLabs, the narrator on VOICEVOX (open the app); --check, --dry
python3 tools/gen_exam_index.py        # the past-paper index, from ~/Downloads/A-level (when that folder changes)
node tools/gen_exam_reports.mjs        # js/data/exam-reports.js, after editing tools/exam-index/reports/*.md
node tools/fsrs_check.mjs              # KOS.fsrs against py-fsrs (needs Python; after any change to js/core/fsrs.js)
node tools/cs_diff.mjs                 # Code content against real .NET (needs the .NET 10 SDK)
node tools/sql_diff.mjs                # Code's SQL against native SQLite (Python's sqlite3)
tools/build_cs_wasm.sh                 # Code's full C# runtime (units 7+), once per change to tools/cs-wasm
node tools/cs_wasm_check.mjs           # that runtime against native .NET
node tools/validator_check.mjs         # the Rider validator end to end (needs NuGet and git)
node tools/gen_code_projects.mjs       # after editing a Rider project's scaffold in tools/code-projects/
```

For responsive or shared-component work, run the dense audit and inspect images,
not only JSON:

```sh
node tools/responsive_audit.mjs --seed
node tools/responsive_audit.mjs --ipad                     # iPad Air 11": both orientations, touch, no hover
node tools/responsive_audit.mjs --sizes 590x796,375x796 --touch   # Split View and Slide Over
```

Use the wider breakpoint/device matrices described in the audit script headers
for release work. Changes to image positioning, heroes, goals, shrine, charts or
broad visual hierarchy also run:

```sh
node tools/visual_audit.mjs
```

Production is a deliberate direct upload; a Git push does not deploy it:

```sh
tools/deploy_pages.sh --stage
tools/deploy_pages.sh
```

Before deploying: run all tests, inspect `dist/`, bump `VERSION` in `sw.js`, verify
that no secret/development/Live2D file was staged, then smoke-test the immutable
deployment and production alias. `js/env.local.js` is the sole local browser
configuration and must remain untracked; `js/env.example.js` is documentation and
must not enter the runtime package.

### Assets the user makes

The user can make raster art in the Gemini app (by hand: never automate
Gemini and never spend on an image API) and voice lines in VOICEVOX (the
desktop app, which serves http://127.0.0.1:50021 while it is open) or on
ElevenLabs (its voices designed on the website; the key lives in the
gitignored `prototypes/japanese-space/voice/.env.local`, never printed).
When work needs an image (a background, a character, a panel, a hero, a
Creatives reference) or audio, ASK for it rather than drawing it in SVG or
going without: add the asset to a manifest with its full prompt and the
files to attach, and point the user at the prompt sheet. Japanese's art
runs through `art-source/ja/manifest.json` (prompt and contact sheet:
`prototypes/japanese-space/art.html`; results saved into
`art-source/ja/inbox/<id>.png`; style rules in docs/japanese-plan.md
§12.1): no text in an image, ever, since all text is a live layer. Assets
are original to this app and credited as AI-assisted.

Supabase Edge Functions deploy separately with `supabase functions deploy <name>`.
Set `STEAM_API_KEY`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`,
`PUBLIC_APP_URL` and provider secrets with the platform secret store only.

## Architecture

### Runtime shape

KurenaiOS is a script-tag application with one global namespace, `KOS`. Load order
in `index.html` is an API:

1. configuration and third-party browser libraries;
2. store and shared core (`ui`, accessibility, router, search, images, charts,
   content, scheduling, sessions and Governor);
3. Collection/cloud/Assistant services;
4. generated specification data and authored content;
5. engines and page modules;
6. labs and sandboxes;
7. `mobile-shell.js`, then `main.js` boot.

Every view is registered as `KOS.views.<id> = function (main, arg) { ... }` and is
entered through `KOS.show()`. Do not replace `#main` directly. `router.js` wraps
rendering to maintain browser-owned hash history; `KOS.rerender()` is the
non-navigation redraw path.

### Persistence

- `KOS.store.state` in `localStorage`: study state, UI, economy, sessions,
  calendar/reminders/assignments, planner/goals, the integrated weekly plan
  and Assistant preferences.
- `kurenai-os-media` IndexedDB: Collection records, non-token media preferences
  and provider credentials in its kv store.
- `kurenai-os-files` IndexedDB: topic attachments.
- `kurenai-os-money` IndexedDB: Money's transactions and their tombstones
  (invariant 5a).
- `kurenai-os-reviews` IndexedDB: the review log, one row per rating
  (invariant 111).
- `kurenai-os-papers` IndexedDB: the Paper library's own PDFs and photos
  (`KOS.examPapers`); never synced and not in the full backup.
- Supabase: optional replication layer; never the only successful write path.
- `store.exportFull()` / `importFull()`: state, media, non-token kv and files;
  credentials/sessions are deliberately excluded.

### Primary ownership map

| Contract | Owner |
|---|---|
| DOM primitives, dialogs, tabs, scrollers, the reorder (drag) pattern, rendering; `KOS.ui.device()` (the device's NAME for words, never layout: an iPad's Safari says "Macintosh") | `js/core/ui.js` |
| Live regions and activation helpers | `js/core/a11y.js` |
| Hash URL/history | `js/core/router.js` |
| Cross-domain search | `js/core/search.js`; presentation in `hub.js`/`mobile-shell.js` |
| Study content and engines | `content.js`, `hub.js`, `js/engines/` |
| Specification tree queries and stored topic links (`refs`) | `js/core/spec.js` (`KOS.spec`) |
| The topic picker (every form that names topics) | `js/core/topicpicker.js` (`KOS.topicPicker`) |
| Exams & Papers record and its normaliser (the attempt, decision B) | `js/core/tracker.js` (`KOS.tracker`); page `js/modules/tracker.js` (Practice, `KOS.trackerLog`) |
| The Exams & Deadlines hub (roadmap 5.8): assessments, tiers, scopes, migration, start-by, the past-paper index reader | `js/core/exams.js` (`KOS.exams`, `KOS.examIndex`); `js/data/exam-presets.js` (board papers), `js/data/exam-index.js` (GENERATED by `tools/gen_exam_index.py` from `tools/exam-index/map.csv` and the user's folder), `js/data/boundaries.js`; pages `js/modules/exams.js` (`#/exams[/<id>]`, `KOS.examEditor`, the shared parts `KOS.examUI`), `css/views/exams.css`; `tools/fetch_reports.py`, `tools/exam-index/reports/`; smoke89–90 |
| The hub's phase 3: analytics, the planner, the Paper library, the pages | `js/core/examstats.js` (`KOS.examStats`, pure, also in Node: weights, predicted grade, band, the next ten marks, patterns, pace, calibration, the post-mortem, timetable parsing), `js/core/examplan.js` (`KOS.examPlan`: the week's plan and its send to Pacing), `js/core/exampapers.js` (`KOS.examPapers`: IndexedDB `kurenai-os-papers`, the folder match); readiness, season, checklist, import, load and results in `js/core/exams.js`; pages `js/modules/examviews.js` (`KOS.examViews`: Readiness, Planner, Season, Results), `js/modules/examprac.js` (`KOS.examPractice`: Attempts, Analytics, Library, the post-mortem and marks), `js/modules/examroom.js` (`KOS.examRoom`); smoke91 |
| The hub's phase 5: the Companion, the playbooks and the paper engine | `js/data/exam-archetypes.js` (AUTHORED: the archetype catalogue, pattern rows over the index's tag text), `js/data/exam-playbook.js` (AUTHORED: each board's decoder, habits, conventions, notation, levels and the FX-991CW), `js/data/exam-reports.js` (GENERATED by `tools/gen_exam_reports.mjs` from `tools/exam-index/reports/*.md`); `KOS.examStats` `tagArchetypes`, `archetypeStats`, `coreHalf`, `heat` (pure); `js/core/examcompanion.js` (`KOS.examCompanion`: guide, drill, playbook, blacklist, likelihood, pack); `js/core/exampaper.js` (`KOS.examPaper`: blueprint, build, chips, toAttempt); pages `js/modules/examguide.js` (`KOS.examGuide`: the Companion tab, trend, the drill, the drawer, the pack, Exams settings, the print root) and `js/modules/exampaperview.js` (`KOS.examPaperView`: viewer, timed mode, tally, print); smoke93 |
| The hub's phase 6: the exhaustive Companion, one board paper at a time | `js/data/exams/<paper>-*.js` (AUTHORED, original: `KOS_EXAMS.deep[paper].leaves[ref]` = shapes → variations with mark points, working rules, report-cited traps, Method 1/2; the practice set; `extended`, the levels-of-response answers; CS Paper 2 is `aqa-7517-2-45/46/47/49/410.js`); `js/core/examdeep.js` (`KOS.examDeep`: data, archetype, instances, index, bank, pack, recognition, worked per device); predicted, pack and set papers in `KOS.examPaper.build` (`seed` = n, `pack-<ref>`, `set-<ref>`); page `js/modules/examdeep.js` (`KOS.examDeepView`: `#/exams/<id>/deep[/<shape>]`, frames 29p–29q, and the guide's worked-shapes section); smoke94 |
| The hub's goals (phase 4) | `js/core/goals-exams.js` (`KOS.goalsExams`: the five types, `typesFor`, the 29c `templates`/`add`); the engine's exam hooks (`deadlineOf`, `judge`, `fromBase`, `noPace`, `byExam`, `unlinkExam`, `linkExam`) in `js/core/goals.js`; the exam fields in `js/modules/goals.js`; the Goals card and the templates dialog (`KOS.examGoalTemplates`) in `js/modules/exams.js`; the read tools `exams_overview`, `exam_detail`, `exam_attempts` in `js/core/aitools.js`; smoke92 |
| Money (roadmap 5.4): categories, budgets, recurring rules and subscriptions, pots, transactions, the planner mirror, CSV | `js/core/money.js` (`KOS.money`); the pages `js/modules/money.js` (`KOS.views.money`, `#/money/<overview|transactions|budgets|recurring|pots|month>`, design 27a–27h; `KOS.moneyUI`), `css/views/money.css`; the shared primitives (`KOS.ui.amount`, `amountField`, `catBar`, `paceChip`, `periods`, `ring`, `pictureSlot`, `wash`) in `js/core/ui.js` and `css/components.css` |
| Goals: the engine, its types and periods | `js/core/goals.js` (`KOS.goals`: registry, record, compute, pace; the study, productivity, money, code and Governor types), `js/core/goals-collection.js` (the Collection's fourteen); pages `js/modules/goals.js` (`#/goals[/week|month|done|<id>]`, design 27i–27k; `KOS.goalsUI`, `KOS.goalEditor`), `css/views/goals.css`; Home's Goals switch in `hub.js` |
| IT unit marks and statuses | `js/core/itunits.js` (`KOS.itUnits`); scales and boundaries `js/data/it-grades.js`; grades derived in `hub.js` (`KOS.hub.it`); the desk's two blocks `js/modules/itdesk.js` |
| User edits to the curriculum, the study editor and the quick note | `js/core/edits.js`, `js/modules/editor.js` |
| The spaced-repetition model (FSRS-6), the flashcard schedule and the review log | `js/core/fsrs.js` (`KOS.fsrs`, pure, also in Node), `srs.js` (`KOS.srs`: the parameters in use, `weights`/`setFit`/`resetFit`), `js/core/reviewlog.js` (`KOS.reviewLog`, replicated to `kos_reviews`); `tools/fsrs_check.mjs`, `tools/smoke88.test.js` |
| The optimiser (FSRS phase 3) | `js/core/fsrsopt.js` (`KOS.fsrsOpt`, pure, also in Node: prepare, pretrain, the Adam job, accept-if-better, `changes`); the "Fitted to your reviews" card and its preview in `js/modules/cardstats.js`; `tools/smoke96.test.js` |
| Sessions and rewards | `sessions.js`, `governor.js` |
| Calendar/reminders/assignments/Focus | matching modules in `js/modules/` |
| Integrated weekly plan and pacing | `js/core/pacing.js`, `js/modules/pacing.js` |
| Collection schema and sync | `mediadb.js`, `media*.js`, provider clients |
| Vault presentation/editors | `medview.js`, four vault modules, `KOS.mediaEditors` |
| Cloud replication | `cloud.js`, `cloudmerge.js`, `cloudsync.js`, `cloudui.js` |
| Assistant | `assistant-*.js` services and `js/modules/assistant.js` |
| Scheduled messages (a prompt sent at a time; read-only, isolated runs) | `js/core/aischedule.js` (`KOS.ai.schedule`; `serverOwned`, `applyServerRun`); the Assistant's Scheduled tab |
| What reaches a closed app (roadmap 5.7) | `js/core/outlook.js` (`KOS.outlook`: the week's notices and the brief, a pure read), the owners' `forecast`/`notice` (`KOS.calendar`, `KOS.reminders`, `KOS.assignments`), `js/core/push.js` (`KOS.push`: subscribe, publish, presence, pull), the `push` handler in `sw.js`, the "When the app is closed" card in `js/modules/notifications.js`; `supabase/functions/runner/` (`index.ts`, `logic.ts`, `webpush.ts`, `model.ts`); `tools/gen_vapid.mjs`; smoke97 |
| Reports (roadmap 5.1, `docs/reports-plan.md`): periods and facts, words, saved reports and snapshots, the pages | `js/core/report.js` (`KOS.report`: periods, the pure `compute`), `js/core/reportwords.js` (`KOS.reportWords`: template and section words, `hm`, `compare`), `js/core/reportstore.js` (`KOS.reportStore`, IndexedDB `kurenai-os-reports`), `js/modules/reports.js` (`KOS.views.reports`, the Home card, `css/views/reports.css`), `js/modules/reportlong.js` (`KOS.reportsLong`: the month, term and year pages), `js/modules/reportstory.js` (`KOS.reportStory`: the story player), `js/modules/reportshare.js` (`KOS.reportShare`: the share card and export); the media activity journal in `mediadb.js`; the replicated copy in Supabase `kos_reports` |
| The subject list (CS, Maths, IT, Code; which are exam subjects), names and hues | `js/core/subjects.js` (`KOS.subjects`) |
| Code (roadmap 5.3, `docs/code-plan.md`): curriculum, model, runner, primitives, pages | `js/data/code.js` (the authored spine `KOS_DATA.code` and `KOS_CODE`: stages, tracks, concepts, tasks, cards, the error decoder), `js/data/content/code-u*.js` (one file per released unit; units 1–12 and Bridge B), `js/data/content/code-c*.js` (one per capstone, through `KOS_CODE.capstone`), `js/data/content/code-t<n><part>.js` (a track's parts, one file each: T1A–T1F, T2A–T2E; `code-t1-data.js` holds the SQL datasets), `js/core/code.js` (`KOS.code`: evidence, pay, retrieval, the day's plan), `js/core/coderun.js` (`KOS.codeRun`: the worker and the checker), `js/labs/cs-interp.js` (the in-app C# runner, pure, also in Node), `js/core/codeui.js` (`KOS.codeUI`: editor, results, error card, hints, stage path, listings, key bar), `js/modules/codetopic.js` (`KOS.codeTopic`: the lesson on the shared topic page), `js/modules/code.js` (`KOS.codeDesk` and `#/code/<page>`), `js/modules/codecap.js` (`KOS.codeCapstone`: the capstone checkpoint, `#/code/capstone/<id>`), `css/views/code.css`; `tools/cs_diff.mjs` (the .NET differential) |
| Code's full C# runtime (units 7+; decision A, Spike W) | `tools/cs-wasm/` (Roslyn and the learner's program inside .NET WebAssembly; `Instrument.cs` marks each statement for lines, the step budget and the clock), built by `tools/build_cs_wasm.sh` into `assets/code/runtime/<id>/` (generated, gitignored, built by the deploy when missing); `js/labs/cs-wasm-worker.js` (the module worker that seals the network); the runtime half of `js/core/coderun.js` (`runtime`, `startRuntime`, `removeRuntime`); the offer and download dialog and the warnings list in `js/core/codeui.js`; `tools/lib/cs-wasm-node.js`, `tools/cs_wasm_check.mjs` |
| Code's Rider workflow (Bridge B, unit 10, capstone 4, the tracks' Rider parts and the Track T1 and T2 capstones; docs/code-plan.md §9, frames 26m–26n) | `js/data/content/code-ub.js` (Bridge B's lessons, command cards and the project's brief and milestones), `code-u10.js` (unit 10's project, The Lending Library), `code-c4.js` (capstone 4 and its project, The Revision Planner), `code-t1b.js` (T1B and its project, Contacts on SQLite), `code-t1c.js` (T1C and its project, The Lending Library on EF Core: a pinned `dotnet-ef`, acceptance tests on SQLite in memory that read the SQL sent), `code-t1d.js` (T1D, HTTP and REST, IN THE APP on the full runtime: every program brings its own fake server — an `HttpMessageHandler` at its end — so `HttpClient` runs unchanged in the sealed worker; its project, the Weather client, in Rider: retries, deadlines and a key from user secrets, against a fake server), `code-t1e.js` (T1E, Networking, in Rider: Loopback chat, a `TcpListener` server tested with real `TcpClient`s over loopback), `code-t1f.js` (T1F, Building an API, and Track T1's capstone `CT1`, The Planner goes online: ASP.NET Core minimal APIs over EF Core with migrations, an API key from configuration, acceptance tests through `WebApplicationFactory`), `code-t2a.js`–`code-t2e.js` (Track T2 in Avalonia 12: T2A's taster Your first window, T2B's The Reading List, T2C's Markdown notes (CommunityToolkit.Mvvm), T2D's Focus timer (DI, a fake `TimeProvider`, a fake HTTP server), and T2E with the track's capstone `CT2`, The Planner on the desktop; every acceptance suite drives real windows on Avalonia.Headless (xunit v3) — find by name, type, click, Tab, resize — and the Pitfalls messages are real builds' and runs'; XAML blocks, `{code: {lang: "xaml"}}`, highlight through `highlightXml` in `content.js`); `tools/code-projects/<folder>/` (each project's real scaffold) → `js/data/content/code-projects-files.js` (generated by `tools/gen_code_projects.mjs`); `assets/code/validator/validate.cs` (the validator, zipped into every export); `js/core/codezip.js` (`KOS.codeZip`: zip and SHA-256), `js/core/codeproj.js` (`KOS.codeProject`: export and the report check), the project model in `js/core/code.js` (`recordReport`, `projectView`), `js/modules/coderider.js` (`KOS.codeRider`: the hub, `#/code/project/<id>`); `tools/validator_check.mjs`, `tools/fixtures/{bridge,library,planner,contacts,efcore,weather,chat,planner-api,window,reading,notes,timer,planner-desktop}-report-*.json` |
| Code's SQL runner (Spike S; T1's Databases part, docs/code-plan.md §3.3) | `assets/code/sqlite/` (sql.js 1.14.2, VENDORED unchanged, MIT), `js/labs/sql-run.js` (`KOSQL`: pure, also in Node — results as text tables), `js/labs/sql-worker.js` (the sealed worker), the SQL half of `js/core/coderun.js` (`lang: "sql"`, made on the first run); `js/data/content/code-t1-data.js` (`KOS_CODE.DATASETS`, authored); `tools/lib/sql-node.js`, `tools/lib/sql_ref.py`, `tools/sql_diff.mjs`, `tools/sql_spike_corpus.js`; smoke99 |
| Code → GitHub (docs/code-plan.md §10, v1: a fine-grained token; v2: the GitHub App, docs/github-app-plan.md) | `js/core/codegit.js` (`KOS.codeGit`: connect, `connectApp`/`completeApp`/`disconnectApp`, `tokenFor`, the outbox, one-commit pushes, the guard); the GitHub card in Code settings (`js/modules/code.js`); `supabase/functions/github-token/` (`index.ts`, `jwt.ts`), `kos_github`; `tools/smoke79.test.js`, `tools/smoke98.test.js` |
| Japanese (roadmap 5.5, `docs/japanese-plan.md`): the model, the facet scheduler, kana, conjugation, validators, strokes, the curriculum | `js/core/ja.js` (`KOS.ja`: the gate, lessons, record, sessions, pay, mining, input, the day's plan, skills, the timeline), `js/core/jasrs.js` (`KOS.jaSrs`, pure, on `KOS.fsrs`), `js/core/jakana.js`, `jaconj.js`, `javalid.js`, `jastroke.js` (pure, also in Node); `js/data/ja.js` (`KOS_JA`, AUTHORED: stages, lessons, items, checkpoints), `js/data/ja-strokes.js` (GENERATED by `tools/gen_ja_strokes.mjs` from KanjiVG); `tools/ja_valid_check.mjs`, smoke81, smoke83. The pages (design turn 28): `js/core/jaui.js` (`KOS.jaUI`: furigana, skill chips, voiced lines, the verdict, the stage and media paths, radar, meter, seal, the genkō square), `js/modules/japanese.js` (`KOS.jaDesk`, `KOS.views.japanese`: `#/japanese/<path|skills|kana|reviews|checkpoints|settings|licences|session/<reviews|learn-REF>>`), `js/modules/jatopic.js` (`KOS.jaTopic`: the lesson on the shared topic page, the spine), `js/modules/jarun.js` (`KOS.jaRun`: exercises and the session), `css/views/japanese.css`; Stage 0's lessons `js/data/content/ja-s0.js` (`{pages:[{t, blocks}]}`, six pages); Stage 1's items, lessons and units `js/data/ja-s1.js`, one content file per unit (`ja-f1.js`, `ja-f2.js`, eight pages: Hook … Quick reference, the reference built from the lesson's items), the art in `assets/ja/img/`; the audio pack `js/data/ja-audio.js` (GENERATED by `tools/bake_ja_audio.mjs`: `KOS_JA_AUDIO["<who>|<text>"]` → `assets/ja/audio/<who>/<hash>`, a voice not designed yet stays the browser's, smoke82 `AWAITED_VOICE`); no rail item of its own: it is a Study subject, and the subject pills show one group at a time (`KOS.subjects.group`: CS, Maths and IT on their pages; Code and Japanese on theirs; one pill reaches the other group); smoke80, smoke82 |
| Routines and the Daily Review (roadmap 5.10, `docs/routines-plan.md`, design turn 33): the record, the day model, the review core | `js/core/routines.js` (`KOS.routines`: the record, log, snapshot, streaks, rest days, late ticks, pay through `KOS.governor.routineAward`, the Habits migration, `habitsView`, goal types and tools), `js/data/routine-templates.js` (AUTHORED), `js/core/today.js` (`KOS.today`: the day model, a pure read; the bag), `js/core/dayreview.js` (`KOS.dayReview`: settings, `due` and the folds, steps, triage through the owners, the words, notices, tools); smoke100–102 |
| Routines and the Daily Review: the pages | `js/modules/routines.js` (`KOS.views.routines`, `#/routines[/routines\|templates\|history\|settings]`, `#/routines/edit/<id>`; `#/tasks` aliases; `KOS.rtUI`, the shared parts), `js/modules/dayreview.js` (`KOS.reviewSheet`: the overlay, the steps, the header chip, auto-open), `js/modules/routineplayer.js` (`KOS.routinePlayer`: the player, About to Study, the timetable sheet), `css/views/routines.css`; the art in `assets/routines/img/` (imported by `prototypes/japanese-space/art_import.py` from `art-source/routines/`); Home's three and Routines card in `hub.js`; smoke103 |
| Shared image placement | `js/core/imagecrop.js` |
| OOP sandbox model: gate, identity, validation, transpile, canvas view | `js/labs/oop.js` (`KOS.oop`, pure); the IDE view (tree, editor, C#, diagram) in the same file |
| Lab system: areas, kinds, thumbnails, the sim header, locked state, embedded lab | `js/labs/sims.js` (`KOS.sims.embed`, `areaOf`, `kindOf`) |
| The lab itself: control bar, SVG stage and overflow rule, transport, readout, plot frame | `js/labs/lab.js` (`KOS.lab.create`); archetypes in `sims-structures.js`, `sims-algorithms.js`, `sims-maths.js`, `sims-plots.js`, `sims-bits.js`, `sims-machines.js`; the Trace Lab `trace.js` |
| Behavioural hooks (`data-ui`/`data-state`/`data-intent`) for logic and tests | written by each view itself; `KOS.ui.state/hasState/hook` in `js/core/ui.js` (the M1 legacy-class bridge `ui-hooks.js` was retired at M14) |
| Spec-spine presence (`#cols[data-tree]`) | `KOS.shell.tree()` in `js/core/ui.js` |
| Presentation layer (UI rebuild; one `@layer` per file, order declared in `tokens.css`) | `css/tokens.css`, `base.css`, `layout.css`, `components.css`, `css/views/*.css`, `themes.css`; `tools/lib/css.js` `pending()` gates each layer's design contracts |
| Rebuild guards | `tools/smoke55.test.js` (legacy vocabulary `tools/ui-legacy-classes.json`, rebuilt files `tools/ui-migration.json`), `tools/smoke56.test.js` (render purity and control parity against `tools/baselines/render-purity.json`) |

## Invariants

These are release contracts. The historical numbering is retained because tests,
source comments and audit notes refer to it.

### Governor, Focus and rewards (1–5)

1. Streaks, XP, HP and gold flow from `KOS.sessions.log()` only. Never write them
   directly.
2. Gold gates only labs and simulations (one-time unlocks). HP gates NOTHING:
   it is a wellbeing signal (state label, drains, the recovery checklist, and a
   halved restore trickle while Critical) — low HP used to suspend labs, sims
   and the shop, and study material behind a health bar was the wrong trade.
   Specification, notes, flashcards, quizzes, exam questions and Focus never
   lock.
3. Media/leisure never changes HP and feeds only the separate rest streak. Reading
   sessions do not take distraction penalties.
4. Study streak, rest streak and the HP day-activity test are separate derivations
   of the session ledger. An incomplete Focus entry does not count for a streak but
   still counts as activity for the day-drain check; so does a `todo` tick (a
   habit, reminder, task or assignment completion) — activity, never study
   (`studyEntry` in `sessions.js`).
4a. `KOS.governor.focusAward({complete, mins, secs, pauses, rule|mode})` is the
   one pure definition used by previews and payment; the completion screen
   reports `lastAward()`. The mode picks the rule (`focusRule`):
   - Pomodoro — a completed session pays XP 10 + minutes, gold 3 + 2 per full
     25 minutes, HP 6; ending before the first full cycle forfeits it.
   - Custom, Stopwatch and Study-until — every FULL 10 minutes of focus is a
     block paying 12 XP and 1 gold, and 2 HP up to 6 a session
     (`FOCUS_BLOCK`). Ending early keeps the blocks earned; under 10 minutes
     pays nothing and is not complete (no streak). 30 min pays 36/3/6,
     60 min 72/6/6, 120 min 144/12/6.
   - Both rules: the first pause is free, each further one takes 15% off XP
     and gold (floor 25%).
   Stopwatch and Study-until may carry a break NUDGE (`nudgeMin`: a chime and
   one line, never a stop), and a stopwatch a self-stop LIMIT (`limitMin`,
   ended and paid exactly like Stop, `ended: "limit"`).
   A focus entry records its `rule`, `secs` and `blocks`; an entry from before
   the blocks rule carries none and reads as Pomodoro, so history is never
   re-priced. Each STRETCH of a Focus session links ONE subject: its `refs`
   may name several topics in it, and `ref` is the first leaf they cover.
   "Switch…" (`KOS.focus.switchTo`, the `focus_switch` tool) moves a
   running study session to another subject, topic or assignment without
   stopping the clock: the session stays ONE entry, paid once on its whole
   time, and the stretches (`segs`, each starting at the focus second of
   its switch, so breaks and pauses belong to none) are logged as
   `metrics.segments` [{subject, ref, refs, assignmentId, secs}] when there
   is more than one. A stretch under a minute is a correction and is
   replaced. The entry's own `subject`/`ref`/`refs` are the longest
   stretch; every reader that splits time by subject or topic (goals,
   Reports, Home, a topic's minutes, a subject's streak) reads
   `KOS.sessions.parts(e)`, and a completed session banks each stretch's
   minutes on its own assignment. Reading sessions do not switch.
4b. A Focus session is logged and paid before its review opens. Review may annotate
   that record and linked work but must never log or pay again.
4c. Page hide banks the live clock with `KOS.store.flush()` — the count-up
   stopwatch included. Reload/navigation is not a session, pause or
   distraction; recovery returns paused. Study-until ends at its clock time
   (`untilTs`); a pause never moves it.
4d. The idle watch: any interaction with the app restarts a 30-minute clock.
   A RUNNING study session untouched for 30 minutes is warned (toast, live
   region, a `focus` notification); 5 minutes later, still untouched, it
   ends itself, logged and paid ONLY for the focus done before the last
   interaction (`activeWork`), `ended: "idle"`, and its review waits on
   screen for the return. While the warning stands a pointer sweep is not
   an answer (a key, click, scroll or "I'm here" is), and answering marks
   the warning read in the bell. Reading and paused sessions are never
   watched. The mini-player's place and size are per device
   (`state.ui.focusMini`); `KOS.focus.clampMini` is the one rule: two widths
   (236/340), 20px in from the viewport, rail and header, and always docked
   (a corner within 64px, else the nearest edge). The phone dock does not
   read it.
5. One deliberate bulk/sync action produces at most one session. Autonomous
   multi-provider sync batches rewards; XML import does not reward.
5a. Money (`KOS.money`, roadmap 5.4) and the Budget Planner are logistics:
   zero Governor traffic and zero provider/network traffic. Purchase handoff
   is exact, local and cannot downgrade Collection data. Decision B: the small
   part (`state.money`: currency, `monthStart`, categories, rules, pots) is
   in the synced state document under `KOS.money.normalise`, every record
   keyed by a STRING id (fixed for the default categories, random otherwise)
   so the merge never re-keys what a transaction points at; TRANSACTIONS
   live in their own IndexedDB, `kurenai-os-money` (`tx` by `syncId`,
   indexed by date; `del` tombstones), in the full backup, and replicated to
   the owner-only table `kos_money` (migration `20261019000001`;
   `KOS.money.syncCloud`): local first, push then pull, a per-row stamp in
   the media kv (`money.sync.<uid>`) so this device's echo is skipped, a
   remote deletion applied without a tombstone of its own (never sent
   back), and the planner's mirror never sent. Amounts are integer minor
   units (`minor`). The Assistant reads Money as TOTALS (`money_overview`);
   single entries only through `money_transactions`, when asked; every
   `money_*` write is undoable and none touches the Governor.
   The planner OWNS its purchases: each archived purchase is mirrored as a
   Collection transaction `wl:<item>:<purchasedAt>` before every read, cannot
   be edited or deleted from Money and is not backed up twice; the Collection
   category's budget IS `wishlist.budget.monthlyLimit` (`budgetFrom`). A
   recurring rule is computed, never copied (invariant 43): an occurrence is
   confirmed (one transaction `r:<rule>:<date>`), skipped, or left
   (`marks`). A figure about the rest of the month (left, safe to spend, the
   projection) is null without its evidence (invariant 76). The pages only
   READ (smoke56 holds all six views): Hide amounts is per device
   (`state.ui.moneyHidden`) and masks every `KOS.ui.amount` on every
   surface, Reports included; the Wishlist's "Mark purchased" says what it
   will do before it does it; the Calendar draws bills, income and trial
   ends as DERIVED chips (`derivedOn`, never written as events, invariant
   44), hidden per device by `state.ui.calDerived`.
5b. Goals (`KOS.goals`, `js/core/goals.js`) are a registry of types, each
   registered by the domain that owns its data and measured by READING it
   (invariant 26d); `state.goals` v3 under `KOS.goals.normalise`, which keeps
   a type id it does not know. A repeating goal (`repeat` week/month) is one
   record: the current period is measured live and each ENDED period is
   judged once into `outcomes[periodKey]`; only types that can be read over
   any past range repeat. Completion records one idempotent
   `payout:"activity-only"` receipt (`"none"` for a Governor-value goal,
   which is display only) and never creates a second economic event or a
   session. A goal speaks through the `goal` notification kind
   (`KOS.goals.notices`, pure; `tick` every 30 minutes): a period ending
   tomorrow, a deadline tomorrow, reached, missed — one notice each by id,
   none for a display-only or archived goal, reached/missed only within two
   days. In Reports, `f.money` (totals, the three biggest categories, a
   month's over-budget categories) and `f.goals` (periods met and missed,
   goals reached and missed in the period) are facts like the rest; the
   words' payload gets their totals and counts only, never a payee,
   category or goal title (invariant 102b). The Reports pages draw them as
   the Money and Goals cards with "What Kurenai sees" (27o).

### Media schema, storage and sync (6–23)

6. `mediadb.normalise()` is the schema gate. The current DB is v8; new query axes
   require a version, migration and indexes. `syncId` is stable across devices and
   preserved on merge.
7. Media, files and tokens use their designated stores. Full backups exclude every
   credential. Browser origins have different IndexedDB databases.
8. Vaults and search never render/read an unbounded collection: use indexes,
   cursor caps and 60-entry lazy batches.
9. Pull sync owns list state but preserves the manual layer and local
   crop/source pairs. Custom lists: a list AniList HAS (the mirror passes
   every AniList list name, `mirrorOpts(module, names)`) follows the pull —
   membership removed there is removed here; a list only this app has
   unions. Non-null fresh `extra` fields accrete.
10. VN and Game progress is derived; do not store a parallel progress value.
    A VN counts ONE source — `mediadb.vnSource()`: `progressMode` when set,
    else routes, then chapters, then `playtimeHours` against VNDB's length
    (`vnLengthHours`: `extra.lengthMinutes`, else the 1–5 bucket as a rough
    figure; the derived total is flagged `estimate`), then `progressPercent`
    — and the derived `progress` carries its `unit` (`route`/`ch`/`hr`/`%`).
    Games derive from playtime.
11. Upsert identity order is VNDB id, AniList id, MAL id. Title claiming is VN-only
    and only for id-less exact-title rows.
12. Push only AniList-owned Anime/Books or VNDB-owned VNs. Games never push and the
    vault itself performs no provider request.
13. Push payloads contain list status, progress/volumes and non-zero score only.
14. Remote mutations go through `mediapush.js`/`mediasearch.js`; never delete or
    write favourites/reviews remotely.
15. `bulkUpsert()` neither pushes nor logs; callers receive its reward candidates.
16. Provider list-state last-write-wins is deliberate and documented.
17. The reward watermark absorbs local saves and compares before pull absorption;
    a push followed by its echo earns nothing.
18. VNDB Kana `/ulist` identity is the top-level `id`, not `vn.id`; use
    `api.vndb.org/kana` only.
19. Browser VNDB PATCH is CORS-blocked (re-verified 2026-09-20). Signed in to
    cloud sync, `setUlist` relays through the `vndb-ulist` Edge Function
    (the user's token rides the one request, never stored); signed out it is
    the direct PATCH, whose failure is never retried as if transient.
20. The browser never talks to Steam. Edge Functions verify OpenID, own SteamID,
    require a review stage and gap-fill only; the manual Games baseline survives.
21. Book lookup uses Open Library first and Google Books only as fallback.
22. AniList XML ids are MAL ids. Honour provider pacing and `Retry-After`.
23. Airing data is memory-only with a short TTL; AniList profile reads are
    read-only and batched.

### Content, UI and Collection composition (24–30)

24. `js/data/compsci.js`, `maths.js` and `it.js` are generated. Change parsers and
    regenerate. `js/data/code.js` and `code-u*.js` are AUTHORED (Code has no
    published specification) and held by smoke75 and `tools/cs_diff.mjs`
    instead (invariant 104). For the generated ones, use `--format-existing` only for a payload-preserving format pass.
    The IT units not taken (F203, F205) are left out by the generator
    (`IT_NOT_TAKEN` in `tools/gen_data.py`; `--scope-it` applies it to the
    checked-in payload), so no reader filters them. Maths refs are P1–P10,
    S1–S5 (Statistics) and M6–M9 (Mechanics): Edexcel numbers Paper 3 as one
    run, so Mechanics keeps its section numbers and takes "M"
    (`MECH_SECTIONS`; `--mech-refs` applies it to the checked-in payload).
    Stored state named by an old S6–S9 ref is renamed at the store's own
    gate (`scrubLegacy` → `renameRefs`, so boot, import and every cloud pull)
    and topic attachments once per boot (`KOS.attach.renameRefs`).
25. Authored content keys target visible leaf refs only. Callout objects need two
    closing braces; validate every edited JS file.
26. Classes are presentation only and carry the `k-` prefix; logic and tests
    read `data-ui` hooks, ARIA/native state and `data-state` (smoke55 refuses a
    legacy name, a `[data-ui]` selector, a colour literal outside tokens/themes
    and a raw px outside `tokens.css`). Keep the four subject hues (invariant 103). Extend
    shared tokens/components rather than hard-coding a page patch.
26a. Graphite (= Atelier Dusk, `css/tokens.css`) is the default;
    `css/themes.css` holds Atelier Dawn (its light twin) and the 23 shop
    themes as colour-ROLE overrides only (design part 2, frames 21a–21h).
    Every derived token in `tokens.css` is written relative to a role
    (`oklch(from var(--crimson) …)`, chroma scaled), with offsets that
    reproduce Graphite exactly, so a theme re-tints it without restating
    it; only Dawn restates the few tokens bound to a dark ground. A theme
    block applies to `:root` and to any element carrying `data-theme` (a
    shop card's live miniature). The theme on screen is
    `KOS.governor.effectiveTheme()`: a shop "Try on" (transient — it ends
    when the shop is left and is never saved), else "Follow the system"
    (`g.themeFollow`: Dawn while the device is light, the chosen theme —
    Graphite if Dawn is the choice — while it is dark), else the choice
    (`g.theme`). The choice and the follow flag sync; amber, green, red,
    gold and the medium hues are the same in every theme. STATUS IS NOT THE
    ACCENT: overdue, late, Critical and error states read `--alarm`
    (`-soft`/`-ink`/`-wash`, from the fixed `--red`) and the Critical washes
    derive from `--red`; `--crimson` is the theme's accent and a status
    painted in it turned teal or white in a shop theme. Markup marks such a
    chip `data-tone="danger"`.
26b. Theme variants target `:root[data-theme="..."]` as semantic-token
    overrides only; unknown legacy ids map to the default.
26c. `KOS.imageCrop` is the only crop/focal workflow. Persist source and
    `{x,y,zoom}` separately; cancel/reset do not write.
26d. Study statistics and formatting are derived once in `hub.js`; every surface
    reads the same functions and a bar describes the value printed beside it.
26e. A stored topic link is a `"sid:ref"` string, and a record's links are ONE
    field, `refs`, passed through `KOS.spec.normaliseRefs()` by the owner's
    normaliser (assignments, calendar events, Exams & Papers, Focus sessions
    and the session ledger). A unit or parent pick is stored as picked and
    read as its leaves (`KOS.spec.resolve()`); an unknown ref is dropped and
    an ambiguous bare ref is never guessed. Where an older reader needs one
    topic, `subject`/`ref` are DERIVED from `refs` (the first leaf) on every
    write. Pre-1.1 shapes (`topics` pairs, a lone `ref`) are migrated once at
    boot and stay readable through each owner's `refsOf()`. Every form that
    names topics uses `KOS.topicPicker` (Assignments, Exams & Papers, Focus,
    the Calendar event and exam, the Pacing row); it writes nothing and an
    owner whose contract is leaves only expands on save. Above the units sits
    the PAPER level (`KOS.spec.papers`): CS "Paper 1"/"Paper 2", Maths
    "Pure"/"Statistics"/"Mechanics", synthetic nodes whose refs collide with
    nothing; IT's units are their own papers, so the picker offers its units
    there. A paper pick is stored as picked and resolves to its leaves.
26f. `state.itUnits` is the one IT unit record (per-unit `status`
    done/sitting/not-taken, `raw`, `ums`, `series`, `year`, `date`), behind
    `KOS.itUnits.normalise*`, seeded once like the plan. `js/data/it-grades.js`
    is the one table of unit scales and grade boundaries, taken from the
    specification (p. 91): a unit is graded D 48 / M 36 / P 24 UMS and has no
    D*; H019 is 108/96/72/48 and H119 270/240/180/120. A boundary not checked
    against OCR would say `confirmed: false` and be reported provisional.
    Unit grades, the aggregate and "marks needed" are derived only in
    `KOS.hub.it`; a stored UMS (the results slip) wins over the straight-line
    raw conversion, which is flagged an estimate because OCR converts pro rata
    between each series' own boundaries; a
    not-taken unit counts and prints nothing (invariant 77). Study state keyed
    to a unit that left the specification is pruned at boot; the session
    ledger is history and is kept. Zero Governor traffic.
27. Navigate via `KOS.show()`. Assignments, reminders and events each have one
    canonical store; other surfaces derive from them. Use `KOS.workspaceTabs` for
    Review and Sync. (The Planner's Planner/Goals switch is gone: Goals is a
    Productivity page and the Planner is the Collection's Wishlist, 27a/27n.)
28. Vault editors register in `KOS.mediaEditors`; hooks register in
    `KOS.mediaEditorHooks`. Never wrap the dispatcher.
29. VN CG gallery is a counter only; content warnings are manual.
30. Vault hero selection/banner/crop lives in `hero.<module>` kv, not on the entry.
    VN and Games heroes are upload-only; no new network fallback.

### Cloud sync (31–36)

31. Cloud is replication outside the Governor and media push systems. Local save
    succeeds independently; signed-out/offline use remains complete.
32. `syncId` and `fileId` are the cross-device identities. Every local deletion
    records a tombstone; applying a remote deletion never requeues it.
33. Remote timestamps are server-generated and no client ever compares wall
    clocks. Sync is push-then-pull. The state document is reconciled by a
    THREE-WAY MERGE (`js/core/cloudmerge.js`) against the last document this
    device and the cloud agreed on (`cloudsync.base.<uid>` kv): records merge
    by id (additions from both sides survive, a deletion on either side wins,
    a record edited on both keeps the later `updatedAt` field by field), gold,
    XP and HP are additive against the base, owned cosmetics union, keyed maps
    merge per key. Same-leaf edit wars go to the local side. The push is a
    compare-and-set on `__seq`; a lost race fetches the cloud copy, merges and
    retries. The engine never asks the user which copy to keep.
33a. Ids are per-device counters, so two devices can mint the same id for two
    records. The merge detects that (same id, absent from base, different
    origin), re-keys the LOCAL record past every id in play and rewrites every
    reference it knows (`RECORDS[].refs`). Adding a record array or a new
    cross-reference to the state means adding it there. Topic links (`refs`,
    invariant 26e) are spec keys, not record ids, so they are not listed
    there; a record field named in `SET_FIELDS` (`refs`) merges as a set
    against the base instead of as one leaf. An ORDERED list under an
    `ATOMIC_PREFIX` path (the Shrine's tie orders) merges whole — a conflict
    is one leaf — because an element-wise merge of an ordering can double
    one item and drop another.
33b. `focus.active` is per-device like `state.ui`: a running timer is a live
    process, not data, and must never land on another device.
34. Empty remote state cannot overwrite meaningful local state. First link is
    automatic in every case (adopt an empty device, upload to an empty account,
    merge two histories with no base); a restore/rebaseline is the only
    unconditional overwrite and it preserves tombstones. A successful push
    broadcasts a data-free "changed" note on a Realtime channel so other open
    devices pull within seconds; the timers remain the safety net.
35. The publishable key is public; RLS is the boundary. Never commit/log a token or
    service-role key. Cloud sessions and sync metadata stay out of backups.
36. Attachment metadata syncs automatically; binary upload is explicit. Only an
    attachment delete removes the remote object.
36a. A no-op merge never restamps `updatedAt`. No provider offers a since-cursor,
    so autosync re-reads whole lists and every row re-enters `bulkUpsert`; `merge()`
    compares material fields and keeps the stored timestamp when nothing moved.
    Without it the entire vault reads as dirty, re-uploads and echoes back. A real
    change must still restamp.
36b. An idle cycle never downloads the state document. `fetchStateHead` reads `__seq`
    and `updated_at` through a json-path select and fetches the document only when
    those scalars justify it. It fails soft in both directions and latches the
    fallback, so a backend without the probe wastes one request per session.
36c. Background cycles are safety nets, not the sync path: cloudsync 15 min, autosync
    30 min. A real local change schedules a cycle through `noteChange` and focus
    triggers one; do not shorten the timers to make sync feel faster.

### PWA, responsive foundations and shared primitives (37–50)

37. The service worker never caches APIs or non-GET requests. Same-origin statics
    are stale-while-revalidate; a navigation serves the `index.html` cached with
    that worker's own version (network only when none is cached, and always on
    local dev hosts), so a page never pairs a new shell with the previous
    version's scripts; a deploy arrives through the waiting worker. Shell
    precache derives from `index.html`.
38. `skipWaiting()` runs only after the user confirms. Bump `sw.js` `VERSION` for
    every asset deployment; the app works without a service worker.
39. Persistent storage is requested sparingly and never promised. Background Sync
    is an enhancement, not the correctness path.
40. Phone composition begins at 700px: bottom tabs, canonical tree drawer, bottom
    sheets, 16px inputs and safe-area support. Generate icons with
    `tools/gen_icons.mjs` (the header's bloom on
    the Graphite ground; never hand-edit the PNGs).
41. `KOS.calendar.normalise()` is the event schema gate; `state.calendar.v` is not
    placed in store defaults. `time` remains the start-time field.
42. Event alerts are per-record. New exam/deadline defaults are applied only in
    `addEvent()`, never by normalisation.
43. Recurrence is computed from one record, never materialised into copies.
44. Countdowns merge canonical calendar deadlines and assignment reads; assignment
    and reminder chips are derived and never written as events, and so are
    the Exams hub's start-by chips (kind `startby`, hidden per device like
    the other derived chips).
45. Add/edit uses one event modal. A study block links by assignment id and copies
    nothing; validate before writing and keep Delete separate from Save.
46. Calendar category colour flows through `--ev-hue` everywhere.
47. Only five width breakpoints exist: 1240, 1080, 860, 700 and 560. Reflow other
    needs intrinsically; feature queries are not extra breakpoints.
48. Within a component, media tiers are written widest-first.
49. `KOS.ui.openDialog()` is the only modal insertion route. It owns name, modal
    semantics, focus trap/restore, scroll lock and Escape. Danger dialogs focus
    Cancel and never confirm on Enter.
50. Repeated UI uses `KOS.ui.tabs`, `emptyState`, `statTile`, `scroller`,
    `pageHeader`, `sectionHeader` and `num`. Horizontal overflow must be declared.
    The compact section `<nav>` is the sole scroller exception: preserve its nav
    landmark inside one external scroller shell. A rendered notes table is
    wrapped by `KOS.content.typeset` (`scrollTables`), a tab stop only while
    it overflows (`scroller({tabWhenScrolls})`).
50a. A page description is the page header's sub-line
    (`data-ui="ui.page-sub"` > `part.board`, 14px on `--muted`), and
    `KOS.ui.pageHeader({sub})` emits exactly that. It is one line, not a
    paragraph: rules a reader needs once belong in Help & Guide, not in prose
    the page re-teaches on every open.
50b. A page's in-page workspace switcher rides the page header's action slot
    (`pageHeader({actions})`, or the second child of `.dash-head`), as Planner
    and Sync do. Never restate the SECTION nav in-page — Reminders, Habits and
    Calendar are already the Productivity strip, and offering the same three
    destinations twice 60px apart is the drift the tabs primitive exists to
    stop. Week-scoped actions belong with the week, not in the page header.
50c. Three figures do not need three card-sized boxes. `statTile` is for a
    genuine metric strip; a short set of week/page facts belongs on the owning
    section header's sub-line, still under the invariant 77 zero rule.

### Category 7 Study and Collection (51–63)

51. The specification spine is Study's only section list. It owns expansion,
    current-location marking and the compact overlay drawer.
52. Topic pages are content-first: one header, one static study-nav row (it was
    sticky and covered the text it introduced) and one inspector as the sole
    state surface. Do not duplicate counts/mastery.
53. Home asks “what next?” from canonical recommendations and keeps empty states
    compact; do not restore decorative fold-filling panels.
53a. Home's Focus card has its own ladder (`KOS.homeFocusPlan`), never the
    review queue and never an in-class item: a calendar study block from 30
    minutes before it starts until it ends (goal = its length), an exam
    inside its kind's lead time (`KOS.calendar.EXAM_LEVELS`: real 7 days,
    mock 5, end-of-topic 3, retrieval 1; goal = that kind's revision time,
    counting only time FOR that exam — a session started from its card or
    one on its linked topics, never a bare timer),
    then the Exams hub's two rungs (a deadline whose milestone has gone
    overdue, "Deadline at risk"; then an assessment whose start-by is
    today, "Start today · advisory"),
    an open assignment due within 7 days (goal = what its estimate has
    left), the next exam within six weeks, then the plan/reading with the
    2-hour daily goal. An exam's kind is `examLevel`, kept on exams only;
    one saved without it reads its kind from its title.
54. Study and Home use shared derivations and preserve navigation/focus on redraw.
55. Mangaka owns its compact discovery grammar; do not restore the old permanent
    filter wall.
56. All four vaults use the shared `medview` shell/editor/filter/action contracts.
57. Collection Overview summarises the vaults without becoming a second vault or
    duplicating provider controls.
57a. The Shrine's order for tied scores is per score in the SYNCED state
    document, `state.media.shrine.order["<score>"] = [syncId, …]`
    (`KOS.media.shrineOrder`); only the Shrine's module/sort filters are per
    device. It moves titles only inside a run of EQUAL scores, and only under
    the score sort: stored titles first in their order, then any title that
    joined the tier later, at its end. `apply()` is a pure read.
58. Collection filters and action surfaces move canonical nodes on compact screens;
    they do not clone state or logic.
59. Image/hero actions remain with the owning editor or toolbar, not every image.
60. Vault hero finish is shared across modules; VN/Games remain network-free.
61. Placeholder hue is deterministic from title, with no canvas/network work.
62. Taxonomy display groups the fields where they are read; it does not invent a
    second schema field.
63. `KOS.media.progressText/progressPct/progressFill` own media progress
    formatting and the bar: a known total is the fraction, a series still
    releasing (`current > 0`, no total) is a half-full `open` bar whose title
    says so, a Books row read by the volume (no chapters, `volumes > 0`)
    counts volumes against the series' volume count the same way, nothing
    started is no bar. `progressBar()` is the ONE card bar — every vault
    card appends it, none draws its own. Charts use labelled axes/marks, an
    11px label floor and honest low-data states.

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
    even a fork. `state.ui.editing` remembers an open editor per
    device so a redraw reopens it. Content blocks may carry an `id`, which the
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

### The AniList mirror (90–94)

90. Anime and the DIGITAL half of Books are a 1:1 mirror of the AniList lists.
    Every AniList pull — "Sync now" and the autosync cycle alike — runs
    `bulkUpsert` with `KOS.media.mirrorOpts(module)` (`replace.mirror`): a
    row the list no longer carries is removed whatever its `syncSource`,
    rows sharing an `anilistId`/`malId` fold into the first (local layer
    unioned by `foldLocal`), removals record cloud tombstones, and an EMPTY
    pull never mirrors. There is no import mode to choose for AniList.
91. The physical shelf is outside AniList's reach: a Books row with volumes
    survives the mirror, and a Books row with no provider identity at all
    (shelf-only, hand-made) is never touched. The Books Digital lens lists
    `syncSource === "anilist"` rows only; the Physical lens lists owned
    volumes whatever the source.
92. Anime and mirrored Books rows have no manual create, no metadata edit
    and no Delete in the app: the editor shows AniList's facts read-only
    (`data-ui="vault.ro"`, empty facts omitted) and edits only list state (pushed back)
    plus the personal layer (favourite, notes, tags, mood, shelves, lists,
    cover position). "Find new" creates on AniList FIRST and refuses a
    local-only row when AniList declines; a hand-made book must carry a
    volume. VN keeps its local fallback because VNDB blocks browser writes.
93. The cloud media pull matches a remote row with no local `syncId` by
    provider identity (`vndbId`, `anilistId`, `malId`), folds it with
    `KOS.media.mergeRows`, keeps the lexically smaller `syncId` (so every
    device converges) and tombstones the loser. Two devices each pulling
    AniList must never yield two rows. A one-time `maint.dedupeAnilist`
    boot pass folds pre-existing duplicates.
94. The display title is AniList's English title, romaji when there is
    none (`KOS.anilist.pickTitle`); both spellings ride in `extra` and
    `mediadb.query({search})` matches either plus the author. The
    overview's schedule reads `inProgress` titles only; the Seasonal view
    opens on what is in progress for the current season and on every
    status for any other (a toggle switches), ordered in progress, on
    hold, completed, dropped, planned (review B). Its hero carries one
    credited piece of scenery per season (`KOS.anime.SEASON_META[].art`,
    hot-linked, small sample as the background while the full frame loads)
    or the user's own picture from media kv `hero.season.<SEASON>` (source
    + crop, through `KOS.imageCrop`; per device like every hero pick).

### The notification centre (95–98)

95. `state.notify` is ONE ledger of things that happened TO THE USER
    (`items`, natural string ids `kind:record:occurrence`, capped at 200
    and 45 days) plus `read` and `airing` keyed maps. Kinds are calendar,
    reminder, assignment, airing, wishlist, pacing (the plan's carry-over
    notice), focus (the idle watch, invariant 4d), assistant (a
    scheduled message's reply, invariant 71b), reports (a saved week,
    "Your week in review is ready", id `reports:<report id>`), goal
    (invariant 5b, id `goal:<goal>:<event>`), exam (a start-by that is
    today, an overdue milestone, a topic test or quiz tomorrow, exam season
    turning on; id `exam:<assessment>:<event>`, `KOS.exams.notices`) and money (a trial ending
    tomorrow, a bill two days ahead, income a day late, id
    `money:<rule>:<date>`) only; Goals and Money are filters of their own: sync cycles, cloud
    state and repairs are housekeeping, never notifications. Nothing in it re-derives a due date:
    the calendar, reminder and assignment tickers keep their own alert
    rules and once-only `notified`/`alerted` maps (invariant 42) and hand
    each FIRED alert to `KOS.notify.push()`, whose id is the ticker's own
    key, so the feed can never disagree with the toast or repeat it.
96. The two things nobody else watched are watched here: an episode airing
    (`KOS.notify.recordAiring` remembers every WATCHED title's next episode
    from the airing cache; `tick()` announces it once it has aired, even
    after the cache moved on) and a Planner item reaching its release day.
    Airing data is still never written to the vault (invariant 23).
97. The bell in the global header (`#notify-mount`, a `KOS.ui.menu`
    popover) shows the five most recent items; the whole feed is the
    `notifications` view under Archive. Read state syncs with the state
    document (cloudmerge knows `notify.items` as a natural-key array).
98. Device alerts are a per-device opt-in: `state.ui.notifyDevice` AND a
    granted Notification permission, requested from a user gesture on the
    page. They fire only for an item that is new AND fresh on this device
    while the page is not in front, through the service-worker
    registration when one controls the page (an installed phone app) and
    the constructor otherwise; `sw.js` `notificationclick` focuses a client
    and posts `kos-open`, which `pwa.js` routes through `KOS.show()`. A
    CLOSED app is reached only through closed-app delivery (invariant 131):
    a per-device Web Push subscription (`KOS.push.subscribe`, from a
    gesture, needing cloud sign-in and `KOS_ENV.VAPID_PUBLIC_KEY`), with
    the account's switch `state.notifyCloud.on` (synced).
    Filters (`state.ui.notifyMuted`, per device, frame 14b) hide a kind
    from the feed, the bell, the unread count and device alerts while the
    ledger keeps it; quiet hours (`state.ui.notifyQuiet`, a window that may
    run past midnight) hold device alerts only.

### Accessibility, routing and search (64–71)

64. The browser owns history. `router.js` wraps `KOS.show()` and uses hash routes
    for `file://`/static-host compatibility. Back/Forward, browser chrome and OS
    gestures are one stack.
65. A redraw is not navigation: `_nav`/`KOS.rerender()` changes no URL, history,
    focus or announcement. Invalid routes replace with Home.
66. `KOS.a11y.announce()` is the sole live-region route. `#toast` is visible but
    `aria-hidden`; reserve assertive output for required action.
67. A card with interactive descendants is not an ARIA button. Prefer native
    buttons; otherwise use `KOS.a11y.activate()` for Enter and Space.
68. Placeholder/state text is not an accessible name. `el()` omits null/undefined
    attributes rather than stringifying them.
69. Increase actual visual hit areas (32px, 44px for coarse pointer) without
    overlapping invisible pseudo-targets. Dense calendar chips use the documented
    24px-with-spacing exception. The touch minimum raises HEIGHT for every
    button, so a round control must raise its width too (a circle, never a
    28×44 oval) and a `.k-btn` never narrows below 44px; a tiny inline mark
    (a chip's ✕, a tick) takes the dense size instead of stretching.
70. Use shared `--z-*` tokens and account for ancestor stacking contexts.
71. `KOS.search.run()` is a pure cross-domain disclosure layer. It searches user
    study/organisation/Collection data but never credentials, provider kv/logs,
    sessions or Assistant audits; async results revalidate the active query.
71a. The Assistant has tools for every domain (`js/core/aitools.js`), and the
    same privacy line: no tool reads credentials, cloud sessions or audit
    logs. A change to a topic's material (`study_edit_*`, `study_set_spec_break`,
    `study_quick_note`) is consequential: it waits for the approval card, which
    binds to the topic's fork (an edit made elsewhere first invalidates it).
    The system prompt carries the feature map. A tool-free answer to a
    question that asked for no change ends where the answer ends: a closing
    "I have not made any modifications…" line is stripped
    (`stripNoChangeTail`); when a change WAS asked for, that truth stays.
    One online request carries at most `LIMITS.cloudTools` tools, which IS
    `ai-chat`'s `MAX_TOOLS` (smoke27); past it the tools are ranked by
    category and view and cut, never sent whole. A retired model id
    (`RETIRED_MODELS` in `ai.js`) moves to its successor on read. A
    provider that answers "overloaded" (HTTP 503) ran nothing and is retried
    once, never after a tool ran.
71b. A scheduled message (`state.assistant.schedules`, synced; cloudmerge
    keys it on its random string `id`) is sent at its time while the app is
    open, or on the first open later THAT day — a day never opened is
    skipped (invariant 98: no push server). Its run is `readOnly` (only
    `read` tools are offered, any other call is refused, so navigation
    never moves the screen) and `isolated` (the live conversation's
    in-memory history is neither read nor written). One run at a time,
    never while the user's own request runs; the day is CLAIMED (synced)
    after a pull and before the model is called. The reply is kept on the
    schedule (`last`), in its own conversation when signed in, and pushed
    as an `assistant` notification. "Run now" does not claim the day.
    With `state.notifyCloud.serverRuns` on, the SERVER owns every run
    (invariant 131): a device never runs a schedule itself, the runner
    answers from the published brief with no tools (one metered request,
    `runner/model.ts`; an Ollama route cannot run there and says so), and
    the device takes the reply in through `KOS.push.pull` →
    `KOS.ai.schedule.applyServerRun` (`lastRun`, `last.server`, and the
    ledger's own `asst:<id>:<day>`, once).

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
    the app's OWN, not the report's or the project file's. Nothing changes
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
    file paths relative to the user's folder. Examiner's reports are saved
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
    and `set-<ref>` are a leaf's subtopic pack and practice set. A timed session is per device
    (`state.ui.examPaperSess`) and starts only on Start; extra time is
    the assessment's own, else `prefs.extraTime`. The Companion is
    ASSEMBLED on read (`KOS.examCompanion`) from the scope's notes, their
    callouts (formula, memorise, mnemonic, miscon, warn), items, cards,
    labs, the playbook and the report notes — nothing stored, nothing new;
    the rapid drill is self-marked and rates nothing.
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

### Japanese (112–118)

112. The subject is `ja` in `KOS.subjects` (not an exam subject, hue `--ja`, 朱); it is live only
    once `KOS_DATA.ja` loads, so a backend release shows nothing.
113. A FACET is one item × one skill (`state.japanese.facets["<item>|<skill>"]`), scheduled through
    `KOS.fsrs` with `KOS.srs.weights()` and the target retention (invariant 111). Its grade is
    DERIVED from the validator's verdict, hints and time (`KOS.jaSrs.gradeOf`), never chosen; a
    self-marked result moves nothing. Facets unlock in order: words and grammar start with R and
    L, W (and S for a word) only once R holds a week, and S only for a lesson's production set.
    Two facets of one item never share a day unless both are over two days overdue; 8 lapses set
    a facet aside. A facet merges WHOLE in the cloud merge: changed on both devices, the one
    reviewed later wins every field. Every rating writes one review-log row (`src: "ja"`).
114. Validators (`KOS.jaValid`) are pure and return one of four verdicts — correct, accepted,
    near, wrong — with a diagnosis; nothing is AI-graded. A new exercise ships only when its
    expected answers pass `tools/ja_valid_check.mjs`.
115. Personal media never leaves the device (saved lines in IndexedDB only; never synced or in a
    backup as binaries).
116. PAY ONCE (`KOS.ja.award`, type `ja`): a review session is ONE ledger entry paying +1 XP a
    passed facet, at most 30 a day; a lesson's first finish 15 XP, 2 gold, +3 HP; a checkpoint
    (80% in every skill it tests) 60/15/+5; a stage gate 150/40/+10. Self-marked work, input
    tallies and mining pay nothing; immersion pays only through Focus. Reads (`due`, `planDay`,
    `skills`, `timeline`, `peek`) write nothing.
117. The timeline is a derived projection: "calibrating" under two weeks of history, then a
    RANGE (rate ± one standard deviation, at least ±15%), never one date, never stored.
118. Generated data carries its attribution: `js/data/ja-strokes.js` from KanjiVG (CC BY-SA 3.0),
    regenerated by `tools/gen_ja_strokes.mjs`, never hand-edited.

### Routines and the Daily Review (142–149)

142. ONE ROUTINE RECORD. A habit is a one-step routine. `state.routines`
    (synced, random string ids, `KOS.routines.normalise`) is canonical; its
    log is a keyed map `"<routine>|<routine day>"` that merges per key and
    per step; the first tick of a day freezes the steps into `snap`, so
    editing a routine never rewrites a past day. Habits moved in once at
    boot under deterministic ids (`h:<id>`); `state.todo.habits` is kept,
    frozen, for a rollback, and every older reader goes through
    `KOS.routines.habitsView`.
143. ROUTINES PAY ONCE. A routine's completion (every required step, or
    its minimum) pays `KOS.governor.routineAward` once per routine day,
    logged as a `todo` session carrying `metrics.routine`; steps, rest
    days, on-demand routines (About to Study) and unticking pay nothing; at
    most 8 rewarded completions a calendar day. A completion is activity
    for the day, never study.
144. REVIEWS READ, OWNERS WRITE. A review stores only its own state
    (`state.dayReview.days`); everything else it changes, it changes
    through that record's owner at the moment you act, with Undo. It keeps
    refs, never copies. Zero Governor traffic; no review has a streak.
145. ONE REVIEW ON SCREEN. `KOS.dayReview.due(now)` is pure and offers at
    most one review; missed earlier slots fold into it and a passed slot
    is never offered. It opens by itself only once a review has been
    opened at least once, only on the first open inside its slot, and
    never over Focus, a dialog, the Exam Room or a deep link — otherwise
    it waits as the header chip. Skip, Later and Esc never penalise.
146. TEMPLATE FIRST. A review's template words render at once; Kurenai's
    (the default) replace them when they arrive, from one request with
    `KOS.dayReview.payload` (titles, times and counts; never a note, card
    text, an amount, mood, energy or chat), printed exactly by "What is
    sent". Any failure keeps the template. Kurenai never picks, triages or
    ticks.
147. WHERE IT SHOWS IS DERIVED. A record's surfaces (Calendar, Countdowns,
    Today, the reviews, Home) follow from its own fields; no form asks
    where something appears. An assignment counts down by
    `KOS.assignments.isMajor` (coursework, NEA or project, High, 3 h or
    more, due within 3 days); Pin and Unpin on the record are the one
    manual choice (`countdown: "pin"|"hide"`). Pacing's unticked rows show
    in Reminders' Today as "From your plan", derived, never copied.
148. THE ROUTINE DAY. Routines and reviews use the routine day
    (`dayStart`, default 04:00). Last night's evening routine stays open
    until the Morning Review closes or noon: a late tick, or a step checked
    in the morning, counts for that night and pays once into the day it
    was ticked. The session ledger, streaks and the Governor keep the
    calendar day (invariant 4).
149. TODAY IS A READ. `KOS.today.build` is pure: it calls the owners'
    reads, writes nothing, and is the one source for the reviews, Home's
    three and the Assistant's day; its `next` is Home's Focus ladder
    (invariant 53a), never re-derived.

### What reaches a closed app (131)

131. THE DEVICE COMPUTES, THE SERVER DELIVERS (roadmap 5.7,
    `docs/server-runner-plan.md`). `KOS.outlook.build` is a pure read: the
    next seven days of notices under the ledger's own ids — the calendar,
    reminder and assignment tickers' `forecast(from, to)` (each ticker and
    its forecast share one `notice()`), and `KOS.exams`/`KOS.money`/
    `KOS.goals` `notices(day)` at the morning time (`ui.notifyMorning`,
    08:00; reached/missed goals are never forecast) — with this device's
    muted kinds, Exam Season's hold and quiet hours applied (a day notice
    waits for the window's end, a short alert inside it is dropped), and
    NO money figure (`notices(day, {hide: true})`); plus the brief, the
    read tools' answers for the week (never notes, card text, amounts or
    chat). `KOS.push` publishes it to `kos_outlook` when its hash changes
    (at most every 5 minutes, at least every 6 hours) with the schedules
    and model route only when the server owns runs, beats presence
    (`seen_at`) every 2 minutes while a page is visible, and pulls
    `kos_runs`. The `runner` Edge Function (pg_cron every 5 minutes,
    `CRON_SECRET` compared in constant time, `verify_jwt = false`) reads
    only `kos_outlook`, `kos_push_subs`, `kos_push_sent` and `kos_runs`,
    never `kos_state`, media, files or a credential: it holds every push
    while a device was seen in the last 5 minutes, drops an item 30
    minutes late, sends each item once (`kos_push_sent`) as an RFC 8291
    payload signed with VAPID (WebCrypto, no library; the private key is a
    function secret), deletes a subscription a push service calls gone,
    and claims each due schedule in `kos_runs` before its one request.
    `sw.js` shows a push under its id as the tag. Zero Governor traffic.

### Reports (99–102)

99. A media row carries its own ACTIVITY JOURNAL (`journal: [[ts, kind,
    from, to], …]`, `mediadb.js`): kinds progress (Anime/Books), volumes,
    status, score, route, chapter and hours (VN/Games journal the source,
    never derived progress, invariant 10). `put()` appends what the save
    changed against the stored row, and a bulkUpsert merge what the pull
    moved; same-day steps of one kind collapse, so a step taken back
    cancels out. Inserts are silent (a first import is not activity), a
    no-op merge appends nothing (invariant 36a), enrichment never moves
    it. A row arriving with events the store has never seen (a cloud pull)
    UNIONS its history rather than appending a second account, and a fold
    (`foldLocal`, `mergeRows`) unions both. Capped at 200 events and 400
    days; it is not an index, so no DB version.
100. A session entry records what the Governor paid it (`award: {xp,
    gold}`, written in `onSession`, zero when forfeited): "earned this
    week" is a sum of awards, never a difference of balances that
    purchases and merges also move. The Assistant keeps a daily TALLY in
    `state.assistant.tally["YYYY-MM-DD"]` (`c` chats, `s` scheduled sends,
    `a` areas by tool category, once per request): counts only, never
    text, 400 days.
101. `KOS.reportStore` writes the state at each period BOUNDARY (a Monday
    or the 1st of a month) the first time the app is open on or after it,
    and never refreshes it: topic band/status/mastery, the Governor,
    streaks and the Collection's status counts, with `takenAt` so a late
    snapshot says so. A boundary never opened has none. The store is its
    own IndexedDB, `kurenai-os-reports`, derived data only; the snapshot
    taken the day it shipped (12 October 2026) is the baseline.
102. A report is DERIVED once and SAVED: `KOS.report.compute(input, period)`
    is pure, reads only what `gather()` hands it from the single sources
    (invariant 26d), and applies the README's rules at build — a
    supporting zero is absent (77), recall needs 50 reviews, a day chart
    three active days, a persona five Focus blocks, a story without
    evidence is dropped and a week keeps four, earnings are the recorded
    awards or nothing (100), a status move needs both boundary snapshots.
    A week is saved on the first open after the following Monday 07:00
    (`ensureReports`), then never recomputed; only `words` change
    (`setWords`). Weeks since 1 September are backfilled; one from before
    the first snapshot is `rebuilt` (no status moves, no invented ranges)
    and an empty one is not saved. Words: `KOS.reportWords.template` is
    deterministic; comparisons go through `compare()` ("same as", "new
    this week", never a bare 0 or "+∞%"). Zero Governor traffic.
102a. Reports lives under Home with no rail item (`#/reports`, the
    Reports page 24a; `#/reports/week/<start>`, one week 25a;
    `#/reports/week/<start>/<study|focus|collection>`, its full overview
    25b–25d). Every card's "Full overview ›" opens a page inside Reports,
    never an app page. The pages only READ saved facts: a render writes
    nothing (smoke56, smoke70) and selecting a past report swaps the view
    without recomputing; the Collection filter, layout and sort are per
    visit, never stored. A report's own clicks may write (Next up's "Add to
    plan" adds a plan row). The words in full (headline, narrative, the
    Template | ✦ Kurenai switch, Share/Export) are read on the Reports
    page; a report's own page keeps only the headline, in its story hero
    beside ▶ Play and the words pill (25a). No page leaves dead space: a
    grid row's last card widens to close it (`pack`), uneven cards deal
    into measured masonry columns, and of two side-by-side columns the
    shorter rides along (sticky). It is reached from the bell (kind `reports`,
    invariant 95), the Home card, Home's Study hours card and search.
102b. The words are the template's unless the user picks ✦ Kurenai for
    that report: ONE `KOS.ai.chat("generation")` request carrying
    `KOS.reportWords.payload(rep)` — totals only, never notes, card text,
    topic or title names, or chat history — and "What is sent" prints
    exactly that payload. Generating is transient (skeleton lines,
    Cancel; a reply after Cancel is ignored); a failure falls back to the
    template in place with a calm note and the switch on Template, so a
    headline is never empty; written words are saved through `setWords`
    (facts untouched) and kept when switching back to Template.
102c. The story (`KOS.reportStory`) draws the saved `facts.stories` list
    as a dialog: 7.2 s a story, scaled by a per-device speed
    (`state.ui.reportSpeed`); ← → / taps / swipes move and resume, Space
    pauses, a quiz waits for a guess that is never stored, reduced motion
    shows each story finished. The share card and export
    (`KOS.reportShare`) are made on the device from the saved report; the
    Collection's titles are OFF by default in every format. The Home card
    sits in Home's middle row (Study hours · the report · the week's plan,
    under Up next · Today · Upcoming) and shows the newest report as the
    full card: "New" until its notification is read (by a click, "Read
    the report" or the bell, never by a render), and never shrunk to a
    row after reading; other reports new that morning list under it. With
    none saved the slot is hidden and the plan takes its column.
102d. Months, terms and years are saved like weeks, on their first
    morning (a month on the 1st, a term the morning after its last week, a
    year on 1 September) and built by the same pure `compute`. A TERM is a
    run of SCHOOL weeks (`schoolWk`) split by two or more weeks without one
    — the personal plan studying through Christmas does not join two
    terms. The longer periods add mastery by unit (from the two boundary
    snapshots; units that did not move are left out), results dated in the
    period with the IT units still to sit, the plan against class from the
    braid, weakest/strongest from 20+ reviews, the strip of their saved
    weeks or months, records and milestones (a year). When the session
    ledger (2,000 entries) no longer reaches a term's or year's start, the
    headline totals ROLL UP from the saved weeks/months and the report says
    so (`rolledUp`). One study day in a month is marked, not charted (24g).
102e. Saved reports and snapshots replicate to the owner-only table
    `kos_reports` (`KOS.reportStore.syncCloud`, after each saving tick and
    a words change): local first (invariant 31 — signed out or in a review
    namespace nothing is sent), pull-merge-push with a per-item stamp in
    the media kv (`reports.sync.<uid>`) so nothing is echoed. A report on
    two devices converges on the FACTS of the copy saved first and the
    WORDS changed last (`words.changedAt`); a snapshot keeps the one taken
    first. The facts are derived data only — no credential ever rides it.

### Responsive integration and visual release quality (72–79)

72. `mobile-shell.js` moves canonical search, filter and section controls into
    dialogs and restores them. JS-dependent hiding is gated by
    `:root[data-shell="ready"]`, set only after every enhancement mounted, so
    the unenhanced fallback stays usable. Its sheets are the shared
    `k-dialog`, its section strip the shared `k-scroller`, and every node
    carries its own hook.
73. Search behaviour remains in the canonical controller. Mobile presentation may
    call only `dismissSearch({preserveQuery:true})` and `onSearchChosen()`; it never
    races result click/Enter or duplicates routing/ranking.
74. Calendar changes composition, not data, at 700px. Breakpoint redraw waits for
    an open dialog to close and restores equivalent focus or `#main`.
75. `#app` uses `100vh` then `100dvh`; main content reserves one tab-bar height and
    safe area. The phone Focus dock is two rows with measured clearance.
76. A chart needs enough evidence to make a claim. Card Stats requires at least
    three tracked cards and three reviews; otherwise show a useful low-data state.
77. Suppress zero-only supporting facts. Preserve zero when it is the primary,
    decision-relevant value.
78. A spendable balance is formatted context, not a progress bar.
79. Elevation is theme-derived through `--shadow-ink`/`--elev-*` and is for
    floating layers only. Dawn keeps the hierarchy with a warm, soft shadow
    of its own (on a light ground elevation reads from the shadow), never a
    hard-coded black one.

### The integrated weekly plan (80–83)

80. `js/data/pacing.js` is a SEED, not a feed. It was imported once from the four
    Notion databases (school scheme of work, both personal curriculums, IT F201)
    plus the week hub that carries the alignment; `KOS.pacing.ensureSeeded()`
    copies it into `state.pacing` once and is a no-op afterwards, so a user edit
    or a cloud pull is never overwritten by the file that shipped. Nothing in
    this domain performs a network request, and Notion is never read again.
81. `KOS.pacing.normalise()` is the schema gate. A plan row's `refs` are
    generated specification leaves (checked against `KOS.spec`) and are
    dropped if the leaf does not exist; a picker expands a unit or parent pick
    to its leaves before it reaches the row.
    An EMPTY `refs` array is a deliberate statement that the published
    specification does not name that topic — never back-fill a near-enough leaf,
    because the plan would then open the wrong topic page.
82. Pacing stores no progress, mastery or confidence. Coverage is READ from
    `state.progress` through the linked leaves, so the plan row and the topic
    page cannot disagree; the per-row state it owns is a note and the tick
    (`done`/`doneAt`, `KOS.pacing.setDone`) — "I did the week's item" on a
    personal row. A class row's lessons (`lessonsOf`, split from its
    detail) each take their own tick (`sat`, the lesson texts,
    `KOS.pacing.setLessonSat`) and the row is `done` once every lesson is
    sat (Graphite review B) — the plan's own bookkeeping, never a claim
    about mastery. Only a personal row carries over. Pacing is logistics like the Budget
    Planner: zero Governor traffic, zero sessions.
82a. An unticked personal row whose week has ENDED (before today's plan
    week) CARRIES OVER: `carriedInto(wb)` derives it into every later week
    with `weeksLate`, marked behind, until it is ticked or moved
    (`updateEntry({wb})`, the "→ here" action). The record itself never
    changes weeks — carry-over is a read, like recurrence (invariant 43).
    The week we are in carries nothing forward yet; a future week never
    carries anything.
82b. The plan lends itself to the rest of the app by READS only: class
    milestones (Mock, Assessment, NEA Milestone) stand in
    `KOS.calendar.countdowns()` as kind `pacing`, dated by their week, never
    written as events (invariant 44); Home carries the week's tickable card
    (`KOS.pacingHomeCard`, capped at the fold) and "Behind on the plan" in
    the next-action ladder after dated countdowns; the week page lists
    assignments due inside the week; "Remind me" creates one real reminder
    (due the week's Sunday, tagged `pacing`) — a link by text, not a copy;
    the rollover notice `pace:carry:<wb>` is one notification per plan week.
    A class row's lessons are DATED by the class timetable
    (`KOS.pacing.timetable`, read with a default, stored in
    `state.pacing.timetable` only once edited): lesson i on the subject's
    i-th class day, extras on the last, a single lesson on every class day;
    a lesson moved by hand is `lessonDays[text]` (back on its timetabled day
    stores nothing). Home's Today card lists the day's lessons
    (`lessonsOn`); a milestone counts down to its milestone lesson's FIRST
    day and leaves the countdowns once that day has passed.
83. Ahead/aligned/behind/unplanned is set arithmetic over linked refs, measured
    from FIRST contact in the personal plan, and a week whose class rows carry
    no refs makes no claim at all rather than an empty verdict.
84. The plan is fully editable through `KOS.pacing`. A row always belongs to a
    week that exists, and its `wk` number is DERIVED from that week on every
    write (school rows take the school number, personal rows the personal one)
    rather than carried. Moving a week re-points its rows in the same write;
    deleting a week that still holds rows refuses unless the caller passes
    `cascade`. Deletes ask through `KOS.ui.confirm({danger:true})` and Delete
    never shares a control group with Save.
85. The braid is the alignment evidence as a picture, not a second dataset:
    a commit graph, ONE subject at a time, picked by a page-wide toggle
    (`state.ui.paceBraidSubject`, per device) that the diagram and the
    merges table both follow. The subject's spine is class, my plan a
    dotted row beneath it, and every shared spec point a branch between
    the weeks that cover it, packed into depths so crossings stay
    readable; △ marks what class teaches that my plan never schedules. A
    non-scrolling key column names the rows. (Review B tried a two-line
    arc picture; it could not be read at a real term's density and was
    reverted.) The diagram is one `role="img"`; beneath it every plan row
    that met class is a real button in five columns (reference, title,
    when, verdict, Open), which is the keyboard and screen-reader route. A
    row names ONE reference — the shared leaf, or the majority parent when
    it shares several — and its dialog links every leaf. No shared refs
    draws no diagram. The legend names every mark, so the tab carries no
    explanatory header — the long version is a Help & Guide entry.

## Extension notes

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
  `REF_ALIASES` (exact refs only; the kept leaf's own record wins).
  Examiner intel (`intel.js`) is merged the same way. Adding to a merge
  means: the table in `gen_data.py`, `REF_ALIASES`, the sims/generators
  wired to the old refs, the plan seed refs, and smoke65/66's `DONE` lists.
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
- Content may explicitly list `sims`/`gens`; `hub.js` merges and deduplicates.
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
  by the banks.
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

### Navigation hierarchy

- Home: Reports (`#/reports[/<week|month|term|year>]`, no rail item; from
  the bell, the Home card, Home's Study hours card and search).
- Study: subjects, Review, Assignments, Exams & Papers and Pacing.
  Pacing has two identities in one route and they cannot collide, because a
  week is always an ISO date: `#/pacing/YYYY-MM-DD` is the week surface and
  `#/pacing/braid` is the whole-term branch graph, which spans every week and
  so carries none.
- Productivity: Focus, Reminders, Habits, Calendar, Money and Goals.
- Collection: Overview and four vaults, Shrine, Wishlist (`#/wishlist`; the
  old `#/planner` route aliases to it) and Sync.
- Review retains `due` and `cardstats` compatibility routes.
- Sync uses `KOS.collectionWorkspaceTabs()`; transitions still call
  `KOS.show()`.

### Live2D development gate

`js/modules/assistant-live2d.js` is an inert adapter over the static renderer seam.
It contains and downloads no Cubism runtime/model. Its motion/reaction/fps tables
mirror `art-source/assistant/live2d/rig-contract.json`; smoke39 detects drift.
`tools/build_live2d_scaffold.sh` creates structure only and
`tools/validate_live2d_scaffold.mjs` validates it. Never auto-extract layers.

`.gitignore` and `tools/deploy_pages.sh` block Cubism material. Nothing Live2D-
authored may be committed or staged until `LICENSE_REQUEST.md` resolves the
AI/chatbot classification in writing.

## Files to edit deliberately

- Generated specifications: change parsers, then regenerate—never hand-edit output.
- `js/data/pacing.js`: the one-time weekly-plan import. Editing it changes nothing
  for an existing install (the store is already seeded); change `state.pacing`, or
  reset the `seeded` flag deliberately.
- Authored content: `js/data/content/*.js`; examiner guidance: `js/data/intel.js`.
- IT grade boundaries: `js/data/it-grades.js`, from the specification (p. 91).
  A change of specification is a change to that table; nothing else moves.
- Layout (a standing design rule, repeated in every review): a view leaves
  NO empty gaps, wasted space or inconsistent alignment. A block capped at a
  reading width must not leave a dead column beside it — fill the width (a
  side panel, a second column, a grid) or centre it with proportional
  margins. Reuse the app's existing patterns (the study quiz, the task
  editor, cards) rather than a bare new version. Check the 1440 screenshot
  for this before calling a view done.
- Shared visual behaviour: tokens in `css/tokens.css`, primitives in
  `css/components.css` and `js/core/ui.js`, before adding a rule to
  `css/views/*.css`. `css/main.css` is gone and must not come back (smoke55,
  `tools/deploy_pages.sh`).
- `tools/ui-migration.json` lists the rebuilt files; `tools/baselines/render-purity.json`
  and its `.renames.json` record the control parity smoke56 checks. A moved or
  removed control is recorded there, not silenced in the test.
- New views: register under `KOS.views`, add the script in dependency order and
  navigate through `KOS.show()`.
- State/schema changes: update the one normaliser/migration gate and add regression
  coverage before changing presentation.
