/* Kurenai OS — data/content/code-u11.js
   Code · Unit 11 · Async, events and I/O (roadmap 5.3), stage 4.

   Streams and binary files, JSON with System.Text.Json, layered
   configuration, then asynchronous code: why waiting should not block,
   async and await, Task.WhenAll and WhenAny, cancellation, the classic
   async mistakes, and a downloader against a fake server. On the FULL
   runtime (where: "sandbox", invariant 105), nullable on. Files live on
   the in-memory disk (`fs`), the same seed under .NET (tools/cs_diff.mjs).
   Delays are short and spaced far apart (80 ms or more), so the order of
   events is the same on every machine; nothing prints a measured time.
   The runtime runs in a browser, where a thread cannot block: `.Result`
   and `.Wait()` are explained, never run.                                 */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function run(id, cap, src, o) {
    o = typeof o === "string" ? { stdin: o } : (o || {});
    var r = { id: id, cap: cap, src: src, stdin: o.stdin || "" };
    if (o.fs) r.fs = o.fs;
    if (o.fails) r.fails = true;
    return { run: r };
  }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  function uses(re, msg, id) { return { id: id || "uses", test: function (s) { return re.test(s); }, msg: msg }; }
  function noUse(re, msg, id) { return { id: id || "avoid", test: function (s) { return !re.test(s); }, msg: msg }; }

  var NOTES = { "notes.txt": "buy milk\nring Kai about Friday\n\nrevise graphs for Monday\n" };
  var PETS = { "pets.json": "[\n  { \"Name\": \"Rex\", \"Kind\": \"dog\", \"Age\": 4 },\n  { \"Name\": \"Tom\", \"Kind\": \"cat\", \"Age\": 7 }\n]\n" };
  var SETTINGS = { "settings.json": "{\n  \"Theme\": \"dark\",\n  \"FontSize\": 14\n}\n" };

  K.add({ concepts: {
    "streams": { name: "Streams", lesson: "11.1", about: "reading and writing bytes and text in order" },
    "binary-files": { name: "Binary files", lesson: "11.1", about: "BinaryWriter, BinaryReader, bytes on disk" },
    "json": { name: "JSON serialisation", lesson: "11.2", about: "objects to text and back" },
    "file-formats": { name: "Choosing a format", lesson: "11.2", about: "JSON, plain text or binary" },
    "config": { name: "Configuration", lesson: "11.3", about: "settings in layers, outside the code" },
    "why-async": { name: "Why async", lesson: "11.4", about: "waiting without blocking" },
    "async-await": { name: "async and await", lesson: "11.5", about: "asynchronous methods that read straight" },
    "when-all": { name: "Task.WhenAll and WhenAny", lesson: "11.6", about: "independent work at the same time" },
    "cancellation": { name: "Cancellation", lesson: "11.7", about: "CancellationToken: stop when asked" },
    "async-pitfalls": { name: "Async pitfalls", lesson: "11.8", about: "async void, forgotten awaits, blocking" },
    "async-practice": { name: "An async downloader", lesson: "11.9", about: "concurrency, limits, timeouts, retries" }
  } });

  /* ================================================================
     11.1 Streams and files in depth
     ================================================================ */
  lesson("11.1", {
    aqa: "4.2.1.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "`File.ReadAllText` (unit 6) reads a whole file into memory. A 4 GB log, a network download or a video cannot be read that way.",
        "A **stream** is a sequence of bytes you read or write **in order**, a piece at a time: a file, memory, a network connection or a compressed file all look the same through it.",
        "**Readers and writers** sit on top: `StreamReader` turns bytes into text lines, `BinaryWriter` writes numbers as raw bytes."
      ] },
      page("Core idea"),
      run("reader", "StreamReader: one line at a time, never the whole file", 'using var reader = new StreamReader("notes.txt");\nint n = 0;\nstring? line;\nwhile ((line = reader.ReadLine()) is not null)\n{\n    n++;\n    if (line.Length == 0) continue;\n    Console.WriteLine($"{n}: {line}");\n}', { fs: NOTES }),
      { ul: [
        "`using var` disposes the reader at the end of the scope, which closes the file (6.x).",
        "`ReadLine()` returns `null` at the end of the stream — the same pattern as reading the console.",
        "Only one line is in memory at a time, so the file can be any size."
      ] },
      run("writer", "StreamWriter, then read the file back", 'using (var w = new StreamWriter("log.txt"))\n{\n    w.WriteLine("started");\n    w.Write("count: ");\n    w.WriteLine(3);\n}\nConsole.Write(File.ReadAllText("log.txt"));\nusing (var w = new StreamWriter("log.txt", append: true)) w.WriteLine("stopped");\nConsole.WriteLine(File.ReadAllLines("log.txt").Length + " lines");'),
      page("Rules"),
      { table: { head: ["Type", "Reads or writes", "Use"], rows: [
        ["`FileStream`", "bytes from a file", "the stream under the others"],
        ["`MemoryStream`", "bytes in memory", "tests, building a file before saving"],
        ["`StreamReader` / `StreamWriter`", "text (UTF-8 by default)", "line-based files, logs, CSV"],
        ["`BinaryReader` / `BinaryWriter`", "ints, doubles, strings as raw bytes", "compact files, file formats"]
      ] } },
      { ul: [
        "Always dispose a stream (`using`): it flushes what was buffered and releases the file. A writer that is never disposed may leave the file empty.",
        "A stream has a `Position`; reading moves it forward. `Seek` (or setting `Position`) moves it, on streams that allow it (`CanSeek`).",
        "Text vs binary: text is readable and portable but bigger; binary is compact and exact but needs the program that wrote it to read it.",
        "Each type has async versions (`ReadLineAsync`, `WriteAsync`) for 11.5."
      ] },
      page("Variations"),
      { h: "Binary: numbers as bytes" },
      run("binary", "four bytes an int, eight a double, read back in the same order", 'using (var w = new BinaryWriter(File.Create("data.bin")))\n{\n    w.Write(3);\n    foreach (int x in new[] { 10, 200, 3000 }) w.Write(x);\n    w.Write(2.5);\n}\nConsole.WriteLine(new FileInfo("data.bin").Length + " bytes");\nusing (var r = new BinaryReader(File.OpenRead("data.bin")))\n{\n    int n = r.ReadInt32();\n    int sum = 0;\n    for (int i = 0; i < n; i++) sum += r.ReadInt32();\n    Console.WriteLine($"{n} numbers, sum {sum}, then {r.ReadDouble()}");\n}'),
      { h: "A stream in memory" },
      run("memory", "MemoryStream: the bytes, and moving the position", 'using var ms = new MemoryStream();\nusing (var w = new StreamWriter(ms, leaveOpen: true)) w.Write("hé!");\nConsole.WriteLine(ms.Length + " bytes: " + string.Join(" ", ms.ToArray().Select(b => b.ToString("X2"))));\nms.Position = 0;\nusing var r = new StreamReader(ms);\nConsole.WriteLine(r.ReadToEnd());'),
      { h: "Copying stream to stream" },
      run("copy", "CopyTo moves bytes from any stream to any other", 'File.WriteAllText("a.txt", "one\\ntwo\\n");\nusing (var src = File.OpenRead("a.txt"))\nusing (var dst = File.Create("b.txt"))\n    src.CopyTo(dst);\nConsole.Write(File.ReadAllText("b.txt"));'),
      page("Pitfalls"),
      { h: "A writer used as a reader — CS1061" },
      run("pit-api", "StreamWriter has no ReadLine", 'using var w = new StreamWriter("x.txt");\nstring? line = w.ReadLine();'),
      { h: "Reading in a different order from writing" },
      run("pit-order", "the bytes of a double read as two ints are nonsense", 'using (var w = new BinaryWriter(File.Create("d.bin"))) w.Write(1.5);\nusing var r = new BinaryReader(File.OpenRead("d.bin"));\nConsole.WriteLine($"{r.ReadInt32()} {r.ReadInt32()}");'),
      { h: "Forgetting to dispose the writer" },
      "Without `using`, a StreamWriter's buffer may never reach the file: it ends up empty or cut short. Dispose (or `Flush`) before reading what you wrote.",
      page("Connections"),
      { ul: [ "**Back:** 6.x files, `using` and exceptions; 12.2 bytes and bits.", "**Next:** 11.2 JSON is text in a stream; 11.5 the async versions; 11.9 a download is a stream from the network.", "**AQA:** 4.2.1.3 text files and binary files (reading and writing)." ] },
      page("Good practice"),
      { ul: [ "Stream large files line by line; read small ones whole.", "One `using` per stream, as close to its use as possible.", "Write and read binary in exactly the same order; put a count or version first." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Line statistics* and *Numbers in binary*." ] },
      page("Quick reference"),
      run("qr", "write, then read, line by line", 'using (var w = new StreamWriter("q.txt")) { w.WriteLine("a"); w.WriteLine("b"); }\nusing var r = new StreamReader("q.txt");\nstring? l;\nwhile ((l = r.ReadLine()) is not null) Console.Write(l);\nConsole.WriteLine();'),
      { ul: [ "`using var r = new StreamReader(path)`; `ReadLine` until null.", "`BinaryWriter.Write(x)` / `BinaryReader.ReadInt32()` — same order.", "Dispose to flush; `Position` and `Seek` to move." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1061", "that type has no such member", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'using (var w = new BinaryWriter(File.Create("n.bin"))) { w.Write(7); w.Write(true); w.Write(2.0); }\nConsole.WriteLine(new FileInfo("n.bin").Length);', why: "An int is 4 bytes, a bool 1, a double 8: 13.", concepts: ["binary-files"] },
        { id: "p2", src: 'using var r = new StringReader("a\\nb\\nc");\nr.ReadLine();\nConsole.WriteLine(r.ReadToEnd().Replace("\\n", "+"));', why: "The first line is consumed; the rest is b and c.", concepts: ["streams"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the loop stops at the end of the stream.", src: 'File.WriteAllText("f.txt", "x\\ny\\n");\nusing var r = new StreamReader("f.txt");\nint n = 0;\nstring? line;\nwhile ((line = r.ReadLine()) @@) n++;\nConsole.WriteLine(n);', out: "2", answer: "is not null", concepts: ["streams"] }
      ],
      bug: [
        { id: "b1", q: "It should print the line it wrote: saved.", src: 'var w = new StreamWriter("s.txt");\nw.WriteLine("saved");\nConsole.WriteLine(File.ReadAllText("s.txt").Trim() == "" ? "(empty)" : File.ReadAllText("s.txt").Trim());', out: "saved", fixedText: "prints saved", why: "The writer was never disposed, so its buffer never reached the file: using (var w = …) { … } (or w.Flush()) before reading.", concepts: ["streams"] }
      ]
    },
    flashcards: [
      ["What is a stream?", "A sequence of bytes read or written in order, a piece at a time."],
      ["StreamReader or BinaryReader for a CSV file?", "StreamReader (text)."],
      ["Why dispose a StreamWriter?", "To flush its buffer to the file and release it."],
      ["How many bytes does BinaryWriter use for an int and a double?", "4 and 8."],
      ["What must match between writing and reading a binary file?", "The order and types of every value."],
      ["What is MemoryStream for?", "A stream over bytes in memory: tests, building data before saving."]
    ],
    quiz: [
      { q: "Reading a 10 GB log with StreamReader.ReadLine needs memory for…", opts: ["the whole file", "one line at a time", "nothing", "half the file"], ans: 1, why: "It streams." },
      { q: "A binary file is…", opts: ["always smaller and exact, but needs the matching reader", "readable in Notepad", "always UTF-8", "the same as JSON"], ans: 0, why: "Raw bytes in a known order." },
      { q: "Setting ms.Position = 0 on a MemoryStream…", opts: ["clears it", "lets you read from the start again", "closes it", "is an error"], ans: 1, why: "The position is where the next read happens." }
    ]
  });
  K.add({ tasks: {
    "11.1-stats": { lesson: "11.1", title: "Line statistics", tier: "core", minutes: 15, concepts: ["streams"],
      fs: NOTES,
      statement: ["`notes.txt` is on the disk. Read it with a `StreamReader`, one line at a time (no ReadAllLines or ReadAllText).", "Print `lines L, blank B, words W, longest \"…\"` — the longest line (the first, on a tie)."],
      starter: 'using var reader = new StreamReader("notes.txt");\n',
      examples: [{ stdin: "", out: "lines 4, blank 1, words 10, longest \"revise graphs for Monday\"" }],
      hidden: [{ stdin: "", fs: { "notes.txt": "" }, out: "lines 0, blank 0, words 0, longest \"\"" }, { stdin: "", fs: { "notes.txt": "a b\ncccc\n" }, out: "lines 2, blank 0, words 3, longest \"cccc\"" }],
      rules: [uses(/new\s+StreamReader/, "Read with a StreamReader."), noUse(/ReadAllLines|ReadAllText|ReadLines|ReadToEnd/, "One line at a time.", "stream")],
      hints: ["string? line; while ((line = reader.ReadLine()) is not null) { … }", "words += line.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;", "if (line.Length > longest.Length) longest = line;"],
      answer: 'using var reader = new StreamReader("notes.txt");\nint lines = 0, blank = 0, words = 0;\nstring longest = "";\nstring? line;\nwhile ((line = reader.ReadLine()) is not null)\n{\n    lines++;\n    if (line.Trim().Length == 0) blank++;\n    words += line.Split(\' \', StringSplitOptions.RemoveEmptyEntries).Length;\n    if (line.Length > longest.Length) longest = line;\n}\nConsole.WriteLine($"lines {lines}, blank {blank}, words {words}, longest \\"{longest}\\"");' },
    "11.1-binary": { lesson: "11.1", title: "Numbers in binary", tier: "stretch", minutes: 20, concepts: ["binary-files", "streams"],
      statement: ["Read whole numbers on one line. Write them to `nums.bin` with a `BinaryWriter`: first the count (an int), then each number (an int).", "Then read the file back with a `BinaryReader` and print `N numbers, sum S, max M, file B bytes` (`max -` when there are none)."],
      starter: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n',
      examples: [{ stdin: "10 200 3000", out: "3 numbers, sum 3210, max 3000, file 16 bytes" }],
      hidden: [{ stdin: "", out: "0 numbers, sum 0, max -, file 4 bytes" }, { stdin: "-5 -2", out: "2 numbers, sum -7, max -2, file 12 bytes" }],
      rules: [uses(/new\s+BinaryWriter/, "Write with a BinaryWriter."), uses(/new\s+BinaryReader/, "Read back with a BinaryReader.", "reader"), uses(/ReadInt32\s*\(/, "Read each int with ReadInt32.", "read")],
      hints: ["using (var w = new BinaryWriter(File.Create(\"nums.bin\"))) { w.Write(xs.Length); foreach (int x in xs) w.Write(x); }", "using var r = new BinaryReader(File.OpenRead(\"nums.bin\")); int n = r.ReadInt32();", "new FileInfo(\"nums.bin\").Length"],
      answer: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\nusing (var w = new BinaryWriter(File.Create("nums.bin")))\n{\n    w.Write(xs.Length);\n    foreach (int x in xs) w.Write(x);\n}\nlong sum = 0;\nint? max = null;\nint n;\nusing (var r = new BinaryReader(File.OpenRead("nums.bin")))\n{\n    n = r.ReadInt32();\n    for (int i = 0; i < n; i++)\n    {\n        int x = r.ReadInt32();\n        sum += x;\n        if (max is null || x > max) max = x;\n    }\n}\nConsole.WriteLine($"{n} numbers, sum {sum}, max {max?.ToString() ?? "-"}, file {new FileInfo("nums.bin").Length} bytes");' }
  } });

  /* ================================================================
     11.2 JSON serialisation
     ================================================================ */
  lesson("11.2", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Unit 6 saved data as CSV: fine for a flat table, awkward for a pet with a list of vaccinations, or settings with sections.",
        "**JSON** writes objects, lists, strings, numbers and true/false as readable text that almost every language and web service understands.",
        "**System.Text.Json** turns your objects into JSON (**serialise**) and JSON back into objects (**deserialise**) in one call each."
      ] },
      page("Core idea"),
      run("roundtrip", "a record to JSON and back", 'using System.Text.Json;\nvar rex = new Pet("Rex", "dog", 4);\nstring json = JsonSerializer.Serialize(rex);\nConsole.WriteLine(json);\nPet back = JsonSerializer.Deserialize<Pet>(json)!;\nConsole.WriteLine(back);\nConsole.WriteLine(back == rex);\n\nrecord Pet(string Name, string Kind, int Age);'),
      { ul: [
        "`Serialize(obj)` writes every public property; `Deserialize<T>(text)` builds a T, matching JSON names to properties (and to a record's constructor parameters).",
        "Deserialize returns `T?`: `null` for the JSON `null`. The `!` says this JSON is never null.",
        "Records round-trip exactly, so the copy equals the original."
      ] },
      run("file", "a list from a file, a change, saved back indented", 'using System.Text.Json;\nvar pets = JsonSerializer.Deserialize<List<Pet>>(File.ReadAllText("pets.json"))!;\npets.Add(new Pet("Kit", "cat", 1));\nvar options = new JsonSerializerOptions { WriteIndented = true };\nFile.WriteAllText("pets.json", JsonSerializer.Serialize(pets, options));\nConsole.WriteLine($"{pets.Count} pets, oldest {pets.MaxBy(p => p.Age)!.Name}");\nConsole.WriteLine(File.ReadAllLines("pets.json").Length + " lines");\n\nrecord Pet(string Name, string Kind, int Age);', { fs: PETS }),
      page("Rules"),
      { table: { head: ["C#", "JSON"], rows: [["object / record", "`{ \"Name\": \"Rex\" }`"], ["List<T>, array", "`[ … ]`"], ["string", "`\"text\"` (escaped)"], ["int, double, decimal", "`4`, `2.5`"], ["bool", "`true` / `false`"], ["null", "`null`"], ["Dictionary<string, T>", "an object with those keys"]] } },
      { ul: [
        "By default names are written as declared (`Name`) and matched case-sensitively; `JsonSerializerOptions.Web` uses camelCase and ignores case.",
        "`[JsonPropertyName(\"pet_name\")]` renames one property; `[JsonIgnore]` leaves one out.",
        "Bad JSON throws `JsonException` with the line and position: catch it at the edge of the program.",
        "Choose a format: **JSON** for nested data that people or other programs read; **plain text/CSV** for simple tables and logs; **binary** (11.1) when size or speed matters and only your program reads it."
      ] },
      page("Variations"),
      { h: "Web-style names" },
      run("web", "camelCase out, any case in", 'using System.Text.Json;\nvar opt = JsonSerializerOptions.Web;\nConsole.WriteLine(JsonSerializer.Serialize(new Score("Ada", 91), opt));\nvar s = JsonSerializer.Deserialize<Score>("{\\"PLAYER\\":\\"Kai\\",\\"points\\":74}", opt)!;\nConsole.WriteLine(s);\n\nrecord Score(string Player, int Points);'),
      { h: "Nested data" },
      run("nested", "an object holding a list holding objects", 'using System.Text.Json;\nvar order = new Order(17, new() { new Line("tea", 2), new Line("cake", 1) });\nstring json = JsonSerializer.Serialize(order);\nConsole.WriteLine(json);\nvar back = JsonSerializer.Deserialize<Order>(json)!;\nConsole.WriteLine(back.Lines.Sum(l => l.Qty));\n\nrecord Line(string Item, int Qty);\nrecord Order(int Id, List<Line> Lines);'),
      { h: "Reading JSON you do not have a type for" },
      run("dom", "JsonDocument walks any JSON", 'using System.Text.Json;\nusing var doc = JsonDocument.Parse("{\\"city\\":\\"Leeds\\",\\"temps\\":[11,14,9]}");\nvar root = doc.RootElement;\nConsole.WriteLine(root.GetProperty("city").GetString());\nConsole.WriteLine(root.GetProperty("temps").EnumerateArray().Sum(t => t.GetInt32()));'),
      page("Pitfalls"),
      { h: "Deserialize without saying the type — CS0411" },
      run("pit-type", "C# cannot guess what to build", 'using System.Text.Json;\nvar p = JsonSerializer.Deserialize("{}");'),
      { h: "Broken JSON" },
      run("pit-bad", "a trailing comma is not JSON", 'using System.Text.Json;\ntry\n{\n    var p = JsonSerializer.Deserialize<Pet>("{ \\"Name\\": \\"Rex\\", }");\n}\ncatch (JsonException e)\n{\n    Console.WriteLine("bad JSON: " + e.Message.Split(\'.\')[0]);\n}\n\nrecord Pet(string Name);'),
      { h: "A name that does not match" },
      run("pit-name", "\"name\" is not \"Name\" by default: the property is left out", 'using System.Text.Json;\nvar p = JsonSerializer.Deserialize<Pet>("{\\"name\\":\\"Rex\\",\\"age\\":4}")!;\nConsole.WriteLine($"[{p.Name}] {p.Age}");\n\nclass Pet { public string? Name { get; set; } public int Age { get; set; } }'),
      page("Connections"),
      { ul: [ "**Back:** 8.7 records; 6.x files and exceptions; 11.1 streams.", "**Next:** 11.3 settings in JSON; 11.9 downloads return JSON; T1 web APIs speak it.", "**AQA:** 4.2.1.3 files and records — JSON is a common way to store records." ] },
      page("Good practice"),
      { ul: [ "Serialise records or simple classes made for the purpose, not your whole object graph.", "Catch JsonException where the text comes in, and say which file was bad.", "Pick one naming style (Web for anything shared) and keep it." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Add a pet* and *Line by line*." ] },
      page("Quick reference"),
      run("qr", "serialise and deserialise", 'using System.Text.Json;\nstring j = JsonSerializer.Serialize(new[] { 1, 2, 3 });\nint[] back = JsonSerializer.Deserialize<int[]>(j)!;\nConsole.WriteLine($"{j} {back.Sum()}");'),
      { ul: [ "`JsonSerializer.Serialize(x, options)`; `Deserialize<T>(json)!`.", "`WriteIndented`, `JsonSerializerOptions.Web`.", "Catch `JsonException`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0411", "the type to build cannot be inferred", "Pitfalls"], ["JsonException", "the text is not valid JSON for that type", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'using System.Text.Json;\nConsole.WriteLine(JsonSerializer.Serialize(new { Name = "Ada", Tags = new[] { "cs", "maths" }, Ok = true }));', why: "An object, an array of strings, and a bool — written without spaces.", concepts: ["json"] },
        { id: "p2", src: 'using System.Text.Json;\nvar d = JsonSerializer.Deserialize<Dictionary<string, int>>("{\\"a\\":1,\\"b\\":2}")!;\nConsole.WriteLine(d["b"] + d.Count);', why: "A JSON object becomes a dictionary: 2 + 2 entries.", concepts: ["json"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the call that turns the record into JSON.", src: 'using System.Text.Json;\nConsole.WriteLine(@@(new P(3)));\n\nrecord P(int X);', out: "{\"X\":3}", answer: "JsonSerializer.Serialize", concepts: ["json"] }
      ],
      bug: [
        { id: "b1", q: "It should read the name: Rex.", src: 'using System.Text.Json;\nvar p = JsonSerializer.Deserialize<Pet>("{\\"name\\":\\"Rex\\"}")!;\nConsole.WriteLine(p.Name ?? "(none)");\n\nclass Pet { public string? Name { get; set; } }', out: "Rex", fixedText: "prints Rex", why: "Names match case-sensitively by default; pass JsonSerializerOptions.Web (case-insensitive) or rename the JSON key to \"Name\".", concepts: ["json"] }
      ]
    },
    flashcards: [
      ["Serialise or deserialise: object to JSON?", "Serialise (JsonSerializer.Serialize)."],
      ["How do you read JSON into a List of records?", "JsonSerializer.Deserialize<List<T>>(text)!"],
      ["What does WriteIndented do?", "Writes JSON on several lines with indentation."],
      ["What does JsonSerializerOptions.Web change?", "camelCase names out, case-insensitive matching in."],
      ["What does bad JSON throw?", "JsonException."],
      ["When choose binary over JSON?", "When size or speed matters and only your program reads the file."]
    ],
    quiz: [
      { q: "A C# List<int> serialises as…", opts: ["{1,2}", "[1,2]", "\"1,2\"", "(1,2)"], ans: 1, why: "Lists and arrays are JSON arrays." },
      { q: "Deserialize<Pet>(\"null\") returns…", opts: ["an empty Pet", "null", "an exception", "a default Pet"], ans: 1, why: "JSON null is C# null — hence T?." },
      { q: "Which suits a settings file a person may edit?", opts: ["binary", "JSON", "a MemoryStream", "an int"], ans: 1, why: "Readable, nested, standard." }
    ]
  });
  K.add({ tasks: {
    "11.2-add": { lesson: "11.2", title: "Add a pet", tier: "core", minutes: 20, concepts: ["json"],
      fs: PETS,
      statement: ["`pets.json` holds a list of pets (`Name`, `Kind`, `Age`). Read lines `NAME KIND AGE` from the input until the end and add each pet.", "Save the list back to `pets.json` (indented), then read the file again and print `N pets: name, name, …` in file order and `average age A` (1 decimal)."],
      starter: 'using System.Text.Json;\n\nrecord Pet(string Name, string Kind, int Age);',
      examples: [{ stdin: "Kit cat 1", out: "3 pets: Rex, Tom, Kit\naverage age 4.0" }],
      hidden: [{ stdin: "", out: "2 pets: Rex, Tom\naverage age 5.5" }, { stdin: "Bo dog 10\nPip bird 2", out: "4 pets: Rex, Tom, Bo, Pip\naverage age 5.8" }],
      rules: [uses(/JsonSerializer\.Deserialize/, "Read the file with JsonSerializer.Deserialize."), uses(/JsonSerializer\.Serialize/, "Save it with JsonSerializer.Serialize.", "save"), uses(/WriteIndented\s*=\s*true/, "Save it indented.", "indent")],
      hints: ["var pets = JsonSerializer.Deserialize<List<Pet>>(File.ReadAllText(\"pets.json\"))!;", "File.WriteAllText(\"pets.json\", JsonSerializer.Serialize(pets, new JsonSerializerOptions { WriteIndented = true }));", "Read it again into a new list before printing."],
      answer: 'using System.Text.Json;\nvar pets = JsonSerializer.Deserialize<List<Pet>>(File.ReadAllText("pets.json"))!;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    pets.Add(new Pet(p[0], p[1], int.Parse(p[2])));\n}\nFile.WriteAllText("pets.json", JsonSerializer.Serialize(pets, new JsonSerializerOptions { WriteIndented = true }));\nvar saved = JsonSerializer.Deserialize<List<Pet>>(File.ReadAllText("pets.json"))!;\nConsole.WriteLine($"{saved.Count} pets: {string.Join(", ", saved.Select(p => p.Name))}");\nConsole.WriteLine($"average age {saved.Average(p => p.Age):F1}");\n\nrecord Pet(string Name, string Kind, int Age);' },
    "11.2-lines": { lesson: "11.2", title: "Line by line", tier: "stretch", minutes: 20, concepts: ["json"],
      statement: ["Each input line is meant to be one JSON object for `record Reading(string Sensor, double Value)` (names as written, case-sensitive). Read until the end.", "For each good line print `SENSOR VALUE` (1 decimal); for a line that is not valid JSON print `line N: not JSON`; for JSON whose Sensor is missing (null) print `line N: no sensor`. Finally `good G, bad B`."],
      starter: 'using System.Text.Json;\n\nrecord Reading(string Sensor, double Value);',
      examples: [{ stdin: "{\"Sensor\":\"t1\",\"Value\":21.5}\n{\"Sensor\":\"t2\",\n{\"Value\":3}", out: "t1 21.5\nline 2: not JSON\nline 3: no sensor\ngood 1, bad 2" }],
      hidden: [{ stdin: "", out: "good 0, bad 0" }, { stdin: "{\"Sensor\":\"h\",\"Value\":-0.26}\nhello", out: "h -0.3\nline 2: not JSON\ngood 1, bad 1" }],
      rules: [uses(/catch\s*\(\s*JsonException/, "Catch JsonException.")],
      hints: ["try { var r = JsonSerializer.Deserialize<Reading>(line); … } catch (JsonException) { … }", "A missing property leaves Sensor null: if (r?.Sensor is null) …", "Keep a line counter n and the good/bad counts."],
      answer: 'using System.Text.Json;\nint n = 0, good = 0, bad = 0;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    n++;\n    try\n    {\n        var r = JsonSerializer.Deserialize<Reading>(line);\n        if (r?.Sensor is null) { Console.WriteLine($"line {n}: no sensor"); bad++; continue; }\n        Console.WriteLine($"{r.Sensor} {r.Value:F1}");\n        good++;\n    }\n    catch (JsonException)\n    {\n        Console.WriteLine($"line {n}: not JSON");\n        bad++;\n    }\n}\nConsole.WriteLine($"good {good}, bad {bad}");\n\nrecord Reading(string Sensor, double Value);' }
  } });

  /* ================================================================
     11.3 Configuration
     ================================================================ */
  lesson("11.3", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A program that has `\"dark\"` and `14` written into its code must be rebuilt to change its theme or font size — and every user gets the same.",
        "**Configuration** moves such values out of the code: defaults in the program, a **settings file**, then **environment variables** and **command-line arguments** that override it.",
        "Each layer can change only what it mentions; the last one to set a value wins."
      ] },
      page("Core idea"),
      run("layers", "defaults, then the file, then overrides — later wins", 'using System.Text.Json;\nvar s = new Settings();\nConsole.WriteLine($"defaults: {s}");\nvar fromFile = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(File.ReadAllText("settings.json"))!;\nif (fromFile.TryGetValue("Theme", out var t)) s = s with { Theme = t.GetString()! };\nif (fromFile.TryGetValue("FontSize", out var f)) s = s with { FontSize = f.GetInt32() };\nConsole.WriteLine($"file:     {s}");\nforeach (var arg in new[] { "--FontSize=18" })\n{\n    var kv = arg.TrimStart(\'-\').Split(\'=\');\n    if (kv[0] == "FontSize") s = s with { FontSize = int.Parse(kv[1]) };\n    if (kv[0] == "Theme") s = s with { Theme = kv[1] };\n}\nConsole.WriteLine($"args:     {s}");\n\nrecord Settings(string Theme = "light", int FontSize = 12, bool Sounds = true);', { fs: SETTINGS }),
      { ul: [
        "The **defaults** live in one place, the record's parameters, so a missing setting is never a crash.",
        "The file mentions Theme and FontSize; Sounds keeps its default.",
        "A command-line argument beats the file — the person running the program has the last word."
      ] },
      run("record", "binding the whole file to a record, with defaults for what is missing", 'using System.Text.Json;\nvar s = JsonSerializer.Deserialize<Settings>(File.ReadAllText("settings.json")) ?? new Settings();\nConsole.WriteLine(s);\n\nrecord Settings(string Theme = "light", int FontSize = 12, bool Sounds = true);', { fs: SETTINGS }),
      page("Rules"),
      { table: { head: ["Layer", "Typical source", "Use for"], rows: [["defaults", "the code", "a sensible value for everything"], ["settings file", "appsettings.json", "per-installation choices"], ["environment variables", "the OS, a container, CI", "per-machine values, secrets"], ["command line", "`--Key=value`", "one run's choices"]] } },
      { ul: [
        "Later layers override earlier ones; a layer that says nothing changes nothing.",
        "Read configuration once, at start-up, into one typed object (a record), and pass that object around — never re-read files deep inside the program.",
        "**Validate** at start-up: a font size of −3 should stop the program with a clear message, not cause a strange bug later.",
        "**Secrets** (API keys, passwords) never go in a file that is committed to Git: use environment variables or a secret store.",
        "In ASP.NET and other hosts, `Microsoft.Extensions.Configuration` does this layering for you; this lesson builds the idea by hand."
      ] },
      page("Variations"),
      { h: "Environment variables" },
      run("env", "an unset variable is null: fall back", 'string? mode = Environment.GetEnvironmentVariable("KUREAI_MODE_EXAMPLE");\nConsole.WriteLine(mode ?? "(not set) — using default: normal");\nEnvironment.SetEnvironmentVariable("KUREAI_MODE_EXAMPLE", "quiet");\nConsole.WriteLine(Environment.GetEnvironmentVariable("KUREAI_MODE_EXAMPLE"));'),
      { h: "Validating at start-up" },
      run("validate", "collect every problem, then refuse to start", 'var s = new Settings("purple", 3);\nvar problems = new List<string>();\nif (s.Theme is not ("light" or "dark")) problems.Add($"Theme must be light or dark, not {s.Theme}");\nif (s.FontSize is < 8 or > 32) problems.Add($"FontSize must be 8–32, not {s.FontSize}");\nConsole.WriteLine(problems.Count == 0 ? "settings ok" : string.Join("\\n", problems));\n\nrecord Settings(string Theme = "light", int FontSize = 12);'),
      { h: "key=value overrides from any source" },
      run("pairs", "one parser for --Key=value arguments and KEY=value lines", 'var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) { ["Theme"] = "light", ["FontSize"] = "12" };\nforeach (var source in new[] { new[] { "theme=dark" }, new[] { "--FontSize=16", "--theme=light" } })\n    foreach (var item in source)\n    {\n        var kv = item.TrimStart(\'-\').Split(\'=\', 2);\n        if (kv.Length == 2) values[kv[0]] = kv[1];\n    }\nforeach (var (k, v) in values) Console.WriteLine($"{k} = {v}");'),
      page("Pitfalls"),
      { h: "Assigning to a record property — CS8852" },
      run("pit-init", "settings are immutable: use with", 'var s = new Settings();\ns.FontSize = 16;\n\nrecord Settings(string Theme = "light", int FontSize = 12);'),
      { h: "A setting read as the wrong type" },
      run("pit-kind", "\"14\" in quotes is a string, not a number", 'using System.Text.Json;\ntry\n{\n    var s = JsonSerializer.Deserialize<Settings>("{\\"FontSize\\":\\"14\\"}");\n}\ncatch (JsonException) { Console.WriteLine("FontSize must be a number, not text"); }\n\nrecord Settings(string Theme = "light", int FontSize = 12);'),
      { h: "A secret in the settings file" },
      "An API key in `appsettings.json` is in every copy of the repository, for ever (Git keeps history). Read it from an environment variable, and add the local file to `.gitignore`.",
      page("Connections"),
      { ul: [ "**Back:** 8.7 records and with; 11.2 JSON; 7.x optional parameters as defaults.", "**Next:** 10.x tests pass in a configuration instead of reading files; D4 the Options pattern; T7 environment variables in deployment.", "**Your own app:** KurenaiOS keeps its keys in a local, untracked file for exactly this reason." ] },
      page("Good practice"),
      { ul: [ "One typed settings object, read once, validated once.", "Defaults for everything; override in layers.", "Secrets only from the environment or a secret store." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Layered settings* and *Check the settings*." ] },
      page("Quick reference"),
      run("qr", "default → file → override", 'var s = new Cfg();\ns = s with { Level = 3 };\nConsole.WriteLine(s);\n\nrecord Cfg(int Level = 1, string Name = "app");'),
      { ul: [ "Defaults in a record; `with` to override.", "Later layers win; validate at start-up.", "No secrets in committed files." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS8852", "init-only: use with", "Pitfalls"], ["JsonException", "a value of the wrong JSON type", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var s = new Cfg();\ns = s with { Size = 5 };\ns = s with { Name = "b" };\nConsole.WriteLine(s);\n\nrecord Cfg(string Name = "a", int Size = 1, bool On = true);', why: "Each with changes only what it names; On keeps its default.", concepts: ["config"] },
        { id: "p2", src: 'var v = new Dictionary<string, string> { ["x"] = "1" };\nforeach (var item in new[] { "x=2", "y=3", "x=4" }) { var kv = item.Split(\'=\'); v[kv[0]] = kv[1]; }\nConsole.WriteLine($"{v["x"]} {v.Count}");', why: "The last x wins (4); y is added: two keys.", concepts: ["config"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so an unset variable falls back to \"normal\".", src: 'string mode = Environment.GetEnvironmentVariable("SURELY_NOT_SET_12345") @@;\nConsole.WriteLine(mode);', out: "normal", answer: "?? \"normal\"", concepts: ["config"] }
      ],
      bug: [
        { id: "b1", q: "The override should win: it should print 18.", src: 'int size = 12;\nint fromFile = 14, fromArgs = 18;\nsize = fromArgs;\nsize = fromFile;\nConsole.WriteLine(size);', out: "18", fixedText: "prints 18", why: "Layers apply in order, lowest first: file, then arguments.", concepts: ["config"] }
      ]
    },
    flashcards: [
      ["Why keep configuration out of the code?", "So values can change without rebuilding, per installation or run."],
      ["Which layer wins?", "The last applied: typically command line over environment over file over defaults."],
      ["Where should secrets come from?", "Environment variables or a secret store — never a committed file."],
      ["When should settings be validated?", "Once, at start-up, with every problem reported."],
      ["What does GetEnvironmentVariable return for an unset variable?", "null."],
      ["Why read settings into one typed record?", "One place to validate; the rest of the program gets typed values."]
    ],
    quiz: [
      { q: "The file says FontSize 14 and the command line --FontSize=18. Used:", opts: ["14", "18", "12", "an error"], ans: 1, why: "The command line overrides the file." },
      { q: "A missing setting in the file should…", opts: ["crash", "keep its default", "become 0", "be asked for"], ans: 1, why: "Defaults cover what layers do not mention." },
      { q: "An API key belongs in…", opts: ["appsettings.json in Git", "an environment variable", "the code", "the README"], ans: 1, why: "Never commit secrets." }
    ]
  });
  K.add({ tasks: {
    "11.3-layers": { lesson: "11.3", title: "Layered settings", tier: "core", minutes: 20, concepts: ["config"],
      fs: SETTINGS,
      statement: ["Settings have defaults `Theme light`, `FontSize 12`, `Sounds true` (a record). `settings.json` may set any of them. Then each input line is an override `Key=value` (keys in any case; unknown keys print `unknown KEY`).", "Apply defaults, then the file, then the overrides in order, and print the final `Theme T, FontSize F, Sounds S`."],
      starter: 'using System.Text.Json;\n\nrecord Settings(string Theme = "light", int FontSize = 12, bool Sounds = true);',
      examples: [{ stdin: "fontsize=18", out: "Theme dark, FontSize 18, Sounds True" }],
      hidden: [{ stdin: "", fs: { "settings.json": "{}" }, out: "Theme light, FontSize 12, Sounds True" }, { stdin: "sounds=false\ncolour=red\nTHEME=light", out: "unknown colour\nTheme light, FontSize 14, Sounds False" }],
      rules: [uses(/record\s+Settings/, "Keep the settings in the record."), uses(/\bwith\s*\{/, "Override with `with`.", "with")],
      hints: ["var s = JsonSerializer.Deserialize<Settings>(File.ReadAllText(\"settings.json\")) ?? new Settings();", "var kv = line.Split('=', 2); switch (kv[0].ToLower()) { case \"theme\": s = s with { Theme = kv[1] }; break; … }", "bool.Parse(\"false\") is false."],
      answer: 'using System.Text.Json;\nvar s = JsonSerializer.Deserialize<Settings>(File.ReadAllText("settings.json")) ?? new Settings();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var kv = line.Split(\'=\', 2);\n    switch (kv[0].ToLower())\n    {\n        case "theme": s = s with { Theme = kv[1] }; break;\n        case "fontsize": s = s with { FontSize = int.Parse(kv[1]) }; break;\n        case "sounds": s = s with { Sounds = bool.Parse(kv[1]) }; break;\n        default: Console.WriteLine($"unknown {kv[0]}"); break;\n    }\n}\nConsole.WriteLine($"Theme {s.Theme}, FontSize {s.FontSize}, Sounds {s.Sounds}");\n\nrecord Settings(string Theme = "light", int FontSize = 12, bool Sounds = true);' },
    "11.3-check": { lesson: "11.3", title: "Check the settings", tier: "core", minutes: 15, concepts: ["config"],
      statement: ["Each input line is a settings object in JSON for `record Settings(string Theme = \"light\", int FontSize = 12, int Volume = 50)`.", "For each line print `ok` or every problem, joined by `; `: `Theme must be light or dark`, `FontSize must be 8-32`, `Volume must be 0-100`. A line that is not valid JSON prints `not JSON`."],
      starter: 'using System.Text.Json;\n\nrecord Settings(string Theme = "light", int FontSize = 12, int Volume = 50);',
      examples: [{ stdin: "{\"Theme\":\"dark\"}\n{\"Theme\":\"pink\",\"FontSize\":40}\n{oops", out: "ok\nTheme must be light or dark; FontSize must be 8-32\nnot JSON" }],
      hidden: [{ stdin: "{}\n{\"Volume\":-1,\"FontSize\":8}", out: "ok\nVolume must be 0-100" }],
      rules: [uses(/catch\s*\(\s*JsonException/, "Catch JsonException."), uses(/List<\s*string\s*>/, "Collect the problems in a List<string>.", "list")],
      hints: ["var s = JsonSerializer.Deserialize<Settings>(line) ?? new Settings();", "if (s.Theme is not (\"light\" or \"dark\")) problems.Add(…);", "Console.WriteLine(problems.Count == 0 ? \"ok\" : string.Join(\"; \", problems));"],
      answer: 'using System.Text.Json;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    try\n    {\n        var s = JsonSerializer.Deserialize<Settings>(line) ?? new Settings();\n        var problems = new List<string>();\n        if (s.Theme is not ("light" or "dark")) problems.Add("Theme must be light or dark");\n        if (s.FontSize is < 8 or > 32) problems.Add("FontSize must be 8-32");\n        if (s.Volume is < 0 or > 100) problems.Add("Volume must be 0-100");\n        Console.WriteLine(problems.Count == 0 ? "ok" : string.Join("; ", problems));\n    }\n    catch (JsonException) { Console.WriteLine("not JSON"); }\n}\n\nrecord Settings(string Theme = "light", int FontSize = 12, int Volume = 50);' }
  } });

  /* ================================================================
     11.4 Why async
     ================================================================ */
  lesson("11.4", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Fetching a web page takes 200 ms; reading a file on a slow disk 50 ms; a database query 30 ms. In that time a CPU could do hundreds of millions of steps.",
        "Code that **blocks** — sits and waits — wastes the thread: a desktop app freezes, a web server can serve fewer people, three downloads take the sum of their times.",
        "**Asynchronous** code starts the wait, lets the thread do other work, and carries on when the result arrives. Three downloads then take about as long as the slowest."
      ] },
      page("Core idea"),
      run("order", "start three waits at once; each finishes when its own wait ends", 'var a = Fetch("a", 300);\nvar b = Fetch("b", 100);\nvar c = Fetch("c", 200);\nConsole.WriteLine("all three started");\nawait Task.WhenAll(a, b, c);\nConsole.WriteLine("all done");\n\nstatic async Task Fetch(string name, int ms)\n{\n    Console.WriteLine($"start {name}");\n    await Task.Delay(ms);\n    Console.WriteLine($"done {name}");\n}'),
      { ul: [
        "Each `Fetch` runs until its `await Task.Delay(…)`, then **gives the thread back**; the next call starts at once.",
        "They finish in order of their waits — b (100 ms), c, a — not the order they started.",
        "The whole thing takes about 300 ms, the longest wait, instead of 600 ms one after another."
      ] },
      run("sum-vs-max", "one after another, the times add; all at once, the longest wins", 'int[] waits = { 300, 100, 200 };\nConsole.WriteLine($"one after another: about {waits.Sum()} ms");\nConsole.WriteLine($"all at once:       about {waits.Max()} ms");'),
      page("Rules"),
      { ul: [
        "**I/O-bound** work (network, disk, databases, timers) is mostly waiting: async lets one thread look after many waits.",
        "**CPU-bound** work (sorting a million items, image processing) is not waiting: async does not make it faster; running it on other cores does (D2).",
        "Async is about **not blocking**, not about threads: an awaited wait often uses no thread at all.",
        "A UI thread must never block (the window stops responding); a server thread should not (it could be serving someone else).",
        "In C#, `async`/`await` (11.5) writes asynchronous code in the same shape as ordinary code."
      ] },
      { table: { head: ["Work", "Mostly", "Helps"], rows: [["download three pages", "waiting", "async: about the longest time"], ["read a big file", "waiting", "async streams"], ["sort a big list", "computing", "a faster algorithm, or parallel cores"], ["call a slow API in a loop", "waiting", "start them all, then await all (11.6)"]] } },
      page("Variations"),
      { h: "The same work, blocking one after another" },
      run("sequential", "awaiting each before starting the next gives back the slow, ordered version", 'foreach (var (name, ms) in new[] { ("a", 300), ("b", 100), ("c", 200) })\n    await Fetch(name, ms);\nConsole.WriteLine("all done, one at a time");\n\nstatic async Task Fetch(string name, int ms)\n{\n    Console.WriteLine($"start {name}");\n    await Task.Delay(ms);\n    Console.WriteLine($"done {name}");\n}'),
      { h: "Doing something useful while waiting" },
      run("meanwhile", "start the wait, work, then await the result", 'var download = Download();\nint checksum = 0;\nfor (int i = 1; i <= 1000; i++) checksum = (checksum + i * i) % 9973;\nConsole.WriteLine($"worked out {checksum} while waiting");\nConsole.WriteLine(await download);\n\nstatic async Task<string> Download()\n{\n    await Task.Delay(150);\n    return "page arrived";\n}'),
      { h: "Who is waiting" },
      run("who", "a returned Task is a promise of a later result", 'Task<int> t = Slow();\nConsole.WriteLine($"finished yet? {t.IsCompleted}");\nint v = await t;\nConsole.WriteLine($"finished now? {t.IsCompleted}, result {v}");\n\nstatic async Task<int> Slow() { await Task.Delay(100); return 42; }'),
      page("Pitfalls"),
      { h: "await outside an async method — CS4032" },
      run("pit-await", "a method that awaits must be marked async", 'Console.WriteLine(Get());\n\nstatic int Get()\n{\n    await Task.Delay(10);\n    return 1;\n}'),
      { h: "Async for computing" },
      "Wrapping a long calculation in async does not make it faster; it still runs on a thread doing nothing else. Async pays off when the work is waiting for something outside the program.",
      { h: "Blocking on a Task" },
      "`task.Result` and `task.Wait()` block the thread until the task finishes — throwing away the benefit, and in a UI app often freezing it for good (a deadlock, 11.8). In this browser runtime blocking is not even allowed. Use `await`.",
      page("Connections"),
      { ul: [ "**Back:** 9.3 delegates and 9.7 events — async code is often triggered by events.", "**Next:** 11.5 writes async methods; 11.6 runs several at once; D2 goes into threads and parallel work.", "**Elsewhere:** T1 and T4 — servers and web pages are built on not blocking." ] },
      page("Good practice"),
      { ul: [ "Ask \"is this waiting or computing?\" before reaching for async.", "Start independent waits together; await them together.", "Async all the way: once a method awaits, its callers await it too." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Plan the waiting* and *Who finishes first*." ] },
      page("Quick reference"),
      run("qr", "start two, await both", 'var x = Task.Delay(100).ContinueWith(_ => "x");\nvar y = Task.Delay(200).ContinueWith(_ => "y");\nConsole.WriteLine(string.Join(" ", await Task.WhenAll(x, y)));'),
      { ul: [ "Waiting (I/O) → async helps; computing → it does not.", "Sequential waits add; concurrent waits take the longest.", "Never block on a Task: await it." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS4032", "await needs an async method", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var t1 = Say("one", 200);\nvar t2 = Say("two", 50);\nawait Task.WhenAll(t1, t2);\n\nstatic async Task Say(string s, int ms) { await Task.Delay(ms); Console.Write(s + " "); }', why: "Both start at once; two waits only 50 ms, so it prints first.", concepts: ["why-async"] },
        { id: "p2", src: 'int[] ms = { 120, 40, 90 };\nConsole.WriteLine($"{ms.Sum()} {ms.Max()}");', why: "One after another adds up to 250; all at once takes the longest, 120.", concepts: ["why-async"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the method can await.", src: 'Console.WriteLine(await Twice(21));\n\nstatic @@ Task<int> Twice(int x) { await Task.Delay(10); return x * 2; }', out: "42", answer: "async", concepts: ["why-async"] }
      ],
      bug: [
        { id: "b1", q: "Both waits should run at once, so b (shorter) finishes first: it should print b a.", src: 'await Step("a", 200);\nawait Step("b", 50);\nConsole.WriteLine();\n\nstatic async Task Step(string s, int ms) { await Task.Delay(ms); Console.Write(s + " "); }', out: "b a", fixedText: "prints b a", why: "Awaiting each before starting the next runs them one after another; start both, then await Task.WhenAll.", concepts: ["why-async"] }
      ]
    },
    flashcards: [
      ["What does blocking mean?", "A thread sits waiting and can do nothing else."],
      ["When does async help?", "When the work is mostly waiting (I/O): network, disk, databases, timers."],
      ["Does async speed up CPU-heavy work?", "No — that needs a faster algorithm or more cores."],
      ["Three waits of 300, 100 and 200 ms, started together, take about…", "300 ms (the longest)."],
      ["What does await do to the thread?", "Gives it back while waiting; the method resumes when the result arrives."],
      ["Why never .Result on a task in a UI?", "It blocks the UI thread and can deadlock."]
    ],
    quiz: [
      { q: "Which benefits most from async?", opts: ["sorting a list", "calling five web APIs", "adding two numbers", "a for loop over an array"], ans: 1, why: "It is waiting on the network." },
      { q: "Awaiting a Task inside a loop, one at a time, takes…", opts: ["the longest wait", "the sum of the waits", "no time", "half the sum"], ans: 1, why: "Each starts only after the last finished." },
      { q: "A Task is…", opts: ["a thread", "a promise of a result that may come later", "a lambda", "a file"], ans: 1, why: "It represents an operation that may not have finished." }
    ]
  });
  K.add({ tasks: {
    "11.4-plan": { lesson: "11.4", title: "Plan the waiting", tier: "warm-up", minutes: 10, concepts: ["why-async"],
      statement: ["Read jobs `NAME MS` (a wait in milliseconds), one per line, until the end.", "Print `one after another: S ms` (the sum) and `all at once: M ms` (the longest, or 0 for none), then `saved D ms`."],
      starter: 'var waits = new List<int>();\n',
      examples: [{ stdin: "page 300\nimage 100\nfont 200", out: "one after another: 600 ms\nall at once: 300 ms\nsaved 300 ms" }],
      hidden: [{ stdin: "", out: "one after another: 0 ms\nall at once: 0 ms\nsaved 0 ms" }, { stdin: "a 50", out: "one after another: 50 ms\nall at once: 50 ms\nsaved 0 ms" }],
      rules: [uses(/\.Max\s*\(|Math\.Max/, "The concurrent time is the longest wait.")],
      hints: ["waits.Add(int.Parse(line.Split(' ')[1]));", "int sum = waits.Sum(), max = waits.Count == 0 ? 0 : waits.Max();", "saved = sum − max."],
      answer: 'var waits = new List<int>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "") waits.Add(int.Parse(line.Split(\' \')[1]));\nint sum = waits.Sum(), max = waits.Count == 0 ? 0 : waits.Max();\nConsole.WriteLine($"one after another: {sum} ms");\nConsole.WriteLine($"all at once: {max} ms");\nConsole.WriteLine($"saved {sum - max} ms");' },
    "11.4-first": { lesson: "11.4", title: "Who finishes first", tier: "core", minutes: 20, concepts: ["why-async", "async-await"],
      statement: ["Read jobs `NAME MS` until the end (waits differ by 80 ms or more). Start every job at once — an async method that prints `start NAME`, awaits `Task.Delay(MS)`, then prints `done NAME` — and await them all.", "Finally print `finished in order: …` with the names in the order they finished."],
      starter: 'var jobs = new List<(string Name, int Ms)>();\n',
      examples: [{ stdin: "page 300\nimage 100\nfont 200", out: "start page\nstart image\nstart font\ndone image\ndone font\ndone page\nfinished in order: image font page" }],
      hidden: [{ stdin: "x 100", out: "start x\ndone x\nfinished in order: x" }, { stdin: "slow 250\nfast 50", out: "start slow\nstart fast\ndone fast\ndone slow\nfinished in order: fast slow" }],
      rules: [uses(/Task\.WhenAll/, "Await them all together with Task.WhenAll."), uses(/async\s+Task/, "Write an async Task method.", "async"), noUse(/foreach[^{;]*\{?\s*await\s+Run|for\s*\([^)]*\)\s*\{?\s*await/, "Start them all before awaiting any.", "concurrent")],
      hints: ["static async Task Run(string name, int ms, List<string> order) { Console.WriteLine($\"start {name}\"); await Task.Delay(ms); Console.WriteLine($\"done {name}\"); order.Add(name); }", "var tasks = jobs.Select(j => Run(j.Name, j.Ms, order)).ToList();", "await Task.WhenAll(tasks);"],
      answer: 'var jobs = new List<(string Name, int Ms)>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var p = line.Split(\' \');\n    jobs.Add((p[0], int.Parse(p[1])));\n}\nvar order = new List<string>();\nvar tasks = jobs.Select(j => Run(j.Name, j.Ms, order)).ToList();\nawait Task.WhenAll(tasks);\nConsole.WriteLine($"finished in order: {string.Join(" ", order)}");\n\nstatic async Task Run(string name, int ms, List<string> order)\n{\n    Console.WriteLine($"start {name}");\n    await Task.Delay(ms);\n    Console.WriteLine($"done {name}");\n    order.Add(name);\n}' }
  } });

  /* ================================================================
     11.5 async and await
     ================================================================ */
  lesson("11.5", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Before `async`/`await`, asynchronous code was a chain of callbacks: \"when this finishes, call that, and when that finishes…\" — hard to read, harder to handle errors in.",
        "`async` and `await` let you write the steps in order, with ordinary `if`, loops and `try`/`catch`; the compiler turns the method into the callback chain for you.",
        "Every waiting API in .NET has an `…Async` version that returns a **Task** you can await."
      ] },
      page("Core idea"),
      run("steps", "an async method reads like an ordinary one", 'string text = await LoadAsync("notes.txt");\nint words = await CountWordsAsync(text);\nConsole.WriteLine($"{words} words");\n\nstatic async Task<string> LoadAsync(string path)\n{\n    string s = await File.ReadAllTextAsync(path);\n    return s.Trim();\n}\n\nstatic async Task<int> CountWordsAsync(string text)\n{\n    await Task.Delay(50);\n    return text.Split(new[] { \' \', \'\\n\' }, StringSplitOptions.RemoveEmptyEntries).Length;\n}', { fs: NOTES }),
      { ul: [
        "`async` on a method allows `await` inside it; it returns `Task` (no result) or `Task<T>` (a result of type T).",
        "`await x` pauses **this method** until x finishes, without blocking the thread, then gives back x's result.",
        "`return s.Trim();` returns a string — the compiler wraps it in the Task<string>.",
        "Top-level statements may await directly (the program's Main becomes async)."
      ] },
      run("errors", "exceptions travel through await to an ordinary catch", 'foreach (string name in new[] { "notes.txt", "missing.txt" })\n{\n    try\n    {\n        string s = await File.ReadAllTextAsync(name);\n        Console.WriteLine($"{name}: {s.Length} characters");\n    }\n    catch (FileNotFoundException)\n    {\n        Console.WriteLine($"{name}: not found");\n    }\n}', { fs: NOTES }),
      page("Rules"),
      { table: { head: ["Return type", "Means", "Caller writes"], rows: [["`async Task`", "finishes, no result", "`await DoAsync();`"], ["`async Task<T>`", "finishes with a T", "`T x = await GetAsync();`"], ["`async ValueTask<T>`", "like Task<T>, cheaper when usually instant", "`await`"], ["`async void`", "fire and forget — only for event handlers", "cannot await it (11.8)"]] } },
      { ul: [
        "Name async methods with the **Async** suffix: `LoadAsync`, `SaveAsync`.",
        "An exception inside an async method is stored in its Task and re-thrown at the `await`.",
        "Until the first `await` that really waits, an async method runs on the caller's thread like any method.",
        "Async is **contagious**: a method that awaits must be async, so its caller awaits it, and so on up — \"async all the way\".",
        "`await` works on anything awaitable: Task, ValueTask, and `await foreach` over an `IAsyncEnumerable<T>` (9.11's iterators, async)."
      ] },
      page("Variations"),
      { h: "Async streams" },
      run("stream", "await foreach: items produced asynchronously, one at a time", 'await foreach (var reading in ReadingsAsync())\n    Console.WriteLine(reading);\n\nstatic async IAsyncEnumerable<string> ReadingsAsync()\n{\n    foreach (var t in new[] { 18.5, 19.0, 19.5 })\n    {\n        await Task.Delay(30);\n        yield return $"{t:F1}°C";\n    }\n}'),
      { h: "Reading a file line by line, asynchronously" },
      run("lines", "StreamReader.ReadLineAsync", 'using var r = new StreamReader("notes.txt");\nint n = 0;\nstring? line;\nwhile ((line = await r.ReadLineAsync()) is not null) if (line.Length > 0) n++;\nConsole.WriteLine($"{n} non-blank lines");', { fs: NOTES }),
      { h: "A result that is sometimes ready at once" },
      run("cached", "ValueTask: no Task allocated when the answer is in the cache", 'var cache = new Dictionary<int, int>();\nConsole.WriteLine(await SquareAsync(7));\nConsole.WriteLine(await SquareAsync(7));\nConsole.WriteLine($"{cache.Count} cached");\n\nasync ValueTask<int> SquareAsync(int x)\n{\n    if (cache.TryGetValue(x, out int v)) return v;\n    await Task.Delay(40);\n    return cache[x] = x * x;\n}'),
      page("Pitfalls"),
      { h: "Returning the wrong type — CS0029" },
      run("pit-return", "Task<int> methods return an int, not a string", 'Console.WriteLine(await CountAsync());\n\nstatic async Task<int> CountAsync()\n{\n    await Task.Delay(10);\n    return "three";\n}'),
      { h: "Forgetting await on a Task<T>" },
      run("pit-task", "without await you print the Task, not its result", 'var count = CountAsync();\nConsole.WriteLine($"count is a Task<int>: {count is Task<int>}");\nConsole.WriteLine(await count);\n\nstatic async Task<int> CountAsync() { await Task.Delay(10); return 3; }'),
      { h: "An async method with no await" },
      "Marking a method `async` but never awaiting inside it gives warning CS1998 and runs it synchronously anyway. Either await something or drop `async`.",
      page("Connections"),
      { ul: [ "**Back:** 11.4 why async; 9.11 iterators (async streams are their async twin); 6.x exceptions.", "**Next:** 11.6 several tasks at once; 11.7 cancelling them; 11.8 what goes wrong.", "**Elsewhere:** T1's database and web calls are all async." ] },
      page("Good practice"),
      { ul: [ "Use the Async version of every I/O call in async code.", "Return Task or Task<T>; keep async void for event handlers.", "Catch exceptions around the await, where you can do something about them." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *An async word count* and *Async, with failures*." ] },
      page("Quick reference"),
      run("qr", "an async method and its call", 'Console.WriteLine(await AddAsync(2, 3));\n\nstatic async Task<int> AddAsync(int a, int b)\n{\n    await Task.Delay(10);\n    return a + b;\n}'),
      { ul: [ "`async Task<T> NameAsync()` … `return value;`", "`T x = await NameAsync();`", "Exceptions re-throw at the await." ] },
      { table: { head: ["Code", "Means", "Page"], rows: [["CS0029", "returned the wrong type", "Pitfalls"], ["CS1998 (warning)", "async with no await", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.Write("a ");\nvar t = Work();\nConsole.Write("c ");\nawait t;\nConsole.WriteLine("e");\n\nstatic async Task Work() { Console.Write("b "); await Task.Delay(30); Console.Write("d "); }', why: "Work runs until its first real wait (b), returns to the caller (c), then finishes (d) before e.", concepts: ["async-await"] },
        { id: "p2", src: 'try { await Fail(); }\ncatch (InvalidOperationException e) { Console.WriteLine("caught: " + e.Message); }\n\nstatic async Task Fail() { await Task.Delay(10); throw new InvalidOperationException("no"); }', why: "The exception is stored in the Task and re-thrown at the await.", concepts: ["async-await"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the return type of an async method that gives back an int.", src: 'Console.WriteLine(await Three());\n\nstatic async @@ Three() { await Task.Delay(5); return 3; }', out: "3", answer: "Task<int>", concepts: ["async-await"] }
      ],
      bug: [
        { id: "b1", q: "It should print the length, 11.", src: 'var len = LengthAsync("hello world");\nConsole.WriteLine(len.IsCompleted ? "?" : "not ready");\n\nstatic async Task<int> LengthAsync(string s) { await Task.Delay(20); return s.Length; }', out: "11", fixedText: "prints 11", why: "The Task was never awaited; write Console.WriteLine(await LengthAsync(\"hello world\"));", concepts: ["async-await"] }
      ]
    },
    flashcards: [
      ["What does async on a method allow?", "Using await inside it."],
      ["What does await do?", "Pauses this method until the task finishes, without blocking the thread, and gives its result."],
      ["Return type for an async method with a result?", "Task<T>."],
      ["Where does an exception in an async method surface?", "At the await of its Task."],
      ["When is async void acceptable?", "Only for event handlers."],
      ["What naming convention do async methods follow?", "The Async suffix: LoadAsync."]
    ],
    quiz: [
      { q: "`static async Task<string> GetAsync()` must return…", opts: ["a Task<string>", "a string", "void", "a Task"], ans: 1, why: "The compiler wraps the string in the Task." },
      { q: "Without await, `var x = GetAsync();` makes x…", opts: ["the string", "a Task<string>", "null", "an error"], ans: 1, why: "The call returns the Task at once." },
      { q: "Which loops over an IAsyncEnumerable<T>?", opts: ["foreach", "await foreach", "for", "while (await)"], ans: 1, why: "Each item may need awaiting." }
    ]
  });
  K.add({ tasks: {
    "11.5-count": { lesson: "11.5", title: "An async word count", tier: "core", minutes: 15, concepts: ["async-await"],
      fs: NOTES,
      statement: ["Write `static async Task<int> CountWordsAsync(string path)` that reads the file with `File.ReadAllTextAsync` and returns its number of words (split on spaces and new lines).", "Read file names, one per line, until the end; for each print `NAME: W words`, or `NAME: missing` when the file does not exist (catch the exception around the await)."],
      starter: '',
      examples: [{ stdin: "notes.txt\nnope.txt", out: "notes.txt: 10 words\nnope.txt: missing" }],
      hidden: [{ stdin: "", out: "" }, { stdin: "a.txt", fs: { "a.txt": "one two\nthree" }, out: "a.txt: 3 words" }],
      rules: [uses(/async\s+Task<\s*int\s*>\s+CountWordsAsync/, "Write async Task<int> CountWordsAsync."), uses(/ReadAllTextAsync/, "Read with File.ReadAllTextAsync.", "read"), uses(/await\s+CountWordsAsync/, "Await it.", "await")],
      hints: ["string text = await File.ReadAllTextAsync(path);", "return text.Split(new[] { ' ', '\\n' }, StringSplitOptions.RemoveEmptyEntries).Length;", "try { … await CountWordsAsync(line) … } catch (FileNotFoundException) { … }"],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    try\n    {\n        int w = await CountWordsAsync(line);\n        Console.WriteLine($"{line}: {w} words");\n    }\n    catch (FileNotFoundException)\n    {\n        Console.WriteLine($"{line}: missing");\n    }\n}\n\nstatic async Task<int> CountWordsAsync(string path)\n{\n    string text = await File.ReadAllTextAsync(path);\n    return text.Split(new[] { \' \', \'\\n\' }, StringSplitOptions.RemoveEmptyEntries).Length;\n}' },
    "11.5-failures": { lesson: "11.5", title: "Async, with failures", tier: "core", minutes: 20, concepts: ["async-await"],
      statement: ["Write `static async Task<double> PriceAsync(string item)`: it awaits `Task.Delay(20)`, then returns tea 1.50, cake 2.25, scone 1.80, and throws `KeyNotFoundException` for anything else.", "Read items until the end. Await each in turn; print `ITEM P` (2 decimals) or `ITEM: not on the menu`. Finally `total T` over the items found."],
      starter: '',
      examples: [{ stdin: "tea\npizza\ncake", out: "tea 1.50\npizza: not on the menu\ncake 2.25\ntotal 3.75" }],
      hidden: [{ stdin: "", out: "total 0.00" }, { stdin: "scone\nscone", out: "scone 1.80\nscone 1.80\ntotal 3.60" }],
      rules: [uses(/async\s+Task<\s*double\s*>\s+PriceAsync/, "Write async Task<double> PriceAsync."), uses(/catch\s*\(\s*KeyNotFoundException/, "Catch KeyNotFoundException around the await.", "catch")],
      hints: ["await Task.Delay(20); return item switch { \"tea\" => 1.50, … , _ => throw new KeyNotFoundException(item) };", "try { double p = await PriceAsync(line); … } catch (KeyNotFoundException) { … }", "Console.WriteLine($\"total {total:F2}\");"],
      answer: 'double total = 0;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    try\n    {\n        double p = await PriceAsync(line);\n        total += p;\n        Console.WriteLine($"{line} {p:F2}");\n    }\n    catch (KeyNotFoundException)\n    {\n        Console.WriteLine($"{line}: not on the menu");\n    }\n}\nConsole.WriteLine($"total {total:F2}");\n\nstatic async Task<double> PriceAsync(string item)\n{\n    await Task.Delay(20);\n    return item switch\n    {\n        "tea" => 1.50,\n        "cake" => 2.25,\n        "scone" => 1.80,\n        _ => throw new KeyNotFoundException(item)\n    };\n}' }
  } });

  /* ================================================================
     11.6 Tasks and Task.WhenAll
     ================================================================ */
  lesson("11.6", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "11.4 started several waits at once. Real programs need more: collect every result in order, act on the **first** to finish, keep going when one fails, and not open a thousand connections at once.",
        "`Task.WhenAll` waits for every task and gives back all their results, in the order you passed them. `Task.WhenAny` gives back the first to finish.",
        "`SemaphoreSlim` limits how many run at the same time."
      ] },
      page("Core idea"),
      run("whenall", "start every fetch, then await them all; results come back in order", 'var items = new[] { ("tea", 300), ("cake", 100), ("scone", 200) };\nTask<double>[] tasks = items.Select(i => PriceAsync(i.Item1, i.Item2)).ToArray();\ndouble[] prices = await Task.WhenAll(tasks);\nfor (int i = 0; i < items.Length; i++) Console.WriteLine($"{items[i].Item1} {prices[i]:F2}");\nConsole.WriteLine($"total {prices.Sum():F2}");\n\nstatic async Task<double> PriceAsync(string item, int ms)\n{\n    await Task.Delay(ms);\n    Console.WriteLine($"  ({item} arrived)");\n    return item switch { "tea" => 1.50, "cake" => 2.25, _ => 1.80 };\n}'),
      { ul: [
        "`Select` calls PriceAsync for every item, which **starts** each one; `ToArray()` makes sure they all start now (9.10: Select is deferred).",
        "They **arrive** in order of their delays, but `await Task.WhenAll` returns the results in the order of the tasks given — tea, cake, scone.",
        "The total time is the slowest, not the sum."
      ] },
      run("whenany", "the first mirror to answer wins", 'var mirrors = new Dictionary<Task<string>, string>\n{\n    [Get("eu", 300)] = "eu", [Get("us", 120)] = "us", [Get("asia", 220)] = "asia"\n};\nTask<string> first = await Task.WhenAny(mirrors.Keys);\nConsole.WriteLine($"winner {mirrors[first]}: {await first}");\n\nstatic async Task<string> Get(string where, int ms) { await Task.Delay(ms); return $"file from {where}"; }'),
      page("Rules"),
      { table: { head: ["Call", "Waits for", "Gives back"], rows: [["`await Task.WhenAll(t1, t2)`", "every task", "T[] in the order given (or nothing for plain Tasks)"], ["`await Task.WhenAny(t1, t2)`", "the first to finish", "that Task (await it for its result)"], ["`Task.Run(() => work)`", "starts CPU work on the thread pool", "a Task of its result"], ["`await semaphore.WaitAsync()` … `Release()`", "a free slot", "a limit on how many run at once"]] } },
      { ul: [
        "Start every task **before** the first await — a `foreach` with `await` inside runs them one after another.",
        "If any task fails, `await Task.WhenAll` throws the **first** exception; every task's own `Exception` and `Status` are still there to inspect.",
        "`WhenAny` does not cancel the losers: they keep running unless you cancel them (11.7).",
        "`Task.Run` is for **CPU** work you want off the current thread; do not wrap I/O in it (I/O already has Async methods)."
      ] },
      page("Variations"),
      { h: "At most two at a time" },
      run("throttle", "a SemaphoreSlim(2) lets a third start only when a slot frees", 'var gate = new SemaphoreSlim(2);\nvar jobs = new[] { ("a", 100), ("b", 420), ("c", 100), ("d", 100) };\nawait Task.WhenAll(jobs.Select(j => Limited(j.Item1, j.Item2)));\n\nasync Task Limited(string name, int ms)\n{\n    await gate.WaitAsync();\n    try\n    {\n        Console.WriteLine($"start {name}");\n        await Task.Delay(ms);\n        Console.WriteLine($"done {name}");\n    }\n    finally { gate.Release(); }\n}'),
      { h: "When some fail" },
      run("failures", "WhenAll throws the first error; each task keeps its own outcome", 'var tasks = new[] { Work("a", 50, false), Work("b", 100, true), Work("c", 150, false) };\ntry { await Task.WhenAll(tasks); }\ncatch (Exception e) { Console.WriteLine($"WhenAll threw: {e.Message}"); }\nforeach (var t in tasks)\n    Console.WriteLine(t.IsFaulted ? $"failed: {t.Exception!.InnerException!.Message}" : $"ok: {t.Result}");\n\nstatic async Task<string> Work(string name, int ms, bool fail)\n{\n    await Task.Delay(ms);\n    if (fail) throw new InvalidOperationException($"{name} broke");\n    return name;\n}'),
      { h: "Each result as it arrives" },
      run("asdone", "WhenAny in a loop handles results in finishing order", 'var pending = new List<Task<int>> { Square(3, 200), Square(5, 80), Square(7, 140) };\nwhile (pending.Count > 0)\n{\n    var done = await Task.WhenAny(pending);\n    pending.Remove(done);\n    Console.WriteLine(await done);\n}\n\nstatic async Task<int> Square(int x, int ms) { await Task.Delay(ms); return x * x; }'),
      page("Pitfalls"),
      { h: "Forgetting to await WhenAll — CS0029" },
      run("pit-await", "WhenAll returns a Task of the array, not the array", 'Task<int> a = Task.FromResult(1), b = Task.FromResult(2);\nint[] both = Task.WhenAll(a, b);'),
      { h: "Starting them one at a time" },
      run("pit-serial", "an await inside the loop waits for each before starting the next", 'foreach (var (name, ms) in new[] { ("slow", 200), ("fast", 50) })\n{\n    await Task.Delay(ms);\n    Console.Write(name + " ");\n}\nConsole.WriteLine("— fast had to wait for slow");'),
      { h: "Deferred Select" },
      "`var tasks = items.Select(i => FetchAsync(i));` starts nothing until enumerated — and enumerating it twice starts everything twice. Add `.ToList()` or `.ToArray()`.",
      page("Connections"),
      { ul: [ "**Back:** 11.4–11.5; 9.10 deferred execution; 9.8 Select.", "**Next:** 11.7 cancels the losers; 11.9 combines limits, timeouts and retries.", "**Further:** D2 concurrency (threads, locks, channels, PLINQ)." ] },
      page("Good practice"),
      { ul: [ "Materialise the tasks (`ToArray`) before awaiting them.", "Limit concurrency against real servers (a SemaphoreSlim of 4–8 is polite).", "After a failed WhenAll, report every task, not just the first exception." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Fetch the whole order* and *The fastest mirror*." ] },
      page("Quick reference"),
      run("qr", "WhenAll with results", 'int[] r = await Task.WhenAll(Twice(1), Twice(2), Twice(3));\nConsole.WriteLine(string.Join(" ", r));\n\nstatic async Task<int> Twice(int x) { await Task.Delay(30); return x * 2; }'),
      { ul: [ "`T[] r = await Task.WhenAll(tasks)` — results in task order.", "`var first = await Task.WhenAny(tasks)` — then `await first`.", "`SemaphoreSlim` to limit; `try/finally` to release." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0029", "a Task is not its result: await it", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int[] r = await Task.WhenAll(Get(3, 200), Get(1, 50), Get(2, 120));\nConsole.WriteLine(string.Join(",", r));\n\nstatic async Task<int> Get(int x, int ms) { await Task.Delay(ms); Console.Write(x + " "); return x * 10; }', why: "They print as they finish (1, 2, 3), but the array keeps the order given: 30, 10, 20.", concepts: ["when-all"] },
        { id: "p2", src: 'var t = await Task.WhenAny(Get("x", 300), Get("y", 60));\nConsole.WriteLine(await t);\n\nstatic async Task<string> Get(string s, int ms) { await Task.Delay(ms); return s; }', why: "y finishes first, so WhenAny returns its task.", concepts: ["when-all"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to wait for every task and get their results.", src: 'var tasks = new[] { One(), One(), One() };\nint[] r = await @@(tasks);\nConsole.WriteLine(r.Sum());\n\nstatic async Task<int> One() { await Task.Delay(10); return 1; }', out: "3", answer: "Task.WhenAll", concepts: ["when-all"] }
      ],
      bug: [
        { id: "b1", q: "Both downloads should run at once: the shorter one should print first, giving `b a`.", src: 'foreach (var (n, ms) in new[] { ("a", 200), ("b", 50) })\n    await Step(n, ms);\nConsole.WriteLine();\n\nstatic async Task Step(string n, int ms) { await Task.Delay(ms); Console.Write(n + " "); }', out: "b a", fixedText: "prints b a", why: "The await inside the loop runs them one by one; start them all (Select(…).ToArray()) and await Task.WhenAll.", concepts: ["when-all"] }
      ]
    },
    flashcards: [
      ["What order are WhenAll's results in?", "The order the tasks were passed — not the order they finished."],
      ["What does WhenAny return?", "The first task to finish (await it for its result)."],
      ["Why ToArray() after Select(… Async …)?", "Select is deferred: ToArray starts every task now, once."],
      ["What does await WhenAll throw when tasks fail?", "The first exception; each task still holds its own."],
      ["How do you limit concurrency?", "A SemaphoreSlim: WaitAsync before, Release in finally."],
      ["When use Task.Run?", "For CPU work to move off the current thread — not for I/O."]
    ],
    quiz: [
      { q: "Three fetches of 100, 300 and 200 ms with WhenAll take about…", opts: ["100 ms", "300 ms", "600 ms", "200 ms"], ans: 1, why: "They run together: the slowest decides." },
      { q: "After WhenAny returns the winner, the other tasks…", opts: ["are cancelled", "keep running", "are awaited", "throw"], ans: 1, why: "Cancel them yourself if you do not need them." },
      { q: "A SemaphoreSlim(3) lets how many run at once?", opts: ["1", "3", "unlimited", "0"], ans: 1, why: "Three slots." }
    ]
  });
  K.add({ tasks: {
    "11.6-order": { lesson: "11.6", title: "Fetch the whole order", tier: "core", minutes: 20, concepts: ["when-all"],
      statement: ["Read lines `ITEM MS PRICE` until the end. For each, start `static async Task<decimal> PriceAsync(int ms, decimal price)` (it awaits the delay and returns the price) — all at once — and await them together with `Task.WhenAll`.", "Print `ITEM P` in the input order (2 decimals), then `total T` and `slowest S ms` (0 for an empty order)."],
      starter: 'var lines = new List<string[]>();\n',
      examples: [{ stdin: "tea 300 1.50\ncake 100 2.25\nscone 200 1.80", out: "tea 1.50\ncake 2.25\nscone 1.80\ntotal 5.55\nslowest 300 ms" }],
      hidden: [{ stdin: "", out: "total 0.00\nslowest 0 ms" }, { stdin: "bun 50 0.99", out: "bun 0.99\ntotal 0.99\nslowest 50 ms" }],
      rules: [uses(/Task\.WhenAll/, "Await them with Task.WhenAll."), uses(/async\s+Task<\s*decimal\s*>\s+PriceAsync/, "Write async Task<decimal> PriceAsync.", "method")],
      hints: ["var tasks = lines.Select(p => PriceAsync(int.Parse(p[1]), decimal.Parse(p[2]))).ToArray();", "decimal[] prices = await Task.WhenAll(tasks);", "slowest: lines.Count == 0 ? 0 : lines.Max(p => int.Parse(p[1]))"],
      answer: 'var lines = new List<string[]>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "") lines.Add(line.Split(\' \'));\nvar tasks = lines.Select(p => PriceAsync(int.Parse(p[1]), decimal.Parse(p[2]))).ToArray();\ndecimal[] prices = await Task.WhenAll(tasks);\nfor (int i = 0; i < lines.Count; i++) Console.WriteLine($"{lines[i][0]} {prices[i]:F2}");\nConsole.WriteLine($"total {prices.Sum():F2}");\nConsole.WriteLine($"slowest {(lines.Count == 0 ? 0 : lines.Max(p => int.Parse(p[1])))} ms");\n\nstatic async Task<decimal> PriceAsync(int ms, decimal price)\n{\n    await Task.Delay(ms);\n    return price;\n}' },
    "11.6-mirror": { lesson: "11.6", title: "The fastest mirror", tier: "stretch", minutes: 20, concepts: ["when-all"],
      statement: ["Each input line is a download: `FILE mirror:MS mirror:MS …` (the delays on a line differ by 80 ms or more). Read until the end.", "For each line start every mirror at once and use `Task.WhenAny` to print `FILE from MIRROR` for the first to answer. Then print `downloads N`."],
      starter: '',
      examples: [{ stdin: "song.mp3 eu:300 us:120 asia:220\nmap.png eu:50 us:200", out: "song.mp3 from us\nmap.png from eu\ndownloads 2" }],
      hidden: [{ stdin: "", out: "downloads 0" }, { stdin: "x local:90", out: "x from local\ndownloads 1" }],
      rules: [uses(/Task\.WhenAny/, "Pick the winner with Task.WhenAny.")],
      hints: ["static async Task<string> Mirror(string name, int ms) { await Task.Delay(ms); return name; }", "var tasks = parts.Skip(1).Select(m => { var kv = m.Split(':'); return Mirror(kv[0], int.Parse(kv[1])); }).ToArray();", "string winner = await await Task.WhenAny(tasks);"],
      answer: 'int n = 0;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var parts = line.Split(\' \');\n    var tasks = parts.Skip(1).Select(m => { var kv = m.Split(\':\'); return Mirror(kv[0], int.Parse(kv[1])); }).ToArray();\n    var first = await Task.WhenAny(tasks);\n    Console.WriteLine($"{parts[0]} from {await first}");\n    n++;\n}\nConsole.WriteLine($"downloads {n}");\n\nstatic async Task<string> Mirror(string name, int ms)\n{\n    await Task.Delay(ms);\n    return name;\n}' }
  } });

  /* ================================================================
     11.7 Cancellation
     ================================================================ */
  lesson("11.7", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A search is replaced by a newer one; a download hangs; the user presses Cancel; a request must give up after two seconds.",
        "Killing work from outside is dangerous — it could stop halfway through writing a file. .NET's way is **cooperative**: you hand the work a **CancellationToken**, and the work checks it and stops cleanly.",
        "A **CancellationTokenSource** owns the token: call `Cancel()`, or `CancelAfter(time)` for a timeout."
      ] },
      page("Core idea"),
      run("token", "a job checks its token; a timeout cancels it", 'using var cts = new CancellationTokenSource();\ncts.CancelAfter(300);\ntry\n{\n    await Job(cts.Token);\n}\ncatch (OperationCanceledException)\n{\n    Console.WriteLine("cancelled");\n}\n\nstatic async Task Job(CancellationToken token)\n{\n    for (int step = 1; step <= 5; step++)\n    {\n        await Task.Delay(200, token);\n        Console.WriteLine($"step {step} done");\n    }\n}'),
      { ul: [
        "`CancelAfter(300)` cancels the token 300 ms from now.",
        "`Task.Delay(200, token)` — like every Async method that takes a token — stops early and throws **OperationCanceledException** when the token is cancelled.",
        "Step 1 ends at 200 ms; step 2 would end at 400 ms, but the cancel at 300 ms interrupts it."
      ] },
      run("check", "CPU work checks the token itself", 'using var cts = new CancellationTokenSource();\nint done = 0;\ntry\n{\n    for (int i = 1; i <= 1000; i++)\n    {\n        cts.Token.ThrowIfCancellationRequested();\n        done = i;\n        if (i == 3) cts.Cancel();\n    }\n}\ncatch (OperationCanceledException) { Console.WriteLine($"stopped after {done} items"); }'),
      page("Rules"),
      { ul: [
        "Accept a `CancellationToken token` (often last, with `= default`) in every long or async method, and **pass it on** to every call that takes one.",
        "In loops of your own work, call `token.ThrowIfCancellationRequested()` (or check `token.IsCancellationRequested`) at safe points.",
        "Cancellation surfaces as `OperationCanceledException` (`TaskCanceledException` is a kind of it): catch the base type.",
        "Clean up in `finally` or `using` so cancelled work leaves nothing half-done.",
        "Dispose the `CancellationTokenSource` (`using`).",
        "`CancellationTokenSource.CreateLinkedTokenSource(a, b)` cancels when either does: a user's Cancel **or** a timeout."
      ] },
      page("Variations"),
      { h: "A timeout per request" },
      run("timeouts", "each request gets its own 250 ms deadline", 'foreach (var (name, ms) in new[] { ("fast", 80), ("slow", 500), ("ok", 150) })\n{\n    using var cts = new CancellationTokenSource(250);\n    try\n    {\n        await Task.Delay(ms, cts.Token);\n        Console.WriteLine($"{name}: done");\n    }\n    catch (OperationCanceledException) { Console.WriteLine($"{name}: timed out"); }\n}'),
      { h: "Either a user or a timeout" },
      run("linked", "a linked source cancels when any of its sources does", 'using var user = new CancellationTokenSource();\nusing var timeout = new CancellationTokenSource(1000);\nusing var both = CancellationTokenSource.CreateLinkedTokenSource(user.Token, timeout.Token);\nuser.CancelAfter(100);\ntry { await Task.Delay(800, both.Token); }\ncatch (OperationCanceledException)\n{\n    Console.WriteLine(user.IsCancellationRequested ? "the user cancelled" : "it timed out");\n}'),
      { h: "WaitAsync: a deadline on any task" },
      run("waitasync", "give up waiting without cancelling the task itself", 'var slow = Task.Delay(500).ContinueWith(_ => "slow answer");\ntry\n{\n    string s = await slow.WaitAsync(TimeSpan.FromMilliseconds(150));\n    Console.WriteLine(s);\n}\ncatch (TimeoutException) { Console.WriteLine("gave up after 150 ms"); }'),
      page("Pitfalls"),
      { h: "A number where a token goes — CS1503" },
      run("pit-type", "Task.Delay(ms, token): the second argument is a token", 'await Task.Delay(100, 250);'),
      { h: "Catching too narrow a type" },
      run("pit-catch", "ThrowIfCancellationRequested throws OperationCanceledException, not TaskCanceledException", 'using var cts = new CancellationTokenSource();\ncts.Cancel();\ntry { cts.Token.ThrowIfCancellationRequested(); }\ncatch (TaskCanceledException) { Console.WriteLine("caught"); }'),
      { h: "A token that is never passed on" },
      "A method that takes a token but calls `Task.Delay(1000)` without it cannot be cancelled during that second. Pass the token into every call that accepts one.",
      page("Connections"),
      { ul: [ "**Back:** 11.5 async methods; 6.x exceptions and finally.", "**Next:** 11.8 the other ways async goes wrong; 11.9 timeouts in a downloader.", "**Elsewhere:** T2 desktop apps cancel work when a window closes; T1 web servers cancel when the client leaves." ] },
      page("Good practice"),
      { ul: [ "Every async method that can take a while takes a CancellationToken.", "Catch OperationCanceledException where you started the work, and treat it as a normal outcome, not an error.", "Use `using` for the source and `finally` for cleanup." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Timeouts* and *Stop after enough*." ] },
      page("Quick reference"),
      run("qr", "cancel after a time", 'using var cts = new CancellationTokenSource(100);\ntry { await Task.Delay(400, cts.Token); Console.WriteLine("finished"); }\ncatch (OperationCanceledException) { Console.WriteLine("cancelled"); }'),
      { ul: [ "`new CancellationTokenSource(ms)` or `CancelAfter`; `Cancel()`.", "Pass `token` on; `ThrowIfCancellationRequested()` in loops.", "Catch `OperationCanceledException`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1503", "an int where a CancellationToken goes", "Pitfalls"], ["OperationCanceledException", "the work was cancelled", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'using var cts = new CancellationTokenSource(250);\nint steps = 0;\ntry { while (true) { await Task.Delay(100, cts.Token); steps++; } }\ncatch (OperationCanceledException) { }\nConsole.WriteLine(steps);', why: "Steps end at 100 and 200 ms; the third would end at 300, after the cancel at 250.", concepts: ["cancellation"] },
        { id: "p2", src: 'using var cts = new CancellationTokenSource();\nConsole.Write(cts.IsCancellationRequested + " ");\ncts.Cancel();\nConsole.WriteLine(cts.Token.IsCancellationRequested);', why: "The token reflects its source: False, then True.", concepts: ["cancellation"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the delay stops when the token is cancelled.", src: 'using var cts = new CancellationTokenSource(50);\ntry { await Task.Delay(1000, @@); Console.WriteLine("waited"); }\ncatch (OperationCanceledException) { Console.WriteLine("stopped"); }', out: "stopped", answer: "cts.Token", concepts: ["cancellation"] }
      ],
      bug: [
        { id: "b1", q: "The job should be cancellable: it should print stopped.", src: 'using var cts = new CancellationTokenSource(50);\ntry { await Job(cts.Token); Console.WriteLine("finished"); }\ncatch (OperationCanceledException) { Console.WriteLine("stopped"); }\n\nstatic async Task Job(CancellationToken token)\n{\n    await Task.Delay(300);\n}', out: "stopped", fixedText: "prints stopped", why: "The token is never passed on: await Task.Delay(300, token);", concepts: ["cancellation"] }
      ]
    },
    flashcards: [
      ["What is cooperative cancellation?", "The work receives a token and checks it, stopping cleanly when asked."],
      ["What owns a CancellationToken?", "A CancellationTokenSource (Cancel, CancelAfter)."],
      ["What does a cancelled await throw?", "OperationCanceledException (TaskCanceledException derives from it)."],
      ["How does a loop of CPU work notice cancellation?", "token.ThrowIfCancellationRequested() at safe points."],
      ["How do you cancel on a user's click OR a timeout?", "CancellationTokenSource.CreateLinkedTokenSource(a, b)."],
      ["What must a method do with the token it is given?", "Pass it on to every call that accepts one."]
    ],
    quiz: [
      { q: "`new CancellationTokenSource(200)` cancels…", opts: ["immediately", "after 200 ms", "after 200 steps", "never"], ans: 1, why: "The constructor's argument is a delay." },
      { q: "Which exception should you catch for any cancellation?", opts: ["TaskCanceledException", "OperationCanceledException", "TimeoutException", "Exception"], ans: 1, why: "It covers every kind of cancellation." },
      { q: "Task.Delay(1000) with no token, after Cancel()…", opts: ["stops at once", "still waits the full second", "throws", "returns false"], ans: 1, why: "It was never told about the token." }
    ]
  });
  K.add({ tasks: {
    "11.7-timeouts": { lesson: "11.7", title: "Timeouts", tier: "core", minutes: 20, concepts: ["cancellation"],
      statement: ["The first line is a time limit L in ms; then jobs `NAME MS` until the end (MS differs from L by 100 or more).", "Run each job in turn with its own `CancellationTokenSource(L)` and `Task.Delay(MS, token)`. Print `NAME: done` or `NAME: timed out`, then `done D, timed out T`."],
      starter: 'int limit = int.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "250\nfast 80\nslow 500\nok 150", out: "fast: done\nslow: timed out\nok: done\ndone 2, timed out 1" }],
      hidden: [{ stdin: "100", out: "done 0, timed out 0" }, { stdin: "120\na 400\nb 20", out: "a: timed out\nb: done\ndone 1, timed out 1" }],
      rules: [uses(/new\s+CancellationTokenSource/, "Give each job a CancellationTokenSource."), uses(/catch\s*\(\s*OperationCanceledException/, "Catch OperationCanceledException.", "catch"), uses(/Task\.Delay\s*\([^;]*\.Token\s*\)/, "Pass the token to Task.Delay.", "pass")],
      hints: ["using var cts = new CancellationTokenSource(limit);", "try { await Task.Delay(ms, cts.Token); …done } catch (OperationCanceledException) { …timed out }", "Count both outcomes."],
      answer: 'int limit = int.Parse(Console.ReadLine() ?? "0");\nint done = 0, timedOut = 0;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var p = line.Split(\' \');\n    using var cts = new CancellationTokenSource(limit);\n    try\n    {\n        await Task.Delay(int.Parse(p[1]), cts.Token);\n        Console.WriteLine($"{p[0]}: done");\n        done++;\n    }\n    catch (OperationCanceledException)\n    {\n        Console.WriteLine($"{p[0]}: timed out");\n        timedOut++;\n    }\n}\nConsole.WriteLine($"done {done}, timed out {timedOut}");' },
    "11.7-enough": { lesson: "11.7", title: "Stop after enough", tier: "stretch", minutes: 25, concepts: ["cancellation", "async-await"],
      statement: ["The first line is K; the second, whole numbers. Write `static async IAsyncEnumerable<int> EvensAsync(int[] xs, [EnumeratorCancellation] CancellationToken token = default)` that, for each number, awaits `Task.Delay(10, token)` and yields it if it is even.", "Consume it with `await foreach (… .WithCancellation(cts.Token))`; after K evens call `cts.Cancel()`. Print each even as it arrives, then `stopped after K` — or `ran out after N` if fewer than K arrived."],
      starter: 'using System.Runtime.CompilerServices;\nint k = int.Parse(Console.ReadLine() ?? "0");\nint[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n',
      examples: [{ stdin: "2\n1 4 6 8 9 10", out: "4\n6\nstopped after 2" }],
      hidden: [{ stdin: "5\n2 3 4", out: "2\n4\nran out after 2" }, { stdin: "1\n7 8", out: "8\nstopped after 1" }],
      rules: [uses(/IAsyncEnumerable<\s*int\s*>/, "Produce them with an IAsyncEnumerable<int>."), uses(/\[EnumeratorCancellation\]/, "Mark the token [EnumeratorCancellation].", "attr"), uses(/\.Cancel\s*\(\s*\)/, "Stop with cts.Cancel().", "cancel")],
      hints: ["static async IAsyncEnumerable<int> EvensAsync(int[] xs, [EnumeratorCancellation] CancellationToken token = default) { foreach (int x in xs) { await Task.Delay(10, token); if (x % 2 == 0) yield return x; } }", "try { await foreach (int e in EvensAsync(xs).WithCancellation(cts.Token)) { Console.WriteLine(e); if (++got == k) cts.Cancel(); } } catch (OperationCanceledException) { }", "After the loop: got == k ? stopped : ran out."],
      answer: 'using System.Runtime.CompilerServices;\nint k = int.Parse(Console.ReadLine() ?? "0");\nint[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\nusing var cts = new CancellationTokenSource();\nint got = 0;\ntry\n{\n    await foreach (int e in EvensAsync(xs).WithCancellation(cts.Token))\n    {\n        Console.WriteLine(e);\n        if (++got == k) cts.Cancel();\n    }\n}\ncatch (OperationCanceledException) { }\nConsole.WriteLine(got == k ? $"stopped after {k}" : $"ran out after {got}");\n\nstatic async IAsyncEnumerable<int> EvensAsync(int[] xs, [EnumeratorCancellation] CancellationToken token = default)\n{\n    foreach (int x in xs)\n    {\n        await Task.Delay(10, token);\n        if (x % 2 == 0) yield return x;\n    }\n}' }
  } });

  /* ================================================================
     11.8 Async pitfalls
     ================================================================ */
  lesson("11.8", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Async code that compiles can still be wrong in ways normal code cannot: it finishes too early, loses its exceptions, or freezes for ever.",
        "Most of these bugs come from four habits: **async void**, a **forgotten await** (fire and forget), **blocking** on a task (`.Result`, `.Wait()`), and **awaiting one at a time** what could run together.",
        "Each has a recognisable shape. Learn the shapes and the compiler's warnings, and they stop happening."
      ] },
      page("Core idea"),
      run("forgot", "a call without await runs on — the next line does not wait for it", 'Console.WriteLine("saving…");\nvar save = SaveAsync();\nConsole.WriteLine("told the user it is saved (it is not yet)");\nawait save;\nConsole.WriteLine("now it really is");\n\nstatic async Task SaveAsync()\n{\n    await Task.Delay(100);\n    Console.WriteLine("  file written");\n}'),
      { ul: [
        "Calling an async method **starts** it and returns a Task at its first real wait.",
        "Code after the call runs **before** the work finishes. Only `await` makes the next line wait.",
        "Not awaiting at all — `SaveAsync();` on its own — is **fire and forget**: warning CS4014, and any exception it throws is lost."
      ] },
      run("lost", "an exception in a task nobody awaits disappears silently", '_ = FailAsync();\nawait Task.Delay(100);\nConsole.WriteLine("the program carried on; nobody saw the error");\nvar t = FailAsync();\ntry { await t; }\ncatch (InvalidOperationException e) { Console.WriteLine($"awaited: {e.Message}"); }\n\nstatic async Task FailAsync()\n{\n    await Task.Delay(10);\n    throw new InvalidOperationException("disk full");\n}'),
      page("Rules"),
      { table: { head: ["Shape", "What goes wrong", "Instead"], rows: [
        ["`async void M()`", "cannot be awaited; its exceptions crash the process or vanish", "`async Task M()` (void only for event handlers)"],
        ["`M();` (no await)", "runs on unobserved; errors lost; CS4014", "`await M();`"],
        ["`M().Result`, `M().Wait()`", "blocks the thread; in a UI it can deadlock for ever", "`await M()` — async all the way"],
        ["`foreach … await M(x)`", "one at a time when they could overlap", "start all, `await Task.WhenAll` (11.6)"],
        ["`list.ForEach(async x => …)`", "ForEach takes an Action: an async void lambda nobody waits for", "`await Task.WhenAll(list.Select(…))`"]
      ] } },
      { ul: [
        "The **deadlock**: a UI thread calls `.Result` and blocks; the task needs that same thread to finish; neither moves. (Library code adds `.ConfigureAwait(false)` so its continuations do not need the caller's thread.)",
        "This runtime runs inside a browser tab, where a thread may not block at all: `.Result` on an unfinished task throws `PlatformNotSupportedException` here. On a desktop it would block — or deadlock.",
        "Treat CS4014 (\"call is not awaited\") as an error."
      ] },
      page("Variations"),
      { h: "The async lambda in ForEach" },
      run("foreach", "ForEach returns at once: the async lambdas finish later, unwatched", 'var names = new List<string> { "a", "b" };\nnames.ForEach(async n => { await Task.Delay(n == "a" ? 150 : 60); Console.WriteLine($"  {n} done"); });\nConsole.WriteLine("ForEach has returned");\nawait Task.Delay(300);\nawait Task.WhenAll(names.Select(async n => { await Task.Delay(30); Console.WriteLine($"  {n} done properly"); }));\nConsole.WriteLine("WhenAll has returned, after both");'),
      { h: "Await in a loop, or together" },
      run("together", "the same three waits: one after another, then all at once", 'var order = new List<string>();\nforeach (var (n, ms) in new[] { ("x", 200), ("y", 60) }) { await Task.Delay(ms); order.Add(n); }\nConsole.WriteLine("in a loop:  " + string.Join(" ", order));\norder.Clear();\nawait Task.WhenAll(new[] { ("x", 200), ("y", 60) }.Select(async j => { await Task.Delay(j.Item2); lock (order) order.Add(j.Item1); }));\nConsole.WriteLine("together:   " + string.Join(" ", order));'),
      { h: "Event handlers are the exception" },
      run("handler", "an async void handler must catch its own errors", 'var button = new Button();\nbutton.Clicked += async () =>\n{\n    try { await Task.Delay(20); throw new InvalidOperationException("save failed"); }\n    catch (Exception e) { Console.WriteLine($"handled inside the handler: {e.Message}"); }\n};\nbutton.Click();\nawait Task.Delay(100);\n\nclass Button\n{\n    public event Action? Clicked;\n    public void Click() => Clicked?.Invoke();\n}'),
      page("Pitfalls"),
      { h: "Awaiting an async void method — CS4008" },
      run("pit-void", "there is no Task to await", 'await Save();\n\nstatic async void Save() { await Task.Delay(10); }'),
      { h: "Blocking with .Result" },
      "`int n = CountAsync().Result;` waits by blocking. In a desktop app's click handler it can hang the window for ever. Here it is refused outright. There is no situation in this course where `.Result` is the answer — use `await`.",
      { h: "Returning before the work is done" },
      run("pit-early", "a non-async method that starts work and returns cannot promise it finished", 'var list = new List<int>();\nStart(list);\nConsole.WriteLine($"items right after: {list.Count}");\nawait Task.Delay(100);\nConsole.WriteLine($"items later: {list.Count}");\n\nstatic void Start(List<int> list) => _ = Fill(list);\nstatic async Task Fill(List<int> list) { await Task.Delay(30); list.Add(1); }'),
      page("Connections"),
      { ul: [ "**Back:** 11.4–11.7; 9.7 events (the one place async void belongs); 9.3 Action and Func.", "**Next:** 11.9 puts the right shapes together; D2 threads and synchronisation contexts.", "**Elsewhere:** T2 desktop apps are where the .Result deadlock bites." ] },
      page("Good practice"),
      { ul: [ "async Task, never async void (except event handlers, which catch their own errors).", "Await every task you start, or hand it to something that will.", "Never block on async code; let async flow up to the top." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Save them all* and *Report every failure*." ] },
      page("Quick reference"),
      run("qr", "the right shape", 'await Task.WhenAll(new[] { 1, 2, 3 }.Select(DoAsync));\nConsole.WriteLine("all done");\n\nstatic async Task DoAsync(int x) { await Task.Delay(10 * x); Console.WriteLine($"  {x}"); }'),
      { ul: [ "async Task, awaited.", "No .Result, no .Wait(), no async void (except handlers).", "Start together, await together." ] },
      { table: { head: ["Code", "Means", "Page"], rows: [["CS4008", "cannot await void", "Pitfalls"], ["CS4014 (warning)", "a call that is not awaited", "Core idea"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var t = Work();\nConsole.Write("A ");\nawait t;\nConsole.WriteLine("C");\n\nstatic async Task Work() { await Task.Delay(50); Console.Write("B "); }', why: "Work returns at its first wait; A prints, then B when the delay ends, then C after the await.", concepts: ["async-pitfalls"] },
        { id: "p2", src: 'int n = 0;\nnew List<int> { 1, 2, 3 }.ForEach(async x => { await Task.Delay(50); n += x; });\nConsole.Write(n + " ");\nawait Task.Delay(200);\nConsole.WriteLine(n);', why: "ForEach does not wait for the async lambdas: 0 at once, 6 once they have all run.", concepts: ["async-pitfalls"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the return type that can be awaited.", src: 'await Save();\nConsole.WriteLine("saved");\n\nstatic async @@ Save() { await Task.Delay(10); }', out: "saved", answer: "Task", concepts: ["async-pitfalls"] }
      ],
      bug: [
        { id: "b1", q: "It should report the error: caught disk full.", src: 'try { _ = Fail(); }\ncatch (Exception e) { Console.WriteLine("caught " + e.Message); }\nawait Task.Delay(50);\nConsole.WriteLine("carried on");\n\nstatic async Task Fail() { await Task.Delay(10); throw new Exception("disk full"); }', out: "caught disk full\ncarried on", fixedText: "prints caught disk full, then carried on", why: "Without await the exception lands in the Task, never in the catch: try { await Fail(); }.", concepts: ["async-pitfalls"] }
      ]
    },
    flashcards: [
      ["Why avoid async void?", "It cannot be awaited and its exceptions are not observed by the caller."],
      ["Where is async void acceptable?", "Event handlers — which must catch their own exceptions."],
      ["What is fire and forget?", "Calling an async method without awaiting it; errors are lost (warning CS4014)."],
      ["Why never .Result or .Wait()?", "They block the thread and can deadlock a UI; await instead."],
      ["What is wrong with list.ForEach(async x => …)?", "ForEach takes an Action: the async lambdas are async void and nobody waits for them."],
      ["What does CS4008 mean?", "You tried to await a method that returns void."]
    ],
    quiz: [
      { q: "`SaveAsync();` with no await…", opts: ["waits for the save", "starts it and moves on; errors are lost", "is a compile error", "runs it twice"], ans: 1, why: "Fire and forget (CS4014)." },
      { q: "A UI click handler calls `GetAsync().Result`. A likely result:", opts: ["faster code", "a frozen window (deadlock)", "an empty string", "nothing changes"], ans: 1, why: "The UI thread blocks waiting for work that needs the UI thread." },
      { q: "The right way to run an async method for each item and wait for all:", opts: ["list.ForEach(async …)", "await Task.WhenAll(list.Select(…))", "foreach with .Wait()", "Parallel.ForEach"], ans: 1, why: "Every task is started and awaited." }
    ]
  });
  K.add({ tasks: {
    "11.8-save": { lesson: "11.8", title: "Save them all", tier: "core", minutes: 20, concepts: ["async-pitfalls", "when-all"],
      statement: ["Read files to save as `NAME MS` until the end (MS differ by 80 or more). Print `saving N files`, then save them all at once with `static async Task SaveAsync(string name, int ms)` (await the delay, then print `saved NAME`), and only when every save has finished print `all saved`.", "No `async void`, no `.Result`/`.Wait()`, no `ForEach`."],
      starter: 'var files = new List<(string Name, int Ms)>();\n',
      examples: [{ stdin: "a.txt 200\nb.txt 60\nc.txt 120", out: "saving 3 files\nsaved b.txt\nsaved c.txt\nsaved a.txt\nall saved" }],
      hidden: [{ stdin: "", out: "saving 0 files\nall saved" }, { stdin: "x 30", out: "saving 1 files\nsaved x\nall saved" }],
      rules: [uses(/Task\.WhenAll/, "Await every save with Task.WhenAll."), noUse(/async\s+void|\.Result\b|\.Wait\s*\(|\.ForEach\s*\(/, "No async void, .Result, .Wait() or ForEach.", "shapes")],
      hints: ["static async Task SaveAsync(string name, int ms) { await Task.Delay(ms); Console.WriteLine($\"saved {name}\"); }", "await Task.WhenAll(files.Select(f => SaveAsync(f.Name, f.Ms)));", "Print \"all saved\" after the await."],
      answer: 'var files = new List<(string Name, int Ms)>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var p = line.Split(\' \');\n    files.Add((p[0], int.Parse(p[1])));\n}\nConsole.WriteLine($"saving {files.Count} files");\nawait Task.WhenAll(files.Select(f => SaveAsync(f.Name, f.Ms)));\nConsole.WriteLine("all saved");\n\nstatic async Task SaveAsync(string name, int ms)\n{\n    await Task.Delay(ms);\n    Console.WriteLine($"saved {name}");\n}' },
    "11.8-failures": { lesson: "11.8", title: "Report every failure", tier: "core", minutes: 20, concepts: ["async-pitfalls", "when-all"],
      statement: ["Read jobs `NAME MS ok` or `NAME MS fail` until the end. Start all of them (`static async Task<string> RunAsync(…)` awaits the delay, then returns NAME or throws `InvalidOperationException(\"NAME failed\")`).", "Await `Task.WhenAll` inside a try; print `first error: MESSAGE` if it threw. Then, for every job in input order, print `NAME ok` or `NAME: MESSAGE` from that task's own exception, and finally `ok A, failed F`."],
      starter: 'var jobs = new List<string[]>();\n',
      examples: [{ stdin: "a 50 ok\nb 100 fail\nc 150 fail", out: "first error: b failed\na ok\nb: b failed\nc: c failed\nok 1, failed 2" }],
      hidden: [{ stdin: "x 20 ok", out: "x ok\nok 1, failed 0" }, { stdin: "p 200 fail\nq 50 ok", out: "first error: p failed\np: p failed\nq ok\nok 1, failed 1" }],
      rules: [uses(/Task\.WhenAll/, "Await them with Task.WhenAll."), uses(/\.IsFaulted|\.Status|\.Exception/, "Inspect each task's own outcome.", "inspect")],
      hints: ["var tasks = jobs.Select(j => RunAsync(j[0], int.Parse(j[1]), j[2] == \"fail\")).ToArray();", "try { await Task.WhenAll(tasks); } catch (Exception e) { Console.WriteLine($\"first error: {e.Message}\"); }", "tasks[i].IsFaulted ? tasks[i].Exception!.InnerException!.Message : …"],
      answer: 'var jobs = new List<string[]>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "") jobs.Add(line.Split(\' \'));\nvar tasks = jobs.Select(j => RunAsync(j[0], int.Parse(j[1]), j[2] == "fail")).ToArray();\ntry { await Task.WhenAll(tasks); }\ncatch (Exception e) { Console.WriteLine($"first error: {e.Message}"); }\nint ok = 0, failed = 0;\nfor (int i = 0; i < tasks.Length; i++)\n{\n    if (tasks[i].IsFaulted) { Console.WriteLine($"{jobs[i][0]}: {tasks[i].Exception!.InnerException!.Message}"); failed++; }\n    else { Console.WriteLine($"{tasks[i].Result} ok"); ok++; }\n}\nConsole.WriteLine($"ok {ok}, failed {failed}");\n\nstatic async Task<string> RunAsync(string name, int ms, bool fail)\n{\n    await Task.Delay(ms);\n    if (fail) throw new InvalidOperationException($"{name} failed");\n    return name;\n}' }
  } });

  /* ================================================================
     11.9 Practise: an async downloader
     ================================================================ */
  lesson("11.9", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A downloader fetches a list of addresses. A good one runs them **concurrently**, but **politely** (a few at a time), gives up on a slow server (**timeout**), tries again after a hiccup (**retry**), and reports every result in order.",
        "This lesson builds one against a **fake server** behind an interface — the network is sealed in this sandbox, and a fake makes every run repeatable. In Rider the same code takes a real `HttpClient` behind the same interface.",
        "Built in five steps, each a listing you can run."
      ] },
      page("Core idea"),
      { h: "Step 1 · the server behind an interface" },
      run("server", "IServer: the downloader never knows whether it is real", 'IServer server = new FakeServer(new()\n{\n    ["/home"] = (100, "<h1>Home</h1>"),\n    ["/news"] = (200, "<p>News</p>")\n});\nConsole.WriteLine(await server.GetAsync("/home", default));\ntry { await server.GetAsync("/nope", default); }\ncatch (HttpRequestException e) { Console.WriteLine(e.Message); }\n\ninterface IServer { Task<string> GetAsync(string path, CancellationToken token); }\n\nclass FakeServer : IServer\n{\n    private readonly Dictionary<string, (int Ms, string Body)> pages;\n    public FakeServer(Dictionary<string, (int, string)> pages) => this.pages = pages;\n    public async Task<string> GetAsync(string path, CancellationToken token)\n    {\n        if (!pages.TryGetValue(path, out var p)) { await Task.Delay(20, token); throw new HttpRequestException($"404 {path}"); }\n        await Task.Delay(p.Ms, token);\n        return p.Body;\n    }\n}'),
      { h: "Step 2 · all at once, results in order" },
      run("all", "WhenAll keeps the order of the addresses", 'IServer server = new FakeServer(new() { ["/a"] = (300, "aaaa"), ["/b"] = (100, "bb"), ["/c"] = (200, "ccc") });\nstring[] paths = { "/a", "/b", "/c" };\nstring[] bodies = await Task.WhenAll(paths.Select(p => server.GetAsync(p, default)));\nfor (int i = 0; i < paths.Length; i++) Console.WriteLine($"{paths[i]}: {bodies[i].Length} bytes");\n\ninterface IServer { Task<string> GetAsync(string path, CancellationToken token); }\nclass FakeServer : IServer\n{\n    private readonly Dictionary<string, (int Ms, string Body)> pages;\n    public FakeServer(Dictionary<string, (int, string)> pages) => this.pages = pages;\n    public async Task<string> GetAsync(string path, CancellationToken token)\n    {\n        var p = pages[path];\n        await Task.Delay(p.Ms, token);\n        return p.Body;\n    }\n}'),
      page("Rules"),
      { ul: [
        "**Depend on an interface** (8.4, 8.12): the downloader is tested with a fake and shipped with the real thing.",
        "**Never let one failure sink the batch**: each download catches its own exception and returns a result describing it.",
        "**Limit concurrency** with a SemaphoreSlim; **time out** each request with its own CancellationTokenSource; **retry** transient failures a few times with a growing pause (backoff).",
        "**Report in input order**: WhenAll's results line up with the inputs.",
        "With a real network: one shared `HttpClient` for the whole program, `GetStringAsync(url, token)`."
      ] },
      { table: { head: ["Concern", "Tool", "Lesson"], rows: [["at once", "Task.WhenAll", "11.6"], ["politely", "SemaphoreSlim", "11.6"], ["slow servers", "CancellationTokenSource(ms)", "11.7"], ["errors", "a result per download, not an exception", "11.8"], ["hiccups", "retry with backoff", "this lesson"]] } },
      page("Variations"),
      { h: "Step 3 · a result per download, with a timeout" },
      run("timeout", "each download returns a record describing what happened", 'IServer server = new FakeServer(new() { ["/fast"] = (80, "ok!"), ["/slow"] = (600, "late") });\nvar results = await Task.WhenAll(new[] { "/fast", "/slow", "/gone" }.Select(p => Fetch(server, p, 250)));\nforeach (var r in results) Console.WriteLine(r);\n\nstatic async Task<Result> Fetch(IServer server, string path, int timeoutMs)\n{\n    using var cts = new CancellationTokenSource(timeoutMs);\n    try { return new Result(path, "ok", (await server.GetAsync(path, cts.Token)).Length); }\n    catch (OperationCanceledException) { return new Result(path, "timed out", 0); }\n    catch (HttpRequestException e) { return new Result(path, e.Message, 0); }\n}\n\nrecord Result(string Path, string Outcome, int Bytes);\ninterface IServer { Task<string> GetAsync(string path, CancellationToken token); }\nclass FakeServer : IServer\n{\n    private readonly Dictionary<string, (int Ms, string Body)> pages;\n    public FakeServer(Dictionary<string, (int, string)> pages) => this.pages = pages;\n    public async Task<string> GetAsync(string path, CancellationToken token)\n    {\n        if (!pages.TryGetValue(path, out var p)) { await Task.Delay(20, token); throw new HttpRequestException("404"); }\n        await Task.Delay(p.Ms, token);\n        return p.Body;\n    }\n}'),
      { h: "Step 4 · two at a time" },
      run("limit", "a SemaphoreSlim keeps at most two requests open", 'var gate = new SemaphoreSlim(2);\nint open = 0, most = 0;\nawait Task.WhenAll(Enumerable.Range(1, 6).Select(async i =>\n{\n    await gate.WaitAsync();\n    try\n    {\n        most = Math.Max(most, ++open);\n        await Task.Delay(40);\n        open--;\n    }\n    finally { gate.Release(); }\n}));\nConsole.WriteLine($"6 downloads, at most {most} open at once");'),
      { h: "Step 5 · retry with backoff" },
      run("retry", "a server that fails twice, then works", 'int calls = 0;\nasync Task<string> Flaky()\n{\n    await Task.Delay(10);\n    if (++calls < 3) throw new HttpRequestException("503 busy");\n    return "data";\n}\nfor (int attempt = 1; attempt <= 4; attempt++)\n{\n    try\n    {\n        string s = await Flaky();\n        Console.WriteLine($"got {s} on attempt {attempt}");\n        break;\n    }\n    catch (HttpRequestException e)\n    {\n        Console.WriteLine($"attempt {attempt}: {e.Message}; waiting {attempt * 20} ms");\n        await Task.Delay(attempt * 20);\n    }\n}'),
      page("Pitfalls"),
      { h: "A fake that does not keep the contract — CS0535" },
      run("pit-contract", "GetAsync must take the token too", 'IServer s = new Fake();\n\ninterface IServer { Task<string> GetAsync(string path, CancellationToken token); }\nclass Fake : IServer { public Task<string> GetAsync(string path) => Task.FromResult(""); }'),
      { h: "Retrying what will never work" },
      "A 404 (not found) or 401 (not allowed) will fail every time; retrying only adds load. Retry only transient failures — timeouts, 503 \"busy\" — and only a few times.",
      { h: "A new HttpClient per request" },
      "Creating and disposing an HttpClient for every download can run the machine out of network sockets. Make one and share it (or use IHttpClientFactory in a host).",
      page("Connections"),
      { ul: [ "**Back:** the whole unit; 8.4 and 8.12 interfaces and composition; 8.7 records for results.", "**Next:** 10.5 the fake server is a test double; T1 real HTTP and REST; capstone 4 is a service built this way and tested.", "**Your own app:** KurenaiOS's sync code limits, times out and retries just like this." ] },
      page("Good practice"),
      { ul: [ "One record per outcome; never let one exception end the batch.", "Small, fixed concurrency; a timeout on every request; a few retries with backoff for transient errors only.", "Report in input order so output is predictable." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *The downloader* and *Try again*." ] },
      page("Quick reference"),
      run("qr", "fetch with a timeout, as a result", 'async Task<string> Get(int ms, CancellationToken t) { await Task.Delay(ms, t); return "body"; }\nusing var cts = new CancellationTokenSource(100);\nstring r;\ntry { r = await Get(300, cts.Token); } catch (OperationCanceledException) { r = "timed out"; }\nConsole.WriteLine(r);'),
      { ul: [ "Interface + fake; WhenAll in order.", "SemaphoreSlim, CancellationTokenSource per request, retry transient errors.", "A result record per download." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0535", "the fake does not implement the interface", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int tries = 0;\nstring result = "gave up";\nfor (int a = 1; a <= 3; a++)\n{\n    tries++;\n    await Task.Delay(5);\n    if (a == 2) { result = "ok"; break; }\n}\nConsole.WriteLine($"{result} after {tries}");', why: "The second attempt succeeds and breaks the loop.", concepts: ["async-practice"] },
        { id: "p2", src: 'var gate = new SemaphoreSlim(1);\nvar log = new List<string>();\nawait Task.WhenAll(new[] { ("a", 60), ("b", 10) }.Select(async j =>\n{\n    await gate.WaitAsync();\n    try { await Task.Delay(j.Item2); log.Add(j.Item1); } finally { gate.Release(); }\n}));\nConsole.WriteLine(string.Join(" ", log));', why: "One slot: a takes it first and finishes before b may start, despite b being quicker.", concepts: ["async-practice"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so at most two downloads hold the gate at once.", src: 'var gate = new SemaphoreSlim(@@);\nint open = 0, most = 0;\nawait Task.WhenAll(Enumerable.Range(0, 5).Select(async _ => { await gate.WaitAsync(); try { most = Math.Max(most, ++open); await Task.Delay(20); open--; } finally { gate.Release(); } }));\nConsole.WriteLine(most);', out: "2", answer: "2", concepts: ["async-practice"] }
      ],
      bug: [
        { id: "b1", q: "One failure should not stop the report: it should print ok then failed.", src: 'var paths = new[] { "/ok", "/bad" };\nvar results = await Task.WhenAll(paths.Select(Get));\nforeach (var r in results) Console.WriteLine(r);\n\nstatic async Task<string> Get(string p)\n{\n    await Task.Delay(10);\n    if (p == "/bad") throw new HttpRequestException("500");\n    return "ok";\n}', out: "ok\nfailed", fixedText: "prints ok then failed", why: "Catch inside Get and return a result describing the failure (\"failed\"), so WhenAll never throws.", concepts: ["async-practice"] }
      ]
    },
    flashcards: [
      ["Why put the server behind an interface?", "So the downloader can be run against a fake (tests, offline) and a real HttpClient alike."],
      ["How do you stop one failure ending the batch?", "Each download catches its own exception and returns a result record."],
      ["What limits concurrency?", "A SemaphoreSlim: WaitAsync before, Release in finally."],
      ["What is backoff?", "Waiting longer before each retry."],
      ["Which failures are worth retrying?", "Transient ones: timeouts, 503 busy — not 404 or 401."],
      ["How many HttpClients should a program make?", "One, shared."]
    ],
    quiz: [
      { q: "Retrying a 404 Not Found…", opts: ["usually helps", "will fail every time", "is required", "turns it into a 200"], ans: 1, why: "It is not transient." },
      { q: "SemaphoreSlim(3) with ten downloads: at most how many run at once?", opts: ["10", "3", "1", "7"], ans: 1, why: "Three slots." },
      { q: "Results from WhenAll(paths.Select(Fetch)) are in…", opts: ["finishing order", "the order of paths", "random order", "alphabetical order"], ans: 1, why: "WhenAll keeps the order of the tasks." }
    ]
  });
  K.add({ tasks: {
    "11.9-download": { lesson: "11.9", title: "The downloader", tier: "core", minutes: 35, concepts: ["async-practice", "when-all", "cancellation"],
      statement: ["The first line is `LIMIT TIMEOUT` (at most LIMIT downloads at once; each request times out TIMEOUT ms after it starts). Then pages `PATH MS BODY` until the end; a BODY starting with `!` means the server answers with that error instead (after MS).", "Download every page through an `IServer` fake, concurrently but limited, each with its own timeout (MS differs from TIMEOUT by 100 or more). Print, in input order, `PATH: N bytes`, `PATH: error MESSAGE` or `PATH: timed out`, then `ok O, errors E, timed out T`."],
      starter: 'string[] first = (Console.ReadLine() ?? "").Split(\' \');\nint limit = int.Parse(first[0]), timeout = int.Parse(first[1]);\n\ninterface IServer { Task<string> GetAsync(string path, CancellationToken token); }',
      examples: [{ stdin: "2 250\n/home 100 <h1>Home</h1>\n/slow 500 zzz\n/broken 50 !500 busy\n/news 120 <p>News</p>", out: "/home: 13 bytes\n/slow: timed out\n/broken: error 500 busy\n/news: 11 bytes\nok 2, errors 1, timed out 1" }],
      hidden: [{ stdin: "1 300", out: "ok 0, errors 0, timed out 0" }, { stdin: "3 150\n/a 20 a\n/b 30 !404", out: "/a: 1 bytes\n/b: error 404\nok 1, errors 1, timed out 0" }],
      rules: [uses(/interface\s+IServer/, "Download through the IServer interface."), uses(/SemaphoreSlim/, "Limit with a SemaphoreSlim.", "limit"), uses(/new\s+CancellationTokenSource/, "Give each request its own CancellationTokenSource.", "cts"), uses(/Task\.WhenAll/, "Run them with Task.WhenAll.", "all")],
      hints: ["class FakeServer : IServer { … GetAsync: await Task.Delay(ms, token); if (body.StartsWith('!')) throw new HttpRequestException(body[1..]); return body; }", "async Task<string> Fetch(string path) { await gate.WaitAsync(); try { using var cts = new CancellationTokenSource(timeout); … } finally { gate.Release(); } }", "Return the line to print from Fetch; catch OperationCanceledException and HttpRequestException there."],
      answer: 'string[] first = (Console.ReadLine() ?? "").Split(\' \');\nint limit = int.Parse(first[0]), timeout = int.Parse(first[1]);\nvar pages = new List<(string Path, int Ms, string Body)>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var p = line.Split(\' \', 3);\n    pages.Add((p[0], int.Parse(p[1]), p[2]));\n}\nIServer server = new FakeServer(pages.ToDictionary(p => p.Path, p => (p.Ms, p.Body)));\nvar gate = new SemaphoreSlim(limit);\nvar results = await Task.WhenAll(pages.Select(p => Fetch(p.Path)));\nforeach (var r in results) Console.WriteLine(r.Text);\nConsole.WriteLine($"ok {results.Count(r => r.Kind == 0)}, errors {results.Count(r => r.Kind == 1)}, timed out {results.Count(r => r.Kind == 2)}");\n\nasync Task<(string Text, int Kind)> Fetch(string path)\n{\n    await gate.WaitAsync();\n    try\n    {\n        using var cts = new CancellationTokenSource(timeout);\n        string body = await server.GetAsync(path, cts.Token);\n        return ($"{path}: {body.Length} bytes", 0);\n    }\n    catch (HttpRequestException e) { return ($"{path}: error {e.Message}", 1); }\n    catch (OperationCanceledException) { return ($"{path}: timed out", 2); }\n    finally { gate.Release(); }\n}\n\ninterface IServer { Task<string> GetAsync(string path, CancellationToken token); }\n\nclass FakeServer : IServer\n{\n    private readonly Dictionary<string, (int Ms, string Body)> pages;\n    public FakeServer(Dictionary<string, (int Ms, string Body)> pages) => this.pages = pages;\n    public async Task<string> GetAsync(string path, CancellationToken token)\n    {\n        var (ms, body) = pages[path];\n        await Task.Delay(ms, token);\n        if (body.StartsWith(\'!\')) throw new HttpRequestException(body[1..]);\n        return body;\n    }\n}' },
    "11.9-retry": { lesson: "11.9", title: "Try again", tier: "stretch", minutes: 25, concepts: ["async-practice"],
      statement: ["Read pages `PATH K` until the end: the fake server fails the first K requests for PATH with `HttpRequestException(\"503 busy\")` (after a 10 ms delay) and then answers `ok`. K may be `never`, meaning a 404 every time.", "Fetch each page in turn with up to 3 attempts and a backoff of 20 × attempt ms between them, retrying only `503` errors. Print `PATH: ok after A attempt(s)`, `PATH: gave up after 3 attempts` or `PATH: not found` (a 404 is not retried)."],
      starter: 'var failsLeft = new Dictionary<string, int>();\n',
      examples: [{ stdin: "/a 0\n/b 2\n/c 5\n/d never", out: "/a: ok after 1 attempt(s)\n/b: ok after 3 attempt(s)\n/c: gave up after 3 attempts\n/d: not found" }],
      hidden: [{ stdin: "/x 1", out: "/x: ok after 2 attempt(s)" }, { stdin: "", out: "" }],
      rules: [uses(/catch\s*\(\s*HttpRequestException/, "Catch HttpRequestException."), uses(/Task\.Delay\s*\([^)]*\*/, "Back off: wait longer each attempt.", "backoff")],
      hints: ["async Task<string> Get(string path) { await Task.Delay(10); if (k == never) throw new HttpRequestException(\"404\"); if (failsLeft[path]-- > 0) throw new HttpRequestException(\"503 busy\"); return \"ok\"; }", "for (int a = 1; a <= 3; a++) { try { await Get(path); …ok; break; } catch (HttpRequestException e) when (e.Message.StartsWith(\"503\")) { if (a == 3) …gave up; else await Task.Delay(20 * a); } catch (HttpRequestException) { …not found; break; } }", "Use int.MaxValue or -1 for never."],
      answer: 'var failsLeft = new Dictionary<string, int>();\nvar order = new List<string>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var p = line.Split(\' \');\n    failsLeft[p[0]] = p[1] == "never" ? -1 : int.Parse(p[1]);\n    order.Add(p[0]);\n}\nforeach (var path in order)\n{\n    for (int a = 1; a <= 3; a++)\n    {\n        try\n        {\n            await Get(path);\n            Console.WriteLine($"{path}: ok after {a} attempt(s)");\n            break;\n        }\n        catch (HttpRequestException e) when (e.Message.StartsWith("503"))\n        {\n            if (a == 3) Console.WriteLine($"{path}: gave up after 3 attempts");\n            else await Task.Delay(20 * a);\n        }\n        catch (HttpRequestException)\n        {\n            Console.WriteLine($"{path}: not found");\n            break;\n        }\n    }\n}\n\nasync Task<string> Get(string path)\n{\n    await Task.Delay(10);\n    if (failsLeft[path] < 0) throw new HttpRequestException("404");\n    if (failsLeft[path] > 0) { failsLeft[path]--; throw new HttpRequestException("503 busy"); }\n    return "ok";\n}' }
  } });

  /* ================================================================
     retrieval cards (skill cards) for unit 11
     ================================================================ */
  K.add({ cards: {
    "u11-order": { title: "Which finishes first?", lesson: "11.4", concepts: ["why-async", "async-await"], kind: "predict",
      vary: function (r) {
        var names = ["a", "b", "c"], waits = [60, 160, 260];
        for (var i = 2; i > 0; i--) { var j = r(i + 1); var t = waits[i]; waits[i] = waits[j]; waits[j] = t; }
        return { prompt: "What does this print?", label: "three waits started together", params: [],
          src: "await Task.WhenAll(" + names.map(function (n, i) { return "Say(\"" + n + "\", " + waits[i] + ")"; }).join(", ") + ");\nConsole.WriteLine();\n\nstatic async Task Say(string s, int ms) { await Task.Delay(ms); Console.Write(s + \" \"); }",
          hint: "They all start at once; each prints when its own wait ends." };
      } },
    "u11-whenall": { title: "WhenAll's results", lesson: "11.6", concepts: ["when-all"], kind: "predict",
      vary: function (r) {
        var xs = [1 + r(9), 1 + r(9), 1 + r(9)], ms = [200, 60, 130];
        return { prompt: "What does this print?", label: "results and arrival order", params: [],
          src: "int[] r = await Task.WhenAll(" + xs.map(function (x, i) { return "Get(" + x + ", " + ms[i] + ")"; }).join(", ") + ");\nConsole.WriteLine(\"| \" + string.Join(\",\", r));\n\nstatic async Task<int> Get(int x, int ms) { await Task.Delay(ms); Console.Write(x + \" \"); return x * x; }",
          hint: "Each prints as it finishes; the array keeps the order the tasks were given." };
      } },
    "u11-cancel": { title: "Cancelled or not?", lesson: "11.7", concepts: ["cancellation"], kind: "predict",
      vary: function (r) {
        var limit = 200 + 50 * r(3), jobs = [40, 500, limit - 120, limit + 150];
        return { prompt: "What does this print?", label: "timeouts of " + limit + " ms", params: [],
          src: "foreach (int ms in new[] { " + jobs.join(", ") + " })\n{\n    using var cts = new CancellationTokenSource(" + limit + ");\n    try { await Task.Delay(ms, cts.Token); Console.Write(\"done \"); }\n    catch (OperationCanceledException) { Console.Write(\"cut \"); }\n}\nConsole.WriteLine();",
          hint: "Each job gets its own deadline; a wait longer than the limit is cut." };
      } },
    "u11-binary": { title: "Bytes on disk", lesson: "11.1", concepts: ["binary-files"], kind: "predict",
      vary: function (r) {
        var kinds = [["7", 4], ["7L", 8], ["2.5", 8], ["true", 1], ["(byte)9", 1], ["(short)3", 2]];
        var picks = [kinds[r(6)], kinds[r(6)], kinds[r(6)]];
        return { prompt: "What does this print?", label: "BinaryWriter sizes", params: [],
          src: "using (var w = new BinaryWriter(File.Create(\"x.bin\")))\n{\n" + picks.map(function (k) { return "    w.Write(" + k[0] + ");\n"; }).join("") + "}\nConsole.WriteLine(new FileInfo(\"x.bin\").Length);",
          hint: "int 4, long 8, double 8, bool 1, byte 1, short 2 bytes." };
      } },
    "u11-json": { title: "What JSON comes out?", lesson: "11.2", concepts: ["json"], kind: "predict",
      vary: function (r, n) {
        var name = pick(r, ["Ada", "Kai", "Lin"]), age = 10 + r(9), web = n % 2 === 0;
        return { prompt: "What does this print?", label: web ? "Web options" : "default options", params: [],
          src: "using System.Text.Json;\nvar p = new Person(\"" + name + "\", " + age + ", new[] { \"cs\" });\nConsole.WriteLine(JsonSerializer.Serialize(p" + (web ? ", JsonSerializerOptions.Web" : "") + "));\n\nrecord Person(string Name, int Age, string[] Tags);",
          hint: "Default keeps the property names as declared; Web writes them in camelCase. Arrays are [ ]." };
      } },
    "u11-async": { title: "Write an async method", lesson: "11.5", concepts: ["async-await"], kind: "write",
      vary: function (r, n) {
        var k = 2 + r(5), op = ["times", "plus"][n % 2];
        var f = function (x) { return op === "times" ? x * k : x + k; };
        var sets = [[1, 2, 3], [10], []];
        return { prompt: "Write `static async Task<int> ChangeAsync(int x)` that awaits `Task.Delay(10)` and returns x " + (op === "times" ? "× " : "+ ") + k + ". Read whole numbers on one line, await ChangeAsync for each in turn, and print the results separated by spaces, then `sum S`.",
          label: "x " + (op === "times" ? "×" : "+") + " " + k, params: [op, String(k)],
          starter: "int[] xs = (Console.ReadLine() ?? \"\").Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n",
          cases: sets.map(function (xs) { var ys = xs.map(f); return { stdin: xs.join(" "), out: (ys.length ? ys.join(" ") + "\n" : "\n") + "sum " + ys.reduce(function (a, b) { return a + b; }, 0) }; }),
          rules: [{ id: "async", test: function (src) { return /async\s+Task<\s*int\s*>\s+ChangeAsync/.test(src) && /await\s+ChangeAsync/.test(src) && !/\.Result\b/.test(src); }, msg: "Write async Task<int> ChangeAsync and await it." }],
          hint: "static async Task<int> ChangeAsync(int x) { await Task.Delay(10); return …; }",
          answer: "int[] xs = (Console.ReadLine() ?? \"\").Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\nvar ys = new List<int>();\nforeach (int x in xs) ys.Add(await ChangeAsync(x));\nConsole.WriteLine(string.Join(\" \", ys));\nConsole.WriteLine($\"sum {ys.Sum()}\");\n\nstatic async Task<int> ChangeAsync(int x)\n{\n    await Task.Delay(10);\n    return x " + (op === "times" ? "*" : "+") + " " + k + ";\n}" };
      } }
  } });
})();
