namespace Focus.Tests;

public class ExampleTests
{
    [Fact]
    public void Twenty_five_minutes_is_the_default() => Assert.Equal(25, new Settings().FocusMinutes);
}
