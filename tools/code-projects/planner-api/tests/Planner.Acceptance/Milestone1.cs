namespace Planner.Acceptance;

/// <summary>Milestone 1 · the endpoints: list, read, create, replace, delete.</summary>
public class Milestone1
{
    [Fact]
    public async Task Health_answers()
    {
        await using var api = new Api();
        var r = await api.Client().GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
    }

    [Fact]
    public async Task A_new_planner_has_no_topics()
    {
        await using var api = new Api();
        Assert.Empty((await api.Client().GetFromJsonAsync<List<Api.Topic>>("/topics"))!);
    }

    [Fact]
    public async Task POST_creates_a_topic_with_201_and_its_Location()
    {
        await using var api = new Api();
        var r = await api.Client().PostAsJsonAsync("/topics", new { subject = "cs", title = "Big O", confidence = 3 });
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        Assert.Equal("/topics/1", r.Headers.Location!.OriginalString);
        Assert.Equal(new Api.Topic(1, "cs", "Big O", 3, null), await r.Content.ReadFromJsonAsync<Api.Topic>());
    }

    [Fact]
    public async Task Topics_are_listed_by_id_and_read_one_at_a_time()
    {
        await using var api = new Api();
        var c = api.Client();
        await Api.Add(c, "maths", "Vectors", 2);
        await Api.Add(c, "cs", "Big O", 4);
        Assert.Equal(new[] { "Vectors", "Big O" }, (await c.GetFromJsonAsync<List<Api.Topic>>("/topics"))!.Select(t => t.Title));
        Assert.Equal("Big O", (await c.GetFromJsonAsync<Api.Topic>("/topics/2"))!.Title);
    }

    [Fact]
    public async Task A_missing_topic_is_404()
    {
        await using var api = new Api();
        var c = api.Client();
        Assert.Equal(HttpStatusCode.NotFound, (await c.GetAsync("/topics/9")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.PutAsJsonAsync("/topics/9", new { subject = "cs", title = "X", confidence = 1 })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.DeleteAsync("/topics/9")).StatusCode);
    }

    [Fact]
    public async Task PUT_replaces_and_DELETE_removes_with_204()
    {
        await using var api = new Api();
        var c = api.Client();
        await Api.Add(c, "cs", "Big O", 3);
        Assert.Equal(HttpStatusCode.NoContent, (await c.PutAsJsonAsync("/topics/1", new { subject = "cs", title = "Big O notation", confidence = 5 })).StatusCode);
        Assert.Equal(new Api.Topic(1, "cs", "Big O notation", 5, null), await c.GetFromJsonAsync<Api.Topic>("/topics/1"));
        Assert.Equal(HttpStatusCode.NoContent, (await c.DeleteAsync("/topics/1")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.GetAsync("/topics/1")).StatusCode);
    }
}
