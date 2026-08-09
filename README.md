# 紅 KurenaiOS

KurenaiOS is a local-first study and personal-organisation workspace for A-level
Computer Science, Mathematics and IT. It combines the official specification
spine, deep revision material and interactive labs with spaced repetition,
planning, focus sessions, progress analytics, a media Collection, cloud sync and
an optional AI assistant.

The application is plain HTML, CSS and JavaScript: there is no bundler and no
compile step. It runs directly from `index.html`, as an installable PWA on HTTPS,
or at the production site:

**[kurenai-os.pages.dev](https://kurenai-os.pages.dev)**

## Current release

Category 7 (the complete UI/UX overhaul, Phases A–G) is integrated, deployed and
production-verified as of **9 August 2026**. The release includes the Atelier Dawn
and Dusk themes, shared UI primitives, redesigned Study and Collection surfaces,
mobile compositions, browser-native routing, accessibility refinements and a final
visual-consistency pass.

- Source checkpoint: `f81f2962dacfa07431355234737c8fbaa4070b7f`
- Runtime release commit: `06893d22ddef02fe04b8514e8f9bc177866878d1`
- Release tag: `milestone/category-7-ui-ux-overhaul`
- Service-worker cache: `kos-cat7-phase-g-1`
- Verification: all **47 smoke suites** plus the responsive, device and visual
  audit gates passed before deployment and again against production.

The concise delivery record is in [PROGRESS.md](PROGRESS.md). Engineering contracts
live in [CLAUDE.md](CLAUDE.md), with the shorter execution rules in
[AGENTS.md](AGENTS.md).

## Run locally

For basic local use, open the file directly:

```sh
open index.html        # macOS
xdg-open index.html    # Linux
```

Use a local HTTP server when testing the service worker, cloud integrations or
browser automation:

```sh
python3 -m http.server 8765
# then open http://127.0.0.1:8765/index.html
```

Core study and organisation features remain usable offline. Network-backed sync,
provider search and AI providers naturally require a connection. KaTeX and the
web fonts are CDN-hosted, so their offline fallbacks are raw maths text and system
fonts.

## Main workspaces

### Study

- The complete AQA 7517 Computer Science, Edexcel 9MA0 Mathematics and OCR AAQ IT
  specification trees: **355 leaf specification points**.
- Deep structured notes, flashcards, quizzes, exam questions, mark schemes and
  examiner guidance across all of Computer Science and Mathematics plus IT F201.
- Inline simulations, worked-example generators, trace labs and SQL, regex,
  number-base, Little Man Computer and C# OOP sandboxes.
- Topic progress, RAG evidence, assignment tracking, Review (SM-2 due cards and
  card statistics), attachments and cross-subject topic comparison.

### Productivity and Governor

- Calendar, recurring events, reminders, assignments, countdowns, habits and
  daily recommendations share canonical records instead of copying data.
- Focus Timer supports Pomodoro/custom sessions, reload recovery, distraction and
  pause accounting, assignment links and a post-session review.
- The Behavioural Governor derives streaks, HP, gold, XP and rewards from the
  session ledger. Only labs, simulations and the shop can be gated; revision and
  Focus are always available.

### Collection

- IndexedDB vaults for Anime, Books, Visual Novels and Games, with lazy rendering,
  shared editors, filters, analytics and non-destructive cover positioning.
- AniList and VNDB pull sync, narrowly scoped write-back, profiles, provider
  history and autonomous sync. Games retain manual-first operation with optional
  server-backed IGDB search and reviewed Steam import.
- Budget Planner, Collection Goals and the Shrine Hall of Fame remain local-first
  and cannot duplicate Governor rewards.

### Assistant, cloud and PWA

- Kurenai Assistant supports Gemini, Ollama and compatible provider seams,
  conversation/project organisation, streaming, explicit-consent memory and a
  constrained tool layer.
- Supabase adds optional sign-in, multi-device state/media/attachment replication
  and server-side integrations. Local persistence remains authoritative and the
  app is fully usable signed out.
- The service worker precaches the shell, excludes API traffic and offers updates
  only after user confirmation.

## Data and privacy

- Core state is autosaved in `localStorage`.
- Media records, attachments and provider credentials use origin-scoped IndexedDB.
- Full Backup & Restore includes state, media, non-token preferences and
  attachments; AniList/VNDB credentials, Supabase sessions and other tokens are
  intentionally excluded.
- `file://`, localhost and production are different browser origins and therefore
  have separate stores.
- Cloud sync and the Assistant are opt-in. Search excludes tokens, provider logs,
  session ledgers and assistant audit data by construction.

## Architecture at a glance

KurenaiOS uses classic script tags and one global `KOS` namespace. Load order in
`index.html` is part of the architecture.

| Area | Primary location |
|---|---|
| Persistence, UI, routing, search, economy | `js/core/` |
| Page and workspace views | `js/modules/` |
| Flashcard and quiz engines | `js/engines/` |
| Simulations, worked examples and sandboxes | `js/labs/` |
| Hand-authored revision content | `js/data/content/` |
| Generated specification trees | `js/data/compsci.js`, `maths.js`, `it.js` |
| Visual system and responsive layout | `css/main.css` |
| Data pipeline, audits, deployment and tests | `tools/` |
| Supabase schema and Edge Functions | `supabase/` |

Do not hand-edit the three generated specification files. Change the parser and
regenerate with `tools/gen_data.py`; use `--format-existing` only for a
payload-preserving layout refresh. See [AGENTS.md](AGENTS.md) before editing.

## Tests and audits

Install the test-only dependencies once:

```sh
npm install jsdom fake-indexeddb
```

Run the complete smoke gate:

```sh
for i in "" {2..47}; do node "tools/smoke${i}.test.js"; done
```

Responsive or shared-component changes also require a dense responsive audit and
screenshots. Image, hero, chart or broad visual changes require the specialised
visual audit. The authoritative commands and release checklist are in
[CLAUDE.md](CLAUDE.md).

## Deployment

Pushing Git does **not** deploy the site. Production is a deliberate Cloudflare
Pages direct upload:

```sh
tools/deploy_pages.sh --stage   # inspect the runtime package
tools/deploy_pages.sh           # deploy to production
```

Before deployment, run the full gate, inspect the staged output and bump the
service-worker `VERSION`. The deployment script refuses secrets, development
templates and all gated Live2D/Cubism material.

## Live2D status

The checked-in assistant uses static PNG character states. The Live2D adapter and
Krita rig scaffold are development-only and inert without a separately installed
Cubism runtime. No Cubism SDK, Core, model or texture is shipped. Live2D material
must not be committed or deployed until the AI/chatbot licence classification in
`LICENSE_REQUEST.md` is answered in writing.

## Extending the project

| Goal | Edit |
|---|---|
| Add deep revision content | `js/data/content/*.js` |
| Add examiner guidance | `js/data/intel.js` keyed by `"subject:ref"` |
| Add a worked generator | `js/labs/worked.js` and `GENWIRE` |
| Add a simulation | `js/labs/sims.js` |
| Add a view | register `KOS.views.<id>` and route through `KOS.show()` |
| Update a specification tree | parsers in `tools/`, then `tools/gen_data.py` |

Validate every edited JavaScript file with `node --check`. New content keys must
map to specification leaves, and new generators must be fuzz-safe.
