/* Kurenai OS — data/content/code-u3.js
   Code · Unit 3 · Methods and scope (roadmap 5.3).

   Same contract as units 1–2 (docs/code-plan.md §4): every lesson's layers,
   short text layers folded by KOS_CODE.compose; every {run} listing,
   practice item, task answer and retrieval variation checked against .NET
   by tools/cs_diff.mjs. Methods here are local functions of the top-level
   program; overloads live in a small static class, the one place C# allows
   them (classes proper are unit 6). Recursion stays shallow.            */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function run(id, cap, src, stdin) { return { run: { id: id, cap: cap, src: src, stdin: stdin || "" } }; }
  function page(t) { return { page: t }; }
  function call(t, h, body) { return { callout: { t: t, h: h, body: body } }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  /* does the source declare a method with this name (any return type)? */
  function declares(s, name) { return new RegExp("\\b(void|int|long|double|decimal|string|bool|char)\\s+" + name + "\\s*\\(").test(s); }
  function methodCount(s) { return (s.match(/^\s*(static\s+|public\s+)*(void|int|long|double|decimal|string|bool|char)\s+[A-Z]\w*\s*\(/gm) || []).length; }

  K.add({ concepts: {
    "methods": { name: "Methods", lesson: "3.1", about: "a named piece of behaviour" },
    "void": { name: "void methods", lesson: "3.1", about: "methods that do, not compute" },
    "params-args": { name: "Parameters and arguments", lesson: "3.2", about: "values passed in" },
    "return": { name: "return", lesson: "3.2", about: "a value handed back" },
    "scope": { name: "Scope", lesson: "3.3", about: "where a name can be used" },
    "lifetime": { name: "Lifetime", lesson: "3.3", about: "how long a variable lives" },
    "overloads": { name: "Overloads", lesson: "3.4", about: "one name, several signatures" },
    "optional-named": { name: "Optional and named arguments", lesson: "3.4", about: "defaults and labels" },
    "out-param": { name: "out parameters", lesson: "3.5", about: "more than one result" },
    "ref-param": { name: "ref parameters", lesson: "3.5", about: "changing the caller's variable" },
    "validation": { name: "Validation", lesson: "3.6", about: "reject bad input at the door" },
    "throw-arg": { name: "Throwing for bad arguments", lesson: "3.6", about: "ArgumentException and friends" },
    "recursion": { name: "Recursion", lesson: "3.7", about: "a method that calls itself" },
    "base-case": { name: "Base case", lesson: "3.7", about: "the call that stops" },
    "decompose": { name: "Decomposition", lesson: "3.8", about: "one problem into small methods" }
  } });

  /* ================================================================
     3.1 Why methods
     ================================================================ */
  lesson("3.1", {
    aqa: "4.1.1.10",
    notes: [
      page("The problem it solves"),
      "Programs repeat themselves. The same three lines appear in five places, and a fix has to be made five times.",
      run("dup", "the same line, three times", 'Console.WriteLine("==========");\nConsole.WriteLine("Score: 12");\nConsole.WriteLine("==========");\nConsole.WriteLine("Score: 15");\nConsole.WriteLine("==========");'),
      { ul: [ "A **method** gives a piece of behaviour a name.", "Write it once; **call** it wherever it is needed.", "Change it once, and every call changes with it." ] },
      page("Core idea"),
      run("first", "declare once, call twice", 'Banner();\nConsole.WriteLine("Score: 12");\nBanner();\n\nvoid Banner()\n{\n    Console.WriteLine("==========");\n}'),
      { ul: [ "`void Banner()` **declares** the method: `void` means it hands nothing back, `Banner` is its name, `()` its (empty) inputs.", "The body in `{ }` runs each time the method is **called**: `Banner();`.", "When the body ends, the program carries on from the line after the call." ] },
      run("order", "where the program goes", 'Console.WriteLine("1. start");\nStep();\nConsole.WriteLine("3. end");\n\nvoid Step()\n{\n    Console.WriteLine("2. inside Step");\n}'),
      page("Rules"),
      { ul: [
        "In a top-level program a method may be declared anywhere among the statements; by convention they go at the bottom.",
        "Method names are PascalCase verbs or verb phrases: `PrintBanner`, `ShowMenu`.",
        "A call needs its brackets: `Banner();` — `Banner;` alone is an error.",
        "Names are case-sensitive: `banner()` and `Banner()` are different names.",
        "A method can call other methods, including ones declared after it."
      ] },
      run("calls-calls", "a method that calls a method", 'Report();\n\nvoid Report()\n{\n    Line();\n    Console.WriteLine("Weekly report");\n    Line();\n}\n\nvoid Line() => Console.WriteLine(new string(\'-\', 13));'),
      page("Variations"),
      { h: "One-line bodies" },
      "A method whose body is one statement can use `=>` instead of braces.",
      run("arrow", "an expression-bodied method", 'Hello();\nHello();\n\nvoid Hello() => Console.WriteLine("Hello!");'),
      { h: "Reading a program as steps" },
      "Good method names turn the top of a program into a table of contents.",
      run("steps", "the program reads like a plan", 'PrintHeader();\nPrintBody();\nPrintFooter();\n\nvoid PrintHeader() => Console.WriteLine("<header>");\nvoid PrintBody() => Console.WriteLine("  Hello");\nvoid PrintFooter() => Console.WriteLine("</footer>");'),
      page("Under the hood"),
      "A call jumps into the method and remembers where to come back to. The program below shows each jump.",
      run("jumps", "into A, into B, and back", 'Console.WriteLine("main: before");\nA();\nConsole.WriteLine("main: after");\n\nvoid A()\n{\n    Console.WriteLine("  A: start");\n    B();\n    Console.WriteLine("  A: end");\n}\n\nvoid B() => Console.WriteLine("    B: runs");'),
      { ul: [ "The return addresses are kept on the **call stack**; 3.7 looks at it properly.", "Calling a method costs almost nothing. Never avoid one for speed." ] },
      page("Pitfalls"),
      { h: "Leaving out the brackets — CS0201" },
      run("pit-brackets", "a name is not a call", 'Banner;\n\nvoid Banner() => Console.WriteLine("==========");'),
      "`Banner` on its own names the method; `Banner()` calls it.",
      { h: "The wrong case — CS0103" },
      run("pit-case", "banner is not Banner", 'banner();\n\nvoid Banner() => Console.WriteLine("==========");'),
      { h: "Declared but never called" },
      "A method does nothing until it is called. If a message never appears, check the call is there.",
      page("Connections"),
      { ul: [ "**Back:** every program so far already called methods: `Console.WriteLine` is one.", "**Next:** 3.2 passes values in and gets values back.", "**AQA:** 4.1.1.10 subroutines (procedures and functions)." ] },
      page("Good practice"),
      { ul: [ "One method, one job; its name says what the job is.", "If you copy and paste a block, it probably wants to be a method." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Star banner* and *Receipt*." ] },
      page("Quick reference"),
      run("qr", "declare and call", 'Greet();\n\nvoid Greet()\n{\n    Console.WriteLine("Hi!");\n}\n\nvoid Bye() => Console.WriteLine("Bye!");'),
      { ul: [ "`void Name() { … }` declares; `Name();` calls.", "`void` = hands nothing back.", "`=>` for a one-statement body.", "PascalCase verb names." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0201", "a method named but not called", "Pitfalls"], ["CS0103", "no method with that exact name", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine("a");\nB();\nConsole.WriteLine("c");\n\nvoid B() => Console.WriteLine("b");', why: "The call to B prints b between a and c.", concepts: ["methods"] },
        { id: "p2", src: 'Twice();\n\nvoid Twice()\n{\n    Once();\n    Once();\n}\n\nvoid Once() => Console.WriteLine("hi");', why: "Twice calls Once two times.", concepts: ["methods", "void"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to declare the method.", src: 'Line();\n\n@@ Line() => Console.WriteLine("----");', out: "----", concepts: ["void"] }
      ],
      bug: [
        { id: "b1", q: "It should print the banner twice.", src: 'Banner();\nbanner();\n\nvoid Banner() => Console.WriteLine("==");', out: "==\n==", fixedText: "prints == twice", why: "Names are case-sensitive: call Banner().", concepts: ["methods"] }
      ]
    },
    flashcards: [
      ["What does `void` mean in `void Banner()`?", "The method hands no value back to its caller."],
      ["How do you call a method named `Banner`?", "`Banner();` — the name followed by brackets."],
      ["Where does the program go when a method ends?", "Back to the line after the call."],
      ["When is `=>` used for a method body?", "When the body is a single statement or expression."],
      ["Why use methods?", "Name a piece of behaviour, write it once, call it from many places, and change it in one place."],
      ["Can a method call a method declared below it?", "Yes — declaration order does not matter for calls."]
    ],
    quiz: [
      { q: "How many lines does `A(); A();` print if `void A() => Console.WriteLine(\"x\");`?", opts: ["0", "1", "2", "an error"], ans: 2, why: "Each call runs the body once." },
      { q: "Which line calls the method?", opts: ["void Show()", "Show;", "Show();", "Show() => …"], ans: 2, why: "A call is the name with brackets and a semicolon." },
      { q: "A good method name?", opts: ["stuff", "DoIt2", "PrintMenu", "m"], ans: 2, why: "A PascalCase verb phrase that says the job." },
      { q: "`banner();` when only `Banner` exists gives…", opts: ["CS0103", "nothing", "a warning", "Banner's output"], ans: 0, why: "Names are case-sensitive, so banner does not exist." }
    ]
  });
  K.add({ tasks: {
    "3.1-stars": { lesson: "3.1", title: "Star banner", tier: "warm-up", minutes: 5, concepts: ["methods", "void"], requires: ["writeline"],
      statement: ["Write a method `Stars()` that prints `*****`.", "Call it, print `Hello`, then call it again."],
      starter: "",
      examples: [{ stdin: "", out: "*****\nHello\n*****" }],
      rules: [{ id: "method", test: function (s) { return /void\s+Stars\s*\(\s*\)/.test(s) && (s.match(/\bStars\s*\(\s*\)\s*;/g) || []).length >= 2; }, msg: "Declare void Stars() and call it twice." }],
      hints: ["Declare the method below your statements.", "void Stars() => Console.WriteLine(\"*****\");", "Stars(); Console.WriteLine(\"Hello\"); Stars();"],
      answer: 'Stars();\nConsole.WriteLine("Hello");\nStars();\n\nvoid Stars() => Console.WriteLine("*****");' },
    "3.1-receipt": { lesson: "3.1", title: "Receipt", tier: "core", minutes: 10, concepts: ["methods", "void"], requires: ["readline"],
      statement: ["Read a shop name.", "Print a line of 20 `=`, the name, the line, `Thank you!`, and the line again.", "Write the line once, in a method `Rule()`."],
      starter: "string shop = Console.ReadLine();\n",
      examples: [{ stdin: "Kurenai Mart", out: "====================\nKurenai Mart\n====================\nThank you!\n====================" }],
      hidden: [{ stdin: "Corner Shop", out: "====================\nCorner Shop\n====================\nThank you!\n====================" }],
      rules: [{ id: "rule", test: function (s) { return /void\s+Rule\s*\(\s*\)/.test(s) && (s.match(/"=+"|'='/g) || []).length <= 1; }, msg: "Write the line of = once, inside void Rule()." }],
      hints: ["The line is printed three times: that is the method.", "void Rule() => Console.WriteLine(new string('=', 20));", "Rule(); name; Rule(); Thank you!; Rule();"],
      answer: 'string shop = Console.ReadLine();\nRule();\nConsole.WriteLine(shop);\nRule();\nConsole.WriteLine("Thank you!");\nRule();\n\nvoid Rule() => Console.WriteLine(new string(\'=\', 20));' }
  } });

  /* ================================================================
     3.2 Parameters and return values
     ================================================================ */
  lesson("3.2", {
    aqa: "4.1.1.11",
    notes: [
      page("The problem it solves"),
      { ul: [ "A method that always does exactly the same thing is useful only so often.", "**Parameters** let the caller hand it values; a **return value** hands one back.", "`Math.Max(3, 8)` is the pattern: two values in, one value out." ] },
      page("Core idea"),
      run("param", "a parameter", 'Greet("Ada");\nGreet("Linus");\n\nvoid Greet(string name)\n{\n    Console.WriteLine($"Hello, {name}!");\n}'),
      { ul: [ "`string name` is a **parameter**: a local variable the caller fills in.", "`\"Ada\"` is the **argument**: the value given for it in this call." ] },
      run("return", "a return value", 'int a = Square(4);\nConsole.WriteLine(a);\nConsole.WriteLine(Square(3) + Square(4));\n\nint Square(int n)\n{\n    return n * n;\n}'),
      { ul: [ "The return type (`int`) replaces `void`.", "`return` ends the method and hands the value back; the call **is** that value." ] },
      page("Rules"),
      { ul: [
        "Arguments match parameters by position, and each must fit the parameter's type.",
        "Every path through a method with a return type must reach a `return` with a value.",
        "A `void` method has no value: it cannot be stored or printed.",
        "Arguments are **copied** in: changing a parameter never changes the caller's variable (3.5 shows the exception).",
        "A call can be used wherever a value of its type can: in a sum, a condition, or another call."
      ] },
      run("copy", "the parameter is a copy", 'int score = 10;\nAddBonus(score);\nConsole.WriteLine(score);\n\nvoid AddBonus(int s)\n{\n    s += 5;\n    Console.WriteLine($"inside: {s}");\n}'),
      page("Variations"),
      { h: "Several parameters" },
      run("two", "two in, one out", 'Console.WriteLine(Average(3, 4));\n\ndouble Average(int a, int b) => (a + b) / 2.0;'),
      { h: "A question as a method" },
      run("bool", "methods that answer yes or no", 'for (int i = 1; i <= 4; i++)\n    Console.WriteLine($"{i}: {IsEven(i)}");\n\nbool IsEven(int n) => n % 2 == 0;'),
      { h: "Calls inside calls" },
      run("nest", "the inner call runs first", 'Console.WriteLine(Max(Max(3, 8), 5));\n\nint Max(int a, int b) => a > b ? a : b;'),
      { h: "Returning early" },
      run("early", "the first return wins", 'Console.WriteLine(Sign(-4));\nConsole.WriteLine(Sign(0));\nConsole.WriteLine(Sign(9));\n\nstring Sign(int n)\n{\n    if (n < 0) return "negative";\n    if (n == 0) return "zero";\n    return "positive";\n}'),
      page("Pitfalls"),
      { h: "A path with no return — CS0161" },
      run("pit-path", "odd numbers return nothing", 'Console.WriteLine(Half(4));\n\nint Half(int n)\n{\n    if (n % 2 == 0) return n / 2;\n}'),
      "The compiler checks every path. Add the missing `return` (or an `else`).",
      { h: "Using a void method as a value — CS0029" },
      run("pit-void", "Greet gives nothing back", 'string s = Greet("Ada");\n\nvoid Greet(string name) => Console.WriteLine("Hi " + name);'),
      { h: "A missing argument — CS7036" },
      run("pit-missing", "Square needs an n", 'Console.WriteLine(Square());\n\nint Square(int n) => n * n;'),
      { h: "The wrong type — CS1503" },
      run("pit-type", "text is not an int", 'Console.WriteLine(Square("4"));\n\nint Square(int n) => n * n;'),
      { h: "Integer division in a return" },
      run("pit-intdiv", "(3 + 4) / 2 is 3", 'Console.WriteLine(Average(3, 4));\n\ndouble Average(int a, int b) => (a + b) / 2;'),
      "The division happens between ints before the result becomes a `double`. Divide by `2.0`.",
      page("Connections"),
      { ul: [ "**Back:** 1.4's integer division bites inside methods too.", "**Next:** 3.3 — where a parameter can be seen, and for how long.", "**AQA:** 4.1.1.11 parameters and 4.1.1.12 returning a value." ] },
      page("Good practice"),
      { ul: [ "Prefer methods that **return** a value over methods that print it: the caller decides what to do with it.", "Name a `bool` method as a question: `IsEven`, `HasPassed`." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Rectangle area* and *Celsius to Fahrenheit*." ] },
      page("Quick reference"),
      run("qr", "in and out", 'int Add(int a, int b) => a + b;\nbool IsAdult(int age) => age >= 18;\n\nConsole.WriteLine(Add(2, 3));\nConsole.WriteLine(IsAdult(17));'),
      { ul: [ "`type Name(type p, …) { return value; }`", "Parameter = the variable; argument = the value passed.", "Every path returns.", "Arguments are copies." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0161", "a path ends without return", "Pitfalls"], ["CS0029", "a void method used as a value", "Pitfalls"], ["CS7036", "an argument missing", "Pitfalls"], ["CS1503", "an argument of the wrong type", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine(Twice(Twice(3)));\n\nint Twice(int n) => n * 2;', why: "Twice(3) is 6, and Twice(6) is 12.", concepts: ["return"] },
        { id: "p2", src: 'int x = 4;\nChange(x);\nConsole.WriteLine(x);\n\nvoid Change(int n) { n = 99; }', why: "The parameter is a copy, so x stays 4.", concepts: ["params-args"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the method hands back the cube.", src: 'Console.WriteLine(Cube(3));\n\nint Cube(int n)\n{\n    @@ n * n * n;\n}', out: "27", concepts: ["return"] }
      ],
      bug: [
        { id: "b1", q: "It should print 2.5.", src: 'Console.WriteLine(Half(5));\n\ndouble Half(int n) => n / 2;', out: "2.5", fixedText: "prints 2.5", why: "n / 2 is integer division; divide by 2.0.", concepts: ["return"] }
      ]
    },
    flashcards: [
      ["Parameter or argument: `n` in `int Square(int n)`?", "Parameter — the variable in the declaration."],
      ["Parameter or argument: `4` in `Square(4)`?", "Argument — the value passed in a call."],
      ["What does `return` do?", "Ends the method and hands its value back to the caller."],
      ["What is CS0161?", "Not all code paths return a value: some path ends without a return."],
      ["Does changing a parameter change the caller's variable?", "No — arguments are copied in (unless ref, 3.5)."],
      ["Why return a value rather than print it?", "The caller can use it — store, compare, print or pass it on."]
    ],
    quiz: [
      { q: "`int F(int x) => x + 1;` — what is `F(F(1))`?", opts: ["2", "3", "4", "an error"], ans: 1, why: "F(1) = 2; F(2) = 3." },
      { q: "Which can be printed with Console.WriteLine?", opts: ["a void method's call", "an int method's call", "neither", "both"], ans: 1, why: "A void method has no value to print." },
      { q: "`double Avg(int a, int b) => (a + b) / 2;` — Avg(1, 2)?", opts: ["1.5", "1", "2", "an error"], ans: 1, why: "The division is between ints." },
      { q: "A method returns only inside an if. The compiler says…", opts: ["CS0161", "CS0103", "nothing", "CS0029"], ans: 0, why: "The other path has no return." }
    ]
  });
  K.add({ tasks: {
    "3.2-area": { lesson: "3.2", title: "Rectangle area", tier: "warm-up", minutes: 5, concepts: ["params-args", "return"], requires: ["parse"],
      statement: ["Write `int Area(int width, int height)` that returns the area.", "Read the width and the height, one per line, and print `Area: N`."],
      starter: "int w = int.Parse(Console.ReadLine());\nint h = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "3\n4", out: "Area: 12" }],
      hidden: [{ stdin: "10\n1", out: "Area: 10" }, { stdin: "0\n7", out: "Area: 0" }],
      rules: [{ id: "area", test: function (s) { return /int\s+Area\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*\)/.test(s); }, msg: "Declare int Area(int width, int height)." }],
      hints: ["The method takes two ints and returns their product.", "int Area(int width, int height) => width * height;", "Console.WriteLine($\"Area: {Area(w, h)}\");"],
      answer: 'int w = int.Parse(Console.ReadLine());\nint h = int.Parse(Console.ReadLine());\nConsole.WriteLine($"Area: {Area(w, h)}");\n\nint Area(int width, int height) => width * height;' },
    "3.2-convert": { lesson: "3.2", title: "Celsius to Fahrenheit", tier: "core", minutes: 10, concepts: ["params-args", "return"], requires: ["parse", "format"],
      statement: ["Write `double CToF(double c)` that returns c × 9 / 5 + 32.", "Read a temperature in °C (it may have decimals) and print it in °F to one decimal place, like `212.0 F`."],
      starter: "",
      examples: [{ stdin: "100", out: "212.0 F" }, { stdin: "36.6", out: "97.9 F" }],
      hidden: [{ stdin: "-40", out: "-40.0 F" }, { stdin: "0", out: "32.0 F" }, { stdin: "37", out: "98.6 F" }],
      rules: [{ id: "method", test: function (s) { return /double\s+CToF\s*\(\s*double\s+\w+\s*\)/.test(s); }, msg: "Declare double CToF(double c) and use it." }],
      hints: ["double.Parse reads a number with decimals.", "double CToF(double c) => c * 9 / 5 + 32;", "Console.WriteLine($\"{CToF(c):F1} F\");"],
      answer: 'double c = double.Parse(Console.ReadLine());\nConsole.WriteLine($"{CToF(c):F1} F");\n\ndouble CToF(double c) => c * 9 / 5 + 32;' }
  } });

  /* ================================================================
     3.3 Scope and lifetime
     ================================================================ */
  lesson("3.3", {
    aqa: "4.1.1.13",
    notes: [
      page("The problem it solves"),
      { ul: [ "In a long program, the name `count` might mean five different things.", "**Scope** limits where a name can be used, so a name in one place cannot be broken by code somewhere else.", "**Lifetime** is how long the variable's value lasts." ] },
      page("Core idea"),
      "A variable's scope is the block `{ }` it is declared in, from its declaration to the closing brace.",
      run("block", "square lives inside the loop", 'int total = 0;\nfor (int i = 1; i <= 3; i++)\n{\n    int square = i * i;\n    total += square;\n}\nConsole.WriteLine(total);'),
      { ul: [ "`total` is declared outside the loop, so it is visible after it.", "`i` and `square` exist only inside the loop." ] },
      "A method's own variables are created fresh on every call and disappear when it returns.",
      run("local", "count starts again each call", 'Tally();\nTally();\nTally();\n\nvoid Tally()\n{\n    int count = 0;\n    count++;\n    Console.WriteLine(count);\n}'),
      page("Rules"),
      { ul: [
        "A name can be used from its declaration to the end of its block.",
        "Inner blocks see outer names; outer code never sees inner names.",
        "A name cannot be declared again inside a block where it is already visible.",
        "Two blocks side by side may reuse a name: each loop gets its own `i`.",
        "A method declared in a top-level program can read and change the program's variables; mark it `static` to forbid that."
      ] },
      run("sibling", "two loops, two separate i", 'for (int i = 0; i < 2; i++) Console.Write(i);\nfor (int i = 5; i < 7; i++) Console.Write(i);\nConsole.WriteLine();'),
      page("Variations"),
      { h: "Using the program's variables" },
      "A local method can use a variable declared in the program: it lives as long as the program.",
      run("outer", "calls is shared", 'int calls = 0;\nNext();\nNext();\nConsole.WriteLine(Next());\n\nint Next()\n{\n    calls++;\n    return calls;\n}'),
      { h: "A method's own name wins" },
      run("own", "the inner n is a different variable", 'int n = 3;\nShow();\nConsole.WriteLine($"outside: {n}");\n\nvoid Show()\n{\n    int n = 5;\n    Console.WriteLine($"inside: {n}");\n}'),
      { h: "static: only what it is given" },
      run("static", "a static method sees only its parameters", 'int price = 40;\nConsole.WriteLine(WithVat(price));\n\nstatic double WithVat(int p) => p * 1.2;'),
      call("tip", "Prefer parameters", ["A method that only uses its parameters can be read, tested and moved on its own. `static` makes the compiler hold you to it."]),
      page("Under the hood"),
      { ul: [ "Each call gets a **stack frame** holding its parameters and locals; returning throws the frame away.", "That is why `Tally` starts from 0 every time, and why recursion (3.7) works.", "AQA calls the program's own variables **global** and a method's **local**." ] },
      page("Pitfalls"),
      { h: "Using a name outside its block — CS0103" },
      run("pit-outside", "sq ended with the loop", 'for (int i = 0; i < 3; i++)\n{\n    int sq = i * i;\n}\nConsole.WriteLine(sq);'),
      "Declare the variable before the loop if it is needed after it.",
      { h: "Declaring a name twice — CS0136" },
      run("pit-twice", "x is already visible", 'int x = 1;\nif (x > 0)\n{\n    int x = 2;\n    Console.WriteLine(x);\n}'),
      { h: "A static method reaching out — CS8421" },
      run("pit-static", "price is not a parameter", 'int price = 40;\nConsole.WriteLine(WithVat());\n\nstatic double WithVat() => price * 1.2;'),
      { h: "Expecting a local to remember" },
      "A local is new on every call. To keep a value between calls, keep it outside the method (or return it).",
      page("Connections"),
      { ul: [ "**Back:** 2.6's loop counter is scoped to its loop.", "**Next:** 3.7 relies on every call having its own frame.", "**AQA:** 4.1.1.13 local variables, 4.1.1.14 global variables, 4.1.1.15 stack frames." ] },
      page("Good practice"),
      { ul: [ "Declare a variable in the smallest scope that works, as late as possible.", "Pass values in as parameters rather than reaching out to shared variables." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Largest so far* and *Running tally*." ] },
      page("Quick reference"),
      run("qr", "scope in one program", 'int total = 0;                 // whole program\nfor (int i = 0; i < 3; i++)    // i: the loop only\n    total += Twice(i);\nConsole.WriteLine(total);\n\nstatic int Twice(int n) => n * 2; // n: this call only'),
      { ul: [ "Scope = the block, from the declaration on.", "Inner sees outer, never the reverse.", "Locals are new on every call.", "`static` methods use only their parameters." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0103", "the name is out of scope", "Pitfalls"], ["CS0136", "the name is already in use here", "Pitfalls"], ["CS8421", "a static method used an outside variable", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int n = 1;\nBump();\nBump();\nConsole.WriteLine(n);\n\nvoid Bump() { n++; }', why: "Bump changes the program's n, so it ends at 3.", concepts: ["scope"] },
        { id: "p2", src: 'Count();\nCount();\n\nvoid Count()\n{\n    int c = 10;\n    c++;\n    Console.WriteLine(c);\n}', why: "c is a new local each call: 11 both times.", concepts: ["lifetime"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so total is visible after the loop.", src: '@@ total = 0;\nfor (int i = 1; i <= 4; i++) total += i;\nConsole.WriteLine(total);', out: "10", concepts: ["scope"] }
      ],
      bug: [
        { id: "b1", q: "It should print the last number read.", stdin: "4\n7", src: 'for (int i = 0; i < 2; i++)\n{\n    int last = int.Parse(Console.ReadLine());\n}\nConsole.WriteLine(last);', cases: [{ stdin: "4\n7", out: "7" }], fixedText: "prints 7", why: "Declare last before the loop so it is in scope after it.", concepts: ["scope"] }
      ]
    },
    flashcards: [
      ["What is a variable's scope?", "The block it is declared in, from the declaration to the closing brace."],
      ["Can code after a loop use a variable declared inside it?", "No — it is out of scope (CS0103)."],
      ["Why does a method's local start fresh on every call?", "Each call gets a new stack frame; the old one is discarded on return."],
      ["What does `static` on a local method forbid?", "Using the program's variables: it may use only its parameters and its own locals."],
      ["What is CS0136?", "Declaring a name inside a block where that name is already in use."],
      ["Local vs global (AQA)?", "Local: declared in a subroutine, lives for one call. Global: visible to the whole program."]
    ],
    quiz: [
      { q: "Two `for (int i …)` loops one after the other…", opts: ["compile fine", "give CS0136", "share one i", "give CS0103"], ans: 0, why: "Each loop's i is scoped to that loop." },
      { q: "A method declares `int c = 0; c++;` and prints c. Called 3 times, it prints…", opts: ["1 2 3", "1 1 1", "0 0 0", "3"], ans: 1, why: "A local is created again each call." },
      { q: "`static int F() => total;` where total is a program variable…", opts: ["works", "CS8421", "CS0161", "prints 0"], ans: 1, why: "A static local method cannot use outside variables." },
      { q: "The smallest scope that works is good because…", opts: ["it is faster", "fewer places can change the variable", "it saves memory only", "the compiler requires it"], ans: 1, why: "Less code can touch it, so it is easier to reason about." }
    ]
  });
  K.add({ tasks: {
    "3.3-largest": { lesson: "3.3", title: "Largest so far", tier: "warm-up", minutes: 8, concepts: ["scope"], requires: ["for", "parse"],
      statement: ["The first line says how many numbers follow; read them.", "Print `Largest: X`.", "The starter does not compile: fix where `max` is declared."],
      starter: 'int n = int.Parse(Console.ReadLine());\nfor (int i = 0; i < n; i++)\n{\n    int max = int.MinValue;\n    int x = int.Parse(Console.ReadLine());\n    if (x > max) max = x;\n}\nConsole.WriteLine($"Largest: {max}");\n',
      examples: [{ stdin: "3\n4\n9\n2", out: "Largest: 9" }],
      hidden: [{ stdin: "1\n-5", out: "Largest: -5" }, { stdin: "4\n1\n1\n1\n1", out: "Largest: 1" }],
      hints: ["max must outlive the loop.", "Move `int max = int.MinValue;` above the for.", "Inside the loop keep only the read and the comparison."],
      answer: 'int n = int.Parse(Console.ReadLine());\nint max = int.MinValue;\nfor (int i = 0; i < n; i++)\n{\n    int x = int.Parse(Console.ReadLine());\n    if (x > max) max = x;\n}\nConsole.WriteLine($"Largest: {max}");' },
    "3.3-tally": { lesson: "3.3", title: "Running tally", tier: "core", minutes: 12, concepts: ["scope", "lifetime"], requires: ["input-loop", "parse"],
      statement: ["Read whole numbers until a line says `done`.", "A method `void Record(int n)` adds each to a total and a count kept outside it.", "Then print `Count: N, total: T`."],
      starter: "",
      examples: [{ stdin: "3\n4\ndone", out: "Count: 2, total: 7" }],
      hidden: [{ stdin: "done", out: "Count: 0, total: 0" }, { stdin: "10\n-2\n5\ndone", out: "Count: 3, total: 13" }],
      rules: [{ id: "record", test: function (s) { return /void\s+Record\s*\(\s*int\s+\w+\s*\)/.test(s) && /\bRecord\s*\(\s*[^)\s]/.test(s.replace(/void\s+Record\s*\(/, "")); }, msg: "Declare void Record(int n) and call it for each number." }],
      hints: ["count and total belong to the program, declared before the loop.", "void Record(int n) { count++; total += n; }", "string line = Console.ReadLine(); while (line != \"done\") { Record(int.Parse(line)); line = Console.ReadLine(); }"],
      answer: 'int count = 0, total = 0;\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    Record(int.Parse(line));\n    line = Console.ReadLine();\n}\nConsole.WriteLine($"Count: {count}, total: {total}");\n\nvoid Record(int n)\n{\n    count++;\n    total += n;\n}' }
  } });

  /* ================================================================
     3.4 Overloads, optional and named arguments
     ================================================================ */
  lesson("3.4", {
    aqa: "4.1.1.11",
    notes: [
      page("The problem it solves"),
      { ul: [ "`Console.WriteLine` accepts a string, an int, a bool, or nothing at all — one name, many forms.", "Your own methods can do the same: **optional** parameters with defaults, **named** arguments for clarity, and **overloads** for genuinely different inputs." ] },
      page("Core idea"),
      { h: "Optional parameters" },
      run("optional", "times defaults to 1", 'Console.WriteLine(Shout("hi"));\nConsole.WriteLine(Shout("hi", 3));\n\nstring Shout(string text, int times = 1)\n{\n    string r = "";\n    for (int i = 0; i < times; i++) r += text.ToUpper() + "!";\n    return r;\n}'),
      { h: "Named arguments" },
      run("named", "the order no longer matters", 'Console.WriteLine(Describe(age: 17, name: "Ada"));\n\nstring Describe(string name, int age) => $"{name} is {age}";'),
      { h: "Overloads" },
      "Several methods with one name and different parameter lists. In a top-level program they live in a `static class`, the one place C# allows them (classes proper are unit 6).",
      run("overload", "three Areas", 'Console.WriteLine(Calc.Area(3));\nConsole.WriteLine(Calc.Area(3, 4));\nConsole.WriteLine(Calc.Area(2.5));\n\nstatic class Calc\n{\n    public static int Area(int side) => side * side;\n    public static int Area(int width, int height) => width * height;\n    public static double Area(double radius) => Math.Round(Math.PI * radius * radius, 2);\n}'),
      page("Rules"),
      { ul: [
        "Optional parameters come after all required ones, and their defaults are constants.",
        "A named argument may skip optional parameters in between.",
        "Overloads must differ in the number or types of their parameters — never the return type alone.",
        "The compiler picks the overload whose parameters fit the arguments best, before the program runs.",
        "Local methods in a top-level program cannot be overloaded; use a static class."
      ] },
      run("line", "defaults and names together", "Line();\nLine('*');\nLine(n: 3);\nLine(n: 4, c: '=');\n\nvoid Line(char c = '-', int n = 10) => Console.WriteLine(new string(c, n));"),
      page("Variations"),
      { h: "Which overload?" },
      "A `char` has no overload of its own here, so it widens to `int` — a surprise worth knowing.",
      run("pick", "picked by the argument's type", 'Console.WriteLine(Fmt.Show(3));\nConsole.WriteLine(Fmt.Show(3.5));\nConsole.WriteLine(Fmt.Show("x"));\nConsole.WriteLine(Fmt.Show(\'A\'));\n\nstatic class Fmt\n{\n    public static string Show(int n) => "int " + n;\n    public static string Show(double d) => "double " + d;\n    public static string Show(string s) => "string " + s;\n}'),
      { h: "Naming a bool" },
      run("clarity", "gift: true says what true means", 'Order("Dune");\nOrder("Dune", 3);\nOrder("Dune", gift: true);\n\nvoid Order(string title, int copies = 1, bool gift = false)\n{\n    string note = gift ? " (gift)" : "";\n    Console.WriteLine($"{copies} x {title}{note}");\n}'),
      { h: "An overload that calls another" },
      run("chain", "the three-number Max reuses the two-number one", 'Console.WriteLine(Pick.Max(3, 9));\nConsole.WriteLine(Pick.Max(3, 9, 12));\n\nstatic class Pick\n{\n    public static int Max(int a, int b) => a > b ? a : b;\n    public static int Max(int a, int b, int c) => Max(Max(a, b), c);\n}'),
      page("Choosing"),
      { table: { head: ["Need", "Use"], rows: [["Same job, a sensible default", "an optional parameter"], ["A call with several bools or numbers", "named arguments"], ["Different kinds of input", "overloads"]] } },
      page("Pitfalls"),
      { h: "Optional before required — CS1737" },
      run("pit-order", "d has no default", 'Console.WriteLine(Volume(2, 3, 4));\n\nint Volume(int w, int h = 1, int d) => w * h * d;'),
      { h: "Overloading a local method — CS0128" },
      run("pit-local", "local methods share one name space", 'Console.WriteLine(Twice(3));\n\nint Twice(int n) => n * 2;\nint Twice(int a, int b) => a + b;'),
      { h: "A name that is not a parameter — CS1739" },
      run("pit-name", "there is no d", 'Console.WriteLine(Area(w: 3, h: 4, d: 2));\n\nint Area(int w, int h) => w * h;'),
      { h: "No overload fits — CS1503" },
      run("pit-fit", "a bool fits neither", 'Console.WriteLine(Fmt.Show(true));\n\nstatic class Fmt\n{\n    public static string Show(int n) => "int " + n;\n    public static string Show(string s) => "string " + s;\n}'),
      page("Connections"),
      { ul: [ "**Back:** `Console.WriteLine` and `Math.Round` are overloaded.", "**Later:** unit 6's classes overload constructors the same way.", "**AQA:** 4.1.1.11 parameters of subroutines." ] },
      page("Good practice"),
      { ul: [ "Name every `bool` argument: `Save(file, overwrite: true)`.", "Keep overloads doing the same job; if they do different things, give them different names." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Greetings* and *Max of two or three*." ] },
      page("Quick reference"),
      run("qr", "three tools", 'void Say(string s, int times = 1) { for (int i = 0; i < times; i++) Console.WriteLine(s); }\nSay("hi");\nSay(times: 2, s: "yo");\nConsole.WriteLine(Math.Max(2, 7) + " " + Math.Max(2.5, 1.0));'),
      { ul: [ "`type p = default` — optional, after the required ones.", "`Name(p: value)` — named.", "Overloads: one name, different parameters, in a static class." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1737", "optional parameter before a required one", "Pitfalls"], ["CS0128", "two local methods with one name", "Pitfalls"], ["CS1739", "no parameter with that name", "Pitfalls"], ["CS1503", "no overload takes that type", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine(Box(5));\nConsole.WriteLine(Box(5, 2));\n\nint Box(int w, int h = 3) => w * h;', why: "Box(5) uses h = 3 (15); Box(5, 2) is 10.", concepts: ["optional-named"] },
        { id: "p2", src: 'Console.WriteLine(F.Kind(4));\nConsole.WriteLine(F.Kind(4.0));\n\nstatic class F\n{\n    public static string Kind(int n) => "whole";\n    public static string Kind(double d) => "real";\n}', why: "4 is an int, 4.0 a double.", concepts: ["overloads"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so a call with one argument uses 2 as the power.", src: 'Console.WriteLine(Power(5));\n\nint Power(int b, int e @@ 2)\n{\n    int r = 1;\n    for (int i = 0; i < e; i++) r *= b;\n    return r;\n}', out: "25", concepts: ["optional-named"] }
      ],
      bug: [
        { id: "b1", q: "It should print 'Kai is 12'.", src: 'Console.WriteLine(Describe(12, "Kai"));\n\nstring Describe(string name, int age) => $"{name} is {age}";', out: "Kai is 12", fixedText: "prints Kai is 12", why: "Pass the arguments in order, or name them: Describe(age: 12, name: \"Kai\").", concepts: ["optional-named"] }
      ]
    },
    flashcards: [
      ["What is an optional parameter?", "One with a default value, `int n = 10`, which a call may leave out."],
      ["Where must optional parameters go?", "After all the required ones (otherwise CS1737)."],
      ["What does a named argument look like?", "`Line(n: 3)` — the parameter's name, a colon, the value."],
      ["What is an overload?", "Another method with the same name and a different parameter list."],
      ["Can two overloads differ only in return type?", "No — the parameters must differ."],
      ["Why can't top-level local methods be overloaded?", "Local methods share one scope of names; overloads live in a class (CS0128)."]
    ],
    quiz: [
      { q: "`void P(int a, int b = 5)` — which call is valid?", opts: ["P()", "P(1)", "P(b: 2)", "P(1, 2, 3)"], ans: 1, why: "a is required; b may be left out." },
      { q: "Which pair are valid overloads?", opts: ["int F(int x) / double F(int x)", "int F(int x) / int F(int y)", "int F(int x) / int F(string s)", "none"], ans: 2, why: "Only the parameter types or count can differ." },
      { q: "`Fmt.Show('A')` with overloads for int, double and string calls…", opts: ["string", "int", "double", "an error"], ans: 1, why: "A char converts to int implicitly." },
      { q: "Why write `Save(f, overwrite: true)`?", opts: ["it is faster", "true alone does not say what it means", "it is required", "to skip a parameter"], ans: 1, why: "Named arguments make bool calls readable." }
    ]
  });
  K.add({ tasks: {
    "3.4-greet": { lesson: "3.4", title: "Greetings", tier: "warm-up", minutes: 6, concepts: ["optional-named"], requires: ["readline", "interpolation"],
      statement: ["Write `string Greeting(string name, string word = \"Hello\")` that returns `word, name!`.", "Read a name and print `Greeting(name)` then `Greeting(name, \"Goodbye\")`."],
      starter: "string name = Console.ReadLine();\n",
      examples: [{ stdin: "Ada", out: "Hello, Ada!\nGoodbye, Ada!" }],
      hidden: [{ stdin: "Kai", out: "Hello, Kai!\nGoodbye, Kai!" }],
      rules: [{ id: "optional", test: function (s) { return /string\s+Greeting\s*\(\s*string\s+\w+\s*,\s*string\s+\w+\s*=\s*"Hello"\s*\)/.test(s); }, msg: "Give Greeting an optional word parameter that defaults to \"Hello\"." }],
      hints: ["The second parameter has a default.", "string Greeting(string name, string word = \"Hello\") => $\"{word}, {name}!\";", "Console.WriteLine(Greeting(name)); Console.WriteLine(Greeting(name, \"Goodbye\"));"],
      answer: 'string name = Console.ReadLine();\nConsole.WriteLine(Greeting(name));\nConsole.WriteLine(Greeting(name, "Goodbye"));\n\nstring Greeting(string name, string word = "Hello") => $"{word}, {name}!";' },
    "3.4-max": { lesson: "3.4", title: "Max of two or three", tier: "core", minutes: 12, concepts: ["overloads"], requires: ["parse", "ternary"],
      statement: ["Read three whole numbers, one per line.", "Print the larger of the first two, then the largest of all three.", "Use two overloads of `Max` in a `static class Pick`."],
      starter: "",
      examples: [{ stdin: "3\n9\n5", out: "9\n9" }],
      hidden: [{ stdin: "7\n2\n8", out: "7\n8" }, { stdin: "-1\n-1\n-2", out: "-1\n-1" }],
      rules: [{ id: "overloads", test: function (s) { return (s.match(/static\s+int\s+Max\s*\(/g) || []).length >= 2 && /static\s+class\s+Pick/.test(s); }, msg: "Write two overloads of static int Max in static class Pick." }],
      hints: ["One Max takes two ints, the other three.", "public static int Max(int a, int b) => a > b ? a : b;", "public static int Max(int a, int b, int c) => Max(Max(a, b), c);"],
      answer: 'int a = int.Parse(Console.ReadLine());\nint b = int.Parse(Console.ReadLine());\nint c = int.Parse(Console.ReadLine());\nConsole.WriteLine(Pick.Max(a, b));\nConsole.WriteLine(Pick.Max(a, b, c));\n\nstatic class Pick\n{\n    public static int Max(int a, int b) => a > b ? a : b;\n    public static int Max(int a, int b, int c) => Max(Max(a, b), c);\n}' }
  } });

  /* ================================================================
     3.5 out and ref
     ================================================================ */
  lesson("3.5", {
    aqa: "4.1.1.12",
    notes: [
      page("The problem it solves"),
      { ul: [ "`return` hands back one value. Dividing gives two: a quotient and a remainder.", "Sometimes a method should change the caller's own variable, like a swap.", "`out` and `ref` pass a variable itself, not a copy." ] },
      page("Core idea"),
      { h: "out: a second result" },
      run("divide", "two results from one call", 'Divide(17, 5, out int q, out int r);\nConsole.WriteLine($"{q} r {r}");\n\nvoid Divide(int a, int b, out int quot, out int rem)\n{\n    quot = a / b;\n    rem = a % b;\n}'),
      "You have used `out` already: `int.TryParse` returns whether it worked and puts the number in an `out` variable.",
      run("tryparse", "TryParse never throws", 'bool ok = int.TryParse("42", out int n);\nConsole.WriteLine($"{ok} {n}");\nok = int.TryParse("forty", out n);\nConsole.WriteLine($"{ok} {n}");'),
      { h: "ref: change the caller's variable" },
      run("ref", "total doubles twice", 'int total = 10;\nDouble(ref total);\nDouble(ref total);\nConsole.WriteLine(total);\n\nvoid Double(ref int v) => v *= 2;'),
      page("Rules"),
      { ul: [
        "The keyword is written at the declaration AND at the call: `out int q` / `ref total`.",
        "An `out` parameter must be assigned before the method returns; it may arrive unassigned.",
        "A `ref` argument must already have a value.",
        "`out int q` at a call declares `q` on the spot; `out _` throws a result away.",
        "Prefer `return` for one result; reach for `out` when there are two, or for the Try- pattern."
      ] },
      run("discard", "out _ when only the yes/no matters", 'if (int.TryParse("7", out _)) Console.WriteLine("a number");\nif (!int.TryParse("seven", out _)) Console.WriteLine("not a number");'),
      page("Variations"),
      { h: "Several outs" },
      run("minmax", "both ends at once", 'MinMax(4, 9, 2, out int lo, out int hi);\nConsole.WriteLine($"{lo} {hi}");\n\nvoid MinMax(int a, int b, int c, out int min, out int max)\n{\n    min = Math.Min(a, Math.Min(b, c));\n    max = Math.Max(a, Math.Max(b, c));\n}'),
      { h: "A Try- method of your own" },
      run("tryage", "false and 0 when the input is bad", 'if (TryAge("x", out int age)) Console.WriteLine(age);\nelse Console.WriteLine("bad " + age);\n\nbool TryAge(string s, out int a)\n{\n    if (!int.TryParse(s, out a)) return false;\n    if (a < 0 || a > 130) { a = 0; return false; }\n    return true;\n}'),
      { h: "Swap" },
      run("swap", "the classic ref method", 'int a = 1, b = 2;\nSwap(ref a, ref b);\nConsole.WriteLine($"{a} {b}");\n\nvoid Swap(ref int x, ref int y)\n{\n    int t = x;\n    x = y;\n    y = t;\n}'),
      page("Under the hood"),
      { ul: [ "Without a keyword the method gets a copy of the value (3.2).", "With `ref` or `out` it gets the variable's address, so a write lands in the caller's variable.", "Later units return two values as a tuple, `(int q, int r)`, which often reads better than `out`." ] },
      page("Pitfalls"),
      { h: "Forgetting the keyword at the call — CS1620" },
      run("pit-keyword", "ref belongs on both sides", 'int x = 5;\nAddOne(x);\nConsole.WriteLine(x);\n\nvoid AddOne(ref int n) { n++; }'),
      { h: "An out never assigned — CS0177" },
      run("pit-unassigned", "n must be given a value", 'Bad(out int z);\n\nvoid Bad(out int n)\n{\n    Console.WriteLine("hi");\n}'),
      { h: "ref with no value yet — CS0165" },
      run("pit-noval", "u has nothing to pass", 'int u;\nInit(ref u);\n\nvoid Init(ref int v) { v = 1; }'),
      "Use `out` when the method provides the first value.",
      page("Connections"),
      { ul: [ "**Back:** 1.6's `int.Parse` throws on bad input; `TryParse` with `out` does not.", "**Next:** 3.6 uses TryParse to validate input.", "**AQA:** 4.1.1.12 returning a value/values from a subroutine." ] },
      page("Good practice"),
      { ul: [ "Use the Try- pattern (`bool TryX(…, out result)`) for anything that can fail on ordinary input.", "Use `ref` sparingly: a method that returns its result is easier to follow." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *In order* and *Minutes and seconds*." ] },
      page("Quick reference"),
      run("qr", "out and ref", 'Split(125, out int m, out int s);\nConsole.WriteLine($"{m}:{s:D2}");\nint n = 1;\nBump(ref n);\nConsole.WriteLine(n);\n\nvoid Split(int t, out int m, out int s) { m = t / 60; s = t % 60; }\nvoid Bump(ref int x) => x++;'),
      { ul: [ "`out`: the method must assign it; the caller need not.", "`ref`: the caller must assign it; the method may change it.", "Write the keyword at both ends.", "`out _` discards." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1620", "ref/out missing at the call", "Pitfalls"], ["CS0177", "an out parameter never assigned", "Pitfalls"], ["CS0165", "a ref argument with no value", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int a = 3;\nTriple(ref a);\nConsole.WriteLine(a);\n\nvoid Triple(ref int n) => n *= 3;', why: "ref passes a itself, so it becomes 9.", concepts: ["ref-param"] },
        { id: "p2", src: 'bool ok = int.TryParse("12x", out int n);\nConsole.WriteLine(ok);\nConsole.WriteLine(n);', why: "12x is not a number: False, and n is 0.", concepts: ["out-param"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the method can return two values.", src: 'Halves(9, out int a, out int b);\nConsole.WriteLine($"{a} {b}");\n\nvoid Halves(int n, @@ int x, out int y)\n{\n    x = n / 2;\n    y = n - x;\n}', out: "4 5", concepts: ["out-param"] }
      ],
      bug: [
        { id: "b1", q: "It should print 2 1.", src: 'int a = 1, b = 2;\nSwap(a, b);\nConsole.WriteLine($"{a} {b}");\n\nvoid Swap(int x, int y)\n{\n    int t = x;\n    x = y;\n    y = t;\n}', out: "2 1", fixedText: "prints 2 1", why: "Without ref the method swaps copies. Use ref at both ends.", concepts: ["ref-param"] }
      ]
    },
    flashcards: [
      ["`out` vs `ref`?", "out: the method must assign it, the caller need not. ref: the caller must assign it, the method may change it."],
      ["Where is the keyword written?", "In the declaration and at every call."],
      ["What does `out _` do?", "Discards that result."],
      ["What does `int.TryParse(s, out int n)` return?", "true and the number in n if s is a whole number; false and 0 otherwise."],
      ["What is CS0177?", "An out parameter was not assigned before the method returned."],
      ["When is `out` worth it?", "Two results, or the Try- pattern; for one result, return it."]
    ],
    quiz: [
      { q: "`void F(ref int x)` is called as `F(n)`. Result?", opts: ["works", "CS1620", "n unchanged", "CS0177"], ans: 1, why: "The call needs ref too." },
      { q: "Which can be passed uninitialised?", opts: ["a ref argument", "an out argument", "both", "neither"], ans: 1, why: "out promises the method assigns it." },
      { q: "`int.TryParse(\"7\", out int n)` — n is…", opts: ["\"7\"", "7", "0", "true"], ans: 1, why: "It parsed." },
      { q: "A method that returns one value should…", opts: ["use out", "use ref", "use return", "print it"], ans: 2, why: "return is the clearest for one result." }
    ]
  });
  K.add({ tasks: {
    "3.5-order": { lesson: "3.5", title: "In order", tier: "warm-up", minutes: 8, concepts: ["ref-param"], requires: ["parse", "if-else"],
      statement: ["Read two whole numbers, one per line.", "If the first is bigger, swap them with `void Swap(ref int x, ref int y)`.", "Print them as `small big`."],
      starter: "int a = int.Parse(Console.ReadLine());\nint b = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "9\n4", out: "4 9" }],
      hidden: [{ stdin: "1\n2", out: "1 2" }, { stdin: "5\n5", out: "5 5" }, { stdin: "0\n-3", out: "-3 0" }],
      rules: [{ id: "ref", test: function (s) { return /void\s+Swap\s*\(\s*ref\s+int\s+\w+\s*,\s*ref\s+int\s+\w+\s*\)/.test(s); }, msg: "Write void Swap(ref int x, ref int y) and use it." }],
      hints: ["The swap needs a temporary variable.", "void Swap(ref int x, ref int y) { int t = x; x = y; y = t; }", "if (a > b) Swap(ref a, ref b);"],
      answer: 'int a = int.Parse(Console.ReadLine());\nint b = int.Parse(Console.ReadLine());\nif (a > b) Swap(ref a, ref b);\nConsole.WriteLine($"{a} {b}");\n\nvoid Swap(ref int x, ref int y)\n{\n    int t = x;\n    x = y;\n    y = t;\n}' },
    "3.5-split": { lesson: "3.5", title: "Minutes and seconds", tier: "core", minutes: 12, concepts: ["out-param"], requires: ["parse", "int-division", "modulo"],
      statement: ["Write `void SplitTime(int total, out int minutes, out int seconds)`.", "Read a number of seconds and print it as `M:SS` — seconds always two digits."],
      starter: "",
      examples: [{ stdin: "125", out: "2:05" }],
      hidden: [{ stdin: "59", out: "0:59" }, { stdin: "600", out: "10:00" }, { stdin: "0", out: "0:00" }],
      rules: [{ id: "out", test: function (s) { return /void\s+SplitTime\s*\(\s*int\s+\w+\s*,\s*out\s+int\s+\w+\s*,\s*out\s+int\s+\w+\s*\)/.test(s); }, msg: "Declare void SplitTime(int total, out int minutes, out int seconds)." }],
      hints: ["Minutes: total / 60. Seconds: total % 60.", "SplitTime(t, out int m, out int s);", "{s:D2} pads to two digits."],
      answer: 'int t = int.Parse(Console.ReadLine());\nSplitTime(t, out int m, out int s);\nConsole.WriteLine($"{m}:{s:D2}");\n\nvoid SplitTime(int total, out int minutes, out int seconds)\n{\n    minutes = total / 60;\n    seconds = total % 60;\n}' }
  } });

  /* ================================================================
     3.6 Guard clauses and validation
     ================================================================ */
  lesson("3.6", {
    aqa: "4.1.1.9",
    notes: [
      page("The problem it solves"),
      { ul: [ "A method that trusts its input breaks when the input is wrong: a negative age, a mark of 140, a PIN of three letters.", "**Validate** at the top: reject what is wrong, so the rest of the method can trust what is left.", "2.8's guard clauses, now at a method's front door." ] },
      page("Core idea"),
      run("guard", "deal with the bad cases first", 'Console.WriteLine(Grade(85));\nConsole.WriteLine(Grade(55));\nConsole.WriteLine(Grade(101));\n\nstring Grade(int mark)\n{\n    if (mark < 0 || mark > 100) return "invalid";\n    if (mark >= 70) return "A";\n    if (mark >= 50) return "B";\n    return "C";\n}'),
      { ul: [ "The first line handles every bad mark; after it, `mark` is known to be 0–100.", "When a bad value means the CALLER made a mistake, **throw** instead of returning a made-up answer." ] },
      run("throw", "refusing a bad argument", 'try\n{\n    Console.WriteLine(Fee(30));\n    Console.WriteLine(Fee(-5));\n}\ncatch (ArgumentOutOfRangeException e)\n{\n    Console.WriteLine("Refused: " + e.Message);\n}\n\ndecimal Fee(int age)\n{\n    if (age < 0) throw new ArgumentOutOfRangeException(nameof(age), "must not be negative");\n    return age < 18 ? 4.50m : 9.00m;\n}'),
      { ul: [ "`throw` stops the method at once; the caller can `catch` it (unit 5 covers exceptions fully).", "`nameof(age)` writes the parameter's name for you." ] },
      page("Rules"),
      { ul: [
        "Check inputs before using them: first the impossible, then the special, then the normal case.",
        "User input: re-ask or report (the user can fix it). A bad argument from code: throw (the programmer must fix it).",
        "`ArgumentException` for a wrong value, `ArgumentOutOfRangeException` for one outside a range.",
        "Validate text before parsing it: use `TryParse`, not `Parse`.",
        "A method still needs a `return` on every path after its guards."
      ] },
      run("argument", "ArgumentException's message", 'try\n{\n    SetName("");\n}\ncatch (ArgumentException e)\n{\n    Console.WriteLine(e.Message);\n}\n\nvoid SetName(string name)\n{\n    if (name.Length == 0) throw new ArgumentException("Name cannot be empty");\n    Console.WriteLine("Hello " + name);\n}'),
      page("Variations"),
      { h: "Ask until it is valid" },
      run("ask", "a reading method that never returns bad data", 'int mark = ReadMark();\nConsole.WriteLine($"Mark: {mark}");\n\nint ReadMark()\n{\n    while (true)\n    {\n        string line = Console.ReadLine();\n        if (!int.TryParse(line, out int m)) { Console.WriteLine("Not a number"); continue; }\n        if (m < 0 || m > 100) { Console.WriteLine("Out of range"); continue; }\n        return m;\n    }\n}', "abc\n140\n72"),
      { h: "A validity question" },
      run("pin", "is it exactly four digits?", 'Console.WriteLine(IsValidPin("0042"));\nConsole.WriteLine(IsValidPin("12a4"));\nConsole.WriteLine(IsValidPin("123"));\n\nbool IsValidPin(string pin)\n{\n    if (pin.Length != 4) return false;\n    foreach (char c in pin)\n        if (!char.IsDigit(c)) return false;\n    return true;\n}'),
      page("Pitfalls"),
      { h: "The last guard is not an else — CS0161" },
      run("pit-paths", "the compiler cannot see n < 10 || n >= 10", 'Console.WriteLine(Size(3));\n\nstring Size(int n)\n{\n    if (n < 10) return "small";\n    if (n >= 10) return "large";\n}'),
      "End with a plain `return` for the last case.",
      { h: "An exception nobody catches" },
      run("pit-uncaught", "the program stops", 'Console.WriteLine(Fee(-5));\n\ndecimal Fee(int age)\n{\n    if (age < 0) throw new ArgumentOutOfRangeException(nameof(age), "must not be negative");\n    return 9.00m;\n}'),
      { h: "Parsing before checking" },
      run("pit-parse", "Parse throws on bad text", 'int age = int.Parse("abc");\nConsole.WriteLine(age);'),
      page("Connections"),
      { ul: [ "**Back:** 2.8's guard clauses; 3.5's TryParse.", "**Next:** unit 5 catches and designs exceptions properly.", "**AQA:** 4.1.1.9 exception handling." ] },
      page("Good practice"),
      { ul: [ "Guards first, one per line, each with an obvious reason.", "Never return a fake value (0, \"\") to mean \"wrong\" when the caller could mistake it for a real one." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Ticket price* and *PIN check*." ] },
      page("Quick reference"),
      run("qr", "guard, then work", 'Console.WriteLine(Percent(3, 4));\n\ndouble Percent(int part, int whole)\n{\n    if (whole <= 0) throw new ArgumentOutOfRangeException(nameof(whole));\n    return 100.0 * part / whole;\n}'),
      { ul: [ "Guards at the top; normal case at the bottom.", "Users: re-ask. Code: throw.", "TryParse before trusting text.", "Every path still returns." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0161", "the guards leave a path with no return", "Pitfalls"], ["ArgumentOutOfRangeException", "a value outside the allowed range", "Core idea"], ["FormatException", "text that is not a number was parsed", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine(Check(-1));\nConsole.WriteLine(Check(5));\n\nstring Check(int n)\n{\n    if (n < 0) return "negative";\n    return "ok";\n}', why: "The guard catches -1; 5 reaches the end.", concepts: ["validation"] },
        { id: "p2", src: 'try { Need(0); Console.WriteLine("after"); }\ncatch (ArgumentException e) { Console.WriteLine("caught"); }\n\nvoid Need(int n) { if (n == 0) throw new ArgumentException("zero"); }', why: "The throw skips \"after\" and lands in the catch.", concepts: ["throw-arg"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so a negative age is refused.", src: 'Console.WriteLine(Stage(-2));\n\nstring Stage(int age)\n{\n    if (age @@ 0) return "invalid";\n    return age < 18 ? "child" : "adult";\n}', out: "invalid", concepts: ["validation"] }
      ],
      bug: [
        { id: "b1", q: "It should print \"not a number\" for bad input instead of crashing.", stdin: "x1", src: 'string s = Console.ReadLine();\nint n = int.Parse(s);\nConsole.WriteLine(n * 2);', cases: [{ stdin: "x1", out: "not a number" }, { stdin: "4", out: "8" }], fixedText: "prints not a number", why: "Use int.TryParse and check its result before using n.", concepts: ["validation"] }
      ]
    },
    flashcards: [
      ["What is validation?", "Checking input is acceptable before using it."],
      ["Bad user input: throw or re-ask?", "Re-ask or report — the user can fix it."],
      ["A bad argument from code: throw or re-ask?", "Throw — the programmer has to fix the call."],
      ["Which exception for a value outside a range?", "`ArgumentOutOfRangeException`."],
      ["Why does `if (a) return; if (!a) return;` give CS0161?", "The compiler does not reason that the two conditions cover everything; end with a plain return."],
      ["What does `nameof(age)` give?", "The text \"age\" — the parameter's name, kept right if it is renamed."]
    ],
    quiz: [
      { q: "Where do guard clauses go?", opts: ["at the end", "at the top", "in a loop", "anywhere"], ans: 1, why: "Reject bad input before the work." },
      { q: "Which never throws on bad text?", opts: ["int.Parse", "int.TryParse", "Convert.ToInt32", "(int)"], ans: 1, why: "It returns false instead." },
      { q: "A method's caller passes −3 for an age. Best response?", opts: ["return 0", "throw ArgumentOutOfRangeException", "print and carry on", "ignore it"], ans: 1, why: "The caller has a bug; say so loudly." },
      { q: "`throw` inside a method…", opts: ["returns a value", "stops the method at once", "prints a message and continues", "is a compile error"], ans: 1, why: "Control leaves immediately." }
    ]
  });
  K.add({ tasks: {
    "3.6-ticket": { lesson: "3.6", title: "Ticket price", tier: "core", minutes: 10, concepts: ["validation", "guard"], requires: ["parse", "else-if"],
      statement: ["Write `string Ticket(int age)`: `Invalid` below 0 or above 120, `Child` under 16, `Adult` under 65, otherwise `Senior`.", "Read an age and print Ticket(age)."],
      starter: "int age = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "10", out: "Child" }, { stdin: "-4", out: "Invalid" }],
      hidden: [{ stdin: "16", out: "Adult" }, { stdin: "64", out: "Adult" }, { stdin: "65", out: "Senior" }, { stdin: "121", out: "Invalid" }, { stdin: "0", out: "Child" }],
      rules: [{ id: "method", test: function (s) { return /string\s+Ticket\s*\(\s*int\s+\w+\s*\)/.test(s); }, msg: "Declare string Ticket(int age)." }],
      hints: ["Guard the impossible ages first.", "if (age < 0 || age > 120) return \"Invalid\";", "then Child (< 16), Adult (< 65), and a plain return \"Senior\";"],
      answer: 'int age = int.Parse(Console.ReadLine());\nConsole.WriteLine(Ticket(age));\n\nstring Ticket(int age)\n{\n    if (age < 0 || age > 120) return "Invalid";\n    if (age < 16) return "Child";\n    if (age < 65) return "Adult";\n    return "Senior";\n}' },
    "3.6-pin": { lesson: "3.6", title: "PIN check", tier: "core", minutes: 15, concepts: ["validation"], requires: ["input-loop", "foreach"],
      statement: ["Read lines until one is a valid PIN: exactly four digits.", "For each invalid line print `Rejected: X`; for the valid one print `Accepted` and stop.", "Write `bool IsValidPin(string pin)`."],
      starter: "",
      examples: [{ stdin: "12a4\n123\n0042", out: "Rejected: 12a4\nRejected: 123\nAccepted" }],
      hidden: [{ stdin: "9999", out: "Accepted" }, { stdin: "12345\n abc\n1234", out: "Rejected: 12345\nRejected:  abc\nAccepted" }],
      rules: [{ id: "method", test: function (s) { return /bool\s+IsValidPin\s*\(\s*string\s+\w+\s*\)/.test(s); }, msg: "Declare bool IsValidPin(string pin)." }],
      hints: ["Check the length first, then each character.", "char.IsDigit(c) tells you if c is 0–9.", "while (true) { string s = Console.ReadLine(); if (IsValidPin(s)) { …; break; } … }"],
      answer: 'while (true)\n{\n    string s = Console.ReadLine();\n    if (IsValidPin(s))\n    {\n        Console.WriteLine("Accepted");\n        break;\n    }\n    Console.WriteLine("Rejected: " + s);\n}\n\nbool IsValidPin(string pin)\n{\n    if (pin.Length != 4) return false;\n    foreach (char c in pin)\n        if (!char.IsDigit(c)) return false;\n    return true;\n}' }
  } });

  /* ================================================================
     3.7 Recursion: a first look
     ================================================================ */
  lesson("3.7", {
    aqa: "4.1.1.16",
    notes: [
      page("The problem it solves"),
      { ul: [ "Some problems contain a smaller copy of themselves: 5! is 5 × 4!, a folder holds folders.", "A **recursive** method solves the problem by calling itself on the smaller copy.", "A **base case** answers the smallest copy directly, so the calls always end." ] },
      page("Core idea"),
      run("fact", "n! = n × (n − 1)!", 'for (int i = 1; i <= 6; i++)\n    Console.WriteLine($"{i}! = {Fact(i)}");\n\nint Fact(int n)\n{\n    if (n <= 1) return 1;        // base case\n    return n * Fact(n - 1);      // a smaller copy\n}'),
      "Each call waits for the one it made. The program below prints every call and every return.",
      run("trace", "down to the base case and back up", 'Fact(3);\n\nint Fact(int n)\n{\n    Console.WriteLine($"Fact({n}) called");\n    if (n <= 1) return 1;\n    int r = n * Fact(n - 1);\n    Console.WriteLine($"Fact({n}) returns {r}");\n    return r;\n}'),
      page("Rules"),
      { ul: [
        "Every recursive method needs a base case that does not call itself.",
        "Every recursive call must move closer to the base case.",
        "Each call has its own parameters and locals (its own stack frame, 3.3).",
        "Too many calls in a row exhaust the stack: the program crashes with a stack overflow.",
        "Anything recursive can be written with a loop; choose whichever reads more clearly."
      ] },
      run("countdown", "a void method can recurse too", 'Countdown(3);\n\nvoid Countdown(int n)\n{\n    if (n == 0)\n    {\n        Console.WriteLine("Go!");\n        return;\n    }\n    Console.WriteLine(n);\n    Countdown(n - 1);\n}'),
      page("Variations"),
      { h: "Digits" },
      run("digits", "the last digit plus the rest", 'Console.WriteLine(SumDigits(1234));\nConsole.WriteLine(SumDigits(7));\n\nint SumDigits(int n) => n < 10 ? n : n % 10 + SumDigits(n / 10);'),
      { h: "Two parameters" },
      run("gcd", "Euclid's greatest common divisor", 'Console.WriteLine(Gcd(48, 18));\nConsole.WriteLine(Gcd(17, 5));\n\nint Gcd(int a, int b) => b == 0 ? a : Gcd(b, a % b);'),
      { h: "Strings" },
      run("reverse", "the rest reversed, then the first letter", 'Console.WriteLine(Reverse("stressed"));\n\nstring Reverse(string s) => s.Length <= 1 ? s : Reverse(s.Substring(1)) + s[0];'),
      { h: "The same with a loop" },
      run("loop", "iteration does the same work", 'Console.WriteLine(Fact(5));\n\nint Fact(int n)\n{\n    int r = 1;\n    for (int i = 2; i <= n; i++) r *= i;\n    return r;\n}'),
      page("Under the hood"),
      { ul: [ "Each call pushes a stack frame; each return pops one.", "`Fact(3)` holds three frames at its deepest, then unwinds: 1, then 2 × 1, then 3 × 2.", "The stack is limited (about a megabyte), so very deep recursion fails where a loop would not." ] },
      page("Pitfalls"),
      { h: "No base case — stack overflow" },
      run("pit-nobase", "it never stops calling", 'Console.WriteLine(Forever(0));\n\nint Forever(int n) => Forever(n + 1);'),
      { h: "A path with no return — CS0161" },
      run("pit-return", "what does Fact(1) return?", 'Console.WriteLine(Fact(3));\n\nint Fact(int n)\n{\n    if (n > 1) return n * Fact(n - 1);\n}'),
      { h: "Growing past int" },
      run("pit-overflow", "13! does not fit in an int", 'Console.WriteLine(Fact(12));\nConsole.WriteLine(Fact(13));\n\nint Fact(int n) => n <= 1 ? 1 : n * Fact(n - 1);'),
      "Use `long` for larger results (up to 20!).",
      page("Connections"),
      { ul: [ "**Back:** 3.3's stack frames make each call independent.", "**Later:** trees and searching (stage 3) are naturally recursive.", "**AQA:** 4.1.1.16 recursive techniques; 4.1.1.15 stack frames." ] },
      page("Good practice"),
      { ul: [ "Write the base case first, then the step.", "Trace a small case on paper before running a large one." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Power, recursively* and *To binary*." ] },
      page("Quick reference"),
      run("qr", "the shape", 'Console.WriteLine(Sum(4));\n\nint Sum(int n)\n{\n    if (n == 0) return 0;     // base case\n    return n + Sum(n - 1);    // smaller copy\n}'),
      { ul: [ "Base case first; each call moves towards it.", "Each call has its own frame.", "Deep recursion overflows the stack.", "A loop can always replace it." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["Stack overflow", "no base case, or it is never reached", "Pitfalls"], ["CS0161", "a path with no return", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine(F(4));\n\nint F(int n) => n == 0 ? 0 : 2 + F(n - 1);', why: "Four calls add 2 each: 8.", concepts: ["recursion"] },
        { id: "p2", src: 'Show(3);\n\nvoid Show(int n)\n{\n    if (n == 0) return;\n    Show(n - 1);\n    Console.WriteLine(n);\n}', why: "The print comes after the call, so the numbers come out on the way back: 1 2 3.", concepts: ["recursion", "base-case"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the base case's answer.", src: 'Console.WriteLine(Sum(5));\n\nint Sum(int n)\n{\n    if (n == 0) return @@;\n    return n + Sum(n - 1);\n}', out: "15", concepts: ["base-case"] }
      ],
      bug: [
        { id: "b1", q: "It should print 3 2 1.", src: 'Down(3);\n\nvoid Down(int n)\n{\n    if (n == 0) return;\n    Down(n - 1);\n    Console.WriteLine(n);\n}', out: "3\n2\n1", fixedText: "prints 3, 2, 1", why: "Printing after the call prints on the way back up (1 2 3); print before the call.", concepts: ["recursion"] }
      ]
    },
    flashcards: [
      ["What is recursion?", "A method solving a problem by calling itself on a smaller version of it."],
      ["What is a base case?", "The smallest input, answered directly without another call."],
      ["What happens with no base case?", "The calls never end and the stack overflows."],
      ["Why can each recursive call have its own `n`?", "Every call gets its own stack frame."],
      ["Recursion or a loop?", "Either works; choose the one that reads more clearly (and loops for very deep work)."],
      ["`int Fact(int n) => n <= 1 ? 1 : n * Fact(n - 1);` — Fact(4)?", "24."]
    ],
    quiz: [
      { q: "Which is essential in a recursive method?", opts: ["a loop", "a base case", "a static class", "an out parameter"], ans: 1, why: "Without it the calls never stop." },
      { q: "`int G(int n) => n < 10 ? n : G(n / 10);` — G(4321)?", opts: ["1", "4", "4321", "10"], ans: 1, why: "It strips digits until one is left: 4." },
      { q: "How many frames does Fact(4) hold at its deepest?", opts: ["1", "3", "4", "24"], ans: 2, why: "Fact(4), Fact(3), Fact(2), Fact(1)." },
      { q: "Stack overflow usually means…", opts: ["an int overflowed", "the base case is never reached", "a missing semicolon", "too much output"], ans: 1, why: "The calls keep going." }
    ]
  });
  K.add({ tasks: {
    "3.7-power": { lesson: "3.7", title: "Power, recursively", tier: "core", minutes: 12, concepts: ["recursion", "base-case"], requires: ["parse"],
      statement: ["Write a recursive `int Power(int b, int e)`: b to the power e (e ≥ 0), with no loop.", "Read b and e, one per line, and print the result."],
      starter: "int b = int.Parse(Console.ReadLine());\nint e = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "2\n10", out: "1024" }],
      hidden: [{ stdin: "5\n0", out: "1" }, { stdin: "3\n4", out: "81" }, { stdin: "-2\n3", out: "-8" }],
      rules: [{ id: "recursive", test: function (s) { return /int\s+Power\s*\(/.test(s) && (s.match(/\bPower\s*\(/g) || []).length >= 3 && !/\b(for|while)\b/.test(s); }, msg: "Power must call itself — no for or while loop." }],
      hints: ["Anything to the power 0 is 1: that is the base case.", "b^e = b × b^(e − 1).", "int Power(int b, int e) => e == 0 ? 1 : b * Power(b, e - 1);"],
      answer: 'int b = int.Parse(Console.ReadLine());\nint e = int.Parse(Console.ReadLine());\nConsole.WriteLine(Power(b, e));\n\nint Power(int b, int e) => e == 0 ? 1 : b * Power(b, e - 1);' },
    "3.7-binary": { lesson: "3.7", title: "To binary", tier: "stretch", minutes: 20, phone: false, concepts: ["recursion", "base-case"], requires: ["parse", "modulo", "int-division"],
      statement: ["Write a recursive `string ToBinary(int n)` for n ≥ 0.", "The binary of n is the binary of n / 2 followed by n % 2; 0 and 1 are themselves.", "Read n and print its binary."],
      starter: "",
      examples: [{ stdin: "10", out: "1010" }, { stdin: "0", out: "0" }],
      hidden: [{ stdin: "1", out: "1" }, { stdin: "255", out: "11111111" }, { stdin: "6", out: "110" }],
      rules: [{ id: "recursive", test: function (s) { return /string\s+ToBinary\s*\(/.test(s) && (s.match(/\bToBinary\s*\(/g) || []).length >= 3 && !/\b(for|while)\b/.test(s); }, msg: "ToBinary must call itself — no loop." }],
      hints: ["Base case: n < 2 returns n as text.", "Otherwise: ToBinary(n / 2) + (n % 2).", "string ToBinary(int n) => n < 2 ? n.ToString() : ToBinary(n / 2) + (n % 2);"],
      answer: 'int n = int.Parse(Console.ReadLine());\nConsole.WriteLine(ToBinary(n));\n\nstring ToBinary(int n) => n < 2 ? n.ToString() : ToBinary(n / 2) + (n % 2);' }
  } });

  /* ================================================================
     3.8 Practise: decomposing a problem
     ================================================================ */
  lesson("3.8", {
    aqa: "4.1.1.10",
    notes: [
      page("The problem it solves"),
      { ul: [ "A real task is too big to write in one go: read some marks, grade each, report the average and the best.", "**Decomposition** splits it into small methods before writing any of them.", "Each method is then written, and checked, on its own." ] },
      page("Core idea"),
      "Step 1: write the top of the program as calls to methods that do not exist yet — the plan.",
      "Step 2: give each one a **stub** that returns something simple, so the plan already runs.",
      run("stub", "the plan runs before the work is done", 'int n = 2;\nfor (int i = 0; i < n; i++)\n{\n    int mark = 50;\n    Console.WriteLine($"{mark}: {GradeFor(mark)}");\n}\n\nstring GradeFor(int mark) => "?";   // stub: write it next'),
      "Step 3: replace each stub with the real thing and test it in isolation.",
      run("piece", "GradeFor, checked on its boundaries", 'void Check(string label, bool ok) => Console.WriteLine((ok ? "PASS " : "FAIL ") + label);\n\nCheck("70 is A", GradeFor(70) == "A");\nCheck("69 is B", GradeFor(69) == "B");\nCheck("50 is B", GradeFor(50) == "B");\nCheck("49 is C", GradeFor(49) == "C");\n\nstring GradeFor(int m) => m >= 70 ? "A" : m >= 50 ? "B" : "C";'),
      page("Rules"),
      { ul: [
        "Each method does one job its name can say in a few words.",
        "Methods that compute (return a value) are kept apart from methods that read or print.",
        "Test the boundaries: the values either side of every `>=`.",
        "Build one piece at a time and run after each — never everything at once.",
        "If a method grows past a screen, it is probably two methods."
      ] },
      run("read", "a reading method with its guard", 'int a = ReadInt();\nint b = ReadInt();\nConsole.WriteLine(a + b);\n\nint ReadInt()\n{\n    while (true)\n    {\n        if (int.TryParse(Console.ReadLine(), out int n)) return n;\n        Console.WriteLine("Whole number, please");\n    }\n}', "4\nfive\n5"),
      page("Variations"),
      { h: "The whole program" },
      run("whole", "plan, pieces, assembled", 'int count = ReadInt();\nint total = 0, top = 0;\nfor (int i = 0; i < count; i++)\n{\n    int mark = ReadInt();\n    Console.WriteLine($"{mark}: {GradeFor(mark)}");\n    total += mark;\n    top = Math.Max(top, mark);\n}\nReport(total, count, top);\n\nint ReadInt() => int.Parse(Console.ReadLine());\nstring GradeFor(int m) => m >= 70 ? "A" : m >= 50 ? "B" : "C";\nvoid Report(int total, int count, int top)\n{\n    if (count == 0) { Console.WriteLine("No marks"); return; }\n    Console.WriteLine($"Average: {(double)total / count:F1}");\n    Console.WriteLine($"Top: {top}");\n}', "3\n72\n48\n91"),
      { h: "A structure chart, in words" },
      { ul: [ "Marks report → ReadInt · GradeFor · Report.", "Report → the average · the top mark.", "AQA draws this as a hierarchy chart; each box is a method." ] },
      run("chart", "the chart as calls", 'Run();\n\nvoid Run()\n{\n    Setup();\n    Work();\n    Finish();\n}\nvoid Setup() => Console.WriteLine("setup");\nvoid Work() => Console.WriteLine("work");\nvoid Finish() => Console.WriteLine("finish");'),
      page("Pitfalls"),
      { h: "A method that both prints and returns" },
      run("pit-both", "the caller prints it a second time", 'Console.WriteLine(Double(4));\n\nint Double(int n)\n{\n    Console.WriteLine(n * 2);\n    return n * 2;\n}'),
      "Pick one: return the value and let the caller print it.",
      { h: "A helper hidden inside another method — CS0103" },
      run("pit-hidden", "Helper is local to Outer", 'Outer();\nHelper();\n\nvoid Outer()\n{\n    Helper();\n    void Helper() => Console.WriteLine("help");\n}'),
      { h: "Ignoring a returned value" },
      run("pit-ignored", "the result goes nowhere", 'GradeFor(72);\nConsole.WriteLine("done");\n\nstring GradeFor(int m) => m >= 70 ? "A" : "B";'),
      page("Connections"),
      { ul: [ "**Back:** every lesson in this unit: methods, parameters, scope, out, guards.", "**Next:** unit 4's arrays let the report keep every mark.", "**AQA:** 4.1.1.10 subroutines; 4.13 (Paper 2) structured programming and hierarchy charts." ] },
      page("Good practice"),
      { ul: [ "Write the plan first, as method calls.", "Keep a tiny `Check` helper while building; delete it when done." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Change machine* and *Marks report*." ] },
      page("Quick reference"),
      run("qr", "plan → stub → piece → whole", 'Console.WriteLine(Describe(Square(3)));\n\nint Square(int n) => n * n;\nstring Describe(int n) => n % 2 == 0 ? $"{n} is even" : $"{n} is odd";'),
      { ul: [ "Plan with calls; stub; fill in; test each.", "Compute in one method, print in another.", "Test either side of every boundary." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0103", "a method declared inside another is out of reach", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine(Label(Score(3, 4)));\n\nint Score(int a, int b) => a * 10 + b;\nstring Label(int s) => s >= 30 ? "high" : "low";', why: "Score is 34, which Label calls high.", concepts: ["decompose"] },
        { id: "p2", src: 'Step("a");\nStep("b");\n\nvoid Step(string s)\n{\n    Console.WriteLine("start " + s);\n    Console.WriteLine("end " + s);\n}', why: "Each call prints its own pair.", concepts: ["decompose"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Report prints the average to one decimal place.", src: 'Report(7, 2);\n\nvoid Report(int total, int count)\n{\n    Console.WriteLine($"{(@@)total / count:F1}");\n}', out: "3.5", concepts: ["decompose"] }
      ],
      bug: [
        { id: "b1", q: "It should print 10 once.", src: 'Console.WriteLine(Twice(5));\n\nint Twice(int n)\n{\n    Console.WriteLine(n * 2);\n    return n * 2;\n}', out: "10", fixedText: "prints 10 once", why: "Twice should only return; the caller prints.", concepts: ["decompose"] }
      ]
    },
    flashcards: [
      ["What is decomposition?", "Splitting a problem into smaller parts, each solved by its own method."],
      ["What is a stub?", "A placeholder method that returns something simple so the program runs before the real code exists."],
      ["Why keep computing apart from printing?", "A computing method can be reused and tested; printing is decided by the caller."],
      ["Which values should a boundary test use?", "The values either side of every comparison, e.g. 49 and 50."],
      ["What does a hierarchy chart show?", "Each method as a box under the method that calls it."],
      ["A method has grown past one screen. What now?", "Split it: it is probably doing two jobs."]
    ],
    quiz: [
      { q: "The first step of decomposition?", opts: ["write the hardest method", "write the plan as calls", "test everything", "add comments"], ans: 1, why: "The plan shows which methods are needed." },
      { q: "Best tests for `m >= 50 ? \"B\" : \"C\"`?", opts: ["0 and 100", "49 and 50", "25 and 75", "50 only"], ans: 1, why: "Either side of the boundary." },
      { q: "A method returns a value AND prints it. The risk?", opts: ["it will not compile", "it is printed twice", "nothing", "a stack overflow"], ans: 1, why: "The caller often prints it too." }
    ]
  });
  K.add({ tasks: {
    "3.8-change": { lesson: "3.8", title: "Change machine", tier: "core", minutes: 20, phone: false, concepts: ["decompose", "ref-param"], requires: ["parse", "int-division", "modulo"],
      statement: ["Read an amount in pence (0–500).", "Using the coins 200, 100, 50, 20, 10, 5, 2 and 1, print each coin used as `N x Cp`, largest first; print nothing for a coin not used.", "If the amount is 0, print `No coins`.", "Write one method, `void Give(ref int left, int coin)`, and call it once per coin."],
      starter: "int pence = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "45", out: "2 x 20p\n1 x 5p" }, { stdin: "0", out: "No coins" }],
      hidden: [{ stdin: "388", out: "1 x 200p\n1 x 100p\n1 x 50p\n1 x 20p\n1 x 10p\n1 x 5p\n1 x 2p\n1 x 1p" }, { stdin: "500", out: "2 x 200p\n1 x 100p" }, { stdin: "4", out: "2 x 2p" }],
      rules: [{ id: "give", test: function (s) { return /void\s+Give\s*\(\s*ref\s+int\s+\w+\s*,\s*int\s+\w+\s*\)/.test(s); }, msg: "Write void Give(ref int left, int coin)." }],
      hints: ["How many of a coin fit: left / coin. What is left: left % coin.", "void Give(ref int left, int coin) { int n = left / coin; if (n > 0) Console.WriteLine($\"{n} x {coin}p\"); left %= coin; }", "Guard 0 first, then Give(ref pence, 200); Give(ref pence, 100); … down to 1."],
      answer: 'int pence = int.Parse(Console.ReadLine());\nif (pence == 0)\n{\n    Console.WriteLine("No coins");\n    return;\n}\nGive(ref pence, 200);\nGive(ref pence, 100);\nGive(ref pence, 50);\nGive(ref pence, 20);\nGive(ref pence, 10);\nGive(ref pence, 5);\nGive(ref pence, 2);\nGive(ref pence, 1);\n\nvoid Give(ref int left, int coin)\n{\n    int n = left / coin;\n    if (n > 0) Console.WriteLine($"{n} x {coin}p");\n    left %= coin;\n}' },
    "3.8-report": { lesson: "3.8", title: "Marks report", tier: "stretch", minutes: 25, phone: false, concepts: ["decompose"], requires: ["for", "parse", "format", "else-if"],
      statement: ["The first line is how many marks follow; read them.", "For each mark print `M: G` — A for 70+, B for 50+, otherwise C.", "Then print `Average: X.X` and `Top: T`; with no marks print `No marks` instead.", "Use at least three methods of your own."],
      starter: "",
      examples: [{ stdin: "3\n72\n48\n91", out: "72: A\n48: C\n91: A\nAverage: 70.3\nTop: 91" }, { stdin: "0", out: "No marks" }],
      hidden: [{ stdin: "1\n50", out: "50: B\nAverage: 50.0\nTop: 50" }, { stdin: "2\n69\n70", out: "69: B\n70: A\nAverage: 69.5\nTop: 70" }],
      rules: [{ id: "methods", test: function (s) { return methodCount(s) >= 3; }, msg: "Split the program into at least three methods." }],
      hints: ["Plan: ReadInt, GradeFor, Report.", "Keep total and top as you go; Report(total, count, top) prints the summary.", "Report guards count == 0 first, then prints the average with :F1."],
      answer: 'int count = ReadInt();\nint total = 0, top = 0;\nfor (int i = 0; i < count; i++)\n{\n    int mark = ReadInt();\n    Console.WriteLine($"{mark}: {GradeFor(mark)}");\n    total += mark;\n    top = Math.Max(top, mark);\n}\nReport(total, count, top);\n\nint ReadInt() => int.Parse(Console.ReadLine());\nstring GradeFor(int m) => m >= 70 ? "A" : m >= 50 ? "B" : "C";\nvoid Report(int total, int count, int top)\n{\n    if (count == 0) { Console.WriteLine("No marks"); return; }\n    Console.WriteLine($"Average: {(double)total / count:F1}");\n    Console.WriteLine($"Top: {top}");\n}' }
  } });

  /* ================================================================
     retrieval cards
     ================================================================ */
  K.add({ cards: {
    "u3-return": { title: "A method that returns", lesson: "3.2", concepts: ["return", "params-args"], kind: "write",
      vary: function (r, n) {
        var k = 2 + r(5), c = r(10), name = pick(r, ["Score", "Points", "Value"]);
        var f = function (x) { return x * k + c; };
        return { prompt: "Write int " + name + "(int n) that returns n × " + k + " + " + c + ". Read n and print " + name + "(n).", label: name + "(n) = n × " + k + " + " + c,
          params: ["× " + k, "+ " + c], starter: "int n = int.Parse(Console.ReadLine());\n",
          cases: [3, 0, -2, 10].map(function (x) { return { stdin: String(x), out: String(f(x)) }; }),
          rules: [{ id: "method", test: function (s) { return new RegExp("int\\s+" + name + "\\s*\\(\\s*int\\s+\\w+\\s*\\)").test(s); }, msg: "Declare int " + name + "(int n)." }],
          hint: "int " + name + "(int n) => n * " + k + " + " + c + ";",
          answer: "int n = int.Parse(Console.ReadLine());\nConsole.WriteLine(" + name + "(n));\n\nint " + name + "(int n) => n * " + k + " + " + c + ";" };
      } },
    "u3-scope": { title: "Scope and lifetime", lesson: "3.3", concepts: ["scope", "lifetime"], kind: "predict",
      vary: function (r) {
        var start = r(5), times = 2 + r(3), local = 10 + r(10);
        var calls = []; for (var i = 0; i < times; i++) calls.push("Tick();");
        return { prompt: "What does this print?", label: "a shared counter and a fresh local", params: [],
          src: "int shared = " + start + ";\n" + calls.join("\n") + "\nConsole.WriteLine(shared);\n\nvoid Tick()\n{\n    int fresh = " + local + ";\n    fresh++;\n    shared++;\n    Console.WriteLine(fresh);\n}", hint: "fresh is new each call; shared lives for the whole program." };
      } },
    "u3-optional": { title: "Optional and named arguments", lesson: "3.4", concepts: ["optional-named"], kind: "predict",
      vary: function (r) {
        var d = 2 + r(4), a = 1 + r(9), b = 1 + r(5);
        return { prompt: "What does this print?", label: "a default of " + d, params: [],
          src: "Console.WriteLine(Total(" + a + "));\nConsole.WriteLine(Total(" + a + ", " + b + "));\nConsole.WriteLine(Total(extra: " + b + ", baseValue: " + a + "));\n\nint Total(int baseValue, int extra = " + d + ") => baseValue * 10 + extra;", hint: "A missing argument takes the default; names match parameters, not positions." };
      } },
    "u3-overload": { title: "Which overload?", lesson: "3.4", concepts: ["overloads"], kind: "predict",
      vary: function (r) {
        var args = [pick(r, ["3", "7"]), pick(r, ["2.5", "1.0"]), pick(r, ["\"hi\"", "\"ok\""]), pick(r, ["'A'", "'z'"])];
        for (var i = args.length - 1; i > 0; i--) { var j = r(i + 1), t = args[i]; args[i] = args[j]; args[j] = t; }
        return { prompt: "What does this print?", label: "arguments in a new order", params: [],
          src: args.map(function (x) { return "Console.WriteLine(K.Of(" + x + "));"; }).join("\n") + "\n\nstatic class K\n{\n    public static string Of(int n) => \"int\";\n    public static string Of(double d) => \"double\";\n    public static string Of(string s) => \"string\";\n}", hint: "A char has no overload of its own, so it widens to int." };
      } },
    "u3-out": { title: "out parameters", lesson: "3.5", concepts: ["out-param"], kind: "fill",
      vary: function (r) {
        var a = 10 + r(40), b = 2 + r(7);
        return { prompt: "Fill the gap so Divide can hand back the remainder too.", label: a + " ÷ " + b, params: [a + " ÷ " + b],
          src: "Divide(" + a + ", " + b + ", out int q, out int r);\nConsole.WriteLine($\"{q} r {r}\");\n\nvoid Divide(int x, int y, out int quot, @@ int rem)\n{\n    quot = x / y;\n    rem = x % y;\n}",
          cases: [{ stdin: "", out: Math.floor(a / b) + " r " + (a % b) }], hint: "The keyword goes in the declaration as well as the call." };
      } },
    "u3-ref": { title: "ref or a copy?", lesson: "3.5", concepts: ["ref-param", "params-args"], kind: "predict",
      vary: function (r) {
        var x = 1 + r(9), k = 2 + r(3);
        return { prompt: "What does this print?", label: "a copy and a ref", params: [],
          src: "int a = " + x + ", b = " + x + ";\nByValue(a);\nByRef(ref b);\nConsole.WriteLine($\"{a} {b}\");\n\nvoid ByValue(int n) { n *= " + k + "; }\nvoid ByRef(ref int n) { n *= " + k + "; }", hint: "Only ref reaches the caller's variable." };
      } },
    "u3-recursion": { title: "Tracing recursion", lesson: "3.7", concepts: ["recursion", "base-case"], kind: "predict",
      vary: function (r, n) {
        var m = 3 + r(4), add = 1 + r(3);
        var srcs = [
          "Console.WriteLine(F(" + m + "));\n\nint F(int n) => n == 0 ? 0 : " + add + " + F(n - 1);",
          "Show(" + m + ");\n\nvoid Show(int n)\n{\n    if (n == 0) return;\n    Show(n - 1);\n    Console.Write(n);\n}",
          "Show(" + m + ");\n\nvoid Show(int n)\n{\n    if (n == 0) return;\n    Console.Write(n);\n    Show(n - 1);\n}"
        ];
        return { prompt: "What does this print?", label: ["adding on the way down", "printing on the way back", "printing on the way down"][n % 3], params: [],
          src: srcs[n % 3], hint: "Trace each call; work out what happens before and after the recursive call." };
      } },
    "u3-guard": { title: "Guards at the top", lesson: "3.6", concepts: ["validation", "guard"], kind: "write",
      vary: function (r) {
        var lo = 1 + r(3), hi = 8 + r(5), word = pick(r, ["Size", "Level", "Rank"]);
        var f = function (x) { return x < lo || x > hi ? "Invalid" : x * 2 > hi ? "High" : "Low"; };
        var ins = [lo - 1, lo, Math.floor(hi / 2), Math.floor(hi / 2) + 1, hi, hi + 1];
        return { prompt: "Write string " + word + "(int n): Invalid outside " + lo + "–" + hi + ", High when n × 2 > " + hi + ", otherwise Low. Read n and print " + word + "(n).", label: "range " + lo + "–" + hi,
          params: [lo + "–" + hi], starter: "int n = int.Parse(Console.ReadLine());\n",
          cases: ins.map(function (x) { return { stdin: String(x), out: f(x) }; }),
          rules: [{ id: "method", test: function (s) { return new RegExp("string\\s+" + word + "\\s*\\(\\s*int\\s+\\w+\\s*\\)").test(s); }, msg: "Declare string " + word + "(int n)." }],
          hint: "The Invalid guard comes first.",
          answer: "int n = int.Parse(Console.ReadLine());\nConsole.WriteLine(" + word + "(n));\n\nstring " + word + "(int n)\n{\n    if (n < " + lo + " || n > " + hi + ") return \"Invalid\";\n    if (n * 2 > " + hi + ") return \"High\";\n    return \"Low\";\n}" };
      } }
  } });
})();
