using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Planner.Tests;

/// <summary>Your tests start the app the same way Kurenai's do: WebApplicationFactory, a test key.</summary>
public class ExampleTests(ExampleTests.App app) : IClassFixture<ExampleTests.App>
{
    public class App : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:Planner", $"Data Source={Path.Combine(Path.GetTempPath(), $"planner-tests-{Guid.NewGuid():N}.db")}");
            builder.UseSetting("Planner:ApiKey", "my-test-key");
        }
    }

    [Fact]
    public async Task Health_is_ok()
    {
        var response = await app.CreateClient().GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
