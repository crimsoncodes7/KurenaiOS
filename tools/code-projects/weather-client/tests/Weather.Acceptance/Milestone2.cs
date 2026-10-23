using System.Diagnostics;

namespace Weather.Acceptance;

/// <summary>Milestone 2 · failures: retry what may work later, with growing waits; never what will not.</summary>
public class Milestone2
{
    [Fact]
    public async Task A_busy_server_is_tried_again()
    {
        var server = FakeServer.Codes(HttpStatusCode.ServiceUnavailable, HttpStatusCode.ServiceUnavailable);
        Assert.Equal("Leeds", (await server.Client().GetAsync("leeds"))!.City);
        Assert.Equal(3, server.Requests.Count);
    }

    [Fact]
    public async Task Too_many_requests_and_bad_gateways_are_retried_too()
    {
        var server = FakeServer.Codes(HttpStatusCode.TooManyRequests, HttpStatusCode.BadGateway);
        Assert.NotNull(await server.Client().GetAsync("leeds"));
        Assert.Equal(3, server.Requests.Count);
    }

    [Fact]
    public async Task It_gives_up_after_its_attempts_and_says_what_happened()
    {
        var server = FakeServer.Always(() => new HttpResponseMessage(HttpStatusCode.InternalServerError));
        var e = await Assert.ThrowsAsync<WeatherException>(() => server.Client().GetAsync("leeds"));
        Assert.Contains("500", e.Message);
        Assert.Equal(3, server.Requests.Count);
    }

    [Fact]
    public async Task The_number_of_attempts_comes_from_the_options()
    {
        var server = FakeServer.Always(() => new HttpResponseMessage(HttpStatusCode.ServiceUnavailable));
        await Assert.ThrowsAsync<WeatherException>(() => server.Client(new WeatherOptions { ApiKey = "k", Attempts = 5, Backoff = TimeSpan.FromMilliseconds(1) }).GetAsync("leeds"));
        Assert.Equal(5, server.Requests.Count);
    }

    [Fact]
    public async Task A_bad_request_is_not_retried()
    {
        var server = FakeServer.Always(() => new HttpResponseMessage(HttpStatusCode.BadRequest));
        await Assert.ThrowsAsync<WeatherException>(() => server.Client().GetAsync("leeds"));
        Assert.Single(server.Requests);
    }

    [Fact]
    public async Task A_dropped_connection_is_retried()
    {
        var server = new FakeServer((_, n, _) => n == 1 ? throw new HttpRequestException("connection reset") : Task.FromResult(FakeServer.Leeds()));
        Assert.NotNull(await server.Client().GetAsync("leeds"));
        Assert.Equal(2, server.Requests.Count);
    }

    [Fact]
    public async Task It_waits_longer_after_each_failure()
    {
        var server = FakeServer.Always(() => new HttpResponseMessage(HttpStatusCode.ServiceUnavailable));
        var clock = Stopwatch.StartNew();
        await Assert.ThrowsAsync<WeatherException>(() => server.Client(new WeatherOptions { ApiKey = "k", Attempts = 3, Backoff = TimeSpan.FromMilliseconds(60) }).GetAsync("leeds"));
        // 60 ms after the first failure, 120 after the second: no wait after the last
        Assert.InRange(clock.ElapsedMilliseconds, 170, 2000);
    }
}
