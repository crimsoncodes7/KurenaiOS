/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.12.1.1–
   4.12.1.5 (function type, domain and co-domain; functions as first-class
   objects; function application; partial function application; composition
   of functions) at full A-level depth. Each topic REPLACES the short entry
   the retired cs-advanced.js carried; every way AQA has examined it (7517/2 June 2017–
   2025) is explained, worked and answered in the mark scheme's own format.
   Every evaluation was checked by running Python mirrors of the Haskell,
   and every C# example was compiled and run with .NET 10. Past-paper banks
   stay in bank-cs-410-413.js. */
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
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: o.both ? "both" : true, c: o.c || "accent2", w: o.w || 2, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}
function oval(cx, cy, rx, ry, col) {
  var pts = [];
  for (var i = 0; i < 40; i++) { var a = i / 40 * 2 * Math.PI; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return { poly: pts, fill: col, alpha: 0.1, c: col, w: 1.6 };
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **Max n** caps the total. **A.** accept · **R.** reject · **NE.** not enough · **TO.** talked out (a right answer followed by a wrong one).",
  "Number sets: name the SET in words when asked to describe (\"the set of real numbers\") — **NE.** the bare symbol ℝ when the question says describe.",
  "Shade-all questions: R. if the number of shaded lozenges is wrong."
] } };

/* =====================================================================
   4.12.1.1  Function type
   ===================================================================== */
C["compsci:4.12.1.1"] = {
  notes: [
    { h: "Function type — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.12.1.1)", body: ["Know that a function f has a **function type** $f: A \\to B$, where A is the **argument type** and B the **result type**.", "That A is the **domain** and B the **co-domain**.", "And that both are always subsets of objects in some data type."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["State / describe the co-domain", "What is / Describe", "1", "A-level 2019 Q07.1, 2024 Q11.1"],
      ["Choose the co-domain of a given function", "Shade", "1", "A-level 2023 Q12.2"],
      ["Choose the function type", "Shade", "1", "A-level 2025 Q11.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Domain, co-domain and range**.", "**The number sets**.", "**Writing function types**, including two arguments.", "**Deciding a co-domain** from the code.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Domain, co-domain and range" },
    { callout: { t: "def", h: "Function", body: "A rule that, for each element of a set A of inputs, assigns **exactly one** output chosen from a set B — without necessarily using every member of B. Its type is written $f: A \\to B$." } },
    { fig: (function () {
      var it = [oval(120, 120, 80, 100, "accent"), oval(440, 120, 90, 110, "accent2")];
      var dom = ["a", "b", "c", "z"], cod = ["0", "1", "2", "25", "26", "99"];
      dom.forEach(function (d, i) { it.push(txt(120, 45 + i * 46, d === "z" ? "…  z" : d, { b: true, size: 13, c: "text" })); });
      cod.forEach(function (d, i) { it.push(txt(440, 35 + i * 33, d, { b: i < 4, size: 13, c: i < 4 ? "good" : "muted" })); });
      [[0, 0], [1, 1], [2, 2], [3, 3]].forEach(function (p) { it = it.concat(arrow(140, 45 + p[0] * 46, 420, 35 + p[1] * 33, null, { c: "text2", w: 1.4 })); });
      it.push(txt(120, 240, "domain A — inputs", { b: true, c: "accent" }), txt(440, 245, "co-domain B — possible outputs", { b: true, c: "accent2" }));
      it.push(txt(560, 70, "used:", { size: 10.5, c: "good", pos: "e", off: 0 }), txt(560, 86, "the range", { size: 10.5, c: "good", pos: "e", off: 0 }));
      it.push(txt(560, 200, "26, 99 are in", { size: 10.5, pos: "e", off: 0 }), txt(560, 216, "B but never output", { size: 10.5, pos: "e", off: 0 }));
      return { w: 660, h: 260, items: it, cap: "f: {a,b,…,z} → ℕ mapping each letter to its alphabet position from 0. Every input has one output; not every member of the co-domain is used." };
    })() },
    { kv: [
      ["Domain", "the set from which the function's **input** values are chosen"],
      ["Co-domain", "the set from which the function's **output** values are chosen — **not all of its members need to be outputs**"],
      ["Range (image)", "(beyond the spec) the outputs actually produced — a subset of the co-domain"],
      ["Argument type / result type", "the data types A and B in $f: A \\to B$ — the domain and co-domain are subsets of objects of those types"]
    ] },
    { callout: { t: "miscon", h: "Co-domain is not \"the outputs\"", body: "pred: ℤ → ℤ has co-domain ℤ even though you could argue about which outputs occur; a co-domain is what the outputs are **chosen from**. Many functions have co-domain = domain." } },

    { page: "The number sets" },
    { table: { head: ["Symbol", "Set", "Members", "Example"], rows: [
      ["ℕ", "natural numbers", "0, 1, 2, 3, … (AQA includes 0)", "a list's length; a count"],
      ["ℤ", "integers", "… −2, −1, 0, 1, 2 …", "a temperature in whole degrees"],
      ["ℚ", "rational numbers", "any $\\frac{p}{q}$ with p, q integers, q ≠ 0", "0.75, −1/3"],
      ["ℝ", "real numbers", "every point on the number line: rationals and irrationals", "√2, π, a measured length"]
    ] } },
    { fig: (function () {
      var it = [];
      [["ℝ  real", 300, 105, 280, 95, "accent3"], ["ℚ  rational", 260, 110, 210, 75, "accent2"], ["ℤ  integer", 220, 115, 140, 52, "accent"], ["ℕ  natural", 185, 118, 70, 30, "good"]].forEach(function (s) {
        it.push(oval(s[1], s[2], s[3], s[4], s[5]));
        it.push(txt(s[1] + s[3] - 40, s[2] - s[4] + 16, s[0], { b: true, size: 11, c: s[5] }));
      });
      return { w: 600, h: 215, items: it, cap: "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. A function whose outputs are always integers has co-domain ℤ; if it can divide, its outputs may need ℚ or ℝ." };
    })() },

    { page: "Writing function types" },
    { table: { head: ["Function", "Type", "Why"], rows: [
      ["square(x) = x² on integers", "ℤ → ℤ (or ℤ → ℕ)", "integer in, integer out (never negative)"],
      ["pred(x) = x − 1", "ℤ → ℤ", "subtracting 1 from an integer gives an integer"],
      ["add(x, y) = x + y", "ℤ × ℤ → ℤ", "the domain is the **Cartesian product** — every pair (x, y)"],
      ["length of a list", "[a] → ℕ", "a count is never negative"],
      ["toCelsius(f) = (f − 32) × 5 / 9", "ℝ → ℝ", "division gives non-integers"],
      ["isEven(n)", "ℤ → Bool", "domain and co-domain need not be numbers"]
    ] } },
    { callout: { t: "def", h: "Two arguments, one domain", body: "add takes \"two arguments\", but formally it takes ONE argument — a pair (3, 4) from the set ℤ × ℤ. Its type is $\\text{add}: \\mathbb{Z} \\times \\mathbb{Z} \\to \\mathbb{Z}$. In the partial-application view (4.12.1.4) the same function is $\\mathbb{Z} \\to \\mathbb{Z} \\to \\mathbb{Z}$." } },

    { page: "Deciding a co-domain" },
    { steps: [
      "Find the domain — the type of value the inputs come from (often given: \"all values are integers\").",
      "Look at every operation applied: +, −, × keep integers integers; division may not; a count or length is natural; a comparison gives Boolean.",
      "Look at the base case of a recursive function — its value (0) must be in the co-domain too.",
      "Choose the smallest named set that can hold EVERY possible output for EVERY valid input."
    ] },
    { worked: { tag: "variation", title: "Types from the code", q: "Give a suitable function type for: (a) double x = 2 * x on integers (b) half x = x / 2 on integers (c) count of the elements of a list of strings (d) fibonacci n for n ≥ 1.",
      steps: [{ m: "(a) ℤ → ℤ", mk: "1" }, { m: "(b) ℤ → ℚ — 7 / 2 = 3.5 is not an integer (ℝ also accepted as a co-domain)", mk: "1" }, { m: "(c) [String] → ℕ", mk: "1" }, { m: "(d) ℕ → ℕ — terms are positive whole numbers", mk: "1" }], result: "ℤ→ℤ, ℤ→ℚ, [String]→ℕ, ℕ→ℕ" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Co-domain of pred", src: "A-level June 2019 · P2 Q07.1 · 1 mark",
      q: "The functions add(x,y) = x + y, square(x) = x² and pred(x) = x − 1 are defined. The domain of square and pred is the set of integers ℤ and the domain of add is ℤ × ℤ. What is the co-domain of the pred function?",
      steps: [{ m: "(The set of) integers / ℤ — the same set as the domain;", mk: "1 mark", n: "Subtracting 1 from any integer gives an integer." }], result: "ℤ" } },
    { worked: { tag: "exam", title: "Co-domain of FunctionZ", src: "A-level June 2023 · P2 Q12.2 · 1 mark",
      q: "FunctionZ [] = 0 and FunctionZ (x:xs) = x + 2 * FunctionZ (xs). All of the values in lists passed to FunctionZ are members of the set of integers. Which is the co-domain of the function? A the set of integers · B irrational numbers · C natural numbers · D rational numbers · E real numbers",
      steps: [{ m: "Only + and × 2 are applied to integers, and the base case is 0, so every result is an integer — possibly negative, so not ℕ." }, { m: "A;", mk: "1 mark" }], result: "A — integers" } },
    { worked: { tag: "exam", title: "Describe the co-domain", src: "A-level June 2024 · P2 Q11.1 · 1 mark",
      q: "A functional programming function f has the function type f: ℕ → ℝ. Describe the co-domain of the function f.",
      steps: [{ m: "The set of real numbers — all possible real-world quantities / every number on the number line (rational and irrational);", mk: "1 mark", n: "NE. the symbol ℝ alone; TO. if another set is then described." }], result: "The set of real numbers" } },
    { worked: { tag: "exam", title: "Type of fibonacci", src: "A-level June 2025 · P2 Q11.2 · 1 mark",
      q: "fibonacci 1 = 1, fibonacci 2 = 1, fibonacci n = fibonacci (n - 1) + fibonacci (n - 2) gives the nth term of 1, 1, 2, 3, 5, 8, … Which is the function type of fibonacci? A ℕ→ℕ · B ℚ→ℤ · C ℝ→ℤ · D ℤ→ℕ",
      steps: [{ m: "The argument is a position (a natural number); every term is a positive whole number." }, { m: "A;", mk: "1 mark" }], result: "A — ℕ → ℕ" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["What is the co-domain", "The set the outputs come from — often the same as the domain."],
      ["Describe the co-domain", "Name the set in WORDS: \"the set of real numbers\"."],
      ["Shade the type", "Domain = what n can be; co-domain = what the results can be."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Do In, Co Out\"", body: "**Do**main = **in**puts; **Co**-domain = possible **out**puts. Sets nest **N**ever **Z**ip **Q**uite **R**ight: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Giving the range (actual outputs) as if every co-domain member must be used.", "Writing just \"ℝ\" for describe.", "Choosing ℕ when the function can return negatives.", "Forgetting the Cartesian product for a two-argument function."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.1 number sets ℕ ℤ ℚ ℝ; 4.12.1.4 the curried type ℤ → ℤ → ℤ; 4.12.1.5 composition needs the co-domain of f to fit the domain of g; 4.1.1.1 data types; 4.4.2.2 sets and Cartesian products." } }
  ],
  flashcards: [
    ["Domain?", "The set from which a function's input values are chosen.", 1],
    ["Co-domain?", "The set from which output values are chosen; not every member need be output.", 2],
    ["Type of add(x, y) on integers?", "ℤ × ℤ → ℤ.", 3],
    ["Co-domain of pred(x) = x − 1 on ℤ?", "ℤ.", 4],
    ["Describe the co-domain of f: ℕ → ℝ.", "The set of real numbers.", 6],
    ["Natural numbers in AQA?", "0, 1, 2, 3, … (0 included).", 7],
    ["Domain and co-domain are always…", "subsets of objects in some data type.", 8]
  ],
  quiz: [
    { q: "In f: A → B, B is the", opts: ["co-domain", "domain", "argument", "range always"], ans: 0, why: "Result type." },
    { q: "FunctionZ on integer lists has co-domain", opts: ["integers", "natural numbers", "real numbers only", "irrationals"], ans: 0, why: "+ and × keep integers." },
    { q: "half x = x / 2 on integers needs a co-domain of at least", opts: ["ℚ", "ℕ", "ℤ", "Bool"], ans: 0, why: "7/2 = 3.5." },
    { q: "add on integers has domain", opts: ["ℤ × ℤ", "ℤ", "ℕ", "ℝ → ℝ"], ans: 0, why: "Cartesian product." },
    { q: "Must every member of the co-domain be output?", opts: ["no", "yes", "only for ℕ", "only for recursive functions"], ans: 0, why: "Spec." }
  ]
};

/* =====================================================================
   4.12.1.2  First-class object
   ===================================================================== */
C["compsci:4.12.1.2"] = {
  notes: [
    { h: "First-class object — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.12.1.2)", body: "Know that a function is a **first-class object** in functional programming languages and in imperative languages that support such objects: it can be an **argument** to another function and the **result** of a function call." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Which statements about a function are true (first-class, arguments…)", "Shade all", "1", "A-level 2025 Q11.1"],
      ["What first-class means / why it enables higher-order functions", "Explain", "1–2", "spec; part of 2017 Q06.3 and 2020 Q11.3 answers"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What first-class means**.", "**Functions as values in code** — Haskell, C#, Python.", "**Why it matters**: higher-order functions.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What first-class means" },
    { callout: { t: "def", h: "First-class object", body: "An object (value) that may **appear in expressions**, be **assigned to a variable**, be **passed as an argument** and be **returned from a function call**. Integers, floating-point values, characters and strings are first-class in most languages; in a functional language **functions are too**." } },
    { table: { head: ["Ability", "With an integer", "With a function"], rows: [
      ["appear in an expression", "3 + x", "(square . pred) 3"],
      ["be assigned to a name", "n = 5", "double = (* 2)"],
      ["be an argument", "max 3 7", "map square [1, 3, 5]"],
      ["be a result", "length xs returns 3", "add 4 returns a function"]
    ] } },
    { callout: { t: "miscon", h: "Not just functional languages", body: "C# (delegates, Func<>, lambdas), Python, JavaScript and Java 8+ are imperative languages that also treat functions as first-class objects. The spec says \"and in imperative programming languages that support such objects\"." } },

    { page: "Functions as values in code" },
    { code: { lang: "text", src: "-- Haskell\nsquare x = x * x\ntwice f x = f (f x)          -- takes a function as an argument\nadder n = \\x -> x + n         -- returns a function as its result\n\ntwice square 3               -- 81\n(adder 4) 6                  -- 10\nmap square [1, 3, 5]         -- [1,9,25]", cap: "square is passed to twice and to map; adder 4 is a new function." } },
    { code: { lang: "csharp", src: "Func<int, int> square = x => x * x;               // a function stored in a variable\nint Apply(Func<int, int> f, int v) => f(v);      // takes a function as an argument\nFunc<int, Func<int, int>> add = x => y => x + y;  // returns a function\nConsole.WriteLine(Apply(square, 7));             // 49\nConsole.WriteLine(add(4)(6));                    // 10", cap: "Compiled and run with .NET 10." } },
    { code: { lang: "python", src: "square = lambda x: x * x\ndef apply(f, v):\n    return f(v)\ndef adder(n):\n    return lambda x: x + n\nprint(apply(square, 7), adder(4)(6))   # 49 10", cap: "Python treats functions as first-class objects too." } },

    { page: "Why it matters" },
    { steps: [
      "Because a function is a value, it can be **passed in**: map, filter and fold take the function to apply as an argument.",
      "Because it can be **returned**, partial application (4.12.1.4) and composition (4.12.1.5) can build new functions at run time.",
      "A function that takes or returns a function is **higher-order** (4.12.2.1) — higher-order functions exist only because functions are first-class.",
      "For Big Data (4.11.1), the function itself can be shipped to the servers holding the data."
    ] },
    { table: { head: [" ", "First-class object", "Higher-order function"], rows: [
      ["Is a property of…", "a kind of VALUE (e.g. functions)", "a particular FUNCTION"],
      ["Means", "can be stored, passed, returned, used in expressions", "takes a function as an argument and/or returns one"],
      ["Example", "functions in Haskell", "map, filter, fold, twice"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "True statements about fibonacci", src: "A-level June 2025 · P2 Q11.1 · 1 mark",
      q: "fibonacci 1 = 1, fibonacci 2 = 1, fibonacci n = fibonacci (n - 1) + fibonacci (n - 2). Shade all of the statements that are true about the fibonacci function: A the function has one argument · B the function is a first-class object · C the function outputs a list · D the function uses a higher-order function",
      steps: [
        { m: "A true — one argument, n. B true — in a functional language every function is a first-class object. C false — it outputs a number. D false — it only calls itself and uses +, −." },
        { m: "A and B;", mk: "1 mark", n: "R. if the number of shaded lozenges is not two." }
      ], result: "A and B" } },
    { worked: { tag: "variation", title: "Spot the first-class use", q: "Which lines use a function as a first-class object? (1) total = sum xs (2) result = map negate xs (3) inc = (+ 1) (4) n = length xs + 1 (5) makeMultiplier k = \\x -> k * x",
      steps: [
        { m: "(2) negate is passed as an argument to map.", mk: "1" },
        { m: "(3) a function (+ 1) is assigned to the name inc.", mk: "1" },
        { m: "(5) makeMultiplier returns a function as its result.", mk: "1" },
        { m: "(1) and (4) only apply functions to data — they pass and return numbers." }
      ], result: "(2), (3), (5)" } },
    { worked: { tag: "variation", title: "Explain first-class (2 marks)", q: "Explain what it means for a function to be a first-class object.",
      steps: [{ m: "It can be passed as an argument to another function;", mk: "1" }, { m: "It can be returned as the result of a function call (and assigned to a variable / used in an expression);", mk: "1" }], result: "Passed and returned like any value" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain first-class", "Can be an argument AND the result of a function call (also: stored in a variable, used in an expression)."],
      ["Shade all true", "Every function in a functional language is first-class; check arguments and output type separately."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"PARE\" — what a first-class object can do", body: "**P**assed as an argument · **A**ssigned to a variable · **R**eturned from a call · **E**xpressions — appears in them." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Confusing first-class (a property of values) with higher-order (a property of a function).", "Thinking only pure functional languages have first-class functions.", "Shading D for a recursive function — recursion is not a higher-order function."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.12.2.1 higher-order functions need first-class functions; 4.12.1.4 partial application returns a function; 4.11.1 functions shipped to the data in MapReduce; 4.1.2.1 C# delegates and lambdas in your own programs." } }
  ],
  flashcards: [
    ["Name three first-class objects in most languages.", "Integers, floating-point values, characters, strings.", 1],
    ["Are functions first-class in a functional language?", "Yes.", 2],
    ["Can an imperative language have first-class functions?", "Yes — e.g. C# delegates/lambdas, Python, JavaScript.", 3],
    ["Why are higher-order functions possible?", "Because functions are first-class: they can be passed and returned.", 4],
    ["C# type for a function from int to int?", "Func<int, int>.", 6],
    ["First-class vs higher-order?", "First-class describes a kind of value; higher-order describes a function that takes/returns functions.", 7]
  ],
  quiz: [
    { q: "Which is NOT required of a first-class object?", opts: ["it must be recursive", "it can be passed as an argument", "it can be returned", "it can be assigned to a variable"], ans: 0, why: "Recursion is unrelated." },
    { q: "map square [1,3,5] uses square as", opts: ["a first-class object passed as an argument", "a higher-order function", "a list", "a co-domain"], ans: 0, why: "square is passed in." },
    { q: "In C#, Func<int,int> f = x => x + 1 shows a function", opts: ["assigned to a variable", "being partially applied", "composed", "folded"], ans: 0, why: "Stored as a value." },
    { q: "A function returning a function is", opts: ["higher-order", "first-order only", "impossible", "a list"], ans: 0, why: "Returns a function." }
  ]
};

/* =====================================================================
   4.12.1.3  Function application
   ===================================================================== */
C["compsci:4.12.1.3"] = {
  notes: [
    { h: "Function application — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.12.1.3)", body: "Know that **function application** means a function **applied to its arguments**." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Calculate the results of function calls", "Calculate", "3–4", "A-level 2018 Q15.2 (here); 2017 Q06.2, 2022 Q12.3 in 4.12.2.1"],
      ["What the result means in context", "Explain", "1", "A-level 2018 Q15.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Applying a function**.", "**Reading application in Haskell**: precedence and brackets.", "**Evaluating by substitution**, traced.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Applying a function" },
    { callout: { t: "def", h: "Function application", body: "The process of giving particular inputs (arguments) to a function to produce its result. add(3, 4) is the **application** of the function add to the integer arguments 3 and 4." } },
    { kv: [
      ["Type of add", "$\\text{add}: \\text{integer} \\times \\text{integer} \\to \\text{integer}$ — the domain is the Cartesian product"],
      ["How many arguments?", "we say two, but formally add takes ONE argument: the pair (3, 4)"],
      ["Function vs application", "add is the function (a value); add(3, 4) — or add 3 4 — is an application, which evaluates to 7"]
    ] },

    { page: "Reading application in Haskell" },
    { table: { head: ["Written", "Means", "Value (square x = x*x)"], rows: [
      ["square 3", "apply square to 3 — juxtaposition, no brackets needed", "9"],
      ["square 3 + 1", "(square 3) + 1 — application binds tighter than any operator", "10"],
      ["square (3 + 1)", "brackets make the argument 3 + 1", "16"],
      ["add 3 4", "(add 3) 4 — application is left-associative", "7"],
      ["fy (fx e)", "apply fx to e, then fy to that result", "inside first"]
    ] } },
    { callout: { t: "warn", h: "The bracket trap", body: "square 3 + 1 is 10, not 16. When an argument is an expression, it needs brackets: f (x - 1), not f x - 1." } },

    { page: "Evaluating by substitution" },
    { callout: { t: "info", h: "Key idea", body: "Evaluate an application by replacing the call with the function's body, the parameter replaced by the argument — innermost applications first:" } },
    { code: { lang: "text", src: "fw [a,b] = a * b\nfx c = map fw c\nfy d = fold (+) 0 d\nfz e = fy (fx e)\nsales = [[10,2], [2,25], [4,8]]", cap: "The 2018 shop program." } },
    { table: { head: ["Step", "Expression", "Rule used"], rows: [
      ["1", "fz sales", "start"],
      ["2", "fy (fx sales)", "body of fz with e = sales"],
      ["3", "fy (map fw [[10,2],[2,25],[4,8]])", "body of fx"],
      ["4", "fy [fw [10,2], fw [2,25], fw [4,8]]", "map applies fw to each sublist"],
      ["5", "fy [20, 50, 32]", "fw multiplies the pair"],
      ["6", "fold (+) 0 [20, 50, 32]", "body of fy"],
      ["7", "((0 + 20) + 50) + 32 = 102", "fold adds from the base value 0"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Calculate the shop results", src: "A-level June 2018 · P2 Q15.2 · 3 marks",
      q: "fw [a,b] = a * b; fx c = map fw c; fy d = fold (+) 0 d; fz e = fy (fx e); sales = [[10,2], [2,25], [4,8]]. Calculate the results of the function calls fw [4,3], fx sales and fz sales.",
      steps: [
        { m: "fw [4,3] = 4 × 3 = 12;", mk: "1 mark" },
        { m: "fx sales = [20, 50, 32];", mk: "1 mark", n: "R. no brackets; R. each element in a separate list." },
        { m: "fz sales = 20 + 50 + 32 = 102;", mk: "1 mark" }
      ], result: "12 · [20, 50, 32] · 102" } },
    { worked: { tag: "exam", title: "What fz sales represents", src: "A-level June 2018 · P2 Q15.3 · 1 mark",
      q: "In the shop program, each sublist of sales holds a price-and-quantity pair for the products sold in one day (e.g. [10,2] means 10 units priced at £2). In the context of the shop, explain what the result of the function call fz sales represents.",
      steps: [{ m: "The total value of the day's sales / the day's income or revenue for all products;", mk: "1 mark", n: "A. total profit as BOD; NE. \"sales\" or \"total sales\"." }], result: "The day's total revenue" } },
    { worked: { tag: "variation", title: "Brackets change the application", q: "square x = x * x and pred x = x - 1. Evaluate (a) square pred 3 (b) square (pred 3) (c) pred (square 3) (d) square 3 - 1.",
      steps: [
        { m: "(a) an error — square would be applied to the function pred, then to 3 (two arguments)", mk: "1" },
        { m: "(b) square 2 = 4", mk: "1" },
        { m: "(c) pred 9 = 8", mk: "1" },
        { m: "(d) (square 3) - 1 = 8", mk: "1" }
      ], result: "error, 4, 8, 8" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Calculate the result", "Evaluate inside out; lists keep their brackets; one mark per row."],
      ["Explain what it represents", "Translate into the context's language: \"total value of the day's sales\"."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Inside out, left to right, application first\"", body: "Evaluate the innermost bracket first; application groups left (add 3 4 = (add 3) 4); and it binds tighter than any operator." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Writing a list result without brackets.", "Giving the context answer as \"sales\".", "Reading f x + 1 as f (x + 1)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.12.1.1 the type of a two-argument function; 4.12.1.4 partial application is applying to only some arguments; 4.12.2.1 map applies a function to every element; 4.1.1.16 tracing recursive calls." } }
  ],
  flashcards: [
    ["Type of add in the application view?", "integer × integer → integer.", 1],
    ["How many arguments does add really take?", "One — a pair from the Cartesian product.", 2],
    ["square 3 + 1 = ?", "10 — application binds tighter than +.", 3],
    ["add 3 4 groups as…", "(add 3) 4 — left-associative.", 4],
    ["How is a function application evaluated?", "substituting the argument into the function's body, innermost first.", 7]
  ],
  quiz: [
    { q: "square (3 + 1) evaluates to", opts: ["16", "10", "4", "an error"], ans: 0, why: "Bracketed argument." },
    { q: "fw [4,3] with fw [a,b] = a * b", opts: ["12", "7", "[4,3]", "43"], ans: 0, why: "4 × 3." },
    { q: "fz sales represents", opts: ["the day's total sales value", "the number of products", "the average price", "the sales list"], ans: 0, why: "Sum of price × quantity." },
    { q: "Function application means", opts: ["applying a function to its arguments", "defining a function", "combining two functions", "fixing some arguments"], ans: 0, why: "Spec." }
  ]
};

/* =====================================================================
   4.12.1.4  Partial function application
   ===================================================================== */
C["compsci:4.12.1.4"] = {
  notes: [
    { h: "Partial function application — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.12.1.4)", body: "Know what is meant by **partial function application** for **one, two and three argument** functions and use the notation $\\text{add}: \\text{integer} \\to (\\text{integer} \\to \\text{integer})$, with the brackets dropped as integer → integer → integer." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Describe how a given function could be partially applied", "Describe", "3", "A-level 2019 Q07.3"],
      ["Describe what partial function application is", "Describe", "2", "A-level 2025 Q11.4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Fixing arguments**.", "**Reading the types**: one, two and three arguments.", "**Why it is useful**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Fixing arguments" },
    { callout: { t: "def", h: "Partial function application", body: "Applying a function to **some** of its arguments: those arguments are **fixed**, and the result is a **new function** that takes the **remaining** arguments." } },
    { fig: (function () {
      var it = [];
      it = it.concat(boxAt(20, 40, 150, 60, "add", "accent", "needs x and y"));
      it = it.concat(arrow(170, 70, 250, 70, "apply to 4", { c: "accent2" }));
      it = it.concat(boxAt(250, 40, 150, 60, "add 4", "accent2", "x fixed = 4; needs y"));
      it = it.concat(arrow(400, 70, 480, 70, "apply to 6", { c: "good" }));
      it = it.concat(boxAt(480, 40, 100, 60, "10", "good", "an integer"));
      it.push(txt(95, 118, "integer → integer → integer", { size: 10.5, c: "accent" }), txt(325, 118, "integer → integer", { size: 10.5, c: "accent2" }), txt(530, 118, "integer", { size: 10.5, c: "good" }));
      return { w: 600, h: 135, items: it, cap: "add 4 is not a number — it is a new function that adds 4 to whatever it is given. Applying that to 6 gives 10." };
    })() },
    { kv: [
      ["add: integer → (integer → integer)", "add takes ONE integer and returns a FUNCTION from integer to integer"],
      ["Dropping the brackets", "integer → integer → integer — the arrows group to the right, so this means the same thing"],
      ["Reading it", "add takes one argument after another and finally returns an integer"]
    ] },

    { page: "Reading the types" },
    { table: { head: ["Expression", "Type", "Arguments still needed"], rows: [
      ["vol (length × width × height)", "ℤ → ℤ → ℤ → ℤ", "3"],
      ["vol 2", "ℤ → ℤ → ℤ", "2 (width, height)"],
      ["vol 2 3", "ℤ → ℤ", "1 (height)"],
      ["vol 2 3 4", "ℤ", "0 — the value 24"]
    ] } },
    { steps: [
      "Write the full type with one arrow per argument plus the result.",
      "Each argument supplied removes the **leftmost** argument type.",
      "When none remain, the expression is a value of the result type."
    ] },
    { callout: { t: "miscon", h: "Partial ≠ incomplete", body: "add 4 is not an error and not \"waiting\": it is a complete, usable function. Applying ALL arguments (add 4 6) is ordinary function application, not partial." } },

    { page: "Why it is useful" },
    { code: { lang: "text", src: "add x y = x + y\nadd4 = add 4                 -- a new one-argument function\nmap (add 4) [1, 2, 3]        -- [5, 6, 7]\nmap (* 2) [1, 2, 3]          -- [2, 4, 6]   an operator section\nfilter (< 10) [1, 5, 10, 15] -- [1, 5]", cap: "Partial application builds the small functions that map and filter need, without naming them." } },
    { code: { lang: "csharp", src: "Func<int, Func<int, int>> add = x => y => x + y;  // curried add\nvar add4 = add(4);                                // partial application\nConsole.WriteLine(add4(6));                       // 10", cap: "The same idea in C# (compiled and run)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Partially apply add", src: "A-level June 2019 · P2 Q07.3 · 3 marks",
      q: "add(x,y) = x + y is defined on ℤ × ℤ, so it takes two arguments. Describe how the add function could be partially applied to the arguments 4 and 6.",
      steps: [
        { m: "add is applied to one of its arguments, e.g. 4 — that argument is fixed;", mk: "1 mark (AO1)" },
        { m: "The output of this application is a new function (e.g. add4), which takes one argument;", mk: "1 mark (AO1)" },
        { m: "The new function always adds 4 to its argument; applying it to 6 gives 10;", mk: "1 mark (AO2)", n: "Use the same value (4 or 6) throughout. An example alone, add4(x) = 4 + x, scores max 2 without a description." }
      ], result: "add 4 → a new function x ↦ 4 + x; (add 4) 6 = 10" } },
    { worked: { tag: "exam", title: "What partial application is", src: "A-level June 2025 · P2 Q11.4 · 2 marks",
      q: "Describe what partial function application is.",
      steps: [
        { m: "One (or more) of a function's arguments are fixed / the function is applied to only some of its arguments;" },
        { m: "creating a new function;" },
        { m: "that takes the remaining arguments / has fewer arguments;", mk: "2 marks all three · 1 mark one or two", n: "R. \"the function is applied to its arguments\" (that is ordinary application)." }
      ], result: "Fix some arguments → a new function of the rest" } },
    { worked: { tag: "variation", title: "Three-argument function", q: "vol l w h = l * w * h, with vol: ℤ → ℤ → ℤ → ℤ. State the type and meaning of (a) vol 2 (b) vol 2 3 (c) vol 2 3 4.",
      steps: [
        { m: "(a) ℤ → ℤ → ℤ — a function giving the volume of any box of length 2", mk: "1" },
        { m: "(b) ℤ → ℤ — the volume of a 2 × 3 base for any height", mk: "1" },
        { m: "(c) ℤ — the value 24", mk: "1" }
      ], result: "two arguments left, one left, none" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe partial application", "Fix some arguments · a NEW FUNCTION · that takes the remaining arguments."],
      ["Describe how f could be partially applied", "The general description PLUS what the specific new function does (\"adds 4 to its argument\")."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Fix, Function, Fewer\"", body: "Partial application: **Fix** some arguments → a new **Function** → with **Fewer** arguments. The three mark points, in order." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Saying the function is \"applied to its arguments\" (all of them).", "Describing only an example with no general description (max 2).", "Mixing 4 and 6 halfway through the answer."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.12.1.1 types written A → B → C; 4.12.1.2 the result is a first-class function; 4.12.2.1 map (add 4) and filter (< 10) use partial application; 4.12.1.5 composition also builds new functions." } }
  ],
  flashcards: [
    ["add: integer → (integer → integer) means…", "add takes an integer and returns a function from integer to integer.", 1],
    ["Can the brackets be dropped?", "Yes — integer → integer → integer; arrows associate to the right.", 2],
    ["What is add 4?", "A function that adds 4 to its argument.", 3],
    ["(add 4) 6?", "10.", 4],
    ["Type of vol 2 3 if vol: ℤ→ℤ→ℤ→ℤ?", "ℤ → ℤ.", 5],
    ["Three mark points for describing partial application?", "Arguments fixed; a new function; with fewer/remaining arguments.", 6],
    ["Partial application in C#?", "A curried Func: add = x => y => x + y; add(4) is a new function.", 7]
  ],
  quiz: [
    { q: "add 4 evaluates to", opts: ["a function", "4", "an error", "a list"], ans: 0, why: "One argument still needed." },
    { q: "If f: A → B → C → D, f a b has type", opts: ["C → D", "D", "B → C → D", "A → D"], ans: 0, why: "Two arguments removed." },
    { q: "\"The function is applied to its arguments\" describes", opts: ["ordinary application, not partial", "partial application", "composition", "folding"], ans: 0, why: "R. in 2025." },
    { q: "map (* 2) [1,2,3] gives", opts: ["[2,4,6]", "[1,2,3,2]", "12", "[3,4,5]"], ans: 0, why: "(* 2) is a partially applied ×." }
  ]
};

/* =====================================================================
   4.12.1.5  Composition of functions
   ===================================================================== */
C["compsci:4.12.1.5"] = {
  notes: [
    { h: "Composition of functions — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.12.1.5)", body: ["Know what is meant by **composition of functions**: combining two functions to get a new function. Given $f: A \\to B$ and $g: B \\to C$, $g \\circ f$ has domain A and co-domain C.", "**F is applied first**, then g to its result."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Evaluate a composition", "What is the result", "1", "A-level 2019 Q07.2"],
      ["Purpose of a composed function", "Explain", "1", "A-level 2022 Q12.4"],
      ["Why a re-ordered composition is better", "Explain", "1", "A-level 2022 Q12.5"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Combining two functions**.", "**Order matters**.", "**Composition in code**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Combining two functions" },
    { fig: (function () {
      var it = [];
      it = it.concat(boxAt(20, 40, 90, 50, "x ∈ A", "muted"));
      it = it.concat(arrow(110, 65, 180, 65, null, { c: "text2" }));
      it = it.concat(boxAt(180, 35, 120, 60, "f", "accent", "f(x) = x + 2"));
      it = it.concat(arrow(300, 65, 370, 65, "B", { c: "text2" }));
      it = it.concat(boxAt(370, 35, 120, 60, "g", "accent2", "g(y) = y³"));
      it = it.concat(arrow(490, 65, 560, 65, null, { c: "text2" }));
      it = it.concat(boxAt(560, 40, 90, 50, "∈ C", "good"));
      it.push({ poly: [[170, 25], [500, 25], [500, 105], [170, 105]], c: "accent3", w: 1.4, dash: "5 4" });
      it.push(txt(335, 122, "g ∘ f : A → C,   (g ∘ f)(x) = (x + 2)³", { b: true, size: 12, c: "accent3" }));
      return { w: 670, h: 140, items: it, cap: "Read g ∘ f as \"g after f\": the right-hand function runs first. f's outputs must be acceptable inputs for g (co-domain of f = domain of g)." };
    })() },
    { kv: [
      ["Composition", "the operation that combines two functions into a new function"],
      ["g ∘ f", "\"g after f\": $(g \\circ f)(x) = g(f(x))$"],
      ["Requirement", "f: A → B and g: B → C — the co-domain of f must match the domain of g"],
      ["Result type", "g ∘ f: A → C — the domain of f, the co-domain of g"]
    ] },

    { page: "Order matters" },
    { table: { head: ["x", "f(x) = x + 2", "(g ∘ f)(x) = (x + 2)³", "g(x) = x³", "(f ∘ g)(x) = x³ + 2"], rows: [
      ["1", "3", "27", "1", "3"],
      ["−2", "0", "0", "−8", "−6"],
      ["2", "4", "64", "8", "10"]
    ] } },
    { callout: { t: "warn", h: "The right-hand function runs first", body: "square ∘ pred applied to 3 is square(pred 3) = square 2 = **4** — not pred(square 3) = 8. g ∘ f and f ∘ g are different functions in general." } },
    { callout: { t: "miscon", h: "Composition vs nested application", body: "g (f x) APPLIES both functions to x now and gives a value. g ∘ f (Haskell g . f) BUILDS a new function, without any argument yet, that can be named, passed to map, or applied later." } },

    { page: "Composition in code" },
    { code: { lang: "text", src: "-- Haskell: the . operator is ∘\nsquare x = x * x\npred' x = x - 1\nsquareOfPred = square . pred'    -- a new function\nsquareOfPred 3                   -- 4\nmap (square . pred') [1, 2, 3]   -- [0, 1, 4]", cap: "square . pred' builds the composed function; nothing is computed until it is applied." } },
    { code: { lang: "csharp", src: "Func<A, C> Compose<A, B, C>(Func<B, C> g, Func<A, B> f) => x => g(f(x));\nFunc<int, int> square = x => x * x;\nFunc<int, int> pred = x => x - 1;\nConsole.WriteLine(Compose(square, pred)(3));   // 4", cap: "C# has no ∘ operator, but a higher-order Compose builds one (compiled and run)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "square ∘ pred applied to 3", src: "A-level June 2019 · P2 Q07.2 · 1 mark",
      q: "square(x) = x² and pred(x) = x − 1, both on the integers. What is the result of applying square ∘ pred to the argument 3?",
      steps: [{ m: "pred first: pred(3) = 2; then square: square(2) = 4;" }, { m: "4;", mk: "1 mark" }], result: "4" } },
    { worked: { tag: "exam", title: "The purpose of fz", src: "A-level June 2022 · P2 Q12.4 · 1 mark",
      q: "temps = [50, 68, 95, 86]; fu a = (a - 32) * 5 / 9; fv b = map fu b; fw [] = 0; fw (x:xs) = 1 + fw (xs); fx [] = 0; fx (x:xs) = x + fx (xs); fy c = fx (c) / fw (c); fz d = fy (fv (d)). Explain the purpose of the function fz.",
      steps: [
        { m: "fu converts °F to °C; fv converts every item of a list; fw counts the items; fx sums them; fy divides the sum by the count — the mean." },
        { m: "fz calculates the average temperature in centigrade from a list of temperatures in Fahrenheit;", mk: "1 mark", n: "NE. \"calculates the average of a list of numbers\" — say centigrade from Fahrenheit." }
      ], result: "Mean temperature in °C" } },
    { worked: { tag: "exam", title: "A better composition", src: "A-level June 2022 · P2 Q12.5 · 1 mark",
      q: "With the functions of the temperature program, it is proposed to change fz to fz d = fu (fy (d)). Explain why this new definition could be considered an improvement over fz d = fy (fv (d)).",
      steps: [
        { m: "New: average the Fahrenheit values first, then convert once: fu (fy d) = fu 74.75 = 23.75 — the same answer, because the conversion is linear." },
        { m: "Only one conversion from Fahrenheit to centigrade is done (instead of one per temperature) / fv is no longer needed;", mk: "1 mark", n: "A. fewer calculations or function calls; NE. \"faster\" or \"more efficient\" alone." }
      ], result: "One conversion instead of n" } },
    { worked: { tag: "variation", title: "Types of a composition", q: "length: [Char] → ℕ and isEven: ℕ → Bool. (a) Is isEven ∘ length valid, and what is its type? (b) Is length ∘ isEven valid? (c) Evaluate (isEven ∘ length) \"exam\".",
      steps: [
        { m: "(a) valid — length's co-domain ℕ is isEven's domain; type [Char] → Bool", mk: "1" },
        { m: "(b) not valid — isEven outputs a Boolean, but length needs a list", mk: "1" },
        { m: "(c) length \"exam\" = 4; isEven 4 = True", mk: "1" }
      ], result: "[Char] → Bool; invalid; True" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["What is the result of g ∘ f on x", "Apply f FIRST, then g."],
      ["Explain the purpose", "Say what it does in the context's terms (\"average temperature in centigrade from Fahrenheit\")."],
      ["Explain why better", "Fewer conversions / calculations / calls — NE. \"more efficient\"."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"g ∘ f — read it as g AFTER f\"", body: "The function nearest the argument runs first, just as in g(f(x)). Types chain: A —f→ B —g→ C." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Applying the left function first (8 instead of 4).", "\"More efficient\" without saying fewer conversions.", "Composing functions whose types do not chain."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.12.1.1 domains and co-domains must chain; 4.12.2.1 pipelines like fold (+) 0 (map square xs); 4.11.1 composing results across servers; Maths composite functions fg(x) use the same order." } }
  ],
  flashcards: [
    ["Composition?", "Combining two functions to get a new function."],
    ["(g ∘ f)(x) = ?", "g(f(x)) — f applied first."],
    ["Type of g ∘ f if f: A → B, g: B → C?", "A → C."],
    ["What is (square ∘ pred) 3, where pred subtracts 1 and square squares?", "4."],
    ["f(x)=x+2, g(y)=y³: (g ∘ f)(x)?", "(x + 2)³."],
    ["Haskell composition operator?", "The full stop: g . f."],
  ],
  quiz: [
    { q: "(f ∘ g)(1) with f(x)=x+2, g(y)=y³", opts: ["3", "27", "9", "1"], ans: 0, why: "g first: 1, then +2." },
    { q: "In g ∘ f, which function runs first?", opts: ["f", "g", "both at once", "whichever is shorter"], ans: 0, why: "g after f." },
    { q: "For g ∘ f to be valid", opts: ["f's co-domain must match g's domain", "f and g must be the same", "g must be recursive", "both must be on ℝ"], ans: 0, why: "Types chain." },
    { q: "square . pred in Haskell is", opts: ["a new function", "the number 4", "an error", "a list"], ans: 0, why: "Composition builds a function." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
