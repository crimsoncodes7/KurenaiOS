/* Kurenai OS — data/content/code-u6.js
   Code · Unit 6 · Files, exceptions and debugging (roadmap 5.3).

   Same contract as units 1–5 (docs/code-plan.md §4). Files live on the
   in-app runner's in-memory disk: a listing, practice item, task or case
   brings its files as { "name.txt": "text" }, the program reads and writes
   them, and the page shows what changed. tools/cs_diff.mjs runs each such
   program in a fresh folder holding the same files, so .NET reads exactly
   what the runner read. Stack traces are shown as text (their paths and
   frames differ between machines); exceptions are compared by type.     */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  /* a listing: run(id, cap, src[, stdin]) — or with options { stdin, fs, fails } */
  function run(id, cap, src, o) {
    o = typeof o === "string" ? { stdin: o } : (o || {});
    var r = { id: id, cap: cap, src: src, stdin: o.stdin || "" };
    if (o.fs) r.fs = o.fs;
    if (o.fails) r.fails = true;
    return { run: r };
  }
  function page(t) { return { page: t }; }
  function call(t, h, body) { return { callout: { t: t, h: h, body: body } }; }
  function text(cap, src) { return { code: { lang: "text", src: src, cap: cap } }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  function uses(re, msg, id) { return { id: id || "uses", test: function (s) { return re.test(s); }, msg: msg }; }

  var SCORES = { "scores.txt": "Ada,91\nKai,74\nLin,88\n" };

  K.add({ concepts: {
    "exceptions": { name: "Exceptions", lesson: "6.1", about: "how a program stops" },
    "read-file": { name: "Reading files", lesson: "6.2", about: "ReadAllLines, StreamReader" },
    "write-file": { name: "Writing files", lesson: "6.3", about: "WriteAllText, AppendAllText, StreamWriter" },
    "using-dispose": { name: "using and Dispose", lesson: "6.3", about: "closing what you open" },
    "try-catch": { name: "try, catch, finally", lesson: "6.4", about: "recovering from an exception" },
    "throw-own": { name: "Throwing exceptions", lesson: "6.5", about: "the right type, a clear message" },
    "validate-data": { name: "Validating data", lesson: "6.6", about: "reject, repair or report" },
    "debugging": { name: "A debugging method", lesson: "6.7", about: "hypothesis, test, narrow" },
    "stack-trace": { name: "Stack traces", lesson: "6.8", about: "where it went wrong" },
    "log-analysis": { name: "Processing a log", lesson: "6.9", about: "read, survive, report" }
  } });

  /* ================================================================
     6.1 Exceptions: when it goes wrong
     ================================================================ */
  lesson("6.1", {
    aqa: "4.1.1.9",
    notes: [
      page("The problem it solves"),
      { ul: [ "Some problems only appear while the program runs: a file is missing, a user types `abc`, a list is empty.", "C# reports them by **throwing an exception**: an object saying what went wrong, which stops the program unless something catches it.", "Reading one well is the first skill; 6.4 handles them." ] },
      page("Core idea"),
      run("stop", "the program stops at the throw", 'Console.WriteLine("before");\nint n = int.Parse("abc");\nConsole.WriteLine("after");', { fails: true }),
      { ul: [ "`before` prints; `int.Parse` throws `FormatException`; `after` never runs.", "The error card shows the exception's **type**, its **message**, and the **line** it came from." ] },
      run("look", "catching one to look at it", 'try\n{\n    int n = int.Parse("abc");\n}\ncatch (FormatException e)\n{\n    Console.WriteLine(e.GetType().Name);\n    Console.WriteLine(e.Message);\n}'),
      page("Rules"),
      { ul: [
        "An exception has a type (what kind of problem), a `Message` (the details) and a stack trace (where, 6.8).",
        "When one is thrown, the rest of the method is skipped; each caller is skipped in turn until something catches it.",
        "Uncaught, it ends the program with the type and message.",
        "Exception types form a family: `FormatException` is an `Exception`; catching `Exception` catches them all.",
        "Exceptions are for the unexpected. Checking first (TryParse, ContainsKey, Count > 0) is cheaper and clearer for the expected."
      ] },
      { table: { head: ["Exception", "Usually because"], rows: [["FormatException", "text that is not a number was parsed"], ["IndexOutOfRangeException", "an array index outside 0 to Length − 1"], ["ArgumentOutOfRangeException", "a list index, Substring or argument out of range"], ["NullReferenceException", "a member used on null"], ["KeyNotFoundException", "a dictionary key that is not there"], ["InvalidOperationException", "the object cannot do that now (empty queue, changed list)"], ["DivideByZeroException", "integer division by 0"], ["FileNotFoundException", "a file that does not exist (6.2)"]] } },
      page("Variations"),
      { h: "Several kinds, one look" },
      run("kinds", "four common exceptions, caught and named", 'void Try(string what, Action act)\n{\n    try { act(); Console.WriteLine(what + ": fine"); }\n    catch (Exception e) { Console.WriteLine($"{what}: {e.GetType().Name}"); }\n}\nTry("parse", () => int.Parse("x"));\nTry("index", () => { int[] a = new int[2]; a[5] = 1; });\nTry("key", () => { var d = new Dictionary<string, int>(); int v = d["k"]; });\nTry("divide", () => { int z = 0; int r = 10 / z; });'),
      { h: "Thrown deep, felt at the top" },
      run("deep", "the exception travels up the calls", 'void C() => throw new InvalidOperationException("from C");\nvoid B() { C(); Console.WriteLine("B finished"); }\nvoid A() { B(); Console.WriteLine("A finished"); }\ntry { A(); }\ncatch (InvalidOperationException e) { Console.WriteLine("caught: " + e.Message); }'),
      { h: "Doubles do not throw" },
      run("double", "1.0 / 0 is infinity, not an exception", 'double d = 1.0 / 0;\nConsole.WriteLine(d);\nConsole.WriteLine(double.IsInfinity(d));'),
      page("Pitfalls"),
      { h: "Dividing by an int zero — DivideByZeroException" },
      run("pit-zero", "10 / 0 with ints", 'int count = 0;\nConsole.WriteLine(10 / count);'),
      { h: "A null string — NullReferenceException" },
      run("pit-null", "there is no string to measure", 'string name = null;\nConsole.WriteLine(name.Length);'),
      { h: "Throwing something that is not an exception — CS0029" },
      run("pit-throw", "only Exception objects can be thrown", 'throw "something went wrong";'),
      { h: "Ignoring the message" },
      "The message usually names the value and the parameter. Read it before changing code.",
      page("Connections"),
      { ul: [ "**Back:** 3.6 threw ArgumentException; 5.4's TryParse avoided FormatException.", "**Next:** 6.4 catches; 6.5 throws your own; 6.8 reads where.", "**AQA:** 4.1.1.9 exception handling." ] },
      page("Good practice"),
      { ul: [ "Read the type, the message and the line — in that order.", "Prevent the expected; catch the exceptional." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Name that exception* and *Safe divide*." ] },
      page("Quick reference"),
      run("qr", "an exception at a glance", 'try { var list = new List<int>(); Console.WriteLine(list[0]); }\ncatch (Exception e) { Console.WriteLine($"{e.GetType().Name}: {e.Message}"); }'),
      { ul: [ "Type, Message, stack trace.", "Uncaught → the program stops.", "Catching `Exception` catches every kind." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["DivideByZeroException", "integer division by 0", "Pitfalls"], ["NullReferenceException", "a member used on null", "Pitfalls"], ["CS0029", "throwing a value that is not an exception", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'try\n{\n    Console.WriteLine("a");\n    int x = int.Parse("b");\n    Console.WriteLine("c");\n}\ncatch (FormatException) { Console.WriteLine("d"); }\nConsole.WriteLine("e");', why: "a prints, Parse throws, c is skipped, the catch prints d, then e.", concepts: ["exceptions"] },
        { id: "p2", src: 'try { int[] a = new int[3]; a[3] = 1; }\ncatch (Exception e) { Console.WriteLine(e.GetType().Name); }', why: "Index 3 is past the end of a 3-element array.", concepts: ["exceptions"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the exception int.Parse throws for bad text.", src: 'try { int.Parse("x"); }\ncatch (@@) { Console.WriteLine("not a number"); }', out: "not a number", concepts: ["exceptions"] }
      ],
      bug: [
        { id: "b1", q: "It should print \"empty\" for an empty list instead of crashing.", src: 'var xs = new List<int>();\nConsole.WriteLine(xs[0] > 0 ? "positive" : "empty");', out: "empty", fixedText: "prints empty", why: "Check xs.Count == 0 first; reading xs[0] throws.", concepts: ["exceptions"] }
      ]
    },
    flashcards: [
      ["What happens to the rest of a method after a throw?", "It is skipped — and each caller's too — until a catch."],
      ["Three things an exception carries?", "Its type, its Message and its stack trace."],
      ["`int.Parse(\"abc\")` throws…", "FormatException."],
      ["`1.0 / 0` gives…", "Infinity — doubles do not throw."],
      ["Prevent or catch?", "Prevent the expected (TryParse, Count, ContainsKey); catch the exceptional."],
      ["Does catching `Exception` catch a FormatException?", "Yes — every exception is an Exception."]
    ],
    quiz: [
      { q: "`var d = new Dictionary<string,int>(); d[\"x\"]++;` throws…", opts: ["NullReferenceException", "KeyNotFoundException", "IndexOutOfRangeException", "nothing"], ans: 1, why: "Reading a missing key." },
      { q: "An uncaught exception…", opts: ["is ignored", "ends the program", "returns 0", "prints a warning and continues"], ans: 1, why: "It stops the program." },
      { q: "`int x = 5 / 0;` with a literal 0 gives…", opts: ["DivideByZeroException", "a compile error (CS0020)", "infinity", "0"], ans: 1, why: "The compiler sees a constant division by zero." }
    ]
  });
  K.add({ tasks: {
    "6.1-name": { lesson: "6.1", title: "Name that exception", tier: "warm-up", minutes: 10, concepts: ["exceptions"], requires: ["try-catch"],
      statement: ["Read a whole number as text and an index, one per line.", "Parse the number and print the character of `\"KURENAI\"` at the index. If anything goes wrong, print only the exception's type name (`e.GetType().Name`)."],
      starter: "",
      examples: [{ stdin: "x\n1", out: "FormatException" }, { stdin: "5\n2", out: "R" }],
      hidden: [{ stdin: "1\n9", out: "IndexOutOfRangeException" }, { stdin: "3\n0", out: "K" }],
      rules: [uses(/catch\s*\(\s*Exception\s+\w+\s*\)/, "Catch Exception e and print e.GetType().Name.")],
      hints: ["Wrap both steps in one try.", "catch (Exception e) { Console.WriteLine(e.GetType().Name); }", "int.Parse the first line (even though only the index is used)."],
      answer: 'try\n{\n    int n = int.Parse(Console.ReadLine());\n    int i = int.Parse(Console.ReadLine());\n    Console.WriteLine("KURENAI"[i]);\n}\ncatch (Exception e)\n{\n    Console.WriteLine(e.GetType().Name);\n}' },
    "6.1-divide": { lesson: "6.1", title: "Safe divide", tier: "core", minutes: 10, concepts: ["exceptions"], requires: ["tryparse", "guard"],
      statement: ["Read two lines. Print `a / b = q` (integer division). Prevent every exception rather than catching it:", "`Not a number` if either line is not a whole number; `Cannot divide by zero` if b is 0."],
      starter: "",
      examples: [{ stdin: "17\n5", out: "17 / 5 = 3" }, { stdin: "1\n0", out: "Cannot divide by zero" }],
      hidden: [{ stdin: "x\n2", out: "Not a number" }, { stdin: "-9\n2", out: "-9 / 2 = -4" }],
      rules: [{ id: "prevent", test: function (s) { return !/\bcatch\b/.test(s); }, msg: "Prevent the exceptions with checks — no try/catch here." }],
      hints: ["TryParse both lines.", "Guard b == 0 next.", "Then the division is safe."],
      answer: 'if (!int.TryParse(Console.ReadLine(), out int a) | !int.TryParse(Console.ReadLine(), out int b))\n{\n    Console.WriteLine("Not a number");\n    return;\n}\nif (b == 0)\n{\n    Console.WriteLine("Cannot divide by zero");\n    return;\n}\nConsole.WriteLine($"{a} / {b} = {a / b}");' }
  } });

  /* ================================================================
     6.2 Reading a file line by line
     ================================================================ */
  lesson("6.2", {
    aqa: "4.2.1.3",
    notes: [
      page("The problem it solves"),
      { ul: [ "Real data lives in files: marks, logs, settings.", "`File.ReadAllLines` reads a whole text file as one string per line; a `StreamReader` reads it a line at a time.", "Here the files sit on the in-app disk, shown above each listing." ] },
      page("Core idea"),
      run("readall", "every line at once", 'string[] lines = File.ReadAllLines("scores.txt");\nConsole.WriteLine($"{lines.Length} lines");\nforeach (string line in lines)\n{\n    string[] f = line.Split(\',\');\n    Console.WriteLine($"{f[0]} scored {f[1]}");\n}', { fs: SCORES }),
      run("reader", "one line at a time with StreamReader", 'using var reader = new StreamReader("scores.txt");\nstring line;\nint n = 0;\nwhile ((line = reader.ReadLine()) != null) n++;\nConsole.WriteLine($"{n} lines read");', { fs: SCORES }),
      page("Rules"),
      { ul: [
        "`File.ReadAllText` gives the whole file as ONE string; `ReadAllLines` gives a `string[]` without the line endings.",
        "`File.ReadLines` gives the lines one by one as you loop — the whole file is never held at once.",
        "`reader.ReadLine()` returns `null` at the end of the file.",
        "A missing file throws `FileNotFoundException`; a missing folder `DirectoryNotFoundException`. Check with `File.Exists` first.",
        "`using var reader = …` closes the file when the block ends (6.3)."
      ] },
      run("exists", "check before reading", 'foreach (string name in new[] { "scores.txt", "missing.txt" })\n    Console.WriteLine(File.Exists(name) ? $"{name}: {File.ReadAllLines(name).Length} lines" : $"{name}: not found");', { fs: SCORES }),
      page("Variations"),
      { h: "Skip a header" },
      run("header", "the first line names the columns", 'string[] lines = File.ReadAllLines("marks.csv");\nfor (int i = 1; i < lines.Length; i++)\n{\n    string[] f = lines[i].Split(\',\');\n    Console.WriteLine($"{f[0],-5} {f[1],3}");\n}', { fs: { "marks.csv": "name,mark\nAda,91\nKai,74\n" } }),
      { h: "Totals as you read" },
      run("total", "ReadLines in a foreach", 'int total = 0, count = 0;\nforeach (string line in File.ReadLines("readings.txt"))\n{\n    total += int.Parse(line);\n    count++;\n}\nConsole.WriteLine($"{count} readings, mean {(double)total / count:F1}");', { fs: { "readings.txt": "12\n15\n9\n14\n" } }),
      { h: "The whole text" },
      run("text", "ReadAllText for searching", 'string all = File.ReadAllText("poem.txt");\nConsole.WriteLine($"{all.Length} characters, {all.Split(\' \', \'\\n\').Length} words");\nConsole.WriteLine(all.Contains("rose"));', { fs: { "poem.txt": "a rose is\na rose\n" } }),
      { h: "Blank lines" },
      run("blank", "skip them as you read", 'int kept = 0;\nforeach (string line in File.ReadLines("notes.txt"))\n{\n    if (string.IsNullOrWhiteSpace(line)) continue;\n    kept++;\n}\nConsole.WriteLine(kept);', { fs: { "notes.txt": "one\n\ntwo\n   \nthree\n" } }),
      page("Choosing"),
      { table: { head: ["Need", "Use"], rows: [["a small file as lines", "`File.ReadAllLines`"], ["a big file, a line at a time", "`File.ReadLines` or a `StreamReader`"], ["the whole text at once", "`File.ReadAllText`"], ["stop early (first match)", "`File.ReadLines` or a reader — the rest is never read"]] } },
      page("Pitfalls"),
      { h: "A missing file — FileNotFoundException" },
      run("pit-missing", "the name is wrong", 'string[] lines = File.ReadAllLines("score.txt");', { fs: SCORES }),
      { h: "ReadAllText into a string[] — CS0029" },
      run("pit-type", "ReadAllText gives ONE string", 'string[] lines = File.ReadAllText("scores.txt");', { fs: SCORES }),
      { h: "A bad line stops the whole file" },
      run("pit-bad", "one non-number and the program ends", 'int total = 0;\nforeach (string line in File.ReadLines("readings.txt")) total += int.Parse(line);\nConsole.WriteLine(total);', { fs: { "readings.txt": "12\nERR\n9\n" } }),
      "6.6 decides what to do with such lines; 5.4's TryParse skips them.",
      page("Connections"),
      { ul: [ "**Back:** 5.2's Split for each line; 5.4's TryParse.", "**Next:** 6.3 writes files; 6.9 analyses a log.", "**AQA:** 4.2.1.3 fields, records and files." ] },
      page("Good practice"),
      { ul: [ "Read, then validate each line before using it.", "For big files, `ReadLines` — never hold more than you need." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Class average* and *Find a line*." ] },
      page("Quick reference"),
      run("qr", "reading at a glance", 'Console.WriteLine(File.Exists("scores.txt"));\nConsole.WriteLine(File.ReadAllLines("scores.txt")[1]);\nusing var r = new StreamReader("scores.txt");\nConsole.WriteLine(r.ReadLine());', { fs: SCORES }),
      { ul: [ "`ReadAllLines` → `string[]`; `ReadAllText` → `string`; `ReadLines` → one at a time.", "`ReadLine()` is null at the end.", "`File.Exists` before reading." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["FileNotFoundException", "no file with that name", "Pitfalls"], ["CS0029", "ReadAllText stored in a string[]", "Pitfalls"], ["FormatException", "a line that is not a number", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'string[] lines = File.ReadAllLines("scores.txt");\nConsole.WriteLine(lines.Length + " " + lines[2].Split(\',\')[0]);', fs: SCORES, why: "Three lines; the third starts with Lin.", concepts: ["read-file"] },
        { id: "p2", src: 'using var r = new StreamReader("scores.txt");\nr.ReadLine();\nConsole.WriteLine(r.ReadLine());', fs: SCORES, why: "The first ReadLine is thrown away; the second reads Kai's line.", concepts: ["read-file"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to read the file as an array of lines.", src: 'string[] lines = File.@@("scores.txt");\nConsole.WriteLine(lines.Length);', fs: SCORES, out: "3", concepts: ["read-file"] }
      ],
      bug: [
        { id: "b1", q: "It should print \"no file\" when the file is missing.", src: 'string[] lines = File.ReadAllLines("data.txt");\nConsole.WriteLine(lines.Length);', out: "no file", fixedText: "prints no file", why: "Check File.Exists(\"data.txt\") before reading.", concepts: ["read-file"] }
      ]
    },
    flashcards: [
      ["ReadAllText vs ReadAllLines?", "One string vs a string[] of lines (without line endings)."],
      ["What does `reader.ReadLine()` return at the end?", "null."],
      ["Reading a file that does not exist throws…", "FileNotFoundException."],
      ["Why use ReadLines for a big file?", "It reads one line at a time instead of holding the whole file."],
      ["How do you avoid FileNotFoundException?", "Check `File.Exists(path)` first."]
    ],
    quiz: [
      { q: "A file has 4 lines ending in a newline. `File.ReadAllLines(f).Length` is…", opts: ["3", "4", "5", "it depends"], ans: 1, why: "The final newline does not make an extra line." },
      { q: "Best for reading only the first matching line of a huge file:", opts: ["ReadAllText", "ReadAllLines", "ReadLines with break", "Split"], ans: 2, why: "Stops reading at the match." },
      { q: "`while ((line = r.ReadLine()) != null)` stops when…", opts: ["a blank line is read", "the file ends", "an error occurs", "never"], ans: 1, why: "ReadLine gives null at the end." }
    ]
  });
  K.add({ tasks: {
    "6.2-average": { lesson: "6.2", title: "Class average", tier: "core", minutes: 12, concepts: ["read-file"], requires: ["split", "format"],
      fs: { "marks.csv": "name,mark\nAda,91\nKai,74\nLin,88\nZed,40\n" },
      statement: ["`marks.csv` has a header line, then `name,mark` rows.", "Print `N students, mean X.X, top NAME`."],
      starter: "",
      examples: [{ stdin: "", out: "4 students, mean 73.2, top Ada" }],
      hidden: [{ stdin: "", fs: { "marks.csv": "name,mark\nSolo,50\n" }, out: "1 students, mean 50.0, top Solo" }, { stdin: "", fs: { "marks.csv": "name,mark\nA,10\nB,30\nC,30\n" }, out: "3 students, mean 23.3, top B" }],
      rules: [uses(/File\.Read/, "Read marks.csv with File.ReadAllLines (or ReadLines).")],
      hints: ["Skip line 0, the header.", "Split each row on ','; parse the mark.", "Keep the best with >, so the first of a tie wins."],
      answer: 'string[] lines = File.ReadAllLines("marks.csv");\nint total = 0, best = -1;\nstring top = "";\nfor (int i = 1; i < lines.Length; i++)\n{\n    string[] f = lines[i].Split(\',\');\n    int mark = int.Parse(f[1]);\n    total += mark;\n    if (mark > best) { best = mark; top = f[0]; }\n}\nint n = lines.Length - 1;\nConsole.WriteLine($"{n} students, mean {(double)total / n:F1}, top {top}");' },
    "6.2-find": { lesson: "6.2", title: "Find a line", tier: "warm-up", minutes: 10, concepts: ["read-file"], requires: ["readline"],
      fs: { "log.txt": "09:00 start\n09:05 load users\n09:07 ERROR disk full\n09:09 retry\n" },
      statement: ["Read a search word from the keyboard.", "Print the first line of `log.txt` that contains it, as `line N: TEXT` (counting from 1) — or `not found`. If the file is missing, print `no log`."],
      starter: "string word = Console.ReadLine();\n",
      examples: [{ stdin: "ERROR", out: "line 3: 09:07 ERROR disk full" }],
      hidden: [{ stdin: "zebra", out: "not found" }, { stdin: "09", out: "line 1: 09:00 start" }, { stdin: "x", fs: {}, out: "no log" }],
      rules: [uses(/File\.Exists/, "Check that log.txt exists first.")],
      hints: ["if (!File.Exists(\"log.txt\")) { … return; }", "Loop over File.ReadLines with a counter.", "Stop at the first match."],
      answer: 'string word = Console.ReadLine();\nif (!File.Exists("log.txt"))\n{\n    Console.WriteLine("no log");\n    return;\n}\nint n = 0;\nforeach (string line in File.ReadLines("log.txt"))\n{\n    n++;\n    if (line.Contains(word))\n    {\n        Console.WriteLine($"line {n}: {line}");\n        return;\n    }\n}\nConsole.WriteLine("not found");' }
  } });

  /* ================================================================
     6.3 Writing files
     ================================================================ */
  lesson("6.3", {
    aqa: "4.2.1.3",
    notes: [
      page("The problem it solves"),
      { ul: [ "A program's results vanish when it ends unless they are saved.", "`File.WriteAllText` and friends write a whole file in one call; a `StreamWriter` writes piece by piece.", "After each run, the page shows the files the program wrote." ] },
      page("Core idea"),
      run("write", "write, append, read back", 'File.WriteAllText("greeting.txt", "Hello\\n");\nFile.AppendAllText("greeting.txt", "Again\\n");\nConsole.Write(File.ReadAllText("greeting.txt"));'),
      run("lines", "a collection, one per line", 'var names = new List<string> { "Ada", "Kai", "Lin" };\nFile.WriteAllLines("names.txt", names);\nFile.AppendAllLines("names.txt", new[] { "Zed" });\nConsole.WriteLine(File.ReadAllLines("names.txt").Length);'),
      page("Rules"),
      { ul: [
        "`WriteAllText`/`WriteAllLines` create the file, or REPLACE everything in it.",
        "`AppendAllText`/`AppendAllLines` add to the end, creating the file if needed.",
        "A `StreamWriter` keeps text in memory and writes it when flushed or disposed — `using` makes sure that happens.",
        "`new StreamWriter(path, true)` appends; without `true` it starts the file afresh.",
        "Writing into a folder that does not exist throws `DirectoryNotFoundException`."
      ] },
      run("writer", "a StreamWriter inside using", 'using (var w = new StreamWriter("report.txt"))\n{\n    w.WriteLine("Report");\n    for (int i = 1; i <= 3; i++) w.WriteLine($"item {i}");\n}\nConsole.WriteLine(File.ReadAllLines("report.txt").Length + " lines written");'),
      page("Variations"),
      { h: "Building, then writing once" },
      run("build", "collect lines, then WriteAllLines", 'var output = new List<string>();\nforeach (string line in File.ReadLines("scores.txt"))\n{\n    string[] f = line.Split(\',\');\n    if (int.Parse(f[1]) >= 80) output.Add(f[0]);\n}\nFile.WriteAllLines("honours.txt", output);\nConsole.WriteLine(string.Join(", ", File.ReadAllLines("honours.txt")));', { fs: SCORES }),
      { h: "A log that grows" },
      run("log", "append one line per event", 'void Log(string msg) => File.AppendAllText("app.log", msg + "\\n");\nLog("started");\nLog("loaded 3 users");\nLog("stopped");\nConsole.Write(File.ReadAllText("app.log"));'),
      { h: "Replacing a file safely" },
      run("safe", "write a new file, then swap it in", 'File.WriteAllText("settings.tmp", "theme=dark\\n");\nif (File.Exists("settings.txt")) File.Delete("settings.txt");\nFile.Move("settings.tmp", "settings.txt");\nConsole.Write(File.ReadAllText("settings.txt"));\nConsole.WriteLine(File.Exists("settings.tmp"));', { fs: { "settings.txt": "theme=light\n" } }),
      { h: "using var" },
      run("usingvar", "the writer closes at the end of the block", 'void Save(string path, int[] xs)\n{\n    using var w = new StreamWriter(path);\n    foreach (int x in xs) w.WriteLine(x);\n}\nSave("nums.txt", new[] { 4, 8, 15 });\nConsole.WriteLine(File.ReadAllText("nums.txt").Replace("\\n", " "));'),
      page("Under the hood"),
      { ul: [ "Writing to a disk is slow, so a StreamWriter collects text in a buffer and writes it in large pieces.", "`Flush()` writes the buffer now; `Dispose()` flushes and closes the file.", "`using` calls `Dispose()` when the block ends — even if an exception is thrown inside it." ] },
      page("Pitfalls"),
      { h: "Forgetting to close a writer" },
      run("pit-close", "the text never reaches the file", 'var w = new StreamWriter("forgot.txt");\nw.WriteLine("never flushed");\nConsole.WriteLine("[" + File.ReadAllText("forgot.txt") + "]");'),
      "Wrap writers in `using` (or call `Dispose()`).",
      { h: "Write when you meant Append" },
      run("pit-overwrite", "the old contents are gone", 'File.WriteAllText("diary.txt", "Tuesday\\n");\nConsole.Write(File.ReadAllText("diary.txt"));', { fs: { "diary.txt": "Monday\n" } }),
      { h: "A missing argument — CS1501" },
      run("pit-args", "WriteAllText needs the text too", 'File.WriteAllText("a.txt");'),
      { h: "A folder that does not exist — DirectoryNotFoundException" },
      run("pit-folder", "out/ was never made", 'File.WriteAllText("out/result.txt", "x");'),
      page("Connections"),
      { ul: [ "**Back:** 5.5's StringBuilder builds big text first.", "**Next:** 6.4's `finally` and `using` close files on error; 6.9 writes a report.", "**AQA:** 4.2.1.3 files — writing records." ] },
      page("Good practice"),
      { ul: [ "Always `using` for readers and writers.", "Decide deliberately: replace (`Write…`) or add (`Append…`)." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Save the list* and *Split the file*." ] },
      page("Quick reference"),
      run("qr", "writing at a glance", 'File.WriteAllText("a.txt", "one\\n");\nFile.AppendAllLines("a.txt", new[] { "two" });\nusing (var w = new StreamWriter("a.txt", true)) w.WriteLine("three");\nConsole.WriteLine(string.Join(",", File.ReadAllLines("a.txt")));'),
      { ul: [ "`Write…` replaces; `Append…` adds.", "StreamWriter: `using`, `WriteLine`, `true` to append.", "The folder must exist." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["(lost text)", "a writer never disposed", "Pitfalls"], ["CS1501", "a File method given the wrong number of arguments", "Pitfalls"], ["DirectoryNotFoundException", "writing into a missing folder", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'File.WriteAllText("t.txt", "a\\n");\nFile.WriteAllText("t.txt", "b\\n");\nFile.AppendAllText("t.txt", "c\\n");\nConsole.Write(File.ReadAllText("t.txt"));', why: "The second write replaces a; c is appended.", concepts: ["write-file"] },
        { id: "p2", src: 'using (var w = new StreamWriter("n.txt"))\n    for (int i = 0; i < 3; i++) w.Write(i);\nConsole.WriteLine(File.ReadAllText("n.txt"));', why: "Write adds no line breaks: 012.", concepts: ["using-dispose"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the line is ADDED to the file, not replacing it.", src: 'File.@@("log.txt", "two\\n");\nConsole.Write(File.ReadAllText("log.txt"));', fs: { "log.txt": "one\n" }, out: "one\ntwo", concepts: ["write-file"] }
      ],
      bug: [
        { id: "b1", q: "It should print the saved line.", src: 'var w = new StreamWriter("out.txt");\nw.WriteLine("saved");\nConsole.Write(File.ReadAllText("out.txt"));', out: "saved", fixedText: "prints saved", why: "The writer is never disposed, so nothing is written. Use using (or w.Dispose()) before reading.", concepts: ["using-dispose"] }
      ]
    },
    flashcards: [
      ["WriteAllText on an existing file?", "Replaces everything in it."],
      ["Add to the end of a file?", "AppendAllText / AppendAllLines, or new StreamWriter(path, true)."],
      ["Why wrap a StreamWriter in using?", "Dispose flushes the buffer and closes the file, even after an exception."],
      ["What does Flush do?", "Writes the buffered text to the file now."],
      ["Writing into a folder that does not exist?", "DirectoryNotFoundException."]
    ],
    quiz: [
      { q: "A StreamWriter is created and written to, but never disposed. The file contains…", opts: ["the text", "nothing", "half the text", "an error message"], ans: 1, why: "The buffer was never flushed." },
      { q: "`new StreamWriter(\"a.txt\", true)`…", opts: ["replaces a.txt", "appends to a.txt", "reads a.txt", "deletes a.txt"], ans: 1, why: "true means append." },
      { q: "Safest way to replace an important file?", opts: ["WriteAllText over it", "write a temp file, then swap", "append to it", "delete it first, then write"], ans: 1, why: "The old file survives until the new one is complete." }
    ]
  });
  K.add({ tasks: {
    "6.3-save": { lesson: "6.3", title: "Save the list", tier: "warm-up", minutes: 10, concepts: ["write-file"], requires: ["input-loop"],
      statement: ["Read names until `done`. Write them to `names.txt`, one per line, sorted alphabetically.", "Then read the file back and print `Saved N: first … last` (the first and last names in the file)."],
      starter: "",
      examples: [{ stdin: "Kai\nAda\nLin\ndone", out: "Saved 3: Ada … Lin" }],
      hidden: [{ stdin: "Zed\ndone", out: "Saved 1: Zed … Zed" }],
      rules: [uses(/WriteAllLines|StreamWriter/, "Write the file with WriteAllLines or a StreamWriter."), uses(/ReadAllLines|ReadLines|ReadAllText/, "Read the file back.", "readback")],
      hints: ["Collect into a List<string> and Sort it.", "File.WriteAllLines(\"names.txt\", names);", "string[] back = File.ReadAllLines(\"names.txt\");"],
      answer: 'var names = new List<string>();\nstring n = Console.ReadLine();\nwhile (n != "done")\n{\n    names.Add(n);\n    n = Console.ReadLine();\n}\nnames.Sort();\nFile.WriteAllLines("names.txt", names);\nstring[] back = File.ReadAllLines("names.txt");\nConsole.WriteLine($"Saved {back.Length}: {back[0]} … {back[^1]}");' },
    "6.3-split": { lesson: "6.3", title: "Split the file", tier: "core", minutes: 15, concepts: ["write-file", "read-file"], requires: ["split"],
      fs: { "scores.txt": "Ada,91\nKai,44\nLin,88\nZed,12\n" },
      statement: ["Read `scores.txt` (`name,score`). Write the names scoring 50 or more to `pass.txt` and the rest to `retake.txt`, one per line, in file order.", "Print `pass: N, retake: M` and then each file's contents as `pass.txt: a, b` and `retake.txt: c, d` (an empty file shows nothing after the colon)."],
      starter: "",
      examples: [{ stdin: "", out: "pass: 2, retake: 2\npass.txt: Ada, Lin\nretake.txt: Kai, Zed" }],
      hidden: [{ stdin: "", fs: { "scores.txt": "Solo,99\n" }, out: "pass: 1, retake: 0\npass.txt: Solo\nretake.txt: " }],
      rules: [uses(/pass\.txt/, "Write pass.txt."), uses(/retake\.txt/, "Write retake.txt.", "retake")],
      hints: ["Two lists while reading.", "File.WriteAllLines for each (an empty list makes an empty file).", "Read each back and Join with \", \"."],
      answer: 'var pass = new List<string>();\nvar retake = new List<string>();\nforeach (string line in File.ReadLines("scores.txt"))\n{\n    string[] f = line.Split(\',\');\n    (int.Parse(f[1]) >= 50 ? pass : retake).Add(f[0]);\n}\nFile.WriteAllLines("pass.txt", pass);\nFile.WriteAllLines("retake.txt", retake);\nConsole.WriteLine($"pass: {pass.Count}, retake: {retake.Count}");\nConsole.WriteLine("pass.txt: " + string.Join(", ", File.ReadAllLines("pass.txt")));\nConsole.WriteLine("retake.txt: " + string.Join(", ", File.ReadAllLines("retake.txt")));' }
  } });

  /* ================================================================
     6.4 try, catch and finally
     ================================================================ */
  lesson("6.4", {
    aqa: "4.1.1.9",
    notes: [
      page("The problem it solves"),
      { ul: [ "Some failures cannot be prevented by a check: a file deleted between `Exists` and `Read`, a network that drops.", "`try` runs code that might throw; `catch` runs if it does; `finally` runs either way.", "The skill is catching only what you can deal with, and letting the rest through." ] },
      page("Core idea"),
      run("basic", "try, catch, finally", 'string Load(string path)\n{\n    try\n    {\n        return File.ReadAllText(path).Trim();\n    }\n    catch (FileNotFoundException)\n    {\n        return "(no file)";\n    }\n    finally\n    {\n        Console.WriteLine("tried " + path);\n    }\n}\nConsole.WriteLine(Load("motto.txt"));\nConsole.WriteLine(Load("nope.txt"));', { fs: { "motto.txt": "Keep going\n" } }),
      page("Rules"),
      { ul: [
        "The first `catch` whose type fits is used; put specific types BEFORE general ones.",
        "A catch for a base type after one for its derived type is fine; the other way round is a compile error (CS0160).",
        "`catch (X e) when (condition)` only catches when the condition holds.",
        "`finally` runs whether the try finished, returned or threw — use it (or `using`) to release things.",
        "`throw;` inside a catch re-throws the same exception, keeping where it came from."
      ] },
      run("order", "specific first, general last", 'foreach (string s in new[] { "12", "x", "99999999999" })\n{\n    try { Console.WriteLine(int.Parse(s)); }\n    catch (FormatException) { Console.WriteLine($"{s}: not a number"); }\n    catch (OverflowException) { Console.WriteLine($"{s}: too big"); }\n    catch (Exception e) { Console.WriteLine($"{s}: {e.GetType().Name}"); }\n}'),
      page("Variations"),
      { h: "A filter with when" },
      run("when", "catch only the case you can fix", 'try\n{\n    throw new InvalidOperationException("retry later");\n}\ncatch (InvalidOperationException e) when (e.Message.Contains("retry"))\n{\n    Console.WriteLine("will retry");\n}'),
      { h: "Log and re-throw" },
      run("rethrow", "record it, then let it carry on up", 'void Save()\n{\n    try { File.WriteAllText("missing/out.txt", "x"); }\n    catch (DirectoryNotFoundException)\n    {\n        Console.WriteLine("log: save failed");\n        throw;\n    }\n}\ntry { Save(); }\ncatch (IOException e) { Console.WriteLine("caller sees: " + e.GetType().Name); }'),
      { h: "finally always runs" },
      run("finally", "even after return", 'int Count()\n{\n    try { return 3; }\n    finally { Console.WriteLine("cleaned up"); }\n}\nConsole.WriteLine(Count());'),
      { h: "Wrapping with a clearer message" },
      run("wrap", "an inner exception keeps the cause", 'try\n{\n    try { int.Parse("abc"); }\n    catch (FormatException e) { throw new InvalidOperationException("settings file is damaged", e); }\n}\ncatch (InvalidOperationException e)\n{\n    Console.WriteLine($"{e.Message} (because: {e.InnerException.GetType().Name})");\n}'),
      page("Choosing"),
      { table: { head: ["Situation", "Do"], rows: [["you can check first (TryParse, Exists, Count)", "check — no try"], ["you can recover (default, retry, ask again)", "catch that specific type"], ["you cannot recover here", "let it through (or log and `throw;`)"], ["something must be closed", "`using` or `finally`"]] } },
      page("Pitfalls"),
      { h: "General before specific — CS0160" },
      run("pit-order", "the FormatException catch can never run", 'try { int.Parse("x"); }\ncatch (Exception) { Console.WriteLine("any"); }\ncatch (FormatException) { Console.WriteLine("format"); }'),
      { h: "Swallowing everything" },
      run("pit-swallow", "the bug disappears from view", 'int total = 0;\nforeach (string s in new[] { "1", "2", "three" })\n{\n    try { total += int.Parse(s); }\n    catch { }\n}\nConsole.WriteLine(total);'),
      "An empty `catch { }` hides real problems. Catch a specific type and say what happened.",
      { h: "throw e; instead of throw;" },
      "`throw e;` restarts the stack trace at the catch, losing where the problem began; `throw;` keeps it.",
      page("Connections"),
      { ul: [ "**Back:** 6.1 exceptions, 6.3's `using`.", "**Next:** 6.5 throws your own; 6.8 reads the trace.", "**AQA:** 4.1.1.9 exception handling." ] },
      page("Good practice"),
      { ul: [ "Catch the narrowest type you can handle; let the rest through.", "Never leave a catch empty.", "Keep the try block small — just the line that can fail." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Settings loader* and *Retry the read*." ] },
      page("Quick reference"),
      run("qr", "try/catch/finally at a glance", 'try { Console.WriteLine(int.Parse("4x")); }\ncatch (FormatException e) when (e.Message.Length > 0) { Console.WriteLine("bad number"); }\ncatch (Exception) { throw; }\nfinally { Console.WriteLine("done"); }'),
      { ul: [ "Specific catches first.", "`when` filters; `throw;` re-throws.", "`finally` always runs." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0160", "a catch that can never run", "Pitfalls"], ["(hidden bug)", "an empty catch", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'try { Console.Write("a"); throw new Exception(); }\ncatch { Console.Write("b"); }\nfinally { Console.Write("c"); }\nConsole.WriteLine("d");', why: "a, the catch b, finally c, then d.", concepts: ["try-catch"] },
        { id: "p2", src: 'int F()\n{\n    try { return 1; }\n    finally { Console.Write("f"); }\n}\nConsole.WriteLine(F());', why: "finally prints f before the value is printed.", concepts: ["try-catch"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the block always runs.", src: 'try { Console.WriteLine("work"); }\n@@ { Console.WriteLine("tidy"); }', out: "work\ntidy", concepts: ["try-catch"] }
      ],
      bug: [
        { id: "b1", q: "It should print \"format\".", src: 'try { int.Parse("x"); }\ncatch (Exception) { Console.WriteLine("any"); }\ncatch (FormatException) { Console.WriteLine("format"); }', out: "format", fixedText: "prints format", why: "Put the specific FormatException catch first.", concepts: ["try-catch"] }
      ]
    },
    flashcards: [
      ["Order of catch clauses?", "Specific types first, general (Exception) last."],
      ["When does finally run?", "Always — after the try or catch, even after return or throw."],
      ["`throw;` vs `throw e;`?", "throw; keeps the original stack trace; throw e; restarts it."],
      ["What does `catch (X e) when (cond)` do?", "Catches X only when cond is true."],
      ["Why not `catch { }`?", "It hides every problem, including real bugs."]
    ],
    quiz: [
      { q: "`catch (Exception)` then `catch (FormatException)` gives…", opts: ["it works", "CS0160", "the second always runs", "a runtime error"], ans: 1, why: "The second can never be reached." },
      { q: "Best response to a file that might be missing, when you can check?", opts: ["try/catch", "File.Exists first", "catch { }", "finally"], ans: 1, why: "Prevent the expected." },
      { q: "Which runs even if the try returns early?", opts: ["catch", "finally", "neither", "both"], ans: 1, why: "finally always runs." }
    ]
  });
  K.add({ tasks: {
    "6.4-settings": { lesson: "6.4", title: "Settings loader", tier: "core", minutes: 15, concepts: ["try-catch", "read-file"], requires: ["split", "dictionary"],
      fs: { "settings.txt": "volume=7\ntheme=dark\nlimit=abc\n" },
      statement: ["Write `int GetInt(string key, int fallback)` that reads `settings.txt` (`key=value` lines) and returns the key's whole-number value.", "It returns `fallback` if the file is missing (catch FileNotFoundException), the key is absent, or the value is not a number (catch FormatException).", "Read keys from the keyboard until `done`; print `key = value` for each."],
      starter: "",
      examples: [{ stdin: "volume\nlimit\nspeed\ndone", out: "volume = 7\nlimit = -1\nspeed = -1" }],
      hidden: [{ stdin: "volume\ndone", fs: {}, out: "volume = -1" }],
      rules: [uses(/catch\s*\(\s*FileNotFoundException/, "Catch FileNotFoundException."), uses(/catch\s*\(\s*FormatException/, "Catch FormatException.", "format")],
      hints: ["Inside GetInt: try { read lines, find key=, return int.Parse(value); }", "catch (FileNotFoundException) { return fallback; } catch (FormatException) { return fallback; }", "After the loop, return fallback for a missing key. Use -1 as the fallback."],
      answer: 'string key = Console.ReadLine();\nwhile (key != "done")\n{\n    Console.WriteLine($"{key} = {GetInt(key, -1)}");\n    key = Console.ReadLine();\n}\n\nint GetInt(string key, int fallback)\n{\n    try\n    {\n        foreach (string line in File.ReadAllLines("settings.txt"))\n        {\n            string[] kv = line.Split(\'=\', 2);\n            if (kv[0] == key) return int.Parse(kv[1]);\n        }\n        return fallback;\n    }\n    catch (FileNotFoundException) { return fallback; }\n    catch (FormatException) { return fallback; }\n}' },
    "6.4-total": { lesson: "6.4", title: "Totals with a report", tier: "core", minutes: 12, concepts: ["try-catch"], requires: ["read-file"],
      fs: { "amounts.txt": "12\n7\nseven\n99999999999\n5\n" },
      statement: ["Read `amounts.txt`. Total the whole numbers using `int.Parse` inside a try.", "For each bad line print `line N: not a number` (FormatException) or `line N: too big` (OverflowException), then print `Total: T`."],
      starter: "",
      examples: [{ stdin: "", out: "line 3: not a number\nline 4: too big\nTotal: 24" }],
      hidden: [{ stdin: "", fs: { "amounts.txt": "1\n2\n" }, out: "Total: 3" }],
      rules: [uses(/catch\s*\(\s*FormatException/, "Catch FormatException."), uses(/catch\s*\(\s*OverflowException/, "Catch OverflowException.", "overflow")],
      hints: ["Count lines as you go (from 1).", "Two catch clauses, one per exception.", "Print the total after the loop."],
      answer: 'int total = 0, n = 0;\nforeach (string line in File.ReadLines("amounts.txt"))\n{\n    n++;\n    try { total += int.Parse(line); }\n    catch (FormatException) { Console.WriteLine($"line {n}: not a number"); }\n    catch (OverflowException) { Console.WriteLine($"line {n}: too big"); }\n}\nConsole.WriteLine($"Total: {total}");' }
  } });

  /* ================================================================
     6.5 Throwing your own exceptions
     ================================================================ */
  lesson("6.5", {
    aqa: "4.1.1.9",
    notes: [
      page("The problem it solves"),
      { ul: [ "A method that gets impossible input should not return a made-up value — it should say so loudly.", "`throw` with the RIGHT type and a CLEAR message tells the caller exactly what rule was broken.", "3.6 started this; here are the types to choose from and the shortcuts .NET provides." ] },
      page("Core idea"),
      run("throw", "the right type for the broken rule", 'decimal Fee(int age)\n{\n    if (age < 0) throw new ArgumentOutOfRangeException(nameof(age), age, "Age cannot be negative.");\n    return age < 18 ? 4.50m : 9.00m;\n}\ntry { Console.WriteLine(Fee(30)); Console.WriteLine(Fee(-2)); }\ncatch (ArgumentOutOfRangeException e) { Console.WriteLine(e.ParamName + ": " + e.Message.Split(\'\\n\')[0]); }'),
      run("guards", "the one-line guards", 'void Save(string name, int copies)\n{\n    ArgumentException.ThrowIfNullOrWhiteSpace(name);\n    ArgumentOutOfRangeException.ThrowIfNegativeOrZero(copies);\n    Console.WriteLine($"saved {copies} × {name}");\n}\nSave("report", 2);\ntry { Save(" ", 1); } catch (ArgumentException e) { Console.WriteLine(e.Message); }\ntry { Save("x", 0); } catch (ArgumentOutOfRangeException e) { Console.WriteLine(e.ParamName); }'),
      page("Rules"),
      { ul: [
        "`ArgumentNullException`: an argument is null. `ArgumentOutOfRangeException`: a number outside its range. `ArgumentException`: any other bad argument.",
        "`InvalidOperationException`: the arguments are fine but the object is not ready (an empty queue, a closed file).",
        "`NotImplementedException`: a stub you have not written yet (3.8).",
        "Pass `nameof(parameter)` so the message names it; the `ThrowIf…` helpers do that for you.",
        "Messages say what is wrong and what was expected, in a sentence."
      ] },
      run("state", "InvalidOperationException for the wrong moment", 'var stack = new Stack<int>();\nint Top()\n{\n    if (stack.Count == 0) throw new InvalidOperationException("The stack is empty; push something first.");\n    return stack.Peek();\n}\ntry { Top(); } catch (InvalidOperationException e) { Console.WriteLine(e.Message); }\nstack.Push(7);\nConsole.WriteLine(Top());'),
      page("Variations"),
      { h: "Ranges both ways" },
      run("range", "ThrowIfLessThan and ThrowIfGreaterThan", 'int Mark(int m)\n{\n    ArgumentOutOfRangeException.ThrowIfLessThan(m, 0);\n    ArgumentOutOfRangeException.ThrowIfGreaterThan(m, 100);\n    return m;\n}\nforeach (int m in new[] { 72, 140 })\n{\n    try { Console.WriteLine(Mark(m)); }\n    catch (ArgumentOutOfRangeException e) { Console.WriteLine(e.Message.Split(\'\\n\')[0]); }\n}'),
      { h: "A type of your own" },
      "A rule that belongs to YOUR program can have its own exception type (classes are unit 7 — this is the whole of it):",
      run("custom", "a custom exception class", 'try { Book(0); }\ncatch (NoSeatsException e) { Console.WriteLine("Sorry: " + e.Message); }\n\nvoid Book(int seatsLeft)\n{\n    if (seatsLeft == 0) throw new NoSeatsException("the 9:15 is full");\n    Console.WriteLine("booked");\n}\n\nclass NoSeatsException : Exception\n{\n    public NoSeatsException(string message) : base(message) { }\n}'),
      { h: "Stubs" },
      run("stub", "NotImplementedException marks unfinished work", 'try { Console.WriteLine(Tax(100m)); }\ncatch (NotImplementedException) { Console.WriteLine("Tax is not written yet"); }\n\ndecimal Tax(decimal amount) => throw new NotImplementedException();'),
      page("Choosing"),
      { table: { head: ["The problem", "Throw"], rows: [["an argument is null", "ArgumentNullException (ThrowIfNull)"], ["a number out of range", "ArgumentOutOfRangeException (ThrowIfNegative, ThrowIfGreaterThan …)"], ["any other bad argument", "ArgumentException (ThrowIfNullOrWhiteSpace …)"], ["the object is in the wrong state", "InvalidOperationException"], ["a rule of your program", "a custom exception"], ["not written yet", "NotImplementedException"]] } },
      page("Pitfalls"),
      { h: "No brackets after the type — CS1526" },
      run("pit-new", "new needs ()", 'throw new ArgumentException;'),
      { h: "Exception for everything" },
      run("pit-general", "a bare Exception says nothing", 'try { throw new Exception("error"); }\ncatch (Exception e) { Console.WriteLine(e.Message + " — which error? whose fault?"); }'),
      { h: "Throwing for the expected" },
      "\"The user typed a word\" is not exceptional — use TryParse (5.4). Throw when the CODE breaks a rule.",
      page("Connections"),
      { ul: [ "**Back:** 3.6's guard clauses; 6.4 catches what you throw.", "**Later:** unit 7 classes guard their own state with these exceptions.", "**AQA:** 4.1.1.9 exception handling." ] },
      page("Good practice"),
      { ul: [ "Guard at the top of a method; throw before anything is changed.", "Use `nameof` (or the ThrowIf helpers) so a renamed parameter stays right." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Bank withdrawal* and *Guarded average*." ] },
      page("Quick reference"),
      run("qr", "throwing at a glance", 'void Set(string name, int level)\n{\n    ArgumentNullException.ThrowIfNull(name);\n    ArgumentOutOfRangeException.ThrowIfGreaterThan(level, 5);\n    if (name.Length == 0) throw new ArgumentException("Name is empty.", nameof(name));\n}\ntry { Set("", 1); } catch (ArgumentException e) { Console.WriteLine(e.ParamName + " | " + e.Message); }'),
      { ul: [ "Argument(Null/OutOfRange)Exception for bad arguments.", "InvalidOperationException for the wrong state.", "`ThrowIf…` helpers; `nameof`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1526", "new without ()", "Pitfalls"], ["(vague)", "a bare Exception", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'try { ArgumentOutOfRangeException.ThrowIfNegative(-1); Console.WriteLine("ok"); }\ncatch (ArgumentException e) { Console.WriteLine(e.GetType().Name); }', why: "ArgumentOutOfRangeException is an ArgumentException, so the catch fits.", concepts: ["throw-own"] },
        { id: "p2", src: 'string s = null;\ntry { ArgumentNullException.ThrowIfNull(s); }\ncatch (ArgumentNullException e) { Console.WriteLine(e.ParamName); }', why: "The helper names the argument: s.", concepts: ["throw-own"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the exception for an object in the wrong state.", src: 'try { throw new @@("not started yet"); }\ncatch (InvalidOperationException e) { Console.WriteLine(e.Message); }', out: "not started yet", concepts: ["throw-own"] }
      ],
      bug: [
        { id: "b1", q: "Withdraw should refuse an amount above the balance by throwing, not return -1.", src: 'decimal balance = 50;\ntry { Console.WriteLine(Withdraw(80)); }\ncatch (InvalidOperationException) { Console.WriteLine("refused"); }\n\ndecimal Withdraw(decimal amount)\n{\n    if (amount > balance) return -1;\n    balance -= amount;\n    return balance;\n}', out: "refused", fixedText: "prints refused", why: "throw new InvalidOperationException(\"Not enough money.\");", concepts: ["throw-own"] }
      ]
    },
    flashcards: [
      ["Exception for a null argument?", "ArgumentNullException (ArgumentNullException.ThrowIfNull)."],
      ["Exception for a number out of range?", "ArgumentOutOfRangeException."],
      ["Exception for the right arguments at the wrong time?", "InvalidOperationException."],
      ["Why `nameof(age)`?", "The message names the parameter, and a rename keeps it right."],
      ["A custom exception class derives from…", "Exception (`class X : Exception`)."]
    ],
    quiz: [
      { q: "`Pop()` on an empty stack of your own should throw…", opts: ["ArgumentException", "InvalidOperationException", "FormatException", "nothing"], ans: 1, why: "The object is in the wrong state." },
      { q: "`throw new ArgumentException;` gives…", opts: ["an empty message", "CS1526", "a runtime error", "nothing"], ans: 1, why: "new needs ()." },
      { q: "When should a user typing \"abc\" for a number throw?", opts: ["always", "never — TryParse it", "only in a loop", "only on Fridays"], ans: 1, why: "Expected input problems are handled, not thrown." }
    ]
  });
  K.add({ tasks: {
    "6.5-bank": { lesson: "6.5", title: "Bank withdrawal", tier: "core", minutes: 15, concepts: ["throw-own", "try-catch"], requires: ["decimal", "input-loop"],
      statement: ["Start with a balance of £100.00. Write `void Withdraw(decimal amount)`: throw ArgumentOutOfRangeException if amount ≤ 0 (`ThrowIfNegativeOrZero`), InvalidOperationException if it is more than the balance; otherwise take it.", "Read amounts until `done`. Print `ok, balance £X.XX`, `bad amount` or `not enough` for each."],
      starter: "decimal balance = 100.00m;\n",
      examples: [{ stdin: "30\n-5\n80\n70\ndone", out: "ok, balance £70.00\nbad amount\nnot enough\nok, balance £0.00" }],
      hidden: [{ stdin: "0\ndone", out: "bad amount" }],
      rules: [uses(/throw\s+new\s+InvalidOperationException/, "Throw InvalidOperationException for too little money."), uses(/ThrowIfNegativeOrZero/, "Guard the amount with ArgumentOutOfRangeException.ThrowIfNegativeOrZero.", "guard")],
      hints: ["Withdraw throws; the loop catches.", "catch (ArgumentOutOfRangeException) { … } catch (InvalidOperationException) { … }", "Print with :F2 after a £."],
      answer: 'decimal balance = 100.00m;\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    try\n    {\n        Withdraw(decimal.Parse(line));\n        Console.WriteLine($"ok, balance £{balance:F2}");\n    }\n    catch (ArgumentOutOfRangeException) { Console.WriteLine("bad amount"); }\n    catch (InvalidOperationException) { Console.WriteLine("not enough"); }\n    line = Console.ReadLine();\n}\n\nvoid Withdraw(decimal amount)\n{\n    ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);\n    if (amount > balance) throw new InvalidOperationException("Not enough money.");\n    balance -= amount;\n}' },
    "6.5-average": { lesson: "6.5", title: "Guarded average", tier: "warm-up", minutes: 10, concepts: ["throw-own"], requires: ["list", "format"],
      statement: ["Write `double Average(List<int> xs)` that throws ArgumentException with the message `No values to average.` for an empty list.", "Read numbers until `done`; print `Average: X.XX`, or the exception's message if Average threw."],
      starter: "",
      examples: [{ stdin: "4\n5\ndone", out: "Average: 4.50" }, { stdin: "done", out: "No values to average." }],
      hidden: [{ stdin: "-3\ndone", out: "Average: -3.00" }],
      rules: [uses(/throw\s+new\s+ArgumentException/, "Throw an ArgumentException for an empty list.")],
      hints: ["if (xs.Count == 0) throw new ArgumentException(\"No values to average.\");", "Catch ArgumentException in the caller and print e.Message.", "Divide as double."],
      answer: 'var xs = new List<int>();\nstring s = Console.ReadLine();\nwhile (s != "done")\n{\n    xs.Add(int.Parse(s));\n    s = Console.ReadLine();\n}\ntry { Console.WriteLine($"Average: {Average(xs):F2}"); }\ncatch (ArgumentException e) { Console.WriteLine(e.Message); }\n\ndouble Average(List<int> xs)\n{\n    if (xs.Count == 0) throw new ArgumentException("No values to average.");\n    int total = 0;\n    foreach (int x in xs) total += x;\n    return (double)total / xs.Count;\n}' }
  } });

  /* ================================================================
     6.6 Validating input
     ================================================================ */
  lesson("6.6", {
    aqa: "4.13.1.4",
    notes: [
      page("The problem it solves"),
      { ul: [ "Bad data that gets past the front door spreads: a negative age is averaged, a blank name is saved, a report is wrong.", "For each kind of bad input, decide one of three things: **reject** it, **repair** it, or **report** it and carry on." ] },
      page("Core idea"),
      run("three", "reject, repair, report", 'var good = new List<int>();\nvar problems = new List<string>();\nforeach (string raw in new[] { "42", " 17 ", "-5", "abc", "250" })\n{\n    string s = raw.Trim();                                  // repair: spaces\n    if (!int.TryParse(s, out int age)) { problems.Add($"\\"{raw}\\" is not a number"); continue; }   // report\n    if (age < 0 || age > 120) { problems.Add($"{age} is out of range"); continue; }                   // reject\n    good.Add(age);\n}\nConsole.WriteLine("kept: " + string.Join(", ", good));\nforeach (string p in problems) Console.WriteLine("  " + p);'),
      page("Rules"),
      { ul: [
        "Validate at the boundary — where data enters (keyboard, file, network) — not deep inside.",
        "Check type (is it a number?), then range (0–120?), then format (an email shape?), then consistency (end after start?).",
        "Users can fix their input: ask again (3.6, 5.4). A file cannot: skip and report, or stop with a clear error.",
        "Repair only what is safe to repair (spaces, case); never guess a missing value.",
        "After validation, the rest of the program can trust the data."
      ] },
      run("record", "validating a whole record", 'string? Check(string line)\n{\n    string[] f = line.Split(\',\');\n    if (f.Length != 3) return "expected 3 fields";\n    if (string.IsNullOrWhiteSpace(f[0])) return "name is blank";\n    if (!int.TryParse(f[1], out int age) || age < 0 || age > 120) return "bad age";\n    if (!f[2].Contains(\'@\')) return "bad email";\n    return null;\n}\nforeach (string l in new[] { "Ada,36,ada@x.io", ",20,b@x.io", "Kai,old,k@x.io", "Lin,30" })\n    Console.WriteLine($"{l,-18} {Check(l) ?? "ok"}");'),
      page("Variations"),
      { h: "A validation report for a file" },
      run("report", "count good and bad, list the bad", 'int ok = 0;\nvar bad = new List<string>();\nstring[] lines = File.ReadAllLines("people.csv");\nfor (int i = 0; i < lines.Length; i++)\n{\n    string[] f = lines[i].Split(\',\');\n    if (f.Length == 2 && int.TryParse(f[1], out int age) && age >= 0) ok++;\n    else bad.Add($"line {i + 1}: {lines[i]}");\n}\nConsole.WriteLine($"{ok} good, {bad.Count} bad");\nforeach (string b in bad) Console.WriteLine("  " + b);', { fs: { "people.csv": "Ada,36\nKai,-1\nLin\nZed,19\n" } }),
      { h: "Consistency between fields" },
      run("consistent", "a start before its end", 'bool ValidRange(int start, int end) => start >= 0 && end > start;\nConsole.WriteLine(ValidRange(9, 17) + " " + ValidRange(17, 9) + " " + ValidRange(-1, 4));'),
      { h: "Normalising" },
      run("normalise", "a postcode in one standard shape", 'string Norm(string pc) => pc.Trim().ToUpperInvariant().Replace("  ", " ");\nConsole.WriteLine("[" + Norm("  m1  1ae ") + "]");'),
      page("Pitfalls"),
      { h: "Validating after using" },
      run("pit-late", "the bad value was used first", 'int age = int.Parse("-4");\nint birthYear = 2026 - age;\nif (age < 0) Console.WriteLine("invalid age");\nConsole.WriteLine(birthYear);'),
      { h: "TryParse without its out — CS1501" },
      run("pit-out", "TryParse needs somewhere to put the number", 'bool ok = int.TryParse("5");'),
      { h: "Guessing a repair" },
      "Turning a missing price into 0 makes the total wrong without anyone noticing. Report it.",
      page("Connections"),
      { ul: [ "**Back:** 3.6 guards, 5.4 TryParse, 6.5 throws for the code's own mistakes.", "**Next:** 6.9 validates a whole log.", "**AQA:** 4.13.1.4 testing — normal, boundary and erroneous data." ] },
      page("Good practice"),
      { ul: [ "Test with normal, boundary and erroneous values (AQA's three kinds).", "Keep validation in one method per kind of record." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Clean the register* and *Date check*." ] },
      page("Quick reference"),
      run("qr", "validation at a glance", 'string? Problem(string s) => !int.TryParse(s, out int n) ? "not a number" : n < 1 || n > 10 ? "out of range" : null;\nforeach (string s in new[] { "5", "x", "11" }) Console.WriteLine($"{s}: {Problem(s) ?? "ok"}");'),
      { ul: [ "Type → range → format → consistency.", "Users: ask again. Files: skip and report.", "Repair only what is safe." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1501", "TryParse without its out argument", "Pitfalls"], ["(wrong result)", "a value used before it was checked", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int ok = 0;\nforeach (string s in new[] { "3", "x", "-2", "7" })\n    if (int.TryParse(s, out int n) && n > 0) ok++;\nConsole.WriteLine(ok);', why: "3 and 7 pass both checks.", concepts: ["validate-data"] },
        { id: "p2", src: 'string? Check(string name) => string.IsNullOrWhiteSpace(name) ? "blank" : name.Length > 5 ? "too long" : null;\nConsole.WriteLine((Check("Ada") ?? "ok") + " " + Check(" ") + " " + Check("Kurenai"));', why: "Ada is fine; a space is blank; Kurenai is 7 letters.", concepts: ["validate-data"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so only 1 to 5 inclusive passes.", src: 'bool Valid(int n) => n >= 1 && n @@ 5;\nConsole.WriteLine(Valid(5) + " " + Valid(6));', out: "True False", concepts: ["validate-data"] }
      ],
      bug: [
        { id: "b1", q: "Ages outside 0–120 should be skipped, not counted.", src: 'int count = 0;\nforeach (string s in new[] { "30", "200", "45" })\n{\n    int age = int.Parse(s);\n    count++;\n    if (age > 120) continue;\n}\nConsole.WriteLine(count);', out: "2", fixedText: "prints 2", why: "Validate before counting: move the check above count++.", concepts: ["validate-data"] }
      ]
    },
    flashcards: [
      ["Reject, repair or report?", "Reject impossible values, repair only what is safe (spaces, case), report the rest."],
      ["Where should data be validated?", "At the boundary where it enters the program."],
      ["Order of checks?", "Type, then range, then format, then consistency."],
      ["Users vs files on bad input?", "Ask a user again; skip and report bad lines in a file."],
      ["AQA's three kinds of test data?", "Normal, boundary and erroneous."]
    ],
    quiz: [
      { q: "A file line has a blank price. Best response?", opts: ["treat it as 0", "skip and report it", "stop silently", "guess the average"], ans: 1, why: "Never guess; report." },
      { q: "Boundary test data for 1–10 includes…", opts: ["5", "1 and 10", "abc", "100"], ans: 1, why: "The edges of the range." },
      { q: "Where is validation cheapest?", opts: ["in every method", "where data enters", "in the report", "nowhere"], ans: 1, why: "Once at the boundary; then trust it." }
    ]
  });
  K.add({ tasks: {
    "6.6-register": { lesson: "6.6", title: "Clean the register", tier: "core", minutes: 15, concepts: ["validate-data"], requires: ["read-file", "tryparse"],
      fs: { "register.csv": "Ada, 16\nKai,abc\n ,17\nLin,15\nZed,99\n" },
      statement: ["Each line of `register.csv` is `name,age`. A line is good if the name (trimmed) is not blank and the age (trimmed) is a whole number from 11 to 19.", "Write the good lines to `clean.csv` as `name,age` (trimmed). Print `kept N, rejected M`, then one line per rejected line: `line K: REASON` with reason `blank name`, `bad age` or `out of range`."],
      starter: "",
      examples: [{ stdin: "", out: "kept 2, rejected 3\nline 2: bad age\nline 3: blank name\nline 5: out of range" }],
      hidden: [{ stdin: "", fs: { "register.csv": "A,11\nB,19\n" }, out: "kept 2, rejected 0" }],
      rules: [uses(/clean\.csv/, "Write the good lines to clean.csv.")],
      hints: ["Split each line, Trim both parts.", "Check the name first, then TryParse, then the range.", "Collect good lines in a List and WriteAllLines once."],
      answer: 'var kept = new List<string>();\nvar rejected = new List<string>();\nstring[] lines = File.ReadAllLines("register.csv");\nfor (int i = 0; i < lines.Length; i++)\n{\n    string[] f = lines[i].Split(\',\');\n    string name = f[0].Trim();\n    string reason = null;\n    if (name == "") reason = "blank name";\n    else if (!int.TryParse(f[1].Trim(), out int age)) reason = "bad age";\n    else if (age < 11 || age > 19) reason = "out of range";\n    else kept.Add($"{name},{age}");\n    if (reason != null) rejected.Add($"line {i + 1}: {reason}");\n}\nFile.WriteAllLines("clean.csv", kept);\nConsole.WriteLine($"kept {kept.Count}, rejected {rejected.Count}");\nforeach (string r in rejected) Console.WriteLine(r);' },
    "6.6-dates": { lesson: "6.6", title: "Date check", tier: "stretch", minutes: 20, concepts: ["validate-data"], requires: ["split", "tryparse"],
      statement: ["Read dates `DD/MM/YYYY` until `done`. Print `ok` or the FIRST problem: `bad format` (not three whole numbers), `bad month` (not 1–12) or `bad day` (not valid for that month; February has 29 days in a leap year).", "A leap year divides by 4, except centuries that do not divide by 400."],
      starter: "",
      examples: [{ stdin: "29/02/2024\n29/02/2023\n31/04/2026\n12/13/2026\n1-1-2026\ndone", out: "ok\nbad day\nbad day\nbad month\nbad format" }],
      hidden: [{ stdin: "29/02/2000\n29/02/1900\n31/12/1999\ndone", out: "ok\nbad day\nok" }],
      hints: ["Split on '/', check there are 3 parts and each TryParses.", "Days in month: an array {31,28,31,30,…}, with February 29 in a leap year.", "Write a bool IsLeap(int y) method."],
      answer: 'string s = Console.ReadLine();\nwhile (s != "done")\n{\n    Console.WriteLine(Check(s));\n    s = Console.ReadLine();\n}\n\nstring Check(string date)\n{\n    string[] p = date.Split(\'/\');\n    if (p.Length != 3 || !int.TryParse(p[0], out int d) || !int.TryParse(p[1], out int m) || !int.TryParse(p[2], out int y)) return "bad format";\n    if (m < 1 || m > 12) return "bad month";\n    int[] days = { 31, IsLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };\n    if (d < 1 || d > days[m - 1]) return "bad day";\n    return "ok";\n}\nbool IsLeap(int y) => y % 4 == 0 && (y % 100 != 0 || y % 400 == 0);' }
  } });

  /* ================================================================
     6.7 A debugging method
     ================================================================ */
  lesson("6.7", {
    aqa: "4.13.1.4",
    notes: [
      page("The problem it solves"),
      { ul: [ "Changing code at random until the output looks right fixes nothing and breaks other things.", "Debugging is a method: **reproduce**, **hypothesise**, **test** the hypothesis, **narrow**, **fix**, **check**." ] },
      page("Core idea"),
      { ol: [ "**Reproduce:** find the smallest input that shows the bug, every time.", "**Hypothesise:** say what you think is wrong, in one sentence.", "**Test:** print (or step to) the value that would prove it right or wrong.", "**Narrow:** halve the code or the input until one line is left.", "**Fix** that line — only that line.", "**Check:** run the failing case AND the ones that already worked." ] },
      run("buggy", "the bug: the average is wrong", 'int[] marks = { 70, 80, 90 };\nint total = 0;\nfor (int i = 1; i < marks.Length; i++) total += marks[i];\nConsole.WriteLine($"Average {total / marks.Length}");'),
      run("probe", "test the hypothesis \"the first mark is skipped\"", 'int[] marks = { 70, 80, 90 };\nint total = 0;\nfor (int i = 1; i < marks.Length; i++)\n{\n    Console.WriteLine($"  adding marks[{i}] = {marks[i]}");\n    total += marks[i];\n}\nConsole.WriteLine($"total {total}, expected 240");'),
      page("Rules"),
      { ul: [
        "A hypothesis must be testable: it predicts what a print (or the debugger) will show.",
        "Print the VALUES that matter, with labels, at the point you suspect.",
        "Change one thing at a time; re-run after each change.",
        "Shrink the input: a bug that shows with 3 items is easier than with 3,000.",
        "Remove the extra prints when you have fixed it (or leave a test behind, unit 10)."
      ] },
      run("fixed", "the fix, then check all cases", 'double Average(int[] marks)\n{\n    int total = 0;\n    for (int i = 0; i < marks.Length; i++) total += marks[i];\n    return (double)total / marks.Length;\n}\nConsole.WriteLine(Average(new[] { 70, 80, 90 }));\nConsole.WriteLine(Average(new[] { 1, 2 }));\nConsole.WriteLine(Average(new[] { 5 }));'),
      page("Variations"),
      { h: "Halving the input" },
      run("halve", "which word breaks the count?", 'string[] words = { "one", "two", "", "four", "five", "six" };\nint letters = 0;\nfor (int i = 0; i < words.Length; i++)\n{\n    if (words[i].Length == 0) Console.WriteLine($"  suspicious: empty word at {i}");\n    letters += words[i].Length;\n}\nConsole.WriteLine(letters);'),
      { h: "Rubber duck" },
      "Explain the code, line by line, out loud (to a duck, or a friend). The line you cannot explain is usually the bug.",
      { h: "Read the error first" },
      run("error", "the message often IS the hypothesis", 'var stock = new Dictionary<string, int> { ["tea"] = 4 };\nstring item = "Tea";\ntry { Console.WriteLine(stock[item]); }\ncatch (KeyNotFoundException e) { Console.WriteLine(e.Message + "  ← case: tea vs Tea"); }'),
      { h: "Assert what must be true" },
      run("assert", "fail loudly the moment an assumption breaks", 'int[] xs = { 4, 8, 15 };\nint total = 0;\nforeach (int x in xs) total += x;\nif (total < 0) throw new InvalidOperationException("total went negative: overflow?");\nConsole.WriteLine(total);'),
      page("Pitfalls"),
      { h: "Fixing the symptom" },
      run("pit-symptom", "adding 70 \"fixes\" one case and breaks the rest", 'int[] marks = { 60, 60, 60 };\nint total = 70;   // \"fix\": the first mark was missing, so start at 70\nfor (int i = 1; i < marks.Length; i++) total += marks[i];\nConsole.WriteLine(total / marks.Length);'),
      { h: "A typo the compiler catches — CS0103" },
      run("pit-typo", "read the name it does not know", 'int total = 0;\ntotl += 5;'),
      { h: "Changing many things at once" },
      "If it works afterwards you will not know which change fixed it — or what the others broke.",
      page("Connections"),
      { ul: [ "**Back:** every error card in this course is the first clue.", "**Next:** 6.8 reads stack traces; Bridge B uses Rider's debugger (breakpoints, stepping, watches).", "**AQA:** 4.13.1.4 testing; NEA testing evidence." ] },
      page("Good practice"),
      { ul: [ "Write the hypothesis down before you look.", "Keep the smallest failing case — it becomes a test (unit 10)." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Fix the totaller* and *Fix the counter*." ] },
      page("Quick reference"),
      run("qr", "a debugging print", 'int[] xs = { 3, 9, 2 };\nint best = 0;\nfor (int i = 0; i < xs.Length; i++)\n{\n    if (xs[i] > best) best = xs[i];\n    Console.WriteLine($"  i={i} xs[i]={xs[i]} best={best}");\n}'),
      { ul: [ "Reproduce → hypothesise → test → narrow → fix → check.", "Label your prints.", "One change at a time." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0103", "a misspelt name", "Pitfalls"], ["(new bug)", "a symptom patched instead of the cause", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int c = 0;\nfor (int i = 0; i <= 3; i++) c++;\nConsole.WriteLine(c);', why: "<= runs for 0, 1, 2, 3: four times.", concepts: ["debugging"] },
        { id: "p2", src: 'string s = "Ada";\nConsole.WriteLine(s == "ada" ? "match" : $"no: [{s}] vs [ada]");', why: "Case differs — the labelled print shows it.", concepts: ["debugging"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the loop starts at the first item.", src: 'int[] a = { 5, 6, 7 };\nint t = 0;\nfor (int i = @@; i < a.Length; i++) t += a[i];\nConsole.WriteLine(t);', out: "18", concepts: ["debugging"] }
      ],
      bug: [
        { id: "b1", q: "It should count the words: 3.", src: 'string s = "the cat sat";\nint words = 0;\nforeach (char c in s) if (c == \' \') words++;\nConsole.WriteLine(words);', out: "3", fixedText: "prints 3", why: "Spaces are between words: words = spaces + 1 (or Split).", concepts: ["debugging"] }
      ]
    },
    flashcards: [
      ["The six steps?", "Reproduce, hypothesise, test, narrow, fix, check."],
      ["What makes a good hypothesis?", "It predicts what a specific print or debugger view will show."],
      ["Why shrink the input?", "A bug in 3 items is far easier to follow than in 3,000."],
      ["Why change one thing at a time?", "So you know which change fixed it and what else it broke."],
      ["Fixing the symptom means…", "patching the output for one case instead of the cause."]
    ],
    quiz: [
      { q: "The first step of debugging?", opts: ["rewrite the method", "reproduce the bug", "add try/catch", "ask for the answer"], ans: 1, why: "You cannot fix what you cannot see." },
      { q: "A useful debugging print shows…", opts: ["\"here\"", "labelled values at the suspect line", "the whole program", "nothing"], ans: 1, why: "Values test the hypothesis." },
      { q: "After a fix you should…", opts: ["stop", "run the failing case and the cases that already worked", "delete the tests", "add more prints"], ans: 1, why: "Check you broke nothing." }
    ]
  });
  K.add({ tasks: {
    "6.7-totaller": { lesson: "6.7", title: "Fix the totaller", tier: "warm-up", minutes: 10, concepts: ["debugging"], requires: ["for"],
      statement: ["The starter should read n, then n prices in pence, and print the total as `£X.XX` — but it gives wrong answers.", "Find the bugs (there are two) and fix only those lines."],
      starter: 'int n = int.Parse(Console.ReadLine());\nint total = 0;\nfor (int i = 1; i < n; i++)\n    total += int.Parse(Console.ReadLine());\nConsole.WriteLine($"£{total / 100:F2}");\n',
      examples: [{ stdin: "3\n150\n275\n99", out: "£5.24" }],
      hidden: [{ stdin: "1\n5", out: "£0.05" }, { stdin: "2\n100\n100", out: "£2.00" }],
      hints: ["Try n = 1: how many prices are added?", "The loop starts at 1 — it reads one price too few.", "total / 100 is integer division; divide by 100.0 (or 100m)."],
      answer: 'int n = int.Parse(Console.ReadLine());\nint total = 0;\nfor (int i = 0; i < n; i++)\n    total += int.Parse(Console.ReadLine());\nConsole.WriteLine($"£{total / 100.0:F2}");' },
    "6.7-counter": { lesson: "6.7", title: "Fix the counter", tier: "core", minutes: 15, concepts: ["debugging"], requires: ["dictionary", "split"],
      statement: ["The starter should read a line of words and print the most common word (ignoring case) as `word: n` — the first to reach the top count wins a tie.", "It has three bugs. Find them with the method: reproduce, hypothesise, test, narrow, fix, check."],
      starter: 'string[] words = Console.ReadLine().Split(\' \');\nvar counts = new Dictionary<string, int>();\nstring best = "";\nint bestCount = 0;\nforeach (string w in words)\n{\n    counts[w] = counts.GetValueOrDefault(w) + 1;\n    if (counts[w] >= bestCount) { best = w; bestCount = counts[w]; }\n}\nConsole.WriteLine($"{best}: {counts.Count}");\n',
      examples: [{ stdin: "The cat and the hat", out: "the: 2" }],
      hidden: [{ stdin: "a b a b", out: "a: 2" }, { stdin: "x", out: "x: 1" }, { stdin: "A a B", out: "a: 2" }],
      hints: ["\"The\" and \"the\" are counted apart: lower-case each word.", ">= lets a later word steal a tie: use >.", "It prints counts.Count (how many different words) instead of bestCount."],
      answer: 'string[] words = Console.ReadLine().Split(\' \');\nvar counts = new Dictionary<string, int>();\nstring best = "";\nint bestCount = 0;\nforeach (string raw in words)\n{\n    string w = raw.ToLower();\n    counts[w] = counts.GetValueOrDefault(w) + 1;\n    if (counts[w] > bestCount) { best = w; bestCount = counts[w]; }\n}\nConsole.WriteLine($"{best}: {bestCount}");' }
  } });

  /* ================================================================
     6.8 Reading stack traces and errors
     ================================================================ */
  lesson("6.8", {
    aqa: "4.1.1.15",
    notes: [
      page("The problem it solves"),
      { ul: [ "An exception thrown five calls deep says WHAT went wrong; the **stack trace** says WHERE, and how the program got there.", "Read it well and most bugs are found before you touch the code." ] },
      page("Core idea"),
      "A program and the trace .NET prints when it crashes:",
      run("crash", "three calls deep", 'Console.WriteLine(Report(new[] { "Ada,91", "Kai" }));\n\nstring Report(string[] rows)\n{\n    int total = 0;\n    foreach (string r in rows) total += ScoreOf(r);\n    return $"total {total}";\n}\nint ScoreOf(string row) => int.Parse(row.Split(\',\')[1]);', { fails: true }),
      text("the trace", "Unhandled exception. System.IndexOutOfRangeException: Index was outside the bounds of the array.\n   at Program.<<Main>$>g__ScoreOf|0_1(String row) in Program.cs:line 9\n   at Program.<<Main>$>g__Report|0_0(String[] rows) in Program.cs:line 6\n   at Program.<Main>$(String[] args) in Program.cs:line 1"),
      { ul: [ "Line 1: the **type** and **message** — what went wrong.", "Next: the **top frame** — where it was thrown (ScoreOf, line 9).", "Below: who called it (Report, line 6), and who called that (the program, line 1).", "Read top-down for WHERE, bottom-up for HOW you got there." ] },
      page("Rules"),
      { ul: [
        "The first `at` line is where the exception was thrown — often inside YOUR method, sometimes inside .NET's.",
        "If the top frames are .NET's (`System.Number…`), go down to the first frame in your code: that is the line that called .NET wrongly.",
        "Local functions appear with compiler names like `g__ScoreOf|0_1`; the readable part is between `__` and `|`.",
        "Line numbers point at the line being run when it threw.",
        "Inner exceptions (6.4) are printed after `--->`; the deepest is the original cause."
      ] },
      text("a trace through .NET's code", "Unhandled exception. System.FormatException: The input string 'Kai' was not in a correct format.\n   at System.Number.ThrowFormatException[TChar](ReadOnlySpan`1 value)\n   at System.Int32.Parse(String s)\n   at Program.<<Main>$>g__ScoreOf|0_1(String row) in Program.cs:line 9\n   at Program.<Main>$(String[] args) in Program.cs:line 1"),
      "The first frame in our own code is ScoreOf, line 9 — that is where to look.",
      page("Variations"),
      { h: "The stack trace from inside a catch" },
      run("stacktrace", "e.StackTrace is the same text", 'try { Deep(3); }\ncatch (InvalidOperationException e)\n{\n    Console.WriteLine(e.Message);\n    Console.WriteLine(e.StackTrace != null ? "the trace is available as e.StackTrace" : "no trace");\n}\n\nvoid Deep(int n)\n{\n    if (n == 0) throw new InvalidOperationException("reached the bottom");\n    Deep(n - 1);\n}'),
      { h: "Compile errors are not traces" },
      text("a compile error (from dotnet build)", "Program.cs(4,17): error CS0103: The name 'totl' does not exist in the current context"),
      { ul: [ "File, (line, column), error code, message.", "Nothing ran — fix the first error first; later ones are often caused by it." ] },
      { h: "Exception messages name the value" },
      run("messages", "read what the message tells you", 'try { int.Parse("12a"); } catch (FormatException e) { Console.WriteLine(e.Message); }\ntry { new List<int>()[3] = 1; } catch (ArgumentOutOfRangeException e) { Console.WriteLine(e.Message); }\ntry { ArgumentOutOfRangeException.ThrowIfNegative(-2); } catch (ArgumentOutOfRangeException e) { Console.WriteLine(e.Message.Split(\'\\n\')[0]); }'),
      page("Under the hood"),
      { ul: [ "Each method call pushes a **frame** onto the call stack (3.3, 3.7); a stack trace is a printout of those frames when the exception was thrown.", "That is why recursion that never stops shows the same frame thousands of times before a stack overflow." ] },
      page("Pitfalls"),
      { h: "Using a catch variable outside its catch — CS0103" },
      run("pit-scope", "e exists only inside the catch block", 'try { int.Parse("x"); }\ncatch (FormatException e) { }\nConsole.WriteLine(e.StackTrace);'),
      { h: "Stopping at .NET's frames" },
      "`at System.Number.ThrowFormatException` is not the bug — .NET did what it was asked. Read down to your own frame.",
      { h: "Fixing the line, not the cause" },
      run("pit-cause", "the crash is in ScoreOf, the bad data came from the caller", 'string[] rows = { "Ada,91", "Kai" };\nint total = 0;\nforeach (string r in rows)\n{\n    string[] f = r.Split(\',\');\n    total += f.Length > 1 ? int.Parse(f[1]) : 0;   // hides the bad row\n}\nConsole.WriteLine(total);'),
      "Silencing it at the crash site hides the bad row; validate rows where they are read (6.6).",
      page("Connections"),
      { ul: [ "**Back:** 3.3 and 3.7's stack frames; 6.4's inner exceptions.", "**Next:** Bridge B's debugger shows the same stack live.", "**AQA:** 4.1.1.15 the role of stack frames in subroutine calls." ] },
      page("Good practice"),
      { ul: [ "Read the first line, then find your first frame.", "Log `e.ToString()` (message and trace) when you catch something you cannot handle." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Where did it break?* and *Find the frame*." ] },
      page("Quick reference"),
      text("how to read a trace", "Unhandled exception. System.X: message      ← what\n   at System.…                              ← .NET's own frames: skip\n   at Program.<<Main>$>g__Mine|0_1(…) in Program.cs:line 9   ← start here\n   at Program.<Main>$(String[] args) in Program.cs:line 1    ← how you got there"),
      run("qr", "e.GetType, e.Message, e.InnerException", 'try { throw new InvalidOperationException("outer", new FormatException("inner")); }\ncatch (Exception e) { Console.WriteLine($"{e.GetType().Name}: {e.Message} ---> {e.InnerException.GetType().Name}: {e.InnerException.Message}"); }'),
      { ul: [ "First line: type and message.", "First frame in YOUR code: where to look.", "Bottom: how you got there." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0103", "the catch variable used outside its catch", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'try { A(); } catch (Exception e) { Console.WriteLine(e.Message); }\nvoid A() => B();\nvoid B() => throw new InvalidOperationException("from B");', why: "Thrown in B, caught at the top.", concepts: ["stack-trace"] },
        { id: "p2", src: 'try { throw new ArgumentException("bad", new FormatException("root")); }\ncatch (Exception e) { Console.WriteLine(e.InnerException.Message); }', why: "The inner exception carries the cause.", concepts: ["stack-trace"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to print the exception's kind.", src: 'try { int.Parse("x"); }\ncatch (Exception e) { Console.WriteLine(e.GetType().@@); }', out: "FormatException", concepts: ["stack-trace"] }
      ],
      bug: [
        { id: "b1", q: "It should print the cause's message: inner.", src: 'try { throw new Exception("outer", new Exception("inner")); }\ncatch (Exception e) { Console.WriteLine(e.Message); }', out: "inner", fixedText: "prints inner", why: "The cause is e.InnerException.Message.", concepts: ["stack-trace"] }
      ]
    },
    flashcards: [
      ["Which line of a trace says where it was thrown?", "The first `at` line (the top frame)."],
      ["The trace starts in .NET's code. Where do you look?", "Down to the first frame in your own code."],
      ["Reading bottom-up tells you…", "how the program got to the failing line."],
      ["What does `--->` mark?", "An inner exception — the deeper cause."],
      ["A compile error line looks like…", "File(line,col): error CSxxxx: message — nothing ran."]
    ],
    quiz: [
      { q: "A trace's top frame is `at System.Int32.Parse`. The bug is most likely…", opts: ["in .NET", "in the first frame of your code below it", "in Main always", "nowhere"], ans: 1, why: "Your code passed bad text to Parse." },
      { q: "A stack trace lists…", opts: ["every variable", "the chain of method calls at the throw", "the whole program", "the compiler's steps"], ans: 1, why: "Frames on the call stack." },
      { q: "With several compile errors, fix…", opts: ["the last first", "the first first", "any", "none"], ans: 1, why: "Later errors are often caused by the first." }
    ]
  });
  K.add({ tasks: {
    "6.8-where": { lesson: "6.8", title: "Where did it break?", tier: "warm-up", minutes: 8, concepts: ["stack-trace"], requires: ["try-catch"],
      statement: ["Call `Level1()`, which calls `Level2()`, which calls `Level3()`, which throws `InvalidOperationException(\"deep\")`.", "Catch it at the top and print `caught TYPE: MESSAGE`."],
      starter: "",
      examples: [{ stdin: "", out: "caught InvalidOperationException: deep" }],
      rules: [uses(/Level3/, "Write the three levels.")],
      hints: ["Three small methods, each calling the next.", "Level3 throws.", "catch (Exception e) at the top: e.GetType().Name and e.Message."],
      answer: 'try { Level1(); }\ncatch (Exception e) { Console.WriteLine($"caught {e.GetType().Name}: {e.Message}"); }\n\nvoid Level1() => Level2();\nvoid Level2() => Level3();\nvoid Level3() => throw new InvalidOperationException("deep");' },
    "6.8-frame": { lesson: "6.8", title: "Find the frame", tier: "core", minutes: 12, concepts: ["stack-trace"], requires: ["split"],
      statement: ["Read a stack trace from the keyboard, one line per line, until a blank line.", "Print the exception's type (the word after `System.` on the first line, before the colon), then the first `at` line that is NOT in `System.` code, trimmed — or `no frame of yours`."],
      starter: "",
      examples: [{ stdin: "Unhandled exception. System.FormatException: The input string 'x' was not in a correct format.\n   at System.Number.ThrowFormatException(String s)\n   at System.Int32.Parse(String s)\n   at Program.Mine(String row) in Program.cs:line 9\n   at Program.Main() in Program.cs:line 1\n\n", out: "FormatException\nat Program.Mine(String row) in Program.cs:line 9" }],
      hidden: [{ stdin: "Unhandled exception. System.IO.FileNotFoundException: Could not find file.\n   at System.IO.File.ReadAllText(String path)\n\n", out: "IO.FileNotFoundException\nno frame of yours" }],
      hints: ["The first line: take the text between \"System.\" and the next ':'.", "Then read lines until a blank one; Trim each.", "The first that starts with \"at \" but not \"at System.\" is yours."],
      answer: 'string first = Console.ReadLine();\nint s = first.IndexOf("System.") + 7;\nConsole.WriteLine(first.Substring(s, first.IndexOf(\':\', s) - s));\nstring found = null;\nstring line = Console.ReadLine();\nwhile (!string.IsNullOrEmpty(line))\n{\n    string t = line.Trim();\n    if (found == null && t.StartsWith("at ") && !t.StartsWith("at System.")) found = t;\n    line = Console.ReadLine();\n}\nConsole.WriteLine(found ?? "no frame of yours");' }
  } });

  /* ================================================================
     6.9 Practise: a log analyser
     ================================================================ */
  var LOG = { "server.log": "2026-10-16 09:00:01 INFO start\n2026-10-16 09:00:05 INFO user ada login\n2026-10-16 09:01:12 WARN slow query 1200ms\n2026-10-16 09:02:40 ERROR disk full\ngarbage line\n2026-10-16 09:03:00 INFO user kai login\n2026-10-16 09:04:30 ERROR disk full\n2026-10-16 09:05:00 INFO stop\n" };
  lesson("6.9", {
    aqa: "4.2.1.3",
    notes: [
      page("The problem it solves"),
      { ul: [ "A server writes a log line for everything it does. A real log is long and has damaged lines.", "This lesson builds an analyser: read the file, survive the bad lines, count by level, find the errors, write a report — the whole unit in one program." ] },
      page("Core idea"),
      "Each good line is `date time LEVEL message`. One method parses a line, or says it cannot:",
      run("parse", "parse one line, or report that it cannot", 'bool TryParseLine(string line, out string level, out string message)\n{\n    level = message = "";\n    string[] p = line.Split(\' \', 4);\n    if (p.Length < 4 || (p[2] != "INFO" && p[2] != "WARN" && p[2] != "ERROR")) return false;\n    level = p[2];\n    message = p[3];\n    return true;\n}\nforeach (string l in File.ReadLines("server.log"))\n    Console.WriteLine(TryParseLine(l, out string lv, out string msg) ? $"{lv,-5} {msg}" : $"??    {l}");', { fs: LOG }),
      page("Rules"),
      { ul: [
        "Parse each line once, with a Try- method (3.5): bad lines are counted, never fatal.",
        "Count with a dictionary (4.3), keyed by level.",
        "Keep the data you report on; derive the report from it.",
        "A missing log is a message to the user, not a crash.",
        "Write the report with `using` (6.3) so it is complete even if something fails."
      ] },
      run("counts", "counts by level, and the bad lines", 'var byLevel = new Dictionary<string, int>();\nint bad = 0;\nforeach (string l in File.ReadLines("server.log"))\n{\n    string[] p = l.Split(\' \', 4);\n    if (p.Length < 4) { bad++; continue; }\n    byLevel[p[2]] = byLevel.GetValueOrDefault(p[2]) + 1;\n}\nforeach (var (level, n) in byLevel) Console.WriteLine($"{level}: {n}");\nConsole.WriteLine($"bad lines: {bad}");', { fs: LOG }),
      page("Variations"),
      { h: "The most frequent error" },
      run("top", "errors grouped by message", 'var errors = new Dictionary<string, int>();\nforeach (string l in File.ReadLines("server.log"))\n{\n    string[] p = l.Split(\' \', 4);\n    if (p.Length == 4 && p[2] == "ERROR") errors[p[3]] = errors.GetValueOrDefault(p[3]) + 1;\n}\nstring worst = ""; int most = 0;\nforeach (var (msg, n) in errors) if (n > most) { worst = msg; most = n; }\nConsole.WriteLine($"most frequent error: {worst} ({most}×)");', { fs: LOG }),
      { h: "Writing the report" },
      run("report", "a report file, then shown", 'int lines = 0, errors = 0;\nforeach (string l in File.ReadLines("server.log")) { lines++; if (l.Contains(" ERROR ")) errors++; }\nusing (var w = new StreamWriter("report.txt"))\n{\n    w.WriteLine("Log report");\n    w.WriteLine($"lines: {lines}");\n    w.WriteLine($"errors: {errors}");\n}\nConsole.Write(File.ReadAllText("report.txt"));', { fs: LOG }),
      { h: "When the log is missing" },
      run("missing", "check, then explain", 'string path = "server.log";\nif (!File.Exists(path))\n{\n    Console.WriteLine($"No log at {path} — has the server run?");\n    return;\n}\nConsole.WriteLine(File.ReadAllLines(path).Length + " lines");'),
      page("Pitfalls"),
      { h: "ReadAllLines into a string — CS0029" },
      run("pit-type", "it returns a string[]", 'string all = File.ReadAllLines("server.log");', { fs: LOG }),
      { h: "One bad line ends the analysis" },
      run("pit-bad", "p[2] on a line with no spaces", 'foreach (string l in File.ReadLines("server.log"))\n{\n    string level = l.Split(\' \')[2];\n}\nConsole.WriteLine("done");', { fs: LOG }),
      { h: "Matching \"ERROR\" anywhere" },
      "`l.Contains(\"ERROR\")` also matches a message like \"no ERRORs today\"; check the level field.",
      page("Connections"),
      { ul: [ "**Back:** the whole of unit 6, with 4.3's counting and 5.2's Split.", "**Next:** capstone 2 builds a gradebook from a CSV in the same way.", "**AQA:** 4.2.1.3 files; 4.13 analysing a problem." ] },
      page("Good practice"),
      { ul: [ "One Try- method decides what a good line is.", "Report bad lines with their line numbers so they can be fixed at the source." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Level counts* and *Log report*." ] },
      page("Quick reference"),
      run("qr", "the analyser in brief", 'var levels = new Dictionary<string, int>();\nint bad = 0;\nforeach (string l in File.ReadLines("server.log"))\n{\n    var p = l.Split(\' \', 4);\n    if (p.Length < 4) { bad++; continue; }\n    levels[p[2]] = levels.GetValueOrDefault(p[2]) + 1;\n}\nConsole.WriteLine($"INFO {levels["INFO"]}, ERROR {levels["ERROR"]}, bad {bad}");', { fs: LOG }),
      { ul: [ "Read → Try-parse → count → report.", "Bad lines: count and report, never crash.", "Write the report with `using`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0029", "ReadAllLines stored in a string", "Pitfalls"], ["IndexOutOfRangeException", "a field read from a damaged line", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'string l = "2026-10-16 09:00:01 INFO user ada login";\nstring[] p = l.Split(\' \', 4);\nConsole.WriteLine(p[2] + " | " + p[3]);', why: "A limit of 4 keeps the whole message in the last part.", concepts: ["log-analysis"] },
        { id: "p2", src: 'int e = 0;\nforeach (string l in File.ReadLines("server.log")) if (l.Contains(" ERROR ")) e++;\nConsole.WriteLine(e);', fs: LOG, why: "Two lines have the ERROR level.", concepts: ["log-analysis"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so lines with fewer than 4 parts are skipped.", src: 'int good = 0;\nforeach (string l in File.ReadLines("server.log"))\n{\n    if (l.Split(\' \', 4).Length @@ 4) continue;\n    good++;\n}\nConsole.WriteLine(good);', fs: LOG, out: "7", concepts: ["log-analysis"] }
      ],
      bug: [
        { id: "b1", q: "It should count the ERROR lines: 2.", src: 'int errors = 0;\nforeach (string l in File.ReadLines("server.log"))\n    if (l.Split(\' \')[2] == "ERROR") errors++;\nConsole.WriteLine(errors);', fs: LOG, out: "2", fixedText: "prints 2", why: "The garbage line has no third field. Check the number of parts first.", concepts: ["log-analysis"] }
      ]
    },
    flashcards: [
      ["How does the analyser survive a damaged line?", "A Try- parse returns false; the line is counted as bad and skipped."],
      ["Why `Split(' ', 4)`?", "The message after the level may contain spaces; a limit keeps it whole."],
      ["Count lines by level with…", "a Dictionary<string, int>."],
      ["Why write the report inside `using`?", "So it is flushed and closed even if something fails."],
      ["A missing log should…", "print a helpful message, not crash."]
    ],
    quiz: [
      { q: "A log line with no spaces, split on ' ' then `[2]`, gives…", opts: ["\"\"", "null", "IndexOutOfRangeException", "the whole line"], ans: 2, why: "There is only one part." },
      { q: "Which finds the most frequent error message?", opts: ["a List of lines", "a Dictionary from message to count", "a Stack", "a HashSet"], ans: 1, why: "Count per key." },
      { q: "Bad lines should be…", opts: ["ignored silently", "counted and reported", "fixed by guessing", "fatal"], ans: 1, why: "So the source can be fixed." }
    ]
  });
  K.add({ tasks: {
    "6.9-levels": { lesson: "6.9", title: "Level counts", tier: "core", minutes: 15, concepts: ["log-analysis", "read-file"], requires: ["dictionary", "split"],
      fs: LOG,
      statement: ["Read `server.log`. A good line has at least 4 space-separated parts and a level (the third) of INFO, WARN or ERROR.", "Print `INFO n`, `WARN n`, `ERROR n` (in that order, 0 if none), then `bad n`."],
      starter: "",
      examples: [{ stdin: "", out: "INFO 4\nWARN 1\nERROR 2\nbad 1" }],
      hidden: [{ stdin: "", fs: { "server.log": "x\n2026-10-16 10:00:00 ERROR boom\n" }, out: "INFO 0\nWARN 0\nERROR 1\nbad 1" }],
      rules: [uses(/server\.log/, "Read server.log.")],
      hints: ["Split(' ', 4) each line.", "Count good levels in a Dictionary; anything else is bad.", "Print with GetValueOrDefault so a missing level shows 0."],
      answer: 'var counts = new Dictionary<string, int>();\nint bad = 0;\nforeach (string l in File.ReadLines("server.log"))\n{\n    string[] p = l.Split(\' \', 4);\n    if (p.Length < 4 || (p[2] != "INFO" && p[2] != "WARN" && p[2] != "ERROR")) { bad++; continue; }\n    counts[p[2]] = counts.GetValueOrDefault(p[2]) + 1;\n}\nforeach (string lv in new[] { "INFO", "WARN", "ERROR" }) Console.WriteLine($"{lv} {counts.GetValueOrDefault(lv)}");\nConsole.WriteLine($"bad {bad}");' },
    "6.9-report": { lesson: "6.9", title: "Log report", tier: "stretch", minutes: 25, concepts: ["log-analysis", "write-file"], requires: ["dictionary", "try-catch"],
      fs: LOG,
      statement: ["Write `report.txt` from `server.log` with these lines: `lines: N`, `errors: E`, `first error: TIME MESSAGE` (or `first error: none`), `users: a, b` (the names from `user NAME login` messages, in order, each once).", "Then print the report file. If `server.log` is missing, print `No log found` and write nothing."],
      starter: "",
      examples: [{ stdin: "", out: "lines: 8\nerrors: 2\nfirst error: 09:02:40 disk full\nusers: ada, kai" }],
      hidden: [{ stdin: "", fs: {}, out: "No log found" }, { stdin: "", fs: { "server.log": "2026-10-16 08:00:00 INFO start\n" }, out: "lines: 1\nerrors: 0\nfirst error: none\nusers: " }],
      rules: [uses(/report\.txt/, "Write report.txt."), uses(/using\s*(\(|var)/, "Write it with a StreamWriter inside using.", "using")],
      hints: ["Exists first; then one pass over the lines.", "Users: if p[3] starts with \"user \" and ends with \" login\", take the middle; keep a List plus a HashSet for 'each once'.", "Write the four lines with a StreamWriter in using, then print File.ReadAllText."],
      answer: 'if (!File.Exists("server.log"))\n{\n    Console.WriteLine("No log found");\n    return;\n}\nint lines = 0, errors = 0;\nstring firstError = null;\nvar users = new List<string>();\nvar seen = new HashSet<string>();\nforeach (string l in File.ReadLines("server.log"))\n{\n    lines++;\n    string[] p = l.Split(\' \', 4);\n    if (p.Length < 4) continue;\n    if (p[2] == "ERROR")\n    {\n        errors++;\n        if (firstError == null) firstError = $"{p[1]} {p[3]}";\n    }\n    if (p[3].StartsWith("user ") && p[3].EndsWith(" login"))\n    {\n        string name = p[3].Substring(5, p[3].Length - 11);\n        if (seen.Add(name)) users.Add(name);\n    }\n}\nusing (var w = new StreamWriter("report.txt"))\n{\n    w.WriteLine($"lines: {lines}");\n    w.WriteLine($"errors: {errors}");\n    w.WriteLine($"first error: {firstError ?? "none"}");\n    w.WriteLine($"users: {string.Join(", ", users)}");\n}\nConsole.Write(File.ReadAllText("report.txt"));' }
  } });

  /* ================================================================
     retrieval cards
     ================================================================ */
  K.add({ cards: {
    "u6-flow": { title: "Where control goes", lesson: "6.4", concepts: ["try-catch", "exceptions"], kind: "predict",
      vary: function (r, n) {
        var bad = pick(r, ["\"x\"", "\"12a\"", "\"\""]), ok = String(1 + r(50));
        var srcs = [
          "try\n{\n    Console.Write(\"a\");\n    int v = int.Parse(" + bad + ");\n    Console.Write(\"b\");\n}\ncatch (FormatException) { Console.Write(\"c\"); }\nfinally { Console.Write(\"d\"); }\nConsole.WriteLine(\"e\");",
          "try\n{\n    Console.Write(\"a\");\n    int v = int.Parse(\"" + ok + "\");\n    Console.Write(v);\n}\ncatch (FormatException) { Console.Write(\"c\"); }\nfinally { Console.Write(\"d\"); }\nConsole.WriteLine(\"e\");",
          "int F()\n{\n    try { return int.Parse(" + bad + "); }\n    catch (FormatException) { return -1; }\n    finally { Console.Write(\"f\"); }\n}\nConsole.WriteLine(F());"
        ];
        return { prompt: "What does this print?", label: ["a failing parse", "a working parse", "finally with return"][n % 3], params: [], src: srcs[n % 3], hint: "A throw skips the rest of the try; finally always runs." };
      } },
    "u6-type": { title: "Which exception?", lesson: "6.1", concepts: ["exceptions"], kind: "predict",
      vary: function (r) {
        var bodies = [["int[] a = new int[2];\na[" + (2 + r(3)) + "] = 1;", "IndexOutOfRangeException"], ["string s = null;\nint n = s.Length;", "NullReferenceException"], ["var d = new Dictionary<string, int>();\nint v = d[\"k" + r(9) + "\"];", "KeyNotFoundException"], ["int z = " + r(1) + ";\nint q = 10 / z;", "DivideByZeroException"], ["int v = int.Parse(\"" + pick(r, ["ten", "1.5", "x9"]) + "\");", "FormatException"], ["var q = new Queue<int>();\nq.Dequeue();", "InvalidOperationException"]];
        var b = bodies[r(bodies.length)];
        return { prompt: "What does this print?", label: "a common exception", params: [],
          src: "try\n{\n    " + b[0].replace(/\n/g, "\n    ") + "\n}\ncatch (Exception e) { Console.WriteLine(e.GetType().Name); }", hint: "Name the problem, then the exception that reports it." };
      } },
    "u6-files": { title: "Reading a file", lesson: "6.2", concepts: ["read-file"], kind: "write",
      vary: function (r, n) {
        var want = ["the number of lines", "the longest line", "the lines containing 'a'"][n % 3];
        var files = [["apple", "kiwi", "banana"], ["a"], ["plum", "fig", "date", "lime"]];
        var f = function (xs) { if (n % 3 === 0) return String(xs.length); if (n % 3 === 1) { var b = xs[0]; xs.forEach(function (x) { if (x.length > b.length) b = x; }); return b; } return String(xs.filter(function (x) { return x.indexOf("a") >= 0; }).length); };
        var body = n % 3 === 0 ? "Console.WriteLine(lines.Length);" : n % 3 === 1 ? "string best = lines[0];\nforeach (string l in lines) if (l.Length > best.Length) best = l;\nConsole.WriteLine(best);" : "int c = 0;\nforeach (string l in lines) if (l.Contains('a')) c++;\nConsole.WriteLine(c);";
        return { prompt: "Read words.txt and print " + want + ".", label: want, params: [want],
          starter: "string[] lines = File.ReadAllLines(\"words.txt\");\n",
          cases: files.map(function (xs) { return { stdin: "", fs: { "words.txt": xs.join("\n") + "\n" }, out: f(xs) }; }),
          hint: "File.ReadAllLines gives the lines; one loop does the rest.",
          answer: "string[] lines = File.ReadAllLines(\"words.txt\");\n" + body };
      } },
    "u6-write": { title: "Write or append?", lesson: "6.3", concepts: ["write-file", "using-dispose"], kind: "predict",
      vary: function (r) {
        var ops = [pick(r, ["WriteAllText", "AppendAllText"]), pick(r, ["WriteAllText", "AppendAllText"])];
        return { prompt: "What does this print?", label: ops.join(" then "), params: [],
          src: "File.WriteAllText(\"t.txt\", \"one\\n\");\nFile." + ops[0] + "(\"t.txt\", \"two\\n\");\nFile." + ops[1] + "(\"t.txt\", \"three\\n\");\nConsole.WriteLine(string.Join(\",\", File.ReadAllLines(\"t.txt\")));", hint: "Write replaces everything; Append adds to the end." };
      } },
    "u6-throw": { title: "The right exception", lesson: "6.5", concepts: ["throw-own"], kind: "fill",
      vary: function (r) {
        var cases = [["a negative age", "ArgumentOutOfRangeException", "int age = -" + (1 + r(9)) + ";\nif (age < 0) throw new @@(nameof(age));"], ["a null name", "ArgumentNullException", "string name = null;\nif (name == null) throw new @@(nameof(name));"], ["popping an empty stack", "InvalidOperationException", "var s = new Stack<int>();\nif (s.Count == 0) throw new @@(\"empty\");"]];
        var c = cases[r(3)];
        return { prompt: "Fill the gap with the right exception for " + c[0] + ".", label: c[0], params: [c[1]],
          src: "try\n{\n    " + c[2].replace(/\n/g, "\n    ") + "\n}\ncatch (Exception e) { Console.WriteLine(e.GetType().Name); }", cases: [{ stdin: "", out: c[1] }], hint: "Null argument, out-of-range argument, or the wrong state?" };
      } },
    "u6-validate": { title: "Validate a line", lesson: "6.6", concepts: ["validate-data"], kind: "write",
      vary: function (r) {
        var lo = 1 + r(5), hi = 10 + r(10);
        var rows = ["Ada," + (lo + 1), "Kai,x", ",5", "Lin," + (hi + 1), "Zed," + hi];
        var f = function (l) { var p = l.split(","); if (!p[0].trim()) return "blank name"; if (!/^[+-]?\d+$/.test(p[1].trim())) return "bad number"; var v = parseInt(p[1], 10); return v < lo || v > hi ? "out of range" : "ok"; };
        return { prompt: "Read one line `name,value`. Print `ok`, or the first problem: `blank name`, `bad number`, or `out of range` (value must be " + lo + "–" + hi + ").", label: "range " + lo + "–" + hi, params: [lo + "–" + hi],
          starter: "string[] f = Console.ReadLine().Split(',');\n",
          cases: rows.map(function (l) { return { stdin: l, out: f(l) }; }),
          hint: "Check the name, then TryParse, then the range — in that order.",
          answer: "string[] f = Console.ReadLine().Split(',');\nif (string.IsNullOrWhiteSpace(f[0])) Console.WriteLine(\"blank name\");\nelse if (!int.TryParse(f[1], out int v)) Console.WriteLine(\"bad number\");\nelse if (v < " + lo + " || v > " + hi + ") Console.WriteLine(\"out of range\");\nelse Console.WriteLine(\"ok\");" };
      } }
  } });
})();
