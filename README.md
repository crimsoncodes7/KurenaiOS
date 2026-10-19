# 紅 KurenaiOS

KurenaiOS is a local-first study and personal-organisation workspace for A-level
Computer Science, Mathematics and IT, plus Code, a C# programming course. It combines the official specification
spine, deep revision material and interactive labs with spaced repetition,
planning, focus sessions, progress analytics, a media Collection, cloud sync and
an optional AI assistant.

The application is plain HTML, CSS and JavaScript: there is no bundler and no
compile step. It runs directly from `index.html`, as an installable PWA on HTTPS,
or at the production site:

**[kurenai-os.pages.dev](https://kurenai-os.pages.dev)**

## Current release

The **Graphite UI rebuild** is live as of **27 September 2026**: the whole
presentation layer redrawn from the Graphite design handoff (a dark,
desktop-first interface), with every surface reviewed twice and the
behaviour, data and invariants of the earlier releases unchanged.

- Runtime release commit: `ff7a8e3` (17 October 2026: Code capstone 3, a shop
  with plugins and LINQ reports, which completes Code's stage 3 on the full
  C# runtime) — immutable deployment https://6c888d02.kurenai-os.pages.dev.
  Before it: Reports for weeks, months, terms and years (13 October) and the
  Code platform and units 1–9 (15–17 October).
- Milestone tag: `milestone/graphite-ui-rebuild`
- Service-worker cache: `kos-code-18`
- Verification: all **79 smoke suites**, including the rebuild guards
  (smoke55: presentation vocabulary; smoke56: render purity and control
  parity) and Code's gates (smoke73–79, plus `tools/cs_diff.mjs`).
- **Branch:** `main` is current (19 October 2026); it equals the working
  branch `claude/roadmap-code-study-space`. Check `git log` before relying on
  that. See [docs/HANDOFF.md](docs/HANDOFF.md).
- In flight, not deployed: the Japanese study space (roadmap 5.5). Its
  vertical slice in `prototypes/japanese-space/` is closed; the platform
  release is next, when asked.

Graphite is currently the only theme; phone layouts keep working on the new
shell but have not been designed yet. What comes next is in
[docs/ROADMAP.md](docs/ROADMAP.md).

The concise delivery record is in [PROGRESS.md](PROGRESS.md). Engineering contracts
live in [CLAUDE.md](CLAUDE.md), with the shorter execution rules in
[AGENTS.md](AGENTS.md). Picking the project up on another machine or Claude
account: [docs/HANDOFF.md](docs/HANDOFF.md).

## Run locally

For basic local use, open the file directly:

```sh
open index.html        # macOS
xdg-open index.html    # Linux
```

Use a local HTTP server when testing the service worker, cloud integrations or
browser automation:

```sh
python3 tools/dev_server.py 8765
# then open http://127.0.0.1:8765/index.html
```

`tools/dev_server.py` is `http.server` with `Cache-Control: no-store`, so an
edited script is never served stale to the service worker.

Core study and organisation features remain usable offline. Network-backed sync,
provider search and AI providers naturally require a connection. KaTeX and the
web fonts are CDN-hosted, so their offline fallbacks are raw maths text and system
fonts.

## Main workspaces

### Study

- The complete AQA 7517 Computer Science and Edexcel 9MA0 Mathematics
  specification trees, and the OCR AAQ IT units being taken (F200, F201, F202,
  F204, F206; F203 and F205 are left out): **331 leaf specification points**.
- Deep structured notes, flashcards, quizzes, exam questions, mark schemes and
  examiner guidance across all of Computer Science and Mathematics plus IT F201.
- Inline simulations, worked-example generators, trace labs and SQL, regex,
  number-base, Little Man Computer and C# OOP sandboxes.
- Topic progress, RAG evidence, assignment tracking, Review (SM-2 due cards and
  card statistics), attachments and cross-subject topic comparison.

### Code

- A fourth study space for learning C#: a staged path (units 1–9 and the
  Rider "Bridge B" workflow are written; units 10–12 and capstone 4 show
  "Coming later"), lessons on the shared topic page, tasks proven by a runner
  and paid once, katas, three capstones and a Daily 20 computed from evidence.
- Learner code runs only on the device: an in-app interpreter for units 1–6,
  and an optional offline download of Roslyn and .NET in WebAssembly for
  units 7+. Work can go to a GitHub repository you create (a fine-grained
  token you type), and Code appears in Reports and the Assistant.
- Contracts: invariants 103–110 in [CLAUDE.md](CLAUDE.md), plan in
  [docs/code-plan.md](docs/code-plan.md).

### Productivity and Governor

- Calendar, recurring events, reminders, assignments, countdowns, habits and
  daily recommendations share canonical records instead of copying data.
- Pacing is the integrated weekly plan: the school scheme of work beside the
  personal curriculum, per-lesson ticks, carry-over of unfinished rows, and a
  per-subject branch graph ("braid") of where the two plans meet.
- Focus Timer supports Pomodoro/custom sessions, reload recovery, distraction and
  pause accounting, assignment links and a post-session review.
- The Behavioural Governor derives streaks, HP, gold, XP and rewards from the
  session ledger. Only labs, simulations and the shop can be gated; revision and
  Focus are always available.
- Reports (under Home) save each week when it ends: study time and topics,
  Focus blocks, the plan, what moved in the Collection, earnings and streaks,
  with full overview pages, words by template or by Kurenai (from totals
  only), a tap-through story and a share card; months, terms and years
  too, the year as seven chapters. Signed in, reports sync between devices.

### Collection

- IndexedDB vaults for Anime, Books, Visual Novels and Games, with lazy rendering,
  shared editors, filters, analytics and non-destructive cover positioning.
- AniList and VNDB pull sync, narrowly scoped write-back, profiles, provider
  history and autonomous sync. Games retain manual-first operation with optional
  server-backed IGDB search and reviewed Steam import.
- Budget Planner, Collection Goals and the Shrine Hall of Fame remain local-first
  and cannot duplicate Governor rewards.

### Archive

- A notification centre (bell and full feed, per-device filters, quiet hours
  and opt-in device alerts), Backup & Restore, and a searchable Help & Guide.

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
| Visual system: Graphite tokens, base, layout, components, per-domain views, themes | `css/tokens.css`, `css/*.css`, `css/views/*.css` |
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
for i in "" {2..79}; do node "tools/smoke${i}.test.js"; done
```

Code content also runs against real .NET (`node tools/cs_diff.mjs`, needs the
.NET 10 SDK).

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
