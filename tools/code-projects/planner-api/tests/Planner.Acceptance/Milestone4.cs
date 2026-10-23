namespace Planner.Acceptance;

/// <summary>Milestone 4 · locked with a key from configuration, never from the code.</summary>
public class Milestone4
{
    [Theory]
    [InlineData("GET", "/topics")]
    [InlineData("GET", "/topics/1")]
    [InlineData("POST", "/topics")]
    [InlineData("PUT", "/topics/1")]
    [InlineData("DELETE", "/topics/1")]
    [InlineData("GET", "/topics/1/sessions")]
    [InlineData("POST", "/topics/1/sessions")]
    public async Task Without_the_key_every_topic_route_is_401(string method, string path)
    {
        await using var api = new Api();
        var request = new HttpRequestMessage(new HttpMethod(method), path);
        if (method is "POST" or "PUT") request.Content = JsonContent.Create(new { subject = "cs", title = "X", confidence = 1, date = "2026-10-20", minutes = 5 });
        Assert.Equal(HttpStatusCode.Unauthorized, (await api.Client(withKey: null).SendAsync(request)).StatusCode);
    }

    [Fact]
    public async Task A_wrong_key_is_401_and_changes_nothing()
    {
        await using var api = new Api();
        Assert.Equal(HttpStatusCode.Unauthorized, (await api.Client("guess").PostAsJsonAsync("/topics", new { subject = "cs", title = "X", confidence = 1 })).StatusCode);
        Assert.Empty((await api.Client().GetFromJsonAsync<List<Api.Topic>>("/topics"))!);
    }

    [Fact]
    public async Task The_key_comes_from_configuration()
    {
        await using var api = new Api(key: "another-key-7");
        Assert.Equal(HttpStatusCode.Unauthorized, (await api.Client().GetAsync("/topics")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await api.Client("another-key-7").GetAsync("/topics")).StatusCode);
    }

    [Fact]
    public async Task With_no_key_configured_nothing_is_open()
    {
        await using var api = new Api(key: null);
        Assert.Equal(HttpStatusCode.Unauthorized, (await api.Client("").GetAsync("/topics")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await api.Client(withKey: null).GetAsync("/topics")).StatusCode);
    }

    [Fact]
    public async Task Health_needs_no_key()
    {
        await using var api = new Api();
        Assert.Equal(HttpStatusCode.OK, (await api.Client(withKey: null).GetAsync("/health")).StatusCode);
    }
}
