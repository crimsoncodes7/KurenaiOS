namespace Weather.Acceptance;

/// <summary>Milestone 1 · fetch a forecast and read its JSON.</summary>
public class Milestone1
{
    [Fact]
    public async Task A_forecast_is_read_from_its_JSON()
    {
        var server = FakeServer.Always(FakeServer.Leeds);
        Assert.Equal(new Forecast("Leeds", 11.5, "rain"), await server.Client().GetAsync("Leeds"));
    }

    [Fact]
    public async Task It_GETs_the_city_in_lower_case_under_the_base_address()
    {
        var server = FakeServer.Always(FakeServer.Leeds);
        await server.Client().GetAsync("Leeds");
        var request = Assert.Single(server.Requests);
        Assert.Equal(HttpMethod.Get, request.Method);
        Assert.Equal("https://weather.test/v1/forecast/leeds", request.RequestUri!.AbsoluteUri);
    }

    [Fact]
    public async Task A_city_name_is_escaped_in_the_URL()
    {
        var server = FakeServer.Always(() => FakeServer.Json("""{"city":"St Ives","tempC":13,"summary":"showers"}"""));
        Assert.Equal("St Ives", (await server.Client().GetAsync("St Ives"))!.City);
        Assert.Equal("/v1/forecast/st%20ives", server.Requests[0].RequestUri!.AbsolutePath);
    }

    [Fact]
    public async Task It_asks_for_JSON()
    {
        var server = FakeServer.Always(FakeServer.Leeds);
        await server.Client().GetAsync("leeds");
        Assert.Contains(server.Requests[0].Headers.Accept, a => a.MediaType == "application/json");
    }

    [Fact]
    public async Task An_unknown_city_is_null_after_one_request()
    {
        var server = FakeServer.Always(() => new HttpResponseMessage(HttpStatusCode.NotFound));
        Assert.Null(await server.Client().GetAsync("Atlantis"));
        Assert.Single(server.Requests);
    }

    [Fact]
    public async Task Fields_it_does_not_use_are_ignored()
    {
        var server = FakeServer.Always(() => FakeServer.Json("""{"city":"York","tempC":9,"summary":"cloud","wind":{"speed":20},"alerts":[]}"""));
        Assert.Equal(new Forecast("York", 9, "cloud"), await server.Client().GetAsync("york"));
    }
}
