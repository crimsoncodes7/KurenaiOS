namespace Weather;

/// <summary>A lookup that failed: the message says why, in words a user can read.</summary>
public class WeatherException(string message, Exception? inner = null) : Exception(message, inner);
