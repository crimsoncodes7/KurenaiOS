namespace Planner.Core;

/// <summary>One topic to revise. Confidence runs from 1 (shaky) to 5 (solid).</summary>
public record Topic(int Id, string Subject, string Name, int Confidence = 1, DateOnly? LastStudied = null);

/// <summary>Somewhere the topics are kept between runs.</summary>
public interface ITopicStore
{
    Task<List<Topic>> LoadAsync(CancellationToken ct = default);
    Task SaveAsync(IReadOnlyList<Topic> topics, CancellationToken ct = default);
}

/// <summary>The planner's rule (capstone 4's): the lower the score, the sooner a topic is studied.</summary>
public static class Priority
{
    public static int Score(Topic topic, DateOnly today)
    {
        int days = topic.LastStudied is DateOnly last ? today.DayNumber - last.DayNumber : 30;
        if (days > 30) days = 30;
        return topic.Confidence * 100 - days;
    }

    /// <summary>The n topics to study next: lowest score first, ties by name.</summary>
    public static IReadOnlyList<Topic> Next(IEnumerable<Topic> topics, DateOnly today, int n) =>
        topics.OrderBy(t => Score(t, today)).ThenBy(t => t.Name, StringComparer.Ordinal).Take(n).ToList();
}
