using System.Text;

namespace Weather.Acceptance;

/// <summary>A fake weather API: each request is answered by the script (given the request,
/// which call this is, from 1, and its token), and every request is remembered.</summary>
public class FakeServer(Func<HttpRequestMessage, int, CancellationToken, Task<HttpResponseMessage>> script) : HttpMessageHandler
{
    public List<HttpRequestMessage> Requests { get; } = new();

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
    {
        Requests.Add(request);
        return script(request, Requests.Count, token);
    }

    /// <summary>A server that answers every request the same way.</summary>
    public static FakeServer Always(Func<HttpResponseMessage> answer) => new((_, _, _) => Task.FromResult(answer()));

    /// <summary>A server that answers with these status codes in turn, then a Leeds forecast.</summary>
    public static FakeServer Codes(params HttpStatusCode[] codes) => new((_, n, _) =>
        Task.FromResult(n <= codes.Length ? new HttpResponseMessage(codes[n - 1]) : Leeds()));

    public static HttpResponseMessage Json(string json, HttpStatusCode code = HttpStatusCode.OK) =>
        new(code) { Content = new StringContent(json, Encoding.UTF8, "application/json") };

    public static HttpResponseMessage Leeds() => Json("""{"city":"Leeds","tempC":11.5,"summary":"rain"}""");

    /// <summary>A WeatherClient on this server, with a test key and almost no backoff unless the options say otherwise.</summary>
    public WeatherClient Client(WeatherOptions? options = null) =>
        new(new HttpClient(this) { BaseAddress = new Uri("https://weather.test/v1/") },
            options ?? new WeatherOptions { ApiKey = "test-key", Backoff = TimeSpan.FromMilliseconds(1) });
}
