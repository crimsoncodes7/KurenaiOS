/* Kurenai OS — data/content/code-u4.js
   Code · Unit 4 · Collections: arrays, List, Dictionary (roadmap 5.3).

   Stage 2 opens. Same contract as units 1–3 (docs/code-plan.md §4): every
   lesson's layers, short text layers folded by KOS_CODE.compose; every
   {run} listing, practice item, task answer and retrieval variation
   checked against .NET by tools/cs_diff.mjs. 4.3 Dictionary is the depth
   reference (§4.2). Lambdas appear only as a one-line preview in sorting
   (unit 9 teaches them); string.Split is used to read a line of words,
   which unit 5 teaches properly.                                         */
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
    "array": { name: "Arrays", lesson: "4.1", about: "a fixed row of values" },
    "array-loop": { name: "Walking an array", lesson: "4.1", about: "0 to Length − 1" },
    "list": { name: "List<T>", lesson: "4.2", about: "a row that grows" },
    "list-edit": { name: "Insert and remove", lesson: "4.2", about: "changing a list safely" },
    "dictionary": { name: "Dictionary", lesson: "4.3", about: "look up by key" },
    "counting": { name: "Counting with a dictionary", lesson: "4.3", about: "key → how many" },
    "trygetvalue": { name: "TryGetValue", lesson: "4.3", about: "a key that might be missing" },
    "hashset": { name: "HashSet", lesson: "4.4", about: "each item once" },
    "set-ops": { name: "Set operations", lesson: "4.4", about: "union, intersect, except" },
    "queue": { name: "Queue", lesson: "4.5", about: "first in, first out" },
    "stack": { name: "Stack", lesson: "4.5", about: "last in, first out" },
    "grid": { name: "2-D arrays", lesson: "4.6", about: "rows and columns" },
    "jagged": { name: "Jagged arrays", lesson: "4.6", about: "rows of different lengths" },
    "tuple": { name: "Tuples", lesson: "4.7", about: "a small group of values" },
    "deconstruct": { name: "Deconstruction", lesson: "4.7", about: "var (a, b) = …" },
    "sorting": { name: "Sorting", lesson: "4.8", about: "in place, by a key" },
    "searching": { name: "Searching", lesson: "4.8", about: "linear and binary" },
    "choose-collection": { name: "Choosing a collection", lesson: "4.9", about: "from how the data is used" },
    "coll-methods": { name: "Collections and methods", lesson: "4.10", about: "who sees a change" },
    "inventory": { name: "Modelling with collections", lesson: "4.11", about: "a small system in collections" }
  } });

  /* ================================================================
     4.1 Arrays
     ================================================================ */
  lesson("4.1", {
    aqa: "4.2.1.2",
    notes: [
      page("The problem it solves"),
      { ul: [ "Ten marks in ten variables — `mark1` … `mark10` — cannot be looped over or averaged without writing each name.", "An **array** holds many values of one type under one name, numbered from 0.", "A loop can then visit every value, however many there are." ] },
      page("Core idea"),
      run("decl", "three marks, one name", 'int[] marks = { 72, 48, 91 };\nConsole.WriteLine(marks.Length);\nConsole.WriteLine(marks[0]);\nConsole.WriteLine(marks[0] + marks[2]);'),
      { ul: [ "`int[]` is \"array of int\"; `{ … }` gives its values.", "`marks[0]` is the first value: indexes start at **0**.", "`Length` is how many values it holds." ] },
      run("new", "an array of a given size starts with defaults", 'int[] scores = new int[3];\nscores[1] = 7;\nConsole.WriteLine(string.Join(", ", scores));\nstring[] names = new string[2];\nConsole.WriteLine(names[0] == null);'),
      run("loop", "two ways to visit every value", 'int[] marks = { 72, 48, 91 };\nfor (int i = 0; i < marks.Length; i++)\n    Console.WriteLine($"{i}: {marks[i]}");\nforeach (int m in marks)\n    Console.Write(m + " ");\nConsole.WriteLine();'),
      page("Rules"),
      { ul: [
        "An array's size is fixed when it is created; it never grows or shrinks.",
        "Valid indexes are `0` to `Length - 1`; anything else throws `IndexOutOfRangeException`.",
        "`new int[n]` fills with the type's default: `0`, `false`, `'\\0'` or `null`.",
        "An array variable holds a **reference**: copying the variable shares the same array.",
        "`foreach` reads every value but cannot replace them; use `for` with an index to change values."
      ] },
      run("ref", "two names, one array", 'int[] a = { 1, 2, 3 };\nint[] b = a;\nb[0] = 99;\nConsole.WriteLine(a[0]);\nint[] c = (int[])a.Clone();\nc[1] = 50;\nConsole.WriteLine(a[1]);'),
      page("Variations"),
      { h: "Total, average and largest" },
      run("stats", "one pass over the values", 'int[] marks = { 72, 48, 91, 64 };\nint total = 0, best = marks[0];\nforeach (int m in marks)\n{\n    total += m;\n    if (m > best) best = m;\n}\nConsole.WriteLine($"Total {total}, mean {(double)total / marks.Length:F2}, best {best}");'),
      { h: "The Array class" },
      run("arrayclass", "sort, reverse and find", 'int[] a = { 5, 3, 9, 1 };\nArray.Sort(a);\nConsole.WriteLine(string.Join(" ", a));\nArray.Reverse(a);\nConsole.WriteLine(string.Join(" ", a));\nConsole.WriteLine(Array.IndexOf(a, 3));\nConsole.WriteLine(Array.IndexOf(a, 7));'),
      { h: "Filling from input" },
      run("read", "the count first, then the values", 'int n = int.Parse(Console.ReadLine());\nint[] xs = new int[n];\nfor (int i = 0; i < n; i++)\n    xs[i] = int.Parse(Console.ReadLine());\nConsole.WriteLine($"Read {xs.Length}: {string.Join(", ", xs)}");', "3\n10\n20\n30"),
      { h: "Changing values needs the index" },
      run("double", "for, not foreach, to write", 'int[] a = { 1, 2, 3 };\nfor (int i = 0; i < a.Length; i++) a[i] *= 2;\nConsole.WriteLine(string.Join(",", a));'),
      page("Under the hood"),
      { ul: [ "The values sit side by side in one block of memory.", "`a[i]` is found by arithmetic — start + i × size — so reading any index costs the same: O(1).", "That fixed block is why an array cannot grow: a bigger one has to be made and copied (which is what `List<T>` does for you, 4.2)." ] },
      page("Pitfalls"),
      { h: "Past the end — IndexOutOfRangeException" },
      run("pit-range", "index 3 of a three-item array", 'int[] a = { 1, 2, 3 };\nConsole.WriteLine(a[3]);'),
      { h: "<= instead of < — the same exception, one pass late" },
      run("pit-off", "the loop runs once too often", 'int[] a = { 1, 2, 3 };\nfor (int i = 0; i <= a.Length; i++) Console.WriteLine(a[i]);'),
      { h: "Length is not a method — CS1955" },
      run("pit-length", "no brackets after Length", 'int[] a = { 1, 2, 3 };\nConsole.WriteLine(a.Length());'),
      { h: "No size and no values — CS1586" },
      run("pit-size", "new int[] needs one or the other", 'int[] a = new int[];'),
      { h: "Printing the array itself" },
      run("pit-print", "you get the type's name", 'int[] a = { 1, 2, 3 };\nConsole.WriteLine(a);\nConsole.WriteLine(string.Join(", ", a));'),
      page("Connections"),
      { ul: [ "**Back:** 2.6's `for` and `foreach`; 3.2's methods take arrays as parameters (4.10).", "**Next:** 4.2's `List<T>` when the size is not known; 4.6 for grids.", "**AQA:** 4.2.1.2 single- and multi-dimensional arrays." ] },
      page("Good practice"),
      { ul: [ "Loop with `i < a.Length`, never a number typed in.", "Use `foreach` to read and `for` to write.", "Use an array when the size is fixed and known; otherwise a list." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Backwards* and *Above average*." ] },
      page("Quick reference"),
      run("qr", "arrays at a glance", 'int[] a = { 4, 8, 15 };    // values\nint[] b = new int[3];       // 0, 0, 0\nb[0] = a[a.Length - 1];     // last item\nConsole.WriteLine(string.Join(",", b));'),
      { ul: [ "Indexes 0 to Length − 1.", "Fixed size; defaults 0/false/null.", "Copying the variable shares the array.", "`string.Join` to print the values." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["IndexOutOfRangeException", "an index outside 0 to Length − 1", "Pitfalls"], ["CS1955", "Length used like a method", "Pitfalls"], ["CS1586", "new int[] with no size or values", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int[] a = { 3, 6, 9 };\nConsole.WriteLine(a[1] + a.Length);', why: "a[1] is 6 and Length is 3.", concepts: ["array"] },
        { id: "p2", src: 'int[] a = { 1, 2 };\nint[] b = a;\nb[1] = 5;\nConsole.WriteLine(a[1]);', why: "b and a are the same array.", concepts: ["array"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the loop visits every index.", src: 'int[] a = { 2, 4, 6 };\nint sum = 0;\nfor (int i = 0; i @@ a.Length; i++) sum += a[i];\nConsole.WriteLine(sum);', out: "12", concepts: ["array-loop"] }
      ],
      bug: [
        { id: "b1", q: "It should print the last item.", src: 'int[] a = { 7, 8, 9 };\nConsole.WriteLine(a[a.Length]);', out: "9", fixedText: "prints 9", why: "The last index is Length − 1.", concepts: ["array-loop"] }
      ]
    },
    flashcards: [
      ["First index of an array?", "0."],
      ["Last index of an array `a`?", "`a.Length - 1`."],
      ["What does `new int[4]` contain?", "Four zeros."],
      ["`int[] b = a; b[0] = 9;` — does `a` change?", "Yes: both names refer to the same array."],
      ["How do you print an array's values?", "`string.Join(\", \", a)`."],
      ["Why use `for` rather than `foreach` to double each value?", "`foreach` cannot assign to its variable; `for` writes `a[i]`."]
    ],
    quiz: [
      { q: "`int[] a = { 5, 6, 7 };` — `a[2]` is…", opts: ["5", "6", "7", "an error"], ans: 2, why: "Indexes start at 0." },
      { q: "`a.Length` for `new int[10]` is…", opts: ["9", "10", "11", "0"], ans: 1, why: "Ten slots, all 0." },
      { q: "Reading `a[a.Length]` gives…", opts: ["the last item", "0", "IndexOutOfRangeException", "null"], ans: 2, why: "Valid indexes stop at Length − 1." },
      { q: "An array is the right choice when…", opts: ["items are added often", "the size is fixed and known", "you look up by name", "order does not matter"], ans: 1, why: "Arrays never grow." }
    ]
  });
  K.add({ tasks: {
    "4.1-reverse": { lesson: "4.1", title: "Backwards", tier: "warm-up", minutes: 8, concepts: ["array", "array-loop"], requires: ["for", "parse"],
      statement: ["The first line is n; n whole numbers follow, one per line.", "Store them in an array and print them in reverse order on one line, separated by spaces."],
      starter: "int n = int.Parse(Console.ReadLine());\nint[] xs = new int[n];\n",
      examples: [{ stdin: "3\n10\n20\n30", out: "30 20 10" }],
      hidden: [{ stdin: "1\n5", out: "5" }, { stdin: "4\n1\n2\n2\n1", out: "1 2 2 1" }],
      rules: [uses(/\[\s*\]/, "Store the numbers in an array.")],
      hints: ["Fill xs[i] in a for loop.", "Then loop from n - 1 down to 0.", "Collect with Console.Write(xs[i] + (i > 0 ? \" \" : \"\")); or reverse and string.Join."],
      answer: 'int n = int.Parse(Console.ReadLine());\nint[] xs = new int[n];\nfor (int i = 0; i < n; i++) xs[i] = int.Parse(Console.ReadLine());\nArray.Reverse(xs);\nConsole.WriteLine(string.Join(" ", xs));' },
    "4.1-above": { lesson: "4.1", title: "Above average", tier: "core", minutes: 12, concepts: ["array", "array-loop"], requires: ["for", "parse", "format"],
      statement: ["The first line is n (at least 1); n marks follow, one per line.", "Print `Average: X.X`, then `Above: N` — how many marks are strictly above the average."],
      starter: "",
      examples: [{ stdin: "3\n72\n48\n91", out: "Average: 70.3\nAbove: 2" }],
      hidden: [{ stdin: "1\n50", out: "Average: 50.0\nAbove: 0" }, { stdin: "4\n10\n10\n10\n30", out: "Average: 15.0\nAbove: 1" }],
      rules: [uses(/\[\s*\]/, "Keep the marks in an array: the average is known only after reading them all.")],
      hints: ["You need two passes: one to total, one to compare.", "double avg = (double)total / n;", "Count marks with m > avg in a second loop."],
      answer: 'int n = int.Parse(Console.ReadLine());\nint[] marks = new int[n];\nint total = 0;\nfor (int i = 0; i < n; i++)\n{\n    marks[i] = int.Parse(Console.ReadLine());\n    total += marks[i];\n}\ndouble avg = (double)total / n;\nint above = 0;\nforeach (int m in marks) if (m > avg) above++;\nConsole.WriteLine($"Average: {avg:F1}");\nConsole.WriteLine($"Above: {above}");' }
  } });

  /* ================================================================
     4.2 List<T>
     ================================================================ */
  lesson("4.2", {
    aqa: "4.2.1.1",
    notes: [
      page("The problem it solves"),
      { ul: [ "Reading names until the user types `done` — how big should the array be?", "A **`List<T>`** grows and shrinks as items are added and removed.", "It is the collection you will use most." ] },
      page("Core idea"),
      run("add", "start empty, add as you go", 'var names = new List<string>();\nnames.Add("Ada");\nnames.Add("Linus");\nnames.Add("Grace");\nConsole.WriteLine(names.Count);\nConsole.WriteLine(names[1]);\nforeach (string n in names) Console.WriteLine(n);'),
      { ul: [ "`List<string>`: a list **of** strings — the type in `< >` is the item type.", "`Add` puts an item at the end; `Count` is how many there are.", "Indexing and `foreach` work as for arrays." ] },
      run("edit", "insert, remove, find", 'var xs = new List<int> { 4, 7, 1 };\nxs.Insert(1, 9);\nConsole.WriteLine(string.Join(",", xs));\nxs.Remove(7);\nxs.RemoveAt(0);\nConsole.WriteLine(string.Join(",", xs));\nConsole.WriteLine(xs.Contains(9) + " " + xs.IndexOf(1) + " " + xs.IndexOf(5));'),
      page("Rules"),
      { ul: [
        "A list has `Count`; an array has `Length`.",
        "Valid indexes are `0` to `Count - 1`; others throw `ArgumentOutOfRangeException`.",
        "`Remove(x)` removes the FIRST match and returns `true`, or `false` if there was none.",
        "`RemoveAt(i)` and `Insert(i, x)` shift the items after `i`.",
        "Every item must be the list's type: adding an `int` to a `List<string>` is a compile error.",
        "A list cannot change while `foreach` walks it."
      ] },
      run("remove-false", "Remove tells you whether it found it", 'var xs = new List<int> { 3, 5, 3 };\nConsole.WriteLine(xs.Remove(3));\nConsole.WriteLine(string.Join(",", xs));\nConsole.WriteLine(xs.Remove(42));'),
      page("Variations"),
      { h: "Read until done" },
      run("until", "the list grows to fit", 'var items = new List<string>();\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    items.Add(line);\n    line = Console.ReadLine();\n}\nConsole.WriteLine($"{items.Count} items: {string.Join(", ", items)}");', "milk\neggs\nbread\ndone"),
      { h: "Removing while looping — go backwards" },
      run("backwards", "removing from the end keeps the indexes valid", 'var xs = new List<int> { 1, 2, 3, 4, 5, 6 };\nfor (int i = xs.Count - 1; i >= 0; i--)\n    if (xs[i] % 2 == 0) xs.RemoveAt(i);\nConsole.WriteLine(string.Join(",", xs));'),
      { h: "Sort, reverse, add many" },
      run("sort", "a list sorts in place", 'var xs = new List<int> { 5, 2, 8 };\nxs.AddRange(new[] { 1, 9 });\nxs.Sort();\nConsole.WriteLine(string.Join(" ", xs));\nxs.Reverse();\nConsole.WriteLine(string.Join(" ", xs));'),
      { h: "To and from arrays" },
      run("convert", "ToArray and a list from an array", 'int[] a = { 3, 1, 2 };\nvar list = new List<int>(a);\nlist.Add(4);\nint[] back = list.ToArray();\nConsole.WriteLine(back.Length + " " + a.Length);'),
      page("Under the hood"),
      { ul: [ "A list keeps an array inside. When it is full, `Add` makes one twice as big and copies across.", "So `Add` at the end is O(1) on average; `Insert` and `RemoveAt` near the front move every later item: O(n).", "`Contains` and `IndexOf` look at each item in turn: O(n). For \"have I seen it?\" use a set (4.4)." ] },
      page("Pitfalls"),
      { h: "Length on a list — CS1061" },
      run("pit-length", "a list has Count", 'var xs = new List<int> { 1, 2 };\nConsole.WriteLine(xs.Length);'),
      { h: "The wrong item type — CS1503" },
      run("pit-type", "5 is not a string", 'var words = new List<string>();\nwords.Add(5);'),
      { h: "Changing a list inside foreach — InvalidOperationException" },
      run("pit-foreach", "the list moved under the loop", 'var xs = new List<int> { 1, 2, 3, 4 };\nforeach (int x in xs)\n    if (x % 2 == 0) xs.Remove(x);'),
      { h: "Index Count — ArgumentOutOfRangeException" },
      run("pit-index", "the last item is Count - 1", 'var xs = new List<int> { 1, 2 };\nConsole.WriteLine(xs[xs.Count]);'),
      page("Connections"),
      { ul: [ "**Back:** 4.1's arrays, which a list is built on.", "**Next:** 4.3 looks things up by key instead of position; unit 9 filters lists with LINQ.", "**AQA:** 4.2.1.1 data structures (static and dynamic)." ] },
      page("Good practice"),
      { ul: [ "Default to `List<T>` unless the size is fixed.", "Name lists in the plural: `names`, `scores`.", "Remove while looping only backwards by index (or collect, then remove)." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Shopping list* and *Keep the evens*." ] },
      page("Quick reference"),
      run("qr", "List<T> at a glance", 'var xs = new List<int> { 3, 1 };\nxs.Add(2);          // 3,1,2\nxs.Insert(0, 9);    // 9,3,1,2\nxs.Remove(3);       // 9,1,2\nxs.Sort();          // 1,2,9\nConsole.WriteLine($"{xs.Count}: {string.Join(",", xs)}");'),
      { ul: [ "`Add`, `Insert`, `Remove`, `RemoveAt`, `Contains`, `IndexOf`, `Sort`.", "`Count`, not `Length`.", "No changes inside `foreach`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1061", "Length on a list (use Count)", "Pitfalls"], ["CS1503", "an item of the wrong type", "Pitfalls"], ["InvalidOperationException", "the list changed during foreach", "Pitfalls"], ["ArgumentOutOfRangeException", "an index outside 0 to Count − 1", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var xs = new List<int> { 1, 2, 3 };\nxs.Insert(0, 5);\nxs.RemoveAt(2);\nConsole.WriteLine(string.Join(",", xs));', why: "5,1,2,3 then removing index 2 (the 2) leaves 5,1,3.", concepts: ["list-edit"] },
        { id: "p2", src: 'var xs = new List<string> { "a", "b", "a" };\nxs.Remove("a");\nConsole.WriteLine(xs.Count + " " + xs[0]);', why: "Only the first a goes: b, a remain.", concepts: ["list-edit"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the list reports how many items it holds.", src: 'var xs = new List<int> { 4, 5, 6 };\nConsole.WriteLine(xs.@@);', out: "3", concepts: ["list"] }
      ],
      bug: [
        { id: "b1", q: "It should remove every negative number.", src: 'var xs = new List<int> { -1, -2, 3, -4 };\nfor (int i = 0; i < xs.Count; i++)\n    if (xs[i] < 0) xs.RemoveAt(i);\nConsole.WriteLine(string.Join(",", xs));', out: "3", fixedText: "prints 3", why: "Removing moves the next item into index i, which is then skipped. Loop backwards.", concepts: ["list-edit"] }
      ]
    },
    flashcards: [
      ["`Count` or `Length` for a `List<T>`?", "`Count`."],
      ["What does `Remove(x)` return?", "true if it removed the first match, false if there was none."],
      ["`RemoveAt(i)` vs `Remove(x)`?", "RemoveAt removes by position; Remove removes the first equal value."],
      ["Why loop backwards when removing by index?", "Removing shifts later items left; going backwards never skips one."],
      ["What happens when a list's inner array is full?", "Add makes one twice as big and copies the items across."],
      ["How do you make a list from an array?", "`new List<int>(array)`."]
    ],
    quiz: [
      { q: "`var xs = new List<int>(); xs.Add(3); xs.Add(4);` — `xs[1]` is…", opts: ["3", "4", "1", "an error"], ans: 1, why: "Items are indexed from 0." },
      { q: "Removing items inside `foreach (var x in xs)` gives…", opts: ["the new list", "InvalidOperationException", "a compile error", "nothing"], ans: 1, why: "A collection cannot change while it is enumerated." },
      { q: "Which is O(n) on a list?", opts: ["xs[5]", "xs.Add(x) usually", "xs.Contains(x)", "xs.Count"], ans: 2, why: "Contains checks each item." },
      { q: "`xs.Remove(42)` when 42 is not there…", opts: ["throws", "returns false", "removes the last item", "returns -1"], ans: 1, why: "It reports that nothing was removed." }
    ]
  });
  K.add({ tasks: {
    "4.2-shopping": { lesson: "4.2", title: "Shopping list", tier: "warm-up", minutes: 8, concepts: ["list"], requires: ["input-loop"],
      statement: ["Read items, one per line, until a line says `done`.", "Print `N items: a, b, c` — or `No items` if there were none."],
      starter: "",
      examples: [{ stdin: "milk\neggs\ndone", out: "2 items: milk, eggs" }, { stdin: "done", out: "No items" }],
      hidden: [{ stdin: "tea\ndone", out: "1 items: tea" }],
      rules: [uses(/List\s*</, "Collect the items in a List<string>.")],
      hints: ["var items = new List<string>();", "Add each line until it is \"done\".", "string.Join(\", \", items) makes the list."],
      answer: 'var items = new List<string>();\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    items.Add(line);\n    line = Console.ReadLine();\n}\nConsole.WriteLine(items.Count == 0 ? "No items" : $"{items.Count} items: {string.Join(", ", items)}");' },
    "4.2-evens": { lesson: "4.2", title: "Keep the evens", tier: "core", minutes: 12, concepts: ["list", "list-edit"], requires: ["input-loop", "modulo"],
      statement: ["Read whole numbers until `done` into a list.", "Remove every odd number from the list (do not just skip printing them), then print what is left separated by spaces, or `none`."],
      starter: "",
      examples: [{ stdin: "1\n2\n3\n4\ndone", out: "2 4" }],
      hidden: [{ stdin: "1\n3\ndone", out: "none" }, { stdin: "-2\n-3\n6\n6\ndone", out: "-2 6 6" }, { stdin: "done", out: "none" }],
      rules: [uses(/RemoveAt\s*\(|Remove\s*\(|RemoveAll\s*\(/, "Remove the odd numbers from the list itself.")],
      hints: ["Read into a List<int> first.", "Loop from Count - 1 down to 0 and RemoveAt odd ones.", "x % 2 != 0 is odd (it works for negatives too)."],
      answer: 'var xs = new List<int>();\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    xs.Add(int.Parse(line));\n    line = Console.ReadLine();\n}\nfor (int i = xs.Count - 1; i >= 0; i--)\n    if (xs[i] % 2 != 0) xs.RemoveAt(i);\nConsole.WriteLine(xs.Count == 0 ? "none" : string.Join(" ", xs));' }
  } });

  /* ================================================================
     4.3 Counting with Dictionary — the depth reference (plan §4.2)
     ================================================================ */
  lesson("4.3", {
    aqa: "4.2.7.1",
    notes: [
      page("The problem it solves"),
      "Finding a price by name in a list means checking item after item. A **dictionary** goes straight to it by **key**.",
      run("scan", "without a dictionary: a search every time", 'string[] names = { "tea", "milk", "bread" };\ndouble[] prices = { 1.20, 0.95, 1.50 };\nstring want = "bread";\nfor (int i = 0; i < names.Length; i++)\n    if (names[i] == want) Console.WriteLine($"{want}: {prices[i]:F2}");'),
      page("Core idea"),
      run("lookup", "key → value", 'var prices = new Dictionary<string, double>\n{\n    ["tea"] = 1.20,\n    ["milk"] = 0.95\n};\nprices["bread"] = 1.50;\nConsole.WriteLine(prices["bread"]);\nConsole.WriteLine(prices.Count);'),
      { ul: [ "`Dictionary<string, double>`: keys are strings, values are doubles.", "`prices[\"bread\"] = 1.50` adds the key or replaces its value.", "`prices[\"bread\"]` reads it." ] },
      { h: "Counting — the pattern you will use most" },
      run("count", "how many times each word appears", 'string[] words = { "red", "blue", "red", "green", "red" };\nvar counts = new Dictionary<string, int>();\nforeach (string w in words)\n{\n    if (counts.ContainsKey(w)) counts[w]++;\n    else counts[w] = 1;\n}\nforeach (var kv in counts) Console.WriteLine($"{kv.Key}: {kv.Value}");'),
      page("Rules"),
      { ul: [
        "Keys are unique. `Add` with a key already there throws `ArgumentException`.",
        "Writing through the indexer adds a new key or replaces the old value — it never throws.",
        "Reading a key that is not there throws `KeyNotFoundException`.",
        "A `null` key throws `ArgumentNullException`.",
        "Enumeration order is not a promise. Today it is usually insertion order; never rely on it — sort if order matters."
      ] },
      run("add-vs-index", "Add refuses a duplicate; the indexer replaces", 'var d = new Dictionary<string, int>();\nd["a"] = 1;\nd["a"] = 2;\nConsole.WriteLine(d["a"]);\nConsole.WriteLine(d.TryAdd("a", 3));\nConsole.WriteLine(d["a"]);'),
      page("Variations"),
      { h: "Reading a key that might be missing" },
      run("tryget", "TryGetValue: one lookup, no exception", 'var stock = new Dictionary<string, int> { ["apple"] = 4 };\nforeach (string item in new[] { "apple", "pear" })\n{\n    if (stock.TryGetValue(item, out int n)) Console.WriteLine($"{item}: {n}");\n    else Console.WriteLine($"{item}: none");\n}'),
      { h: "The one-line count" },
      run("getordefault", "GetValueOrDefault gives 0 for a new key", 'var counts = new Dictionary<char, int>();\nforeach (char c in "banana")\n    counts[c] = counts.GetValueOrDefault(c) + 1;\nforeach (var (ch, n) in counts) Console.WriteLine($"{ch} {n}");'),
      { h: "Grouping: a list per key" },
      run("group", "words grouped by length", 'var byLength = new Dictionary<int, List<string>>();\nforeach (string w in new[] { "cat", "emu", "bird", "fish", "ox" })\n{\n    if (!byLength.ContainsKey(w.Length)) byLength[w.Length] = new List<string>();\n    byLength[w.Length].Add(w);\n}\nforeach (var (len, ws) in byLength) Console.WriteLine($"{len}: {string.Join(" ", ws)}");'),
      { h: "Updating and removing" },
      run("update", "+= on a value; Remove by key", 'var scores = new Dictionary<string, int> { ["Ada"] = 10, ["Kai"] = 7 };\nscores["Kai"] += 5;\nscores.Remove("Ada");\nConsole.WriteLine(string.Join(", ", scores.Keys) + " → " + string.Join(", ", scores.Values));'),
      { h: "Keys that ignore case" },
      run("ignorecase", "StringComparer.OrdinalIgnoreCase", 'var votes = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);\nforeach (string v in new[] { "Yes", "yes", "NO", "YES" })\n    votes[v] = votes.GetValueOrDefault(v) + 1;\nforeach (var kv in votes) Console.WriteLine($"{kv.Key}: {kv.Value}");'),
      { h: "Remembering answers (memoisation)" },
      run("memo", "a dictionary as a cache", 'var memo = new Dictionary<int, long>();\nConsole.WriteLine(Fib(50));\n\nlong Fib(int n)\n{\n    if (n < 2) return n;\n    if (memo.TryGetValue(n, out long known)) return known;\n    long v = Fib(n - 1) + Fib(n - 2);\n    memo[n] = v;\n    return v;\n}'),
      page("Under the hood"),
      { ul: [ "Each key is turned into a number by its **hash code**; the number picks a **bucket**.", "Looking up goes straight to that bucket, so it is O(1) on average — however many keys there are.", "Two keys can share a bucket (a **collision**); then they are compared with `Equals`.", "When the table fills up it grows and every key is re-hashed into new buckets.", "So a key must not change after it is added: its hash would point to the wrong bucket and it would be lost." ] },
      page("Pitfalls"),
      { h: "Reading a missing key — KeyNotFoundException" },
      run("pit-missing", "pear was never added", 'var stock = new Dictionary<string, int> { ["apple"] = 4 };\nConsole.WriteLine(stock["pear"]);'),
      { h: "Add twice — ArgumentException" },
      run("pit-dup", "Add will not replace", 'var d = new Dictionary<string, int>();\nd.Add("a", 1);\nd.Add("a", 2);'),
      { h: "Length on a dictionary — CS1061" },
      run("pit-length", "it has Count", 'var d = new Dictionary<string, int> { ["a"] = 1 };\nConsole.WriteLine(d.Length);'),
      { h: "Removing while enumerating — InvalidOperationException" },
      run("pit-modify", "the keys changed under the loop", 'var d = new Dictionary<string, int> { ["a"] = 1, ["b"] = 0 };\nforeach (var kv in d)\n    if (kv.Value == 0) d.Remove(kv.Key);'),
      { h: "Two lookups where one will do" },
      "`if (d.ContainsKey(k)) x = d[k];` looks the key up twice. `TryGetValue` does it once.",
      page("Choosing"),
      { table: { head: ["You need", "Use"], rows: [["look up a value by a key", "`Dictionary<K, V>`"], ["items in order, by position", "`List<T>` or an array"], ["only \"is it there?\"", "`HashSet<T>` (4.4)"], ["keys always in sorted order", "`SortedDictionary<K, V>`"], ["keys that are 0, 1, 2 … n − 1", "an array indexed by number"]] } },
      page("Connections"),
      { ul: [ "**Back:** 4.1 arrays and `foreach`; 3.5's `out` in `TryGetValue`.", "**Later:** unit 9's `GroupBy` and `ToDictionary`; unit 12 builds a hash table from scratch.", "**AQA:** 4.2.7.1 dictionaries; 4.2.6.1 hash tables." ] },
      page("Good practice"),
      { ul: [ "Name a dictionary for what it maps: `priceByItem`, `countByWord`.", "Use `TryGetValue` when a key might be missing.", "Count with `d[k] = d.GetValueOrDefault(k) + 1`." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Word count* and *Price list*." ] },
      page("Quick reference"),
      run("qr", "Dictionary at a glance", 'var d = new Dictionary<string, int>();\nd["a"] = 1;                         // add or replace\nd["a"]++;                            // update\nbool has = d.ContainsKey("b");       // False\nint b = d.GetValueOrDefault("b");    // 0\nif (d.TryGetValue("a", out int a)) Console.WriteLine(a + " " + has + " " + b);'),
      { ul: [ "Indexer: add or replace. `Add`: throws on a duplicate.", "Missing key: `TryGetValue`, `GetValueOrDefault`, or `KeyNotFoundException`.", "O(1) lookups on average.", "Do not change a dictionary inside its own `foreach`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["KeyNotFoundException", "read a key that is not there", "Pitfalls"], ["ArgumentException", "Add with a key already there", "Pitfalls"], ["CS1061", "Length on a dictionary (use Count)", "Pitfalls"], ["InvalidOperationException", "changed during foreach", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var d = new Dictionary<string, int>();\nd["x"] = 1;\nd["x"] = 5;\nd["y"] = 2;\nConsole.WriteLine(d.Count + " " + d["x"]);', why: "The second write replaces x: two keys, x is 5.", concepts: ["dictionary"] },
        { id: "p2", src: 'var d = new Dictionary<string, int> { ["a"] = 3 };\nConsole.WriteLine(d.GetValueOrDefault("b") + d.GetValueOrDefault("a"));', why: "A missing int value defaults to 0: 0 + 3.", concepts: ["trygetvalue"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so each letter is counted.", src: 'var c = new Dictionary<char, int>();\nforeach (char ch in "abca")\n    c[ch] = c.@@(ch) + 1;\nConsole.WriteLine(c[\'a\']);', out: "2", concepts: ["counting"] }
      ],
      bug: [
        { id: "b1", q: "It should print 0 for a colour nobody chose.", src: 'var votes = new Dictionary<string, int> { ["red"] = 2 };\nConsole.WriteLine(votes["blue"]);', out: "0", fixedText: "prints 0", why: "Reading a missing key throws. Use GetValueOrDefault or TryGetValue.", concepts: ["trygetvalue"] }
      ]
    },
    flashcards: [
      ["Indexer write vs `Add` on an existing key?", "The indexer replaces the value; Add throws ArgumentException."],
      ["Reading a key that is not there?", "KeyNotFoundException."],
      ["The safe way to read a key that might be missing?", "`TryGetValue(key, out var v)` (or GetValueOrDefault)."],
      ["The one-line counting idiom?", "`d[k] = d.GetValueOrDefault(k) + 1;`"],
      ["Why is a dictionary lookup O(1) on average?", "The key's hash code picks its bucket directly."],
      ["Can you rely on a dictionary's enumeration order?", "No — sort if order matters."],
      ["How do you make string keys ignore case?", "`new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)`."]
    ],
    quiz: [
      { q: "`d.Add(\"k\", 1); d.Add(\"k\", 2);` gives…", opts: ["k = 2", "k = 1", "ArgumentException", "a compile error"], ans: 2, why: "Add refuses a duplicate key." },
      { q: "`d[\"k\"] = 1; d[\"k\"] = 2;` gives…", opts: ["k = 2", "k = 1", "ArgumentException", "two keys"], ans: 0, why: "The indexer replaces." },
      { q: "Which reads a possibly-missing key with ONE lookup?", opts: ["ContainsKey then d[k]", "TryGetValue", "d[k] in try/catch", "Keys.Contains"], ans: 1, why: "TryGetValue checks and reads together." },
      { q: "A dictionary is the right choice for…", opts: ["the 3rd item", "a price by product name", "a fixed grid", "first in, first out"], ans: 1, why: "Look up by key." }
    ]
  });
  K.add({ tasks: {
    "4.3-wordcount": { lesson: "4.3", title: "Word count", tier: "core", minutes: 15, concepts: ["dictionary", "counting"], requires: ["foreach"],
      statement: ["Read one line of words separated by single spaces (`line.Split(' ')` gives the words).", "Print each different word with its count as `word: n`, in the order each word first appears."],
      starter: 'string[] words = Console.ReadLine().Split(\' \');\n',
      examples: [{ stdin: "the cat and the hat", out: "the: 2\ncat: 1\nand: 1\nhat: 1" }],
      hidden: [{ stdin: "a", out: "a: 1" }, { stdin: "b a b a b", out: "b: 3\na: 2" }],
      rules: [uses(/Dictionary\s*</, "Count with a Dictionary<string, int>.")],
      hints: ["A dictionary keeps the counts; a list keeps the first-seen order.", "counts[w] = counts.GetValueOrDefault(w) + 1; and add w to order the first time.", "Print by walking the order list and reading counts[w]."],
      answer: 'string[] words = Console.ReadLine().Split(\' \');\nvar counts = new Dictionary<string, int>();\nvar order = new List<string>();\nforeach (string w in words)\n{\n    if (!counts.ContainsKey(w)) order.Add(w);\n    counts[w] = counts.GetValueOrDefault(w) + 1;\n}\nforeach (string w in order) Console.WriteLine($"{w}: {counts[w]}");' },
    "4.3-prices": { lesson: "4.3", title: "Price list", tier: "core", minutes: 15, concepts: ["dictionary", "trygetvalue"], requires: ["input-loop", "format"],
      statement: ["Prices: tea 1.20, milk 0.95, bread 1.50, eggs 2.10 (put them in a `Dictionary<string, decimal>`).", "Read item names until `done`. For each known item print `item: £X.XX`; for an unknown one print `unknown: item`.", "Finally print `Total: £X.XX` for the known items."],
      starter: "var prices = new Dictionary<string, decimal>\n{\n    [\"tea\"] = 1.20m, [\"milk\"] = 0.95m, [\"bread\"] = 1.50m, [\"eggs\"] = 2.10m\n};\n",
      examples: [{ stdin: "tea\njam\nbread\ndone", out: "tea: £1.20\nunknown: jam\nbread: £1.50\nTotal: £2.70" }],
      hidden: [{ stdin: "done", out: "Total: £0.00" }, { stdin: "eggs\neggs\nmilk\ndone", out: "eggs: £2.10\neggs: £2.10\nmilk: £0.95\nTotal: £5.15" }],
      rules: [uses(/TryGetValue|GetValueOrDefault|ContainsKey/, "Check for a missing item without throwing.")],
      hints: ["Loop until done.", "if (prices.TryGetValue(item, out decimal p)) { … total += p; } else …", "Format money with :F2 after a £."],
      answer: 'var prices = new Dictionary<string, decimal>\n{\n    ["tea"] = 1.20m, ["milk"] = 0.95m, ["bread"] = 1.50m, ["eggs"] = 2.10m\n};\ndecimal total = 0;\nstring item = Console.ReadLine();\nwhile (item != "done")\n{\n    if (prices.TryGetValue(item, out decimal p))\n    {\n        Console.WriteLine($"{item}: £{p:F2}");\n        total += p;\n    }\n    else Console.WriteLine($"unknown: {item}");\n    item = Console.ReadLine();\n}\nConsole.WriteLine($"Total: £{total:F2}");' }
  } });

  /* ================================================================
     4.4 HashSet and uniqueness
     ================================================================ */
  lesson("4.4", {
    aqa: "4.2.1.1",
    notes: [
      page("The problem it solves"),
      { ul: [ "\"Have I seen this before?\" with a list means `Contains`, which checks every item.", "A **`HashSet<T>`** answers in one step and keeps each item at most once." ] },
      page("Core idea"),
      run("add", "Add says whether it was new", 'var seen = new HashSet<string>();\nConsole.WriteLine(seen.Add("ada"));\nConsole.WriteLine(seen.Add("kai"));\nConsole.WriteLine(seen.Add("ada"));\nConsole.WriteLine(seen.Count + " " + seen.Contains("kai"));'),
      run("unique", "how many different values?", 'int[] rolls = { 3, 6, 3, 1, 6, 6 };\nvar faces = new HashSet<int>(rolls);\nConsole.WriteLine($"{faces.Count} different faces");'),
      page("Rules"),
      { ul: [
        "A set holds each value at most once; adding it again does nothing and returns `false`.",
        "A set has no index — `set[0]` is a compile error — and no order to rely on.",
        "`Contains` and `Add` are O(1) on average: a set is a dictionary with keys only.",
        "`foreach` visits every item, but the order is not a promise."
      ] },
      run("first-repeat", "stop at the first duplicate", 'var seen = new HashSet<string>();\nforeach (string w in new[] { "to", "be", "or", "not", "to", "be" })\n{\n    if (!seen.Add(w))\n    {\n        Console.WriteLine($"First repeat: {w}");\n        break;\n    }\n}'),
      page("Variations"),
      { h: "Set operations" },
      run("ops", "union, intersect, except", 'var a = new HashSet<int> { 1, 2, 3 };\nvar b = new HashSet<int> { 2, 3, 4 };\nvar both = new HashSet<int>(a); both.IntersectWith(b);\nvar either = new HashSet<int>(a); either.UnionWith(b);\nvar onlyA = new HashSet<int>(a); onlyA.ExceptWith(b);\nConsole.WriteLine(string.Join(",", both));\nConsole.WriteLine(string.Join(",", either));\nConsole.WriteLine(string.Join(",", onlyA));'),
      { h: "Remove duplicates, keep the order" },
      run("dedupe", "a set to check, a list to keep", 'var seen = new HashSet<string>();\nvar kept = new List<string>();\nforeach (string x in new[] { "b", "a", "b", "c", "a" })\n    if (seen.Add(x)) kept.Add(x);\nConsole.WriteLine(string.Join(" ", kept));'),
      { h: "Sorted, when order matters" },
      run("sorted", "SortedSet keeps its items in order", 'var s = new SortedSet<int> { 5, 1, 3, 1 };\nConsole.WriteLine(string.Join(",", s) + " min " + s.Min + " max " + s.Max);'),
      { h: "Comparing sets" },
      run("subset", "is one inside the other?", 'var needed = new HashSet<string> { "key", "lamp" };\nvar carried = new HashSet<string> { "lamp", "map", "key" };\nConsole.WriteLine(needed.IsSubsetOf(carried));\nConsole.WriteLine(needed.SetEquals(carried));'),
      page("Pitfalls"),
      { h: "Indexing a set — CS0021" },
      run("pit-index", "a set has no positions", 'var s = new HashSet<int> { 1, 2 };\nConsole.WriteLine(s[0]);'),
      { h: "Expecting duplicates to be counted" },
      run("pit-count", "Count is how many DIFFERENT values", 'var s = new HashSet<string> { "a", "a", "b" };\nConsole.WriteLine(s.Count);'),
      { h: "Contains on a big list" },
      "`list.Contains(x)` inside a loop over the same list is O(n²). Put the items in a set first.",
      page("Connections"),
      { ul: [ "**Back:** 4.3 — a set is a dictionary without values.", "**Later:** unit 9's `Distinct()`; unit 12 hashing.", "**AQA:** 4.2.1.1 data structures; sets in 4.4.1 (theory of computation)." ] },
      page("Good practice"),
      { ul: [ "Reach for a set whenever the question is \"is it there?\" or \"how many different?\".", "Use `if (!seen.Add(x))` to test and record in one step." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *First repeat* and *In both*." ] },
      page("Quick reference"),
      run("qr", "HashSet at a glance", 'var s = new HashSet<int> { 1, 2 };\nbool added = s.Add(2);       // False — already there\ns.UnionWith(new[] { 3 });\nConsole.WriteLine($"{added} {s.Count} {s.Contains(3)}");'),
      { ul: [ "Each value once; `Add` returns whether it was new.", "No index, no order.", "`UnionWith`, `IntersectWith`, `ExceptWith`; `SortedSet` for order." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0021", "indexing a set", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var s = new HashSet<char>();\nforeach (char c in "letter") s.Add(c);\nConsole.WriteLine(s.Count);', why: "l, e, t, r — four different letters.", concepts: ["hashset"] },
        { id: "p2", src: 'var a = new HashSet<int> { 1, 2, 3 };\na.ExceptWith(new[] { 2, 5 });\nConsole.WriteLine(string.Join(",", a));', why: "2 goes; 5 was never there.", concepts: ["set-ops"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so only new names are printed.", src: 'var seen = new HashSet<string>();\nforeach (string n in new[] { "a", "b", "a" })\n    if (seen.@@(n)) Console.WriteLine(n);', out: "a\nb", concepts: ["hashset"] }
      ],
      bug: [
        { id: "b1", q: "It should print how many DIFFERENT numbers there are.", src: 'int[] xs = { 4, 4, 7, 1, 7 };\nvar list = new List<int>(xs);\nConsole.WriteLine(list.Count);', out: "3", fixedText: "prints 3", why: "A list keeps duplicates; a HashSet<int> does not.", concepts: ["hashset"] }
      ]
    },
    flashcards: [
      ["What does `set.Add(x)` return?", "true if x was new, false if it was already there."],
      ["Can you write `set[0]`?", "No — a set has no index (CS0021)."],
      ["Cost of `Contains` on a HashSet vs a List?", "O(1) on average vs O(n)."],
      ["`IntersectWith` keeps…", "only the items in both sets."],
      ["How do you keep order and remove duplicates?", "A HashSet to check, a List to keep, adding when seen.Add(x) is true."],
      ["A set in order?", "`SortedSet<T>`."]
    ],
    quiz: [
      { q: "`new HashSet<int> { 1, 1, 2 }.Count` is…", opts: ["3", "2", "1", "an error"], ans: 1, why: "Duplicates are kept once." },
      { q: "Which question suits a set best?", opts: ["the 3rd item", "have I seen this word?", "the count of each word", "first come, first served"], ans: 1, why: "Membership." },
      { q: "`a.UnionWith(b)` leaves `a` holding…", opts: ["items in both", "items in either", "items only in a", "b only"], ans: 1, why: "Union is everything from either." }
    ]
  });
  K.add({ tasks: {
    "4.4-repeat": { lesson: "4.4", title: "First repeat", tier: "warm-up", minutes: 10, concepts: ["hashset"], requires: ["input-loop"],
      statement: ["Read words until `done`.", "Print the first word that appears for the second time, as `Repeat: word` — or `No repeats`."],
      starter: "",
      examples: [{ stdin: "to\nbe\nor\nnot\nto\nbe\ndone", out: "Repeat: to" }, { stdin: "a\nb\ndone", out: "No repeats" }],
      hidden: [{ stdin: "x\nx\ndone", out: "Repeat: x" }, { stdin: "done", out: "No repeats" }, { stdin: "a\nb\nb\na\ndone", out: "Repeat: b" }],
      rules: [uses(/HashSet\s*</, "Remember the words in a HashSet<string>.")],
      hints: ["seen.Add(w) is false when w was already there.", "Stop reading at the first repeat — but the rest of the input can be left unread.", "Use a found flag or a result variable set to null at first."],
      answer: 'var seen = new HashSet<string>();\nstring found = null;\nstring w = Console.ReadLine();\nwhile (w != "done")\n{\n    if (!seen.Add(w))\n    {\n        found = w;\n        break;\n    }\n    w = Console.ReadLine();\n}\nConsole.WriteLine(found == null ? "No repeats" : $"Repeat: {found}");' },
    "4.4-common": { lesson: "4.4", title: "In both", tier: "core", minutes: 15, concepts: ["hashset", "set-ops"], requires: ["sorting"],
      statement: ["Two lines, each whole numbers separated by spaces.", "Print the numbers found in BOTH lines, each once, in ascending order, separated by spaces — or `none`."],
      starter: "string[] a = Console.ReadLine().Split(' ');\nstring[] b = Console.ReadLine().Split(' ');\n",
      examples: [{ stdin: "4 1 9 4\n9 2 4", out: "4 9" }],
      hidden: [{ stdin: "1 2\n3 4", out: "none" }, { stdin: "5 5 5\n5", out: "5" }, { stdin: "10 -1 3\n3 10 -1", out: "-1 3 10" }],
      rules: [uses(/HashSet\s*<|SortedSet\s*</, "Use a set for each line.")],
      hints: ["Parse each part with int.Parse into a HashSet<int>.", "first.IntersectWith(second);", "Copy into a List<int>, Sort, then string.Join — or use a SortedSet."],
      answer: 'string[] a = Console.ReadLine().Split(\' \');\nstring[] b = Console.ReadLine().Split(\' \');\nvar first = new SortedSet<int>();\nforeach (string s in a) first.Add(int.Parse(s));\nvar second = new HashSet<int>();\nforeach (string s in b) second.Add(int.Parse(s));\nfirst.IntersectWith(second);\nConsole.WriteLine(first.Count == 0 ? "none" : string.Join(" ", first));' }
  } });

  /* ================================================================
     4.5 Queues and stacks
     ================================================================ */
  lesson("4.5", {
    aqa: "4.2.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [ "Some data is used in the order it arrived — a print queue, a waiting list.", "Some is used newest first — undo, going back, matching brackets.", "A **queue** is first in, first out (FIFO); a **stack** is last in, first out (LIFO)." ] },
      page("Core idea"),
      run("queue", "Enqueue at the back, Dequeue from the front", 'var q = new Queue<string>();\nq.Enqueue("Ada");\nq.Enqueue("Kai");\nq.Enqueue("Lin");\nConsole.WriteLine(q.Peek() + " is next, " + q.Count + " waiting");\nConsole.WriteLine("Served " + q.Dequeue());\nConsole.WriteLine(string.Join(", ", q));'),
      run("stack", "Push on top, Pop from the top", 'var s = new Stack<int>();\ns.Push(1);\ns.Push(2);\ns.Push(3);\nConsole.WriteLine(s.Pop() + " then " + s.Peek());\nConsole.WriteLine(string.Join(", ", s));'),
      page("Rules"),
      { ul: [
        "`Dequeue`/`Pop` remove and return; `Peek` returns without removing.",
        "On an empty queue or stack, `Dequeue`, `Pop` and `Peek` throw `InvalidOperationException`.",
        "`TryDequeue`/`TryPop` return `false` instead of throwing.",
        "A queue has `Enqueue`/`Dequeue`; a stack has `Push`/`Pop` — not each other's.",
        "`foreach` visits the items without removing them: a queue front to back, a stack top to bottom."
      ] },
      run("try", "Try… never throws", 'var q = new Queue<int>();\nConsole.WriteLine(q.TryDequeue(out int x) + " " + x);\nq.Enqueue(7);\nConsole.WriteLine(q.TryDequeue(out x) + " " + x);'),
      page("Variations"),
      { h: "Reverse with a stack" },
      run("reverse", "push every letter, pop them back", 'var s = new Stack<char>();\nforeach (char c in "stressed") s.Push(c);\nwhile (s.Count > 0) Console.Write(s.Pop());\nConsole.WriteLine();'),
      { h: "Matching brackets" },
      run("brackets", "each closer must match the last opener", 'Console.WriteLine(Balanced("(a[b]c)"));\nConsole.WriteLine(Balanced("(a[b)c]"));\n\nbool Balanced(string text)\n{\n    var open = new Stack<char>();\n    foreach (char c in text)\n    {\n        if (c == \'(\' || c == \'[\') open.Push(c);\n        else if (c == \')\' || c == \']\')\n        {\n            if (open.Count == 0) return false;\n            char o = open.Pop();\n            if ((c == \')\' && o != \'(\') || (c == \']\' && o != \'[\')) return false;\n        }\n    }\n    return open.Count == 0;\n}'),
      { h: "Taking turns" },
      run("turns", "a round-robin with a queue", 'var players = new Queue<string>(new[] { "A", "B", "C" });\nfor (int turn = 1; turn <= 5; turn++)\n{\n    string p = players.Dequeue();\n    Console.Write(p);\n    players.Enqueue(p);\n}\nConsole.WriteLine();'),
      page("Under the hood"),
      { ul: [ "A stack is an array with a top index: push and pop are O(1).", "A queue is a **circular** array: the front and back indexes wrap round, so dequeue is O(1) too.", "AQA's linear, circular and priority queues are this idea built by hand." ] },
      page("Pitfalls"),
      { h: "Push on a queue — CS1061" },
      run("pit-push", "a queue enqueues", 'var q = new Queue<int>();\nq.Push(1);'),
      { h: "Taking from an empty queue — InvalidOperationException" },
      run("pit-empty", "nothing to dequeue", 'var q = new Queue<int>();\nConsole.WriteLine(q.Dequeue());'),
      { h: "Expecting foreach to empty it" },
      run("pit-foreach", "foreach only looks", 'var q = new Queue<int>(new[] { 1, 2 });\nforeach (int x in q) Console.Write(x);\nConsole.WriteLine(" still " + q.Count);'),
      page("Connections"),
      { ul: [ "**Back:** 3.7's recursion runs on the call stack.", "**Later:** unit 12's breadth-first search uses a queue, depth-first a stack.", "**AQA:** 4.2.2.1 queues, 4.2.3.1 stacks, 4.3.3.1 Reverse Polish." ] },
      page("Good practice"),
      { ul: [ "Check `Count` (or use `Try…`) before taking from a queue or stack you did not just fill.", "Name by role: `waiting`, `undo`, `open`." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Waiting list* and *Balanced brackets*." ] },
      page("Quick reference"),
      run("qr", "queue and stack side by side", 'var q = new Queue<int>(); var s = new Stack<int>();\nforeach (int x in new[] { 1, 2, 3 }) { q.Enqueue(x); s.Push(x); }\nConsole.WriteLine($"queue gives {q.Dequeue()}, stack gives {s.Pop()}");'),
      { ul: [ "Queue: `Enqueue`, `Dequeue`, `Peek` — FIFO.", "Stack: `Push`, `Pop`, `Peek` — LIFO.", "Empty: throws; `Try…` returns false." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1061", "a stack method on a queue (or the reverse)", "Pitfalls"], ["InvalidOperationException", "taking from an empty queue or stack", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var s = new Stack<string>();\ns.Push("a"); s.Push("b"); s.Push("c");\ns.Pop();\nConsole.WriteLine(s.Peek());', why: "c is popped; b is now on top.", concepts: ["stack"] },
        { id: "p2", src: 'var q = new Queue<int>();\nq.Enqueue(5); q.Enqueue(6);\nq.Dequeue();\nq.Enqueue(7);\nConsole.WriteLine(string.Join(",", q));', why: "5 leaves the front; 7 joins the back.", concepts: ["queue"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to take the next customer.", src: 'var q = new Queue<string>(new[] { "Ada", "Kai" });\nConsole.WriteLine(q.@@());', out: "Ada", concepts: ["queue"] }
      ],
      bug: [
        { id: "b1", q: "It should print the letters in reverse: cba.", src: 'var q = new Queue<char>();\nforeach (char c in "abc") q.Enqueue(c);\nwhile (q.Count > 0) Console.Write(q.Dequeue());\nConsole.WriteLine();', out: "cba", fixedText: "prints cba", why: "A queue keeps the order; reversing needs a stack.", concepts: ["stack"] }
      ]
    },
    flashcards: [
      ["Queue order?", "First in, first out (FIFO)."],
      ["Stack order?", "Last in, first out (LIFO)."],
      ["Peek vs Pop?", "Peek returns the top without removing it; Pop removes it."],
      ["Dequeue on an empty queue?", "InvalidOperationException (TryDequeue returns false instead)."],
      ["A classic stack job?", "Matching brackets, undo, reversing."],
      ["A classic queue job?", "Waiting lists, taking turns, breadth-first search."]
    ],
    quiz: [
      { q: "Push 1, 2, 3 then Pop: you get…", opts: ["1", "2", "3", "an error"], ans: 2, why: "The last in comes out first." },
      { q: "Enqueue 1, 2, 3 then Dequeue: you get…", opts: ["1", "2", "3", "an error"], ans: 0, why: "First in, first out." },
      { q: "Which suits \"undo\"?", opts: ["Queue", "Stack", "HashSet", "Dictionary"], ans: 1, why: "The latest action is undone first." }
    ]
  });
  K.add({ tasks: {
    "4.5-waiting": { lesson: "4.5", title: "Waiting list", tier: "core", minutes: 15, concepts: ["queue"], requires: ["input-loop"],
      statement: ["Commands, one per line, until `done`: `join NAME` adds NAME to the back; `serve` serves the front.", "For `serve` print `Serving NAME`, or `Nobody waiting` if the queue is empty.", "At the end print `Still waiting: a, b` — or `Queue empty`."],
      starter: "",
      examples: [{ stdin: "join Ada\njoin Kai\nserve\njoin Lin\ndone", out: "Serving Ada\nStill waiting: Kai, Lin" }],
      hidden: [{ stdin: "serve\ndone", out: "Nobody waiting\nQueue empty" }, { stdin: "join A\nserve\nserve\ndone", out: "Serving A\nNobody waiting\nQueue empty" }],
      rules: [uses(/Queue\s*</, "Keep the waiting list in a Queue<string>.")],
      hints: ["line.StartsWith(\"join \") then line.Substring(5) is the name.", "if (q.Count == 0) … else Console.WriteLine(\"Serving \" + q.Dequeue());", "string.Join(\", \", q) lists the rest."],
      answer: 'var q = new Queue<string>();\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    if (line.StartsWith("join ")) q.Enqueue(line.Substring(5));\n    else if (line == "serve") Console.WriteLine(q.Count == 0 ? "Nobody waiting" : "Serving " + q.Dequeue());\n    line = Console.ReadLine();\n}\nConsole.WriteLine(q.Count == 0 ? "Queue empty" : "Still waiting: " + string.Join(", ", q));' },
    "4.5-brackets": { lesson: "4.5", title: "Balanced brackets", tier: "stretch", minutes: 20, concepts: ["stack"], requires: ["foreach", "methods"],
      statement: ["Read one line. It is balanced if every `(`, `[` and `{` is closed by its own partner in the right order.", "Print `Balanced` or `Not balanced`. Other characters are ignored."],
      starter: "",
      examples: [{ stdin: "{a(b)[c]}", out: "Balanced" }, { stdin: "(]", out: "Not balanced" }],
      hidden: [{ stdin: "((", out: "Not balanced" }, { stdin: "x", out: "Balanced" }, { stdin: ")(", out: "Not balanced" }, { stdin: "{[()()]}", out: "Balanced" }],
      rules: [uses(/Stack\s*</, "Use a Stack<char> of open brackets.")],
      hints: ["Push every opener.", "On a closer: the stack must not be empty, and Pop must be its partner.", "At the end the stack must be empty."],
      answer: 'string text = Console.ReadLine();\nConsole.WriteLine(Balanced(text) ? "Balanced" : "Not balanced");\n\nbool Balanced(string s)\n{\n    var open = new Stack<char>();\n    foreach (char c in s)\n    {\n        if (c == \'(\' || c == \'[\' || c == \'{\') open.Push(c);\n        else if (c == \')\' || c == \']\' || c == \'}\')\n        {\n            if (open.Count == 0) return false;\n            char o = open.Pop();\n            if ((c == \')\' && o != \'(\') || (c == \']\' && o != \'[\') || (c == \'}\' && o != \'{\')) return false;\n        }\n    }\n    return open.Count == 0;\n}' }
  } });

  /* ================================================================
     4.6 Multi-dimensional arrays
     ================================================================ */
  lesson("4.6", {
    aqa: "4.2.1.2",
    notes: [
      page("The problem it solves"),
      { ul: [ "A seating plan, a game board or a spreadsheet has rows AND columns.", "A **2-D array** `int[,]` holds a rectangle of values, reached by row and column.", "A **jagged array** `int[][]` holds rows of different lengths." ] },
      page("Core idea"),
      run("grid", "rows × columns", 'int[,] g = new int[2, 3];\ng[1, 2] = 5;\nConsole.WriteLine($"{g.GetLength(0)} rows, {g.GetLength(1)} columns, {g.Length} cells");\nfor (int r = 0; r < g.GetLength(0); r++)\n{\n    for (int c = 0; c < g.GetLength(1); c++) Console.Write(g[r, c] + " ");\n    Console.WriteLine();\n}'),
      run("init", "values row by row", 'int[,] m = { { 1, 2, 3 }, { 4, 5, 6 } };\nConsole.WriteLine(m[1, 0]);\nint total = 0;\nforeach (int v in m) total += v;\nConsole.WriteLine(total);'),
      page("Rules"),
      { ul: [
        "`g[r, c]`: row first, then column; both count from 0.",
        "`GetLength(0)` is the number of rows, `GetLength(1)` the columns; `Length` is every cell.",
        "Every row of an `int[,]` has the same length — an uneven initializer is a compile error.",
        "`foreach` over a 2-D array visits every cell, row by row.",
        "A jagged array is an array of arrays: `j[r][c]`, and each row has its own `Length`."
      ] },
      run("jagged", "each row its own size", 'int[][] tri = new int[3][];\nfor (int r = 0; r < tri.Length; r++)\n{\n    tri[r] = new int[r + 1];\n    for (int c = 0; c <= r; c++) tri[r][c] = c + 1;\n}\nforeach (int[] row in tri) Console.WriteLine(string.Join(" ", row));'),
      page("Variations"),
      { h: "A game board" },
      run("board", "a 3 × 3 board of chars", 'char[,] board = new char[3, 3];\nfor (int r = 0; r < 3; r++)\n    for (int c = 0; c < 3; c++) board[r, c] = \'.\';\nboard[1, 1] = \'X\';\nboard[0, 2] = \'O\';\nfor (int r = 0; r < 3; r++)\n{\n    for (int c = 0; c < 3; c++) Console.Write(board[r, c]);\n    Console.WriteLine();\n}'),
      { h: "Row and column totals" },
      run("sums", "one loop per direction", 'int[,] m = { { 1, 2, 3 }, { 4, 5, 6 } };\nfor (int r = 0; r < m.GetLength(0); r++)\n{\n    int s = 0;\n    for (int c = 0; c < m.GetLength(1); c++) s += m[r, c];\n    Console.WriteLine($"row {r}: {s}");\n}\nfor (int c = 0; c < m.GetLength(1); c++)\n{\n    int s = 0;\n    for (int r = 0; r < m.GetLength(0); r++) s += m[r, c];\n    Console.Write(s + " ");\n}\nConsole.WriteLine();'),
      { h: "Three dimensions and more" },
      "Each extra comma adds a dimension. `int[,,]` has `Rank` 3, one `GetLength` per dimension, and `Length` counts every cell.",
      run("cube", "weeks × sites × readings", 'int[,,] temps = new int[2, 3, 4];   // 2 weeks × 3 sites × 4 readings\ntemps[1, 2, 3] = 18;\ntemps[0, 1, 0] = 12;\nConsole.WriteLine($"{temps.Rank} dimensions, {temps.Length} cells");\nConsole.WriteLine($"{temps.GetLength(0)} × {temps.GetLength(1)} × {temps.GetLength(2)}");\nint count = 0;\nfor (int w = 0; w < temps.GetLength(0); w++)\n    for (int s = 0; s < temps.GetLength(1); s++)\n        for (int r = 0; r < temps.GetLength(2); r++)\n            if (temps[w, s, r] > 0) count++;\nConsole.WriteLine($"{count} readings taken; temps[1, 2, 3] = {temps[1, 2, 3]}");'),
      run("cube-init", "a 2 × 2 × 2 initializer", 'int[,,] c = { { { 1, 2 }, { 3, 4 } }, { { 5, 6 }, { 7, 8 } } };\nConsole.WriteLine(c[1, 0, 1]);\nint sum = 0;\nforeach (int v in c) sum += v;\nConsole.WriteLine(sum);'),
      "Past three dimensions, a class (unit 7) or a dictionary keyed by a tuple (4.7) usually reads better than `[,,,]`.",
      { h: "Neighbours" },
      run("neighbours", "stay inside the grid", 'int rows = 3, cols = 4;\nint r0 = 0, c0 = 3;\nint n = 0;\nfor (int dr = -1; dr <= 1; dr++)\n    for (int dc = -1; dc <= 1; dc++)\n    {\n        if (dr == 0 && dc == 0) continue;\n        int r = r0 + dr, c = c0 + dc;\n        if (r >= 0 && r < rows && c >= 0 && c < cols) n++;\n    }\nConsole.WriteLine($"A corner cell has {n} neighbours");'),
      page("Under the hood"),
      { ul: [ "An `int[,]` is ONE block: cell (r, c) sits at r × columns + c.", "A jagged `int[][]` is an array of separate row arrays, each allocated on its own — which is why rows can differ, and why a row can be `null` until it is made." ] },
      page("Pitfalls"),
      { h: "Jagged syntax on a 2-D array — CS0022" },
      run("pit-syntax", "a 2-D array takes [r, c]", 'int[,] g = new int[2, 2];\nConsole.WriteLine(g[0][1]);'),
      { h: "Rows and columns swapped — IndexOutOfRangeException" },
      run("pit-swap", "GetLength(1) used for rows", 'int[,] g = new int[2, 3];\nfor (int r = 0; r < g.GetLength(1); r++)\n    Console.WriteLine(g[r, 0]);'),
      { h: "A jagged row never made — NullReferenceException" },
      run("pit-null", "rows start as null", 'int[][] j = new int[2][];\nConsole.WriteLine(j[1].Length);'),
      page("Connections"),
      { ul: [ "**Back:** 4.1 arrays and 2.7 nested loops.", "**Later:** grids are graphs in disguise (unit 12, breadth-first search).", "**AQA:** 4.2.1.2 single- and multi-dimensional arrays." ] },
      page("Good practice"),
      { ul: [ "Name loop variables `r` and `c` (or `row`, `col`), never `i` and `j`, so they are not swapped.", "Use `GetLength(0)` and `GetLength(1)`, never typed numbers." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Row and column totals* and *Noughts and crosses*." ] },
      page("Quick reference"),
      run("qr", "2-D and jagged at a glance", 'int[,] g = { { 1, 2 }, { 3, 4 } };   // g[1, 0] is 3\nint[][] j = { new[] { 1 }, new[] { 2, 3 } };   // j[1][1] is 3\nConsole.WriteLine($"{g[1, 0]} {j[1][1]} {g.GetLength(0)} {j[1].Length}");'),
      { ul: [ "`[r, c]` and `GetLength(0/1)` for `int[,]`.", "`[r][c]` and `row.Length` for `int[][]`.", "Rows first, then columns." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0022", "[r][c] on a 2-D array", "Pitfalls"], ["IndexOutOfRangeException", "a row or column outside the grid", "Pitfalls"], ["NullReferenceException", "a jagged row that was never created", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int[,] g = { { 1, 2, 3 }, { 4, 5, 6 } };\nConsole.WriteLine(g[0, 2] + g[1, 1]);', why: "Row 0 column 2 is 3; row 1 column 1 is 5.", concepts: ["grid"] },
        { id: "p2", src: 'int[,] g = new int[4, 5];\nConsole.WriteLine(g.GetLength(1) + " " + g.Length);', why: "5 columns; 20 cells.", concepts: ["grid"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the number of rows.", src: 'int[,] g = new int[3, 2];\nfor (int r = 0; r < g.GetLength(@@); r++) g[r, 0] = r;\nConsole.WriteLine(g[2, 0]);', out: "2", concepts: ["grid"] }
      ],
      bug: [
        { id: "b1", q: "It should print the 2-D cell at row 1, column 0.", src: 'int[,] g = { { 1, 2 }, { 3, 4 } };\nConsole.WriteLine(g[0, 1]);', out: "3", fixedText: "prints 3", why: "Row comes first: g[1, 0].", concepts: ["grid"] }
      ]
    },
    flashcards: [
      ["`int[,] g = new int[2, 5];` — how many rows?", "2 (`g.GetLength(0)`)."],
      ["Index order in `g[a, b]`?", "Row, then column."],
      ["`Length` of an `int[3, 4]`?", "12 — every cell."],
      ["Jagged array indexing?", "`j[r][c]` — each row is its own array."],
      ["Why can a jagged row be null?", "Each row is created separately; until then it is null."],
      ["CS0022 on `g[0][1]`?", "A 2-D array takes `g[0, 1]`."],
      ["`int[,,] c = new int[2, 3, 4];` — Rank and Length?", "Rank 3; Length 24 (2 × 3 × 4)."]
    ],
    quiz: [
      { q: "`int[,] g = new int[3, 4];` — `g.GetLength(1)` is…", opts: ["3", "4", "12", "2"], ans: 1, why: "Dimension 1 is the columns." },
      { q: "Which can have rows of different lengths?", opts: ["int[,]", "int[][]", "both", "neither"], ans: 1, why: "A jagged array." },
      { q: "`foreach (int v in g)` on an `int[,]` visits…", opts: ["the rows", "every cell", "row 0 only", "nothing — a compile error"], ans: 1, why: "Every cell, row by row." }
    ]
  });
  K.add({ tasks: {
    "4.6-sums": { lesson: "4.6", title: "Row and column totals", tier: "core", minutes: 15, concepts: ["grid"], requires: ["for", "parse", "nested-loops"],
      statement: ["The first line is `rows cols`. Then `rows` lines follow, each with `cols` whole numbers separated by spaces.", "Store them in an `int[,]`. Print each row's total on its own line, then the column totals on one line separated by spaces."],
      starter: 'string[] size = Console.ReadLine().Split(\' \');\nint rows = int.Parse(size[0]), cols = int.Parse(size[1]);\n',
      examples: [{ stdin: "2 3\n1 2 3\n4 5 6", out: "6\n15\n5 7 9" }],
      hidden: [{ stdin: "1 1\n7", out: "7\n7" }, { stdin: "3 2\n1 1\n2 2\n-3 0", out: "2\n4\n-3\n0 3" }],
      rules: [uses(/\[\s*,\s*\]/, "Store the numbers in an int[,].")],
      hints: ["int[,] g = new int[rows, cols];", "Split each row line and parse into g[r, c].", "Two separate nested loops: rows outer for row totals, columns outer for column totals."],
      answer: 'string[] size = Console.ReadLine().Split(\' \');\nint rows = int.Parse(size[0]), cols = int.Parse(size[1]);\nint[,] g = new int[rows, cols];\nfor (int r = 0; r < rows; r++)\n{\n    string[] parts = Console.ReadLine().Split(\' \');\n    for (int c = 0; c < cols; c++) g[r, c] = int.Parse(parts[c]);\n}\nfor (int r = 0; r < rows; r++)\n{\n    int s = 0;\n    for (int c = 0; c < cols; c++) s += g[r, c];\n    Console.WriteLine(s);\n}\nint[] colTotals = new int[cols];\nfor (int c = 0; c < cols; c++)\n    for (int r = 0; r < rows; r++) colTotals[c] += g[r, c];\nConsole.WriteLine(string.Join(" ", colTotals));' },
    "4.6-board": { lesson: "4.6", title: "Noughts and crosses", tier: "stretch", minutes: 25, concepts: ["grid"], requires: ["nested-loops", "methods"],
      statement: ["Three lines of three characters each: `X`, `O` or `.`.", "Print `X wins`, `O wins` or `No winner` — three in a row across, down or diagonally. (At most one player has a line.)"],
      starter: "char[,] b = new char[3, 3];\n",
      examples: [{ stdin: "XXX\nO.O\n...", out: "X wins" }, { stdin: "XO.\nXO.\n.O.", out: "O wins" }],
      hidden: [{ stdin: "X..\n.X.\n..X", out: "X wins" }, { stdin: "..O\n.O.\nO..", out: "O wins" }, { stdin: "XOX\nOXO\nOXO", out: "No winner" }, { stdin: "...\n...\n...", out: "No winner" }],
      rules: [uses(/\[\s*,\s*\]/, "Keep the board in a char[,].")],
      hints: ["Fill b[r, c] = line[c].", "Write bool Line(char p) that checks 3 rows, 3 columns and 2 diagonals.", "if (Line('X')) … else if (Line('O')) … else …"],
      answer: 'char[,] b = new char[3, 3];\nfor (int r = 0; r < 3; r++)\n{\n    string line = Console.ReadLine();\n    for (int c = 0; c < 3; c++) b[r, c] = line[c];\n}\nConsole.WriteLine(Line(\'X\') ? "X wins" : Line(\'O\') ? "O wins" : "No winner");\n\nbool Line(char p)\n{\n    for (int i = 0; i < 3; i++)\n    {\n        if (b[i, 0] == p && b[i, 1] == p && b[i, 2] == p) return true;\n        if (b[0, i] == p && b[1, i] == p && b[2, i] == p) return true;\n    }\n    if (b[0, 0] == p && b[1, 1] == p && b[2, 2] == p) return true;\n    return b[0, 2] == p && b[1, 1] == p && b[2, 0] == p;\n}' }
  } });

  /* ================================================================
     4.7 Tuples and deconstruction
     ================================================================ */
  lesson("4.7", {
    aqa: "4.1.1.12",
    notes: [
      page("The problem it solves"),
      { ul: [ "A method that finds the smallest and largest has two results. 3.5's `out` works but is clumsy.", "A **tuple** groups a few values into one, with no class to write.", "**Deconstruction** unpacks it into variables in one line." ] },
      page("Core idea"),
      run("pair", "a tuple and its parts", 'var p = (3, 4);\nConsole.WriteLine(p.Item1 + p.Item2);\n(string name, int age) who = ("Ada", 36);\nConsole.WriteLine(who.name + " is " + who.age);\nConsole.WriteLine(who);'),
      run("return", "two results, one return", 'var r = MinMax(new[] { 4, 9, 2 });\nConsole.WriteLine($"{r.min} to {r.max}");\nvar (lo, hi) = MinMax(new[] { 7, 1 });\nConsole.WriteLine(lo + " " + hi);\n\n(int min, int max) MinMax(int[] xs)\n{\n    int a = xs[0], b = xs[0];\n    foreach (int v in xs) { if (v < a) a = v; if (v > b) b = v; }\n    return (a, b);\n}'),
      page("Rules"),
      { ul: [
        "Elements are `Item1`, `Item2` … or the names you give them.",
        "A tuple is a **value**: copying it copies the values (unlike an array or list).",
        "Deconstruction needs exactly one variable per element; `_` discards one.",
        "Two tuples are `==` when every element is equal.",
        "Names help the reader; the compiler matches tuples by position."
      ] },
      run("copy", "a copy, not a shared value", 'var a = (x: 1, y: 2);\nvar b = a;\nb.x = 99;\nConsole.WriteLine(a.x + " " + b.x);\nConsole.WriteLine(a == (1, 2));'),
      page("Variations"),
      { h: "Swap without a temporary" },
      run("swap", "(x, y) = (y, x)", 'int x = 1, y = 2;\n(x, y) = (y, x);\nConsole.WriteLine($"{x} {y}");'),
      { h: "A list of tuples" },
      run("list", "small records without a class", 'var results = new List<(string name, int score)> { ("Ada", 91), ("Kai", 74) };\nresults.Add(("Lin", 88));\nforeach (var (name, score) in results) Console.WriteLine($"{name}: {score}");'),
      { h: "A tuple as a dictionary key" },
      run("key", "a grid position as one key", 'var walls = new HashSet<(int, int)> { (0, 1), (2, 2) };\nvar labels = new Dictionary<(int r, int c), string> { [(0, 0)] = "start" };\nConsole.WriteLine(walls.Contains((2, 2)) + " " + labels[(0, 0)]);'),
      { h: "Discarding a part" },
      run("discard", "_ for the bit you do not need", 'var (q, _) = Divide(17, 5);\nConsole.WriteLine(q);\n\n(int quotient, int remainder) Divide(int a, int b) => (a / b, a % b);'),
      page("Pitfalls"),
      { h: "An element that is not there — CS1061" },
      run("pit-item", "a pair has no Item3", 'var t = (1, 2);\nConsole.WriteLine(t.Item3);'),
      { h: "Too few variables — CS8132" },
      run("pit-count", "three values, two names", 'var (a, b) = (1, 2, 3);'),
      { h: "Expecting a tuple to be shared" },
      run("pit-copy", "changing the copy changes nothing else", 'var original = (n: 1, s: "a");\nvar copy = original;\ncopy.n = 5;\nConsole.WriteLine(original.n);'),
      page("Choosing"),
      { table: { head: ["Results", "Use"], rows: [["one", "return it"], ["two or three, used straight away", "a tuple"], ["a Try- pattern", "`bool` + `out` (3.5)"], ["many, or passed around widely", "a class or record (unit 7)"]] } },
      page("Connections"),
      { ul: [ "**Back:** 3.5's `out`.", "**Later:** records (unit 8) are tuples with a name and behaviour.", "**AQA:** 4.1.1.12 returning values from a subroutine." ] },
      page("Good practice"),
      { ul: [ "Name the elements: `(int min, int max)` reads better than `Item1`.", "Keep tuples small and local; past three values, write a type." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Min, max and mean* and *Top scorer*." ] },
      page("Quick reference"),
      run("qr", "tuples at a glance", '(string n, int a) p = ("Kai", 17);\nvar (name, age) = p;\n(int, int) Pair() => (1, 2);\nConsole.WriteLine($"{name} {age} {Pair().Item2}");'),
      { ul: [ "`(a, b)` makes one; `.Item1` or a name reads it.", "`var (x, y) = t;` unpacks; `_` discards.", "Copied by value; `==` compares every element." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1061", "an element the tuple does not have", "Pitfalls"], ["CS8132", "the wrong number of variables", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var t = (a: 2, b: 5);\nvar (x, y) = t;\nConsole.WriteLine(y - x);', why: "x is 2 and y is 5.", concepts: ["deconstruct"] },
        { id: "p2", src: 'int a = 3, b = 8;\n(a, b) = (b, a);\nConsole.WriteLine(a);', why: "The swap puts 8 in a.", concepts: ["tuple"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to read the second element.", src: 'var t = ("x", 42);\nConsole.WriteLine(t.@@);', out: "42", concepts: ["tuple"] }
      ],
      bug: [
        { id: "b1", q: "It should print 5 (the size of the range).", src: 'var r = Range(new[] { 3, 8, 6 });\nConsole.WriteLine(r.max - r.max);\n\n(int min, int max) Range(int[] xs)\n{\n    int a = xs[0], b = xs[0];\n    foreach (int v in xs) { if (v < a) a = v; if (v > b) b = v; }\n    return (a, b);\n}', out: "5", fixedText: "prints 5", why: "It should be r.max - r.min.", concepts: ["tuple"] }
      ]
    },
    flashcards: [
      ["How does a method return two values without `out`?", "Return a tuple: `(int min, int max) F() => (a, b);`"],
      ["Unpack a tuple into two variables?", "`var (x, y) = t;`"],
      ["Swap two variables in one line?", "`(x, y) = (y, x);`"],
      ["Is a tuple copied or shared?", "Copied — it is a value type."],
      ["When should a tuple become a class?", "When it has many parts or travels far from where it is made."],
      ["CS8132?", "Deconstructing into the wrong number of variables."]
    ],
    quiz: [
      { q: "`var t = (1, 2); var u = t; u.Item1 = 9;` — `t.Item1` is…", opts: ["1", "9", "an error", "2"], ans: 0, why: "u is a copy." },
      { q: "`(\"a\", 1) == (\"a\", 1)` is…", opts: ["True", "False", "an error", "null"], ans: 0, why: "Element by element." },
      { q: "Best for returning a min and a max?", opts: ["a tuple", "two global variables", "a string", "a List<object>"], ans: 0, why: "Two results, used straight away." }
    ]
  });
  K.add({ tasks: {
    "4.7-stats": { lesson: "4.7", title: "Min, max and mean", tier: "core", minutes: 12, concepts: ["tuple", "deconstruct"], requires: ["parse", "format"],
      statement: ["Write `(int min, int max, double mean) Stats(int[] xs)`.", "Read n, then n whole numbers one per line; print `Min A, max B, mean C.CC`."],
      starter: "",
      examples: [{ stdin: "3\n4\n9\n2", out: "Min 2, max 9, mean 5.00" }],
      hidden: [{ stdin: "1\n-5", out: "Min -5, max -5, mean -5.00" }, { stdin: "4\n1\n2\n3\n5", out: "Min 1, max 5, mean 2.75" }],
      rules: [uses(/\(\s*int\s+\w+\s*,\s*int\s+\w+\s*,\s*double\s+\w+\s*\)\s*Stats\s*\(/, "Declare (int min, int max, double mean) Stats(int[] xs).")],
      hints: ["Track min, max and a total in one loop.", "return (lo, hi, (double)total / xs.Length);", "var (lo, hi, mean) = Stats(xs);"],
      answer: 'int n = int.Parse(Console.ReadLine());\nint[] xs = new int[n];\nfor (int i = 0; i < n; i++) xs[i] = int.Parse(Console.ReadLine());\nvar (lo, hi, mean) = Stats(xs);\nConsole.WriteLine($"Min {lo}, max {hi}, mean {mean:F2}");\n\n(int min, int max, double mean) Stats(int[] xs)\n{\n    int a = xs[0], b = xs[0], total = 0;\n    foreach (int v in xs)\n    {\n        if (v < a) a = v;\n        if (v > b) b = v;\n        total += v;\n    }\n    return (a, b, (double)total / xs.Length);\n}' },
    "4.7-top": { lesson: "4.7", title: "Top scorer", tier: "core", minutes: 15, concepts: ["tuple"], requires: ["input-loop", "list"],
      statement: ["Read lines `name score` until `done` into a `List<(string name, int score)>`.", "Print `Top: NAME SCORE` (the first of any tie) — or `No scores`."],
      starter: "",
      examples: [{ stdin: "Ada 91\nKai 74\nLin 91\ndone", out: "Top: Ada 91" }],
      hidden: [{ stdin: "done", out: "No scores" }, { stdin: "Zed -3\nAmy -1\ndone", out: "Top: Amy -1" }],
      rules: [uses(/List\s*<\s*\(/, "Keep the results in a List of tuples.")],
      hints: ["var parts = line.Split(' '); results.Add((parts[0], int.Parse(parts[1])));", "Start best at results[0] and compare with >, so ties keep the first.", "Print best.name and best.score."],
      answer: 'var results = new List<(string name, int score)>();\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    string[] parts = line.Split(\' \');\n    results.Add((parts[0], int.Parse(parts[1])));\n    line = Console.ReadLine();\n}\nif (results.Count == 0) Console.WriteLine("No scores");\nelse\n{\n    var best = results[0];\n    foreach (var r in results) if (r.score > best.score) best = r;\n    Console.WriteLine($"Top: {best.name} {best.score}");\n}' }
  } });

  /* ================================================================
     4.8 Sorting and searching a collection
     ================================================================ */
  lesson("4.8", {
    aqa: "4.3.4.2",
    notes: [
      page("The problem it solves"),
      { ul: [ "Reports want things in order: highest score first, names A to Z.", "Finding an item in a long list one by one is slow; a **sorted** list can be searched by halving.", "C# sorts for you; knowing what each operation costs is the skill." ] },
      page("Core idea"),
      run("sort", "sort in place, both kinds", 'int[] a = { 5, 3, 9, 1 };\nArray.Sort(a);\nConsole.WriteLine(string.Join(" ", a));\nvar names = new List<string> { "pear", "fig", "apple" };\nnames.Sort();\nConsole.WriteLine(string.Join(" ", names));'),
      run("bykey", "sort by a key: a comparison (lambdas are unit 9)", 'var words = new List<string> { "pear", "fig", "banana" };\nwords.Sort((a, b) => a.Length.CompareTo(b.Length));\nConsole.WriteLine(string.Join(" ", words));\nvar scores = new List<(string name, int score)> { ("Ada", 74), ("Kai", 91), ("Lin", 88) };\nscores.Sort((x, y) => y.score.CompareTo(x.score));\nforeach (var (n, s) in scores) Console.WriteLine($"{n} {s}");'),
      page("Rules"),
      { ul: [
        "`Array.Sort(a)` and `list.Sort()` change the collection itself and return nothing.",
        "`a.CompareTo(b)` is negative, zero or positive; swapping `a` and `b` sorts the other way.",
        "Strings sort alphabetically by the culture's rules, so `\"apple\"` comes before `\"Banana\"`.",
        "`BinarySearch` only works on a SORTED collection: it returns the index, or a negative number when the item is absent.",
        "`IndexOf` and `Contains` search from the front: they work on anything."
      ] },
      run("binary", "found, and not found", 'int[] a = { 1, 3, 5, 7, 9 };\nConsole.WriteLine(Array.BinarySearch(a, 7));\nConsole.WriteLine(Array.BinarySearch(a, 4));'),
      page("Variations"),
      { h: "Linear search, by hand" },
      run("linear", "check each item, count the looks", 'int[] a = { 8, 3, 9, 4, 7 };\nint target = 4, looks = 0, at = -1;\nfor (int i = 0; i < a.Length; i++)\n{\n    looks++;\n    if (a[i] == target) { at = i; break; }\n}\nConsole.WriteLine($"Found at {at} after {looks} looks");'),
      { h: "Binary search, by hand" },
      run("bsearch", "halve the range each step", 'int[] a = { 2, 5, 8, 12, 16, 23, 38, 56, 72, 91 };\nConsole.WriteLine(Find(a, 23));\nConsole.WriteLine(Find(a, 6));\n\nint Find(int[] xs, int target)\n{\n    int lo = 0, hi = xs.Length - 1;\n    while (lo <= hi)\n    {\n        int mid = (lo + hi) / 2;\n        if (xs[mid] == target) return mid;\n        if (xs[mid] < target) lo = mid + 1; else hi = mid - 1;\n    }\n    return -1;\n}'),
      { h: "Descending, and ties" },
      run("desc", "sort, then reverse", 'var xs = new List<int> { 3, 8, 1, 8 };\nxs.Sort();\nxs.Reverse();\nConsole.WriteLine(string.Join(" ", xs));'),
      { h: "The median" },
      run("median", "sort a copy, take the middle", 'int[] marks = { 60, 92, 71, 45, 88 };\nint[] sorted = (int[])marks.Clone();\nArray.Sort(sorted);\nConsole.WriteLine($"Median {sorted[sorted.Length / 2]}, first mark still {marks[0]}");'),
      page("Performance"),
      { table: { head: ["Operation", "Cost"], rows: [["Sort (built in)", "O(n log n)"], ["Linear search, IndexOf, Contains", "O(n)"], ["Binary search on sorted data", "O(log n)"], ["HashSet / Dictionary lookup", "O(1) on average"]] } },
      "A million items: a linear search may look a million times, a binary search about 20.",
      page("Pitfalls"),
      { h: "Sort returns nothing — CS0029" },
      run("pit-void", "Sort changes the list; it does not hand one back", 'var nums = new List<int> { 3, 1, 2 };\nList<int> sorted = nums.Sort();'),
      { h: "Binary search on unsorted data" },
      run("pit-unsorted", "a wrong answer, with no error", 'int[] a = { 9, 1, 7, 3 };\nConsole.WriteLine(Array.BinarySearch(a, 9));'),
      { h: "Sorting the original by accident" },
      run("pit-alias", "b is not a copy", 'int[] a = { 3, 1, 2 };\nint[] b = a;\nArray.Sort(b);\nConsole.WriteLine(string.Join(",", a));'),
      page("Connections"),
      { ul: [ "**Back:** 3.7's recursion — merge sort is recursive.", "**Later:** unit 9's `OrderBy`; unit 12 writes the sorts.", "**AQA:** 4.3.4.1 linear search, 4.3.4.2 binary search, 4.3.5 sorting." ] },
      page("Good practice"),
      { ul: [ "Use the built-in sort; write your own only to learn.", "Sort a copy when the original order still matters.", "Search a sorted list with a binary search, and anything you look up often with a set or dictionary." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Median* and *Binary search by hand*." ] },
      page("Quick reference"),
      run("qr", "sorting and searching at a glance", 'var xs = new List<int> { 5, 2, 9 };\nxs.Sort();                                   // 2 5 9\nint at = xs.BinarySearch(9);                 // 2\nxs.Sort((a, b) => b.CompareTo(a));           // 9 5 2\nConsole.WriteLine($"{at} {string.Join(" ", xs)}");'),
      { ul: [ "Sort: in place, O(n log n).", "`CompareTo` decides order; swap the sides to reverse.", "Binary search: sorted only, O(log n)." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0029", "storing the result of Sort (it is void)", "Pitfalls"], ["(no error)", "binary search on unsorted data", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var w = new List<string> { "kiwi", "fig", "plum" };\nw.Sort();\nConsole.WriteLine(w[0] + " " + w[2]);', why: "Alphabetical: fig, kiwi, plum.", concepts: ["sorting"] },
        { id: "p2", src: 'int[] a = { 10, 20, 30, 40 };\nConsole.WriteLine(Array.BinarySearch(a, 30));', why: "30 is at index 2.", concepts: ["searching"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the list sorts from largest to smallest.", src: 'var xs = new List<int> { 2, 9, 4 };\nxs.Sort((a, b) => @@.CompareTo(a));\nConsole.WriteLine(string.Join(" ", xs));', out: "9 4 2", concepts: ["sorting"] }
      ],
      bug: [
        { id: "b1", q: "It should report 7 as found.", src: 'int[] a = { 3, 9, 7, 1 };\nConsole.WriteLine(Array.BinarySearch(a, 7) >= 0 ? "found" : "missing");', out: "found", fixedText: "prints found", why: "Binary search needs sorted data: Array.Sort(a) first.", concepts: ["searching"] }
      ]
    },
    flashcards: [
      ["Does `list.Sort()` return a new list?", "No — it sorts in place and returns void."],
      ["Precondition for binary search?", "The data is sorted."],
      ["Cost of a binary search?", "O(log n)."],
      ["Cost of a linear search?", "O(n)."],
      ["Sort descending with a comparison?", "`xs.Sort((a, b) => b.CompareTo(a));`"],
      ["What does BinarySearch return when the item is missing?", "A negative number (the complement of where it would go)."]
    ],
    quiz: [
      { q: "Searching a sorted array of 1,000,000 by halving takes about…", opts: ["20 looks", "1,000 looks", "500,000 looks", "1 look"], ans: 0, why: "2^20 ≈ a million." },
      { q: "`Array.Sort(b)` where `int[] b = a;` — is `a` sorted?", opts: ["yes", "no", "a compile error", "only the first item"], ans: 0, why: "b and a are the same array." },
      { q: "Which is O(n log n)?", opts: ["Contains on a list", "Array.Sort", "HashSet.Contains", "list[0]"], ans: 1, why: "Comparison sorting." }
    ]
  });
  K.add({ tasks: {
    "4.8-median": { lesson: "4.8", title: "Median", tier: "core", minutes: 12, concepts: ["sorting"], requires: ["parse", "format"],
      statement: ["Read n, then n whole numbers one per line.", "Print `Median: X.X` — the middle value once sorted, or the mean of the two middle values when n is even."],
      starter: "",
      examples: [{ stdin: "5\n60\n92\n71\n45\n88", out: "Median: 71.0" }, { stdin: "4\n1\n3\n2\n10", out: "Median: 2.5" }],
      hidden: [{ stdin: "1\n7", out: "Median: 7.0" }, { stdin: "2\n-1\n2", out: "Median: 0.5" }],
      rules: [uses(/Sort\s*\(/, "Sort the numbers first.")],
      hints: ["Read into an array and Array.Sort it.", "Odd n: a[n / 2]. Even n: (a[n / 2 - 1] + a[n / 2]) / 2.0.", "Print with :F1."],
      answer: 'int n = int.Parse(Console.ReadLine());\nint[] a = new int[n];\nfor (int i = 0; i < n; i++) a[i] = int.Parse(Console.ReadLine());\nArray.Sort(a);\ndouble median = n % 2 == 1 ? a[n / 2] : (a[n / 2 - 1] + a[n / 2]) / 2.0;\nConsole.WriteLine($"Median: {median:F1}");' },
    "4.8-bsearch": { lesson: "4.8", title: "Binary search by hand", tier: "stretch", minutes: 20, concepts: ["searching"], requires: ["while", "methods"],
      statement: ["The first line holds sorted whole numbers separated by spaces. Then target numbers follow, one per line, until `done`.", "Write `int Find(int[] xs, int target)` — a binary search of your own, without `BinarySearch`. For each target print `T at I` or `T not found`."],
      starter: "",
      examples: [{ stdin: "2 5 8 12 16\n12\n3\ndone", out: "12 at 3\n3 not found" }],
      hidden: [{ stdin: "4\n4\n5\ndone", out: "4 at 0\n5 not found" }, { stdin: "1 2 3 4 5 6 7 8\n1\n8\n9\ndone", out: "1 at 0\n8 at 7\n9 not found" }],
      rules: [uses(/int\s+Find\s*\(/, "Write int Find(int[] xs, int target)."), { id: "own", test: function (s) { return !/BinarySearch/.test(s); }, msg: "Write the search yourself: no BinarySearch." }],
      hints: ["Keep lo and hi; look at mid = (lo + hi) / 2.", "Too small: lo = mid + 1. Too big: hi = mid - 1.", "Stop when lo > hi and return -1."],
      answer: 'string[] parts = Console.ReadLine().Split(\' \');\nint[] xs = new int[parts.Length];\nfor (int i = 0; i < parts.Length; i++) xs[i] = int.Parse(parts[i]);\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    int t = int.Parse(line), at = Find(xs, t);\n    Console.WriteLine(at >= 0 ? $"{t} at {at}" : $"{t} not found");\n    line = Console.ReadLine();\n}\n\nint Find(int[] xs, int target)\n{\n    int lo = 0, hi = xs.Length - 1;\n    while (lo <= hi)\n    {\n        int mid = (lo + hi) / 2;\n        if (xs[mid] == target) return mid;\n        if (xs[mid] < target) lo = mid + 1; else hi = mid - 1;\n    }\n    return -1;\n}' }
  } });

  /* ================================================================
     4.9 Choosing a collection
     ================================================================ */
  lesson("4.9", {
    aqa: "4.2.1.4",
    notes: [
      page("The problem it solves"),
      { ul: [ "Every collection in this unit can hold the data; the right one makes the code short and fast.", "Choose from how the data will be USED: by position, by key, \"is it there?\", or in arrival order." ] },
      page("Core idea"),
      { table: { head: ["The question you ask most", "Collection"], rows: [["the i-th item, size fixed", "array"], ["the i-th item, size changes", "`List<T>`"], ["the value for this key", "`Dictionary<K, V>`"], ["is it there? how many different?", "`HashSet<T>`"], ["oldest first", "`Queue<T>`"], ["newest first", "`Stack<T>`"], ["row and column", "`T[,]`"]] } },
      "The same job — \"has this word been used?\" — two ways:",
      run("list-way", "a list: Contains looks at every word", 'var used = new List<string>();\nforeach (string w in new[] { "apple", "kiwi", "apple" })\n{\n    Console.WriteLine(used.Contains(w) ? "repeat " + w : "new " + w);\n    used.Add(w);\n}'),
      run("set-way", "a set: one step, and shorter", 'var used = new HashSet<string>();\nforeach (string w in new[] { "apple", "kiwi", "apple" })\n    Console.WriteLine(used.Add(w) ? "new " + w : "repeat " + w);'),
      page("Rules"),
      { ul: [
        "Position matters → array or list. Keys matter → dictionary. Only membership → set.",
        "Order of arrival matters and items are taken one at a time → queue or stack.",
        "A dictionary whose keys are 0, 1, 2 … is an array in disguise.",
        "Several facts about one thing → a tuple now, a class later (unit 7).",
        "Combining is normal: a dictionary of lists, a list of tuples, a set beside a list."
      ] },
      run("combo", "a dictionary of lists: friends by name", 'var friends = new Dictionary<string, List<string>>();\nvoid Link(string a, string b)\n{\n    if (!friends.ContainsKey(a)) friends[a] = new List<string>();\n    friends[a].Add(b);\n}\nLink("Ada", "Kai"); Link("Ada", "Lin"); Link("Kai", "Ada");\nforeach (var (who, list) in friends) Console.WriteLine($"{who}: {string.Join(", ", list)}");'),
      page("Variations"),
      { h: "Counting → Dictionary" },
      run("count", "how many of each", 'var count = new Dictionary<string, int>();\nforeach (string c in new[] { "red", "blue", "red" }) count[c] = count.GetValueOrDefault(c) + 1;\nConsole.WriteLine(count["red"]);'),
      { h: "The last three → Queue" },
      run("recent", "drop the oldest when there are too many", 'var recent = new Queue<string>();\nforeach (string page in new[] { "home", "maths", "cs", "code", "help" })\n{\n    recent.Enqueue(page);\n    if (recent.Count > 3) recent.Dequeue();\n}\nConsole.WriteLine(string.Join(" → ", recent));'),
      { h: "A fixed table → array" },
      run("table", "days of the week by number", 'string[] days = { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };\nint today = 3;\nConsole.WriteLine(days[today] + " then " + days[(today + 1) % 7]);'),
      page("Performance"),
      { table: { head: ["", "List", "HashSet", "Dictionary", "Queue/Stack"], rows: [["add", "O(1)*", "O(1)", "O(1)", "O(1)"], ["find by value", "O(n)", "O(1)", "O(n) by value, O(1) by key", "O(n)"], ["by position", "O(1)", "—", "—", "ends only"]] } },
      "* at the end; inserting at the front is O(n).",
      page("Pitfalls"),
      { h: "A queue used as a stack — CS1061" },
      run("pit-api", "each collection has its own verbs", 'var q = new Queue<int>();\nq.Push(1);'),
      { h: "Contains on a list inside a loop" },
      run("pit-n2", "fine for 3 items, slow for 100,000", 'var seen = new List<int>();\nint repeats = 0;\nfor (int i = 0; i < 300; i++)\n{\n    int x = i % 100;\n    if (seen.Contains(x)) repeats++; else seen.Add(x);\n}\nConsole.WriteLine(repeats);'),
      "Each `Contains` scans the list: n items → n² looks. A `HashSet` makes it n.",
      { h: "Order from a dictionary" },
      "Printing a dictionary \"in order\" works by luck; sort its keys (or use `SortedDictionary`) when order matters.",
      page("Connections"),
      { ul: [ "**Back:** every lesson in this unit.", "**Next:** 4.10 passes these collections to methods.", "**AQA:** 4.2.1.4 abstract data types and data structures." ] },
      page("Good practice"),
      { ul: [ "Write down the question the data must answer, then pick.", "Start with the simplest that fits; change it when a profile, not a hunch, says so." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Visitors* and *Last three*." ] },
      page("Quick reference"),
      run("qr", "five collections, one line each", 'int[] arr = { 1, 2 }; var list = new List<int> { 1, 2 };\nvar dict = new Dictionary<string, int> { ["a"] = 1 }; var set = new HashSet<int> { 1, 2 };\nvar q = new Queue<int>(new[] { 1, 2 });\nConsole.WriteLine($"{arr[1]} {list.Count} {dict["a"]} {set.Contains(2)} {q.Peek()}");'),
      { ul: [ "Position → array/list. Key → dictionary. Membership → set.", "Arrival order → queue (oldest) or stack (newest).", "Grids → `T[,]`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1061", "a method the collection does not have", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var r = new Queue<int>();\nforeach (int x in new[] { 1, 2, 3, 4 })\n{\n    r.Enqueue(x);\n    if (r.Count > 2) r.Dequeue();\n}\nConsole.WriteLine(string.Join(",", r));', why: "Only the last two stay.", concepts: ["choose-collection"] },
        { id: "p2", src: 'var s = new HashSet<string> { "a", "b" };\nvar l = new List<string> { "a", "b" };\ns.Add("a"); l.Add("a");\nConsole.WriteLine(s.Count + " " + l.Count);', why: "The set ignores the duplicate; the list keeps it.", concepts: ["choose-collection"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the collection that answers \"price of this item?\".", src: 'var price = new @@<string, int> { ["tea"] = 2 };\nConsole.WriteLine(price["tea"]);', out: "2", concepts: ["choose-collection"] }
      ],
      bug: [
        { id: "b1", q: "It should print how many DIFFERENT visitors came.", src: 'var visitors = new List<string>();\nforeach (string v in new[] { "Ada", "Kai", "Ada" }) visitors.Add(v);\nConsole.WriteLine(visitors.Count);', out: "2", fixedText: "prints 2", why: "A list keeps repeats; use a HashSet<string>.", concepts: ["choose-collection"] }
      ]
    },
    flashcards: [
      ["Look up a value by a name?", "Dictionary."],
      ["Is it there? How many different?", "HashSet."],
      ["Items by position, size changes?", "List<T>."],
      ["Oldest first?", "Queue."],
      ["Newest first?", "Stack."],
      ["Keys are 0, 1, 2 … n − 1?", "An array (or a list)."]
    ],
    quiz: [
      { q: "Counting votes per candidate:", opts: ["List<string>", "Dictionary<string, int>", "Stack<int>", "int[,]"], ans: 1, why: "A count per key." },
      { q: "A browser's Back button:", opts: ["Queue", "Stack", "HashSet", "Dictionary"], ans: 1, why: "Newest first." },
      { q: "Checking a word against a 50,000-word dictionary list, many times:", opts: ["List.Contains", "HashSet.Contains", "a Stack", "a Queue"], ans: 1, why: "O(1) membership." }
    ]
  });
  K.add({ tasks: {
    "4.9-visitors": { lesson: "4.9", title: "Visitors", tier: "core", minutes: 15, concepts: ["choose-collection", "counting"], requires: ["input-loop"],
      statement: ["Read visitor names until `done` (people may come more than once).", "Print `N visits, M people`, then `Most: NAME (K)` — the most frequent visitor, the first to reach that count on a tie. With no visits print `No visits`."],
      starter: "",
      examples: [{ stdin: "Ada\nKai\nAda\nLin\ndone", out: "4 visits, 3 people\nMost: Ada (2)" }],
      hidden: [{ stdin: "done", out: "No visits" }, { stdin: "Bo\nAl\nAl\nBo\ndone", out: "4 visits, 2 people\nMost: Al (2)" }],
      rules: [uses(/Dictionary\s*</, "Count visits per person with a Dictionary.")],
      hints: ["A dictionary counts; its Count is the number of people.", "Track the best as you go: update when a count goes above the best so far.", "With > (not >=) the first to reach the top count stays."],
      answer: 'var visits = new Dictionary<string, int>();\nint total = 0, bestCount = 0;\nstring best = null;\nstring name = Console.ReadLine();\nwhile (name != "done")\n{\n    total++;\n    visits[name] = visits.GetValueOrDefault(name) + 1;\n    if (visits[name] > bestCount) { bestCount = visits[name]; best = name; }\n    name = Console.ReadLine();\n}\nif (total == 0) Console.WriteLine("No visits");\nelse\n{\n    Console.WriteLine($"{total} visits, {visits.Count} people");\n    Console.WriteLine($"Most: {best} ({bestCount})");\n}' },
    "4.9-recent": { lesson: "4.9", title: "Last three", tier: "warm-up", minutes: 10, concepts: ["choose-collection", "queue"], requires: ["input-loop"],
      statement: ["Read pages until `done`.", "Print the last three pages visited, oldest first, separated by ` → ` — or `Nothing yet`."],
      starter: "",
      examples: [{ stdin: "home\nmaths\ncs\ncode\ndone", out: "maths → cs → code" }],
      hidden: [{ stdin: "done", out: "Nothing yet" }, { stdin: "a\nb\ndone", out: "a → b" }],
      rules: [uses(/Queue\s*</, "Keep at most three pages in a Queue.")],
      hints: ["Enqueue each page.", "When Count goes above 3, Dequeue the oldest.", "string.Join(\" → \", q)"],
      answer: 'var recent = new Queue<string>();\nstring page = Console.ReadLine();\nwhile (page != "done")\n{\n    recent.Enqueue(page);\n    if (recent.Count > 3) recent.Dequeue();\n    page = Console.ReadLine();\n}\nConsole.WriteLine(recent.Count == 0 ? "Nothing yet" : string.Join(" → ", recent));' }
  } });

  /* ================================================================
     4.10 Collections and methods
     ================================================================ */
  lesson("4.10", {
    aqa: "4.1.1.11",
    notes: [
      page("The problem it solves"),
      { ul: [ "3.2 said a method gets a COPY of its argument. For an `int`, yes — but an array or list is a reference.", "The method gets a copy of the reference: it points at the SAME collection.", "So a method can change your list; knowing when is the point of this lesson." ] },
      page("Core idea"),
      run("shared", "the caller sees the change", 'int[] marks = { 40, 55, 70 };\nAddBonus(marks, 5);\nConsole.WriteLine(string.Join(",", marks));\n\nvoid AddBonus(int[] xs, int bonus)\n{\n    for (int i = 0; i < xs.Length; i++) xs[i] += bonus;\n}'),
      run("reassign", "replacing the parameter does NOT reach the caller", 'int[] marks = { 1, 2 };\nReplace(marks);\nConsole.WriteLine(marks[0]);\n\nvoid Replace(int[] xs)\n{\n    xs = new int[] { 99, 99 };\n}'),
      page("Rules"),
      { ul: [
        "Arrays, lists, dictionaries, sets, queues and stacks are **reference types**: a parameter shares the caller's collection.",
        "Changing the collection's CONTENTS (add, remove, `xs[i] = …`) is seen by the caller.",
        "Assigning a NEW collection to the parameter is not seen — it only moves the local name.",
        "A method that returns a new collection leaves the original alone.",
        "`params int[] xs` lets a caller pass loose values; the method still gets an array."
      ] },
      run("returns-new", "build and return, leave the input alone", 'var all = new List<int> { 3, 8, 1, 9 };\nvar big = Above(all, 4);\nConsole.WriteLine(string.Join(",", big) + " | " + string.Join(",", all));\n\nList<int> Above(List<int> xs, int limit)\n{\n    var result = new List<int>();\n    foreach (int x in xs) if (x > limit) result.Add(x);\n    return result;\n}'),
      page("Variations"),
      { h: "params" },
      run("params", "any number of arguments", 'Console.WriteLine(Sum(1, 2, 3));\nConsole.WriteLine(Sum());\n\nint Sum(params int[] xs)\n{\n    int t = 0;\n    foreach (int x in xs) t += x;\n    return t;\n}'),
      { h: "Filling a dictionary passed in" },
      run("fill", "a method that adds to the caller's counts", 'var counts = new Dictionary<string, int>();\nCount(counts, "red blue red");\nCount(counts, "blue");\nforeach (var (k, v) in counts) Console.WriteLine($"{k} {v}");\n\nvoid Count(Dictionary<string, int> into, string text)\n{\n    foreach (string w in text.Split(\' \')) into[w] = into.GetValueOrDefault(w) + 1;\n}'),
      { h: "Protecting the original" },
      run("copy", "copy first if the method must not change it", 'var scores = new List<int> { 3, 1, 2 };\nvar view = new List<int>(scores);\nview.Sort();\nConsole.WriteLine(string.Join(",", scores) + " / " + string.Join(",", view));'),
      page("Under the hood"),
      { ul: [ "A reference type lives on the **heap**; a variable holds its address.", "Passing the variable copies the address, so both names reach the same object.", "Value types (`int`, `double`, `bool`, tuples) are copied whole; unit 8 returns to value and reference types." ] },
      page("Pitfalls"),
      { h: "A list where an array is wanted — CS1503" },
      run("pit-type", "List<int> is not int[]", 'Show(new List<int> { 1, 2 });\n\nvoid Show(int[] xs) => Console.WriteLine(xs.Length);'),
      { h: "Expecting a replacement to stick" },
      run("pit-replace", "the caller still has the old list", 'var xs = new List<int> { 1 };\nReset(xs);\nConsole.WriteLine(xs.Count);\n\nvoid Reset(List<int> list) { list = new List<int>(); }'),
      "To empty the caller's list, call `list.Clear()` — or return the new list.",
      { h: "A surprise change" },
      run("pit-surprise", "Best sorted the caller's list", 'var marks = new List<int> { 50, 90, 70 };\nConsole.WriteLine(Best(marks));\nConsole.WriteLine(string.Join(",", marks));\n\nint Best(List<int> xs)\n{\n    xs.Sort();\n    return xs[xs.Count - 1];\n}'),
      page("Connections"),
      { ul: [ "**Back:** 3.2 (copies of values) and 3.5 (`ref`).", "**Later:** unit 7's objects are reference types too; unit 9 returns new sequences instead of changing old ones.", "**AQA:** 4.1.1.11 parameters; 4.1.1.13 local variables." ] },
      page("Good practice"),
      { ul: [ "A method that changes its argument should say so in its name: `SortInPlace`, `AddBonus`.", "Otherwise, return a new collection and leave the input alone." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Curve the marks* and *Above the line*." ] },
      page("Quick reference"),
      run("qr", "contents shared, variable not", 'var xs = new List<int> { 1 };\nvoid Add(List<int> l) => l.Add(2);          // seen\nvoid Swap(List<int> l) { l = new List<int>(); } // not seen\nAdd(xs); Swap(xs);\nConsole.WriteLine(xs.Count);'),
      { ul: [ "Collections are references: contents changes are shared.", "Reassigning a parameter is local.", "Return a new collection to leave the input alone." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1503", "the wrong collection type for a parameter", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var xs = new List<int> { 1, 2 };\nGrow(xs);\nConsole.WriteLine(xs.Count);\n\nvoid Grow(List<int> l) { l.Add(3); l.Add(4); }', why: "The method adds to the caller's list: 4 items.", concepts: ["coll-methods"] },
        { id: "p2", src: 'int[] a = { 5 };\nFix(a);\nConsole.WriteLine(a[0]);\n\nvoid Fix(int[] xs) { xs = new int[] { 0 }; }', why: "Reassigning the parameter does not reach a: still 5.", concepts: ["coll-methods"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the method accepts loose numbers.", src: 'Console.WriteLine(Max(4, 9, 2));\n\nint Max(@@ int[] xs)\n{\n    int m = xs[0];\n    foreach (int x in xs) if (x > m) m = x;\n    return m;\n}', out: "9", concepts: ["coll-methods"] }
      ],
      bug: [
        { id: "b1", q: "It should print 50,90,70 then 90 — the caller's order must not change.", src: 'var marks = new List<int> { 50, 90, 70 };\nint top = Top(marks);\nConsole.WriteLine(string.Join(",", marks));\nConsole.WriteLine(top);\n\nint Top(List<int> xs)\n{\n    xs.Sort();\n    return xs[xs.Count - 1];\n}', out: "50,90,70\n90", fixedText: "prints 50,90,70 and 90", why: "Sort a copy (new List<int>(xs)) or find the max without sorting.", concepts: ["coll-methods"] }
      ]
    },
    flashcards: [
      ["Does a method see the caller's list or a copy?", "The same list — it gets a copy of the reference."],
      ["`xs[0] = 9` inside a method: does the caller see it?", "Yes."],
      ["`xs = new int[3]` inside a method: does the caller see it?", "No — only the local name moves."],
      ["How do you keep a caller's list unchanged?", "Copy it (`new List<int>(xs)`) or return a new list."],
      ["What does `params int[] xs` allow?", "Calling with loose values: `Sum(1, 2, 3)`."],
      ["Value or reference: `int`, tuple, `List<int>`, `int[]`?", "Value, value, reference, reference."]
    ],
    quiz: [
      { q: "A method runs `list.Clear()` on its parameter. The caller's list…", opts: ["is empty", "is unchanged", "is null", "throws"], ans: 0, why: "Same list." },
      { q: "A method runs `list = new List<int>();`. The caller's list…", opts: ["is empty", "is unchanged", "is null", "throws"], ans: 1, why: "Only the parameter moved." },
      { q: "A method that should not change its input should…", opts: ["use ref", "return a new collection", "take an int", "use a global"], ans: 1, why: "Leave the input alone." }
    ]
  });
  K.add({ tasks: {
    "4.10-curve": { lesson: "4.10", title: "Curve the marks", tier: "warm-up", minutes: 10, concepts: ["coll-methods"], requires: ["for", "parse"],
      statement: ["Write `void Curve(int[] marks, int add)` that adds `add` to every mark IN the array, capping each at 100.", "Read n, then n marks, then the amount to add; call Curve and print the marks separated by spaces."],
      starter: "",
      examples: [{ stdin: "3\n40\n95\n70\n10", out: "50 100 80" }],
      hidden: [{ stdin: "1\n100\n5", out: "100" }, { stdin: "2\n0\n50\n0", out: "0 50" }],
      rules: [uses(/void\s+Curve\s*\(\s*int\s*\[\s*\]\s*\w+\s*,\s*int\s+\w+\s*\)/, "Declare void Curve(int[] marks, int add) and change the array in place.")],
      hints: ["The method changes the caller's array: no return needed.", "for (int i = 0; i < marks.Length; i++) marks[i] = Math.Min(100, marks[i] + add);", "Print with string.Join(\" \", marks)."],
      answer: 'int n = int.Parse(Console.ReadLine());\nint[] marks = new int[n];\nfor (int i = 0; i < n; i++) marks[i] = int.Parse(Console.ReadLine());\nint add = int.Parse(Console.ReadLine());\nCurve(marks, add);\nConsole.WriteLine(string.Join(" ", marks));\n\nvoid Curve(int[] marks, int add)\n{\n    for (int i = 0; i < marks.Length; i++) marks[i] = Math.Min(100, marks[i] + add);\n}' },
    "4.10-above": { lesson: "4.10", title: "Above the line", tier: "core", minutes: 12, concepts: ["coll-methods", "list"], requires: ["input-loop"],
      statement: ["Write `List<int> Above(List<int> xs, int line)` that RETURNS a new list of the values greater than `line`, leaving `xs` unchanged.", "The first line is the line; then numbers until `done`. Print the values above the line, then all the values — each on its own line, separated by spaces (write `none` for an empty list)."],
      starter: "",
      examples: [{ stdin: "5\n3\n8\n6\n1\ndone", out: "8 6\n3 8 6 1" }],
      hidden: [{ stdin: "10\n1\n2\ndone", out: "none\n1 2" }, { stdin: "0\ndone", out: "none\nnone" }],
      rules: [uses(/List\s*<\s*int\s*>\s*Above\s*\(/, "Declare List<int> Above(List<int> xs, int line) and return a new list.")],
      hints: ["Make var result = new List<int>(); inside Above.", "Add each x > line to result and return it.", "A small Show method can print a list or none."],
      answer: 'int limit = int.Parse(Console.ReadLine());\nvar xs = new List<int>();\nstring s = Console.ReadLine();\nwhile (s != "done")\n{\n    xs.Add(int.Parse(s));\n    s = Console.ReadLine();\n}\nConsole.WriteLine(Show(Above(xs, limit)));\nConsole.WriteLine(Show(xs));\n\nList<int> Above(List<int> xs, int line)\n{\n    var result = new List<int>();\n    foreach (int x in xs) if (x > line) result.Add(x);\n    return result;\n}\nstring Show(List<int> l) => l.Count == 0 ? "none" : string.Join(" ", l);' }
  } });

  /* ================================================================
     4.11 Practise: an inventory
     ================================================================ */
  lesson("4.11", {
    aqa: "4.2.7.1",
    notes: [
      page("The problem it solves"),
      { ul: [ "A shop's stock is the whole unit at once: item → quantity (a dictionary), a log of sales (a list), items that need reordering (a set), a report in order (sorting).", "This lesson builds it one tested piece at a time, the 3.8 way." ] },
      page("Core idea"),
      "The model: one dictionary from item to quantity, and methods that change it.",
      run("model", "stock, add, sell", 'var stock = new Dictionary<string, int>();\nAdd("apple", 5);\nAdd("pear", 2);\nAdd("apple", 3);\nConsole.WriteLine(Sell("apple", 6));\nConsole.WriteLine(Sell("pear", 9));\nforeach (var (item, n) in stock) Console.WriteLine($"{item}: {n}");\n\nvoid Add(string item, int n) => stock[item] = stock.GetValueOrDefault(item) + n;\nstring Sell(string item, int n)\n{\n    int have = stock.GetValueOrDefault(item);\n    if (n > have) return $"Only {have} {item} left";\n    stock[item] = have - n;\n    return $"Sold {n} {item}";\n}'),
      page("Rules"),
      { ul: [
        "One source of truth: the quantities live in ONE dictionary; everything else is worked out from it.",
        "Every change goes through a method that checks it (no negative stock).",
        "Reports never change the stock: they read it.",
        "Order the report deliberately (sort the keys), never by dictionary luck."
      ] },
      run("report", "a sorted report from the dictionary", 'var stock = new Dictionary<string, int> { ["pear"] = 2, ["apple"] = 8, ["fig"] = 0 };\nvar names = new List<string>(stock.Keys);\nnames.Sort();\nforeach (string n in names) Console.WriteLine($"{n,-6}{stock[n],3}");'),
      page("Variations"),
      { h: "Low stock → a set" },
      run("low", "which items need reordering?", 'var stock = new Dictionary<string, int> { ["pear"] = 2, ["apple"] = 8, ["fig"] = 0 };\nvar low = new SortedSet<string>();\nforeach (var (item, n) in stock) if (n < 3) low.Add(item);\nConsole.WriteLine("Reorder: " + string.Join(", ", low));'),
      { h: "A sales log → a list of tuples" },
      run("log", "what was sold, in order", 'var log = new List<(string item, int qty)>();\nlog.Add(("apple", 2));\nlog.Add(("pear", 1));\nlog.Add(("apple", 1));\nvar sold = new Dictionary<string, int>();\nforeach (var (item, qty) in log) sold[item] = sold.GetValueOrDefault(item) + qty;\nConsole.WriteLine($"{log.Count} sales; apples sold: {sold["apple"]}");'),
      { h: "Commands from input" },
      run("commands", "split each line into a verb and its parts", 'var stock = new Dictionary<string, int>();\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    string[] p = line.Split(\' \');\n    if (p[0] == "add") stock[p[1]] = stock.GetValueOrDefault(p[1]) + int.Parse(p[2]);\n    else if (p[0] == "count") Console.WriteLine($"{p[1]}: {stock.GetValueOrDefault(p[1])}");\n    line = Console.ReadLine();\n}', "add tea 4\nadd tea 2\ncount tea\ncount jam\ndone"),
      page("Pitfalls"),
      { h: "Reading stock for an unknown item — KeyNotFoundException" },
      run("pit-missing", "jam was never added", 'var stock = new Dictionary<string, int> { ["tea"] = 4 };\nConsole.WriteLine(stock["jam"]);'),
      { h: "Selling more than there is" },
      run("pit-negative", "no check, negative stock", 'var stock = new Dictionary<string, int> { ["tea"] = 1 };\nstock["tea"] -= 3;\nConsole.WriteLine(stock["tea"]);'),
      { h: "Indexing the keys — CS0021" },
      run("pit-keys", "Keys is not a List", 'var stock = new Dictionary<string, int> { ["b"] = 1, ["a"] = 2 };\nConsole.WriteLine(stock.Keys[0]);'),
      "Copy the keys into a list first: `var names = new List<string>(stock.Keys);` — then index or sort it.",
      page("Connections"),
      { ul: [ "**Back:** every lesson in unit 4, and 3.8's decomposition.", "**Next:** unit 5 parses text properly; capstone 2 builds a gradebook from a CSV.", "**AQA:** 4.2.7.1 dictionaries; 4.13 structured programming." ] },
      page("Good practice"),
      { ul: [ "Keep one dictionary as the truth; derive reports from it.", "Put every change behind a method that refuses bad requests." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Stock room* and *Reorder list*." ] },
      page("Quick reference"),
      run("qr", "the inventory pattern", 'var stock = new Dictionary<string, int>();\nvoid Add(string i, int n) => stock[i] = stock.GetValueOrDefault(i) + n;\nbool Take(string i, int n) { if (stock.GetValueOrDefault(i) < n) return false; stock[i] -= n; return true; }\nAdd("tea", 3);\nConsole.WriteLine(Take("tea", 5) + " " + Take("tea", 2) + " " + stock["tea"]);'),
      { ul: [ "Dictionary item → quantity.", "Methods check every change.", "Reports read and sort; they never change." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["KeyNotFoundException", "an item that was never stocked", "Pitfalls"], ["CS0021", "indexing Keys (copy them to a List first)", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var s = new Dictionary<string, int> { ["tea"] = 2 };\ns["tea"] += 3;\ns["jam"] = s.GetValueOrDefault("jam") + 1;\nConsole.WriteLine(s["tea"] + s["jam"]);', why: "tea becomes 5, jam 1.", concepts: ["inventory"] },
        { id: "p2", src: 'var s = new Dictionary<string, int> { ["b"] = 1, ["a"] = 2 };\nvar keys = new List<string>(s.Keys);\nkeys.Sort();\nConsole.WriteLine(keys[0]);', why: "Sorted keys: a, b.", concepts: ["inventory"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so a new item starts from 0.", src: 'var s = new Dictionary<string, int>();\ns["fig"] = s.@@("fig") + 4;\nConsole.WriteLine(s["fig"]);', out: "4", concepts: ["inventory"] }
      ],
      bug: [
        { id: "b1", q: "Selling 5 when 2 are left should refuse and keep 2.", src: 'var s = new Dictionary<string, int> { ["tea"] = 2 };\nSell("tea", 5);\nConsole.WriteLine(s["tea"]);\n\nvoid Sell(string item, int n)\n{\n    s[item] -= n;\n}', out: "2", fixedText: "prints 2", why: "Check stock before taking it away.", concepts: ["inventory"] }
      ]
    },
    flashcards: [
      ["The inventory's single source of truth?", "One Dictionary<string, int> from item to quantity."],
      ["Why put every change in a method?", "So it can refuse bad requests, like selling more than there is."],
      ["How do you print a dictionary in key order?", "Copy the keys to a list, sort it, then read each value."],
      ["Low-stock items, in order, each once?", "A SortedSet<string>."],
      ["Can you index or sort `dict.Keys`?", "No — copy it into a List<string> first."]
    ],
    quiz: [
      { q: "Which holds the quantity per item?", opts: ["List<int>", "Dictionary<string, int>", "HashSet<string>", "Stack<int>"], ans: 1, why: "A value per key." },
      { q: "A report should…", opts: ["change stock as it prints", "only read the stock", "clear the stock", "sort the dictionary in place"], ans: 1, why: "Reports read." },
      { q: "Reading an item that was never added with `stock[item]` gives…", opts: ["0", "null", "KeyNotFoundException", "a compile error"], ans: 2, why: "Use GetValueOrDefault." }
    ]
  });
  K.add({ tasks: {
    "4.11-stock": { lesson: "4.11", title: "Stock room", tier: "stretch", minutes: 30, concepts: ["inventory", "dictionary"], requires: ["input-loop", "methods"],
      statement: ["Commands until `done`:", "`add ITEM N` adds N; `sell ITEM N` prints `Sold N ITEM` or, if fewer are in stock, `Only K ITEM left` and sells nothing; `report` prints every item with stock above 0, in alphabetical order, as `ITEM: N` (or `Empty` if there are none)."],
      starter: "var stock = new Dictionary<string, int>();\n",
      examples: [{ stdin: "add tea 5\nadd jam 2\nsell tea 3\nsell jam 4\nreport\ndone", out: "Sold 3 tea\nOnly 2 jam left\njam: 2\ntea: 2" }],
      hidden: [{ stdin: "report\ndone", out: "Empty" }, { stdin: "add a 1\nsell a 1\nreport\nsell b 1\ndone", out: "Sold 1 a\nEmpty\nOnly 0 b left" }, { stdin: "add zed 1\nadd amy 3\nadd zed 2\nreport\ndone", out: "amy: 3\nzed: 3" }],
      rules: [uses(/Dictionary\s*</, "Keep the stock in a Dictionary<string, int>.")],
      hints: ["Split each line: p[0] is the command.", "Sell checks stock.GetValueOrDefault(item) before taking.", "Report: copy the keys, sort them, print those above 0."],
      answer: 'var stock = new Dictionary<string, int>();\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    string[] p = line.Split(\' \');\n    if (p[0] == "add") stock[p[1]] = stock.GetValueOrDefault(p[1]) + int.Parse(p[2]);\n    else if (p[0] == "sell") Sell(p[1], int.Parse(p[2]));\n    else if (p[0] == "report") Report();\n    line = Console.ReadLine();\n}\n\nvoid Sell(string item, int n)\n{\n    int have = stock.GetValueOrDefault(item);\n    if (n > have) { Console.WriteLine($"Only {have} {item} left"); return; }\n    stock[item] = have - n;\n    Console.WriteLine($"Sold {n} {item}");\n}\nvoid Report()\n{\n    var names = new List<string>();\n    foreach (var (item, n) in stock) if (n > 0) names.Add(item);\n    if (names.Count == 0) { Console.WriteLine("Empty"); return; }\n    names.Sort();\n    foreach (string n in names) Console.WriteLine($"{n}: {stock[n]}");\n}' },
    "4.11-reorder": { lesson: "4.11", title: "Reorder list", tier: "core", minutes: 15, concepts: ["inventory", "hashset"], requires: ["input-loop"],
      statement: ["The first line is the reorder level L. Then lines `ITEM N` until `done` — an item may appear more than once; its stock is the total.", "Print `Reorder: a, b` — every item whose total is below L, alphabetically — or `Nothing to reorder`."],
      starter: "",
      examples: [{ stdin: "3\ntea 1\njam 5\nfig 2\ntea 1\ndone", out: "Reorder: fig, tea" }],
      hidden: [{ stdin: "1\na 1\ndone", out: "Nothing to reorder" }, { stdin: "10\nzed 9\namy 9\nzed 1\ndone", out: "Reorder: amy" }],
      rules: [uses(/Dictionary\s*</, "Total the stock per item in a Dictionary.")],
      hints: ["Add each line's N to the item's total.", "Collect items below L into a SortedSet<string> (or a list you sort).", "string.Join(\", \", low)"],
      answer: 'int level = int.Parse(Console.ReadLine());\nvar stock = new Dictionary<string, int>();\nstring line = Console.ReadLine();\nwhile (line != "done")\n{\n    string[] p = line.Split(\' \');\n    stock[p[0]] = stock.GetValueOrDefault(p[0]) + int.Parse(p[1]);\n    line = Console.ReadLine();\n}\nvar low = new SortedSet<string>();\nforeach (var (item, n) in stock) if (n < level) low.Add(item);\nConsole.WriteLine(low.Count == 0 ? "Nothing to reorder" : "Reorder: " + string.Join(", ", low));' }
  } });

  /* ================================================================
     retrieval cards
     ================================================================ */
  K.add({ cards: {
    "u4-array": { title: "Arrays: index and Length", lesson: "4.1", concepts: ["array", "array-loop"], kind: "predict",
      vary: function (r) {
        var xs = [r(9) + 1, r(9) + 1, r(9) + 1, r(9) + 1], i = r(3);
        return { prompt: "What does this print?", label: "a new array and index", params: [],
          src: "int[] a = { " + xs.join(", ") + " };\nConsole.WriteLine(a[" + i + "] + a[a.Length - 1]);\nConsole.WriteLine(a.Length);", hint: "Indexes start at 0; the last is Length − 1." };
      } },
    "u4-sum": { title: "Walk an array", lesson: "4.1", concepts: ["array-loop"], kind: "write",
      vary: function (r, n) {
        var mode = ["total", "largest", "count of evens"][n % 3];
        var f = function (xs) { return mode === "total" ? xs.reduce(function (a, b) { return a + b; }, 0) : mode === "largest" ? Math.max.apply(null, xs) : xs.filter(function (x) { return x % 2 === 0; }).length; };
        var cases = [[3, 8, 1], [5], [-2, -7, 4, 10], [6, 6]].map(function (xs) { return { stdin: xs.length + "\n" + xs.join("\n"), out: String(f(xs)) }; });
        var body = mode === "total" ? "int t = 0;\nforeach (int x in a) t += x;\nConsole.WriteLine(t);" : mode === "largest" ? "int m = a[0];\nforeach (int x in a) if (x > m) m = x;\nConsole.WriteLine(m);" : "int c = 0;\nforeach (int x in a) if (x % 2 == 0) c++;\nConsole.WriteLine(c);";
        return { prompt: "Read n, then n numbers into an array. Print the " + mode + ".", label: "the " + mode, params: [mode],
          starter: "int n = int.Parse(Console.ReadLine());\nint[] a = new int[n];\nfor (int i = 0; i < n; i++) a[i] = int.Parse(Console.ReadLine());\n",
          cases: cases, hint: "One foreach over a.",
          answer: "int n = int.Parse(Console.ReadLine());\nint[] a = new int[n];\nfor (int i = 0; i < n; i++) a[i] = int.Parse(Console.ReadLine());\n" + body };
      } },
    "u4-list": { title: "List operations", lesson: "4.2", concepts: ["list", "list-edit"], kind: "predict",
      vary: function (r) {
        var a = 1 + r(5), b = 6 + r(4), at = r(2);
        return { prompt: "What does this print?", label: "insert and remove", params: [],
          src: "var xs = new List<int> { " + a + ", " + b + ", " + (a + b) + " };\nxs.Insert(" + at + ", 0);\nxs.Remove(" + b + ");\nConsole.WriteLine(string.Join(\",\", xs) + \" \" + xs.Count);", hint: "Insert shifts; Remove takes the first match." };
      } },
    "u4-count": { title: "Count with a dictionary", lesson: "4.3", concepts: ["counting", "dictionary"], kind: "write",
      vary: function (r) {
        var target = pick(r, ["a", "e", "o"]);
        var words = [["banana", "apple", "kiwi"], ["oak", "elm", "ash", "oak"], ["tree", "bee", "sea"]];
        var cases = words.map(function (ws) { var c = 0; ws.join("").split("").forEach(function (ch) { if (ch === target) c++; }); return { stdin: ws.join(" "), out: target + ": " + c }; });
        return { prompt: "Read one line of words. Count every letter with a Dictionary<char, int>, then print the count for '" + target + "' as `" + target + ": n`.", label: "letter " + target, params: ["'" + target + "'"],
          starter: "string line = Console.ReadLine();\n", cases: cases,
          rules: [uses(/Dictionary\s*<\s*char/, "Count with a Dictionary<char, int>.")],
          hint: "counts[c] = counts.GetValueOrDefault(c) + 1;",
          answer: "string line = Console.ReadLine();\nvar counts = new Dictionary<char, int>();\nforeach (char c in line) counts[c] = counts.GetValueOrDefault(c) + 1;\nConsole.WriteLine($\"" + target + ": {counts.GetValueOrDefault('" + target + "')}\");" };
      } },
    "u4-dict": { title: "Dictionary rules", lesson: "4.3", concepts: ["dictionary", "trygetvalue"], kind: "predict",
      vary: function (r) {
        var a = 1 + r(5), b = 10 + r(5);
        return { prompt: "What does this print?", label: "indexer, TryAdd and a missing key", params: [],
          src: "var d = new Dictionary<string, int>();\nd[\"x\"] = " + a + ";\nd[\"x\"] = " + b + ";\nbool added = d.TryAdd(\"x\", 99);\nConsole.WriteLine(d[\"x\"] + \" \" + added + \" \" + d.GetValueOrDefault(\"y\") + \" \" + d.Count);", hint: "The indexer replaces; TryAdd will not." };
      } },
    "u4-set": { title: "Sets", lesson: "4.4", concepts: ["hashset", "set-ops"], kind: "predict",
      vary: function (r) {
        var a = [1 + r(3), 4, 5 + r(2)], b = [4, 6 + r(3), a[0]];
        var op = pick(r, ["IntersectWith", "ExceptWith", "UnionWith"]);
        return { prompt: "What does this print?", label: op, params: [],
          src: "var a = new SortedSet<int> { " + a.join(", ") + " };\na." + op + "(new[] { " + b.join(", ") + " });\nConsole.WriteLine(string.Join(\",\", a));", hint: "Intersect keeps both, Except removes, Union combines; a SortedSet prints in order." };
      } },
    "u4-stack": { title: "Queue or stack?", lesson: "4.5", concepts: ["queue", "stack"], kind: "predict",
      vary: function (r) {
        var kind = pick(r, ["Queue", "Stack"]), xs = [1 + r(3), 4 + r(3), 7 + r(3)];
        var put = kind === "Queue" ? "Enqueue" : "Push", take = kind === "Queue" ? "Dequeue" : "Pop";
        return { prompt: "What does this print?", label: "a " + kind.toLowerCase(), params: [],
          src: "var c = new " + kind + "<int>();\nforeach (int x in new[] { " + xs.join(", ") + " }) c." + put + "(x);\nint first = c." + take + "();\nConsole.WriteLine(first + \" \" + c.Peek() + \" \" + c.Count);", hint: "Queue: first in, first out. Stack: last in, first out." };
      } },
    "u4-grid": { title: "2-D arrays", lesson: "4.6", concepts: ["grid"], kind: "predict",
      vary: function (r) {
        var rows = 2 + r(2), cols = 2 + r(3), rr = r(rows), cc = r(cols);
        return { prompt: "What does this print?", label: rows + " × " + cols, params: [],
          src: "int[,] g = new int[" + rows + ", " + cols + "];\nfor (int r = 0; r < g.GetLength(0); r++)\n    for (int c = 0; c < g.GetLength(1); c++) g[r, c] = r * 10 + c;\nConsole.WriteLine(g[" + rr + ", " + cc + "] + \" \" + g.GetLength(1) + \" \" + g.Length);", hint: "Row first; GetLength(1) is the columns; Length is every cell." };
      } },
    "u4-tuple": { title: "Tuples", lesson: "4.7", concepts: ["tuple", "deconstruct"], kind: "fill",
      vary: function (r) {
        var a = 2 + r(8), b = 2 + r(8);
        return { prompt: "Fill the gap to unpack the result into two variables.", label: "deconstruct", params: [a + ", " + b],
          src: "@@ = Pair();\nConsole.WriteLine(x * y);\n\n(int, int) Pair() => (" + a + ", " + b + ");", cases: [{ stdin: "", out: String(a * b) }], hint: "var (x, y)" };
      } },
    "u4-ref": { title: "Who sees the change?", lesson: "4.10", concepts: ["coll-methods"], kind: "predict",
      vary: function (r, n) {
        var v = 1 + r(9), w = 10 + r(9);
        var srcs = [
          "int[] a = { " + v + " };\nSet(a);\nConsole.WriteLine(a[0]);\n\nvoid Set(int[] xs) { xs[0] = " + w + "; }",
          "int[] a = { " + v + " };\nSwap(a);\nConsole.WriteLine(a[0]);\n\nvoid Swap(int[] xs) { xs = new int[] { " + w + " }; }",
          "var l = new List<int> { " + v + " };\nGrow(l);\nConsole.WriteLine(l.Count);\n\nvoid Grow(List<int> xs) { xs.Add(" + w + "); xs = new List<int>(); }"
        ];
        return { prompt: "What does this print?", label: ["changing the contents", "replacing the parameter", "both"][n % 3], params: [], src: srcs[n % 3],
          hint: "Contents changes are shared; reassigning the parameter is local." };
      } }
  } });
})();
