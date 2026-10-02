/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.1.1.9–
   4.1.1.16 (exception handling; subroutines; parameters; returning values;
   local and global variables; stack frames; recursion) at full A-level
   depth, with every program in C#. Each topic REPLACES the short entry
   cs-programming.js (4.1.1.9–15) or cs-algorithms.js (4.1.1.16) carried;
   every way AQA has examined it (7516/1 and 7517/1, June 2016–2025, plus the
   Paper 2 recursion items) is explained, worked and answered in the mark
   scheme's own format. Every C# listing was compiled and run under .NET 10,
   and every trace (the hex conversion, TreeSearch, the cycle finder G,
   IsPath/Traverse, the Fibonacci call counts) was reproduced by running it. */
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
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: o.both ? "both" : true, c: o.c || "accent2", w: o.w || 1.8, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}
function edge(x1, y1, x2, y2, col) { return { line: [[x1, y1], [x2, y2]], c: col || "line", w: 1.6 }; }
/* an edge between two node centres, trimmed to the circles' rims */
function link(x1, y1, x2, y2, r) {
  r = r || 17;
  var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy);
  return edge(x1 + dx * r / d, y1 + dy * r / d, x2 - dx * r / d, y2 - dy * r / d);
}
/* a graph / tree node: a circle with its label */
function node(x, y, label, col, r) {
  return [{ circle: [x, y, r || 17], fill: col || "accent", alpha: 0.18, c: col || "accent", w: 1.6 }, txt(x, y, label, { b: true, size: 11.5, c: "text" })];
}

/* =====================================================================
   4.1.1.9  Exception handling
   ===================================================================== */
C["compsci:4.1.1.9"] = {
  notes: [
    { h: "Exception handling — the whole topic on one page" },
    "Spec 4.1.1.9: be able to **write simple exception-handling code**. Exam questions ask what exception handling is FOR, where the Skeleton Program uses it and what would go wrong without it.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What exception handling is / is used for", "Explain", "1–2", "AS 2022 Q10.1, AS 2016 Q07.4"],
      ["How it could be used in a given subroutine", "Explain", "2", "AS 2016 Q07.4, AS 2025 Q08.2"],
      ["Identify a subroutine that uses it (+ a circumstance)", "State", "1–2", "AS 2022 Q10.2, AS 2023 Q06.4, AS 2025 Q08.1, A-level 2019 Q09.3"],
      ["Why an error-signalling method is not fully effective", "Explain", "2", "AS 2017 Q02.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What an exception is**.", "**try, catch, finally in C#**.", "**The re-enter loop**.", "**Exceptions vs checking first**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What an exception is" },
    { callout: { t: "def", h: "Exception", body: "An **exception** is an unexpected event (a **run-time error**) that happens while a program is executing and would normally make it **crash**. **Exception handling** is code that detects (catches) the exception and responds to it, so the program can recover or stop gracefully." } },
    { table: { head: ["Kind of error", "When it appears", "Example", "Handled by"], rows: [
      ["Syntax error", "at compile time — the program never runs", "missing ; or }", "fixing the code"],
      ["Run-time error (exception)", "while running, for some inputs or situations", "\"seven\" converted to int · file not found · index 10 of a 5-element array", "**exception handling**"],
      ["Logic error", "runs, but gives the wrong answer", "< instead of <=", "testing and tracing"]
    ] } },
    { kv: [
      ["Thrown", "the run-time system (or your own code, with throw) creates an exception object describing what went wrong"],
      ["Caught", "a catch block whose type matches takes control; the rest of the try block is skipped"],
      ["Uncaught", "it passes up to the CALLING subroutine, then its caller… — if nothing catches it, the program stops with an error message"]
    ] },
    { fig: { w: 640, h: 210, items: [].concat(
      boxAt(10, 24, 150, 52, "try", "accent", "the risky statements"),
      boxAt(280, 24, 160, 52, "finally", "good", "always runs (optional)"),
      boxAt(500, 24, 130, 52, "next statement", "accent"),
      boxAt(280, 124, 160, 52, "catch", "danger", "matching type → handle"),
      arrow(160, 50, 280, 50, "no exception", { c: "good" }),
      arrow(85, 76, 280, 150, "exception thrown", { c: "danger", dx: -50, dy: 22 }),
      arrow(360, 124, 360, 76, null, { c: "danger" }),
      arrow(440, 50, 500, 50, null, { c: "text2" }),
      [txt(320, 196, "no catch matches → the exception passes up to the caller; nobody catches it → the program crashes", { size: 10.5, c: "text2" })]
    ), cap: "Control flow through try / catch / finally. Without an exception the catch is skipped; with one, the rest of try is skipped." } },

    { page: "try, catch, finally in C#" },
    { code: { lang: "csharp", src: "static int? ReadInt(string text)\n{\n    try\n    {\n        return int.Parse(text);          // may throw\n    }\n    catch (FormatException)\n    {\n        return null;                     // \"seven\" is not a number\n    }\n    catch (OverflowException)\n    {\n        return null;                     // 99999999999 does not fit in an int\n    }\n}\n\n// ReadInt(\"42\") → 42 · ReadInt(\"seven\") → null · ReadInt(\"99999999999\") → null", cap: "Each catch names the exception TYPE it handles. Run: 42, null, null." } },
    { code: { lang: "csharp", src: "try\n{\n    int[] a = new int[3];\n    a[5] = 1;                            // only indexes 0–2 exist\n}\ncatch (IndexOutOfRangeException)\n{\n    Console.WriteLine(\"index out of range caught\");\n}\nfinally\n{\n    Console.WriteLine(\"finally runs\");   // runs whether or not there was an exception\n}\n\n// throwing your own exception\nstatic void Withdraw(int balance, int amount)\n{\n    if (amount > balance) throw new InvalidOperationException(\"Insufficient funds\");\n}", cap: "finally is for clean-up (closing a file). throw raises an exception for the CALLER to handle. Both outputs were checked by running." } },
    { table: { head: ["C# exception", "Typical cause"], rows: [
      ["FormatException", "Convert.ToInt32(\"seven\") / int.Parse(\"\")"],
      ["OverflowException", "a number too big for the type"],
      ["IndexOutOfRangeException", "array index < 0 or ≥ Length"],
      ["DivideByZeroException", "INTEGER division by 0 (5 / 0 with ints)"],
      ["FileNotFoundException", "opening a file that does not exist"],
      ["NullReferenceException", "using a member of a variable that is null"]
    ] } },
    { callout: { t: "warn", h: "Two C# traps", body: [
      "**5.0 / 0 does not throw** — floating-point division by zero gives ∞ (Infinity). Only integer division throws DivideByZeroException.",
      "**Order matters**: a catch (Exception) catches everything, so put specific catches FIRST; C# refuses to compile a specific catch that follows the general one."
    ] } },

    { page: "The re-enter loop" },
    "The most common exam use: keep asking until the user types something that converts.",
    { code: { lang: "csharp", src: "static int ReadWholeNumber(string prompt)\n{\n    while (true)\n    {\n        Console.Write(prompt);\n        string text = Console.ReadLine();\n        try\n        {\n            return Convert.ToInt32(text);    // success leaves the loop\n        }\n        catch (FormatException)\n        {\n            Console.WriteLine(\"That is not a whole number - try again.\");\n        }\n    }\n}", cap: "Run with seven, (blank), 12: two error messages, then 12 is returned." } },
    { worked: { tag: "variation", title: "Trace the re-enter loop", q: "ReadWholeNumber(\"Row: \") is called and the user types seven, then presses Enter on an empty line, then types 12. Give the output and the value returned.",
      steps: [
        { m: "\"seven\": Convert.ToInt32 throws FormatException → the return is skipped → the catch prints the message → the loop repeats.", mk: "1" },
        { m: "\"\" (empty): also a FormatException → the message again.", mk: "1", n: "Convert.ToInt32(null) returns 0 without an error, but ReadLine gives \"\" for an empty line, and \"\" throws." },
        { m: "\"12\": converts → return 12 leaves both the try and the loop.", mk: "1" }
      ], result: "Row: (×3), the message twice, returns 12" } },

    { page: "Exceptions vs checking first" },
    { table: { head: [" ", "Check first (validation)", "Exception handling"], rows: [
      ["Idea", "test the data BEFORE the risky operation", "attempt it, and respond IF it fails"],
      ["C# example", "if (int.TryParse(s, out int n)) … else …", "try { n = int.Parse(s); } catch (FormatException) { … }"],
      ["Best for", "expected, common bad input", "unexpected or hard-to-predict failures (files, networks, devices)"],
      ["Weakness", "every failure must be anticipated; the checks can make code complex", "the cost of throwing; can hide bugs if catch is too broad"],
      ["Mark-scheme phrase", "—", "avoids the structure of the code becoming too complex from checking for errors before they occur"]
    ] } },
    { callout: { t: "warn", h: "Misconceptions", body: [
      "\"Exception handling fixes errors.\" — it **responds** to them: shows a message, asks again, uses a default, saves and exits. The bad input is still bad.",
      "\"A catch handles syntax errors.\" — no: syntax errors stop compilation; only **run-time** errors reach a catch.",
      "An empty catch { } that silently swallows everything hides bugs — catch the specific type and do something visible."
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Exception handling in GetRowColumn", src: "AS June 2016 · P1 Q07.4 · 3 marks",
      q: "The subroutine GetRowColumn asks the user to enter a row and a column number, which it converts to integers. Explain what is meant by exception handling and how exception handling could be used in the GetRowColumn subroutine.",
      steps: [
        { h: "AO1 — what it is", m: "Exception handling is responding to the occurrence of errors that would cause a crash / run-time errors;", mk: "1" },
        { h: "AO2 — where", m: "It could trap the error when converting the user's input to an integer / when a non-integer is entered;", mk: "1" },
        { h: "AO2 — the response", m: "The code could then ask the user to re-enter the value // use a default value // display an error message;", mk: "1", n: "Two applied marks need the ACTUAL subroutine: the conversion of the row/column input." }
      ], result: "Respond to run-time errors; trap the failed conversion; ask again" } },
    { worked: { tag: "exam", title: "What exception handling is used for", src: "AS June 2022 · P1 Q10.1 · 2 marks",
      q: "Explain what exception handling is used for.",
      steps: [
        { m: "To stop a program from crashing;", mk: "1" },
        { m: "To deal with an (anticipated) run-time error;", mk: "1", n: "A. a clear example of a run-time error, e.g. a file that does not exist." },
        { m: "To avoid the structure of the code becoming too complex from checking for potential errors before they occur;", mk: "(1)", n: "Max 2." }
      ], result: "Prevents crashes by dealing with run-time errors" } },
    { worked: { tag: "exam", title: "Why this subroutine uses it", src: "AS June 2025 · P1 Q08.2 · 2 marks",
      q: "A subroutine in a program reads a string from the user and converts it to an integer inside a try block. Explain why exception handling is used in this subroutine.",
      steps: [
        { m: "The string/character supplied may not be (convertible to) an integer;", mk: "1" },
        { m: "Without exception handling the program would crash;", mk: "1" }
      ], result: "Input might not convert; otherwise a crash" } },
    { worked: { tag: "exam", title: "Identifier and a circumstance", src: "AS June 2022 · P1 Q10.2 · 2 marks",
      q: "A Skeleton Program contains a subroutine LoadPuzzleFile, which opens a file named by the user and reads its lines into an array, inside a try block. State the identifier of a subroutine in the program that performs exception handling and give an example of a circumstance that might cause an exception within that subroutine.",
      steps: [
        { m: "LoadPuzzleFile;", mk: "1", n: "R. if spelt incorrectly; I. case and spacing." },
        { m: "The file does not exist // the file has more lines than the array can hold (index error);", mk: "1" }
      ], result: "LoadPuzzleFile — file does not exist" } },
    { worked: { tag: "exam", title: "Returning −1 for a bad hex digit", src: "AS June 2017 · P1 Q02.2 · 2 marks",
      q: "A program converts hexadecimal strings to decimal: FOR EACH HexDigit IN HexString: Value ← ToDecimal(HexDigit); Number ← Number * 16 + Value. ToDecimal returns 10–15 for A–F, ASCII(HexDigit) − 48 for 0–9 and −1 for anything else. Explain how the algorithm has attempted to deal with the conversion of \"1G\" into decimal and why this method is not fully effective.",
      steps: [
        { m: "The invalid character G produces the value −1 from the subroutine;", mk: "1" },
        { m: "−1 should not be used in the calculation // it needs dealing with separately // using −1 gives a misleading result (1G → 1 × 16 − 1 = 15);", mk: "1" },
        { m: "The final output should be −1 / an error message;", mk: "(1)", n: "Max 2. This is the case for an exception: a signal the caller cannot accidentally use as data." }
      ], result: "−1 is used as if it were a digit: 1G gives 15" } },
    { code: { lang: "csharp", src: "static int ToDecimal(char digit)\n{\n    if (digit >= 'A' && digit <= 'F') return digit - 'A' + 10;\n    if (digit >= '0' && digit <= '9') return (int)digit - 48;\n    throw new FormatException(\"'\" + digit + \"' is not a hex digit\");\n}\n\ntry\n{\n    int number = 0;\n    foreach (char c in \"1G\") number = number * 16 + ToDecimal(c);\n    Console.WriteLine(number);\n}\ncatch (FormatException ex)\n{\n    Console.WriteLine(ex.Message);       // 'G' is not a hex digit\n}", cap: "The fix: throw instead of returning −1, so no misleading 15 can be printed." } },

    { page: "Exam toolkit" },
    { steps: [
      "**Define**: responding to run-time errors (exceptions) that would otherwise crash the program.",
      "**Where**: name the RISKY operation in the given code — converting input to a number, opening a file, indexing an array.",
      "**Response**: re-enter · default value · error message · save and close safely.",
      "**Identifier questions**: copy the subroutine name exactly (R. misspelt); a circumstance must be possible IN that subroutine."
    ] },
    { callout: { t: "tip", h: "Mnemonic — TCF", body: "**T**ry the risky statement, **C**atch the specific type, **F**inally clean up." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.12 a sentinel return value (−1) vs an exception; 4.2.1.3 file handling (FileNotFoundException); 4.13.1.4 erroneous test data; 4.7.3.6 interrupts — another way normal flow is suspended to handle an event." } }
  ],
  flashcards: [
    ["Exception?", "A run-time error / unexpected event during execution that would normally crash the program."],
    ["Exception handling?", "Code that detects (catches) an exception and responds to it so the program does not crash."],
    ["What goes in try?", "The statements that might throw."],
    ["What does catch do?", "Runs when an exception of its type is thrown in the try block."],
    ["finally?", "A block that runs whether or not an exception occurred — used for clean-up."],
    ["throw?", "Raises an exception for a caller to handle."],
    ["Uncaught exception?", "Passes up to the caller, then its caller…; if none catches it the program crashes."],
    ["Can exception handling catch syntax errors?", "No — syntax errors stop compilation; only run-time errors are caught."],
    ["5.0 / 0 in C#?", "Infinity — no exception. Integer 5 / 0 throws DivideByZeroException."],
    ["Typical exam response options?", "Ask to re-enter, use a default value, display an error message."]
  ],
  quiz: [
    { q: "Exception handling is used to", opts: ["deal with run-time errors so the program does not crash", "find syntax errors", "speed up a program", "remove logic errors"], ans: 0, why: "AQA: stop crashing / deal with a run-time error." },
    { q: "In C#, Convert.ToInt32(\"seven\") throws", opts: ["FormatException", "OverflowException", "IndexOutOfRangeException", "nothing — it returns 0"], ans: 0, why: "The text is not a number." },
    { q: "The finally block runs", opts: ["always, after try (and any catch)", "only when there was an exception", "only when there was no exception", "before try"], ans: 0, why: "Clean-up that must always happen." },
    { q: "Which does NOT throw in C#?", opts: ["5.0 / 0", "5 / 0 with ints", "new int[3][5]", "int.Parse(\"x\")"], ans: 0, why: "Floating-point division by zero gives Infinity." },
    { q: "Returning −1 for an invalid hex digit is not fully effective because", opts: ["the caller may use −1 as data and print a misleading result", "−1 is not an integer", "functions cannot return negatives", "it causes a crash"], ans: 0, why: "1G → 15." }
  ]
};

/* =====================================================================
   4.1.1.10  Subroutines (procedures/functions)
   ===================================================================== */
C["compsci:4.1.1.10"] = {
  notes: [
    { h: "Subroutines — the whole topic on one page" },
    "Spec 4.1.1.10: be familiar with subroutines and their uses; know that a subroutine is a **named, 'out of line' block of code** that may be executed (**called**) by simply writing its name in a program statement; be able to explain the **advantages** of using subroutines; know that a **function** is a subroutine that returns a value and a **procedure** is one that does not.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Define a subroutine", "Define / What is", "1", "AS 2025 Q04.1, AS 2022 Q11.1"],
      ["Advantages of subroutines", "State", "3", "AS 2025 Q04.2"],
      ["Advantages, each with how it is achieved", "State … explain", "3", "A-level 2024 Q01"],
      ["Name a subroutine in the Skeleton Program with a given property", "State the identifier", "1", "every AS Section B"],
      ["Write / amend a subroutine", "Write", "4–12", "every Section D"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Calling and returning**.", "**Procedures and functions in C#**.", "**Why use subroutines**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Calling and returning" },
    { callout: { t: "def", h: "Subroutine", body: "A **named, 'out of line' block of code** that can be executed by writing its name in a program statement (a **call**). When it finishes, control **returns** to the statement after the call." } },
    { fig: { w: 640, h: 230, items: [].concat(
      [{ poly: [[20, 20], [250, 20], [250, 205], [20, 205]], fill: "accent", alpha: 0.08, c: "accent", w: 1.5 },
        txt(135, 38, "Main program", { b: true, size: 12, c: "text" }),
        txt(40, 72, "total = 0;", { size: 11, c: "text2", pos: "e" }),
        txt(40, 102, "PrintBanner(\"Scores\");", { size: 11, c: "accent2", pos: "e" }),
        txt(40, 142, "int x = Square(4);", { size: 11, c: "accent2", pos: "e" }),
        txt(40, 180, "Console.WriteLine(x);", { size: 11, c: "text2", pos: "e" })],
      boxAt(400, 30, 220, 62, "PrintBanner(title)", "accent", "procedure · void · no value back"),
      boxAt(400, 128, 220, 62, "Square(n)", "accent2", "function · returns n * n"),
      [{ line: [[250, 98], [400, 54]], arrow: true, c: "accent2", w: 1.8 },
        { line: [[400, 76], [250, 110]], arrow: true, c: "good", w: 1.6, dash: "5 4" },
        { line: [[250, 138], [400, 150]], arrow: true, c: "accent2", w: 1.8 },
        { line: [[400, 172], [250, 148]], arrow: true, c: "good", w: 1.6, dash: "5 4" },
        txt(330, 214, "solid: call (jump out of line) · dashed: return to the next statement (with 16 from Square)", { size: 10.5, c: "text2" })]
    ), cap: "A call transfers control OUT OF LINE to the subroutine; return comes back to just after the call. A function's call is replaced by the value it returns." } },
    { table: { head: [" ", "Procedure", "Function"], rows: [
      ["Returns a value?", "no", "**yes** — exactly one (which may be a record/tuple)"],
      ["C# heading", "static void PrintBanner(string title)", "static int Square(int n)"],
      ["Called as", "a statement: PrintBanner(\"Scores\");", "part of an expression: int x = Square(4) + 1;"]
    ] } },
    { kv: [
      ["Built-in subroutines", "provided by the language/libraries: Console.WriteLine, Math.Sqrt, string.Substring, Convert.ToInt32"],
      ["User-defined subroutines", "written by the programmer — the Skeleton Program's own"],
      ["Method", "a subroutine that belongs to a class (4.1.2.3) — every C# subroutine is a method"],
      ["Interface", "the subroutine's name, parameters and return type: all a caller needs to know"]
    ] },

    { page: "Procedures and functions in C#" },
    { code: { lang: "csharp", src: "// a PROCEDURE: does a job, returns nothing\nstatic void PrintBanner(string title)\n{\n    Console.WriteLine(new string('*', title.Length + 4));\n    Console.WriteLine(\"* \" + title + \" *\");\n    Console.WriteLine(new string('*', title.Length + 4));\n}\n\n// a FUNCTION: computes and returns a value\nstatic int Square(int n)\n{\n    return n * n;\n}\n\nPrintBanner(\"Scores\");\nint x = Square(4);          // x = 16\nConsole.WriteLine(Square(x) - 6);   // 250", cap: "static methods inside Program act as plain subroutines." } },
    { worked: { tag: "variation", title: "Refactor repeated code", q: "A program contains three copies of: Console.Write(\"Enter mark: \"); int m = Convert.ToInt32(Console.ReadLine()); while (m < 0 || m > 100) { Console.Write(\"Enter mark: \"); m = Convert.ToInt32(Console.ReadLine()); }. Replace them with a subroutine and say what is gained.",
      steps: [
        { m: "static int GetMark() { Console.Write(\"Enter mark: \"); int m = Convert.ToInt32(Console.ReadLine()); while (m < 0 || m > 100) { Console.Write(\"Enter mark: \"); m = Convert.ToInt32(Console.ReadLine()); } return m; }", mk: "function" },
        { m: "int paper1 = GetMark(); int paper2 = GetMark(); int nea = GetMark();", mk: "3 calls" },
        { m: "Gained: the logic is written and tested ONCE; changing the range to 0–150 is one edit, not three; the calls read as plain English.", mk: "advantages" }
      ], result: "One function, three calls" } },

    { page: "Why use subroutines" },
    { table: { head: ["Advantage (state)", "How it is achieved (explain — needed for A-level 2024 Q01)"], rows: [
      ["Easier to re-use code", "a subroutine is independent of the rest of the program, so it can be called again or copied into another program"],
      ["Less code / faster development", "it can be called as often as needed without writing the code each time"],
      ["Easier to test and debug", "each subroutine can be tested separately with its own test data"],
      ["Easier to understand", "sensible subroutine names describe what a block does; each can be read in isolation"],
      ["Easier to maintain / update", "a change is made in one place, so fewer changes are needed"],
      ["Team working", "different programmers can write different subroutines independently at the same time"],
      ["Fewer side-effects", "local variables mean a subroutine cannot unexpectedly change data elsewhere"],
      ["Supports a structured approach / recursion", "a problem is decomposed into subroutines; a subroutine can call itself"]
    ] } },
    { callout: { t: "tip", h: "Mnemonic — RE-TEAM", body: "**R**euse · **E**asier to read · **T**est separately · **E**dit (maintain) in one place · **A**llows team working · **M**inimises side-effects." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Define subroutine", src: "AS June 2025 · P1 Q04.1 · 1 mark",
      q: "Define the term subroutine.",
      steps: [{ m: "A named / callable 'out of line' block of code (that may be executed by writing its name in a program statement);", mk: "1" }],
      result: "Named, out-of-line, callable block of code" } },
    { worked: { tag: "exam", title: "What is a subroutine?", src: "AS June 2022 · P1 Q11.1 · 1 mark",
      q: "What is a subroutine?",
      steps: [{ m: "A named / callable 'out of line' block of code (that may be called by simply writing its name in a program statement);", mk: "1", n: "A. a subroutine gives a block of code a name, and the name can be used to execute those statements. NE. \"a section of code\" — it must be NAMED/callable." }],
      result: "Named block of code, called by name" } },
    { worked: { tag: "exam", title: "Three advantages", src: "AS June 2025 · P1 Q04.2 · 3 marks",
      q: "State three advantages of using subroutines.",
      steps: [
        { m: "Easier to re-use code;", mk: "1" },
        { m: "Easier to debug / update / maintain / test;", mk: "1" },
        { m: "Facilitates multiple programmers working on a program simultaneously;", mk: "1", n: "Also: easier to understand; supports a structured approach; less code; reduces side-effects; local variables only use memory while the subroutine runs. Max 3 — three DIFFERENT ideas." }
      ], result: "Reuse · testing/maintenance · team working" } },
    { worked: { tag: "exam", title: "Advantages with how they are achieved", src: "A-level June 2024 · P1 Q01 · 3 marks",
      q: "State three advantages of using subroutines. For each advantage, you must explain how the advantage is achieved.",
      steps: [
        { m: "Easier to test/debug, as each subroutine can be tested separately;", mk: "1" },
        { m: "Code can be easily reused, as each subroutine is independent of the rest of the program;", mk: "1" },
        { m: "Easier to maintain/update, as a change only needs to be made in one place, so fewer changes are needed;", mk: "1", n: "No mark for an advantage without its HOW; the explanation must fit the advantage; each advantage must be different." }
      ], result: "Advantage + because… three times" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Define**: say NAMED and OUT OF LINE and CALLED by name — \"a block of code\" alone is NE.",
      "**Advantages**: three DIFFERENT ones; at A-level attach the mechanism (\"because each can be tested separately\").",
      "**Function vs procedure**: a function returns a value and is used in an expression.",
      "**Skeleton questions**: copy the identifier exactly, with no extra code."
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.11 parameters and 4.1.1.12 return values; 4.1.1.15 stack frames (what a call really does); 4.1.2.2 procedural decomposition and structure charts; 4.1.2.3 methods; 4.7.3.5 the branch-and-return of machine code; 4.13.1.2 design by modules." } }
  ],
  flashcards: [
    ["Subroutine?", "A named, out-of-line block of code that can be executed by writing its name in a program statement."],
    ["Call?", "A statement that transfers control to a subroutine; control returns to the next statement when it ends."],
    ["Function?", "A subroutine that returns a value."],
    ["Procedure?", "A subroutine that does not return a value (void in C#)."],
    ["Built-in vs user-defined?", "Provided by the language/library vs written by the programmer."],
    ["Advantage: testing — how?", "Each subroutine can be tested separately."],
    ["Advantage: reuse — how?", "A subroutine is independent of the rest of the program, so it can be called again or used in another program."],
    ["Advantage: maintenance — how?", "A change is made once, in one place."],
    ["Advantage: team working — how?", "Different programmers write different subroutines at the same time."],
    ["Method?", "A subroutine belonging to a class."]
  ],
  quiz: [
    { q: "Which is a function?", opts: ["static int Square(int n)", "static void Print(string s)", "static void Main()", "static void Clear()"], ans: 0, why: "It has a return type." },
    { q: "'A block of code' as a definition of a subroutine is", opts: ["not enough — it must be named/callable", "worth the mark", "wrong — subroutines are data", "only right for functions"], ans: 0, why: "Named and out of line." },
    { q: "After a subroutine finishes, control goes to", opts: ["the statement after the call", "the start of the program", "the end of the program", "the next subroutine in the file"], ans: 0, why: "Return to the caller." },
    { q: "A-level 2024 Q01 needs, for each advantage,", opts: ["how it is achieved", "a code example", "a disadvantage", "a diagram"], ans: 0, why: "No mark without the explanation." }
  ]
};

/* =====================================================================
   4.1.1.11  Parameters of subroutines
   ===================================================================== */
C["compsci:4.1.1.11"] = {
  notes: [
    { h: "Parameters of subroutines — the whole topic on one page" },
    "Spec 4.1.1.11: be able to describe the use of **parameters** to pass data **within programs**; be able to use subroutines with **interfaces**. A parameter is the variable in the subroutine's heading; an **argument** is the value given to it in a call.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How parameters improve subroutines", "Describe", "2", "AS 2025 Q04.3"],
      ["What a parameter contains when called", "Describe", "1", "AS 2019 Q07"],
      ["Which data structure must now be passed", "State the identifier", "1", "AS 2019 Q17.1"],
      ["Amend a subroutine's parameter list and its calls", "Write", "part of 6–12", "AS 2019, 2022, 2023, 2024 Section D"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Parameters and arguments**.", "**By value and by reference**.", "**References, arrays and strings**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Parameters and arguments" },
    { code: { lang: "csharp", src: "//                 parameters (formal) ↓            ↓\nstatic double Area(double width, double height = 1)\n{\n    return width * height;\n}\n\ndouble a = Area(4, 2.5);          // arguments (actual) 4 and 2.5 → 10\ndouble b = Area(4);               // height takes its default → 4\ndouble c = Area(height: 3, width: 2);   // named arguments → 6", cap: "Arguments are matched to parameters by POSITION (or by name in C#). Run: 10, 4, 6." } },
    { kv: [
      ["Parameter", "a variable in the subroutine's heading that receives a value when it is called"],
      ["Argument", "the actual value or expression passed in a particular call"],
      ["Interface", "the subroutine's name, its parameters (number, order, types) and its return type"],
      ["Why", "the subroutine works on whatever it is GIVEN, so it does not need global variables"]
    ] },

    { page: "By value and by reference" },
    { fig: { w: 640, h: 180, items: [].concat(
      [txt(165, 18, "By value (C# default)", { b: true, size: 12, c: "text" }), txt(480, 18, "By reference (ref)", { b: true, size: 12, c: "text" })],
      boxAt(20, 44, 120, 46, "n = 5", "accent", "caller"),
      boxAt(190, 44, 130, 46, "x = 5 → 6", "accent2", "own copy"),
      arrow(140, 67, 190, 67, "copy", { c: "accent2" }),
      [txt(165, 118, "n is still 5 afterwards", { size: 10.5, c: "text2" })],
      boxAt(340, 44, 130, 46, "n = 5 → 6", "accent", "caller"),
      boxAt(520, 44, 100, 46, "ref x", "accent2", "an alias of n"),
      arrow(470, 67, 520, 67, null, { c: "accent2", both: true }),
      [txt(480, 118, "x IS n: changing x changes n", { size: 10.5, c: "text2" }),
        txt(320, 160, "By value: the caller's data is safe. By reference: no copy, and results can come back.", { size: 10.5, c: "muted" })]
    ), cap: "Passing by value copies the argument; passing by reference passes its address, so both names refer to one variable." } },
    { code: { lang: "csharp", src: "static void AddOneByValue(int x) { x = x + 1; }\nstatic void AddOneByRef(ref int x) { x = x + 1; }\nstatic void Swap(ref int a, ref int b) { int t = a; a = b; b = t; }\n\nint n = 5;\nAddOneByValue(n);   Console.WriteLine(n);   // 5\nAddOneByRef(ref n); Console.WriteLine(n);   // 6\n\nint p = 3, q = 8;\nSwap(ref p, ref q); Console.WriteLine($\"{p} {q}\");   // 8 3", cap: "C# writes ref at BOTH the heading and the call. Outputs checked: 5, 6, 8 3." } },
    { table: { head: [" ", "By value", "By reference (ref / out)"], rows: [
      ["What is passed", "a copy of the value", "the address of the caller's variable"],
      ["Changes inside", "lost on return", "seen by the caller"],
      ["Argument may be", "any expression: Square(x + 1)", "a variable only"],
      ["Use when", "the subroutine only needs to read the data", "it must change the caller's variable or return several results"],
      ["Risk", "copying a large structure costs time and memory", "unintended side-effects"]
    ] } },

    { page: "References, arrays and strings" },
    "Arrays and objects are **reference types**: the variable holds a reference, and passing it by value copies the REFERENCE — so the subroutine can change the elements, but not make the caller's variable point at a new array.",
    { code: { lang: "csharp", src: "static void Zero(int[] a)            { a[0] = 0; }\nstatic void Replace(int[] a)         { a = new[] { 9, 9, 9 }; }\nstatic void ReplaceRef(ref int[] a)  { a = new[] { 9, 9, 9 }; }\n\nint[] arr = { 1, 2, 3 };\nZero(arr);           // 0,2,3  — element changed through the copied reference\nReplace(arr);        // 0,2,3  — only the local copy was re-pointed\nReplaceRef(ref arr); // 9,9,9  — the caller's variable itself changed\n\nstring name = \"ada\";\nstatic void Shout(string s) { s = s.ToUpper(); }\nShout(name);         // name is still \"ada\": strings are immutable", cap: "Checked by running: 0,2,3 · 0,2,3 · 9,9,9 · ada." } },
    { worked: { tag: "variation", title: "Predict the output", q: "int[] t = {4, 7}; int k = 2; Change(t, k); Console.WriteLine(t[0] + \" \" + k); where static void Change(int[] arr, int v) { arr[0] = arr[0] * v; v = 0; }",
      steps: [
        { m: "arr receives a copy of the REFERENCE: arr[0] = 4 × 2 = 8 changes the caller's array.", mk: "1" },
        { m: "v is a copy of k: v = 0 changes only the copy.", mk: "1" }
      ], result: "8 2" } },
    { callout: { t: "warn", h: "Misconception", body: "\"Arrays are passed by reference in C#.\" — strictly, the REFERENCE is passed by value. Element changes are visible; re-assigning the parameter is not. Only ref makes the caller's variable itself change." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "How parameters improve subroutines", src: "AS June 2025 · P1 Q04.3 · 2 marks",
      q: "Describe how parameters improve the effectiveness of subroutines.",
      steps: [
        { m: "They avoid the use of global variables // they make subroutines self-contained / encapsulated;", mk: "1" },
        { m: "They make it easier to use the subroutine with different values / variables;", mk: "1" },
        { m: "Also: easier to reuse in a different program; easier to test independently; clearer which outside values are used inside (they are listed explicitly);", mk: "(1)", n: "Max 2." }
      ], result: "Self-contained, reusable with different values" } },
    { worked: { tag: "variation", title: "Add a parameter to a Skeleton subroutine", q: "A subroutine ExecuteSKP() reads and changes a global array Registers. Rewrite it so Registers is passed as a parameter, and amend the call.",
      steps: [
        { m: "Heading: static void ExecuteSKP(int[] registers) — the array is a reference, so element changes reach the caller.", mk: "heading" },
        { m: "Body: use registers[…] everywhere Registers[…] was used.", mk: "body" },
        { m: "Call: ExecuteSKP(registers); in Execute — and Execute must itself receive registers as a parameter if it does not already have it.", mk: "call" }
      ], result: "Heading + body + every call changed" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Parameter** in the heading; **argument** in the call.",
      "**Why parameters**: no globals, self-contained, reusable with different values, testable alone, explicit inputs.",
      "**By value** copies; **by reference** passes the address — use it to change the caller's variable or return several values.",
      "**In code tasks**: when you add a parameter, change the heading AND every call."
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.12 out parameters as extra return values; 4.1.1.14 parameters replace globals; 4.1.1.15 parameters are stored in the stack frame; 4.1.1.1 value vs reference types; 4.12.1.3 function application in functional programming." } }
  ],
  flashcards: [
    ["Parameter?", "A variable in a subroutine's heading that receives data when the subroutine is called."],
    ["Argument?", "The actual value passed to a parameter in a call."],
    ["Passing by value?", "A copy of the argument is passed; changes inside are not seen by the caller."],
    ["Passing by reference?", "The address is passed; changes inside change the caller's variable."],
    ["C# keyword for by reference?", "ref (or out), written at the heading AND the call."],
    ["Interface of a subroutine?", "Its name, parameters (number, order, types) and return type."],
    ["Two ways parameters improve subroutines?", "Avoid globals / self-contained; reusable with different values."],
    ["Passing an array by value in C#?", "Copies the reference: element changes are visible, re-assignment is not."],
    ["Can a by-reference argument be an expression like x + 1?", "No — it must be a variable."]
  ],
  quiz: [
    { q: "void F(int x) { x = 9; } int a = 1; F(a); a is now", opts: ["1", "9", "0", "undefined"], ans: 0, why: "By value." },
    { q: "void F(ref int x) { x = 9; } int a = 1; F(ref a); a is now", opts: ["9", "1", "0", "an error"], ans: 0, why: "By reference." },
    { q: "void F(int[] t) { t[0] = 9; } int[] a = {1}; F(a); a[0] is", opts: ["9", "1", "0", "an error"], ans: 0, why: "The reference is copied; the elements are shared." },
    { q: "A benefit of parameters over globals is", opts: ["the subroutine is self-contained and can be tested alone", "less memory always", "faster compilation", "no need for return values"], ans: 0, why: "AS 2025 Q04.3." },
    { q: "In Area(4, 2.5), 4 and 2.5 are", opts: ["arguments", "parameters", "local variables", "return values"], ans: 0, why: "Values in a call." }
  ]
};

/* =====================================================================
   4.1.1.12  Returning a value/values from a subroutine
   ===================================================================== */
C["compsci:4.1.1.12"] = {
  notes: [
    { h: "Returning values — the whole topic on one page" },
    "Spec 4.1.1.12: be able to use subroutines that **return values to the calling routine**. A function's call is replaced by its returned value; several values come back as a record/tuple or through by-reference (out) parameters.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Trace an algorithm that calls a function", "Complete the trace table", "5", "AS 2017 Q02.1"],
      ["Explain a sentinel return value's weakness", "Explain", "2", "AS 2017 Q02.2 (see 4.1.1.9)"],
      ["Write a function with the right return value", "Write", "part of 6–12", "AS 2022 Section D (DuplicateDigit returns True/False), A-level 2025 Q04"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**return in C#**.", "**More than one value**.", "**Tracing calls**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "return in C#" },
    { code: { lang: "csharp", src: "static int ToDecimal(char hexDigit)\n{\n    if (hexDigit >= 'A' && hexDigit <= 'F') return hexDigit - 'A' + 10;   // 'A' → 10\n    if (hexDigit >= '0' && hexDigit <= '9') return (int)hexDigit - 48;     // ASCII('1') = 49 → 1\n    return -1;                                                            // anything else\n}\n\nint number = 0;\nforeach (char c in \"A2\")\n    number = number * 16 + ToDecimal(c);   // the CALL is replaced by its value\nConsole.WriteLine(number);                // 162", cap: "AS 2017's ToDecimal in C#. Checked: A2 → 162, 1G → 15, FF → 255." } },
    { fig: { w: 640, h: 150, items: [].concat(
      boxAt(20, 30, 60, 44, "A", "accent2"), boxAt(80, 30, 60, 44, "2", "accent2"),
      [txt(50, 92, "16¹ = 16", { size: 10.5 }), txt(110, 92, "16⁰ = 1", { size: 10.5 })],
      boxAt(190, 26, 110, 52, "0", "accent", "Number ← 0"),
      boxAt(340, 26, 110, 52, "10", "accent", "0 × 16 + 10"),
      boxAt(490, 26, 110, 52, "162", "good", "10 × 16 + 2"),
      arrow(300, 52, 340, 52, "A", { dy: -6 }), arrow(450, 52, 490, 52, "2", { dy: -6 }),
      [txt(395, 108, "\"1G\": 0 → 1 → 1 × 16 + (−1) = 15 — the −1 is silently used as a digit", { size: 10.5, c: "danger" })]
    ), cap: "Each digit shifts the running total one hex place left (× 16) and adds the digit's value returned by ToDecimal: A2 = 10 × 16 + 2 = 162." } },
    { kv: [
      ["return ends the subroutine", "statements after an executed return do not run — a loop can be left early with return"],
      ["Every path must return", "C# refuses to compile a function where some path reaches the end without a return (error CS0161)"],
      ["The type", "the value must match the declared return type (int, bool, string, a record…)"],
      ["Use the result", "a function call is an expression: store it, print it, test it — calling it as a lone statement throws the value away"]
    ] },

    { page: "More than one value" },
    { code: { lang: "csharp", src: "// 1) a tuple (or a record/struct)\nstatic (int Min, int Max) MinMax(int[] values)\n{\n    int lo = values[0], hi = values[0];\n    foreach (int v in values) { if (v < lo) lo = v; if (v > hi) hi = v; }\n    return (lo, hi);\n}\nvar (mn, mx) = MinMax(new[] { 7, 2, 9, 4 });          // 2 9\n\n// 2) out parameters (passed by reference)\nstatic bool Divide(int a, int b, out int quotient, out int remainder)\n{\n    if (b == 0) { quotient = 0; remainder = 0; return false; }\n    quotient = a / b; remainder = a % b; return true;\n}\nif (Divide(17, 5, out int q, out int r)) Console.WriteLine($\"{q} r {r}\");   // 3 r 2\n\n// the built-in pattern\nbool ok = int.TryParse(\"12\", out int parsed);         // True, 12", cap: "All three checked by running: 2 9 · 3 r 2 · True 12." } },
    { table: { head: ["Way back", "When", "C#"], rows: [
      ["return one value", "one result", "return x;"],
      ["return a tuple / record", "a few related results", "return (lo, hi);"],
      ["out / ref parameters", "a success flag plus results", "TryParse(s, out int n)"],
      ["change a passed array/object", "the caller's data structure is updated", "Zero(arr) sets arr[0]"],
      ["(avoid) a global variable", "—", "hidden side-effect (4.1.1.14)"]
    ] } },

    { page: "Tracing calls" },
    { steps: [
      "Keep one column per variable of the CALLING code, and one for each value returned.",
      "At a call, work out the arguments, run the function on them, and write the returned value where the call stood.",
      "Write a new row only when a value changes — AQA accepts repeated values but marks the sequence.",
      "Output goes in its own column, at the point the OUTPUT statement runs."
    ] },
    { worked: { tag: "variation", title: "Trace FF and 1A", q: "Using the same algorithm (Number ← Number * 16 + ToDecimal(HexDigit) for each digit), give the outputs for \"FF\" and \"1A\".",
      steps: [
        { m: "FF: 0 × 16 + 15 = 15; 15 × 16 + 15 = 255.", mk: "1" },
        { m: "1A: 0 × 16 + 1 = 1; 1 × 16 + 10 = 26.", mk: "1" }
      ], result: "255 and 26" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Hand-trace the hex conversion", src: "AS June 2017 · P1 Q02.1 · 5 marks",
      q: "FOR Count ← 1 TO 2: INPUT HexString; Number ← 0; FOR EACH HexDigit IN HexString: Value ← ToDecimal(HexDigit); Number ← Number * 16 + Value; ENDFOR; OUTPUT Number; ENDFOR. ToDecimal returns 10–15 for \"A\"–\"F\", ASCII(HexDigit) − 48 for \"0\"–\"9\" (ASCII(\"1\") = 49) and −1 otherwise. Complete a trace table with columns Count, HexString, Number, HexDigit, Value, Output, using \"A2\" and \"1G\" as the input strings.",
      steps: [
        { m: "Count runs 1, 2 with HexString \"A2\" then \"1G\";", mk: "1" },
        { m: "Number: 0, 10, 162, 0, 1, 15;", mk: "1", n: "A2: 0×16+10 = 10, 10×16+2 = 162. 1G: 0×16+1 = 1, 1×16+(−1) = 15." },
        { m: "HexDigit: \"A\", \"2\", \"1\", \"G\";", mk: "1" },
        { m: "Value: 10, 2, 1, −1;", mk: "1" },
        { m: "Output: 162, 15;", mk: "1", n: "A. repeated values in the first two columns; A. strings without quotes." }
      ], result: "Outputs 162 and 15" } },
    { table: { head: ["Count", "HexString", "Number", "HexDigit", "Value", "Output"], rows: [
      ["1", "\"A2\"", "0", "", "", ""],
      ["", "", "10", "\"A\"", "10", ""],
      ["", "", "162", "\"2\"", "2", ""],
      ["", "", "", "", "", "162"],
      ["2", "\"1G\"", "0", "", "", ""],
      ["", "", "1", "\"1\"", "1", ""],
      ["", "", "15", "\"G\"", "−1", ""],
      ["", "", "", "", "", "15"]
    ] } },
    { worked: { tag: "variation", title: "Write DuplicateDigit's return", q: "Write the C# heading and returns for a function DuplicateDigit(int[,] grid, int row, int column, int digit) that returns true if digit already appears in the given row or column of a 9×9 grid, and false otherwise.",
      steps: [
        { m: "Heading: static bool DuplicateDigit(int[,] grid, int row, int column, int digit)", mk: "heading" },
        { m: "for (int i = 0; i < 9; i++) { if (grid[row, i] == digit || grid[i, column] == digit) return true; } — return true as soon as one is found (it ends the function).", mk: "early return" },
        { m: "return false; after the loop — the path where nothing was found.", mk: "final return", n: "R. returning false INSIDE the loop's else: that stops after checking only the first cell." }
      ], result: "true on the first match, false after the loop" } },

    { page: "Exam toolkit" },
    { steps: [
      "A function's call is **replaced by the value it returns**.",
      "**return ends** the subroutine immediately.",
      "**Several results**: a tuple/record, or out/ref parameters.",
      "**In traces**: work out the returned value first, then the calling statement's assignment.",
      "**Sentinel values** like −1 must be checked by the caller (AS 2017 Q02.2)."
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.9 exceptions vs sentinel returns; 4.1.1.11 out parameters; 4.1.1.16 recursion — each call returns its value to the call below; 4.5.2 hexadecimal; 4.12.1.1 a function maps a domain to a co-domain." } }
  ],
  flashcards: [
    ["What does return do?", "Sends a value back to the caller AND ends the subroutine."],
    ["Where does a returned value go?", "It replaces the function call in the calling expression."],
    ["Return several values in C#?", "A tuple/record, or out/ref parameters."],
    ["CS0161?", "\"Not all code paths return a value\" — every path of a function must return."],
    ["int.TryParse returns?", "A bool (success) and the number through an out parameter."],
    ["\"A2\" → decimal?", "10 × 16 + 2 = 162."],
    ["\"1G\" with ToDecimal returning −1?", "1 × 16 − 1 = 15 — misleading."],
    ["ASCII(\"1\") − 48?", "49 − 48 = 1."]
  ],
  quiz: [
    { q: "Statements after an executed return", opts: ["do not run", "run once", "run after the caller", "cause an error"], ans: 0, why: "return ends the subroutine." },
    { q: "Number ← Number*16 + Value for \"A2\" outputs", opts: ["162", "102", "42", "10"], ans: 0, why: "10×16+2." },
    { q: "In C#, (int Min, int Max) as a return type is", opts: ["a tuple returning two values", "two functions", "an error", "a parameter list"], ans: 0, why: "Tuples return several values." },
    { q: "A function that may reach its end without return", opts: ["will not compile in C#", "returns 0", "returns null", "loops forever"], ans: 0, why: "CS0161." }
  ]
};

/* =====================================================================
   4.1.1.13  Local variables in subroutines
   ===================================================================== */
function scopeFig(cap) {
  return { fig: { w: 640, h: 210, items: [].concat(
    [{ poly: [[10, 10], [630, 10], [630, 198], [10, 198]], fill: "accent", alpha: 0.06, c: "accent", w: 1.5 },
      txt(320, 28, "Program — static field Counter.Total: GLOBAL (visible everywhere, lives for the whole run)", { b: true, size: 11, c: "text" })],
    boxAt(30, 50, 280, 128, null, "accent2"),
    [txt(170, 72, "AddScore(int points)", { b: true, size: 12, c: "text" }),
      txt(170, 100, "points, bonus — LOCAL", { size: 11, c: "text2" }),
      txt(170, 124, "created when called, destroyed on return", { size: 10.5 }),
      txt(170, 148, "uses Counter.Total", { size: 10.5, c: "accent" })],
    boxAt(330, 50, 280, 128, null, "good"),
    [txt(470, 72, "Main", { b: true, size: 12, c: "text" }),
      txt(470, 100, "n, line — LOCAL", { size: 11, c: "text2" }),
      txt(470, 124, "cannot see points or bonus", { size: 10.5 }),
      txt(470, 148, "its own 'points' would be a different variable", { size: 10.5 })]
  ), cap: cap } };
}
C["compsci:4.1.1.13"] = {
  notes: [
    { h: "Local variables — the whole topic on one page" },
    "Spec 4.1.1.13: know that subroutines may declare their own variables, called **local variables**, and that local variables **only exist while the subroutine is executing** and are **only accessible within the subroutine**; be able to use local variables and explain why it is good practice to do so.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Difference + reasons to use local variables", "State / give", "3", "AS 2019 Q01"],
      ["Two reasons local variables are good practice", "Give", "2", "AS 2024 Q02.2"],
      ["One reason", "State", "1", "A-level 2019 Q09.5"],
      ["Why two variables can share an identifier", "Explain", "2", "AS 2016 Q08.5"],
      ["Name a local variable in a given method", "State the identifier", "1", "AS 2017 Q04.4, A-level 2018 Q06.2, A-level 2020 Q07.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Scope and lifetime**.", "**Local variables in C#**.", "**Why use them**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Scope and lifetime" },
    { callout: { t: "def", h: "Local variable", body: "A variable **declared inside a subroutine** (or block). Its **scope** is that subroutine — nothing outside can use it; its **lifetime** is one execution of it — created when the subroutine is called (in its stack frame) and destroyed when it returns." } },
    scopeFig("Scope = WHERE a name can be used; lifetime = WHEN the variable exists. A local variable is limited in both."),
    { kv: [
      ["Scope", "the part of the program in which an identifier can be used"],
      ["Lifetime", "the period of execution during which the variable exists in memory"],
      ["Stored", "in the subroutine's stack frame (4.1.1.15) — a fresh copy for every call, which is what lets recursion work"]
    ] },

    { page: "Local variables in C#" },
    { code: { lang: "csharp", src: "static int SumTo(int n)\n{\n    int total = 0;                    // local to SumTo\n    for (int i = 1; i <= n; i++)      // i is local to the for loop (block scope)\n    {\n        total = total + i;\n    }\n    // Console.WriteLine(i);          // error CS0103: i does not exist here\n    return total;\n}\n\nstatic void Report()\n{\n    int total = 99;                   // a DIFFERENT variable that happens to share the name\n    Console.WriteLine(SumTo(3) + \" \" + total);   // 6 99\n}", cap: "C# scopes locals to their block { }. Two subroutines can each have their own total." } },
    { callout: { t: "warn", h: "C# specifics", body: [
      "C# forbids reusing a name for a local in a NESTED block of the same method (error CS0136) — but different subroutines may reuse names freely.",
      "A local must be assigned before it is read (error CS0165); C# does not give locals a default value.",
      "A local variable with the same name as a class field **hides** the field inside that method."
    ] } },
    { worked: { tag: "variation", title: "Which total is printed?", q: "static int total = 10; static void Bump() { int total = 0; total = total + 5; } … Bump(); Console.WriteLine(total); — what is printed and why?",
      steps: [
        { m: "Inside Bump, the local total hides the field; +5 changes the LOCAL.", mk: "1" },
        { m: "The local is destroyed on return; the field is untouched.", mk: "1" }
      ], result: "10" } },

    { page: "Why use them" },
    { table: { head: ["Reason (mark scheme)", "Because…"], rows: [
      ["Subroutine is self-contained", "everything it needs is declared inside it or passed in"],
      ["Aids modularisation / reuse", "it can be moved into another program without its globals"],
      ["Less memory", "memory for locals is reused when the subroutine is not running"],
      ["Names can be reused", "two subroutines can both use i or total without clashing"],
      ["Fewer side-effects / accidental changes", "no other part of the program can change it"],
      ["Easier debugging / testing / maintenance", "a fault in a local is confined to one subroutine"]
    ] } },
    { callout: { t: "tip", h: "Mnemonic — the two Ls", body: "**L**ocal = **L**imited scope + **L**ifetime of one call." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Difference and two reasons", src: "AS June 2019 · P1 Q01 · 3 marks",
      q: "State one difference between local and global variables and give two reasons why it is good practice to use local variables.",
      steps: [
        { h: "Difference", m: "Global variables are accessible to all parts of the program // local variables are declared in a subroutine and accessible only in the block/subroutine in which they are declared;", mk: "1" },
        { h: "Reasons (max 2)", m: "Memory allocated to local variables can be reused when the subroutine is not in use;", mk: "1" },
        { m: "Using local variables makes subroutines self-contained;", mk: "1", n: "Also: only exists while the subroutine executes; A. prevents accidental changes; A. easier debugging/maintenance." }
      ], result: "Scope difference + memory + self-contained" } },
    { worked: { tag: "exam", title: "Two reasons for local variables", src: "AS June 2024 · P1 Q02.2 · 2 marks",
      q: "A program uses both local and global variables. Give two reasons why it is good practice to use local variables.",
      steps: [
        { m: "Using local variables makes a subroutine self-contained // aids modularisation;", mk: "1" },
        { m: "Variable names can be reused in other parts of the program // memory can be reused when the subroutine is not in use;", mk: "1", n: "A. prevents unintended side-effects; A. easier debugging/maintenance/testing. Max 2." }
      ], result: "Self-contained + names/memory reusable" } },
    { worked: { tag: "exam", title: "Two variables called Row", src: "AS June 2016 · P1 Q08.5 · 2 marks",
      q: "There is a variable called Row in the subroutine SetUpBoard. There is also a different variable called Row in the subroutine LoadGame. Explain why these two different variables can have the same identifier.",
      steps: [
        { m: "They are (both) local variables;", mk: "1" },
        { m: "…declared in different subroutines // because the scope of the two variables is different;", mk: "1", n: "\"Different scope\" alone earns both marks." }
      ], result: "Both local, in different subroutines: different scopes" } },
    { worked: { tag: "exam", title: "One reason, one mark", src: "A-level June 2019 · P1 Q09.5 · 1 mark",
      q: "State one reason why it is considered to be good practice to use local variables.",
      steps: [{ m: "Modularisation of a program // allows reuse of subroutines // less chance of side-effects;", mk: "1", n: "A. advantages resulting from modularisation, e.g. easier to test each subroutine independently." }],
      result: "Fewer side-effects" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Define by scope AND lifetime**: declared in a subroutine; accessible only there; exists only while it runs.",
      "**Reasons**: self-contained · modular/reusable · memory reused · names reusable · fewer side-effects.",
      "**Same identifier twice**: both local, different subroutines → different scopes.",
      "**Name a local variable**: pick one DECLARED inside the named method (not a parameter, not a field)."
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.14 global variables (the contrast); 4.1.1.15 locals live in the stack frame; 4.1.1.16 every recursive call gets its own locals; 4.1.2.3 encapsulation is the same idea for objects." } }
  ],
  flashcards: [
    ["Local variable?", "Declared inside a subroutine; accessible only there; exists only while it executes."],
    ["Scope?", "The part of the program where an identifier can be used."],
    ["Lifetime?", "The period during which a variable exists in memory."],
    ["Where are locals stored?", "In the subroutine's stack frame."],
    ["Two reasons to use locals?", "Subroutine is self-contained; memory is reused when not in use (also: names reusable, fewer side-effects)."],
    ["Same name in two subroutines?", "Allowed — both local, so different scopes."],
    ["Block scope in C#?", "A variable declared inside { } (e.g. a for loop's i) exists only in that block."],
    ["Local hides a field?", "Inside the method the name refers to the local; the field is unchanged."],
    ["Is a parameter a local variable?", "It behaves like one (same scope and lifetime), but exam answers asking for a local want a DECLARED variable."]
  ],
  quiz: [
    { q: "A local variable exists", opts: ["only while its subroutine is executing", "for the whole program run", "only at compile time", "until the computer is switched off"], ans: 0, why: "Lifetime of one call." },
    { q: "Two subroutines can both declare total because", opts: ["each is local, with a different scope", "C# merges them", "the second overwrites the first", "they are global"], ans: 0, why: "AS 2016 Q08.5." },
    { q: "Which is NOT a reason to use local variables?", opts: ["they can be read from anywhere in the program", "they make subroutines self-contained", "memory is reused", "fewer side-effects"], ans: 0, why: "That describes globals." },
    { q: "for (int i = 0; …) {…} Console.WriteLine(i); in C#", opts: ["does not compile — i is out of scope", "prints the last i", "prints 0", "prints nothing"], ans: 0, why: "Block scope." }
  ]
};

/* =====================================================================
   4.1.1.14  Global variables in a programming language
   ===================================================================== */
C["compsci:4.1.1.14"] = {
  notes: [
    { h: "Global variables — the whole topic on one page" },
    "Spec 4.1.1.14: be able to **contrast local variables with global variables**. A global variable is declared outside every subroutine (in the main program block) and can be used anywhere, for the whole run.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["One difference between global and local", "Describe", "2", "AS 2023 Q03"],
      ["Two differences", "State", "2", "AS 2024 Q02.1"],
      ["The difference", "Explain", "1", "A-level 2019 Q09.4"],
      ["Difference as part of a 3-mark question", "State", "1 of 3", "AS 2019 Q01 (see 4.1.1.13)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Globals in C#**.", "**Local vs global**.", "**The problem with globals**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Globals in C#" },
    "C# has no variables outside a class. The equivalent of a global is a **static field** of a class: one copy, visible to every method that can see the class, alive for the whole run.",
    { code: { lang: "csharp", src: "static class Counter\n{\n    public static int Total;          // 'global': one copy for the whole program\n}\n\nstatic void AddScore(int points)\n{\n    Counter.Total = Counter.Total + points;   // reads and CHANGES the global\n}\n\nCounter.Total = 0;\nAddScore(10);\nAddScore(5);\nConsole.WriteLine(Counter.Total);     // 15", cap: "Checked: prints 15. Every call changes shared state — that is the side-effect." } },
    { code: { lang: "csharp", src: "// the same job without a global: data in through a parameter, out through return\nstatic int AddScore(int total, int points)\n{\n    return total + points;\n}\n\nint total = 0;\ntotal = AddScore(total, 10);\ntotal = AddScore(total, 5);   // 15 — and AddScore can be tested on its own", cap: "Replacing a global with a parameter and a return value." } },
    scopeFig("The global (static field) is visible inside every subroutine; each subroutine's locals are visible only inside it."),

    { page: "Local vs global" },
    { table: { head: [" ", "Local variable", "Global variable"], rows: [
      ["Declared", "inside a subroutine / block", "in the main program block / outside all subroutines (C#: a static field)"],
      ["Scope", "only that subroutine / block", "the whole program"],
      ["Lifetime", "only while the subroutine executes", "the entire time the program runs"],
      ["Memory", "in the stack frame; reused after return", "allocated for the whole run, usually elsewhere in memory"],
      ["Same name elsewhere?", "yes — in other subroutines", "no — one per program"],
      ["Risk", "low", "side-effects: any subroutine can change it"]
    ] } },

    { page: "The problem with globals" },
    { ul: [
      "**Side-effects**: a subroutine changes a value that other parts of the program depend on — the change is invisible at the call.",
      "**Harder to debug**: if a global is wrong, ANY subroutine might have changed it.",
      "**Harder to test**: a subroutine using a global cannot be tested alone — the global must be set up first.",
      "**Harder to reuse**: the subroutine cannot be copied into another program without its globals.",
      "**Memory**: held for the whole run even when not needed.",
      "**When they are reasonable**: true constants (const), and data genuinely shared by the whole program — but pass it as a parameter where you can."
    ] },
    { callout: { t: "warn", h: "Misconception", body: "\"Global variables are faster so they are better.\" — any saving is trivial; AQA's answers all favour locals and parameters. A global CONSTANT is fine, because it cannot be changed." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "One difference, described", src: "AS June 2023 · P1 Q03 · 2 marks",
      q: "Describe one difference between a global variable and a local variable.",
      steps: [
        { m: "A global variable can be used anywhere in the program // is declared in the outermost block / outside subroutines;", mk: "1" },
        { m: "A local variable can only be used in the block / subroutine in which it is declared;", mk: "1", n: "Alternative: locals only use memory/exist while their block executes; globals use memory/exist the entire time. A. locals stored in a stack frame, globals elsewhere. BOTH sides of ONE difference are needed for 2." }
      ], result: "Global: anywhere. Local: only its subroutine" } },
    { worked: { tag: "exam", title: "Two differences, stated", src: "AS June 2024 · P1 Q02.1 · 2 marks",
      q: "A program uses both local and global variables. State two differences between local and global variables.",
      steps: [
        { m: "Global variables are accessible to all parts of the program // local variables only in the block/subroutine in which they are declared;", mk: "1" },
        { m: "Local variables are declared in a subroutine // global variables in the main program block / outside subroutines;", mk: "1" },
        { m: "Local variables only use memory / exist while the subroutine executes;", mk: "(1)", n: "Max 2 — each must be a DIFFERENT difference (accessibility, declaration, lifetime)." }
      ], result: "Accessibility + where declared" } },
    { worked: { tag: "exam", title: "Explain the difference", src: "A-level June 2019 · P1 Q09.4 · 1 mark",
      q: "Explain the difference between a local variable and a global variable.",
      steps: [{ m: "Global variables can be accessed from any part of the program; local variables can only be accessed in a part/block/subroutine of the program // global variables exist throughout the whole program; local variables only in a part of it;", mk: "1" }],
      result: "Any part vs one subroutine" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Difference questions**: give BOTH sides — \"global: …; local: …\".",
      "**Three axes**: accessibility (scope), where declared, lifetime/memory.",
      "**Why avoid globals**: side-effects, harder to test/debug/reuse.",
      "**In C#**: a global is a static field; prefer parameters and return values."
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.13 local variables; 4.1.1.11 parameters as the alternative; 4.1.1.6 named constants are the acceptable global; 4.12 functional programming forbids side-effects altogether; 4.1.2.3 static vs instance fields." } }
  ],
  flashcards: [
    ["Global variable?", "Declared outside all subroutines; accessible anywhere; exists for the whole run."],
    ["Global in C#?", "A static field of a class."],
    ["Difference: scope?", "Global: whole program. Local: only its subroutine/block."],
    ["Difference: lifetime?", "Global: the whole run. Local: only while its subroutine executes."],
    ["Difference: where declared?", "Global: main block/outside subroutines. Local: inside a subroutine."],
    ["Side-effect?", "A subroutine changing data outside itself (e.g. a global) — not visible at the call."],
    ["Why are globals harder to debug?", "Any subroutine might have changed the value."],
    ["Acceptable global?", "A named constant — it cannot change."]
  ],
  quiz: [
    { q: "A global variable", opts: ["can be accessed from any part of the program", "exists only during one call", "must be passed as a parameter", "is stored in a stack frame"], ans: 0, why: "Whole-program scope." },
    { q: "In C#, the nearest equivalent of a global is", opts: ["a static field", "a local in Main", "a ref parameter", "a const in a method"], ans: 0, why: "One shared copy." },
    { q: "A 2-mark 'describe one difference' needs", opts: ["both the global side and the local side", "two different differences", "a code example", "a definition of variable"], ans: 0, why: "AS 2023 Q03." },
    { q: "Main danger of global variables", opts: ["unintended side-effects", "they cannot hold strings", "they are slower to declare", "they cannot be initialised"], ans: 0, why: "Any code can change them." }
  ]
};

/* =====================================================================
   4.1.1.15  Role of stack frames in subroutine calls
   ===================================================================== */
function frameFig() {
  var it = [], frames = [["Factorial(1)", "n = 1 · returns 1", "danger"], ["Factorial(2)", "n = 2 · waiting: 2 * Factorial(1)", "accent2"], ["Factorial(3)", "n = 3 · waiting: 3 * Factorial(2)", "accent2"], ["Main", "result = Factorial(3)", "text2"]];
  frames.forEach(function (f, i) { it = it.concat(boxAt(30, 30 + i * 52, 280, 46, f[0], f[2], f[1])); });
  it = it.concat(arrow(372, 53, 312, 53, null, { c: "danger" }));
  it.push(txt(365, 38, "top of stack", { size: 10.5, c: "danger" }));
  it.push(txt(170, 250, "push a frame on each call ↑ · pop it on each return ↓", { size: 10.5, c: "text2" }));
  /* the anatomy of one frame */
  it.push(txt(520, 30, "One stack frame holds", { b: true, size: 11.5, c: "text" }));
  [["return address", "where to continue in the caller"], ["parameters", "the arguments passed in"], ["local variables", "a fresh set per call"], ["saved register values", "restored on return"]].forEach(function (r, i) {
    it = it.concat(boxAt(420, 44 + i * 50, 200, 44, r[0], "good", r[1]));
  });
  return { fig: { w: 640, h: 262, items: it, cap: "The call stack at the deepest point of Factorial(3): four frames. Each frame is popped as its call returns: 1, then 2 × 1, then 3 × 2." } };
}
C["compsci:4.1.1.15"] = {
  notes: [
    { h: "Stack frames — the whole topic on one page" },
    "Spec 4.1.1.15: be able to explain how a **stack frame** is used with subroutine calls to store **return addresses, parameters and local variables**. Each call pushes a frame onto the **call stack**; each return pops it.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Components of a stack frame", "State two", "2", "A-level 2018 Q02.5, A-level 2021 Q02.6"],
      ["How a stack is used for subroutine calls / recursion", "Explain / describe", "2–4", "synoptic with 4.2.3.1 and 4.1.1.16"],
      ["Local vs global storage", "Describe", "1 of 2", "AS 2023 Q03 (A. locals stored in a stack frame)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The call stack**.", "**What happens on a call and a return**.", "**Stack overflow**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The call stack" },
    { callout: { t: "def", h: "Stack frame", body: "The block of data pushed onto the **call stack** each time a subroutine is called. It holds the **return address**, the **parameters**, the **local variables** and saved **register values**, and is popped when the subroutine returns." } },
    frameFig(),
    { kv: [
      ["Why a STACK", "the most recently called subroutine is always the first to finish — last in, first out"],
      ["Return address", "the address of the instruction after the call, so execution resumes in the right place"],
      ["Parameters", "the values (or addresses, for by-reference) the caller passed"],
      ["Local variables", "a fresh set for every call — so recursive calls do not overwrite each other"],
      ["Register values", "the caller's working registers, saved so they can be restored"]
    ] },
    { callout: { t: "tip", h: "Mnemonic — RPLR", body: "**R**eturn address · **P**arameters · **L**ocal variables · **R**egisters: \"Real Programmers Love Recursion\"." } },

    { page: "What happens on a call and a return" },
    { steps: [
      "**Call**: push a frame: the return address, the parameters, space for the locals (and saved registers).",
      "Jump to the subroutine's first instruction; it uses the TOP frame for its parameters and locals.",
      "A further call from inside pushes another frame on top — the caller's frame waits underneath.",
      "**Return**: the return value is passed back; the frame is popped; registers are restored; execution jumps to the saved return address.",
      "The caller's frame is now on top again, with its locals exactly as it left them."
    ] },
    { code: { lang: "csharp", src: "static int Factorial(int n)\n{\n    if (n <= 1) return 1;            // base case: no new frame\n    return n * Factorial(n - 1);     // this frame waits for the call above it\n}\n\nint result = Factorial(3);           // 6", cap: "Factorial(3) pushes frames for n = 3, 2, 1 (four with Main); they pop in the order 1, 2, 3. Checked: Factorial(5) = 120." } },
    { worked: { tag: "variation", title: "The stack at the deepest point", q: "Factorial(4) is called from Main. How many frames are on the call stack at its deepest point, and in what order are values returned?",
      steps: [
        { m: "Frames: Main, Factorial(4), Factorial(3), Factorial(2), Factorial(1) — 5 frames.", mk: "1" },
        { m: "Factorial(1) returns 1 (base case); its frame is popped.", mk: "1" },
        { m: "Then 2 × 1 = 2, 3 × 2 = 6, 4 × 6 = 24 — each frame popped in turn, last in first out.", mk: "1" }
      ], result: "5 frames; returns 1, 2, 6, 24" } },
    { diagram: "recursion-viz" },

    { page: "Stack overflow" },
    { kv: [
      ["Stack overflow", "the call stack's fixed memory is used up — too many frames, usually because recursion never reaches its base case"],
      ["In C#", "a StackOverflowException CANNOT be caught: the .NET process is terminated — the only fix is a reachable base case (or iteration)"],
      ["Iteration vs recursion", "a loop uses ONE frame however many times it repeats; recursion uses one frame per call"]
    ] },
    { worked: { tag: "variation", title: "Why does this crash?", q: "static int Count(int n) { return Count(n - 1) + 1; } — explain what happens when Count(5) is called.",
      steps: [
        { m: "There is no base case, so every call makes another call.", mk: "1" },
        { m: "Each call pushes a stack frame that is never popped.", mk: "1" },
        { m: "The stack runs out of memory → stack overflow; in .NET the program is terminated.", mk: "1", n: "Fix: if (n == 0) return 0; before the recursive call." }
      ], result: "Stack overflow — no base case" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Two components of a stack frame", src: "A-level June 2018 · P1 Q02.5 · 2 marks",
      q: "Stacks are also used to store a stack frame each time a subroutine call is made. State two components of a stack frame.",
      steps: [
        { m: "Return address;", mk: "1" },
        { m: "Local variables;", mk: "1", n: "Also: parameters; register values (A. an example of a register that would be in the frame). Max 2." }
      ], result: "Return address · local variables" } },
    { worked: { tag: "exam", title: "Stack frames in a recursive traversal", src: "A-level June 2021 · P1 Q02.6 · 2 marks",
      q: "A binary-tree traversal subroutine was written with iteration and its own stack. If it had been written using recursion, a stack frame would have been stored each time a recursive subroutine call was made. State two components of a stack frame.",
      steps: [
        { m: "Parameters;", mk: "1" },
        { m: "Return address;", mk: "1", n: "Also: local variables; register values. Max 2." }
      ], result: "Parameters · return address" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Components**: return address, parameters, local variables, register values (any two).",
      "**Push on call, pop on return** — LIFO, because the latest call finishes first.",
      "**Recursion**: one frame per call — each call has its own locals; too many → stack overflow.",
      "Don't answer \"the subroutine's code\" — code is not stored in the frame."
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.3.1 stacks (push/pop, stack overflow); 4.1.1.16 recursion; 4.1.1.13 local variables live in the frame; 4.7.3.6 interrupts save the processor's registers in the same way; 4.7.3.2 the program counter and the return address." } }
  ],
  flashcards: [
    ["Stack frame?", "Data pushed onto the call stack for each subroutine call: return address, parameters, local variables, register values."],
    ["Return address?", "Where execution continues in the caller after the subroutine finishes."],
    ["Why a stack?", "The most recent call is the first to finish — LIFO."],
    ["What happens on return?", "The frame is popped, registers restored, and execution jumps to the return address."],
    ["Frames for Factorial(3) from Main at the deepest point?", "4 — Main, Factorial(3), (2), (1)."],
    ["Stack overflow?", "The call stack runs out of space — usually recursion with no reachable base case."],
    ["Can C# catch a StackOverflowException?", "No — the process is terminated."],
    ["Why can recursion keep separate values per call?", "Each call has its own frame with its own locals and parameters."],
    ["Mnemonic for the components?", "RPLR — Return address, Parameters, Locals, Registers."]
  ],
  quiz: [
    { q: "Which is NOT stored in a stack frame?", opts: ["the subroutine's program code", "the return address", "parameters", "local variables"], ans: 0, why: "Code lives elsewhere in memory." },
    { q: "When a subroutine returns, its frame is", opts: ["popped from the stack", "pushed again", "moved to the heap", "kept until the program ends"], ans: 0, why: "LIFO." },
    { q: "Recursion with no base case causes", opts: ["stack overflow", "a syntax error", "an infinite but harmless loop", "a compile-time warning only"], ans: 0, why: "Frames pile up." },
    { q: "A loop repeating 1000 times uses", opts: ["one stack frame", "1000 stack frames", "no memory", "a frame per iteration"], ans: 0, why: "Iteration stays in one call." }
  ]
};

/* =====================================================================
   4.1.1.16  Recursive techniques
   ===================================================================== */
function fibTree() {
  var N = [[320, 26, "F(5)", "text2"], [180, 80, "F(4)", "text2"], [460, 80, "F(3)", "danger"], [100, 136, "F(3)", "danger"], [250, 136, "F(2)", "accent2"], [400, 136, "F(2)", "accent2"], [520, 136, "F(1)", "good"], [50, 192, "F(2)", "accent2"], [150, 192, "F(1)", "good"]];
  var E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [3, 8]];
  var it = E.map(function (e) { return edge(N[e[0]][0], N[e[0]][1] + 17, N[e[1]][0], N[e[1]][1] - 17); });
  N.forEach(function (n) { it = it.concat(node(n[0], n[1], n[2], n[3], 18)); });
  it.push(txt(440, 196, "9 calls for F(5) · 109 for F(10) · 1,664,079 for F(30)", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 222, items: it, cap: "The call tree of the naive recursive Fibonacci. F(3) is worked out twice and F(2) three times: each call makes two more, so the work grows exponentially." } };
}
function bstFig() {
  var P = { Norbert: [320, 26], Judith: [180, 86], Phil: [460, 86], Caspar: [100, 146], Mary: [260, 146], Tahir: [540, 146] };
  var it = [edge(320, 40, 180, 72), edge(320, 40, 460, 72, "accent2"), edge(180, 100, 100, 132), edge(180, 100, 260, 132), edge(460, 100, 540, 132)];
  Object.keys(P).forEach(function (k) {
    var on = k === "Norbert" || k === "Phil";
    it = it.concat(boxAt(P[k][0] - 40, P[k][1] - 14, 80, 28, k, on ? "accent2" : "accent"));
  });
  it.push(txt(320, 182, "Olivia > Norbert → Phil; Olivia < Phil, no left child → False", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 200, items: it, cap: "AQA 2017's binary search tree (Norbert, Phil, Judith, Mary, Caspar, Tahir inserted in that order). The search for Olivia visits only Norbert and Phil." } };
}
C["compsci:4.1.1.16"] = {
  notes: [
    { h: "Recursive techniques — the whole topic on one page" },
    "Spec 4.1.1.16: be familiar with the use of **recursive techniques** in programming languages (general and **base cases**, and the mechanism for implementation); be able to **solve simple problems using recursion**. A-level only.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What is a recursive subroutine?", "What is meant / explain", "1", "A-level 2017 Q04.1, 2021 Q02.4, 2022 Q04.2"],
      ["Base case — define, or state one for given code", "Explain / state / describe", "1", "A-level 2017 Q04.2, 2021 Q02.5, 2025 Q03.4"],
      ["Trace recursive calls in a table", "Complete the table", "3–6", "A-level 2017 Q04.3, 2022 Q04.5, 2025 Q03.5"],
      ["How a recursive function works", "Describe", "3", "A-level 2020 Paper 2 Q11.2"],
      ["Why naive recursion is inefficient", "Explain", "2", "A-level 2025 Paper 2 Q11.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Base case and general case**.", "**How recursion runs**.", "**Recursion vs iteration**.", "**Recursive algorithms you must know**.", "**Tracing recursion in exams**.", "**Exam toolkit**."] },

    { page: "Base case and general case" },
    { callout: { t: "def", h: "Recursive subroutine", body: "A subroutine that **calls itself**. It must have a **base case** — the circumstance in which it does NOT call itself — and a **general (recursive) case** that calls itself on a smaller problem, so every chain of calls eventually reaches the base case." } },
    { code: { lang: "csharp", src: "static int Factorial(int n)\n{\n    if (n <= 1) return 1;              // BASE CASE: stops the recursion\n    return n * Factorial(n - 1);       // GENERAL CASE: a smaller problem\n}\n\nstatic int SumList(List<int> xs)       // total [] = 0; total (x:xs) = x + total xs\n{\n    if (xs.Count == 0) return 0;                       // base case: empty list\n    return xs[0] + SumList(xs.GetRange(1, xs.Count - 1));   // head + total of tail\n}\n\nstatic long Power(long b, int e) => e == 0 ? 1 : b * Power(b, e - 1);", cap: "Checked: Factorial(5) = 120, SumList([3, 4, 5]) = 12, Power(2, 10) = 1024." } },
    { callout: { t: "tip", h: "Mnemonic — BGU", body: "**B**ase case stops it · **G**eneral case moves TOWARDS the base case · **U**nwind: the results are combined as each call returns." } },

    { page: "How recursion runs" },
    { steps: [
      "**Winding**: each call pushes a stack frame (4.1.1.15) with its own parameters and locals, then waits on the call it made.",
      "**Base case**: the deepest call returns a value without calling again.",
      "**Unwinding**: each waiting call receives the result, finishes its own calculation and returns — in reverse order of the calls."
    ] },
    { table: { head: ["Call", "Waits for", "Returns"], rows: [
      ["Factorial(4)", "4 × Factorial(3)", "4 × 6 = 24"],
      ["Factorial(3)", "3 × Factorial(2)", "3 × 2 = 6"],
      ["Factorial(2)", "2 × Factorial(1)", "2 × 1 = 2"],
      ["Factorial(1)", "— base case", "1"]
    ] } },
    { diagram: "recursion-viz" },

    { page: "Recursion vs iteration" },
    { table: { head: [" ", "Recursion", "Iteration"], rows: [
      ["Repeats by", "calling itself", "a loop"],
      ["Stops when", "the base case is reached", "the loop condition fails"],
      ["Memory", "one stack frame PER CALL — can overflow", "one frame however many repeats"],
      ["Speed", "slower: call/return overhead", "usually faster"],
      ["Natural for", "trees, graphs (DFS), divide and conquer (merge sort), nested structures", "counting, simple repetition"],
      ["Code", "often shorter and closer to the definition", "may need an explicit stack (A-level 2021's Traversal)"]
    ] } },
    fibTree(),
    { code: { lang: "csharp", src: "// naive: exponential — every call makes two more\nstatic long Fib(int n) => n <= 2 ? 1 : Fib(n - 1) + Fib(n - 2);\n\n// memoised: each value computed once — linear\nstatic long FibMemo(int n, Dictionary<int, long> memo)\n{\n    if (n <= 2) return 1;\n    if (memo.TryGetValue(n, out long known)) return known;\n    long value = FibMemo(n - 1, memo) + FibMemo(n - 2, memo);\n    memo[n] = value;\n    return value;\n}", cap: "Checked: Fib(10) makes 109 calls, Fib(30) 1,664,079; FibMemo(50) = 12586269025 with only 48 stored values." } },

    { page: "Recursive algorithms you must know" },
    { code: { lang: "csharp", src: "// pre-order traversal of A-level 2021's array tree (Data, Dir1 = left, Dir2 = right, −1 = none)\nstring[] data = { \"C\", \"I\", \"E\", \"H\", \"B\", \"Y\", \"Q\" };\nint[] dir1 = { 1, 2, -1, -1, 5, -1, -1 };\nint[] dir2 = { 4, 3, -1, -1, 6, -1, -1 };\n\nvoid PreOrder(int node)\n{\n    if (node == -1) return;            // base case: empty subtree\n    Console.Write(data[node] + \" \");   // visit\n    PreOrder(dir1[node]);              // left\n    PreOrder(dir2[node]);              // right\n}\nPreOrder(0);                           // C I E H B Y Q\n\n// recursive binary search on a sorted array\nstatic int BSearch(int[] a, int target, int lo, int hi)\n{\n    if (lo > hi) return -1;                      // base case: not found\n    int mid = (lo + hi) / 2;\n    if (a[mid] == target) return mid;            // base case: found\n    return target < a[mid] ? BSearch(a, target, lo, mid - 1)\n                           : BSearch(a, target, mid + 1, hi);\n}", cap: "The recursive version of 2021's iterative Traversal gives the same pre-order output. BSearch([3,8,12,19,25,31,40], 25) = 4; searching for 5 gives −1." } },
    { worked: { tag: "variation", title: "Write it recursively", q: "Write a recursive C# function Reverse(string s) and trace Reverse(\"cat\").",
      steps: [
        { m: "Base case: if (s.Length <= 1) return s;", mk: "1" },
        { m: "General case: return Reverse(s.Substring(1)) + s[0]; — reverse the tail, then put the head at the end.", mk: "1" },
        { m: "Reverse(\"cat\") = Reverse(\"at\") + 'c' = (Reverse(\"t\") + 'a') + 'c' = \"t\" + \"a\" + \"c\".", mk: "1", n: "Checked: Reverse(\"stack\") = \"kcats\"." }
      ], result: "\"tac\"" } },
    { worked: { tag: "variation", title: "Euclid's GCD", q: "Gcd(a, b) = a if b = 0, otherwise Gcd(b, a MOD b). Trace Gcd(48, 18) and identify the base case.",
      steps: [
        { m: "Gcd(48, 18) → Gcd(18, 48 MOD 18 = 12)", mk: "1" },
        { m: "→ Gcd(12, 18 MOD 12 = 6) → Gcd(6, 12 MOD 6 = 0)", mk: "1" },
        { m: "b = 0 is the base case: return 6, passed back unchanged through every call.", mk: "1" }
      ], result: "6" } },

    { page: "Tracing recursion in exams" },
    { steps: [
      "Write ONE row per call, in the order the calls are made — a new call goes on a new row even if it is \"inside\" the previous one.",
      "When a call returns to its caller, AQA's tables often repeat the caller's name on a later row to show where it continues (2022 Q04.5, 2025 Q03.5).",
      "Arrays shared by every call (Visited, V) are one set of columns: once a cell is set, it STAYS set.",
      "Stop at the first return of True if the code returns as soon as a call succeeds — no extra calls (\"Max 2 if any additional calls\")."
    ] },
    bstFig(),
    { worked: { tag: "exam", title: "What is a recursive subroutine?", src: "A-level June 2017 · P1 Q04.1 · 1 mark",
      q: "What is meant by a recursive subroutine?",
      steps: [{ m: "A subroutine that calls itself;", mk: "1" }],
      result: "A subroutine that calls itself" } },
    { worked: { tag: "exam", title: "A base case of TreeSearch", src: "A-level June 2017 · P1 Q04.2 · 1 mark",
      q: "FUNCTION TreeSearch(target, node): OUTPUT 'Visited ', node; IF target = node THEN RETURN True; ELSE IF target > node AND Exists(node, right) THEN RETURN TreeSearch(target, node.right); ELSE IF target < node AND Exists(node, left) THEN RETURN TreeSearch(target, node.left); ENDIF; RETURN False. There are two base cases for the subroutine TreeSearch. State one of the base cases.",
      steps: [{ m: "When target equals node // (when target does not equal node and) node is a leaf / there is no child in the required direction;", mk: "1" }],
      result: "target = node" } },
    { worked: { tag: "exam", title: "Trace TreeSearch(Olivia, Norbert)", src: "A-level June 2017 · P1 Q04.3 · 3 marks",
      q: "Norbert, Phil, Judith, Mary, Caspar and Tahir were entered, in that order, into a binary search tree (Norbert is the root; Judith.left is Caspar, Judith.right is Mary, Phil.right is Tahir). Using the TreeSearch function above, complete a table with columns Function call and Output to show the result of the call TreeSearch(Olivia, Norbert).",
      steps: [
        { m: "TreeSearch(Olivia, Norbert) — output (Visited) Norbert;", mk: "1" },
        { m: "Olivia > Norbert and Norbert has a right child: TreeSearch(Olivia, Phil);", mk: "1" },
        { m: "Output (Visited) Phil; — Olivia < Phil but Phil has no left child, so RETURN False;", mk: "1", n: "MAX 2 if any additional outputs or calls after Phil. Run in C#: \"Visited Norbert; Visited Phil;\" → False." }
      ], result: "Visited Norbert, Visited Phil → False" } },
    { worked: { tag: "exam", title: "Base case defined", src: "A-level June 2021 · P1 Q02.5 · 1 mark",
      q: "Explain what is meant by a base case for a recursive subroutine.",
      steps: [{ m: "The circumstance(s) in which a recursive subroutine does not call itself;", mk: "1" }],
      result: "When it does not call itself" } },
    { worked: { tag: "exam", title: "Trace the cycle finder G", src: "A-level June 2022 · P1 Q04.5 · 6 marks",
      q: "FUNCTION G(V, P): Visited[V] ← True; FOR EACH N IN ConnectedNodes[V]: IF Visited[N] = False THEN IF G(N, V) = True THEN RETURN True ENDIF; ELSE IF N ≠ P THEN RETURN True ENDIF; ENDFOR; RETURN False. The graph has edges 0–1, 0–2, 0–3 and 1–3, so ConnectedNodes[0] = [1, 2, 3], [1] = [0, 3], [2] = [0], [3] = [0, 1]. Visited starts all False. Complete a table with columns Subroutine call, V, P, Visited[0]–[3] and N to show the result of the call G(0, −1).",
      steps: [
        { m: "Visited[0] set to True and then not changed;", mk: "1" },
        { m: "Visited[1] and Visited[3] set to True and not changed; Visited[2] always False;", mk: "1" },
        { m: "Second call is G(1, 0) (from N = 1);", mk: "1" },
        { m: "Third and final call is G(3, 1) (in G(1, 0), N = 0 is visited but equals P, so N = 3);", mk: "1" },
        { m: "Value returned is True (in G(3, 1), N = 0 is visited and 0 ≠ P = 1 — a cycle 0–1–3–0);", mk: "1" },
        { m: "N column: 1; 0, 3; 0; then 3 and 1 as G(1, 0) and G(0, −1) return;", mk: "1", n: "Max 5 if any errors. Checked by running G in C#." }
      ], result: "G(0,−1) → G(1,0) → G(3,1); returns True" } },
    { table: { head: ["Call", "V", "P", "[0]", "[1]", "[2]", "[3]", "N"], rows: [
      ["", "", "", "False", "False", "False", "False", ""],
      ["G(0, −1)", "0", "−1", "True", "", "", "", "1"],
      ["G(1, 0)", "1", "0", "", "True", "", "", "0"],
      ["", "", "", "", "", "", "", "3"],
      ["G(3, 1)", "3", "1", "", "", "", "True", "0"],
      ["G(1, 0)", "", "", "", "", "", "", "3"],
      ["G(0, −1)", "", "", "", "", "", "", "1"],
      ["Final value returned: True", "", "", "", "", "", "", ""]
    ] } },
    { worked: { tag: "exam", title: "A base case of Traverse", src: "A-level June 2025 · P1 Q03.4 · 1 mark",
      q: "SUBROUTINE Traverse(start, end): IF start = end THEN RETURN True END IF; V[start] = 1; FOR i = 1 TO LENGTH(AL[start]): IF V[AL[start][i]] = 0 THEN IF Traverse(AL[start][i], end) = True THEN RETURN True … END FOR; RETURN False. Describe one of the base cases for the recursive subroutine Traverse.",
      steps: [{ m: "The start and end nodes are the same // there are no unvisited nodes in the graph that can be reached from the start node;", mk: "1", n: "NE. code without a description — say it in words." }],
      result: "start = end" } },
    { worked: { tag: "exam", title: "Trace IsPath(3, 7)", src: "A-level June 2025 · P1 Q03.5 · 6 marks",
      q: "The adjacency list AL is: 1 → [2, 3, 7], 2 → [1, 6], 3 → [1, 6, 7], 4 → [5], 5 → [4], 6 → [2, 3], 7 → [1, 3]. IsPath(start, end) sets V[j] = 0 for j = 1 TO 7, then FOR j = 1 TO 7: IF V[j] = 0 THEN IF Traverse(start, end) = True THEN RETURN True. Traverse is as above. Complete a table with columns j, V[1]–V[7], Subroutine call to Traverse, and i, for the call IsPath(3, 7).",
      steps: [
        { m: "j has values 1 to 7 (setting V to 0), then 1;", mk: "1" },
        { m: "All values of V set to 0;", mk: "1" },
        { m: "First call is Traverse(3, 7); first i is 1; V[3] set to 1;", mk: "1" },
        { m: "Second and third calls: Traverse(1, 7) (V[1] = 1, i = 1), Traverse(2, 7) (V[2] = 1, i = 1 then 2);", mk: "1" },
        { m: "Remaining calls: Traverse(6, 7) (V[6] = 1; i = 1, 2 — both neighbours visited, returns False); back in Traverse(2, 7) then Traverse(1, 7), i = 2, 3; Traverse(7, 7) returns True;", mk: "1" },
        { m: "Final V: 1, 1, 1, 0, 0, 1, 0 (V[7] is never set — Traverse(7, 7) returns before it);", mk: "1", n: "Max 5 if any errors. Checked by running: calls 3, 1, 2, 6, 7 → True." }
      ], result: "Traverse 3 → 1 → 2 → 6, back, → 7: True" } },
    { fig: { w: 640, h: 190, items: [].concat(
      [link(80, 50, 200, 30), link(80, 50, 200, 120), link(80, 50, 80, 150), link(200, 30, 330, 75), link(200, 120, 330, 75), link(200, 120, 80, 150), link(470, 75, 580, 75)],
      node(80, 50, "1", "accent2"), node(200, 30, "2", "accent2"), node(200, 120, "3", "accent2"), node(80, 150, "7", "good"), node(330, 75, "6", "accent2"), node(470, 75, "4"), node(580, 75, "5"),
      [txt(440, 140, "visit order from 3: 3 → 1 → 2 → 6 (dead end) → back → 7 ✓", { size: 10.5, c: "text2" }),
        txt(440, 160, "4–5 is a separate component: IsPath(4, 7) is False", { size: 10.5, c: "text2" })]
    ), cap: "A-level 2025's graph, drawn from the adjacency list. Traverse is a depth-first search that stops at the first path found." } },
    { worked: { tag: "exam", title: "How total works", src: "A-level June 2020 · P2 Q11.2 · 3 marks",
      q: "total [] = 0; total (x:xs) = x + total (xs). [] is the empty list; (x:xs) splits a list into its head x and tail xs. Describe how the total function works to add up all of the numbers in a list.",
      steps: [
        { m: "The function is recursive // it calls itself with the tail of the list;", mk: "1" },
        { m: "It splits the list into the head and the tail, and each call adds the head to the total of the tail;", mk: "1" },
        { m: "The recursion terminates when the list is empty (by returning 0);", mk: "1", n: "Max 3. C# twin: SumList above." }
      ], result: "head + total(tail); [] → 0" } },
    { worked: { tag: "exam", title: "Why naive Fibonacci is inefficient", src: "A-level June 2025 · P2 Q11.3 · 2 marks",
      q: "fibonacci 1 = 1; fibonacci 2 = 1; fibonacci n = fibonacci (n − 1) + fibonacci (n − 2). Explain why the recursive method used by this code is not an efficient method of calculating the nth term in the Fibonacci sequence.",
      steps: [
        { m: "Each application of the function generates two further applications of the same function;", mk: "1" },
        { m: "The function is applied to the same argument multiple times // the same values are calculated many times;", mk: "1" },
        { m: "The number of applications / memory grows exponentially — O(2ⁿ);", mk: "(1)", n: "Max 2. R. answers about the PROBLEM rather than the function." }
      ], result: "Two calls each; repeats work; exponential" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Define**: a subroutine that calls itself. **Base case**: when it does not call itself.",
      "**State a base case** from the given code in WORDS (\"start and end are the same\"), not just code.",
      "**Trace**: one row per call in call order; shared arrays keep their values; stop at the first successful return.",
      "**Efficiency**: one stack frame per call (overflow risk); naive double recursion repeats work — exponential.",
      "**Write recursion**: base case FIRST, then a call on a smaller problem."
    ] },
    { callout: { t: "warn", h: "Misconceptions", body: [
      "\"Recursion is always slower and worse.\" — it can be as efficient (merge sort, tree traversal) and far clearer; only CERTAIN recursions (naive Fibonacci) repeat work.",
      "\"Each call shares the same variables.\" — each call has its own parameters and locals in its own frame; only globals/shared arrays are shared.",
      "\"The base case is the first call.\" — it is the call that does NOT recurse."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.15 stack frames; 4.2.3.1 stacks; 4.3.1.1 depth-first graph traversal; 4.3.2.1 tree traversals; 4.3.4.2 binary search; 4.3.4.3 binary tree search; 4.3.5.2 merge sort; 4.12.3.1 list processing (head and tail); 4.4.4.3 exponential complexity." } }
  ],
  flashcards: [
    ["Recursive subroutine?", "A subroutine that calls itself."],
    ["Base case?", "The circumstance in which a recursive subroutine does not call itself."],
    ["General case?", "The part that calls itself on a smaller problem, moving towards the base case."],
    ["What if there is no reachable base case?", "Calls never stop → stack overflow."],
    ["How does each call keep its own values?", "Its own stack frame with its own parameters and locals."],
    ["Factorial base case?", "n ≤ 1 returns 1."],
    ["TreeSearch(Olivia, Norbert) outputs?", "Visited Norbert, Visited Phil — then returns False."],
    ["G(0, −1) on edges 0–1, 0–2, 0–3, 1–3?", "Calls G(1, 0) then G(3, 1); returns True (a cycle)."],
    ["Why is naive Fibonacci inefficient?", "Each call makes two more; the same values are recalculated; exponential O(2ⁿ)."],
    ["Fix for repeated work?", "Memoisation — store each result the first time (or iterate)."],
    ["Recursion vs iteration memory?", "Recursion: a frame per call. Iteration: one frame."],
    ["total (x:xs) = x + total xs — base case?", "total [] = 0, the empty list."]
  ],
  quiz: [
    { q: "A base case is", opts: ["when the subroutine does not call itself", "the first call", "the largest input", "the return address"], ans: 0, why: "AQA 2021 Q02.5." },
    { q: "Fib(5) with naive recursion makes how many calls?", opts: ["9", "5", "15", "25"], ans: 0, why: "1 + 5 + 3 (the two subtrees)." },
    { q: "Gcd(48, 18) by Euclid's recursion returns", opts: ["6", "18", "12", "3"], ans: 0, why: "48,18 → 18,12 → 12,6 → 6,0." },
    { q: "In IsPath(3, 7), V[7] ends as", opts: ["0 — Traverse(7, 7) returns before setting it", "1", "7", "undefined"], ans: 0, why: "start = end returns first." },
    { q: "Recursion is a natural fit for", opts: ["tree traversal", "printing 1 to 10", "reading one input", "swapping two variables"], ans: 0, why: "Trees are recursive structures." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
