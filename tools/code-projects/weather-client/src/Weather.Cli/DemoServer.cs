using System.Net;
using System.Text;

namespace Weather.Cli;

/// <summary>A demo weather API inside the program, so the app runs with no network and no account.
/// It answers like the real one would: JSON, 404 for a city it does not know, 401 without a key,
/// and London is busy (503) on its first request. Set Weather:BaseUrl to a real service to leave it.</summary>
public class DemoServer : HttpMessageHandler
{
    private static readonly Dictionary<string, string> Forecasts = new()
    {
        ["leeds"] = """{"city":"Leeds","tempC":11.5,"summary":"rain"}""",
        ["york"] = """{"city":"York","tempC":9,"summary":"cloud"}""",
        ["hull"] = """{"city":"Hull","tempC":12,"summary":"wind"}""",
        ["london"] = """{"city":"London","tempC":14.5,"summary":"sun"}""",
        ["st ives"] = """{"city":"St Ives","tempC":13,"summary":"showers"}"""
    };
    private int londonCalls;

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
    {
        await Task.Delay(20, token);
        if (!request.Headers.TryGetValues("X-Api-Key", out var keys) || string.IsNullOrEmpty(keys.First()))
            return new HttpResponseMessage(HttpStatusCode.Unauthorized);
        string city = Uri.UnescapeDataString(request.RequestUri!.Segments.Last());
        if (city == "london" && londonCalls++ == 0)
            return new HttpResponseMessage(HttpStatusCode.ServiceUnavailable);
        return Forecasts.TryGetValue(city, out var json)
            ? new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(json, Encoding.UTF8, "application/json") }
            : new HttpResponseMessage(HttpStatusCode.NotFound);
    }
}
