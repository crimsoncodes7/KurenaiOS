using Planner.Core;

namespace Planner.Tests;

public class ExampleTests
{
    [Fact]
    public void A_shaky_topic_comes_before_a_solid_one()
    {
        // Arrange
        var today = new DateOnly(2026, 5, 1);
        var shaky = new Topic(1, "cs", "Big O", Confidence: 1, LastStudied: today);
        var solid = new Topic(2, "cs", "Stacks", Confidence: 5, LastStudied: today);
        // Act and assert: lower scores come first
        Assert.True(Priority.Score(shaky, today) < Priority.Score(solid, today));
    }
}
