using System.Net;

namespace Focus.Acceptance;

/// <summary>Milestone 3 · calling an API: a quote, with its loading and error states.</summary>
public class Milestone3
{
    [Fact]
    public async Task A_good_answer_is_a_quote()
    {
        var server = FakeServer.Json(HttpStatusCode.OK, """{"text":"Well begun is half done.","author":"Aristotle"}""");
        var quote = await new HttpQuoteService(server.Client()).TodayAsync();
        Assert.Equal(new Quote("Well begun is half done.", "Aristotle"), quote);
        Assert.Equal(new Uri(HttpQuoteService.Api, "quote/today"), Assert.Single(server.Asked));
    }

    [Theory]
    [InlineData(HttpStatusCode.InternalServerError, """{"text":"x","author":"y"}""")]
    [InlineData(HttpStatusCode.NotFound, "")]
    [InlineData(HttpStatusCode.OK, "{ not json")]
    [InlineData(HttpStatusCode.OK, """{"text":"","author":"Nobody"}""")]
    public async Task A_bad_answer_is_QuoteUnavailable(HttpStatusCode code, string body) =>
        await Assert.ThrowsAsync<QuoteUnavailableException>(() => new HttpQuoteService(FakeServer.Json(code, body).Client()).TodayAsync());

    [Fact]
    public async Task No_connection_is_QuoteUnavailable()
    {
        var server = new FakeServer((_, _) => throw new HttpRequestException("no route to host"));
        await Assert.ThrowsAsync<QuoteUnavailableException>(() => new HttpQuoteService(server.Client()).TodayAsync());
    }

    [Fact]
    public async Task Too_slow_is_QuoteUnavailable()
    {
        var server = new FakeServer(async (_, ct) => { await Task.Delay(TimeSpan.FromSeconds(30), ct); return new HttpResponseMessage(HttpStatusCode.OK); });
        var service = new HttpQuoteService(server.Client(), TimeSpan.FromMilliseconds(100));
        await Assert.ThrowsAsync<QuoteUnavailableException>(() => service.TodayAsync());
    }

    [Fact]
    public async Task Cancelled_by_the_caller_is_cancelled_not_unavailable()
    {
        var server = new FakeServer(async (_, ct) => { await Task.Delay(TimeSpan.FromSeconds(30), ct); return new HttpResponseMessage(HttpStatusCode.OK); });
        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(50));
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => new HttpQuoteService(server.Client()).TodayAsync(cts.Token));
    }

    [AvaloniaFact]
    public async Task Loading_shows_while_waiting_then_the_quote()
    {
        var quotes = new HeldQuotes();
        var vm = Clock.Vm(Clock.Fake(), quotes: quotes);
        var load = vm.LoadQuoteCommand.ExecuteAsync(null);
        Assert.True(vm.IsLoadingQuote);
        quotes.Answer(new Quote("Begin.", "Anon"));
        await load;
        Assert.False(vm.IsLoadingQuote);
        Assert.Equal(new Quote("Begin.", "Anon"), vm.Quote);
        Assert.Null(vm.QuoteError);
    }

    [AvaloniaFact]
    public async Task A_failure_says_so_and_a_retry_clears_it()
    {
        var quotes = new HeldQuotes();
        var vm = Clock.Vm(Clock.Fake(), quotes: quotes);
        var load = vm.LoadQuoteCommand.ExecuteAsync(null);
        quotes.Fail();
        await load;
        Assert.Equal(("Couldn't load a quote. Try again.", false), (vm.QuoteError, vm.IsLoadingQuote));
        Assert.Null(vm.Quote);
        load = vm.LoadQuoteCommand.ExecuteAsync(null);
        Assert.Null(vm.QuoteError);
        quotes.Answer(new Quote("Again.", "Anon"));
        await load;
        Assert.Equal("Again.", vm.Quote!.Text);
    }
}
