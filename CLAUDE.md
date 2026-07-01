# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running and testing

**No build step.** Open `index.html` directly in a browser — `file://` works because there are no ES modules.

**Smoke tests** (require Node.js + jsdom):
```sh
npm install jsdom          # one-time
node tools/smoke.test.js   # core engine tests
node tools/smoke2.test.js  # deep content + engines tests
node tools/smoke3.test.js  # Build 2a governor: SM-2, sessions, economy, calendar, todo
```

Note: both test files resolve `ROOT` via `path.resolve(__dirname, "..")`, so they
run from any checkout location — no path editing needed. They load every
`<script src="…">` in `index.html`; CDN scripts (KaTeX) are marked `defer` so the
tests skip them (they only eval local files) while the browser still loads them.

**Regenerating spec data** from PDF sources:
```sh
# requires Python 3 + pdfplumber
python tools/parse_aqa.py    # → aqa.json
python tools/parse_maths.py  # → maths.json
python tools/parse_it.py     # → it.json
python tools/gen_data.py     # aqa/maths/it.json → js/data/*.js
```

## Architecture

### Script-tag globals, no bundler

All JS is loaded via `<script src="...">` in `index.html` in strict dependency order. Everything shares a single global namespace `KOS`. No `import`/`export` — this is intentional so `file://` works without a server.

### Load order (from `index.html`)

1. **Data** — `js/data/{compsci,maths,it,intel}.js` populate `window.KOS_DATA.*`
2. **Core** — `store.js`, `ui.js`, `content.js`, then Build 2a: `srs.js` (SM-2
   engine + card registry), `sessions.js` (session log + streaks), `governor.js`
   (HP/gold/XP, catalog, gating, avatar, HUD)
3. **Deep content** — `js/data/content/*.js` populate `window.KOS_CONTENT["subject:ref"]`
4. **Engines** — `js/engines/{flashcards,quiz}.js` register engine logic onto `KOS`
5. **Modules** — `js/modules/hub.js` (home, subject dash, ref view, search) +
   `due.js`, `calendar.js`, `todo.js`, `governor-ui.js`
6. **Labs** — `js/labs/{worked,trace,oop,sims}.js` register their views
7. **Boot** — `js/main.js` wires the rail nav, runs the governor boot sequence
   (seed samples → HP tick → cosmetics → view gates → HUD → reminders), restores
   the last view

### Key globals

| Global | Purpose |
|--------|---------|
| `KOS.store` | Single state object, autosaved to `localStorage` key `kurenai-os-v1` on every mutation |
| `KOS.ui` | `el()` DOM builder, `toast()`, `flashSaved()` |
| `KOS.content` | `get(sid,ref)`, `has(sid,ref)`, `renderBlocks(blocks)`, `coverage(sid,leaves)` |
| `KOS.show(viewId, arg)` | Clears `#main`, calls `KOS.views[viewId](main, arg)`, updates rail active state, saves |
| `KOS.views` | Registry of view render functions; each module registers itself here |
| `KOS_DATA` | Spec tree data (generated — do not hand-edit `compsci/maths/it.js`) |
| `KOS_CONTENT` | Deep revision content keyed by `"subject:ref"` (hand-authored in `js/data/content/`) |

### State shape (`KOS.store.state`)

```js
{
  v: 1,
  progress: {},    // "subject:ref" -> { status, check:[bool,bool,bool,bool], note }
  ui: { subject, view, openSections, lastRef },
  oop: { classes, links, nextId },
  worked: { last },
  trace: {},
  /* Build 2a — Behavioural Governor */
  custom: { nextId, cards: [] },        // user flashcards {id,sid,ref,q,a,created}
  srs: {},                              // card key -> {ef,ivl,reps,due,last,views,lapses,lastRating}
  sessions: [],                         // study log {id,ts,date,type,subject,ref,dur,metrics}
  governor: { hp, gold, xp, owned, theme, seal, avatar, lastTick, lastBacklogDrain },
  calendar: { nextId, seeded, events, notifyDays, notified },
  todo: { nextId, manual, autoChecked }
}
```

All mutations go through `KOS.store.*` methods so autosave fires automatically.
Governor invariants: streaks/XP/HP flow ONLY from `KOS.sessions.log(...)` (never
write them directly), and HP/gold gate only labs/sims/shop — core revision
(spec, notes, flashcards, quizzes, exam Qs) must never lock.

### Adding deep revision content

Add to any file under `js/data/content/` (and add a `<script>` tag in `index.html` if creating a new file):

```js
window.KOS_CONTENT["subject:ref"] = {
  notes: [ "paragraph", {h:"Heading"}, {ul:[...]}, {ol:[...]},
           {kv:[["Term","Definition"]]},
           {table:{head:[],rows:[]}},
           {code:{lang:"csharp|sql|pseudo",src:"..."}},
           {callout:{t:"def|tip|warn|miscon|mnemonic|memorise|formula|info", h:"optional header", body:"string or [blocks]"}},
           {steps:[{h:"heading",m:"main text",n:"optional note"}]},
           {worked:{tag:"example|variation|exam|check", title:"what this example is", steps:[{m:"working line",n:"optional why"}], result:"final answer"}},
           {svg:{src:"<svg>…</svg>", cap:"caption"}},
           {page:"Page title"} ],
  flashcards: [["Question","Answer"]],
  quiz: [{q:"...", opts:["a","b"], ans:0, why:"..."}],
  exam: [{q:"...", marks:4, ms:["mark point"]}],
  gens: ["genId"],   // worked-example generator IDs from worked.js
  sims: ["simId"]    // simulation IDs from sims.js
};
```

Badges, tabs, coverage stats, and search pick up the entry automatically.

### Design system (Build 2.0 "Higanbana" + 2.1 "Liquid Glass")

`css/main.css` is a token-driven dark theme. Work through the `:root` variables
rather than hard-coding values:
- **Liquid Glass (2.1)**: glass tokens `--glass-fill`/`--glass-edge`/`--glass-hi`
  (specular top highlight)/`--glass-sheen`/`--glass-blur` and `--focus-glass`, applied
  in *balance* to chrome, controls, cards, search and modals. Dense reading surfaces
  (notes paragraphs, `.n-code`, `.n-table` cells) keep solid dark backgrounds — only
  their frames get the glass edge.
- **Surfaces**: `--bg` (near-pure black) → `--panel`/`--raise`/`--raise2`; glass
  layers `--glass`/`--glass-top` (used with `backdrop-filter`).
- **Brand/status**: `--kurenai` (crimson chrome) + `--gold`; `--ok/--warn/--paused/--bad`.
- **Subject hues stay distinct** and must not be repurposed: `--c-compsci` jade,
  `--c-maths` azure, `--c-it` violet. Views set `--accent` on a container to tint
  borders/glows for the active subject.
- **Type**: `--disp` (Space Grotesk, chrome/headers), `--body` (Inter), `--mono`
  (JetBrains Mono, refs/code), `--serif`/`--kanji` (Shippori Mincho — the 紅 mark
  and verbatim spec wording). Fonts load from Google Fonts in `index.html`.
- **Also**: spacing scale `--s1..s8`, radii `--r1..r4`/`--r-pill`, elevation
  `--sh-1..3`, motion curves `--e-out/--e-inout/--e-spring` + `--t-fast/med/slow`.
- The ambient spider-lily petals are the `.bg-flora` block in `index.html`; all
  motion is gated behind `@media (prefers-reduced-motion: reduce)`.

When adding UI, reuse existing class names — the engines/views and the smoke tests
key off them (`.study-tab`, `.notes-article`, `.n-call-*`, `.fc-card`, `.qz-opt`,
`.logic-tt`, `.sec-card`, etc.). Restyle freely; don't rename.

### Adding a new view/module

1. Register: `KOS.views.myView = function(main, arg) { ... }`
2. Add a rail button in `index.html`: `<button class="rail-item" data-view="myView">...</button>`

### Key files to hand-edit

| File | Purpose |
|------|---------|
| `js/data/intel.js` | Examiner tips/pitfalls keyed `"subject:ref"` |
| `js/data/content/*.js` | Deep revision content |
| `js/labs/worked.js` | Worked-example generators (push into `GENS` array) |
| `js/labs/trace.js` | Data structure trace lab tabs |
| `js/labs/sims.js` | Simulations |

`js/data/compsci.js`, `maths.js`, `it.js` are **generated** — edit the parsers and re-run `gen_data.py` instead.