using Avalonia;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Input;
using Avalonia.Threading;
using Avalonia.VisualTree;

[assembly: AvaloniaTestApplication(typeof(Notes.Acceptance.Headless))]

namespace Notes.Acceptance;

/// <summary>Your App, started on Avalonia's headless platform: a window with no screen,
/// driven by the tests as a user would drive it.</summary>
public static class Headless
{
    public static AppBuilder BuildAvaloniaApp() => AppBuilder.Configure<App>().UseHeadless(new AvaloniaHeadlessPlatformOptions());

    /// <summary>A new MainWindow, shown and laid out; data, if given, becomes its DataContext.</summary>
    public static MainWindow Open(MainViewModel? data = null, double width = 760)
    {
        var w = new MainWindow { Width = width, Height = 480 };
        if (data != null) w.DataContext = data;
        w.Show();
        Settle();
        return w;
    }

    public static void Settle() => Dispatcher.UIThread.RunJobs();

    /// <summary>The control named in the window's XAML (x:Name), or a failure naming it.</summary>
    public static T Named<T>(this Window w, string name) where T : Control =>
        w.FindControl<T>(name) ?? throw new Xunit.Sdk.XunitException($"No {typeof(T).Name} named {name} in MainWindow.axaml.");

    /// <summary>Click into a text box, select what is there and type, as a user would.</summary>
    public static void Type(this Window w, string box, string text)
    {
        var t = w.Named<TextBox>(box);
        t.Focus();
        t.SelectAll();
        if (text.Length == 0) w.KeyPressQwerty(PhysicalKey.Delete, RawInputModifiers.None);
        else w.KeyTextInput(text);
        Settle();
    }

    /// <summary>A real mouse click in the middle of a control.</summary>
    public static void Click(this Window w, string name)
    {
        var c = w.Named<Control>(name);
        var at = c.TranslatePoint(new Point(c.Bounds.Width / 2, c.Bounds.Height / 2), w) ?? throw new Xunit.Sdk.XunitException(name + " is not in the window");
        w.MouseDown(at, MouseButton.Left);
        w.MouseUp(at, MouseButton.Left);
        Settle();
    }

    /// <summary>The text of every TextBlock drawn for the list's item at index i.</summary>
    public static string[] ItemTexts(this Window w, string list, int i)
    {
        var item = w.Named<ListBox>(list).ContainerFromIndex(i) ?? throw new Xunit.Sdk.XunitException($"{list} shows no item {i}");
        return item.GetVisualDescendants().OfType<TextBlock>().Select(t => t.Text ?? "").Where(t => t.Length > 0).ToArray();
    }

    public static string Shown(this Window w, string block) => w.Named<TextBlock>(block).Text ?? "";
}
