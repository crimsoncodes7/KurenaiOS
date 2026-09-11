# KurenaiOS delivery status

This file is the current delivery snapshot, not a turn-by-turn work diary. The
previous 4,000-line chronological record was consolidated on 9 August 2026; durable
architecture and safety rules remain in `CLAUDE.md` and `AGENTS.md`.

## Current state

**Category 7 Phases A–G is complete, integrated, deployed and
production-verified.**

| Item | Current value |
|---|---|
| Production | https://kurenai-os.pages.dev |
| Category 7 release checkpoint | `f81f2962dacfa07431355234737c8fbaa4070b7f` |
| Runtime release commit | `06893d22ddef02fe04b8514e8f9bc177866878d1` |
| Phase G implementation | `a5cfe92831b88b047c32307ce32b7920c889dc25` |
| Release tag | `milestone/category-7-ui-ux-overhaul` |
| Service-worker cache | `kos-cat7-phase-g-1` |
| Smoke gate | 47 / 47 suites passing |
| Release date | 9 August 2026 |

Production deployment is separate from Git push and is performed only through
`tools/deploy_pages.sh`. The immutable Category 7 deployment is
https://bb17097f.kurenai-os.pages.dev.

## Unreleased on `main`

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
  metadata/binaries, while local writes remain authoritative.
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
  and cloud conflict handling.
- `smoke42.test.js`–`smoke47.test.js`: Category 7 shared foundations, Study,
  Collection, accessibility/routing, responsive integration and Phase G release
  consistency.

Run all suites with:

```sh
for i in "" {2..47}; do node "tools/smoke${i}.test.js"; done
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
