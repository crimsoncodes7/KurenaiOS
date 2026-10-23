using Avalonia;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Threading;

[assembly: AvaloniaTestApplication(typeof(Tips.Acceptance.Headless))]

namespace Tips.Acceptance;

/// <summary>Your App, started on Avalonia's headless platform: a window with no screen,
/// driven by the tests as a user would drive it.</summary>
public static class Headless
{
    public static AppBuilder BuildAvaloniaApp() => AppBuilder.Configure<App>().UseHeadless(new AvaloniaHeadlessPlatformOptions());

    /// <summary>A new MainWindow, shown and laid out.</summary>
    public static MainWindow Open(double width = 420)
    {
        var w = new MainWindow { Width = width };
        w.Show();
        Dispatcher.UIThread.RunJobs();
        return w;
    }

    /// <summary>The control named in the window's XAML (x:Name), or a failure naming it.</summary>
    public static T Named<T>(this Window w, string name) where T : Control =>
        w.FindControl<T>(name) ?? throw new Xunit.Sdk.XunitException($"No {typeof(T).Name} named {name} in MainWindow.axaml.");

    /// <summary>Click into a text box, select what is there and type, as a user would.</summary>
    public static void Type(this Window w, string box, string text)
    {
        var t = w.Named<TextBox>(box);
        t.Focus();
        t.SelectAll();
        w.KeyTextInput(text);
        Dispatcher.UIThread.RunJobs();
    }

    public static string Shown(this Window w, string block) => w.Named<TextBlock>(block).Text ?? "";
}
