/* Kurenai OS — data/content/code-u7.js
   Code · Unit 7 · Classes and objects (roadmap 5.3), stage 3.

   The first unit on the FULL runtime (Roslyn and .NET in WebAssembly,
   invariant 105): classes, properties, statics, namespaces and records of
   references compile exactly as in Rider. Nullable reference types are ON
   from here, so the compiler's nullable warnings show under the output;
   7.7 and 7.8 teach them. Until then input is read as
   `Console.ReadLine() ?? ""` — "or empty when there is no line" — which 7.8
   explains. Same contract as units 1–6 (docs/code-plan.md §4); every
   program agrees with .NET (tools/cs_diff.mjs, the full-runtime half).   */
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
    "class-object": { name: "Classes and objects", lesson: "7.1", about: "a type you define, and the values made from it" },
    "instance-state": { name: "Each object's own data", lesson: "7.1", about: "fields belong to one object" },
    "ctor": { name: "Constructors", lesson: "7.2", about: "start every object valid" },
    "fields-methods": { name: "Fields and methods", lesson: "7.2", about: "data and the behaviour that uses it" },
    "invariant": { name: "Keeping an object valid", lesson: "7.2", about: "rules no method may break" },
    "properties": { name: "Properties", lesson: "7.3", about: "get and set with rules" },
    "encapsulation": { name: "Encapsulation", lesson: "7.3", about: "private data, public behaviour" },
    "static-members": { name: "Static members", lesson: "7.4", about: "belongs to the type, not an object" },
    "namespaces": { name: "Namespaces", lesson: "7.5", about: "organising types by name" },
    "references": { name: "References", lesson: "7.6", about: "two variables, one object" },
    "equality": { name: "Equality", lesson: "7.6", about: "same object or same value" },
    "nullable-why": { name: "Nullable reference types", lesson: "7.7", about: "string versus string?" },
    "nullable-ops": { name: "?, ! and ??", lesson: "7.8", about: "handling null on purpose" },
    "enums": { name: "Enums", lesson: "7.9", about: "a fixed set of named options" },
    "flags": { name: "[Flags] enums", lesson: "7.9", about: "several options in one value" },
    "model-state": { name: "Modelling with a class", lesson: "7.10", about: "states a type cannot reach" }
  } });

  /* ================================================================
     7.1 Why classes
     ================================================================ */
  lesson("7.1", {
    aqa: "4.1.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "So far a student was three separate variables, `name`, `score` and `year`, and three arrays when there were many.",
        "Nothing kept them together: sort one array and forget another, and Ada gets Kai's score.",
        "A **class** is a type you write yourself. It bundles the data of one thing with the code that works on it, and each value made from it — an **object** — carries its own copy."
      ] },
      page("Core idea"),
      run("first", "a class and two objects made from it", 'var a = new Student();\na.Name = "Ada";\na.Score = 91;\nvar k = new Student();\nk.Name = "Kai";\nk.Score = 74;\nConsole.WriteLine($"{a.Name} {a.Score}");\nConsole.WriteLine($"{k.Name} {k.Score}");\n\nclass Student\n{\n    public string Name = "";\n    public int Score;\n}'),
      { ul: [
        "`class Student { … }` declares the type: what every student has.",
        "`new Student()` makes one object. `a` and `k` are two objects, each with its own `Name` and `Score`.",
        "The class comes **after** the program's statements in the file (7.5 shows why)."
      ] },
      run("method", "behaviour lives with the data", 'var s = new Student();\ns.Name = "Lin";\ns.Score = 58;\nConsole.WriteLine(s.Describe());\n\nclass Student\n{\n    public string Name = "";\n    public int Score;\n    public string Describe() => $"{Name}: {Score} ({(Score >= 60 ? "pass" : "retake")})";\n}'),
      page("Rules"),
      { ul: [
        "A class is a blueprint; an object (an **instance**) is one thing built from it.",
        "`new ClassName()` creates an instance; until then there is no object.",
        "A field declared in the class (`public int Score;`) exists once **per object**.",
        "Inside the class, a method reads its own object's fields by name (`Score`).",
        "A field starts at its type's default (0, false, null) unless it is given a value; `= \"\"` gives a string a safe start.",
        "Type names are PascalCase nouns: `Student`, `BankAccount`, `Order`.",
        "From this unit the compiler also checks for **null** (7.7): `Console.ReadLine() ?? \"\"` reads a line, or empty at the end of input, and `string?` marks a variable that may hold null. 7.7 and 7.8 explain both."
      ] },
      { table: { head: ["Word", "Means"], rows: [["class", "the type you write: what each object has and can do"], ["object / instance", "one value made with new"], ["field", "a variable that belongs to an object"], ["method", "a function that belongs to the class"], ["member", "any field, property or method of the class"]] } },
      page("Variations"),
      { h: "A list of objects" },
      run("list", "one list instead of parallel arrays", 'var all = new List<Student>\n{\n    new Student { Name = "Ada", Score = 91 },\n    new Student { Name = "Kai", Score = 74 },\n    new Student { Name = "Lin", Score = 58 }\n};\nforeach (var s in all)\n    if (s.Score >= 60) Console.WriteLine(s.Name);\n\nclass Student\n{\n    public string Name = "";\n    public int Score;\n}'),
      { ul: [ "`new Student { Name = …, Score = … }` is an **object initialiser**: create, then set fields, in one expression." ] },
      { h: "Each object has its own state" },
      run("own", "changing one object does not change another", 'var c1 = new Counter();\nvar c2 = new Counter();\nc1.Add(); c1.Add(); c2.Add();\nConsole.WriteLine($"{c1.Count} {c2.Count}");\n\nclass Counter\n{\n    public int Count;\n    public void Add() => Count++;\n}'),
      page("Pitfalls"),
      { h: "Using a class that is not created — CS0246" },
      run("pit-type", "a misspelt type name", 'var s = new Studnet();\n\nclass Student { }'),
      { h: "Fields before new" },
      "A variable of a class type holds nothing until `new` gives it an object. Calling a member on that nothing throws NullReferenceException.",
      run("pit-null", "an array of students starts empty", 'var group = new Student[2];\nConsole.WriteLine(group[0].Name);\n\nclass Student { public string Name = ""; }'),
      { h: "Calling a method on the class instead of an object — CS0120" },
      run("pit-static", "Describe belongs to each student", 'Console.WriteLine(Student.Describe());\n\nclass Student\n{\n    public string Name = "";\n    public string Describe() => Name;\n}'),
      page("Connections"),
      { ul: [ "**Back:** 4.x kept related values in parallel arrays and dictionaries; a class replaces them.", "**Next:** 7.2 constructors make objects start valid; 7.3 hides fields behind properties.", "**AQA:** 4.1.2.1 classes, objects and instantiation." ] },
      page("Good practice"),
      { ul: [ "One class, one idea: a Student is not also the gradebook.", "Name it as a noun; name its methods as verbs.", "Keep the data and the code that changes it together." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A rectangle* and *Two counters*." ] },
      page("Quick reference"),
      run("qr", "a class at a glance", 'var r = new Room { Name = "Lab", Seats = 30 };\nConsole.WriteLine(r.Label());\n\nclass Room\n{\n    public string Name = "";\n    public int Seats;\n    public string Label() => $"{Name} ({Seats})";\n}'),
      { ul: [ "`class T { fields; methods }` after the statements.", "`new T()` or `new T { Field = v }`.", "Each object has its own fields." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0246", "the type name is not known", "Pitfalls"], ["NullReferenceException", "no object yet", "Pitfalls"], ["CS0120", "an instance member used through the class", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var a = new Box();\nvar b = new Box();\na.Size = 3;\nb.Size = a.Size + 2;\na.Size = 10;\nConsole.WriteLine(b.Size);\n\nclass Box { public int Size; }', why: "b got 5 when a was 3; changing a later does not change b.", concepts: ["instance-state"] },
        { id: "p2", src: 'var c = new Lamp();\nc.Toggle(); c.Toggle(); c.Toggle();\nConsole.WriteLine(c.On);\n\nclass Lamp\n{\n    public bool On;\n    public void Toggle() => On = !On;\n}', why: "Starts false; three toggles end on true.", concepts: ["class-object"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to create a Dog object.", src: 'var d = @@;\nd.Name = "Rex";\nConsole.WriteLine(d.Name);\n\nclass Dog { public string Name = ""; }', out: "Rex", concepts: ["class-object"] }
      ],
      bug: [
        { id: "b1", q: "It should print 2 — each Add should add to this counter.", src: 'var c = new Counter();\nc.Add();\nc.Add();\nConsole.WriteLine(c.Count);\n\nclass Counter\n{\n    public int Count;\n    public void Add() { int Count = 0; Count++; }\n}', out: "2", fixedText: "prints 2", why: "`int Count = 0;` made a new local that hid the field; use the field: Count++.", concepts: ["instance-state"] }
      ]
    },
    flashcards: [
      ["Class or object: the blueprint?", "The class. An object is one thing built from it."],
      ["What creates an object?", "`new ClassName()`."],
      ["Does every object have its own copy of a field?", "Yes — a field is per object (unless it is static, 7.4)."],
      ["Where do class declarations go in a top-level program?", "After the statements."],
      ["What is `new T { A = 1 }`?", "An object initialiser: create, then set members."],
      ["Why a class instead of parallel arrays?", "It keeps one thing's data together, so it cannot drift apart."]
    ],
    quiz: [
      { q: "`var x = new Student[3];` gives…", opts: ["three students", "an array of three empty slots (null)", "a compile error", "one student"], ans: 1, why: "An array of a class type starts full of null; each needs new." },
      { q: "Inside `class Lamp`, `On = !On;` changes…", opts: ["every lamp", "the lamp it is called on", "nothing", "a static field"], ans: 1, why: "Fields are per object." },
      { q: "A good class name is…", opts: ["doStuff", "Student", "students_list", "x"], ans: 1, why: "A PascalCase noun." }
    ]
  });
  K.add({ tasks: {
    "7.1-rect": { lesson: "7.1", title: "A rectangle", tier: "warm-up", minutes: 10, concepts: ["class-object", "fields-methods"],
      statement: ["Read a width and a height (whole numbers, one per line).", "Write a class `Rect` with `Width` and `Height` fields and methods `Area()` and `Perimeter()`. Print `area A, perimeter P`."],
      starter: 'int w = int.Parse(Console.ReadLine() ?? "");\nint h = int.Parse(Console.ReadLine() ?? "");\n\nclass Rect\n{\n}',
      examples: [{ stdin: "3\n4", out: "area 12, perimeter 14" }],
      hidden: [{ stdin: "1\n1", out: "area 1, perimeter 4" }, { stdin: "10\n2", out: "area 20, perimeter 24" }],
      rules: [uses(/class\s+Rect\b/, "Write the class Rect."), uses(/\.Area\s*\(\s*\)/, "Call r.Area().", "area"), uses(/\.Perimeter\s*\(\s*\)/, "Call r.Perimeter().", "perim")],
      hints: ["Fields: public int Width; public int Height;", "Methods: public int Area() => Width * Height;", "var r = new Rect { Width = w, Height = h };"],
      answer: 'int w = int.Parse(Console.ReadLine() ?? "");\nint h = int.Parse(Console.ReadLine() ?? "");\nvar r = new Rect { Width = w, Height = h };\nConsole.WriteLine($"area {r.Area()}, perimeter {r.Perimeter()}");\n\nclass Rect\n{\n    public int Width;\n    public int Height;\n    public int Area() => Width * Height;\n    public int Perimeter() => 2 * (Width + Height);\n}' },
    "7.1-tally": { lesson: "7.1", title: "Two counters", tier: "core", minutes: 15, concepts: ["instance-state"],
      statement: ["Read a line of letters `y` and `n` (votes).", "Use TWO objects of one class `Tally` (with a `Count` field and an `Add()` method): one for yes, one for no. Print `yes Y, no N`."],
      starter: 'string votes = Console.ReadLine() ?? "";\n',
      examples: [{ stdin: "yynyn", out: "yes 3, no 2" }],
      hidden: [{ stdin: "", out: "yes 0, no 0" }, { stdin: "nnnn", out: "yes 0, no 4" }],
      rules: [uses(/class\s+Tally\b/, "Write the class Tally."), uses(/new\s+Tally\s*\([\s\S]*new\s+Tally\s*\(/, "Make two Tally objects.", "two")],
      hints: ["class Tally { public int Count; public void Add() => Count++; }", "var yes = new Tally(); var no = new Tally();", "foreach (char c in votes) if (c == 'y') yes.Add(); else if (c == 'n') no.Add();"],
      answer: 'string votes = Console.ReadLine() ?? "";\nvar yes = new Tally();\nvar no = new Tally();\nforeach (char c in votes)\n{\n    if (c == \'y\') yes.Add();\n    else if (c == \'n\') no.Add();\n}\nConsole.WriteLine($"yes {yes.Count}, no {no.Count}");\n\nclass Tally\n{\n    public int Count;\n    public void Add() => Count++;\n}' }
  } });

  /* ================================================================
     7.2 Fields, constructors and methods
     ================================================================ */
  lesson("7.2", {
    aqa: "4.1.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "With public fields anyone can make a `Student` with no name and a score of −40.",
        "A **constructor** is the code that runs when an object is created. It takes what the object needs and refuses what would make it wrong.",
        "If every object starts valid, and every method keeps it valid, the rest of the program never has to check."
      ] },
      page("Core idea"),
      run("ctor", "a constructor takes what the object needs", 'var s = new Student("Ada", 91);\nConsole.WriteLine(s.Describe());\n\nclass Student\n{\n    private string name;\n    private int score;\n\n    public Student(string name, int score)\n    {\n        this.name = name;\n        this.score = score;\n    }\n\n    public string Describe() => $"{name}: {score}";\n}'),
      { ul: [
        "The constructor has the class's name and no return type.",
        "`this.name` is the field; `name` alone is the parameter. `this` means \"the object being built\".",
        "The fields are now **private**: only the class's own code can touch them."
      ] },
      run("guard", "refuse a bad start", 'try\n{\n    var bad = new Student("", 50);\n}\ncatch (ArgumentException e)\n{\n    Console.WriteLine(e.Message);\n}\nvar ok = new Student("Kai", 74);\nConsole.WriteLine(ok.Describe());\n\nclass Student\n{\n    private readonly string name;\n    private int score;\n\n    public Student(string name, int score)\n    {\n        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("A student needs a name.");\n        if (score < 0 || score > 100) throw new ArgumentOutOfRangeException(nameof(score));\n        this.name = name;\n        this.score = score;\n    }\n\n    public string Describe() => $"{name}: {score}";\n}'),
      page("Rules"),
      { ul: [
        "A constructor runs once, inside `new`, before anyone can use the object.",
        "Validate the arguments there and throw (6.5) if they are wrong; the object then never exists.",
        "With no constructor written, C# supplies an empty one: `new T()`. Write one and that free one is gone.",
        "A class may have several constructors (overloads, 3.x); one can call another with `: this(...)`.",
        "`readonly` fields can be set only in the declaration or the constructor.",
        "An **invariant** is a rule that is always true of the object (a score is 0–100). Every method that changes a field must keep it."
      ] },
      page("Variations"),
      { h: "Methods that change state, safely" },
      run("method", "AddPoints keeps the score within 0–100", 'var s = new Student("Lin", 95);\ns.AddPoints(10);\nConsole.WriteLine(s.Describe());\ns.AddPoints(-200);\nConsole.WriteLine(s.Describe());\n\nclass Student\n{\n    private readonly string name;\n    private int score;\n    public Student(string name, int score) { this.name = name; this.score = score; }\n    public void AddPoints(int n) => score = Math.Clamp(score + n, 0, 100);\n    public string Describe() => $"{name}: {score}";\n}'),
      { h: "Two constructors, one rule" },
      run("chain", "a short form that calls the full one", 'var a = new Timer(90);\nvar b = new Timer();\nConsole.WriteLine($"{a.Seconds} {b.Seconds}");\n\nclass Timer\n{\n    public readonly int Seconds;\n    public Timer() : this(60) { }\n    public Timer(int seconds)\n    {\n        if (seconds <= 0) throw new ArgumentOutOfRangeException(nameof(seconds));\n        Seconds = seconds;\n    }\n}'),
      page("Pitfalls"),
      { h: "No empty constructor any more — CS7036" },
      run("pit-noarg", "Student needs a name and a score now", 'var s = new Student();\n\nclass Student\n{\n    private string name;\n    public Student(string name) { this.name = name; }\n}'),
      { h: "Assigning a readonly field outside the constructor — CS0191" },
      run("pit-ro", "readonly means set once", 'var t = new Ticket("A1");\n\nclass Ticket\n{\n    private readonly string code;\n    public Ticket(string code) { this.code = code; }\n    public void Change(string c) { code = c; }\n}'),
      { h: "Forgetting this" },
      "`name = name;` assigns the parameter to itself; the field stays empty. Write `this.name = name;` (the compiler warns: CS1717).",
      page("Connections"),
      { ul: [ "**Back:** 3.x methods and overloads; 6.5 throwing the right exception.", "**Next:** 7.3 replaces Describe-style getters with properties.", "**AQA:** 4.1.2.1 constructors and instantiation." ] },
      page("Good practice"),
      { ul: [ "Fields private, constructor validates, methods keep the rule.", "`readonly` for anything that never changes after creation.", "Throw from the constructor rather than leaving a half-made object." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A temperature that stays sane* and *A clock*." ] },
      page("Quick reference"),
      run("qr", "constructor, field, method", 'var p = new Point(3, 4);\nConsole.WriteLine(p.Length());\n\nclass Point\n{\n    private readonly double x, y;\n    public Point(double x, double y) { this.x = x; this.y = y; }\n    public double Length() => Math.Sqrt(x * x + y * y);\n}'),
      { ul: [ "`public T(args) { checks; this.f = arg; }`", "`: this(...)` to share one constructor.", "`readonly`: set once." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS7036", "the constructor needs arguments", "Pitfalls"], ["CS0191", "a readonly field set outside the constructor", "Pitfalls"], ["CS1717", "assignment made to the same variable", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var c = new Cup(250);\nc.Drink(100);\nc.Drink(400);\nConsole.WriteLine(c.Left());\n\nclass Cup\n{\n    private int ml;\n    public Cup(int ml) { this.ml = ml; }\n    public void Drink(int n) => ml = Math.Max(0, ml - n);\n    public int Left() => ml;\n}', why: "250 − 100 = 150; then 150 − 400 clamps to 0.", concepts: ["invariant"] },
        { id: "p2", src: 'var t = new Tag();\nConsole.WriteLine(t.Text);\n\nclass Tag\n{\n    public readonly string Text;\n    public Tag() : this("none") { }\n    public Tag(string t) { Text = t.ToUpper(); }\n}', why: "Tag() calls Tag(\"none\"), which upper-cases it.", concepts: ["ctor"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the field gets the parameter's value.", src: 'var b = new Badge("Ada");\nConsole.WriteLine(b.Show());\n\nclass Badge\n{\n    private string name = "";\n    public Badge(string name) { @@ = name; }\n    public string Show() => name;\n}', out: "Ada", concepts: ["ctor"] }
      ],
      bug: [
        { id: "b1", q: "A Wallet must never hold a negative amount: Spend(30) on 20 should leave it at 20.", src: 'var w = new Wallet(20);\nw.Spend(30);\nConsole.WriteLine(w.Amount());\n\nclass Wallet\n{\n    private int amount;\n    public Wallet(int a) { amount = a; }\n    public void Spend(int n) { amount -= n; }\n    public int Amount() => amount;\n}', out: "20", fixedText: "prints 20", why: "Spend must refuse (or ignore) what it cannot afford: if (n <= amount) amount -= n;", concepts: ["invariant"] }
      ]
    },
    flashcards: [
      ["What is a constructor?", "The code inside new that sets up an object; it has the class's name and no return type."],
      ["What does `this.name = name;` do?", "Copies the parameter into the field of the object being built."],
      ["When does C#'s free `new T()` disappear?", "As soon as you write any constructor."],
      ["What can set a `readonly` field?", "Its declaration or a constructor — nothing else."],
      ["What is an invariant?", "A rule always true of an object, kept by every method."],
      ["How does one constructor call another?", "`public T() : this(60) { }`."]
    ],
    quiz: [
      { q: "A constructor that throws means…", opts: ["the object exists half-made", "no object is created", "the program always ends", "the field is null"], ans: 1, why: "new never finishes, so there is no object to misuse (unless caught)." },
      { q: "`private int score;` can be read by…", opts: ["anyone", "only code inside the class", "only the constructor", "only static methods"], ans: 1, why: "private: the class's own members." },
      { q: "Which keeps a score between 0 and 100?", opts: ["a public field", "a method that clamps every change", "a comment", "readonly"], ans: 1, why: "Every change goes through code that enforces the rule." }
    ]
  });
  K.add({ tasks: {
    "7.2-temp": { lesson: "7.2", title: "A temperature that stays sane", tier: "core", minutes: 15, concepts: ["ctor", "invariant"],
      statement: ["Write `Thermostat` whose constructor takes a starting temperature and throws `ArgumentOutOfRangeException` unless it is 5–30.", "It has `Up()` and `Down()` (one degree each, never past 5 or 30) and `Show()` returning `N°C`.", "Read the start, then a line of `+`/`-` moves. Print the final `Show()`, or `invalid start` if the constructor threw."],
      starter: 'int start = int.Parse(Console.ReadLine() ?? "");\nstring moves = Console.ReadLine() ?? "";\n',
      examples: [{ stdin: "20\n+++-", out: "22°C" }, { stdin: "40\n+", out: "invalid start" }],
      hidden: [{ stdin: "29\n+++++", out: "30°C" }, { stdin: "5\n--+", out: "6°C" }, { stdin: "4\n", out: "invalid start" }],
      rules: [uses(/class\s+Thermostat\b/, "Write the class Thermostat."), uses(/throw\s+new\s+ArgumentOutOfRangeException/, "The constructor throws ArgumentOutOfRangeException.", "throw")],
      hints: ["private int t; public Thermostat(int start) { if (start < 5 || start > 30) throw …; t = start; }", "public void Up() { if (t < 30) t++; }", "try { var th = new Thermostat(start); foreach … ; Console.WriteLine(th.Show()); } catch (ArgumentOutOfRangeException) { … }"],
      answer: 'int start = int.Parse(Console.ReadLine() ?? "");\nstring moves = Console.ReadLine() ?? "";\ntry\n{\n    var th = new Thermostat(start);\n    foreach (char c in moves)\n    {\n        if (c == \'+\') th.Up();\n        else if (c == \'-\') th.Down();\n    }\n    Console.WriteLine(th.Show());\n}\ncatch (ArgumentOutOfRangeException)\n{\n    Console.WriteLine("invalid start");\n}\n\nclass Thermostat\n{\n    private int t;\n    public Thermostat(int start)\n    {\n        if (start < 5 || start > 30) throw new ArgumentOutOfRangeException(nameof(start));\n        t = start;\n    }\n    public void Up() { if (t < 30) t++; }\n    public void Down() { if (t > 5) t--; }\n    public string Show() => $"{t}°C";\n}' },
    "7.2-clock": { lesson: "7.2", title: "A clock", tier: "stretch", minutes: 20, concepts: ["ctor", "fields-methods", "invariant"],
      statement: ["Write `Clock` with a constructor `Clock(int hours, int minutes)` (0–23, 0–59; throw ArgumentOutOfRangeException otherwise) and `Tick(int minutes)` that moves it on, wrapping past midnight.", "`Show()` returns `HH:MM`. Read `hours minutes` and then a number of minutes to tick. Print the time after the tick."],
      starter: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\nint tick = int.Parse(Console.ReadLine() ?? "");\n',
      examples: [{ stdin: "23 50\n15", out: "00:05" }],
      hidden: [{ stdin: "9 0\n0", out: "09:00" }, { stdin: "12 30\n1500", out: "13:30" }, { stdin: "0 0\n59", out: "00:59" }],
      rules: [uses(/class\s+Clock\b/, "Write the class Clock."), uses(/Tick\s*\(/, "Give Clock a Tick method.", "tick")],
      hints: ["Store minutes since midnight: private int total;", "Tick: total = (total + m) % (24 * 60);", "Show: $\"{total / 60:D2}:{total % 60:D2}\""],
      answer: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\nint tick = int.Parse(Console.ReadLine() ?? "");\nvar c = new Clock(int.Parse(p[0]), int.Parse(p[1]));\nc.Tick(tick);\nConsole.WriteLine(c.Show());\n\nclass Clock\n{\n    private int total;\n    public Clock(int hours, int minutes)\n    {\n        if (hours < 0 || hours > 23) throw new ArgumentOutOfRangeException(nameof(hours));\n        if (minutes < 0 || minutes > 59) throw new ArgumentOutOfRangeException(nameof(minutes));\n        total = hours * 60 + minutes;\n    }\n    public void Tick(int m) => total = (total + m) % (24 * 60);\n    public string Show() => $"{total / 60:D2}:{total % 60:D2}";\n}' }
  } });

  /* ================================================================
     7.3 Properties and encapsulation
     ================================================================ */
  lesson("7.3", {
    aqa: "4.1.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Private fields keep an object safe, but callers still need to read its name and score.",
        "Writing `GetScore()` and `SetScore(int)` for every field is noise.",
        "A **property** looks like a field to the caller (`s.Score`) but is a pair of small methods inside, so the class keeps control of every read and write."
      ] },
      page("Core idea"),
      run("auto", "auto-properties: read anywhere, write only inside", 'var s = new Student("Ada", 91);\nConsole.WriteLine($"{s.Name} {s.Score}");\n\nclass Student\n{\n    public string Name { get; }\n    public int Score { get; private set; }\n\n    public Student(string name, int score)\n    {\n        Name = name;\n        Score = score;\n    }\n}'),
      { ul: [
        "`{ get; }` — read-only: set in the constructor, then fixed.",
        "`{ get; private set; }` — anyone reads, only the class writes.",
        "The compiler writes the hidden field for you."
      ] },
      run("full", "a full property checks every write", 'var s = new Student("Kai");\ns.Score = 74;\nConsole.WriteLine(s.Score);\ntry { s.Score = 140; }\ncatch (ArgumentOutOfRangeException) { Console.WriteLine("refused"); }\nConsole.WriteLine(s.Score);\n\nclass Student\n{\n    private int score;\n    public string Name { get; }\n    public Student(string name) => Name = name;\n    public int Score\n    {\n        get => score;\n        set\n        {\n            if (value < 0 || value > 100) throw new ArgumentOutOfRangeException(nameof(value));\n            score = value;\n        }\n    }\n}'),
      page("Rules"),
      { ul: [
        "**Encapsulation**: data is private; what callers may see and change is chosen, and checked.",
        "In a `set`, the incoming value is called `value`.",
        "A property with only `get` and an expression body (`=> …`) is **computed**: it stores nothing.",
        "`init` instead of `set` allows a value only while creating (`new T { X = 1 }`), then never again.",
        "Properties are PascalCase like methods; private fields are camelCase.",
        "Prefer a property for something that reads like data; a method for an action or real work."
      ] },
      { table: { head: ["Declaration", "Read", "Write"], rows: [["{ get; }", "anyone", "constructor only"], ["{ get; private set; }", "anyone", "inside the class"], ["{ get; set; }", "anyone", "anyone"], ["{ get; init; }", "anyone", "while creating"], ["=> expression", "anyone, worked out each time", "no one"]] } },
      page("Variations"),
      { h: "A computed property" },
      run("computed", "Grade is worked out from Score each time", 'var s = new Student { Name = "Lin", Score = 68 };\nConsole.WriteLine($"{s.Name}: {s.Grade}");\ns.Score = 85;\nConsole.WriteLine($"{s.Name}: {s.Grade}");\n\nclass Student\n{\n    public string Name { get; init; } = "";\n    public int Score { get; set; }\n    public string Grade => Score >= 80 ? "A" : Score >= 60 ? "B" : "C";\n}'),
      { h: "init: set while creating, then fixed" },
      run("init", "an object initialiser with init-only properties", 'var b = new Book { Title = "Dune", Pages = 412 };\nConsole.WriteLine($"{b.Title}, {b.Pages} pages");\n\nclass Book\n{\n    public string Title { get; init; } = "";\n    public int Pages { get; init; }\n}'),
      page("Pitfalls"),
      { h: "Writing a get-only property — CS0200" },
      run("pit-get", "Name can only be read", 'var s = new Student("Ada");\ns.Name = "Bob";\n\nclass Student\n{\n    public string Name { get; }\n    public Student(string n) => Name = n;\n}'),
      { h: "A private setter from outside — CS0272" },
      run("pit-priv", "only Student may change Score", 'var s = new Student();\ns.Score = 10;\n\nclass Student\n{\n    public int Score { get; private set; }\n}'),
      { h: "A property that calls itself" },
      "`public int Score { get => Score; }` reads Score, which reads Score… until StackOverflowException. A full property needs its own field.",
      page("Connections"),
      { ul: [ "**Back:** 7.2 private fields and invariants.", "**Next:** 7.4 static properties belong to the type; 7.10 models an account with them.", "**AQA:** 4.1.2.1 encapsulation." ] },
      page("Good practice"),
      { ul: [ "Start with `{ get; }` or `{ get; private set; }` and open up only when a caller really needs to write.", "Put the rule in the setter, once, not at every caller.", "Computed properties for things that follow from other data." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A product with a price* and *A progress bar*." ] },
      page("Quick reference"),
      run("qr", "properties at a glance", 'var c = new Circle { Radius = 2 };\nConsole.WriteLine($"{c.Area:F2}");\n\nclass Circle\n{\n    public double Radius { get; init; }\n    public double Area => Math.PI * Radius * Radius;\n}'),
      { ul: [ "`{ get; }` `{ get; private set; }` `{ get; set; }` `{ get; init; }`", "`=> expr` computed.", "`set { check; field = value; }`" ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0200", "the property has no setter", "Pitfalls"], ["CS0272", "the setter is private", "Pitfalls"], ["StackOverflowException", "a property calling itself", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var t = new Tank { Litres = 30 };\nt.Litres += 25;\nConsole.WriteLine($"{t.Litres} {t.Full}");\n\nclass Tank\n{\n    public int Litres { get; set; }\n    public bool Full => Litres >= 50;\n}', why: "30 + 25 = 55, which is at least 50.", concepts: ["properties"] },
        { id: "p2", src: 'var s = new Speed();\ns.Kmh = -20;\nConsole.WriteLine(s.Kmh);\n\nclass Speed\n{\n    private int kmh;\n    public int Kmh { get => kmh; set => kmh = Math.Max(0, value); }\n}', why: "The setter clamps the incoming value to at least 0.", concepts: ["encapsulation"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so anyone can read Count but only the class can change it.", src: 'var b = new Basket();\nb.Add();\nb.Add();\nConsole.WriteLine(b.Count);\n\nclass Basket\n{\n    public int Count { get; @@ }\n    public void Add() => Count++;\n}', out: "2", concepts: ["encapsulation"] }
      ],
      bug: [
        { id: "b1", q: "Area should follow Width: after setting Width to 5 it should print 25.", src: 'var sq = new Square { Width = 2 };\nsq.Width = 5;\nConsole.WriteLine(sq.Area);\n\nclass Square\n{\n    public int Width { get; set; }\n    public int Area { get; } = 0;\n}', out: "25", fixedText: "prints 25", why: "Make Area computed: public int Area => Width * Width;", concepts: ["properties"] }
      ]
    },
    flashcards: [
      ["What is a property?", "A member that reads like a field but runs get/set code."],
      ["In a setter, what is the incoming value called?", "`value`."],
      ["`{ get; private set; }` means…", "Anyone reads; only the class writes."],
      ["What does `init` allow?", "Setting the property only while creating the object."],
      ["What is a computed property?", "`=> expression`: no stored value, worked out on each read."],
      ["Encapsulation in one line?", "Private data, public behaviour that keeps it valid."]
    ],
    quiz: [
      { q: "`public int Age { get; }` can be set…", opts: ["anywhere", "only in the constructor (or initialiser)", "only by a setter", "never"], ans: 1, why: "Get-only auto-properties are set in the constructor." },
      { q: "Which stores nothing?", opts: ["{ get; set; }", "{ get; init; }", "=> Score * 2", "{ get; private set; }"], ans: 2, why: "An expression-bodied property is computed." },
      { q: "Where should a 0–100 check go?", opts: ["in every caller", "in the property's setter", "in a comment", "in Main"], ans: 1, why: "Once, where the value changes." }
    ]
  });
  K.add({ tasks: {
    "7.3-price": { lesson: "7.3", title: "A product with a price", tier: "core", minutes: 15, concepts: ["properties", "encapsulation"],
      statement: ["Write `Product` with `Name { get; }`, `Price` (a decimal property whose setter throws `ArgumentOutOfRangeException` if the value is negative) and a computed `WithVat` (Price × 1.2).", "Read a name, then prices one per line until a blank line or the end. Set each in turn; print `refused` for a negative one. Finally print `Name: Price, with VAT WithVat` with 2 decimal places."],
      starter: 'string name = Console.ReadLine() ?? "";\n',
      examples: [{ stdin: "Pen\n1.50\n-2\n2", out: "refused\nPen: 2.00, with VAT 2.40" }],
      hidden: [{ stdin: "Lamp\n10", out: "Lamp: 10.00, with VAT 12.00" }, { stdin: "Mug\n-1\n-5", out: "refused\nrefused\nMug: 0.00, with VAT 0.00" }],
      rules: [uses(/class\s+Product\b/, "Write the class Product."), uses(/WithVat\s*=>/, "Make WithVat a computed property.", "vat"), uses(/set\s*\{[\s\S]*throw/, "Check in the setter.", "set")],
      hints: ["private decimal price; public decimal Price { get => price; set { if (value < 0) throw …; price = value; } }", "public decimal WithVat => Price * 1.2m;", "Loop: string? line; while (!string.IsNullOrEmpty(line = Console.ReadLine())) { try { p.Price = decimal.Parse(line); } catch (ArgumentOutOfRangeException) { … } }"],
      answer: 'string name = Console.ReadLine() ?? "";\nvar p = new Product(name);\nstring? line;\nwhile (!string.IsNullOrEmpty(line = Console.ReadLine()))\n{\n    try { p.Price = decimal.Parse(line); }\n    catch (ArgumentOutOfRangeException) { Console.WriteLine("refused"); }\n}\nConsole.WriteLine($"{p.Name}: {p.Price:F2}, with VAT {p.WithVat:F2}");\n\nclass Product\n{\n    private decimal price;\n    public string Name { get; }\n    public Product(string name) => Name = name;\n    public decimal Price\n    {\n        get => price;\n        set\n        {\n            if (value < 0) throw new ArgumentOutOfRangeException(nameof(value));\n            price = value;\n        }\n    }\n    public decimal WithVat => Price * 1.2m;\n}' },
    "7.3-bar": { lesson: "7.3", title: "A progress bar", tier: "warm-up", minutes: 10, concepts: ["properties"],
      statement: ["Write `Progress` with an `int Done { get; set; }`, an `int Total { get; init; }` and a computed `Bar` that is ten characters: `#` for each tenth done (rounded down), `.` for the rest.", "Read `done total` and print the bar."],
      starter: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\n',
      examples: [{ stdin: "3 10", out: "###......." }],
      hidden: [{ stdin: "0 5", out: ".........." }, { stdin: "5 5", out: "##########" }, { stdin: "7 20", out: "###......." }],
      rules: [uses(/Bar\s*=>/, "Make Bar a computed property.", "bar")],
      hints: ["int filled = Done * 10 / Total;", "new string('#', filled) + new string('.', 10 - filled)", "var g = new Progress { Total = …, Done = … };"],
      answer: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\nvar g = new Progress { Total = int.Parse(p[1]), Done = int.Parse(p[0]) };\nConsole.WriteLine(g.Bar);\n\nclass Progress\n{\n    public int Done { get; set; }\n    public int Total { get; init; }\n    public string Bar => new string(\'#\', Done * 10 / Total) + new string(\'.\', 10 - Done * 10 / Total);\n}' }
  } });

  /* ================================================================
     7.4 Static members
     ================================================================ */
  lesson("7.4", {
    aqa: "4.1.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Some data belongs to no single object: how many students have been created, the pass mark every student is judged by.",
        "Some methods need no object at all: `Math.Max`, `int.Parse`, `Console.WriteLine`.",
        "A **static** member belongs to the type itself. There is exactly one, shared by every object, reached through the class name."
      ] },
      page("Core idea"),
      run("count", "a static counter shared by every object", 'new Student("Ada");\nnew Student("Kai");\nvar l = new Student("Lin");\nConsole.WriteLine(Student.Created);\nConsole.WriteLine(l.Number);\n\nclass Student\n{\n    public static int Created { get; private set; }\n    public string Name { get; }\n    public int Number { get; }\n    public Student(string name)\n    {\n        Name = name;\n        Created++;\n        Number = Created;\n    }\n}'),
      { ul: [
        "`Created` is static: one value for the type, counted up by every constructor.",
        "`Number` is an instance property: each student keeps the count at its own creation."
      ] },
      run("helper", "a static class of helpers", 'Console.WriteLine(Grades.Letter(83));\nConsole.WriteLine(Grades.Letter(55));\nConsole.WriteLine(Grades.PassMark);\n\nstatic class Grades\n{\n    public const int PassMark = 60;\n    public static string Letter(int score) => score >= 80 ? "A" : score >= PassMark ? "B" : "U";\n}'),
      page("Rules"),
      { ul: [
        "A static member is reached through the type: `Student.Created`, `Grades.Letter(83)`.",
        "A static method has no `this`: it cannot read instance fields directly (it has no object).",
        "An instance method may read static members freely.",
        "A `static class` holds only static members and can never be created with `new`.",
        "`const` is a compile-time constant (numbers, strings) and is static by nature; `static readonly` is set once at start-up and may be any type.",
        "Shared mutable statics are global state: use them sparingly."
      ] },
      { table: { head: ["", "Instance", "Static"], rows: [["How many", "one per object", "one for the type"], ["Reached through", "an object: s.Name", "the type: Student.Created"], ["Has this", "yes", "no"], ["Example", "a student's score", "the pass mark, Math.Max"]] } },
      page("Variations"),
      { h: "A factory method" },
      run("factory", "a static method that builds and validates", 'var s = Student.Parse("Ada,91");\nConsole.WriteLine($"{s.Name} {s.Score}");\nConsole.WriteLine(Student.TryParse("Kai,x", out _));\n\nclass Student\n{\n    public string Name { get; }\n    public int Score { get; }\n    private Student(string n, int s) { Name = n; Score = s; }\n    public static Student Parse(string line)\n    {\n        string[] f = line.Split(\',\');\n        return new Student(f[0], int.Parse(f[1]));\n    }\n    public static bool TryParse(string line, out Student? s)\n    {\n        s = null;\n        string[] f = line.Split(\',\');\n        if (f.Length != 2 || !int.TryParse(f[1], out int sc)) return false;\n        s = new Student(f[0], sc);\n        return true;\n    }\n}'),
      { ul: [ "The constructor is private, so `Parse` and `TryParse` are the only ways in — the same pattern as `int.Parse`." ] },
      { h: "static readonly for a shared object" },
      run("ro", "one list of valid houses, created once", 'Console.WriteLine(School.IsHouse("Red"));\nConsole.WriteLine(School.IsHouse("Purple"));\n\nstatic class School\n{\n    private static readonly HashSet<string> houses = new() { "Red", "Blue", "Green" };\n    public static bool IsHouse(string h) => houses.Contains(h);\n}'),
      page("Pitfalls"),
      { h: "An instance member from a static method — CS0120" },
      run("pit-this", "Describe has no object to read Name from", 'Console.WriteLine(Student.Describe());\n\nclass Student\n{\n    public string Name = "Ada";\n    public static string Describe() => Name;\n}'),
      { h: "Creating a static class — CS0712" },
      run("pit-new", "Grades is a holder of helpers, not a thing", 'new Grades();\n\nstatic class Grades\n{\n    public static int Max = 100;\n}'),
      { h: "A static that should have been per object" },
      run("pit-shared", "every account shares one balance", 'var a = new Account();\nvar b = new Account();\na.Deposit(50);\nConsole.WriteLine(b.Balance);\n\nclass Account\n{\n    public static int Balance;\n    public void Deposit(int n) => Balance += n;\n}'),
      page("Connections"),
      { ul: [ "**Back:** `Math`, `int.Parse` and `Console` were static all along.", "**Next:** 7.5 groups classes into namespaces; 7.9's enums are type-level constants.", "**AQA:** 4.1.2.1 classes; static (class) members." ] },
      page("Good practice"),
      { ul: [ "Default to instance members; make something static only when it truly belongs to the type.", "Pure helper functions fit a static class.", "Prefer `const`/`static readonly` over a static that changes." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Ticket numbers* and *A unit converter*." ] },
      page("Quick reference"),
      run("qr", "static at a glance", 'Console.WriteLine(Temp.ToF(100));\nConsole.WriteLine(Temp.Freezing);\n\nstatic class Temp\n{\n    public const double Freezing = 0;\n    public static double ToF(double c) => c * 9 / 5 + 32;\n}'),
      { ul: [ "`static` = one for the type, reached by the type's name.", "`static class` = helpers only.", "`const` and `static readonly` for shared values." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0120", "an instance member used with no object", "Pitfalls"], ["CS0712", "a static class cannot be created", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var a = new Door();\nvar b = new Door();\na.Open();\nb.Open();\na.Open();\nConsole.WriteLine($"{Door.Opened} {a.Times}");\n\nclass Door\n{\n    public static int Opened;\n    public int Times;\n    public void Open() { Opened++; Times++; }\n}', why: "Opened counts every door's opens (3); a.Times counts a's (2).", concepts: ["static-members"] },
        { id: "p2", src: 'Console.WriteLine(Mathx.Square(Mathx.Square(3)));\n\nstatic class Mathx\n{\n    public static int Square(int n) => n * n;\n}', why: "3² = 9, then 9² = 81.", concepts: ["static-members"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Count is shared by every Item.", src: 'new Item(); new Item(); new Item();\nConsole.WriteLine(Item.Count);\n\nclass Item\n{\n    public @@ int Count;\n    public Item() => Count++;\n}', out: "3", concepts: ["static-members"] }
      ],
      bug: [
        { id: "b1", q: "Each player should have their own score: it should print 10 then 0.", src: 'var p1 = new Player();\nvar p2 = new Player();\np1.Score += 10;\nConsole.WriteLine(p1.Score);\nConsole.WriteLine(p2.Score);\n\nclass Player\n{\n    public static int Score { get; set; }\n}', out: "10\n0", fixedText: "prints 10 then 0", why: "Score is per player: drop static, and read it through the object (p1.Score).", concepts: ["static-members"] }
      ]
    },
    flashcards: [
      ["What does static mean on a member?", "It belongs to the type: one copy, shared, reached by the type's name."],
      ["Can a static method read an instance field?", "Not directly — it has no object (no this)."],
      ["What is a static class?", "A class of only static members that cannot be created."],
      ["const or static readonly for a HashSet?", "static readonly — const only holds compile-time constants."],
      ["Name three static members you have used.", "Math.Max, int.Parse, Console.WriteLine."],
      ["Why use a private constructor with a static Parse?", "So every object is made through the method that validates it."]
    ],
    quiz: [
      { q: "`Student.Created` is reached through…", opts: ["an object", "the class name", "this", "a namespace"], ans: 1, why: "Static members are reached through the type." },
      { q: "Which should be static?", opts: ["a student's name", "the pass mark for every student", "an account's balance", "a lamp's on/off"], ans: 1, why: "It is the same for every object." },
      { q: "`new Grades()` for a static class gives…", opts: ["an object", "CS0712", "null", "a warning"], ans: 1, why: "A static class cannot be created." }
    ]
  });
  K.add({ tasks: {
    "7.4-ticket": { lesson: "7.4", title: "Ticket numbers", tier: "warm-up", minutes: 10, concepts: ["static-members"],
      statement: ["Write `Ticket` with a static counter so each new ticket gets the next number starting at 1001, stored in its `Number` property, and a static `Issued` property.", "Read names, one per line, until the end. Make a ticket for each and print `#Number Name`. Finally print `issued N`."],
      starter: "",
      examples: [{ stdin: "Ada\nKai", out: "#1001 Ada\n#1002 Kai\nissued 2" }],
      hidden: [{ stdin: "Lin", out: "#1001 Lin\nissued 1" }, { stdin: "", out: "issued 0" }],
      rules: [uses(/static\s+int\s+Issued|static\s+int\s+\w+\s*[;={]/, "Keep the count in a static member.")],
      hints: ["public static int Issued { get; private set; }", "In the constructor: Issued++; Number = 1000 + Issued;", "string? line; while ((line = Console.ReadLine()) != null && line != \"\") …"],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) != null && line != "")\n{\n    var t = new Ticket(line);\n    Console.WriteLine($"#{t.Number} {t.Name}");\n}\nConsole.WriteLine($"issued {Ticket.Issued}");\n\nclass Ticket\n{\n    public static int Issued { get; private set; }\n    public int Number { get; }\n    public string Name { get; }\n    public Ticket(string name)\n    {\n        Name = name;\n        Issued++;\n        Number = 1000 + Issued;\n    }\n}' },
    "7.4-convert": { lesson: "7.4", title: "A unit converter", tier: "core", minutes: 15, concepts: ["static-members"],
      statement: ["Write a static class `Units` with `const double MilesToKm = 1.609344` and static methods `ToKm(double miles)` and `ToMiles(double km)`.", "Read lines like `5 mi` or `10 km` until the end. Print each converted to 2 decimal places: `5 mi = 8.05 km`."],
      starter: "",
      examples: [{ stdin: "5 mi\n10 km", out: "5 mi = 8.05 km\n10 km = 6.21 mi" }],
      hidden: [{ stdin: "0 mi", out: "0 mi = 0.00 km" }, { stdin: "1.5 km", out: "1.5 km = 0.93 mi" }],
      rules: [uses(/static\s+class\s+Units\b/, "Write the static class Units."), uses(/const\s+double\s+MilesToKm/, "Keep the factor as a const.", "const")],
      hints: ["public static double ToKm(double m) => m * MilesToKm;", "string[] p = line.Split(' '); double v = double.Parse(p[0]);", "Print p[0], not v, so 1.5 stays 1.5."],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) != null && line != "")\n{\n    string[] p = line.Split(\' \');\n    double v = double.Parse(p[0]);\n    if (p[1] == "mi") Console.WriteLine($"{p[0]} mi = {Units.ToKm(v):F2} km");\n    else Console.WriteLine($"{p[0]} km = {Units.ToMiles(v):F2} mi");\n}\n\nstatic class Units\n{\n    public const double MilesToKm = 1.609344;\n    public static double ToKm(double miles) => miles * MilesToKm;\n    public static double ToMiles(double km) => km / MilesToKm;\n}' }
  } });

  /* ================================================================
     7.5 Namespaces and files
     ================================================================ */
  lesson("7.5", {
    aqa: "4.1.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A real program has dozens of classes, and two libraries may both have a class called `Logger`.",
        "A **namespace** is a surname for types: `School.Student` and `Game.Student` can both exist.",
        "In Rider each class gets its own file and the folder matches the namespace; in the app everything is one file, so the same rules show in one place."
      ] },
      page("Core idea"),
      run("ns", "two namespaces, and using to shorten names", 'using School;\n\nvar s = new Student("Ada");\nvar p = new Game.Player("Kai");\nConsole.WriteLine(s.Name + " and " + p.Name);\n\nnamespace School\n{\n    class Student\n    {\n        public string Name { get; }\n        public Student(string name) => Name = name;\n    }\n}\n\nnamespace Game\n{\n    class Player\n    {\n        public string Name { get; }\n        public Player(string name) => Name = name;\n    }\n}'),
      { ul: [
        "`namespace School { … }` puts Student into School; its full name is `School.Student`.",
        "`using School;` at the top lets the program write `Student` alone.",
        "Without a using, write the full name: `new Game.Player(…)`."
      ] },
      run("order", "the order of a file with top-level statements", 'using System.Text;\n\nvar sb = new StringBuilder();\nsb.Append(Greeter.Hello("Lin"));\nConsole.WriteLine(sb);\n\nstatic class Greeter\n{\n    public static string Hello(string n) => $"Hello, {n}!";\n}'),
      page("Rules"),
      { ul: [
        "A file's order: `using` directives, then the top-level statements, then type and namespace declarations.",
        "Exactly one file in a project may have top-level statements; it is the entry point.",
        "Namespaces nest with dots: `Kurenai.School.Grades`. Convention: company or app, then area.",
        "`System`, `System.Collections.Generic`, `System.IO` and `System.Linq` are already imported in a modern project (implicit usings).",
        "In Rider: one public type per file, the file named after it (`Student.cs`), and a file-scoped `namespace School;` line at the top.",
        "Access: `public` types are visible to other projects; with no modifier a top-level class is `internal` — this project only."
      ] },
      { table: { head: ["Line", "Where", "Does"], rows: [["using X;", "top of the file", "lets you use X's types by short name"], ["namespace X { }", "after statements", "puts the types inside into X"], ["namespace X;", "top of a Rider file", "puts the whole file into X"], ["X.Y.T", "anywhere", "a type's full name"]] } },
      page("Variations"),
      { h: "Same name, two namespaces" },
      run("clash", "two Loggers, told apart by their namespaces", 'Console.WriteLine(new App.Logger().Write("start"));\nConsole.WriteLine(new Audit.Logger().Write("start"));\n\nnamespace App { class Logger { public string Write(string m) => "[app] " + m; } }\nnamespace Audit { class Logger { public string Write(string m) => "[audit] " + m; } }'),
      { h: "An alias" },
      run("alias", "using Name = Full.Name; for a long or clashing one", 'using AppLog = App.Logger;\n\nConsole.WriteLine(new AppLog().Write("ready"));\n\nnamespace App { class Logger { public string Write(string m) => "[app] " + m; } }'),
      { h: "What it looks like in Rider" },
      { code: { lang: "csharp", cap: "Models/Student.cs", src: "namespace Kurenai.School.Models;\n\npublic class Student\n{\n    public string Name { get; }\n    public Student(string name) => Name = name;\n}" } },
      page("Pitfalls"),
      { h: "A class before the statements — CS8803" },
      run("pit-order", "types go after top-level statements", 'class Note { }\n\nConsole.WriteLine("hi");'),
      { h: "A missing using — CS0246" },
      run("pit-using", "StringBuilder lives in System.Text", 'var sb = new StringBuilder();\nsb.Append("x");\nConsole.WriteLine(sb);'),
      { h: "An ambiguous name — CS0104" },
      run("pit-amb", "two usings both offer Logger", 'using App;\nusing Audit;\n\nvar l = new Logger();\n\nnamespace App { class Logger { } }\nnamespace Audit { class Logger { } }'),
      page("Connections"),
      { ul: [ "**Back:** Bridge B created projects in Rider with one file per class.", "**Next:** 7.6 references; unit 10 organises a whole solution.", "**AQA:** 4.1.2.1 (organising classes)." ] },
      page("Good practice"),
      { ul: [ "Namespace follows the folder; the file follows the class.", "Keep usings to what the file uses.", "Avoid generic names (`Utils`, `Manager`) that clash." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Shapes in a namespace* and *Two greeters*." ] },
      page("Quick reference"),
      run("qr", "namespaces at a glance", 'using Shop;\n\nConsole.WriteLine(new Basket().Total);\n\nnamespace Shop { class Basket { public decimal Total => 12.5m; } }'),
      { ul: [ "usings → statements → types.", "`namespace X { }` or `namespace X;`", "Full name `X.T`, or `using X;`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS8803", "a type declared before top-level statements", "Pitfalls"], ["CS0246", "the type is not found (missing using?)", "Pitfalls"], ["CS0104", "two usings offer the same name", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine(new A.Box().Name + new B.Box().Name);\n\nnamespace A { class Box { public string Name => "a"; } }\nnamespace B { class Box { public string Name => "b"; } }', why: "Each full name picks its own Box.", concepts: ["namespaces"] },
        { id: "p2", src: 'using Tools;\n\nConsole.WriteLine(Text.Shout("hi"));\n\nnamespace Tools { static class Text { public static string Shout(string s) => s.ToUpper() + "!"; } }', why: "using Tools lets Text be used by its short name.", concepts: ["namespaces"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Robot can be used by its short name.", src: '@@\n\nConsole.WriteLine(new Robot().Beep());\n\nnamespace Lab { class Robot { public string Beep() => "beep"; } }', out: "beep", concepts: ["namespaces"] }
      ],
      bug: [
        { id: "b1", q: "It should print ok — fix the file's order.", src: 'static class Check { public static string Ok() => "ok"; }\n\nConsole.WriteLine(Check.Ok());', out: "ok", fixedText: "prints ok", why: "Top-level statements must come before type declarations (CS8803): move the class below.", concepts: ["namespaces"] }
      ]
    },
    flashcards: [
      ["What is a namespace?", "A name that groups types, so School.Student and Game.Student can both exist."],
      ["What does `using X;` do?", "Lets the file use X's types by their short names."],
      ["The order of a file with top-level statements?", "usings, then statements, then types and namespaces."],
      ["CS0104 means…", "Two usings offer the same type name — ambiguous."],
      ["Rider convention for a class file?", "One type per file, named after it, file-scoped namespace following the folder."],
      ["A class with no access modifier is…", "internal — visible inside its own project."]
    ],
    quiz: [
      { q: "Where must a class go in a file with top-level statements?", opts: ["first", "after the statements", "anywhere", "in another file only"], ans: 1, why: "CS8803 otherwise." },
      { q: "`Kurenai.School.Student` is…", opts: ["a method", "a full type name", "a folder path only", "an error"], ans: 1, why: "Namespace path plus the type." },
      { q: "Two usings both contain Logger. You write `new Logger()`…", opts: ["the first wins", "CS0104 ambiguous", "the last wins", "a warning"], ans: 1, why: "The compiler will not guess." }
    ]
  });
  K.add({ tasks: {
    "7.5-shapes": { lesson: "7.5", title: "Shapes in a namespace", tier: "warm-up", minutes: 10, concepts: ["namespaces"],
      statement: ["Put a class `Square` (with a `Side` property and a computed `Area`) inside `namespace Geometry`, and use it through `using Geometry;`.", "Read a side length and print `area A`."],
      starter: 'int side = int.Parse(Console.ReadLine() ?? "");\n',
      examples: [{ stdin: "4", out: "area 16" }],
      hidden: [{ stdin: "1", out: "area 1" }, { stdin: "12", out: "area 144" }],
      rules: [uses(/namespace\s+Geometry\b/, "Declare namespace Geometry."), uses(/using\s+Geometry\s*;/, "Add using Geometry; at the top.", "using")],
      hints: ["The using goes on the first line.", "namespace Geometry { class Square { public int Side { get; init; } public int Area => Side * Side; } }", "var s = new Square { Side = side };"],
      answer: 'using Geometry;\n\nint side = int.Parse(Console.ReadLine() ?? "");\nvar s = new Square { Side = side };\nConsole.WriteLine($"area {s.Area}");\n\nnamespace Geometry\n{\n    class Square\n    {\n        public int Side { get; init; }\n        public int Area => Side * Side;\n    }\n}' },
    "7.5-greet": { lesson: "7.5", title: "Two greeters", tier: "core", minutes: 15, concepts: ["namespaces"],
      statement: ["Write two classes both called `Greeter`, one in `namespace English` and one in `namespace French`, each with a static `Hello(string name)`: `Hello, NAME!` and `Bonjour, NAME !`.", "Read a language code (`en` or `fr`) and a name. Print the right greeting, using full names (no using for either)."],
      starter: 'string lang = Console.ReadLine() ?? "";\nstring name = Console.ReadLine() ?? "";\n',
      examples: [{ stdin: "fr\nAda", out: "Bonjour, Ada !" }],
      hidden: [{ stdin: "en\nKai", out: "Hello, Kai!" }],
      rules: [uses(/English\.Greeter\.Hello/, "Call English.Greeter.Hello by its full name.", "en"), uses(/French\.Greeter\.Hello/, "Call French.Greeter.Hello by its full name.", "fr")],
      hints: ["namespace English { static class Greeter { public static string Hello(string n) => …; } }", "The same in French.", "Console.WriteLine(lang == \"fr\" ? French.Greeter.Hello(name) : English.Greeter.Hello(name));"],
      answer: 'string lang = Console.ReadLine() ?? "";\nstring name = Console.ReadLine() ?? "";\nConsole.WriteLine(lang == "fr" ? French.Greeter.Hello(name) : English.Greeter.Hello(name));\n\nnamespace English\n{\n    static class Greeter { public static string Hello(string n) => $"Hello, {n}!"; }\n}\nnamespace French\n{\n    static class Greeter { public static string Hello(string n) => $"Bonjour, {n} !"; }\n}' }
  } });

  /* ================================================================
     7.6 References and equality
     ================================================================ */
  lesson("7.6", {
    aqa: "4.1.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "`int b = a;` copies a number. `var b = a;` with a Student does **not** copy the student.",
        "A class variable holds a **reference** — an arrow to an object on the heap (8.8 draws the memory). Copy the variable and you copy the arrow.",
        "So changing \"b\" changes \"a\", and `==` asks \"same object?\", not \"same contents?\". Both surprise everyone once."
      ] },
      page("Core idea"),
      run("alias", "two variables, one object", 'var a = new Student { Name = "Ada" };\nvar b = a;\nb.Name = "Bea";\nConsole.WriteLine(a.Name);\nConsole.WriteLine(ReferenceEquals(a, b));\n\nclass Student { public string Name { get; set; } = ""; }'),
      { ul: [ "`b = a` copied the reference. There is still one Student; both names see the change." ] },
      run("eq", "== on two separate but identical objects", 'var x = new Student { Name = "Kai" };\nvar y = new Student { Name = "Kai" };\nConsole.WriteLine(x == y);\nConsole.WriteLine(x.Name == y.Name);\n\nclass Student { public string Name { get; set; } = ""; }'),
      page("Rules"),
      { ul: [
        "Classes are **reference types**: a variable holds a reference; assignment copies the reference.",
        "int, double, bool, char and structs are **value types**: assignment copies the value (8.8).",
        "Passing an object to a method passes the reference: the method can change the caller's object.",
        "For classes, `==` means **the same object** (reference equality), unless the class defines otherwise.",
        "`string` is a class but defines `==` to compare the characters, so strings compare by value.",
        "A **record** (`record Point(int X, int Y);`) compares by value: two records with equal properties are `==`."
      ] },
      { table: { head: ["Code", "Classes", "Values and records"], rows: [["b = a", "copies the reference", "copies the value / reference to equal data"], ["b.X = 5", "a sees it too", "(records: usually not settable)"], ["a == b", "same object?", "same contents?"]] } },
      page("Variations"),
      { h: "A method changes the caller's object" },
      run("param", "the parameter is a copy of the reference", 'var s = new Student { Name = "Lin", Score = 60 };\nBonus(s);\nConsole.WriteLine(s.Score);\nReplace(s);\nConsole.WriteLine(s.Name);\n\nvoid Bonus(Student st) => st.Score += 5;\nvoid Replace(Student st) => st = new Student { Name = "Zed" };\n\nclass Student { public string Name { get; set; } = ""; public int Score { get; set; } }'),
      { ul: [ "Bonus changed the object both share. Replace pointed its own copy of the arrow elsewhere; the caller's `s` is untouched." ] },
      { h: "Records compare by value" },
      run("record", "a record gets value equality and a ToString", 'var p = new Point(1, 2);\nvar q = new Point(1, 2);\nConsole.WriteLine(p == q);\nConsole.WriteLine(p);\nvar r = p with { Y = 5 };\nConsole.WriteLine(r);\n\nrecord Point(int X, int Y);'),
      { h: "A list holds references" },
      run("list", "the same object in two places", 'var ada = new Student { Name = "Ada" };\nvar team = new List<Student> { ada, ada };\nteam[0].Name = "ADA";\nConsole.WriteLine(team[1].Name);\n\nclass Student { public string Name { get; set; } = ""; }'),
      page("Pitfalls"),
      { h: "Thinking assignment copied the object" },
      run("pit-copy", "\"backup\" is the same object", 'var original = new List<int> { 1, 2, 3 };\nvar backup = original;\noriginal.Add(4);\nConsole.WriteLine(backup.Count);'),
      { h: "Setting a property of a positional record — CS8852" },
      run("pit-rec", "record Point(int X, int Y) is init-only; use with", 'var p = new Point(1, 2);\np.X = 9;\n\nrecord Point(int X, int Y);'),
      { h: "Comparing objects with ==" },
      "Two separate objects with equal fields are not `==` unless the type says so. Compare the fields, or use a record.",
      page("Connections"),
      { ul: [ "**Back:** 4.x lists and arrays were references all along (that is why a method could change an array).", "**Next:** 7.7 null — a reference that points nowhere; 8.8 value and reference types in memory.", "**AQA:** 4.1.2.1 objects; references." ] },
      page("Good practice"),
      { ul: [ "Copy on purpose: `new List<int>(original)` or a `with` expression.", "Use records for small data that should compare by value.", "Be careful when a method changes an object it was given; say so in its name." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Shared or copied?* and *Same point*." ] },
      page("Quick reference"),
      run("qr", "reference vs value at a glance", 'var a = new Box { N = 1 };\nvar b = a;\nb.N = 2;\nint x = 1;\nint y = x;\ny = 2;\nConsole.WriteLine($"{a.N} {x}");\n\nclass Box { public int N; }'),
      { ul: [ "Class: assignment copies the arrow.", "== on a class: same object.", "record: value equality, `with` copies." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS8852", "an init-only property set after creation", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var a = new Pt { X = 1 };\nvar b = a;\nvar c = new Pt { X = 1 };\nb.X = 7;\nConsole.WriteLine($"{a.X} {c.X} {a == b} {a == c}");\n\nclass Pt { public int X; }', why: "a and b are one object (7); c is separate (1); a==b same object, a==c not.", concepts: ["references", "equality"] },
        { id: "p2", src: 'var r1 = new Money(5, "GBP");\nvar r2 = new Money(5, "GBP");\nConsole.WriteLine(r1 == r2);\nConsole.WriteLine(r1 with { Amount = 6 });\n\nrecord Money(int Amount, string Currency);', why: "Records compare by value; with copies and changes one property.", concepts: ["equality"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so backup is a real copy, not the same list.", src: 'var xs = new List<int> { 1, 2 };\nvar backup = @@;\nxs.Add(3);\nConsole.WriteLine(backup.Count);', out: "2", concepts: ["references"] }
      ],
      bug: [
        { id: "b1", q: "The two scores are equal: it should print True.", src: 'var a = new Score { Value = 90 };\nvar b = new Score { Value = 90 };\nConsole.WriteLine(a == b);\n\nclass Score { public int Value { get; set; } }', out: "True", fixedText: "prints True", why: "Compare the values (a.Value == b.Value), or make Score a record.", concepts: ["equality"] }
      ]
    },
    flashcards: [
      ["What does `var b = a;` copy for a class?", "The reference — both name one object."],
      ["What does `==` compare for two class objects?", "Whether they are the same object (unless the class redefines it)."],
      ["Why do strings compare by value?", "string defines == to compare characters."],
      ["What does a record give you?", "Value equality, a readable ToString and `with` copies."],
      ["A method changes a property of its object parameter. Does the caller see it?", "Yes — they share the object."],
      ["How to copy a list?", "`new List<T>(original)`."]
    ],
    quiz: [
      { q: "`var b = a; b.Name = \"X\";` (Student class). a.Name is…", opts: ["unchanged", "\"X\"", "null", "an error"], ans: 1, why: "One object, two references." },
      { q: "Two separate Student objects with the same Name: `x == y` is…", opts: ["True", "False", "a compile error", "it depends on Name"], ans: 1, why: "Reference equality for classes." },
      { q: "`record P(int X); new P(1) == new P(1)` is…", opts: ["True", "False", "a compile error", "null"], ans: 0, why: "Records compare by value." }
    ]
  });
  K.add({ tasks: {
    "7.6-copy": { lesson: "7.6", title: "Shared or copied?", tier: "core", minutes: 15, concepts: ["references"],
      statement: ["Read numbers separated by spaces into a `List<int>` called `scores`. Make `copy` a REAL copy and `alias` a second name for `scores`.", "Then add 100 to the end of `scores`. Print the three counts as `scores S, copy C, alias A`."],
      starter: 'var scores = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();\n',
      examples: [{ stdin: "4 8 15", out: "scores 4, copy 3, alias 4" }],
      hidden: [{ stdin: "", out: "scores 1, copy 0, alias 1" }],
      rules: [uses(/new\s+List<int>\s*\(\s*scores\s*\)/, "Copy with new List<int>(scores).", "copy")],
      hints: ["var copy = new List<int>(scores);", "var alias = scores;", "scores.Add(100); then print the three .Count values."],
      answer: 'var scores = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();\nvar copy = new List<int>(scores);\nvar alias = scores;\nscores.Add(100);\nConsole.WriteLine($"scores {scores.Count}, copy {copy.Count}, alias {alias.Count}");' },
    "7.6-point": { lesson: "7.6", title: "Same point", tier: "warm-up", minutes: 10, concepts: ["equality"],
      statement: ["Declare `record Point(int X, int Y);`. Read two lines of `x y`. Print `same` if the two points are equal (==), otherwise `different`, then print the first point."],
      starter: 'int[] a = (Console.ReadLine() ?? "").Split(\' \').Select(int.Parse).ToArray();\nint[] b = (Console.ReadLine() ?? "").Split(\' \').Select(int.Parse).ToArray();\n',
      examples: [{ stdin: "1 2\n1 2", out: "same\nPoint { X = 1, Y = 2 }" }],
      hidden: [{ stdin: "3 4\n4 3", out: "different\nPoint { X = 3, Y = 4 }" }],
      rules: [uses(/record\s+Point\s*\(/, "Declare record Point(int X, int Y);.")],
      hints: ["record Point(int X, int Y); goes at the end of the file.", "var p = new Point(a[0], a[1]);", "Console.WriteLine(p == q ? \"same\" : \"different\"); Console.WriteLine(p);"],
      answer: 'int[] a = (Console.ReadLine() ?? "").Split(\' \').Select(int.Parse).ToArray();\nint[] b = (Console.ReadLine() ?? "").Split(\' \').Select(int.Parse).ToArray();\nvar p = new Point(a[0], a[1]);\nvar q = new Point(b[0], b[1]);\nConsole.WriteLine(p == q ? "same" : "different");\nConsole.WriteLine(p);\n\nrecord Point(int X, int Y);' }
  } });

  /* ================================================================
     7.7 Nullable reference types: why
     ================================================================ */
  lesson("7.7", {
    aqa: "4.1.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A reference can point nowhere: `null`. Use it as if it pointed somewhere and the program stops with NullReferenceException — the most common crash in C#.",
        "Its inventor called null his \"billion-dollar mistake\".",
        "Since C# 8 the compiler can track which references might be null. From this unit it is **on**: `string` means \"never null\", `string?` means \"might be null\", and the compiler **warns** where a null could slip through."
      ] },
      page("Core idea"),
      run("warn", "a warning before the program even runs", 'string? middle = FindMiddleName("Ada Lovelace");\nConsole.WriteLine(middle.Length);\n\nstring? FindMiddleName(string full)\n{\n    string[] parts = full.Split(\' \');\n    return parts.Length == 3 ? parts[1] : null;\n}', { fails: true }),
      { ul: [
        "The output panel shows **CS8602: Dereference of a possibly null reference** on line 2 — then the run fails exactly as warned.",
        "The compiler read the code's flow: `FindMiddleName` returns `string?`, nothing checked it, so `.Length` might hit null."
      ] },
      run("checked", "check, and the warning goes away", 'string? middle = FindMiddleName("Ada Byron Lovelace");\nif (middle != null)\n    Console.WriteLine(middle.Length);\nelse\n    Console.WriteLine("no middle name");\n\nstring? FindMiddleName(string full)\n{\n    string[] parts = full.Split(\' \');\n    return parts.Length == 3 ? parts[1] : null;\n}'),
      { ul: [ "After `if (middle != null)` the compiler knows `middle` is not null inside the branch (**flow analysis**)." ] },
      page("Rules"),
      { ul: [
        "`T` (a reference type) promises \"never null\"; `T?` says \"may be null\".",
        "Assigning null (or a `T?`) to a `T` warns: **CS8600** / **CS8625**.",
        "Using a member of a `T?` without a check warns: **CS8602**.",
        "Passing a `T?` where a `T` is wanted warns: **CS8604**.",
        "A non-nullable field or property must be given a value by the end of the constructor: **CS8618**.",
        "These are **warnings**: the program still compiles. Treat them as bugs the compiler found early.",
        "`Console.ReadLine()` returns `string?` — at the end of input it is null. That is why this unit writes `Console.ReadLine() ?? \"\"`."
      ] },
      { table: { head: ["Warning", "Says"], rows: [["CS8600", "a possible null put in a non-nullable variable"], ["CS8602", "a member used on something that may be null"], ["CS8604", "a possible null passed to a non-nullable parameter"], ["CS8618", "a non-nullable field left null after the constructor"], ["CS8625", "the null literal put in a non-nullable type"]] } },
      page("Variations"),
      { h: "The warning that saves a constructor" },
      run("ctor", "CS8618: Name must be set", 'var p = new Person();\nConsole.WriteLine(p.Name.Length);\n\nclass Person\n{\n    public string Name { get; set; }\n}', { fails: true }),
      { h: "Fixed by design" },
      run("fixed", "a constructor that sets it, or a safe default", 'var p = new Person("Kai");\nvar q = new Pet();\nConsole.WriteLine($"{p.Name.Length} {q.Name.Length}");\n\nclass Person\n{\n    public string Name { get; }\n    public Person(string name) => Name = name;\n}\nclass Pet\n{\n    public string Name { get; set; } = "";\n}'),
      { h: "Value types too" },
      run("int", "int? may hold no value", 'int? best = null;\nforeach (int s in new[] { 4, 9, 2 })\n    if (best == null || s > best) best = s;\nConsole.WriteLine(best);\nConsole.WriteLine(best.HasValue);'),
      page("Pitfalls"),
      { h: "Ignoring the warnings" },
      "The warnings list is not noise: each one names a line where the program can crash. Fix them as you go, or they pile up.",
      { h: "null in a non-nullable — and a real crash" },
      run("pit-null", "string name = null; warns, then name.Length throws", 'string name = null;\nConsole.WriteLine(name.Length);'),
      { h: "? on a value type is a different type — CS0266" },
      run("pit-int", "int? is not an int", 'int? maybe = 5;\nint sure = maybe;\nConsole.WriteLine(sure);'),
      page("Connections"),
      { ul: [ "**Back:** 6.1 NullReferenceException; 7.6 references.", "**Next:** 7.8 the operators that handle null: `?.`, `??`, `!`.", "**AQA:** 4.1.2.1 (references and null)." ] },
      page("Good practice"),
      { ul: [ "Make types non-nullable unless null genuinely means something (\"no middle name\").", "Initialise in the constructor; give strings `\"\"` and lists `new()` defaults.", "Read a warning as a question: \"what if it is null here?\"" ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Find a name* and *The best so far*." ] },
      page("Quick reference"),
      run("qr", "nullable at a glance", 'string sure = "always";\nstring? maybe = null;\nConsole.WriteLine(sure.Length);\nConsole.WriteLine(maybe == null ? "none" : maybe);'),
      { ul: [ "`T` never null · `T?` may be null.", "Check before use: `if (x != null)`.", "Warnings: 8600, 8602, 8604, 8618, 8625." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS8602", "possibly null dereference (warning)", "Core idea"], ["NullReferenceException", "it really was null", "Pitfalls"], ["CS0266", "int? cannot become int without a cast or a default", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'string? Find(string[] xs, char c)\n{\n    foreach (var x in xs) if (x.StartsWith(c)) return x;\n    return null;\n}\nvar names = new[] { "Ada", "Kai", "Lin" };\nstring? k = Find(names, \'K\');\nstring? z = Find(names, \'Z\');\nConsole.WriteLine(k ?? "-");\nConsole.WriteLine(z == null);', why: "Kai starts with K; nothing starts with Z, so null.", concepts: ["nullable-why"] },
        { id: "p2", src: 'int? total = null;\nforeach (var n in new[] { 3, 4 }) total = (total ?? 0) + n;\nConsole.WriteLine(total);', why: "null becomes 0 + 3, then 7.", concepts: ["nullable-why"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the variable may hold null without a warning.", src: '@@ nick = null;\nConsole.WriteLine(nick == null ? "no nickname" : nick);', out: "no nickname", concepts: ["nullable-why"] }
      ],
      bug: [
        { id: "b1", q: "It should print 0 when there is no first word starting with Q, instead of crashing.", src: 'string? FirstQ(string[] ws) { foreach (var w in ws) if (w.StartsWith(\'Q\')) return w; return null; }\nstring? q = FirstQ(new[] { "apple", "kiwi" });\nConsole.WriteLine(q.Length);', out: "0", fixedText: "prints 0", why: "q may be null (CS8602 warned): print q == null ? 0 : q.Length.", concepts: ["nullable-why"] }
      ]
    },
    flashcards: [
      ["`string` vs `string?` with nullable on?", "string: never null. string?: may be null."],
      ["What does CS8602 warn about?", "Using a member of something that may be null."],
      ["What does CS8618 warn about?", "A non-nullable field or property not set by the end of the constructor."],
      ["Do nullable warnings stop the program compiling?", "No — they are warnings; treat them as bugs found early."],
      ["What is flow analysis?", "The compiler follows checks like `if (x != null)` and knows x is not null after them."],
      ["Why `Console.ReadLine() ?? \"\"`?", "ReadLine returns string?: null at the end of input."]
    ],
    quiz: [
      { q: "`string? s = null; Console.WriteLine(s.Length);` gives…", opts: ["a compile error", "a CS8602 warning, then NullReferenceException", "0", "nothing"], ans: 1, why: "A warning at compile time, a crash at run time." },
      { q: "Which is the right type for \"a middle name that may not exist\"?", opts: ["string", "string?", "string!", "object"], ans: 1, why: "Null means something here." },
      { q: "After `if (x != null)`, inside the branch x is…", opts: ["still maybe null", "known not null", "an int", "copied"], ans: 1, why: "Flow analysis." }
    ]
  });
  K.add({ tasks: {
    "7.7-find": { lesson: "7.7", title: "Find a name", tier: "warm-up", minutes: 10, concepts: ["nullable-why"],
      statement: ["Write `string? FindLonger(string[] names, int min)` returning the first name longer than `min` letters, or null.", "Read names separated by spaces, then `min`. Print the name, or `none` — with no nullable warnings."],
      starter: 'string[] names = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nint min = int.Parse(Console.ReadLine() ?? "");\n',
      examples: [{ stdin: "Ada Kai Lovelace\n3", out: "Lovelace" }],
      hidden: [{ stdin: "Ada Kai\n5", out: "none" }, { stdin: "Zed Quinn\n2", out: "Zed" }],
      rules: [uses(/string\?\s+FindLonger\s*\(/, "Return string? from FindLonger.")],
      hints: ["foreach (var n in names) if (n.Length > min) return n; return null;", "string? found = FindLonger(names, min);", "Console.WriteLine(found ?? \"none\"); or check found != null."],
      answer: 'string[] names = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nint min = int.Parse(Console.ReadLine() ?? "");\nstring? found = FindLonger(names, min);\nConsole.WriteLine(found != null ? found : "none");\n\nstring? FindLonger(string[] names, int min)\n{\n    foreach (var n in names) if (n.Length > min) return n;\n    return null;\n}' },
    "7.7-best": { lesson: "7.7", title: "The best so far", tier: "core", minutes: 15, concepts: ["nullable-why"],
      statement: ["Read whole numbers, one per line, until the end. Keep the highest in an `int?` that starts as null.", "Print `best B`, or `no scores` if there were none."],
      starter: "",
      examples: [{ stdin: "4\n11\n7", out: "best 11" }],
      hidden: [{ stdin: "", out: "no scores" }, { stdin: "-5\n-9", out: "best -5" }],
      rules: [uses(/int\?\s+\w+\s*=\s*null/, "Start with an int? set to null.")],
      hints: ["int? best = null;", "if (best == null || n > best) best = n;", "Console.WriteLine(best == null ? \"no scores\" : $\"best {best}\");"],
      answer: 'int? best = null;\nstring? line;\nwhile ((line = Console.ReadLine()) != null && line != "")\n{\n    int n = int.Parse(line);\n    if (best == null || n > best) best = n;\n}\nConsole.WriteLine(best == null ? "no scores" : $"best {best}");' }
  } });

  /* ================================================================
     7.8 Nullable in practice: ?, ! and ??
     ================================================================ */
  lesson("7.8", {
    aqa: "4.1.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Checking `if (x != null)` before every use is safe but long.",
        "C# has short operators for the common cases: **?.** (use it if it is there), **??** (or this instead), **??=** (set it if it is missing) and **!** (I promise it is not null).",
        "And input: `Console.ReadLine()` is `string?` — at the end of input it is null — so reading correctly now means deciding what null means."
      ] },
      page("Core idea"),
      run("ops", "?. and ?? together", 'string? nick = null;\nConsole.WriteLine(nick?.Length);\nConsole.WriteLine(nick?.Length ?? 0);\nnick ??= "friend";\nConsole.WriteLine($"Hello, {nick}!");'),
      { ul: [
        "`nick?.Length` is null when nick is null (the line is empty), the length otherwise.",
        "`a ?? b` is a unless a is null, then b.",
        "`x ??= v` sets x to v only if x is null."
      ] },
      run("input", "reading input correctly", 'string name = Console.ReadLine() ?? "";\nif (name.Length == 0) Console.WriteLine("No name given.");\nelse Console.WriteLine($"Hi {name}");\nstring? age = Console.ReadLine();\nConsole.WriteLine(age is null ? "no more input" : "age " + age);', "Ada"),
      page("Rules"),
      { ul: [
        "`x?.M()` calls M only when x is not null; the result is nullable.",
        "`x?[i]` indexes only when x is not null.",
        "`a ?? b`: the first non-null of the two. Chains: `a ?? b ?? c`.",
        "`x ??= v`: assign if null.",
        "`x!` (the null-forgiving operator) silences the warning. It checks nothing: if x is null it still crashes. Use it only when you know more than the compiler.",
        "`is null` / `is not null` test for null and cannot be fooled by an overloaded ==.",
        "For input: `?? \"\"` when an empty answer is fine; `?? throw new …` when input is required; a loop `while ((line = Console.ReadLine()) != null)` to read until the end."
      ] },
      { table: { head: ["Operator", "Means", "Example"], rows: [["?.", "member if not null", "name?.Length"], ["??", "or this if null", "name ?? \"anon\""], ["??=", "set if null", "cache ??= Load()"], ["!", "trust me (no check)", "ReadLine()!"], ["is null", "null test", "if (x is null)"]] } },
      page("Variations"),
      { h: "Required input: ?? throw" },
      run("throw", "fail clearly instead of carrying null onwards", 'try\n{\n    string id = Console.ReadLine() ?? throw new InvalidOperationException("An id is required.");\n    Console.WriteLine(id);\n}\ncatch (InvalidOperationException e)\n{\n    Console.WriteLine(e.Message);\n}'),
      { h: "A chain through objects" },
      run("chain", "?. down a chain stops at the first null", 'var a = new Order { Customer = new Customer { Email = "ada@example.com" } };\nvar b = new Order();\nConsole.WriteLine(a.Customer?.Email?.ToUpper() ?? "no email");\nConsole.WriteLine(b.Customer?.Email?.ToUpper() ?? "no email");\n\nclass Order { public Customer? Customer { get; set; } }\nclass Customer { public string? Email { get; set; } }'),
      { h: "Reading to the end" },
      run("loop", "while ReadLine is not null", 'int total = 0;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null)\n    total += int.Parse(line);\nConsole.WriteLine(total);', "3\n4\n5"),
      page("Pitfalls"),
      { h: "! hides the warning, not the null" },
      run("pit-bang", "the promise was wrong", 'string? s = null;\nConsole.WriteLine(s!.Length);'),
      { h: "?? needs compatible types — CS0019" },
      run("pit-types", "a string ?? an int does not mix", 'string? s = null;\nvar x = s ?? 0;\nConsole.WriteLine(x);'),
      { h: "?. gives a nullable result — CS0266" },
      run("pit-result", "s?.Length is an int?, not an int", 'string? s = "hi";\nint n = s?.Length;\nConsole.WriteLine(n);'),
      page("Connections"),
      { ul: [ "**Back:** 7.7 why null is tracked; 1.6 and 5.4 read input (now with ??).", "**Next:** 7.10 a model that never holds null; 9.x LINQ's FirstOrDefault returns T?.", "**AQA:** 4.1.2.1." ] },
      page("Good practice"),
      { ul: [ "Pick the meaning of null at the edge (input, lookups) and keep the inside of the program non-nullable.", "Prefer `??` and `?.` to `!`.", "Use `is null` for null checks." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Greet with a default* and *Sum until the end*." ] },
      page("Quick reference"),
      run("qr", "the operators at a glance", 'string? a = null;\nstring? b = "x";\nConsole.WriteLine(a ?? b ?? "z");\nConsole.WriteLine(a?.Length ?? -1);\na ??= "set";\nConsole.WriteLine(a is null ? "null" : a);'),
      { ul: [ "`?.` `??` `??=` `!` `is null`.", "Input: `ReadLine() ?? \"\"`, `?? throw`, or loop until null." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["NullReferenceException", "! promised wrongly", "Pitfalls"], ["CS0019", "?? on types that do not match", "Pitfalls"], ["CS0266", "a nullable result put in a non-nullable", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'string? a = null;\nstring? b = null;\nstring c = "c";\nConsole.WriteLine(a ?? b ?? c);\nb ??= "b";\nConsole.WriteLine(a ?? b ?? c);', why: "First all null but c; then b is set and wins.", concepts: ["nullable-ops"] },
        { id: "p2", src: 'string? s = null;\nConsole.WriteLine((s?.Length ?? 0) + 1);\ns = "four";\nConsole.WriteLine((s?.Length ?? 0) + 1);', why: "0 + 1, then 4 + 1.", concepts: ["nullable-ops"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the operator that gives \"guest\" when name is null.", src: 'string? name = null;\nConsole.WriteLine(name @@ "guest");', out: "guest", concepts: ["nullable-ops"] }
      ],
      bug: [
        { id: "b1", q: "With no input it should print \"nothing\", not crash.", src: 'string line = Console.ReadLine()!;\nConsole.WriteLine(line.Length == 0 ? "nothing" : line);', out: "nothing", fixedText: "prints nothing", why: "! hid the null; use Console.ReadLine() ?? \"\" instead.", concepts: ["nullable-ops"] }
      ]
    },
    flashcards: [
      ["What does `x?.Length` give when x is null?", "null (an int? with no value)."],
      ["`a ?? b` means…", "a, unless a is null — then b."],
      ["`x ??= v` means…", "Set x to v only if x is null."],
      ["What does `x!` check?", "Nothing — it only silences the warning."],
      ["Read until the end of input?", "`while ((line = Console.ReadLine()) is not null)`."],
      ["Required input that is missing?", "`Console.ReadLine() ?? throw new InvalidOperationException(...)`."]
    ],
    quiz: [
      { q: "`string? s = null; int n = s?.Length ?? -1;` n is…", opts: ["0", "-1", "null", "an error"], ans: 1, why: "?. gives null, ?? gives -1." },
      { q: "Which can still crash with NullReferenceException?", opts: ["s?.Length", "s ?? \"\"", "s!.Length", "s is null"], ans: 2, why: "! checks nothing." },
      { q: "The safest default for a name you may display empty?", opts: ["ReadLine()!", "ReadLine() ?? \"\"", "(string)ReadLine()", "ReadLine().ToString()"], ans: 1, why: "Null becomes an empty string on purpose." }
    ]
  });
  K.add({ tasks: {
    "7.8-greet": { lesson: "7.8", title: "Greet with a default", tier: "warm-up", minutes: 10, concepts: ["nullable-ops"],
      statement: ["Read a name and a title, one per line; either may be missing (end of input) or blank.", "Print `Hello, TITLE NAME!` — a missing or blank name is `friend`, a missing or blank title is left out. Do not use `!`."],
      starter: "",
      examples: [{ stdin: "Ada\nDr", out: "Hello, Dr Ada!" }, { stdin: "Kai", out: "Hello, Kai!" }],
      hidden: [{ stdin: "", out: "Hello, friend!" }, { stdin: "\nProf", out: "Hello, Prof friend!" }],
      rules: [uses(/\?\?/, "Use ?? for the defaults."), noUse(/!\s*;|\)!/, "No null-forgiving ! — decide what null means.", "bang")],
      hints: ["string name = Console.ReadLine() ?? \"\";", "if (name.Trim() == \"\") name = \"friend\";", "string title = (Console.ReadLine() ?? \"\").Trim(); then add title + \" \" only if it is not empty."],
      answer: 'string name = (Console.ReadLine() ?? "").Trim();\nstring title = (Console.ReadLine() ?? "").Trim();\nif (name == "") name = "friend";\nConsole.WriteLine($"Hello, {(title == "" ? "" : title + " ")}{name}!");' },
    "7.8-sum": { lesson: "7.8", title: "Sum until the end", tier: "core", minutes: 15, concepts: ["nullable-ops"],
      statement: ["Read lines until ReadLine returns null. Each line is a whole number or junk. Add the numbers; count the junk lines.", "Print `sum S, skipped K`."],
      starter: "",
      examples: [{ stdin: "4\nx\n6", out: "sum 10, skipped 1" }],
      hidden: [{ stdin: "", out: "sum 0, skipped 0" }, { stdin: "a\nb\n-3", out: "sum -3, skipped 2" }],
      rules: [uses(/is\s+not\s+null|!=\s*null/, "Loop until ReadLine returns null.")],
      hints: ["string? line;", "while ((line = Console.ReadLine()) is not null) { … }", "if (int.TryParse(line, out int n)) sum += n; else skipped++;"],
      answer: 'int sum = 0, skipped = 0;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null)\n{\n    if (int.TryParse(line, out int n)) sum += n;\n    else skipped++;\n}\nConsole.WriteLine($"sum {sum}, skipped {skipped}");' }
  } });

  /* ================================================================
     7.9 Enums and flags
     ================================================================ */
  lesson("7.9", {
    aqa: "4.1.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "An order's status as a string invites typos: `\"shiped\"` compiles and never matches.",
        "As an int (0 = new, 1 = paid…) nobody remembers what 3 means.",
        "An **enum** names a fixed set of options; the compiler then knows every valid value. A **[Flags]** enum stores several options at once in one value."
      ] },
      page("Core idea"),
      run("enum", "a named set of states", 'var s = Status.Paid;\nConsole.WriteLine(s);\nConsole.WriteLine(s == Status.Paid);\nConsole.WriteLine((int)Status.Shipped);\n\nenum Status { New, Paid, Shipped, Cancelled }'),
      { ul: [ "Each name has a number underneath (0, 1, 2…), but the code uses the names; printing shows the name." ] },
      run("switch", "a switch expression over an enum", 'foreach (var s in Enum.GetValues<Status>())\n    Console.WriteLine($"{s}: {Describe(s)}");\n\nstring Describe(Status s) => s switch\n{\n    Status.New => "waiting for payment",\n    Status.Paid => "being packed",\n    Status.Shipped => "on its way",\n    Status.Cancelled => "stopped",\n    _ => "unknown"\n};\n\nenum Status { New, Paid, Shipped, Cancelled }'),
      page("Rules"),
      { ul: [
        "`enum Name { A, B, C }` declares the type; values are `Name.A`.",
        "Underneath each is an int starting at 0; you may set them: `{ Low = 1, High = 10 }`.",
        "`(int)value` gives the number; `(Name)3` turns a number back (even an undefined one — check with `Enum.IsDefined`).",
        "`Enum.Parse<Name>(\"Paid\")` and `Enum.TryParse<Name>(text, out var v)` read a name from text.",
        "`Enum.GetValues<Name>()` lists them all.",
        "**[Flags]**: give each option its own bit (1, 2, 4, 8…), combine with `|`, test with `HasFlag` or `&`."
      ] },
      { table: { head: ["Code", "Does"], rows: [["Status.Paid", "one value"], ["(int)Status.Paid", "its number"], ["Enum.TryParse<Status>(s, out var v)", "text to value"], ["Read | Write", "both flags"], ["p.HasFlag(Perm.Write)", "is that flag set?"], ["p & ~Perm.Write", "clear one flag"]] } },
      page("Variations"),
      { h: "[Flags]: several at once" },
      run("flags", "permissions as bits", 'var p = Perm.Read | Perm.Write;\nConsole.WriteLine(p);\nConsole.WriteLine(p.HasFlag(Perm.Write));\nConsole.WriteLine(p.HasFlag(Perm.Delete));\np |= Perm.Delete;\np &= ~Perm.Write;\nConsole.WriteLine(p);\nConsole.WriteLine((int)p);\n\n[Flags]\nenum Perm { None = 0, Read = 1, Write = 2, Delete = 4 }'),
      { ul: [ "12.2 shows the bits themselves: 1 = 001, 2 = 010, 4 = 100." ] },
      { h: "Reading an enum from input" },
      run("parse", "TryParse, ignoring case", 'foreach (var text in new[] { "paid", "Shipped", "lost" })\n{\n    if (Enum.TryParse<Status>(text, true, out var s)) Console.WriteLine($"{text} -> {s}");\n    else Console.WriteLine($"{text} -> not a status");\n}\n\nenum Status { New, Paid, Shipped, Cancelled }'),
      { h: "An enum inside a class" },
      run("inclass", "state changes only by the rules", 'var o = new Order();\nConsole.WriteLine(o.Pay());\nConsole.WriteLine(o.Pay());\nConsole.WriteLine(o.State);\n\nclass Order\n{\n    public Status State { get; private set; } = Status.New;\n    public string Pay()\n    {\n        if (State != Status.New) return $"cannot pay when {State}";\n        State = Status.Paid;\n        return "paid";\n    }\n}\nenum Status { New, Paid, Shipped, Cancelled }'),
      page("Pitfalls"),
      { h: "An int is not an enum — CS0266" },
      run("pit-int", "cast on purpose", 'Status s = 2;\n\nenum Status { New, Paid, Shipped }'),
      { h: "Flags that are not powers of two" },
      run("pit-bits", "Write = 3 overlaps Read = 1 and 2", 'var p = Perm.Write;\nConsole.WriteLine(p.HasFlag(Perm.Read));\nConsole.WriteLine(p.HasFlag(Perm.Admin));\n\n[Flags]\nenum Perm { Read = 1, Admin = 2, Write = 3 }'),
      { h: "A cast to an undefined value" },
      "`(Status)42` compiles and runs, and prints 42. Check text with TryParse and numbers with Enum.IsDefined.",
      page("Connections"),
      { ul: [ "**Back:** 2.4 switch expressions; 7.2 states a class keeps valid.", "**Next:** 7.10 an account's state; 12.2 the bit operations behind [Flags].", "**AQA:** 4.1.2.1 (user-defined types)." ] },
      page("Good practice"),
      { ul: [ "Use an enum whenever a value is one of a short fixed list.", "Singular names (`Status`), plural for [Flags] (`Permissions`).", "Always give [Flags] a `None = 0`." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Traffic lights* and *Permissions*." ] },
      page("Quick reference"),
      run("qr", "enums at a glance", 'var d = Day.Sat;\nConsole.WriteLine(d is Day.Sat or Day.Sun ? "weekend" : "weekday");\nConsole.WriteLine((int)d);\n\nenum Day { Mon, Tue, Wed, Thu, Fri, Sat, Sun }'),
      { ul: [ "`enum T { A, B }`, `T.A`, `(int)`, `Enum.TryParse`.", "[Flags]: 1, 2, 4; `|`, `HasFlag`, `& ~`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0266", "an int used as an enum without a cast", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var c = Colour.Green;\nc++;\nConsole.WriteLine(c);\nConsole.WriteLine((int)Colour.Blue);\n\nenum Colour { Red, Green, Blue }', why: "Green + 1 is Blue; Blue is 2.", concepts: ["enums"] },
        { id: "p2", src: 'var f = Style.Bold | Style.Italic;\nConsole.WriteLine((int)f);\nConsole.WriteLine(f.HasFlag(Style.Under));\n\n[Flags]\nenum Style { None = 0, Bold = 1, Italic = 2, Under = 4 }', why: "1 | 2 = 3; Under (4) is not set.", concepts: ["flags"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to combine both flags.", src: 'var p = Perm.Read @@ Perm.Write;\nConsole.WriteLine(p);\n\n[Flags]\nenum Perm { None = 0, Read = 1, Write = 2 }', out: "Read, Write", concepts: ["flags"] }
      ],
      bug: [
        { id: "b1", q: "\"Paid\" typed in lower case should still work: it should print Paid.", src: 'Enum.TryParse<Status>("paid", out var s);\nConsole.WriteLine(s);\n\nenum Status { New, Paid }', out: "Paid", fixedText: "prints Paid", why: "Pass ignoreCase: Enum.TryParse<Status>(\"paid\", true, out var s).", concepts: ["enums"] }
      ]
    },
    flashcards: [
      ["What is an enum?", "A type with a fixed set of named values, each an int underneath."],
      ["What do enum values number from by default?", "0, then 1, 2…"],
      ["Text to an enum safely?", "`Enum.TryParse<T>(text, true, out var v)` (true = ignore case)."],
      ["Why must [Flags] values be 1, 2, 4, 8…?", "Each needs its own bit so they can combine without overlapping."],
      ["Combine and test flags?", "`a | b` to combine, `x.HasFlag(a)` to test."],
      ["Clear one flag?", "`x &= ~Flag`."]
    ],
    quiz: [
      { q: "`enum S { A, B, C }` — `(int)S.C` is…", opts: ["1", "2", "3", "C"], ans: 1, why: "A is 0." },
      { q: "`Status s = 2;` gives…", opts: ["Shipped", "CS0266", "0", "a warning"], ans: 1, why: "An int needs an explicit cast to an enum." },
      { q: "With [Flags] Read=1, Write=2: `(Read | Write).ToString()` is…", opts: ["3", "\"Read, Write\"", "\"Write\"", "an error"], ans: 1, why: "[Flags] prints the set names." }
    ]
  });
  K.add({ tasks: {
    "7.9-lights": { lesson: "7.9", title: "Traffic lights", tier: "warm-up", minutes: 10, concepts: ["enums"],
      statement: ["Declare `enum Light { Red, RedAmber, Green, Amber }` and a method `Light Next(Light l)` that steps in that order and wraps back to Red.", "Read a starting light name (any case) and a number of steps. Print the light reached, or `unknown light`."],
      starter: 'string start = Console.ReadLine() ?? "";\nint steps = int.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "green\n2", out: "Red" }],
      hidden: [{ stdin: "Red\n1", out: "RedAmber" }, { stdin: "blue\n1", out: "unknown light" }, { stdin: "Amber\n9", out: "Red" }],
      rules: [uses(/enum\s+Light\b/, "Declare enum Light."), uses(/Enum\.TryParse/, "Read the name with Enum.TryParse.", "parse")],
      hints: ["Light Next(Light l) => l == Light.Amber ? Light.Red : l + 1;", "if (!Enum.TryParse<Light>(start, true, out var l)) { … return; }", "for (int i = 0; i < steps; i++) l = Next(l);"],
      answer: 'string start = Console.ReadLine() ?? "";\nint steps = int.Parse(Console.ReadLine() ?? "0");\nif (!Enum.TryParse<Light>(start, true, out var l))\n{\n    Console.WriteLine("unknown light");\n    return;\n}\nfor (int i = 0; i < steps; i++) l = Next(l);\nConsole.WriteLine(l);\n\nLight Next(Light l) => l == Light.Amber ? Light.Red : l + 1;\n\nenum Light { Red, RedAmber, Green, Amber }' },
    "7.9-perm": { lesson: "7.9", title: "Permissions", tier: "core", minutes: 15, concepts: ["flags"],
      statement: ["Declare `[Flags] enum Perm { None = 0, Read = 1, Write = 2, Delete = 4 }`. Start with None.", "Read lines `+Name` (grant) or `-Name` (revoke) until the end. Print the final value (its ToString) and then its number."],
      starter: "",
      examples: [{ stdin: "+Read\n+Write\n-Read", out: "Write\n2" }],
      hidden: [{ stdin: "", out: "None\n0" }, { stdin: "+Delete\n+Read", out: "Read, Delete\n5" }],
      rules: [uses(/\[Flags\]/, "Mark the enum [Flags]."), uses(/~/, "Revoke with & ~flag.", "clear")],
      hints: ["var p = Perm.None;", "var f = Enum.Parse<Perm>(line.Substring(1));", "if (line[0] == '+') p |= f; else p &= ~f;"],
      answer: 'var p = Perm.None;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var f = Enum.Parse<Perm>(line.Substring(1));\n    if (line[0] == \'+\') p |= f;\n    else p &= ~f;\n}\nConsole.WriteLine(p);\nConsole.WriteLine((int)p);\n\n[Flags]\nenum Perm { None = 0, Read = 1, Write = 2, Delete = 4 }' }
  } });

  /* ================================================================
     7.10 Practise: a bank account
     ================================================================ */
  lesson("7.10", {
    aqa: "4.1.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "This lesson puts the unit together on one model: a bank account.",
        "The goal is a type that **cannot reach an invalid state**: no negative balance, no nameless owner, no deposits into a closed account — however it is called.",
        "If the rules live inside the class, every program that uses it gets them for free."
      ] },
      page("Core idea"),
      run("account", "the whole model", 'var acc = new Account("Ada", 100m);\nacc.Deposit(50m);\nConsole.WriteLine(acc.TryWithdraw(500m));\nConsole.WriteLine(acc.TryWithdraw(30m));\nConsole.WriteLine(acc);\n\nclass Account\n{\n    public string Owner { get; }\n    public decimal Balance { get; private set; }\n    public AccountState State { get; private set; } = AccountState.Open;\n\n    public Account(string owner, decimal opening)\n    {\n        if (string.IsNullOrWhiteSpace(owner)) throw new ArgumentException("An account needs an owner.", nameof(owner));\n        if (opening < 0) throw new ArgumentOutOfRangeException(nameof(opening));\n        Owner = owner;\n        Balance = opening;\n    }\n\n    public void Deposit(decimal amount)\n    {\n        if (State != AccountState.Open) throw new InvalidOperationException("The account is closed.");\n        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));\n        Balance += amount;\n    }\n\n    public bool TryWithdraw(decimal amount)\n    {\n        if (State != AccountState.Open || amount <= 0 || amount > Balance) return false;\n        Balance -= amount;\n        return true;\n    }\n\n    public override string ToString() => $"{Owner}: {Balance:F2} ({State})";\n}\n\nenum AccountState { Open, Closed }'),
      { ul: [
        "Constructor: refuses a bad start (7.2). Properties: read anywhere, written only inside (7.3). An enum for the state (7.9).",
        "`ToString()` is overridden so printing the object reads well (8.2 explains `override`)."
      ] },
      page("Rules"),
      { ul: [
        "Every way to change the state is a method that checks first.",
        "Choose how to say no: throw for a programming mistake (a negative deposit), return false for an ordinary refusal (not enough money) — a `Try` method.",
        "Money is `decimal` (1.x): no binary rounding errors.",
        "Keep a history if the rules need it; keep it private and expose a read-only view (`IReadOnlyList<T>`).",
        "Statics for what is shared: the next account number, the overdraft rule."
      ] },
      page("Variations"),
      { h: "A history the caller cannot change" },
      run("history", "IReadOnlyList over a private list", 'var acc = new Account("Kai");\nacc.Deposit(20m);\nacc.Deposit(5m);\nforeach (var t in acc.History) Console.WriteLine(t);\nConsole.WriteLine(acc.History.Count);\n\nclass Account\n{\n    private readonly List<string> history = new();\n    public string Owner { get; }\n    public decimal Balance { get; private set; }\n    public IReadOnlyList<string> History => history;\n    public Account(string owner) => Owner = owner;\n    public void Deposit(decimal m)\n    {\n        Balance += m;\n        history.Add($"+{m:F2} = {Balance:F2}");\n    }\n}'),
      { h: "Numbered accounts" },
      run("numbers", "a static counter hands out numbers", 'var a = new Account("Ada");\nvar b = new Account("Kai");\nConsole.WriteLine($"{a.Number} {b.Number}");\n\nclass Account\n{\n    private static int next = 10001;\n    public int Number { get; } = next++;\n    public string Owner { get; }\n    public Account(string owner) => Owner = owner;\n}'),
      { h: "Closing" },
      run("close", "after Close, deposits are refused", 'var acc = new Account();\nacc.Close();\ntry { acc.Deposit(10m); }\ncatch (InvalidOperationException e) { Console.WriteLine(e.Message); }\n\nclass Account\n{\n    public bool IsOpen { get; private set; } = true;\n    public decimal Balance { get; private set; }\n    public void Close() => IsOpen = false;\n    public void Deposit(decimal m)\n    {\n        if (!IsOpen) throw new InvalidOperationException("Closed accounts take no deposits.");\n        Balance += m;\n    }\n}'),
      page("Pitfalls"),
      { h: "A public setter undoes everything — and the compiler cannot help" },
      run("pit-public", "Balance { get; set; } lets anyone go negative", 'var acc = new Account();\nacc.Balance = -1000m;\nConsole.WriteLine(acc.Balance);\n\nclass Account { public decimal Balance { get; set; } }'),
      { h: "Returning the private list itself — CS1061 when it is read-only" },
      run("pit-ro", "IReadOnlyList has no Add", 'var acc = new Account();\nacc.History.Add("hack");\n\nclass Account\n{\n    private readonly List<string> history = new();\n    public IReadOnlyList<string> History => history;\n}'),
      { h: "double for money" },
      run("pit-double", "0.1 + 0.2 in double", 'double d = 0.1 + 0.2;\ndecimal m = 0.1m + 0.2m;\nConsole.WriteLine(d == 0.3);\nConsole.WriteLine(m == 0.3m);'),
      page("Connections"),
      { ul: [ "**Back:** 7.2 constructors, 7.3 properties, 7.4 statics, 7.9 enums, 6.5 exceptions.", "**Next:** 8.x a SavingsAccount that inherits; capstone 3 builds a bigger model.", "**AQA:** 4.1.2.1 encapsulation, objects and state." ] },
      page("Good practice"),
      { ul: [ "Write the rules first (the invariants), then one method per action that keeps them.", "Expose the least: get-only properties, read-only views, Try methods.", "Test the edges: zero, negative, exactly the balance, after closing." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Run the account* and *A savings goal*." ] },
      page("Quick reference"),
      run("qr", "the pattern at a glance", 'var w = new Wallet(10m);\nConsole.WriteLine(w.TrySpend(4m));\nConsole.WriteLine(w.TrySpend(7m));\nConsole.WriteLine(w.Cash);\n\nclass Wallet\n{\n    public decimal Cash { get; private set; }\n    public Wallet(decimal cash) => Cash = cash >= 0 ? cash : throw new ArgumentOutOfRangeException(nameof(cash));\n    public bool TrySpend(decimal m)\n    {\n        if (m <= 0 || m > Cash) return false;\n        Cash -= m;\n        return true;\n    }\n}'),
      { ul: [ "Validate in the constructor; private set; one checking method per action.", "Throw for misuse, return false for refusal.", "decimal for money." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1061", "the read-only view has no Add", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var w = new Jar(5);\nw.Add(3);\nConsole.WriteLine(w.TryTake(10));\nConsole.WriteLine(w.TryTake(8));\nConsole.WriteLine(w.Coins);\n\nclass Jar\n{\n    public int Coins { get; private set; }\n    public Jar(int c) => Coins = c;\n    public void Add(int c) => Coins += c;\n    public bool TryTake(int c) { if (c > Coins) return false; Coins -= c; return true; }\n}', why: "8 coins: taking 10 fails, taking 8 succeeds, 0 left.", concepts: ["model-state"] },
        { id: "p2", src: 'var a = new Acc();\nConsole.WriteLine(a);\n\nclass Acc\n{\n    public decimal Balance { get; private set; } = 12.5m;\n    public override string ToString() => $"Balance {Balance:F2}";\n}', why: "Printing an object calls its ToString.", concepts: ["model-state"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so callers can read Balance but not set it.", src: 'var a = new Acc();\na.Add(5m);\nConsole.WriteLine(a.Balance);\n\nclass Acc\n{\n    public decimal Balance { get; @@ }\n    public void Add(decimal m) => Balance += m;\n}', out: "5", concepts: ["encapsulation"] }
      ],
      bug: [
        { id: "b1", q: "Withdrawing more than the balance should be refused: it should print False then 40.", src: 'var a = new Account(40m);\nConsole.WriteLine(a.TryWithdraw(60m));\nConsole.WriteLine(a.Balance);\n\nclass Account\n{\n    public decimal Balance { get; private set; }\n    public Account(decimal b) => Balance = b;\n    public bool TryWithdraw(decimal m) { Balance -= m; return Balance >= 0; }\n}', out: "False\n40", fixedText: "prints False then 40", why: "Check before changing: if (m > Balance) return false; then subtract.", concepts: ["model-state"] }
      ]
    },
    flashcards: [
      ["What does \"cannot reach an invalid state\" mean?", "Every constructor and method keeps the rules, whatever the caller does."],
      ["Throw or return false?", "Throw for misuse (bugs); return false (a Try method) for ordinary refusals."],
      ["Why decimal for money?", "No binary rounding: 0.1m + 0.2m == 0.3m."],
      ["How to expose a private list safely?", "As IReadOnlyList<T> — callers can read but not Add."],
      ["What does overriding ToString give?", "A readable string when the object is printed."],
      ["Where should the account's rules live?", "Inside the class, so every user gets them."]
    ],
    quiz: [
      { q: "Which property lets a bad caller break an account?", opts: ["Balance { get; private set; }", "Balance { get; set; }", "Balance { get; }", "Balance => total"], ans: 1, why: "A public setter skips every rule." },
      { q: "Not enough money is best reported by…", opts: ["throwing Exception", "returning false from TryWithdraw", "setting Balance negative", "printing inside the class"], ans: 1, why: "It is an ordinary outcome, not a bug." },
      { q: "`0.1 + 0.2 == 0.3` with doubles is…", opts: ["True", "False", "an error", "it depends on the machine"], ans: 1, why: "Binary floating point cannot hold 0.1 exactly." }
    ]
  });
  K.add({ tasks: {
    "7.10-run": { lesson: "7.10", title: "Run the account", tier: "core", minutes: 20, concepts: ["model-state", "encapsulation"],
      statement: ["Write `Account` with an owner and an opening balance (throw for a blank owner or negative opening), `Deposit` (throws for amount ≤ 0), `TryWithdraw` (false if more than the balance) and a `Balance { get; private set; }`.", "Read the owner and the opening balance, then commands `d AMOUNT` or `w AMOUNT` until the end. For each, print `ok`, `refused` (a failed withdrawal) or `error` (an exception). Finally print `OWNER: BALANCE` with 2 decimals."],
      starter: 'string owner = Console.ReadLine() ?? "";\ndecimal opening = decimal.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "Ada\n100\nd 50\nw 500\nw 30\nd -5", out: "ok\nrefused\nok\nerror\nAda: 120.00" }],
      hidden: [{ stdin: "Kai\n0\nw 1\nd 1.25", out: "refused\nok\nKai: 1.25" }, { stdin: "Lin\n10", out: "Lin: 10.00" }],
      rules: [uses(/class\s+Account\b/, "Write the class Account."), uses(/private\s+set/, "Keep Balance's setter private.", "priv"), uses(/TryWithdraw/, "Give Account a TryWithdraw method.", "try")],
      hints: ["Constructor checks; Deposit throws ArgumentOutOfRangeException for amount <= 0.", "public bool TryWithdraw(decimal m) { if (m <= 0 || m > Balance) return false; Balance -= m; return true; }", "Read commands with string? line; while ((line = Console.ReadLine()) is not null && line != \"\") …; wrap each in try/catch."],
      answer: 'string owner = Console.ReadLine() ?? "";\ndecimal opening = decimal.Parse(Console.ReadLine() ?? "0");\nvar acc = new Account(owner, opening);\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    decimal m = decimal.Parse(p[1]);\n    try\n    {\n        if (p[0] == "d") { acc.Deposit(m); Console.WriteLine("ok"); }\n        else Console.WriteLine(acc.TryWithdraw(m) ? "ok" : "refused");\n    }\n    catch (ArgumentException) { Console.WriteLine("error"); }\n}\nConsole.WriteLine($"{acc.Owner}: {acc.Balance:F2}");\n\nclass Account\n{\n    public string Owner { get; }\n    public decimal Balance { get; private set; }\n    public Account(string owner, decimal opening)\n    {\n        if (string.IsNullOrWhiteSpace(owner)) throw new ArgumentException("An account needs an owner.", nameof(owner));\n        if (opening < 0) throw new ArgumentOutOfRangeException(nameof(opening));\n        Owner = owner;\n        Balance = opening;\n    }\n    public void Deposit(decimal amount)\n    {\n        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));\n        Balance += amount;\n    }\n    public bool TryWithdraw(decimal amount)\n    {\n        if (amount <= 0 || amount > Balance) return false;\n        Balance -= amount;\n        return true;\n    }\n}' },
    "7.10-goal": { lesson: "7.10", title: "A savings goal", tier: "stretch", minutes: 25, concepts: ["model-state", "enums"],
      statement: ["Write `Goal` with a name, a target (> 0) and a `Saved` amount; `Add(decimal)` adds money (amounts ≤ 0 are ignored) and a computed `State` of an enum `Progress { NotStarted, Saving, Reached }`.", "Read the name and target, then amounts one per line until the end. After each amount print the state. Finally print `NAME: SAVED/TARGET` with 2 decimals."],
      starter: 'string name = Console.ReadLine() ?? "";\ndecimal target = decimal.Parse(Console.ReadLine() ?? "1");\n',
      examples: [{ stdin: "Bike\n100\n0\n40\n70", out: "NotStarted\nSaving\nReached\nBike: 110.00/100.00" }],
      hidden: [{ stdin: "Book\n12", out: "Book: 0.00/12.00" }, { stdin: "Trip\n50\n-5\n50", out: "NotStarted\nReached\nTrip: 50.00/50.00" }],
      rules: [uses(/enum\s+Progress\b/, "Declare enum Progress."), uses(/State\s*=>/, "Make State a computed property.", "state")],
      hints: ["public Progress State => Saved >= Target ? Progress.Reached : Saved > 0 ? Progress.Saving : Progress.NotStarted;", "public void Add(decimal m) { if (m > 0) Saved += m; }", "Print g.State after each Add."],
      answer: 'string name = Console.ReadLine() ?? "";\ndecimal target = decimal.Parse(Console.ReadLine() ?? "1");\nvar g = new Goal(name, target);\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    g.Add(decimal.Parse(line));\n    Console.WriteLine(g.State);\n}\nConsole.WriteLine($"{g.Name}: {g.Saved:F2}/{g.Target:F2}");\n\nclass Goal\n{\n    public string Name { get; }\n    public decimal Target { get; }\n    public decimal Saved { get; private set; }\n    public Goal(string name, decimal target)\n    {\n        if (target <= 0) throw new ArgumentOutOfRangeException(nameof(target));\n        Name = name;\n        Target = target;\n    }\n    public void Add(decimal m) { if (m > 0) Saved += m; }\n    public Progress State => Saved >= Target ? Progress.Reached : Saved > 0 ? Progress.Saving : Progress.NotStarted;\n}\n\nenum Progress { NotStarted, Saving, Reached }' }
  } });

  /* ================================================================
     retrieval cards (skill cards) for unit 7
     ================================================================ */
  K.add({ cards: {
    "u7-ref": { title: "One object or two?", lesson: "7.6", concepts: ["references", "equality"], kind: "predict",
      vary: function (r, n) {
        var a = 1 + r(9), b = 10 + r(9);
        var srcs = [
          "var x = new Box { N = " + a + " };\nvar y = x;\ny.N = " + b + ";\nConsole.WriteLine(x.N);\n\nclass Box { public int N; }",
          "var x = new Box { N = " + a + " };\nvar y = new Box { N = " + a + " };\nConsole.WriteLine(x == y);\nConsole.WriteLine(x.N == y.N);\n\nclass Box { public int N; }",
          "var x = new Pt(" + a + ", " + b + ");\nvar y = new Pt(" + a + ", " + b + ");\nConsole.WriteLine(x == y);\nConsole.WriteLine(x with { Y = " + a + " });\n\nrecord Pt(int X, int Y);"
        ];
        return { prompt: "What does this print?", label: ["a copied reference", "two equal objects", "two equal records"][n % 3], params: [], src: srcs[n % 3], hint: "A class variable holds a reference; == on a class asks \"same object?\"; a record compares values." };
      } },
    "u7-static": { title: "Static or per object?", lesson: "7.4", concepts: ["static-members"], kind: "predict",
      vary: function (r) {
        var k = 2 + r(3), m = 1 + r(3);
        return { prompt: "What does this print?", label: "a shared counter", params: [],
          src: "for (int i = 0; i < " + k + "; i++) new Visit();\nvar last = new Visit();\nfor (int i = 0; i < " + m + "; i++) last.Again();\nConsole.WriteLine($\"{Visit.Total} {last.Mine}\");\n\nclass Visit\n{\n    public static int Total;\n    public int Mine;\n    public Visit() { Total++; Mine++; }\n    public void Again() { Total++; Mine++; }\n}",
          hint: "Total is one shared count; Mine belongs to each object." };
      } },
    "u7-null": { title: "Null operators", lesson: "7.8", concepts: ["nullable-ops"], kind: "predict",
      vary: function (r) {
        var w = pick(r, ["kiwi", "plum", "banana", "fig"]), set = r(2) === 1;
        return { prompt: "What does this print?", label: "?. ?? and ??=", params: [],
          src: "string? a = " + (set ? "\"" + w + "\"" : "null") + ";\nConsole.WriteLine(a?.Length ?? -1);\na ??= \"pear\";\nConsole.WriteLine(a.ToUpper());",
          hint: "?. gives null when a is null; ?? supplies the fallback; ??= sets only when null." };
      } },
    "u7-flags": { title: "Flags", lesson: "7.9", concepts: ["flags", "enums"], kind: "predict",
      vary: function (r) {
        var ops = [pick(r, ["Read", "Write", "Delete"]), pick(r, ["Read", "Write", "Delete"]), pick(r, ["Read", "Write", "Delete"])];
        return { prompt: "What does this print?", label: "combining and clearing flags", params: [],
          src: "var p = Perm." + ops[0] + " | Perm." + ops[1] + ";\np &= ~Perm." + ops[2] + ";\nConsole.WriteLine(p);\nConsole.WriteLine((int)p);\n\n[Flags]\nenum Perm { None = 0, Read = 1, Write = 2, Delete = 4 }",
          hint: "| sets, & ~ clears; Read 1, Write 2, Delete 4." };
      } },
    "u7-class": { title: "Write a small class", lesson: "7.3", concepts: ["class-object", "properties", "ctor"], kind: "write",
      vary: function (r, n) {
        var shapes = [["Rect", "Width", "Height", "Area", "*"], ["Rect", "Width", "Height", "Perimeter", "2*(+)"], ["Box", "Side", "Side", "Volume", "^3"]];
        var s = shapes[n % 3];
        var f = function (a, b) { return s[4] === "*" ? a * b : s[4] === "2*(+)" ? 2 * (a + b) : a * a * a; };
        var pairs = [[3, 4], [1, 1], [5, 2]];
        var two = s[0] === "Rect";
        var body = two
          ? "class Rect\n{\n    public int Width { get; }\n    public int Height { get; }\n    public Rect(int w, int h) { Width = w; Height = h; }\n    public int " + s[3] + " => " + (s[4] === "*" ? "Width * Height" : "2 * (Width + Height)") + ";\n}"
          : "class Box\n{\n    public int Side { get; }\n    public Box(int s) => Side = s;\n    public int Volume => Side * Side * Side;\n}";
        var read = two ? "int a = int.Parse(Console.ReadLine() ?? \"\");\nint b = int.Parse(Console.ReadLine() ?? \"\");\n" : "int a = int.Parse(Console.ReadLine() ?? \"\");\n";
        var use = two ? "var x = new Rect(a, b);\nConsole.WriteLine(x." + s[3] + ");\n\n" : "var x = new Box(a);\nConsole.WriteLine(x.Volume);\n\n";
        return { prompt: "Write `" + s[0] + "` with a constructor, get-only " + (two ? "Width and Height" : "Side") + " and a computed `" + s[3] + "`. Read the size" + (two ? "s (two lines)" : "") + " and print the " + s[3].toLowerCase() + ".",
          label: s[0] + " " + s[3], params: [s[3]], starter: read,
          cases: pairs.map(function (p) { return { stdin: two ? p[0] + "\n" + p[1] : String(p[0]), out: String(f(p[0], p[1])) }; }),
          rules: [{ id: "class", test: function (src) { return new RegExp("class\\s+" + s[0] + "\\b").test(src) && new RegExp(s[3] + "\\s*=>").test(src); }, msg: "Declare the class with a computed " + s[3] + "." }],
          hint: "Constructor sets the get-only properties; the computed one is `=> expression`.",
          answer: read + use + body };
      } },
    "u7-guard": { title: "Keep it valid", lesson: "7.2", concepts: ["invariant", "ctor"], kind: "write",
      vary: function (r) {
        var lo = r(5), hi = 20 + r(30);
        var ins = [[String(lo + 3), "+", "+", "-"], [String(hi), "+", "+"], [String(hi + 1)], [String(lo), "-", "-"]];
        var f = function (xs) { var v = parseInt(xs[0], 10); if (v < lo || v > hi) return "invalid"; xs.slice(1).forEach(function (c) { if (c === "+" && v < hi) v++; if (c === "-" && v > lo) v--; }); return String(v); };
        return { prompt: "Write `Dial` whose constructor throws ArgumentOutOfRangeException unless the start is " + lo + "–" + hi + "; `Up()`/`Down()` never leave that range; `Value { get; private set; }`. Read the start, then `+`/`-` lines to the end. Print the final value, or `invalid`.",
          label: "range " + lo + "–" + hi, params: [lo + "–" + hi], starter: "",
          cases: ins.map(function (xs) { return { stdin: xs.join("\n"), out: f(xs) }; }),
          rules: [{ id: "priv", test: function (src) { return /private\s+set/.test(src) && /throw\s+new\s+ArgumentOutOfRangeException/.test(src); }, msg: "A private setter, and a constructor that throws." }],
          hint: "Check in the constructor; Up: if (Value < hi) Value++.",
          answer: "try\n{\n    var d = new Dial(int.Parse(Console.ReadLine() ?? \"\"));\n    string? line;\n    while ((line = Console.ReadLine()) is not null && line != \"\")\n    {\n        if (line == \"+\") d.Up();\n        else if (line == \"-\") d.Down();\n    }\n    Console.WriteLine(d.Value);\n}\ncatch (ArgumentOutOfRangeException)\n{\n    Console.WriteLine(\"invalid\");\n}\n\nclass Dial\n{\n    public int Value { get; private set; }\n    public Dial(int start)\n    {\n        if (start < " + lo + " || start > " + hi + ") throw new ArgumentOutOfRangeException(nameof(start));\n        Value = start;\n    }\n    public void Up() { if (Value < " + hi + ") Value++; }\n    public void Down() { if (Value > " + lo + ") Value--; }\n}" };
      } }
  } });
})();
