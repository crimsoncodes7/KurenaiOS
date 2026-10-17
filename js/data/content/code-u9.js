/* Kurenai OS — data/content/code-u9.js
   Code · Unit 9 · LINQ and generics (roadmap 5.3), stage 3.

   On the FULL runtime (invariant 105): generic types and methods with
   constraints, delegates, lambdas and closures, map/filter/fold written
   by hand, extension methods, events, LINQ (filter, project, sort, group,
   aggregate), deferred execution and iterators with yield. Nullable
   reference types stay on. Same contract as units 1–8
   (docs/code-plan.md §4); every program agrees with .NET
   (tools/cs_diff.mjs, the full-runtime half).                            */
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
    "generic-types": { name: "Generic types", lesson: "9.1", about: "one type for many element types: Box<T>" },
    "generic-methods": { name: "Generic methods", lesson: "9.2", about: "methods over T, types inferred" },
    "constraints": { name: "Constraints", lesson: "9.2", about: "where T : IComparable<T>" },
    "delegates": { name: "Delegates, Func and Action", lesson: "9.3", about: "a method as a value" },
    "lambdas": { name: "Lambdas", lesson: "9.4", about: "x => x * 2" },
    "closures": { name: "Closures", lesson: "9.4", about: "a lambda that captures a variable" },
    "higher-order": { name: "Higher-order functions", lesson: "9.5", about: "functions that take or return functions" },
    "fold": { name: "Map, filter and fold", lesson: "9.5", about: "transform, keep, reduce a list" },
    "extension-methods": { name: "Extension methods", lesson: "9.6", about: "this T: a method added from outside" },
    "events": { name: "Events", lesson: "9.7", about: "an object announcing changes" },
    "linq-basics": { name: "LINQ: Where, Select, OrderBy", lesson: "9.8", about: "filter, project, sort" },
    "linq-group": { name: "LINQ: grouping and aggregates", lesson: "9.9", about: "GroupBy, ToDictionary, Sum, Average" },
    "deferred": { name: "Deferred execution", lesson: "9.10", about: "a query runs when it is enumerated" },
    "yield": { name: "IEnumerable and yield", lesson: "9.11", about: "sequences produced one at a time" },
    "linq-report": { name: "Reports with LINQ", lesson: "9.12", about: "raw records to a summary" }
  } });

  /* ================================================================
     9.1 Generic types
     ================================================================ */
  lesson("9.1", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A stack of ints and a stack of strings are the same code with a different element type. Writing `IntStack`, `StringStack`, `PointStack`… copies every bug.",
        "Writing one `Stack` of `object` loses the type: everything comes out as `object`, needs a cast, and a wrong cast crashes at run time.",
        "A **generic type** takes a **type parameter**: `Stack<T>`. Write it once; `Stack<int>` and `Stack<string>` are each fully typed — and `List<T>` and `Dictionary<K, V>`, which you have used since unit 4, are exactly this."
      ] },
      page("Core idea"),
      run("box", "one Box<T>, many element types", 'var n = new Box<int>(42);\nvar s = new Box<string>("hello");\nConsole.WriteLine(n.Value + 1);\nConsole.WriteLine(s.Value.ToUpper());\nConsole.WriteLine(n);\n\nclass Box<T>\n{\n    public T Value { get; }\n    public Box(T value) => Value = value;\n    public override string ToString() => $"Box of {typeof(T).Name}: {Value}";\n}'),
      { ul: [
        "`class Box<T>` — T is a placeholder for a type, named when the box is made.",
        "`Box<int>` has an `int Value`: `n.Value + 1` needs no cast. `Box<string>` has a string with `ToUpper`.",
        "`typeof(T)` is the real type inside the class: Int32, String."
      ] },
      run("stack", "a generic stack in a dozen lines", 'var words = new MyStack<string>();\nwords.Push("a");\nwords.Push("b");\nwords.Push("c");\nConsole.WriteLine(words.Pop());\nConsole.WriteLine(words.Peek());\nConsole.WriteLine(words.Count);\n\nclass MyStack<T>\n{\n    private readonly List<T> items = new();\n    public int Count => items.Count;\n    public void Push(T item) => items.Add(item);\n    public T Peek() => items.Count > 0 ? items[^1] : throw new InvalidOperationException("The stack is empty.");\n    public T Pop()\n    {\n        T top = Peek();\n        items.RemoveAt(items.Count - 1);\n        return top;\n    }\n}'),
      page("Rules"),
      { ul: [
        "Type parameters go in angle brackets after the name: `Box<T>`, `Pair<TFirst, TSecond>`. Name them `T`, or `TKey`, `TValue` when there are several.",
        "Inside the class, T is used like any type: fields, parameters, return types, `List<T>`.",
        "Each use with a type argument (`Box<int>`) is a separate, fully checked type: a `Box<int>` refuses a string at compile time.",
        "Without constraints (9.2), code inside the class can only do what every type can: assign, compare with null, call ToString/Equals.",
        "`default(T)` (or just `default`) is the zero value of T: 0 for int, null for a class.",
        "Generics work for classes, structs, interfaces, records and methods."
      ] },
      page("Variations"),
      { h: "Two type parameters" },
      run("pair", "Pair<TFirst, TSecond> and a method that returns the other way round", 'var p = new Pair<string, int>("Ada", 91);\nvar q = p.Swap();\nConsole.WriteLine($"{p.First} {p.Second}");\nConsole.WriteLine($"{q.First} {q.Second}");\n\nrecord Pair<TFirst, TSecond>(TFirst First, TSecond Second)\n{\n    public Pair<TSecond, TFirst> Swap() => new(Second, First);\n}'),
      { h: "The generics you already use" },
      run("builtin", "List<T>, Dictionary<TKey, TValue>, HashSet<T>, Queue<T>", 'var ages = new Dictionary<string, int> { ["Ada"] = 16, ["Kai"] = 17 };\nvar seen = new HashSet<char>("banana");\nvar line = new Queue<string>(new[] { "first", "second" });\nConsole.WriteLine(ages["Kai"]);\nConsole.WriteLine(seen.Count);\nConsole.WriteLine(line.Dequeue());'),
      { h: "A generic interface" },
      run("iface", "IStore<T> and a store of any T", 'IStore<string> notes = new MemoryStore<string>();\nnotes.Save("buy milk");\nnotes.Save("ring Kai");\nConsole.WriteLine(string.Join("; ", notes.All()));\n\ninterface IStore<T>\n{\n    void Save(T item);\n    IReadOnlyList<T> All();\n}\n\nclass MemoryStore<T> : IStore<T>\n{\n    private readonly List<T> items = new();\n    public void Save(T item) => items.Add(item);\n    public IReadOnlyList<T> All() => items;\n}'),
      page("Pitfalls"),
      { h: "The wrong type in a typed box — CS1503" },
      run("pit-type", "Box<int> only takes ints", 'var b = new Box<int>("seven");\n\nclass Box<T>\n{\n    public T Value { get; }\n    public Box(T value) => Value = value;\n}'),
      { h: "Forgetting the type argument — CS0305" },
      run("pit-arity", "List needs to know what it holds", 'var xs = new List();\nConsole.WriteLine(xs.Count);'),
      { h: "The object version: a crash instead of an error" },
      run("pit-object", "an object box accepts anything — and a wrong cast fails at run time", 'var b = new ObjBox("seven");\nint n = (int)b.Value;\nConsole.WriteLine(n + 1);\n\nclass ObjBox\n{\n    public object Value { get; }\n    public ObjBox(object value) => Value = value;\n}'),
      page("Connections"),
      { ul: [ "**Back:** 4.x List<T> and 5.x Dictionary<TKey, TValue> are generic types; 8.4 interfaces.", "**Next:** 9.2 generic methods and constraints; 12.7–12.10 build linked lists, stacks, queues and hash tables generically.", "**AQA:** 4.2.1.4 abstract data types — a generic stack is an ADT whatever it holds." ] },
      page("Good practice"),
      { ul: [ "Make a container generic rather than of `object`.", "Name type parameters T, or TSomething when there are several.", "Prefer the library's generic collections; write your own to learn or for a real need." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Swap a pair* and *Your own stack*." ] },
      page("Quick reference"),
      run("qr", "a generic type at a glance", 'var c = new Cell<double>(2.5);\nc.Value *= 2;\nConsole.WriteLine(c.Value);\n\nclass Cell<T>\n{\n    public T Value { get; set; }\n    public Cell(T v) => Value = v;\n}'),
      { ul: [ "`class Name<T> { T field; }` — use as `Name<int>`.", "Several: `<TKey, TValue>`.", "`default(T)`, `typeof(T)`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1503", "an argument of the wrong type", "Pitfalls"], ["CS0305", "the generic type needs type arguments", "Pitfalls"], ["InvalidCastException", "the object held something else", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var a = new Box<int>(3);\nvar b = new Box<string>("3");\nConsole.WriteLine(a.Value + a.Value);\nConsole.WriteLine(b.Value + b.Value);\n\nclass Box<T> { public T Value { get; } public Box(T v) => Value = v; }', why: "int addition gives 6; string + joins: 33.", concepts: ["generic-types"] },
        { id: "p2", src: 'var s = new Bag<char>();\nforeach (char c in "hello") s.Add(c);\nConsole.WriteLine(s.Count + " " + s.Last());\n\nclass Bag<T>\n{\n    private readonly List<T> xs = new();\n    public int Count => xs.Count;\n    public void Add(T x) => xs.Add(x);\n    public T Last() => xs[^1];\n}', why: "Five chars added; the last is o.", concepts: ["generic-types"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to make a box that holds a double.", src: 'var b = new Box<@@>(1.5);\nConsole.WriteLine(b.Value * 2);\n\nclass Box<T> { public T Value { get; } public Box(T v) => Value = v; }', out: "3", concepts: ["generic-types"] }
      ],
      bug: [
        { id: "b1", q: "Pop should return the LAST item pushed: it should print c.", src: 'var st = new MyStack<string>();\nst.Push("a");\nst.Push("b");\nst.Push("c");\nConsole.WriteLine(st.Pop());\n\nclass MyStack<T>\n{\n    private readonly List<T> items = new();\n    public void Push(T x) => items.Add(x);\n    public T Pop()\n    {\n        T top = items[0];\n        items.RemoveAt(0);\n        return top;\n    }\n}', out: "c", fixedText: "prints c", why: "Index 0 is the oldest item (a queue). A stack takes from the end: items[^1] and RemoveAt(items.Count - 1).", concepts: ["generic-types"] }
      ]
    },
    flashcards: [
      ["What is a generic type?", "A type with a type parameter, such as Box<T>, written once for many element types."],
      ["What does `Box<int>` give that a Box of object does not?", "Compile-time type checking and no casts."],
      ["Name two generic types from the library.", "List<T>, Dictionary<TKey, TValue> (also HashSet<T>, Queue<T>, Stack<T>)."],
      ["What is `default(T)`?", "T's zero value: 0, false or null."],
      ["How many type parameters may a type have?", "Any number: Pair<TFirst, TSecond>."],
      ["What can code inside Box<T> do with a T, unconstrained?", "Only what every type can: store, return, compare with null, ToString."]
    ],
    quiz: [
      { q: "`new Box<int>(\"7\")` is…", opts: ["fine", "a compile error", "a runtime error", "a warning"], ans: 1, why: "Box<int>'s constructor takes an int." },
      { q: "Why is a generic stack better than one of object?", opts: ["it is shorter to type", "it keeps the element type, so no casts and no wrong-type crashes", "it uses less memory always", "it sorts itself"], ans: 1, why: "Type safety at compile time." },
      { q: "`Dictionary<string, int>` has how many type arguments?", opts: ["1", "2", "0", "3"], ans: 1, why: "TKey = string, TValue = int." }
    ]
  });
  K.add({ tasks: {
    "9.1-pair": { lesson: "9.1", title: "Swap a pair", tier: "warm-up", minutes: 10, concepts: ["generic-types"],
      statement: ["Write a generic `Pair<TFirst, TSecond>` (a class or record) with `First`, `Second` and `Swap()`, which returns a `Pair<TSecond, TFirst>`.", "Read a word and a whole number on one line. Make a `Pair<string, int>`, swap it, and print the swapped pair's `First` (plus 1) and `Second`."],
      starter: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\n',
      examples: [{ stdin: "Ada 91", out: "92 Ada" }],
      hidden: [{ stdin: "x 0", out: "1 x" }, { stdin: "Kai -5", out: "-4 Kai" }],
      rules: [uses(/Pair<\s*TFirst\s*,\s*TSecond\s*>/, "Declare Pair<TFirst, TSecond>."), uses(/Pair<\s*TSecond\s*,\s*TFirst\s*>\s+Swap/, "Swap returns Pair<TSecond, TFirst>.", "swap")],
      hints: ["record Pair<TFirst, TSecond>(TFirst First, TSecond Second) { … }", "public Pair<TSecond, TFirst> Swap() => new(Second, First);", "var q = new Pair<string, int>(p[0], int.Parse(p[1])).Swap(); Console.WriteLine($\"{q.First + 1} {q.Second}\");"],
      answer: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\nvar q = new Pair<string, int>(p[0], int.Parse(p[1])).Swap();\nConsole.WriteLine($"{q.First + 1} {q.Second}");\n\nrecord Pair<TFirst, TSecond>(TFirst First, TSecond Second)\n{\n    public Pair<TSecond, TFirst> Swap() => new(Second, First);\n}' },
    "9.1-stack": { lesson: "9.1", title: "Your own stack", tier: "core", minutes: 20, concepts: ["generic-types"],
      statement: ["Write `MyStack<T>` over a private `List<T>` with `Push`, `Pop`, `Peek` and `Count`; Pop and Peek on an empty stack throw `InvalidOperationException`. Do not use the library's `Stack<T>`.", "Read commands until the end: `push WORD`, `pop` (print the word), `peek` (print it) or `count` (print it). A pop or peek on an empty stack prints `empty`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "push a\npush b\npeek\npop\npop\npop\ncount", out: "b\nb\na\nempty\n0" }],
      hidden: [{ stdin: "count\npush x\ncount", out: "0\n1" }, { stdin: "peek", out: "empty" }],
      rules: [uses(/class\s+MyStack<\s*T\s*>/, "Declare MyStack<T>."), noUse(/\bStack</, "Build it yourself — no Stack<T>.", "nolib"), uses(/InvalidOperationException/, "Throw (and catch) InvalidOperationException when empty.", "throw")],
      hints: ["public T Peek() => items.Count > 0 ? items[^1] : throw new InvalidOperationException();", "public T Pop() { T t = Peek(); items.RemoveAt(items.Count - 1); return t; }", "try { Console.WriteLine(s.Pop()); } catch (InvalidOperationException) { Console.WriteLine(\"empty\"); }"],
      answer: 'var s = new MyStack<string>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    try\n    {\n        if (p[0] == "push") s.Push(p[1]);\n        else if (p[0] == "pop") Console.WriteLine(s.Pop());\n        else if (p[0] == "peek") Console.WriteLine(s.Peek());\n        else Console.WriteLine(s.Count);\n    }\n    catch (InvalidOperationException) { Console.WriteLine("empty"); }\n}\n\nclass MyStack<T>\n{\n    private readonly List<T> items = new();\n    public int Count => items.Count;\n    public void Push(T item) => items.Add(item);\n    public T Peek() => items.Count > 0 ? items[^1] : throw new InvalidOperationException("The stack is empty.");\n    public T Pop()\n    {\n        T top = Peek();\n        items.RemoveAt(items.Count - 1);\n        return top;\n    }\n}' }
  } });

  /* ================================================================
     9.2 Generic methods and constraints
     ================================================================ */
  lesson("9.2", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "`Max(int, int)`, `Max(double, double)`, `Max(string, string)`: three overloads with one idea.",
        "A **generic method** has its own type parameter: `Max<T>(T a, T b)`. But inside it, `a > b` will not compile — not every T can be compared.",
        "A **constraint** says what T must support: `where T : IComparable<T>`. Now the method may call `CompareTo`, and only types that have it are accepted."
      ] },
      page("Core idea"),
      run("max", "one Max for every comparable type", 'Console.WriteLine(Max(3, 7));\nConsole.WriteLine(Max(2.5, -1.0));\nConsole.WriteLine(Max("pear", "apple"));\n\nstatic T Max<T>(T a, T b) where T : IComparable<T> => a.CompareTo(b) >= 0 ? a : b;'),
      { ul: [
        "`static T Max<T>(T a, T b)` — the method's own type parameter.",
        "`where T : IComparable<T>` — the constraint; it is what lets the body call `a.CompareTo(b)`.",
        "`Max(3, 7)` — the compiler **infers** T = int from the arguments; `Max<int>(3, 7)` says it explicitly."
      ] },
      run("largest", "the largest of a whole list", 'Console.WriteLine(Largest(new List<int> { 4, 9, 2 }));\nConsole.WriteLine(Largest(new List<string> { "kiwi", "fig", "plum" }));\n\nstatic T Largest<T>(List<T> xs) where T : IComparable<T>\n{\n    if (xs.Count == 0) throw new ArgumentException("The list is empty.");\n    T best = xs[0];\n    foreach (T x in xs)\n        if (x.CompareTo(best) > 0) best = x;\n    return best;\n}'),
      page("Rules"),
      { table: { head: ["Constraint", "T must…"], rows: [["`where T : IComparable<T>`", "implement that interface"], ["`where T : Shape`", "be Shape or derive from it"], ["`where T : class`", "be a reference type"], ["`where T : struct`", "be a value type"], ["`where T : new()`", "have a public parameterless constructor"], ["`where T : notnull`", "not be a nullable type"]] } },
      { ul: [
        "Constraints can be combined: `where T : Shape, IComparable<T>, new()`.",
        "A generic method can live in any class, generic or not, and can be static.",
        "Type inference works from the arguments, not from the return value: `T Make<T>()` must be called as `Make<int>()`.",
        "A type argument that breaks a constraint is a compile error, so the method never meets a T it cannot handle."
      ] },
      page("Variations"),
      { h: "Swap anything" },
      run("swap", "Swap<T> with ref: no constraint needed", 'string a = "left", b = "right";\nSwap(ref a, ref b);\nint x = 1, y = 2;\nSwap(ref x, ref y);\nConsole.WriteLine($"{a} {b} {x} {y}");\n\nstatic void Swap<T>(ref T p, ref T q) => (p, q) = (q, p);'),
      { h: "A base-class constraint" },
      run("base", "T : Shape lets the method use Area", 'var squares = new List<Square> { new(2), new(5), new(3) };\nSquare big = Biggest(squares);\nConsole.WriteLine(big.Side);\n\nstatic T Biggest<T>(List<T> xs) where T : Shape\n{\n    T best = xs[0];\n    foreach (var x in xs) if (x.Area() > best.Area()) best = x;\n    return best;\n}\n\nabstract class Shape { public abstract double Area(); }\nclass Square : Shape { public double Side { get; } public Square(double s) => Side = s; public override double Area() => Side * Side; }'),
      { ul: [ "It returns a **Square**, not a Shape: `big.Side` works without a cast. That is what the generic version buys over `Shape Biggest(List<Shape>)`." ] },
      { h: "new(): making a T" },
      run("new", "Fill<T> creates fresh objects", 'var tallies = Fill<Tally>(3);\ntallies[0].N = 5;\nConsole.WriteLine($"{tallies.Count} {tallies[0].N} {tallies[1].N}");\n\nstatic List<T> Fill<T>(int n) where T : new()\n{\n    var xs = new List<T>();\n    for (int i = 0; i < n; i++) xs.Add(new T());\n    return xs;\n}\n\nclass Tally { public int N; }'),
      page("Pitfalls"),
      { h: "Using > on an unconstrained T — CS0019" },
      run("pit-op", "the compiler cannot know T has >", 'Console.WriteLine(Max(1, 2));\n\nstatic T Max<T>(T a, T b) => a > b ? a : b;'),
      { h: "A type that breaks the constraint — CS0311" },
      run("pit-constraint", "Thing is not IComparable<Thing>", 'var t = Max(new Thing(), new Thing());\n\nstatic T Max<T>(T a, T b) where T : IComparable<T> => a.CompareTo(b) >= 0 ? a : b;\n\nclass Thing { }'),
      { h: "Nothing to infer from — CS0411" },
      run("pit-infer", "no argument mentions T", 'var x = Make();\n\nstatic T Make<T>() where T : new() => new T();'),
      page("Connections"),
      { ul: [ "**Back:** 8.4 IComparable; 9.1 generic types.", "**Next:** 9.5 Map and Fold are generic methods; 9.8 every LINQ method is a generic method (`Where<TSource>`).", "**AQA:** 4.1.1.10–4.1.1.12 subroutines, made general." ] },
      page("Good practice"),
      { ul: [ "Constrain T to exactly what the body uses — no more.", "Let inference supply T; write it only when nothing mentions it.", "A generic method beats an overload per type when the bodies would be identical." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Repeat anything* and *The largest of each*." ] },
      page("Quick reference"),
      run("qr", "generic method at a glance", 'Console.WriteLine(Min(8, 3));\nConsole.WriteLine(Min("b", "a"));\n\nstatic T Min<T>(T a, T b) where T : IComparable<T> => a.CompareTo(b) <= 0 ? a : b;'),
      { ul: [ "`static R Name<T>(T x) where T : C`", "Inferred from arguments; `Name<int>(…)` otherwise.", "Constraints: interface, base class, class, struct, new(), notnull." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0019", "the operator is not known for T", "Pitfalls"], ["CS0311", "the type argument breaks the constraint", "Pitfalls"], ["CS0411", "T cannot be inferred; write it", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine(Pick(true, "yes", "no") + Pick(false, 1, 2));\n\nstatic T Pick<T>(bool first, T a, T b) => first ? a : b;', why: "\"yes\" + 2 joins as text: yes2.", concepts: ["generic-methods"] },
        { id: "p2", src: 'var xs = new List<string> { "pear", "fig", "banana" };\nConsole.WriteLine(Largest(xs));\n\nstatic T Largest<T>(List<T> xs) where T : IComparable<T>\n{\n    T b = xs[0];\n    foreach (var x in xs) if (x.CompareTo(b) > 0) b = x;\n    return b;\n}', why: "Strings compare alphabetically: pear is last.", concepts: ["constraints"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Max may call CompareTo.", src: 'Console.WriteLine(Max(4, 9));\n\nstatic T Max<T>(T a, T b) where T : @@ => a.CompareTo(b) >= 0 ? a : b;', out: "9", concepts: ["constraints"] }
      ],
      bug: [
        { id: "b1", q: "Smallest should return the SMALLEST item: it should print 2.", src: 'Console.WriteLine(Smallest(new List<int> { 5, 2, 8 }));\n\nstatic T Smallest<T>(List<T> xs) where T : IComparable<T>\n{\n    T best = xs[0];\n    foreach (var x in xs) if (x.CompareTo(best) > 0) best = x;\n    return best;\n}', out: "2", fixedText: "prints 2", why: "CompareTo > 0 keeps the larger; use < 0.", concepts: ["generic-methods"] }
      ]
    },
    flashcards: [
      ["What is a generic method?", "A method with its own type parameter: `T Max<T>(T a, T b)`."],
      ["How is T usually chosen for a generic method?", "Inferred from the arguments."],
      ["Why does `a > b` fail for an unconstrained T?", "Not every type has >; the compiler only allows what all T support."],
      ["What does `where T : IComparable<T>` allow?", "Calling CompareTo on T values."],
      ["What does `where T : new()` allow?", "Writing `new T()`."],
      ["What is CS0311?", "The type argument does not satisfy the method's constraint."]
    ],
    quiz: [
      { q: "`static T Max<T>(T a, T b) where T : IComparable<T>`; `Max(\"b\", \"a\")` returns…", opts: ["a", "b", "an error", "null"], ans: 1, why: "\"b\".CompareTo(\"a\") > 0." },
      { q: "`T Make<T>() where T : new()` must be called as…", opts: ["Make()", "Make<Thing>()", "new Make()", "Make(T)"], ans: 1, why: "No argument mentions T, so it cannot be inferred." },
      { q: "`where T : Shape` lets the method…", opts: ["create Shapes", "call Shape's members on T", "accept any type", "return void only"], ans: 1, why: "Every T is a Shape." }
    ]
  });
  K.add({ tasks: {
    "9.2-repeat": { lesson: "9.2", title: "Repeat anything", tier: "warm-up", minutes: 10, concepts: ["generic-methods"],
      statement: ["Write `static List<T> Repeat<T>(T item, int times)`.", "Read a word, a whole number and a count n (three lines). Print the word repeated n times joined by `-`, then the number repeated n times summed."],
      starter: 'string word = Console.ReadLine() ?? "";\nint num = int.Parse(Console.ReadLine() ?? "0");\nint n = int.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "ha\n7\n3", out: "ha-ha-ha\n21" }],
      hidden: [{ stdin: "x\n5\n1", out: "x\n5" }, { stdin: "go\n-2\n4", out: "go-go-go-go\n-8" }],
      rules: [uses(/List<\s*T\s*>\s+Repeat\s*<\s*T\s*>/, "Write List<T> Repeat<T>(T item, int times)."), uses(/Repeat\s*\(\s*word/, "Call Repeat for the word.", "w"), uses(/Repeat\s*\(\s*num/, "Call Repeat for the number.", "n")],
      hints: ["static List<T> Repeat<T>(T item, int times) { var xs = new List<T>(); for (int i = 0; i < times; i++) xs.Add(item); return xs; }", "string.Join(\"-\", Repeat(word, n))", "int sum = 0; foreach (int v in Repeat(num, n)) sum += v;"],
      answer: 'string word = Console.ReadLine() ?? "";\nint num = int.Parse(Console.ReadLine() ?? "0");\nint n = int.Parse(Console.ReadLine() ?? "0");\nConsole.WriteLine(string.Join("-", Repeat(word, n)));\nint sum = 0;\nforeach (int v in Repeat(num, n)) sum += v;\nConsole.WriteLine(sum);\n\nstatic List<T> Repeat<T>(T item, int times)\n{\n    var xs = new List<T>();\n    for (int i = 0; i < times; i++) xs.Add(item);\n    return xs;\n}' },
    "9.2-largest": { lesson: "9.2", title: "The largest of each", tier: "core", minutes: 15, concepts: ["generic-methods", "constraints"],
      statement: ["Write ONE method `static T Largest<T>(List<T> xs) where T : IComparable<T>` that throws ArgumentException for an empty list.", "Read a line of whole numbers and a line of words. Print the largest number and the alphabetically last word, using Largest for both — or `none` for an empty line."],
      starter: 'string[] nums = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nstring[] words = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\n',
      examples: [{ stdin: "4 19 -3 7\npear fig apple", out: "19\npear" }],
      hidden: [{ stdin: "\nzoo", out: "none\nzoo" }, { stdin: "-5 -9\n", out: "-5\nnone" }],
      rules: [uses(/T\s+Largest\s*<\s*T\s*>\s*\(\s*List<\s*T\s*>/, "Write T Largest<T>(List<T> xs)."), uses(/where\s+T\s*:\s*IComparable<\s*T\s*>/, "Constrain T to IComparable<T>.", "where"), noUse(/\.Max\s*\(|Math\.Max|\.Sort\s*\(|OrderBy/, "Find it with CompareTo yourself.", "nolib")],
      hints: ["if (xs.Count == 0) throw new ArgumentException(\"empty\");", "T best = xs[0]; foreach (T x in xs) if (x.CompareTo(best) > 0) best = x;", "Make a List<int> from the numbers; wrap each call in try/catch (ArgumentException) to print none."],
      answer: 'string[] nums = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nstring[] words = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nvar ints = new List<int>();\nforeach (string s in nums) ints.Add(int.Parse(s));\nConsole.WriteLine(Show(ints));\nConsole.WriteLine(Show(new List<string>(words)));\n\nstatic string Show<T>(List<T> xs) where T : IComparable<T>\n{\n    try { return Largest(xs).ToString() ?? ""; }\n    catch (ArgumentException) { return "none"; }\n}\n\nstatic T Largest<T>(List<T> xs) where T : IComparable<T>\n{\n    if (xs.Count == 0) throw new ArgumentException("The list is empty.");\n    T best = xs[0];\n    foreach (T x in xs)\n        if (x.CompareTo(best) > 0) best = x;\n    return best;\n}' }
  } });

  /* ================================================================
     9.3 Delegates, Func and Action
     ================================================================ */
  lesson("9.3", {
    aqa: "4.12.1.2",
    notes: [
      page("The problem it solves"),
      { ul: [
        "8.12 passed behaviour around as objects: a strategy class per discount. For one small function that is a lot of ceremony.",
        "A **delegate** is a type whose values are **methods**. Store one in a variable, put it in a list, pass it to another method, call it later.",
        "In functional terms (AQA 4.12), functions become **first-class values**, like numbers and strings."
      ] },
      page("Core idea"),
      run("func", "a method stored in a variable, then called", 'Func<int, int> f = Double;\nConsole.WriteLine(f(5));\nf = Square;\nConsole.WriteLine(f(5));\nConsole.WriteLine(ApplyTwice(Double, 3));\n\nstatic int Double(int x) => x * 2;\nstatic int Square(int x) => x * x;\nstatic int ApplyTwice(Func<int, int> g, int x) => g(g(x));'),
      { ul: [
        "`Func<int, int>` — a method taking an int and returning an int. The **last** type argument is the return type.",
        "`f = Double;` — no brackets: the method itself, not a call.",
        "`ApplyTwice` takes a function as a parameter and calls it."
      ] },
      run("action", "Action: a method that returns nothing", 'Action<string> say = Shout;\nsay("hello");\nsay = Whisper;\nsay("hello");\nAction tick = () => Console.WriteLine("tick");\ntick();\n\nstatic void Shout(string s) => Console.WriteLine(s.ToUpper() + "!");\nstatic void Whisper(string s) => Console.WriteLine(s.ToLower() + "...");'),
      page("Rules"),
      { table: { head: ["Delegate", "Takes", "Returns", "Example"], rows: [["`Action`", "nothing", "nothing", "`Action beep`"], ["`Action<T>`", "a T", "nothing", "`Action<string> log`"], ["`Func<R>`", "nothing", "R", "`Func<int> roll`"], ["`Func<T, R>`", "a T", "R", "`Func<int, int> twice`"], ["`Func<T1, T2, R>`", "T1, T2", "R", "`Func<int, int, int> add`"], ["`Predicate<T>`", "a T", "bool", "`Predicate<int> isEven`"]] } },
      { ul: [
        "A method fits a delegate when its parameters and return type match.",
        "A delegate value can be a named method, a lambda (9.4) or null.",
        "Call it like a method: `f(5)`, or `f.Invoke(5)`; `f?.Invoke(5)` skips a null one.",
        "You can declare your own delegate type: `delegate int Op(int a, int b);` — Func and Action cover almost every case."
      ] },
      page("Variations"),
      { h: "A table of operations" },
      run("table", "Dictionary<string, Func<…>> replaces a switch", 'var ops = new Dictionary<string, Func<double, double, double>>\n{\n    ["+"] = Add,\n    ["*"] = Mul,\n    ["max"] = Math.Max\n};\nforeach (var name in new[] { "+", "*", "max" })\n    Console.WriteLine($"{name}: {ops[name](6, 4)}");\n\nstatic double Add(double a, double b) => a + b;\nstatic double Mul(double a, double b) => a * b;'),
      { ul: [ "`Math.Max` is a library method with the right shape, so it fits too." ] },
      { h: "Your own delegate type" },
      run("custom", "delegate declares the shape by name", 'Grader g = Strict;\nConsole.WriteLine(g(65));\ng = Kind;\nConsole.WriteLine(g(65));\n\nstatic string Strict(int s) => s >= 70 ? "pass" : "fail";\nstatic string Kind(int s) => s >= 50 ? "pass" : "fail";\n\ndelegate string Grader(int score);'),
      { h: "Multicast: several methods in one delegate" },
      run("multicast", "+= adds a method; calling runs them all in order", 'Action<string>? log = ToScreen;\nlog += ToCount;\nlog?.Invoke("saved");\nlog?.Invoke("loaded");\nlog -= ToScreen;\nlog?.Invoke("closed");\n\nstatic void ToScreen(string m) => Console.WriteLine($"> {m}");\nstatic void ToCount(string m) => Console.WriteLine($"  ({m.Length} chars)");'),
      page("Pitfalls"),
      { h: "A method of the wrong shape — CS0123" },
      run("pit-sig", "Length takes a string; Func<int, int> wants an int", 'Func<int, int> f = Length;\n\nstatic int Length(string s) => s.Length;'),
      { h: "Brackets call the method — CS0029" },
      run("pit-call", "Double(2) is an int, not a function", 'Func<int, int> f = Double(2);\n\nstatic int Double(int x) => x * 2;'),
      { h: "Calling a null delegate" },
      run("pit-null", "no method was ever assigned", 'Action? done = null;\ndone?.Invoke();\nConsole.WriteLine("safe with ?.Invoke");\ndone!();'),
      page("Connections"),
      { ul: [ "**Back:** 3.x methods; 8.12 strategies as objects.", "**Next:** 9.4 lambdas write delegate values inline; 9.7 events are built on delegates; 9.8 LINQ takes Func arguments.", "**AQA:** 4.12.1.2 functions as first-class objects; 4.12.1.1 function types (`Func<int, int>` is int → int)." ] },
      page("Good practice"),
      { ul: [ "Use Func and Action; declare a delegate type only when a name explains it.", "Pass a function when one small behaviour varies; a class when it carries state or several methods.", "Invoke a delegate that may be null with `?.Invoke`." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Apply by name* and *A text pipeline*." ] },
      page("Quick reference"),
      run("qr", "delegates at a glance", 'Func<int, int, int> add = Add;\nAction<int> show = Show;\nshow(add(2, 3));\n\nstatic int Add(int a, int b) => a + b;\nstatic void Show(int n) => Console.WriteLine($"= {n}");'),
      { ul: [ "`Func<…, R>` returns R; `Action<…>` returns nothing.", "Assign without brackets; call with them.", "`+=` chains methods; `?.Invoke` for maybe-null." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0123", "no overload matches the delegate", "Pitfalls"], ["CS0029", "a call's result is not a function", "Pitfalls"], ["NullReferenceException", "the delegate is null", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Func<int, int> f = Inc;\nf = Twice(f);\nConsole.WriteLine(f(5));\n\nstatic int Inc(int x) => x + 1;\nstatic Func<int, int> Twice(Func<int, int> g) => x => g(g(x));', why: "Twice(Inc) adds 1 twice: 7.", concepts: ["delegates"] },
        { id: "p2", src: 'Action a = One;\na += Two;\na += One;\na();\n\nstatic void One() => Console.Write("1");\nstatic void Two() => Console.Write("2");', why: "A multicast delegate runs One, Two, One in order.", concepts: ["delegates"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the delegate type for a method int → bool.", src: '@@ test = IsEven;\nConsole.WriteLine(test(6));\n\nstatic bool IsEven(int n) => n % 2 == 0;', out: "True", concepts: ["delegates"] }
      ],
      bug: [
        { id: "b1", q: "Apply should use the function it is given: it should print 25.", src: 'Console.WriteLine(Apply(Square, 5));\n\nstatic int Square(int x) => x * x;\nstatic int Twice(int x) => x * 2;\nstatic int Apply(Func<int, int> f, int x) => Twice(x);', out: "25", fixedText: "prints 25", why: "Apply ignored f and always called Twice; call f(x).", concepts: ["delegates"] }
      ]
    },
    flashcards: [
      ["What is a delegate?", "A type whose values are methods: they can be stored, passed and called."],
      ["`Func<string, int>` takes and returns…", "Takes a string, returns an int (the last type is the return)."],
      ["Func or Action for a method that returns nothing?", "Action."],
      ["Why `f = Double;` and not `f = Double(2);`?", "Without brackets it is the method; with them it is a call's result."],
      ["How do you call a delegate that may be null?", "`f?.Invoke(args)`."],
      ["What does `+=` do to a delegate?", "Adds another method; calling runs them all in order."]
    ],
    quiz: [
      { q: "A method `bool Check(string s)` fits…", opts: ["Func<bool, string>", "Func<string, bool>", "Action<string>", "Action<bool>"], ans: 1, why: "Parameters first, return type last." },
      { q: "In AQA terms, being able to pass a function as an argument makes it…", opts: ["static", "a first-class object", "recursive", "pure"], ans: 1, why: "First-class: usable like any other value." },
      { q: "`Action<int> a = Print; a += Log; a(3);` runs…", opts: ["Print only", "Log only", "Print then Log", "an error"], ans: 2, why: "A multicast delegate calls each in order." }
    ]
  });
  K.add({ tasks: {
    "9.3-apply": { lesson: "9.3", title: "Apply by name", tier: "core", minutes: 15, concepts: ["delegates"],
      statement: ["Write four methods int → int — `Double`, `Square`, `Negate`, `Inc` — and put them in a `Dictionary<string, Func<int, int>>` keyed `double`, `square`, `negate`, `inc`.", "Read a starting number, then operation names one per line until the end. Apply each in turn and print the running value, or `unknown NAME` (leaving the value as it was)."],
      starter: 'int v = int.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "3\ndouble\nsquare\nnegate\ninc", out: "6\n36\n-36\n-35" }],
      hidden: [{ stdin: "5\ntriple\ninc", out: "unknown triple\n6" }, { stdin: "0", out: "" }],
      rules: [uses(/Dictionary<\s*string\s*,\s*Func<\s*int\s*,\s*int\s*>\s*>/, "Keep them in a Dictionary<string, Func<int, int>>."), noUse(/switch|==\s*"(double|square|negate|inc)"/, "Look the function up; no switch on the name.", "noswitch")],
      hints: ["var ops = new Dictionary<string, Func<int, int>> { [\"double\"] = Double, … };", "if (ops.TryGetValue(line, out var f)) { v = f(v); Console.WriteLine(v); }", "static int Negate(int x) => -x;"],
      answer: 'int v = int.Parse(Console.ReadLine() ?? "0");\nvar ops = new Dictionary<string, Func<int, int>>\n{\n    ["double"] = Double,\n    ["square"] = Square,\n    ["negate"] = Negate,\n    ["inc"] = Inc\n};\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    if (ops.TryGetValue(line, out var f))\n    {\n        v = f(v);\n        Console.WriteLine(v);\n    }\n    else Console.WriteLine($"unknown {line}");\n}\n\nstatic int Double(int x) => x * 2;\nstatic int Square(int x) => x * x;\nstatic int Negate(int x) => -x;\nstatic int Inc(int x) => x + 1;' },
    "9.3-pipeline": { lesson: "9.3", title: "A text pipeline", tier: "stretch", minutes: 20, concepts: ["delegates", "higher-order"],
      statement: ["Read a line of step names (`upper`, `lower`, `reverse`, `trim`, `dots` — spaces become dots), then lines of text until the end.", "Build a `List<Func<string, string>>` from the steps once (ignore unknown names), then run each text line through every step in order and print the result. Write a method `Run(List<Func<string, string>> steps, string s)`."],
      starter: 'string[] names = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\n',
      examples: [{ stdin: "trim upper dots\n  hello world \nab c", out: "HELLO.WORLD\nAB.C" }],
      hidden: [{ stdin: "reverse lower nope\nABC", out: "cba" }, { stdin: "\nas is", out: "as is" }],
      rules: [uses(/List<\s*Func<\s*string\s*,\s*string\s*>\s*>/, "Build a List<Func<string, string>>."), uses(/Run\s*\(\s*List<\s*Func/, "Write Run(List<Func<string, string>> steps, string s).", "run")],
      hints: ["static string Reverse(string s) { char[] c = s.ToCharArray(); Array.Reverse(c); return new string(c); }", "foreach (var n in names) { if (n == \"upper\") steps.Add(Upper); … }", "static string Run(List<Func<string, string>> steps, string s) { foreach (var f in steps) s = f(s); return s; }"],
      answer: 'string[] names = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nvar known = new Dictionary<string, Func<string, string>>\n{\n    ["upper"] = Upper, ["lower"] = Lower, ["reverse"] = Reverse, ["trim"] = Trim, ["dots"] = Dots\n};\nvar steps = new List<Func<string, string>>();\nforeach (var n in names)\n    if (known.TryGetValue(n, out var f)) steps.Add(f);\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n    Console.WriteLine(Run(steps, line));\n\nstatic string Run(List<Func<string, string>> steps, string s)\n{\n    foreach (var f in steps) s = f(s);\n    return s;\n}\nstatic string Upper(string s) => s.ToUpper();\nstatic string Lower(string s) => s.ToLower();\nstatic string Trim(string s) => s.Trim();\nstatic string Dots(string s) => s.Replace(\' \', \'.\');\nstatic string Reverse(string s)\n{\n    char[] c = s.ToCharArray();\n    Array.Reverse(c);\n    return new string(c);\n}' }
  } });

  /* ================================================================
     9.4 Lambdas
     ================================================================ */
  lesson("9.4", {
    aqa: "4.12.1.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "To sort by length or find the first big number, 9.3 needed a named method somewhere else in the file, used once.",
        "A **lambda** is a function written where it is needed: `x => x * 2`. It has no name and becomes a delegate value.",
        "A lambda can also **capture** variables around it, carrying them along — a **closure**."
      ] },
      page("Core idea"),
      run("forms", "expression lambdas and a statement lambda", 'Func<int, int> twice = x => x * 2;\nFunc<int, int, int> add = (a, b) => a + b;\nFunc<string, bool> isLong = s => s.Length > 4;\nFunc<int, string> sign = n =>\n{\n    if (n > 0) return "positive";\n    return n < 0 ? "negative" : "zero";\n};\nConsole.WriteLine($"{twice(7)} {add(2, 3)} {isLong("hello")} {sign(-4)}");'),
      { ul: [
        "`x => x * 2` — parameter, arrow (\"goes to\"), result. The types come from the delegate it is assigned to.",
        "Two or more parameters need brackets: `(a, b) => a + b`; none: `() => 42`.",
        "A body in `{ }` is a statement lambda and needs `return`."
      ] },
      run("sort", "List methods that take lambdas", 'var words = new List<string> { "banana", "fig", "cherry", "kiwi" };\nwords.Sort((a, b) => a.Length.CompareTo(b.Length));\nConsole.WriteLine(string.Join(" ", words));\nConsole.WriteLine(words.Find(w => w.StartsWith("c")));\nConsole.WriteLine(words.Exists(w => w.Length > 6));\nwords.RemoveAll(w => w.Length < 4);\nConsole.WriteLine(words.Count);'),
      page("Rules"),
      { ul: [
        "A lambda has no type of its own until it meets a delegate type (`Func<int, int>`); `var f = (int x) => x + 1;` works because the parameter type is written.",
        "Parameter types may be written: `(int a, int b) => a + b`; usually they are inferred.",
        "A lambda may read and change variables of the method it is in: it **captures** them by reference, not by value.",
        "A captured variable lives as long as the lambda does, even after its method returns.",
        "`static x => …` forbids capturing, for when you want to be sure.",
        "The `_` discard names a parameter you ignore: `(_, b) => b`."
      ] },
      page("Variations"),
      { h: "A closure: a counter that remembers" },
      run("closure", "each counter keeps its own count", 'var a = MakeCounter();\nvar b = MakeCounter();\nConsole.WriteLine($"{a()} {a()} {a()} {b()}");\n\nstatic Func<int> MakeCounter()\n{\n    int count = 0;\n    return () => ++count;\n}'),
      { h: "Capture is by reference" },
      run("capture", "the lambda sees the variable as it is when it runs", 'int limit = 10;\nFunc<int, bool> small = x => x < limit;\nConsole.WriteLine(small(7));\nlimit = 5;\nConsole.WriteLine(small(7));'),
      { h: "Lambdas as arguments to your own methods" },
      run("own", "Count works for any test", 'var marks = new[] { 45, 72, 90, 38, 66 };\nConsole.WriteLine(Count(marks, m => m >= 50));\nConsole.WriteLine(Count(marks, m => m % 2 == 0));\n\nstatic int Count(int[] xs, Func<int, bool> test)\n{\n    int n = 0;\n    foreach (int x in xs) if (test(x)) n++;\n    return n;\n}'),
      page("Pitfalls"),
      { h: "A lambda with nothing to say its type — CS8917" },
      run("pit-var", "var cannot guess what x is", 'var f = x => x + 1;\nConsole.WriteLine(f(1));'),
      { h: "Capturing a for-loop variable" },
      run("pit-loop", "all three lambdas share one i, which ends at 3", 'var fs = new List<Func<int>>();\nfor (int i = 0; i < 3; i++) fs.Add(() => i);\nforeach (var f in fs) Console.Write(f() + " ");\nConsole.WriteLine();'),
      { ul: [ "Copy it inside the loop (`int j = i; fs.Add(() => j);`) or use foreach, whose variable is new each time round." ] },
      { h: "A statement lambda without return — CS1643" },
      run("pit-return", "not every path returns a value", 'Func<int, string> f = n => { if (n > 0) return "pos"; };\nConsole.WriteLine(f(1));'),
      page("Connections"),
      { ul: [ "**Back:** 9.3 delegates — a lambda is a delegate value written inline.", "**Next:** 9.5 passes lambdas to map, filter and fold; 9.8 every LINQ query is lambdas.", "**AQA:** 4.12.1.1 function types; 4.12.1.4 partial application is a lambda returned from a function." ] },
      page("Good practice"),
      { ul: [ "Keep lambdas short; give anything long a name.", "Name parameters for what they are (`w => w.Length`, `s => s.Score`).", "Be deliberate about capture; copy loop variables in a for loop." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Sort by a rule* and *Step counters*." ] },
      page("Quick reference"),
      run("qr", "lambdas at a glance", 'Func<double, double> half = x => x / 2;\nvar nums = new List<int> { 3, 8, 1 };\nnums.Sort((a, b) => b.CompareTo(a));\nConsole.WriteLine($"{half(5)} {string.Join(",", nums)}");'),
      { ul: [ "`x => expr`, `(a, b) => expr`, `() => expr`, `x => { …; return …; }`.", "Captures variables by reference.", "Sort, Find, FindAll, Exists, RemoveAll take lambdas." ] },
      { table: { head: ["Code", "Means", "Page"], rows: [["CS8917", "the lambda's type cannot be inferred", "Pitfalls"], ["CS1643", "not every path returns a value", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int total = 0;\nAction<int> add = n => total += n;\nadd(5);\nadd(7);\nConsole.WriteLine(total);', why: "The lambda changes the captured total: 12.", concepts: ["closures"] },
        { id: "p2", src: 'var xs = new List<int> { 5, 12, 8, 20 };\nConsole.WriteLine(xs.FindAll(x => x > 6).Count + " " + xs.Find(x => x > 10));', why: "Three are over 6; the first over 10 is 12.", concepts: ["lambdas"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with a lambda that adds 10.", src: 'Func<int, int> f = @@;\nConsole.WriteLine(f(5));', out: "15", concepts: ["lambdas"] }
      ],
      bug: [
        { id: "b1", q: "It should print 0 1 2 — one lambda per number.", src: 'var fs = new List<Func<int>>();\nfor (int i = 0; i < 3; i++) fs.Add(() => i);\nstring s = "";\nforeach (var f in fs) s += f() + " ";\nConsole.WriteLine(s.Trim());', out: "0 1 2", fixedText: "prints 0 1 2", why: "Every lambda captured the same i (3 by the end). Copy it: int j = i; fs.Add(() => j);", concepts: ["closures"] }
      ]
    },
    flashcards: [
      ["What is a lambda?", "An unnamed function written inline, such as `x => x * 2`."],
      ["Lambda with two parameters?", "`(a, b) => a + b`."],
      ["What does a closure capture?", "Variables from the surrounding method — by reference, so it sees later changes."],
      ["Why does `for (…) fs.Add(() => i)` give 3 3 3?", "All lambdas share the one loop variable, which ends at 3."],
      ["Sort a list of strings by length with a lambda.", "`xs.Sort((a, b) => a.Length.CompareTo(b.Length));`"],
      ["When is a statement lambda needed?", "When the body needs several statements; it must return explicitly."]
    ],
    quiz: [
      { q: "`Func<int, int> f = x => x * x; f(4)` is…", opts: ["8", "16", "4", "an error"], ans: 1, why: "4 × 4." },
      { q: "`int k = 1; Func<int> g = () => k; k = 9; g()` is…", opts: ["1", "9", "0", "an error"], ans: 1, why: "Captured by reference: it reads k when called." },
      { q: "`var f = x => x;` fails because…", opts: ["lambdas cannot be stored", "x has no type to infer", "var is not allowed", "=> is wrong"], ans: 1, why: "CS8917: write the parameter type or a delegate type." }
    ]
  });
  K.add({ tasks: {
    "9.4-sort": { lesson: "9.4", title: "Sort by a rule", tier: "core", minutes: 15, concepts: ["lambdas"],
      statement: ["Read words separated by spaces. Sort them with ONE `Sort` call and a lambda: shortest first, and words of equal length alphabetically (ordinal).", "Print them separated by spaces, then the first word containing an `e` (with `Find` and a lambda), or `no e`."],
      starter: 'var words = new List<string>((Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries));\n',
      examples: [{ stdin: "pear fig apple kiwi date", out: "fig date kiwi pear apple\ndate" }],
      hidden: [{ stdin: "bb a cc", out: "a bb cc\nno e" }, { stdin: "eel", out: "eel\neel" }],
      rules: [uses(/\.Sort\s*\(\s*\(\s*\w+\s*,\s*\w+\s*\)\s*=>/, "Sort with one lambda (a, b) => …."), uses(/\.Find\s*\(\s*\w+\s*=>/, "Find with a lambda.", "find"), noUse(/OrderBy/, "Sort the list itself.", "noorder")],
      hints: ["words.Sort((a, b) => a.Length != b.Length ? a.Length.CompareTo(b.Length) : string.CompareOrdinal(a, b));", "string? e = words.Find(w => w.Contains(\'e\'));", "Console.WriteLine(e ?? \"no e\");"],
      answer: 'var words = new List<string>((Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries));\nwords.Sort((a, b) => a.Length != b.Length ? a.Length.CompareTo(b.Length) : string.CompareOrdinal(a, b));\nConsole.WriteLine(string.Join(" ", words));\nstring? e = words.Find(w => w.Contains(\'e\'));\nConsole.WriteLine(e ?? "no e");' },
    "9.4-counter": { lesson: "9.4", title: "Step counters", tier: "core", minutes: 15, concepts: ["closures", "lambdas"],
      statement: ["Write `static Func<int> MakeCounter(int start, int step)` that returns a lambda; each call returns the next value (`start`, then `start + step`, …).", "Read `START STEP` for counter A and counter B (two lines), then a line of letters `a`/`b`. For each letter call that counter and print its value."],
      starter: 'string[] a = (Console.ReadLine() ?? "").Split(\' \');\nstring[] b = (Console.ReadLine() ?? "").Split(\' \');\nstring calls = Console.ReadLine() ?? "";\n',
      examples: [{ stdin: "0 1\n10 5\naabab", out: "0\n1\n10\n2\n15" }],
      hidden: [{ stdin: "3 -1\n0 0\nbbaa", out: "0\n0\n3\n2" }, { stdin: "1 1\n1 1\n", out: "" }],
      rules: [uses(/Func<\s*int\s*>\s+MakeCounter\s*\(/, "Write Func<int> MakeCounter(int start, int step)."), uses(/return\s*\(\s*\)\s*=>/, "Return a lambda () => ….", "lambda")],
      hints: ["static Func<int> MakeCounter(int start, int step) { int next = start; return () => { int v = next; next += step; return v; }; }", "var ca = MakeCounter(int.Parse(a[0]), int.Parse(a[1]));", "foreach (char c in calls) Console.WriteLine(c == 'a' ? ca() : cb());"],
      answer: 'string[] a = (Console.ReadLine() ?? "").Split(\' \');\nstring[] b = (Console.ReadLine() ?? "").Split(\' \');\nstring calls = Console.ReadLine() ?? "";\nvar ca = MakeCounter(int.Parse(a[0]), int.Parse(a[1]));\nvar cb = MakeCounter(int.Parse(b[0]), int.Parse(b[1]));\nforeach (char c in calls)\n    Console.WriteLine(c == \'a\' ? ca() : cb());\n\nstatic Func<int> MakeCounter(int start, int step)\n{\n    int next = start;\n    return () =>\n    {\n        int v = next;\n        next += step;\n        return v;\n    };\n}' }
  } });

  /* ================================================================
     9.5 Higher-order functions: map, filter and fold
     ================================================================ */
  lesson("9.5", {
    aqa: "4.12.2.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Most loops over a list do one of three jobs: **transform** every item (square each mark), **keep** some (only the passes), or **combine** them into one value (the total).",
        "Written as loops, each job is five lines that hide the one line that matters.",
        "A **higher-order function** takes or returns a function. Three of them — **map**, **filter** and **fold** (also called reduce) — capture those three jobs once, so each use is one line."
      ] },
      page("Core idea"),
      run("own", "map, filter and fold written by hand", 'var marks = new List<int> { 45, 72, 90, 38, 66 };\nvar passed = Filter(marks, m => m >= 50);\nvar curved = Map(passed, m => m + 5);\nint total = Fold(curved, 0, (acc, m) => acc + m);\nConsole.WriteLine(string.Join(" ", passed));\nConsole.WriteLine(string.Join(" ", curved));\nConsole.WriteLine(total);\n\nstatic List<R> Map<T, R>(List<T> xs, Func<T, R> f)\n{\n    var result = new List<R>();\n    foreach (var x in xs) result.Add(f(x));\n    return result;\n}\n\nstatic List<T> Filter<T>(List<T> xs, Func<T, bool> keep)\n{\n    var result = new List<T>();\n    foreach (var x in xs) if (keep(x)) result.Add(x);\n    return result;\n}\n\nstatic A Fold<T, A>(List<T> xs, A seed, Func<A, T, A> step)\n{\n    A acc = seed;\n    foreach (var x in xs) acc = step(acc, x);\n    return acc;\n}'),
      { ul: [
        "**map** `(T → R)`: a new list, the function applied to each item. Same length.",
        "**filter** `(T → bool)`: a new list of the items the test keeps. Same items or fewer.",
        "**fold** `(seed, (A, T) → A)`: start from the seed, combine each item into the accumulator. One value.",
        "None of them changes the original list."
      ] },
      page("Rules"),
      { ul: [
        "A **higher-order function** takes a function as an argument or returns one (AQA 4.12.2.1).",
        "map and filter return new lists; fold returns one value of the accumulator's type, which may differ from the items' type.",
        "fold's seed is the answer for an empty list: 0 for a sum, 1 for a product, \"\" for joined text.",
        "Fold left goes from the first item to the last; for + and × the order does not matter, for − and string building it does.",
        "In LINQ (9.8) map is `Select`, filter is `Where`, fold is `Aggregate`; `List<T>` also has `ConvertAll` (map) and `FindAll` (filter)."
      ] },
      { table: { head: ["Function", "Haskell (AQA)", "C# LINQ", "Gives"], rows: [["map", "`map f xs`", "`xs.Select(f)`", "a list, same length"], ["filter", "`filter p xs`", "`xs.Where(p)`", "a list, shorter or equal"], ["fold", "`foldl f seed xs`", "`xs.Aggregate(seed, f)`", "one value"]] } },
      page("Variations"),
      { h: "Fold does everything" },
      run("folds", "sum, product, maximum and joining with one Fold", 'var xs = new List<int> { 3, 1, 4, 1, 5 };\nConsole.WriteLine(Fold(xs, 0, (a, x) => a + x));\nConsole.WriteLine(Fold(xs, 1, (a, x) => a * x));\nConsole.WriteLine(Fold(xs, int.MinValue, (a, x) => Math.Max(a, x)));\nConsole.WriteLine(Fold(xs, "", (a, x) => a + x));\n\nstatic A Fold<T, A>(List<T> xs, A seed, Func<A, T, A> step)\n{\n    A acc = seed;\n    foreach (var x in xs) acc = step(acc, x);\n    return acc;\n}'),
      { h: "Returning a function: partial application" },
      run("returns", "Adder(5) returns a function that adds 5", 'Func<int, int> add5 = Adder(5);\nFunc<int, int> add10 = Adder(10);\nConsole.WriteLine(add5(1) + " " + add10(1));\nvar add100 = Adder(100);\nvar xs = new List<int> { 1, 2, 3 };\nConsole.WriteLine(string.Join(" ", xs.ConvertAll(x => add100(x))));\n\nstatic Func<int, int> Adder(int n) => x => x + n;'),
      { h: "Composition" },
      run("compose", "Compose(f, g) is the function \"g, then f\"", 'Func<int, int> inc = x => x + 1;\nFunc<int, int> sq = x => x * x;\nvar incThenSq = Compose(sq, inc);\nvar sqThenInc = Compose(inc, sq);\nConsole.WriteLine($"{incThenSq(3)} {sqThenInc(3)}");\n\nstatic Func<T, R> Compose<T, M, R>(Func<M, R> f, Func<T, M> g) => x => f(g(x));'),
      page("Pitfalls"),
      { h: "The wrong seed" },
      run("pit-seed", "a product starting from 0 is always 0", 'var xs = new List<int> { 2, 3, 4 };\nint product = 0;\nforeach (int x in xs) product *= x;\nConsole.WriteLine(product);'),
      { h: "A function that does not fit the items — CS1061" },
      run("pit-type", "Map(xs, x => x.Length) on ints: an int has no Length", 'var xs = new List<int> { 1, 2 };\nvar ys = Map(xs, x => x.Length);\n\nstatic List<R> Map<T, R>(List<T> xs, Func<T, R> f)\n{\n    var o = new List<R>();\n    foreach (var x in xs) o.Add(f(x));\n    return o;\n}'),
      { h: "Expecting map to change the list" },
      run("pit-mutate", "ConvertAll returns a new list; the old one is unchanged", 'var xs = new List<int> { 1, 2, 3 };\nxs.ConvertAll(x => x * 10);\nConsole.WriteLine(string.Join(" ", xs));'),
      page("Connections"),
      { ul: [ "**Back:** 9.3 delegates, 9.4 lambdas, 9.2 generic methods.", "**Next:** 9.8 LINQ's Select and Where are map and filter; 9.9 Aggregate is fold.", "**AQA:** 4.12.2.1 map, filter and reduce/fold; 4.12.1.4 partial application; 4.12.1.5 composition (`f ∘ g`)." ] },
      page("Good practice"),
      { ul: [ "Name which job a loop does; if it is map, filter or fold, use one.", "Keep the functions passed in pure: no printing, no changing outside state.", "Choose fold's seed as the empty-list answer." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Your own map, filter and fold* and *Compose a recipe*." ] },
      page("Quick reference"),
      run("qr", "the three at a glance with List methods", 'var xs = new List<int> { 1, 2, 3, 4 };\nvar evens = xs.FindAll(x => x % 2 == 0);\nvar doubled = evens.ConvertAll(x => x * 2);\nint sum = 0;\ndoubled.ForEach(x => sum += x);\nConsole.WriteLine($"{string.Join(",", doubled)} {sum}");'),
      { ul: [ "map: `Func<T, R>` → same length.", "filter: `Func<T, bool>` → kept items.", "fold: `seed`, `Func<A, T, A>` → one value." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1061", "the lambda uses a member the items do not have", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var xs = new List<int> { 1, 2, 3, 4, 5 };\nvar r = xs.FindAll(x => x % 2 == 1).ConvertAll(x => x * x);\nConsole.WriteLine(string.Join("+", r));', why: "Odd numbers 1, 3, 5 squared.", concepts: ["fold", "higher-order"] },
        { id: "p2", src: 'var ws = new List<string> { "a", "bb", "ccc" };\nint n = Fold(ws, 0, (acc, w) => acc + w.Length);\nConsole.WriteLine(n);\n\nstatic A Fold<T, A>(List<T> xs, A seed, Func<A, T, A> f) { A a = seed; foreach (var x in xs) a = f(a, x); return a; }', why: "The accumulator is an int while the items are strings: 1 + 2 + 3.", concepts: ["fold"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the seed so Fold multiplies correctly.", src: 'var xs = new List<int> { 2, 3, 4 };\nConsole.WriteLine(Fold(xs, @@, (a, x) => a * x));\n\nstatic A Fold<T, A>(List<T> xs, A seed, Func<A, T, A> f) { A a = seed; foreach (var x in xs) a = f(a, x); return a; }', out: "24", concepts: ["fold"] }
      ],
      bug: [
        { id: "b1", q: "Map should apply f to every item: it should print 2 4 6.", src: 'var r = Map(new List<int> { 1, 2, 3 }, x => x * 2);\nConsole.WriteLine(string.Join(" ", r));\n\nstatic List<R> Map<T, R>(List<T> xs, Func<T, R> f)\n{\n    var o = new List<R>();\n    for (int i = 1; i < xs.Count; i++) o.Add(f(xs[i]));\n    return o;\n}', out: "2 4 6", fixedText: "prints 2 4 6", why: "The loop starts at 1 and skips the first item; start at 0 (or use foreach).", concepts: ["higher-order"] }
      ]
    },
    flashcards: [
      ["What is a higher-order function?", "One that takes a function as an argument or returns one."],
      ["What does map do?", "Applies a function to every item, giving a new list of the same length."],
      ["What does filter do?", "Keeps only the items a test accepts."],
      ["What does fold do?", "Combines all items into one value, starting from a seed."],
      ["What seed for a product?", "1 (the answer for an empty list)."],
      ["LINQ names for map, filter and fold?", "Select, Where and Aggregate."]
    ],
    quiz: [
      { q: "map over a list of 5 items gives…", opts: ["1 value", "5 items", "up to 5 items", "0 items"], ans: 1, why: "One output per input." },
      { q: "`Adder(3)` returning `x => x + 3` is an example of…", opts: ["recursion", "partial application", "boxing", "filter"], ans: 1, why: "Fixing one argument to make a new function." },
      { q: "Which folds to the largest item?", opts: ["seed 0, (a, x) => a + x", "seed int.MinValue, (a, x) => Math.Max(a, x)", "seed 1, (a, x) => a * x", "seed \"\", (a, x) => a + x"], ans: 1, why: "Keep the larger at each step." }
    ]
  });
  K.add({ tasks: {
    "9.5-own": { lesson: "9.5", title: "Your own map, filter and fold", tier: "core", minutes: 20, concepts: ["higher-order", "fold"],
      statement: ["Write generic `Map`, `Filter` and `Fold` yourself (no LINQ and no ConvertAll/FindAll).", "Read whole numbers on one line. With your three functions print: the even numbers' squares (space-separated, or `none`), their sum, and the largest number overall (`none` for an empty line)."],
      starter: 'var xs = new List<int>();\nforeach (string s in (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries)) xs.Add(int.Parse(s));\n',
      examples: [{ stdin: "3 4 1 6 5", out: "16 36\n52\n6" }],
      hidden: [{ stdin: "", out: "none\n0\nnone" }, { stdin: "-3 -7 1", out: "none\n0\n1" }, { stdin: "2 2", out: "4 4\n8\n2" }],
      rules: [uses(/static\s+List<\s*R\s*>\s+Map\s*<\s*T\s*,\s*R\s*>/, "Write List<R> Map<T, R>(…)."), uses(/Filter\s*<\s*T\s*>\s*\(/, "Write Filter<T>(…).", "filter"), uses(/Fold\s*<\s*T\s*,\s*A\s*>\s*\(/, "Write Fold<T, A>(…).", "fold"), noUse(/(?<!Math)\.(Select|Where|Aggregate|Sum|Max|ConvertAll|FindAll)\s*\(/, "Use your own three, not the library's.", "nolib")],
      hints: ["static List<R> Map<T, R>(List<T> xs, Func<T, R> f) { var o = new List<R>(); foreach (var x in xs) o.Add(f(x)); return o; }", "var sq = Map(Filter(xs, x => x % 2 == 0), x => x * x); int sum = Fold(sq, 0, (a, x) => a + x);", "Largest: xs.Count == 0 ? \"none\" : Fold(xs, xs[0], (a, x) => Math.Max(a, x)).ToString()"],
      answer: 'var xs = new List<int>();\nforeach (string s in (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries)) xs.Add(int.Parse(s));\nvar sq = Map(Filter(xs, x => x % 2 == 0), x => x * x);\nConsole.WriteLine(sq.Count == 0 ? "none" : string.Join(" ", sq));\nConsole.WriteLine(Fold(sq, 0, (a, x) => a + x));\nConsole.WriteLine(xs.Count == 0 ? "none" : Fold(xs, xs[0], (a, x) => Math.Max(a, x)).ToString());\n\nstatic List<R> Map<T, R>(List<T> xs, Func<T, R> f)\n{\n    var o = new List<R>();\n    foreach (var x in xs) o.Add(f(x));\n    return o;\n}\n\nstatic List<T> Filter<T>(List<T> xs, Func<T, bool> keep)\n{\n    var o = new List<T>();\n    foreach (var x in xs) if (keep(x)) o.Add(x);\n    return o;\n}\n\nstatic A Fold<T, A>(List<T> xs, A seed, Func<A, T, A> step)\n{\n    A acc = seed;\n    foreach (var x in xs) acc = step(acc, x);\n    return acc;\n}' },
    "9.5-recipe": { lesson: "9.5", title: "Compose a recipe", tier: "stretch", minutes: 25, concepts: ["higher-order", "fold"],
      statement: ["Read a line of steps such as `add 3`, `mul 2`, `sq` separated by commas, then numbers one per line until the end.", "Turn each step into a `Func<long, long>` (`add N`, `mul N`, `sq`, `neg`), then **fold** them into ONE function with a `Compose` helper — the steps run left to right. Print the composed function applied to each number."],
      starter: 'string[] steps = (Console.ReadLine() ?? "").Split(\',\', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);\n',
      examples: [{ stdin: "add 3, mul 2, sq\n1\n0", out: "64\n36" }],
      hidden: [{ stdin: "neg, add 10\n4\n-1", out: "6\n11" }, { stdin: "sq\n12", out: "144" }],
      rules: [uses(/Func<\s*long\s*,\s*long\s*>\s+Compose\s*\(/, "Write Func<long, long> Compose(…)."), uses(/Aggregate\s*\(|Fold\s*[<(]/, "Fold the steps into one function (Aggregate or your own Fold).", "fold")],
      hints: ["Func<long, long> Make(string s) { var p = s.Split(' '); return p[0] switch { \"add\" => x => x + long.Parse(p[1]), … }; }", "static Func<long, long> Compose(Func<long, long> first, Func<long, long> then) => x => then(first(x));", "Func<long, long> all = steps.Select(Make).Aggregate((Func<long, long>)(x => x), Compose);"],
      answer: 'string[] steps = (Console.ReadLine() ?? "").Split(\',\', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);\nFunc<long, long> all = x => x;\nall = steps.Aggregate(all, (acc, s) => Compose(acc, Make(s)));\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n    Console.WriteLine(all(long.Parse(line)));\n\nstatic Func<long, long> Compose(Func<long, long> first, Func<long, long> then) => x => then(first(x));\n\nstatic Func<long, long> Make(string s)\n{\n    string[] p = s.Split(\' \');\n    return p[0] switch\n    {\n        "add" => x => x + long.Parse(p[1]),\n        "mul" => x => x * long.Parse(p[1]),\n        "sq" => x => x * x,\n        _ => x => -x\n    };\n}' }
  } });

  /* ================================================================
     9.6 Extension methods
     ================================================================ */
  lesson("9.6", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "You want `\"the cat sat\".WordCount()`, but `string` is Microsoft's sealed class — you cannot add a method to it or inherit from it.",
        "A helper `TextTools.WordCount(s)` works but reads inside-out when calls chain: `Shout(Trim(WordsOf(s)))`.",
        "An **extension method** is a static method that the compiler lets you call **as if** it were an instance method: `s.WordCount()`. All of LINQ is built this way."
      ] },
      page("Core idea"),
      run("first", "WordCount on any string", 'string s = "the cat sat on the mat";\nConsole.WriteLine(s.WordCount());\nConsole.WriteLine("  ".WordCount());\n\nstatic class TextExtensions\n{\n    public static int WordCount(this string s) =>\n        s.Split(\' \', StringSplitOptions.RemoveEmptyEntries).Length;\n}'),
      { ul: [
        "A **static class** holds it; the method is **static**.",
        "`this string s` — the first parameter, marked `this`, is the value before the dot.",
        "`s.WordCount()` is compiled as `TextExtensions.WordCount(s)`. Nothing is added to string itself."
      ] },
      run("chain", "extensions read left to right when chained", 'Console.WriteLine("  hello world ".Tidy().Initials().Shout());\n\nstatic class TextExtensions\n{\n    public static string Tidy(this string s) => s.Trim();\n    public static string Initials(this string s)\n    {\n        string r = "";\n        foreach (var w in s.Split(\' \', StringSplitOptions.RemoveEmptyEntries)) r += w[0];\n        return r;\n    }\n    public static string Shout(this string s) => s.ToUpper() + "!";\n}'),
      page("Rules"),
      { ul: [
        "An extension method lives in a **non-generic, non-nested static class**, and is itself `static`.",
        "Its first parameter is marked `this` and names the type it extends; further parameters are ordinary.",
        "It is found only when its namespace is in scope (`using`); LINQ needs `System.Linq`, which the project imports for you.",
        "It sees only the public members of the value; it cannot reach private fields.",
        "An instance method with the same name and parameters always wins over an extension.",
        "Extensions can target interfaces and generic types: `this IEnumerable<T> xs` extends every sequence."
      ] },
      page("Variations"),
      { h: "Extending a number" },
      run("int", "IsEven and Clamp on int", 'Console.WriteLine(7.IsEven());\nConsole.WriteLine(150.Clamp(0, 100));\nConsole.WriteLine((-5).Clamp(0, 100));\n\nstatic class IntExtensions\n{\n    public static bool IsEven(this int n) => n % 2 == 0;\n    public static int Clamp(this int n, int lo, int hi) => n < lo ? lo : n > hi ? hi : n;\n}'),
      { h: "A generic extension: how LINQ looks inside" },
      run("generic", "WhereNot<T> works on every sequence", 'var nums = new List<int> { 1, 2, 3, 4, 5 };\nConsole.WriteLine(string.Join(" ", nums.WhereNot(n => n % 2 == 0)));\nConsole.WriteLine(string.Join(" ", "banana".WhereNot(c => c == \'a\')));\n\nstatic class SeqExtensions\n{\n    public static List<T> WhereNot<T>(this IEnumerable<T> xs, Func<T, bool> test)\n    {\n        var o = new List<T>();\n        foreach (var x in xs) if (!test(x)) o.Add(x);\n        return o;\n    }\n}'),
      { h: "Called on null" },
      run("null", "an extension can be called on a null value — it is just a static method", 'string? missing = null;\nConsole.WriteLine(missing.OrDash());\nConsole.WriteLine("Ada".OrDash());\n\nstatic class TextExtensions\n{\n    public static string OrDash(this string? s) => string.IsNullOrEmpty(s) ? "—" : s;\n}'),
      page("Pitfalls"),
      { h: "Not in a static class — CS1106" },
      run("pit-static", "the class must be static (and not generic)", 'Console.WriteLine("tools");\n\nclass TextExtensions\n{\n    public static int WordCount(this string s) => s.Split(\' \').Length;\n}'),
      { h: "Forgetting this — CS1061" },
      run("pit-this", "without this it is only an ordinary static method", 'Console.WriteLine("a b".WordCount());\n\nstatic class TextExtensions\n{\n    public static int WordCount(string s) => s.Split(\' \').Length;\n}'),
      { h: "An instance method quietly wins" },
      run("pit-wins", "string already has Contains, so this extension is never called", 'Console.WriteLine("Hello".Contains("h"));\n\nstatic class TextExtensions\n{\n    public static bool Contains(this string s, string part) => s.ToLower().Contains(part.ToLower());\n}'),
      page("Connections"),
      { ul: [ "**Back:** 7.4 static members; 9.2 generic methods; 9.5 map and filter.", "**Next:** 9.8 LINQ is a set of extension methods on `IEnumerable<T>`.", "**AQA:** 4.1.2.3 — extension methods add behaviour without inheritance." ] },
      page("Good practice"),
      { ul: [ "Group extensions by the type they extend: `StringExtensions`, `IntExtensions`.", "Use them for small, obvious helpers; do not hide important logic in them.", "Never give one the name of an existing instance method." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Word tools* and *A median for lists*." ] },
      page("Quick reference"),
      run("qr", "an extension at a glance", 'Console.WriteLine("level".IsPalindrome());\n\nstatic class Ext\n{\n    public static bool IsPalindrome(this string s)\n    {\n        for (int i = 0; i < s.Length / 2; i++) if (s[i] != s[^(i + 1)]) return false;\n        return true;\n    }\n}'),
      { ul: [ "`static class X { public static R M(this T x, …) }`", "Call as `x.M(…)`.", "Instance members win; extensions see only the public parts." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1106", "extension methods need a non-generic static class", "Pitfalls"], ["CS1061", "no such member (the this is missing)", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine(3.Times("ab"));\n\nstatic class E { public static string Times(this int n, string s) { string r = ""; for (int i = 0; i < n; i++) r += s; return r; } }', why: "3 is the this-value; \"ab\" three times.", concepts: ["extension-methods"] },
        { id: "p2", src: 'var xs = new List<int> { 4, 9, 1 };\nConsole.WriteLine(xs.Second());\n\nstatic class E { public static T Second<T>(this List<T> xs) => xs[1]; }', why: "The second item is 9.", concepts: ["extension-methods"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Double can be called as 21.Double().", src: 'Console.WriteLine(21.Double());\n\nstatic class E { public static int Double(@@ n) => n * 2; }', out: "42", concepts: ["extension-methods"] }
      ],
      bug: [
        { id: "b1", q: "Initials of \"grace brewster hopper\" should be GBH.", src: 'Console.WriteLine("grace brewster hopper".Initials());\n\nstatic class E\n{\n    public static string Initials(this string s)\n    {\n        string r = "";\n        foreach (var w in s.Split(\' \')) r += w[^1];\n        return r.ToUpper();\n    }\n}', out: "GBH", fixedText: "prints GBH", why: "w[^1] is the LAST letter; the first is w[0].", concepts: ["extension-methods"] }
      ]
    },
    flashcards: [
      ["What makes a method an extension method?", "static, in a non-generic static class, with `this` on its first parameter."],
      ["How is `s.WordCount()` really compiled?", "`TextExtensions.WordCount(s)`."],
      ["Can an extension reach private fields?", "No — only public members."],
      ["Instance method or extension with the same signature: which wins?", "The instance method."],
      ["What does `this IEnumerable<T> xs` extend?", "Every sequence: lists, arrays, strings, query results."],
      ["What part of .NET is built from extension methods?", "LINQ (Where, Select, OrderBy, …)."]
    ],
    quiz: [
      { q: "Extension methods must be declared in…", opts: ["any class", "a static, non-generic class", "an interface", "the type they extend"], ans: 1, why: "CS1106 otherwise." },
      { q: "`7.IsEven()` with `static bool IsEven(this int n)`…", opts: ["is an error: ints have no methods", "works and returns False", "returns True", "needs new"], ans: 1, why: "The int becomes the this-parameter." },
      { q: "An extension on `string?` called on a null string…", opts: ["always throws", "runs — it is a static call", "is a compile error", "returns null"], ans: 1, why: "Nothing is dereferenced until the method itself does it." }
    ]
  });
  K.add({ tasks: {
    "9.6-words": { lesson: "9.6", title: "Word tools", tier: "warm-up", minutes: 15, concepts: ["extension-methods"],
      statement: ["Write a static class `StringExtensions` with `WordCount(this string s)` and `Initials(this string s)` (the first letter of each word, upper-case).", "Read lines until the end; for each print `N INITIALS` (an empty line of spaces prints `0 -`)."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "grace brewster hopper\nada lovelace", out: "3 GBH\n2 AL" }],
      hidden: [{ stdin: "   \nx", out: "0 -\n1 X" }],
      rules: [uses(/static\s+class\s+StringExtensions/, "Declare static class StringExtensions."), uses(/this\s+string\s+\w+/, "Mark the first parameter with this.", "this"), uses(/\.WordCount\s*\(\s*\)/, "Call it as line.WordCount().", "call")],
      hints: ["public static int WordCount(this string s) => s.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;", "foreach (var w in s.Split(' ', StringSplitOptions.RemoveEmptyEntries)) r += char.ToUpper(w[0]);", "string ini = line.Initials(); Console.WriteLine($\"{line.WordCount()} {(ini == \"\" ? \"-\" : ini)}\");"],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string ini = line.Initials();\n    Console.WriteLine($"{line.WordCount()} {(ini == "" ? "-" : ini)}");\n}\n\nstatic class StringExtensions\n{\n    public static int WordCount(this string s) => s.Split(\' \', StringSplitOptions.RemoveEmptyEntries).Length;\n    public static string Initials(this string s)\n    {\n        string r = "";\n        foreach (var w in s.Split(\' \', StringSplitOptions.RemoveEmptyEntries)) r += char.ToUpper(w[0]);\n        return r;\n    }\n}' },
    "9.6-median": { lesson: "9.6", title: "A median for lists", tier: "core", minutes: 20, concepts: ["extension-methods"],
      statement: ["Write `public static double Median(this List<int> xs)` (it sorts a COPY, so the caller's list keeps its order; an empty list throws InvalidOperationException) and `Range(this List<int> xs)` (largest − smallest).", "Read lines of whole numbers until the end. For each print `median M, range R, first F` (M with 1 decimal, F the first number as read), or `empty`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "5 1 9\n4 2 8 6", out: "median 5.0, range 8, first 5\nmedian 5.0, range 6, first 4" }],
      hidden: [{ stdin: "7", out: "median 7.0, range 0, first 7" }, { stdin: "3 1\n ", out: "median 2.0, range 2, first 3\nempty" }],
      rules: [uses(/double\s+Median\s*\(\s*this\s+List<\s*int\s*>/, "Write double Median(this List<int> xs)."), uses(/\.Median\s*\(\s*\)/, "Call it as xs.Median().", "call")],
      hints: ["var s = new List<int>(xs); s.Sort();", "int m = s.Count / 2; return s.Count % 2 == 1 ? s[m] : (s[m - 1] + s[m]) / 2.0;", "if (xs.Count == 0) throw new InvalidOperationException(); — catch it to print empty."],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    var xs = new List<int>();\n    foreach (var s in line.Split(\' \', StringSplitOptions.RemoveEmptyEntries)) xs.Add(int.Parse(s));\n    try { Console.WriteLine($"median {xs.Median():F1}, range {xs.Range()}, first {xs[0]}"); }\n    catch (InvalidOperationException) { Console.WriteLine("empty"); }\n}\n\nstatic class ListExtensions\n{\n    public static double Median(this List<int> xs)\n    {\n        if (xs.Count == 0) throw new InvalidOperationException("No numbers.");\n        var s = new List<int>(xs);\n        s.Sort();\n        int m = s.Count / 2;\n        return s.Count % 2 == 1 ? s[m] : (s[m - 1] + s[m]) / 2.0;\n    }\n    public static int Range(this List<int> xs)\n    {\n        int lo = xs[0], hi = xs[0];\n        foreach (int x in xs) { if (x < lo) lo = x; if (x > hi) hi = x; }\n        return hi - lo;\n    }\n}' }
  } });

  /* ================================================================
     9.7 Events
     ================================================================ */
  lesson("9.7", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A thermometer should switch on a fan, light a warning and write a log when it gets hot. If it calls all three directly, it must know about fans, lights and logs — and change every time a new listener appears.",
        "An **event** lets an object announce \"this happened\" without knowing who is listening. Listeners **subscribe** with `+=`; the object **raises** the event; every subscriber's method runs.",
        "This is the publisher–subscriber idea behind buttons, timers and notifications."
      ] },
      page("Core idea"),
      run("button", "two subscribers to one event", 'var b = new Button();\nb.Clicked += () => Console.WriteLine("save the file");\nb.Clicked += () => Console.WriteLine("play a click sound");\nb.Press();\n\nclass Button\n{\n    public event Action? Clicked;\n    public void Press() => Clicked?.Invoke();\n}'),
      { ul: [
        "`public event Action? Clicked;` — an event of delegate type Action (9.3), null until someone subscribes.",
        "`b.Clicked += …` subscribes; `-=` unsubscribes.",
        "`Clicked?.Invoke()` raises it: every subscriber runs, in the order they subscribed. The `?.` covers \"nobody listening\"."
      ] },
      run("data", "an event that passes a value", 'var t = new Thermometer(25);\nint warnings = 0;\nt.TooHot += c => Console.WriteLine($"fan on at {c}°C");\nt.TooHot += c => warnings++;\nforeach (int c in new[] { 20, 26, 24, 30 }) t.Read(c);\nConsole.WriteLine($"{warnings} warnings");\n\nclass Thermometer\n{\n    private readonly int limit;\n    public event Action<int>? TooHot;\n    public Thermometer(int limit) => this.limit = limit;\n    public void Read(int celsius)\n    {\n        if (celsius > limit) TooHot?.Invoke(celsius);\n    }\n}'),
      page("Rules"),
      { ul: [
        "An event is declared `public event DelegateType? Name;` inside the class that raises it.",
        "Outside the class you may only `+=` and `-=` it; only the class itself can raise it or read it. That is the difference from a public delegate field.",
        "Subscribers run synchronously, one after another, in subscription order; an exception in one stops the rest.",
        "The .NET convention is `event EventHandler<TArgs>`, whose handlers take `(object? sender, TArgs e)` with `TArgs : EventArgs`.",
        "Raise through a null check: `Name?.Invoke(…)`.",
        "A subscriber keeps the publisher's reference to it alive: unsubscribe when a listener is finished."
      ] },
      page("Variations"),
      { h: "The standard pattern: EventHandler<T>" },
      run("standard", "sender and an EventArgs class", 'var s = new Stock("KOS", 100m);\ns.PriceChanged += (sender, e) => Console.WriteLine($"{((Stock)sender!).Symbol}: {e.Old} → {e.New}");\ns.Price = 104m;\ns.Price = 104m;\ns.Price = 99.5m;\n\nclass PriceChangedEventArgs : EventArgs\n{\n    public decimal Old { get; }\n    public decimal New { get; }\n    public PriceChangedEventArgs(decimal old, decimal @new) { Old = old; New = @new; }\n}\n\nclass Stock\n{\n    private decimal price;\n    public string Symbol { get; }\n    public event EventHandler<PriceChangedEventArgs>? PriceChanged;\n    public Stock(string symbol, decimal price) { Symbol = symbol; this.price = price; }\n    public decimal Price\n    {\n        get => price;\n        set\n        {\n            if (value == price) return;\n            var old = price;\n            price = value;\n            PriceChanged?.Invoke(this, new PriceChangedEventArgs(old, value));\n        }\n    }\n}'),
      { ul: [ "A property setter is a natural place to raise a \"changed\" event — and to stay quiet when nothing changed." ] },
      { h: "Unsubscribing" },
      run("unsub", "-= with the same method removes it", 'var b = new Bell();\nb.Rang += Log;\nb.Ring();\nb.Rang -= Log;\nb.Ring();\nConsole.WriteLine("done");\n\nstatic void Log() => Console.WriteLine("logged a ring");\n\nclass Bell\n{\n    public event Action? Rang;\n    public void Ring() => Rang?.Invoke();\n}'),
      { h: "A score that tells its listeners" },
      run("score", "Game raises ScoreChanged; two different listeners react", 'var g = new Game();\nint best = 0;\ng.ScoreChanged += s => Console.WriteLine($"score {s}");\ng.ScoreChanged += s => { if (s > best) best = s; };\ng.Add(10); g.Add(5); g.Add(-20);\nConsole.WriteLine($"best {best}");\n\nclass Game\n{\n    public int Score { get; private set; }\n    public event Action<int>? ScoreChanged;\n    public void Add(int points)\n    {\n        Score += points;\n        ScoreChanged?.Invoke(Score);\n    }\n}'),
      page("Pitfalls"),
      { h: "Raising an event from outside — CS0070" },
      run("pit-raise", "only Button may raise Clicked", 'var b = new Button();\nb.Clicked?.Invoke();\n\nclass Button { public event Action? Clicked; }'),
      { h: "Raising with no subscribers" },
      run("pit-null", "without ?. an event nobody subscribed to is null", 'var b = new Button();\nb.Press();\n\nclass Button\n{\n    public event Action? Clicked;\n    public void Press() => Clicked!();\n}'),
      { h: "Unsubscribing a lambda does nothing" },
      run("pit-lambda", "-= with a new lambda removes nothing; keep the delegate in a variable", 'var b = new Bell();\nb.Rang += () => Console.WriteLine("ring!");\nb.Rang -= () => Console.WriteLine("ring!");\nb.Ring();\n\nclass Bell\n{\n    public event Action? Rang;\n    public void Ring() => Rang?.Invoke();\n}'),
      page("Connections"),
      { ul: [ "**Back:** 9.3 multicast delegates — an event is one with the raise kept private.", "**Next:** T2 desktop apps are driven by events (clicks, key presses); 11.x async code raises progress events.", "**AQA:** event-driven programming appears in 4.1.2.1 programming paradigms." ] },
      page("Good practice"),
      { ul: [ "Name events for what happened, in the past tense: Clicked, PriceChanged, TooHot.", "Raise with `?.Invoke`; pass what listeners need as arguments.", "Keep a handler in a variable or method if you will need to unsubscribe it." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A heat alarm* and *Watch the price*." ] },
      page("Quick reference"),
      run("qr", "an event at a glance", 'var d = new Door();\nd.Opened += who => Console.WriteLine($"hello, {who}");\nd.Open("Ada");\n\nclass Door\n{\n    public event Action<string>? Opened;\n    public void Open(string who) => Opened?.Invoke(who);\n}'),
      { ul: [ "`public event Action<T>? E;` — declare.", "`x.E += handler;` / `-=` — subscribe.", "`E?.Invoke(value);` — raise, inside the class only." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0070", "an event can only be raised by its own class", "Pitfalls"], ["NullReferenceException", "raised with no subscribers and no ?.", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var c = new Counter();\nc.Hit += n => Console.Write(n + " ");\nc.Add(); c.Add();\nc.Hit += n => Console.Write("! ");\nc.Add();\nConsole.WriteLine();\n\nclass Counter\n{\n    private int n;\n    public event Action<int>? Hit;\n    public void Add() => Hit?.Invoke(++n);\n}', why: "1 and 2 with one subscriber; then 3 and ! with two.", concepts: ["events"] },
        { id: "p2", src: 'var s = new Sensor();\nint calls = 0;\nAction handler = () => calls++;\ns.Changed += handler;\ns.Fire(); s.Fire();\ns.Changed -= handler;\ns.Fire();\nConsole.WriteLine(calls);\n\nclass Sensor { public event Action? Changed; public void Fire() => Changed?.Invoke(); }', why: "Two fires while subscribed; the third after -= reaches nobody.", concepts: ["events"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to subscribe the lambda.", src: 'var b = new Btn();\nb.Clicked @@ () => Console.WriteLine("clicked");\nb.Press();\n\nclass Btn { public event Action? Clicked; public void Press() => Clicked?.Invoke(); }', out: "clicked", concepts: ["events"] }
      ],
      bug: [
        { id: "b1", q: "Both listeners should hear the alarm: it should print `fan` then `light`.", src: 'var a = new Alarm();\na.Raised += () => Console.WriteLine("fan");\na.Raised = () => Console.WriteLine("light");\na.Sound();\n\nclass Alarm\n{\n    public Action? Raised;\n    public void Sound() => Raised?.Invoke();\n}', out: "fan\nlight", fixedText: "prints fan then light", why: "A public delegate field can be overwritten with =. Make it `public event Action? Raised;` and subscribe both with +=.", concepts: ["events"] }
      ]
    },
    flashcards: [
      ["What is an event?", "A way for an object to announce that something happened to any number of subscribers."],
      ["How do you subscribe and unsubscribe?", "`+=` and `-=`."],
      ["Who can raise an event?", "Only the class that declares it."],
      ["Why raise with `?.Invoke`?", "With no subscribers the event is null."],
      ["What is the standard .NET event shape?", "`EventHandler<TArgs>`: (object? sender, TArgs e) with TArgs : EventArgs."],
      ["Why does `-=` with a fresh lambda not unsubscribe?", "It is a different delegate; keep the original in a variable."]
    ],
    quiz: [
      { q: "From outside the class, an event allows…", opts: ["+= and -= only", "= and Invoke", "anything a field allows", "reading the subscribers"], ans: 0, why: "The event keyword hides raising and replacing." },
      { q: "With three subscribers, raising an event runs…", opts: ["the first", "the last", "all three in subscription order", "a random one"], ans: 2, why: "Every subscriber, in order." },
      { q: "A good event name is…", opts: ["DoClick", "Clicked", "click_handler", "OnEventFire"], ans: 1, why: "What happened, in the past tense." }
    ]
  });
  K.add({ tasks: {
    "9.7-alarm": { lesson: "9.7", title: "A heat alarm", tier: "core", minutes: 20, concepts: ["events"],
      statement: ["Write `Thermometer` with a limit and `public event Action<int>? TooHot`, raised by `Read(int c)` whenever c is ABOVE the limit.", "Subscribe two handlers: one prints `fan on at C`, the other counts the warnings and remembers the highest. Read the limit, then readings one per line until the end. Finally print `W warnings, peak P` (or `no warnings`)."],
      starter: 'int limit = int.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "25\n20\n26\n24\n30", out: "fan on at 26\nfan on at 30\n2 warnings, peak 30" }],
      hidden: [{ stdin: "30\n30\n10", out: "no warnings" }, { stdin: "0\n1", out: "fan on at 1\n1 warnings, peak 1" }],
      rules: [uses(/event\s+Action<\s*int\s*>\?\s+TooHot/, "Declare event Action<int>? TooHot."), uses(/TooHot\s*\+=[\s\S]*TooHot\s*\+=/, "Subscribe two handlers.", "two"), uses(/TooHot\?\.Invoke/, "Raise it with TooHot?.Invoke.", "raise")],
      hints: ["class Thermometer { private readonly int limit; public event Action<int>? TooHot; public Thermometer(int l) => limit = l; public void Read(int c) { if (c > limit) TooHot?.Invoke(c); } }", "t.TooHot += c => Console.WriteLine($\"fan on at {c}\");", "int count = 0, peak = 0; t.TooHot += c => { count++; peak = Math.Max(peak, c); };"],
      answer: 'int limit = int.Parse(Console.ReadLine() ?? "0");\nvar t = new Thermometer(limit);\nint count = 0, peak = int.MinValue;\nt.TooHot += c => Console.WriteLine($"fan on at {c}");\nt.TooHot += c => { count++; peak = Math.Max(peak, c); };\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n    t.Read(int.Parse(line));\nConsole.WriteLine(count == 0 ? "no warnings" : $"{count} warnings, peak {peak}");\n\nclass Thermometer\n{\n    private readonly int limit;\n    public event Action<int>? TooHot;\n    public Thermometer(int limit) => this.limit = limit;\n    public void Read(int celsius)\n    {\n        if (celsius > limit) TooHot?.Invoke(celsius);\n    }\n}' },
    "9.7-stock": { lesson: "9.7", title: "Watch the price", tier: "stretch", minutes: 25, concepts: ["events"],
      statement: ["Write `Stock` with a `Price` property whose setter raises `event EventHandler<PriceChangedEventArgs>? PriceChanged` only when the price actually changes; `PriceChangedEventArgs : EventArgs` carries `Old` and `New`.", "Subscribe a **big-move** watcher that prints `move OLD -> NEW` when the change is 10% or more of the old price, and a **history** watcher that counts changes.", "Read the starting price, then new prices one per line until the end. Finally print `C changes`."],
      starter: 'decimal start = decimal.Parse(Console.ReadLine() ?? "1");\n',
      examples: [{ stdin: "100\n105\n105\n90\n91", out: "move 105 -> 90\n3 changes" }],
      hidden: [{ stdin: "50\n55\n49.5", out: "move 50 -> 55\nmove 55 -> 49.5\n2 changes" }, { stdin: "10\n10", out: "0 changes" }],
      rules: [uses(/class\s+PriceChangedEventArgs\s*:\s*EventArgs/, "PriceChangedEventArgs derives from EventArgs."), uses(/event\s+EventHandler<\s*PriceChangedEventArgs\s*>\?\s+PriceChanged/, "Declare the event with EventHandler<PriceChangedEventArgs>.", "event")],
      hints: ["set { if (value == price) return; var old = price; price = value; PriceChanged?.Invoke(this, new PriceChangedEventArgs(old, value)); }", "s.PriceChanged += (_, e) => { if (Math.Abs(e.New - e.Old) >= e.Old * 0.1m) Console.WriteLine($\"move {e.Old} -> {e.New}\"); };", "int changes = 0; s.PriceChanged += (_, _) => changes++;"],
      answer: 'decimal start = decimal.Parse(Console.ReadLine() ?? "1");\nvar s = new Stock(start);\nint changes = 0;\ns.PriceChanged += (_, e) =>\n{\n    if (Math.Abs(e.New - e.Old) >= e.Old * 0.1m) Console.WriteLine($"move {e.Old} -> {e.New}");\n};\ns.PriceChanged += (_, _) => changes++;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n    s.Price = decimal.Parse(line);\nConsole.WriteLine($"{changes} changes");\n\nclass PriceChangedEventArgs : EventArgs\n{\n    public decimal Old { get; }\n    public decimal New { get; }\n    public PriceChangedEventArgs(decimal old, decimal @new) { Old = old; New = @new; }\n}\n\nclass Stock\n{\n    private decimal price;\n    public event EventHandler<PriceChangedEventArgs>? PriceChanged;\n    public Stock(decimal price) => this.price = price;\n    public decimal Price\n    {\n        get => price;\n        set\n        {\n            if (value == price) return;\n            var old = price;\n            price = value;\n            PriceChanged?.Invoke(this, new PriceChangedEventArgs(old, value));\n        }\n    }\n}' }
  } });

  /* ================================================================
     9.8 LINQ: Where, Select and OrderBy
     ================================================================ */
  lesson("9.8", {
    aqa: "4.12.3.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "\"The names of students who passed, best first\" took a loop, an if, a new list, a sort with a lambda and another loop.",
        "**LINQ** (Language Integrated Query) is a set of extension methods (9.6) on every sequence — map, filter and sort as one readable chain.",
        "The same chain works on arrays, lists, dictionaries, strings, files' lines and (in T1) databases."
      ] },
      page("Core idea"),
      run("chain", "filter, sort, project in one statement", 'var students = new List<Student>\n{\n    new("Ada", 91), new("Kai", 47), new("Lin", 74), new("Sam", 58), new("Bo", 74)\n};\nvar passed = students\n    .Where(s => s.Score >= 50)\n    .OrderByDescending(s => s.Score)\n    .ThenBy(s => s.Name)\n    .Select(s => $"{s.Name} {s.Score}");\nforeach (var line in passed) Console.WriteLine(line);\n\nrecord Student(string Name, int Score);'),
      { ul: [
        "`Where(test)` keeps items (filter); `Select(f)` transforms them (map).",
        "`OrderBy(key)` / `OrderByDescending(key)` sort by a key; `ThenBy` breaks ties.",
        "Each step returns a new sequence (`IEnumerable<T>`); the original list is untouched."
      ] },
      run("query", "the same query in query syntax", 'var students = new List<Student> { new("Ada", 91), new("Kai", 47), new("Lin", 74) };\nvar names = from s in students\n            where s.Score >= 50\n            orderby s.Name\n            select s.Name.ToUpper();\nConsole.WriteLine(string.Join(", ", names));\n\nrecord Student(string Name, int Score);'),
      page("Rules"),
      { table: { head: ["Method", "Does", "Gives"], rows: [
        ["`Where(x => test)`", "filter", "a sequence"],
        ["`Select(x => value)`", "map", "a sequence"],
        ["`OrderBy`, `OrderByDescending`, `ThenBy`", "sort by keys (stable)", "an ordered sequence"],
        ["`Distinct()`, `Take(n)`, `Skip(n)`", "unique items, the first n, all but n", "a sequence"],
        ["`Count()`, `Any(test)`, `All(test)`, `Contains(x)`", "ask about the items", "a number or bool"],
        ["`First()`, `FirstOrDefault()`, `Last()`, `Single()`", "pick one", "an item"],
        ["`ToList()`, `ToArray()`", "copy into a collection", "a list or array"]
      ] } },
      { ul: [
        "LINQ methods are extension methods on `IEnumerable<T>`, so they work on anything foreach can walk.",
        "Query syntax (`from … where … select`) is translated into the same method calls.",
        "A query's result is a sequence, not a list: index it only after `ToList()` (or use `ElementAt`)."
      ] },
      page("Variations"),
      { h: "Asking questions" },
      run("ask", "Any, All, Count, First and Contains", 'int[] marks = { 45, 72, 90, 38, 66 };\nConsole.WriteLine(marks.Any(m => m < 40));\nConsole.WriteLine(marks.All(m => m >= 30));\nConsole.WriteLine(marks.Count(m => m >= 50));\nConsole.WriteLine(marks.First(m => m > 70));\nConsole.WriteLine(marks.FirstOrDefault(m => m > 100));\nConsole.WriteLine(marks.Contains(90));'),
      { h: "Distinct, Take and Skip" },
      run("page", "a page of unique results", 'var words = "the cat and the dog and the bird".Split(\' \');\nvar unique = words.Distinct().OrderBy(w => w).ToList();\nConsole.WriteLine(string.Join(" ", unique));\nConsole.WriteLine(string.Join(" ", unique.Skip(2).Take(2)));'),
      { h: "Select with an index, and anonymous types" },
      run("anon", "new { … } builds a quick, unnamed record", 'var names = new[] { "Ada", "Kai", "Lin" };\nvar rows = names.Select((n, i) => new { Place = i + 1, Name = n, Long = n.Length > 2 });\nforeach (var r in rows) Console.WriteLine($"{r.Place}. {r.Name} {r.Long}");'),
      page("Pitfalls"),
      { h: "First on nothing — InvalidOperationException" },
      run("pit-first", "no mark is over 100; use FirstOrDefault or Any", 'int[] marks = { 45, 72 };\nConsole.WriteLine(marks.First(m => m > 100));'),
      { h: "Indexing a query — CS0021" },
      run("pit-index", "Where gives a sequence, not a list", 'int[] marks = { 45, 72, 90 };\nvar high = marks.Where(m => m > 50);\nConsole.WriteLine(high[0]);'),
      { h: "OrderBy twice" },
      run("pit-orderby", "the second OrderBy throws the first order away: use ThenBy", 'var xs = new[] { ("b", 1), ("a", 2), ("a", 1) };\nvar wrong = xs.OrderBy(x => x.Item1).OrderBy(x => x.Item2);\nConsole.WriteLine(string.Join(" ", wrong.Select(x => x.Item1 + x.Item2)));'),
      page("Connections"),
      { ul: [ "**Back:** 9.5 map and filter; 9.6 extension methods; 9.4 lambdas.", "**Next:** 9.9 grouping and totals; 9.10 when a query really runs; T1 the same queries against a database.", "**AQA:** 4.12.3.1 list processing; 4.3.x SQL's SELECT … WHERE … ORDER BY has the same shape." ] },
      page("Good practice"),
      { ul: [ "One step per line in a chain, so each reads as a sentence.", "Filter before sorting or projecting: less work.", "FirstOrDefault or Any when the result may be empty." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Even and unique* and *Top three*." ] },
      page("Quick reference"),
      run("qr", "LINQ at a glance", 'var xs = new[] { 5, 3, 8, 1, 8 };\nConsole.WriteLine(string.Join(" ", xs.Where(x => x > 2).Distinct().OrderBy(x => x).Select(x => x * 10)));'),
      { ul: [ "`Where` filter · `Select` map · `OrderBy`/`ThenBy` sort.", "`Any` `All` `Count` `First(OrDefault)` `Contains`.", "`ToList()` before indexing or reusing." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["InvalidOperationException", "First found nothing", "Pitfalls"], ["CS0021", "a sequence cannot be indexed", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var xs = new[] { 4, 7, 1, 8, 3 };\nConsole.WriteLine(string.Join(",", xs.Where(x => x % 2 == 1).OrderBy(x => x)));', why: "The odd numbers 7, 1, 3, sorted.", concepts: ["linq-basics"] },
        { id: "p2", src: 'var ws = new[] { "kiwi", "fig", "banana" };\nConsole.WriteLine(ws.OrderByDescending(w => w.Length).First() + " " + ws.Count(w => w.Contains(\'i\')));', why: "The longest is banana; kiwi and fig contain i.", concepts: ["linq-basics"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to keep only the numbers above 10.", src: 'var xs = new[] { 4, 12, 30, 9 };\nConsole.WriteLine(string.Join(" ", xs.@@));', out: "12 30", concepts: ["linq-basics"] }
      ],
      bug: [
        { id: "b1", q: "Sort by score (highest first), ties by name: it should print Ada Lin Bo.", src: 'var s = new[] { ("Lin", 74), ("Bo", 50), ("Ada", 74) };\nvar order = s.OrderByDescending(x => x.Item2).OrderBy(x => x.Item1);\nConsole.WriteLine(string.Join(" ", order.Select(x => x.Item1)));', out: "Ada Lin Bo", fixedText: "prints Ada Lin Bo", why: "The second OrderBy re-sorts everything by name; use ThenBy for the tie-break.", concepts: ["linq-basics"] }
      ]
    },
    flashcards: [
      ["What is LINQ?", "Extension methods on sequences for filtering, mapping, sorting, grouping and aggregating."],
      ["Where or Select to keep some items?", "Where (filter). Select transforms (map)."],
      ["How do you break a tie after OrderBy?", "ThenBy (not a second OrderBy)."],
      ["First or FirstOrDefault when nothing may match?", "FirstOrDefault (or check Any first)."],
      ["Why can't you write `query[0]`?", "A query is an IEnumerable, not a list; ToList() first."],
      ["What does Distinct do?", "Removes duplicates, keeping first appearances."]
    ],
    quiz: [
      { q: "`new[] {1,2,3,4}.Where(x => x > 2).Select(x => x * x)` gives…", opts: ["1 4", "9 16", "3 4", "4 9 16"], ans: 1, why: "Keep 3, 4; square them." },
      { q: "`marks.All(m => m >= 40)` returns…", opts: ["the marks over 40", "true if every mark is at least 40", "the count", "the first such mark"], ans: 1, why: "All asks a yes/no question of every item." },
      { q: "Query syntax `from s in xs where … select …` is…", opts: ["slower", "translated into Where and Select calls", "only for databases", "a different language"], ans: 1, why: "The compiler rewrites it to method calls." }
    ]
  });
  K.add({ tasks: {
    "9.8-even": { lesson: "9.8", title: "Even and unique", tier: "warm-up", minutes: 10, concepts: ["linq-basics"],
      statement: ["Read whole numbers on one line. With one LINQ chain print the distinct even numbers in ascending order, separated by spaces — or `none`.", "Then print `any over 100: True/False` using Any."],
      starter: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n',
      examples: [{ stdin: "8 3 4 8 120 4", out: "4 8 120\nany over 100: True" }],
      hidden: [{ stdin: "1 3 5", out: "none\nany over 100: False" }, { stdin: "", out: "none\nany over 100: False" }],
      rules: [uses(/\.Where\s*\(/, "Filter with Where."), uses(/\.Distinct\s*\(\s*\)/, "Remove duplicates with Distinct.", "distinct"), uses(/\.OrderBy\s*\(/, "Sort with OrderBy.", "order"), uses(/\.Any\s*\(/, "Ask with Any.", "any")],
      hints: ["var evens = xs.Where(x => x % 2 == 0).Distinct().OrderBy(x => x).ToList();", "Console.WriteLine(evens.Count == 0 ? \"none\" : string.Join(\" \", evens));", "Console.WriteLine($\"any over 100: {xs.Any(x => x > 100)}\");"],
      answer: 'int[] xs = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\nvar evens = xs.Where(x => x % 2 == 0).Distinct().OrderBy(x => x).ToList();\nConsole.WriteLine(evens.Count == 0 ? "none" : string.Join(" ", evens));\nConsole.WriteLine($"any over 100: {xs.Any(x => x > 100)}");' },
    "9.8-top": { lesson: "9.8", title: "Top three", tier: "core", minutes: 15, concepts: ["linq-basics"],
      statement: ["Read lines `NAME SCORE` until the end into a `List` of a record.", "With LINQ print the top three — highest score first, ties alphabetical (ordinal) — as `1. NAME SCORE`, then `passed P of N` (score ≥ 50) and the average of all scores with 1 decimal (`average -` for none)."],
      starter: 'var people = new List<Entry>();\n\nrecord Entry(string Name, int Score);',
      examples: [{ stdin: "Kai 47\nAda 91\nLin 74\nBo 74\nSam 58", out: "1. Ada 91\n2. Bo 74\n3. Lin 74\npassed 4 of 5\naverage 68.8" }],
      hidden: [{ stdin: "Zed 10", out: "1. Zed 10\npassed 0 of 1\naverage 10.0" }, { stdin: "", out: "passed 0 of 0\naverage -" }],
      rules: [uses(/OrderByDescending\s*\(/, "Sort with OrderByDescending."), uses(/\.ThenBy\s*\(/, "Break ties with ThenBy.", "then"), uses(/\.Take\s*\(\s*3\s*\)/, "Take(3).", "take")],
      hints: ["var top = people.OrderByDescending(p => p.Score).ThenBy(p => p.Name, StringComparer.Ordinal).Take(3).ToList();", "people.Count(p => p.Score >= 50)", "people.Count == 0 ? \"-\" : people.Average(p => p.Score).ToString(\"F1\")"],
      answer: 'var people = new List<Entry>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    people.Add(new Entry(p[0], int.Parse(p[1])));\n}\nvar top = people.OrderByDescending(p => p.Score).ThenBy(p => p.Name, StringComparer.Ordinal).Take(3).ToList();\nfor (int i = 0; i < top.Count; i++) Console.WriteLine($"{i + 1}. {top[i].Name} {top[i].Score}");\nConsole.WriteLine($"passed {people.Count(p => p.Score >= 50)} of {people.Count}");\nConsole.WriteLine("average " + (people.Count == 0 ? "-" : people.Average(p => p.Score).ToString("F1")));\n\nrecord Entry(string Name, int Score);' }
  } });

  /* ================================================================
     9.9 LINQ: GroupBy, ToDictionary and aggregates
     ================================================================ */
  lesson("9.9", {
    aqa: "4.12.3.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "\"How many pupils in each form, and their average?\" meant a dictionary of lists, a loop to fill it and another to summarise it.",
        "`GroupBy` splits a sequence into groups that share a key; each group is itself a sequence you can count, sum or average.",
        "Aggregates (`Sum`, `Average`, `Min`, `Max`, `Aggregate`) fold a sequence to one value, and `ToDictionary` turns a sequence into a lookup table."
      ] },
      page("Core idea"),
      run("group", "pupils grouped by form, with a summary of each", 'var pupils = new List<Pupil>\n{\n    new("Ada", "12A", 91), new("Kai", "12B", 47), new("Lin", "12A", 74),\n    new("Sam", "12B", 58), new("Bo", "12A", 66)\n};\nvar forms = pupils.GroupBy(p => p.Form).OrderBy(g => g.Key);\nforeach (var g in forms)\n    Console.WriteLine($"{g.Key}: {g.Count()} pupils, average {g.Average(p => p.Score):F1}, best {g.MaxBy(p => p.Score)!.Name}");\n\nrecord Pupil(string Name, string Form, int Score);'),
      { ul: [
        "`GroupBy(p => p.Form)` — one group per distinct form, in order of first appearance.",
        "Each group `g` has a `Key` (the form) and is a sequence of its pupils.",
        "`g.Count()`, `g.Average(…)`, `g.MaxBy(…)` summarise one group at a time."
      ] },
      run("aggregates", "the aggregates on one list", 'int[] xs = { 4, 9, 1, 7 };\nConsole.WriteLine($"{xs.Sum()} {xs.Min()} {xs.Max()} {xs.Average()}");\nConsole.WriteLine(xs.Aggregate((a, b) => a * b));\nConsole.WriteLine(xs.Aggregate("", (acc, x) => acc + x));\nvar words = new[] { "kiwi", "banana", "fig" };\nConsole.WriteLine($"{words.Sum(w => w.Length)} {words.MinBy(w => w.Length)} {words.Max(w => w.Length)}");'),
      page("Rules"),
      { table: { head: ["Method", "Gives"], rows: [
        ["`GroupBy(key)`", "groups, each with `.Key` and its items"],
        ["`Count()`, `Sum(f)`, `Average(f)`, `Min(f)`, `Max(f)`", "one number"],
        ["`MinBy(key)`, `MaxBy(key)`", "the item with the smallest or largest key"],
        ["`Aggregate(seed, f)`", "fold (9.5) to any value"],
        ["`ToDictionary(key, value)`", "a Dictionary; keys must be unique"],
        ["`ToLookup(key)`", "a read-only multi-map: one key → many items"],
        ["`SelectMany(f)`", "flattens a sequence of sequences"],
        ["`Join(other, k1, k2, result)`", "pairs items whose keys match"]
      ] } },
      { ul: [
        "Groups appear in the order their key first appears; sort them with `OrderBy(g => g.Key)`.",
        "`Average`, `Min` and `Max` throw on an empty sequence (of a value type); `Sum` and `Count` give 0.",
        "`ToDictionary` throws on a duplicate key; use `GroupBy` first, or `ToLookup`."
      ] },
      page("Variations"),
      { h: "ToDictionary and ToLookup" },
      run("dict", "a name → score table, and a form → pupils lookup", 'var pupils = new[] { new Pupil("Ada", "12A", 91), new Pupil("Kai", "12B", 47), new Pupil("Lin", "12A", 74) };\nvar score = pupils.ToDictionary(p => p.Name, p => p.Score);\nConsole.WriteLine(score["Lin"]);\nvar byForm = pupils.ToLookup(p => p.Form, p => p.Name);\nConsole.WriteLine(string.Join(", ", byForm["12A"]));\nConsole.WriteLine(byForm["13C"].Count());\n\nrecord Pupil(string Name, string Form, int Score);'),
      { h: "Query syntax: group … by … into" },
      run("query", "the same grouping, written as a query", 'var words = new[] { "apple", "avocado", "banana", "blueberry", "cherry", "apricot" };\nvar byLetter = from w in words\n               group w by w[0] into g\n               orderby g.Count() descending, g.Key\n               select $"{g.Key}: {string.Join(" ", g)}";\nforeach (var line in byLetter) Console.WriteLine(line);'),
      { h: "SelectMany and Join" },
      run("join", "flatten orders' lines, then match them to prices", 'var orders = new[] { new Order(1, new[] { "tea", "cake" }), new Order(2, new[] { "tea" }) };\nvar prices = new[] { new Price("tea", 1.50m), new Price("cake", 2.25m) };\nvar lines = orders.SelectMany(o => o.Items, (o, item) => new { o.Id, Item = item });\nvar priced = lines.Join(prices, l => l.Item, p => p.Item, (l, p) => new { l.Id, l.Item, p.Cost });\nforeach (var x in priced) Console.WriteLine($"order {x.Id}: {x.Item} {x.Cost:F2}");\nConsole.WriteLine($"total {priced.Sum(x => x.Cost):F2}");\n\nrecord Order(int Id, string[] Items);\nrecord Price(string Item, decimal Cost);'),
      page("Pitfalls"),
      { h: "A group has a Key, not the property — CS1061" },
      run("pit-key", "g is a group of pupils; its key is g.Key", 'var pupils = new[] { new Pupil("Ada", "12A") };\nforeach (var g in pupils.GroupBy(p => p.Form)) Console.WriteLine(g.Form);\n\nrecord Pupil(string Name, string Form);'),
      { h: "A duplicate key in ToDictionary" },
      run("pit-dup", "two pupils called Ada", 'var pupils = new[] { ("Ada", 91), ("Ada", 60) };\nvar d = pupils.ToDictionary(p => p.Item1, p => p.Item2);'),
      { h: "Average of nothing" },
      run("pit-empty", "no scores above 100, so nothing to average", 'int[] xs = { 40, 60 };\nConsole.WriteLine(xs.Where(x => x > 100).Average());'),
      page("Connections"),
      { ul: [ "**Back:** 9.5 fold; 9.8 Where, Select and OrderBy; 5.x dictionaries.", "**Next:** 9.12 builds a whole report from these; T1's SQL has GROUP BY, COUNT and AVG doing the same.", "**AQA:** 4.12.3.1 list processing; 4.3.x SQL aggregate functions." ] },
      page("Good practice"),
      { ul: [ "Group, then summarise each group in a Select — one place for each column.", "Sort groups by key (or by a summary) explicitly; never rely on first-appearance order.", "Guard aggregates that can meet an empty sequence." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Form summary* and *Word frequencies*." ] },
      page("Quick reference"),
      run("qr", "grouping at a glance", 'var xs = new[] { "a1", "b2", "a3" };\nforeach (var g in xs.GroupBy(x => x[0]).OrderBy(g => g.Key))\n    Console.WriteLine($"{g.Key} {g.Count()} {g.Sum(x => x[1] - \'0\')}");'),
      { ul: [ "`GroupBy(k)` → `g.Key`, `g.Count()`, `g.Sum(…)`.", "`ToDictionary(k, v)` unique keys; `ToLookup(k)` many.", "`Sum Average Min Max MinBy MaxBy Aggregate`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1061", "a group has Key, not the item's properties", "Pitfalls"], ["ArgumentException", "a duplicate dictionary key", "Pitfalls"], ["InvalidOperationException", "an aggregate of nothing", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var ws = new[] { "cat", "cow", "dog", "duck", "cod" };\nforeach (var g in ws.GroupBy(w => w[0])) Console.Write($"{g.Key}{g.Count()} ");\nConsole.WriteLine();', why: "Groups in first-appearance order: c (cat, cow, cod), d (dog, duck).", concepts: ["linq-group"] },
        { id: "p2", src: 'int[] xs = { 3, 8, 2, 8 };\nConsole.WriteLine($"{xs.Sum()} {xs.Max()} {xs.Distinct().Count()} {xs.Average()}");', why: "Sum 21, max 8, three distinct values, average 5.25.", concepts: ["linq-group"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to print each group's key.", src: 'var xs = new[] { 1, 2, 3, 4 };\nforeach (var g in xs.GroupBy(x => x % 2 == 0 ? "even" : "odd")) Console.Write(g.@@ + " ");\nConsole.WriteLine();', out: "odd even", concepts: ["linq-group"] }
      ],
      bug: [
        { id: "b1", q: "It should print each form's TOTAL score: 12A 231, then 12B 105.", src: 'var p = new[] { ("12A", 91), ("12B", 47), ("12A", 74), ("12B", 58), ("12A", 66) };\nforeach (var g in p.GroupBy(x => x.Item1).OrderBy(g => g.Key))\n    Console.WriteLine($"{g.Key} {g.Count()}");', out: "12A 231\n12B 105", fixedText: "prints 12A 231 then 12B 105", why: "Count gives how many; the total is g.Sum(x => x.Item2).", concepts: ["linq-group"] }
      ]
    },
    flashcards: [
      ["What does GroupBy return?", "Groups; each has a Key and is a sequence of its items."],
      ["Which aggregates throw on an empty sequence?", "Average, Min and Max (of value types); Sum and Count give 0."],
      ["ToDictionary or ToLookup with repeated keys?", "ToLookup — ToDictionary throws on duplicates."],
      ["What does MaxBy return?", "The item with the largest key, not the key."],
      ["What does SelectMany do?", "Flattens a sequence of sequences into one."],
      ["In what order do GroupBy's groups come?", "The order each key first appears; sort them if order matters."]
    ],
    quiz: [
      { q: "`new[] {1,2,3,4,5}.GroupBy(x => x % 2).Count()` is…", opts: ["5", "2", "3", "1"], ans: 1, why: "Two keys: 1 and 0." },
      { q: "`words.MaxBy(w => w.Length)` gives…", opts: ["the longest length", "the longest word", "a list", "a bool"], ans: 1, why: "The item, chosen by its key." },
      { q: "SQL's `GROUP BY form` with `AVG(score)` is LINQ's…", opts: ["Where then Select", "GroupBy then Average per group", "OrderBy", "Join"], ans: 1, why: "Same idea, different syntax." }
    ]
  });
  K.add({ tasks: {
    "9.9-forms": { lesson: "9.9", title: "Form summary", tier: "core", minutes: 20, concepts: ["linq-group"],
      statement: ["Read lines `NAME FORM SCORE` until the end into records.", "With GroupBy print one line per form, in form order: `FORM: N pupils, average A, top NAME` (A with 1 decimal; top = the highest score, the earlier line on a tie). Then `best form FORM` — the form with the highest average (`none` with no pupils)."],
      starter: 'var pupils = new List<Pupil>();\n\nrecord Pupil(string Name, string Form, int Score);',
      examples: [{ stdin: "Ada 12A 91\nKai 12B 47\nLin 12A 74\nSam 12B 58\nBo 12A 66", out: "12A: 3 pupils, average 77.0, top Ada\n12B: 2 pupils, average 52.5, top Sam\nbest form 12A" }],
      hidden: [{ stdin: "", out: "best form none" }, { stdin: "Zed 13C 10\nAl 13B 90\nCy 13B 90", out: "13B: 2 pupils, average 90.0, top Al\n13C: 1 pupils, average 10.0, top Zed\nbest form 13B" }],
      rules: [uses(/\.GroupBy\s*\(/, "Group with GroupBy."), uses(/\.Average\s*\(/, "Average each group.", "avg")],
      hints: ["var forms = pupils.GroupBy(p => p.Form).OrderBy(g => g.Key, StringComparer.Ordinal).ToList();", "g.MaxBy(p => p.Score)!.Name — MaxBy keeps the first on a tie.", "var best = forms.MaxBy(g => g.Average(p => p.Score)); Console.WriteLine($\"best form {best?.Key ?? \"none\"}\");"],
      answer: 'var pupils = new List<Pupil>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    pupils.Add(new Pupil(p[0], p[1], int.Parse(p[2])));\n}\nvar forms = pupils.GroupBy(p => p.Form).OrderBy(g => g.Key, StringComparer.Ordinal).ToList();\nforeach (var g in forms)\n    Console.WriteLine($"{g.Key}: {g.Count()} pupils, average {g.Average(p => p.Score):F1}, top {g.MaxBy(p => p.Score)!.Name}");\nvar best = forms.MaxBy(g => g.Average(p => p.Score));\nConsole.WriteLine($"best form {best?.Key ?? "none"}");\n\nrecord Pupil(string Name, string Form, int Score);' },
    "9.9-freq": { lesson: "9.9", title: "Word frequencies", tier: "stretch", minutes: 25, concepts: ["linq-group", "linq-basics"],
      statement: ["Read text until the end. Words are runs of letters (split on everything else), compared in lower case.", "Print the three most common words as `WORD N` (most first, ties alphabetical), then `distinct D, total T`."],
      starter: 'string text = "";\nstring? line;\nwhile ((line = Console.ReadLine()) is not null) text += line + "\\n";\n',
      examples: [{ stdin: "The cat and the dog.\nThe END, and the cat!", out: "the 4\nand 2\ncat 2\ndistinct 5, total 10" }],
      hidden: [{ stdin: "", out: "distinct 0, total 0" }, { stdin: "b a b-a c", out: "a 2\nb 2\nc 1\ndistinct 3, total 5" }],
      rules: [uses(/\.GroupBy\s*\(/, "Count with GroupBy."), uses(/\.Take\s*\(\s*3\s*\)/, "Take(3).", "take")],
      hints: ["var words = new string(text.Select(c => char.IsLetter(c) ? char.ToLower(c) : ' ').ToArray()).Split(' ', StringSplitOptions.RemoveEmptyEntries);", "words.GroupBy(w => w).Select(g => (Word: g.Key, N: g.Count())).OrderByDescending(x => x.N).ThenBy(x => x.Word, StringComparer.Ordinal)", "$\"distinct {words.Distinct().Count()}, total {words.Length}\""],
      answer: 'string text = "";\nstring? line;\nwhile ((line = Console.ReadLine()) is not null) text += line + "\\n";\nvar words = new string(text.Select(c => char.IsLetter(c) ? char.ToLower(c) : \' \').ToArray())\n    .Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nvar top = words.GroupBy(w => w)\n    .Select(g => (Word: g.Key, N: g.Count()))\n    .OrderByDescending(x => x.N)\n    .ThenBy(x => x.Word, StringComparer.Ordinal)\n    .Take(3);\nforeach (var (word, n) in top) Console.WriteLine($"{word} {n}");\nConsole.WriteLine($"distinct {words.Distinct().Count()}, total {words.Length}");' }
  } });

  /* ================================================================
     9.10 Deferred execution
     ================================================================ */
  lesson("9.10", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A query is written on one line and used ten lines later. In between, the list it reads may change. Which version does it see?",
        "Most LINQ methods do not run when called: they build a **recipe**. The work happens each time something **enumerates** it — a foreach, ToList, Count. This is **deferred execution**.",
        "It makes LINQ efficient and able to handle endless sequences — and surprises anyone who expects a snapshot."
      ] },
      page("Core idea"),
      run("live", "the query sees an item added after it was written", 'var nums = new List<int> { 1, 5, 12 };\nvar big = nums.Where(n => n > 4);\nnums.Add(30);\nConsole.WriteLine(string.Join(" ", big));\nvar frozen = big.ToList();\nnums.Add(99);\nConsole.WriteLine(string.Join(" ", big));\nConsole.WriteLine(string.Join(" ", frozen));'),
      { ul: [
        "`big` is not a list of numbers; it is \"the numbers in nums over 4, worked out when asked\".",
        "When it is printed, 30 is already in nums, so it is included.",
        "`ToList()` runs the query **now** and stores the answer: `frozen` never changes again."
      ] },
      run("count", "a counter shows the query running once per enumeration", 'int checks = 0;\nvar nums = new[] { 3, 8, 1, 9 };\nvar q = nums.Where(n => { checks++; return n > 2; });\nConsole.WriteLine($"after writing it: {checks}");\nint a = q.Count();\nint b = q.Count();\nConsole.WriteLine($"after two Counts: {checks}");\nvar list = q.ToList();\nint c = list.Count + list.Count;\nConsole.WriteLine($"after ToList and two uses: {checks}");'),
      page("Rules"),
      { table: { head: ["Deferred (build a recipe)", "Immediate (run now)"], rows: [
        ["Where, Select, OrderBy, ThenBy", "ToList, ToArray, ToDictionary"],
        ["Take, Skip, Distinct, GroupBy", "Count, Sum, Average, Min, Max"],
        ["SelectMany, Join, Concat", "First, Last, Single, Any, All, Contains"],
        ["your own `yield` methods (9.11)", "foreach over the query"]
      ] } },
      { ul: [
        "A deferred query re-reads its source every time it is enumerated, so it sees changes, and repeats its work.",
        "Lambdas in it see captured variables as they are when it runs (9.4).",
        "Streaming operators (Where, Select, Take) handle one item at a time; `First` stops as soon as it finds one.",
        "OrderBy and GroupBy must read everything before giving the first result.",
        "Call `ToList()` once when you need a snapshot or will enumerate many times."
      ] },
      page("Variations"),
      { h: "First stops early" },
      run("early", "only as many items as needed are tested", 'int checks = 0;\nvar nums = Enumerable.Range(1, 1000);\nint first = nums.Where(n => { checks++; return n % 7 == 0; }).First();\nConsole.WriteLine($"{first} after {checks} checks");'),
      { h: "An endless source, made finite by Take" },
      run("endless", "a billion candidates, three tested answers", 'var firstSquares = Enumerable.Range(1, 1_000_000_000).Select(n => n * n).Where(s => s % 3 == 1).Take(4);\nConsole.WriteLine(string.Join(" ", firstSquares));'),
      { h: "Captured variables are read at run time" },
      run("captured", "the limit is read when the query runs, not when it is written", 'int limit = 10;\nvar marks = new[] { 5, 12, 20 };\nvar over = marks.Where(m => m > limit);\nlimit = 15;\nConsole.WriteLine(string.Join(" ", over));'),
      page("Pitfalls"),
      { h: "Changing the list while the query walks it" },
      run("pit-modify", "the list changed during enumeration", 'var xs = new List<int> { 1, 2, 3 };\nforeach (var x in xs.Where(x => x > 1)) xs.Add(x * 10);'),
      { h: "Count without brackets — CS0428" },
      run("pit-count", "on a query, Count is a method", 'var q = new[] { 1, 2 }.Where(x => x > 0);\nint n = q.Count;'),
      { h: "Expensive work repeated" },
      run("pit-repeat", "each foreach re-runs the whole pipeline", 'int runs = 0;\nvar q = new[] { 1, 2, 3 }.Select(x => { runs++; return x * x; });\nforeach (var a in q) { }\nforeach (var b in q) { }\nConsole.WriteLine($"{runs} selector calls for 3 items");'),
      page("Connections"),
      { ul: [ "**Back:** 9.4 closures; 9.8 queries.", "**Next:** 9.11 writes your own deferred sequences with yield; T1 database queries are deferred too — they run when enumerated, on the server.", "**AQA:** lazy evaluation is a property of functional languages (4.12)." ] },
      page("Good practice"),
      { ul: [ "Know which operators are deferred; snapshot with ToList when it matters.", "Do not put side effects (printing, counting) in query lambdas, except to learn — as here.", "Enumerate an expensive query once; store the result." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Live or frozen?* and *Search lazily*." ] },
      page("Quick reference"),
      run("qr", "deferred at a glance", 'var src = new List<string> { "a" };\nvar q = src.Select(s => s.ToUpper());\nvar snap = q.ToList();\nsrc.Add("b");\nConsole.WriteLine($"{q.Count()} {snap.Count}");'),
      { ul: [ "Where/Select/OrderBy… build; foreach/ToList/Count… run.", "Re-enumerating re-runs; ToList snapshots.", "Captured variables are read at run time." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["InvalidOperationException", "the collection changed while being enumerated", "Pitfalls"], ["CS0428", "a method used as a value (missing ())", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var xs = new List<int> { 1, 2 };\nvar q = xs.Select(x => x * 10);\nxs.Add(3);\nvar l = q.ToList();\nxs.Add(4);\nConsole.WriteLine($"{q.Count()} {l.Count}");', why: "q re-reads xs (4 items); l was frozen at 3.", concepts: ["deferred"] },
        { id: "p2", src: 'int n = 0;\nvar q = Enumerable.Range(1, 100).Where(x => { n++; return x > 3; });\nvar f = q.First();\nConsole.WriteLine($"{f} {n}");', why: "First stops at 4, after testing 1, 2, 3, 4.", concepts: ["deferred"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so `snap` keeps the answer as it is now.", src: 'var xs = new List<int> { 5 };\nvar snap = xs.Where(x => x > 0).@@;\nxs.Add(9);\nConsole.WriteLine(snap.Count);', out: "1", concepts: ["deferred"] }
      ],
      bug: [
        { id: "b1", q: "It should report how many scores were over 50 BEFORE the late ones were added: 1.", src: 'var scores = new List<int> { 40, 70 };\nvar passed = scores.Where(s => s > 50);\nscores.AddRange(new[] { 80, 90 });\nConsole.WriteLine(passed.Count());', out: "1", fixedText: "prints 1", why: "The query runs at Count(), after the AddRange. Snapshot it first: .Where(…).ToList().", concepts: ["deferred"] }
      ]
    },
    flashcards: [
      ["What is deferred execution?", "A query runs when it is enumerated, not when it is written."],
      ["Name three deferred LINQ methods.", "Where, Select, OrderBy (also Take, Skip, GroupBy…)."],
      ["Name three that run immediately.", "ToList, Count, First (also Sum, Any, ToArray…)."],
      ["How do you snapshot a query?", "ToList() or ToArray()."],
      ["Why can `First()` on a huge range be fast?", "Streaming operators stop as soon as one result is found."],
      ["What happens if the source list changes while a query is enumerated?", "InvalidOperationException."]
    ],
    quiz: [
      { q: "`var q = xs.Where(…); xs.Add(…); q.Count()` counts…", opts: ["the list as it was", "the list including the new item", "nothing", "an error"], ans: 1, why: "The query reads xs when Count runs." },
      { q: "Which runs immediately?", opts: ["Select", "Where", "OrderBy", "Sum"], ans: 3, why: "Sum needs every value now." },
      { q: "A query enumerated three times runs its lambdas…", opts: ["once", "three times over", "never", "only the first time"], ans: 1, why: "Every enumeration repeats the work." }
    ]
  });
  K.add({ tasks: {
    "9.10-live": { lesson: "9.10", title: "Live or frozen?", tier: "core", minutes: 15, concepts: ["deferred"],
      statement: ["Read a threshold, then a line of numbers into a `List<int>`.", "Define `big` = the numbers above the threshold (a deferred Where) and `frozen = big.ToList()`. Then read a second line of numbers and add them to the list.", "Print `live L` (big's count now) and `frozen F`, then the live items joined by spaces (or `none`)."],
      starter: 'int t = int.Parse(Console.ReadLine() ?? "0");\nvar nums = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();\n',
      examples: [{ stdin: "10\n5 20\n30 1", out: "live 2\nfrozen 1\n20 30" }],
      hidden: [{ stdin: "0\n\n-1", out: "live 0\nfrozen 0\nnone" }, { stdin: "5\n6 7\n8", out: "live 3\nfrozen 2\n6 7 8" }],
      rules: [uses(/\.Where\s*\(/, "Define big with Where."), uses(/\.ToList\s*\(\s*\)/, "Freeze it with ToList().", "tolist")],
      hints: ["var big = nums.Where(n => n > t);", "var frozen = big.ToList();", "nums.AddRange(…second line…); Console.WriteLine($\"live {big.Count()}\");"],
      answer: 'int t = int.Parse(Console.ReadLine() ?? "0");\nvar nums = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();\nvar big = nums.Where(n => n > t);\nvar frozen = big.ToList();\nnums.AddRange((Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse));\nConsole.WriteLine($"live {big.Count()}");\nConsole.WriteLine($"frozen {frozen.Count}");\nConsole.WriteLine(big.Any() ? string.Join(" ", big) : "none");' },
    "9.10-lazy": { lesson: "9.10", title: "Search lazily", tier: "stretch", minutes: 20, concepts: ["deferred"],
      statement: ["Read a target T, then numbers one per line until the end into a list.", "Find the first number greater than T with a deferred `Where` whose lambda counts how many numbers it looked at, and `FirstOrDefault`. Print `found N after C checks`, or `none after C checks`."],
      starter: 'int target = int.Parse(Console.ReadLine() ?? "0");\nvar nums = new List<int>();\n',
      examples: [{ stdin: "50\n10\n70\n90\n20", out: "found 70 after 2 checks" }],
      hidden: [{ stdin: "100\n1\n2", out: "none after 2 checks" }, { stdin: "0\n5", out: "found 5 after 1 checks" }],
      rules: [uses(/\.Where\s*\(/, "Search with Where."), uses(/\.FirstOrDefault\s*\(/, "Take the first with FirstOrDefault.", "first"), uses(/\+\+/, "Count the checks inside the lambda.", "count")],
      hints: ["int checks = 0;", "var hit = nums.Where(n => { checks++; return n > target; }).Select(n => (int?)n).FirstOrDefault();", "Console.WriteLine(hit is int h ? $\"found {h} after {checks} checks\" : $\"none after {checks} checks\");"],
      answer: 'int target = int.Parse(Console.ReadLine() ?? "0");\nvar nums = new List<int>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "") nums.Add(int.Parse(line));\nint checks = 0;\nint? hit = nums.Where(n => { checks++; return n > target; }).Select(n => (int?)n).FirstOrDefault();\nConsole.WriteLine(hit is int h ? $"found {h} after {checks} checks" : $"none after {checks} checks");' }
  } });

  /* ================================================================
     9.11 IEnumerable and yield
     ================================================================ */
  lesson("9.11", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "To hand out \"the even numbers up to 20\" a method built a whole list and returned it — even if the caller wanted only the first three, and impossible for \"all of them, forever\".",
        "Everything foreach can walk is an `IEnumerable<T>`: something that can hand out items one at a time.",
        "An **iterator** method uses `yield return` to produce items **on demand**: it pauses after each one and resumes when the next is asked for. This is how LINQ's deferred operators work inside."
      ] },
      page("Core idea"),
      run("evens", "yield return hands out one item at a time", 'foreach (int n in Evens(10)) Console.Write(n + " ");\nConsole.WriteLine();\nConsole.WriteLine(Evens(1000).Take(3).Sum());\n\nstatic IEnumerable<int> Evens(int max)\n{\n    for (int i = 0; i <= max; i += 2)\n        yield return i;\n}'),
      { ul: [
        "The return type is `IEnumerable<int>`; the body has `yield return` instead of building a list.",
        "Calling `Evens(10)` runs **none** of the body. The loop runs as the caller asks for items.",
        "`Take(3)` asks for three, so the loop runs three times — not 501."
      ] },
      run("lazy", "the iterator and its caller take turns", 'foreach (var x in Numbers())\n    Console.WriteLine($"  caller got {x}");\n\nstatic IEnumerable<int> Numbers()\n{\n    Console.WriteLine("start");\n    yield return 1;\n    Console.WriteLine("after 1");\n    yield return 2;\n    Console.WriteLine("end");\n}'),
      page("Rules"),
      { ul: [
        "An iterator returns `IEnumerable<T>` (or `IEnumerator<T>`) and contains `yield return`.",
        "Each `yield return x;` hands x to the caller and pauses; the next request resumes on the following line, with every local variable as it was.",
        "`yield break;` ends the sequence early.",
        "An iterator may not also `return value;`, and may not take `ref` or `out` parameters.",
        "The body runs afresh each time the sequence is enumerated (like a deferred query, 9.10).",
        "A class becomes foreach-able by implementing `IEnumerable<T>`; its `GetEnumerator` can simply be an iterator."
      ] },
      page("Variations"),
      { h: "An endless sequence" },
      run("endless", "Naturals never ends; Take and TakeWhile stop it", 'Console.WriteLine(string.Join(" ", Naturals().Take(5)));\nConsole.WriteLine(string.Join(" ", Naturals().Select(n => n * n).TakeWhile(s => s < 50)));\n\nstatic IEnumerable<int> Naturals()\n{\n    int n = 1;\n    while (true) yield return n++;\n}'),
      { h: "Fibonacci" },
      run("fib", "state kept between items", 'Console.WriteLine(string.Join(", ", Fib().Take(10)));\nConsole.WriteLine(Fib().First(f => f > 1000));\n\nstatic IEnumerable<long> Fib()\n{\n    long a = 0, b = 1;\n    while (true)\n    {\n        yield return a;\n        (a, b) = (b, a + b);\n    }\n}'),
      { h: "yield break" },
      run("break", "stop at the first blank line", 'var lines = new[] { "milk", "eggs", "", "ignored" };\nforeach (var l in UntilBlank(lines)) Console.WriteLine(l);\n\nstatic IEnumerable<string> UntilBlank(IEnumerable<string> xs)\n{\n    foreach (var x in xs)\n    {\n        if (x == "") yield break;\n        yield return x;\n    }\n}'),
      { h: "Your own collection in foreach" },
      run("collection", "Playlist implements IEnumerable<string> with an iterator", 'var p = new Playlist();\np.Add("Intro");\np.Add("Theme");\nforeach (var song in p) Console.WriteLine(song);\nConsole.WriteLine(p.Count());\n\nclass Playlist : IEnumerable<string>\n{\n    private readonly List<string> songs = new();\n    public void Add(string s) => songs.Add(s);\n    public IEnumerator<string> GetEnumerator()\n    {\n        for (int i = 0; i < songs.Count; i++) yield return $"{i + 1}. {songs[i]}";\n    }\n    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();\n}'),
      page("Pitfalls"),
      { h: "return with a value inside an iterator — CS1622" },
      run("pit-return", "an iterator yields; it cannot also return a list", 'foreach (var x in Odds()) Console.WriteLine(x);\n\nstatic IEnumerable<int> Odds()\n{\n    yield return 1;\n    return new List<int> { 3 };\n}'),
      { h: "ref parameters — CS1623" },
      run("pit-ref", "an iterator pauses, so it cannot hold the caller's variable", 'int count = 0;\nforeach (var x in Count(ref count)) { }\n\nstatic IEnumerable<int> Count(ref int n)\n{\n    yield return n++;\n}'),
      { h: "Side effects run every time" },
      run("pit-twice", "enumerating twice runs the body twice", 'var xs = Noisy();\nConsole.WriteLine(xs.Count());\nConsole.WriteLine(xs.Count());\n\nstatic IEnumerable<int> Noisy()\n{\n    Console.WriteLine("(working)");\n    yield return 1;\n    yield return 2;\n}'),
      page("Connections"),
      { ul: [ "**Back:** 9.10 deferred execution; 8.4 interfaces — IEnumerable<T> is the one behind foreach.", "**Next:** D1 iterators in depth; 11.x async streams (`IAsyncEnumerable`) use the same idea; 12.11 tree walks are natural iterators.", "**AQA:** lazy evaluation and infinite lists in functional programming (4.12)." ] },
      page("Good practice"),
      { ul: [ "Return `IEnumerable<T>` from a method that produces items one at a time; a list when the caller needs counting and indexing.", "Keep iterators free of surprising side effects.", "Bound an endless sequence with Take or TakeWhile before ToList or Count." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A stepping range* and *Even Fibonacci*." ] },
      page("Quick reference"),
      run("qr", "an iterator at a glance", 'foreach (var c in Countdown(3)) Console.Write(c + " ");\nConsole.WriteLine();\n\nstatic IEnumerable<string> Countdown(int from)\n{\n    for (int i = from; i > 0; i--) yield return i.ToString();\n    yield return "go!";\n}'),
      { ul: [ "`IEnumerable<T> M() { … yield return x; … }`", "`yield break;` to stop.", "Runs lazily and afresh on each enumeration." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1622", "an iterator cannot return a value", "Pitfalls"], ["CS1623", "an iterator cannot have ref or out parameters", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Console.WriteLine(string.Join(",", Odd().Skip(2).Take(3)));\n\nstatic IEnumerable<int> Odd() { for (int i = 1; ; i += 2) yield return i; }', why: "Odd numbers 1, 3, 5, 7, 9, …; skip two, take three.", concepts: ["yield"] },
        { id: "p2", src: 'foreach (var s in Letters()) Console.Write(s);\nConsole.WriteLine();\n\nstatic IEnumerable<char> Letters()\n{\n    yield return \'a\';\n    if (DateTime.MinValue.Year == 1) yield break;\n    yield return \'b\';\n}', why: "yield break stops after a; DateTime.MinValue's year is 1.", concepts: ["yield"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the method produces 1, 2, 3.", src: 'Console.WriteLine(string.Join(" ", Three()));\n\nstatic IEnumerable<int> Three()\n{\n    for (int i = 1; i <= 3; i++) @@ i;\n}', out: "1 2 3", concepts: ["yield"] }
      ],
      bug: [
        { id: "b1", q: "Squares should go on forever, so Take(4) gives 1 4 9 16.", src: 'Console.WriteLine(string.Join(" ", Squares().Take(4)));\n\nstatic IEnumerable<int> Squares()\n{\n    int n = 1;\n    while (n < 3) { yield return n * n; n++; }\n}', out: "1 4 9 16", fixedText: "prints 1 4 9 16", why: "The loop stops after n = 2; an endless sequence uses while (true) and lets Take stop it.", concepts: ["yield"] }
      ]
    },
    flashcards: [
      ["What does `yield return x;` do?", "Hands x to the caller and pauses the method until the next item is asked for."],
      ["When does an iterator's body start running?", "When the sequence is first enumerated, not when the method is called."],
      ["How does an iterator end early?", "`yield break;`"],
      ["Why is an endless iterator safe?", "Items are produced on demand; Take or TakeWhile stops asking."],
      ["What makes a class usable in foreach?", "Implementing IEnumerable<T> (GetEnumerator), often with yield."],
      ["Can an iterator have a ref parameter?", "No (CS1623)."]
    ],
    quiz: [
      { q: "`Naturals().Take(3)` with an endless Naturals…", opts: ["never finishes", "gives 1 2 3", "throws", "gives an empty sequence"], ans: 1, why: "Only three items are ever requested." },
      { q: "An iterator enumerated twice runs its body…", opts: ["once", "twice", "never", "only if it has yield break"], ans: 1, why: "Each enumeration starts it afresh." },
      { q: "Which return type can an iterator have?", opts: ["List<T>", "IEnumerable<T>", "T[]", "void"], ans: 1, why: "IEnumerable<T> or IEnumerator<T>." }
    ]
  });
  K.add({ tasks: {
    "9.11-range": { lesson: "9.11", title: "A stepping range", tier: "warm-up", minutes: 10, concepts: ["yield"],
      statement: ["Write an iterator `static IEnumerable<int> Steps(int from, int to, int step)` that yields from, from + step, … while not past `to` (step may be negative; a step of 0 yields nothing).", "Read `FROM TO STEP` and print the items separated by spaces (or `empty`)."],
      starter: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\n',
      examples: [{ stdin: "1 10 3", out: "1 4 7 10" }],
      hidden: [{ stdin: "10 0 -4", out: "10 6 2" }, { stdin: "5 1 1", out: "empty" }, { stdin: "1 5 0", out: "empty" }],
      rules: [uses(/IEnumerable<\s*int\s*>\s+Steps\s*\(/, "Write IEnumerable<int> Steps(…)."), uses(/yield\s+return/, "Use yield return.", "yield")],
      hints: ["if (step == 0) yield break;", "for (int i = from; step > 0 ? i <= to : i >= to; i += step) yield return i;", "var xs = Steps(…).ToList(); Console.WriteLine(xs.Count == 0 ? \"empty\" : string.Join(\" \", xs));"],
      answer: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\nvar xs = Steps(int.Parse(p[0]), int.Parse(p[1]), int.Parse(p[2])).ToList();\nConsole.WriteLine(xs.Count == 0 ? "empty" : string.Join(" ", xs));\n\nstatic IEnumerable<int> Steps(int from, int to, int step)\n{\n    if (step == 0) yield break;\n    for (int i = from; step > 0 ? i <= to : i >= to; i += step)\n        yield return i;\n}' },
    "9.11-fib": { lesson: "9.11", title: "Even Fibonacci", tier: "core", minutes: 15, concepts: ["yield", "deferred"],
      statement: ["Write an endless iterator `static IEnumerable<long> Fib()` (0, 1, 1, 2, 3, 5, …).", "Read n and a limit L. Print the first n EVEN Fibonacci numbers on one line, then the sum of all Fibonacci numbers below L — both with LINQ over Fib()."],
      starter: 'int n = int.Parse(Console.ReadLine() ?? "0");\nlong limit = long.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "4\n10", out: "0 2 8 34\n20" }],
      hidden: [{ stdin: "1\n1", out: "0\n0" }, { stdin: "6\n100", out: "0 2 8 34 144 610\n232" }],
      rules: [uses(/IEnumerable<\s*long\s*>\s+Fib\s*\(/, "Write IEnumerable<long> Fib()."), uses(/while\s*\(\s*true\s*\)/, "Make it endless: while (true).", "endless"), uses(/TakeWhile\s*\(/, "Stop the sum with TakeWhile.", "tw")],
      hints: ["long a = 0, b = 1; while (true) { yield return a; (a, b) = (b, a + b); }", "string.Join(\" \", Fib().Where(f => f % 2 == 0).Take(n))", "Fib().TakeWhile(f => f < limit).Sum()"],
      answer: 'int n = int.Parse(Console.ReadLine() ?? "0");\nlong limit = long.Parse(Console.ReadLine() ?? "0");\nConsole.WriteLine(string.Join(" ", Fib().Where(f => f % 2 == 0).Take(n)));\nConsole.WriteLine(Fib().TakeWhile(f => f < limit).Sum());\n\nstatic IEnumerable<long> Fib()\n{\n    long a = 0, b = 1;\n    while (true)\n    {\n        yield return a;\n        (a, b) = (b, a + b);\n    }\n}' }
  } });

  /* ================================================================
     9.12 Practise: a report generator
     ================================================================ */
  lesson("9.12", {
    aqa: "4.12.3.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A café's till exports one line per sale: `region,product,qty,price`. The owner wants a report: totals, the best region, the top products, a tidy table.",
        "This is LINQ's home ground: **parse** the raw lines into records, **filter** the bad ones, **group** and **aggregate**, **sort**, **format**.",
        "Built in five steps, each a listing you can run, using everything from this unit."
      ] },
      page("Core idea"),
      { h: "Step 1 · parse lines into records" },
      run("parse", "TryParse keeps bad lines out of the data", 'string[] raw = { "North,tea,3,1.50", "South,cake,2,2.25", "North,cake,x,2.25", "East,tea,5,1.50", "South,tea,1,1.50" };\nvar sales = raw.Select(Sale.TryRead).OfType<Sale>().ToList();\nConsole.WriteLine($"{sales.Count} good of {raw.Length}");\nforeach (var s in sales) Console.WriteLine(s);\n\nrecord Sale(string Region, string Product, int Qty, decimal Price)\n{\n    public decimal Total => Qty * Price;\n    public static Sale? TryRead(string line)\n    {\n        string[] p = line.Split(\',\');\n        if (p.Length != 4 || !int.TryParse(p[2], out int q) || !decimal.TryParse(p[3], out decimal pr)) return null;\n        return new Sale(p[0], p[1], q, pr);\n    }\n}'),
      { ul: [
        "`Sale.TryRead` returns null for a bad line; `OfType<Sale>()` keeps only real Sales (and drops the nulls).",
        "`Total` is computed, so it can never disagree with Qty and Price."
      ] },
      { h: "Step 2 · headline figures" },
      run("totals", "Sum, Count and Average over the clean data", 'var sales = new List<Sale> { new("North", "tea", 3, 1.50m), new("South", "cake", 2, 2.25m), new("East", "tea", 5, 1.50m), new("South", "tea", 1, 1.50m) };\nConsole.WriteLine($"orders  {sales.Count}");\nConsole.WriteLine($"items   {sales.Sum(s => s.Qty)}");\nConsole.WriteLine($"revenue {sales.Sum(s => s.Total):F2}");\nConsole.WriteLine($"average {sales.Average(s => s.Total):F2}");\n\nrecord Sale(string Region, string Product, int Qty, decimal Price) { public decimal Total => Qty * Price; }'),
      page("Rules"),
      { ul: [
        "**Parse once, at the edge**: turn text into typed records first; every later step works on records.",
        "**Refuse bad data visibly**: count what was dropped and say so in the report.",
        "**One query per question**: totals, by region, top products — each a short chain.",
        "**Format last**: compute with numbers, turn them into text only when printing (`:F2`, padding).",
        "**Sort explicitly**: say the order every list is in, with a tie-break."
      ] },
      { table: { head: ["Report line", "LINQ"], rows: [["revenue", "`Sum(s => s.Total)`"], ["by region", "`GroupBy(s => s.Region)` + `Sum`"], ["best region", "`MaxBy(g => g.Sum(…))`"], ["top products", "`GroupBy(Product)` · `OrderByDescending` · `Take(n)`"], ["bad lines", "`raw.Length - sales.Count`"]] } },
      page("Variations"),
      { h: "Step 3 · by region" },
      run("regions", "grouped, summed and sorted by revenue", 'var sales = new List<Sale> { new("North", "tea", 3, 1.50m), new("South", "cake", 2, 2.25m), new("East", "tea", 5, 1.50m), new("South", "tea", 1, 1.50m) };\nvar regions = sales.GroupBy(s => s.Region)\n    .Select(g => new { Region = g.Key, Revenue = g.Sum(s => s.Total), Orders = g.Count() })\n    .OrderByDescending(r => r.Revenue).ThenBy(r => r.Region);\nforeach (var r in regions) Console.WriteLine($"{r.Region,-6} {r.Revenue,7:F2}  ({r.Orders})");\n\nrecord Sale(string Region, string Product, int Qty, decimal Price) { public decimal Total => Qty * Price; }'),
      { h: "Step 4 · top products" },
      run("top", "the best sellers by revenue", 'var sales = new List<Sale> { new("North", "tea", 3, 1.50m), new("South", "cake", 2, 2.25m), new("East", "tea", 5, 1.50m), new("South", "scone", 1, 3.00m) };\nvar top = sales.GroupBy(s => s.Product)\n    .Select(g => (Product: g.Key, Qty: g.Sum(s => s.Qty), Revenue: g.Sum(s => s.Total)))\n    .OrderByDescending(p => p.Revenue).ThenBy(p => p.Product)\n    .Take(2);\nforeach (var (product, qty, revenue) in top) Console.WriteLine($"{product}: {qty} sold, {revenue:F2}");\n\nrecord Sale(string Region, string Product, int Qty, decimal Price) { public decimal Total => Qty * Price; }'),
      { h: "Step 5 · the whole report" },
      run("report", "parse, summarise, print", 'string[] raw = { "North,tea,3,1.50", "South,cake,2,2.25", "bad line", "East,tea,5,1.50", "South,tea,1,1.50" };\nvar sales = raw.Select(Sale.TryRead).OfType<Sale>().ToList();\nConsole.WriteLine("=== Sales report ===");\nConsole.WriteLine($"{sales.Count} sales, {raw.Length - sales.Count} rejected, revenue {sales.Sum(s => s.Total):F2}");\nforeach (var g in sales.GroupBy(s => s.Region).OrderBy(g => g.Key))\n    Console.WriteLine($"  {g.Key,-6}{g.Sum(s => s.Total),8:F2}");\nvar best = sales.GroupBy(s => s.Product).MaxBy(g => g.Sum(s => s.Qty));\nConsole.WriteLine($"best seller: {best?.Key}");\n\nrecord Sale(string Region, string Product, int Qty, decimal Price)\n{\n    public decimal Total => Qty * Price;\n    public static Sale? TryRead(string line)\n    {\n        string[] p = line.Split(\',\');\n        if (p.Length != 4 || !int.TryParse(p[2], out int q) || !decimal.TryParse(p[3], out decimal pr)) return null;\n        return new Sale(p[0], p[1], q, pr);\n    }\n}'),
      page("Pitfalls"),
      { h: "Parse instead of TryParse — FormatException" },
      run("pit-parse", "one bad line stops the whole report", 'string[] raw = { "North,tea,3,1.50", "North,cake,x,2.25" };\nint items = raw.Sum(l => int.Parse(l.Split(\',\')[2]));\nConsole.WriteLine(items);'),
      { h: "Summing text — CS0029" },
      run("pit-sum", "Sum needs numbers", 'var names = new[] { "tea", "cake" };\nConsole.WriteLine(names.Sum(n => n));'),
      { h: "An anonymous type's name is not its variable's" },
      "In `Select(g => new { g.Key, Total = … })` the property is `Key`, not Region — name it: `new { Region = g.Key, … }` so the rest of the query reads clearly.",
      page("Connections"),
      { ul: [ "**Back:** the whole of unit 9; 6.x files and CSV parsing; 8.7 records.", "**Next:** 11.1–11.2 read the same data from real files and JSON; capstone 3's shop reports are this lesson at full size; T1 does it in SQL.", "**AQA:** 4.12.3.1 list processing; NEA projects often need exactly this kind of summary." ] },
      page("Good practice"),
      { ul: [ "Records in, text out: keep parsing and printing at the edges.", "Name every computed column.", "Report rejected lines instead of hiding them." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *The sales report* and *A marks report*." ] },
      page("Quick reference"),
      run("qr", "the pipeline in miniature", 'var rows = new[] { "a,2", "b,5", "a,1", "oops" };\nvar data = rows.Select(r => r.Split(\',\')).Where(p => p.Length == 2 && int.TryParse(p[1], out _)).Select(p => (Key: p[0], N: int.Parse(p[1])));\nforeach (var g in data.GroupBy(d => d.Key).OrderBy(g => g.Key)) Console.WriteLine($"{g.Key} {g.Sum(d => d.N)}");'),
      { ul: [ "Parse → filter → group → aggregate → sort → format.", "`OfType<T>()` drops nulls from TryRead.", "`{value,width:F2}` lines up columns." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["FormatException", "text that is not a number", "Pitfalls"], ["CS0029", "the lambda gives text where Sum needs a number", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var rows = new[] { ("N", 3), ("S", 2), ("N", 4) };\nvar best = rows.GroupBy(r => r.Item1).OrderByDescending(g => g.Sum(r => r.Item2)).First();\nConsole.WriteLine($"{best.Key} {best.Sum(r => r.Item2)}");', why: "N totals 7, S 2.", concepts: ["linq-report"] },
        { id: "p2", src: 'string[] raw = { "1", "x", "3", "" };\nvar ok = raw.Where(s => int.TryParse(s, out _)).Select(int.Parse).ToList();\nConsole.WriteLine($"{ok.Count} {ok.Sum()} {raw.Length - ok.Count}");', why: "Two good lines (1 and 3), two rejected.", concepts: ["linq-report"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to drop the nulls from the parsed list.", src: 'string?[] raw = { "a", null, "b" };\nvar ok = raw.@@.ToList();\nConsole.WriteLine(ok.Count);', out: "2", concepts: ["linq-report"] }
      ],
      bug: [
        { id: "b1", q: "Revenue is quantity × price: it should print 9.75.", src: 'var sales = new[] { (Qty: 3, Price: 1.50m), (Qty: 2, Price: 2.625m) };\nConsole.WriteLine(sales.Sum(s => s.Price).ToString("F2"));', out: "9.75", fixedText: "prints 9.75", why: "It summed the prices; multiply first: Sum(s => s.Qty * s.Price).", concepts: ["linq-report"] }
      ]
    },
    flashcards: [
      ["What are the stages of a LINQ report?", "Parse → filter → group → aggregate → sort → format."],
      ["Why parse into records first?", "Every later step works with typed, named values instead of text."],
      ["How do you keep bad lines out without crashing?", "TryParse in a TryRead that returns null, then OfType<T>()."],
      ["How do you line up a column?", "Padding in the format: `{value,8:F2}` (right) or `{name,-6}` (left)."],
      ["Best region by revenue in LINQ?", "`sales.GroupBy(s => s.Region).MaxBy(g => g.Sum(s => s.Total))`."],
      ["Why say how many lines were rejected?", "So the report's reader knows the totals are incomplete."]
    ],
    quiz: [
      { q: "`OfType<Sale>()` on a sequence of `Sale?`…", opts: ["throws on null", "keeps only the non-null Sales", "converts nulls to empty Sales", "sorts"], ans: 1, why: "null is not a Sale, so it is filtered out." },
      { q: "`{x,8:F2}` prints x…", opts: ["left-aligned in 8 characters", "right-aligned in 8 characters with 2 decimals", "with 8 decimals", "as a percentage"], ans: 1, why: "Width 8 (positive = right-aligned), format F2." },
      { q: "Which belongs at the very end of the pipeline?", opts: ["parsing", "formatting as text", "grouping", "filtering"], ans: 1, why: "Compute with numbers; format last." }
    ]
  });
  K.add({ tasks: {
    "9.12-sales": { lesson: "9.12", title: "The sales report", tier: "core", minutes: 30, concepts: ["linq-report", "linq-group"],
      statement: ["Read lines `region,product,qty,price` until the end; skip any line that does not parse (four fields, whole qty, decimal price).", "Print `sales S, rejected R`, then one line per region in alphabetical order `REGION £TOTAL (N)` (2 decimals, N sales), then `top PRODUCT £REVENUE` — the product with the most revenue (ties alphabetical) — or `top none`."],
      starter: 'var lines = new List<string>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "") lines.Add(line);\n',
      examples: [{ stdin: "North,tea,3,1.50\nSouth,cake,2,2.25\nNorth,cake,x,2.25\nEast,tea,5,1.50\nSouth,tea,1,1.50", out: "sales 4, rejected 1\nEast £7.50 (1)\nNorth £4.50 (1)\nSouth £6.00 (2)\ntop tea £13.50" }],
      hidden: [{ stdin: "oops", out: "sales 0, rejected 1\ntop none" }, { stdin: "West,bun,2,1.00\nWest,pie,1,2.00", out: "sales 2, rejected 0\nWest £4.00 (2)\ntop bun £2.00" }],
      rules: [uses(/\.GroupBy\s*\(/, "Group with GroupBy."), uses(/TryParse/, "Use TryParse to reject bad lines.", "try"), noUse(/\b(?:int|decimal)\.Parse\s*\(/, "Parse with TryParse only.", "noparse")],
      hints: ["record Sale(string Region, string Product, int Qty, decimal Price) { public decimal Total => Qty * Price; }", "var sales = lines.Select(TryRead).OfType<Sale>().ToList();", "var top = sales.GroupBy(s => s.Product).Select(g => (P: g.Key, R: g.Sum(s => s.Total))).OrderByDescending(x => x.R).ThenBy(x => x.P, StringComparer.Ordinal).FirstOrDefault();"],
      answer: 'var lines = new List<string>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "") lines.Add(line);\nvar sales = lines.Select(TryRead).OfType<Sale>().ToList();\nConsole.WriteLine($"sales {sales.Count}, rejected {lines.Count - sales.Count}");\nforeach (var g in sales.GroupBy(s => s.Region).OrderBy(g => g.Key, StringComparer.Ordinal))\n    Console.WriteLine($"{g.Key} £{g.Sum(s => s.Total):F2} ({g.Count()})");\nvar top = sales.GroupBy(s => s.Product)\n    .Select(g => (Product: g.Key, Revenue: g.Sum(s => s.Total)))\n    .OrderByDescending(x => x.Revenue).ThenBy(x => x.Product, StringComparer.Ordinal)\n    .ToList();\nConsole.WriteLine(top.Count == 0 ? "top none" : $"top {top[0].Product} £{top[0].Revenue:F2}");\n\nstatic Sale? TryRead(string line)\n{\n    string[] p = line.Split(\',\');\n    if (p.Length != 4 || !int.TryParse(p[2], out int q) || !decimal.TryParse(p[3], out decimal pr)) return null;\n    return new Sale(p[0], p[1], q, pr);\n}\n\nrecord Sale(string Region, string Product, int Qty, decimal Price)\n{\n    public decimal Total => Qty * Price;\n}' },
    "9.12-marks": { lesson: "9.12", title: "A marks report", tier: "stretch", minutes: 30, concepts: ["linq-report", "linq-group"],
      statement: ["Read lines `NAME SUBJECT MARK` (mark 0–100) until the end.", "Print one line per subject in alphabetical order: `SUBJECT: average A, pass rate P%` (A with 1 decimal, P the whole-number percentage of marks ≥ 40, rounded down). Then `top student NAME AVG` — the highest average over all their marks (1 decimal; ties alphabetical) — or `no data`."],
      starter: 'var rows = new List<(string Name, string Subject, int Mark)>();\n',
      examples: [{ stdin: "Ada maths 90\nAda cs 80\nKai maths 35\nKai cs 70\nLin maths 60", out: "cs: average 75.0, pass rate 100%\nmaths: average 61.7, pass rate 66%\ntop student Ada 85.0" }],
      hidden: [{ stdin: "", out: "no data" }, { stdin: "Bo art 39\nAl art 41", out: "art: average 40.0, pass rate 50%\ntop student Al 41.0" }],
      rules: [uses(/\.GroupBy\s*\(/, "Group with GroupBy."), uses(/\.Average\s*\(/, "Average with Average.", "avg")],
      hints: ["foreach (var g in rows.GroupBy(r => r.Subject).OrderBy(g => g.Key, StringComparer.Ordinal))", "int rate = g.Count(r => r.Mark >= 40) * 100 / g.Count();", "rows.GroupBy(r => r.Name).Select(g => (Name: g.Key, Avg: g.Average(r => r.Mark))).OrderByDescending(x => x.Avg).ThenBy(x => x.Name, StringComparer.Ordinal).First()"],
      answer: 'var rows = new List<(string Name, string Subject, int Mark)>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    rows.Add((p[0], p[1], int.Parse(p[2])));\n}\nif (rows.Count == 0) { Console.WriteLine("no data"); return; }\nforeach (var g in rows.GroupBy(r => r.Subject).OrderBy(g => g.Key, StringComparer.Ordinal))\n{\n    int rate = g.Count(r => r.Mark >= 40) * 100 / g.Count();\n    Console.WriteLine($"{g.Key}: average {g.Average(r => r.Mark):F1}, pass rate {rate}%");\n}\nvar top = rows.GroupBy(r => r.Name)\n    .Select(g => (Name: g.Key, Avg: g.Average(r => r.Mark)))\n    .OrderByDescending(x => x.Avg).ThenBy(x => x.Name, StringComparer.Ordinal)\n    .First();\nConsole.WriteLine($"top student {top.Name} {top.Avg:F1}");' }
  } });

  /* ================================================================
     retrieval cards (skill cards) for unit 9
     ================================================================ */
  K.add({ cards: {
    "u9-linq": { title: "Read a LINQ chain", lesson: "9.8", concepts: ["linq-basics"], kind: "predict",
      vary: function (r, n) {
        var xs = []; for (var i = 0; i < 6; i++) xs.push(1 + r(20));
        var k = 3 + r(8), m = 2 + r(3);
        var srcs = [
          "var xs = new[] { " + xs.join(", ") + " };\nConsole.WriteLine(string.Join(\" \", xs.Where(x => x > " + k + ").OrderBy(x => x).Select(x => x * " + m + ")));",
          "var xs = new[] { " + xs.join(", ") + " };\nConsole.WriteLine(xs.Count(x => x % " + m + " == 0) + \" \" + xs.Distinct().Count() + \" \" + xs.Any(x => x > " + (10 + k) + "));",
          "var xs = new[] { " + xs.join(", ") + " };\nConsole.WriteLine(string.Join(\",\", xs.OrderByDescending(x => x).Skip(1).Take(" + m + ")));"
        ];
        return { prompt: "What does this print?", label: ["filter, sort, map", "counting questions", "skip and take"][n % 3], params: [], src: srcs[n % 3],
          hint: "Read the chain left to right: each step works on the previous step's result." };
      } },
    "u9-closure": { title: "What did the lambda capture?", lesson: "9.4", concepts: ["closures", "lambdas"], kind: "predict",
      vary: function (r, n) {
        var a = 1 + r(5), b = 2 + r(4), c = 1 + r(3);
        var srcs = [
          "int k = " + a + ";\nFunc<int, int> f = x => x * k;\nk = " + (a + b) + ";\nConsole.WriteLine(f(" + c + "));",
          "var next = Counter(" + a + ");\nnext();\nnext();\nConsole.WriteLine(next());\n\nstatic Func<int> Counter(int start)\n{\n    int n = start;\n    return () => n += " + b + ";\n}",
          "var fs = new List<Func<int>>();\nfor (int i = 0; i < " + (b + 1) + "; i++) fs.Add(() => i * " + c + ");\nConsole.WriteLine(fs[0]() + fs[1]());"
        ];
        return { prompt: "What does this print?", label: ["a variable changed after capture", "a counter that remembers", "a captured loop variable"][n % 3], params: [], src: srcs[n % 3],
          hint: "A lambda captures the variable itself, not its value at the time it was written." };
      } },
    "u9-deferred": { title: "When does the query run?", lesson: "9.10", concepts: ["deferred"], kind: "predict",
      vary: function (r, n) {
        var t = 3 + r(5), add = [t + 1 + r(5), r(3)], start = [1 + r(9), t + 2 + r(5)];
        var snap = n % 2 === 0;
        return { prompt: "What does this print?", label: snap ? "a query and a snapshot" : "a query after the list changes", params: [],
          src: "var xs = new List<int> { " + start.join(", ") + " };\nvar q = xs.Where(x => x > " + t + ");\n" + (snap ? "var s = q.ToList();\n" : "") + "xs.Add(" + add[0] + ");\nxs.Add(" + add[1] + ");\nConsole.WriteLine(" + (snap ? "q.Count() + \" \" + s.Count" : "string.Join(\" \", q)") + ");",
          hint: "Where waits until the query is enumerated; ToList runs it at once and keeps the answer." };
      } },
    "u9-group": { title: "Group and count", lesson: "9.9", concepts: ["linq-group"], kind: "predict",
      vary: function (r) {
        var pool = ["ant", "bee", "cat", "cow", "bat", "ape", "cod", "boa"];
        var ws = []; for (var i = 0; i < 5; i++) ws.push("\"" + pool[r(pool.length)] + "\"");
        return { prompt: "What does this print?", label: "GroupBy by first letter", params: [],
          src: "var ws = new[] { " + ws.join(", ") + " };\nforeach (var g in ws.GroupBy(w => w[0]).OrderByDescending(g => g.Count()).ThenBy(g => g.Key))\n    Console.WriteLine($\"{g.Key} {g.Count()}\");",
          hint: "One group per first letter; sorted by size, then by letter." };
      } },
    "u9-generic": { title: "Write a generic method", lesson: "9.2", concepts: ["generic-methods", "constraints"], kind: "write",
      vary: function (r, n) {
        var big = n % 2 === 0;
        var name = big ? "Largest" : "Smallest", op = big ? "> 0" : "< 0";
        var nums = [[r(50), r(50), r(50)], [r(9) - 5, r(9) - 5]];
        var words = ["pear fig apple", "kiwi lime"];
        var cases = [0, 1].map(function (i) {
          var ns = nums[i], wsx = words[i].split(" ");
          var nr = big ? Math.max.apply(null, ns) : Math.min.apply(null, ns);
          var wr = wsx.slice().sort()[big ? wsx.length - 1 : 0];
          return { stdin: ns.join(" ") + "\n" + words[i], out: nr + "\n" + wr };
        });
        return { prompt: "Write ONE generic method `static T " + name + "<T>(List<T> xs) where T : IComparable<T>`. Read a line of whole numbers and a line of words; print the " + (big ? "largest" : "smallest") + " number and the alphabetically " + (big ? "last" : "first") + " word, both through " + name + ".",
          label: name + "<T>", params: [name], starter: "",
          cases: cases,
          rules: [{ id: "gen", test: function (src) { return new RegExp("T\\s+" + name + "\\s*<\\s*T\\s*>").test(src) && /where\s+T\s*:\s*IComparable<\s*T\s*>/.test(src) && !/\.(Max|Min|Sort|OrderBy)\s*\(/.test(src); }, msg: "One generic " + name + "<T> with the IComparable<T> constraint, using CompareTo." }],
          hint: "T best = xs[0]; foreach (var x in xs) if (x.CompareTo(best) " + op + ") best = x;",
          answer: "var nums = (Console.ReadLine() ?? \"\").Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();\nvar words = (Console.ReadLine() ?? \"\").Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList();\nConsole.WriteLine(" + name + "(nums));\nConsole.WriteLine(" + name + "(words));\n\nstatic T " + name + "<T>(List<T> xs) where T : IComparable<T>\n{\n    T best = xs[0];\n    foreach (var x in xs) if (x.CompareTo(best) " + op + ") best = x;\n    return best;\n}" };
      } },
    "u9-query": { title: "Write a query", lesson: "9.8", concepts: ["linq-basics"], kind: "write",
      vary: function (r, n) {
        var t = 20 + r(40), desc = n % 2 === 1, take = 2 + r(2);
        var mk = function () { var xs = []; for (var i = 0; i < 6; i++) xs.push(r(100)); return xs; };
        var sets = [mk(), mk(), [t, t, t + 1]];
        var f = function (xs) { var ys = xs.filter(function (x) { return x >= t; }).sort(function (a, b) { return desc ? b - a : a - b; }).slice(0, take); return ys.length ? ys.join(" ") : "none"; };
        return { prompt: "Read whole numbers on one line. With one LINQ chain print the " + (desc ? "largest" : "smallest") + " " + take + " numbers that are at least " + t + ", in " + (desc ? "descending" : "ascending") + " order, separated by spaces — or `none`.",
          label: "at least " + t + ", " + (desc ? "top" : "bottom") + " " + take, params: [String(t), String(take)], starter: "var xs = (Console.ReadLine() ?? \"\").Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();\n",
          cases: sets.map(function (xs) { return { stdin: xs.join(" "), out: f(xs) }; }),
          rules: [{ id: "linq", test: function (src) { return /\.Where\s*\(/.test(src) && /\.OrderBy(Descending)?\s*\(/.test(src) && /\.Take\s*\(/.test(src); }, msg: "Use Where, OrderBy (or OrderByDescending) and Take." }],
          hint: "xs.Where(x => x >= " + t + ")." + (desc ? "OrderByDescending" : "OrderBy") + "(x => x).Take(" + take + ")",
          answer: "var xs = (Console.ReadLine() ?? \"\").Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();\nvar r = xs.Where(x => x >= " + t + ")." + (desc ? "OrderByDescending" : "OrderBy") + "(x => x).Take(" + take + ").ToList();\nConsole.WriteLine(r.Count == 0 ? \"none\" : string.Join(\" \", r));" };
      } }
  } });
})();
