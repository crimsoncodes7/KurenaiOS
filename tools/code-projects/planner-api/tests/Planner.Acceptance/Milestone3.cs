using Microsoft.Data.Sqlite;

namespace Planner.Acceptance;

/// <summary>Milestone 3 · persisted with EF Core and migrations; study sessions as a sub-resource.</summary>
public class Milestone3
{
    [Fact]
    public async Task Topics_survive_a_restart()
    {
        string file;
        await using (var first = new Api())
        {
            file = first.DbFile;
            await Api.Add(first.Client(), "cs", "Big O", 3);
            await first.DisposeAsyncKeepingDatabase();
        }
        await using var second = new Api(dbFile: file);
        Assert.Equal("Big O", Assert.Single((await second.Client().GetFromJsonAsync<List<Api.Topic>>("/topics"))!).Title);
    }

    [Fact]
    public async Task The_database_is_made_by_migrations()
    {
        await using var api = new Api();
        await api.Client().GetAsync("/topics");
        using var db = new SqliteConnection($"Data Source={api.DbFile}");
        db.Open();
        using var cmd = db.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = '__EFMigrationsHistory'";
        Assert.Equal(1L, (long)cmd.ExecuteScalar()!);
        cmd.CommandText = "SELECT COUNT(*) FROM __EFMigrationsHistory";
        Assert.True((long)cmd.ExecuteScalar()! >= 1);
    }

    [Fact]
    public async Task A_session_is_created_and_moves_last_studied()
    {
        await using var api = new Api();
        var c = api.Client();
        await Api.Add(c, "cs", "Big O", 3);
        var r = await c.PostAsJsonAsync("/topics/1/sessions", new { date = "2026-10-20", minutes = 25 });
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        Assert.Equal("/topics/1/sessions/1", r.Headers.Location!.OriginalString);
        Assert.Equal(new Api.Session(1, 1, new DateOnly(2026, 10, 20), 25), await r.Content.ReadFromJsonAsync<Api.Session>());
        await c.PostAsJsonAsync("/topics/1/sessions", new { date = "2026-10-18", minutes = 40 });
        Assert.Equal(new DateOnly(2026, 10, 20), (await c.GetFromJsonAsync<Api.Topic>("/topics/1"))!.LastStudied);
    }

    [Fact]
    public async Task Sessions_are_listed_by_date()
    {
        await using var api = new Api();
        var c = api.Client();
        await Api.Add(c, "cs", "Big O", 3);
        await c.PostAsJsonAsync("/topics/1/sessions", new { date = "2026-10-20", minutes = 25 });
        await c.PostAsJsonAsync("/topics/1/sessions", new { date = "2026-10-18", minutes = 40 });
        Assert.Equal(new[] { 40, 25 }, (await c.GetFromJsonAsync<List<Api.Session>>("/topics/1/sessions"))!.Select(s => s.Minutes));
    }

    [Fact]
    public async Task Sessions_need_a_topic_and_sensible_minutes()
    {
        await using var api = new Api();
        var c = api.Client();
        Assert.Equal(HttpStatusCode.NotFound, (await c.PostAsJsonAsync("/topics/7/sessions", new { date = "2026-10-20", minutes = 25 })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.GetAsync("/topics/7/sessions")).StatusCode);
        await Api.Add(c, "cs", "Big O", 3);
        var errors = await Api.Errors(await c.PostAsJsonAsync("/topics/1/sessions", new { date = "2026-10-20", minutes = 0 }));
        Assert.Equal(new[] { "Minutes are 1 to 600." }, errors["minutes"]);
    }

    [Fact]
    public async Task Deleting_a_topic_deletes_its_sessions()
    {
        await using var api = new Api();
        var c = api.Client();
        await Api.Add(c, "cs", "Big O", 3);
        await c.PostAsJsonAsync("/topics/1/sessions", new { date = "2026-10-20", minutes = 25 });
        await c.DeleteAsync("/topics/1");
        using var db = new SqliteConnection($"Data Source={api.DbFile}");
        db.Open();
        using var cmd = db.CreateCommand();
        cmd.CommandText = "SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE '%ession%' AND name NOT LIKE '\\_\\_EF%' ESCAPE '\\'";
        string table = (string)cmd.ExecuteScalar()!;
        cmd.CommandText = $"SELECT COUNT(*) FROM \"{table}\"";
        Assert.Equal(0L, (long)cmd.ExecuteScalar()!);
    }
}
