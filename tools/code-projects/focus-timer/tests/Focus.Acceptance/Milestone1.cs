using Microsoft.Extensions.DependencyInjection;

namespace Focus.Acceptance;

/// <summary>Milestone 1 · dependency injection: the app is put together in one place.</summary>
public class Milestone1 : IDisposable
{
    readonly string folder = Path.Combine(Path.GetTempPath(), "kurenai-focus-" + Guid.NewGuid().ToString("N"));
    public void Dispose() { if (Directory.Exists(folder)) Directory.Delete(folder, true); }

    [AvaloniaFact]
    public void The_services_are_the_real_ones()
    {
        using var sp = Composition.Build(folder);
        Assert.Same(TimeProvider.System, sp.GetRequiredService<TimeProvider>());
        var settings = Assert.IsType<JsonSettingsStore>(sp.GetRequiredService<ISettingsStore>());
        Assert.Equal(Path.Combine(folder, "settings.json"), settings.FilePath);
        var quotes = Assert.IsType<HttpQuoteService>(sp.GetRequiredService<IQuoteService>());
        Assert.Equal(HttpQuoteService.Api, quotes.Http.BaseAddress);
        Assert.IsType<WindowNotifier>(sp.GetRequiredService<INotifier>());
    }

    [AvaloniaFact]
    public void One_notifier_and_settings_store_for_the_app_a_new_view_model_each_time()
    {
        using var sp = Composition.Build(folder);
        Assert.Same(sp.GetRequiredService<INotifier>(), sp.GetRequiredService<INotifier>());
        Assert.Same(sp.GetRequiredService<ISettingsStore>(), sp.GetRequiredService<ISettingsStore>());
        var a = sp.GetRequiredService<MainViewModel>();
        var b = sp.GetRequiredService<MainViewModel>();
        Assert.NotSame(a, b);
        Assert.Same(sp.GetRequiredService<INotifier>(), a.Notifier);
    }
}
