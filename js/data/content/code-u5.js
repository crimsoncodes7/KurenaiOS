/* Kurenai OS — data/content/code-u5.js
   Code · Unit 5 · Text: strings, parsing, formatting (roadmap 5.3).

   Same contract as units 1–4 (docs/code-plan.md §4): every lesson's layers,
   short text layers folded by KOS_CODE.compose; every {run} listing,
   practice item, task answer and retrieval variation checked against .NET
   by tools/cs_diff.mjs. The machine's culture is en-GB throughout (the
   in-app runner and the differential both use it); 5.6 shows other
   cultures explicitly. StringBuilder, CultureInfo and Regex need their
   using directives, as in a real project.                               */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function run(id, cap, src, stdin) { return { run: { id: id, cap: cap, src: src, stdin: stdin || "" } }; }
  function page(t) { return { page: t }; }
  function call(t, h, body) { return { callout: { t: t, h: h, body: body } }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  function uses(re, msg, id) { return { id: id || "uses", test: function (s) { return re.test(s); }, msg: msg }; }

  K.add({ concepts: {
    "immutable": { name: "Strings are immutable", lesson: "5.1", about: "every change makes a new string" },
    "string-methods": { name: "String methods", lesson: "5.1", about: "Substring, IndexOf, Replace …" },
    "split": { name: "Split", lesson: "5.2", about: "text into parts" },
    "join": { name: "Join", lesson: "5.2", about: "parts into text" },
    "format-numbers": { name: "Format strings", lesson: "5.3", about: "F2, N0, C, P …" },
    "align": { name: "Alignment", lesson: "5.3", about: "columns with {x,10}" },
    "tryparse": { name: "TryParse", lesson: "5.4", about: "text that may be wrong" },
    "stringbuilder": { name: "StringBuilder", lesson: "5.5", about: "building text in a loop" },
    "comparison": { name: "String comparison", lesson: "5.6", about: "case and ordinal" },
    "culture": { name: "Culture", lesson: "5.6", about: "1.5 or 1,5" },
    "char-methods": { name: "char methods", lesson: "5.7", about: "IsDigit, IsLetter, codes" },
    "unicode": { name: "Unicode", lesson: "5.7", about: "UTF-16 and surrogate pairs" },
    "regex": { name: "Regular expressions", lesson: "5.8", about: "patterns in text" },
    "regex-groups": { name: "Regex groups", lesson: "5.8", about: "pulling parts out" }
  } });

  /* ================================================================
     5.1 Strings are immutable
     ================================================================ */
  lesson("5.1", {
    aqa: "4.1.1.7",
    notes: [
      page("The problem it solves"),
      { ul: [ "`s.ToUpper();` on its own line does nothing visible — a common first surprise.", "A `string` never changes after it is made. Every \"change\" builds a NEW string and returns it.", "Knowing that explains the bug, and why building text in a loop can be slow (5.5)." ] },
      page("Core idea"),
      run("returns", "methods return a new string", 'string s = "hello";\ns.ToUpper();\nConsole.WriteLine(s);\nstring loud = s.ToUpper();\nConsole.WriteLine(loud);\ns = s.ToUpper();\nConsole.WriteLine(s);'),
      run("shared", "changing one name leaves the other", 'string a = "hello";\nstring b = a;\nb += "!";\nConsole.WriteLine(a + " | " + b);'),
      page("Rules"),
      { ul: [
        "No string method changes the string it is called on; keep the result.",
        "`s[i]` reads a `char`; `s[i] = …` is a compile error.",
        "`+` and `+=` make a new string from the two parts.",
        "Strings compare by their characters with `==` (unlike arrays).",
        "Indexes run 0 to `Length - 1`; `^1` is the last character, and `s[a..b]` a slice."
      ] },
      run("index", "characters, the end, and slices", 'string s = "Kurenai";\nConsole.WriteLine(s[0] + " " + s[^1] + " " + s.Length);\nConsole.WriteLine(s[1..4] + " " + s[^3..]);'),
      page("Variations"),
      { h: "Finding" },
      run("find", "IndexOf, Contains, StartsWith", 'string s = "the cat sat on the mat";\nConsole.WriteLine(s.IndexOf("at") + " " + s.LastIndexOf("at") + " " + s.IndexOf("dog"));\nConsole.WriteLine(s.Contains("sat") + " " + s.StartsWith("the") + " " + s.EndsWith("hat"));'),
      { h: "Cutting and changing" },
      run("cut", "Substring, Replace, Insert, Remove", 'string s = "Hello world";\nConsole.WriteLine(s.Substring(6));\nConsole.WriteLine(s.Substring(0, 5));\nConsole.WriteLine(s.Replace("o", "0"));\nConsole.WriteLine(s.Insert(5, ",") + " | " + s.Remove(5));'),
      { h: "Tidying" },
      run("tidy", "Trim and Pad", 'string raw = "   Ada  ";\nConsole.WriteLine("[" + raw.Trim() + "]");\nConsole.WriteLine("[" + "7".PadLeft(3, \'0\') + "] [" + "x".PadRight(4, \'.\') + "]");'),
      { h: "Empty and missing" },
      run("empty", "IsNullOrEmpty, IsNullOrWhiteSpace", 'string blank = "  ";\nstring none = null;\nConsole.WriteLine(string.IsNullOrEmpty(blank) + " " + string.IsNullOrWhiteSpace(blank) + " " + string.IsNullOrEmpty(none));'),
      page("Under the hood"),
      { ul: [ "A string is an object holding UTF-16 characters (5.7) that is never written to after it is made.", "Because it cannot change, it can be shared safely — and used as a dictionary key (4.3).", "Each `+` copies both parts into a new string: in a loop of n steps that is about n² character copies." ] },
      page("Pitfalls"),
      { h: "Forgetting to keep the result" },
      run("pit-discard", "Replace returned a new string nobody kept", 'string s = "abc";\ns.Replace("a", "z");\nConsole.WriteLine(s);'),
      { h: "Writing a character — CS0200" },
      run("pit-assign", "strings are read-only", 'string s = "cat";\ns[0] = \'b\';'),
      { h: "A method without its brackets — CS0428" },
      run("pit-group", "s.Trim is the method, not its result", 'string s = " x ";\ns = s.Trim;'),
      { h: "Past the end — ArgumentOutOfRangeException" },
      run("pit-sub", "Substring(2, 5) of a three-letter word", 'string s = "abc";\nConsole.WriteLine(s.Substring(2, 5));'),
      { h: "A null string — NullReferenceException" },
      run("pit-null", "nothing to measure", 'string s = null;\nConsole.WriteLine(s.Length);'),
      page("Connections"),
      { ul: [ "**Back:** 1.5's strings and interpolation; 4.3 uses strings as keys.", "**Next:** 5.2 splits and joins; 5.5 builds long text efficiently.", "**AQA:** 4.1.1.7 string-handling operations." ] },
      page("Good practice"),
      { ul: [ "Write `s = s.Trim();` — reassign when you mean to change.", "Check `string.IsNullOrWhiteSpace` before working on user input." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Initials* and *Censor*." ] },
      page("Quick reference"),
      run("qr", "string methods at a glance", 'string s = "  Hello, World  ".Trim();     // "Hello, World"\nConsole.WriteLine($"{s.Length} {s.IndexOf(\',\')} {s.Substring(7)} {s.ToLower()} {s.Replace("l", "")} {s[^1]}");'),
      { ul: [ "Strings never change: keep the result.", "`IndexOf` → -1 when absent.", "`Substring(start, length)`; `s[a..b]` slices." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0200", "assigning to s[i]", "Pitfalls"], ["CS0428", "a method named without ()", "Pitfalls"], ["ArgumentOutOfRangeException", "Substring past the end", "Pitfalls"], ["NullReferenceException", "a null string", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'string s = "data";\ns.ToUpper();\ns += "!";\nConsole.WriteLine(s);', why: "ToUpper's result is thrown away; += keeps its result.", concepts: ["immutable"] },
        { id: "p2", src: 'string s = "banana";\nConsole.WriteLine(s.IndexOf("an") + " " + s.LastIndexOf("an") + " " + s.Substring(2, 3));', why: "First an at 1, last at 3; three letters from index 2.", concepts: ["string-methods"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the change is kept.", src: 'string name = "  ada ";\nname = name.@@();\nConsole.WriteLine("[" + name + "]");', out: "[ada]", concepts: ["immutable"] }
      ],
      bug: [
        { id: "b1", q: "It should print HELLO.", src: 'string s = "hello";\ns.ToUpper();\nConsole.WriteLine(s);', out: "HELLO", fixedText: "prints HELLO", why: "Keep the result: s = s.ToUpper();", concepts: ["immutable"] }
      ]
    },
    flashcards: [
      ["Does `s.Replace(\"a\", \"b\")` change `s`?", "No — it returns a new string; keep it."],
      ["What does `IndexOf` return when the text is absent?", "-1."],
      ["`Substring(3, 2)` means…", "two characters starting at index 3."],
      ["Last character of `s`?", "`s[^1]` (or `s[s.Length - 1]`)."],
      ["Why can strings be dictionary keys safely?", "They never change, so their hash never changes."],
      ["Blank-or-missing check for user input?", "`string.IsNullOrWhiteSpace(s)`."]
    ],
    quiz: [
      { q: "`string s = \"abc\"; s.ToUpper(); Console.WriteLine(s);` prints…", opts: ["ABC", "abc", "an error", "Abc"], ans: 1, why: "The result was not kept." },
      { q: "`\"hello\".Substring(1, 3)` is…", opts: ["hel", "ell", "ello", "el"], ans: 1, why: "Three letters from index 1." },
      { q: "`s[0] = 'x';` gives…", opts: ["the new string", "CS0200", "a runtime error", "nothing"], ans: 1, why: "A string's indexer is read-only." },
      { q: "`\"Kurenai\"[^2]` is…", opts: ["a", "i", "n", "K"], ans: 0, why: "^1 is i, ^2 is a." }
    ]
  });
  K.add({ tasks: {
    "5.1-initials": { lesson: "5.1", title: "Initials", tier: "warm-up", minutes: 8, concepts: ["string-methods"], requires: ["readline"],
      statement: ["Read a first name and a surname, one per line (they may have spaces around them and any case).", "Print the initials in capitals with full stops, like `A.L.`, then the surname in capitals."],
      starter: "",
      examples: [{ stdin: "ada\nlovelace", out: "A.L.\nLOVELACE" }],
      hidden: [{ stdin: "  Grace \n hopper", out: "G.H.\nHOPPER" }, { stdin: "x\ny", out: "X.Y.\nY" }],
      hints: ["Trim each line first.", "first[0] is the first character; char.ToUpper or .ToUpper() on a string.", "$\"{char.ToUpper(f[0])}.{char.ToUpper(s[0])}.\""],
      answer: 'string first = Console.ReadLine().Trim();\nstring last = Console.ReadLine().Trim();\nConsole.WriteLine($"{char.ToUpper(first[0])}.{char.ToUpper(last[0])}.");\nConsole.WriteLine(last.ToUpper());' },
    "5.1-censor": { lesson: "5.1", title: "Censor", tier: "core", minutes: 12, concepts: ["string-methods", "immutable"], requires: ["readline", "while"],
      statement: ["The first line is a banned word; the second a sentence.", "Replace every occurrence of the banned word (exact case) with stars of the same length, and print the sentence and `N replaced`."],
      starter: "",
      examples: [{ stdin: "bad\nThis bad idea is bad.", out: "This *** idea is ***.\n2 replaced" }],
      hidden: [{ stdin: "x\nnothing here", out: "nothing here\n0 replaced" }, { stdin: "aa\naaaa", out: "****\n2 replaced" }],
      rules: [uses(/IndexOf\s*\(/, "Find each occurrence with IndexOf (count them as you go).")],
      hints: ["Count with IndexOf in a loop: start the next search after the previous match.", "new string('*', word.Length) is the replacement.", "Replace does the swap; the loop does the counting."],
      answer: 'string word = Console.ReadLine();\nstring text = Console.ReadLine();\nint count = 0, at = text.IndexOf(word);\nwhile (at >= 0)\n{\n    count++;\n    at = text.IndexOf(word, at + word.Length);\n}\ntext = text.Replace(word, new string(\'*\', word.Length));\nConsole.WriteLine(text);\nConsole.WriteLine($"{count} replaced");' }
  } });

  /* ================================================================
     5.2 Split and Join
     ================================================================ */
  lesson("5.2", {
    aqa: "4.1.1.7",
    notes: [
      page("The problem it solves"),
      { ul: [ "Data arrives as one line: `Ada,36,London`.", "**Split** breaks it into parts at a separator; **Join** puts parts back together with one.", "Together they read and write simple data formats like CSV." ] },
      page("Core idea"),
      run("split", "one line, three fields", 'string line = "Ada,36,London";\nstring[] parts = line.Split(\',\');\nConsole.WriteLine(parts.Length);\nstring name = parts[0];\nint age = int.Parse(parts[1]);\nConsole.WriteLine($"{name} is {age}, from {parts[2]}");'),
      run("join", "parts back into one line", 'string[] words = { "red", "green", "blue" };\nConsole.WriteLine(string.Join(", ", words));\nvar nums = new List<int> { 1, 2, 3 };\nConsole.WriteLine(string.Join(" + ", nums) + " = 6");'),
      page("Rules"),
      { ul: [
        "`Split` returns a `string[]`; the separators are removed.",
        "Two separators side by side give an EMPTY part between them.",
        "`StringSplitOptions.RemoveEmptyEntries` drops empty parts; `TrimEntries` trims each part. Combine them with `|`.",
        "Several separators: `Split(new[] { ' ', ';' })`. A limit: `Split('=', 2)` keeps the rest in the last part.",
        "`string.Join(sep, items)` works on any collection and calls `ToString` on each item."
      ] },
      run("empty", "empty parts and how to drop them", 'string messy = "a,,b, c";\nConsole.WriteLine(messy.Split(\',\').Length);\nstring[] clean = messy.Split(\',\', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);\nConsole.WriteLine(string.Join("/", clean));'),
      page("Variations"),
      { h: "Words separated by any amount of space" },
      run("words", "RemoveEmptyEntries on spaces", 'string text = "  the   quick brown  fox ";\nstring[] words = text.Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nConsole.WriteLine(words.Length + ": " + string.Join("|", words));'),
      { h: "Numbers on one line" },
      run("numbers", "split, then parse each part", 'string line = "4 8 15 16 23 42";\nint total = 0;\nforeach (string p in line.Split(\' \')) total += int.Parse(p);\nConsole.WriteLine(total);'),
      { h: "Key = value" },
      run("keyvalue", "a limit of 2 keeps any later = signs", 'foreach (string row in new[] { "name=Ada", "motto=a=b" })\n{\n    string[] kv = row.Split(\'=\', 2);\n    Console.WriteLine($"{kv[0]} → {kv[1]}");\n}'),
      { h: "Reading a small CSV" },
      run("csv", "a header and rows", 'string[] lines = { "name,score", "Ada,91", "Kai,74" };\nfor (int i = 1; i < lines.Length; i++)\n{\n    string[] f = lines[i].Split(\',\');\n    Console.WriteLine($"{f[0],-5}{int.Parse(f[1]),4}");\n}'),
      page("Pitfalls"),
      { h: "A part that is not there — IndexOutOfRangeException" },
      run("pit-missing", "only two fields", 'string[] parts = "Ada,36".Split(\',\');\nConsole.WriteLine(parts[2]);'),
      { h: "Parsing a part with spaces round it" },
      run("pit-space", "\" 36\" parses — but \"36 years\" does not", 'string[] f = "Ada, 36 years".Split(\',\');\nConsole.WriteLine(int.Parse(f[1]));'),
      { h: "Split's result is an array — CS0029" },
      run("pit-type", "a string[] is not a string", 'string s = "a,b";\nstring first = s.Split(\',\');'),
      { h: "Commas inside a field" },
      "`\"Smith, J\",42` splits into three parts, not two. Real CSV needs a proper parser (unit 11); here, data with no commas inside fields.",
      page("Connections"),
      { ul: [ "**Back:** 4.1 arrays — Split returns one; 4.3 counting words.", "**Next:** 5.4 parses each part safely; 6.2 reads files line by line.", "**AQA:** 4.1.1.7 string-handling operations." ] },
      page("Good practice"),
      { ul: [ "Check `parts.Length` before reading a field you are not sure exists.", "Trim fields (or use `TrimEntries`) before parsing them." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Sum the line* and *CSV report*." ] },
      page("Quick reference"),
      run("qr", "Split and Join at a glance", 'string[] p = "x;y;;z".Split(\';\', StringSplitOptions.RemoveEmptyEntries);   // x y z\nConsole.WriteLine(string.Join("-", p) + " " + p.Length);'),
      { ul: [ "`Split(sep)` → `string[]`.", "Empty parts: `RemoveEmptyEntries`; spaces: `TrimEntries`.", "`string.Join(sep, items)`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["IndexOutOfRangeException", "fewer parts than expected", "Pitfalls"], ["FormatException", "a part that is not a number", "Pitfalls"], ["CS0029", "Split's array stored in a string", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'string[] p = "a-b--c".Split(\'-\');\nConsole.WriteLine(p.Length + " [" + p[2] + "]");', why: "The double dash leaves an empty part: a, b, \"\", c.", concepts: ["split"] },
        { id: "p2", src: 'var xs = new List<int> { 3, 4 };\nConsole.WriteLine(string.Join("*", xs) + "=" + (xs[0] * xs[1]));', why: "Join puts * between the numbers.", concepts: ["join"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the empty parts are dropped.", src: 'string[] p = "1,,2".Split(\',\', StringSplitOptions.@@);\nConsole.WriteLine(p.Length);', out: "2", concepts: ["split"] }
      ],
      bug: [
        { id: "b1", q: "It should print 3 words.", src: 'string s = "one  two three";\nConsole.WriteLine(s.Split(\' \').Length + " words");', out: "3 words", fixedText: "prints 3 words", why: "The double space makes an empty part. Use RemoveEmptyEntries.", concepts: ["split"] }
      ]
    },
    flashcards: [
      ["What does `Split` return?", "A string[] of the parts, without the separators."],
      ["Two separators in a row give…", "an empty string part between them."],
      ["Drop empty parts?", "`StringSplitOptions.RemoveEmptyEntries`."],
      ["`\"a=b=c\".Split('=', 2)`?", "[\"a\", \"b=c\"]."],
      ["Join a list of numbers with commas?", "`string.Join(\",\", nums)`."]
    ],
    quiz: [
      { q: "`\"a,b,c\".Split(',').Length` is…", opts: ["2", "3", "5", "1"], ans: 1, why: "Three parts." },
      { q: "`\"a  b\".Split(' ')` has…", opts: ["2 parts", "3 parts", "4 parts", "1 part"], ans: 1, why: "An empty part between the two spaces." },
      { q: "`string.Join(\"\", new[] { \"a\", \"b\" })` is…", opts: ["a b", "ab", "a,b", "an error"], ans: 1, why: "An empty separator glues them." }
    ]
  });
  K.add({ tasks: {
    "5.2-sum": { lesson: "5.2", title: "Sum the line", tier: "warm-up", minutes: 8, concepts: ["split"], requires: ["parse", "foreach"],
      statement: ["Read one line of whole numbers separated by spaces (there may be extra spaces).", "Print `count numbers, total T`."],
      starter: "string line = Console.ReadLine();\n",
      examples: [{ stdin: "4 8  15", out: "3 numbers, total 27" }],
      hidden: [{ stdin: "  7 ", out: "1 numbers, total 7" }, { stdin: "-1 1 -1", out: "3 numbers, total -1" }],
      rules: [uses(/Split\s*\(/, "Split the line into parts.")],
      hints: ["Extra spaces make empty parts.", "Split(' ', StringSplitOptions.RemoveEmptyEntries)", "Loop over the parts, parse and add."],
      answer: 'string line = Console.ReadLine();\nstring[] parts = line.Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nint total = 0;\nforeach (string p in parts) total += int.Parse(p);\nConsole.WriteLine($"{parts.Length} numbers, total {total}");' },
    "5.2-csv": { lesson: "5.2", title: "CSV report", tier: "core", minutes: 15, concepts: ["split", "join"], requires: ["input-loop", "list"],
      statement: ["The first line is a header `name,score`. Then rows `name,score` until a blank line or `end`.", "Print the names of everyone who scored 50 or more, joined with `, `, then `Passed: P of N`. If nobody passed print `Nobody` instead of the names."],
      starter: "",
      examples: [{ stdin: "name,score\nAda,91\nKai,40\nLin,50\nend", out: "Ada, Lin\nPassed: 2 of 3" }],
      hidden: [{ stdin: "name,score\nZed,10\nend", out: "Nobody\nPassed: 0 of 1" }, { stdin: "name,score\n\n", out: "Nobody\nPassed: 0 of 0" }],
      rules: [uses(/Join\s*\(/, "Join the passing names.")],
      hints: ["Skip the header with one ReadLine.", "Stop when the line is \"end\" or empty (string.IsNullOrEmpty).", "Split(',') each row; collect names in a List and Join them."],
      answer: 'Console.ReadLine();\nvar passed = new List<string>();\nint total = 0;\nstring line = Console.ReadLine();\nwhile (!string.IsNullOrEmpty(line) && line != "end")\n{\n    string[] f = line.Split(\',\');\n    total++;\n    if (int.Parse(f[1]) >= 50) passed.Add(f[0]);\n    line = Console.ReadLine();\n}\nConsole.WriteLine(passed.Count == 0 ? "Nobody" : string.Join(", ", passed));\nConsole.WriteLine($"Passed: {passed.Count} of {total}");' }
  } });

  /* ================================================================
     5.3 Formatting numbers
     ================================================================ */
  lesson("5.3", {
    aqa: "4.1.1.7",
    notes: [
      page("The problem it solves"),
      { ul: [ "`1234.5678` should print as `1,234.57`, `£1,234.57` or `57%` depending on what it is.", "A **format string** after a colon says how: `{x:F2}`, `{x:N0}`, `{x:C}`, `{x:P1}`." ] },
      page("Core idea"),
      run("standard", "the standard formats", 'double x = 1234.5678;\nConsole.WriteLine($"{x:F2}  {x:N2}  {x:N0}  {x:F0}");\ndecimal price = 1234.5m;\nConsole.WriteLine($"{price:C}  {price:C0}");\ndouble rate = 0.125;\nConsole.WriteLine($"{rate:P1}  {rate:P0}");\nConsole.WriteLine($"{7:D3}  {255:X}  {0.000123:E2}");'),
      { table: { head: ["Format", "Gives", "For"], rows: [["F2", "1234.57", "fixed decimals"], ["N2", "1,234.57", "with thousands separators"], ["C", "£1,234.50", "money (the culture's currency)"], ["P1", "12.5%", "a fraction as a percentage"], ["D3", "007", "whole numbers padded with zeros"], ["X", "FF", "hexadecimal"], ["E2", "1.23E-004", "scientific"]] } },
      page("Rules"),
      { ul: [
        "The number after the letter is the number of decimals (or digits for D).",
        "Rounding is to the nearest; an exact half of a `double` like 2.5 rounds away from zero in formatting.",
        "`P` multiplies by 100: store 0.125, show 12.5%.",
        "`C` uses the current culture's currency — £ here (5.6 changes culture).",
        "The same format works in `$\"{x:F2}\"`, `x.ToString(\"F2\")` and `string.Format(\"{0:F2}\", x)`."
      ] },
      run("three-ways", "one format, three places", 'double pi = Math.PI;\nConsole.WriteLine($"{pi:F3}");\nConsole.WriteLine(pi.ToString("F3"));\nConsole.WriteLine(string.Format("{0:F3} and {1}", pi, "done"));'),
      page("Variations"),
      { h: "Columns: alignment" },
      run("align", "{value,width} right-aligns; a minus left-aligns", 'var rows = new List<(string item, decimal price)> { ("Tea", 1.2m), ("Biscuits", 12.75m), ("Jam", 3m) };\nforeach (var (item, price) in rows)\n    Console.WriteLine($"{item,-10}{price,8:C}");\nConsole.WriteLine($"{"Total",-10}{17.95m,8:C}");'),
      { h: "Custom patterns" },
      run("custom", "0 is a required digit, # an optional one", 'double v = 12.5;\nConsole.WriteLine(v.ToString("000.00") + " " + v.ToString("#,##0.0") + " " + (0.256).ToString("0%"));\nConsole.WriteLine($"{3:00}:{7:00}");'),
      { h: "Times as mm:ss" },
      run("time", "D2 pads to two digits", 'int secs = 125;\nConsole.WriteLine($"{secs / 60}:{secs % 60:D2}");'),
      { h: "Braces in an interpolated string" },
      run("braces", "double them", 'int n = 3;\nConsole.WriteLine($"{{n}} is {n}");'),
      page("Pitfalls"),
      { h: "Formatting text as a number" },
      run("pit-text", "a string ignores F2", 'string s = "3.14159";\nConsole.WriteLine($"{s:F2}");\nConsole.WriteLine($"{double.Parse(s):F2}");'),
      { h: "Integer maths before formatting" },
      run("pit-int", "7 / 2 is already 3", 'int a = 7, b = 2;\nConsole.WriteLine($"{a / b:F2}");\nConsole.WriteLine($"{(double)a / b:F2}");'),
      { h: "A format on a percentage already ×100" },
      run("pit-pct", "P multiplies by 100 again", 'double percent = 45;\nConsole.WriteLine($"{percent:P0}");\nConsole.WriteLine($"{percent / 100:P0}");'),
      { h: "Money without its m — CS0664" },
      run("pit-m", "4.5 is a double; money is decimal", 'decimal price = 4.5;\nConsole.WriteLine($"{price:C}");'),
      { h: "A missing argument — FormatException" },
      run("pit-format", "{1} with only one value", 'Console.WriteLine(string.Format("{0} and {1}", "one"));'),
      page("Connections"),
      { ul: [ "**Back:** 1.5's `:F2` and 1.7's decimal for money.", "**Next:** 5.6 — the same number formats differently in Germany.", "**AQA:** 4.1.1.7 string conversion and formatting." ] },
      page("Good practice"),
      { ul: [ "Format at the edge — keep numbers as numbers until you print them.", "Use `decimal` with `C` for money; `double` with `F`/`N` for measurements." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Receipt columns* and *Percentages*." ] },
      page("Quick reference"),
      run("qr", "formats at a glance", 'double x = 0.4567;\nConsole.WriteLine($"[{x:F2}] [{x:P1}] [{x * 1e6:N0}] [{42,6}] [{"ab",-4}] [{5:D3}]");'),
      { ul: [ "`F` fixed, `N` thousands, `C` money, `P` percent, `D` padded integer.", "`{x,8}` right, `{x,-8}` left.", "Format strings go after a colon." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0664", "a decimal written without m", "Pitfalls"], ["FormatException", "{n} with no argument n", "Pitfalls"], ["(no error)", "a format on a string, or on integer maths", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'double x = 2.0 / 3;\nConsole.WriteLine($"{x:F2} {x:P0}");', why: "0.666… → 0.67 and 67%.", concepts: ["format-numbers"] },
        { id: "p2", src: 'Console.WriteLine($"[{42,5}][{"ab",-4}]");', why: "Width 5 right-aligned; width 4 left-aligned.", concepts: ["align"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to show thousands separators and no decimals.", src: 'int n = 1234567;\nConsole.WriteLine($"{n:@@}");', out: "1,234,567", concepts: ["format-numbers"] }
      ],
      bug: [
        { id: "b1", q: "It should print 2.50.", src: 'int total = 5, count = 2;\nConsole.WriteLine($"{total / count:F2}");', out: "2.50", fixedText: "prints 2.50", why: "Integer division happens first; cast to double.", concepts: ["format-numbers"] }
      ]
    },
    flashcards: [
      ["`{x:N2}` of 1234.5?", "1,234.50."],
      ["`{0.256:P1}`?", "25.6%."],
      ["`{7:D3}`?", "007."],
      ["Right-align in 8 characters?", "`{x,8}`; left-align: `{x,-8}`."],
      ["A literal brace in `$\"…\"`?", "Double it: `{{` or `}}`."],
      ["Why does `{s:F2}` on a string do nothing?", "Format strings apply to numbers; parse it first."]
    ],
    quiz: [
      { q: "`$\"{1234.5:C}\"` here prints…", opts: ["$1,234.50", "£1,234.50", "1234.50", "1,234.5"], ans: 1, why: "The culture is en-GB." },
      { q: "To show 0.75 as 75%:", opts: ["{x:F0}%", "{x:P0}", "{x*100}", "{x:D2}"], ans: 1, why: "P multiplies by 100." },
      { q: "`{\"Tea\",-6}|` gives…", opts: ["   Tea|", "Tea   |", "Tea|", "an error"], ans: 1, why: "Negative width pads on the right." }
    ]
  });
  K.add({ tasks: {
    "5.3-receipt": { lesson: "5.3", title: "Receipt columns", tier: "core", minutes: 15, concepts: ["format-numbers", "align"], requires: ["input-loop", "split", "decimal"],
      statement: ["Read lines `item,price` until `end` (prices are decimals).", "Print each as the item left-aligned in 12 characters then the price right-aligned in 8 as money, then a `Total` line in the same layout."],
      starter: "",
      examples: [{ stdin: "Tea,1.20\nBiscuits,12.75\nend", out: "Tea            £1.20\nBiscuits      £12.75\nTotal         £13.95" }],
      hidden: [{ stdin: "end", out: "Total          £0.00" }, { stdin: "Notebook,1250\nend", out: "Notebook    £1,250.00\nTotal       £1,250.00" }],
      rules: [uses(/,\s*-\s*12\s*}|,\s*8\s*:\s*C/, "Use alignment widths in the format: {item,-12}{price,8:C}.")],
      hints: ["decimal.Parse the price; keep a decimal total.", "$\"{item,-12}{price,8:C}\"", "The Total line uses the same pattern."],
      answer: 'decimal total = 0;\nstring line = Console.ReadLine();\nwhile (line != "end")\n{\n    string[] f = line.Split(\',\');\n    decimal price = decimal.Parse(f[1]);\n    total += price;\n    Console.WriteLine($"{f[0],-12}{price,8:C}");\n    line = Console.ReadLine();\n}\nConsole.WriteLine($"{"Total",-12}{total,8:C}");' },
    "5.3-percent": { lesson: "5.3", title: "Percentages", tier: "warm-up", minutes: 10, concepts: ["format-numbers"], requires: ["parse"],
      statement: ["Read a score and an out-of, one per line (whole numbers, out-of above 0).", "Print `score/outof = X.X%` using the `P` format."],
      starter: "",
      examples: [{ stdin: "17\n20", out: "17/20 = 85.0%" }],
      hidden: [{ stdin: "1\n3", out: "1/3 = 33.3%" }, { stdin: "0\n9", out: "0/9 = 0.0%" }],
      rules: [uses(/:\s*P1|"P1"/, "Format with P1.")],
      hints: ["Divide as doubles: (double)score / outOf.", "P1 multiplies by 100 and shows one decimal.", "$\"{score}/{outOf} = {(double)score / outOf:P1}\""],
      answer: 'int score = int.Parse(Console.ReadLine());\nint outOf = int.Parse(Console.ReadLine());\nConsole.WriteLine($"{score}/{outOf} = {(double)score / outOf:P1}");' }
  } });

  /* ================================================================
     5.4 Parsing safely with TryParse
     ================================================================ */
  lesson("5.4", {
    aqa: "4.1.1.9",
    notes: [
      page("The problem it solves"),
      { ul: [ "`int.Parse(\"abc\")` stops the program with a `FormatException`. Users type `abc`, blanks and `3.5`.", "**`TryParse`** tries, and tells you with a `bool` whether it worked — it never throws." ] },
      page("Core idea"),
      run("try", "true and the number, or false and 0", 'foreach (string s in new[] { "42", " 7 ", "3.5", "", "forty" })\n{\n    bool ok = int.TryParse(s, out int n);\n    Console.WriteLine($"[{s}] → {ok} {n}");\n}'),
      run("ask", "ask again until the answer is a number", 'int age;\nwhile (true)\n{\n    string line = Console.ReadLine();\n    if (int.TryParse(line, out age) && age >= 0) break;\n    Console.WriteLine("Please type a whole number.");\n}\nConsole.WriteLine($"Age {age}");', "old\n-3\n17"),
      page("Rules"),
      { ul: [
        "`int.TryParse(text, out int n)` returns `true` and sets `n`, or returns `false` and sets `n` to 0.",
        "Spaces around the number and a leading `+` or `-` are allowed; anything else fails.",
        "`int` rejects decimals (`3.5`) and numbers too big for an int.",
        "`double.TryParse` accepts decimals (and thousands separators in this culture); `decimal.TryParse` for money.",
        "`Parse` throws: `FormatException` for bad text, `OverflowException` for too big, `ArgumentNullException` for null."
      ] },
      run("kinds", "the same text, three types", 'string s = "1,234.5";\nConsole.WriteLine(int.TryParse(s, out int i) + " " + i);\nConsole.WriteLine(double.TryParse(s, out double d) + " " + d);\nConsole.WriteLine(decimal.TryParse("19.99", out decimal m) + " " + m);'),
      page("Variations"),
      { h: "A method of your own" },
      run("method", "a Try- method that also checks a range", 'Console.WriteLine(TryMark("72", out int a) + " " + a);\nConsole.WriteLine(TryMark("140", out int b) + " " + b);\n\nbool TryMark(string s, out int mark)\n{\n    if (!int.TryParse(s, out mark)) return false;\n    if (mark < 0 || mark > 100) { mark = 0; return false; }\n    return true;\n}'),
      { h: "Skipping bad lines in data" },
      run("skip", "count what was rejected", 'int total = 0, bad = 0;\nforeach (string f in "12,x,8,,30".Split(\',\'))\n{\n    if (int.TryParse(f, out int v)) total += v;\n    else bad++;\n}\nConsole.WriteLine($"total {total}, {bad} rejected");'),
      { h: "Too big for an int" },
      run("overflow", "TryParse says no; long can hold it", 'string big = "9999999999";\nConsole.WriteLine(int.TryParse(big, out int a) + " " + long.TryParse(big, out long b) + " " + b);'),
      { h: "Convert, for completeness" },
      run("convert", "Convert.ToInt32 rounds a double to even", 'Console.WriteLine(Convert.ToInt32("12") + " " + Convert.ToInt32(3.7) + " " + Convert.ToInt32(2.5));'),
      page("Pitfalls"),
      { h: "Parse on bad text — FormatException" },
      run("pit-format", "abc is not a number", 'Console.WriteLine(int.Parse("abc"));'),
      { h: "Parse on a huge number — OverflowException" },
      run("pit-overflow", "too big for int", 'Console.WriteLine(int.Parse("99999999999"));'),
      { h: "Using the value after a failed TryParse" },
      run("pit-zero", "0 is not \"no answer\"", 'int.TryParse("oops", out int n);\nConsole.WriteLine(100 / (n + 1));'),
      "Always check the `bool` first.",
      { h: "TryParse into a string — CS1503" },
      run("pit-type", "the out variable must be the number type", 'int.TryParse("5", out string s);'),
      page("Connections"),
      { ul: [ "**Back:** 1.6's `int.Parse`; 3.5's `out`; 3.6's validation.", "**Next:** 6.1 handles the exceptions `Parse` throws; 5.6 parses in other cultures.", "**AQA:** 4.1.1.9 exception handling (avoiding it here)." ] },
      page("Good practice"),
      { ul: [ "User input or file data: `TryParse`. Text your own code produced: `Parse` is fine.", "Write `if (!int.TryParse(s, out var n)) { …; continue; }` as a guard." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Clean the readings* and *Ask until valid*." ] },
      page("Quick reference"),
      run("qr", "TryParse at a glance", 'if (int.TryParse(" 12 ", out int n)) Console.WriteLine(n * 2);\nif (!double.TryParse("x", out double d)) Console.WriteLine("not a number, d = " + d);'),
      { ul: [ "`TryParse(text, out var n)` → `bool`; never throws.", "`Parse` throws Format/Overflow/ArgumentNull.", "Check the `bool` before using the value." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["FormatException", "Parse on text that is not a number", "Pitfalls"], ["OverflowException", "Parse on a number too big", "Pitfalls"], ["CS1503", "out variable of the wrong type", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'bool a = int.TryParse("-8", out int x);\nbool b = int.TryParse("8.0", out int y);\nConsole.WriteLine($"{a} {x} {b} {y}");', why: "-8 parses; 8.0 is not an int.", concepts: ["tryparse"] },
        { id: "p2", src: 'int ok = 0;\nforeach (string s in new[] { "1", "two", " 3 " }) if (int.TryParse(s, out _)) ok++;\nConsole.WriteLine(ok);', why: "1 and \" 3 \" parse.", concepts: ["tryparse"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so bad text is skipped without crashing.", src: 'int sum = 0;\nforeach (string s in new[] { "4", "x", "5" })\n    if (int.@@(s, out int v)) sum += v;\nConsole.WriteLine(sum);', out: "9", concepts: ["tryparse"] }
      ],
      bug: [
        { id: "b1", q: "It should print \"invalid\" for bad input.", stdin: "abc", src: 'string s = Console.ReadLine();\nint n = int.Parse(s);\nConsole.WriteLine(n > 0 ? "positive" : "invalid");', cases: [{ stdin: "abc", out: "invalid" }, { stdin: "5", out: "positive" }], fixedText: "prints invalid", why: "Parse throws on abc; use TryParse and check its bool.", concepts: ["tryparse"] }
      ]
    },
    flashcards: [
      ["What does `int.TryParse` return?", "A bool: true if the text was a whole number."],
      ["The value after a failed TryParse?", "0 (the type's default) — do not use it."],
      ["Does `int.TryParse(\" 7 \", …)` succeed?", "Yes — surrounding spaces are allowed."],
      ["Does `int.TryParse(\"3.5\", …)` succeed?", "No — use double.TryParse."],
      ["Parse vs TryParse?", "Parse throws on bad input; TryParse returns false."],
      ["`int.Parse(\"99999999999\")` throws…", "OverflowException."]
    ],
    quiz: [
      { q: "`int.TryParse(\"12a\", out int n)` sets n to…", opts: ["12", "0", "-1", "nothing"], ans: 1, why: "It failed: n is 0." },
      { q: "Which never throws on bad text?", opts: ["int.Parse", "Convert.ToInt32", "int.TryParse", "(int)"], ans: 2, why: "It returns false." },
      { q: "`double.TryParse(\"1,234.5\", out var d)` here gives…", opts: ["False", "True, 1234.5", "True, 1.2345", "True, 1"], ans: 1, why: "en-GB accepts thousands separators." }
    ]
  });
  K.add({ tasks: {
    "5.4-readings": { lesson: "5.4", title: "Clean the readings", tier: "core", minutes: 12, concepts: ["tryparse"], requires: ["split", "format"],
      statement: ["One line of sensor readings separated by commas; some are broken (blank, `ERR`, letters).", "Print `N good, M bad, mean X.XX` using the good readings (decimals allowed). With no good readings print `No good readings`."],
      starter: "string[] parts = Console.ReadLine().Split(',');\n",
      examples: [{ stdin: "12.5,ERR,13,,14.25", out: "3 good, 2 bad, mean 13.25" }],
      hidden: [{ stdin: "x,y", out: "No good readings" }, { stdin: "7", out: "1 good, 0 bad, mean 7.00" }],
      rules: [uses(/TryParse\s*\(/, "Use TryParse so a broken reading never crashes.")],
      hints: ["double.TryParse each part.", "Count good and bad; total the good.", "Guard the no-good case before dividing."],
      answer: 'string[] parts = Console.ReadLine().Split(\',\');\nint good = 0, bad = 0;\ndouble total = 0;\nforeach (string p in parts)\n{\n    if (double.TryParse(p, out double v)) { good++; total += v; }\n    else bad++;\n}\nConsole.WriteLine(good == 0 ? "No good readings" : $"{good} good, {bad} bad, mean {total / good:F2}");' },
    "5.4-ask": { lesson: "5.4", title: "Ask until valid", tier: "warm-up", minutes: 10, concepts: ["tryparse", "validation"], requires: ["while"],
      statement: ["Read lines until one is a whole number from 1 to 10.", "For each bad line print `Try again`; then print `You chose N`."],
      starter: "",
      examples: [{ stdin: "eleven\n11\n4", out: "Try again\nTry again\nYou chose 4" }],
      hidden: [{ stdin: "10", out: "You chose 10" }, { stdin: "0\n 1 ", out: "Try again\nYou chose 1" }],
      rules: [uses(/TryParse\s*\(/, "Use int.TryParse.")],
      hints: ["while (true) { … }", "if (int.TryParse(line, out int n) && n >= 1 && n <= 10) …", "Break once it is valid."],
      answer: 'int n;\nwhile (true)\n{\n    string line = Console.ReadLine();\n    if (int.TryParse(line, out n) && n >= 1 && n <= 10) break;\n    Console.WriteLine("Try again");\n}\nConsole.WriteLine($"You chose {n}");' }
  } });

  /* ================================================================
     5.5 StringBuilder
     ================================================================ */
  lesson("5.5", {
    aqa: "4.1.1.7",
    notes: [
      page("The problem it solves"),
      { ul: [ "`s += x` in a loop makes a new string every time (5.1): fine for 10 pieces, slow for 100,000.", "A **`StringBuilder`** is a growable buffer you append to, turned into a string once at the end." ] },
      page("Core idea"),
      run("build", "append, then ToString once", 'using System.Text;\nvar sb = new StringBuilder();\nfor (int i = 1; i <= 5; i++)\n{\n    if (sb.Length > 0) sb.Append(", ");\n    sb.Append(i * i);\n}\nstring result = sb.ToString();\nConsole.WriteLine(result);'),
      { ul: [ "`using System.Text;` at the top makes `StringBuilder` available.", "`Append` adds anything (numbers too); `AppendLine` adds a line break.", "`ToString()` gives the finished string." ] },
      page("Rules"),
      { ul: [
        "A `StringBuilder` CAN change: `Append`, `Insert`, `Remove`, `Replace` and `sb[i] = c` all edit it in place.",
        "Its methods return the builder itself, so calls chain: `sb.Append(a).Append(b)`.",
        "`Length` can be set: `sb.Length--` drops the last character.",
        "Use it when building text in a loop; for a handful of pieces, `+` or interpolation is clearer.",
        "Without `using System.Text;` the name is unknown (CS0246)."
      ] },
      run("edit", "editing in place", 'using System.Text;\nvar sb = new StringBuilder("hello");\nsb.Insert(0, ">> ");\nsb.Replace("l", "L");\nsb[0] = \'<\';\nsb.Append(\'!\');\nConsole.WriteLine(sb + " (" + sb.Length + ")");\nsb.Remove(0, 3);\nConsole.WriteLine(sb.ToString());'),
      page("Variations"),
      { h: "Lines of a report" },
      run("lines", "AppendLine for each row", 'using System.Text;\nvar report = new StringBuilder();\nreport.AppendLine("Name  Score");\nforeach (var (n, s) in new[] { ("Ada", 91), ("Kai", 74) })\n    report.AppendLine($"{n,-6}{s,5}");\nConsole.Write(report.ToString());'),
      { h: "Drop the trailing separator" },
      run("trailing", "append everything, then trim one", 'using System.Text;\nvar sb = new StringBuilder();\nforeach (int x in new[] { 3, 1, 4 }) sb.Append(x).Append(\',\');\nsb.Length--;\nConsole.WriteLine(sb);'),
      { h: "Join and format helpers" },
      run("helpers", "AppendJoin and AppendFormat", 'using System.Text;\nvar sb = new StringBuilder();\nsb.AppendFormat("{0} items: ", 3);\nsb.AppendJoin(" | ", new[] { "a", "b", "c" });\nConsole.WriteLine(sb);'),
      { h: "A pattern of characters" },
      run("pattern", "a chequerboard row by row", 'using System.Text;\nvar sb = new StringBuilder();\nfor (int r = 0; r < 3; r++)\n{\n    for (int c = 0; c < 6; c++) sb.Append((r + c) % 2 == 0 ? \'#\' : \'.\');\n    sb.AppendLine();\n}\nConsole.Write(sb);'),
      page("Performance"),
      { ul: [ "`s += piece` n times copies about n²/2 characters: 10,000 pieces of 10 characters is about 500 million copies.", "A builder doubles its buffer when full, like `List<T>` (4.2): n appends cost about n.", "The difference only shows on long loops — reach for a builder when the loop count is not small or not known." ] },
      page("Pitfalls"),
      { h: "No using — CS0246" },
      run("pit-using", "StringBuilder lives in System.Text", 'var sb = new StringBuilder();\nsb.Append("x");'),
      { h: "== between a builder and a string — CS0019" },
      run("pit-compare", "compare its ToString()", 'using System.Text;\nvar sb = new StringBuilder("ok");\nConsole.WriteLine(sb == "ok");'),
      "Write `sb.ToString() == \"ok\"`.",
      { h: "Writing past the end — ArgumentOutOfRangeException" },
      run("pit-index", "the builder is 2 long", 'using System.Text;\nvar sb = new StringBuilder("ab");\nsb[2] = \'c\';'),
      page("Connections"),
      { ul: [ "**Back:** 5.1 — why `+=` in a loop is slow; 4.2 — the same doubling trick.", "**Later:** unit 11 writes the built text to a file.", "**AQA:** 4.1.1.7 string handling." ] },
      page("Good practice"),
      { ul: [ "A loop that builds text: `StringBuilder`. A one-off line: interpolation.", "Call `ToString()` once, at the end." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Times table* and *Run-length encoding*." ] },
      page("Quick reference"),
      run("qr", "StringBuilder at a glance", 'using System.Text;\nvar sb = new StringBuilder();\nsb.Append("a").Append(1).AppendLine("!");\nsb.Insert(0, "[").Replace("!", "?");\nConsole.Write(sb.ToString());'),
      { ul: [ "`using System.Text;`", "`Append`, `AppendLine`, `Insert`, `Remove`, `Replace`, `Length`.", "`ToString()` at the end." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0246", "StringBuilder without using System.Text", "Pitfalls"], ["CS0019", "== between a builder and a string", "Pitfalls"], ["ArgumentOutOfRangeException", "writing past the end", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'using System.Text;\nvar sb = new StringBuilder("ab");\nsb.Append("cd").Insert(1, "-");\nConsole.WriteLine(sb + " " + sb.Length);', why: "abcd with - inserted at 1: a-bcd, 5 long.", concepts: ["stringbuilder"] },
        { id: "p2", src: 'using System.Text;\nvar sb = new StringBuilder();\nfor (int i = 0; i < 3; i++) sb.Append(i).Append(\'/\');\nsb.Length--;\nConsole.WriteLine(sb);', why: "0/1/2/ with the last / dropped.", concepts: ["stringbuilder"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to turn the builder into a string.", src: 'using System.Text;\nvar sb = new StringBuilder("done");\nstring s = sb.@@();\nConsole.WriteLine(s.Length);', out: "4", concepts: ["stringbuilder"] }
      ],
      bug: [
        { id: "b1", q: "It should print 1,2,3 with no trailing comma.", src: 'using System.Text;\nvar sb = new StringBuilder();\nforeach (int x in new[] { 1, 2, 3 }) sb.Append(x).Append(\',\');\nConsole.WriteLine(sb);', out: "1,2,3", fixedText: "prints 1,2,3", why: "Drop the last comma: sb.Length--; (or only add commas between items).", concepts: ["stringbuilder"] }
      ]
    },
    flashcards: [
      ["Why use a StringBuilder in a loop?", "`+=` copies the whole string each time; a builder appends into a growing buffer."],
      ["Which namespace?", "`using System.Text;`"],
      ["Get the result?", "`sb.ToString()`."],
      ["Remove the last character?", "`sb.Length--;`"],
      ["Can a StringBuilder be changed in place?", "Yes — unlike a string."],
      ["When is `+` fine?", "For a few pieces outside a loop."]
    ],
    quiz: [
      { q: "Building a 10,000-line report in a loop, use…", opts: ["+=", "StringBuilder", "string.Concat each time", "Split"], ans: 1, why: "Appends without copying everything each time." },
      { q: "`sb.Append(\"a\").Append(\"b\")` works because Append returns…", opts: ["a string", "the builder", "void", "a bool"], ans: 1, why: "Calls chain." },
      { q: "`new StringBuilder()` without `using System.Text;` gives…", opts: ["CS0246", "it works", "a runtime error", "CS0103"], ans: 0, why: "The type is not found." }
    ]
  });
  K.add({ tasks: {
    "5.5-table": { lesson: "5.5", title: "Times table", tier: "warm-up", minutes: 10, concepts: ["stringbuilder"], requires: ["for", "parse"],
      statement: ["Read n (1–12).", "Build, with a StringBuilder, the lines `1 x n = …` up to `12 x n = …`, then print the built text."],
      starter: "using System.Text;\nint n = int.Parse(Console.ReadLine());\n",
      examples: [{ stdin: "3", out: "1 x 3 = 3\n2 x 3 = 6\n3 x 3 = 9\n4 x 3 = 12\n5 x 3 = 15\n6 x 3 = 18\n7 x 3 = 21\n8 x 3 = 24\n9 x 3 = 27\n10 x 3 = 30\n11 x 3 = 33\n12 x 3 = 36" }],
      hidden: [{ stdin: "1", out: "1 x 1 = 1\n2 x 1 = 2\n3 x 1 = 3\n4 x 1 = 4\n5 x 1 = 5\n6 x 1 = 6\n7 x 1 = 7\n8 x 1 = 8\n9 x 1 = 9\n10 x 1 = 10\n11 x 1 = 11\n12 x 1 = 12" }],
      rules: [uses(/StringBuilder/, "Build the text with a StringBuilder.")],
      hints: ["var sb = new StringBuilder();", "sb.AppendLine($\"{i} x {n} = {i * n}\");", "Console.Write(sb.ToString());"],
      answer: 'using System.Text;\nint n = int.Parse(Console.ReadLine());\nvar sb = new StringBuilder();\nfor (int i = 1; i <= 12; i++) sb.AppendLine($"{i} x {n} = {i * n}");\nConsole.Write(sb.ToString());' },
    "5.5-rle": { lesson: "5.5", title: "Run-length encoding", tier: "core", minutes: 15, concepts: ["stringbuilder"], requires: ["for", "char-string"],
      statement: ["Read a line of letters. Replace each run of the same letter with the count and the letter: `aaabcc` → `3a1b2c`.", "Build the result with a StringBuilder. An empty line prints an empty line."],
      starter: "using System.Text;\nstring s = Console.ReadLine();\n",
      examples: [{ stdin: "aaabcc", out: "3a1b2c" }],
      hidden: [{ stdin: "x", out: "1x" }, { stdin: "aaaaaaaaaaaa", out: "12a" }, { stdin: "abab", out: "1a1b1a1b" }],
      rules: [uses(/StringBuilder/, "Build the result with a StringBuilder.")],
      hints: ["Walk the string, counting while the next letter is the same.", "When the run ends, Append(count).Append(letter) and reset.", "Watch the last run: it ends at the end of the string."],
      answer: 'using System.Text;\nstring s = Console.ReadLine();\nvar sb = new StringBuilder();\nint i = 0;\nwhile (i < s.Length)\n{\n    int j = i;\n    while (j < s.Length && s[j] == s[i]) j++;\n    sb.Append(j - i).Append(s[i]);\n    i = j;\n}\nConsole.WriteLine(sb.ToString());' }
  } });

  /* ================================================================
     5.6 Culture, case and comparison
     ================================================================ */
  lesson("5.6", {
    aqa: "4.1.1.7",
    notes: [
      page("The problem it solves"),
      { ul: [ "In Germany `1.234,5` means one thousand two hundred and thirty-four and a half. A program that formats or parses with the machine's culture gives different answers on different machines.", "Text comparison has the same trap: is `Apple` equal to `apple`? Before it? It depends on the rule you choose." ] },
      page("Core idea"),
      run("culture", "one number, four cultures", 'using System.Globalization;\ndouble d = 1234.5;\nConsole.WriteLine(d.ToString("N2"));\nConsole.WriteLine(d.ToString("N2", new CultureInfo("de-DE")));\nConsole.WriteLine(d.ToString("N2", CultureInfo.InvariantCulture));\nConsole.WriteLine((1234.5m).ToString("C", new CultureInfo("en-US")) + " and " + CultureInfo.CurrentCulture.Name);'),
      run("compare", "equal? which first?", 'string a = "apple", b = "Apple";\nConsole.WriteLine(a == b);\nConsole.WriteLine(a.Equals(b, StringComparison.OrdinalIgnoreCase));\nConsole.WriteLine(string.Compare(a, b, StringComparison.CurrentCulture));\nConsole.WriteLine(string.Compare(a, b, StringComparison.Ordinal));'),
      page("Rules"),
      { ul: [
        "Formatting and parsing use the CURRENT culture unless you pass one.",
        "`CultureInfo.InvariantCulture` is the fixed, machine-independent culture: use it for files, data and anything a program reads back.",
        "`==` and `Equals` compare exactly, character by character (Ordinal).",
        "`StringComparison.OrdinalIgnoreCase` ignores case: the right choice for identifiers, file names, commands.",
        "`CurrentCulture` comparison orders text the way people expect (`apple` before `Banana`); Ordinal orders by character code (capitals first)."
      ] },
      run("parse", "parse data with the invariant culture", 'using System.Globalization;\nstring fromFile = "2.75";\nConsole.WriteLine(double.Parse(fromFile, CultureInfo.InvariantCulture));\nConsole.WriteLine(double.Parse("2,75", new CultureInfo("de-DE")));\nConsole.WriteLine(double.TryParse("2,75", NumberStyles.Float, CultureInfo.InvariantCulture, out double x) + " " + x);'),
      page("Variations"),
      { h: "Commands typed in any case" },
      run("commands", "compare ignoring case", 'foreach (string cmd in new[] { "QUIT", "Help", "quit" })\n    Console.WriteLine(cmd.Equals("quit", StringComparison.OrdinalIgnoreCase) ? "bye" : "?");'),
      { h: "Two orders" },
      run("orders", "people's order vs character codes", 'var names = new List<string> { "bob", "Alice", "carol", "Dave" };\nnames.Sort();\nConsole.WriteLine(string.Join(",", names));\nnames.Sort(StringComparer.Ordinal);\nConsole.WriteLine(string.Join(",", names));\nnames.Sort(StringComparer.OrdinalIgnoreCase);\nConsole.WriteLine(string.Join(",", names));'),
      { h: "Searching without case" },
      run("search", "Contains, StartsWith and IndexOf take a comparison", 'string title = "Learning C# with Kurenai";\nConsole.WriteLine(title.Contains("kurenai", StringComparison.OrdinalIgnoreCase));\nConsole.WriteLine(title.StartsWith("LEARN", StringComparison.OrdinalIgnoreCase));\nConsole.WriteLine(title.IndexOf("c#", StringComparison.OrdinalIgnoreCase));'),
      { h: "Upper-casing with care" },
      run("upper", "ToUpperInvariant for keys and codes", 'string code = "gb-eng";\nConsole.WriteLine(code.ToUpperInvariant());\nConsole.WriteLine("Straße".ToUpper());'),
      page("Choosing"),
      { table: { head: ["Comparing", "Use"], rows: [["identifiers, keys, commands, file names", "Ordinal or OrdinalIgnoreCase"], ["text shown to people, sorted for people", "CurrentCulture"], ["numbers written to or read from data", "InvariantCulture"], ["numbers shown to the user", "the current culture (the default)"]] } },
      page("Pitfalls"),
      { h: "No using — CS0103" },
      run("pit-using", "CultureInfo lives in System.Globalization", 'Console.WriteLine(1.5.ToString(CultureInfo.InvariantCulture));'),
      { h: "Parsing data in the wrong culture" },
      run("pit-parse", "in Germany 2.75 means 275", 'using System.Globalization;\nConsole.WriteLine(double.Parse("2.75", new CultureInfo("de-DE")));'),
      { h: "ToLower to compare" },
      "`a.ToLower() == b.ToLower()` makes two new strings and can surprise in some languages; use `Equals(…, OrdinalIgnoreCase)`.",
      page("Connections"),
      { ul: [ "**Back:** 5.3 formats; 5.4 parses; 4.3's case-insensitive dictionaries.", "**Later:** unit 11 reads and writes data files with InvariantCulture.", "**AQA:** 4.1.1.7 string conversion." ] },
      page("Good practice"),
      { ul: [ "Data in and out: `InvariantCulture`. Text for people: the current culture.", "Say which comparison you mean — `StringComparison.OrdinalIgnoreCase` — rather than lower-casing." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Command menu* and *European prices*." ] },
      page("Quick reference"),
      run("qr", "culture and comparison at a glance", 'using System.Globalization;\nvar inv = CultureInfo.InvariantCulture;\nConsole.WriteLine(double.Parse("0.5", inv).ToString("F1", inv) + " " + "Yes".Equals("YES", StringComparison.OrdinalIgnoreCase));'),
      { ul: [ "`CultureInfo.InvariantCulture` for data.", "`StringComparison.OrdinalIgnoreCase` for identifiers.", "`using System.Globalization;`" ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0103", "CultureInfo without using System.Globalization", "Pitfalls"], ["(wrong value)", "data parsed in a culture that reads , and . the other way", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine("Yes" == "yes");\nConsole.WriteLine("Yes".Equals("yes", StringComparison.OrdinalIgnoreCase));', why: "== is exact; OrdinalIgnoreCase is not.", concepts: ["comparison"] },
        { id: "p2", src: 'using System.Globalization;\nConsole.WriteLine((0.5).ToString("F2", new CultureInfo("de-DE")));', why: "German uses a decimal comma.", concepts: ["culture"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the data parses the same on every machine.", src: 'using System.Globalization;\ndouble d = double.Parse("3.5", CultureInfo.@@);\nConsole.WriteLine(d * 2);', out: "7", concepts: ["culture"] }
      ],
      bug: [
        { id: "b1", q: "It should accept quit in any case.", stdin: "QUIT", src: 'string cmd = Console.ReadLine();\nConsole.WriteLine(cmd == "quit" ? "bye" : "unknown");', cases: [{ stdin: "QUIT", out: "bye" }, { stdin: "quit", out: "bye" }], fixedText: "prints bye", why: "Compare with cmd.Equals(\"quit\", StringComparison.OrdinalIgnoreCase).", concepts: ["comparison"] }
      ]
    },
    flashcards: [
      ["Which culture for data files?", "CultureInfo.InvariantCulture."],
      ["Compare commands ignoring case?", "`a.Equals(b, StringComparison.OrdinalIgnoreCase)`."],
      ["Ordinal order puts which first: \"Dave\" or \"bob\"?", "\"Dave\" — capitals have lower codes."],
      ["What does `1234.5.ToString(\"N2\", de)` give?", "1.234,50."],
      ["Namespace for CultureInfo?", "`System.Globalization`."]
    ],
    quiz: [
      { q: "`double.Parse(\"2.5\")` on a German machine (no culture passed) reads…", opts: ["2.5", "25", "an error", "0"], ans: 1, why: "The . is a thousands separator there." },
      { q: "Sorting names to show people:", opts: ["Ordinal", "CurrentCulture", "InvariantCulture", "by Length"], ans: 1, why: "The order people expect." },
      { q: "`\"Apple\" == \"apple\"` is…", opts: ["True", "False", "an error", "culture-dependent"], ans: 1, why: "== is exact." }
    ]
  });
  K.add({ tasks: {
    "5.6-menu": { lesson: "5.6", title: "Command menu", tier: "warm-up", minutes: 10, concepts: ["comparison"], requires: ["input-loop"],
      statement: ["Read commands until `quit` in ANY case.", "`help` (any case) prints `Commands: help, time, quit`; `time` prints `It is time`; anything else prints `Unknown: CMD` with the command as typed. Finally print `Bye`."],
      starter: "",
      examples: [{ stdin: "HELP\nTime\njump\nQuit", out: "Commands: help, time, quit\nIt is time\nUnknown: jump\nBye" }],
      hidden: [{ stdin: "quit", out: "Bye" }, { stdin: "QuIt", out: "Bye" }],
      rules: [uses(/OrdinalIgnoreCase/, "Compare with StringComparison.OrdinalIgnoreCase.")],
      hints: ["A small Is(cmd, word) method keeps it short.", "cmd.Equals(word, StringComparison.OrdinalIgnoreCase)", "Loop while the command is not quit."],
      answer: 'string cmd = Console.ReadLine();\nwhile (!Is(cmd, "quit"))\n{\n    if (Is(cmd, "help")) Console.WriteLine("Commands: help, time, quit");\n    else if (Is(cmd, "time")) Console.WriteLine("It is time");\n    else Console.WriteLine($"Unknown: {cmd}");\n    cmd = Console.ReadLine();\n}\nConsole.WriteLine("Bye");\n\nbool Is(string a, string b) => a.Equals(b, StringComparison.OrdinalIgnoreCase);' },
    "5.6-prices": { lesson: "5.6", title: "European prices", tier: "core", minutes: 15, concepts: ["culture"], requires: ["input-loop", "format"],
      statement: ["Read German-format prices like `1.234,50` until `end` (parse them with `new CultureInfo(\"de-DE\")`).", "Print each in the invariant culture with two decimals (`1234.50`), then `Total: T` the same way."],
      starter: "using System.Globalization;\n",
      examples: [{ stdin: "1.234,50\n0,99\nend", out: "1234.50\n0.99\nTotal: 1235.49" }],
      hidden: [{ stdin: "end", out: "Total: 0.00" }, { stdin: "10\n2,5\nend", out: "10.00\n2.50\nTotal: 12.50" }],
      rules: [uses(/de-DE/, "Parse with the de-DE culture."), uses(/InvariantCulture/, "Print with CultureInfo.InvariantCulture.", "inv")],
      hints: ["var de = new CultureInfo(\"de-DE\"); var inv = CultureInfo.InvariantCulture;", "decimal p = decimal.Parse(line, de);", "p.ToString(\"F2\", inv)"],
      answer: 'using System.Globalization;\nvar de = new CultureInfo("de-DE");\nvar inv = CultureInfo.InvariantCulture;\ndecimal total = 0;\nstring line = Console.ReadLine();\nwhile (line != "end")\n{\n    decimal p = decimal.Parse(line, de);\n    total += p;\n    Console.WriteLine(p.ToString("F2", inv));\n    line = Console.ReadLine();\n}\nConsole.WriteLine("Total: " + total.ToString("F2", inv));' }
  } });

  /* ================================================================
     5.7 Characters and Unicode
     ================================================================ */
  lesson("5.7", {
    aqa: "4.5.5.1",
    notes: [
      page("The problem it solves"),
      { ul: [ "Checking a password for a digit, counting vowels, shifting letters for a cipher — all work one `char` at a time.", "A `char` is a number underneath (its code), which is what makes `'a' + 1` and `c - '0'` work.", "Text beyond English — accents, emoji — needs a little care." ] },
      page("Core idea"),
      run("tests", "what kind of character is it?", 'foreach (char c in "aZ7 !é")\n    Console.WriteLine($"[{c}] letter {char.IsLetter(c)}, digit {char.IsDigit(c)}, upper {char.IsUpper(c)}, space {char.IsWhiteSpace(c)}");'),
      run("codes", "a char is a number", 'Console.WriteLine((int)\'A\' + " " + (int)\'a\' + " " + (int)\'0\');\nConsole.WriteLine((char)66 + " " + (char)(\'a\' + 2));\nchar d = \'7\';\nConsole.WriteLine(d - \'0\' + 1);'),
      page("Rules"),
      { ul: [
        "`char` holds one UTF-16 code unit, written in single quotes.",
        "`(int)c` gives its code; `(char)n` makes a char from a code.",
        "Letters `a`–`z` (and `A`–`Z`, `0`–`9`) have consecutive codes, so `c - 'a'` is a letter's position.",
        "`char.IsLetter`, `IsDigit`, `IsUpper`, `IsLower`, `IsWhiteSpace`, `IsPunctuation`, `ToUpper`, `ToLower` work beyond English.",
        "Most characters are one `char`; an emoji is TWO (a surrogate pair), so `\"😀\".Length` is 2."
      ] },
      run("unicode", "Length counts UTF-16 units", 'Console.WriteLine("café".Length + " " + "😀".Length + " " + char.IsSurrogate("😀"[0]));\nConsole.WriteLine((int)\'é\' + " " + char.IsLetter(\'é\'));'),
      page("Variations"),
      { h: "Counting kinds of characters" },
      run("count", "letters, digits, others", 'string pw = "Secr3t!pass9";\nint letters = 0, digits = 0, other = 0;\nforeach (char c in pw)\n{\n    if (char.IsLetter(c)) letters++;\n    else if (char.IsDigit(c)) digits++;\n    else other++;\n}\nConsole.WriteLine($"{letters} letters, {digits} digits, {other} other");'),
      { h: "A Caesar shift" },
      run("caesar", "wrap round with % 26", 'string Shift(string text, int k)\n{\n    var result = "";\n    foreach (char c in text)\n    {\n        if (c >= \'a\' && c <= \'z\') result += (char)(\'a\' + (c - \'a\' + k) % 26);\n        else result += c;\n    }\n    return result;\n}\nConsole.WriteLine(Shift("hello, zebra", 3));'),
      { h: "Digits to a number by hand" },
      run("digits", "what int.Parse does inside", 'string s = "4096";\nint n = 0;\nforeach (char c in s) n = n * 10 + (c - \'0\');\nConsole.WriteLine(n + 1);'),
      { h: "Title case" },
      run("title", "capitalise the first letter of each word", 'string Title(string s)\n{\n    char[] cs = s.ToCharArray();\n    for (int i = 0; i < cs.Length; i++)\n        if (i == 0 || cs[i - 1] == \' \') cs[i] = char.ToUpper(cs[i]);\n    return new string(cs);\n}\nConsole.WriteLine(Title("the old house"));'),
      page("Under the hood"),
      { ul: [ "Unicode gives every character a number (a code point); UTF-16 stores most in one 16-bit `char` and the rest — emoji, rare scripts — in two.", "ASCII (0–127) is the first block of Unicode, so `'A'` is 65 in both.", "AQA expects ASCII and Unicode, and why Unicode was needed." ] },
      page("Pitfalls"),
      { h: "A string in single quotes — CS1012" },
      run("pit-quotes", "single quotes hold ONE character", 'char c = \'ab\';'),
      { h: "A digit's code, not its value" },
      run("pit-code", "\'7\' is 55", 'char d = \'7\';\nint wrong = d;\nint right = d - \'0\';\nConsole.WriteLine(wrong + " " + right);'),
      { h: "Assuming Length counts what you see" },
      run("pit-emoji", "two chars for one emoji", 'string s = "I ❤ C#😀";\nConsole.WriteLine(s.Length);'),
      page("Connections"),
      { ul: [ "**Back:** 1.2's `char` vs `string`; 5.1's indexing.", "**Later:** unit 12's hashing uses character codes.", "**AQA:** 4.5.5.1 character codes: digits, ASCII and Unicode." ] },
      page("Good practice"),
      { ul: [ "Use `char.IsDigit` and friends rather than comparing code ranges by hand — they handle every alphabet.", "Count \"letters the user sees\" carefully when text may contain emoji." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Password check* and *Caesar cipher*." ] },
      page("Quick reference"),
      run("qr", "chars at a glance", 'char c = \'m\';\nConsole.WriteLine($"{(int)c} {(char)(c + 1)} {char.ToUpper(c)} {c - \'a\'} {char.IsLetter(c)} {\'9\' - \'0\'}");'),
      { ul: [ "`(int)c` code; `(char)n` back.", "`c - 'a'` letter position; `c - '0'` digit value.", "`char.Is…` tests; emoji are two chars." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1012", "more than one character in single quotes", "Pitfalls"], ["(wrong value)", "a digit's code used as its value", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'char c = \'C\';\nConsole.WriteLine((int)c - \'A\' + " " + (char)(c + 2));', why: "C is 2 after A; two after C is E.", concepts: ["char-methods"] },
        { id: "p2", src: 'int n = 0;\nforeach (char c in "a1b22") if (char.IsDigit(c)) n += c - \'0\';\nConsole.WriteLine(n);', why: "1 + 2 + 2.", concepts: ["char-methods"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to turn the digit character into its value.", src: 'char d = \'8\';\nint v = d - @@;\nConsole.WriteLine(v * 2);', out: "16", concepts: ["char-methods"] }
      ],
      bug: [
        { id: "b1", q: "It should print 6 (the sum of the digits).", src: 'int sum = 0;\nforeach (char c in "123") sum += c;\nConsole.WriteLine(sum);', out: "6", fixedText: "prints 6", why: "Adding a char adds its code (49, 50, 51). Use c - '0'.", concepts: ["char-methods"] }
      ]
    },
    flashcards: [
      ["`(int)'A'`?", "65."],
      ["Turn the char '7' into 7?", "`'7' - '0'`."],
      ["Letter position of c (a = 0)?", "`c - 'a'`."],
      ["Why is `\"😀\".Length` 2?", "UTF-16 stores it as a surrogate pair of two chars."],
      ["Is `'é'` a letter to `char.IsLetter`?", "Yes."],
      ["ASCII vs Unicode?", "ASCII is 128 characters; Unicode covers every script and contains ASCII as its first block."]
    ],
    quiz: [
      { q: "`(char)('a' + 1)` is…", opts: ["98", "b", "a1", "an error"], ans: 1, why: "The next code." },
      { q: "`'5' + 1` (as an int) is…", opts: ["6", "54", "51", "an error"], ans: 1, why: "'5' is code 53." },
      { q: "`char c = 'ab';` gives…", opts: ["a", "CS1012", "ab", "a runtime error"], ans: 1, why: "Too many characters in a char literal." }
    ]
  });
  K.add({ tasks: {
    "5.7-password": { lesson: "5.7", title: "Password check", tier: "core", minutes: 12, concepts: ["char-methods"], requires: ["foreach", "logical"],
      statement: ["Read a password. It is strong if it has at least 8 characters, an upper-case letter, a lower-case letter and a digit.", "Print `Strong`, or `Weak:` followed by what is missing from `length`, `upper`, `lower`, `digit` (in that order, comma-separated)."],
      starter: "",
      examples: [{ stdin: "Secr3tPass", out: "Strong" }, { stdin: "short", out: "Weak: length, upper, digit" }],
      hidden: [{ stdin: "ALLUPPER99", out: "Weak: lower" }, { stdin: "a1", out: "Weak: length, upper" }],
      rules: [uses(/char\.Is(Upper|Lower|Digit)/, "Test characters with char.IsUpper, IsLower and IsDigit.")],
      hints: ["Three bools, set while walking the string.", "Collect the missing names in a List<string>.", "string.Join(\", \", missing)"],
      answer: 'string pw = Console.ReadLine();\nbool up = false, low = false, dig = false;\nforeach (char c in pw)\n{\n    if (char.IsUpper(c)) up = true;\n    else if (char.IsLower(c)) low = true;\n    else if (char.IsDigit(c)) dig = true;\n}\nvar missing = new List<string>();\nif (pw.Length < 8) missing.Add("length");\nif (!up) missing.Add("upper");\nif (!low) missing.Add("lower");\nif (!dig) missing.Add("digit");\nConsole.WriteLine(missing.Count == 0 ? "Strong" : "Weak: " + string.Join(", ", missing));' },
    "5.7-caesar": { lesson: "5.7", title: "Caesar cipher", tier: "core", minutes: 15, concepts: ["char-methods"], requires: ["modulo", "methods"],
      statement: ["The first line is a shift k (0–25); the second a message.", "Shift every letter k places forward, wrapping z → a, keeping upper and lower case. Leave everything else alone."],
      starter: "",
      examples: [{ stdin: "3\nHello, Zebra!", out: "Khoor, Cheud!" }],
      hidden: [{ stdin: "0\nabc", out: "abc" }, { stdin: "25\nAb z9", out: "Za y9" }, { stdin: "13\nuryyb", out: "hello" }],
      hints: ["Handle 'a'..'z' and 'A'..'Z' separately.", "(char)('a' + (c - 'a' + k) % 26)", "Build the result with a StringBuilder or +."],
      answer: 'int k = int.Parse(Console.ReadLine());\nstring msg = Console.ReadLine();\nstring result = "";\nforeach (char c in msg) result += Shift(c, k);\nConsole.WriteLine(result);\n\nchar Shift(char c, int k)\n{\n    if (c >= \'a\' && c <= \'z\') return (char)(\'a\' + (c - \'a\' + k) % 26);\n    if (c >= \'A\' && c <= \'Z\') return (char)(\'A\' + (c - \'A\' + k) % 26);\n    return c;\n}' }
  } });

  /* ================================================================
     5.8 Regular expressions: a first look
     ================================================================ */
  lesson("5.8", {
    aqa: "4.4.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [ "\"Does this look like a postcode?\" \"Pull every number out of this sentence.\" With `IndexOf` and loops that is pages of code.", "A **regular expression** describes a pattern of text in one line; `Regex` finds it." ] },
      page("Core idea"),
      run("ismatch", "does the text match the pattern?", 'using System.Text.RegularExpressions;\nforeach (string s in new[] { "AB12", "ab12", "A123" })\n    Console.WriteLine($"{s}: {Regex.IsMatch(s, @"^[A-Z]{2}\\d{2}$")}");'),
      run("matches", "every match in a text", 'using System.Text.RegularExpressions;\nstring text = "Order 42: 7 boxes, 120 kg";\nforeach (Match m in Regex.Matches(text, @"\\d+"))\n    Console.WriteLine($"{m.Value} at {m.Index}");'),
      { table: { head: ["Pattern", "Matches"], rows: [["`\\d` `\\w` `\\s`", "a digit, a word character, a space"], ["`[A-Z]` `[aeiou]`", "one character from a set"], ["`+` `*` `?` `{2}` `{2,4}`", "one or more, any, optional, exactly 2, 2 to 4"], ["`^` `$`", "the start and end of the text"], ["`.`", "any character"], ["`(…)`", "a group you can read back"]] } },
      page("Rules"),
      { ul: [
        "`using System.Text.RegularExpressions;` at the top.",
        "Write patterns as verbatim strings `@\"\\d+\"` so the backslashes reach the regex.",
        "Without `^` and `$` a pattern can match anywhere inside the text.",
        "`Regex.Match` gives the first match (check `.Success`); `Regex.Matches` gives them all.",
        "`RegexOptions.IgnoreCase` ignores case; an invalid pattern throws when it is used."
      ] },
      run("anchors", "anchors make it the WHOLE text", 'using System.Text.RegularExpressions;\nConsole.WriteLine(Regex.IsMatch("x42y", @"\\d+"));\nConsole.WriteLine(Regex.IsMatch("x42y", @"^\\d+$"));\nConsole.WriteLine(Regex.IsMatch("HELLO", "^hello$", RegexOptions.IgnoreCase));'),
      page("Variations"),
      { h: "Groups: pulling parts out" },
      run("groups", "numbered and named groups", 'using System.Text.RegularExpressions;\nvar m = Regex.Match("Due 2026-10-16", @"(\\d{4})-(\\d{2})-(\\d{2})");\nConsole.WriteLine($"day {m.Groups[3].Value}, month {m.Groups[2].Value}, year {m.Groups[1].Value}");\nvar s = Regex.Match("Ada: 91", @"(?<name>\\w+): (?<score>\\d+)");\nConsole.WriteLine(s.Groups["name"].Value + " scored " + int.Parse(s.Groups["score"].Value));'),
      { h: "Replace" },
      run("replace", "tidy spaces, reorder a date", 'using System.Text.RegularExpressions;\nConsole.WriteLine(Regex.Replace("too    many   spaces", @"\\s+", " "));\nConsole.WriteLine(Regex.Replace("2026-10-16", @"(\\d+)-(\\d+)-(\\d+)", "$3/$2/$1"));'),
      { h: "Split on a pattern" },
      run("split", "any comma or semicolon, with spaces", 'using System.Text.RegularExpressions;\nstring[] parts = Regex.Split("a, b;c ;  d", @"\\s*[,;]\\s*");\nConsole.WriteLine(string.Join("|", parts));'),
      { h: "Validating input" },
      run("validate", "a simple UK-style postcode check", 'using System.Text.RegularExpressions;\nvar postcode = new Regex(@"^[A-Z]{1,2}\\d[A-Z\\d]? \\d[A-Z]{2}$", RegexOptions.IgnoreCase);\nforeach (string p in new[] { "M1 1AE", "sw1a 1aa", "12345" })\n    Console.WriteLine($"{p}: {postcode.IsMatch(p)}");'),
      page("Pitfalls"),
      { h: "No using — CS0103" },
      run("pit-using", "Regex lives in System.Text.RegularExpressions", 'Console.WriteLine(Regex.IsMatch("a1", @"\\d"));'),
      { h: "Forgetting the anchors" },
      run("pit-anchor", "\"has digits\" is not \"is digits\"", 'using System.Text.RegularExpressions;\nConsole.WriteLine(Regex.IsMatch("12ab", @"\\d+") ? "accepted" : "rejected");'),
      { h: "Reading a match that failed" },
      run("pit-fail", "Value is empty when Success is false", 'using System.Text.RegularExpressions;\nvar m = Regex.Match("no numbers", @"\\d+");\nConsole.WriteLine(m.Success + " [" + m.Value + "]");\nConsole.WriteLine(int.Parse(m.Value));'),
      { h: "An invalid pattern — RegexParseException" },
      run("pit-pattern", "an unclosed [", 'using System.Text.RegularExpressions;\nConsole.WriteLine(Regex.IsMatch("x", "["));'),
      page("Connections"),
      { ul: [ "**Back:** 5.2's Split and 5.4's validation.", "**Later:** unit 9 combines Regex with LINQ.", "**AQA:** 4.4.2.3 regular expressions — the theory behind them (finite state machines, 4.4.2)." ] },
      page("Good practice"),
      { ul: [ "Anchor a pattern that must match the whole input.", "Keep patterns short and test them on examples that should fail, not just ones that should pass.", "For simple jobs, `Split`, `Contains` or `char.IsDigit` are clearer than a regex." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Find the numbers* and *Valid usernames*." ] },
      page("Quick reference"),
      run("qr", "Regex at a glance", 'using System.Text.RegularExpressions;\nvar m = Regex.Match("id=A7", @"=(\\w)(\\d)");\nConsole.WriteLine($"{Regex.IsMatch("abc", "^[a-z]+$")} {m.Groups[1].Value}{m.Groups[2].Value} {Regex.Replace("a1b2", @"\\d", "#")} {Regex.Matches("a1b2", @"\\d").Count}");'),
      { ul: [ "`IsMatch`, `Match` (+ `Success`, `Groups`), `Matches`, `Replace`, `Split`.", "`@\"…\"` patterns; `^…$` for the whole text.", "`using System.Text.RegularExpressions;`" ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0103", "Regex without its using", "Pitfalls"], ["FormatException", "parsing the empty Value of a failed match", "Pitfalls"], ["RegexParseException", "an invalid pattern", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'using System.Text.RegularExpressions;\nConsole.WriteLine(Regex.Matches("a12b3c456", @"\\d+").Count);', why: "Three runs of digits: 12, 3, 456.", concepts: ["regex"] },
        { id: "p2", src: 'using System.Text.RegularExpressions;\nvar m = Regex.Match("Kai-17", @"(\\w+)-(\\d+)");\nConsole.WriteLine(m.Groups[2].Value + m.Groups[1].Value);', why: "Group 2 is 17, group 1 is Kai.", concepts: ["regex-groups"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so only text made entirely of digits matches.", src: 'using System.Text.RegularExpressions;\nConsole.WriteLine(Regex.IsMatch("12a", @"@@\\d+$"));\nConsole.WriteLine(Regex.IsMatch("123", @"@@\\d+$"));', out: "False\nTrue", concepts: ["regex"] }
      ],
      bug: [
        { id: "b1", q: "It should reject 12ab as a number.", src: 'using System.Text.RegularExpressions;\nConsole.WriteLine(Regex.IsMatch("12ab", @"\\d+") ? "number" : "not a number");', out: "not a number", fixedText: "prints not a number", why: "Anchor the pattern: ^\\d+$.", concepts: ["regex"] }
      ]
    },
    flashcards: [
      ["`\\d+` matches…", "one or more digits."],
      ["What do `^` and `$` do?", "Anchor the pattern to the start and end of the text."],
      ["Why write `@\"\\d\"`?", "A verbatim string passes the backslash to the regex."],
      ["First match or all matches?", "`Regex.Match` (check Success) / `Regex.Matches`."],
      ["Read a named group?", "`m.Groups[\"name\"].Value`."],
      ["Namespace?", "`System.Text.RegularExpressions`."]
    ],
    quiz: [
      { q: "`Regex.IsMatch(\"ab12\", @\"\\d\")` is…", opts: ["True", "False", "an error", "12"], ans: 0, why: "There is a digit somewhere." },
      { q: "Which accepts exactly two capital letters?", opts: ["[A-Z]{2}", "^[A-Z]{2}$", "^[A-Z]+$", "\\w{2}"], ans: 1, why: "Anchored, exactly two." },
      { q: "`Regex.Replace(\"a  b\", @\"\\s+\", \"_\")` is…", opts: ["a__b", "a_b", "a b", "_"], ans: 1, why: "One run of spaces, one underscore." }
    ]
  });
  K.add({ tasks: {
    "5.8-numbers": { lesson: "5.8", title: "Find the numbers", tier: "core", minutes: 12, concepts: ["regex"], requires: ["list", "join"],
      statement: ["Read one line of text. Find every whole number in it (runs of digits).", "Print them joined with `+`, then ` = ` and their total — or `No numbers`."],
      starter: "using System.Text.RegularExpressions;\nstring text = Console.ReadLine();\n",
      examples: [{ stdin: "Order 42: 7 boxes, 120 kg", out: "42+7+120 = 169" }],
      hidden: [{ stdin: "none here", out: "No numbers" }, { stdin: "007 and 3", out: "007+3 = 10" }],
      rules: [uses(/Regex\.Matches/, "Find the numbers with Regex.Matches.")],
      hints: ["Regex.Matches(text, @\"\\d+\")", "Collect each m.Value; total int.Parse(m.Value).", "string.Join(\"+\", values)"],
      answer: 'using System.Text.RegularExpressions;\nstring text = Console.ReadLine();\nvar values = new List<string>();\nint total = 0;\nforeach (Match m in Regex.Matches(text, @"\\d+"))\n{\n    values.Add(m.Value);\n    total += int.Parse(m.Value);\n}\nConsole.WriteLine(values.Count == 0 ? "No numbers" : $"{string.Join("+", values)} = {total}");' },
    "5.8-usernames": { lesson: "5.8", title: "Valid usernames", tier: "stretch", minutes: 15, concepts: ["regex"], requires: ["input-loop"],
      statement: ["A username is 3–12 characters: it starts with a letter, then letters, digits or underscores.", "Read usernames until `end`; print `ok: NAME` or `bad: NAME` for each, then `N of M valid`."],
      starter: "using System.Text.RegularExpressions;\n",
      examples: [{ stdin: "ada_99\n9lives\nab\nend", out: "ok: ada_99\nbad: 9lives\nbad: ab\n1 of 3 valid" }],
      hidden: [{ stdin: "end", out: "0 of 0 valid" }, { stdin: "Kurenai_OS_v2\nKurenai_OS_2\nx-y\nend", out: "bad: Kurenai_OS_v2\nok: Kurenai_OS_2\nbad: x-y\n1 of 3 valid" }],
      rules: [uses(/Regex/, "Check the shape with a regular expression.")],
      hints: ["^[A-Za-z] for the first character.", "[A-Za-z0-9_]{2,11}$ for the rest (2 to 11 more).", "Count valid and total as you go."],
      answer: 'using System.Text.RegularExpressions;\nvar shape = new Regex(@"^[A-Za-z][A-Za-z0-9_]{2,11}$");\nint ok = 0, total = 0;\nstring name = Console.ReadLine();\nwhile (name != "end")\n{\n    total++;\n    bool good = shape.IsMatch(name);\n    if (good) ok++;\n    Console.WriteLine((good ? "ok: " : "bad: ") + name);\n    name = Console.ReadLine();\n}\nConsole.WriteLine($"{ok} of {total} valid");' }
  } });

  /* ================================================================
     retrieval cards
     ================================================================ */
  K.add({ cards: {
    "u5-immutable": { title: "Strings never change", lesson: "5.1", concepts: ["immutable", "string-methods"], kind: "predict",
      vary: function (r) {
        var w = pick(r, ["kurenai", "planet", "garden", "bridge"]), m = pick(r, ["ToUpper", "Trim", "Replace(\"e\", \"3\")"]);
        return { prompt: "What does this print?", label: "a discarded result", params: [],
          src: "string s = \"" + w + "\";\ns." + (m.indexOf("(") >= 0 ? m : m + "()") + ";\nstring t = s.Substring(1, 3);\nConsole.WriteLine(s + \" \" + t + \" \" + s.IndexOf('" + w[2] + "'));", hint: "A string method returns a new string; the original is unchanged." };
      } },
    "u5-split": { title: "Split and Join", lesson: "5.2", concepts: ["split", "join"], kind: "write",
      vary: function (r, n) {
        var sep = [",", ";", "|"][n % 3], join = [" + ", "-", ", "][r(3)];
        var rows = [[3, 4, 5], [10], [7, 0, 2, 1]];
        return { prompt: "Read one line of whole numbers separated by '" + sep + "'. Print them joined with \"" + join + "\", then \" = \" and the total.", label: "split on " + sep, params: ["'" + sep + "'"],
          starter: "string line = Console.ReadLine();\n",
          cases: rows.map(function (xs) { return { stdin: xs.join(sep), out: xs.join(join) + " = " + xs.reduce(function (a, b) { return a + b; }, 0) }; }),
          hint: "line.Split('" + sep + "'), parse each, string.Join(\"" + join + "\", parts).",
          answer: "string line = Console.ReadLine();\nstring[] parts = line.Split('" + sep + "');\nint total = 0;\nforeach (string p in parts) total += int.Parse(p);\nConsole.WriteLine(string.Join(\"" + join + "\", parts) + \" = \" + total);" };
      } },
    "u5-format": { title: "Format strings", lesson: "5.3", concepts: ["format-numbers", "align"], kind: "predict",
      vary: function (r) {
        var x = (100 + r(9000)) + r(100) / 100, p = (1 + r(98)) / 100;
        return { prompt: "What does this print?", label: "F, N, P and width", params: [],
          src: "double x = " + x + ";\ndouble p = " + p + ";\nConsole.WriteLine($\"[{x:F1}] [{x:N0}] [{p:P0}] [{7,3}]\");", hint: "F1 one decimal, N0 thousands no decimals, P0 a whole percent, ,3 a width of 3." };
      } },
    "u5-tryparse": { title: "TryParse", lesson: "5.4", concepts: ["tryparse"], kind: "write",
      vary: function (r) {
        var lo = r(5), hi = 10 + r(10);
        var sets = [["4", "x", "12", "", "7"], ["abc"], [String(lo), String(hi), String(hi + 1), "-1"]];
        var f = function (xs) { var c = 0, t = 0; xs.forEach(function (s) { if (/^\s*[+-]?\d+\s*$/.test(s)) { var v = parseInt(s, 10); if (v >= lo && v <= hi) { c++; t += v; } } }); return c + " valid, total " + t; };
        return { prompt: "Read one line of values separated by commas. Count the whole numbers from " + lo + " to " + hi + " and total them; skip anything else. Print `N valid, total T`.", label: lo + " to " + hi, params: [lo + "–" + hi],
          starter: "string[] parts = Console.ReadLine().Split(',');\n",
          cases: sets.map(function (xs) { return { stdin: xs.join(","), out: f(xs) }; }),
          rules: [uses(/TryParse/, "Use int.TryParse.")], hint: "if (int.TryParse(p, out int v) && v >= " + lo + " && v <= " + hi + ")",
          answer: "string[] parts = Console.ReadLine().Split(',');\nint count = 0, total = 0;\nforeach (string p in parts)\n    if (int.TryParse(p, out int v) && v >= " + lo + " && v <= " + hi + ") { count++; total += v; }\nConsole.WriteLine($\"{count} valid, total {total}\");" };
      } },
    "u5-sb": { title: "StringBuilder", lesson: "5.5", concepts: ["stringbuilder"], kind: "predict",
      vary: function (r) {
        var w = pick(r, ["code", "data", "text"]), k = 1 + r(3);
        return { prompt: "What does this print?", label: "edits in place", params: [],
          src: "using System.Text;\nvar sb = new StringBuilder(\"" + w + "\");\nsb.Insert(0, \"<\").Append('>');\nfor (int i = 0; i < " + k + "; i++) sb.Append('!');\nsb.Length--;\nConsole.WriteLine(sb + \" \" + sb.Length);", hint: "Each call edits the same builder; Length-- drops one character." };
      } },
    "u5-compare": { title: "Comparing text", lesson: "5.6", concepts: ["comparison"], kind: "predict",
      vary: function (r) {
        var a = pick(r, ["Apple", "apple", "APPLE"]), b = pick(r, ["apple", "Apple", "banana"]);
        return { prompt: "What does this print?", label: "== and OrdinalIgnoreCase", params: [],
          src: "string a = \"" + a + "\", b = \"" + b + "\";\nConsole.WriteLine(a == b);\nConsole.WriteLine(a.Equals(b, StringComparison.OrdinalIgnoreCase));", hint: "== is exact; OrdinalIgnoreCase ignores case." };
      } },
    "u5-char": { title: "char arithmetic", lesson: "5.7", concepts: ["char-methods"], kind: "predict",
      vary: function (r) {
        var c = String.fromCharCode(98 + r(20)), d = String(r(10)), k = 1 + r(4);
        return { prompt: "What does this print?", label: "codes and positions", params: [],
          src: "char c = '" + c + "';\nchar d = '" + d + "';\nConsole.WriteLine($\"{c - 'a'} {(char)(c + " + k + ")} {d - '0' + 1} {char.ToUpper(c)}\");", hint: "c - 'a' is the letter's position; d - '0' the digit's value." };
      } },
    "u5-regex": { title: "Regex basics", lesson: "5.8", concepts: ["regex", "regex-groups"], kind: "predict",
      vary: function (r) {
        var a = 1 + r(99), b = 100 + r(900), w = pick(r, ["box", "kit", "bag"]);
        return { prompt: "What does this print?", label: "matches and a group", params: [],
          src: "using System.Text.RegularExpressions;\nstring t = \"" + w + " " + a + " and " + b + "\";\nConsole.WriteLine(Regex.Matches(t, @\"\\d+\").Count + \" \" + Regex.IsMatch(t, @\"^\\d\") + \" \" + Regex.Match(t, @\"(\\w+) (\\d+)\").Groups[2].Value);", hint: "Count the digit runs; ^ anchors to the start; group 2 is the first number." };
      } }
  } });
})();
