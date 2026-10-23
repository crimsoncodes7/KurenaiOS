using Avalonia.Controls;

namespace Reading.Acceptance;

/// <summary>Milestone 3 · binding: the boxes and the list are bound, not copied by hand.</summary>
public class Milestone3
{
    [AvaloniaFact]
    public void Typing_in_the_boxes_sets_the_list_s_properties()
    {
        var list = new ReadingList();
        var w = Headless.Open(list);
        w.Type("TitleBox", "Dune");
        w.Type("AuthorBox", "Frank Herbert");
        Assert.Equal(("Dune", "Frank Herbert"), (list.NewTitle, list.NewAuthor));
    }

    [AvaloniaFact]
    public void Add_is_enabled_only_with_a_title()
    {
        var w = Headless.Open(new ReadingList());
        Assert.False(w.Named<Button>("AddButton").IsEnabled);
        w.Type("TitleBox", "Dune");
        Assert.True(w.Named<Button>("AddButton").IsEnabled);
        w.Type("TitleBox", "   ");
        Assert.False(w.Named<Button>("AddButton").IsEnabled);
    }

    [AvaloniaFact]
    public void Clicking_Add_adds_the_book_clears_the_boxes_and_selects_it()
    {
        var list = new ReadingList();
        var w = Headless.Open(list);
        w.Type("TitleBox", " Dune ");
        w.Type("AuthorBox", "Frank Herbert");
        w.Click("AddButton");
        var dune = Assert.Single(list.Books);
        Assert.Equal(("Dune", "Frank Herbert"), (dune.Title, dune.Author));
        Assert.Equal(("", ""), (w.Named<TextBox>("TitleBox").Text ?? "", w.Named<TextBox>("AuthorBox").Text ?? ""));
        Assert.Same(dune, list.Selected);
        Assert.Same(dune, w.Named<ListBox>("BookList").SelectedItem);
    }

    [AvaloniaFact]
    public void A_book_with_no_author_is_by_Unknown() 
    {
        var list = new ReadingList { NewTitle = "Beowulf" };
        list.Add();
        Assert.Equal("Unknown", list.Books[0].Author);
    }

    [AvaloniaFact]
    public void Choosing_a_book_shows_its_title_for_editing()
    {
        var list = new ReadingList();
        list.Books.Add(new Book("Dune", "Frank Herbert"));
        list.Books.Add(new Book("Emma", "Jane Austen"));
        var w = Headless.Open(list);
        w.Named<ListBox>("BookList").SelectedIndex = 1;
        Headless.Settle();
        Assert.Same(list.Books[1], list.Selected);
        Assert.Equal("Emma", w.Named<TextBox>("EditTitle").Text);
    }
}
