// Kurenai validator 1.0.0 — run from the project folder:
//     dotnet run .kurenai/validate.cs
// (or "Kurenai Validate" in Rider's run configurations).
//
// It builds and tests this project for real and writes a report to
// .kurenai/reports/ for you to import into KurenaiOS (Code → the project →
// Validation). It never fakes a result: every step records whether it ran,
// its exit code and how long it took, and a step that did not run counts as
// a failure. Compiler diagnostics come from SARIF logs, test results from
// TRX files — never from console text. The shipped tests and settings are
// checked against their SHA-256 hashes in kurenai.project.json; a changed
// one is reported, never hidden, and KurenaiOS then records the report as
// practice only. Exit code 0 only when every milestone passes.
#:property Nullable=enable
#:property PublishAot=false
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Xml.Linq;

const string Version = "1.0.0";
var started = DateTime.UtcNow;
string root = FindRoot(Environment.CurrentDirectory);
var project = JsonNode.Parse(File.ReadAllText(Path.Combine(root, "kurenai.project.json")))!.AsObject();
string outDir = Path.Combine(root, ".kurenai", "out");
if (Directory.Exists(outDir)) Directory.Delete(outDir, true);
Directory.CreateDirectory(outDir);
string sln = Path.Combine(root, (string)project["solution"]!);
var steps = new JsonArray();
var failures = new JsonArray();
var stepOk = new Dictionary<string, bool>();

Say($"Kurenai validator {Version} · {(string?)project["title"]} · {root}");

// ── 1 · preflight: the SDK, and the protected files' hashes ──
var (sdkOk, sdkOut, _, sdkMs) = Run("dotnet", new[] { "--version" }, root, 60_000);
string sdk = sdkOut.Trim();
var mismatched = new JsonArray();
var protectedFiles = new JsonObject();
foreach (var (path, want) in project["protected"]!.AsObject())
{
    string full = Path.Combine(root, path.Replace('/', Path.DirectorySeparatorChar));
    string got = File.Exists(full) ? Sha256Text(File.ReadAllText(full)) : "missing";
    protectedFiles[path] = got;
    if (got != (string?)want) mismatched.Add(path);
}
steps.Add(Step("preflight", true, sdkOk ? 0 : 1, sdkMs, new JsonObject { ["sdk"] = sdk }));
stepOk["preflight"] = sdkOk;
Say(sdkOk ? $"✓ .NET SDK {sdk}" : "✗ could not run dotnet --version");
Say(mismatched.Count == 0 ? "✓ shipped tests unchanged" : "◐ changed shipped files: " + string.Join(", ", mismatched.Select(x => (string)x!)) + " — this report counts as practice only");

// ── 2 · restore and build, diagnostics from SARIF ──
var (restoreOk, _, restoreErr, restoreMs) = sdkOk ? Run("dotnet", new[] { "restore", sln, "-nologo" }, root, 600_000) : (false, "", "not run", 0);
steps.Add(Step("restore", sdkOk, sdkOk ? (restoreOk ? 0 : 1) : null, restoreMs));
stepOk["restore"] = restoreOk;
Say(restoreOk ? "✓ restore" : "✗ restore" + (sdkOk ? ": " + FirstLine(restoreErr) : " not run"));

int errors = 0, warnings = 0;
var (buildOk, buildOut, _, buildMs) = restoreOk ? Run("dotnet", new[] { "build", sln, "--no-restore", "-c", "Release", "-nologo", "-p:KurenaiOut=" + outDir }, root, 900_000) : (false, "", "", 0);
foreach (var sarif in Directory.Exists(outDir) ? Directory.GetFiles(outDir, "*.sarif") : Array.Empty<string>())
{
    try
    {
        foreach (var run in JsonNode.Parse(File.ReadAllText(sarif))!["runs"]!.AsArray())
            foreach (var res in run!["results"]?.AsArray() ?? new JsonArray())
            {
                string level = (string?)res!["level"] ?? "warning";
                if (level == "error") { errors++; if (failures.Count < 20) failures.Add(new JsonObject { ["build"] = (string?)res["ruleId"], ["message"] = Cap((string?)res["message"]?["text"]) }); }
                else if (level == "warning") warnings++;
            }
    }
    catch (Exception e) { Say("  (could not read " + Path.GetFileName(sarif) + ": " + e.Message + ")"); }
}
if (!buildOk && errors == 0 && restoreOk) { errors = 1; failures.Add(new JsonObject { ["build"] = "MSBuild", ["message"] = Cap(LastErrorLine(buildOut)) }); }
steps.Add(Step("build", restoreOk, restoreOk ? (buildOk ? 0 : 1) : null, buildMs, new JsonObject { ["errors"] = errors, ["warnings"] = warnings }));
stepOk["build"] = buildOk && errors == 0;
Say(restoreOk ? (buildOk ? $"✓ build · {errors} errors, {warnings} warnings" : $"✗ build · {errors} errors") : "✗ build not run");

// ── 3 · test, results from TRX ──
string trxDir = Path.Combine(outDir, "tests");
var (testRan, _, _, testMs) = stepOk["build"] ? Run("dotnet", new[] { "test", sln, "--no-build", "-c", "Release", "-nologo", "--logger", "trx", "--results-directory", trxDir }, root, 900_000) : (false, "", "", 0);
var byClass = new Dictionary<string, (int pass, int fail)>();
int passed = 0, failed = 0, skipped = 0;
if (Directory.Exists(trxDir))
    foreach (var trx in Directory.GetFiles(trxDir, "*.trx", SearchOption.AllDirectories))
    {
        var doc = XDocument.Load(trx);
        foreach (var r in doc.Descendants().Where(x => x.Name.LocalName == "UnitTestResult"))
        {
            string name = (string?)r.Attribute("testName") ?? "";
            string outcome = (string?)r.Attribute("outcome") ?? "";
            string cls = System.Text.RegularExpressions.Regex.Match(name, @"(?:^|\.)(Milestone\d+)\.").Groups[1].Value;
            var c = byClass.GetValueOrDefault(cls);
            if (outcome == "Passed") { passed++; byClass[cls] = (c.pass + 1, c.fail); }
            else if (outcome == "NotExecuted") skipped++;
            else
            {
                failed++; byClass[cls] = (c.pass, c.fail + 1);
                string msg = r.Descendants().FirstOrDefault(x => x.Name.LocalName == "Message")?.Value ?? outcome;
                if (failures.Count < 20) failures.Add(new JsonObject { ["test"] = name, ["message"] = Cap(msg) });
            }
        }
    }
bool testsRan = stepOk["build"] && passed + failed > 0;
steps.Add(Step("test", stepOk["build"], stepOk["build"] ? (testRan && failed == 0 ? 0 : 1) : null, testMs, new JsonObject { ["passed"] = passed, ["failed"] = failed, ["skipped"] = skipped }));
stepOk["test"] = testsRan;
Say(stepOk["build"] ? $"{(failed == 0 && passed > 0 ? "✓" : "✗")} tests · {passed} passed, {failed} failed" : "✗ tests not run");

// ── 4 · the milestones and their checks ──
var milestones = new JsonArray();
string? commit = null; bool dirty = true;
foreach (var m in project["milestones"]!.AsArray())
{
    var checks = new JsonArray();
    bool ok = true;
    foreach (var ch in m!["checks"]!.AsArray())
    {
        string type = (string)ch!["type"]!;
        bool pass = false; string note = "";
        switch (type)
        {
            case "build": pass = stepOk["build"]; note = pass ? "builds" : "does not build"; break;
            case "tests":
            {
                var c = byClass.GetValueOrDefault((string)ch["class"]!);
                pass = stepOk["test"] && c.pass > 0 && c.fail == 0; note = $"{c.pass} passed, {c.fail} failed"; break;
            }
            case "package":
            {
                string file = Path.Combine(root, ((string)ch["project"]!).Replace('/', Path.DirectorySeparatorChar));
                pass = File.Exists(file) && XDocument.Load(file).Descendants().Any(x => x.Name.LocalName == "PackageReference" && string.Equals((string?)x.Attribute("Include"), (string?)ch["package"], StringComparison.OrdinalIgnoreCase));
                note = pass ? "references " + ch["package"] : "no reference to " + ch["package"]; break;
            }
            case "run":
            {
                if (!stepOk["build"]) { note = "not run: the build failed"; break; }
                var (_, so, se, _) = Run("dotnet", new[] { "run", "--project", Path.Combine(root, ((string)ch["project"]!).Replace('/', Path.DirectorySeparatorChar)), "--no-build", "-c", "Release" }, root, 30_000, (string?)ch["stdin"] ?? "");
                var lines = Norm(so).Split('\n').Select(l => l.TrimEnd()).ToList();
                var want = ch["contains"]!.AsArray().Select(x => (string)x!).ToList();
                var missing = want.Where(w => !lines.Contains(w)).ToList();
                pass = missing.Count == 0; note = pass ? "output as expected" : "missing: " + string.Join(" | ", missing);
                if (!pass && failures.Count < 20) failures.Add(new JsonObject { ["run"] = (string?)m["id"], ["message"] = Cap(note + (se.Length > 0 ? " · " + FirstLine(se) : "")) });
                break;
            }
            case "git":
            {
                var (hasHead, head, _, _) = Run("git", new[] { "rev-parse", "--verify", "HEAD" }, root, 30_000);
                var (st, porcelain, _, _) = Run("git", new[] { "status", "--porcelain" }, root, 30_000);
                var changes = Norm(porcelain).Split('\n').Where(l => l.Trim().Length > 0 && !l.Contains(".kurenai/out") && !l.Contains(".kurenai/reports")).ToList();
                commit = hasHead ? head.Trim() : null; dirty = !st || changes.Count > 0;
                pass = hasHead && !dirty; note = !hasHead ? "no commit yet" : dirty ? changes.Count + " uncommitted change(s)" : "committed, clean"; break;
            }
            default: note = "unknown check " + type; break;
        }
        ok &= pass;
        checks.Add(new JsonObject { ["type"] = type, ["ok"] = pass, ["note"] = note });
    }
    milestones.Add(new JsonObject { ["id"] = (string?)m["id"], ["ok"] = ok, ["checks"] = checks });
    Say($"{(ok ? "✓" : "✗")} {m["id"]} · {m["title"]}");
}

// ── 5 · the report ──
var report = new JsonObject
{
    ["schema"] = "kurenai.validation/1",
    ["project"] = new JsonObject { ["id"] = (string?)project["id"], ["scaffoldVersion"] = (int?)project["scaffoldVersion"] },
    ["validator"] = new JsonObject { ["version"] = Version, ["sha256"] = protectedFiles[".kurenai/validate.cs"]?.DeepClone() },
    ["env"] = new JsonObject { ["sdk"] = sdk, ["os"] = RuntimeInformation.OSDescription, ["arch"] = RuntimeInformation.OSArchitecture.ToString().ToLowerInvariant() },
    ["source"] = new JsonObject { ["treeSha256"] = TreeHash(root), ["gitCommit"] = commit, ["dirty"] = dirty },
    ["protected"] = new JsonObject { ["ok"] = mismatched.Count == 0, ["mismatched"] = mismatched, ["files"] = protectedFiles },
    ["steps"] = steps,
    ["milestones"] = milestones,
    ["failures"] = failures,
    ["startedAt"] = started.ToString("yyyy-MM-ddTHH:mm:ssZ"),
    ["finishedAt"] = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
    ["reportSha256"] = ""
};
string body = report.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
report["reportSha256"] = Sha256Text(body);
string reportsDir = Path.Combine(root, ".kurenai", "reports");
Directory.CreateDirectory(reportsDir);
string reportPath = Path.Combine(reportsDir, DateTime.UtcNow.ToString("yyyyMMdd-HHmmss") + ".json");
File.WriteAllText(reportPath, report.ToJsonString(new JsonSerializerOptions { WriteIndented = true }) + "\n");
bool all = milestones.All(m => (bool)m!["ok"]!) && stepOk.Values.All(v => v);
Say("");
Say($"{milestones.Count(m => (bool)m!["ok"]!)} of {milestones.Count} milestones pass. Report: {Path.GetRelativePath(root, reportPath)}");
Say("Import it in KurenaiOS: Code → " + project["title"] + " → Validation.");
return all ? 0 : 1;

// ───────────────────────── helpers ─────────────────────────
static string FindRoot(string from)
{
    for (var d = new DirectoryInfo(from); d != null; d = d.Parent)
        if (File.Exists(Path.Combine(d.FullName, "kurenai.project.json"))) return d.FullName;
    Console.Error.WriteLine("Run this from inside a Kurenai project (no kurenai.project.json found).");
    Environment.Exit(2); return "";
}
/* processes start with an argument list, never a shell string */
static (bool ok, string stdout, string stderr, long ms) Run(string file, string[] args, string cwd, int timeoutMs, string? stdin = null)
{
    var sw = Stopwatch.StartNew();
    try
    {
        var psi = new ProcessStartInfo(file) { WorkingDirectory = cwd, RedirectStandardOutput = true, RedirectStandardError = true, RedirectStandardInput = stdin != null, UseShellExecute = false };
        foreach (var a in args) psi.ArgumentList.Add(a);
        psi.Environment["DOTNET_CLI_TELEMETRY_OPTOUT"] = "1";
        psi.Environment["DOTNET_NOLOGO"] = "1";
        using var p = Process.Start(psi)!;
        var o = p.StandardOutput.ReadToEndAsync();
        var e = p.StandardError.ReadToEndAsync();
        if (stdin != null) { p.StandardInput.Write(stdin); p.StandardInput.Close(); }
        if (!p.WaitForExit(timeoutMs)) { try { p.Kill(true); } catch { } return (false, o.IsCompleted ? o.Result : "", "timed out after " + timeoutMs / 1000 + " s", sw.ElapsedMilliseconds); }
        p.WaitForExit();
        return (p.ExitCode == 0, o.Result, e.Result, sw.ElapsedMilliseconds);
    }
    catch (Exception ex) { return (false, "", ex.Message, sw.ElapsedMilliseconds); }
}
static JsonObject Step(string id, bool ran, int? exit, long ms, JsonObject? extra = null)
{
    var o = new JsonObject { ["id"] = id, ["ran"] = ran, ["exit"] = exit, ["ms"] = ran ? ms : 0 };
    if (extra != null) foreach (var (k, v) in extra) o[k] = v?.DeepClone();
    if (!ran) o["status"] = "not-run";
    return o;
}
static string Norm(string s) => s.Replace("\r\n", "\n").Replace('\r', '\n');
/* hashes are over text with normalised line endings, so a Windows checkout
   (CRLF) and a macOS one agree */
static string Sha256Text(string s) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(Norm(s)))).ToLowerInvariant();
static string TreeHash(string root)
{
    var sb = new StringBuilder();
    foreach (var dir in new[] { "src", "tests" })
    {
        string d = Path.Combine(root, dir);
        if (!Directory.Exists(d)) continue;
        foreach (var f in Directory.GetFiles(d, "*", SearchOption.AllDirectories)
            .Where(f => (f.EndsWith(".cs") || f.EndsWith(".csproj")) && !f.Contains(Path.DirectorySeparatorChar + "bin" + Path.DirectorySeparatorChar) && !f.Contains(Path.DirectorySeparatorChar + "obj" + Path.DirectorySeparatorChar))
            .Select(f => Path.GetRelativePath(root, f).Replace('\\', '/')).Order(StringComparer.Ordinal))
            sb.Append(f).Append('\n').Append(Sha256Text(File.ReadAllText(Path.Combine(root, f)))).Append('\n');
    }
    return Sha256Text(sb.ToString());
}
static string Cap(string? s) { s = (s ?? "").Trim(); return s.Length > 300 ? s[..300] + "…" : s; }
static string FirstLine(string s) => Norm(s).Split('\n').FirstOrDefault(l => l.Trim().Length > 0)?.Trim() ?? "";
static string LastErrorLine(string s) => Norm(s).Split('\n').LastOrDefault(l => l.Contains("error", StringComparison.OrdinalIgnoreCase))?.Trim() ?? "the build failed";
static void Say(string s) => Console.WriteLine(s);
