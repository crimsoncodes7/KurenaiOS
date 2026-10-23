#!/usr/bin/env node
/* tools/validator_check.mjs — Spike V (docs/code-plan.md §12.1): the Rider
   workflow end to end with the real .NET SDK. The scaffold is built by the
   app's own code (KOS.codeProject.files, as the export zips it), unpacked
   into a temporary folder, and the validator (assets/code/validator/
   validate.cs) runs four times:
     fresh     the untouched scaffold: it builds (m1), nothing else passes
     solved    the milestones done (code, the bug fix, the package, a Git
               commit): every milestone passes, exit 0
     tampered  a shipped test edited: protected.ok is false (practice only)
     broken    a compile error: the build fails, the tests are not run
   The solved, tampered and broken reports are saved to tools/fixtures/ for
   smoke78's import matrix. Then the unit 10 project (rp-u10-library) runs
   fresh (nothing passes) and solved (own tests, a Theory, five planted bugs
   caught, Renew test-first, an IClock, an INotifier, no warnings, a commit:
   m1–m6 pass), saved as tools/fixtures/library-report-solved.json; then
   capstone 4's project (rp-c4-planner) fresh and solved (m1–m5), saved as
   tools/fixtures/planner-report-solved.json. Needs the .NET 10 SDK, NuGet and git; outside
   the jsdom gate. macOS here; Windows and Linux are still to be run.
     node tools/validator_check.mjs                                          */
import { createRequire } from "module";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

global.window = global;
window.KOS_CONTENT = {}; window.KOS_DATA = {}; window.KOS = {};
for (const f of ["js/data/code.js", "js/data/content/code-ub.js", "js/data/content/code-u10.js", "js/data/content/code-c4.js", "js/data/content/code-projects-files.js", "js/core/codezip.js", "js/core/codeproj.js"]) require(path.join(ROOT, f));
const K = window.KOS_CODE;
window.KOS.code = { project: (id) => K.PROJECTS[id] || null };
window.KOS.codeProject._setValidator(fs.readFileSync(path.join(ROOT, "assets/code/validator/validate.cs"), "utf8"));

let files = await window.KOS.codeProject.files("rp-bridge-hello");
function fresh() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kos-validator-"));
  for (const [p, t] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true }); fs.writeFileSync(path.join(dir, p), t); }
  return dir;
}
const sh = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", timeout: 600000, env: Object.assign({}, process.env, { DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" }) });
function validate(dir) {
  const r = sh("dotnet", ["run", ".kurenai/validate.cs"], dir);
  const reps = fs.readdirSync(path.join(dir, ".kurenai/reports")).sort();
  const text = fs.readFileSync(path.join(dir, ".kurenai/reports", reps[reps.length - 1]), "utf8");
  return { exit: r.status, out: r.stdout, text, rep: JSON.parse(text) };
}
const ms = (rep) => rep.milestones.filter((m) => m.ok).map((m) => m.id).join(",");
let bad = 0;
const expect = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) bad++; };

let d = fresh(), v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "m1" && v.rep.protected.ok, "fresh: builds, only m1 passes, protected files match (" + ms(v.rep) + ")");

d = fresh();
fs.writeFileSync(path.join(d, "src/Greeter/Greetings.cs"), 'using Humanizer;\n\nnamespace Greeter;\n\npublic static class Greetings\n{\n    public static string For(string name, int hour)\n    {\n        string part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";\n        return $"Good {part}, {name}!";\n    }\n\n    public static string Describe(int hour)\n    {\n        int h = hour % 12 == 0 ? 12 : hour % 12;\n        return h.ToWords() + " o\'clock";\n    }\n}\n');
const prog = path.join(d, "src/Hello/Program.cs");
fs.writeFileSync(prog, fs.readFileSync(prog, "utf8").replace("Greetings.For(name, shown)", "Greetings.For(name, hour)"));
sh("dotnet", ["add", "src/Greeter/Greeter.csproj", "package", "Humanizer.Core", "--version", "3.0.10"], d);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "Hello, Kurenai"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4,m5" && v.rep.source.gitCommit && !v.rep.source.dirty, "solved: every milestone passes, exit 0, committed and clean (" + ms(v.rep) + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/bridge-report-solved.json"), v.text);

fs.appendFileSync(path.join(d, "tests/Hello.Acceptance/Milestone2.cs"), "// changed\n");
v = validate(d);
expect(!v.rep.protected.ok && v.rep.protected.mismatched.includes("tests/Hello.Acceptance/Milestone2.cs"), "tampered: the changed test is reported, protected.ok false");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/bridge-report-tampered.json"), v.text);
sh("git", ["checkout", "-q", "tests/Hello.Acceptance/Milestone2.cs"], d);

const g = path.join(d, "src/Greeter/Greetings.cs");
fs.writeFileSync(g, fs.readFileSync(g, "utf8").replace("{name}!", "{nam}!"));
v = validate(d);
const build = v.rep.steps.find((s) => s.id === "build"), test = v.rep.steps.find((s) => s.id === "test");
expect(build.errors === 1 && v.rep.failures[0].build === "CS0103" && !test.ran && test.status === "not-run", "broken: CS0103 from SARIF, tests not run");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/bridge-report-broken.json"), v.text);

/* ---------------- the unit 10 project ---------------- */
let put;
files = await window.KOS.codeProject.files("rp-u10-library");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "library fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");

d = fresh();
put = (p, t) => { fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true }); fs.writeFileSync(path.join(d, p), t); };
put("src/Library/LateFees.cs", `namespace Library;

/// <summary>Late fees: two days' grace for a book, then 25p a day; a DVD £1 a day; at most £10; damage adds £5.</summary>
public class LateFees(IClock clock)
{
    public LateFees() : this(new SystemClock()) { }

    public decimal Calculate(Loan loan)
    {
        int d = clock.Today.DayNumber - loan.Due.DayNumber;
        if (d <= 0) return 0;
        decimal f;
        if (loan.Kind == "dvd")
        {
            f = d * 1.00m;
        }
        else
        {
            if (d <= 2) return 0;
            f = (d - 2) * 0.25m;
        }
        if (f > 10m) f = 10m;
        if (loan.Damaged) f += 5m;
        return f;
    }
}
`);
put("src/Library/Loan.cs", `namespace Library;

/// <summary>One book or DVD out on loan.</summary>
public record Loan(string Title, string Kind, DateOnly Due, bool Damaged = false, int Renewals = 0)
{
    /// <summary>Renew for 14 more days: at most twice, and never once overdue.</summary>
    public Loan Renew(DateOnly today)
    {
        if (Due < today) throw new InvalidOperationException("An overdue loan cannot be renewed.");
        if (Renewals >= 2) throw new InvalidOperationException("Two renewals is the limit.");
        return this with { Due = Due.AddDays(14), Renewals = Renewals + 1 };
    }
}
`);
put("src/Library/Reminders.cs", `namespace Library;

public class Reminders(INotifier notifier)
{
    public int SendOverdue(IEnumerable<(string Email, Loan Loan)> loans, DateOnly today)
    {
        int sent = 0;
        foreach (var x in loans)
        {
            if (x.Loan.Due < today)
            {
                notifier.Send(x.Email, $"\\"{x.Loan.Title}\\" was due on {x.Loan.Due:yyyy-MM-dd}.");
                sent++;
            }
        }
        return sent;
    }
}
`);
put("tests/Library.Tests/LateFeesTests.cs", `namespace Library.Tests;

public class LateFeesTests
{
    sealed class FixedClock(DateOnly today) : IClock
    {
        public DateOnly Today => today;
    }

    static readonly DateOnly Today = new(2026, 3, 10);
    static decimal Fee(string kind, int daysLate, bool damaged = false) =>
        new LateFees(new FixedClock(Today)).Calculate(new Loan("X", kind, Today.AddDays(-daysLate), damaged));

    [Theory]
    [InlineData("book", 2, 0)]
    [InlineData("book", 3, 0.25)]
    [InlineData("book", 10, 2.00)]
    [InlineData("dvd", 3, 3.00)]
    [InlineData("dvd", 40, 10.00)]
    public void Fees_by_kind_and_days_late(string kind, int daysLate, double expected) =>
        Assert.Equal((decimal)expected, Fee(kind, daysLate));

    [Fact]
    public void Damage_adds_five_pounds() => Assert.Equal(5.75m, Fee("book", 5, damaged: true));

    [Fact]
    public void Damage_inside_the_grace_days_costs_nothing() => Assert.Equal(0m, Fee("book", 2, damaged: true));
}
`);
put("tests/Library.Tests/LoanTests.cs", `namespace Library.Tests;

public class LoanTests
{
    static readonly DateOnly Today = new(2026, 3, 10);

    [Fact]
    public void Renew_adds_fourteen_days() =>
        Assert.Equal(Today.AddDays(14), new Loan("Dune", "book", Today).Renew(Today).Due);

    [Fact]
    public void Renew_refuses_a_third_time() =>
        Assert.Throws<InvalidOperationException>(() => new Loan("Dune", "book", Today, Renewals: 2).Renew(Today));
}
`);
put("tests/Library.Tests/RemindersTests.cs", `namespace Library.Tests;

public class RemindersTests
{
    sealed class FakeNotifier : INotifier
    {
        public int Count { get; private set; }
        public void Send(string to, string text) => Count++;
    }

    [Fact]
    public void Only_overdue_loans_are_sent()
    {
        var fake = new FakeNotifier();
        var today = new DateOnly(2026, 3, 10);
        new Reminders(fake).SendOverdue(new[] { ("a@x.test", new Loan("A", "book", today.AddDays(-1))), ("b@x.test", new Loan("B", "book", today)) }, today);
        Assert.Equal(1, fake.Count);
    }
}
`);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "Tests first, then a clock and a notifier"], d);
v = validate(d);
const m2 = v.rep.milestones.find((m) => m.id === "m2");
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4,m5,m6" && v.rep.protected.ok, "library solved: every milestone passes, exit 0 (" + ms(v.rep) + "; m2 " + (m2 && m2.checks.map((c) => c.note).join(" · ")) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-40).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/library-report-solved.json"), v.text);

const lt = path.join(d, "tests/Library.Tests/LateFeesTests.cs");
fs.writeFileSync(lt, fs.readFileSync(lt, "utf8").replace(/\n    \[Fact\]\n    public void Damage[^\n]*\n/g, "\n"));
v = validate(d);
const weak = v.rep.milestones.find((m) => m.id === "m2");
expect(!weak.ok && ms(v.rep).includes("m1") && /3 of 5/.test(weak.checks[0].note), "library weak tests: without the damage tests only 3 of 5 bugs are caught, m2 fails (" + weak.checks[0].note + ")");

/* ---------------- capstone 4: the Revision Planner ---------------- */
files = await window.KOS.codeProject.files("rp-c4-planner");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "planner fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");

d = fresh();
put("src/Planner.Core/StudyPlanner.cs", String.raw`namespace Planner.Core;

/// <summary>The service: add topics, rate them, and ask what to study next.</summary>
public class StudyPlanner(ITopicStore store, IClock clock)
{
    public async Task<Topic> AddAsync(string subject, string name, CancellationToken ct = default)
    {
        subject = subject.Trim().ToLowerInvariant();
        name = name.Trim();
        if (name.Length == 0) throw new ArgumentException("A topic needs a name.", nameof(name));
        var topics = await store.LoadAsync(ct);
        if (topics.Any(t => t.Subject == subject && string.Equals(t.Name, name, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException($"{subject} already has {name}.");
        var topic = new Topic(topics.Count == 0 ? 1 : topics.Max(t => t.Id) + 1, subject, name);
        topics.Add(topic);
        await store.SaveAsync(topics, ct);
        return topic;
    }

    public async Task<Topic> RateAsync(int id, int confidence, CancellationToken ct = default)
    {
        if (confidence < 1 || confidence > 5) throw new ArgumentOutOfRangeException(nameof(confidence), "Confidence runs from 1 to 5.");
        var topics = await store.LoadAsync(ct);
        int i = topics.FindIndex(t => t.Id == id);
        if (i < 0) throw new KeyNotFoundException($"No topic #{id}.");
        topics[i] = topics[i] with { Confidence = confidence, LastStudied = clock.Today };
        await store.SaveAsync(topics, ct);
        return topics[i];
    }

    public async Task<IReadOnlyList<Topic>> NextAsync(int n, CancellationToken ct = default)
    {
        if (n < 1) throw new ArgumentOutOfRangeException(nameof(n), "Ask for at least one topic.");
        var queue = new PriorityQueue<Topic, (int Score, string Name)>(Comparer<(int Score, string Name)>.Create((a, b) =>
            a.Score != b.Score ? a.Score.CompareTo(b.Score) : string.CompareOrdinal(a.Name, b.Name)));
        foreach (var t in await store.LoadAsync(ct)) queue.Enqueue(t, (Priority.Score(t, clock.Today), t.Name));
        var next = new List<Topic>();
        while (next.Count < n && queue.TryDequeue(out var t, out _)) next.Add(t);
        return next;
    }
}
`);
put("src/Planner.Storage/JsonTopicStore.cs", String.raw`using System.Text.Json;
using Planner.Core;

namespace Planner.Storage;

/// <summary>Keeps the topics in one JSON file.</summary>
public class JsonTopicStore(string filePath) : ITopicStore
{
    public string FilePath { get; } = filePath;

    public async Task<List<Topic>> LoadAsync(CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        if (!File.Exists(FilePath)) return new List<Topic>();
        await using var stream = File.OpenRead(FilePath);
        try
        {
            return await JsonSerializer.DeserializeAsync<List<Topic>>(stream, cancellationToken: ct) ?? new List<Topic>();
        }
        catch (JsonException e)
        {
            throw new InvalidDataException($"{FilePath} is not a topics file.", e);
        }
    }

    public async Task SaveAsync(IReadOnlyList<Topic> topics, CancellationToken ct = default)
    {
        string? dir = Path.GetDirectoryName(Path.GetFullPath(FilePath));
        if (dir is not null) Directory.CreateDirectory(dir);
        string temp = FilePath + ".tmp";
        await using (var stream = File.Create(temp))
            await JsonSerializer.SerializeAsync(stream, topics, cancellationToken: ct);
        File.Move(temp, FilePath, overwrite: true);
    }
}
`);
put("src/Planner.Cli/Program.cs", String.raw`using Planner.Core;
using Planner.Storage;

var store = new JsonTopicStore(Path.Combine("planner-data", "topics.json"));
var planner = new StudyPlanner(store, new SystemClock());

string? line;
while ((line = Console.ReadLine()) is not null)
{
    string[] words = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    if (words.Length == 0) continue;
    try
    {
        switch (words[0].ToLowerInvariant())
        {
            case "clear":
                await store.SaveAsync(Array.Empty<Topic>());
                Console.WriteLine("Cleared.");
                break;
            case "add" when words.Length >= 3:
                var added = await planner.AddAsync(words[1], string.Join(' ', words[2..]));
                Console.WriteLine($"Added #{added.Id} {added.Subject}: {added.Name}");
                break;
            case "rate" when words.Length == 3:
                var rated = await planner.RateAsync(int.Parse(words[1]), int.Parse(words[2]));
                Console.WriteLine($"Rated #{rated.Id}: {rated.Confidence}");
                break;
            case "next" when words.Length == 2:
                var next = await planner.NextAsync(int.Parse(words[1]));
                if (next.Count == 0) Console.WriteLine("Nothing to study.");
                for (int i = 0; i < next.Count; i++) Console.WriteLine($"{i + 1}. #{next[i].Id} {next[i].Subject}: {next[i].Name} (confidence {next[i].Confidence})");
                break;
            case "list":
                var all = await store.LoadAsync();
                if (all.Count == 0) Console.WriteLine("No topics yet.");
                foreach (var t in all.OrderBy(t => t.Id)) Console.WriteLine($"#{t.Id} {t.Subject}: {t.Name} (confidence {t.Confidence})");
                break;
            case "help":
                Console.WriteLine("Commands: clear, add <subject> <name>, rate <id> <1-5>, next <n>, list, help, quit");
                break;
            case "quit":
                Console.WriteLine("Bye.");
                return;
            default:
                Console.WriteLine($"Unknown command: {words[0]}");
                break;
        }
    }
    catch (Exception e) when (e is ArgumentException or InvalidOperationException or KeyNotFoundException or FormatException or InvalidDataException)
    {
        Console.WriteLine("Error: " + e.Message);
    }
}
`);
put("tests/Planner.Tests/PriorityTests.cs", String.raw`using Planner.Core;

namespace Planner.Tests;

public class PriorityTests
{
    static readonly DateOnly Today = new(2026, 5, 1);

    [Theory]
    [InlineData(1, 0, 100)]
    [InlineData(2, 3, 197)]
    [InlineData(5, 30, 470)]
    [InlineData(3, 45, 270)]
    public void Score_is_confidence_times_100_minus_days(int confidence, int daysAgo, int expected) =>
        Assert.Equal(expected, Priority.Score(new Topic(1, "cs", "X", confidence, Today.AddDays(-daysAgo)), Today));

    [Fact]
    public void Never_studied_counts_as_thirty_days() =>
        Assert.Equal(170, Priority.Score(new Topic(1, "cs", "X", 2), Today));

    [Fact]
    public void Confidence_outweighs_a_month_of_days() =>
        Assert.True(Priority.Score(new Topic(1, "cs", "X", 1, Today), Today) < Priority.Score(new Topic(2, "cs", "Y", 2), Today));
}
`);
put("tests/Planner.Tests/PlannerTests.cs", String.raw`using Planner.Core;
using Planner.Storage;

namespace Planner.Tests;

public class PlannerTests
{
    sealed class FixedClock(DateOnly today) : IClock { public DateOnly Today => today; }
    sealed class MemoryStore : ITopicStore
    {
        List<Topic> saved = new();
        public Task<List<Topic>> LoadAsync(CancellationToken ct = default) => Task.FromResult(new List<Topic>(saved));
        public Task SaveAsync(IReadOnlyList<Topic> topics, CancellationToken ct = default) { saved = new List<Topic>(topics); return Task.CompletedTask; }
    }
    static StudyPlanner Make() => new(new MemoryStore(), new FixedClock(new DateOnly(2026, 5, 1)));

    [Fact]
    public async Task Ids_count_up_from_one() => Assert.Equal(2, (await AddTwo()).Id);
    static async Task<Topic> AddTwo() { var p = Make(); await p.AddAsync("cs", "A"); return await p.AddAsync("cs", "B"); }

    [Fact]
    public async Task A_repeat_name_is_refused()
    {
        var p = Make();
        await p.AddAsync("cs", "Big O");
        await Assert.ThrowsAsync<InvalidOperationException>(() => p.AddAsync("CS", "BIG O"));
    }

    [Fact]
    public async Task Rating_six_is_refused()
    {
        var p = Make();
        await p.AddAsync("cs", "Big O");
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => p.RateAsync(1, 6));
    }

    [Fact]
    public async Task Next_puts_the_shakiest_first()
    {
        var p = Make();
        await p.AddAsync("cs", "Solid");
        await p.AddAsync("cs", "Shaky");
        await p.RateAsync(1, 5);
        Assert.Equal("Shaky", (await p.NextAsync(1))[0].Name);
    }

    [Fact]
    public async Task The_json_store_round_trips()
    {
        string file = Path.Combine(Path.GetTempPath(), "kos-" + Guid.NewGuid().ToString("N"), "t.json");
        var topics = new[] { new Topic(1, "cs", "Big O", 2, new DateOnly(2026, 4, 1)) };
        await new JsonTopicStore(file).SaveAsync(topics);
        Assert.Equal(topics, await new JsonTopicStore(file).LoadAsync());
    }
}
`);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "The revision planner"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4,m5" && v.rep.protected.ok, "planner solved: every milestone passes, exit 0 (" + ms(v.rep) + "; m1 " + v.rep.milestones[0].checks.map((c) => c.note).join(" · ") + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/planner-report-solved.json"), v.text);

console.log(bad ? "✗ " + bad + " check(s) failed" : "✓ the validator behaves on every scenario");
process.exit(bad ? 1 : 0);
