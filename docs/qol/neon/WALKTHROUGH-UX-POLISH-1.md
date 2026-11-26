# User-Authorised UX Polish & Standardisation Branch

- **Branch:** `neon/ux-polish-1` (cut cleanly from `origin/main`, independent of `neon/qol-batch-6`, `neon/user-custom-1`, and `neon/study-cleanup-1`)
- **Authorisation:** Explicit user authorisation (`(user-authorised)` on every commit)
- **Agent:** Gemini 4 Neon (Antigravity), solo execution
- **Rules followed:** `AGENTS.md`, `CLAUDE.md`, `docs/qol/neon/REVIEW.md` (R1–R3), `docs/invariants/{ui,spaces,ink-files,sync,study}.md`
- **Boot-byte impact over `origin/main`:**
  - `origin/main` baseline (non-lazy `<script>` + `<link rel="stylesheet">` in `index.html`): `5,355,991 B` JS + `1,396,232 B` CSS = `6,752,223 B`
  - `neon/ux-polish-1` after T1–T4: `5,358,055 B` JS (`+2,064 B`) + `1,395,611 B` CSS (`-621 B`) = `6,753,666 B` (**`+1,443 B` / `+1.41 KB` net**, within the `<= +1–2 KB` budget).

---

## T1 · Home's Hero → Rotate → By Condition Modal Layout

- **Invariants verified:** `26`, `26a`, `47`, `48`, `49`, `69`
- **R1 (reproduction on `origin/main`):**
  - Opened Home → `KOS.artSlot.open("home")` → `Rotate` → `By condition` in headless Chrome (`1470×832`, `820×1180`, `375×812`, Graphite & Atelier Dawn).
  - Measured `.k-art-cond > div` width = **`0 px`** (`labelH: 151–225 px`, text crushed one word per line and overflowing behind the `<select>`) and `<select>` width = **`492 px`** (at `1470×832` / `820×1180`) and **`323 px`** (at `375×812`).
  - Root cause: `js/modules/artslot.js:68` rendered `<select class="k-input k-input--sm">` where `.k-input--sm` was undefined and `.k-input` sets `inline-size: 100%` (`css/components.css:497`), while `.k-art-cond > div` had `flex: 1 1 0; min-inline-size: 0` (`css/components.css:804`).
- **Fix:**
  - `css/components.css:801–805`: gave `.k-art-cond` `flex-wrap: wrap; gap: var(--sp-8) var(--sp-12)`, `.k-art-cond > div` `flex: 1 1 var(--chart-fit-min)`, and `.k-art-cond > select` `flex: 0 1 auto; inline-size: auto; min-inline-size: var(--empty-art-sm); max-inline-size: 100%` (existing tokens only, no new breakpoints).
  - `js/modules/artslot.js:68`: removed the undefined `k-input--sm` class.
- **R2 (tests & live Chrome verification BEFORE commit):**
  - `node --check js/modules/artslot.js` — passed.
  - `node tools/gen_lazy_index.mjs --check` — `lazy-index.js is current (402 KB)`.
  - `node tools/smoke55.test.js` — 14/14 PASS.
  - `node tools/smoke56.test.js` — 53 surfaces, 1631 controls replayed, 42 rebuilt views ALL PASS.
  - `node tools/smoke119.test.js` — 2/2 PASS (35 known collisions, 0 new).
  - Live Chrome (`1470×832`, `820×1180`, `375×812`, Graphite `atelier-dusk` & Atelier Dawn `atelier-dawn`):
    - `1470×832` & `820×1180`: `labelW: 372 px`, `labelH: 40 px`, `selW: 120 px`, `overlap: false`.
    - `375×812`: `labelW: 203 px`, `labelH: 40 px`, `selW: 120 px`, `overlap: false`.
    - Sibling tabs (`One picture`, `Rotate → By time`, `Shuffle`, `Your own`): 0 overflowing elements.
- **Commit:** `15a05409` — `fix(qol): T1 — fix Home hero Rotate By condition row layout (user-authorised)`

---

## T2 · iPad Scroll-to-Top Jolt Bug (Handwriting / Ink Tab & Scrolled Pages on Sync)

- **Invariants verified:** `65`, `132`, `164`, `165`, `166`
- **R1 (reproduction on `origin/main`):**
  - Opened `compsci:4.2.3.1` → Handwritten (Ink) tab with 3 inked pages at `820×1180`, scrolled `#stage` to `1400 px`, and fired a background sync (`KOS.rerender({ background: "hard", changed: ["db:ink", "progress"], source: "device" })`) + `KOS.changes.safePoint("idle")`.
  - Result on `origin/main`: `idleApplied: true`, `inkSurvived: false` (active Ink tab destroyed & rebuilt), `#stage.scrollTop` immediately dropped from **`1400`** → **`276`** (and stayed stuck at `276` after 100 ms because `I.listPages` loads asynchronously while `KOS.show` emptied `#main` and zeroed `main.scrollTop`).
- **Fix:**
  - `js/modules/inktab.js:114–117`: registered `KOS.view.hold(function () { return !destroyed && root.isConnected; })` so active Handwriting tabs block automatic `safePoint("idle")` teardowns while manual Refresh (`KOS.changes.apply()`) remains functional and switching away from the tab releases the hold cleanly.
  - `js/core/ui.js:1636`: guarded `if (!KOS.ui.redrawing) main.scrollTop = 0;` so in-place redraws do not zero `#main.scrollTop`.
  - `js/core/redraw.js`:
    - Added temporary `#main` `minBlockSize` floor across `KOS.ui.redrawNow()` whenever any scroller is scrolled, preventing WebKit from clamping `#stage.scrollTop` to `0` during sync/async content rebuilds; cleared on route navigation (`_enter` when `!same`), `KOS.view.onDispose`, and a `600 ms` settle timeout (which also calls `again()`).
    - Observed `m0.firstElementChild` in `ResizeObserver` alongside `m0` so async inner growth (e.g. Ink sheets from IndexedDB) triggers restore.
    - Tracked non-programmatic `scroll` events in `lastTouch` (gated by `Date.now() - lastRestoreAt > 120` so programmatic scroll restoration never poisons `lastTouch`).
- **R2 (tests & live Chrome verification BEFORE commit):**
  - `node --check js/modules/inktab.js js/core/ui.js js/core/redraw.js` — passed.
  - Live Chrome (`820×1180`):
    - Background sync + `safePoint("idle")` on scrolled Ink tab: `beforeTop: 1400`, `idleApplied: false`, `heldAfterIdle: true`, `inkSurvived: true`, `minTopDuringInkSync: 1400`.
    - Manual Refresh on scrolled Ink tab: `manualOk: true`, `minTopDuringManualRefresh: 1400`, `immediateTopAfterManual: 1400`, `settledTopAfterManual: 1400`, `mainMinHAfterSettle: ""` (zero scroll dip during async IDB rebuild, floor cleared cleanly).
    - Route navigation to Subject desk & scrolled redraw: `mainMinHAfterNav: ""`, `subjBefore: 700`, `subjMinTop: 700`, `subjAfter: 700`.
  - `node tools/gen_lazy_index.mjs --check` — current.
  - `node tools/smoke105.test.js` — 10/10 PASS.
  - `node tools/smoke139.test.js` — 15/15 PASS.
  - `node tools/smoke162.test.js` — 8/8 PASS.
- **Commit:** `489f514d` — `fix(qol): T2 — prevent iPad scroll-to-top jolt on sync and Ink tab (user-authorised)`

---

## T3 · Mind Flashcards & Quizzes Standardisation + Form Control CSS Alignment

- **Invariants verified:** `26`, `50`, `111`, `132`, `137`, `140`, `167`, `168`
- **R1 (reproduction on `origin/main`):**
  - Opened Mind Daily 15 Reviews (`#/mind/daily`) and Mind Lesson `F1.1` Cards tab in Chrome (`1470×832`):
    - Daily 15: `hasBespokeFlash: true`, `hasBespokeGrades: true`, `hasFcCard: false`, `hasFcModes: false`, `hasFcPanel: false`, `hasKanjiMark: false`.
    - Lesson Cards tab: `hasStudyDeckTabs: false`, `hasFcCard: false`, `hasFcModes: false`, `hasFcPanel: false`.
- **Fix:**
  - `js/engines/flashcards.js`: added pluggable `opts.srs` backend adapter (`peek`, `memory`, `preview`, `rate`), `opts.cards`, `opts.noCrud`, `opts.noSessionLog`, `opts.requeueAgain`, `opts.onRate`, `opts.deckSub`, and optional `c.tag` / `c.concept` chips in `THIS CARD`.
  - `js/core/lazy.js:384`: added `"ink-ui"` to `mind: ["page-mind", "ink-ui"]` so `Type | Write | Think` (`KOS.inkPad`) is always loaded on cold Mind Daily 15 opens.
  - `js/modules/mind.js`:
    - Added shared `mindSrs()` / `mindCardList()` helpers exported on `KOS.mindPages` (reused by `mindtopic.js`).
    - Refactored Daily 15 Reviews (`reviews()`) to mount `KOS.flashcards.session` with Mind's SRS adapter, preserving `state.mind.cards["<concept>:<i>"]`, `src: "mind"` review logs, and single-entry `M().finishReviews()` (+1 XP/passed card, 15 XP daily cap).
    - Upgraded Checkpoint `cardsStep()` to canonical `.k-fc-card` (`札` flip card + pips + keyboard shortcuts, keeping self-marked non-scheduling contract) and `applyStep()` to canonical `.k-qz-card` / `.k-qz-opt` with `1–4` / `A–D` / `Enter` shortcuts.
  - `js/modules/mindtopic.js`:
    - Upgraded `renderCards()` to canonical `KOS.flashcards.mount` (`Study | Deck (N)` tabs, `Type | Write | Think`, `札` flip card, `THIS CARD / THIS DECK / KEYS`, Shuffle / Restart / Card stats, read-only on render).
    - Upgraded Lesson `check()` to canonical `.k-qz-card` / `.k-qz-opt` with `1–4` / `A–D` / `Enter` shortcuts while keeping loop-until-all-right and MI-06 `apply: false` semantics.
  - `css/views/mind.css`: aligned `.k-mind-text` / `.k-mind-input` / `.k-mind-select` with canonical `.k-input` tokens + `:focus-visible`, removed dead `.k-mind-flash*` / `.k-mind-grade*` / `.k-mind-cardlist` / `.k-mind-cardrow` rules, and ensured `.k-fc` fills `--fc-w` inside `.k-mind-run-b` / `.k-mind-cp`.
- **R2 (tests & live Chrome verification BEFORE commit):**
  - `node --check js/engines/flashcards.js js/core/lazy.js js/modules/mind.js js/modules/mindtopic.js` — passed.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`, Graphite & Atelier Dawn): all 6 viewport × theme combinations verified with `hasFcCard: true`, `hasFcModes: true`, `hasFcPanel: true`, `hasFcRate: true`, `hasKanjiMark: true`, `hasStudyDeckTabs: true`, `hasBespokeFlash: false`, `hasBespokeGrades: false`.
  - `node tools/gen_lazy_index.mjs --check` — current.
  - `smoke55` (14/14 PASS), `smoke105` (10/10 PASS), `smoke109` (17/17 PASS), `smoke110` (6/6 PASS), `smoke111` (3/3 PASS), `smoke119` (2/2 PASS), `smoke142` (12/12 PASS).
- **Commit:** `29ee1108` — `fix(qol): T3 — standardise Mind flashcards, quizzes, and form controls (user-authorised)`

---

## T4 · Exams Card Drill Empty State + `tools/smoke201.test.js`

- **Invariants verified:** `50`, `65`, `111`, `132`, `137`, `164`, `165`, `166`, `168`
- **Fix:**
  - `js/modules/examrevise.js:610`: replaced bare `<p class="k-ex-muted">No cards in this scope yet.</p>` with `KOS.ui.emptyState({ compact: true, mark: "札", ... })`.
  - `tools/smoke201.test.js`: new isolated regression suite (A: Hero Rotate → By condition contract; B: active Ink tab held on background sync + scroll preserved + `minBlockSize` floor cleared on navigation/dispose; C: Mind Daily 15, Lesson Cards tab `Study | Deck`, Lesson Check canonical UI + Mind SRS/pay invariants; D: Exams Card drill empty state).
  - `docs/SMOKE.md`: documented `smoke201` without touching `smoke198–200`.
- **R2 (tests BEFORE commit):**
  - `node --check js/modules/examrevise.js tools/smoke201.test.js` — passed.
  - `node tools/gen_lazy_index.mjs --check` — `lazy-index.js is current (402 KB)`.
  - `node tools/smoke55.test.js` — 14/14 PASS.
  - `node tools/smoke142.test.js` — 12/12 PASS.
  - `node tools/smoke185.test.js` — 13/13 PASS.
  - `node tools/smoke201.test.js` — 4/4 PASS.
- **Commit:** `e3a2d279` — `fix(qol): T4 — Exams card drill empty state and smoke201 regression suite (user-authorised)`

---

## Full Release Gate

- **Command:** `SMOKE_JOBS=3 npm test`
- **Result:** **`180 / 180 passed`** in `164.4 s` wall (`488 s` summed), zero retries, zero failures (including `smoke201` in `0.9 s`).
- **Lazy index check:** `node tools/gen_lazy_index.mjs --check` → `lazy-index.js is current (402 KB)`.
- **Untouched merge-sensitive files confirmed:** `js/modules/home.js`, `js/modules/routines.js`, `js/modules/pacing.js`, `js/modules/code.js`, `js/data/content/*`, and `tools/smoke198–200.test.js` were not touched.

---

## Noticed, Not Touched (R3)
- `js/modules/examguide.js:112–154` (Rapid/Recognition drill modal): deliberately distinct non-SRS self-marked drill mixing flashcards, mark schemes, and recognition shapes; deferred as agreed in `/plan`.
- `js/core/ink.js:455` (`flushWaiting(); notify(null);`): triggers a benign duplicate initial `paint()` on first Ink open when `kurenai-os-ink` first loads; outside T2 scope.
