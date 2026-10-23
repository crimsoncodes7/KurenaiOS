namespace Weather.Tests;

public class ExampleTests
{
    [Fact]
    public void A_forecast_is_a_value()
    {
        Assert.Equal(new Forecast("Leeds", 11.5, "rain"), new Forecast("Leeds", 11.5, "rain"));
    }
}
