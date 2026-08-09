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
