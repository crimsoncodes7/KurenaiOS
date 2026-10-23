namespace Planner.Core;

/// <summary>The planner's rule: the lower the score, the sooner a topic is studied.
/// Protected: write tests for it (milestone 1), don't change it.</summary>
public static class Priority
{
    /// <summary>Weak topics first. At the same confidence, the longest unstudied first:
    /// a topic never studied counts as 30 days, and no topic counts more than 30.</summary>
    public static int Score(Topic topic, DateOnly today)
    {
        int days = topic.LastStudied is DateOnly last ? today.DayNumber - last.DayNumber : 30;
        if (days > 30) days = 30;
        return topic.Confidence * 100 - days;
    }
}
