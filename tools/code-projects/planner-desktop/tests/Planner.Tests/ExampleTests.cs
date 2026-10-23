using Planner.Core;

namespace Planner.Tests;

public class ExampleTests
{
    [Fact]
    public void Weak_topics_come_first()
    {
        var today = new DateOnly(2026, 10, 23);
        var next = Priority.Next(new[] { new Topic(1, "cs", "Strong", 5), new Topic(2, "cs", "Weak", 1) }, today, 1);
        Assert.Equal("Weak", next[0].Name);
    }
}
