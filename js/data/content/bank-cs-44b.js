/* Kurenai OS — past-paper bank: AQA 7517 §4.4 Theory of computation (part B:
   complexity, tractability, computability, the halting problem, Turing
   machines). Modelled on A-level Paper 1 Section A, June 2017–2025. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.4.4.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Comparing algorithms — the complexity table" },
    "The 2022 three-marker was a table: **binary tree search O(log n)**, **bubble sort O(n²)**, **linear search O(n)**, **merge sort O(n log n)**. Missing brackets, a missing *O* or a missing subscript 2 are ignored; `O(log n)` for merge sort is not enough. 2017 asked *which listed algorithm is O(n log n)* (merge sort) and *how many of the listed algorithms solve tractable problems* (all of them — every standard search and sort is polynomial).",
    { callout: { t: "tip", body: "When asked to *compare* two algorithms, give **time complexity**, **space/memory** (merge sort needs O(n) extra; bubble sort is in place) and **preconditions** (binary search needs sorted data). Three axes, three marks." }}
  ],
  flashcards: [
    ["Give the time complexity of linear search, binary search, bubble sort and merge sort.", "O(n), O(log n), O(n²), O(n log n)."],
    ["What two measures are used to compare algorithms?", "Time complexity (how running time grows with input size n) and space complexity (how memory grows)."],
    ["Which of the standard algorithms needs extra memory proportional to n?", "Merge sort (for the merged lists); bubble sort is in place."],
    ["Which standard algorithm requires sorted input?", "Binary search."],
    ["Why compare algorithms by growth rate rather than by timing?", "Timings depend on hardware and implementation; growth rate describes how the algorithm scales for any machine."],
    ["Between O(n log n) and O(n²), which grows faster?", "O(n²)."],
    ["What is the space complexity of a recursive algorithm of depth d?", "O(d) for the stack frames."],
    ["Which is better for a nearly sorted list: bubble sort with a flag or merge sort?", "Bubble sort with a flag — O(n) best case; merge sort is always O(n log n)."]
  ],
  quiz: [
    { q: "Which algorithm has time complexity O(n log n)?", opts: ["Bubble sort", "Merge sort", "Linear search", "Binary search"], ans: 1, why: "Divide and conquer sort." },
    { q: "Which needs the most extra memory?", opts: ["Bubble sort", "Linear search", "Merge sort", "Binary search"], ans: 2, why: "O(n) for merging." },
    { q: "Sorting 10 000 items: bubble sort ≈ 10⁸ operations; merge sort ≈", opts: ["10⁴", "1.3 × 10⁵", "10⁶", "10⁸"], ans: 1, why: "n log₂ n ≈ 10 000 × 13.3." },
    { q: "All of linear search, binary search, bubble sort and merge sort are:", opts: ["intractable", "tractable (polynomial)", "exponential", "non-computable"], ans: 1, why: "Polynomial or better." },
    { q: "'O(log n)' for merge sort scores:", opts: ["full marks", "nothing — NE", "half", "bonus"], ans: 1, why: "It must be O(n log n)." },
    { q: "Comparing algorithms fairly uses:", opts: ["stopwatch timings", "growth rate as n increases", "lines of code", "the language"], ans: 1, why: "Machine-independent." }
  ],
  exam: [
    { src: "AQA 2017 P1 Q3", ctx: "Four algorithms are listed: bubble sort, merge sort, linear search, binary search.",
      parts: [
        { q: "State which of the algorithms has a time complexity of O(n log n).", marks: 1, ms: ["Merge sort (1)"] },
        { q: "State how many of the four algorithms solve tractable problems, and justify your answer.", marks: 2, ms: ["All four (1)", "Each has polynomial (or better) time complexity — none is exponential (1)"] }
      ] },
    { src: "AQA 2024 P1 Q2", q: "A developer must choose between merge sort and bubble sort for sorting a list of 5 000 000 records held in memory. Compare the two algorithms and recommend one.", marks: 4,
      ms: ["Merge sort is O(n log n) whereas bubble sort is O(n²) (1)", "For n = 5 000 000 bubble sort needs of the order of 2.5 × 10¹³ operations, merge sort about 10⁸ — vastly fewer (1)", "Merge sort needs additional memory proportional to n; bubble sort sorts in place (1)", "Recommend merge sort: the time saving dominates and memory for a second copy is available (1)"] }
  ]
});

X("compsci:4.4.4.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Permutations and the maths of growth (2020)" },
    "*How many ways can 4 athletes be assigned to 4 lanes?* → **4 × 3 × 2 × 1 = 24**; *for n athletes* → **n!**; *why is the number of anagrams of a word not n!?* → **characters may repeat**, so some permutations are duplicates. The spec also expects you to compare growth: for large n, **constant < logarithmic < linear < polynomial < exponential < factorial**.",
    { callout: { t: "memorise", body: "**Constant-time** (2023, 2 marks): *as the size of the input increases, the time taken remains the same.* A linear function f(n) = an + b; polynomial nᵏ; exponential kⁿ; logarithmic log n. Know how to read them off a graph and which dominates." }}
  ],
  flashcards: [
    ["How many permutations of n distinct items are there?", "n! = n × (n − 1) × … × 1."],
    ["Why does a word with repeated letters have fewer than n! distinct anagrams?", "Swapping identical letters gives the same string, so some permutations are duplicates."],
    ["Order these by growth for large n: n², 2ⁿ, log n, n!, n.", "log n < n < n² < 2ⁿ < n!."],
    ["What is a linear function?", "f(n) = an + b — output grows in direct proportion to n."],
    ["What is an exponential function?", "f(n) = kⁿ — the variable is in the exponent; doubles (or more) with each unit increase of n."],
    ["What is a logarithmic function?", "f(n) = log n — grows very slowly; doubling n adds a constant."],
    ["What does 'constant time' mean?", "The time taken does not change as the input size increases."],
    ["Evaluate 2¹⁰ and log₂ 1024.", "1024 and 10."]
  ],
  quiz: [
    { q: "Number of ways to seat 5 people in 5 chairs:", opts: ["25", "120", "5", "10"], ans: 1, why: "5! = 120." },
    { q: "Which grows fastest as n increases?", opts: ["n³", "3ⁿ", "n log n", "log n"], ans: 1, why: "Exponential beats any polynomial." },
    { q: "Distinct anagrams of BOOK:", opts: ["24", "12", "4", "6"], ans: 1, why: "4!/2! = 12 because O repeats." },
    { q: "Doubling n for an O(log n) algorithm adds:", opts: ["double the time", "a constant amount", "n steps", "nothing"], ans: 1, why: "log(2n) = log n + 1." },
    { q: "'Time stays the same as input grows' describes:", opts: ["O(n)", "O(1)", "O(log n)", "O(n²)"], ans: 1, why: "Constant time." },
    { q: "An algorithm with 2ⁿ steps for n = 30 needs roughly:", opts: ["60 steps", "900 steps", "10⁹ steps", "30! steps"], ans: 2, why: "2³⁰ ≈ 1.07 × 10⁹." }
  ],
  exam: [
    { src: "AQA 2020 P1 Q3", ctx: "A brute-force program tries every possible assignment of athletes to lanes.",
      parts: [
        { q: "State the number of different ways 4 athletes can be assigned to 4 lanes.", marks: 1, ms: ["4 × 3 × 2 × 1 = 24 (1)"] },
        { q: "State, in terms of n, the number of ways n athletes can be assigned to n lanes.", marks: 1, ms: ["n! (factorial of n) (1)"] },
        { q: "A similar program lists every anagram of a word of n characters. Explain why the number of distinct anagrams may be less than n!.", marks: 1, ms: ["The word may contain repeated characters, so some of the permutations are duplicates (1)"] }
      ] },
    { src: "AQA 2023 P1 Q3.7", q: "Explain what is meant by an algorithm having constant time complexity.", marks: 2,
      ms: ["As the size of the input increases (1)", "the time taken remains the same (1)"] }
  ]
});

X("compsci:4.4.4.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Big-O phrasing that scores" },
    { table: { head: ["Complexity", "Knowledge mark", "Understanding mark — say it like this"], rows: [
      ["Linear search", "O(n)", "as the list grows, the (maximum) number of comparisons grows at the same rate / the loop repeats n times / in the worst case n comparisons"],
      ["Binary search / BST", "O(log n)", "each comparison halves the list still to be searched / doubling the list adds one comparison / the increase gets smaller and smaller"],
      ["Bubble sort", "O(n²)", "n items examined per pass × up to n passes"],
      ["Merge sort", "O(n log n)", "log n levels of splitting, n work to merge each level"],
      ["Constant", "O(1)", "time stays the same as the input grows"]
    ]}},
    { callout: { t: "warn", body: "Big-O is the **worst case** by default. Bubble sort with a flag has best case O(n) — say *best case* if you mean it." }}
  ],
  flashcards: [
    ["What does Big-O notation describe?", "The upper bound (worst case) on how an algorithm's time or space grows with input size n, ignoring constants and lower-order terms."],
    ["Simplify O(3n² + 10n + 7).", "O(n²)."],
    ["Why are constants dropped in Big-O?", "For large n the highest-order term dominates; constants depend on hardware, not the algorithm."],
    ["Which order is O(2ⁿ)?", "Exponential — e.g. naive recursive Fibonacci, brute-force subset enumeration."],
    ["Why is O(n log n) the practical floor for comparison sorting?", "Any comparison sort must distinguish n! orderings, needing log₂(n!) ≈ n log n comparisons."],
    ["What order is nested loops each running n times?", "O(n²)."],
    ["What order is a loop that halves the problem each iteration?", "O(log n)."],
    ["Order of complexity for accessing an array element by index?", "O(1)."]
  ],
  quiz: [
    { q: "O(5n + 20) simplifies to:", opts: ["O(n)", "O(5n)", "O(20)", "O(n²)"], ans: 0, why: "Drop constants." },
    { q: "Two nested loops over n items give:", opts: ["O(n)", "O(2n)", "O(n²)", "O(log n)"], ans: 2, why: "n × n." },
    { q: "Which is the slowest-growing?", opts: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], ans: 3, why: "Constant." },
    { q: "Naive recursive Fibonacci is:", opts: ["O(n)", "O(n²)", "O(2ⁿ)", "O(log n)"], ans: 2, why: "Two calls per call — exponential." },
    { q: "'Each comparison halves the remaining list' justifies:", opts: ["O(n)", "O(log n)", "O(n²)", "O(1)"], ans: 1, why: "Halving ⇒ logarithm." },
    { q: "Big-O describes:", opts: ["exact running time", "growth rate in the worst case", "memory only", "the best case"], ans: 1, why: "Asymptotic upper bound." }
  ],
  exam: [
    { src: "AQA 2020 P1 Q3.6", q: "State the time complexity of a linear search and explain why it has this complexity.", marks: 2,
      ms: ["O(n) (1)", "There is a loop that repeats n times / as the size of the list increases the time taken increases at the same rate (1)"] },
    { src: "AQA 2023 P1 Q3", q: "An algorithm contains a loop that runs n times, and inside it a second loop that runs n times. A third, separate loop runs log n times. State the time complexity of the whole algorithm and explain your answer.", marks: 3,
      ms: ["O(n²) (1)", "The nested loops give n × n operations (1)", "The log n loop is of lower order and is ignored because n² dominates for large n (1)"] },
    { src: "AQA 2025 P2 Q11.3", q: "A function computes the nth Fibonacci number by calling itself twice. Explain why its time complexity is exponential.", marks: 2,
      ms: ["Each application of the function generates two further applications, so the number of calls roughly doubles at each level (1)", "The same values are recalculated many times; the number of calls grows as O(2ⁿ) (1)"] }
  ]
});

X("compsci:4.4.4.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Tractable / intractable — asked most years" },
    { kv: [
      ["Intractable problem (2020, 2 marks)", "A problem that **can be solved**, but **not in a reasonable amount of time as the problem size increases** / has **exponential (or worse)** time complexity / has no polynomial-time solution"],
      ["Why searching / sorting is tractable (2023, 2025)", "It has a **polynomial (or better)** time-complexity solution / it does not have exponential complexity — \"can be solved in a reasonable time\" alone is NE"],
      ["Tractability does not depend on n (2019)", "A problem does not *change* from tractable to intractable as the size grows; intractability is about the growth *rate*"],
      ["Which complexities are intractable (2020)", "O(2ⁿ), O(n!) — anything exponential or worse; O(n²), O(n³) are polynomial and tractable"],
      ["Approaches to an intractable problem (2019, 2023)", "**Heuristics** — rules of thumb / knowledge of the domain giving a good but not necessarily optimal solution; **relax the constraints** / solve a simpler version; **reduce the search space**"]
    ]}
  ],
  flashcards: [
    ["Define a tractable problem.", "One that has a polynomial-time (or better) algorithm — solvable in reasonable time even as n grows."],
    ["Define an intractable problem.", "One that can be solved, but not in a reasonable time as the problem size increases — only exponential (or worse) algorithms exist."],
    ["Give an example of an intractable problem.", "The travelling salesman problem (optimal tour) — O(n!) by brute force."],
    ["How can intractable problems still be tackled?", "Heuristics that give a good-enough solution; relaxing constraints / solving a simpler version; reducing the search space."],
    ["What is a heuristic?", "A rule of thumb / knowledge of the problem domain used to find a good, probably not optimal, solution quickly."],
    ["Is O(n³) tractable?", "Yes — polynomial."],
    ["Does a problem become intractable when n gets large?", "No — tractability is a property of the growth rate, not of a particular n."],
    ["Why is 'can be solved in reasonable time' not enough as a definition?", "The examiners want the reason: polynomial (or better) complexity."]
  ],
  quiz: [
    { q: "Which time complexity indicates an intractable problem?", opts: ["O(n²)", "O(n log n)", "O(2ⁿ)", "O(log n)"], ans: 2, why: "Exponential." },
    { q: "An intractable problem:", opts: ["cannot be solved", "can be solved but not in reasonable time for large n", "has no algorithm", "is always small"], ans: 1, why: "Solvable but impractical." },
    { q: "Sorting is tractable because:", opts: ["lists are small", "it has a polynomial-time algorithm", "it uses a computer", "it is fast"], ans: 1, why: "The accepted reason." },
    { q: "A heuristic:", opts: ["guarantees the optimum", "finds a good solution using domain knowledge, possibly not optimal", "is exponential", "is a data structure"], ans: 1, why: "Definition." },
    { q: "'The problem becomes intractable when n > 1000' is:", opts: ["correct", "wrong — tractability is about growth rate", "correct for sorting", "a heuristic"], ans: 1, why: "2019 P1 Q1.2." },
    { q: "Which is a way to 'solve' an intractable problem in practice?", opts: ["Buy a faster CPU", "Relax constraints / solve a simpler version", "Use recursion", "Add more loops"], ans: 1, why: "Hardware cannot beat exponential growth." }
  ],
  exam: [
    { src: "AQA 2020 P1 Q3.4", q: "Explain what is meant by an *intractable problem*.", marks: 2,
      ms: ["A problem that can be solved (1)", "but not in a reasonable amount of time as the problem size increases / has exponential (or worse) time complexity / has no polynomial-time solution (1)"] },
    { src: "AQA 2019 P1 Q1.3", q: "Describe two approaches a programmer could take to obtain a usable solution to an intractable problem.", marks: 2,
      ms: ["Use a heuristic — an approach based on experience / knowledge of the domain that gives a close-to-optimal solution (1)", "Relax some of the constraints / solve a simpler version of the problem / reduce the size of the search space (1)"] },
    { src: "AQA 2019 P1 Q1.2", q: "A student says: \"Sorting a list becomes an intractable problem once the list has more than a million items.\" Explain why this statement is wrong.", marks: 2,
      ms: ["Sorting always has a polynomial-time solution, so it is always tractable (1)", "A problem does not change from tractable to intractable as the problem size grows — intractability is about the rate of growth (exponential or worse) (1)"] },
    { src: "AQA 2023 P1 Q3.6", q: "Explain what is meant by a *heuristic* and how one can help with an intractable problem.", marks: 2,
      ms: ["Rules / knowledge about the problem domain used to guide the search (1)", "Finds a good / approximate but probably not optimal solution, reducing the search space so an answer is found in reasonable time (1)"] }
  ]
});

X("compsci:4.4.4.5", {
  flashcards: [
    ["What are the two broad classes of algorithmic problem by complexity?", "Tractable (polynomial time or better) and intractable (exponential or worse)."],
    ["What is the class P?", "Problems solvable in polynomial time by a deterministic algorithm."],
    ["What is the class NP (informally)?", "Problems whose solutions can be verified in polynomial time, even if finding one may not be."],
    ["What makes a problem NP-complete (informally)?", "It is in NP and every NP problem reduces to it — a polynomial solution to it would solve all of NP."],
    ["Give an example of a tractable problem class.", "Searching, sorting, shortest path (Dijkstra)."],
    ["Give an example of an intractable problem.", "Travelling salesman (optimal), knapsack (exact), Boolean satisfiability by brute force."],
    ["How is a problem classified?", "By the time complexity of the best-known algorithm that solves it."],
    ["What is the difference between a computable and a tractable problem?", "Computable: an algorithm exists. Tractable: a polynomial-time algorithm exists. Intractable problems are computable but impractical."]
  ],
  quiz: [
    { q: "A problem in class P has:", opts: ["no algorithm", "a polynomial-time algorithm", "only exponential algorithms", "no verification"], ans: 1, why: "P = polynomial." },
    { q: "Finding the shortest path with Dijkstra is:", opts: ["intractable", "tractable", "non-computable", "undecidable"], ans: 1, why: "Polynomial time." },
    { q: "Brute-force travelling salesman on n cities is:", opts: ["O(n²)", "O(n!)", "O(n log n)", "O(1)"], ans: 1, why: "Every tour permutation." },
    { q: "Verifying a proposed TSP tour is under a length limit is:", opts: ["exponential", "polynomial", "impossible", "O(n!)"], ans: 1, why: "Add up n edges." },
    { q: "Intractable problems are:", opts: ["non-computable", "computable but impractical for large n", "always small", "solved by heuristics exactly"], ans: 1, why: "Key distinction." },
    { q: "Classifying a problem uses:", opts: ["its input size", "the complexity of the best-known algorithm", "the language", "its name"], ans: 1, why: "Growth rate of the best method." }
  ],
  exam: [
    { src: "AQA 2018 P1 Q5", q: "Explain how algorithmic problems are classified as tractable or intractable, and give one example of each.", marks: 4,
      ms: ["Classified by the time complexity of the best algorithm that solves them (1)", "Tractable: polynomial time (or better), e.g. sorting a list / searching (1)", "Intractable: exponential (or worse) time — no polynomial solution known, e.g. the travelling salesman problem (1)", "Both classes are computable; intractable problems simply cannot be solved in reasonable time as n grows (1)"] },
    { src: "AQA 2020 P1 Q3.5", q: "Five algorithms have complexities O(n²), O(2ⁿ), O(n log n), O(n!) and O(n³). State which of them solve intractable problems.", marks: 1,
      ms: ["O(2ⁿ) and O(n!) (1)"] }
  ]
});

X("compsci:4.4.4.6", {
  flashcards: [
    ["What is a computable problem?", "A problem for which an algorithm exists that produces the correct answer for every input in a finite number of steps."],
    ["What is a non-computable problem?", "One for which no algorithm can exist that solves every instance — e.g. the halting problem."],
    ["What is a decision problem?", "A problem with a yes/no answer."],
    ["What is an undecidable problem?", "A decision problem that no algorithm can answer correctly for all inputs."],
    ["Why can a Universal Turing Machine solve problems that a real computer cannot?", "It has an infinite tape (unlimited memory); real computers are finite."],
    ["What did the halting problem demonstrate?", "That there are non-computable / undecidable problems — some problems have no algorithm at all."],
    ["Is 'is n prime?' computable?", "Yes — trial division always terminates with the right answer."],
    ["Is 'does this program ever print X for some input?' computable in general?", "No — it reduces to the halting problem."]
  ],
  quiz: [
    { q: "A problem with no possible algorithm is:", opts: ["intractable", "non-computable", "tractable", "polynomial"], ans: 1, why: "Different from merely slow." },
    { q: "The halting problem shows:", opts: ["computers are slow", "there are non-computable problems", "all problems are decidable", "Turing machines are weak"], ans: 1, why: "2024 P1 Q3.2." },
    { q: "A UTM can solve problems real computers cannot because:", opts: ["it is faster", "its tape is infinite", "it has more states", "it is abstract"], ans: 1, why: "Unlimited memory." },
    { q: "'Is this list sorted?' is:", opts: ["undecidable", "computable and tractable", "non-computable", "intractable"], ans: 1, why: "A simple O(n) check." },
    { q: "An undecidable problem is a:", opts: ["decision problem with no algorithm", "slow problem", "problem with large input", "hardware fault"], ans: 0, why: "Definition." },
    { q: "Non-computable and intractable differ because:", opts: ["they are the same", "intractable problems have algorithms, non-computable ones do not", "non-computable problems are faster", "intractable problems are undecidable"], ans: 1, why: "Existence vs efficiency." }
  ],
  exam: [
    { src: "AQA 2024 P1 Q3.2", q: "Explain the importance of the halting problem to computer science.", marks: 1,
      ms: ["It demonstrates that there are non-computable / undecidable problems — some problems for which no algorithm can exist (1)"] },
    { src: "AQA 2023 P1 Q5.4", q: "Explain why a Universal Turing Machine can solve some problems that no real computer can.", marks: 1,
      ms: ["It has an infinite amount of memory — the tape is infinitely long (1)"] },
    { src: "AQA 2016 P1 Q4", q: "Distinguish between a non-computable problem and an intractable problem, giving an example of each.", marks: 4,
      ms: ["Non-computable: no algorithm can exist that solves it for all inputs (1)", "e.g. the halting problem (1)", "Intractable: an algorithm exists but it takes exponential (or worse) time, so it is impractical for large inputs (1)", "e.g. travelling salesman / brute-force knapsack (1)"] }
  ]
});

X("compsci:4.4.4.7", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "The halting problem — 2018, 2024" },
    "**Describe** (2 marks): *determining whether a program will halt* (first mark — required) … *without running it* / *for a particular input* (second mark). **Why no Turing machine solves it** (1): it is **non-computable / undecidable** — no algorithm exists. **Importance** (1): it **demonstrates that there are non-computable problems**.",
    { callout: { t: "tip", h: "The proof sketch, if asked", body: "Suppose `H(P, I)` decides halting. Build `D(P)`: if `H(P, P)` says halt, loop forever; else halt. Run `D(D)`: if it halts, H said it loops; if it loops, H said it halts. Contradiction, so H cannot exist." }}
  ],
  flashcards: [
    ["Describe the halting problem.", "Determining, without running it, whether a given program will halt (terminate) for a particular input."],
    ["Is the halting problem computable?", "No — it is non-computable / undecidable; no algorithm can solve it for all programs and inputs."],
    ["Why is the halting problem important?", "It proves that there exist problems no algorithm can solve — computation has limits."],
    ["Can a specific program's halting sometimes be determined?", "Yes, for particular cases by inspection — but no general algorithm works for every program and input."],
    ["Outline the contradiction in the proof.", "A supposed halting-decider is fed a program that does the opposite of what the decider predicts about itself, so the decider must be wrong."],
    ["Who proved the halting problem undecidable and when?", "Alan Turing, 1936."],
    ["What everyday consequence does it have?", "No compiler or tool can detect every infinite loop in every program."],
    ["Is 'does this program halt within 1000 steps?' decidable?", "Yes — simulate 1000 steps; the general problem is undecidable only because of the unbounded case."]
  ],
  quiz: [
    { q: "The halting problem asks whether:", opts: ["a program compiles", "a program will halt for a given input, without running it", "a program is fast", "a CPU halts"], ans: 1, why: "Definition." },
    { q: "The halting problem is:", opts: ["tractable", "intractable", "non-computable", "solved by Dijkstra"], ans: 2, why: "Undecidable." },
    { q: "Its significance is that it:", opts: ["proves all problems are solvable", "shows some problems have no algorithm", "speeds up compilers", "defines Big-O"], ans: 1, why: "Limits of computation." },
    { q: "A tool claims to detect every infinite loop in any program. This is:", opts: ["plausible", "impossible in general", "trivial", "O(n)"], ans: 1, why: "Would solve the halting problem." },
    { q: "'Without running the program' matters because:", opts: ["running might never finish", "running is slow", "programs are secret", "it is a rule"], ans: 0, why: "If it loops you would wait forever." },
    { q: "Turing proved the halting problem undecidable in:", opts: ["1936", "1945", "1969", "1984"], ans: 0, why: "Historical fact." }
  ],
  exam: [
    { src: "AQA 2024 P1 Q3.1", q: "Describe the halting problem.", marks: 2,
      ms: ["Determining (using an algorithm) whether a program will halt (1)", "without running the program / for a particular input (1) — second mark only if the first is awarded"] },
    { src: "AQA 2018 P1 Q4.2", q: "Explain why no Turing machine can be constructed that solves the halting problem.", marks: 1,
      ms: ["The halting problem is non-computable / undecidable — there is no algorithm that solves it, so no Turing machine can implement one (1)"] },
    { src: "AQA 2021 P2 Q7", q: "A software company advertises a tool that \"guarantees to find every infinite loop in any program before it runs\". Explain, with reference to the halting problem, why this claim cannot be true.", marks: 3,
      ms: ["Finding whether a program loops forever is the halting problem — deciding whether it halts without running it (1)", "Turing proved the halting problem is undecidable: no algorithm can decide it for all programs and inputs (1)", "So while the tool may detect some loops, it cannot guarantee to find every one in any program (1)"] }
  ]
});

X("compsci:4.4.5.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Turing machines — 2018, 2019, 2023" },
    { table: { head: ["Item", "Tariff", "Points"], rows: [
      ["Components of a TM (2018)", "2", "Finite set of states · transition rules · a read/write head that moves one square at a time · start state · accepting/halting state(s) · state register · an infinite tape"],
      ["Universal Turing Machine (2018, 2019, 2023)", "2", "A TM that can **simulate any other TM** / compute any computable sequence · the **description of the TM and its input are stored on the UTM's tape** · the UTM **acts as an interpreter**, executing the operations faithfully"],
      ["Why more powerful than a real computer", "1", "**Infinite memory** (tape)"],
      ["Trace a computation (2019, 2023)", "5", "Marks per row-group: tape contents, current state and head position; *Max 4 if any errors* — keep the head position unambiguous (underline or arrow)"],
      ["Purpose of the machine / a transition (2019)", "1 each", "e.g. *makes a copy of / doubles the string of 1s*; *moves the head back to the start of the string*"],
      ["When would the machine give a wrong result? (2023)", "2", "When the assumed input format is broken — no zeros between the markers / a character other than 0 present / not started in S0"]
    ]}},
    { callout: { t: "memorise", h: "Transition notation", body: "δ(current state, symbol read) = (new state, symbol written, move L/R). A **transition function** maps (state, symbol) → (state, symbol, direction). The machine **halts** when it enters a halting state or has no applicable rule." }}
  ],
  flashcards: [
    ["List the components of a Turing machine.", "A finite set of states (including a start state and halting/accepting states), a set of transition rules, an infinitely long tape divided into cells, a read/write head that moves one cell at a time, and a state register holding the current state."],
    ["What is a Universal Turing Machine?", "A Turing machine that can simulate any other Turing machine: the description of that machine and its input are written on the UTM's tape and the UTM executes them — it acts as an interpreter."],
    ["Why is a UTM more powerful than any real computer?", "It has an infinite tape — unlimited memory."],
    ["What does a transition rule specify?", "For a current state and symbol read: the new state, the symbol to write and the direction to move (L/R)."],
    ["When does a Turing machine halt?", "When it enters a halting state (or no rule applies to the current state and symbol)."],
    ["What is the significance of the Turing machine?", "It is a formal model of computation: anything computable can be computed by a TM (Church–Turing thesis)."],
    ["What is a transition function?", "The mapping δ(state, symbol) → (state′, symbol′, direction) that defines the machine's behaviour."],
    ["Describe a TM that adds 1 to a binary number.", "Move right to the end; move left replacing 1s with 0s until a 0 (or blank) is found; write 1; halt."]
  ],
  quiz: [
    { q: "Which is NOT a component of a Turing machine?", opts: ["Infinite tape", "Read/write head", "Random-access memory", "Transition rules"], ans: 2, why: "Memory is the tape, accessed sequentially." },
    { q: "A UTM's tape holds:", opts: ["only data", "the description of another TM plus its input", "the transition table only", "nothing"], ans: 1, why: "Program-as-data, like a stored-program computer." },
    { q: "A UTM acts as a(n):", opts: ["compiler", "interpreter", "assembler", "linker"], ans: 1, why: "It executes the described machine step by step." },
    { q: "δ(S1, 0) = (S2, 1, R) means:", opts: ["in S1 reading 0: write 1, move right, go to S2", "in S2 reading 1: write 0, go to S1", "halt", "move left"], ans: 0, why: "Transition rule semantics." },
    { q: "The tape symbol □ usually denotes:", opts: ["zero", "a blank cell", "an error", "the head"], ans: 1, why: "Blank." },
    { q: "A TM is more powerful than an FSM because it:", opts: ["has more states", "can read and write an unbounded tape", "is faster", "has outputs"], ans: 1, why: "Unbounded read/write memory." }
  ],
  exam: [
    { src: "AQA 2018 P1 Q4", ctx: "A Turing machine is a theoretical model of computation.",
      parts: [
        { q: "State two components of a Turing machine.", marks: 2, ms: ["A finite set of states (with a start state and halting states) (1)", "A set of transition rules / a read-write head moving one square at a time / an infinite tape / a state register (1)", "Max 2"] },
        { q: "Explain what is meant by a Universal Turing Machine.", marks: 2, ms: ["A Turing machine that can simulate the behaviour of any other Turing machine / compute any computable sequence (1)", "The description of the other machine and its input are stored on the UTM's tape; the UTM acts as an interpreter, faithfully executing the operations (1)"] },
        { q: "Explain why a Universal Turing Machine is more powerful than any real computer.", marks: 1, ms: ["It has an infinite amount of memory / tape (1)"] }
      ] },
    { src: "AQA 2019 P1 Q2", ctx: "A Turing machine operates on a tape holding a string of 1s followed by blanks, e.g. `1 1 □ □ □ □`. Its transition rules, starting in S0 with the head on the leftmost 1, are: S0,1 → (S1, X, R); S1,1 → (S1, 1, R); S1,□ → (S2, □, R); S2,1 → (S2, 1, R); S2,□ → (S3, 1, L); S3,1 → (S3, 1, L); S3,□ → (S4, □, L); S4,1 → (S4, 1, L); S4,X → (S0, X, R); S0,□ → (S5, □, R) — S5 halts. (X marks a processed 1.)",
      parts: [
        { q: "Trace the machine on the input `1 1 □ □ □ □`, showing the tape, the current state and the head position after each transition, until it halts.", marks: 5, ms: ["First transition: tape X 1 □ □ □ □, state S1, head on the second cell (1)", "Moves right over the 1 and the first blank into S2, then to the next blank and writes 1 in S3: X 1 □ 1 □ □ (1)", "Returns left through S3 and S4 to the X, then S0 moves right onto the second 1 (1)", "Processes the second 1 similarly, giving X X □ 1 1 □ (1)", "S0 reads □ → S5 and halts with the head after the two Xs; all state and head entries correct (1)", "Max 4 if any errors"] },
        { q: "State the purpose of the Turing machine.", marks: 1, ms: ["It makes a copy of the string of 1s / doubles the number of 1s on the tape (after the blank) (1)"] },
        { q: "State the purpose of the transition rule `S4,X → (S0, X, R)`.", marks: 1, ms: ["Moves the head back to the first unprocessed 1 at the start of the original string so the next 1 can be copied (1)"] }
      ] },
    { src: "AQA 2023 P1 Q5.2", q: "A Turing machine is designed to count the zeros between two `#` symbols on its tape, assuming the tape has the form `# 0 0 … 0 #` and the machine starts in S0 on the first `#`. Describe two circumstances in which the machine could give an incorrect result.", marks: 2,
      ms: ["When there are no zeros between the two # symbols (1)", "When a character other than 0 (e.g. a 1) appears between the # symbols / when the machine does not start in S0 or on the first # (1)", "Max 2"] }
  ]
});

})(KOS.content.extend);
