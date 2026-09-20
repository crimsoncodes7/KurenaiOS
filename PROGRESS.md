# KurenaiOS delivery status

This file is the current delivery snapshot, not a turn-by-turn work diary. The
previous 4,000-line chronological record was consolidated on 9 August 2026; durable
architecture and safety rules remain in `CLAUDE.md` and `AGENTS.md`.

## Current state

**Category 7 Phases A–G is complete, integrated, deployed and
production-verified. The cloud three-way merge and the editable curriculum /
study editor are deployed on top of it (17 September 2026); the Collection
AniList mirror and the notification centre followed on 19 September 2026
(`b482f68`, `8dfe2d1`).**

| Item | Current value |
|---|---|
| Production | https://kurenai-os.pages.dev |
| Category 7 release checkpoint | `f81f2962dacfa07431355234737c8fbaa4070b7f` |
| Runtime release commit | `b467dc6` (VN progress sources, VNDB relay, list mirror, card bars), immutable https://a6725a56.kurenai-os.pages.dev |
| Phase G implementation | `a5cfe92831b88b047c32307ce32b7920c889dc25` |
| Release tag | `milestone/category-7-ui-ux-overhaul` |
| Service-worker cache | `kos-vn-progress-3` |
| Smoke gate | 54 suites (smoke39 needs a working `git`/`node` toolchain on the host) |
| Release date | 9 August 2026 |

Production deployment is separate from Git push and is performed only through
`tools/deploy_pages.sh`. The immutable Category 7 deployment is
https://bb17097f.kurenai-os.pages.dev.

## Unreleased on `main`

**Collection — VN progress by routes, chapters, hours or a percentage; the
VNDB write relay; half-full bars for series still releasing.** Deployed
20 September 2026 (`79e7c1b`); `vndb-ulist` deployed to Supabase.

- A VN's progress is derived from ONE source, chosen in the editor's
  "What counts" (`progressMode`) or picked automatically from what the
  entry carries: routes cleared, then chapters/parts completed, then
  hours played against VNDB's length estimate (`playtimeHours` vs
  `extra.lengthMinutes`, or the 1–5 length bucket as a rough figure),
  then a percentage the user sets (`progressPercent`). A kinetic novel
  counts by chapters and gets "+1 ch" on its card (the last chapter
  completes it); a first playthrough of an unstructured title logs hours
  and gets "+1 hr"; the percentage is the last resort. The derived
  `progress` carries its `unit` and an `estimate` flag; the shared
  `progressText` prints "2 / 4 ch", "12 / ~40 hr" and "40%". The source
  survives a VNDB pull, folds through `mergeRows`/`foldLocal` and counts
  as local data.
- VNDB still refuses `PATCH` from browsers (re-verified 20 September
  2026), so the write goes through a new `vndb-ulist` Edge Function
  (JWT-verified; the user's own token rides the one request and is never
  stored) whenever the user is signed in to cloud sync. `KOS.cloud.invoke`
  is the shared Edge Function call (ex `gameapi`). Signed out, the direct
  PATCH is still tried and its failure names the sign-in that fixes it.
  The token needs "modify my list" on vndb.org; Sync & Import says which
  it has.
- `KOS.media.progressFill/progressBar`: a known total is the honest
  fraction; a series still releasing (progress made, no total) is a
  half-full bar whose fill fades out and whose title says why; nothing
  started is no bar. Anime cards, the Books dual bar and compare panel,
  VN cards, the vault hero and the Overview "now" cards all read it.
- Follow-up (same day): AniList-owned custom lists now MIRROR — `syncList`
  reports every AniList list name and the merge lets AniList give and take
  membership in those, while app-only lists still union. The Books card bar
  is the shared `.med-track` fill (it was a 3px line in the unlifted accent,
  near-black on the card gradient) and every card fill lifts the accent
  toward white. The VN card no longer prints the quote count.
- Follow-up: a Books row read by the VOLUME (light novels — no chapter
  count, volumes read) now fills the bar against the series' volume count,
  or half-full/open without one; the Books card appends the identical
  shared `progressBar` at the same 4px as Anime and VN (the owned-vs-read
  comparison stays in the editor).
- `smoke54` covers the layer; gate 54/54.

**Pure Mathematics P1–P10 rewritten to full A-level depth, with diagrams
and self-marking past-paper practice.** Deployed 20 September 2026
(`e9c6350`).

- Every Pure sub-topic (1.1 through 10.5) is now paged notes in
  `js/data/content/maths-pure-p1.js` … `maths-pure-p10.js`: overview,
  concept pages in the specification's order, worked examples modelled on
  the Edexcel papers with M1/A1/B1 pills and a note on why each mark is
  earned or lost, fx-991CW routes, and an exam-toolkit page (command
  words, misconceptions, mnemonics). Prose is short lines and lists. The
  outline entries in `maths-pure.js` are gone; the file is deleted.
- `js/core/figures.js` renders declarative SVG diagrams from theme tokens
  (graphs with π axes, shaded areas, cobweb/staircase paths, triangles,
  vectors, trapezium strips) in notes and inside worked steps.
- `js/core/content.js` renders the worked-example card and derives each
  section's exam items from its exam-tagged cards
  (`KOS.content.examFromWorked`), so a question is authored once; the
  4.1 bank was re-verified against the real papers and two bank-a items
  corrected. Statistics and Mechanics (S1–S9) are unchanged — next.
- Service-worker `kos-pure-notes-1`; smoke gate 53/53.

**Pacing — my rows are ticked off, the unticked carry over, and the plan
links out.** Deployed 19 September 2026 (`bf28dbe`, `37ed66d`).

- A personal plan row carries a tick (`done`/`doneAt`, zero Governor
  traffic). An unticked row whose week has ended carries into every later
  week — derived, never moved — in a "Carried over · N behind" band with its
  origin week and how many weeks late, a "→ here" action to reschedule it,
  and a marker on the term ribbon. The week sub-line counts ticks and
  carry-overs.
- Links: class mocks, assessments and NEA milestones stand in the Countdown
  rail (Home, subject desks, the next-action ladder) dated by their week;
  Home carries a tickable "This week's plan" card that leads with what is
  behind and a "Behind on the plan" next action; the week page lists
  assignments due inside the week under each subject; a row's dialog offers
  the tick and "Remind me by the week's end" (a real reminder, tagged
  `pacing`); the week rolling over with work left is one notification.
- A class row now lists the week's lessons one per line (`lessonsOf` splits
  the scheme of work's own semicolon list; assessments and NEA items are
  toned) instead of one run-on line. Invariants 82/82a/82b; smoke49 §H;
  service-worker `kos-pacing-tick-2`.

**The notification centre, seasonal art of your own, the favicon.**
Deployed 19 September 2026 (`8dfe2d1`).

- `js/core/notify.js` is one ledger (`state.notify`) for everything the app
  used to only toast: fired calendar, reminder and assignment alerts (handed
  over by their own tickers, keyed by their once-only keys), an episode
  airing for a watched title (remembered from the airing cache and announced
  once it has aired), a Planner item reaching its release day. Housekeeping
  (sync, cloud) is deliberately not a notification. Read state syncs
  through the state document.
- `js/modules/notifications.js`: the bell in the global header with an
  unread badge and a five-row popover, and the full page under Archive with
  section filters, day groups, Mark all as read and the device-alert opt-in.
  Device alerts show as system notifications on a Mac or an installed phone
  app while Kurenai is open (no push server); `sw.js` opens what a tapped
  one is about.
- Seasonal lists every status of the season (watching first) — the overview
  schedule stays watching-only. The hero's scenery can be replaced with your
  own picture (upload or URL, positioned with the shared cropper, kept in
  media kv `hero.season.<SEASON>`), and the scrim now covers the art edge to
  edge. `icons/favicon.svg` gives the browser tab the 紅 seal.
  `smoke53` covers the layer; service-worker version `kos-notify-1`; gate
  53 suites.

**The Collection mirror — Anime and digital Books are 1:1 with AniList.**
Deployed 19 September 2026 (`b482f68`).

- Every AniList pull (Sync now and the autosync cycle) mirrors the list:
  `bulkUpsert` `replace.mirror` removes what AniList no longer carries (the
  "deleted on AniList but still here" ghosts), folds rows that share an
  AniList/MAL id into one, records tombstones, and refuses to act on an empty
  pull. The physical shelf and shelf-only hand-made books are untouched.
- The cross-device duplicate source is closed: the cloud media pull matches a
  remote row by provider identity when no local `syncId` matches, folds the
  two with a deterministic survivor and tombstones the loser; a one-time boot
  pass (`maint.dedupeAnilist`) folds what already accumulated.
- No manual add, metadata edit or Delete for Anime and mirrored Books: the
  record editor shows AniList's facts read-only and edits list state (pushed
  back) plus the personal layer. "Find new" creates on AniList first. The
  Books Digital lens lists AniList rows only; the Physical lens keeps its
  full CRUD and "+ Add to shelf".
- Titles are English-first (`KOS.anilist.pickTitle`), search matches either
  spelling; the vault card carries the score in the cover's top-left corner
  and a one-line status + "+1" hover row that no longer clips.
- Seasonal view lists in-progress titles only, under a credited scenery hero
  per season. The Collection overview is "what next?" only: an airing
  schedule grouped by day, on-the-go cards with their +1, the four vault
  doors; the figures and the status comparison moved to Analytics; the
  streak chips went; the Overview/Analytics switcher rides the page header.
  `smoke52` covers the layer; service-worker version
  `kos-collection-mirror-1`; gate 52 suites.

**Topic navigator — one control language, one status surface.** Deployed
18 September 2026 (`7e6d64f`).

- The topic page's material tabs, note-page pills and Edit pill were three
  competing systems. They are now one navigator: material tabs in a quiet
  inset tray with count chips; note pages as a direct Previous / named page /
  Next reader control (a `<select>`, so every page is one keystroke away with
  no wrap and no scroller); Edit as the one distinct utility action. The
  neighbour cards carry a directional accent edge instead of a card shadow.
- The header's status dot + dropdown duplicated the Inspector, which already
  owns status, progress checks and confidence. The Inspector is now the sole
  status surface. Service-worker version `kos-topic-nav-1`; gate 51 suites.

**The editable curriculum — every topic tab edits in place.** Deployed
17 September 2026 (`420388f`).

- `js/core/edits.js` forks a topic's material per kind (Specification, Notes,
  Flashcards, Quiz, Exam questions) into `state.edits`; readers take the
  effective material through `KOS.content.get()` and `KOS.srs.curriculumCards()`.
  Shipped files are never written; Reset to curriculum restores them exactly.
  Forked flashcards keep their SM-2 keys. Rows carry ids (deterministic for
  shipped rows) so the cloud merge folds two devices' forks of one topic.
- `js/modules/editor.js` is the study editor: an Edit control on the tab row
  opens it in the inspector's column (sticky beside the live page); block
  editor for Notes/Spec covering every renderer block type plus a new Markdown
  block and page breaks; row editors for cards, MCQs and multi-part exam items;
  formatting help; live re-render; per-device `ui.editing` survives redraws.
- `content.js` gains `{p}`/`{md}` blocks, a Markdown renderer (headings,
  fences, tables, lists, quotes, safe links) and math-safe inline markup.
- Study UI: the note-page stepper/disclosure is replaced by one numbered page
  strip in a declared scroller with chevrons; the article footer and the
  topic's previous/next are one shared card shape; the flashcard "Manage"
  panel is a clean deck browser with per-card history and hands off to the
  editor. Notes/Quiz/Exam tabs always exist with empty states that open the
  editor. `smoke51` covers the layer; service-worker version
  `kos-study-editor-2`; gate 51 suites.

**Cloud sync — devices merge instead of overwriting.** Deployed 17 September
2026 (`9bdec2f`).

- The state document was whole-document last-write-wins, then last-write-wins
  behind a guard that refused a stale push and asked which copy to keep. Both
  are gone. `js/core/cloudmerge.js` is a pure three-way merge against the last
  document this device and the cloud agreed on (`cloudsync.base.<uid>` kv):
  records by id with additions from both sides kept and deletions honoured,
  same-record edits combined field by field on `updatedAt`, gold/XP/HP additive
  against the base, owned cosmetics unioned, keyed maps per key. Per-device id
  collisions are detected and the local record re-keyed with its references
  rewritten.
- The push is a compare-and-set on `__seq` (`update … where state_json->>__seq
  = expected`); a lost race fetches, merges and retries. A pull onto a device
  with unsynced edits merges and pushes in the same cycle.
- First link never asks: an empty device adopts, an empty account receives, two
  histories merge with no base. The "Upload local data", "Keep this device" and
  "Use the cloud copy" dialogs and the `attention` chip state are removed.
- `focus.active` joined `state.ui` as per-device. A successful push broadcasts a
  data-free "changed" note on a Realtime channel (`kos-sync-<uid>`) so other
  open devices pull within seconds; timers stay the safety net.
- `smoke41` is now the merge suite (the 8 Aug 2026 incident stays as a
  regression test, expecting a merge with nothing lost); `smoke17`/`smoke48`
  fakes model the compare-and-set. Service-worker version `kos-cloud-merge-1`.

**Pacing — the integrated weekly timeline (Productivity → Pacing).** Staged
locally; NOT deployed.

- The school scheme of work, both personal curriculums and IT F201 were imported
  once from Notion into `state.pacing` (191 rows across 16 weeks, plus the week
  hub's school/personal offset). Notion is not read again; the store is the
  source of truth and rides localStorage, the standard full backup and the cloud
  state document.
- 144 of the 146 personal-curriculum topics are linked to existing generated
  specification leaves. Two Computer Science rows are deliberately unlinked
  because AQA 7517 names neither as a topic of its own: *Bitwise manipulation &
  masks* and *Linked lists*.
- The page reads study progress through those links and writes none; it logs no
  session and performs no network request.
- Two readings, one route: **Week** (`#/pacing/YYYY-MM-DD`) is the term ribbon
  over one week in three subject columns; **Braid** (`#/pacing/braid`) is the
  same evidence as a commit graph — a class spine per subject, my planned weeks
  ticked beneath it, and one packed branch per specification point the two
  share. Every branch is repeated as a button, which is the accessible route.
- The plan is fully editable: weeks and rows can be created, edited and deleted,
  with a searchable specification picker, derived week numbers, week moves that
  take their rows with them, and a cascade delete that says what it would take.
- Also fixed here: the phone tab bar's **More** entry never had `align-items`,
  so its 余 glyph pinned left of its label while the other four centred.
- Shared header clean-up that came out of the same review:
  `KOS.ui.pageHeader({sub})` now emits the canonical `.dh-sub > span.board`
  (14px/`--muted`) instead of a bare `<p>` that inherited body type — which
  also brings Mangaka and Collection Overview into line; and Reminders and
  Habits no longer restate the Productivity section nav in their own headers,
  where it was the same three destinations twice, 60px apart.
- Gate at this point: **49 / 49 smoke suites**, plus the responsive matrix
  (208 cells across both Pacing tabs, zero findings) and the visual audit.

## Past-paper question banks and the labs expansion (September 2026)

- Every CS (AQA 7517) and Maths (Edexcel 9MA0) leaf gained a bank of exam
  items, quiz questions and flashcards re-written from the Topic Practice
  compilation of past papers — 17 `bank-*.js` files loaded through the new
  `KOS.content.extend`. Totals now: CS 2597 cards / 1734 quiz / 923 exam items
  (1074 parts); Maths 1553 cards / 1025 quiz / 565 exam items (918 parts).
  Most leaves also carry a "Past-paper patterns" notes page distilling the
  mark-scheme phrasing. IT is untouched.
- The exam engine renders multi-part items with a provenance line, lettered
  parts, tariff filter chips, shuffle, per-part reveal and mark buttons, and a
  single self-mark log per item; the MCQ engine offers "Retry the N missed".
- 27 new simulations (15 maths: trapezium rule, cobweb, Newton–Raphson,
  tangent/first principles, sectors, sequences, normal curve, binomial test,
  sampling, scatter/regression, projectiles, v–t graphs, vectors, inclined
  plane, moments beam; 12 CS: Turing machine, BNF checker, Big-O curves,
  BFS/DFS, floating-point bits, character codes, error checking, ADC sampling,
  bitmap lab, compression, ciphers, subnetting) and 23 new worked-example
  generators, all wired to their topic pages.
- The Simulations view is a categorised, searchable card grid with an open
  state (back, spec ref, open-topic link, siblings); the Worked Example Engine
  gained search, Enter-to-generate and topic links; lab canvases now take their
  ink from the theme (`KOS.labPalette`) instead of a fixed dark palette.
- The topic page's study-nav row is static rather than sticky.
- HP no longer suspends anything: labs, simulations and the gold shop stay
  open at any HP (gold unlocks unchanged). HP keeps its state label, drains,
  recovery checklist and the halved restore trickle while Critical.
- Gate: **50 / 50 smoke suites** (smoke50 covers the banks and labs).

Before this ships: bump `VERSION` in `sw.js`, update the service-worker version
recorded in `CLAUDE.md` to match, then stage and deploy.

## Delivered product

### Curriculum and study

- 355 generated leaf specification points: AQA 7517 Computer Science (151),
  Edexcel 9MA0 Mathematics (89) and OCR AAQ IT (115).
- Deep content for all Computer Science and Mathematics leaves plus IT F201:
  structured notes, flashcards, quizzes, exam questions, mark schemes and
  examiner guidance.
- Inline worked-example generators, simulations, trace labs and free-form
  sandboxes.
- A single specification spine, content-first topic pages, topic inspector,
  progress/RAG evidence, Review workspace, assignments, attachments and topic
  comparison.

### Organisation, focus and economy

- Canonical assignment, reminder and calendar records; recurrence, countdowns,
  day/week/month compositions and derived cross-surface chips.
- Focus setup, running/minimised states, persistence, Pomodoro/custom timing,
  assignment linkage and completion review.
- SM-2 card scheduling, the session ledger, study/rest streaks and the Governor's
  HP/gold/XP economy with anti-farming boundaries.

### Collection and profiles

- Shared IndexedDB schema and UI across Anime, Books, Visual Novels and Games.
- AniList/VNDB sync, narrowly scoped write-back, provider profiles and history,
  optional IGDB/Steam server integrations, custom lists and lazy vault rendering.
- Budget Planner, Collection Goals v2, Shrine Hall of Fame, shared analytics and
  non-destructive image positioning.

### Cloud, PWA and Assistant

- Optional Supabase replication for state, media, tombstones and attachment
  metadata/binaries, while local writes remain authoritative. The state
  document merges three-way across devices; media rows are per-entry.
- Installable PWA with safe update prompts, derived shell precache and strict API
  cache exclusions.
- Kurenai Assistant provider layer, constrained tools, orchestration,
  conversations/projects, explicit-consent memory, full-page/drawer surfaces,
  static character states, voice cues, Markdown and mathematics.

## Category 7 closure

| Phase | Outcome |
|---|---|
| A — audit | Established the visual, responsive, accessibility and interaction baseline. |
| B — foundations | Consolidated theme tokens, five breakpoints and shared UI primitives. |
| C — Study/Home | Rebuilt the subject desk, topic shell and priority-led Home surface. |
| D — Collection | Unified vault shells, rebuilt Mangaka and refined Collection Overview. |
| E — responsive | Added canonical mobile search/navigation, compact sheets, calendar composition and Focus fixes. |
| F — accessibility | Added browser-owned hash routing, announcements, semantic interaction, search domains and target refinements. |
| E+F integration | Reconciled search lifecycle, focus restoration, mobile readiness and test numbering. |
| G — release quality | Closed theme/elevation/chart/empty-state inconsistencies and completed deployment verification. |

### Durable Category 7 contracts

- Five CSS breakpoints only: 1240, 1080, 860, 700 and 560 pixels.
- `KOS.ui.openDialog()` is the only modal insertion route; shared tabs, empty
  states, stat tiles, scrollers and headers use `KOS.ui` primitives.
- Browser history is the navigation history. Hash routes preserve `file://` and
  static-host compatibility; redraws never become navigations.
- `KOS.a11y.announce()` is the only live-region route; visible toast output is not
  announced a second time.
- Compact presentation moves and restores canonical controls rather than cloning
  routing, search, filters or data logic.
- Charts require enough evidence to be meaningful; zeros and meters are shown
  only when they communicate a decision-relevant fact.
- Shared elevation tokens are theme-derived and must preserve equivalent hierarchy
  in Dawn and Dusk.

Full engineering detail is in `CLAUDE.md` invariants 47–79.

## Release verification

### Automated gates

- All 47 jsdom smoke suites passed after the final integration.
- Pre-deployment responsive matrix: **1,192 cells**, zero overflow, amputated text
  or tab-bar overlap.
- Breakpoint-edge matrix: **912 cells**, zero findings.
- Omitted-view matrix: **16 cells**, zero findings.
- Mobile/tablet device audit: **46 captures**, all valid.
- Production Dawn/Dusk responsive audit: **72 cells**, zero findings.
- Production specialised visual audit: **34 captures**, all passed.
- Deployment staging passed its secret, environment-template and Live2D/Cubism
  leak checks. `js/env.example.js` is explicitly excluded from runtime output.

### Live acceptance

The production alias and immutable deployment were verified to serve identical
HTML, CSS and service-worker assets. Browser history, deep links, mobile More and
search, search choice/cancellation, canonical filter sheets, dialog Escape/focus
restoration, Calendar phone/tablet compositions and Focus compact states were
exercised on the deployed build.

## Test suite inventory

The numbered suites form one release gate:

- `smoke.test.js`–`smoke3.test.js`: core study engines, content, Governor, Focus,
  calendar and daily work.
- `smoke4.test.js`–`smoke17.test.js`: Collection schema, vaults, sync, planner,
  goals, shrine and image positioning.
- `smoke18.test.js`–`smoke20.test.js`: PWA/deployment, cloud replication and
  server-backed integrations.
- `smoke21.test.js`–`smoke28.test.js`: Assistant providers, tools,
  orchestration, memory, surfaces and live-integration contracts.
- `smoke29.test.js`–`smoke41.test.js`: Governor refinement, reminders,
  assignments, Focus, Calendar, shared media, static/Live2D character contracts
  and the cloud three-way merge (smoke41).
- `smoke42.test.js`–`smoke47.test.js`: Category 7 shared foundations, Study,
  Collection, accessibility/routing, responsive integration and Phase G release
  consistency.
- `smoke48.test.js`–`smoke51.test.js`: free-tier egress, the later Pacing and
  labs/bank work, and the editable curriculum / study editor.
- `smoke52.test.js`: the Collection AniList mirror — mirror pulls, duplicate
  folding, the cloud identity match, English titles and the UI contracts.
- `smoke53.test.js`: the notification centre — the ledger, every source, the
  bell and the page, device alerts, the favicon and the seasonal user art.
- `smoke54.test.js`: VN progress sources, the VNDB write relay and the
  open-ended progress bar.

Run all suites with:

```sh
for i in "" {2..54}; do node "tools/smoke${i}.test.js"; done
```

## Remaining work and external gates

These are not Category 7 release blockers:

- Live2D remains development-only. No Cubism runtime/model is deployable until
  the licensing question in `LICENSE_REQUEST.md` is resolved in writing and the
  manually drawn rig is complete.
- Real provider accounts, cloud projects, Supabase secrets and API credentials
  are operator-owned. Never commit them; use local environment files and platform
  secret stores.
- Any future custom domain, provider-policy change or commercial use requires a
  fresh operational/licensing review.
- The broader content and feature backlog should be scoped as new work rather than
  appended to this completed release record.

## Milestone summary

| Milestone | What it established |
|---|---|
| Builds 1–2 | Specification/content system, engines, labs, Governor, Focus and tracking. |
| Build 3 | Collection Matrix, provider sync/write-back, planner, goals and shrine. |
| Builds 4–5 | Cloud/PWA/server integrations and the Atelier visual/image foundation. |
| Category 6 | Kurenai Assistant, provider/tool/orchestrator layers and polished surfaces. |
| Builds 6.2–6.6 | Reminders, files, assignments, Focus and Calendar end-to-end workflows. |
| Category 7 | Complete responsive, accessible, visually consistent UI/UX release. |

Historical implementation detail remains recoverable from Git history and the
Category 7 audit (`KURENAIOS_FULL_UI_UX_AUDIT.md`); it is intentionally not
duplicated here.
