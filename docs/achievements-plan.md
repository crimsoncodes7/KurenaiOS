# Achievements: the Badge Wall (roadmap 5.16 and 5.17)

Asked for 30 October 2026, decisions taken the same day (the recommended
four), and BUILT on `feat/art-review`: the engine, the catalogue, the page,
the light, the overlay, the ping and the joins. What waits is art (batches
26–27, Gemini) and a Claude Design pass on the page (design prompt 19).

The model is Reverse: 1999's "Fourth Wall" (the user's screenshots): each SET
is a painted 21:9 panel with its round medallions laid over it, a count of
what is owned, a list view, a filter, a set opened as a carousel of its tiers,
a chosen showcase, and an overview of your record with the showcase in a tray
along the bottom (R1999's "career overview" suitcase, made our own).

## Decisions (30 October 2026)

1. **Order.** 5.16 is built now on the 153 unit badges already made; the
   wider catalogue (5.17) is registered and measuring, drawn with each set's
   enamel disc and glyph until its art arrives.
2. **Pay.** Badges pay NOTHING (invariant 161): the work they recognise was
   paid by its own entry. A badge's third tier usually unlocks a TITLE shown
   under your level (cosmetic); the exceptions are explicit (below).
3. **Retroactive.** A device's first sweep is SILENT: what your history
   already meets is earned with no overlay and no ping, and one toast says
   how many tiers you already had. The two minutes after it are silent too,
   so a fresh device's first cloud pull is not news.
4. **Pings.** Every step when the tier's target is 20 or fewer; above that,
   each QUARTER of the current tier's interval. Per device: Every step ·
   Quarters · Off (`state.ui.achPings`, "auto" by default). At most one ping
   per badge per 10 seconds.

## How it works

### The engine (`js/core/achievements.js`, `KOS.achievements`)

- A REGISTRY, like Goals' types: each badge is `{id, set, name, what,
  owners, tiers, measure | v, total?, hidden?, soon? | soonIf?, title?,
  art}`. `owners` are the domains it reads (ledger, focus, study, exams,
  code, ja, mind, creatives, routines, organise, goals, money, collection,
  ink, files, assistant, reports, governor).
- `measure` READS the owner's record; nothing new is tracked. Expensive
  reads (one pass over the vault, Money's transactions, the review log's
  count, a notebook's pages) happen once per evaluation (`ctx.later`).
- **Owner events re-measure only their badges** (`touch(domain)`, debounced
  400 ms): the session ledger (`sessions.log` → the entry type's domains),
  a progress check (`store.setStatus`/`setCheck` → the subject's domain),
  the vault's writes, Money's `addTx`, Exams & Papers, an assessment's
  result, assignments, plan rows, IT units, the shop, goal completion,
  Creatives' works and milestones, Mind's explain-backs, positions and
  checkpoints, Japanese checkpoints and mining, ink, files and the Journal.
  The FULL sweep runs only at boot (2.5 s after) and every 30 minutes.
- **The ledger's rollup.** The session ledger keeps 2,000 entries, so a
  lifetime count read from it alone would fall. One cached pass gives every
  month's figures; months before this one are folded into
  `state.achievements.months` (max per field), and when the ledger is about
  to cut entries the current month is folded too. A lifetime count is the
  sum over months of the larger of the stored and the live figure.
- **Stored is only what was earned**: `earned[id] = {tier, at, t}`. The
  cloud merge treats `achievements.earned.*` and `achievements.months.*`
  MONOTONICALLY (`cloudmerge.js` `MONO_PATH`: numbers by the larger, times
  by the earlier), so no device can take back a tier the other earned.
- **Progress** is relative to the CURRENT tier interval,
  `(current − previous) / (next − previous)`, the same fraction the rim ring
  draws and the quarter pings use. A fully earned badge reads 1 whatever its
  evidence says now, so new content (a new unit, a new shop item raising an
  "all" target) never dims it. An unearned hidden badge reads 0.
- **Quiet** (invariant 163): no overlay and no ping while Focus runs, a
  dialog is open, or the Exam Room is on screen; the overlay waits and
  shows at the next calm moment (the Daily Review's rule).

### The page (`js/modules/achievements.js`, `#/achievements`)

Under Governor, no rail item; reached from the Governor's seat ("The Wall"
card), the notification of a tier earned, and the overlay.

- **The record** (35a): your avatar, level and title, your first day; four
  figures (days journeyed, badges, tiers, hours of focus); the showcase tray
  (six slots) with the achievement count and "Edit showcase".
- **Sets** (35b): the toolbar (owned / total, List view, the filter: All ·
  Earned · In progress · Locked · Study · Productivity · Collection · The
  app), then one panel per set: its panorama (or its colour wash and a large
  glyph), its name and count on the quiet left, its medals laid on the right,
  every second one lower (R1999's staggered lay).
- **A set opened** (35c): a carousel — the badge's name and what counts, one
  medallion per tier (earned with its date, the next with its progress, the
  rest dim), ‹ › and ←/→, a strip of the set's medals, "3 / 9".
- **List view** (35d): medal, name and what counts, the bar and
  "8 / 10 volumes", the date; sorted by set, nearest to done, or recently
  earned. Hidden badges are masked and always last.
- **Recent**, **Showcase** (pick up to six earned), **Titles** (a radio list).

### The light: one picture, five looks (`css/views/achievements.css`)

| State | Look |
|---|---|
| Locked | greyscale, brightness 38%, the rim's track only |
| In progress | `filter: grayscale(1 − p) brightness(0.38 + 0.52p)`; the rim ring fills to p in the set's hue |
| Nearly (p ≥ 0.9) | as above, the rim breathes |
| Earned | full colour, the rim in the set's metal (gold for a stage, track or path), one sweep of light on first view |
| Hidden | a silhouette with "?" until earned |
| Soon | the content is not released: dim, a dashed rim |

Tiers show as pips under the medal (bronze, silver, gold for the last).

### The unlock overlay and the ping

The overlay: the scrim darkens; the medal drops in at its dim look; light
rises through it to full colour and the rim flashes; a ring of the set's
colour bursts outward; the name, the tier, the set and the line fade up;
"View on the Wall" · "Next"/"Close". Several queue ("1 of 3"); past five the
rest are one card of small medals. Reduced motion shows it finished. Each
tier earned also writes ONE notification (kind `achievement`, id
`ach:<badge>:<tier>`, filter "Badges").

The ping: a chip at the top left under the header, three seconds — the medal
brightening from the old value to the new, the name, "8 / 10 volumes", a bar
moving. Polite to screen readers; never in the notification ledger; a hidden
badge never pings.

### The joins

- **Reports** (term and year): `f.badges` (the tiers earned in the period,
  their count, up to eight) and the story "Badges & tiers unlocked", drawn
  with the medals. Names are the app's own; the words' payload is untouched.
- **The share card**: "Showcase badges" (off by default, offered only with a
  showcase picked) draws your six on the card.
- **The Governor's seat**: the Wall card (count, title, showcase) and the
  title under your level.

## The catalogue

The source of truth is `js/core/achcatalogue.js`. 254 badges in 26 sets: 101
in fifteen domain sets (5.17) and 153 unit badges in eleven unit sets.

### Changes from the first plan, and why

| Badge | Change | Why |
|---|---|---|
| Regular | "days you did anything in the app" | days OPENED are not recorded; activity days are (the ledger) |
| The witching hour | something done 03:00–04:00 | opening the app is not recorded |
| Rest is work too | the rest streak reached (not its best) | only the current rest streak is derived |
| Lab keys (was Simulated) | labs unlocked, 5 · all | opening a lab is not recorded; unlocking is |
| Steady memory | months at ≥ 90% recall over 200 reviews | the plan's rule, from the ledger's month rollup |
| Ready | single tier | readiness is computed live and not kept per assessment |
| Under the clock (was The Room) | timed attempts | the Exam Room logs no separate mark; a timed attempt is the evidence |
| Daily 20 | days you passed a NEW Code task | the Daily 20's pick is computed, never stored (invariant 108); its completion is a first pass that day |
| Bug catcher | tiers 1 · all (2 projects today) | only The Lending Library and The Revision Planner carry planted bugs |
| Morning person, Wind down | the last 60 days, 7 · 21 · 45 | the Daily Review keeps 60 days of its own state |
| Big Questions | weeks closed, 4 · 12 · 26 | a Big Question is weekly |
| Conversations | the last 400 days | the Assistant's tally keeps 400 days |
| Week by week (was Reports read) | weekly reports SAVED | reading a report is not recorded |
| Library | files in Files | — |
| Wardrobe | "soon" until outfits are in the shop | roadmap 5.13's shop pass (18.5) adds them |

### Blocked (not registered)

| Badge | What it would need |
|---|---|
| Every room (every page opened) | a record of pages visited |
| Two devices | a list of this account's devices (cloud sessions are per device and never in the state) |
| Back on your feet (Critical → Healthy) | an HP history; the Governor keeps only the current HP |
| Every scene (Focus scenes) | Focus scenes (roadmap 5.13, release 6) |
| Pushed (GitHub commits) | the push status is per device in the media kv, with no count |
| Dialogues finished (Mind) | a dialogue's place is per device (`state.ui.mind`) and never recorded as finished |
| Scanned (pages scanned) | a scanned file carries no origin |
| Dress-up (every outfit tried on) | Try on is transient and never saved (invariant 26a) |

### Titles

Normally at Tier III. Explicit exceptions: Master of the Spine at Into the
green IV, Treasurer at Under budget IV, Timekeeper at Ahead of time II.

| Title | Badge · tier | Set |
|---|---|---|
| the Early Riser | Early bird III | Time with KurenaiOS |
| Night Owl | Night owl III | Time with KurenaiOS |
| the Unbroken | Kept going III | Streaks |
| Master of the Spine | Into the green IV | Study |
| Timekeeper | Ahead of time II | Exams & Deadlines (and Organised) |
| the Clear-Eyed | Know thyself III | Exams & Deadlines |
| Debugger | Green tests III | Code |
| Architect | Shipped III | Code |
| Polyglot | Words III | Japanese |
| Philosopher | Evaluated III | Mind |
| Wordsmith | Wordsmith III | Creatives |
| the Steadfast | Routine III | Routines and reviews |
| Treasurer | Under budget IV | Goals and Money |
| Bookworm | Bookshelf III | The Collection |
| Archivist | Library III | Pen, ink and files |
| Collector | Collector III | Kurenai and the Governor |

### The fifteen domain sets (101 badges)

Each badge: what counts · tiers · the record read.

**1 · Time with KurenaiOS.** Regular (activity days · 7/30/100/365 · the
ledger's months) · One year in (days since your first · 365 · `state.created`)
· Early bird (study started 04:00–06:59 · 1/10/50) · Night owl (study ended
23:00–02:59 · 1/10/50) · ★ The witching hour (03:00–04:00 · 1) · ★ First
light of the year (Focus on 1 January · 1).

**2 · Focus.** In the zone (completed sessions · 10/100/500/1,000) · Deep
hours (hours · 10/100/500/1,000) · Marathon (hours in one session · 2/3/4) ·
Unbroken (no pause · 10/50/200) · Full day (hours in a day · 4/6/8) · Change
of subject (a switched session · 1).

**3 · Streaks.** Kept going (best study streak · 7/30/100/365) · Rest is work
too (rest streak · 7/30) · Perfect week (Mon–Sun with study and a completed
routine every day · 1/4/12).

**4 · Study.** Into the green (topics Green · 10/50/100/all) · Card sharp
(flashcard reviews · 100/1k/10k/50k) · Steady memory (months ≥ 90% recall,
200+ reviews · 1/3/6) · Leech hunter (cards brought back from Rework · 5/25)
· Quiz runner (questions · 100/500/2,000) · Paper trail (papers logged ·
1/10/30/60) · Second attempt (redo items rated Good · 10/50) · Notes in the
margin (quick notes · 10/50) · Lab keys (labs unlocked · 5/all) · Companion
complete (an Exam Companion with every leaf's practice set logged · 1/all,
`set-<ref>` attempts) · Tuned to you (1,000 reviews in the log: FSRS fitting
eligibility, `KOS.fsrsOpt.MIN_REVIEWS` · 1,000).

**5 · Exams & Deadlines.** Dress rehearsal (mocks with a result · 1/5/10) ·
On target (results at or above target · 1/5) · Ready (an assessment Ready
before its day · 1) · Survived the season (a series over with every result ·
1) · Ahead of time (assignments done a day early · 5/20) · Under the clock
(timed attempts · 1/10/30) · Know thyself (prediction within 5 points · 1/5/15).

**6 · Code.** Green tests (tasks passed · 20/100/300) · Recall (retrievals
proven · 25/100/500) · Kata (10/50) · Shipped (Rider projects with every
milestone · 1/5/all) · Verified (CI-verified reports · 1/10) · No hints
(25/100) · Bug catcher (every planted bug caught · 1/all) · Daily 20 (days
with a new task passed · 7/30/100).

**7 · Japanese.** Hiragana (46 read, held three weeks · 46) · Katakana (46)
· Words (R held three weeks · 100/500/1k/2k) · Ear (L facets holding a week
· 100/1k) · Brush (kana W holding · 50/500) · Voice (S facets holding ·
50/500) · Checkpoint (1/5/10) · Immersion (hours of input · 10/50/200) ·
Sentence miner (lines saved · 10/50/200).

**8 · Mind.** Evaluated (concepts at Evaluate · 5/25/75) · Changed my mind
(positions revised · 1/5/20) · Journal (entries · 10/100/365) · Big
Questions (weeks closed · 4/12/26).

**9 · Creatives.** Studies (passed · 10/50/200) · Wordsmith (words ·
10k/50k/100k/250k) · Sketchbook (pages · 10/100/500) · Drills (days ·
10/50/150) · Portfolio (1/10/30) · Momentum (5/25) · Projects (1/5/all).

**10 · Routines and reviews.** Routine (completions · 30/100/365/1,000) ·
Morning person, Wind down (reviews in 60 days · 7/21/45) · Habit former
(habits kept 30 days · 1/5) · Every time (a several-times habit kept a week ·
1).

**11 · Organised.** Done and dusted (reminders · 50/250/1,000) · Handed in
(assignments · 5/25/100) · On the plan (plan rows · 25/100/300) · Caught up
(weeks ticked by their end · 1/10) · In step (a half-term — a run of school
weeks — with a personal row every week and no subject behind or unplanned ·
1) · Synced (Google or Todoist switched on · 1; the switch, not a proven
sync: real sign-in has not been tried, see the integrations plan).

**12 · Goals and Money.** Goal getter (1/10/50) · Every week (a repeating goal
met four periods in a row · 1/5) · Bookkeeper (transactions · 50/250/1,000) ·
Under budget (ended months with every budget kept, budgets as set now ·
1/3/6/12) · Saver (pots filled · 1/5) · Wish granted (1/10).

**13 · The Collection.** Binge (anime completed · 10/50/100/250) · Episodes
(500/2k/5k) · Bookshelf (physical volumes · 10/50/100/250) · Reader (books
completed · 10/50/100) · Route master (VN routes · 10/50) · Visual novels
(completed · 5/25/50) · Player (game hours · 100/500/1,000) · The Shrine
(favourites · 10/25/50) · Mirror (AniList rows in the vault · 1) · Backlog
clearer (a Steam import or VNDB rows · 1) · In season (shows finished in the
season they aired, from the row's journal · 1/10).

**14 · Pen, ink and files.** Handwritten (pages · 10/100/500) · Marked (past
papers marked in the PDF viewer · 1/10/30) · Write it out (drills by hand ·
10/50/200) · Clipper (figures and PDF regions clipped into topic notebooks ·
10/50) · Library (files · 25/100/500).

**15 · Kurenai and the Governor.** Conversations (days, last 400 · 10/50/200)
· On a schedule (10/100) · Week by week (weekly reports saved · 4/26/52) ·
Gold (earned, sum of awards · 10k/50k/100k/250k) · Level (10/25/50) ·
Collector (shop items · 10/50/all) · Wardrobe (soon).

### The unit sets (153 badges, art made)

CS units 4.1–4.13 (every leaf Green) · Maths P1–P10, S1–S5, M6–M9 (every
leaf Green) · IT F201 passed, F206 submitted · Code U1–U12 and Bridge B
(every lesson Completed), stages 1–4 (units and capstone), C1–C4 · Code
tracks T1A–T1F, T2A–T2E, CT1, CT2, T1, T2 · Japanese H, K, stage 0, F1–F6,
stage 1 (F1–F6 at their checkpoints; F3–F6 "soon" until released), stages
2–5 and the five tracks (soon) · Mind: every path (F, Y1–Y7, P1–P5, X1–X6)
and the three headers · Creatives: every unit (lessons and project) and each
track.

## The art still to make (Gemini, by hand)

- **Batch 26:** 26 set panoramas, 21:9 (`app.ach.pano.<set>`).
- **Batch 27:** 101 badges (`app.ach.<badge>`), keyed solid discs, 384 px.
- Waves 24–32 in `art-source/app/manifest.json`, each with its full prompt;
  generated by `node tools/gen_ach_defs.mjs && python3 -I
  tools/gen_ach_manifest.py`. After making them: the import, then
  `python3 -I tools/gen_ach_art.py`, and they appear.
- Plus the nine redos of 30 October.

## Claude Design

Design prompt 19 in [design-prompts.md](design-prompts.md): the Wall (frames
35a–35h). The page works today on the shared components; the pass refines
it.

## Invariants (161–163, in CLAUDE.md)

161 badges read, never pay · 162 earned only goes up · 163 never over
Focus, the Exam Room or a dialog; the first sweep is silent.
