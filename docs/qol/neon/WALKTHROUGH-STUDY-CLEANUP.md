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

### Batch 2 · Computer Science Paper 1 (`4.1–4.4`: 18 files)

- **`compsci:4.1.1.2`** (`cs-p1-411a.js`): Exam Qs *Factorial check program*, *Prime-factor program*, *Trace the sentinel loop*, *WHILE vs REPEAT with negatives* — inline pseudocode → fenced ` ```pseudo ` blocks; marked 3 Notes-only variation `try` widgets `notesOnly: true` (kept *Trace the sentinel loop* matching trace active).
- **`compsci:4.1.1.6`** (`cs-p1-411a.js`): Exam Q *GCF program* — inline pseudocode → ` ```pseudo `; marked `Number1 = 30, Number2 = 12` `try.trace` `notesOnly: true`.
- **`compsci:4.1.1.7`** (`cs-p1-411a.js`, `bank-cs-41.js`): Exam Qs *Trace the string adder*, *Palindrome program* — inline pseudocode → ` ```pseudo `; marked 2 variation `try` widgets `notesOnly: true`; Flashcard `:10` back → ` ```pseudo `.
- **`compsci:4.1.1.8`** (`cs-p1-411a.js`): Exam Q *Dice program* — inline pseudocode → ` ```pseudo `.
- **`compsci:4.1.1.9`** (`cs-p1-411b.js`): Exam Q *Returning −1 for a bad hex digit* — inline pseudocode → ` ```pseudo `.
- **`compsci:4.1.1.10`** (`cs-p1-411b.js`): Notes variation *Refactor repeated code* — inline C# → ` ```csharp `.
- **`compsci:4.1.1.12`** (`cs-p1-411b.js`, `bank-cs-41.js`): Exam Q *Hand-trace the hex conversion* — inline pseudocode → ` ```pseudo `; marked `"B3"/"2Z"` `try.trace` `notesOnly: true`; Quiz `FUNCTION Max(a, b)` → ` ```pseudo `.
- **`compsci:4.1.1.13`** (`cs-p1-411b.js`): Quiz `for (int i = 0; ...)` → ` ```csharp `.
- **`compsci:4.1.1.16`** (`cs-p1-411b.js`): Exam Qs *A base case of TreeSearch*, *Trace the cycle finder G*, *A base case of Traverse*, *Trace IsPath(3, 7)*, *How total works*, *Why naive Fibonacci is inefficient* — inline pseudocode/Haskell → ` ```pseudo ` / ` ```hs `; marked 3 variation `try` widgets `notesOnly: true`.
- **`compsci:4.1.2.3`** (`cs-p1-412.js`): Exam Q *Write the HDRabbit class* — `Rabbit = Class(Animal)` → ` ```pseudo `; marked 2 `try.predict` variations `notesOnly: true`.
- **`compsci:4.2.1.1`** (`cs-p1-42a.js`): Exam Q *Name the structure in the algorithm* (`AQA June 2024 P1 Q06.4`) & Quiz `Temp[Pos ← Pos + 1]` — inline pseudocode → ` ```pseudo `.
- **`compsci:4.2.1.2`** (`cs-p1-42a.js`): Exam Qs *Dry-run the de-duplication* (`Items = [12, 25, 12, 53]`) & *Walk the letter tree* — inline pseudocode → ` ```pseudo `; marked `[7, 7, 3, 7]` and `M = "100"` variation `try.trace` widgets `notesOnly: true`.
- **`compsci:4.2.2.1`** (`cs-p1-42b.js`): Exam Q *Reverse a queue with a stack* — marked `try.predict` `notesOnly: true`.
- **`compsci:4.2.3.1`** (`cs-p1-42b.js`): Exam Q *Undo and repeat with one stack* — removed misplaced `{ "lab": "tl-stack" }`; *Trace Traversal with its stack* — inline pseudocode → ` ```pseudo `; marked 2 variation `try` widgets `notesOnly: true`.
- **`compsci:4.2.4.1`** (`cs-p1-42c.js`): Exam Q *Check every node was visited* — inline pseudocode → ` ```pseudo `; *Matrix from ConnectedNodes* — marked variation `try.grid` `notesOnly: true`.
- **`compsci:4.2.5.1`** (`cs-p1-42c.js`): Exam Q *When E returns True* — inline pseudocode → ` ```pseudo `.
- **`compsci:4.2.6.1`** (`cs-p1-42d.js`): Exam Q *Add a record to a hash table* — removed misplaced `{ "lab": "hash-table" }`.
- **`compsci:4.2.7.1`** (`cs-p1-42d.js`): Notes variation *Trace a run of dictionary operations* — inline operations → ` ```pseudo `.
- **`compsci:4.2.8.1`** (`cs-p1-42d.js`): Exam Q *Can the enemy see the hero now?* — inline pseudocode → ` ```pseudo `, marked variation `try.grid` `notesOnly: true`; *Dot product with working* — removed misplaced `{ "lab": "cs-vector" }`.
- **`compsci:4.3.1.1`** (`cs-p1-43a.js`): Exam Q *Which traversal does G use?* — inline `FUNCTION G(V, P)` → ` ```pseudo `.
- **`compsci:4.3.2.1`** (`cs-p1-43a.js`): Exam Qs *In-order from post-order* & *Trace the in-order algorithm* — inline `Data`/`Dir1`/`Dir2` arrays → markdown pipe tables, inline pseudocode → ` ```pseudo `, marked smaller-tree `try` blocks `notesOnly: true`; *Reverse the output* — backticked pseudocode statements in mark scheme.
- **`compsci:4.3.3.1`** (`cs-p1-43a.js`): Exam Q *5 + 2 × 3 + 4 in RPN* — marked `try.grid` `notesOnly: true`.
- **`compsci:4.3.4.1`** (`cs-p1-43b.js`): Exam Q *Complexity of linear search* — removed misplaced `{ "lab": "linear-search" }`.
- **`compsci:4.3.4.2`** (`cs-p1-43b.js`): Exam Q *Hand-trace A(38, 0, 18)* — inline `SUBROUTINE A(S, X, Y)` → ` ```pseudo `, removed `{ "lab": "binary-search" }`, marked `A(68, 0, 18)` `try.trace` `notesOnly: true`; *Why O(log n), 2025* — marked `try.grid` `notesOnly: true`.
- **`compsci:4.3.4.3`** (`cs-p1-43b.js`): Exam Q *Fill the gaps in BTS* — inline records `[0]..[4]` → markdown table + `SUBROUTINE BTS(k)` → ` ```pseudo `.
- **`compsci:4.3.5.1`** (`cs-p1-43c.js`): Exam Qs *Three bubble-sort passes*, *Two improvements*, *Trace the descending sort*, *Trace the ascending sort* — removed `{ "lab": "sort-viz" }`, inline bubble/insertion pseudocode → ` ```pseudo `, marked 4 variation `try` widgets `notesOnly: true`.
- **`compsci:4.3.6.1`** (`cs-p1-43c.js`): Exam Q *Trace Dijkstra on the warehouse* — inline Dijkstra pseudocode → ` ```pseudo `, removed `{ "lab": "dijkstra" }`; *True or false about Dijkstra* — `(a)–(d)` → bulleted list.
- **`compsci:4.4.1.1`** (`cs-p1-441.js`): Exam Q *Why Statement 1 fails* — `1.–6.` → numbered list.
- **`compsci:4.4.1.2`** (`cs-p1-441.js`, `bank-cs-44a.js`): Exam Qs *Trace the prime test with 5*, *Purpose of the MOD/DIV loop*, *Why the palindrome check is inefficient*, Notes variation *Make the palindrome check efficient*, Flashcard `:10`, Quiz `:4` — inline pseudocode/C# → fenced blocks; marked 2 variation `try` widgets `notesOnly: true`.
- **`compsci:4.4.2.1`** (`cs-p1-442.js`): Exam Qs *Accepted or not?*, *Transition table rows for S2* — marked 2 variation `try.grid` widgets `notesOnly: true`.
- **`compsci:4.4.2.3`** (`cs-p1-442.js`): Exam Q *Which strings match 1|01+?* — removed `{ "lab": "regex-sandbox" }`, marked variation `try.grid` `notesOnly: true`.
- **`compsci:4.4.2.4`** (`cs-p1-442.js`): Notes variation *Regular or not?* & Exam Q *True or false about regular languages* — formatted `(a)–(d)` / `(a)–(c)` as bulleted lists with fenced ` ```BNF `.
- **`compsci:4.4.3.1`** (`cs-p1-442.js`): Exam Qs *Valid real numbers?*, *BNF for a natural number*, *One rule for `<sentence>`*, *Which are valid sentences?* — removed `{ "lab": "bnf-checker" }`, formatted BNF rules in fenced ` ```BNF `, marked 2 variation `try.grid` widgets `notesOnly: true`.
- **`compsci:4.4.4.3`** (`cs-p1-444.js`): Notes variations *Derive the complexity* & *A loop inside a halving loop* — bulleted list + fenced ` ```cs `.
- **Batch 2 Verification:** `srs_guard.cjs` `0` shifted/duplicated keys (`compsci` FC `2000 -> 1955 (-45)`, Quiz `1419 -> 1403 (-16)`, Exam `994 -> 994`); `validate_content.js` 45 files `0` errors; `card_lint.mjs --check` `0` flagged; `gen_lazy_index.mjs` updated (`402 KB`); `smoke65`, `smoke66`, `smoke153`, `smoke155`, `smoke197`, `smoke200`, `smoke142` all PASS; live Chrome verified `4.2.1.1` & `4.2.1.2` clean rendered code blocks with zero mismatch and zero overflow.

### Batch 3 · Computer Science Paper 2 (`4.5–4.13`, `cs-m-*`, `cs-nea`, `bank-cs-45..413`: 39 files)

- **`compsci:4.1.1.3`** (`cs-m-operations.js`): Reformatted 4 inline pseudocode Exam Qs (*Persistence*, *Binary-digits*, *Tally-mark*, *Validation-loop*) into fenced ` ```pseudo ` blocks; marked 4 variation `try` widgets `notesOnly: true` (kept matching `gates` widget active).
- **`compsci:4.5.1.1`, `4.5.2.1`, `4.5.3.1`, `4.5.4.1`, `4.5.4.3–4.5.4.8`, `4.5.5.1`, `4.5.5.3`, `4.5.6.1`, `4.5.6.4`, `4.5.6.7–4.5.6.10`** (`cs-m-*`, `cs-p2-45*`): Removed remaining 4 misplaced `{ lab }` embeds (`binary-number`, `char-codes`, `adc-sampling`, `bitmap-lab`) from `worked[tag="exam"].try`; reformatted *The registers in a Caesar program* and *Fix the Caesar decryption* into fenced ` ```pseudo ` / ` ```asm ` blocks; marked 42 Notes-only "Your turn" variation `try` widgets `notesOnly: true`.
- **`compsci:4.6.1.2–4.6.5.1`** (`cs-p2-46a.js`, `cs-p2-46b.js`): Marked 10 differing "Your turn" variation `try` widgets `notesOnly: true` (kept matching truth tables & logic-gate circuits active).
- **`compsci:4.7.1.1`, `4.7.3.2–4.7.3.5`** (`cs-p2-47a.js`, `cs-p2-47b.js`): Reformatted 10 inline pseudocode & AQA assembly programs in `4.7.3.5` into fenced ` ```pseudo ` / ` ```asm ` blocks; marked 17 Notes-only "Your turn" variation `try` widgets `notesOnly: true`.
- **`compsci:4.9.1.2`, `4.9.3.2`, `4.9.4.1`, `4.9.4.3`, `4.9.4.4`, `4.9.4.10`** (`cs-p2-49a/b/c.js`): Formatted A–D/A–E MCQ options as clean bulleted lists; converted *REST to SQL* raw pipe rows into a Markdown table; backticked XML snippet; marked 8 "Your turn" `try` widgets `notesOnly: true`.
- **`compsci:4.10.1–4.10.4`** (`cs-p2-410a/b.js`, `bank-cs-410-413.js`): Formatted relation schemas & MCQ options as lists; converted inline SQL into fenced ` ```sql ` blocks across 3 Exam Qs, 2 Quizzes, and 2 Flashcard backs (plus backticked SQL clauses on 5 flashcards); marked 16 "Your turn" `try` widgets `notesOnly: true`.
- **`compsci:4.12.1.1–4.12.3.1`** (`cs-p2-412a/b.js`): Formatted inline Haskell across 14 worked items into fenced ` ```hs ` blocks and bulleted lists; marked 9 variation `try` widgets `notesOnly: true`.
- **`compsci:4.13.1.2–4.13.1.5`** (`cs-p2-413.js`): Formatted 4 inline pseudocode Exam Qs into fenced ` ```pseudo ` blocks; marked 7 "Your turn" `try` widgets `notesOnly: true`. (`cs-nea.js`: audited, 0 issues.)
- **Batch 3 Verification:** `srs_guard.cjs` `0` shifted/duplicated keys (`compsci` FC `1955 -> 1894 (-61)`, Quiz `1403 -> 1385 (-18)`, Exam `994 -> 981 (-13)`); `validate_content.js` 45 files `0` errors; `card_lint.mjs --check` `0` flagged; `gen_lazy_index.mjs` updated (`402 KB`); `smoke65`, `smoke66`, `smoke153`, `smoke155`, `smoke197`, `smoke200`, `smoke142` all PASS.

---

## Deduplication Ledger (Mandatory 4-Column Audit Log)

| Subject & Topic | Removed Item ID & Exact Question Text | Kept Canonical Item ID & Exact Question Text | Reason |
|---|---|---|---|
| `compsci:4.1.1.1` | `compsci:4.1.1.1:13` — "Why store a telephone number as a string rather than an integer?" | `compsci:4.1.1.1:2` — "Best type for a phone number?" | Duplicate flashcard (phone number → String: leading zeros, spaces, no arithmetic). |
| `compsci:4.1.1.2` | `compsci:4.1.1.2:13` — "Why use meaningful identifier names?" | `compsci:4.1.1.2:4` — "Why use meaningful identifiers?" | Exact duplicate concept & answer (readability, debugging, maintenance). |
| `compsci:4.1.1.8` | `compsci:4.1.1.8:8` — "What does a random number generator in a program actually produce?" | `compsci:4.1.1.8:3` — "What makes a random number pseudo-random?" | Duplicate flashcard (deterministic sequence from a seed). |
| `compsci:4.1.1.8` | `compsci:4.1.1.8:10` — "Why might a program set the seed to a fixed value during testing?" | `compsci:4.1.1.8:4` — "Why use a seed?" | Duplicate flashcard (reproducible sequence for testing/debugging). |
| `compsci:4.1.1.8` | `compsci:4.1.1.8:15` — "Why is a simple pseudo-random generator unsuitable for cryptography?" | `compsci:4.1.1.8:6` — "Why should System.Random not be used to make security keys?" | Duplicate flashcard (predictable from seed; use cryptographic RNG). |
| `compsci:4.1.1.9` | `compsci:4.1.1.9:14` — "What happens to an unhandled exception?" | `compsci:4.1.1.9:6` — "What happens to an exception that nothing catches?" | Duplicate flashcard (propagates up call stack, terminates program). |
| `compsci:4.1.1.10` | `q:compsci:4.1.1.10:8` — "After a subroutine finishes, execution continues:" | `q:compsci:4.1.1.10:2` — "After a subroutine finishes, control goes to" | Duplicate MCQ testing return to statement after call (`oi` preserved). |
| `compsci:4.1.1.11` | `q:compsci:4.1.1.11:5` — "In `Area(length, width)` called as `Area(5, 3)`, the values 5 and 3 are:" | `q:compsci:4.1.1.11:4` — "In Area(4, 2.5), 4 and 2.5 are" | Duplicate MCQ testing `Area(...)` arguments (`oi` preserved). |
| `compsci:4.1.1.11` | `q:compsci:4.1.1.11:8` — "Which is an accepted reason parameters improve subroutines?" | `q:compsci:4.1.1.11:3` — "A benefit of parameters over globals is" | Duplicate MCQ testing self-contained parameter passing (`oi` preserved). |
| `compsci:4.1.1.14` | `q:compsci:4.1.1.14:5` — "The main risk of globals is:" | `q:compsci:4.1.1.14:3` — "Main danger of global variables" | Duplicate MCQ with identical answer (`unintended side-effects`). |
| `compsci:4.1.1.15` | `compsci:4.1.1.15:10` — "Why is a stack (LIFO) the right structure for subroutine calls?" | `compsci:4.1.1.15:2` — "Why a stack?" | Duplicate flashcard (most recent call finishes first, LIFO). |
| `compsci:4.1.1.15` | `compsci:4.1.1.15:13` — "What causes stack overflow?" | `compsci:4.1.1.15:5` — "What is a stack overflow, and what usually causes it?" | Duplicate flashcard covering stack overflow cause. |
| `compsci:4.1.1.16` | `q:compsci:4.1.1.16:10` — "Which structure is naturally processed by recursion?" | `q:compsci:4.1.1.16:4` — "Recursion is a natural fit for" | Duplicate MCQ (trees / tree traversal). |
| `compsci:4.1.2.1` | `q:compsci:4.1.2.1:4` — "SQL is best described as:" | `q:compsci:4.1.2.1:2` — "SQL is an example of a language in the" | Duplicate MCQ (`SQL` → `declarative`, `oi` preserved). |
| `compsci:4.1.2.2` | `compsci:4.1.2.2:11` — "Give two benefits of the structured approach." | `compsci:4.1.2.2:7` — "Three advantages of the structured approach?" | Duplicate flashcard listing identical structured-programming benefits. |
| `compsci:4.1.2.3` | `compsci:4.1.2.3:22` — "What is method overriding?" | `compsci:4.1.2.3:5` — "What is overriding?" | Exact duplicate definition (subclass re-implements inherited method). |
| `compsci:4.1.2.3` | `q:compsci:4.1.2.3:10` — "A class marked abstract:" | `q:compsci:4.1.2.3:4` — "Which can NOT be instantiated?" | Duplicate MCQ (`abstract class cannot be instantiated`, `oi` preserved). |
| `compsci:4.2.1.1` | `compsci:4.2.1.1:10` — "State two disadvantages of a dynamic data structure." | `compsci:4.2.1.1:5` — "One disadvantage of a dynamic structure?" | Duplicate flashcard covering identical dynamic-structure disadvantages. |
| `compsci:4.2.1.1` | `q:compsci:4.2.1.1:4` — "Which statement about a static data structure is correct?" | `q:compsci:4.2.1.1:0` — "A structure whose size is fixed at compile time is" | Duplicate MCQ (static = fixed size before runtime, `oi` preserved). |
| `compsci:4.2.2.1` | `q:compsci:4.2.2.1:6` — "A circular queue in Q[0..4] has rear = 4. After an enqueue, rear becomes:" | `q:compsci:4.2.2.1:1` — "Circular, size 5, rear = 4: after one enqueue rear is" | Duplicate MCQ with identical size-5 circular queue wrap-around (`rear = 4 → 0`). |
| `compsci:4.2.2.1` | `q:compsci:4.2.2.1:10` — "Dequeuing from a queue with size = 0 causes:" | `q:compsci:4.2.2.1:4` — "Removing from an empty queue is" | Duplicate MCQ (`underflow`). |
| `compsci:4.2.3.1` | `compsci:4.2.3.1:12` — "What error occurs when popping an empty stack?" | `compsci:4.2.3.1:6` — "Pop on an empty stack?" | Exact duplicate flashcard (`stack underflow`). |
| `compsci:4.2.4.1` | `q:compsci:4.2.4.1:5` — "Testing whether an edge exists between two given vertices is O(1) with:" | `q:compsci:4.2.4.1:2` — "Testing whether edge i–j exists is fastest with" | Duplicate MCQ (`adjacency matrix` direct lookup, `oi` preserved). |
| `compsci:4.2.6.1` | `compsci:4.2.6.1:11` — "Why is a hash table lookup faster than searching a sorted list?" | `compsci:4.2.6.1:6` — "Why are hash tables fast?" | Duplicate flashcard (direct calculated index, average O(1)). |
| `compsci:4.2.6.1` | `compsci:4.2.6.1:14` — "Why do collisions slow a nearly full hash table?" | `compsci:4.2.6.1:7` — "Why do hash tables slow down when nearly full?" | Duplicate flashcard (more collisions / probing). |
| `compsci:4.2.8.1` | `compsci:4.2.8.1:15` — "Effect of multiplying a vector by −1?" | `compsci:4.2.8.1:10` — "Effect of × −1 on the angle with b?" | Duplicate flashcard (magnitude unchanged, reversed direction). |
| `compsci:4.2.8.1` | `compsci:4.2.8.1:18` — "Three ways to represent a vector in a program?" | `compsci:4.2.8.1:2` — "Three representations of a vector in code?" | Duplicate flashcard (1-D array/list, dictionary, function). |
| `compsci:4.3.1.1` | `compsci:4.3.1.1:0` — "BFS uses which data structure?" | `compsci:4.3.1.1:10` — "Which data structure does breadth-first search use?" | Exact duplicate concept & answer (`queue`). |
| `compsci:4.3.1.1` | `compsci:4.3.1.1:1` — "DFS uses which data structure?" | `compsci:4.3.1.1:9` — "Which data structure does depth-first search use?" | Exact duplicate concept & answer (`stack / recursion`). |
| `compsci:4.3.1.1` | `compsci:4.3.1.1:7` — "Why mark vertices visited?" | `compsci:4.3.1.1:16` — "Why does a traversal need Visited flags in a graph but not in a tree?" | Duplicate concept (prevent revisiting / infinite cycle loops). |
| `compsci:4.3.2.1` | `compsci:4.3.2.1:3` — "Use of pre-order?" | `compsci:4.3.2.1:14` — "Which traversal is used to copy a tree?" | Exact duplicate concept & answer (copying a tree). |
| `compsci:4.3.2.1` | `compsci:4.3.2.1:4` — "Use of in-order?" | `compsci:4.3.2.1:12` — "Which traversal outputs a BST in ascending order?" | Exact duplicate concept & answer (BST ascending output). |
| `compsci:4.3.3.1` | `compsci:4.3.3.1:5` — "Two advantages of RPN?" | `compsci:4.3.3.1:14` — "Give two reasons RPN is used instead of infix." | Exact duplicate concept & answer (no brackets/precedence, stack evaluation). |
| `compsci:4.3.4.2` | `compsci:4.3.4.2:14` — "How is the middle index calculated?" | `compsci:4.3.4.2:1` — "Middle index in AQA's binary search?" | Exact duplicate formula (`(Low + High) DIV 2`). |
| `compsci:4.3.4.2` | `compsci:4.3.4.2:15` — "When does the search conclude 'not found'?" | `compsci:4.3.4.2:4` — "When does it stop without finding?" | Exact duplicate stopping condition (`Low > High`). |
| `compsci:4.3.5.1` | `compsci:4.3.5.1:12` — "How many passes guarantee that n items are sorted?" | `compsci:4.3.5.1:3` — "Passes guaranteed to sort 100 items?" | Exact duplicate fact (`n − 1`). |
| `compsci:4.3.5.1` | `compsci:4.3.5.1:13` — "Describe the swap-flag optimisation." | `compsci:4.3.5.1:4` — "What is the first standard improvement to bubble sort?" | Duplicate concept (swapped flag for early exit). |
| `compsci:4.3.5.1` | `compsci:4.3.5.1:14` — "Describe the shrinking-range optimisation." | `compsci:4.3.5.1:5` — "What is the second standard improvement to bubble sort?" | Exact duplicate concept (shrink inner loop bound by 1 each pass). |
| `compsci:4.3.5.2` | `compsci:4.3.5.2:11` — "How are two sorted lists merged?" | `compsci:4.3.5.2:4` — "How does merge sort's merge step work?" | Exact duplicate question & answer. |
| `compsci:4.3.6.1` | `compsci:4.3.6.1:12` — "What is the predecessor array for?" | `compsci:4.3.6.1:4` — "What does array P hold?" | Exact duplicate concept (`P` predecessor array for path reconstruction). |
| `compsci:4.3.6.1` | `q:compsci:4.3.6.1:5` — "Which node does Dijkstra process next?" | `q:compsci:4.3.6.1:0` — "Dijkstra's algorithm next processes" | Exact duplicate MCQ (unvisited node with smallest distance, `oi` preserved). |
| `compsci:4.4.1.1` | `compsci:4.4.1.1:3` — "Mislabelled boxes: which box to sample?" | `compsci:4.4.1.1:8` — "Three boxes are labelled Apples, Oranges, Both — every label wrong. Which box do you open to fix all labels?" | Duplicate puzzle; kept self-contained statement. |
| `compsci:4.4.1.1` | `compsci:4.4.1.1:14` — "How do you check a puzzle answer?" | `compsci:4.4.1.1:6` — "How should you check a logic-puzzle solution?" | Exact duplicate concept & answer. |
| `compsci:4.4.2.1` | `compsci:4.4.2.1:12` — "When does an FSM without output accept a string?" | `compsci:4.4.2.1:3` — "When is a string accepted?" | Exact duplicate concept & answer. |
| `compsci:4.4.2.3` | `compsci:4.4.2.3:5` — "What regular expression did AQA give for a UK postcode in 2017?" | `compsci:4.4.2.3:16` — "Regex for a UK postcode: 1–2 letters, digit, optional letter-or-digit, digit, two letters?" | Duplicate UK postcode regex; kept self-contained specification. |
| `compsci:4.4.2.3` | `compsci:4.4.2.3:17` — "Which strings match `1|01+`?" | `compsci:4.4.2.3:4` — "Which of 1, 11, 01, 0111 match the regular expression 1|01+?" | Exact duplicate regex & matching set. |
| `compsci:4.4.2.4` | `compsci:4.4.2.4:9` — "Is every regular language finite?" | `compsci:4.4.2.4:1` — "Can a regular language be infinite?" | Exact duplicate concept (regular languages can be infinite). |
| `compsci:4.4.2.4` | `compsci:4.4.2.4:11` — "Are there BNF-definable languages that are not regular?" | `compsci:4.4.2.4:5` — "Can BNF describe non-regular languages?" | Exact duplicate concept & example (balanced brackets). |
| `compsci:4.4.2.4` | `compsci:4.4.2.4:12` — "Is {aⁿbⁿ \| n ≥ 0} regular?" | `compsci:4.4.2.4:4` — "Why isn't aⁿbⁿ regular?" | Exact duplicate language & explanation. |
| `compsci:4.4.3.1` | `compsci:4.4.3.1:10` — "What does `::=` mean in BNF?" | `compsci:4.4.3.1:0` — "What does ::= mean in BNF?" | Exact duplicate question & answer. |
| `compsci:4.4.3.1` | `compsci:4.4.3.1:12` — "What is a non-terminal symbol?" | `compsci:4.4.3.1:1` — "What is a non-terminal in BNF?" | Exact duplicate question & answer. |
| `compsci:4.4.3.1` | `compsci:4.4.3.1:14` — "Why can BNF define languages that regular expressions cannot?" | `compsci:4.4.3.1:5` — "Why can BNF describe languages regexes can't?" | Exact duplicate question & answer (recursive rules). |
| `compsci:4.4.3.1` | `q:compsci:4.4.3.1:6` — "Balanced brackets can be defined in BNF but not by a regex because:" | `q:compsci:4.4.3.1:3` — "BNF can describe balanced brackets because it has" | Exact duplicate MCQ (`oi` preserved). |
| `compsci:4.4.4.1` | `compsci:4.4.4.1:12` — "Why compare algorithms by growth rate rather than by timing?" | `compsci:4.4.4.1:1` — "Why not compare run times in seconds?" | Exact duplicate concept & answer. |
| `compsci:4.4.4.1` | `q:compsci:4.4.4.1:9` — "Comparing algorithms fairly uses:" | `q:compsci:4.4.4.1:0` — "Algorithms are best compared by" | Exact duplicate MCQ (identical 4 options). |
| `compsci:4.4.4.2` | `compsci:4.4.4.2:10` — "How many permutations of n distinct items are there?" | `compsci:4.4.4.2:5` — "Permutations of n distinct objects?" | Exact duplicate question & answer (`n!`). |
| `compsci:4.4.4.2` | `compsci:4.4.4.2:11` — "Why does a word with repeated letters have fewer than n! distinct anagrams?" | `compsci:4.4.4.2:7` — "Why are anagrams of n letters not always n!?" | Exact duplicate concept & answer. |
| `compsci:4.4.4.3` | `q:compsci:4.4.4.3:4` — "O(5n + 20) simplifies to:" | `q:compsci:4.4.4.3:2` — "O(5n + 3) simplifies to" | Exact duplicate MCQ (`O(n)`, `oi` preserved). |
| `compsci:4.4.4.3` | `q:compsci:4.4.4.3:5` — "Two nested loops over n items give:" | `q:compsci:4.4.4.3:1` — "for i<n { for j<n {…} } is" | Exact duplicate MCQ (`O(n²)`). |
| `compsci:4.4.5.1` | `compsci:4.4.5.1:15` — "What is the significance of the Turing machine?" | `compsci:4.4.5.1:6` — "Importance of Turing machines?" | Exact duplicate question & answer. |
| `compsci:4.4.5.1` | `compsci:4.4.5.1:16` — "What is a transition function?" | `compsci:4.4.5.1:2` — "How is a Turing machine's transition function written?" | Duplicate definition of `δ(state, symbol)`. |
| `compsci:4.4.1.9` | `compsci:4.4.1.9:1` — "Three mark points for decomposition?" | `compsci:4.4.1.9:8` — "Define decomposition." | Duplicate flashcard testing identical 3 mark-scheme points. |
| `compsci:4.5.4.5` | `e:compsci:4.5.4.5:1` — "Calculate the absolute error / relative error / why relative error is more useful" (`AQA 2021 P2 Q10`) | `e:compsci:4.5.4.5:7` + `:8` (`AQA June 2021 · P2 Q10.3–10.5`) | Duplicate umbrella exam Q covered by worked cards (`oi` preserved). |
| `compsci:4.5.4.7` | `compsci:4.5.4.7:8` — "What determines the range of a floating point number?" | `compsci:4.5.4.7:7` — "Which field controls range?" | Exact duplicate concept & answer (exponent). |
| `compsci:4.5.5.1` | `e:compsci:4.5.5.1:1` — "Explain character code / Why Unicode was introduced" (`AS 2022 P2 Q4`) | `e:compsci:4.5.5.1:5` + `:7` (`AS June 2022 · P2 Q04.1–04.2`) | Duplicate umbrella exam Q covered by worked cards (`oi` preserved). |
| `compsci:4.5.5.3` | `compsci:4.5.5.3:14` — "Describe majority voting." | `compsci:4.5.5.3:5` — "How does majority voting work?" | Exact duplicate concept & answer. |
| `compsci:4.5.6.8` | `compsci:4.5.6.8:9` — "Give three items a MIDI message might contain." | `compsci:4.5.6.8:2` — "Data in a MIDI message?" | Exact duplicate MIDI message fields. |
| `compsci:4.5.6.9` | `compsci:4.5.6.9:10` — "Give two reasons files are compressed." | `compsci:4.5.6.9:0` — "Two reasons to compress?" | Exact duplicate concept & answer. |
| `compsci:4.5.6.9` | `compsci:4.5.6.9:13` — "Describe run-length encoding." | `compsci:4.5.6.9:3` — "How does run-length encoding (RLE) compress data?" | Exact duplicate concept & answer. |
| `compsci:4.5.6.9` | `e:compsci:4.5.6.9:13` (`AQA 2025 · P2 Q10` parts) | `e:compsci:4.5.6.9:3` + `:12` (`AQA June 2025 · P2 Q10.1–10.2`) | Duplicate umbrella exam Q (`qk` preserved). |
| `compsci:4.5.6.9` | `e:compsci:4.5.6.9:14` (`AQA 2019 · P2 Q03` parts) | `e:compsci:4.5.6.9:1` + `:9` + `:10` (`AQA June 2019 · P2 Q03.1–03.3`) | Duplicate umbrella exam Q (`qk` preserved). |
| `compsci:4.5.6.10` | `compsci:4.5.6.10:17` — "What does computationally secure mean?" | `compsci:4.5.6.10:7` — "What does computational security mean?" | Exact duplicate definition. |
| `compsci:4.5.6.10` | `e:compsci:4.5.6.10:18` (`AQA 2023 · P2 Q03` parts) | `e:compsci:4.5.6.10:2` + `:6` + `:10` (`AQA June 2023 · P2 Q03.1–03.4`) | Duplicate umbrella exam Q (`qk` preserved). |
| `compsci:4.6.1.3` | `compsci:4.6.1.3:13` — "Give three utility programs." | `compsci:4.6.1.3:2` — "Give three examples of utility software." | Exact duplicate utility examples. |
| `compsci:4.6.1.4` | `compsci:4.6.1.4:9` — "Describe the OS's processor-management role." | `compsci:4.6.1.4:2` — "Describe processor management." | Exact duplicate OS role. |
| `compsci:4.6.1.4` | `compsci:4.6.1.4:10` — "Describe the OS's memory-management role." | `compsci:4.6.1.4:3` — "Describe memory management." | Exact duplicate OS role. |
| `compsci:4.6.1.4` | `compsci:4.6.1.4:11` — "Describe the OS's I/O-management role." | `compsci:4.6.1.4:4` — "Describe I/O management." | Exact duplicate OS role. |
| `compsci:4.6.3.1` | `compsci:4.6.3.1:14` — "Why do some compilers produce bytecode rather than machine code?" | `compsci:4.6.3.1:8` — "Why do some compilers produce bytecode?" | Exact duplicate concept & answer. |
| `compsci:4.6.3.1` | `e:compsci:4.6.3.1:11` (`AQA 2018 · P2 Q11` parts) | `e:compsci:4.6.3.1:2` + `:3` (`AS June 2018 · P2 Q11.1–11.2`) | Duplicate umbrella exam Q (`qk` preserved). |
| `compsci:4.6.4.1` | `e:compsci:4.6.4.1:28` (`AQA 2023 · P2 Q09` parts) | `e:compsci:4.6.4.1:24` (`A-level June 2023 · P2 Q09.1–09.2`) | Duplicate umbrella exam Q (`qk` preserved). |
| `compsci:4.6.5.1` | `e:compsci:4.6.5.1:24` (`AQA 2019 · P2 Q08` parts) | `e:compsci:4.6.5.1:17` + `:0` (`A-level June 2019 · P2 Q08.3–08.4`) | Duplicate umbrella exam Q (`qk` preserved). |
| `compsci:4.7.1.1` | `e:compsci:4.7.1.1:15` (`AQA 2024 · P2 Q03` parts) | `e:compsci:4.7.1.1:1`, `:6`, `:9`, `:10` (`Q03.3–03.6`) | Duplicate umbrella exam Q (`qk` preserved). |
| `compsci:4.7.3.3` | `compsci:4.7.3.3:14` — "Why is a compiled executable processor-specific?" | `compsci:4.7.3.3:8` — "Why won't a compiled program run on a different processor?" | Exact duplicate concept & answer. |
| `compsci:4.7.3.7` | `compsci:4.7.3.7:14` — "How does more cache improve performance?" | `compsci:4.7.3.7:3` — "Why does more cache help?" | Exact duplicate concept & answer. |
| `compsci:4.7.3.7` | `compsci:4.7.3.7:16` — "How does data bus width affect performance?" | `compsci:4.7.3.7:5` — "Effect of a wider data bus?" | Exact duplicate concept & answer. |
| `compsci:4.7.4.1` | `compsci:4.7.4.1:14` — "Describe how a barcode reader works." | `compsci:4.7.4.1:0` — "How does a barcode reader work?" | Exact duplicate concept & answer. |
| `compsci:4.7.4.1` | `compsci:4.7.4.1:16` — "Describe how a laser printer prints." | `compsci:4.7.4.1:6` — "What are the stages of laser printing, in order?" | Exact duplicate 6-stage process. |
| `compsci:4.7.4.1` | `e:compsci:4.7.4.1:10` (`AQA 2024 · P2 Q09` parts) | `e:compsci:4.7.4.1:1` + `:2` (`AS June 2024 · P2 Q09.1–09.2`) | Duplicate umbrella exam Q (`qk` preserved). |
| `compsci:4.7.4.1` | `e:compsci:4.7.4.1:13` (`AQA 2020 · P2 Q08` parts) | `e:compsci:4.7.4.1:7` (`A-level June 2020 · P2 Q08.1–08.2`) | Duplicate umbrella exam Q. |
| `compsci:4.7.4.2` | `compsci:4.7.4.2:16` — "Give two advantages of SSDs over hard disks." | `compsci:4.7.4.2:9` — "Two SSD advantages over HDD?" | Exact duplicate concept & answer. |
| `compsci:4.7.4.2` | `e:compsci:4.7.4.2:13` (`AQA 2025 · P2 Q03` parts) | `e:compsci:4.7.4.2:9` + `:10` (`A-level June 2025 · P2 Q03.1–03.2`) | Duplicate umbrella exam Q (`qk` preserved). |
| `compsci:4.7.4.2` | `e:compsci:4.7.4.2:14` (`AQA 2022 · P2 Q13` parts) | `e:compsci:4.7.4.2:0` + `:1` (`A-level June 2022 · P2 Q13.2–13.3`) | Duplicate umbrella exam Q (`qk` preserved). |
| `compsci:4.9.1.1` | `compsci:4.9.1.1:15` — "Why are internal buses parallel?" | `compsci:4.9.1.1:9` — "Why is the internal data bus parallel?" | Duplicate parallel-bus flashcard. |
| `compsci:4.9.2.1` | `compsci:4.9.2.1:3` — "What is a physical star topology?" | `compsci:4.9.2.1:10` — "Describe a physical star topology." | Duplicate definition (kept fuller card). |
| `compsci:4.9.2.1` | `compsci:4.9.2.1:5` — "What is a logical bus topology?" | `compsci:4.9.2.1:11` — "Describe a logical bus topology." | Duplicate definition (kept fuller card). |
| `compsci:4.9.2.2` | `compsci:4.9.2.2:2` — "How does a client-server network work?" | `compsci:4.9.2.2:8` — "Describe client–server networking." | Duplicate concept & answer. |
| `compsci:4.9.2.2` | `compsci:4.9.2.2:7` — "A disadvantage of peer-to-peer availability?" | `compsci:4.9.2.2:13` — "Give one disadvantage of peer-to-peer." | Covered directly in kept card. |
| `compsci:4.9.2.2` | `compsci:4.9.2.2:10` — "Why does peer-to-peer suit a household of students?" | `compsci:4.9.2.2:5` — "When to choose peer-to-peer?" | Duplicate P2P justification. |
| `compsci:4.9.2.2` | `compsci:4.9.2.2:11` — "Why does client–server suit a school?" | `compsci:4.9.2.2:6` — "When to choose client-server?" | Duplicate client–server justification. |
| `compsci:4.9.2.2` | `q:compsci:4.9.2.2:4` — "In a peer-to-peer network each computer:" | `q:compsci:4.9.2.2:0` — "In peer-to-peer networking" | Duplicate MCQ (`oi` preserved). |
| `compsci:4.9.2.3` | `compsci:4.9.2.3:6` — "What are the steps of CSMA/CA with RTS/CTS?" | `compsci:4.9.2.3:15` — "Describe CSMA/CA with RTS/CTS." | Exact duplicate procedure. |
| `compsci:4.9.2.3` | `compsci:4.9.2.3:8` — "Why avoidance, not detection, in Wi-Fi?" | `compsci:4.9.2.3:16` — "Why is collision avoidance used in wireless rather than collision detection?" | Duplicate explanation. |
| `compsci:4.9.2.3` | `compsci:4.9.2.3:9` — "What does the ACK do?" | `compsci:4.9.2.3:19` — "What does an ACK do in CSMA/CA?" | Duplicate ACK role. |
| `compsci:4.9.2.3` | `compsci:4.9.2.3:17` — "What hardware does a device need to join a wireless network?" | `compsci:4.9.2.3:1` — "Two components for wireless networking?" | Duplicate NIC + WAP card. |
| `compsci:4.9.3.1` | `compsci:4.9.3.1:3` — "What does a router do?" | `compsci:4.9.3.1:14` — "What is the role of a router in packet switching?" | Duplicate router forwarding card. |
| `compsci:4.9.3.1` | `q:compsci:4.9.3.1:4` — "DNS converts:" | `q:compsci:4.9.3.1:0` — "DNS translates" | Duplicate DNS MCQ (`oi` preserved). |
| `compsci:4.9.3.1` | `q:compsci:4.9.3.1:7` — "A gateway differs from a router because it:" | `q:compsci:4.9.3.1:1` — "A gateway, unlike a router," | Duplicate gateway MCQ (`oi` preserved). |
| `compsci:4.9.3.1` | `q:compsci:4.9.3.1:9` — "Time to live in a packet header:" | `q:compsci:4.9.3.1:3` — "TTL in a packet" | Duplicate TTL MCQ (`oi` preserved). |
| `compsci:4.9.3.2` | `compsci:4.9.3.2:6` — "How is a signature verified?" | `compsci:4.9.3.2:14` — "Describe how a digital signature is verified." | Duplicate verification steps. |
| `compsci:4.9.4.1` | `q:compsci:4.9.4.1:4` — "Port numbers are added by the:" | `q:compsci:4.9.4.1:0` — "Which layer adds port numbers?" | Duplicate Transport layer MCQ (`oi` preserved). |
| `compsci:4.9.4.1` | `q:compsci:4.9.4.1:9` — "Routing decisions are a function of the:" | `q:compsci:4.9.4.1:1` — "Routing happens in the" | Duplicate Network layer MCQ (`oi` preserved). |
| `compsci:4.9.4.3` | `compsci:4.9.4.3:4` — "Which host IDs cannot be assigned?" | `compsci:4.9.4.3:13` — "Which addresses in a subnet cannot be given to hosts?" | Duplicate reserved addresses card. |
| `compsci:4.9.4.3` | `compsci:4.9.4.3:5` — "How many bits in an IPv4 address?" | `compsci:4.9.4.3:8` — "How long is an IPv4 address and how is it written?" | Duplicate IPv4 length card. |
| `compsci:4.9.4.4` | `compsci:4.9.4.4:7` — "How does a host decide to use the router?" | `compsci:4.9.4.4:13` — "How does a host decide whether a destination is on its own subnet?" | Duplicate subnet mask logic card. |
| `compsci:4.9.4.6` | `compsci:4.9.4.6:9` — "Why can many LANs use 192.168.0.4?" | `compsci:4.9.4.6:13` — "Why can two different LANs both use 192.168.2.3?" | Duplicate private-IP reuse card. |
| `compsci:4.9.4.7` | `compsci:4.9.4.7:7` — "Why use DHCP?" | `compsci:4.9.4.7:12` — "Give two reasons DHCP is used." | Duplicate DHCP benefits card. |
| `compsci:4.9.4.7` | `compsci:4.9.4.7:16` — "What does the host send first and how?" | `compsci:4.9.4.7:2` — "How does a new host find a DHCP server?" | Duplicate DHCPDISCOVER broadcast card. |
| `compsci:4.9.4.8` | `compsci:4.9.4.8:12` — "What does the router change on an outgoing packet?" | `compsci:4.9.4.8:6` — "What does NAT do going out?" | Duplicate outgoing NAT card. |
| `compsci:4.9.4.9` | `compsci:4.9.4.9:16` — "Why must the server have a static IP address?" | `compsci:4.9.4.9:1` — "Why give a forwarded server a fixed IP?" | Duplicate static internal IP card. |
| `compsci:4.9.4.9` | `compsci:4.9.4.9:19` — "Which ports would be forwarded for HTTP and HTTPS?" | `compsci:4.9.4.9:10` — "Which port would a web server's rule use?" | Duplicate HTTP/HTTPS port forwarding card. |
| `compsci:4.9.4.10` | `compsci:4.9.4.10:6` — "Four advantages of JSON over XML?" | `compsci:4.9.4.10:12` — "Give three reasons for using JSON rather than XML." | Duplicate JSON vs XML comparison. |
| `compsci:4.9.4.10` | `q:compsci:4.9.4.10:6` — "JSON is preferred to XML because it is:" | `q:compsci:4.9.4.10:3` — "Compared with XML, JSON is" | Duplicate JSON vs XML MCQ (`oi` preserved). |
| `compsci:4.9.4.10` | `q:compsci:4.9.4.10:8` — "The WebSocket protocol provides:" | `q:compsci:4.9.4.10:1` — "A WebSocket is" | Duplicate WebSocket MCQ (`oi` preserved). |
| `compsci:4.9.4.11` | `compsci:4.9.4.11:13` — "What hardware does a thin-client system need?" | `compsci:4.9.4.11:6`, `:7`, `:8` — client/server/network hardware cards | Redundant summary duplicating individual cards 6–8. |
| `compsci:4.10.1` | `compsci:4.10.1:14` — "How is a many-to-many relationship implemented?" | `compsci:4.10.1:6` — "How is a many-to-many implemented?" | Exact duplicate linking-relation card. |
| `compsci:4.10.1` | `compsci:4.10.1:17` — "Entity descriptions: how are they written?" | `compsci:4.10.1:3` — "How is an entity description written?" | Exact duplicate notation card. |
| `compsci:4.10.1` | `q:compsci:4.10.1:10` — "Entity(Attr1, Attr2) with Attr1 underlined means Attr1 is:" | `q:compsci:4.10.1:4` — "In an entity description the identifier is" | Duplicate primary-key notation MCQ (`oi` preserved). |
| `compsci:4.10.3` | `compsci:4.10.3:16` — "State the conditions for 1NF, 2NF and 3NF." | `compsci:4.10.3:1`, `:2`, `:3` — individual 1NF/2NF/3NF cards | Redundant bundle duplicating individual normal-form cards. |
| `compsci:4.10.3` | `compsci:4.10.3:18` — "Give one advantage and one disadvantage of deliberately denormalising (storing CurrentZoo in Animal)." | `compsci:4.10.3:11` — "Denormalising: one gain, one cost?" | Duplicate concept & answer. |
| `compsci:4.10.4` | `compsci:4.10.4:18` — "What must every pair of tables in a FROM clause have?" | `compsci:4.10.4:7` — "How do you link two tables in an SQL query?" | Duplicate join-condition card. |
| `compsci:4.10.4` | `compsci:4.10.4:21` — "What does ORDER BY … DESC do?" | `compsci:4.10.4:10` — "How do you sort descending in SQL?" | Exact duplicate `ORDER BY … DESC` card. |
| `compsci:4.10.4` | `q:compsci:4.10.4:8` — "`CREATE TABLE Athlete (INTEGER AthleteID PRIMARY KEY …)` is wrong because:" | `q:compsci:4.10.4:3` — "In CREATE TABLE, \"VARCHAR(50) Surname\" is wrong because" | Duplicate type-before-column-name MCQ (`oi` preserved). |
| `compsci:4.10.5` | `q:compsci:4.10.5:7` — "Record locking places a lock on:" | `q:compsci:4.10.5:1` — "Record locks are set on" | Duplicate record-locking MCQ (`oi` preserved). |
| `compsci:4.10.5` | `q:compsci:4.10.5:10` — "A risk of record locking:" | `q:compsci:4.10.5:5` — "Deadlock is a risk of" | Duplicate deadlock MCQ (`oi` preserved). |
| `compsci:4.11.1` | `compsci:4.11.1:9` — "Graph schema: node, edge, property?" | `compsci:4.11.1:16` — "Describe the graph schema notation." | Duplicate notation card (kept fuller card). |
| `compsci:4.11.1` | `compsci:4.11.1:18` — "What is map-reduce?" | `compsci:4.11.1:6` — "How does MapReduce work?" | Duplicate MapReduce card. |
| `compsci:4.11.1` | `q:compsci:4.11.1:7` — "In a graph schema, a property such as 'Employees: 75' is drawn as:" | `q:compsci:4.11.1:1` — "In a graph schema, \"Cost: £1.50\" is drawn as" | Duplicate graph-schema property MCQ (`oi` preserved). |
| `compsci:4.11.1` | `q:compsci:4.11.1:9` — "Which functional feature makes distribution easy?" | `q:compsci:4.11.1:2` — "Which makes functional code safe to run on many servers?" | Duplicate immutability/statelessness MCQ (`oi` preserved). |
| `compsci:4.11.1` | `q:compsci:4.11.1:11` — "Video files, emails and web pages illustrate which characteristic?" | `q:compsci:4.11.1:4` — "Videos, emails and web pages in one dataset illustrate" | Duplicate Variety MCQ (`oi` preserved). |
| `compsci:4.12.1.1` | `compsci:4.12.1.1:3` — "Type of add(x, y) on integers?" | `compsci:4.12.1.1:15` — "How is a two-argument function's type written?" | Duplicate curried type signature card. |
| `compsci:4.12.1.2` | `compsci:4.12.1.2:4` — "Why are higher-order functions possible?" | `compsci:4.12.1.2:9` — "Why is first-class status essential for higher-order functions?" | Duplicate first-class prerequisite card. |
| `compsci:4.12.1.2` | `compsci:4.12.1.2:13` — "What other objects are first-class?" | `compsci:4.12.1.2:1` — "Name three first-class objects in most languages." | Duplicate first-class objects card. |
| `compsci:4.12.1.2` | `compsci:4.12.1.2:15` — "True or false: in a functional language every function is a first-class object?" | `compsci:4.12.1.2:2` — "Are functions first-class in a functional language?" | Duplicate first-class function card. |
| `compsci:4.12.1.2` | `q:compsci:4.12.1.2:5` — "`map square list` works because square is:" | `q:compsci:4.12.1.2:1` — "map square [1,3,5] uses square as" | Duplicate higher-order argument MCQ (`oi` preserved). |
| `compsci:4.12.1.5` | `compsci:4.12.1.5:8` — "Define function composition." | `compsci:4.12.1.5:0`, `:1` — "What is function composition?" / "What does (g ∘ f)(x) mean?" | Duplicate definition card. |
| `compsci:4.12.1.5` | `q:compsci:4.12.1.5:6` — "To compose f ∘ g, g's co-domain must match:" | `q:compsci:4.12.1.5:2` — "For g ∘ f to be valid" | Duplicate domain/co-domain alignment MCQ (`oi` preserved). |
| `compsci:4.12.3.1` | `compsci:4.12.3.1:0` — "Head of a list?" | `compsci:4.12.3.1:11` — "What does head return?" | Duplicate `head` definition card. |
| `compsci:4.12.3.1` | `compsci:4.12.3.1:19` — "What is the base case of most list recursions?" | `compsci:4.12.3.1:9` — "Two parts of every recursive list function?" | Covered directly by kept card 9. |
| `compsci:4.13.1.1` | `compsci:4.13.1.1:9` — "Name three methods of gathering requirements." | `compsci:4.13.1.1:2` — "Five ways to gather requirements?" | Covered by kept card 2. |
| `compsci:4.13.1.1` | `q:compsci:4.13.1.1:4` — "Interviewing users to discover what the system must do belongs to:" | `q:compsci:4.13.1.1:0` — "Which is analysis work?" | Duplicate analysis-stage MCQ (`oi` preserved). |
| `compsci:4.13.1.4` | `compsci:4.13.1.4:9` — "Name the three types of test data." | `compsci:4.13.1.4:1`, `:2`, `:3` — normal/boundary/erroneous cards | Covered individually by kept cards 1–3. |
| `compsci:4.13.1.5` | `compsci:4.13.1.5:9` — "Against what is a system evaluated?" | `compsci:4.13.1.5:0` — "What is a solution evaluated against?" | Exact duplicate criteria/objectives card. |
| `compsci:4.13.1.5` | `compsci:4.13.1.5:12` — "What is the difference between testing and evaluation?" | `compsci:4.13.1.5:3` — "How does evaluation differ from testing?" | Exact duplicate testing vs evaluation card. |

---

## Before / After Counts Summary

*(Finalised in Batch 8 alongside full `SMOKE_JOBS=3 npm test` release gate output.)*
