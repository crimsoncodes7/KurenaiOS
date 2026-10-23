namespace Weather;

/// <summary>One city's forecast, as the API's JSON gives it: {"city":"Leeds","tempC":11.5,"summary":"rain"}.</summary>
public record Forecast(string City, double TempC, string Summary);
