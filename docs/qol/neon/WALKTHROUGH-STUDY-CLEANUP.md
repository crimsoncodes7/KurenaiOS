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

---

## Before / After Counts Summary

*(Finalised in Batch 8 alongside full `SMOKE_JOBS=3 npm test` release gate output.)*
