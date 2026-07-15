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
```
(smoke4–smoke16 additionally need `npm install fake-indexeddb` — jsdom ships no IndexedDB.)

All suites resolve `ROOT` via `path.resolve(__dirname, "..")`, so they run from
any checkout location. They load every `<script src="…">` in `index.html`; CDN
scripts (KaTeX) are marked `defer` so the tests skip them.

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
the Build 4.0 / Build 5 addenda at the end of `PROGRESS.md` — prioritised
backlog, user-owed manual steps, rough edges and the current test inventory.
All 16 suites are the release gate (smoke16 covers shared image positioning,
DB v7 and its backup boundaries). All 16 plus the running-Chrome visual audit
were verified green on 2026-07-13.

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

**Media schema & storage**
6. `mediadb.normalise()` is the SINGLE schema gate — any new field must be
   added there or every `put()` silently strips it. New axes = new DB version
   + migration + indexes. The current database is v7. `coverCrop` is companion
   display metadata, not a query/filter axis, so v7 normalises/migrates it but
   deliberately adds no meaningless crop index.
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
20. Steam is a three-way verified dead end (check_authentication response
    unreadable cross-origin; https→file:// return blocked; claimed_id is a
    bare SteamID64). Games stay manual-entry-only; do not re-attempt without
    new facts.
21. Book lookup: Open Library PRIMARY, Google Books FALLBACK ONLY (keyless
    quota is zeroed, 429). Goodreads is dead — never add it.
22. AniList MAL-format XML exports carry MAL ids, not AniList ids (they
    coincide only below ~22k). Rate limits: AniList degraded 30 req/min
    (batch 50, pace ~2.4 s, honour Retry-After); VNDB 200 req/5 min (pace
    ~1.6 s).
23. Airing data is cached in MEMORY only (10-min TTL) — never written to the
    vault, never background-polled. The AniList profile is ONE GraphQL
    request, read-only (`resetNotificationCount: false`).

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
27. Navigate only via `KOS.show` (history/forward/rail state). Charts are
    hand-built inline SVG via `KOS.charts` — no charting library.
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
   `vndb.js`, `bookapi.js`, `media.js`, `mediapush.js`, `autosync.js`.
   `imagecrop.js` must follow `ui.js` (it uses `KOS.ui.el`) and precede every
   renderer/editor that consumes it.
3. **Deep content** — `js/data/content/*.js` populate `window.KOS_CONTENT["subject:ref"]`
4. **Engines** — `js/engines/{flashcards,quiz}.js`
5. **Modules** — `js/modules/hub.js` + `due.js`, `calendar.js`, `todo.js`, `governor-ui.js`, `tracker.js`, `rag.js`, `cardstats.js`, `attachments.js`, `help.js`, `focus.js`, then `medview.js` (the shared vault-view toolkit: cover/lazy list/pills/empty states, the editor shell, quickEdit + push chip — every vault view builds on it), the four vault views `anime.js`, `books.js`, `vn.js`, `games.js` (each registers its editor in `KOS.mediaEditors` — dispatch lives in core/media.js, so their relative order after medview.js is free), `aniprofile.js`, `vndbprofile.js`, `wishlist.js` (registers a `KOS.mediaEditorHooks` entry for "on your wishlist" surfacing), `goals.js`, `matrix.js`, `shrine.js`, `mediasync.js`, `mediasearch.js`. `hub.js` also owns the Compare Topics workspace: it is read-only over deep content/progress except `state.study.compareNotes`, which is a pair-keyed personal note and therefore rides normal state export/import.
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
  todo: { nextId, manual, autoChecked },
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
