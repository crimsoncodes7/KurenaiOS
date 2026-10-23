using Avalonia;

namespace Tips;

class Program
{
    // Nothing that touches Avalonia may run before AppMain: the platform is not ready yet.
    [STAThread]
    public static void Main(string[] args) => BuildAvaloniaApp().StartWithClassicDesktopLifetime(args);

    // Also used by Rider's previewer and by the headless tests.
    public static AppBuilder BuildAvaloniaApp() => AppBuilder.Configure<App>().UsePlatformDetect().WithInterFont().LogToTrace();
}
