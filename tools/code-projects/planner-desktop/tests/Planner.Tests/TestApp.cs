using Avalonia;
using Avalonia.Headless;

[assembly: AvaloniaTestApplication(typeof(Planner.Tests.TestApp))]

namespace Planner.Tests;

/// <summary>Starts your App headless for [AvaloniaFact] tests (no screen needed).</summary>
public static class TestApp
{
    public static AppBuilder BuildAvaloniaApp() => AppBuilder.Configure<Planner.Desktop.App>().UseHeadless(new AvaloniaHeadlessPlatformOptions());
}
