namespace Planner.Core;

/// <summary>Where "today" comes from.</summary>
public interface IClock
{
    DateOnly Today { get; }
}

/// <summary>The real date, from the computer's clock.</summary>
public class SystemClock : IClock
{
    public DateOnly Today => DateOnly.FromDateTime(DateTime.Today);
}
