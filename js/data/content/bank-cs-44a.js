/* Kurenai OS — past-paper bank: AQA 7517 §4.4 Theory of computation (part A:
   problem solving, abstraction, FSMs, regular expressions, sets, BNF).
   Modelled on AS/A-level Paper 1 Section A, June 2016–2025. See bank-cs-41.js
   for the conventions. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.4.1.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "The logic puzzle — Question 1 or 2 every year" },
    "A-level Paper 1 opens with a **problem-solving puzzle**: mislabelled boxes (2018), a Sudoku-as-graph (2019), self-referential statements (2022), a shape-guessing game (2023). AS papers open with two one-mark deductions. The marks are for a **justified deduction**, written as *because X, then Y*: \"Statement 1 can't be correct because it would make Statement 5 true as well, but only one statement is true\". A bare answer without the *because* usually scores 1 of 2.",
    { callout: { t: "tip", h: "Method", body: "1. Write down what each clue rules out. 2. Look for the clue that forces a single case (the one box you *must* open first). 3. Chain the consequences and state the contradiction that kills each alternative. Spend at most four minutes — it is never more than 4 marks." }}
  ],
  flashcards: [
    ["Three boxes are labelled Apples, Oranges, Both — every label wrong. Which box do you open to fix all labels?", "The one labelled Both: its fruit is what it really is (say apples); then the box labelled Apples must be oranges and the box labelled Oranges must be both."],
    ["Only one of the statements is true, and Statement 1 says 'Statement 5 is true'. Can Statement 1 be true?", "No — it would make two statements true, contradicting the premise."],
    ["What does a 'No' answer to 'Is your shape red?' let you deduce?", "Eliminate every red shape; what remains is the candidate set — record it explicitly before the next question."],
    ["What is problem solving in the specification's sense?", "Identifying a problem, decomposing it, representing it and devising an algorithm to solve it — a systematic approach rather than guessing."],
    ["Why write deductions as 'because … so …'?", "The mark is for the justification: the examiner needs to see the reasoning, not just the answer."],
    ["What is meant by 'the search space' of a puzzle?", "The set of all possible configurations; each deduction shrinks it."],
    ["How do you check a puzzle answer?", "Substitute it back into every clue and confirm none is violated."],
    ["What is a logical contradiction in a puzzle?", "A case in which some statement would have to be both true and false — that case is impossible and can be discarded."]
  ],
  quiz: [
    { q: "Exactly one of three statements is true. S1: 'S2 is false.' S2: 'S3 is false.' S3: 'S1 is false.' Which is true?", opts: ["S1", "S2", "S3", "None can be"], ans: 3, why: "If S1 true then S2 false, so S3 true — two truths. Each case fails similarly, so the premise is inconsistent." },
    { q: "Boxes labelled A, B and 'A or B' are all wrong. The box labelled 'A or B' contains only:", opts: ["A", "B", "either — one item tells you which", "nothing"], ans: 2, why: "Its label is wrong so it is pure A or pure B; one item resolves it." },
    { q: "A player answers 'No' to 'Is it a triangle?' and 'No' to 'Is it blue?' The shapes left are:", opts: ["blue triangles", "non-blue non-triangles", "blue non-triangles", "all shapes"], ans: 1, why: "Both eliminations apply." },
    { q: "The mark for a puzzle deduction is usually awarded for:", opts: ["the answer alone", "the reasoning that forces the answer", "a diagram", "speed"], ans: 1, why: "'Because … so …'." },
    { q: "Turning a Sudoku into a graph loses:", opts: ["the cells", "which constraint (row/column/box) links two cells", "all edges", "the numbers"], ans: 1, why: "The nature/location of the relationship is not represented." },
    { q: "Best first move in a puzzle with several clues:", opts: ["guess", "find the clue that forces a unique case", "ignore the hardest clue", "list every configuration"], ans: 1, why: "Forced moves shrink the search space fastest." }
  ],
  exam: [
    { src: "AQA 2018 P1 Q1.1", q: "Three sealed boxes contain, respectively, only red pens, only blue pens, and a mix of both. Every box is labelled, but every label is wrong. You may take one pen from one box without looking inside. Explain which box you should take a pen from and how you can then correctly label all three boxes.", marks: 2,
      ms: ["Take a pen from the box labelled \"mixed\" — because that label is wrong it contains only one colour, which the pen reveals (1)", "If it is red, the box labelled \"blue\" (which cannot be blue) must be mixed and the box labelled \"red\" must be blue; and symmetrically if the pen is blue (1)"] },
    { src: "AQA 2022 P1 Q3", ctx: "Exactly one of the following statements is true. S1: \"S3 is true.\" S2: \"S1 and S4 are true.\" S3: \"S2 is false.\" S4: \"S3 is false.\"",
      parts: [
        { q: "Explain why S1 cannot be the true statement.", marks: 1, ms: ["If S1 were true then S3 would also be true, giving more than one true statement — contradiction (1)"] },
        { q: "Identify the true statement, justifying your answer.", marks: 2, ms: ["S3 (1)", "S3 true means S2 false (consistent); S1 false requires S3 true (consistent); S4 says S3 is false, so S4 is false — exactly one true statement (1)"] }
      ] },
    { src: "AQA 2023 P1 Q2", ctx: "A game uses six tokens: red circle, red square, red star, green circle, green square, blue star. One is chosen secretly. You ask \"Is it red?\" — No. \"Is it a square?\" — No.",
      parts: [
        { q: "State what can be deduced after the first answer.", marks: 1, ms: ["The token is one of green circle, green square or blue star (1)"] },
        { q: "State what can be deduced after the second answer.", marks: 1, ms: ["The token is the green circle or the blue star (1)"] },
        { q: "Suggest one final question that identifies the token, whatever the answer.", marks: 1, ms: ["\"Is it green?\" (or \"Is it a star?\") — either answer leaves exactly one token (1)"] }
      ] }
  ]
});

X("compsci:4.4.1.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "The AS hand-trace — 3 to 5 marks every year" },
    "AS Paper 1 always contains a **trace table** of a short algorithm: hex-to-decimal conversion (2017), a primality test (2018), insertion sort (2019, 2023), sentinel-terminated summation (2020), binary search (2022), binary addition over strings (2024), a tree lookup over arrays (2025). Marks are awarded **per set of values in sequence** (usually one column each), *Max n − 1 if any errors*. Follow-ups: *state the purpose of the algorithm* (1 mark, a plain-English sentence such as \"converts a hexadecimal string to its denary value\") and *why the algorithm is inefficient* (2025: it keeps looping after a mismatch is found / compares the whole string when half would do).",
    { callout: { t: "tip", h: "Trace discipline", body: "One column per variable in the order the algorithm names them; write a new value only when it changes; for a loop, add a row per iteration. Write the **loop condition result** (TRUE/FALSE) as its own column if the algorithm tests one — the 2018 scheme gave a mark for it." }},
    { callout: { t: "def", h: "Algorithm (AS 2023, 2 marks)", body: "A **sequence of steps / instructions** that can be followed to **solve a problem / complete a task** — and which always terminates." }}
  ],
  flashcards: [
    ["Define the term algorithm.", "A sequence of unambiguous steps that can be followed to solve a problem or complete a task, and which terminates."],
    ["What is a trace table?", "A table recording the values of every variable (and any output) after each statement or iteration, used to follow an algorithm by hand."],
    ["Trace: `t ← 0; FOR i ← 1 TO 3: t ← t + i × i`. Final t?", "1 + 4 + 9 = 14."],
    ["What does `Total ← Total × 16 + Value` inside a loop over hex digits compute?", "The denary value of a hexadecimal string, one digit at a time (Horner's method)."],
    ["What is a sentinel value?", "A special input (e.g. −1) that signals the end of data and terminates a loop."],
    ["Why might an algorithm keep looping after it has found its answer?", "The loop condition only checks the counter, not a Found/Done flag — an inefficiency examiners ask you to identify."],
    ["Describe the purpose of `IF n MOD d = 0 THEN Prime ← FALSE` for d from 2 to n − 1.", "A primality test: any divisor found means n is not prime."],
    ["What should you write in a trace table cell when a value does not change?", "Leave it blank (or repeat only if the scheme says 'I. repeated values')."]
  ],
  quiz: [
    { q: "For input \"1A\" the algorithm `Total ← 0; for each char: Total ← Total × 16 + value(char)` gives:", opts: ["26", "161", "17", "10"], ans: 0, why: "1 → 1; then 1×16 + 10 = 26." },
    { q: "A loop `WHILE d < n AND Prime` stops early because:", opts: ["n is prime", "the flag Prime becomes FALSE when a divisor is found", "d overflows", "MOD is undefined"], ans: 1, why: "The compound condition uses the flag." },
    { q: "In a trace table you add a row:", opts: ["per variable", "per statement/iteration that changes a value", "per column", "once"], ans: 1, why: "Rows follow execution." },
    { q: "'Sequence of steps that solves a problem' describes:", opts: ["a program", "an algorithm", "a data structure", "a compiler"], ans: 1, why: "Language-independent definition." },
    { q: "Insertion sort trace: [4, 3, 1] after inserting the second element:", opts: ["[3, 4, 1]", "[1, 3, 4]", "[4, 1, 3]", "[3, 1, 4]"], ans: 0, why: "3 is moved before 4; 1 is not yet processed." },
    { q: "An algorithm that compares all n characters of a palindrome candidate when n/2 would do is:", opts: ["incorrect", "inefficient", "recursive", "invalid"], ans: 1, why: "Correct but does unnecessary work." }
  ],
  exam: [
    { level: "AS", src: "AS 2017 P1 Q2.1", ctx: "The algorithm converts a hexadecimal string `H` to a denary integer. `V(c)` returns the value of a single hex digit.",
      code: { lang: "pseudo", src: "Total ← 0\nFOR i ← 0 TO LEN(H) − 1\n   Digit ← V(H[i])\n   Total ← Total × 16 + Digit\nENDFOR\nOUTPUT Total" },
      parts: [
        { q: "Complete a trace table for `H = \"2F\"` with columns `i`, `H[i]`, `Digit` and `Total`.", marks: 3, ms: ["i: 0, 1; H[i]: 2, F (1)", "Digit: 2, 15 (1)", "Total: 0, 2, 47; output 47 (1)"] },
        { q: "State the purpose of the algorithm.", marks: 1, ms: ["Converts a hexadecimal number (string) to its denary value (1)"] },
        { q: "The algorithm sets `Digit` to −1 for an invalid character but continues. Explain why this does not handle invalid input effectively.", marks: 2, ms: ["The −1 is still multiplied into the total, so a wrong (not obviously invalid) value is output (1)", "The loop should stop / report an error / the input should be rejected before conversion (1)"] }
      ] },
    { level: "AS", src: "AS 2018 P1 Q2.1", ctx: "The algorithm tests whether `N` is prime.",
      code: { lang: "pseudo", src: "Prime ← TRUE\nD ← 2\nWHILE D < N AND Prime = TRUE\n   IF N MOD D = 0 THEN Prime ← FALSE ENDIF\n   D ← D + 1\nENDWHILE\nOUTPUT Prime" },
      parts: [
        { q: "Complete a trace table for `N = 9` with columns `D`, `N MOD D`, `Prime` and `D < N AND Prime`.", marks: 3, ms: ["D: 2, 3, 4; N MOD D: 1, 0 (1)", "Prime: TRUE then FALSE after D = 3 (1)", "Condition: TRUE, TRUE, FALSE; output FALSE (1)"] },
        { q: "State the largest value of `D` the loop needs to test to decide whether `N` is prime, and explain why.", marks: 2, ms: ["√N (or D × D ≤ N) (1)", "Any factor larger than √N pairs with one smaller than √N, which would already have been found (1)"] }
      ] },
    { level: "AS", src: "AS 2023 P1 Q4", q: "Define the term *algorithm*.", marks: 2,
      ms: ["A sequence of steps / instructions (1)", "that can be followed to solve a problem or complete a task (accept: and that terminates) (1)"] },
    { level: "AS", src: "AS 2020 P1 Q2", ctx: "The algorithm is meant to add up numbers entered by the user until −1 is entered, then output the total.",
      code: { lang: "pseudo", src: "Total ← 0\nINPUT Num\nWHILE Num ≠ −1\n   INPUT Num\n   Total ← Total + Num\nENDWHILE\nOUTPUT Total" },
      parts: [
        { q: "Trace the algorithm for the inputs 5, 8, −1, showing `Num` and `Total`.", marks: 3, ms: ["Num: 5, 8, −1 (1)", "Total: 0, 8, 7 (1)", "Output 7 (1)"] },
        { q: "Explain what is wrong with the algorithm and describe how to correct it.", marks: 2, ms: ["The first number is never added and the sentinel −1 is added to the total (1)", "Move `INPUT Num` to the end of the loop body (after the addition) so each value is added before the next is read / test before adding (1)"] }
      ] }
  ]
});

X("compsci:4.4.1.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Abstraction — the definitions the schemes accept" },
    { kv: [
      ["Representational abstraction (2019)", "**Removing unnecessary details** so the problem is represented in a form that can be solved"],
      ["Abstraction by generalisation / categorisation (2019)", "**Grouping by common characteristics** — a hierarchical / 'kind-of' relationship"],
      ["Information hiding", "Hiding the details of how something works behind an interface"],
      ["Procedural abstraction", "A computational method is captured as a named procedure; the specific values are abstracted away"],
      ["Functional abstraction", "Even the method is abstracted away — only the function's input→output mapping remains"],
      ["Data abstraction (AS 2025)", "The detail of how data are actually represented is hidden; new data objects are built from previously defined ones (e.g. a stack implemented as an array)"],
      ["Problem abstraction / reduction (AS 2018)", "Details are removed until the problem reduces to one that has already been solved"],
      ["Decomposition (2021, 2025)", "Breaking a problem into smaller sub-problems, each of which solves an identifiable task and might itself be further subdivided"],
      ["Composition (AS 2018)", "Combining procedures into compound procedures / combining data objects into compound structures"],
      ["Automation (AS 2018)", "Putting models (abstractions of real-world objects/phenomena) into action to solve problems"]
    ]},
    { callout: { t: "warn", body: "The 2019 Sudoku question: representing the puzzle as a graph **loses** *why* two cells are linked (same row / column / box) and *where* each cell is. A representational abstraction always discards something — say what." }}
  ],
  flashcards: [
    ["What is representational abstraction?", "Removing unnecessary details so that the problem is represented in a form that can be solved."],
    ["What is abstraction by generalisation?", "Grouping things by common characteristics to form a hierarchical 'kind-of' relationship."],
    ["Give an example of representational abstraction.", "The London Underground map — geography and distance removed, only stations and connections kept."],
    ["Give an example of abstraction by generalisation.", "Treating cars, buses and lorries all as 'vehicles' with a shared set of properties."],
    ["What information is lost when a Sudoku grid is represented as a graph of cells and constraints?", "Why two cells are linked (same row, column or box) and where each cell is located."],
    ["Why is abstraction essential in computing?", "Real problems contain far more detail than can be handled; abstraction keeps only what matters to the solution."],
    ["What is a model?", "An abstraction of a real-world object or phenomenon, keeping the relevant features."],
    ["How does abstraction help reuse?", "A solution written for the abstract form applies to every concrete problem that reduces to it."]
  ],
  quiz: [
    { q: "A tube map that omits distances and street layout is an example of:", opts: ["abstraction by generalisation", "representational abstraction", "automation", "composition"], ans: 1, why: "Unnecessary detail removed." },
    { q: "Classifying Dog, Cat and Horse under Mammal is:", opts: ["representational abstraction", "abstraction by generalisation", "decomposition", "information hiding"], ans: 1, why: "Grouping by common characteristics — a 'kind-of' hierarchy." },
    { q: "Representing a puzzle as a graph keeps:", opts: ["every detail", "only the relationships needed to solve it", "the colours", "nothing"], ans: 1, why: "That is the point of the abstraction." },
    { q: "'Removing details' is the mark-scheme phrase for:", opts: ["automation", "representational abstraction", "composition", "recursion"], ans: 1, why: "2019 P1 Q3.2." },
    { q: "'Grouping by common characteristics' is the phrase for:", opts: ["generalisation", "decomposition", "reduction", "automation"], ans: 0, why: "2019 P1 Q3.3." },
    { q: "An abstraction that keeps too little detail:", opts: ["is always fine", "may make the problem unsolvable / lose needed information", "runs faster", "is called composition"], ans: 1, why: "The trade-off in what to remove." }
  ],
  exam: [
    { src: "AQA 2019 P1 Q3", ctx: "A Sudoku-style puzzle is modelled as a graph in which each cell is a node and an edge joins two cells that must contain different values.",
      parts: [
        { q: "State what is meant by representational abstraction.", marks: 1, ms: ["Removing (unnecessary) details (1)"] },
        { q: "State what is meant by abstraction by generalisation.", marks: 1, ms: ["Grouping by common characteristics / a hierarchical 'kind-of' relationship (1)"] },
        { q: "Describe one piece of information about the puzzle that is not represented in the graph.", marks: 1, ms: ["Why two cells are related — that they are in the same row / column / block — or the location of a cell is not represented (1)"] }
      ] },
    { src: "AQA 2021 P2 Q1", q: "A satellite-navigation system represents a road network as a weighted graph. Explain how this is an example of abstraction and state one item of real-world information that is deliberately omitted.", marks: 3,
      ms: ["Only the details needed for route-finding — junctions as nodes, roads as edges with distance/time weights — are kept (1)", "This is representational abstraction: unnecessary detail is removed (1)", "Omitted e.g. road width, scenery, the exact shape of the road between junctions (1)"] }
  ]
});

X("compsci:4.4.1.4", {
  flashcards: [
    ["Define information hiding.", "The process of hiding all details of an object that do not contribute to its essential characteristics — the interface is visible, the implementation is not."],
    ["How does information hiding appear in OOP?", "Private attributes accessed only through public methods (encapsulation)."],
    ["Why does information hiding make systems more robust?", "Code cannot depend on internal details, so those details can change without breaking anything else."],
    ["Give an everyday example of information hiding.", "A car's accelerator pedal — the driver uses the interface without knowing the engine management inside."],
    ["Relation between information hiding and an ADT?", "An ADT exposes operations and hides representation — information hiding applied to data."],
    ["What is an interface?", "The set of operations/methods through which other code interacts with a component."],
    ["What does information hiding protect against?", "Unintended interference with internal state and reliance on details that may change."],
    ["How does a library function demonstrate information hiding?", "You call it by name with parameters without knowing (or needing) its implementation."]
  ],
  quiz: [
    { q: "Information hiding means:", opts: ["encrypting data", "hiding implementation details behind an interface", "deleting comments", "using globals"], ans: 1, why: "Interface visible, internals hidden." },
    { q: "In a class, information hiding is achieved by:", opts: ["public attributes", "private attributes with public methods", "global variables", "inheritance"], ans: 1, why: "Encapsulation." },
    { q: "A benefit of information hiding:", opts: ["faster CPUs", "internal changes do not affect users of the component", "no need for testing", "more memory"], ans: 1, why: "Loose coupling." },
    { q: "Which is NOT information hiding?", opts: ["A stack ADT's array being inaccessible", "A method's body being private", "A password stored in plain text", "A library's internals being unseen"], ans: 2, why: "That is a security matter, not abstraction." },
    { q: "Information hiding and encapsulation are:", opts: ["unrelated", "closely related — encapsulation implements hiding in OOP", "the same as recursion", "only for databases"], ans: 1, why: "Encapsulation is the OOP mechanism." },
    { q: "The visible part of a component under information hiding is its:", opts: ["source code", "interface", "memory", "compiler"], ans: 1, why: "Operations, not internals." }
  ],
  exam: [
    { src: "AQA 2020 P2 Q6", q: "Explain what is meant by *information hiding* and describe how an object-oriented program achieves it.", marks: 3,
      ms: ["Hiding the details of an object / component that do not contribute to its essential characteristics, exposing only an interface (1)", "Attributes are declared private so they cannot be accessed directly from outside the class (1)", "Public methods (getters/setters) provide controlled access — the internal representation can change without affecting other code (1)"] },
    { src: "AQA 2017 P1 Q6", q: "A programmer uses a library's queue data type without knowing how it is implemented. Explain why this is an example of information hiding and give one advantage to the programmer.", marks: 2,
      ms: ["Only the operations (enqueue, dequeue…) are visible; the representation (array, linked list) is hidden (1)", "The programmer cannot break the queue's internal state / the library can change its implementation without the program needing changes (1)"] }
  ]
});

X("compsci:4.4.1.5", {
  flashcards: [
    ["Define procedural abstraction.", "Abstracting away the actual values used in a computation, leaving a named procedure that captures the method — a procedure is a computational pattern with parameters."],
    ["Give an example of procedural abstraction.", "A procedure `Sort(list)` that works for any list — the specific data is a parameter."],
    ["What is the result of procedural abstraction?", "A procedure (subroutine) that can be reused with different values."],
    ["How do parameters relate to procedural abstraction?", "They are the placeholders for the values abstracted away."],
    ["Difference between procedural and functional abstraction?", "Procedural keeps the method (how) but abstracts the values; functional abstracts even the method, keeping only input→output."],
    ["Why does procedural abstraction aid problem solving?", "Once a method is captured as a procedure it can be called without re-thinking the steps."],
    ["What is a computational method?", "A sequence of operations that achieves a result — what a procedure encapsulates."],
    ["Give a real-world analogy of procedural abstraction.", "A recipe: the method is fixed, the quantities are parameters."]
  ],
  quiz: [
    { q: "Writing `Area(length, width)` instead of `5 × 3` each time is:", opts: ["data abstraction", "procedural abstraction", "automation", "composition"], ans: 1, why: "The values are abstracted into parameters." },
    { q: "Procedural abstraction results in a:", opts: ["data structure", "procedure", "diagram", "constant"], ans: 1, why: "A named, reusable method." },
    { q: "What is abstracted away in procedural abstraction?", opts: ["the method", "the actual values", "the name", "the result"], ans: 1, why: "The method stays; the values become parameters." },
    { q: "Compared with functional abstraction, procedural abstraction:", opts: ["hides more", "still specifies how the result is computed", "has no parameters", "is only in OOP"], ans: 1, why: "Functional abstraction removes the how." },
    { q: "A library `Sqrt(x)` used without knowing its algorithm demonstrates:", opts: ["procedural abstraction only", "functional abstraction", "decomposition", "generalisation"], ans: 1, why: "Only the mapping matters to the caller." },
    { q: "Parameters in procedural abstraction are:", opts: ["fixed values", "placeholders for the abstracted values", "global variables", "return types"], ans: 1, why: "Filled at each call." }
  ],
  exam: [
    { src: "AQA 2018 P2 Q4", q: "Explain what is meant by *procedural abstraction*, using an example.", marks: 2,
      ms: ["The actual values in a computation are abstracted away, leaving a computational method / pattern that is named as a procedure (1)", "e.g. a procedure `CalculateTax(income)` that works for any income passed as a parameter (1)"] },
    { src: "AQA 2022 P2 Q2", q: "Distinguish between procedural abstraction and functional abstraction.", marks: 2,
      ms: ["Procedural abstraction abstracts away the specific values but keeps the method — the procedure (1)", "Functional abstraction abstracts away the method as well, so only the function's mapping from inputs to outputs remains (1)"] }
  ]
});

X("compsci:4.4.1.6", {
  flashcards: [
    ["Define functional abstraction.", "The result of procedural abstraction is a procedure; functional abstraction removes even the method, leaving just a function — a mapping from inputs to outputs."],
    ["How does a caller use a functionally abstracted component?", "By what it returns for given inputs — without knowing or caring how."],
    ["Give an example.", "`Sqrt(x)` — the user knows the result is the square root but not whether Newton–Raphson or a table is used."],
    ["Why is functional abstraction useful in large systems?", "Components can be replaced with any implementation of the same mapping."],
    ["Which abstraction hides the most: procedural or functional?", "Functional — it hides the method itself."],
    ["How do the two relate in sequence?", "Procedural abstraction → a procedure; functional abstraction of that → a function whose internals are irrelevant."],
    ["Relation to the functional programming paradigm?", "Functions are treated purely as input→output mappings with no side-effects — functional abstraction taken as a design principle."],
    ["What is meant by a function's 'signature'?", "Its name, parameter types and return type — the visible part after functional abstraction."]
  ],
  quiz: [
    { q: "Functional abstraction leaves:", opts: ["the values", "the method", "only the input→output mapping", "nothing"], ans: 2, why: "The method is abstracted away." },
    { q: "Using `Sort()` without knowing whether it is merge or bubble sort is:", opts: ["procedural abstraction", "functional abstraction", "generalisation", "decomposition"], ans: 1, why: "Method irrelevant to the caller." },
    { q: "Functional abstraction builds on:", opts: ["automation", "procedural abstraction", "composition", "recursion"], ans: 1, why: "Values first, then the method." },
    { q: "The visible part of a function after functional abstraction:", opts: ["its loop structure", "its signature and behaviour", "its variables", "its comments"], ans: 1, why: "Interface only." },
    { q: "Swapping a function's implementation for a faster one is safe if:", opts: ["names differ", "the input→output mapping is unchanged", "it uses more memory", "it is recursive"], ans: 1, why: "That is what callers rely on." },
    { q: "Functional abstraction supports:", opts: ["tight coupling", "component replacement", "global state", "spaghetti code"], ans: 1, why: "Implementations become interchangeable." }
  ],
  exam: [
    { src: "AQA 2019 P2 Q4", q: "Explain what is meant by *functional abstraction* and how it differs from procedural abstraction.", marks: 3,
      ms: ["Procedural abstraction abstracts away the actual values, giving a named procedure that captures the computational method (1)", "Functional abstraction abstracts away the method as well (1)", "Leaving just a function — a mapping from inputs to outputs — so the user need not know how the result is computed (1)"] }
  ]
});

X("compsci:4.4.1.7", {
  flashcards: [
    ["Define data abstraction.", "Hiding the details of how data are actually represented so that new kinds of data object can be built from previously defined ones."],
    ["Give an example of data abstraction.", "A stack implemented as an array with a top pointer — users see push/pop, not the array."],
    ["How does data abstraction relate to ADTs?", "An ADT is the product of data abstraction: operations without representation."],
    ["What is a compound data object?", "A data object built from simpler ones, e.g. a record built from fields or a list built from nodes."],
    ["Why can a stack be built from an array or a linked list?", "Because data abstraction hides the representation — either satisfies the same operations."],
    ["What would break data abstraction?", "Code accessing the underlying array of a stack directly."],
    ["One-mark AS 2025 answer for 'data abstraction'?", "The detail of how the data are represented is hidden / new data objects are constructed from previously defined types / by example: a queue implemented as an array."],
    ["How do records demonstrate data abstraction?", "A record type is a new data object composed from built-in types, used by its field names, not its byte layout."]
  ],
  quiz: [
    { q: "Data abstraction hides:", opts: ["the algorithm", "how data are represented", "the program name", "the user"], ans: 1, why: "Representation detail." },
    { q: "A queue implemented as an array is an example of:", opts: ["data abstraction", "automation", "generalisation", "decomposition"], ans: 0, why: "New data object from a defined type." },
    { q: "An ADT is:", opts: ["a concrete array", "the product of data abstraction", "a procedure", "a file"], ans: 1, why: "Operations without representation." },
    { q: "Which violates data abstraction?", opts: ["Calling Push(x)", "Reading the stack's internal array directly", "Calling Peek()", "Using IsEmpty()"], ans: 1, why: "Bypasses the interface." },
    { q: "Building a linked list from node records is:", opts: ["composition of data objects", "procedural abstraction", "automation", "reduction"], ans: 0, why: "New data structure from previously defined objects." },
    { q: "'How the data are actually represented is hidden' scores for:", opts: ["automation", "data abstraction", "generalisation", "decomposition"], ans: 1, why: "AS 2025 mark scheme." }
  ],
  exam: [
    { level: "AS", src: "AS 2025 P1 Q5", q: "Explain what is meant by *data abstraction*.", marks: 1,
      ms: ["The detail of how the data are actually represented is hidden / new kinds of data object can be constructed from previously defined types / by example, e.g. a stack implemented using an array (1)", "Max 1"] },
    { src: "AQA 2023 P2 Q5", q: "A programmer builds a priority queue from an existing list data type. Explain how this illustrates data abstraction and state one benefit.", marks: 3,
      ms: ["A new data object (priority queue) is constructed from a previously defined data type (list) (1)", "Users of the priority queue see only its operations; how it is represented as a list is hidden (1)", "Benefit: the representation can be changed (e.g. to a heap) without affecting code that uses it (1)"] }
  ]
});

X("compsci:4.4.1.8", {
  flashcards: [
    ["Define problem abstraction (reduction).", "Removing details until the problem is represented in a way that is possible to solve, because it reduces to one that has already been solved."],
    ["Give an example of problem reduction.", "Finding the fastest route between towns reduces to the shortest-path problem in a weighted graph — solved by Dijkstra's algorithm."],
    ["Why is problem reduction powerful?", "Known algorithms can be reused for any problem that reduces to their abstract form."],
    ["Another example?", "Scheduling exams so no student has a clash reduces to graph colouring."],
    ["What must be kept when reducing a problem?", "Enough structure that a solution to the reduced problem maps back to a solution of the original."],
    ["How does reduction relate to representational abstraction?", "Reduction is representational abstraction aimed at reaching a known solved problem."],
    ["What is the risk of over-reduction?", "Discarding a constraint that matters, so the 'solution' is invalid for the original problem."],
    ["How does reduction help prove a problem is hard?", "If a known intractable problem reduces to it, it is at least as hard."]
  ],
  quiz: [
    { q: "Recognising a delivery-route problem as the travelling salesman problem is:", opts: ["automation", "problem reduction", "composition", "information hiding"], ans: 1, why: "Reduced to a known problem." },
    { q: "Problem reduction works by:", opts: ["adding detail", "removing detail until a solved problem appears", "guessing", "compiling"], ans: 1, why: "Definition." },
    { q: "Exam timetabling reduces to:", opts: ["sorting", "graph colouring", "hashing", "RPN"], ans: 1, why: "Nodes = exams, edges = shared students, colours = slots." },
    { q: "After solving the reduced problem you must:", opts: ["stop", "map the solution back to the original problem", "re-reduce", "discard it"], ans: 1, why: "The abstract answer must be interpreted." },
    { q: "Reducing 'fastest route' to 'shortest path' keeps:", opts: ["road names", "junctions, roads and travel times", "scenery", "petrol prices"], ans: 1, why: "Only what the algorithm needs." },
    { q: "'Reduces to one that has already been solved' is the scheme phrase for:", opts: ["decomposition", "problem abstraction", "generalisation", "automation"], ans: 1, why: "AS 2018 P1 Q1." }
  ],
  exam: [
    { level: "AS", src: "AS 2018 P1 Q1", q: "Explain what is meant by *problem abstraction*, giving an example.", marks: 2,
      ms: ["Details are removed until the problem is represented in a way that is possible to solve, because it reduces to one that has already been solved (1)", "e.g. a route-planning problem reduced to finding the shortest path in a weighted graph (1)"] },
    { src: "AQA 2021 P1 Q3", q: "A company must assign delivery drivers to jobs so that no driver has two jobs at the same time. Describe how this could be approached using problem abstraction.", marks: 3,
      ms: ["Represent jobs as nodes and join two nodes with an edge if their times overlap (1)", "The problem now reduces to graph colouring — assigning colours (drivers) so no adjacent nodes share a colour (1)", "A known algorithm for the reduced problem can then be applied and the colours mapped back to drivers (1)"] }
  ]
});

X("compsci:4.4.1.9", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Decomposition — 2021, 2025" },
    "A 2–3 mark definition: **breaking a problem into smaller sub-problems** (knowledge), **each of which solves an identifiable task** and **each of which might itself be further subdivided** (understanding), *repeating until each sub-problem performs a single task*. Procedural decomposition (2021) is the same idea applied to a program: the sub-problems become subroutines.",
    { callout: { t: "tip", body: "Pair it with the AS 2024 *structured approach* question — the same decomposition gives an overview of the program, lets modules be tested independently, distributed among a team and reused." }}
  ],
  flashcards: [
    ["Define decomposition.", "Breaking a problem into smaller sub-problems, each of which solves an identifiable task and may itself be further subdivided."],
    ["What is procedural decomposition?", "Decomposing a program into subroutines (procedures/functions), each performing one identifiable task."],
    ["When does decomposition stop?", "When each sub-problem performs a single task that can be solved directly."],
    ["Give two benefits of decomposition.", "Sub-problems can be solved/tested independently; they can be shared among a team; solutions can be reused."],
    ["What diagram shows a decomposition?", "A hierarchy (structure) chart."],
    ["How does decomposition relate to top-down design?", "Top-down design is repeated decomposition from the whole problem downwards."],
    ["Decompose 'produce a report of exam results'.", "Read the results; calculate statistics; sort; format the output; print/save."],
    ["What is the AO2 follow-up examiners like?", "Give the sub-tasks for a described scenario — each must be a distinct, identifiable task."]
  ],
  quiz: [
    { q: "Decomposition means:", opts: ["deleting code", "breaking a problem into smaller sub-problems", "compressing data", "running in parallel"], ans: 1, why: "Definition." },
    { q: "A sub-problem in a decomposition should:", opts: ["be identical to the whole", "solve one identifiable task", "have no inputs", "be recursive"], ans: 1, why: "Mark-scheme phrase." },
    { q: "Decomposition can be applied:", opts: ["once only", "repeatedly, subdividing sub-problems further", "only in OOP", "only to data"], ans: 1, why: "Until single tasks remain." },
    { q: "Procedural decomposition produces:", opts: ["classes", "subroutines", "tables", "files"], ans: 1, why: "Each sub-problem → a procedure/function." },
    { q: "Which is NOT a benefit of decomposition?", opts: ["Team members work on parts independently", "Parts can be tested separately", "The program always runs faster", "Parts can be reused"], ans: 2, why: "Speed is not a benefit." },
    { q: "A hierarchy chart shows:", opts: ["the decomposition of a program into modules", "data flow only", "memory layout", "the test plan"], ans: 0, why: "Structure chart." }
  ],
  exam: [
    { src: "AQA 2025 P1 Q2", q: "Define the term *decomposition*.", marks: 2,
      ms: ["Splitting a problem into smaller sub-problems (1)", "So that each sub-problem accomplishes an identifiable task, which might itself be further divided — repeating until each sub-problem performs a single task (1)"] },
    { src: "AQA 2021 P1 Q3", q: "Explain what is meant by *procedural decomposition*.", marks: 3,
      ms: ["Breaking a problem into smaller sub-problems (1)", "Each of which solves an identifiable task (implemented as a subroutine) (1)", "Each of which might be further subdivided (1)"] },
    { level: "AS", src: "AS 2024 P1 Q3", q: "Give three reasons why a programmer would use a structured, decomposed approach when developing a large program.", marks: 3,
      ms: ["Gives an overview of the structure of the program / code easier to understand (1)", "The problem can be broken down into sub-tasks that are easier to solve (1)", "Subroutines / modules can be reused — less duplication (1)", "Implementation can be distributed among a team (1)", "Modules can be tested independently — quicker to debug / locate errors (1)", "Max 3"] }
  ]
});

X("compsci:4.4.1.10", {
  flashcards: [
    ["Define composition (in problem solving).", "Combining procedures into compound procedures, and combining data objects into compound data structures, to build more complex solutions."],
    ["Give an example of procedural composition.", "A `ProcessOrder` procedure that calls `ValidateOrder`, `ChargeCard` and `SendConfirmation` in turn."],
    ["Give an example of data composition.", "A `Customer` record containing an `Address` record and a list of `Order` records."],
    ["How do decomposition and composition relate?", "Decomposition breaks a problem into parts; composition assembles the solved parts into the whole solution."],
    ["What is a compound procedure?", "A procedure built by combining simpler procedures."],
    ["Composition in functional programming?", "f ∘ g — applying g then f, producing a new function."],
    ["Why is composition safer than one huge procedure?", "Each part is tested separately, then combined; errors are localised."],
    ["AS 2018 phrase for composition?", "'Combining procedures into compound procedures'."]
  ],
  quiz: [
    { q: "Composition means:", opts: ["breaking a problem apart", "combining procedures or data objects into compound ones", "hiding data", "removing detail"], ans: 1, why: "Building up from parts." },
    { q: "A record holding another record is an example of:", opts: ["data composition", "decomposition", "automation", "reduction"], ans: 0, why: "Compound data structure." },
    { q: "`Main` calling three subroutines in order demonstrates:", opts: ["procedural composition", "generalisation", "information hiding", "recursion"], ans: 0, why: "Compound procedure." },
    { q: "Composition is the counterpart of:", opts: ["automation", "decomposition", "abstraction", "reduction"], ans: 1, why: "Split then reassemble." },
    { q: "In functional programming, composing f and g gives:", opts: ["a new function applying one then the other", "a list", "a procedure with side-effects", "an error"], ans: 0, why: "f ∘ g." },
    { q: "'Combining procedures into compound procedures' matches:", opts: ["composition", "decomposition", "automation", "abstraction"], ans: 0, why: "AS 2018 P1 Q1." }
  ],
  exam: [
    { level: "AS", src: "AS 2018 P1 Q1", q: "Match each term to its description: decomposition, automation, composition, problem abstraction. Descriptions: (i) breaking a problem into a number of sub-problems; (ii) models are put into action to solve problems; (iii) combining procedures into compound procedures; (iv) details are removed until the problem reduces to one already solved.", marks: 4,
      ms: ["(i) decomposition (1)", "(ii) automation (1)", "(iii) composition (1)", "(iv) problem abstraction (1)"] },
    { src: "AQA 2020 P2 Q5", q: "Explain, with an example, what is meant by *composition* in the context of data structures.", marks: 2,
      ms: ["Combining data objects into compound data structures (1)", "e.g. a record for a student that contains a record for their address and an array of grades (1)"] }
  ]
});

X("compsci:4.4.1.11", {
  flashcards: [
    ["Define automation.", "Putting models — abstractions of real-world objects or phenomena — into action to solve problems, by creating algorithms, implementing them in program code and executing them."],
    ["What are the steps of automation?", "Create a model (abstraction); create an algorithm that operates on it; implement the algorithm as code; execute the code on a computer."],
    ["What is a model in this sense?", "An abstraction of a real-world object, system or phenomenon, keeping only the relevant features."],
    ["Give an example of automation.", "Weather forecasting — a model of the atmosphere is turned into algorithms and run on a supercomputer."],
    ["How do abstraction and automation relate?", "Abstraction produces the model; automation puts the model into action."],
    ["Why is a model needed before automation?", "The computer can only operate on a representation; the real world must first be abstracted into data and rules."],
    ["AS 2018 phrase for automation?", "'Models are put into action to solve problems'."],
    ["What is the output of automation?", "A running program that solves instances of the modelled problem."]
  ],
  quiz: [
    { q: "Automation is:", opts: ["removing detail", "putting models into action to solve problems", "grouping by characteristics", "hiding data"], ans: 1, why: "Definition." },
    { q: "The first step in automation is:", opts: ["writing code", "creating a model / abstraction", "testing", "buying hardware"], ans: 1, why: "Model → algorithm → code → execution." },
    { q: "A simulation of traffic flow is:", opts: ["decomposition", "automation of a traffic model", "composition", "reduction"], ans: 1, why: "Model in action." },
    { q: "Models are:", opts: ["exact copies", "abstractions of real-world objects/phenomena", "programs", "compilers"], ans: 1, why: "Simplified representations." },
    { q: "Which comes last in automation?", opts: ["model", "algorithm", "execute the program", "implement code"], ans: 2, why: "Run the implemented algorithm." },
    { q: "'Models are put into action' matches:", opts: ["automation", "abstraction", "composition", "decomposition"], ans: 0, why: "AS 2018 P1 Q1." }
  ],
  exam: [
    { src: "AQA 2017 P2 Q1", q: "Explain what is meant by *automation* in the context of problem solving.", marks: 2,
      ms: ["Putting models (abstractions of real-world objects/phenomena) into action to solve problems (1)", "By creating algorithms, implementing them in program code and executing the code (1)"] },
    { src: "AQA 2022 P2 Q4", q: "An engineer develops a computer simulation of a bridge to test its safety. Describe how abstraction and automation are both involved.", marks: 3,
      ms: ["Abstraction: a model of the bridge is created keeping only relevant features (loads, materials, dimensions) and removing unnecessary detail (1)", "Automation: algorithms are created that operate on the model (1)", "These are implemented as a program and executed to solve the problem — testing the bridge's safety (1)"] }
  ]
});

X("compsci:4.4.2.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "FSMs — AS every year, A-level 2017 and 2021" },
    { table: { head: ["Item", "Tariff", "What earns the marks"], rows: [
      ["Label a state-transition diagram from a scenario (AS 2017, 2022, 2023)", "4–6", "One mark per group of correct labels; a label used twice is rejected; *Max n − 1 if any errors* — so check each transition's trigger against the story before writing it"],
      ["Which strings does the FSM accept (AS 2016)", "2", "Trace each string; it is accepted only if it ends in an accepting (double-circle) state"],
      ["Describe the language accepted (AS 2016)", "3", "One mark per structural clause: *starts with zero or more 1s*; *optionally followed by a single 0*; *ends with x*"],
      ["Complete a state-transition table (2021)", "2", "Rows for each current state × input → new state; order of rows ignored"],
      ["Meaning of reaching / finishing at a state (2017)", "1 each", "Read the scenario: a non-accepting sink = *the input is not valid / has extra characters*; an accepting state = *the input is a valid X of kind Y*"]
    ]}},
    { callout: { t: "memorise", h: "Mealy vs Moore", body: "A **Mealy machine** produces its output on the **transition** (label `input | output`); the FSMs *without output* used for language recognition have **accepting states** drawn as double circles. The spec needs: states, transitions labelled with inputs, a start state, accepting states, and — for output machines — outputs on the transitions." }}
  ],
  flashcards: [
    ["What are the components of a finite state machine?", "A finite set of states, a start state, transitions labelled by input (and optionally output), and a set of accepting states (for recognisers)."],
    ["How is an accepting state drawn?", "As a double circle."],
    ["When does an FSM without output accept a string?", "When, after reading all the input, it is in an accepting state (and no undefined transition was met)."],
    ["What is a Mealy machine?", "An FSM whose outputs are produced on transitions, written input | output."],
    ["What is a state transition table?", "A table listing, for each current state and input, the new state (and output)."],
    ["What happens if a transition is not defined for an input?", "The FSM halts / rejects the input."],
    ["Describe the language accepted by: start S0; S0 –1→ S0; S0 –0→ S1; S0 –x→ S2; S1 –x→ S2; S2 accepting.", "Zero or more 1s, optionally followed by one 0, ending with x."],
    ["What can an FSM not do?", "Count without bound — it cannot recognise aⁿbⁿ because it has finitely many states (that needs a context-free grammar)."]
  ],
  quiz: [
    { q: "An FSM reads all input and ends in a non-accepting state. The string is:", opts: ["accepted", "rejected", "undefined", "partially accepted"], ans: 1, why: "Acceptance needs an accepting final state." },
    { q: "Outputs written on transitions indicate a:", opts: ["Moore machine", "Mealy machine", "Turing machine", "BNF grammar"], ans: 1, why: "Mealy = output on transition." },
    { q: "In a state transition table the columns are typically:", opts: ["state, input, next state", "input, output only", "state, memory", "tape, head"], ans: 0, why: "Plus output if any." },
    { q: "An FSM for 'strings of a and b with an even number of a' needs how many states?", opts: ["1", "2", "3", "infinitely many"], ans: 1, why: "Even / odd count of a so far." },
    { q: "Which cannot be recognised by an FSM?", opts: ["Binary numbers divisible by 3", "Strings ending in 01", "Balanced brackets to any depth", "Strings with at most one 0"], ans: 2, why: "Unbounded nesting needs a stack." },
    { q: "Reaching a 'sink' state with no exits from which no accepting state is reachable means:", opts: ["the input so far is invalid", "the input is complete", "the machine restarts", "output is produced"], ans: 0, why: "Typical 'error' state." }
  ],
  exam: [
    { level: "AS", src: "AS 2022 P1 Q2", ctx: "A vending machine accepts 20p coins and sells one item costing 40p. It has states **Idle**, **20p inserted**, **40p inserted (item available)** and **Dispensing**. Events are: insert 20p, press Vend, press Cancel (refunds and returns to Idle), item taken (returns to Idle).",
      parts: [
        { q: "Draw a state transition diagram for the machine, labelling each transition with its event. Pressing Vend when less than 40p has been inserted has no effect.", marks: 5, ms: ["Four states with Idle as the start state (1)", "Idle –insert 20p→ 20p inserted; 20p inserted –insert 20p→ 40p inserted (1)", "40p inserted –press Vend→ Dispensing; Dispensing –item taken→ Idle (1)", "press Cancel from 20p inserted and from 40p inserted → Idle (1)", "press Vend in Idle and 20p inserted loops back to the same state / no other transitions (1)", "Max 4 if any errors"] },
        { q: "Explain why a finite state machine is a suitable model for this system.", marks: 1, ms: ["The machine has a small, fixed number of conditions it can be in and moves between them only in response to defined events (1)"] }
      ] },
    { level: "AS", src: "AS 2016 P1 Q2", ctx: "An FSM has states S0 (start), S1 and S2 (accepting). Transitions: S0 on `a` → S0; S0 on `b` → S1; S1 on `b` → S1; S1 on `c` → S2; S2 on `c` → S2. Any undefined input causes rejection.",
      parts: [
        { q: "State whether each string is accepted: (i) `aabbc` (ii) `abcb` (iii) `bcc` (iv) `aa`.", marks: 2, ms: ["(i) accepted, (ii) rejected (1)", "(iii) accepted, (iv) rejected — ends in S0, not accepting (1)"] },
        { q: "Describe the language accepted by the FSM.", marks: 3, ms: ["Strings that start with zero or more `a`s (1)", "followed by one or more `b`s (1)", "followed by one or more `c`s (1)"] }
      ] },
    { src: "AQA 2021 P1 Q6.1", ctx: "An FSM has states S0 (start) and S1, both accepting. From S0, input `a` goes to S1; from S1, input `b` goes to S0. No other transitions exist.",
      parts: [
        { q: "Complete the state transition table for the machine.", marks: 2, ms: ["Row: current S0, input a, new S1 (1)", "Row: current S1, input b, new S0 (accept rows showing undefined inputs as reject) (1)"] },
        { q: "State two strings of length 3 or more that the machine accepts.", marks: 1, ms: ["e.g. `aba`, `abab`, `ababa` (any two) (1)"] }
      ] },
    { src: "AQA 2017 P1 Q2", ctx: "An FSM checks ticket codes for a festival. Valid day tickets are a letter D followed by exactly three digits; valid weekend tickets are a letter W followed by exactly four digits. State S6 is an accepting state reached only by valid day tickets; S9 is reached only by valid weekend tickets; S10 is a non-accepting state with no exits, entered on any unexpected character.",
      parts: [
        { q: "State what it means if the FSM finishes at S6.", marks: 1, ms: ["The input is a valid day ticket code (1)"] },
        { q: "State what it means if the FSM reaches S10.", marks: 1, ms: ["The input is not a valid ticket code / contains an unexpected character or extra characters (1)"] },
        { q: "State the minimum number of states, excluding S10, the machine needs, and justify your answer.", marks: 2, ms: ["10: the start state, a state after D and one after each of its three digits, a state after W and one after each of its four digits (1)", "Each digit position must be a separate state so the machine can count exactly three or four digits — an FSM has no memory other than its current state (1)"] }
      ] }
  ]
});

X("compsci:4.4.2.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Sets — 2023, 2024" },
    "One-markers: **cardinality** = *the number of elements/members in a set* (\"size\" accepted); **subsets** — remember that the **empty set is also a subset** of every set; the **size of an intersection** read from two listed sets. Two-markers ask for a **regular expression** describing a set built by **union** (`A ∪ B` → alternation `|`) or **set difference** (`A \\ B` → the strings in A not in B).",
    { callout: { t: "memorise", body: "**Set comprehension**: `{x | x ∈ ℕ ∧ x < 5}` reads *the set of x such that x is a natural number and x < 5*. **Cartesian product** A × B = all ordered pairs. **Compact set notation** for strings: `{0ⁿ1ⁿ | n ≥ 1}` = 01, 0011, 000111…" }}
  ],
  flashcards: [
    ["What is the cardinality of a set?", "The number of elements (members) in the set."],
    ["What is a subset?", "A set all of whose elements are in another set; the empty set is a subset of every set."],
    ["What is a proper subset?", "A subset that is not equal to the whole set."],
    ["Define union, intersection and difference.", "A ∪ B: in A or B (or both). A ∩ B: in both. A \\ B: in A but not in B."],
    ["What is the Cartesian product A × B?", "The set of all ordered pairs (a, b) with a ∈ A and b ∈ B; |A × B| = |A| × |B|."],
    ["Read `{x | x ∈ ℕ ∧ x mod 2 = 0}`.", "The set of natural numbers x such that x is even."],
    ["What does `{aⁿbⁿ | n ≥ 1}` denote?", "The strings ab, aabb, aaabbb, … — equal numbers of a then b."],
    ["What is the cardinality of the empty set?", "0."]
  ],
  quiz: [
    { q: "|{2, 4, 6, 8}| =", opts: ["4", "8", "20", "0"], ans: 0, why: "Four elements." },
    { q: "How many subsets does {a, b} have?", opts: ["2", "3", "4", "1"], ans: 2, why: "{}, {a}, {b}, {a, b} — 2ⁿ." },
    { q: "{1, 2, 3} ∩ {2, 3, 4} has cardinality:", opts: ["1", "2", "3", "4"], ans: 1, why: "{2, 3}." },
    { q: "{a, b} × {1, 2} contains how many pairs?", opts: ["2", "4", "6", "8"], ans: 1, why: "2 × 2." },
    { q: "The set {0ⁿ1ⁿ | n ≥ 1}:", opts: ["is regular", "is not regular — needs matching counts", "is finite", "contains 10"], ans: 1, why: "An FSM cannot count unboundedly." },
    { q: "{x | x ∈ ℤ ∧ −1 ≤ x ≤ 1} =", opts: ["{0}", "{−1, 0, 1}", "{−1, 1}", "ℤ"], ans: 1, why: "Integers from −1 to 1." }
  ],
  exam: [
    { src: "AQA 2024 P1 Q4", ctx: "Let R = {a, ab, b, bb} and T = {b, bb, bbb, …} (one or more b's).",
      parts: [
        { q: "State what is meant by the cardinality of a set, and give the cardinality of R.", marks: 2, ms: ["The number of elements / members in a set (1)", "4 (1)"] },
        { q: "A student says the subsets of {a, b} are {a}, {b} and {a, b}. Explain what is missing.", marks: 1, ms: ["The empty set {} / Ø is also a subset (1)"] },
        { q: "State the cardinality of R ∩ T.", marks: 1, ms: ["2 (b and bb) (1)"] },
        { q: "Write a regular expression that describes the set R ∪ T.", marks: 2, ms: ["Expression covers a and ab, e.g. `ab?` or `a|ab` (1)", "Combined with `b+` using alternation: `ab?|b+` (1)", "Max 1 if any errors"] }
      ] },
    { src: "AQA 2023 P1 Q4.3", q: "Let A = {x | x ∈ ℕ ∧ x < 4} and B = {2, 3, 5}. Write out A, A ∪ B and A \\ B, and state |A × B|.", marks: 3,
      ms: ["A = {0, 1, 2, 3}; A ∪ B = {0, 1, 2, 3, 5} (1)", "A \\ B = {0, 1} (1)", "|A × B| = 4 × 3 = 12 (1)"] }
  ]
});

X("compsci:4.4.2.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Regular expressions — 2017, 2019, 2021, 2023, 2024" },
    { table: { head: ["Item", "Points"], rows: [
      ["Meaning of a metacharacter (1 mark each)", "`*` zero or more of the preceding element · `+` one or more · `?` zero or one / optional · `|` alternation — *either* the element before *or* the element after"],
      ["Which strings match (3 marks)", "Test each string against the expression; marks are banded on the number of correct rows, so do every row"],
      ["Write an expression for a described format (2017 postcode, 4 marks)", "One mark per structural component in order: `\\a\\a?` one or two letters, `\\d`, `(\\a|\\d)?` optional letter-or-digit, `\\d\\a\\a`; a wrong repetition (`\\a*` allowing more than two) loses that component"],
      ["Expression matching an FSM (2021)", "Read the loops as `( … )*`: `a(ba)*|b(ab)*`; `ba*` is rejected where `(ba)*` is meant — bracket the group"],
      ["Expression for a union / difference of sets (2023, 2024)", "Union → `|`; difference → describe only the remaining strings, e.g. `(ab|b)(bb)*`"]
    ]}},
    { callout: { t: "warn", body: "Brackets are the commonest lost mark: `ab*` is *a then any number of b*; `(ab)*` is *any number of ab*. Write the group you mean." }}
  ],
  flashcards: [
    ["What does `*` mean in a regular expression?", "Zero or more of the preceding element."],
    ["What does `+` mean?", "One or more of the preceding element."],
    ["What does `?` mean?", "Zero or one — the preceding element is optional."],
    ["What does `|` mean?", "Alternation — either the element before or the element after."],
    ["Difference between `ab*` and `(ab)*`?", "`ab*` = a followed by any number of b; `(ab)*` = any number of repetitions of ab (including none)."],
    ["Write a regex for strings of a's and b's that alternate, starting with either.", "`a(ba)*|b(ab)*`"],
    ["Regex for a UK postcode: 1–2 letters, digit, optional letter-or-digit, digit, two letters?", "`\\a\\a?\\d(\\a|\\d)?\\d\\a\\a`"],
    ["Which strings match `1|01+`?", "`1`, and `0` followed by one or more 1s: 01, 011, 0111…"]
  ],
  quiz: [
    { q: "`colou?r` matches:", opts: ["color and colour", "colouur", "colr", "only colour"], ans: 0, why: "? makes the u optional." },
    { q: "`(ab)+` matches:", opts: ["the empty string", "ab, abab, ababab…", "a, b", "abb"], ans: 1, why: "One or more repetitions of the group." },
    { q: "Which does NOT match `1|01+`?", opts: ["1", "01", "0111", "10"], ans: 3, why: "`10` starts with 1 then has a trailing 0 — neither alternative." },
    { q: "`a(bb)*` matches:", opts: ["ab", "abb, abbbb, a", "abbb", "bb"], ans: 1, why: "a followed by an even number of b's, including zero." },
    { q: "The `|` metacharacter means:", opts: ["repeat", "either the element before or after", "optional", "any character"], ans: 1, why: "Alternation." },
    { q: "Regex for 'a followed by an even, non-zero number of b's, or just an even non-zero number of b's':", opts: ["a?(bb)+", "ab+", "(ab)+", "a|b"], ans: 0, why: "Optional a then one or more bb pairs." }
  ],
  exam: [
    { src: "AQA 2019 P1 Q4", ctx: "A regular language is defined by the regular expression `1|01+`.",
      parts: [
        { q: "State the functionality of the `*` metacharacter and the `?` metacharacter.", marks: 2, ms: ["`*`: zero or more of the preceding element (1)", "`?`: zero or one of the preceding element / optional (1)"] },
        { q: "State whether each string belongs to the language: `1`, `0`, `01`, `011`, `10`, `0111`, `001`.", marks: 3, ms: ["1 Y, 0 N, 01 Y, 011 Y (1)", "10 N, 0111 Y (1)", "001 N — all seven correct (1)"] }
      ] },
    { src: "AQA 2017 P1 Q2.4", q: "A product code consists of exactly two upper-case letters, followed by two or three digits, followed by an optional hyphen and, if the hyphen is present, exactly one further letter. Write a regular expression for a valid product code, using `\\a` for a letter and `\\d` for a digit.", marks: 4,
      ms: ["Starts with exactly two letters: `\\a\\a` (1)", "Two or three digits: `\\d\\d\\d?` (1)", "Optional hyphen-letter group: `(-\\a)?` (1)", "Whole expression correct: `\\a\\a\\d\\d\\d?(-\\a)?` (1)", "Max 3 if the final answer is not fully correct"] },
    { src: "AQA 2021 P1 Q6.2", q: "An FSM accepts strings that alternate between `x` and `y`, starting with either letter, of length at least one. Write a regular expression that matches exactly the strings the FSM accepts.", marks: 3,
      ms: ["Uses two `*` metacharacters and one `|` (1)", "Groups `(yx)*` and `(xy)*` correctly bracketed — `yx*` rejected (1)", "Fully correct: `x(yx)*|y(xy)*` (1)", "Max 2 if not fully correct"] },
    { src: "AQA 2024 P1 Q4.6", q: "Let R = {a, ab, b, bb} and T = {b, bb, bbb, …}. Write a regular expression for the set of strings that consist of an element of R followed by zero or more `bb` pairs, excluding those that begin with `a` alone (i.e. `a` not followed by `b`).", marks: 2,
      ms: ["Expression contains `ab|b` (or `a?b`) (1)", "Followed by `(bb)*` — `bb*` rejected: `(ab|b)(bb)*` (1)", "Max 1 if any errors"] }
  ]
});

X("compsci:4.4.2.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Is it regular? — 2020, 2023" },
    "True/false (2020): *all regular languages can be represented by an FSM without outputs* — **true**; *the set of strings of a regular language is always finite* — **false** (`a*` is infinite); *some languages representable in BNF are not regular* — **true**. The 2023 three-marker listed six languages: a language is regular exactly when an FSM (equivalently a regular expression) recognises it — anything that needs **unbounded counting or matching** (aⁿbⁿ, balanced brackets, palindromes) is not.",
    { callout: { t: "memorise", body: "**Regular language** = a language that can be represented by a regular expression = recognised by a finite state machine. Every finite language is regular; a regular language may be infinite." }}
  ],
  flashcards: [
    ["Define a regular language.", "A language that can be represented by a regular expression — equivalently, recognised by a finite state machine."],
    ["Is every regular language finite?", "No — a* describes infinitely many strings."],
    ["Can every regular language be recognised by an FSM without outputs?", "Yes."],
    ["Are there BNF-definable languages that are not regular?", "Yes — e.g. balanced brackets; BNF (context-free) is strictly more powerful."],
    ["Is {aⁿbⁿ | n ≥ 0} regular?", "No — recognising it requires counting the a's, which needs unbounded memory."],
    ["Is 'binary strings with an even number of 1s' regular?", "Yes — a two-state FSM tracks parity."],
    ["Is the set of palindromes over {a, b} regular?", "No — matching the first half against the second needs a stack."],
    ["Why are finite languages always regular?", "List every string with | — that is a regular expression."]
  ],
  quiz: [
    { q: "Which language is regular?", opts: ["Balanced brackets", "aⁿbⁿ", "Strings ending in 00", "Palindromes"], ans: 2, why: "A three-state FSM recognises 'ends in 00'." },
    { q: "'All regular languages are finite' is:", opts: ["true", "false"], ans: 1, why: "a* is infinite and regular." },
    { q: "Every regular language can be recognised by:", opts: ["a Turing machine only", "an FSM without outputs", "no machine", "a stack machine only"], ans: 1, why: "Definition equivalence." },
    { q: "BNF can describe languages that regular expressions cannot. This is:", opts: ["true", "false"], ans: 0, why: "Context-free ⊃ regular." },
    { q: "'Strings with equal numbers of 0s and 1s' is:", opts: ["regular", "not regular", "finite", "empty"], ans: 1, why: "Requires unbounded counting." },
    { q: "Which is the best evidence a language is regular?", opts: ["It has infinitely many strings", "You can draw an FSM for it", "It is in BNF", "It uses letters"], ans: 1, why: "FSM ⇔ regular." }
  ],
  exam: [
    { src: "AQA 2023 P1 Q4.1", q: "State whether each language is regular: A = strings of 0s and 1s ending in 1; B = {aⁿbⁿ | n ≥ 1}; C = strings over {a, b} of length exactly 4; D = palindromes over {a, b}; E = strings with an even number of a's; F = correctly nested brackets.", marks: 3,
      ms: ["A Y, C Y (1)", "B N, D N (1)", "E Y, F N — all six correct (1)", "Banded: 1 mark any two rows, 2 marks any four, 3 marks all"] },
    { src: "AQA 2020 P1 Q2.1", q: "State whether each statement is true or false: (i) all regular languages can be represented using a finite state machine without outputs; (ii) the set of strings defined by a regular language is always finite; (iii) there are some languages that can be represented in BNF that are not regular.", marks: 2,
      ms: ["(i) true, (ii) false (1)", "(iii) true — all three correct (1)"] }
  ]
});

X("compsci:4.4.3.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "BNF — 2017, 2020" },
    { table: { head: ["Item", "Points"], rows: [
      ["Write a recursive rule (2017: natural number)", "`<natural> ::= <digit> | <digit><natural>` — one mark for the **non-recursive case**, one for the **recursive case**; a missing `|` caps at 1"],
      ["Which strings are valid (2020)", "Derive each string from `<sentence>`; a string is valid only if every symbol is produced by a rule"],
      ["Modify a rule to admit a new form", "Add an alternative with `|` — one rule only; two rules for the same non-terminal are rejected"],
      ["Combine two rules into one", "`<sentence> ::= <np><v> | <v><np>`"],
      ["Count the sentences a grammar defines (2020)", "Multiply the number of choices at each position (8 × 4 × 3 × 8 × 4); a **recursive** rule defines **infinitely** more"],
      ["Check a value against syntax diagrams (2017)", "Follow the diagram left to right; every path must be legal"]
    ]}},
    { callout: { t: "memorise", body: "**Why BNF and not regex?** BNF rules can be **recursive**, so they can define **context-free** languages such as nested brackets and arithmetic expressions, which no regular expression / FSM can. Terminal symbols are in quotes or plain; non-terminals in `< >`; `::=` means *is defined as*; `|` separates alternatives." }}
  ],
  flashcards: [
    ["What does `::=` mean in BNF?", "'Is defined as' — the non-terminal on the left can be replaced by the sequence on the right."],
    ["What is a terminal symbol?", "A symbol that appears in the final string and cannot be expanded further (e.g. a digit or keyword)."],
    ["What is a non-terminal symbol?", "A symbol in angle brackets that is defined by a rule and can be expanded."],
    ["Write a BNF rule for a natural number.", "`<natural> ::= <digit> | <digit><natural>` with `<digit> ::= 0|1|…|9`."],
    ["Why can BNF define languages that regular expressions cannot?", "BNF rules can be recursive, allowing unbounded nesting (context-free languages)."],
    ["How many sentences does `<s> ::= <a><b>` define if <a> has 3 options and <b> has 5?", "15."],
    ["How many sentences does a recursive rule define?", "Infinitely many."],
    ["What is a syntax diagram?", "A graphical form of BNF: boxes for symbols joined by arrows showing allowed sequences and loops."]
  ],
  quiz: [
    { q: "`<int> ::= <digit> | <digit><int>` is:", opts: ["invalid", "recursive", "a regular expression", "a terminal"], ans: 1, why: "It refers to itself." },
    { q: "In `<expr> ::= <term> | <expr> + <term>`, `+` is a:", opts: ["non-terminal", "terminal", "rule", "metacharacter"], ans: 1, why: "Literal symbol in the output." },
    { q: "Balanced brackets can be defined in BNF but not by a regex because:", opts: ["regex has no brackets", "BNF allows recursion / unbounded nesting", "BNF is newer", "regex is case-sensitive"], ans: 1, why: "Context-free power." },
    { q: "`<greeting> ::= hello <name> | hi <name>`; `<name> ::= Ann | Bo`. How many greetings?", opts: ["2", "3", "4", "infinite"], ans: 2, why: "2 × 2." },
    { q: "To allow `<sentence>` to also be just a noun, you:", opts: ["write a second rule for <sentence>", "add `| <n>` to the existing rule", "delete the rule", "use a regex"], ans: 1, why: "One rule with alternatives." },
    { q: "In a syntax diagram a loop back represents:", opts: ["recursion / repetition", "a terminal", "an error", "alternation"], ans: 0, why: "Repetition of the looped part." }
  ],
  exam: [
    { src: "AQA 2017 P1 Q1.2", q: "Using the rule `<digit> ::= 0|1|2|3|4|5|6|7|8|9`, write a BNF production rule for `<natural>`, a natural number consisting of one or more digits.", marks: 2,
      ms: ["Non-recursive case `<digit>` (1)", "Recursive case `<digit><natural>` joined with `|`: `<natural> ::= <digit> | <digit><natural>` (1)", "Max 1 if any error, e.g. missing |"] },
    { src: "AQA 2020 P1 Q2", ctx: "A grammar for a toy language: `<sentence> ::= <np><v>` ; `<np> ::= <d><n>` ; `<d> ::= the | a` ; `<n> ::= cat | dog | robot` ; `<v> ::= sleeps | runs`.",
      parts: [
        { q: "State whether each string is a valid sentence: `the cat sleeps`, `a robot`, `dog runs`, `a dog runs`.", marks: 1, ms: ["Y, N, N, Y (1)"] },
        { q: "Modify the grammar so that a sentence may also be a noun on its own followed by a verb, e.g. `robot runs`. Write the single modified rule.", marks: 1, ms: ["`<np> ::= <d><n> | <n>` (or `<sentence> ::= <np><v> | <n><v>`) — one rule only (1)"] },
        { q: "Calculate the number of different sentences the original grammar defines.", marks: 2, ms: ["Noun phrases 2 × 3 = 6 (1)", "6 × 2 verbs = 12 (1)"] },
        { q: "The rule for `<np>` is changed to `<np> ::= <d><n> | <d><n> and <np>`. State how many sentences the grammar now defines, and why.", marks: 1, ms: ["Infinitely many — the rule is recursive (1)"] }
      ] },
    { src: "AQA 2024 P2 Q6", q: "Explain why BNF is used to define the syntax of programming languages rather than regular expressions.", marks: 2,
      ms: ["Programming languages contain nested / recursive structures such as bracketed expressions and nested blocks (1)", "BNF rules can be recursive and so define these context-free structures; regular expressions (FSMs) cannot count nesting to arbitrary depth (1)"] }
  ]
});

})(KOS.content.extend);
