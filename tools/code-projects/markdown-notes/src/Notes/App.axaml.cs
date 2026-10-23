using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;

namespace Notes;

public partial class App : Application
{
    public override void Initialize() => AvaloniaXamlLoader.Load(this);

    public override void OnFrameworkInitializationCompleted()
    {
        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            // The composition root: the one place that picks the real store and dialogs.
            var window = new MainWindow();
            var store = new FolderNoteStore(Path.Combine(Environment.CurrentDirectory, "notes-data"));
            window.DataContext = new MainViewModel(store, new WindowDialogs(window));
            desktop.MainWindow = window;
        }
        base.OnFrameworkInitializationCompleted();
    }
}
