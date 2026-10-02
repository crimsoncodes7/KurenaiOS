/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.4.4.1–
   4.4.4.7 (comparing algorithms; maths for Big-O; order of complexity;
   limits of computation; tractable and intractable problems; computable
   and non-computable problems; the Halting problem) and 4.4.5.1 (Turing
   machines) at full A-level depth, with every program in C#. Each topic
   REPLACES the entry cs-theory-computation-2.js carried and keeps its labs.
   Every way AQA has examined them (7517/1, June 2017–2024) is worked in the
   mark scheme's own format — permutations and anagrams, constant time,
   the tractability questions and heuristics, the Halting problem and its
   importance, Turing machine components and the Universal Turing Machine.
   4.4.4.1 has never been examined on its own; its worked cards are
   variations. Every count quoted (halvings, permutations, TSP routes,
   Collatz steps, recursion depth) and the Turing machine's trace were
   reproduced in C# under .NET 10. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 }];
  if (label) it.push(txt(x + w / 2, y + (sub ? h / 2 - 8 : h / 2), label, { b: true, size: 12, c: "text" }));
  if (sub) it.push(txt(x + w / 2, y + h / 2 + 9, sub, { size: 10.5 }));
  return it;
}
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: o.c || "accent2", w: o.w || 1.6, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}
function spec(ref, lines) { return { callout: { t: "info", h: "What the specification asks (" + ref + ")", body: lines } }; }
/* a row of tape cells with the head under one of them */
function tape(x, y, cells, head, state) {
  var it = [], w = 34;
  cells.forEach(function (v, i) {
    var on = i === head;
    it.push({ poly: [[x + i * w, y], [x + (i + 1) * w, y], [x + (i + 1) * w, y + 30], [x + i * w, y + 30]], fill: on ? "accent2" : "accent", alpha: on ? 0.34 : 0.1, c: on ? "accent2" : "accent", w: 1.2 });
    it.push(txt(x + i * w + w / 2, y + 15, v === "_" ? "□" : v, { b: true, size: 12, c: "text" }));
  });
  it.push(txt(x + cells.length * w + 14, y + 15, "…", { size: 13, c: "text2" }));
  if (head != null) { it = it.concat(arrow(x + head * w + w / 2, y + 52, x + head * w + w / 2, y + 32, null, { c: "accent2" })); it.push(txt(x + head * w + w / 2, y + 62, state || "head", { b: true, size: 10.5, c: "accent2" })); }
  return it;
}

/* =====================================================================
   4.4.4.1  Comparing algorithms
   ===================================================================== */
C["compsci:4.4.4.1"] = {
  notes: [
    { h: "Comparing algorithms — the whole topic on one page" },
    spec("4.4.4.1", ["Understand that algorithms can be compared by expressing their complexity as a function relative to the size of the problem — the size of the problem is the key issue.", "Understand that some algorithms are more efficient time-wise, and some space-wise, than other algorithms."]),
    { callout: { t: "info", h: "How AQA examines it", body: "Comparing algorithms underlies every complexity question (4.3.4–4.3.5, 4.4.4.3) but has not been examined as a stand-alone item in 2016–2025. The cards below are variations; the examined comparisons are in linear vs binary search, bubble vs merge sort and naive vs memoised Fibonacci." } },
    { h: "How these notes are organised" },
    { ol: ["**Measure growth, not seconds**.", "**Time and space**.", "**Exam toolkit**."] },

    { page: "Measure growth, not seconds" },
    { kv: [
      ["Why not just time it?", "seconds depend on the hardware, the language, the compiler and other programs running — the same algorithm gives different times on different machines"],
      ["What to compare", "how the number of steps (or the memory) GROWS as a function of the problem size n"],
      ["Size of the problem", "the key issue: for tiny inputs almost anything is fast; the differences appear as n grows"],
      ["Worst case", "usually quoted — it is a guarantee; best and average cases are also used"]
    ] },
    { table: { head: ["n", "Linear search (n)", "Binary search (log₂ n)", "Bubble sort (n²)", "Merge sort (n log₂ n)"], rows: [
      ["10", "10", "4", "100", "≈ 33"], ["1 000", "1 000", "10", "1 000 000", "≈ 10 000"], ["1 000 000", "1 000 000", "20", "10¹²", "≈ 2 × 10⁷"]
    ] } },
    { worked: { tag: "variation", title: "Which is better?", q: "Algorithm A takes 100n steps; algorithm B takes n² steps. Which is better for n = 50 and for n = 1000? What does this show?",
      steps: [
        { m: "n = 50: A = 5000, B = 2500 — B is faster.", mk: "1" },
        { m: "n = 1000: A = 100 000, B = 1 000 000 — A is faster.", mk: "1" },
        { m: "They cross at n = 100. For large problems the GROWTH (n vs n²) dominates the constant factor — which is why we compare by order of complexity.", mk: "1" }
      ], result: "B small, A large; growth wins" } },
    { worked: { tag: "variation", title: "Best, worst and average", q: "A linear search runs on a list of 1000 items. Give the best, worst and average number of comparisons, and say which case Big-O usually describes.",
      steps: [
        { m: "Best case: 1 — the target is the first item.", mk: "1" },
        { m: "Worst case: 1000 — the target is last or absent. Average (target present, any position equally likely): about 500.", mk: "1" },
        { m: "Big-O usually describes the WORST case — a guarantee for every input: here O(n).", mk: "1" }
      ], result: "1 · 1000 · ≈500; worst case → O(n)" } },

    { page: "Time and space" },
    { table: { head: ["Pair", "Time", "Space (extra memory)", "Trade-off"], rows: [
      ["Bubble vs merge sort", "O(n²) vs O(n log n)", "O(1) vs O(n)", "merge is faster but needs a second list"],
      ["Recursive vs iterative sum to n", "both O(n)", "O(n) stack frames vs O(1)", "SumTo(1000) recursively needs 1001 frames"],
      ["Naive vs memoised Fibonacci", "O(2ⁿ) vs O(n)", "O(n) stack vs O(n) table", "memory buys enormous time"],
      ["Hash table vs sorted list search", "≈O(1) vs O(log n)", "spare slots vs none", "space buys time"]
    ] } },
    { code: { lang: "csharp", src: "// same answer, same O(n) TIME — different SPACE\nstatic long SumRec(int n) => n == 0 ? 0 : n + SumRec(n - 1);   // one stack frame per call\nstatic long SumLoop(int n) { long t = 0; for (int i = 1; i <= n; i++) t += i; return t; }   // one frame\n// SumRec(1000) = 500500 with 1001 frames on the stack at its deepest\n// SumRec(1_000_000) would overflow the stack; SumLoop would not", cap: "Checked: SumRec(1000) reached a depth of 1001 calls." } },
    { worked: { tag: "variation", title: "Space-time trade-off", q: "A spell-checker must test 100 000 words against a 50 000-word dictionary. Compare (a) a linear search of an unsorted list, (b) sorting once then binary search, (c) a hash set.",
      steps: [
        { m: "(a) up to 50 000 comparisons per word → up to 5 × 10⁹ in total; no extra memory.", mk: "1" },
        { m: "(b) one sort (≈ 50 000 × 16 comparisons) then ≤ 16 per word → ≈ 2.4 × 10⁶; sorting in place needs little extra memory.", mk: "1" },
        { m: "(c) about 1 look-up per word → ≈ 10⁵; extra memory for the table's spare slots. Fastest, at the cost of space.", mk: "1" }
      ], result: "Hash set fastest; sorted list a good compromise" } },

    { page: "Exam toolkit" },
    { steps: [
      "Compare by how steps/memory GROW with n — not by seconds on one machine.",
      "Time-efficient and space-efficient are different questions; name which.",
      "Constant factors matter for small n; order of growth matters for large n."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Faster on my laptop means a better algorithm.\" — timings depend on hardware and input; compare growth.",
      "\"An O(n) algorithm always beats an O(n²) one.\" — only for large enough n; constants can win on small inputs.",
      "\"Efficient means fast.\" — it can also mean using little memory."
    ] } },
    { callout: { t: "mnemonic", h: "\"Grow, not go\"", body: "Compare how the work **grows** with n, not how fast it **goes** on one machine." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.4.2–4.4.4.3 Big-O; 4.3.4 searches and 4.3.5 sorts; 4.1.1.16 recursion's stack cost; 4.2.6.1 hash tables; 4.1.1.15 stack frames." } }
  ],
  flashcards: [
    ["How are algorithms compared?", "By how their time/space requirements grow as a function of the problem size n."],
    ["Why not compare run times in seconds?", "They depend on hardware, language and conditions."],
    ["Key issue when comparing?", "The size of the problem."],
    ["Time-wise vs space-wise efficiency?", "Fewer steps vs less memory."],
    ["Space cost of SumRec(n)?", "O(n) stack frames (1001 for n = 1000)."],
    ["Merge sort vs bubble sort space?", "O(n) extra vs O(1)."],
    ["100n vs n² — crossover?", "n = 100."],
    ["Why quote the worst case?", "It is a guarantee for every input."]
  ],
  quiz: [
    { q: "Algorithms are best compared by", opts: ["growth of steps with input size", "seconds on one PC", "lines of code", "language used"], ans: 0, why: "Hardware-independent." },
    { q: "Which uses more memory?", opts: ["merge sort", "bubble sort", "they are equal", "neither uses memory"], ans: 0, why: "Extra lists." },
    { q: "For n = 50, 100n vs n²:", opts: ["n² is faster", "100n is faster", "equal", "cannot tell"], ans: 0, why: "2500 < 5000." },
    { q: "A space-time trade-off example:", opts: ["memoisation", "bubble sort", "linear search", "a single loop"], ans: 0, why: "Memory buys speed." }
  ],
  gens: ["bigo"]
};

/* =====================================================================
   4.4.4.2  Maths for understanding Big-O notation
   ===================================================================== */
function growthFig() {
  return { fig: { x: [0, 10.5], y: [0, 60], axes: { xt: [2, 4, 6, 8, 10], yt: [10, 20, 30, 40, 50, 60], x: "n", y: "steps" }, items: [
    { fn: "3", c: "muted", label: "constant", at: 9.6, pos: "n" },
    { fn: "ln(x)/ln(2)", from: 1, to: 10.5, c: "good", label: "log₂ n", at: 10, pos: "s" },
    { fn: "x", c: "accent", label: "n", at: 10, pos: "n" },
    { fn: "x^2", to: 7.7, c: "accent2", label: "n²", at: 7.4, pos: "w" },
    { fn: "2^x", to: 5.9, c: "danger", label: "2ⁿ", at: 5.6, pos: "w" }
  ] }, cap: "Growth of the functions behind Big-O: exponential (2ⁿ) overtakes polynomial (n²), which overtakes linear (n); logarithmic barely rises." };
}
C["compsci:4.4.4.2"] = {
  notes: [
    { h: "Maths for Big-O — the whole topic on one page" },
    spec("4.4.4.2", ["Be familiar with a function as a mapping from one set of values, the domain, to another, the co-domain, e.g. ℕ → ℕ.", "Be familiar with linear (y = 2x), polynomial (y = 2x²), exponential (y = 2ˣ) and logarithmic (y = log x) functions.", "Be familiar with permutations: the number of permutations of n distinct objects is n factorial (n!)."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Permutations of 4 objects", "How many", "1", "A-level 2020 Q03.1"],
      ["Permutations of n objects", "How many", "1", "A-level 2020 Q03.2"],
      ["Why anagrams of n characters ≠ n!", "Why", "1", "A-level 2020 Q03.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Functions and their growth**.", "**Permutations and factorials**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Functions and their growth" },
    { kv: [
      ["Function", "a mapping from a domain to a co-domain: f : ℕ → ℕ, f(n) = n² maps every natural number to its square"],
      ["Linear", "y = 2x — double the input, double the output"],
      ["Polynomial", "y = 2x² (or any xᵏ) — double the input, ×2ᵏ the output"],
      ["Exponential", "y = 2ˣ — add 1 to the input, DOUBLE the output"],
      ["Logarithmic", "y = log₂ x — double the input, add 1 to the output (the inverse of 2ˣ)"]
    ] },
    growthFig(),
    { table: { head: ["n", "log₂ n", "n²", "2ⁿ", "n!"], rows: [
      ["10", "3.3", "100", "1 024", "3 628 800"], ["20", "4.3", "400", "1 048 576", "2.4 × 10¹⁸"], ["30", "4.9", "900", "1 073 741 824", "2.65 × 10³²"]
    ] } },

    { page: "Permutations and factorials" },
    { callout: { t: "def", h: "Permutation", body: "An ordering (arrangement) of a set of objects. n DISTINCT objects can be arranged in **n! = n × (n − 1) × … × 2 × 1** ways: n choices for the first place, n − 1 for the second, and so on." } },
    { code: { lang: "csharp", src: "static long Fact(int n) => n <= 1 ? 1 : n * Fact(n - 1);\nFact(4);    // 24 — four athletes in four lanes\nFact(10);   // 3 628 800\n\n// repeated letters cut the count: divide by the arrangements of each repeat\n// MISSISSIPPI: 11! / (4! × 4! × 2!) = 34 650 distinct anagrams\n// AAB: 3! = 6 orderings but only 3 distinct strings (AAB, ABA, BAA)", cap: "Checked by running. 30! = 265 252 859 812 191 058 636 308 480 000 000 — it overflows a 64-bit long (BigInteger was used)." } },
    { worked: { tag: "variation", title: "Count the arrangements", q: "(a) How many ways can 6 different books be arranged on a shelf? (b) How many distinct arrangements of the letters of LEVEL are there?",
      steps: [
        { m: "(a) 6! = 720.", mk: "1" },
        { m: "(b) LEVEL has 5 letters with L twice and E twice: 5! / (2! × 2!) = 120 / 4 = 30.", mk: "1" }
      ], result: "720; 30" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Four athletes, four lanes", src: "A-level June 2020 · P1 Q03.1 · 1 mark",
      q: "There are four athletes taking part in a race. Each athlete is allocated a lane; there can only be one athlete in each lane and there are four lanes. How many different permutations are there for allocating athletes to lanes?",
      steps: [{ m: "4! // 4 × 3 × 2 × 1 // 24;", mk: "1", n: "A. 4 × 3 × 2." }], result: "24" } },
    { worked: { tag: "exam", title: "n athletes, n lanes", src: "A-level June 2020 · P1 Q03.2 · 1 mark",
      q: "If there are n athletes and n lanes, with each athlete allocated to one lane and each lane used by one athlete, how many different permutations are there?",
      steps: [{ m: "n! // the factorial of n;", mk: "1", n: "A. 1 × 2 × … × (n − 1) × n." }], result: "n!" } },
    { worked: { tag: "exam", title: "Why anagrams differ", src: "A-level June 2020 · P1 Q03.3 · 1 mark",
      q: "An anagram of a string contains exactly the same number of each character, possibly in different positions; the original string is an anagram of itself. If there are n characters in a string, why will the number of anagrams of the string not always be n!?",
      steps: [{ m: "The string could contain more than one occurrence of a character // each athlete is unique but each character is not // there are n characters but not n distinct characters // some anagrams would be duplicates;", mk: "1" }],
      result: "Repeated characters create duplicates" } },

    { page: "Exam toolkit" },
    { steps: [
      "**n distinct objects → n! orders**. Show the product if asked.",
      "**Repeats** reduce the count: divide by the factorial of each repeat count.",
      "**Growth order**: log n < n < n log n < n² < 2ⁿ < n!.",
      "A function maps domain → co-domain (e.g. ℕ → ℕ)."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"2ⁿ and n² grow at about the same rate.\" — at n = 30: 900 vs over a billion.",
      "\"log n is a small constant.\" — it grows, just very slowly (doubling n adds 1).",
      "Using n! when objects repeat — it double-counts identical arrangements."
    ] } },
    { callout: { t: "mnemonic", h: "\"Log, line, square, power, bang\"", body: "Slowest to fastest growth: **log** n, **line**ar n, **square** n², **power** 2ⁿ, factorial n! (\"**bang**\")." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.4.3 Big-O classes; 4.4.4.5 intractable problems (n!, 2ⁿ); 4.12.1.1 function type: domain and co-domain; 4.3.4.2 log₂ n in binary search; maths: exponentials and logarithms." } }
  ],
  flashcards: [
    ["Function (spec sense)?", "A mapping from a domain to a co-domain, e.g. ℕ → ℕ."],
    ["Linear function example?", "y = 2x."],
    ["Polynomial function example?", "y = 2x²."],
    ["Exponential function example?", "y = 2ˣ."],
    ["Logarithmic function example?", "y = log x."],
    ["Permutations of n distinct objects?", "n! (n factorial)."],
    ["4! =", "24."],
    ["Why are anagrams of n letters not always n!?", "Repeated letters make some arrangements identical."],
    ["Distinct arrangements of LEVEL?", "5!/(2!2!) = 30."],
    ["Doubling n adds how much to log₂ n?", "1."]
  ],
  quiz: [
    { q: "How many orders for 5 different books?", opts: ["120", "25", "60", "5"], ans: 0, why: "5!." },
    { q: "Which grows fastest?", opts: ["n!", "2ⁿ", "n²", "n log n"], ans: 0, why: "Factorial." },
    { q: "Adding 1 to the input of 2ˣ", opts: ["doubles the output", "adds 1 to the output", "squares the output", "halves the output"], ans: 0, why: "Exponential." },
    { q: "Anagrams of AAB (counting distinct strings):", opts: ["3", "6", "2", "9"], ans: 0, why: "AAB, ABA, BAA." }
  ],
  gens: ["bigo"]
};

/* =====================================================================
   4.4.4.3  Order of complexity
   ===================================================================== */
C["compsci:4.4.4.3"] = {
  notes: [
    { h: "Order of complexity — the whole topic on one page" },
    spec("4.4.4.3", ["Be familiar with Big-O notation to express time complexity, and apply it to running times that grow in constant, logarithmic, linear, polynomial and exponential time.", "Be able to derive the time complexity of an algorithm."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Constant time complexity", "Explain", "2", "A-level 2023 Q03.7"],
      ["Big-O of named algorithms", "State", "1–3", "A-level 2017 Q03.1, 2022 Q01 (4.3.5.2)"],
      ["Big-O with an explanation", "State and explain", "2", "A-level 2020 Q03.6–7, 2023 Q03.3–4, 2025 Q01.4–5 (4.3.4)"],
      ["Why a recursion is inefficient", "Explain", "2", "A-level 2025 P2 Q11.3 (4.1.1.16)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The Big-O classes**.", "**Deriving complexity from code**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The Big-O classes" },
    { table: { head: ["Class", "Big-O", "Doubling n makes the time…", "Example"], rows: [
      ["Constant", "O(1)", "the same", "array access a[i]; push/pop; hash look-up (average)"],
      ["Logarithmic", "O(log n)", "one step longer", "binary search; balanced binary tree search"],
      ["Linear", "O(n)", "twice as long", "linear search; summing a list"],
      ["Linearithmic", "O(n log n)", "a little over twice", "merge sort"],
      ["Polynomial", "O(nᵏ), e.g. O(n²)", "4 times (n²), 8 times (n³)", "bubble sort; nested loops"],
      ["Exponential", "O(kⁿ), e.g. O(2ⁿ)", "SQUARED (2²ⁿ = (2ⁿ)²)", "naive Fibonacci; all subsets"],
      ["Factorial", "O(n!)", "astronomically more", "brute-force travelling salesperson"]
    ] } },
    { callout: { t: "def", h: "Big-O notation", body: "Describes how an algorithm's running time (or memory) grows as the input size n grows, keeping only the **dominant term** and dropping constants: 3n² + 5n + 2 is O(n²)." } },
    { diagram: "big-o-plot" },

    { page: "Deriving complexity from code" },
    { code: { lang: "csharp", src: "// O(1): a fixed number of steps\nint first = a[0];\n\n// O(n): one loop over the input\nfor (int i = 0; i < n; i++) total += a[i];\n\n// O(n²): a loop inside a loop — triangular counts are still O(n²)\nfor (int i = 0; i < n; i++)\n    for (int j = i; j < n; j++) ops++;      // n(n+1)/2 = 1275 for n = 50\n\n// O(log n): the problem HALVES each time\nfor (int m = n; m > 1; m /= 2) steps++;     // 9 halvings for n = 1000\n\n// O(2ⁿ): each call makes two more\nlong Fib(int k) => k <= 2 ? 1 : Fib(k - 1) + Fib(k - 2);", cap: "Counts checked by running: 1275 for the triangular loop, 9 halvings for 1000." } },
    { steps: [
      "Count how many times the most-repeated statement runs, in terms of n.",
      "Loops in SEQUENCE add (n + n = 2n → O(n)); loops NESTED multiply (n × n → O(n²)).",
      "A loop that halves or doubles its control variable is O(log n).",
      "Keep the dominant term; drop constants and lower terms."
    ] },
    { worked: { tag: "variation", title: "Derive the complexity", q: "Give the time complexity of: (a) for i in 1..n: for j in 1..10: x++; (b) for i in 1..n: for j in 1..n: for k in 1..n: x++; (c) a loop for i in 1..n followed by a separate loop for j in 1..n; (d) while n > 1: n ← n DIV 2.",
      steps: [
        { m: "(a) 10n → O(n) — the inner loop is a constant 10.", mk: "1" },
        { m: "(b) n³ → O(n³), polynomial.", mk: "1" },
        { m: "(c) n + n = 2n → O(n) — sequential loops add.", mk: "1" },
        { m: "(d) O(log n) — n halves each time.", mk: "1" }
      ], result: "O(n) · O(n³) · O(n) · O(log n)" } },
    { worked: { tag: "variation", title: "A loop inside a halving loop", q: "What is the time complexity of: for (int i = 0; i < n; i++) for (int j = 1; j < n; j *= 2) count++; ?",
      steps: [
        { m: "The outer loop runs n times.", mk: "1" },
        { m: "The inner loop doubles j each time, so it runs about log₂ n times.", mk: "1" },
        { m: "Nested loops multiply: n × log₂ n → O(n log n), the same class as merge sort.", mk: "1" }
      ], result: "O(n log n)" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Constant time complexity", src: "A-level June 2023 · P1 Q03.7 · 2 marks",
      q: "Explain what is meant by constant time complexity.",
      steps: [{ m: "As the size of the input/problem increases;", mk: "1" }, { m: "the amount of time taken remains the same;", mk: "1" }],
      result: "Time does not grow with input size" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Explain a Big-O** with the growth: O(1) same; O(log n) halves the problem each step; O(n) same rate; O(n²) n passes of n; O(2ⁿ) each step doubles the work.",
      "**Derive**: count the dominant repetition; nested multiply, sequential add, halving → log.",
      "Drop constants and lower terms."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"O(2n) and O(n) are different.\" — constants are dropped: both are O(n).",
      "\"A nested loop is always O(n²).\" — only if both loops depend on n; an inner loop of 10 is O(n).",
      "\"Constant time means fast.\" — it means time doesn't grow with n; the constant could be large."
    ] } },
    { callout: { t: "mnemonic", h: "\"Nest multiplies, sequence adds, halving logs\"", body: "Nested loops **multiply**, loops one after another **add**, and halving the problem each step gives a **log**." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.4.2 the functions; 4.3 every algorithm's Big-O; 4.4.4.5 tractable = polynomial or better; 4.1.1.16 recursion's O(2ⁿ); 4.2.6.1 O(1) hash look-up." } }
  ],
  flashcards: [
    ["Big-O notation?", "Describes how time/space grows with input size, keeping only the dominant term."],
    ["Constant time?", "O(1): time stays the same as the input grows."],
    ["Logarithmic time example?", "Binary search — O(log n)."],
    ["Linear time example?", "Linear search — O(n)."],
    ["Polynomial time example?", "Bubble sort — O(n²)."],
    ["Exponential time example?", "Naive recursive Fibonacci — O(2ⁿ)."],
    ["Nested loops over n?", "O(n²)."],
    ["Sequential loops over n?", "O(n) — they add."],
    ["Big-O of 3n² + 5n + 2?", "O(n²)."],
    ["Loop that halves n each time?", "O(log n)."]
  ],
  quiz: [
    { q: "Constant time means", opts: ["time stays the same as n grows", "time is 1 second", "time doubles", "time grows slowly"], ans: 0, why: "A-level 2023 Q03.7." },
    { q: "for i<n { for j<n {…} } is", opts: ["O(n²)", "O(n)", "O(2n)", "O(log n)"], ans: 0, why: "Nested multiply." },
    { q: "O(5n + 3) simplifies to", opts: ["O(n)", "O(5n)", "O(n + 3)", "O(1)"], ans: 0, why: "Drop constants." },
    { q: "Which class is merge sort?", opts: ["O(n log n)", "O(n²)", "O(log n)", "O(2ⁿ)"], ans: 0, why: "Levels × n." }
  ],
  sims: ["big-o-plot"],
  gens: ["bigo"]
};

/* =====================================================================
   4.4.4.4  Limits of computation
   ===================================================================== */
C["compsci:4.4.4.4"] = {
  notes: [
    { h: "Limits of computation — the whole topic on one page" },
    spec("4.4.4.4", ["Be aware that algorithmic complexity and hardware impose limits on what can be computed."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Why a UTM can solve problems no real computer can", "State one reason", "1", "A-level 2023 Q05.4"],
      ["Why a UTM is more powerful than any computer you can buy", "Why", "1", "A-level 2018 Q04.5 (4.4.5.1)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Two kinds of limit**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Two kinds of limit" },
    { table: { head: ["Limit", "From", "Example"], rows: [
      ["Algorithmic complexity", "the algorithm needs too many steps as n grows — no hardware rescues an exponential algorithm", "brute-force TSP: (n − 1)!/2 routes — 181 440 for 10 cities, 6.1 × 10¹⁶ for 20"],
      ["Hardware: memory", "real machines have finite RAM and storage", "a recursion or table too large for memory; a Turing machine's tape is infinite, a PC's memory is not"],
      ["Hardware: speed", "finite clock speed and parallelism", "10¹⁸ operations still take years at 10⁹ per second"],
      ["Theoretical", "some problems have no algorithm at all", "the Halting problem (4.4.4.7)"]
    ] } },
    { worked: { tag: "variation", title: "Will faster hardware help?", q: "A computer 1000× faster arrives. How much bigger a problem can it solve in the same time for an O(n²) algorithm and for an O(2ⁿ) algorithm?",
      steps: [
        { m: "O(n²): time ∝ n². 1000× the steps lets n grow by √1000 ≈ 31.6×.", mk: "1" },
        { m: "O(2ⁿ): 1000× the steps ≈ 2¹⁰, so n grows by only about 10 — from n to n + 10.", mk: "1" },
        { m: "Hardware helps polynomial algorithms a lot and exponential ones hardly at all: complexity, not hardware, is the binding limit.", mk: "1" }
      ], result: "×31.6 vs +10" } },
    { worked: { tag: "variation", title: "Count the routes", q: "Brute-force TSP checks (n − 1)!/2 routes. How many for 5, 10 and 20 cities, and how long would 20 cities take at 10⁹ routes per second?",
      steps: [
        { m: "5 cities: 4!/2 = 12; 10 cities: 9!/2 = 181 440.", mk: "1" },
        { m: "20 cities: 19!/2 ≈ 6.08 × 10¹⁶.", mk: "1", n: "Checked in C#." },
        { m: "6.08 × 10¹⁶ ÷ 10⁹ ≈ 6.1 × 10⁷ seconds ≈ 2 years — and 25 cities would take millions of years.", mk: "1" }
      ], result: "12 · 181 440 · ≈2 years for 20" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "What a UTM can do that a computer can't", src: "A-level June 2023 · P1 Q05.4 · 1 mark",
      q: "State one reason why there are some problems that no real computer can solve that the Universal Turing Machine could solve.",
      steps: [{ m: "It has an infinite amount of memory // the tape is infinitely long;", mk: "1", n: "A hardware limit: every real computer's memory is finite." }],
      result: "Infinite memory (tape)" } },

    { page: "Exam toolkit" },
    { steps: [
      "Two sources of limits: **algorithmic complexity** (too many steps) and **hardware** (finite memory and speed).",
      "UTM vs real computer: the UTM's tape (memory) is INFINITE.",
      "Faster hardware barely helps exponential algorithms."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Quantum or faster computers will solve everything.\" — exponential growth outruns speed-ups, and non-computable problems stay unsolvable.",
      "\"A UTM is faster than a real computer.\" — it isn't about speed; it has unlimited MEMORY."
    ] } },
    { callout: { t: "mnemonic", h: "\"Too slow or too small\"", body: "A computation hits its limit when the algorithm is **too slow** (complexity) or the machine is **too small** (finite memory)." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.4.3 Big-O; 4.4.4.5 intractable problems; 4.4.4.6–4.4.4.7 non-computable problems; 4.4.5.1 Turing machines; 4.7.3.7 processor performance factors." } }
  ],
  flashcards: [
    ["Two limits on computation?", "Algorithmic complexity and hardware."],
    ["Why can a UTM solve problems no real computer can?", "It has infinite memory (an infinitely long tape)."],
    ["Brute-force TSP routes for n cities?", "(n − 1)!/2."],
    ["Routes for 10 cities?", "181 440."],
    ["1000× faster hardware, O(2ⁿ) algorithm?", "n grows by only about 10."],
    ["1000× faster hardware, O(n²) algorithm?", "n grows by about 31.6×."],
    ["A limit no hardware removes?", "Non-computability (e.g. the Halting problem)."],
    ["Hardware limits?", "Finite memory and finite speed."]
  ],
  quiz: [
    { q: "A UTM can solve problems a real computer can't because", opts: ["its tape is infinite", "it is faster", "it uses binary", "it has more registers"], ans: 0, why: "A-level 2023 Q05.4." },
    { q: "Which limit does faster hardware barely help?", opts: ["exponential complexity", "linear complexity", "memory leaks", "network speed"], ans: 0, why: "+log₂ speed-up." },
    { q: "Brute-force TSP for 5 cities checks", opts: ["12 routes", "120 routes", "24 routes", "5 routes"], ans: 0, why: "4!/2." },
    { q: "Non-computable problems are limited by", opts: ["theory — no algorithm exists", "memory", "speed", "network bandwidth"], ans: 0, why: "4.4.4.6." }
  ]
};

/* =====================================================================
   4.4.4.5  Classification of algorithmic problems
   ===================================================================== */
C["compsci:4.4.4.5"] = {
  notes: [
    { h: "Tractable and intractable problems — the whole topic on one page" },
    spec("4.4.4.5", ["Know that problems with a polynomial (or less) time solution are called TRACTABLE.", "Problems that have no polynomial (or less) time solution are called INTRACTABLE.", "Heuristic methods are often used when tackling intractable problems."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How many listed algorithms solve tractable problems", "How many", "1", "A-level 2017 Q03.2"],
      ["What's wrong with \"sorting becomes intractable when large\"", "Explain", "2", "A-level 2019 Q01.2"],
      ["Approaches to an intractable problem", "Explain", "2", "A-level 2019 Q01.3"],
      ["Define intractable", "Explain", "2", "A-level 2020 Q03.4"],
      ["How many complexities are intractable", "How many", "1", "A-level 2020 Q03.5"],
      ["Why searching is tractable", "Explain", "1", "A-level 2023 Q03.5"],
      ["What heuristics are", "Explain", "2", "A-level 2023 Q03.6, 2017 Q05.4 (4.3.6.1)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The dividing line**.", "**Heuristics**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The dividing line" },
    { fig: { w: 640, h: 120, items: [].concat(
      boxAt(20, 20, 330, 70, "TRACTABLE", "good", "O(1) · O(log n) · O(n) · O(n log n) · O(nᵏ)"),
      boxAt(370, 20, 250, 70, "INTRACTABLE", "danger", "O(kⁿ) · O(n!) — no polynomial solution"),
      [txt(320, 108, "the dividing line is POLYNOMIAL time — for the best known algorithm for the problem", { size: 10.5, c: "text2" })]
    ), cap: "A problem is classified by its most efficient algorithm: polynomial or better is tractable; worse is intractable." } },
    { kv: [
      ["Tractable", "has a polynomial (or less) time solution — solvable in a reasonable time as n grows (searching, sorting, shortest path)"],
      ["Intractable", "SOLVABLE, but no polynomial-time solution is known — impractical for large n (travelling salesperson, timetabling, knapsack, graph colouring)"],
      ["It's the PROBLEM", "a problem doesn't switch class with input size; it is classified by the best algorithm that solves it"],
      ["Not the same as non-computable", "intractable problems HAVE algorithms; non-computable ones have none (4.4.4.6)"]
    ] },

    { page: "Heuristics" },
    { callout: { t: "def", h: "Heuristic", body: "A rule of thumb or educated guess, based on knowledge of the problem, that finds a **good-enough** (approximate, probably not optimal) solution in a reasonable time — often by **reducing the search space** or **relaxing constraints**." } },
    { table: { head: ["Intractable problem", "Heuristic approach"], rows: [
      ["Travelling salesperson", "nearest neighbour: always visit the closest unvisited city next — fast, usually within 25% of optimal"],
      ["Exam timetabling (graph colouring)", "schedule the exams with the most clashes first"],
      ["Game AI (chess)", "evaluate positions with a scoring function and search only a few moves ahead"],
      ["Path-finding on a big map", "A*: prefer squares in the target's direction (2017 Q05.4)"]
    ] } },
    { worked: { tag: "variation", title: "Nearest neighbour", q: "Cities A, B, C, D: AB 2, AC 9, AD 3, BC 4, BD 7, CD 1. Apply the nearest-neighbour heuristic from A and compare with the best tour.",
      steps: [
        { m: "From A the nearest is B (2); from B the nearest unvisited is C (4); from C → D (1); back D → A (3). Tour A-B-C-D-A = 10.", mk: "1" },
        { m: "All three distinct tours: A-B-C-D-A = 2 + 4 + 1 + 3 = 10; A-B-D-C-A = 2 + 7 + 1 + 9 = 19; A-C-B-D-A = 9 + 4 + 7 + 3 = 23.", mk: "1" },
        { m: "Here the heuristic happens to find the optimum (10), in 3 choices rather than checking every tour — but it is not guaranteed to.", mk: "1" }
      ], result: "Tour of 10 — optimal here" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "How many are tractable?", src: "A-level June 2017 · P1 Q03.2 · 1 mark",
      q: "The algorithms linear search, merge sort, binary search and post-order tree traversal are listed. How many of them are algorithms used to solve tractable problems?",
      steps: [{ m: "4;", mk: "1", n: "O(n), O(n log n), O(log n) and O(n) — all polynomial or better." }], result: "4" } },
    { worked: { tag: "exam", title: "Sorting doesn't become intractable", src: "A-level June 2019 · P1 Q01.2 · 2 marks",
      q: "'Sorting a list becomes an intractable problem when the size of the list is very large; it is a tractable problem when the size of the list is small.' Explain why this statement is wrong.",
      steps: [
        { m: "Sorting a list is (always) a tractable problem // it always has a polynomial-time (or better) solution;", mk: "1" },
        { m: "A problem does not change from tractable to intractable as its size grows (intractable means not solvable in a reasonable time as the problem size grows);", mk: "1" }
      ], result: "Tractability belongs to the problem, not the input size" } },
    { worked: { tag: "exam", title: "Tackling an intractable problem", src: "A-level June 2019 · P1 Q01.3 · 2 marks",
      q: "Explain what approach(es) a programmer might take if asked to 'solve' an intractable problem.",
      steps: [
        { m: "Use a heuristic // an algorithm that makes a guess/estimate based on experience;", mk: "1", n: "NE. algorithm that uses previous knowledge." },
        { m: "That provides a close-to-optimal solution/approximation // only works in some cases // relax some of the constraints // solve a simpler version // reduce the search space;", mk: "1", n: "Max 2." }
      ], result: "Heuristic; accept a near-optimal answer" } },
    { worked: { tag: "exam", title: "What is intractable?", src: "A-level June 2020 · P1 Q03.4 · 2 marks",
      q: "The travelling salesperson problem (visit every city once, returning to the start, by the shortest route) is an example of an intractable problem. Explain what is meant by an intractable problem.",
      steps: [
        { m: "A problem that can be solved;", mk: "1" },
        { m: "but not in a reasonable amount of time as the problem size increases // it has exponential (or worse) time complexity // there is no polynomial (or less) time solution;", mk: "1" }
      ], result: "Solvable, but not in polynomial time" } },
    { worked: { tag: "exam", title: "Count the intractable complexities", src: "A-level June 2020 · P1 Q03.5 · 1 mark",
      q: "Assuming these time complexities are for the most time-efficient algorithm that solves a problem — O(1), O(nᵏ), O(kⁿ), O(n), O(log n), O(n log n) — how many are for intractable problems?",
      steps: [{ m: "One;", mk: "1", n: "Only O(kⁿ) — exponential." }], result: "One" } },
    { worked: { tag: "exam", title: "Why searching is tractable", src: "A-level June 2023 · P1 Q03.5 · 1 mark",
      q: "Explain why searching for an item in a list or tree is a tractable problem.",
      steps: [{ m: "It has a polynomial (or better) time complexity solution // it does not have exponential (or worse) time complexity // it can be solved in a reasonable time regardless of the input size;", mk: "1", n: "NE. \"can be solved in a reasonable amount of time\" on its own." }],
      result: "Polynomial (or better) solution exists" } },
    { worked: { tag: "exam", title: "What heuristics are", src: "A-level June 2023 · P1 Q03.6 · 2 marks",
      q: "Heuristics can be used when working with an intractable problem. Explain what heuristics are.",
      steps: [
        { m: "Rules/knowledge about the problem domain;", mk: "1" },
        { m: "used to find a good/approximate but (probably) not optimal solution // that reduce the size of the search space // that change some constraints of the problem;", mk: "1", n: "Max 2." }
      ], result: "Domain rules → good-enough answer fast" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Tractable** = polynomial (or better) time solution. **Intractable** = solvable, but no polynomial solution.",
      "Classification belongs to the PROBLEM (its best algorithm), not to one input size.",
      "**Count**: only exponential/factorial classes are intractable.",
      "**Heuristics**: domain knowledge → near-optimal answer quickly; reduce the search space or relax constraints."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Intractable means unsolvable.\" — it is solvable, just not in polynomial time; unsolvable is NON-COMPUTABLE.",
      "\"A problem becomes intractable when n is large.\" — 2019's statement is wrong for exactly this reason.",
      "\"Heuristics find the best answer.\" — they find a GOOD answer, not guaranteed optimal."
    ] } },
    { callout: { t: "mnemonic", h: "\"Polynomial is practical\"", body: "**P**olynomial or better → tractable (**p**ractical); exponential or worse → intractable; no algorithm at all → non-computable." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.4.3 Big-O; 4.4.4.6 non-computable; 4.3.6.1 Dijkstra (tractable) vs TSP (intractable); 4.4.1.8 reduction to known problems; 4.5.6.10 encryption relies on intractability (factorising large numbers)." } }
  ],
  flashcards: [
    ["Tractable problem?", "One with a polynomial (or less) time solution."],
    ["Intractable problem?", "Solvable, but with no polynomial (or less) time solution."],
    ["Example of an intractable problem?", "The travelling salesperson problem."],
    ["Heuristic?", "A rule of thumb using domain knowledge to find a good, probably non-optimal, solution quickly."],
    ["How many of linear search, merge sort, binary search, post-order traversal are tractable?", "4."],
    ["Which of O(1), O(nᵏ), O(kⁿ), O(n), O(log n), O(n log n) is intractable?", "Only O(kⁿ) — one."],
    ["Why is 'sorting becomes intractable for large lists' wrong?", "Sorting is always tractable — tractability doesn't change with input size."],
    ["Two approaches to an intractable problem?", "Heuristics (near-optimal); relax constraints / reduce the search space."],
    ["Intractable vs non-computable?", "Has an algorithm but too slow vs has no algorithm at all."]
  ],
  quiz: [
    { q: "Tractable problems have", opts: ["a polynomial (or better) time solution", "no solution", "only exponential solutions", "only heuristic solutions"], ans: 0, why: "Definition." },
    { q: "How many of O(1), O(nᵏ), O(kⁿ), O(n), O(log n), O(n log n) are intractable?", opts: ["1", "2", "0", "3"], ans: 0, why: "Only exponential." },
    { q: "A heuristic gives", opts: ["a good-enough answer quickly", "the optimal answer", "no answer", "a proof"], ans: 0, why: "Approximation." },
    { q: "The travelling salesperson problem is", opts: ["intractable", "non-computable", "O(n)", "tractable"], ans: 0, why: "Solvable but exponential." }
  ]
};

/* =====================================================================
   4.4.4.6  Computable and non-computable problems
   ===================================================================== */
C["compsci:4.4.4.6"] = {
  notes: [
    { h: "Computable and non-computable problems — the whole topic on one page" },
    spec("4.4.4.6", ["Be aware that some problems cannot be solved algorithmically."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["The importance of the Halting problem", "Explain", "1", "A-level 2024 Q03.2"],
      ["Classify a problem", "State / explain", "1–2", "with 4.4.4.5 and 4.4.4.7"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Three kinds of problem**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Three kinds of problem" },
    { fig: { w: 640, h: 150, items: [].concat(
      boxAt(15, 15, 610, 120, null, "line"),
      [txt(320, 32, "all problems", { b: true, size: 11, c: "text" })],
      boxAt(35, 50, 380, 72, null, "accent"),
      [txt(225, 64, "computable — an algorithm exists", { b: true, size: 11, c: "text" })],
      boxAt(50, 80, 170, 34, "tractable", "good"), boxAt(230, 80, 170, 34, "intractable", "accent2"),
      boxAt(430, 50, 180, 72, "non-computable", "danger", "no algorithm can exist")
    ), cap: "Computable problems split into tractable and intractable; non-computable problems (like the Halting problem) cannot be solved by ANY algorithm, however much time or memory." } },
    { kv: [
      ["Computable", "an algorithm exists that solves every instance in a finite number of steps — a Turing machine can solve it"],
      ["Non-computable (undecidable)", "NO algorithm can solve every instance — not slow, impossible"],
      ["Examples", "the Halting problem; deciding whether two programs always give the same output; whether a program ever reaches a given line for any input"],
      ["Not the same as \"unsolved\"", "the Collatz conjecture (does n → n/2 or 3n + 1 always reach 1?) is OPEN, not proven non-computable — 27 takes 111 steps, but nobody knows a proof for every n"]
    ] },
    { worked: { tag: "variation", title: "Classify the problems", q: "Classify each as tractable, intractable or non-computable: (a) find the shortest route between two towns on a road map; (b) find the shortest tour visiting all 200 towns; (c) a program that inspects any other program and says whether it will crash for some input.",
      steps: [
        { m: "(a) Tractable — Dijkstra is polynomial.", mk: "1" },
        { m: "(b) Intractable — the travelling salesperson problem has no known polynomial solution; use a heuristic.", mk: "1" },
        { m: "(c) Non-computable — a general bug-detector would solve the Halting problem.", mk: "1" }
      ], result: "Tractable · intractable · non-computable" } },
    { worked: { tag: "variation", title: "Why not just run it?", q: "A student says: \"To find out whether a program halts, just run it.\" Why doesn't this decide the question?",
      steps: [
        { m: "If it halts, running it shows that — eventually.", mk: "1" },
        { m: "If it doesn't halt, you wait forever: at no finite point can you tell \"looping for ever\" from \"not finished yet\".", mk: "1" },
        { m: "So running gives a yes for halting programs but never a no — it is not an algorithm that always terminates with an answer.", mk: "1" }
      ], result: "It may never answer" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Why the Halting problem matters", src: "A-level June 2024 · P1 Q03.2 · 1 mark",
      q: "Explain the importance of the Halting problem.",
      steps: [{ m: "It demonstrates that there are non-computable problems // that there are some problems for which no algorithm can solve them // that there are undecidable problems;", mk: "1" }],
      result: "Proves non-computable problems exist" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Computable**: some algorithm solves it (maybe slowly). **Non-computable**: no algorithm can.",
      "Intractable ≠ non-computable.",
      "The Halting problem is THE example; its importance is that it proves non-computable problems exist."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Non-computable means we haven't found the algorithm yet.\" — it means one is PROVEN impossible.",
      "\"A powerful enough computer could solve it.\" — no amount of speed or memory helps a non-computable problem."
    ] } },
    { callout: { t: "mnemonic", h: "\"Fast, slow, never\"", body: "Tractable: solved **fast**. Intractable: solvable but **slow**. Non-computable: **never** — no algorithm exists." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.4.5 tractable/intractable; 4.4.4.7 the Halting problem; 4.4.5.1 Turing machines define what is computable; 4.4.1.2 an algorithm must terminate." } }
  ],
  flashcards: [
    ["Computable problem?", "One that some algorithm can solve in a finite number of steps."],
    ["Non-computable problem?", "One that no algorithm can solve."],
    ["Example of a non-computable problem?", "The Halting problem."],
    ["Importance of the Halting problem?", "It demonstrates that non-computable problems exist."],
    ["Intractable vs non-computable?", "Solvable but slow vs not solvable at all."],
    ["Can more memory/speed solve a non-computable problem?", "No."],
    ["Is the Collatz conjecture non-computable?", "Not known — it is unproven (open), which is different."],
    ["Another word for non-computable decision problems?", "Undecidable."]
  ],
  quiz: [
    { q: "Non-computable means", opts: ["no algorithm can solve it", "it is slow", "it needs a heuristic", "it is O(n!)"], ans: 0, why: "Definition." },
    { q: "The importance of the Halting problem is that it shows", opts: ["non-computable problems exist", "TSP is intractable", "all problems are computable", "Turing machines are slow"], ans: 0, why: "A-level 2024 Q03.2." },
    { q: "TSP is", opts: ["computable but intractable", "non-computable", "tractable", "undecidable"], ans: 0, why: "Has an algorithm." },
    { q: "A universal bug detector would be", opts: ["non-computable", "tractable", "intractable", "O(n)"], ans: 0, why: "It solves halting." }
  ]
};

/* =====================================================================
   4.4.4.7  The Halting problem
   ===================================================================== */
C["compsci:4.4.4.7"] = {
  notes: [
    { h: "The Halting problem — the whole topic on one page" },
    spec("4.4.4.7", ["Describe the Halting problem (but not prove it): the unsolvable problem of determining whether any program will eventually stop if given particular input.", "Understand the significance of the Halting problem for computation — it demonstrates that there are some problems that cannot be solved by a computer."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Describe the Halting problem", "Describe", "2", "A-level 2018 Q04.1, 2024 Q03.1"],
      ["Why no Turing machine solves it", "Why", "1", "A-level 2018 Q04.2"],
      ["Its importance", "Explain", "1", "A-level 2024 Q03.2 (4.4.4.6)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The problem**.", "**Why it can't be solved (the idea)**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The problem" },
    { callout: { t: "def", h: "The Halting problem", body: "Is it possible, in general, to write a program that can tell — **without running it** — whether **any** given program will **halt** for a **particular input**? Turing proved: **no**." } },
    { fig: { w: 640, h: 120, items: [].concat(
      boxAt(20, 30, 150, 54, "program P", "accent", "+ input I"),
      boxAt(240, 30, 170, 54, "Halts(P, I)?", "danger", "cannot exist in general"),
      boxAt(480, 15, 140, 36, "yes — halts", "good"), boxAt(480, 64, 140, 36, "no — loops for ever", "accent2"),
      arrow(170, 57, 240, 57, null, { c: "text2" }), arrow(410, 50, 480, 33, null, { c: "text2" }), arrow(410, 64, 480, 82, null, { c: "text2" })
    ), cap: "A halting decider would take any program and its input and always answer correctly in finite time. Turing showed no such program can exist." } },
    { code: { lang: "csharp", src: "// Does this halt for every starting n? Nobody knows (the Collatz conjecture).\nstatic int Collatz(long n)\n{\n    int steps = 0;\n    while (n != 1) { n = n % 2 == 0 ? n / 2 : 3 * n + 1; steps++; }\n    return steps;\n}\n// Collatz(27) = 111 steps, Collatz(7) = 16 — but no general checker can decide every case", cap: "Checked by running. Specific programs CAN sometimes be shown to halt; what is impossible is a GENERAL method for every program." } },

    { page: "Why it can't be solved (the idea)" },
    { steps: [
      "Suppose a program Halts(P, I) always correctly says whether P halts on input I.",
      "Build Trouble(P): if Halts(P, P) says \"halts\", loop for ever; otherwise halt.",
      "Ask what Trouble(Trouble) does: if it halts, Halts said it halts, so it loops — contradiction; if it loops, Halts said it loops, so it halts — contradiction.",
      "So Halts cannot exist. (You only need to DESCRIBE the problem in the exam — this is for understanding.)"
    ] },
    { worked: { tag: "variation", title: "Running it isn't deciding", q: "Explain why a program that simply runs P on I and reports \"halts\" when P finishes is not a solution to the Halting problem.",
      steps: [
        { m: "A solution must ALWAYS answer, in finite time, for every P and I.", mk: "1" },
        { m: "If P loops for ever, the runner never finishes and never answers \"no\".", mk: "1" }
      ], result: "It never answers for non-halting programs" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Describe the Halting problem", src: "A-level June 2018 · P1 Q04.1 · 2 marks",
      q: "Describe the Halting problem.",
      steps: [
        { m: "Determining if a program will halt;", mk: "1" },
        { m: "without running the program // for a particular input;", mk: "1", n: "The second mark only if the first is awarded." }
      ], result: "Will a program halt — without running it, for an input" } },
    { worked: { tag: "exam", title: "Why no Turing machine solves it", src: "A-level June 2018 · P1 Q04.2 · 1 mark",
      q: "Why is it not possible to create a Turing machine that solves the Halting problem?",
      steps: [{ m: "The Halting problem is non-computable / undecidable // there is no algorithm that solves it // inspection alone cannot always determine whether any given algorithm will halt for its given inputs;", mk: "1" }],
      result: "It is non-computable" } },
    { worked: { tag: "exam", title: "Describe it again", src: "A-level June 2024 · P1 Q03.1 · 2 marks",
      q: "Describe the Halting problem.",
      steps: [
        { m: "(Using a program/algorithm/method to) determine if a program will halt;", mk: "1" },
        { m: "without running the program // for a particular input;", mk: "1" }
      ], result: "Same scheme as 2018" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Describe**: decide whether a program will halt · without running it · for a given input.",
      "**Why unsolvable**: it is non-computable — no algorithm (no Turing machine) can do it for every program.",
      "**Importance**: proves some problems cannot be solved by any computer."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Nobody can tell whether ANY program halts.\" — for many specific programs we can; the impossible part is a GENERAL method for all programs.",
      "\"The Halting problem is about programs that crash.\" — it is about deciding whether they terminate.",
      "Writing the proof is not required; a clear description is."
    ] } },
    { callout: { t: "mnemonic", h: "\"Will it stop? Can't tell in general\"", body: "The question is **will it stop** (for this input, without running it); the answer is **no general method can tell**." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.4.6 non-computable problems; 4.4.5.1 Turing machines; 4.4.1.2 algorithms must terminate; 4.1.1.16 infinite recursion; 4.13.1.4 testing can't prove absence of infinite loops." } }
  ],
  flashcards: [
    ["The Halting problem?", "Determining, without running it, whether a program will halt for a particular input."],
    ["Can it be solved?", "No — it is non-computable/undecidable."],
    ["Why can't a Turing machine solve it?", "No algorithm exists that decides halting for every program."],
    ["Significance?", "It proves some problems cannot be solved by any computer."],
    ["Who proved it?", "Alan Turing (1936)."],
    ["Can we ever tell if a specific program halts?", "Often yes — what's impossible is a general method for all programs."],
    ["Why isn't 'just run it' a solution?", "It never gives an answer for programs that loop forever."],
    ["2-mark description scheme?", "Determine if a program will halt + without running it / for a particular input."]
  ],
  quiz: [
    { q: "The Halting problem asks whether", opts: ["a program will halt for a given input, without running it", "a program contains syntax errors", "a computer will crash", "a loop is efficient"], ans: 0, why: "Definition." },
    { q: "The Halting problem is", opts: ["non-computable", "intractable", "tractable", "solved by heuristics"], ans: 0, why: "No algorithm." },
    { q: "For the 2nd mark when describing it, add", opts: ["without running the program / for a particular input", "it was invented by Turing", "it is O(2ⁿ)", "it uses a tape"], ans: 0, why: "2018/2024 scheme." },
    { q: "Running the program to see if it halts fails because", opts: ["it may never answer", "it is too fast", "it uses too much memory", "it changes the program"], ans: 0, why: "Loops never report." }
  ]
};

/* =====================================================================
   4.4.5.1  Turing machine
   ===================================================================== */
function tmFig() {
  var it = [].concat(
    tape(20, 10, ["1", "1", "1", "#", "1", "1", "_"], 0, "S0"),
    [txt(320, 104, "δ(S0, 1) = (S0, 1, →) · δ(S0, #) = (S1, 1, →) · δ(S1, 1) = (S1, 1, →)", { size: 10.5, c: "text2" }),
      txt(320, 124, "δ(S1, □) = (S2, □, ←) · δ(S2, 1) = (S3, □, ←) · S3 is the halting state", { size: 10.5, c: "text2" })],
    tape(20, 150, ["1", "1", "1", "1", "1", "_", "_"], 4, "S3 (halt)")
  );
  return { fig: { w: 640, h: 230, items: it, cap: "A Turing machine adding two unary numbers: 111#11 (3 + 2) becomes 11111 (5) in 8 steps — the # is overwritten with a 1 and the last 1 is erased." } };
}
C["compsci:4.4.5.1"] = {
  notes: [
    { h: "Turing machines — the whole topic on one page" },
    spec("4.4.5.1", ["Be familiar with the structure and use of Turing machines that perform simple computations.", "A Turing machine is a computer with a single fixed program, made of: a finite set of states in a state transition diagram; a finite alphabet of symbols; an infinite tape with marked-off squares; a sensing read-write head that travels along the tape one square at a time.", "One state is the start state; states with no outgoing transitions are halting states.", "Understand the equivalence between a transition function and a state transition diagram; represent rules both ways; hand-trace simple Turing machines.", "Explain the importance of Turing machines and the Universal Turing Machine: a general model of computation and a definition of what is computable."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Two components besides alphabet and tape", "State", "2", "A-level 2018 Q04.3"],
      ["What a Universal Turing Machine is", "Explain", "2", "A-level 2018 Q04.4, 2019 Q02.4, 2023 Q05.3"],
      ["Why a UTM beats any computer you can buy", "Why", "1", "A-level 2018 Q04.5"],
      ["Trace a machine from its diagram", "Complete the table", "5", "A-level 2019 Q02.1, 2023 Q05.1"],
      ["Purpose of a machine / a transition", "What is the purpose", "1", "A-level 2019 Q02.2–3"],
      ["When a machine fails", "Describe", "2", "A-level 2023 Q05.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Components**.", "**Transition functions and diagrams**.", "**Tracing**.", "**The Universal Turing Machine**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Components" },
    { kv: [
      ["Finite set of states", "including ONE start state and one or more halting states (no outgoing transitions)"],
      ["Finite alphabet", "the symbols that can be on the tape, including the blank □"],
      ["Infinite tape", "marked-off squares (AQA: infinite in one direction) — the memory"],
      ["Read-write head", "reads the current square, writes a symbol, moves ONE square left or right"],
      ["Transition rules", "what to do for each (state, symbol read): new state, symbol to write, direction to move"],
      ["Single fixed program", "each Turing machine does one job — its rules are its program"]
    ] },
    tmFig(),

    { page: "Transition functions and diagrams" },
    { table: { head: ["Form", "How a rule is written", "Example"], rows: [
      ["Transition function", "δ(current state, symbol read) = (new state, symbol written, move)", "δ(S0, #) = (S1, 1, →)"],
      ["State transition diagram", "an arrow from current to new state labelled read | write, move (AQA writes the move as an arrow or L/R)", "S0 —#|1, R→ S1"]
    ] } },
    { code: { lang: "csharp", src: "// the transition function as a dictionary: (state, read) → (state, write, move)\nvar delta = new Dictionary<(string, char), (string, char, int)>\n{\n    [(\"S0\", '1')] = (\"S0\", '1', +1),\n    [(\"S0\", '#')] = (\"S1\", '1', +1),\n    [(\"S1\", '1')] = (\"S1\", '1', +1),\n    [(\"S1\", '_')] = (\"S2\", '_', -1),\n    [(\"S2\", '1')] = (\"S3\", '_', -1)      // S3 has no rules: a halting state\n};\nvar tape = \"111#11____\".ToCharArray();\nint head = 0; string state = \"S0\";\nwhile (delta.TryGetValue((state, tape[head]), out var t))\n{\n    (state, tape[head], int move) = (t.Item1, t.Item2, t.Item3);\n    head += move;\n}\n// halts in S3 after 8 steps with 11111 on the tape (3 + 2 = 5)", cap: "A Turing machine simulator in C#. Checked by running: the trace below is its output." } },
    { diagram: "turing-machine" },

    { page: "Tracing" },
    { table: { head: ["Step", "State", "Tape (head in [ ])"], rows: [
      ["0", "S0", "[1] 1 1 # 1 1 □"], ["1", "S0", "1 [1] 1 # 1 1 □"], ["2", "S0", "1 1 [1] # 1 1 □"], ["3", "S0", "1 1 1 [#] 1 1 □"],
      ["4", "S1", "1 1 1 1 [1] 1 □"], ["5", "S1", "1 1 1 1 1 [1] □"], ["6", "S1", "1 1 1 1 1 1 [□]"], ["7", "S2", "1 1 1 1 1 [1] □"], ["8", "S3", "1 1 1 1 [1] □ □ — halt"]
    ] } },
    { steps: [
      "Read the symbol under the head; find the rule for (state, symbol).",
      "WRITE first, then MOVE, then change state — record the whole tape, the head position and the state on a new row.",
      "If there is no rule for (state, symbol) the machine halts."
    ] },
    { worked: { tag: "variation", title: "Trace a bit-flipper", q: "δ(S0, 0) = (S0, 1, →); δ(S0, 1) = (S0, 0, →); δ(S0, □) = (S1, □, ←); S1 halts. Trace it on 101□ starting at the leftmost cell.",
      steps: [
        { m: "S0 reads 1 → writes 0, moves right: 0[0]1□.", mk: "1" },
        { m: "S0 reads 0 → writes 1: 01[1]□; S0 reads 1 → writes 0: 010[□].", mk: "1" },
        { m: "S0 reads □ → writes □, moves left, enters S1: 01[0]□ — halts. Purpose: invert every bit.", mk: "1" }
      ], result: "101 → 010" } },

    { page: "The Universal Turing Machine" },
    { callout: { t: "def", h: "Universal Turing Machine (UTM)", body: "A Turing machine that can **simulate any other Turing machine**: the **description of the machine** and its **input data** are written on the UTM's tape, and the UTM acts as an **interpreter**, faithfully carrying out exactly what that machine would do." } },
    { kv: [
      ["Importance of Turing machines", "a formal model of computation: anything computable can be computed by a Turing machine — they DEFINE what is computable"],
      ["Importance of the UTM", "the idea of the stored-program computer: one machine, many programs, with the program held as data in memory"],
      ["Power", "a UTM has an infinite tape, so it can do anything any real computer can — and more, since real memory is finite"]
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Two more components", src: "A-level June 2018 · P1 Q04.3 · 2 marks",
      q: "To define a Turing machine the finite alphabet of symbols that it can use needs to be specified and there needs to be a tape. State two other components of a Turing machine.",
      steps: [
        { m: "A finite set of states (in a state transition diagram) // a set of transition rules;", mk: "1" },
        { m: "A (sensing) read-write head that moves along the tape one square at a time // a start state // a set of accepting/halting states // a state register;", mk: "1", n: "Max 2." }
      ], result: "States; read-write head (or rules, start/halt states)" } },
    { worked: { tag: "exam", title: "What a UTM is", src: "A-level June 2018 · P1 Q04.4 · 2 marks",
      q: "Explain what a Universal Turing Machine is.",
      steps: [
        { m: "A Turing machine that can execute/simulate the behaviour of any other Turing machine // can compute any computable sequence;", mk: "1" },
        { m: "It faithfully executes operations on the data precisely as the simulated machine does // the description of the machine and its input are stored on the UTM's tape — it acts as an interpreter;", mk: "1", n: "Max 2. The same scheme was used for 2019 Q02.4 and 2023 Q05.3." }
      ], result: "Simulates any TM from its description on the tape" } },
    { worked: { tag: "exam", title: "More powerful than any computer", src: "A-level June 2018 · P1 Q04.5 · 1 mark",
      q: "Why can a Universal Turing Machine be considered to be more powerful than any computer that you can purchase?",
      steps: [{ m: "Because it has an infinite amount of memory / tape;", mk: "1" }], result: "Infinite tape" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Components**: finite states (start + halting), finite alphabet, infinite tape, read-write head, transition rules.",
      "**Rule**: δ(state, read) = (new state, write, move). Diagram label: read | write, move.",
      "**Trace**: write → move → new state; one row per step with the full tape and head.",
      "**UTM**: simulates ANY Turing machine whose description is on its tape (an interpreter); more powerful than real computers because its memory is infinite.",
      "**Importance**: a formal definition of what is computable."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"The head can jump to any square.\" — it moves ONE square at a time.",
      "\"A Turing machine can run any program.\" — an ordinary one has a single fixed program; only the UNIVERSAL one runs others.",
      "Moving before writing in a trace — the rule writes on the CURRENT square, then moves."
    ] } },
    { callout: { t: "mnemonic", h: "\"STAR-H\"", body: "**S**tates · **T**ape (infinite) · **A**lphabet · **R**ules · **H**ead — the five parts of a Turing machine." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.2.1 FSMs (a Turing machine is an FSM plus a tape); 4.4.4.6 computability; 4.4.4.7 the Halting problem; 4.7.1 the stored-program concept; 4.6.3 interpreters." } }
  ],
  flashcards: [
    ["Components of a Turing machine?", "Finite set of states, finite alphabet, infinite tape, read-write head, transition rules (start and halting states)."],
    ["Halting state?", "A state with no outgoing transitions."],
    ["Transition function notation?", "δ(state, read) = (new state, write, move)."],
    ["How far does the head move per step?", "One square, left or right."],
    ["Universal Turing Machine?", "A TM that simulates any other TM whose description and input are on its tape — an interpreter."],
    ["Why is a UTM more powerful than any real computer?", "It has infinite memory (tape)."],
    ["Importance of Turing machines?", "A formal model of computation that defines what is computable."],
    ["Unary 111#11 on the adder → ?", "11111 (3 + 2 = 5), halting in S3 after 8 steps."],
    ["Order of actions in one step?", "Write, move, change state."],
    ["What does the UTM idea underpin?", "The stored-program computer."]
  ],
  quiz: [
    { q: "Which is NOT part of a Turing machine?", opts: ["a random-access memory", "an infinite tape", "a read-write head", "a finite set of states"], ans: 0, why: "Tape is sequential." },
    { q: "δ(S0, #) = (S1, 1, →) means", opts: ["in S0 reading #: write 1, move right, go to S1", "in S1 reading 1: write #", "move left", "halt"], ans: 0, why: "Read the tuple." },
    { q: "A UTM can", opts: ["simulate any Turing machine", "solve the Halting problem", "run faster than any computer", "only add numbers"], ans: 0, why: "Universal." },
    { q: "A UTM is more powerful than a PC because it has", opts: ["infinite memory", "a faster clock", "more states", "a GPU"], ans: 0, why: "A-level 2018 Q04.5." }
  ],
  sims: ["turing-machine"]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
