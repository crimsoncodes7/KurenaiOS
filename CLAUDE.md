# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running and testing

**No build step.** Open `index.html` directly in a browser — `file://` works because there are no ES modules.

**Smoke tests** (require Node.js + jsdom):
```sh
npm install jsdom          # one-time
node tools/smoke.test.js   # core engine tests
node tools/smoke2.test.js  # deep content + engines tests
node tools/smoke3.test.js  # Build 2a governor: SM-2, sessions, economy, calendar, todo
node tools/smoke4.test.js  # Build 3a Collection Matrix: mediadb, AniList client, XML import
node tools/smoke5.test.js  # Build 3b Books: dual-tracking schema, v2→v3 migration, manga sync/XML, physical vault
node tools/smoke6.test.js  # Build 3c Visual Novels: VN schema, v3→v4 migration, VNDB client, personal flashcard bucket
node tools/smoke7.test.js  # Build 3d write-back: push utility, mutation shapes, search-and-add, quick-edit
node tools/smoke8.test.js  # Build 3e Games: v5 schema, bulk paste-in, analytics, cross-media integration, Steam-absence invariants
node tools/smoke9.test.js  # Build 3f Anime deepening: season calc, extra-merge fix, airing countdown (mocked), watch heatmap, AniList profile
node tools/smoke10.test.js # Build 3h: the VNDB duplication regression (real /ulist shape), title-claim fallback, dedup pass, import modes
node tools/smoke11.test.js # Build 3i Books deepening: lookup clients (Open Library/Google Books), ISBN utils, tab split + comparison survival, reading sessions (governor boundary), ranked shelves, scanner degradation
node tools/smoke12.test.js # Build 3j: reward-on-sync watermark (the push→echoing-pull single-reward property), autosync engine, VN chapters, profile tabs + VNDB profile, shop rebalance + Matrix cosmetics, season picker
node tools/smoke13.test.js # R3 full-coverage backup/restore: mediadb exportAll/importAll, attachments, store.importFull (v2 + legacy), token exclusion, round-trip
node tools/smoke14.test.js # Build 3g Purchase/Budget Planner: release grace + same-day rotation, allowance ledger/modal, purchase archive + thresholded history, local Book physical/VN/Game Collection handoff, both-direction linking, drag order, THE governor/network boundary
node tools/smoke15.test.js # Build 4.0 UI overhaul: Linear Void token architecture + 23 :root[data-theme] blocks, retired-theme fallback, Study Hall workspace (collapsible inspector, unit breakdown), vault hero (kv spotlight, bannerImage plumbing, games/VN zero-network), planner top row, Governor bento, shop swatches
node tools/smoke16.test.js # Build 5 image positioning: shared crop contract/UI, legacy fallback, governor/media/wishlist/profile persistence, DB v7 and backup/restore
node tools/smoke17.test.js # Build 4a cloud sync: syncId schema (DB v8, files v2), tombstones, push/pull/echo-freedom, first-link matrix, empty-remote guard, reward neutrality, attachment metadata-vs-binary boundary, restore re-baseline (Supabase boundary mocked)
node tools/smoke18.test.js # Build 4b PWA: manifest/icons, service-worker contract (safe updates, API-cache exclusion, self-maintaining precache), pwa.js inertness, phone-tier CSS contract
node tools/smoke19.test.js # Build 4c games: gameapi graceful degradation, manual-baseline UI, applySteamImport merge law (gap-fill only, one session), Edge Function source contracts (server-side check_authentication, no client SteamID, per-function verify_jwt, secrets via env only)
node tools/smoke20.test.js # Category 6 Phase A: assistant provider layer (Ollama transport + Gemini/DeepSeek ai-chat adapters, routing, no-silent-fallback, cap/metering source contracts, Gemini schema sanitizer + thoughtSignature round-trip)
node tools/smoke21.test.js # Category 6 Phase B: the 64-tool registry (schema validation, real-domain invocation, governor invariants, generation atomicity)
node tools/smoke22.test.js # Category 6 Phase C: orchestrator (bounds, duplicate/mutation guards, live-context, confirmation integrity, audit lifecycle)
node tools/smoke23.test.js # Category 6 Phase D: conversations + bounded context + explicit-consent memory (RLS/isolation source contracts, injection inertness)
node tools/smoke24.test.js # Category 6 Phase E: the three UI surfaces (shared controller, mascot states, drawer, contextual actions, dedicated page)
node tools/smoke25.test.js # Category 6 Phase F: Ollama model-config path (input-persist, reload hydration, per-category resolution, empty→error / configured→/api/chat)
node tools/smoke26.test.js # Category 6 Phase F: Ollama request-payload compat (≤12 tool shortlist, ollama schema sanitizer, tools+format conflict avoidance, surfaced error body)
node tools/smoke27.test.js # Category 6 Phase F: conversational continuity (in-memory history signed-out, num_ctx 8K budgeting, follow-up shortlist shrink, pending-artifact propose/save)
node tools/smoke28.test.js # Category 6 Phase F: execution grounding (verified write receipts, proposal≠persisted, exact-artifact save incl. edits, false-success/promise-no-action correction, batch atomicity, retrieval proof)
node tools/smoke29.test.js # Category 6.1 assistant UI/UX acceptance: one controller across drawer/page, inert provider rendering, canonical confirmations, theme inheritance, focus containment, production assets
node tools/smoke30.test.js # Build 6.2 Reminders: lists-vs-tags separation, smart sections, recurrence, anti-farming reward bounds, migration, Home/Calendar boundaries, backup fidelity
node tools/smoke31.test.js # Governor v5.1 UI/UX + merge guard: page headers, HP preview, 90-day cadence, meaningful ledger, history/shop/cropper, compact HUD/profile contracts and state-only assistant dot
node tools/smoke32.test.js # Build 6.3 Study Files: selectable list + preview stage, fit/zoom/expand/collapse controls, metadata + rename/replace/remove, IndexedDB + backup fidelity, missing/corrupt handling
node tools/smoke33.test.js # Build 6.4 Assignment Tracker: one canonical record, derived Calendar/Countdown/Home/Focus surfaces, lifecycle (submit/complete/reopen/overdue), filters, delete-removes-derived-surfaces, backup fidelity
node tools/smoke34.test.js # Build 6.5 Focus Timer end-to-end: pure focusAward quoted on setup, session objective, running working-record (notes/self-marks/eligibility/progress), refresh + navigation fairness, completion review over an already-logged session
node tools/smoke35.test.js # Build 6.6 Calendar + the event model: retired global alert threshold (v1→v2 migration, per-record alerts that stay cleared), computed recurrence (daily→yearly, end date, clamped month-ends), merged countdowns over two canonical stores, month/week grids (whole weeks, day-overflow sheet, time grid with packed overlaps), detail-before-edit, the one progressive-disclosure modal (conditional sections, validation, Delete apart from Save)
node tools/smoke36.test.js # Shared media record folio: sectioned Anime/Books/VN/Games editors, two-column/phone layouts, full-width Notes, source summaries, compact physical ranges, separated Delete/Save, dedicated Stats with obsolete bottom analytics removed
node tools/smoke37.test.js # Study overview + topic shell: the 2×4 subject analytics grid, one tile shape, the full-width action card below it, countdowns kept separate, nothing sticky; statistic consistency (formats, empty states, one colour ramp, quiz-best, no "Not started" beside a ticked check); the one Topic Status component; inspector collapse + tab counts sharing the inspector's numbers; full tab names and the retired Overview/Assignments switcher
node tools/smoke38.test.js # Collection Goals v2 + Shrine Hall of Fame: automatic/manual measures, structured editor and status views, activity-only anti-farming receipts, featured rank one, ranked filters/sort, crop-aware branded share card
node tools/smoke39.test.js # Phase 2 Live2D binding: closed release gate (no SDK/Core/model, inert with no runtime, deploy + gitignore blocks), rig-contract mirror (6 motions/4 reactions/fps budgets), seam integration against a stub runtime, write-only ownership, every failure mode falling back to the Phase 1 PNG, frame governing + hidden/offscreen pausing + teardown, and the Krita redraw scaffold vs layer-map.json
node tools/smoke41.test.js # Category 7 staleness guard: the monotonic __seq on the state document, the reproduced 8 Aug 2026 incident (a stale device with one real edit must not clobber a newer cloud copy), the refusal raising a conflict instead of an error, both resolveStale outcomes, an undisturbed two-device round trip, and a restore still outranking the guard
node tools/smoke40.test.js # Category 7 Phase A: the note pager scrolling only on a reader-initiated page turn (B-04), the lazy area rooting on #main and refilling while the sentinel stays in range (B-05), Mangaka on the shared lazy area with author search and a filtering A–Z rail (B-06), #app dvh-with-vh-fallback and the phone tier's tab-bar clearance
```

**Live integration** (Category 6, needs migrations applied + ai-chat deployed):
```sh
node tools/assistant_integration.mjs                 # auth + RLS (6 tables) + persistence + audit (no spend)
node tools/assistant_integration.mjs --live-provider # + concurrency-safe cap + live Gemini (needs GEMINI_API_KEY)
```
(smoke4–smoke17 additionally need `npm install fake-indexeddb` — jsdom ships no IndexedDB.)

**Mobile/PWA audits** (Build 4b, both CDP-driven — see each file's header for
the two long-running commands to start first):
```sh
node tools/mobile_audit.mjs     # phone/tablet overflow + screenshots across every view
node tools/phone_overflow.mjs   # (Cat 7 Phase A) per-element overflow at 390px + tab-bar overlap
node tools/gen_icons.mjs        # regenerate the icon set from the brand seal
```

**Live cloud verification** (needs the migration applied + js/env.local.js):
```sh
node tools/cloud_integration.mjs   # real auth + positive/negative RLS + storage ownership, creates 2 throw-away users
```

All suites resolve `ROOT` via `path.resolve(__dirname, "..")`, so they run from
any checkout location. They load every `<script src="…">` in `index.html`; CDN
scripts (KaTeX) are marked `defer` so the tests skip them.

**Deploying to production** (Cloudflare Pages — https://kurenai-os.pages.dev):
```sh
tools/deploy_pages.sh --stage   # stage runtime files into dist/ for inspection
tools/deploy_pages.sh           # stage + direct-upload to production
```
- **`git push` does NOT update the live site.** GitHub is version control
  only; the live deployment happens exclusively through `tools/deploy_pages.sh`
  (direct upload of the staged `dist/` — which is how the gitignored
  `js/env.local.js` ships without ever being committed).
- Every production deployment must: (1) run the full smoke-suite gate first,
  (2) let the script's staging safety checks pass (they hard-fail if any
  dev-only file leaks into dist/), (3) bump `VERSION` in `sw.js` so installed
  clients get the safe-update offer and old caches clean up. Deployed changes
  reach a running installed app only after the user accepts the "Update
  ready" reload (or closes every tab) — that is by design, not a bug.

**Regenerating spec data** from PDF sources:
```sh
# requires Python 3 + pdfplumber
python tools/parse_aqa.py    # → aqa.json
python tools/parse_maths.py  # → maths.json
python tools/parse_it.py     # → it.json
python tools/gen_data.py     # aqa/maths/it.json → js/data/*.js
# formatting-only, preserves the checked-in JSON payload (including CS NEA)
python3 tools/gen_data.py --format-existing
```

**Current status & backlog**: see the historical "SNAPSHOT — 2026-07-05" and
the Build 4.0 / Build 5 / Build 4a / Build 4b addenda at the end of
`PROGRESS.md` — prioritised backlog, user-owed manual steps, rough edges and
the current test inventory. All 41 suites are the release gate (smoke17 the
Build 4a cloud-sync engine, smoke18 the Build 4b PWA layer, smoke19 the
Build 4c games integrations, smoke37 the Study overview/topic-shell
refinement, smoke38 Collection Goals v2 and Shrine Hall of Fame, smoke39 the
Phase 2 Live2D binding and its closed release gate, smoke41 the cloud staleness guard, smoke40 the Category 7
Phase A bug fixes). Suites 1–16 plus the running-Chrome visual audit were verified
green on 2026-07-13; all 17 on 2026-07-16; all 18 plus the phone/tablet CDP
audit on 2026-07-17; all 19 on 2026-07-17; all 38 on 2026-08-07; all 39 plus
the visual audit on 2026-08-07; all 40 on 2026-08-08.

**Edge Functions** (Build 4c, `supabase/functions/`): deploy with
`supabase functions deploy <name>`; secrets via `supabase secrets set` only
(STEAM_API_KEY, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, PUBLIC_APP_URL) —
never in the repo or client. `steam-auth` has `verify_jwt = false` in
config.toml because Steam's browser redirect can't carry a JWT; it validates
JWTs itself for every POST action. The runtime auto-injects SUPABASE_URL +
anon/service keys (legacy names AND the new PUBLISHABLE/SECRET_KEYS lists —
_shared/cors.ts accepts either generation; verified against the docs).

## INVARIANTS — the one-place list (never violate; details in the sections below)

Collected from every build. If a change would break one of these, stop and say so.

**Governor / economy**
1. Streaks, XP, HP and gold flow ONLY from `KOS.sessions.log(...)` — never write
   them directly.
2. HP/gold gate ONLY labs, sims and the shop. Core revision (spec, notes,
   flashcards, quizzes, exam Qs) never locks. The Focus Timer is never gated.
   Cosmetics stay buyable while strained; only labs suspend.
3. Leisure never touches HP in either direction: media sessions award 0 HP, are
   excluded from the day-drain activity check AND the study streak, and feed
   only the independent rest streak. Reading sessions (`kind:"reading"`) skip
   distraction HP nicks and forfeit nothing on early end.
4. Study streak, rest streak and the HP day-drain activity check are THREE
   separate derivations from the one sessions log: streaks skip
   `focus`+`complete:false` entries; the day-drain still sees them. Keep them
   separate.
4a. The focus award has ONE definition: the pure `KOS.governor.focusAward({
   complete, mins, pauses })`. `onSession` pays from it and every preview
   (the setup "deal", the running eligibility read) QUOTES it — so a number
   shown to the user can never drift from the number paid. It reads nothing
   and writes nothing; the Critical HP half-trickle stays in `restoreHp`, at
   payment time. `KOS.governor.lastAward()` reports what the last session
   actually paid (streak bonuses included) — the completion review reports
   that, it never recomputes an award of its own.
4b. A Focus session is RECORDED AND PAID before its completion review opens
   (Build 6.5). The review is an annotation pass on an entry that already
   exists: it may add `objectiveResult`, `reflection` and `notesFiledTo` to
   that one entry, move a linked assignment through `KOS.assignments`, and
   file the session's notes onto a topic or assignment — but it must NEVER
   log a second session or pay a second award. Dismissing it, or suppressing
   it (`{review:false}`, the assistant's path), must cost nothing.
4c. A refresh or a navigation NEVER costs a session. `pagehide`/`beforeunload`
   bank the live phase clock and write it through `KOS.store.flush()` (the
   ordinary save is debounced 120 ms and the page may not survive it); the
   unload's own `visibilitychange` is exempt from the distraction penalty;
   restore comes back PAUSED with the banked time intact, counting
   `restores` but charging neither a pause nor a distraction. A
   self-marked distraction (`KOS.focus.markDistraction`) is recorded and
   never charged — pricing honesty would only buy silence.
5. Bulk operations never log per-entry sessions. One deliberate act = one
   session (games bulk-add; the 3j `sync-reward` session, watermark-filtered
   and capped at 60 XP / 12 gold per sync). Manual provider syncs log once;
   an autonomous multi-provider cycle batches its rewards into one ledger
   entry. XML import ignores the
   reward list entirely.
5a. The Purchase/Budget Planner (Build 3g, `wishlist.js`) is OUTSIDE the
   governor entirely — it NEVER calls `KOS.sessions.log` / `KOS.media.logActivity`
   and NEVER moves HP/gold/XP or a streak. Purchasing is logistics, not media
   engagement (smoke14-asserted: a full flow fires zero governor traffic and
   zero network). It also emits ZERO network requests — release dates are
   manual by design. A confirmed purchase may make a local `mediadb.get` /
   `add` / `put` handoff to Collection, but must never use `mediapush`, sync,
   title matching or any provider request to do so.
5b. Collection Goals recognise progress but NEVER create a second economic
   event. Automatic completion writes one idempotent receipt to
   `state.goals.completionLedger` with `payout:"activity-only"`; it does not
   call `KOS.sessions.log`, `KOS.media.logActivity`, or write HP/gold/XP. The
   underlying media activity remains the one rewarded act. Deleting/recreating
   a goal cannot farm the Governor because its receipt remains in the ledger.

**Media schema & storage**
6. `mediadb.normalise()` is the SINGLE schema gate — any new field must be
   added there or every `put()` silently strips it. New axes = new DB version
   + migration + indexes. The current database is v8. `coverCrop` is companion
   display metadata, not a query/filter axis, so v7 normalises/migrates it but
   deliberately adds no meaningless crop index. v8 (Build 4a) adds `syncId` —
   the device-independent cloud identity: minted once in `normalise()`,
   backfilled by the upgrade cursor, PRESERVED by every `bulkUpsert` merge
   (`inc.syncId = old.syncId`), indexed for pull-merge lookup. Data
   migrations run in ONE cursor pass — a second concurrent cursor races the
   first's updates and resurrects stale rows (that bug was caught by smoke5).
7. Media entries live in IndexedDB `kurenai-os-media`; attachments in
   `kurenai-os-files`; API tokens in the media kv store. `store.exportFull`/
   `importFull` produce one combined JSON covering all three — tokens
   deliberately excluded. IndexedDB is origin-scoped: `file://` and `localhost`
   vaults are different databases.
8. Views NEVER render the whole vault at once — lazy 60-entry batches via the
   IntersectionObserver sentinel; filters walk real DB indexes, no in-memory
   scans.
9. `bulkUpsert` merge: sync wins on list state, but the manual layer ALWAYS
   survives — Books: `physical`, `mood`, `shelves`, active `dnf`, local
   `author`/`format`; VN: `routes`, `quotes`, `chapters`, `cgGallery`,
   `contentWarnings`, local `developer`. `extra` accretes (fresh non-null
   wins; null never beats stored). User positioning (`coverCrop`, including
   per-volume crops) also survives a pull. A positioned synced cover keeps a
   `coverCropSource` fingerprint: source and coordinates move together, never
   onto newly supplied artwork. Progress re-derives from surviving routes.
   `customLists` (Build 3k, ALL modules — DB v6, multiEntry index) is the one
   axis that UNIONS on merge: a locally-added list and an AniList-synced list
   (the mapper reads `isCustomList` groups) both survive; a pull never drops a
   membership you made. CRUD lives in `KOS.media` (`customLists`/`registerList`/
   `renameList`/`deleteList`); the filter rail + editor chips are in medview.
10. Derived progress, never stored: `vn` ← routes (cleared/total), `game` ←
    playtimeHours (unit "hr"). Don't add a parallel stored progress.
11. Upsert match order: vndbId first (vn), then anilistId, then malId.
    Title-claim fallback is vn-only, claims only id-less same-title rows,
    never crosses modules.

**Write-back & sync**
12. Push eligibility: ONLY `syncSource:"anilist"` + anilistId (anime/books) or
    `syncSource:"vndb"` + vndbId (vn). Games NEVER push and the games module
    emits ZERO network traffic, ever (smoke8-asserted).
13. Field scoping by construction: push payloads only know status, progress
    (+ volumes for books), score. Nothing else may gain a code path into a
    payload. Local score 0 = unrated → omitted, never clears a remote rating.
14. All remote mutations go through `mediapush.js`/`mediasearch.js` only —
    list state only, no deletes, no favourites, no reviews.
15. `bulkUpsert` (the pull path) never schedules pushes and never logs
    sessions — it returns `res.rewards` for the caller.
16. Last-write-wins is DELIBERATE (stated in Help/Sync & Import) — do not
    bolt on conflict detection as a drive-by.
17. The reward watermark: `put()/add()` absorb it on every local save;
    `bulkUpsert` compares the merged state against it BEFORE absorbing. The
    pinned property (smoke12): a push followed by an echoing pull produces
    ZERO reward events. Below-watermark movement lowers it silently — no
    reward, no clawback. Null watermarks/inserts initialise silently.

**External-API facts (all verified LIVE — do not re-litigate without new facts)**
18. VNDB Kana `/ulist`: the TOP-LEVEL `id` is the VN id; the nested `vn`
    record carries NO id. Mocks must never invent `vn.id` (that's how the 3h
    duplication bug shipped). Official endpoint `api.vndb.org/kana` only —
    never the community proxy.
19. VNDB's CORS preflight allows POST/GET/OPTIONS only — browser PATCH
    (write-back) is blocked regardless of token permissions. The client
    implements the documented shape anyway; don't retry the wall.
20. Steam in the BROWSER remains a three-way verified dead end
    (check_authentication response unreadable cross-origin; https→file://
    return blocked; claimed_id is a bare SteamID64) — the browser must never
    talk to Steam directly (smoke8-asserted). Build 4c added the new fact:
    a Supabase Edge Function IS the server that 3e lacked. Manual entry is
    the PERMANENT BASELINE; IGDB search (`igdb-search`) and Steam library
    import (`steam-auth` + `steam-owned-games`) are additive, run only on
    explicit user action behind a cloud sign-in, and the module works
    unchanged when either service is unavailable. Identity law: the browser
    NEVER supplies a SteamID — steam-auth verifies the OpenID assertion
    server-side (is_valid gate, 17-digit claimed_id pattern, single-use
    user-bound nonce) and stores it in `kos_steam` (service-role writes
    only; clients may only read their own row). Import law: a review/
    selection stage is mandatory; applying only creates new drafts or
    GAP-FILLS (playtime when null, an appId onto an id-less same-title row)
    — a manually edited value is never overwritten by Steam/IGDB metadata,
    a same-title row with a different appId is skipped, and the whole
    import logs ONE governor session (invariant #5). Games still never push
    and IGDB adds are local-only `syncSource:"manual"` (igdbId kept in
    `extra` for dedupe).
21. Book lookup: Open Library PRIMARY, Google Books FALLBACK ONLY (keyless
    quota is zeroed, 429). Goodreads is dead — never add it.
22. AniList MAL-format XML exports carry MAL ids, not AniList ids (they
    coincide only below ~22k). Rate limits: AniList degraded 30 req/min
    (batch 50, pace ~2.4 s, honour Retry-After); VNDB 200 req/5 min (pace
    ~1.6 s).
23. Airing data is cached in MEMORY only (10-min TTL) — never written to the
    vault, never background-polled. The AniList profile is ONE GraphQL
    request, read-only (`resetNotificationCount: false`).

**Cloud sync (Build 4a — Supabase)**
31. Cloud sync is a REPLICATION layer outside the governor: `cloudsync.js`
    never calls `KOS.sessions.log`/`logActivity`, never moves HP/gold/XP or a
    streak, and never schedules a `mediapush`. Pull-applies go through
    `mediadb.put/add`, which absorb the reward watermark — progress rewarded
    on one device is silently absorbed on the others (ONE reward across the
    fleet). Local persistence stays the primary write path; a failed sync
    never touches the successful local save; the app is fully functional
    signed out, offline, and with no `js/env.local.js` at all. Auth gates
    cloud sync ONLY, never the app.
32. Identity: `syncId` (media, DB v8) and `fileId` (attachments, files DB v2)
    are the ONLY cross-device identities — local autoIncrement ids never
    leave the device. Every delete path records a tombstone
    (`mediadb.remove`, the `bulkUpsert` replace pass, `attach.remove`;
    dedupeVault deletes via `mediadb.remove` so it's covered); a pull that
    APPLIES a deletion passes `skipTombstone` so it can't re-queue itself.
33. Timestamps: remote `updated_at` is SERVER-generated (touch trigger); the
    client never supplies one and never compares its own clock to the
    server's. Dirtiness is derived locally (entry `updatedAt` vs the recorded
    `cleanLocal`; state hash vs `lastPushedHash`) — do not add client-time
    conflict logic. Order is push-then-pull (local edits are the newest
    truth); echoes are skipped by recorded `updated_at` fingerprints.
    Whole-document LWW on `kos_state` is DELIBERATE (documented in Help) —
    do not bolt on field-level merging.
34. Safety rails: an empty remote state NEVER replaces meaningful local
    state; the first-link `localOnly` upload and the `both` state-document
    choice require explicit user confirmation; `store.importFull` triggers a
    full re-baseline (`noteRestore`) that re-pushes the vault and tombstones
    remote rows the backup no longer carries.
35. Secrets: the publishable key is browser-public BY DESIGN — Row-Level
    Security is the actual boundary (owner-only policies on every table +
    storage path ownership from `auth.uid()`; verified positively AND
    negatively by `tools/cloud_integration.mjs`). `js/env.local.js` is
    gitignored and never committed; the Supabase session lives in the client
    library's own localStorage key; `cloudsync.*` kv keys and the session are
    excluded from backups exactly like AniList/VNDB tokens. Never log tokens.
    Never put a service-role key anywhere in this repo.
36. Attachments: metadata syncs automatically through `kos_files`; binary
    content uploads ONLY through the explicit "Sync files now" action (and
    downloads through the per-file ⇣ action). Deleting an attachment
    tombstones its row AND removes its storage object — nothing else ever
    deletes remote binaries (a failed local read must never trigger one).

**PWA & mobile (Build 4b)**
37. The service worker (`sw.js`) NEVER caches API traffic: Supabase, AniList,
    VNDB, Open Library and Google Books requests — and every non-GET — pass
    through untouched (authenticated/personalised responses must never enter
    Cache Storage; only the fixed font/jsdelivr CDN list gets a runtime
    cache). Same-origin statics are stale-while-revalidate; navigations are
    network-first with the cached shell as offline fallback; the precache
    list is DERIVED from index.html's own tags at install (it cannot drift —
    smoke18-asserted).
38. Updates are safe by default: `skipWaiting()` runs ONLY from the
    SKIP_WAITING message after the user confirms the reload offer in
    `pwa.js` — never at install. Bump `VERSION` in sw.js when deploying.
    Registration is guarded off `file://`; the app must stay fully
    functional with no service worker at all.
39. `navigator.storage.persist()` is requested once, at install or first
    cloud sign-in — never nagged per load, and never described as a
    guarantee (Help states eviction honestly; backups remain the strongest
    protection). Background Sync is a progressive enhancement only —
    cloudsync's own online/boot/focus/manual retries are the correctness
    path.
40. The phone tier is the `@media (max-width: 700px)` block at the end of
    css/main.css: the rail becomes the bottom tab bar, the spec tree a
    drawer driven by the SAME `ui.treeClosed`/`tree-closed` state (phones
    just default it closed in hub.js), modals become bottom sheets, inputs
    hold 16px (iOS zoom), and safe-area insets ride `env()`. Desktop rules
    above that block are untouched — extend the tier, don't fork
    components. Icons regenerate via `tools/gen_icons.mjs`, never by hand.

**Calendar & the event model (Build 6.6)**
41. `KOS.calendar.normalise()` is the SINGLE schema gate for an event — every
    write goes through it, so an unlisted field cannot enter the store. The
    branch is `state.calendar` at `v: 2`; `v` is deliberately ABSENT from
    store DEFAULTS (DEFAULTS deep-merge UNDER stored state, so defaulting it
    would stamp a legacy branch as migrated and the one-time pass would never
    run). `time` remains the START-time field name — focus.js and todo.js
    have read it since Build 2a.
42. There is NO global alert threshold. `alerts[]` (minute offsets, the same
    vocabulary reminders and assignments use, max 4) lives on each event.
    The default 3-day lead is applied ONLY in `addEvent()` for a new
    exam/deadline — `normalise()` must never re-seed one, or clearing every
    alert would silently undo itself on the next edit. The v1 `notifyDays`
    + per-event `notify` day count migrate once, on first access.
43. Recurrence is COMPUTED, never materialised: one record, occurrences
    derived by `occursOn`/`nextOccurrence` (daily · weekly · fortnightly ·
    monthly, clamped to short month-ends · yearly, with optional
    `recurUntil`). Editing the record edits every showing; deleting it
    removes them all. Never expand a repeat into extra rows.
44. Countdowns are a merged READ over two canonical stores — calendar
    exam/deadline events and `KOS.assignments.countdownItems()` — composed in
    `KOS.calendar.countdowns()`. `deadlines()` stays calendar-only and keeps
    its `{ev, date, days}` shape. Visibility is a FIELD on each record
    (`showInCountdown`), never a second copy, and a completed deadline
    retires itself. Assignments and reminders render on the grid as derived
    chips (`.cal-asg` / `.cal-rem`) and must never be written as events.
45. The event editor is ONE modal for add and edit: core fields visible,
    everything else behind `.cal-disc` disclosures (a populated section opens
    itself), and exactly one conditional section per type — exam (paper,
    duration, room, related topics), deadline (priority, status from the
    assignment tracker's vocabulary, countdown visibility), study block
    (intended duration, `assignmentId` LINK, focus-session shortcut). A
    study block links to an assignment by id and copies nothing from it.
    Validation runs before any write; Delete stays separated from Save.
46. Category colour is one custom property: `--ev-hue`, set by the type
    class and overridden by an explicit `.c-*` colour. Chips, legend keys,
    swatches and the detail card all read it — never hard-code a palette
    value into a calendar rule.

**Content & UI**
24. `js/data/compsci.js`/`maths.js`/`it.js` are generated — never hand-edit by
    default (caveat: regen via pdfplumber is currently unreliable — the
    committed spec data was cleaned in place in June 2026, so if you must
    regen, diff per-ref against the committed files first). For a whitespace-
    only readability refresh without the extracts, use
    `python3 tools/gen_data.py --format-existing`; it preserves the current
    JSON payload and the manual CS NEA section.
25. Content keys only on LEAF refs (non-empty `content[]`). Callouts need TWO
    closing braces. No bare-string paragraphs in notes (user preference —
    wrap prose in callouts).
26. Reuse existing class names — engines/views/tests key off them. Restyle
    through `:root` tokens; never repurpose the three subject hues.
26a. Build 5 visual system: the current default is **The Atelier / Atelier
    Dawn**, a warm parchment-and-ink theme. Every component rides canonical
    tokens (`--bg0/--bg1/--panel`, `--text/--text2/--muted`,
    `--accent/--accent2/--accent3`, `--good/--warning/--danger`, `--radius`)
    plus the shared 4px geometry/type/layout tokens. Legacy names
    (`--kurenai`, `--gold`, `--bad`, lines, glass) remain derived aliases in
    `:root` for compatibility. Never hard-code a palette or one-page geometry
    fix; extend the token/component layer. Build 4.0 Linear Void remains a
    historical milestone in PROGRESS.md, not the current default.
26b. Theme variants are `:root[data-theme="<id>"]` blocks (generated from
    `tools/theme-lab-raw.json`, 23 shop unlockables at 140 gold, swatches in
    the catalog `sw` field). They MUST target `:root` — derived tokens are
    computed at `:root`, so `body[data-theme]` silently does nothing (that bug
    shipped once). `applyCosmetics` maps unknown/retired ids (kin/shinku/aoi/
    sumi) to the default.
26c. `KOS.imageCrop` is the only image-positioning contract. Persist the
    original URL or whole-frame resized/compressed data URL separately from a
    normalised `{x,y,zoom}` crop (`x/y` 0–100, `zoom` 1–3). Missing metadata
    MUST render as centred cover-fit so legacy records remain valid. Use
    `image()`/`background()`/`apply()` to render and `open()` to edit; never
    canvas-crop a source to its visible aspect ratio. Reset/cancel must not
    commit. Normal heroes share `--hero-min-h`, `--hero-pad-*` and
    `--radius-hero`; only Governor Status retains its profile-banner geometry.
26d. Study statistics have ONE derivation each, in hub.js: `subjectStats`
    (adds `touched` and the check-averaged `mastery`), `subjectCardStats`,
    `subjectQuizStats`, `subjectExamCount` and `topicStats`. The subject
    analytics grid, the Topic Status component, the study TAB COUNTS and the
    study inspector all read them — never recompute a figure at a call site,
    or two surfaces will silently disagree (the subject page once showed
    `quiz.lastPct` under a "Best quiz" label while the inspector showed
    `quiz.best`). Formatting is standardised in the same block: `pctText`
    (whole number + "%"), `ratioText` ("A / B"), `tone()` (the ONE `low`/
    `mid`/`high` ramp, shared with the section ledger's bar colours), and the
    single empty state — an em dash plus one sentence saying why. A progress
    bar must carry the SAME quantity as the value printed beside it; where a
    derived figure can outrun its inputs (a topic marked Completed is 100%
    regardless of its checklist) the readout EXPLAINS itself
    (`topicStats().checkText`) rather than rewriting the store — the
    assistant's undo restores status and checks separately, so deriving one
    from the other loses data. `store.setCheck` does move a `none` topic to
    `started`, so a ticked box can never sit beside "Not started".
27. Navigate only via `KOS.show` (history/forward/rail state). Charts are
    hand-built inline SVG via `KOS.charts` — no charting library. Study owns
    subject work, Review and Exams & Papers; Productivity owns Focus Timer,
    Reminders, Habits and Calendar. The Assignment Tracker (view `assignments`,
    Study) owns state.assignments and is the ONE record for an assignment:
    Calendar chips, Countdown rows, the Home urgent card and Focus-session
    links are all DERIVED reads, never copies, so deleting an assignment
    removes every surface it appeared on and can leave no orphan event.
    Reminders own state.reminders (lists are
    containers, tags are cross-list labels); dated ones ride the Calendar grid
    but NEVER KOS.calendar.deadlines(). Review composes the legacy `due` and
    `cardstats` routes, so keep both ids working. `KOS.workspaceTabs` is the
    shared secondary-switcher primitive for Review, Planner and Sync — the
    subject desk deliberately has NO tab strip of its own (the retired
    Overview/Assignments switcher was a second navigation grammar for a
    destination the Study subnav already owns).
28. Vault editors live in the `KOS.mediaEditors` registry (keyed by module
    id; anime is the fallback base). `KOS.mediaEditor` (core/media.js)
    dispatches on `entry.module` and then runs `KOS.mediaEditorHooks`
    (each called with `(entry, overlayEl)`) once the modal is in the DOM.
    Never wrap or replace `KOS.mediaEditor` itself — register an editor or
    a hook. Script-tag order between the vault modules no longer matters.
29. VN CG gallery is a COUNTER only — never store/scrape artwork. Content
    warnings are manual — never auto-filled from VNDB tags.
30. The vault hero: spotlight selection + banner uploads/positioning live in
    media kv (`hero.<module> = {entryId,banner,crop}`), NEVER on the entry.
    `extra.bannerImage` comes from AniList sync (the `bannerImage` field is
    VERIFIED LIVE as separate from `coverImage`) or the one read-only
    `fetchBanner` lookup — only for `syncSource:"anilist"` entries. VNDB has
    no banner (image+screenshots only, verified) and games are manual-only:
    both are USER-UPLOAD ONLY and must never gain a network path
    (smoke15-asserted zero network from the games/VN vaults).

## Architecture

### Script-tag globals, no bundler

All JS is loaded via `<script src="...">` in `index.html` in strict dependency order. Everything shares a single global namespace `KOS`. No `import`/`export` — this is intentional so `file://` works without a server.

### Load order (from `index.html`)

1. **Data** — `js/data/{compsci,maths,it,intel}.js` populate `window.KOS_DATA.*`
2. **Core** — `store.js`, `ui.js`, `imagecrop.js`, `charts.js`, `content.js`,
   then `srs.js`, `sessions.js`, `governor.js`, `mediadb.js`, `anilist.js`,
   `vndb.js`, `bookapi.js`, `media.js`, `mediapush.js`, `autosync.js`,
   `cloud.js`, `cloudsync.js` (Build 4a — both feature-check lazily; the
   vendored `js/vendor/supabase.js` UMD and the gitignored `js/env.local.js`
   load with `defer` in `<head>`, so the smoke loader regex skips them and a
   missing env file 404s harmlessly). `imagecrop.js` must follow `ui.js` (it
   uses `KOS.ui.el`) and precede every renderer/editor that consumes it.
3. **Deep content** — `js/data/content/*.js` populate `window.KOS_CONTENT["subject:ref"]`
4. **Engines** — `js/engines/{flashcards,quiz}.js`
5. **Modules** — `js/modules/hub.js` + `due.js`, `calendar.js`, `todo.js`, `governor-ui.js`, `tracker.js`, `rag.js`, `cardstats.js`, `attachments.js`, `help.js`, `focus.js`, `cloudui.js` (the topbar sync chip + the Archive "Account & Cloud Sync" card), then `medview.js` (the shared vault-view toolkit: cover/lazy list/pills/empty states, the editor shell, quickEdit + push chip — every vault view builds on it), the four vault views `anime.js`, `books.js`, `vn.js`, `games.js` (each registers its editor in `KOS.mediaEditors` — dispatch lives in core/media.js, so their relative order after medview.js is free), `aniprofile.js`, `vndbprofile.js`, `wishlist.js` (registers a `KOS.mediaEditorHooks` entry for "on your wishlist" surfacing), `goals.js`, `matrix.js`, `shrine.js`, `mediasync.js`, `mediasearch.js`. `hub.js` also owns the Compare Topics workspace: it is read-only over deep content/progress except `state.study.compareNotes`, which is a pair-keyed personal note and therefore rides normal state export/import.
6. **Labs** — `js/labs/{worked,trace,oop,sims}.js`
7. **Boot** — `js/main.js` wires rail nav, governor boot sequence, restores last view

### Module map & data flow

**Governor spine:**
```
any completed activity ──► KOS.sessions.log({type, subject, ref, dur, metrics})
                                │
              ┌─────────────────┼──────────────────────┐
   governor.onSession       streak derivation      todo/RAG/stats read it
   (pays XP/gold/HP;        (study streak skips    (cardstats, rag.auto,
    media type → 0 HP,       media + incomplete     heatmaps, burn-down)
    rest-streak only)        focus; rest streak
                             = media days only)
```
- `srs.js` owns SM-2 + unified card registry (curriculum `"sid:ref:i"`, custom `"u<id>"`, personal bucket `"personal"`). `governor.js` owns HP/gold/XP/catalog/gates/HUD. `focus.js` owns the ONE timer state machine (`kind:"reading"` for Books). All state in `KOS.store` → localStorage.
- **Focus Timer, end to end (Build 6.5)** — three surfaces, one machine.
  *Setup*: mode, duration, break, subject, topic, optional assignment, one
  objective line; the side "deal" quotes `governor.focusAward` for the
  duration chosen (invariant 4a). *Running*: the clock stays dominant and
  gains context chips, the objective (`fx-objective`, editable live), cycle
  pips, a live eligibility read, quick notes and a free distraction marker —
  all of it inside the persisted `state.focus.active` snapshot, so a reload
  restores the notes with the clock. *Completion*: `reviewModal` over an
  already-logged entry (invariant 4b) — facts, the real award, objective
  result, one line of reflection, linked-assignment progress, and filing the
  notes onto the topic note or the assignment. Session metrics gained
  `objective`, `objectiveResult`, `reflection`, `notes`, `selfMarks`,
  `restores`, `notesFiledTo`; self-marks are deliberately NOT `marks`, which
  already means exam marks on tracker entries and is read generically by the
  Governor chronicle.

**Collection Matrix** (leisure; separate storage, same sessions log):
```
IndexedDB kurenai-os-media (v7) ── mediadb.js owns schema + indexes + bulkUpsert
       │
  media.js — module registry, XML import, logActivity/logSyncRewards,
       │     dedupeVault, the KOS.mediaEditors dispatcher (pure domain —
       │     no DOM; quickEdit/pushChip live in medview.js since step 6)
       │
  medview.js — the shared vault-view toolkit (view layer): cover, lazy
       │       batch renderer, pills/search/sort/layout, empty states,
       │       the editor shell (modalOverlay/editDraft/saveEntry),
       │       quickEdit + pushChip. A fifth media module builds on THIS,
       │       not on a copy of a sibling view.
       │
  vault views: anime.js · books.js · vn.js · games.js
  cross-cutting: matrix.js · shrine.js · mediasync.js · mediasearch.js
                 aniprofile.js · vndbprofile.js · wishlist.js
```
- **Navigation**: Collection's primary subnav is the archive destinations,
  then Planner and Sync. `KOS.collectionWorkspaceTabs()` supplies the secondary
  tabs directly inside the existing specialised pages: `wishlist`/`goals` and
  `aniprofile`/`vndbprofile`/`mediasync`. Always use `KOS.show()` for tab
  transitions so direct routes and history remain intact.
- **Off-spine**: `wishlist.js` (Purchase/Budget Planner, 3g) shares the Matrix
  UI chrome but stores in localStorage (`state.wishlist`), not the media vault,
  and NEVER touches the governor or the network — see the detail section below.
- **Read path**: API clients → `bulkUpsert` → `res.rewards` → a manual provider
  action logs one sync-reward session; `autosync.js` batches all rewarded
  modules into one cycle-level session. It runs every 15 min (flush failed
  pushes first, then pull).
- **Write path**: editors/quick-edit/+1 → `mediadb.put()` (absorbs watermark) → `mediapush.schedule()` (350 ms debounce) → AniList mutation (VNDB CORS-blocked).
- **Watermark loop**: `entry.reward` = last accounted state. `put()` absorbs; `bulkUpsert` diffs BEFORE absorbing — external progress rewards once, echoed push rewards zero.

### Key globals

| Global | Purpose |
|--------|---------|
| `KOS.store` | Single state object, autosaved to `localStorage` key `kurenai-os-v1` on every mutation |
| `KOS.ui` | `el()` DOM builder, `toast()`, `flashSaved()`, `esc()` (the canonical HTML escaper), `debounce()` |
| `KOS.imageCrop` | Shared non-destructive image renderer/editor: `value`, `normalise`, `apply`, `image`, `background`, `prepareFile`, `open` |
| `KOS.cloud` | Supabase client + email/password auth (Build 4a): `configured`, `available`, `signUp/signIn/signOut`, `init`, `onAuth`, `userId` |
| `KOS.cloudsync` | The multi-device sync engine (Build 4a): `start`, `syncNow`, `noteChange`, `noteRestore`, `migrateUp`, `resolveBoth`, `uploadBinaries`, `downloadFile`, `onStatus` — see invariants 31–36 |
| `KOS.content` | `get(sid,ref)`, `has(sid,ref)`, `renderBlocks(blocks)`, `coverage(sid,leaves)` |
| `KOS.show(viewId, arg)` | Clears `#main`, calls `KOS.views[viewId](main, arg)`, updates rail active state, saves |
| `KOS.views` | Registry of view render functions; each module registers itself here |
| `KOS_DATA` | Spec tree data (generated — do not hand-edit `compsci/maths/it.js`) |
| `KOS_CONTENT` | Deep revision content keyed by `"subject:ref"` (hand-authored in `js/data/content/`) |

### State shape (`KOS.store.state`)

```js
{
  v: 1,
  progress: {},    // "subject:ref" -> { status, check:[bool,bool,bool,bool], note }
  ui: { subject, view, openSections, lastRef },
  oop: { classes, links, nextId },
  worked: { last },
  trace: {},
  custom: { nextId, cards: [] },        // user flashcards; sid "personal" = non-curriculum bucket
  srs: {},                              // card key -> {ef,ivl,reps,due,last,views,lapses,lastRating}
  sessions: [],                         // study log {id,ts,date,type,subject,ref,dur,metrics} — capped at 2000
  study: { fc: {}, quiz: {} },          // per-topic tallies keyed "sid:ref" (fc: {seen,right,wrong};
                                        // quiz: {attempts,best,lastPct}). Created lazily by the engines,
                                        // NOT in DEFAULTS — but LOAD-BEARING: the home and subject
                                        // dashboards read it for their stat strips. Not legacy.
  governor: { hp, gold, xp, owned, theme, seal,
              avatar: {kind,id,img,crop,frame},
              banner, bannerImg, bannerCrop,
              shelfSkin, shrineStyle, lastTick, lastBacklogDrain,
              milestones },             // milestones: lazily-created map of streak-bonus keys → run-start date
  calendar: { nextId, seeded, events, notifyDays, notified },
  assignments: {                          // Build 6.4 — THE canonical assignment
    v, nextId,
    items: [ /* {id,title,subject,type,description,assigned,due,dueTime,status,
                  progress,priority,estimateMins,actualMins,subtasks[],notes,
                  topics[{subject,ref}],alerts[],alerted{},showInCalendar,
                  showInCountdown,rewarded,created,updatedAt,submittedAt,
                  completedAt} */ ]
  },
  todo: { nextId, manual, autoChecked },   // manual[] is LEGACY — emptied by the 6.2 migration
  reminders: {                            // Build 6.2 — the Reminders page's store
    v, nextId, migrated,
    items: [ /* {id,title,notes,done,completedAt,due,dueTime,priority,listId,
                  tags[],subs[{id,text,done}],recur,alerts[minutes],alerted{},
                  lastRewardedOn,created,updatedAt} */ ],
    lists: [ /* {id,name,colour} */ ],    // containers — ONE per reminder
    rewardLog: {}                          // "YYYY-MM-DD" -> paid completions (anti-farming cap)
  },
  focus: { active, nextId, lastConfig, lastReading },
  tracker: { nextId, entries: [] },
  resources: { nextId, items: [] },
  media: { layout, sort,
           books: { layout, sort, tab, physLayout },
           vn: { layout, sort },
           game: { layout, sort },
           wishlist: { tab, sort } },     // Budget Planner view prefs, NOT on state.wishlist
  wishlist: {                             // Build 3g Purchase/Budget Planner
    nextId,
    budget: { monthlyLimit, currency, history:[{month,spent,items:[…]}] },
    items: [ /* {id, module:"books"|"vn"|"game", title, coverUrl, coverCrop, price,
                  currency, retailer, retailerUrl, priority, releaseDate,
                  status, linkedEntryId, physicalVolumeNumber, notes, addedAt,
                  purchasedAt, collectionAppliedAt, collectionHandoffError} */ ]
  }
}
```
File attachments live in IndexedDB `kurenai-os-files`, not this localStorage
shape. The full backup still includes them, media entries, and every non-token
media kv record. AniList/VNDB credentials remain deliberately excluded.

### Shared image positioning (Build 5)

`js/core/imagecrop.js` owns both rendering and the one reusable modal. Its
persisted crop shape is `{x, y, zoom}`: `x`/`y` are focal percentages (0–100)
and `zoom` is 1–3. `normalise(null)` deliberately returns `null`; render helpers
interpret that as `{x:50,y:50,zoom:1}`, preserving centred cover-fit for old
records. `prepareFile()` resizes/compresses the whole frame for storage but
never cuts it to the preview ratio. The modal previews the caller's final
aspect ratio and owns upload/URL (when allowed), pointer focal selection,
sliders, centre, reset, cancel and save.

Persistence is split by domain:

- app identity: `store.state.governor.avatar.crop` and `bannerCrop` beside the
  existing `img` / `bannerImg` source;
- media covers: entry `coverCrop` plus `coverCropSource` (the artwork
  fingerprint that keeps positioned synced art stable), and
  `physical.volumes[].coverCrop` for per-volume overrides (IndexedDB v7);
- vault heroes: media kv `hero.<module> = {entryId,banner,crop}`; synced AniList
  attribution remains in `entry.extra.bannerImage` and is never overwritten;
- connected profiles: account-keyed kv `profile.anilist.<viewerId>` and
  `profile.vndb.<userId>`, each storing visual overrides as
  `{banner:{source,crop},avatar:{source,crop}}`; a null AniList override source
  continues to use the live remote profile image;
- Purchase Planner: `state.wishlist.items[].coverCrop` beside `coverUrl`.

The localStorage fields and all non-token media kv/entry fields round-trip via
`store.exportFull` / `importFull`; profile and hero visual preferences therefore
survive backup/restore, while connection tokens still do not. Older images with
no metadata remain centred. Old avatar/banner/volume data URLs that earlier
code already destructively cropped cannot recover pixels that were discarded;
the new system positions the surviving source sensibly and all new uploads keep
their full frame.

### Collection Matrix detail

**Books** — dual-tracking on ONE entry. Top-level fields = digital half; `physical: { owned, volumes: [{number, condition, purchaseDate, price, coverUrl, coverCrop}] }` = physical half. Books-only axes: `author`, `format` (manga|lightNovel|oneShot), `mood`, `shelves`, `dnf`, `progress.volumes/totalVolumes`. Half-star ratings use shared 0–10 score (UI shows /5).
- `normalise()` is the single schema gate; also maps legacy `module:"manga"/"ln"` → `"books"` forever.
- MANGA sync additionally requests `progressVolumes` + staff (author = first Story/Art role, translators excluded).
- Bookshelf spines: `KOS.books.spineColor(title)` — deterministic palette hash.
  Per-volume uploads are whole-frame compressed data URLs with a separate 2:3
  `coverCrop`; do not restore the former destructive canvas crop.
- Reading heatmap = sessions log filtered to `metrics.module:"books"`, drawn with `KOS.charts.heatmap`.

**Books deepening (3i)** — Physical/Digital is a TAB SPLIT (`media.books.tab`), not a data split. A legacy `layout:"shelf"` pref migrates to Physical tab. The owned%/read% comparison lives in the editor (`.bk-compare`) — keep it there.
- Book lookup: Open Library PRIMARY (`search.json`, covers via `covers.openlibrary.org`; avoids the /isbn/ endpoint — it 302s). Google Books FALLBACK ONLY (keyless quota zeroed). `externalIds.isbn13` is reference-only — not indexed, nothing syncs on it.
- Barcode scanning is capability-detected (`BarcodeDetector` + `getUserMedia` + `ean_13` format check); typed ISBN is the permanent baseline.
- Reading sessions reuse the Focus Timer (`kind:"reading"` — do NOT build a second timer). Logs `type:"media"`, module books, action `"reading-session"`.
- Ranked shelves: membership stays `shelves:[]`; order is per-shelf id lists in media kv (`books.shelfOrder`). Reordering unlocks only in List layout with the shelf as the sole filter. Sort disabled while shelf is selected.

**Visual Novels** — VNDB sync fills title, developer, cover, content-tags-as-genres (category "cont", spoiler 0, rating ≥ 2, top 6), length estimate. Routes are user-built: `routes: [{name, cleared, completedAt}]`; `normalise()` derives progress from them. Other axes: `cgGallery: {totalKnown, unlockedCount}`, `contentWarnings`, `quotes: [{text, context, loggedAt}]`.
- VNDB auth: `Authorization: Token <token>` (personal token, no OAuth); ulist votes 10–100 (÷10 → shared score); labels 1 Playing / 2 Finished / 3 Stalled / 4 Dropped / 5 Wishlist; 6 Blacklist → skip row.
- **Quote → flashcard**: `KOS.srs.addCustom(KOS.srs.PERSONAL_SID, "vn", q, a, {src})` — personal bucket, not a subject. Personal cards ride normal SM-2; study surface is `personaldeck` view.

**Games** — MANUAL-ENTRY ONLY (Steam dead end — see invariant #20). Axes: `publisher`, `completionTier` (notStarted|storyComplete|fullCompletion|platinum|abandoned), `platform` (pc|playstation|xbox|switch|other), `playtimeHours` (null = unknown), `backlogPriority`, `externalIds.steamAppId` (store link only).
- `normalise()` derives progress from playtimeHours (current = hours, total = null, unit "hr").
- Bulk paste-in (`KOS.games.parseBulkTitles`): one title per line → Planned drafts; dedupes within paste and against vault case-insensitively; logs ONE session for the whole paste.
- Editor nudges: tier abandoned → status dropped; any completion tier → completed.

**Anime deepening (3f)** — `KOS.anime.currentSeason(date)`: device date → AniList enum by calendar quarter. Seasonal view filters `extra.season`/`extra.seasonYear`; entries without season data don't appear. Palette via `s-winter|s-spring|s-summer|s-fall` classes.
- Airing data: `KOS.anilist.fetchAiring(ids)` — airingAt unix SECONDS + episode; can be null. Memory-cached 10 min; refreshed on view load + manual ⟳.
- Watch heatmap = same `KOS.charts.heatmap`, sessions filtered to `metrics.module === "anime"`.
- AniList profile (`aniprofile.js`): six tabs (Overview/Analytics/Favourites/Social/Activity/Notifications) over ONE cached fetch — switching tabs must never refetch. Analytics reads anime and manga formats, statuses, lengths and release years from that same bundle. 5-min in-memory cache. Banner/avatar visual overrides and crops live in account-keyed media kv; they do not alter or erase the remote AniList source/attribution.

**Sync integrity (3h)**
- `KOS.media.dedupeVault(module, cb)`: merges rows sharing an external id (or title where exactly one id-bearing cluster exists), keeping the UNION of the manual layer; list state follows the freshest copy; ambiguous same-title-different-id rows are never merged. Re-run-safe. Runs once at boot (4 s delay, if `vndb.lastSync` exists, flag `maint.dedupe3h`) and manually from Vault maintenance.
- Import modes: default = update-and-add; "Replace everything from this source" passes `opts.replace = {module, source, protect}` — rows missing from incoming list are deleted UNLESS `hasLocalData` or id is in `protect` (flashcard-referenced entries). Replace never touches other modules or other sources.

**Reward-on-sync + autosync (3j)**
- `bulkUpsert` returns `res.rewards`; sync callers pass to `KOS.media.logSyncRewards(module, events)` — ONE session per sync per module. Governor caps: 60 XP / 12 gold. XML import ignores rewards.
- `STATUS_RANK`: planned 0 · onHold/dropped 1 · inProgress 2 · completed 3. Moving TO dropped never rewards. Below-watermark: lowers silently, no clawback.
- Autosync (`autosync.js`, starts 8 s after boot): AniList anime + manga (2.5 s apart) + VNDB every 15 min, on `online`, on visibilitychange past interval. Cycle: flush stranded FAILED pushes first, then pull. Kill switch: `autosync.enabled` (kv, default ON). Auth failures toast once per session; network failures silent.
- VN chapters: `chapters: [{name, status, notes}]` — parallel to routes, never derived from VNDB, don't drive progress. Completing one logs a "chapter" session (precedence: added > status > route > chapter > quote).
- VNDB profile (`vndbprofile.js`): `/ulist_labels` + `/user` length-votes +
  vault-derived stats. `/stats` is gathered best-effort but is site-wide, not
  personal, and is not currently rendered. VNDB has no favourites/followers/
  activity — the view states that; do not fake parity panels. Its user-supplied
  avatar/banner and crop metadata live only in account-keyed media kv.
- Shop anchors: ~15–30 gold/day steady study → big labs 180, sims 100, themes 140, seals 70, frames 90, Matrix cosmetics 80. `shelfskin` → class on `.bk-shelves`; `shrinestyle` → class on `.shrine-hall`.
- Season picker walks any season/year via `SEASON_ORDER` stepping; palette class follows selection.

**Purchase / Budget Planner (3g)** — `js/modules/wishlist.js`, view `wishlist`, `KOS.wishlist` API. Wishlist across Books/VNs/Games against ONE shared monthly budget pool (never per-module limits). Stored in `state.wishlist` (localStorage), NOT the media vault — these are planning records, not media entries; they ride the standard backup because `exportFull` serialises the whole state object. Manual `coverUrl` values carry a sibling `coverCrop` used by cards and the release-desk hero.
- **GOVERNOR BOUNDARY (invariant #5a)**: this module never calls `KOS.sessions.log` / `KOS.media.logActivity`, never moves HP/gold/XP/streaks, and emits ZERO network. smoke14 asserts a full flow leaves all of them untouched. Do not "helpfully" reward purchases.
- Core interaction: `wantToBuy` items carry checkboxes that SIMULATE a purchase — `selectedTotal(ids)` + `remaining(limit, spentThisMonth, selected)` recompute live (can go negative = over budget). The vertical allowance ledger keeps this provisional selection separate from committed/planned value and actual spent. Nothing is spent until `markPurchased(id[,ts])`, which flips status, sets `purchasedAt`, and archives a snapshot into `budget.history[month].items` (recomputing `spent`). Idempotent — re-marking never double-archives; edits refresh that snapshot, and reverting/removing a purchase removes it from planner history without destructively deleting an already-created Collection entry. The limit is edited through the shared modal shell, not a permanently visible input. Currency can only change before priced items or purchases exist: there is no hidden FX conversion or amount relabelling.
- Charts reuse `KOS.charts` only: `spendByMonth()` → spend-over-time bars; `spendByModule()` → per-module split over the shared pool (books vs VN vs games). The planner deliberately keeps charts hidden until at least three purchases form a useful multi-month or multi-module comparison; the empty state explains what will appear.
- Tabs: Want-to-buy / Waiting-for-release / Purchased. Draggable priority reorder within a tab (`reorder(status, orderedIds)` rewrites `priority` 0..n); priority, release, price and recency sorting are view-only prefs. `featuredItem()` owns the release desk: it retains a waiting item through release day and the next full calendar day, moves it to Want to buy on the following day, and rotates equal-date releases by hour. `nextToDrop()` remains the nearest-upcoming compatibility helper.
- Linking, BOTH directions: an item's `linkedEntryId` ties it to a vault entry. `forEntry(entryId)` powers the reverse surfacing — `wishlist.js` registers a `KOS.mediaEditorHooks` entry that injects an `.wl-onlist` banner into the editor form when the opened entry is on the wishlist. On confirmed purchase, the local handoff creates an unlinked Book as a physical-volume entry or an unlinked VN/Game as planned; a linked Book gains the selected physical volume, while an existing VN/Game status is never downgraded. It never fuzzy-matches titles, and failure leaves the purchase/history intact for retry. Module ids match the vault ("game", not "games" — incoming "games" is normalised).
- **Release dates are MANUAL by design** — no viable automated cross-media source: Amazon PA-API needs an approved affiliate account and bars price-watch use, Keepa is a paid per-key subscription, IGDB (games only) needs a Twitch OAuth secret a static `file://` app can't hold and covers no books. The UI says so plainly; don't add a scraper.

**Collection Goals v2** — `js/modules/goals.js`, view `goals`, `KOS.goals` API. Stored in `state.goals = {v:2,nextId,items,completionLedger}` so the standard state backup/restore includes goals and their anti-farming receipts; legacy `{metric,target,progress}` records migrate through one normaliser. Automatic types read only local Collection/Planner truth: completed titles, episodes, chapters, volumes, a specific entry, a title series/filter (list, tag or genre), budget ceiling, library size, favourites, purchases, game hours and cleared VN routes. Custom/manual remains available. Goals keep title, description, notes, measure, target/current, linked media/filter, dates, status and computed progress. Spend-below goals settle at their deadline; other measurable goals complete as soon as their target is reached. Failed/expired and manually reopened states are explicit. The editor is the single structured modal; its local title/filter lookup never triggers provider traffic.

**Shrine Hall of Fame** — `js/modules/shrine.js`, view `shrine`, with view preferences in `state.media.shrine = {module,sort,description}`. It is a read-only ranking over favourites: a large rank-one feature, compact ranked remainder, media-type filter, sorting, one-item and empty compositions, and an optional hall note. The 900×560 share card uses the same export-safe cover resolver and the persisted `coverCrop`; it includes rank, score, type, title, one or two useful metadata fields, an editable default message and restrained KurenaiOS branding. Cosmetics still attach through `.shrine-hall`.

**Write-back (3d)** — `js/core/mediapush.js`, list state only (invariants 12–16 apply).
- AniList mutation `SaveMediaListEntry(mediaId, status, progress, progressVolumes, scoreRaw)` — `scoreRaw` (0–100) is used so pushes are independent of user's site scoring format.
- VNDB: `PATCH /ulist/<id>` (vote 10–100, labels_set/unset) — CORS blocks browser PATCH (invariant #19). Client implements the shape anyway; fails with a specific explanation, never "you're offline".
- Debounce 350 ms per entry + queue dedupe by id + read-latest-at-execute.
- Paper trail: every attempt appends to kv `push.log` (cap 200). Success updates `lastSyncedAt`; final failure persists `entry.push:{state:"failed"}` (⚠ retry chip on cards).
- Search-and-add (`mediasearch.js`) is create-then-mirror: confirmed create yields `syncSource` set; otherwise entry lands as `syncSource:"manual"` with its external id kept so a later pull claims it.

**One-time manual setup for live sync:**
- **AniList**: register client at https://anilist.co/settings/developer, Redirect URL = `https://anilist.co/api/v2/oauth/pin`, paste Client ID into Sync & Import. Tokens last 1 year.
- **VNDB**: generate personal token at https://vndb.org/u/tokens with "access to my list" (+ "modify my list" for write-back). Paste into Sync & Import. Both tokens live in media DB kv, never localStorage.

### Adding deep revision content

Add to any file under `js/data/content/` (and add a `<script>` tag in `index.html` if creating a new file):

```js
window.KOS_CONTENT["subject:ref"] = {
  notes: [ "paragraph", {h:"Heading"}, {ul:[...]}, {ol:[...]},
           {kv:[["Term","Definition"]]},
           {table:{head:[],rows:[]}},
           {code:{lang:"csharp|sql|pseudo",src:"..."}},
           {callout:{t:"def|tip|warn|miscon|mnemonic|memorise|formula|info", h:"optional header", body:"string or [blocks]"}},
           {steps:[{h:"heading",m:"main text",n:"optional note"}]},
           {worked:{tag:"example|variation|exam|check", title:"...", steps:[{m:"working line",n:"optional why"}], result:"final answer"}},
           {svg:{src:"<svg>…</svg>", cap:"caption"}},
           {page:"Page title"} ],
  flashcards: [["Question","Answer"]],
  quiz: [{q:"...", opts:["a","b"], ans:0, why:"..."}],
  exam: [{q:"...", marks:4, ms:["mark point"]}],
  gens: ["genId"],   // worked-example generator IDs from worked.js
  sims: ["simId"]    // simulation IDs from sims.js
};
```

Badges, tabs, coverage stats, and search pick up the entry automatically. Reuse existing class names — tests key off them (`.study-tab`, `.notes-article`, `.n-call-*`, `.fc-card`, `.qz-opt`, `.logic-tt`, `.sec-card`).

### Adding a new view/module

1. Register: `KOS.views.myView = function(main, arg) { ... }`
2. Add a rail button in `index.html`: `<button class="rail-item" data-view="myView">...</button>`

### Key files to hand-edit

| File | Purpose |
|------|---------|
| `js/data/intel.js` | Examiner tips/pitfalls keyed `"subject:ref"` |
| `js/data/content/*.js` | Deep revision content |
| `js/labs/worked.js` | Worked-example generators (push into `GENS` array) |
| `js/labs/trace.js` | Data structure trace lab tabs |
| `js/labs/sims.js` | Simulations |

`js/data/compsci.js`, `maths.js`, `it.js` are **generated** — edit the parsers and re-run `gen_data.py` instead.
