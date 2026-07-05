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
```
(smoke4–smoke12 additionally need `npm install fake-indexeddb` — jsdom ships no IndexedDB.)

Note: both test files resolve `ROOT` via `path.resolve(__dirname, "..")`, so they
run from any checkout location — no path editing needed. They load every
`<script src="…">` in `index.html`; CDN scripts (KaTeX) are marked `defer` so the
tests skip them (they only eval local files) while the browser still loads them.

**Regenerating spec data** from PDF sources:
```sh
# requires Python 3 + pdfplumber
python tools/parse_aqa.py    # → aqa.json
python tools/parse_maths.py  # → maths.json
python tools/parse_it.py     # → it.json
python tools/gen_data.py     # aqa/maths/it.json → js/data/*.js
```

**Current status & backlog**: see the "SNAPSHOT — 2026-07-05" section at the end
of `PROGRESS.md` — prioritised backlog, user-owed manual steps, rough edges
(R1–R13), and the test inventory. All 12 suites verified green 2026-07-05.

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
   and capped at 60 XP / 12 gold per sync per module). XML import ignores the
   reward list entirely.

**Media schema & storage**
6. `mediadb.normalise()` is the SINGLE schema gate — any new field must be
   added there or every `put()` silently strips it. New axes = new DB version
   + migration + indexes.
7. Media entries live in IndexedDB `kurenai-os-media`; attachments in
   `kurenai-os-files`; API tokens in the media kv store. The localStorage
   backup JSON covers none of these on its own, but `store.exportFull`/
   `importFull` (R3, 2026-07-05) now produce one combined JSON that covers
   all three — tokens deliberately excluded (see permanent design decision in
   PROGRESS.md). IndexedDB is origin-scoped: `file://` and `localhost` vaults
   are different databases.
8. Views NEVER render the whole vault at once — lazy 60-entry batches via the
   IntersectionObserver sentinel; filters walk real DB indexes, no in-memory
   scans.
9. `bulkUpsert` merge: sync wins on list state, but the manual layer ALWAYS
   survives — Books: `physical`, `mood`, `shelves`, active `dnf`, local
   `author`/`format`; VN: `routes`, `quotes`, `chapters`, `cgGallery`,
   `contentWarnings`, local `developer`. `extra` accretes (fresh non-null
   wins; null never beats stored). Progress re-derives from surviving routes.
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
    regen, diff per-ref against the committed files first).
25. Content keys only on LEAF refs (non-empty `content[]`). Callouts need TWO
    closing braces. No bare-string paragraphs in notes (user preference —
    wrap prose in callouts).
26. Reuse existing class names — engines/views/tests key off them. Restyle
    through `:root` tokens; never repurpose the three subject hues.
27. Navigate only via `KOS.show` (history/forward/rail state). Charts are
    hand-built inline SVG via `KOS.charts` — no charting library.
28. The `KOS.mediaEditor` wrap chain is game → vn → books → anime base, fixed
    purely by script-tag order in index.html — don't reorder those four tags.
29. VN CG gallery is a COUNTER only — never store/scrape artwork. Content
    warnings are manual — never auto-filled from VNDB tags.

## Architecture

### Script-tag globals, no bundler

All JS is loaded via `<script src="...">` in `index.html` in strict dependency order. Everything shares a single global namespace `KOS`. No `import`/`export` — this is intentional so `file://` works without a server.

### Load order (from `index.html`)

1. **Data** — `js/data/{compsci,maths,it,intel}.js` populate `window.KOS_DATA.*`
2. **Core** — `store.js`, `ui.js`, `content.js`, then Build 2a: `srs.js` (SM-2
   engine + card registry), `sessions.js` (session log + streaks), `governor.js`
   (HP/gold/XP, catalog, gating, avatar, HUD), then Build 3a/3c/3d: `mediadb.js`
   (IndexedDB media vault), `anilist.js` (AniList API client), `vndb.js`
   (VNDB Kana API client), `bookapi.js` (3i — Open Library / Google Books
   lookup client), `media.js` (module registry, XML import, rest
   streak, governor trickle, shared quick-edit + push chip), `mediapush.js`
   (the shared write-back utility), `autosync.js` (3j — the autonomous
   two-way sync loop)
3. **Deep content** — `js/data/content/*.js` populate `window.KOS_CONTENT["subject:ref"]`
4. **Engines** — `js/engines/{flashcards,quiz}.js` register engine logic onto `KOS`
5. **Modules** — `js/modules/hub.js` (home, subject dash, ref view, search) +
   `due.js`, `calendar.js`, `todo.js`, `governor-ui.js`, `tracker.js` (exams/
   papers), `rag.js` (struggle flags), `cardstats.js` (SVG stats dashboard),
   `attachments.js` (IndexedDB Files tab), `help.js`, `focus.js` (Focus Timer),
   then Build 3a/3b/3c: `anime.js` (loads FIRST of the Matrix views — it owns
   the base `KOS.mediaEditor`), `books.js` (Books vault + editor + Mangaka
   view; wraps `KOS.mediaEditor` so matrix/shrine route Books entries to the
   Books editor), `vn.js` (VN vault + editor; wraps `KOS.mediaEditor`
   again), `games.js` (3e — Games vault + editor + bulk paste-in; the
   final wrap: the chain is game → vn → books → anime base),
   `aniprofile.js` (3f — the AniList profile view, tabbed since 3j),
   `vndbprofile.js` (3j — the VNDB profile view), `matrix.js`,
   `shrine.js`,
   `mediasync.js` (AniList + VNDB connect / XML import / enrichment / write
   log), `mediasearch.js` (3d find-new: external DB search + create-then-
   mirror add, shared across the three modules)
6. **Labs** — `js/labs/{worked,trace,oop,sims}.js` register their views
7. **Boot** — `js/main.js` wires the rail nav, runs the governor boot sequence
   (seed samples → HP tick → cosmetics → view gates → HUD → reminders), restores
   the last view

### Module map & data flow (who owns what, how it connects)

**Governor spine** (everything behavioural funnels through one pipeline):
```
any completed activity ──► KOS.sessions.log({type, subject, ref, dur, metrics})
                                │
              ┌─────────────────┼──────────────────────┐
   governor.onSession       streak derivation      todo/RAG/stats read it
   (pays XP/gold/HP;        (study streak skips    (cardstats, rag.auto,
    media type → 0 HP,       media + incomplete     heatmaps, burn-down —
    rest-streak only)        focus; rest streak     ALL charts read the
                             = media days only)     same log)
```
- `srs.js` owns SM-2 + the unified card registry (curriculum `"sid:ref:i"`,
  custom `"u<id>"`, personal bucket sid `"personal"`); `due.js` renders the
  queue + personal deck. `governor.js` owns HP/gold/XP/catalog/gates/HUD;
  `governor-ui.js` the panel. `focus.js` owns the ONE timer state machine
  (study `kind` default; Books reading sessions reuse it via `kind:"reading"`).
  `tracker.js`/`rag.js` feed struggle detection; `calendar.js`/`todo.js` the
  planning layer. All state in `KOS.store` → localStorage.

**Collection Matrix** (leisure; separate storage, same sessions log):
```
IndexedDB kurenai-os-media (v5) ── mediadb.js owns schema (normalise = the gate),
       │                           indexes, bulkUpsert (merge + rewardDelta)
       │
  media.js — module registry, XML import, logActivity/logSyncRewards,
       │     quickEdit + push chip, dedupeVault (shared by all four vaults)
       │
  vault views: anime.js (base mediaEditor; + seasonal/airing/heatmap)
               books.js (wraps editor; physical vault, shelves, lookup via bookapi.js)
               vn.js    (wraps again; routes/chapters/quotes/CG)
               games.js (final wrap; manual-only, bulk paste)
  cross-cutting views: matrix.js (home), shrine.js (favourites),
               mediasync.js (connect/import/maintenance), mediasearch.js (⊕ find-new),
               aniprofile.js / vndbprofile.js (read-only profiles)
```
- **Read path**: `anilist.js`/`vndb.js` clients → `bulkUpsert` (merge contract:
  sync wins list state, manual layer survives) → `res.rewards` → caller logs
  ONE sync-reward session. `autosync.js` drives this every 15 min (flush
  failed pushes first, then pull).
- **Write path**: editors/quick-edit/+1 → `mediadb.put()` (absorbs the reward
  watermark) → `mediapush.schedule()` (350 ms debounce, field-scoped payloads)
  → AniList mutation (VNDB blocked by CORS). `mediasearch.js` is the separate
  create-then-mirror path for adding new entries.
- **The watermark loop**: `entry.reward` = last state the app accounted for.
  Local saves absorb it at `put()`; pulls diff against it before absorbing —
  so external progress rewards once, and a pull that echoes a push rewards
  zero. This is THE mechanism that makes two-way sync economy-safe.

### Key globals

| Global | Purpose |
|--------|---------|
| `KOS.store` | Single state object, autosaved to `localStorage` key `kurenai-os-v1` on every mutation |
| `KOS.ui` | `el()` DOM builder, `toast()`, `flashSaved()` |
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
  /* Build 2a — Behavioural Governor */
  custom: { nextId, cards: [] },        // user flashcards {id,sid,ref,q,a,created,src?}
                                        // sid may be the reserved "personal" bucket (3c):
                                        // non-curriculum cards, e.g. VN quotes (ref "vn")
  srs: {},                              // card key -> {ef,ivl,reps,due,last,views,lapses,lastRating}
  sessions: [],                         // study log {id,ts,date,type,subject,ref,dur,metrics}
  governor: { hp, gold, xp, owned, theme, seal, avatar,
              shelfSkin, shrineStyle,     // 3j: Matrix cosmetics (null = default look)
              lastTick, lastBacklogDrain },
  calendar: { nextId, seeded, events, notifyDays, notified },
  todo: { nextId, manual, autoChecked },
  focus: { active, nextId, lastConfig,     // live focus-session snapshot
           lastReading },                  // 3i: last reading-session config {workMin,bookId}
  tracker: { nextId, entries: [] },        // exam/paper records (FR-3.4/3.5)
  resources: { nextId, items: [] },        // per-subject link tables (FR-2.8)
  media: { layout, sort,                   // Build 3a: view prefs ONLY (entries live in IndexedDB)
           books: { layout, sort,          // Build 3b: Books view prefs (layout: grid|list — shelf migrated to physLayout)
                    tab, physLayout },     // Build 3i: lens tab (digital|physical) + Physical-tab layout (shelf|grid|list)
           vn: { layout, sort },            // Build 3c: VN view prefs (layout: grid|list)
           game: { layout, sort } }         // Build 3e: Games view prefs (layout: grid|list)
}
```
File attachments (FR-2.5) live in IndexedDB `kurenai-os-files`, NOT in this
object — they are excluded from the JSON backup.

All mutations go through `KOS.store.*` methods so autosave fires automatically.
Governor invariants: streaks/XP/HP flow ONLY from `KOS.sessions.log(...)` (never
write them directly), and HP/gold gate only labs/sims/shop — core revision
(spec, notes, flashcards, quizzes, exam Qs) must never lock.

### Collection Matrix (Build 3a + 3b + 3c + 3e + 3f)

Media entries live in IndexedDB **`kurenai-os-media`** (v5), NOT localStorage
and NOT the backup JSON — 650 real anime entries. `js/core/mediadb.js` owns the
shared schema (one shape for anime/books/vn/game: status, progress,
ownership, score, shared tag/genre taxonomy,
`externalIds.{anilistId,malId,vndbId,steamAppId}`, `syncSource`,
`lastSyncedAt`) and all queries run through real indexes
(module, status, [module,status], genres/tags/mood/shelves multiEntry, author,
developer, all external ids). Views must NEVER render the whole vault at
once — `anime.js`/`books.js`/`vn.js`/`games.js` lazy-render in batches of 60 via an
IntersectionObserver sentinel.

**Books (3b) — dual-tracking on ONE entry, never two.** The top-level
list-state fields (status/progress/score/externalIds/syncSource) ARE the
digital reading half; the independent physical half is
`physical: { owned, volumes: [{number, condition: mint|good|worn|damaged,
purchaseDate, price, coverUrl}] }`. Either half is optional. Books-only axes:
`author` (manual, kept whatever the sync source), `format`
(manga|lightNovel|oneShot), `mood` (own axis, not genre), `shelves`
(user-defined), `dnf: {isDnf, reason}` (orthogonal to status),
`progress.volumes/totalVolumes`. Half-star ratings reuse the shared 0–10
score (UI shows /5 in .5 steps). Books invariants:
- **`normalise()` is the single schema gate** — any new field must be added
  there or every `put()` silently strips it.
- The DB v2→v3 upgrade migrates legacy `module:"manga"/"ln"` rows to
  `module:"books"` (+`format`); `normalise()` also maps those names forever.
- **`bulkUpsert` merge: sync wins on reading state, but `physical`, `mood`,
  `shelves`, an active `dnf` and local `author`/`format` ALWAYS survive** —
  a sync must never eat the physical vault.
- MANGA-type sync/enrichment additionally request `progressVolumes` + the
  `staff` connection (author = first Story/Art role, translators excluded);
  the anime queries deliberately do NOT carry staff. Query shapes validated
  live 2026-07-02.
- The manga XML path applies the MAL-id fix from the start, but its field
  shape (`series_mangadb_id`, `my_read_chapters/volumes`, `series_type`) is
  tested against the EXPECTED MAL-export pattern only — no real AniList
  manga export has been inspected yet; verify one when available.
- Bookshelf spines use `KOS.books.spineColor(title)` — deterministic palette
  hash, same series → same colour across sessions. Per-volume custom covers
  reuse the avatar canvas-compress pattern (2:3 rect, JPEG base64, in the
  entry — never localStorage).
- Mangaka pages group by the author string AS WRITTEN (no entity
  resolution — accepted limitation). Reading heatmap = the same
  `sessions` log filtered to `metrics.module:"books"`, drawn with
  `KOS.charts.heatmap` (added 3b, lives with the other chart helpers in
  `cardstats.js`).

**Books deepening (3i) — tab split, lookup, reading sessions, ranked
shelves.**
- **Physical/Digital is a TAB SPLIT, not a data split**: two lenses on
  the one vault (`media.books.tab`; Physical adds `owned:true` to the
  query and has its own `physLayout`, defaulting to shelf). A series
  tracked both ways shows in both. The owned%/read% comparison lives IN
  the editor (`.bk-compare`) so the split can't bury it — keep it there.
  A legacy `layout:"shelf"` pref migrates to the Physical tab in
  `prefs()`.
- **Book lookup** (`bookapi.js`): **Open Library is PRIMARY** (verified
  live 2026-07-04: `search.json` sends `access-control-allow-origin: *`,
  same endpoint takes `q=` and `q=isbn:…`; covers via
  `covers.openlibrary.org/b/id/{cover_i}-M.jpg`; the dedicated
  /isbn/ endpoint is avoided — it 302s and returns author keys, not
  names). **Google Books is FALLBACK ONLY: keyless requests answer 429
  with quota_limit_value 0** (verified live same day — Google zeroed
  keyless Books quota; CORS itself is fine). Don't reorder the
  providers without new facts. Goodreads is dead (no keys since 2020) —
  never add it. Lookups prefill the add form; they never write the
  vault directly. `externalIds.isbn13` (canonical, 10→13 converted) is
  reference-only — no index, nothing syncs on it.
- **Barcode scanning is capability-detected, never assumed**: button
  exists only if `BarcodeDetector` + `getUserMedia` are present,
  `getSupportedFormats()` checked for `ean_13`, camera refusal degrades
  to a toast; typed ISBN is the permanent baseline. (User's Chrome
  149/macOS verified live: API present with ean_13.)
- **Reading sessions REUSE the Focus Timer state machine** (`focus.js`,
  `kind:"reading"` — do NOT build a second timer): finish logs
  `type:"media"`, module books, action `"reading-session"` with the
  measured `dur`, so heatmap/rest-streak/trickle come free. Boundary:
  reading NEVER touches HP (distraction nicks are skipped for
  `kind:"reading"`) or the study streak; ending early forfeits nothing.
- **Ranked shelves extend shelves, they don't duplicate them**: entry
  membership stays `shelves:[]`; the order is per-shelf id lists in the
  media kv (`books.shelfOrder`). `KOS.books.applyShelfOrder` is pure.
  Reordering (drag + ▲▼) unlocks only in List layout with the shelf as
  the sole filter — any extra filter would save a partial order. Sort
  is disabled while a shelf is selected: the shelf IS the order.

**Visual Novels (3c) — VNDB metadata + a MANUAL tracking layer.** The honest
division of labour: VNDB sync/enrichment fills title, `developer`, cover,
content-tags-as-genres (category "cont", spoiler 0, rating ≥ 2, top 6) and a
length estimate (`extra.length`/`extra.lengthMinutes`). It does NOT provide
routes — VNDB has no clean structured route/branch data for most titles —
so `routes: [{name, cleared, completedAt}]` is user-built, and for
`module:"vn"` with routes, **`normalise()` DERIVES progress from them**
(current = cleared count, total = routes.length), which is how the
cross-media UI reads VNs for free. Other VN axes: `cgGallery:
{totalKnown, unlockedCount}` (a counter ONLY — never store/scrape CG
artwork), `contentWarnings` (manual, deliberately never auto-filled from
VNDB's tags), `quotes: [{text, context, loggedAt}]`. VN invariants:
- The v3→v4 upgrade adds the `vndb` + `developer` indexes; `bulkUpsert`
  matches vndbId first, then anilistId, then malId.
- **`bulkUpsert` merge: sync wins on list state, but `routes`, `quotes`,
  `cgGallery`, `contentWarnings` and a local `developer` ALWAYS survive**,
  and progress re-derives from the surviving routes — a sync must never
  eat the manual layer or zero a route count.
- VNDB facts verified live 2026-07-03 against the OFFICIAL endpoint
  `https://api.vndb.org/kana` (community wrappers reference a third-party
  proxy `api.vndbproxy.org` — never use it): CORS works from file://
  (preflight allows Origin null + the Authorization header; POST answers
  `access-control-allow-origin: *`); auth header is `Authorization: Token
  <token>` (no OAuth — personal token from vndb.org/u/tokens); ulist votes
  are 10–100 (÷10 → shared score); statuses come from labels (1 Playing /
  2 Finished / 3 Stalled / 4 Dropped / 5 Wishlist; 6 Blacklist → skip the
  row; 7 Voted is virtual); documented limit 200 req/5 min — the client
  paces ~1.6 s between bulk calls and honours Retry-After on 429.
- **Quote → flashcard**: a logged quote can be sent to the custom-card
  system under the reserved sid `"personal"` (ref `"vn"`) via
  `KOS.srs.addCustom(KOS.srs.PERSONAL_SID, "vn", q, a, {src})` — a
  non-curriculum bucket, NOT one of the three subjects. Personal cards ride
  the normal SM-2 schedule/due queue; their study surface is the
  `personaldeck` view (registered in `due.js`). Reviewing them logs a
  normal `flashcards` session (study, not rest) — only media *logging* is
  rest.

**Games (3e) — MANUAL-ENTRY ONLY, permanently and by verified necessity.**
Steam's data API blocks browser CORS (no workaround), and Steam OpenID
sign-in was tested live 2026-07-03 and ABANDONED: the check_authentication
verification response carries no Access-Control-Allow-Origin header, so a
browser can send the verification POST but never read `is_valid` —
verification requires a server this app deliberately doesn't have (also:
https→file:// return navigation is browser-blocked, and even unverified,
claimed_id is a bare SteamID64 — the display name needs the CORS-blocked
Web API). Do NOT re-attempt a Steam connection without new facts; the dead
end is documented user-facing on Sync & Import and in Help. Games axes:
`publisher`, `completionTier` (notStarted|storyComplete|fullCompletion|
platinum|abandoned — finer than the shared status on purpose), `platform`
(pc|playstation|xbox|switch|other, null on non-game rows), `playtimeHours`
(null = unknown, never a fake 0), `backlogPriority` (low|medium|high|null),
hand-entered `externalIds.steamAppId` (store link only — nothing is ever
fetched with it). Games invariants:
- For `module:"game"`, **`normalise()` DERIVES progress from
  playtimeHours** (current = hours, total = null, unit "hr") — same trick
  as VN routes; there is no separately-stored game progress to drift.
- The v4→v5 upgrade adds the `platform` + `steam` indexes; `stats()`
  tallies per-tier counts (`m.tiers`) and hours (generic `m.episodes`).
- **Bulk paste-in** (`KOS.games.parseBulkTitles`, pure + exported): one
  title per line → Planned drafts; trims, skips blanks, dedupes within
  the paste and against the vault case-insensitively, 300-char cap. The
  whole paste logs exactly ONE session (`action:"bulk-add"` + count) —
  one deliberate act; per-row logging would mint gold like a bulk import.
- Games are NEVER push-eligible (`mediapush.eligible` → null regardless
  of ids/syncSource) and the module must emit zero network traffic —
  smoke8 asserts no request ever mentions steam.
- Editor nudges mirror the Books DNF pattern: tier abandoned → status
  dropped; any completion tier → completed. Save logs the most
  significant delta only: added > tier > status > progress (hours up).
- Manual cover upload reuses `KOS.books.compressVolumeCover` (2:3 canvas
  JPEG, stored in the entry as base64 — never localStorage).

**Anime deepening (3f) — Seasonal, airing countdowns, heatmap, profile.**
- `KOS.anime.currentSeason(date)`: device date → AniList's enum by
  calendar quarter (WINTER Jan–Mar, SPRING, SUMMER, FALL). The Seasonal
  view (`KOS.views.seasonal`, lives in anime.js) filters on
  `extra.season`/`extra.seasonYear` — defaulting to today, any season
  reachable via the 3j picker; entries without season data don't
  appear — accepted limitation, stated in-view. Palette shifts via
  `s-winter|s-spring|s-summer|s-fall` classes that set `--season` and
  point `--accent` at it — token-system mode, never hardcoded one-offs.
- **Airing data is LIVE data**: `KOS.anilist.fetchAiring(ids)` (shape
  verified live 2026-07-03: airingAt unix SECONDS + episode; airingAt can
  be weeks out on RELEASING shows, and can be null entirely). Cached in
  MEMORY only (`KOS.anime.refreshAiring`, 10-min TTL, force flag) — never
  written to the vault, never polled in the background; refreshed on
  Anime/Seasonal/Matrix load + manual ⟳. Badges on vault cards; "Airing
  soon" list on the Matrix home BESIDE the consuming strip.
- `bulkUpsert` merge now accretes `extra` (fresh non-null wins, null
  never beats stored) — without this an XML re-import wiped
  season/studio and emptied the Seasonal view.
- Watch-history heatmap = Books' reading heatmap retargeted: same
  sessions log, filtered `metrics.module === "anime"`, same
  `KOS.charts.heatmap`. Do not implement a second heatmap.
- **AniList profile** (`aniprofile.js`, view `aniprofile`): the WHOLE
  page is ONE GraphQL request (`fetchProfileBundle` — Viewer + aliased
  followers/following/activity/notifications Pages; verified live).
  Quirks encoded from live testing: followers/following require the
  userId variable declared `Int!`; ListActivity.status/progress are
  STRINGS ("watched episode", "5 - 8"); meanScore is /100;
  AiringNotification text composes from `contexts`. Read-only:
  `resetNotificationCount: false` — never consume the site's unread
  badge. 5-min in-memory cache; nothing persists.

**Sync integrity (3h) — the VNDB duplication bug and its guards.**
- **THE live-API fact that caused the bug**: a Kana `/ulist` row's
  TOP-LEVEL `id` IS the VN id; the nested `vn` record carries NO id, even
  when "vn.id" is requested (verified live 2026-07-04). `mapListEntry`
  must take the id from `r.id` — reading `r.vn.id` gives null, every
  synced entry becomes unmatchable, and each re-sync duplicates the whole
  list. Mocks of /ulist must NEVER include a nested vn.id (smoke6 did,
  which is how the bug shipped past 3c's dedup test). AniList does not
  share the bug (GraphQL returns `media { id idMal }` reliably).
- **Title-claim fallback** in `bulkUpsert`, vn-only: an incoming vn row
  with a vndbId that misses the index may claim an existing vn row that
  has NO vndbId and the same titleLower, backfilling the id. Never
  crosses modules, never touches a row with a different id, one claim
  per stored row per batch. This is what lets a post-fix sync adopt both
  bug-damaged rows and hand-made VN entries instead of re-duplicating.
- **`KOS.media.dedupeVault(module, cb)`**: merges rows sharing an
  external id — or a title where exactly ONE id-bearing cluster shares
  it — keeping the UNION of the manual layer (routes/quotes/CG/warnings/
  notes/physical/tags/favourite); list state follows the freshest copy;
  ambiguous same-title-different-id rows are never merged. Re-run-safe.
  Runs once automatically at boot (main.js, 4 s delay, only if
  `vndb.lastSync` exists, flag `maint.dedupe3h` in kv) and by hand from
  the Sync & Import "Vault maintenance" panel.
- **Import modes** (AniList sync, VNDB sync, XML import): default is
  update-and-add (plain `bulkUpsert`); "Replace everything from this
  source" passes `opts.replace = {module, source, protect}` — rows of
  that module+syncSource missing from the incoming list are deleted
  UNLESS `mediadb.hasLocalData(e)` (physical/routes/quotes/CG/warnings/
  notes/mood/shelves/dnf/tags/favourite) or their id is in `protect`
  (entries referenced by personal flashcards — `KOS.media.
  protectedCardIds`). Those are kept + updated and reported ("kept
  because they have your own data attached"). Replace never reaches
  manual/other-source rows or other modules.

**Reward-on-sync + autonomous sync (3j) — ONE diff-based reward mechanism
for both directions, and a pull loop that makes "Sync now" optional.**
- **The reward watermark**: every entry carries `reward: {progress,
  volumes, status}` — the last state already accounted for. `null` =
  never initialised. `normalise()` gates it like every field;
  `mediadb.put()/add()` **absorb it on every local save** (editors,
  quick-edit, +1, the post-push re-put — all funnel through them), so the
  watermark always equals the last state the app itself produced. The one
  write path that does NOT absorb-first is `bulkUpsert` (raw cursor
  writes) — exactly the pull path, which compares the FINAL merged list
  state against the watermark (`mediadb.rewardDelta`) BEFORE absorbing.
- **What rewards**: progress above the watermark (chapters/episodes +
  volumes for books) and status advances up `mediadb.STATUS_RANK`
  (planned 0 · onHold/dropped 1 · inProgress 2 · completed 3; a move TO
  dropped never rewards). Below the watermark (rewatch, correction,
  drop-and-restart) → watermark lowers, NO reward, NO clawback;
  re-advancing later re-earns (stated, accepted). Inserts and null
  watermarks initialise silently — a first sync of 650 entries mints
  nothing.
- **Who logs**: `bulkUpsert` returns `res.rewards` (events) and NEVER
  logs sessions itself. Sync callers (manual buttons + autosync) pass
  them to `KOS.media.logSyncRewards(module, events)` — ONE session per
  sync per module (`action:"sync-reward"`, entries/units/advances), the
  games bulk-add precedent. XML import deliberately ignores the list.
  The governor prices it proportionally (capped at 60 XP / 12 gold per
  sync) — HP stays 0 like all media. enrichOnly can't move list state so
  it can't reward.
- **THE core property, pinned by smoke12**: local edit → one logActivity
  reward + watermark absorbed at put + push fires; a pull that echoes the
  pushed state back produces ZERO reward events. One watermark, updated
  by whichever path acts first.
- **Autosync** (`js/core/autosync.js`, started from main.js 8 s after
  boot): pulls AniList anime+manga (2.5 s apart) and VNDB every 15 min,
  on the `online` event, and on visibilitychange past the interval.
  Cycle order: flush stranded FAILED pushes FIRST (AniList only — VNDB
  writes are behind their CORS wall and retrying policy is noise), then
  pull, so local edits win the last-write-wins race after an offline
  stretch. Plain update-and-add always — replace mode stays manual-only.
  Kill switch `autosync.enabled` (kv, default ON) + last-cycle report
  `autosync.lastReport` surfaced on Sync & Import. Auth failures toast
  once per session; network failures are silent (offline is normal).
- **VN chapters**: `chapters: [{name, status (shared enum), notes}]` — a
  user-defined layer PARALLEL to routes (never nested, never derived from
  VNDB, most VNs leave it empty). Chapters do NOT drive progress (routes
  keep that job). They survive `bulkUpsert` merges, count as
  `hasLocalData`, union by name in `dedupeVault`, and completing one
  logs a "chapter" session (precedence: added > status > route > chapter
  > quote).
- **Profiles**: `aniprofile.js` is now five tabs (Overview / Favourites /
  Social / Activity / Notifications) over the SAME single cached fetch —
  switching tabs must never refetch. `vndbprofile.js` (view
  `vndbprofile`) is built from what the Kana API genuinely exposes —
  /ulist_labels with counts (customs included), /user length-votes,
  /stats site totals (all verified live 2026-07-04) + vault-derived list
  stats. VNDB's API has NO favourites/followers/activity/notifications —
  the view states that; do not fake parity panels.
- **Gold shop**: 2a placeholder prices made real (anchor: ~15–30
  gold/day of steady study → big labs 180, sims 100, themes 140, seals
  70, frames 90, Matrix cosmetics 80). New kinds `shelfskin` (class on
  `.bk-shelves`, applied in books.js from `governor.shelfSkin`) and
  `shrinestyle` (class on `.shrine-hall`) — cosmetics stay buyable while
  strained; only labs suspend.
- **Season picker**: the Seasonal view defaults to today and walks any
  season/year via `SEASON_ORDER` stepping — same `extra.season/
  seasonYear` filter, palette class follows the SELECTION.

**Write-back (3d) — `js/core/mediapush.js`, ONE shared mechanism.** The
3a "read-only by design" rule is lifted for LIST STATE ONLY. Invariants:
- **Eligibility**: only `syncSource:"anilist"` entries with an anilistId
  (anime/books) and `syncSource:"vndb"` entries with a vndbId (vn) ever
  push. Manual/imported entries never attempt it.
- **Field scoping is by construction**: the payload builders only know
  status, progress (+ volumes for books), score. Physical vault, mood,
  shelves, notes, quotes, routes, CG counts, content warnings have no code
  path to a payload. VNDB's ulist has NO progress field, so a VN pushes
  status (labels_set/labels_unset over managed labels 1–5 only) + vote;
  `mediapush.snapshot()` for VN compares status|score only, so route edits
  never trigger a push. Local score 0 = unrated → score/vote OMITTED, a
  remote rating is never cleared by an unrated local entry.
- **Debounce 350 ms per entry** (the hub.js notes-autosave interval) +
  queue dedupe by id + read-latest-at-execute — rapid "+1" clicks coalesce.
  Edit paths call `KOS.mediapush.schedule(rec)` after comparing
  `snapshot()` before/after; bulkUpsert (pull sync) never schedules.
- **AniList mutation** `SaveMediaListEntry(mediaId, status, progress,
  progressVolumes, scoreRaw…)` — arg names/types verified by live schema
  introspection 2026-07-03; `scoreRaw` (0–100) is used so pushes are
  independent of the user's site scoring format. Search is
  `Page.media(search:, type:, sort: SEARCH_MATCH)` (ran live).
- **VNDB write is `PATCH /ulist/<id>`** (vote 10–100, labels_set/unset;
  needs a listwrite token; 204 on success) — endpoint verified live, BUT
  **VNDB's CORS preflight only allows POST/GET/OPTIONS, so browsers block
  the PATCH entirely** (verified 2026-07-03; independent of token
  permissions). The client implements the documented shape anyway (works
  the moment VNDB opens up PATCH), fails with a specific explanation (never
  "you're offline"), doesn't retry the CORS wall, and toasts it once per
  session.
- **Paper trail**: every attempt appends to the kv `push.log` (cap 200,
  shown on Sync & Import). Success updates lastSyncedAt; final failure
  persists `entry.push:{state:"failed"}` (a ⚠ retry chip on cards —
  in-flight "pending" is in-memory only via `mediapush.isPending`).
- **LAST-WRITE-WINS, deliberately**: no conflict detection with edits made
  on the sites themselves — whichever side writes last overwrites. Stated
  in Help and the Sync & Import copy; scope boundary, not a bug.
- **Search-and-add** (`mediasearch.js`, the ⊕ Find new button) is
  create-then-mirror, NOT the debounced push: one deliberate act → one
  remote create → only a confirmed create yields `syncSource` set +
  `lastSyncedAt`; otherwise the entry lands locally as `syncSource:
  "manual"` WITH its external id kept so a later pull sync claims it
  (matched via `mediadb.getByExternal`). Adds log `logActivity("added")`.
- Inline quick-edit (status/score on cards) is the shared
  `KOS.media.quickEdit` in media.js — one implementation for all three
  vaults; status changes log a "status" session, score-only changes don't
  (matches the editors).

Matrix invariants:
- **HP is never touched by this module in either direction** — media sessions
  award 0 HP and are excluded from the day-drain activity check and the study
  streak (`sessions.js`); they feed only the independent **rest streak**.
- Deliberate log actions (add / +1 progress / status change) go through
  `KOS.media.logActivity` → `sessions.log({type:"media"})` (+4 XP/+1 gold);
  bulk sync/import must NEVER log per-entry sessions. The single 3j
  exception: a sync that discovered EXTERNAL progress logs ONE
  proportional `sync-reward` session per module via
  `KOS.media.logSyncRewards` — watermark-filtered, capped, still 0 HP.
- AniList/VNDB writes go through `mediapush.js`/`mediasearch.js` ONLY, and
  only ever touch list state (3d) — nothing else sends a mutation, no
  deletes, no favourites, no reviews.
- The AniList token + client ID live in the media DB's `kv` store, never in
  localStorage (they must not ride into the backup JSON export).
- **ID semantics** (verified live): AniList's MAL-format XML export carries
  MAL ids (`externalIds.malId`; they only coincide with AniList ids below
  ~22k). Public enrichment queries `idMal_in`, returns both ids, and
  backfills `anilistId` so authenticated syncs match imported rows.
  `bulkUpsert` matches anilistId first, then malId — never duplicate a show.
- AniList API is rate-limited (currently degraded: 30 req/min + burst
  limiter) — batch by 50 ids, pace ~2.4 s, honour Retry-After on 429.

**One-time manual setup the user must do for live sync** (cannot be automated:
requires their logins):
- **AniList**: register an API client at https://anilist.co/settings/developer,
  set Redirect URL to exactly `https://anilist.co/api/v2/oauth/pin`, then paste
  the Client ID into Sync & Import inside the app. Tokens last 1 year;
  reconnect on expiry.
- **VNDB** (3c/3d): generate a personal token at https://vndb.org/u/tokens with
  "access to my list" ticked — and, for write-back, "modify my list" too
  (though browser pushes stay blocked by VNDB's CORS policy for now — see the
  3d block above). Paste it into Sync & Import. No expiry schedule, but
  revocable; reconnect on 401.
  Both tokens live in the media DB's `kv` store, never localStorage.

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
           {worked:{tag:"example|variation|exam|check", title:"what this example is", steps:[{m:"working line",n:"optional why"}], result:"final answer"}},
           {svg:{src:"<svg>…</svg>", cap:"caption"}},
           {page:"Page title"} ],
  flashcards: [["Question","Answer"]],
  quiz: [{q:"...", opts:["a","b"], ans:0, why:"..."}],
  exam: [{q:"...", marks:4, ms:["mark point"]}],
  gens: ["genId"],   // worked-example generator IDs from worked.js
  sims: ["simId"]    // simulation IDs from sims.js
};
```

Badges, tabs, coverage stats, and search pick up the entry automatically.

### Design system (Build 2.0 "Higanbana" + 2.1 "Liquid Glass")

`css/main.css` is a token-driven dark theme. Work through the `:root` variables
rather than hard-coding values:
- **Liquid Glass (2.1)**: glass tokens `--glass-fill`/`--glass-edge`/`--glass-hi`
  (specular top highlight)/`--glass-sheen`/`--glass-blur` and `--focus-glass`, applied
  in *balance* to chrome, controls, cards, search and modals. Dense reading surfaces
  (notes paragraphs, `.n-code`, `.n-table` cells) keep solid dark backgrounds — only
  their frames get the glass edge.
- **Surfaces**: `--bg` (near-pure black) → `--panel`/`--raise`/`--raise2`; glass
  layers `--glass`/`--glass-top` (used with `backdrop-filter`).
- **Brand/status**: `--kurenai` (crimson chrome) + `--gold`; `--ok/--warn/--paused/--bad`.
- **Subject hues stay distinct** and must not be repurposed: `--c-compsci` jade,
  `--c-maths` azure, `--c-it` violet. Views set `--accent` on a container to tint
  borders/glows for the active subject.
- **Type**: `--disp` (Space Grotesk, chrome/headers), `--body` (Inter), `--mono`
  (JetBrains Mono, refs/code), `--serif`/`--kanji` (Shippori Mincho — the 紅 mark
  and verbatim spec wording). Fonts load from Google Fonts in `index.html`.
- **Also**: spacing scale `--s1..s8`, radii `--r1..r4`/`--r-pill`, elevation
  `--sh-1..3`, motion curves `--e-out/--e-inout/--e-spring` + `--t-fast/med/slow`.
- The ambient spider-lily petals are the `.bg-flora` block in `index.html`; all
  motion is gated behind `@media (prefers-reduced-motion: reduce)`.

When adding UI, reuse existing class names — the engines/views and the smoke tests
key off them (`.study-tab`, `.notes-article`, `.n-call-*`, `.fc-card`, `.qz-opt`,
`.logic-tt`, `.sec-card`, etc.). Restyle freely; don't rename.

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