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
   tools/fixtures/planner-report-solved.json; then T1B's project
   (rp-t1b-contacts) fresh, solved (m1–m4, contacts-report-solved.json)
   and with its search glued together (m2 fails); then T1C's project
   (rp-t1c-library) fresh, solved with a real dotnet ef migration (m1–m7,
   efcore-report-solved.json), with its N+1 put back (m6 fails) and with a
   model change left unmigrated (m3 fails); then T2A's taster
   (rp-t2a-window, Avalonia driven headless) fresh, solved (m1–m4,
   window-report-solved.json), and with the bill box unwired and fixed at
   500px (m3 and m2 fail); then the rest of T2, each fresh, solved and with
   one planted mistake: The Reading List (a Book without change
   notification, m4), Markdown notes (a Click handler and stale files, m2
   and m3), Focus timer (the real clock instead of the injected one, m2)
   and the capstone, The Planner on the desktop (a fixed layout and no
   publish profile, m4 and m5). Needs the .NET 10 SDK, NuGet and git; outside
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
for (const f of ["js/data/code.js", "js/data/content/code-ub.js", "js/data/content/code-u10.js", "js/data/content/code-c4.js", "js/data/content/code-t1b.js", "js/data/content/code-t1c.js", "js/data/content/code-t1d.js", "js/data/content/code-t1e.js", "js/data/content/code-t1f.js", "js/data/content/code-t2a.js", "js/data/content/code-t2b.js", "js/data/content/code-t2c.js", "js/data/content/code-t2d.js", "js/data/content/code-t2e.js", "js/data/content/code-projects-files.js", "js/core/codezip.js", "js/core/codeproj.js"]) require(path.join(ROOT, f));
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
  const rd = path.join(dir, ".kurenai/reports"), before = fs.existsSync(rd) ? fs.readdirSync(rd).length : 0;
  const r = sh("dotnet", ["run", ".kurenai/validate.cs"], dir);
  /* a run killed before it wrote its report must not be read as the last one */
  if (!fs.existsSync(rd) || fs.readdirSync(rd).length <= before) throw new Error("the validator wrote no report (" + (r.error ? r.error.message : "exit " + r.status) + ") in " + dir);
  const reps = fs.readdirSync(rd).sort();
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

/* ---------------- T1B: Contacts on SQLite ---------------- */
files = await window.KOS.codeProject.files("rp-t1b-contacts");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "contacts fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");

d = fresh();
put("src/Contacts/SqliteContactRepository.cs", String.raw`using Microsoft.Data.Sqlite;

namespace Contacts;

/// <summary>The contacts in one SQLite file.</summary>
public class SqliteContactRepository : IContactRepository
{
    private readonly string connectionString;

    public SqliteContactRepository(string databasePath)
    {
        connectionString = new SqliteConnectionStringBuilder { DataSource = databasePath, Pooling = false }.ToString();
        using var connection = Open();
        var create = connection.CreateCommand();
        create.CommandText = "CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY, name TEXT NOT NULL CHECK (name <> ''), email TEXT UNIQUE)";
        create.ExecuteNonQuery();
    }

    public Contact Add(string name, string? email)
    {
        name = name.Trim();
        if (name.Length == 0) throw new ArgumentException("A contact needs a name.", nameof(name));
        using var connection = Open();
        var cmd = connection.CreateCommand();
        cmd.CommandText = "INSERT INTO contacts (name, email) VALUES ($name, $email) RETURNING id";
        cmd.Parameters.AddWithValue("$name", name);
        cmd.Parameters.AddWithValue("$email", (object?)email ?? DBNull.Value);
        long id = (long)cmd.ExecuteScalar()!;
        return new Contact(id, name, email);
    }

    public IReadOnlyList<Contact> All() => Query("SELECT id, name, email FROM contacts ORDER BY id", null);

    public IReadOnlyList<Contact> FindByName(string text) =>
        Query("SELECT id, name, email FROM contacts WHERE lower(name) LIKE '%' || lower($text) || '%' ORDER BY name", text);

    public int Import(IEnumerable<(string Name, string? Email)> contacts)
    {
        using var connection = Open();
        using var tx = connection.BeginTransaction();
        var cmd = connection.CreateCommand();
        cmd.Transaction = tx;
        cmd.CommandText = "INSERT INTO contacts (name, email) VALUES ($name, $email)";
        var pName = cmd.Parameters.Add("$name", SqliteType.Text);
        var pEmail = cmd.Parameters.Add("$email", SqliteType.Text);
        int added = 0;
        foreach (var (name, email) in contacts)
        {
            pName.Value = name.Trim();
            pEmail.Value = (object?)email ?? DBNull.Value;
            added += cmd.ExecuteNonQuery();
        }
        tx.Commit();
        return added;
    }

    public void Clear()
    {
        using var connection = Open();
        var cmd = connection.CreateCommand();
        cmd.CommandText = "DELETE FROM contacts";
        cmd.ExecuteNonQuery();
    }

    private IReadOnlyList<Contact> Query(string sql, string? text)
    {
        using var connection = Open();
        var cmd = connection.CreateCommand();
        cmd.CommandText = sql;
        if (text is not null) cmd.Parameters.AddWithValue("$text", text);
        var list = new List<Contact>();
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add(new Contact(r.GetInt64(0), r.GetString(1), r.IsDBNull(2) ? null : r.GetString(2)));
        return list;
    }

    private SqliteConnection Open()
    {
        var connection = new SqliteConnection(connectionString);
        connection.Open();
        return connection;
    }
}
`);
put("src/Contacts.Cli/Program.cs", String.raw`using Contacts;

Directory.CreateDirectory("contacts-data");
IContactRepository contacts = new SqliteContactRepository(Path.Combine("contacts-data", "contacts.db"));

static string Line(Contact c) => c.Email is null ? $"#{c.Id} {c.Name}" : $"#{c.Id} {c.Name} <{c.Email}>";

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
                contacts.Clear();
                Console.WriteLine("Cleared.");
                break;
            case "add" when words.Length >= 3:
                var added = contacts.Add(string.Join(' ', words[2..]), words[1] == "-" ? null : words[1]);
                Console.WriteLine($"Added #{added.Id} {added.Name}");
                break;
            case "list":
                var all = contacts.All();
                if (all.Count == 0) Console.WriteLine("No contacts.");
                foreach (var c in all) Console.WriteLine(Line(c));
                break;
            case "find" when words.Length >= 2:
                var found = contacts.FindByName(string.Join(' ', words[1..]));
                if (found.Count == 0) Console.WriteLine("No match.");
                foreach (var c in found) Console.WriteLine(Line(c));
                break;
            case "help":
                Console.WriteLine("Commands: clear, add <email|-> <name>, list, find <text>, help, quit");
                break;
            case "quit":
                Console.WriteLine("Bye.");
                return;
            default:
                Console.WriteLine($"Unknown command: {words[0]}");
                break;
        }
    }
    catch (Exception e) when (e is ArgumentException or Microsoft.Data.Sqlite.SqliteException)
    {
        Console.WriteLine("Error: " + e.Message);
    }
}
`);
put("src/Contacts.Cli/Contacts.Cli.csproj", fs.readFileSync(path.join(d, "src/Contacts.Cli/Contacts.Cli.csproj"), "utf8").replace("</Project>", "  <ItemGroup>\n    <PackageReference Include=\"Microsoft.Data.Sqlite\" Version=\"10.0.5\" />\n    <PackageReference Include=\"SQLitePCLRaw.bundle_e_sqlite3\" Version=\"2.1.13\" />\n  </ItemGroup>\n</Project>"));
put("tests/Contacts.Tests/RepositoryTests.cs", String.raw`namespace Contacts.Tests;

public class RepositoryTests : IDisposable
{
    readonly string file = Path.Combine(Path.GetTempPath(), "kos-ct-" + Guid.NewGuid().ToString("N") + ".db");
    public void Dispose() { if (File.Exists(file)) File.Delete(file); }
    SqliteContactRepository Repo() => new(file);

    [Fact]
    public void Add_trims_the_name() => Assert.Equal("Ann", Repo().Add("  Ann ", null).Name);

    [Fact]
    public void Find_ignores_case() => Assert.Single(With("Ann Lee", "Bob").FindByName("LEE"));

    [Fact]
    public void Find_with_nothing_matching_is_empty() => Assert.Empty(With("Ann").FindByName("zz"));

    [Fact]
    public void Import_with_a_repeated_email_keeps_nothing()
    {
        var r = Repo();
        Assert.ThrowsAny<Exception>(() => r.Import(new (string, string?)[] { ("A", "a@x"), ("B", "a@x") }));
        Assert.Empty(r.All());
    }

    [Fact]
    public void Clear_removes_everything()
    {
        var r = With("A", "B");
        r.Clear();
        Assert.Empty(r.All());
    }

    SqliteContactRepository With(params string[] names) { var r = Repo(); foreach (var n in names) r.Add(n, null); return r; }
}
`);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "Contacts on SQLite"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4" && v.rep.protected.ok, "contacts solved: every milestone passes, exit 0 (" + ms(v.rep) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/contacts-report-solved.json"), v.text);

const repo = path.join(d, "src/Contacts/SqliteContactRepository.cs");
fs.writeFileSync(repo, fs.readFileSync(repo, "utf8").replace(`"SELECT id, name, email FROM contacts WHERE lower(name) LIKE '%' || lower($text) || '%' ORDER BY name", text`, `"SELECT id, name, email FROM contacts WHERE lower(name) LIKE '%" + text.ToLowerInvariant() + "%' ORDER BY name", null`));
v = validate(d);
const m2c = v.rep.milestones.find((m) => m.id === "m2");
expect(!m2c.ok, "contacts glued SQL: m2 fails (" + m2c.checks.map((c) => c.note).join(" · ") + ")");

/* ---------------- T1C: The Lending Library on EF Core ---------------- */
files = await window.KOS.codeProject.files("rp-t1c-library");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "efcore fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");

d = fresh();
put = (p, t) => { fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true }); fs.writeFileSync(path.join(d, p), t); };
const slowMembers = fs.readFileSync(path.join(d, "src/Library.Data/LibraryService.cs"), "utf8").match(/    public IReadOnlyList<MemberSummary> Members\(\)\n    \{[\s\S]*?\n    \}\n/)[0];
put("src/Library.Data/LibraryService.cs", String.raw`using Microsoft.EntityFrameworkCore;

namespace Library;

/// <summary>Everything the library does, over one LibraryContext.</summary>
public class LibraryService(LibraryContext db)
{
    public Book AddBook(string title, string author, int year)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("A book needs a title.", nameof(title));
        var book = new Book { Title = title.Trim(), Author = author.Trim(), Year = year };
        db.Books.Add(book);
        db.SaveChanges();
        return book;
    }

    public Member AddMember(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("A member needs a name.", nameof(name));
        var member = new Member { Name = name.Trim() };
        db.Members.Add(member);
        db.SaveChanges();
        return member;
    }

    public IReadOnlyList<Book> Shelf() => db.Books.AsNoTracking().OrderBy(b => b.Title).ThenBy(b => b.Year).ToList();

    public IReadOnlyList<Book> ByAuthor(string author) =>
        db.Books.AsNoTracking().Where(b => b.Author == author).OrderBy(b => b.Year).ToList();

    public IReadOnlyList<Book> Search(string text) =>
        db.Books.AsNoTracking().Where(b => EF.Functions.Like(b.Title, "%" + text + "%")).OrderBy(b => b.Title).ToList();

    public int CountOnLoan() => db.Loans.Count(l => l.Returned == null);

    public IReadOnlyList<(string Author, int Books)> BooksPerAuthor() =>
        db.Books.GroupBy(b => b.Author)
            .Select(g => new { Author = g.Key, Books = g.Count() })
            .OrderByDescending(r => r.Books).ThenBy(r => r.Author)
            .ToList()
            .Select(r => (r.Author, r.Books)).ToList();

    public Loan Lend(int bookId, int memberId, DateOnly today)
    {
        if (!db.Books.Any(b => b.Id == bookId)) throw new InvalidOperationException($"There is no book #{bookId}.");
        if (!db.Members.Any(m => m.Id == memberId)) throw new InvalidOperationException($"There is no member #{memberId}.");
        if (db.Loans.Any(l => l.BookId == bookId && l.Returned == null)) throw new InvalidOperationException($"Book #{bookId} is already out.");
        var loan = new Loan { BookId = bookId, MemberId = memberId, Out = today, Due = today.AddDays(14) };
        db.Loans.Add(loan);
        db.SaveChanges();
        return loan;
    }

    public void Return(int loanId, DateOnly today)
    {
        var loan = db.Loans.SingleOrDefault(l => l.Id == loanId) ?? throw new InvalidOperationException($"There is no loan #{loanId}.");
        loan.Returned = today;
        db.SaveChanges();
    }

    public IReadOnlyList<OverdueLoan> Overdue(DateOnly today) =>
        db.Loans.Where(l => l.Returned == null && l.Due < today)
            .OrderBy(l => l.Due)
            .Select(l => new { l.Book.Title, l.Member.Name, l.Due })
            .ToList()
            .Select(l => new OverdueLoan(l.Title, l.Name, l.Due, today.DayNumber - l.Due.DayNumber)).ToList();

    public void Rename(int bookId, string title)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("A book needs a title.", nameof(title));
        var book = db.Books.SingleOrDefault(b => b.Id == bookId) ?? throw new InvalidOperationException($"There is no book #{bookId}.");
        book.Title = title.Trim();
        db.SaveChanges();
    }

    public IReadOnlyList<MemberSummary> Members() =>
        db.Members.OrderBy(m => m.Name)
            .Select(m => new MemberSummary(m.Name, m.Loans.Count, m.Loans.Count(l => l.Returned == null)))
            .ToList();
}
`);
put("src/Library.Data/LibraryContext.cs", String.raw`using Microsoft.EntityFrameworkCore;

namespace Library;

/// <summary>The session with the database: one DbSet per table.</summary>
public class LibraryContext(DbContextOptions<LibraryContext> options) : DbContext(options)
{
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Loan> Loans => Set<Loan>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Book>().Property(b => b.Title).IsRequired().HasMaxLength(200);
        model.Entity<Loan>().HasOne(l => l.Book).WithMany(b => b.Loans).HasForeignKey(l => l.BookId).OnDelete(DeleteBehavior.Restrict);
        model.Entity<Loan>().HasOne(l => l.Member).WithMany(m => m.Loans).HasForeignKey(l => l.MemberId).OnDelete(DeleteBehavior.Restrict);
    }
}
`);
put("tests/Library.Tests/ServiceTests.cs", String.raw`using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Library.Tests;

public class ServiceTests : IDisposable
{
    readonly SqliteConnection connection = new("Data Source=:memory:");
    readonly DbContextOptions<LibraryContext> options;

    public ServiceTests()
    {
        connection.Open();
        options = new DbContextOptionsBuilder<LibraryContext>().UseSqlite(connection).Options;
        using var c = new LibraryContext(options);
        c.Database.EnsureCreated();
    }

    public void Dispose() => connection.Dispose();
    LibraryService Service() => new(new LibraryContext(options));

    [Fact]
    public void A_book_keeps_its_author_and_year()
    {
        var b = Service().AddBook("Dune", " Frank Herbert ", 1965);
        Assert.Equal(("Frank Herbert", 1965), (b.Author, b.Year));
    }

    [Fact]
    public void Search_with_nothing_matching_is_empty()
    {
        Service().AddBook("Dune", "Frank Herbert", 1965);
        Assert.Empty(Service().Search("emma"));
    }

    [Fact]
    public void A_returned_loan_is_not_on_loan()
    {
        var s = Service();
        s.AddBook("Dune", "Frank Herbert", 1965);
        s.AddMember("Ann");
        var loan = s.Lend(1, 1, new DateOnly(2026, 9, 1));
        s.Return(loan.Id, new DateOnly(2026, 9, 2));
        Assert.Equal(0, Service().CountOnLoan());
    }

    [Fact]
    public void Nothing_is_overdue_on_the_due_date()
    {
        var s = Service();
        s.AddBook("Dune", "Frank Herbert", 1965);
        s.AddMember("Ann");
        s.Lend(1, 1, new DateOnly(2026, 9, 1));
        Assert.Empty(Service().Overdue(new DateOnly(2026, 9, 15)));
    }

    [Fact]
    public void Renaming_a_missing_book_is_refused() =>
        Assert.Throws<InvalidOperationException>(() => Service().Rename(42, "Nothing"));
}
`);
sh("dotnet", ["tool", "restore"], d);
sh("dotnet", ["build", "-nologo", "-v", "q"], d);
const mig = sh("dotnet", ["ef", "migrations", "add", "Initial", "--project", "src/Library.Data"], d);
expect(mig.status === 0 && fs.readdirSync(path.join(d, "src/Library.Data/Migrations")).some((f) => /_Initial\.cs$/.test(f)), "efcore: dotnet ef (restored from the manifest) adds the first migration");
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "The Lending Library on EF Core"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4,m5,m6,m7" && v.rep.protected.ok, "efcore solved: every milestone passes, exit 0 (" + ms(v.rep) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/efcore-report-solved.json"), v.text);

const svc = path.join(d, "src/Library.Data/LibraryService.cs"), ctx = path.join(d, "src/Library.Data/LibraryContext.cs");
const fast = fs.readFileSync(svc, "utf8");
fs.writeFileSync(svc, fast.replace(/    public IReadOnlyList<MemberSummary> Members\(\) =>[\s\S]*?\.ToList\(\);\n/, slowMembers));
fs.writeFileSync(ctx, fs.readFileSync(ctx, "utf8").replace("OnDelete(DeleteBehavior.Restrict);\n    }", "OnDelete(DeleteBehavior.Restrict);\n        model.Entity<Loan>().HasIndex(l => l.Due);\n    }"));
v = validate(d);
const byId = (id) => v.rep.milestones.find((m) => m.id === id);
expect(!byId("m6").ok && byId("m5").ok, "efcore N+1 put back: m6 fails, m5 still passes (" + byId("m6").checks.map((c) => c.note).join(" · ") + ")");
expect(!byId("m3").ok, "efcore model changed with no migration: m3 fails (" + byId("m3").checks.map((c) => c.note).join(" · ") + ")");

/* ---------------- T2A: Your first window (Avalonia, headless) ---------------- */
files = await window.KOS.codeProject.files("rp-t2a-window");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "window fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");

d = fresh();
put = (p, t) => { fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true }); fs.writeFileSync(path.join(d, p), t); };
put("src/Tips/MainWindow.axaml", String.raw`<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="Tips.MainWindow"
        Title="Tip calculator" Width="420" Height="360">
    <Grid Margin="16" ColumnDefinitions="Auto,*" RowDefinitions="Auto,Auto,Auto,Auto,Auto,Auto,Auto,Auto"
          ColumnSpacing="12" RowSpacing="8">
        <Label Grid.Row="0" Content="_Bill (£)" Target="{Binding #BillBox}" VerticalAlignment="Center" />
        <TextBox Grid.Row="0" Grid.Column="1" x:Name="BillBox" PlaceholderText="42.50" />

        <Label Grid.Row="1" Content="_People" Target="{Binding #PeopleBox}" VerticalAlignment="Center" />
        <TextBox Grid.Row="1" Grid.Column="1" x:Name="PeopleBox" Text="1" />

        <TextBlock Grid.Row="2" Text="Tip" VerticalAlignment="Center" />
        <WrapPanel Grid.Row="2" Grid.Column="1">
            <RadioButton x:Name="Tip10" GroupName="Tip" Content="10%" Margin="0,0,12,0" />
            <RadioButton x:Name="Tip15" GroupName="Tip" Content="15%" IsChecked="True" Margin="0,0,12,0" />
            <RadioButton x:Name="Tip20" GroupName="Tip" Content="20%" />
        </WrapPanel>

        <TextBlock Grid.Row="3" Text="Tip" />
        <TextBlock Grid.Row="3" Grid.Column="1" x:Name="TipText" Text="—" />
        <TextBlock Grid.Row="4" Text="Total" />
        <TextBlock Grid.Row="4" Grid.Column="1" x:Name="TotalText" Text="—" FontWeight="SemiBold" />
        <TextBlock Grid.Row="5" Text="Each" />
        <TextBlock Grid.Row="5" Grid.Column="1" x:Name="EachText" Text="—" />
        <TextBlock Grid.Row="6" Grid.ColumnSpan="2" x:Name="Message" Foreground="OrangeRed" TextWrapping="Wrap" />
    </Grid>
</Window>
`);
put("src/Tips/MainWindow.axaml.cs", String.raw`using Avalonia.Controls;
using Avalonia.Interactivity;

namespace Tips;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        BillBox.TextChanged += (_, _) => Update();
        PeopleBox.TextChanged += (_, _) => Update();
        foreach (var tip in new[] { Tip10, Tip15, Tip20 }) tip.IsCheckedChanged += (_, _) => Update();
    }

    int Percent => Tip10.IsChecked == true ? 10 : Tip20.IsChecked == true ? 20 : 15;

    void Update()
    {
        string message = "";
        if (!decimal.TryParse(BillBox.Text, out decimal bill) || bill < 0) message = "Enter the bill as a number, like 42.50.";
        else if (!int.TryParse(PeopleBox.Text, out int people) || people < 1) message = "Enter how many people, 1 or more.";
        else
        {
            var (tip, total, each) = TipMath.Split(bill, Percent, people);
            Show($"£{tip:0.00}", $"£{total:0.00}", $"£{each:0.00}", "");
            return;
        }
        Show("—", "—", "—", string.IsNullOrEmpty(BillBox.Text) ? "" : message);
    }

    void Show(string tip, string total, string each, string message)
    {
        TipText.Text = tip;
        TotalText.Text = total;
        EachText.Text = each;
        Message.Text = message;
    }
}
`);
put("src/Tips/TipMath.cs", String.raw`namespace Tips;

/// <summary>The sums behind the window, kept apart from it so they can be tested on their own.</summary>
public static class TipMath
{
    /// <summary>The tip (to the nearest penny, halves up), the total, and each person's share
    /// (rounded UP to the penny, so the bill is always covered).</summary>
    public static (decimal Tip, decimal Total, decimal Each) Split(decimal bill, int percent, int people)
    {
        if (bill < 0) throw new ArgumentOutOfRangeException(nameof(bill));
        if (people < 1) throw new ArgumentOutOfRangeException(nameof(people));
        decimal tip = Math.Round(bill * percent / 100m, 2, MidpointRounding.AwayFromZero);
        decimal total = bill + tip;
        decimal each = Math.Ceiling(total * 100m / people) / 100m;
        return (tip, total, each);
    }
}
`);
put("tests/Tips.Tests/TipMathTests.cs", String.raw`namespace Tips.Tests;

public class TipMathTests
{
    [Theory]
    [InlineData(42.50, 15, 3, 6.38, 48.88, 16.30)]
    [InlineData(80, 20, 2, 16.00, 96.00, 48.00)]
    [InlineData(10, 10, 1, 1.00, 11.00, 11.00)]
    public void Splits_the_bill(decimal bill, int percent, int people, decimal tip, decimal total, decimal each) =>
        Assert.Equal((tip, total, each), TipMath.Split(bill, percent, people));

    [Fact]
    public void Halves_of_a_penny_round_up() => Assert.Equal(0.38m, TipMath.Split(2.50m, 15, 1).Tip);

    [Fact]
    public void Each_share_covers_the_bill() => Assert.True(TipMath.Split(10m, 0, 3).Each * 3 >= 10m);

    [Fact]
    public void Nobody_cannot_pay() => Assert.Throws<ArgumentOutOfRangeException>(() => TipMath.Split(10m, 15, 0));
}
`);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "Your first window"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4" && v.rep.protected.ok, "window solved: every milestone passes, exit 0 (" + ms(v.rep) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/window-report-solved.json"), v.text);

const cb = path.join(d, "src/Tips/MainWindow.axaml.cs");
fs.writeFileSync(cb, fs.readFileSync(cb, "utf8").replace("BillBox.TextChanged += (_, _) => Update();", ""));
const mw = path.join(d, "src/Tips/MainWindow.axaml");
fs.writeFileSync(mw, fs.readFileSync(mw, "utf8").replace('x:Name="BillBox"', 'x:Name="BillBox" Width="500"'));
v = validate(d);
const wid = (id) => v.rep.milestones.find((m) => m.id === id);
expect(wid("m1").ok && !wid("m3").ok, "window not listening to the bill: m3 fails (" + wid("m3").checks.map((c) => c.note).join(" · ") + ")");
expect(!wid("m2").ok, "window with a fixed 500px bill box: m2 fails (" + wid("m2").checks.map((c) => c.note).join(" · ") + ")");

/* ---------------- T2B: The Reading List ---------------- */
files = await window.KOS.codeProject.files("rp-t2b-reading");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "reading fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");
d = fresh();
put = (p, t) => { fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true }); fs.writeFileSync(path.join(d, p), t); };
put("src/Reading/Book.cs", String.raw`using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Reading;

/// <summary>One book on the list; tells the UI when its title or Done changes.</summary>
public class Book(string title, string author) : INotifyPropertyChanged
{
    string title = title;
    bool done;

    public event PropertyChangedEventHandler? PropertyChanged;

    public string Title { get => title; set => Set(ref title, value); }
    public string Author { get; set; } = author;
    public bool Done { get => done; set => Set(ref done, value); }

    void Set<T>(ref T field, T value, [CallerMemberName] string? name = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value)) return;
        field = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
`);
put("src/Reading/ReadingList.cs", String.raw`using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Reading;

/// <summary>Everything the window shows, as properties it can bind to.</summary>
public class ReadingList : INotifyPropertyChanged
{
    string newTitle = "", newAuthor = "";
    Book? selected;

    public ReadingList()
    {
        Books.CollectionChanged += (_, e) =>
        {
            foreach (Book b in e.NewItems ?? Array.Empty<Book>()) b.PropertyChanged += BookChanged;
            foreach (Book b in e.OldItems ?? Array.Empty<Book>()) b.PropertyChanged -= BookChanged;
            Changed(nameof(Summary));
        };
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    public ObservableCollection<Book> Books { get; } = new();

    public string NewTitle
    {
        get => newTitle;
        set { if (newTitle == value) return; newTitle = value; Changed(); Changed(nameof(CanAdd)); }
    }

    public string NewAuthor { get => newAuthor; set { if (newAuthor == value) return; newAuthor = value; Changed(); } }

    public Book? Selected { get => selected; set { if (selected == value) return; selected = value; Changed(); } }

    public bool CanAdd => !string.IsNullOrWhiteSpace(NewTitle);

    public string Summary
    {
        get
        {
            if (Books.Count == 0) return "No books yet";
            int read = Books.Count(b => b.Done);
            return $"{Books.Count} book{(Books.Count == 1 ? "" : "s")} · {read} read";
        }
    }

    public void Add()
    {
        if (!CanAdd) return;
        var book = new Book(NewTitle.Trim(), string.IsNullOrWhiteSpace(NewAuthor) ? "Unknown" : NewAuthor.Trim());
        Books.Add(book);
        NewTitle = "";
        NewAuthor = "";
        Selected = book;
    }

    public void RemoveSelected()
    {
        if (Selected is null) return;
        Books.Remove(Selected);
        Selected = null;
    }

    void BookChanged(object? sender, PropertyChangedEventArgs e) { if (e.PropertyName == nameof(Book.Done)) Changed(nameof(Summary)); }
    void Changed([CallerMemberName] string? name = null) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
`);
put("src/Reading/MainWindow.axaml", String.raw`<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="using:Reading"
        x:Class="Reading.MainWindow"
        x:DataType="local:ReadingList"
        Title="The Reading List" Width="640" Height="480">
    <Window.Resources>
        <SolidColorBrush x:Key="Accent" Color="#C2410C" />
    </Window.Resources>
    <Window.Styles>
        <Style Selector="TextBlock.done">
            <Setter Property="Opacity" Value="0.55" />
            <Setter Property="TextDecorations" Value="Strikethrough" />
        </Style>
        <Style Selector="TextBlock.heading">
            <Setter Property="Foreground" Value="{StaticResource Accent}" />
            <Setter Property="FontWeight" Value="SemiBold" />
        </Style>
    </Window.Styles>
    <DockPanel Margin="16">
        <Grid DockPanel.Dock="Top" ColumnDefinitions="*,Auto" Margin="0,0,0,12">
            <TextBlock Classes="heading" Text="The Reading List" FontSize="20" />
            <ToggleSwitch Grid.Column="1" x:Name="DarkToggle" OnContent="Dark" OffContent="Light" />
        </Grid>
        <TextBlock DockPanel.Dock="Bottom" x:Name="SummaryText" Text="{Binding Summary}" Margin="0,12,0,0" />
        <Grid ColumnDefinitions="*,*" ColumnSpacing="16">
            <ListBox x:Name="BookList" ItemsSource="{Binding Books}" SelectedItem="{Binding Selected}">
                <ListBox.ItemTemplate>
                    <DataTemplate x:DataType="local:Book">
                        <Grid ColumnDefinitions="Auto,*">
                            <CheckBox IsChecked="{Binding Done}" />
                            <StackPanel Grid.Column="1">
                                <TextBlock Text="{Binding Title}" Classes.done="{Binding Done}" FontWeight="SemiBold" />
                                <TextBlock Text="{Binding Author}" Opacity="0.7" />
                            </StackPanel>
                        </Grid>
                    </DataTemplate>
                </ListBox.ItemTemplate>
            </ListBox>
            <StackPanel Grid.Column="1" Spacing="8">
                <Label Content="_Title" Target="{Binding #TitleBox}" />
                <TextBox x:Name="TitleBox" Text="{Binding NewTitle}" />
                <Label Content="_Author" Target="{Binding #AuthorBox}" />
                <TextBox x:Name="AuthorBox" Text="{Binding NewAuthor}" />
                <Button x:Name="AddButton" Content="Add" IsEnabled="{Binding CanAdd}" Click="OnAdd" />
                <Label Content="_Rename the chosen book" Target="{Binding #EditTitle}" />
                <TextBox x:Name="EditTitle" Text="{Binding Selected.Title, FallbackValue=''}" IsEnabled="{Binding Selected, Converter={x:Static ObjectConverters.IsNotNull}}" />
                <Button x:Name="RemoveButton" Content="Remove" Click="OnRemove" IsEnabled="{Binding Selected, Converter={x:Static ObjectConverters.IsNotNull}}" />
            </StackPanel>
        </Grid>
    </DockPanel>
</Window>
`);
put("src/Reading/MainWindow.axaml.cs", String.raw`using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Styling;

namespace Reading;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new ReadingList();
        DarkToggle.IsCheckedChanged += (_, _) =>
            Application.Current!.RequestedThemeVariant = DarkToggle.IsChecked == true ? ThemeVariant.Dark : ThemeVariant.Light;
    }

    ReadingList List => (ReadingList)DataContext!;

    void OnAdd(object? sender, RoutedEventArgs e) => List.Add();
    void OnRemove(object? sender, RoutedEventArgs e) => List.RemoveSelected();
}
`);
put("tests/Reading.Tests/ReadingListTests.cs", String.raw`namespace Reading.Tests;

public class ReadingListTests
{
    [Fact]
    public void Adding_trims_and_selects()
    {
        var list = new ReadingList { NewTitle = "  Dune ", NewAuthor = " Frank Herbert " };
        list.Add();
        Assert.Equal(("Dune", "Frank Herbert"), (list.Books[0].Title, list.Books[0].Author));
        Assert.Same(list.Books[0], list.Selected);
    }

    [Fact]
    public void A_blank_title_adds_nothing()
    {
        var list = new ReadingList { NewTitle = " " };
        list.Add();
        Assert.Empty(list.Books);
    }

    [Fact]
    public void Reading_a_book_changes_the_summary()
    {
        var list = new ReadingList { NewTitle = "Dune" };
        list.Add();
        list.Books[0].Done = true;
        Assert.Equal("1 book · 1 read", list.Summary);
    }

    [Fact]
    public void Removing_with_nothing_chosen_does_nothing()
    {
        var list = new ReadingList { NewTitle = "Dune" };
        list.Add();
        list.Selected = null;
        list.RemoveSelected();
        Assert.Single(list.Books);
    }
}
`);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "The Reading List"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4,m5" && v.rep.protected.ok, "reading solved: every milestone passes, exit 0 (" + ms(v.rep) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/reading-report-solved.json"), v.text);
{ const f = path.join(d, "src/Reading/Book.cs"); fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));", "_ = name;")); }
v = validate(d);
{ const at = (id) => v.rep.milestones.find((m) => m.id === id);
  expect(at("m3").ok && !at("m4").ok, "reading Book that never raises PropertyChanged: m4 fails, m3 still passes (" + at("m4").checks.map((c) => c.note).join(" · ") + ")"); }

/* ---------------- T2C: Markdown notes ---------------- */
files = await window.KOS.codeProject.files("rp-t2c-notes");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "notes fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");
d = fresh();
put = (p, t) => { fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true }); fs.writeFileSync(path.join(d, p), t); };
put("src/Notes/ViewModels/NoteViewModel.cs", String.raw`using CommunityToolkit.Mvvm.ComponentModel;

namespace Notes;

/// <summary>One note: its text, and the title and word count that follow it.</summary>
public partial class NoteViewModel(string text = "") : ObservableObject
{
    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(Title), nameof(Words))]
    public partial string Text { get; set; } = text;

    public string Title
    {
        get
        {
            foreach (var line in Text.Split('\n'))
            {
                var t = line.Trim().TrimStart('#').Trim();
                if (t.Length > 0) return t;
            }
            return "Untitled";
        }
    }

    public string Words
    {
        get
        {
            int n = Text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Count(w => w.Any(char.IsLetterOrDigit));
            return n == 0 ? "No words" : n == 1 ? "1 word" : $"{n} words";
        }
    }
}
`);
put("src/Notes/ViewModels/MainViewModel.cs", String.raw`using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Notes;

/// <summary>The window's view model: the notes, the one being edited, and what can be done.</summary>
public partial class MainViewModel(INoteStore store, IDialogs dialogs) : ObservableObject
{
    public INoteStore Store { get; } = store;
    public IDialogs Dialogs { get; } = dialogs;

    public ObservableCollection<NoteViewModel> Notes { get; } = new();

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(DeleteCommand))]
    public partial NoteViewModel? Selected { get; set; }

    bool HasSelection => Selected is not null;

    [RelayCommand]
    void New()
    {
        var note = new NoteViewModel();
        Notes.Add(note);
        Selected = note;
    }

    [RelayCommand(CanExecute = nameof(HasSelection))]
    async Task Delete()
    {
        if (Selected is not { } note) return;
        if (!await Dialogs.ConfirmAsync($"Delete “{note.Title}”?")) return;
        int at = Notes.IndexOf(note);
        Notes.RemoveAt(at);
        Selected = Notes.Count == 0 ? null : Notes[Math.Min(at, Notes.Count - 1)];
    }

    [RelayCommand]
    Task Save() => Store.SaveAllAsync(Notes.Select(n => n.Text).ToList());

    [RelayCommand]
    async Task Load()
    {
        var texts = await Store.LoadAllAsync();
        Notes.Clear();
        foreach (var t in texts) Notes.Add(new NoteViewModel(t));
        Selected = Notes.FirstOrDefault();
    }
}
`);
put("src/Notes/Services/FolderNoteStore.cs", String.raw`using System.Text;

namespace Notes;

/// <summary>The notes as .md files in one folder.</summary>
public class FolderNoteStore(string folder) : INoteStore
{
    public string Folder { get; } = folder;

    public static string FileName(int position, string text)
    {
        var slug = new StringBuilder();
        foreach (char c in new NoteViewModel(text).Title.ToLowerInvariant())
        {
            if (char.IsAsciiLetterOrDigit(c)) slug.Append(c);
            else if (slug.Length > 0 && slug[^1] != '-') slug.Append('-');
        }
        string s = slug.ToString().Trim('-');
        if (s.Length > 40) s = s[..40].TrimEnd('-');
        if (s.Length == 0 || text.Trim().Trim('#').Trim().Length == 0) s = "untitled";
        return $"{position:00}-{s}.md";
    }

    public async Task<IReadOnlyList<string>> LoadAllAsync(CancellationToken ct = default)
    {
        if (!Directory.Exists(Folder)) return Array.Empty<string>();
        var notes = new List<string>();
        foreach (var file in Directory.GetFiles(Folder, "*.md").Order(StringComparer.Ordinal))
            notes.Add(await File.ReadAllTextAsync(file, ct));
        return notes;
    }

    public async Task SaveAllAsync(IReadOnlyList<string> notes, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        Directory.CreateDirectory(Folder);
        foreach (var old in Directory.GetFiles(Folder, "*.md")) File.Delete(old);
        for (int i = 0; i < notes.Count; i++)
            await File.WriteAllTextAsync(Path.Combine(Folder, FileName(i + 1, notes[i])), notes[i], ct);
    }
}
`);
put("src/Notes/Views/MainWindow.axaml", String.raw`<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="using:Notes"
        x:Class="Notes.MainWindow"
        x:DataType="local:MainViewModel"
        Title="Markdown notes" Width="760" Height="500">
    <Window.KeyBindings>
        <KeyBinding Gesture="Ctrl+N" Command="{Binding NewCommand}" />
        <KeyBinding Gesture="Ctrl+S" Command="{Binding SaveCommand}" />
    </Window.KeyBindings>
    <DockPanel>
        <StackPanel DockPanel.Dock="Top" Orientation="Horizontal" Spacing="8" Margin="12">
            <Button x:Name="NewButton" Content="New" Command="{Binding NewCommand}" />
            <Button x:Name="DeleteButton" Content="Delete" Command="{Binding DeleteCommand}" />
            <Button x:Name="SaveButton" Content="Save" Command="{Binding SaveCommand}" />
            <Button x:Name="LoadButton" Content="Load" Command="{Binding LoadCommand}" />
        </StackPanel>
        <TextBlock DockPanel.Dock="Bottom" x:Name="WordCount" Margin="12" Text="{Binding Selected.Words, FallbackValue=''}" />
        <Grid ColumnDefinitions="240,*" Margin="12,0">
            <ListBox x:Name="NoteList" ItemsSource="{Binding Notes}" SelectedItem="{Binding Selected}">
                <ListBox.ItemTemplate>
                    <DataTemplate x:DataType="local:NoteViewModel">
                        <TextBlock Text="{Binding Title}" />
                    </DataTemplate>
                </ListBox.ItemTemplate>
            </ListBox>
            <TextBox Grid.Column="1" x:Name="Editor" Margin="12,0,0,0" AcceptsReturn="True" TextWrapping="Wrap"
                     Text="{Binding Selected.Text, FallbackValue=''}" />
        </Grid>
    </DockPanel>
</Window>
`);
put("tests/Notes.Tests/OwnTests.cs", String.raw`using Avalonia.Controls;
using Avalonia.Headless.XUnit;
using Avalonia.Threading;

namespace Notes.Tests;

class Store : INoteStore
{
    public List<string> Saved = new();
    public Task<IReadOnlyList<string>> LoadAllAsync(CancellationToken ct = default) => Task.FromResult<IReadOnlyList<string>>(Saved);
    public Task SaveAllAsync(IReadOnlyList<string> notes, CancellationToken ct = default) { Saved = notes.ToList(); return Task.CompletedTask; }
}
class Yes : IDialogs { public Task<bool> ConfirmAsync(string q) => Task.FromResult(true); }

public class ViewModelTests
{
    [Fact]
    public void A_heading_only_note_is_titled_by_it() => Assert.Equal("Plans", new NoteViewModel("### Plans").Title);

    [Fact]
    public void Words_ignore_heading_marks() => Assert.Equal("2 words", new NoteViewModel("# Two words").Words);

    [Fact]
    public async Task Loading_nothing_selects_nothing()
    {
        var vm = new MainViewModel(new Store(), new Yes());
        await vm.LoadCommand.ExecuteAsync(null);
        Assert.Null(vm.Selected);
    }

    [Fact]
    public async Task Deleting_the_last_note_leaves_none()
    {
        var vm = new MainViewModel(new Store(), new Yes());
        vm.NewCommand.Execute(null);
        await vm.DeleteCommand.ExecuteAsync(null);
        Assert.Empty(vm.Notes);
    }

    [Fact]
    public void File_names_drop_punctuation() => Assert.Equal("01-a-b.md", FolderNoteStore.FileName(1, "a, b"));
}

public class WindowTests
{
    [AvaloniaFact]
    public void The_editor_is_empty_with_no_note()
    {
        var w = new MainWindow { DataContext = new MainViewModel(new Store(), new Yes()) };
        w.Show();
        Dispatcher.UIThread.RunJobs();
        Assert.True(string.IsNullOrEmpty(w.FindControl<TextBox>("Editor")!.Text));
    }
}
`);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "Markdown notes"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4" && v.rep.protected.ok, "notes solved: every milestone passes, exit 0 (" + ms(v.rep) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/notes-report-solved.json"), v.text);
{ const f = path.join(d, "src/Notes/Services/FolderNoteStore.cs"); const t = fs.readFileSync(f, "utf8"); if (!t.includes("        foreach (var old in Directory.GetFiles(Folder, \"*.md\")) File.Delete(old);\n")) throw new Error("edit anchor missing in src/Notes/Services/FolderNoteStore.cs"); fs.writeFileSync(f, t.replace("        foreach (var old in Directory.GetFiles(Folder, \"*.md\")) File.Delete(old);\n", "")); }
{ const f = path.join(d, "src/Notes/Views/MainWindow.axaml"); const t = fs.readFileSync(f, "utf8"); if (!t.includes("<Button x:Name=\"LoadButton\" Content=\"Load\" Command=\"{Binding LoadCommand}\" />")) throw new Error("edit anchor missing in src/Notes/Views/MainWindow.axaml"); fs.writeFileSync(f, t.replace("<Button x:Name=\"LoadButton\" Content=\"Load\" Command=\"{Binding LoadCommand}\" />", "<Button x:Name=\"LoadButton\" Content=\"Load\" Click=\"OnLoad\" />")); }
{ const f = path.join(d, "src/Notes/Views/MainWindow.axaml.cs"); const t = fs.readFileSync(f, "utf8"); if (!t.includes("    public MainWindow() => InitializeComponent();")) throw new Error("edit anchor missing in src/Notes/Views/MainWindow.axaml.cs"); fs.writeFileSync(f, t.replace("    public MainWindow() => InitializeComponent();", "    public MainWindow() => InitializeComponent();\n    async void OnLoad(object? sender, Avalonia.Interactivity.RoutedEventArgs e) => await ((MainViewModel)DataContext!).LoadCommand.ExecuteAsync(null);")); }
v = validate(d);
{ const at = (id) => v.rep.milestones.find((m) => m.id === id);
  expect(at("m1").ok && !at("m2").ok && !at("m3").ok, "notes with a Click handler and old files left behind: m2 and m3 fail (" + at("m2").checks.map((c) => c.note).join(" · ") + " / " + at("m3").checks.map((c) => c.note).join(" · ") + ")"); }

/* ---------------- T2D: Focus timer ---------------- */
files = await window.KOS.codeProject.files("rp-t2d-timer");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "timer fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");
d = fresh();
put = (p, t) => { fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true }); fs.writeFileSync(path.join(d, p), t); };
put("src/Focus/Composition.cs", String.raw`using Microsoft.Extensions.DependencyInjection;

namespace Focus;

/// <summary>The composition root: every service registered in one place.</summary>
public static class Composition
{
    public static ServiceProvider Build(string dataFolder)
    {
        var services = new ServiceCollection();
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<ISettingsStore>(_ => new JsonSettingsStore(Path.Combine(dataFolder, "settings.json")));
        services.AddSingleton<IQuoteService>(_ => new HttpQuoteService(new HttpClient { BaseAddress = HttpQuoteService.Api }));
        services.AddSingleton<INotifier, WindowNotifier>();
        services.AddTransient<MainViewModel>();
        return services.BuildServiceProvider();
    }
}
`);
put("src/Focus/MainViewModel.cs", String.raw`using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Focus;

/// <summary>The timer, its settings and the quote.</summary>
public partial class MainViewModel : ObservableObject
{
    TimeSpan left;
    CancellationTokenSource? running;

    public MainViewModel(TimeProvider time, ISettingsStore settings, IQuoteService quotes, INotifier notifier)
    {
        Time = time; Settings = settings; Quotes = quotes; Notifier = notifier;
        var s = settings.Load();
        focusMinutes = s.FocusMinutes;
        BreakMinutes = s.BreakMinutes;
        left = TimeSpan.FromMinutes(s.FocusMinutes);
    }

    public TimeProvider Time { get; }
    public ISettingsStore Settings { get; }
    public IQuoteService Quotes { get; }
    public INotifier Notifier { get; }
    public int BreakMinutes { get; }

    [ObservableProperty] public partial string Phase { get; private set; } = "Focus";

    public string Remaining => $"{(int)left.TotalMinutes:00}:{left.Seconds:00}";

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(StartCommand), nameof(PauseCommand))]
    public partial bool IsRunning { get; private set; }

    int focusMinutes;
    public int FocusMinutes
    {
        get => focusMinutes;
        set
        {
            value = Math.Max(1, value);
            if (!SetProperty(ref focusMinutes, value)) return;
            Settings.Save(new Settings(value, BreakMinutes));
            if (!IsRunning && Phase == "Focus") Show(TimeSpan.FromMinutes(value));
        }
    }

    [ObservableProperty] public partial Quote? Quote { get; private set; }
    [ObservableProperty] public partial string? QuoteError { get; private set; }
    [ObservableProperty] public partial bool IsLoadingQuote { get; private set; }

    bool CanStart => !IsRunning;

    [RelayCommand(CanExecute = nameof(CanStart))]
    void Start()
    {
        running = new CancellationTokenSource();
        IsRunning = true;
        _ = CountDown(running.Token);
    }

    [RelayCommand(CanExecute = nameof(IsRunning))]
    void Pause()
    {
        running?.Cancel();
        IsRunning = false;
    }

    async Task CountDown(CancellationToken ct)
    {
        var end = Time.GetUtcNow() + left;
        try
        {
            while (left > TimeSpan.Zero)
            {
                await Task.Delay(TimeSpan.FromSeconds(1), Time, ct);
                var rest = end - Time.GetUtcNow();
                Show(rest > TimeSpan.Zero ? rest : TimeSpan.Zero);
            }
        }
        catch (OperationCanceledException) { return; }
        IsRunning = false;
        if (Phase == "Focus")
        {
            Phase = "Break";
            Show(TimeSpan.FromMinutes(BreakMinutes));
            Notifier.Notify("Focus done", $"Time for a {BreakMinutes}-minute break.");
        }
        else
        {
            Phase = "Focus";
            Show(TimeSpan.FromMinutes(FocusMinutes));
            Notifier.Notify("Break over", "Ready when you are.");
        }
    }

    void Show(TimeSpan t) { left = TimeSpan.FromSeconds(Math.Ceiling(t.TotalSeconds)); OnPropertyChanged(nameof(Remaining)); }

    [RelayCommand]
    async Task LoadQuote()
    {
        QuoteError = null;
        IsLoadingQuote = true;
        try { Quote = await Quotes.TodayAsync(); }
        catch (QuoteUnavailableException) { Quote = null; QuoteError = "Couldn't load a quote. Try again."; }
        finally { IsLoadingQuote = false; }
    }
}
`);
put("src/Focus/MainWindow.axaml", String.raw`<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="using:Focus"
        x:Class="Focus.MainWindow"
        x:DataType="local:MainViewModel"
        Title="Focus timer" Width="420" Height="420">
    <StackPanel Margin="24" Spacing="12" HorizontalAlignment="Stretch">
        <TextBlock Text="{Binding Phase}" HorizontalAlignment="Center" />
        <TextBlock x:Name="RemainingText" Text="{Binding Remaining}" FontSize="56" HorizontalAlignment="Center" />
        <StackPanel Orientation="Horizontal" Spacing="8" HorizontalAlignment="Center">
            <Button x:Name="StartButton" Content="Start" Command="{Binding StartCommand}" />
            <Button x:Name="PauseButton" Content="Pause" Command="{Binding PauseCommand}" />
        </StackPanel>
        <Label Content="_Focus minutes" Target="{Binding #FocusMinutesBox}" />
        <NumericUpDown x:Name="FocusMinutesBox" Value="{Binding FocusMinutes}" Minimum="1" Maximum="120" FormatString="0" />
        <Button Content="A quote to begin" Command="{Binding LoadQuoteCommand}" />
        <ProgressBar IsIndeterminate="True" IsVisible="{Binding IsLoadingQuote}" />
        <TextBlock Text="{Binding Quote.Text, FallbackValue=''}" TextWrapping="Wrap" FontStyle="Italic" />
        <TextBlock Text="{Binding QuoteError}" Foreground="OrangeRed" />
    </StackPanel>
</Window>
`);
put("src/Focus/Services/Settings.cs", String.raw`using System.Text.Json;

namespace Focus;

/// <summary>What the user chose, remembered between runs.</summary>
public record Settings(int FocusMinutes = 25, int BreakMinutes = 5);

public interface ISettingsStore
{
    Settings Load();
    void Save(Settings settings);
}

/// <summary>Settings as a JSON file.</summary>
public class JsonSettingsStore(string path) : ISettingsStore
{
    public string FilePath { get; } = path;

    public Settings Load()
    {
        try { return File.Exists(FilePath) ? JsonSerializer.Deserialize<Settings>(File.ReadAllText(FilePath)) ?? new Settings() : new Settings(); }
        catch (JsonException) { return new Settings(); }
    }

    public void Save(Settings settings)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(FilePath)!);
        File.WriteAllText(FilePath, JsonSerializer.Serialize(settings));
    }
}
`);
put("src/Focus/Services/Quotes.cs", String.raw`using System.Net.Http.Json;
using System.Text.Json;

namespace Focus;

/// <summary>A quote to start a session with.</summary>
public record Quote(string Text, string Author);

public interface IQuoteService
{
    Task<Quote> TodayAsync(CancellationToken ct = default);
}

/// <summary>Thrown when no quote could be had: a failed request, a bad answer, or too slow.</summary>
public class QuoteUnavailableException(string message, Exception? inner = null) : Exception(message, inner);

/// <summary>The quote of the day from the quotes API: GET quote/today → {"text": …, "author": …}.</summary>
public class HttpQuoteService(HttpClient http, TimeSpan? timeout = null) : IQuoteService
{
    public static readonly Uri Api = new("https://quotes.kurenai.invalid/");

    public HttpClient Http { get; } = http;
    public TimeSpan Timeout { get; } = timeout ?? TimeSpan.FromSeconds(5);

    public async Task<Quote> TodayAsync(CancellationToken ct = default)
    {
        using var limit = CancellationTokenSource.CreateLinkedTokenSource(ct);
        limit.CancelAfter(Timeout);
        try
        {
            using var response = await Http.GetAsync("quote/today", limit.Token);
            if (!response.IsSuccessStatusCode) throw new QuoteUnavailableException($"The quotes API answered {(int)response.StatusCode}.");
            var quote = await response.Content.ReadFromJsonAsync<Quote>(new JsonSerializerOptions(JsonSerializerDefaults.Web), limit.Token);
            if (quote is null || string.IsNullOrWhiteSpace(quote.Text)) throw new QuoteUnavailableException("The quotes API sent no quote.");
            return quote;
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested) { throw new QuoteUnavailableException("The quotes API took too long."); }
        catch (HttpRequestException e) { throw new QuoteUnavailableException("The quotes API could not be reached.", e); }
        catch (JsonException e) { throw new QuoteUnavailableException("The quotes API sent something that is not a quote.", e); }
    }
}
`);
put("tests/Focus.Tests/OwnTests.cs", String.raw`using System.Net;
using Avalonia.Headless.XUnit;
using Avalonia.Threading;
using Microsoft.Extensions.Time.Testing;

namespace Focus.Tests;

class Store : ISettingsStore { public Settings S = new(); public Settings Load() => S; public void Save(Settings s) => S = s; }
class Quiet : INotifier { public int N; public void Notify(string t, string m) => N++; }
class NoQuotes : IQuoteService { public Task<Quote> TodayAsync(CancellationToken ct = default) => throw new QuoteUnavailableException("none"); }
class Answer(HttpStatusCode code, string body) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage r, CancellationToken ct) =>
        Task.FromResult(new HttpResponseMessage(code) { Content = new StringContent(body) });
}

public class TimerTests
{
    static void Tick(FakeTimeProvider t, int s) { for (int i = 0; i < s; i++) { t.Advance(TimeSpan.FromSeconds(1)); Dispatcher.UIThread.RunJobs(); } }

    [AvaloniaFact]
    public void A_break_ending_is_announced_too()
    {
        var t = new FakeTimeProvider(); var q = new Quiet();
        var vm = new MainViewModel(t, new Store { S = new Settings(1, 1) }, new NoQuotes(), q);
        vm.StartCommand.Execute(null); Tick(t, 60);
        vm.StartCommand.Execute(null); Tick(t, 60);
        Assert.Equal(2, q.N);
    }

    [AvaloniaFact]
    public void Focus_minutes_below_one_become_one()
    {
        var vm = new MainViewModel(new FakeTimeProvider(), new Store(), new NoQuotes(), new Quiet()) { FocusMinutes = 0 };
        Assert.Equal(1, vm.FocusMinutes);
    }

    [AvaloniaFact]
    public async Task A_failed_quote_leaves_no_quote()
    {
        var vm = new MainViewModel(new FakeTimeProvider(), new Store(), new NoQuotes(), new Quiet());
        await vm.LoadQuoteCommand.ExecuteAsync(null);
        Assert.Null(vm.Quote);
    }

    [Fact]
    public async Task The_service_reads_the_json() =>
        Assert.Equal("Hi", (await new HttpQuoteService(new HttpClient(new Answer(HttpStatusCode.OK, """{"text":"Hi","author":"Me"}""")) { BaseAddress = HttpQuoteService.Api }).TodayAsync()).Text);

    [Fact]
    public void Settings_survive_a_round_trip()
    {
        string f = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".json");
        new JsonSettingsStore(f).Save(new Settings(10, 2));
        Assert.Equal(new Settings(10, 2), new JsonSettingsStore(f).Load());
        File.Delete(f);
    }
}
`);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "Focus timer"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4,m5" && v.rep.protected.ok, "timer solved: every milestone passes, exit 0 (" + ms(v.rep) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/timer-report-solved.json"), v.text);
{ const f = path.join(d, "src/Focus/MainViewModel.cs"); const t = fs.readFileSync(f, "utf8"); if (!t.includes("await Task.Delay(TimeSpan.FromSeconds(1), Time, ct);")) throw new Error("edit anchor missing in src/Focus/MainViewModel.cs"); fs.writeFileSync(f, t.replace("await Task.Delay(TimeSpan.FromSeconds(1), Time, ct);", "await Task.Delay(TimeSpan.FromSeconds(1), ct);")); }
v = validate(d);
{ const at = (id) => v.rep.milestones.find((m) => m.id === id);
  expect(at("m1").ok && !at("m2").ok, "timer on the real clock instead of the injected one: m2 fails (" + at("m2").checks.map((c) => c.note).join(" · ") + ")"); }

/* ---------------- T2E: the capstone, The Planner on the desktop ---------------- */
files = await window.KOS.codeProject.files("rp-ct2-planner");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "planner-desktop fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");
d = fresh();
put = (p, t) => { fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true }); fs.writeFileSync(path.join(d, p), t); };
put("src/Planner.Desktop/App.axaml", String.raw`<Application xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:local="using:Planner.Desktop"
             x:Class="Planner.Desktop.App"
             RequestedThemeVariant="Default">
    <Application.DataTemplates>
        <DataTemplate DataType="local:TopicsViewModel"><local:TopicsView /></DataTemplate>
        <DataTemplate DataType="local:TopicEditorViewModel"><local:TopicEditorView /></DataTemplate>
        <DataTemplate DataType="local:NextViewModel"><local:NextView /></DataTemplate>
    </Application.DataTemplates>
    <Application.Styles>
        <FluentTheme />
    </Application.Styles>
</Application>
`);
put("src/Planner.Desktop/ViewModels/ShellViewModel.cs", String.raw`using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Planner.Core;

namespace Planner.Desktop;

/// <summary>The window's view model: which page is showing, and the way back.</summary>
public partial class ShellViewModel : ViewModelBase, INavigator
{
    readonly Stack<ViewModelBase> history = new();

    public ShellViewModel(ITopicStore store, TimeProvider time)
    {
        Store = store;
        Time = time;
        Current = new TopicsViewModel(store, this);
        _ = Current.ActivateAsync();
    }

    public ITopicStore Store { get; }
    public TimeProvider Time { get; }

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(CanGoBack))]
    [NotifyCanExecuteChangedFor(nameof(BackCommand))]
    public partial ViewModelBase Current { get; private set; }

    public bool CanGoBack => history.Count > 0;

    public void GoTo(ViewModelBase page)
    {
        history.Push(Current);
        Current = page;
        _ = page.ActivateAsync();
    }

    [RelayCommand(CanExecute = nameof(CanGoBack))]
    public void Back()
    {
        if (history.Count == 0) return;
        Current = history.Pop();
        _ = Current.ActivateAsync();
    }

    [RelayCommand] void ShowTopics() => GoTo(new TopicsViewModel(Store, this));
    [RelayCommand] void ShowNext() => GoTo(new NextViewModel(Store, Time));
}
`);
put("src/Planner.Desktop/ViewModels/TopicsViewModel.cs", String.raw`using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Planner.Core;

namespace Planner.Desktop;

/// <summary>The list of topics, the chosen one's details, and the ways to add and edit.</summary>
public partial class TopicsViewModel(ITopicStore store, INavigator nav) : ViewModelBase
{
    public ITopicStore Store { get; } = store;
    public INavigator Nav { get; } = nav;

    public ObservableCollection<Topic> Topics { get; } = new();

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(Detail))]
    [NotifyCanExecuteChangedFor(nameof(EditCommand))]
    public partial Topic? Selected { get; set; }

    public string Detail => Selected is { } t
        ? $"{t.Name} · {t.Subject} · confidence {t.Confidence} · last studied {(t.LastStudied is { } d ? d.ToString("yyyy-MM-dd") : "never")}"
        : "";

    public override async Task ActivateAsync()
    {
        int? keep = Selected?.Id;
        var all = await Store.LoadAsync();
        Topics.Clear();
        foreach (var t in all) Topics.Add(t);
        Selected = Topics.FirstOrDefault(t => t.Id == keep);
    }

    bool HasSelection => Selected is not null;

    [RelayCommand] void Add() => Nav.GoTo(new TopicEditorViewModel(Store, Nav, null));
    [RelayCommand(CanExecute = nameof(HasSelection))] void Edit() => Nav.GoTo(new TopicEditorViewModel(Store, Nav, Selected));
}
`);
put("src/Planner.Desktop/ViewModels/TopicEditorViewModel.cs", String.raw`using System.ComponentModel.DataAnnotations;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Planner.Core;

namespace Planner.Desktop;

/// <summary>Adding or editing one topic, validated as it is typed.</summary>
public partial class TopicEditorViewModel : ViewModelBase
{
    public TopicEditorViewModel(ITopicStore store, INavigator nav, Topic? editing)
    {
        Store = store; Nav = nav; Editing = editing;
        name = editing?.Name ?? "";
        subject = editing?.Subject ?? "";
        confidence = editing?.Confidence ?? 1;
        ErrorsChanged += (_, _) => SaveCommand.NotifyCanExecuteChanged();
    }

    public ITopicStore Store { get; }
    public INavigator Nav { get; }
    public Topic? Editing { get; }

    string name, subject;
    int confidence;

    [Required(ErrorMessage = "Give the topic a name.")]
    [MaxLength(60, ErrorMessage = "At most 60 characters.")]
    public string Name { get => name; set { SetProperty(ref name, value, true); SaveCommand.NotifyCanExecuteChanged(); } }

    [Required(ErrorMessage = "Choose a subject.")]
    public string Subject { get => subject; set { SetProperty(ref subject, value, true); SaveCommand.NotifyCanExecuteChanged(); } }

    [Range(1, 5, ErrorMessage = "Confidence is 1 to 5.")]
    public int Confidence { get => confidence; set { SetProperty(ref confidence, value, true); SaveCommand.NotifyCanExecuteChanged(); } }

    bool CanSave => !HasErrors && !string.IsNullOrWhiteSpace(Name) && !string.IsNullOrWhiteSpace(Subject);

    [RelayCommand(CanExecute = nameof(CanSave))]
    async Task Save()
    {
        var topics = await Store.LoadAsync();
        string n = Name.Trim(), s = Subject.Trim().ToLowerInvariant();
        if (Editing is null) topics.Add(new Topic(topics.Count == 0 ? 1 : topics.Max(t => t.Id) + 1, s, n, Confidence));
        else
        {
            int at = topics.FindIndex(t => t.Id == Editing.Id);
            var changed = Editing with { Name = n, Subject = s, Confidence = Confidence };
            if (at >= 0) topics[at] = changed; else topics.Add(changed);
        }
        await Store.SaveAsync(topics);
        Nav.Back();
    }

    [RelayCommand] void Cancel() => Nav.Back();
}
`);
put("src/Planner.Desktop/ViewModels/NextViewModel.cs", String.raw`using CommunityToolkit.Mvvm.ComponentModel;
using Planner.Core;

namespace Planner.Desktop;

/// <summary>What to study next: the five lowest scores today.</summary>
public partial class NextViewModel(ITopicStore store, TimeProvider time) : ViewModelBase
{
    public ITopicStore Store { get; } = store;
    public TimeProvider Time { get; } = time;

    [ObservableProperty] public partial IReadOnlyList<string> Lines { get; private set; } = Array.Empty<string>();

    public override async Task ActivateAsync()
    {
        var today = DateOnly.FromDateTime(Time.GetLocalNow().DateTime);
        Lines = Priority.Next(await Store.LoadAsync(), today, 5).Select((t, i) => $"{i + 1}. {t.Name} ({t.Subject})").ToList();
    }
}
`);
put("src/Planner.Desktop/Views/MainWindow.axaml", String.raw`<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="using:Planner.Desktop"
        x:Class="Planner.Desktop.MainWindow"
        x:DataType="local:ShellViewModel"
        Title="Planner" Width="1000" Height="640" MinWidth="420">
    <DockPanel>
        <StackPanel DockPanel.Dock="Top" Orientation="Horizontal" Spacing="8" Margin="12">
            <Button x:Name="BackButton" Content="‹ Back" AutomationProperties.Name="Back" Command="{Binding BackCommand}" />
            <Button x:Name="TopicsTab" Content="Topics" Command="{Binding ShowTopicsCommand}" />
            <Button x:Name="NextTab" Content="Next" Command="{Binding ShowNextCommand}" />
        </StackPanel>
        <ContentControl x:Name="Page" Content="{Binding Current}" Margin="12,0,12,12" />
    </DockPanel>
</Window>
`);
put("src/Planner.Desktop/Views/TopicsView.axaml", String.raw`<UserControl xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:local="using:Planner.Desktop"
             xmlns:core="using:Planner.Core"
             x:Class="Planner.Desktop.TopicsView"
             x:DataType="local:TopicsViewModel">
    <Grid x:Name="Layout" ColumnDefinitions="*,*" RowDefinitions="*" ColumnSpacing="16" RowSpacing="12">
        <ListBox x:Name="TopicList" ItemsSource="{Binding Topics}" SelectedItem="{Binding Selected}"
                 AutomationProperties.Name="Topics" MinHeight="160">
            <ListBox.ItemTemplate>
                <DataTemplate x:DataType="core:Topic">
                    <TextBlock Text="{Binding Name}" />
                </DataTemplate>
            </ListBox.ItemTemplate>
        </ListBox>
        <StackPanel x:Name="TopicDetail" Grid.Column="1" Spacing="12">
            <TextBlock Text="{Binding Detail}" TextWrapping="Wrap" />
            <StackPanel Orientation="Horizontal" Spacing="8">
                <Button x:Name="AddButton" Content="Add topic" Command="{Binding AddCommand}" />
                <Button x:Name="EditButton" Content="Edit" Command="{Binding EditCommand}" />
            </StackPanel>
        </StackPanel>
    </Grid>
</UserControl>
`);
put("src/Planner.Desktop/Views/TopicEditorView.axaml", String.raw`<UserControl xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:local="using:Planner.Desktop"
             x:Class="Planner.Desktop.TopicEditorView"
             x:DataType="local:TopicEditorViewModel">
    <Grid ColumnDefinitions="Auto,*" RowDefinitions="Auto,Auto,Auto,Auto" ColumnSpacing="12" RowSpacing="10" MaxWidth="560" HorizontalAlignment="Left">
        <Label Content="_Name" Target="{Binding #NameBox}" VerticalAlignment="Center" />
        <TextBox Grid.Column="1" x:Name="NameBox" Text="{Binding Name}" />
        <Label Grid.Row="1" Content="_Subject" Target="{Binding #SubjectBox}" VerticalAlignment="Center" />
        <TextBox Grid.Row="1" Grid.Column="1" x:Name="SubjectBox" Text="{Binding Subject}" />
        <Label Grid.Row="2" Content="_Confidence (1–5)" Target="{Binding #ConfidenceBox}" VerticalAlignment="Center" />
        <NumericUpDown Grid.Row="2" Grid.Column="1" x:Name="ConfidenceBox" Value="{Binding Confidence}" Minimum="1" Maximum="5" Increment="1" FormatString="0" />
        <StackPanel Grid.Row="3" Grid.Column="1" Orientation="Horizontal" Spacing="8">
            <Button x:Name="SaveButton" Content="Save" IsDefault="True" Command="{Binding SaveCommand}" />
            <Button x:Name="CancelButton" Content="Cancel" IsCancel="True" Command="{Binding CancelCommand}" />
        </StackPanel>
    </Grid>
</UserControl>
`);
put("src/Planner.Desktop/Views/NextView.axaml", String.raw`<UserControl xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:local="using:Planner.Desktop"
             x:Class="Planner.Desktop.NextView"
             x:DataType="local:NextViewModel">
    <StackPanel Spacing="8">
        <TextBlock Text="Study next" FontSize="20" FontWeight="SemiBold" />
        <ItemsControl x:Name="NextList" ItemsSource="{Binding Lines}" />
    </StackPanel>
</UserControl>
`);
put("src/Planner.Desktop/Views/TopicsView.axaml.cs", String.raw`using Avalonia.Controls;

namespace Planner.Desktop;

public partial class TopicsView : UserControl
{
    public TopicsView()
    {
        InitializeComponent();
        SizeChanged += (_, e) => Arrange(e.NewSize.Width < 800);
    }

    /// <summary>Side by side when there is room; the detail under the list when narrow.</summary>
    void Arrange(bool narrow)
    {
        Layout.ColumnDefinitions = new ColumnDefinitions(narrow ? "*" : "*,*");
        Layout.RowDefinitions = new RowDefinitions(narrow ? "*,Auto" : "*");
        Grid.SetColumn(TopicDetail, narrow ? 0 : 1);
        Grid.SetRow(TopicDetail, narrow ? 1 : 0);
    }
}
`);
put("src/Planner.Desktop/Views/TopicEditorView.axaml.cs", String.raw`using Avalonia.Controls;

namespace Planner.Desktop;

public partial class TopicEditorView : UserControl
{
    public TopicEditorView()
    {
        InitializeComponent();
        Loaded += (_, _) => NameBox.Focus();
    }
}
`);
put("src/Planner.Desktop/Properties/PublishProfiles/release.pubxml", String.raw`<Project>
  <PropertyGroup>
    <Configuration>Release</Configuration>
    <RuntimeIdentifier>osx-arm64</RuntimeIdentifier>
    <SelfContained>true</SelfContained>
    <PublishSingleFile>true</PublishSingleFile>
    <PublishDir>../../publish/osx-arm64/</PublishDir>
  </PropertyGroup>
</Project>
`);
put("tests/Planner.Tests/PlannerTests.cs", String.raw`using Avalonia.Controls;
using Avalonia.Headless.XUnit;
using Avalonia.Threading;
using Microsoft.Extensions.Time.Testing;
using Planner.Core;
using Planner.Desktop;

namespace Planner.Tests;

class Mem(params Topic[] t) : ITopicStore
{
    public List<Topic> S = t.ToList();
    public Task<List<Topic>> LoadAsync(CancellationToken ct = default) => Task.FromResult(S.ToList());
    public Task SaveAsync(IReadOnlyList<Topic> topics, CancellationToken ct = default) { S = topics.ToList(); return Task.CompletedTask; }
}
class Nav : INavigator { public int Backs; public void GoTo(ViewModelBase p) { } public void Back() => Backs++; }

public class PlannerTests
{
    static FakeTimeProvider Clock() => new(new DateTimeOffset(2026, 10, 23, 9, 0, 0, TimeSpan.Zero));

    [AvaloniaFact]
    public async Task The_first_topic_gets_id_1()
    {
        var store = new Mem();
        var vm = new TopicEditorViewModel(store, new Nav(), null) { Name = "A", Subject = "cs" };
        await vm.SaveCommand.ExecuteAsync(null);
        Assert.Equal(1, store.S[0].Id);
    }

    [AvaloniaFact]
    public async Task Saving_goes_back_once()
    {
        var nav = new Nav();
        var vm = new TopicEditorViewModel(new Mem(), nav, null) { Name = "A", Subject = "cs" };
        await vm.SaveCommand.ExecuteAsync(null);
        Assert.Equal(1, nav.Backs);
    }

    [AvaloniaFact]
    public void Cancel_saves_nothing()
    {
        var store = new Mem();
        new TopicEditorViewModel(store, new Nav(), null) { Name = "A", Subject = "cs" }.CancelCommand.Execute(null);
        Assert.Empty(store.S);
    }

    [AvaloniaFact]
    public void Confidence_zero_is_an_error()
    {
        var vm = new TopicEditorViewModel(new Mem(), new Nav(), null) { Confidence = 0 };
        Assert.True(vm.HasErrors);
    }

    [AvaloniaFact]
    public void Back_at_the_start_does_nothing()
    {
        var shell = new ShellViewModel(new Mem(), Clock());
        var first = shell.Current;
        shell.Back();
        Assert.Same(first, shell.Current);
    }

    [AvaloniaFact]
    public void Coming_back_from_the_editor_reloads_the_list()
    {
        var store = new Mem();
        var shell = new ShellViewModel(store, Clock());
        ((TopicsViewModel)shell.Current).AddCommand.Execute(null);
        store.S.Add(new Topic(1, "cs", "New"));
        shell.Back();
        Assert.Single(((TopicsViewModel)shell.Current).Topics);
    }

    [AvaloniaFact]
    public void Next_is_empty_with_no_topics()
    {
        var shell = new ShellViewModel(new Mem(), Clock());
        shell.ShowNextCommand.Execute(null);
        Assert.Empty(((NextViewModel)shell.Current).Lines);
    }

    [AvaloniaFact]
    public void The_window_opens_on_the_topics_page()
    {
        var w = new MainWindow { DataContext = new ShellViewModel(new Mem(new Topic(1, "cs", "Big O")), Clock()) };
        w.Show();
        Dispatcher.UIThread.RunJobs();
        Assert.Equal(1, w.FindControl<ContentControl>("Page")!.Content is TopicsViewModel t ? t.Topics.Count : 0);
    }
}
`);
{ const f = path.join(d, "src/Planner.Desktop/Planner.Desktop.csproj"); const t = fs.readFileSync(f, "utf8"); if (!t.includes("  <PropertyGroup>\n")) throw new Error("edit anchor missing in src/Planner.Desktop/Planner.Desktop.csproj"); fs.writeFileSync(f, t.replace("  <PropertyGroup>\n", "  <PropertyGroup>\n    <Product>Planner</Product>\n    <Version>1.0.0</Version>\n")); }
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "The Planner on the desktop"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4,m5" && v.rep.protected.ok, "planner-desktop solved: every milestone passes, exit 0 (" + ms(v.rep) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/planner-desktop-report-solved.json"), v.text);
{ const f = path.join(d, "src/Planner.Desktop/Views/TopicsView.axaml.cs"); const t = fs.readFileSync(f, "utf8"); if (!t.includes("        SizeChanged += (_, e) => Arrange(e.NewSize.Width < 800);\n")) throw new Error("edit anchor missing in src/Planner.Desktop/Views/TopicsView.axaml.cs"); fs.writeFileSync(f, t.replace("        SizeChanged += (_, e) => Arrange(e.NewSize.Width < 800);\n", "")); }
fs.rmSync(path.join(d, "src/Planner.Desktop/Properties"), { recursive: true });
v = validate(d);
{ const at = (id) => v.rep.milestones.find((m) => m.id === id);
  expect(at("m3").ok && !at("m4").ok && !at("m5").ok, "planner-desktop with a fixed layout and no publish profile: m4 and m5 fail (" + at("m4").checks.map((c) => c.note).join(" · ") + " / " + at("m5").checks.map((c) => c.note).join(" · ") + ")"); }

/* ---------------- T1D: the Weather client ---------------- */
files = await window.KOS.codeProject.files("rp-t1d-weather");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "weather fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");

d = fresh();
put("src/Weather/WeatherClient.cs", String.raw`using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Weather;

/// <summary>Looks up forecasts from the weather API through the HttpClient it is given
/// (its BaseAddress already set). Milestones 1–4 in BRIEF.md.</summary>
public class WeatherClient(HttpClient http, WeatherOptions options)
{
    private readonly HttpClient http = http;
    private readonly WeatherOptions options = options;

    /// <summary>The forecast for a city, or null when the API does not know it.</summary>
    public async Task<Forecast?> GetAsync(string city, CancellationToken token = default)
    {
        if (string.IsNullOrWhiteSpace(options.ApiKey)) throw new WeatherException("No API key: set Weather:ApiKey with dotnet user-secrets.");
        string path = "forecast/" + Uri.EscapeDataString(city.Trim().ToLowerInvariant());
        string last = "";
        for (int attempt = 1; attempt <= options.Attempts; attempt++)
        {
            if (attempt > 1) await Task.Delay(options.Backoff * Math.Pow(2, attempt - 2), token);
            using var deadline = CancellationTokenSource.CreateLinkedTokenSource(token);
            deadline.CancelAfter(options.Timeout);
            var request = new HttpRequestMessage(HttpMethod.Get, path);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Add("X-Api-Key", options.ApiKey);
            try
            {
                using var response = await http.SendAsync(request, deadline.Token);
                if (response.IsSuccessStatusCode) return await response.Content.ReadFromJsonAsync<Forecast>(deadline.Token);
                int code = (int)response.StatusCode;
                if (response.StatusCode == HttpStatusCode.NotFound) return null;
                if (response.StatusCode == HttpStatusCode.Unauthorized) throw new WeatherException("The API key was refused.");
                if (!(code is 408 or 429 || code >= 500)) throw new WeatherException($"The weather service said {code} {response.ReasonPhrase}.");
                last = $"{code} {response.ReasonPhrase}";
            }
            catch (OperationCanceledException) when (!token.IsCancellationRequested)
            {
                last = "timed out";
            }
            catch (HttpRequestException e)
            {
                last = e.Message;
            }
        }
        throw new WeatherException($"No forecast after {options.Attempts} attempts: {last}.");
    }
}
`);
put("src/Weather.Cli/Program.cs", String.raw`using System.Globalization;
using Microsoft.Extensions.Configuration;
using Weather;
using Weather.Cli;

var config = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json")
    .AddUserSecrets<Program>(optional: true)
    .AddEnvironmentVariables()
    .Build();
var options = config.GetSection("Weather").Get<WeatherOptions>() ?? new WeatherOptions();
bool demo = options.BaseUrl == "demo";
var http = new HttpClient(demo ? new DemoServer() : new HttpClientHandler())
{
    BaseAddress = new Uri(demo ? "https://demo.weather/v1/" : options.BaseUrl)
};
var weather = new WeatherClient(http, options);

string? line;
while ((line = Console.ReadLine()) is not null)
{
    string city = line.Trim();
    if (city == "quit") break;
    if (city.Length == 0) continue;
    try
    {
        var f = await weather.GetAsync(city);
        Console.WriteLine(f is null ? $"{city}: not found" : $"{f.City}: {f.TempC.ToString(CultureInfo.InvariantCulture)} C, {f.Summary}");
    }
    catch (WeatherException e)
    {
        Console.WriteLine("Error: " + e.Message);
    }
}
Console.WriteLine("Bye.");
`);
put("tests/Weather.Tests/ClientTests.cs", String.raw`using System.Net;
using System.Text;

namespace Weather.Tests;

public class ClientTests
{
    class Fake(Func<int, HttpResponseMessage> answer) : HttpMessageHandler
    {
        public int Calls;
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token) => Task.FromResult(answer(++Calls));
    }

    static WeatherClient On(Fake fake) => new(new HttpClient(fake) { BaseAddress = new Uri("https://w.test/") }, new WeatherOptions { ApiKey = "k", Backoff = TimeSpan.Zero });
    static HttpResponseMessage Hull() => new(HttpStatusCode.OK) { Content = new StringContent("""{"city":"Hull","tempC":12,"summary":"wind"}""", Encoding.UTF8, "application/json") };

    [Fact]
    public async Task Reads_a_forecast() => Assert.Equal("Hull", (await On(new Fake(_ => Hull())).GetAsync("hull"))!.City);

    [Fact]
    public async Task Not_found_is_null() => Assert.Null(await On(new Fake(_ => new HttpResponseMessage(HttpStatusCode.NotFound))).GetAsync("x"));

    [Fact]
    public async Task Retries_a_504()
    {
        var fake = new Fake(n => n == 1 ? new HttpResponseMessage(HttpStatusCode.GatewayTimeout) : Hull());
        Assert.NotNull(await On(fake).GetAsync("hull"));
        Assert.Equal(2, fake.Calls);
    }

    [Fact]
    public async Task A_403_is_not_retried()
    {
        var fake = new Fake(_ => new HttpResponseMessage(HttpStatusCode.Forbidden));
        await Assert.ThrowsAsync<WeatherException>(() => On(fake).GetAsync("hull"));
        Assert.Equal(1, fake.Calls);
    }

    [Fact]
    public async Task Gives_up_on_a_server_that_is_always_down()
    {
        var fake = new Fake(_ => new HttpResponseMessage(HttpStatusCode.ServiceUnavailable));
        var e = await Assert.ThrowsAsync<WeatherException>(() => On(fake).GetAsync("hull"));
        Assert.Contains("503", e.Message);
    }
}
`);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "The weather client"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4,m5" && v.rep.protected.ok, "weather solved: every milestone passes, exit 0 (" + ms(v.rep) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/weather-report-solved.json"), v.text);
{ const f = path.join(d, "src/Weather/WeatherClient.cs"); const t = fs.readFileSync(f, "utf8");
  const a = "if (!(code is 408 or 429 || code >= 500)) throw new WeatherException", b = "request.Headers.Add(\"X-Api-Key\", options.ApiKey);";
  if (!t.includes(a) || !t.includes(b)) throw new Error("edit anchor missing in src/Weather/WeatherClient.cs");
  fs.writeFileSync(f, t.replace(a, "if (code == 418) throw new WeatherException").replace(b, "request.RequestUri = new Uri(path + \"?key=\" + options.ApiKey, UriKind.Relative);")); }
v = validate(d);
{ const at = (id) => v.rep.milestones.find((m) => m.id === id);
  expect(at("m3").ok && !at("m2").ok && !at("m4").ok, "weather retrying a 400 and its key in the URL: m2 and m4 fail (" + at("m2").checks.map((c) => c.note).join(" · ") + " / " + at("m4").checks.map((c) => c.note).join(" · ") + ")"); }

/* ---------------- T1E: Loopback chat ---------------- */
files = await window.KOS.codeProject.files("rp-t1e-chat");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "chat fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");

d = fresh();
put("src/Chat/ChatServer.cs", String.raw`using System.Net;
using System.Net.Sockets;
using System.Text.RegularExpressions;

namespace Chat;

/// <summary>A chat server on one address and port (0 = any free one). It speaks the line
/// protocol in BRIEF.md to every client at once. Milestones 1–4.</summary>
public sealed partial class ChatServer(IPAddress address, int port = 0) : IAsyncDisposable
{
    private readonly TcpListener listener = new(address, port);
    private readonly CancellationTokenSource stop = new();
    private readonly Dictionary<TcpClient, Member> members = new();
    private readonly object gate = new();
    private Task loop = Task.CompletedTask;
    private bool stopped;

    private sealed class Member(StreamWriter writer)
    {
        public StreamWriter Writer { get; } = writer;
        public string? Name { get; set; }
        public SemaphoreSlim Sending { get; } = new(1, 1);
    }

    /// <summary>The port it listens on, once started.</summary>
    public int Port => ((IPEndPoint)listener.LocalEndpoint).Port;

    /// <summary>Starts listening, and accepts clients in the background; returns at once.</summary>
    public void Start()
    {
        listener.Start();
        loop = AcceptLoop(stop.Token);
    }

    private async Task AcceptLoop(CancellationToken token)
    {
        var serving = new List<Task>();
        while (!token.IsCancellationRequested)
        {
            TcpClient client;
            try { client = await listener.AcceptTcpClientAsync(token); }
            catch (Exception e) when (e is OperationCanceledException or SocketException or ObjectDisposedException) { break; }
            serving.Add(Serve(client, token));
            serving.RemoveAll(t => t.IsCompleted);
        }
        await Task.WhenAll(serving);
    }

    private async Task Serve(TcpClient client, CancellationToken token)
    {
        using (client)
        {
            var reader = new StreamReader(client.GetStream());
            var me = new Member(new StreamWriter(client.GetStream()) { AutoFlush = true });
            lock (gate) members[client] = me;
            try
            {
                await Send(me, "WELCOME KurenaiChat");
                string? line;
                while ((line = await reader.ReadLineAsync(token)) is not null)
                {
                    if (!await Handle(me, line)) break;
                }
            }
            catch (Exception e) when (e is IOException or OperationCanceledException or ObjectDisposedException) { }
            finally
            {
                string? name;
                lock (gate)
                {
                    members.Remove(client);
                    name = me.Name;
                }
                if (name is not null && !token.IsCancellationRequested) await Broadcast($"LEAVE {name}", except: me);
            }
        }
    }

    /// <summary>Answers one line; false once the client has quit.</summary>
    private async Task<bool> Handle(Member me, string line)
    {
        string command = line.Split(' ', 2)[0];
        string rest = line.Length > command.Length ? line[(command.Length + 1)..] : "";
        switch (command)
        {
            case "PING":
                await Send(me, "PONG");
                return true;
            case "QUIT":
                await Send(me, "BYE");
                return false;
            case "WHO":
                string[] names;
                lock (gate) names = members.Values.Select(m => m.Name).OfType<string>().Order(StringComparer.Ordinal).ToArray();
                await Send(me, names.Length == 0 ? "USERS" : "USERS " + string.Join(", ", names));
                return true;
            case "NICK":
                await Send(me, Nick(me, rest));
                if (me.Name == rest) await Broadcast($"JOIN {rest}", except: me);
                return true;
            case "SAY":
                if (me.Name is null) await Send(me, "ERR NICK first");
                else await Broadcast($"MSG {me.Name}: {rest}");
                return true;
            default:
                await Send(me, "ERR unknown command");
                return true;
        }
    }

    private string Nick(Member me, string name)
    {
        if (!NameRule().IsMatch(name)) return "ERR bad name";
        lock (gate)
        {
            if (me.Name is not null) return "ERR already named";
            if (members.Values.Any(m => m.Name == name)) return "ERR name taken";
            me.Name = name;
        }
        return "OK " + name;
    }

    [GeneratedRegex("^[A-Za-z0-9_-]{1,16}$")]
    private static partial Regex NameRule();

    private static async Task Send(Member to, string line)
    {
        await to.Sending.WaitAsync();
        try { await to.Writer.WriteLineAsync(line); }
        finally { to.Sending.Release(); }
    }

    /// <summary>Sends a line to every named client; one that has gone is skipped.</summary>
    private async Task Broadcast(string line, Member? except = null)
    {
        Member[] all;
        lock (gate) all = members.Values.Where(m => m.Name is not null && m != except).ToArray();
        foreach (var m in all)
        {
            try { await Send(m, line); }
            catch (Exception e) when (e is IOException or ObjectDisposedException) { }
        }
    }

    /// <summary>Stops accepting, closes every client, and returns once the port is free.</summary>
    public async Task StopAsync()
    {
        lock (gate)
        {
            if (stopped) return;
            stopped = true;
        }
        stop.Cancel();
        listener.Stop();
        TcpClient[] open;
        lock (gate) open = members.Keys.ToArray();
        foreach (var c in open) c.Close();
        await loop;
    }

    public async ValueTask DisposeAsync() => await StopAsync();
}
`);
put("src/Chat.Cli/Program.cs", String.raw`using System.Net;
using System.Net.Sockets;
using Chat;

await using var server = new ChatServer(IPAddress.Loopback);
server.Start();
using var client = new TcpClient();
await client.ConnectAsync(IPAddress.Loopback, server.Port);
var reader = new StreamReader(client.GetStream());
var writer = new StreamWriter(client.GetStream()) { AutoFlush = true };

var printer = Task.Run(async () =>
{
    string? line;
    while ((line = await reader.ReadLineAsync()) is not null) Console.WriteLine(line);
});
string? typed;
while (!printer.IsCompleted && (typed = Console.ReadLine()) is not null)
{
    try { await writer.WriteLineAsync(typed); }
    catch (IOException) { break; }
}
await printer;
`);
put("tests/Chat.Tests/ProtocolTests.cs", String.raw`namespace Chat.Tests;

public class ProtocolTests
{
    static async Task<(TcpClient, Reader, StreamWriter)> Connect(int port)
    {
        var c = new TcpClient();
        await c.ConnectAsync(IPAddress.Loopback, port);
        var r = new Reader(new StreamReader(c.GetStream()));
        await r.ReadLineAsync();
        return (c, r, new StreamWriter(c.GetStream()) { AutoFlush = true });
    }

    /// <summary>Every read has a deadline, so a server that never answers fails the test instead of hanging it.</summary>
    sealed class Reader(StreamReader inner)
    {
        public async Task<string?> ReadLineAsync()
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
            return await inner.ReadLineAsync(cts.Token);
        }
    }

    [Fact]
    public async Task Ping_pong()
    {
        await using var s = new ChatServer(IPAddress.Loopback);
        s.Start();
        var (c, r, w) = await Connect(s.Port);
        using (c) { await w.WriteLineAsync("PING"); Assert.Equal("PONG", await r.ReadLineAsync()); }
    }

    [Fact]
    public async Task Sixteen_characters_is_a_good_name()
    {
        await using var s = new ChatServer(IPAddress.Loopback);
        s.Start();
        var (c, r, w) = await Connect(s.Port);
        using (c) { await w.WriteLineAsync("NICK abcdefghijklmnop"); Assert.Equal("OK abcdefghijklmnop", await r.ReadLineAsync()); }
    }

    [Fact]
    public async Task Names_are_case_sensitive()
    {
        await using var s = new ChatServer(IPAddress.Loopback);
        s.Start();
        var (a, ra, wa) = await Connect(s.Port);
        var (b, rb, wb) = await Connect(s.Port);
        using (a) using (b)
        {
            await wa.WriteLineAsync("NICK ana"); await ra.ReadLineAsync();
            await wb.WriteLineAsync("NICK Ana"); Assert.Equal("OK Ana", await rb.ReadLineAsync());
        }
    }

    [Fact]
    public async Task Say_keeps_the_text_as_typed()
    {
        await using var s = new ChatServer(IPAddress.Loopback);
        s.Start();
        var (c, r, w) = await Connect(s.Port);
        using (c)
        {
            await w.WriteLineAsync("NICK ana"); await r.ReadLineAsync();
            await w.WriteLineAsync("SAY  two  spaces "); Assert.Equal("MSG ana:  two  spaces ", await r.ReadLineAsync());
        }
    }

    [Fact]
    public async Task Stop_twice_is_fine()
    {
        var s = new ChatServer(IPAddress.Loopback);
        s.Start();
        await s.StopAsync();
        await s.StopAsync();
    }
}
`);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "Loopback chat"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4" && v.rep.protected.ok, "chat solved: every milestone passes, exit 0 (" + ms(v.rep) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/chat-report-solved.json"), v.text);
{ const f = path.join(d, "src/Chat/ChatServer.cs"); const t = fs.readFileSync(f, "utf8");
  const a = "serving.Add(Serve(client, token));";
  if (!t.includes(a)) throw new Error("edit anchor missing in src/Chat/ChatServer.cs");
  fs.writeFileSync(f, t.replace(a, "await Serve(client, token);")); }
v = validate(d);
{ const at = (id) => v.rep.milestones.find((m) => m.id === id);
  expect(at("m1").ok && !at("m2").ok && !at("m3").ok, "chat serving one client at a time: m2 and m3 fail (" + at("m2").checks.map((c) => c.note).join(" · ") + ")"); }

/* ---------------- T1F: the Track T1 capstone, The Planner goes online ---------------- */
files = await window.KOS.codeProject.files("rp-ct1-planner");
d = fresh(); v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "" && v.rep.protected.ok, "planner-api fresh: builds, no milestone passes, protected files match (" + ms(v.rep) + ")");

d = fresh();
put("src/Planner.Api/Data.cs", String.raw`using Microsoft.EntityFrameworkCore;

namespace Planner.Api;

public class Topic
{
    public int Id { get; set; }
    public string Subject { get; set; } = "";
    public string Title { get; set; } = "";
    public int Confidence { get; set; }
    public DateOnly? LastStudied { get; set; }
    public List<StudySession> Sessions { get; } = new();
}

public class StudySession
{
    public int Id { get; set; }
    public int TopicId { get; set; }
    public DateOnly Date { get; set; }
    public int Minutes { get; set; }
}

public class PlannerDb(DbContextOptions<PlannerDb> options) : DbContext(options)
{
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<StudySession> Sessions => Set<StudySession>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Topic>().Property(t => t.Title).HasMaxLength(60);
        model.Entity<Topic>().HasMany(t => t.Sessions).WithOne().HasForeignKey(s => s.TopicId).OnDelete(DeleteBehavior.Cascade);
    }
}
`);
put("src/Planner.Api/Contracts.cs", String.raw`namespace Planner.Api;

/// <summary>What the API reads and writes: never the entities themselves.</summary>
public record TopicIn(string? Subject, string? Title, int Confidence)
{
    public Dictionary<string, string[]> Errors()
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(Subject)) errors["subject"] = new[] { "Choose a subject." };
        if (string.IsNullOrWhiteSpace(Title)) errors["title"] = new[] { "Give the topic a title." };
        else if (Title.Trim().Length > 60) errors["title"] = new[] { "At most 60 characters." };
        if (Confidence is < 1 or > 5) errors["confidence"] = new[] { "Confidence is 1 to 5." };
        return errors;
    }

    public void CopyTo(Topic t)
    {
        t.Subject = Subject!.Trim().ToLowerInvariant();
        t.Title = Title!.Trim();
        t.Confidence = Confidence;
    }
}

public record TopicOut(int Id, string Subject, string Title, int Confidence, DateOnly? LastStudied)
{
    public static TopicOut Of(Topic t) => new(t.Id, t.Subject, t.Title, t.Confidence, t.LastStudied);
}

public record SessionIn(DateOnly Date, int Minutes);

public record SessionOut(int Id, int TopicId, DateOnly Date, int Minutes)
{
    public static SessionOut Of(StudySession s) => new(s.Id, s.TopicId, s.Date, s.Minutes);
}
`);
put("src/Planner.Api/Program.cs", String.raw`using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Planner.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<PlannerDb>(o => o.UseSqlite(builder.Configuration.GetConnectionString("Planner")));
builder.Services.AddProblemDetails();
var app = builder.Build();

using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<PlannerDb>().Database.Migrate();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

var topics = app.MapGroup("/topics").AddEndpointFilter(async (context, next) =>
{
    string expected = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>()["Planner:ApiKey"] ?? "";
    string given = context.HttpContext.Request.Headers["X-Api-Key"].ToString();
    bool ok = expected.Length > 0 && CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(given), Encoding.UTF8.GetBytes(expected));
    return ok ? await next(context) : Results.Unauthorized();
});

topics.MapGet("", async (string? subject, PlannerDb db) =>
{
    var query = db.Topics.AsNoTracking();
    if (!string.IsNullOrWhiteSpace(subject))
    {
        string s = subject.Trim().ToLowerInvariant();
        query = query.Where(t => t.Subject == s);
    }
    return await query.OrderBy(t => t.Id).Select(t => new TopicOut(t.Id, t.Subject, t.Title, t.Confidence, t.LastStudied)).ToListAsync();
});

topics.MapGet("{id:int}", async (int id, PlannerDb db) =>
    await db.Topics.FindAsync(id) is { } t ? Results.Ok(TopicOut.Of(t)) : Results.NotFound());

topics.MapPost("", async (TopicIn input, PlannerDb db) =>
{
    var errors = input.Errors();
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    var t = new Topic();
    input.CopyTo(t);
    db.Topics.Add(t);
    await db.SaveChangesAsync();
    return Results.Created($"/topics/{t.Id}", TopicOut.Of(t));
});

topics.MapPut("{id:int}", async (int id, TopicIn input, PlannerDb db) =>
{
    if (await db.Topics.FindAsync(id) is not { } t) return Results.NotFound();
    var errors = input.Errors();
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    input.CopyTo(t);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

topics.MapDelete("{id:int}", async (int id, PlannerDb db) =>
    await db.Topics.Where(t => t.Id == id).ExecuteDeleteAsync() == 1 ? Results.NoContent() : Results.NotFound());

topics.MapGet("{id:int}/sessions", async (int id, PlannerDb db) =>
    await db.Topics.AnyAsync(t => t.Id == id)
        ? Results.Ok(await db.Sessions.Where(s => s.TopicId == id).OrderBy(s => s.Date).ThenBy(s => s.Id).Select(s => new SessionOut(s.Id, s.TopicId, s.Date, s.Minutes)).ToListAsync())
        : Results.NotFound());

topics.MapPost("{id:int}/sessions", async (int id, SessionIn input, PlannerDb db) =>
{
    if (await db.Topics.FindAsync(id) is not { } t) return Results.NotFound();
    if (input.Minutes is < 1 or > 600)
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["minutes"] = new[] { "Minutes are 1 to 600." } });
    var s = new StudySession { TopicId = id, Date = input.Date, Minutes = input.Minutes };
    db.Sessions.Add(s);
    if (t.LastStudied is null || input.Date > t.LastStudied) t.LastStudied = input.Date;
    await db.SaveChangesAsync();
    return Results.Created($"/topics/{id}/sessions/{s.Id}", SessionOut.Of(s));
});

app.Run();
`);
put("tests/Planner.Tests/ApiTests.cs", String.raw`using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Planner.Tests;

public class ApiTests : IAsyncLifetime
{
    sealed class App(string db) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:Planner", $"Data Source={db}");
            builder.UseSetting("Planner:ApiKey", "mine");
        }
    }

    readonly string db = Path.Combine(Path.GetTempPath(), $"planner-mine-{Guid.NewGuid():N}.db");
    App app = null!;
    HttpClient c = null!;

    public Task InitializeAsync()
    {
        app = new App(db);
        c = app.CreateClient();
        c.DefaultRequestHeaders.Add("X-Api-Key", "mine");
        return Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        await app.DisposeAsync();
        Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
        File.Delete(db);
    }

    Task<HttpResponseMessage> Add(string title, int confidence = 3) => c.PostAsJsonAsync("/topics", new { subject = "cs", title, confidence });

    [Fact]
    public async Task Ids_count_up() { await Add("A"); Assert.Equal("/topics/2", (await Add("B")).Headers.Location!.OriginalString); }

    [Fact]
    public async Task Sixty_characters_is_allowed() => Assert.Equal(HttpStatusCode.Created, (await Add(new string('x', 60))).StatusCode);

    [Fact]
    public async Task Confidence_five_is_allowed_six_is_not()
    {
        Assert.Equal(HttpStatusCode.Created, (await Add("A", 5)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Add("B", 6)).StatusCode);
    }

    [Fact]
    public async Task A_lowercase_header_name_still_counts()
    {
        var other = app.CreateClient();
        other.DefaultRequestHeaders.Add("x-api-key", "mine");
        Assert.Equal(HttpStatusCode.OK, (await other.GetAsync("/topics")).StatusCode);
    }

    [Fact]
    public async Task An_earlier_session_does_not_move_last_studied_back()
    {
        await Add("A");
        await c.PostAsJsonAsync("/topics/1/sessions", new { date = "2026-10-10", minutes = 5 });
        await c.PostAsJsonAsync("/topics/1/sessions", new { date = "2026-09-01", minutes = 5 });
        var json = await c.GetStringAsync("/topics/1");
        Assert.Contains("\"lastStudied\":\"2026-10-10\"", json);
    }

    [Fact]
    public async Task Minutes_over_600_are_refused()
    {
        await Add("A");
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync("/topics/1/sessions", new { date = "2026-10-10", minutes = 601 })).StatusCode);
    }

    [Fact]
    public async Task Put_keeps_last_studied()
    {
        await Add("A");
        await c.PostAsJsonAsync("/topics/1/sessions", new { date = "2026-10-10", minutes = 5 });
        await c.PutAsJsonAsync("/topics/1", new { subject = "cs", title = "A2", confidence = 4 });
        Assert.Contains("\"lastStudied\":\"2026-10-10\"", await c.GetStringAsync("/topics/1"));
    }
}
`);
sh("dotnet", ["tool", "restore"], d);
sh("dotnet", ["build", "-nologo", "-v", "q"], d);
{ const mig = sh("dotnet", ["ef", "migrations", "add", "Initial", "--project", "src/Planner.Api"], d);
  expect(mig.status === 0 && fs.readdirSync(path.join(d, "src/Planner.Api/Migrations")).some((f) => /_Initial\.cs$/.test(f)), "planner-api: dotnet ef (restored from the manifest) adds the first migration"); }
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "The Planner goes online"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4,m5" && v.rep.protected.ok, "planner-api solved: every milestone passes, exit 0 (" + ms(v.rep) + ")");
if (v.exit !== 0) console.log(v.out.split("\n").slice(-30).join("\n") + "\n(folder " + d + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/planner-api-report-solved.json"), v.text);
{ const f = path.join(d, "src/Planner.Api/Program.cs"); const t = fs.readFileSync(f, "utf8");
  const a = "    scope.ServiceProvider.GetRequiredService<PlannerDb>().Database.Migrate();", b = "    return ok ? await next(context) : Results.Unauthorized();";
  if (!t.includes(a) || !t.includes(b)) throw new Error("edit anchor missing in src/Planner.Api/Program.cs");
  fs.writeFileSync(f, t.replace(a, "    scope.ServiceProvider.GetRequiredService<PlannerDb>().Database.EnsureCreated();").replace(b, "    return ok || expected.Length == 0 ? await next(context) : Results.Unauthorized();")); }
v = validate(d);
{ const at = (id) => v.rep.milestones.find((m) => m.id === id);
  expect(at("m1").ok && at("m2").ok && !at("m3").ok && !at("m4").ok, "planner-api with EnsureCreated and open when no key is set: m3 and m4 fail (" + at("m3").checks.map((c) => c.note).join(" · ") + " / " + at("m4").checks.map((c) => c.note).join(" · ") + ")"); }

console.log(bad ? "✗ " + bad + " check(s) failed" : "✓ the validator behaves on every scenario");
process.exit(bad ? 1 : 0);
