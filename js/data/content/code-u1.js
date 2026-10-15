/* Kurenai OS — data/content/code-u1.js
   Code · Unit 1 · Values, types and variables (roadmap 5.3).

   Each lesson follows the notes contract (docs/code-plan.md §4): the
   problem, the core idea, the rules, variations, under the hood, pitfalls,
   connections, good practice, practise, and a quick reference last. Every
   {run} listing runs in the in-app runner and was checked against .NET
   (tools/cs_diff.mjs). Practice items are checked by running them; tasks
   carry examples, hidden cases, three hints and an answer; retrieval
   cards generate a new variation each review.

   Nullable reference types are off in units 1–6 (decision Q2).          */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function run(id, cap, src, stdin) { return { run: { id: id, cap: cap, src: src, stdin: stdin || "" } }; }
  function page(t) { return { page: t }; }
  function call(t, h, body) { return { callout: { t: t, h: h, body: body } }; }
  function lesson(ref, o) { window.KOS_CONTENT["code:" + ref] = o; }
  function pick(r, list) { return list[r(list.length)]; }

  /* ================================================================
     concepts — what the skill map tracks
     ================================================================ */
  K.add({ concepts: {
    "program": { name: "Top-level statements", lesson: "1.1", about: "a program's first lines" },
    "writeline": { name: "Console.WriteLine", lesson: "1.1", about: "printing a line" },
    "write": { name: "Console.Write", lesson: "1.1", about: "printing without a new line" },
    "types": { name: "int · double · bool", lesson: "1.2", about: "the built-in value types" },
    "char-string": { name: "char vs string", lesson: "1.2", about: "one character or text" },
    "variables": { name: "Variables", lesson: "1.3", about: "named storage" },
    "assign": { name: "Assignment", lesson: "1.3", about: "giving a variable a new value" },
    "var": { name: "var", lesson: "1.3", about: "the compiler infers the type" },
    "const": { name: "const", lesson: "1.3", about: "a value fixed at compile time" },
    "int-division": { name: "Integer division", lesson: "1.4", about: "/ between two ints" },
    "modulo": { name: "% remainder", lesson: "1.4", about: "what is left over" },
    "compound": { name: "+= and ++", lesson: "1.4", about: "updating in place" },
    "precedence": { name: "Precedence", lesson: "1.4", about: "which operator goes first" },
    "interpolation": { name: "String interpolation", lesson: "1.5", about: "$\"…{x}…\"" },
    "format": { name: "Format :F2", lesson: "1.5", about: "numbers inside text" },
    "escapes": { name: "Escapes \\n \\\"", lesson: "1.5", about: "characters you cannot type directly" },
    "readline": { name: "Console.ReadLine", lesson: "1.6", about: "reading a line of input" },
    "parse": { name: "int.Parse", lesson: "1.6", about: "text to number" },
    "casting": { name: "Casting", lesson: "1.6", about: "(int) and (double)" },
    "overflow": { name: "Overflow", lesson: "1.7", about: "int.MaxValue + 1" },
    "precision": { name: "double precision", lesson: "1.7", about: "0.1 + 0.2" },
    "decimal": { name: "decimal for money", lesson: "1.7", about: "exact decimal arithmetic" },
    "ipo": { name: "Input → process → output", lesson: "1.8", about: "planning a whole program" }
  } });

  /* ================================================================
     1.1 Your first program
     ================================================================ */
  lesson("1.1", {
    aqa: "4.1.1.2",
    notes: [
      page("The problem it solves"),
      "A computer does exactly what it is told, one instruction at a time.",
      "A **program** is that list of instructions, written so a person can read it and a compiler can turn it into something the machine runs.",
      { ul: [
        "C# is a **compiled** language: the whole program is checked before any of it runs.",
        "A typo stops it at the start — not halfway through, after it has done half the work.",
        "The smallest useful program prints something, so you can see it ran."
      ] },
      page("Core idea"),
      "This is a complete C# program. Press **Run**.",
      run("hello", "Program.cs", 'Console.WriteLine("Hello, world!");'),
      { ul: [
        "`Console` is the text window your program talks to.",
        "`WriteLine` prints its text and then moves to a new line.",
        "The text goes in double quotes: that makes it a **string**.",
        "The **semicolon** ends the statement, like a full stop ends a sentence."
      ] },
      "Several statements run top to bottom:",
      run("three", "three lines", 'Console.WriteLine("Ready");\nConsole.WriteLine("Steady");\nConsole.WriteLine("Go!");'),
      page("Rules"),
      { ul: [
        "Statements run **in order**, top to bottom, one at a time.",
        "Every statement ends with `;`.",
        "C# is **case-sensitive**: `Console` works, `console` does not.",
        "These lines at the top of a file are **top-level statements**: C# wraps them in a hidden `Main` method, the program's entry point.",
        "Only one file in a project may hold top-level statements.",
        "`//` starts a comment: the compiler ignores the rest of the line."
      ] },
      run("comments", "comments", '// This line is for people, not the compiler.\nConsole.WriteLine("Comments never print."); // nor does this one'),
      page("Variations"),
      { h: "Write vs WriteLine" },
      "`Write` prints without moving to a new line, so the next output carries on where it stopped.",
      run("write", "Write then WriteLine", 'Console.Write("Loading");\nConsole.Write("...");\nConsole.WriteLine(" done");\nConsole.WriteLine("Next line");'),
      { h: "An empty line" },
      run("blank", "a blank line", 'Console.WriteLine("Top");\nConsole.WriteLine();\nConsole.WriteLine("Bottom");'),
      { h: "Numbers print too" },
      "A number needs no quotes. C# works out the sum first, then prints the result.",
      run("sum", "printing a sum", 'Console.WriteLine(6 * 7);\nConsole.WriteLine("6 * 7");'),
      { ul: [
        "`6 * 7` without quotes is a calculation: it prints `42`.",
        "`\"6 * 7\"` in quotes is text: it prints exactly `6 * 7`."
      ] },
      page("Under the hood"),
      { ol: [
        "**Compile.** The C# compiler reads every line, checks names and types, and produces IL (intermediate language).",
        "**Run.** The .NET runtime loads the IL, its JIT compiler turns it into machine code, and the processor runs it.",
        "**Output.** `Console.WriteLine` hands text to the operating system, which shows it in the terminal."
      ] },
      "If step 1 finds a problem, steps 2 and 3 never happen. That is why a compile error prints no output at all — not even the lines above the mistake.",
      call("info", "In this app", ["The in-app runner does the same checks, then runs your code on this device. It never sends it anywhere."]),
      page("Pitfalls"),
      { h: "A missing semicolon — CS1002" },
      run("pit-semi", "no semicolon", 'Console.WriteLine("One")\nConsole.WriteLine("Two");'),
      "The compiler stops before anything runs, so even \"One\" is not printed. Add `;` at the end of line 1.",
      { h: "The wrong case — CS0103" },
      run("pit-case", "lower-case console", 'console.WriteLine("Hi");'),
      "`console` is a name C# has never heard of. The type is `Console`, with a capital C.",
      { h: "A string that never ends — CS1010" },
      run("pit-quote", "a missing quote", 'Console.WriteLine("Hi);'),
      "Every opening `\"` needs a closing `\"` on the same line.",
      { h: "Expecting Write to start a new line" },
      run("pit-write", "Write, Write", 'Console.Write("Hello");\nConsole.Write("World");'),
      "It prints `HelloWorld` on one line. Use `WriteLine` when the next output should start on a new line.",
      page("Connections"),
      { ul: [
        "**Next:** 1.2 gives values their types, and 1.5 builds richer text to print.",
        "**Later:** unit 3 shows the `Main` method that top-level statements hide, and Bridge B runs the same program in Rider with `dotnet run`.",
        "**AQA:** 4.1.1.2 programming concepts — sequence is the first of the three constructs (sequence, selection, iteration)."
      ] },
      page("Good practice"),
      { ul: [
        "Run early and often: write one line, run, then the next.",
        "Read error messages from the top. The first one is usually the real cause; later ones are often knock-on effects.",
        "Comments explain **why**, not what. `// keep it under 80 chars for the receipt printer` helps; `// print hello` does not.",
        "Output that a person reads should be a sentence, not a bare number."
      ] },
      page("Practise"),
      { ul: [
        "**Practice tab:** predict the output of `Write` and `WriteLine` together, fix a missing semicolon.",
        "**Tasks tab:** *Hello, Kurenai* (warm-up) and *A box of stars* (core).",
        "**Retrieval:** once you pass a task, its skills come back as new variations."
      ] },
      page("Quick reference"),
      "Everything in this lesson on one screen.",
      run("qr", "the lines you will write most", 'Console.WriteLine("text");   // print, then a new line\nConsole.Write("text");       // print, stay on the line\nConsole.WriteLine();          // an empty line\n// a comment'),
      { ul: [
        "Statements run top to bottom.",
        "Every statement ends with `;`.",
        "`Console` has a capital C: C# is case-sensitive.",
        "A compile error stops everything before it runs.",
        "Text in quotes prints as it is; a sum without quotes is worked out first."
      ] },
      { table: { head: ["Error", "Means", "Page"], rows: [
        ["CS1002", "a `;` is missing", "Pitfalls"],
        ["CS0103", "a name C# does not know (often the case)", "Pitfalls"],
        ["CS1010", "a string was not closed", "Pitfalls"]
      ] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.Write("A");\nConsole.WriteLine("B");\nConsole.Write("C");', why: "`Write` stays on the line, so A and B share it; `WriteLine` then moves on and C starts the next line.", concepts: ["write", "writeline"] },
        { id: "p2", src: 'Console.WriteLine(2 + 3);\nConsole.WriteLine("2 + 3");', why: "Without quotes the sum is worked out (5); in quotes it is text and prints exactly.", concepts: ["writeline"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the two words print on one line: Hello World", src: 'Console.@@("Hello ");\nConsole.WriteLine("World");', out: "Hello World", why: "`Write` leaves the cursor on the same line.", concepts: ["write"] }
      ],
      bug: [
        { id: "b1", q: "It should print two lines. Fix it, then run.", expect: "Expected: Ready, then Go! on the next line.", src: 'Console.WriteLine("Ready")\nConsole.WriteLine("Go!");', out: "Ready\nGo!", fixedText: "prints Ready, then Go!", why: "Line 1 was missing its semicolon.", concepts: ["program"] }
      ]
    },
    flashcards: [
      ["What does `Console.WriteLine` do?", "Prints its text, then moves to a new line."],
      ["`Write` vs `WriteLine`?", "`Write` stays on the same line; `WriteLine` ends the line after printing."],
      ["What ends every C# statement?", "A semicolon `;`."],
      ["Is C# case-sensitive?", "Yes — `Console` and `console` are different names."],
      ["What are top-level statements?", "Statements at the top of one file that C# wraps in a hidden `Main` method: the program's entry point."],
      ["Why does a compile error print nothing at all?", "The whole program is checked before any of it runs, so nothing runs."],
      ["What does `//` do?", "Starts a comment: the compiler ignores the rest of the line."],
      ["What is error CS1002?", "A semicolon is expected."]
    ],
    quiz: [
      { q: "What does `Console.WriteLine(4 + 4);` print?", opts: ["4 + 4", "8", "44", "Nothing: it needs quotes"], ans: 1, why: "Without quotes the sum is worked out before printing." },
      { q: "A program has an error on line 5. What prints from lines 1–4?", opts: ["Lines 1–4 print, then it stops", "Nothing prints", "Everything except line 5", "Only line 1"], ans: 1, why: "C# compiles the whole program first; a compile error means nothing runs." },
      { q: "Which line is correct?", opts: ["console.WriteLine(\"Hi\");", "Console.Writeline(\"Hi\");", "Console.WriteLine(\"Hi\");", "Console.WriteLine(Hi);"], ans: 2, why: "Exact capitals, and text in double quotes." },
      { q: "What does `Console.Write(\"a\"); Console.Write(\"b\");` print?", opts: ["a and b on two lines", "ab", "a b", "b"], ans: 1, why: "`Write` never adds a new line." },
      { q: "What happens to text after `//` on a line?", opts: ["It prints", "It is ignored by the compiler", "It causes an error", "It runs first"], ans: 1, why: "It is a comment." }
    ]
  });
  K.add({ tasks: {
    "1.1-hello": { lesson: "1.1", title: "Hello, Kurenai", tier: "warm-up", minutes: 5, concepts: ["writeline"], requires: [],
      statement: ["Print exactly these two lines:", { ul: ["`Hello, Kurenai!`", "`Ready to code.`"] }],
      starter: "// Print the two lines here\n",
      examples: [{ stdin: "", out: "Hello, Kurenai!\nReady to code." }], hidden: [],
      hints: ["One `Console.WriteLine` per line of output.", "The text goes in double quotes, and each statement ends with `;`.", "Console.WriteLine(\"Hello, Kurenai!\");  then the same again for the second line."],
      answer: 'Console.WriteLine("Hello, Kurenai!");\nConsole.WriteLine("Ready to code.");' },
    "1.1-box": { lesson: "1.1", title: "A box of stars", tier: "core", minutes: 10, concepts: ["writeline", "write"], requires: ["writeline"],
      statement: ["Print this box of stars, exactly:", { code: { lang: "", src: "*****\n*   *\n*****" } }, "Use `Console.Write` at least once."],
      starter: "",
      examples: [{ stdin: "", out: "*****\n*   *\n*****" }], hidden: [],
      rules: [{ id: "write", test: function (s) { return /Console\.Write\s*\(/.test(s); }, msg: "The task asks you to use Console.Write at least once." }],
      hints: ["Three lines of output, so three line endings.", "Print the middle line in two parts: `Write(\"*   \")` stays on the line…", "…then `WriteLine(\"*\")` finishes it and moves on."],
      answer: 'Console.WriteLine("*****");\nConsole.Write("*   ");\nConsole.WriteLine("*");\nConsole.WriteLine("*****");' }
  } });

  /* ================================================================
     1.2 Values and types
     ================================================================ */
  lesson("1.2", {
    aqa: "4.1.1.1",
    notes: [
      page("The problem it solves"),
      "`7 / 2` should be 3.5 — but is it? It depends on what 7 and 2 **are**.",
      { ul: [
        "Every value in C# has a **type**: whole number, real number, true/false, one character, text.",
        "The type decides what you may do with it and what the result is.",
        "Because C# knows every type before running, it can stop you adding a word to a number."
      ] },
      page("Core idea"),
      { table: { head: ["Type", "Holds", "Literal"], rows: [
        ["`int`", "a whole number", "`42`, `-7`, `0`"],
        ["`double`", "a number with a decimal point", "`3.5`, `-0.25`, `2.0`"],
        ["`bool`", "true or false", "`true`, `false`"],
        ["`char`", "one character", "`'A'`, `'7'`, `' '`"],
        ["`string`", "text, any length", "`\"Ada\"`, `\"\"`"]
      ] } },
      run("five", "five types", 'Console.WriteLine(42);\nConsole.WriteLine(3.5);\nConsole.WriteLine(true);\nConsole.WriteLine(\'A\');\nConsole.WriteLine("Ada");'),
      "Notice `true` prints as `True` with a capital T. That is how .NET writes a `bool` as text.",
      page("Rules"),
      { ul: [
        "A whole-number literal (`7`) is an `int`. One with a point (`7.0`) is a `double`.",
        "`char` uses single quotes and holds **exactly one** character. `string` uses double quotes.",
        "An operation between two `int`s gives an `int`. If either side is a `double`, the result is a `double`.",
        "`bool` is only `true` or `false` — never 0 or 1 in C#.",
        "A `string` can be empty (`\"\"`); a `char` cannot."
      ] },
      run("div", "the type decides the answer", 'Console.WriteLine(7 / 2);\nConsole.WriteLine(7.0 / 2);\nConsole.WriteLine(7 / 2.0);'),
      "Two `int`s divide to an `int`, dropping the fraction: 3. Make either side a `double` and you get 3.5.",
      page("Variations"),
      { h: "Comparisons produce bools" },
      run("cmp", "a question is a bool", 'Console.WriteLine(5 > 3);\nConsole.WriteLine(2 == 3);\nConsole.WriteLine(10 != 10);'),
      { h: "A char is not a string" },
      run("char", "one character", 'Console.WriteLine(\'K\');\nConsole.WriteLine("K");\nConsole.WriteLine("Kurenai".Length);'),
      { ul: [ "Both print K, but they are different types.", "`.Length` is how many characters a string holds." ] },
      { h: "Other number types you will meet" },
      { table: { head: ["Type", "Range", "When"], rows: [
        ["`long`", "about ±9.2 quintillion", "an `int` is too small (1.7)"],
        ["`decimal`", "28 significant digits, exact in base 10", "money (1.7)"],
        ["`float`", "about 7 digits", "graphics and games"]
      ] } },
      page("Under the hood"),
      { ul: [
        "An `int` is 32 bits: 4 bytes of memory in two's complement, so it runs from −2,147,483,648 to 2,147,483,647.",
        "A `double` is 64 bits in IEEE 754 floating point: about 15–16 significant digits.",
        "A `char` is 16 bits holding one UTF-16 code unit — `'A'` is the number 65.",
        "A `bool` takes a byte, though it only needs one bit.",
        "A `string` is a sequence of `char`s; its `Length` counts them."
      ] },
      run("code", "a char is a number underneath", 'Console.WriteLine((int)\'A\');\nConsole.WriteLine((char)66);'),
      page("Pitfalls"),
      { h: "Text where a number goes — CS0029" },
      run("pit-str", "a string into an int", 'int age = "17";\nConsole.WriteLine(age);'),
      "`\"17\"` is text that happens to look like a number. Write `17` without quotes (or parse input, in 1.6).",
      { h: "A decimal point into an int — CS0266" },
      run("pit-dbl", "a double into an int", 'int price = 2.5;\nConsole.WriteLine(price);'),
      "An `int` cannot hold .5, so C# refuses rather than silently drop it. Use `double`.",
      { h: "Two characters in single quotes" },
      run("pit-char", "a char with two letters", "char c = 'ab';\nConsole.WriteLine(c);"),
      "A `char` is exactly one character. Use a `string` for more.",
      { h: "Expecting 7 / 2 to be 3.5" },
      "It compiles and runs, and prints 3. This is the one that slips through: no error, just a wrong answer. Make one side a `double`.",
      page("Choosing"),
      { table: { head: ["You need", "Use"], rows: [
        ["a count, an age, a score", "`int`"],
        ["a measurement: height, temperature, distance", "`double`"],
        ["money", "`decimal` (1.7)"],
        ["yes/no, on/off", "`bool`"],
        ["one letter or symbol", "`char`"],
        ["a name, a message, a line of input", "`string`"]
      ] } },
      page("Connections"),
      { ul: [
        "**Next:** 1.3 stores values in variables, which carry these types.",
        "**Later:** 1.7 meets the limits of `int` and `double`; unit 5 works with `string` in depth.",
        "**AQA:** 4.1.1.1 data types; 4.5.5.1 character codes (why `'A'` is 65)."
      ] },
      page("Good practice"),
      { ul: [
        "Pick the type from what the value **means**, not what it looks like today. A price is money even when it is £3.",
        "Write `2.0` rather than `2` when you mean a real number — it documents your intent.",
        "Never compare a `bool` with `== true`; `if (ready)` reads better than `if (ready == true)`."
      ] },
      page("Practise"),
      { ul: [ "**Practice:** predict what each type prints, and fix a type mismatch.", "**Tasks:** *Name the types* and *Halves*." ] },
      page("Quick reference"),
      run("qr", "one of each", 'int count = 3;\ndouble height = 1.72;\nbool ready = true;\nchar grade = \'A\';\nstring name = "Ada";'),
      { ul: [
        "`7` is an `int`; `7.0` is a `double`.",
        "int ÷ int drops the fraction: `7 / 2` is 3.",
        "`char` is one character in single quotes; `string` is text in double quotes.",
        "`bool` prints as `True` / `False`.",
        "Text that looks like a number is still text."
      ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0029", "a value of the wrong type", "Pitfalls"], ["CS0266", "would lose information: needs a cast", "Pitfalls"], ["CS1012", "too many characters in a char", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "Console.WriteLine(9 / 2);\nConsole.WriteLine(9 / 2.0);", why: "int ÷ int is an int (4); with a double on either side you get 4.5.", concepts: ["types"] },
        { id: "p2", src: "Console.WriteLine(3 > 2);\nConsole.WriteLine(\"Ada\".Length);", why: "A comparison is a bool (True); \"Ada\" has 3 characters.", concepts: ["types", "char-string"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with a type so it prints 1.5", src: "@@ half = 3 / 2.0;\nConsole.WriteLine(half);", out: "1.5", also: "var", why: "3 / 2.0 is a double.", concepts: ["types"] }
      ],
      bug: [
        { id: "b1", q: "It should print 2.5. Fix the type, then run.", src: "int price = 2.5;\nConsole.WriteLine(price);", out: "2.5", fixedText: "prints 2.5", why: "An int cannot hold 2.5 — the variable must be a double.", concepts: ["types"] }
      ]
    },
    flashcards: [
      ["Which type for a whole number?", "`int`"],
      ["Which type for a number with a decimal point?", "`double`"],
      ["`char` vs `string`?", "`char` is one character in single quotes; `string` is text in double quotes."],
      ["What does `7 / 2` give in C#?", "3 — both are ints, so the fraction is dropped."],
      ["How do you get 3.5 from 7 and 2?", "Make one a double: `7.0 / 2` or `7 / 2.0`."],
      ["How does `true` print?", "`True`, with a capital T."],
      ["What is error CS0029?", "Cannot implicitly convert one type to another — e.g. a string into an int."],
      ["How many bits in an `int`, and its range?", "32 bits: −2,147,483,648 to 2,147,483,647."],
      ["What number is the char `'A'` underneath?", "65 (its UTF-16 code)."]
    ],
    quiz: [
      { q: "What type is `4.0`?", opts: ["int", "double", "string", "char"], ans: 1, why: "A literal with a decimal point is a double." },
      { q: "What does `Console.WriteLine(10 / 4);` print?", opts: ["2.5", "2", "3", "2.0"], ans: 1, why: "Two ints divide to an int; the .5 is dropped." },
      { q: "Which line will not compile?", opts: ["string s = \"\";", "char c = 'x';", "char c = \"x\";", "bool b = false;"], ans: 2, why: "Double quotes make a string, not a char." },
      { q: "Which type for 'is the light on?'", opts: ["int", "string", "bool", "char"], ans: 2, why: "True or false is a bool." },
      { q: "What does `\"Kurenai\".Length` give?", opts: ["6", "7", "8", "It does not compile"], ans: 1, why: "K-u-r-e-n-a-i is 7 characters." }
    ]
  });
  K.add({ tasks: {
    "1.2-types": { lesson: "1.2", title: "Name the types", tier: "core", minutes: 10, concepts: ["types", "char-string"], requires: ["writeline"],
      statement: ["Declare one variable of each type and print them on one line, separated by spaces:", { ul: ["an `int` age of 17", "a `double` height of 1.72", "a `bool` student that is true", "a `char` grade of A", "a `string` name of Ada"] }, "Print: `Ada 17 1.72 True A`"],
      starter: "",
      examples: [{ stdin: "", out: "Ada 17 1.72 True A" }], hidden: [],
      rules: [{ id: "types", test: function (s) { return /\bint\s+\w/.test(s) && /\bdouble\s+\w/.test(s) && /\bbool\s+\w/.test(s) && /\bchar\s+\w/.test(s) && /\bstring\s+\w/.test(s); }, msg: "Declare one variable of each of the five types: int, double, bool, char and string." }],
      hints: ["Write the type, a name, `=`, the value and `;` — five times.", "A char takes single quotes: `'A'`. A string takes double quotes.", "Join them in one WriteLine with + \" \" + between each, or with interpolation from 1.5."],
      answer: 'int age = 17;\ndouble height = 1.72;\nbool student = true;\nchar grade = \'A\';\nstring name = "Ada";\nConsole.WriteLine(name + " " + age + " " + height + " " + student + " " + grade);' },
    "1.2-halves": { lesson: "1.2", title: "Halves", tier: "warm-up", minutes: 5, concepts: ["types"], requires: [],
      statement: ["Print half of 9 twice: first as an `int` division, then as a `double` division.", "Print:", { code: { lang: "", src: "4\n4.5" } }],
      starter: "Console.WriteLine(9 / 2);\n",
      examples: [{ stdin: "", out: "4\n4.5" }], hidden: [],
      rules: [{ id: "calc", test: function (s) { return !/WriteLine\s*\(\s*4\.5\s*\)/.test(s) && !/"4\.5"/.test(s); }, msg: "Work out 4.5 with a division rather than typing 4.5." }],
      hints: ["The first line is already there.", "For the second, make one side a double.", "9 / 2.0"],
      answer: "Console.WriteLine(9 / 2);\nConsole.WriteLine(9 / 2.0);" }
  } });

  /* ================================================================
     1.3 Variables, assignment and const
     ================================================================ */
  lesson("1.3", {
    aqa: "4.1.1.6",
    notes: [
      page("The problem it solves"),
      "A program needs to **remember** things: a score, a name, a running total.",
      { ul: [ "A **variable** is a named box that holds one value of one type.", "You can read it as often as you like, and replace its value.", "A good name turns `0.2 * 49.99` into `vatRate * price`." ] },
      page("Core idea"),
      run("decl", "declare, assign, read", 'int score = 0;\nConsole.WriteLine(score);\nscore = 10;\nConsole.WriteLine(score);'),
      { ul: [
        "`int score = 0;` **declares** a variable called `score` of type `int` and **initialises** it to 0.",
        "`score = 10;` **assigns** a new value. The old one is gone.",
        "Reading `score` uses whatever it holds **at that moment**."
      ] },
      "`=` means *becomes*, not *equals*. Read `score = score + 5` as \"score becomes score plus 5\".",
      run("grow", "using its own value", 'int score = 10;\nscore = score + 5;\nConsole.WriteLine(score);'),
      page("Rules"),
      { ul: [
        "Declare a variable **once**, with its type. Afterwards, use the name alone.",
        "A variable's type never changes: an `int` stays an `int`.",
        "It must have a value before it is read, or C# refuses (CS0165).",
        "Names start with a letter or `_`, contain letters, digits and `_`, and are case-sensitive.",
        "Local variables are written in **camelCase**: `totalPrice`, `isReady`.",
        "`var` lets the compiler infer the type from the value — the type is still fixed.",
        "`const` makes a value fixed for ever; it must be known when compiling."
      ] },
      run("var", "var still has a type", 'var count = 3;      // int\nvar ratio = 0.5;    // double\nvar name = "Ada";   // string\nConsole.WriteLine(count + 1);\nConsole.WriteLine(ratio * 2);\nConsole.WriteLine(name.Length);'),
      run("const", "const never changes", 'const double VatRate = 0.2;\ndouble price = 50;\nConsole.WriteLine(price * VatRate);'),
      page("Variations"),
      { h: "Several at once" },
      run("multi", "two in one line", "int a = 4, b = 9;\nConsole.WriteLine(a + b);"),
      { h: "Swapping two values" },
      "To swap, you need somewhere to keep one value while the other moves.",
      run("swap-temp", "swap with a temporary", "int a = 4, b = 9;\nint temp = a;\na = b;\nb = temp;\nConsole.WriteLine(a + \" \" + b);"),
      "C# can also swap with a **tuple**, with no temporary variable:",
      run("swap-tuple", "swap with a tuple", "int a = 4, b = 9;\n(a, b) = (b, a);\nConsole.WriteLine(a + \" \" + b);"),
      { h: "Copying is copying" },
      run("copy", "a copy, not a link", "int a = 5;\nint b = a;\na = 99;\nConsole.WriteLine(b);"),
      "`b` got a **copy** of 5. Changing `a` later does not touch it. (Unit 7 shows objects, where this is different.)",
      page("Under the hood"),
      { ul: [
        "A local `int` lives in the method's **stack frame**: four bytes reserved when the method starts.",
        "The name exists only for the compiler. In the running program it is just a slot.",
        "`const` values are not stored at all: the compiler pastes the number wherever the name is used.",
        "`var` is decided at compile time; it is not a \"dynamic\" type."
      ] },
      page("Pitfalls"),
      { h: "Reading before giving a value — CS0165" },
      run("pit-unset", "used before it is set", "int total;\nConsole.WriteLine(total);"),
      "Give it a starting value: `int total = 0;`.",
      { h: "Declaring twice — CS0128" },
      run("pit-twice", "int again", "int score = 1;\nint score = 2;\nConsole.WriteLine(score);"),
      "The second line should just be `score = 2;` — no type.",
      { h: "Changing a const — CS0131" },
      "`const int Max = 10; Max = 11;` will not compile: a constant cannot be assigned. Use a variable if it must change.",
      { h: "Swapping by overwriting" },
      run("pit-swap", "a = b; b = a;", "int a = 4, b = 9;\na = b;\nb = a;\nConsole.WriteLine(a + \" \" + b);"),
      "After `a = b` the 4 is gone, so both end up 9. Keep a copy first, or use a tuple.",
      { h: "A name in the wrong case — CS0103" },
      "`Score` and `score` are two different names. Pick one spelling and keep it.",
      page("Choosing"),
      { table: { head: ["Write", "When"], rows: [
        ["`int count = 0;`", "the type helps the reader"],
        ["`var name = Console.ReadLine();`", "the type is obvious from the right-hand side"],
        ["`const double VatRate = 0.2;`", "a fixed rule of the program, never changed while it runs"]
      ] } },
      page("Connections"),
      { ul: [
        "**Next:** 1.4 updates variables with `+=` and `++`.",
        "**Later:** unit 3 explains scope (where a name is visible); unit 7 shows reference types, where copying a variable shares the object.",
        "**AQA:** 4.1.1.6 constants and variables; 4.1.1.13 local variables."
      ] },
      page("Good practice"),
      { ul: [
        "Name by meaning: `minutesLate`, not `x` or `m2`.",
        "Declare a variable close to where it is first used.",
        "A number with a meaning gets a `const` name — no \"magic numbers\".",
        "Constants are PascalCase in C#: `VatRate`, `MaxPlayers`."
      ] },
      page("Practise"),
      { ul: [ "**Practice:** predict what a copy holds, fill in a swap.", "**Tasks:** *Swap two variables* and *Running total*.", "**Retrieval:** *Swap two variables* returns with new values each time." ] },
      page("Quick reference"),
      run("qr", "the five lines", 'int score = 0;              // declare and initialise\nscore = 10;                 // assign\nvar name = "Ada";           // inferred type: string\nconst double VatRate = 0.2; // fixed for ever\nConsole.WriteLine(score);'),
      { ul: [ "`=` means becomes.", "Declare once; assign many times.", "A variable needs a value before it is read.", "`var` still has one fixed type.", "Swap with a temporary or a tuple, never `a = b; b = a;`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0165", "read before it was given a value", "Pitfalls"], ["CS0128", "declared twice", "Pitfalls"], ["CS0131", "assigned to a constant", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "int a = 3;\nint b = a;\na = 10;\nConsole.WriteLine(b);", why: "b got a copy of 3; changing a afterwards does not change b.", concepts: ["variables", "assign"] },
        { id: "p2", src: "int x = 2;\nx = x * 5;\nx = x - 1;\nConsole.WriteLine(x);", why: "x becomes 10, then 9.", concepts: ["assign"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gaps to swap a and b with a temporary variable.", src: "int a = 1, b = 2;\nint temp = @@;\na = b;\nb = @@;\nConsole.WriteLine(a + \" \" + b);", out: "2 1", concepts: ["assign"] }
      ],
      bug: [
        { id: "b1", q: "It should print 9 4. Fix the swap.", src: "int a = 4, b = 9;\na = b;\nb = a;\nConsole.WriteLine(a + \" \" + b);", out: "9 4", fixedText: "prints 9 4", why: "After a = b the 4 was lost; keep it in a temporary first, or use (a, b) = (b, a).", concepts: ["assign"] }
      ]
    },
    flashcards: [
      ["What does `=` mean in C#?", "Assignment: the variable becomes the value on the right."],
      ["Declare vs assign?", "Declaring gives a name and a type once (`int x = 0;`); assigning changes the value (`x = 5;`)."],
      ["What does `var` do?", "Lets the compiler infer the type from the value; the type is still fixed."],
      ["What is a `const`?", "A value fixed at compile time that can never be assigned."],
      ["What is error CS0165?", "Use of an unassigned local variable — it was read before it had a value."],
      ["How do you swap a and b without a temporary?", "`(a, b) = (b, a);`"],
      ["Why does `a = b; b = a;` not swap?", "After the first line a's old value is gone, so both hold b."],
      ["Naming style for local variables? For constants?", "camelCase for locals (`totalPrice`); PascalCase for constants (`VatRate`)."]
    ],
    quiz: [
      { q: "After `int a = 5; int b = a; a = 8;` what is b?", opts: ["5", "8", "13", "It does not compile"], ans: 0, why: "b holds a copy taken when a was 5." },
      { q: "Which line declares a constant?", opts: ["var Max = 10;", "int Max = 10;", "const int Max = 10;", "Max = 10;"], ans: 2, why: "`const` makes it fixed." },
      { q: "`var x = 2.5;` — what type is x?", opts: ["var", "int", "double", "string"], ans: 2, why: "The compiler infers double from 2.5." },
      { q: "What is printed? `int s = 1; s = s + s; s = s + s; Console.WriteLine(s);`", opts: ["2", "3", "4", "8"], ans: 2, why: "1 → 2 → 4." },
      { q: "`int total; Console.WriteLine(total);` gives…", opts: ["0", "an empty line", "CS0165", "null"], ans: 2, why: "Local variables must be assigned before they are read." }
    ]
  });
  K.add({ tasks: {
    "1.3-swap": { lesson: "1.3", title: "Swap two variables", tier: "core", minutes: 10, concepts: ["assign", "variables"], requires: ["writeline"],
      statement: ["The starter declares `a` as 4 and `b` as 9.", "Swap their values, then print `a` and `b` separated by a space.", "Do not change the first line, and do not type the numbers again."],
      starter: "int a = 4, b = 9;\n",
      examples: [{ stdin: "", out: "9 4" }], hidden: [],
      rules: [
        { id: "decl", test: function (s) { return /int\s+a\s*=\s*4\s*,\s*b\s*=\s*9/.test(s); }, msg: "Keep the first line as it is: int a = 4, b = 9;" },
        { id: "noprint", test: function (s) { return !/"9 4"|\(\s*9\s*\)|\b9\s*\+\s*" "/.test(s); }, msg: "Print the variables, not the numbers typed in again." }
      ],
      hints: ["When a gets b's value, a's old value is lost unless you keep it somewhere.", "A third variable, temp, can hold a's value while a takes b's.", "int temp = a; a = b; b = temp;  — or (a, b) = (b, a);"],
      answer: "int a = 4, b = 9;\n(a, b) = (b, a);\nConsole.WriteLine(a + \" \" + b);" },
    "1.3-total": { lesson: "1.3", title: "Running total", tier: "core", minutes: 10, concepts: ["variables", "assign"], requires: ["writeline"],
      statement: ["Start a `total` at 0.", "Add 5, then 12, then 8 — printing the total after each addition.", "Print:", { code: { lang: "", src: "5\n17\n25" } }],
      starter: "int total = 0;\n",
      examples: [{ stdin: "", out: "5\n17\n25" }], hidden: [],
      rules: [{ id: "uses", test: function (s) { return (s.match(/WriteLine\s*\(\s*total\s*\)/g) || []).length >= 3; }, msg: "Print the variable total each time, not the number." }],
      hints: ["total = total + 5; then print total.", "Repeat for 12 and 8.", "Three pairs of lines: update, then print."],
      answer: "int total = 0;\ntotal = total + 5;\nConsole.WriteLine(total);\ntotal = total + 12;\nConsole.WriteLine(total);\ntotal = total + 8;\nConsole.WriteLine(total);" }
  } });
  /* ================================================================
     1.4 Arithmetic and operators
     ================================================================ */
  lesson("1.4", {
    aqa: "4.1.1.3",
    notes: [
      page("The problem it solves"),
      "Most programs calculate: totals, averages, how many boxes, how many left over.",
      { ul: [ "C# has the arithmetic you know, plus two you may not: integer division and the remainder `%`.", "The **types** of the values decide the result — the same `/` gives 3 or 3.5.", "Precedence decides what happens first, exactly as in maths." ] },
      page("Core idea"),
      { table: { head: ["Operator", "Means", "Example", "Result"], rows: [
        ["`+`", "add", "`7 + 2`", "9"], ["`-`", "subtract", "`7 - 2`", "5"], ["`*`", "multiply", "`7 * 2`", "14"],
        ["`/`", "divide", "`7 / 2`", "3 (ints) · 3.5 (doubles)"], ["`%`", "remainder", "`7 % 2`", "1"]
      ] } },
      run("ops", "the five operators", "int a = 17, b = 5;\nConsole.WriteLine(a + b);\nConsole.WriteLine(a - b);\nConsole.WriteLine(a * b);\nConsole.WriteLine(a / b);\nConsole.WriteLine(a % b);"),
      "17 ÷ 5 is 3 remainder 2: `/` gives the 3 and `%` gives the 2.",
      page("Rules"),
      { ul: [
        "`*`, `/` and `%` happen before `+` and `-`. Equal precedence goes left to right.",
        "Brackets override precedence: `(2 + 3) * 4` is 20.",
        "int `/` int **truncates** towards zero: `7 / 2` is 3, `-7 / 2` is −3.",
        "`%` takes the sign of the left side: `-7 % 3` is −1.",
        "Dividing an `int` by zero throws `DivideByZeroException`. A `double` divided by zero gives ∞.",
        "`x += 5` means `x = x + 5`. The same for `-=`, `*=`, `/=`, `%=`.",
        "`x++` adds one; `x--` takes one away."
      ] },
      run("prec", "precedence", "Console.WriteLine(2 + 3 * 4);\nConsole.WriteLine((2 + 3) * 4);\nConsole.WriteLine(20 / 4 * 2);\nConsole.WriteLine(20 / (4 * 2));"),
      page("Variations"),
      { h: "Minutes into hours and minutes" },
      run("hm", "/ and % together", "int minutes = 135;\nint hours = minutes / 60;\nint left = minutes % 60;\nConsole.WriteLine(hours + \" h \" + left + \" min\");"),
      { h: "Odd or even" },
      run("odd", "% 2", "Console.WriteLine(14 % 2);\nConsole.WriteLine(15 % 2);"),
      "A remainder of 0 when dividing by 2 means even. Unit 2 turns this into a decision.",
      { h: "The last digit" },
      run("digit", "% 10 and / 10", "int n = 4096;\nConsole.WriteLine(n % 10);\nConsole.WriteLine(n / 10);"),
      { h: "Updating in place" },
      run("compound", "+=, *= and ++", "int score = 10;\nscore += 5;\nscore *= 2;\nscore--;\nConsole.WriteLine(score);"),
      { h: "An average needs a double" },
      run("avg", "average of three", "int a = 7, b = 8, c = 10;\nConsole.WriteLine((a + b + c) / 3);\nConsole.WriteLine((a + b + c) / 3.0);"),
      page("Under the hood"),
      { ul: [
        "The processor has separate instructions for whole-number and floating-point division; C# picks one from the types.",
        "Integer division is *truncation*: the fractional part is thrown away, not rounded. 2.99 would become 2.",
        "`x++` and `++x` both add one. As a **value** inside a bigger expression, `x++` gives the old value and `++x` the new one."
      ] },
      run("postpre", "x++ vs ++x", "int x = 5;\nint a = x++;\nint b = ++x;\nConsole.WriteLine(a + \" \" + b + \" \" + x);"),
      "Clearest is to use `++` only on a line of its own, where the difference cannot matter.",
      page("Pitfalls"),
      { h: "An average that loses its fraction" },
      "`(7 + 8 + 10) / 3` prints 8, not 8.33…: three ints divide to an int. Divide by `3.0`.",
      { h: "Dividing by zero" },
      run("pit-zero", "an int divided by zero", "int items = 12;\nint boxes = 0;\nConsole.WriteLine(items / boxes);"),
      "It compiles, then throws `DivideByZeroException` while running. Check the divisor first (unit 2).",
      { h: "Forgetting precedence" },
      run("pit-prec", "a mean without brackets", "int a = 4, b = 8;\nConsole.WriteLine(a + b / 2);\nConsole.WriteLine((a + b) / 2);"),
      "`a + b / 2` divides only `b`. The mean needs brackets.",
      { h: "Expecting % to be a percentage" },
      "`%` is the remainder. 20% of 50 is `50 * 0.2`, not `50 % 20` (which is 10).",
      page("Connections"),
      { ul: [ "**Next:** 1.5 puts results into sentences; 1.6 reads the numbers from input.", "**Later:** unit 2 uses `% 2` for even numbers and `++` in every loop.", "**AQA:** 4.1.1.3 arithmetic operations — integer division (DIV) and modulus (MOD)." ] },
      page("Good practice"),
      { ul: [ "Add brackets when precedence is not obvious — they cost nothing.", "Give intermediate results names (`hours`, `left`) instead of one long expression.", "Use `++` and `--` as statements on their own line." ] },
      page("Practise"),
      { ul: [ "**Practice:** predict `/` and `%`, fix an average.", "**Tasks:** *Minutes to hours* and *Average of three*.", "**Retrieval:** integer division returns with new numbers." ] },
      page("Quick reference"),
      run("qr", "the operators", "Console.WriteLine(17 / 5);     // 3  (int ÷ int)\nConsole.WriteLine(17 % 5);     // 2  (remainder)\nConsole.WriteLine(17 / 5.0);   // 3.4\nint x = 1;\nx += 4;  x++;                  // x is 6\nConsole.WriteLine(x);"),
      { ul: [ "`* / %` before `+ -`; brackets first.", "int ÷ int truncates; make one side a double for a fraction.", "`%` is the remainder, not a percentage.", "int ÷ 0 throws; check first.", "`x += n` is `x = x + n`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["DivideByZeroException", "an int divided by 0", "Pitfalls"], ["CS0019", "an operator between the wrong types", "1.2"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "Console.WriteLine(23 / 4);\nConsole.WriteLine(23 % 4);", why: "4 goes into 23 five times (20), remainder 3.", concepts: ["int-division", "modulo"] },
        { id: "p2", src: "int x = 3;\nx += 4;\nx *= 2;\nx--;\nConsole.WriteLine(x);", why: "3 → 7 → 14 → 13.", concepts: ["compound"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so it prints the remainder when 50 is shared between 7: 1", src: "Console.WriteLine(50 @@ 7);", out: "1", concepts: ["modulo"] }
      ],
      bug: [
        { id: "b1", q: "It should print the mean of 4 and 9: 6.5", src: "int a = 4, b = 9;\nConsole.WriteLine(a + b / 2);", out: "6.5", fixedText: "prints 6.5", why: "Brackets for the sum, and divide by 2.0 to keep the half: (a + b) / 2.0.", concepts: ["precedence", "int-division"] }
      ]
    },
    flashcards: [
      ["What does `%` give?", "The remainder after division."],
      ["`17 / 5` and `17 % 5`?", "3 and 2."],
      ["Precedence of `* / %` vs `+ -`?", "`* / %` first; equal precedence left to right."],
      ["What does `x += 3` mean?", "`x = x + 3`."],
      ["`int a = x++;` vs `int a = ++x;`?", "`x++` gives the old value then adds one; `++x` adds one then gives the new value."],
      ["What happens with `5 / 0` for ints?", "A DivideByZeroException at run time."],
      ["How do you get 8.33 from (7 + 8 + 10) / 3?", "Divide by 3.0 so the division is in doubles."],
      ["Is integer division rounded?", "No — it truncates (drops the fraction)."]
    ],
    quiz: [
      { q: "What is `2 + 6 / 2`?", opts: ["4", "5", "8", "3"], ans: 1, why: "Division first: 6 / 2 = 3, then 2 + 3." },
      { q: "What is `29 % 10`?", opts: ["2", "9", "2.9", "0"], ans: 1, why: "29 = 2 × 10 + 9." },
      { q: "After `int s = 4; s *= 3; s -= 2;` s is…", opts: ["10", "12", "6", "14"], ans: 0, why: "4 × 3 = 12, then 12 − 2." },
      { q: "Which gives 3.5?", opts: ["7 / 2", "7 % 2", "7 / 2.0", "(int)3.5"], ans: 2, why: "A double on either side gives a double result." },
      { q: "How many whole hours in 200 minutes?", opts: ["200 % 60", "200 / 60", "200 / 60.0", "60 / 200"], ans: 1, why: "Integer division: 3 hours (and 200 % 60 = 20 minutes left)." }
    ]
  });
  K.add({ tasks: {
    "1.4-hours": { lesson: "1.4", title: "Minutes to hours", tier: "core", minutes: 10, concepts: ["int-division", "modulo"], requires: ["variables"],
      statement: ["The starter holds a number of minutes.", "Print it as hours and minutes, like `2 h 15 min` for 135.", "Work it out with `/` and `%` — do not type the answer."],
      starter: "int minutes = 135;\n",
      examples: [{ stdin: "", out: "2 h 15 min" }], hidden: [],
      rules: [{ id: "ops", test: function (s) { return /minutes\s*\/\s*60/.test(s) && /minutes\s*%\s*60/.test(s); }, msg: "Use minutes / 60 for the hours and minutes % 60 for what is left." }],
      hints: ["One hour is 60 minutes.", "minutes / 60 gives whole hours; minutes % 60 gives what is left.", "Console.WriteLine(minutes / 60 + \" h \" + minutes % 60 + \" min\");"],
      answer: "int minutes = 135;\nConsole.WriteLine(minutes / 60 + \" h \" + minutes % 60 + \" min\");" },
    "1.4-average": { lesson: "1.4", title: "Average of three", tier: "stretch", minutes: 10, concepts: ["int-division", "precedence"], requires: ["variables"],
      statement: ["The starter declares three marks as ints.", "Print their mean with its fraction: `8.333333333333334`."],
      starter: "int a = 7, b = 8, c = 10;\n",
      examples: [{ stdin: "", out: "8.333333333333334" }], hidden: [],
      rules: [{ id: "calc", test: function (s) { return /\(\s*a\s*\+\s*b\s*\+\s*c\s*\)/.test(s); }, msg: "Add a, b and c inside brackets before dividing." }],
      hints: ["Add first, then divide — brackets decide that.", "Three ints divided by 3 lose the fraction.", "(a + b + c) / 3.0"],
      answer: "int a = 7, b = 8, c = 10;\nConsole.WriteLine((a + b + c) / 3.0);" }
  } });

  /* ================================================================
     1.5 Strings and interpolation
     ================================================================ */
  lesson("1.5", {
    aqa: "4.1.1.7",
    notes: [
      page("The problem it solves"),
      "Output is for people. `14.97` means little; `Total: £14.97` means something.",
      { ul: [ "Programs build sentences out of fixed words and changing values.", "Joining with `+` works, but gets hard to read.", "**Interpolation** writes the sentence once, with holes for the values." ] },
      page("Core idea"),
      run("interp", "a sentence with holes", 'string name = "Ada";\nint age = 17;\nConsole.WriteLine($"{name} is {age}.");'),
      { ul: [ "The `$` in front makes it an **interpolated string**.", "Anything inside `{ }` is worked out and put into the text.", "The braces can hold any expression: `{age + 1}`, `{name.Length}`." ] },
      "The same sentence with `+`:",
      run("concat", "joining with +", 'string name = "Ada";\nint age = 17;\nConsole.WriteLine(name + " is " + age + ".");'),
      page("Rules"),
      { ul: [
        "`string + anything` gives a string: the other value becomes text first.",
        "`+` is worked out left to right, so `1 + 2 + \"a\"` is `\"3a\"` but `\"a\" + 1 + 2` is `\"a12\"`.",
        "Inside `$\"…\"`, a format follows a colon: `{price:F2}` shows two decimal places.",
        "`{x,8}` right-aligns in 8 characters; `{x,-8}` left-aligns.",
        "A backslash starts an **escape**: `\\n` new line, `\\t` tab, `\\\"` a quote, `\\\\` a backslash.",
        "Strings are immutable: every change makes a new string (unit 5)."
      ] },
      run("order", "left to right", 'Console.WriteLine(1 + 2 + "a");\nConsole.WriteLine("a" + 1 + 2);\nConsole.WriteLine("a" + (1 + 2));'),
      page("Variations"),
      { h: "Formats" },
      { table: { head: ["Format", "Gives", "For"], rows: [["`:F2`", "two decimal places", "prices, measurements"], ["`:N0`", "thousands separators", "large counts"], ["`:P0`", "a percentage", "rates"], ["`:D3`", "leading zeros", "codes, IDs"]] } },
      run("formats", "four formats", 'double price = 3.5;\nint people = 1234567;\ndouble rate = 0.25;\nint id = 7;\nConsole.WriteLine($"£{price:F2}");\nConsole.WriteLine($"{people:N0} people");\nConsole.WriteLine($"{rate:P0} off");\nConsole.WriteLine($"Ticket {id:D3}");'),
      { h: "Escapes" },
      run("escapes", "characters you cannot type directly", 'Console.WriteLine("Line one\\nLine two");\nConsole.WriteLine("Name:\\tAda");\nConsole.WriteLine("She said \\"hi\\"");\nConsole.WriteLine("C:\\\\Users");'),
      { h: "Columns" },
      run("align", "alignment", 'Console.WriteLine($"{"Item",-8}{"Qty",4}");\nConsole.WriteLine($"{"Tea",-8}{2,4}");\nConsole.WriteLine($"{"Scones",-8}{12,4}");'),
      { h: "Useful string members" },
      run("members", "Length, ToUpper, a character", 'string word = "Kurenai";\nConsole.WriteLine(word.Length);\nConsole.WriteLine(word.ToUpper());\nConsole.WriteLine(word[0]);'),
      page("Under the hood"),
      { ul: [
        "An interpolated string is turned by the compiler into efficient building code — no slower than `+`, usually faster.",
        "A format such as `F2` rounds when it displays. The value itself is not changed.",
        "`word[0]` is a `char`; positions start at 0, so the last is `word[word.Length - 1]`."
      ] },
      page("Pitfalls"),
      { h: "Forgetting the $" },
      run("pit-dollar", "no $", 'string name = "Ada";\nConsole.WriteLine("Hello, {name}!");'),
      "Without `$`, braces are just characters. It compiles and prints the braces — easy to miss.",
      { h: "Adding numbers inside a sentence" },
      run("pit-plus", "the order of +", 'int a = 2, b = 3;\nConsole.WriteLine("Total: " + a + b);\nConsole.WriteLine("Total: " + (a + b));'),
      "Once the left side is a string, every `+` joins text. Bracket the sum, or use `{a + b}`.",
      { h: "Single quotes for text — CS1012" },
      run("pit-single", "text in single quotes", "string name = 'Ada';\nConsole.WriteLine(name);"),
      "Single quotes make a `char`, which holds one character. Text goes in double quotes: `\"Ada\"`.",
      { h: "A quote inside a string" },
      "`\"She said \"hi\"\"` ends the string early and the compiler gets lost. Escape the inner quotes: `\\\"`.",
      { h: "Reading past the end — IndexOutOfRangeException" },
      run("pit-index", "word[word.Length]", 'string word = "cat";\nConsole.WriteLine(word[3]);'),
      "Positions run from 0 to `Length - 1`. There is no `word[3]` in a three-letter word.",
      page("Connections"),
      { ul: [ "**Next:** 1.6 reads text from the keyboard and turns it into numbers.", "**Later:** unit 5 is all about text: splitting, parsing, formatting, culture.", "**AQA:** 4.1.1.7 string-handling operations — length, position, concatenation." ] },
      page("Good practice"),
      { ul: [ "Prefer interpolation to long chains of `+`.", "Format at the moment of display; keep the full value in the variable.", "Use `:F2` for money until 1.7 introduces `decimal`." ] },
      page("Practise"),
      { ul: [ "**Practice:** predict string `+` order, fill in a format.", "**Tasks:** *Name tag* and *Price label*.", "**Retrieval:** *String interpolation* returns with new names and numbers." ] },
      page("Quick reference"),
      run("qr", "the lines you will write most", 'string name = "Ada";\ndouble price = 3.5;\nConsole.WriteLine($"Hello, {name}!");\nConsole.WriteLine($"£{price:F2}");\nConsole.WriteLine("Tab\\there, quote \\" and new\\nline");'),
      { ul: [ "`$\"…{x}…\"` puts values into text.", "`{x:F2}` two decimals · `{x:N0}` thousands · `{x,8}` alignment.", "`\\n` new line · `\\t` tab · `\\\"` quote · `\\\\` backslash.", "string + number joins text, left to right.", "Positions run 0 to `Length - 1`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1010", "a string was not closed", "Pitfalls"], ["IndexOutOfRangeException", "a position past the end", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine(4 + 4 + "4");\nConsole.WriteLine("4" + 4 + 4);', why: "Left to right: 8 then \"84\"; \"4\" + 4 is \"44\", then \"444\".", concepts: ["interpolation"] },
        { id: "p2", src: 'int n = 3;\nConsole.WriteLine($"{n} squared is {n * n}");', why: "Braces hold any expression.", concepts: ["interpolation"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so it prints £4.50", src: 'double price = 4.5;\nConsole.WriteLine($"£{price:@@}");', out: "£4.50", concepts: ["format"] },
        { id: "f2", q: "Fill the gap so it prints Hello, Kai!", src: 'string who = "Kai";\nConsole.WriteLine(@@"Hello, {who}!");', out: "Hello, Kai!", concepts: ["interpolation"] }
      ],
      bug: [
        { id: "b1", q: "It should print Total: 5", src: 'int a = 2, b = 3;\nConsole.WriteLine("Total: " + a + b);', out: "Total: 5", fixedText: "prints Total: 5", why: "Bracket the sum — (a + b) — or use $\"Total: {a + b}\".", concepts: ["interpolation"] }
      ]
    },
    flashcards: [
      ["What does the `$` before a string do?", "Makes it interpolated: expressions in `{ }` are put into the text."],
      ["What does `{price:F2}` do?", "Shows the value with exactly two decimal places."],
      ["`1 + 2 + \"a\"` vs `\"a\" + 1 + 2`?", "`\"3a\"` and `\"a12\"` — `+` goes left to right."],
      ["Escape for a new line? A tab? A quote?", "`\\n`, `\\t`, `\\\"`."],
      ["What does `{x,-8}` do?", "Left-aligns x in 8 characters."],
      ["What does `\"cat\"[0]` give?", "The char `'c'` — positions start at 0."],
      ["Does `:F2` change the stored value?", "No, only how it is shown."]
    ],
    quiz: [
      { q: "What prints? `Console.WriteLine(\"Hi {1 + 1}\");`", opts: ["Hi 2", "Hi {1 + 1}", "Hi 11", "An error"], ans: 1, why: "Without $, braces are ordinary characters." },
      { q: "Which prints 7.50?", opts: ["$\"{7.5}\"", "$\"{7.5:F2}\"", "$\"{7.5:N0}\"", "\"7.5:F2\""], ans: 1, why: "F2 means two decimal places." },
      { q: "`\"ab\".Length` is…", opts: ["1", "2", "3", "0"], ans: 1, why: "Two characters." },
      { q: "Which escape gives a backslash?", opts: ["\\b", "\\\\", "\\/", "//"], ans: 1, why: "Two backslashes make one." },
      { q: "`\"x\" + 2 * 3` gives…", opts: ["x6", "x23", "x2 * 3", "An error"], ans: 0, why: "* first (6), then join." }
    ]
  });
  K.add({ tasks: {
    "1.5-tag": { lesson: "1.5", title: "Name tag", tier: "warm-up", minutes: 5, concepts: ["interpolation"], requires: ["variables"],
      statement: ["Using interpolation, print `Hello, Ada! Welcome to 2026.` from the two variables in the starter."],
      starter: 'string name = "Ada";\nint year = 2026;\n',
      examples: [{ stdin: "", out: "Hello, Ada! Welcome to 2026." }], hidden: [],
      rules: [{ id: "interp", test: function (s) { return /\$"[^"]*\{\s*name\s*\}[^"]*\{\s*year\s*\}/.test(s); }, msg: "Use one interpolated string with {name} and {year}." }],
      hints: ["Start the string with $.", "Put each variable's name in braces where its value goes.", "Console.WriteLine($\"Hello, {name}! Welcome to {year}.\");"],
      answer: 'string name = "Ada";\nint year = 2026;\nConsole.WriteLine($"Hello, {name}! Welcome to {year}.");' },
    "1.5-label": { lesson: "1.5", title: "Price label", tier: "core", minutes: 10, concepts: ["interpolation", "format"], requires: ["interpolation"],
      statement: ["The starter has a price and a quantity.", "Print `4 x £3.50 = £14.00`, working out the total and showing both prices with two decimals."],
      starter: "double price = 3.5;\nint qty = 4;\n",
      examples: [{ stdin: "", out: "4 x £3.50 = £14.00" }], hidden: [],
      rules: [{ id: "calc", test: function (s) { return /price\s*\*\s*qty|qty\s*\*\s*price/.test(s); }, msg: "Work out the total as price * qty." }],
      hints: ["Use {price:F2} for £3.50.", "The total is price * qty; it can go straight in the braces.", "$\"{qty} x £{price:F2} = £{price * qty:F2}\""],
      answer: 'double price = 3.5;\nint qty = 4;\nConsole.WriteLine($"{qty} x £{price:F2} = £{price * qty:F2}");' }
  } });

  /* ================================================================
     1.6 Reading input and converting types
     ================================================================ */
  lesson("1.6", {
    aqa: "4.1.1.2",
    notes: [
      page("The problem it solves"),
      "A program that only prints fixed values gives the same answer every time.",
      { ul: [ "Real programs ask: a name, a temperature, a price.", "Everything typed arrives as **text** — even `21`.", "So input has two steps: read the line, then convert it to the type you need." ] },
      page("Core idea"),
      run("read", "read a line", 'string name = Console.ReadLine();\nConsole.WriteLine($"Hello, {name}!");', "Ada"),
      run("parse", "text to a number", 'string line = Console.ReadLine();\nint n = int.Parse(line);\nConsole.WriteLine(n * 2);', "21"),
      { ul: [ "`Console.ReadLine()` waits for one line of input and returns it as a `string`.", "`int.Parse(text)` turns text like \"21\" into the `int` 21.", "`double.Parse(text)` does the same for real numbers." ] },
      call("info", "Input in this app", ["Each listing and task supplies its own input lines, as if typed. In a task's Output tab you can change them in the stdin box."]),
      page("Rules"),
      { ul: [
        "`ReadLine` returns the whole line, without the Enter at the end.",
        "`int.Parse` accepts optional spaces and a sign, then digits only. Anything else throws `FormatException`.",
        "A number too big for an `int` throws `OverflowException`.",
        "**Implicit** conversions are allowed when nothing can be lost: `int` → `double`.",
        "**Explicit** conversions (casts) are needed when something might be lost: `(int)3.99` is 3.",
        "A cast from `double` to `int` **truncates**; `Convert.ToInt32` **rounds** (to even on a .5)."
      ] },
      run("casts", "cast or convert", "double d = 3.99;\nint a = (int)d;\nint b = Convert.ToInt32(d);\ndouble back = a;\nConsole.WriteLine(a);\nConsole.WriteLine(b);\nConsole.WriteLine(back);"),
      page("Variations"),
      { h: "Two numbers, two lines" },
      run("two", "read twice", "int a = int.Parse(Console.ReadLine());\nint b = int.Parse(Console.ReadLine());\nConsole.WriteLine($\"{a} + {b} = {a + b}\");", "4\n5"),
      { h: "A real number" },
      run("celsius", "double.Parse", 'double c = double.Parse(Console.ReadLine());\ndouble f = c * 9 / 5 + 32;\nConsole.WriteLine($"{c}°C is {f:F1}°F");', "21.5"),
      { h: "A cast to make a division real" },
      run("castdiv", "(double) on one side", "int total = 7, people = 2;\nConsole.WriteLine(total / people);\nConsole.WriteLine((double)total / people);"),
      { h: "Rounding to display, rounding to keep" },
      run("round", "Math.Round", "double x = 2.345;\nConsole.WriteLine($\"{x:F2}\");\nConsole.WriteLine(Math.Round(x, 2));\nConsole.WriteLine(Math.Round(2.5));\nConsole.WriteLine(Math.Round(3.5));"),
      "`Math.Round` uses **banker's rounding** by default: a .5 goes to the even neighbour, so 2.5 becomes 2 and 3.5 becomes 4.",
      page("Under the hood"),
      { ul: [
        "Input is a stream of characters. `ReadLine` collects characters up to the line ending.",
        "`int.Parse` reads digit by digit: total = total × 10 + digit.",
        "A cast to `int` simply drops the fraction — the processor's conversion instruction truncates.",
        "At the end of input `ReadLine` returns `null`; reading it then would throw NullReferenceException."
      ] },
      page("Pitfalls"),
      { h: "Text that is not a number — FormatException" },
      run("pit-format", "parsing a word", 'int age = int.Parse(Console.ReadLine());\nConsole.WriteLine(age);', "seventeen"),
      "It compiles, then fails while running. Unit 5 shows `int.TryParse`, which checks instead of throwing.",
      { h: "Forgetting to parse — CS0029" },
      run("pit-noparse", "a string into an int", "int age = Console.ReadLine();\nConsole.WriteLine(age);", "17"),
      "`ReadLine` gives a `string`. Wrap it: `int.Parse(Console.ReadLine())`.",
      { h: "A double into an int without a cast — CS0266" },
      run("pit-cast", "no cast", "double d = 7.8;\nint n = d;\nConsole.WriteLine(n);"),
      "C# will not lose the .8 silently. Write `(int)d` if truncation is what you want, or keep a `double`.",
      { h: "Expecting a cast to round" },
      "`(int)7.8` is 7, not 8. Use `Math.Round` or `Convert.ToInt32` to round.",
      page("Choosing"),
      { table: { head: ["You want", "Write", "7.8 gives"], rows: [
        ["drop the fraction", "`(int)x`", "7"],
        ["round to nearest (even on .5)", "`Convert.ToInt32(x)` or `(int)Math.Round(x)`", "8"],
        ["always down / always up", "`Math.Floor(x)` / `Math.Ceiling(x)`", "7 / 8"]
      ] } },
      page("Connections"),
      { ul: [ "**Next:** 1.7 shows the limits of `int` and `double`.", "**Later:** unit 5 parses safely with `TryParse`; unit 6 handles exceptions.", "**AQA:** 4.1.1.2 input and output; 4.1.1.1 type conversion." ] },
      page("Good practice"),
      { ul: [ "Parse once, near where you read, and keep the number in a well-named variable.", "Prompt the user in real programs (`Console.Write(\"Age: \");`). Tasks here print only what the examples show.", "Never trust input — unit 5 makes this safe." ] },
      page("Practise"),
      { ul: [ "**Practice:** predict a cast, fix a missing parse.", "**Tasks:** *Double it*, *Temperature converter*, *Split the bill*.", "**Retrieval:** reading and parsing returns with new numbers." ] },
      page("Quick reference"),
      run("qr", "read, parse, convert", 'string text = Console.ReadLine();          // always a string\nint n = int.Parse(text);                    // "21" → 21\ndouble d = double.Parse("2.5");            // "2.5" → 2.5\nint t = (int)3.99;                          // 3  (truncates)\nint r = Convert.ToInt32(3.99);              // 4  (rounds)\nConsole.WriteLine(n + t + r);', "21"),
      { ul: [ "Input is always text: parse it.", "`int.Parse` throws on anything that is not a whole number.", "int → double is automatic; double → int needs a cast.", "A cast truncates; Convert and Math.Round round.", "Math.Round sends .5 to the even neighbour." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["FormatException", "the text is not a number", "Pitfalls"], ["CS0029", "a string where an int goes", "Pitfalls"], ["CS0266", "a double into an int needs a cast", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "Console.WriteLine((int)9.99);\nConsole.WriteLine(Convert.ToInt32(9.99));", why: "A cast truncates (9); Convert rounds (10).", concepts: ["casting"] },
        { id: "p2", src: "int a = int.Parse(\"40\");\nint b = int.Parse(\"2\");\nConsole.WriteLine(a + b);\nConsole.WriteLine(\"40\" + \"2\");", why: "Parsed numbers add (42); strings join (\"402\").", concepts: ["parse"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gaps so it reads a number and prints one more than it.", src: "int n = @@.Parse(Console.@@());\nConsole.WriteLine(n + 1);", cases: [{ stdin: "9", out: "10" }, { stdin: "-1", out: "0" }], concepts: ["readline", "parse"] }
      ],
      bug: [
        { id: "b1", q: "It should read a number and print it doubled.", src: "int n = Console.ReadLine();\nConsole.WriteLine(n * 2);", cases: [{ stdin: "8", out: "16" }], fixedText: "prints 16 for 8", why: "ReadLine returns a string; parse it: int.Parse(Console.ReadLine()).", concepts: ["parse"] }
      ]
    },
    flashcards: [
      ["What type does `Console.ReadLine()` return?", "`string`."],
      ["How do you turn \"42\" into a number?", "`int.Parse(\"42\")`."],
      ["What does `int.Parse(\"abc\")` do?", "Throws FormatException at run time."],
      ["`(int)7.9`?", "7 — a cast truncates."],
      ["`Convert.ToInt32(7.9)`?", "8 — Convert rounds."],
      ["What is banker's rounding?", "A .5 rounds to the even neighbour: 2.5 → 2, 3.5 → 4."],
      ["Which conversions need a cast?", "Ones that might lose information, like double → int."],
      ["What is error CS0266?", "Cannot implicitly convert — an explicit cast exists (e.g. double to int)."]
    ],
    quiz: [
      { q: "Input is `5` then `6` on two lines. What does `Console.WriteLine(Console.ReadLine() + Console.ReadLine());` print?", opts: ["11", "56", "5 6", "An error"], ans: 1, why: "Both are strings, so + joins them." },
      { q: "`int x = (int)2.99;` x is…", opts: ["3", "2", "2.99", "An error"], ans: 1, why: "Casting truncates." },
      { q: "Which line compiles?", opts: ["int n = Console.ReadLine();", "int n = int.Parse(Console.ReadLine());", "int n = (int)Console.ReadLine();", "string n = int.Parse(\"3\");"], ans: 1, why: "Parse turns the string into an int." },
      { q: "`Math.Round(4.5)` gives…", opts: ["4", "5", "4.5", "6"], ans: 0, why: "Banker's rounding: 4 is even." },
      { q: "`double d = 5;` is…", opts: ["an error: needs a cast", "fine: int to double loses nothing", "5.0 only with a cast", "a string"], ans: 1, why: "Widening conversions are implicit." }
    ]
  });
  K.add({ tasks: {
    "1.6-double": { lesson: "1.6", title: "Double it", tier: "warm-up", minutes: 5, concepts: ["readline", "parse"], requires: ["writeline"],
      statement: ["Read one whole number and print twice its value."],
      starter: "",
      examples: [{ stdin: "21", out: "42" }, { stdin: "-5", out: "-10" }],
      hidden: [{ stdin: "0", out: "0" }, { stdin: "1000", out: "2000" }],
      hints: ["Console.ReadLine() gives the line as text.", "int.Parse turns it into a number.", "Console.WriteLine(int.Parse(Console.ReadLine()) * 2);"],
      answer: "int n = int.Parse(Console.ReadLine());\nConsole.WriteLine(n * 2);" },
    "1.6-temp": { lesson: "1.6", title: "Temperature converter", tier: "core", minutes: 15, concepts: ["parse", "format"], requires: ["readline"],
      statement: ["Read a temperature in Celsius (it may have a decimal point).", "Print it in Fahrenheit to one decimal place: F = C × 9 ÷ 5 + 32."],
      starter: "",
      examples: [{ stdin: "100", out: "212.0" }, { stdin: "21.5", out: "70.7" }, { stdin: "-40", out: "-40.0" }],
      hidden: [{ stdin: "0", out: "32.0" }, { stdin: "37", out: "98.6" }],
      hints: ["Celsius can have a decimal point, so parse a double.", "f = c * 9 / 5 + 32 — with c a double, nothing is truncated.", "Console.WriteLine($\"{f:F1}\");"],
      answer: "double c = double.Parse(Console.ReadLine());\ndouble f = c * 9 / 5 + 32;\nConsole.WriteLine($\"{f:F1}\");" },
    "1.6-bill": { lesson: "1.6", title: "Split the bill", tier: "stretch", minutes: 15, concepts: ["parse", "casting", "format"], requires: ["readline", "format"],
      statement: ["Read the bill total (a decimal number) on the first line and the number of people on the second.", "Print `Each pays £X.XX`."],
      starter: "",
      examples: [{ stdin: "60\n4", out: "Each pays £15.00" }, { stdin: "47.5\n3", out: "Each pays £15.83" }],
      hidden: [{ stdin: "10\n3", out: "Each pays £3.33" }, { stdin: "9.99\n1", out: "Each pays £9.99" }],
      hints: ["Two ReadLines: double.Parse the first, int.Parse the second.", "A double divided by an int is a double, so nothing is lost.", "Console.WriteLine($\"Each pays £{total / people:F2}\");"],
      answer: "double total = double.Parse(Console.ReadLine());\nint people = int.Parse(Console.ReadLine());\nConsole.WriteLine($\"Each pays £{total / people:F2}\");" }
  } });

  /* ================================================================
     1.7 Limits: overflow, precision and decimal
     ================================================================ */
  lesson("1.7", {
    aqa: "4.5.4.5",
    notes: [
      page("The problem it solves"),
      "Numbers in a computer are stored in a fixed number of bits. That has consequences.",
      { ul: [ "An `int` cannot hold a number bigger than 2,147,483,647.", "A `double` cannot hold 0.1 exactly.", "Neither problem is a bug in C#; both are choices you make by picking a type." ] },
      page("Core idea"),
      run("max", "the edge of an int", "int big = int.MaxValue;\nConsole.WriteLine(big);\nbig = big + 1;\nConsole.WriteLine(big);"),
      "Past the top, an `int` **wraps round** to the most negative value. No error — just a wrong number. That is **overflow**.",
      run("tenth", "0.1 + 0.2", "Console.WriteLine(0.1 + 0.2);\nConsole.WriteLine(0.1 + 0.2 == 0.3);"),
      "0.1 has no exact binary form, so a `double` stores the nearest value it can. Tiny errors show up when you add.",
      run("decimal", "decimal is exact in base 10", "decimal a = 0.1m;\ndecimal b = 0.2m;\nConsole.WriteLine(a + b);\nConsole.WriteLine(a + b == 0.3m);"),
      page("Rules"),
      { table: { head: ["Type", "Bits", "Range or precision", "Literal"], rows: [
        ["`int`", "32", "±2.1 billion", "`7`"],
        ["`long`", "64", "±9.2 quintillion", "`7L`"],
        ["`double`", "64", "≈15–16 significant digits, base 2", "`7.0`"],
        ["`decimal`", "128", "28–29 significant digits, base 10", "`7.0m`"]
      ] } },
      { ul: [
        "Integer overflow wraps silently by default. Inside `checked( … )` it throws `OverflowException` instead.",
        "Arithmetic is done in the type of the operands, **before** the result is stored: `long r = a * b;` overflows if `a` and `b` are ints.",
        "`decimal` values need the `m` suffix: `0.1m`.",
        "You cannot mix `decimal` and `double` without a cast.",
        "Never compare doubles with `==` after arithmetic; compare the difference with a small tolerance."
      ] },
      { run: { id: "checked", cap: "checked arithmetic (it throws)", src: "int big = int.MaxValue;\nConsole.WriteLine(checked(big + 1));", fails: true } },
      page("Variations"),
      { h: "Make it long before you multiply" },
      run("long", "int times int, stored in a long", "int a = 3000000;\nint b = 1000;\nlong wrong = a * b;\nlong right = (long)a * b;\nConsole.WriteLine(wrong);\nConsole.WriteLine(right);"),
      { h: "Money in decimal" },
      run("money", "a till", "decimal price = 4.99m;\nint qty = 3;\ndecimal total = price * qty;\nConsole.WriteLine($\"£{total:F2}\");"),
      { h: "Comparing doubles safely" },
      run("tolerance", "close enough", "double x = 0.1 + 0.2;\nConsole.WriteLine(Math.Abs(x - 0.3) < 1e-9);"),
      { h: "Infinity, not an exception" },
      run("inf", "doubles divide by zero", "Console.WriteLine(1.0 / 0);\nConsole.WriteLine(-1.0 / 0);\nConsole.WriteLine(0.0 / 0);"),
      page("Under the hood"),
      { ul: [
        "An `int` is two's complement: the top bit is the sign. Adding 1 to 0111…1 gives 1000…0, the most negative number — that is the wrap.",
        "A `double` is a sign, an exponent and a 52-bit mantissa (IEEE 754). 0.1 in binary is 0.000110011… for ever, so it is cut off.",
        "A `decimal` stores a whole number and a power of ten, so 0.1 is exactly 1 × 10⁻¹. It is slower and has a smaller range.",
        "`double` division by zero follows IEEE 754 and gives ∞ or NaN (not a number) rather than throwing."
      ] },
      page("Pitfalls"),
      { h: "Overflow you do not see" },
      "`int.MaxValue + 1` gives −2,147,483,648 with no error. Use `long`, or `checked` while you are testing.",
      { h: "A constant that overflows — CS0220" },
      run("pit-const", "constant overflow", "int x = 2147483647 + 1;\nConsole.WriteLine(x);"),
      "When both sides are constants the compiler can see the overflow, so it refuses.",
      { h: "Mixing decimal and double — CS0019" },
      run("pit-mix", "decimal times double", "decimal price = 4.99m;\ndouble rate = 0.2;\nConsole.WriteLine(price * rate);"),
      "Make the rate a `decimal` too: `0.2m`.",
      { h: "Forgetting the m — CS0664" },
      "`decimal p = 4.99;` will not compile: 4.99 is a double literal. Write `4.99m`.",
      page("Choosing"),
      { table: { head: ["Value", "Type", "Why"], rows: [
        ["a count, an index", "`int`", "fast, and big enough"],
        ["a population, milliseconds since 1970", "`long`", "bigger than 2.1 billion"],
        ["a measurement, a physics value", "`double`", "huge range; tiny errors do not matter"],
        ["money", "`decimal`", "pennies must add up exactly"]
      ] } },
      page("Connections"),
      { ul: [ "**Next:** 1.8 builds a receipt with `decimal`.", "**Later:** unit 12 measures cost; D1 looks at memory.", "**AQA:** 4.5.4.5 rounding errors, overflow and underflow; 4.5.4.3 two's complement; 4.5.4.7 range and precision." ] },
      page("Good practice"),
      { ul: [ "Money is `decimal`, always.", "Think about the biggest value a variable could hold, not today's value.", "Test edge values: 0, negative, the maximum." ] },
      page("Practise"),
      { ul: [ "**Practice:** predict an overflow, fix a mixed decimal.", "**Tasks:** *Will it fit?* and *Money adds up*." ] },
      page("Quick reference"),
      run("qr", "the limits", "Console.WriteLine(int.MaxValue);        // 2147483647\nConsole.WriteLine(int.MaxValue + 0L);   // as a long\nConsole.WriteLine(0.1 + 0.2);           // 0.30000000000000004\nConsole.WriteLine(0.1m + 0.2m);         // 0.3\nlong big = (long)int.MaxValue * 2;\nConsole.WriteLine(big);"),
      { ul: [ "int overflow wraps silently; `checked( )` makes it throw.", "Cast to `long` before multiplying big ints.", "double is approximate; never `==` after arithmetic.", "decimal is exact for money; needs `m`.", "double ÷ 0 is ∞; int ÷ 0 throws." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0220", "constant arithmetic overflows", "Pitfalls"], ["OverflowException", "overflow inside checked", "Rules"], ["CS0019", "decimal mixed with double", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "int x = int.MaxValue;\nx = x + 2;\nConsole.WriteLine(x);", why: "One past the top is int.MinValue; one more is −2147483647.", concepts: ["overflow"] },
        { id: "p2", src: "Console.WriteLine(0.1m + 0.2m == 0.3m);\nConsole.WriteLine(0.1 + 0.2 == 0.3);", why: "decimal is exact (True); double is not (False).", concepts: ["precision", "decimal"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the product does not overflow: 6000000000", src: "int a = 3000000, b = 2000;\nlong r = (@@)a * b;\nConsole.WriteLine(r);", out: "6000000000", concepts: ["overflow"] }
      ],
      bug: [
        { id: "b1", q: "It should print £1.00 — 20% of £5.", src: "decimal price = 5m;\ndouble rate = 0.2;\nConsole.WriteLine($\"£{price * rate:F2}\");", out: "£1.00", fixedText: "prints £1.00", why: "Keep both decimal: decimal rate = 0.2m;", concepts: ["decimal"] }
      ]
    },
    flashcards: [
      ["What is `int.MaxValue + 1`?", "−2,147,483,648 — it wraps (overflow)."],
      ["How do you make overflow throw?", "`checked(expression)` — it throws OverflowException."],
      ["Why is `0.1 + 0.2` not 0.3 in a double?", "0.1 and 0.2 have no exact binary form; the stored values are approximations."],
      ["Which type for money?", "`decimal` — exact in base 10."],
      ["How do you write a decimal literal?", "With an `m`: `4.99m`."],
      ["`long r = a * b;` with int a, b — safe?", "No: the multiplication overflows as ints first. Cast: `(long)a * b`."],
      ["How should you compare two doubles?", "`Math.Abs(x - y) < tolerance`, not `==`."],
      ["What is `1.0 / 0`?", "∞ (positive infinity)."]
    ],
    quiz: [
      { q: "Which type for a bank balance?", opts: ["int", "double", "decimal", "float"], ans: 2, why: "Money must be exact in pennies." },
      { q: "`int.MaxValue + 1` at run time gives…", opts: ["an OverflowException", "int.MinValue", "2147483648", "0"], ans: 1, why: "Unchecked int arithmetic wraps." },
      { q: "`decimal d = 2.5;` gives…", opts: ["2.5", "CS0664 — needs 2.5m", "2", "a warning only"], ans: 1, why: "2.5 is a double literal." },
      { q: "What range does an int have?", opts: ["±32,767", "±2,147,483,647 roughly", "±9.2 quintillion", "0 to 4 billion"], ans: 1, why: "32-bit two's complement." },
      { q: "`0.1 + 0.2 == 0.3` with doubles is…", opts: ["True", "False", "a compile error", "NaN"], ans: 1, why: "The sum is 0.30000000000000004." }
    ]
  });
  K.add({ tasks: {
    "1.7-fit": { lesson: "1.7", title: "Will it fit?", tier: "core", minutes: 10, concepts: ["overflow"], requires: ["parse"],
      statement: ["Read a whole number of seconds.", "Print the number of **milliseconds** (× 1000). It must be right even for very large inputs."],
      starter: "int seconds = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "5", out: "5000" }, { stdin: "3000000", out: "3000000000" }],
      hidden: [{ stdin: "2147483647", out: "2147483647000" }, { stdin: "0", out: "0" }],
      hints: ["3,000,000 × 1000 is more than an int can hold.", "The multiplication must happen in long, not int.", "long ms = (long)seconds * 1000;"],
      answer: "int seconds = int.Parse(Console.ReadLine());\nlong ms = (long)seconds * 1000;\nConsole.WriteLine(ms);" },
    "1.7-money": { lesson: "1.7", title: "Money adds up", tier: "core", minutes: 10, concepts: ["decimal", "format"], requires: ["parse"],
      statement: ["Read three prices, one per line.", "Print their total as `£X.XX`, using `decimal` so the pennies are exact."],
      starter: "",
      examples: [{ stdin: "0.10\n0.20\n0.30", out: "£0.60" }, { stdin: "4.99\n4.99\n4.99", out: "£14.97" }],
      hidden: [{ stdin: "1\n2\n3", out: "£6.00" }, { stdin: "0.01\n0.01\n0.01", out: "£0.03" }],
      rules: [{ id: "decimal", test: function (s) { return /\bdecimal\b/.test(s); }, msg: "Use decimal for the prices." }],
      hints: ["decimal.Parse reads a price exactly.", "Add the three, then format with :F2.", "decimal total = decimal.Parse(Console.ReadLine()) + … ;"],
      answer: "decimal a = decimal.Parse(Console.ReadLine());\ndecimal b = decimal.Parse(Console.ReadLine());\ndecimal c = decimal.Parse(Console.ReadLine());\nConsole.WriteLine($\"£{a + b + c:F2}\");" }
  } });

  /* ================================================================
     1.8 Practise: a receipt calculator
     ================================================================ */
  lesson("1.8", {
    aqa: "4.1.1.2",
    notes: [
      page("The problem it solves"),
      "Each lesson so far taught one tool. Real programs need several at once.",
      { ul: [ "This lesson is about **putting a program together**: deciding the steps before typing.", "The plan every small program follows: **input → process → output**.", "The tools: ReadLine and Parse, arithmetic, decimal, interpolation and formats." ] },
      page("Core idea"),
      { ol: [ "**Input:** what do I read, in what order, and as which types?", "**Process:** what do I calculate, and what do I name each step?", "**Output:** exactly what must be printed, character for character?" ] },
      "Plan the receipt first, in comments, then fill each comment with code:",
      run("plan", "a planned receipt", '// input: item name, price, quantity\nstring item = Console.ReadLine();\ndecimal price = decimal.Parse(Console.ReadLine());\nint qty = int.Parse(Console.ReadLine());\n\n// process: the line total\ndecimal total = price * qty;\n\n// output: three lines\nConsole.WriteLine($"Item: {item}");\nConsole.WriteLine($"{qty} x £{price:F2}");\nConsole.WriteLine($"Total: £{total:F2}");', "Tea\n1.50\n2"),
      page("Rules"),
      { ul: [
        "Read inputs in the order they arrive. Each `ReadLine` takes the next line.",
        "Convert each input **once**, straight away, to the type its meaning needs.",
        "Name every intermediate value. `total` is clearer than repeating `price * qty`.",
        "Match the required output exactly: spaces, capitals, the £ sign and the decimals all count.",
        "Test with ordinary values, then edge values: 0, 1, the largest likely."
      ] },
      page("Variations"),
      { h: "Adding a discount" },
      run("discount", "10% off over £20", 'decimal total = 24.00m;\nconst decimal Rate = 0.10m;\ndecimal discount = total * Rate;\nConsole.WriteLine($"Discount: £{discount:F2}");\nConsole.WriteLine($"To pay: £{total - discount:F2}");'),
      { h: "Coins with / and %" },
      run("coins", "change in coins", "int pence = 87;\nint fifties = pence / 50;\npence %= 50;\nint twenties = pence / 20;\npence %= 20;\nConsole.WriteLine($\"50p: {fifties}, 20p: {twenties}, left: {pence}p\");"),
      { h: "A neat column" },
      run("columns", "aligned receipt", 'Console.WriteLine($"{"Tea",-10}{3.00m,8:F2}");\nConsole.WriteLine($"{"Scone",-10}{2.50m,8:F2}");\nConsole.WriteLine($"{"Total",-10}{5.50m,8:F2}");'),
      page("Under the hood"),
      { ul: [ "Every program you will write is input → process → output at some scale: a web API reads a request, processes it and writes a response.", "Separating the three makes testing easy: give known input, check the output. That is exactly how tasks here are checked." ] },
      page("Pitfalls"),
      { h: "Reading in the wrong order" },
      "If the price is on line 2, the second `ReadLine` must be the price. Read the statement's input format first.",
      { h: "Output that is nearly right" },
      "`Total: £3.0` is not `Total: £3.00`, and `total: £3.00` is not either. Copy the expected text exactly.",
      { h: "Parsing a price as an int — FormatException" },
      run("pit-int", "int.Parse(\"1.50\")", "int price = int.Parse(Console.ReadLine());\nConsole.WriteLine(price);", "1.50"),
      "A price has pennies: parse it as `decimal`.",
      page("Connections"),
      { ul: [ "**Next:** unit 2 adds decisions (only discount over £20) and loops (many items).", "**Later:** capstone 1 is a whole text adventure built the same way, plan first.", "**AQA:** 4.1.1.2 sequence; the NEA's design section is this planning at full size." ] },
      page("Good practice"),
      { ul: [ "Plan in comments; keep the comments that explain why.", "Test with the examples, then invent your own edge case.", "When an output differs, compare it line by line with the expected — the diff in Tests does this for you." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Receipt* and *Change machine* — both stretch tasks that use everything in unit 1." ] },
      page("Quick reference"),
      run("qr", "the shape of a small program", '// input\nint a = int.Parse(Console.ReadLine());\n// process\nint doubled = a * 2;\n// output\nConsole.WriteLine($"{a} doubled is {doubled}");', "8"),
      { ul: [ "Input → process → output.", "Read in order; parse once, to the right type.", "Name each step.", "Match the output exactly.", "Test ordinary values, then edge values." ] }
    ],
    practice: {
      predict: [
        { id: "p1", src: "int pence = 75;\nConsole.WriteLine(pence / 20);\nConsole.WriteLine(pence % 20);", why: "Three 20p coins make 60; 15p is left.", concepts: ["ipo"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gaps to read a name and greet it.", src: "string name = Console.@@();\nConsole.WriteLine(@@\"Hi, {name}\");", cases: [{ stdin: "Ada", out: "Hi, Ada" }, { stdin: "Kai", out: "Hi, Kai" }], concepts: ["ipo"] }
      ],
      bug: [
        { id: "b1", q: "It should print the line total for a price and a quantity.", src: "decimal price = decimal.Parse(Console.ReadLine());\nint qty = int.Parse(Console.ReadLine());\nConsole.WriteLine($\"£{price + qty:F2}\");", cases: [{ stdin: "1.50\n2", out: "£3.00" }, { stdin: "4\n3", out: "£12.00" }], fixedText: "prints the line totals", why: "A line total is price × quantity.", concepts: ["ipo"] }
      ]
    },
    flashcards: [
      ["The three parts of a small program?", "Input → process → output."],
      ["Why plan in comments first?", "It separates deciding the steps from writing the syntax, and the comments become the structure."],
      ["How many times should you parse an input?", "Once, straight after reading it, into a well-named variable."],
      ["Why test edge values?", "Bugs hide at 0, 1, negatives and the maximum."],
      ["Which type should a price be parsed as?", "`decimal`."]
    ],
    quiz: [
      { q: "Input arrives as name, then price. Which reads it correctly?", opts: ["price first, then name", "name first, then price", "either order", "both in one ReadLine"], ans: 1, why: "Each ReadLine takes the next line." },
      { q: "Expected `Total: £3.00`. You print `Total: £3`. Is it right?", opts: ["Yes", "No — the output must match exactly", "Only on a phone", "Only if the value is right"], ans: 1, why: "Checks compare the text exactly." },
      { q: "What is 187p in 50p coins and what is left?", opts: ["3 and 37p", "3 and 50p", "4 and 0p", "37 and 3p"], ans: 0, why: "187 / 50 = 3, 187 % 50 = 37." }
    ]
  });
  K.add({ tasks: {
    "1.8-receipt": { lesson: "1.8", title: "Receipt", tier: "stretch", minutes: 20, concepts: ["ipo", "decimal", "format"], requires: ["parse", "interpolation"],
      statement: ["Read an item name, its price and a quantity, one per line.", "Print three lines exactly like this:", { code: { lang: "", src: "Item: Tea\n2 x £1.50\nTotal: £3.00" } }],
      starter: "// input\n\n// process\n\n// output\n",
      examples: [{ stdin: "Tea\n1.50\n2", out: "Item: Tea\n2 x £1.50\nTotal: £3.00" }, { stdin: "Scone\n2.25\n4", out: "Item: Scone\n4 x £2.25\nTotal: £9.00" }],
      hidden: [{ stdin: "Water\n0.99\n1", out: "Item: Water\n1 x £0.99\nTotal: £0.99" }, { stdin: "Cake\n3\n12", out: "Item: Cake\n12 x £3.00\nTotal: £36.00" }],
      hints: ["Three ReadLines: a string, a decimal, an int.", "The total is price * qty.", "Use :F2 on both prices so whole pounds show .00."],
      answer: 'string item = Console.ReadLine();\ndecimal price = decimal.Parse(Console.ReadLine());\nint qty = int.Parse(Console.ReadLine());\ndecimal total = price * qty;\nConsole.WriteLine($"Item: {item}");\nConsole.WriteLine($"{qty} x £{price:F2}");\nConsole.WriteLine($"Total: £{total:F2}");' },
    "1.8-change": { lesson: "1.8", title: "Change machine", tier: "stretch", minutes: 20, phone: false, concepts: ["ipo", "int-division", "modulo"], requires: ["parse", "modulo"],
      statement: ["Read an amount in pence.", "Print how many of each coin make it, using the fewest coins, in this order and format:", { code: { lang: "", src: "£1: 1\n50p: 1\n20p: 1\n10p: 1\n5p: 1\n2p: 1\n1p: 1" } }, "That example is 188p."],
      starter: "int pence = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "188", out: "£1: 1\n50p: 1\n20p: 1\n10p: 1\n5p: 1\n2p: 1\n1p: 1" }, { stdin: "40", out: "£1: 0\n50p: 0\n20p: 2\n10p: 0\n5p: 0\n2p: 0\n1p: 0" }],
      hidden: [{ stdin: "0", out: "£1: 0\n50p: 0\n20p: 0\n10p: 0\n5p: 0\n2p: 0\n1p: 0" }, { stdin: "399", out: "£1: 3\n50p: 1\n20p: 2\n10p: 0\n5p: 1\n2p: 2\n1p: 0" }],
      hints: ["For each coin, largest first: how many fit is pence / coin.", "What is left over is pence % coin — keep that for the next coin.", "Console.WriteLine($\"£1: {pence / 100}\"); pence %= 100; and so on."],
      answer: 'int pence = int.Parse(Console.ReadLine());\nConsole.WriteLine($"£1: {pence / 100}");\npence %= 100;\nConsole.WriteLine($"50p: {pence / 50}");\npence %= 50;\nConsole.WriteLine($"20p: {pence / 20}");\npence %= 20;\nConsole.WriteLine($"10p: {pence / 10}");\npence %= 10;\nConsole.WriteLine($"5p: {pence / 5}");\npence %= 5;\nConsole.WriteLine($"2p: {pence / 2}");\npence %= 2;\nConsole.WriteLine($"1p: {pence}");' }
  } });

  /* ================================================================
     retrieval cards — each review asks a new variation
     ================================================================ */
  var NAMES = ["Ada", "Kai", "Mei", "Sam", "Noor", "Leo", "Iris", "Ravi", "Zoe", "Tom"];
  K.add({ cards: {
    "u1-swap": { title: "Swap two variables", lesson: "1.3", concepts: ["assign"], kind: "write",
      vary: function (r, n) {
        var a = 1 + r(40), b = a + 1 + r(40), noTemp = n % 2 === 0, isStr = n % 3 === 0;
        var A = isStr ? '"' + pick(r, NAMES) + '"' : String(a), B = isStr ? '"' + pick(r, NAMES.slice().reverse()) + '"' : String(b);
        if (isStr && A === B) B = '"Xan"';
        var plain = function (s) { return s.replace(/"/g, ""); };
        return { prompt: "Swap the values of a and b, then print them separated by a space.",
          label: (isStr ? "two strings" : "two ints") + (noTemp ? ", no temp" : ""),
          params: ["a = " + A, "b = " + B, isStr ? "type string" : "type int"].concat(noTemp ? ["no temporary variable"] : []),
          starter: (isStr ? "string" : "int") + " a = " + A + ", b = " + B + ";\n",
          cases: [{ stdin: "", out: plain(B) + " " + plain(A) }],
          rules: [{ id: "keep", test: function (s) { return s.indexOf("a = " + A) >= 0; }, msg: "Keep the first line as it is." }]
            .concat(noTemp ? [{ id: "notemp", test: function (s) { return !/(int|string|var)\s+\w+\s*=\s*[ab]\s*;/.test(s); }, msg: "This variation asks for it without a temporary variable." }] : []),
          hint: noTemp ? "A tuple can swap in one line: (a, b) = (b, a);" : "Keep a copy of a before it is overwritten.",
          answer: (isStr ? "string" : "int") + " a = " + A + ", b = " + B + ";\n(a, b) = (b, a);\nConsole.WriteLine(a + \" \" + b);" };
      } },
    "u1-interp": { title: "String interpolation", lesson: "1.5", concepts: ["interpolation"], kind: "write",
      vary: function (r, n) {
        var name = pick(r, NAMES), age = 11 + r(60), next = n % 2 === 0;
        var out = next ? name + " will be " + (age + 1) + " next year." : name + " is " + age + ".";
        return { prompt: next ? "Print how old they will be next year, using interpolation." : "Print their name and age as a sentence, using interpolation.",
          label: next ? "an expression in the braces" : "two variables in one sentence",
          params: ["name = " + name, "age = " + age, "print: " + out],
          starter: 'string name = "' + name + '";\nint age = ' + age + ";\n",
          cases: [{ stdin: "", out: out }],
          rules: [{ id: "interp", test: function (s) { return /\$"/.test(s); }, msg: "Use an interpolated string, starting with $." }],
          hint: "Start the string with $ and put each value in braces.",
          answer: 'string name = "' + name + '";\nint age = ' + age + ";\nConsole.WriteLine($\"" + (next ? "{name} will be {age + 1} next year." : "{name} is {age}.") + "\");" };
      } },
    "u1-intdiv": { title: "Integer division and %", lesson: "1.4", concepts: ["int-division", "modulo"], kind: "predict",
      vary: function (r) {
        var b = 2 + r(8), a = b * (2 + r(9)) + 1 + r(b - 1);
        return { prompt: "What does this print?", label: "a new pair of numbers", params: [], src: "Console.WriteLine(" + a + " / " + b + ");\nConsole.WriteLine(" + a + " % " + b + ");", hint: "How many whole times does " + b + " go into " + a + "?" };
      } },
    "u1-compound": { title: "Compound assignment", lesson: "1.4", concepts: ["compound"], kind: "predict",
      vary: function (r) {
        var x = 1 + r(9), p = 1 + r(9), m = 2 + r(3);
        return { prompt: "What does this print?", label: "a new chain of updates", params: [], src: "int x = " + x + ";\nx += " + p + ";\nx *= " + m + ";\nx--;\nConsole.WriteLine(x);", hint: "Work through one line at a time." };
      } },
    "u1-parse": { title: "Read and parse a number", lesson: "1.6", concepts: ["readline", "parse"], kind: "write",
      vary: function (r, n) {
        var k = 2 + r(9), dbl = n % 2 === 0;
        var ins = dbl ? ["2.5", "10", "0.4"] : [String(3 + r(50)), String(-r(20)), "0"];
        var f = function (x) { var v = dbl ? Math.round(parseFloat(x) * k * 100) / 100 : parseInt(x, 10) * k; return dbl ? v.toFixed(2) : String(v); };
        return { prompt: "Read one " + (dbl ? "decimal number" : "whole number") + " and print it multiplied by " + k + (dbl ? ", to two decimal places." : "."),
          label: dbl ? "a double, times " + k : "an int, times " + k, params: [dbl ? "double" : "int", "× " + k],
          starter: "", cases: ins.map(function (x) { return { stdin: x, out: f(x) }; }),
          hint: dbl ? "double.Parse, then {x:F2}." : "int.Parse(Console.ReadLine())",
          answer: dbl ? "double x = double.Parse(Console.ReadLine());\nConsole.WriteLine($\"{x * " + k + ":F2}\");" : "int x = int.Parse(Console.ReadLine());\nConsole.WriteLine(x * " + k + ");" };
      } },
    "u1-cast": { title: "Casting and rounding", lesson: "1.6", concepts: ["casting"], kind: "predict",
      vary: function (r) {
        var w = 1 + r(20), f = [1, 2, 4, 6, 8, 9][r(6)];
        return { prompt: "What does this print?", label: "cast vs Convert", params: [], src: "double d = " + w + "." + f + ";\nConsole.WriteLine((int)d);\nConsole.WriteLine(Convert.ToInt32(d));", hint: "A cast truncates; Convert rounds." };
      } },
    "u1-format": { title: "Formatting a price", lesson: "1.5", concepts: ["format"], kind: "fill",
      vary: function (r) {
        var p = (1 + r(30)) + "." + [0, 5, 2, 8][r(4)];
        return { prompt: "Fill the gap so the price shows two decimal places.", label: "the format for two decimals", params: ["price = " + p],
          src: "double price = " + p + ";\nConsole.WriteLine($\"£{price:@@}\");", cases: [{ stdin: "", out: "£" + parseFloat(p).toFixed(2) }], hint: "F followed by the number of places." };
      } },
    "u1-overflow": { title: "Overflow and long", lesson: "1.7", concepts: ["overflow"], kind: "predict",
      vary: function (r) {
        var k = 1 + r(3), wide = r(2) === 0;
        return { prompt: "What does this print?", label: wide ? "the same sum as a long" : "past int.MaxValue", params: [],
          src: wide ? "long x = int.MaxValue;\nx = x + " + k + ";\nConsole.WriteLine(x);" : "int x = int.MaxValue;\nx = x + " + k + ";\nConsole.WriteLine(x);", hint: "int.MaxValue is 2147483647. An int wraps; a long does not." };
      } },
    "u1-types": { title: "Which type is it?", lesson: "1.2", concepts: ["types"], kind: "predict",
      vary: function (r) {
        var a = 5 + r(20), b = 2 + r(3);
        return { prompt: "What does this print?", label: "int and double division", params: [], src: "Console.WriteLine(" + a + " / " + b + ");\nConsole.WriteLine(" + a + " / " + b + ".0);", hint: "Two ints give an int; a double anywhere gives a double." };
      } }
  } });
})();
