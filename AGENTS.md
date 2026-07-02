# KurenaiOS — Agent Contract

## Ownership

**Claude Code owns the entire project.** There is no longer a split with any other
agent — every file below is fair game to edit, subject only to the "generated files"
rule. (Historical note: content authoring used to be delegated to Gemini; that
arrangement has ended and all of `js/data/content/` is now maintained here.)

Editable:
- `js/core/`, `js/modules/`, `js/labs/`, `js/main.js`
- `css/main.css`, `index.html`
- `js/data/content/*.js` — deep revision content
- `js/data/intel.js` — examiner tips/pitfalls, keyed `"subject:ref"`
- `README.md`, `PROGRESS.md`, `CLAUDE.md`, this file

## NEITHER touches (generated — run tools/gen_data.py to regenerate)
- `js/data/compsci.js`
- `js/data/maths.js`
- `js/data/it.js`

These are produced from the spec PDFs by the Python pipeline. To change spec wording
or the tree, edit the parsers in `tools/` and re-run `gen_data.py` — never hand-edit.

## Content schema
Every `KOS_CONTENT` entry must follow the schema in `js/core/content.js`.
Use `js/data/content/cs-datastructures.js` as the depth reference.
Validate syntax after every file: `node --check FILENAME`

## Wiring labs to topics (sims, generators)
The ref page auto-surfaces a **Simulate** tab and a **Worked** tab when a sim or
generator targets that spec point. Two mechanisms, both in Claude-owned lab files —
you do NOT need to touch content files to wire a lab:
- **Sims** (`js/labs/sims.js`): `KOS.sims.forRef` auto-matches any sim whose own
  `subject` + `ref` equals the page's. So a new sim wires itself just by declaring
  the right `ref` on `register({...})`. The `WIRE` map is only for sims that attach
  to *extra* refs beyond their own (e.g. `binary-number` on both 4.5.4.2 and 4.5.4.4).
- **Generators** (`js/labs/worked.js`): a generator's `ref` field is a human-readable
  label (e.g. `"7.2 / 7.3"`), so matching uses the explicit `GENWIRE` map keyed by
  exact `"subject:ref"`. Add an entry there when you add a generator.
- A content entry may also list `sims:[...]` / `gens:[...]` directly; `hub.js` merges
  both sources and de-dupes by id.
- **Sims render inline** on the Simulate tab — give every sim a `mount(panel)`, never a
  `jump` redirect. The four Trace Lab structures mount inline via `KOS.traceLabs.mount`.
- **Sandboxes** (`js/labs/sandboxes.js`: SQL, regex, base converter, Little Man Computer)
  are also registered as sims, so they mount inline and auto-wire by `subject:ref`.
- **Textarea gotcha**: `el("textarea", {value})` sets the *attribute*, which a textarea
  ignores. Create it, then assign `node.value = "…"` as a property.

## Build 2a — the Behavioural Governor (architecture)
Core loads in this order (all before engines/modules): `store.js` → `ui.js` →
`content.js` → `srs.js` → `sessions.js` → `governor.js`.
- **`KOS.srs`** — the SM-2 engine + unified card registry. Curriculum cards key
  `"sid:ref:i"`, custom cards `"u<id>"`. `rate(key, 0..3)` (Again/Hard/Good/Easy)
  updates persistent metadata in `store.state.srs`; `dueCards()` is the global
  queue (reviewed cards only — unseen cards enter the schedule on first rating).
  Custom-card CRUD: `addCustom/updateCustom/deleteCustom`.
- **`KOS.sessions`** — the session log (`store.state.sessions`), THE data
  backbone. `log({type, subject, ref, dur, metrics})` on every completed
  activity; `streak(sid|null)` derives consecutive-day streaks from it.
  **Never write streaks or XP directly — log a session and let it flow.**
- **`KOS.governor`** — HP (healthy ≥60 / strained ≥30 / critical <30), gold,
  XP/level, catalog, avatar seals, cosmetics, gating. `onSession(e)` is called
  by `sessions.log` and pays XP/gold/HP. `tick()` (boot + 30-min interval)
  applies day drains and backlog drains. `installGates()` (called in main.js)
  wraps the `trace`/`oop`/`sims` views; `simAccess(id)`/`viewAccess(id)` are
  the gate checks hub.js and sims.js use.
- **HARD RULE**: HP/gold gate ONLY labs, sims and the shop. Spec, notes,
  flashcards, quizzes, exam Qs never lock. Don't add gates to core revision.
- **Views**: `due` (global SM-2 queue), `calendar` (events + weekly recurrence;
  deadlines are events typed `exam`/`deadline`, no separate store), `governor`
  (status/shop/avatar/session log). `KOS.todo.panel()` renders the daily list
  on home; auto items derive from due cards + near deadlines, manual tasks
  persist in `store.state.todo.manual`.
- **Tests**: both suites call `KOS.governor.debugUnlockAll()` right after
  script load because labs are gold-locked on a fresh store. Keep that line in
  mind when a lab step fails with missing DOM.
- `#hud` in the topbar is repainted by `KOS.refreshHUD()` after any award.

## Build 2c — Tracking completion
- **`KOS.tracker`** (`tracker.js`): exam/paper records, ONE component with a
  `kind` discriminator. Adding an entry logs a `tracker` session; `forRef` is
  what the RAG auto-score reads. Rail section "Records".
- **`KOS.rag`** (`rag.js`): `manual` (progress[].rag), `auto` (SM-2 + quiz +
  tracker → 0–100 score, null when no data), `effective` (manual wins display,
  `disagree` flag), `worst`/`panel` (recommended-next on home + subject dash),
  `picker` (ref-page control row). Thresholds: ≥70 green, ≥45 amber.
- **`KOS.attach`** (`attachments.js`): IndexedDB `kurenai-os-files`, store
  `files` indexed by [subject, ref]. Files tab appears on EVERY ref (so the
  smoke2 "plain ref" fixture expects spec+files = 2 tabs). Guard everything
  behind `KOS.attach.available()` — jsdom has no indexedDB. "Annotate" is a
  notes field per file, by explicit scope decision.
- **`cardstats.js`**: FR-1.6 dashboard; charts are hand-built inline SVG
  (`svgNode` helpers) — do not add a charting library.
- **Streaks** read `hasStreakActivity` (skips `focus`+`complete:false`);
  the HP day-drain still reads `hasActivity`. Keep them separate.
- Focus-mode minimised (`body.fx-minimised`) shows rail+tree again — only the
  full stage hides them. Don't "simplify" that CSS back to always-hidden.

## Build 2b — Focus Timer
- **`KOS.focus`** (`js/modules/focus.js`, loads last of the modules): state
  machine idle → running ⇄ paused → done; Pomodoro auto-cycle via `phase`
  ("work"/"break"). Live session lives at `store.state.focus.active` and is
  restored PAUSED after a reload (10 s heartbeat bounds the loss).
- `sessions.log` stamps `focusId` on entries created while a session is live —
  the focus entry itself logs AFTER the session clears, so it never self-tags.
  Keep that ordering if you touch `finish()`.
- Deterrents: `beforeunload` confirm while running; visibilitychange →
  distraction (running WORK phase only; first free, then `governor.drainHp(2)`);
  pause economy applied in `governor.onSession`'s focus branch (first pause
  free, −15%/extra); `metrics.complete:false` forfeits the award entirely.
- Focus Mode UI: `body.focus-mode` (chrome hidden) + `body.fx-minimised`
  (stage ↔ dock). Never gate the focus timer itself behind HP/gold.
- Tests: smoke3's focus steps drive the clock with `KOS.focus._debugAdvance(sec)`
  + `KOS.focus.tick()` and fake tab-switches by redefining
  `document.visibilityState`. Award assertions are exact — pause counts matter.

## Navigation
`KOS.show(viewId, arg)` records a history stack; `KOS.back()`/`KOS.forward()` (and
`KOS.canBack()`/`KOS.canForward()`) drive the topbar **‹ Back** / **Forward ›** buttons
(and Alt+← / Alt+→ / Backspace). A fresh `KOS.show` clears the forward trail, like a
browser. Don't replace `#main` directly — always route through `KOS.show` so history,
forward trail and rail state stay correct.

## Common pitfalls (have actually broken the build)
- **Callouts need TWO closing braces.** `{ callout: { t:"def", body:"…" } }` — the
  inner `}` closes the callout object, the outer `}` closes the block. Writing one
  brace is a SyntaxError that stops the whole app loading. Bit us 6× in the §4.4 files.
- **Only key content to LEAF refs** — a ref with a non-empty `content[]` in the
  generated spec. A node with `content:[]` is invisible in the tree and fails smoke2's
  "every content key maps to a spec leaf" check. (E.g. `it:F201.5.3` "NEA Units" had
  `content:[]`; its case-study block was re-keyed to `it:F201.1.4`.)
- **New generators must be fuzz-safe.** `solve()` runs on every `random()` output, so
  guard against divide-by-zero, `f'(x₀)=0`, equal roots, etc. in `validate()`.
- `{code}` blocks auto-render a copy button + language tag; author them normally.

## Tests — all three must print ALL SMOKE TESTS PASSED
```sh
node tools/smoke.test.js    # core engine
node tools/smoke2.test.js   # deep content + engines
node tools/smoke3.test.js   # Build 2a governor: SM-2, sessions, economy, calendar, todo
```
