# Reports — implementation plan (roadmap 5.1)

From the Claude Design handoff `design_handoff_kurenaios_reports` (turns 24–25:
frames 24a–24l, 25a–25g, and the playable `KurenaiOS Wrapped` story).
Approved 12 October 2026 with the four recommendations below. All seven phases
are built (smoke68–72).

## What the handoff asks for

- **Four periods:** week (Mon–Sun), month, term (from the plan), academic year
  (Sept–Aug).
- **Two forms per report:**
  - **The story:** a tap-through, Wrapped-style player. Weekly has 8 slides,
    Monthly 9, Termly 11, Yearly 20. They are built from 13 slide layouts and
    include quizzes.
  - **The report:** a page you browse (25a). Every card opens a **full
    overview** inside Reports (25b–25e).
- **Words** come from a rule-based template by default, or from Kurenai,
  which is sent totals only (24f).
- **Around the reports:**
  - Low-data rules (24g).
  - A Home card and a new "Reports" bell kind (24h).
  - A share card and an export dialog with PNG, PDF, text and CSV (24k).
  - Phone layouts and a Dawn pass (24i, 24j, 25f, 24l).
- **Saving:** reports are saved when their period ends and are never
  recomputed (README rule 7).

## The data audit: what exists, what does not

The design assumes facts the app does not keep yet. This decides the order of
work.

| Fact in the design | Source today | Status | Fix |
|---|---|---|---|
| Study time, sessions, by subject/day/hour | session ledger (Focus `dur`, timed entries) | ✓ | — |
| Reviews, recall, quizzes, exam questions | ledger `metrics` (again/hard/good/easy, pct, marks) | ✓ | — |
| Topics touched | ledger `refs` | ✓ | — |
| Topic status change ("Amber → Green", mastery by unit) | `KOS.rag.effective()` is live only — no history | ✗ | a status **snapshot** saved with every report, plus a baseline taken the day this ships |
| Focus blocks, timeline, heat grid, persona, block lengths, modes | ledger focus entries (end `ts`, `dur`, `mode`) | ✓ | — |
| Plan ticked / carried, plan against class | `state.pacing` (`done`, `doneAt`, `carriedInto`, braid verdicts) | ✓ | — |
| Reminders done, habits kept | `reminders.completedAt`, habit `days` map | ✓ | — |
| Results, IT units | `KOS.tracker`, `KOS.itUnits` | ✓ | — |
| Terms | plan weeks (`isBreak`) | ✓ derivable | a term ends at a break of 2+ weeks (Christmas, Easter, summer); half terms stay inside |
| XP / gold **earned in the period**, level | running totals only (`g.xp`, `lastAward`) | ✗ | record each session's award on its ledger entry from now on, and a Governor **snapshot** (xp, gold, level) with every report |
| Streaks at period end | derivable from the ledger | ✓ | — |
| **Collection titles touched, with "ep 14–16"** ranges, started / finished / paused / dropped this week, scores given this week | only row state now; a sync logs one session with 5 titles | ✗ | a per-title **activity journal** on each media row (below) |
| Genres, studio (anime), author (books), developer (VN), format, start/finish dates, score, cover | stored | ✓ | — |
| AniList tags ("Tags and themes") | not pulled (`tags` is the personal layer) | ✗ | add `tags { name rank }` to the AniList pull, stored as `extra.aniTags` so the personal tags are never touched |
| Country of origin ("Where it came from") | not pulled | ✗ | add `countryOfOrigin` to the AniList pull; VNDB `olang` |
| Episode length (for "≈ 21 h 50 m") | not pulled | ✗ | add `duration` to the AniList pull; chapters estimated (shown with ≈, as the design does) |
| Top voice actor, creator portraits | not stored | ✗ | **defer**: a characters/voice-actors query for 650 titles is heavy; the section is left out until the data exists (zero rule) |
| Kurenai chats, the 07:00 plan count, "asked about" by area | conversations in Supabase (signed in); schedule `last` only | partial | a small daily tally in `state.assistant.tally` (chats, scheduled sends, areas by tool domain) |
| A year of history | ledger is capped at 2,000 entries | ✗ for years | months, terms and years **roll up from saved weekly facts**, never from the raw ledger |

### The Collection activity journal

- Every material change to a media row appends one compact event to the row
  itself: `journal: [[date, kind, from, to], …]`. The kinds are progress,
  volumes, status, score, route cleared, chapter and playtime.
- It hooks the one place changes land: `mediadb` merge and put, which
  already compares material fields (invariant 36a). Manual edits, +1, and
  every AniList, VNDB and import pull all pass through it.
- **It syncs with the row,** so a title advanced by the phone's autosync is
  in the laptop's weekly report.
- It is capped (the last ~400 days, or 200 events per title). It is not an
  index, so it needs no DB version (invariant 6), and a no-op merge still
  never restamps.
- **Trade-off:** two devices changing the same title within one sync window
  keep one device's events (row-level last write wins). This is rare and
  costs a single progress step.

## Architecture

| Piece | File | Contract |
|---|---|---|
| Period maths: ISO weeks, months, terms from the plan, academic years; "has this period ended" | `js/core/report.js` | pure |
| The facts builder `KOS.report.build(period, start, end)`: zero and evidence rules applied at build, so a section with no evidence is simply absent | `js/core/report.js` | a pure read of the single sources (`hub.js` statistics, invariant 26d); writes nothing |
| Roll-up: month, term and year from saved weekly facts plus that period's own snapshots | `js/core/report.js` | pure |
| Personas (Focus timing, block length, regularity; media habits) and story lists per period, each with its evidence floor | `js/core/report.js` | pure |
| Template words | `js/core/reportwords.js` | pure, deterministic |
| Kurenai words: one `KOS.ai.chat` request with structured `{headline, narrative}`, totals only, states idle / generating / failed | `js/core/reportwords.js` | metered; never a tool call |
| Saved reports: local-first store, index per period, save at period end, backfill, immutable apart from `words` | `js/core/reportstore.js` | see decision A |
| The saving tick: on the first open after a period ends (weeks after Mon 07:00), build, save, and push the `reports` notification; claimed like a schedule so two devices do not both save | `js/core/reportstore.js` | — |
| Reports page and overview pages: routes `#/reports/<period>[/<id>[/<section>]]` | `js/modules/reports.js` | `KOS.views.reports` under Home, no rail item |
| Story player and its 13 layouts | `js/modules/reportstory.js` | elapsed-time motion, reduced motion, keys, swipe, quiz |
| Share card (the 22d finish) and the export dialog | `js/modules/reportshare.js` | reuses the Shrine card's canvas drawing; PDF via a print stylesheet |
| Home card, bell kind `reports` with its filter chip, search entry | `home.js`, `notify.js`, `notifications.js`, `search.js` | — |
| Styles | `css/views/reports.css` (`@layer views`), new tokens in `tokens.css` | k- classes, no hook selectors, five breakpoints |

## Decisions (taken 12 October 2026: the recommendations)

**A · Where saved reports live.** A weekly report holds about 60 title rows,
so a year of reports is too large for the synced state document.
- **Recommended:** a local IndexedDB store (`kurenai-os-reports`) as the
  primary copy, replicated to a new Supabase table `kos_reports`. It is
  owner-only under row-level security and works like conversations; it needs
  one migration. Signed out, reports still work on that device (invariant
  31).
- **Alternative:** the state document with retention, keeping title rows
  for the last 12 weeks only and compacting older weeks to totals. It needs
  no migration, but older weekly overview pages lose their title grid.

**B · Backfill.** Should reports be built for the periods since 1 Sep from
history when this ships?
- **Recommended:** yes, marked "rebuilt from history".
- Those reports would leave out what history cannot support: status changes,
  title progress ranges and earned XP. Weekly backfill is limited by the
  ledger cap, so it covers roughly the last few months.

**C · Voice actors and creator portraits.** Recommended: defer. "Top studio"
and "top author" work from data already stored; the voice-actor card stays
hidden until a later pass adds the data.

**D · Collection time.** Episodes × length and chapters × an estimate, always
shown with ≈, as the design does.

**Chosen:** A local store plus `kos_reports`; B backfill, marked; C deferred;
D estimates with ≈.

## Phases (each one shippable)

1. **Start collecting.** ✓ Built. This goes first, because every day before it ships
   is history the reports will never have.
   - The media activity journal.
   - AniList `tags`, `countryOfOrigin` and `duration`; VNDB `olang`.
   - The award recorded on each session entry.
   - The status and Governor baseline snapshots.
   - The Assistant tally.
   - Tests.
2. **The model.** ✓ Built. The `reports` notification kind moves to phase 3,
   with the page it opens (`announce()` is a no-op until the kind exists).
   - Period maths, the weekly facts builder with the zero and evidence
     rules, template words and personas.
   - The store (decision A), saving at period end, backfill (decision B)
     and the `reports` notification kind.
   - Fixture tests for every rule in the README's "Rules" list.
3. **The weekly report.** ✓ Built. The story hero's ▶ Play and its
   thumbnails wait for the player (phase 5); until then the hero carries the
   headline and narrative. The period switch appears with months (phase 6).
   - The Reports page (24a, with the 25a layout).
   - The weekly report and the overview pages: Week › Study, Week › Focus
     and plan, Week › Collection (25b–25d).
   - The low-data states (24g).
   - Phone (24i, 25f) and Dawn (24l).
   - **Release.**
4. **Kurenai's words.** ✓ Built. The switch, generating, written / regenerate, the
   fallback, and the "What is sent" panel (24f).
5. **The story and sharing.** ✓ Built: the player with the layouts the weekly
   story uses (intro, big number, top list, bars, highs and lows, quiz,
   cover mosaic, persona, recap); the ranked bars, flow, compare and three
   cards layouts come with the month, term and year stories (phase 6).
   - The player with all 13 layouts and the weekly story list.
   - The Home card (24h) and the bell.
   - The share card and the export dialog (24k).
   - **Release.**
6. **Month, term and year.** ✓ Built: terms follow the school weeks; the
   remaining story layouts (ranked bars, flow, compare, three cards) came
   with them.
   - Monthly (24c), Termly (24d), Yearly with its seven chapters and the
     sticky chapter chip (24e, 24j) and Year › Collection (25e).
   - Their story lists.
   - **Release.**
7. **Replication and polish.** ✓ Built: `kos_reports` (migration
   `20261012000001`, applied), the responsive audit over every report page
   at 1920/1440/820/390/360 in Graphite and Dawn (0 findings).
   - `kos_reports` replication, if A is chosen.
   - The responsive and visual audits on every report page, both themes.

## Tests

- New smoke suites, so the gate grows past 67:
  - report period maths, the facts builder against fixed fixtures, and every
    zero, evidence and comparison rule;
  - the store: save once, immutable facts, words-only updates, two-device
    claim;
  - the journal: a no-op merge appends nothing, sync deltas append, cap;
  - the player: navigation, quiz, reduced motion;
  - the views: render purity entries in `tools/baselines/render-purity.json`.
- The responsive audit gains the Reports views at 390 and 360, Graphite and
  Dawn.

## Invariants this adds

- **Reports are derived and saved:** facts are built from the single sources
  (26d) and never recomputed once saved; only `words` change.
- **Zero traffic:** reports make no Governor writes, no sessions, and no
  provider calls other than the one optional Kurenai request per report.
- **Kurenai's payload** carries totals only, never notes, card text, titles
  or chat history (71, 71a).
- **Share and export:** Collection titles are off by default.
- **The journal** is part of the media row, capped, and appended only on a
  material change (6, 36a).
- **The `reports` notification kind** (95).
