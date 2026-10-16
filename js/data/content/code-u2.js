/* Kurenai OS — data/content/code-u2.js
   Code · Unit 2 · Decisions and loops (roadmap 5.3).

   Same contract as unit 1 (docs/code-plan.md §4): every lesson's layers,
   short text layers folded by KOS_CODE.compose; every {run} listing,
   practice item, task answer and retrieval variation checked against .NET
   by tools/cs_diff.mjs. Arrays appear only as a preview (unit 4 teaches
   them); loops here walk ranges and strings.                            */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function run(id, cap, src, stdin) { return { run: { id: id, cap: cap, src: src, stdin: stdin || "" } }; }
  function page(t) { return { page: t }; }
  function call(t, h, body) { return { callout: { t: t, h: h, body: body } }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }

  K.add({ concepts: {
    "compare": { name: "Comparison operators", lesson: "2.1", about: "== != < > <= >=" },
    "bool-vars": { name: "bool variables", lesson: "2.1", about: "storing a yes/no answer" },
    "if-else": { name: "if / else", lesson: "2.2", about: "choosing between two paths" },
    "else-if": { name: "else if chains", lesson: "2.2", about: "one of many, in order" },
    "logical": { name: "&& || !", lesson: "2.3", about: "combining conditions" },
    "short-circuit": { name: "Short-circuiting", lesson: "2.3", about: "the right side may never run" },
    "switch": { name: "switch statement", lesson: "2.4", about: "one case from many" },
    "switch-expr": { name: "switch expression", lesson: "2.4", about: "a value chosen by pattern" },
    "while": { name: "while", lesson: "2.5", about: "repeat while true" },
    "do-while": { name: "do … while", lesson: "2.5", about: "run once, then check" },
    "for": { name: "for", lesson: "2.6", about: "counting loops" },
    "foreach": { name: "foreach", lesson: "2.6", about: "every item in turn" },
    "break-continue": { name: "break and continue", lesson: "2.7", about: "leave or skip" },
    "nested-loops": { name: "Nested loops", lesson: "2.7", about: "a loop inside a loop" },
    "ternary": { name: "Ternary ?:", lesson: "2.8", about: "a decision as a value" },
    "guard": { name: "Guard clauses", lesson: "2.8", about: "deal with the odd case first" },
    "input-loop": { name: "Input loops", lesson: "2.9", about: "read until done" }
  } });

  /* ================================================================
     2.1 Booleans and comparison
     ================================================================ */
  lesson("2.1", {
    aqa: "4.1.1.3",
    notes: [
      page("The problem it solves"),
      "Every decision a program makes starts with a question that has a yes-or-no answer.",
      { ul: [ "Is the mark at least 40? Is the password the same as the one stored?", "C# asks such questions with **comparison operators**.", "The answer is a `bool`: `true` or `false`." ] },
      page("Core idea"),
      run("cmp", "six comparisons", "int mark = 52;\nConsole.WriteLine(mark >= 40);\nConsole.WriteLine(mark < 40);\nConsole.WriteLine(mark == 52);\nConsole.WriteLine(mark != 52);\nConsole.WriteLine(mark > 52);\nConsole.WriteLine(mark <= 52);"),
      { table: { head: ["Operator", "Asks"], rows: [["`==`", "equal to"], ["`!=`", "not equal to"], ["`<` `>`", "less / greater than"], ["`<=` `>=`", "at most / at least"]] } },
      "A comparison is a value like any other, so it can be stored:",
      run("store", "a bool variable", "int age = 17;\nbool canVote = age >= 18;\nConsole.WriteLine(canVote);"),
      page("Rules"),
      { ul: [
        "`==` compares; `=` assigns. Using `=` where a `bool` is needed is a compile error.",
        "Numbers of different types compare by value: `5 == 5.0` is `true`.",
        "Strings compare with `==` by their characters, and it is case-sensitive: `\"Ada\" == \"ada\"` is `false`.",
        "`<` and `>` do not work on strings; use `string.Compare` (unit 5).",
        "A `bool` can be compared too, but `if (ready)` reads better than `if (ready == true)`."
      ] },
      run("strings", "strings by their characters", 'string a = "Ada";\nConsole.WriteLine(a == "Ada");\nConsole.WriteLine(a == "ada");\nConsole.WriteLine(a.ToLower() == "ada");'),
      page("Variations"),
      { h: "Name the question" },
      run("named", "a named condition", "int mark = 38;\nint retakes = 1;\nbool passed = mark >= 40;\nbool canRetake = retakes < 2;\nConsole.WriteLine($\"Passed: {passed}, can retake: {canRetake}\");"),
      { h: "Characters compare by their code" },
      run("chars", "'a' < 'b'", "Console.WriteLine('a' < 'b');\nConsole.WriteLine('Z' < 'a');"),
      "Upper-case letters come before lower-case ones in the character table, so `'Z' < 'a'` is `true`.",
      { h: "Comparing with the remainder" },
      run("even", "is it even?", "int n = 14;\nbool even = n % 2 == 0;\nConsole.WriteLine(even);"),
      page("Under the hood"),
      { ul: [ "A comparison compiles to one processor instruction that sets a flag; `bool` stores that flag.", "`%` binds tighter than `==`, which binds tighter than `=`, so `bool even = n % 2 == 0;` needs no brackets." ] },
      page("Pitfalls"),
      { h: "= instead of == — CS0029" },
      run("pit-assign", "assignment in a condition", "int x = 3;\nbool same = (x = 5);\nConsole.WriteLine(same);"),
      "`x = 5` is an assignment, giving an `int`. A question needs `==`.",
      { h: "Comparing a string with a number — CS0019" },
      run("pit-mix", "text and a number", 'string age = "17";\nConsole.WriteLine(age == 17);'),
      "Parse the text first (1.6), then compare numbers.",
      { h: "Case matters" },
      "`\"Yes\" == \"yes\"` is `false`. When the user types an answer, compare `answer.ToLower() == \"yes\"`.",
      { h: "Doubles that are nearly equal" },
      run("pit-double", "0.1 + 0.2 == 0.3", "Console.WriteLine(0.1 + 0.2 == 0.3);"),
      "1.7 explains why. Compare doubles with a tolerance.",
      page("Connections"),
      { ul: [ "**Next:** 2.2 uses these answers to choose what runs.", "**Later:** unit 5 compares strings ignoring case and culture.", "**AQA:** 4.1.1.3 relational operations." ] },
      page("Good practice"),
      { ul: [ "Store a condition in a well-named `bool` when it is used twice or is hard to read.", "Name bools as questions: `isEmpty`, `hasPaid`, `canRetake`." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Pass mark* and *Same length?*." ] },
      page("Quick reference"),
      run("qr", "comparisons", 'int n = 7;\nbool big = n > 5;          // True\nbool same = n == 7;        // True\nbool name = "Ada" == "Ada"; // True\nConsole.WriteLine(big && same && name);'),
      { ul: [ "`==` compares, `=` assigns.", "A comparison gives a `bool`.", "Strings compare by characters, case-sensitively.", "Doubles: compare with a tolerance.", "Name bools as questions." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0029", "= used where a bool is needed", "Pitfalls"], ["CS0019", "comparing a string with a number", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "int a = 6, b = 9;\nConsole.WriteLine(a > b);\nConsole.WriteLine(a != b);", why: "6 is not greater than 9 (False); they differ (True).", concepts: ["compare"] },
        { id: "p2", src: 'Console.WriteLine("cat" == "Cat");\nConsole.WriteLine(10 == 10.0);', why: "Strings are case-sensitive; numbers compare by value.", concepts: ["compare"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so it prints True for an even number.", src: "int n = 8;\nbool even = n % 2 @@ 0;\nConsole.WriteLine(even);", out: "True", concepts: ["compare"] }
      ],
      bug: [
        { id: "b1", q: "It should print True when x is 5.", src: "int x = 5;\nbool five = (x = 5);\nConsole.WriteLine(five);", out: "True", fixedText: "prints True", why: "Compare with ==, not =.", concepts: ["compare"] }
      ]
    },
    flashcards: [
      ["`=` vs `==`?", "`=` assigns a value; `==` compares two values and gives a bool."],
      ["What type does `a < b` give?", "`bool`."],
      ["Is `\"Ada\" == \"ada\"` true?", "No — string comparison is case-sensitive."],
      ["How do you test a number is even?", "`n % 2 == 0`."],
      ["Why is `'Z' < 'a'` true?", "Characters compare by their codes, and upper-case letters come first."],
      ["How should two doubles be compared?", "With a tolerance: `Math.Abs(x - y) < 1e-9`."]
    ],
    quiz: [
      { q: "`int n = 4; Console.WriteLine(n >= 4);` prints…", opts: ["True", "False", "4", "an error"], ans: 0, why: "4 is at least 4." },
      { q: "Which line will not compile?", opts: ["bool b = 3 < 4;", "bool b = (x == 2);", "bool b = (x = 2);", "bool b = !false;"], ans: 2, why: "x = 2 is an int-valued assignment, not a bool." },
      { q: "`\"apple\" == \"Apple\"` is…", opts: ["True", "False", "an error", "null"], ans: 1, why: "Case-sensitive." },
      { q: "A good name for a bool?", opts: ["flag2", "check", "isLoggedIn", "b"], ans: 2, why: "It reads as a question." }
    ]
  });
  K.add({ tasks: {
    "2.1-pass": { lesson: "2.1", title: "Pass mark", tier: "warm-up", minutes: 5, concepts: ["compare", "bool-vars"], requires: ["parse"],
      statement: ["Read a mark (a whole number).", "Print `Passed: True` if it is at least 40, otherwise `Passed: False`."],
      starter: "int mark = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "52", out: "Passed: True" }, { stdin: "12", out: "Passed: False" }],
      hidden: [{ stdin: "40", out: "Passed: True" }, { stdin: "39", out: "Passed: False" }],
      hints: ["The question is: is the mark at least 40?", "`mark >= 40` gives True or False.", "Console.WriteLine($\"Passed: {mark >= 40}\");"],
      answer: "int mark = int.Parse(Console.ReadLine());\nbool passed = mark >= 40;\nConsole.WriteLine($\"Passed: {passed}\");" },
    "2.1-length": { lesson: "2.1", title: "Same length?", tier: "core", minutes: 10, concepts: ["compare"], requires: ["readline"],
      statement: ["Read two words, one per line.", "Print `True` if they have the same number of letters, otherwise `False`."],
      starter: "",
      examples: [{ stdin: "cat\ndog", out: "True" }, { stdin: "mouse\nrat", out: "False" }],
      hidden: [{ stdin: "a\nb", out: "True" }, { stdin: "Kurenai\nKurena", out: "False" }],
      hints: ["Each string has a Length.", "Compare the two lengths with ==.", "Console.WriteLine(a.Length == b.Length);"],
      answer: "string a = Console.ReadLine();\nstring b = Console.ReadLine();\nConsole.WriteLine(a.Length == b.Length);" }
  } });

  /* ================================================================
     2.2 if, else if and else
     ================================================================ */
  lesson("2.2", {
    aqa: "4.1.1.2",
    notes: [
      page("The problem it solves"),
      "Until now every line ran, every time. Real programs **choose**: a refund only if the order is late, a grade that depends on the mark.",
      { ul: [ "`if` runs a block only when its condition is `true`.", "`else` gives the other path.", "Chained, they pick exactly one of many." ] },
      page("Core idea"),
      run("ifelse", "two paths", 'int mark = int.Parse(Console.ReadLine());\nif (mark >= 40)\n{\n    Console.WriteLine("Pass");\n}\nelse\n{\n    Console.WriteLine("Not yet");\n}', "52"),
      run("chain", "one of many", 'int mark = int.Parse(Console.ReadLine());\nif (mark >= 70)\n    Console.WriteLine("A");\nelse if (mark >= 60)\n    Console.WriteLine("B");\nelse if (mark >= 50)\n    Console.WriteLine("C");\nelse\n    Console.WriteLine("Below C");', "64"),
      "Conditions are checked **top to bottom**; the first true one wins and the rest are skipped.",
      page("Rules"),
      { ul: [
        "The condition goes in brackets and must be a `bool`.",
        "Braces `{ }` make a block. Without them, only the **next single statement** belongs to the `if`.",
        "`else` belongs to the nearest unmatched `if`.",
        "In an `else if` chain, at most one branch runs; with a final `else`, exactly one runs.",
        "Order matters: put the most specific test first."
      ] },
      run("order", "the first true test wins", 'int mark = 85;\nif (mark >= 50) Console.WriteLine("C");\nelse if (mark >= 70) Console.WriteLine("A");'),
      "85 is at least 50, so it prints C and never reaches the A test. Test the highest boundary first.",
      page("Variations"),
      { h: "An if with no else" },
      run("noelse", "only sometimes", 'int stock = 3;\nif (stock < 5)\n    Console.WriteLine("Reorder soon");\nConsole.WriteLine("Done");'),
      { h: "Decisions inside decisions" },
      run("nested", "nested if", 'int age = 15;\nbool withAdult = true;\nif (age >= 18)\n    Console.WriteLine("Allowed");\nelse\n{\n    if (withAdult) Console.WriteLine("Allowed with an adult");\n    else Console.WriteLine("Not allowed");\n}'),
      { h: "Comparing text" },
      run("text", "an answer", 'string answer = Console.ReadLine();\nif (answer.ToLower() == "yes")\n    Console.WriteLine("Great");\nelse\n    Console.WriteLine("Maybe later");', "YES"),
      page("Under the hood"),
      { ul: [ "The compiler turns an `if` into a conditional jump: when the condition is false, skip over the block.", "An `else if` chain is just an `else` whose single statement is another `if` — that is why it needs no extra braces." ] },
      page("Pitfalls"),
      { h: "A stray semicolon" },
      run("pit-semi", "if (…);", 'int x = 1;\nif (x > 5);\n{\n    Console.WriteLine("big");\n}'),
      "The `;` ends the `if` with an empty statement, so the block after it always runs. C# warns about this; never put `;` after the bracket.",
      { h: "Missing braces" },
      run("pit-braces", "two lines, one if", 'int x = 1;\nif (x > 5)\n    Console.WriteLine("big");\n    Console.WriteLine("really big");'),
      "Indentation means nothing to C#. Only the first line belongs to the `if`. Use braces whenever a branch has more than one line.",
      { h: "A condition that is not a bool — CS0029" },
      run("pit-int", "if (count)", 'int count = 3;\nif (count)\n    Console.WriteLine("some");'),
      "C# never treats a number as true or false. Write `if (count > 0)`.",
      { h: "Boundaries in the wrong order" },
      "Testing `>= 50` before `>= 70` means nobody ever gets an A. Start from the strictest test.",
      page("Connections"),
      { ul: [ "**Next:** 2.3 combines conditions; 2.4 offers `switch` when you compare one value with many.", "**Later:** 2.8 shows guard clauses that keep code flat.", "**AQA:** 4.1.1.2 selection." ] },
      page("Good practice"),
      { ul: [ "Always use braces for multi-line branches.", "Keep the happy path easy to find.", "Make boundaries explicit: is 40 a pass? Write `>= 40` and test 39, 40 and 41." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Bigger of two* and *Grade boundaries*." ] },
      page("Quick reference"),
      run("qr", "the shape", 'int n = 0;\nif (n > 0)\n    Console.WriteLine("positive");\nelse if (n < 0)\n    Console.WriteLine("negative");\nelse\n    Console.WriteLine("zero");'),
      { ul: [ "`if (bool) { … } else if (bool) { … } else { … }`", "First true test wins; order from strictest.", "Braces for more than one line.", "No `;` after the condition.", "A number is never a condition." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0029", "an int used as a condition", "Pitfalls"], ["CS0642", "warning: possible mistaken empty statement", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int t = 18;\nif (t > 25) Console.WriteLine("hot");\nelse if (t > 15) Console.WriteLine("mild");\nelse Console.WriteLine("cold");', why: "18 is not over 25, but it is over 15.", concepts: ["else-if"] },
        { id: "p2", src: 'int x = 2;\nif (x > 5)\n    Console.WriteLine("a");\nConsole.WriteLine("b");', why: "Only the first line belongs to the if; b always prints.", concepts: ["if-else"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so it prints the larger number.", src: "int a = int.Parse(Console.ReadLine());\nint b = int.Parse(Console.ReadLine());\nif (a @@ b) Console.WriteLine(a);\nelse Console.WriteLine(b);", cases: [{ stdin: "3\n9", out: "9" }, { stdin: "8\n2", out: "8" }], concepts: ["if-else"] }
      ],
      bug: [
        { id: "b1", q: "A mark of 85 should be an A.", src: 'int mark = int.Parse(Console.ReadLine());\nif (mark >= 50) Console.WriteLine("C");\nelse if (mark >= 70) Console.WriteLine("A");\nelse Console.WriteLine("U");', cases: [{ stdin: "85", out: "A" }, { stdin: "55", out: "C" }, { stdin: "10", out: "U" }], fixedText: "grades in the right order", why: "Test >= 70 first: the first true branch wins.", concepts: ["else-if"] }
      ]
    },
    flashcards: [
      ["What runs in an `else if` chain?", "The first branch whose condition is true; the rest are skipped."],
      ["Without braces, how much belongs to an `if`?", "Only the next single statement."],
      ["What does `if (x > 5);` do?", "The semicolon is an empty statement: the following block always runs."],
      ["Can `if (count)` work for an int?", "No — C# needs a bool: `if (count > 0)`."],
      ["In which order should grade boundaries be tested?", "Strictest (highest) first."],
      ["What makes exactly one branch run?", "A chain that ends with a plain `else`."]
    ],
    quiz: [
      { q: "mark = 65. `if (mark >= 70) A; else if (mark >= 60) B; else C;` gives…", opts: ["A", "B", "C", "B and C"], ans: 1, why: "65 fails the first test and passes the second." },
      { q: "Which is a compile error?", opts: ["if (n > 0) {}", "if (n) {}", "if (!done) {}", "if (a == b) {}"], ans: 1, why: "An int is not a condition." },
      { q: "`else` pairs with…", opts: ["the first if in the file", "the nearest unmatched if", "every if", "nothing without braces"], ans: 1, why: "The nearest unmatched if." },
      { q: "How many branches can run in an if / else if / else chain?", opts: ["none", "exactly one", "all whose conditions are true", "two"], ans: 1, why: "With a final else, exactly one." }
    ]
  });
  K.add({ tasks: {
    "2.2-bigger": { lesson: "2.2", title: "Bigger of two", tier: "warm-up", minutes: 10, concepts: ["if-else", "else-if"], requires: ["parse"],
      statement: ["Read two whole numbers, one per line.", "Print the bigger one, or `Equal` if they are the same."],
      starter: "int a = int.Parse(Console.ReadLine());\nint b = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "3\n9", out: "9" }, { stdin: "7\n7", out: "Equal" }],
      hidden: [{ stdin: "-1\n-5", out: "-1" }, { stdin: "0\n1", out: "1" }],
      hints: ["Three outcomes: a bigger, b bigger, or equal.", "if (a > b) … else if (b > a) … else …", "Print a, then b, then \"Equal\" in the three branches."],
      answer: "int a = int.Parse(Console.ReadLine());\nint b = int.Parse(Console.ReadLine());\nif (a > b) Console.WriteLine(a);\nelse if (b > a) Console.WriteLine(b);\nelse Console.WriteLine(\"Equal\");" },
    "2.2-grades": { lesson: "2.2", title: "Grade boundaries", tier: "core", minutes: 15, concepts: ["else-if"], requires: ["if-else"],
      statement: ["Read a mark from 0 to 100.", "Print its grade: A for 70 or more, B for 60 or more, C for 50 or more, D for 40 or more, otherwise U."],
      starter: "int mark = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "72", out: "A" }, { stdin: "55", out: "C" }, { stdin: "12", out: "U" }],
      hidden: [{ stdin: "70", out: "A" }, { stdin: "69", out: "B" }, { stdin: "40", out: "D" }, { stdin: "39", out: "U" }, { stdin: "100", out: "A" }],
      hints: ["One else if per boundary.", "Start with the highest boundary, 70.", "if (mark >= 70) A; else if (mark >= 60) B; … else U."],
      answer: "int mark = int.Parse(Console.ReadLine());\nif (mark >= 70) Console.WriteLine(\"A\");\nelse if (mark >= 60) Console.WriteLine(\"B\");\nelse if (mark >= 50) Console.WriteLine(\"C\");\nelse if (mark >= 40) Console.WriteLine(\"D\");\nelse Console.WriteLine(\"U\");" }
  } });

  /* ================================================================
     2.3 Logical operators
     ================================================================ */
  lesson("2.3", {
    aqa: "4.1.1.3",
    notes: [
      page("The problem it solves"),
      "Real rules have more than one part: a ticket is free if you are under 5 **or** over 65; a login works if the name **and** the password match.",
      { ul: [ "`&&` (and), `||` (or) and `!` (not) combine bools into one answer.", "They let one `if` say what would otherwise take several." ] },
      page("Core idea"),
      run("and", "&& — both", "int age = 30;\nbool member = true;\nConsole.WriteLine(age >= 18 && member);\nConsole.WriteLine(age < 18 && member);"),
      run("or", "|| — either", "int age = 70;\nConsole.WriteLine(age < 5 || age > 65);"),
      run("not", "! — the opposite", "bool raining = false;\nConsole.WriteLine(!raining);"),
      { table: { head: ["a", "b", "a && b", "a || b"], rows: [["true", "true", "true", "true"], ["true", "false", "false", "true"], ["false", "true", "false", "true"], ["false", "false", "false", "false"]] } },
      page("Rules"),
      { ul: [
        "`!` comes first, then `&&`, then `||`. So `a || b && c` means `a || (b && c)`.",
        "Comparisons happen before `&&` and `||`, so `x > 0 && x < 10` needs no brackets.",
        "**Short-circuiting:** `&&` stops if the left side is false; `||` stops if the left side is true. The right side then never runs.",
        "Use short-circuiting to guard: `count != 0 && total / count > 5` never divides by zero.",
        "A range check needs two comparisons: `x >= 1 && x <= 10` — never `1 <= x <= 10`."
      ] },
      run("short", "the right side never runs", "int count = 0;\nint total = 50;\nbool ok = count != 0 && total / count > 5;\nConsole.WriteLine(ok);"),
      page("Variations"),
      { h: "A range" },
      run("range", "inside 1 to 10", "int x = int.Parse(Console.ReadLine());\nbool inRange = x >= 1 && x <= 10;\nConsole.WriteLine(inRange);", "7"),
      { h: "Outside a range" },
      run("outside", "the opposite", "int x = 15;\nConsole.WriteLine(x < 1 || x > 10);\nConsole.WriteLine(!(x >= 1 && x <= 10));"),
      "Both lines say the same thing — that is **De Morgan's law**: not (A and B) is (not A) or (not B).",
      { h: "Leap years" },
      run("leap", "a classic rule", "int year = 2000;\nbool leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;\nConsole.WriteLine(leap);"),
      page("Under the hood"),
      { ul: [ "`&&` and `||` compile to jumps, not arithmetic: the right side is skipped by jumping past it.", "`&` and `|` also exist; on bools they always evaluate both sides. Use `&&` and `||` for conditions." ] },
      page("Pitfalls"),
      { h: "Writing a range like maths — CS0019" },
      run("pit-chain", "1 <= x <= 10", "int x = 5;\nConsole.WriteLine(1 <= x <= 10);"),
      "`1 <= x` is a bool, and a bool cannot be compared with 10. Write `x >= 1 && x <= 10`.",
      { h: "Dividing before checking" },
      run("pit-order", "the check comes second", "int count = 0;\nint total = 50;\nConsole.WriteLine(total / count > 5 && count != 0);"),
      "The division runs first and throws. Put the guard on the **left**.",
      { h: "&& and || mixed without brackets" },
      "`member || age > 65 && local` reads as `member || (age > 65 && local)`. Add brackets to say what you mean.",
      page("Connections"),
      { ul: [ "**Next:** 2.4 switches on one value; 2.5 loops while a condition holds.", "**Later:** CS's Boolean algebra (AQA 4.6) is the same logic on paper.", "**AQA:** 4.1.1.3 Boolean operations." ] },
      page("Good practice"),
      { ul: [ "Name a long condition: `bool canEnter = isMember || hasTicket;`.", "Bracket mixed `&&` / `||` even when not required.", "Put the cheap or protective test first." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *In range* and *Leap year*." ] },
      page("Quick reference"),
      run("qr", "and, or, not", "int x = 5;\nbool inside = x >= 1 && x <= 10;   // both\nbool edge = x == 1 || x == 10;      // either\nbool notInside = !inside;           // opposite\nConsole.WriteLine($\"{inside} {edge} {notInside}\");"),
      { ul: [ "`&&` both · `||` either · `!` not.", "`!` before `&&` before `||`.", "&& and || short-circuit: guard on the left.", "A range is two comparisons.", "Bracket mixed && and ||." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0019", "a bool compared with a number (1 <= x <= 10)", "Pitfalls"], ["DivideByZeroException", "the guard came second", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "bool a = true, b = false;\nConsole.WriteLine(a && b);\nConsole.WriteLine(a || b);\nConsole.WriteLine(!b);", why: "and needs both; or needs one; not flips.", concepts: ["logical"] },
        { id: "p2", src: "int x = 0;\nConsole.WriteLine(x != 0 && 10 / x > 1);", why: "The left side is false, so the division never runs.", concepts: ["short-circuit"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so it prints True only for 1 to 10.", src: "int x = int.Parse(Console.ReadLine());\nConsole.WriteLine(x >= 1 @@ x <= 10);", cases: [{ stdin: "5", out: "True" }, { stdin: "11", out: "False" }, { stdin: "0", out: "False" }], concepts: ["logical"] }
      ],
      bug: [
        { id: "b1", q: "Free entry is for under 5s or over 65s.", src: "int age = int.Parse(Console.ReadLine());\nConsole.WriteLine(age < 5 && age > 65);", cases: [{ stdin: "3", out: "True" }, { stdin: "70", out: "True" }, { stdin: "30", out: "False" }], fixedText: "under 5 or over 65", why: "Nobody is both under 5 and over 65 — use ||.", concepts: ["logical"] }
      ]
    },
    flashcards: [
      ["What does `&&` need to be true?", "Both sides true."],
      ["What does `||` need to be true?", "At least one side true."],
      ["What is short-circuiting?", "&& stops at a false left side and || at a true one, so the right side never runs."],
      ["How do you write 1 ≤ x ≤ 10?", "`x >= 1 && x <= 10`."],
      ["Precedence of ! && ||?", "! first, then &&, then ||."],
      ["De Morgan: !(a && b) is…", "`!a || !b`."]
    ],
    quiz: [
      { q: "`true || false && false` is…", opts: ["true", "false", "an error", "null"], ans: 0, why: "&& first: false; then true || false." },
      { q: "Which safely checks an average?", opts: ["total / n > 5 && n != 0", "n != 0 && total / n > 5", "n != 0 & total / n > 5", "total / n > 5 || n == 0"], ans: 1, why: "The guard on the left short-circuits." },
      { q: "`!(x > 3)` is the same as…", opts: ["x < 3", "x <= 3", "x >= 3", "x != 3"], ans: 1, why: "Not greater than is at most." },
      { q: "`1 <= x <= 10` in C# is…", opts: ["a range check", "a compile error", "always true", "always false"], ans: 1, why: "A bool cannot be compared with 10." }
    ]
  });
  K.add({ tasks: {
    "2.3-range": { lesson: "2.3", title: "In range", tier: "core", minutes: 10, concepts: ["logical"], requires: ["if-else"],
      statement: ["Read a whole number.", "Print `In range` if it is from 1 to 10 inclusive, otherwise `Out of range`."],
      starter: "int n = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "4", out: "In range" }, { stdin: "12", out: "Out of range" }],
      hidden: [{ stdin: "1", out: "In range" }, { stdin: "10", out: "In range" }, { stdin: "0", out: "Out of range" }, { stdin: "-3", out: "Out of range" }],
      hints: ["A range needs two comparisons.", "n >= 1 && n <= 10", "if (n >= 1 && n <= 10) … else …"],
      answer: "int n = int.Parse(Console.ReadLine());\nif (n >= 1 && n <= 10) Console.WriteLine(\"In range\");\nelse Console.WriteLine(\"Out of range\");" },
    "2.3-leap": { lesson: "2.3", title: "Leap year", tier: "stretch", minutes: 15, concepts: ["logical", "compare"], requires: ["if-else", "modulo"],
      statement: ["Read a year.", "Print `Leap` or `Not leap`.", "A year is a leap year if it divides by 4 but not by 100 — unless it also divides by 400."],
      starter: "int year = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "2024", out: "Leap" }, { stdin: "2023", out: "Not leap" }, { stdin: "1900", out: "Not leap" }],
      hidden: [{ stdin: "2000", out: "Leap" }, { stdin: "2100", out: "Not leap" }, { stdin: "1996", out: "Leap" }],
      hints: ["\"Divides by 4\" is year % 4 == 0.", "Divisible by 4 and not by 100 — or divisible by 400.", "(year % 4 == 0 && year % 100 != 0) || year % 400 == 0"],
      answer: "int year = int.Parse(Console.ReadLine());\nbool leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;\nConsole.WriteLine(leap ? \"Leap\" : \"Not leap\");" }
  } });

  /* ================================================================
     2.4 switch statements and expressions
     ================================================================ */
  lesson("2.4", {
    aqa: "4.1.1.2",
    notes: [
      page("The problem it solves"),
      "When one value is compared with many fixed options — a day number, a menu choice, a colour — a long `else if` chain repeats the same variable on every line.",
      { ul: [ "`switch` names the value once and lists the cases.", "A **switch expression** goes further: it produces a value directly." ] },
      page("Core idea"),
      run("stmt", "a switch statement", 'int choice = int.Parse(Console.ReadLine());\nswitch (choice)\n{\n    case 1:\n        Console.WriteLine("New game");\n        break;\n    case 2:\n        Console.WriteLine("Load");\n        break;\n    default:\n        Console.WriteLine("Quit");\n        break;\n}', "2"),
      run("expr", "a switch expression", 'string colour = Console.ReadLine();\nstring action = colour switch\n{\n    "red" => "Stop",\n    "amber" => "Wait",\n    "green" => "Go",\n    _ => "Unknown"\n};\nConsole.WriteLine(action);', "amber"),
      { ul: [ "`case` values must be constants.", "`default` (statement) and `_` (expression) catch everything else.", "Each statement section ends with `break` — C# never falls through." ] },
      page("Rules"),
      { ul: [
        "A non-empty `case` section must end with `break`, `return` or `throw` (else CS0163).",
        "Empty labels can share a section: `case 6: case 7:` both run the same code.",
        "A switch expression's arms are `pattern => value`, separated by commas, ending in `;`.",
        "Patterns can compare: `< 0 =>`, and combine with `and`, `or`, `not`.",
        "Arms are tried in order; the first that matches wins. Put `_` last."
      ] },
      run("shared", "shared cases", 'int day = 7;\nswitch (day)\n{\n    case 6:\n    case 7:\n        Console.WriteLine("Weekend");\n        break;\n    default:\n        Console.WriteLine("Weekday");\n        break;\n}'),
      page("Variations"),
      { h: "Ranges with relational patterns" },
      run("ranges", "temperature words", 'int t = 18;\nstring word = t switch\n{\n    < 0 => "freezing",\n    < 12 => "cold",\n    >= 12 and < 24 => "mild",\n    _ => "hot"\n};\nConsole.WriteLine(word);'),
      { h: "Several values in one arm" },
      run("or", "or patterns", "char c = 'e';\nbool vowel = c switch\n{\n    'a' or 'e' or 'i' or 'o' or 'u' => true,\n    _ => false\n};\nConsole.WriteLine(vowel);"),
      { h: "Switching on text" },
      run("text", "a menu by word", 'string cmd = "save";\nswitch (cmd)\n{\n    case "open": Console.WriteLine("Opening"); break;\n    case "save": Console.WriteLine("Saving"); break;\n    default: Console.WriteLine("Unknown command"); break;\n}'),
      page("Under the hood"),
      { ul: [ "A switch on dense integers can compile to a **jump table**: one lookup instead of a chain of comparisons.", "A switch on strings may be compiled to a hash of the string first, then a check." ] },
      page("Choosing"),
      { table: { head: ["Use", "When"], rows: [["`if` / `else if`", "conditions on different things, or complex tests"], ["`switch` statement", "one value, several fixed actions"], ["switch expression", "one value chosen into another value"]] } },
      page("Pitfalls"),
      { h: "Falling through — CS0163" },
      run("pit-fall", "a missing break", 'int d = 1;\nswitch (d)\n{\n    case 1:\n        Console.WriteLine("one");\n    case 2:\n        Console.WriteLine("two");\n        break;\n}'),
      "C# refuses to fall from one case into the next. End each section with `break`.",
      { h: "No arm matches — a runtime exception" },
      "A switch expression with no `_` arm throws `SwitchExpressionException` when nothing matches. Always end with `_ =>`.",
      { h: "A discard that hides the others" },
      "`_` matches everything. Put it first and the other arms are unreachable (an error). It belongs last.",
      page("Connections"),
      { ul: [ "**Next:** 2.5 starts loops; a menu `switch` inside a loop is the shape of most console programs.", "**Later:** unit 8 switches on types with pattern matching.", "**AQA:** 4.1.1.2 selection (CASE)." ] },
      page("Good practice"),
      { ul: [ "Prefer a switch expression when each case just produces a value.", "Always handle the unexpected: `default` or `_`.", "Keep each case short; call a method for anything long (unit 3)." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Traffic light* and *Day name*." ] },
      page("Quick reference"),
      run("qr", "both forms", 'int n = 2;\nswitch (n)\n{\n    case 1: Console.WriteLine("one"); break;\n    default: Console.WriteLine("other"); break;\n}\nstring s = n switch { 1 => "one", 2 => "two", _ => "many" };\nConsole.WriteLine(s);'),
      { ul: [ "Statement: `case x:` … `break;` · `default:`.", "Expression: `v switch { p => value, _ => other };`", "No fall-through in C#.", "Patterns: `< 0`, `>= 1 and < 5`, `'a' or 'e'`.", "End with `_` or `default`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0163", "a case falls into the next", "Pitfalls"], ["SwitchExpressionException", "no arm matched", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int n = 3;\nstring s = n switch { 1 => "one", 2 => "two", _ => "many" };\nConsole.WriteLine(s);', why: "3 matches no arm but _.", concepts: ["switch-expr"] },
        { id: "p2", src: 'int t = 12;\nConsole.WriteLine(t switch { < 0 => "ice", < 12 => "cold", _ => "warm" });', why: "12 is not below 12, so _ wins.", concepts: ["switch-expr"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so anything else prints ?", src: 'string c = Console.ReadLine();\nstring s = c switch { "y" => "yes", "n" => "no", @@ => "?" };\nConsole.WriteLine(s);', cases: [{ stdin: "y", out: "yes" }, { stdin: "x", out: "?" }], concepts: ["switch-expr"] }
      ],
      bug: [
        { id: "b1", q: "Fix the switch so 1 prints one and 2 prints two.", src: 'int d = int.Parse(Console.ReadLine());\nswitch (d)\n{\n    case 1:\n        Console.WriteLine("one");\n    case 2:\n        Console.WriteLine("two");\n        break;\n}', cases: [{ stdin: "1", out: "one" }, { stdin: "2", out: "two" }], fixedText: "no fall-through", why: "Each section must end with break.", concepts: ["switch"] }
      ]
    },
    flashcards: [
      ["Does C# let one case fall into the next?", "No — a non-empty section must end with break/return/throw (CS0163)."],
      ["What catches all other values in a switch statement? In a switch expression?", "`default:` and `_ =>`."],
      ["How do two cases share code?", "Stack empty labels: `case 6: case 7:`."],
      ["Write a range arm in a switch expression.", "`>= 12 and < 24 => \"mild\"`."],
      ["What happens if no switch-expression arm matches?", "A SwitchExpressionException at run time."],
      ["switch or if?", "switch for one value against fixed options; if for different or complex tests."]
    ],
    quiz: [
      { q: "Which ends a case section?", opts: ["continue only", "break", "a closing brace", "nothing"], ans: 1, why: "break (or return/throw)." },
      { q: "`5 switch { < 3 => \"a\", < 6 => \"b\", _ => \"c\" }` is…", opts: ["a", "b", "c", "an error"], ans: 1, why: "First matching arm: < 6." },
      { q: "Where should `_` go?", opts: ["first", "last", "anywhere", "it is optional and never matters"], ans: 1, why: "It matches everything." }
    ]
  });
  K.add({ tasks: {
    "2.4-light": { lesson: "2.4", title: "Traffic light", tier: "warm-up", minutes: 10, concepts: ["switch-expr"], requires: ["readline"],
      statement: ["Read a colour: red, amber or green.", "Print Stop, Wait or Go. Anything else prints Unknown. Use a switch expression."],
      starter: "string colour = Console.ReadLine();\n",
      examples: [{ stdin: "red", out: "Stop" }, { stdin: "green", out: "Go" }],
      hidden: [{ stdin: "amber", out: "Wait" }, { stdin: "blue", out: "Unknown" }],
      rules: [{ id: "switch", test: function (s) { return /switch\s*\{/.test(s); }, msg: "Use a switch expression: colour switch { … }." }],
      hints: ["value switch { pattern => result, … }", "One arm per colour, then _ for everything else.", "string action = colour switch { \"red\" => \"Stop\", \"amber\" => \"Wait\", \"green\" => \"Go\", _ => \"Unknown\" };"],
      answer: 'string colour = Console.ReadLine();\nstring action = colour switch\n{\n    "red" => "Stop",\n    "amber" => "Wait",\n    "green" => "Go",\n    _ => "Unknown"\n};\nConsole.WriteLine(action);' },
    "2.4-day": { lesson: "2.4", title: "Day name", tier: "core", minutes: 15, concepts: ["switch"], requires: ["parse"],
      statement: ["Read a number from 1 to 7.", "Print the day: 1 is Monday … 7 is Sunday. Anything else prints Invalid."],
      starter: "int day = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "1", out: "Monday" }, { stdin: "6", out: "Saturday" }],
      hidden: [{ stdin: "7", out: "Sunday" }, { stdin: "3", out: "Wednesday" }, { stdin: "0", out: "Invalid" }, { stdin: "8", out: "Invalid" }],
      hints: ["Seven cases and a default.", "Each case prints, then breaks — or use a switch expression.", "string name = day switch { 1 => \"Monday\", … , _ => \"Invalid\" };"],
      answer: 'int day = int.Parse(Console.ReadLine());\nstring name = day switch\n{\n    1 => "Monday",\n    2 => "Tuesday",\n    3 => "Wednesday",\n    4 => "Thursday",\n    5 => "Friday",\n    6 => "Saturday",\n    7 => "Sunday",\n    _ => "Invalid"\n};\nConsole.WriteLine(name);' }
  } });

  /* ================================================================
     2.5 while and do…while
     ================================================================ */
  lesson("2.5", {
    aqa: "4.1.1.2",
    notes: [
      page("The problem it solves"),
      "Some work repeats an unknown number of times: keep asking until the answer is valid, keep halving until it is small enough.",
      { ul: [ "A `while` loop repeats its block **while** a condition is true.", "It checks first, so it may run zero times.", "A `do … while` runs once, then checks." ] },
      page("Core idea"),
      run("count", "counting up", "int i = 1;\nwhile (i <= 5)\n{\n    Console.WriteLine(i);\n    i++;\n}"),
      { ol: [ "Check the condition.", "If it is true, run the block, then go back to 1.", "If it is false, carry on after the loop." ] },
      run("halve", "until small enough", "int n = 100;\nint steps = 0;\nwhile (n > 1)\n{\n    n /= 2;\n    steps++;\n}\nConsole.WriteLine($\"{steps} halvings\");"),
      page("Rules"),
      { ul: [
        "The block must eventually make the condition false, or the loop never ends.",
        "Three parts every loop needs: a **start** (`int i = 1;`), a **test** (`i <= 5`) and a **step** (`i++`).",
        "`while` may run zero times; `do … while` always runs at least once.",
        "`do … while` ends with a semicolon after the condition.",
        "A variable declared inside the block disappears at the end of each pass."
      ] },
      run("zero", "zero times", 'int n = 10;\nwhile (n < 5)\n{\n    Console.WriteLine("never");\n}\nConsole.WriteLine("after");'),
      run("dowhile", "at least once", 'int n = 10;\ndo\n{\n    Console.WriteLine("once");\n} while (n < 5);'),
      page("Variations"),
      { h: "Digits of a number" },
      run("digits", "% 10 and / 10 in a loop", "int n = 4096;\nint sum = 0;\nwhile (n > 0)\n{\n    sum += n % 10;\n    n /= 10;\n}\nConsole.WriteLine(sum);"),
      { h: "Keep asking until valid" },
      run("valid", "re-ask", 'int age = int.Parse(Console.ReadLine());\nwhile (age < 0 || age > 120)\n{\n    Console.WriteLine("Try again");\n    age = int.Parse(Console.ReadLine());\n}\nConsole.WriteLine($"Age {age}");', "-4\n200\n17"),
      { h: "Doubling until a target" },
      run("double", "how many years?", "double money = 100;\nint years = 0;\nwhile (money < 200)\n{\n    money *= 1.05;\n    years++;\n}\nConsole.WriteLine(years);"),
      page("Under the hood"),
      { ul: [ "A loop is a conditional jump backwards: test, run, jump to the test.", "`do … while` puts the test at the bottom, which is why it always runs once." ] },
      page("Choosing"),
      { table: { head: ["Loop", "When"], rows: [["`while`", "repeat an unknown number of times; maybe none"], ["`do … while`", "the body must run once before you can test (a menu, a first guess)"], ["`for` (2.6)", "you know how many times, or you count"]] } },
      page("Pitfalls"),
      { h: "An infinite loop" },
      run("pit-inf", "no step", "int i = 0;\nwhile (i < 3)\n{\n    Console.WriteLine(i);\n}"),
      "`i` never changes, so `i < 3` is true for ever. The runner stops it; in a real program it hangs. Add `i++`.",
      { h: "A semicolon after while" },
      run("pit-semi", "while (…);", "int i = 0;\nwhile (i < 3);\n{\n    i++;\n}\nConsole.WriteLine(i);"),
      "The `;` is the loop's whole body — an empty statement repeated for ever.",
      { h: "Using a variable declared inside — CS0103" },
      run("pit-scope", "out of scope", "int i = 0;\nwhile (i < 3)\n{\n    int last = i;\n    i++;\n}\nConsole.WriteLine(last);"),
      "`last` lives only inside the block. Declare it before the loop.",
      page("Connections"),
      { ul: [ "**Next:** 2.6 counts with `for` and walks with `foreach`.", "**Later:** 2.9 reads input until it runs out; unit 12 analyses how many times loops run.", "**AQA:** 4.1.1.2 iteration — condition-controlled loops." ] },
      page("Good practice"),
      { ul: [ "Check the three parts: start, test, step.", "Test the edges: a loop that should run once, and one that should run zero times.", "Prefer `for` when you are counting." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Count down* (a phone task) and *Digit sum*." ] },
      page("Quick reference"),
      run("qr", "both loops", 'int i = 3;\nwhile (i > 0)\n{\n    Console.Write(i + " ");\n    i--;\n}\ndo { Console.WriteLine("Go"); } while (false);'),
      { ul: [ "`while (test) { … }` — maybe zero times.", "`do { … } while (test);` — at least once.", "Start, test, step: or it never ends.", "No `;` after `while (…)`.", "Declare what you need after the loop before it." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["Did not finish", "an infinite loop", "Pitfalls"], ["CS0103", "a variable from inside the loop", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "int n = 1;\nwhile (n < 20)\n    n *= 3;\nConsole.WriteLine(n);", why: "1 → 3 → 9 → 27; 27 is not below 20.", concepts: ["while"] },
        { id: "p2", src: "int k = 5;\ndo\n{\n    k++;\n} while (k < 3);\nConsole.WriteLine(k);", why: "do…while runs once even though 5 < 3 is false.", concepts: ["do-while"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so it prints 3 2 1 on one line.", src: "int i = 3;\nwhile (i > 0)\n{\n    Console.Write(i + \" \");\n    @@;\n}", out: "3 2 1", concepts: ["while"] }
      ],
      bug: [
        { id: "b1", q: "It should print 0, 1 and 2 on three lines.", src: "int i = 0;\nwhile (i < 3)\n{\n    Console.WriteLine(i);\n}", out: "0\n1\n2", fixedText: "prints 0 1 2", why: "Add i++ inside the loop.", concepts: ["while"] }
      ]
    },
    flashcards: [
      ["When does a while loop check its condition?", "Before every pass — so it may run zero times."],
      ["When does do…while check?", "After each pass — it always runs at least once."],
      ["The three parts of a loop?", "A start, a test and a step."],
      ["What does `while (x < 3);` do?", "Loops on an empty statement — usually for ever."],
      ["How do you sum the digits of n?", "`while (n > 0) { sum += n % 10; n /= 10; }`"],
      ["Can you use a variable declared inside a loop after it?", "No — it is out of scope (CS0103)."]
    ],
    quiz: [
      { q: "`int i = 5; while (i < 5) i++;` runs the body…", opts: ["0 times", "1 time", "5 times", "for ever"], ans: 0, why: "The test is false at the start." },
      { q: "`int i = 5; do { i++; } while (i < 5);` leaves i at…", opts: ["5", "6", "4", "it never ends"], ans: 1, why: "One pass, then the test fails." },
      { q: "Which loop suits a menu shown at least once?", opts: ["while", "do … while", "foreach", "none"], ans: 1, why: "It runs once before testing." }
    ]
  });
  K.add({ tasks: {
    "2.5-countdown": { lesson: "2.5", title: "Count down", tier: "warm-up", minutes: 5, concepts: ["while"], requires: ["parse"],
      statement: ["Read n. Print n down to 1, one per line, then `Go`."],
      starter: "int n = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "3", out: "3\n2\n1\nGo" }],
      hidden: [{ stdin: "1", out: "1\nGo" }, { stdin: "0", out: "Go" }, { stdin: "5", out: "5\n4\n3\n2\n1\nGo" }],
      hints: ["Loop while n is above 0.", "Print n, then take one away.", "while (n > 0) { Console.WriteLine(n); n--; } then print Go."],
      answer: 'int n = int.Parse(Console.ReadLine());\nwhile (n > 0)\n{\n    Console.WriteLine(n);\n    n--;\n}\nConsole.WriteLine("Go");' },
    "2.5-digits": { lesson: "2.5", title: "Digit sum", tier: "core", minutes: 15, concepts: ["while", "modulo"], requires: ["int-division"],
      statement: ["Read a whole number that is 0 or more.", "Print the sum of its digits. 4096 gives 19."],
      starter: "int n = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "4096", out: "19" }, { stdin: "7", out: "7" }],
      hidden: [{ stdin: "0", out: "0" }, { stdin: "999", out: "27" }, { stdin: "1000001", out: "2" }],
      hints: ["n % 10 is the last digit.", "n / 10 removes the last digit.", "while (n > 0) { sum += n % 10; n /= 10; }"],
      answer: "int n = int.Parse(Console.ReadLine());\nint sum = 0;\nwhile (n > 0)\n{\n    sum += n % 10;\n    n /= 10;\n}\nConsole.WriteLine(sum);" }
  } });

  /* ================================================================
     2.6 for and foreach
     ================================================================ */
  lesson("2.6", {
    aqa: "4.1.1.2",
    notes: [
      page("The problem it solves"),
      "Most loops count: ten times, from 1 to n, every other number. A `while` spreads the counter over three lines; a `for` keeps them together.",
      { ul: [ "`for` puts start, test and step in one line.", "`foreach` visits every item of a collection — every character of a string, every element of an array — with no counter at all." ] },
      page("Core idea"),
      run("for", "a counting loop", "for (int i = 1; i <= 5; i++)\n{\n    Console.WriteLine(i);\n}"),
      { ul: [ "`int i = 1` — start, runs once.", "`i <= 5` — test, before every pass.", "`i++` — step, after every pass." ] },
      run("foreach", "every character", 'foreach (char c in "code")\n{\n    Console.WriteLine(c);\n}'),
      page("Rules"),
      { ul: [
        "A `for` can count in any step: `i += 2`, `i--`.",
        "The counter declared in a `for` exists only inside it.",
        "`foreach (T x in items)` gives each item in order; `x` is read-only.",
        "`foreach` works on strings now and on arrays and lists in unit 4.",
        "Use `for` when you need the position; `foreach` when you only need the items."
      ] },
      run("steps", "other steps", 'for (int i = 10; i > 0; i -= 3)\n    Console.Write(i + " ");\nConsole.WriteLine();\nfor (int i = 0; i <= 10; i += 5)\n    Console.Write(i + " ");'),
      page("Variations"),
      { h: "A running total" },
      run("total", "sum 1 to n", "int n = int.Parse(Console.ReadLine());\nint total = 0;\nfor (int i = 1; i <= n; i++)\n    total += i;\nConsole.WriteLine(total);", "10"),
      { h: "A times table" },
      run("table", "n × 1 to n × 5", 'int n = 7;\nfor (int i = 1; i <= 5; i++)\n    Console.WriteLine($"{n} x {i} = {n * i}");'),
      { h: "Counting matching characters" },
      run("vowels", "foreach with an if", 'int vowels = 0;\nforeach (char c in "education")\n{\n    if ("aeiou".Contains(c)) vowels++;\n}\nConsole.WriteLine(vowels);'),
      { h: "Positions with for" },
      run("positions", "a string by index", 'string word = "loop";\nfor (int i = 0; i < word.Length; i++)\n    Console.WriteLine($"{i}: {word[i]}");'),
      { h: "A preview: an array" },
      run("array", "foreach over numbers", "int[] marks = { 4, 9, 7 };\nint sum = 0;\nforeach (int m in marks) sum += m;\nConsole.WriteLine(sum);"),
      "Unit 4 covers arrays properly; for now, notice `foreach` reads the same way.",
      page("Under the hood"),
      { ul: [ "A `for` loop compiles to exactly the same jumps as the equivalent `while`.", "`foreach` over a string or array becomes an index loop; over other collections it asks an *enumerator* for the next item (unit 9)." ] },
      page("Choosing"),
      { table: { head: ["Loop", "When"], rows: [["`for`", "counting, or you need the position"], ["`foreach`", "every item, in order, position not needed"], ["`while`", "the number of passes is unknown"]] } },
      page("Pitfalls"),
      { h: "Off by one — IndexOutOfRangeException" },
      run("pit-off", "<= Length", 'string w = "abc";\nfor (int i = 0; i <= w.Length; i++)\n    Console.WriteLine(w[i]);'),
      "Positions run 0 to `Length - 1`. Use `i < w.Length`.",
      { h: "Assigning to the foreach variable — CS1656" },
      run("pit-ro", "c = …", "foreach (char c in \"abc\")\n{\n    c = 'x';\n}"),
      "The iteration variable is read-only. Build a new value instead (unit 5).",
      { h: "Using the counter after the loop — CS0103" },
      run("pit-scope", "i after for", "for (int i = 0; i < 3; i++) { }\nConsole.WriteLine(i);"),
      "Declare the counter before the loop if you need its last value.",
      page("Connections"),
      { ul: [ "**Next:** 2.7 leaves loops early and puts loops inside loops.", "**Later:** unit 4 loops over arrays, lists and dictionaries; unit 9 replaces many loops with LINQ.", "**AQA:** 4.1.1.2 iteration — count-controlled loops." ] },
      page("Good practice"),
      { ul: [ "Prefer `foreach` when you do not need the index — there is no counter to get wrong.", "Use `<` with a length, never `<=`.", "Name the item: `foreach (char letter in word)`." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Times table* and *Count vowels*." ] },
      page("Quick reference"),
      run("qr", "both loops", 'for (int i = 0; i < 3; i++)\n    Console.Write(i);\nConsole.WriteLine();\nforeach (char c in "hi")\n    Console.Write(c);\nConsole.WriteLine();'),
      { ul: [ "`for (start; test; step) { … }`", "`foreach (T item in items) { … }`", "Positions: `i < Length`.", "The foreach variable is read-only.", "for when you count; foreach when you only need the items." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["IndexOutOfRangeException", "<= Length", "Pitfalls"], ["CS1656", "assigning to the foreach variable", "Pitfalls"], ["CS0103", "the counter after the loop", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "int s = 0;\nfor (int i = 1; i <= 4; i++) s += i;\nConsole.WriteLine(s);", why: "1 + 2 + 3 + 4.", concepts: ["for"] },
        { id: "p2", src: 'int n = 0;\nforeach (char c in "banana")\n    if (c == \'a\') n++;\nConsole.WriteLine(n);', why: "banana has three a's.", concepts: ["foreach"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so it prints 0 2 4 6 8.", src: 'for (int i = 0; i < 10; @@)\n    Console.Write(i + " ");', out: "0 2 4 6 8", concepts: ["for"] }
      ],
      bug: [
        { id: "b1", q: "It should print each letter of cat on its own line.", src: 'string w = "cat";\nfor (int i = 0; i <= w.Length; i++)\n    Console.WriteLine(w[i]);', out: "c\na\nt", fixedText: "three letters", why: "i must stop before Length: i < w.Length.", concepts: ["for"] }
      ]
    },
    flashcards: [
      ["The three parts of a for header?", "Start; test; step — e.g. `int i = 0; i < n; i++`."],
      ["foreach vs for?", "foreach visits every item with no index; for counts and gives the position."],
      ["Last valid index of a string s?", "`s.Length - 1`."],
      ["Can you assign to a foreach variable?", "No — it is read-only (CS1656)."],
      ["Count down from 10 in steps of 3.", "`for (int i = 10; i > 0; i -= 3)`"],
      ["Does a for counter exist after the loop?", "No — its scope is the loop."]
    ],
    quiz: [
      { q: "`for (int i = 0; i < 4; i++)` runs…", opts: ["3 times", "4 times", "5 times", "for ever"], ans: 1, why: "0, 1, 2, 3." },
      { q: "Which visits each char of s without an index?", opts: ["for (int i = 0; i < s.Length; i++)", "foreach (char c in s)", "while (s)", "do s"], ans: 1, why: "foreach." },
      { q: "`for (int i = 0; i <= s.Length; i++) s[i]` will…", opts: ["work", "throw IndexOutOfRangeException", "not compile", "skip the last letter"], ans: 1, why: "i reaches Length." }
    ]
  });
  K.add({ tasks: {
    "2.6-table": { lesson: "2.6", title: "Times table", tier: "core", minutes: 10, concepts: ["for"], requires: ["parse", "interpolation"],
      statement: ["Read n. Print its times table from 1 to 10, like `3 x 1 = 3`."],
      starter: "int n = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "3", out: "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30" }],
      hidden: [{ stdin: "1", out: "1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10" }, { stdin: "12", out: "12 x 1 = 12\n12 x 2 = 24\n12 x 3 = 36\n12 x 4 = 48\n12 x 5 = 60\n12 x 6 = 72\n12 x 7 = 84\n12 x 8 = 96\n12 x 9 = 108\n12 x 10 = 120" }],
      hints: ["A for loop from 1 to 10.", "Inside, print n, i and n * i.", "for (int i = 1; i <= 10; i++) Console.WriteLine($\"{n} x {i} = {n * i}\");"],
      answer: "int n = int.Parse(Console.ReadLine());\nfor (int i = 1; i <= 10; i++)\n    Console.WriteLine($\"{n} x {i} = {n * i}\");" },
    "2.6-vowels": { lesson: "2.6", title: "Count vowels", tier: "core", minutes: 15, concepts: ["foreach"], requires: ["readline", "logical"],
      statement: ["Read a line of text.", "Print how many vowels (a, e, i, o, u — upper or lower case) it contains."],
      starter: "string text = Console.ReadLine();\n",
      examples: [{ stdin: "education", out: "5" }, { stdin: "Rhythm", out: "0" }],
      hidden: [{ stdin: "AEIOU aeiou", out: "10" }, { stdin: "xyz", out: "0" }, { stdin: "Kurenai OS", out: "5" }],
      hints: ["foreach over the characters.", "Lower-case the text first so 'A' counts as 'a'.", "if (\"aeiou\".Contains(c)) count++;"],
      answer: 'string text = Console.ReadLine();\nint count = 0;\nforeach (char c in text.ToLower())\n{\n    if ("aeiou".Contains(c)) count++;\n}\nConsole.WriteLine(count);' }
  } });

  /* ================================================================
     2.7 break, continue and nested loops
     ================================================================ */
  lesson("2.7", {
    aqa: "4.1.1.2",
    notes: [
      page("The problem it solves"),
      "Sometimes a loop finds its answer early, or meets an item it should skip. And some problems are two-dimensional: rows and columns, every pair.",
      { ul: [ "`break` leaves the loop at once.", "`continue` skips to the next pass.", "A loop inside a loop runs its inner body once for every pass of the outer." ] },
      page("Core idea"),
      run("break", "stop at the first match", 'for (int i = 1; i <= 100; i++)\n{\n    if (i % 7 == 0)\n    {\n        Console.WriteLine($"First multiple of 7: {i}");\n        break;\n    }\n}'),
      run("continue", "skip some", "for (int i = 1; i <= 10; i++)\n{\n    if (i % 3 == 0) continue;\n    Console.Write(i + \" \");\n}\nConsole.WriteLine();"),
      run("nested", "rows and columns", 'for (int r = 1; r <= 3; r++)\n{\n    for (int c = 1; c <= 4; c++)\n        Console.Write("*");\n    Console.WriteLine();\n}'),
      page("Rules"),
      { ul: [
        "`break` and `continue` affect only the **innermost** loop they are in.",
        "In a `switch` inside a loop, `break` leaves the switch, not the loop.",
        "The inner loop restarts from its beginning on every outer pass.",
        "Total passes multiply: 3 outer × 4 inner = 12 inner bodies.",
        "Give nested counters distinct, meaningful names (`row`, `col`), not `i` twice."
      ] },
      run("innermost", "break leaves one loop", 'for (int r = 1; r <= 3; r++)\n{\n    for (int c = 1; c <= 3; c++)\n    {\n        if (c == 2) break;\n        Console.Write($"{r}{c} ");\n    }\n}\nConsole.WriteLine();'),
      page("Variations"),
      { h: "A triangle" },
      run("triangle", "the inner limit depends on the outer", 'for (int row = 1; row <= 4; row++)\n{\n    for (int col = 1; col <= row; col++)\n        Console.Write("*");\n    Console.WriteLine();\n}'),
      { h: "A multiplication grid" },
      run("grid", "aligned columns", "for (int r = 1; r <= 3; r++)\n{\n    for (int c = 1; c <= 3; c++)\n        Console.Write($\"{r * c,4}\");\n    Console.WriteLine();\n}"),
      { h: "Is it prime?" },
      run("prime", "break when a factor turns up", 'int n = 91;\nbool prime = n > 1;\nfor (int d = 2; d * d <= n; d++)\n{\n    if (n % d == 0)\n    {\n        prime = false;\n        break;\n    }\n}\nConsole.WriteLine(prime);'),
      page("Under the hood"),
      { ul: [ "`break` is a jump to just after the loop; `continue` a jump to the step (in a `for`) or the test (in a `while`).", "Nested loops cost the product of their passes — the root of the *O(n²)* you will meet in unit 12." ] },
      page("Pitfalls"),
      { h: "break in a switch inside a loop" },
      "Inside a `switch`, `break` ends the case, not the loop. Use a `bool` the loop tests, or `return` (unit 3).",
      { h: "continue in a while that skips the step" },
      run("pit-cont", "continue before i++", "int i = 0;\nwhile (i < 5)\n{\n    if (i == 2) continue;\n    Console.Write(i);\n    i++;\n}"),
      "At `i == 2` the `continue` skips `i++`, so `i` stays 2 for ever. Step before continuing, or use a `for`.",
      { h: "break outside a loop — CS0139" },
      run("pit-break", "a stray break", 'int x = 3;\nif (x > 1)\n{\n    break;\n}'),
      "`break` only makes sense inside a loop or a switch.",
      page("Connections"),
      { ul: [ "**Next:** 2.8 writes small decisions as expressions.", "**Later:** unit 4's 2D arrays use nested loops; unit 12 measures their cost.", "**AQA:** 4.1.1.2 nested iteration." ] },
      page("Good practice"),
      { ul: [ "A `break` that ends a search should be next to the line that found it.", "If you need to leave two loops, move them into a method and `return` (unit 3).", "Two levels of nesting is usually enough; deeper wants a method." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *First multiple* and *Star triangle*." ] },
      page("Quick reference"),
      run("qr", "break, continue, nested", 'for (int i = 1; i <= 6; i++)\n{\n    if (i == 2) continue;  // skip 2\n    if (i == 5) break;     // stop at 5\n    Console.Write(i);\n}\nConsole.WriteLine();'),
      { ul: [ "`break` — leave the innermost loop.", "`continue` — next pass of the innermost loop.", "Inner loops restart each outer pass.", "Passes multiply.", "In a while, step before continue." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0139", "break outside a loop", "Pitfalls"], ["Did not finish", "continue skipped the step", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "for (int i = 1; i <= 5; i++)\n{\n    if (i == 3) break;\n    Console.Write(i);\n}", why: "It stops before printing 3.", concepts: ["break-continue"] },
        { id: "p2", src: "int n = 0;\nfor (int a = 0; a < 3; a++)\n    for (int b = 0; b < 4; b++)\n        n++;\nConsole.WriteLine(n);", why: "3 × 4 inner passes.", concepts: ["nested-loops"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so odd numbers are skipped: 2 4 6", src: 'for (int i = 1; i <= 6; i++)\n{\n    if (i % 2 == 1) @@;\n    Console.Write(i + " ");\n}', out: "2 4 6", concepts: ["break-continue"] }
      ],
      bug: [
        { id: "b1", q: "It should print 0 1 3 4 (skipping 2).", src: "int i = 0;\nwhile (i < 5)\n{\n    if (i == 2) continue;\n    Console.Write(i + \" \");\n    i++;\n}", out: "0 1 3 4", fixedText: "skips 2 without hanging", why: "The continue skipped i++; step first (or use a for loop).", concepts: ["break-continue"] }
      ]
    },
    flashcards: [
      ["What does `break` do in a loop?", "Leaves the innermost loop immediately."],
      ["What does `continue` do?", "Skips the rest of this pass and starts the next one."],
      ["How many times does the inner body run for 3 outer × 4 inner passes?", "12."],
      ["Does `break` in a switch inside a loop end the loop?", "No — only the switch."],
      ["Why can `continue` hang a while loop?", "It can skip the step, so the condition never changes."],
      ["How do you leave two loops at once?", "Put them in a method and return, or use a bool flag."]
    ],
    quiz: [
      { q: "`for (i 1..5) { if (i == 4) continue; Write(i); }` prints…", opts: ["1234", "1235", "123", "12345"], ans: 1, why: "4 is skipped." },
      { q: "A triangle's inner loop runs to…", opts: ["a fixed number", "the outer counter", "0", "Length"], ans: 1, why: "Row r has r stars." },
      { q: "`break` outside any loop or switch is…", opts: ["ignored", "CS0139", "a runtime error", "allowed in if"], ans: 1, why: "No enclosing loop." }
    ]
  });
  K.add({ tasks: {
    "2.7-multiple": { lesson: "2.7", title: "First multiple", tier: "core", minutes: 10, concepts: ["break-continue"], requires: ["for", "modulo"],
      statement: ["Read a start number and a divisor, one per line.", "Print the first number **greater than** the start that divides exactly by the divisor."],
      starter: "int start = int.Parse(Console.ReadLine());\nint d = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "10\n7", out: "14" }, { stdin: "20\n5", out: "25" }],
      hidden: [{ stdin: "0\n1", out: "1" }, { stdin: "99\n100", out: "100" }],
      hints: ["Loop upwards from start + 1.", "Stop with break at the first n % d == 0.", "for (int n = start + 1; ; n++) { if (n % d == 0) { Console.WriteLine(n); break; } }"],
      answer: "int start = int.Parse(Console.ReadLine());\nint d = int.Parse(Console.ReadLine());\nfor (int n = start + 1; ; n++)\n{\n    if (n % d == 0)\n    {\n        Console.WriteLine(n);\n        break;\n    }\n}" },
    "2.7-triangle": { lesson: "2.7", title: "Star triangle", tier: "stretch", minutes: 15, concepts: ["nested-loops"], requires: ["for"],
      statement: ["Read n. Print a triangle of n rows: row 1 has one star, row n has n."],
      starter: "int n = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "3", out: "*\n**\n***" }],
      hidden: [{ stdin: "1", out: "*" }, { stdin: "5", out: "*\n**\n***\n****\n*****" }],
      hints: ["An outer loop for the rows.", "The inner loop runs up to the row number.", "for (row 1..n) { for (col 1..row) Write(\"*\"); WriteLine(); }"],
      answer: 'int n = int.Parse(Console.ReadLine());\nfor (int row = 1; row <= n; row++)\n{\n    for (int col = 1; col <= row; col++)\n        Console.Write("*");\n    Console.WriteLine();\n}' }
  } });

  /* ================================================================
     2.8 The ternary operator and guards
     ================================================================ */
  lesson("2.8", {
    aqa: "4.1.1.2",
    notes: [
      page("The problem it solves"),
      "Many decisions only pick between two values. Writing a whole `if`/`else` for that is five lines for one idea.",
      { ul: [ "The **ternary** operator `?:` picks a value in one expression.", "A **guard clause** deals with the unusual case first and stops, so the main code stays unindented." ] },
      page("Core idea"),
      run("tern", "a decision as a value", 'int n = 7;\nstring kind = n % 2 == 0 ? "even" : "odd";\nConsole.WriteLine(kind);'),
      "Read it as: *condition* ? *value if true* : *value if false*.",
      run("guard", "a guard first", 'int count = int.Parse(Console.ReadLine());\nif (count == 0)\n{\n    Console.WriteLine("Nothing to average");\n    return;\n}\nConsole.WriteLine(100 / count);', "0"),
      "In top-level code, `return` ends the program early. In a method (unit 3) it ends the method.",
      page("Rules"),
      { ul: [
        "Both results of `?:` must be the same type (or convert to one).",
        "`?:` is an **expression**: it gives a value. It cannot hold statements like `Console.WriteLine` on its own line.",
        "`?:` binds loosely: bracket it inside `+` or interpolation if in doubt.",
        "A guard handles one bad case and leaves immediately with `return` (or `break`/`continue` in a loop).",
        "Avoid nesting ternaries; use `switch` for more than two outcomes."
      ] },
      run("brackets", "inside a sentence", 'int items = 1;\nConsole.WriteLine($"{items} item{(items == 1 ? "" : "s")}");'),
      page("Variations"),
      { h: "Plurals" },
      run("plural", "1 item, 2 items", 'for (int n = 0; n <= 2; n++)\n    Console.WriteLine(n + (n == 1 ? " item" : " items"));'),
      { h: "Clamping a value" },
      run("clamp", "no more than 100", "int score = 130;\nint shown = score > 100 ? 100 : score;\nConsole.WriteLine(shown);\nConsole.WriteLine(Math.Min(score, 100));"),
      { h: "Input with a default" },
      run("default", "an empty line becomes \"friend\"", 'string name = Console.ReadLine();\nname = name == "" ? "friend" : name.Trim();\nConsole.WriteLine($"Hello, {name}!");', "\n"),
      { ul: [ "`Console.ReadLine()` returns the line without its Enter: `\"\"` for an empty line.", "When there is no input left at all it returns `null`, and calling a method on `null` throws `NullReferenceException`.", "`string.IsNullOrWhiteSpace(s)` asks all three questions at once: null, empty or only spaces." ] },
      run("eof", "no line at all is null, not \"\"", 'string line = Console.ReadLine();\nConsole.WriteLine(line == null ? "no input at all" : $"got [{line}]");'),
      run("blank", "one test for null, empty or spaces", 'string s = Console.ReadLine();\nstring shown = string.IsNullOrWhiteSpace(s) ? "(blank)" : s.Trim();\nConsole.WriteLine(shown);', "   "),
      { h: "Guards in a loop" },
      run("loopguard", "skip blanks", 'string[] lines = { "a", "", "b" };\nforeach (string line in lines)\n{\n    if (line == "") continue;\n    Console.WriteLine(line);\n}'),
      page("Under the hood"),
      { ul: [ "`?:` compiles to the same jumps as `if`/`else`; it is about clarity, not speed.", "Guards are *early exits*. They keep the normal path at the left margin, which is easier to read than a pyramid of nested `else`s." ] },
      page("Pitfalls"),
      { h: "Different types — CS0173" },
      run("pit-types", "string or int?", 'int n = 3;\nvar x = n > 2 ? "big" : 0;'),
      "Both sides must agree. Use `\"0\"` or `n.ToString()`.",
      { h: "Trimming a line that is not there — NullReferenceException" },
      run("pit-null", "no input, so ReadLine gave null", 'string name = Console.ReadLine();\nConsole.WriteLine(name.Trim());'),
      "Test for `null` (or use `string.IsNullOrWhiteSpace`) before calling a method on what `ReadLine` returned. Unit 7 shows how the compiler can warn you.",
      { h: "A ternary as a statement — CS0201" },
      run("pit-stmt", "?: on its own line", 'int n = 3;\nn > 2 ? Console.WriteLine("a") : Console.WriteLine("b");'),
      "`?:` chooses a **value**. To choose an action, use `if`.",
      { h: "Unreadable nesting" },
      "`a ? b ? 1 : 2 : 3` is legal and nobody can read it. Two outcomes: ternary. More: `switch` expression.",
      page("Connections"),
      { ul: [ "**Next:** 2.9 puts the unit together in a game loop.", "**Later:** unit 3 uses guard clauses at the top of every method that validates input.", "**AQA:** selection; good programming practice." ] },
      page("Good practice"),
      { ul: [ "Use `?:` for small value choices that fit on one line.", "Put guards first, then the main work, unindented.", "Each guard says one thing: *if this is wrong, stop*." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Even or odd* and *Safe divide*." ] },
      page("Quick reference"),
      run("qr", "both shapes", 'int n = 5;\nstring s = n > 0 ? "positive" : "not positive";\nConsole.WriteLine(s);\nif (n < 0) return;   // guard\nConsole.WriteLine("main path");'),
      { ul: [ "`cond ? a : b` — a value.", "Both sides the same type.", "Bracket it inside interpolation.", "Guards: handle the odd case, then leave.", "More than two outcomes: switch." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0173", "the two results have different types", "Pitfalls"], ["CS0201", "a ternary used as a statement", "Pitfalls"], ["NullReferenceException", "a method called on the null ReadLine returns when input runs out", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int t = 30;\nConsole.WriteLine(t > 25 ? "hot" : "fine");', why: "30 is over 25.", concepts: ["ternary"] },
        { id: "p2", src: 'int n = 2;\nConsole.WriteLine($"{n} file{(n == 1 ? "" : "s")}");', why: "n is not 1, so the s is added.", concepts: ["ternary"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gaps so it prints even or odd.", src: 'int n = int.Parse(Console.ReadLine());\nConsole.WriteLine(n % 2 == 0 @@ "even" @@ "odd");', cases: [{ stdin: "4", out: "even" }, { stdin: "7", out: "odd" }], concepts: ["ternary"] }
      ],
      bug: [
        { id: "b1", q: "It should say 1 item, but 3 items.", src: 'int n = int.Parse(Console.ReadLine());\nConsole.WriteLine(n + n == 1 ? " item" : " items");', cases: [{ stdin: "1", out: "1 item" }, { stdin: "3", out: "3 items" }], fixedText: "the plural is right", why: "+ ran first: bracket the ternary — n + (n == 1 ? \" item\" : \" items\").", concepts: ["ternary"] }
      ]
    },
    flashcards: [
      ["Read `c ? a : b` aloud.", "If c then a, otherwise b."],
      ["Can `?:` replace any if/else?", "Only one that chooses a value; actions need if."],
      ["What is a guard clause?", "An early check that handles a bad case and leaves, keeping the main path unindented."],
      ["What does `return` do in top-level code?", "Ends the program early."],
      ["What is CS0173?", "The ternary's two results have no common type."],
      ["Why bracket a ternary inside +?", "Otherwise + binds first and changes the meaning."],
      ["What does `Console.ReadLine()` return when the input has run out?", "`null` — not `\"\"`. Check it, or use `string.IsNullOrWhiteSpace`."]
    ],
    quiz: [
      { q: "`int x = 5 > 3 ? 1 : 2;` x is…", opts: ["1", "2", "5", "3"], ans: 0, why: "The condition is true." },
      { q: "Which compiles?", opts: ["var v = ok ? \"a\" : 1;", "string v = ok ? \"a\" : \"b\";", "ok ? Write(1) : Write(2);", "int v = ok ? \"1\" : 2;"], ans: 1, why: "Both sides are strings." },
      { q: "Guards belong…", opts: ["at the end", "at the start", "inside every loop", "only in methods"], ans: 1, why: "Deal with the odd case first." },
      { q: "The user just presses Enter. `Console.ReadLine()` returns…", opts: ["\"\"", "null", "\"\\n\"", "it waits for more"], ans: 0, why: "An empty line is the empty string; null means no input at all." }
    ]
  });
  K.add({ tasks: {
    "2.8-parity": { lesson: "2.8", title: "Even or odd", tier: "warm-up", minutes: 5, concepts: ["ternary"], requires: ["parse"],
      statement: ["Read a whole number and print `7 is odd` or `8 is even`, choosing the word with `?:`."],
      starter: "int n = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "7", out: "7 is odd" }, { stdin: "8", out: "8 is even" }],
      hidden: [{ stdin: "0", out: "0 is even" }, { stdin: "-3", out: "-3 is odd" }],
      rules: [{ id: "ternary", test: function (s) { return /\?[^?;]*:/.test(s); }, msg: "Choose the word with the ternary operator ?:." }],
      hints: ["n % 2 == 0 tells you even.", "condition ? \"even\" : \"odd\"", "Console.WriteLine($\"{n} is {(n % 2 == 0 ? \"even\" : \"odd\")}\");"],
      answer: 'int n = int.Parse(Console.ReadLine());\nstring kind = n % 2 == 0 ? "even" : "odd";\nConsole.WriteLine($"{n} is {kind}");' },
    "2.8-divide": { lesson: "2.8", title: "Safe divide", tier: "core", minutes: 10, concepts: ["guard"], requires: ["int-division", "modulo"],
      statement: ["Read a and b, one per line.", "If b is 0 print `Cannot divide by zero`. Otherwise print `a / b = q r m`, the quotient and remainder."],
      starter: "int a = int.Parse(Console.ReadLine());\nint b = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "17\n5", out: "17 / 5 = 3 r 2" }, { stdin: "4\n0", out: "Cannot divide by zero" }],
      hidden: [{ stdin: "0\n3", out: "0 / 3 = 0 r 0" }, { stdin: "9\n3", out: "9 / 3 = 3 r 0" }],
      hints: ["Handle b == 0 first.", "Print the message, then return.", "if (b == 0) { Console.WriteLine(\"Cannot divide by zero\"); return; }"],
      answer: 'int a = int.Parse(Console.ReadLine());\nint b = int.Parse(Console.ReadLine());\nif (b == 0)\n{\n    Console.WriteLine("Cannot divide by zero");\n    return;\n}\nConsole.WriteLine($"{a} / {b} = {a / b} r {a % b}");' }
  } });

  /* ================================================================
     2.9 Practise: a number-guessing game
     ================================================================ */
  lesson("2.9", {
    aqa: "4.1.1.2",
    notes: [
      page("The problem it solves"),
      "A game is input, decisions and a loop working together: read a guess, compare, say higher or lower, repeat until right.",
      { ul: [ "This lesson builds one from the unit's pieces.", "The skill is the **loop design**: what ends it, what changes each pass, what is printed when." ] },
      page("Core idea"),
      { ol: [ "Know the target.", "Repeat: read a guess, count it, compare.", "Too low → Higher. Too high → Lower. Equal → congratulate and stop." ] },
      run("game", "the whole game", 'int target = 42;\nint tries = 0;\nwhile (true)\n{\n    int guess = int.Parse(Console.ReadLine());\n    tries++;\n    if (guess == target)\n    {\n        Console.WriteLine($"Correct in {tries} guesses");\n        break;\n    }\n    Console.WriteLine(guess < target ? "Higher" : "Lower");\n}', "50\n30\n42"),
      "`while (true)` with a `break` inside is a clear shape when the exit is in the middle of the loop.",
      page("Rules"),
      { ul: [
        "Each `ReadLine` consumes one line of input; in a task, the lines are the guesses.",
        "Count inside the loop, before you might `break`.",
        "When input runs out, `ReadLine` returns `null`. Check for it if the input might end.",
        "Print exactly what the task asks; the checker compares every line."
      ] },
      run("null", "stop when input ends", 'int count = 0;\nstring line = Console.ReadLine();\nwhile (line != null)\n{\n    count++;\n    line = Console.ReadLine();\n}\nConsole.WriteLine($"{count} lines");', "a\nb\nc"),
      page("Variations"),
      { h: "A limit on tries" },
      run("limit", "five guesses at most", 'int target = 7;\nbool won = false;\nfor (int tries = 1; tries <= 5; tries++)\n{\n    int guess = int.Parse(Console.ReadLine());\n    if (guess == target) { won = true; break; }\n}\nConsole.WriteLine(won ? "You win" : "Out of guesses");', "1\n2\n3\n4\n5"),
      { h: "Read until a word" },
      run("done", "a sentinel", 'int total = 0;\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    total += int.Parse(line);\n    line = Console.ReadLine();\n}\nConsole.WriteLine(total);', "4\n5\n6\ndone"),
      page("Pitfalls"),
      { h: "Forgetting to read again" },
      "In a `while (line != \"done\")` loop, the last line must read the **next** line, or the loop tests the same one for ever.",
      { h: "Counting after the break" },
      "If `tries++` comes after `break`, the winning guess is not counted.",
      { h: "Parsing the sentinel — FormatException" },
      run("pit-parse", "int.Parse(\"done\")", 'int total = 0;\nwhile (true)\n{\n    int n = int.Parse(Console.ReadLine());\n    if (n == 0) break;\n    total += n;\n}\nConsole.WriteLine(total);', "3\ndone"),
      "Check for the word **before** parsing.",
      { h: "A declaration inside the loop used outside — CS0103" },
      run("pit-scope", "guess after the loop", "while (true)\n{\n    int guess = 5;\n    break;\n}\nConsole.WriteLine(guess);"),
      page("Connections"),
      { ul: [ "**Next:** unit 3 splits programs like this into methods.", "**Later:** capstone 1 (a text adventure) is this loop at full size.", "**AQA:** the NEA's iterative development." ] },
      page("Good practice"),
      { ul: [ "Write the loop's exit condition in a comment first.", "Test the shortest game (right first time) and a long one.", "Keep the input reading in one place in the loop." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Guessing game* and *Running average*." ] },
      page("Quick reference"),
      run("qr", "the read-until shape", 'string line = Console.ReadLine();\nwhile (line != null && line != "done")\n{\n    Console.WriteLine($"got {line}");\n    line = Console.ReadLine();\n}', "x\ndone"),
      { ul: [ "`while (true) { …; if (done) break; }`", "Read again at the end of each pass.", "Check the sentinel before parsing.", "Count before break.", "`ReadLine` gives null when input ends." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["FormatException", "parsed the sentinel", "Pitfalls"], ["CS0103", "used a loop variable outside", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int t = 10, n = 0;\nforeach (int g in new[] { 4, 12, 10 })\n{\n    n++;\n    if (g == t) break;\n}\nConsole.WriteLine(n);', why: "The third guess is right.", concepts: ["input-loop"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so it stops at done.", src: 'int n = 0;\nstring line = Console.ReadLine();\nwhile (line != @@)\n{\n    n++;\n    line = Console.ReadLine();\n}\nConsole.WriteLine(n);', cases: [{ stdin: "a\nb\ndone", out: "2" }, { stdin: "done", out: "0" }], concepts: ["input-loop"] }
      ],
      bug: [
        { id: "b1", q: "Add numbers until done, then print the total.", src: 'int total = 0;\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    total += int.Parse(line);\n}\nConsole.WriteLine(total);', cases: [{ stdin: "1\n2\ndone", out: "3" }], fixedText: "reads every line", why: "Read the next line at the end of each pass.", concepts: ["input-loop"] }
      ]
    },
    flashcards: [
      ["What does ReadLine return when input ends?", "`null`."],
      ["What is a sentinel?", "A special input (like \"done\") that marks the end."],
      ["When is `while (true)` with `break` a good shape?", "When the exit naturally comes in the middle of the loop."],
      ["Where must the next ReadLine go in a read-until loop?", "At the end of each pass, so the test sees the new line."],
      ["Why check the sentinel before parsing?", "Parsing \"done\" as a number throws FormatException."]
    ],
    quiz: [
      { q: "Guesses 5, 9, 7 for target 7: how many tries?", opts: ["2", "3", "7", "1"], ans: 1, why: "The third guess is right." },
      { q: "A read-until-done loop never ends. The likely cause?", opts: ["no ReadLine inside the loop", "a missing semicolon", "int.Parse", "Console.WriteLine"], ans: 0, why: "The tested line never changes." },
      { q: "Which loop suits \"repeat until correct\"?", opts: ["for (int i = 0; i < 10; i++)", "while (true) with break", "foreach", "none"], ans: 1, why: "The number of passes is unknown." }
    ]
  });
  K.add({ tasks: {
    "2.9-guess": { lesson: "2.9", title: "Guessing game", tier: "stretch", minutes: 20, phone: false, concepts: ["input-loop", "while", "ternary"], requires: ["if-else", "parse"],
      statement: ["The first line is the secret number. Every line after it is a guess.", "For each wrong guess print `Higher` or `Lower`. On the right guess print `Correct in N guesses` and stop."],
      starter: "int target = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "42\n50\n30\n42", out: "Lower\nHigher\nCorrect in 3 guesses" }],
      hidden: [{ stdin: "7\n7", out: "Correct in 1 guesses" }, { stdin: "1\n5\n3\n2\n1", out: "Lower\nLower\nLower\nCorrect in 4 guesses" }, { stdin: "100\n1\n99\n100", out: "Higher\nHigher\nCorrect in 3 guesses" }],
      hints: ["Loop until the guess equals the target.", "Count each guess before comparing.", "while (true) { read; tries++; if (guess == target) { print; break; } print guess < target ? \"Higher\" : \"Lower\"; }"],
      answer: 'int target = int.Parse(Console.ReadLine());\nint tries = 0;\nwhile (true)\n{\n    int guess = int.Parse(Console.ReadLine());\n    tries++;\n    if (guess == target)\n    {\n        Console.WriteLine($"Correct in {tries} guesses");\n        break;\n    }\n    Console.WriteLine(guess < target ? "Higher" : "Lower");\n}' },
    "2.9-average": { lesson: "2.9", title: "Running average", tier: "stretch", minutes: 20, phone: false, concepts: ["input-loop"], requires: ["parse", "format"],
      statement: ["Read whole numbers, one per line, until a line says `done`.", "Print `N numbers, average X.XX`. If there were none, print `No numbers`."],
      starter: "",
      examples: [{ stdin: "4\n5\n6\ndone", out: "3 numbers, average 5.00" }, { stdin: "done", out: "No numbers" }],
      hidden: [{ stdin: "1\n2\ndone", out: "2 numbers, average 1.50" }, { stdin: "10\ndone", out: "1 numbers, average 10.00" }],
      hints: ["Keep a count and a total.", "Check for done before parsing; guard the empty case before dividing.", "(double)total / count, shown with :F2"],
      answer: 'int count = 0, total = 0;\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    total += int.Parse(line);\n    count++;\n    line = Console.ReadLine();\n}\nif (count == 0)\n{\n    Console.WriteLine("No numbers");\n    return;\n}\nConsole.WriteLine($"{count} numbers, average {(double)total / count:F2}");' }
  } });

  /* ================================================================
     retrieval cards
     ================================================================ */
  K.add({ cards: {
    "u2-grades": { title: "if / else if boundaries", lesson: "2.2", concepts: ["else-if"], kind: "write",
      vary: function (r) {
        var hi = 60 + 5 * r(5), lo = hi - 10 - 5 * r(3);
        var ins = [hi + 3, hi, hi - 1, lo, lo - 1, 0];
        var f = function (m) { return m >= hi ? "High" : m >= lo ? "Middle" : "Low"; };
        return { prompt: "Read a mark. Print High for " + hi + " or more, Middle for " + lo + " or more, otherwise Low.", label: "boundaries " + hi + " and " + lo,
          params: ["High ≥ " + hi, "Middle ≥ " + lo], starter: "int mark = int.Parse(Console.ReadLine());\n",
          cases: ins.map(function (m) { return { stdin: String(m), out: f(m) }; }), hint: "Test the highest boundary first.",
          answer: "int mark = int.Parse(Console.ReadLine());\nif (mark >= " + hi + ") Console.WriteLine(\"High\");\nelse if (mark >= " + lo + ") Console.WriteLine(\"Middle\");\nelse Console.WriteLine(\"Low\");" };
      } },
    "u2-logic": { title: "&& and ||", lesson: "2.3", concepts: ["logical"], kind: "predict",
      vary: function (r) {
        var a = r(20), b = r(20), c = r(20);
        return { prompt: "What does this print?", label: "new values for a, b and c", params: [],
          src: "int a = " + a + ", b = " + b + ", c = " + c + ";\nConsole.WriteLine(a > b && b > c);\nConsole.WriteLine(a > b || b > c);\nConsole.WriteLine(!(a == c));", hint: "&& needs both; || needs one." };
      } },
    "u2-sum": { title: "A counting loop", lesson: "2.6", concepts: ["for"], kind: "write",
      vary: function (r, n) {
        var step = [1, 2, 3][n % 3], k = 3 + r(6);
        var f = function (x) { var s = 0; for (var i = step === 1 ? 1 : step; i <= x; i += step) s += i; return s; };
        var word = step === 1 ? "every number" : "every multiple of " + step;
        return { prompt: "Read n. Print the sum of " + word + " from " + (step === 1 ? 1 : step) + " up to n.", label: "sum of " + word,
          params: ["step " + step], starter: "int n = int.Parse(Console.ReadLine());\n",
          cases: [k * step, 1, 0, 20].map(function (x) { return { stdin: String(x), out: String(f(x)) }; }), hint: "for (int i = " + (step === 1 ? 1 : step) + "; i <= n; i += " + step + ")",
          answer: "int n = int.Parse(Console.ReadLine());\nint total = 0;\nfor (int i = " + (step === 1 ? 1 : step) + "; i <= n; i += " + step + ") total += i;\nConsole.WriteLine(total);" };
      } },
    "u2-while": { title: "Tracing a while loop", lesson: "2.5", concepts: ["while"], kind: "predict",
      vary: function (r) {
        var start = 1 + r(5), m = 2 + r(3), lim = 30 + r(70);
        return { prompt: "What does this print?", label: "a new start and limit", params: [],
          src: "int n = " + start + ";\nint steps = 0;\nwhile (n < " + lim + ")\n{\n    n *= " + m + ";\n    steps++;\n}\nConsole.WriteLine($\"{n} {steps}\");", hint: "Write down n after each pass." };
      } },
    "u2-switch": { title: "switch expressions", lesson: "2.4", concepts: ["switch-expr"], kind: "fill",
      vary: function (r) {
        var words = [["1", "one"], ["2", "two"], ["3", "three"]], v = 1 + r(5);
        var out = v <= 3 ? words[v - 1][1] : "many";
        return { prompt: "Fill the gap so every other value prints many.", label: "the catch-all arm", params: ["n = " + v],
          src: "int n = " + v + ";\nstring s = n switch { 1 => \"one\", 2 => \"two\", 3 => \"three\", @@ => \"many\" };\nConsole.WriteLine(s);", cases: [{ stdin: "", out: out }], hint: "The discard matches anything." };
      } },
    "u2-ternary": { title: "The ternary operator", lesson: "2.8", concepts: ["ternary"], kind: "predict",
      vary: function (r) {
        var n = r(4), t = 10 + r(30);
        return { prompt: "What does this print?", label: "a plural and a threshold", params: [],
          src: "int n = " + n + ", t = " + t + ";\nConsole.WriteLine(n + (n == 1 ? \" file\" : \" files\"));\nConsole.WriteLine(t > 25 ? \"warm\" : \"cool\");", hint: "Condition ? if true : if false." };
      } },
    "u2-nested": { title: "Nested loops", lesson: "2.7", concepts: ["nested-loops", "break-continue"], kind: "predict",
      vary: function (r) {
        var a = 2 + r(3), b = 2 + r(4), skip = 1 + r(b);
        return { prompt: "What does this print?", label: "a new grid with a skip", params: [],
          src: "int count = 0;\nfor (int i = 0; i < " + a + "; i++)\n{\n    for (int j = 1; j <= " + b + "; j++)\n    {\n        if (j == " + skip + ") continue;\n        count++;\n    }\n}\nConsole.WriteLine(count);", hint: "Each outer pass skips one inner pass." };
      } },
    "u2-countdown": { title: "Count down with while", lesson: "2.5", concepts: ["while"], kind: "write",
      vary: function (r, n) {
        var word = pick(r, ["Go", "Lift off", "Ready"]);
        var f = function (k) { var o = []; for (var i = k; i > 0; i--) o.push(String(i)); o.push(word); return o.join("\n"); };
        return { prompt: "Read n. Print n down to 1, then " + word + ".", label: "ends with " + word, params: ["then: " + word],
          starter: "int n = int.Parse(Console.ReadLine());\n", cases: [3, 1, 0].map(function (k) { return { stdin: String(k), out: f(k) }; }),
          hint: "while (n > 0) { … n--; }", answer: "int n = int.Parse(Console.ReadLine());\nwhile (n > 0)\n{\n    Console.WriteLine(n);\n    n--;\n}\nConsole.WriteLine(\"" + word + "\");" };
      } }
  } });
})();
