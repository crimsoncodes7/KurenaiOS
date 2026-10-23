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
   500px (m3 and m2 fail). Needs the .NET 10 SDK, NuGet and git; outside
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
for (const f of ["js/data/code.js", "js/data/content/code-ub.js", "js/data/content/code-u10.js", "js/data/content/code-c4.js", "js/data/content/code-t1b.js", "js/data/content/code-t1c.js", "js/data/content/code-t2a.js", "js/data/content/code-projects-files.js", "js/core/codezip.js", "js/core/codeproj.js"]) require(path.join(ROOT, f));
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

console.log(bad ? "✗ " + bad + " check(s) failed" : "✓ the validator behaves on every scenario");
process.exit(bad ? 1 : 0);
