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
    ["Sequential loops over n?", "O(n) — they add.", 7],
    ["Loop that halves n each time?", "O(log n).", 9]
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
    ["Why is a UTM more powerful than any real computer?", "It has infinite memory (tape).", 5],
    ["Importance of Turing machines?", "A formal model of computation that defines what is computable.", 6],
    ["Unary 111#11 on the adder → ?", "11111 (3 + 2 = 5), halting in S3 after 8 steps.", 7],
    ["Order of actions in one step?", "Write, move, change state.", 8],
    ["What does the UTM idea underpin?", "The stored-program computer.", 9]
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
