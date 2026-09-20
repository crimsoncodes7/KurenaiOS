# KurenaiOS engineering reference

Despite the historical filename, this is the canonical engineering reference for
any contributor or coding agent. `README.md` describes the product,
`PROGRESS.md` records the current delivery state, and `AGENTS.md` is the concise
execution contract. Keep implementation history in Git rather than rebuilding a
chronological diary here.

## Current baseline

- Category 7 A–G is integrated, deployed and production-verified.
- Production: https://kurenai-os.pages.dev
- Release source checkpoint: `8b6c513` (VN progress sources, VNDB relay, list mirror, card bars)
- Runtime release: `79e7c1b` — immutable deployment
  https://5096e6e7.kurenai-os.pages.dev
- Last milestone tag: `milestone/category-7-ui-ux-overhaul`
- Service-worker version: `kos-vn-progress-2`
- Required smoke gate: 54 / 54 suites.

## Run, test and deploy

There is no build step or bundler. Classic script tags allow `index.html` to run
from `file://`. Use HTTP for PWA, cloud and browser-audit work.

```sh
python3 -m http.server 8765
npm install jsdom fake-indexeddb       # test-only dependencies, once
for i in "" {2..54}; do node "tools/smoke${i}.test.js"; done
```

For responsive or shared-component work, run the dense audit and inspect images,
not only JSON:

```sh
node tools/responsive_audit.mjs --seed
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
- Supabase: optional replication layer; never the only successful write path.
- `store.exportFull()` / `importFull()`: state, media, non-token kv and files;
  credentials/sessions are deliberately excluded.

### Primary ownership map

| Contract | Owner |
|---|---|
| DOM primitives, dialogs, tabs, scrollers, rendering | `js/core/ui.js` |
| Live regions and activation helpers | `js/core/a11y.js` |
| Hash URL/history | `js/core/router.js` |
| Cross-domain search | `js/core/search.js`; presentation in `hub.js`/`mobile-shell.js` |
| Study content and engines | `content.js`, `hub.js`, `js/engines/` |
| User edits to the curriculum and the study editor | `js/core/edits.js`, `js/modules/editor.js` |
| SM-2, sessions and rewards | `srs.js`, `sessions.js`, `governor.js` |
| Calendar/reminders/assignments/Focus | matching modules in `js/modules/` |
| Integrated weekly plan and pacing | `js/core/pacing.js`, `js/modules/pacing.js` |
| Collection schema and sync | `mediadb.js`, `media*.js`, provider clients |
| Vault presentation/editors | `medview.js`, four vault modules, `KOS.mediaEditors` |
| Cloud replication | `cloud.js`, `cloudmerge.js`, `cloudsync.js`, `cloudui.js` |
| Assistant | `assistant-*.js` services and `js/modules/assistant.js` |
| Shared image placement | `js/core/imagecrop.js` |

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
   still counts as activity for the day-drain check.
4a. `KOS.governor.focusAward({complete, mins, pauses})` is the one pure definition
   used by previews and payment; the completion screen reports `lastAward()`.
4b. A Focus session is logged and paid before its review opens. Review may annotate
   that record and linked work but must never log or pay again.
4c. Page hide banks the live clock with `KOS.store.flush()`. Reload/navigation is
   not a session, pause or distraction; recovery returns paused.
5. One deliberate bulk/sync action produces at most one session. Autonomous
   multi-provider sync batches rewards; XML import does not reward.
5a. Budget Planner is logistics: zero Governor traffic and zero provider/network
   traffic. Purchase handoff is exact, local and cannot downgrade Collection data.
5b. Goals completion records one idempotent `payout:"activity-only"` receipt and
   never creates a second economic event.

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
    regenerate; use `--format-existing` only for a payload-preserving format pass.
25. Authored content keys target visible leaf refs only. Callout objects need two
    closing braces; validate every edited JS file.
26. Preserve established class names and the three subject hues. Extend shared
    tokens/components rather than hard-coding a page patch.
26a. Atelier Dawn is the default; Dawn/Dusk and shop themes derive from root tokens.
26b. Theme variants target `:root[data-theme="..."]`; unknown legacy ids map to
    the default.
26c. `KOS.imageCrop` is the only crop/focal workflow. Persist source and
    `{x,y,zoom}` separately; cancel/reset do not write.
26d. Study statistics and formatting are derived once in `hub.js`; every surface
    reads the same functions and a bar describes the value printed beside it.
27. Navigate via `KOS.show()`. Assignments, reminders and events each have one
    canonical store; other surfaces derive from them. Use `KOS.workspaceTabs` for
    Review, Planner and Sync.
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
    cross-reference to the state means adding it there.
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
    are stale-while-revalidate; navigation is network-first; shell precache derives
    from `index.html`.
38. `skipWaiting()` runs only after the user confirms. Bump `sw.js` `VERSION` for
    every asset deployment; the app works without a service worker.
39. Persistent storage is requested sparingly and never promised. Background Sync
    is an enhancement, not the correctness path.
40. Phone composition begins at 700px: bottom tabs, canonical tree drawer, bottom
    sheets, 16px inputs and safe-area support. Generate icons with
    `tools/gen_icons.mjs`.
41. `KOS.calendar.normalise()` is the event schema gate; `state.calendar.v` is not
    placed in store defaults. `time` remains the start-time field.
42. Event alerts are per-record. New exam/deadline defaults are applied only in
    `addEvent()`, never by normalisation.
43. Recurrence is computed from one record, never materialised into copies.
44. Countdowns merge canonical calendar deadlines and assignment reads; assignment
    and reminder chips are derived and never written as events.
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
    landmark inside one external scroller shell.
50a. A page description is `.dh-sub > span.board` — 14px on `--muted` — and
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
54. Study and Home use shared derivations and preserve navigation/focus on redraw.
55. Mangaka owns its compact discovery grammar; do not restore the old permanent
    filter wall.
56. All four vaults use the shared `medview` shell/editor/filter/action contracts.
57. Collection Overview summarises the vaults without becoming a second vault or
    duplicating provider controls.
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
    says so, nothing started is no bar. Charts use labelled axes/marks, an
    11px label floor and honest low-data states.

### The editable curriculum (86–89)

86. Curriculum files (`js/data/content/*.js`, the generated specifications) are
    never written at runtime. A user edit FORKS one topic and one kind
    (`notes`, `spec`, `flashcards`, `quiz`, `exam`) into
    `state.edits.topics["sid:ref"]` through `KOS.edits.set()`, and every reader
    takes the EFFECTIVE material: `KOS.content.get()/has()` and
    `KOS.srs.curriculumCards()` consult `KOS.edits` first. `reset()` deletes the
    fork and the shipped material returns exactly.
87. A forked flashcard keeps the SM-2 key it shipped with (`sid:ref:i`) through
    every edit, reorder or neighbour deletion; a card added in the editor gets
    `sid:ref:<rowId>`. Rewording never resets a schedule.
88. Every fork row carries an `id`: shipped rows a DETERMINISTIC `s<i>`, new
    rows a random string. The cloud merge keys nested record arrays on it, so
    two devices forking the same topic fold the shared rows and keep both
    devices' additions. Ids are never shown or referenced.
89. The study editor (`KOS.editor.mount`) is the ONLY surface that changes a
    topic's material; the page beside it is the preview, re-rendered through
    `openTab({keep, reveal})`. `state.ui.editing` remembers an open editor per
    device so a redraw reopens it. Content blocks may carry an `id`, which the
    renderer wraps in `.n-blk[data-bid]` (display:contents) and otherwise
    ignores; `{p}` and `{md}` are renderer block types. Notes/Quiz/Exam tabs are
    always present on a topic — an empty tab is where material is added —
    and a zero count is never printed (invariant 77).

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
    (`.med-ro`, empty facts omitted) and edits only list state (pushed back)
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
    lists EVERY status of the season, watching first. Its hero carries one
    credited piece of scenery per season (`KOS.anime.SEASON_META[].art`,
    hot-linked, small sample as the background while the full frame loads)
    or the user's own picture from media kv `hero.season.<SEASON>` (source
    + crop, through `KOS.imageCrop`; per device like every hero pick).

### The notification centre (95–98)

95. `state.notify` is ONE ledger of things that happened TO THE USER
    (`items`, natural string ids `kind:record:occurrence`, capped at 200
    and 45 days) plus `read` and `airing` keyed maps. Kinds are calendar,
    reminder, assignment, airing and wishlist only: sync cycles, cloud
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
    and posts `kos-open`, which `pwa.js` routes through `KOS.show()`. There
    is no push server and the page says so; a closed app stays quiet.

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
    24px-with-spacing exception.
70. Use shared `--z-*` tokens and account for ancestor stacking contexts.
71. `KOS.search.run()` is a pure cross-domain disclosure layer. It searches user
    study/organisation/Collection data but never credentials, provider kv/logs,
    sessions or Assistant audits; async results revalidate the active query.

### Responsive integration and visual release quality (72–79)

72. `mobile-shell.js` moves canonical search, filter and section controls into
    dialogs and restores them. JS-dependent hiding is gated by
    `.mobile-shell-ready` so the unenhanced fallback stays usable.
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
79. Elevation is theme-derived through `--shadow-ink`/shared shadow tokens; Dawn
    and Dusk keep equivalent hierarchy without hard-coded black shadows.

### The integrated weekly plan (80–83)

80. `js/data/pacing.js` is a SEED, not a feed. It was imported once from the four
    Notion databases (school scheme of work, both personal curriculums, IT F201)
    plus the week hub that carries the alignment; `KOS.pacing.ensureSeeded()`
    copies it into `state.pacing` once and is a no-op afterwards, so a user edit
    or a cloud pull is never overwritten by the file that shipped. Nothing in
    this domain performs a network request, and Notion is never read again.
81. `KOS.pacing.normalise()` is the schema gate. A plan row's `refs` are
    generated specification leaves and are dropped if the leaf does not exist.
    An EMPTY `refs` array is a deliberate statement that the published
    specification does not name that topic — never back-fill a near-enough leaf,
    because the plan would then open the wrong topic page.
82. Pacing stores no progress, mastery or confidence. Coverage is READ from
    `state.progress` through the linked leaves, so the plan row and the topic
    page cannot disagree; the per-row state it owns is a note and, on a
    PERSONAL row, the tick (`done`/`doneAt`, `KOS.pacing.setDone`) — "I did
    the week's item", the plan's own bookkeeping, never a claim about
    mastery. Class rows never take a tick. Pacing is logistics like the
    Budget Planner: zero Governor traffic, zero sessions.
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
85. The braid is the alignment evidence as topology, not a second dataset: one
    branch per shared spec point, packed into commit-graph depths, with a
    non-scrolling key column so a lane always says whose it is. The diagram is
    one `role="img"`; every branch is repeated as a real button beneath it,
    which is the keyboard and screen-reader route. No shared refs draws no
    diagram. The legend names every mark, so the tab carries no explanatory
    header — the long version is a Help & Guide entry.

## Extension notes

### Deep content and labs

Every `KOS_CONTENT["subject:ref"]` entry follows `js/core/content.js`; use
`js/data/content/cs-datastructures.js` as the depth reference.

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
  `js/labs/worked-extra.js`; additional sims live in `js/labs/sims-maths.js` and
  `js/labs/sims-cs.js` and use the shared `KOS.sims.canvas` / `KOS.sims.COL`.
- Lab canvases take every colour from `KOS.labPalette()` (theme tokens resolved
  once per `data-theme`), never from a fixed hex palette — the old dark ink was
  invisible on Atelier Dawn.

### Navigation hierarchy

- Study: subjects, Review and Exams & Papers.
- Productivity: Focus, Calendar, Reminders, Tasks & Habits and Pacing.
  Pacing has two identities in one route and they cannot collide, because a
  week is always an ISO date: `#/pacing/YYYY-MM-DD` is the week surface and
  `#/pacing/braid` is the whole-term branch graph, which spans every week and
  so carries none.
- Collection: Overview and four vaults, Shrine, Planner and Sync.
- Review retains `due` and `cardstats` compatibility routes.
- Planner and Sync use `KOS.collectionWorkspaceTabs()`; transitions still call
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
- Shared visual behaviour: tokens/primitives in `css/main.css` and `js/core/ui.js`
  before adding view-local variants.
- New views: register under `KOS.views`, add the script in dependency order and
  navigate through `KOS.show()`.
- State/schema changes: update the one normaliser/migration gate and add regression
  coverage before changing presentation.
