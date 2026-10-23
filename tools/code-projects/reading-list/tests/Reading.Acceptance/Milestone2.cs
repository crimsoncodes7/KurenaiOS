using Avalonia;
using Avalonia.Controls;
using Avalonia.Styling;
using Avalonia.VisualTree;

namespace Reading.Acceptance;

/// <summary>Milestone 2 · styles and themes: read books styled by a class, and a dark switch.</summary>
public class Milestone2
{
    static TextBlock TitleOf(Window w, string title) =>
        w.Named<ListBox>("BookList").GetVisualDescendants().OfType<TextBlock>().FirstOrDefault(t => t.Text == title)
        ?? throw new Xunit.Sdk.XunitException("No TextBlock shows " + title);

    [AvaloniaFact]
    public void A_read_book_s_title_has_the_class_done_and_is_faded()
    {
        var list = new ReadingList();
        list.Books.Add(new Book("Dune", "Frank Herbert") { Done = true });
        list.Books.Add(new Book("Emma", "Jane Austen"));
        var w = Headless.Open(list);
        var done = TitleOf(w, "Dune");
        Assert.Contains("done", done.Classes);
        Assert.True(done.Opacity < 1, "a style for TextBlock.done should fade it (Opacity below 1)");
        var unread = TitleOf(w, "Emma");
        Assert.DoesNotContain("done", unread.Classes);
        Assert.Equal(1, unread.Opacity);
    }

    [AvaloniaFact]
    public void The_dark_switch_changes_the_app_s_theme()
    {
        var w = Headless.Open();
        var dark = w.Named<ToggleSwitch>("DarkToggle");
        try
        {
            dark.IsChecked = true;
            Headless.Settle();
            Assert.Equal(ThemeVariant.Dark, Application.Current!.RequestedThemeVariant);
            dark.IsChecked = false;
            Headless.Settle();
            Assert.Equal(ThemeVariant.Light, Application.Current!.RequestedThemeVariant);
        }
        finally { Application.Current!.RequestedThemeVariant = ThemeVariant.Default; }
    }
}
