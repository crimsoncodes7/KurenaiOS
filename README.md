# 紅 Kurenai OS — the Unified HQ (Build 3j)

A file-system-local revision operating system for A-level Computer Science,
Mathematics and IT — plus a Behavioural Governor (SM-2 spaced repetition, focus
timer, HP/gold/XP economy) and the 蒐 Collection Matrix (anime / books / visual
novels / games tracking with live AniList + VNDB sync). Open `index.html` in any
modern browser — **no server, no build step, no bundler**.

Works offline with two honest caveats: KaTeX and the fonts load from CDNs (offline,
maths shows raw `$…$` and fonts fall back), and the media sync features naturally
need the network. Core state lives in one autosaved `localStorage` object; the
media vault, file attachments and API tokens live in IndexedDB (origin-scoped, and
**not** included in the JSON backup — see CLAUDE.md invariant 7).

```sh
# just open it
open index.html        # macOS
xdg-open index.html    # Linux
```

## What's inside

- **The full specification database** — every topic, subtopic and spec point of
  AQA 7517 Computer Science (**151** leaves), Edexcel 9MA0 Mathematics (**89**), and
  OCR AAQ IT: Data Analytics H019/H119 (**115**) — **355 spec points** in total,
  extracted verbatim from the official PDFs.
- **Deep revision content** on top of the spec spine: structured notes (definitions,
  comparison tables, C#/SQL/pseudocode with syntax highlighting, mnemonics,
  must-memorise vs formula-book callouts, misconceptions, inline walkthroughs),
  flashcards, MCQ quizzes with explanations, and exam-style questions with mark
  schemes. Coverage today: **all of Computer Science and all of Mathematics are deep**,
  plus IT unit **F201** (Big Data) — ~260 enriched topics. Tabs appear per topic:
  Specification · Notes · Flashcards · Quiz · Exam Qs · Worked · Simulate.
- **Split-screen reference view** — exam-board wording on the left, the board's own
  guidance on the right, plus an examiner-intel layer (rewarded definitions,
  mark-winning tips, pitfall warnings) on high-value spec points.
- **Engines** — flashcards (3D flip / shuffle / self-rate, lifetime stats) and
  quizzes (instant feedback, best scores; exam Qs with reveal-the-mark-scheme
  self-marking). Stats persist, ready for the SM-2 Governor.
- **Labs** — Data Structure Trace Lab (animated stack / queue / linked list / BST
  traversals with trace tables), C# OOP Sandbox (draggable class cards, inheritance
  arrows, live C# transpile), the Worked Example Engine (20 parameterised generators
  grouped by paper — quadratics, sequences & series, binomial expansion, sine/cosine
  rule, vectors, differentiation, integration, Newton–Raphson, partial fractions,
  logs, kinematics, exponential models, binomial probability, hypothesis tests,
  normal distribution, binary/float conversion), and 22 simulations (Stack / Queue /
  Linked-list / BST trace labs, Dictionary, Vector lab, Boolean Logic Lab, Logic Gates,
  Sorting Visualiser, FSM Lab, Reverse Polish evaluator, Linear & Binary Search, Hash
  Table, Dijkstra's shortest path, Binomial Distribution, Recursion, Binary Register,
  Fetch–Execute, Unit Circle, Graph Transformer, Definite-Integral area). Every
  generator and sim auto-surfaces a **Worked** / **Simulate** tab on the spec point it
  targets, and **renders inline on the topic page** (no redirect). **‹ Back** / **Forward ›**
  buttons (and Alt+← / Alt+→ / Backspace) step through page history.
- **Sandboxes** — free-form playgrounds (`js/labs/sandboxes.js`), each inline on its
  topic: a **SQL** query runner over a sample table (SELECT / WHERE / ORDER BY / LIMIT),
  a **Regex** tester with live match highlighting, a **number-base converter** with
  working shown, and a **Little Man Computer** assembler + fetch–execute machine
  (single-step machine code with ACC / PC / memory). Plus the C# OOP class-designer.
- **Progress tracking** — per-point status (Not started / Started / Paused / Completed)
  and a four-stage checklist (Covered in class · Studied it · Done exam Qs · Fully
  understood), shown as spine strips in the tree, a completion bar on each subject
  card, and donut + per-section bars on the dashboards.
- **Global search** (press `/`) across all 350 spec points and the flashcard text.
- **Copy-to-clipboard** on every content box — code, tables, definition lists,
  callouts and step walkthroughs (hover to reveal the Copy button).
- **Backup & Restore** — export / import / reset the whole state object, plus a
  printable revision summary (Data → Backup & Restore).

## Design system — Build 2.1 "Liquid Glass"

`css/main.css` is a token-driven dark theme (Build 2.0 "Higanbana"), refined in 2.1
with an Apple-style **Liquid Glass** treatment applied in *balance*: chrome, controls,
cards, search and modals get layered translucent fills, a specular top-edge highlight
(`--glass-hi`), a thin light border (`--glass-edge`) and a stronger
`backdrop-filter` (`--glass-blur`), while dense reading surfaces (notes, code, table
cells) keep solid dark backgrounds for legibility. Work through the `:root` variables
rather than hard-coding values.

- **Surfaces**: `--bg` → `--panel`/`--raise`; glass tokens `--glass`/`--glass-top` and
  the 2.1 set `--glass-fill`/`--glass-edge`/`--glass-hi`/`--glass-sheen`/`--glass-blur`.
- **Brand/status**: `--kurenai` (crimson) + `--gold`; `--ok/--warn/--paused/--bad`.
- **Subject hues stay distinct**: `--c-compsci` jade, `--c-maths` azure, `--c-it`
  violet. Views set `--accent` on a container to tint borders/glows for the subject.
- **Type**: `--disp` (Space Grotesk), `--body` (Inter), `--mono` (JetBrains Mono),
  `--serif`/`--kanji` (Shippori Mincho — the 紅 mark and verbatim spec wording).
- Ambient spider-lily petals (`.bg-flora`); all motion is gated behind
  `prefers-reduced-motion`.

## Folder structure

```
KurenaiOS/
├── index.html                entry point — just open it (script tags, strict load order)
├── README.md
├── CLAUDE.md / AGENTS.md      contributor + agent guidance
├── PROGRESS.md               build log / changelog
├── css/
│   └── main.css              all tokens, layout, components, the Liquid Glass system
├── js/
│   ├── main.js               boot: wires the rail, restores last view
│   ├── core/
│   │   ├── store.js          state object, autosave, export/import
│   │   ├── ui.js             el() builder, toast, view registry (KOS.show)
│   │   ├── content.js        deep-content registry + rich block renderer (renderBlocks)
│   │   ├── srs.js / sessions.js / governor.js      Build 2: SM-2, session log, economy
│   │   ├── mediadb.js        Build 3: IndexedDB media vault (the schema gate)
│   │   ├── anilist.js / vndb.js / bookapi.js       API clients (AniList, VNDB Kana, Open Library/Google Books)
│   │   └── media.js / mediapush.js / autosync.js   module registry + write-back + 15-min sync loop
│   ├── data/                 GENERATED tree data — don't hand-edit, regenerate
│   │   ├── compsci.js        AQA 7517 tree   → window.KOS_DATA.compsci
│   │   ├── maths.js          Edexcel 9MA0    → window.KOS_DATA.maths
│   │   ├── it.js             OCR AAQ         → window.KOS_DATA.it
│   │   ├── intel.js          examiner tips/pitfalls — hand-edited, key "subject:ref"
│   │   └── content/          deep revision content → window.KOS_CONTENT["subject:ref"]
│   ├── engines/
│   │   ├── flashcards.js      flip / shuffle / self-rate engine
│   │   └── quiz.js            MCQ + exam-question engines
│   ├── modules/
│   │   ├── hub.js            tree, dashboards, reference view, search
│   │   ├── due.js / calendar.js / todo.js / governor-ui.js / focus.js     Build 2 views
│   │   ├── tracker.js / rag.js / cardstats.js / attachments.js / help.js  Build 2c views
│   │   ├── anime.js / books.js / vn.js / games.js  the four media vaults (editor wrap chain)
│   │   └── matrix.js / shrine.js / mediasync.js / mediasearch.js / aniprofile.js / vndbprofile.js
│   └── labs/
│       ├── worked.js         worked-example generators + step UI
│       ├── trace.js          canvas data structures + animation clock
│       ├── oop.js            C# OOP class-designer sandbox + transpiler
│       ├── sims.js           interactive simulations (mount inline on topics)
│       └── sandboxes.js      SQL / regex / base / Little Man Computer sandboxes
├── Context/                  predecessor apps kept as reference material, intentionally —
│                             AS_Maths_Mock_Trainer.html and DataStructures_RevisionHub.html
│                             are the standalone tools KurenaiOS absorbed; not dead files
└── tools/                    the data pipeline (Python 3 + pdfplumber) + tests
    ├── parse_aqa.py          spec PDF → aqa.json
    ├── parse_maths.py        spec PDF → maths.json
    ├── parse_it.py           spec PDF → it.json
    ├── gen_data.py           *.json → js/data/*.js
    ├── validate_content.js   deep-content validator (node tools/validate_content.js [files…])
    └── smoke.test.js … smoke14.test.js   fourteen jsdom test suites (see Tests below)
```

## Authoring more deep content

Add entries to any file in `js/data/content/` (or a new file + a `<script>` tag in
`index.html`):

```js
window.KOS_CONTENT["maths:8.7"] = {
  notes: [ "…paragraph…", {h:"Heading"}, {ul:[…]}, {kv:[["Term","Def"]]},
           {table:{head:[],rows:[]}}, {code:{lang:"csharp",src:"…"}},
           {callout:{t:"mnemonic",body:"…"}}, {steps:[{h,m,n}]} ],
  flashcards: [["Q","A"]],
  quiz: [{q:"…", opts:["a","b"], ans:0, why:"…"}],
  exam: [{q:"…", marks:4, ms:["point (1)"]}],
  gens: ["defint"], sims: ["fn-transform"]
};
```

Badges, tabs, coverage stats, search and the per-box copy buttons all pick it up
automatically. Every `{callout:{…}}` must close with **two** braces — validate with
`node --check FILENAME`.

## How to extend it

| Want to…                          | Edit                                                       |
|-----------------------------------|------------------------------------------------------------|
| Add examiner tips to a spec point | `js/data/intel.js` — key is `"subject:ref"`                |
| Add deep revision content         | a file in `js/data/content/`                               |
| Add a worked-example generator    | push into `GENS` in `js/labs/worked.js`                    |
| Add a simulation                  | `js/labs/sims.js`                                          |
| Add a trace-lab tab               | `js/labs/trace.js`                                         |
| Add a whole new module/view       | `KOS.views.yourView = fn(main)` + a rail button in `index.html` |
| Re-extract after a spec update    | run the three parsers, then `gen_data.py`                  |

Architecture notes: classic `<script>` tags (no ES modules) so `file://` works
everywhere; one global namespace `KOS`; every view is a function that receives the
cleared `#main` node; all mutation flows through `KOS.store` so autosave is automatic.

## What shipped after Build 2.1 (summary — details in PROGRESS.md)

- **Build 2 — Behavioural Governor** (complete): real SM-2 spaced repetition with a
  global due queue, the session log that everything derives from (streaks, XP,
  RAG struggle-detection, stats), HP/gold/XP with gold-gated labs (core revision
  never locks), calendar + auto daily to-do, exam/paper tracker, focus timer with
  Focus Mode, IndexedDB file attachments on every topic, SVG stats dashboards.
- **Build 3 — 蒐 Collection Matrix** (complete through 3j): four media vaults —
  Anime (seasonal view, airing countdowns, AniList profile), Books (physical/
  digital dual-tracking, virtual bookshelf, ISBN lookup + barcode scan, reading
  sessions, ranked shelves), Visual Novels (VNDB sync, routes/chapters/quotes,
  quote→flashcard bridge), Games (manual-by-verified-necessity, bulk paste-in) —
  on one IndexedDB schema with live AniList/VNDB pull sync, AniList write-back,
  a reward-on-sync watermark, and an autonomous 15-minute sync loop.

## Tests

Smoke tests require Node.js + jsdom (suites 4–12 also need fake-indexeddb):

```sh
npm install jsdom fake-indexeddb   # one-time
for i in "" 2 3 4 5 6 7 8 9 10 11 12; do node tools/smoke$i.test.js; done
```

All twelve must pass. Per-suite coverage: the snapshot section of `PROGRESS.md`.

## Roadmap

Prioritised backlog with scoping notes: **the "SNAPSHOT — 2026-07-05" section of
`PROGRESS.md`**. Headlines: Purchase/Budget Planner (next), the FR-6 LLM bridge
(research first), Books extras (highlights, series webs, pace projections),
Build 4 (backend / cross-device sync / PWA / Steam+IGDB proxy), Competitions &
Music modules (unscoped), and the paused Build-1 labs expansion.

("Build 2.0/2.1" name design-system iterations; Build 2/3/4 are feature milestones.)

> Detailed per-build history lives in `PROGRESS.md`; architecture + invariants in `CLAUDE.md`.
