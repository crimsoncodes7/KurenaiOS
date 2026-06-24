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

## Tests — both must print ALL SMOKE TESTS PASSED
```sh
node tools/smoke.test.js    # core engine
node tools/smoke2.test.js   # deep content + engines
```
