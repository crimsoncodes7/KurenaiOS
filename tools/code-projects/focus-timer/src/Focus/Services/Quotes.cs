namespace Focus;

/// <summary>A quote to start a session with.</summary>
public record Quote(string Text, string Author);

public interface IQuoteService
{
    Task<Quote> TodayAsync(CancellationToken ct = default);
}

/// <summary>Thrown when no quote could be had: a failed request, a bad answer, or too slow.</summary>
public class QuoteUnavailableException(string message, Exception? inner = null) : Exception(message, inner);

/// <summary>The quote of the day from the quotes API: GET quote/today → {"text": …, "author": …}
/// (milestone 3). Yours to build.</summary>
public class HttpQuoteService(HttpClient http, TimeSpan? timeout = null) : IQuoteService
{
    /// <summary>Where the real app asks. ".invalid" never resolves, so the app shows its error state —
    /// the tests use a fake server instead.</summary>
    public static readonly Uri Api = new("https://quotes.kurenai.invalid/");

    public HttpClient Http { get; } = http;
    public TimeSpan Timeout { get; } = timeout ?? TimeSpan.FromSeconds(5);

    public Task<Quote> TodayAsync(CancellationToken ct = default) => throw new NotImplementedException();
}
