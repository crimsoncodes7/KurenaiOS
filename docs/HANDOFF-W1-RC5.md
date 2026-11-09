# W1 RC5 handoff (9 Nov 2026) — for the second account

Read this first, then CLAUDE.md, docs/memory/MEMORY.md and the audit plan
(branch `audit/quality-2026-11`, docs/audit/2026-11/REMEDIATION_PLAN.md §A4, §A5, W1).

## Where it stands
- Branch `feat/w1-integrity` at `0471e06` (NOT pushed, NOT deployed; production is still sw `kos-integrity-5`, main `6c04c6e`).
- RC5 is BUILT and MERGED there (three merges after `98feddd`):
  - two tabs (DI-04): rev + Web Lock + three-way merge on save, storage-event merge, quarantine of an unreadable document, the IndexedDB mirror `kurenai-os-statemirror`, quota fallback, `KOS.store.health()`, `KOS.ui.banner`, every tab reloads on a confirmed update — smoke133;
  - storage moves (DI-10, DI-18, DI-25): avatar/banner into the file store by the automatic repair `profile-pictures-to-files` (`js/core/profilepics.js`), the ledger archive `kurenai-os-ledger` (`js/core/ledgerarchive.js`), Creatives' DB suffix, mined Japanese lines in `kurenai-os-ja-mined` (`js/core/jamined.js`, repair `ja-mined-to-local`), Storage's state meter — smoke134;
  - first sign-in (DI-03: `userData`, `preReplace`, first-link checkpoint), the ext lease per tab + renewal (DI-19), the goal title picker (GO-25) — smoke135.
- Gate on `0471e06`: 133/135; smoke17 passes alone; smoke45 fails ~1 in 6 alone and 0 in 8 on `98feddd` → probably RC5-introduced flake in "a redraw does NOT announce or move focus" (investigate: a background rerender or announce from the store's storage/mirror/banner code within its 400 ms window).
- A 3-agent adversarial review then found the issues below (most CONFIRMED by running them). **None are fixed yet** — a fix workflow was cut off by the usage limit and left nothing (its empty worktrees `.claude/worktrees/wf_7f68b57b-42d-{1,2,3}` and the builders' `wf_3c11fb1c-fd7-{1,2,3}` can be removed with `git worktree remove`).
- **Do NOT deploy RC5 until the P0 and P1s are fixed** — the P0 can double gold/XP with two tabs open, and the P1s can lose data.

## Next steps (in order)
1. Fix the findings below, failing-first tests in smoke133/134/135 (one fixer per area: store/cloudmerge/focus; profilepics/ja/mined; cloudsync/backup/ext/goals). The intended design for each is in the "Fix" line; for the P0, sum equal counter deltas only when both sides added DISJOINT session ids (an applied cloud doc brings the same ids to both → collapse).
2. Run `npm test` (gate 135/135), resolve smoke45.
3. Re-review (≤3 agents), then update CLAUDE.md invariants (7 store list, 33b/focus.active across tabs, 115 mined store, 1a repairs list) and the audit plan's W1 progress, then stage, show the user, and ask before any production deploy. The profile-picture move is a migration of real data: tell the user what it will do before deploying.
4. Then the rest of W1: the store registry (RC4), Google/Todoist bookkeeping (RC6), side replicators (DI-20); then draft D-Held page, D-Topic tier and D-Agenda for approval.

## Rules learned this session
- Max 3 agents at once. NEVER `git stash` in parallel worktrees (the stash list is shared; two builders swapped stashes). The user's own `stash@{1}` (cat7-cleanup) must stay; `stash@{0}` "RECOVERED: …fd7-2 WIP" is now redundant (its work is committed), as are branches `rescue/wf_3c11fb1c-fd7-{2,3}-stash`.
- Worktree agents need `node_modules` and `assets/code/runtime` symlinked from the main checkout (never commit them).
- Stage by name; production deploy only with the user's explicit go-ahead; ask the user to close every KurenaiOS window before touching their account.

## The review findings (unfixed)

### P0 (confirmed) — sumEqual doubles gold/XP when two tabs apply the SAME external change (cloud pull, boot mirror recovery)
`js/core/cloudmerge.js:413`

**Scenario.** Two tabs open and signed in. Each tab runs its own cloudsync, and both get the same Realtime 'changed' note with the same debounce, so both pull at about the same time. Both call replaceState(incoming) with gold+50 and xp+100 against the same base. The tab whose save lands second finds stored != lsJson, so it runs mergeIn(base, mem, stored) with TAB_MERGE.sumEqual. l===r and both differ from b, so it computes b+2Δ. CONFIRMED with two harness tabs over one localStorage: both called replaceState with the same incoming doc, and the stored gold became 100 (expected 50) and xp 200 (expected 100). Both tabs then hold the doubled values. Cloudsync sees them as dirty and pushes them to every device. The same thing happens when two tabs boot at once (browser session restore) and both merge the same newer mirror doc in recoverFromMirror, because the base stays loadedJson. The comment says equal values 'cannot be an echo', which is false: replaceState, recovery and importFull change memory without moving the tab's base, and two tabs can apply the same external document.

**Fix.** Only sum equal deltas when they come from this tab's own earning, not from a document applied from outside. Options: (a) have replaceState/importFull/reset and recovery apply() reset the tab base (lsJson = JSON.stringify(state) after the write, or mark the base 'external' so the next tab merge runs without sumEqual); or (b) drop sumEqual and make governor counters derive from the session ledger (sessions are records by id, so the merge already unions them). At minimum, pass sumEqual only when the tab's change since its base came from KOS.sessions.log.

### P1 (confirmed) — `japanese.mined` as a device path wipes mined lines on devices still on the old version; lines mined there are lost for good
`js/core/cloudsync.js:176`

**Scenario.** Ran in the scratch folder against the old cloudmerge (98feddd), result: {"v":1,"facets":{"x:mL":…},"input":{}}, so mL was deleted. Device B is still on the old version (the service worker waits for confirmation, so this lasts a while). It mines line L into state.japanese.mined and pushes. Device A runs the new version. A's merge calls restoreDevice, which drops the incoming `japanese.mined` because A's own snapshot has none, so L never reaches A's state or its store. syncableState then pushes a document without `mined`. On B's next pull the base still has mined, B's local copy equals the base, and the remote has no key, so the three-way merge deletes B's whole mined map. L now exists nowhere: no device and no checkpoint hold it. The comment says an older device 'cannot send it either', but in practice the new device makes the old device delete its lines. The same thing happens to lines A had already moved: they survive only on A.

**Fix.** Until every device runs this version, keep the key in the pushed document unchanged (pass the remote's japanese.mined through), or have the new device take incoming mined lines into KOS.jaMined (put them, keep them out of state) before dropping the path. Never push a document that deletes a map an older client still owns.

### P1 (confirmed) — The automatic picture move runs before the first pull, so its null overrides a newer picture uploaded on an old-version device
`js/core/profilepics.js:284`

**Scenario.** Confirmed with KOS.cloudmerge.merge in node: base {img:'data:OLD'}, local {img:null,file:'F'}, remote {img:'data:NEW'} gives {img:null,file:'F'}; B's later merge also gives null. Sequence: device B is on the old version, uploads a new avatar NEW and pushes. Device A opens the new version with a stale base (img OLD). main.js runs KOS.repairs.runAuto() BEFORE startCloud, so the move sets img null and file F (OLD's bytes). A's push loses the compare-and-set and merges. img changed on both sides, the local side wins, so the result is null with file F. A pushes, and B's next pull takes it (B's local equals B's base). NEW is gone from every device, and A's checkpoint only holds OLD. The header comment says 'the newer picture wins'; that is false in this race. The same applies to a banner, and to a NEWER upload on B while A moves NEW.

**Fix.** Run the profile move (and other state-moving repeat repairs) only after this session's first successful pull (from cloudsync after a good cycle), or make the merge treat avatar.img/bannerImg as remote-wins whenever the remote's value is a data URL different from the base.

### P1 (confirmed) — HP day/backlog drain applied twice when two tabs run governor.tick for the same day
`js/core/governor.js:44`

**Scenario.** Two tabs share a doc with governor.lastTick 3 days ago and hp 80, for example after a browser session restore, or with background tabs whose throttled timers line up on a day rollover. Each tab's tick drains 45 HP to 35 and sets lastTick to today. The second save's merge applies sumEqual: 80 - 45 - 45, clamped to 0. CONFIRMED in the harness: both tabs at 80, each ticked to 35, stored hp and both tabs ended at 0. The plain-equality rule used to collapse this deterministic change to one; sumEqual now counts it twice. The same applies to the backlog drain (lastBacklogDrain) and to any other idempotent-per-day pass that moves gold, XP or HP.

**Fix.** Same root cause as the sumEqual finding. Until it is fixed, exclude changes that come from idempotent markers: e.g. do not sum when a marker sibling (lastTick, lastBacklogDrain) moved to the same value on both sides, or make the drain a ledger entry keyed by day so the record merge dedupes it.

### P1 (confirmed) — A second tab restores the running Focus session from the shared document, and both tabs pay it
`js/modules/focus.js:2541`

**Scenario.** Tab A starts a stopwatch with 40 minutes banked. Open a second tab B. It boots from localStorage, finds focus.active and restore() hydrates it as its own paused session with the same id f1. B's restore save is merged into A, which also sets A's stored focus.active.state to 'paused' while A is running. End the session in A (paid, focus.active=null), then resume and end it in B (paid again). CONFIRMED: the ledger held two focus entries (ids 1 and 2), each paying 4 gold, and gold went 0 to 8. The new tab merge keeps focus.active between tabs on purpose (it is not stripped), so this per-device live process now travels between tabs.

**Fix.** Treat focus.active as owned by one tab. Give it an owner tab id plus a heartbeat (or a Web Lock 'kos-focus' held while running), and have restore() skip a session another live tab owns. Alternatively, strip focus.active from the tab merge/adopt the way cloudsync does with restoreDevice. Also make finish() idempotent by session id: refuse to log if a focus entry with metrics.sessionId === S.id is already in the ledger.

### P1 (confirmed) — Mirror-primary mode (localStorage full) has no cross-tab merge: the last tab to write overwrites the other's records
`js/core/store.js:715`

**Scenario.** localStorage fills up with two tabs open. Both tabs' saves throw QuotaExceededError and both switch to health.primary='indexeddb'. From then on writeNow puts the whole document into the mirror (newerOnly=false). It never reads the mirror's current record and gets no storage event, so it never merges. CONFIRMED: C adds 'C1', D adds 'D1', C adds 'C2'. The mirror holds only [C1, C2], and a fresh boot recovers [C1, C2]: D1 is lost. Any write order loses the other tab's changes, including Focus sessions and pay.

**Fix.** In mirror mode, run the same read-check-merge as localStorage under the Web Lock: read mirror 'state', and if its json is not this tab's mirror base, merge in three ways before the put, in one readwrite transaction. Also notify other tabs (BroadcastChannel, or a small localStorage ping key that still fits) so they merge.

### P1 (confirmed) — preReplace's async kv write opens a window where a local edit is silently overwritten by the merged document
`js/core/cloudsync.js:598`

**Scenario.** mergeRemoteIn now computes res.doc from localSync, then waits for preReplace's IndexedDB write of the whole state before replaceState(res.doc). Any write to KOS.store in that window (a tap, a Focus flush, the habit auto-tick, a ticker) is replaced by res.doc, which never had it. Because the merge sets lastPushedHash=null, the pushed document doesn't have it either. CONFIRMED with a harness script (/private/tmp/claude-501/rv/t3b.js): a device has a dirty local reminder and the cloud moved, so the merge path runs. A reminder 'RACE edit' added during the cloudsync.prereplace.* setKV is gone afterwards from both the local state ['Local2','Mine'] and the cloud copy. Before this change, replaceState ran synchronously right after the merge, so there was no such window. firstLinkMerge goes through the same function.

**Fix.** Take the pre-replace copy first, then capture localSync, merge and replaceState synchronously inside the callback (move the deviceSnapshot/syncableState/merge into preReplace's cb). Alternatively, compare a store revision counter before replacing and re-merge if it moved.

### P1 (confirmed) — Just opening the Daily Review makes a fresh device count as user data, and the merge with no base then pushes SAMPLE junk back into the account
`js/core/cloudsync.js:258`

**Scenario.** EVIDENCE_MAPS includes dayReview.days. Opening the header chip (KOS.reviewSheet.open) writes {seenAt} and {state:'folded'} markers, which are view-only. Fresh boot → open the review → userData() returns 'dayReview.days' → first sign-in is classified 'both'. That takes a full checkpoint and then a merge with no base instead of an adopt. CONFIRMED (/private/tmp/claude-501/rv/t5.js): the account had deleted its sample events and assessment. After this device linked, the cloud copy again held all four 'SAMPLE — … (edit me)' events and the SAMPLE mock assessment, so they come back on every device. The pacing seed rows ride the same merge. Under the old classifier this device adopted the account cleanly.

**Fix.** Make dayReview.days count only on a real act (done, skippedAt, notes, triage), never seenAt or folded. Have the no-base first-link merge leave out the boot seeds (SAMPLE events and the assessments moved from them, unchanged pacing seed rows), the same ones userData already treats as non-data. Add a smoke135 case: a fresh device that opened the review adopts.

### P2 (likely) — writeVerified rejects a same-id record whose binary hasn't downloaded yet; the repair then fails and takes a full checkpoint on every boot
`js/core/profilepics.js:190`

**Scenario.** Device B holds inline picture P. It has pulled the file metadata for contentId F (another device moved P), but not the binary, and its state still holds P inline (the state pull failed, or a merge kept the inline copy). getRec(F) returns a record with blob null. sameBytes(null) is false, so it throws 'A different file already has the id'. The repair fails, and because ready() still holds it runs again at the next start. Each run first makes a full verified checkpoint of every store (attachments included), rotating through the five kept. This is from reading the code, not run.

**Fix.** When the existing record has no blob but its metadata hash matches the decoded bytes' SHA-256, put the local bytes into it (or download it first) instead of rejecting. Also skip the checkpoint when the dry run shows the write would be refused.

### P2 (likely) — write() sets the file reference on a stale governor object after a cloud or tab merge, leaving an orphan record and a second copy
`js/core/profilepics.js:240`

**Scenario.** write() captures g = state.governor, then waits for the IndexedDB write and read-back. If a pull or tab merge lands meanwhile, replaceState or applyDoc swaps in a new governor object. The success path then sets g.avatar.file and nulls g.avatar.img on the detached object, and store.save() writes the live state, which still has the inline URL and no reference. The new genId record is never referenced, is uploaded because profile records go up even with auto-upload off, and is hidden from Storage, so the user can't free it. At the next start the repair moves the inline URL again under a contentId, making a second record. No picture is lost, only storage. From reading the code, not run.

**Fix.** Re-read G() after writeVerified resolves (as move() does with gg) and compare the live inline value before setting the reference.

### P2 (confirmed) — applyDoc swaps top-level domains and detaches modules' live references (Focus S); the running clock is no longer banked by flush
`js/core/store.js:644`

**Scenario.** Tab A is running Focus, where S === state.focus.active. Any tab merge or adopt whose result changes the `focus` domain (in the confirmed run, the second tab's restore save) makes applyDoc replace state.focus with a new object. A's S keeps ticking, but state.focus.active is now a stale copy. CONFIRMED: after the merge, A.store.state.focus.active === A.focus.session() was false, and the stored active.state was 'paused' while A was running. A's pagehide flush then writes the stale lastBeat/phaseAccum, so a reload restores less time than was banked (invariant 4c). The same detachment applies to any module that caches a sub-object of state.

**Fix.** In applyDoc, merge into the existing objects in place (recursively assign or delete keys) rather than replacing the domain object. Or have focus.js re-attach on every save, setting F().active = S before writing.

### P2 (possible) — Boot recovery chooses by rev, not content: a mirror that is rev-newer but content-older replaces newer localStorage edits and brings deleted records back
`js/core/store.js:839`

**Scenario.** Tab A is in mirror-primary mode and writes the mirror at rev 50. Tab B still writes localStorage (its smaller document fits, e.g. after a deletion) at rev 11. B's mirrorSoon put is skipped because newerOnly sees cur.rev 50 > 11. On the next boot, mirror rev 50 > loadRev 11, so apply() runs merge(base=loaded, local=loaded, remote=mirror). Only the remote moved, so the result is effectively the mirror. B's later additions are dropped and its deletions come back. Not run end to end. The pieces were each confirmed: newerOnly skips the older put, and recovery merges against base=loaded.

**Fix.** Use a common ancestor for recovery: keep the mirror's own base, or the localStorage rev it diverged from, so the merge is a true three-way merge. Or keep localStorage's rev ahead by writing REV_KEY even in mirror mode (it is tiny) so the revs stay ordered across stores.

### P2 (likely) — flush() and pwa reloadPage() are not durable in mirror-primary mode: the IndexedDB write is async and the page unloads first
`js/core/store.js:794`

**Scenario.** The session is in quota fallback (primary='indexeddb'). A change is made, and within 120 ms the tab is closed, or an update is confirmed in another tab so this tab is reloaded (pwa.js calls KOS.store.flush() and then window.location.reload() synchronously). writeNow returns null after calling mirrorOpen, but the open/transaction never completes before unload, so the change (e.g. the Focus clock banked at pagehide) is lost silently. health.lastSaveOk is not set to false.

**Fix.** In mirror mode, reloadPage should await a promise-returning flush (mirrorPut completion) before reloading. At pagehide, also write a small 'pending' record to sessionStorage, or try localStorage again with only the delta. Document it as a known limit if it cannot be fixed.

### P2 (confirmed) — userData still misses real user evidence, so those devices are classified empty and adopt the cloud copy over their data
`js/core/cloudsync.js:317`

**Scenario.** Checked userData() on a fresh state with each of these set alone; every one returned null (/private/tmp/claude-501/rv/t6.js): code.projects (an imported Rider report with milestones short of all-pass pays nothing, so it has no session or XP), code.capstones (drafts and submissions short of pay), itUnits.year1 (the Year 1 grade) and itUnits.target, srsCfg.retention/examRetention, japanese.fluency, oop.links, exams.prefs (extra time), governor about/status/avatar/banner, artSlots, todo.autoChecked. A device holding only these signs in to an account with data → 'remoteOnly' → adoptRemote → replaceState. No verified checkpoint is taken on that path, only the kv copy, and finding 4 explains why that copy is not enough.

**Fix.** Add code.projects, code.capstones and japanese.fluency to EVIDENCE_MAPS. Count itUnits.year1/target and srsCfg values that differ from the defaults, oop.links, exams.prefs and non-default governor profile fields. Better still: diff the syncable state against a freshly normalised default document, so any path not listed counts by default.

### P2 (likely) — The pre-replace copy is the only backup on the adopt path, but the next pull overwrites it and nothing in the app can read it back
`js/core/cloudsync.js:619`

**Scenario.** preReplace keeps the last copy only (cloudsync.prereplace.<uid>) and runs on every adopt or merge. Device X is misclassified empty (finding 3) and adopts the account, and its old state goes to the kv. Minutes later another device pushes, the next pull calls preReplace('adopt') again, and the copy now holds the post-adopt state. X's original data is gone for good. Also, KOS.cloudsync.preReplaced has no caller outside tests, so even while the copy exists the user has no way to restore from it.

**Fix.** Keep the pre-first-link copy under its own key that later pulls never overwrite (or keep N copies with the first-link one pinned). Take a KOS.backup checkpoint before the adopt in 'remoteOnly' whenever the local state differs from defaults. Show the copy in Archive › Storage or Sync with a restore action.

### P2 (possible) — A first-link checkpoint that cannot verify blocks the device from ever linking, and retries a full backup every cycle; the smoke17 wrapper hides exactly this case
`js/core/cloudsync.js:637`

**Scenario.** The 'both' path now refuses to link unless KOS.backup.checkpoint verifies. That checkpoint serialises every attachment as base64 into one JSON string, then writes it, reads it back, parses it and takes a second full snapshot. Three ways it fails for good: (a) one stored Blob that can no longer be read (WebKit's lost IndexedDB blob files; arrayBuffer() rejects, so exportAll errors and the whole checkpoint fails), the same 'Attachment content is not readable' path smoke17 now wraps to ok:true; (b) a large file store on an iPad, where roughly 4–5 copies of hundreds of MB exhaust memory and kill the tab; (c) other writes keep changing the live stores during the check. In each case meta.linked stays false, the device never syncs, and every cycle (timers, noteChange, focus) starts another full checkpoint. Evicted files (blob=null) are handled correctly. The failure path was not run on a real device.

**Fix.** Back off after a failed first-link checkpoint instead of retrying every cycle. Let the checkpoint record unreadable blobs as metadata-only with a list instead of failing. Offer the user an explicit 'Link without a backup' consent after N failures. Add a smoke test where one attachment is unreadable, so the wrapper in tools/smoke17.test.js is not the only coverage.

### P2 (possible) — LeaseLost between Todoist chunks drops the bookkeeping for chunk 1, which Todoist has already applied
`js/core/exttasks.js:333`

**Scenario.** tdPush runs every `after` callback only after the last chunk. The new heartbeat between chunks can throw LeaseLost: another holder took the lease, or the edge function failed to answer a renewal. Chunk 1 (up to 90 commands) has already run at Todoist, but its reminders get no ext link and base, and its queued deletions are not dequeued. On the next cycle the same item_add commands go out with their deterministic uuids. If Todoist treats them as duplicates and returns no temp_id_mapping, map[temp] is undefined and the reminder is saved with ext.id undefined. The pull then finds the remote item with no local link and imports it as a second reminder. A network error in chunk 2 could already do this; the heartbeat adds a new and likelier abort point. Not run against Todoist.

**Fix.** Apply `after` for each chunk as soon as that chunk's sync_status arrives (status and map from that chunk), then check the heartbeat. Treat a missing temp_id mapping as 'look the item up', never as a link with id undefined.

### P3 (likely) — Loser of a picture conflict is never released: orphan profile records pile up in the file store and cloud bucket
`js/core/profilepics.js:283`

**Scenario.** Devices A and B, both new, upload different avatars concurrently (file Y and file Z). The merge keeps one, say Y. Z's record and its uploaded binary are referenced by nothing, are never released (release only runs on the replacing device), and are hidden from Files and Storage, so no 'linked nowhere' cleanup can find them. The same happens when two devices move one picture whose data URLs encode it differently, since contentId hashes the URL string rather than the bytes. From reading the code.

**Fix.** At boot (or after a pull), release any profile:* record whose fileId is neither governor.avatar.file nor bannerFile and that is older than some grace period. Hash the decoded bytes for contentId.

### P3 (confirmed) — Profile records still leak to the Assistant and into file counts
`js/core/aitools.js:2569`

**Scenario.** Profile records are stored with subject '_' and ref '_'. attachments_list with {subject:'_', ref:'_'} goes through KOS.attach.list, which is unfiltered, and returns 'Profile picture.jpg' and the banner (only the listMeta branch filters them). archive_get_backup_info's attachments count, the Archive page's 'Document attachments' count (hub.js:3480) and cloudsync's file counts all include them. On old-version devices the pulled metadata appears in Files, search and add()'s hash linking, all unfiltered there. From reading the code.

**Fix.** Filter `profile:` origins in the subject/ref branch of attachments_list and in the counts, or give profile records a subject that no list can name.

### P3 (possible) — release() deletes a profile record without checking its links
`js/core/profilepics.js:225`

**Scenario.** An old-version device's add() still dedupes by hash with no profile filter. A file with the same bytes added to a topic there links onto the profile record, so links contains a topic. When the user later replaces or removes the avatar on a new device, release(F) checks only isProfile(origin) and removes the record, and the topic's file goes with it (tombstoned everywhere). Unlikely, because the bytes must be identical. From reading the code.

**Fix.** In release(), if rec.links is non-empty, drop the profile origin instead of removing the record (or detach and keep it).

### P3 (likely) — addMined drops the line silently if the store write fails, while the facet is still created and synced
`js/core/ja.js:334`

**Scenario.** KOS.jaMined.put() returns a promise that nobody awaits or catches. In a quota error, a blocked IndexedDB or a private window, the line text is lost while the x:<id> facet is introduced and synced. Reviews then reference a line that exists on no device. has() also reads the in-memory copy, which is empty until load() resolves, so a line mined in the first moments after start is put again and its at, reading and en are overwritten. From reading the code.

**Fix.** Introduce the facet only after put() resolves (and toast on failure), and make put() merge with an existing row rather than overwrite it.

### P3 (possible) — flush() writes without the Web Lock and can interleave with another tab's locked read-merge-write (a lost update)
`js/core/store.js:794`

**Scenario.** Tab B holds kos-state-write and has read storedRaw S0. Tab A gets pagehide with a save pending, and flush runs writeNow outside the lock in another process: it also reads S0, then writes rev 6 and its document. B then writes rev 6 with a document that lacks A's change, or A writes over B's change. Same-origin tabs in separate processes do not get atomic localStorage across a read and a write. B later adopts A's document through the storage event (memoryIsBase), so B's change is lost. The window is small but the interleaving is real; not reproduced (a single-threaded harness cannot interleave it).

**Fix.** After the write in flush, re-read REV_KEY and KEY. If the rev moved past what was written, or the document differs, set a 'needs-merge' marker for the next boot. Or have a non-pagehide caller take the lock with ifAvailable and fall back to an unlocked write only at pagehide.

### P3 (confirmed) — Quarantine copies pile up in localStorage under timestamped keys and are never removed, each a whole document
`js/core/store.js:605`

**Scenario.** Every unreadable document that differs from the existing QUARANTINE_KEY is copied to QUARANTINE_KEY + '.' + at. QUARANTINE_META records only the last one, and 'Got it' never frees the space. Each copy is the size of the whole state document, so two or three quarantines can fill localStorage. That forces mirror-primary mode, where the multi-tab lost-update finding applies. The earlier copies are also unreachable from the notice's 'Download the copy'. Confirmed by reading the code.

**Fix.** Keep the copies in the IndexedDB mirror, list every quarantine in the meta, and offer download and delete for each one from Storage.

### P3 (likely) — The per-tab lease holder means a reload in the middle of a cycle locks this same device out for up to 120 s
`js/core/ext.js:285`

**Scenario.** Before this change, a reloaded page used the same holder (device()), so kos_ext_lease re-granted at once (lease_holder = p_holder). Now TAB is new on every page load. A reload, or an iPad killing and restoring the tab mid-cycle, leaves the old holder's lease until it expires (LEASE_S). The boot syncAll then gets waiting:true, and edits made meanwhile wait for the next timer. The cycle is delayed, not corrupted.

**Fix.** Release on pagehide (fetch with keepalive, or a beacon to ext-token). Or send device() as the server holder and rely on the Web Lock alone to keep tabs apart, using the per-tab id only where Web Locks are missing.

### P3 (likely) — The title picker reads the whole vault on every keystroke, despite the comment's invariant 8 claim
`js/modules/goals.js:108`

**Scenario.** mediadb.query({search, sort:'title'}) walks the full entries cursor with no cap, collects every match and sorts it, and only then do .slice(0,8) and the debounce limit what is shown. A vault of thousands of rows gets a full scan every 200 ms while typing. Rendering is bounded; reading is not. Separately, paint()'s async get for a deleted linked title can draw 'A title no longer in your vault' after the user has already picked a new hit, because the `!row` branch never checks that out.value is still the original. The link itself is kept correctly: Save writes out.value, even for a missing title.

**Fix.** Add a limit or early stop to mediadb.query (stop the cursor after N matches, then sort), or use the titleLower index with a key range. In the get callback, return early when out.value has changed.

### P3 (possible) — An aborted cycle skips logActivity, so completions pulled earlier in that cycle never get their activity entry
`js/core/exttasks.js:241`

**Scenario.** todoistCycle applies the pulled ticks locally (inside inbound) before tdPush. If tdPush throws LeaseLost, the final .then that calls X().logActivity('todoist', done) never runs. The next cycle re-reads the same delta because the sync token was not saved, but the reminders are already done locally, so reconcile records nothing in `done`. The day's metrics.external activity entry is lost for good. No pay is involved; it only affects the HP day-activity test and History. Google Tasks has the same shape.

**Fix.** Call logActivity for `done` in a finally-style handler, or before the push, so an aborted push still records the pulled completions.
