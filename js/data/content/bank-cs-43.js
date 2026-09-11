/* Kurenai OS — past-paper bank: AQA 7517 §4.3 Fundamentals of algorithms
   Modelled on A-level Paper 1 Section A, June 2017–2025. See bank-cs-41.js
   for the conventions. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.3.1.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Traversal traces — 2022, 2025" },
    "The 6-mark traversal question gives a recursive subroutine over an adjacency matrix and a `Visited` array, and awards marks per **column**: the Visited flags (set once and never changed), the **sequence of subroutine calls** (repeated consecutive instances ignored), the loop counter values and the final returned value. Follow-ups: *what does the subroutine do?* (2022: **determine whether the graph contains a cycle**) and *which traversal is it?* (**depth-first** — it recurses before finishing the neighbours). 2025 asked for the **base case** of a path-finding traversal: *the start and end nodes are the same* / *no unvisited node reachable from the start*.",
    { callout: { t: "memorise", body: "DFS uses a **stack** (or recursion) and goes as deep as possible before backtracking; BFS uses a **queue** and visits all neighbours of a node before moving outward — BFS finds the shortest path in an *unweighted* graph." }}
  ],
  flashcards: [
    ["Which data structure does depth-first search use?", "A stack — explicitly, or implicitly through recursion."],
    ["Which data structure does breadth-first search use?", "A queue of discovered-but-unvisited vertices."],
    ["Give a use of BFS that DFS cannot guarantee.", "Finding the shortest path (fewest edges) between two vertices in an unweighted graph."],
    ["Give two uses of DFS.", "Detecting cycles, checking whether a path exists, topological sorting, navigating a maze / backtracking."],
    ["How does a DFS avoid revisiting nodes?", "A Visited array/set — a node is marked when first reached and never processed again."],
    ["What is the base case of a recursive path-finding traversal?", "The current node is the target, or the node has no unvisited neighbours."],
    ["In a DFS, when does backtracking happen?", "When the current node has no unvisited neighbours — the recursion returns (the stack pops) to the previous node."],
    ["Why does a traversal need Visited flags in a graph but not in a tree?", "Graphs may contain cycles; without the flags the traversal would loop forever."]
  ],
  quiz: [
    { q: "A recursive routine that marks a node visited then immediately recurses into each unvisited neighbour is:", opts: ["breadth-first", "depth-first", "Dijkstra's", "bubble sort"], ans: 1, why: "Recursion before finishing the neighbour list = DFS." },
    { q: "BFS from A in the graph A–B, A–C, B–D, C–D visits in order (neighbours alphabetical):", opts: ["A B D C", "A B C D", "A C D B", "D C B A"], ans: 1, why: "Level by level: A, then its neighbours B and C, then D." },
    { q: "DFS from A in the same graph visits:", opts: ["A B C D", "A B D C", "A C B D", "A D B C"], ans: 1, why: "A → B → D (deepest first), then back out to C." },
    { q: "A DFS that returns TRUE when it reaches an already-visited node (not its parent) is detecting:", opts: ["a shortest path", "a cycle", "a leaf", "an isolated node"], ans: 1, why: "Revisiting means a loop exists." },
    { q: "Shortest path by edge count in an unweighted graph is found by:", opts: ["DFS", "BFS", "in-order traversal", "bubble sort"], ans: 1, why: "BFS reaches nodes in increasing distance." },
    { q: "The Visited array in a traversal trace should:", opts: ["reset each call", "have each flag set once and never changed", "be sorted", "count edges"], ans: 1, why: "The mark scheme awards this specifically." }
  ],
  exam: [
    { src: "AQA 2022 P1 Q4.5", ctx: "The recursive function `G(Node, Parent)` below is applied to an undirected graph stored as an adjacency matrix `Adj[0..3][0..3]`, with `Visited[0..3]` initially all FALSE. The graph has edges 0–1, 1–3 and 1–2.",
      code: { lang: "pseudo", src: "FUNCTION G(Node, Parent)\n   Visited[Node] ← TRUE\n   FOR N ← 0 TO 3\n      IF Adj[Node][N] = 1 AND N ≠ Parent THEN\n         IF Visited[N] = TRUE THEN RETURN TRUE\n         ELSE IF G(N, Node) = TRUE THEN RETURN TRUE ENDIF\n      ENDIF\n   ENDFOR\n   RETURN FALSE\nENDFUNCTION" },
      parts: [
        { q: "List, in order, the calls made when `G(0, −1)` is executed, and state the value returned.", marks: 3, ms: ["G(0, −1), then G(1, 0) (1)", "then G(2, 1) and G(3, 1) — the order follows N ascending (1)", "Returns FALSE (1)"] },
        { q: "State the purpose of the function.", marks: 1, ms: ["To determine whether the graph contains a cycle (1)"] },
        { q: "State which graph traversal the function performs, justifying your answer.", marks: 2, ms: ["Depth-first search (1)", "It recurses into a neighbour before considering the remaining neighbours / uses the call stack to backtrack (1)"] }
      ] },
    { src: "AQA 2025 P1 Q3.4", q: "A recursive subroutine `IsPath(Start, End)` returns TRUE if a route exists between two nodes of a graph. State the base case(s) of the recursion.", marks: 1,
      ms: ["Start and End are the same node (1)", "Accept: there are no unvisited nodes reachable from Start (1)", "Max 1"] },
    { src: "AQA 2019 P1 Q3", q: "Describe how a breadth-first search of a graph is carried out, and state one application for which it is more suitable than depth-first search.", marks: 4,
      ms: ["Start at the given node, mark it visited and add it to a queue (1)", "Repeatedly dequeue a node and add each of its unvisited neighbours to the queue, marking them visited (1)", "Continue until the queue is empty — nodes are visited in order of distance from the start (1)", "Application: finding the shortest path (fewest edges) in an unweighted graph, e.g. fewest hops in a network (1)"] }
  ]
});

X("compsci:4.3.2.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Traversals in the papers" },
    "Two forms: the 2-mark **output of an in-order traversal** (2021 — full marks for the whole sequence, max 1 for partially correct runs), and the 7-mark **trace of a stack-based traversal** (2021, 2024), marked per column: the stack contents, the pointer, the current node and the output order. 2024 also asked how to **reverse the output order**: swap the order in which the left and right children are pushed / visited.",
    { callout: { t: "memorise", h: "Which traversal for what", body: "**Pre-order** (node, L, R) copies a tree / prefix expressions. **In-order** (L, node, R) outputs a BST in ascending order / infix. **Post-order** (L, R, node) deletes a tree safely / evaluates postfix (RPN). The name says *where the node is visited relative to its children*." }}
  ],
  flashcards: [
    ["Define pre-order traversal.", "Visit the node, then traverse the left subtree, then the right subtree."],
    ["Define in-order traversal.", "Traverse the left subtree, visit the node, then traverse the right subtree."],
    ["Define post-order traversal.", "Traverse the left subtree, then the right subtree, then visit the node."],
    ["Which traversal outputs a BST in ascending order?", "In-order."],
    ["Which traversal produces Reverse Polish from an expression tree?", "Post-order."],
    ["Which traversal is used to copy a tree?", "Pre-order — the root is created before its children."],
    ["How do you reverse the output order of a traversal?", "Swap the order in which the left and right subtrees are processed (right before left)."],
    ["What does the stack hold during an iterative in-order traversal?", "The nodes whose right subtrees are still to be processed — the path back up the tree."]
  ],
  quiz: [
    { q: "Tree: root 8, left 3 (children 1, 6), right 10 (right child 14). In-order output is:", opts: ["8 3 1 6 10 14", "1 3 6 8 10 14", "1 6 3 14 10 8", "8 10 14 3 6 1"], ans: 1, why: "Left, node, right — ascending for a BST." },
    { q: "Pre-order of the same tree:", opts: ["8 3 1 6 10 14", "1 3 6 8 10 14", "1 6 3 14 10 8", "8 10 3"], ans: 0, why: "Node first, then left subtree, then right." },
    { q: "Post-order of the same tree:", opts: ["8 3 1 6 10 14", "1 3 6 8 10 14", "1 6 3 14 10 8", "14 10 8 6 1 3"], ans: 2, why: "Children before parent; root last." },
    { q: "Post-order of an expression tree yields:", opts: ["infix", "prefix", "postfix (RPN)", "binary"], ans: 2, why: "Operands before operator." },
    { q: "Deleting all nodes of a tree safely uses:", opts: ["pre-order", "in-order", "post-order", "BFS"], ans: 2, why: "Children are freed before their parent." },
    { q: "To output a BST in descending order, an in-order traversal should:", opts: ["visit right subtree first", "visit left subtree first", "skip the root", "use a queue"], ans: 0, why: "Right, node, left." }
  ],
  exam: [
    { src: "AQA 2021 P1 Q2.2", ctx: "A binary tree has root `M`; `M` has left child `E` and right child `T`; `E` has left child `B` and right child `H`; `T` has left child `P`.",
      parts: [
        { q: "State the output of an in-order traversal of the tree.", marks: 2, ms: ["B E H (1)", "M P T — full sequence B E H M P T (1)"] },
        { q: "State the output of a post-order traversal.", marks: 1, ms: ["B H E P T M (1)"] },
        { q: "Explain one change to the traversal algorithm that would output the in-order sequence in reverse.", marks: 1, ms: ["Traverse the right subtree before the left subtree (swap the order of the recursive calls) (1)"] }
      ] },
    { src: "AQA 2024 P1 Q6.2", ctx: "An iterative in-order traversal uses an array `S[0..3]` as a stack with pointer `Pos` (initially −1) and a variable `Current` starting at the root. While `Current` is not null OR the stack is not empty: if `Current` is not null, push it and move to its left child; otherwise pop a node, output it and move to its right child. The tree has root 5, left child 2 (with right child 4), right child 9.",
      parts: [
        { q: "Complete a trace showing the values of `Pos`, `S`, `Current` and the output.", marks: 5, ms: ["Push 5 (Pos 0), push 2 (Pos 1); Current becomes null (1)", "Pop 2 → output 2; Current ← 4; push 4 (Pos 1); Current null (1)", "Pop 4 → output 4; Current null; pop 5 → output 5 (1)", "Current ← 9; push 9 (Pos 0); pop 9 → output 9 (1)", "Output order 2 4 5 9 with Pos never exceeding 1 (1)"] },
        { q: "State the maximum stack depth reached, and describe a four-node tree for which the depth would be 4.", marks: 2, ms: ["Depth 2 (Pos = 1) (1)", "A tree in which every node has only a left child — a left-leaning chain (1)"] }
      ] },
    { src: "AQA 2018 P1 Q4", q: "An expression tree has root `×`, left child `+` (with children 3 and 4) and right child 2. State the output of a post-order traversal and explain what it represents.", marks: 2,
      ms: ["3 4 + 2 × (1)", "The expression in Reverse Polish / postfix form, ready to evaluate with a stack (1)"] }
  ]
});

X("compsci:4.3.3.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "RPN — 2018, 2021, 2024" },
    { table: { head: ["Item", "Tariff", "Mark-scheme points"], rows: [
      ["Convert infix → RPN", "1–2", "One mark for the high-precedence product appearing as `a b *` immediately, one for the operand order with the remaining operators placed correctly (e.g. `3 4 2 * + 1 −`); max 1 if any error"],
      ["Why RPN rather than infix", "2", "Simpler for a **machine** to evaluate (*easier to understand* is rejected) · no brackets needed · operators appear in the order of computation · no precedence rules · no backtracking"],
      ["Evaluate with a stack", "3–4", "Push operands; on an operator pop two, apply, push the result; the top of the stack at the end is the answer"],
      ["Name the notation", "1", "Reverse Polish Notation / postfix"]
    ]}},
    { callout: { t: "tip", body: "Converting: bracket the infix expression fully according to precedence, then move each operator to just after its right operand and drop the brackets. `(3 + (4 × 2)) − 1` → `3 4 2 × + 1 −`." }}
  ],
  flashcards: [
    ["Convert `5 − 3` to RPN.", "5 3 −"],
    ["Convert `3 + 4 × 2 − 1` to RPN.", "3 4 2 × + 1 −"],
    ["Convert `(7 + 2) × 3` to RPN.", "7 2 + 3 ×"],
    ["Convert `5 2 3 × + 4 +` back to infix.", "5 + 2 × 3 + 4 (= 15)."],
    ["Give two reasons RPN is used instead of infix.", "Simpler for a machine to evaluate; no brackets or precedence rules needed; operators appear in the order of computation."],
    ["Evaluate `4 6 + 2 /`.", "(4 + 6) / 2 = 5."],
    ["Why is RPN natural for a stack machine?", "Each operator applies to the two most recently pushed values — exactly what pop, pop, push provides."],
    ["What is another name for RPN?", "Postfix notation (operators after their operands); infix has them between, prefix before."]
  ],
  quiz: [
    { q: "`8 2 − 3 ×` evaluates to:", opts: ["2", "18", "−16", "6"], ans: 1, why: "(8 − 2) × 3 = 18." },
    { q: "Infix `2 × (3 + 4)` in RPN is:", opts: ["2 3 4 + ×", "2 3 × 4 +", "3 4 + 2 ×", "both A and C"], ans: 3, why: "Both are valid postfix forms of the same value; A follows the operand order." },
    { q: "Which is NOT an advantage of RPN?", opts: ["No brackets needed", "Easier for humans to read", "No precedence rules", "Simple stack evaluation"], ans: 1, why: "'Easier to understand' is explicitly rejected." },
    { q: "When an operator is met during evaluation you:", opts: ["push it", "pop two operands, apply, push the result", "pop one operand", "clear the stack"], ans: 1, why: "The three-step rule." },
    { q: "`1 2 3 + +` evaluates to:", opts: ["6", "5", "3", "an error"], ans: 0, why: "2 + 3 = 5; 1 + 5 = 6." },
    { q: "RPN for `a − b / c` is:", opts: ["a b − c /", "a b c / −", "a b c − /", "/ a b c"], ans: 1, why: "Division binds tighter: a (b c /) −." }
  ],
  exam: [
    { src: "AQA 2024 P1 Q5", ctx: "A compiler converts arithmetic expressions from the form in which programmers write them into a form that is evaluated with a stack.",
      parts: [
        { q: "State the name of the form of expression that is evaluated with a stack.", marks: 1, ms: ["Reverse Polish Notation / RPN / postfix (1)"] },
        { q: "Convert the infix expression `6 + 2 × 5 − 3` into this form.", marks: 2, ms: ["`2 5 ×` appears together (1)", "Correct operand order with + and − placed correctly: `6 2 5 × + 3 −` (1)", "Max 1 if any error"] },
        { q: "Explain two reasons why this form is used instead of infix.", marks: 2, ms: ["Simpler for a machine to evaluate / simpler algorithm to code (1)", "No brackets or operator precedence are needed — operators appear in the order in which they are applied / no backtracking (1)"] }
      ] },
    { src: "AQA 2018 P1 Q2.4", q: "Describe how a single stack is used to evaluate the Reverse Polish expression `4 5 2 × +`, stating the final result.", marks: 4,
      ms: ["Push 4, 5 and 2 onto the stack in order (1)", "On reaching × pop 2 and 5, multiply to give 10, push 10 (1)", "On reaching + pop 10 and 4, add to give 14, push 14 (1)", "At the end the top of the stack, 14, is the result (1)", "Max 3 if any error; 0 marks if not a LIFO description"] },
    { src: "AQA 2021 P1 Q5.1", q: "Convert the Reverse Polish expression `9 3 / 2 4 × −` into infix notation and evaluate it.", marks: 2,
      ms: ["9 / 3 − 2 × 4 (1)", "= 3 − 8 = −5 (1)"] }
  ]
});

X("compsci:4.3.4.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Linear search in the papers" },
    "Two one/two-markers keep returning: **time complexity** — `O(n)`, with the *understanding* mark for *as the list grows the (maximum) number of comparisons grows at the same rate* / *the loop repeats n times* / *in the worst case n comparisons are needed* (\"n comparisons are needed\" alone is NE); and the **advantage over binary search** (2025): **it works on an unsorted list**. AS 2022 gave a 5-mark trace of a linear search over `List[Z]`.",
    { callout: { t: "tip", body: "A trace of a search that uses a `Found` flag: show the flag column, the index column and the comparison result column separately — each is marked as a set of values in sequence, so a slip in one column need not cost the others." }}
  ],
  flashcards: [
    ["Describe linear search.", "Examine each item in turn from the first, comparing with the target, until it is found or the end of the list is reached."],
    ["Time complexity of linear search?", "O(n) — in the worst case every one of the n items is compared."],
    ["Advantage of linear search over binary search?", "It works on an unsorted list (and needs no random access)."],
    ["Best case for linear search?", "The target is the first item — one comparison, O(1)."],
    ["Average comparisons for a successful linear search of n items?", "About n/2."],
    ["How does a linear search report 'not found'?", "It reaches the end of the list without a match — typically a Found flag stays FALSE or the index equals the length."],
    ["When is linear search the better practical choice?", "Small lists, unsorted data, or when the data is searched only once so sorting would cost more than it saves."],
    ["Why does the loop condition need both 'not found' and 'index < length'?", "To stop early when the target is found, and to avoid running off the end when it is absent."]
  ],
  quiz: [
    { q: "Linear search on 1000 unsorted items, target absent, makes how many comparisons?", opts: ["1", "10", "500", "1000"], ans: 3, why: "Every item must be examined." },
    { q: "The time complexity of linear search is:", opts: ["O(1)", "O(log n)", "O(n)", "O(n²)"], ans: 2, why: "One loop of n iterations." },
    { q: "Doubling the list length does what to the worst-case time of linear search?", opts: ["Adds one comparison", "Doubles it", "Squares it", "No change"], ans: 1, why: "Linear growth." },
    { q: "A list is unsorted and searched once. Best approach?", opts: ["Sort then binary search", "Linear search", "Hash it first", "Binary search anyway"], ans: 1, why: "Sorting costs O(n log n) — more than one O(n) search." },
    { q: "'n comparisons are needed' scores nothing without:", opts: ["a diagram", "'in the worst case' / 'maximum'", "the value of n", "big-O"], ans: 1, why: "The scheme marks the bare claim NE." },
    { q: "A linear search finds the target at index 0. Comparisons made:", opts: ["0", "1", "n", "n/2"], ans: 1, why: "Best case — one comparison." }
  ],
  exam: [
    { src: "AQA 2025 P1 Q1.4", q: "State the time complexity of a linear search and explain what this means about the number of comparisons as the list grows.", marks: 2,
      ms: ["O(n) (1)", "As the list increases in size the maximum number of comparisons increases at the same rate / in the worst case n comparisons are needed (1)"] },
    { src: "AQA 2025 P1 Q1.6", q: "State one advantage of a linear search over a binary search.", marks: 1,
      ms: ["It can be used on an unsorted list (1)"] },
    { level: "AS", src: "AS 2022 P1 Q1", ctx: "The algorithm below searches `List[0..4] = [7, 3, 9, 3, 5]` for `Target = 3` and counts the matches.",
      code: { lang: "pseudo", src: "Count ← 0\nFOR Z ← 0 TO 4\n   IF List[Z] = Target THEN\n      Count ← Count + 1\n   ENDIF\nENDFOR\nOUTPUT Count" },
      parts: [
        { q: "Complete a trace table with columns `Z`, `List[Z]`, `List[Z] = Target` and `Count`.", marks: 4, ms: ["Z takes 0, 1, 2, 3, 4 (1)", "List[Z] column 7, 3, 9, 3, 5 (1)", "Comparison column FALSE, TRUE, FALSE, TRUE, FALSE (1)", "Count becomes 1 then 2; output 2 (1)"] },
        { q: "Explain why this algorithm cannot stop early when a match is found.", marks: 1, ms: ["It must count every occurrence, so all items have to be examined (1)"] }
      ] }
  ]
});

X("compsci:4.3.4.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Binary search — complexity every time" },
    "`O(log n)` for the knowledge mark, and for the understanding mark: **each comparison halves the size of the list still to be searched**; *if the list doubles, only one more comparison is needed*; *time increases as the list grows but by smaller and smaller amounts*. The precondition — the list must be **sorted** — is the flip side of the linear-search advantage question.",
    { callout: { t: "tip", body: "When tracing, write `Mid ← (Low + High) DIV 2` explicitly each step and show which bound moves. Examiners accept either `Low ← Mid + 1` or `High ← Mid − 1` conventions but not a bound that stays put." }}
  ],
  flashcards: [
    ["Describe binary search.", "Compare the target with the middle item of a sorted list; if equal, found; if smaller, repeat on the left half; if larger, on the right half; until found or the range is empty."],
    ["Time complexity of binary search?", "O(log n) — each comparison halves the remaining list."],
    ["Precondition for binary search?", "The list must be sorted (and allow direct access by index)."],
    ["Maximum comparisons for 1000 items?", "About 10 (2^10 = 1024)."],
    ["If the list doubles, how many more comparisons are needed in the worst case?", "One."],
    ["How is the middle index calculated?", "Mid ← (Low + High) DIV 2."],
    ["When does the search conclude 'not found'?", "When Low > High — the range is empty."],
    ["Why is binary search unsuitable for a linked list?", "It needs direct access to the middle item; a linked list must be traversed, losing the O(log n) benefit."]
  ],
  quiz: [
    { q: "Binary search on 64 sorted items needs at most how many comparisons?", opts: ["6", "7", "32", "64"], ans: 1, why: "⌈log₂64⌉ + 1 = 7 in the standard implementation (6 halvings then a final check)." },
    { q: "Searching [2, 5, 8, 12, 16, 23, 38] for 23: first Mid index (Low 0, High 6) is:", opts: ["2", "3", "4", "6"], ans: 1, why: "(0 + 6) DIV 2 = 3 → value 12." },
    { q: "After comparing 23 with 12, the bounds become:", opts: ["Low 0, High 2", "Low 4, High 6", "Low 3, High 6", "Low 4, High 5"], ans: 1, why: "23 > 12 so Low ← Mid + 1." },
    { q: "Binary search fails on an unsorted list because:", opts: ["it is too slow", "the halving decision relies on order", "Mid cannot be computed", "it needs a stack"], ans: 1, why: "'Smaller → left half' is only valid if sorted." },
    { q: "Time complexity of binary search:", opts: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], ans: 1, why: "Halving each step." },
    { q: "The search ends unsuccessfully when:", opts: ["Mid = 0", "Low > High", "High = n", "Low = Mid"], ans: 1, why: "Empty range." }
  ],
  exam: [
    { src: "AQA 2020 P1 Q3.7", q: "State the time complexity of a binary search and explain why it has this complexity.", marks: 2,
      ms: ["O(log n) (1)", "Each comparison halves the size of the list that still has to be searched / doubling the list adds only one comparison (1)"] },
    { src: "AQA 2025 P1 Q1.5", ctx: "A sorted array `A[0..7] = [4, 9, 15, 21, 28, 33, 40, 47]` is searched for the value 33 using a binary search with `Low = 0`, `High = 7` and `Mid = (Low + High) DIV 2`.",
      parts: [
        { q: "Show the values of `Low`, `High` and `Mid` at each step and state the number of comparisons made.", marks: 3, ms: ["Step 1: Low 0, High 7, Mid 3 (21) — 33 > 21 so Low ← 4 (1)", "Step 2: Low 4, High 7, Mid 5 (33) — found (1)", "2 comparisons (1)"] },
        { q: "State the maximum number of comparisons a binary search would need for an array of 8 items, and for an array of 16 items.", marks: 1, ms: ["4 and 5 (accept 3 and 4 if counting halvings only) (1)"] },
        { q: "Explain why a linear search might still be chosen for this array.", marks: 1, ms: ["The array is small, so the difference is negligible / linear search is simpler to implement and needs no sorted order (1)"] }
      ] },
    { src: "AQA 2017 P1 Q2", q: "Write pseudo-code for an iterative binary search of a sorted array `A[0..N−1]` for a value `Target`, returning the index if found or −1 otherwise.", marks: 5,
      ms: ["Low ← 0, High ← N − 1 initialised (1)", "Loop WHILE Low ≤ High (1)", "Mid ← (Low + High) DIV 2 and comparison A[Mid] = Target returns Mid (1)", "IF Target < A[Mid] THEN High ← Mid − 1 ELSE Low ← Mid + 1 (1)", "RETURN −1 after the loop (1)"] }
  ]
});

X("compsci:4.3.4.3", {
  flashcards: [
    ["Describe binary tree search.", "Start at the root; if the target equals the node's value, found; if smaller, move to the left child; if larger, to the right child; repeat until found or a null pointer is reached."],
    ["Time complexity of binary tree search?", "O(log₂ n) for a balanced tree — each comparison halves the part of the tree to look at."],
    ["Worst case for a binary tree search?", "An unbalanced (chain-like) tree degrades to O(n)."],
    ["How does binary tree search differ from binary search of an array?", "Same halving idea, but navigation is by child pointers rather than by index arithmetic."],
    ["What ends an unsuccessful search?", "Reaching a null child pointer (−1 / 0 in an array-of-records implementation)."],
    ["Why are BSTs good for data that changes often?", "Insert and delete are O(log n) without shifting other items, unlike a sorted array."],
    ["What must be true for the search to work?", "The tree must be a binary SEARCH tree: left subtree values smaller, right subtree values larger, at every node."],
    ["Which traversal finds all values in a range in a BST?", "In-order, pruning subtrees outside the range."]
  ],
  quiz: [
    { q: "Searching a BST with root 50 for 30 first moves to:", opts: ["the right child", "the left child", "a leaf", "the parent"], ans: 1, why: "30 < 50 → left." },
    { q: "Time complexity of searching a balanced BST:", opts: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], ans: 1, why: "Each step halves the remaining tree." },
    { q: "A BST built by inserting 1, 2, 3, 4, 5 in order gives search complexity:", opts: ["O(log n)", "O(n)", "O(1)", "O(n²)"], ans: 1, why: "A right-leaning chain — no halving." },
    { q: "The search stops unsuccessfully when:", opts: ["the root is null", "a null child pointer is reached", "the value is at a leaf", "after log n steps"], ans: 1, why: "No subtree left to search." },
    { q: "Compared with a sorted array, a BST makes insertion:", opts: ["slower", "O(log n) without shifting elements", "impossible", "O(1) always"], ans: 1, why: "Structural advantage." },
    { q: "'Every comparison halves the size of the tree to look at' explains:", opts: ["O(n)", "O(log n)", "O(n²)", "O(2ⁿ)"], ans: 1, why: "Halving ⇒ logarithmic." }
  ],
  exam: [
    { src: "AQA 2023 P1 Q3.3", q: "State the time complexity of searching a balanced binary search tree and explain why it has this complexity.", marks: 2,
      ms: ["O(log₂ n) (1)", "Every comparison halves the size of the binary tree that has to be looked at (1)"] },
    { src: "AQA 2023 P1 Q3.4", q: "Explain why the time complexity of a binary tree search can degrade to O(n).", marks: 2,
      ms: ["If the tree is unbalanced — e.g. items inserted in sorted order so every node has one child (1)", "The tree becomes a chain and the search examines every node, like a linear search (1)"] },
    { src: "AQA 2017 P1 Q4", ctx: "A binary search tree has root 40; 40 has children 22 and 61; 22 has children 9 and 30; 61 has right child 75.",
      parts: [
        { q: "List the nodes visited when searching for 30, and when searching for 70.", marks: 2, ms: ["40, 22, 30 (1)", "40, 61, 75 — then not found (1)"] },
        { q: "State the maximum number of comparisons needed to search this tree, and explain what would happen to this number if 5, 6, 7 and 8 were inserted in that order.", marks: 2, ms: ["3 (1)", "5 becomes the left child of 9, then 6, 7 and 8 each become the right child of the previous one — a chain that makes the tree unbalanced and raises the maximum to 7 comparisons (1)"] }
      ] }
  ]
});

X("compsci:4.3.5.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Bubble sort — 2017, 2019, 2021, 2025" },
    { table: { head: ["Item", "Points"], rows: [
      ["Show three passes (3 marks, one per row)", "After pass 1 the largest item is at the end; after pass k the last k items are in place; write the whole list after each pass"],
      ["Time complexity", "O(n²): each pass examines n items and there are (at most) n passes"],
      ["Reduce the number of comparisons (2019, 4 marks)", "**Swap flag**: set FALSE at the start of each pass, TRUE when a swap is made; the outer loop stops when a pass makes no swaps. **Shrinking inner loop**: reduce the upper limit by 1 after each pass (`N − Pass`), since the tail is already sorted"],
      ["Passes needed to guarantee sorted (2025)", "n − 1 passes for n items"]
    ]}},
    { callout: { t: "warn", body: "\"Bubble sort and merge sort are both polynomial\" (2025): the accepted reasoning is that as the list grows the increase in time is *reasonable* — neither is exponential. Do not claim bubble sort is efficient." }}
  ],
  flashcards: [
    ["Describe one pass of bubble sort.", "Compare each adjacent pair from the start; swap if out of order; the largest unsorted item 'bubbles' to the end."],
    ["Time complexity of bubble sort?", "O(n²) — up to n passes, each examining n items."],
    ["How many passes guarantee that n items are sorted?", "n − 1."],
    ["Describe the swap-flag optimisation.", "Reset a flag at the start of each pass; set it when a swap occurs; stop the outer loop when a whole pass makes no swap."],
    ["Describe the shrinking-range optimisation.", "After each pass the last item is in place, so reduce the inner loop's upper limit by one each pass."],
    ["Best case of bubble sort with the swap flag?", "An already sorted list — one pass, O(n)."],
    ["Why is bubble sort rarely used in practice?", "Quadratic time — for large n, merge sort (O(n log n)) is dramatically faster."],
    ["What is the state of [5, 1, 4, 2] after one pass?", "[1, 4, 2, 5]."]
  ],
  quiz: [
    { q: "After the first pass of bubble sort on [4, 2, 5, 1, 3] the list is:", opts: ["[2, 4, 1, 3, 5]", "[1, 2, 3, 4, 5]", "[4, 2, 5, 1, 3]", "[2, 4, 5, 1, 3]"], ans: 0, why: "5 bubbles to the end; the rest shift by adjacent swaps." },
    { q: "Bubble sort's time complexity is:", opts: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], ans: 2, why: "n passes × n comparisons." },
    { q: "The swap flag lets bubble sort:", opts: ["sort descending", "stop early when a pass makes no swaps", "skip the first item", "use less memory"], ans: 1, why: "No swaps ⇒ already sorted." },
    { q: "After pass k, which items are guaranteed in place?", opts: ["The first k", "The last k", "The middle k", "None"], ans: 1, why: "Each pass fixes the largest remaining item at the end." },
    { q: "Maximum passes needed for 8 items:", opts: ["8", "7", "4", "64"], ans: 1, why: "n − 1." },
    { q: "Compared with merge sort, bubble sort is:", opts: ["faster for large lists", "slower for large lists", "the same", "not a sort"], ans: 1, why: "O(n²) vs O(n log n)." }
  ],
  exam: [
    { src: "AQA 2021 P1 Q1", q: "Show the state of the list `[9, 4, 7, 1, 6]` after each of the first three passes of a bubble sort that sorts into ascending order.", marks: 3,
      ms: ["Pass 1: [4, 7, 1, 6, 9] (1)", "Pass 2: [4, 1, 6, 7, 9] (1)", "Pass 3: [1, 4, 6, 7, 9] (1)"] },
    { src: "AQA 2019 P1 Q1.1", ctx: "A programmer's bubble sort always makes `N − 1` passes and always compares `N − 1` adjacent pairs in every pass.",
      parts: [
        { q: "Describe two changes that would reduce the number of comparisons made without affecting the result.", marks: 4, ms: ["Use a flag variable that is reset to FALSE at the start of each pass and set to TRUE when a swap is made (1)", "Change the outer loop so it stops when a pass makes no swaps (1)", "After each pass reduce the upper limit of the inner loop by 1 (1)", "Because the last item of each pass is already in its final position (1)"] },
        { q: "State the time complexity of bubble sort and explain why it has this complexity.", marks: 2, ms: ["O(n²) (1)", "In each pass n items are examined and there are (at most) n passes (1)"] }
      ] },
    { src: "AQA 2025 P1 Q1.8", q: "State the number of passes a bubble sort without a swap flag must make to guarantee that a list of 12 items is sorted.", marks: 1,
      ms: ["11 (1)"] }
  ]
});

X("compsci:4.3.5.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Merge sort in the papers" },
    "**Name the sort** (AS 2019: a list repeatedly split in half and merged → *merge sort*), **time complexity table** (2022: merge sort `O(n log n)` — `O(log n)` is NE), and **describe/illustrate** the algorithm. A description gets marks for: *divide the list in half repeatedly until each sub-list has one item*; *merge pairs of sub-lists by repeatedly taking the smaller front item*; *repeat merging until one sorted list remains*.",
    { callout: { t: "memorise", body: "Why `O(n log n)`: there are log₂ n levels of splitting, and merging at every level touches all n items once." }}
  ],
  flashcards: [
    ["Describe merge sort.", "Split the list in half repeatedly until each sub-list has one item; then merge pairs of sub-lists into sorted lists by repeatedly taking the smaller front item, until one sorted list remains."],
    ["Time complexity of merge sort?", "O(n log n) — log n levels of splitting, n work per level to merge."],
    ["How are two sorted lists merged?", "Compare the front items, move the smaller to the output, repeat; when one list is exhausted append the rest of the other."],
    ["Why is merge sort called divide and conquer?", "It divides the problem into halves, solves each recursively and combines (conquers) the results."],
    ["Space cost of merge sort?", "O(n) extra memory for the merged lists (bubble sort is in place)."],
    ["Merge sort's best and worst cases?", "Both O(n log n) — the work is the same regardless of initial order."],
    ["How many levels of splitting for 16 items?", "4 (16 → 8 → 4 → 2 → 1)."],
    ["Which data structure suits merge sort well that bubble sort does not?", "Linked lists — merging by re-pointing nodes needs no random access."]
  ],
  quiz: [
    { q: "A sort that repeatedly halves the list then combines sorted halves is:", opts: ["bubble sort", "merge sort", "binary search", "linear search"], ans: 1, why: "Divide and conquer sort." },
    { q: "Merge sort's time complexity is:", opts: ["O(n²)", "O(n log n)", "O(log n)", "O(n)"], ans: 1, why: "log n levels × n per level." },
    { q: "Merging [2, 7, 9] with [1, 8]: the first three output items are:", opts: ["1, 2, 7", "2, 7, 9", "1, 8, 2", "2, 1, 7"], ans: 0, why: "Take the smaller front item each time." },
    { q: "Number of splitting levels for 32 items:", opts: ["4", "5", "16", "32"], ans: 1, why: "2^5 = 32." },
    { q: "A disadvantage of merge sort versus bubble sort:", opts: ["slower for large n", "needs extra memory for merging", "cannot sort strings", "unstable results"], ans: 1, why: "O(n) additional space." },
    { q: "Sorting 1 000 000 items, merge sort makes roughly how many times fewer operations than bubble sort?", opts: ["10", "1 000", "50 000", "1 000 000"], ans: 2, why: "n² / (n log₂ n) ≈ 10⁶ / 20 = 50 000." }
  ],
  exam: [
    { src: "AQA 2022 P1 Q1", q: "Complete the table giving the time complexity of each algorithm: binary tree search, bubble sort, linear search, merge sort.", marks: 3,
      ms: ["Binary tree search O(log n); bubble sort O(n²) (1)", "Linear search O(n) (1)", "Merge sort O(n log n) — O(log n) is not enough (1)"] },
    { src: "AQA 2020 P1 Q2", q: "Show how a merge sort would sort the list `[8, 3, 5, 1]`, and explain why merge sort is more efficient than bubble sort for large lists.", marks: 5,
      ms: ["Split: [8, 3] [5, 1] then [8] [3] [5] [1] (1)", "Merge pairs: [3, 8] and [1, 5] (1)", "Merge: [1, 3, 5, 8] (1)", "Merge sort is O(n log n) whereas bubble sort is O(n²) (1)", "So as n grows the number of operations for merge sort grows far more slowly (1)"] },
    { level: "AS", src: "AS 2019 P1 Q2.2", q: "A list of numbers is rearranged by repeatedly dividing it into halves until single items remain and then combining the halves in order. Name this algorithm.", marks: 1,
      ms: ["Merge sort (1)"] }
  ]
});

X("compsci:4.3.6.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Dijkstra — 2018, 2022, 2025" },
    "The 2018 trace (7 marks) was marked by column: the order of nodes taken from the queue (*A* column), the distance entries being set and then **not changing** once final, and the final **predecessor array P**. Follow-ups: *what the output represents* — **the shortest distance / time** between the two nodes (\"shortest route\" is rejected — that is what P gives); *purpose of P* — stores the previous node on the shortest path to each node so the **path can be recreated**. 2022 true/false: works on **directed and undirected**, **weighted and unweighted** graphs; cannot prove the halting problem.",
    { callout: { t: "memorise", h: "State the purpose (2025, 1 mark)", body: "*Find the shortest / lowest-cost path from one node to every other node (or between two nodes) in a graph.*" }},
    { callout: { t: "tip", body: "The 2017 heuristic question: a **heuristic** finds a solution that *might not be the best*, using knowledge of the domain to cut the search space — e.g. A* visiting cells nearer the goal first." }}
  ],
  flashcards: [
    ["State the purpose of Dijkstra's algorithm.", "To find the shortest (lowest-cost) path from a start node to every other node — or to a particular node — in a weighted graph."],
    ["What does the distance array hold at the end?", "The shortest distance from the start node to each node."],
    ["What is the predecessor array for?", "It stores the previous node on the shortest path to each node so the path itself can be recreated by working backwards."],
    ["Can Dijkstra's algorithm be used on directed graphs? Unweighted graphs?", "Yes to both (treat unweighted edges as weight 1)."],
    ["What restriction does Dijkstra's algorithm have?", "Edge weights must be non-negative."],
    ["Which node is processed next at each step?", "The unvisited node with the smallest current distance (a priority queue)."],
    ["What is a heuristic?", "A method of finding a solution that might not be the best, used to cut down the search space — e.g. A* preferring nodes nearer the goal."],
    ["How does Dijkstra relate to BFS?", "BFS is the special case where all edges have equal weight; Dijkstra uses a priority queue instead of a plain queue."]
  ],
  quiz: [
    { q: "The final distance array of Dijkstra's algorithm represents:", opts: ["the shortest route", "the shortest distance from the start to each node", "the number of edges", "the visiting order"], ans: 1, why: "'Shortest route' is what the predecessor array reconstructs." },
    { q: "Which node does Dijkstra process next?", opts: ["The most recently added", "The unvisited node with the smallest tentative distance", "A random node", "The one with most edges"], ans: 1, why: "Greedy choice via a priority queue." },
    { q: "Dijkstra's algorithm CANNOT be used when:", opts: ["the graph is directed", "edges have negative weights", "the graph is unweighted", "the graph is large"], ans: 1, why: "Negative weights break the greedy assumption." },
    { q: "A heuristic approach:", opts: ["always finds the optimum", "may not find the best solution but reduces the search", "is a data structure", "is exponential"], ans: 1, why: "The 2017 mark-scheme definition." },
    { q: "In a trace, a node's distance stops changing once:", opts: ["it is dequeued/visited", "the trace ends", "its predecessor is set", "it has two edges"], ans: 0, why: "Visited nodes have final distances." },
    { q: "True or false: Dijkstra's algorithm can be used to prove the halting problem cannot be solved.", opts: ["True", "False"], ans: 1, why: "Unrelated — the 2022 true/false row." }
  ],
  exam: [
    { src: "AQA 2018 P1 Q3.5", ctx: "A weighted, undirected graph has nodes 1–5 with edges 1–2 (4), 1–3 (1), 3–2 (2), 2–4 (5), 3–4 (8), 4–5 (3). Dijkstra's algorithm is run from node 1, using arrays `D` (distance, initially ∞ except D[1] = 0) and `P` (predecessor, initially −1).",
      parts: [
        { q: "State the order in which nodes are removed from the priority queue.", marks: 2, ms: ["1, 3, 2 (1)", "4, 5 (1)"] },
        { q: "Give the final contents of `D` and `P`.", marks: 3, ms: ["D = [0, 3, 1, 8, 11] (1)", "D[2] set to 4 then changed to 3 and not changed again (1)", "P = [−1, 3, 1, 2, 4] (1)"] },
        { q: "State what `D[5]` represents, and explain how `P` can be used to find the route from node 1 to node 5.", marks: 2, ms: ["The shortest distance / lowest cost from node 1 to node 5 (1)", "Follow P backwards from 5: 5 ← 4 ← 2 ← 3 ← 1, giving the path 1, 3, 2, 4, 5 (1)"] }
      ] },
    { src: "AQA 2022 P1 Q4.1", q: "State whether each statement about Dijkstra's algorithm is true or false: (i) it calculates the shortest path between a node and other nodes in a graph; (ii) it can be used to prove that the halting problem cannot be solved; (iii) it can be used with directed and undirected graphs; (iv) it can only be used with weighted graphs.", marks: 2,
      ms: ["(i) True, (ii) False (1)", "(iii) True, (iv) False (1)"] },
    { src: "AQA 2017 P1 Q5.4", q: "A route-finding program uses a heuristic approach rather than Dijkstra's algorithm. Explain what is meant by a heuristic approach and why it might be chosen.", marks: 2,
      ms: ["A heuristic employs a method of finding a solution that might not be the best (1)", "It uses knowledge of the domain to cut down the search space / consider fewer nodes / consider promising nodes first, so it is faster (1)"] }
  ]
});

})(KOS.content.extend);
