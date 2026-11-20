# The Collection: media schema, provider sync and the AniList mirror

Release contracts, moved out of `CLAUDE.md` on 17 November 2026 (W8)
word for word; `CLAUDE.md` keeps a one-line index. The historical
numbering is kept: tests, source comments and audit notes cite it.
Read this file before editing or testing anything in its domain.
### Media schema, storage and sync (6–23)

6. `mediadb.normalise()` is the schema gate. The current DB is v8; new query axes
   require a version, migration and indexes. `syncId` is stable across devices and
   preserved on merge.
7. Media, files and tokens use their designated stores. Full backups exclude every
   credential. Browser origins have different IndexedDB databases. Every
   database name carries the data namespace's suffix (`KOS.dataMode.suffix`;
   smoke134 F scans every `indexedDB.open`). The stores: `kurenai-os-media`,
   `-files`, `-filetext`, `-papers`, `-money`, `-reviews`, `-reports`,
   `-ink`, `-mind`, `-creatives`, `-ledger`, `-ja-mined`, `-attempts`, `-backups` and
   `-statemirror`. THE STORE REGISTRY (`js/core/stores.js`, `KOS.stores`,
   RC4) has one row per database: what it holds, the key the full backup
   carries it under (or why it does not), its count and what Reset
   everything does to it. Backup & Restore's "What a backup covers" and
   "Not in the file", and Reset everything (a verified checkpoint, then
   every database but the checkpoints, keeping only the provider sign-ins
   in the media kv, then the state and a reload) are drawn from it; a
   database opened anywhere and missing from it fails smoke134 U. Pictures and personal media never ride the state
   document: the profile picture and banner are file records
   (`KOS.profilePics`) and mined lines are in `kurenai-os-ja-mined`.
8. Vaults and search never render/read an unbounded collection: use indexes,
   cursor caps and 60-entry lazy batches. `mediadb.query({limit})` stops the
   cursor once that many rows matched (a picker that draws eight).
9. Pull sync owns list state but preserves the manual layer and local
   crop/source pairs. Custom lists: a list AniList HAS (the mirror passes
   every AniList list name, `mirrorOpts(module, names)`) follows the pull —
   membership removed there is removed here; a list only this app has
   unions. Non-null fresh `extra` fields accrete. Where you watch, read or
   play a title (`watchUrl`, `watchLabel`; 1C, collection#1) is the manual
   layer: http(s) only, kept by every pull, merge and fold, a reason a
   replace never deletes the row, and never in a push (13). Its icon and
   the title's provider pages are drawn by `KOS.watchLink` from bundled
   CC0 icons, a monogram or your own picture rasterised to PNG in media kv
   (`serviceIcons`); nothing is fetched from the site.
10. VN and Game progress is derived; do not store a parallel progress value.
    A VN counts ONE source — `mediadb.vnSource()`: `progressMode` when set,
    else routes, then chapters, then `playtimeHours` against VNDB's length
    (`vnLengthHours`: `extra.lengthMinutes`, else the 1–5 bucket as a rough
    figure; the derived total is flagged `estimate`), then `progressPercent`
    — and the derived `progress` carries its `unit` (`route`/`ch`/`hr`/`%`).
    Games derive from playtime.
11. Upsert identity order is VNDB id, AniList id, MAL id, each matched ONLY within
    the incoming row's module (MAL numbers anime and manga separately; a match in
    another module is a different title, smoke114). Title claiming is VN-only
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
    + crop, through `KOS.imageCrop`; per device like every hero pick; a new
    one needs the same unlock as the vault heroes, invariant 30). A Seasonal
    card shows "N behind" in its corner (`KOS.anime.episodesBehind`, asked
    for 15 November 2026): episodes out (the next airing episode − 1, or a
    finished run's total for a title in progress) less those watched; none
    for a completed or dropped title.
