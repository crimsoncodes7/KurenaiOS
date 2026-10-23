namespace Reading;

/// <summary>Everything the window shows, as properties it can bind to. Yours to build.</summary>
public class ReadingList
{
    /// <summary>The books, in the order they were added. Milestone 4: a list the UI can watch.</summary>
    public List<Book> Books { get; } = new();

    /// <summary>The boxes for a new book (milestone 3).</summary>
    public string NewTitle { get; set; } = "";
    public string NewAuthor { get; set; } = "";

    /// <summary>The book chosen in the list, or null.</summary>
    public Book? Selected { get; set; }

    /// <summary>True when there is a title to add.</summary>
    public bool CanAdd => throw new NotImplementedException();

    /// <summary>"No books yet", "1 book · 0 read", "3 books · 1 read".</summary>
    public string Summary => throw new NotImplementedException();

    /// <summary>Adds NewTitle by NewAuthor, clears both boxes and selects the new book.</summary>
    public void Add() => throw new NotImplementedException();

    /// <summary>Removes the selected book; nothing is selected afterwards.</summary>
    public void RemoveSelected() => throw new NotImplementedException();
}
