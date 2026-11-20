# Cloud sync and the state document

Release contracts, moved out of `CLAUDE.md` on 17 November 2026 (W8)
word for word; `CLAUDE.md` keeps a one-line index. The historical
numbering is kept: tests, source comments and audit notes cite it.
Read this file before editing or testing anything in its domain.
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
33a. Assignments, reminders, reminder lists, their steps and calendar events
    take a RANDOM STRING id (`KOS.store.newId`, "a-…", "r-…", "l-…", "s-…",
    "e-…"; bk:data-integrity#2), as Money's, Routines' and Exams' records do,
    so two devices never mint the same one; records made before keep their
    numbers, and every form, route and Assistant tool reads an id back
    through `KOS.store.idOf` (digits are an old number; tools take the
    `recordId` type). Other records' ids are per-device counters, so two
    devices can mint the same id for two
    records. The merge detects that (same id, absent from base, different
    origin), re-keys the LOCAL record past every id in play and rewrites every
    reference it knows (`RECORDS[].refs`). Adding a record array or a new
    cross-reference to the state means adding it there. EVERY place an id is
    stored is listed (DI-07, smoke143 D): an assignment's id in a study
    block, a goal, an exam's coursework link, a session and its stretches,
    the Focus session running on this device and the Daily Review's picks,
    first tasks and triage keys; an event's in a goal and the review; a
    reminder's and a plan row's in the review. A reference left behind
    followed the OTHER device's record that kept the id. Topic links (`refs`,
    invariant 26e) are spec keys, not record ids, so they are not listed
    there; a record field named in `SET_FIELDS` (`refs`) merges as a set
    against the base instead of as one leaf. An ORDERED list under an
    `ATOMIC_PREFIX` path (the Shrine's tie orders) merges whole — a conflict
    is one leaf — because an element-wise merge of an ordering can double
    one item and drop another.
33b. `focus.active` is per-device like `state.ui`: a running timer is a live
    process, not data, and must never land on another device. Between the
    TABS of one device it is shared (one localStorage) and OWNED BY ONE
    TAB: the tab that holds the session holds the Web Lock `kos-focus`
    (a heartbeat where there are no Web Locks) and stamps the session with
    its `tab`; another tab never restores or starts over it ("A Focus
    session is running in another tab or window"), and picks it up only
    when its owner is gone. `finish()` logs once per session
    (`metrics.fid` = id@startedAt): a second finish pays nothing.
33c. ONE STATE DOCUMENT, MANY TABS (`js/core/store.js`, RC5; smoke133).
    Each tab keeps a BASE, the last document it read from or wrote to
    localStorage. A save runs under the Web Lock `kos-state-write`: read
    what is stored; if another tab wrote, three-way merge (base, memory,
    stored) with the cloud merge's own rules; write the rev
    (`kurenai-os-v1.rev`) first, then the document. A change EVERY open tab
    would make by itself (the day's HP drain, a cloud document applied, the
    recovery from the mirror) goes through `KOS.store.transact(fn)` — under
    the lock, on top of what the other tabs wrote, written at once — so it
    happens once. Equal changes to gold, XP or HP in two tabs are summed
    only when each tab logged sessions of its own (`ownSessions`); the same
    document applied twice is one change. A merge or adopt changes the
    state IN PLACE (object identity kept), so a module's reference stays
    live. An unreadable stored document is copied aside first (one slot in
    localStorage, the rest in the mirror; Storage lists each with Download
    and Delete) and nothing is written over it until that is done. With
    localStorage full the mirror is the primary: each write is read, merged
    and put in one IndexedDB transaction and the stored rev is marked
    (`<rev>m`) so the other tabs take it in; `flush()` returns a promise
    and the update reload waits for it. A pagehide in that mode cannot wait
    for IndexedDB: the known limit.
33d. A CLOUD DOCUMENT LANDS IN ONE STEP (`cloudsync.js` `land`; smoke135).
    One tab runs a cycle at a time (Web Lock `kos-cloudsync`). Whatever
    brings a document in — a pull, a push that lost its compare-and-set,
    the first link — an older device's mined lines go to this device's
    store, the local document is kept first (`cloudsync.prereplace.<uid>`,
    and PINNED as `cloudsync.prelink.<uid>` the first time a device is
    linked: never overwritten, offered in Storage), and then the dirty
    check, the merge and the replace run in ONE `KOS.store.transact`. The
    replace is IN PLACE (`KOS.store.replaceState` → `applyDoc`, 1A, 19 Nov
    2026): every object and every row with an id keeps its identity, so a
    page or module holding part of the state still writes into the live
    state after it (smoke196 G). An
    edit made while that copy was being written is merged and pushed, never
    overwritten. A data URL new in the cloud copy's avatar or banner (an
    upload on an older-version device) takes the slot over a local move.
    `KOS.cloudsync.settled()` says this page load holds the account's copy
    or has none to wait for.
34. Empty remote state cannot overwrite meaningful local state. First link is
    automatic in every case (adopt an empty device, upload to an empty account,
    merge two histories with no base); a restore/rebaseline is the only
    unconditional overwrite and it preserves tombstones. WHAT COUNTS AS THE
    USER'S DATA is one definition, `KOS.cloudsync.userData`: every record
    array and evidence map, a setting moved from its shipped value, a Daily
    Review ACTED in — never what a fresh boot plants (the SAMPLE events and
    their assessments, the plan seed, default categories) or a review only
    looked at. A device that holds data is combined with the account only
    after a VERIFIED checkpoint; one that will not verify backs off
    (5 minutes doubling to 6 hours for automatic cycles; Sync now always
    tries) and after three failures the user may link without it. The
    no-base merge leaves out this device's untouched seeds and takes the
    account's value wherever this device still has the shipped one, and its
    result is pushed as a compare-and-set, never an unconditional
    overwrite. THE FIRST OPEN (design turn 41, decision B8, `js/modules/welcome.js`):
    a new device plants NO SAMPLE events (the test harness keeps them as a
    fixture, `window.KOS_SAMPLE_EVENTS`); a pristine device (this
    definition, leaving out badges the device earned by itself and the
    theme picked on the welcome) that is signed out with cloud sync set up
    opens on ONE screen — "Sign in to bring your data" (the existing
    sign-in, in place; then "Bringing your data" until `settled`, then
    Home) or "Start fresh" (Home's three first steps while still
    pristine) — answered per device (`state.ui.welcomed`); the plan's
    carry-over notice waits for the answer. Signed out and never synced
    (`state.ui.everSynced`), the header chip reads "Not synced · Sign in"
    and opens the same sign-in, until "Use this device only"
    (`state.ui.localOnly`, Account & Cloud Sync). A successful push
    broadcasts a data-free "changed" note on a Realtime channel so other open
    devices pull within seconds; the timers remain the safety net.
    WHAT A RESTORE OR FIRST LINK CHANGED IS SAID, counted (1A,
    data-integrity#3/#4/#6, assistant-archive#1, bk:collection#2): both
    count the state's domains before and after (`KOS.store.tally`, counts
    only), a first link counts the Collection's rows by where they came
    from, and a restore names the backup's date and the parts the file did
    not carry (this device's own are kept). One toast says the first few,
    with Details; the whole report is kept per device
    (`state.ui.lastReport`) and shown on Backup & Restore. While a link
    waits on a backup that will not verify, the notice offers to download
    a copy of this device first. Sync & Import keeps what each provider
    pull changed (`sync.result.<source>.<module>` in the media kv) and says
    it later.
35. The publishable key is public; RLS is the boundary. Never commit/log a token or
    service-role key. Cloud sessions and sync metadata stay out of backups.
36. Attachment metadata syncs automatically, and so do binaries now (files
    plan §7, decision D): after a good cycle a few files under 25 MB go to
    the private bucket (`autoUpload`, per device `state.ui.filesAutoUpload`,
    on by default); "Sync files now" sends the rest; a file kept on this
    device only (`local`) never leaves. Only an explicit Delete removes the
    remote object; freeing space removes the local binary only.
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
36d. THE STORES BESIDE THE DOCUMENT SAY WHAT HAPPENED (`js/core/sidesync.js`,
    smoke141). Money's transactions, the review log, Mind's Journal, saved
    Reports and handwriting each run their own push-and-pull, and each is
    wrapped by `KOS.sideSync.wrap({id, label, key}, syncCloud)`: every run
    that happened records its outcome per store and per device (media kv
    `sidesync.status`, kept for one account: the last success, the last
    error and its words) and Account & Cloud Sync lists them, a failure in
    red; "Sync now" runs them too. A run that did not happen (signed out,
    busy, a review namespace) is not an outcome. A PULL OVERLAPS: it asks
    for rows from two minutes before its cursor (`KOS.sideSync.since`),
    because the server stamps a row when its transaction commits, so a row
    committed late sat behind a cursor that had passed it and was skipped
    for ever; every replicator ignores a row it already holds and counts
    as pulled only what was new. The main engine's media and file pulls
    and the server runs (`KOS.push.pull`) ask with the same overlap, each
    skipping a row it holds at that stamp. A pull that brought something (or deleted
    something) names its store's key to the change bus (invariant 164,
    `db:money`, `db:reviews`, `db:mind`, `db:reports`, `db:ink`, `db:attempts`) as another
    device's change; a push, an echo or a failure says nothing. A new side
    store is wrapped the same way and listed in the store registry
    (invariant 7).
