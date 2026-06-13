# KurenaiOS — Agent Contract

## CLAUDE CODE owns (can write)
- js/core/
- js/modules/
- js/labs/
- css/main.css
- index.html
- js/main.js
- PROGRESS.md (shared updates)

## GEMINI owns (can write)
- js/data/content/*.js
- js/data/intel.js
- PROGRESS.md (shared updates)

## NEITHER touches (generated files — run tools/gen_data.py to regenerate)
- js/data/compsci.js
- js/data/maths.js
- js/data/it.js

## Content schema
Every KOS_CONTENT entry must follow the schema in js/core/content.js.
Use js/data/content/cs-datastructures.js as the depth reference.
Validate syntax after every file: node --check FILENAME
(or: node -e "new Function(require('fs').readFileSync('FILENAME','utf8'))")

## Common pitfalls (have actually broken the build)
- **Callouts need TWO closing braces.** `{ callout: { t:"def", body:"…" } }` — the
  inner `}` closes the callout object, the outer `}` closes the block. Writing
  `{ callout: { … body:"…"\n},` (one brace) is a SyntaxError that stops the whole
  app loading. This bit us 6× in the §4.4 theory files.
- **Only key content to LEAF refs** — a ref that has its own `content[]` in the
  generated spec (compsci/maths/it.js). Content keyed to a section/group header
  (e.g. F201.5.3 "NEA Units") is unreachable in the UI and fails smoke2's
  "every content key maps to a spec leaf" check.
- `{code}` blocks now auto-render a copy button + language tag; author them normally.