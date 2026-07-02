# Content Progress

## Completed (deep content exists — DO NOT rewrite)
(All deep content for CS is 100% complete. Every single sub-topic (176 entries) has undergone a "True Exhaustive" audit, meaning zero aliases remain. Each point has unique notes, boxed terminology, interactive diagrams, and robust code coverage.)
maths: 1.1
maths: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11
maths: 3.1, 3.2, 3.3, 3.4
maths: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
maths: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9
maths: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
maths: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
maths: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
maths: 9.1, 9.2, 9.3, 9.4, 9.5
maths: 10.1, 10.2, 10.3, 10.4, 10.5
maths: S1.1, S2.x, S3.x, S4.x, S5.x, S6.x, S7.x, S8.x, S9.x

## Content status (Claude Code now owns the whole project)
The previous split with Gemini has ended — all of `js/data/content/` is maintained
here. See `AGENTS.md` for the current ownership rules.
- **Computer Science**: deep content complete across all sub-topics (notes, boxed
  terminology, code, quizzes, exam Qs).
- **Mathematics**: Pure (P1–P10) and Applied (S1–S9) topics implemented with boxed
  content. Quiz/exam coverage is still thin in maths — next content push (uses PMT
  papers in `Context/` as source) targets ≥3 quiz + ≥1 exam per topic.
- **IT**: F201 (Big Data & ML) complete and visually audited. F200 is spec-only by
  design. No further IT units planned.


## Build 2.0 — "Higanbana" UI/UX overhaul (Claude Code, 2026-06-13)
Full visual rewrite of `css/main.css` to a premium near-black dark theme, plus
supporting wiring. No engine/data-model behaviour changed — every class name and
DOM structure the views/engines/tests rely on was preserved.
- **Design tokens**: complete `:root` system (surfaces, hairlines, brand, status,
  subject hues, type, spacing scale, radii, elevation, motion curves).
- **Fonts** (Google Fonts): Inter (UI/body), Space Grotesk (display chrome),
  JetBrains Mono (refs/code), Shippori Mincho (紅 mark + verbatim spec wording).
- **Ambient flora**: lycoris-radiata (spider-lily) petals drift behind the OS via
  the `.bg-flora` layer in `index.html` + CSS keyframes; corner crimson/violet
  glow washes. Fully disabled under `prefers-reduced-motion`.
- Glassmorphism on topbar/rail/tree/toast/modal (backdrop-blur), accent glow rails,
  3D flashcard flip, animated obi progress, staggered callout entrances, view
  transitions, restyled buttons/tabs/cards/sims, full responsive pass (no h-scroll).
- **New**: copy-to-clipboard button + language tag on every `{code}` block
  (delegated handler in `js/core/content.js`); the topic status/checklist row is
  now a sticky frosted control.
- KaTeX `<script>`s now use `defer` (faster paint; also stops smoke2's naive
  `<script src>` regex from trying to read the CDN URLs as local files).

## Build 2.1 — "Liquid Glass" polish pass (Claude Code, 2026-06-13)
Aesthetic + defect pass on top of 2.0. No engine/data behaviour changed; all class
names and DOM the views/engines/tests rely on preserved. Both smoke suites pass.
- **Subject-card progress bar**: replaced the per-section sparkline row (which painted
  every section red at 0%) with one slim liquid-glass `.subj-track`/`.subj-fill` bar
  driven by `st.pct` (overall subject completion). No red anywhere. (`js/modules/hub.js`)
- **Copy on every content box**: the `.n-copy` affordance now appears on callouts,
  tables, definition lists and step walkthroughs, not just `{code}`. The delegated
  handler clones the box, drops the button, and copies its visible text.
  (`js/core/content.js`)
- **Liquid Glass design system** (balanced): new `:root` tokens `--glass-fill`,
  `--glass-edge`, `--glass-hi`, `--glass-sheen`, `--glass-blur`, `--focus-glass`,
  applied to topbar/rail/tree, buttons, search, cards (subject/stat/sec/practice/
  colcard), modal, toast, flashcard faces, quiz/lab/sim panels and the home stats bar.
  Dense reading surfaces (notes, code, table cells) keep solid dark backgrounds.
- **Search fix**: `#search-results` is now near-opaque (`rgba(13,10,18,.97)` + heavier
  blur) so page content no longer bleeds through; the crimson `#search:focus` ring was
  replaced with a soft neutral glass glow (no longer reads as an error).
- **Branding**: header sub → "Unified HQ · Build 2.1"; `<title>` → "紅 Kurenai OS —
  Unified HQ"; rail footer drops the exam-board codes for a styled `紅 Unified HQ`
  brand line above the (preserved) `#node-count` spec-points count.
- **Docs**: `README.md` rewritten from the stale Build 1.5 state to 2.1 — corrected
  coverage (350 spec leaves: CS 151 / Maths 89 / IT 110; deep content for all CS + all
  Maths + IT F201), the Liquid Glass system, copy-on-all-boxes, and a corrected folder
  map (`js/data/content/`, `js/engines/`, `js/core/content.js`, `js/labs/sims.js`).

## Fixes applied this turn (were breaking load / smoke2)
- **Syntax**: 6 callouts across `cs-theory-computation.js` /
  `cs-theory-computation-2.js` were missing their closing `}` (`body: "…"` then a
  lone `},`). These threw on load — fixed to `… }},`. (See AGENTS.md pitfall note.)
- **Orphan content**: `it:F201.5.3` ("NEA Units") is a non-leaf header with no child
  leaves, so its "Big Data case studies" content was unreachable AND failed smoke2.
  Disabled (commented, verbatim) in `it-f201.js` — **GEMINI: re-home it to a real leaf.**
- **Wiring**: `maths:2.3` now declares `gens:["quad"]` so the matching worked-example
  generator (which already targets ref 2.3) appears on its Notes page.
- **Stale test fixture**: smoke2's "plain ref" check used `it:F201.2.1`, which Gemini
  later enriched; repointed to `it:F200.1.1` (still genuinely plain). Intent unchanged.

Both `tools/smoke.test.js` and `tools/smoke2.test.js` now pass clean.

## Content enrichment push (Claude Code, 2026-06-14)
Systematic deepening of all content files since Build 2.1. Both smoke suites pass (355 spec points, 260 deep entries).

- **cs-nea.js** (new): full deep content for the AQA CS NEA section — wired into `index.html` and `compsci.js`.
- **CS content pass**: deepened `cs-advanced`, `cs-algorithms`, `cs-algorithms-2`, `cs-architecture`, `cs-data-rep`, `cs-data-rep-2`, `cs-databases-sys`, `cs-datastructures`, `cs-networking-ethics`, `cs-programming`, `cs-theory`, `cs-theory-computation`, `cs-theory-computation-2` — added missing callouts, misconception boxes, comparison tables, code blocks, exam questions.
- **Maths content pass**: major additions to `maths-pure.js` (+350 lines) and `maths-applied.js` (+371 lines) completing coverage of all statistics and mechanics sub-topics.
- **IT F201.5.3 re-key**: the orphaned "Big Data Case Studies" block (Amazon anticipatory shipping, Uber surge pricing, Netflix series commissioning, AlphaFold protein prediction) was commented out because `it:F201.5.3` ("NEA Units") has `content:[]` in the generated spec and is therefore invisible to hub.js. Block merged into `it:F201.1.4` ("The purpose, importance and use of big data") where it belongs — added 2 new callouts, 3 flashcards, 1 quiz question. Smoke2 "orphan content key" check now clean.

## Labs wiring + new sims & generators (Claude Code, 2026-06-24)
Made every interactive lab reachable from its topic page, then widened coverage with
new generators and simulations. Both smoke suites pass; all `solve()` generators
fuzz-tested (30+ randomised runs each) and all sims mount without throwing.

- **Wiring — sims**: `KOS.sims.forRef` now auto-matches any sim by its declared
  `subject:ref`, so all 13 sims (9 interactive + 4 trace-lab) surface a **Simulate**
  tab on their spec page, and future sims wire themselves on `register`. The `WIRE`
  map is kept only for extra refs (e.g. `binary-number` on 4.5.4.2 *and* 4.5.4.4).
- **Wiring — generators**: added a parallel `GENWIRE` map + `KOS.worked.forRef`
  (a generator's `ref` field is a display label like "7.2 / 7.3", so matching needs
  an explicit map). `hub.js` merges it into the **Worked** tab, mirroring sims.
- **7 new generators**: `arithseq` (4.4), `geomseq` (4.5), `sinecos` (5.1),
  `vectors` (10.1/10.4), `newraph` (9.3), `binomprob` (S4.1), `hyptest` (S5.2).
- **3 more generators**: `partialfrac` (2.10), `kinematics` (S7.4), `expmodel` (6.7).
  → Worked Example Engine now has 20 generators (was 10).
- **3 new simulations**: `rpn-eval` Reverse Polish evaluator with a live stack
  (4.3.3.1), `binary-search` interval-halving visualiser (4.3.4.2), `binom-dist`
  binomial distribution bar chart (S4.1, pairs with the `binomprob` generator).
  → 16 sims total (was 13). S4.1 now shows both a Worked and a Simulate tab.
- **Docs**: `AGENTS.md` rewritten — Gemini split ended, Claude Code owns the whole
  project; added the "wiring labs to topics" reference. Stale Gemini queues removed
  from this file.

## Inline labs + back navigation + CS sims (Claude Code, 2026-06-24)
Made labs render inline on the topic page, added page history, and widened CS sim
coverage. Both smoke suites pass; all sims verified to mount inline without throwing.

- **Inline simulations**: the four Trace Lab structures (stack/queue/list/tree) used
  to render as a button that *redirected* to the full Trace Lab view. They now mount
  **inline** on the topic's Simulate tab. `trace.js` exposes `KOS.traceLabs.mount(tab,
  panel)`; `sims.js` registers them with `mount` instead of `jump`. Every sim in the
  registry now has a `mount`, so no topic sim is a redirect anymore.
- **Back navigation**: `KOS.show` keeps a history stack; new `KOS.back()` / `KOS.canBack()`.
  Added a glass **‹ Back** button in the topbar (`index.html` + `.nav-back` in
  `main.css`) and Alt+← / Backspace shortcuts (ignored while typing in a field).
  Fixes "can't navigate back to the previous page" on the local file build.
- **3 new CS simulations** (16 → 19 total): `linear-search` (4.3.4.1), `hash-table`
  with h(k)=k mod 11 + linear probing (4.2.6.1), `dijkstra` shortest-path step-through
  on a fixed weighted graph (4.3.6.1, verified A→F = 11 via A→C→B→D→F).
- **Wider sim wiring** (WIRE extra refs): merge sort 4.3.5.2 → sort-viz; tree traversal
  4.3.2.1 and binary-tree search 4.3.4.3 → tl-tree; graphs 4.2.4.1 and graph traversal
  4.3.1.1 → dijkstra; stack frames 4.1.1.15 → recursion-viz. Result: every data
  structure (4.2.x) and every search/sort/graph algorithm (4.3.x) now has a Simulate tab.

## Forward nav + dictionary/vector/logic-gate sims (Claude Code, 2026-06-24)
Verified live in Chrome (served over `python3 -m http.server`; the extension can't
load `file://`). Both smoke suites pass.

- **Forward navigation**: `KOS.forward()` / `KOS.canForward()` complement Back, with a
  forward stack that a fresh navigation clears (browser semantics). Topbar now has a
  **‹ Back** + **Forward ›** pair (`.nav-arrows`) and Alt+→ is wired.
- **3 new sims** (19 → 22): `dictionary` key→value store with set/get/delete (4.2.7.1),
  `cs-vector` 2-D vector lab — add / scale / dot product / convex combination on a grid
  (4.2.8.1), `logic-gates` interactive AND/OR/NOT/XOR/NAND/NOR with toggle inputs, a
  drawn gate + output lamp, and a live-highlighted truth table (4.6.4.1).
- Browser-verified: inline sims render on the topic page, Back/Forward step correctly,
  and the logic-gates output lamp flips 0→1 when both inputs are set.

## Interactive sandboxes (Claude Code, 2026-06-24)
New file `js/labs/sandboxes.js` — four free-form playgrounds, registered as sims so
they mount **inline** on their topic's Simulate tab. All functionally tested (jsdom)
and the LMC verified live in Chrome.

- **SQL sandbox** (4.10.4): a real SELECT engine over a sample `Student` table —
  WHERE with AND/OR, ORDER BY ASC/DESC, LIMIT, with friendly parse errors.
- **Regex sandbox** (4.4.2.3): live regex matching with g/i flags; matches highlighted
  in-place (`.rx-hit`) plus a match list. Zero-width-match guard.
- **Base converter** (4.5.2.1): denary/binary/octal/hex — edit any field, the others
  update, with repeated-division and place-value working shown.
- **Little Man Computer** (4.7.3.5): a two-pass assembler (labels resolved) + a
  fetch–execute machine for INP/OUT/LDA/STA/ADD/SUB/BRA/BRZ/BRP/HLT/DAT. Step or Run;
  watch ACC, PC, INBOX, OUTBOX and the 3-digit machine-code memory grid update. Tested
  with 8+5=13 and a label-based count-down loop (outputs 3 2 1 0).
- Fixed a real bug surfaced here: `el("textarea", {value})` sets the *attribute*, which
  a textarea ignores — must assign `.value` as a property (matches hub.js notes box).

Total interactive tools: **22 simulations + 4 sandboxes**.

## Build 2a — The Behavioural Governor: Foundation (Claude Code, 2026-07-01)
Architecture + scaffolding for the governor layer. Placeholder/sample data only —
no real exam dates. Both smoke suites pass.

**FRs implemented: FR-1.1, FR-1.2, FR-1.4, FR-1.5, FR-3.2, FR-3.6, FR-3.7, FR-4.1, FR-4.2 ✅**

- **New core** (`js/core/`): `srs.js` (SM-2 engine + unified card registry, 4-point
  Again/Hard/Good/Easy, persistent per-card metadata, due queue, custom-card CRUD),
  `sessions.js` (session log — the data backbone — + streak derivation),
  `governor.js` (HP/gold/XP/level, catalog, gating, avatar seals, HUD).
- **Flashcards** (`js/engines/flashcards.js`, rewritten): SM-2 session engine —
  "Again" requeues into the current session AND resets the long-term interval
  (two separate mechanisms); per-card ⓘ metrics (reviews, rating, last/next date,
  interval, EF, lapses); Study/Manage modes; custom cards (badged) reviewed
  together with curriculum cards. The Flashcards tab now appears on every
  enriched topic even before cards exist, so customs can be added anywhere.
- **Quiz/exam engines**: retrofit to append session log entries on completion.
- **Views**: `due` (global Due Today queue, overdue first, rail badge),
  `calendar` (month/week, event CRUD modal, weekly recurrence, type legend,
  reminder threshold, SAMPLE events seeded relative to first-run date),
  `governor` (Status + Recovery checklist, Gold Shop, Avatar, Session Log).
- **Gamification**: HP 60/30 thresholds gate labs/sims/shop ONLY (core revision
  never locks); drains −15/inactive day, −10/day when due backlog >30; restores
  via the same actions as XP with a half-rate trickle while Critical. Gold:
  8 lab/sim unlocks + themes (Kin, Shinku) + kanji seals + avatar frames.
  XP/level is pure progress; 5 procedural SVG seals unlock by level; custom
  avatar upload crops to circle + compresses to 256×256 before storage.
- **Home**: HP banner, due-count stat, Today's directives (auto to-do (FR-4.1):
  due cards + near deadlines + today's blocks + manual tasks), deadline
  countdown widget (also on subject dashboards, subject-filtered), per-subject
  streak chips. Streaks now derive from the session log (the old
  open-the-app-and-streak++ `touchStreak` is gone; `state.streak` is legacy).
- **HUD** (topbar): avatar, level, gold, HP + XP bars; click → governor panel.
- **Tests**: smoke/smoke2 unlock the catalog after load (labs are gold-gated on
  a fresh store) and now `process.exit(0)` on success (the 30-min reminder
  interval keeps the event loop alive). NEW `tools/smoke3.test.js` — 20-step
  governor suite: SM-2 maths, lapse/requeue scheduling, custom CRUD, streaks,
  awards, drains, gating, purchases, recurrence, reminders, to-do, and the
  never-lock-core-revision invariant. All three suites pass.

**Carry into Build 2b (Focus Timer)**:
- `sessions.log` accepts `dur` (seconds) and `type:"focus"` already — the timer
  should start/end sessions and pass real durations; engines currently log
  `dur:null`.
- `governor.onSession` has a `focus` award branch stubbed (XP ∝ minutes).
- Interface Focus Mode (FR-5.3) not started; consider a body class + CSS.
- Gold economy numbers are placeholders — rebalance once real usage data exists.
- Recovery checklist targets are static; could scale with backlog size.

## Build 2b — Focus Timer (Claude Code, 2026-07-02)
**FRs implemented: FR-5.1, FR-5.2, FR-5.3 ✅** (Build 2 = 2a + 2b now complete.)
All three smoke suites pass; smoke3 gained 8 focus-timer steps.

- **`js/modules/focus.js`** — session state machine (idle → running ⇄ paused →
  completed/stopped-early) with the Pomodoro work/break auto-cycle as a
  sub-state. Pomodoro 25/5 or custom work (+optional break); the user can end ✓
  after any completed work interval; custom-no-break auto-completes at target.
  Optional subject/topic link. Active sessions persist (10 s heartbeat) and a
  reload restores them PAUSED, clock credited to the last heartbeat.
- **Focus Mode UI (FR-5.3)**: `body.focus-mode` hides topbar/rail/tree; a
  full-screen stage (giant mono clock, phase chip, progress track, 集中/息
  kanji, pause/end controls) can minimise to a docked pill so the chrome-free
  app stays usable mid-session ("study while focused"). Countdown mirrors into
  `document.title`.
- **Deterrent (honest friction)**: native `beforeunload` confirm while RUNNING;
  Page-Visibility distraction log during running work phases (first free, then
  −2 HP each); pause economy (first free, −15% XP/gold per extra, floor 25%);
  ending early logs the session marked incomplete but forfeits the whole award.
  The rules are stated plainly on the start screen — no fake "lock" claims.
- **Activity attribution (FR-3.2)**: `sessions.log` tags entries created while
  a session is live with `focusId`; the final focus entry carries a summary
  ("18 flashcards reviewed, 1 quiz attempt") + per-type counts.
- **Completion**: real `dur` seconds, cycles/pauses/distractions in metrics;
  `governor.onSession` focus branch pays XP = 10 + mins, gold = 3 + 2/cycle-of-25,
  HP +6, then applies the pause shave; a completed linked session offers to tick
  today's matching calendar study block in the daily to-do.
- **Entry points**: rail "Focus Timer" (start view with mode cards + topic
  link + the economy rules), home CTA strip (switches to "session in progress").

**Deviations/notes**: browser can't truly prevent leaving — implemented as
friction + accountability per the brief. Pauses during BREAK phases are free
(not focus time). Incomplete sessions still count toward streaks (they are
logged study evidence); flag if unwanted.

## Build 2c — Tracking Completion (Claude Code, 2026-07-02)
**FRs implemented: FR-1.6, FR-2.5, FR-2.8, FR-3.3, FR-3.4, FR-3.5 ✅**
**→ BUILD 2 COMPLETE. FR Categories 1–5 are now fully implemented** (the single
deliberate exception: FR-2.9 mind-map canvas, marked Won't-have in the FR doc).
All three smoke suites pass (smoke3 gained 11 steps); IndexedDB attachments and
the focus-mode fix additionally verified live in Chrome.

- **Exams & Papers tracker** (`js/modules/tracker.js`, rail · Records): FR-3.4
  and FR-3.5 share one component with a kind discriminator (exam | paper). All
  specified columns: topic, paper, marks/max, grade, date completed, went well,
  didn't go well, mistakes/notes, reviewed checkbox. Filter by subject, date
  sort toggle, summary strip (average, unreviewed, below-60%). Entries are
  study evidence: logged to sessions (type `tracker`, small award) and
  topic-linked results feed the RAG auto-score.
- **RAG flagging** (`js/modules/rag.js`): hybrid per FR-3.3. Manual R/A/G
  confidence picker on every topic's control row (stored as `progress[].rag` —
  confidence, distinct from completion status; click again to clear). Auto
  score (0–100 → band) computed from SM-2 lapse rate / avg ease / overdue,
  quiz lastPct, and recent exam/paper results — no data → unrated, never fake
  green. Manual wins display; the data verdict stays visible with a ≠ marker
  when they disagree. "Recommended next" panels (home + subject dash) list the
  worst topics with reasons — the prescriptive-analytics piece.
- **Flashcard stats dashboard** (`js/modules/cardstats.js`, rail · Records):
  FR-1.6 with plain inline SVG (no chart lib): reviews/day (14d, from the
  session log), due forecast (+overdue bucket), ease distribution, rating mix;
  scope pills (all/subject) + per-topic drill-down; per-topic breakdown table
  sorted by lapses with RAG dots.
- **Resource tables** (FR-2.8): lightweight CRUD table on each subject
  dashboard — name + URL, optional topic ref (validated), opens in a new tab.
- **Attachments** (`js/modules/attachments.js`): FR-2.5 on IndexedDB
  (`kurenai-os-files`, blobs + metadata indexed by [subject, ref], 25 MB/file
  cap). A **Files tab on every topic page**: upload, inline viewer for images
  and PDFs, open-in-new-tab/download fallback for everything else, per-file
  notes field, delete. Graceful fallback message where IndexedDB is missing.
  **SCOPE DECISION (explicit): "annotate" = a notes field per document, NOT
  inline markup/highlighting on the file itself — true in-document annotation
  was deliberately cut as a disproportionate scope expansion.**
  ⚠ Attachments live outside the localStorage backup JSON.
- **Streak integrity**: streaks now ignore focus sessions with
  `complete:false` (log entries unchanged; HP day-drain still sees them).
- **Help & Guide** (`js/modules/help.js`, rail · Data): every feature and tab
  explained in a sentence or two, plus keyboard shortcuts.
- **Focus-mode navigation fix**: minimising to "Study while focused" now
  brings the rail + tree back (topbar stays replaced by the dock), so study
  pages are actually reachable mid-session. Verified in Chrome.

## Claude Code backlog (app features)
- **Content**: fill quiz (≥3) and exam (≥1) gaps across maths + thin CS files, using
  PMT papers in `Context/` as source (see the plan: build-1 completion sprint).
- More simulations (Karnaugh maps, BFS/DFS graph traversal, projectile motion).
- More sandboxes (BNF validator 4.4.3.1, normalisation 4.10.3).
- Build 2 (gamification): Behavioural Governor (avatar, focus timer, SM-2 engine).
- Build 3: Kurenai Collection Matrix.
