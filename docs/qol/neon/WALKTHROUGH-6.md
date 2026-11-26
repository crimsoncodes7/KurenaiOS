# Batch 6 Walkthrough — Phase 1E (`neon/qol-batch-6`)

Branch cut from `origin/main` at `f26102f5`. All commits carry the trailer `Agent: Gemini 4 Neon (Antigravity)` and are pushed to `origin/neon/qol-batch-6`.

---

## Round A · Page features (A1–A6)

### A1 · `creatives#8` leftover (S) — "Check to do" pill on Practice Log rows

- **R1 reproduction:** Opened `#/creatives/log` in live Chrome (`1470×832`) with four seeded studies (two unchecked, one with a failing self-check, one with a passing self-check). The `"Check to do"` filter chip already existed and filtered to the two non-passing rows, but the rows themselves showed no pill indicating their check was still to do (`todoPills: 0`, only the passed row showed `✓ check passed`).
- **Commit:** `cd13b992` — `fix(qol): creatives#8 — show Check to do pill on unchecked Practice Log rows`
- **Files and lines:**
  - `js/modules/creatives.js`: `:544` (hoisted `needsCheck(w)` above `workRow`), `:553-554` (rendered `<span class="k-chip k-cr-chip" data-ui="cr.work-todo">Check to do</span>` when `needsCheck(w)` is true), `:610` (removed duplicate local `needsCheck` in `logPage`).
- **Helper reused:** Reused `needsCheck(w)` (one predicate shared by `workRow` and `logPage`'s `"Check to do"` filter) and the existing `.k-chip.k-cr-chip` chip style already drawn in `workRow`.
- **Invariants & exceptions:** `spaces.md` 154, 156. No core-file exception used.
- **Verification (run before committing):**
  - `node --check js/modules/creatives.js` — pass.
  - `smoke108` (18/18), `smoke131` (9/9), `smoke192` (22/22), `smoke142` (12/12) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`, plus Dawn at `1470×832`): 2/4 seeded rows show `Check to do`, clicking the `"Check to do"` filter isolates those exact 2 rows, passed row keeps `✓ check passed`, zero horizontal overflow.

### A2 · `productivity#5` (M) — Reminders: "Place in a free block" and "Focus on this"

- **R1 reproduction:** Opened `#/reminders` in live Chrome (`1470×832`) and selected an open reminder. The inspector showed only Snooze, Done, and Delete — no way to place the reminder into a free block on today's schedule or jump to Focus pre-filled with the reminder's title.
- **Commit:** `d422b279` — `feat(qol): productivity#5 — Place in a free block and Focus on this in Reminders inspector`
- **Files and lines:**
  - `js/modules/dayreview.js`: `:635-663` (extracted `placeControl(x, free, opts)` from `placeRow`, preserving `"Placed HH:MM"` state and Undo via `KOS.calendar.addEvent` + `KOS.ui.toast`), `:829` (exported `KOS.reviewSheet.placeControl`).
  - `js/modules/reminderspage.js`: `:515-532` (added `rem.insp-actions` row on open reminders with `KOS.reviewSheet.placeControl` backed by `KOS.today.build(todayISO()).free` and a `rem.focus` `"Focus on this"` button calling `KOS.show("focus", { objective: item.title })`; guarded `refreshInsp` callback with `if (insp.isConnected && selectedId === itemId)`), `:551` (appended `inspActs` to inspector).
  - `tools/smoke198.test.js`: `:1-79` (new Batch 6 suite, Step A: fails without A2; verifies free-block placement, `"Placed HH:MM"` state, Undo removes the event, and `"Focus on this"` opens `#/focus` pre-filled while keeping Focus `idle` per invariant 4e).
- **Helper reused:** `KOS.today.build`, `KOS.calendar.addEvent`, and Daily Review's `placeRow` extracted as `KOS.reviewSheet.placeControl` (`js/modules/dayreview.js`).
- **Invariants & exceptions:** `productivity.md` 147, 149; `core.md` 4e; `ui.md` 27, 45. No core-file exception used.
- **Verification (run before committing):**
  - `node --check js/modules/dayreview.js js/modules/reminderspage.js` — pass.
  - `node tools/gen_lazy_index.mjs --check` — pass.
  - `smoke198` (2/2 — Step A verified failing before edit, passing after), `smoke35` (31/31), `smoke101` (11/11), `smoke102` (8/8), `smoke103` (9/9), `smoke104` (12/12), `smoke193` (15/15), `smoke142` (12/12) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): 32 px desktop / 44 px coarse phone hit areas, free-block dropdown creates study block and updates button to `Placed HH:MM` with Undo toast, `"Focus on this"` opens Focus pre-filled in `idle` state, zero overflow.

### A3 · `productivity#9` (M) — Calendar: "Skip this showing" for a repeating event

- **R1 reproduction:** Opened `#/calendar` in live Chrome (`1470×832`) on a local repeating weekly event's detail panel. Only Edit and Delete (whole series) existed — no `"Skip this showing"` action, and `KOS.calendar.normalise` dropped any `skip` field.
- **Commit:** `1f251ebe` — `feat(qol): productivity#9 — Skip this showing for repeating Calendar events`
- **Files and lines:**
  - `js/modules/calendar.js`: `:258-261, :317` (`normalise` keeps valid ISO dates in `skip`, sorted and unique; clears `skip` when `recur === "none"`), `:426` (`occursOn` returns `false` when `dateISO` is in `ev.skip`).
  - `js/modules/calpage.js`: `:136-168` (`eventDetail` renders `cal.skipped-note` `"Skipped on <date>"` + `cal.unskip` `"Restore showing"` when viewing a skipped date, and `cal.skipped-list` with per-date Restore buttons when viewing another showing of a series with skipped dates), `:214-240` (`cal.skip` `"Skip this showing"` button on local repeating events with Undo toast; omitted on Google-linked events `ev.ext && ev.ext.g && ev.ext.g.id`).
  - `tools/smoke198.test.js`: `:9-11, :74-124` (Step B: fails without A3; tests `normalise` sorting/deduping/dropping invalid dates, `occursOn` hiding only the skipped date, recurrence staying one record, Undo restoring the date, skipped-date detail wording + Restore button, and action hidden on Google-linked events).
- **Helper reused:** `KOS.calendar.normalise`, `KOS.calendar.occursOn`, `KOS.calendar.updateEvent`, and `KOS.ui.toast` Undo (mirroring Google-link `ext.g.skip` at `calendar.js:420`).
- **Invariants & exceptions:** `ui.md` 41, 43, 45, 46; `productivity.md` 158, 159.
  - **Exception used (`BRIEF-6.md` §2 A3):** *"Exception: `js/modules/calendar.js` may gain one event field, `skip` (an array of ISO dates). It is read by `normalise` (kept only as valid dates, sorted, unique) and by `occursOn`, which returns false for a skipped date."* Exactly 6 lines added in `calendar.js`; nothing else touched there.
- **Verification (run before committing):**
  - `node --check js/modules/calendar.js js/modules/calpage.js` — pass.
  - `node tools/gen_lazy_index.mjs --check` — pass.
  - `smoke198` (3/3), `smoke35` (31/31), `smoke46` (18/18), `smoke87` (12/12), `smoke112` (10/10), `smoke196` (26/26), `smoke142` (12/12) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): skipping hides only the selected occurrence with Undo, skipped-date detail shows `"Skipped on <date>"` and `"Restore showing"` (`44 px` height on `375×812`), Google-linked repeating event hides `"Skip this showing"`, zero overflow.

### A4 · `achievements-governor#3` (S) — Autosave the Wall's showcase

- **R1 reproduction:** Opened `#/achievements/showcase` in live Chrome (`1470×832`), picked a badge, and tried to navigate to `#/home`. A `"Leave without saving?"` confirmation dialog blocked navigation, and an explicit `"Save showcase"` button was required.
- **Commit:** `a41c4675` — `feat(qol): achievements-governor#3 — autosave the Wall showcase with Undo on removal`
- **Files and lines:**
  - `js/modules/achievementspage.js`: `:294-374` (`showcasePicker` passes mutation metadata `{ kind, id, prev }` to `onChange` and `null` on initial paint so render writes nothing; adds `set(ids)` for Undo and `silentRemove` so toast speaks once per invariant 66; `drawShowcase` autosaves on every pick, remove, reorder, and clear, shows an Undo toast on removal/clear, removes `ach.save-showcase` and `KOS.view.hold`/`KOS.view.guard`).
  - `tools/smoke146.test.js`: `:22-23, :191-208` (updated step G as approved to assert immediate autosave on pick and leaving `#/achievements/showcase` without a confirmation dialog).
- **Helper reused:** `KOS.achievements.setShowcase`, `KOS.ui.toast` Undo, and `showcasePicker` (`js/modules/achievementspage.js`, leaving `governor-ui.js:845`'s Edit seat draft/Save flow untouched).
- **Invariants & exceptions:** `core.md` 161–163; `ui.md` 66, 166; `study.md` 89a. No core-file exception used.
- **Verification (run before committing):**
  - `node --check js/modules/achievementspage.js` — pass.
  - `node tools/gen_lazy_index.mjs --check` — pass.
  - `smoke113` (14/14), `smoke136` (13/13), `smoke146` (13/13), `smoke56` (53 surfaces, 1631 controls — ALL PASS; `achievements` was not in `render-purity.json`) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): pick saves immediately, keyboard reorder persists immediately, remove saves and offers Undo toast which restores the slot, navigating away to `#/home` leaves with no prompt, zero overflow.

### A5 · `mind#3` (M) — Review Mind's cards outside the Daily 15

- **R1 reproduction:** Seeded 2 due Mind cards in live Chrome (`1470×832`) and opened `#/mind`. The desk offered Daily 15, lessons, and the journal, with no standalone way to review due Mind cards outside Daily 15.
- **Commit:** `328e6856` — `feat(qol): mind#3 — Review my Mind cards outside the Daily 15`
- **Files and lines:**
  - `js/modules/mindrun.js`: `:402-426` (extracted shared `KOS.mindRun.cardStage(o)` rating stage used by both Daily 15 and standalone card review).
  - `js/modules/mind.js`: `:76, :81-92, :235` (routed `#/mind/cards` to `cardsPage`, and rendered full-width `.k-card.k-mind-duebar` `[data-ui="mind.review-bar"]` with `"Review my Mind cards (N due)"` between the hero row and analytics row only when `M().due(today(), true).length > 0`), `:694-699` (`daily().reviews()` reuses `KOS.mindRun.cardStage`), `:813-870` (`cardsPage(main)` runs due cards through `KOS.mind.cardOf` / `preview` / `rateCard` / `finishReviews` without touching `ui.daily` or Focus; sets `logged = true` before calling `M().finishReviews(results)` so Close and `onDispose` can never double-log).
  - `css/views/mind.css`: `:122-123` (`.k-mind-duebar`, `.k-mind-duebar-t`, tokens only).
  - `tools/smoke198.test.js`: `:12-14, :128-179` (Step C: fails without A5; asserts desk hides `mind.review-bar` when 0 due, shows `"Review my Mind cards (N due)"` when cards are due, rates cards through `#/mind/cards` without touching `ui.daily`, logs one `mind_review` session, and hides the bar once 0 remain due).
- **Helper reused:** `KOS.mind.due`, `KOS.mind.cardOf`, `KOS.mind.preview`, `KOS.mind.rateCard`, `KOS.mind.finishReviews` (`js/core/mind.js`, zero changes needed to `js/core/mind*.js`), and shared `KOS.mindRun.cardStage` (`js/modules/mindrun.js`).
- **Invariants & exceptions:** `spaces.md` 137, 140; `study.md` 111. No core-file exception used.
- **Verification (run before committing):**
  - `node --check js/modules/mindrun.js js/modules/mind.js` — pass.
  - `node tools/gen_lazy_index.mjs --check` — pass.
  - `smoke198` (4/4), `smoke109` (17/17), `smoke110` (6/6), `smoke111` (3/3), `smoke55` (14/14) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): bar visible with `Review my Mind cards (2 due)` (`h=35.5 px` desktop, `44 px` tablet/phone), zero clipped buttons or dead columns, `#/mind/cards` completes review and hides bar once 0 due, zero overflow.

### A6 · `bk:home-reports#2` (S) — One subject registry for Reports

- **R1 reproduction:** Inspected `js/core/report.js:30` (`var SUBJECTS = ["compsci", "maths", "it"]`) and `js/modules/reports.js:34, :44, :1084` (hard-coded 3-subject maps overriding `KOS.subjects` and assuming only `compsci`/`maths`/`it`).
- **Commit:** `fddb8b4f` — `feat(qol): bk:home-reports#2 — read KOS.subjects as the one subject registry for Reports`
- **Files and lines:**
  - `js/core/report.js`: `:30` (`var SUBJECTS = KOS.subjects && KOS.subjects.ids ? KOS.subjects.ids("exam") : ["compsci", "maths", "it"];`).
  - `js/modules/reports.js`: `:34-51` (removed hard-coded 3-subject overrides on `SUBJ_HUE` and `FLOW_LABEL`; added `subjShort(k)` and `subjKeys(obj)` deriving from `KOS.subjects` plus whatever keys a saved report holds), `:378, :402, :727, :816-817, :1077` (rendered report cards from `subjKeys(...)` / `subjShort(...)` without recomputing saved reports; removed `SUBJ_SHORT_RP` at `:1090`).
- **Helper reused:** `KOS.subjects.ids("exam")`, `KOS.subjects.get(k)`, `KOS.subjects.hue(k)` (`js/core/subjects.js`, matching `reports.js:39`).
- **Invariants & exceptions:** `productivity.md` 100–102a; `spaces.md` 103.
  - **Exception used (`BRIEF-6.md` §2 A6):** *"Exception: `js/core/report.js` may change that one line to read `KOS.subjects` (the exam subjects, as `reports.js:39` already does). Nothing else there."* Exactly one line changed in `js/core/report.js`.
- **Verification (run before committing):**
  - `node --check js/core/report.js js/modules/reports.js` — pass.
  - `node tools/gen_lazy_index.mjs --check` — pass.
  - `smoke69` (10/10), `smoke70` (11/11), `smoke142` (12/12) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`) with a saved 3-subject report from `KOS.report.compute`: `subjectsMatchExam: true`, saved report renders CS, Maths, IT, and Exams without recomputing, zero overflow.

### Round A · Screenshots

````carousel
*Screenshot: A1 Practice Log 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A1 Practice Log Dawn 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A1 Practice Log 375×812 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A2 Reminders inspector 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A2 Reminders placed state 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A2 Reminders 375×812 (in the Antigravity session, not in the repo).*
````

````carousel
*Screenshot: A3 Calendar Skip this showing 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A3 Calendar Skipped date detail 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A3 Calendar 375×812 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A4 Achievements showcase autosave 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A4 Achievements showcase 375×812 (in the Antigravity session, not in the repo).*
````

````carousel
*Screenshot: A5 Mind desk with Review bar 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A5 Mind standalone cards page 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A5 Mind desk 375×812 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A6 Reports 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A6 Reports 820×1180 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: A6 Reports 375×812 (in the Antigravity session, not in the repo).*
````

### Round A · Boot bytes

- **Start of Batch 6 (`f26102f5`):** `5,355,991` B (`5.1079 MB`)
- **End of Round A (`fddb8b4f`):** `5,356,816` B (`5.1087 MB`) — budget `5,400,166` B (`5.15 MB`), **`43,350` B (`42.33 KB`) free** (`+825` B across Round A from boot files `creatives.js`, `dayreview.js`, `calendar.js`, `report.js`).

### Round A · Full gate summary

```text
run_smoke: 180 suite run(s), 3 worker(s), 300 s timeout (smoke56, smoke75 900 s), failures re-run alone at the end
...
  ok   smoke197      3.2 s
  ok   smoke198      1.8 s
  ok   smoke196      6.3 s

slowest: smoke75 129 s, smoke56 98 s, smoke142 39 s, smoke44 22 s, smoke45 18 s

run_smoke: 180 / 180 passed in 279.1 s wall (833 s summed)
```

New gate count: **180** suites (up from 179 with `tools/smoke198.test.js`).

### Round A · Noticed, not touched

- `js/modules/governor-ui.js:845` (the `"Edit seat"` modal for the Governor showcase) still uses an explicit draft + `"Save"` button; A4 scoped autosave to the Wall's showcase editor (`achievementspage.js`), so the Governor modal was left untouched.
- `js/core/report.js` still keeps `SUBJECTS` resolved once at script load (`var SUBJECTS = ...`); since `js/core/subjects.js` loads before `report.js` in `index.html`, this matches `reports.js:39` while staying strictly within the one-line exception.

### Round A · Uncertainties

- None open for Round A.

---

## Round B · Code's runner status (B1–B2)

### B1 · `bk:code-space#1` (M) — One runner status shared by tasks, listings, retrieval and capstones

- **R1 reproduction:** Opened `#/ref/code/T1.1` in live Chrome (`1470×832`) and probed `KOS.codeRun`: `KOS.codeRun.runnerStatus` and `KOS.codeRun.onStatus` did not exist, `KOS.codeRun.status("sql")` ignored the argument and returned `"ready"`, Run buttons carried no `data-runner` / `data-runner-state`, and a boot timeout on cold SQL or `.NET` returned `{ code: "TIMEOUT", kind: "timeout" }`, which `KOS.codeUI.errorCard` rendered as `"Did not finish — is there a loop whose condition never becomes false?"`, blaming learner code and marking Case 1 as `"✗ Fail"` in `check()`.
- **Commit:** `9ab6d4d8` — `feat(qol): bk:code-space#1 — shared per-runner status across Code surfaces`
- **Files and lines:**
  - `js/labs/sql-worker.js`: `:15, :17-19` (posts `{ type: "ready" }` after sealing the network before `return SQL`, preserving `smoke99` C's sealing regex, and `{ type: "failed", msg }` on `initSqlJs` rejection).
  - `js/core/coderun.js`: `:40-67, :80-103, :117-196, :232-341, :384-496` (added `runnerFor`, `runnerStatus` returning `{ runner, state: "booting"|"ready"|"busy"|"failed", limitMs, bootMs, error }`, backwards-compatible `status(which)`, and `onStatus(fn)`; kept all timeout constants `WATCHDOG = 4000`, `WASM_BOOT = 60000`, `WASM_WATCHDOG = 9000`, SQL fresh `WATCHDOG + 4000` and watchdogs untouched; distinguished `BOOT_TIMEOUT` / `RUNNER_FAILED` (`kind: "runner"`) from warm learner `TIMEOUT` (`kind: "timeout"`); kept `rtAssist` live-help out of `wasm` busy state per invariant 105; short-circuited `check()` on `kind === "runner"` via `out.runner` without failing cases or blaming compile).
  - `js/core/codeui.js`: `:259-301, :437-441, :706-729, :795-796` (added shared `KOS.codeUI.bindRun(btn, opts)` with `isConnected` auto-unsubscribe, `data-runner`/`data-runner-state`, and guaranteed label restoration on both `ready` and `failed`; updated `errorCard` and `results` for `kind === "runner"` / `check.runner`; wired `listing()` Run button through `bindRun`).
  - `js/modules/code.js`: `:617-621, :708-762, :1048-1150` (wired `pageTask` `code.run` + `code.check` and `pageRetrieval` `code.retrieval-check` through `bindRun`; handled `c.runner` / `r.error.kind === "runner"` without recording failed checks or charging retrieval tries).
  - `js/modules/codecap.js`: `:221-222, :279-282, :301-373` (wired `code.run`, `code.cap-test-all`, and `code.cap-test` through `bindRun`; handled `c.runner` / `r.error.kind === "runner"` without recording failed milestones).
  - `js/modules/codetopic.js`: `:583-657` (wired `predictCard`, `fillCard`, and `bugCard` through `bindRun` and handled `c.runner`).
  - `css/views/code.css`: `:754` (`.k-cx-rtcard .k-cx-err-head { color: var(--code); }` so the calm runner card heading has crisp contrast in Graphite and Dawn instead of inheriting `--alarm-ink`).
  - `tools/smoke198.test.js`: `:15-18, :184-291` (Step D: verified failing before B1, passing after — tests SQL boot lifecycle `ready → booting → busy → ready`, warm 4000 ms timeout still `kind: "timeout"`, cold SQL 8000 ms and cold `.NET` 60000 ms boot timeouts producing `kind: "runner"` / `c.runner` with calm error card and zero failed cases, and `bindRun` restoring retryable state on `failed`).
- **Helper reused:** `KOS.code.runnerFor`, `KOS.codeRun.onRuntime` listener pattern, `KOS.codeUI.errorCard`, and `KOS.codeUI.results`.
- **Invariants & exceptions:** `spaces.md` 104, 105, 106, 108. No core-file exception required.
- **Verification (run before committing):**
  - `node --check` on all 6 edited JS files — pass.
  - `node tools/gen_lazy_index.mjs --check` — pass (`402 KB`).
  - `smoke198` (5/5), `smoke55` (14/14), `smoke70` (11/11), `smoke73` (8/8), `smoke75` (6/6), `smoke76` (7/7), `smoke77` (6/6), `smoke99` (4/4), `smoke142` (12/12), `smoke196` (26/26) — all pass.
  - `node tools/cs_wasm_check.mjs` — all 26 programs agree with native .NET + all 13 live-help cases hold.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): real SQLite boot on `#/ref/code/T1.1` observed `["booting","busy","ready"]` and printed real rows; `#/code/task/T1.1-cols` confirmed `data-runner="sql"`, zero overflow, and crisp calm `"Runner did not start"` card.

### B2 · `code-space#1` (S) — Run says what it is waiting for

- **R1 reproduction:** Opened `#/ref/code/T1.1` in live Chrome (`1470×832`) and clicked Run on a cold SQL listing; while `sql` was `"booting"`, the button still read `"▶ Run"` and no `[data-ui~="code.run-limit"]` element was present (`{"btnText":"▶ Run","limitEl":false}`).
- **Commit:** `5e959080` — `feat(qol): code-space#1 — show what Run is waiting for and its time limit`
- **Files and lines:**
  - `js/core/codeui.js`: `:280-310` (extended `bindRun`: while `state === "booting"`, primary Run button (`opts.limit !== false`) shows `"Loading SQLite…"`, `"Starting .NET…"`, or `"Starting runner…"`, restoring original label on `busy`, `ready`, and `failed`; mounts at most one `<span class="k-cx-runlimit k-mono" data-ui="code.run-limit">` per bar via `opts.limit !== false`, showing boot limit `8 s limit` / `60 s limit` while booting, run limit `4 s limit` / `9 s limit` while busy, and hidden at idle; microtask mount ensures mid-boot navigation attaches the limit span immediately after DOM insertion).
  - `css/views/code.css`: `:20` (`flex-wrap: wrap` on `.k-ced-head`), `:733` (`flex-wrap: wrap` on `.k-cx-taskhead-act` at `<= 700px`), `:755` (`.k-cx-runlimit` token rule).
  - `tools/smoke198.test.js`: `:223-301` (extended Step D to assert single `code.run-limit` per 2-button bar, hidden at idle, `"Loading SQLite…"` + `"8 s limit"` while SQLite boots, `"4 s limit"` while busy, `"Starting .NET…"` + `"60 s limit"` while `.NET` boots, and label/limit reset on `ready` and `failed`).
- **Helper reused:** `KOS.codeRun.runnerStatus` / `onStatus` and `KOS.codeUI.bindRun` (from B1).
- **Invariants & exceptions:** `spaces.md` 104, 105, 106, 108; `ui.md` style rules. No core-file exception required.
- **Verification (run before committing):**
  - `node --check js/core/codeui.js` — pass.
  - `smoke198` (5/5), `smoke55` (14/14), `smoke70` (11/11), `smoke73` (8/8), `smoke75` (6/6), `smoke76` (7/7), `smoke77` (6/6), `smoke99` (4/4), `smoke142` (12/12), `smoke196` (26/26) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): verified `"Loading SQLite…"` + `"8 s limit"` (`limitCount: 1` on `T1.1-cols` task, clean single row on `375 px` SQL listing), `"Starting .NET…"` + `"60 s limit"` on `7.1`, mid-boot navigation mounting `code.run-limit` cleanly, and `overflow: false` across all three viewports.

### Round B · Screenshots

````carousel
*Screenshot: B1 Calm Runner did not start card 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: B2 SQL task Loading SQLite + 8 s limit 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: B2 SQL task 375×812 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: B2 SQL listing 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: B2 SQL listing 375×812 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: B2 .NET listing Starting .NET + 60 s limit 1470×832 (in the Antigravity session, not in the repo).*
````

### Round B · Boot bytes

- **End of Round A (`fddb8b4f`):** `5,356,816` B (`5.1087 MB`)
- **After B1 (`9ab6d4d8`):** `5,364,773` B (`5.1162 MB`, `+7,957` B)
- **End of Round B (`5e959080`):** `5,365,751` B (`5.1172 MB`) — budget `5,400,166` B (`5.15 MB`), **`34,415` B (`33.61 KB`) free** (`+8,935` B across Round B from boot files `coderun.js` and `codeui.js`).

### Round B · Full gate summary

```text
run_smoke: 180 suite run(s), 3 worker(s), 300 s timeout (smoke56, smoke75 900 s), failures re-run alone at the end
...
  ok   smoke197      3.3 s
  ok   smoke198      1.9 s
  ok   smoke196      6.2 s

slowest: smoke75 150 s, smoke56 103 s, smoke142 41 s, smoke44 38 s, smoke43 19 s

run_smoke: 180 / 180 passed in 309.5 s wall (924 s summed)
```

### Round B · Noticed, not touched

- `js/core/fillins.js:239, :413` (`fill.run` in non-Code study notes for inline SQL/C# fill-in exercises) also calls `KOS.codeRun.run`; B1/B2 scoped to Code's four surfaces (`codeui.js`, `code.js`, `codecap.js`, `codetopic.js`), though `fillins.js` still benefits automatically from `coderun.js`'s `kind: "runner"` boot-timeout wording.

### Round B · Uncertainties

- None open for Round B.

---

## Round C · Goals (C1–C3)

### C1 · `bk:goals#3` (S) — Japanese and Mind goal types

- **R1 reproduction:** Opened `#/goals` and clicked `+ New goal` in live Chrome (`1470×832`). In `KOS.goals.types()`, `ja-lessons` and `ja-reviews` existed, while Japanese facets reviewed (`ja-facets`) and Mind Daily 15 days kept (`mind-daily15`) were absent (`["study-hours", ..., "ja-lessons", "ja-reviews", ...]`, no `ja-facets`, no `mind-daily15`).
- **Commit:** `0109479c` — `feat(qol): bk:goals#3 — add Japanese facets reviewed and Mind Daily 15 goal types`
- **Files and lines:**
  - `js/core/goals.js`: `:951-961` (registered `ja-facets` — `"Review Japanese facets"`, counting `spaceN(ctx, "ja", "session", "n")` — and `mind-daily15` — `"Keep Mind Daily 15 days"`, counting distinct dates of `focus` ledger entries with `subject === "mind" && metrics.objective === "Mind · Daily 15"` plus today's `ui.mind.daily.doneAt` when not yet logged; kept `ja-lessons` and `ja-reviews` untouched per approval).
- **Helper reused:** `G.register` (`js/core/goals.js`), `spaceN` (`:865`), and `inRange` (`:425`).
- **Invariants & exceptions:** `core.md` 5b (goals store no progress of their own and measure only from owning records); `spaces.md` 112, 116, 137. Used the exact C1 exception (`js/core/goals.js` may gain new `G.register({...})` calls in the existing pattern, and nothing else there).
- **Verification (run before committing):**
  - `node --check js/core/goals.js` — pass.
  - `smoke84` (17/17), `smoke85` (10/10), `smoke86` (11/11), `smoke87` (12/12), `smoke142` (12/12), `smoke146` (13/13), `smoke194` (7/7) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): created both `ja-facets` and `mind-daily15` goals in `+ New goal` dialog, confirmed live measurement from sessions + `ui.mind.daily.doneAt`, zero overflow across all three viewports.

### C2 · `shop-cosmetics#2` (M) — "Save gold for X" as a goal

- **R1 reproduction:** Opened `#/governor/shop` in live Chrome (`1470×832`). Clicking a locked item opened the shop sheet with `"Pin as a goal"` (`shop.pin-btn`) which wrote `state.ui.shopPin` only; there was no `"Add to Goals"` action on the sheet or pin card, and no `gov-gold` type in `KOS.goals.types()`.
- **Commit:** `6576a7a1` — `feat(qol): shop-cosmetics#2 — Save gold for X goal and Add to Goals from Shop`
- **Files and lines:**
  - `js/core/goals.js`: `:971-977` (registered `gov-gold` — `"Save gold for a Shop item"`, `displayOnly: true`, reads `store.state.governor.gold` vs `KOS.governor.item(params.item).price`; marks completed with `payout: "none"` and never buys or pays).
  - `js/modules/governor-ui.js`: `:494-520, :589-599, :708-717` (hoisted `goalForShopItem` and `openShopGoal` in `renderShop()`; added `"Add to Goals"` / `"View in Goals"` (`shop.add-goal`) in `shopSheet` closing the sheet before calling `a.onClick()` to prevent modal-from-modal stacking, and `"Add to Goals"` / `"In Goals →"` (`shop.pin-add-goal`) on `shop.pin`).
  - `js/modules/goals.js`: `:248, :662-665, :876-890, :955-961` (`actionFor` for `gov-gold` navigates to `KOS.show("governor", "shop")` without buying; added `[data-ui="goal.shop-item"]` select in `goalDialog` preserving `seed.params`).
  - `tools/smoke198.test.js`: `:19, :304-370` (Step E: verified failing before C2, passing after — tests `shop.add-goal`, `gov-gold` progress against `governor.gold`, reaching target without buying or changing gold/XP/HP, `payout: "none"`, and `"View in Goals"` once created).
- **Helper reused:** `G.register`, `KOS.goalsUI.newGoal` (via `KOS.lazy.need("page-goals")`), `KOS.governor.item` / `CATALOG`.
- **Invariants & exceptions:** `core.md` 1, 2, 5b; W5 42d (buying always asks first). Used the exact C2 exception (`js/core/goals.js` one new `G.register` call).
- **Verification (run before committing):**
  - `node --check` on `js/core/goals.js`, `js/modules/governor-ui.js`, `js/modules/goals.js` — pass.
  - `node tools/gen_lazy_index.mjs --check` — pass (`402 KB`).
  - `smoke198` (6/6), `smoke85` (10/10), `smoke117` (6/6), `smoke142` (12/12), `smoke146` (13/13), `smoke160` (5/5), `smoke162` (8/8) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): verified shop sheet `"Add to Goals"` cleanly closes sheet and opens pre-filled Goal dialog, verified pin card `"Add to Goals"` / `"In Goals →"`, zero overflow across all three viewports.

### C3 · `bk:goals#2` (M) — "Make this a goal" where the data lives

- **R1 reproduction:** Checked Routines (`#/routines/routines`), Money Pots (`#/money/pots`), Money Budgets (`#/money/budgets`), Exam Today/readiness (`#/exams/<id>/today`), and Collection entry editor (`#/books`) in live Chrome (`1470×832`): none offered `"Make this a goal"`, and `goalDialog` in `js/modules/goals.js` ignored `seed.links`, `seed.linkedEntryId`, `seed.params.routine`, and `seed.deadline`.
- **Commits:**
  - `7456781b` — `feat(qol): bk:goals#2 — Make this a goal from routines, pots, exams, Collection and budgets`
  - `89cd0aba` — `fix(qol): bk:goals#2 — keep exam ⋯ menu to Edit, Archive, Delete (smoke187)` (caught by full gate: `smoke187` asserts exact items on the exam `⋯` menu, while `"Make this a goal"` lives cleanly on the exam's Today/readiness header).
- **Files and lines:**
  - `js/modules/goals.js`: `:821-828, :866-875, :955-961` (`goalDialog(existing, seed)` now honours `seed.links`, `seed.linkedEntryId`, `seed.params.routine`, and ISO `seed.deadline`).
  - `js/modules/routines.js`: `:877-885` (`routineCard` footer `"Make this a goal"` (`routine.make-goal`) → `KOS.lazy.need("page-goals")` → `routine-days` with `params: { routine: r.id }`).
  - `js/modules/money.js`: `:1089-1096, :1445-1448, :1496-1503, :1510` (`potHero` `"Make this a goal"` (`money.pot-make-goal`) when unlinked + `potCard` `⋯` menu → `money-save` with `target: p.target / 100`, `deadline: p.by`, `links: { pot: p.id }`; `budRow` `⋯` menu → `money-spend-under` with `target: b / 100`, `repeat: "month"`, `links: { category: c.id }`).
  - `js/modules/examshell.js`: `:379-396` (`openExamGoal` picking `exam_recall` when in `KOS.goalsExams.typesFor(a)` else `ts[0]` with `links: { examId: a.id }` per invariant 128; wired to `"Make this a goal"` (`exams.make-goal`) in `todaySec`).
  - `js/modules/medview.js`: `:778-797` (`editorActions` adds `"Make this a goal"` (`vault.make-goal`) for existing entries, closing `overlay` before loading `page-goals` and opening `finish-series` or `specific-title` with `linkedEntryId: e.id`).
  - `tools/smoke198.test.js`: `:20, :372-461` (Step F: verified failing before C3, passing after — exercises all five entry points and verifies pre-filled links/targets/deadlines with zero modal stacking).
- **Helper reused:** `KOS.goalsUI.newGoal` via `KOS.lazy.need("page-goals")` (`goals.js:772`), `KOS.goalsExams.typesFor` (`goals-exams.js`).
- **Invariants & exceptions:** `core.md` 5a, 5b; `exams.md` 128, 129; `media.md` 6. No core-file exception required (zero boot bytes added).
- **Verification (run before committing):**
  - `node --check` on all 5 edited JS files — pass.
  - `node tools/gen_lazy_index.mjs --check` — pass (`402 KB`).
  - `smoke198` (7/7), `smoke5` (19/19), `smoke8` (22/22), `smoke52`, `smoke54` (14/14), `smoke84` (17/17), `smoke85` (10/10), `smoke86` (11/11), `smoke87` (12/12), `smoke89` (12/12), `smoke146` (13/13), `smoke161` (12/12), `smoke185` (13/13), `smoke187` (9/9), `smoke189` (15/15) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): verified Routines (`1470`, `375`), Money Pots (`1470`, `375`), Money Budget goal dialog (`1470`), Exam Today (`1470`, `820`, `375`), and Collection editor (`1470`); zero overflow, 32–35.5 px hit heights on desktop/phone.

### Round C · Screenshots

````carousel
*Screenshot: C1 New Japanese and Mind goal types 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: C2 Shop sheet Add to Goals 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: C2 Save gold for X goal dialog 820×1180 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: C3 Routine Make this a goal 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: C3 Money Pot Make this a goal 375×812 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: C3 Exam Today Make this a goal 820×1180 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: C3 Collection editor Make this a goal 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: C3 Budget Make this a goal pre-filled dialog 1470×832 (in the Antigravity session, not in the repo).*
````

### Round C · Boot bytes

- **End of Round B (`5e959080`):** `5,365,751` B (`5.1172 MB`)
- **After C1 (`0109479c`):** `5,366,610` B (`5.1180 MB`, `+859` B in `js/core/goals.js`)
- **After C2 (`6576a7a1`):** `5,367,102` B (`5.1185 MB`, `+492` B in `js/core/goals.js`)
- **End of Round C (`89cd0aba`):** `5,367,102` B (`5.1185 MB`, `+0` B from C3) — budget `5,400,166` B (`5.15 MB`), **`33,064` B (`32.29 KB`) free** (`+1,351` B across Round C).

### Round C · Full gate summary

```text
run_smoke: 180 suite run(s), 3 worker(s), 300 s timeout (smoke56, smoke75 900 s), failures re-run alone at the end
...
  ok   smoke197     16.3 s
  ok   smoke196     20.7 s
  ok   smoke198     11.2 s

slowest: smoke75 185 s, smoke56 157 s, smoke142 61 s, smoke 26 s, smoke146 24 s

run_smoke: 180 / 180 passed in 395.6 s wall (1178 s summed)
```

### Round C · Noticed, not touched

- In `goalDialog` (`js/modules/goals.js` / `css/views/goals.css`), the `"Repeats"` segmented control's 4th segment (`"Every month"`) slightly clips at its right edge inside the narrow dialog on desktop (pre-existing layout, not introduced by C3).
- On phone (`<= 700 px`), Exams' compact accordion layout intentionally hides `.k-xs-shead` (where `exams.make-goal` and `Skip today` live), consistent with Exams' existing mobile contract.

### Round C · Uncertainties

- None open for Round C.

---

## Round D · Money (D1–D3)

### D1 · `bk:money-goals#3` (S) — What a Santander student needs from an import

- **R1 reproduction & already-built check:**
  - Verified that Santander merchant tidying is already built in `js/core/moneyimport.js:374–424` (`clean`, `titleCase`, `merchant`) and locked by `tools/smoke149.test.js` step D (`:197–234`): `"HERON FOODS HOYLAND (VIA APPLE PAY), ON 29-10-2026"` resolves to `"Heron Foods"` (`food`, keeping raw text in `t.bank.text` and `t.raw`) and unknown Santander strings (e.g. `"CARD PAYMENT TO BOBS BIKE SHED BARNSLEY,12.00 GBP, RATE 1.00/GBP ON 03-11-2026"`) tidy to `"Bobs Bike Shed Barnsley"`. `js/core/moneyimport.js` was therefore left untouched so `smoke149`'s golden rows stay intact.
  - Reproduced the remaining `partly` gap (`docs/qol/backlog-checked-b.jsonl:16`) in live Chrome (`1470×832`): importing a synthetic CSV with two monthly `DEB` card payments (`GOOGLE *Google One`, `-£1.59`, `28/09/2026` and `28/10/2026`, no recurring rule) showed no `[data-ui="money.import-suggestions"]` card on Done, and `"Make it recurring"` (`js/modules/moneyimp.js:358`) previously discarded `p2.ruleEditor(...)`'s returned DOM element without opening a dialog.
- **Commit:** `1207c18e` — `feat(qol): bk:money-goals#3 — suggest monthly card repeats on import Done and open rule editor`
- **Files and lines:**
  - `js/modules/moneyimp.js`: `:323–396` (added read-only `monthlyCardRepeats()` checking imported outgoings + stored rows in the preceding 40 days via `M.range` for same `M.payeeKey` and exact `minor` 25–35 days apart not already covered by an active rule or `DD`/`SO` suggestion; updated Done card subtitle; wired `"Make it recurring"` (`money.import-suggest`) to open `p2.ruleEditor` inside `p2.dialogBox(..., { hook: "money.suggest-rule-dialog" })` and close/drop the suggestion upon save).
  - `css/views/money.css`: `:446–447` (`flex-wrap: wrap` on `.k-mn-suggest .k-card-row` and `min-inline-size: var(--mn-sub-next)` on `.k-mn-suggest .k-mn-grow` — caught by inspecting `375×812` screenshot where the merchant name had collapsed to 0 px).
- **Helper reused:** `M.range`, `M.rules`, `M.payeeKey`, `p2.ruleEditor`, `p2.dialogBox`.
- **Invariants & exceptions:** `core.md` 5a; `ui.md` 43, 49. No core-file exception used (`js/core/moneyimport.js` and `js/core/money.js` untouched; 0 boot bytes).
- **Verification (run before committing):**
  - `node --check js/modules/moneyimp.js`, `node tools/gen_lazy_index.mjs --check` (`402 KB`) — pass.
  - `smoke55` (14/14), `smoke84` (17/17), `smoke149` (13/13), `smoke161` (12/12) — all pass.
  - Live Chrome (`1470×832`, `375×812`): confirmed synthetic monthly `DEB` Google One CSV surfaces `"Looks like regular payments"`, `"Make it recurring"` opens pre-filled `money.suggest-rule-dialog` and saves the subscription rule, `nameW: 129 px` and `ov: false` at `375×812`.

### D2 · `bk:money-goals#4` (S) — Import history

- **R1 reproduction & core-file boundary check:**
  - Verified in live Chrome (`1470×832`): `KOS.show("money", "imports")` fell back to `"overview"`, `money.tx-source` offered no `"Imported (all files)"` filter when multiple imports exist, and Transactions had no `"Select all"` checkbox.
  - **Recorded limitation (exact lines):** `state.money.imports` (`M.imports()`, `js/core/money.js:195–213, :1536–1538`) and `t.batch` / `t.imp` (`:643, :648–649`) carry file name, format, date range (`from`/`to`), added count (`n`), live remaining count (`M.importCounts`), closing balance, and Undo/Replace, but `normaliseImport` (`js/core/money.js:195–213`) does not retain `duplicates` or `unreadable` counts and skipped/unreadable rows are never stored in `kurenai-os-money`. Because `js/core/money.js` is off-limits with no exception in D2 and adding a new store is forbidden, persistent per-batch `duplicates`/`unreadable` counts cannot be added without a core exception.
- **Commit:** `4a1d07d2` — `feat(qol): bk:money-goals#4 — Money Imports route, Imported source filter and Transactions Select all`
- **Files and lines:**
  - `js/modules/money.js`: `:132–160, :548–620, :700, :753–762, :1767–1776` (wired direct `#/money/imports` view rendering `KOS.moneyImp.importsView` using `router.js:123, :149`'s existing string route; added `"Source: Imported (all files)"` (`src: "csv"`, shown when `imps.length > 1` so `smoke161:202`'s single-import option count stays intact) passed to `M.list` and `M.listTotals`; added `"Select all"` (`money.tx-select-all`) bar syncing checked/indeterminate state with loaded rows and `drawBulk`).
  - `css/views/money.css`: `:114–116` (`.k-mn-selbar` and `.k-mn-selall` aligned to row checkboxes with `min-block-size: var(--hit)`).
- **Helper reused:** `KOS.moneyImp.importsView`, `M.imports`, `M.importCounts`, `M.list({ src: "csv" })`, `M.listTotals({ src: "csv" })`.
- **Invariants & exceptions:** `core.md` 5a; `sync.md` 31, 32, 33a, 36d. No core-file exception (0 boot bytes).
- **Verification (run before committing):**
  - `node --check js/modules/money.js`, `node tools/gen_lazy_index.mjs --check` (`402 KB`) — pass.
  - `smoke55` (14/14), `smoke84` (17/17), `smoke85` (10/10), `smoke86` (11/11), `smoke87` (12/12), `smoke149` (13/13), `smoke161` (12/12) — all pass.
  - Live Chrome (`1470×832`, `375×812`): verified `#/money/imports` renders both synthetic batches with Undo/Replace, `"Source: Imported (all files)"` excludes manual rows, `"Select all"` selects all loaded rows into bulk bar, `ov: false`.

### D3 · `bk:money-goals#6` (M) — A "Not yet confirmed" queue for Recurring

- **R1 reproduction:** Seeded two monthly recurring rules (`Phone` starting `2026-08-20` → 4 past occurrences; `Music` starting `2026-09-18` → 3 past occurrences; 7 total) in live Chrome (`1470×832`): `#/money/recurring` showed only `dueCards: 2` (14-day cap, 1 per rule, max 3), hiding 5 older occurrences, with no queue card, no `Confirm all` / `Skip all`, and no inline bank-match suggestion.
- **Commit:** `104a5873` — `feat(qol): bk:money-goals#6 — Not yet confirmed Recurring queue with statement matches, Confirm all and Skip all`
- **Files and lines:**
  - `js/modules/money.js`: `:973–991` (added Undo toast `{ label: "Undo", run }` calling `M.unmark` on `confirmOcc` / `confirmNew` without double-speaking via `announce`), `:1211–1325` (replaced 14-day/max-3 `dueCard` list with `unconfirmedList` + `unconfirmedCard` (`money.unconfirmed`) computing every past unconfirmed non-trial occurrence from `r.start` via `M.occurrences`; per-row `money.occ-confirm`, `money.occ-other`, `money.occ-skip` with Undo; async read-only `M.bankMatches` guarded by `KOS.view.token()` and `row.isConnected` showing `[data-ui="money.occ-match"]` + `"Use statement entry"` (`money.occ-use-bank`) calling `M.confirmWith` ONLY on user press with Undo releasing the bank row intact; `"Confirm all"` (`money.occ-confirm-all`) and `"Skip all"` (`money.occ-skip-all`) asking first via `KOS.ui.confirm` with bulk `unmarkMany` Undo toast).
  - `css/views/money.css`: `:216–224` (token-only `.k-mn-queue`, `.k-mn-qhead`, `.k-mn-qlist`, `.k-mn-qrow`, `.k-mn-qmain`, `.k-mn-qmatch` with clean wrap on `375 px` phone).
  - `tools/smoke198.test.js`: `:26–29, :485–568` (Step G: verified failing before D3, passing after — tests all 7 past occurrences > 14 days, render purity, inline bank match never auto-confirmed, `confirmWith` press + Undo keeping bank row, `Skip all` confirm + Undo, `Confirm all` confirm + Undo, zero Governor/session/error).
- **Helper reused:** `M.occurrences`, `M.occurrenceState`, `M.amountOn`, `M.confirm`, `M.skip`, `M.unmark`, `M.bankMatches`, `M.confirmWith`, `KOS.ui.confirm`, `KOS.ui.toast`, `KOS.view.token`, `KOS.ui.amount`.
- **Invariants & exceptions:** `core.md` 5a; `ui.md` 43, 47–50, 66; `sync.md` 31, 32, 33a, 36d. Zero edits to `js/core/money.js` (0 boot bytes).
- **Verification (run before committing):**
  - `node --check js/modules/money.js`, `node tools/gen_lazy_index.mjs --check` (`402 KB`) — pass.
  - `smoke198` (8/8), `smoke55` (14/14), `smoke84` (17/17), `smoke85` (10/10), `smoke86` (11/11), `smoke87` (12/12), `smoke149` (13/13), `smoke161` (12/12) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): verified all 7 past occurrences rendered, inline `"Matches statement · Vodafone · 19 Nov"` + `"Use statement entry"` readable in full at `375×812`, `btnH: 32`, `ov: false` across all three viewports, and Hide amounts masking all 7 queue figures (`allMasked: true`).

### Round D · Screenshots

````carousel
*Screenshot: D1 Monthly card repeat suggestion on import Done 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: D1 Make it recurring rule editor dialog 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: D1 Monthly card repeat suggestion 375×812 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: D2 Money Imports direct route 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: D2 Transactions Imported filter and Select all 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: D3 Not yet confirmed Recurring queue 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: D3 Not yet confirmed Recurring queue 820×1180 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: D3 Not yet confirmed Recurring queue 375×812 (in the Antigravity session, not in the repo).*
````

### Round D · Boot bytes

- **End of Round C (`89cd0aba`):** `5,367,102` B (`5.1185 MB`)
- **End of Round D (`104a5873`):** `5,367,102` B (`5.1185 MB`, `+0` B across Round D — all JS edits in lazy `page-money` modules) — budget `5,400,166` B (`5.15 MB`), **`33,064` B (`32.29 KB`) free**.

### Round D · Full gate summary

```text
run_smoke: 180 suite run(s), 3 worker(s), 300 s timeout (smoke56, smoke75 900 s), failures re-run alone at the end
...
  ok   smoke197      4.0 s
  ok   smoke198      2.8 s
  ok   smoke196      6.8 s

slowest: smoke75 179 s, smoke56 158 s, smoke142 50 s, smoke44 23 s, smoke45 19 s

run_smoke: 180 / 180 passed in 379.6 s wall (1136 s summed)
```

### Round D · Noticed, not touched

- Persistent per-batch `duplicates` and `unreadable` counts on `Money › Imports` require adding fields to `normaliseImport` (`js/core/money.js:195–213`) and `importRows` (`:1536–1538`), which are off-limits in Batch 6; left untouched.
- `css/views/money.css` still holds `.k-mn-due` / `.k-mn-occ` rules (retained harmlessly in case any future view reuses the occurrence strip, and still passes `smoke55`).

### Round D · Uncertainties

- None open for Round D.

---

## Round E · Japanese (E1–E2)

### E1 · `bk:ja-mind#4` (S) — Japanese leech recovery

- **R1 reproduction:** Seeded a Japanese facet (`k:あ|R`) with `lapses: 8` (`KOS.jaSrs.leech(f) === true`) in live Chrome (`1470×832`): `KOS.jaSrs.unleech` was missing (`hasUnleech: false`), the facet disappeared from `KOS.ja.queue()`, and `#/subject/ja` Rework listed it as a plain `8×` row with zero recovery actions (`hasRelearn: false`, `hasBack: false`) and no `"Set aside"` cue.
- **Commit:** `3c7107ce` — `feat(qol): bk:ja-mind#4 — Japanese leech recovery with unleech, leechBase and desk actions`
- **Files and lines:**
  - `js/core/jasrs.js` (BOOT — exact E1 core-file exception): `:22–28` (`LEECH_AGAIN = 4`, `leechThreshold(f)` returning `(f.leechBase || 0) + (f.leechBase ? LEECH_AGAIN : LEECH)` and `leech(f)` comparing against it), `:92–113` (`review()` preserving `leechBase` across reviews), `:119–133` (`unleech(key, facets)` clearing set-aside by stamping `f.leechBase = f.lapses` and returning `{ ok, prevBase }`, never zeroing `lapses`), `:260–266` (exported `unleech`, `LEECH_AGAIN`).
  - `js/modules/japanese.js` (`page-ja`, lazy): `:240–313` (`lessonForItem`, `leeches`, `leechRows` rendering `[data-ui="ja.leech-row"]` with `"Set aside"` badge, `"Relearn from the lesson"` (`ja.leech-lesson` → `KOS.show("ref", { subject: "ja", ref: r.lesson.id })`), and `"Back in the schedule"` (`ja.leech-unleech` → `KOS.jaSrs.unleech` + single Undo toast `{ label: "Undo", run }` restoring `delete cur.leechBase` when `prevBase == null`); wired into desk `reworkCard()` and `skillsPage` Rework card).
  - `css/views/japanese.css`: `:140–143` (token-only `.k-ja-leech-row`, `.k-ja-leech-main`, `.k-ja-leech-acts`).
  - `tools/smoke198.test.js`: `:29–32, :570–639` (Step H: verified failing before E1, passing after — tests set-aside detection, `Relearn from the lesson` navigation, `Back in the schedule` + Undo restoring exact `leechBase` absence, re-triggering after 4 further lapses at 12, and zero Governor sessions logged).
- **Helper reused:** `KOS.jaSrs.leech`, `KOS.jaSrs.split`, `KOS.ja.lessons`, `KOS.ja.rework`, `KOS.ui.toast` (Undo action, speaks itself), `KOS.show("ref", ...)`.
- **Invariants & exceptions:** `study.md` 111, 111b; `spaces.md` 113, 114, 116; `core.md` 3, 4; `ui.md` 43, 66. Used exact E1 core-file exception (`js/core/jasrs.js`: `unleech` + `leechBase` threshold only).
- **Verification (run before committing):**
  - `node --check js/core/jasrs.js`, `node --check js/modules/japanese.js`, `node tools/gen_lazy_index.mjs --check` (`402 KB`), `node tools/ja_valid_check.mjs` (128/128) — pass.
  - `smoke198` (9/9), `smoke55` (14/14), `smoke82` (7/7), `smoke83` (8/8), `smoke115` (11/11), `smoke116` (9/9), `smoke117` (6/6), `smoke132` (10/10), `smoke148` (13/13), `smoke142` (12/12) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): zero overflow across all viewports; `Relearn from the lesson` (`32 px`) and `Back in the schedule` legible with clean stacking.

### E2 · `bk:ja-mind#5` (M) — Logging Japanese immersion (watching, reading, listening) through Focus

- **R1 reproduction:** Opened `#/subject/ja` and `#/focus` in live Chrome (`1470×832`): `"Input this week"` said `"Watching and reading in Japanese counts here, through Focus."` with no `"Log immersion"` entry point (`hasLogBtn: false`), and Focus offered no Japanese immersion kind (`hasImm: false`).
- **Commits:**
  - `c5110030` — `feat(qol): bk:ja-mind#5 — log Japanese immersion through Focus and read minutes on desk`
  - `153dd3fa` — `fix(qol): bk:ja-mind#5 — mount Japanese immersion field after focus.link-row (smoke34)`
- **Files and lines:**
  - `js/modules/focus.js` (BOOT): `:75–76` (`IMMERSION_KINDS = ["watch", "read", "listen"]`, `IMMERSION_LABEL`), `:331` (`S.immersion` stored only when `!reading0 && links.subject === "ja"`), `:372` (`f.lastConfig.immersion` saved only when set), `:722–754` (attaches `logMetrics.immersion` ONLY when `sess.immersion` is set and `parts` has a positive `"ja"` stretch — non-immersion sessions leave `metrics.immersion` completely absent), `:972–974` (`contextNode()` `"Immersion · Watching/Reading/Listening"` chip while on `"ja"`), `:2286` (pre-fill `cfg.immersion` from `arg.immersion` without starting, invariant 4e), `:2494–2504` (`[data-ui="focus.ja-immersion"]` select mounted cleanly after `focus.link-row` so `smoke34`'s 3-field contract holds), `:2560` (passes `immersion` into `start(cfg)` and `preflight`), `:2707–2709` (`sync()` shows the selector only when `subjSel.value === "ja"` and clears it otherwise).
  - `js/modules/japanese.js` (`page-ja`, lazy): `:26–32` (optional `hook` param on `cardHead`), `:49–63` (`weekInput()` sums legacy `j.input[d]` plus the last 7 days' non-undone `focus` sessions carrying `metrics.immersion`, counting strictly the `"ja"` stretch via `KOS.sessions.secsFor(e, SID)` and ignoring undone entries via `KOS.sessions.undone(e)`), `:343–356` (`inputCard(wi)` adds `"Log immersion →"` (`ja.log-immersion`) calling `KOS.show("focus", { subject: SID, immersion: "watch" })` and displays `Watching`, `Reading`, `Listening`, `Raw`, `JP subtitles`).
  - `tools/smoke198.test.js`: `:30–34, :641–715` (Step I: verified failing before E2, passing after — tests `"Log immersion →"` pre-fill without starting, selector visibility toggling on subject change, 30-min Watching session paid solely by `KOS.governor.focusAward` with zero extra `ja` ledger entries, clean non-immersion session with `!("immersion" in plain.metrics)`, multi-stretch session counting ONLY the 20-min `"ja"` stretch, undone listening session ignored, and render purity).
- **Helper reused:** `KOS.governor.focusAward`, `KOS.sessions.log`, `KOS.sessions.secsFor` (backed by `KOS.sessions.parts`), `KOS.sessions.undone`, `KOS.show("focus", ...)`, `cardHead`, `hmText`.
- **Invariants & exceptions:** `core.md` 3, 4, 4a, 4e; `study.md` 111, 111b; `spaces.md` 113, 114, 116; `ui.md` 43, 44. Zero edits to any core file (`sessions.js`, `governor.js`, `ja.js` untouched).
- **Verification (run before committing):**
  - `node --check js/modules/focus.js`, `node --check js/modules/japanese.js`, `node tools/gen_lazy_index.mjs --check` (`402 KB`) — pass.
  - `smoke198` (10/10), `smoke3` (all pass), `smoke34` (28/28), `smoke55` (14/14), `smoke61` (13/13), `smoke82` (7/7), `smoke116` (9/9), `smoke142` (12/12) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): verified zero overflow across all viewports on both `#/subject/ja` (`Input this week: 50 m · Watching 30 m · Reading 20 m`, `"Log immersion →"`) and `#/focus` (`"Japanese immersion (optional)"` pre-filled to `"Watching"`, hidden for non-Japanese subjects).

### Round E · Screenshots

````carousel
*Screenshot: E1 Japanese desk Rework leech recovery 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: E1 Japanese desk Rework leech recovery 375×812 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: E2 Japanese desk Input this week + Rework 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: E2 Japanese desk Input this week 375×812 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: E2 Focus setup Japanese immersion selector 1470×832 (in the Antigravity session, not in the repo).*
<!-- slide -->
*Screenshot: E2 Focus setup Japanese immersion selector 375×812 (in the Antigravity session, not in the repo).*
````

### Round E · Boot bytes

- **End of Round D (`104a5873`):** `5,367,102` B (`5.1185 MB`)
- **End of Round E (`153dd3fa`):** `5,369,207` B (`5.1205 MB`, `+2,105` B across Round E — `js/core/jasrs.js` for E1 and `js/modules/focus.js` for E2; `js/modules/japanese.js` stays lazy in `page-ja`) — budget `5,400,166` B (`5.15 MB`), **`30,959` B (`30.23 KB`) free**.

### Round E · Final full gate summary

```text
run_smoke: 180 suite run(s), 3 worker(s), 300 s timeout (smoke56, smoke75 900 s), failures re-run alone at the end
...
  ok   smoke197      3.8 s
  ok   smoke198      2.8 s
  ok   smoke196      6.5 s

slowest: smoke75 135 s, smoke56 106 s, smoke142 43 s, smoke44 22 s, smoke45 18 s

run_smoke: 180 / 180 passed in 296.4 s wall (886 s summed)
```

### Round E · Noticed, not touched

- Legacy `state.japanese.input` (the old `read` / `listen` / `raw` / `jpSub` daily tally map) is still read additively by `weekInput()` so any pre-existing data never disappears; no new writes to `state.japanese.input` were added.
- A mid-session `switchTo` from Japanese to another subject preserves `S.immersion` for the `"ja"` stretch already run, while hiding the live `"Immersion · …"` chip on non-Japanese stretches and attributing only the `"ja"` stretch seconds on the desk.

### Round E · Uncertainties

- None open for Round E.

---

## Batch 6 · Branch summary (`neon/qol-batch-6`)

- **Tickets delivered:** 16 / 16 across Rounds A–E (`18` commits on top of `origin/main`, including two full-gate regression fixes `89cd0aba` for `smoke187` and `153dd3fa` for `smoke34`).
- **Core-file exceptions used (exact brief scope only):**
  - `js/core/report.js` (A6 — read `KOS.subjects` as the one subject registry)
  - `js/core/goals.js` (C1 — `ja-facets`, `mind-daily15`; C2 — `gov-gold` goal kind)
  - `js/core/jasrs.js` (E1 — `unleech` + `leechBase` / `LEECH_AGAIN = 4`)
  - No other off-limits core files touched; `js/data/lazy-index.js`, `compsci.js`, `maths.js`, `it.js` untouched and current (`node tools/gen_lazy_index.mjs --check` passes at `402 KB`).
- **Boot budget:** `5,369,207` B (`5.1205 MB`) vs `5,400,166` B (`5.15 MB`) budget (`30,959` B / `30.23 KB` headroom).
- **Release gate:** `SMOKE_JOBS=3 npm test` — **180 / 180 passed** (including all 10 steps of `tools/smoke198.test.js` covering Rounds A–E).
