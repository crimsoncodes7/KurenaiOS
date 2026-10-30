# Achievements: the Badge Wall (roadmap 5.16 and 5.17)

Asked for 30 October 2026. A page of badges in the manner of Reverse: 1999's
"Fourth Wall" brochure (the user's screenshot): each SET is a painted
panorama with its round medallions laid over it, a count of what is owned
("199 / 202"), a list view, a filter, and a chosen showcase. A badge starts
dim and lights up as it nears completion, and earns its full colour with an
unlock overlay; progress along the way shows as a small notice. This file is
the plan; nothing is built. It waits for 5.13's art to be in (decision 1).

## Decisions to take (recommendations first)

1. **Order.** Build 5.16 (the platform with the 153 unit badges already made)
   after 5.13's releases 1–7a, in place of 5.13's step 7b; then 5.17 (the
   wider catalogue below) once its art is made. *Recommended.*
2. **Pay.** Badges pay NOTHING in XP, gold or HP: the work they recognise
   has already been paid (invariant 1, "pay once" everywhere). A few
   collection milestones unlock a TITLE shown under your name (cosmetic,
   free). *Recommended.* The alternative is a small gold purse per tier
   (25/75/200), which would double-pay the activity.
3. **Retroactive.** On the first run, what your history already meets is
   earned SILENTLY and shown once as a single "You already had 37 badges"
   summary, never 37 overlays. *Recommended.*
4. **Progress notices.** One small chip at the top left per change, at most
   one per badge per 10 seconds, on by default with a per-device switch
   (every step · at each quarter · off). *Recommended: every step for
   counts of 20 or fewer, each quarter above that.*

## How it works

### The model (`js/core/achievements.js`, `KOS.achievements`)

- A REGISTRY, like Goals' types (invariant 5b): each achievement is
  registered by the domain that owns its data with `{id, set, tiers:[n…],
  measure(), hidden?, title?}`. `measure()` READS the owner's record (the
  session ledger, `KOS.media`, `KOS.code`, `KOS.ja`, `KOS.routines`…) and
  returns a number; progress is never stored, so it cannot drift.
- STORED is only what was earned: `state.achievements = {earned: {"<id>":
  {tier, at}}, showcase: [ids], title}` (synced, keyed maps, merged per key;
  an earned tier only goes up). A badge once earned is never taken away,
  even if the data that earned it is later deleted.
- Evaluation is a pure read plus one write per new tier: after each
  `KOS.sessions.log()`, after each owner's save event, and on a 30-minute
  tick. `check()` compares measures to tiers and returns the changes;
  progress notices come from the difference against the last measure seen
  on this device (`state.ui.achSeen`, per device, so a pull from another
  device does not ping).
- Zero Governor traffic (decision 2). Pages only read (smoke56).

### The badge's light

One badge picture, five looks, driven by `p` = progress to the next tier
(0–1), entirely in CSS (`--p` on the element; no second image):

| State | Look |
|---|---|
| Locked, nothing yet | greyscale, brightness 35%, a faint rim |
| In progress | `filter: grayscale(calc(1 - var(--p))) brightness(calc(.35 + .5 * var(--p)))`; a thin ring round the rim fills to `p` |
| Nearly (p ≥ 0.9) | as above plus a slow breathing glow on the rim |
| Earned | full colour, a soft light sweep across it once on first view, the tier's pips lit |
| Hidden | a silhouette with "?" and no name until earned |

Tiers (I · II · III, and IV for the long ones) show as small pips under the
badge in bronze, silver and gold tokens; the picture is the same.

### The page (`#/achievements`, the Governor's "Wall")

Drawn after the screenshot, in the app's own design (Graphite, the rail):

- **Left, the sections:** Sets (the wall itself) · Recent · Showcase ·
  Titles. On a phone they are the page's tab strip.
- **Header:** the page title, "Owned 34 / 212", a List view switch, and a
  filter (All · Earned · In progress · Locked · by area).
- **The wall:** one PANEL per set, a painted panorama (21:9) with the set's
  name over its quiet left side and its badges laid on the right in a
  staggered grid (as the Rain Shelter panel lays its medallions). A panel
  is a button; opening it lists every badge in the set with its progress,
  tiers, the date earned and what counts.
- **List view:** the same badges as rows (badge · name · what counts ·
  progress bar · tier · date), sortable by nearest to done.
- **Edit showcase:** pick up to six badges for the Governor's seat and
  Home's greeting card; a title picked from those earned.

### The unlock overlay (`KOS.achUI.unlock`)

A full-screen celebration over the app when a tier is earned:

1. the scrim darkens (0.25 s);
2. the badge drops in at its dim locked look, centred, large;
3. light RISES through it from the bottom to full colour (0.8 s), the rim
   flashes, a ring of the set's colour bursts outward and fades;
4. the name, the tier ("II"), the set, and one line of what was done
   ("100 Focus sessions") fade up; "View on the Wall" and "Close".

Escape, a tap or Close dismisses it; several earned at once queue and show
as "1 of 3"; past five the rest are one summary card. It never opens over a
running Focus stage, the Exam Room, a dialog or a deep link: it waits and
shows on the next calm moment (the Daily Review's rule, invariant 145).
Reduced motion shows the finished badge at once. Each unlock also writes one
notification (a new kind, `achievement`, id `ach:<id>:<tier>`) and can be
muted like any kind.

### The progress notice (`KOS.achUI.ping`)

A small chip at the top left, under the header, for three seconds:
the badge at its new brightness, its name, "8 / 10 physical books" and a
thin bar moving from the old value to the new. One at a time (a queue, newest
first, collapsed per badge); never in the notification ledger; announced
politely to screen readers; off in Focus and the Exam Room.

## The art

- The 153 unit badges already made (batches 11, 21–25) are the first sets.
- New for 5.16: one painted PANORAMA per set (21:9, quiet left half, no
  people, no text) — about 20 — and the page's header art. One Gemini wave
  and a half.
- New for 5.17: one badge per achievement below that is not a unit badge,
  about 120, in the same enamel-pin style on #00FF00 and marked `solid`,
  each set in its own colour. Eight waves.
- Prompts go into `art-source/app/manifest.json` as batches 26 (panoramas)
  and 27–34 (badges) when 5.16 is planned in detail.

## The catalogue (5.17)

Roman numerals are tiers; the numbers are the thresholds. ★ marks a hidden
badge. Every measure reads an existing record; none needs a new one except
where noted.

### Set 1 · Time with KurenaiOS (the app)

| Badge | What counts | Tiers |
|---|---|---|
| Regular | Days the app was opened | 7 · 30 · 100 · 365 |
| One year in | A year since the first session in the ledger | — |
| Early bird | A study session started before 07:00 | 1 · 10 · 50 |
| Night owl | A study session ended after 23:00 | 1 · 10 · 50 |
| ★ The witching hour | The app opened between 03:00 and 04:00 | — |
| ★ First light of the year | A Focus session on 1 January | — |
| Every room | Opened every main page at least once | — |
| Two devices | Signed in to cloud sync on a second device | — |

*Needs:* a per-day "opened" mark (`state.ui` is per device, so a small
synced `opened` day set; the ledger alone misses days with no session).

### Set 2 · Focus

| Badge | What counts | Tiers |
|---|---|---|
| In the zone | Completed Focus sessions | 10 · 100 · 500 · 1,000 |
| Deep hours | Focus hours, total | 10 · 100 · 500 · 1,000 |
| Marathon | One session of 2 hours or more | 2 h · 3 h · 4 h |
| Unbroken | Sessions completed with no pause | 10 · 50 · 200 |
| Full day | 6 hours of focus in one day | 4 h · 6 h · 8 h |
| Change of subject | A session switched mid-way (invariant 4a) | — |
| Every scene | Focused in every Focus scene you own | — |

### Set 3 · Streaks

| Badge | What counts | Tiers |
|---|---|---|
| Kept going | The study streak's best run | 7 · 30 · 100 · 365 |
| Rest is work too | The rest streak's best run | 7 · 30 |
| Perfect week | Seven days, each with study and a completed routine | 1 · 4 · 12 |
| Back on your feet | Recovered from Critical HP to Healthy | — |

### Set 4 · Study (CS, Maths, IT)

| Badge | What counts | Tiers |
|---|---|---|
| Into the green | Topics at Green (RAG) | 10 · 50 · 100 · every leaf |
| Card sharp | Flashcard reviews | 100 · 1,000 · 10,000 · 50,000 |
| Steady memory | A month at 90% retention or better, 200+ reviews | 1 · 3 · 6 |
| Leech hunter | Cards brought back from Rework | 5 · 25 |
| Quiz runner | Quiz questions answered | 100 · 500 · 2,000 |
| Paper trail | Past papers logged | 1 · 10 · 30 · 60 |
| Second attempt | Redo items cleared | 10 · 50 |
| Notes in the margin | Quick notes filed | 10 · 50 |
| Simulated | Labs and simulations opened | 10 · all owned |

Plus the per-unit sets already made (CS 13, Maths 19, IT 2), each earned
when its unit is Green (IT: passed), as 5.13's batch 25 says.

### Set 5 · Exams & Deadlines

| Badge | What counts | Tiers |
|---|---|---|
| Dress rehearsal | Mocks sat with a result | 1 · 5 · 10 |
| On target | A logged result at or above its target grade | 1 · 5 |
| Ready | An assessment reaching "Ready" before its date | 1 · 5 |
| Survived the season | An Exam Season ended with every exam logged | — |
| Ahead of time | Deadlines handed in a day or more early | 5 · 20 |
| The Room | A paper sat in the Exam Room, timed | 1 · 10 |

### Set 6 · Code

| Badge | What counts | Tiers |
|---|---|---|
| Green tests | Tasks passed (first passes) | 20 · 100 · 300 |
| Recall | Retrievals proven | 25 · 100 · 500 |
| Kata | Katas done | 10 · 50 |
| Shipped | Rider projects accepted | 1 · 5 · all |
| Verified | A CI-verified report | 1 · 10 |
| Pushed | Commits pushed to GitHub | 1 · 50 · 200 |
| No hints | Tasks passed with no hint and no answer seen | 25 · 100 |

Plus the per-unit, stage, track and capstone badges already made (36).

### Set 7 · Japanese

| Badge | What counts | Tiers |
|---|---|---|
| Hiragana | Every hiragana's facets holding | — |
| Katakana | Every katakana's facets holding | — |
| Words | Words with R held a week | 100 · 500 · 1,000 · 2,000 |
| Ear | Listening facets passed | 100 · 1,000 |
| Brush | Kana written by hand and passed | 50 · 500 |
| Checkpoint | Checkpoints passed | 1 · 5 · 10 |
| Immersion | Hours of Japanese media in Focus | 10 · 50 · 200 |

Plus the stage and unit badges already made (19).

### Set 8 · Mind

| Badge | What counts | Tiers |
|---|---|---|
| Evaluated | Concepts at the ladder's Evaluate | 5 · 25 · 75 |
| Changed my mind | Positions revised with a reason | 1 · 5 · 20 |
| Journal | Journal entries | 10 · 100 · 365 |
| Dialogues | Socratic dialogues finished | 1 · 10 · all |
| Big Questions | Big Questions answered | 7 · 30 |

Plus the path and unit badges already made (22).

### Set 9 · Creatives

| Badge | What counts | Tiers |
|---|---|---|
| Studies | Studies passed | 10 · 50 · 200 |
| Words | Words written at the Writing Desk | 10k · 50k · 100k · 250k |
| Sketchbook | Pages saved from the sketchbook | 10 · 100 · 500 |
| Drills | Drill days | 10 · 50 · 150 |
| Portfolio | Pieces promoted | 1 · 10 · 30 |
| Momentum | Studies done with Momentum on | 5 · 25 |
| Projects | Unit projects finished | 1 · 5 · all |

Plus the track and unit badges already made (42).

### Set 10 · Routines and the reviews

| Badge | What counts | Tiers |
|---|---|---|
| Routine | Routine completions | 30 · 100 · 365 · 1,000 |
| Morning person | Morning Reviews finished | 7 · 30 · 100 |
| Wind down | Evening Reviews finished | 7 · 30 · 100 |
| Habit former | A habit kept 30 days in a row | 1 · 5 |
| Every time | A several-times-a-day habit kept a whole week | — |

### Set 11 · Organised (Reminders, Assignments, Calendar, Pacing)

| Badge | What counts | Tiers |
|---|---|---|
| Done and dusted | Reminders completed | 50 · 250 · 1,000 |
| Handed in | Assignments completed | 5 · 25 · 100 |
| On the plan | Plan rows ticked | 25 · 100 · 300 |
| Caught up | A week with no carried-over row | 1 · 10 |
| Synced | Google Calendar or Todoist connected | — |

### Set 12 · Goals and Money

| Badge | What counts | Tiers |
|---|---|---|
| Goal getter | Goals reached | 1 · 10 · 50 |
| Every week | A repeating goal met four periods in a row | 1 · 5 |
| Bookkeeper | Transactions logged | 50 · 250 · 1,000 |
| Under budget | Months with every budget kept | 1 · 3 · 6 · 12 |
| Saver | Pots filled to their target | 1 · 5 |
| Wish granted | Wishlist items bought through the planner | 1 · 10 |

Amounts are never shown on a badge (Hide amounts, invariant 5a).

### Set 13 · The Collection

| Badge | What counts | Tiers |
|---|---|---|
| Binge | Anime completed | 10 · 50 · 100 · 250 |
| Episodes | Episodes watched | 500 · 2,000 · 5,000 |
| Bookshelf | Physical books (volumes owned) | 10 · 50 · 100 · 250 |
| Reader | Books and manga completed | 10 · 50 · 100 |
| Route master | VN routes completed | 10 · 50 |
| Visual novels | VNs completed | 5 · 25 · 50 |
| Player | Game hours | 100 · 500 · 1,000 |
| The Shrine | Titles in the Shrine | 10 · 25 · 50 |
| Mirror | AniList connected and synced | — |
| Airing | Seasonal shows finished in their season | 1 · 10 |

### Set 14 · Pen, ink and files

| Badge | What counts | Tiers |
|---|---|---|
| Handwritten | Pages written | 10 · 100 · 500 |
| Marked | Papers marked on the PDF viewer | 1 · 10 · 30 |
| Scanned | Pages scanned | 10 · 100 |
| Library | Files in Files | 25 · 100 · 500 |

### Set 15 · Kurenai and the Governor

| Badge | What counts | Tiers |
|---|---|---|
| Conversations | Days you chatted with Kurenai | 10 · 50 · 200 |
| On a schedule | Scheduled messages that ran | 10 · 100 |
| Reports read | Weekly reports opened | 4 · 26 · 52 |
| Gold | Gold earned in all (sum of awards) | 10k · 50k · 100k · 250k |
| Level | Governor level | 10 · 25 · 50 |
| Wardrobe | Kurenai's outfits owned | 1 · 4 · all |
| Collector | Shop items owned | 10 · 50 · all |
| ★ Dress-up | Tried on every outfit in the shop | — |

### Titles (decision 2)

Earned from a few tier-III badges and shown under your name: *the Unbroken*
(Kept going III), *Bookworm* (Bookshelf III), *Archivist* (Library III),
*Night Owl* (Night owl III), *Polyglot* (Words III), *Debugger* (Green
tests III), *Philosopher* (Evaluated III), *Wordsmith* (Words, Creatives,
III), *Collector* (Collector III).

## Build, one release each

- **5.16a** the model and the unit sets (smoke113): the registry, the
  evaluation, `state.achievements`, the unit badges' measures, the
  retroactive pass.
- **5.16b** the page, the light, the overlay and the notice, from a Claude
  Design pass (design prompt 19: frames 34a–34g — the wall, a set opened,
  the list, the showcase, the overlay's four beats, the notice, the phone).
- **5.17** the catalogue above, set by set as each set's badge art arrives.

Invariants to add when built (161–163): badges read, never pay; earned only
goes up; the overlay and the notice never interrupt Focus, the Exam Room or
a dialog.
