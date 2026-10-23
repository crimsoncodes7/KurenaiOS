namespace Weather.Acceptance;

/// <summary>Milestone 4 · the API key: on every request, refusals not retried, and never sent missing.</summary>
public class Milestone4
{
    [Fact]
    public async Task Every_request_carries_the_key_retries_included()
    {
        var server = FakeServer.Codes(HttpStatusCode.ServiceUnavailable);
        await server.Client(new WeatherOptions { ApiKey = "k-7f3a", Backoff = TimeSpan.FromMilliseconds(1) }).GetAsync("leeds");
        Assert.Equal(2, server.Requests.Count);
        Assert.All(server.Requests, r => Assert.Equal("k-7f3a", Assert.Single(r.Headers.GetValues("X-Api-Key"))));
    }

    [Fact]
    public async Task The_key_is_not_in_the_URL()
    {
        var server = FakeServer.Always(FakeServer.Leeds);
        await server.Client(new WeatherOptions { ApiKey = "k-7f3a" }).GetAsync("leeds");
        Assert.DoesNotContain("k-7f3a", server.Requests[0].RequestUri!.AbsoluteUri);
    }

    [Fact]
    public async Task A_refused_key_is_not_retried_and_says_so()
    {
        var server = FakeServer.Always(() => new HttpResponseMessage(HttpStatusCode.Unauthorized));
        var e = await Assert.ThrowsAsync<WeatherException>(() => server.Client().GetAsync("leeds"));
        Assert.Contains("API key", e.Message);
        Assert.Single(server.Requests);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("  ")]
    public async Task No_key_is_refused_before_anything_is_sent(string? key)
    {
        var server = FakeServer.Always(FakeServer.Leeds);
        var e = await Assert.ThrowsAsync<WeatherException>(() => server.Client(new WeatherOptions { ApiKey = key }).GetAsync("leeds"));
        Assert.Contains("API key", e.Message);
        Assert.Empty(server.Requests);
    }
}
