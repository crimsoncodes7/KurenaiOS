/* Kurenai OS — data/content/code-u12.js
   Code · Unit 12 · Data structures and algorithms (roadmap 5.3), stage 4.

   Complexity, bits, searching and sorting, recursion's stack frames, and
   the structures behind every library collection built by hand: a linked
   list, stacks and a circular queue, reverse Polish, a hash table, binary
   search trees, graphs with breadth- and depth-first search, Dijkstra and
   A*, and a route planner. It runs on the FULL runtime (where: "sandbox",
   invariant 105): its nodes and trees are classes, which the in-app
   runner does not run. Same contract as units 1–11 (docs/code-plan.md
   §4); every program agrees with .NET (tools/cs_diff.mjs). Step counts
   stand in for timings, so every output is the same on every machine.   */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function run(id, cap, src, o) {
    o = typeof o === "string" ? { stdin: o } : (o || {});
    var r = { id: id, cap: cap, src: src, stdin: o.stdin || "" };
    if (o.fails) r.fails = true;
    return { run: r };
  }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  function uses(re, msg, id) { return { id: id || "uses", test: function (s) { return re.test(s); }, msg: msg }; }
  function noUse(re, msg, id) { return { id: id || "avoid", test: function (s) { return !re.test(s); }, msg: msg }; }

  K.add({ concepts: {
    "big-o": { name: "Big O", lesson: "12.1", about: "how the work grows with n" },
    "bitwise": { name: "Bitwise operators", lesson: "12.2", about: "&, |, ^, ~, << and >>" },
    "bitmasks": { name: "Masks", lesson: "12.2", about: "testing, setting and clearing bits" },
    "linear-search": { name: "Linear search", lesson: "12.3", about: "look at each item in turn" },
    "binary-search": { name: "Binary search", lesson: "12.3", about: "halve a sorted range" },
    "simple-sorts": { name: "Bubble and insertion sort", lesson: "12.4", about: "O(n²) sorts you can trace" },
    "merge-sort": { name: "Merge sort", lesson: "12.5", about: "split, sort, merge: O(n log n)" },
    "quicksort": { name: "Quicksort", lesson: "12.5", about: "partition around a pivot" },
    "stack-frames": { name: "Stack frames", lesson: "12.6", about: "one frame per call in progress" },
    "linked-list": { name: "Linked lists", lesson: "12.7", about: "nodes joined by references" },
    "stack-queue": { name: "Stacks and queues from scratch", lesson: "12.8", about: "LIFO, FIFO, a circular buffer" },
    "rpn": { name: "Reverse Polish notation", lesson: "12.9", about: "postfix and the shunting yard" },
    "hash-table": { name: "Hash tables", lesson: "12.10", about: "hashing, chaining, probing" },
    "bst": { name: "Binary search trees", lesson: "12.11", about: "insert, search and traverse" },
    "graphs": { name: "Graphs", lesson: "12.12", about: "matrices, lists, BFS and DFS" },
    "shortest-path": { name: "Shortest paths", lesson: "12.13", about: "Dijkstra and A*" },
    "route-planner": { name: "A route planner", lesson: "12.14", about: "a graph from data, a path back" }
  } });

  /* ================================================================
     12.1 Complexity and Big O
     ================================================================ */
  lesson("12.1", {
    aqa: "4.4.4.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Two programs give the same answer; on 100 items both are instant. On a million items one finishes in a blink and the other runs all night.",
        "Timing them tells you about one machine on one day. **Counting the steps** tells you how the work **grows** as the input grows — which is what decides whether a program scales.",
        "**Big O** names that growth: O(1), O(log n), O(n), O(n log n), O(n²). It throws away constants and small terms and keeps the shape."
      ] },
      page("Core idea"),
      run("count", "count the steps instead of timing them", 'foreach (int n in new[] { 10, 100, 1000 })\n{\n    long once = 0, pairs = 0, halves = 0;\n    for (int i = 0; i < n; i++) once++;\n    for (int i = 0; i < n; i++)\n        for (int j = 0; j < n; j++) pairs++;\n    for (int k = n; k > 1; k /= 2) halves++;\n    Console.WriteLine($"n={n,-5} O(n) {once,-6} O(n²) {pairs,-8} O(log n) {halves}");\n}'),
      { ul: [
        "One loop over n does n steps: **O(n)**, linear. Ten times the input, ten times the work.",
        "A loop inside a loop does n × n: **O(n²)**, quadratic. Ten times the input, a hundred times the work.",
        "Halving until one is left takes about log₂ n steps: **O(log n)**. A thousand items need only nine halvings."
      ] },
      run("growth", "the common orders side by side", 'Console.WriteLine($"{"n",6} {"log n",6} {"n log n",9} {"n²",10}");\nforeach (int n in new[] { 8, 64, 1024 })\n{\n    int lg = (int)Math.Log2(n);\n    Console.WriteLine($"{n,6} {lg,6} {n * lg,9} {(long)n * n,10}");\n}'),
      page("Rules"),
      { table: { head: ["Order", "Name", "Example"], rows: [
        ["O(1)", "constant", "an array index, a dictionary lookup"],
        ["O(log n)", "logarithmic", "binary search (12.3), a balanced tree"],
        ["O(n)", "linear", "linear search, summing a list"],
        ["O(n log n)", "linearithmic", "merge sort (12.5), Array.Sort"],
        ["O(n²)", "quadratic", "bubble sort (12.4), comparing every pair"],
        ["O(2ⁿ)", "exponential", "trying every subset; naive recursive Fibonacci"]
      ] } },
      { ul: [
        "Keep the **dominant term** and drop constants: 3n² + 5n + 2 is O(n²).",
        "Loops in sequence **add** (O(n) + O(n) = O(n)); loops nested **multiply** (O(n) × O(n) = O(n²)).",
        "A method call costs whatever that method costs: a `List.Insert(0, x)` inside a loop is O(n) inside O(n).",
        "Big O usually means the **worst case**; say so when you mean the average or best case.",
        "**Space complexity** counts memory the same way: a copy of the input is O(n) extra; swapping in place is O(1)."
      ] },
      page("Variations"),
      { h: "The dominant term wins" },
      run("dominant", "3n² + 5n + 2 behaves like 3n² once n is large", 'foreach (long n in new long[] { 1, 10, 100, 10000 })\n{\n    long f = 3 * n * n + 5 * n + 2;\n    Console.WriteLine($"n={n,-6} f(n)={f,-12} f(n)/n² = {(double)f / (n * n):F3}");\n}'),
      { h: "A cost hidden in a library call" },
      run("hidden", "Contains on a List looks at every item; on a HashSet it hashes once", 'var list = new List<int>();\nvar set = new HashSet<int>();\nfor (int i = 0; i < 1000; i++) { list.Add(i); set.Add(i); }\nint looked = 0;\nforeach (int x in list) { looked++; if (x == 999) break; }\nConsole.WriteLine($"List: looked at {looked} items to find 999");\nConsole.WriteLine($"HashSet: {set.Contains(999)} after one hash");'),
      { h: "Space: a copy or in place" },
      run("space", "reversing with O(n) extra memory, then with O(1)", 'int[] a = { 1, 2, 3, 4, 5 };\nint[] copy = new int[a.Length];\nfor (int i = 0; i < a.Length; i++) copy[i] = a[a.Length - 1 - i];\nConsole.WriteLine(string.Join(" ", copy));\nfor (int i = 0, j = a.Length - 1; i < j; i++, j--) (a[i], a[j]) = (a[j], a[i]);\nConsole.WriteLine(string.Join(" ", a));'),
      page("Pitfalls"),
      { h: "Math.Log2 gives a double — CS0266" },
      run("pit-log", "a logarithm is not a whole number", 'int n = 1000;\nint steps = Math.Log2(n);\nConsole.WriteLine(steps);'),
      { h: "A quadratic loop in disguise" },
      run("pit-insert", "Insert(0, …) shifts every item along: n inserts cost about n²/2 moves", 'var xs = new List<int>();\nlong moves = 0;\nfor (int i = 0; i < 1000; i++)\n{\n    moves += xs.Count;\n    xs.Insert(0, i);\n}\nConsole.WriteLine($"{moves} items shifted for 1000 inserts");'),
      { h: "\"O(1) is always faster\"" },
      "Big O describes growth, not speed at a given size. A hash lookup has a large constant; for five items a linear scan can win. Measure when it matters — choose by Big O when n will grow.",
      page("Connections"),
      { ul: [ "**Back:** 4.x collections — now you know why a HashSet lookup is O(1) and a List's is O(n).", "**Next:** every lesson in this unit states the complexity of what it builds; 12.3 and 12.5 meet O(log n) and O(n log n).", "**AQA:** 4.4.4.3 order of complexity (with 4.4.4.x tractability)." ] },
      page("Good practice"),
      { ul: [ "Before optimising, find the loop that grows fastest: that is where the time goes.", "State a method's complexity in its comment when it is not O(1) or O(n).", "Prefer the collection whose common operation is cheap for your use: HashSet for \"is it there?\", List for order." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Count the steps* and *Any repeats?*." ] },
      page("Quick reference"),
      run("qr", "nested and halving loops", 'int n = 16, nested = 0, halved = 0;\nfor (int i = 0; i < n; i++) for (int j = 0; j < n; j++) nested++;\nfor (int m = n; m > 1; m /= 2) halved++;\nConsole.WriteLine($"{nested} {halved}");'),
      { ul: [ "Sequence adds, nesting multiplies; keep the dominant term.", "O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).", "Count steps; time only to confirm." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0266", "a double put in an int without a cast", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int n = 5, c = 0;\nfor (int i = 0; i < n; i++)\n    for (int j = i + 1; j < n; j++) c++;\nConsole.WriteLine(c);', why: "Every pair once: 4 + 3 + 2 + 1 = 10 = n(n − 1)/2, still O(n²).", concepts: ["big-o"] },
        { id: "p2", src: 'int c = 0;\nfor (int m = 100; m >= 1; m /= 2) c++;\nConsole.WriteLine(c);', why: "100, 50, 25, 12, 6, 3, 1: seven steps, about log₂ 100.", concepts: ["big-o"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the Big O of this method (as text).", src: 'Console.WriteLine("@@");\n\n// static int Sum(int[] xs) { int t = 0; foreach (int x in xs) t += x; return t; }', out: "O(n)", answer: "O(n)", concepts: ["big-o"] }
      ],
      bug: [
        { id: "b1", q: "It should count the pairs (i, j) with i < j for n = 4: 6.", src: 'int n = 4, c = 0;\nfor (int i = 0; i < n; i++)\n    for (int j = 0; j < n; j++) c++;\nConsole.WriteLine(c);', out: "6", fixedText: "prints 6", why: "The inner loop must start after i: for (int j = i + 1; j < n; j++).", concepts: ["big-o"] }
      ]
    },
    flashcards: [
      ["What does Big O describe?", "How the work (or memory) grows as the input size n grows — not the time on one machine."],
      ["3n² + 5n + 2 in Big O?", "O(n²): keep the dominant term, drop constants."],
      ["Two loops one after the other, each O(n)?", "O(n): sequence adds."],
      ["A loop inside a loop, each over n?", "O(n²): nesting multiplies."],
      ["Order these: O(n log n), O(1), O(n²), O(log n), O(n).", "O(1), O(log n), O(n), O(n log n), O(n²)."],
      ["What is space complexity?", "How the extra memory grows with n; in place is O(1)."]
    ],
    quiz: [
      { q: "Binary search on a million sorted items needs about…", opts: ["1,000,000 steps", "20 steps", "1,000 steps", "1 step"], ans: 1, why: "log₂ 1,000,000 ≈ 20." },
      { q: "Doubling n for an O(n²) algorithm multiplies the work by…", opts: ["2", "4", "log 2", "n"], ans: 1, why: "(2n)² = 4n²." },
      { q: "`foreach (x in xs) list.Insert(0, x);` on a List is…", opts: ["O(n)", "O(n²)", "O(log n)", "O(1)"], ans: 1, why: "Each Insert at the front shifts every item: O(n) inside O(n)." }
    ]
  });
  K.add({ tasks: {
    "12.1-steps": { lesson: "12.1", title: "Count the steps", tier: "warm-up", minutes: 10, concepts: ["big-o"],
      statement: ["Read n. Count, with real loops, the steps of three loops and print `linear L, pairs P, halvings H`:", "linear — `for i < n`; pairs — every pair i < j below n (`for i < n`, `for j = i + 1 < n`); halvings — `for (m = n; m > 1; m /= 2)`."],
      starter: 'int n = int.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "8", out: "linear 8, pairs 28, halvings 3" }],
      hidden: [{ stdin: "1", out: "linear 1, pairs 0, halvings 0" }, { stdin: "1000", out: "linear 1000, pairs 499500, halvings 9" }],
      rules: [uses(/for\s*\([^)]*\)\s*\{?\s*for\s*\(/, "Count the pairs with a loop inside a loop.", "nested"), noUse(/n\s*\*\s*\(\s*n\s*-\s*1\s*\)/, "Count them with loops, not the formula.", "noformula")],
      hints: ["long linear = 0; for (int i = 0; i < n; i++) linear++;", "for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) pairs++;", "for (int m = n; m > 1; m /= 2) halvings++;"],
      answer: 'int n = int.Parse(Console.ReadLine() ?? "0");\nlong linear = 0, pairs = 0, halvings = 0;\nfor (int i = 0; i < n; i++) linear++;\nfor (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) pairs++;\nfor (int m = n; m > 1; m /= 2) halvings++;\nConsole.WriteLine($"linear {linear}, pairs {pairs}, halvings {halvings}");' },
    "12.1-repeat": { lesson: "12.1", title: "Any repeats?", tier: "core", minutes: 15, concepts: ["big-o"],
      statement: ["Read whole numbers on one line. In O(n) — one pass with a HashSet, no loop inside a loop — print the first number that appears a second time (`repeat X at position P`, P counting from 1 where the second copy is) or `no repeats`."],
      starter: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n',
      examples: [{ stdin: "4 7 1 7 4", out: "repeat 7 at position 4" }],
      hidden: [{ stdin: "1 2 3", out: "no repeats" }, { stdin: "", out: "no repeats" }, { stdin: "5 5", out: "repeat 5 at position 2" }],
      rules: [uses(/HashSet</, "Remember what you have seen in a HashSet."), noUse(/for\s*\([^)]*\)[^;{]*\{?[^}]*for\s*\(|foreach[^{]*\{?[^}]*foreach/, "One pass only — no loop inside a loop.", "onepass")],
      hints: ["var seen = new HashSet<int>();", "for (int i = 0; i < xs.Length; i++) if (!seen.Add(xs[i])) { …; return; }", "HashSet.Add returns false when the value is already there."],
      answer: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\nvar seen = new HashSet<int>();\nfor (int i = 0; i < xs.Length; i++)\n{\n    if (!seen.Add(xs[i]))\n    {\n        Console.WriteLine($"repeat {xs[i]} at position {i + 1}");\n        return;\n    }\n}\nConsole.WriteLine("no repeats");' }
  } });

  /* ================================================================
     12.2 Bits and bitwise operators
     ================================================================ */
  lesson("12.2", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "An int is 32 bits. Sometimes the bits themselves are the data: eight on/off settings in one byte, a colour's red, green and blue packed into one number, permissions (7.9's flags), a network mask.",
        "**Bitwise operators** work on every bit at once: AND keeps, OR sets, XOR flips, shifts move.",
        "They are how hardware, file formats and fast code talk — and AQA expects you to trace them."
      ] },
      page("Core idea"),
      run("ops", "the six operators on two bytes", 'int a = 0b_1100_1010, b = 0b_1010_0110;\nstring B(int x) => Convert.ToString(x & 0xFF, 2).PadLeft(8, \'0\');\nConsole.WriteLine($"a      {B(a)}");\nConsole.WriteLine($"b      {B(b)}");\nConsole.WriteLine($"a & b  {B(a & b)}");\nConsole.WriteLine($"a | b  {B(a | b)}");\nConsole.WriteLine($"a ^ b  {B(a ^ b)}");\nConsole.WriteLine($"~a     {B(~a)}");\nConsole.WriteLine($"a << 1 {B(a << 1)}");\nConsole.WriteLine($"a >> 2 {B(a >> 2)}");'),
      { ul: [
        "`&` (AND): 1 only where **both** are 1. `|` (OR): 1 where **either** is. `^` (XOR): 1 where they **differ**. `~` (NOT): flips every bit.",
        "`<<` shifts left (each place doubles); `>>` shifts right (each place halves, rounding down).",
        "`0b_1100_1010` is a binary literal; `_` only groups digits. `0xFF` is hexadecimal."
      ] },
      run("bit", "test, set, clear and flip bit k", 'int x = 0b_0101;\nint k = 1;\nConsole.WriteLine((x >> k) & 1);\nConsole.WriteLine(Convert.ToString(x | (1 << k), 2));\nConsole.WriteLine(Convert.ToString(x & ~(1 << 2), 2));\nConsole.WriteLine(Convert.ToString(x ^ 0b_1111, 2));'),
      page("Rules"),
      { table: { head: ["Want", "Write", "Why"], rows: [
        ["is bit k set?", "`(x >> k) & 1` or `(x & (1 << k)) != 0`", "move it to the end, or mask it"],
        ["set bit k", "`x | (1 << k)`", "OR with a single 1"],
        ["clear bit k", "`x & ~(1 << k)`", "AND with all ones but one"],
        ["flip bit k", "`x ^ (1 << k)`", "XOR flips where the mask is 1"],
        ["the low 4 bits", "`x & 0xF`", "a mask keeps what it has 1s for"],
        ["× 2ᵏ, ÷ 2ᵏ", "`x << k`, `x >> k`", "for non-negative whole numbers"]
      ] } },
      { ul: [
        "`&`, `|` and `^` on **bool** are logical operators that always evaluate both sides; on ints they work bit by bit.",
        "Precedence trap: `==` binds tighter than `&`, so `x & 1 == 1` means `x & (1 == 1)`. Bracket bit tests.",
        "`>>` on a negative int keeps the sign (arithmetic shift); `>>>` (C# 11) fills with zeros.",
        "`Convert.ToString(x, 2)` prints binary; `x.ToString(\"X2\")` hexadecimal."
      ] },
      page("Variations"),
      { h: "Packing a colour" },
      run("rgb", "three bytes in one int: 0xRRGGBB", 'int colour = 0xFF8000;\nint r = (colour >> 16) & 0xFF, g = (colour >> 8) & 0xFF, b = colour & 0xFF;\nConsole.WriteLine($"{r} {g} {b}");\nint back = (r << 16) | (g << 8) | b;\nConsole.WriteLine(back.ToString("X6"));'),
      { h: "Tricks worth knowing" },
      run("tricks", "power of two, counting ones, swapping with XOR", 'foreach (int n in new[] { 1, 6, 8, 1024 })\n    Console.WriteLine($"{n}: power of two {n > 0 && (n & (n - 1)) == 0}, ones {System.Numerics.BitOperations.PopCount((uint)n)}");\nint a = 5, b = 9;\na ^= b; b ^= a; a ^= b;\nConsole.WriteLine($"{a} {b}");'),
      { h: "Signed shifts" },
      run("signs", ">> keeps the sign; >>> does not", 'int m = -16;\nConsole.WriteLine(m >> 2);\nConsole.WriteLine(m >>> 28);\nConsole.WriteLine(Convert.ToString(m, 2));'),
      page("Pitfalls"),
      { h: "Forgetting brackets — CS0019" },
      run("pit-precedence", "== runs first, leaving int & bool", 'int x = 5;\nif (x & 1 == 1) Console.WriteLine("odd");'),
      { h: "Shifting past the width" },
      run("pit-width", "an int shift uses only the low 5 bits of the count: 1 << 32 is 1", 'Console.WriteLine(1 << 31);\nConsole.WriteLine(1 << 32);\nConsole.WriteLine(1L << 32);'),
      { h: "XOR swap of a variable with itself" },
      "`a ^= a` makes it 0; an XOR swap of two references to the same array slot zeroes it. A tuple swap `(a, b) = (b, a)` is clearer and always safe.",
      page("Connections"),
      { ul: [ "**Back:** 7.9 [Flags] enums are bit masks with names; 1.x binary literals.", "**Next:** 12.10 hash functions mix bits; T5 computer systems goes down to the CPU.", "**AQA:** 4.5.x binary, bit patterns and the bitwise operations AND, OR, XOR, NOT and shifts." ] },
      page("Good practice"),
      { ul: [ "Name your masks: `const int Bold = 1 << 0, Italic = 1 << 1;` (or a [Flags] enum).", "Always bracket a bit test.", "Use bit tricks where bits are the data; write ordinary arithmetic elsewhere." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Bit report* and *Swap the channels*." ] },
      page("Quick reference"),
      run("qr", "set, test, clear", 'int f = 0;\nf |= 1 << 3;\nConsole.WriteLine((f & (1 << 3)) != 0);\nf &= ~(1 << 3);\nConsole.WriteLine(f);'),
      { ul: [ "`&` keep · `|` set · `^` flip · `~` invert · `<<` `>>` shift.", "Bracket bit tests: `(x & m) != 0`.", "`Convert.ToString(x, 2)`, `ToString(\"X\")`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0019", "& between an int and a bool", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine((12 & 10) + " " + (12 | 10) + " " + (12 ^ 10));', why: "1100 & 1010 = 1000 (8); | = 1110 (14); ^ = 0110 (6).", concepts: ["bitwise"] },
        { id: "p2", src: 'int x = 0b_1011;\nConsole.WriteLine(((x >> 2) & 1) + " " + (x << 2));', why: "Bit 2 of 1011 is 0; 1011 shifted left twice is 101100 = 44.", concepts: ["bitwise", "bitmasks"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to clear bit 0 (make an odd number even).", src: 'int x = 7;\nConsole.WriteLine(x @@);', out: "6", answer: "& ~1", concepts: ["bitmasks"] }
      ],
      bug: [
        { id: "b1", q: "It should print True for an even number: 10 is even.", src: 'int n = 10;\nConsole.WriteLine((n & 1) == 1);', out: "True", fixedText: "prints True", why: "The lowest bit is 1 for ODD numbers; even means (n & 1) == 0.", concepts: ["bitmasks"] }
      ]
    },
    flashcards: [
      ["What does x & mask do?", "Keeps only the bits where the mask has 1s."],
      ["How do you set bit k?", "`x | (1 << k)`."],
      ["How do you clear bit k?", "`x & ~(1 << k)`."],
      ["What does XOR give for two equal bits?", "0 — it is 1 only where they differ."],
      ["Why bracket `(x & 1) == 1`?", "== binds tighter than &."],
      ["A power-of-two test with bits?", "`n > 0 && (n & (n - 1)) == 0`."]
    ],
    quiz: [
      { q: "`6 << 2` is…", opts: ["8", "24", "1", "12"], ans: 1, why: "Each left shift doubles: 6 → 12 → 24." },
      { q: "`0xF0 & 0x3C` in binary is…", opts: ["11111100", "00110000", "11001100", "00001100"], ans: 1, why: "11110000 & 00111100 = 00110000." },
      { q: "Which flips bit 3 of x?", opts: ["x | 8", "x & ~8", "x ^ 8", "x >> 3"], ans: 2, why: "XOR with a mask flips exactly the masked bits." }
    ]
  });
  K.add({ tasks: {
    "12.2-report": { lesson: "12.2", title: "Bit report", tier: "core", minutes: 15, concepts: ["bitwise", "bitmasks"],
      statement: ["Read whole numbers from 0 to 255, one per line, until the end. For each print `N: BBBBBBBB, ones K, top bit T, power of two P`, where B is the 8-bit binary, K the number of 1 bits (count them with a loop and `&`), T the value of bit 7 (0 or 1) and P `yes` or `no`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "5\n128", out: "5: 00000101, ones 2, top bit 0, power of two no\n128: 10000000, ones 1, top bit 1, power of two yes" }],
      hidden: [{ stdin: "0", out: "0: 00000000, ones 0, top bit 0, power of two no" }, { stdin: "255\n64", out: "255: 11111111, ones 8, top bit 1, power of two no\n64: 01000000, ones 1, top bit 0, power of two yes" }],
      rules: [uses(/&\s*1\b|&\s*\(\s*1\s*<</, "Test bits with &.", "and"), noUse(/PopCount/, "Count the ones yourself with a loop.", "nopop")],
      hints: ["Convert.ToString(n, 2).PadLeft(8, '0')", "int ones = 0; for (int k = 0; k < 8; k++) ones += (n >> k) & 1;", "bool pow = n > 0 && (n & (n - 1)) == 0;"],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    int n = int.Parse(line);\n    int ones = 0;\n    for (int k = 0; k < 8; k++) ones += (n >> k) & 1;\n    bool pow = n > 0 && (n & (n - 1)) == 0;\n    Console.WriteLine($"{n}: {Convert.ToString(n, 2).PadLeft(8, \'0\')}, ones {ones}, top bit {(n >> 7) & 1}, power of two {(pow ? "yes" : "no")}");\n}' },
    "12.2-rgb": { lesson: "12.2", title: "Swap the channels", tier: "stretch", minutes: 20, concepts: ["bitwise", "bitmasks"],
      statement: ["Read colours as `#RRGGBB`, one per line, until the end. For each print `r g b` (0–255, from shifts and masks) and the colour with its red and blue swapped, as `#BBGGRR` in upper-case hex — built back with shifts and `|`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    int c = Convert.ToInt32(line.TrimStart(\'#\'), 16);\n}\n',
      examples: [{ stdin: "#FF8000", out: "255 128 0 #0080FF" }],
      hidden: [{ stdin: "#000000\n#123456", out: "0 0 0 #000000\n18 52 86 #563412" }, { stdin: "#ffffff", out: "255 255 255 #FFFFFF" }],
      rules: [uses(/>>\s*16/, "Take red out with >> 16.", "shift"), uses(/<<\s*16/, "Put the blue back with << 16.", "back"), uses(/&\s*0x[fF]{2}\b|&\s*255\b/, "Mask a byte with & 0xFF.", "mask")],
      hints: ["int r = (c >> 16) & 0xFF, g = (c >> 8) & 0xFF, b = c & 0xFF;", "int swapped = (b << 16) | (g << 8) | r;", "Console.WriteLine($\"{r} {g} {b} #{swapped:X6}\");"],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    int c = Convert.ToInt32(line.TrimStart(\'#\'), 16);\n    int r = (c >> 16) & 0xFF, g = (c >> 8) & 0xFF, b = c & 0xFF;\n    int swapped = (b << 16) | (g << 8) | r;\n    Console.WriteLine($"{r} {g} {b} #{swapped:X6}");\n}' }
  } });

  /* ================================================================
     12.3 Linear and binary search
     ================================================================ */
  lesson("12.3", {
    aqa: "4.3.4.2",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Finding one name among a million: look at every name in turn and, on average, you read half a million.",
        "If the names are **sorted**, look at the middle one: the target is either there, or in the left half, or in the right half. Throw the other half away and repeat.",
        "That is **binary search**: about 20 looks for a million items, O(log n) — against **linear search**'s O(n)."
      ] },
      page("Core idea"),
      run("linear", "linear search: look at each item in turn", 'int[] xs = { 4, 8, 15, 16, 23, 42 };\nforeach (int target in new[] { 23, 5 })\n{\n    int found = -1, looks = 0;\n    for (int i = 0; i < xs.Length; i++)\n    {\n        looks++;\n        if (xs[i] == target) { found = i; break; }\n    }\n    Console.WriteLine($"{target}: index {found} after {looks} looks");\n}'),
      run("binary", "binary search: halve the sorted range each time", 'int[] xs = { 4, 8, 15, 16, 23, 42 };\nforeach (int target in new[] { 23, 5 })\n{\n    int lo = 0, hi = xs.Length - 1, found = -1, looks = 0;\n    while (lo <= hi)\n    {\n        int mid = lo + (hi - lo) / 2;\n        looks++;\n        if (xs[mid] == target) { found = mid; break; }\n        if (xs[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    Console.WriteLine($"{target}: index {found} after {looks} looks");\n}'),
      { ul: [
        "`lo` and `hi` bound the part still possible; the loop runs while it is not empty (`lo <= hi`).",
        "Each look discards half: `lo = mid + 1` or `hi = mid - 1` — never `mid` itself, or it may loop for ever.",
        "`lo + (hi - lo) / 2` is the middle without the overflow `(lo + hi) / 2` risks on huge arrays."
      ] },
      page("Rules"),
      { table: { head: ["", "Linear search", "Binary search"], rows: [["Data", "any order", "sorted"], ["Worst case", "O(n)", "O(log n)"], ["1,000 items", "≤ 1,000 looks", "≤ 10 looks"], ["Works on", "lists, files, streams", "anything indexable and sorted"]] } },
      { ul: [
        "Binary search needs the data **sorted** by the same comparison it searches with.",
        "Sorting first costs O(n log n): worth it when you will search many times.",
        "`Array.BinarySearch` and `List.BinarySearch` return the index, or — when missing — a negative number: `~result` is where it would be inserted.",
        "A recursive version (12.6) passes `lo` and `hi` down; the iterative one is usual in C#."
      ] },
      page("Variations"),
      { h: "The library's version" },
      run("library", "a negative result says where it would go", 'int[] xs = { 4, 8, 15, 16, 23, 42 };\nConsole.WriteLine(Array.BinarySearch(xs, 16));\nint r = Array.BinarySearch(xs, 20);\nConsole.WriteLine($"{r} → insert at {~r}");'),
      { h: "The first of several equal items" },
      run("first", "keep going left after a match", 'int[] xs = { 1, 3, 3, 3, 5, 8 };\nint lo = 0, hi = xs.Length - 1, first = -1;\nwhile (lo <= hi)\n{\n    int mid = lo + (hi - lo) / 2;\n    if (xs[mid] >= 3) { if (xs[mid] == 3) first = mid; hi = mid - 1; }\n    else lo = mid + 1;\n}\nConsole.WriteLine(first);'),
      { h: "Searching for an answer" },
      run("answer", "the whole-number square root: the largest r with r² ≤ n", 'foreach (long n in new long[] { 0, 15, 16, 1_000_000_007 })\n{\n    long lo = 0, hi = Math.Min(n, 3_037_000_499), best = 0;\n    while (lo <= hi)\n    {\n        long mid = lo + (hi - lo) / 2;\n        if (mid * mid <= n) { best = mid; lo = mid + 1; }\n        else hi = mid - 1;\n    }\n    Console.WriteLine($"isqrt({n}) = {best}");\n}'),
      page("Pitfalls"),
      { h: "A double middle — CS0266" },
      run("pit-mid", "dividing by 2.0 gives a double", 'int lo = 0, hi = 9;\nint mid = (lo + hi) / 2.0;'),
      { h: "Binary search on unsorted data" },
      run("pit-unsorted", "it does not crash — it just answers wrongly", 'int[] xs = { 42, 4, 23, 8, 16, 15 };\nConsole.WriteLine(Array.BinarySearch(xs, 23) >= 0);\nConsole.WriteLine(Array.BinarySearch(xs, 8) >= 0);'),
      { h: "lo = mid instead of mid + 1" },
      "With `lo = mid` a two-item range whose middle is the left item never shrinks: the loop runs for ever. Always move past `mid`.",
      page("Connections"),
      { ul: [ "**Back:** 4.x Sort and IndexOf; 12.1 O(log n).", "**Next:** 12.11 a binary search tree keeps data searchable while it changes; 12.5 sorting first.", "**AQA:** 4.3.4.1 linear search, 4.3.4.2 binary search (and their time complexity)." ] },
      page("Good practice"),
      { ul: [ "Use HashSet or Dictionary for \"is it there?\"; binary search when you also need order (the nearest, a range).", "Test the edges: empty, one item, first, last, missing below, missing above.", "Write `lo + (hi - lo) / 2`." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Count the looks* and *Square roots by halving*." ] },
      page("Quick reference"),
      run("qr", "binary search in eight lines", 'int[] a = { 2, 5, 9, 14 };\nint Find(int t) { int lo = 0, hi = a.Length - 1; while (lo <= hi) { int m = lo + (hi - lo) / 2; if (a[m] == t) return m; if (a[m] < t) lo = m + 1; else hi = m - 1; } return -1; }\nConsole.WriteLine($"{Find(9)} {Find(10)}");'),
      { ul: [ "Sorted data; `while (lo <= hi)`; move past mid.", "Linear O(n), binary O(log n).", "`Array.BinarySearch`: `~r` is the insertion point." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0266", "a double put in an int", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int[] xs = { 1, 3, 5, 7, 9, 11, 13 };\nint lo = 0, hi = 6, looks = 0;\nwhile (lo <= hi)\n{\n    int mid = lo + (hi - lo) / 2;\n    looks++;\n    if (xs[mid] == 11) break;\n    if (xs[mid] < 11) lo = mid + 1; else hi = mid - 1;\n}\nConsole.WriteLine(looks);', why: "Middles: 7 (index 3), then 11 (index 5): two looks.", concepts: ["binary-search"] },
        { id: "p2", src: 'int r = Array.BinarySearch(new[] { 10, 20, 30 }, 25);\nConsole.WriteLine(~r);', why: "25 would go before 30, at index 2.", concepts: ["binary-search"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the search moves past the middle into the right half.", src: 'int[] xs = { 2, 4, 6, 8 };\nint lo = 0, hi = 3, t = 8, at = -1;\nwhile (lo <= hi)\n{\n    int mid = lo + (hi - lo) / 2;\n    if (xs[mid] == t) { at = mid; break; }\n    if (xs[mid] < t) lo = @@;\n    else hi = mid - 1;\n}\nConsole.WriteLine(at);', out: "3", answer: "mid + 1", concepts: ["binary-search"] }
      ],
      bug: [
        { id: "b1", q: "It should find 9 at index 4.", src: 'int[] xs = { 1, 3, 5, 7, 9 };\nint lo = 0, hi = xs.Length - 1, at = -1;\nwhile (lo < hi)\n{\n    int mid = lo + (hi - lo) / 2;\n    if (xs[mid] == 9) { at = mid; break; }\n    if (xs[mid] < 9) lo = mid + 1; else hi = mid - 1;\n}\nConsole.WriteLine(at);', out: "4", fixedText: "prints 4", why: "With lo < hi the last single item is never looked at; the loop must run while lo <= hi.", concepts: ["binary-search"] }
      ]
    },
    flashcards: [
      ["What must be true before a binary search?", "The data is sorted by the same comparison."],
      ["Worst-case looks for binary search on 1,000 items?", "About 10 (log₂ 1,000)."],
      ["Why `lo + (hi - lo) / 2`?", "It never overflows, unlike (lo + hi) / 2."],
      ["What does a negative Array.BinarySearch result mean?", "Not found; ~result is where it would be inserted."],
      ["When is linear search the right choice?", "Unsorted data, a single search, or a stream you can only read once."],
      ["What ends the binary search loop when the item is missing?", "lo passes hi: the range is empty."]
    ],
    quiz: [
      { q: "Binary search on 1,000,000 items needs at most about…", opts: ["1,000", "20", "500,000", "1"], ans: 1, why: "2²⁰ ≈ 1,000,000." },
      { q: "Searching an unsorted array with binary search…", opts: ["throws", "may give a wrong answer", "sorts it first", "is O(n)"], ans: 1, why: "It assumes order it does not have." },
      { q: "Linear search's worst case is…", opts: ["O(1)", "O(log n)", "O(n)", "O(n²)"], ans: 2, why: "The item may be last, or missing." }
    ]
  });
  K.add({ tasks: {
    "12.3-looks": { lesson: "12.3", title: "Count the looks", tier: "core", minutes: 20, concepts: ["binary-search"],
      statement: ["Read a line of sorted whole numbers, then one target per line until the end.", "With your own binary search (no Array.BinarySearch, IndexOf or Contains) print `T: index I after L looks` or `T: missing after L looks`, where a look is one middle examined."],
      starter: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n',
      examples: [{ stdin: "4 8 15 16 23 42\n23\n5", out: "23: index 4 after 2 looks\n5: missing after 3 looks" }],
      hidden: [{ stdin: "7\n7\n8", out: "7: index 0 after 1 looks\n8: missing after 1 looks" }, { stdin: "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15\n1\n15\n8", out: "1: index 0 after 4 looks\n15: index 14 after 4 looks\n8: index 7 after 1 looks" }],
      rules: [noUse(/BinarySearch|IndexOf|Contains/, "Search with your own loop.", "own"), uses(/while\s*\(\s*lo\s*<=\s*hi\s*\)/, "Loop while (lo <= hi).", "loop")],
      hints: ["int lo = 0, hi = xs.Length - 1, looks = 0;", "while (lo <= hi) { int mid = lo + (hi - lo) / 2; looks++; … }", "Moving past mid: lo = mid + 1 or hi = mid - 1."],
      answer: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    int t = int.Parse(line);\n    int lo = 0, hi = xs.Length - 1, looks = 0, at = -1;\n    while (lo <= hi)\n    {\n        int mid = lo + (hi - lo) / 2;\n        looks++;\n        if (xs[mid] == t) { at = mid; break; }\n        if (xs[mid] < t) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    Console.WriteLine(at >= 0 ? $"{t}: index {at} after {looks} looks" : $"{t}: missing after {looks} looks");\n}' },
    "12.3-isqrt": { lesson: "12.3", title: "Square roots by halving", tier: "stretch", minutes: 20, concepts: ["binary-search"],
      statement: ["Read whole numbers n (0 to 10¹⁸) one per line until the end. For each print `isqrt(n) = r`, the largest r with r × r ≤ n, found by binary search on r — no Math.Sqrt or Math.Pow. Mind overflow: r never needs to be above 1,000,000,000."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    long n = long.Parse(line);\n}\n',
      examples: [{ stdin: "15\n16", out: "isqrt(15) = 3\nisqrt(16) = 4" }],
      hidden: [{ stdin: "0\n1", out: "isqrt(0) = 0\nisqrt(1) = 1" }, { stdin: "1000000000000000000\n999999999999999999", out: "isqrt(1000000000000000000) = 1000000000\nisqrt(999999999999999999) = 999999999" }],
      rules: [noUse(/Math\.(Sqrt|Pow|Cbrt)/, "Find it by halving, not Math.Sqrt.", "nosqrt"), uses(/while\s*\(\s*lo\s*<=\s*hi\s*\)/, "Binary search on r: while (lo <= hi).", "loop")],
      hints: ["long lo = 0, hi = Math.Min(n, 1_000_000_000), best = 0;", "long mid = lo + (hi - lo) / 2; if (mid * mid <= n) { best = mid; lo = mid + 1; } else hi = mid - 1;", "1,000,000,000² = 10¹⁸ fits in a long."],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    long n = long.Parse(line);\n    long lo = 0, hi = Math.Min(n, 1_000_000_000), best = 0;\n    while (lo <= hi)\n    {\n        long mid = lo + (hi - lo) / 2;\n        if (mid * mid <= n) { best = mid; lo = mid + 1; }\n        else hi = mid - 1;\n    }\n    Console.WriteLine($"isqrt({n}) = {best}");\n}' }
  } });

  /* ================================================================
     12.4 Simple sorts
     ================================================================ */
  lesson("12.4", {
    aqa: "4.3.5.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "`Sort()` has done your sorting since unit 4. To choose sorts wisely, and to answer AQA's trace questions, you need to see one work.",
        "**Bubble sort** walks the list swapping neighbours that are out of order; each pass carries the largest remaining item to the end.",
        "**Insertion sort** grows a sorted part at the front, sliding each new item back to its place — the way most people sort a hand of cards."
      ] },
      page("Core idea"),
      run("bubble", "bubble sort, printing the list after each pass", 'int[] a = { 5, 1, 4, 2, 8 };\nfor (int pass = 1; pass < a.Length; pass++)\n{\n    bool swapped = false;\n    for (int i = 0; i < a.Length - pass; i++)\n    {\n        if (a[i] > a[i + 1])\n        {\n            (a[i], a[i + 1]) = (a[i + 1], a[i]);\n            swapped = true;\n        }\n    }\n    Console.WriteLine($"pass {pass}: {string.Join(" ", a)}");\n    if (!swapped) break;\n}'),
      { ul: [
        "After pass k the last k items are in their final places, so each pass looks one item less far (`a.Length - pass`).",
        "A pass with no swap proves the list sorted: stop early. An already-sorted list costs one pass, O(n).",
        "The tuple swap `(a[i], a[i + 1]) = (a[i + 1], a[i])` needs no temporary variable."
      ] },
      run("insertion", "insertion sort: slide each item back into the sorted part", 'int[] a = { 5, 1, 4, 2, 8 };\nfor (int i = 1; i < a.Length; i++)\n{\n    int item = a[i];\n    int j = i - 1;\n    while (j >= 0 && a[j] > item)\n    {\n        a[j + 1] = a[j];\n        j--;\n    }\n    a[j + 1] = item;\n    Console.WriteLine($"insert {item}: {string.Join(" ", a)}");\n}'),
      page("Rules"),
      { table: { head: ["", "Bubble sort", "Insertion sort"], rows: [["Worst / average", "O(n²)", "O(n²)"], ["Already sorted", "O(n) with the early stop", "O(n)"], ["Extra memory", "O(1)", "O(1)"], ["Stable", "yes", "yes"], ["Good for", "teaching, traces", "small or nearly sorted lists"]] } },
      { ul: [
        "A sort is **stable** when equal items keep their original order — it matters when sorting by one key after another.",
        "Both sort **in place**: they rearrange the array they are given.",
        "Compare with `>` (not `>=`) so equal items are never swapped — that is what keeps them stable.",
        "Real libraries switch to insertion sort for short runs because it is fast on small, nearly sorted data."
      ] },
      page("Variations"),
      { h: "Counting the work" },
      run("counts", "comparisons on sorted, random and reversed input", 'int Bubble(int[] a)\n{\n    int c = 0;\n    for (int pass = 1; pass < a.Length; pass++)\n    {\n        bool swapped = false;\n        for (int i = 0; i < a.Length - pass; i++) { c++; if (a[i] > a[i + 1]) { (a[i], a[i + 1]) = (a[i + 1], a[i]); swapped = true; } }\n        if (!swapped) break;\n    }\n    return c;\n}\nint n = 100;\nint[] sorted = Enumerable.Range(1, n).ToArray();\nint[] reversed = Enumerable.Range(1, n).Reverse().ToArray();\nint[] mixed = Enumerable.Range(1, n).Select(i => i * 37 % n).ToArray();\nConsole.WriteLine($"sorted {Bubble(sorted)}, mixed {Bubble(mixed)}, reversed {Bubble(reversed)}");'),
      { h: "Stability" },
      run("stable", "sort by mark; equal marks keep their name order", 'var rows = new[] { ("Ada", 70), ("Bo", 60), ("Cy", 70), ("Di", 60) };\nfor (int i = 1; i < rows.Length; i++)\n{\n    var item = rows[i];\n    int j = i - 1;\n    while (j >= 0 && rows[j].Item2 > item.Item2) { rows[j + 1] = rows[j]; j--; }\n    rows[j + 1] = item;\n}\nConsole.WriteLine(string.Join(", ", rows.Select(r => $"{r.Item1} {r.Item2}")));'),
      { h: "Any comparable type" },
      run("generic", "insertion sort for any T that compares", 'var words = new[] { "pear", "fig", "apple" };\nInsertionSort(words);\nConsole.WriteLine(string.Join(" ", words));\n\nstatic void InsertionSort<T>(T[] a) where T : IComparable<T>\n{\n    for (int i = 1; i < a.Length; i++)\n    {\n        T item = a[i];\n        int j = i - 1;\n        while (j >= 0 && a[j].CompareTo(item) > 0) { a[j + 1] = a[j]; j--; }\n        a[j + 1] = item;\n    }\n}'),
      page("Pitfalls"),
      { h: "Passing a List where the method wants an array — CS1503" },
      run("pit-type", "BubbleSort takes int[]", 'var xs = new List<int> { 3, 1, 2 };\nBubbleSort(xs);\n\nstatic void BubbleSort(int[] a) { }'),
      { h: "One step too far" },
      run("pit-bounds", "i < a.Length lets a[i + 1] read past the end", 'int[] a = { 3, 1, 2 };\nfor (int i = 0; i < a.Length; i++)\n    if (a[i] > a[i + 1]) (a[i], a[i + 1]) = (a[i + 1], a[i]);'),
      { h: ">= makes the sort unstable" },
      "Swapping when `a[i] >= a[i + 1]` swaps equal neighbours too: the sort still sorts, but equal items lose their order — and it does more work.",
      page("Connections"),
      { ul: [ "**Back:** 4.x Sort; 8.4 IComparable; 9.2 generic methods with constraints.", "**Next:** 12.5 sorts in O(n log n); 12.6 traces recursion.", "**AQA:** 4.3.5.1 bubble sort (trace it, and its O(n²) time complexity)." ] },
      page("Good practice"),
      { ul: [ "In real code call `Array.Sort`/`List.Sort` (or `OrderBy` when you need stability).", "When tracing by hand, write the list after every pass, as the listing does.", "Keep the early stop: it makes bubble sort O(n) on sorted data." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Bubble, pass by pass* and *Insertion shifts*." ] },
      page("Quick reference"),
      run("qr", "insertion sort in seven lines", 'int[] a = { 3, 9, 1, 7 };\nfor (int i = 1; i < a.Length; i++)\n{\n    int x = a[i], j = i - 1;\n    while (j >= 0 && a[j] > x) { a[j + 1] = a[j]; j--; }\n    a[j + 1] = x;\n}\nConsole.WriteLine(string.Join(" ", a));'),
      { ul: [ "Bubble: neighbours swap; largest to the end each pass; stop on a pass with no swap.", "Insertion: slide each item back.", "Both O(n²), in place, stable." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1503", "an argument of the wrong type", "Pitfalls"], ["IndexOutOfRangeException", "a[i + 1] past the end", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int[] a = { 4, 3, 2, 1 };\nfor (int i = 0; i < a.Length - 1; i++)\n    if (a[i] > a[i + 1]) (a[i], a[i + 1]) = (a[i + 1], a[i]);\nConsole.WriteLine(string.Join(" ", a));', why: "One bubble pass carries 4 to the end: 3 2 1 4.", concepts: ["simple-sorts"] },
        { id: "p2", src: 'int[] a = { 2, 5, 1 };\nint shifts = 0;\nfor (int i = 1; i < a.Length; i++)\n{\n    int x = a[i], j = i - 1;\n    while (j >= 0 && a[j] > x) { a[j + 1] = a[j]; j--; shifts++; }\n    a[j + 1] = x;\n}\nConsole.WriteLine(shifts);', why: "5 is in place; 1 slides past 5 and 2: two shifts.", concepts: ["simple-sorts"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so a pass with no swap stops the sort.", src: 'int[] a = { 1, 2, 3 };\nint passes = 0;\nfor (int p = 1; p < a.Length; p++)\n{\n    passes++;\n    bool swapped = false;\n    for (int i = 0; i < a.Length - p; i++)\n        if (a[i] > a[i + 1]) { (a[i], a[i + 1]) = (a[i + 1], a[i]); swapped = true; }\n    if (@@) break;\n}\nConsole.WriteLine(passes);', out: "1", answer: "!swapped", concepts: ["simple-sorts"] }
      ],
      bug: [
        { id: "b1", q: "It should sort ascending: 1 2 3 4.", src: 'int[] a = { 3, 1, 4, 2 };\nfor (int i = 1; i < a.Length; i++)\n{\n    int x = a[i], j = i - 1;\n    while (j >= 0 && a[j] < x) { a[j + 1] = a[j]; j--; }\n    a[j + 1] = x;\n}\nConsole.WriteLine(string.Join(" ", a));', out: "1 2 3 4", fixedText: "prints 1 2 3 4", why: "a[j] < x slides past SMALLER items, sorting descending; slide past larger ones: a[j] > x.", concepts: ["simple-sorts"] }
      ]
    },
    flashcards: [
      ["What does one bubble sort pass guarantee?", "The largest remaining item reaches its final place at the end."],
      ["When can bubble sort stop early?", "After a pass with no swaps."],
      ["How does insertion sort work?", "Takes each item in turn and slides it back into the sorted part at the front."],
      ["Time complexity of bubble and insertion sort?", "O(n²) worst and average; O(n) on sorted input (with the early stop)."],
      ["What is a stable sort?", "Equal items keep their original order."],
      ["Why compare with > rather than >=?", "So equal items are never swapped — that keeps the sort stable."]
    ],
    quiz: [
      { q: "After the first bubble pass on 5 1 4 2 8 the list is…", opts: ["1 4 2 5 8", "1 2 4 5 8", "5 1 4 2 8", "1 5 4 2 8"], ans: 0, why: "5 bubbles past 1, 4 and 2; 8 stays." },
      { q: "Insertion sort on an already sorted list of n items is…", opts: ["O(n²)", "O(n)", "O(log n)", "O(1)"], ans: 1, why: "Each item is compared once and stays put." },
      { q: "Which sort is NOT O(n²) in the worst case?", opts: ["bubble", "insertion", "merge", "selection"], ans: 2, why: "Merge sort is O(n log n) (12.5)." }
    ]
  });
  K.add({ tasks: {
    "12.4-bubble": { lesson: "12.4", title: "Bubble, pass by pass", tier: "core", minutes: 20, concepts: ["simple-sorts"],
      statement: ["Read whole numbers on one line and bubble sort them (your own loops, no Sort).", "After every pass print `pass P: …` with the list; stop after a pass with no swap (print that pass too) or when the passes run out, then print `comparisons C, swaps S`."],
      starter: 'int[] a = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n',
      examples: [{ stdin: "5 1 4 2 8", out: "pass 1: 1 4 2 5 8\npass 2: 1 2 4 5 8\npass 3: 1 2 4 5 8\ncomparisons 9, swaps 4" }],
      hidden: [{ stdin: "1 2 3", out: "pass 1: 1 2 3\ncomparisons 2, swaps 0" }, { stdin: "3 2 1", out: "pass 1: 2 1 3\npass 2: 1 2 3\ncomparisons 3, swaps 3" }, { stdin: "7", out: "comparisons 0, swaps 0" }],
      rules: [noUse(/\.Sort\s*\(|OrderBy/, "Sort it with your own loops.", "own")],
      hints: ["for (int pass = 1; pass < a.Length; pass++) { bool swapped = false; … }", "Inner loop: for (int i = 0; i < a.Length - pass; i++) { comparisons++; if (a[i] > a[i + 1]) { swap; swaps++; swapped = true; } }", "Print the pass, then if (!swapped) break;"],
      answer: 'int[] a = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\nint comparisons = 0, swaps = 0;\nfor (int pass = 1; pass < a.Length; pass++)\n{\n    bool swapped = false;\n    for (int i = 0; i < a.Length - pass; i++)\n    {\n        comparisons++;\n        if (a[i] > a[i + 1])\n        {\n            (a[i], a[i + 1]) = (a[i + 1], a[i]);\n            swaps++;\n            swapped = true;\n        }\n    }\n    Console.WriteLine($"pass {pass}: {string.Join(" ", a)}");\n    if (!swapped) break;\n}\nConsole.WriteLine($"comparisons {comparisons}, swaps {swaps}");' },
    "12.4-insertion": { lesson: "12.4", title: "Insertion shifts", tier: "core", minutes: 15, concepts: ["simple-sorts"],
      statement: ["Read words on one line. Insertion sort them alphabetically (`string.CompareOrdinal`), with your own loops.", "Print the sorted words, then `shifts S` — the number of times an item moved one place to the right."],
      starter: 'string[] w = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\n',
      examples: [{ stdin: "pear fig apple kiwi", out: "apple fig kiwi pear\nshifts 4" }],
      hidden: [{ stdin: "a b c", out: "a b c\nshifts 0" }, { stdin: "d c b a", out: "a b c d\nshifts 6" }],
      rules: [noUse(/\.Sort\s*\(|OrderBy/, "Sort them with your own loops.", "own"), uses(/while\s*\(/, "Slide each word back with a while loop.", "slide")],
      hints: ["for (int i = 1; i < w.Length; i++) { string x = w[i]; int j = i - 1; … }", "while (j >= 0 && string.CompareOrdinal(w[j], x) > 0) { w[j + 1] = w[j]; j--; shifts++; }", "w[j + 1] = x;"],
      answer: 'string[] w = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nint shifts = 0;\nfor (int i = 1; i < w.Length; i++)\n{\n    string x = w[i];\n    int j = i - 1;\n    while (j >= 0 && string.CompareOrdinal(w[j], x) > 0)\n    {\n        w[j + 1] = w[j];\n        j--;\n        shifts++;\n    }\n    w[j + 1] = x;\n}\nConsole.WriteLine(string.Join(" ", w));\nConsole.WriteLine($"shifts {shifts}");' }
  } });

  /* ================================================================
     12.5 Merge sort and quicksort
     ================================================================ */
  lesson("12.5", {
    aqa: "4.3.5.2",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Bubble sort on a million items makes about 500 billion comparisons. Library sorts finish in a fraction of a second. How?",
        "**Divide and conquer**: split the problem in half, solve each half (the same way), combine. A list of one is already sorted.",
        "**Merge sort** splits, then **merges** two sorted halves in one pass: O(n log n). **Quicksort** partitions around a **pivot** so the halves need no merging."
      ] },
      page("Core idea"),
      run("merge-sort", "merge sort: split to single items, merge back sorted", 'int[] xs = { 38, 27, 43, 3, 9, 82, 10 };\nConsole.WriteLine(string.Join(" ", MergeSort(xs)));\n\nstatic int[] MergeSort(int[] a)\n{\n    if (a.Length <= 1) return a;\n    int mid = a.Length / 2;\n    return Merge(MergeSort(a[..mid]), MergeSort(a[mid..]));\n}\n\nstatic int[] Merge(int[] left, int[] right)\n{\n    var result = new int[left.Length + right.Length];\n    int i = 0, j = 0, k = 0;\n    while (i < left.Length && j < right.Length)\n        result[k++] = left[i] <= right[j] ? left[i++] : right[j++];\n    while (i < left.Length) result[k++] = left[i++];\n    while (j < right.Length) result[k++] = right[j++];\n    return result;\n}'),
      { ul: [
        "**Base case**: a list of 0 or 1 items is sorted (3.x recursion).",
        "`a[..mid]` and `a[mid..]` are the two halves (ranges copy into new arrays).",
        "**Merge** compares the fronts of two sorted lists and takes the smaller, so it is one pass: O(n). `<=` takes from the left on a tie, which keeps it stable."
      ] },
      run("levels", "watching the splits: log₂ n levels, n work per level", 'Show(new[] { 5, 2, 7, 1 }, 0);\n\nstatic int[] Show(int[] a, int depth)\n{\n    Console.WriteLine(new string(\' \', depth * 2) + "split " + string.Join(" ", a));\n    if (a.Length <= 1) return a;\n    int m = a.Length / 2;\n    var l = Show(a[..m], depth + 1);\n    var r = Show(a[m..], depth + 1);\n    var merged = l.Concat(r).Order().ToArray();\n    Console.WriteLine(new string(\' \', depth * 2) + "merge " + string.Join(" ", merged));\n    return merged;\n}'),
      page("Rules"),
      { table: { head: ["", "Merge sort", "Quicksort", "Bubble/insertion"], rows: [
        ["Average", "O(n log n)", "O(n log n)", "O(n²)"],
        ["Worst", "O(n log n)", "O(n²) (bad pivots)", "O(n²)"],
        ["Extra memory", "O(n)", "O(log n) stack", "O(1)"],
        ["Stable", "yes", "no", "yes"]
      ] } },
      { ul: [
        "Why n log n: halving gives log₂ n **levels**; merging at each level touches all n items.",
        "Quicksort picks a pivot, moves smaller items left of it and larger right (**partition**), then sorts each side. No merge step.",
        "A bad pivot (the smallest each time, as on already-sorted data with the first item as pivot) gives O(n²); a middle or random pivot avoids it.",
        "`Array.Sort` is an introsort: quicksort, switching to heapsort if it goes too deep and to insertion sort for small parts. `OrderBy` is a stable sort."
      ] },
      page("Variations"),
      { h: "Quicksort in place" },
      run("quick", "Lomuto partition: the last item is the pivot", 'int[] a = { 9, 4, 7, 1, 8, 2 };\nQuickSort(a, 0, a.Length - 1);\nConsole.WriteLine(string.Join(" ", a));\n\nstatic void QuickSort(int[] a, int lo, int hi)\n{\n    if (lo >= hi) return;\n    int p = Partition(a, lo, hi);\n    QuickSort(a, lo, p - 1);\n    QuickSort(a, p + 1, hi);\n}\n\nstatic int Partition(int[] a, int lo, int hi)\n{\n    int pivot = a[hi], i = lo;\n    for (int j = lo; j < hi; j++)\n        if (a[j] < pivot) { (a[i], a[j]) = (a[j], a[i]); i++; }\n    (a[i], a[hi]) = (a[hi], a[i]);\n    return i;\n}'),
      { h: "Counting comparisons" },
      run("compare", "merge sort against bubble sort as n grows", 'foreach (int n in new[] { 16, 256, 2048 })\n{\n    int[] data = Enumerable.Range(0, n).Select(i => (i * 7919) % n).ToArray();\n    long m = 0, b = 0;\n    MergeCount(data, ref m);\n    for (int p = 1; p < n; p++) for (int i = 0; i < n - p; i++) b++;\n    Console.WriteLine($"n={n,-5} merge {m,-7} bubble {b}");\n}\n\nstatic int[] MergeCount(int[] a, ref long c)\n{\n    if (a.Length <= 1) return a;\n    int mid = a.Length / 2;\n    var l = MergeCount(a[..mid], ref c);\n    var r = MergeCount(a[mid..], ref c);\n    var o = new int[a.Length];\n    int i = 0, j = 0, k = 0;\n    while (i < l.Length && j < r.Length) { c++; o[k++] = l[i] <= r[j] ? l[i++] : r[j++]; }\n    while (i < l.Length) o[k++] = l[i++];\n    while (j < r.Length) o[k++] = r[j++];\n    return o;\n}'),
      page("Pitfalls"),
      { h: "Using a void sort's result — CS0029" },
      run("pit-void", "QuickSort sorts in place and returns nothing", 'int[] a = { 3, 1, 2 };\nint[] sorted = QuickSort(a);\n\nstatic void QuickSort(int[] a) => Array.Sort(a);'),
      { h: "Forgetting the leftovers" },
      run("pit-leftover", "the merge stops when one side runs out — the rest of the other side is lost", 'int[] l = { 1, 5, 9 }, r = { 2, 3 };\nvar o = new List<int>();\nint i = 0, j = 0;\nwhile (i < l.Length && j < r.Length) o.Add(l[i] <= r[j] ? l[i++] : r[j++]);\nConsole.WriteLine(string.Join(" ", o));'),
      { h: "A missing base case" },
      "Without `if (a.Length <= 1) return a;` merge sort splits a one-item list into an empty one and itself, for ever: a StackOverflow (12.6).",
      page("Connections"),
      { ul: [ "**Back:** 3.x recursion and base cases; 12.4 the O(n²) sorts.", "**Next:** 12.6 the stack frames those recursive calls use; 12.11 a BST sorts as it inserts.", "**AQA:** 4.3.5.2 merge sort (trace it, O(n log n)); divide and conquer." ] },
      page("Good practice"),
      { ul: [ "Use the library sort; know which is stable (OrderBy) and which is not (Array.Sort).", "Choose a middle or random pivot for quicksort.", "Write the merge step on its own and test it before the recursion." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Merge sort, counted* and *Merge many lists*." ] },
      page("Quick reference"),
      run("qr", "the merge step", 'int[] l = { 1, 4, 9 }, r = { 2, 3, 10 };\nvar o = new List<int>();\nint i = 0, j = 0;\nwhile (i < l.Length && j < r.Length) o.Add(l[i] <= r[j] ? l[i++] : r[j++]);\no.AddRange(l[i..]);\no.AddRange(r[j..]);\nConsole.WriteLine(string.Join(" ", o));'),
      { ul: [ "Split → sort halves → merge; base case length ≤ 1.", "Merge sort O(n log n) always, O(n) memory, stable.", "Quicksort: partition around a pivot; O(n²) worst." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0029", "void used as a value", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int[] l = { 2, 6 }, r = { 1, 7 };\nvar o = new List<int>();\nint i = 0, j = 0;\nwhile (i < l.Length && j < r.Length) o.Add(l[i] <= r[j] ? l[i++] : r[j++]);\nConsole.WriteLine(string.Join(" ", o) + " | " + i + " " + j);', why: "Takes 1, 2, 6; then the left side is used up (i = 2) with 7 still on the right (j = 1).", concepts: ["merge-sort"] },
        { id: "p2", src: 'int[] a = { 7, 2, 9, 4 };\nint pivot = a[3], i = 0;\nfor (int j = 0; j < 3; j++) if (a[j] < pivot) { (a[i], a[j]) = (a[j], a[i]); i++; }\n(a[i], a[3]) = (a[3], a[i]);\nConsole.WriteLine(string.Join(" ", a) + " pivot at " + i);', why: "Only 2 is below 4: 2 moves left, then 4 swaps into index 1.", concepts: ["quicksort"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with merge sort's base case condition.", src: 'Console.WriteLine(string.Join(" ", Sort(new[] { 3, 1, 2 })));\n\nstatic int[] Sort(int[] a)\n{\n    if (@@) return a;\n    int m = a.Length / 2;\n    var l = Sort(a[..m]); var r = Sort(a[m..]);\n    return l.Concat(r).Order().ToArray();\n}', out: "1 2 3", answer: "a.Length <= 1", concepts: ["merge-sort"] }
      ],
      bug: [
        { id: "b1", q: "The merge should keep everything: 1 2 3 5 9.", src: 'int[] l = { 1, 5, 9 }, r = { 2, 3 };\nvar o = new List<int>();\nint i = 0, j = 0;\nwhile (i < l.Length && j < r.Length) o.Add(l[i] <= r[j] ? l[i++] : r[j++]);\nConsole.WriteLine(string.Join(" ", o));', out: "1 2 3 5 9", fixedText: "prints 1 2 3 5 9", why: "When one side runs out, copy the rest of the other: o.AddRange(l[i..]); o.AddRange(r[j..]);", concepts: ["merge-sort"] }
      ]
    },
    flashcards: [
      ["What is divide and conquer?", "Split the problem, solve the parts the same way, combine the answers."],
      ["Merge sort's time complexity?", "O(n log n) in every case."],
      ["Why n log n?", "log₂ n levels of halving, n work merging at each level."],
      ["What does the merge step do?", "Repeatedly takes the smaller front item of two sorted lists: one pass, O(n)."],
      ["Quicksort's worst case and when?", "O(n²), when the pivot is always the smallest or largest (e.g. sorted data, first-item pivot)."],
      ["Which is stable: merge sort or quicksort?", "Merge sort."]
    ],
    quiz: [
      { q: "Merging [1, 4, 6] and [2, 3, 7] takes how many comparisons?", opts: ["3", "5", "6", "9"], ans: 1, why: "1<2, 4>2, 4>3, 4<7, 6<7; then 7 is copied." },
      { q: "Merge sort needs extra memory of…", opts: ["O(1)", "O(log n)", "O(n)", "O(n²)"], ans: 2, why: "The merged arrays." },
      { q: "On 1,024 items merge sort has how many levels of splitting?", opts: ["10", "512", "1,024", "32"], ans: 0, why: "2¹⁰ = 1,024." }
    ]
  });
  K.add({ tasks: {
    "12.5-merge": { lesson: "12.5", title: "Merge sort, counted", tier: "core", minutes: 25, concepts: ["merge-sort"],
      statement: ["Read whole numbers on one line. Sort them with your own recursive merge sort (no Sort, Order or OrderBy).", "Print the sorted numbers, then `comparisons C` — one for each time the merge compares a left item with a right item."],
      starter: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n',
      examples: [{ stdin: "38 27 43 3 9 82 10", out: "3 9 10 27 38 43 82\ncomparisons 13" }],
      hidden: [{ stdin: "5", out: "5\ncomparisons 0" }, { stdin: "1 2 3 4", out: "1 2 3 4\ncomparisons 4" }, { stdin: "4 3 2 1", out: "1 2 3 4\ncomparisons 4" }],
      rules: [noUse(/\.Sort\s*\(|\.Order\s*\(|OrderBy/, "Sort with your own merge sort.", "own"), uses(/MergeSort\s*\([^)]*\)[\s\S]*MergeSort\s*\(/, "Make MergeSort call itself on the halves.", "recurse")],
      hints: ["static int[] MergeSort(int[] a, ref int c) { if (a.Length <= 1) return a; int m = a.Length / 2; … }", "In the merge: while (i < l.Length && j < r.Length) { c++; o[k++] = l[i] <= r[j] ? l[i++] : r[j++]; }", "Copy what is left of each side after the loop."],
      answer: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\nint comparisons = 0;\nint[] sorted = MergeSort(xs, ref comparisons);\nConsole.WriteLine(string.Join(" ", sorted));\nConsole.WriteLine($"comparisons {comparisons}");\n\nstatic int[] MergeSort(int[] a, ref int c)\n{\n    if (a.Length <= 1) return a;\n    int m = a.Length / 2;\n    int[] l = MergeSort(a[..m], ref c), r = MergeSort(a[m..], ref c);\n    var o = new int[a.Length];\n    int i = 0, j = 0, k = 0;\n    while (i < l.Length && j < r.Length) { c++; o[k++] = l[i] <= r[j] ? l[i++] : r[j++]; }\n    while (i < l.Length) o[k++] = l[i++];\n    while (j < r.Length) o[k++] = r[j++];\n    return o;\n}' },
    "12.5-many": { lesson: "12.5", title: "Merge many lists", tier: "stretch", minutes: 25, concepts: ["merge-sort"],
      statement: ["Read lines of already-sorted whole numbers until the end (a blank line is an empty list).", "Merge them all into one sorted list using ONLY a two-list `Merge` you write (pairs at a time, like merge sort's levels; no Sort, Order, OrderBy or Concat). Print the merged list (or `empty`) and `rounds R`, the number of rounds of pairing it took (one list: 0 rounds)."],
      starter: 'var lists = new List<int[]>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null)\n    lists.Add(line.Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray());\n',
      examples: [{ stdin: "1 4 9\n2 3\n5 6 10\n0", out: "0 1 2 3 4 5 6 9 10\nrounds 2" }],
      hidden: [{ stdin: "3 7", out: "3 7\nrounds 0" }, { stdin: "1\n2\n3", out: "1 2 3\nrounds 2" }, { stdin: "", out: "empty\nrounds 0" }],
      rules: [noUse(/\.Sort\s*\(|\.Order\s*\(|OrderBy|Concat/, "Combine them only with your Merge.", "own"), uses(/static\s+int\[\]\s+Merge\s*\(/, "Write static int[] Merge(int[] a, int[] b).", "merge")],
      hints: ["static int[] Merge(int[] a, int[] b) { … the merge from the lesson … }", "while (lists.Count > 1) { rounds++; var next = new List<int[]>(); for (int i = 0; i < lists.Count; i += 2) next.Add(i + 1 < lists.Count ? Merge(lists[i], lists[i + 1]) : lists[i]); lists = next; }", "An empty input has no lists at all."],
      answer: 'var lists = new List<int[]>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null)\n    lists.Add(line.Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray());\nint rounds = 0;\nwhile (lists.Count > 1)\n{\n    rounds++;\n    var next = new List<int[]>();\n    for (int i = 0; i < lists.Count; i += 2)\n        next.Add(i + 1 < lists.Count ? Merge(lists[i], lists[i + 1]) : lists[i]);\n    lists = next;\n}\nint[] all = lists.Count == 0 ? new int[0] : lists[0];\nConsole.WriteLine(all.Length == 0 ? "empty" : string.Join(" ", all));\nConsole.WriteLine($"rounds {rounds}");\n\nstatic int[] Merge(int[] a, int[] b)\n{\n    var o = new int[a.Length + b.Length];\n    int i = 0, j = 0, k = 0;\n    while (i < a.Length && j < b.Length) o[k++] = a[i] <= b[j] ? a[i++] : b[j++];\n    while (i < a.Length) o[k++] = a[i++];\n    while (j < b.Length) o[k++] = b[j++];\n    return o;\n}' }
  } });

  /* ================================================================
     12.6 Recursion in depth: stack frames
     ================================================================ */
  lesson("12.6", {
    aqa: "4.1.1.15",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Unit 3 wrote recursive methods; it did not show where a call waits while the call it made finishes.",
        "Every call gets a **stack frame** — its parameters, its locals and where to return to — pushed onto the **call stack**. When it returns, its frame is popped and the caller carries on.",
        "Seeing the frames explains recursion's cost, why it can overflow, and how to turn it into a loop with your own stack."
      ] },
      page("Core idea"),
      run("frames", "factorial, showing each frame pushed and popped", 'Console.WriteLine(Fact(4, 0));\n\nstatic long Fact(int n, int depth)\n{\n    string pad = new string(\' \', depth * 2);\n    Console.WriteLine($"{pad}call Fact({n})");\n    long r = n <= 1 ? 1 : n * Fact(n - 1, depth + 1);\n    Console.WriteLine($"{pad}return {r}");\n    return r;\n}'),
      { ul: [
        "Four frames are on the stack at the deepest point: Fact(4) waits for Fact(3), which waits for Fact(2), which waits for Fact(1).",
        "Each frame has its **own** `n` and `r`: the same names, different variables.",
        "The returns come back in reverse order — last in, first out, like any stack (12.8)."
      ] },
      run("hanoi", "the Towers of Hanoi: three lines of recursion, 2ⁿ − 1 moves", 'int moves = 0;\nHanoi(3, \'A\', \'C\', \'B\');\nConsole.WriteLine($"{moves} moves");\n\nvoid Hanoi(int n, char from, char to, char via)\n{\n    if (n == 0) return;\n    Hanoi(n - 1, from, via, to);\n    Console.WriteLine($"disk {n}: {from} → {to}");\n    moves++;\n    Hanoi(n - 1, via, to, from);\n}'),
      page("Rules"),
      { ul: [
        "A **stack frame** holds a call's parameters, local variables and **return address**; it is pushed on the call and popped on the return.",
        "Recursion needs a **base case** that does not recurse, and every recursive call must move towards it.",
        "Depth costs memory: a frame per pending call. Too deep and the stack runs out — a **StackOverflowException**, which cannot be caught and ends the program.",
        "A recursive call that makes two calls (Fibonacci, Hanoi) can do exponential work; remembering answers (**memoisation**) or a loop removes the repeats.",
        "Any recursion can be rewritten as a loop with an explicit `Stack<T>` holding what the frames held."
      ] },
      { table: { head: ["A frame for", "holds"], rows: [["parameters", "n, from, to, via"], ["locals", "r, pad"], ["return address", "where in the caller to continue"], ["(and the result)", "handed back as the frame is popped"]] } },
      page("Variations"),
      { h: "Exponential repeats, and memoisation" },
      run("fib", "naive Fibonacci recomputes; a dictionary remembers", 'long calls = 0;\nlong Fib(int n) { calls++; return n < 2 ? n : Fib(n - 1) + Fib(n - 2); }\nConsole.WriteLine($"fib(20) = {Fib(20)} in {calls} calls");\ncalls = 0;\nvar memo = new Dictionary<int, long>();\nlong FibM(int n)\n{\n    calls++;\n    if (n < 2) return n;\n    if (memo.TryGetValue(n, out long v)) return v;\n    return memo[n] = FibM(n - 1) + FibM(n - 2);\n}\nConsole.WriteLine($"fib(20) = {FibM(20)} in {calls} calls");'),
      { h: "Recursion turned into a loop" },
      run("explicit", "sum a nested structure with your own stack instead of recursion", 'var tree = new Box(1, new Box(2, new Box(4)), new Box(3));\nlong total = 0;\nvar todo = new Stack<Box>();\ntodo.Push(tree);\nwhile (todo.Count > 0)\n{\n    var b = todo.Pop();\n    total += b.Value;\n    foreach (var c in b.Children) todo.Push(c);\n}\nConsole.WriteLine(total);\n\nrecord Box(int Value, params Box[] Children);'),
      { h: "How deep is it?" },
      run("depth", "the deepest frame count of a recursive sum", 'int deepest = 0;\nlong Sum(int n, int depth)\n{\n    deepest = Math.Max(deepest, depth);\n    return n == 0 ? 0 : n + Sum(n - 1, depth + 1);\n}\nConsole.WriteLine(Sum(500, 1));\nConsole.WriteLine($"{deepest} frames at once");'),
      page("Pitfalls"),
      { h: "A path that returns nothing — CS0161" },
      run("pit-return", "the recursive call's result is thrown away", 'Console.WriteLine(Fact(3));\n\nstatic int Fact(int n)\n{\n    if (n <= 1) return 1;\n    Fact(n - 1);\n}'),
      { h: "A base case that is never reached" },
      "`Count(n) => n == 0 ? 0 : 1 + Count(n - 2)` reaches 0 only from even numbers: Count(3) goes 3, 1, −1, −3… until the stack overflows and the program ends — it cannot be caught. Make the base case `n <= 0`.",
      { h: "Exponential by accident" },
      run("pit-exp", "two calls per level: the calls double with each extra level", 'long calls = 0;\nlong F(int n) { calls++; return n < 2 ? 1 : F(n - 1) + F(n - 2); }\nforeach (int n in new[] { 10, 15, 20 }) { calls = 0; F(n); Console.WriteLine($"n={n}: {calls} calls"); }'),
      page("Connections"),
      { ul: [ "**Back:** 3.x recursion and base cases; 12.5 merge sort's recursion.", "**Next:** 12.8 builds the stack itself; 12.11 and 12.12 recurse over trees and graphs; D3 dynamic programming is memoisation grown up.", "**AQA:** 4.1.1.15 the role of stack frames in subroutine calls; 4.1.1.16 recursive techniques." ] },
      page("Good practice"),
      { ul: [ "Write the base case first.", "Recurse for naturally recursive data (trees, nested lists); loop for a straight line.", "Memoise when the same arguments come back." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Towers of Hanoi* and *Without recursion*." ] },
      page("Quick reference"),
      run("qr", "a recursive power and its loop twin", 'static long Pow(long b, int e) => e == 0 ? 1 : b * Pow(b, e - 1);\nlong p = 1; for (int i = 0; i < 10; i++) p *= 2;\nConsole.WriteLine($"{Pow(2, 10)} {p}");'),
      { ul: [ "One frame per pending call: parameters, locals, return address.", "Base case first; every call moves towards it.", "Memoise repeats; use a Stack<T> to loop instead." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0161", "not every path returns a value", "Pitfalls"], ["StackOverflow", "too deep, or no base case reached", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Show(3);\n\nstatic void Show(int n)\n{\n    if (n == 0) return;\n    Show(n - 1);\n    Console.Write(n);\n}', why: "The print comes after the call returns, so the deepest frame prints first: 123.", concepts: ["stack-frames"] },
        { id: "p2", src: 'int calls = 0;\nint G(int n) { calls++; return n <= 1 ? 1 : G(n - 1) + G(n - 1); }\nG(4);\nConsole.WriteLine(calls);', why: "Each level doubles: 1 + 2 + 4 + 8 = 15 calls.", concepts: ["stack-frames"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the base case's result for sum(0).", src: 'Console.WriteLine(Sum(4));\n\nstatic int Sum(int n) => n == 0 ? @@ : n + Sum(n - 1);', out: "10", answer: "0", concepts: ["stack-frames"] }
      ],
      bug: [
        { id: "b1", q: "It should print 4 3 2 1 (counting down before each call).", src: 'Down(4);\nConsole.WriteLine();\n\nstatic void Down(int n)\n{\n    if (n == 0) return;\n    Down(n - 1);\n    Console.Write(n + " ");\n}', out: "4 3 2 1", fixedText: "prints 4 3 2 1", why: "Printing after the call prints on the way back up (1 2 3 4); print before it.", concepts: ["stack-frames"] }
      ]
    },
    flashcards: [
      ["What does a stack frame hold?", "A call's parameters, local variables and return address."],
      ["When is a frame popped?", "When its call returns."],
      ["Why can deep recursion crash?", "Each pending call holds a frame; the call stack runs out (StackOverflow)."],
      ["What is memoisation?", "Remembering results by argument so repeated calls are answered at once."],
      ["How do you remove recursion?", "Loop with your own Stack<T> holding what the frames held."],
      ["How many moves for Towers of Hanoi with n disks?", "2ⁿ − 1."]
    ],
    quiz: [
      { q: "During Fact(4) the most frames on the stack at once (for Fact) is…", opts: ["1", "2", "4", "24"], ans: 2, why: "Fact(4), (3), (2) and (1) are all pending." },
      { q: "A StackOverflowException…", opts: ["can be caught with catch", "ends the program", "is a compile error", "is a warning"], ans: 1, why: "The runtime cannot recover from it." },
      { q: "Naive Fibonacci's time complexity is about…", opts: ["O(n)", "O(n²)", "O(2ⁿ)", "O(log n)"], ans: 2, why: "Two calls per level, repeating work." }
    ]
  });
  K.add({ tasks: {
    "12.6-hanoi": { lesson: "12.6", title: "Towers of Hanoi", tier: "core", minutes: 20, concepts: ["stack-frames"],
      statement: ["Read n (0–8). With a recursive method print each move as `disk D: X → Y` (pegs A, B, C; all disks start on A and end on C), then `M moves` and `deepest D` — the most Hanoi calls pending at once, counting the first call as 1 (and the calls with n = 0 that return at once)."],
      starter: 'int n = int.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "2", out: "disk 1: A → B\ndisk 2: A → C\ndisk 1: B → C\n3 moves\ndeepest 3" }],
      hidden: [{ stdin: "0", out: "0 moves\ndeepest 1" }, { stdin: "3", out: "disk 1: A → C\ndisk 2: A → B\ndisk 1: C → B\ndisk 3: A → C\ndisk 1: B → A\ndisk 2: B → C\ndisk 1: A → C\n7 moves\ndeepest 4" }],
      rules: [uses(/void\s+Hanoi\s*\([\s\S]*Hanoi\s*\([\s\S]*Hanoi\s*\(/, "Write a recursive Hanoi that calls itself twice.")],
      hints: ["void Hanoi(int n, char from, char to, char via, int depth) { deepest = Math.Max(deepest, depth); if (n == 0) return; … }", "Hanoi(n - 1, from, via, to, depth + 1); print the move; Hanoi(n - 1, via, to, from, depth + 1);", "Start with Hanoi(n, 'A', 'C', 'B', 1)."],
      answer: 'int n = int.Parse(Console.ReadLine() ?? "0");\nint moves = 0, deepest = 0;\nHanoi(n, \'A\', \'C\', \'B\', 1);\nConsole.WriteLine($"{moves} moves");\nConsole.WriteLine($"deepest {deepest}");\n\nvoid Hanoi(int k, char from, char to, char via, int depth)\n{\n    deepest = Math.Max(deepest, depth);\n    if (k == 0) return;\n    Hanoi(k - 1, from, via, to, depth + 1);\n    Console.WriteLine($"disk {k}: {from} → {to}");\n    moves++;\n    Hanoi(k - 1, via, to, from, depth + 1);\n}' },
    "12.6-nested": { lesson: "12.6", title: "Without recursion", tier: "stretch", minutes: 25, concepts: ["stack-frames"],
      statement: ["Read a nested list such as `[1,[2,3],[[4]],5]` (whole numbers and brackets, no spaces).", "WITHOUT recursion — a loop and your own `Stack<int>` of open lists — print `sum S, depth D, count C`: the sum of the numbers, the deepest nesting (the outer list is depth 1; `[]` alone is depth 1) and how many numbers there are."],
      starter: 'string s = Console.ReadLine() ?? "";\n',
      examples: [{ stdin: "[1,[2,3],[[4]],5]", out: "sum 15, depth 3, count 5" }],
      hidden: [{ stdin: "[]", out: "sum 0, depth 1, count 0" }, { stdin: "[[[[10]]],-3]", out: "sum 7, depth 4, count 2" }],
      rules: [uses(/Stack<\s*int\s*>/, "Track the open lists with a Stack<int>."), noUse(/static\s+\w+\s+\w+\s*\(/, "No helper methods: one loop over the characters.", "loop")],
      hints: ["var open = new Stack<int>(); foreach char: '[' → open.Push(0) and depth = Math.Max(depth, open.Count); ']' → open.Pop();", "Read a number: an optional '-' then digits; add it to sum and count it.", "for (int i = 0; i < s.Length; i++) { char c = s[i]; … }"],
      answer: 'string s = Console.ReadLine() ?? "";\nvar open = new Stack<int>();\nlong sum = 0;\nint depth = 0, count = 0;\nfor (int i = 0; i < s.Length; i++)\n{\n    char c = s[i];\n    if (c == \'[\') { open.Push(i); depth = Math.Max(depth, open.Count); }\n    else if (c == \']\') open.Pop();\n    else if (c == \'-\' || char.IsDigit(c))\n    {\n        int j = i + 1;\n        while (j < s.Length && char.IsDigit(s[j])) j++;\n        sum += long.Parse(s[i..j]);\n        count++;\n        i = j - 1;\n    }\n}\nConsole.WriteLine($"sum {sum}, depth {depth}, count {count}");' }
  } });

  /* ================================================================
     12.7 A linked list
     ================================================================ */
  lesson("12.7", {
    aqa: "4.2.1.4",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A `List<T>` is an array underneath: inserting at the front shifts every item (12.1's hidden O(n)).",
        "A **linked list** stores each item in a **node** that holds a reference to the next node. Inserting or removing next to a node you have is O(1): change two references, move nothing.",
        "The price: no index. To reach item 500 you walk 500 nodes."
      ] },
      page("Core idea"),
      run("nodes", "three nodes joined by Next, walked from the head", 'var c = new Node("C", null);\nvar b = new Node("B", c);\nvar a = new Node("A", b);\nfor (Node? n = a; n != null; n = n.Next)\n    Console.Write(n.Value + (n.Next != null ? " → " : "\\n"));\n\nclass Node\n{\n    public string Value { get; }\n    public Node? Next { get; set; }\n    public Node(string value, Node? next) { Value = value; Next = next; }\n}'),
      { ul: [
        "A node is a value plus a **reference** to the next node (8.8: a class variable holds a reference). The last node's `Next` is `null`.",
        "The list is reached through its **head**, the first node.",
        "Walking: start at the head and follow `Next` until `null`."
      ] },
      run("class", "a list class: AddFirst, AddLast, Remove, Count", 'var list = new Chain();\nlist.AddLast("b"); list.AddLast("c"); list.AddFirst("a");\nConsole.WriteLine(list);\nlist.Remove("b");\nConsole.WriteLine($"{list} ({list.Count})");\nlist.Remove("a");\nConsole.WriteLine($"{list} ({list.Count})");\n\nclass Chain\n{\n    private class Node { public string Value = ""; public Node? Next; }\n    private Node? head, tail;\n    public int Count { get; private set; }\n    public void AddFirst(string v)\n    {\n        head = new Node { Value = v, Next = head };\n        tail ??= head;\n        Count++;\n    }\n    public void AddLast(string v)\n    {\n        var n = new Node { Value = v };\n        if (tail == null) head = tail = n;\n        else { tail.Next = n; tail = n; }\n        Count++;\n    }\n    public bool Remove(string v)\n    {\n        Node? prev = null;\n        for (var n = head; n != null; prev = n, n = n.Next)\n        {\n            if (n.Value != v) continue;\n            if (prev == null) head = n.Next; else prev.Next = n.Next;\n            if (n == tail) tail = prev;\n            Count--;\n            return true;\n        }\n        return false;\n    }\n    public override string ToString()\n    {\n        var parts = new List<string>();\n        for (var n = head; n != null; n = n.Next) parts.Add(n.Value);\n        return string.Join(" → ", parts);\n    }\n}'),
      page("Rules"),
      { table: { head: ["Operation", "Linked list", "List<T> (array)"], rows: [["add or remove at the front", "O(1)", "O(n)"], ["add at the end", "O(1) with a tail", "O(1) on average"], ["read item i", "O(n)", "O(1)"], ["remove after a node you hold", "O(1)", "O(n)"], ["memory", "a node object per item", "one block"]] } },
      { ul: [
        "Removing the **head** is a special case: there is no previous node, so the head itself moves on.",
        "Keep a **tail** reference for O(1) AddLast, and update it when the last node goes.",
        "A **doubly** linked list gives each node `Prev` too, so it can walk both ways and remove a node it holds in O(1); .NET's `LinkedList<T>` is one.",
        "Make the node class private: callers use the list, never the wiring."
      ] },
      page("Variations"),
      { h: "Reversing in place" },
      run("reverse", "turn each Next round as you walk: three references, O(n), no new nodes", 'Node? head = null;\nforeach (int v in new[] { 4, 3, 2, 1 }) head = new Node(v, head);\nhead = Reverse(head);\nfor (var n = head; n != null; n = n.Next) Console.Write(n.Value + " ");\nConsole.WriteLine();\n\nstatic Node? Reverse(Node? head)\n{\n    Node? prev = null;\n    while (head != null)\n    {\n        var next = head.Next;\n        head.Next = prev;\n        prev = head;\n        head = next;\n    }\n    return prev;\n}\n\nclass Node { public int Value; public Node? Next; public Node(int v, Node? n) { Value = v; Next = n; } }'),
      { h: "The middle with two pointers" },
      run("middle", "fast moves two nodes for each one slow moves", 'Node? head = null;\nforeach (int v in new[] { 5, 4, 3, 2, 1 }) head = new Node(v, head);\nNode slow = head!, fast = head!;\nwhile (fast.Next != null && fast.Next.Next != null) { slow = slow.Next!; fast = fast.Next.Next; }\nConsole.WriteLine(slow.Value);\n\nclass Node { public int Value; public Node? Next; public Node(int v, Node? n) { Value = v; Next = n; } }'),
      { h: "The library's LinkedList<T>" },
      run("library", "a doubly linked list with node handles", 'var song = new LinkedList<string>(new[] { "intro", "verse", "outro" });\nvar verse = song.Find("verse")!;\nsong.AddAfter(verse, "chorus");\nsong.AddBefore(verse, "riff");\nsong.Remove("intro");\nConsole.WriteLine(string.Join(" ", song));\nConsole.WriteLine(song.Last!.Previous!.Value);'),
      page("Pitfalls"),
      { h: "A generic node used without its type — CS0305" },
      run("pit-generic", "Node<T> needs a type argument", 'var n = new Node(1);\n\nclass Node<T> { public T Value; public Node(T v) => Value = v; }'),
      { h: "Walking off the end" },
      run("pit-null", "the last node's Next is null", 'var a = new Node(1, new Node(2, null));\nConsole.WriteLine(a.Next!.Next!.Value);\n\nclass Node { public int Value; public Node? Next; public Node(int v, Node? n) { Value = v; Next = n; } }'),
      { h: "Losing the rest of the list" },
      "Setting `node.Next = newNode` before `newNode.Next = node.Next` cuts the list: the old successors are unreachable and the garbage collector takes them. Link the new node in first, then change the old reference.",
      page("Connections"),
      { ul: [ "**Back:** 8.8 references; 9.1 generic types (a real list is `Chain<T>`).", "**Next:** 12.8 a stack and a queue made of nodes; 12.10 chaining stores a linked list in each bucket; 12.11 a tree is nodes with two links.", "**AQA:** 4.2.1.4 abstract data types; linked lists appear as a dynamic data structure (with pointers)." ] },
      page("Good practice"),
      { ul: [ "Draw the boxes and arrows before writing the pointer code.", "Test the edges: empty list, one node, removing the head, removing the tail.", "Prefer List<T> unless you insert and remove in the middle a lot." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A list of your own* and *Reverse and middle*." ] },
      page("Quick reference"),
      run("qr", "push to the front and walk", 'Node? head = null;\nforeach (var w in new[] { "c", "b", "a" }) head = new Node(w, head);\nfor (var n = head; n != null; n = n.Next) Console.Write(n.Value);\nConsole.WriteLine();\n\nrecord Node(string Value, Node? Next);'),
      { ul: [ "Node = value + Next; head reaches it; null ends it.", "Front O(1); index O(n).", "Removing the head and the tail are special cases." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0305", "a generic type needs its type argument", "Pitfalls"], ["NullReferenceException", "walked past the last node", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Node? h = null;\nforeach (int v in new[] { 1, 2, 3 }) h = new Node(v, h);\nfor (var n = h; n != null; n = n.Next) Console.Write(n.Value);\nConsole.WriteLine();\n\nrecord Node(int Value, Node? Next);', why: "Each new node goes to the front, so the list reads backwards: 321.", concepts: ["linked-list"] },
        { id: "p2", src: 'var c = new Node(3, null);\nvar b = new Node(2, c);\nvar a = new Node(1, b);\na.Next = c;\nint count = 0;\nfor (Node? n = a; n != null; n = n.Next) count++;\nConsole.WriteLine(count);\n\nclass Node { public int V; public Node? Next; public Node(int v, Node? n) { V = v; Next = n; } }', why: "Pointing a past b removes b from the walk: 2 nodes.", concepts: ["linked-list"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the walk moves to the next node.", src: 'var a = new Node(1, new Node(2, new Node(3, null)));\nint sum = 0;\nfor (Node? n = a; n != null; n = @@) sum += n.V;\nConsole.WriteLine(sum);\n\nclass Node { public int V; public Node? Next; public Node(int v, Node? n) { V = v; Next = n; } }', out: "6", answer: "n.Next", concepts: ["linked-list"] }
      ],
      bug: [
        { id: "b1", q: "Removing the head should leave 2 → 3.", src: 'var head = new Node(1, new Node(2, new Node(3, null)));\nhead = Remove(head, 1);\nvar parts = new List<int>();\nfor (Node? n = head; n != null; n = n.Next) parts.Add(n.V);\nConsole.WriteLine(string.Join(" → ", parts));\n\nstatic Node Remove(Node head, int v)\n{\n    for (var n = head; n.Next != null; n = n.Next)\n        if (n.Next.V == v) { n.Next = n.Next.Next; break; }\n    return head;\n}\n\nclass Node { public int V; public Node? Next; public Node(int v, Node? n) { V = v; Next = n; } }', out: "2 → 3", fixedText: "prints 2 → 3", why: "The loop only ever looks at n.Next, so the head itself is never checked: if (head.V == v) return head.Next; first.", concepts: ["linked-list"] }
      ]
    },
    flashcards: [
      ["What does a linked list node hold?", "A value and a reference to the next node."],
      ["Cost of inserting at the front of a linked list?", "O(1) — no items move."],
      ["Cost of reading item i?", "O(n) — walk from the head."],
      ["Why keep a tail reference?", "AddLast becomes O(1) instead of walking the whole list."],
      ["Which removal is a special case?", "Removing the head: there is no previous node."],
      ["What is a doubly linked list?", "Each node has Next and Prev, so it can walk both ways; LinkedList<T> is one."]
    ],
    quiz: [
      { q: "Reaching the 1,000th item of a singly linked list costs…", opts: ["1 step", "about 1,000 steps", "about 10 steps", "nothing"], ans: 1, why: "No index: walk from the head." },
      { q: "To remove node n from a singly linked list you need…", opts: ["n only", "the node before n", "the tail", "the Count"], ans: 1, why: "prev.Next = n.Next." },
      { q: "Reversing a linked list in place uses extra memory of…", opts: ["O(n)", "O(1)", "O(log n)", "O(n²)"], ans: 1, why: "Three references, whatever the length." }
    ]
  });
  K.add({ tasks: {
    "12.7-list": { lesson: "12.7", title: "A list of your own", tier: "core", minutes: 30, concepts: ["linked-list"],
      statement: ["Write a singly linked list of strings from nodes (no List<T>, LinkedList<T>, arrays or Queue/Stack for the items) with a head, a tail and a Count.", "Read commands until the end: `first X` (add at the front), `last X` (add at the end), `remove X` (the first X; print `no X` if missing), `show` (the items joined by ` → `, or `empty`) and `count`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "last b\nlast c\nfirst a\nshow\nremove b\nremove z\nshow\ncount", out: "a → b → c\nno z\na → c\n2" }],
      hidden: [{ stdin: "show\ncount", out: "empty\n0" }, { stdin: "last x\nremove x\nlast y\nshow\nfirst w\nremove y\nlast z\nshow", out: "y\nw → z" }],
      rules: [noUse(/List<|LinkedList|Queue<|Stack<|\[\]/, "Build it from nodes — no collections or arrays for the items.", "nodes"), uses(/class\s+\w*Node\b/, "Write a node class.", "node")],
      hints: ["class Node { public string Value = \"\"; public Node? Next; }", "AddLast: if (tail == null) head = tail = n; else { tail.Next = n; tail = n; }", "Remove: walk with prev; if prev is null move the head; if the node was the tail, tail = prev."],
      answer: 'var list = new Chain();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    int sp = line.IndexOf(\' \');\n    string cmd = sp < 0 ? line : line[..sp], arg = sp < 0 ? "" : line[(sp + 1)..];\n    switch (cmd)\n    {\n        case "first": list.AddFirst(arg); break;\n        case "last": list.AddLast(arg); break;\n        case "remove": if (!list.Remove(arg)) Console.WriteLine($"no {arg}"); break;\n        case "show": Console.WriteLine(list.Count == 0 ? "empty" : list.ToString()); break;\n        case "count": Console.WriteLine(list.Count); break;\n    }\n}\n\nclass Node\n{\n    public string Value = "";\n    public Node? Next;\n}\n\nclass Chain\n{\n    private Node? head, tail;\n    public int Count { get; private set; }\n    public void AddFirst(string v)\n    {\n        head = new Node { Value = v, Next = head };\n        tail ??= head;\n        Count++;\n    }\n    public void AddLast(string v)\n    {\n        var n = new Node { Value = v };\n        if (tail == null) head = tail = n;\n        else { tail.Next = n; tail = n; }\n        Count++;\n    }\n    public bool Remove(string v)\n    {\n        Node? prev = null;\n        for (var n = head; n != null; prev = n, n = n.Next)\n        {\n            if (n.Value != v) continue;\n            if (prev == null) head = n.Next; else prev.Next = n.Next;\n            if (n == tail) tail = prev;\n            Count--;\n            return true;\n        }\n        return false;\n    }\n    public override string ToString()\n    {\n        string s = "";\n        for (var n = head; n != null; n = n.Next) s += (s == "" ? "" : " → ") + n.Value;\n        return s;\n    }\n}' },
    "12.7-reverse": { lesson: "12.7", title: "Reverse and middle", tier: "stretch", minutes: 20, concepts: ["linked-list"],
      statement: ["Read whole numbers on one line into a linked list of nodes (in order). Reverse it IN PLACE (turn the Next references; no new nodes, no arrays or lists).", "Print the reversed list space-separated, then `middle M` — found with a slow and a fast pointer (for an even count, the second of the two middles) — or `empty`."],
      starter: 'string[] parts = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\n\nclass Node { public int Value; public Node? Next; public Node(int v, Node? n) { Value = v; Next = n; } }',
      examples: [{ stdin: "1 2 3 4 5", out: "5 4 3 2 1\nmiddle 3" }],
      hidden: [{ stdin: "1 2 3 4", out: "4 3 2 1\nmiddle 2" }, { stdin: "", out: "empty" }, { stdin: "9", out: "9\nmiddle 9" }],
      rules: [uses(/class\s+Node\b/, "Use the Node class."), uses(/\.Next\s*=\s*prev/, "Reverse by turning Next round (….Next = prev).", "turn"), noUse(/List<|Reverse\s*\(\s*\)|Array\.Reverse|Stack</, "No collections: turn the references.", "nocoll")],
      hints: ["Build in order with a tail: Node? head = null, tail = null; …", "Node? prev = null; while (head != null) { var next = head.Next; head.Next = prev; prev = head; head = next; } head = prev;", "Middle: slow = fast = head; while (fast.Next != null && fast.Next.Next != null) …; for an even count the reversed list's second middle is slow.Next when fast.Next != null."],
      answer: 'string[] parts = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nNode? head = null, tail = null;\nforeach (var p in parts)\n{\n    var n = new Node(int.Parse(p), null);\n    if (tail == null) head = tail = n; else { tail.Next = n; tail = n; }\n}\nif (head == null) { Console.WriteLine("empty"); return; }\nNode? prev = null;\nwhile (head != null)\n{\n    var next = head.Next;\n    head.Next = prev;\n    prev = head;\n    head = next;\n}\nhead = prev!;\nstring s = "";\nfor (Node? n = head; n != null; n = n.Next) s += (s == "" ? "" : " ") + n.Value;\nConsole.WriteLine(s);\nNode slow = head, fast = head;\nwhile (fast.Next != null && fast.Next.Next != null) { slow = slow.Next!; fast = fast.Next.Next; }\nif (fast.Next != null) slow = slow.Next!;\nConsole.WriteLine($"middle {slow.Value}");\n\nclass Node { public int Value; public Node? Next; public Node(int v, Node? n) { Value = v; Next = n; } }' }
  } });

  /* ================================================================
     12.8 Stacks and queues from scratch
     ================================================================ */
  lesson("12.8", {
    aqa: "4.2.3.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "You have used `Stack<T>` and `Queue<T>` since unit 4. AQA asks you to build them: on a fixed **array** with pointers, and as a **circular** queue that reuses its space.",
        "A **stack** is last in, first out (LIFO): undo, the call stack (12.6), brackets. A **queue** is first in, first out (FIFO): print jobs, breadth-first search (12.12).",
        "Building them shows why each operation is O(1) — and what \"full\" means when memory is fixed."
      ] },
      page("Core idea"),
      run("stack", "a stack on an array: one pointer, the top", 'var s = new ArrayStack(3);\ns.Push(10); s.Push(20); s.Push(30);\nConsole.WriteLine(s.IsFull);\nConsole.WriteLine(s.Pop());\nConsole.WriteLine(s.Peek());\nConsole.WriteLine(s.Count);\n\nclass ArrayStack\n{\n    private readonly int[] items;\n    private int top = -1;\n    public ArrayStack(int capacity) => items = new int[capacity];\n    public int Count => top + 1;\n    public bool IsEmpty => top == -1;\n    public bool IsFull => top == items.Length - 1;\n    public void Push(int x)\n    {\n        if (IsFull) throw new InvalidOperationException("Stack overflow: it is full.");\n        items[++top] = x;\n    }\n    public int Pop() => IsEmpty ? throw new InvalidOperationException("Stack underflow: it is empty.") : items[top--];\n    public int Peek() => IsEmpty ? throw new InvalidOperationException("It is empty.") : items[top];\n}'),
      run("queue", "a circular queue: front and rear wrap round with %", 'var q = new CircularQueue(3);\nq.Enqueue("a"); q.Enqueue("b"); q.Enqueue("c");\nConsole.WriteLine(q.Dequeue());\nq.Enqueue("d");\nConsole.WriteLine(q);\nwhile (!q.IsEmpty) Console.Write(q.Dequeue() + " ");\nConsole.WriteLine();\n\nclass CircularQueue\n{\n    private readonly string[] items;\n    private int front, count;\n    public CircularQueue(int capacity) => items = new string[capacity];\n    public bool IsEmpty => count == 0;\n    public bool IsFull => count == items.Length;\n    public void Enqueue(string x)\n    {\n        if (IsFull) throw new InvalidOperationException("The queue is full.");\n        items[(front + count) % items.Length] = x;\n        count++;\n    }\n    public string Dequeue()\n    {\n        if (IsEmpty) throw new InvalidOperationException("The queue is empty.");\n        string x = items[front];\n        front = (front + 1) % items.Length;\n        count--;\n        return x;\n    }\n    public override string ToString() => $"front {front}, count {count}, rear {(front + count - 1 + items.Length) % items.Length}";\n}'),
      page("Rules"),
      { table: { head: ["", "Stack", "Queue"], rows: [["Order", "LIFO", "FIFO"], ["Add", "Push onto the top", "Enqueue at the rear"], ["Remove", "Pop from the top", "Dequeue from the front"], ["Look", "Peek", "Peek / the front"], ["Errors", "overflow (full), underflow (empty)", "full, empty"], ["Each operation", "O(1)", "O(1)"]] } },
      { ul: [
        "An array stack needs one pointer, `top`; −1 means empty.",
        "A **linear** queue on an array moves its front forward and wastes the space behind it; a **circular** queue wraps both ends round with `% capacity` and reuses it.",
        "Keep a **count** (or leave one slot empty) to tell a full circular queue from an empty one — both have front where rear + 1 would be.",
        "On nodes (12.7) neither is ever full; a stack pushes and pops at the head, a queue adds at the tail and removes at the head.",
        "A **priority queue** dequeues the smallest priority first (`PriorityQueue<TElement, TPriority>`): Dijkstra's algorithm (12.13) needs one."
      ] },
      page("Variations"),
      { h: "A stack on nodes" },
      run("nodes", "never full: push and pop at the head", 'var s = new NodeStack<string>();\nforeach (var w in "to be or not".Split(\' \')) s.Push(w);\nwhile (!s.IsEmpty) Console.Write(s.Pop() + " ");\nConsole.WriteLine();\n\nclass NodeStack<T>\n{\n    private record Node(T Value, Node? Next);\n    private Node? head;\n    public bool IsEmpty => head == null;\n    public void Push(T x) => head = new Node(x, head);\n    public T Pop()\n    {\n        if (head == null) throw new InvalidOperationException("empty");\n        T x = head.Value;\n        head = head.Next;\n        return x;\n    }\n}'),
      { h: "A stack at work: matching brackets" },
      run("brackets", "each closer must match the latest opener", 'foreach (var s in new[] { "(a[b]{c})", "(]", "((" })\n{\n    var open = new Stack<char>();\n    string verdict = "balanced";\n    foreach (char c in s)\n    {\n        if ("([{".Contains(c)) open.Push(c);\n        else if (")]}".Contains(c))\n        {\n            char want = c == \')\' ? \'(\' : c == \']\' ? \'[\' : \'{\';\n            if (open.Count == 0 || open.Pop() != want) { verdict = "mismatch"; break; }\n        }\n    }\n    if (verdict == "balanced" && open.Count > 0) verdict = "unclosed";\n    Console.WriteLine($"{s}: {verdict}");\n}'),
      { h: "A priority queue" },
      run("priority", "the lowest number comes out first, whatever the order in", 'var jobs = new PriorityQueue<string, int>();\njobs.Enqueue("tidy desk", 3);\njobs.Enqueue("revise CS", 1);\njobs.Enqueue("reply to Kai", 2);\nwhile (jobs.TryDequeue(out string? job, out int p)) Console.WriteLine($"{p} {job}");'),
      page("Pitfalls"),
      { h: "The wrong type pushed — CS1503" },
      run("pit-type", "a Stack<int> takes ints", 'var s = new Stack<int>();\ns.Push("ten");'),
      { h: "Popping an empty stack" },
      run("pit-empty", "underflow: check IsEmpty, or use TryPop", 'var s = new Stack<int>();\nConsole.WriteLine(s.TryPop(out int x) ? x.ToString() : "nothing to pop");\nConsole.WriteLine(s.Pop());'),
      { h: "A linear queue that says full when it is empty" },
      "Without wrapping, `rear` reaches the end of the array after `capacity` enqueues — even if every item has been dequeued. That is why AQA's circular queue uses `(rear + 1) % capacity`.",
      page("Connections"),
      { ul: [ "**Back:** 4.x Stack<T> and Queue<T>; 12.6 the call stack; 12.7 nodes.", "**Next:** 12.9 reverse Polish runs on a stack; 12.12 breadth-first search on a queue, depth-first on a stack; 12.13 Dijkstra on a priority queue.", "**AQA:** 4.2.2.1 queues (linear, circular, priority), 4.2.3.1 stacks (push, pop, peek, full, empty)." ] },
      page("Good practice"),
      { ul: [ "Throw a clear exception for overflow and underflow; offer Try methods for callers that expect it.", "Trace front, rear and count on paper for a circular queue.", "Use the library's types in real code; build your own to understand them." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A circular queue* and *Bracket checker*." ] },
      page("Quick reference"),
      run("qr", "wrap with %", 'int cap = 4, front = 3, count = 2;\nConsole.WriteLine($"rear at {(front + count - 1) % cap}, next free {(front + count) % cap}");'),
      { ul: [ "Stack: `top`, −1 empty, `++top` push, `top--` pop.", "Circular queue: front, count; next = (front + count) % cap.", "Both O(1); nodes never fill." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1503", "an argument of the wrong type", "Pitfalls"], ["InvalidOperationException", "popped or dequeued while empty", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var s = new Stack<int>();\nvar q = new Queue<int>();\nforeach (int i in new[] { 1, 2, 3 }) { s.Push(i); q.Enqueue(i); }\nConsole.WriteLine($"{s.Pop()} {q.Dequeue()}");', why: "The stack gives the last in (3); the queue the first in (1).", concepts: ["stack-queue"] },
        { id: "p2", src: 'int cap = 4, front = 0, count = 0;\nfor (int i = 0; i < 3; i++) count++;\nfor (int i = 0; i < 2; i++) { front = (front + 1) % cap; count--; }\nfor (int i = 0; i < 2; i++) count++;\nConsole.WriteLine($"{front} {(front + count - 1) % cap}");', why: "After 3 in, 2 out, 2 in: front 2, three items at 2, 3 and 0 — the rear wrapped to 0.", concepts: ["stack-queue"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the front wraps round a capacity-4 queue.", src: 'int front = 3;\nfront = @@;\nConsole.WriteLine(front);', out: "0", answer: "(front + 1) % 4", concepts: ["stack-queue"] }
      ],
      bug: [
        { id: "b1", q: "Pushing 1, 2 then popping should give 2.", src: 'int[] items = new int[4];\nint top = -1;\nitems[top++] = 1;\nitems[top++] = 2;\nConsole.WriteLine(items[top--]);', out: "2", fixedText: "prints 2", why: "top++ uses the old value first (items[-1]); push with items[++top] = x.", concepts: ["stack-queue"] }
      ]
    },
    flashcards: [
      ["LIFO or FIFO: a stack?", "LIFO — last in, first out."],
      ["What does top = −1 mean in an array stack?", "The stack is empty."],
      ["Why a circular queue?", "It reuses the array's space by wrapping front and rear with % capacity."],
      ["How do you tell full from empty in a circular queue?", "Keep a count (or leave one slot unused)."],
      ["What is stack underflow?", "Popping an empty stack."],
      ["What does a priority queue dequeue?", "The item with the smallest priority value, whatever order they arrived in."]
    ],
    quiz: [
      { q: "Push 1, push 2, pop, push 3, pop — the last value popped is…", opts: ["1", "2", "3", "nothing"], ans: 2, why: "3 was pushed last." },
      { q: "A circular queue of capacity 5 with front 3 and count 4 has its rear at…", opts: ["6", "1", "2", "7"], ans: 1, why: "(3 + 4 − 1) % 5 = 1." },
      { q: "Breadth-first search uses…", opts: ["a stack", "a queue", "a hash table", "recursion only"], ans: 1, why: "It visits the nearest first: FIFO." }
    ]
  });
  K.add({ tasks: {
    "12.8-circular": { lesson: "12.8", title: "A circular queue", tier: "core", minutes: 25, concepts: ["stack-queue"],
      statement: ["Build a circular queue of strings on an array (no Queue<T> or List<T>) with `front` and `count`.", "Read the capacity, then commands until the end: `enq X` (print `full` if it is), `deq` (print the item, or `empty`), and `show` — `[a b c] front F` with the items front to back and the front index."],
      starter: 'int cap = int.Parse(Console.ReadLine() ?? "1");\n',
      examples: [{ stdin: "3\nenq a\nenq b\nenq c\nenq d\ndeq\nenq d\nshow", out: "full\na\n[b c d] front 1" }],
      hidden: [{ stdin: "2\ndeq\nshow\nenq x\ndeq\nenq y\nenq z\nshow", out: "empty\n[] front 0\nx\n[y z] front 1" }, { stdin: "1\nenq a\nenq b\ndeq\ndeq\nenq c\nshow", out: "full\na\nempty\n[c] front 0" }],
      rules: [noUse(/Queue<|List<|LinkedList/, "Build it on an array.", "array"), uses(/%/, "Wrap round with %.", "wrap")],
      hints: ["string[] items = new string[cap]; int front = 0, count = 0;", "enq: items[(front + count) % cap] = x; count++;", "deq: string x = items[front]; front = (front + 1) % cap; count--;"],
      answer: 'int cap = int.Parse(Console.ReadLine() ?? "1");\nvar q = new CircularQueue(cap);\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    if (p[0] == "enq") { if (!q.TryEnqueue(p[1])) Console.WriteLine("full"); }\n    else if (p[0] == "deq") Console.WriteLine(q.TryDequeue(out string x) ? x : "empty");\n    else Console.WriteLine(q);\n}\n\nclass CircularQueue\n{\n    private readonly string[] items;\n    private int front, count;\n    public CircularQueue(int capacity) => items = new string[capacity];\n    public bool TryEnqueue(string x)\n    {\n        if (count == items.Length) return false;\n        items[(front + count) % items.Length] = x;\n        count++;\n        return true;\n    }\n    public bool TryDequeue(out string x)\n    {\n        x = "";\n        if (count == 0) return false;\n        x = items[front];\n        front = (front + 1) % items.Length;\n        count--;\n        return true;\n    }\n    public override string ToString()\n    {\n        var parts = new string[count];\n        for (int i = 0; i < count; i++) parts[i] = items[(front + i) % items.Length];\n        return $"[{string.Join(" ", parts)}] front {front}";\n    }\n}' },
    "12.8-brackets": { lesson: "12.8", title: "Bracket checker", tier: "core", minutes: 20, concepts: ["stack-queue"],
      statement: ["Read lines until the end. Check the brackets `()`, `[]` and `{}` with a stack of the openers' positions (other characters are ignored; positions count from 1).", "Print `ok`, `unexpected C at P` (a closer with nothing open, or the wrong kind), or `unclosed C from P` (the most recent opener still open at the end)."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "(a[b]{c})\n(]\n((x)", out: "ok\nunexpected ] at 2\nunclosed ( from 1" }],
      hidden: [{ stdin: "x)\nf(a, g[b])\n{[(]}", out: "unexpected ) at 2\nok\nunexpected ] at 4" }, { stdin: "[(", out: "unclosed ( from 2" }],
      rules: [uses(/Stack<|\+\+top|top\+\+/, "Use a stack.", "stack")],
      hints: ["var open = new Stack<int>(); // positions of openers", "On a closer: if (open.Count == 0 || line[open.Peek()] != matching opener) → unexpected; else open.Pop();", "At the end, if open.Count > 0: unclosed line[open.Peek()] from open.Peek() + 1."],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var open = new Stack<int>();\n    string verdict = "ok";\n    for (int i = 0; i < line.Length; i++)\n    {\n        char c = line[i];\n        if (c == \'(\' || c == \'[\' || c == \'{\') open.Push(i);\n        else if (c == \')\' || c == \']\' || c == \'}\')\n        {\n            char want = c == \')\' ? \'(\' : c == \']\' ? \'[\' : \'{\';\n            if (open.Count == 0 || line[open.Peek()] != want) { verdict = $"unexpected {c} at {i + 1}"; break; }\n            open.Pop();\n        }\n    }\n    if (verdict == "ok" && open.Count > 0) verdict = $"unclosed {line[open.Peek()]} from {open.Peek() + 1}";\n    Console.WriteLine(verdict);\n}' }
  } });

  /* ================================================================
     12.9 Reverse Polish notation
     ================================================================ */
  lesson("12.9", {
    aqa: "4.3.3.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "`3 + 4 * 2` needs rules (precedence) and brackets to say what it means. A calculator reading it left to right cannot just apply operators as they come.",
        "**Reverse Polish notation** (postfix) writes the operator **after** its operands: `3 4 2 * +`. No brackets, no precedence — one stack evaluates it in a single pass.",
        "Dijkstra's **shunting-yard** algorithm converts ordinary infix into postfix. Together they are how calculators, compilers and the LMC-style machines read arithmetic."
      ] },
      page("Core idea"),
      run("eval", "evaluate postfix: numbers push, operators pop two and push the result", 'foreach (var expr in new[] { "3 4 2 * +", "5 1 2 + 4 * + 3 -", "2 3 ^" })\n    Console.WriteLine($"{expr} = {Eval(expr)}");\n\nstatic double Eval(string postfix)\n{\n    var st = new Stack<double>();\n    foreach (var t in postfix.Split(\' \'))\n    {\n        if (double.TryParse(t, out double n)) { st.Push(n); continue; }\n        double b = st.Pop(), a = st.Pop();\n        st.Push(t switch { "+" => a + b, "-" => a - b, "*" => a * b, "/" => a / b, "^" => Math.Pow(a, b), _ => throw new FormatException(t) });\n    }\n    return st.Pop();\n}'),
      { ul: [
        "A number is pushed. An operator pops its **right** operand first, then its left: `b = Pop(), a = Pop()`, then pushes `a op b`.",
        "At the end exactly one value is left: the answer.",
        "One pass, O(n), and the expression's structure is in the order of the tokens alone."
      ] },
      run("trace", "the stack after every token", 'var st = new Stack<int>();\nforeach (var t in "6 2 3 + * 4 -".Split(\' \'))\n{\n    if (int.TryParse(t, out int n)) st.Push(n);\n    else { int b = st.Pop(), a = st.Pop(); st.Push(t == "+" ? a + b : t == "-" ? a - b : a * b); }\n    Console.WriteLine($"{t,-2} [{string.Join(" ", st.Reverse())}]");\n}'),
      page("Rules"),
      { table: { head: ["Infix", "Postfix (RPN)", "Value"], rows: [["3 + 4", "3 4 +", "7"], ["3 + 4 * 2", "3 4 2 * +", "11"], ["(3 + 4) * 2", "3 4 + 2 *", "14"], ["8 - 3 - 2", "8 3 - 2 -", "3"], ["2 ^ 3 ^ 2", "2 3 2 ^ ^", "512"]] } },
      { ul: [
        "Operands keep their left-to-right order; only the operators move.",
        "**Shunting yard**: numbers go straight to the output; an operator first pops to the output every operator on the stack with higher precedence (or equal, if it is left-associative); `(` is pushed; `)` pops until the matching `(`; at the end pop everything.",
        "Precedence: `^` above `*` `/` above `+` `-`. `^` is right-associative (`2^3^2 = 2^9`); the rest are left-associative.",
        "Too few operands for an operator, or more than one value left at the end, means the postfix was malformed."
      ] },
      page("Variations"),
      { h: "Infix to postfix: the shunting yard" },
      run("shunt", "operators wait on a stack until a weaker one arrives", 'foreach (var e in new[] { "3 + 4 * 2", "( 3 + 4 ) * 2", "8 - 3 - 2", "2 ^ 3 ^ 2", "a * ( b + c ) / d" })\n    Console.WriteLine($"{e,-20} → {ToPostfix(e)}");\n\nstatic string ToPostfix(string infix)\n{\n    var prec = new Dictionary<string, int> { ["+"] = 1, ["-"] = 1, ["*"] = 2, ["/"] = 2, ["^"] = 3 };\n    var output = new List<string>();\n    var ops = new Stack<string>();\n    foreach (var t in infix.Split(\' \'))\n    {\n        if (prec.ContainsKey(t))\n        {\n            while (ops.Count > 0 && ops.Peek() != "(" && (prec[ops.Peek()] > prec[t] || (prec[ops.Peek()] == prec[t] && t != "^")))\n                output.Add(ops.Pop());\n            ops.Push(t);\n        }\n        else if (t == "(") ops.Push(t);\n        else if (t == ")") { while (ops.Peek() != "(") output.Add(ops.Pop()); ops.Pop(); }\n        else output.Add(t);\n    }\n    while (ops.Count > 0) output.Add(ops.Pop());\n    return string.Join(" ", output);\n}'),
      { h: "Catching malformed input" },
      run("errors", "too few operands, or leftovers", 'foreach (var p in new[] { "1 2 +", "1 +", "1 2 3 +" })\n{\n    var st = new Stack<int>();\n    string verdict = "";\n    foreach (var t in p.Split(\' \'))\n    {\n        if (int.TryParse(t, out int n)) { st.Push(n); continue; }\n        if (st.Count < 2) { verdict = "too few operands"; break; }\n        int b = st.Pop(), a = st.Pop();\n        st.Push(a + b);\n    }\n    if (verdict == "") verdict = st.Count == 1 ? $"= {st.Pop()}" : "values left over";\n    Console.WriteLine($"{p}: {verdict}");\n}'),
      page("Pitfalls"),
      { h: "Pushing the token instead of its value — CS1503" },
      run("pit-type", "the stack holds numbers; the token is a string", 'var st = new Stack<double>();\nforeach (var t in "3 4 +".Split(\' \')) st.Push(t);'),
      { h: "Operands popped the wrong way round" },
      run("pit-order", "8 2 - should be 6; popping a then b gives −6", 'var st = new Stack<int>();\nst.Push(8); st.Push(2);\nint a = st.Pop(), b = st.Pop();\nConsole.WriteLine(a - b);'),
      { h: "Treating ^ as left-associative" },
      "`2 ^ 3 ^ 2` is 2⁹ = 512, not 8² = 64. In the shunting yard, an incoming `^` does not pop an equal `^`.",
      page("Connections"),
      { ul: [ "**Back:** 12.8 stacks; 4.x dictionaries for the precedence table.", "**Next:** 12.11 an expression tree read in post-order is RPN; T9 builds a calculator language with a real parser.", "**AQA:** 4.3.3.1 reverse Polish — infix transformations, and why postfix suits a stack machine." ] },
      page("Good practice"),
      { ul: [ "Separate tokenising (splitting the text) from evaluating.", "Check the stack has enough operands before every pop and exactly one value at the end.", "Keep precedence and associativity in a table, not in if-chains." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A postfix calculator* and *Infix to postfix*." ] },
      page("Quick reference"),
      run("qr", "evaluate in five lines", 'var st = new Stack<int>();\nforeach (var t in "2 3 4 * +".Split(\' \'))\n    if (int.TryParse(t, out int n)) st.Push(n);\n    else { int b = st.Pop(), a = st.Pop(); st.Push(t == "+" ? a + b : a * b); }\nConsole.WriteLine(st.Pop());'),
      { ul: [ "Number → push; operator → pop b, pop a, push a op b.", "Shunting yard: output numbers, stack operators by precedence, brackets.", "^ is right-associative." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1503", "a string pushed onto a Stack<double>", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var st = new Stack<int>();\nforeach (var t in "5 1 2 + 4 * + 3 -".Split(\' \'))\n    if (int.TryParse(t, out int n)) st.Push(n);\n    else { int b = st.Pop(), a = st.Pop(); st.Push(t == "+" ? a + b : t == "-" ? a - b : a * b); }\nConsole.WriteLine(st.Pop());', why: "1 + 2 = 3; 3 × 4 = 12; 5 + 12 = 17; 17 − 3 = 14.", concepts: ["rpn"] },
        { id: "p2", src: 'var st = new Stack<int>();\nint most = 0;\nforeach (var t in "1 2 3 4 + + +".Split(\' \'))\n{\n    if (int.TryParse(t, out int n)) st.Push(n);\n    else { int b = st.Pop(), a = st.Pop(); st.Push(a + b); }\n    most = Math.Max(most, st.Count);\n}\nConsole.WriteLine($"{st.Pop()} {most}");', why: "All four numbers are on the stack before the first +: the sum 10, at most 4 deep.", concepts: ["rpn"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the postfix form of (2 + 3) * 4.", src: 'var st = new Stack<int>();\nforeach (var t in "@@".Split(\' \'))\n    if (int.TryParse(t, out int n)) st.Push(n);\n    else { int b = st.Pop(), a = st.Pop(); st.Push(t == "+" ? a + b : a * b); }\nConsole.WriteLine(st.Pop());', out: "20", answer: "2 3 + 4 *", concepts: ["rpn"] }
      ],
      bug: [
        { id: "b1", q: "`9 3 /` should be 3.", src: 'var st = new Stack<int>();\nforeach (var t in "9 3 /".Split(\' \'))\n    if (int.TryParse(t, out int n)) st.Push(n);\n    else { int a = st.Pop(), b = st.Pop(); st.Push(a / b); }\nConsole.WriteLine(st.Pop());', out: "3", fixedText: "prints 3", why: "The first pop is the RIGHT operand: int b = st.Pop(), a = st.Pop(); then a / b.", concepts: ["rpn"] }
      ]
    },
    flashcards: [
      ["What is reverse Polish notation?", "Postfix: operators after their operands, e.g. 3 4 + — no brackets or precedence needed."],
      ["How is postfix evaluated?", "Numbers push; an operator pops two (right first), applies, pushes the result."],
      ["(3 + 4) * 2 in postfix?", "3 4 + 2 *"],
      ["3 + 4 * 2 in postfix?", "3 4 2 * +"],
      ["Which algorithm converts infix to postfix?", "Dijkstra's shunting yard."],
      ["Why is ^ special in the shunting yard?", "It is right-associative: an incoming ^ does not pop an equal ^."]
    ],
    quiz: [
      { q: "`4 2 5 * +` evaluates to…", opts: ["30", "14", "11", "21"], ans: 1, why: "2 × 5 = 10, 4 + 10 = 14." },
      { q: "Postfix needs brackets…", opts: ["for every operator", "never", "only for ^", "for subtraction"], ans: 1, why: "The token order carries the structure." },
      { q: "The infix of `6 2 3 + *` is…", opts: ["6 * 2 + 3", "6 * (2 + 3)", "(6 * 2) + 3", "6 + 2 * 3"], ans: 1, why: "2 3 + is (2 + 3), then times 6." }
    ]
  });
  K.add({ tasks: {
    "12.9-eval": { lesson: "12.9", title: "A postfix calculator", tier: "core", minutes: 20, concepts: ["rpn", "stack-queue"],
      statement: ["Read postfix expressions of whole numbers and `+ - * /` (integer division), tokens separated by spaces, one per line until the end.", "Print the value with a stack, or `error` when an operator lacks operands, a division by zero happens, or more than one value is left."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "3 4 2 * +\n5 1 2 + 4 * + 3 -\n1 +", out: "11\n14\nerror" }],
      hidden: [{ stdin: "8 0 /\n9 3 /\n7 2 -\n1 2", out: "error\n3\n5\nerror" }, { stdin: "-4 2 *\n42", out: "-8\n42" }],
      rules: [uses(/Stack</, "Evaluate with a Stack.")],
      hints: ["foreach token: if (long.TryParse(t, out long n)) st.Push(n); else { if (st.Count < 2) → error; long b = st.Pop(), a = st.Pop(); … }", "Division: if (b == 0) → error.", "At the end: st.Count == 1 ? st.Pop() : error."],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var st = new Stack<long>();\n    bool bad = false;\n    foreach (var t in line.Split(\' \', StringSplitOptions.RemoveEmptyEntries))\n    {\n        if (long.TryParse(t, out long n)) { st.Push(n); continue; }\n        if (st.Count < 2) { bad = true; break; }\n        long b = st.Pop(), a = st.Pop();\n        if (t == "/" && b == 0) { bad = true; break; }\n        st.Push(t switch { "+" => a + b, "-" => a - b, "*" => a * b, _ => a / b });\n    }\n    Console.WriteLine(!bad && st.Count == 1 ? st.Pop().ToString() : "error");\n}' },
    "12.9-convert": { lesson: "12.9", title: "Infix to postfix", tier: "stretch", minutes: 30, concepts: ["rpn"],
      statement: ["Read infix expressions, tokens separated by spaces (numbers or names, `+ - * / ^`, brackets), one per line until the end.", "Convert each with the shunting-yard algorithm (`^` binds tightest and is right-associative; the rest are left-associative) and print the postfix, tokens separated by single spaces."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "3 + 4 * 2\n( 3 + 4 ) * 2", out: "3 4 2 * +\n3 4 + 2 *" }],
      hidden: [{ stdin: "8 - 3 - 2\n2 ^ 3 ^ 2\na * ( b + c ) / d", out: "8 3 - 2 -\n2 3 2 ^ ^\na b c + * d /" }, { stdin: "x", out: "x" }],
      rules: [uses(/Stack</, "Hold the operators on a Stack.")],
      hints: ["var prec = new Dictionary<string, int> { [\"+\"] = 1, [\"-\"] = 1, [\"*\"] = 2, [\"/\"] = 2, [\"^\"] = 3 };", "Before pushing an operator, pop while the top is an operator with higher precedence, or equal precedence and the new one is not ^.", "( is pushed; ) pops to the output until (, then drops it; at the end pop everything."],
      answer: 'var prec = new Dictionary<string, int> { ["+"] = 1, ["-"] = 1, ["*"] = 2, ["/"] = 2, ["^"] = 3 };\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var output = new List<string>();\n    var ops = new Stack<string>();\n    foreach (var t in line.Split(\' \', StringSplitOptions.RemoveEmptyEntries))\n    {\n        if (prec.ContainsKey(t))\n        {\n            while (ops.Count > 0 && ops.Peek() != "(" && (prec[ops.Peek()] > prec[t] || (prec[ops.Peek()] == prec[t] && t != "^")))\n                output.Add(ops.Pop());\n            ops.Push(t);\n        }\n        else if (t == "(") ops.Push(t);\n        else if (t == ")")\n        {\n            while (ops.Peek() != "(") output.Add(ops.Pop());\n            ops.Pop();\n        }\n        else output.Add(t);\n    }\n    while (ops.Count > 0) output.Add(ops.Pop());\n    Console.WriteLine(string.Join(" ", output));\n}' }
  } });

  /* ================================================================
     12.10 Hash tables from scratch
     ================================================================ */
  lesson("12.10", {
    aqa: "4.2.6.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A Dictionary finds a key among a million in one step. A sorted array needs about twenty (12.3); a list needs half a million. How does it do it?",
        "A **hash function** turns the key into a number; that number, modulo the table's size, is the **slot** to look in. Same key, same slot, every time.",
        "Two keys can land in one slot — a **collision**. **Chaining** keeps a little list per slot; **open addressing** tries the next slot along."
      ] },
      page("Core idea"),
      run("hash", "a simple hash: add up the character codes, modulo the size", 'int size = 7;\nforeach (var key in new[] { "cat", "dog", "act", "emu" })\n{\n    int h = 0;\n    foreach (char c in key) h += c;\n    Console.WriteLine($"{key}: sum {h}, slot {h % size}");\n}'),
      { ul: [
        "\"cat\" and \"act\" collide: same letters, same sum. A good hash mixes in the **order** too.",
        "The slot is `hash % size`; the table is just an array of that size."
      ] },
      run("chaining", "a chained table: each slot holds a list of key–value pairs", 'var t = new ChainTable(5);\nt.Put("cat", 3); t.Put("act", 9); t.Put("dog", 4); t.Put("cat", 5);\nConsole.WriteLine(t.Get("cat"));\nConsole.WriteLine(t.Get("act"));\nConsole.WriteLine(t.Get("cow") ?? -1);\nt.Show();\n\nclass ChainTable\n{\n    private readonly List<(string Key, int Value)>[] slots;\n    public ChainTable(int size)\n    {\n        slots = new List<(string, int)>[size];\n        for (int i = 0; i < size; i++) slots[i] = new();\n    }\n    private int Slot(string key) { int h = 0; foreach (char c in key) h = h * 31 + c; return (h & 0x7FFFFFFF) % slots.Length; }\n    public void Put(string key, int value)\n    {\n        var chain = slots[Slot(key)];\n        int i = chain.FindIndex(p => p.Key == key);\n        if (i >= 0) chain[i] = (key, value); else chain.Add((key, value));\n    }\n    public int? Get(string key)\n    {\n        foreach (var p in slots[Slot(key)]) if (p.Key == key) return p.Value;\n        return null;\n    }\n    public void Show()\n    {\n        for (int i = 0; i < slots.Length; i++)\n            Console.WriteLine($"{i}: {string.Join(", ", slots[i].Select(p => $"{p.Key}={p.Value}"))}");\n    }\n}'),
      page("Rules"),
      { ul: [
        "A hash function must be **deterministic** (same key, same hash) and should spread keys **evenly**.",
        "Equal keys must hash equally — that is why overriding `Equals` means overriding `GetHashCode` (8.7's records do both).",
        "**Chaining**: each slot holds a list; a lookup hashes, then searches that short list.",
        "**Open addressing** (linear probing): on a collision try the next slot, `(slot + 1) % size`, until a free one; a lookup follows the same path until it finds the key or an empty slot.",
        "The **load factor** is items ÷ slots. Above about 0.75 collisions grow, so the table **rehashes** into a bigger array — every item moves, because the size in `% size` changed.",
        "With a good hash and load factor, put and get are O(1) on average; if everything collides they decay to O(n)."
      ] },
      page("Variations"),
      { h: "Open addressing with linear probing" },
      run("probe", "a collision steps along to the next free slot", 'var slots = new string?[7];\nforeach (var key in new[] { "cat", "act", "tac", "dog" })\n{\n    int h = 0;\n    foreach (char c in key) h += c;\n    int s = h % slots.Length, probes = 1;\n    while (slots[s] != null) { s = (s + 1) % slots.Length; probes++; }\n    slots[s] = key;\n    Console.WriteLine($"{key} → slot {s} after {probes} probe(s)");\n}'),
      { h: "Growing: the load factor" },
      run("grow", "double the slots and re-insert everything when items/slots passes 0.75", 'int size = 4, count = 0;\nfor (int i = 1; i <= 10; i++)\n{\n    count++;\n    if ((double)count / size > 0.75)\n    {\n        size *= 2;\n        Console.WriteLine($"item {i}: load over 0.75, rehash into {size} slots");\n    }\n}\nConsole.WriteLine($"{count} items in {size} slots, load {(double)count / size:F2}");'),
      { h: "Your own key type" },
      run("keys", "a record hashes by value; a plain class by reference", 'var byRecord = new HashSet<P> { new(1, 2) };\nvar byClass = new HashSet<Q> { new Q { X = 1, Y = 2 } };\nConsole.WriteLine(byRecord.Contains(new P(1, 2)));\nConsole.WriteLine(byClass.Contains(new Q { X = 1, Y = 2 }));\n\nrecord P(int X, int Y);\nclass Q { public int X, Y; }'),
      page("Pitfalls"),
      { h: "% on a string — CS0019" },
      run("pit-type", "hash the key first; a string has no %", 'string key = "cat";\nint slot = key % 7;'),
      { h: "A negative hash" },
      run("pit-negative", "an overflowing hash goes negative, and % keeps the sign", 'int h = 0;\nforeach (char c in "stack overflow") h = h * 31 + c;\nConsole.WriteLine(h);\nConsole.WriteLine(h % 7);\nConsole.WriteLine((h & 0x7FFFFFFF) % 7);'),
      { h: "Printing GetHashCode" },
      "`\"cat\".GetHashCode()` changes every time the program runs (.NET randomises string hashes against attacks). Never store it or write it to a file; use it only inside one run.",
      page("Connections"),
      { ul: [ "**Back:** 5.x Dictionary and HashSet; 8.7 records' GetHashCode; 12.2 bits in a hash; 12.7 chains are linked lists.", "**Next:** 12.12 visited sets in graph search; T6 security's password hashing is a different, slow kind of hash.", "**AQA:** 4.2.6.1 hash tables (hashing, collisions, rehashing) and 4.2.7.1 dictionaries." ] },
      page("Good practice"),
      { ul: [ "Use Dictionary/HashSet in real code; know they are hash tables.", "Make key types immutable — a key that changes after insertion is lost in the wrong slot.", "Override Equals and GetHashCode together (or use a record)." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A chained table* and *Linear probing*." ] },
      page("Quick reference"),
      run("qr", "hash, slot, chain", 'int Slot(string k, int size) { int h = 0; foreach (char c in k) h = h * 31 + c; return (h & 0x7FFFFFFF) % size; }\nConsole.WriteLine($"{Slot("cat", 11)} {Slot("act", 11)}");'),
      { ul: [ "slot = hash(key) % size; collisions by chaining or probing.", "Load factor = items / slots; rehash past ~0.75.", "Average O(1); worst O(n)." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0019", "% between a string and an int", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int Slot(string k) { int h = 0; foreach (char c in k) h += c; return h % 5; }\nConsole.WriteLine($"{Slot("ab")} {Slot("ba")} {Slot("c")}");', why: "97 + 98 = 195 for both orders, 195 % 5 = 0; 'c' is 99, 99 % 5 = 4.", concepts: ["hash-table"] },
        { id: "p2", src: 'var slots = new int?[5];\nforeach (int k in new[] { 7, 12, 2 })\n{\n    int s = k % 5;\n    while (slots[s] != null) s = (s + 1) % 5;\n    slots[s] = k;\n}\nConsole.WriteLine(string.Join(" ", slots.Select(x => x?.ToString() ?? "-")));', why: "7 → slot 2; 12 → 2 is taken, so 3; 2 → 2 and 3 taken, so 4.", concepts: ["hash-table"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so a collision probes the next slot, wrapping round.", src: 'var slots = new string?[3];\nslots[2] = "x";\nint s = 2;\nwhile (slots[s] != null) s = @@;\nConsole.WriteLine(s);', out: "0", answer: "(s + 1) % 3", concepts: ["hash-table"] }
      ],
      bug: [
        { id: "b1", q: "Putting cat twice should update it, leaving 2 entries: it should print 2.", src: 'var chain = new List<(string Key, int Value)>();\nvoid Put(string k, int v) => chain.Add((k, v));\nPut("cat", 1); Put("dog", 2); Put("cat", 3);\nConsole.WriteLine(chain.Count);', out: "2", fixedText: "prints 2", why: "Put must look for the key first and replace its value: int i = chain.FindIndex(p => p.Key == k); if (i >= 0) chain[i] = (k, v); else chain.Add((k, v));", concepts: ["hash-table"] }
      ]
    },
    flashcards: [
      ["What does a hash function do?", "Turns a key into a number; % size makes it a slot index."],
      ["What is a collision?", "Two keys landing in the same slot."],
      ["What is chaining?", "Each slot holds a list of the pairs that hash there."],
      ["What is linear probing?", "On a collision, try the next slot (wrapping) until a free one."],
      ["What is the load factor?", "Items ÷ slots; past about 0.75 the table rehashes into a bigger array."],
      ["Average and worst-case lookup in a hash table?", "O(1) on average; O(n) if everything collides."]
    ],
    quiz: [
      { q: "Rehashing is needed after growing because…", opts: ["keys change", "slot = hash % size, and size changed", "the hash function changes", "collisions disappear"], ans: 1, why: "Every item's slot depends on the size." },
      { q: "Overriding Equals but not GetHashCode means…", opts: ["nothing", "equal keys may land in different slots and not be found", "a compile error", "faster lookups"], ans: 1, why: "Equal keys must hash equally." },
      { q: "With linear probing, a lookup stops when it finds the key or…", opts: ["slot 0", "an empty slot", "a collision", "the load factor"], ans: 1, why: "An empty slot means the key was never placed further along." }
    ]
  });
  K.add({ tasks: {
    "12.10-chain": { lesson: "12.10", title: "A chained table", tier: "core", minutes: 25, concepts: ["hash-table"],
      statement: ["Build a hash table with 7 slots and chaining (an array of lists; no Dictionary or HashSet). Hash a key by adding its character codes, then `% 7`.", "Read commands until the end: `put KEY VALUE` (a new key goes at the end of its chain; an existing key's value is replaced), `get KEY` (the value or `missing`) and `show` (one line per non-empty slot, `S: k=v, k=v`)."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "put cat 3\nput act 9\nput dog 4\nput cat 5\nget act\nget cow\nshow", out: "9\nmissing\n4: cat=5, act=9\n6: dog=4" }],
      hidden: [{ stdin: "show\nget x", out: "missing" }, { stdin: "put a 1\nput h 2\nput o 3\nget h\nshow", out: "2\n6: a=1, h=2, o=3" }],
      rules: [noUse(/Dictionary|HashSet|Lookup/, "Build the table yourself.", "own"), uses(/%\s*7|%\s*slots\.Length|%\s*size/, "Slot = hash % 7.", "mod")],
      hints: ["var slots = new List<(string Key, string Value)>[7]; for (int i = 0; i < 7; i++) slots[i] = new();", "int Slot(string k) { int h = 0; foreach (char c in k) h += c; return h % 7; }", "put: find the index in the chain; replace or Add. show: skip empty chains."],
      answer: 'var slots = new List<(string Key, string Value)>[7];\nfor (int i = 0; i < 7; i++) slots[i] = new();\nint Slot(string k) { int h = 0; foreach (char c in k) h += c; return h % 7; }\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    if (p[0] == "put")\n    {\n        var chain = slots[Slot(p[1])];\n        int i = chain.FindIndex(x => x.Key == p[1]);\n        if (i >= 0) chain[i] = (p[1], p[2]); else chain.Add((p[1], p[2]));\n    }\n    else if (p[0] == "get")\n    {\n        string? v = null;\n        foreach (var x in slots[Slot(p[1])]) if (x.Key == p[1]) v = x.Value;\n        Console.WriteLine(v ?? "missing");\n    }\n    else\n    {\n        for (int i = 0; i < 7; i++)\n            if (slots[i].Count > 0) Console.WriteLine($"{i}: {string.Join(", ", slots[i].Select(x => $"{x.Key}={x.Value}"))}");\n    }\n}' },
    "12.10-probe": { lesson: "12.10", title: "Linear probing", tier: "stretch", minutes: 25, concepts: ["hash-table"],
      statement: ["Read the table size N, then keys one per line until the end. Insert each into an open-addressing table of N slots with linear probing (hash = the sum of the character codes; slot = hash % N; on a collision step to the next slot, wrapping). A key already in the table is not added again.", "For each key print `KEY → slot S (P probes)`, `KEY already at S`, or `KEY: table full`. Finally print the load factor as `load F` with 2 decimals."],
      starter: 'int n = int.Parse(Console.ReadLine() ?? "1");\nvar slots = new string?[n];\n',
      examples: [{ stdin: "7\ncat\nact\ndog\ncat", out: "cat → slot 4 (1 probes)\nact → slot 5 (2 probes)\ndog → slot 6 (1 probes)\ncat already at 4\nload 0.43" }],
      hidden: [{ stdin: "2\na\nc\ne", out: "a → slot 1 (1 probes)\nc → slot 0 (2 probes)\ne: table full\nload 1.00" }, { stdin: "5", out: "load 0.00" }],
      rules: [noUse(/Dictionary|HashSet/, "Probe your own array.", "own"), uses(/%\s*n\b|%\s*slots\.Length/, "Wrap with % n.", "wrap")],
      hints: ["int h = 0; foreach (char c in key) h += c; int s = h % n;", "for (int probes = 1; probes <= n; probes++) { if (slots[s] == key) … already; if (slots[s] == null) { place; … } s = (s + 1) % n; }", "Count the keys placed for the load factor: (double)placed / n."],
      answer: 'int n = int.Parse(Console.ReadLine() ?? "1");\nvar slots = new string?[n];\nint placed = 0;\nstring? key;\nwhile ((key = Console.ReadLine()) is not null && key != "")\n{\n    int h = 0;\n    foreach (char c in key) h += c;\n    int s = h % n;\n    string verdict = $"{key}: table full";\n    for (int probes = 1; probes <= n; probes++)\n    {\n        if (slots[s] == key) { verdict = $"{key} already at {s}"; break; }\n        if (slots[s] == null) { slots[s] = key; placed++; verdict = $"{key} → slot {s} ({probes} probes)"; break; }\n        s = (s + 1) % n;\n    }\n    Console.WriteLine(verdict);\n}\nConsole.WriteLine($"load {(double)placed / n:F2}");' }
  } });

  /* ================================================================
     12.11 Binary search trees
     ================================================================ */
  lesson("12.11", {
    aqa: "4.2.5.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A sorted array searches in O(log n) but inserting keeps shifting items. A linked list inserts cheaply but searches in O(n).",
        "A **binary search tree** has both: each node has a left and a right child, everything in the left subtree is smaller and everything in the right is larger.",
        "Searching walks one path from the root, discarding half the tree at each step — like binary search, but the structure can grow."
      ] },
      page("Core idea"),
      run("bst", "insert, then search showing the path taken", 'var t = new Bst();\nforeach (int v in new[] { 50, 30, 70, 20, 40, 60, 80 }) t.Insert(v);\nforeach (int v in new[] { 60, 45 }) Console.WriteLine($"{v}: {t.Search(v)}");\n\nclass Bst\n{\n    private class Node { public int Value; public Node? Left, Right; public Node(int v) => Value = v; }\n    private Node? root;\n    public void Insert(int v) => root = Insert(root, v);\n    private static Node Insert(Node? n, int v)\n    {\n        if (n == null) return new Node(v);\n        if (v < n.Value) n.Left = Insert(n.Left, v);\n        else if (v > n.Value) n.Right = Insert(n.Right, v);\n        return n;\n    }\n    public string Search(int v)\n    {\n        var path = new List<int>();\n        for (var n = root; n != null; n = v < n.Value ? n.Left : n.Right)\n        {\n            path.Add(n.Value);\n            if (n.Value == v) return "found via " + string.Join(" → ", path);\n        }\n        return "missing after " + string.Join(" → ", path);\n    }\n}'),
      { ul: [
        "Insert walks down as a search would and hangs the new node where the walk falls off the tree.",
        "A duplicate is ignored here (a set); a multiset would send it one way consistently.",
        "The search path's length is the cost: about log₂ n for a **balanced** tree."
      ] },
      run("traverse", "the three depth-first orders", 'var t = new Tree();\nforeach (int v in new[] { 50, 30, 70, 20, 40, 60, 80 }) t.Insert(v);\nConsole.WriteLine("pre:  " + string.Join(" ", t.Pre()));\nConsole.WriteLine("in:   " + string.Join(" ", t.In()));\nConsole.WriteLine("post: " + string.Join(" ", t.Post()));\n\nclass Tree\n{\n    private record Node(int Value) { public Node? Left, Right; }\n    private Node? root;\n    public void Insert(int v) => root = Add(root, v);\n    private static Node Add(Node? n, int v)\n    {\n        if (n == null) return new Node(v);\n        if (v < n.Value) n.Left = Add(n.Left, v); else if (v > n.Value) n.Right = Add(n.Right, v);\n        return n;\n    }\n    public IEnumerable<int> Pre() => Pre(root);\n    public IEnumerable<int> In() => In(root);\n    public IEnumerable<int> Post() => Post(root);\n    private static IEnumerable<int> Pre(Node? n) { if (n == null) yield break; yield return n.Value; foreach (var x in Pre(n.Left)) yield return x; foreach (var x in Pre(n.Right)) yield return x; }\n    private static IEnumerable<int> In(Node? n) { if (n == null) yield break; foreach (var x in In(n.Left)) yield return x; yield return n.Value; foreach (var x in In(n.Right)) yield return x; }\n    private static IEnumerable<int> Post(Node? n) { if (n == null) yield break; foreach (var x in Post(n.Left)) yield return x; foreach (var x in Post(n.Right)) yield return x; yield return n.Value; }\n}'),
      page("Rules"),
      { table: { head: ["Traversal", "Order", "Used for"], rows: [["pre-order", "node, left, right", "copying a tree; prefix expressions"], ["in-order", "left, node, right", "a BST's values in sorted order"], ["post-order", "left, right, node", "deleting a tree; postfix (12.9) from an expression tree"], ["breadth-first", "level by level", "the tree drawn row by row (a queue, 12.12)"]] } },
      { ul: [
        "BST rule: left subtree < node < right subtree, at every node.",
        "Search, insert and delete cost the **height**: O(log n) when balanced, O(n) when the tree degenerates into a line (sorted input).",
        "Deleting a node with two children replaces its value with its **in-order successor** (the smallest in its right subtree), then deletes that.",
        "Self-balancing trees (red-black, AVL) keep the height O(log n); `SortedSet<T>` and `SortedDictionary<K, V>` are red-black trees."
      ] },
      page("Variations"),
      { h: "Height, and the degenerate tree" },
      run("height", "random-ish input stays shallow; sorted input makes a line", 'Console.WriteLine(Height(new[] { 50, 30, 70, 20, 40, 60, 80 }));\nConsole.WriteLine(Height(new[] { 10, 20, 30, 40, 50, 60, 70 }));\n\nstatic int Height(int[] values)\n{\n    var left = new Dictionary<int, int>(); var right = new Dictionary<int, int>();\n    int root = values[0], best = 1;\n    foreach (int v in values.Skip(1))\n    {\n        int n = root, depth = 1;\n        while (true)\n        {\n            depth++;\n            var side = v < n ? left : right;\n            if (!side.TryGetValue(n, out int next)) { side[n] = v; break; }\n            n = next;\n        }\n        best = Math.Max(best, depth);\n    }\n    return best;\n}'),
      { h: "Deleting with the in-order successor" },
      run("delete", "remove 30 (two children): 40 takes its place", 'Node? root = null;\nforeach (int v in new[] { 50, 30, 70, 20, 40, 35 }) root = Add(root, v);\nroot = Delete(root, 30);\nConsole.WriteLine(string.Join(" ", InOrder(root)));\nConsole.WriteLine(root!.Left!.Value);\n\nstatic Node Add(Node? n, int v) { if (n == null) return new Node(v); if (v < n.Value) n.Left = Add(n.Left, v); else if (v > n.Value) n.Right = Add(n.Right, v); return n; }\nstatic Node? Delete(Node? n, int v)\n{\n    if (n == null) return null;\n    if (v < n.Value) n.Left = Delete(n.Left, v);\n    else if (v > n.Value) n.Right = Delete(n.Right, v);\n    else\n    {\n        if (n.Left == null) return n.Right;\n        if (n.Right == null) return n.Left;\n        var s = n.Right;\n        while (s.Left != null) s = s.Left;\n        n.Value = s.Value;\n        n.Right = Delete(n.Right, s.Value);\n    }\n    return n;\n}\nstatic IEnumerable<int> InOrder(Node? n) { if (n == null) yield break; foreach (var x in InOrder(n.Left)) yield return x; yield return n.Value; foreach (var x in InOrder(n.Right)) yield return x; }\n\nclass Node { public int Value; public Node? Left, Right; public Node(int v) => Value = v; }'),
      { h: "The library's balanced tree" },
      run("sortedset", "SortedSet<T>: ordered, O(log n), with ranges", 'var s = new SortedSet<int> { 50, 30, 70, 20, 40, 60, 80 };\nConsole.WriteLine($"{s.Min} {s.Max}");\nConsole.WriteLine(string.Join(" ", s.GetViewBetween(35, 65)));'),
      page("Pitfalls"),
      { h: "The wrong type of value — CS1503" },
      run("pit-type", "an int tree takes ints", 'var t = new IntTree();\nt.Insert("forty");\n\nclass IntTree { public void Insert(int v) { } }'),
      { h: "Forgetting to hang the new node" },
      run("pit-lost", "Insert returns the new node, but the caller ignores it", 'Node root = new Node(50);\nInsert(root, 30);\nConsole.WriteLine(root.Left == null ? "30 was lost" : "30 is there");\n\nstatic Node Insert(Node? n, int v)\n{\n    if (n == null) return new Node(v);\n    if (v < n.Value) Insert(n.Left, v); else Insert(n.Right, v);\n    return n;\n}\n\nclass Node { public int Value; public Node? Left, Right; public Node(int v) => Value = v; }'),
      { h: "Sorted input" },
      "Inserting 1, 2, 3 … builds a line, not a tree: every search is O(n) again. Shuffle the input, or use a self-balancing tree (SortedSet).",
      page("Connections"),
      { ul: [ "**Back:** 12.3 binary search; 12.6 recursion; 12.7 nodes; 9.11 iterators (the traversals yield).", "**Next:** 12.12 a tree is a graph without cycles; T9 parsers build expression trees.", "**AQA:** 4.2.5.1 trees and binary trees; 4.3.2.1 pre-, in- and post-order traversal; 4.3.4.3 binary tree search." ] },
      page("Good practice"),
      { ul: [ "Write the recursive Insert as `n.Left = Insert(n.Left, v)` so the new node is always hung.", "Test with sorted, reverse and random input.", "In real code use SortedSet/SortedDictionary." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Three walks* and *Search paths*." ] },
      page("Quick reference"),
      run("qr", "insert and in-order in a few lines", 'Node? r = null;\nforeach (int v in new[] { 4, 2, 6, 1, 3 }) r = Add(r, v);\nvoid Walk(Node? n) { if (n == null) return; Walk(n.L); Console.Write(n.V + " "); Walk(n.R); }\nWalk(r);\nConsole.WriteLine();\n\nstatic Node Add(Node? n, int v) { if (n == null) return new Node { V = v }; if (v < n.V) n.L = Add(n.L, v); else n.R = Add(n.R, v); return n; }\nclass Node { public int V; public Node? L, R; }'),
      { ul: [ "left < node < right; search, insert, delete cost the height.", "Pre (N L R), in (L N R, sorted), post (L R N).", "Balanced O(log n); sorted input O(n)." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1503", "an argument of the wrong type", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Node? r = null;\nforeach (int v in new[] { 8, 3, 10, 1, 6 }) r = Add(r, v);\nvoid Pre(Node? n) { if (n == null) return; Console.Write(n.V + " "); Pre(n.L); Pre(n.R); }\nPre(r);\nConsole.WriteLine();\n\nstatic Node Add(Node? n, int v) { if (n == null) return new Node { V = v }; if (v < n.V) n.L = Add(n.L, v); else n.R = Add(n.R, v); return n; }\nclass Node { public int V; public Node? L, R; }', why: "Pre-order: 8, then the left subtree (3, 1, 6), then the right (10).", concepts: ["bst"] },
        { id: "p2", src: 'Node? r = null;\nforeach (int v in new[] { 5, 9, 2, 7 }) r = Add(r, v);\nint depth = 0;\nfor (var n = r; n != null; n = 7 < n.V ? n.L : n.R) { depth++; if (n.V == 7) break; }\nConsole.WriteLine(depth);\n\nstatic Node Add(Node? n, int v) { if (n == null) return new Node { V = v }; if (v < n.V) n.L = Add(n.L, v); else n.R = Add(n.R, v); return n; }\nclass Node { public int V; public Node? L, R; }', why: "5 → 9 → 7: found on the third node.", concepts: ["bst"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the walk is in-order (sorted).", src: 'Node? r = null;\nforeach (int v in new[] { 4, 2, 6 }) r = Add(r, v);\nvoid Walk(Node? n) { if (n == null) return; Walk(n.L); @@; Walk(n.R); }\nWalk(r);\nConsole.WriteLine();\n\nstatic Node Add(Node? n, int v) { if (n == null) return new Node { V = v }; if (v < n.V) n.L = Add(n.L, v); else n.R = Add(n.R, v); return n; }\nclass Node { public int V; public Node? L, R; }', out: "2 4 6", answer: "Console.Write(n.V + \" \")", concepts: ["bst"] }
      ],
      bug: [
        { id: "b1", q: "Inserting 50 then 30 should give the root a left child: it should print 30.", src: 'Node root = new Node(50);\nInsert(root, 30);\nConsole.WriteLine(root.Left?.Value.ToString() ?? "none");\n\nstatic Node Insert(Node? n, int v)\n{\n    if (n == null) return new Node(v);\n    if (v < n.Value) Insert(n.Left, v); else Insert(n.Right, v);\n    return n;\n}\n\nclass Node { public int Value; public Node? Left, Right; public Node(int v) => Value = v; }', out: "30", fixedText: "prints 30", why: "The returned node must be hung: n.Left = Insert(n.Left, v); (and the same on the right).", concepts: ["bst"] }
      ]
    },
    flashcards: [
      ["What is the BST rule?", "At every node: left subtree < node < right subtree."],
      ["Which traversal gives a BST in sorted order?", "In-order (left, node, right)."],
      ["Pre-order and post-order?", "Pre: node, left, right. Post: left, right, node."],
      ["What does a BST search cost?", "The tree's height: O(log n) balanced, O(n) degenerate."],
      ["What makes a BST degenerate?", "Inserting sorted data: it becomes a line."],
      ["How do you delete a node with two children?", "Copy in its in-order successor (smallest of the right subtree), then delete that node."]
    ],
    quiz: [
      { q: "Inserting 4, 2, 6, 1 into an empty BST: 1 is…", opts: ["the right child of 2", "the left child of 2", "the root", "the left child of 6"], ans: 1, why: "1 < 4 go left, 1 < 2 go left." },
      { q: "Post-order of the tree with root 2, children 1 and 3 is…", opts: ["2 1 3", "1 2 3", "1 3 2", "3 1 2"], ans: 2, why: "Left, right, node." },
      { q: "SortedSet<T> is implemented as…", opts: ["a hash table", "a sorted array", "a self-balancing binary tree", "a linked list"], ans: 2, why: "A red-black tree." }
    ]
  });
  K.add({ tasks: {
    "12.11-walks": { lesson: "12.11", title: "Three walks", tier: "core", minutes: 25, concepts: ["bst"],
      statement: ["Read whole numbers on one line and insert them in order into your own binary search tree (duplicates ignored; no SortedSet, Sort or OrderBy).", "Print `pre: …`, `in: …`, `post: …` and `height H` (an empty tree is height 0, one node 1)."],
      starter: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n',
      examples: [{ stdin: "50 30 70 20 40 60 80", out: "pre: 50 30 20 40 70 60 80\nin: 20 30 40 50 60 70 80\npost: 20 40 30 60 80 70 50\nheight 3" }],
      hidden: [{ stdin: "1 2 3 2", out: "pre: 1 2 3\nin: 1 2 3\npost: 3 2 1\nheight 3" }, { stdin: "", out: "pre:\nin:\npost:\nheight 0" }],
      rules: [noUse(/SortedSet|\.Sort\s*\(|OrderBy|\.Order\s*\(/, "Build the tree yourself.", "own"), uses(/class\s+\w*Node\b/, "Write a node class with Left and Right.", "node")],
      hints: ["static Node Add(Node? n, int v) { if (n == null) return new Node(v); if (v < n.Value) n.Left = Add(n.Left, v); else if (v > n.Value) n.Right = Add(n.Right, v); return n; }", "void Pre(Node? n, List<int> o) { if (n == null) return; o.Add(n.Value); Pre(n.Left, o); Pre(n.Right, o); }", "static int Height(Node? n) => n == null ? 0 : 1 + Math.Max(Height(n.Left), Height(n.Right));"],
      answer: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\nNode? root = null;\nforeach (int v in xs) root = Add(root, v);\nvar pre = new List<int>(); var ino = new List<int>(); var post = new List<int>();\nWalk(root, pre, ino, post);\nConsole.WriteLine(("pre: " + string.Join(" ", pre)).TrimEnd());\nConsole.WriteLine(("in: " + string.Join(" ", ino)).TrimEnd());\nConsole.WriteLine(("post: " + string.Join(" ", post)).TrimEnd());\nConsole.WriteLine($"height {Height(root)}");\n\nstatic Node Add(Node? n, int v)\n{\n    if (n == null) return new Node(v);\n    if (v < n.Value) n.Left = Add(n.Left, v);\n    else if (v > n.Value) n.Right = Add(n.Right, v);\n    return n;\n}\nstatic void Walk(Node? n, List<int> pre, List<int> ino, List<int> post)\n{\n    if (n == null) return;\n    pre.Add(n.Value);\n    Walk(n.Left, pre, ino, post);\n    ino.Add(n.Value);\n    Walk(n.Right, pre, ino, post);\n    post.Add(n.Value);\n}\nstatic int Height(Node? n) => n == null ? 0 : 1 + Math.Max(Height(n.Left), Height(n.Right));\n\nclass Node { public int Value; public Node? Left, Right; public Node(int v) => Value = v; }' },
    "12.11-paths": { lesson: "12.11", title: "Search paths", tier: "stretch", minutes: 20, concepts: ["bst"],
      statement: ["Read a line of whole numbers and build a BST from them in order (duplicates ignored). Then read search targets, one per line, until the end.", "For each print `T: 50 → 30 → 40 found` or `T: 50 → 30 → 40 missing` — the values visited from the root."],
      starter: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n',
      examples: [{ stdin: "50 30 70 20 40\n40\n45", out: "40: 50 → 30 → 40 found\n45: 50 → 30 → 40 missing" }],
      hidden: [{ stdin: "8\n8\n1", out: "8: 8 found\n1: 8 missing" }, { stdin: "5 1 9 7 8\n8\n6", out: "8: 5 → 9 → 7 → 8 found\n6: 5 → 9 → 7 missing" }],
      rules: [noUse(/SortedSet|Contains\s*\(|IndexOf/, "Walk the tree.", "own")],
      hints: ["Build with the recursive Add.", "var path = new List<int>(); for (var n = root; n != null; n = t < n.Value ? n.Left : n.Right) { path.Add(n.Value); if (n.Value == t) … }", "string.Join(\" → \", path)"],
      answer: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\nNode? root = null;\nforeach (int v in xs) root = Add(root, v);\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    int t = int.Parse(line);\n    var path = new List<int>();\n    bool found = false;\n    for (var n = root; n != null; n = t < n.Value ? n.Left : n.Right)\n    {\n        path.Add(n.Value);\n        if (n.Value == t) { found = true; break; }\n    }\n    Console.WriteLine($"{t}: {string.Join(" → ", path)} {(found ? "found" : "missing")}");\n}\n\nstatic Node Add(Node? n, int v)\n{\n    if (n == null) return new Node(v);\n    if (v < n.Value) n.Left = Add(n.Left, v);\n    else if (v > n.Value) n.Right = Add(n.Right, v);\n    return n;\n}\n\nclass Node { public int Value; public Node? Left, Right; public Node(int v) => Value = v; }' }
  } });

  /* ================================================================
     12.12 Graphs and traversal
     ================================================================ */
  lesson("12.12", {
    aqa: "4.2.4.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Stations and rail links, people and friendships, web pages and links, rooms and doors: things and the connections between them.",
        "A **graph** is **vertices** (nodes) joined by **edges**. Edges may have a direction (one-way streets) and a **weight** (a distance).",
        "Two ways to explore one: **breadth-first** (everything one step away, then two steps…) and **depth-first** (follow one path as far as it goes, then back up)."
      ] },
      page("Core idea"),
      run("list", "an adjacency list: each vertex keeps its neighbours", 'var g = new Dictionary<string, List<string>>();\nvoid Link(string a, string b)\n{\n    if (!g.ContainsKey(a)) g[a] = new();\n    if (!g.ContainsKey(b)) g[b] = new();\n    g[a].Add(b);\n    g[b].Add(a);\n}\nforeach (var (a, b) in new[] { ("A", "B"), ("A", "C"), ("B", "D"), ("C", "D"), ("D", "E") }) Link(a, b);\nforeach (var v in g.Keys.Order()) Console.WriteLine($"{v}: {string.Join(" ", g[v])}");'),
      run("bfs", "breadth-first search with a queue: the order, and edges from the start", 'var g = new Dictionary<string, string[]>\n{\n    ["A"] = new[] { "B", "C" }, ["B"] = new[] { "A", "D" }, ["C"] = new[] { "A", "D" },\n    ["D"] = new[] { "B", "C", "E" }, ["E"] = new[] { "D" }\n};\nvar dist = new Dictionary<string, int> { ["A"] = 0 };\nvar queue = new Queue<string>();\nqueue.Enqueue("A");\nwhile (queue.Count > 0)\n{\n    var v = queue.Dequeue();\n    Console.Write($"{v}({dist[v]}) ");\n    foreach (var w in g[v])\n        if (!dist.ContainsKey(w)) { dist[w] = dist[v] + 1; queue.Enqueue(w); }\n}\nConsole.WriteLine();'),
      { ul: [
        "Mark a vertex **visited when it is enqueued** (here: given a distance), so it is never queued twice.",
        "BFS visits in order of distance, so on an unweighted graph it finds the **fewest-edges** path.",
        "Every vertex and edge is handled once: O(V + E)."
      ] },
      page("Rules"),
      { table: { head: ["", "Adjacency matrix", "Adjacency list"], rows: [["Stores", "a V × V grid of 0/1 (or weights)", "each vertex's list of neighbours"], ["Memory", "O(V²)", "O(V + E)"], ["Is there an edge a–b?", "O(1)", "O(degree of a)"], ["List a's neighbours", "O(V)", "O(degree of a)"], ["Best for", "dense graphs", "sparse graphs (most real ones)"]] } },
      { ul: [
        "**Undirected**: store each edge both ways. **Directed**: one way only.",
        "**BFS** uses a **queue**; **DFS** uses a **stack** (or recursion, which is the call stack, 12.6).",
        "Keep a **visited** set: graphs, unlike trees, have **cycles**, and without it a search goes round them for ever.",
        "DFS uses: finding whether a path exists, cycles, connected components, mazes. BFS uses: fewest steps, levels, the nearest of something.",
        "A **tree** is a connected graph with no cycles."
      ] },
      page("Variations"),
      { h: "The same graph as a matrix" },
      run("matrix", "row i, column j is 1 when i and j are joined", 'string[] names = { "A", "B", "C", "D", "E" };\nint[,] m = new int[5, 5];\nforeach (var (a, b) in new[] { (0, 1), (0, 2), (1, 3), (2, 3), (3, 4) }) { m[a, b] = 1; m[b, a] = 1; }\nConsole.WriteLine("  " + string.Join(" ", names));\nfor (int i = 0; i < 5; i++)\n{\n    Console.Write(names[i] + " ");\n    for (int j = 0; j < 5; j++) Console.Write(m[i, j] + " ");\n    Console.WriteLine();\n}'),
      { h: "Depth-first, recursively" },
      run("dfs", "go deep first; back up when stuck", 'var g = new Dictionary<string, string[]>\n{\n    ["A"] = new[] { "B", "C" }, ["B"] = new[] { "A", "D" }, ["C"] = new[] { "A", "D" },\n    ["D"] = new[] { "B", "C", "E" }, ["E"] = new[] { "D" }\n};\nvar seen = new HashSet<string>();\nvoid Dfs(string v)\n{\n    seen.Add(v);\n    Console.Write(v + " ");\n    foreach (var w in g[v]) if (!seen.Contains(w)) Dfs(w);\n}\nDfs("A");\nConsole.WriteLine();'),
      { h: "The fewest-edges path, rebuilt from parents" },
      run("path", "BFS records where each vertex was reached from", 'var g = new Dictionary<string, string[]>\n{\n    ["A"] = new[] { "B", "C" }, ["B"] = new[] { "A", "D" }, ["C"] = new[] { "A", "D" },\n    ["D"] = new[] { "B", "C", "E" }, ["E"] = new[] { "D" }\n};\nvar parent = new Dictionary<string, string?> { ["A"] = null };\nvar q = new Queue<string>(new[] { "A" });\nwhile (q.Count > 0)\n{\n    var v = q.Dequeue();\n    foreach (var w in g[v]) if (!parent.ContainsKey(w)) { parent[w] = v; q.Enqueue(w); }\n}\nvar path = new List<string>();\nfor (string? v = "E"; v != null; v = parent[v]) path.Add(v);\npath.Reverse();\nConsole.WriteLine(string.Join(" → ", path));'),
      page("Pitfalls"),
      { h: "The wrong type of neighbour — CS1503" },
      run("pit-type", "the lists hold names, not numbers", 'var g = new Dictionary<string, List<string>> { ["A"] = new() };\ng["A"].Add(3);'),
      { h: "Marking visited too late" },
      run("pit-late", "marking on dequeue lets a vertex be queued twice", 'var g = new Dictionary<string, string[]> { ["A"] = new[] { "B", "C" }, ["B"] = new[] { "D" }, ["C"] = new[] { "D" }, ["D"] = new string[0] };\nvar seen = new HashSet<string>();\nvar q = new Queue<string>(new[] { "A" });\nint dequeued = 0;\nwhile (q.Count > 0)\n{\n    var v = q.Dequeue();\n    dequeued++;\n    seen.Add(v);\n    foreach (var w in g[v]) if (!seen.Contains(w)) q.Enqueue(w);\n}\nConsole.WriteLine($"{dequeued} dequeues for 4 vertices");'),
      { h: "One-way by accident" },
      "Adding only `g[a].Add(b)` for an undirected link makes b unable to reach a. Searches from b then miss half the graph.",
      page("Connections"),
      { ul: [ "**Back:** 12.8 queues and stacks; 12.11 a tree is a graph; 4.x Dictionary and HashSet.", "**Next:** 12.13 weighted edges and Dijkstra; 12.14 a route planner.", "**AQA:** 4.2.4.1 graphs (vertices, edges, directed, weighted, matrix vs list); 4.3.1.1 breadth- and depth-first traversal and their uses." ] },
      page("Good practice"),
      { ul: [ "Adjacency lists unless the graph is dense or you need O(1) edge tests.", "Always keep a visited set.", "Sort neighbours if you need a repeatable visiting order." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Breadth-first* and *Count the islands*." ] },
      page("Quick reference"),
      run("qr", "BFS in a dozen lines", 'var g = new Dictionary<int, int[]> { [1] = new[] { 2, 3 }, [2] = new[] { 4 }, [3] = new[] { 4 }, [4] = new int[0] };\nvar seen = new HashSet<int> { 1 };\nvar q = new Queue<int>(new[] { 1 });\nwhile (q.Count > 0)\n{\n    int v = q.Dequeue();\n    Console.Write(v + " ");\n    foreach (int w in g[v]) if (seen.Add(w)) q.Enqueue(w);\n}\nConsole.WriteLine();'),
      { ul: [ "Vertices + edges; list O(V + E) memory, matrix O(V²).", "BFS = queue (fewest edges); DFS = stack/recursion.", "Visited set, marked when queued." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1503", "an argument of the wrong type", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var g = new Dictionary<char, string> { [\'A\'] = "BC", [\'B\'] = "D", [\'C\'] = "DE", [\'D\'] = "", [\'E\'] = "" };\nvar seen = new HashSet<char> { \'A\' };\nvar q = new Queue<char>(new[] { \'A\' });\nstring order = "";\nwhile (q.Count > 0) { char v = q.Dequeue(); order += v; foreach (char w in g[v]) if (seen.Add(w)) q.Enqueue(w); }\nConsole.WriteLine(order);', why: "Breadth-first: A, then its neighbours B and C, then D (from B) and E (from C).", concepts: ["graphs"] },
        { id: "p2", src: 'var g = new Dictionary<char, string> { [\'A\'] = "BC", [\'B\'] = "D", [\'C\'] = "DE", [\'D\'] = "", [\'E\'] = "" };\nvar seen = new HashSet<char>();\nstring order = "";\nvoid Dfs(char v) { seen.Add(v); order += v; foreach (char w in g[v]) if (!seen.Contains(w)) Dfs(w); }\nDfs(\'A\');\nConsole.WriteLine(order);', why: "Depth-first: A, B, all the way to D, back up to C, then E.", concepts: ["graphs"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the collection breadth-first search waits in.", src: 'var g = new Dictionary<int, int[]> { [1] = new[] { 2 }, [2] = new[] { 3 }, [3] = new int[0] };\nvar seen = new HashSet<int> { 1 };\nvar q = new @@<int>();\nq.Enqueue(1);\nint n = 0;\nwhile (q.Count > 0) { int v = q.Dequeue(); n++; foreach (int w in g[v]) if (seen.Add(w)) q.Enqueue(w); }\nConsole.WriteLine(n);', out: "3", answer: "Queue", concepts: ["graphs"] }
      ],
      bug: [
        { id: "b1", q: "The link A–B is two-way: a search from B should reach A, printing BA.", src: 'var g = new Dictionary<char, List<char>> { [\'A\'] = new(), [\'B\'] = new() };\ng[\'A\'].Add(\'B\');\nvar seen = new HashSet<char> { \'B\' };\nvar q = new Queue<char>(new[] { \'B\' });\nstring order = "";\nwhile (q.Count > 0) { char v = q.Dequeue(); order += v; foreach (char w in g[v]) if (seen.Add(w)) q.Enqueue(w); }\nConsole.WriteLine(order);', out: "BA", fixedText: "prints BA", why: "An undirected edge is stored both ways: g['B'].Add('A') as well.", concepts: ["graphs"] }
      ]
    },
    flashcards: [
      ["What is a graph?", "Vertices joined by edges, which may be directed and weighted."],
      ["Adjacency list or matrix for a sparse graph?", "A list: O(V + E) memory."],
      ["BFS uses which structure?", "A queue."],
      ["DFS uses which structure?", "A stack (or recursion)."],
      ["Why keep a visited set?", "Graphs have cycles; without it a search loops."],
      ["What does BFS find on an unweighted graph?", "The fewest-edges path from the start to every vertex."]
    ],
    quiz: [
      { q: "An undirected graph with 5 vertices and 4 edges as an adjacency matrix has how many 1s?", opts: ["4", "8", "5", "25"], ans: 1, why: "Each edge is stored both ways." },
      { q: "To find the nearest exit in a maze, use…", opts: ["DFS", "BFS", "binary search", "a hash table"], ans: 1, why: "BFS explores by distance." },
      { q: "BFS's time on V vertices and E edges is…", opts: ["O(V²)", "O(V + E)", "O(E log V)", "O(V log V)"], ans: 1, why: "Each vertex and edge once." }
    ]
  });
  K.add({ tasks: {
    "12.12-bfs": { lesson: "12.12", title: "Breadth-first", tier: "core", minutes: 25, concepts: ["graphs"],
      statement: ["Read undirected edges `A B`, one per line, until a blank line; then a start vertex.", "Breadth-first from the start, taking each vertex's neighbours in alphabetical order (ordinal), print each vertex reached as `V D` (its edges from the start), in visiting order. Vertices never reached are left out; a start with no edges prints just `S 0`."],
      starter: 'var g = new Dictionary<string, List<string>>();\n',
      examples: [{ stdin: "A B\nA C\nB D\nC D\nD E\n\nA", out: "A 0\nB 1\nC 1\nD 2\nE 3" }],
      hidden: [{ stdin: "X Y\nP Q\n\nP", out: "P 0\nQ 1" }, { stdin: "C B\nC A\nA D\n\nC", out: "C 0\nA 1\nB 1\nD 2" }, { stdin: "A B\n\nZ", out: "Z 0" }],
      rules: [uses(/Queue</, "Search with a Queue.")],
      hints: ["Read edges until the line is empty; add each both ways.", "var dist = new Dictionary<string, int> { [start] = 0 }; var q = new Queue<string>(); q.Enqueue(start);", "foreach (var w in g.GetValueOrDefault(v, new()).OrderBy(x => x, StringComparer.Ordinal)) if (!dist.ContainsKey(w)) { dist[w] = dist[v] + 1; q.Enqueue(w); }"],
      answer: 'var g = new Dictionary<string, List<string>>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    foreach (var (a, b) in new[] { (p[0], p[1]), (p[1], p[0]) })\n    {\n        if (!g.ContainsKey(a)) g[a] = new();\n        g[a].Add(b);\n    }\n}\nstring start = Console.ReadLine() ?? "";\nvar dist = new Dictionary<string, int> { [start] = 0 };\nvar q = new Queue<string>();\nq.Enqueue(start);\nwhile (q.Count > 0)\n{\n    var v = q.Dequeue();\n    Console.WriteLine($"{v} {dist[v]}");\n    foreach (var w in g.GetValueOrDefault(v, new()).OrderBy(x => x, StringComparer.Ordinal))\n        if (!dist.ContainsKey(w)) { dist[w] = dist[v] + 1; q.Enqueue(w); }\n}' },
    "12.12-islands": { lesson: "12.12", title: "Count the islands", tier: "stretch", minutes: 25, concepts: ["graphs"],
      statement: ["Read a grid of `#` (land) and `.` (sea), one row per line, until the end. Land cells joined up, down, left or right form one island.", "With a breadth- or depth-first search from each unvisited land cell, print `islands N, largest L` (L in cells; 0 when there is none)."],
      starter: 'var rows = new List<string>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "") rows.Add(line);\n',
      examples: [{ stdin: "##..#\n#...#\n..#..\n.....", out: "islands 3, largest 3" }],
      hidden: [{ stdin: ".....\n.....", out: "islands 0, largest 0" }, { stdin: "#.#\n.#.\n#.#", out: "islands 5, largest 1" }, { stdin: "###\n#.#\n###", out: "islands 1, largest 8" }],
      rules: [uses(/Queue<|Stack<|void\s+\w+\s*\(/, "Search each island with a queue, a stack or recursion.")],
      hints: ["var seen = new bool[h, w];", "For each land cell not seen: islands++; BFS from it, counting cells; largest = Math.Max(largest, size).", "Neighbours: (r+1,c), (r-1,c), (r,c+1), (r,c-1), inside the grid, land, not seen."],
      answer: 'var rows = new List<string>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "") rows.Add(line);\nint h = rows.Count, w = h == 0 ? 0 : rows[0].Length, islands = 0, largest = 0;\nvar seen = new bool[h, w];\nfor (int r = 0; r < h; r++)\n    for (int c = 0; c < w; c++)\n    {\n        if (rows[r][c] != \'#\' || seen[r, c]) continue;\n        islands++;\n        int size = 0;\n        var q = new Queue<(int, int)>();\n        q.Enqueue((r, c));\n        seen[r, c] = true;\n        while (q.Count > 0)\n        {\n            var (y, x) = q.Dequeue();\n            size++;\n            foreach (var (dy, dx) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })\n            {\n                int ny = y + dy, nx = x + dx;\n                if (ny < 0 || nx < 0 || ny >= h || nx >= w || rows[ny][nx] != \'#\' || seen[ny, nx]) continue;\n                seen[ny, nx] = true;\n                q.Enqueue((ny, nx));\n            }\n        }\n        largest = Math.Max(largest, size);\n    }\nConsole.WriteLine($"islands {islands}, largest {largest}");' }
  } });

  /* ================================================================
     12.13 Shortest paths: Dijkstra and A*
     ================================================================ */
  lesson("12.13", {
    aqa: "4.3.6.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "BFS finds the fewest **edges**. On a map, edges have **weights** — minutes, miles, pounds — and the fewest edges can be the slowest route.",
        "**Dijkstra's algorithm** settles vertices in order of distance from the start, always taking the closest unsettled one next — from a **priority queue**.",
        "**A\\*** adds a guess of the distance still to go (a **heuristic**), so on a map it heads towards the goal instead of spreading in every direction."
      ] },
      page("Core idea"),
      run("dijkstra", "Dijkstra from A: the shortest distance to every vertex", 'var g = new Dictionary<string, List<(string To, int W)>>();\nvoid Link(string a, string b, int w)\n{\n    foreach (var (x, y) in new[] { (a, b), (b, a) }) { if (!g.ContainsKey(x)) g[x] = new(); g[x].Add((y, w)); }\n}\nLink("A", "B", 4); Link("A", "C", 2); Link("C", "B", 1); Link("B", "D", 5); Link("C", "D", 8); Link("D", "E", 3);\nvar dist = new Dictionary<string, int> { ["A"] = 0 };\nvar pq = new PriorityQueue<string, int>();\npq.Enqueue("A", 0);\nwhile (pq.TryDequeue(out var v, out int d))\n{\n    if (d > dist[v]) continue;\n    foreach (var (w, cost) in g[v])\n    {\n        int nd = d + cost;\n        if (!dist.TryGetValue(w, out int old) || nd < old) { dist[w] = nd; pq.Enqueue(w, nd); }\n    }\n}\nforeach (var v in dist.Keys.Order()) Console.WriteLine($"{v} {dist[v]}");'),
      { ul: [
        "The priority queue always gives the vertex with the **smallest known distance**; once taken, that distance is final (**settled**).",
        "**Relaxing** an edge: if going through v is shorter than what w had, update w and enqueue it again.",
        "`if (d > dist[v]) continue;` skips an out-of-date queue entry — the vertex was already reached more cheaply.",
        "A → B costs 4 directly but 3 through C: Dijkstra finds it."
      ] },
      page("Rules"),
      { ol: [
        "Every vertex's distance is ∞ except the start's, which is 0.",
        "Take the unsettled vertex with the smallest distance; it is now settled.",
        "For each of its edges, if distance + weight is smaller than the neighbour's distance, record it (and the vertex it came from).",
        "Repeat until the queue is empty (or, for one target, until the target is settled)."
      ] },
      { ul: [
        "With a binary-heap priority queue it costs O((V + E) log V).",
        "Weights must be **non-negative**: Dijkstra settles a vertex for good, and a negative edge could later make it cheaper (Bellman–Ford handles negatives).",
        "**A\\*** orders the queue by distance so far **+ a heuristic** h(v) to the goal. If h never overestimates (it is **admissible**) — like straight-line or Manhattan distance on a grid — A* still finds the shortest path, usually settling far fewer vertices.",
        "With h = 0, A* is exactly Dijkstra."
      ] },
      page("Variations"),
      { h: "The route, not just the distance" },
      run("route", "record each vertex's previous vertex, then walk back from the target", 'var g = new Dictionary<string, (string To, int W)[]>\n{\n    ["A"] = new[] { ("B", 4), ("C", 2) }, ["B"] = new[] { ("A", 4), ("C", 1), ("D", 5) },\n    ["C"] = new[] { ("A", 2), ("B", 1), ("D", 8) }, ["D"] = new[] { ("B", 5), ("C", 8) }\n};\nvar dist = new Dictionary<string, int> { ["A"] = 0 };\nvar prev = new Dictionary<string, string>();\nvar pq = new PriorityQueue<string, int>();\npq.Enqueue("A", 0);\nwhile (pq.TryDequeue(out var v, out int d))\n{\n    if (d > dist[v]) continue;\n    foreach (var (w, c) in g[v])\n        if (!dist.TryGetValue(w, out int old) || d + c < old) { dist[w] = d + c; prev[w] = v; pq.Enqueue(w, d + c); }\n}\nvar path = new List<string> { "D" };\nwhile (prev.TryGetValue(path[^1], out var p)) path.Add(p);\npath.Reverse();\nConsole.WriteLine($"{string.Join(" → ", path)} ({dist["D"]})");'),
      { h: "A* on a grid" },
      run("astar", "the same shortest length, far fewer cells settled", 'string[] grid = { "S.........", "..........", "..........", "..........", ".........E" };\nConsole.WriteLine($"Dijkstra: {Search(grid, false)}");\nConsole.WriteLine($"A*:       {Search(grid, true)}");\n\nstatic string Search(string[] grid, bool guided)\n{\n    int h = grid.Length, w = grid[0].Length;\n    (int, int) start = (0, 0), goal = (h - 1, w - 1);\n    var dist = new Dictionary<(int, int), int> { [start] = 0 };\n    var pq = new PriorityQueue<(int, int), int>();\n    pq.Enqueue(start, 0);\n    int settled = 0;\n    while (pq.TryDequeue(out var cell, out int pr))\n    {\n        int d = dist[cell];\n        if (pr > d + (guided ? Guess(cell) : 0)) continue;\n        settled++;\n        if (cell == goal) return $"length {d}, settled {settled}";\n        var (r, c) = cell;\n        foreach (var (nr, nc) in new[] { (r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1) })\n        {\n            if (nr < 0 || nc < 0 || nr >= h || nc >= w || grid[nr][nc] == \'#\') continue;\n            if (!dist.TryGetValue((nr, nc), out int old) || d + 1 < old)\n            {\n                dist[(nr, nc)] = d + 1;\n                pq.Enqueue((nr, nc), d + 1 + (guided ? Guess((nr, nc)) : 0));\n            }\n        }\n    }\n    return "no path";\n    int Guess((int R, int C) p) => Math.Abs(goal.Item1 - p.R) + Math.Abs(goal.Item2 - p.C);\n}'),
      { h: "Why not negative weights" },
      run("negative", "Dijkstra settles B at 2 before it sees the −5 edge", 'var edges = new Dictionary<char, (char To, int W)[]> { [\'A\'] = new[] { (\'B\', 2), (\'C\', 4) }, [\'C\'] = new[] { (\'B\', -5) }, [\'B\'] = new (char, int)[0] };\nvar dist = new Dictionary<char, int> { [\'A\'] = 0 };\nvar done = new HashSet<char>();\nvar pq = new PriorityQueue<char, int>();\npq.Enqueue(\'A\', 0);\nwhile (pq.TryDequeue(out char v, out int d))\n{\n    if (!done.Add(v)) continue;\n    foreach (var (w, c) in edges[v])\n        if (!done.Contains(w) && (!dist.TryGetValue(w, out int old) || d + c < old)) { dist[w] = d + c; pq.Enqueue(w, d + c); }\n}\nConsole.WriteLine($"Dijkstra says B is {dist[\'B\']}; the true shortest is 4 − 5 = −1");'),
      page("Pitfalls"),
      { h: "Enqueue without a priority — CS7036" },
      run("pit-priority", "a PriorityQueue needs the element and its priority", 'var pq = new PriorityQueue<string, int>();\npq.Enqueue("A");'),
      { h: "Not skipping stale entries" },
      "Without `if (d > dist[v]) continue;` an out-of-date entry is processed again. The answer is still right (relaxing cannot make things worse) but the work multiplies on large graphs.",
      { h: "An overestimating heuristic" },
      "A heuristic that guesses MORE than the real remaining distance can make A* stop at a longer path. On a grid with 4-way moves, Manhattan distance is safe; on a road map, straight-line distance is.",
      page("Connections"),
      { ul: [ "**Back:** 12.8 priority queues; 12.12 graphs and BFS (Dijkstra with every weight 1).", "**Next:** 12.14 a route planner; D3 goes further (Bellman–Ford, minimum spanning trees); T8 games path-find with A*.", "**AQA:** 4.3.6.1 Dijkstra's shortest path algorithm — trace it on a graph; know it cannot handle negative weights." ] },
      page("Good practice"),
      { ul: [ "Use `PriorityQueue<TElement, TPriority>` and the stale-entry skip.", "Store `prev` as you relax, so the route comes free.", "On a map with coordinates, add an admissible heuristic: A*." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Shortest route* and *A* through a maze*." ] },
      page("Quick reference"),
      run("qr", "relax one edge", 'var dist = new Dictionary<string, int> { ["A"] = 0, ["B"] = 9 };\nint d = 3, w = 4;\nif (d + w < dist["B"]) dist["B"] = d + w;\nConsole.WriteLine(dist["B"]);'),
      { ul: [ "Take the closest unsettled; relax its edges; repeat.", "PriorityQueue + skip stale; O((V + E) log V).", "No negative weights; A* adds an admissible h." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS7036", "Enqueue needs a priority", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var g = new Dictionary<char, (char, int)[]> { [\'A\'] = new[] { (\'B\', 7), (\'C\', 3) }, [\'C\'] = new[] { (\'B\', 2) }, [\'B\'] = new (char, int)[0] };\nvar dist = new Dictionary<char, int> { [\'A\'] = 0 };\nvar pq = new PriorityQueue<char, int>();\npq.Enqueue(\'A\', 0);\nwhile (pq.TryDequeue(out char v, out int d))\n{\n    if (d > dist[v]) continue;\n    foreach (var (w, c) in g[v]) if (!dist.TryGetValue(w, out int o) || d + c < o) { dist[w] = d + c; pq.Enqueue(w, d + c); }\n}\nConsole.WriteLine(dist[\'B\']);', why: "Directly 7; via C, 3 + 2 = 5.", concepts: ["shortest-path"] },
        { id: "p2", src: 'var pq = new PriorityQueue<string, int>();\npq.Enqueue("far", 9); pq.Enqueue("near", 1); pq.Enqueue("mid", 4);\nConsole.WriteLine(pq.Dequeue() + " " + pq.Dequeue());', why: "Smallest priority first: near (1), then mid (4).", concepts: ["shortest-path"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so an out-of-date queue entry is skipped.", src: 'var dist = new Dictionary<string, int> { ["B"] = 3 };\nvar pq = new PriorityQueue<string, int>();\npq.Enqueue("B", 7); pq.Enqueue("B", 3);\nint used = 0;\nwhile (pq.TryDequeue(out var v, out int d)) { if (@@) continue; used++; }\nConsole.WriteLine(used);', out: "1", answer: "d > dist[v]", concepts: ["shortest-path"] }
      ],
      bug: [
        { id: "b1", q: "Relaxing should keep the SHORTER distance: B should end as 5.", src: 'var dist = new Dictionary<string, int> { ["B"] = 5 };\nint d = 4, w = 6;\nif (d + w > dist["B"]) dist["B"] = d + w;\nConsole.WriteLine(dist["B"]);', out: "5", fixedText: "prints 5", why: "Update only when the new route is shorter: if (d + w < dist[\"B\"]).", concepts: ["shortest-path"] }
      ]
    },
    flashcards: [
      ["What does Dijkstra's algorithm find?", "The shortest (least total weight) path from a start to every vertex, with non-negative weights."],
      ["Which vertex does Dijkstra take next?", "The unsettled one with the smallest known distance (a priority queue)."],
      ["What is relaxing an edge?", "If dist[v] + w < dist[u], set dist[u] = dist[v] + w (and prev[u] = v)."],
      ["Why can't Dijkstra handle negative weights?", "It settles a vertex for good; a later negative edge could make it cheaper."],
      ["What does A* add to Dijkstra?", "A heuristic estimate of the distance left, added to the priority."],
      ["What is an admissible heuristic?", "One that never overestimates the true remaining distance."]
    ],
    quiz: [
      { q: "Edges A–B 4, A–C 1, C–B 2. The shortest A to B is…", opts: ["4", "3", "6", "1"], ans: 1, why: "Through C: 1 + 2." },
      { q: "Dijkstra with a binary heap runs in…", opts: ["O(V²E)", "O((V + E) log V)", "O(V + E)", "O(2ⱽ)"], ans: 1, why: "Each edge may enqueue once, each queue operation O(log V)." },
      { q: "A* with h(v) = 0 for every v is…", opts: ["BFS", "DFS", "Dijkstra", "wrong"], ans: 2, why: "No guidance: plain Dijkstra." }
    ]
  });
  K.add({ tasks: {
    "12.13-route": { lesson: "12.13", title: "Shortest route", tier: "core", minutes: 30, concepts: ["shortest-path"],
      statement: ["Read undirected weighted edges `A B W` until a blank line, then queries `FROM TO` until the end.", "With Dijkstra (a PriorityQueue) print `FROM → … → TO (D)` for the shortest route, or `no route from FROM to TO`. (The test graphs have one shortest route each.)"],
      starter: 'var g = new Dictionary<string, List<(string To, int W)>>();\n',
      examples: [{ stdin: "A B 4\nA C 2\nC B 1\nB D 5\nC D 8\nD E 3\n\nA E\nE C", out: "A → C → B → D → E (11)\nE → D → B → C (9)" }],
      hidden: [{ stdin: "A B 1\nC D 1\n\nA D\nC D", out: "no route from A to D\nC → D (1)" }, { stdin: "P Q 10\nP R 3\nR Q 4\n\nQ P", out: "Q → R → P (7)" }],
      rules: [uses(/PriorityQueue</, "Use a PriorityQueue.")],
      hints: ["Add each edge both ways.", "Dijkstra from FROM, recording prev[w] = v when relaxing.", "Walk prev back from TO, reverse, and join with \" → \"; if TO was never reached: no route."],
      answer: 'var g = new Dictionary<string, List<(string To, int W)>>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    int w = int.Parse(p[2]);\n    foreach (var (a, b) in new[] { (p[0], p[1]), (p[1], p[0]) })\n    {\n        if (!g.ContainsKey(a)) g[a] = new();\n        g[a].Add((b, w));\n    }\n}\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] q = line.Split(\' \');\n    string from = q[0], to = q[1];\n    var dist = new Dictionary<string, int> { [from] = 0 };\n    var prev = new Dictionary<string, string>();\n    var pq = new PriorityQueue<string, int>();\n    pq.Enqueue(from, 0);\n    while (pq.TryDequeue(out var v, out int d))\n    {\n        if (d > dist[v]) continue;\n        foreach (var (u, c) in g.GetValueOrDefault(v, new()))\n            if (!dist.TryGetValue(u, out int old) || d + c < old) { dist[u] = d + c; prev[u] = v; pq.Enqueue(u, d + c); }\n    }\n    if (!dist.ContainsKey(to)) { Console.WriteLine($"no route from {from} to {to}"); continue; }\n    var path = new List<string> { to };\n    while (prev.TryGetValue(path[^1], out var pv)) path.Add(pv);\n    path.Reverse();\n    Console.WriteLine($"{string.Join(" → ", path)} ({dist[to]})");\n}' },
    "12.13-maze": { lesson: "12.13", title: "A* through a maze", tier: "stretch", minutes: 30, concepts: ["shortest-path"],
      statement: ["Read a maze, one row per line, until the end: `#` wall, `.` floor, one `S` and one `E`. Moves are up, down, left, right; each costs 1.", "With A* (a PriorityQueue ordered by steps so far + the Manhattan distance to E), print `shortest S` — the number of moves from S to E — or `no path`."],
      starter: 'var rows = new List<string>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "") rows.Add(line);\n',
      examples: [{ stdin: "S.#.....\n..#.##.#\n.......E", out: "shortest 9" }],
      hidden: [{ stdin: "S#E", out: "no path" }, { stdin: "SE", out: "shortest 1" }, { stdin: "S...\n###.\nE...", out: "shortest 8" }],
      rules: [uses(/PriorityQueue</, "Use a PriorityQueue."), uses(/Math\.Abs/, "Guide it with the Manhattan distance (Math.Abs).", "h")],
      hints: ["Find S and E; int H((int r, int c) p) => Math.Abs(p.r - er) + Math.Abs(p.c - ec);", "Enqueue neighbours with priority d + 1 + H(n); keep dist like Dijkstra and skip stale entries.", "Stop when E is dequeued: its dist is the answer."],
      answer: 'var rows = new List<string>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "") rows.Add(line);\n(int, int) s = (0, 0), e = (0, 0);\nfor (int r = 0; r < rows.Count; r++)\n    for (int c = 0; c < rows[r].Length; c++)\n    {\n        if (rows[r][c] == \'S\') s = (r, c);\n        if (rows[r][c] == \'E\') e = (r, c);\n    }\nint H((int R, int C) p) => Math.Abs(p.R - e.Item1) + Math.Abs(p.C - e.Item2);\nvar dist = new Dictionary<(int, int), int> { [s] = 0 };\nvar pq = new PriorityQueue<(int, int), int>();\npq.Enqueue(s, H(s));\nstring answer = "no path";\nwhile (pq.TryDequeue(out var cell, out int pr))\n{\n    int d = dist[cell];\n    if (pr > d + H(cell)) continue;\n    if (cell == e) { answer = $"shortest {d}"; break; }\n    var (r, c) = cell;\n    foreach (var n in new[] { (r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1) })\n    {\n        var (nr, nc) = n;\n        if (nr < 0 || nc < 0 || nr >= rows.Count || nc >= rows[nr].Length || rows[nr][nc] == \'#\') continue;\n        if (!dist.TryGetValue(n, out int old) || d + 1 < old) { dist[n] = d + 1; pq.Enqueue(n, d + 1 + H(n)); }\n    }\n}\nConsole.WriteLine(answer);' }
  } });

  /* ================================================================
     12.14 Practise: a route planner
     ================================================================ */
  lesson("12.14", {
    aqa: "4.3.6.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A small train network: stations, links with minutes between them, and questions like \"quickest from Ash to Elm?\" and \"fewest stops?\"",
        "It pulls the unit together: **parse** the network from text, store it as a **graph**, answer with **Dijkstra** (quickest) and **BFS** (fewest stops), and print a readable journey.",
        "Built in five steps, each a listing you can run."
      ] },
      page("Core idea"),
      { h: "Step 1 · the network from text" },
      run("parse", "each line is one link: A-B minutes", 'string[] lines = { "Ash-Birch 5", "Birch-Cedar 7", "Ash-Dove 4", "Dove-Cedar 2", "Cedar-Elm 6", "Dove-Elm 12" };\nvar net = new Network();\nforeach (var l in lines) net.Add(l);\nforeach (var s in net.Stations) Console.WriteLine($"{s}: {string.Join(", ", net.Links(s).Select(x => $"{x.To} {x.Min}"))}");\n\nclass Network\n{\n    private readonly SortedDictionary<string, List<(string To, int Min)>> links = new(StringComparer.Ordinal);\n    public IEnumerable<string> Stations => links.Keys;\n    public IReadOnlyList<(string To, int Min)> Links(string s) => links.TryGetValue(s, out var l) ? l : new();\n    public void Add(string line)\n    {\n        var (pair, mins) = (line.Split(\' \')[0], int.Parse(line.Split(\' \')[1]));\n        var ends = pair.Split(\'-\');\n        Link(ends[0], ends[1], mins);\n        Link(ends[1], ends[0], mins);\n    }\n    private void Link(string a, string b, int m)\n    {\n        if (!links.ContainsKey(a)) links[a] = new();\n        links[a].Add((b, m));\n    }\n}'),
      { h: "Step 2 · the quickest journey" },
      run("quickest", "Dijkstra with the route kept", 'var g = Build(new[] { "Ash-Birch 5", "Birch-Cedar 7", "Ash-Dove 4", "Dove-Cedar 2", "Cedar-Elm 6", "Dove-Elm 12" });\nvar (path, mins) = Quickest(g, "Ash", "Elm");\nConsole.WriteLine($"{string.Join(" → ", path)}: {mins} min");\n\nstatic Dictionary<string, List<(string, int)>> Build(string[] lines)\n{\n    var g = new Dictionary<string, List<(string, int)>>();\n    foreach (var l in lines)\n    {\n        var p = l.Split(\' \', \'-\');\n        int m = int.Parse(p[2]);\n        foreach (var (a, b) in new[] { (p[0], p[1]), (p[1], p[0]) }) { if (!g.ContainsKey(a)) g[a] = new(); g[a].Add((b, m)); }\n    }\n    return g;\n}\n\nstatic (List<string> Path, int Mins) Quickest(Dictionary<string, List<(string, int)>> g, string from, string to)\n{\n    var dist = new Dictionary<string, int> { [from] = 0 };\n    var prev = new Dictionary<string, string>();\n    var pq = new PriorityQueue<string, int>();\n    pq.Enqueue(from, 0);\n    while (pq.TryDequeue(out var v, out int d))\n    {\n        if (d > dist[v]) continue;\n        foreach (var (w, c) in g[v])\n            if (!dist.TryGetValue(w, out int o) || d + c < o) { dist[w] = d + c; prev[w] = v; pq.Enqueue(w, d + c); }\n    }\n    var path = new List<string> { to };\n    while (prev.TryGetValue(path[^1], out var p)) path.Add(p);\n    path.Reverse();\n    return (path, dist[to]);\n}'),
      page("Rules"),
      { ul: [
        "**Parse at the edge**: text becomes a graph once; nothing after it reads text.",
        "**One structure, two questions**: Dijkstra for the least minutes, BFS for the fewest stops — they can disagree.",
        "**Keep `prev`**: a route is the answer people want, not just a number.",
        "**Say when there is no answer**: an unknown station or a disconnected network is a message, not a crash.",
        "**Deterministic output**: sort what you print (stations, ties) so the same input always gives the same text."
      ] },
      { table: { head: ["Question", "Algorithm", "Lesson"], rows: [["least total minutes", "Dijkstra", "12.13"], ["fewest stops", "BFS", "12.12"], ["is it connected?", "BFS or DFS from one station", "12.12"], ["stations in order", "SortedDictionary (a balanced tree)", "12.11"]] } },
      page("Variations"),
      { h: "Step 3 · fewest stops" },
      run("fewest", "BFS can pick a different route from Dijkstra", 'var g = new Dictionary<string, string[]>\n{\n    ["Ash"] = new[] { "Birch", "Dove" }, ["Birch"] = new[] { "Ash", "Cedar" }, ["Cedar"] = new[] { "Birch", "Dove", "Elm" },\n    ["Dove"] = new[] { "Ash", "Cedar", "Elm" }, ["Elm"] = new[] { "Cedar", "Dove" }\n};\nvar prev = new Dictionary<string, string?> { ["Ash"] = null };\nvar q = new Queue<string>(new[] { "Ash" });\nwhile (q.Count > 0) { var v = q.Dequeue(); foreach (var w in g[v]) if (prev.TryAdd(w, v)) q.Enqueue(w); }\nvar path = new List<string>();\nfor (string? v = "Elm"; v != null; v = prev[v]) path.Add(v);\npath.Reverse();\nConsole.WriteLine($"{string.Join(" → ", path)}: {path.Count - 1} stops");'),
      { h: "Step 4 · a journey as legs" },
      run("legs", "turn a path into lines with the minutes of each leg", 'var mins = new Dictionary<(string, string), int> { [("Ash", "Dove")] = 4, [("Dove", "Cedar")] = 2, [("Cedar", "Elm")] = 6 };\nstring[] path = { "Ash", "Dove", "Cedar", "Elm" };\nint total = 0;\nfor (int i = 0; i + 1 < path.Length; i++)\n{\n    int m = mins[(path[i], path[i + 1])];\n    total += m;\n    Console.WriteLine($"{path[i],-6} → {path[i + 1],-6} {m,3} min");\n}\nConsole.WriteLine($"{"total",-15} {total,3} min");'),
      { h: "Step 5 · is everything connected?" },
      run("connected", "one search from any station must reach them all", 'var links = new[] { ("Ash", "Birch"), ("Birch", "Cedar"), ("Fir", "Gum") };\nvar g = new Dictionary<string, List<string>>();\nforeach (var (a, b) in links) foreach (var (x, y) in new[] { (a, b), (b, a) }) { if (!g.ContainsKey(x)) g[x] = new(); g[x].Add(y); }\nvar seen = new HashSet<string> { "Ash" };\nvar st = new Stack<string>(new[] { "Ash" });\nwhile (st.Count > 0) foreach (var w in g[st.Pop()]) if (seen.Add(w)) st.Push(w);\nvar cut = g.Keys.Where(k => !seen.Contains(k)).Order(StringComparer.Ordinal);\nConsole.WriteLine(seen.Count == g.Count ? "connected" : "cut off: " + string.Join(", ", cut));'),
      page("Pitfalls"),
      { h: "Deconstructing the wrong number of parts — CS8132" },
      run("pit-tuple", "three values cannot go into two variables", 'var (from, to) = ("Ash", "Elm", 6);'),
      { h: "An unknown station" },
      run("pit-unknown", "g[\"Zed\"] throws; check first", 'var g = new Dictionary<string, List<string>> { ["Ash"] = new() };\nConsole.WriteLine(g.ContainsKey("Zed") ? "known" : "no station called Zed");\nConsole.WriteLine(g["Zed"].Count);'),
      { h: "A one-way network by accident" },
      "Reading `Ash-Birch 5` and adding only Ash → Birch makes every return journey impossible. Add both directions for a two-way link.",
      page("Connections"),
      { ul: [ "**Back:** the whole unit — 12.11's sorted dictionary, 12.12's BFS, 12.13's Dijkstra; 9.12's report pipeline.", "**Next:** capstone 4 builds a service with tests; T1 stores the network in a database; T8 path-finds in a game.", "**AQA:** 4.3.6.1 Dijkstra in context; NEA projects often model a network exactly like this." ] },
      page("Good practice"),
      { ul: [ "Keep the graph-building, the searching and the printing in separate methods.", "Test with a disconnected network and an unknown station.", "Print routes in a fixed order so outputs can be compared." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *The journey planner* and *Quickest or fewest*." ] },
      page("Quick reference"),
      run("qr", "parse one link both ways", 'var g = new Dictionary<string, List<(string, int)>>();\nvar p = "Ash-Birch 5".Split(\' \', \'-\');\nforeach (var (a, b) in new[] { (p[0], p[1]), (p[1], p[0]) }) { if (!g.ContainsKey(a)) g[a] = new(); g[a].Add((b, int.Parse(p[2]))); }\nConsole.WriteLine($"{g.Count} stations, {g["Birch"][0]}");'),
      { ul: [ "Parse → graph → Dijkstra/BFS → route → text.", "Undirected links both ways; prev for the route.", "Unknown or unreachable: say so." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS8132", "a tuple deconstructed into the wrong number of variables", "Pitfalls"], ["KeyNotFoundException", "a station the graph does not have", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var p = "Ash-Birch 5".Split(\' \', \'-\');\nConsole.WriteLine($"{p.Length} {p[1]} {int.Parse(p[2]) * 2}");', why: "Splitting on space AND dash gives Ash, Birch, 5.", concepts: ["route-planner"] },
        { id: "p2", src: 'string[] path = { "A", "B", "C", "D" };\nConsole.WriteLine($"{path.Length - 1} legs, {path.Length - 2} stops between");', why: "Four stations: three legs, two stations in between.", concepts: ["route-planner"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the path built backwards reads from the start.", src: 'var path = new List<string> { "Elm", "Cedar", "Ash" };\npath.@@;\nConsole.WriteLine(string.Join(" → ", path));', out: "Ash → Cedar → Elm", answer: "Reverse()", concepts: ["route-planner"] }
      ],
      bug: [
        { id: "b1", q: "Links are two-way: Birch should be able to reach Ash, printing 1.", src: 'var g = new Dictionary<string, List<string>>();\nforeach (var l in new[] { "Ash-Birch" })\n{\n    var p = l.Split(\'-\');\n    if (!g.ContainsKey(p[0])) g[p[0]] = new();\n    g[p[0]].Add(p[1]);\n}\nConsole.WriteLine(g.GetValueOrDefault("Birch")?.Count ?? 0);', out: "1", fixedText: "prints 1", why: "Only Ash → Birch was added; add Birch → Ash too.", concepts: ["route-planner"] }
      ]
    },
    flashcards: [
      ["Which algorithm finds the quickest route by minutes?", "Dijkstra (weighted)."],
      ["Which finds the fewest stops?", "Breadth-first search (unweighted)."],
      ["How do you get the route, not just its length?", "Record prev[w] = v when relaxing; walk back from the target and reverse."],
      ["How do you test whether a network is connected?", "Search from one station; every station must be reached."],
      ["Why sort output in a planner?", "So the same input always prints the same text (deterministic)."],
      ["Where does parsing belong?", "At the edge: turn text into the graph once, then work with the graph."]
    ],
    quiz: [
      { q: "A route of 5 stations has how many legs?", opts: ["5", "4", "6", "3"], ans: 1, why: "One fewer than the stations." },
      { q: "Quickest and fewest-stops routes…", opts: ["are always the same", "can differ", "never differ on a map", "need a hash table"], ans: 1, why: "Fewer, longer legs can take more minutes." },
      { q: "A station that cannot be reached shows up in Dijkstra as…", opts: ["distance 0", "no recorded distance (∞)", "a negative distance", "an exception always"], ans: 1, why: "It is never relaxed." }
    ]
  });
  K.add({ tasks: {
    "12.14-planner": { lesson: "12.14", title: "The journey planner", tier: "core", minutes: 35, concepts: ["route-planner", "shortest-path"],
      statement: ["Read two-way links `Ash-Birch 5` (minutes) until a blank line, then journeys `FROM TO` until the end.", "For each journey print the quickest route's legs as `FROM → TO M min`, one per line, then `total T min` — or `no station called X` (the first unknown one) or `no route from FROM to TO`. (Each test journey has one quickest route.)"],
      starter: 'var g = new Dictionary<string, List<(string To, int Min)>>();\n',
      examples: [{ stdin: "Ash-Birch 5\nBirch-Cedar 7\nAsh-Dove 4\nDove-Cedar 2\nCedar-Elm 6\nDove-Elm 13\n\nAsh Elm", out: "Ash → Dove 4 min\nDove → Cedar 2 min\nCedar → Elm 6 min\ntotal 12 min" }],
      hidden: [{ stdin: "Ash-Birch 5\nFir-Gum 2\n\nAsh Gum\nAsh Zed\nGum Fir", out: "no route from Ash to Gum\nno station called Zed\nGum → Fir 2 min\ntotal 2 min" }],
      rules: [uses(/PriorityQueue</, "Find the quickest with Dijkstra (a PriorityQueue).")],
      hints: ["Parse with line.Split(' ', '-'); add both directions.", "Dijkstra with prev; walk back from TO to get the path.", "For each leg, find its minutes in g[path[i]] (the link to path[i + 1])."],
      answer: 'var g = new Dictionary<string, List<(string To, int Min)>>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var p = line.Split(\' \', \'-\');\n    int m = int.Parse(p[2]);\n    foreach (var (a, b) in new[] { (p[0], p[1]), (p[1], p[0]) })\n    {\n        if (!g.ContainsKey(a)) g[a] = new();\n        g[a].Add((b, m));\n    }\n}\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var q = line.Split(\' \');\n    string from = q[0], to = q[1];\n    string? unknown = new[] { from, to }.FirstOrDefault(s => !g.ContainsKey(s));\n    if (unknown != null) { Console.WriteLine($"no station called {unknown}"); continue; }\n    var dist = new Dictionary<string, int> { [from] = 0 };\n    var prev = new Dictionary<string, string>();\n    var pq = new PriorityQueue<string, int>();\n    pq.Enqueue(from, 0);\n    while (pq.TryDequeue(out var v, out int d))\n    {\n        if (d > dist[v]) continue;\n        foreach (var (w, c) in g[v])\n            if (!dist.TryGetValue(w, out int o) || d + c < o) { dist[w] = d + c; prev[w] = v; pq.Enqueue(w, d + c); }\n    }\n    if (!dist.ContainsKey(to)) { Console.WriteLine($"no route from {from} to {to}"); continue; }\n    var path = new List<string> { to };\n    while (prev.TryGetValue(path[^1], out var pv)) path.Add(pv);\n    path.Reverse();\n    for (int i = 0; i + 1 < path.Count; i++)\n        Console.WriteLine($"{path[i]} → {path[i + 1]} {g[path[i]].First(x => x.To == path[i + 1]).Min} min");\n    Console.WriteLine($"total {dist[to]} min");\n}' },
    "12.14-compare": { lesson: "12.14", title: "Quickest or fewest", tier: "stretch", minutes: 35, concepts: ["route-planner", "graphs", "shortest-path"],
      statement: ["Read two-way links `Ash-Birch 5` until a blank line, then journeys `FROM TO` until the end (every station given exists and is reachable).", "Print `quickest: A → … → B (M min, S stops)` with Dijkstra, then `fewest: A → … → B (M min, S stops)` with BFS (neighbours taken in alphabetical order, ordinal; the first route found wins). Stops count the legs."],
      starter: 'var g = new Dictionary<string, List<(string To, int Min)>>();\n',
      examples: [{ stdin: "Ash-Birch 5\nBirch-Cedar 7\nAsh-Dove 4\nDove-Cedar 2\nCedar-Elm 6\nDove-Elm 13\n\nAsh Elm", out: "quickest: Ash → Dove → Cedar → Elm (12 min, 3 stops)\nfewest: Ash → Dove → Elm (17 min, 2 stops)" }],
      hidden: [{ stdin: "A-B 1\nB-C 1\nA-C 5\n\nA C\nC A", out: "quickest: A → B → C (2 min, 2 stops)\nfewest: A → C (5 min, 1 stops)\nquickest: C → B → A (2 min, 2 stops)\nfewest: C → A (5 min, 1 stops)" }],
      rules: [uses(/PriorityQueue</, "Quickest with Dijkstra (a PriorityQueue)."), uses(/Queue</, "Fewest with BFS (a Queue).", "bfs")],
      hints: ["Write two methods that each return the path as a List<string>.", "BFS: foreach (var (w, _) in g[v].OrderBy(x => x.To, StringComparer.Ordinal)) if (prev.TryAdd(w, v)) q.Enqueue(w);", "Minutes of a path: sum each leg's link minutes."],
      answer: 'var g = new Dictionary<string, List<(string To, int Min)>>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var p = line.Split(\' \', \'-\');\n    int m = int.Parse(p[2]);\n    foreach (var (a, b) in new[] { (p[0], p[1]), (p[1], p[0]) })\n    {\n        if (!g.ContainsKey(a)) g[a] = new();\n        g[a].Add((b, m));\n    }\n}\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var q = line.Split(\' \');\n    Console.WriteLine("quickest: " + Show(Quickest(g, q[0], q[1]), g));\n    Console.WriteLine("fewest: " + Show(Fewest(g, q[0], q[1]), g));\n}\n\nstatic string Show(List<string> path, Dictionary<string, List<(string To, int Min)>> g)\n{\n    int mins = 0;\n    for (int i = 0; i + 1 < path.Count; i++) mins += g[path[i]].First(x => x.To == path[i + 1]).Min;\n    return $"{string.Join(" → ", path)} ({mins} min, {path.Count - 1} stops)";\n}\n\nstatic List<string> Back(Dictionary<string, string> prev, string to)\n{\n    var path = new List<string> { to };\n    while (prev.TryGetValue(path[^1], out var p)) path.Add(p);\n    path.Reverse();\n    return path;\n}\n\nstatic List<string> Quickest(Dictionary<string, List<(string To, int Min)>> g, string from, string to)\n{\n    var dist = new Dictionary<string, int> { [from] = 0 };\n    var prev = new Dictionary<string, string>();\n    var pq = new PriorityQueue<string, int>();\n    pq.Enqueue(from, 0);\n    while (pq.TryDequeue(out var v, out int d))\n    {\n        if (d > dist[v]) continue;\n        foreach (var (w, c) in g[v])\n            if (!dist.TryGetValue(w, out int o) || d + c < o) { dist[w] = d + c; prev[w] = v; pq.Enqueue(w, d + c); }\n    }\n    return Back(prev, to);\n}\n\nstatic List<string> Fewest(Dictionary<string, List<(string To, int Min)>> g, string from, string to)\n{\n    var prev = new Dictionary<string, string>();\n    var seen = new HashSet<string> { from };\n    var q = new Queue<string>();\n    q.Enqueue(from);\n    while (q.Count > 0)\n    {\n        var v = q.Dequeue();\n        if (v == to) break;\n        foreach (var (w, _) in g[v].OrderBy(x => x.To, StringComparer.Ordinal))\n            if (seen.Add(w)) { prev[w] = v; q.Enqueue(w); }\n    }\n    return Back(prev, to);\n}' }
  } });

  /* ================================================================
     retrieval cards (skill cards) for unit 12
     ================================================================ */
  K.add({ cards: {
    "u12-bigo": { title: "Count the steps", lesson: "12.1", concepts: ["big-o"], kind: "predict",
      vary: function (r, n) {
        var k = 4 + r(9);
        var srcs = [
          "int n = " + k + ", c = 0;\nfor (int i = 0; i < n; i++)\n    for (int j = i + 1; j < n; j++) c++;\nConsole.WriteLine(c);",
          "int c = 0;\nfor (int m = " + (k * 9) + "; m > 1; m /= 2) c++;\nConsole.WriteLine(c);",
          "int n = " + k + ", c = 0;\nfor (int i = 0; i < n; i++) c++;\nfor (int i = 0; i < n; i++)\n    for (int j = 0; j < 3; j++) c++;\nConsole.WriteLine(c);"
        ];
        return { prompt: "What does this print?", label: ["every pair once", "halving", "loops in sequence"][n % 3], params: [], src: srcs[n % 3],
          hint: "Nested loops multiply, sequential loops add, halving counts the times you can divide by 2." };
      } },
    "u12-bits": { title: "Bitwise operators", lesson: "12.2", concepts: ["bitwise", "bitmasks"], kind: "predict",
      vary: function (r) {
        var a = 1 + r(31), b = 1 + r(31), k = r(3);
        return { prompt: "What does this print?", label: "& | ^ and a shift", params: [],
          src: "int a = " + a + ", b = " + b + ";\nConsole.WriteLine($\"{a & b} {a | b} {a ^ b} {a << " + (k + 1) + "}\");",
          hint: "Write both in binary: & keeps the shared 1s, | all 1s, ^ the 1s that differ; << k multiplies by 2ᵏ." };
      } },
    "u12-search": { title: "Binary search looks", lesson: "12.3", concepts: ["binary-search"], kind: "predict",
      vary: function (r) {
        var xs = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
        var t = r(2) ? xs[r(xs.length)] : 1 + r(95);
        return { prompt: "What does this print?", label: "middles examined", params: [],
          src: "int[] xs = { " + xs.join(", ") + " };\nint lo = 0, hi = xs.Length - 1, looks = 0, at = -1;\nwhile (lo <= hi)\n{\n    int mid = lo + (hi - lo) / 2;\n    looks++;\n    if (xs[mid] == " + t + ") { at = mid; break; }\n    if (xs[mid] < " + t + ") lo = mid + 1; else hi = mid - 1;\n}\nConsole.WriteLine($\"{at} {looks}\");",
          hint: "mid = lo + (hi - lo) / 2; move past mid each time; count every middle examined." };
      } },
    "u12-rpn": { title: "Evaluate postfix", lesson: "12.9", concepts: ["rpn"], kind: "predict",
      vary: function (r, n) {
        var a = 2 + r(8), b = 2 + r(8), c = 1 + r(5);
        var exprs = [a + " " + b + " + " + c + " *", a + " " + b + " " + c + " * +", a + " " + b + " * " + c + " -", a + " " + c + " - " + b + " *"];
        return { prompt: "What does this print?", label: "a postfix expression", params: [],
          src: "var st = new Stack<int>();\nforeach (var t in \"" + exprs[n % 4] + "\".Split(' '))\n{\n    if (int.TryParse(t, out int x)) { st.Push(x); continue; }\n    int b = st.Pop(), a = st.Pop();\n    st.Push(t == \"+\" ? a + b : t == \"-\" ? a - b : a * b);\n}\nConsole.WriteLine(st.Pop());",
          hint: "Numbers push; an operator pops the right operand first, then the left." };
      } },
    "u12-bst": { title: "Walk a tree", lesson: "12.11", concepts: ["bst"], kind: "predict",
      vary: function (r, n) {
        var pool = [50, 30, 70, 20, 40, 60, 80, 35, 65, 10];
        var vals = [pool[r(3)]];
        while (vals.length < 6) { var v = pool[r(pool.length)]; if (vals.indexOf(v) < 0) vals.push(v); }
        var order = ["pre", "in", "post"][n % 3];
        var body = order === "pre" ? "Console.Write(n.V + \" \"); Walk(n.L); Walk(n.R);" : order === "in" ? "Walk(n.L); Console.Write(n.V + \" \"); Walk(n.R);" : "Walk(n.L); Walk(n.R); Console.Write(n.V + \" \");";
        return { prompt: "What does this print?", label: order + "-order of a BST", params: [],
          src: "Node? root = null;\nforeach (int v in new[] { " + vals.join(", ") + " }) root = Add(root, v);\nvoid Walk(Node? n) { if (n == null) return; " + body + " }\nWalk(root);\nConsole.WriteLine();\n\nstatic Node Add(Node? n, int v) { if (n == null) return new Node { V = v }; if (v < n.V) n.L = Add(n.L, v); else n.R = Add(n.R, v); return n; }\nclass Node { public int V; public Node? L, R; }",
          hint: "Draw the tree first (smaller left, larger right), then walk it: pre N L R, in L N R, post L R N." };
      } },
    "u12-sort": { title: "Write a sort", lesson: "12.4", concepts: ["simple-sorts"], kind: "write",
      vary: function (r, n) {
        var desc = n % 2 === 1, algo = ["insertion", "bubble"][Math.floor(n / 2) % 2];
        var mk = function () { var xs = []; for (var i = 0; i < 6; i++) xs.push(r(60) - 10); return xs; };
        var sets = [mk(), mk(), [3, 3, 1]];
        var f = function (xs) { return xs.slice().sort(function (a, b) { return desc ? b - a : a - b; }).join(" "); };
        return { prompt: "Read whole numbers on one line and sort them " + (desc ? "largest first" : "smallest first") + " with your own " + algo + " sort (no Sort, Order or OrderBy). Print them separated by spaces.",
          label: algo + " sort, " + (desc ? "descending" : "ascending"), params: [algo, desc ? "desc" : "asc"],
          starter: "int[] a = (Console.ReadLine() ?? \"\").Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n",
          cases: sets.map(function (xs) { return { stdin: xs.join(" "), out: f(xs) }; }),
          rules: [{ id: "own", test: function (src) { return !/\.Sort\s*\(|\.Order\s*\(|OrderBy/.test(src) && /for\s*\(/.test(src); }, msg: "Sort with your own loops." }],
          hint: algo === "insertion" ? "for i from 1: take a[i], slide larger (or smaller, for descending) items right, drop it in." : "Repeat passes swapping neighbours that are out of order until a pass makes no swap.",
          answer: "int[] a = (Console.ReadLine() ?? \"\").Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n" +
            (algo === "insertion"
              ? "for (int i = 1; i < a.Length; i++)\n{\n    int x = a[i], j = i - 1;\n    while (j >= 0 && a[j] " + (desc ? "<" : ">") + " x) { a[j + 1] = a[j]; j--; }\n    a[j + 1] = x;\n}\n"
              : "for (int pass = 1; pass < a.Length; pass++)\n{\n    bool swapped = false;\n    for (int i = 0; i < a.Length - pass; i++)\n        if (a[i] " + (desc ? "<" : ">") + " a[i + 1]) { (a[i], a[i + 1]) = (a[i + 1], a[i]); swapped = true; }\n    if (!swapped) break;\n}\n") +
            "Console.WriteLine(string.Join(\" \", a));" };
      } }
  } });
})();
