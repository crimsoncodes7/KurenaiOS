using Greeter;

namespace Hello.Acceptance;

/// <summary>Milestone 4 · Greetings.Describe, with Humanizer</summary>
public class Milestone4
{
    [Theory]
    [InlineData(3, "three o'clock")]
    [InlineData(15, "three o'clock")]
    [InlineData(0, "twelve o'clock")]
    [InlineData(12, "twelve o'clock")]
    [InlineData(23, "eleven o'clock")]
    public void Says_the_hour_in_words(int hour, string expected) => Assert.Equal(expected, Greetings.Describe(hour));
}
