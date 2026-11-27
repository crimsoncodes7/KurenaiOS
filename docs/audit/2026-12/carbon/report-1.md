# Carbon's Batch 1 report (Gemini 4 Carbon, filed by the lead)

The verdicts are `verdicts-1.json`; this file keeps the report's prose: the hotfix sign-off, the severity rulings, Horizontal Sweep 1 and the unreached ids.

### 3-Branch Hotfix Sign-Off (`fa4264d0..origin/fix/2026-12-*`)

| Branch | Commit | Fixes | Regression Test | Verdict | Adversarial Verification Notes |
|---|---|---|---|---|---|
| `origin/fix/2026-12-SY-38` | `34e21d43` | `SY-38` (P0), `DI-33` (P1) | `smoke196 G2` (fails on `fa4264d0`, 27/27 pass on branch) | **HOLD** | **Closes `DI-33` and single-tab cloud-pull `SY-38`, but leaves multi-tab `SY-38` and 3 of 5 `store.js` merge call sites open.** (1) **Multi-tab `SY-38` still overwrites the remote record (reproduced in Node):** by invariant 33d, one tab holds `kos-cloudsync` and runs `land()`. When Tab B runs `cloudsync` and writes the re-keyed state (`local 50 → 51`, `remote 50`) to `localStorage`, Tab A — holding the open Goal/Assignment editor on `held` (`id: 50`) — receives `storage` → `takeIn()`. If Tab A memory is clean (normal while typing in modal inputs), `takeIn()` runs `applyDoc(other)` (`js/core/store.js:879`) with no `renames`; if Tab A memory is dirty, `mergeIn()` (`js/core/store.js:853`) merges against `lsJson` where `inB["50"]` is already true, so `rekeyCollisions` emits `renames: []`. In **both** cases `assignList` binds `held` (`id: 50`) to `"REMOTE goal"`, and clicking Save in Tab A (`G.update(held.id, …)`) still overwrites `"REMOTE goal"`. (2) **Three `KOS.cloudmerge.merge` sites in `js/core/store.js` omit `.renames`:** `mirrorTakeIn` (`:695`), `overwrittenWrite` (`:1083`), and `recoverFromMirror` (`:1146` patched / `:1125` base). (3) `js/modules/assignments.js:505` `detailModal(id)` / `:190` `detailBody(host, id)` holds a primitive `id` rather than the live record reference. **Fix before merge:** pass `.renames` at the 3 remaining `store.js` merge sites, and in `assignList` guard `byId` reuse with an origin check (`sameOrigin` / mismatched `createdAt`/`created`/`ts`/`uid`/`syncId`), re-binding a displaced live local object to the incoming `src` row that shares its origin (`a.id = b.id`). |
| `origin/fix/2026-12-SY-33` | `2bba1925` | `SY-33` (P1) | `smoke201 E` (fails on `fa4264d0`, 5/5 pass on branch) | **APPROVE** | **Exact, complete root-cause fix.** Replaces non-existent `KOS.fsrs.recall(m.s, el)` (which also had reversed arguments) at `js/modules/mind.js:937` with `KOS.fsrs.retrievability(el, m.s, KOS.srs.weights())`, matching `js/core/fsrs.js:45` `(elapsed, s, w)` and invariant 111. Static sweep of all 15 `KOS.fsrs.*` call sites across `js/` confirms zero other missing methods; runtime verification across `#/mind` cards (`fc.info` stats included), `#/mind/daily` (Daily 15), and `#/ref/mind/P1.1` Cards tab passes with 0 errors. |
| `origin/fix/2026-12-AP-21` | `8fe56a19` | `AP-21` (P1), `ST-52` (P1), `ST-51` (P2) | `smoke142 A` (fails on `fa4264d0`, 12/12 pass on branch) | **APPROVE** | **Closes root cause cleanly with zero boot regressions.** Moving `<script src="js/data/lazy-index.js">` from `index.html:185` to `:487` (below `<template data-lazy="code-projects">` and above eager content, engines, and modules) places all 6 indexed bundle groups (`exam-index`, `exams-deep`, `content-compsci`, `content-maths`, `content-it`, `content-code`) before `install()`. Verified via incremental HTML-parser simulation in Node: boot `KOS_CONTENT` rises from `52` to `500` keys (`448` stand-ins installed), boot `dueCount()` is exact before warm-up and under Save-Data (preventing false backlog-cleared awards on `#/due`), `#/cardstats` renders `442` scheduled / `5,092` in scope with `0` lazy misses and `0` `content-*` fetches under Save-Data, and a fresh Sample boot seeds `442` `state.srs` schedules (was `0`). *(Non-blocking note: an existing browser profile whose `kurenai-os-v1-sample` already stored `ui.sampleSeeded: true` with `srs: {}` keeps `srs: {}` until `Reset sample`, as `js/core/sample.js:353` exits early when `sampleSeeded` is set.)* |

#### Explicit Rulings on the Lead's Two Severity Questions (against `README.md` § Severity)
- **`SY-33` → `CONFIRMED` at `P1` (not `P0`):** `README.md` reserves **P0** for *"data loss or corruption, or a core flow broken with no way round"* and defines **P1** as *"a feature that does not work"*. In `js/engines/flashcards.js:349-364`, `stage`, `rateRow` (with FSRS interval previews), and `meter` mount **before** line 358 (`historyLine(c, srs)` → `mind.js:937`), which throws `TypeError: KOS.fsrs.recall is not a function`. Execution aborts `lifeStats`, `paintDeck`, `renderInfo` (`ⓘ Card stats`), `answerFor(c)` (so Write/Type pads fail to mount), and synchronous `router.js` URL/view bookkeeping (`location.hash` stays on the prior route). However, reproduced in Node on both `#/mind` cards and `#/mind/daily` (`▶ Start Daily 15`), in the default **Think** mode clicking the card still flips it, clicking Good/Hard/Again/Easy still rates and clears every due card (`due: 3 → 0`), logs the Mind review session, and advances Daily 15 to `"sitting"`. No data is lost and Think mode provides a way through, so `P1` is exact on the rubric (hotfixing immediately was still sound engineering).
- **`AP-21` → `CONFIRMED` at `P1` (not `P0`):** No schedule or user record is lost or corrupted (`state.srs` is untouched). Wrong due/progress counts at cold boot (`0 due`, Home ticking the daily flashcard goal) and wrong Governor pay under Save-Data (`+20 gold, +6 HP` backlog-cleared bonus while curriculum cards remain due) match `README.md`'s literal **P1** clause (*"a wrong number of money, pay, time or progress"*). Ways round exist (any navigation after the ~6 s warm-up on normal connections, or opening the subject's desk/topic under Save-Data to trigger `NEEDS` for `content-<sid>`), keeping it strictly `P1` on the scale despite warranting immediate hotfix treatment.

---

### Batch 1 Verdicts & New Findings (`carbon/verdicts-1.json`)

(The JSON block is filed as `verdicts-1.json`.)

---

### Horizontal Sweep 1 Results (Script-First)

Executed read-only Node scripts booting `tools/lib/app-harness.js` + `seedAccount` + `KOS.lazy.all()` at `fa4264d0` across all four Sweep 1 axes:

1. **Top-level state keys vs `js/core/redraw.js` `READS` (invariant 164):**
   - Enumerated all **39** `store.state.<key>` properties referenced across `js/` and all **44** registered `KOS.views.<id>` entries (every view has an explicit `READS` entry; none falls back unintentionally).
   - Ran `SURF.reads` (`tools/lib/view-surfaces.js`) augmented with pre-initialised optional state keys (`folders`, `errorLog`, `routines`, `dayReview`, `questions`, `ext`, `assistant`, `notifyCloud`), a seeded attachment + folder, a seeded assessment, and 26 additional sub-routes (`exams` sections, `mind` daily/cards, `japanese` sessions, `code` sub-pages, `creatives` sub-pages, `ref` space/files tabs, `errorlog` drill).
   - **Flagged & verified mismatches → logged as `CARBON-1-2`:**
     - `files` reads `folders` (`READS.files` and `STUDY` omit `"folders"`);
     - `mind` (`{ page: "daily" }`) reads `exams` (`READS.mind` omits `"exams"`);
     - `calendar` reads `sessions` via `KOS.exams.startState` → `weeklyHours` (`READS.calendar` omits `"sessions"`);
     - `code` and `japanese` mount `KOS.errorLog.inlinePill` on missed items (`READS.code` and `READS.japanese` omit `"errorLog"`).
   - *(Also observed: `ref` on `mind` calls `renderSubnav` → `KOS.refreshRailCounters` synchronously during render, touching shell-only `notify`/`reminders`; harmless to `#/ref` content, but worth keeping shell counter updates outside `KOS.views.ref` if `mind` lessons are added to `view-surfaces.js`.)*

2. **ID-bearing record arrays vs `js/core/cloudmerge.js` `RECORDS` & `refs` (invariant 33a):**
   - Walked every array in seeded + initialised `KOS.store.state`: all **23** top-level/nested ID-bearing record arrays are registered in `RECORDS` (`js/core/cloudmerge.js:51-109`; `state.folders` and `state.exams.assessments` are keyed object maps under random string keys).
   - Cross-reference audit confirmed **`DI-28`** (`calendar.events` missing `sessions[].metrics.eventId`, `focus.active.eventId`, `exams.assessments.*.links.calendarId`; `sessions` missing `sessions[].metrics.reverses`), confirmed `errorLog.items[].cardId` is properly wired to `custom.cards` (`cloudmerge.js:56`), and uncovered **`CARBON-1-3`** (`state.srs` and `state.code.cards` omitted from `FACET_PATH`, merging FSRS schedules field-by-field) and `mistakeTypes` omitted from `SET_FIELDS` (**`CARBON-1-4`**).

3. **Side stores (IndexedDB) vs `KOS.stores` and full backup `snapshotFull` / `importFull` (invariant 7):**
   - Verified all **13** domain `indexedDB.open` sites plus `kurenai-os-backups` and `kurenai-os-statemirror` (**15** databases total) against `js/core/stores.js:38-82` (`ROWS`) and `js/core/store.js:1335-1450` (`snapshotFull`):
     - **11 backed-up stores** (`media`, `files`, `money`, `reviews`, `ink`, `mind`, `creatives`, `ledger`, `jaMined`, `reports`, `attempts`) all match `ROWS[i].backup` and `snapshotFull` / `backupfile.js` 1:1.
     - **4 intentionally excluded stores** (`papers`, `filetext`, `backups`, `statemirror`) are all declared in `KOS.stores` with explicit `backup: null` and `why` strings.
   - **Result:** **PASS** — zero unregistered or silently un-backed-up IndexedDB side stores.

4. **New Phase 1 fields (`state.errorLog`, Pacing `hidden`/`order`/`day`, `dayWindows`, Daily Review `days`, `leechBase`):**
   - `state.errorLog`: normaliser & `RECORDS` + `cardId` ref present; `openCapture` lazy bug confirmed (`ST-47`/`EX-57`), inline Undo delete confirmed (`ST-44`), quiz auto-log replay confirmed (`ST-45`), drill closure state confirmed (`SY-31`), and missing search / Assistant tools / `TALLY` / `SET_FIELDS` / `toFlashcard` Undo logged as **`CARBON-1-4`**.
   - Pacing `hidden`, `order`, `day`: `shiftable()` (`js/modules/pacing.js:69`), `entriesFor`, `carriedInto`, `milestones`, and `alignment` exclude `hidden`, while external `KOS.pacing.entries()` callers (`PR-45`) and `cloudsync.js` `pacingTouched` (`DI-29`, upgraded to P1) missed them.
   - `dayWindows` & Daily Review `days`: `routines.js` `windowOn` feeds `calendar.js:605`, `outlook.js`, alerts, and rest-day checks; `dayreview.js` `slotTime` feeds `routines.js:797` and calendar derived slots; Simple-mode overwrite confirmed (`PR-48`) and `dayReview.config` `userData` gap confirmed (`DI-29`).
   - `leechBase`: preserved in `srs.js:268` and `jasrs.js:63,112` (with Undo in `japanese.js:278-284`); multi-device field-wise merge corruption of `srs` (mixing `leech` and `leechBase` across devices) logged under **`CARBON-1-3`**.

---

### Unreached IDs

**None** — all **67 / 67** Batch 1 findings (`1` P0, `8` P1, `35` P2, `23` P3 across `PR`, `EX`, `ST`, `SY`, `DI`, `AP`, including the `90+` copy-account pass) were independently verified.
</pasted_content id="1e61">

Here is Carbon's full Batch 1 verification, omission hunt, and Horizontal Sweep 1 report (all 67/67 findings verified, plus 4 new `CARBON-1-*` findings).
Next steps:

1. File the JSON block under `docs/audit/2026-12/carbon/verdicts-1.json` and fold `CARBON-1-1` through `CARBON-1-4` (and the 2 duplicate rejections + 5 severity upgrades) into Batch 1's consolidated audit ledger on `audit/2026-12`.
2. Hotfix branches:
   * `fix/2026-12-SY-33` and `fix/2026-12-AP-21` are APPROVED by Carbon.
   * `fix/2026-12-SY-38` is on HOLD due to the multi-tab `takeIn`/`mergeIn` overwrite and the 3 remaining `store.js` merge call sites (`mirrorTakeIn`, `overwrittenWrite`, `recoverFromMirror`). Please patch those on `fix/2026-12-SY-38` (with a multi-tab regression check in `smoke196 G2`) and confirm `183/183` passes.
   * Once `SY-38` is patched and verified (or let me know if you want Carbon to re-check just that diff first), let's merge all three hotfix branches to `main` and deploy together so live Mind cards, boot due counts, and multi-tab sync safety are all fixed in one release.
3. After the hotfix deploy is green, lmk and we'll start the next batch.
