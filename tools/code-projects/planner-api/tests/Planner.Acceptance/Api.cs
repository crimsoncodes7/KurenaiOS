using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;

namespace Planner.Acceptance;

/// <summary>The whole API, started in memory by WebApplicationFactory: its own SQLite file,
/// the "Testing" environment (so no user secrets), and the key the test chooses.</summary>
public sealed class Api : WebApplicationFactory<Program>
{
    public const string Key = "test-key-0001";

    public string DbFile { get; }
    private readonly string? key;

    public Api(string? key = Key, string? dbFile = null)
    {
        this.key = key;
        DbFile = dbFile ?? Path.Combine(Path.GetTempPath(), $"kos-planner-{Guid.NewGuid():N}.db");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Planner", $"Data Source={DbFile}");
        builder.UseSetting("Planner:ApiKey", key ?? "");
    }

    /// <summary>A client sending the key (or the one given, or none).</summary>
    public HttpClient Client(string? withKey = Key)
    {
        var c = CreateClient();
        if (withKey is not null) c.DefaultRequestHeaders.Add("X-Api-Key", withKey);
        return c;
    }

    public void DeleteDatabase()
    {
        SqliteConnection.ClearAllPools();
        foreach (var f in new[] { DbFile, DbFile + "-shm", DbFile + "-wal" }) if (File.Exists(f)) File.Delete(f);
    }

    private bool keep;

    /// <summary>Stops the app but leaves its database, for a second app to open.</summary>
    public async Task DisposeAsyncKeepingDatabase()
    {
        keep = true;
        await base.DisposeAsync();
        SqliteConnection.ClearAllPools();
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        if (!keep) DeleteDatabase();
    }

    /// <summary>A topic as the API writes it.</summary>
    public record Topic(int Id, string Subject, string Title, int Confidence, DateOnly? LastStudied);
    public record Session(int Id, int TopicId, DateOnly Date, int Minutes);

    public static async Task<Topic> Add(HttpClient c, string subject, string title, int confidence)
    {
        var r = await c.PostAsJsonAsync("/topics", new { subject, title, confidence });
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        return (await r.Content.ReadFromJsonAsync<Topic>())!;
    }

    /// <summary>The field errors of a 400 problem details body, keys in lower case.</summary>
    public static async Task<Dictionary<string, string[]>> Errors(HttpResponseMessage r)
    {
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
        Assert.Equal("application/problem+json", r.Content.Headers.ContentType?.MediaType);
        using var doc = JsonDocument.Parse(await r.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("errors").EnumerateObject()
            .ToDictionary(p => p.Name.ToLowerInvariant(), p => p.Value.EnumerateArray().Select(e => e.GetString()!).ToArray());
    }
}
