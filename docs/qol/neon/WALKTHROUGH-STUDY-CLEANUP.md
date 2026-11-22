# Study Content, Layout & Deduplication Cleanup — Walkthrough (`neon/study-cleanup-1`)

> **User-Authorised Study Cleanup Branch**
>
> This branch (`neon/study-cleanup-1`), cut cleanly from `origin/main` (`f26102f5`), is completely independent of `neon/qol-batch-6` and `neon/user-custom-1`. Every change below was explicitly requested and authorised by the user, including edits to study renderers, CSS, canonical content source files (`js/data/content/*.js`), and `tools/smoke200.test.js`. Generated spec outputs (`js/data/compsci.js`, `maths.js`, `it.js`) and unrelated files (`smoke198.test.js`, `smoke199.test.js`, `js/env*.js`, `supabase/`, `.claude/`, `docs/memory/`) remain untouched.

---

## Batch 1 · Renderer, CSS & `examFromWorked` Fixes + `tools/smoke200.test.js`

### Exact Files & Lines Changed

1. **`js/core/content.js`** (`:136–155`, `:661–696`):
   - Added `KOS.content.isBlockText(s)` and `KOS.content.rich(s)`: fast-paths plain single-line prose through `inline(s)`, and upgrades text containing fenced code (` ``` ` / ` ~~~ `), markdown pipe tables, lists, block quotes, or paragraph breaks through `markdown(s)` (rendering full syntax-highlighted `<figure class="k-n-code">` blocks, `<table class="k-n-table">` tables, and structured lists).
   - Fixed `examFromWorked(notes, board)`:
     - Preserves newlines in mark-scheme steps (`st.m`) whenever `isBlockText(raw)` is true (instead of collapsing code/tables via `.replace(/\n+/g, "; ")`).
     - Strips `{ lab: ... }` blocks and Notes-only `"Your turn"` companion variations (`notesOnly: true`, or caption prefixes `Your turn`, `Now …`, `The same …`, `without the worked`) when deriving Exam Questions — eliminating all 13 misplaced Trace Labs from Exam Questions while keeping genuine matching interactive parts (`smoke153` step F intact).
2. **`js/core/fillins.js`** (`:152`, `:192–196`):
   - Added `size: "4"` on `.k-fill-in` text inputs so browsers no longer inflate grid column intrinsic width to default `size="20"` (~170 px per column).
   - Wrapped `.k-fill-grid` inside `.k-fill-scroll[data-scroller="true"]` so wide tables never clip horizontally.
   - Added `data-wide=""` on `.k-fill-split` whenever a trace table has `>= 5` columns so the pseudocode renders full-width above and the trace table renders full-width below.
3. **`js/engines/quiz.js`** (`:223–229`, `:277–283`, `:512–518`, `:593–605`, `:738–756`):
   - Upgraded MCQ prompts (`quiz.q`), MCQ explanations (`quiz.why`), Exam question prompts (`part.q`), mark-scheme points (`quiz.selfmark`), and model answers (`quiz.model-answer`) from `KOS.content.inline()` to `KOS.content.rich()` (with `.k-prose` styling when block constructs are present).
   - Moved `if (it.try)` in `mountExam` so interactive practice parts render **below** the question prompt (`part.q`) rather than above it.
4. **`js/engines/flashcards.js`** (`:325–336`, `:370–374`, `:595–600`):
   - Upgraded flashcard front/back faces and deck browse rows from `KOS.content.inline()` to `KOS.content.rich()` (keeping the small `Q · ...` back reminder compact).
5. **`css/views/study.css`** (`:476–480`, `:534–541`, `:1218–1235`):
   - Added `.k-fill-scroll` (`overflow-x: auto`) and `.k-fill-split[data-wide]` single-column stacking; removed `overflow: hidden` from `.k-fill-grid`; switched `.k-fill-grid` tracks to `repeat(var(--fill-cols, 3), minmax(var(--sp-48), auto))` with `min-inline-size: 0` on `.k-fill-in` and `white-space: nowrap; text-align: center;` on `.k-fill-th > *`.
   - Added tokenized `.k-prose` resets for fenced code blocks & tables inside `.k-fc-text`, `.k-qz-q`, `.k-qz-part-t`, `.k-qz-point-t`, `.k-qz-model`, and `.k-qz-why`.
6. **`tools/smoke200.test.js`** (new):
   - Step A: Rich block rendering (`KOS.content.rich`) across Exam Qs, Quizzes, Mark Schemes, and Flashcards.
   - Step B: Wide trace table stacking (`data-wide`) + horizontal scroller shell (`.k-fill-scroll`) with zero `overflow: hidden` clipping.
   - Step C: `examFromWorked` strips `{ lab }` and Notes-only `"Your turn"` variations, zero shipped exam items embed `{ lab }`, and `quiz.try` sits after `part.q` in DOM order.

### Before / After Behaviour & Live Chrome Verification (`1470×832`, `820×1180`, `375×812`)

- **`compsci:4.2.3.1` (Stacks — 5-mark Undo/Repeat Exam Q):** Previously embedded the full interactive `Stack push / pop / peek` Trace Lab directly above the written question. Now renders cleanly with `hasLab: false` and zero overflow.
- **`compsci:4.2.1.2` (Arrays — 8-column `NewItems` Trace Table):** Previously squeezed into a 50/50 split with `overflow: hidden`, clipping headers to `NewIte NewIte NewIte NewIte N`. Now stacks pseudocode full-width above the 8-column table, with **all 8 columns fitting visibly side-by-side** (`1470×832`: `boxW: 724, gridW: 724, fitsAll8: true`; `820×1180`: `boxW: 654, gridW: 654, fitsAll8: true`; `375×812`: smooth horizontal scroll, `overflow: false`, `PAGE_ERRORS: []`), and interactive `quiz.try` positioned below `part.q`.
- **Verification gates:** `node --check`, `smoke200` (4/4), `smoke55` (14/14), `smoke56` (all pass), `smoke142` (12/12; boot `5,359,385` B / `5.1111 MB` / `39.83 KB` free), `smoke153` (8/8 including `fill_check.mjs`), `smoke155` (10/10), `smoke197` (4/4).

---

## Content Reformatting Ledger

*(Populated batch-by-batch across Batches 2–7.)*

---

## Deduplication Ledger (Mandatory 4-Column Audit Log)

| Subject & Topic | Removed Item ID & Exact Question Text | Kept Canonical Item ID & Exact Question Text | Reason |
|---|---|---|---|
| *(Populated batch-by-batch across Batches 2–8.)* | | | |

---

## Before / After Counts Summary

*(Finalised in Batch 8 alongside full `SMOKE_JOBS=3 npm test` release gate output.)*
