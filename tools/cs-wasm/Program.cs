/* Kurenai OS — tools/cs-wasm: the full C# runner (units 7+).
   Roslyn compiles the learner's files inside .NET WebAssembly; the program
   runs in a collectible load context with stdin, stdout and the working
   folder (the in-memory disk) redirected. The request and the result have
   the in-app interpreter's shape (js/labs/cs-interp.js run()), so the
   checker and the pages need no second protocol. The worker that hosts it
   (js/labs/cs-wasm-worker.js) removes the network before any learner code
   runs, and the page's watchdog stops a program that does not finish. */
using System.Collections;
using System.Globalization;
using System.Reflection;
using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Loader;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;

Console.WriteLine("cs-wasm " + Runner.Version);

public static partial class Runner
{
    public const string Version = "csw-1.0";
    const string GlobalUsings = "global using System;\nglobal using System.IO;\nglobal using System.Collections.Generic;\nglobal using System.Linq;\nglobal using System.Net.Http;\nglobal using System.Threading;\nglobal using System.Threading.Tasks;\n";
    static List<MetadataReference>? refs;
    static readonly Dictionary<string, Built> cache = new();
    sealed record Built(byte[]? Pe, byte[]? Pdb, JsonObject? Error, JsonArray Warnings);

    static List<MetadataReference> Refs()
    {
        if (refs != null) return refs;
        refs = new List<MetadataReference>();
        var asm = typeof(Runner).Assembly;
        foreach (var name in asm.GetManifestResourceNames())
        {
            if (!name.StartsWith("ref/") || !name.EndsWith(".dll")) continue;
            using var s = asm.GetManifestResourceStream(name)!;
            using var ms = new MemoryStream();
            s.CopyTo(ms);
            refs.Add(MetadataReference.CreateFromImage(ms.ToArray()));
        }
        return refs;
    }

    /* warm-up: load the references and compile once, so the first real run is quick */
    [JSExport]
    public static string Warm()
    {
        var t0 = DateTime.UtcNow;
        Compile(new JsonArray(new JsonObject { ["name"] = "Program.cs", ["src"] = "Console.WriteLine(1);" }), true);
        return ((int)(DateTime.UtcNow - t0).TotalMilliseconds).ToString();
    }

    static Built Compile(JsonArray files, bool nullable)
    {
        var key = (nullable ? "n1" : "n0") + "\u0000" + files.ToJsonString();
        if (cache.TryGetValue(key, out var hit)) return hit;
        var opts = new CSharpParseOptions(LanguageVersion.CSharp14);
        var trees = new List<SyntaxTree> { CSharpSyntaxTree.ParseText(GlobalUsings, opts, "GlobalUsings.g.cs", Encoding.UTF8) };
        foreach (var f in files)
            trees.Add(CSharpSyntaxTree.ParseText((string?)f!["src"] ?? "", opts, (string?)f["name"] ?? "Program.cs", Encoding.UTF8));
        var copts = new CSharpCompilationOptions(OutputKind.ConsoleApplication,
            nullableContextOptions: nullable ? NullableContextOptions.Enable : NullableContextOptions.Disable,
            optimizationLevel: OptimizationLevel.Debug, concurrentBuild: false, deterministic: true);
        /* the learner's own source decides the diagnostics; the marked copy is what runs */
        var comp = CSharpCompilation.Create("Learner" + cache.Count, trees, Refs(), copts);
        var diags = comp.GetDiagnostics();
        var warnings = new JsonArray();
        JsonObject? error = null;
        foreach (var d in diags.OrderBy(d => d.Location.GetMappedLineSpan().Path == "GlobalUsings.g.cs" ? 1 : 0).ThenBy(d => d.Location.SourceSpan.Start))
        {
            if (d.Severity == DiagnosticSeverity.Hidden || d.Severity == DiagnosticSeverity.Info) continue;
            var pos = d.Location.GetMappedLineSpan();
            var o = new JsonObject { ["code"] = d.Id, ["msg"] = d.GetMessage(CultureInfo.InvariantCulture), ["line"] = pos.StartLinePosition.Line + 1, ["file"] = pos.Path };
            if (d.Severity == DiagnosticSeverity.Error) { if (error == null) { o["kind"] = "compile"; error = o; } }
            else if (warnings.Count < 50) warnings.Add(o);
        }
        Built built;
        if (error != null) built = new Built(null, null, error, warnings);
        else
        {
            var marked = trees.Select(t => t.FilePath == "GlobalUsings.g.cs" ? t : Instrument.Rewrite(t)).ToList();
            marked.Add(CSharpSyntaxTree.ParseText(Instrument.Support, opts, "KosSupport.g.cs", Encoding.UTF8));
            using var pe = new MemoryStream();
            var r = CSharpCompilation.Create("Learner" + cache.Count, marked, Refs(), copts).Emit(pe);
            built = r.Success ? new Built(pe.ToArray(), null, null, warnings)
                : new Built(null, null, new JsonObject { ["code"] = "INTERNAL", ["kind"] = "internal", ["msg"] = "The runner could not prepare this program: " + r.Diagnostics.FirstOrDefault(x => x.Severity == DiagnosticSeverity.Error), ["line"] = 0 }, warnings);
        }
        if (cache.Count > 64) cache.Clear();
        cache[key] = built;
        return built;
    }

    /* run(reqJson) → resultJson, as cs-interp.js run():
       req { files:[{name,src}], stdin, fs:{name:text|{hex}}, mode:"program"|"method", call:{name,args}, nullable } */
    [JSExport]
    public static async Task<string> Run(string reqJson)
    {
        var t0 = DateTime.UtcNow;
        var req = JsonNode.Parse(reqJson)!.AsObject();
        var res = new JsonObject();
        var output = new CappedWriter();
        string dir = "/kos/run" + (++runs);
        try
        {
            var built = Compile(req["files"]!.AsArray(), req["nullable"]?.GetValue<bool>() ?? true);
            res["warnings"] = built.Warnings.DeepClone();
            if (built.Error != null) { res["ok"] = false; res["stdout"] = ""; res["error"] = built.Error.DeepClone(); return Done(res, t0); }
            Directory.CreateDirectory(dir);
            if (req["fs"] is JsonObject seed)
                foreach (var kv in seed)
                {
                    var path = Path.Combine(dir, kv.Key);
                    if (kv.Key.EndsWith("/")) { Directory.CreateDirectory(path); continue; }
                    Directory.CreateDirectory(Path.GetDirectoryName(path)!);
                    if (kv.Value is JsonObject b && b["hex"] is JsonNode hx) File.WriteAllBytes(path, Convert.FromHexString((string)hx!));
                    else File.WriteAllText(path, (string?)kv.Value ?? "");
                }
            /* a fresh copy of the assembly for every run: statics start again */
            var asm = Assembly.Load(built.Pe!);
            var rt = asm.GetType("__Kos.Rt")!;
            rt.GetField("Max")!.SetValue(null, (long)(req["budget"]?.GetValue<double>() ?? 5e6));
            rt.GetField("Deadline")!.SetValue(null, Environment.TickCount64 + (long)(req["ms"]?.GetValue<double>() ?? 3000));
            var culture = new CultureInfo("en-GB");
            CultureInfo.CurrentCulture = culture; CultureInfo.CurrentUICulture = culture;
            CultureInfo.DefaultThreadCurrentCulture = culture; CultureInfo.DefaultThreadCurrentUICulture = culture;
            var oldOut = Console.Out; var oldErr = Console.Error;
            Console.SetOut(output); Console.SetError(output);
            Console.SetIn(new StringReader((string?)req["stdin"] ?? ""));
            Directory.SetCurrentDirectory(dir);
            try
            {
                if ((string?)req["mode"] == "method") res["value"] = Show(await CallMethod(asm, req["call"]!.AsObject()));
                else await RunMain(asm);
                res["ok"] = true;
            }
            catch (Exception e)
            {
                while ((e is TargetInvocationException || e is AggregateException) && e.InnerException != null) e = e.InnerException;
                res["ok"] = false;
                res["error"] = e is MissingMethodException mm && mm.Message.StartsWith("kos:")
                    ? new JsonObject { ["code"] = "CS0103", ["kind"] = "compile", ["msg"] = mm.Message[4..], ["line"] = 0 }
                    : e.GetType().FullName == "__Kos.Budget"
                    ? new JsonObject { ["code"] = "TIMEOUT", ["kind"] = "timeout", ["msg"] = e.Message == "time" ? "Your program ran for more than " + ((req["ms"]?.GetValue<double>() ?? 3000) / 1000) + " seconds without finishing." : "Your program ran for more than " + (req["budget"]?.GetValue<double>() ?? 5e6).ToString("N0", CultureInfo.InvariantCulture) + " steps without finishing.", ["line"] = LineAt(asm) }
                    : e is InsufficientExecutionStackException || e is StackOverflowException
                    ? new JsonObject { ["code"] = "StackOverflow", ["kind"] = "exception", ["msg"] = "Stack overflow: a method called itself too deeply.", ["line"] = LineAt(asm), ["type"] = "StackOverflowException" }
                    : new JsonObject { ["code"] = e.GetType().Name, ["kind"] = "exception", ["msg"] = e.Message, ["line"] = LineAt(asm), ["type"] = e.GetType().Name };
            }
            finally
            {
                Console.SetOut(oldOut); Console.SetIn(TextReader.Null); Console.SetError(oldErr);
                Directory.SetCurrentDirectory("/");
            }
            res["stdout"] = output.ToString();
            if (output.Over) { res["ok"] = false; res["error"] = new JsonObject { ["code"] = "OUTPUT", ["kind"] = "timeout", ["msg"] = "Your program printed more than 100,000 characters.", ["line"] = 0 }; }
            res["fs"] = ReadBack(dir);
        }
        catch (Exception e)
        {
            res["ok"] = false; res["stdout"] = output.ToString();
            res["error"] = new JsonObject { ["code"] = "INTERNAL", ["kind"] = "internal", ["msg"] = e.GetType().Name + ": " + e.Message, ["line"] = 0, ["trace"] = e.StackTrace };
        }
        finally { try { if (Directory.Exists(dir)) Directory.Delete(dir, true); } catch { } }
        return Done(res, t0);
    }
    static int runs;
    static string Done(JsonObject res, DateTime t0) { res["ms"] = (int)(DateTime.UtcNow - t0).TotalMilliseconds; res["steps"] = 0; res["runner"] = Version; return res.ToJsonString(); }

    static async Task RunMain(Assembly asm)
    {
        var entry = asm.EntryPoint ?? throw new MissingMethodException("kos:The program has no entry point: write statements at the top of Program.cs, or a static Main.");
        /* an async Main is reached through a synchronous wrapper that blocks,
           which this single-threaded runtime cannot do: call the async one */
        if (entry.Name == "<Main>")
        {
            var inner = entry.DeclaringType!.GetMethods(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic)
                .FirstOrDefault(m => (m.Name == "<Main>$" || m.Name == "Main") && typeof(Task).IsAssignableFrom(m.ReturnType));
            if (inner != null) entry = inner;
        }
        object?[] args = entry.GetParameters().Length == 0 ? Array.Empty<object?>() : new object?[] { Array.Empty<string>() };
        var r = entry.Invoke(null, args);
        if (r is Task t) await t;
    }

    /* method mode: a static method (or a top-level local function) by name */
    static async Task<object?> CallMethod(Assembly asm, JsonObject call)
    {
        var name = (string)call["name"]!;
        var args = call["args"] as JsonArray ?? new JsonArray();
        var m = asm.GetTypes().SelectMany(t => t.GetMethods(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly))
            .FirstOrDefault(x => (x.Name == name || x.Name.Contains("g__" + name + "|")) && x.GetParameters().Length == args.Count)
            ?? throw new MissingMethodException("kos:The name '" + name + "' does not exist in the current context");
        var ps = m.GetParameters();
        var vals = new object?[ps.Length];
        for (int i = 0; i < ps.Length; i++) vals[i] = args[i] == null ? null : args[i].Deserialize(ps[i].ParameterType, new JsonSerializerOptions { IncludeFields = true });
        var r = m.Invoke(null, vals);
        if (r is Task t) { await t; var p = t.GetType().GetProperty("Result"); return p != null && t.GetType().IsGenericType ? p.GetValue(t) : null; }
        return r;
    }
    static string Show(object? v) => v switch
    {
        null => "null",
        string s => JsonSerializer.Serialize(s),
        char c => "'" + c + "'",
        bool b => b ? "True" : "False",
        IDictionary d => "{" + string.Join(", ", d.Keys.Cast<object>().Select(k => Show(k) + ": " + Show(d[k]))) + "}",
        IEnumerable e => "[" + string.Join(", ", e.Cast<object?>().Select(Show)) + "]",
        IFormattable f => f.ToString(null, CultureInfo.CurrentCulture),
        _ => v.ToString() ?? ""
    };
    static int LineAt(Assembly asm) { try { return (int)asm.GetType("__Kos.Rt")!.GetField("Line")!.GetValue(null)!; } catch { return 0; } }
    /* the folder after the run: text files as text, anything else as hex */
    static JsonObject ReadBack(string dir)
    {
        var o = new JsonObject();
        if (!Directory.Exists(dir)) return o;
        foreach (var path in Directory.GetFiles(dir, "*", SearchOption.AllDirectories).Order(StringComparer.Ordinal))
        {
            var rel = Path.GetRelativePath(dir, path).Replace('\\', '/');
            var bytes = File.ReadAllBytes(path);
            if (bytes.Length > 1 << 20) continue;
            o[rel] = IsText(bytes) ? Encoding.UTF8.GetString(bytes) : new JsonObject { ["hex"] = Convert.ToHexString(bytes) };
        }
        return o;
    }
    static bool IsText(byte[] b)
    {
        if (Array.IndexOf(b, (byte)0) >= 0) return false;
        try { new UTF8Encoding(false, true).GetString(b); return true; } catch { return false; }
    }
    sealed class CappedWriter : StringWriter
    {
        public bool Over;
        public override void Write(char value) { if (GetStringBuilder().Length >= 100_000) { Over = true; return; } base.Write(value); }
        public override void Write(string? value) { if (value == null) return; if (GetStringBuilder().Length + value.Length > 100_000) { Over = true; value = value[..Math.Max(0, 100_000 - GetStringBuilder().Length)]; } base.Write(value); }
        public override void Write(char[] buffer, int index, int count) => Write(new string(buffer, index, count));
    }
}
