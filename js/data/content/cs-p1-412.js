/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.1.2.1–
   4.1.2.3 (programming paradigms; procedural-oriented programming and the
   structured approach; object-oriented programming) at full A-level depth,
   with every program in C#. Each topic REPLACES the entry
   cs-databases-sys.js (4.1.2.1, 4.1.2.2) or cs-theory.js (4.1.2.3) carried.
   The topic compilation has no packs for these leaves, so every exam item
   is taken from the original papers (7516/1 and 7517/1, June 2016–2025):
   decomposition and the structured approach, hierarchy charts, composition,
   and the Section C OOP questions on class diagrams, access specifiers,
   overriding, polymorphism and virtual/abstract methods. Every C# listing
   was compiled and run under .NET 10. */
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
function seg(x1, y1, x2, y2, col) { return { line: [[x1, y1], [x2, y2]], c: col || "text2", w: 1.5 }; }
/* a UML class box: name, attributes, methods — returns { items, h } */
function uml(x, y, w, name, attrs, meths, col) {
  var lh = 15, hh = 24, ah = attrs.length * lh + 8, mh = meths.length * lh + 8, H = hh + ah + mh;
  col = col || "accent";
  var it = [
    { poly: [[x, y], [x + w, y], [x + w, y + H], [x, y + H]], fill: col, alpha: 0.07, c: col, w: 1.5 },
    { poly: [[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], fill: col, alpha: 0.22, c: col, w: 1.5 },
    txt(x + w / 2, y + hh / 2, name, { b: true, size: 11.5, c: "text" }),
    seg(x, y + hh + ah, x + w, y + hh + ah, col)
  ];
  attrs.forEach(function (a, i) { it.push(txt(x + 8, y + hh + 4 + lh / 2 + i * lh, a, { pos: "e", size: 10.5, c: "text2" })); });
  meths.forEach(function (m, i) { it.push(txt(x + 8, y + hh + ah + 4 + lh / 2 + i * lh, m, { pos: "e", size: 10.5, c: "text2" })); });
  return { items: it, h: H };
}
function unit(x1, y1, x2, y2) { var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy); return [dx / d, dy / d]; }
/* inheritance: a line from the subclass to a hollow triangle at the base class */
function inherit(x1, y1, x2, y2) {
  var u = unit(x1, y1, x2, y2), p = [-u[1], u[0]], bx = x2 - u[0] * 13, by = y2 - u[1] * 13;
  return [seg(x1, y1, bx, by), { poly: [[x2, y2], [bx + p[0] * 7, by + p[1] * 7], [bx - p[0] * 7, by - p[1] * 7]], c: "text2", w: 1.5 }];
}
/* aggregation (white diamond) or composition (black diamond) at the WHOLE's end */
function diamondLink(x1, y1, x2, y2, filled) {
  var u = unit(x1, y1, x2, y2), p = [-u[1], u[0]];
  var pt = function (a, b) { return [x2 - u[0] * a + p[0] * b, y2 - u[1] * a + p[1] * b]; };
  var d = { poly: [[x2, y2], pt(9, 6), pt(18, 0), pt(9, -6)], c: "text2", w: 1.5 };
  if (filled) { d.fill = "text2"; d.alpha = 0.9; }
  var end = pt(18, 0);
  return [seg(x1, y1, end[0], end[1]), d];
}

/* =====================================================================
   4.1.2.1  Programming paradigms
   ===================================================================== */
C["compsci:4.1.2.1"] = {
  notes: [
    { h: "Programming paradigms — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.1.2.1)", body: "Understand the **characteristics of the procedural- and object-oriented programming paradigms**, and have experience of programming in each. (The functional paradigm is 4.12, Paper 2.)" } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Procedural decomposition", "Explain", "3", "A-level 2021 Q03 (worked in 4.4.1.9)"],
      ["Why an OOP approach (private data + public method) is favoured", "Explain", "2", "A-level 2017 Q08.4"],
      ["Procedural / data composition in a program", "Explain / describe", "2 + 2", "AS 2024 Q11 (worked in 4.4.1.10)"],
      ["Write code in either paradigm", "Write", "Section D", "every Paper 1 (the Skeleton Program is object-oriented at A-level)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What a paradigm is**.", "**Procedural vs object-oriented**.", "**The same task both ways**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What a paradigm is" },
    { callout: { t: "def", h: "Programming paradigm", body: "A **style or approach** to programming — a way of organising a program and thinking about a problem. A language may support several paradigms (C# is object-oriented but can be written procedurally and has functional features)." } },
    { table: { head: ["Paradigm", "A program is…", "Organised around", "Where in the course"], rows: [
      ["Procedural", "a sequence of instructions grouped into procedures/functions that are called in order", "**what to do** — subroutines acting on data passed to them", "4.1.2.2"],
      ["Object-oriented", "a set of interacting **objects**, each bundling its data with the methods that use it", "**the things in the problem** — classes", "4.1.2.3"],
      ["Functional", "the evaluation of functions, with no side-effects or changing state", "functions as first-class values", "4.12 (Paper 2)"],
      ["Declarative (e.g. SQL)", "a description of WHAT result is wanted, not how to get it", "facts, rules, queries", "4.10.4 (Paper 2)"]
    ] } },

    { page: "Procedural vs object-oriented" },
    { fig: { w: 640, h: 200, items: [].concat(
      [txt(160, 16, "Procedural", { b: true, size: 12, c: "text" }), txt(480, 16, "Object-oriented", { b: true, size: 12, c: "text" })],
      boxAt(10, 32, 100, 34, "Average()", "accent2"), boxAt(10, 82, 100, 34, "Highest()", "accent2"), boxAt(10, 132, 100, 34, "Report()", "accent2"),
      boxAt(190, 52, 110, 34, "marks[ ]", "accent"), boxAt(190, 112, 110, 34, "names[ ]", "accent"),
      arrow(110, 49, 190, 64, null, { c: "text2" }), arrow(110, 99, 190, 74, null, { c: "text2" }), arrow(110, 144, 190, 80, null, { c: "text2" }), arrow(110, 154, 190, 129, null, { c: "text2" }),
      uml(360, 30, 240, "Course (an object)", ["- name: String", "- marks: List<int>"], ["+ AddMark(m)", "+ Average(): Real", "+ Report()"], "good").items,
      [txt(160, 186, "data passed around; any procedure can change it", { size: 10.5, c: "text2" }), txt(480, 186, "data bundled with the methods that use it", { size: 10.5, c: "text2" })]
    ), cap: "Procedural code keeps data and the subroutines that use it apart; object-oriented code encapsulates them together and hides the data behind methods." } },
    { table: { head: [" ", "Procedural", "Object-oriented"], rows: [
      ["Building block", "procedure / function", "class (a blueprint) and object (an instance)"],
      ["Data", "separate from code; passed as parameters (or global)", "encapsulated in objects; private, reached through methods"],
      ["Design method", "top-down: decomposition into subroutines, hierarchy charts", "identify the objects, their attributes, behaviours and relationships; class diagrams"],
      ["Reuse", "libraries of subroutines", "inheritance, composition, polymorphism"],
      ["Change", "a change to a data structure can ripple into every procedure that uses it", "the representation is hidden, so it can change without breaking other classes"],
      ["Best for", "small programs, step-by-step processes, scripts, calculations", "large systems, many similar entities, simulations, GUIs, games (the Skeleton Programs)"]
    ] } },
    { callout: { t: "miscon", h: "Misconception", body: "\"OOP doesn't use procedures.\" — every method IS a subroutine with sequence, selection and iteration inside it; OOP changes how code and data are GROUPED, not what a statement is." } },

    { page: "The same task both ways" },
    { code: { lang: "csharp", src: "// PROCEDURAL: data in an array, subroutines receive it\nint[] marks = { 62, 75, 48, 90 };\nReport(marks);                                  // Average 68.8, highest 90, grade B\n\nstatic void Report(int[] marks)\n{\n    double average = Average(marks);\n    Console.WriteLine($\"Average {average:F1}, highest {Highest(marks)}, grade {Grade(average)}\");\n}\nstatic double Average(int[] values)\n{\n    int total = 0;\n    foreach (int v in values) total += v;\n    return (double)total / values.Length;\n}\nstatic int Highest(int[] values)\n{\n    int best = values[0];\n    foreach (int v in values) if (v > best) best = v;\n    return best;\n}\nstatic string Grade(double mark) => mark >= 70 ? \"A\" : mark >= 60 ? \"B\" : mark >= 50 ? \"C\" : \"U\";", cap: "Checked: Average 68.8, highest 90, grade B." } },
    { code: { lang: "csharp", src: "// OBJECT-ORIENTED: the data is private; the object guards it\nvar maths = new Course(\"Maths\");\nforeach (int m in new[] { 62, 75, 48, 90 }) maths.AddMark(m);\nConsole.WriteLine($\"{maths.Name}: {maths.Average():F1}\");   // Maths: 68.8\n\nclass Course\n{\n    private readonly List<int> marks = new();\n    public string Name { get; }\n    public Course(string name) { Name = name; }\n    public void AddMark(int m)\n    {\n        if (m < 0 || m > 100) throw new ArgumentOutOfRangeException(nameof(m));   // no bad data gets in\n        marks.Add(m);\n    }\n    public double Average() => marks.Count == 0 ? 0 : marks.Average();\n}", cap: "Nothing outside Course can put 150 into marks: the class enforces its own rules." } },
    { worked: { tag: "variation", title: "Pick the paradigm", q: "For each, say which paradigm fits better and why: (a) a 30-line script that renames files in a folder; (b) a fleet simulation with cars, vans and lorries that share most behaviour; (c) a GUI with dozens of buttons, text boxes and windows.",
      steps: [
        { m: "(a) Procedural — one short sequence of steps; classes would add structure without benefit.", mk: "1" },
        { m: "(b) Object-oriented — a Vehicle base class with Car/Van/Lorry subclasses: inheritance shares the common code, overriding handles the differences.", mk: "1" },
        { m: "(c) Object-oriented — each control is an object with its own state and event methods; every GUI library is built this way.", mk: "1" }
      ], result: "Procedural · OOP · OOP" } },
    { worked: { tag: "variation", title: "Spot the paradigm features", q: "A program has: a class Player with private fields and public Move() and Score(); a static method ReadInt(prompt) that keeps asking until a number is typed; a class Enemy : Player that overrides Move(). Name the paradigm feature each shows.",
      steps: [
        { m: "Player: encapsulation — data bundled with methods, hidden behind a public interface (object-oriented).", mk: "1" },
        { m: "ReadInt: a procedural subroutine — a reusable step that works on the values passed in (procedural style, even inside an OO program).", mk: "1" },
        { m: "Enemy : Player with an override: inheritance and polymorphism (object-oriented).", mk: "1" }
      ], result: "Encapsulation · procedure · inheritance/polymorphism" } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "Worked elsewhere", body: "A-level 2021 Q03 (procedural decomposition, 3 marks) is worked under 4.4.1.9 Decomposition." } },
    { worked: { tag: "exam", title: "Why a private attribute with a public method", src: "A-level June 2017 · P1 Q08.4 · 2 marks",
      q: "In the Warren class there is a private attribute RabbitCount and a public method GetRabbitCount. Explain the need for the GetRabbitCount method and explain why this approach is favoured in object-oriented programming.",
      steps: [
        { h: "The need (AO2)", m: "RabbitCount is a private attribute so it is not accessible outside the Warren class // GetRabbitCount is public so it is accessible outside the class;", mk: "1" },
        { h: "Why favoured (AO1)", m: "The way RabbitCount is represented can be modified without having to change any other objects that interact with Warren // it makes it easier to reuse / inherit from Warren (a well-defined interface);", mk: "1", n: "A. data can be modified/read in a controlled way. NE. \"without having to change other code\"." }
      ], result: "Controlled access; the representation can change safely" } },
    { callout: { t: "info", h: "Worked elsewhere", body: "AS 2024 Q11.1–11.2 (procedural and data composition in a program) are worked under 4.4.1.10 Composition." } },
    { page: "Exam toolkit" },
    { steps: [
      "**Procedural**: decomposition into subroutines; data passed in parameters; top-down design with hierarchy charts.",
      "**Object-oriented**: classes and objects; encapsulated (private) data; inheritance, composition, polymorphism; class diagrams.",
      "**Why OOP**: hidden representation can change without affecting other classes; reuse through inheritance; models real-world entities; suits large team projects.",
      "Say WHICH paradigm the code in front of you uses: classes and new → object-oriented."
    ] },
    { callout: { t: "mnemonic", h: "\"Procedures DO, objects ARE\"", body: "**Procedural** code is organised around what the program **does** — subroutines acting on data passed to them. **Object-oriented** code is organised around the **things** in the problem — objects bundling data with methods." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.2.2 the structured approach; 4.1.2.3 OOP in full; 4.12.1.1–4.12.3.1 the functional paradigm; 4.10.4 SQL as declarative; 4.4.1 abstraction and decomposition; NEA.4 complex OOP models earn Group A marks." } }
  ],
  flashcards: [
    ["Programming paradigm?", "A style/approach to programming — a way of organising a program."],
    ["Procedural paradigm?", "Programs are sequences of instructions grouped into procedures/functions that act on data passed to them."],
    ["Object-oriented paradigm?", "Programs are sets of interacting objects, each encapsulating its data with the methods that act on it."],
    ["Procedural decomposition?", "Breaking a problem into smaller sub-problems, each solving an identifiable task, each possibly subdivided further."],
    ["Why is OOP favoured for large systems?", "Encapsulation hides representations, so classes can change without breaking others; inheritance/composition give reuse."],
    ["Procedural composition?", "Combining subroutines to form a compound subroutine."],
    ["Data composition?", "Combining data objects to form compound data (records, arrays of records)."],
    ["Two other paradigms on the A-level?", "Functional (4.12) and declarative (SQL, 4.10.4)."]
  ],
  quiz: [
    { q: "Which is a characteristic of the object-oriented paradigm?", opts: ["data and methods are encapsulated in objects", "all data is global", "programs have no subroutines", "programs describe only the result wanted"], ans: 0, why: "Encapsulation." },
    { q: "Top-down design with hierarchy charts belongs to", opts: ["the procedural paradigm", "the functional paradigm", "the declarative paradigm", "machine code"], ans: 0, why: "The structured approach." },
    { q: "SQL is an example of a language in the", opts: ["declarative paradigm", "object-oriented paradigm", "procedural paradigm", "assembly paradigm"], ans: 0, why: "It says WHAT, not how." },
    { q: "Why is a public GetRabbitCount with a private RabbitCount favoured?", opts: ["the representation can change without changing other classes", "it runs faster", "private attributes use less memory", "it avoids needing a constructor"], ans: 0, why: "A-level 2017 Q08.4." }
  ]
};

/* =====================================================================
   4.1.2.2  Procedural-oriented programming
   ===================================================================== */
function hierarchyFig() {
  var it = [];
  var B = { main: [260, 10, 120], load: [40, 80, 130], report: [255, 80, 130], save: [470, 80, 130], avg: [150, 152, 110], hi: [265, 152, 110], grade: [380, 152, 110] };
  var L = { main: "Main", load: "LoadMarks", report: "Report", save: "SaveResults", avg: "Average", hi: "Highest", grade: "Grade" };
  [["main", "load"], ["main", "report"], ["main", "save"], ["report", "avg"], ["report", "hi"], ["report", "grade"]].forEach(function (e) {
    var a = B[e[0]], b = B[e[1]];
    it.push(seg(a[0] + a[2] / 2, a[1] + 34, b[0] + b[2] / 2, b[1], "text2"));
  });
  Object.keys(B).forEach(function (k) { it = it.concat(boxAt(B[k][0], B[k][1], B[k][2], 34, L[k], k === "main" ? "accent2" : "accent")); });
  it.push(txt(560, 169, "each box: a subroutine", { size: 10.5, c: "text2" }));
  it.push(txt(560, 186, "each line: \"calls\"", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 200, items: it, cap: "A hierarchy chart: Main calls LoadMarks, Report and SaveResults; Report calls Average, Highest and Grade. It shows WHICH subroutine calls which — not the order, conditions or loops." } };
}
C["compsci:4.1.2.2"] = {
  notes: [
    { h: "Procedural-oriented programming — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.1.2.2)", body: ["Understand the **structured approach** to program design and construction.", "Be able to construct and use **hierarchy charts** when designing programs.", "Be able to explain the **advantages** of the structured approach."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Reasons for / advantages of the structured approach", "Explain", "3", "AS 2024 Q03"],
      ["Decomposition", "Explain / define", "2", "AS 2022 Q08, A-level 2025 Q02 (worked in 4.4.1.9)"],
      ["Purpose of a hierarchy chart; what a box represents; when it is drawn", "State / what", "1 each", "AS 2020 Q08.1–2, AS 2025 Q10.1, Q10.4"],
      ["Complete a hierarchy chart from the Skeleton Program", "State what goes in box (a)", "1 each", "AS 2016–2025, A-level 2019 Q09"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The structured approach**.", "**Hierarchy charts**.", "**Advantages**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The structured approach" },
    { callout: { t: "def", h: "Structured approach", body: "Designing a program **top-down**: **decompose** the problem into sub-problems, each solved by its own **subroutine** with a clear interface, built from the three **control structures** only — sequence, selection and iteration (no GOTO). Each subroutine uses **local variables** and **parameters**, not globals." } },
    { kv: [
      ["Decomposition", "break the problem into sub-problems, each an identifiable task, until each performs a single task"],
      ["Stepwise refinement", "repeatedly add detail to each part of the design until it can be coded"],
      ["Modularity", "one subroutine per task, with one entry and one exit, testable on its own"],
      ["Three control structures", "sequence, selection, iteration — any algorithm can be built from just these"],
      ["Interfaces", "parameters in, return values out, so subroutines are independent"]
    ] },

    { page: "Hierarchy charts" },
    hierarchyFig(),
    { steps: [
      "The top box is the whole program (or the main subroutine).",
      "Each box below is a **subroutine** called by the box above it.",
      "Read a level left to right, roughly in the order the calls happen; keep breaking down until each box is one task.",
      "Unlike a flowchart it shows **no** selection, iteration or data flow — only the structure."
    ] },
    { worked: { tag: "variation", title: "Draw the hierarchy chart", q: "A program's Main calls SetUpGame and PlayGame. PlayGame calls GetMove, MakeMove and CheckWin; MakeMove calls UpdateBoard. Describe the hierarchy chart.",
      steps: [
        { m: "Level 1: Main.", mk: "1" },
        { m: "Level 2 under Main: SetUpGame, PlayGame.", mk: "1" },
        { m: "Level 3 under PlayGame: GetMove, MakeMove, CheckWin; level 4 under MakeMove: UpdateBoard.", mk: "1", n: "Draw lines, not arrows; one box per subroutine even if it is called from two places (AQA charts show it under each caller)." }
      ], result: "Four levels: Main → PlayGame → MakeMove → UpdateBoard" } },
    { worked: { tag: "variation", title: "From the chart to C# headings", q: "Turn the chart in the figure into C# subroutine headings with sensible interfaces.",
      steps: [
        { m: "static int[] LoadMarks(string fileName) — returns the marks read.", mk: "1" },
        { m: "static void Report(int[] marks), calling static double Average(int[] values), static int Highest(int[] values), static string Grade(double mark).", mk: "1" },
        { m: "static void SaveResults(string fileName, int[] marks); Main: var m = LoadMarks(\"marks.txt\"); Report(m); SaveResults(\"out.txt\", m);", mk: "1" }
      ], result: "Each box → one subroutine with parameters and a return" } },

    { page: "Advantages" },
    { table: { head: ["Advantage", "Because…"], rows: [
      ["Overview / easier to understand", "the hierarchy shows the program's structure; each module is small and named"],
      ["Problem broken into sub-tasks", "each part is simple enough to design and code"],
      ["Reuse", "a subroutine can be called again or used in another program — less duplicated code"],
      ["Team working", "modules can be shared among programmers and developed in parallel"],
      ["Testing and debugging", "each module can be tested independently; errors are easier to locate"],
      ["Maintenance", "a change is confined to one module"]
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"A hierarchy chart shows the order and the loops.\" — it shows only which subroutine calls which.", "\"Structured means object-oriented.\" — the structured approach organises PROCEDURAL code; OOP is a different paradigm.", "\"Decomposition is abstraction.\" — decomposition splits a problem into parts; abstraction removes unnecessary detail (4.4.1)."] } },
    { callout: { t: "mnemonic", h: "ORTTM", body: "**O**verview · **R**euse · **T**eam working · **T**est independently · **M**aintain easily — \"Our Robots Test Their Modules\"." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Three reasons for the structured approach", src: "AS June 2024 · P1 Q03 · 3 marks",
      q: "Programmers are encouraged to adopt a structured approach to writing programs. Explain three reasons for adopting the structured approach.",
      steps: [
        { m: "Can get an overview of the structure of the program // code is easier to understand;", mk: "1" },
        { m: "Can re-use subroutines/modules // less duplication of code;", mk: "1" },
        { m: "Can test subroutines/modules independently // quicker/easier to debug/maintain // easier to locate errors;", mk: "1", n: "Also: break the problem into sub-tasks; distribute modules among a team. Max 3." }
      ], result: "Overview · reuse · independent testing" } },
    { callout: { t: "info", h: "Worked elsewhere", body: "AS 2022 Q08 and A-level 2025 Q02 (decomposition, 2 marks each) are worked under 4.4.1.9 Decomposition." } },
    { worked: { tag: "exam", title: "Purpose of a hierarchy chart", src: "AS June 2020 · P1 Q08.1 · 1 mark",
      q: "What is the purpose of a hierarchy chart?",
      steps: [{ m: "To represent the structure of the program // which subroutine is called from which subroutine // to aid decomposition // to aid stepwise refinement;", mk: "1" }],
      result: "Shows which subroutine calls which" } },
    { worked: { tag: "exam", title: "What a box represents", src: "AS June 2025 · P1 Q10.1 · 1 mark",
      q: "What does a box in a hierarchy chart represent?",
      steps: [{ m: "A subroutine / procedure / function / method;", mk: "1", n: "A. module / block of code." }],
      result: "A subroutine" } },
    { worked: { tag: "exam", title: "When a hierarchy chart is drawn", src: "AS June 2025 · P1 Q10.4 · 1 mark",
      q: "State the stage of software development when a hierarchy chart is normally developed.",
      steps: [{ m: "(During the) design (stage);", mk: "1", n: "R. more than one stage given." }],
      result: "Design" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Structured approach**: top-down decomposition into subroutines using sequence, selection and iteration, with locals and parameters.",
      "**Advantages**: overview · reuse · team working · independent testing/debugging · maintenance — three DIFFERENT ones.",
      "**Decomposition**: sub-problems → identifiable task → further subdivided.",
      "**Hierarchy chart**: box = subroutine; line = calls; drawn at the design stage. Filling in a box: read the Skeleton code for which subroutine calls which."
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.10 subroutines; 4.1.1.13 local variables; 4.1.1.2 the three control structures; 4.4.1 abstraction and decomposition; 4.13.1.2 design; NEA.2 design evidence (hierarchy charts and structure diagrams)." } }
  ],
  flashcards: [
    ["Structured approach?", "Top-down design: decompose into subroutines built from sequence, selection and iteration, using locals and parameters."],
    ["Decomposition?", "Breaking a problem into sub-problems, each accomplishing an identifiable task, decomposed further if needed."],
    ["Stepwise refinement?", "Repeatedly adding detail to each part of a design until it can be coded."],
    ["Hierarchy chart — purpose?", "Shows the structure of a program: which subroutine is called from which."],
    ["Hierarchy chart — a box?", "A subroutine (procedure/function/method/module)."],
    ["When is a hierarchy chart drawn?", "During the design stage."],
    ["Does a hierarchy chart show loops or decisions?", "No — only the structure of calls."],
    ["Three advantages of the structured approach?", "Overview/easier to understand; reuse; modules tested independently (also team working, maintenance)."],
    ["The three control structures?", "Sequence, selection, iteration."]
  ],
  quiz: [
    { q: "A box in a hierarchy chart represents", opts: ["a subroutine", "a variable", "a decision", "a loop"], ans: 0, why: "AS 2025 Q10.1." },
    { q: "A hierarchy chart is normally developed during", opts: ["design", "analysis", "testing", "evaluation"], ans: 0, why: "AS 2025 Q10.4." },
    { q: "Which is NOT an advantage of the structured approach?", opts: ["every variable can be global", "modules can be tested independently", "modules can be shared in a team", "subroutines can be reused"], ans: 0, why: "Structured programs use locals and parameters." },
    { q: "Decomposition continues until", opts: ["each sub-problem performs a single task", "there are ten subroutines", "the program compiles", "all data is in one array"], ans: 0, why: "A-level 2025 Q02." }
  ]
};

/* =====================================================================
   4.1.2.3  Object-oriented programming
   ===================================================================== */
function classDiagram() {
  var A = uml(215, 10, 210, "Animal {abstract}", ["# age: Integer", "- id: String", "+ Name: String"], ["+ Inspect() {virtual}", "+ AdvanceGeneration() {abstract}"], "accent2");
  var R = uml(30, 185, 210, "Rabbit", ["- reproductionRate: Real", "- female: Boolean"], ["+ Inspect() {override}", "+ AdvanceGeneration() {override}", "+ IsFemale(): Boolean"]);
  var F = uml(400, 185, 210, "Fox", ["- x: Integer", "- y: Integer"], ["+ AdvanceGeneration() {override}", "+ Move(dx, dy)"]);
  var it = [].concat(inherit(135, 185, 290, 10 + A.h), inherit(505, 185, 350, 10 + A.h), A.items, R.items, F.items);
  it.push(txt(320, 318, "+ public · - private · # protected · hollow triangle = inheritance, pointing at the base class", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 330, items: it, cap: "A class diagram with single inheritance: Rabbit and Fox inherit from the abstract class Animal and override its methods." } };
}
function wholePartFig() {
  var it = [].concat(
    boxAt(20, 50, 150, 50, "Simulation", "accent2"), boxAt(245, 50, 150, 50, "Warren", "accent"), boxAt(470, 50, 150, 50, "Rabbit", "accent"),
    diamondLink(245, 75, 170, 75, false), diamondLink(470, 75, 395, 75, true),
    [txt(229, 62, "1..*", { size: 10.5, c: "text2" }), txt(452, 62, "0..*", { size: 10.5, c: "text2" }),
      txt(207, 122, "aggregation (white diamond)", { size: 11, b: true, c: "text" }), txt(207, 140, "warrens exist on their own", { size: 10.5, c: "text2" }),
      txt(432, 122, "composition (black diamond)", { size: 11, b: true, c: "text" }), txt(432, 140, "rabbits live and die with the warren", { size: 10.5, c: "text2" })]
  );
  return { fig: { w: 640, h: 160, items: it, cap: "The diamond sits at the WHOLE's end. Composition (black): the whole creates and owns its parts. Aggregation (white): the whole only refers to parts that exist independently." } };
}
C["compsci:4.1.2.3"] = {
  notes: [
    { h: "Object-oriented programming — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.1.2.3)", body: ["Be familiar with **class, object, instantiation, encapsulation, inheritance, aggregation, composition, polymorphism and overriding**.", "Know why the OO paradigm is used.", "Be aware of the design principles **encapsulate what varies**, **favour composition over inheritance** and **program to interfaces, not implementation**.", "Write OO programs.", "Draw and interpret **class diagrams** (+ public, - private, # protected; black diamond composition, white diamond aggregation; abstract, virtual and static methods)."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Which features does a class diagram show?", "Write Yes/No", "3", "A-level 2017 Q08.1"],
      ["Private vs protected / public vs protected", "Explain", "1–2", "A-level 2017 Q08.3, 2020 Q07.3, 2022 Q06.3"],
      ["Overriding; polymorphism", "What is meant", "1", "A-level 2022 Q06.4, 2021 Q09.3"],
      ["Virtual vs abstract methods", "Describe two differences", "2", "A-level 2023 Q08"],
      ["Why an attribute/method has its specifier", "Explain", "1", "A-level 2021 Q09.1, 2024 Q09.1"],
      ["Local variable vs private attribute", "Explain", "1", "A-level 2024 Q09.2"],
      ["Relationship type in a diagram", "State / which", "1", "A-level 2020 Q08.4, 2022 Q06.1"],
      ["Write a class definition / subclass in code", "Write", "4–13", "A-level 2017 Q08.6 and every Section D"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Classes, objects and instantiation**.", "**Encapsulation and access specifiers**.", "**Inheritance**.", "**Overriding, polymorphism; virtual, abstract and static**.", "**Aggregation and composition**.", "**Class diagrams**.", "**Design principles and why OOP**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Classes, objects and instantiation" },
    { kv: [
      ["Class", "a blueprint/template that defines the **attributes** (fields, properties) and **methods** capturing the common characteristics and behaviours of a type of object"],
      ["Object", "an **instance** of a class, with its own values for the attributes"],
      ["Instantiation", "creating an object from a class: new calls the **constructor**, and a **reference** to the new object is assigned to a variable of the class type"],
      ["Constructor", "a special method, run on instantiation, that initialises the attributes — explicit (written) or implicit (the default one C# supplies when none is written)"],
      ["Attribute / method", "data an object holds / a subroutine an object can perform"]
    ] },
    { code: { lang: "csharp", src: "public class Fox\n{\n    private int x, y;                     // attributes (state)\n    public string Name { get; set; }      // a property: a public face for data\n\n    public Fox(string name)               // constructor\n    {\n        Name = name;\n    }\n\n    public void Move(int dx, int dy)      // method (behaviour)\n    {\n        x += dx; y += dy;\n        Console.WriteLine($\"{Name} at ({x},{y})\");\n    }\n}\n\nFox f1 = new Fox(\"Same\");   // instantiation: f1 holds a REFERENCE\nFox f2 = f1;                 // f2 refers to the SAME object\nf2.Name = \"Changed\";\nConsole.WriteLine(f1.Name);  // Changed", cap: "Checked: prints Changed — two references, one object (4.1.1.1 pointers/references)." } },

    { page: "Encapsulation and access specifiers" },
    { callout: { t: "def", h: "Encapsulation", body: "Bundling an object's **attributes and the methods** that act on them into one class, and **hiding** the attributes (private) so they can only be read or changed through the class's public methods — **information hiding**." } },
    { table: { head: ["Specifier", "UML", "C#", "Accessible from"], rows: [
      ["Public", "+", "public", "anywhere — inside or outside the class"],
      ["Private", "-", "private (the default for members)", "only **within the class itself**"],
      ["Protected", "#", "protected", "the class **and any class that inherits from it** (subclasses)"]
    ] } },
    { code: { lang: "csharp", src: "public class Warren\n{\n    private Rabbit[] rabbits;\n    private int rabbitCount;\n\n    public Warren(int n)\n    {\n        rabbits = new Rabbit[50];\n        for (int i = 0; i < n; i++) rabbits[i] = new Rabbit(\"W\" + i, 0.5, i % 2 == 0);\n        rabbitCount = n;\n    }\n\n    public int RabbitCount => rabbitCount;    // read-only: a getter, no setter\n}\n\nvar w = new Warren(3);\nConsole.WriteLine(w.RabbitCount);   // 3\n// w.rabbitCount = 99;              // error CS0122: inaccessible due to its protection level", cap: "The compiler enforces private: the line that would break the rule does not compile." } },
    { ul: [
      "**Why**: other classes depend only on the public interface, so the private representation can change (an array for a List) without changing them.",
      "**Validation**: a setter or method can refuse bad values (AddMark rejects 150), so an object is never in an invalid state.",
      "**Fewer side-effects**: nothing outside can change the data by accident."
    ] },

    { page: "Inheritance" },
    { callout: { t: "def", h: "Inheritance", body: "A **subclass** (derived/child class) takes on all the attributes and methods of its **base class** (superclass/parent) and can **add** its own and **override** inherited ones — an **\"is a\"** relationship: a Rabbit IS AN Animal. C# allows single inheritance of classes." } },
    { code: { lang: "csharp", src: "public abstract class Animal\n{\n    public static int Count;                  // static: ONE copy shared by the class\n    protected int age;                        // subclasses may use it\n    private string id;                        // only Animal may use it\n    public string Name { get; set; }\n    public int Age => age;\n\n    protected Animal(string name) { Name = name; id = \"A\" + (++Count); }\n    public virtual void Inspect() => Console.Write($\"{Name} age {age}; \");\n    public abstract void AdvanceGeneration();\n}\n\npublic class Rabbit : Animal                  // Rabbit inherits from Animal\n{\n    private double reproductionRate;\n    private bool female;\n    public Rabbit(string name, double rate, bool isFemale) : base(name)   // run Animal's constructor first\n    {\n        reproductionRate = rate; female = isFemale;\n    }\n    public override void Inspect() { base.Inspect(); Console.Write($\"rate {reproductionRate}; \"); }\n    public override void AdvanceGeneration() { age = age + 1; }   // protected: allowed\n    public bool IsFemale() => female;\n    public double GetReproductionRate() => reproductionRate;\n}", cap: "base(name) chains to the parent constructor; base.Inspect() calls the overridden parent method. Using id inside Rabbit would not compile — it is private to Animal." } },

    { page: "Overriding, polymorphism; virtual, abstract and static" },
    { kv: [
      ["Overriding", "a subclass gives its **own implementation** of a method it inherits, with the same name and parameters (C#: override)"],
      ["Polymorphism", "objects of **different classes respond differently** to the same method call / a single interface — the method that runs depends on the object's actual class, decided at run time"],
      ["Virtual method", "has a body in the base class and **may** be overridden"],
      ["Abstract method", "has **no body** — only a declaration — and **must** be overridden; only allowed in an **abstract class**, which cannot be instantiated"],
      ["Static method / attribute", "belongs to the **class**, not to any object: called as Animal.Count, no object needed"]
    ] },
    { code: { lang: "csharp", src: "var animals = new List<Animal> { new Rabbit(\"R1\", 0.5, true), new Fox(\"F1\"), new HDRabbit(\"H1\", 0.5, true, 0.3, 3) };\nforeach (Animal a in animals) a.Inspect();          // each object runs ITS OWN Inspect\nforeach (Animal a in animals) a.AdvanceGeneration(); // Rabbit: +1, Fox: +2\nConsole.WriteLine(animals[0].Age + \" \" + Animal.Count);   // 1 3\n\n// R1 age 0; rate 0.5; F1 age 0; H1 age 0; rate 0.5; infection 0.3, generation 3", cap: "One loop, one call, three behaviours: polymorphism. Checked output shown. new Animal(…) would not compile — Animal is abstract." } },
    { table: { head: [" ", "Virtual method", "Abstract method"], rows: [
      ["Body in the base class", "yes — has an implementation", "no — declaration only"],
      ["Must a subclass override it?", "no — it MAY", "yes — it MUST (unless the subclass is abstract too)"],
      ["Allowed in", "abstract and non-abstract classes", "abstract classes only"],
      ["C#", "public virtual void Inspect() { … }", "public abstract void AdvanceGeneration();"]
    ] } },
    { worked: { tag: "variation", title: "Which method runs?", q: "Shape has abstract double Area() and virtual string Describe() => \"a shape\". Circle overrides Area only; Square overrides both, with Describe() => \"a square\". Shape s1 = new Circle(1); Shape s2 = new Square(2); What does $\"{s1.Area():F2} {s2.Area()} {s1.Describe()} {s2.Describe()}\" print?",
      steps: [
        { m: "s1.Area(): Circle's override → π × 1² → 3.14.", mk: "1" },
        { m: "s2.Area(): Square's override → 2 × 2 → 4.", mk: "1" },
        { m: "s1.Describe(): Circle did not override the virtual method → the base version, \"a shape\"; s2.Describe(): \"a square\".", mk: "1", n: "The variable's type is Shape for both; the OBJECT's class decides. Checked by running." }
      ], result: "3.14 4 a shape a square" } },

    { page: "Aggregation and composition" },
    wholePartFig(),
    { table: { head: [" ", "Composition", "Aggregation", "Inheritance"], rows: [
      ["Relationship", "\"has a\" — strong: the part is created by and belongs to the whole", "\"has a\" — weak: the whole refers to parts that exist independently", "\"is a\""],
      ["Lifetime", "parts are destroyed with the whole", "parts survive the whole", "—"],
      ["UML", "black (filled) diamond at the whole", "white (hollow) diamond at the whole", "hollow triangle at the base class"],
      ["C#", "the constructor does new Rabbit(…) itself", "the constructor is GIVEN existing objects", "class Rabbit : Animal"]
    ] } },
    { code: { lang: "csharp", src: "public class Simulation\n{\n    private List<Warren> warrens;                 // AGGREGATION\n    public Simulation(List<Warren> existing)      // given warrens made elsewhere\n    {\n        warrens = existing;\n    }\n    public int WarrenCount => warrens.Count;\n}\n// Warren (previous page) is COMPOSITION: its constructor creates its own Rabbit objects\nvar sim = new Simulation(new List<Warren> { new Warren(3) });\nConsole.WriteLine(sim.WarrenCount);   // 1", cap: "Who calls new decides it: the whole makes the part → composition; the part is passed in → aggregation." } },

    { page: "Class diagrams" },
    classDiagram(),
    { steps: [
      "Each class is a box of three parts: **name**, **attributes** (name: type), **methods** (name(parameters): return type).",
      "Prefix each member with its specifier: **+** public, **-** private, **#** protected.",
      "**Inheritance**: a line with a hollow triangle pointing at the BASE class.",
      "**Composition**: black diamond at the whole; **aggregation**: white diamond at the whole.",
      "Mark abstract classes/methods (italics or {abstract}) and overrides as the question's notation does."
    ] },
    { worked: { tag: "variation", title: "Read the diagram", q: "From the class diagram in the figure: (a) which attribute can Rabbit use directly but not id? (b) which method must Fox implement? (c) can a program write new Animal(\"x\")?",
      steps: [
        { m: "(a) age — it is protected (#); id is private (-) to Animal.", mk: "1" },
        { m: "(b) AdvanceGeneration — it is abstract in Animal.", mk: "1" },
        { m: "(c) No — Animal is abstract, so it cannot be instantiated.", mk: "1" }
      ], result: "age · AdvanceGeneration · no" } },

    { page: "Design principles and why OOP" },
    { table: { head: ["Principle", "Meaning", "Example"], rows: [
      ["Encapsulate what varies", "put the part most likely to change behind its own class/interface, so a change touches one place", "the scoring rule is a Scorer class; a new rule is a new subclass"],
      ["Favour composition over inheritance", "build behaviour by HAVING objects rather than BEING a subclass — more flexible, avoids deep fragile hierarchies", "a Car has an Engine, rather than PetrolCar/ElectricCar for every variant"],
      ["Program to interfaces, not implementation", "depend on what an object can DO (an interface) rather than its concrete class", "IMovable m = new Fox(\"F2\"); m.Move(2, 3); — any IMovable will do"]
    ] } },
    { code: { lang: "csharp", src: "public interface IMovable { void Move(int dx, int dy); }\n\npublic class Fox : Animal, IMovable        // one base class, any number of interfaces\n{\n    private int x, y;\n    public Fox(string name) : base(name) { }\n    public override void AdvanceGeneration() { age = age + 2; }\n    public void Move(int dx, int dy) { x += dx; y += dy; Console.WriteLine($\"{Name} at ({x},{y})\"); }\n}\n\nIMovable m = new Fox(\"F2\");\nm.Move(2, 3);                               // F2 at (2,3)", cap: "Not examined in code (spec note), but worth practising: the caller knows only IMovable." } },
    { ul: [
      "**Why OOP is used**: models real-world entities; encapsulation lets classes change independently; inheritance and composition reuse code; polymorphism lets new types slot into existing code; classes can be developed and tested separately by a team.",
      "**Drawbacks**: more design up front; can be over-engineered for small programs; deep inheritance hierarchies are hard to change."
    ] },
    { callout: { t: "tip", h: "Practice", body: "The OOP Sandbox (Study → Practice zone) lets you drag classes, draw inheritance and read the C# it generates — it refuses the same rule-breaks the C# compiler does." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Features present in a class diagram", src: "A-level June 2017 · P1 Q08.1 · 3 marks",
      q: "A class diagram shows four classes joined by composition (black diamond) lines: Simulation (-Landscape: Location, -TimePeriod: Integer, -WarrenCount: Integer, -FoxCount: Integer, -CreateNewWarren(), -CreateNewFox()); Location (+Fox: Fox, +Warren: Warren); Fox (-FoodUnitsNeeded: Integer, +AdvanceGeneration(), +Inspect()); Warren (-Rabbits: Rabbit, -RabbitCount: Integer, -CalculateRandomValue(), +GetRabbitCount(), -KillByOtherFactors()). A + sign denotes public. Write Yes or No to identify whether each feature is present: inheritance; protected method; private attribute.",
      steps: [
        { m: "Inheritance — No (no hollow-triangle lines; only composition);", mk: "1" },
        { m: "Protected method — No (no # members);", mk: "1" },
        { m: "Private attribute — Yes (e.g. -TimePeriod);", mk: "1", n: "A. Y/N. One mark per correct row." }
      ], result: "No · No · Yes" } },
    { worked: { tag: "exam", title: "Protected vs private", src: "A-level June 2017 · P1 Q08.3 · 2 marks",
      q: "Explain the difference between a protected attribute and a private attribute.",
      steps: [
        { m: "A protected attribute can be accessed (within its class and) by derived class instances / subclasses;", mk: "1" },
        { m: "A private attribute can only be accessed within its class;", mk: "1" }
      ], result: "Protected: class + subclasses. Private: class only" } },
    { worked: { tag: "exam", title: "Write the HDRabbit class", src: "A-level June 2017 · P1 Q08.6 · 4 marks",
      q: "Part of the Rabbit class definition is: Rabbit = Class(Animal) Private: ReproductionRate: Real; Gender: Genders. Public: Procedure Inspect(); Function IsFemale(); Function GetReproductionRate(). End Class. HDRabbit is to be a subclass of Rabbit. Inspecting an HDRabbit shows everything a rabbit shows plus its extra information. Its extra attributes are InfectionRate (the probability a rabbit bred from it is infected) and Generation (how many generations of its family have had the disease); its extra methods include IsInfertile(), which returns True if the disease has been in the family for three generations. Write the class definition for HDRabbit, using similar notation.",
      steps: [
        { m: "Header naming the class and its parent: HDRabbit = Class(Rabbit);", mk: "1" },
        { m: "Redefining Inspect: Public: Procedure Inspect() (Override);", mk: "1", n: "A. override not stated." },
        { m: "The two extra attributes, private, with suitable types: Private: InfectionRate: Real; Generation: Integer;", mk: "1", n: "R. if other attributes are included." },
        { m: "Public methods to read the two attributes and IsInfertile: Function IsInfertile(); Function GetGeneration(); Function GetInfectionRate(); End Class", mk: "1", n: "R. a method with the same name as an attribute. I. constructor; I. extra get/set methods." }
      ], result: "HDRabbit = Class(Rabbit) with 2 private attributes, override Inspect, 3 public functions" } },
    { code: { lang: "csharp", src: "public class HDRabbit : Rabbit\n{\n    private double infectionRate;\n    private int generation;\n\n    public HDRabbit(string name, double rate, bool isFemale, double infection, int gen)\n        : base(name, rate, isFemale)\n    {\n        infectionRate = infection; generation = gen;\n    }\n    public override void Inspect()\n    {\n        base.Inspect();     // everything a normal rabbit shows…\n        Console.WriteLine($\"infection {infectionRate}, generation {generation}\");   // …plus the extra\n    }\n    public bool IsInfertile() => generation >= 3;\n    public double GetInfectionRate() => infectionRate;\n    public int GetGeneration() => generation;\n}", cap: "The 2017 answer in C#. Checked: an HDRabbit with generation 3 reports IsInfertile() = True." } },
    { worked: { tag: "exam", title: "Protected vs private, one mark", src: "A-level June 2020 · P1 Q07.3 · 1 mark",
      q: "The Outlet class contains some protected attributes. Explain the difference between protected and private attributes.",
      steps: [{ m: "Private attributes can only be accessed by the class/object they belong to, whereas protected attributes can also be accessed by any classes that inherit from the class they belong to;", mk: "1", n: "NE. \"protected attributes can be accessed by other classes\" — it must say INHERITING classes." }],
      result: "Protected adds inheriting classes" } },
    { worked: { tag: "exam", title: "Public vs protected", src: "A-level June 2022 · P1 Q06.3 · 2 marks",
      q: "Explain the difference between an attribute that has a public specifier and an attribute that has a protected specifier.",
      steps: [
        { m: "Public means it can be accessed / seen outside of the class it is in;", mk: "1" },
        { m: "Protected means it can be accessed / seen in the class it is in and in any subclasses / derived classes;", mk: "1" }
      ], result: "Public: anywhere. Protected: class + subclasses" } },
    { worked: { tag: "exam", title: "What is overriding?", src: "A-level June 2022 · P1 Q06.4 · 1 mark",
      q: "In object-oriented programming, what is meant by overriding?",
      steps: [{ m: "When a derived class / subclass has a different implementation for a method to the class it inherits from (the base class);", mk: "1" }],
      result: "A subclass re-implements an inherited method" } },
    { worked: { tag: "exam", title: "What is polymorphism?", src: "A-level June 2021 · P1 Q09.3 · 1 mark",
      q: "In object-oriented programming, what is meant by polymorphism?",
      steps: [{ m: "Objects of different classes respond differently to the use of a common interface / the same method call // a method shared up and down the inheritance chain but implemented differently by each class // the ability to process objects differently depending on their class;", mk: "1" }],
      result: "Same call, different behaviour by class" } },
    { worked: { tag: "exam", title: "Why the attribute is not private", src: "A-level June 2021 · P1 Q09.1 · 1 mark",
      q: "In a game, the Piece class has an attribute FuelCostOfMove, which the subclasses Baron, LESS and PBDS use in their own overriding CheckMoveIsValid methods. Explain why the FuelCostOfMove attribute in the Piece class could not have been a private attribute.",
      steps: [{ m: "The classes that inherit from Piece would not be able to use it;", mk: "1", n: "A. naming a specific subclass that could not use it." }],
      result: "Subclasses need it: it must be protected" } },
    { worked: { tag: "exam", title: "Virtual vs abstract", src: "A-level June 2023 · P1 Q08 · 2 marks",
      q: "The Skeleton Program uses overriding. When a derived class overrides a method from the base class, the base class method could be either a virtual method or an abstract method. Describe two differences between a virtual method and an abstract method.",
      steps: [
        { m: "Virtual methods may (do not have to) be overridden by the derived class // abstract methods must be overridden;", mk: "1" },
        { m: "Virtual methods have an implementation/body in the base class // abstract methods have no body, only a declaration;", mk: "1" },
        { m: "Abstract methods can only be declared in abstract classes // virtual methods in abstract and non-abstract classes;", mk: "(1)", n: "Max 2." }
      ], result: "May vs must override · body vs no body" } },
    { worked: { tag: "exam", title: "Which relationship is missing?", src: "A-level June 2020 · P1 Q08.4 · 1 mark",
      q: "A partially completed class diagram shows hollow-triangle inheritance lines and black-diamond composition lines only. Aggregation, composition and inheritance are three different types of relationship that can exist between classes. Which of these three is not shown?",
      steps: [{ m: "Aggregation;", mk: "1", n: "Aggregation would be a WHITE diamond." }],
      result: "Aggregation" } },
    { worked: { tag: "exam", title: "Could IsEmpty be private?", src: "A-level June 2024 · P1 Q09.1 · 1 mark",
      q: "The Cell class has a public method IsEmpty that is only ever called by other methods of the Cell class (such as GetSymbol). Explain why IsEmpty could have been a private method instead of a public method.",
      steps: [{ m: "Because it is only called by methods inside the class // it is never used/called from outside the class;", mk: "1", n: "NE. \"it is only called from GetSymbol\" — say it is never called from OUTSIDE the class." }],
      result: "Never called from outside the class" } },
    { worked: { tag: "exam", title: "Local variable vs private attribute", src: "A-level June 2024 · P1 Q09.2 · 1 mark",
      q: "The CheckSymbolAllowed method in the Cell class uses a local variable. Explain one difference between a local variable and a private class attribute.",
      steps: [{ m: "A local variable can only be used in the method in which it is declared, whereas a private attribute can be used/accessed anywhere in the class;", mk: "1", n: "Also true: the local exists only during the call; the attribute exists as long as the object." }],
      result: "Method scope vs whole-class scope" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Definitions**: class = blueprint; object = instance; instantiation = new + constructor → reference.",
      "**Specifiers**: + public anywhere · - private class only · # protected class + subclasses. Answer BOTH sides of a \"difference\".",
      "**Overriding** = a subclass's different implementation; **polymorphism** = same call, different behaviour by class.",
      "**Virtual** may be overridden, has a body; **abstract** must be overridden, has none, lives in an abstract class.",
      "**Composition** black ◆ (owns, same lifetime); **aggregation** white ◇ (refers, independent); diamond at the WHOLE.",
      "**Writing a class** (4-mark style): header with parent · private attributes with types · override the method · public getters/new methods."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Protected means other classes can access it.\" — only INHERITING classes (A-level 2020 NE).",
      "\"Polymorphism and overriding are the same.\" — overriding is the mechanism; polymorphism is the effect of one call working on many classes.",
      "\"A static method belongs to each object.\" — it belongs to the class; there is one copy.",
      "Diamond at the wrong end loses the relationship mark: it goes on the WHOLE (the container)."
    ] } },
    { callout: { t: "mnemonic", h: "\"PIE, plus the diamonds\"", body: "**P**olymorphism · **I**nheritance · **E**ncapsulation — plus composition (black ◆, the whole owns its parts) and aggregation (white ◇, it only refers to them). Specifiers: **+** public, **-** private, **#** protected — \"# is family only\"." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.1 references and user-defined types; 4.1.1.13 local variables vs attributes; 4.1.2.1 paradigms; 4.2.1.4 abstract data types implemented as classes (Stack, Queue); 4.4.1 abstraction and information hiding; NEA.4 complex OOP (polymorphism, interfaces) is Group A." } }
  ],
  flashcards: [
    ["Class?", "A blueprint defining the attributes and methods common to a type of object."],
    ["Object?", "An instance of a class."],
    ["Instantiation?", "Creating an object from a class: new calls the constructor and a reference is assigned to a variable."],
    ["Encapsulation?", "Bundling attributes with the methods that act on them, hiding the attributes so they are only reached through the class's methods."],
    ["Inheritance?", "A subclass takes on the attributes and methods of its base class and can add or override — an \"is a\" relationship."],
    ["Overriding?", "A subclass giving its own implementation of an inherited method."],
    ["Polymorphism?", "Objects of different classes responding differently to the same method call/interface."],
    ["Private vs protected?", "Private: only its own class. Protected: its class and any subclass."],
    ["Public?", "Accessible from anywhere."],
    ["Virtual vs abstract method?", "Virtual has a body and MAY be overridden; abstract has no body and MUST be overridden (abstract classes only)."],
    ["Static method?", "Belongs to the class, not an object; called via the class name."],
    ["Composition?", "Strong \"has a\": the whole creates and owns the parts; they share its lifetime. Black diamond."],
    ["Aggregation?", "Weak \"has a\": the whole refers to parts that exist independently. White diamond."],
    ["UML specifier symbols?", "+ public, - private, # protected."],
    ["Three OO design principles?", "Encapsulate what varies; favour composition over inheritance; program to interfaces, not implementation."]
  ],
  quiz: [
    { q: "In UML, # means", opts: ["protected", "private", "public", "static"], ans: 0, why: "+ public, - private, # protected." },
    { q: "A black (filled) diamond shows", opts: ["composition", "aggregation", "inheritance", "an interface"], ans: 0, why: "Strong ownership." },
    { q: "An abstract method", opts: ["has no body and must be overridden", "has a body and may be overridden", "belongs to the class, not the object", "can be called with no object"], ans: 0, why: "A-level 2023 Q08." },
    { q: "Shape s = new Square(2); s.Describe() runs", opts: ["Square's override, if it has one", "always Shape's version", "nothing — it does not compile", "both versions"], ans: 0, why: "Polymorphism: the object's class decides." },
    { q: "Which can NOT be instantiated?", opts: ["an abstract class", "a subclass", "a class with private attributes", "a class with a static method"], ans: 0, why: "Abstract classes are incomplete." },
    { q: "An attribute subclasses must use but other classes must not should be", opts: ["protected", "private", "public", "static"], ans: 0, why: "A-level 2021 Q09.1." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
