using Avalonia.Controls;
using Avalonia.Controls.Templates;
using Avalonia.Media;

namespace Reading.Acceptance;

/// <summary>Milestone 1 · XAML: a list drawn through a data template, and a shared resource.</summary>
public class Milestone1
{
    static ReadingList Two()
    {
        var list = new ReadingList();
        list.Books.Add(new Book("Dune", "Frank Herbert"));
        list.Books.Add(new Book("Emma", "Jane Austen"));
        return list;
    }

    [AvaloniaFact]
    public void The_window_is_called_The_Reading_List() => Assert.Equal("The Reading List", Headless.Open().Title);

    [AvaloniaFact]
    public void An_Accent_brush_is_a_resource_the_window_can_find()
    {
        var w = Headless.Open();
        Assert.True(w.TryFindResource("Accent", w.ActualThemeVariant, out var accent), "No resource with x:Key=\"Accent\".");
        Assert.IsAssignableFrom<ISolidColorBrush>(accent);
    }

    [AvaloniaFact]
    public void The_book_list_uses_a_data_template()
    {
        var w = Headless.Open(Two());
        Assert.IsAssignableFrom<IDataTemplate>(w.Named<ListBox>("BookList").ItemTemplate);
    }

    [AvaloniaFact]
    public void Each_book_shows_its_title_and_author()
    {
        var w = Headless.Open(Two());
        Assert.Equal(2, w.Named<ListBox>("BookList").ItemCount);
        var texts = w.ItemTexts("BookList", 0);
        Assert.Contains("Dune", texts);
        Assert.Contains("Frank Herbert", texts);
        Assert.Contains("Jane Austen", w.ItemTexts("BookList", 1));
    }
}
