namespace Weather.Acceptance;

/// <summary>Milestone 3 · a deadline for every attempt, and the caller's cancellation obeyed at once.</summary>
public class Milestone3
{
    private static FakeServer Slow(int fastFrom = int.MaxValue) => new(async (_, n, token) =>
    {
        if (n < fastFrom) await Task.Delay(TimeSpan.FromSeconds(10), token);
        return FakeServer.Leeds();
    });

    private static WeatherOptions Quick(int attempts = 3) =>
        new() { ApiKey = "k", Attempts = attempts, Backoff = TimeSpan.FromMilliseconds(1), Timeout = TimeSpan.FromMilliseconds(100) };

    [Fact]
    public async Task A_slow_attempt_times_out_and_is_tried_again()
    {
        var server = Slow(fastFrom: 2);
        Assert.NotNull(await server.Client(Quick()).GetAsync("leeds"));
        Assert.Equal(2, server.Requests.Count);
    }

    [Fact]
    public async Task Every_attempt_too_slow_is_a_WeatherException_that_says_so()
    {
        var server = Slow();
        var e = await Assert.ThrowsAsync<WeatherException>(() => server.Client(Quick(attempts: 2)).GetAsync("leeds"));
        Assert.Contains("timed out", e.Message);
        Assert.Equal(2, server.Requests.Count);
    }

    [Fact]
    public async Task The_callers_cancellation_is_not_retried()
    {
        var server = Slow();
        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(100));
        var options = new WeatherOptions { ApiKey = "k", Backoff = TimeSpan.FromMilliseconds(1), Timeout = TimeSpan.FromSeconds(5) };
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => server.Client(options).GetAsync("leeds", cts.Token));
        Assert.Single(server.Requests);
    }

    [Fact]
    public async Task The_timeout_comes_from_the_options_not_HttpClient()
    {
        var server = Slow(fastFrom: 2);
        var client = new WeatherClient(new HttpClient(server) { BaseAddress = new Uri("https://weather.test/v1/"), Timeout = Timeout.InfiniteTimeSpan }, Quick());
        Assert.NotNull(await client.GetAsync("leeds"));
    }
}
