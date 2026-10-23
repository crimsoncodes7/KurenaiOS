namespace Weather;

/// <summary>Looks up forecasts from the weather API through the HttpClient it is given
/// (its BaseAddress already set). Milestones 1–4 in BRIEF.md.</summary>
public class WeatherClient(HttpClient http, WeatherOptions options)
{
    private readonly HttpClient http = http;
    private readonly WeatherOptions options = options;

    /// <summary>The forecast for a city, or null when the API does not know it.</summary>
    public Task<Forecast?> GetAsync(string city, CancellationToken token = default)
    {
        throw new NotImplementedException();
    }
}
