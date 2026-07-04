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

## Claude Code backlog (app features)
- **Content**: fill quiz (≥3) and exam (≥1) gaps across maths + thin CS files, using
  PMT papers in `Context/` as source (see the plan: build-1 completion sprint).
- More simulations (Karnaugh maps, BFS/DFS graph traversal, projectile motion).
- More sandboxes (BNF validator 4.4.3.1, normalisation 4.10.3).
- Build 2 (gamification): Behavioural Governor (avatar, focus timer, SM-2 engine).
- Build 3: Kurenai Collection Matrix.
