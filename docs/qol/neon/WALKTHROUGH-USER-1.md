# Walkthrough — User-Directed Customisation Branch (`neon/user-custom-1`)

> **User-Authorised Branch:** Every ticket on `neon/user-custom-1` (cut cleanly from `origin/main` at `f26102f5`, completely independent of `neon/qol-batch-6`) was explicitly requested by the user, outside `PLAN.md` and `BRIEF-6.md`. The user granted explicit permission to edit core files (`js/core/*`, `js/modules/*`, `css/*`, state/schema/sync wiring where required) whenever a feature genuinely needs it, while keeping generated files (`js/data/compsci.js`, `maths.js`, `it.js`, `lazy-index.js` except via `gen_lazy_index.mjs`), `js/env*.js`, `supabase/`, `.claude/`, and `docs/memory/` untouched. All commits carry `Agent: Gemini 4 Neon (Antigravity)` and a `User-authorised customisation (neon/user-custom-1).` note.

---

## Round 1 · Home & Kurenai Panel (U1–U3)

### U1 · Kurenai panel centring, aura alignment & animation clipping

- **R1 reproduction:** Opened `#/assistant` (`tab: "chat"`) in live Chrome (`1470×832`, Graphite & Dawn). `.k-asst-stage .k-asst-mascot` used `justify-content: flex-end;` (`css/views/assistant.css:370`), leaving a `143 px` dead gap (`y: 113..256`) above Kurenai's frame (`440 px` tall). `.k-asst-presence` painted its radial aura at `50% 38%` (`y ≈ 353`, near her forehead instead of behind her body), and `.k-asst-mascot-frame { overflow: hidden }` clipped the top of her `605×1400` figure whenever `asstBreath`, `:hover`, `asstNudge`, or `asstEnterSuccess` lifted her upward.
- **Commit:** `59e9d99f` — `fix(custom): U1 — centre Kurenai panel figure, align aura and prevent idle head clipping`
- **Files and lines:**
  - `css/views/assistant.css`: `:361` (`.k-asst-presence` radial gradient centre `50% 38%` → `50% 47%`), `:366` (`.k-asst-stage` `padding-block-start: var(--sp-20)`), `:371` (`.k-asst-stage .k-asst-mascot-frame` `margin-block: auto; overflow: visible; max-block-size: calc(100% - var(--sp-24))`), `:375` (`.k-asst-stage .k-asst-mascot-frame::before` `inset: 14% -8% 14%`), `:376` (`.k-asst-stage .k-asst-status` `flex: none`), `:406–408` (empty drawer stage `padding: var(--sp-24) 0 0` and frame `overflow: visible`).
  - `tools/smoke199.test.js`: `:1–65` (new suite for `neon/user-custom-1`, Step A verified failing before edit and passing after).
- **Invariants:** `ui.md` 26, 26a, 47–48; mascot/Live2D contract (`smoke39`, `smoke24`, `smoke29`).
- **Verification (run before committing):**
  - `smoke199` (2/2), `smoke24` (21/21), `smoke29` (12/12), `smoke39` (22/22), `smoke55` (14/14), `smoke119` (2/2) — all pass.
  - Live Chrome (Graphite & Dawn):
    - `1470×832`: `topGap: 81 px`, `botGap: 62 px`, `clippedByHead: false`, `overlapsStatus: false`.
    - `1200×832`: `topGap: 72 px`, `botGap: 53 px`, `clippedByHead: false`, `overlapsStatus: false`.
    - `1081×760`: `topGap: 36 px`, `botGap: 17 px` clear of `.k-asst-status`, peak animation transform (`translate: 0 -4.5%; scale: 1.035`) `peakTop: 132` vs `head.b: 131` (`clippedByHead: false`, `overlapsStatus: false`), `head`/`flower`/`tablet` hit zones aligned inside frame (`y: 167..607`).
    - `820×1180`: zero horizontal overflow (`sw: 820, iw: 820`).

### U2 · Home hero: lighten the blue overlay

- **R1 reproduction:** Inspected `.k-home-hero > .k-art` on `#/home` (`1470×832`, Graphite & Dawn): `--art-op-hero` (`0.62` Graphite / `0.34` Dawn) over `--home-hero-bg` (`--hero-tint` blue) stacked with `--home-hero-scrim` (`0.80 / 0.55` Graphite; `0.85 / 0.60` Dawn), heavily obscuring the left half of the Home hero artwork.
- **Commit:** `bd16bde0` — `feat(custom): U2 — lighten Home hero blue overlay so artwork breathes cleanly`
- **Files and lines:**
  - `css/tokens.css`: `:1361` (lightened Graphite `--home-hero-scrim` stops to `0.48 / 0.28 / 0.06 / 0 / 0.26 / 0.42`), `:1422` (added `--home-art-op: 0.84`).
  - `css/themes.css`: `:67` (added Dawn `--home-art-op: 0.62`), `:149` (lightened Dawn `--home-hero-scrim` stops to `0.56 / 0.34 / 0.08 / 0 / 0.28 / 0.44`).
  - `css/views/home.css`: `:18` (`.k-home-hero > .k-art` binds `--art-op: var(--home-art-op)`).
  - `tools/smoke199.test.js`: `:61–81` (Step B verified failing before edit and passing after).
- **Invariants:** `ui.md` 26, 26a, 26b, 53. Critical HP (`--home-crit-scrim`) and other heroes untouched.
- **Verification (run before committing):**
  - `smoke199` (3/3), `smoke55` (14/14), `smoke119` (2/2) — all pass.
  - Live Chrome (Graphite & Dawn at `1470×832`, `820×1180`, `375×812`): artwork clearly visible across desktop and mobile while all hero text (date kicker, greeting, streak, quote, level/XP/HP, Daily Goal / Today's Three) remains comfortably legible; zero horizontal overflow.

### U3 · Home Routines (4 habits + smart rotation) & Reminders alignment

- **R1 reproduction:** Seeded 1 routine due now (`Midday Reset`), 6 daily habits, and 5 open reminders on `#/home` (`1470×832`): `homeRoutines` rendered only 2 habits (`dueNow ? 2 : 4`, plus `nH % 2` hiding a 3rd habit) with no rotation on tick, and Reminders showed only 2 rows (`remOpen.slice(0, 2)`).
- **Commit:** `af6f8bea` — `feat(custom): U3 — show 4 Home habits with smart rotation and align Reminders to 3 rows`
- **Files and lines:**
  - `js/modules/home.js`: `:450–459` (partition scheduled habits preserving order into `openH` and `doneH` (`done`/`min`/`rest`), render `openH.concat(doneH).slice(0, 4)` so 4 habits / 2 rows stay visible even with `dueNow` active, completed habits rotate out to surface undone ones, and completed habits backfill when fewer than 4 undone remain), `:660, :666` (expanded Home Reminders digest from `2` to `3` rows).
  - `tools/smoke199.test.js`: `:83–132` (Step C verified failing before edit and passing after — tests 4 visible habits with `dueNow`, rotation on tick, partial backfill, all-done backfill, 3 reminders + `3 of 5` meta, and render purity using `data-ui` + ARIA only).
- **Invariants:** `productivity.md` 142, 143, 147–149; `ui.md` 26, 53, 54, 67–69.
- **Verification (run before committing):**
  - `node --check js/modules/home.js`, `node tools/gen_lazy_index.mjs --check` (`402 KB`) — pass.
  - `smoke199` (4/4), `smoke30` (22/22), `smoke55` (14/14), `smoke104` (12/12), `smoke130` (21/21), `smoke142` (12/12), `smoke164` (9/9) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): at `1470×832`, Routines (`167 px` natural height: 2 rows of habits + bottom review line) and Reminders (`173 px` natural height: 3 rows) align evenly side-by-side (`173 px` rendered card height for both); ticking `"Drink water"` rotated it out and surfaced `"Tidy desk"` into slot 4; zero horizontal overflow.

### Round 1 · Boot bytes

- **End of Round 1 (`af6f8bea`):** `5,356,204` B (`5.1081 MB`) against the `5,400,166` B (`5.15 MB`) budget — **`43,962` B (`42.93 KB`) free**.

### Round 1 · Full gate summary

```text
run_smoke: 180 suite run(s), 3 worker(s), 300 s timeout (smoke56, smoke75 900 s), failures re-run alone at the end
...
  ok   smoke197      3.3 s
  ok   smoke199      1.8 s
  ok   smoke196      6.3 s

slowest: smoke75 342 s, smoke56 320 s, smoke142 66 s, smoke139 58 s, smoke135 42 s

run_smoke: 180 / 180 passed in 558.0 s wall (1670 s summed)
```

### Round 1 · Noticed, not touched

- `css/themes.css:112` and `:115` both set `--hero-tint: oklch(0.95 0.02 235);` (pre-existing duplicate line); left untouched per R3.

---

## Round 2 · Full Customisation for Pacing (U4 + 2-step Shift preview)

### U4 · Full Pacing customisation for In class & My plan + 2-step Shift visual preview

- **R1 inspection:** `js/core/pacing.js` (`shiftPlan` / `shiftCount`) previously filtered strictly to `source === "personal"`, `!e.done`, and `!e.tag`, leaving `In class` rows impossible to bulk-shift or re-sequence individually. `js/modules/pacing.js` had no per-register `+` button, no row-level move/reorder/hide menu, no single-lesson/personal weekday override, and `shiftDialog` used a bare `<select>` with text-only preview.
- **Commit:** `25a1b650` — `feat(custom): U4 — full Pacing customisation for In class and My plan with 2-step Shift preview`
- **Files and lines:**
  - `js/core/pacing.js`: `:103–128` (backwards-compatible `hidden`, `order`, `day` fields in `normalise`), `:561–578` (`lessonPlan` honours single-lesson `e.day` override), `:608–795` (pure `shiftPreview(n, o)` supporting `source: "personal" | "school" | "both"`, `includeDone`, `includeExam`, stepping breaks per register, simulating virtual `+New` weeks, and building 2–4 week `windowWeeks`; `shiftCount`, `shiftPlan`, and `undoShift` with `weekPatches` + empty added-week cleanup), `:800–875` (`setHidden`, `moveEntryWeek`, `reorderEntry`, `setEntryDay`), `:424–435` (`entriesFor` excludes hidden by default and stably sorts by `order`; `!e.hidden` guards in `alignment`, `carriedInto`, `classMilestones`).
  - `js/modules/pacing.js` (lazy `page-pacing`): `:46` (hoisted `ISO_DOW`), `:110` (`dialogShell` danger array support), `:151–335` (`entryDialog` Weekday selector + `Hide row`/`Restore row` with Undo toast), `:391–705` (2-step `shiftDialog`: Step 1 Configure with zero-waste segmented rows, `Register`, `Subject` with `Computer Science`, `Shift by` `Earlier | Later` + `1w–4w` + `More ▾` menu, `Scope`, `Include ticked rows`, `Include exam-planner rows`, and `Preview →`; Step 2 Preview rendering real Pacing subject cards with `--pace-hue`, `In class` / `My plan` registers, circular ticks, arriving/leaving/anchored rows, break jumps, `+New` weeks, `← Back`, and `Confirm shift (N rows)` with Undo toast), `:1164–1365` (per-register `+` buttons on `In class` & `My plan`, `⋯` row action menu via `KOS.ui.menu` for move prev/next week, reorder up/down, hide with Undo, edit; single-lesson `In class` day `<select>` & `My plan` day chip; week-banner `Hidden (N)` toggle + 1-click `Restore`).
  - `css/tokens.css`: `:778–780` (`--pace-shift-w: 740px`, `--pace-preview-w: 1080px`, `--pace-shift-dur: 1.9s`).
  - `css/views/productivity.css`: `:640–668` (register head `+`, row `⋯` menu, hidden row muted style, day chip), `:719–780` (2-step Shift dialog + real Pacing card preview styles, `@keyframes paceRowArrive`, `@media (prefers-reduced-motion: reduce)`), `:847–990` (responsive collapse inside existing `860px`, `700px`, `pointer: coarse`, `hover: none` blocks).
  - `tools/smoke199.test.js`: `:130–228` (Step D verified failing before fix and passing after — covers `shiftPreview`, `shiftPlan`/`undoShift` across `In class` & `Both`, `reorderEntry`, `setEntryDay`/`lessonPlan`, `moveEntryWeek`, `setHidden`, 2-step Shift DOM flow, per-register `+`, row `⋯` menus, and zero Governor/session traffic).
- **Invariants:** `pacing` invariants 81–84 (derived `wk`, zero Governor/session writes, no study progress writes, canonical `KOS.pacing` writes); `sync.md` 31–33a (`pacing.entries` keyed by `id` in `cloudmerge.js:88`); `ui.md` 26, 26a, 47–49, 69 (`smoke55` + `smoke56`). `smoke196.test.js` step N passed completely untouched.
- **Verification (run before committing):**
  - `node --check js/core/pacing.js`, `node --check js/modules/pacing.js`, `node tools/gen_lazy_index.mjs --check` (`402 KB`) — pass.
  - Targeted suites: `smoke199` (5/5), `smoke49`, `smoke55` (14/14), `smoke56`, `smoke103`, `smoke104`, `smoke135`, `smoke142` (12/12), `smoke185` (13/13), `smoke191` (14/14), `smoke196` (26/26) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`, Graphite & Dawn, plus `prefers-reduced-motion: reduce`): verified 6 per-register `+` buttons, 12 row `⋯` menus, `Hidden (1)` toggle, Step 1 (`740 px` desktop, zero dead space, `Computer Science`, Scope beside Shift by), Step 2 (`1080 px` desktop, 4-week real Pacing subject cards, `paceRowArrive` animation active normally and `"none"` under `prefers-reduced-motion: reduce`).

### Round 2 · Boot bytes

- **End of Round 2 (`25a1b650`):** `5,364,420` B (`5.1159 MB`) against the `5,400,166` B (`5.15 MB`) budget — **`35,746` B (`34.91 KB`) free**.

### Round 2 · Full gate summary

```text
run_smoke: 180 suite run(s), 3 worker(s), 300 s timeout (smoke56, smoke75 900 s), failures re-run alone at the end
...
  ok   smoke197      3.5 s
  ok   smoke199      2.1 s
  ok   smoke196      6.4 s

slowest: smoke75 134 s, smoke56 105 s, smoke142 41 s, smoke44 22 s, smoke45 18 s

run_smoke: 180 / 180 passed in 293.0 s wall (875 s summed)
```

---

## Round 3 · Per-Day Flexible Schedules for Routines & Daily Reviews (U5, U6)

### U5 · Routines: full per-day schedule customisation

- **R1 inspection:** `js/core/routines.js:341–351` (`scheduleOn`) only supported one `window` plus one `weekend` override. All downstream readers (`windowOn`, `pastWindow`, `setRest`, `today`, `notice`, `reviewNear`, `forecast`, `KOS.today`, `KOS.dayReview`, Home, History) already resolved through `windowOn(r, day)`, while `js/modules/rtkit.js:151, :175–182, :212` and `js/modules/routines.js:750–758` still read raw `r.window`.
- **Commit:** `e3bc8cac` — `feat(custom): U5 — per-day flexible schedule windows for Routines`
- **Files and lines:**
  - `js/core/routines.js`: `:134–144` (`normaliseWindow` rejects zero-length windows, added `normaliseDayWindows` for keyed `"0".."6"` map), `:225–226` (`normalise` preserves non-empty `dayWindows`), `:358–366` (`scheduleOn` resolves `dayWindows[dow]` → `weekend.window` → `window`).
  - `js/modules/rtkit.js`: `:151` (`checklist` passes `day` to `schedText`), `:175–192` (`schedText` shows resolved day window when `day` is given or `varies by day` summary), `:225–226` (`habitTicks` reads `R().windowOn(h, day)`).
  - `js/modules/routines.js` (lazy `page-routines`): `:746–804` (`paintTotal` computes tightest active day in `Per day` mode, warns in crimson when over, and updates live per-day `+Nm / −Nm` readouts), `:888–1065` (`Simple | Per day` mode switch, guarded `"Copy Mon → weekdays"` disabled when Monday is off or blank, `From`/`Until` column headers, 7-row Mon–Sun schedule editor with interactive off-day toggles).
  - `css/views/routines.css`: `:237–266` (tokenized `.k-rt-sched-*`, `.k-rt-pday*`, high-contrast off-day rows, crimson over-window bar), `:450–465` & `:512–525` (responsive wrapping at `1240px`, `1080px`, `700px` so time inputs never clip in the real Routine Editor right-hand sidebar).
  - `tools/smoke199.test.js`: `:231–312` (Step E verified failing before fix and passing after — covers `dayWindows`, legacy weekday/weekend fallback, `pastWindow`, `today()`, `forecast()`, editor `Per day` UI, tightest-day warning, `Copy Mon` + disabled guard, and save persistence).
- **Verification (run before committing):**
  - `node --check`, `node tools/gen_lazy_index.mjs --check`, `smoke199` (6/6), `smoke55` (14/14), `smoke101`, `smoke102`, `smoke103`, `smoke104`, `smoke107`, `smoke160`–`164`, `smoke196` — all pass.
  - Live Chrome inside the real Routine Editor sidebar (`1470×832` `cardW: 432 px / minInputW: 147 px`, `1120×832` `minInputW: 104 px`, `820×1180`, `375×812`, Graphite & Dawn): zero clipping, zero horizontal overflow, clear off-day pills, `From`/`Until` headers aligned.

### U6 · Daily Reviews: full per-day schedule customisation

- **R1 inspection:** `js/core/dayreview.js:144–149` (`slotTime`) returned only `s.weekend` or `s.weekday`, while every consumer (`slots`, `due`, `recent`, `ahead`, `forecast`, `KOS.today`, Home's `"Afternoon review · at HH:MM"`, `routines.js`, `dayreview.js`) already reads `slotTime(slot, day)`.
- **Commit:** `be732c13` — `feat(custom): U6 — per-day flexible schedule times for Daily Reviews`
- **Files and lines:**
  - `js/core/dayreview.js`: `:94–108` (`normalise` validates optional per-slot `days` `"0".."6"` map), `:133–168` (`setConfig` merges per-slot patches cleanly; `slotTime` resolves school holidays to weekend time, otherwise `s.days[dow]` → weekend/weekday fallback).
  - `js/modules/routines.js` (`settings` tab): `:671–773` (`Simple | Per day` mode switch on `"The three reviews"`, top 3 slot switches with uniform kanji square badges `朝` / `昼` / `夜`, `"Copy Mon → weekdays"` helper, left-aligned `Morning / Afternoon / Evening` headers, 7-row `Mon`–`Sun` time grid).
  - `css/views/routines.css`: `:266–280` & `:528–534` (uniform `.k-rt-rv-tog` square badges, left-aligned headers/inputs, mobile collapse at `700px`).
  - `tools/smoke199.test.js`: `:314–364` (Step F verified failing before fix and passing after — covers `slotTime`, `due()` gating on later college days, school holiday weekend fallback, Settings `Per day` grid, `Copy Mon → weekdays`, and clean revert to `Simple`).
- **Verification (run before committing):**
  - `node --check`, `node tools/gen_lazy_index.mjs --check`, `smoke199` (7/7), `smoke55` (14/14), `smoke101`–`104`, `smoke107` — all pass.
  - Live Chrome (`1470×832` `minW: 158 px`, `820×1180`, `375×812`, Graphite & Dawn): uniform rounded square badges on `朝` / `昼` / `夜`, left-aligned headers and inputs, zero overflow.

### Round 3 · Boot bytes

- **End of Round 3 (`be732c13`):** `5,366,226` B (`5.1176 MB`) against the `5,400,166` B (`5.15 MB`) budget — **`33,940` B (`33.14 KB`) free**.

### Round 3 · Full gate summary

```text
run_smoke: 180 suite run(s), 3 worker(s), 300 s timeout (smoke56, smoke75 900 s), failures re-run alone at the end
...
  ok   smoke197      5.0 s
  ok   smoke199      3.1 s
  ok   smoke196      8.2 s

slowest: smoke75 148 s, smoke56 113 s, smoke142 55 s, smoke44 25 s, smoke45 18 s

run_smoke: 180 / 180 passed in 361.9 s wall (1083 s summed)
```

---

## Round 4 · Universal Error Log & Low-Friction Capture (U7–U8)

### U7 · Universal Error Log core store, 3-way sync & lazy Hub

- **Commits:**
  - `5cbda7e2` — `feat(custom): U7 — Universal Error Log store, sync and lazy hub`
  - `7734300b` — `fix(custom): U7 — register Error Log in global search pages and Assistant navigation`
- **Files:** `js/core/errorlog.js` (new), `js/modules/errorlog.js` (new lazy `page-errorlog`), `index.html`, `js/core/lazy.js`, `js/core/router.js`, `js/core/ui.js`, `js/modules/hub.js`, `js/core/cloudmerge.js`, `js/core/searchmore.js`, `js/core/aitools.js`, `css/tokens.css`, `css/views/study.css`, `tools/ui-migration.json`, `tools/smoke199.test.js` (Step G).
- **What changed:**
  - Added canonical `KOS.errorLog` store (`state.errorLog = { v: 1, items: [], settings: { autoLogQuiz: false } }`) covering all 8 exam & non-exam study spaces (`compsci`, `maths`, `it`, `code`, `ja`, `mind`, `creatives`, `general`), 7 mistake types (`concept`, `misread`, `careless`, `method`, `recall`, `time`, `edge`), and 7 capture sources (`quiz`, `exam-q`, `code`, `ja`, `ink`, `paper`, `manual`).
  - Wired `errorLog.items` (keyed by `id`) into `KOS.cloudmerge` (`RECORDS`) for multi-device 3-way sync.
  - Wired deduped 1-click **Turn into flashcard** (`KOS.errorLog.toFlashcard(id)`): routes exam subjects with a `topicRef` straight into `(subject, topicRef)` via `KOS.srs.addCustom`, and non-exam spaces safely into `KOS.srs.PERSONAL_SID` (`"personal"`), refusing duplicates on re-click.
  - Built lazy `page-errorlog` view (`#/errorlog`, `#/errorlog/drill`, `#/errorlog/<subject>`, `#/errorlog/<subject>/<topicRef>`) with Study sub-nav entry + live open-count badge (`pc-errorlog`), global search (`PAGES`), and Kurenai Assistant navigation (`NAV_VIEWS`):
    - **Honest Pattern Insights** (`>= 2` items): mistake-type bars scaled proportionally to their actual share of total logged entries over a full-width track (never stretched to 100% on ties), plus Top error-prone topics clickable to filter.
    - **Compact, scannable cards:** mistake-type pills placed directly on the top metadata row alongside Subject, Source, and Status; side-by-side `What went wrong` / `Rule for next time` grid; Delete kept inside the Edit dialog (with Undo toast) so card footers stay uncluttered.
    - **Single empty-state CTA:** when empty, the header `+ Log mistake` button is hidden so `+ Log your first mistake` in the empty card is the sole primary CTA.
    - **Cohesive filters & capture:** bordered `All subjects` / `All mistake types` / `All sources` selects matching search input, `Auto-log quiz misses` switch (`state.errorLog.settings.autoLogQuiz`), compact context pill when pre-filled vs Subject + optional Topic selector when opened manually.
    - **Quick Error Drill (`#/errorlog/drill`):** active-recall card flow with `← Back to Error Log` exit link and `Space` (reveal) / `1` (still shaky) / `2` (mark resolved) keyboard shortcuts.
  - Zero Governor writes and zero sessions logged.
- **Verification:**
  - `node --check`, `node tools/gen_lazy_index.mjs --check`, `smoke199` (Step G), `smoke55`, `smoke56`, `smoke142`, `smoke45`, `smoke74`, `smoke76`, `smoke190` — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`, Graphite & Atelier Dawn): verified empty state (sole CTA), populated hub (honest share-% bars, top-row mistake chips, side-by-side notes, bordered selects), manual Log mistake modal, Quick Error Drill, and zero overflow or page errors.

### U8 · Low-friction 1-tap Error Log capture across study surfaces & Topic surfacing

- **Commit:** `157ac693` — `feat(custom): U8 — low-friction 1-tap Error Log capture across study surfaces and topic surfacing`
- **Files:** `js/core/errorlog.js`, `css/views/study.css`, `js/engines/quiz.js`, `js/modules/code.js`, `js/modules/jarun.js`, `js/modules/inktab.js`, `js/modules/examreview.js`, `js/modules/examprac.js`, `js/modules/topic.js`, `tools/smoke199.test.js` (Step H).
- **What changed:**
  - Added shared `KOS.errorLog.inlinePill(seedOrFn, opts)` helper supporting 1-tap instant capture (`+ Log mistake` → `✓ Logged · Tag reason` + `Undo`, retaining keyboard focus on state flip, deduped via `dedupeKey`, and refreshing Study sub-nav counters) plus `auto: true` mode for `Auto-log quiz misses`.
  - Wired low-friction capture across all 6 practical study surfaces (all in lazy bundles, zero boot cost):
    - **Quizzes (`js/engines/quiz.js` `marked`):** wrong MCQ answers show 1-tap `+ Log mistake` (or auto-log quietly into `✓ Logged · Tag reason · Undo` when `Auto-log quiz misses` is enabled).
    - **Exam Questions (`js/engines/quiz.js` `mountExam`):** mark-scheme self-mark footer renders `+ Log mistake` capturing dynamic `awarded / total` marks and `source: "exam-q"`.
    - **Code (`js/modules/code.js` `check`):** failed checks (compile error, timeout/exception, rule fail, or failing test cases) render 1-tap `+ Log mistake` in `rewardSlot`.
    - **Japanese (`js/modules/jarun.js` `end`):** each item in `ul[data-ui="ja.misses"]` gets a compact 1-tap `+ Log` pill tied to item id, word, reading/gloss, and missed skill.
    - **Ink tab (`js/modules/inktab.js` `paintMode`):** compact `+ Log error` button beside `Drills` opening pre-filled capture (`source: "ink"`) for the active topic.
    - **Exams & Papers (`js/modules/examreview.js` & `js/modules/examprac.js`):** `+ Log error` on the Marks lost card and 1-tap `+ Log error` on each costly-question card linked to paper, question number, lost marks, and spec node.
  - **Topic-level surfacing (`js/modules/topic.js`):** when a topic has `>= 1` open error, shows a quiet amber pill (`data-ui="topic.open-errors"`, `● N open error(s) on this topic · Review →`) deep-linking straight to `#/errorlog/<subject>/<topicRef>`; completely hidden when 0.
- **Verification:**
  - `node --check`, `node tools/gen_lazy_index.mjs --check`, `smoke199` (all 9 steps A–H), `smoke55`, `smoke56`, `smoke142`, `smoke107`, `smoke135`, `smoke185`, `smoke196` — all pass.
  - Live Chrome (`1470×832` and `375×812`): verified Topic surfacing pill, Quiz wrong answer `+ Log mistake` → 1-tap `✓ Logged · Tag reason` + `Undo`, zero overflow, zero page errors.

### Round 4 · Boot bytes (final branch total)

- **End of Round 4 (`7734300b`):** `5,384,580` B (`5.1351 MB`) against the `5,400,166` B (`5.15 MB`) budget — **`15,586` B (`15.22 KB`) free**.

### Round 4 · Final full gate summary

```text
run_smoke: 180 suite run(s), 3 worker(s), 300 s timeout (smoke56, smoke75 900 s), failures re-run alone at the end
...
  ok   smoke190      7.5 s
  ok   smoke193      3.3 s
  ok   smoke194      2.5 s
  ok   smoke195      3.5 s
  ok   smoke197      3.6 s
  ok   smoke199      2.5 s
  ok   smoke196      6.7 s

slowest: smoke75 147 s, smoke56 113 s, smoke142 49 s, smoke44 24 s, smoke45 19 s

run_smoke: 180 / 180 passed in 342.4 s wall (1024 s summed)
```
