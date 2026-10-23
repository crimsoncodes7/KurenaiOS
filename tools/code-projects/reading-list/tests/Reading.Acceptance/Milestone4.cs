using System.Collections.Specialized;
using System.ComponentModel;
using Avalonia.Controls;

namespace Reading.Acceptance;

/// <summary>Milestone 4 · change notification and lists: the window keeps up by itself.</summary>
public class Milestone4
{
    [AvaloniaFact]
    public void Books_and_the_list_tell_the_UI_what_changed()
    {
        var list = new ReadingList();
        Assert.IsAssignableFrom<INotifyCollectionChanged>(list.Books);
        Assert.IsAssignableFrom<INotifyPropertyChanged>(list);
        var book = new Book("Dune", "Frank Herbert");
        var heard = new List<string?>();
        ((INotifyPropertyChanged)book).PropertyChanged += (_, e) => heard.Add(e.PropertyName);
        book.Done = true;
        book.Title = "Dune Messiah";
        book.Title = "Dune Messiah";
        Assert.Equal(new[] { "Done", "Title" }, heard);
    }

    [AvaloniaFact]
    public void The_summary_follows_adding_and_reading()
    {
        var list = new ReadingList();
        var w = Headless.Open(list);
        Assert.Equal("No books yet", w.Shown("SummaryText"));
        w.Type("TitleBox", "Dune");
        w.Click("AddButton");
        w.Type("TitleBox", "Emma");
        w.Click("AddButton");
        Assert.Equal("2 books · 0 read", w.Shown("SummaryText"));
        list.Books[0].Done = true;
        Headless.Settle();
        Assert.Equal("2 books · 1 read", w.Shown("SummaryText"));
    }

    [AvaloniaFact]
    public void Editing_the_title_renames_the_book_in_the_list()
    {
        var list = new ReadingList();
        var w = Headless.Open(list);
        w.Type("TitleBox", "Dune");
        w.Click("AddButton");
        w.Type("EditTitle", "Dune Messiah");
        Assert.Equal("Dune Messiah", list.Books[0].Title);
        Assert.Contains("Dune Messiah", w.ItemTexts("BookList", 0));
    }

    [AvaloniaFact]
    public void Removing_the_selected_book_updates_everything()
    {
        var list = new ReadingList();
        var w = Headless.Open(list);
        w.Type("TitleBox", "Dune");
        w.Click("AddButton");
        w.Click("RemoveButton");
        Assert.Empty(list.Books);
        Assert.Null(list.Selected);
        Assert.Equal(0, w.Named<ListBox>("BookList").ItemCount);
        Assert.Equal("No books yet", w.Shown("SummaryText"));
    }

    [AvaloniaFact]
    public void One_book_is_singular()
    {
        var list = new ReadingList { NewTitle = "Dune" };
        list.Add();
        Assert.Equal("1 book · 0 read", list.Summary);
    }
}
