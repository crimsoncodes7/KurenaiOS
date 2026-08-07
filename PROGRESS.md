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

## Build 3a — 蒐 Kurenai Collection Matrix: shared infrastructure + Anime (Claude Code, 2026-07-02)
The cross-media tracker foundation. Anime is the one real module this phase;
Books (manga/LN), VN and Games are registered placeholders on the Matrix home
(same treatment as the OS home's future-build cards) — the schema, storage,
Shrine and governor hooks are already module-agnostic, so they plug in without
architectural change. All four smoke suites pass; the full pipeline was
additionally verified LIVE in Chrome against the real AniList API with the
real 650-entry export.

- **Storage** (`js/core/mediadb.js`): IndexedDB `kurenai-os-media` (v2), NOT
  localStorage — 650 real entries. `entries` store with indexes on module,
  status, [module,status], genres/tags (multiEntry), and both external ids
  (anilist, mal). Every filter walks the narrowest index via cursor — no
  in-memory scans. One shared schema across all five module types (status,
  progress, ownership, score, shared tag/genre taxonomy, dates, externalIds,
  syncSource, lastSyncedAt). A `kv` store holds the AniList client ID +
  token — deliberately OUTSIDE the localStorage backup JSON.
- **AniList connection** (`js/core/anilist.js`, primary path): OAuth Implicit
  Grant + Auth Pin flow per docs.anilist.co — user registers a client (one-time,
  see CLAUDE.md), pastes the Client ID into Sync & Import, Connect opens
  `…/oauth/authorize?client_id={id}&response_type=token`, and the token shown
  on AniList's PIN page is pasted back in. Tokens last 1 year, no refresh —
  401s clear the token and prompt reconnection. READ-ONLY BY DESIGN: no
  mutation is ever sent. "Sync now" pulls the whole list in ONE
  MediaListCollection call (status, progress, scores, dates, covers, genres,
  studios) and upserts by external id — no duplicates. Verified live: custom
  lists (status:null) duplicate entries of the status lists, so sync dedupes
  by entry id.
- **XML import** (fallback, `js/core/media.js`): AniList's MAL-format export
  via DOMParser — CDATA titles, 0000-00-00 unset sentinel, status mapping,
  anime + manga patterns. **ID DISCOVERY (verified live):** `series_animedb_id`
  is the MAL id, NOT the AniList id — the two coincide below ~22k (old titles),
  which is why it looks AniList-flavoured on spot checks; modern ids diverge
  completely. Imports therefore store `externalIds.malId`.
- **Public enrichment** (no login): batched `Page(media(idMal_in/id_in))`
  queries — 50 ids/call, paced 2.4 s apart (AniList is in a documented
  degraded state: 30 req/min, not the nominal 90, plus a burst limiter),
  429s honour Retry-After with 3 retries, progress bar + "rate limited,
  resuming" messaging. Enrichment backfills the ANILIST id onto imported
  rows, so a later authenticated sync matches them instead of duplicating.
  **Ran for real: 650/650 covers + genres in 13 requests (~35 s).**
- **file:// verdict (observed, not assumed)**: graphql.anilist.co answers
  `Origin: null` requests with `access-control-allow-origin: *` → the public
  API works from file:// pages; no local server needed. The offline path is
  fully graceful: kanji placeholder covers, no genres, everything else works.
- **Anime module** (`js/modules/anime.js`): grid/list toggle, filter by
  status/genre/tag + title search (all on the DB indexes; 650-entry filter
  measured at ~1 ms live), full CRUD modal, "+1 ep" quick logging with
  auto-complete-at-total, favourite hearts. **Never renders 650 cards at
  once**: IntersectionObserver sentinel renders batches of 60 (verified live:
  60 in DOM at rest, +60 per scroll), covers lazy-load with placeholder
  fallback.
- **Matrix home** (`js/modules/matrix.js`): cross-media "currently consuming"
  strip, aggregate stats + charts reusing Build 2c's `KOS.charts` inline-SVG
  helpers (now exported from cardstats.js), Books/VN/Games placeholder cards,
  and the **rest streak** — consecutive days with ≥1 media log, displayed
  beside (and visually distinct from) the study streak.
- **The Shrine** (`js/modules/shrine.js`): the old manga tracker's hall of
  fame, module-agnostic from day one — every ♥-marked entry across all
  modules, ranked by score.
- **Governor contract**: logging media (add / +1 progress / status change)
  feeds +4 XP/+1 gold through the normal sessions pipeline (type `media`).
  **HP is untouched in BOTH directions** — media awards 0 HP and media
  sessions are excluded from the day-drain's activity check AND the study
  streak (`sessions.js`). Bulk sync/import never logs sessions (no gold
  minting off a 650-row import).
- **Tests**: new `tools/smoke4.test.js` (26 steps; needs `npm install
  fake-indexeddb`) — schema defaults, indexed queries, dual-id upsert
  bridging, 650-entry scale, XML edge cases, sync dedup, 429 backoff
  (mocked network for repeatability; live behaviour documented above),
  governor HP invariant, rest streak, and all four views. smoke2's home-card
  fixture updated (Build 2b/3 "coming soon" cards are gone/live).

**Manual step still owed by the user (AniList Client ID)** — see CLAUDE.md.
**Deviations/notes**: the brief's claim that the XML export holds AniList ids
was disproved live and handled (dual-id architecture). Deferred to 3b+ as
briefed: Seasonal Watching, airing countdowns, watch-history heatmap, real
Books/VN/Games modules, Steam/VNDB. The 650-entry import currently sitting in
Chrome's IndexedDB (localhost:8137) is real, correctly-keyed data from the
verification run — keep or wipe freely (Sync & Import re-creates it).

## Build 3b — 本 Books: Manga & Light Novels, dual-tracked (Claude Code, 2026-07-02)

The deep phase, as scoped: volume-level granularity, the virtual bookshelf and
Mangaka pages, plus the StoryGraph-lite extras (mood, half-stars, DNF, custom
shelves) folded in as schema additions. Nothing descoped.

- **The core architectural decision — dual-tracking, one entry** (`mediadb.js`,
  DB now **v3**): a series is one row whether it's AniList-synced, physically
  owned, or both. The shared top-level list-state fields (status, progress,
  score, externalIds, syncSource) ARE the digital half — NOT duplicated into a
  `digital` sub-object, so 3a's upsert matching/indexes/views work unchanged.
  The physical half is `physical.volumes[]`: per-volume condition
  (mint/good/worn/damaged), purchase date, price, optional custom cover.
  New books axes: `author`, `format` (manga/lightNovel/oneShot), `mood`,
  `shelves`, `dnf {isDnf, reason}`, `progress.volumes/totalVolumes`. New v3
  indexes: mood + shelves (multiEntry), author. **v2→v3 migration** rewrites
  legacy `module:"manga"/"ln"` rows to `books` (+format) inside the upgrade
  transaction — tested against a genuinely pre-seeded v2 database.
- **Merge contract extended** (`bulkUpsert`): sync still wins on reading
  state, but the physical vault, mood, shelves, an active DNF and local
  author/format ALWAYS survive — a 200-row manga sync can never eat the shelf.
- **AniList MANGA sync** (`anilist.js`): same OAuth token, same
  MediaListCollection pattern with `type: MANGA` — genuinely small addition.
  The manga query adds `progressVolumes` + the `staff` connection; author =
  first Story/Art-role credit (translators/assistants excluded — Berserk's
  staff list live-verified with five translator edges). The anime query
  deliberately skips staff (650-entry payload). **Query shapes validated live
  against graphql.anilist.co on 2026-07-02** (staff edges, progressVolumes,
  and the format enum MANGA/NOVEL/ONE_SHOT → manga/lightNovel/oneShot).
  Enrichment for Books also backfills author/format/volume counts.
- **Manga XML import** (`media.js`): `<manga>` tags → Books entries, with the
  **MAL-id fix applied proactively from the start** (store `malId`, enrich via
  `idMal_in`, backfill `anilistId`) — the 3a discovery, not re-derived.
  Chapters + volumes + defensive `series_type` → format mapping.
  **Stated plainly: this path is tested against the EXPECTED MAL-export shape
  only** — the anime shape was verified against a real file in 3a, the manga
  variant has not been; worth a live check when the user provides an export.
- **Physical vault CRUD** (`books.js` editor): range tool ("add volumes 1–15"
  with shared condition/date/price → individual editable records, existing
  numbers never duplicated), single quick-add (+ Vol N, dated today),
  per-volume rows with condition/date/price/remove, per-volume custom cover
  upload reusing the Build 2a avatar canvas-compress pattern (2:3 rect JPEG).
- **Owned % vs Read %**: a stacked dual bar on every card — gold owned track
  over crimson read track — from `KOS.books.ownership()`: real volume counts
  when known, chapter-derived estimate (~9 ch/vol, flagged "est.") otherwise.
- **Virtual bookshelf**: third layout mode of the Books view. One shelf row
  per owned series; generated spines (deterministic palette colour via title
  hash — same series, same colour, every session — plus volume number and
  vertical title) with worn/damaged condition ticks, custom covers rendered
  when set, and a gold-lipped shelf board. AniList has no per-volume art, so
  the generated spine is the default presentation by design.
- **Mangaka pages** (`KOS.views.mangaka`): all Books entries grouped by
  author — synced staff data and manual strings alike. Aggregate stats per
  author (works, volumes owned, spend, chapters read, average rating).
  **Name-based grouping, stated as such in the UI** — two romanisations of
  one person are two groups; accepted limitation, not a bug.
- **Reading heatmap**: the SAME session log that powers the rest streak,
  filtered to `metrics.module:"books"`, drawn by a new `KOS.charts.heatmap`
  (GitHub-style week grid) living beside the other Build 2c SVG helpers. No
  parallel logging system. (Anime's watch-history heatmap remains deferred to
  an anime-deepening phase — this one is Books-specific by scope.)
- **Governor boundary unchanged**: Books actions go through the same
  `KOS.media.logActivity` → +4 XP/+1 gold, 0 HP, same cross-media rest
  streak — NOT a separate books streak. Bulk sync/import still never logs.
- **Chrome**: Books rail item, live Books module card on the Matrix home
  (series/reading/completed/vols owned) + Books-by-status chart + shelf
  stats, Sync & Import gains "Sync now — Manga (Books)" and a second
  enrichment block, stale "the ids inside are AniList ids" copy corrected to
  the MAL-id truth, OS home card and topbar bumped to Build 3b, Help updated.
  Shrine/Matrix now route Books entries to the Books editor (KOS.mediaEditor
  dispatch wrapper in books.js).
- **Tests**: new `tools/smoke5.test.js` (19 steps): v2→v3 migration against a
  real pre-seeded v2 DB, schema defaults + volume normalisation, range-tool
  CRUD incl. overlap/no-dup + exception editing, owned/read maths (real +
  estimate), manga XML (MAL ids, volumes, Plan to Read, light-novel type),
  enrichment author/format/anilistId backfill, MANGA sync mapping (staff
  filtering, progressVolumes, dedup; anime query staff-free), sync-merge
  preservation of the physical vault, all new query filters, stats
  aggregation, governor HP boundary, and the Books/shelf/editor/Mangaka/
  Matrix/mediasync/Shrine views — the editor test drives the actual modal
  (types a title, runs the range tool, saves 12 volumes end-to-end).
  smoke4's manga fixtures updated for module:"books". All five suites pass.

**Deferred, unchanged**: quotes/highlights, series relationship webs, reading
pace projections, Anime deepening (seasonal/airing/watch heatmap), VN (VNDB),
Games (Steam). **Owed a live check**: the manga XML export shape, once a real
file exists to test against.

## Build 3c — 選 Visual Novels: VNDB sync + the manual tracking layer (Claude Code, 2026-07-03)

Books-depth treatment, as inferred from the standing preference. Games stays
manual-entry-only (Steam CORS findings unchanged).

- **VNDB Kana client** (`js/core/vndb.js`) — built against the OFFICIAL
  endpoint **`https://api.vndb.org/kana`**, verified from their own docs;
  the `api.vndbproxy.org` base floating around community wrappers is a
  third-party proxy and is deliberately NOT used. **Live-verified 2026-07-03**:
  - **CORS from file:// WORKS** — OPTIONS preflight with `Origin: null`
    answered 204 with `access-control-allow-origin: null`, methods
    POST/GET/OPTIONS, allowed headers Content-Type + Authorization; the real
    POST answered 200 with `access-control-allow-origin: *`. No local server
    needed — same happy outcome as AniList, same polite offline degradation.
  - POST `/vn` and `/ulist` ran verbatim against real data (Ever17,
    public list u2): `{more, results}` envelope, vote **10–100** (÷10 →
    shared score), labels `[{id,label}]` (1 Playing / 2 Finished / 3 Stalled /
    4 Dropped / 5 Wishlist → shared statuses, precedence Playing-first so a
    replay reads as in progress; 6 Blacklist → row skipped; 7 Voted virtual),
    `started/finished` dates, nested vn record with `developers`,
    `image.url`, `length_minutes`, typed tags.
  - GET `/authinfo` without a token → clean 401 with CORS headers intact;
    the client checks the `listread` permission on connect.
  - Auth is a **personal token** (`Authorization: Token …`) — no OAuth, no
    client registration; documented rate limit 200 req/5 min, client paces
    ~1.6 s between bulk calls + Retry-After backoff on 429. Read-only by
    design; the recommended token has write access left off entirely.
- **Schema v4** (`mediadb.js`): `developer`, `contentWarnings`,
  `routes [{name, cleared, completedAt}]`, `cgGallery {totalKnown,
  unlockedCount}`, `quotes [{text, context, loggedAt}]`,
  `externalIds.vndbId`; new `vndb` + `developer` indexes; v3→v4 upgrade
  tested against a genuinely pre-seeded v3 DB. **For `module:"vn"` with
  routes, progress is DERIVED** (current = cleared, total = routes.length) —
  the Matrix strip/charts read VNs with zero special-casing.
- **Honest limitations, stated where they matter**: VNDB's data is about the
  VN itself — it has **no clean structured route data**, so routes are a
  manual feature by design (sync fills metadata, never the routes array);
  the CG gallery is **a counter, not images** — no artwork is scraped or
  stored (copyright, and VNDB doesn't expose galleries anyway); content
  warnings are manual and deliberately never auto-filled from VNDB's
  crowd-sourced tags. Tags→genres is the one mapping taken: category "cont",
  spoiler-free, rating ≥ 2, top 6.
- **Merge contract extended** (`bulkUpsert`): vndbId matched first (then
  anilist, then mal); sync wins on list state, but **routes, quotes, the CG
  counter, content warnings and a local developer ALWAYS survive**, and
  progress re-derives from the surviving routes.
- **VN vault** (`js/modules/vn.js`): grid/list with status pills,
  genre/developer filters, index-backed search, lazy 60-batch rendering;
  editor with manual VNDB-id linking, route CRUD (checkbox auto-dates
  completion), CG counter, warnings, quote log; stats strip (tracked /
  playing / completed / routes cleared / quotes kept). `KOS.mediaEditor`
  dispatch chain is now vn → books → anime base.
- **Quote log → flashcards**: any logged quote can be sent to the card
  system through a pre-filled, editable form. **The flashcard schema needed
  only a small backwards-compatible extension, not a restructure**: sid/ref
  were already opaque strings everywhere downstream, so a reserved
  `"personal"` sid (`KOS.srs.PERSONAL_SID`, ref `"vn"`) + an optional
  `extra`/`src` origin field on `addCustom` + `personalRefs()` was the whole
  change. New **Personal Deck** view (in `due.js`) is the study/manage
  surface — the standard flashcards mount over the bucket; Due Today gains a
  Personal column and deck launcher. Reviewing personal cards is study
  (normal flashcards session); only media logging is rest.
- **Governor boundary unchanged**: add / status change / route cleared /
  quote logged → `KOS.media.logActivity` (+4 XP/+1 gold, 0 HP, shared rest
  streak — one act per save, most significant wins). Bulk sync never logs.
- **Chrome**: VN rail item, live VN module card on the Matrix home
  (tracked/playing/routes/quotes) + VN-by-status chart, VNDB panel in
  Sync & Import (token paste + verify + sync + disconnect) and a third
  enrichment block (VNDB-backed, for hand-linked ids), topbar/OS-home bumped
  to Build 3c, Help updated including the backup caveat that manual VN data
  (routes/quotes) has no cloud copy.
- **Tests**: new `tools/smoke6.test.js` (20 steps): v3→v4 migration,
  VN schema defaults/derivation round-trips, label precedence + blacklist
  skip, tags→genres, live-shape mapListEntry, paged mocked syncList with
  auth-header assertion, 401/429 error mapping, vndbId upsert dedup, the
  sync-never-eats-the-manual-layer merge, personal bucket (creation, SM-2
  ride, due queue, both views), governor 0-HP boundary, and the VN vault /
  editor / Matrix / Shrine views. The VNDB network is mocked to the
  live-observed shapes for repeatability; the live CORS/endpoint findings
  are recorded above and in the client header. smoke4/smoke5 assertions
  updated for the promoted module (4 sync panels, 3 enrichment blocks,
  Games as sole placeholder). **All six suites pass.**

**One-time manual step (user)**: generate a token at vndb.org/u/tokens
("access to my list" ticked, write access off) and paste it into
Sync & Import → VNDB.

**Deferred, unchanged**: Games (Steam CORS), anime deepening, series webs,
reading pace projections. **Still owed**: the manga XML live check (3b).

## Build 3d — ⇅ Write-Back & Search-to-Add (Claude Code, 2026-07-03)

Write capability for both live connections + per-module external search.
Games untouched (nothing to write to). Confirmed decisions honoured:
automatic/immediate push, no confirmation step; per-module search, not a
unified bar.

- **One shared push utility** (`js/core/mediapush.js`) serves both
  services — no parallel implementations. Eligibility: only
  `syncSource:"anilist"` + anilistId (anime/books) or `syncSource:"vndb"`
  + vndbId (vn); manual/imported entries never attempt a push. **Field
  scoping by construction**: the payload builders only know status /
  progress (+ volumes for books) / score — the physical vault, mood,
  shelves, notes, quotes, routes, CG counters and content warnings have
  no code path into a payload. Per-entry **350 ms debounce** (the
  hub.js notes-autosave interval, reused as specified) + queue dedupe by
  entry id + read-latest-from-DB-at-execute, so a burst of "+1" clicks
  coalesces into one push of the final state. Success → lastSyncedAt +
  a kv **write-activity log** (cap 200, shown on Sync & Import); final
  failure → persisted `push:{state:"failed"}` with a ⚠ retry chip on the
  card + a non-blocking toast. Retries reuse the read clients' error-kind
  contract (429 honours Retry-After, transient errors back off ×3, auth
  fails immediately with the client's specific wording).
- **AniList write — verified against the live schema by introspection
  (2026-07-03)**, not recollection: `SaveMediaListEntry(mediaId Int,
  status MediaListStatus, progress Int, progressVolumes Int, score Float,
  scoreRaw Int, …)` and the MediaListStatus enum (CURRENT/PLANNING/
  COMPLETED/DROPPED/PAUSED/REPEATING) both confirmed. `scoreRaw` (0–100)
  is pushed instead of `score` so writes are independent of the user's
  site scoring format; local score 0 = unrated omits it entirely so a
  remote rating is never wiped. Reverse status map never produces
  REPEATING. **No real write was executed during the build**: the tokens
  live in the browser's IndexedDB, unreachable from the CLI — the
  mutation *shape* is live-verified, execution is covered by mocked
  tests and will exercise for real on first use.
- **VNDB write — endpoint verified real, but browser-blocked, stated
  plainly**: `PATCH /ulist/<id>` `{vote 10–100, labels_set/labels_unset}`
  (managed labels 1–5 only; virtual 0/7 untouchable; 204 on success;
  needs listwrite) confirmed from the official Kana docs and a live
  tokenless PATCH (clean 401 — endpoint exists). **However VNDB's CORS
  preflight answers only `POST, GET, OPTIONS` even when asked for PATCH
  (verified live 2026-07-03), so browsers refuse to send the write no
  matter what the token allows.** The client implements the documented
  shape anyway — it starts working with zero changes if VNDB ever allows
  PATCH — fails with a specific explanation naming the real cause (never
  "you're offline"), skips pointless retries against the policy wall,
  and toasts the full explanation once per session. Token regeneration
  with "modify my list" is still the right prep (401/403 handlers name
  it precisely), it just isn't sufficient today. VNDB's ulist also has
  **no progress field** — a VN push is status+vote only, and VN snapshot
  comparison ignores the routes-derived progress so route edits never
  trigger one.
- **Search-and-add** (`js/modules/mediasearch.js`, the gold **⊕ Find
  new** button in each vault toolbar): one shared modal, per-module
  config — Anime/Books hit AniList's `Page.media(search:, type:, sort:
  SEARCH_MATCH)` (ran live), VN hits VNDB's `["search","=",…]` filter
  with `sort: searchrank` (ran live). 220 ms live-search debounce (the
  vault-search interval). Results: cover, title, format/year/units/
  developer. Add → status picker (per-module wording: Plan to watch /
  Wishlist / …) → **create-then-mirror**: one deliberate act, one direct
  write call (NOT the debounced pusher) — only a confirmed remote create
  yields `syncSource` + `lastSyncedAt: now`; otherwise (not connected, or
  the VNDB CORS wall) the entry is added locally as `syncSource:"manual"`
  WITH the external id kept, so a later pull sync claims it instead of
  duplicating (`mediadb.getByExternal` also dedupes at add time).
  Deliberately a separate surface from the vault filter search.
- **Inline quick-edit** (`KOS.media.quickEdit`, one implementation for
  all three vaults): status select + score input directly on grid cards
  and list rows — the low-friction editing that makes automatic push
  worth having. Status changes log a "status" session (same as the
  editors), score-only changes save+push without a session log (also
  same). The static status chip on cards gave way to the live select
  (no duplicate display); `KOS.media.pushChip` renders the ⇅ pending /
  ⚠ failed indicator with one-tap retry.
- **Governor unchanged**: search-and-add logs `logActivity("added")`
  (+4 XP/+1 gold, 0 HP, rest streak) like any entry creation; push
  attempts themselves never log sessions.
- **Chrome/docs**: write-activity panel + last-write-wins copy on Sync &
  Import, VNDB panel copy updated (tick "modify my list", with the CORS
  caveat), Help gains Write-back and Find new entries stating both
  limitations, topbar bumped to Build 3d.
- **Accepted, documented limitation — last-write-wins**: no conflict
  detection. An edit made on AniList/VNDB's own site between local edits
  is overwritten by the next push, and a pull sync overwrites local list
  state the same way. Deliberate scope boundary for a single-user tool;
  stated in Help, Sync & Import and CLAUDE.md.
- **Tests**: new `tools/smoke7.test.js` — push eligibility/field-scoping
  (manual entries never push; a notes-only edit schedules nothing; VN
  payloads carry no progress), debounce coalescing (N rapid bumps → one
  request with final state), 429-then-success backoff, auth failure →
  persisted failed state + the listwrite wording, the write log, the
  AniList mutation body shape (introspection-matched), the VNDB PATCH
  shape, search-and-add create-then-mirror + local fallback + dedupe,
  quick-edit wiring, and the governor boundary. Network mocked to the
  live-verified shapes; smoke4's mediasync assertion updated (5 panels).
  **All seven suites pass.**

**Verified live this build**: AniList SaveMediaListEntry arg types +
status enum (introspection), AniList search query, VNDB PATCH /ulist
existence + auth behaviour, VNDB search filter + searchrank, and the
VNDB CORS write blockage. **Pending user action**: regenerate the VNDB
token with "modify my list" (prep for if/when VNDB permits browser
PATCH); first real AniList push happens on first use in the browser.

## Build 3e — 遊 Games: the last module, manual-first by verified necessity (Claude Code, 2026-07-03)
- **The Collection Matrix is complete**: all four modules (Anime, Books,
  Visual Novels, Games) are live. Games is MANUAL-ENTRY ONLY, permanently
  and by design — that phrase now has a precise, tested meaning (below).
- **Schema (`js/core/mediadb.js`, DB v4→v5)**: game axes on the one shared
  shape — `publisher`, `completionTier` (notStarted | storyComplete |
  fullCompletion | platinum | abandoned — deliberately finer than the
  shared status: credits-rolled vs 100% vs platinum is the hobby),
  `platform` (pc/playstation/xbox/switch/other; null on non-game rows),
  `playtimeHours` (null = unknown, never a fake 0), `backlogPriority`
  (low/medium/high/null). For `module:"game"` **progress DERIVES from
  playtimeHours** (current = hours, total = null) — the VN-routes trick
  again, so the cross-media UI reads games for free, unit "hr". v5 adds
  `platform` + `steam` (externalIds.steamAppId) indexes. `stats()` tallies
  per-tier counts and hours. `normalise()` remains the single schema gate.
- **Games vault (`js/modules/games.js`, view id `game`)**: same scale
  rules as every vault (index-backed filters: status/platform/genre/tier +
  title search; lazy 60-batch rendering). Editor covers every axis, plus:
  tier→status nudges (abandoned→dropped, any completion tier→completed,
  same spirit as the Books DNF box), manual cover upload reusing the 2:3
  canvas-compress (`KOS.books.compressVolumeCover` — the Build 2a avatar
  pattern), and a hand-entered **Steam App ID** that yields a live "View
  on Steam ↗" store link (the entire Steam integration, honestly). "+1 hr"
  on in-progress cards is the everyday log action, mirroring +1 ep.
  `KOS.mediaEditor` chain is now game → vn → books → anime base.
- **Bulk paste-in add** — the real mitigation for "no API import": paste
  titles one per line (Steam's library page copy-pastes cleanly) → each
  becomes a Planned draft. Pure local parsing (`KOS.games.parseBulkTitles`,
  exported for tests): trims, skips blanks, dedupes within the paste AND
  against the vault case-insensitively, caps lines at 300 chars. Governor
  contract: the whole paste logs **exactly ONE media session**
  (`action:"bulk-add"`, with a count) — one deliberate act; per-row logging
  would flood the log and mint gold, the same reason bulk sync never logs.
- **STEAM SIGN-IN — attempted, tested live, abandoned (2026-07-03)**:
  - The OpenID 2.0 shape was tested against the real endpoint
    (`steamcommunity.com/openid/login`), not assumed.
  - **Dead end #1 (decisive)**: the `check_authentication` verification
    POST answers correctly (`is_valid:` body) but with **no
    Access-Control-Allow-Origin header** — a browser page can *send* the
    verification (form-urlencoded POSTs skip preflight) but can **never
    read the answer**. Verification therefore requires a server-side
    component, which this app deliberately doesn't have. An UNVERIFIED
    sign-in is spoofable decoration, so per this build's own bar
    ("stop rather than build something fragile"), it was not built.
  - Dead end #2: from `file://` the return leg is browser-blocked
    outright (https → file:// top-level navigation is forbidden),
    independent of Steam. A localhost server would fix only this leg —
    Steam happily serves the login flow for
    `return_to=http://localhost:8000` (tested) — but #1 still stands.
  - Dead end #3: even best-case, `claimed_id` is a bare SteamID64
    number; the display name needs the Steam Web API
    (`GetPlayerSummaries`), which is CORS-blocked and needs an API key.
    The "connected as X" badge would have read "connected as 7656119…".
  - All three findings are documented user-facing on Sync & Import
    ("Games — manual by design" panel) and in Help.
- **What "manual-entry only" means in practice**: bulk paste for the
  initial library, per-game fleshing out (playtime typed, not pulled),
  a store link from a hand-entered App ID, and zero network traffic from
  the module ever (smoke-asserted). No connect button exists to disappoint.
- **Games analytics** (KOS.charts reuse, nothing new): completion-tier
  breakdown across the full enum, platform + genre breakdowns, and the
  **backlog burn-down** — added vs reached-a-completion-tier per week,
  paired crimson/jade bars from the same sessions log that backs the rest
  streak, with a plain-words verdict ("backlog GREW by N in 12 weeks").
- **Cross-media integration, verified not assumed**: a dummy in-progress
  game (Slay the Spire, 11 hr) was pushed through the Matrix home in the
  test suite — it appears in the "currently consuming" strip with the hr
  unit and 遊 badge; the Games module card is live ("Manual-first · live")
  with a stats line; "Games by status" chart + "Playing now" stat +
  Games vault quick action added; Shrine routes game favourites to the
  games editor via the mediaEditor chain. Rail gains a Games button
  (Steam-blue accent #66c0f4). Topbar bumped to Build 3e.
- **Governor boundary unchanged**: add/status/tier/+1 hr →
  `logActivity` (+4 XP/+1 gold, 0 HP, rest streak only); score-only edits
  don't log; HP asserted untouched through the whole suite; quick-edit
  tooltip says "saved locally" for games instead of promising a push, and
  `mediapush.eligible()` returns null for games whatever their ids claim.
- **Tests**: new `tools/smoke8.test.js` (21 steps) — schema defaults/
  clamps/derivation, v5 indexes, axis round-trip, tier/platform filters,
  stats tallies, the bulk parser + one-session contract + re-paste dedupe,
  editor round-trip + store link, tier nudge + tier session, +1 hr with
  HP/network invariants, push ineligibility, analytics rendering incl.
  burn-down verdict, Matrix strip/card/chart, Shrine routing, the Sync &
  Import Games panel, and a run-wide "no request ever mentioned steam"
  assertion. Stale placeholder assertions in smoke4/5/6 updated (Games
  now live; mediasync has 6 panels). **All eight suites pass.**

## Build 3f — 映 Anime Deepening: Seasonal, airing countdowns, watch heatmap, AniList profile (Claude Code, 2026-07-03)
- **Season/seasonYear persistence — verdict: already correct, one real
  hole patched.** The 3a sync mapper and enrichment both store
  `extra.season`/`extra.seasonYear`, and `normalise()` passes `extra`
  through — no storage fix needed on those paths. BUT `bulkUpsert`'s merge
  had no `extra` handling: a matched XML **re-import** (imports carry an
  empty `extra{}`) would have silently wiped stored season/studio/format.
  Patched: `extra` now accretes through merges — fresh non-null sync
  values win, a null never beats stored data (the mapper emits every key
  as null when AniList has no value, so plain Object.assign was wrong too).
- **Seasonal Watching** (`KOS.views.seasonal`, in anime.js): the vault
  filtered to the current season, computed from the DEVICE date at render
  time by calendar quarter onto AniList's own enum (WINTER Jan–Mar /
  SPRING / SUMMER / FALL) — `KOS.anime.currentSeason(date)` is pure and
  test-covered. Airing entries sort first (soonest episode), the rest A–Z.
  Entries with no season data (manual/unenriched/unlinked) don't appear —
  accepted limitation, stated in the view copy. **Palette shift**: the
  container gets `s-winter|s-spring|s-summer|s-fall`, each of which just
  sets `--season` and points `--accent` at it — every existing tinted
  component follows, so it's a mode of the token system (cool azure /
  green / gold / ember), not a skin.
- **Airing countdown** — live data, honestly handled:
  - `nextAiringEpisode` shape verified live 2026-07-03: `{ airingAt (unix
    SECONDS), timeUntilAiring, episode }`. **Two surprises from the live
    data**: (1) `airingAt` can sit WEEKS out on a RELEASING show — One
    Piece was 8 days but Re:Zero S4 was 40 days out (mid-season break),
    both RELEASING — so the countdown formatter has a days tier and the
    "airing soon" list makes no same-week assumption; (2)
    `nextAiringEpisode` can be null on a RELEASING show (long hiatus) —
    such entries simply carry no badge.
  - Fetched by `KOS.anilist.fetchAiring(ids)` (public, batches of 50,
    REQUEST_GAP-paced) for plausible candidates only: inProgress, or
    planned from the last year, with an AniList id, capped at 150.
  - Cached **in memory only** (never the vault — smoke-asserted), TTL 10
    min so rail-hopping doesn't spend the 30 req/min budget; refreshed on
    Anime/Seasonal/Matrix load, ⟳ forces. No background polling — none is
    feasible or wanted in a serverless page.
  - Surfaces: "EP n · 2d 5h" badges on vault cards/rows (tooltip has the
    full local air time), and an **"Airing soon" list on the Matrix home**
    beside — never replacing — the consuming strip.
- **Watch-history heatmap**: Books' 3b heatmap retargeted — the SAME
  sessions log that backs the rest streak, filtered to
  `metrics.module === "anime"`, drawn by the SAME `KOS.charts.heatmap`
  helper (no second heatmap implementation), under the Anime vault.
- **AniList Profile** (`js/modules/aniprofile.js`, rail entry, AniList-blue
  accent): name, avatar, banner, about, anime & manga overview statistics
  (count/episodes/days-watched/mean /100 + top-genre and list-status
  charts via KOS.charts), favourites (anime, manga, characters, staff,
  studios), followers & following with totals, notifications, and the
  activity feed. **ONE GraphQL request for the whole page** — aliased
  Pages verified live on a real account (followers/following/activities +
  Viewer in a single query). In-memory cache (5 min TTL) + ⟳ force.
  Read-only: `notifications(resetNotificationCount: false)` so reading
  them here never consumes the site's unread badge.
  - Live-verified quirks now encoded: `followers(userId:)` demands the
    variable typed `Int!` (while `User(id:)` takes `Int` — a mismatched
    declaration is a hard validation error); `ListActivity.status` is a
    human STRING ("watched episode") and `.progress` a string range
    ("5 - 8"), not numbers; `meanScore` is the 0–100 site scale;
    `AiringNotification` text composes from its `contexts` array.
- **Tests**: new `tools/smoke9.test.js` (15 steps) — season quarters for
  all 8 boundary dates, countdown formatting, season persistence through
  sync mapping, the merge fix (re-import can't wipe extra; null never
  beats data), airing candidate selection + cap, on-load fetch + badge
  text + TTL suppression + forced refresh + vault-stays-clean, Seasonal
  view filtering/palette/limitation copy, Matrix airing strip coexisting
  with the consuming strip, heatmap counting anime logs only, and the
  profile (connect-first state, one-request assertion,
  resetNotificationCount:false, every section's content, cache TTL + ⟳).
  smoke4's matrix step now waits for the async queries instead of racing
  a fixed 60 ms tick (3f added airing queries ahead of the strip's).
  **All nine suites pass.**

## Build 3h — 掃 VNDB duplication fix + import mode control (Claude Code, 2026-07-04)
- **The bug (real, user-reported): re-syncing VNDB duplicated the whole
  list.** Root cause found by running the live API, not guessing:
  `KOS.vndb.mapListEntry` read the VN id from `r.vn.id` — but the Kana
  `/ulist` response NEVER returns an `id` inside the nested vn record,
  even when `vn.id` is in the requested field list (verified live
  2026-07-04 against api.vndb.org/kana; the response is
  `{"id":"v1", …, "vn":{"title":"…"}}`). The row's TOP-LEVEL `id` is the
  VN id. So every synced entry stored `vndbId: null`, no re-sync could
  match anything, and bulkUpsert inserted the entire list fresh each
  pull. smoke6's mocks had invented a `vn.id` field reality never sends —
  which is why 3c's "second sync matches by vndbId" step passed while the
  real app duplicated. **AniList checked for the same class of bug: not
  affected** (GraphQL returns requested fields reliably; `media.id` /
  `idMal` are real, XML parses MAL ids as numbers, both sides numeric).
- **Fix**: `mapListEntry` takes the id from `r.id`; smoke6's mocks
  corrected to the real shape (no nested id) so the old suite would now
  catch the regression too.
- **Title-claim fallback** (bulkUpsert, vn-scoped): an incoming vn row
  whose vndbId finds no index match may claim an existing vn row with NO
  vndbId and the same title (case-insensitive), backfilling the id —
  this is how rows damaged by the bug, and hand-made VN entries, get
  adopted by the next sync instead of re-duplicated. Never crosses
  modules, never touches a row carrying a different id, each stored row
  claimable once per batch.
- **One-time vault repair** (`KOS.media.dedupeVault(module, cb)` + the
  Sync & Import "Vault maintenance" panel + an automatic flag-gated boot
  pass in main.js, 4 s after start, only when a VNDB sync ever ran):
  clusters rows by external id — or by title where exactly one id-bearing
  cluster shares it — and merges each cluster keeping the UNION of the
  manual layer (routes by name, quotes by text, CG maxima, warnings/tags/
  genres/mood/shelves, notes concatenated, favourite, physical, ids);
  list state follows the freshest copy; an unrated copy never erases a
  rating. Ambiguous same-title-different-id rows are left alone. Safe to
  re-run; the report (titles merged, rows removed) is stored in kv
  `maint.dedupe3h` and shown on Sync & Import. Could not be executed
  against the live vault from this session (the Chrome extension has no
  file:// access), so it runs automatically on the user's next app start.
- **Import mode control** (the requested feature), on AniList anime/manga
  sync, VNDB sync, and the XML import: an explicit picker —
  **Update & add** (default; unchanged merge behaviour) vs **Replace
  everything from this source** (`bulkUpsert` `opts.replace`): entries of
  that module+syncSource that the incoming import no longer carries are
  deleted — UNLESS they hold hand-built data (`mediadb.hasLocalData`:
  physical volumes, routes, quotes, CG counter, warnings, notes, mood,
  shelves, dnf, tags, favourite) or a personal flashcard points at them
  (`KOS.media.protectedCardIds`); those are kept and merely updated, and
  the summary says so ("N removed, M kept because they have your own
  data attached"). Replace asks for confirmation first; manual/other-
  source rows and other modules are out of its reach by construction.
- **Tests**: new `tools/smoke10.test.js` (10 steps) — the regression
  test was written FIRST against the real response shape and failed with
  exactly the user's symptom (`added:2, updated:0` on an identical
  re-sync) before the fix; plus title-claim (claims, backfills, keeps the
  manual layer; never grabs a different id or crosses modules), dedup
  (union merge, re-run is a no-op), and replace mode (bare rows wiped,
  data-bearing rows kept, AniList module parity, plain upsert untouched).
  smoke4/smoke8 panel counts updated for the new maintenance panel.
  **All ten suites pass.**

## Build 3i — 本 Books deepening: Physical/Digital split, lookup, reading sessions, ranked shelves (Claude Code, 2026-07-04)

- **Physical/Digital tab split — navigation only, data stays linked.**
  The Books view now opens with two lens tabs over the SAME vault:
  **Digital 読** (reading progress — every tracked series, grid/list) and
  **Physical Vault 蔵** (entries with owned volumes only, defaulting to
  the bookshelf layout — volume-level detail is its point; grid/list as
  alternatives). A series tracked both ways appears in both; the tab and
  a layout-per-lens are view prefs (`media.books.tab` / `.physLayout`).
  A saved pre-3i `layout:"shelf"` pref migrates to the Physical tab.
  **The owned%/read% comparison did not get buried by the split**: it
  moved INTO the editor as a labelled two-bar panel (`.bk-compare`), so
  every entry detail carries it regardless of which tab opened it — on
  top of the existing dual bar on grid cards (both tabs).
- **External book lookup** (`js/core/bookapi.js` + the ◫ Find book / ISBN
  modal): title search and ISBN lookup that prefill the ordinary add
  form (title/author/cover/isbn13; opened from the Physical tab the
  draft also shelves volume 1 dated today). Goodreads was never an
  option (API dead since 2020). **Live findings, 2026-07-04**:
  - **Open Library is PRIMARY — verified live**: `search.json` answers
    with `access-control-allow-origin: *` for both `q=` and `q=isbn:…`;
    one endpoint, one shape; covers via `covers.openlibrary.org/b/id/`.
  - **Google Books is the FALLBACK — CORS verified live (fine from
    file://), but keyless requests answer HTTP 429 with
    `quota_limit_value: 0`** on the shared anonymous consumer project:
    Google has zeroed keyless Books quota, not throttled it. The client
    implements the documented shape anyway and consults it whenever Open
    Library errors or comes up empty, so it contributes again the moment
    Google re-opens the tap. Both-fail surfaces one combined message.
  - The vault gained `externalIds.isbn13` (canonical 13; ISBN-10 input
    converted; reference-only like steamAppId — no index, nothing syncs
    on it). `bookapi` also carries pure ISBN utilities (clean/validate/
    10→13/pick-from-OL's-mixed-pile), all unit-tested.
- **Barcode scanning** via the native `BarcodeDetector` API, capability-
  detected — never assumed: the scan button only exists when the API and
  `getUserMedia` are both present, `getSupportedFormats()` is checked for
  `ean_13`, camera refusal/absence degrades to a toast, and typed ISBN is
  the always-present baseline (a visible note says so when the API is
  missing). First camera use anywhere in KurenaiOS. **Verified live in
  the user's Chrome 149/macOS: BarcodeDetector present WITH ean_13**, so
  scanning genuinely works here; jsdom (no API) exercises the degradation
  path in smoke11.
- **Reading sessions — the Focus Timer machine reused, not rebuilt**:
  `KOS.focus.start({kind:"reading", …})` runs the exact 2b state machine
  (clock, pause/resume, reload restore, one-session-at-a-time) under the
  Collection Matrix contract: the finished session logs **type "media"**
  (module books, action "reading-session", real measured `dur`,
  optional linked entry), so it feeds the reading heatmap, the rest
  streak and the +4 XP/+1 gold trickle with ZERO extra wiring — and
  never HP or the study streak. Distraction HP nicks are skipped
  wholesale for reading; ending early logs the time with nothing
  forfeited (rest is not study). Started from the Books toolbar
  (⏱ Reading session: minutes + optional in-progress book). Fixed en
  route: the custom-no-break path double-counted the final interval in
  `workSeconds()` (banked into workAccum AND still on the phase clock) —
  study sessions' awards were inflated too; smoke11 pins `dur === 60`.
- **Ranked shelves — shelves extended, not duplicated**: a shelf becomes
  a genuine ordered list via a per-shelf id order in the media kv store
  (`books.shelfOrder`, beside the vault it describes). Selecting a shelf
  applies its order (`KOS.books.applyShelfOrder`, pure: ranked ids
  first, strangers keep their sort); in List layout with no other
  filters the rows grow rank numbers, a drag grip and ▲/▼ (extra
  filters would silently save a partial order, so ranking locks until
  they're cleared; the count line says how). Sort is disabled while a
  shelf is selected — the shelf IS the order.
- **Tests**: new `tools/smoke11.test.js` (25 steps): ISBN utilities,
  both mappers (OL doc pasted from the live response; GB shape from the
  documented format — live re-verification impossible at quota 0, stated
  in the file), provider order + all four fallback branches, the
  schema gate, the reading-session governor boundary (trickle exact, HP
  pinned, streaks split, distraction immunity, study drain still live),
  ranked-shelf maths + kv round-trip + view end-to-end, tab split +
  pref migration + comparison survival, scanner degradation, and the
  lookup→prefill→save pipeline. **All eleven suites pass.**

## Build 3j — 環 Reward-on-Sync, Autonomous Sync, VN Chapters, Profiles, Shop, Season Picker (Claude Code, 2026-07-04)

**One diff-based reward mechanism for both directions, and the sync loop
that makes pressing "Sync now" optional.** The user's real pipeline is
mal-sync → AniList; before this build, progress made there arrived
silently (no reward) and only when a sync button was pressed.

- **Reward watermark (`entry.reward: {progress, volumes, status}`)**:
  gated through `normalise()` like every field; `mediadb.put()/add()`
  absorb it on EVERY local save (all editors, quick-edit, +1 buttons and
  the post-push re-put funnel through them), so the watermark always
  equals the last state the app itself produced. `bulkUpsert` — the pull
  path, which writes raw cursors — compares the final merged list state
  against the stored watermark first (`rewardDelta`), collects events
  into `res.rewards`, THEN absorbs. Progress above the watermark and
  status advances up `STATUS_RANK` reward; a move to dropped never does;
  BELOW the watermark (rewatch/correction) just lowers it — no reward,
  no clawback, re-earning later is accepted and stated. Inserts and null
  watermarks initialise silently, so a first 650-entry sync mints
  nothing.
- **One session per sync, proportional**: sync callers pass
  `res.rewards` to `KOS.media.logSyncRewards` → ONE `type:"media"`
  session (`action:"sync-reward"`, entries/units/advances) per module —
  the games bulk-add precedent, so a catch-up pull can't flood the log.
  The governor prices it `min(4 + units + 3·advances, 60)` XP /
  `min(1 + units/4 + advances, 12)` gold, HP pinned at 0. XML imports
  get watermark absorption but deliberately ignore the reward list.
  **The core correctness property — push followed by an echoing pull
  produces exactly ONE reward — is pinned by smoke12** with a real
  local-edit → put → logActivity → push → bulkUpsert-echo sequence
  asserting zero reward events, zero extra sessions, zero extra gold.
- **Autonomous two-way sync** (`js/core/autosync.js`, started from
  main.js): pulls AniList anime+manga and VNDB every 15 minutes, on the
  browser's `online` event, and when the tab wakes past the interval.
  Each cycle flushes stranded FAILED pushes first (AniList only — VNDB
  browser writes stay behind their CORS wall, and retrying a policy wall
  every quarter hour is noise) so local edits win the last-write-wins
  race after an offline stretch, then pulls in plain update-and-add mode
  (replace stays a manual-only choice). Kill switch + last-cycle report
  on Sync & Import ("Autonomous sync" panel); auth failures toast once
  per session, network failures are silent. Quiet cycles stay quiet —
  only new entries or rewards toast.
- **VN chapters** (`chapters: [{name, status, notes}]`): a user-defined
  layer PARALLEL to routes — never nested in them, never derived from
  VNDB (which has no structured chapter data), never driving progress
  (routes keep that job); most VNs leave it empty. Chapters survive
  sync merges, count as `hasLocalData` for replace-mode protection,
  union by name in `dedupeVault`, and completing one logs a "chapter"
  session (precedence added > status > route > chapter > quote). Editor
  section sits between routes and the CG counter, one row per chapter:
  name / shared-status select / note / delete.
- **AniList profile split into five tabs** (Overview · Favourites ·
  Social · Activity · Notifications) — same single aliased GraphQL
  request, same 5-min cache; the tabs re-render slices of the cached
  bundle and NEVER refetch (smoke12 counts requests across all five).
- **VNDB profile** (`vndbprofile.js`, rail item + ＠ button in the VN
  vault), built from what the Kana API genuinely exposes — verified live
  2026-07-04: GET /ulist_labels (label counts INCLUDING custom labels),
  GET /user (lengthvotes/lengthvotes_sum, response keyed by the query),
  GET /stats (site totals). Plus vault-derived list stats (mean vote,
  routes cleared, chapters done, quotes, estimated hours from VNDB's own
  length data on finished VNs). **What was left out because it doesn't
  exist there**: favourites, followers/following, activity feed,
  notifications — the Kana API has no endpoints for any of them; the
  page states this instead of faking AniList parity.
- **Gold shop made real** (the 2a numbers were flagged placeholders):
  anchor ~15–30 gold per steady study day → big labs 180 (~a week), sims
  100, themes 140, seals 70, frames 90, Matrix cosmetics 80 (2–3 days).
  New: 2 themes (Aoi azure, Sumi inkwash — token-swap pattern like
  kin/shinku), 3 seals (桜雷星), 1 frame (Amethyst orbit), and two new
  cosmetic kinds — **bookshelf skins** (walnut/lacquer/vermilion, a
  class on `.bk-shelves` read from `governor.shelfSkin` at render) and
  **Shrine card styles** (gilded/ink/neon on `.shrine-hall`). Boundaries
  unchanged: cosmetics buyable while strained, labs suspend, HP touches
  nothing, core revision never locks.
- **Season picker** on Seasonal Watching: defaults to today, ‹/›
  step through seasons with year rollover, season+year selects, a Today
  reset that only shows away from home; the palette class follows the
  SELECTED season. Same `extra.season/seasonYear` data, just a different
  filter value — no new data source.
- **Tests**: new `tools/smoke12.test.js` (16 steps): watermark init +
  delta maths, THE push→echoing-pull single-reward property, external
  progress rewarding once + repeat-pull silence, regression/no-clawback,
  mass-import silence, governor proportionality + caps + HP pin, an
  autosync cycle end-to-end (rewards + report + kv stamps), the toggle
  and the online-event trigger, chapters schema/merge-survival/editor
  CRUD, profile tabs off one fetch, the VNDB profile with the honest
  API-gap statement, shop pricing/new kinds/apply classes/strained
  boundaries, and the season picker default + re-filter + palette.
  Stale assertions updated: smoke3 (sim price 90→100), smoke4/8 (Sync &
  Import panel count 7→8), smoke9 (profile content now behind tabs).
  **All twelve suites pass.**

---

## Build 3g — 円 Purchase / Budget Planner (Claude Code, 2026-07-08)

A cross-media wishlist + budget planner spanning Books (physical), Visual
Novels and Games, sitting inside the Collection Matrix but deliberately
OUTSIDE the governor.

- **Shared pool, not per-module limits** (confirmed architecture): one
  `budget.monthlyLimit` in `state.wishlist`; every chart can still break the
  spend down by module (`spendByModule()`) without splitting the limit.
- **Governor boundary held** (confirmed boundary): `wishlist.js` never calls
  `KOS.sessions.log` / `KOS.media.logActivity` and never moves HP/gold/XP or
  a streak — purchasing is logistics, not media engagement, consistent with
  HP never touching leisure. Pinned by smoke14: a full flow (add, edit,
  budget change, purchase, status move, reorder, remove, render) leaves the
  sessions log, HP, gold and XP byte-for-byte unchanged, and fires ZERO
  network requests. New invariant **#5a** in CLAUDE.md.
- **Storage**: `state.wishlist` (localStorage), NOT the media vault — these
  are planning records, not media entries. Rides the standard backup because
  `exportFull` serialises the whole state object (smoke14 asserts it's in the
  serialised state). Added to `store.js` DEFAULTS so `deepMerge` back-fills
  older saves.
- **Core interaction**: three tabs (Want to buy / Waiting for release /
  Purchased). Want-to-buy rows carry checkboxes that SIMULATE a purchase —
  Selected total + Remaining recompute live off `selectedTotal`/`remaining`
  (can go negative → the meter + figure turn crimson). Nothing is spent
  until **Mark purchased**, which archives a snapshot into
  `budget.history[month]` (idempotent, never deletes the item) and feeds the
  charts. Draggable priority reorder within each tab (HTML5 DnD →
  `reorder(status, ids)`).
- **Next-to-drop hero**: on the waiting tab, `nextToDrop()` surfaces the item
  with the nearest UPCOMING manual release date (else most-recent past) as a
  countdown hero, accent-tinted per module.
- **Linking, both directions**: an item's `linkedEntryId` ties it to a vault
  entry via an in-editor vault search picker. Forward — the item shows an
  "⇄ in collection" chip that opens the linked entry. Reverse — `wishlist.js`
  wraps `KOS.mediaEditor` OUTERMOST (loaded after games.js; does NOT reorder
  the game→vn→books→anime chain, invariant #28) and injects an `.wl-onlist`
  "◆ On your wishlist" banner into the vault editor form when the opened
  entry is on the list. Both directions asserted by smoke14.
- **Release dates are MANUAL by design** — stated plainly in the UI, not
  faked automation. Findings (summarised, not re-derived): Amazon PA-API
  needs an approved affiliate account and forbids price-watch use; Keepa is a
  paid per-key subscription; IGDB (games only, no books) needs a Twitch OAuth
  secret a static `file://` app can't hold. So a typed date field is the
  honest answer.
- **UI**: new rail item "Budget Planner" + a "円 Budget Planner" quick-action
  on the Matrix home. Reuses the shared modal / med-form / study-tab /
  cs-chart chrome; ~150 lines of planner-specific CSS appended to main.css.
- **Tests**: new `tools/smoke14.test.js` (17 steps): state init, add +
  defaults + "games"→"game" normalisation + priority append, byStatus/
  forEntry, budget maths incl. over-budget negative, purchase archiving +
  idempotence + two-month history, spendByMonth/spendByModule split,
  next-to-drop upcoming pick, reorder, both-direction linking (forEntry +
  the injected editor banner + no-banner-when-unlinked), the view render,
  the live checkbox simulation, the hero, THE governor boundary (zero
  sessions/activity/HP/gold/XP/network), rail nav, and backup coverage.
  **All fourteen suites pass.**

---

# SNAPSHOT — 2026-07-05 (handoff state)

Written as a deliberate handoff snapshot at the end of the Fable-5 sessions.
Everything above this line is the chronological build log (accurate, keep it);
this section records what was current on its date, not today's backlog. Read it
with the later Build 4/5 addenda and the current "Invariants" section in
CLAUDE.md; later addenda supersede old storage, design and test-count claims.

## Where the project stands

- **Build 1 (content + labs)**: content is DONE — all 156 CS + 89 Maths + 15 IT
  F201 leaves at the IT-2.4 depth bar, correctly keyed, floor-met
  (≥8fc/≥5qz/≥3ex incl 6+, intel). Stage 3 (labs expansion) was **paused, not
  finished** — see backlog item 6.
- **Build 2 (Behavioural Governor)**: COMPLETE. FR categories 1–5 fully
  implemented (sole exception FR-2.9 mind-map = Won't-have). SM-2, sessions
  backbone, HP/gold/XP, calendar, to-do, focus timer, tracker, RAG, stats,
  attachments, resources, help.
- **Build 3 (蒐 Collection Matrix)**: COMPLETE through 3j. All four media
  modules live (Anime deep, Books deep, VN deep, Games manual-by-necessity),
  AniList + VNDB read sync, AniList write-back, reward-on-sync watermark,
  autonomous 15-min sync loop, profiles, shop rebalance.
- **Tests**: 14 smoke suites, all passing (smoke14 added 2026-07-08 for the
  Build 3g Purchase/Budget Planner). Inventory below.
- **Branch**: `build1-completion` (the name is historical — everything lives
  here). Working tree was clean at snapshot time.

## Still owed by the USER (cannot be automated — needs their logins/data)

1. Real calendar dates — the calendar still holds SAMPLE events seeded
   relative to first run. Exam dates especially.
2. AniList API client ID (settings/developer, redirect
   `https://anilist.co/api/v2/oauth/pin`) pasted into Sync & Import — required
   for authenticated sync + write-back. (XML import + public enrichment
   already worked without it.)
3. VNDB personal token ("access to my list"; add "modify my list" for the day
   VNDB unblocks browser PATCH) pasted into Sync & Import.
4. A real AniList **manga** XML export to verify the manga import path against
   (it is tested against the EXPECTED MAL shape only — see rough edge R6).

## PRIORITISED BACKLOG

### 1. Collection Matrix — Purchase / Budget Planner  ← NEXT UP (unscoped)
What exists to build on: `physical.volumes[]` already carries `price` +
`purchaseDate` per volume (Books only); Mangaka pages aggregate spend per
author; the sessions log timestamps purchases indirectly via volume adds.
What a scoping session must decide first:
- **Cross-module or Books-only?** Only Books has price fields today. If games
  /VN purchases count, the shared schema needs a purchase axis added through
  `normalise()` (the single schema gate — see invariants) + a v6 migration.
- **Where budget state lives.** Precedent says media kv store (like
  `books.shelfOrder`) — but note kv is EXCLUDED from the backup JSON, so a
  budget would have no backup. Decide deliberately and state it in Help.
- **Wishlist vs owned**: "planned purchases" likely = entries/volumes flagged
  wanted with an expected price; interacts with the Physical tab and possibly
  `backlogPriority` on games.
- **Governor boundary**: logging a purchase is a media action (+4 XP/+1 gold,
  0 HP, rest streak) at most — a budget must never become a gold source/sink
  (real money ≠ game economy; keep them visually and mechanically separate).
- Charts: reuse `KOS.charts` (bars/heatmap) — no chart lib (standing rule).

### 2. Category 6 — the LLM bridge (FR-6 AI layer)  (unscoped — RESEARCH FIRST)
The plan always said build this LAST with a pluggable `KOS.ai` provider
abstraction (external API / local Ollama / disabled). **A future session must
research before scoping — do not assume any of this works:**
- **CORS from file:// per provider, verified live** (the AniList/VNDB/Steam
  lesson: test, don't assume). Anthropic's API supports browser calls only
  with a special opt-in header; OpenAI blocks browsers; **Ollama at
  localhost:11434 rejects `Origin: null` unless the user sets
  `OLLAMA_ORIGINS`** — which would be a documented manual setup step like the
  AniList client ID. Whichever provider(s) survive this test define the
  feature.
- **RAG-lite grounding approach**: the corpus is already structured —
  `KOS_CONTENT["subject:ref"]` blocks + `intel.js` + the user's own notes/
  attachments. For a per-topic tutor, retrieval may be trivial (current ref's
  content + intel, no embeddings). Cross-topic Q&A needs real retrieval:
  research whether the existing lexical search index is enough, vs
  embeddings (which need either an API or transformers.js — and whether
  transformers.js even loads on file:// with no bundler/script-tag-globals
  architecture).
- **Structured-output reliability**: card/quiz generation needs valid JSON
  matching the KOS_CONTENT schemas. Research: JSON-schema/tool-forcing
  support per provider from a browser; design a validate-and-retry loop;
  decide what happens on repeated failure (never write a malformed card —
  `normalise()`-style gate for AI output).
- **Tutor state machine**: where conversation state persists (localStorage
  rides the backup but is small; IndexedDB doesn't ride the backup — same
  trade-off as attachments); how a tutoring session logs (it should log a
  session for streak/XP purposes, but the pricing must not make chatting a
  gold farm — cap like sync-reward, precedent exists).
- **Key storage**: media-DB kv store, NEVER localStorage (the token
  precedent — keys must not ride into the backup JSON export).
- **Seams already in place**: structured content corpus, per-topic intel,
  attachments in IndexedDB, "Generate with AI" was planned as stubs on
  relevant tabs (not yet built).

### 3. Books extras (scoped in spirit by 3b/3i, deferred)
- **Quotes/highlights for Books**: the VN quote pattern is the template —
  `quotes[]` on the entry, survives merges, counts as `hasLocalData`,
  optional bridge to personal flashcards (`KOS.srs.addCustom(PERSONAL_SID,
  "books", …)` — the sid/ref are opaque strings, so ref "books" beside ref
  "vn" costs nothing; the personaldeck view already handles mixed refs).
- **Series relationship webs**: AniList exposes `relations` edges (prequel/
  sequel/spin-off) — needs an `extra.relations` capture in the manga/anime
  queries + a small graph render. Mind the accepted limitation that Mangaka
  grouping is name-based; relations are id-based and don't share it.
- **Reading pace projections**: the raw data EXISTS since 3i — reading
  sessions carry real `dur` + the sessions log carries progress deltas.
  Projection = chapters-per-week trend → estimated finish date per
  in-progress book. Pure derivation from the log; no schema change needed.

### 4. Build 4 — backend / cross-device sync / PWA / Steam+IGDB proxy (unscoped)
A real server dissolves several documented walls at once: Steam OpenID
verification (all three 3e dead ends are server-shaped), IGDB (needs a
Twitch OAuth secret — server-only), VNDB write-back (proxy around the CORS
PATCH wall), true cross-device sync, PWA installability.
**Hard prerequisite discovered by 3a and still unsolved**: IndexedDB is
ORIGIN-SCOPED — the media vault at `file://` and at `localhost:8137` and at
any future hosted origin are THREE different databases, and the media vault
+ attachments + tokens are all EXCLUDED from the backup JSON. **Before any
origin move, build a full media-vault + attachments export/import** (JSON or
file-based), or the user's 650-entry vault strands on the old origin. This
export is also the only disaster-recovery story for manual VN routes/quotes
and the physical vault — arguably worth building before Build 4 regardless.

### 5. Competitions / Music modules — fully unscoped
Nothing designed, nothing promised. The Matrix schema is module-agnostic by
construction (module string + `normalise()` + shared status/progress/score),
so a fifth module follows the Games playbook: decide axes, add through
`normalise()`, bump the DB version with indexes, build the view on
`KOS.medview` (the shared vault-view toolkit — cover, lazy list, pills,
empty states, editor shell; do NOT copy a sibling view), register the
module's editor in `KOS.mediaEditors` (see invariant #28), add rail +
Matrix card.
Music may have API options (MusicBrainz is CORS-open; Last.fm needs a key) —
verify live before promising sync, per the standing rule.

### 6. Build 1 leftovers — Stage 3 labs expansion (paused 2026-07-01)
From the approved plan, still valid: IT has ZERO interactive tools (Data
Lake→Warehouse ETL flow, MapReduce visualiser, ER/normalisation 1NF→3NF
sandbox, data-cleaning playground, 6 V's interactive); CS gaps (Karnaugh
map, BFS/DFS, A*, Huffman, cache hierarchy, BNF validator, Boolean
simplifier); Maths staircase/cobweb diagrams. Wire via `forRef`/`GENWIRE`.
Plus approved plan §6 extras never built: command palette (Cmd-K),
exam-countdown banner + readiness %, print/export a topic, keyboard-first
flashcard review, `{see:[…]}` cross-ref block.

## ROUGH EDGES / TECH DEBT (noted honestly, none blocking)

- ~~**R1 — README.md is stale at Build 2.1**~~ **RESOLVED 2026-07-13**:
  README now covers the Governor, Collection Matrix, Build 5 design foundation,
  shared image positioning, the real backup boundary and the current test run.
- **R2 — "fully offline" is approximate**: KaTeX and the Google Fonts load
  from CDNs — offline, maths renders as raw `$…$` and fonts fall back.
  Everything functional works offline; the claim should be softened.
- ~~**R3 — no export path for IndexedDB data**~~ **RESOLVED 2026-07-05**:
  `store.exportFull` / `store.importFull` now produce a single combined JSON
  covering localStorage state + all four media vault modules + document
  attachments (blobs as base64). AniList/VNDB tokens are deliberately excluded
  — a backup file may be shared/stored in less-secure locations; the user
  reconnects from Sync & Import after any restore. This is a permanent design
  decision, not a deferred improvement. The Backup & Restore view and Help FAQ
  were updated accordingly. Legacy-format backups (pre-R3) import whatever
  sections they contain and report what was missing. Smoke13 verifies:
  round-trip fidelity for all four modules incl. VN routes/chapters/quotes,
  token exclusion, and legacy-backup graceful handling (13 suites total).
- **R4 — sessions log is CAPPED at 2000 entries** (`CAP` in sessions.js —
  oldest entries fall off on append), so localStorage growth is bounded.
  The flip side: anything reading long-horizon history (heatmaps, streak
  walks, per-day analytics) silently truncates once the log wraps past
  2000 entries. Fine at current volume; an archive would be needed before
  raising analytics horizons.
- ~~**R5 — `state.streak` is a dead legacy field**~~ **RESOLVED 2026-07-09**:
  removed from DEFAULTS along with the never-used `notes` reserve;
  store.js scrubs both from old saves and imported backups on load.
- **R6 — manga XML import is tested against the EXPECTED MAL-export shape
  only** — no real AniList manga export has ever been run through it
  (anime's was live-verified in 3a; manga's wasn't). Verify when the user
  provides one.
- **R7 — VNDB write-back is implemented but dead** behind VNDB's CORS
  preflight (POST/GET/OPTIONS only — no PATCH). The code path is exercised
  only by mocked tests. It self-activates if VNDB ever allows PATCH; until
  then it's shipped dead weight with a good error message.
- ~~**R8 — the `KOS.mediaEditor` wrap chain is load-order-fragile**~~
  **RESOLVED 2026-07-09**: the monkey-patch chain was replaced by a
  registry — vault views register editors in `KOS.mediaEditors`, the
  dispatcher in core/media.js routes on `entry.module` (anime fallback)
  and runs `KOS.mediaEditorHooks` with the modal's overlay element after
  it mounts (wishlist's banner uses this instead of probing
  `document.body.lastElementChild`). Script-tag order between the vault
  modules no longer matters; invariant #28 now documents the registry.
- **R9 — gold economy anchor is still an estimate**: 3j priced the shop off
  "~15–30 gold/day of steady study", which is itself a guess — no real
  long-term usage data has calibrated it. Revisit after real use.
- **R10 — AGENTS.md lagged the build** (tests section listed 3 of 12 suites;
  no Build 3 architecture) — the tests list is fixed as part of this
  snapshot; for architecture, CLAUDE.md is the canonical doc, AGENTS.md
  intentionally stays the thin agent-contract layer.
- **R11 — engine sessions log `dur:null`** for quiz/flashcard sessions run
  outside a focus session (only focus + reading sessions carry measured
  durations). Fine for streaks/XP; means time-based analytics undercount
  non-focus study. Known since 2a; deliberate.
- **R12 — recovery checklist targets are static** (2a note): they don't
  scale with backlog size. Cosmetic.
- **R13 — accepted limitations, restated so nobody "fixes" them into bugs**:
  Mangaka groups by author string as written (no entity resolution);
  Seasonal hides entries without season data; last-write-wins on push/pull
  (no conflict detection); CG gallery is a counter, never images; games are
  manual-entry-only permanently (Steam CORS, three verified dead ends).

## REFACTOR PASS (2026-07-09/10, post-snapshot — audit steps 1–6)

Six commits of debt paydown, all 14 suites green throughout; the notable
structural change is **`js/modules/medview.js`** (audit item A1, RESOLVED):
the single vault-view toolkit the four media views now build on — cover
renderer, lazy batch renderer, status pills, search/sort/layout controls,
empty states, the editor shell (normalised drafts, modal scaffold with
click-outside + Esc close, save/delete tails), the shared +1 bump, and
quickEdit/pushChip (moved out of core/media.js, which is pure domain layer
again). Also landed: `KOS.mediaEditors` registry (R8 resolved),
`core/charts.js`, `KOS.ui.esc`/`debounce`, state scrubbing (R5 resolved),
capped-log doc fix (R4), session-id seeding, validator consolidation.
A FIFTH media module starts from `KOS.medview` + `KOS.mediaEditors` —
never from a copy of a sibling view.

## TEST SUITE INVENTORY (current: 16 suites, `node tools/smokeN.test.js`)

Prereqs: `npm install jsdom` (all), `npm install fake-indexeddb` (4–16).
The release gate is the complete smoke through smoke16 run.

| Suite | Covers |
|---|---|
| smoke | Core engine: store, UI, content render, views load, nav |
| smoke2 | Deep content integrity + engines (every content key → spec leaf, block types, pagination, labs mount) |
| smoke3 | Build 2 governor: SM-2 maths, sessions/streaks, HP/gold/XP economy, gating, calendar, todo, focus timer (8 steps), tracker/RAG additions |
| smoke4 | 3a Matrix core: mediadb schema/indexes, AniList client, XML import, dual-id upsert, 650-scale, HP invariant, rest streak |
| smoke5 | 3b Books: dual-tracking schema, v2→v3 migration, physical vault CRUD, manga sync/XML, merge preservation |
| smoke6 | 3c VN: v3→v4 migration, VNDB client (mocked to live shapes), label mapping, personal flashcard bucket |
| smoke7 | 3d write-back: push eligibility/field-scoping, debounce coalescing, mutation shapes, search-and-add, quick-edit |
| smoke8 | 3e Games: v5 schema, bulk paste-in, analytics, cross-media, run-wide "no request mentions steam" |
| smoke9 | 3f Anime deepening: season calc, extra-merge fix, airing countdown (mocked), heatmap, AniList profile |
| smoke10 | 3h regression: the VNDB duplication bug (REAL /ulist shape), title-claim fallback, dedupeVault, replace mode |
| smoke11 | 3i Books deepening: lookup clients, ISBN utils, tab split, reading sessions (governor boundary), ranked shelves, scanner degradation |
| smoke12 | 3j: reward watermark (THE push→echoing-pull single-reward property), autosync cycle, VN chapters, profile tabs, shop, season picker |
| smoke13 | R3 backup/restore: mediadb exportAll/importAll (all four modules incl. VN routes/chapters/quotes), attach importAll + metadata, store.importFull (v2 + legacy v1), token exclusion, end-to-end round-trip |
| smoke14 | 3g Purchase/Budget Planner: budget maths, release-day grace + hourly same-date rotation, allowance ledger/modal, thresholded history, Book physical/VN/Game local handoff, both-direction vault linking, drag order, THE governor/network boundary |
| smoke15 | Build 4 UI overhaul: token/theme contracts, Study Hall inspector, vault hero, overlay cards, Planner top row, Governor bento and games/VN zero-network boundary |
| smoke16 | Build 5 image positioning (18 steps): one cropper/render contract, source-space focal maths, reset/cancel/error recovery, legacy centred fallback, Governor/media/volume/wishlist/profile persistence, DB v7 source-paired crops and full-backup/token boundaries |

Suite-hygiene notes: smoke6's /ulist mocks were the source of the 3h bug
slipping through (they invented a nested `vn.id` reality never sends) — when
mocking an API, mock the LIVE-verified shape, and say in the file when a
shape could not be live-verified (smoke11 does this for Google Books).

---

# BUILD 4.0 ADDENDUM — 2026-07-11 (UI/UX overhaul, "Void")

The full-app visual overhaul specified in `design (1).md` (v2). All 15 smoke
suites green (smoke15 is new — it guards the overhaul's new markup).
This section is historical: Build 5 later replaced Linear Void as the default
with The Atelier while keeping the theme and class contracts described here.

## What shipped

**1 · Colour system — full replacement.** Default theme is **Linear Void**
from the theme lab: pitch black `#020305`, violet `#8C7CFF`, cyan `#35D7FF`,
plus a genuinely bright red `#FF2E44` as the third signal colour (not a
crimson callback). Treatment: flat void background (petal flora retired),
thin text-derived hairlines, theme-keyed radii, near-zero glow. The token
architecture is two-layer: canonical tokens (`--bg0/--bg1/--panel3`,
`--accent/-2/-3`, status trio, `--theme-r`) that themes override, and derived
aliases (`--kurenai`, `--gold`, `--bad`, lines, radii, glass) that everything
else consumes — so 2,500 lines of components and every inline style survived
unchanged. Old crimson's brand/danger double-duty was split: violet = brand,
bright red = danger (wrong answers, critical HP, exam chips, HP bar).
**The 23 remaining lab themes are Gold Shop cosmetics** (140 gold each, same
CATALOG mechanism, swatch previews on the cards). Theme CSS lives in
`:root[data-theme="<id>"]` blocks — they must target `:root`, not `body`
(derived tokens are computed at `:root`; the body version silently no-ops).
Retired kin/shinku/aoi/sumi ids fall back to the default in `applyCosmetics`.

**2 · Kanji dial-back.** Held at the app's existing restrained level
(wordmark + a few functional markers); the mockups' pervasive kanji language
was deliberately not adopted.

**3 · Study Hall.** Fable's segmented tab bar (`.study-tabs` restyled, class
contract intact — governor/wishlist/profile tabs inherit it). Topic pages are
a two-pane `.study-grid`: content column + the **study inspector** (Sol's
mastery % / recall record / next review info) as a genuinely collapsible
panel persisted in `ui.inspectorOpen`. Subject overview gained Sol's
per-paper/coursework `.subject-units` breakdown. Tree kept, reskinned by
tokens. Crisp seal (no rotation).

**4 · Collection Vault.** Card grid info now **overlays the cover art**
(AniList's pattern) — pure CSS, markup unchanged; quick-edit reveals on
hover/focus. **Vault hero** (`medview.heroCard`): a user-selectable spotlight
per module over a genuine banner image. `AniList Media.bannerImage` was
**verified live** (separate field from `coverImage`) — now pulled with every
list sync into `extra.bannerImage`, with a read-only `fetchBanner` lookup for
older synced entries; VNDB **verified to expose no banner** (image +
screenshots only) → VN is user-upload only, as are games (manual-only) and
books. Selection + uploads live in media kv (`hero.<module>`) — no schema
change. Auto-spotlight = most recent in-progress entry. **Purchase Planner**
restructured to the original Kurenai manga-tracker reference: always-on
Next-to-Drop hero + Budget Summary panel (limit, spent/sim/remaining, meter,
items·upcoming·total-list counts) side by side above the tabs.

**5 · Governor.** Status tab is the Fable bento: identity (rank ladder,
level, XP-to-next), vitals (HP / gold-toward-cheapest-unlock / XP), edicts
(reuses `todo.panel`), streak + week dots, countdowns, 16-week heatmap with
side stats, session ledger. Recovery checklist goes full-width when strained.

**Fixes along the way:** subject views' `--accent` on `#main` leaked into
every later view (vault bars tinted by the last-visited subject) — `KOS.show`
now clears it.

## New invariants (also in CLAUDE.md #26a/#26b/#30)
- Never hard-code palette hexes; ride the canonical/derived token layers.
- Theme blocks target `:root[data-theme]`, applied to `<html>`.
- Hero state in media kv only; banner fetches only for `syncSource:"anilist"`;
  games/VN vaults stay zero-network (smoke15-asserted).

## Verification
- smoke1–15 all green, 2026-07-11.
- AniList `bannerImage`: live introspection + real query (One Piece id 21
  returned a real banner URL) — confirmed as expected.
- VNDB `/vn`: schema + live query show `image`/`screenshots` only — no banner.
- Shop mechanism accepted all 23 themes with zero structural change (one
  CATALOG swap + swatch rendering); buy/apply verified in-browser and in
  smoke12/15.

## Not done / future
- Charts and canvas rings use new-palette literal hexes — they don't retint
  per theme (CSS-var-driven SVG fills would fix this; low priority).
- The general-purpose wishlist/finance tracker stays explicitly out of scope
  (design.md §5) — its own future build.

---

# BUILD 5 FOUNDATION ADDENDUM — 2026-07-13 ("The Atelier")

This foundation pass consolidates the visual language used by later page work
and adds one non-destructive image-positioning path. It does not flatten Study,
Collection and Governor into the same page; their compositions remain distinct
while shared elements now use shared rules.

## Visual-system foundation

- `css/main.css` now documents the canonical 4px spacing scale, page/content
  widths, 58px topbar, sidebar/inspector sizes, heading type, card/elevation,
  controls, tabs, stat tiles, grids, empty states, modal geometry and the core
  1240/1080/860/560px responsive tiers.
- The current default is Atelier Dawn: warm parchment, sepia ink, dusk iris,
  brass and sage, driven by canonical tokens with legacy aliases retained for
  compatibility. The 23 shop theme blocks still target `:root[data-theme]`.
- Normal image heroes use the Collection-derived shared system:
  `--hero-min-h:240px`, `--hero-pad-block`, `--hero-pad-inline` and
  `--radius-hero`, with responsive reductions at compact widths. Governor
  Status deliberately keeps its own identity/profile-banner composition.

## Shared image positioning

- New `js/core/imagecrop.js` exposes one `KOS.imageCrop` contract:
  `value`/`normalise`, `apply`/`image`/`background`, whole-frame
  `prepareFile`, and `open` for the shared modal. The modal previews the final
  aspect ratio, supports upload or URL where the owning editor already allows
  it, zoom, horizontal/vertical sliders, pointer focal selection, centre,
  reset, cancel and save.
- Sources remain URLs or whole-frame resized/compressed data URLs. A sibling
  crop `{x,y,zoom}` (0–100%, 0–100%, 1–3×) controls the visible frame; saving a
  crop never overwrites the source with a canvas cutout.
- The workflow is reached through existing intentional edit surfaces: the
  Governor identity/avatar controls, vault hero banner action, media/wishlist
  editors and connected-profile toolbars. No edit button was stamped onto
  every rendered hero or cover.

## Persistence and compatibility

- App identity: `governor.avatar.crop` and `governor.bannerCrop`.
- Media DB v7: entry `coverCrop` and `physical.volumes[].coverCrop`; remote
  pulls preserve local positioning. Positioned synced entries also retain
  `coverCropSource`, pairing coordinates to the exact artwork so a refreshed
  remote URL cannot inherit a crop chosen for another image. This display
  metadata is normalised but intentionally unindexed because no filter queries
  it.
- Vault heroes: `hero.<module> = {entryId,banner,crop}`. AniList's verified
  remote `extra.bannerImage` and its attribution/source path are left intact;
  VN and games retain their zero-network, user-upload-only boundary.
- Connected profile visuals: account-keyed `profile.anilist.<viewerId>` and
  `profile.vndb.<userId>` media-kv records. Purchase Planner items retain
  `coverCrop` in `state.wishlist`.
- Missing crop metadata renders centred at 1×, so existing URLs and data URLs
  remain valid after reload/import. Earlier destructively cropped avatar,
  banner or volume data URLs cannot regain pixels already discarded; the new
  system can position that surviving image, and new uploads retain the whole
  frame.
- Full backup/restore carries local state, media entries, profile/hero visual
  kv and attachments. AniList/VNDB tokens remain deliberately excluded.

## Test coverage

`tools/smoke16.test.js` is the dedicated 18-step release guard for crop
normalisation, source-space focal maths, shared rendering/modal behaviour,
legacy fallback, state/DB persistence, the v7 migration and backup/token
boundaries. All sixteen suites passed on 2026-07-14.

`tools/visual_audit.mjs` then drove the running app in Chrome at 1440×900 and
980×800: avatar save/reset/cancel and failed-upload recovery; Collection hero
and nested cover-editor flows; AniList/VNDB profile actions against deterministic
fixtures; Matrix cover clipping; reload; real full backup/restore; and overflow
checks on Home, Study, Collection, Governor and Archive. It also verifies the
Collection archive-first hierarchy and Planner/Sync back/forward paths. The
live audit passed and its screenshots were inspected before this stage was
marked complete.

## Collection navigation hierarchy (2026-07-14)

- **Archive-first primary navigation**: Collection now keeps only Overview,
  Anime, Books, Visual Novels, Games and Shrine in its main bar.
- **Two primary workspaces**: Planner and Sync sit beside the archive tabs.
  Their existing specialised pages render secondary tabs directly: Budget
  Planner/Goals and AniList/VNDB/Sync & Import, with no intermediate cards.
- **Navigation contract retained**: child routes keep their owning primary tab
  active, add Collection breadcrumbs, and use `KOS.show()` for secondary tabs
  so back/forward restores the selected page. Smoke9 and smoke14 cover these
  paths.

## Integration workspace overhaul (2026-07-14)

- **One integration language**: Sync & Import begins with matching AniList and
  VNDB provider panels: identity, connection state, account, last successful
  sync, vault count, mode and actions are visible without opening technical
  detail. Technical explanations and item-level write history are disclosures.
- **Profile hierarchy**: AniList and VNDB retain their real tabs and data, but
  now share compact standard-height banner identity headers, fitted avatars and
  divider-led content sections rather than nested card stacks.
- **Profile refinement**: both profiles use one concise refresh/edit/vault/sync
  action row with a quiet fetched timestamp. VNDB labels are metric tiles with
  their label colour used as an accent; AniList adds a dedicated responsive
  Analytics tab for both anime and manga rather than crowding the overview.
- **Ledger integrity**: manual sync remains one deliberate reward event;
  `KOS.media.logSyncRewardBatch()` makes a multi-provider autosync cycle one
  Governor ledger entry. Smoke4 verifies disconnected/connected/loading/success/
  failure states; smoke12 verifies batch shape.

## Study Compare Topics workspace (2026-07-14)

- **Structured comparison, not split articles**: the Study dashboard's Compare
  Topics action now opens one cross-subject workspace. Topic A/B selectors,
  swap and close stay together; two persistent summary headers surface reference,
  title, subject/section, completion, confidence, mastery and available cards /
  questions.
- **Six aligned modes**: Overview, Specification, Notes, Key terms, Exam focus
  and Progress render collapsible A/B rows with bounded reading widths. Shared
  terms, cross-subject state, uneven question coverage and absent content are
  explicit. On narrower desktops the rows stack rather than becoming unreadably
  narrow.
- **Study actions preserved**: either topic opens through `KOS.show("ref")`; focus
  actions use the existing Focus Timer; a pair-keyed comparison note saves under
  `state.study.compareNotes` and therefore remains compatible with regular
  backup/restore. No mixed quiz control was added because the application has no
  mixed-quiz engine to route it to.

### Comparison workspace correction (2026-07-14)

- The modal now has one explicit scroll body; its header, tab bar and action row
  never compete with the content scroll. Long note rows cannot flex-shrink or
  hide their lower content.
- Notes are paired by their existing `{page:"…"}` sections and collapse after
  the first pair, so uneven topic lengths remain navigable instead of becoming
  two unbroken articles. Structured callout bodies now feed summaries, terms and
  misconception rows.
- Open Topic uses the reference route's `subject` contract; Focus Topic preloads
  the existing Focus Timer's subject/ref selectors without overwriting the last
  saved configuration until a session starts.

## Help & Guide documentation desk (2026-07-15)

- The in-app manual now uses a three-part wide-screen workspace: sticky section
  navigation, a 760px reading column and a practical context/shortcut rail.
  Search spans the working area without making prose lines too long; compact
  widths remove the context rail before hiding the section navigation.
- Every help topic has an addressable `#help-…` anchor, native-button accordion
  semantics and search-safe keyboard behaviour. Relevant entries offer direct
  links into the active Home, Study, Governor, Collection, Sync and Data routes.
- Collection terminology now matches the archive-first navigation and the
  current Planner, Sync, Analytics and profile layouts.

## Budget Planner release desk (2026-07-15)

- The Planner is now a release-aware purchase desk instead of a row of summary
  boxes. Its larger crop-aware feature card follows the shared image-positioning
  contract and keeps the next drop visible on release day plus the next full
  calendar day. After that grace period, it automatically returns to Want to
  buy; multiple items with the same release date rotate hourly without storing
  cosmetic state.
- The companion vertical allowance ledger keeps the practical figures together:
  monthly allowance, committed/planned wishlist value, actual spent and
  remaining. Checked Want-to-buy entries are explicitly described as a
  temporary scenario, not a charge. The monthly limit now changes through the
  existing modal shell rather than a permanently visible numeric field. Currency
  locks once a priced item or purchase exists, because the Planner deliberately
  has no hidden FX conversion or misleading amount relabelling.
- Want to buy, Waiting for release and Purchased retain their real behaviours,
  priority drag ordering and linked-entry controls, but now render as responsive
  queue rows with searchable/sortable views. Long titles and compact desktop
  widths no longer force the action cluster outside the row.
- Purchase history now states what it is measuring (actual spend rather than
  wishlist value) and only renders month/module charts after at least three
  purchases form a useful comparison. Before then, its empty state says exactly
  what further activity will unlock.
- Confirmed purchases still archive synchronously before any bridge work. A
  local-only Collection handoff then creates an unlinked Book as a physical
  volume record, or an unlinked VN/Game as planned; linked Books add the chosen
  physical volume and existing VN/Game progress is never downgraded. No title
  matching, provider request, media push, Governor session, XP, gold or HP is
  involved. Failed handoffs preserve the purchase/history and expose a retry.
  Editing an archived purchase refreshes its planner snapshot; reverting or
  deleting it removes that planner spend without destructively removing a
  Collection record already created through the handoff.
- `tools/smoke14.test.js` now has 33 deterministic planner checks for the
  lifecycle, rotation, ledger/modal, archived-record consistency, local handoff
  and boundaries. The live
  Chrome audit verifies the release desk, an actual purchase/handoff, responsive
  queue rows, charts and budget modal at 1440px and 980px.

## Generated spec-data layout (2026-07-15)

- `compsci.js`, `maths.js` and `it.js` now use a stable two-space JSON layout:
  section, child, content and guidance boundaries are directly editable instead
  of being compressed into three long assignment lines.
- `tools/gen_data.py --format-existing` is the supported layout-only generator
  path for a checkout without the original PDF extracts. It parses the existing
  assignments and re-emits the same JSON payload, preserving the manually
  authored Computer Science NEA section rather than risking a blind re-extract.
- Before/after canonical JSON SHA-256 values matched for all three trees; the
  generated JavaScript was syntax-checked and the complete smoke suite remains
  the regression gate.

## Study and Productivity navigation (2026-07-15)

- The rail now distinguishes **Study** from **Productivity**. Study keeps the
  three subject dashboards, a consolidated Review destination and Exams &
  Papers; Productivity owns Focus Timer, Calendar and Tasks & Habits.
- Review composes the existing Due Today queue and Card Stats dashboard beneath
  the shared secondary workspace tabs used by Collection Planner and Sync. The
  `due` and `cardstats` routes remain compatibility entries, so launch actions,
  history navigation and saved view state retain their established behaviour.

---

# BUILD 4a ADDENDUM — 2026-07-16 (Supabase multi-device sync)

Cloud replication over the existing offline-first storage. Nothing local
changed owners: localStorage + the two IndexedDB stores remain the primary
write path; Supabase mirrors them per authenticated user. Auth (email +
password, confirmation disabled → immediate session) gates SYNC ONLY — the
app never blocks on it and runs unchanged with no configuration at all.

## Configuration convention (new — the repo had none)

- `js/env.example.js` (committed, names only) → copy to `js/env.local.js`
  (gitignored) holding `window.KOS_ENV = {SUPABASE_URL, SUPABASE_ANON_KEY}`.
- The publishable key ships in the browser BY DESIGN; RLS is the boundary.
  No service-role key exists anywhere in the repo — keep it that way.
- `js/vendor/supabase.js` = supabase-js 2.110.6 UMD (pinned, vendored).
  Both files load with `defer` so the jsdom suites skip them and a missing
  env file is a harmless 404.

## Schema (supabase/migrations/20260716000001_kos_sync_init.sql)

- `kos_state` — one jsonb doc per user (mirrors the R3 export; document-level
  last-write-wins, stated trade-off), `kos_media` — one row per vault entry
  keyed `(user_id, entry_id=syncId)` + `(user_id, module)` index, `kos_files`
  — attachment metadata only (`meta_json` addition carries subject/ref/note;
  `binary_uploaded` tracks explicit uploads). All tables: `deleted` tombstone
  column, server-time touch trigger on `updated_at`, RLS owner-only policies
  (select/insert/update/delete). Private storage bucket `kos-attachments`,
  objects under `<uid>/<fileId>/<safeName>`, ownership from `auth.uid()` and
  the path — never a client-supplied id.

## Local schema changes

- Media DB **v8**: `syncId` UUID on every entry — minted in `normalise()`,
  preserved through every merge, backfilled in the same single cursor pass as
  the v3 module migration (two concurrent upgrade cursors race; smoke5 caught
  it). Files DB **v2**: `fileId` + `updatedAt` + index, backfilled.
- Deletion tombstones queue in media kv (`cloudsync.pendingDeletes`,
  `cloudsync.filesPendingDeletes`) from every delete path; `cloudsync.*` kv
  keys are excluded from backups (stale watermarks must not travel).
- `store.snapshotFull()` extracted from `exportFull` — the R3 serializer now
  has one representation shared by backup export and cloud migration;
  `replaceState()` shared by importFull and remote-state apply.

## Engine (js/core/cloud.js + js/core/cloudsync.js + js/modules/cloudui.js)

- Dirty detection is DERIVED, skew-proof: entry `updatedAt` vs recorded
  `cleanLocal`, state hash vs `lastPushedHash` — no client-vs-server clock
  comparison anywhere; all remote timestamps are trigger-generated.
- Cycle = push (state, media tombstones, media, file tombstones, file
  metadata) then pull (state, media, files), on: 5-min interval, `online`,
  visibility/focus past a 60 s gap, debounced change nudges from
  `store.save()`/mediadb/attachments, and manual Sync now. Echo-free by
  fingerprint (recorded `updated_at`), re-entrant-safe, offline-tolerant.
- First-link matrix: empty/empty links silently; local-only waits for the
  explicit "Upload local data" confirmation (R3-snapshot validated, retryable,
  idempotent); remote-only auto-adopts onto the empty device; both-sides
  merges media per entry (syncId → external id → title+module adoption, newer
  copy wins, no duplicates) and asks which STATE document to keep. An empty
  remote can never silently destroy meaningful local data.
- Reward neutrality: pull-applies absorb the reward watermark via
  `mediadb.put/add`; zero sessions, zero governor movement (smoke17-asserted).
- Attachments: metadata auto-syncs; binaries upload only via "Sync files
  now" (per-file ⇣ download for cloud-only records); deleting an attachment
  tombstones the row and removes its storage object.
- Restore re-baseline: `importFull` → `noteRestore()` → next cycle re-pushes
  everything and tombstones remote rows the backup no longer carries.
- UI: persistent topbar chip (Synced / Syncing… / Changes pending / Offline /
  Signed out / Action needed / Error—tap to retry — real sync state, not
  connectivity) + the Archive "Account & Cloud Sync" card (sign-up/in/out,
  link decisions, Sync now, Sync files now, plain-language sync semantics).

## Environment variables

| Name | Where | Purpose |
|------|-------|---------|
| `SUPABASE_URL` | js/env.local.js (gitignored) | project URL, browser client |
| `SUPABASE_ANON_KEY` | js/env.local.js (gitignored) | publishable key, browser client (RLS-bound) |

## Test coverage

- `tools/smoke17.test.js` — 17 steps over a mocked Supabase boundary: v8
  syncId schema + merge identity, tombstone capture/backup exclusion, the
  push/pull/echo-freedom property, remote tombstones, the empty-remote-state
  guard, document LWW, the three interactive first-link cases, attachment
  metadata-vs-binary boundary + no-duplicate uploads + delete semantics,
  cloud-only download, restore re-baseline. All 17 suites green 2026-07-16.
- `tools/cloud_integration.mjs` — live auth + positive/negative RLS +
  storage-ownership verification (run after the migration is applied).

## Build 4a verification evidence (2026-07-16)

- **Migration applied**: `supabase db push` → local `20260716000001` = remote
  `20260716000001` on project `pdogeklnbaolnccqricb` (KurenaiOS, eu-west-2,
  Postgres 17). One dashboard change was needed first: the Email auth
  provider was disabled project-wide (distinct from confirmation) — enabled
  by the user, confirmation left off.
- **Live integration** (`tools/cloud_integration.mjs`): 22/22 — immediate
  sign-up sessions; positive RLS on all three tables; NEGATIVE RLS (user B
  sees zero of A's rows, cannot insert-as or update A; bare anon key reads
  nothing); server-generated monotonic `updated_at`; storage upload/download
  under own path, B denied read AND write on A's path. Two throw-away users
  (kos.test.a/b.…@example.com) remain in Authentication → Users; delete from
  the dashboard at leisure.
- **Browser verification** (Chrome, app served on `127.0.0.1:8899` — a fresh
  origin so the real `file://` vault was never touched; throw-away account
  kos.test.browser.1@example.com): chip renders Signed out → sign-up with
  immediate session → **localOnly** first-link ("Action needed" chip, Archive
  prompt, confirm modal, upload) → Synced; local edit → **Changes pending** →
  auto-push (remote doc advanced, edit present); simulated device-B remote
  write → cycle pulls and applies it; simulated offline (navigator.onLine
  shadow + events) → **Offline** chip, local save intact, reconnect pushes
  the offline edit; media entry pushes within the debounce (after the
  mediadb noteCloud fix below); reload restores the session straight to
  Synced; sign-out leaves the app fully navigable; a wiped-vault re-sign-in
  ran the **both** flow and "Use the cloud copy" merged media (cloud
  identities adopted, no duplicates) and applied the cloud state.
- **Fix found by verification**: pure media mutations relied on the interval
  cycle (up to 5-min latency) — `mediadb` add/put/remove/bulkUpsert now nudge
  `cloudsync.noteChange("media")` like store.js and attachments do. All 17
  suites green after the change.
- **Environment quirk noted**: a password-manager extension intercepts focus
  on the password field under automation; sign-up was driven through the same
  `KOS.cloud.signUp` call the button makes. Real-keyboard entry should be
  re-checked once by hand.
- Not exercised live (covered by smoke17/integration instead): the hostile
  empty-remote-state guard, attachment binary upload through the real file
  picker, and a provoked network error on the chip's retry path.
- PWA (4b) and Steam/IGDB (4c) NOT started, per instruction.

---

# BUILD 4b ADDENDUM — 2026-07-17 (PWA + mobile adaptation)

## PWA technical layer

- `manifest.webmanifest` (standalone, Atelier Dawn colours, id/scope `./`)
  with icons generated from the brand seal by `tools/gen_icons.mjs` (192,
  512, maskable-512, apple-touch-180 — headless-Chrome canvas, no image
  toolchain). index.html gains the install metadata and
  `viewport-fit=cover`; `js/core/pwa.js` keeps `theme-color` in step with
  the active shop theme.
- `sw.js` (versioned `kos-4b-1` — bump on deploy): precache DERIVED from
  index.html's own tags at install (cannot drift; a missing gitignored
  env.local.js is tolerated); same-origin statics stale-while-revalidate;
  navigations network-first with the cached shell as offline fallback;
  fonts/jsdelivr in a runtime cache; Supabase/AniList/VNDB/book APIs and all
  non-GETs never intercepted. Old kos-* caches cleaned at activate.
- SAFE updates: no skipWaiting at install; pwa.js watches `updatefound` and
  offers "Reload now" — only that confirmation posts SKIP_WAITING, then
  reloads on controllerchange. First install controls silently.
- `navigator.storage.persist()`: once, on `appinstalled` or first cloud
  sign-in; result logged, never claimed as immunity. Background Sync is a
  progressive enhancement (SW `sync` event nudges open pages to run a cloud
  cycle; the tag registers while changes are pending) — correctness stays on
  cloudsync's online/boot/focus/manual retries. Help gained "Install as an
  app (PWA)" with the four honest storage facts.

## Mobile adaptation (≤700px tier + pointer:coarse, desktop untouched)

- Rail → fixed bottom tab bar (glyphs + small labels, active top-strip,
  safe-area padding); `#main` reserves space above it. Spec tree → drawer
  over a scrim, driven by the EXISTING `ui.treeClosed` state — phones just
  default it closed (hub.js `applyTreeCollapsed`); collapsed it renders as a
  floating "Spec spine" pill above the bar. Subnav scrolls horizontally.
- Modals and the confirm dialog render as bottom sheets (safe-area padded,
  `100dvh`-bounded). Inputs hold 16px at phone widths (kills iOS focus-zoom);
  `pointer: coarse` bumps button/tap-target minimums. Topbar: safe-area
  insets, compact HUD (bars hidden ≤700), nowrap sync chip, forward arrow
  hidden.
- `tools/mobile_audit.mjs` (CDP + device-metrics emulation): 23 views ×
  iPhone 390×844 and iPad 820×1180 — ZERO horizontal overflow on every view;
  screenshots (incl. drawer open/closed and the bottom sheet) inspected.
  Fixes that came out of the audit: sync-chip wrap collision in the phone
  topbar; HUD bar column too wide at 390px.

## Verification

- `tools/smoke18.test.js` (9 steps): manifest validity + real PNGs, install
  metadata, SW parses with all five handlers, skipWaiting only in the
  message handler, no API host in the CDN cache list, non-GET pass-through,
  precache derivation matches every local tag in index.html, pwa.js inert in
  jsdom, phone-tier CSS contract. All 18 suites green 2026-07-17.
- Desktop PWA behaviours (registration, offline shell, update flow) verified
  on localhost Chrome; **localhost testing is NOT proof of iPhone Safari
  behaviour** — see the manual checklist below, which runs against the
  hosted deployment once hosting is chosen.

## Manual iPhone Safari checklist (post-deployment — NOT yet performed)

1. Open the deployed HTTPS site in Safari; browse two or three views.
2. Share → Add to Home Screen; confirm the 紅 seal icon and "Kurenai" name.
3. Launch from the Home Screen; confirm standalone presentation (no Safari
   chrome; topbar clears the notch; bottom bar clears the home indicator).
4. Sign in to cloud sync; confirm the account's data adopts onto the phone.
5. Close the app fully, reopen — session and view state restore.
6. Enable Airplane Mode; open the app (shell loads offline), make a study
   edit, confirm the chip shows Offline/Changes pending.
7. Reconnect; confirm the edit reaches another device (chip → Synced).
8. Leave the app installed across a deploy; on next launch accept the
   "Update ready" reload; confirm all local data survived the update.
9. Attach a small file on desktop, "Sync files now"; on the phone confirm
   the metadata row appears with the ⇣ download action, and download it.
10. Export a full backup from the phone (share sheet) and re-import it.

## Hosting

- Options analysis + recommendation delivered at the Build 4b checkpoint;
  NO deployment-specific configuration implemented yet. The user's
  switch-over preconditions stand: successful cloud sync from file://, a
  fresh R3 backup, and verified cloud restore on the hosted origin first.

## Build 4b deployment + hosted verification (2026-07-17)

- **Live**: https://kurenai-os.pages.dev — Cloudflare Pages, direct upload
  via `tools/deploy_pages.sh` (stages 86 runtime files into gitignored
  dist/; js/env.local.js ships from disk, never committed; dev material
  guarded out; deploys pinned to the production branch). No custom domain
  at this stage, per decision. Free plan; no paid configuration requested.
- **Hosted origin verified live**: HTTPS boot, SW active (registration scope
  /), 84-file precached shell, manifest 200, cloud configured. A throw-away
  account (kos.test.hosted.1@…) signed up on the hosted origin, uploaded
  data, was wiped, signed back in → REMOTE-ONLY AUTO-ADOPTION restored both
  the study state and the media entry with the chip at Synced — the cloud
  restore path the user's real account will take.
- **Safe-update flow proven in production**: three successive deploys left
  the old worker controlling the page (by design) with new versions waiting;
  accepting the update (SKIP_WAITING) activated kos-4b-3 and the activate
  handler removed every older kos-* cache. sw.js VERSION now kos-4b-3.
- **Fixes shaken out by the hosted verification** (both in
  cloudsync.stateMeaningful): boot-lazily-created default progress records
  and the 4 seeded SAMPLE calendar events counted as "meaningful local
  data", so a brand-new device classified as "both sides have data" instead
  of auto-adopting. Now only touched progress (status/note/checks/rag) and
  non-SAMPLE events count. All 18 suites green after both.
- Remaining for the user: sign in at kurenai-os.pages.dev with the real
  account (fresh device → auto-adopt), then the real-iPhone Safari checklist
  above against the live URL. Test users kos.test.hosted.1@example.com (and
  any earlier kos.test.*) can be deleted from Supabase Auth at leisure.

## Build 4b closure notes (2026-07-17, post-approval)

- Hosted desktop AND real-iPhone Safari checklists completed by the user —
  passed. Build 4b approved.
- **DEFERRED: dedicated mobile UX pass.** The ≤700px tier is usable and
  verified overflow-free, but a polish pass (per-view mobile compositions,
  gesture affordances, denser vault cards, mobile-first editor flows) is
  deliberately deferred. The priority remains a complete and stable DESKTOP
  application; Build 4c must not broaden into mobile redesign.
- **Ongoing deployment workflow** (also in CLAUDE.md): `git push` does NOT
  update the live site — `tools/deploy_pages.sh` is the only production
  deployment path (staging safety checks + direct upload). Before every
  deploy: full smoke gate green, staging checks pass, `sw.js` VERSION
  bumped; installed clients switch only via the safe-update offer.

---

# BUILD 4c ADDENDUM — 2026-07-17 (IGDB search + verified Steam import)

Local implementation complete; server deployment pending user approval.

## Server (supabase/functions/ + migration 20260717000001)

- `igdb-search`: authenticated POST {query, platform?} → normalised results
  (title, release date, genres, platforms + app-enum guess, cover, publisher,
  igdbId). Twitch client-credentials token cached in-instance, refreshed on
  401; query length/result caps; 503 with a plain message when unconfigured.
- `steam-auth` (verify_jwt=false — Steam's redirect can't carry a JWT; every
  POST action validates the JWT itself): begin mints a single-use 10-minute
  nonce BOUND to the authenticated user; the GET callback consumes the nonce
  first, POSTs the whole assertion back to Steam with check_authentication
  SERVER-side, requires is_valid:true + our return_to + the strict 17-digit
  claimed_id, then stores the SteamID in kos_steam (service-role only; the
  browser can only read its own row). status/unlink actions round it out.
- `steam-owned-games`: reads the VERIFIED kos_steam row for the JWT's user —
  no request body is parsed at all, so a client-supplied SteamID is
  structurally impossible — calls GetOwnedGames with the server-held key,
  returns normalised {appId, title, playtimeHours}; private profiles get a
  specific actionable message.
- `_shared/cors.ts`: permissive CORS (auth is the boundary; file:// sends
  Origin null), JWT→user validation, service-role REST helper. Runtime env
  verified against the docs, not assumed: accepts both the legacy
  ANON/SERVICE_ROLE vars and the new PUBLISHABLE/SECRET_KEYS lists.
- Secrets: STEAM_API_KEY, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET,
  PUBLIC_APP_URL — `supabase secrets set` only; never in repo/client/logs.

## Frontend

- `js/core/gameapi.js`: functions.invoke wrapper; without cloud sign-in every
  call explains instead of fetching. IGDB/Steam traffic happens ONLY on
  explicit user action.
- Find new (⊕) on the Games vault → the shared mediasearch modal's new game
  branch (IGDB); adds are LOCAL-only, syncSource "manual", igdbId in extra
  for dedupe (by id, then exact title), fully hand-editable.
- ◆ Steam panel: link (server-verified) → mandatory review/selection stage →
  `KOS.games.applySteamImport`: new drafts, gap-fill only (playtime when
  null; appId adoption onto id-less same-title rows), same-title-different-id
  rows skipped (no dupes, no clobber), ONE governor session per import and
  none for a no-op. Manual entry + bulk paste remain the untouched baseline.
- Sync & Import Games panel rewritten: manual baseline + the 4c server-
  verified reality (the 3e browser conclusion still stated).

## Verification so far

- smoke19 (11 steps) covers the client boundary + merge law + Edge Function
  source contracts; smoke8's games panel step re-scoped (browser still never
  calls Steam directly — now asserted as steamcommunity/steampowered URLs).
  All 19 suites green 2026-07-17.
- NOT yet done (awaiting approval + credentials): kos_steam migration push,
  secrets set, `supabase functions deploy` ×3, live verification
  (unauthenticated rejection, IGDB search results, Steam link + import
  end-to-end), Cloudflare frontend deployment.

## Build 4c live verification (2026-07-17)

- Migration 20260717000001 applied (kos_steam + kos_steam_auth only; nothing
  destructive, no reset). All three functions deployed via
  `supabase functions deploy --use-api`; secrets set by the user privately.
- `tools/games_integration.mjs` 22/22 against the DEPLOYED functions:
  unauthenticated rejection on all three; live IGDB search returns
  normalised results with NO credential/token in any response; input
  validation; steam-auth begin issues a steamcommunity OpenID URL with a
  server-bound nonce and no key material; a FORGED assertion is refused by
  the server-side check_authentication round-trip; the nonce is single-use
  (replay refused); unknown nonces refused; steam-owned-games returns 409
  for unlinked accounts and structurally ignores client-supplied SteamIDs;
  kos_steam/kos_steam_auth accept no client writes (RLS verified live).
- Browser UI (localhost, throw-away account): ⊕ Find new → "Find new — IGDB"
  → 16 live results for "hollow knight" → status pick → local entry with
  cover/genres/igdbId, syncSource manual, planned. ◆ Steam → unlinked state
  with the server-verification explanation → Link Steam → begin succeeded and
  the panel handed off to the Steam sign-in tab ("Check link" affordance
  shown) — verified up to the personal-sign-in boundary, per approval.
- Dev-origin note: localhost testing surfaced the 4b service worker serving
  stale scripts on previously-used dev ports (SWR + HTTP-cache interplay) —
  expected behaviour, not a bug; use a fresh port or unregister the SW when
  testing local changes. Production updates ride the VERSION bump + safe
  update flow as documented.
- REMAINING: user's personal Steam link + real library import (their Steam
  sign-in), and the Cloudflare frontend deployment (awaiting approval; the
  live site does not yet carry the 4c UI).

## Build 4c closure (2026-07-17)

- The REAL Steam link + owned-library import passed end-to-end on the
  production deployment (user-verified): server-side OpenID verification,
  review stage, gap-fill import. Build 4c complete; Build 4 (4a cloud sync,
  4b PWA + mobile adaptation, 4c IGDB/Steam server proxies) closes with all
  19 suites green and every live gate verified.

### DEFERRED — Games enhancements (recorded, NOT blockers, do not start unasked)

- Enrich Steam imports with IGDB metadata: covers, artwork/banners, release
  dates, genres, platforms, publisher (batch igdb-search by title/appId
  after an import; respect the never-overwrite-manual rule).
- Bulk KurenaiOS status/category assignment IN the Steam import review stage
  (e.g. mark a selection completed/onHold/platform in one pass before
  writing).
- Investigate a reliable SERVER-side Steam wishlist import feeding the
  Collection Matrix wishlist/Budget Planner (the browser-side conclusion in
  invariant #5a still stands for release dates; any path would be another
  Edge Function and must respect the planner's governor/network boundary).
- Investigate Steam custom library collections. DOCUMENTED FACT: the
  official GetOwnedGames Web API does not expose user-defined library
  collections/categories — they live in client-side cloud storage
  (sharedconfig) with no supported public API; any approach needs fresh
  research, not assumption.

Also still deferred from 4b: the dedicated mobile UX polish pass.

# CATEGORY 6 — Kurenai Assistant (in progress)

Design record: `CATEGORY6_PLAN.md` (authoritative for scope, tool registry,
autonomy tiers, status). Branch: feature/category-6-kurenai-assistant.

## Phase A — model provider layer (2026-07-17)

- `js/core/ai.js`: one normalized provider contract over local Ollama
  (client-side transport, on-demand health, never assumed available) and
  Gemini/DeepSeek (server-side via the new `ai-chat` Edge Function — raw
  REST, no SDKs, keys only in function secrets). Per-task-category routing
  (tutor/complex → gemini-3.5-flash, crud → Ollama, generation →
  deepseek-v4-flash), fallback ONLY when explicitly configured and always
  labelled (`usedFallback`), single network-only retry, cancellation,
  correlation ids, normalized error kinds.
- `supabase/migrations/20260718000001_kos_ai.sql`: server-owned metering
  (kos_steam pattern) — kos_ai_daily + atomic capped `kos_ai_consume`
  (security definer, service_role-only EXECUTE, concurrency-safe single
  statement), kos_ai_usage metadata rows (never prompts/content/keys).
  Clients: select-own only.
- smoke20 (22 steps) covers the transport shapes, routing, the
  no-silent-paid-fallback property, retries/cancellation, health, and the
  server source contracts (meter-before-provider, header-auth, redaction,
  RLS). Not yet deployed/migrated — live verification and API keys are
  deliberately deferred to Phase F.

## Phase B — complete tool layer (2026-07-18)

- `js/core/aitools.js`: 64 registered tools (study 21 · governor/focus 10 ·
  collection 15 · planner 16 · archive 5 · search 1 · sync 4 · app 2) —
  every one wrapping the REAL domain function the UI uses, with strict
  schema validation (no coercion, unknown fields rejected), live target
  revalidation, autonomy tiers (read/reversible/consequential), sanitized
  results (no blobs/tokens/reward bookkeeping) and undo where reliable.
- Shared-domain extractions so the UI and assistant ride ONE implementation:
  `KOS.hub.search` (topbar search now uses it too), `KOS.games.bulkAddTitles`
  (the modal calls it; the public `bulkAdd` name stays the modal opener,
  smoke8-asserted), `KOS.mediaSearch.createFromResult` (DOM-free
  create-then-mirror), `KOS.mediasync.run` (both provider sync buttons now
  ride it; loading state still immediate), `focus.endEarly({confirmed})`.
- New custom-quiz store (`state.custom.quizzes`, srs CRUD, atomic
  validate-before-save) + the topic Quiz tab renders custom/AI questions as
  a separate labelled block with per-question delete; custom flashcards
  carry an `ai` flag surfaced as "AI · Custom" badges.
- Generation tools (`study_generate_flashcards` / `study_generate_quiz`)
  ground in `KOS.content` canonical notes, request structured output, and
  validate application-side before ANY save — a malformed batch (bad JSON,
  extra fields, out-of-range answer) saves nothing and offers a retry.
- smoke21 (34 steps) covers the registry, validation matrix, real-domain
  invocation, governor invariants #3/#5/#5a through the tool layer,
  generation atomicity, quickEdit parity, tombstones, and the sync runner.
- Asset pack `kurenai-assistant-assets-v2/` (mascot state portraits,
  Whispering Bloom logos, manifest, voice notes) recorded in
  CATEGORY6_PLAN.md for Phase E; untouched until then.

## Phase C — orchestrator (2026-07-18)

- `js/core/aiorchestrator.js`: the policy layer over the Phase B registry —
  bounded loops (8 turns / 12 tool calls / one request at a time / explicit
  cancel), duplicate-mutation guard + single-failed-retry + noRetry after
  any write, live-context revalidation immediately before every write,
  confirmation integrity (stored canonical args execute byte-for-byte;
  expiry, rejection, context/target change and supersession all invalidate
  with a did-NOT-run report to the model), per-tool permissions with an
  unbreakable consequential floor, sanitized audit lifecycle rows
  (proposed→awaiting→confirmed/rejected→executed/failed/cancelled) through
  the user's own RLS session with a serialized signed-out queue.
- Migration 20260718000002: conversations/messages/memory/audit tables,
  owner-only RLS, audit undeletable + status-checked. Audit wired now;
  the rest is Phase D.
- smoke22 (22 steps) green; full smoke gate green before commit.

## Phase D — conversations + explicit-consent memory (2026-07-18)

- `js/core/aimemory.js`: KOS.ai.convo (UUID conversations, deterministic
  client-seq message ordering, validated appends, bounded context assembly
  — ≤30 msgs/≤24k chars, text-only history with tool activity folded to
  inert lines so resume can never replay an action, idempotent digest
  summaries) and KOS.ai.memory (writes only via the two consent origins,
  secrets screen before saving, list/edit/delete, loud signed-out states).
- Registry: memory_list (read) + memory_save/update/delete (consequential —
  the Phase C confirmation card IS the memory-proposal approval).
- Orchestrator: prepRequest loads memories + history before turn 1;
  user/assistant/tool-summary rows persist as the request runs; one clear
  persist_warning on transient failure; memories/summary ride the system
  prompt only as labelled DATA. Phase C gating untouched — smoke23 proves
  hostile stored content still cannot skip a confirmation.
- smoke23 (15 steps) green; full smoke gate green before commit. Live RLS
  isolation remains the Phase F integration script.

## Phase E — the three assistant UI surfaces (2026-07-18)

- Assets: `kurenai-assistant-assets-v2/assets/assistant/` copied to
  `assets/assistant/` (production area beside icons/); deploy_pages.sh stages
  it; sw.js VERSION → kos-c6e-1.
- `js/modules/assistant.js`: ONE shared controller (KOS.assistant) behind the
  global drawer (topbar Whispering Bloom emblem trigger), contextual actions,
  and the dedicated `assistant` view. One submission path → KOS.ai.orchestrator;
  confirmations use the canonical Phase C card; conversations/memory/routing/
  audit ride the Phase A–D services. The mascot is one reusable component
  (compact + large) driven EXPLICITLY by lifecycle events (six states, image
  supplementary to always-present text status, glyph fallback, reduced-motion).
- Contextual actions: topic (ref) page (Ask / Make flashcards / Make a quiz)
  and the vault entry editor (Ask about this entry) — shared path, live
  context, never a direct tool call.
- Dedicated page tabs: Chat / History / Settings (routing+fallback, no keys) /
  Memory / Permissions (consequential floor unweakenable) / Activity (audit
  lifecycle, no delete control).
- smoke24 (18 steps) green; full smoke1–24 gate green. Local Chrome browser
  pass: drawer + page share one live state; a stubbed provider drove
  thinking → confirmation card (identical in both surfaces) → Confirm → REAL
  vault delete → success mascot; tabs wrap without clipping; signed-out states
  honest; phone-tier bottom-sheet verified live; zero console errors.
- Voice: DEFERRED (needs its own TTS Edge Function; documented in the plan).

## Phase F — live verification (2026-07-18)

- Migrations 20260718000001 (kos_ai) + 20260718000002 (kos_assistant)
  applied to production pdogeklnbaolnccqricb; ai-chat deployed; GEMINI_API_KEY
  + AI_DAILY_CAP=50 set. DeepSeek DEFERRED (no key; adapter intact, 503 fail-
  closed).
- `tools/assistant_integration.mjs` — live PASS against production. A–D+G
  (no spend) and E+F (--live-provider, Gemini): auth rejection (401), RLS
  isolation positive+negative across all six new tables (metering server-
  owned no-client-write; conversations/messages/memory owner-only; audit
  owner insert/update + NO delete even for the owner), deterministic message
  ordering, conversation/memory persistence+resume+cleanup, audit lifecycle
  + status CHECK, concurrency-safe cap (counter==accepted), live Gemini text
  200 + structured JSON 200 (schema-valid), unknown-model clean error, no
  secret leaks anywhere.
- TWO real defects found + fixed under live conditions (both Edge-Function-
  contained, regression-tested in smoke20; full 1–24 gate green):
  1. Gemini functionDeclarations reject additionalProperties → 400 on the
     first tool turn. Fix: geminiSchema() recursive whitelist sanitizer for
     tool params + structured schema (client/other providers untouched).
     Verified live 400→200 with the real 83-tool payload.
  2. Gemini 3.5-flash (thinking model) needs the functionCall thoughtSignature
     echoed on the follow-up turn. Fix: thread it through fromGemini→validate
     →toGemini. Also surface the redacted upstream error reason. Verified
     live: follow-up turn 400→accepted (429 rate).
- QUOTA WALL: the free-tier Gemini key's DAILY quota was exhausted by the
  two-defect debugging (our cap read 17/50; the 429 is Google's, persists
  after 4+ min idle). Blocks the final live-Gemini UI round-trips this
  session (consequential gating end-to-end, generation-saves, stale-context,
  memory, resume). Client logic proven in smoke22-24; deferred to a user-
  assisted post-quota-reset checklist + the Ollama checklist.

## Phase F — Ollama local-provider verification (2026-07-18, user-assisted, real machine)

Run from the local app (http://localhost:8471) against real Ollama on the
user's machine — NOT a sandbox/mock.
- Ollama v0.31.2 installed, server running at :11434; mistral:latest (7.2B)
  pulled, advertises capabilities ['completion','tools'].
- App detects availability LIVE across the CORS boundary: KOS.ai.health
  ("ollama") → available:true, models:[mistral:latest]. Ollama 0.31's
  default origins already allow http://localhost:8471 (no OLLAMA_ORIGINS
  change needed locally; the deployed pages.dev origin WOULD need it — noted
  in the checklist).
- Basic local conversation: mistral answered correctly via the app transport
  (~19.5s on this Mac), with usage metadata, provider:ollama.
- Local tool-calling TRANSPORT verified: with a minimal tool + directive
  prompt mistral emitted a valid structured tool_call the app parsed
  correctly. HONEST CAVEAT: mistral 7B degrades to PROSE under the full
  83-tool payload (replied describing a hallucinated function instead of
  calling the real one). The app behaved SAFELY — saw no valid tool_call,
  relayed the text, executed nothing hallucinated. Recommend a stronger
  small tool model (qwen2.5:3b/7b, llama3.2:3b) for reliable local tool use.
  The orchestrator's gating/execution of a local tool call is provider-
  independent (proven in smoke22-24).
- Ollama unavailable (dead endpoint): app reports available:false with the
  OLLAMA_ORIGINS/not-running hint; a crud request with fallback OFF fails
  cleanly (kind:network, provider:none) — NO silent switch to a billable
  provider.
- Explicit fallback enabled (ollama→gemini): the switch is attempted and
  LABELLED (usedFallback:true, fellBackFrom:"ollama") — never silent.
- REMAINING (user-assisted, when convenient): confirm from the DEPLOYED app
  (kurenai-os.pages.dev) with OLLAMA_ORIGINS including that origin; a full
  end-to-end local reversible-tool EXECUTION with a stronger tool model; the
  phone "assumed unavailable" state. App-side behaviour all verified.

## Phase F — Ollama model-config fix (2026-07-18)

Reported: Settings shows the Ollama model (e.g. qwen3:4b-instruct) but a
request errors "No Ollama model is configured." Traced the full path
(input → persist → reload hydration → per-category resolution → adapter
lookup → /api/chat request): the path is SOUND — a configured model persists
to localStorage, hydrates on reload, resolves for every category, and reaches
/api/chat with the exact model; an empty model correctly gives the error.
- ROOT CAUSE: the Settings model input saved only on `change` (blur). A model
  typed and then abandoned by switching tab / submitting — KOS.show destroys
  the input, `change` never fires — was discarded, leaving the category's
  model empty at request time. The UI "showed" the model (typed into the
  input) but it was never persisted.
- FIX (js/modules/assistant.js): the model input and the Ollama endpoint
  input now also persist on `input` (every keystroke), so a typed value can
  never be lost before blur. `change` kept as a final save.
- smoke25 (9 steps) locks all six properties: input-persists-before-blur,
  reload-hydrates, per-category resolution, new-conversation submit uses the
  model, availability+request share the config source, empty→error /
  configured→reaches /api/chat. Verified live on a fresh port with the real
  qwen3:4b-instruct (crud→ollama→/api/chat→real answer, 3.9s).
- Dev note: the reused localhost port served a STALE cached assistant.js
  (the documented 4b SW/HTTP-cache artifact) which masked the fix until a
  fresh port was used — not a code issue. sw.js VERSION → kos-c6f-1. Also
  noted: cloud-sync whole-document LWW (invariant #33) can revert in-memory
  settings if a pull applies an older kos_state — relevant only when signed
  in, separate from this fix.

## Phase F — Ollama request-payload compatibility (2026-07-18)

Reported: the model reaches /api/chat but a real request returns "Ollama
returned HTTP 400." Captured the actual error body against real qwen3:4b-
instruct: `request (8832 tokens) exceeds the available context size (4096
tokens)`. NOT a schema-keyword incompatibility — Ollama/qwen3 ACCEPTS
additionalProperties/maxLength/nested schemas (verified: 1 full tool = 200;
83 tools = 400). Root cause: the ~80-tool payload overflows a small local
model's context window.
- FIX 1 — deterministic tool shortlisting (KOS.ai.tools.shortlist): a local
  model gets a ≤12-tool subset chosen from the request category + live view
  (universal app_get_context/search_app first, then the focused domain).
  The orchestrator applies it ONLY when the resolved provider is ollama;
  cloud models still get the full set. Phase C stays authoritative —
  validates/gates/executes any registered tool. Payload 8832 → 1513 tokens.
- FIX 2 — Ollama schema sanitizer (ai.js ollamaSchema): recursively whitelists
  only structural/semantic keywords (type/description/enum/properties/
  required/items/anyOf) for transmitted tool params, dropping validation-only
  keywords that just inflate the payload. Client keeps the FULL strict schema
  for Phase B validation (validate() reads the registry, not the transmitted
  copy). Parallels the Gemini adapter; Gemini/DeepSeek untouched.
- FIX 3 — tools+format conflict avoidance: a tool-selection turn omits the
  structured `format` (a local model can't emit a tool_call AND satisfy a
  forced JSON schema); pure generation turns (no tools) still send format.
- FIX 4 — surface the real Ollama error body: {"error":"..."} /
  {"error":{"message":"..."}} is redacted (token-blob strip, 200-char cap)
  and shown in the UI instead of a bare status code.
- Verified LIVE end-to-end through the orchestrator with real qwen3:4b-instruct:
  "add a task" → shortlist → todo_add_task selected + EXECUTED (task added) →
  natural final answer. Full multi-turn round-trip, no 400. smoke26 (10 steps)
  locks all seven properties. sw.js VERSION → kos-c6f-2. Full smoke1-26 green.

## Phase F — conversational continuity + Ollama context budgeting (2026-07-18)

Reported: a follow-up ("add it", "yes add that") lost the previous turn — the
model re-asked for subject/ref/q/a it had just been given. Captured the actual
payload: SIGNED OUT, turn 2 sent only [system, user] to Ollama — no prior
history. Root cause: prepRequest only assembled history when convoReady (a
persisted, signed-in conversation); signed-out local-Ollama chats carried
nothing across sends. A second bug: the no-tools completion branch never
pushed the assistant answer into req.messages, so even the persisted path
dropped the immediately-previous reply from continuity.
- FIX: the orchestrator now keeps in-memory sessionHistory as the PRIMARY
  continuity source (works signed out), keyed by a client conversationKey the
  controller passes (reset on new/open conversation). Persistence hydrates it
  once on resume; each completed turn (user + assistant + folded tool
  activity) is appended. The final assistant answer is now retained in
  req.messages.
- Ollama context budgeting: request num_ctx 8192; reserve output (1024) +
  tools (~2200) + system (~700); give the rest to recent history, keeping the
  LATEST turns and never silently dropping the immediately-previous one
  (dropped head becomes a deliberate summary line). Follow-up tool shortlist
  shrinks 12 -> 6 once a tool has run. num_ctx threaded through the ollama
  adapter to body.options.
- Pending-artifact mechanism (KOS.ai.tools): study_propose_flashcards /
  study_propose_quiz generate + validate but DON'T save, holding the object;
  study_save_proposed ("add it"/"save that"/"yes") saves it via the normal
  srs write + reversible tier; a live proposal injects a save-hint into the
  system prompt; cleared on conversation change or when the topic no longer
  resolves. Gemini/DeepSeek behaviour unchanged (no num_ctx, full tool list,
  full client schemas for validation).
- Verified LIVE signed-out with real qwen3: turn 2 carried [system,user,
  assistant,user] and a bare "summarize that topic" resolved to the topic
  from turn 1. smoke27 (13 steps). sw.js VERSION -> kos-c6f-3. Full
  smoke1-27 gate green.

### Category 6 Phase F — execution grounding (2026-07-20)

Live qwen3:4b testing exposed a hallucinated-success defect: the model wrote
flashcards as PROSE without calling a tool, claimed "this has been saved" with
nothing written, invented a saved location, and left "I'll now generate…" as
its final answer. Fixed at the orchestrator + UI layer (the model is never
trusted for ground truth):

- **Verified write receipts** — a write tool that actually executes records a
  receipt `{tool, target, result, summary}` in `req.writeReceipts` and emits
  `onReceipt`; the drawer/page render it as an app-generated "✓ done" row
  (real tool + target + result). This ledger — not the model's prose — is the
  only proof a mutation happened, and is returned in the onDone payload.
- **Proposal ≠ persisted** — study_propose_* emit `onProposal`; the UI shows a
  PROPOSED-not-saved card (`proposalCard` in assistant.js) with Edit / Discard
  / Save. Save runs the EXACT stored (and optionally edited, via
  `updatePendingArtifact`) artifact through study_save_proposed on the new
  deterministic `KOS.ai.orchestrator.runTool` path — same Phase C gating,
  audit, receipts and confirmation as the model loop. The ref-page "Make
  flashcards/quiz" contextual actions now call runTool directly, so a small
  model never has to interpret "save that".
- **Completion checking** (`completeOrNudge`) — before accepting a
  no-tool-call final answer: a success-claim with no write, or an
  action-promise (future-intent word + mutation verb) with nothing done, gets
  ONE corrective retry; if still unfulfilled a deterministic "⚠ Correction /
  Note" replaces the false text. A legitimate proposal counts as "acted", so a
  proposal-card turn is never falsely corrected. SUCCESS_RX/PROMISE_RX are
  auxiliary/object-bound so benign replies ("First saved reply", "done") don't
  trip.
- Batch atomicity preserved (8 requested → exactly 8 validated proposals, or a
  clean failure holding/saving nothing); retrieval after save returns the real
  persisted record (count + topic). Gemini/DeepSeek routing and Phase C
  confirmation unchanged.

smoke28 (14 steps). sw.js VERSION -> kos-c6f-4. Full smoke1-28 gate green.

### Category 6 Phase F — live-Gemini UI acceptance DONE (2026-07-21)

The Google free-tier **daily** quota (which had blocked the final UI captures)
reset. Confirmed with a single minimal probe (ai-chat health 200,
`gemini configured, used:0`; a `maxTokens:1` call → clean normalized 200) and a
second probe capturing real text ("A stack is a linear data structure that
follows the Last-In, First-Out (LIFO) principle.", finish STOP). The live-Gemini
UI flows were then driven through the **real running app** (local http :8899,
latest bundle, sw `kos-c6f-4`, signed-in throw-away user, every task category
routed to Gemini):

- **A · multi-turn round-trip** — "How many completed topics per subject?" →
  mascot thinking→working→idle, app-generated `✓ study_list_subjects` (single),
  natural final answer matching seeded data (compsci 2/156, maths 1/89, IT
  0/110). thoughtSignature survived the follow-up turn; no 400; no duplicate
  execution; audit `executed·read`.
- **B · consequential gating** — delete a disposable anime: proposed, zero
  mutation pre-confirm, canonical Phase C card (tool + CONSEQUENTIAL + target +
  read-only args `{"entryId":4}` + ~120s expiry). **Tamper proof**: rewriting
  the DOM args/target to `entryId 3`/"Witch Hat Atelier" did not change the
  stored action — Confirm deleted entry **4**, entry 3 survived; the receipt
  `✓done collection_delete_entry #4 deleted` appeared only after the write;
  audit `executed·consequential`. **Reject**: a second disposable, Decline left
  it intact and wrote a `rejected` audit row.
- **C · generation → proposal → save** — read the real notes
  (`✓ study_read_notes`), `study_propose_flashcards` produced a pending artifact
  (savedCount 0) shown as **"PROPOSED — NOT SAVED YET · gemini"**. **Edit**
  changed only the stored artifact (`[EDITED-BY-USER]`, still unsaved); **Save
  to deck** ran the exact stored+edited artifact via `runTool` →
  `study_save_proposed` → green **"✓ SAVED TO YOUR DECK"** receipt, two
  `ai:true` cards persisted to compsci 4.1.1.1 with the edit intact. "What did
  you just add?" called `study_list_flashcards` and returned the real records.
- **G · reload & resume** — after a full reload, History listed the persisted
  conversations; reopening restored the transcript coherently with prior tool
  chips **inert (no replay)** — saved card count stayed 2, never 4.
- **H · audit display** — Activity tab shows the honest ledger
  (proposed/executed/failed/rejected, tool + tier + target + timestamp +
  truncated safe result, no secrets, no oversized payload, and no delete
  control).
- **I · provider failure + recovery** — a Gemini per-minute RPM limit surfaced
  as a safe redacted error ("gemini is rate-limiting — try again shortly.") with
  the error mascot; no mutation retried; a later request recovered and produced
  the confirmation card.

Execution grounding (ac5b041) held throughout: proposal ≠ persisted, every
receipt app-generated from the real tool result, saved locations from the tool
result. **D** (malformed-generation rejection) is smoke21/28-proven (a real
model can't be forced to emit malformed, and ai-chat has no persistence path);
**E** (stale-context) is smoke22-proven with its mechanism shown live on the B
card; **F** (memory) reuses the SAME consequential Phase C card proven live in B
plus smoke23. A dedicated fresh live capture for each was curtailed by Gemini's
transient RPM wall (a real infra limit, not a defect).

No Category 6 code changed this session — verification only, sw.js stays
`kos-c6f-4`, ai-chat unchanged. **Production remaining action**: live
https://kurenai-os.pages.dev is still on `kos-4c-1` (pre-Category-6); the smoke
gate is green and `tools/deploy_pages.sh --stage` produced a clean 104-file /
19M dist (assets/assistant + all ai*.js + assistant.js; dev-leak guards passed).
Operator deploys with `npx wrangler login` then `tools/deploy_pages.sh`.
DeepSeek + TTS deferred; assistant UI/UX polish is a separate follow-up build.

---

## ADDENDUM — Governor v4 (the Seat rebuilt) · 2026-08-06

Redesign of the whole Governor section, plus the first shared identity record.

**Navigation (Part A).** The four pages (Status · Gold Shop · Avatar · Session
Log) now ride `KOS.workspaceTabs` inside `.dash-head`, exactly like the
Collection planner/sync workspaces — the switcher sits at the top of the
content area with no dead strip above or below it. Tab clicks go through
`KOS.show("governor", <tab>)`, so each page is a real history entry. The
`data-tab` hook is preserved on every tab.

**Status (Part B).** Two balanced rows: hero (span 8) + vitals (span 4), then
cadence (span 8) + ledger (span 4) — the stat stack is a genuine right-hand
column and the ledger sits beside it. The hero portrait is 132px (was 88), the
substats moved to a right-edge rail (`.id-side`), and the identity now carries
a Discord-shaped status line + about block. **`.gstat` is THE stat tile** —
one shape (label, value, bar, hint) at one set of dimensions, used by the
vitals stack and the cadence numbers alike; the old bespoke `.vital .vt` /
`.heat-side .hnum` treatments are gone.

**Cadence (Part B7).** `KOS.charts.heatmap` now emits intrinsic `width`/
`height` attributes, so the grid keeps GitHub-scale cells instead of being
stretched to the container (that stretch was the empty space). The Governor
view shows a full 52 weeks, the grid takes the card's whole width, and the six
numbers sit beneath it as `.gstat-mini` tiles, filling the card's height.

**Ledger (Part C).** `isRoutine(s)` — `type:"media"` + `action:"sync-reward"` —
is the one classifier. Routine entries are **still logged unchanged** (the
governor prices from that log; invariants #1/#5 untouched) but are excluded
from the Status ledger, from the "Everything" session log, and from every
human-facing session count including the cadence heatmap. They live under
**Session Log → Sync history**, coalesced to one row per day per provider:
"AniList sync completed — 24 entries updated across 12 syncs".

**Identity (Part D).** `state.governor.status` / `.about` are new, and
`KOS.governor.profile()` is the ONE record every identity surface renders
from: the Governor hero, the Home profile band, and a new topbar profile
popover (`profileCard` + `openProfilePopover`, hung off the HUD chip).
`setProfileText` is the only writer (trims, caps at 90/400) and
`editProfileText` the one editor, reachable from all three surfaces.

**Shop & Avatar (Part E).** The shop is a Treasury: a purse/facts strip, a
sticky category rail with per-kind owned counts, and sectioned cards whose
preview shows what is actually being sold — painted bands for banners, the
real palette for themes, the kanji for seals, a rendered ring for frames, a
per-lab glyph for labs. Every group stays rendered (one browsable catalogue).
The Avatar page is an atelier: a live profile preview reading `profile()`,
portrait + banner as paired media cards, the seal library with lock states,
and frames rendered as actual rings.

**Bugs fixed in passing.** `KOS.sessions.streaks()` never returned `rest`, so
the Home rest-streak chip and the Governor rest-streak row both rendered a
hard 0. `.gov-avatar.frame-amethyst` had no CSS rule at all — the fourth shop
frame was purchasable and wore nothing.

**Tests.** smoke15 gained 8 steps (28 total) covering Part A nav, the hero and
tile contracts, the routine/meaningful split in both the ledger and Sync
history, and the single-identity agreement across Governor / Home / popover.

---

## CATEGORY 6.1 — Kurenai Assistant UI/UX Overhaul · 2026-08-06

The assistant frontend is now a composed KurenaiOS workspace instead of a
generic chat shell. The controller, provider, tool, memory, confirmation,
receipt, audit and orchestration contracts remain unchanged.

**Identity and layout.** Whispering Bloom now leads with a clean emblem and a
single approved, true-alpha Kurenai render. Idle, thinking, working, success,
error and confirmation are expressed by CSS bloom-field state effects rather
than alternate portraits. The page has a stable Conversation / Control room
navigation rail, a readable chat column with a sticky composer, and a mascot
presence rail that explains current state and the approval boundary. The
drawer is a full-height side dialog on desktop and a full-screen dialog on
phones, with a scrim, focus containment, Escape handling and focus restore.

**Conversation grammar.** User and Kurenai messages, tool activity, unsaved
proposals, canonical confirmations, verified receipts, warnings and errors now
have separate visual and semantic treatments. Primary tool copy is human
language (for example, “Reading your subjects”); the exact tool id remains
secondary diagnostic text. Confirmation cards lead with action, target,
consequence and expiry while retaining the canonical args in an expandable
review. Provider output now uses a safe DOM-built Markdown/LaTeX renderer;
raw HTML stays inert text and never enters the confirmation/tool paths.

**Control room.** History uses conversation cards and a signed-out continuity
state. Routing uses one card per request class. Memory uses user-controlled
note cards. Permissions is grouped into category accordions with readable
names, descriptions, immutable tier labels and the original controls.
Activity is an immutable execution timeline. All surfaces inherit the existing
theme tokens, have visible focus states and live-region announcements, and
honour `prefers-reduced-motion`.

**Assets.** Added
`assets/assistant/mascot/full/kurenai-production.png` and
`assets/assistant/logo/whispering-bloom-emblem-production.png`; both are RGBA
PNGs with transparent corners and no baked checkerboard. Manifest v3 maps all
six semantic states to the one production render. The old checkerboard assets
remain only as historical source files and are no longer displayed.

**Verification.** `tools/smoke29.test.js` adds eight focused steps covering
the single controller, safe rich provider rendering, human activity labels,
canonical confirmation identity, light/dark theme inheritance, true-alpha
assets, drawer/tab focus management and smoke24–28 safety guardrails. Browser
captures in `artifacts/category6-ui/` cover desktop light/dark, the drawer,
chat and message states, all five management destinations, and 390px mobile
chat/confirmation layouts. The service-worker version is
`kos-gov4-c6md-1`.

**Deployment.** `tools/deploy_pages.sh --stage` produced a clean 106-file /
20M runtime bundle, including the two new assistant assets. smoke1–29 passed
on the final workspace. Cloudflare Pages deployment completed at
`https://01019473.kurenai-os.pages.dev`; the production alias
`https://kurenai-os.pages.dev` was then live-verified against the new service
worker and assistant bundle.

---

## ADDENDUM — Collection + logging bug fixes · 2026-08-06

**Part A — the Digital/Physical vault leak.** `medview.resultsArea` owns the
lazy IntersectionObserver, but every vault legitimately painted the holder
itself for empty/error/shelf states — clearing `holder.innerHTML` and
returning while the observer was STILL live against the previous result set.
The next scroll then appended the old rows underneath the new lens, and
because the holder's class had changed to `bk-shelves`, those `.med-card`
rows inherited shelf geometry — the enormous covers. Root cause, one place.

The area now owns a **generation counter**. `stop()`/`clear()`/`start()`/
`paintAll()`/`begin()` all bump it, and a batch from a superseded generation
is dropped. `paintAll(rows, build)` is the supported way to render every row
at once (the Books shelf) *through* the area rather than around it, and
`begin()`/`current(token)` let an async caller claim a generation before the
query so a slow result for a lens you already left can never paint. All four
vaults (anime, books, vn, games) route their empty/error paths through
`area.clear()`; no module touches `holder.innerHTML` any more.

**Part B — the Shrine card cover.** Root cause was NOT the CDN headers.
Measured live: AniList and Open Library both send
`Access-Control-Allow-Origin`, and a never-before-requested AniList url loads
clean under `crossOrigin="anonymous"`. But the Shrine list renders every
cover as an ordinary `<img>` *before* you press ✦ Card, putting a non-CORS
response in the HTTP cache — and the later crossOrigin load is served from
that cached response, which carries no ACAO, so it fails outright. The old
code read that as "no cover" and drew the kanji.

The resolver now fetches the bytes itself (`cache:"reload"`, `mode:"cors"`)
and decodes from a `blob:` url, which is same-origin and therefore always
exportable. Order: **stored local (data:/blob:) → fetched remote →
crossOrigin image → diagnosis → placeholder**. VNDB (`t.vndb.org`) genuinely
sends no CORS header at all, so it is diagnosed honestly and the card says
which host refused and offers "⌖ Use a local cover…" rather than silently
degrading. Also fixed: zero-size images no longer divide by zero in the
source-rect maths, `toBlob` on a tainted canvas is caught (it throws rather
than yielding null), the preview no longer renders blank when export fails,
and the card waits for `document.fonts.ready` so the exported PNG uses the
app's own typefaces.

**Part C — the profile moved to the rail foot (Discord-style).** `#hud` — the
same node the governor HUD has always painted into — moved from the topbar
into `.rail-foot`, replacing the old brand/spec-points strip (`node-count`
survives as an `.sr-only` live region). The chip gained the status line and
the popover now measures its anchor and opens upward/right from a bottom-left
corner instead of assuming a topbar. Collapsed rail shows the avatar alone.

On the phone tier the rail IS the bottom tab bar, so the panel is
`position: fixed` back into the topbar corner — which required dropping
`backdrop-filter` from the phone rail: a `backdrop-filter` makes an element
the containing block for its fixed-position descendants, which trapped the
panel inside the bar. The bar is now opaque instead of blurred.

**Fixed in passing:** `.hi-txt` had no `min-width: 0` and `.hi-week` did not
wrap, so the Home profile band overflowed its container at 375px.

**Tests.** smoke11 gained the lens-switch regression (with an
`IntersectionObserver` stub, without which jsdom silently takes the
setTimeout fallback and never exercises the real path — verified to FAIL
against the pre-fix code) plus an empty-lens step. smoke4 gained five steps
pinning the cover fallback ORDER (local first with zero network, fetch with
`cache:reload`, the crossOrigin retry, unreachable vs cors diagnosis, and the
no-cover path) and one pinning the rail user panel.

---

## ADDENDUM — Category 6.1 assistant UI/UX build · 2026-08-06

Landed by a parallel working session; recorded here so the tree's history is
complete. Scope was the Kurenai Assistant frontend only — the provider layer,
tool registry, orchestrator and safety model are unchanged.

- `js/modules/assistant.js` reworked across the drawer and the dedicated
  page (one shared controller, inert provider rendering, canonical
  confirmation copy, human-readable activity text, theme inheritance and
  focus containment).
- Production artwork replaced the v2 asset pack: `kurenai-production.png`
  (mascot) and `whispering-bloom-emblem-production.png` (topbar/emblem), with
  `assets/assistant/manifest.json` repointed at them. Both are referenced by
  `index.html` and `assistant.js`, so they are tracked — a fresh clone would
  otherwise 404 the emblem.
- `tools/smoke29.test.js` is the acceptance gate for that surface and joins
  the release gate (29 suites).
- The implementation plan is checked in as `CATEGORY6_UI_PLAN.md`.
- CDP review screenshots live in `artifacts/category6-ui/`; those are
  generated evidence and are gitignored (kept on disk, not tracked).

Verified after the fact on the live deployment: no console errors, the
assistant page and drawer both mount, the mascot resolves to the production
asset, and all six assistant tabs render.

---

## ADDENDUM — Assistant Markdown and mathematics · 2026-08-06

Assistant prose now renders the structure providers already send instead of
showing Markdown punctuation and LaTeX source. The frontend supports headings,
paragraphs, emphasis, strikethrough, ordered/unordered/task lists, blockquotes,
rules, safe links, inline/fenced code, scroll-contained GFM tables, and inline
or display maths using `$…$`, `$$…$$`, `\\(…\\)` and `\\[…\\]`.

Security stays fail-closed: the renderer constructs an allowlisted DOM tree,
does not parse provider HTML, rejects unsafe URL protocols, never loads remote
Markdown images, keeps user/tool/receipt/confirmation data on plain-text paths,
and invokes the existing KaTeX runtime with `trust:false`. Malformed maths
remains readable and cannot swallow the remainder of a response.

`tools/smoke29.test.js` now includes an eighth rich-response regression step.
Desktop and 390×844 in-app Browser checks confirmed the assistant shell stays
within its responsive bounds; tables, code and display maths own their local
horizontal overflow. Service-worker version: `kos-gov4-c6md-1`. No provider,
orchestrator, tool, memory, or confirmation contract changed.

The existing Pages workflow staged 106 runtime files / 20M and deployed the
follow-up at `https://307af73d.kurenai-os.pages.dev`. The unique deployment
mounted the six-tab assistant surface; both it and the production alias served
`kos-gov4-c6md-1`, and the live assistant bundle contained the safe rich-text
renderer export.

---

## ADDENDUM — Build 6.2: Reminders as a dedicated page · 2026-08-06

Reminders were a strip inside Tasks & Habits (`state.todo.manual`:
`{id,text,done,date,category,subs}`). They are now a real store with a page
of their own.

**Model** (`js/core/reminders.js`, `state.reminders`). One flat `items` array
plus a separate `lists` array. The two container concepts stay distinct by
construction: a **list** is a container (`listId`, one per item), a **tag** is
a cross-list label (`tags[]`, many per item). They have separate CRUD,
separate sidebar groups and separate filters; nothing converts one into the
other. Per item: title, notes, done/completedAt, `due` + `dueTime`, priority
0–3, sub-tasks, `recur`, `alerts[]` (minutes before), `alerted{}`. Smart
sections (All/Today/Scheduled/Upcoming/Overdue/Completed) are **derived**,
never stored. `normalise()` is the single schema gate, so a field not listed
there cannot enter the store — and clearing the date clears the time *and*
the repeat, because a repeat with nothing to repeat from can never fire.

**Page** (`js/modules/reminders.js`, view `reminders`). Three columns:
sections/lists/tags sidebar · the list · a side inspector owning every
detail. Search covers title, notes, tags and sub-task text; filters are
list/tag/priority; sorts are due, priority, title, recency. Recurrence rolls
a completed repeat forward to the first occurrence that is not already past,
resetting its sub-tasks, rather than closing it.

**Governor bounds (anti-farming).** Full CRUD makes trivial items cheap, so
completion rewards are bounded three ways, all still flowing through
`sessions.log({type:"todo"})` and never touching the economy directly:
a daily cap (`REWARD_CAP` 8), one reward per item per day (re-ticking pays
nothing), and **sub-task ticks pay nothing at all** — the old code logged a
session per sub-task, which was the most farmable path in the app.
Completing always works past the cap; it simply stops paying.

**Integrations.** Home's directives panel is now the generated list only,
with a strictly read-only reminders digest beneath it and a link through —
no second editing surface. Dated reminders render on the Calendar grid as
quiet dashed chips and are deliberately NOT routed into
`KOS.calendar.deadlines()`, so an ordinary reminder never becomes a major
Countdown. Alerts are in-app only (a 60s ticker while the app is open),
matching the calendar's existing honesty about having no push.

**Migration.** `todo.manual` migrates once at boot: `text→title`,
`date→due`, `category→` a **list**, sub-tasks preserved, then the legacy
array is emptied so nothing is counted twice. Idempotent. The four assistant
tools (`todo_list`, `todo_add_task`, `todo_toggle_task`, `todo_delete_task`)
and the live-context task search were repointed at the new store — left
alone they would have written to an orphaned array no UI reads. `todo_add_task`
gained time/priority/list/tags/notes.

**Backup/restore** carries everything by construction (`state.reminders`
rides `snapshotFull`); smoke30 asserts a full-fidelity round-trip and that a
pre-6.2 backup without the branch self-heals.

**Navigation.** Productivity is now Focus Timer · Reminders · Habits ·
Calendar. `tasks` remains the Habits page (route kept working).

**Cleanup.** The pre-6.2 `.rem-*` CSS (`.rem-main`, `.rem-list`, `.rem-item`,
`.rem-sub*`, `.rem-add-*`, `.rem-cat`, `.rem-date`) was dead after the strip
was removed AND collided with the new page's class names — deleted.

**Tests.** `tools/smoke30.test.js` (22 steps) is the new gate entry: it boots
from a seeded legacy list to exercise migration, then covers lists-vs-tags
separation, the five sections including overdue-by-clock, CRUD/subtasks/
recurrence (including the 31 Jan → 28 Feb month clamp), search/filter/sort,
all three reward bounds, the Home and Calendar boundaries, and backup
fidelity. Two real bugs were caught by writing it: a repeat surviving the
date being cleared, and `nextOccurrence` skipping past intermediate
occurrences instead of advancing one step.

---

## ADDENDUM — Governor v5.1: refinement audit · 2026-08-06

The complete Governor surface has been rebuilt again around a clearer
information hierarchy. This supersedes the v4 layout notes above; the
economy, session model, HP gates, awards, recovery task definitions and shared
image-crop contract are unchanged.

**Status.** The Governor now follows the same one-gap page rhythm as Collection
Planner/Sync; the accidental second workspace padding and decorative top-edge
"bleed" are gone. The banner hero pairs a proportionate 140px portrait and
identity copy with a useful access-state panel. Its Live / Full / Off HP control
is a session-only UI preview and never mutates HP or gating. Five equal command
instruments remain the single source for HP, XP, Gold, review queue and study
streak. Cadence owns the wide side of the lower row, scales its 13-week / 91-day
chart inside the card, and leaves the meaningful milestone ledger deliberately
narrower.

**Recovery.** Strained/Critical mode presents one prescriptive next action with
progress and a direct route. A due review is offered only when cards are
actually due; a clear queue falls back to a 15-minute Focus block. The backend
recovery definitions and HP semantics remain untouched. Core revision
availability is stated in the dispatch; HP rules stay in an accessible
disclosure.

**Chronicle.** Session Log owns the page header instead of repeating it in a
second banner. Its compact count/filter toolbar leads directly into the
filtered, expandable timeline grouped by full date, with human-readable action
titles/icons, recorded context and metrics, 30-entry pagination, and useful
empty states. Technical integration traffic remains under System and is
coalesced per provider/day.

**Avatar.** The tab now owns the `Avatar & profile` heading and uses a familiar
profile-customisation layout: the live profile and first editor group share a
top edge, with no duplicate workshop title. Status sits beside the portrait on
the live stage and full profile popover. Portrait/banner edits still open
`KOS.imageCrop`; level-gated seals, frames and Gold Shop routes are preserved.
The rail control is reduced to a two-line identity shortcut instead of a
compressed dashboard.

**Gold Shop.** The catalogue still has four filters over Learning tools,
Simulations and Cosmetics, with all ids/prices/purchases untouched. Cards now
end immediately after their action instead of manufacturing vertical space.
Themes and banners show their actual palettes without fake interface/profile
overlays; topbar seals are labelled in their real brand context, and frames
use the current portrait. Essential revision remains explicitly free.

**Accessibility and verification.** Filters use tab semantics and selected
state, history uses native `details/summary`, keyboard focus remains visible,
status copy is announced, horizontal filters scroll locally on phone, and all
new motion respects `prefers-reduced-motion`. `tools/smoke31.test.js` now has 12
dedicated checks, including page-specific headings and non-mutating HP preview.
The real-Chrome audit also measures header/hero spacing, portrait scale, Avatar
alignment, shop action gaps, overlay removal and idle header indicators, with
dedicated theme/banner captures. Service worker: `kos-gov5-files-refine-2`.

---

## ADDENDUM — Build 6.3: the Study Files tab · 2026-08-06

The tab was a flat list of rows, each with its own expandable inline viewer
and a fixed 520px iframe. It is now a selectable list plus one preview stage.

**Structure (A).** `.att-body` is a two-column grid: a narrow selectable
`.att-files` listbox (role=listbox / option, exactly one selection, exposed
via aria-selected) and one `.att-stage`. Selecting a file previews that file.
PDFs get an iframe, images an `<img>`, text a `<pre>`; anything else gets a
metadata card with Open and Download rather than a broken frame.

**Controls (B).** Fit width, Fit page, zoom (50–400% in steps), Collapse,
Full screen, Open externally and Download. Images use CSS; PDFs ride the
viewer's own fragment params (`#view=FitH`, `#view=Fit`, `#zoom=N`) — and the
toolbar is **never** suppressed (`toolbar=0` is asserted absent). Full screen
is an overlay with its own control bar, closable by Escape or backdrop click.

**Layout (C).** The old `height: 520px` iframe is gone: `.att-pdf` is
`min(78vh, 1000px)` with a `min-height`, so the embedded toolbar can't be
clipped. Notes moved beneath the preview inside the stage. Two width fixes:
the Files tab folds the inspector using the existing `insp-closed`
mechanism (without rewriting `ui.inspectorOpen`, so the preference returns
with the tab), and `.att-body` responds to a **container query** on
`.att-wrap` rather than a viewport media query — with a spec tree and an
inspector open, a 1400px window still left the panel ~90px wide, which
wrapped the stage to one character per line.

**Metadata + actions (D).** The stage head shows filename, type, size, added
date and linked topic, with notes beneath. Actions: view (selection), open,
download, rename, replace, remove. New store ops `rename`, `replace` and
`get`; both mutators **preserve `id`, `fileId`, topic and notes** — a rename
must not read as delete-plus-add to cloud sync, and the note describes the
document rather than one upload.

**Persistence (E).** IndexedDB unchanged; backup/restore verified
round-trip-identical in a real browser (jsdom can't test the export path —
fake-indexeddb strips the Blob prototype, as smoke13 already documents, so
smoke32 covers the import direction and the fail-fast guarantee instead).
Three degraded states are now distinguished: **cloud-only** (metadata synced,
binary elsewhere), **damaged** (stored but 0 bytes), and **unsupported type**.

**Bugs found while building/testing.**
- `blobToBase64` never called back for a non-Blob, so a single bad record
  hung the whole backup export with no error. It now fails fast.
- `health()` treated an *unknown* blob size as empty; only a real 0 (on the
  blob or the stored metadata) now means damaged.
- Zoom above 100% did nothing: the base `max-width: 100%` clamped the inline
  width. `.att-preview.fit-zoom .att-img` now drops the clamp and the stage
  scrolls.
- Text preview called `blob.text()` unguarded; there is now a FileReader
  fallback and an explicit failure message.

**Tests.** `tools/smoke32.test.js` (24 steps) covers A–E, including the
"no fixed pixel height on the PDF frame" CSS contract so the clipping
regression can't come back. Suite count is now 32.

---

## ADDENDUM — Build 6.4: the Assignment Tracker · 2026-08-06

One canonical record (`state.assignments`, `js/core/assignments.js`) with a
Study workspace page (`js/modules/assignments.js`, view `assignments`) and
four DERIVED surfaces.

**The one-record rule.** Study, Calendar, Countdown, Home and the Focus Timer
all read the same array; none keeps a copy. Two consequences are deliberate
and both are asserted by tests:

- **A deadline is not a calendar event.** The grid asks `forDate()` what is
  due that day, so no event row is ever written. `smoke33` checks that
  creating an assignment leaves `calendar.events.length` unchanged.
- **Deleting removes every derived surface at once**, because there was never
  anything else to delete — the calendar chip, countdown row and Home card
  all vanish with the record, and real calendar events are untouched.

**Fields.** id, title, subject, type, description, assigned, due + dueTime,
status, progress, priority, estimateMins, actualMins, subtasks, notes,
topics, alerts, showInCalendar, showInCountdown, and the timestamps
(created / updatedAt / submittedAt / completedAt). `normalise()` is the
single schema gate. Two invariants live there: the terminal statuses ARE
100% (a "complete" assignment sitting at 40% would make every derived
surface lie), and clearing the date clears the time.

**Attachments** ride the existing attachment store under a deterministic ref
(`assignment:<id>`), so backup, restore and cloud sync already carry them and
there is no second binary store to keep in step.

**Statuses.** Not started → In progress → Blocked → Submitted → Complete.
Submitting stamps `submittedAt` and forces 100%; completing stamps
`completedAt`; **reopening clears both stamps and drops progress back to what
the subtasks actually say**, so a reopened assignment stops claiming to be
finished. Overdue is judged by the clock, not just the date, and a completed
assignment is never overdue however late it was.

**Integrations.** Calendar chips (`cal-asg`, muted once submitted) ·
Countdown merges assignment rows with calendar exams/deadlines in
`countdownWidget` while leaving `deadlines()` calendar-only, so nothing else
changes and only assignments explicitly marked **major** appear · Home shows
an urgent card (overdue first, absent entirely when nothing is due) · the
Focus Timer gains an assignment picker, and a **completed** session banks its
minutes as actual effort (an abandoned session banks nothing, matching the
existing forfeit rule) · related topics are navigable straight to the topic
page.

**Governor.** Completing logs one `sessions.log({type:"todo"})` with
`metrics.source:"assignment"` — the sanctioned trickle, never a direct
economy write. It pays **once per assignment**: the `rewarded` flag means
reopening and re-completing earns nothing, so the status field is not a
faucet.

**Tests.** `tools/smoke33.test.js` (21 steps) covers the canonical-record
claim, the full lifecycle the brief names (create, edit, submit, complete,
reopen, overdue, delete, reload, backup/restore), filters and sorting, and
each derived surface including the delete-cleanup and the Home-stays-quiet
case. Suite count is now 34.

---

## ADDENDUM — Build 6.5: the Focus Timer, end to end · 2026-08-06

The timer was one honest clock with a thin start form and no ending. It is
now a whole session — setup, running, completion — around the *same* state
machine. Nothing here changes what a session is, what it pays, or the 3i
reading contract.

**One award definition.** `KOS.governor.focusAward({complete, mins, pauses})`
is a new PURE function. `onSession` pays from it; the setup "deal" and the
running eligibility read QUOTE it. That is the point: the number on screen
and the number paid cannot drift, because there is only one arithmetic.
`KOS.governor.lastAward()` reports what the last session actually paid
(streak bonuses included) so the completion review reports the truth rather
than recomputing a second guess. The Critical half-trickle deliberately
stays in `restoreHp`, at payment time — the preview says so instead of
pretending to model it.

**Setup stays a short form.** Mode · duration · break · subject · topic ·
optional assignment · one objective line, then Start. The side rail is the
deal and your record — and nothing else, so there is no invented content
filling the column. The deal now states real figures for the duration
selected ("One completed 25-minute cycle → +35 XP · +5 gold · +6 HP") and
every penalty in the same voice, including the two that were previously
unstated: marking a distraction yourself is free, and refreshing costs
nothing.

**Running keeps the clock dominant.** Added, in this order and no more: the
context chips the session was started for (topic, assignment, deadline), the
objective as its own line (click to rewrite it mid-session, the clock does
not stop), cycle pips + banked-cycle count, a live reward-eligibility panel
("Ending now pays +38 XP…" / "Ending now forfeits the award"), and a working
row with a quick-note field and a **⚑ Mark a distraction** button. Notes and
self-marks live in the persisted snapshot, so a reload brings them back with
the clock; the note field is also on the dock, because a note worth keeping
usually turns up while you are studying minimised.

**Self-marking is free by design.** The HP nick exists to price an
*unannounced* tab-switch. Pricing honesty as well would simply buy silence,
so a self-marked distraction is recorded (and shown in the review) and never
charged.

**Completion is a review of a record that already exists.** `finish()` logs
and pays FIRST, then opens `reviewModal`. Dismissing it, or suppressing it,
loses nothing — the session, the award, the streak and the assignment effort
have all already landed. The review reports duration, cycles, pauses, tab
switches, self-marks and recoveries; the real award; then asks for an
objective result (Met / Partly / Missed) and one line of reflection, offers
to move a linked assignment (open subtasks, progress, status — through
`KOS.assignments`, never a direct write), and files the session's notes onto
**the topic note or the assignment**, appending rather than overwriting.
Those answers annotate the one entry (`objectiveResult`, `reflection`,
`notesFiledTo`); they never log a second session or pay a second award.
The old study-block confirm is folded in as a checkbox instead of stacking a
second modal — it still asks as a confirm when the review is suppressed.

**Sessions are no longer lost to a refresh.** Three changes:

- `KOS.store.flush()` (new) writes synchronously, clearing the 120 ms save
  debounce. `pagehide`/`beforeunload` bank the live phase clock through it,
  so the page may die immediately without shaving the last seconds off.
- The unload fires its own `visibilitychange`; it is now exempt from the
  distraction penalty. Pressing F5 used to cost 2 HP.
- Restore counts `restores` and comes back paused with the banked time,
  notes, objective and assignment link intact — charging neither a pause nor
  a distraction, and saying how much time it kept.

**Recorded once, read everywhere.** The session entry is unchanged in shape,
so the topic inspector still counts its minutes and the Governor chronicle
still renders the row — now also showing the objective, its result, where the
notes went and the self-mark count. Self-marks are stored as `selfMarks`, NOT
`marks`: that key already means exam marks on tracker entries and the
chronicle reads it generically, so the collision would have shown "Marks: 2"
on a focus session.

**Assistant path.** `focus_start_session` accepts `objective` and
`assignmentId`; `focus_get_state` reports the objective, the linked
assignment, note count and what ending now would pay; `focus_end_session`
passes `{review:false}` so the assistant reports the outcome in the
conversation instead of throwing the stage's modal at the user — and returns
the award it actually paid.

**Tests.** `tools/smoke34.test.js` (28 steps) covers the quoted-deal
identity (quote == payout, and quoting mutates nothing), the setup form's
shape, the running working-record, the free self-mark against the still-
charged tab-switch, all three fairness guarantees, and the completion review
— including the two properties that matter most: dismissing the review
changes nothing, and saving it never pays twice. Suite count is now 34.

---

## ADDENDUM — Build 6.6: the Calendar, and one event model

**The global alert setting is gone.** The page carried a single "Remind me
about deadlines — N days out" dropdown, which meant every exam and every
homework deadline shouted on the same schedule. Alerts now live on the
record: `alerts[]` of minute offsets, drawn from the same list Reminders and
the Assignment Tracker use, up to four per event. A mock exam can warn a week
out while a coursework hand-in warns the night before.

The v1 branch migrates once, on first access: the old global `notifyDays`
becomes a per-event alert on every exam/deadline that had no opinion of its
own, an explicit `notify: 2` becomes a 2-day alert, and an explicit "no
alert" (`notify: -1`) stays silent. `notifyDays` is deleted from the branch
and from store DEFAULTS.

The one trap worth recording: `v` is deliberately NOT in DEFAULTS. Defaults
are deep-merged *under* the stored state, so shipping `v: 2` there would
stamp every legacy branch as already-migrated and the pass would never run.
The migration writes the marker.

**A new exam or deadline still gets a three-day warning** — the retired
default, now applied at creation only. `normalise()` never re-seeds it, so
clearing every alert sticks through later edits. That asymmetry is the whole
point of moving alerts onto the record.

**Recurrence is computed, not copied.** Daily, weekly, fortnightly, monthly
(clamped: the 31st lands on the last day of a short month rather than
vanishing) and yearly, with an optional end date. A repeating event is ONE
record — editing it moves every showing, deleting it removes them all, and
the grid marks each occurrence with `↻` rather than pretending they are
separate entries.

**Countdowns derive from canonical records.** `KOS.calendar.countdowns()`
merges upcoming calendar exams/deadlines with the assignments marked major
and sorts the two together. Nothing is duplicated to make a row appear, and
nothing is deleted to make one disappear — `showInCountdown` is a field on
each record. A completed deadline retires itself. `deadlines()` stays
calendar-only and keeps its `{ev, date, days}` shape, so todo.js and the
assistant read what they always read.

**The grid.** Today is marked three ways (filled numeral, a rule across the
top of the cell, a tinted field) so it survives a busy day; weekends and
past days are toned rather than greyed out; the month trims to whole weeks
instead of always painting a trailing empty row. Chips carry a colour rail,
a monospace time, a truncating title and a hover/`aria-label` with the full
detail. A cell shows three chips and then `+N more` — except when exactly one
would be hidden, since the control costs the same room as the chip. `+N more`
opens a day sheet listing events, assignment deadlines and reminders
together. Week view is now a real time grid: an all-day band, an hour gutter
sized to the week's actual events, blocks placed by start and end, and
overlapping blocks packed into shared columns instead of hiding each other,
with a now-line on today.

**Reading is separate from editing.** Clicking anything opens a read-only
detail card — when, repeat, subject, topic (clickable through to the ref),
location, the type's own fields, alerts, description — with Edit and Delete
in the footer and a "Start a focus session" action on study blocks and
lessons. An assignment chip opens the tracker's own modal
(`KOS.assignmentDetail`); the calendar never grew a second editor over an
assignment record.

**The event modal.** One modal adds and edits. Visible: title, all-day,
date/start/end, type, colour. Behind disclosures: details (subject, topic,
location, description) and repeat & alerts — and a section that already holds
data opens itself, so editing never turns into a hunt. Exactly one
conditional section per type:

- **exam** — paper, duration, room, related topics;
- **deadline** — priority, status (the Assignment Tracker's vocabulary, so
  the two never drift), countdown visibility;
- **study block** — intended duration, a linked assignment, and a
  "Save and start a focus session" shortcut.

The study block stores `assignmentId` and nothing else about the assignment:
renaming the assignment is instantly reflected because there was never a
copy. With no open assignments the picker is a disabled placeholder that says
so, rather than a missing control.

Validation runs before any write — title, real date, end-after-start, an end
without a start, a repeat ending before it starts, duration range — reporting
in a summary and marking the offending field. Delete sits alone at the far
side of the footer behind a confirm that says a repeating event is one
record; Cancel and Save sit at the other end.

**Category colour is one variable.** `--ev-hue` is set by the type class and
overridden by an explicit colour; chips, legend keys, swatches and the detail
card all read it, so a theme change or a new colour needs no rule edits.

**Also fixed in passing.** `calendar_list_events` was building
`upcomingDeadlines` by reading `id`/`title`/`date` straight off the `{ev,
days}` wrapper — the assistant was handed ten objects of nulls. It now reads
through `d.ev` and includes the day count.

**Tests.** `tools/smoke35.test.js` (31 steps) pins the retired global
setting and its migration (including that a cleared alert stays cleared),
every recurrence cadence and its end date, the merged countdown and its
per-record visibility, the month and week grids including day overflow and
overlap packing, detail-before-edit, the modal's disclosure/conditional/
validation/footer contract, the schema gate, backup fidelity, and the
boundaries the rest of the app leans on — the calendar still logs no session
and moves no HP/XP/gold, and `eventsOn()` still returns the shape the focus
timer and daily list have read since Build 2a. Suite count is now 35.

**smoke3 updated, not weakened:** its calendar step asserted 42 cells and
seven `.cal-cell` in week mode. It now asserts whole-week month grids, a
marked today, and the week time grid's columns, band and gutter.

---

## ADDENDUM — Shared media detail and record-editor refinement

Anime, Books, Visual Novels and Games now open the same **record folio**:
semantic, labelled sections for identity/artwork, progress, ownership, dates,
taxonomy, lists, source/sync and Notes. The body scrolls inside a fixed modal
shell, fields follow one two-column grammar on desktop and one column on
phones, Notes always owns the final full row, and Delete stays physically
separate from Cancel/Save. Source cards plainly distinguish local, imported
and live-linked records instead of exposing provider-shaped metadata as the
primary explanation.

The module-specific information architecture remains honest. Anime keeps its
cover beneath Title rather than letting the URL dominate the opening row.
Books separates reading progress from Physical ownership, with an explicitly
labelled, compact From volume / To volume batch tool (and a browser-found
overflow defect corrected). Visual Novels keeps routes, chapters, gallery and
quotes in their own structured groups; Games keeps platform/ownership apart
from completion and explains that its optional Steam id is a store link, not
live sync.

Obsolete bottom `bk-stats`, `vn-stats`, `gm-stats` and `gm-charts` components
are no longer constructed; the Games analytics builder was removed rather
than hidden. Vault-level numbers remain available from each module's explicit
Stats action. Browser verification covered all four editors, the dedicated
Games Stats modal, a 1280×720 desktop viewport and a 390×844 phone viewport;
the console remained clean and the compact Books range measured zero overflow.

**Tests.** Existing media suites 5/6/8/11/12 were tightened around the new
contract. `tools/smoke36.test.js` pins shared section semantics, per-module
field groupings, internal scroll, responsive columns, full-width final Notes,
separated destructive/save actions, the labelled Physical Vault range and
the complete removal of bottom analytics while retaining dedicated Stats.
Suite count is now 36.

---

## ADDENDUM — Governor merge-integration recovery · 2026-08-07

A repository/diff audit found no unresolved conflict markers and no damage to
Governor economy, sessions, cropper, assistant, or routing logic. The actual
regression was a split frontend contract: the later Governor markup introduced
the access-state preview, compact HUD identity, and portrait/status rows while
the surviving CSS still targeted the removed command mark, old HUD bars, and
standalone status pills. A stale local service-worker scope initially masked
the split during browser inspection; verification was repeated on clean local
origins before acceptance.

The repair restores the page-specific Governor composition without touching
feature semantics. The header-to-content gap is now 18 px on desktop and 14 px
on phones. Status uses a proportionate 112 px portrait, a fully styled access
panel, non-mutating HP preview controls, and a contrast-backed control surface
when a custom banner is present. Decorative card-edge and shop-preview overlays
that no longer conveyed state were removed. Cadence and the milestone ledger
now split the row evenly; the 13-week plot fills a bounded 400 px lane, its
three summary tiles remain inside the parent at phone widths, and a stale
`height:100%` rule can no longer push the legend outside its card.

Gold Shop opens on All wares so the catalogue is complete on arrival, with
Learning tools, Simulations, and Cosmetics available as explicit filters.
Product copy and actions no longer use an artificial flex gap. Avatar and the shared
profile popover anchor the status bubble beside the portrait, while the corner
HUD uses the compact name/state/gold markup it actually renders. The assistant
lifecycle dot is invisible while idle and appears only for busy/confirmation
states, removing the unexplained blue ring without changing controller state.

**Verification.** The complete `smoke`/`smoke2`–`smoke36` run passed. Focused
post-polish gates `smoke15`, `smoke18`, `smoke29`, and `smoke31` also passed;
smoke31 now has 13 checks and pins the restored class/CSS contracts, compact
spacing, cadence geometry, removed shop overlays, and state-only assistant dot.
`tools/visual_audit.mjs` now accepts `KOS_AUDIT_URL` for clean-origin audits and
passed against the final build at desktop light, desktop dark, and 390×844.
Governor screenshots were refreshed at `/tmp/kos-governor-*.png`; measured
document overflow was zero on Status, Gold Shop, Avatar, and Session Log.
Service-worker cache version: `kos-governor-layout-refine-1`.

### Governor layout refinement · 2026-08-07

The Session Log overview now shares one exact content edge across its three
summary cards, seven-category switcher, status note, and event history. Dates
form a compact chronicle rail beside grouped expandable events on desktop and
collapse above those events on phones. System sync remains hidden by default,
pagination and canonical session data are unchanged, and the filter stays
horizontally keyboard-scrollable at narrow widths.

The Avatar preview now stretches to the height of its workshop column, with
the current portrait/frame/banner inventory and edit action anchored at the
base instead of leaving an accidental empty lower-left quadrant. Study cadence
returns to the requested composition: the 90-day heatmap is on the left and
the three equal summary tiles stack vertically on the right, collapsing to a
three-tile row on phones. Gold Shop now defaults to All wares.

Smoke1–36 and the Chrome visual audit pass. The visual gate now measures the
cadence column order, full-width Session Log alignment, grouped date structure,
equal Avatar/workshop height, and All wares default rather than relying only on
class presence.

### Study overview + topic shell refinement · 2026-08-07

**Subject overview (Part A).** The right column now leads with a `Subject
analytics` panel instead of a seven-tile strip sitting in a two-column grid
with a hole in the corner. Eight statistics genuinely exist for a subject —
mastery, topics secure, topics started, cards due, cards reviewed, quiz best,
exam questions, study streak — so the grid is the balanced 2 × 4 the brief
allows, with no filler tile invented and none of the old depth dropped
(deep-content coverage moved into the panel's footnote, which is also where
the mastery-vs-secure distinction is explained). "Continue where you left
off" moved below the grid as a full-width action card that carries the topic,
its section and its mastery bar, and that still renders — as "Start here",
pointed at the first unfinished topic — for a subject never opened. A ruled
break separates the analytics block from Countdowns and the flagged-topics
panel, which are dates, not subject analytics. Nothing in the column is
sticky, and `.study-inspector` lost its `position: sticky` too: both scroll
with the page.

**Statistic consistency (Part B).** Every Study figure now has exactly one
derivation, in `hub.js`: `subjectStats` (which gained `touched` and a
check-averaged `mastery`), `subjectCardStats`, `subjectQuizStats`,
`subjectExamCount` and `topicStats`. Formatting is standardised in the same
block — `pctText`, `ratioText`, the single `low`/`mid`/`high` ramp shared with
the section ledger, and one empty state (an em dash plus a sentence saying
why). A bar is only drawn when it carries the same quantity as the value
beside it. Two real contradictions died: the subject page was reading
`quiz.lastPct` under a "Best quiz" label while the inspector read
`quiz.best`, and a topic with a ticked progress check could still read "Not
started" (`store.setCheck` now moves a `none` topic to `started`). Where a
figure legitimately outruns its inputs — a topic marked Completed is 100%
whatever its checklist says — the readout explains itself
(`topicStats().checkText` prints "marked completed") rather than rewriting the
store, because the assistant restores status and checks separately and
deriving one from the other would lose an undo.

**Topic status (Part C).** The status dropdown, the four progress checks and
the RAG confidence rating were three loose control groups sharing one flex row
with hairline separators. They are one headed `.topic-status` component now:
three labelled fields, checks as equal-height chips that light when ticked, and
a live mastery readout across the header that repaints on every change. The
third check reads "Done exam questions" rather than "Done exam Qs".

**Inspector (Part D).** The panel still collapses and still persists in
`ui.inspectorOpen`, but the collapsed rail now carries a readable vertical
spine instead of a naked chevron, and the toggle announces `aria-expanded`. It
computes nothing of its own: a new Materials section prints the very object the
tab bar printed on its chips, and its mastery block shares `topicStats()` and
the status component's repaint hook, so the two mastery readouts on the page
cannot drift.

**Tabs and controls (Part E).** Tabs carry their full names — "Exam
questions", "Simulations", "Worked examples" — count chips have one fixed
geometry, every tab shares one height, and the topic strip wraps rather than
hiding "Files" behind a silent horizontal scroll. The subject desk's
Overview/Assignments switcher is retired; the tracker keeps its first-class
Study subnav entry.

**Verification.** New suite `tools/smoke37.test.js` (24 steps) pins all five
parts. Smoke1–37 pass. Checked in a running Chrome at 1560×1000, 768×1024 and
375×812: no new horizontal overflow on the subject desk or the topic page (the
only element past the viewport on a phone is the pre-existing, deliberately
scrollable `.subject-units` band).

### Collection Goals v2 + Shrine Hall of Fame · 2026-08-07

**Goals.** The former one-dimensional target list is now an intention docket
with summary metrics and Active, Completed and Failed/expired views. One
structured, internally scrolling editor owns identity, measure/linkage,
schedule and notes. Goal cards state what is being measured, show live current
and target values, expose their linked scope and dates, and preserve compact
empty states. The v2 domain supports completed-title, episode, chapter, volume,
specific-title, series/list/tag/genre, budget ceiling, library-size,
favourite, purchase, game-hour and cleared-route measures plus custom manual
goals. Where local Collection or Planner records can answer a measure, progress
is recomputed automatically; no provider request is involved.

Goals ride ordinary backup/restore as
`state.goals = {v:2,nextId,items,completionLedger}`. Legacy goals migrate through
the same normaliser. The completion ledger is deliberately activity-only and
idempotent: completion never logs a new session or directly moves HP, XP, gold
or a streak, so the underlying activity is paid exactly once and deleting then
recreating a goal cannot farm the Governor.

**Shrine.** The Hall of Fame now gives rank one a full featured stage and lays
the remaining favourites into smaller ranked cards. Media-type filters,
sorting, an optional hall description, clear personal score/rank, one-item and
empty compositions are all first-class. The landscape share card is tightly
filled with the resolved cover, title, type, score, rank, useful metadata, an
editable default message and restrained KurenaiOS branding. It reuses the
export-safe resolver and exact persisted cover crop rather than flattening or
recentering artwork.

**Verification.** `tools/smoke38.test.js` adds 13 focused release checks for
goal migration/measurement/editor/status/backup/anti-farming and Shrine
ranking/filter/single-item/share-card/crop contracts. The running-Chrome audit
now covers Goals, its editor, Shrine and the share card at desktop and 390×844,
including measured overflow and responsive stacking. The complete smoke1–38
release gate and the expanded live-browser audit pass. Service-worker version:
`kos-collection-goals-shrine-2`.

**Visual correction.** A follow-up real-data audit exposed three density faults
that the first synthetic composition did not catch. Rank one is no longer a
full-width 380px split billboard: it now uses the Budget Planner's compact
hero/sidecar rhythm, with a cover-led exhibition stage beside a Hall ledger
showing average score, completion count, media wings and their distribution.
The remaining ranks are cover-led accession cards with permanent score,
metadata and share actions rather than sparse horizontal rows. The 900×560
share artwork is now a lacquered exhibition pass with an isolated rank seal,
score block and metadata column; a long three-line title cannot collide with
the score or facts.

Goals now reserve fixed card columns with `auto-fill`, so a lone goal stays a
compact card instead of stretching across the entire workspace. The editor's
scroll body gained max-content grid tracks and every form section keeps its
intrinsic height. Identity, the default Measure fields and dynamically expanded
linked-title Measure fields are browser-measured as fully contained in both
dark desktop and phone layouts. The visual audit now captures the single-goal
state, linked-title editor and ranked-card shelf in addition to the original
Goals/Shrine/share-card frames.

**Planner-parity correction.** Rank one now uses the Budget Planner feature
hero itself: the same `wl-hero` geometry, crop-aware background layer,
left-aligned information hierarchy, facts and action rail, and the same
directional overlay. The former centre/right composition and its opaque cover
split were removed. Its sidecar now follows the Planner's allowance-ledger
grammar with a primary average, three explained accounting rows and one honest
completion meter instead of decorative distribution bars.

The export artwork was rebuilt as a ceremonial Private Hall plate: double gold
rails, corner foliage, blossom details, a framed cover, isolated rank pennant,
dedicated score chamber, metadata ledger and quotation panel. Stars are now
drawn as five bounded vector paths inside the score chamber, eliminating the
font-glyph overflow that previously crossed the panel boundary. Desktop and
390×844 browser assertions verify the shared Planner structure, left-aligned
content, crop metadata, equal-height sidecar and contained share-card geometry.
Service-worker version: `kos-collection-goals-shrine-3`.

**Integrated share-card atelier.** The final export no longer asks canvas to
imitate an illustrated card from primitive panels. A purpose-built,
detail-free 1536×1024 Private Hall plate now owns the ornamental rails,
portrait aperture, title field, rank pennant, score medallion, two metadata
seals and quotation chamber. The crop-aware renderer paints only the selected
cover and entry data into those reserved apertures, including fitted long
titles, module-specific facts, vector score stars and the editable dedication.
The result stays legible with a missing cover through the existing honest
module-mark fallback.

Cormorant Garamond (roman + italic variable fonts) and Cinzel are bundled
locally under `assets/shrine/fonts/` with their OFL licences. The share modal
explicitly waits for both faces and the template before exporting, and all four
runtime assets are part of the offline precache. Smoke38 now pins the template,
font, 1536×1024 canvas and crop contracts; smoke1–38 and the complete live
Chrome audit pass, including desktop/mobile Shrine and the real share modal.
Service-worker version: `kos-shrine-card-template-4`.

### Assistant workspace + Bloom Familiar · 2026-08-07

**Workspace.** The dedicated Assistant is now a full-height three-column
workspace. Its left control rail collapses from 258px to 64px, remembers that
choice, and contains New conversation, the existing Assistant destinations,
project filters, pinned conversations and recent history. Conversations can be
assigned to a local project and pinned without changing the cloud conversation
schema. The chat gains compact pin/project controls while the character rail
keeps lifecycle state and voice controls close to the active thread. Narrow
screens stack the three surfaces without introducing horizontal overflow.

**Conversation.** Provider replies progressively reveal into the shared thread
instead of appearing as a single block. The composer now starts at one line,
grows with its draft to a bounded height, then scrolls internally. Tool activity
is condensed into one native disclosure with a human-readable summary; raw tool
ids and results remain available inside it but no action is exposed. The
redundant safety promise panel was removed. Fenced code remains inert and now
uses dependency-free token colouring for comments, strings, keywords, numbers,
functions, constants and tags.

**Character.** Six original transparent Bloom Familiar assets accompany
Kurenai's idle, thinking, working, success, error and confirmation poses. CSS
state motion, hover and tap responses respect reduced-motion preferences. An
optional local `speechSynthesis` voice emits only the short cue associated with
a state change; it is off by default, persists as a user setting and never reads
assistant answers or sends audio to a provider.

**Verification.** Smoke24 now pins the opt-in/local-only voice boundary and the
inert disclosure contract. Smoke29 covers incremental reveal, cancellation,
syntax tokens, six distinct RGBA familiar assets, sidebar collapse and project
creation. Live browser checks covered expanded/collapsed desktop layouts,
project assignment, pinning, composer growth/capping, 390x844 responsive layout
and zero console errors. Service-worker version:
`kos-assistant-workspace-1`.
