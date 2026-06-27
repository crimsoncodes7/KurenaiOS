/* Kurenai OS — data/intel.js
   Examiner intel layer: exam-board-rewarded definitions, how-marks-are-won tips,
   and pitfalls that routinely lose marks. Keyed "subjectId:ref".
   Entries exist where there is genuinely useful intel; the reference view only
   renders this panel when an entry is present. */
window.KOS_DATA = window.KOS_DATA || {};
window.KOS_DATA.intel = {

/* ============ AQA Computer Science 7517 ============ */
"compsci:4.1.1.1": {
  defs: [["Data type", "Determines the set of values a variable can store, the operations that can be performed on it, and how it is stored in memory."],
         ["Record", "A composite type grouping related named fields that may be of different types under one identifier."],
         ["User-defined type", "A new type the programmer builds from existing built-in types, e.g. an enumerated type."]],
  tips: ["When asked to choose a data type, justify it against the data: 'real, because the value has a fractional part' earns the mark; naming the type alone often does not.",
         "Records vs arrays: state record = heterogeneous named fields, array = homogeneous indexed elements — the explicit contrast is the marking point."],
  pitfalls: ["Writing 'number' instead of integer/real — AQA wants the precise type.", "Forgetting pointer/reference stores a memory address, not the object itself.", "Treating a reference assignment as an independent copy — both names point at the same object."]
},
"compsci:4.1.1.2": {
  defs: [["Definite iteration", "A loop whose number of repetitions is known before it starts (e.g. a FOR loop)."],
         ["Indefinite iteration", "A loop that repeats until a condition is met; the repeat count is not known in advance (e.g. WHILE / REPEAT)."]],
  tips: ["For a 'why meaningful identifiers' mark, give a consequence — easier to maintain/debug, fewer errors — not just 'it looks tidy'.",
         "Pre-condition (WHILE) may run 0 times; post-condition (REPEAT/DO-WHILE) runs at least once — stating the minimum-runs difference is the marking point."],
  pitfalls: ["Claiming WHILE and DO-WHILE are interchangeable — they differ on whether the body can run zero times.", "Defining definite/indefinite by FOR-vs-WHILE syntax rather than by whether the repeat count is known in advance."]
},
"compsci:4.1.1.3": {
  defs: [["Integer division (DIV)", "The whole-number quotient of a division, discarding the remainder."],
         ["Modulo (MOD)", "The remainder left after integer division."]],
  tips: ["State the DIV/MOD identity A = (A DIV B)×B + (A MOD B) — it is a frequent marking point.",
         "Rounding goes to the nearest whole number; truncation discards the fraction — name which the question wants."],
  pitfalls: ["Assuming `/` always yields a real — in many languages `/` between two integers does integer division.", "Confusing truncation with rounding (3.7 truncates to 3, not 4)."]
},
"compsci:4.1.1.4": {
  defs: [["Relational operator", "An operator that compares two values and returns a Boolean (=, <>, <, >, <=, >=)."]],
  tips: ["Say the result of a relational comparison is a Boolean — that type statement often earns a mark.",
         "AQA pseudocode uses <> for not-equal; C#/Java use != — match the convention in the question."],
  pitfalls: ["Using = (assignment) where == (comparison) is meant in C#/Java.", "Forgetting that strings compare lexicographically, not by length."]
},
"compsci:4.1.1.5": {
  defs: [["XOR", "Exclusive OR — True when exactly one input is True (the inputs differ); False when they are the same."]],
  tips: ["A truth table with n inputs has 2^n rows — show every input combination for full marks.",
         "Operator precedence: NOT before AND before OR; brackets override it."],
  pitfalls: ["Treating XOR like OR — OR(1,1)=1 but XOR(1,1)=0.", "Dropping rows from a truth table or mis-ordering the input combinations."]
},
"compsci:4.1.1.6": {
  defs: [["Constant", "A named value fixed at design time that cannot change during execution."],
         ["Variable", "A named store whose value can change during execution."]],
  tips: ["For 'advantages of named constants' give distinct benefits — maintainability, readability, safety — not three wordings of one.",
         "Tie maintainability to a single-edit-updates-everywhere example, e.g. a VAT-rate change."],
  pitfalls: ["Saying constants 'save memory' — that is not their purpose; the benefit is safety/readability/maintainability.", "Leaving unexplained 'magic numbers' instead of naming them as constants."]
},
"compsci:4.1.1.7": {
  defs: [["Concatenation", "Joining two or more strings end-to-end to form a new string."],
         ["Substring", "A contiguous section of characters extracted from a string."]],
  tips: ["Check whether the question uses 0-based or 1-based indexing before answering POSITION/SUBSTRING.",
         "Name the conversion direction precisely: 'string to integer' vs 'integer to string'."],
  pitfalls: ["Thinking \"12\" + \"34\" = 46 — with string operands, + concatenates to \"1234\".", "Off-by-one errors from mixing 0-based and 1-based indexing."]
},
"compsci:4.1.1.8": {
  defs: [["Pseudo-random", "Numbers from a deterministic algorithm that appear random but eventually repeat."],
         ["Seed", "The starting value of a pseudo-random generator; the same seed reproduces the same sequence."]],
  tips: ["Justify a fixed seed by reproducibility for testing/debugging — that is the rewarded reason.",
         "For 'why unsuitable for encryption', say the sequence is predictable if the seed and algorithm are known."],
  pitfalls: ["Calling pseudo-random output 'truly random' — it is deterministic and periodic.", "Saying it repeats immediately — it repeats only after its (long) period."]
},
"compsci:4.1.1.9": {
  defs: [["Exception", "A runtime error that disrupts normal program flow (e.g. file not found, divide by zero)."]],
  tips: ["Roles: Try monitors, Catch handles, Finally always runs (cleanup) — note Finally runs whether or not an exception occurred.",
         "'Failing gracefully' = a clear message and safe recovery instead of a crash — use that phrase."],
  pitfalls: ["Claiming try/catch fixes logic or syntax errors — it only handles runtime exceptions.", "Treating exception handling as a substitute for input validation."]
},
"compsci:4.1.1.10": {
  defs: [["Subroutine", "A named, self-contained block of code that performs a specific task and can be called from other parts of the program."],
         ["Function", "A subroutine that returns a value to the calling code."]],
  tips: ["Advantages of subroutines: easier to test/debug in isolation, code reuse, easier to maintain, supports team programming — give two distinct ones, not two wordings of the same one."],
  pitfalls: ["Saying 'makes the program shorter' without explaining reuse — too vague for the mark."]
},
"compsci:4.1.1.11": {
  defs: [["Parameter", "The placeholder named in a subroutine's definition."],
         ["Argument", "The actual value supplied to the subroutine when it is called."]],
  tips: ["Distinguish pass by value (a copy; original unchanged) from pass by reference (the address; original IS changed) — state the effect on the original.",
         "A swap, or returning several values, needs pass by reference."],
  pitfalls: ["Swapping the terms parameter and argument.", "Assuming pass by reference is always better — pass by value is safer and the usual default."]
},
"compsci:4.1.1.12": {
  defs: [["Return value", "The value a function sends back to the caller; reaching return also exits the function immediately."]],
  tips: ["Say return does two things — passes a value AND exits the function immediately.", "To return several values, return a record/tuple/array."],
  pitfalls: ["Thinking multiple return statements send back multiple values — exactly one executes per call.", "Forgetting that every path of a non-void function must return a value."]
},
"compsci:4.1.1.13": {
  defs: [["Local variable", "A variable declared inside a subroutine; it exists only while the subroutine runs and is accessible only within it."]],
  tips: ["Give BOTH properties for the mark: limited lifetime (only during execution) AND limited scope (only inside the subroutine).",
         "'Why good practice' = avoids unintended side effects / name clashes, and supports reuse and isolated testing."],
  pitfalls: ["Confusing scope (where it is accessible) with lifetime (when it exists).", "Saying local variables persist between calls — they are recreated each call."]
},
"compsci:4.1.1.14": {
  defs: [["Global variable", "A variable declared outside all subroutines, accessible throughout the program for its whole run."]],
  tips: ["Contrast on scope AND lifetime: global = whole program / whole run; local = one subroutine / its execution only.",
         "For 'why prefer local', cite fewer side effects, easier debugging and reusability."],
  pitfalls: ["Claiming globals are simply 'better because accessible everywhere' — wide scope causes hidden coupling and bugs.", "Saying a local variable can be read elsewhere — it cannot."]
},
"compsci:4.1.1.15": {
  defs: [["Stack frame", "A region of the call stack holding a subroutine call's return address, parameters and local variables."]],
  tips: ["Trace questions: each call pushes a frame; each return pops one. Show the return address being used to resume execution — that phrase is often a marking point."],
  pitfalls: ["Mixing up the order frames are popped during recursion unwinding — it is strictly LIFO."]
},
"compsci:4.1.1.16": {
  defs: [["Recursion", "A technique where a subroutine is defined in terms of itself: it calls itself, and must have a base case that stops the recursion."]],
  tips: ["When tracing recursion, write the calls going down and the returns coming back up in a table — examiners award method marks for visible unwinding."],
  pitfalls: ["Omitting the base case in written recursive algorithms — instant lost mark and infinite recursion.", "Tracing only the descent and forgetting values computed on the way back up."]
},
"compsci:4.1.2.3": {
  defs: [["Encapsulation", "Combining data (attributes) and the methods that operate on them into a single unit (object), with data hidden from direct external access."],
         ["Inheritance", "A class (subclass) derives attributes and methods from another class (superclass), and may add or override them."],
         ["Polymorphism", "Objects of different classes respond to the same message/method call with behaviour appropriate to their class."],
         ["Instantiation", "Creating an object from a class."]],
  tips: ["Class diagram questions: arrow points FROM subclass TO superclass. 'is-a' = inheritance, 'has-a' = aggregation/composition.",
         "Learn the design principles by name: encapsulate what varies, favour composition over inheritance, program to interfaces, not implementation."],
  pitfalls: ["Defining polymorphism as 'many forms' with no reference to same method name, different behaviour — not creditworthy.", "Drawing aggregation diamonds at the wrong end (diamond sits on the container/whole)."]
},
"compsci:4.2.1.3": {
  defs: [["Text file", "A file storing human-readable characters (encoded as ASCII/Unicode), read/written line by line."],
         ["Binary file", "A file storing raw bytes in an internal format that is not human-readable as text."]],
  tips: ["Match access to file type: text for human-readable records/logs; binary for images, executables and exact numeric data.",
         "When describing reading, mention detecting end-of-file and closing the file afterwards."],
  pitfalls: ["Opening a binary file as text (or vice versa) — it corrupts/garbles the data.", "Forgetting to handle a file-not-found exception when opening (links to 4.1.1.9)."]
},
"compsci:4.2.7.1": {
  defs: [["Dictionary (associative array)", "An abstract data type of key-value pairs; a value is retrieved via its unique key."]],
  tips: ["Distinguish the dictionary (the ADT / interface) from the hash table (its usual implementation) — a frequent abstraction mark.",
         "Give a concrete use: mapping a unique ID/key to a record, or counting word frequencies."],
  pitfalls: ["Conflating the dictionary ADT with the hash table that implements it.", "Saying keys may repeat — keys are unique; only values may repeat."]
},
"compsci:4.2.8.1": {
  defs: [["Dot product", "u·v = Σ uᵢvᵢ — a single scalar; the result is zero exactly when the vectors are perpendicular."],
         ["Convex combination", "αu + βv with α, β ≥ 0 and α + β = 1 — a point on the line segment between u and v."]],
  tips: ["State that the dot product is a SCALAR and that u·v = 0 ⇔ perpendicular — the most-asked fact here.",
         "Know all three representations: list of numbers, function/dictionary (index ↦ value) and geometric arrow."],
  pitfalls: ["Writing the dot product as a vector instead of summing the products to one number.", "Forgetting that all entries must come from the same field (e.g. ℝ)."]
},
"compsci:4.2.1.1": {
  defs: [["Data structure", "A collection of data values, organised so they can be stored and operated on efficiently."],
         ["Static data structure", "Fixed size set at compile time; memory allocated once (e.g. array)."],
         ["Dynamic data structure", "Can grow and shrink at run time; memory allocated/freed from the heap (e.g. linked list)."]],
  tips: ["Compare static vs dynamic with paired points: memory efficiency vs risk of overflow; direct access vs traversal; no need to resize vs wasted allocation."],
  pitfalls: ["Saying arrays 'can't change values' — it is the SIZE that is fixed, not the contents."]
},
"compsci:4.2.2.1": {
  defs: [["Queue", "A First-In First-Out (FIFO) abstract data type: items are added at the rear and removed from the front."]],
  tips: ["Know all four variants by behaviour: linear, circular (pointers wrap with MOD), priority (items leave by priority then FIFO within priority), and why circular queues reuse freed space.",
         "State the pointer updates explicitly: rear := (rear + 1) MOD maxSize."],
  pitfalls: ["Forgetting the empty/full tests before enqueue/dequeue in written operations — these are usually a marking point each.", "In a linear queue, shuffling items forward on dequeue — standard model moves the front pointer instead."]
},
"compsci:4.2.3.1": {
  defs: [["Stack", "A Last-In First-Out (LIFO) abstract data type: items are added (pushed) and removed (popped) at the same end, the top."]],
  tips: ["Peek/top returns the top value WITHOUT removing it — say 'without removing' for the mark.",
         "Standard uses to quote: storing return addresses in subroutine calls, undo, reversing, evaluating RPN."],
  pitfalls: ["Pop on an empty stack / push on a full stack: always test first in written algorithms."]
},
"compsci:4.2.4.1": {
  defs: [["Graph", "A set of vertices (nodes) connected by edges (arcs); may be directed or undirected, weighted or unweighted."],
         ["Adjacency matrix", "A 2D array where cell (i, j) records the presence (or weight) of an edge from vertex i to vertex j."],
         ["Adjacency list", "For each vertex, a list of the vertices adjacent to it."]],
  tips: ["Matrix vs list comparison: matrix suits dense graphs and O(1) edge lookup; list suits sparse graphs and saves memory. Tie the choice to the graph in the question."],
  pitfalls: ["Filling only half an adjacency matrix for an undirected graph — it must be symmetric.", "Confusing 'graph' (may contain cycles) with 'tree' (connected, no cycles)."]
},
"compsci:4.2.5.1": {
  defs: [["Tree", "A connected, undirected graph with no cycles."],
         ["Rooted tree", "A tree with one vertex identified as the root; every other vertex hangs below it."],
         ["Binary tree", "A rooted tree in which each node has at most two children."]],
  tips: ["Common uses worth memorising: binary search trees for fast searching, syntax trees, expression evaluation."],
  pitfalls: ["When building a BST from a list, inserting in the wrong order — items must be inserted in the sequence given, comparing at each node."]
},
"compsci:4.2.6.1": {
  defs: [["Hash table", "A data structure that maps keys to locations by applying a hashing function to the key."],
         ["Collision", "Two different keys hashing to the same location."]],
  tips: ["Always describe a collision-handling strategy when asked how a hash table works: e.g. linear probing to the next free slot, or chaining with a linked list.",
         "Rehashing: applying the/an additional hash process to find a new position after a collision."],
  pitfalls: ["Claiming a hash function must give unique outputs — collisions are expected and handled, not impossible."]
},
"compsci:4.3.1.1": {
  tips: ["Depth-first uses a stack (or recursion); breadth-first uses a queue. That single sentence is frequently a whole mark.",
         "Applications to quote: DFS — navigating mazes, checking connectivity; BFS — shortest path on unweighted graphs."],
  pitfalls: ["Visiting neighbours in the wrong order in a trace — follow the order stated in the question (usually alphabetical/numerical) exactly."]
},
"compsci:4.3.2.1": {
  tips: ["Pre-order: mark on the LEFT of each node; in-order: UNDERNEATH; post-order: on the RIGHT — then read marks anticlockwise. Draw it on the diagram.",
         "Uses: in-order on a BST gives ascending order; post-order produces RPN; pre-order copies a tree."],
  pitfalls: ["Swapping in-order and pre-order under time pressure — write the L/N/R recipe (in-order = Left, Node, Right) before tracing."]
},
"compsci:4.3.3.1": {
  defs: [["Reverse Polish notation", "A postfix way of writing expressions where the operator follows its operands, needing no brackets and no precedence rules."]],
  tips: ["Evaluate RPN with a stack: operands push; an operator pops two, applies (second-popped OP first-popped), pushes the result. Show the stack at each step.",
         "Why RPN: no brackets needed, simpler for machine evaluation, suits stack-based evaluation."],
  pitfalls: ["Applying operands in the wrong order for - and /: the FIRST value popped is the right-hand operand."]
},
"compsci:4.3.4.2": {
  tips: ["Binary search preconditions: the list MUST be sorted. State it.",
         "Time complexity: linear O(n), binary O(log n), binary tree search O(log n) average. Quote in Big-O."],
  pitfalls: ["Off-by-one when updating low/high pointers in a trace: mid found, then low := mid + 1 or high := mid − 1, never mid itself."]
},
"compsci:4.3.4.1": {
  defs: [["Linear search", "Checking each element in turn from the start until the target is found or the list ends."]],
  tips: ["Complexity: O(n) worst case (checks all n); best case O(1) when the target is first.",
         "Linear search needs NO ordering — that is its advantage over binary search."],
  pitfalls: ["Confusing linear search's O(n) with binary search's O(log n).", "Claiming the list must be sorted — it need not be for linear search."]
},
"compsci:4.3.4.3": {
  defs: [["Binary search tree (BST)", "A binary tree where every left subtree holds smaller keys and every right subtree larger keys, enabling fast search."]],
  tips: ["At each node go left if target < node, right if target > node — halving the search space each step.",
         "Complexity is O(log n) for a balanced tree but O(n) if the tree degenerates into a list."],
  pitfalls: ["Assuming BST search is always O(log n) — an unbalanced tree degrades to O(n).", "Confusing binary tree search (on a BST) with binary search (on a sorted array)."]
},
"compsci:4.3.5.2": {
  defs: [["Merge sort", "A divide-and-conquer sort: recursively split the list in half, then merge the sorted halves back together."]],
  tips: ["Complexity is O(n log n) in ALL cases — say it is consistent, unlike bubble sort's O(n²) worst case.",
         "It is NOT in-place — it needs O(n) extra memory for merging; that trade-off earns marks."],
  pitfalls: ["Saying merge sort is in-place — it requires O(n) extra space.", "Forgetting the base case: a list of length ≤ 1 is already sorted."]
},
"compsci:4.3.5.1": {
  tips: ["Bubble sort: after pass k, the last k items are in final position. Use that to shorten traces.",
         "Complexities: bubble O(n²) time, O(1) extra space; merge O(n log n) time, O(n) extra space. Trade-off sentences earn marks."],
  pitfalls: ["In merge sort traces, merging unsplit halves — always show the full split down to single items before merging."]
},
"compsci:4.3.6.1": {
  tips: ["Dijkstra finds the shortest path from a start vertex to every other vertex in a weighted graph. Track: visited set, tentative distances, previous vertex — examiners credit the working table.",
         "Relate it to breadth-first search when asked (it is a weighted generalisation)."],
  pitfalls: ["Updating a distance without checking it is actually smaller than the current tentative value.", "Forgetting to record the previous vertex, then being unable to state the path."]
},
"compsci:4.4.1.1": {
  defs: [["Computational thinking", "Formulating a problem and expressing its solution as steps a computer can execute."]],
  tips: ["Name the four pillars: abstraction, decomposition, pattern recognition, algorithm design.", "Errors caught at analysis are cheapest to fix — later stages build on it."],
  pitfalls: ["Confusing analysis (defining WHAT) with implementation (writing code).", "Vague 'understand the problem' answers — cite requirements and a data model."]
},
"compsci:4.4.1.2": {
  defs: [["Algorithm", "A finite sequence of unambiguous steps that solves a problem and always terminates."]],
  tips: ["Stress that an algorithm must terminate — an infinite loop is not an algorithm.", "Use a trace table to show variable values step by step — examiners credit the working."],
  pitfalls: ["Omitting the termination requirement from the definition.", "Conflating correctness with efficiency — a correct algorithm can still be slow."]
},
"compsci:4.4.1.3": {
  defs: [["Abstraction", "Omitting unnecessary detail / hiding detail so a problem can be represented in a way that is easier to solve."],
         ["Information hiding", "Hiding design details behind a standard interface."]],
  tips: ["AQA distinguishes representational abstraction (removing detail until the problem is solvable) from abstraction by generalisation (grouping by common characteristics — 'is a kind of')."],
  pitfalls: ["Defining abstraction as 'simplifying' alone — you must mention removing/hiding detail."]
},
"compsci:4.4.1.4": {
  defs: [["Information hiding", "Concealing an object's internal details so it is used only through a clean public interface."]],
  tips: ["Link it to encapsulation: the interface stays stable while the hidden implementation can change.", "State the benefit — reduces complexity and stops external code depending on internals."],
  pitfalls: ["Confusing information hiding (hide internals behind an interface) with abstraction in general."]
},
"compsci:4.4.1.5": {
  defs: [["Procedural abstraction", "Capturing a task's logic as a general, parameterised procedure — you know WHAT it does, not the specific values."]],
  tips: ["Contrast with functional abstraction: procedural still exposes the method; functional hides it entirely.", "Parameters are what make the procedure general/reusable."],
  pitfalls: ["Confusing procedural abstraction with functional abstraction (which also hides the method)."]
},
"compsci:4.4.1.6": {
  defs: [["Functional abstraction", "Hiding the computational method entirely so only the input→output mapping matters (a black box)."]],
  tips: ["Say it goes one step beyond procedural abstraction by hiding HOW the result is computed.", "Use the black-box framing — you care only about the mapping."],
  pitfalls: ["Treating functional and procedural abstraction as identical — functional also hides the method."]
},
"compsci:4.4.1.7": {
  defs: [["Data abstraction", "Separating how a compound data type is USED (its operations) from how it is implemented/constructed."]],
  tips: ["Use an ADT example (stack/queue): you use push/pop without knowing the underlying array or list.", "Benefit: the implementation can change without affecting users of the type."],
  pitfalls: ["Describing only the data and missing the use-vs-implementation separation that defines it."]
},
"compsci:4.4.1.8": {
  defs: [["Problem abstraction/reduction", "Removing detail from a problem until it becomes one that is already solved (or solvable)."]],
  tips: ["The key idea is reducing to a previously-solved problem — say that explicitly.", "Example: model a routing task as a known shortest-path graph problem."],
  pitfalls: ["Confusing it with representational abstraction — this reduces the PROBLEM, not a data model."]
},
"compsci:4.4.1.9": {
  defs: [["Decomposition", "Breaking a problem into smaller sub-problems, each an identifiable task that may be subdivided further."]],
  tips: ["Pair it with composition (its inverse) when asked to contrast.", "Benefits: smaller parts are easier to design, test and divide among a team."],
  pitfalls: ["Confusing decomposition (break down) with abstraction (remove detail) — different processes."]
},
"compsci:4.4.1.10": {
  defs: [["Composition", "Building a larger system by combining smaller, existing procedures or data objects — the inverse of decomposition."]],
  tips: ["Define it explicitly as the inverse of decomposition for the mark.", "Relate it to 'favour composition over inheritance' in OOP design."],
  pitfalls: ["Mixing up composition (build up from parts) with decomposition (break down)."]
},
"compsci:4.4.1.11": {
  defs: [["Automation", "Putting an abstracted model into action — implementing and executing it to solve the problem."]],
  tips: ["Frame it as the culmination of abstraction + algorithm design — model, then execute.", "Example: a simulation model run as a program."],
  pitfalls: ["Treating automation as merely 'using a computer' rather than executing a devised model."]
},
"compsci:4.4.2.1": {
  defs: [["Finite state machine", "A machine that consists of a finite set of states, an input alphabet, transitions between states, a start state and (for an acceptor) a set of accepting states."]],
  tips: ["For 'what does this FSM accept' questions, test short strings systematically and describe the PATTERN (e.g. 'an even number of 1s'), not a list of examples.",
         "A Mealy machine produces output on transitions — label edges input/output."],
  pitfalls: ["Leaving a state without a transition for every input symbol when constructing a deterministic FSM.", "Confusing accepting state (double circle) with start state (incoming arrow)."]
},
"compsci:4.4.2.4": {
  defs: [["Regular language", "A language (set of strings) that can be described by a regular expression and recognised by a finite state machine."]],
  tips: ["Tie the trio together: regular expression ⇔ FSM ⇔ regular language all describe the same class.", "If a language must count/match (equal 0s then 1s, balanced brackets) it is NOT regular — it needs BNF."],
  pitfalls: ["Claiming every language is regular — recursive/nested structure is beyond regular languages.", "Confusing a regular language with a programming language."]
},
"compsci:4.4.2.2": {
  defs: [["Set", "An unordered collection of distinct elements."],
         ["Empty set", "The set with no elements, written {} or Ø."]],
  tips: ["Read set-builder notation: A = {x | x ∈ ℕ ∧ x ≥ 1} is 'x such that x is a natural number and x ≥ 1'.", "Recognise compact forms like {0ⁿ1ⁿ | n ≥ 1} — strings of n zeros followed by n ones."],
  pitfalls: ["Treating a set as ordered or allowing duplicates — elements are unique and unordered.", "Forgetting {} and Ø denote the same empty set."]
},
"compsci:4.4.2.3": {
  defs: [["Regular expression", "A shorthand notation describing a set of strings (a language) for matching and searching."]],
  tips: ["Know the operators: concatenation, | (alternation), * (zero or more), + (one or more), ? (optional).", "Be ready to convert between a regular expression and an equivalent FSM in BOTH directions."],
  pitfalls: ["Confusing * (zero or more) with + (one or more).", "Trying to write a regex for a non-regular language such as balanced brackets."]
},
"compsci:4.4.4.1": {
  defs: [["Time complexity", "How an algorithm's running time grows with the problem size n."],
         ["Space complexity", "How an algorithm's memory use grows with the problem size n."]],
  tips: ["Compare algorithms by how cost GROWS with n, not by absolute times on one machine.", "State whether you mean time or space efficiency — they can trade off against each other."],
  pitfalls: ["Judging efficiency by raw timings rather than growth with input size.", "Ignoring the space/time trade-off."]
},
"compsci:4.4.4.2": {
  defs: [["Function (mapping)", "A rule mapping each value of a domain to a value in a co-domain, e.g. ℕ → ℕ."]],
  tips: ["Recognise the growth families: linear (2x), polynomial (2x²), exponential (2ˣ), logarithmic (log x).", "Exponential grows fastest, logarithmic slowest — this ranking underlies Big-O."],
  pitfalls: ["Confusing a polynomial (x²) with an exponential (2ˣ) — variable in the base vs in the exponent.", "Mixing up the domain and co-domain of a mapping."]
},
"compsci:4.4.4.3": {
  defs: [["Big-O notation", "An expression of the worst-case growth rate of an algorithm's time/space as the input size grows."]],
  tips: ["Learn the order: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).", "Drop constants and lower-order terms: O(3n² + n) is O(n²)."],
  pitfalls: ["Keeping constant factors or low-order terms in a Big-O answer.", "Quoting best-case when Big-O conventionally describes the worst case."]
},
"compsci:4.4.4.4": {
  defs: [["Limits of computation", "Bounds on what can be computed, set by algorithmic complexity (intractable problems) and finite hardware (time/memory)."]],
  tips: ["Separate the two limits: complexity (some problems take infeasibly long) vs hardware (finite speed/memory).", "Link to intractable and non-computable problems as concrete examples of limits."],
  pitfalls: ["Assuming a faster computer removes the limit — intractable and non-computable problems remain beyond reach."]
},
"compsci:4.4.4.5": {
  defs: [["Tractable problem", "A problem with a polynomial-time (or better) solution — feasible as n grows."],
         ["Intractable problem", "A problem with no known polynomial-time solution — infeasible for large n, though still computable."]],
  tips: ["Tractable = polynomial or less; intractable = worse than polynomial (e.g. exponential).", "Intractable ≠ non-computable — a solution exists, it is just too slow for large inputs."],
  pitfalls: ["Confusing intractable (too slow) with non-computable (no algorithm exists).", "Calling a problem intractable for small n — it is about growth as n increases."]
},
"compsci:4.4.4.6": {
  defs: [["Non-computable problem", "A problem for which no algorithm can exist that solves it for all inputs (e.g. the Halting problem)."]],
  tips: ["Give the standard example — the Halting problem is non-computable.", "Distinguish non-computable (no algorithm possible) from intractable (algorithm exists but too slow)."],
  pitfalls: ["Saying a non-computable problem just needs more computing power — no algorithm can ever solve it.", "Conflating non-computable with intractable."]
},
"compsci:4.4.4.7": {
  defs: [["Halting problem", "The unsolvable problem of deciding, for any program and input, whether the program will eventually halt."]],
  tips: ["State that it is provably unsolvable (no proof needed) and is an example of a non-computable problem.", "Its significance: there are well-defined problems no algorithm can ever solve."],
  pitfalls: ["Claiming it can be solved by just running the program — an infinite run never confirms it will not halt.", "Saying no case can be decided — it is the GENERAL problem that is unsolvable."]
},
"compsci:4.4.5.1": {
  defs: [["Turing machine", "A theoretical model of computation: a finite set of states, a finite alphabet, an infinite tape and a read-write head following a transition function."]],
  tips: ["List the four components: states (transition diagram), alphabet, infinite tape, read-write head.", "It has a single fixed program; a universal Turing machine can simulate any other — the basis of computability."],
  pitfalls: ["Forgetting that the tape is INFINITE.", "Describing it as a real/physical computer rather than an abstract model."]
},
"compsci:4.4.3.1": {
  defs: [["Backus-Naur Form", "A notation for defining the syntax of a language using production rules, where each rule defines a non-terminal in terms of terminals and non-terminals."]],
  tips: ["BNF can express recursion (a rule defined in terms of itself), which is exactly what regular expressions cannot do — that contrast is a classic question.",
         "Check a string against the rules by deriving it step by step; show each substitution."],
  pitfalls: ["Writing | inside angle brackets or forgetting ::= — syntax slips cost marks in 'write a rule' questions."]
},
"compsci:4.5.1.1": {
  defs: [["Rational number", "A number expressible as p/q where p, q are integers and q ≠ 0."],
         ["Irrational number", "A number that cannot be written as a fraction; its decimal expansion is infinite and non-repeating."]],
  tips: ["Know the nesting ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ and which set an example sits in.", "Recurring decimals ARE rational (e.g. 0.333… = 1/3)."],
  pitfalls: ["Calling every decimal irrational — terminating/recurring decimals are rational.", "Forgetting that natural numbers exclude negatives."]
},
"compsci:4.5.1.2": {
  defs: [["Integer (ℤ)", "All whole numbers — positive, negative and zero."]],
  tips: ["In computing, integers have a fixed bit width, hence a finite range (overflow beyond it).", "Use integers for discrete signed quantities (temperatures, balances)."],
  pitfalls: ["Assuming integers are unbounded — a type has a max/min and can overflow.", "Storing a fractional value in an integer (it truncates)."]
},
"compsci:4.5.1.3": {
  defs: [["Rational number (ℚ)", "A number expressible as p/q with integers p, q and q ≠ 0."]],
  tips: ["Every integer is rational (n/1); recurring and terminating decimals are rational.", "To prove a value is rational, give the fraction."],
  pitfalls: ["Saying integers are not rational.", "Treating a recurring decimal as irrational."]
},
"compsci:4.5.1.4": {
  defs: [["Irrational number", "Cannot be written as p/q; an infinite, non-repeating decimal (e.g. π, √2, e)."]],
  tips: ["√ of a non-perfect-square is irrational; √ of a perfect square is rational.", "Computers store irrationals only as finite approximations, causing rounding error."],
  pitfalls: ["Calling √9 irrational (it is 3).", "Thinking 22/7 equals π — it is a rational approximation."]
},
"compsci:4.5.1.5": {
  defs: [["Real number (ℝ)", "Every value on the continuous number line — rationals plus irrationals."]],
  tips: ["Use reals (floating point) for continuous / measured quantities.", "Computers approximate reals (mantissa × base^exp); not all are exact."],
  pitfalls: ["Assuming computers store all reals exactly.", "Comparing two floats with == instead of a tolerance."]
},
"compsci:4.5.1.6": {
  defs: [["Ordinal number", "Describes position/rank in a sequence (1st, 2nd); a cardinal describes quantity."]],
  tips: ["Array indices are ordinal and usually 0-based — the 1st element is index 0.", "Distinguish ordinal (position) from cardinal (count) explicitly."],
  pitfalls: ["Off-by-one: the nth element is index n−1 in a 0-indexed array.", "Confusing ordinal with cardinal."]
},
"compsci:4.5.1.7": {
  defs: [["Counting", "Discrete whole quantities → integer types."],
         ["Measuring", "Continuous quantities → real (floating-point) types."]],
  tips: ["Test: 'how many?' (whole → integer) vs 'how much?' (continuous → real).", "Pick the data type from whether the quantity is discrete or continuous."],
  pitfalls: ["Storing a measurement in an integer (loses the fraction).", "Using a float for an exact count (rounding/comparison issues)."]
},
"compsci:4.5.2.1": {
  defs: [["Hexadecimal", "Base-16 (digits 0-9, A-F); one hex digit = 4 bits (a nibble)."]],
  tips: ["Convert binary↔hex in nibbles — 4 bits per hex digit; 0xFF = 255.", "A value's representation changes between bases, but the value itself does not."],
  pitfalls: ["Saying hex is 'easier for computers' — computers use binary; hex is for humans.", "Mis-grouping nibbles (group from the right, pad on the left)."]
},
"compsci:4.5.3.1": {
  defs: [["Byte", "8 bits — 2^8 = 256 possible values."],
         ["Nibble", "4 bits (one hex digit)."]],
  tips: ["n bits → 2^n distinct values; quote the power of two.", "Word size = the bits the CPU processes at once (e.g. 64-bit)."],
  pitfalls: ["Confusing bit (b) and byte (B) — 1 byte = 8 bits.", "Saying n bits give 2^n − 1 values (that is the max unsigned VALUE, not the count)."]
},
"compsci:4.5.3.2": {
  defs: [["Kibibyte (KiB)", "2^10 = 1024 bytes (binary / IEC)."],
         ["Kilobyte (kB)", "10^3 = 1000 bytes (decimal / SI)."]],
  tips: ["Binary prefixes (KiB/MiB/GiB) step by 1024; SI (kB/MB/GB) by 1000.", "Drive makers use SI; OSes report binary, hence the apparent 'missing' capacity."],
  pitfalls: ["Treating kB and KiB as identical.", "Using 1000 where 1024 is required (or vice versa)."]
},
"compsci:4.5.4.1": {
  defs: [["Unsigned binary", "Represents non-negative integers only; n bits give the range 0 to 2^n − 1."]],
  tips: ["8-bit unsigned range is 0–255; column values are 128, 64, … , 1.", "Max value = 2^n − 1, not 2^n."],
  pitfalls: ["Saying 8-bit unsigned reaches 256 (the max is 255).", "Trying to store a negative value in unsigned binary."]
},
"compsci:4.5.4.2": {
  defs: [["Overflow", "A result needing more bits than available — a carry out of the most significant bit (unsigned)."]],
  tips: ["Binary addition: 1+1 = 10 (carry); 1+1+1 = 11.", "Detect unsigned overflow by a carry out of the MSB."],
  pitfalls: ["Carrying at 10 (decimal) instead of at 2 (binary).", "Ignoring the final carry / overflow."]
},
"compsci:4.5.4.3": {
  defs: [["Two's complement", "The standard signed representation; negate by inverting all bits and adding 1."]],
  tips: ["n-bit range is −2^(n-1) to 2^(n-1) − 1 (8-bit: −128 to 127); the MSB has weight −2^(n-1).", "Subtraction = add the two's complement of the subtrahend."],
  pitfalls: ["Confusing two's complement with sign-and-magnitude (−1 is 11111111, not 10000001).", "Forgetting the +1 step when negating."]
},
"compsci:4.5.4.4": {
  tips: ["Fixed point: the point is in a fixed position; fast but limited range/precision. Floating point: mantissa + exponent, both two's complement in AQA's simplified form.",
         "Normalised form: mantissa begins 01... (positive) or 10... (negative) — quote this test verbatim.",
         "Show every step of conversions: sign, place values, exponent shift."],
  pitfalls: ["Normalising by moving the point the wrong way and forgetting to adjust the exponent in the opposite sense.", "Rounding errors: state that some values cannot be represented exactly, causing rounding/cancellation errors — wording matters."]
},
"compsci:4.5.4.5": {
  defs: [["Rounding error", "The small difference left when a value that is not an exact binary fraction is truncated to the available bits."]],
  tips: ["A value is exact only if it is a sum of power-of-two fractions (0.5, 0.25, 0.75 ...).", "Fractions like 0.1, 0.2 and 1/3 recur in binary and must be rounded — fixed AND floating point are affected."],
  pitfalls: ["Assuming 0.1 + 0.2 == 0.3 in floating point.", "Thinking only floating point rounds — fixed point does too."]
},
"compsci:4.5.4.6": {
  defs: [["Absolute error", "|actual - stored value| — the raw size of the difference."],
         ["Relative error", "absolute error / |actual value| — the error as a proportion of the true value."]],
  tips: ["Relative error compares fairly across magnitudes; absolute error alone can mislead.", "For numbers near 1, absolute and relative error are almost equal."],
  pitfalls: ["Assuming a small absolute error means an accurate result — check the relative error.", "Giving relative error units (it is a dimensionless ratio)."]
},
"compsci:4.5.4.7": {
  defs: [["Precision", "Number of significant figures, set by the mantissa length."],
         ["Range", "How large or small a value can be, set by the exponent length."]],
  tips: ["Fixed total bits: more mantissa = more precision but less range (and vice versa).", "More exponent bits widen RANGE, not precision; fixed point is faster to process than floating point."],
  pitfalls: ["Saying more exponent bits improve accuracy.", "Confusing range with precision."]
},
"compsci:4.5.4.8": {
  defs: [["Normalisation", "Shifting the mantissa to remove redundant leading bits, maximising precision and giving a unique representation."]],
  tips: ["Positive normalised mantissa begins 0.1; negative begins 1.0.", "Each left shift decrements the exponent, so the value is unchanged."],
  pitfalls: ["Thinking normalisation changes the value.", "Leaving 0.0 / 1.1 leading bits (not normalised)."]
},
"compsci:4.5.4.9": {
  defs: [["Overflow", "Result too large — the exponent exceeds its maximum."],
         ["Underflow", "Result too small / near zero — the exponent falls below its minimum."]],
  tips: ["Both concern the EXPONENT's range, not the mantissa.", "Overflow from multiplying large values; underflow from dividing a small value by a large one."],
  pitfalls: ["Saying overflow is about the mantissa.", "Confusing overflow (too big) with underflow (too small)."]
},
"compsci:4.5.5.2": {
  defs: [["ASCII", "A 7-bit character set (128 characters), mainly English/Latin."],
         ["Unicode", "A character set covering all world scripts and emoji (UTF-8/16); UTF-8 is ASCII-compatible."]],
  tips: ["Key codes: '0' = 48, 'A' = 65, 'a' = 97; lowercase = uppercase + 32.", "Unicode was introduced for global text ASCII cannot represent; UTF-8 uses 1 byte for ASCII characters."],
  pitfalls: ["Claiming ASCII covers all languages.", "Saying Unicode always uses more space — UTF-8 matches ASCII for ASCII text."]
},
"compsci:4.5.5.1": {
  defs: [["Character code of a digit", "The character-set code for a digit symbol, e.g. '5' = ASCII 53 — different from the pure binary value 5 (00000101)."]],
  tips: ["Digit character code = 48 + digit; recover the value with code - 48.", "Keyboard/text input arrives as characters, so convert before arithmetic."],
  pitfalls: ["Thinking the character '0' is binary 0 (it is 48).", "Adding digit characters directly: '2' + '3' = 50 + 51 = 101, not 5."]
},
"compsci:4.5.5.3": {
  defs: [["Checksum", "A value computed from a data block, recalculated by the receiver to detect errors."],
         ["Check digit", "A derived digit appended to a number to catch human entry errors (e.g. ISBN)."]],
  tips: ["Parity detects a single bit; majority voting/Hamming can correct; CRC robustly detects bursts.", "Match the method to whether detection or correction is needed."],
  pitfalls: ["Saying a checksum detects all errors (some cancel out).", "Confusing detection with correction."]
},
"compsci:4.5.6.4": {
  defs: [["Resolution", "Pixel dimensions (width x height); also dots per inch."],
         ["Colour depth", "Bits per pixel; n bits gives 2^n available colours."]],
  tips: ["Image size (bits) = width x height x colour depth; divide by 8 for bytes.", "Metadata (width, height, colour depth) sits in the header and is excluded from the pixel-size calculation."],
  pitfalls: ["Treating resolution and colour depth as the same thing.", "Forgetting to divide by 8 when converting bits to bytes."]
},
"compsci:4.5.6.1": {
  defs: [["Bit pattern", "A sequence of binary digits whose meaning depends on how software interprets it."]],
  tips: ["The same bits can be a number, character, pixel or sample — the data type/format decides.", "Images = pixel grids or vector objects; sound = amplitude samples; text = character codes."],
  pitfalls: ["Saying a file 'contains' a picture rather than bit patterns plus a format.", "Assuming a bit pattern has one fixed meaning."]
},
"compsci:4.5.6.2": {
  defs: [["Analogue", "Continuous data/signal — any value in a range."],
         ["Digital", "Discrete data/signal — a finite set of values, stored in binary."]],
  tips: ["The distinction applies to both data and signals.", "Computers are digital because discrete levels resist noise and copy without loss."],
  pitfalls: ["Claiming digital is always higher fidelity — it only approximates the analogue source.", "Confusing analogue/digital data with the signal that carries it."]
},
"compsci:4.5.6.3": {
  defs: [["ADC", "Analogue-to-Digital Converter — samples then quantises a signal (recording); used with analogue sensors."],
         ["DAC", "Digital-to-Analogue Converter — recreates the analogue signal (playback); commonly for digital audio."]],
  tips: ["Sample rate = samples per second; sample resolution = bits per sample.", "Nyquist: sample rate must be at least 2x the highest frequency to avoid aliasing."],
  pitfalls: ["Mixing up ADC (record) and DAC (playback).", "Sampling below the Nyquist rate, causing aliasing."]
},
"compsci:4.5.6.5": {
  defs: [["Vector graphic", "An image stored as mathematical shape descriptions (coordinates, properties), not pixels."]],
  tips: ["Vectors scale with no quality loss, ideal for logos/diagrams; SVG is XML-based.", "Each object's properties are stored as a list."],
  pitfalls: ["Saying vectors are always smaller — complex/photographic images can be larger.", "Using vectors for photographs."]
},
"compsci:4.5.6.7": {
  defs: [["Sample rate", "Samples taken per second (Hz)."],
         ["Sample resolution", "Bits per sample — sets amplitude precision/dynamic range."]],
  tips: ["Sound sample size (bits) = sample rate x resolution x duration x channels.", "Nyquist: sample at 2x the highest frequency; convert bits to bytes only at the end."],
  pitfalls: ["Mixing bits and bytes mid-calculation — the most common lost mark in representation arithmetic.", "Sampling at exactly (not twice) the highest frequency."]
},
"compsci:4.5.6.8": {
  defs: [["MIDI", "Musical event instructions (note, velocity, timing) — no waveform data."]],
  tips: ["MIDI is small and editable but sounds different per synthesizer; sampled audio is consistent.", "Use MIDI for composition; sampled audio for realistic recordings such as vocals."],
  pitfalls: ["Calling MIDI a compressed audio file.", "Saying MIDI sounds identical on all devices."]
},
"compsci:4.5.6.9": {
  defs: [["Lossy compression", "Permanently discards data for smaller files (JPEG, MP3); the original cannot be recovered."],
         ["Lossless compression", "Reduces size with no data loss (PNG, ZIP); the original is fully recoverable."]],
  tips: ["RLE stores (count, value) runs; dictionary coding stores tokens for repeated patterns — both lossless.", "Use lossless for text/code; lossy where small loss is imperceptible (media)."],
  pitfalls: ["Saying lossless always beats lossy on size (lossy compresses far more).", "Using lossy for text or executables."]
},
"compsci:4.5.6.10": {
  defs: [["Vernam cipher", "Plaintext XOR a truly-random one-time key at least as long as the message — perfectly secure."],
         ["Computational security", "Breakable in theory but infeasibly slow to break (AES/RSA)."]],
  tips: ["The Vernam key must be truly random, ≥ message length, and used only once.", "XOR is reversible: ciphertext XOR key = plaintext."],
  pitfalls: ["Calling AES/RSA 'perfectly secure' — only the one-time pad is.", "Reusing the Vernam key or using a pseudorandom one."]
},
"compsci:4.5.6.6": {
  tips: ["Compare on storage (pixels vs objects), scaling (pixelates vs re-rendered), file size and best use (photos vs logos).", "Bitmap = resolution-dependent; vector = resolution-independent."],
  pitfalls: ["Saying vectors are always smaller/better — only for geometric art.", "Forgetting to link each property to an appropriate USE for the marks."]
},
"compsci:4.6.1.1": {
  defs: [["Hardware", "The physical components of a computer system."],
         ["Software", "The programs and data (instructions) that run on the hardware."]],
  tips: ["For 'relationship' marks, say hardware executes what software instructs — each is useless without the other.", "Name the layering: hardware → operating system → applications."],
  pitfalls: ["Calling firmware 'hardware' — it is software stored on a chip.", "Vague 'software runs on hardware' with no interdependence explained."]
},
"compsci:4.6.1.2": {
  defs: [["System software", "Software that controls the hardware and provides a platform for applications (OS, utilities, drivers, translators)."],
         ["Application software", "Software that performs specific tasks for the end user."]],
  tips: ["Classify by purpose: manages the machine = system; does a user task = application.", "Justify a classification by what the software DOES, not just by naming the category."],
  pitfalls: ["Calling drivers or translators application software.", "Listing examples without stating the defining distinction."]
},
"compsci:4.6.1.3": {
  defs: [["Utility program", "System software that maintains/optimises the computer (e.g. defragmenter, antivirus, backup, compression)."],
         ["Library", "A collection of pre-written, tested, reusable code that programs can call."]],
  tips: ["The four system-software categories: OS, utilities, libraries, translators — name them.", "Describe a utility by its FUNCTION (what it does), not just its name."],
  pitfalls: ["Confusing a library (reusable code) with a utility (maintenance tool).", "Listing OS features when asked about utilities."]
},
"compsci:4.6.1.4": {
  defs: [["Operating system", "System software that manages hardware resources and hides hardware complexity behind a consistent interface."],
         ["Resource management", "Allocating the processor, memory and I/O devices among competing processes."]],
  tips: ["List the resources managed: processor, memory, I/O (plus files).", "'Hides complexity' = provides abstraction so apps don't touch raw hardware."],
  pitfalls: ["Saying the OS 'runs the programs' without mentioning resource allocation/scheduling.", "Confusing memory management with file management."]
},
"compsci:4.6.3.1": {
  defs: [["Compiler", "Translates an entire high-level program into machine code before execution."],
         ["Interpreter", "Translates and executes high-level code one statement at a time at runtime."],
         ["Bytecode", "A platform-independent intermediate code executed by a virtual machine."]],
  tips: ["Compiler = whole program, fast standalone exe; interpreter = line-by-line, portable, easy debugging.", "Bytecode's point is portability via a VM — 'write once, run anywhere'."],
  pitfalls: ["Saying an interpreter produces an executable (it does not).", "Confusing an assembler (assembly→machine) with a compiler (high-level→machine)."]
},
"compsci:4.6.2.1": {
  tips: ["Boolean simplification: quote the identity used at every line (De Morgan's, distribution, absorption X + X·Y = X). Unjustified jumps lose method marks.",
         "Karnaugh-style spotting: A + NOT A = 1 and X·X = X collapse most exam expressions."],
  pitfalls: ["Applying De Morgan's and forgetting to flip BOTH the operator and the negations of each term."]
},
"compsci:4.6.4.1": {
  defs: [["D-type flip flop", "A clocked storage element that captures the value on its D input at a clock edge and holds it on output Q."],
         ["Half adder", "A circuit adding two bits, producing sum and carry."],
         ["Full adder", "A circuit adding two bits plus a carry-in, producing sum and carry-out; full adders cascade to add words."]],
  tips: ["Half adder gates: sum = XOR, carry = AND. Be able to draw it from memory."],
  pitfalls: []
},
"compsci:4.7.1.1": {
  defs: [["Address bus", "Unidirectional bus carrying the memory address the CPU wants to access; its width sets the maximum addressable memory."],
         ["Data bus", "Bidirectional bus carrying data/instructions between CPU and memory."],
         ["Control bus", "Carries control and timing signals (read/write, clock, interrupt)."]],
  tips: ["Address-bus width → addressable memory (2^width locations); data-bus width → bytes moved at once.", "The address bus is one-way (CPU→memory); the data bus is two-way."],
  pitfalls: ["Saying the data bus carries addresses.", "Confusing which bus is unidirectional vs bidirectional."]
},
"compsci:4.7.2.1": {
  defs: [["Stored program concept", "Instructions (and data) are held in main memory and fetched, then executed serially by the processor."]],
  tips: ["Say BOTH instructions and data live in memory, executed serially — that is the marking core.", "Link it to general-purpose computing: load different instructions to do a different job."],
  pitfalls: ["Saying instructions run from disk — they are fetched from main memory.", "Forgetting 'serially / one at a time'."]
},
"compsci:4.7.3.2": {
  defs: [["Fetch-Execute cycle", "The repeating fetch → decode → execute process by which a processor runs machine code."]],
  tips: ["Know each register's job: PC (next address), MAR (address out), MBR/MDR (data in/out), CIR (current instruction).", "The PC increments in Fetch but a branch overwrites it in Execute."],
  pitfalls: ["Mixing up MAR (address) and MBR (data).", "Forgetting the PC is incremented during Fetch."]
},
"compsci:4.7.3.6": {
  defs: [["Interrupt", "A signal to the processor that an event needs attention, causing it to pause the current task."],
         ["Interrupt service routine (ISR)", "The routine run to handle a specific interrupt."]],
  tips: ["Interrupts are checked at the END of each Fetch-Execute cycle.", "'Save the volatile environment' = push registers + PC to the stack so the task can resume."],
  pitfalls: ["Forgetting to mention saving/restoring the registers (volatile environment).", "Saying the interrupt is checked mid-instruction."]
},
"compsci:4.7.3.3": {
  defs: [["Instruction set", "All the machine-code instructions a particular processor can execute; it is processor-specific."],
         ["Opcode / operand", "Opcode = the operation; operand = the data it acts on (value, address or register)."]],
  tips: ["Say the instruction set is processor-SPECIFIC — machine code is not portable across architectures.", "An instruction = opcode + one or more operands."],
  pitfalls: ["Thinking machine code runs on any CPU.", "Forgetting an operand can be a value, an address OR a register."]
},
"compsci:4.7.3.4": {
  defs: [["Immediate addressing", "The operand IS the data value to use."],
         ["Direct addressing", "The operand is the memory address holding the data."]],
  tips: ["Immediate is faster (value in the instruction); direct needs an extra memory fetch.", "# usually denotes an immediate/literal value."],
  pitfalls: ["Swapping the two definitions.", "Thinking direct addressing uses the operand as the value (it is the address)."]
},
"compsci:4.7.3.5": {
  defs: [["Branch (conditional/unconditional)", "An instruction that changes the PC; conditional branches do so only if a status-flag condition holds."],
         ["Compare", "Subtracts operands to set status flags without storing the result."]],
  tips: ["COMPARE sets flags; the following conditional branch acts on them — that pair implements IF/loops.", "Logical shift left ≈ ×2; logical shift right ≈ ÷2 (unsigned)."],
  pitfalls: ["Saying COMPARE stores a result (it only sets flags).", "Confusing logical with arithmetic shift on signed values."]
},
"compsci:4.7.3.7": {
  defs: [["Cache memory", "Small, fast memory close to the CPU holding frequently used data/instructions to cut memory-access time."]],
  tips: ["Each factor: clock speed (cycles/sec), cores (parallelism), cache (fewer memory waits), bus widths/word length (data per transfer).", "More cores only help if the workload is parallelisable."],
  pitfalls: ["Saying more cores always means proportionally faster — serial code does not benefit.", "Ignoring heat/power limits of raising clock speed."]
},
"compsci:4.7.4.1": {
  defs: [["Input device", "Sends data into the computer (keyboard, scanner, sensor…)."],
         ["Output device", "Presents data from the computer (monitor, printer, actuator…)."]],
  tips: ["Justify a device choice by its characteristics/suitability for the task, not just by naming it.", "Sensors input physical measurements; actuators output physical actions."],
  pitfalls: ["Calling a touchscreen input-only (it is both).", "Listing devices without justifying suitability."]
},
"compsci:4.7.4.2": {
  defs: [["Secondary storage", "Non-volatile storage that retains data without power (HDD, SSD, optical), with large capacity."],
         ["SSD", "Solid-state drive — flash memory, no moving parts; fast and robust but finite write cycles."]],
  tips: ["Need for secondary storage = non-volatile + high capacity (RAM is volatile).", "Compare HDD vs SSD on speed, durability, capacity and cost per GB."],
  pitfalls: ["Calling RAM secondary storage.", "Forgetting the SSD finite-write-cycle limitation."]
},
"compsci:4.7.3.1": {
  tips: ["Fetch–execute cycle: name the registers at each stage — PC→MAR, memory[MAR]→MBR, MBR→CIR, decode in CU, PC incremented. Register names ARE the marks.",
         "Factors affecting performance: clock speed, cores, cache, word length, bus widths — explain the mechanism, not just the factor."],
  pitfalls: ["Saying the PC holds the current instruction — it holds the ADDRESS of the next instruction."]
},
"compsci:4.8.1": {
  defs: [["Computer Misuse Act", "Makes unauthorised access, access-with-intent and unauthorised modification of computer material illegal."],
         ["Data Protection Act / GDPR", "Requires personal data to be processed fairly, lawfully, securely and only for stated purposes."]],
  tips: ["For impact questions, give BOTH opportunities and risks, then a conclusion.", "Name the right law for the scenario (hacking → Misuse Act; personal data → DPA; copying → Copyright Act)."],
  pitfalls: ["Confusing the Data Protection Act with the Computer Misuse Act.", "Listing only risks (or only benefits) in a 'discuss' answer."]
},
"compsci:4.9.1.1": {
  defs: [["Serial transmission", "Sending data one bit at a time over a single channel."],
         ["Asynchronous transmission", "Data framed with start/stop bits, with no shared clock between sender and receiver."]],
  tips: ["Serial beats parallel over distance because it avoids SKEW and crosstalk.", "Start/stop bits frame each byte in asynchronous transmission (no shared clock)."],
  pitfalls: ["Saying parallel is always faster — skew/crosstalk limit it over distance.", "Confusing synchronous (shared clock) with asynchronous (start/stop bits)."]
},
"compsci:4.9.1.2": {
  defs: [["Baud rate", "The number of signal changes per second."],
         ["Bit rate", "The number of bits per second; = baud rate × bits per signal change."]],
  tips: ["Bit rate = baud × bits-per-symbol — quote it to separate the two.", "Higher bandwidth → higher possible bit rate; latency is delay, not speed."],
  pitfalls: ["Treating baud rate and bit rate as the same thing.", "Confusing bandwidth (capacity) with latency (delay)."]
},
"compsci:4.9.2.1": {
  defs: [["Physical star", "Each device connects to a central switch/hub by its own cable."],
         ["Logical bus", "Devices share a single communication channel; all see the data, the addressee accepts it."]],
  tips: ["Star = resilient + more cabling + central single-point-of-failure; bus = cheap + collision-prone.", "'Physical' = the wiring layout; 'logical' = how data actually flows."],
  pitfalls: ["Saying a star's central-switch failure affects only one device (it takes down all).", "Confusing physical topology with logical topology."]
},
"compsci:4.9.2.2": {
  defs: [["Peer-to-peer", "All hosts are equal, acting as both client and server, sharing resources directly."],
         ["Client-server", "Clients request services from central servers that manage resources, security and backups."]],
  tips: ["Client-server = central security/backup/scalability; P2P = cheap/simple, no admin, poor at scale.", "Match the model to scale: P2P for small/home, client-server for organisations."],
  pitfalls: ["Saying P2P has no server — every peer can act as one.", "Ignoring scale when recommending a model."]
},
"compsci:4.9.2.3": {
  defs: [["CSMA/CA", "Carrier Sense Multiple Access with Collision Avoidance — wireless devices check the channel is free and use ACKs to avoid collisions."],
         ["WAP", "Wireless access point — connects wireless devices to a network."]],
  tips: ["Wireless uses CA (avoidance) not CD (detection) because of the hidden-node problem.", "Security = encryption (WPA2/3) + key, optionally MAC filtering / hidden SSID."],
  pitfalls: ["Saying wireless uses CSMA/CD.", "Listing only a password for security with no encryption."]
},
"compsci:4.9.3.1": {
  defs: [["Packet switching", "Splitting data into packets routed independently and reassembled at the destination."],
         ["Router / gateway", "A router forwards packets between networks; a gateway also translates between different protocols."]],
  tips: ["Sequence numbers reassemble; TTL stops infinite looping; checksum detects corruption.", "Distinguish router (same protocol) from gateway (protocol translation)."],
  pitfalls: ["Saying packets always take the same route.", "Confusing a router with a gateway."]
},
"compsci:4.9.3.2": {
  defs: [["Symmetric encryption", "One shared secret key used to both encrypt and decrypt."],
         ["Asymmetric encryption", "A public/private key pair: the public key encrypts, the matching private key decrypts."]],
  tips: ["Confidentiality: encrypt with the recipient's PUBLIC key. Signature: sign with the sender's PRIVATE key.", "Firewall types: packet filtering (headers), proxy (intermediary), stateful (tracks connections)."],
  pitfalls: ["Mixing up which key encrypts vs decrypts in asymmetric encryption.", "Saying a firewall encrypts data — it filters traffic."]
},
"compsci:4.9.4.1": {
  defs: [["TCP/IP stack", "Four layers — application, transport, network, link — each adding/removing its own header."],
         ["Socket", "A communication endpoint = IP address + port number."]],
  tips: ["Down the stack = encapsulation (add headers); up = decapsulation.", "Transport adds ports (TCP reliable), Network adds IP, Link adds MAC."],
  pitfalls: ["Listing the OSI 7 layers instead of TCP/IP's 4.", "Confusing IP addresses (network layer) with MAC addresses (link layer)."]
},
"compsci:4.9.4.3": {
  defs: [["Network/host identifier", "An IP address splits into a network part (which network) and a host part (which device)."]],
  tips: ["The subnet mask defines where the network part ends and the host part begins.", "Routers forward on the network ID; the host ID matters only on the destination network."],
  pitfalls: ["Thinking the whole IP identifies the device — the network part identifies the network.", "Forgetting octets are 0–255 (8 bits each)."]
},
"compsci:4.9.4.4": {
  defs: [["Subnet mask", "A pattern whose 1-bits mark the network portion of an IP address; IP AND mask gives the network address."]],
  tips: ["Network address = IP AND subnet mask.", "Compare your network address with the destination's to decide local vs send-to-gateway."],
  pitfalls: ["ORing instead of ANDing IP with the mask.", "Forgetting the network and broadcast addresses aren't usable hosts."]
},
"compsci:4.9.4.5": {
  defs: [["IPv4 / IPv6", "IPv4 = 32-bit addresses (dotted decimal); IPv6 = 128-bit addresses (hex, colon-separated)."]],
  tips: ["IPv6's reason for being = IPv4 exhaustion; 128 bits vs 32 bits.", "Mention NAT as the IPv4 stop-gap that delayed exhaustion."],
  pitfalls: ["Saying IPv6 is just 'IPv4 but newer' — note 128-bit and the address-exhaustion driver.", "Confusing the bit counts (32 vs 128)."]
},
"compsci:4.9.4.6": {
  defs: [["Public (routable) IP", "A globally unique address routed on the Internet."],
         ["Private (non-routable) IP", "Reused within local networks (10 / 172.16 / 192.168 ranges); not routed on the Internet."]],
  tips: ["Private addresses + NAT let many devices share one public IP, conserving IPv4.", "Non-routable = Internet routers drop them; they work only locally."],
  pitfalls: ["Thinking private addresses are unique globally.", "Forgetting NAT is what bridges private↔public."]
},
"compsci:4.9.4.7": {
  defs: [["DHCP", "Dynamic Host Configuration Protocol — automatically assigns IP addresses and settings via DORA (Discover, Offer, Request, Acknowledge)."]],
  tips: ["Know DORA in order; a lease is time-limited and renewed.", "Benefit = no manual config + no duplicate addresses + reuse."],
  pitfalls: ["Getting the DORA order wrong.", "Saying DHCP assigns MAC addresses (those are fixed on the NIC)."]
},
"compsci:4.9.4.8": {
  defs: [["NAT", "Network Address Translation — maps private internal addresses to one public address, tracked in a translation table."]],
  tips: ["NAT conserves IPv4 (many private → one public) and hides internal hosts.", "It uses a table of internal IP:port ↔ public IP:port to route replies."],
  pitfalls: ["Confusing NAT with DHCP (translation vs address assignment).", "Forgetting NAT needs port info to demultiplex replies."]
},
"compsci:4.9.4.9": {
  defs: [["Port forwarding", "A NAT rule mapping a public port to a fixed internal IP:port so an inbound service is reachable."]],
  tips: ["Needed because NAT drops unsolicited inbound traffic by default.", "Trade-off: external access vs an opened inbound attack path."],
  pitfalls: ["Confusing port forwarding (an inbound rule) with NAT generally.", "Ignoring the security risk in a 'discuss' answer."]
},
"compsci:4.9.4.10": {
  defs: [["WebSocket", "A persistent, full-duplex connection enabling real-time server↔client messaging without polling."],
         ["REST", "A stateless request-response style using HTTP methods on resources; CRUD = Create/Read/Update/Delete."]],
  tips: ["WebSocket for real-time push; REST for stateless request-response CRUD.", "REST stateless = every request is self-contained (no server session)."],
  pitfalls: ["Thinking REST can push updates — it needs polling.", "Forgetting CRUD = Create, Read, Update, Delete."]
},
"compsci:4.9.4.11": {
  defs: [["Thin client", "Relies on a central server for processing/storage; does minimal work locally."],
         ["Thick (fat) client", "Does most processing/storage locally; little server reliance."]],
  tips: ["Thin = cheap, central management, but server/network dependent; thick = powerful, works offline, costlier to manage.", "Frame trade-offs around cost, management, resilience and offline use."],
  pitfalls: ["Saying thin clients are more powerful (they are minimal).", "Ignoring the server/network single-point-of-failure for thin clients."]
},
"compsci:4.9.4.2": {
  tips: ["Port numbers worth memorising: FTP 20/21, SSH 22, SMTP 25, HTTP 80, POP3 110, HTTPS 443.",
         "Know each protocol's one-line job: SMTP sends mail between servers; POP3 retrieves to a client; SSH gives encrypted remote login."],
  pitfalls: ["Describing HTTPS as 'HTTP but safe' — say it encrypts requests/responses, typically via TLS."]
},
"compsci:4.10.3": {
  defs: [["Normalisation", "The process of organising data to eliminate redundancy: 1NF (atomic values, no repeating groups), 2NF (no partial dependency on part of a composite key), 3NF (no non-key attribute depends on another non-key attribute)."]],
  tips: ["3NF one-liner that earns the mark: 'every non-key attribute depends on the key, the whole key and nothing but the key'.",
         "Normalisation benefits: removes redundancy/duplication, prevents update/insert/delete anomalies, maintains consistency."],
  pitfalls: ["Leaving repeating groups in 'normalised' answers; check every attribute is atomic first."]
},
"compsci:4.10.4": {
  tips: ["SQL questions are marked clause by clause: SELECT fields / FROM tables / WHERE condition / ORDER BY. A correct skeleton with one wrong condition still earns most marks.",
         "Use table.field names when two tables share a field name in joins."],
  pitfalls: ["String values without quotes in WHERE; missing join condition causing a cartesian product.", "Using = with NULL instead of IS NULL."]
},
"compsci:4.12.1.2": {
  defs: [["First-class object", "An object that may appear in expressions, be assigned to a variable, be passed as an argument and be returned by a function call."],
         ["Higher-order function", "A function that takes a function as an argument, returns a function, or both."]],
  tips: ["Map applies a function to every element; filter keeps elements satisfying a predicate; fold/reduce combines elements into one value. Be able to give the result for a concrete list."],
  pitfalls: ["Confusing function application f x with composition f ∘ g — composition applies g first."]
},
"compsci:4.11.1": {
  defs: [["Big Data", "A catch-all term for data too large/fast/varied for the usual containers (relational databases), described by volume, velocity and variety."],
         ["Fact-based model", "A representation where each immutable, timestamped fact captures a single piece of information; data is appended, never overwritten."],
         ["Graph schema", "A way to capture dataset structure using nodes (entities), edges (relationships) and properties (attributes)."]],
  tips: ["Define Big Data through all three Vs — volume, velocity, variety — not just size.",
         "Link functional programming to distribution: immutability, statelessness and higher-order functions make distributed code easier to write correctly.",
         "For graph schema, name all three parts: nodes, edges AND properties."],
  pitfalls: ["Claiming a more powerful single server solves Big Data — it requires horizontal scaling across many machines.",
             "Saying the tail/edge stores data rather than identifying nodes=entities, edges=relationships."]
},
"compsci:4.12.1.1": {
  defs: [["Function type", "Written f : A → B, where A is the argument type (domain) and B is the result type (co-domain)."],
         ["Domain", "The set from which a function's input values are chosen."],
         ["Co-domain", "The set from which a function's output values are chosen; not every member need be an output."]],
  tips: ["Distinguish co-domain (all possible outputs) from range/image (outputs actually produced) — range ⊆ co-domain.",
         "Use a worked example such as f(x)=x² to show range ≠ co-domain."],
  pitfalls: ["Treating co-domain and range as identical.", "Saying a function may map one input to several outputs — by definition each input maps to exactly one output."]
},
"compsci:4.12.1.3": {
  defs: [["Function application", "Applying a function to its arguments to evaluate it, e.g. add(3, 4)."],
         ["Cartesian product", "integer × integer is the set of all pairs of integers; a two-argument function's argument type."]],
  tips: ["Know that add(3,4) has type integer × integer → integer and can be viewed as taking a single pair (3,4).",
         "When chaining f(g(x)), the inner application g(x) is evaluated first."],
  pitfalls: ["Assuming functional languages always need parentheses — Haskell uses a space: f x."]
},
"compsci:4.12.1.4": {
  defs: [["Partial function application", "Supplying fewer arguments than a function expects, returning a new function that takes the remaining argument(s)."],
         ["Currying", "Re-expressing a multi-argument function as a chain of single-argument functions, e.g. add : integer → integer → integer."]],
  tips: ["Know the AQA notation: add : integer → (integer → integer); brackets drop because → is right-associative.",
         "addFive = add 5 returns a function; addFive 10 = 15."],
  pitfalls: ["Saying partial application gives the final answer — it returns a new function awaiting the rest.", "Treating currying and partial application as identical."]
},
"compsci:4.12.1.5": {
  defs: [["Function composition", "Combining functions g and f into g ∘ f, whose domain is f's domain and co-domain is g's co-domain; (g ∘ f)(x) = g(f(x))."]],
  tips: ["Composition is right-to-left: the rightmost function runs first.",
         "For g ∘ f to be valid, the co-domain of f must match the domain of g."],
  pitfalls: ["Reading f ∘ g left-to-right — g is applied first.", "Forgetting the type-matching condition between the two functions."]
},
"compsci:4.12.2.1": {
  defs: [["Higher-order function", "A function that takes a function as an argument and/or returns a function as its result."],
         ["map / filter / reduce", "map transforms every element (same length); filter keeps elements matching a predicate; reduce/fold collapses a list to a single value."]],
  tips: ["Quote concrete results: map(double,[1,2,3])=[2,4,6]; filter(isEven,[1,2,3,4])=[2,4]; fold(add,0,[1,2,3])=6.",
         "Functional languages: Haskell, ML, Scheme, Lisp; multi-paradigm with functional support: Python, F#, C#, Scala, Java 8+."],
  pitfalls: ["Saying map can change list length — only filter shortens it.", "Saying fold returns a list — it returns a single value."]
},
"compsci:4.12.3.1": {
  defs: [["Head", "The first element of a list."],
         ["Tail", "A list of all elements after the head (itself a list, possibly empty)."]],
  tips: ["Know the head:tail notation: [4,3,5] = 4 : [3,5]; [] is the empty list.",
         "Know all seven operations: head, tail, test empty, length, construct empty, prepend, append.",
         "Recursive list functions: base case empty list, recursive case process head then recurse on tail."],
  pitfalls: ["Saying the tail is the last element — it is everything after the head.", "Saying tail([x]) returns x — it returns the empty list []."]
},
"compsci:NEA.1": {
  tips: ["Every objective must be measurable: verb + noun + testable condition (e.g. 'return results in under 2 seconds for 10,000 records').",
         "Show real user research — interview/questionnaire evidence, not assumptions about 'users'.",
         "Keep objectives traceable: each should reappear in Design, Testing and Evaluation."],
  pitfalls: ["Vague objectives like 'be fast' or 'be easy to use' — they cannot be tested, so earn nothing.", "Treating quantity of objectives as quality — five precise objectives beat fifteen vague ones."]
},
"compsci:NEA.2": {
  defs: [["Hierarchy chart", "Shows the module/function breakdown only — which modules exist and contain which."],
         ["Structure chart", "A hierarchy chart plus labelled arrows showing the data passed between modules."]],
  tips: ["Write the test plan in Design, before coding, covering normal, boundary AND erroneous data for every objective.",
         "Justify every design decision against a specific Analysis requirement ('because the client needs…')."],
  pitfalls: ["Producing a test plan after coding — all-pass plans look retrospective.", "Documenting only normal test cases and omitting boundary/erroneous data."]
},
"compsci:NEA.3": {
  tips: ["Functionality first: a simpler working solution beats an ambitious broken one.",
         "Raise complexity with file I/O, non-trivial SQL (JOIN/WHERE), meaningful OOP, real validation and error handling.",
         "Provide an annotated screenshot for every objective, labelled with its number."],
  pitfalls: ["Comments that narrate WHAT not WHY ('i += 1 # add one').", "Missing screenshot evidence — uncredited even when the code exists."]
},
"compsci:NEA.4": {
  defs: [["Normal/boundary/erroneous data", "Typical valid input / input at the edge of validity / invalid input that must be rejected."]],
  tips: ["Execute the Design test plan and record actual vs expected with pass/fail for every test.",
         "Show iterative testing: unit, then integration, then end-to-end — and show bugs found, fixed and re-tested."],
  pitfalls: ["An all-pass table looks under-tested or retrospective.", "Testing only normal data and forgetting erroneous/boundary cases."]
},
"compsci:NEA.5": {
  tips: ["Evaluate objective-by-objective: met / partially met / not met, each backed by the relevant test number(s).",
         "Identify real, specific limitations and pair each with a concrete technical improvement.",
         "Quote genuine client/user feedback as external evidence of usability."],
  pitfalls: ["Generic praise ('it works well') earns nothing — be specific and evidence-linked.", "Hiding limitations — honest critical analysis scores higher than claiming perfection."]
},
"compsci:4.1.2.1": {
  defs: [["Procedural paradigm", "Programs built from subroutines executed in sequence, operating on separate data."],
         ["Object-oriented paradigm", "Data and methods bundled into objects, with encapsulation, inheritance and polymorphism."]],
  tips: ["Procedural separates data from code; OOP bundles them — state that contrast.", "OOP's modularity suits large/evolving systems; procedural suits small tasks."],
  pitfalls: ["Saying OOP and procedural can't coexist — many languages support both.", "Defining a paradigm by a language rather than by its structuring approach."]
},
"compsci:4.1.2.2": {
  defs: [["Hierarchy chart", "A top-down diagram decomposing a problem into modules/subroutines."],
         ["Coupling / cohesion", "Coupling = inter-module dependence (low is good); cohesion = single-task focus (high is good)."]],
  tips: ["Aim for LOW coupling, HIGH cohesion.", "Hierarchy chart = structure (what calls what); flowchart = logic/flow."],
  pitfalls: ["Confusing a hierarchy chart (structure) with a flowchart (logic).", "Wanting high coupling — it makes change harder."]
},
"compsci:4.2.1.2": {
  defs: [["Multi-dimensional array", "An array indexed by two or more subscripts (e.g. [row][col]) — a table/grid."]],
  tips: ["Element address (row-major) = base + (row × cols + col) × elementSize.", "Arrays give O(1) indexed access but are fixed-size and homogeneous."],
  pitfalls: ["Off-by-one with array bounds (0-based vs 1-based).", "Mixing row/column order in the address formula."]
},
"compsci:4.2.1.4": {
  defs: [["Abstract data type (ADT)", "A logical description of data + operations, independent of implementation."],
         ["Static vs dynamic", "Static = fixed size (array); dynamic = grows/shrinks at runtime (linked list)."]],
  tips: ["Queue = FIFO; stack = LIFO — match the ADT to the access pattern.", "ADT = interface; the array/linked-list is the implementation."],
  pitfalls: ["Confusing an ADT with its implementation.", "Saying an array is dynamic — it is static (fixed size)."]
},
"compsci:4.6.5.1": {
  defs: [["De Morgan's laws", "¬(A·B) = Ā+B̄; ¬(A+B) = Ā·B̄ — 'break the bar, change the sign'."]],
  tips: ["Quote the law name at every simplification step — method marks.", "Look for a common factor, a P+P̄ / P·P̄ pair, or an absorption shape."],
  pitfalls: ["Half-applying De Morgan's (forgetting to flip the operator).", "Skipping justification steps even when the answer is right."]
},
"compsci:4.10.1": {
  defs: [["Entity", "A thing data is stored about (becomes a table)."],
         ["ER diagram", "Shows entities, attributes and relationships (1:1, 1:many, many:many)."]],
  tips: ["Resolve many-to-many with a linking/junction entity → two one-to-many relationships.", "Each entity needs a primary key."],
  pitfalls: ["Leaving a many-to-many relationship unresolved.", "Confusing an entity (table) with an attribute (field)."]
},
"compsci:4.10.2": {
  defs: [["Foreign key", "An attribute referencing another table's primary key, linking the two tables."],
         ["Composite primary key", "A primary key made of two or more attributes."]],
  tips: ["A FK references a PK — that link is how relations join.", "Referential integrity = every FK must match an existing PK."],
  pitfalls: ["Confusing primary key (identifies) with foreign key (links).", "Forgetting a composite key is needed when no single attribute is unique."]
},
"compsci:4.10.5": {
  defs: [["Concurrent access control", "Managing simultaneous transactions (e.g. by locking) so the database stays consistent."],
         ["Deadlock", "Two transactions each waiting for a lock the other holds — neither proceeds."]],
  tips: ["Locking prevents lost updates; the cost is waiting and possible deadlock.", "Deadlock is resolved by rolling back one transaction."],
  pitfalls: ["Saying locking speeds things up — it serialises access (can slow it).", "Ignoring deadlock as a drawback in a 'discuss' answer."]
},
"compsci:4.13.1.2": {
  defs: [["Design stage", "Planning data structures, algorithms, interfaces and tests before coding."]],
  tips: ["Hierarchy chart = structure; flowchart = logic; both are design tools.", "Design covers data, algorithms, HCI and the test plan."],
  pitfalls: ["Jumping to code without a design.", "Confusing design (the plan) with implementation (the code)."]
},
"compsci:4.13.1.3": {
  defs: [["Implementation", "Turning the design into working code and data structures."]],
  tips: ["Name debugging tools: trace tables/dry runs, breakpoints/debugger, unit tests.", "Agile = iterative + feedback; waterfall = sequential."],
  pitfalls: ["Confusing implementation (coding) with design (planning).", "Saying agile has no planning — it plans per iteration."]
},
"compsci:4.13.1.4": {
  defs: [["Test data types", "Normal (typical valid), boundary (range edges) and erroneous (invalid) data."]],
  tips: ["Always cover all three: normal, boundary, erroneous.", "Boundary = the limits AND just outside them."],
  pitfalls: ["Testing only normal data.", "Confusing boundary with erroneous data."]
},
"compsci:4.13.1.5": {
  defs: [["Evaluation", "Judging the finished solution against the original (Analysis) requirements."]],
  tips: ["Evaluate against the documented requirements, not opinion.", "Include usability, robustness, maintainability and efficiency."],
  pitfalls: ["Evaluating against vague criteria instead of the requirements.", "Skipping end-user validation."]
},
"compsci:4.13.1.1": {
  tips: ["NEA-aligned: analysis = define the problem, establish requirements with users, model the data. In exam answers name the stakeholder interaction explicitly."],
  pitfalls: []
},

/* ============ Edexcel Mathematics 9MA0 — Pure ============ */
"maths:1.1": {
  tips: ["Proof by deduction must start from known facts/assumptions and reason to the result — never start from the result.",
         "Contradiction proofs: open with 'Assume, for contradiction, that …' and close with 'this contradicts …, so the assumption is false'. Both sentences carry marks.",
         "Disproof needs ONE concrete counter-example, fully evaluated."],
  pitfalls: ["Proof by exhaustion: missing a single case voids the proof — list the cases before checking them.", "In irrationality of √2, forgetting to state a/b is in lowest terms — the contradiction depends on it."]
},
"maths:2.3": {
  tips: ["Discriminant logic: b² − 4ac > 0 two distinct real roots; = 0 repeated root; < 0 no real roots. Quote the inequality you are using before solving it.",
         "Completing the square gives the vertex directly: a(x + p)² + q has minimum q at x = −p (for a > 0)."],
  pitfalls: ["Sign slip on p when reading the vertex from (x + p)².", "Forgetting to factor out a before completing the square when a ≠ 1."]
},
"maths:2.5": {
  tips: ["Quadratic inequalities: sketch the parabola, mark the roots, then read off the region. The sketch is creditable working.",
         "Express answers in the form asked for — set notation with ∪/∩ if the question uses it."],
  pitfalls: ["Multiplying or dividing an inequality by a variable that could be negative — for x in the denominator, multiply by x² or sketch instead.", "Writing a < x > b for a disjoint region — it must be x < a OR x > b."]
},
"maths:2.6": {
  tips: ["Factor theorem statement to quote: if f(b/a) = 0 then (ax − b) is a factor. Show the substitution and the zero explicitly."],
  pitfalls: ["Algebraic division sign errors when subtracting — bracket the whole term being subtracted."]
},
"maths:2.9": {
  tips: ["Order matters in combined transformations: for y = f(ax + b), the translation by −b happens BEFORE the stretch 1/a in x (work inside-out)."],
  pitfalls: ["Confusing y = f(x + a) (translation LEFT by a) with y = f(x) + a (translation UP by a). Say 'translation by vector' and give the vector."]
},
"maths:2.10": {
  tips: ["For a repeated factor (cx + d)², include BOTH B/(cx + d) and C/(cx + d)² terms.",
         "Cover-up method is fast for distinct linear factors but show at least one substitution line of working."],
  pitfalls: ["Forgetting partial fractions feed later parts — binomial expansion or integration usually follows; keep the constants exact."]
},
"maths:4.1": {
  tips: ["For rational n, expansion of (a + bx)ⁿ: factor out aⁿ first so the bracket is (1 + (b/a)x)ⁿ, and state validity |bx/a| < 1.",
         "Validity statements are a standalone mark — never omit them."],
  pitfalls: ["Forgetting aⁿ multiplies EVERY term after factoring.", "Sign errors with negative n: write each coefficient n(n−1)/2! etc. before simplifying."]
},
"maths:4.5": {
  tips: ["Sum to infinity exists only when |r| < 1 — state the condition when you use S∞ = a/(1 − r).",
         "Finding n from a sum: isolate rⁿ then take logs; inequality direction flips if log of a number < 1 (negative log)."],
  pitfalls: ["Dividing consecutive-term equations the wrong way round when finding r."]
},
"maths:5.3": {
  tips: ["Learn the exact value triangle/table cold: sin, cos for 0, π/6, π/4, π/3, π/2 and tan for 0, π/6, π/4, π/3 — 'use exact values' means no decimals anywhere in working."],
  pitfalls: ["Calculator left in degrees when the question is in radians (or vice versa) — check the interval's units first."]
},
"maths:5.6": {
  tips: ["R-form: expand R cos(θ ∓ α), compare coefficients, R = √(a² + b²), tan α = b/a. State R exactly and α to the accuracy asked.",
         "Max of a cosθ + b sinθ is R; minimum is −R; it occurs where the bracket is ±1 — read these straight off the R-form."],
  pitfalls: ["Choosing the wrong form (R sin vs R cos) for the follow-up — match the form the question requests."]
},
"maths:5.7": {
  tips: ["Solving f(kθ) = c on an interval: multiply the interval by k FIRST, find all solutions for the new variable, then divide back. Count solutions before finishing — symmetry tells you how many to expect.",
         "Quadratics in sin/cos: substitute s = sin x, solve the quadratic, then reject impossible roots (|s| > 1) explicitly."],
  pitfalls: ["Dividing by cos x and losing the cos x = 0 solutions — factorise instead.", "Discarding solutions from secondary values (180° − x for sine, 360° − x for cosine)."]
},
"maths:5.8": {
  tips: ["Identity proofs: work on ONE side only (usually the more complicated) until it equals the other. Quote each identity as you use it.",
         "Writing ≡ rather than = signals you understand it holds for all values — examiners notice."],
  pitfalls: ["'Proving' by manipulating both sides toward each other — Edexcel mark schemes penalise it."]
},
"maths:6.4": {
  tips: ["Log laws apply only to logs of the SAME base — state the base if it could be ambiguous.",
         "log_a a = 1 and log_a 1 = 0 finish many simplifications; quote them."],
  pitfalls: ["Inventing a law for log(x + y) — there isn't one. log x + log y = log(xy), nothing splits a sum inside a log."]
},
"maths:6.6": {
  tips: ["y = axⁿ → plot log y vs log x: gradient n, intercept log a. y = kbˣ → plot log y vs x: gradient log b, intercept log k. Identify which model BEFORE reading the graph.",
         "Convert intercepts back: a = 10^(intercept) — the back-conversion is its own mark."],
  pitfalls: ["Reading the intercept as a or k directly instead of as its logarithm."]
},
"maths:7.1": {
  tips: ["Differentiation from first principles: write the limit definition, expand (x + h)ⁿ, cancel h, THEN let h → 0 — saying 'as h → 0' too early loses the rigour mark.",
         "Points of inflection: f″ changes SIGN — showing f″ = 0 alone is not sufficient; test either side."],
  pitfalls: ["Treating f″(x) = 0 as proof of inflection (consider y = x⁴ at 0).", "Convex/concave mixed up: f″ > 0 ⇒ convex."]
},
"maths:7.4": {
  tips: ["Quotient rule: write u, v, u′, v′ in a margin block first — Edexcel gives method marks for the correct structure even with an arithmetic slip.",
         "Connected rates: write the chain dV/dt = dV/dr × dr/dt before substituting anything."],
  pitfalls: ["Quotient rule numerator order: vu′ − uv′ (not the reverse).", "Forgetting to use d y/d x = 1/(d x/d y) when x is given in terms of y."]
},
"maths:7.5": {
  tips: ["Implicit differentiation: every y term differentiates to (dy/dx) × its y-derivative; product terms like xy need the product rule. Collect dy/dx terms on one side as a shown step."],
  pitfalls: ["Differentiating y² to 2y and dropping the dy/dx factor."]
},
"maths:8.2": {
  tips: ["+c on EVERY indefinite integral — it is checked.",
         "Trig powers: convert with identities first — sin²x via cos 2x, tan²x = sec²x − 1 — then integrate term by term."],
  pitfalls: ["Integrating products term-by-term as if integration distributed over multiplication — expand or substitute first."]
},
"maths:8.3": {
  tips: ["Area between curves: ∫(top − bottom) dx between intersections you have FOUND and stated. A sketch showing which is on top is creditable.",
         "Parametric areas: ∫ y (dx/dt) dt with limits converted to t-values."],
  pitfalls: ["Regions below the x-axis: the integral is negative — take magnitudes per region, never net them blindly."]
},
"maths:8.5": {
  tips: ["Substitution: substitute the limits too (or convert back to x before evaluating). Write du = … dx as an explicit line.",
         "By parts: choose u by LATE/LIATE (ln first to differentiate). ∫ln x dx: u = ln x, dv = dx — a quotable standard."],
  pitfalls: ["Leaving a stray x inside an integral now in u — the substitution must remove the old variable completely."]
},
"maths:8.7": {
  tips: ["Separate variables fully — all y with dy, all x with dx — show the separated line BEFORE integrating; it is a method mark.",
         "Particular solutions: substitute the initial condition immediately after integrating, while +c is still loose."],
  pitfalls: ["Forgetting modulus in ln|y| then losing valid negative branches.", "Exponentiating ln y = f(x) + c to y = e^f(x) + c instead of y = Ae^f(x)."]
},
"maths:9.3": {
  tips: ["Newton-Raphson: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ). State f′ explicitly before iterating; give iterates to more figures than the final answer.",
         "Failure mode to quote: fails when f′(xₙ) is zero or small (tangent near-horizontal shoots off) or when the starting point is near a turning point."],
  pitfalls: ["Rounding intermediate iterates — carry full calculator precision, round only at the end."]
},
"maths:9.4": {
  tips: ["Trapezium rule: h = (b − a)/n where n = number of STRIPS = ordinates − 1. Write the bracket [y₀ + yₙ + 2(middle ordinates)] before evaluating.",
         "Over/under-estimate: sketch the curve — concave up ⇒ overestimate; justify from the sketch."],
  pitfalls: ["Using the number of ordinates as n.", "Claiming over/underestimate without reference to the curvature."]
},
"maths:10.4": {
  tips: ["AB vector = b − a (head minus tail). Write the rule before substituting — it is the method mark.",
         "Show |v| via the squared sum line: d² = (…)² + (…)² + (…)² then root."],
  pitfalls: ["Subtracting the wrong way for direction-specific questions (AB vs BA)."]
},

/* ============ Edexcel Mathematics 9MA0 — Stats & Mechanics ============ */
"maths:S1.1": {
  tips: ["Sampling definitions are pure AO1 recall: learn simple random, systematic (every kth from a random start), stratified (proportional to group sizes), quota and opportunity word-for-word.",
         "Critique questions: tie the method's flaw to THIS context — generic 'it's biased' earns nothing."],
  pitfalls: ["Calling systematic sampling random when the list itself has a pattern."]
},
"maths:S2.2": {
  tips: ["Correlation language: strength (strong/weak) + direction (positive/negative) + context variables. All three components for full description marks.",
         "Extrapolation: predictions outside the data range are unreliable — say 'outside the range of the data' verbatim."],
  pitfalls: ["Asserting causation from correlation — Edexcel explicitly tests the distinction.", "Interpreting the regression a and b without context units."]
},
"maths:S2.3": {
  tips: ["With large data set summary statistics: write Sxx = Σx² − (Σx)²/n as the first line. Method mark lives there.",
         "Linear interpolation for medians/percentiles: state class boundaries and widths in the working."],
  pitfalls: ["Mixing the divisor n and n − 1 forms of standard deviation — Edexcel default is ÷n; the other is 'accepted', but be consistent.", "Coding: remember to UNDO the coding for the mean AND adjust sd only for multiplicative coding."]
},
"maths:S3.2": {
  tips: ["Draw the Venn/tree even when not asked — most conditional probability marks come from correct diagram values.",
         "P(A|B) = P(A ∩ B)/P(B): identify the intersection in context before computing."],
  pitfalls: ["Confusing P(A|B) with P(B|A) — read the wording: 'given that' introduces the condition.", "Treating mutually exclusive as independent — they are incompatible for events with non-zero probability."]
},
"maths:S4.1": {
  tips: ["Binomial modelling conditions: fixed number of trials, two outcomes, constant p, independent trials — quote all four IN CONTEXT when asked to justify the model."],
  pitfalls: ["Using P(X = x) when the question needs cumulative P(X ≤ x) — re-read for 'at most/at least/more than'.", "P(X ≥ k) = 1 − P(X ≤ k − 1): the k − 1 is the classic slip."]
},
"maths:S4.2": {
  tips: ["Normal questions: sketch, shade, standardise. The standardisation line Z = (X − μ)/σ is a method mark even when the calculator does the lookup.",
         "Points of inflection at μ ± σ — quotable fact used to read σ from a graph."],
  pitfalls: ["Forgetting the continuity correction when approximating binomial by normal.", "Using σ² where σ is needed — the notation N(μ, σ²) carries the variance."]
},
"maths:S5.2": {
  tips: ["Hypothesis test scaffold that earns the marks every time: H₀: p = …, H₁ (one/two-tail with reason), test statistic distribution under H₀, probability/critical region, compare, conclude IN CONTEXT without over-claiming ('there is evidence to suggest…').",
         "Always define p in words: 'p is the population proportion of …'."],
  pitfalls: ["Concluding 'H₀ is true' — you fail to reject, never prove.", "Comparing a p-value with the wrong tail of a two-tailed α (halve it)."]
},
"maths:S7.3": {
  tips: ["List s, u, v, a, t with knowns/unknowns before choosing a formula — it is the standard method and prevents wrong-formula slips.",
         "Take a positive direction and declare it ('taking up as positive') — sign consistency is where most marks die."],
  pitfalls: ["Using suvat when acceleration is NOT constant — check the wording; variable a means calculus (7.4).", "g sign errors in vertical motion: with up positive, a = −9.8."]
},
"maths:S7.5": {
  tips: ["Projectiles: resolve once at the start — horizontal: constant velocity u cos θ; vertical: suvat with a = −g. Treat the two directions in separate columns.",
         "Time links the components: find t from one direction, substitute into the other."],
  pitfalls: ["Using suvat horizontally with a ≠ 0 — horizontal acceleration is zero in the model.", "Greatest height: vertical velocity = 0, not speed = 0."]
},
"maths:S8.2": {
  tips: ["F = ma questions: draw the force diagram, resolve along/perpendicular to motion, then write the equation of motion per particle/direction. The diagram itself often carries a mark.",
         "Inclined planes: weight components mg sin θ along, mg cos θ perpendicular — derive once, memorise."],
  pitfalls: ["Missing a force on the diagram (normal reaction, friction, tension) — every later mark depends on the diagram.", "Mass vs weight: W = mg; never put 'm' into a force balance."]
},
"maths:S8.4": {
  tips: ["Connected particles: equation of motion for EACH particle separately, same magnitude a, same tension for a light inextensible string over a smooth pulley — and state those modelling assumptions when asked why.",
         "'Inextensible ⇒ same acceleration', 'light string ⇒ same tension throughout', 'smooth pulley ⇒ tension equal both sides' — assumption-to-consequence pairs are mark-scheme lines."],
  pitfalls: ["Adding the two particles' equations before being asked for the system — fine for a, useless for T."]
},
"maths:S8.6": {
  tips: ["Limiting equilibrium ⇒ F = μR exactly; moving ⇒ F = μR; otherwise F ≤ μR. Choose and state which case applies.",
         "R is found by resolving perpendicular to the surface FIRST — friction questions are two-stage."],
  pitfalls: ["Assuming R = mg on an inclined plane or when other vertical forces act — resolve, don't assume."]
},
"maths:S9.1": {
  tips: ["Moments: choose the pivot that eliminates the unknown you don't want (take moments about the point where an unknown force acts).",
         "State 'taking moments about …' and the sense (clockwise = anticlockwise) — the structure line is a mark."],
  pitfalls: ["Using the full length instead of the perpendicular distance for angled forces — moment = force × PERPENDICULAR distance.", "Ladder problems: forgetting friction at the ground acts toward the wall."]
},

/* ============ OCR IT AAQ — Data Analytics ============ */
"it:F200.1.1": {
  tips: ["Learn the chain verbatim: data = raw, unprocessed facts; information = data processed with context/meaning; knowledge = information applied with understanding/experience. Definition-style questions reward exact wording.",
         "Benefit/limitation questions are marked in context — anchor every point to the scenario organisation."],
  pitfalls: ["Using 'data' and 'information' interchangeably mid-answer — the distinction IS the topic."]
},
"it:F200.1.3": {
  tips: ["For each file format, know: characteristics, where it is used, one benefit, one limitation. CSV vs JSON vs XML comparisons are favourites: CSV is flat/lightweight; JSON nests and is web-friendly; XML is verbose but supports schemas/validation."],
  pitfalls: ["Discussing compression types — the spec explicitly excludes lossy/lossless here.", "Bringing in file formats not listed in the teaching content — they score nothing."]
},
"it:F200.2.4": {
  tips: ["Stages of data analysis should be given in order and with purpose: define questions → collect → clean → process/analyse → visualise → interpret. Tie each stage to the scenario when applying."],
  pitfalls: ["Skipping cleaning when describing a pipeline — examiners look for handling of errors, duplicates and missing values."]
},
"it:F200.4.1": {
  tips: ["Legislation answers need the Act + what it requires + how it applies to the scenario. UK GDPR/DPA 2018 principles (lawfulness, purpose limitation, data minimisation, accuracy, storage limitation, security, accountability) are quotable structure."],
  pitfalls: ["Naming an Act with no application — one mark at best.", "Confusing Computer Misuse Act (unauthorised access/modification) with data protection law (handling personal data)."]
},
"it:F201.1.1": {
  tips: ["The Vs of big data — volume, velocity, variety (and veracity/value where taught) — make a reliable skeleton for 'describe the characteristics' questions; define each V, then exemplify in context."],
  pitfalls: ["Defining big data only as 'lots of data' — velocity and variety must appear."]
},
"it:F201.3.1": {
  tips: ["Be precise with the hierarchy: AI ⊃ machine learning. Supervised learning uses labelled data to predict; unsupervised finds patterns/clusters in unlabelled data. Tie examples to data analytics scenarios (fraud detection, recommendation)."],
  pitfalls: ["Describing machine learning as 'the computer being intelligent' — describe training on data and improving with exposure."]
},
"it:F202.2.1": {
  tips: ["NEA planning evidence: success criteria must be measurable, inputs/processes/outputs identified, and design decisions justified against user requirements — 'because the client needs…' phrasing scores."],
  pitfalls: ["Designs that don't trace back to stated requirements — moderators check the thread from requirement to feature."]
},
"it:F203.1.1": {
  tips: ["Relational vocabulary must be exact: table/entity, record/row, field/attribute, primary key (unique identifier), foreign key (primary key of another table used to link), referential integrity.",
         "Relationships: justify one-to-many in context ('one customer places many orders')."],
  pitfalls: ["Calling a foreign key 'a key in a foreign table' — it lives in THIS table and references another."]
},
"it:F205.2.1": {
  tips: ["Dashboard planning: match each visualisation type to the data and audience need — trends → line, composition → pie/stacked, comparison → bar, relationship → scatter. Justification of choice is where marks sit."],
  pitfalls: ["Choosing visuals for decoration: every chart on the plan should answer a stated user question."]
}
};
