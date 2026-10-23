using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Microsoft.Extensions.DependencyInjection;

namespace Focus;

public partial class App : Application
{
    public override void Initialize() => AvaloniaXamlLoader.Load(this);

    public override void OnFrameworkInitializationCompleted()
    {
        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            var services = Composition.Build(Path.Combine(Environment.CurrentDirectory, "focus-data"));
            var window = new MainWindow { DataContext = services.GetRequiredService<MainViewModel>() };
            if (services.GetService<INotifier>() is WindowNotifier notifier) notifier.Host = window;
            desktop.MainWindow = window;
        }
        base.OnFrameworkInitializationCompleted();
    }
}
