using Greeter;

namespace Hello.Acceptance;

/// <summary>Milestone 2 · Greetings.For</summary>
public class Milestone2
{
    [Theory]
    [InlineData("Ada", 9, "Good morning, Ada!")]
    [InlineData("Kai", 0, "Good morning, Kai!")]
    [InlineData("Lin", 12, "Good afternoon, Lin!")]
    [InlineData("Zed", 17, "Good afternoon, Zed!")]
    [InlineData("Mo", 18, "Good evening, Mo!")]
    [InlineData("Ola", 23, "Good evening, Ola!")]
    public void Greets_by_the_hour(string name, int hour, string expected) => Assert.Equal(expected, Greetings.For(name, hour));
}
