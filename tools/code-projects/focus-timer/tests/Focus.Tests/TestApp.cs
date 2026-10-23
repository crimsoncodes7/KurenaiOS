using Avalonia;
using Avalonia.Headless;

[assembly: AvaloniaTestApplication(typeof(Focus.Tests.TestApp))]

namespace Focus.Tests;

/// <summary>Starts your App headless for [AvaloniaFact] tests (no screen needed).</summary>
public static class TestApp
{
    public static AppBuilder BuildAvaloniaApp() => AppBuilder.Configure<App>().UseHeadless(new AvaloniaHeadlessPlatformOptions());
}
