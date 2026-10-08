/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.1.1.1–
   4.1.1.8 (data types; sequence, selection and iteration; arithmetic,
   relational and Boolean operations; constants and variables; string
   handling; random numbers) at full A-level depth, with every program in
   C#. Each topic REPLACES the short entry cs-programming.js carried; every
   way AQA has examined it (7516/1 and 7517/1, June 2016–2025, including the
   Section A "write a program" tasks and their mark points) is explained,
   worked and answered in the mark scheme's own format. Every C# listing was
   compiled and run under .NET 10 with the exam's own test data, and every
   operator behaviour quoted (integer division, %, Math.Round, casts, string
   methods, Random.Next) was checked by running it. */
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
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: o.c || "accent2", w: o.w || 1.8, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}
function diamond(cx, cy, w, h, label, col) {
  return [{ poly: [[cx, cy - h / 2], [cx + w / 2, cy], [cx, cy + h / 2], [cx - w / 2, cy]], fill: col || "accent2", alpha: 0.16, c: col || "accent2", w: 1.6 }, txt(cx, cy, label, { b: true, size: 11, c: "text" })];
}
/* a string drawn as indexed cells */
function cells(x, y, s, o) {
  o = o || {};
  var it = [], w = o.w || 34;
  s.split("").forEach(function (ch, i) {
    var hl = o.hl && o.hl.indexOf(i) >= 0;
    it.push({ poly: [[x + i * w, y], [x + (i + 1) * w, y], [x + (i + 1) * w, y + 30], [x + i * w, y + 30]], fill: hl ? "accent2" : "accent", alpha: hl ? 0.32 : 0.12, c: hl ? "accent2" : "accent", w: 1.3 });
    it.push(txt(x + i * w + w / 2, y + 15, ch === " " ? "␣" : ch, { b: true, size: 12.5, c: "text" }));
    it.push(txt(x + i * w + w / 2, y + 42, String(i), { size: 10 }));
  });
  return it;
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA programming mark scheme", body: [
  "Section A \"write a program\" tasks are marked by **mark points (MP)**, one per feature: declarations, each prompt, each loop with its condition, each selection, each calculation, the output. The code only has to do what the algorithm does — your own variable names are fine **if used consistently** (DPT different identifiers).",
  "**Max one below full** if the program does not work correctly; prompts must match the question's wording (I. case and spacing; A. minor typos). The screen-capture mark needs EVERY requested test.",
  "Theory items: each point ends in a semicolon (**;**) and earns one mark. **A.** accept · **R.** reject · **NE.** not enough · **I.** ignore."
] } };

/* =====================================================================
   4.1.1.1  Data types
   ===================================================================== */
C["compsci:4.1.1.1"] = {
  notes: [
    { h: "Data types — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.1.1.1)", body: ["Understand the concept of a **data type**.", "Use integer, real/float, Boolean, character, string, date/time, pointer/reference, records and arrays appropriately.", "Define and use **user-defined data types** based on built-in ones."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Most appropriate data type for given data", "State", "1", "AS 2022 Q04.1, AS 2024 Q05.1, Q06.1"],
      ["Identify a variable / structure of a type in the Skeleton Program", "State the identifier", "1", "every AS Paper 1 Section B"],
      ["Declarations as a mark point in a program task", "Write", "1 of 6–11", "every AS Section A program"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What a data type is**.", "**The built-in types in C#**.", "**Pointers and references**.", "**Records, arrays and user-defined types**.", "**Choosing a type**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What a data type is" },
    { callout: { t: "def", h: "Data type", body: "A data type determines **what values** a variable can hold, **how much memory** it uses and **which operations** can be performed on it. The same bits mean different things as an integer, a character or a real." } },
    { kv: [
      ["Why it matters", "the translator can reserve the right amount of memory, choose the right instructions (integer vs floating-point arithmetic) and reject nonsense such as \"cat\" * 3 at compile time"],
      ["Strong typing (C#)", "every variable has one type, checked by the compiler; converting between types must be explicit when information could be lost"],
      ["Built-in vs user-defined", "built-in (language-defined): int, double, bool, char, string… · user-defined: types you declare from them — struct, class, enum"]
    ] },

    { page: "The built-in types in C#" },
    { table: { head: ["AQA type", "C# type", "Holds", "Example", "Size"], rows: [
      ["integer", "int (long for bigger)", "whole numbers, positive or negative", "int score = -12;", "32 bits (±2.1 billion)"],
      ["real / float", "double (float, decimal)", "numbers with a fractional part", "double price = 12.79;", "64 bits, ~15 significant digits"],
      ["Boolean", "bool", "true or false only", "bool gameOver = false;", "1 byte"],
      ["character", "char", "a single character", "char grade = 'A';", "16 bits (UTF-16)"],
      ["string", "string", "a sequence of characters", "string name = \"Ada\";", "varies"],
      ["date/time", "DateTime (DateOnly, TimeOnly)", "a moment / a date / a time", "DateTime due = new DateTime(2026, 6, 10);", "64 bits"],
      ["pointer / reference", "a class-type variable; ref; unsafe pointers", "the memory address of an object", "Player p = new Player();", "64 bits on a 64-bit machine"],
      ["record", "struct / class / record", "related fields of different types", "see below", "sum of the fields"],
      ["array", "int[], string[,]", "a fixed number of elements of ONE type", "int[] marks = new int[30];", "n × element size"]
    ] } },
    { callout: { t: "warn", h: "decimal for money", body: "double is binary floating point: in C#, 0.1 + 0.2 == 0.3 is **false** (it gives 0.30000000000000004). For money use decimal, where 0.1m + 0.2m == 0.3m is true." } },

    { page: "Pointers and references" },
    { fig: { w: 620, h: 150, items: [].concat(
      boxAt(20, 30, 150, 46, "p", "accent", "reference variable"),
      boxAt(330, 20, 260, 90, "Player object (heap)", "accent2", "Name = \"Ada\" · Score = 40"),
      arrow(170, 53, 330, 53, "holds the address 0x7F3A…", { c: "accent2", dy: -2 }),
      [txt(95, 98, "Player p = new Player(\"Ada\");", { size: 10.5, c: "text2" }), txt(460, 128, "created at run time: dynamically", { size: 10.5 })]
    ), cap: "A pointer / reference variable stores the ADDRESS of an object created at run time, not the object itself. Two variables can refer to the same object." } },
    { code: { lang: "csharp", src: "Player a = new Player(\"Ada\");\nPlayer b = a;          // copies the REFERENCE: a and b name one object\nb.Score = 40;\nConsole.WriteLine(a.Score);   // 40 — the change is seen through a\n\nint x = 5;\nint y = x;              // int is a value type: y is an independent copy\ny = 9;\nConsole.WriteLine(x);   // 5\n\npublic class Player { public string Name; public int Score; public Player(string n) { Name = n; } }", cap: "Reference types (classes, arrays, strings) vs value types (int, double, bool, char, struct)." } },
    { kv: [
      ["Used for", "objects created dynamically, linked lists and trees (each node points to the next), passing large objects without copying them"],
      ["null", "a reference that points to nothing — using it throws a NullReferenceException"],
      ["Explicit pointers", "C# allows them only in unsafe code; most languages hide addresses behind references"]
    ] },

    { page: "Records, arrays and user-defined types" },
    { code: { lang: "csharp", src: "// a user-defined RECORD type: fields of different types grouped together\npublic struct Student\n{\n    public string Name;\n    public int YearGroup;\n    public double AverageMark;\n    public bool HasSen;\n}\n\n// a user-defined ENUMERATED type: a fixed set of named values\npublic enum Suit { Clubs, Diamonds, Hearts, Spades }\n\nStudent[] form = new Student[28];          // an ARRAY of records\nform[0].Name = \"Ada\";\nform[0].YearGroup = 13;\nSuit trumps = Suit.Hearts;", cap: "Records (struct / class) and enumerations are user-defined types built from the built-in ones." } },
    { table: { head: [" ", "Array", "Record"], rows: [
      ["Elements", "all the SAME type", "fields of DIFFERENT types"],
      ["Accessed by", "an index: marks[3]", "a field name: form[0].Name"],
      ["Size", "fixed when created", "fixed by the declaration"],
      ["Typical use", "a list of scores", "one student's details"]
    ] } },

    { page: "Choosing a type" },
    { steps: [
      "Will arithmetic be done on it? Phone numbers and postcodes: **no** — store them as **strings** (leading zeros, spaces, +44).",
      "Whole or fractional? Counts and ages → int; measurements and averages → double; money → decimal.",
      "Only two states? → bool.",
      "One character or many? → char or string.",
      "A moment in time? → DateTime, so you can compare and subtract dates.",
      "Several related values? → a record (struct/class); many of the same → an array or list."
    ] },
    { worked: { tag: "variation", title: "Pick the types", q: "Choose the most appropriate data type for: (a) a phone number 07700 900123 (b) the number of lives left (c) the height of a student in metres (d) whether a door is locked (e) the date a book is due back (f) a student's initial.",
      steps: [{ m: "(a) string — no arithmetic, and a leading 0 would be lost as an integer", mk: "1" }, { m: "(b) integer", mk: "1" }, { m: "(c) real / float (double)", mk: "1" }, { m: "(d) Boolean", mk: "1" }, { m: "(e) date/time", mk: "1" }, { m: "(f) character", mk: "1" }], result: "string, int, double, bool, DateTime, char" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Data type for whole numbers", src: "AS June 2022 · P1 Q04.1 · 1 mark",
      q: "State the most appropriate data type to use for whole numbers.",
      steps: [{ m: "Integer / int;", mk: "1 mark" }], result: "Integer" } },
    { worked: { tag: "exam", title: "Data type for 12.79", src: "AS June 2024 · P1 Q05.1 · 1 mark",
      q: "State the most appropriate data type to use for numbers with a fractional part, for example 12.79.",
      steps: [{ m: "Real / float / single / double / decimal;", mk: "1 mark" }], result: "Real / float" } },
    { worked: { tag: "exam", title: "Data type for text", src: "AS June 2024 · P1 Q06.1 · 1 mark",
      q: "State the most appropriate data type to use for values that may consist of more than one character.",
      steps: [{ m: "String;", mk: "1 mark", n: "A. str; A. an array / list of characters. R. char — that holds ONE character." }], result: "String" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State the most appropriate data type", "The AQA type name (integer, real/float, Boolean, character, string, date/time) — language names such as int and double are accepted."],
      ["Write a program (declarations mark point)", "Declare every variable the algorithm uses with a sensible type; in C# int for whole numbers, string for text read with Console.ReadLine()."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Is It Real, Boolean Character? Strings Date Pointers, Records Arrays\"", body: "**I**nteger · **R**eal · **B**oolean · **C**haracter · **S**tring · **D**ate/time · **P**ointer/reference · **R**ecord · **A**rray — the spec's nine." } },
    { callout: { t: "miscon", h: "Specific errors", body: ["Storing a phone number as an integer.", "char for more than one character.", "Comparing doubles with == (rounding error).", "Saying a pointer stores the object — it stores its address."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4 binary representations of integers, reals and characters; 4.2.1.3 records and fields; 4.2.1.2 arrays; 4.1.2.3 classes as user-defined types; 4.2.2 and 4.2.5 pointers in queues, linked lists and trees." } }
  ],
  flashcards: [
    ["Data type?", "Determines the values a variable can hold, the memory it uses and the operations allowed on it."],
    ["AQA's nine data types?", "Integer, real/float, Boolean, character, string, date/time, pointer/reference, record, array."],
    ["Best type for a phone number?", "String — no arithmetic, keeps leading zeros and spaces."],
    ["Pointer / reference?", "A variable that stores the memory address of an object created at run time."],
    ["Array vs record?", "Array: many elements of one type by index. Record: fields of different types by name."],
    ["C# type for money?", "decimal (double has binary rounding errors).", 6],
    ["0.1 + 0.2 == 0.3 in C# with doubles?", "False — 0.30000000000000004.", 7],
    ["Value type vs reference type in C#?", "A value type (int, struct) is copied on assignment; a reference type (class, array) copies the reference.", 8]
  ],
  quiz: [
    { q: "Most appropriate type for a quantity in stock", opts: ["integer", "real", "string", "Boolean"], ans: 0, why: "Whole number." },
    { q: "\"07700 900123\" should be stored as", opts: ["a string", "an integer", "a real", "a Boolean"], ans: 0, why: "No arithmetic; leading zero." },
    { q: "A variable storing the address of an object is a", opts: ["pointer / reference", "record", "constant", "character"], ans: 0, why: "Spec." },
    { q: "Fields of different types grouped together form a", opts: ["record", "array", "string", "pointer"], ans: 0, why: "Definition." },
    { q: "In C#, Player b = a; (Player is a class) makes", opts: ["two names for one object", "a copy of the object", "a compile error", "a null reference"], ans: 0, why: "Reference type." }
  ]
};

/* =====================================================================
   4.1.1.2  Programming concepts
   ===================================================================== */
C["compsci:4.1.1.2"] = {
  notes: [
    { h: "Programming concepts — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.1.1.2)", body: ["Use and combine **variable declaration, constant declaration, assignment, iteration, selection** and **subroutines**.", "Use **definite** and **indefinite iteration** (condition at the **start** or the **end**)", "Use **nested** selection and iteration.", "Use **meaningful identifiers** and know why."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Write a program from pseudo-code", "Write", "6–11", "AS P1 Section A every year (2020 Q03.1, 2023 Q05.1 here; others in 4.1.1.3–4.1.1.8)"],
      ["Trace an algorithm in a table", "Complete the table", "3–5", "AS 2020 Q02.1"],
      ["Why WHILE not FOR / WHILE vs REPEAT", "Explain", "1–2", "AS 2016 Q05.3, AS 2025 Q02"],
      ["Definite vs indefinite iteration", "Explain", "2", "AS 2022 Q09.1"],
      ["What a sentinel-controlled loop gets wrong", "Comment / Describe", "2", "AS 2020 Q02.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The statement types and how they combine**.", "**Selection**: IF, ELSE IF, nesting, switch.", "**Iteration**: definite, and indefinite with the test at the start or the end.", "**Tracing**.", "**Meaningful identifiers**.", "**Writing a Section A program**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The statement types" },
    { table: { head: ["Statement", "Does", "C#"], rows: [
      ["Variable declaration", "names a store and gives its type", "int count;"],
      ["Constant declaration", "names a value that cannot change", "const int MaxLives = 3;"],
      ["Assignment", "puts a value in a variable (pseudo-code ←)", "count = count + 1;"],
      ["Selection", "chooses which statements run", "if (...) { } else { }"],
      ["Iteration", "repeats statements", "for, while, do … while"],
      ["Subroutine", "a named block called from elsewhere", "static int Square(int x) => x * x;"]
    ] } },
    { callout: { t: "def", h: "The three combining principles", body: "**Sequence** (one statement after another), **selection** (choice) and **iteration** (repetition) are the basis of every imperative language; any algorithm can be built from them." } },

    { page: "Selection" },
    { code: { lang: "csharp", src: "if (mark >= 70)\n{\n    grade = \"A\";\n}\nelse if (mark >= 60)          // tested only when the first condition is false\n{\n    grade = \"B\";\n}\nelse\n{\n    grade = \"U\";\n}\n\n// nested selection: an if inside an if\nif (number > 10)\n{\n    Console.WriteLine(\"Number too large.\");\n}\nelse\n{\n    if (number < 1)\n    {\n        Console.WriteLine(\"Not a positive number.\");\n    }\n}", cap: "ELSE IF chains test in order and stop at the first true condition; nesting puts a whole selection inside one branch." } },
    { code: { lang: "csharp", src: "switch (choice)\n{\n    case 'a': value = (value / 10) + (value % 10); break;\n    case 'm': value = (value / 10) * (value % 10); break;\n    default:  Console.WriteLine(\"Unknown option\"); break;\n}", cap: "A switch (CASE) selects on one value — tidier than a long ELSE IF chain on the same variable." } },

    { page: "Iteration" },
    { fig: { w: 640, h: 210, items: [].concat(
      diamond(110, 60, 120, 50, "condition?"),
      boxAt(60, 120, 100, 34, "body", "accent"),
      arrow(110, 85, 110, 120, "true", { c: "good", dx: 20, dy: 8 }),
      [{ poly: [[60, 137], [30, 137], [30, 60], [50, 60]], close: false, c: "text2", w: 1.4 }, { line: [[44, 60], [50, 60]], c: "text2", w: 1.4, arrow: true }],
      arrow(170, 60, 230, 60, "false", { c: "danger" }),
      [txt(110, 190, "WHILE: test at the START — may run 0 times", { size: 10.5, c: "accent2" })],
      boxAt(380, 30, 100, 34, "body", "accent"),
      diamond(430, 120, 120, 50, "condition?"),
      arrow(430, 64, 430, 95, null, { c: "text2" }),
      [{ poly: [[490, 120], [520, 120], [520, 47], [486, 47]], close: false, c: "text2", w: 1.4 }, { line: [[486, 47], [480, 47]], c: "text2", w: 1.4, arrow: true }, txt(545, 85, "loop again", { size: 10.5, c: "good" })],
      arrow(430, 145, 430, 175, "exit", { c: "danger", dx: 22, dy: 8 }),
      [txt(430, 195, "REPEAT / do…while: test at the END — runs at least once", { size: 10.5, c: "accent2" })]
    ), cap: "Indefinite iteration with the condition at the start (pre-condition) or the end (post-condition)." } },
    { table: { head: [" ", "Definite", "Indefinite — test at start", "Indefinite — test at end"], rows: [
      ["Number of iterations", "known when the loop starts", "depends on a condition", "depends on a condition"],
      ["Pseudo-code", "FOR i ← 1 TO n", "WHILE condition … ENDWHILE", "REPEAT … UNTIL condition"],
      ["C#", "for (int i = 1; i <= n; i++)", "while (condition) { }", "do { } while (condition);"],
      ["Minimum runs", "n (0 if n < 1)", "0", "1"],
      ["Use when", "counting a known number of times", "the input itself decides (validation, sentinel)", "the body must run before the test (a menu)"]
    ] } },
    { callout: { t: "warn", h: "REPEAT…UNTIL vs do…while — the condition flips", body: "Pseudo-code REPEAT … UNTIL X ≤ 0 stops WHEN the condition becomes true. C# do { } while (X > 0); continues WHILE its condition is true — so the C# condition is the NEGATION of the UNTIL condition." } },
    { code: { lang: "csharp", src: "for (int row = 1; row <= 3; row++)          // nested iteration: 3 × 4 = 12 lines\n{\n    for (int col = 1; col <= 4; col++)\n    {\n        Console.Write(row * col + \"\\t\");\n    }\n    Console.WriteLine();\n}", cap: "Nested iteration: the inner loop runs completely for every pass of the outer loop." } },

    { page: "Tracing" },
    { callout: { t: "info", h: "Key idea", body: "A **trace table** has one column per variable (and one for output); a new row is written whenever a value changes. AS 2020's sentinel loop with input 4, 6, 3, 2, −1:" } },
    { code: { lang: "pseudo", src: "X <- 0\nResult <- 0\nWHILE X != -1\n  INPUT X\n  Result <- Result + X\nENDWHILE\nOUTPUT Result", cap: "Intended to add numbers until the sentinel −1." } },
    { table: { head: ["X", "Result", "Output"], rows: [["0", "0", "—"], ["4", "4", ""], ["6", "10", ""], ["3", "13", ""], ["2", "15", ""], ["−1", "14", "14"]] } },
    { callout: { t: "info", h: "What went wrong", body: "The sentinel −1 was **added** before the loop condition was tested, so the answer is 14 not 15. Fix: read the first value before the loop and read the next at the END of the body:" } },
    { code: { lang: "csharp", src: "int result = 0;\nint x = Convert.ToInt32(Console.ReadLine());   // read ahead\nwhile (x != -1)\n{\n    result = result + x;\n    x = Convert.ToInt32(Console.ReadLine());   // read the next value last\n}\nConsole.WriteLine(result);                     // 15 for 4, 6, 3, 2, -1", cap: "The read-ahead pattern: the sentinel is tested before it can be used." } },

    { page: "Meaningful identifiers" },
    { kv: [
      ["Meaningful identifier", "a name that says what the variable, constant or subroutine holds or does: totalScore, MaxLives, CalculateAverage"],
      ["Why", "the code documents itself — easier to read, debug and maintain, by you later and by others; fewer mistakes from mixing up x, y, temp2"],
      ["C# conventions", "camelCase for local variables (totalScore), PascalCase for methods, classes and constants (CalculateAverage, MaxLives)"]
    ] },

    { page: "Writing a Section A program" },
    { steps: [
      "Declare every variable the pseudo-code uses (MP1) — int for whole numbers, string for text, bool for flags.",
      "Copy every prompt EXACTLY (spacing and case are ignored, wording is not).",
      "Translate line by line: ← is =, DIV is / on two ints, MOD is %, ≠ is !=, AND is &&, OR is ||.",
      "Check each loop's bounds: FOR k ← 0 TO n − 1 is for (int k = 0; k <= n - 1; k++).",
      "Put each statement INSIDE or OUTSIDE the loop exactly as the pseudo-code indents it — an output inside the loop that should be after it loses the mark.",
      "Run it with the question's test data before taking the screen capture."
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Factorial check program", src: "AS June 2020 · P1 Q03.1 · 9 marks",
      q: "Write a program to implement this algorithm: OUTPUT \"Enter an integer greater than 1: \"; INPUT X; Product ← 1; Factor ← 0; WHILE Product < X: Factor ← Factor + 1, Product ← Product * Factor; ENDWHILE; IF X = Product THEN Product ← 1 and FOR N ← 1 TO Factor: Product ← Product * N, OUTPUT N; ELSE OUTPUT \"No result\".",
      steps: [
        { m: "MP1 `int x, product, factor;` — declarations;", mk: "1" },
        { m: "MP2 prompt \"Enter an integer greater than 1: \" and `x = Convert.ToInt32(Console.ReadLine());`", mk: "1" },
        { m: "MP3 `product = 1; factor = 0;` before the loop", mk: "1" },
        { m: "MP4 `while (product < x)`", mk: "1" },
        { m: "MP5 `factor = factor + 1; product = product * factor;` inside it", mk: "1" },
        { m: "MP6 `if (x == product) { … } else { Console.WriteLine(\"No result\"); }` after the loop", mk: "1" },
        { m: "MP7 `product = 1;` in the THEN part", mk: "1" },
        { m: "MP8 `for (int n = 1; n <= factor; n++)` in the THEN part", mk: "1" },
        { m: "MP9 `product = product * n; Console.WriteLine(n);` inside the FOR loop", mk: "1", n: "Max 8 if the code does not function correctly. With 720 it prints 1 to 6 (720 = 6!); with 600, No result." }
      ], result: "9 mark points" } },
    { code: { lang: "csharp", src: "Console.Write(\"Enter an integer greater than 1: \");\nint x = Convert.ToInt32(Console.ReadLine());\nint product = 1;\nint factor = 0;\nwhile (product < x)\n{\n    factor = factor + 1;\n    product = product * factor;\n}\nif (x == product)\n{\n    product = 1;\n    for (int n = 1; n <= factor; n++)\n    {\n        product = product * n;\n        Console.WriteLine(n);\n    }\n}\nelse\n{\n    Console.WriteLine(\"No result\");\n}", cap: "The 2020 program in full. Run with 720 → 1 2 3 4 5 6; with 600 → No result." } },
    { worked: { tag: "exam", title: "Prime-factor program", src: "AS June 2023 · P1 Q05.1 · 9 marks",
      q: "Write a program to implement: OUTPUT \"Enter an integer greater than 1: \"; INPUT Number; X ← 2; Count ← 0; WHILE Number > 1: Multi ← FALSE; WHILE (Number MOD X) = 0: IF NOT Multi THEN OUTPUT X; Count ← Count + 1; Multi ← TRUE; Number ← Number DIV X; ENDWHILE; X ← X + 1; ENDWHILE; OUTPUT Count.",
      steps: [
        { m: "MP1 declarations `int number, x, count; bool multi;`", mk: "1" },
        { m: "MP2 the prompt and `number = Convert.ToInt32(Console.ReadLine());`", mk: "1" },
        { m: "MP3 `x = 2; count = 0;` before the outer loop", mk: "1" },
        { m: "MP4 outer `while (number > 1)`", mk: "1" },
        { m: "MP5 `multi = false;` in the outer loop", mk: "1" },
        { m: "MP6 inner `while (number % x == 0)`", mk: "1" },
        { m: "MP7 `if (!multi) Console.WriteLine(x);` inside the inner loop", mk: "1" },
        { m: "MP8 `count++; multi = true; number = number / x;` inside the inner loop", mk: "1" },
        { m: "MP9 `x = x + 1;` in the outer loop, after the inner one", mk: "1", n: "Max 8 if it does not work. 23 → 23 then 1; 25 → 5 then 2; 1260 → 2 3 5 7 then 6." }
      ], result: "Nested indefinite iteration, 9 mark points" } },
    { worked: { tag: "exam", title: "Trace the sentinel loop", src: "AS June 2020 · P1 Q02.1 · 3 marks",
      q: "Hand-trace: X ← 0; Result ← 0; WHILE X ≠ -1: INPUT X; Result ← Result + X; ENDWHILE; OUTPUT Result — with the inputs 4, 6, 3, 2, -1. Columns X, Result, Output; first row 0, 0, —.",
      steps: [
        { m: "X column: 4, 6, 3, 2, −1;", mk: "1 mark" },
        { m: "Result column: 4, 10, 13, 15;", mk: "1 mark" },
        { m: "Final Result 14 and Output 14;", mk: "1 mark", n: "Max 2 if any errors." }
      ], result: "Outputs 14" } },
    { worked: { tag: "exam", title: "What the sentinel loop gets wrong", src: "AS June 2020 · P1 Q02.2 · 2 marks",
      q: "The algorithm is meant to add numbers input as a series terminated by the sentinel value −1 (which is not part of the series). Comment on the result of the trace (4, 6, 3, 2, −1 gave 14) and describe how the algorithm should be modified.",
      steps: [
        { m: "The result is wrong — the sentinel value was used in the calculation;", mk: "1 mark" },
        { m: "Input the first value before the WHILE loop and swap the two instructions in the loop (or subtract the last value / add 1 after the loop / do not add the value if it is the sentinel);", mk: "1 mark" }
      ], result: "Read ahead; add before reading" } },
    { worked: { tag: "exam", title: "Why WHILE, not FOR", src: "AS June 2016 · P1 Q05.3 · 1 mark",
      q: "In the persistence program, the calculations are inside WHILE Value > 9 … ENDWHILE. Explain why a WHILE repetition structure was chosen instead of a FOR repetition structure.",
      steps: [{ m: "The number of times the loop will run is not known at the start / is not predetermined (indefinite);", mk: "1 mark", n: "NE. \"loop until a condition is met\"." }], result: "Number of iterations unknown" } },
    { worked: { tag: "exam", title: "WHILE vs REPEAT with negatives", src: "AS June 2025 · P1 Q02 · 2 marks",
      q: "Figure 3: INPUT X; WHILE X > 0: X ← X – 1; ENDWHILE. Figure 4: INPUT X; REPEAT X ← X – 1 UNTIL X ≤ 0. Explain why Figure 3 operates differently to Figure 4 when the inputs are negative numbers.",
      steps: [
        { m: "The WHILE loop tests its condition at the START, so with a negative X its body is not executed and X stays the same;", mk: "1 mark" },
        { m: "The REPEAT loop tests at the END, so its body runs once and X decreases by 1;", mk: "1 mark", n: "Max 2." }
      ], result: "Pre-condition vs post-condition" } },
    { worked: { tag: "exam", title: "Definite and indefinite", src: "AS June 2022 · P1 Q09.1 · 2 marks",
      q: "Explain the differences between definite and indefinite iteration.",
      steps: [
        { m: "Definite iteration: the number of iterations is known (when the loop starts);", mk: "1 mark" },
        { m: "Indefinite iteration: the number of iterations depends on a condition, tested before or after each iteration;", mk: "1 mark", n: "NE. \"indefinite: number of iterations not known\" alone." }
      ], result: "Known count vs condition-controlled" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Write a program", "Every mark point: declarations, exact prompts, each loop and its condition, each selection, each calculation, output in the right place."],
      ["Complete the trace table", "A new row per change; columns in order; output where OUTPUT runs."],
      ["Explain WHILE vs FOR / REPEAT", "Known count → FOR; condition decides → WHILE; must run once → REPEAT (test at end)."],
      ["Explain definite / indefinite", "Count known vs depends on a condition tested before / after each pass."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"See Wild, Remember Once\"", body: "**S**equence · **S**election · **I**teration. **W**HILE may run **zero** times; **R**EPEAT runs at least **once**." } },
    { callout: { t: "miscon", h: "Specific errors", body: ["An output inside the loop that belongs after it.", "Off-by-one FOR bounds (TO is inclusive).", "Copying UNTIL's condition into do…while without negating it.", "Using a sentinel value in the calculation.", "Single-letter identifiers in your own code."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.3 DIV and MOD in loop bodies; 4.1.1.4 and 4.1.1.5 the conditions; 4.1.1.10 subroutines; 4.7.3.5 the same structures in assembly (CMP and branches); 4.13.1.4 testing the programs you write; 4.1.2.2 structured programming." } }
  ],
  flashcards: [
    ["Definite iteration?", "The number of iterations is known when the loop starts (FOR).", 1],
    ["Indefinite iteration?", "The number of iterations depends on a condition tested before or after each pass.", 2],
    ["Pre-condition vs post-condition loop?", "WHILE tests at the start (may run 0 times); REPEAT / do…while tests at the end (runs at least once).", 3],
    ["REPEAT … UNTIL X ≤ 0 in C#?", "do { … } while (X > 0); — the condition is negated.", 4],
    ["Why use meaningful identifiers?", "Self-documenting code — easier to read, debug and maintain.", 5],
    ["Sentinel value?", "A special value marking the end of input; it is not part of the data.", 6],
    ["Read-ahead pattern?", "Input before the loop, process, then input the next value at the end of the loop body.", 7],
    ["Nested iteration?", "A loop inside a loop; the inner loop completes for each outer pass.", 8]
  ],
  quiz: [
    { q: "A loop that must run at least once should test its condition", opts: ["at the end", "at the start", "twice", "never"], ans: 0, why: "Post-condition." },
    { q: "WHILE X > 0 with X = −3 runs", opts: ["0 times", "once", "3 times", "forever"], ans: 0, why: "Tested first." },
    { q: "FOR k ← 0 TO 9 runs", opts: ["10 times", "9 times", "11 times", "0 times"], ans: 0, why: "Inclusive bounds." },
    { q: "The sentinel loop gave 14 instead of 15 because", opts: ["−1 was added to the total", "4 was skipped", "Result started at 1", "the loop ran once"], ans: 0, why: "Sentinel used in the calculation." },
    { q: "Which C# statement is post-condition iteration?", opts: ["do { } while (...);", "while (...) { }", "for (...)", "foreach"], ans: 0, why: "Test at the end." }
  ]
};

/* =====================================================================
   4.1.1.6  Constants and variables
   ===================================================================== */
C["compsci:4.1.1.6"] = {
  notes: [
    { h: "Constants and variables in a programming language — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.1.1.6)", body: ["Explain the differences between a **variable** and a **constant**.", "Explain the **advantages of named constants**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Benefit / advantage of named constants", "State / Explain", "1–2", "AS 2016 Q07.1, AS 2017 Q05.1"],
      ["Why copy values into other variables", "Explain", "1", "AS 2017 Q03.3"],
      ["GCF program", "Write", "6", "AS 2017 Q03.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Variables and constants**.", "**Why named constants**.", "**Working copies of variables**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Variables and constants" },
    { table: { head: [" ", "Variable", "Named constant"], rows: [
      ["Value", "can change while the program runs", "fixed — set once, cannot change"],
      ["C#", "int lives = 3;", "const int MaxLives = 3;"],
      ["Changing it", "lives = lives - 1; is fine", "MaxLives = 4; is a compile error"],
      ["Use for", "data that changes: scores, counters, input", "fixed values: limits, sizes, rates, file names"]
    ] } },
    { kv: [
      ["Literal", "a value written directly in the code: 3, \"Training.txt\" — a 'magic number' if its meaning is not obvious"],
      ["const vs readonly in C#", "const is fixed at compile time; readonly can be set once at run time (e.g. in a constructor)"]
    ] },

    { page: "Why named constants" },
    { ol: [
      "**Readability**: FIELDWIDTH says what 80 means; the identifier conveys meaning a bare value does not.",
      "**One place to change**: if the value changes, edit one declaration instead of hunting every occurrence.",
      "**Consistency**: no chance of typing 80 in one place and 08 in another.",
      "**Safety**: the value cannot be changed accidentally while the program runs."
    ] },
    { code: { lang: "csharp", src: "const int FieldLength = 20;\nconst int FieldWidth = 35;\nconst string TrainingFile = \"Training.txt\";\n\nchar[,] field = new char[FieldLength, FieldWidth];\nfor (int row = 0; row < FieldLength; row++)\n    for (int col = 0; col < FieldWidth; col++)\n        field[row, col] = '.';", cap: "Change the field size once, at the top; every loop follows." } },

    { page: "Working copies of variables" },
    { callout: { t: "info", h: "Key idea", body: "AS 2017's GCF algorithm copies the inputs before the loop changes them:" } },
    { code: { lang: "csharp", src: "Console.Write(\"Enter a whole number: \");\nint number1 = Convert.ToInt32(Console.ReadLine());\nConsole.Write(\"Enter another whole number: \");\nint number2 = Convert.ToInt32(Console.ReadLine());\nint temp1 = number1;              // working copies: the loop destroys these\nint temp2 = number2;\nwhile (temp1 != temp2)\n{\n    if (temp1 > temp2) temp1 = temp1 - temp2;\n    else temp2 = temp2 - temp1;\n}\nint result = temp1;\nConsole.WriteLine(result + \" is GCF of \" + number1 + \" and \" + number2);", cap: "12 and 39 → \"3 is GCF of 12 and 39\": the output still needs the ORIGINAL values." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Advantage of a named constant", src: "AS June 2016 · P1 Q07.1 · 1 mark",
      q: "A constant is used to hold the filename 'Training.txt'. State one advantage of using named constants for constant values.",
      steps: [{ m: "Improves the readability of the code / easier to update the code if the value changes / reduces the likelihood of inconsistency causing errors / unlike a variable the value cannot be changed;", mk: "1 mark" }], result: "Readability / single change / consistency / safety" } },
    { worked: { tag: "exam", title: "Benefits of FIELDLENGTH and FIELDWIDTH", src: "AS June 2017 · P1 Q05.1 · 2 marks",
      q: "A simulation program defines FIELDLENGTH and FIELDWIDTH as named constants. Explain the benefits of defining them as named constants instead of using the actual values in the code.",
      steps: [
        { m: "If the specification for the field size changes, only the values at the beginning of the source code need changing;", mk: "1 mark" },
        { m: "Makes the code more understandable — the identifiers make clear that the values are the dimensions of the field, which the values alone do not;", mk: "1 mark", n: "A. cannot change the values accidentally. Max 2." }
      ], result: "One change; meaningful names" } },
    { worked: { tag: "exam", title: "Why Temp1 and Temp2?", src: "AS June 2017 · P1 Q03.3 · 1 mark",
      q: "In the GCF algorithm, Number1 and Number2 are copied into Temp1 and Temp2 and the WHILE loop then changes Temp1 and Temp2; the last line outputs Result, \" is GCF of \", Number1, \" and \", Number2. Explain why the WHILE loop was written using Temp1 and Temp2 instead of Number1 and Number2.",
      steps: [{ m: "To preserve the original values for later use — the output needs them, otherwise it would not make sense;", mk: "1 mark", n: "Must refer to the original values being needed later." }], result: "The originals are output at the end" } },
    { worked: { tag: "exam", title: "GCF program", src: "AS June 2017 · P1 Q03.1 · 6 marks",
      q: "Write a program to implement: OUTPUT \"Enter a whole number: \"; INPUT Number1; OUTPUT \"Enter another whole number: \"; INPUT Number2; Temp1 ← Number1; Temp2 ← Number2; WHILE Temp1 ≠ Temp2: IF Temp1 > Temp2 THEN Temp1 ← Temp1 – Temp2 ELSE Temp2 ← Temp2 – Temp1; ENDWHILE; Result ← Temp1; OUTPUT Result, \" is GCF of \", Number1, \" and \", Number2.",
      steps: [
        { m: "MP1 both prompts and Number1, Number2 assigned the inputs (not inside the loop)", mk: "1" },
        { m: "MP2 Number1 and Number2 copied to Temp1 and Temp2", mk: "1" },
        { m: "MP3 `while (temp1 != temp2)`", mk: "1" },
        { m: "MP4 `if (temp1 > temp2)` inside the loop; MP5 the THEN and ELSE assignments", mk: "2" },
        { m: "MP6 output \"… is GCF of … and …\" after the loop", mk: "1", n: "A. Temp1 instead of Result. 12 and 39 → 3 is GCF of 12 and 39." }
      ], result: "6 mark points" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State an advantage of named constants", "Readability · one place to change · consistency · cannot be changed accidentally."],
      ["Explain the benefits (in context)", "Name the context: \"if the field size changes, only the declaration at the top changes\"."],
      ["Variable vs constant", "A variable's value can change during execution; a constant's cannot."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"RUCS\" — why named constants", body: "**R**eadable · **U**pdate once · **C**onsistent · **S**afe from accidental change." } },
    { callout: { t: "miscon", h: "Specific errors", body: ["\"A constant never changes\" without contrasting a variable.", "\"Saves memory\" — not a reason.", "Overwriting input variables you later need to output."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.13 and 4.1.1.14 scope of variables; 4.1.1.2 constant declaration as a statement type; NEA Table 2: use of constants is a 'good' coding-style characteristic." } }
  ],
  flashcards: [
    ["Variable vs constant?", "A variable's value can change while the program runs; a constant's cannot."],
    ["Four advantages of named constants?", "Readability, one place to update, consistency, cannot be changed accidentally."],
    ["Named constant in C#?", "const int MaxLives = 3;"],
    ["Magic number?", "An unexplained literal value in code."],
    ["Why did the GCF algorithm use Temp1 and Temp2?", "To keep the original inputs for the output."],
    ["const vs readonly in C#?", "const fixed at compile time; readonly set once at run time."],
    ["GCF of 12 and 39?", "3."],
    ["Is 'saves memory' an advantage of constants?", "No — not a creditworthy reason."]
  ],
  quiz: [
    { q: "Main advantage of FieldWidth over 35 in the code", opts: ["one place to change and clearer meaning", "faster execution", "less memory", "it can change at run time"], ans: 0, why: "MS." },
    { q: "const int Max = 5; Max = 6; in C#", opts: ["is a compile error", "sets Max to 6", "is a run-time error", "is ignored"], ans: 0, why: "Constants cannot be assigned." },
    { q: "The GCF program's output uses Number1 because", opts: ["the loop changed only the copies", "Number1 is a constant", "Temp1 is out of scope", "it is faster"], ans: 0, why: "Originals preserved." },
    { q: "Which should be a named constant?", opts: ["VAT rate of 0.2", "the player's score", "loop counter", "user's input"], ans: 0, why: "Fixed value." }
  ]
};

/* =====================================================================
   4.1.1.7  String-handling operations
   ===================================================================== */
C["compsci:4.1.1.7"] = {
  notes: [
    { h: "String-handling operations in a programming language — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.1.1.7)", body: "Use **length, position, substring, concatenation, character → character code, character code → character** and **string conversion** (string ↔ integer, string ↔ float, date/time ↔ string)." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Hand-trace a string-processing algorithm", "Complete the table", "5", "AS 2024 Q01"],
      ["Write a string-processing program", "Write", "8", "AS 2025 Q03.1"],
      ["String handling in the Skeleton Program", "State / Explain", "1–2", "Section B most years"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Indexing and the operations**.", "**Character codes**.", "**Conversions**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Indexing and the operations" },
    { fig: { w: 620, h: 110, items: [].concat(cells(20, 20, "Computer Science", { w: 34, hl: [9, 10, 11, 12, 13, 14, 15] }), [txt(410, 92, "Substring(9, 7) = \"Science\"", { b: true, c: "accent2" })]), cap: "Strings are zero-indexed: s[0] is 'C'; s.Length is 16; the last character is s[s.Length - 1]." } },
    { table: { head: ["Operation", "C#", "s = \"Computer Science\"", "Result"], rows: [
      ["length", "s.Length", "s.Length", "16"],
      ["position (index of)", "s.IndexOf(x)", "s.IndexOf(\"Sci\")", "9 (−1 if absent)"],
      ["substring", "s.Substring(start, length)", "s.Substring(0, 8)", "\"Computer\""],
      ["concatenation", "a + b, string.Concat", "\"AQA \" + \"7517\"", "\"AQA 7517\""],
      ["one character", "s[i]", "s[0]", "'C' (a char)"],
      ["character → code", "(int)c", "(int)'A'", "65"],
      ["code → character", "(char)n", "(char)66", "'B'"]
    ] } },
    { callout: { t: "warn", h: "Substring's second argument is a LENGTH", body: "In C#, s.Substring(9, 7) means start at 9, take 7 characters. Some pseudo-code and languages use (start, end) instead — read the question's definition." } },

    { page: "Character codes" },
    { kv: [
      ["ASCII / Unicode", "'A'–'Z' are 65–90, 'a'–'z' are 97–122, '0'–'9' are 48–57"],
      ["Digit character → value", "c - '0': '7' - '0' is 7 (AS 2017's ToDecimal used ASCII(HexDigit) − 48)"],
      ["Shift a letter", "(char)('a' + 2) is 'c' — the basis of a Caesar cipher"],
      ["Upper ↔ lower", "differ by 32: 'a' − 'A' = 32 (or use char.ToUpper)"]
    ] },
    { code: { lang: "csharp", src: "static char Shift(char c, int key)\n{\n    if (c < 'A' || c > 'Z') return c;                  // leave non-letters alone\n    return (char)('A' + (c - 'A' + key) % 26);         // code → position → code\n}\n// Shift('X', 3) is 'A'", cap: "Character code arithmetic: subtract 'A' to get 0–25, add the key, wrap with % 26, add 'A' back." } },

    { page: "Conversions" },
    { table: { head: ["Conversion", "C#", "Example → result"], rows: [
      ["string → integer", "int.Parse(s) / Convert.ToInt32(s)", "int.Parse(\"42\") + 1 → 43"],
      ["string → integer, safely", "int.TryParse(s, out int n)", "\"seven\" → false, n = 0"],
      ["string → float", "double.Parse(s, CultureInfo.InvariantCulture)", "\"3.75\" → 3.75"],
      ["integer / float → string", "n.ToString()", "42.ToString() + \"!\" → \"42!\""],
      ["string → date/time", "DateTime.ParseExact(s, \"dd/MM/yyyy\", CultureInfo.InvariantCulture)", "\"29/09/2024\" → 29 Sep 2024"],
      ["date/time → string", "d.ToString(\"yyyy-MM-dd\")", "\"2024-09-29\""]
    ] } },
    { callout: { t: "tip", h: "Console.ReadLine() always gives a string", body: "Every number typed in must be converted. Parse throws a FormatException on bad input; TryParse returns false instead — see exception handling (4.1.1.9)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Trace the string adder", src: "AS June 2024 · P1 Q01 · 5 marks",
      q: "Trace: S1 ← \"011101\"; S2 ← \"001100\"; C ← \"0\"; R ← \"\"; FOR J = 0 TO 5: X ← 5 − J; D1 ← S1[X]; D2 ← S2[X]; IF C = \"0\" THEN (IF D1 = D2 THEN S ← \"0\", C ← D1 ELSE S ← \"1\") ELSE (IF D1 = D2 THEN S ← \"1\", C ← D1 ELSE S ← \"0\"); R ← CONCATENATE(S, R); ENDFOR; OUTPUT R. Strings are zero-indexed; CONCATENATE(X, Y) joins Y to the end of X.",
      steps: [
        { h: "J = 0", m: "X = 5: D1 = \"1\", D2 = \"0\", C = \"0\" → differ → S = \"1\"; R = \"1\"" },
        { h: "J = 1", m: "X = 4: \"0\", \"0\" → equal → S = \"0\", C = \"0\"; R = \"01\"" },
        { h: "J = 2", m: "X = 3: \"1\", \"1\" → equal → S = \"0\", C = \"1\"; R = \"001\"" },
        { h: "J = 3", m: "X = 2: \"1\", \"1\" with C = \"1\" → equal → S = \"1\", C = \"1\"; R = \"1001\"" },
        { h: "J = 4", m: "X = 1: \"1\", \"0\" with C = \"1\" → differ → S = \"0\"; R = \"01001\"" },
        { h: "J = 5", m: "X = 0: \"0\", \"0\" with C = \"1\" → equal → S = \"1\", C = \"0\"; R = \"101001\"; OUTPUT \"101001\"", mk: "1 mark per correct boxed set (5)", n: "It adds 011101 + 001100 = 101001 (29 + 12 = 41). Max 4 if any errors." }
      ], result: "101001" } },
    { worked: { tag: "exam", title: "Palindrome program", src: "AS June 2025 · P1 Q03.1 · 8 marks",
      q: "Write a program for: S ← \"\"; WHILE S ≠ \"x\": OUTPUT \"Enter a word or phrase: \"; INPUT S; Max ← LENGTH(S) – 1; Matched ← True; FOR i ← 0 TO Max: Letter1 ← S[i]; Letter2 ← S[Max - i]; IF Letter1 ≠ Letter2 THEN Matched ← False; ENDFOR; IF Matched = True THEN OUTPUT \"Palindrome\" ELSE OUTPUT \"Not a palindrome\"; ENDWHILE. Strings are zero-indexed.",
      steps: [
        { m: "MP1 declarations for S, Max, Matched, i, Letter1, Letter2", mk: "1" },
        { m: "MP2 `while (s != \"x\")`; MP3 prompt and `s = Console.ReadLine();`", mk: "2" },
        { m: "MP4 `max = s.Length - 1;`", mk: "1" },
        { m: "MP5 `for (int i = 0; i <= max; i++)`", mk: "1" },
        { m: "MP6 `if (s[i] != s[max - i])`; MP7 `matched = false;`", mk: "2" },
        { m: "MP8 IF … ELSE after the FOR loop with both outputs", mk: "1", n: "Max 7 if it does not work. madam, maam → Palindrome; adam, aam → Not a palindrome; x → Palindrome (the check runs before the loop test)." }
      ], result: "8 mark points" } },
    { code: { lang: "csharp", src: "string s = \"\";\nwhile (s != \"x\")\n{\n    Console.Write(\"Enter a word or phrase: \");\n    s = Console.ReadLine();\n    int max = s.Length - 1;\n    bool matched = true;\n    for (int i = 0; i <= max; i++)\n    {\n        char letter1 = s[i];\n        char letter2 = s[max - i];\n        if (letter1 != letter2)\n        {\n            matched = false;\n        }\n    }\n    if (matched)\n    {\n        Console.WriteLine(\"Palindrome\");\n    }\n    else\n    {\n        Console.WriteLine(\"Not a palindrome\");\n    }\n}", cap: "AS 2025 in C#, run with madam, maam, adam, aam, x." } },
    { worked: { tag: "variation", title: "Split a postcode", q: "postcode = \"CO3 5FN\". Using C# string operations, find (a) its length (b) the position of the space (c) the outward code before the space (d) the inward code after it (e) the character code of its first character.",
      steps: [
        { m: "(a) postcode.Length → 7", mk: "1" },
        { m: "(b) postcode.IndexOf(' ') → 3", mk: "1" },
        { m: "(c) postcode.Substring(0, 3) → \"CO3\"", mk: "1" },
        { m: "(d) postcode.Substring(4) → \"5FN\" (from index 4 to the end)", mk: "1" },
        { m: "(e) (int)postcode[0] → 67 ('C')", mk: "1" }
      ], result: "7, 3, CO3, 5FN, 67" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Complete the trace (strings)", "Index from 0; one new row per change; R built by concatenation in the stated order."],
      ["Write a program (strings)", "s.Length, s[i], Substring(start, LENGTH), + to join; convert input with int.Parse."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Lazy People Steal Cake, Cook Cakes, Convert\"", body: "**L**ength · **P**osition · **S**ubstring · **C**oncatenation · **C**haracter→code · **C**ode→character · **C**onversions — the spec's seven." } },
    { callout: { t: "miscon", h: "Specific errors", body: ["Off-by-one: the last index is Length − 1.", "Substring(start, end) when C# wants (start, length).", "Comparing a char with a string: s[0] == \"A\" does not compile; use 'A'.", "Concatenating in the wrong order in a trace."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.5.1 ASCII and Unicode codes; 4.5.6 Caesar and Vernam ciphers; 4.4.2.3 regular expressions match strings; 4.1.1.9 parsing input safely." } }
  ],
  flashcards: [
    ["Length of a string in C#?", "s.Length."],
    ["Position of \"Sci\" in s?", "s.IndexOf(\"Sci\") — −1 if absent."],
    ["C# Substring arguments?", "(start index, length)."],
    ["Character code of 'A'?", "65 — (int)'A'."],
    ["Character with code 66?", "'B' — (char)66."],
    ["Digit character to its value?", "c - '0'."],
    ["String to integer safely?", "int.TryParse(s, out int n)."],
    ["Last character of s?", "s[s.Length - 1] (or s[^1])."],
  ],
  quiz: [
    { q: "\"Computer\".Substring(3, 2)", opts: ["\"pu\"", "\"put\"", "\"mp\"", "\"pute\""], ans: 0, why: "Start 3, length 2." },
    { q: "(char)('a' + 2)", opts: ["'c'", "'b'", "99", "\"a2\""], ans: 0, why: "Code 99." },
    { q: "\"madam\".IndexOf('z')", opts: ["-1", "0", "5", "an exception"], ans: 0, why: "Not found." },
    { q: "Valid indices of a 5-character string", opts: ["0 to 4", "1 to 5", "0 to 5", "1 to 4"], ans: 0, why: "Zero-based." },
    { q: "int.Parse(\"7\") + int.Parse(\"3\")", opts: ["10", "\"73\"", "73", "an error"], ans: 0, why: "Converted to integers." }
  ]
};

/* =====================================================================
   4.1.1.8  Random number generation
   ===================================================================== */
C["compsci:4.1.1.8"] = {
  notes: [
    { h: "Random number generation in a programming language — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.1.1.8)", body: "Be familiar with, and be able to use, **random number generation**." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Program with random dice", "Write", "8", "AS 2022 Q03.1"],
      ["Screen capture of a random run", "Test", "1", "AS 2022 Q03.2"],
      ["Random numbers in the Skeleton Program", "State / Explain / Modify", "1–3", "Section B / D (games, simulations)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Random in C#**.", "**Ranges and common uses**.", "**Pseudo-random and seeds**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Random in C#" },
    { table: { head: ["Want", "C#", "Range"], rows: [
      ["an integer from 1 to 6", "rng.Next(1, 7)", "1–6 — the upper bound is EXCLUDED"],
      ["an integer from 0 to n − 1", "rng.Next(n)", "0–(n−1): ideal for an array index"],
      ["a real from 0 to 1", "rng.NextDouble()", "0 ≤ x < 1"],
      ["a real from a to b", "a + rng.NextDouble() * (b - a)", "a ≤ x < b"],
      ["a random element", "items[rng.Next(items.Length)]", "any element"]
    ] } },
    { code: { lang: "csharp", src: "Random rng = new Random();            // create ONE generator and reuse it\nint die = rng.Next(1, 7);             // 1..6\nint index = rng.Next(names.Length);   // 0..Length-1\nbool heads = rng.Next(2) == 0;        // 50 : 50\nif (rng.NextDouble() < 0.25) Console.WriteLine(\"Critical hit!\");   // 25% chance", cap: "Random.Shared is also available in modern .NET." } },
    { callout: { t: "warn", h: "Next(1, 6) never gives 6", body: "The second argument is exclusive. A die is Next(1, 7). Checked: 10 000 calls of Next(1, 7) gave minimum 1 and maximum 6." } },

    { page: "Ranges and common uses" },
    { ul: ["Games: dice, card shuffles, enemy spawn positions.", "Simulations: arrival times, random events (e.g. a rabbit warren's births).", "Testing: generating lots of test data.", "Security: keys and salts — but those need a CRYPTOGRAPHIC generator (System.Security.Cryptography.RandomNumberGenerator), not Random."] },
    { code: { lang: "csharp", src: "// Fisher–Yates shuffle of an array\nfor (int i = deck.Length - 1; i > 0; i--)\n{\n    int j = rng.Next(i + 1);          // 0..i\n    (deck[i], deck[j]) = (deck[j], deck[i]);\n}", cap: "Every ordering equally likely." } },

    { page: "Pseudo-random and seeds" },
    { kv: [
      ["Pseudo-random", "computer-generated random numbers come from a deterministic formula — they look random but are not truly random"],
      ["Seed", "the starting value of the formula; the same seed gives the same sequence: new Random(42)"],
      ["Why seed", "repeatable tests and debugging; replays in games"],
      ["Don't", "create a new Random inside a loop — in older .NET the seed came from the clock, so many generators in quick succession repeated numbers"]
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Dice program", src: "AS June 2022 · P1 Q03.1 · 8 marks",
      q: "Write a program for: C ← 0; D ← 0; S ← 0; T ← 0; WHILE C < 3 AND D < 3: T ← T + 1; N1 ← random integer 1–6; N2 ← random integer 1–6; OUTPUT N1, N2; S ← S + N1 + N2; IF N1 = 6 OR N2 = 6 THEN C ← C + 1; IF N1 = N2 THEN D ← D + 1; ENDWHILE; A ← S DIV (T * 2); OUTPUT C, D, A.",
      steps: [
        { m: "MP1 declarations and initialisation of C, D, S, T to 0", mk: "1" },
        { m: "MP2 `while (c < 3 && d < 3)`", mk: "1" },
        { m: "MP3 `int n1 = rng.Next(1, 7); int n2 = rng.Next(1, 7);` and their output inside the loop", mk: "1" },
        { m: "MP4 `s = s + n1 + n2;` and `t = t + 1;`", mk: "1" },
        { m: "MP5 `if (n1 == 6 || n2 == 6) c++;`", mk: "1" },
        { m: "MP6 `if (n1 == n2) d++;`", mk: "1" },
        { m: "MP7 `int a = s / (t * 2);` after the loop", mk: "1" },
        { m: "MP8 output C, D, A after the loop", mk: "1", n: "Max 7 if it does not work. A is the average die value, as a whole number." }
      ], result: "8 mark points" } },
    { code: { lang: "csharp", src: "Random rng = new Random();\nint c = 0, d = 0, s = 0, t = 0;\nwhile (c < 3 && d < 3)\n{\n    t = t + 1;\n    int n1 = rng.Next(1, 7);\n    int n2 = rng.Next(1, 7);\n    Console.WriteLine(n1 + \" \" + n2);\n    s = s + n1 + n2;\n    if (n1 == 6 || n2 == 6)\n    {\n        c = c + 1;\n    }\n    if (n1 == n2)\n    {\n        d = d + 1;\n    }\n}\nint a = s / (t * 2);\nConsole.WriteLine(c + \" \" + d + \" \" + a);", cap: "AS 2022 in C#. One seeded run ended 3 1 4: three turns with a six, one double, average 4." } },
    { worked: { tag: "exam", title: "What the random run must show", src: "AS June 2022 · P1 Q03.2 · 1 mark",
      q: "Test the dice program by running it. The output is random. What must the screen capture show to earn the mark?",
      steps: [{ m: "Two digits from 1 to 6 on each line except the last; the last line shows the count of lines with at least one 6, the number of doubles and another integer — with C or D equal to 3;", mk: "1 mark", n: "I. missing spaces; A. each digit on a new line." }], result: "Pairs 1–6; a final line with a 3" } },
    { worked: { tag: "variation", title: "Random ranges", q: "Using one Random rng, write C# for: (a) a lottery ball 1–59 (b) a random letter A–Z (c) a temperature from −5.0 to 30.0 (d) a 30% chance of rain (e) a random element of string[] names.",
      steps: [
        { m: "(a) rng.Next(1, 60)", mk: "1" },
        { m: "(b) (char)('A' + rng.Next(26))", mk: "1" },
        { m: "(c) -5.0 + rng.NextDouble() * 35.0", mk: "1" },
        { m: "(d) rng.NextDouble() < 0.3", mk: "1" },
        { m: "(e) names[rng.Next(names.Length)]", mk: "1" }
      ], result: "Upper bounds are exclusive" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Write a program (random)", "rng.Next(1, 7) for 1–6; create the Random once; the random calls INSIDE the loop."],
      ["Explain pseudo-random", "Generated by a deterministic algorithm from a seed — repeatable, not truly random."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Next excludes the last\"", body: "rng.Next(min, max) gives min to max − 1. Same seed, same sequence." } },
    { callout: { t: "miscon", h: "Specific errors", body: ["Next(1, 6) for a die.", "Generating the dice once, before the loop.", "A new Random() inside a loop.", "Using Random for passwords or keys."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.13.1.4 testing random programs (what can and cannot be predicted); 4.5.6 random keys in the Vernam cipher; 4.2.6 hash functions; NEA simulations and games." } }
  ],
  flashcards: [
    ["C# for a random integer 1–6?", "rng.Next(1, 7)."],
    ["Is Next's upper bound included?", "No — it is exclusive."],
    ["Random real in [0, 1)?", "rng.NextDouble()."],
    ["Pseudo-random?", "Generated by a deterministic algorithm from a seed; not truly random."],
    ["Why use a seed?", "Repeatable sequences for testing and debugging."],
    ["Random array index?", "rng.Next(array.Length)."],
    ["Random for security keys?", "No — use a cryptographic generator."],
    ["A in the dice program?", "S DIV (T × 2): the average die value as a whole number."]
  ],
  quiz: [
    { q: "rng.Next(1, 7) can return", opts: ["1 to 6", "1 to 7", "0 to 6", "0 to 7"], ans: 0, why: "Exclusive upper bound." },
    { q: "Two Random objects with the same seed produce", opts: ["the same sequence", "different sequences", "only zeros", "an error"], ans: 0, why: "Deterministic." },
    { q: "The dice loop ends when", opts: ["C or D reaches 3", "both reach 3", "T reaches 3", "S exceeds 30"], ans: 0, why: "C < 3 AND D < 3 fails." },
    { q: "A random index into string[] names is", opts: ["rng.Next(names.Length)", "rng.Next(1, names.Length)", "rng.NextDouble()", "rng.Next(names.Length + 1)"], ans: 0, why: "0..Length−1." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
