/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.12.2.1
   (functional language programs: higher-order functions, map, filter and
   reduce/fold) and 4.12.3.1 (list processing: head, tail, empty lists,
   length, prepend, append, recursion over lists) at full A-level depth.
   Each topic REPLACES the short entry the retired cs-advanced.js carried; every way AQA
   has examined it (7517/2 June 2017–2023) is explained, worked and answered
   in the mark scheme's own format. Every result was checked with Python
   mirrors of the Haskell, and the C# LINQ versions were compiled and run
   with .NET 10. Past-paper banks stay in bank-cs-410-413.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function cell(x, y, w, v, col) {
  return [{ poly: [[x, y], [x + w, y], [x + w, y + 30], [x, y + 30]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.4 }, txt(x + w / 2, y + 15, v, { b: true, size: 12, c: "text" })];
}
function row(x, y, vals, col, w) { var it = []; vals.forEach(function (v, i) { it = it.concat(cell(x + i * (w || 44), y, w || 44, v, col)); }); return it; }
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: o.c || "accent2", w: o.w || 1.6 }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2", pos: o.pos || "c" }));
  return it;
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "\"Calculate the results\" tables: one mark per row. Lists must keep their square brackets (**R.** no brackets; **R.** each element in its own list); **A.** another bracket style; **I.** assigning the result to a name.",
  "Higher-order: **A.** parameter / input for argument · **NE.** \"a function that uses another function\" · **R.** a description of map or fold only.",
  "Recursion descriptions: name the base case, the head/tail split and the recursive call on the TAIL."
] } };

/* =====================================================================
   4.12.2.1  Functional language programs
   ===================================================================== */
C["compsci:4.12.2.1"] = {
  notes: [
    { h: "Functional language programs — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.12.2.1)", body: ["Experience of constructing simple programs in a functional language.", "**Higher-order functions**.", "Using **map**, **filter** and **reduce or fold**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Calculate the results of map / filter / fold calls", "Calculate", "1–4", "A-level 2017 Q06.2, 2020 Q11.4, 2022 Q12.3"],
      ["Explain what a higher-order function is", "Explain", "1–2", "A-level 2017 Q06.3, 2020 Q11.3"],
      ["How many / which functions use a higher-order function", "Shade", "1", "A-level 2018 Q15.1, 2022 Q12.1"],
      ["Function results and meaning in context", "Calculate / Explain", "3 + 1", "A-level 2018 Q15.2–15.3 — worked in 4.12.1.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Higher-order functions**.", "**map**.", "**filter**.", "**fold / reduce**, left and right.", "**Pipelines**: combining them.", "**The same in C# and Python**.", "**Reading an unfamiliar program**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Higher-order functions" },
    { callout: { t: "def", h: "Higher-order function", body: "A function that **takes a function as an argument**, or **returns a function as its result**, or both. Possible because functions are first-class objects (4.12.1.2)." } },
    { table: { head: ["Function", "Type (Haskell)", "Higher-order because…"], rows: [
      ["map", "(a → b) → [a] → [b]", "its first argument is a function"],
      ["filter", "(a → Bool) → [a] → [a]", "its first argument is a predicate function"],
      ["fold", "(b → a → b) → b → [a] → b", "its first argument is the combining function"],
      ["add (curried)", "ℤ → (ℤ → ℤ)", "it returns a function"]
    ] } },
    { callout: { t: "warn", h: "\"Uses another function\" is not enough", body: "Every function that calls another \"uses\" it. Higher-order means a function is passed **in** as an argument or handed **back** as the result — NE. otherwise." } },

    { page: "map" },
    { callout: { t: "def", h: "map", body: "Applies a given function to **each element** of a list, returning a **list of the results** — same length, same order." } },
    { fig: (function () {
      var it = row(200, 20, ["1", "3", "5"], "accent", 54).concat(row(200, 110, ["1", "9", "25"], "good", 54));
      [0, 1, 2].forEach(function (i) { it = it.concat(arrow(227 + i * 54, 52, 227 + i * 54, 108, null, { c: "accent2", w: 1.4 })); });
      it.push(txt(185, 35, "a = [1, 3, 5]", { size: 11, pos: "w", off: 0 }), txt(185, 125, "[1, 9, 25]", { size: 11, c: "good", pos: "w", off: 0 }));
      it.push(txt(370, 80, "square applied to EACH element", { size: 10.5, c: "accent2", pos: "e", off: 0 }));
      return { w: 600, h: 150, items: it, cap: "map square [1, 3, 5]: square is applied to every element; the list keeps its length and order." };
    })() },
    { code: { lang: "text", src: "map f []     = []\nmap f (x:xs) = f x : map f xs     -- apply f to the head, map the tail", cap: "map defined by recursion over the list." } },

    { page: "filter" },
    { callout: { t: "def", h: "filter", body: "Processes a list in order to produce a **new list** containing **exactly those elements** that match a given condition (a function returning Boolean — a predicate)." } },
    { table: { head: ["Element of b", "1", "5", "10", "15"], rows: [["< 10 ?", "True", "True", "False", "False"], ["kept?", "✔", "✔", "✘", "✘"]] } },
    { callout: { t: "info", h: "Key idea", body: "filter (< 10) [1, 5, 10, 15] = **[1, 5]**. The predicate (< 10) is itself a partially applied operator." } },
    { code: { lang: "text", src: "filter p []     = []\nfilter p (x:xs)\n  | p x       = x : filter p xs     -- keep the head\n  | otherwise = filter p xs         -- drop it", cap: "filter keeps order and never changes the elements it keeps." } },

    { page: "fold / reduce" },
    { callout: { t: "def", h: "fold (reduce)", body: "Reduces a list of values to a **single value** by repeatedly applying a **combining function**, starting from a **base (initial) value**. fold (+) 0 sums; fold (*) 1 multiplies." } },
    { table: { head: ["Step", "fold (+) 0 [9, 7, 2]", "fold (*) 1 [2, 3, 2]"], rows: [
      ["start", "accumulator = 0", "accumulator = 1"],
      ["1st element", "0 + 9 = 9", "1 × 2 = 2"],
      ["2nd element", "9 + 7 = 16", "2 × 3 = 6"],
      ["3rd element", "16 + 2 = **18**", "6 × 2 = **12**"]
    ] } },
    { table: { head: [" ", "foldl (from the left)", "foldr (from the right)"], rows: [
      ["Shape", "((b ⊕ x₁) ⊕ x₂) ⊕ x₃", "x₁ ⊕ (x₂ ⊕ (x₃ ⊕ b))"],
      ["foldl (-) 10 [1,2,3]", "((10 − 1) − 2) − 3 = **4**", "—"],
      ["foldr (-) 0 [1,2,3]", "—", "1 − (2 − (3 − 0)) = **2**"],
      ["Same answer when…", "the operation is associative, like + and ×", "same"]
    ] } },
    { callout: { t: "miscon", h: "The base value is not decoration", body: "It is the answer for an empty list and the start of the accumulation. Use 0 for +, 1 for × — fold (*) 0 would always give 0." } },

    { page: "Pipelines" },
    { code: { lang: "text", src: "xs = [1, 2, 3, 4, 5, 6]\nsumSqEven = fold (+) 0 (map square (filter even xs))\n-- filter even  → [2, 4, 6]\n-- map square   → [4, 16, 36]\n-- fold (+) 0   → 56", cap: "Read from the inside out: filter, then map, then fold." } },
    { steps: [
      "**filter** chooses which elements matter.",
      "**map** transforms each of them.",
      "**fold** combines them into one answer.",
      "No variable changes at any step — which is why the work can be split across processors (4.11.1)."
    ] },

    { page: "The same in C# and Python" },
    { table: { head: ["Idea", "Haskell", "C# (LINQ)", "Python"], rows: [
      ["map", "map square a", "a.Select(square)", "list(map(square, a))"],
      ["filter", "filter (< 10) b", "b.Where(x => x < 10)", "list(filter(lambda x: x < 10, b))"],
      ["fold", "fold (+) 0 c", "c.Aggregate(0, (acc, x) => acc + x)", "functools.reduce(lambda a, x: a + x, c, 0)"]
    ] } },
    { code: { lang: "csharp", src: "Func<int, int> square = x => x * x;\nConsole.WriteLine(string.Join(\",\", new[] { 1, 3, 5 }.Select(square)));          // 1,9,25\nConsole.WriteLine(string.Join(\",\", new[] { 1, 5, 10, 15 }.Where(x => x < 10))); // 1,5\nConsole.WriteLine(new[] { 9, 7, 2 }.Aggregate(0, (acc, x) => acc + x));         // 18\nConsole.WriteLine(new[] { 1, 2, 3, 4, 5, 6 }\n    .Where(x => x % 2 == 0).Select(square).Aggregate(0, (a, x) => a + x));     // 56", cap: "Compiled and run with .NET 10." } },

    { page: "Reading an unfamiliar program" },
    { steps: [
      "Read each function in the order defined; write a one-line English meaning beside it (fu: °F → °C; fw: count; fx: sum).",
      "Spot higher-order use: a line containing **map**, **filter** or **fold** (or passing a function).",
      "Spot recursion: a function that calls itself (fw, fx).",
      "Evaluate calls inside out; keep list brackets; keep decimals if division occurs.",
      "For \"purpose\" questions, combine the meanings in the context's terms."
    ] },
    { table: { head: ["Function (2022)", "Meaning", "Higher-order?", "Recursive?"], rows: [
      ["fu a = (a - 32) * 5 / 9", "°F → °C", "no", "no"],
      ["fv b = map fu b", "convert a whole list", "**yes** (map)", "no"],
      ["fw (x:xs) = 1 + fw (xs)", "length", "no", "**yes**"],
      ["fx (x:xs) = x + fx (xs)", "sum", "no", "**yes**"],
      ["fy c = fx (c) / fw (c)", "mean", "no", "no"],
      ["fz d = fy (fv (d))", "mean in °C", "no (fv is called, not passed)", "no"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "map, filter, fold on lists", src: "A-level June 2017 · P2 Q06.2 · 3 marks",
      q: "square x = x * x; a = [1, 3, 5]; b = [1, 5, 10, 15]; c = [9, 7, 2]. Calculate the results of the function calls map square a, filter (<10) b and fold (+) 0 c.",
      steps: [
        { m: "map square a = [1, 9, 25];", mk: "1 mark" },
        { m: "filter (<10) b = [1, 5];", mk: "1 mark", n: "A. [5, 1] this time." },
        { m: "fold (+) 0 c = 0 + 9 + 7 + 2 = 18;", mk: "1 mark" }
      ], result: "[1,9,25] · [1,5] · 18" } },
    { worked: { tag: "exam", title: "What a higher-order function is", src: "A-level June 2017 · P2 Q06.3 · 1 mark",
      q: "map is an example of a higher-order function. Explain what a higher-order function is.",
      steps: [{ m: "A function that takes a function as an argument and/or returns a function as its result;", mk: "1 mark", n: "NE. \"a function that uses another function\"; R. an explanation of map only." }], result: "Takes or returns a function" } },
    { worked: { tag: "exam", title: "How many use a higher-order function", src: "A-level June 2018 · P2 Q15.1 · 1 mark",
      q: "fw [a,b] = a * b; fx c = map fw c; fy d = fold (+) 0 d; fz e = fy (fx e). How many of the four functions (fw, fx, fy, fz) use a higher-order function?",
      steps: [{ m: "fx uses map and fy uses fold. fw uses only ×; fz applies fy and fx but passes no function." }, { m: "2;", mk: "1 mark" }], result: "2" } },
    { worked: { tag: "exam", title: "Explain higher-order (2 marks)", src: "A-level June 2020 · P2 Q11.3 · 2 marks",
      q: "Functional programming languages support higher-order functions such as map and fold. Explain what a higher-order function is.",
      steps: [
        { m: "A function that takes a function as an argument;", mk: "1 mark" },
        { m: "and/or returns a function as its result;", mk: "1 mark", n: "Max 2. A. parameter / input for argument." }
      ], result: "Function as argument; function as result" } },
    { worked: { tag: "exam", title: "A product fold", src: "A-level June 2020 · P2 Q11.4 · 1 mark",
      q: "What is the result of this application of the fold function? fold (*) 1 [2, 3, 2]",
      steps: [{ m: "1 × 2 = 2; 2 × 3 = 6; 6 × 2 = 12;" }, { m: "12;", mk: "1 mark" }], result: "12" } },
    { worked: { tag: "exam", title: "Which includes a higher-order function", src: "A-level June 2022 · P2 Q12.1 · 1 mark",
      q: "fu a = (a - 32) * 5 / 9; fv b = map fu b; fx [] = 0; fx (x:xs) = x + fx (xs); fy c = fx (c) / fw (c). Which of fu, fv, fx, fy includes a higher-order function in its definition?",
      steps: [{ m: "fv;", mk: "1 mark", n: "It uses map. fx is recursive, not higher-order." }], result: "fv" } },
    { worked: { tag: "exam", title: "Temperatures: calculate the results", src: "A-level June 2022 · P2 Q12.3 · 4 marks",
      q: "temps = [50, 68, 95, 86]; fu a = (a - 32) * 5 / 9; fv b = map fu b; fw [] = 0; fw (x:xs) = 1 + fw (xs); fx [] = 0; fx (x:xs) = x + fx (xs); fy c = fx (c) / fw (c); fz d = fy (fv (d)). Calculate the results of fu 50, fv temps, fw temps and fz temps.",
      steps: [
        { m: "fu 50 = (50 − 32) × 5 / 9 = 10.0;", mk: "1 mark", n: "A. 10." },
        { m: "fv temps = [10.0, 20.0, 35.0, 30.0];", mk: "1 mark", n: "R. no brackets." },
        { m: "fw temps = 4 — it counts the elements;", mk: "1 mark" },
        { m: "fz temps = (10 + 20 + 35 + 30) / 4 = 95 / 4 = 23.75;", mk: "1 mark", n: "A. 95/4; follow-through from your row-2 list and row-3 count." }
      ], result: "10.0 · [10.0, 20.0, 35.0, 30.0] · 4 · 23.75" } },
    { worked: { tag: "variation", title: "Write the pipeline", q: "scores = [45, 82, 67, 91, 30]. Using map, filter and fold, write expressions for (a) the scores of 50 or more (b) each score as a percentage of 120, as a decimal (c) the total of the scores of 50 or more. Give each result.",
      steps: [
        { m: "(a) filter (>= 50) scores = [82, 67, 91]", mk: "1" },
        { m: "(b) map (\\s -> s / 120) scores = [0.375, 0.6833…, 0.5583…, 0.7583…, 0.25]", mk: "1" },
        { m: "(c) fold (+) 0 (filter (>= 50) scores) = 240", mk: "1" }
      ], result: "[82,67,91] · fractions · 240" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Calculate the results", "One per row; lists in brackets; decimals where / is used; check the base value."],
      ["Explain higher-order", "Takes a function as an argument AND/OR returns a function as its result."],
      ["Shade which / how many", "Look for map / filter / fold or a function passed in — not merely called, not recursion."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Map changes, Filter chooses, Fold combines\"", body: "**map** — same length, each changed. **filter** — same elements, some removed. **fold** — one value from many. Higher-order = **takes or makes** a function." } },
    { callout: { t: "warn", h: "Specific errors", body: ["List results without brackets.", "fold (*) with a base of 0.", "Calling a recursive function higher-order.", "Counting fz as higher-order because it calls functions.", "Dropping the .0 is fine, but rounding 23.75 is not."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.12.1.2 first-class functions make these possible; 4.12.1.4 (< 10) and (* 2) are partial applications; 4.12.3.1 map and filter are recursions over head and tail; 4.11.1 MapReduce; 4.10.4 SQL WHERE is a filter and the SELECT list a map." } }
  ],
  flashcards: [
    ["map?", "Applies a function to every element of a list, returning the list of results.", 1],
    ["map square [1,3,5]?", "[1, 9, 25].", 4],
    ["filter (<10) [1,5,10,15]?", "[1, 5].", 5],
    ["fold (+) 0 [9,7,2]?", "18.", 6],
    ["fold (*) 1 [2,3,2]?", "12.", 7],
    ["foldl (-) 10 [1,2,3] vs foldr (-) 0 [1,2,3]?", "4 vs 2.", 8],
    ["C# LINQ for map / filter / fold?", "Select / Where / Aggregate.", 9],
  ],
  quiz: [
    { q: "map changes a list's", opts: ["elements, not its length", "length", "order", "type of container"], ans: 0, why: "One output per element." },
    { q: "fold (*) 0 [2,3,4] gives", opts: ["0", "24", "9", "an error"], ans: 0, why: "Base 0 × anything." },
    { q: "\"A function that uses another function\" as a definition of higher-order scores", opts: ["NE.", "1 mark", "2 marks", "full"], ans: 0, why: "Must pass or return a function." },
    { q: "fv b = map fu b is", opts: ["higher-order", "recursive", "a fold", "a composition"], ans: 0, why: "Uses map." },
    { q: "filter even (map square [1,2,3])", opts: ["[4]", "[1,4,9]", "[2]", "14"], ans: 0, why: "[1,4,9] → keep even." },
    { q: "C# equivalent of filter", opts: ["Where", "Select", "Aggregate", "OrderBy"], ans: 0, why: "LINQ." }
  ]
};

/* =====================================================================
   4.12.3.1  List processing
   ===================================================================== */
C["compsci:4.12.3.1"] = {
  notes: [
    { h: "List processing — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.12.3.1)", body: ["Represent a list as a concatenation of a **head** and a **tail**.", "Know the head is an **element** and the tail is a **list**.", "Know a list can be **empty**.", "Describe and apply: return head, return tail, test for empty, return length, construct an empty list, **prepend** and **append** an item.", "Write programs for them."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Head / tail of a list, or of nested calls", "What is", "1", "A-level 2017 Q06.1, 2020 Q11.1"],
      ["How a recursive list function works", "Describe", "3", "A-level 2020 Q11.2"],
      ["Which functions use recursion", "Shade", "1", "A-level 2022 Q12.2"],
      ["Trace the calls of a recursive list function", "Complete the table", "3", "A-level 2023 Q12.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Head and tail**.", "**The seven operations**.", "**Recursion over a list**, traced.", "**Writing the operations yourself**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Head and tail" },
    { fig: (function () {
      var it = row(40, 40, ["1", "5", "10", "15"], "accent", 54);
      it.push({ poly: [[36, 34], [98, 34], [98, 76], [36, 76]], c: "good", w: 2 });
      it.push({ poly: [[100, 34], [260, 34], [260, 76], [100, 76]], c: "accent2", w: 2, dash: "5 4" });
      it.push(txt(67, 92, "head = 1", { b: true, c: "good" }), txt(180, 92, "tail = [5, 10, 15]", { b: true, c: "accent2" }));
      it.push(txt(67, 22, "an ELEMENT", { size: 10.5, c: "good" }), txt(180, 22, "a LIST", { size: 10.5, c: "accent2" }));
      it.push(txt(420, 40, "1 : [5, 10, 15]", { b: true, size: 13, c: "text" }), txt(420, 62, "= 1 : 5 : 10 : 15 : []", { size: 12, c: "text2" }));
      it.push(txt(420, 88, "(x:xs) splits head x from tail xs", { size: 10.5 }));
      return { w: 560, h: 110, items: it, cap: "A list is its head (one element) joined to its tail (the rest — always a list, possibly empty). ':' prepends an element to a list." };
    })() },
    { kv: [
      ["Head", "the FIRST element — a single value, not a list"],
      ["Tail", "the list of everything AFTER the head — a list, which may be empty: tail [7] = []"],
      ["Empty list", "[] — it has no head and no tail (head [] is an error)"],
      ["(x:xs) pattern", "in a definition, binds x to the head and xs to the tail of the argument"]
    ] },

    { page: "The seven operations" },
    { table: { head: ["Operation", "Haskell", "Example → result", "Python"], rows: [
      ["return head", "head xs", "head [1,5,10] → 1", "xs[0]"],
      ["return tail", "tail xs", "tail [1,5,10] → [5,10]", "xs[1:]"],
      ["test for empty", "null xs", "null [] → True", "len(xs) == 0"],
      ["return length", "length xs", "length [1,5,10] → 3", "len(xs)"],
      ["construct empty list", "[]", "[] → []", "[]"],
      ["prepend an item", "x : xs", "0 : [1,5] → [0,1,5]", "[x] + xs"],
      ["append an item", "xs ++ [x]", "[1,5] ++ [9] → [1,5,9]", "xs + [x]"]
    ] } },
    { callout: { t: "miscon", h: "Append needs a list on both sides", body: "++ joins two LISTS, so appending one item means wrapping it: xs ++ [9]. Prepending uses : with an element on the left: 0 : xs. And neither changes xs — they build a new list (immutability)." } },
    { worked: { tag: "variation", title: "Nested head and tail", q: "towers = [\"Blackpool\", \"Paris\", \"New Brighton\", \"Toronto\"]. Evaluate (a) tail (tail towers) (b) head (tail (tail towers)) (c) length (tail towers) (d) \"Eiffel\" : tail towers.",
      steps: [
        { m: "(a) [\"New Brighton\", \"Toronto\"]", mk: "1" },
        { m: "(b) \"New Brighton\" — an element, no brackets", mk: "1" },
        { m: "(c) 3", mk: "1" },
        { m: "(d) [\"Eiffel\", \"Paris\", \"New Brighton\", \"Toronto\"]", mk: "1" }
      ], result: "list, element, 3, new list" } },

    { page: "Recursion over a list" },
    { code: { lang: "text", src: "total []     = 0                   -- base case: the empty list\ntotal (x:xs) = x + total (xs)      -- head plus the total of the tail", cap: "The general case shrinks the list by one each call, so it must reach []." } },
    { table: { head: ["Call", "Argument", "Waits to compute", "Returns"], rows: [
      ["1", "[3, 4, 5]", "3 + total [4, 5]", "3 + 9 = **12**"],
      ["2", "[4, 5]", "4 + total [5]", "4 + 5 = 9"],
      ["3", "[5]", "5 + total []", "5 + 0 = 5"],
      ["4", "[]", "— base case", "0"]
    ] } },
    { steps: [
      "Calls go DOWN the table, each on the tail, until the empty list.",
      "The base case returns a value without recursing.",
      "Results come back UP: each call adds its head to the value returned from below.",
      "A missing or unreachable base case → infinite recursion → stack overflow (4.2.3.1)."
    ] },

    { page: "Writing the operations yourself" },
    { code: { lang: "text", src: "len []       = 0\nlen (x:xs)   = 1 + len xs                 -- 2022's fw\n\nisEmpty []   = True\nisEmpty _    = False\n\nappend x []     = [x]\nappend x (y:ys) = y : append x ys         -- rebuild, putting x at the end\n\nprepend x xs = x : xs", cap: "Each recursive definition has a base case for [] and a case for (x:xs)." } },
    { table: { head: [" ", "prepend (x : xs)", "append (xs ++ [x])"], rows: [
      ["Where the item goes", "front", "end"],
      ["Work done", "one step — the old list becomes the tail", "walks the whole list — n steps"],
      ["Time complexity", "O(1)", "O(n)"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "head(tail(tail b))", src: "A-level June 2017 · P2 Q06.1 · 1 mark",
      q: "b = [1, 5, 10, 15]. What is the list or value that is the result of applying the functions head(tail(tail b))?",
      steps: [{ m: "tail b = [5, 10, 15]; tail of that = [10, 15]; head = 10" }, { m: "10;", mk: "1 mark" }], result: "10" } },
    { worked: { tag: "exam", title: "Head and tail of towers", src: "A-level June 2020 · P2 Q11.1 · 1 mark",
      q: "towers = [\"Blackpool\", \"Paris\", \"New Brighton\", \"Toronto\"]. What are the head and tail of this list?",
      steps: [{ m: "Head: \"Blackpool\"; Tail: [\"Paris\", \"New Brighton\", \"Toronto\"];", mk: "1 mark (both)", n: "I. missing quotation marks; A. missing tail brackets this time only." }], result: "\"Blackpool\" · [\"Paris\", \"New Brighton\", \"Toronto\"]" } },
    { worked: { tag: "exam", title: "How total works", src: "A-level June 2020 · P2 Q11.2 · 3 marks",
      q: "total [] = 0 and total (x:xs) = x + total (xs), where [] is the empty list and (x:xs) splits a list into its head x and tail xs. Describe how the total function works to add up all of the numbers in a list.",
      steps: [
        { m: "The function is recursive / splits the list into its head and tail;", mk: "1 mark" },
        { m: "It calls itself with the tail of the list, and each call adds the head to the total of the tail;", mk: "1 mark" },
        { m: "The recursion terminates when the list is empty, returning 0;", mk: "1 mark", n: "Max 3 from: recursive; head/tail split; calls itself on the tail; adds head to the sum of the tail; stops at [] returning 0." }
      ], result: "Head + total of tail, down to [] = 0" } },
    { worked: { tag: "exam", title: "Which functions are recursive", src: "A-level June 2022 · P2 Q12.2 · 1 mark",
      q: "fu a = (a - 32) * 5 / 9; fv b = map fu b; fw [] = 0; fw (x:xs) = 1 + fw (xs); fx [] = 0; fx (x:xs) = x + fx (xs). Which two of fu, fv, fw, fx use recursion in their definitions?",
      steps: [{ m: "fw and fx — each calls itself on the tail;", mk: "1 mark", n: "R. if the number of shaded lozenges is not 2. fv uses map — higher-order, not recursive in its own definition." }], result: "fw and fx" } },
    { worked: { tag: "exam", title: "Trace FunctionZ [4, 2, 5, 3]", src: "A-level June 2023 · P2 Q12.1 · 3 marks",
      q: "FunctionZ [] = 0 and FunctionZ (x:xs) = x + 2 * FunctionZ (xs). Complete a table of the argument passed to each call of FunctionZ and the value returned by each call, when FunctionZ [4, 2, 5, 3] is evaluated.",
      steps: [
        { m: "Arguments in order: [4, 2, 5, 3], [2, 5, 3], [5, 3], [3], [] — the middle three: [2, 5, 3], [5, 3], [3];", mk: "1 mark", n: "A. destructured forms 2:[5,3] etc.; R. missing brackets." },
        { m: "Last call: argument [] returns 0;", mk: "1 mark" },
        { m: "Returned values, from the first call: 52, 24, 11, 3 — because 3 + 2×0 = 3; 5 + 2×3 = 11; 2 + 2×11 = 24; 4 + 2×24 = 52;", mk: "1 mark" }
      ], result: "52, 24, 11, 3, 0" } },
    { worked: { tag: "variation", title: "Write maxList", q: "Write a recursive function maxList that returns the largest value in a non-empty list of integers, and trace maxList [3, 9, 4].",
      steps: [
        { m: "maxList [x] = x — base case: a one-element list", mk: "1" },
        { m: "maxList (x:xs) = max x (maxList xs) — compare the head with the largest of the tail", mk: "1" },
        { m: "maxList [4] = 4; maxList [9,4] = max 9 4 = 9; maxList [3,9,4] = max 3 9 = 9", mk: "1" }
      ], result: "9" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["What is the head / tail", "Head an element (no brackets); tail a list (brackets, possibly [])."],
      ["Describe how it works", "Recursive · head/tail split · calls itself on the tail · combines the head with the result · stops at [] with the base value."],
      ["Complete the trace table", "Arguments shrink by one; the base row; then returned values computed bottom-up."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Head's a thing, Tail's a list\"", body: "And every list recursion has two lines: **[] → stop**, **(x:xs) → do x, recurse on xs**." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Writing the head in brackets or the tail without them.", "Forgetting the empty list has no head.", "Filling returned values top-down before the base case is known.", "Using : to put an item on the END of a list."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.3 stacks — the pending calls; 4.1.1.16 recursive techniques and base cases; 4.12.2.1 map and filter are recursions over head/tail; 4.4.4.3 order of complexity — prepend O(1) vs append O(n); 4.2.1.4 lists as a data structure." } }
  ],
  flashcards: [
    ["Head of a list?", "Its first element — a single value."],
    ["tail [7]?", "[] — the empty list.", 2],
    ["head []?", "An error — the empty list has no head.", 3],
    ["Prepend in Haskell?", "x : xs.", 4],
    ["Append in Haskell?", "xs ++ [x].", 5],
    ["Test for empty?", "null xs (or xs == []).", 6],
    ["head(tail(tail [1,5,10,15]))?", "10.", 7],
    ["Two parts of every recursive list function?", "Base case for [] and a general case for (x:xs) recursing on xs.", 9],
    ["Why is append slower than prepend?", "It walks the whole list (O(n)); prepend is one step (O(1)).", 10]
  ],
  quiz: [
    { q: "tail [\"Blackpool\", \"Paris\"] is", opts: ["[\"Paris\"]", "\"Paris\"", "\"Blackpool\"", "[]"], ans: 0, why: "The tail is a list." },
    { q: "total [3,4,5] with total (x:xs) = x + total xs", opts: ["12", "3", "[12]", "an error"], ans: 0, why: "3 + 4 + 5 + 0." },
    { q: "Which pair are recursive in 2022?", opts: ["fw and fx", "fu and fv", "fv and fw", "fu and fx"], ans: 0, why: "They call themselves." },
    { q: "0 : [1, 2] gives", opts: ["[0, 1, 2]", "[1, 2, 0]", "[[0], 1, 2]", "an error"], ans: 0, why: "Prepend." },
    { q: "length [] is", opts: ["0", "1", "an error", "[]"], ans: 0, why: "Empty list." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
