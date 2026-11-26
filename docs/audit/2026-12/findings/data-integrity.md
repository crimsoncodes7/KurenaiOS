# Data integrity — December 2026 audit (Phase 2)

No P0. One P1: taking a document in place (cloud land, another tab's write, Restore) aliases two rows that share an id, silently overwriting one (DI-33) — proven on Daily Review picks with ordinary pre-1A ids and on duplicate-id ledger entries. P2s: the re-key misses four stored event/session ids (DI-28); a first link drops U4 Pacing row customisations (DI-29); orphaned question schedules from the 504-item clean-up count and take daily cap slots for ever (DI-30). P3s: the Wall showcase merges position by position (DI-31); a deleted exam attempt returns for a sync cycle (DI-32). November's 27: all fixed except DI-03, whose definition of user data missed Phase 1's new fields (DI-29).

Findings: 6 — P0 0, P1 1, P2 3, P3 2

| id | sev | title |
|---|---|---|
| DI-28 | P2 | The merge's re-key misses four stored event/session ids: a session's metrics.eventId, focus.active.eventId, an assessment's links.calendarId and a correction's metrics.reverses |
| DI-29 | P2 | A first link drops this device's Pacing row customisations (U4 hidden, order, day): pacingTouched does not see them, so the account's plan replaces it |
| DI-30 | P2 | A question schedule whose item is gone (504 removed by the study clean-up, or a fork deletion) is still due for ever: it is counted in 'questions back today' and takes one of the subject's daily cap slots |
| DI-31 | P3 | The Wall showcase is an ordered list merged position by position: two devices reordering it can double one badge and silently drop another |
| DI-32 | P3 | A deleted exam attempt comes back for a sync cycle: kos_attempts pulls BEFORE it pushes its tombstone, and the two-minute overlap re-delivers the row |
| DI-33 | P1 | Taking a document in place (cloud land, another tab's save, Restore) merges two rows that share an id into one object: the first row's data is overwritten and saved |

## What was covered

- **Merge and re-key (33, 33a):** every RECORDS entry and its refs read against every stored id field found by grep (assignmentId, eventId, listId, cardId, calendarId, reverses, review picks); two-device documents built and merged (merge_refs.js T1–T4): assignments, reminders, lists and review picks re-key correctly; custom cards re-key with srs and the U7 Error Log cardId; events and sessions leave four refs behind (DI-28). Ordered lists: Shrine and FSRS fit atomic; the Wall showcase is not (DI-31). Pacing `order` merges per row without loss.
- **First link (34):** userData/stripSeeds probed for U4 (hidden, order, day), U6 (review config) and errorLog settings (DI-29).
- **Tabs and in-place apply (33c, 33d):** applyDoc/assignDeep/assignList read and probed with duplicate ids and mixed-kind picks (DI-33). smoke133/135/196 pass.
- **Backups (1a, DI-09):** full round trip of a seeded device into an empty one through KOS.backupFile.write → importFull: every part identical except per-device state.ui; Error Log and U4 fields survive; report counts and kept parts read. Checkpoint code (backup.js) read; KEEP 5; smoke147/150 pass.
- **Registry and Reset (7):** stores.js rows match snapshotFull's parts and importFull's restorers; smoke134 passes.
- **Side stores (36d):** pull order and tombstones compared across money, mind, reviews, reports, ink and attempts; attempts pulls before pushing and resurrects a deleted row (DI-32).
- **Study clean-up (87, 111c):** kept items carry their old place (spot-checked compsci 4.2.1.1: quiz 0–3, 5–9; exam 0–3; removed q:…:4); flashcard due ignores orphans; question due does not (DI-30).
- **Phase 1 items:** 1A random ids and idOf (goals links, Daily Review, merges), EF-01–08 response shapes in ext.js (both handled), U4/U5/U6/U7, leechBase (facet merged whole by `last`; unleech does not touch `last`, so a concurrent review elsewhere would win — not reproduced as a finding), goal types ja-facets/mind-daily15/gov-gold (goals pay nothing; gov-gold displayOnly), Money typed-entry matching and adopt/undo (read; deeper Money flows left to money-goals).
- **Integrations (157–160):** exttasks/extgcal read for 1A ids and 404 handling; smoke143 on fakes; Todoist sub-task ids still come from reminders.nextId (numbers), harmless because the next full pull rebuilds them by provider id.

## Not covered

- The user's own data copy (not supplied): DI-33's ledger impact and DI-30's orphan count on the real account are unmeasured. A one-line scan for duplicate ids per array and for q:/e: srs keys with no item should be run in the copy pass.
- Supabase, kos_* tables, deployed or undeployed Edge Functions: read only, never called. No real provider.
- Accounts/viewports: this area is device-independent; runs were in Node (fake IndexedDB) and the harness slot was seeded only.

## November re-check

| id | sev | verdict | note |
|---|---|---|---|
| DI-27 | P0 | fixed | Node probe di27.js: an anime and a manga sharing MAL id 77, bulkUpsert three times → 2 added, then 0 updated / 0 rewards, modules unchanged; smoke114/126/127/129 pass |
| DI-01 | P1 | fixed | smoke143 (20 steps) passes: twins fold after a verified checkpoint; exttasks.js foldInto read |
| DI-02 | P1 | fixed | smoke143 passes (a failed second batch keeps the first batch's links) |
| DI-03 | P1 | regressed | userData/stripSeeds hold for everything they knew (smoke135 27/27, smoke17), but Phase 1's Pacing row fields hidden/order/day and the Daily Review config fall outside them: DI-29 |
| DI-04 | P1 | fixed | smoke133 (17) passes: kos-state-write lock, three-way tab merge, two tabs mint different ids; see DI-33 for a new defect in the adopt path's in-place apply |
| DI-05 | P2 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
| DI-06 | P2 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
| DI-07 | P2 | fixed | assignment refs rewritten (smoke143 D; merge_refs.js T4 for reminders/lists/review picks); calendar-event and session refs were never listed: DI-28 (new) |
| DI-08 | P2 | fixed | sampled: extgcal.js:434 unlinks on 404 instead of deleting |
| DI-09 | P2 | fixed | smoke150 10/10; roundtrip.js: seeded device → backupFile.write (267,554 bytes) → empty device importFull → every part identical but state.ui (per-device), errorLog and U4 pacing fields intact |
| DI-10 | P2 | fixed | smoke133/134 pass (mirror primary when localStorage is full) |
| DI-11 | P2 | fixed | every side store pulls with KOS.sideSync.since (money 1758, mind 229, reviews 174, reports 434, ink 137, attempts 306); see DI-32 for the attempts pull order |
| DI-16 | P2 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
| DI-17 | P2 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
| DI-18 | P2 | fixed | sampled: creatives DB carries the namespace suffix (smoke134 F scans every indexedDB.open) |
| DI-19 | P2 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
| DI-20 | P2 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
| DI-21 | P2 | fixed | sampled: smoke134 passes (Reset clears every registry database but checkpoints) |
| DI-22 | P2 | fixed | sampled: smoke124 passes (danger dialog, verified checkpoint before replace) |
| DI-12 | P3 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
| DI-13 | P3 | fixed | sampled: store.js quarantines an unreadable copy before writing (smoke133) |
| DI-14 | P3 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
| DI-15 | P3 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
| DI-23 | P3 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
| DI-24 | P3 | fixed | sampled: roundtrip.js report 'attachments (none in this backup; this device's removed)'; smoke150/188 |
| DI-25 | P3 | fixed | sampled: smoke81/134; japanese.mined is a DEVICE_PATH and lives in kurenai-os-ja-mined |
| DI-26 | P3 | fixed | not individually re-run; covered by the passing DI suites (smoke133–135, 141, 143, 147, 150) — expected fixed by W1 |
