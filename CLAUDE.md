# KurenaiOS engineering reference

Despite the historical filename, this is the canonical engineering reference for
any contributor or coding agent. `README.md` describes the product,
`PROGRESS.md` records the current delivery state, and `AGENTS.md` is the concise
execution contract. Keep implementation history in Git rather than rebuilding a
chronological diary here.

> **Standing rule:** before editing or testing any domain, you MUST read its
> corresponding `docs/invariants/<domain>.md` file and verify all cited
> invariant IDs against it. This file keeps only a one-line index of the
> invariants (§ Invariants); the full contracts live in those files, and
> where code lives is [`docs/ownership.md`](docs/ownership.md).

## Current baseline

- What is built, and what is still to do: [`docs/ROADMAP.md`](docs/ROADMAP.md).
  The quality programme's plan is on branch `audit/quality-2026-11`
  (`docs/audit/2026-11/REMEDIATION_PLAN.md`); the Exams & Papers rework is
  `docs/exams-rework-plan.md` (branch `feat/exams-plan` until it merges).
- Production: https://kurenai-os.pages.dev
- Latest release: sw `kos-qol-5` (27 November 2026). Every release
  before it, with what it shipped, its immutable URL and its branch, is in
  [`docs/RELEASES.md`](docs/RELEASES.md), newest first; a new release adds
  its entry there and changes only this line and the next here.
- Service-worker version: `kos-qol-5`
- Required smoke gate: 183 / 183 suites (`""`, 2–156, 160–164 and 180–201) — `npm test`;
  what each suite holds: [`docs/SMOKE.md`](docs/SMOKE.md). New suites on this
  account are numbered from 180 (see `docs/HANDOFF.md`).
- Backend as deployed (20 November 2026, the server-function clean-ups
  EF-01 to EF-08 with `kos-qol-1`; dashboard numbering): `ai-chat` v13,
  `runner` v11 (the `kos-runner` pg_cron job every five minutes, its SQL in
  the gitignored `supabase/runner-cron.sql.local`), `github-token` v7 (the
  GitHub App itself and its `GITHUB_*` secrets are NOT created yet),
  `ext-token` v3 (its `GOOGLE_*` and `TODOIST_*` secrets set), `vndb-ulist`
  v6, `steam-auth` v9 (its callback redirects to the app; deployed with `kos-qol-2`), `steam-owned-games` v7 and `igdb-search` v7, deployed
  with `supabase functions deploy <name> --use-api` (no Docker). Every migration in
  `supabase/migrations/` is applied (the newest `20261118000001`, `kos_attempts`);
  a new one is applied by hand and recorded here.
- Not yet tried against the real thing: Todoist and Google sign-in (RC6's
  bookkeeping is tested on fakes only). FSRS's Optimise stays off until
  1,000 reviews are logged.
- Standing asks: ElevenLabs' free tier holds three designed voices (Akari,
  Yōta, Makoto) — ask the user before a fourth voiced character. Ask before
  every production deploy and before touching the user's real account;
  never write to AniList or VNDB from a test.
- Branches: `main` is the line; branch new work from `origin/main` and
  check `git log` for drift.
- Last milestone tag: `milestone/graphite-ui-rebuild`
- Working from another Claude account or machine: [`docs/HANDOFF.md`](docs/HANDOFF.md)
  and the shared project memory in [`docs/memory/`](docs/memory/MEMORY.md).

## Run, test and deploy

There is no build step or bundler. Classic script tags allow `index.html` to run
from `file://`. Use HTTP for PWA, cloud and browser-audit work.

```sh
python3 tools/dev_server.py 8765       # http.server with no-store, so edits show on one reload
npm install jsdom fake-indexeddb       # test-only dependencies, once
npm test                               # the whole smoke gate in parallel (tools/run_smoke.mjs; --skip, --repeat)
for i in "" {2..156} {160..164} {180..201}; do node "tools/smoke${i}.test.js"; done   # the same, one at a time
node tools/fill_check.mjs              # every figure and part to fill in (5.19): figures compile, SQL runs, predicts run
node tools/gen_moved_cards.mjs         # js/data/moved-cards.js: Maths' several-step cards that live as exam questions (5.19; --check)
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
node tools/gen_lazy_index.mjs          # js/data/lazy-index.js, after changing any file inside a <template data-lazy> block (--check)
python3 tools/gen_badge_small.py       # the Badge Wall's 192 px medal art (assets/app/img/sm), after importing badge art (--check)
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
files to attach, and point the user at the prompt sheet. Creatives' art runs through `art-source/creatives/manifest.json` (prompt
sheet `prototypes/creatives-space/art.html`; import with
`python3 -I prototypes/japanese-space/art_import.py art-source/creatives assets/creatives/img`,
then list each id in `KOS_CR.ART`). Japanese's art
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

The heavy data — the CS, Maths, IT and Code content, the past-paper
index's pack list, the exam Companion and the Rider scaffolds — is still
script tags in `index.html`, in the same places, but inside
`<template data-lazy="NAME">` blocks: inert at boot and loaded on first use
(invariant 168). A test loader evaluates every tag it finds, so a test boot
is eager; `boot({lazy: true})` boots as a browser does.

Every view is registered as `KOS.views.<id> = function (main, arg) { ... }` and is
entered through `KOS.show()`. Do not replace `#main` directly. `router.js` wraps
rendering to maintain browser-owned hash history; `KOS.rerender()` is the
non-navigation redraw path.

### Persistence

- `KOS.store.state` in `localStorage`: study state, UI, economy, sessions,
  calendar/reminders/assignments, planner/goals, the integrated weekly plan,
  the Error Log (`state.errorLog`, merged by id) and Assistant preferences. Shared by every open tab (invariant 33c);
  mirrored to `kurenai-os-statemirror` IndexedDB (the last document, the
  copy before a recovery and any unreadable copy set aside), which becomes
  the primary for the session when localStorage is full.
- `kurenai-os-ledger` IndexedDB: session entries the 2,000 cap trimmed
  (`KOS.ledgerArchive`); in the full backup, never synced.
- `kurenai-os-ja-mined` IndexedDB: mined Japanese lines (`KOS.jaMined`,
  invariant 115); in the full backup, never synced.
- `kurenai-os-backups` IndexedDB: verified checkpoints (`KOS.backup`,
  invariant 1a), the last five kept.
- `kurenai-os-media` IndexedDB: Collection records, non-token media preferences
  and provider credentials in its kv store.
- `kurenai-os-files` IndexedDB: every file added outside the Paper library
  (topics, assignments, assessments, Files, scans, shares), one record a
  content (`hash`), its links and aliases (invariant 150); metadata synced,
  binaries to the private bucket. Your own profile picture and banner are
  records here too (`origin` `profile:avatar` / `profile:banner`,
  `KOS.profilePics`): the state holds only `governor.avatar.file` and
  `governor.bannerFile`.
- `kurenai-os-filetext` IndexedDB: the text read from each PDF, for
  search (derived; kept when a binary is freed).
- `kurenai-os-mind` IndexedDB: Mind's Journal entries and their tombstones
  (invariant 139), replicated to `kos_mind`.
- `kurenai-os-money` IndexedDB: Money's transactions and their tombstones
  (invariant 5a), and each pot's own picture (`pics`); all in the full backup.
- `kurenai-os-reviews` IndexedDB: the review log, one row per rating
  (invariant 111).
- `kurenai-os-attempts` IndexedDB: recorded exam attempts, events per
  part with their marks and imported feedback (invariant 130a); in the
  full backup.
- `kurenai-os-ink` IndexedDB: handwriting — notebooks (`docs`) and their
  A4 pages of strokes (`pages`), invariant 136; in the full backup.
- `kurenai-os-papers` IndexedDB: the Paper library's own PDFs and photos
  (`KOS.examPapers`); never synced and not in the full backup — a paper
  you choose to "Keep in my cloud" is COPIED into `kurenai-os-files`
  (origin `papers:<id>`) and syncs from there.
- Supabase: optional replication layer; never the only successful write path.
- `store.exportFull()` / `importFull()`: state, media, non-token kv and files;
  credentials/sessions are deliberately excluded. THE FILE IS WRITTEN AND
  READ IN PIECES (DI-09, `js/core/backupfile.js`, `KOS.backupFile`, smoke150):
  still one JSON document an older copy reads whole, laid out as a first line
  (every part but the stored files, `"kos_layout":"lines"`) and ONE LINE PER
  FILE, each file's content read in 3 MB slices and made base64 a slice at a
  time into a Blob (`KOS.attach.exportEach`), so no file is ever one string;
  the restore and its confirm read the first line alone and then one file
  line at a time (`KOS.attach.importBegin`/`importOne`). A part that cannot be
  read is NAMED (`missing`: in the file, the export's answer and the
  restore's report) instead of no backup being made (`snapshotFull(cb,
  {partial: true, files: false})`); a CHECKPOINT never asks for that and stays
  all or nothing. The checkpoints themselves (`KOS.backup`) are still one
  string each: the known limit for a very large file set.

### Primary ownership map

Which file owns which contract (the store, the engine, the page and the
suite for every feature) is [`docs/ownership.md`](docs/ownership.md). Read
it to find where a feature lives before searching.

## Invariants

These are release contracts. Their full text lives in one file per domain
under [`docs/invariants/`](docs/invariants/); below is a one-line index.
The historical numbering is kept because tests, source comments and audit
notes cite it.

**STANDING RULE: before editing or testing any domain, you MUST read its
`docs/invariants/<domain>.md` file and verify every invariant ID you cite
against the full text there.** The one-line summaries below are an index,
never the contract. A change that alters an invariant rewrites it in its
domain file AND its line here, in the same commit.

| Domain file | Covers |
|---|---|
| [`core.md`](docs/invariants/core.md) | Governor, Focus, rewards, Money, Goals, Achievements |
| [`sync.md`](docs/invariants/sync.md) | cloud sync, the state document, tabs |
| [`media.md`](docs/invariants/media.md) | the Collection, providers, the AniList mirror |
| [`ui.md`](docs/invariants/ui.md) | UI, layout, routing, a11y, redraws, lazy loading |
| [`study.md`](docs/invariants/study.md) | the curriculum, spaced repetition, content authoring |
| [`spaces.md`](docs/invariants/spaces.md) | Code, Japanese, Creatives, Mind |
| [`exams.md`](docs/invariants/exams.md) | the Exams & Deadlines hub |
| [`ink-files.md`](docs/invariants/ink-files.md) | the ink engine, Files |
| [`productivity.md`](docs/invariants/productivity.md) | notifications, routines, integrations, Reports, the plan |


### `core.md`

*Governor, Focus and rewards*
- **1** Streaks, XP, HP and gold change only through `KOS.sessions.log()`; errors are reversed by one `correction` entry, never a direct write.
- **1a** One-off repairs run through `KOS.repairs`: dry-run plan, hash-approved consent, and a verified checkpoint around the change.
- **2** Gold gates only labs, simulations and uploading your own picture; HP gates nothing, and study material never locks.
- **3** Media and leisure never change HP and feed only the separate rest streak; reading sessions take no distraction penalties.
- **4** Study streak, rest streak and the HP day-activity test are separate derivations of the session ledger; a `todo` tick is activity, never study.
- **4a** `KOS.governor.focusAward` is the one pure definition of Focus pay; history is never re-priced and switching a subject keeps one entry.
- **4b** A Focus session is logged and paid before its review opens; the review may annotate the record but never log or pay again.
- **4c** Page hide banks the live clock with `KOS.store.flush()`; reload is not a pause or distraction, and recovery returns paused.
- **4d** A running study session untouched for 30 minutes is warned, then ends itself after 5 more, paid only for work before the last interaction.
- **4e** Session set-up (mode, length, break, nudge, limit) is chosen only on the Focus page; every other entry point just opens it pre-filled.
- **5** One deliberate bulk or sync action produces at most one session; autonomous multi-provider sync batches rewards and XML import gives none.
- **5a** Money and the Budget Planner have zero Governor and network traffic; amounts are integer minor units and imports are undoable.
- **5b** Goals are a registry of types measured by reading the owning domain's data; repeating goals judge each ended period once and pay nothing extra.
*Achievements, the Badge Wall*
- **161** Badges read their owner's record and never pay or track anything new; progress is never stored, only the earned tier.
- **162** An earned badge tier is never taken back, and the cloud merge treats earned and monthly rollup values monotonically.
- **163** Badge evaluation is quiet and once: owner events re-measure only their badges, first sweeps are silent, and each tier earned is one notification.


### `sync.md`

*Cloud sync*
- **31** Cloud sync is replication outside the Governor and media push; local save succeeds independently and offline use stays complete.
- **32** `syncId` and `fileId` are the cross-device identities; every local deletion records a tombstone and a remote deletion is never requeued.
- **33** Sync is push-then-pull with server timestamps and no client clock comparison; the state document is reconciled by a three-way merge.
- **33a** Assignments, reminders and events take random string ids (old numbers kept, read back by `KOS.store.idOf`); other colliding per-device ids are re-keyed locally and every known reference rewritten; any new record array or cross-reference must be registered there.
- **33b** `focus.active` is per device and owned by one tab through the `kos-focus` lock; it must never land on another device.
- **33c** Many tabs share one state document: saves run under `kos-state-write` with a three-way merge; shared changes use `KOS.store.transact`.
- **33d** A cloud document lands in one step: one tab cycles at a time, the local copy is kept first, and merge and replace run in one `KOS.store.transact`.
- **34** Empty remote state cannot overwrite meaningful local data; first link is automatic and only after a verified checkpoint.
- **35** The publishable key is public and RLS is the boundary; never commit or log a token or service-role key, and keep sessions out of backups.
- **36** Attachment metadata and binaries sync automatically to the private bucket; a `local` file never leaves and only explicit Delete removes remotes.
- **36a** A no-op merge never restamps `updatedAt`; `merge()` compares material fields so unchanged rows are not re-uploaded.
- **36b** An idle cycle never downloads the state document; `fetchStateHead` reads `__seq` and `updated_at` first and fails soft.
- **36c** Background sync cycles are safety nets at 15 and 30 minutes; do not shorten the timers to make sync feel faster.
- **36d** Side stores wrap their sync in `KOS.sideSync.wrap`, record each run's outcome, and pull with a two-minute overlap.


### `media.md`

*Media schema, storage and sync*
- **6** `mediadb.normalise()` is the schema gate; new query axes need a DB version, migration and indexes, and `syncId` stays stable.
- **7** Every database uses its designated store with the data-namespace suffix and is listed in `KOS.stores`; backups exclude every credential.
- **8** Vaults and search never read an unbounded collection; use indexes, cursor caps and 60-entry lazy batches.
- **9** Pull sync owns list state but preserves the manual layer and local crop/source pairs; AniList-held lists follow the pull, app-only lists union.
- **10** VN and Game progress is derived from one source via `mediadb.vnSource()`; never store a parallel progress value.
- **11** Upsert identity order is VNDB, AniList, MAL id, each matched only within the incoming row's module; title claiming is VN-only.
- **12** Push only AniList-owned Anime/Books or VNDB-owned VNs; Games never push and the vault itself makes no provider request.
- **13** Push payloads contain only list status, progress or volumes, and a non-zero score.
- **14** Remote mutations go through `mediapush.js`/`mediasearch.js`; never delete or write favourites or reviews remotely.
- **15** `bulkUpsert()` neither pushes nor logs; callers receive its reward candidates.
- **16** Provider list-state last-write-wins is deliberate and documented, not a bug to fix.
- **17** The reward watermark absorbs local saves before pull absorption, so a push followed by its echo earns nothing.
- **18** VNDB Kana `/ulist` identity is the top-level `id`, not `vn.id`, and only `api.vndb.org/kana` is used.
- **19** Browser VNDB PATCH is CORS-blocked, so signed-in writes relay through `vndb-ulist` and a direct-PATCH failure is never retried as transient.
- **20** The browser never talks to Steam; Edge Functions verify OpenID and only gap-fill, so the manual Games baseline survives.
- **21** Book lookup uses Open Library first and Google Books only as fallback.
- **22** AniList XML ids are MAL ids; honour provider pacing and `Retry-After`.
- **23** Airing data is memory-only with a short TTL and AniList profile reads are read-only and batched.
*The AniList mirror*
- **90** Anime and digital Books are a 1:1 AniList mirror: every pull uses `KOS.media.mirrorOpts`, and an empty pull never mirrors.
- **91** The physical shelf is outside AniList's reach: Books rows with volumes or no provider identity survive the mirror untouched.
- **92** Anime and mirrored Books rows have no manual create, metadata edit or Delete; only list state and the personal layer are editable.
- **93** The cloud media pull matches rows by provider identity, keeps the lexically smaller `syncId` and tombstones the loser, so no duplicates arise.
- **94** Display title is AniList's English title, else romaji; the Seasonal view and overview schedule follow fixed status rules.


### `ui.md`

*Content, UI and Collection composition*
- **24** Generated spec data (`compsci.js`, `maths.js`, `it.js`) is changed only by fixing the parsers and regenerating, never by hand.
- **25** Authored content keys target visible leaf refs only, and every edited JS file is validated.
- **26** Classes are presentation-only with a `k-` prefix; logic and tests read `data-ui`, ARIA or `data-state`, never classes.
- **26a** Graphite is the default theme and Dawn overrides colour roles only; status uses `--alarm`, never the accent `--crimson`.
- **26b** Theme variants target `:root[data-theme]` as semantic-token overrides only; unknown legacy theme ids map to the default.
- **26c** `KOS.imageCrop` is the only crop workflow; source and `{x,y,zoom}` persist separately and cancel or reset write nothing.
- **26d** Study statistics are derived once in `hub.js`; every surface reads the same functions and a bar matches its printed value.
- **26e** A record's topic links are one `refs` field via `KOS.spec.normaliseRefs()`; unknown refs drop and ambiguous ones are never guessed.
- **26f** `state.itUnits` is the one IT unit record; grades and marks needed are derived only in `KOS.hub.it` from `it-grades.js`.
- **27** Navigate only via `KOS.show()`; assignments, reminders and events each have one canonical store that other surfaces derive from.
- **28** Vault editors register in `KOS.mediaEditors` and hooks in `KOS.mediaEditorHooks`; the dispatcher is never wrapped.
- **29** The VN CG gallery is a counter only, and content warnings are set manually.
- **30** Vault hero choice lives in `hero.<module>` kv, not on the entry; a new upload needs the unlock and VN/Games add no network fallback.
*PWA, responsive foundations and shared primitives*
- **37** The service worker never caches APIs or non-GET requests, and a navigation serves the `index.html` cached with its own version.
- **38** `skipWaiting()` runs only after the user confirms; bump `sw.js` `VERSION` on every asset deployment.
- **39** Persistent storage is requested sparingly and never promised; Background Sync is an enhancement, not the correctness path.
- **40** Phone layout begins at 700px, and the 16px field rule lives in the last cascade layer, `floors`, so nothing reintroduces iOS zoom.
- **41** `KOS.calendar.normalise()` is the event schema gate; `state.calendar.v` is not in store defaults and `time` stays the start time.
- **42** Event alerts are per-record, and new exam/deadline alert defaults are applied only in `addEvent()`, never by normalisation.
- **43** Recurrence is computed from one record, never materialised into copies, and monthly repeats keep their original day of month.
- **44** Countdowns and chips for assignments, reminders and start-by dates are derived reads and never written as calendar events.
- **45** Add and edit use one event modal; a study block links by assignment id without copying, and Delete stays apart from Save.
- **46** Calendar category colour flows through `--ev-hue` everywhere.
- **47** Only five width breakpoints exist (1240, 1080, 860, 700, 560); other reflow needs are handled intrinsically.
- **48** Within a component, media query tiers are written widest-first.
- **49** `KOS.ui.openDialog()` is the only modal insertion route; danger dialogs focus Cancel and never confirm on Enter.
- **50** Repeated UI uses the shared `KOS.ui` primitives (tabs, scroller, pageHeader and so on), and horizontal overflow must be declared.
- **50a** A page description is the page header's one-line sub-line via `KOS.ui.pageHeader({sub})`, never a paragraph.
- **50b** An in-page workspace switcher rides the page header's action slot and never restates the section nav.
- **50c** `statTile` is for a genuine metric strip; a few week or page facts go on the section header's sub-line instead.
*Category 7 Study and Collection*
- **51** The specification spine is Study's only section list and owns expansion, current-location marking and the compact drawer.
- **52** Topic pages are content-first with one header, one static study-nav row and one inspector as the sole state surface.
- **53** Home answers "what next?" from canonical recommendations with compact empty states and no fold-filling decorative panels.
- **53a** Home's Focus card follows its own ladder `KOS.homeFocusPlan`, never the review queue or an in-class item.
- **54** Study and Home use shared derivations and preserve navigation and focus on redraw.
- **55** Mangaka keeps its compact discovery grammar; the old permanent filter wall is not restored.
- **56** All four vaults use the shared `medview` shell, editor, filter and action contracts.
- **57** Collection Overview summarises the vaults without becoming a second vault or duplicating provider controls.
- **57a** The Shrine's order for tied scores is stored per score in synced state and moves titles only within equal scores under the score sort.
- **58** Collection filters and actions move canonical nodes on compact screens rather than cloning state or logic.
- **59** Image and hero actions stay with the owning editor or toolbar, not on every image.
- **60** Vault hero finish is shared across modules, and VN and Games stay network-free.
- **61** Placeholder hue is deterministic from the title, with no canvas or network work.
- **62** Taxonomy display groups fields where they are read and never invents a second schema field.
- **63** `KOS.media.progressText/progressPct/progressFill` own media progress formatting, and `progressBar()` is the one card bar.
*Accessibility, routing and search*
- **64** The browser owns history: `router.js` wraps `KOS.show()` with hash routes so Back, Forward and OS gestures are one stack.
- **65** A redraw is not navigation: `KOS.rerender()` changes no URL, history, focus or announcement, and invalid routes replace with Home.
- **66** `KOS.a11y.announce()` is the sole live-region route; `#toast` is an `aria-hidden` queue of up to three rows, its Undo reached by ⌘Z, and assertive output is reserved for required action.
- **67** A card with interactive descendants is not an ARIA button; use native buttons or `KOS.a11y.activate()`.
- **68** Placeholder or state text is not an accessible name, and `el()` omits null or undefined attributes.
- **69** Visual hit areas are at least 32px (44px on coarse pointers) without overlapping invisible targets; round controls stay circular.
- **70** Stacking uses the shared `--z-*` tokens, accounting for ancestor stacking contexts.
- **71** `KOS.search.run()` is a pure read across user data and never searches credentials, provider logs, sessions or Assistant audits.
- **71a** Assistant tools cover every domain but never read credentials or audit logs; topic-material edits wait for an approval card.
- **71b** A scheduled Assistant message runs read-only and isolated, once per day, with the day claimed after a pull and before the model call.
*The redraw policy, the view lifecycle and sessions in progress*
- **164** Background changes reach a page only through `KOS.rerender` naming what moved, and each view declares the state keys it reads.
- **165** A change the page reads is never applied under the reader: task pages hold it behind a chip until a safe point or Refresh.
- **166** Each render has a life: `KOS.show` disposes the previous page first, and navigation closes dialogs and asks before losing unsaved work.
- **167** A session in progress is one ledger entry found by `metrics.sid`, paid only by difference via `KOS.sessions.upsert`, and resumable per device.
*Loading on first use*
- **168** Boot loads the app, not the curriculum: `<template data-lazy>` bundles (content and page modules) load on first use, and anything computed or saved must not miss.
*Responsive integration and visual release quality*
- **72** `mobile-shell.js` moves canonical controls into dialogs only once every enhancement mounted (`data-shell="ready"`), so the fallback stays usable.
- **73** Search behaviour stays in the canonical controller; mobile presentation may call only `dismissSearch` and `onSearchChosen`.
- **74** The Calendar changes composition, not data, at 700px, and a breakpoint redraw waits for an open dialog to close.
- **75** `#app` uses `100vh` then `100dvh`, main content reserves one tab-bar height and safe area, and the phone Focus dock is two rows.
- **76** A chart needs enough evidence to make a claim; Card Stats needs three tracked cards and three reviews, else a low-data state.
- **77** Zero-only supporting facts are suppressed; zero is kept only when it is the primary, decision-relevant value.
- **78** A spendable balance is formatted context, not a progress bar.
- **79** Elevation is theme-derived via `--shadow-ink`/`--elev-*`, is for floating layers only, and never uses a hard-coded black shadow.


### `study.md`

*The editable curriculum*
- **86** Curriculum files are never written at runtime; a user edit forks one topic and kind into `state.edits.topics` and readers take the effective copy.
- **87** A forked or shipped flashcard keeps its schedule key through edits, reorders and deletions; never renumber a card carrying a third element.
- **88** Every fork row carries an `id` (deterministic `s<i>` for shipped rows, random for new) so the cloud merge can fold nested arrays.
- **89** Only the study editor and the append-only quick note change a topic's material; the editor saves against what it loaded.
- **89a** Every hand-ranked list uses `KOS.ui.reorder`, and a reorder is a move inside the fork that keeps the row id and schedule key.
- **89b** Figures and fill-in parts are practice beside the notes: nothing stored, paid or rated, and each must pass `tools/fill_check.mjs`.
*Spaced repetition*
- **111** Every scheduled card schedules through the one pure `KOS.fsrs` (FSRS-6) with `KOS.srs.weights()`; renders never write and scheduling pays nothing.
- **111a** Only a real exam, or a mock with its cap on, whose resolved scope holds a card's leaf can bring a review forward, and it only ever shortens; within 60 days no interval exceeds a third of the days left (3–21).
- **111b** A flashcard's 8th lapse sets it aside into Rework; `KOS.srs.topicMemory` is a pure read that feeds RAG and the topic views.
- **111c** Quiz and exam items are questions with keyed histories and FSRS schedules rated from marks, capped per subject a day and paying nothing.


### `spaces.md`

*Code*
- **103** The subject list is `KOS.subjects`; only CS, Maths and IT are exam subjects, readers ask `ids()` and none hard-codes the list.
- **104** Code content is authored, released a unit at a time and whole; every lesson meets the notes contract and every program agrees with .NET byte for byte.
- **105** Learner code runs only on the device in sealed workers with the network removed and a watchdog; the full runtime is an optional download.
- **106** `KOS.code.award()` is the one Code pay definition: a task's first proven pass pays once, re-runs and seen answers pay nothing, and HP gates nothing.
- **107** A Code lesson's four checks are derived from evidence and written only by `KOS.code.syncChecks`; reading alone never completes a lesson.
- **108** The Daily 20 is computed from the date and the evidence, never stored, and only covered lessons feed it; Code pages write nothing when drawn.
- **109** Rider work counts only as a validator report passed through the pure `KOS.codeProject.check`; nothing changes until Import.
- **110** Code goes only to a repository the user created; tokens stay per device, never in state or backups, and a push is one commit.
*Japanese*
- **112** Japanese is the `ja` subject in `KOS.subjects`, not an exam subject, and is live only once `KOS_DATA.ja` loads.
- **113** A Japanese facet is one item times one skill scheduled through `KOS.fsrs`, with its grade derived from the validator verdict and never chosen.
- **114** Japanese validators (`KOS.jaValid`) are pure with four verdicts, nothing is AI-graded, and new exercises must pass `tools/ja_valid_check.mjs`.
- **115** Personal Japanese media stays on the device; mined lines live in `kurenai-os-ja-mined` and a line already stored is never overwritten.
- **116** Japanese pay goes through `KOS.ja.award`: a session is one ledger entry paid by difference under a daily cap; self-marked work pays nothing.
- **117** The Japanese timeline is a derived range, calibrating under two weeks of history, never a single date and never stored.
- **118** `js/data/ja-strokes.js` is generated from KanjiVG with attribution by `tools/gen_ja_strokes.mjs` and is never hand-edited.
*Creatives*
- **154** Creative checks are derived from evidence in `state.creatives`; pay once through `KOS.creatives.award`, and volume or re-saving pays nothing.
- **155** Kurenai critiques Creatives work but never creates it; a critique sends only what What is sent shows and pays, rates and ticks nothing.
- **156** The Practice Log is private and drawn only when opened; only a deliberate Promote enters the Portfolio, and works live in their own IndexedDB.
*Mind*
- **137** A Mind concept is the unit of retention: its ladder is derived from evidence, never stored, and writing, Journal and Kurenai pay nothing.
- **138** Mind positions are versioned under random keys and never overwritten, so two devices' revisions both survive the merge.
- **139** The Mind Journal is private and local first in `kurenai-os-mind`, replicated to `kos_mind`; Reports and the Assistant never quote entries.
- **140** Mind dialogues are authored offline trees; Ask Kurenai sends only what is shown, once per press, and never sets mastery, a position or a checkpoint.
- **141** Every Mind psychology finding is marked Robust, Debated or Failed to replicate and names its study; numbers are checked by program before writing.


### `exams.md`

*The Exams & Deadlines hub*
- **120** `state.exams.assessments` is the one canonical record for every exam, mock, test and deadline; the calendar only derives events from it.
- **121** An assessment's scope is stored as picked and resolved on read via `KOS.exams.leaves(a)`, freezing once its date passes or a result is logged.
- **122** Only a real exam, or a mock with `cap` on, whose resolved scope holds a card's leaf can cap that card's FSRS schedule.
- **123** Readiness is four separate signals, never blended; the band is derived from them and a predicted grade is always a range.
- **124** Attempts are the tracker record, widened with optional fields; a `result` attempt fills its assessment, and a `redo` question becomes an FSRS item.
- **125** Exam evidence data is generated from the user's own index; no past-paper text or images are bundled or deployed.
- **126** The exam planner writes only on confirm, and only personal Pacing rows tagged `exam:<assessment>`, never the Calendar.
- **127** A practice paper is derived from its assessment and seed, never stored, laid out on A4 sheets the same on screen and in print, and every page labels it as not a board paper; an authored paper is paper n in its board's own format and time.
- **128** Exam goals read their sources through `links.examId`; deleting an exam unlinks its goals and never deletes them.
- **129** Assessments, scopes, planning and analytics generate zero Governor traffic; redo items pay nothing and pages only read.
- **130** The full Companion content is authored and original, meeting a per-leaf contract; real questions appear only as references; a school's mock reads every paper it overlaps; a partial Companion never makes a predicted paper.
- **130a** An attempt is recorded as events per part (never ink or text) and measured on the device; no in-app model reviews it — the XML pack goes out, a validated JSON reply comes back.
- **130b** An exam is eight sections read from `KOS.examSession`; Today is computed, never stored; the plan writes Pacing only on Send; targets close by two attempts or by hand; grades are labelled estimates from typical boundaries.


### `ink-files.md`

*The ink engine*
- **132** `KOS.ink` is the one pen engine: every surface mounts it under a doc key, pages are never redrawn under the pen, and pen settings stay per device.
- **133** Stroke colours are theme roles read live (`KOS.inkUI.palette`), never hex values, and paper is CSS from the theme.
- **134** Writing is evidence only: pages, strokes and drills move no XP, gold or HP and log no session.
- **135** Handwriting is read by Kurenai only when asked and switched on; each request shows What is sent first, and replies only suggest and write nothing.
- **136** Ink lives in `kurenai-os-ink`, never in the state document; it rides the full backup and syncs per stroke to `kos_ink`, never discarding a clash.
*Files*
- **150** `KOS.files` indexes the file stores: one file per hash with many links, deleted only when nothing else links it.
- **151** The original file is never changed; writing on it is an ink layer, one per attempt on a past paper; every Download or Share of a written-on file gives a new PDF with the writing unless switched off.
- **152** Every surface opens a file through `KOS.files.open` and the one viewer; no surface builds its own, and PDF text is indexed on-device with no OCR.
- **153** Every way of getting files in reports each file's outcome and reason; nothing is skipped silently.


### `productivity.md`

*The notification centre*
- **95** `state.notify` is the one ledger of what happened to the user; tickers push fired alerts under their own keys, nothing re-derives a due date.
- **96** Episode airings and Planner release days are watched by the notification centre; airing data is never written to the vault.
- **97** The header bell shows the five newest items, the full feed is the `notifications` view, and read state syncs with the state document.
- **98** Device alerts need the per-device `state.ui.notifyDevice` opt-in and granted permission, and fire only for fresh items while the page is hidden.
*Routines and the Daily Review*
- **142** `state.routines` is the one routine record, with habits as one-step routines in the fixed Daily habits routine, past days frozen in `snap`, and a step that runs another routine mirroring it.
- **143** A routine completion pays once per routine day via `KOS.governor.routineAward`; steps and rest days pay nothing, minimum days top up once.
- **144** A Daily Review stores only its own state and changes everything else through the record's owner, with Undo, no Governor traffic and no streak.
- **145** `KOS.dayReview.due(now)` is pure and offers at most one review; it never opens by itself over Focus, a dialog or a deep link.
- **146** Review words render from the template at once and Kurenai's replace them on success; the payload holds titles, times and counts only.
- **147** Where a record shows (Calendar, Countdowns, Today, reviews, Home) is derived from its own fields, never chosen by a form.
- **148** Routines and reviews use the routine day (`dayStart`, default 04:00) while the ledger, streaks and the Governor keep the calendar day.
- **149** `KOS.today.build` is a pure read that writes nothing and is the one source for the reviews, Home's three and the Assistant's day.
*Google Calendar, Google Tasks and Todoist*
- **157** Google and Todoist connect through `ext-token`; refresh tokens stay server-side, access tokens in memory only, one device and tab syncs at a time.
- **158** Synced events and reminders carry `uid` and `ext` with a three-way merge; pulled writes run inside `KOS.ext.inbound` so they are never echoed back.
- **159** Calendar events sync two-way with the primary Google calendar, what cannot fit is read-only, and derived items go one way to a KurenaiOS calendar.
- **160** A Reminders list links to one Todoist project or Google Tasks list, and a tick pulled from the provider pays nothing and counts as activity only.
*What reaches a closed app*
- **131** The device computes the outlook and the server only delivers it; the `runner` reads only its own tables and never state, media or credentials.
*Reports*
- **99** A media row keeps its own activity journal appended by `put()`, and `KOS.mediadb.activeEvent` is the one definition of doing something.
- **100** A session entry records what the Governor paid (`award`), so earned totals sum awards, never balance differences; the tally keeps counts only.
- **101** `KOS.reportStore` writes the state snapshot at each period boundary the first time the app is open on or after it, and never refreshes it.
- **102** A report is derived once by the pure `KOS.report.compute` and then saved; only its words change afterwards, with zero Governor traffic.
- **102a** Reports pages only read saved facts and a render writes nothing; every Full overview opens inside Reports, never an app page.
- **102b** Report words are the template's unless the user picks Kurenai, then one request carries totals only and a failure falls back to the template.
- **102c** The report story is a dialog over saved stories with per-device speed; the share card is made on the device with Collection titles off by default.
- **102d** Months, terms and years are saved on their first morning by the same pure `compute`; a term is a run of school weeks split by a gap of two or more.
- **102e** Saved reports and snapshots replicate to `kos_reports` local first, keeping the facts saved first and the words changed last; no credential rides it.
*The integrated weekly plan*
- **80** `js/data/pacing.js` is a one-time seed copied by `KOS.pacing.ensureSeeded()`; editing it never changes an existing install.
- **81** `KOS.pacing.normalise()` is the schema gate: row refs must be real spec leaves, and an empty `refs` is deliberate and never back-filled.
- **82** Pacing stores no progress or mastery; coverage is read from `state.progress`, and pacing has zero Governor traffic.
- **82a** An unticked personal row from an ended week carries over by a derived read (`carriedInto`); the record itself never changes weeks.
- **82b** The plan lends itself to other surfaces by reads only (countdowns, Home card, Today lessons, a Calendar block's week plan, ticked through `KOS.pacing`); milestones are never written as events.
- **83** Ahead, aligned, behind or unplanned is set arithmetic over linked refs, and a week whose class rows have no refs makes no claim.
- **84** The plan is edited only through `KOS.pacing`: a row's `wk` is derived on every write, a week begins on a Monday and deletes ask first.
- **85** The braid is a one-subject picture of alignment evidence, not a second dataset, with a keyboard route of real buttons beneath it.

## Extension notes

### Deep content and labs

How notes, banks, worked examples, generators and labs are authored (the
depth contracts, merges, banks, callout kinds, the lab system) is in
[`docs/invariants/study.md`](docs/invariants/study.md), under "Deep content and labs".

### Navigation hierarchy

- Home: Reports (`#/reports[/<week|month|term|year>]`, no rail item; from
  the bell, the Home card, Home's Study hours card and search).
- Study: subjects, Review, Assignments, Exams & Papers, Pacing and the
  Error Log (`#/errorlog[/<subject>[/<ref>]]`, `#/errorlog/drill`).
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
