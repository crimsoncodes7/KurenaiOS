# 紅 Kurenai OS — Build 1.5: The Revision Hub, Deep

Open `index.html` in any modern browser — no server, no build step.

## New in Build 1.5

- **Deep revision content system** — 49 subtopics now carry full revision-guide
  depth: structured notes (definitions, comparison tables, C#/SQL/pseudocode
  with syntax highlighting, mnemonics, must-memorise vs formula-book callouts,
  misconceptions, inline walkthroughs), 5–8 flashcards, an MCQ quiz with
  explanations, exam-style questions with mark schemes, plus linked worked-example
  generators and simulations. Tabs appear per-topic: Specification · Notes ·
  Flashcards · Quiz · Exam Qs · Worked · Simulate.
- **Engines** — flashcards (flip / shuffle / self-rate, lifetime stats) and
  quizzes (instant feedback, best scores; exam Qs with reveal-the-mark-scheme
  self-marking). All stats persist, ready for the SM-2 Governor in Build 2.
- **Four new simulations** — Boolean Logic Lab (expression parser → live truth
  table), Sorting Visualiser (bubble vs merge with comparison counters),
  FSM Lab (three acceptor machines, tape stepping), Graph Transformation
  Explorer (y = a·f(bx + c) + d with exam-language descriptions).
- **Worked Example Engine regrouped** by paper (Pure / Stats & Mech / CS) with
  three new generators: binomial expansion, definite integrals, normal distribution.
- **Tree fixes** — parser row-clustering bug fixed (recovered 9 lost AQA leaves
  incl. the whole of 4.10 SQL; 4.9.4 now nests properly); subsections are
  collapsible; ◆ badges mark deep-content topics.
- **UI pass** — tabbed study pages, redesigned home with progress rings and
  coverage stats, callout system, flashcard 3D flip, cleaner everything.

## Authoring more deep content

Add entries to any file in `js/data/content/` (or a new file + script tag):

```js
window.KOS_CONTENT["maths:8.7"] = {
  notes: [ "...blocks...", {h:"…"}, {table:{head:[],rows:[]}},
           {code:{lang:"csharp",src:"…"}}, {callout:{t:"mnemonic",body:"…"}} ],
  flashcards: [["Q","A"]],
  quiz: [{q:"…", opts:["a","b"], ans:0, why:"…"}],
  exam: [{q:"…", marks:4, ms:["point (1)"]}],
  gens: ["defint"], sims: ["fn-transform"]
};
```
Badges, tabs, coverage stats and search all pick it up automatically.
Current coverage: CS data structures & algorithms clusters complete, CS theory
core, 16 Pure topics, 6 Stats/Mech topics, IT unit F201 (big data) complete.

---

## Build 1 foundations

A fully offline, file-system-local revision operating system. Open `index.html`
in any modern browser — no server, no build step, no dependencies.

## What's in Build 1

- **Full specification database** — every topic, subtopic and spec point of
  AQA 7517 Computer Science (142 leaves), Edexcel 9MA0 Mathematics (89), and
  OCR AAQ IT: Data Analytics (110), extracted verbatim from the official PDFs.
- **Split-screen reference view** — exam-board wording on the left, the board's
  own guidance on the right, plus an examiner-intel layer (rewarded definitions,
  mark-winning tips, pitfall warnings) on ~60 high-value spec points.
- **Progress tracking** — per-point status (Not started / Started / Paused /
  Completed) and the four-stage checklist (Covered in class · Studied it ·
  Done exam Qs · Fully understood), visualised as spine "obi" strips in the
  tree, donut + per-section bars on each subject dashboard.
- **Global search** ( press `/` ) across all 341 spec points.
- **Worked Example Engine** — 7 parameterised generators (quadratics, calculus,
  trig equations, logs, binary/two's complement, floating point, suvat) with
  step-by-step reveal and mark-scheme-style structure lines.
- **Data Structure Trace Lab** — animated canvas stack, linear/circular queue
  (with MOD pointer arithmetic), linked list, and BST with all three traversals,
  each logging into a trace table.
- **C# OOP Sandbox** — draggable class cards, access modifiers, virtual /
  override / abstract, inheritance arrows (cycle-safe), live C# transpile
  with copy-to-clipboard.
- **Persistence** — one JSON state object, autosaved to localStorage on every
  change; export/import/reset under *Data → Backup & Restore*.

## Folder structure

```
KurenaiOS/
├── index.html                entry point — just open it
├── README.md
├── css/
│   └── main.css              all tokens, layout, components
├── js/
│   ├── main.js               boot: wires the rail, restores last view
│   ├── core/
│   │   ├── store.js          state object, autosave, export/import
│   │   └── ui.js             el() builder, toast, view registry (KOS.show)
│   ├── data/                 GENERATED — don't hand-edit, regenerate
│   │   ├── compsci.js        AQA 7517 tree   → window.KOS_DATA.compsci
│   │   ├── maths.js          Edexcel 9MA0    → window.KOS_DATA.maths
│   │   ├── it.js             OCR AAQ         → window.KOS_DATA.it
│   │   └── intel.js          examiner tips/pitfalls — THIS one is hand-edited
│   ├── modules/
│   │   └── hub.js            tree, dashboards, reference view, search
│   └── labs/
│       ├── worked.js         generator definitions + step UI
│       ├── trace.js          canvas structures + animation clock
│       └── oop.js            sandbox + C# transpiler
└── tools/                    the data pipeline (Python 3 + pdfplumber)
    ├── parse_aqa.py          spec PDF → aqa.json
    ├── parse_maths.py        spec PDF → maths.json
    ├── parse_it.py           spec PDF → it.json
    ├── gen_data.py           *.json → js/data/*.js
    └── smoke.test.js         jsdom test suite (npm i jsdom; node smoke.test.js)
```

## How to extend it (the bits you'll want to touch)

| Want to…                          | Edit                                        |
|-----------------------------------|---------------------------------------------|
| Add examiner tips to a spec point | `js/data/intel.js` — key is `"subject:ref"` |
| Add a worked-example generator    | push an object into `GENS` in `worked.js`   |
| Add a new lab tab                 | `TABS` array in `trace.js`                  |
| Add a whole new module/view       | register `KOS.views.yourView = fn(main)` and add a rail button in `index.html` |
| Re-extract after a spec update    | run the three parsers then `gen_data.py`    |

Architecture notes: classic `<script>` tags (no ES modules) so `file://` works
everywhere; one global namespace `KOS`; every view is a function that receives
the cleared `#main` node; all mutation flows through `KOS.store` so autosave
is automatic.

## Roadmap (agreed build order)

- **Build 2 — Behavioural Governor**: avatar HP/XP/Gold, focus timer with
  full-screen lock, gold-gated module access, SM-2 flashcard engine
  (hooks: `store.state` already reserves space; add `js/modules/governor.js`).
- **Build 3 — Kurenai Collection Matrix**: physical vault CRUD, analytics
  canvas, budget planner, AniList XML/JSON import (your `scrape_anilistanime.xml`
  parses with `DOMParser` — zero dependencies).
- **Build 4 — Competitions, Music & the Ollama bridge** at
  `http://localhost:11434/api/generate` (note: pages opened via `file://`
  can call localhost Ollama if you launch it with `OLLAMA_ORIGINS="*"`).
