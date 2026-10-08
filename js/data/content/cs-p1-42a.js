/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.2.1.1–
   4.2.1.4 (data structures; single- and multi-dimensional arrays; fields,
   records and files; abstract data types, static and dynamic structures)
   at full A-level depth, with every program in C#. Each topic REPLACES the
   entry cs-datastructures.js (4.2.1.1), cs-databases-sys.js (4.2.1.2,
   4.2.1.4) or cs-programming.js (4.2.1.3) carried. Every way AQA has
   examined them (7516/1 and 7517/1, June 2016–2025) is worked in the mark
   scheme's own format, and every C# listing was compiled and run under
   .NET 10 — the array traces (AS 2016's de-duplication, AS 2025's letter
   tree), the text and binary file round trips with their byte counts, and
   the linked-list insertion. */
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
/* a row of cells, optionally indexed underneath; hl = indices to highlight */
function cells(x, y, vals, o) {
  o = o || {};
  var it = [], w = o.w || 40, h = o.h || 30;
  vals.forEach(function (v, i) {
    var hl = o.hl && o.hl.indexOf(i) >= 0;
    it.push({ poly: [[x + i * w, y], [x + (i + 1) * w, y], [x + (i + 1) * w, y + h], [x + i * w, y + h]], fill: hl ? "accent2" : (o.col || "accent"), alpha: hl ? 0.32 : 0.12, c: hl ? "accent2" : (o.col || "accent"), w: 1.3 });
    it.push(txt(x + i * w + w / 2, y + h / 2, String(v), { b: true, size: o.size || 11.5, c: "text" }));
    if (o.idx !== false) it.push(txt(x + i * w + w / 2, y + h + 12, o.idx ? o.idx[i] : "[" + i + "]", { size: 10 }));
  });
  return it;
}

/* =====================================================================
   4.2.1.1  Data structures
   ===================================================================== */
C["compsci:4.2.1.1"] = {
  notes: [
    { h: "Data structures — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.2.1.1)", body: "Be familiar with the **concept of data structures**. A data structure is a way of **organising and storing related data** in memory so it can be used efficiently — and the choice of structure decides which operations are fast, which are slow and how much memory is used." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Name the data structure an algorithm implements", "State", "1", "A-level 2024 Q06.4"],
      ["Data abstraction", "Explain", "1", "AS 2025 Q05 (worked in 4.4.1.7)"],
      ["Static vs dynamic", "Explain the differences", "2", "A-level 2017 Q05.5 (more in 4.2.1.4)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What a data structure is**.", "**The map of Paper 1's structures**.", "**Static and dynamic in memory**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What a data structure is" },
    { callout: { t: "def", h: "Data structure", body: "A **collection of related data items** held in memory together with the **organisation** that relates them (by index, by key, by pointer, by position) and the **operations** allowed on them." } },
    { kv: [
      ["Everyday analogies", "a numbered row of lockers (array) · a queue at a till (queue) · a pile of plates (stack) · a family tree (tree) · a road map (graph) · an index at the back of a book (dictionary)"],
      ["Why choose carefully", "the same data in a different structure changes the cost of searching, inserting and deleting — a sorted array allows binary search, a hash table allows direct access"],
      ["Built-in vs abstract", "arrays and records are provided by the language; queues, stacks, trees and graphs are ABSTRACT data types built from them (4.2.1.4)"]
    ] },

    { page: "The map of Paper 1's structures" },
    { table: { head: ["Structure", "Organised by", "Typical use", "Spec"], rows: [
      ["Array (1-D, 2-D, n-D)", "integer index (a tuple of indices)", "lists of scores, game boards, matrices, vectors", "4.2.1.2"],
      ["Record / file", "named fields; records stored in a file", "one student's details; saved data", "4.2.1.3"],
      ["Queue", "FIFO — first in, first out", "print queues, buffers, simulations, BFS", "4.2.2.1"],
      ["Stack", "LIFO — last in, first out", "undo, call stack, RPN, DFS, reversing", "4.2.3.1"],
      ["Graph", "vertices joined by edges", "maps, networks, social links", "4.2.4.1"],
      ["Tree / binary tree", "rooted parent–child hierarchy", "binary search trees, file systems, expression trees", "4.2.5.1"],
      ["Hash table", "a hash of the key gives the position", "fast look-up by key, database indexes", "4.2.6.1"],
      ["Dictionary", "key → value pairs", "word counts, look-up tables, caches", "4.2.7.1"],
      ["Vector", "n numbers from one field", "positions, directions, game physics", "4.2.8.1"]
    ] } },
    { diagram: "tl-list" },

    { page: "Static and dynamic in memory" },
    { fig: { w: 640, h: 200, items: [].concat(
      [txt(150, 16, "Static: an array of 5", { b: true, size: 12, c: "text" }), txt(470, 16, "Dynamic: a linked list", { b: true, size: 12, c: "text" })],
      cells(50, 34, [12, 25, 53, "", ""], { w: 40, idx: ["1000", "1004", "1008", "1012", "1016"] }),
      [txt(150, 100, "consecutive addresses · size fixed in advance", { size: 10.5, c: "text2" }), txt(150, 118, "two cells reserved but unused", { size: 10.5, c: "danger" })],
      boxAt(340, 34, 70, 30, "12 | •", "good"), boxAt(450, 84, 70, 30, "25 | •", "good"), boxAt(560, 40, 70, 30, "53 | ∅", "good"),
      arrow(400, 49, 450, 92, null, { c: "good" }), arrow(510, 92, 560, 62, null, { c: "good" }),
      [txt(375, 78, "@3020", { size: 10 }), txt(485, 128, "@1460", { size: 10 }), txt(595, 84, "@5112", { size: 10 }),
        txt(470, 160, "nodes anywhere on the heap · each stores a pointer", { size: 10.5, c: "text2" }), txt(470, 178, "grows and shrinks one node at a time", { size: 10.5, c: "text2" })]
    ), cap: "A static structure reserves a fixed block of consecutive memory; a dynamic structure allocates nodes from the heap as needed and links them with pointers." } },
    { table: { head: [" ", "Static", "Dynamic"], rows: [
      ["Size", "fixed when created / at compile time", "grows and shrinks at run time"],
      ["Memory", "may waste space if under-filled; can fill up", "uses only what the data needs (plus pointers)"],
      ["Layout", "usually consecutive locations → direct access by index", "scattered nodes linked by pointers"],
      ["Overhead", "none", "memory for pointers; allocation time; risk of memory leaks"],
      ["C#", "int[] a = new int[5];", "List<int>, LinkedList<int>, Dictionary<K,V>"]
    ] } },
    { code: { lang: "csharp", src: "int[] fixedArr = new int[5];          // static: exactly 5 slots\nvar dyn = new List<int>();             // dynamic: starts empty\nfor (int i = 0; i < 7; i++) dyn.Add(i);   // grows to 7 — no limit set in advance\n\ntry { fixedArr[5] = 1; }               // a 6th item will not fit\ncatch (IndexOutOfRangeException) { Console.WriteLine(\"static full\"); }", cap: "Checked: fixed 5, dynamic 7, then \"static full\"." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Name the structure in the algorithm", src: "A-level June 2024 · P1 Q06.4 · 1 mark",
      q: "An algorithm walks a binary tree: Pos ← −1; WHILE Current ≠ −1: Pos ← Pos + 1; Temp[Pos] ← Current; Current ← Dir1[Current]; ENDWHILE; then OUTPUT Data[Temp[Pos]]; Current ← Dir2[Temp[Pos]]; Pos ← Pos − 1. State the type of data structure the algorithm implements using the array Temp.",
      steps: [{ m: "Stack // LIFO (data structure);", mk: "1", n: "Pos is the top pointer: Pos + 1 then store = push; read Temp[Pos] then Pos − 1 = pop." }],
      result: "A stack" } },
    { callout: { t: "info", h: "Worked elsewhere", body: "AS 2025 Q05 — \"Explain what is meant by data abstraction\" — is worked in full under 4.4.1.7 Data abstraction." } },
    { worked: { tag: "exam", title: "Static vs dynamic", src: "A-level June 2017 · P1 Q05.5 · 2 marks",
      q: "Explain the differences between static and dynamic data structures.",
      steps: [
        { m: "Static data structures have their storage size determined at compile time / before the program runs; dynamic data structures can grow and shrink during execution;", mk: "1" },
        { m: "Static structures can waste memory if few items are stored relative to their size, whereas dynamic structures only use the storage the data needs // dynamic structures need memory for pointers, static ones do not // static structures store data in consecutive locations, dynamic ones typically do not;", mk: "1", n: "NE. \"dynamic data structures use pointers\" — say they need MEMORY for pointers." }
      ], result: "Fixed at compile time vs grows at run time; wasted space vs pointer overhead" } },
    { worked: { tag: "variation", title: "Choose the structure", q: "Choose a data structure for: (a) jobs waiting for a printer; (b) the moves a player can undo; (c) a 9 × 9 puzzle grid; (d) looking up a product's price by its barcode; (e) the road network between towns.",
      steps: [
        { m: "(a) Queue — first job in is printed first.", mk: "1" },
        { m: "(b) Stack — the last move made is the first undone.", mk: "1" },
        { m: "(c) 2-D array — grid[row, col].", mk: "1" },
        { m: "(d) Hash table / dictionary — direct access by key.", mk: "1" },
        { m: "(e) Weighted graph — towns are vertices, roads are edges with distances.", mk: "1" }
      ], result: "Queue · stack · 2-D array · hash table · graph" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Recognise structures in pseudo-code**: a pointer that goes up then down = stack; front and rear pointers = queue; Left/Right pointers = binary tree; ConnectedNodes = adjacency list.",
      "**Static vs dynamic**: compile-time size vs run-time growth; wasted space vs pointer memory; consecutive vs scattered.",
      "**Data abstraction**: representation hidden, new structures from old."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"A data structure is a data type.\" — a type describes one value; a structure organises many related values and the operations on them.", "\"Dynamic is always better.\" — it costs pointer memory and slower direct access; a static array is ideal when the size is known in advance."] } },
    { callout: { t: "mnemonic", h: "\"Queue at a till, stack of plates\"", body: "A **queue** is FIFO, like people at a till: first in, first served. A **stack** is LIFO, like plates: the last one put on is the first taken off." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.1.4 ADTs and static vs dynamic in depth; 4.1.1.1 arrays, records and pointers as data types; 4.3 algorithms that run over these structures; 4.4.4.1 the complexity of each operation; 4.10 relational databases as structured storage." } }
  ],
  flashcards: [
    ["Data structure?", "A collection of related data items organised in memory, with the operations allowed on them."],
    ["FIFO structure?", "Queue."],
    ["LIFO structure?", "Stack."],
    ["Static data structure?", "Size fixed when created (at compile time); usually consecutive memory."],
    ["Dynamic data structure?", "Grows and shrinks at run time; nodes linked by pointers on the heap."],
    ["One disadvantage of a dynamic structure?", "Extra memory for pointers (also: memory leaks, slower direct access)."],
    ["One disadvantage of a static structure?", "Wasted memory if under-used; it can become full."],
    ["Data abstraction?", "Hiding how data is represented; building new types from existing ones."],
    ["Structure for an undo feature?", "A stack."]
  ],
  quiz: [
    { q: "A structure whose size is fixed at compile time is", opts: ["static", "dynamic", "abstract", "recursive"], ans: 0, why: "Static." },
    { q: "Temp[Pos ← Pos + 1] ← x … x ← Temp[Pos]; Pos ← Pos − 1 implements", opts: ["a stack", "a queue", "a hash table", "a graph"], ans: 0, why: "Push and pop at one end." },
    { q: "Which needs memory for pointers?", opts: ["a linked list", "a 1-D array", "a 2-D array", "a record"], ans: 0, why: "Dynamic." },
    { q: "The best structure for 'look up a price by barcode' is", opts: ["a hash table", "a stack", "a queue", "a linked list"], ans: 0, why: "Direct access by key." }
  ],
  sims: ["tl-list"]
};

/* =====================================================================
   4.2.1.2  Single- and multi-dimensional arrays
   ===================================================================== */
C["compsci:4.2.1.2"] = {
  notes: [
    { h: "Arrays — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.2.1.2)", body: ["Use arrays (or equivalent) in the design of solutions to simple problems. A **1-D array** represents a **vector**, a **2-D array** a **matrix**.", "An **n-dimensional array** is a set of elements of the **same data type** indexed by a **tuple of n integers**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Dry-run an algorithm over arrays", "Complete the table", "3–5", "AS 2016 Q04.1, AS 2025 Q01"],
      ["Ordinal numbers and array positions", "Describe", "2", "A-level 2018 P2 Q09.2"],
      ["Use arrays in a program", "Write", "Section A / D", "almost every Paper 1 (grids, boards, lists)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**One-dimensional arrays**.", "**Two- and n-dimensional arrays**.", "**Arrays as linked structures**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "One-dimensional arrays" },
    { callout: { t: "def", h: "Array", body: "A **finite, ordered** set of elements of the **same data type**, stored under one identifier and accessed by an **index** (C# counts from 0). The index is an **ordinal** number: it gives the element's position." } },
    { fig: { w: 640, h: 110, items: [].concat(
      [txt(20, 34, "marks", { b: true, size: 12, c: "text", pos: "e" })],
      cells(90, 19, [62, 75, 48, 90, 55, 81], { w: 56, hl: [3] }),
      [txt(520, 34, "marks[3] = 90", { b: true, size: 11.5, c: "accent2", pos: "e" }), txt(320, 92, "Length = 6 · first index 0 · last index Length − 1 = 5", { size: 10.5, c: "text2" })]
    ), cap: "A 1-D array: one identifier, six elements, each reached directly by its index." } },
    { code: { lang: "csharp", src: "int[] marks = { 62, 75, 48, 90, 55, 81 };\nint total = 0;\nfor (int i = 0; i < marks.Length; i++)   // i runs 0 … Length − 1\n{\n    total += marks[i];\n}\nConsole.WriteLine(total / (double)marks.Length);   // 68.5\n\nstring[] names = new string[30];          // 30 elements, all null until assigned\nnames[0] = \"Ada\";", cap: "Indexing past the end (marks[6]) throws IndexOutOfRangeException." } },

    { page: "Two- and n-dimensional arrays" },
    { fig: { w: 640, h: 170, items: (function () {
      var it = [];
      for (var r = 0; r < 3; r++) {
        var row = []; for (var c = 0; c < 4; c++) row.push(r * 4 + c);
        it = it.concat(cells(150, 20 + r * 40, row, { w: 50, h: 34, idx: false, hl: r === 2 ? [1] : null }));
        it.push(txt(130, 37 + r * 40, "row " + r, { size: 10.5, pos: "w" }));
      }
      for (var c2 = 0; c2 < 4; c2++) it.push(txt(175 + c2 * 50, 150, "col " + c2, { size: 10.5 }));
      it.push(txt(400, 117, "grid[2, 1] = 9", { b: true, size: 11.5, c: "accent2", pos: "e" }));
      it.push(txt(400, 37, "int[,] grid = new int[3, 4];", { size: 10.5, c: "text2", pos: "e" }));
      it.push(txt(400, 57, "rows: GetLength(0) = 3", { size: 10.5, c: "text2", pos: "e" }));
      it.push(txt(400, 77, "cols: GetLength(1) = 4", { size: 10.5, c: "text2", pos: "e" }));
      return it;
    })(), cap: "A 2-D array (a matrix) is indexed by a pair (row, column). Here grid[r, c] = r × 4 + c, so grid[2, 1] = 9." } },
    { code: { lang: "csharp", src: "int[,] grid = new int[3, 4];                       // rectangular: 3 rows × 4 columns\nfor (int r = 0; r < grid.GetLength(0); r++)\n    for (int c = 0; c < grid.GetLength(1); c++)\n        grid[r, c] = r * 4 + c;\nConsole.WriteLine(grid[2, 1]);                     // 9\n\nint[][] jagged = { new[] { 1 }, new[] { 2, 3 } };   // an array of arrays: rows may differ in length\nConsole.WriteLine(jagged[1][1]);                   // 3\n\nchar[,,] cube = new char[8, 8, 8];                 // 3-D: indexed by a 3-tuple", cap: "Checked: 9, rows 3, cols 4, jagged 3." } },
    { table: { head: ["Dimensions", "Indexed by", "Represents", "Example"], rows: [
      ["1", "one integer", "a list / a vector", "scores[i]"],
      ["2", "a pair (row, col)", "a matrix, a board, an image", "board[r, c], pixel[y, x]"],
      ["3", "a triple", "a 3-D grid, layers of a board", "voxel[x, y, z]"],
      ["n", "an n-tuple", "general tables of data", "—"]
    ] } },

    { page: "Arrays as linked structures" },
    { callout: { t: "info", h: "Key idea", body: "Arrays of integers can hold **pointers** (indices) to other elements — the classic AQA way to store trees and lists when the language has no pointers. −1 means \"no child\"." } },
    { code: { lang: "csharp", src: "// AS 2025 Q01: a letter tree in three parallel arrays (index 0 is the root)\nstring letter = \"?ABCDEFGHIJKLMNOPQRSTUVWXYZ\";\nint[] L = { 5, 18, -1, -1, 2, 9, -1, 26, -1, 19, -1, 3, -1, 7, 4, -1, -1, -1, 12, 8, 14, 6, -1, 16, -1, -1, -1 };\nint[] R = { 20, 23, -1, -1, 24, 1, -1, 17, -1, 21, -1, 25, -1, 15, 11, -1, -1, -1, -1, 22, 13, -1, -1, 10, -1, -1, -1 };\n\nint current = 0;\nforeach (char symbol in \"1001\")\n    current = symbol == '0' ? L[current] : R[current];   // 0 → left, 1 → right\nConsole.WriteLine(letter[current]);                      // X", cap: "Checked: Current goes 0 → 20 → 14 → 4 → 24, and Letter[24] = X." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Dry-run the de-duplication", src: "AS June 2016 · P1 Q04.1 · 5 marks",
      q: "Items = [12, 25, 12, 53]. ItemsCount ← 4; NewItems[0] ← Items[0]; NewItemsCount ← 1; FOR LoopA ← 1 TO ItemsCount − 1: Done ← False; FOR LoopB ← 0 TO NewItemsCount − 1: IF Items[LoopA] = NewItems[LoopB] THEN Done ← True; ENDFOR; IF Done = False THEN NewItems[NewItemsCount] ← Items[LoopA]; NewItemsCount ← NewItemsCount + 1; ENDIF; ENDFOR. Dry run the algorithm with a table of ItemsCount, NewItemsCount, LoopA, Done, LoopB and NewItems[0]–[3] (NewItems starts 0, 0, 0, 0).",
      steps: [
        { m: "LoopA runs over the values 1, 2, 3 and stops at 3;", mk: "1" },
        { m: "LoopB is 0, then 1 (when LoopA = 2, NewItemsCount is 2), then 0, then 1 again — no further changes;", mk: "1", n: "LoopA = 1: LoopB 0 only. LoopA = 2: LoopB 0, 1 (12 matches). LoopA = 3: LoopB 0, 1." },
        { m: "NewItems becomes 12, 25, 0, 0 at the end of LoopA = 1;", mk: "1" },
        { m: "NewItems does not change during LoopA = 2 (12 is already there — Done becomes True);", mk: "1" },
        { m: "NewItems is 12, 25, 53, 0 at the end;", mk: "1", n: "A. without trailing zeros. Checked in C#: 12,25,53,0 with NewItemsCount 3." }
      ], result: "NewItems = 12, 25, 53 — duplicates removed" } },
    { worked: { tag: "exam", title: "Walk the letter tree", src: "AS June 2025 · P1 Q01 · 3 marks",
      q: "Arrays Letter (index 1 = A … 26 = Z), L and R store a tree; L[0] = 5, R[0] = 20, L[20] = 14, L[14] = 4, R[4] = 24 (−1 means no child). M ← \"1001\"; Current ← 0; FOR i ← 0 TO 3: Symbol ← M[i]; IF Symbol = \"0\" THEN Current ← L[Current] ELSE Current ← R[Current]; ENDFOR; OUTPUT Letter[Current]. Complete a trace table with columns M, i, Symbol, Current, Output.",
      steps: [
        { m: "i: 0, 1, 2, 3 with Symbol \"1\", \"0\", \"0\", \"1\";", mk: "1" },
        { m: "Current: 0, 20, 14, 4, 24;", mk: "1" },
        { m: "Output: X;", mk: "1", n: "One mark per correct column sequence; max 2 if any errors." }
      ], result: "Current 20, 14, 4, 24 → X" } },
    { table: { head: ["M", "i", "Symbol", "Current", "Output"], rows: [
      ["\"1001\"", "", "", "0", ""], ["", "0", "\"1\"", "20", ""], ["", "1", "\"0\"", "14", ""], ["", "2", "\"0\"", "4", ""], ["", "3", "\"1\"", "24", ""], ["", "", "", "", "X"]
    ] } },
    { worked: { tag: "exam", title: "Ordinal numbers in an array", src: "A-level June 2018 · P2 Q09.2 · 2 marks",
      q: "A list of eight numbers is stored in an array with indices [0]–[7]. Describe what an ordinal number is and what an ordinal number would be used for in the context of this array.",
      steps: [
        { m: "An ordinal number shows order / position / rank;", mk: "1" },
        { m: "The ordinal numbers would represent the position / index of the values in the array;", mk: "1" }
      ], result: "Position — the index" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Same data type**, fixed length, indexed from 0 in C# (AQA pseudo-code says whether it starts at 0 or 1 — check).",
      "**Loop bounds**: 0 TO Length − 1. An off-by-one is the commonest trace error.",
      "**2-D**: [row, col] — read the question's convention; a nested loop visits every cell.",
      "**Traces**: one column per array element; write a value only when it changes."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"An array can hold mixed types.\" — every element has the same type; a RECORD groups mixed types.", "\"The last index is Length.\" — it is Length − 1 when indexing starts at 0.", "\"A 2-D array is [x, y].\" — read the question: AQA usually indexes [row, column], which is [y, x]."] } },
    { callout: { t: "mnemonic", h: "\"Zero to Length minus one; rows run first\"", body: "C# arrays run from **0** to **Length − 1**. A 2-D array is indexed **[row, column]** — rows first." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.8.1 a 1-D array represents a vector; 4.2.4.1 a 2-D array is an adjacency matrix; 4.2.2.1 / 4.2.3.1 queues and stacks built on arrays; 4.3.4.2 binary search needs a sorted array; 4.5.6.4 a bitmap image is a 2-D array of pixels." } }
  ],
  flashcards: [
    ["Array?", "A finite ordered set of elements of the same type, accessed by index."],
    ["First and last index of int[10] in C#?", "0 and 9."],
    ["1-D array represents…?", "A vector (a list)."],
    ["2-D array represents…?", "A matrix (a grid / board)."],
    ["n-dimensional array?", "Elements of one type indexed by a tuple of n integers."],
    ["Rectangular vs jagged array in C#?", "int[,] has every row the same length; int[][] is an array of arrays whose rows may differ."],
    ["Ordinal number?", "A number showing position/order — an array index is ordinal."],
    ["What does −1 mean in AQA's Left/Right arrays?", "No child — a null pointer."],
    ["Rows and columns of int[,] g in C#?", "g.GetLength(0) and g.GetLength(1)."]
  ],
  quiz: [
    { q: "int[,] g = new int[3,4]; how many elements?", opts: ["12", "7", "3", "4"], ans: 0, why: "3 × 4." },
    { q: "Dedupe [12, 25, 12, 53] gives", opts: ["12, 25, 53", "12, 25, 12, 53", "25, 53", "12, 53"], ans: 0, why: "AS 2016." },
    { q: "Indexing marks[marks.Length] in C#", opts: ["throws IndexOutOfRangeException", "returns 0", "returns the last item", "returns null"], ans: 0, why: "Last index is Length − 1." },
    { q: "All elements of an array must", opts: ["be the same data type", "be different values", "be integers", "be sorted"], ans: 0, why: "Definition." }
  ]
};

/* =====================================================================
   4.2.1.3  Fields, records and files
   ===================================================================== */
C["compsci:4.2.1.3"] = {
  notes: [
    { h: "Fields, records and files — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.2.1.3)", body: ["Be able to **read/write from/to a text file**, and **read/write data from/to a binary (non-text) file**. A **record** groups related **fields** of different types.", "A **file** stores records permanently in secondary storage."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How data is stored in a binary vs a text file", "Describe", "2", "AS 2016 Q08.6"],
      ["Why a binary file might be chosen", "State two reasons", "2", "A-level 2019 Q06"],
      ["Count/identify methods that read or write files", "State", "1", "A-level 2024 Q08.3"],
      ["Add a field to a record; save/load in a program", "Write", "Section D", "AS 2017 SaveToFile, AS 2025 PirateRecord"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Fields and records**.", "**Text files**.", "**Binary files**.", "**Text vs binary**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Fields and records" },
    { kv: [
      ["Field", "one item of data about something, with its own name and type (Name: string, Year: integer)"],
      ["Record", "a collection of related fields about ONE thing (one student) — fields may be of different types"],
      ["File", "a collection of records (or text) held in secondary storage, so it persists after the program ends"],
      ["Key field", "a field whose value is unique to each record, used to find it"]
    ] },
    { code: { lang: "csharp", src: "// a record type: three fields of different types\npublic record Student(string Name, int Year, double Mark);\n\nvar students = new List<Student>\n{\n    new(\"Ada\", 13, 72.5),\n    new(\"Bob\", 12, 65.0)\n};\nConsole.WriteLine(students[1]);   // Student { Name = Bob, Year = 12, Mark = 65 }\n\n// a struct works as a record too (4.1.1.1): public struct PirateRecord { public int Row, Col; public double WalkTime; }", cap: "C# record and struct types both model AQA's records." } },

    { page: "Text files" },
    { callout: { t: "info", h: "Key idea", body: "A text file stores **characters** (ASCII/Unicode) — every number is written as its digits — usually one record per **line**, fields separated by a delimiter (comma, tab)." } },
    { code: { lang: "csharp", src: "string path = \"scores.txt\";\n\n// WRITE — StreamWriter, one line per record\nusing (var w = new StreamWriter(path))           // creates or overwrites the file\n{\n    w.WriteLine(\"Ada,72\");\n    w.WriteLine(\"Bob,65\");\n}                                                 // using closes the file\n\n// READ — line by line, split into fields, convert the number\nforeach (string line in File.ReadAllLines(path))\n{\n    string[] fields = line.Split(',');\n    string name = fields[0];\n    int score = int.Parse(fields[1]);             // text → integer\n    Console.Write(name + \"=\" + score + \" \");\n}\n// Ada=72 Bob=65 — the file is 14 bytes: 7 characters per line including the newline\n\nFile.AppendAllText(path, \"Cy,80\\n\");             // add to the end without overwriting", cap: "Checked by running. Also: new StreamReader(path) with ReadLine() until it returns null; File.Exists(path) before reading." } },
    { steps: [
      "**Open** the file (for reading, writing or appending).",
      "**Read/write** a line at a time; split lines into fields and CONVERT numbers from text.",
      "Detect the **end of file** (ReadLine returns null / loop over all lines).",
      "**Close** the file — using does it, even if an exception occurs."
    ] },

    { page: "Binary files" },
    { callout: { t: "info", h: "Key idea", body: "A binary file stores values in their **in-memory representation** — an int as 4 bytes, a double as 8 — so there is no conversion to and from text, and it is not human-readable." } },
    { code: { lang: "csharp", src: "string path = \"scores.bin\";\n\nusing (var bw = new BinaryWriter(File.Open(path, FileMode.Create)))\n{\n    bw.Write(\"Ada\");     // length-prefixed string: 1 + 3 bytes\n    bw.Write(72);        // int: 4 bytes\n    bw.Write(3.5);       // double: 8 bytes\n    bw.Write(true);      // bool: 1 byte\n}\n\nusing (var br = new BinaryReader(File.OpenRead(path)))\n{\n    // read back in EXACTLY the order and types written\n    Console.WriteLine(br.ReadString() + \" \" + br.ReadInt32() + \" \" + br.ReadDouble() + \" \" + br.ReadBoolean());\n}\n// Ada 72 3.5 True — 17 bytes", cap: "Checked: 17 bytes = 4 + 4 + 8 + 1. Reading in a different order gives garbage — the file has no field names." } },
    { code: { lang: "csharp", src: "// a FILE OF RECORDS: write each record's fields, read until the end of the stream\nusing (var bw = new BinaryWriter(File.Open(\"students.bin\", FileMode.Create)))\n    foreach (var s in students) { bw.Write(s.Name); bw.Write(s.Year); bw.Write(s.Mark); }\n\nvar back = new List<Student>();\nusing (var br = new BinaryReader(File.OpenRead(\"students.bin\")))\n    while (br.BaseStream.Position < br.BaseStream.Length)\n        back.Add(new Student(br.ReadString(), br.ReadInt32(), br.ReadDouble()));\nConsole.WriteLine(back.Count);   // 2", cap: "Checked: two records written and read back intact." } },

    { page: "Text vs binary" },
    { fig: { w: 640, h: 150, items: [].concat(
      [txt(20, 26, "text \"Ada,72⏎\"", { b: true, size: 11.5, c: "text", pos: "e" })],
      cells(170, 10, ["A", "d", "a", ",", "7", "2", "⏎"], { w: 44, idx: ["65", "100", "97", "44", "55", "50", "10"] }),
      [txt(20, 96, "binary Ada, 72", { b: true, size: 11.5, c: "text", pos: "e" })],
      cells(170, 80, ["3", "A", "d", "a", "72", "0", "0", "0"], { w: 44, col: "good", idx: ["len", "", "", "", "int (4 bytes)", "", "", ""] }),
      [txt(492, 26, "'7' '2' = 2 chars", { size: 10.5, c: "text2", pos: "e" }), txt(534, 96, "72 = 4 bytes", { size: 10.5, c: "text2", pos: "e" })]
    ), cap: "In the text file 72 is two characters (codes 55 and 50); in the binary file it is the 4-byte integer 72 — no conversion, not readable in a text editor." } },
    { table: { head: [" ", "Text file", "Binary file"], rows: [
      ["Stores", "characters (ASCII/Unicode codes) only", "values in their own data types / memory representation"],
      ["Readable", "by a person in any text editor", "only by a program that knows the layout"],
      ["Numbers", "must be converted to and from strings", "no conversion routines needed"],
      ["Size", "often larger (72 000 is 5 characters + delimiter)", "often smaller / fixed per type"],
      ["Structure", "lines and delimiters", "the exact order and types of the fields"],
      ["Use", "configuration, CSV, logs, data meant to be edited", "saved games, images, records accessed by position"]
    ] } },
    { worked: { tag: "variation", title: "Fixed-length records", q: "A binary file holds records of a name padded to 20 characters (40 bytes as UTF-16) and an int. How would you read record number 50 without reading the first 49, and why can't a delimited text file do this as easily?",
      steps: [
        { m: "Each record is 40 + 4 = 44 bytes, so record n starts at byte 44 × n (counting from 0).", mk: "1" },
        { m: "Seek there: stream.Seek(44 * 50, SeekOrigin.Begin), then read the fields.", mk: "1" },
        { m: "Text lines have different lengths, so the 50th line can only be found by reading the 49 before it.", mk: "1" }
      ], result: "Direct (random) access at 44 × 50 = 2200" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Binary vs text storage", src: "AS June 2016 · P1 Q08.6 · 2 marks",
      q: "When the training game is selected, the positions of the ships are loaded from a text file. A binary file could have been used instead. Describe a difference between the way in which data are stored in a binary file and the way data are stored in a text file.",
      steps: [
        { m: "In text files all data is stored as strings / ASCII or Unicode values / characters // only values that can be opened and read in a text editor;", mk: "1", n: "A. a text file is human-readable." },
        { m: "Binary files store data using different data types // can only be correctly interpreted by the application that created them;", mk: "1", n: "A. by example." }
      ], result: "Text = characters; binary = values in their own types" } },
    { worked: { tag: "exam", title: "Why choose a binary file", src: "A-level June 2019 · P1 Q06 · 2 marks",
      q: "The Skeleton Program loads the game data from a binary file. State two reasons why a binary file might have been chosen for use with the Skeleton Program instead of a text file.",
      steps: [
        { m: "The binary file cannot be easily read by a person, so the game data is hidden more from the user;", mk: "1", n: "NE. \"binary file cannot be read\"." },
        { m: "No need for string / data type conversion routines // the file size is likely to be smaller;", mk: "1", n: "A. it may make the code easier to understand (fewer conversion routines). Max 2." }
      ], result: "Harder for players to read/alter; no conversions; smaller" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Field** ⊂ **record** ⊂ **file**.",
      "**Text**: characters, human-readable, convert numbers, lines + delimiters.",
      "**Binary**: data types as stored in memory, not human-readable, no conversion, read in the exact order written.",
      "**Program tasks**: open → loop reading/writing → convert → close; check the file exists or catch FileNotFoundException (4.1.1.9)."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"Only binary files are stored in binary.\" — EVERY file is bits; the difference is what the bytes mean (character codes vs typed values).", "\"A binary file cannot be read.\" — NE in the mark scheme: it can't easily be read BY A PERSON; the program reads it perfectly well."] } },
    { callout: { t: "mnemonic", h: "\"Text you can read, binary you can't\"", body: "**Text**: characters, readable in an editor, numbers must be **converted**. **Binary**: values in their own types — no conversion, often smaller, unreadable to people, read back in the **same order** they were written." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.1 records and user-defined types; 4.1.1.9 exceptions when a file is missing; 4.5.4 character codes (ASCII/Unicode) in text files; 4.10 databases as structured files; 4.6.4 secondary storage." } }
  ],
  flashcards: [
    ["Record?", "A collection of related fields (which may have different types) about one entity.", 1],
    ["File?", "A collection of records or text stored permanently in secondary storage.", 2],
    ["Two reasons to choose a binary file?", "Data hidden from casual reading; no type-conversion routines; smaller file.", 5],
    ["C# classes for text files?", "StreamWriter / StreamReader (or File.ReadAllLines / WriteAllLines).", 6],
    ["C# classes for binary files?", "BinaryWriter / BinaryReader.", 7],
    ["Why must a binary file be read in the order it was written?", "It has no field names or delimiters — only bytes in sequence.", 8],
    ["What does using do around a file?", "Closes it automatically, even if an exception occurs.", 9]
  ],
  quiz: [
    { q: "The integer 72 in a text file is stored as", opts: ["the characters '7' and '2'", "4 bytes holding 72", "one byte holding 72", "a pointer"], ans: 0, why: "Text stores characters." },
    { q: "Which is a reason to use a binary file?", opts: ["no string conversion routines needed", "easier for users to edit", "readable in Notepad", "smaller code always"], ans: 0, why: "A-level 2019 Q06." },
    { q: "BinaryWriter writes a string, an int, a double and a bool. Reading them back requires", opts: ["the same order and types", "any order", "field names", "a delimiter"], ans: 0, why: "No metadata." },
    { q: "Fields in one record", opts: ["may be of different types", "must all be the same type", "must be strings", "must be numbers"], ans: 0, why: "Unlike an array." }
  ]
};

/* =====================================================================
   4.2.1.4  Abstract data types / data structures
   ===================================================================== */
C["compsci:4.2.1.4"] = {
  notes: [
    { h: "Abstract data types — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.2.1.4)", body: ["Be familiar with the concept and uses of a **queue, stack, graph, tree, hash table, dictionary and vector**.", "Distinguish **static and dynamic** structures and compare their uses, advantages and disadvantages.", "Describe the creation and maintenance of data within queues (linear, circular, priority), stacks and hash tables.", "Know how to represent them when a language has no built-in type."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Advantages and disadvantages of dynamic vs static", "Discuss", "4", "A-level 2020 Q04.1"],
      ["Three differences between dynamic and static", "Describe", "3", "A-level 2022 Q02.2"],
      ["Data abstraction", "Explain", "1", "AS 2025 Q05 (worked in 4.4.1.7)"],
      ["Maintenance of queues, stacks, hash tables", "Describe the steps", "3–5", "see 4.2.2.1, 4.2.3.1, 4.2.6.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What makes a type abstract**.", "**Implementing an ADT**.", "**Static vs dynamic, in depth**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What makes a type abstract" },
    { callout: { t: "def", h: "Abstract data type (ADT)", body: "A data type defined by its **behaviour** — the values it holds and the **operations** allowed on it — **independently of how it is implemented**. A stack is \"push, pop, peek, isEmpty, isFull\" whether it is built on an array or a linked list." } },
    { fig: { w: 640, h: 190, items: [].concat(
      boxAt(180, 10, 280, 56, "Stack ADT — the interface", "accent2", "Push(x) · Pop() · Peek() · IsEmpty() · IsFull()"),
      boxAt(40, 120, 250, 56, "array + top pointer", "accent", "static: fixed maximum size"),
      boxAt(350, 120, 250, 56, "linked list + head pointer", "good", "dynamic: grows node by node"),
      arrow(260, 66, 165, 120, "implemented by", { c: "text2", dx: -30 }), arrow(380, 66, 475, 120, "or by", { c: "text2", dx: 22 })
    ), cap: "Code that uses the stack depends only on the interface, so the implementation can change without changing it — data abstraction." } },
    { table: { head: ["ADT", "Core operations", "Usual implementations"], rows: [
      ["Queue", "Enqueue, Dequeue, IsEmpty, IsFull", "array (linear/circular) with front and rear pointers; linked list"],
      ["Stack", "Push, Pop, Peek/Top, IsEmpty, IsFull", "array with a top pointer; linked list"],
      ["Graph", "add/remove vertex or edge, neighbours", "adjacency matrix (2-D array); adjacency list"],
      ["Tree", "insert, search, traverse", "nodes with child pointers; parallel arrays of Left/Right indices"],
      ["Hash table", "insert, search, delete by key", "array + hash function + collision handling"],
      ["Dictionary", "add, look up, remove by key", "hash table; balanced tree"],
      ["Vector", "add, scale, dot product", "1-D array; list; dictionary (index ↦ value)"]
    ] } },

    { page: "Implementing an ADT" },
    { code: { lang: "csharp", src: "// a linked list — the dynamic building block\nclass Node\n{\n    public int Value;\n    public Node Next;                 // pointer to the next node (null = end)\n    public Node(int v, Node n) { Value = v; Next = n; }\n}\n\nvar head = new Node(3, new Node(7, new Node(9, null)));   // 3 → 7 → 9\nhead.Next = new Node(5, head.Next);                        // insert 5 after 3: 3 → 5 → 7 → 9\n\nfor (Node n = head; n != null; n = n.Next)                 // traverse by following pointers\n    Console.Write(n.Value + \" \");                          // 3 5 7 9", cap: "Inserting needs no shuffling: two pointer changes. Checked by running." } },
    { worked: { tag: "variation", title: "Delete from the linked list", q: "In 3 → 5 → 7 → 9, describe how to delete 7, and compare with deleting from an array.",
      steps: [
        { m: "Traverse from head, keeping the PREVIOUS node, until the current node holds 7.", mk: "1" },
        { m: "Set previous.Next = current.Next (5 now points to 9); the 7 node is unreachable and its memory is reclaimed (garbage collected / returned to the heap).", mk: "1" },
        { m: "In an array every later element must shuffle down one place — O(n) moves; the list changes ONE pointer (but finding the node is still O(n)).", mk: "1" }
      ], result: "prev.Next ← cur.Next" } },
    { diagram: "tl-list" },

    { page: "Static vs dynamic, in depth" },
    { table: { head: [" ", "Dynamic — advantages", "Dynamic — disadvantages"], rows: [
      ["Memory", "no wasted memory: allocated as needed", "extra memory for pointers"],
      ["Size", "can grow with the data — no fixed limit (except hardware)", "can cause a memory leak if unused memory is not returned to the heap"],
      ["Access", "insert/delete by changing pointers", "slower direct access: must follow pointers from the start"],
      ["Allocation", "resources only allocated when needed", "allocating each new node takes time"]
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"An ADT is a class.\" — a class can IMPLEMENT an ADT, but the ADT is the specification of behaviour, independent of any code.", "\"A linked list gives direct access.\" — reaching item n means following n pointers from the head."] } },
    { callout: { t: "mnemonic", h: "SCAWP", body: "Static vs dynamic: **S**ize (fixed / grows) · **C**onsecutive memory (yes / no) · **A**ccess (direct / follow pointers) · **W**aste (possible / none) · **P**ointers (none / needed)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Discuss dynamic vs static", src: "A-level June 2020 · P1 Q04.1 · 4 marks",
      q: "Priority queues and linear queues are examples of data structures. A data structure can be implemented as a dynamic data structure or as a static data structure. Discuss the advantages and disadvantages of dynamic data structures compared to static data structures.",
      steps: [
        { h: "Advantages (max 2)", m: "No wasted memory;", mk: "1" },
        { m: "Can grow as more data is added // no limit on the number of items (except hardware) // resources only allocated as needed;", mk: "1" },
        { h: "Disadvantages (max 2)", m: "Additional memory needed for pointers;", mk: "1" },
        { m: "Can result in a memory leak (if memory no longer needed is not returned to the heap) // can take longer to access an item directly // can take longer to add an item (memory must be allocated);", mk: "1" }
      ], result: "2 advantages + 2 disadvantages" } },
    { worked: { tag: "exam", title: "Three differences", src: "A-level June 2022 · P1 Q02.2 · 3 marks",
      q: "A queue data structure can be implemented as a static data structure using an array. Describe three differences between dynamic and static data structures.",
      steps: [
        { m: "Static structures have their storage size determined at compile time / before first use // dynamic structures can grow and shrink at run time;", mk: "1" },
        { m: "Static structures can waste memory if few items are stored // dynamic structures only take the storage the data needs;", mk: "1" },
        { m: "Dynamic structures require memory for pointers to the next item // static ones do not; OR static structures store data in consecutive locations, dynamic ones do not;", mk: "1", n: "Max 3 — three DIFFERENT differences, each with both sides." }
      ], result: "Size · waste · pointers/consecutive" } },

    { page: "Exam toolkit" },
    { steps: [
      "**ADT** = behaviour (operations), not implementation.",
      "**Discuss** questions: balance — 2 advantages AND 2 disadvantages for 4 marks.",
      "**Differences**: each point must compare BOTH sides; use the SCAWP axes.",
      "When a language lacks a type, build it: arrays + pointers (indices) or objects with references."
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.1.1 static vs dynamic first look; 4.2.2–4.2.8 each ADT in detail; 4.1.2.3 classes encapsulate an ADT's representation; 4.4.1 data abstraction; 4.1.1.1 pointers and references." } }
  ],
  flashcards: [
    ["Stack operations?", "Push, Pop, Peek/Top, IsEmpty, IsFull.", 1],
    ["Queue operations?", "Enqueue, Dequeue, IsEmpty, IsFull.", 2],
    ["Two ways to implement a stack?", "An array with a top pointer; a linked list with a head pointer.", 3],
    ["Linked list node holds…?", "A data value and a pointer to the next node.", 4],
    ["Dynamic structure advantage?", "No wasted memory; grows as needed.", 5],
    ["Heap?", "The pool of memory from which dynamic structures are allocated at run time.", 8],
  ],
  quiz: [
    { q: "An ADT is defined by", opts: ["its operations, not its implementation", "the array that stores it", "its memory address", "its programming language"], ans: 0, why: "Abstraction." },
    { q: "Which is a disadvantage of dynamic structures?", opts: ["memory needed for pointers", "wasted memory when under-filled", "a fixed maximum size", "data in consecutive locations"], ans: 0, why: "A-level 2020 Q04.1." },
    { q: "Inserting into the middle of a linked list requires", opts: ["changing pointers", "shuffling every later element", "a new array", "re-hashing"], ans: 0, why: "No shuffling." },
    { q: "A 4-mark 'discuss advantages and disadvantages' expects", opts: ["two of each", "four advantages", "one of each plus code", "a definition only"], ans: 0, why: "Max 2 each." }
  ],
  sims: ["tl-list"]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
