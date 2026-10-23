namespace Reading;

/// <summary>One book on the list. Milestone 4: tell the UI when Title or Done changes.</summary>
public class Book(string title, string author)
{
    public string Title { get; set; } = title;
    public string Author { get; set; } = author;
    public bool Done { get; set; }
}
