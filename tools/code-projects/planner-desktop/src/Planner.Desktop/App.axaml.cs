using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Planner.Core;

namespace Planner.Desktop;

public partial class App : Application
{
    public override void Initialize() => AvaloniaXamlLoader.Load(this);

    public override void OnFrameworkInitializationCompleted()
    {
        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            var store = new JsonTopicStore(Path.Combine(Environment.CurrentDirectory, "planner-data", "topics.json"));
            desktop.MainWindow = new MainWindow { DataContext = new ShellViewModel(store, TimeProvider.System) };
        }
        base.OnFrameworkInitializationCompleted();
    }
}
