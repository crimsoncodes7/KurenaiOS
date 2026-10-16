#!/usr/bin/env node
/* tools/cs_wasm_check.mjs — Spike W's compatibility check (docs/code-plan.md
   §12.1): programs in the language of units 7–12 (classes, interfaces,
   records, generics, LINQ, nullable, async, exceptions, files, JSON) run
   under the full C# runner that ships to the browser (.NET WebAssembly,
   tools/lib/cs-wasm-node.js) AND under native .NET, and must agree byte for
   byte; it also prints the runner's start-up and compile times. Needs the
   .NET 10 SDK and a built runtime (tools/build_cs_wasm.sh).
     node tools/cs_wasm_check.mjs                                            */
import { createRequire } from "module";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
const require = createRequire(import.meta.url);
const { loadWasm } = require("./lib/cs-wasm-node.js");

const P = [
  ["classes", 'var a = new Account("Ada", 50m);\na.Deposit(25.5m);\nConsole.WriteLine(a);\ntry { a.Withdraw(500); } catch (InvalidOperationException e) { Console.WriteLine(e.Message); }\nclass Account(string owner, decimal start)\n{\n    public string Owner { get; } = owner;\n    public decimal Balance { get; private set; } = start;\n    public void Deposit(decimal x) { if (x <= 0) throw new ArgumentOutOfRangeException(nameof(x)); Balance += x; }\n    public void Withdraw(decimal x) { if (x > Balance) throw new InvalidOperationException($"Only {Balance:C} available."); Balance -= x; }\n    public override string ToString() => $"{Owner}: {Balance:C}";\n}'],
  ["statics", 'Console.WriteLine(Counter.Next() + Counter.Next() + Counter.Next());\nConsole.WriteLine(Counter.Count);\nstatic class Counter { public static int Count { get; private set; } public static int Next() => ++Count; }'],
  ["inheritance", 'Shape[] shapes = { new Circle(1), new Rect(2, 3), new Square(2) };\nforeach (var s in shapes) Console.WriteLine($"{s.Name,-7}{s.Area(),8:F2}");\nabstract class Shape { public abstract double Area(); public virtual string Name => GetType().Name; }\nclass Circle(double r) : Shape { public override double Area() => Math.PI * r * r; }\nclass Rect(double w, double h) : Shape { public override double Area() => w * h; }\nclass Square(double s) : Rect(s, s) { public override string Name => "Square!"; }'],
  ["interfaces", 'var xs = new List<Money> { new(5), new(2), new(9) };\nxs.Sort();\nConsole.WriteLine(string.Join(", ", xs));\nIGreeter g = new Polite();\nConsole.WriteLine(g.Greet("Kai"));\ninterface IGreeter { string Greet(string n) => $"Hi {n}"; }\nclass Polite : IGreeter { }\nrecord Money(int Pence) : IComparable<Money> { public int CompareTo(Money? o) => Pence.CompareTo(o?.Pence ?? 0); public override string ToString() => $"£{Pence / 100.0:F2}"; }'],
  ["records", 'var p = new Point(1, 2);\nvar q = p with { Y = 5 };\nConsole.WriteLine($"{p} {q} {p == new Point(1, 2)} {ReferenceEquals(p, q)}");\nvar (x, y) = q;\nConsole.WriteLine(x + y);\nrecord Point(int X, int Y);'],
  ["structs", 'var a = new V(1, 2);\nvar b = a;\nb.X = 9;\nConsole.WriteLine($"{a.X} {b.X}");\nvar c = new C { X = 1 };\nvar d = c;\nd.X = 9;\nConsole.WriteLine($"{c.X} {d.X}");\nstruct V(int x, int y) { public int X = x; public int Y = y; }\nclass C { public int X; }'],
  ["vector", 'var a = new Vec(3, 4);\nvar b = new Vec(1, 2);\nConsole.WriteLine($"{a + b} {a - b} {a * 2} {a.Length} {Vec.Dot(a, b)}");\nreadonly record struct Vec(double X, double Y)\n{\n    public static Vec operator +(Vec a, Vec b) => new(a.X + b.X, a.Y + b.Y);\n    public static Vec operator -(Vec a, Vec b) => new(a.X - b.X, a.Y - b.Y);\n    public static Vec operator *(Vec a, double k) => new(a.X * k, a.Y * k);\n    public double Length => Math.Sqrt(X * X + Y * Y);\n    public static double Dot(Vec a, Vec b) => a.X * b.X + a.Y * b.Y;\n}'],
  ["generics", 'var s = new Stack2<string>();\ns.Push("a"); s.Push("b");\nConsole.WriteLine(s.Pop() + s.Peek() + s.Count);\nConsole.WriteLine(Max(3, 9) + " " + Max("pear", "apple"));\nstatic T Max<T>(T a, T b) where T : IComparable<T> => a.CompareTo(b) >= 0 ? a : b;\nclass Stack2<T> { readonly List<T> items = new(); public int Count => items.Count; public void Push(T x) => items.Add(x); public T Peek() => items[^1]; public T Pop() { var x = items[^1]; items.RemoveAt(items.Count - 1); return x; } }'],
  ["linq", 'var marks = new[] { ("Ada", "maths", 91), ("Kai", "maths", 74), ("Ada", "physics", 78), ("Lin", "maths", 88), ("Kai", "physics", 62) };\nforeach (var g in marks.GroupBy(m => m.Item1).OrderBy(g => g.Key))\n    Console.WriteLine($"{g.Key}: {g.Average(m => m.Item3):F1} over {g.Count()}");\nConsole.WriteLine(string.Join(",", marks.Where(m => m.Item3 > 70).Select(m => m.Item1).Distinct()));\nConsole.WriteLine(marks.Aggregate(0, (t, m) => t + m.Item3));\nvar dict = marks.ToDictionary(m => m.Item1 + "/" + m.Item2, m => m.Item3);\nConsole.WriteLine(dict["Lin/maths"]);'],
  ["delegates", 'Func<int, int> sq = x => x * x;\nAction<string> say = Console.WriteLine;\nsay(string.Join(" ", Enumerable.Range(1, 5).Select(sq)));\nvar ops = new Dictionary<string, Func<double, double, double>> { ["+"] = (a, b) => a + b, ["/"] = (a, b) => a / b };\nConsole.WriteLine(ops["/"](7, 2));\nPredicate<int> even = n => n % 2 == 0;\nConsole.WriteLine(even(4));'],
  ["events", 'var t = new Thermo();\nt.TooHot += (s, c) => Console.WriteLine($"Too hot: {c}°C");\nforeach (var c in new[] { 20, 31, 25, 35 }) t.Read(c);\nclass Thermo { public event EventHandler<int>? TooHot; public void Read(int c) { if (c > 30) TooHot?.Invoke(this, c); } }'],
  ["yield", 'foreach (var f in Fib().Take(10)) Console.Write(f + " ");\nConsole.WriteLine();\nvar q = Squares().Where(x => x % 2 == 1);\nConsole.WriteLine(q.First());\nstatic IEnumerable<long> Fib() { long a = 0, b = 1; while (true) { yield return a; (a, b) = (b, a + b); } }\nstatic IEnumerable<int> Squares() { for (int i = 1; ; i++) { Console.WriteLine("making " + i); yield return i * i; } }'],
  ["patterns", 'object[] xs = { 3, "hi", 2.5, null!, new List<int> { 1, 2 }, (1, "a") };\nforeach (var x in xs) Console.WriteLine(Describe(x));\nstatic string Describe(object? o) => o switch { int n when n > 2 => "big int " + n, int n => "int " + n, string { Length: > 1 } s => "text " + s, double d => $"double {d}", List<int> { Count: var c } => "list of " + c, (int a, string b) => $"tuple {a}{b}", null => "null", _ => "other" };'],
  ["nullable", 'string? name = args.Length > 0 ? args[0] : null;\nConsole.WriteLine(name ?? "nobody");\nConsole.WriteLine(name?.Length ?? -1);\nstring s = name!;\nConsole.WriteLine(s is null);'],
  ["exceptions", 'try { Parse("x"); }\ncatch (BadInput e) when (e.Field == "age") { Console.WriteLine($"{e.GetType().Name}: {e.Message} ({e.InnerException?.GetType().Name})"); }\nfinally { Console.WriteLine("done"); }\nstatic void Parse(string s) { try { int.Parse(s); } catch (FormatException f) { throw new BadInput("age", "Age must be a number", f); } }\nclass BadInput(string field, string msg, Exception inner) : Exception(msg, inner) { public string Field { get; } = field; }'],
  ["uncaught", 'var xs = new List<int>();\nConsole.WriteLine("before");\nConsole.WriteLine(xs.First());'],
  ["files", 'File.WriteAllLines("a.txt", new[] { "x", "y" });\nusing (var w = new StreamWriter("b.txt", append: true)) w.WriteLine("z");\nConsole.WriteLine(string.Join("|", File.ReadAllLines("a.txt").Concat(File.ReadLines("b.txt"))));\nusing (var bw = new BinaryWriter(File.Create("n.bin"))) { bw.Write(42); bw.Write(3.5); bw.Write("hé"); }\nusing var br = new BinaryReader(File.OpenRead("n.bin"));\nConsole.WriteLine($"{br.ReadInt32()} {br.ReadDouble()} {br.ReadString()} {new FileInfo("n.bin").Length}");'],
  ["json", 'using System.Text.Json;\nvar p = new Pet("Rex", 4, new[] { "ball" });\nstring j = JsonSerializer.Serialize(p);\nConsole.WriteLine(j);\nvar back = JsonSerializer.Deserialize<Pet>(j)!;\nConsole.WriteLine(back.Name + back.Toys.Length);\nConsole.WriteLine(JsonSerializer.Serialize(new { a = 1, b = new[] { 2, 3 } }, new JsonSerializerOptions { WriteIndented = true }));\nrecord Pet(string Name, int Age, string[] Toys);'],
  ["async", 'var sw = System.Diagnostics.Stopwatch.StartNew();\nvar tasks = new[] { Work("a", 30), Work("b", 10), Work("c", 20) };\nforeach (var r in await Task.WhenAll(tasks)) Console.WriteLine(r);\nusing var cts = new CancellationTokenSource(20);\ntry { await Task.Delay(1000, cts.Token); } catch (TaskCanceledException) { Console.WriteLine("cancelled"); }\nstatic async Task<string> Work(string n, int ms) { await Task.Delay(ms); return n + " done"; }'],
  ["bitwise", 'int a = 0b1100, b = 0b1010;\nConsole.WriteLine($"{a & b} {a | b} {a ^ b} {~a} {a << 2} {a >> 1} {Convert.ToString(a ^ b, 2).PadLeft(8, \'0\')}");\n(a, b) = (a ^ b, b);\nConsole.WriteLine(a);\n[Flags] enum P { None = 0, Read = 1, Write = 2, Exec = 4 }'],
  ["datetime", 'var d = new DateTime(2027, 6, 14, 9, 30, 0);\nConsole.WriteLine($"{d:D} {d:t} {(new DateTime(2027, 12, 25) - d).Days} {d.AddMonths(1):d}");\nConsole.WriteLine($"{1234567.891:N2} {0.256:P1} {12.5m:C}");'],
  ["readline", 'string? line;\nint total = 0;\nwhile ((line = Console.ReadLine()) != null) total += int.Parse(line);\nConsole.WriteLine(total);', "4\n5\n6"],
  ["compile-nullable-warn-ok", 'string s = null;\nConsole.WriteLine(s == null);'],
  ["compile-error", 'class A { public void F() { } }\nnew A().G();'],
  ["recursion", 'Console.WriteLine(Hanoi(10));\nstatic long Hanoi(int n) => n == 0 ? 0 : 2 * Hanoi(n - 1) + 1;'],
  ["collections", 'var pq = new PriorityQueue<string, int>();\npq.Enqueue("c", 3); pq.Enqueue("a", 1); pq.Enqueue("b", 2);\nwhile (pq.TryDequeue(out var x, out var p)) Console.Write($"{x}{p} ");\nConsole.WriteLine();\nvar ll = new LinkedList<int>(new[] { 1, 2, 3 });\nll.AddFirst(0);\nConsole.WriteLine(string.Join(",", ll));\nvar ss = new SortedSet<string> { "pear", "fig", "apple" };\nConsole.WriteLine(ss.Min + " " + string.Join(" ", ss));']
];

function dotnet(src, stdin) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kos-wasmchk-"));
  const lines = src.split("\n"), usings = [];
  while (lines.length && /^\s*using\s+[\w.]+\s*;\s*$/.test(lines[0])) usings.push(lines.shift());
  const f = path.join(dir, "p.cs");
  fs.writeFileSync(f, "#:property Nullable=enable\n#:property InvariantGlobalization=false\n#:property JsonSerializerIsReflectionEnabledByDefault=true\n" + usings.join("\n") + (usings.length ? "\n" : "") + "System.Globalization.CultureInfo.CurrentCulture = new System.Globalization.CultureInfo(\"en-GB\");\n" + lines.join("\n") + "\n");
  const r = spawnSync("dotnet", ["run", f], { input: stdin || "", encoding: "utf8", cwd: dir, timeout: 120000 });
  const out = (r.stdout || "").split("\n").filter((l) => !/\.cs\(\d+,\d+\): warning /.test(l)).join("\n");
  const all = out + (r.stderr || "");
  const ce = /error (CS\d{4})/.exec(all), ex = /Unhandled exception\. System\.([\w.]+)/.exec(all);
  return ce ? { kind: "compile", code: ce[1] } : ex ? { kind: "exception", code: ex[1].split(".").pop(), stdout: out.replace(/Unhandled exception[\s\S]*$/, "") } : { kind: "ok", stdout: out };
}
const norm = (s) => String(s || "").replace(/\r\n?/g, "\n").replace(/\n+$/, "");

const wasm = await loadWasm();
if (!wasm) { console.error("cs_wasm_check: no runtime built — run tools/build_cs_wasm.sh"); process.exit(2); }
console.log(`runtime ${wasm.id}: started in ${wasm.bootMs} ms, first compile ${wasm.warmMs} ms`);
let bad = 0, worst = 0;
for (const [name, src, stdin] of P) {
  const t0 = Date.now();
  const mine = await wasm.run({ files: [{ name: "Program.cs", src }], stdin: stdin || "", nullable: true });
  const ms = Date.now() - t0; worst = Math.max(worst, ms);
  const net = dotnet(src, stdin);
  const ik = mine.ok ? "ok" : mine.error.kind;
  let problem = null;
  if (ik !== net.kind) problem = "runner " + ik + (mine.ok ? "" : " " + mine.error.code + " " + mine.error.msg) + " · .NET " + net.kind + (net.code ? " " + net.code : "");
  else if (net.kind === "compile" && mine.error.code !== net.code) problem = "compile codes " + mine.error.code + " vs " + net.code;
  else if (net.kind === "exception" && mine.error.code !== net.code) problem = "exception " + mine.error.code + " vs " + net.code;
  else if (norm(mine.stdout) !== norm(net.stdout)) problem = "output differs\n--- runner\n" + mine.stdout + "\n--- .NET\n" + net.stdout;
  if (problem) { bad++; console.log("✗ " + name + " (" + ms + " ms): " + problem); }
  else console.log("✓ " + name + " (" + ms + " ms)");
}
console.log((bad ? "✗ " + bad + " of " + P.length + " programs differ from" : "✓ all " + P.length + " programs agree with") + " native .NET · slowest run " + worst + " ms");
process.exit(bad ? 1 : 0);
