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
    ["Three boxes are labelled Apples, Oranges, Both — every label wrong. Which box do you open to fix all labels?", "The one labelled Both: its fruit is what it really is (say apples); then the box labelled Apples must be oranges and the box labelled Oranges must be both.", 8],
    ["Only one of the statements is true, and Statement 1 says 'Statement 5 is true'. Can Statement 1 be true?", "No — it would make two statements true, contradicting the premise.", 9],
    ["What does a 'No' answer to 'Is your shape red?' let you deduce?", "Eliminate every red shape; what remains is the candidate set — record it explicitly before the next question.", 10],
    ["What is problem solving in the specification's sense?", "Identifying a problem, decomposing it, representing it and devising an algorithm to solve it — a systematic approach rather than guessing.", 11],
    ["Why write deductions as 'because … so …'?", "The mark is for the justification: the examiner needs to see the reasoning, not just the answer.", 12],
    ["What is meant by 'the search space' of a puzzle?", "The set of all possible configurations; each deduction shrinks it.", 13],
    ["How do you check a puzzle answer?", "Substitute it back into every clue and confirm none is violated.", 14],
    ["What is a logical contradiction in a puzzle?", "A case in which some statement would have to be both true and false — that case is impossible and can be discarded.", 15]
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
    ["Define the term algorithm.", "A sequence of unambiguous steps that can be followed to solve a problem or complete a task, and which terminates.", 8],
    ["What is a trace table?", "A table recording the values of every variable (and any output) after each statement or iteration, used to follow an algorithm by hand.", 9],
    ["Trace: `t ← 0; FOR i ← 1 TO 3: t ← t + i × i`. Final t?", "1 + 4 + 9 = 14.", 10],
    ["What does `Total ← Total × 16 + Value` inside a loop over hex digits compute?", "The denary value of a hexadecimal string, one digit at a time (Horner's method).", 11],
    ["What is a sentinel value?", "A special input (e.g. −1) that signals the end of data and terminates a loop.", 12],
    ["Why might an algorithm keep looping after it has found its answer?", "The loop condition only checks the counter, not a Found/Done flag — an inefficiency examiners ask you to identify.", 13],
    ["Describe the purpose of `IF n MOD d = 0 THEN Prime ← FALSE` for d from 2 to n − 1.", "A primality test: any divisor found means n is not prime.", 14],
    ["What should you write in a trace table cell when a value does not change?", "Leave it blank (or repeat only if the scheme says 'I. repeated values').", 15]
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
    ["What are the components of a finite state machine?", "A finite set of states, a start state, transitions labelled by input (and optionally output), and a set of accepting states (for recognisers).", 10],
    ["When does an FSM without output accept a string?", "When, after reading all the input, it is in an accepting state (and no undefined transition was met).", 12],
    ["What is a Mealy machine?", "An FSM whose outputs are produced on transitions, written input | output.", 13],
    ["What happens if a transition is not defined for an input?", "The FSM halts / rejects the input.", 15],
    ["Describe the language accepted by: start S0; S0 –1→ S0; S0 –0→ S1; S0 –x→ S2; S1 –x→ S2; S2 accepting.", "Zero or more 1s, optionally followed by one 0, ending with x.", 16],
    ["What can an FSM not do?", "Count without bound — it cannot recognise aⁿbⁿ because it has finitely many states (that needs a context-free grammar).", 17]
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
    ["What is the cardinality of a set?", "The number of elements (members) in the set.", 10],
    ["What is a subset?", "A set all of whose elements are in another set; the empty set is a subset of every set.", 11],
    ["Define union, intersection and difference.", "A ∪ B: in A or B (or both). A ∩ B: in both. A \\ B: in A but not in B.", 13],
    ["Read `{x | x ∈ ℕ ∧ x mod 2 = 0}`.", "The set of natural numbers x such that x is even.", 15],
    ["What does `{aⁿbⁿ | n ≥ 1}` denote?", "The strings ab, aabb, aaabbb, … — equal numbers of a then b.", 16],
    ["What is the cardinality of the empty set?", "0.", 17]
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
    ["Difference between `ab*` and `(ab)*`?", "`ab*` = a followed by any number of b; `(ab)*` = any number of repetitions of ab (including none).", 14],
    ["Write a regex for strings of a's and b's that alternate, starting with either.", "`a(ba)*|b(ab)*`", 15],
    ["Regex for a UK postcode: 1–2 letters, digit, optional letter-or-digit, digit, two letters?", "`\\a\\a?\\d(\\a|\\d)?\\d\\a\\a`", 16],
    ["Which strings match `1|01+`?", "`1`, and `0` followed by one or more 1s: 01, 011, 0111…", 17]
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
    ["Define a regular language.", "A language that can be represented by a regular expression — equivalently, recognised by a finite state machine.", 8],
    ["Is every regular language finite?", "No — a* describes infinitely many strings.", 9],
    ["Are there BNF-definable languages that are not regular?", "Yes — e.g. balanced brackets; BNF (context-free) is strictly more powerful.", 11],
    ["Is {aⁿbⁿ | n ≥ 0} regular?", "No — recognising it requires counting the a's, which needs unbounded memory.", 12],
    ["Is 'binary strings with an even number of 1s' regular?", "Yes — a two-state FSM tracks parity.", 13],
    ["Is the set of palindromes over {a, b} regular?", "No — matching the first half against the second needs a stack.", 14],
    ["Why are finite languages always regular?", "List every string with | — that is a regular expression.", 15]
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
    ["What does `::=` mean in BNF?", "'Is defined as' — the non-terminal on the left can be replaced by the sequence on the right.", 10],
    ["What is a terminal symbol?", "A symbol that appears in the final string and cannot be expanded further (e.g. a digit or keyword).", 11],
    ["What is a non-terminal symbol?", "A symbol in angle brackets that is defined by a rule and can be expanded.", 12],
    ["Write a BNF rule for a natural number.", "`<natural> ::= <digit> | <digit><natural>` with `<digit> ::= 0|1|…|9`.", 13],
    ["Why can BNF define languages that regular expressions cannot?", "BNF rules can be recursive, allowing unbounded nesting (context-free languages).", 14],
    ["How many sentences does `<s> ::= <a><b>` define if <a> has 3 options and <b> has 5?", "15.", 15],
    ["How many sentences does a recursive rule define?", "Infinitely many.", 16],
    ["What is a syntax diagram?", "A graphical form of BNF: boxes for symbols joined by arrows showing allowed sequences and loops.", 17]
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
