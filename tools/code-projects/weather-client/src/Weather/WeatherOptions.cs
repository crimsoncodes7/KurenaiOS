namespace Weather;

/// <summary>The client's settings, bound from the "Weather" section of the configuration.</summary>
public class WeatherOptions
{
    /// <summary>The API's base address, ending in "/" — or "demo" for the demo server built into the CLI.</summary>
    public string BaseUrl { get; set; } = "demo";

    /// <summary>Sent as the X-Api-Key header. Never in the code: user secrets or an environment variable.</summary>
    public string? ApiKey { get; set; }

    /// <summary>How many times one lookup may be tried in all (the first try included).</summary>
    public int Attempts { get; set; } = 3;

    /// <summary>The wait after the first failed attempt; each later wait is twice the one before.</summary>
    public TimeSpan Backoff { get; set; } = TimeSpan.FromMilliseconds(200);

    /// <summary>How long one attempt may take before it counts as failed.</summary>
    public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(5);
}
