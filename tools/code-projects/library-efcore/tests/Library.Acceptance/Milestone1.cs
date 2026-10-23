using Microsoft.EntityFrameworkCore;

namespace Library.Acceptance;

/// <summary>Milestone 1 · entities and a context: configure the model, add and read.</summary>
public class Milestone1
{
    [Fact]
    public void A_title_is_required_and_at_most_200_characters()
    {
        using var db = new TestDb();
        using var c = db.Context();
        var title = c.Model.FindEntityType(typeof(Book))!.FindProperty(nameof(Book.Title))!;
        Assert.False(title.IsNullable);
        Assert.Equal(200, title.GetMaxLength());
    }

    [Fact]
    public void Adding_gives_each_book_and_member_its_id()
    {
        using var db = new TestDb();
        var library = new LibraryService(db.Context());
        var dune = library.AddBook("Dune", "Frank Herbert", 1965);
        var emma = library.AddBook("Emma", "Jane Austen", 1815);
        Assert.Equal(1, dune.Id);
        Assert.Equal(2, emma.Id);
        Assert.Equal(1, library.AddMember("Ann Lee").Id);
    }

    [Fact]
    public void The_shelf_is_in_title_order_and_survives_a_new_context()
    {
        using var db = new TestDb();
        var library = new LibraryService(db.Context());
        library.AddBook("Persuasion", "Jane Austen", 1817);
        library.AddBook("Dune", "Frank Herbert", 1965);
        library.AddBook("Emma", "Jane Austen", 1815);
        Assert.Equal(new[] { "Dune", "Emma", "Persuasion" }, new LibraryService(db.Context()).Shelf().Select(b => b.Title));
    }

    [Fact]
    public void A_blank_title_or_name_is_refused_and_nothing_is_saved()
    {
        using var db = new TestDb();
        var library = new LibraryService(db.Context());
        Assert.Throws<ArgumentException>(() => library.AddBook("  ", "Nobody", 2000));
        Assert.Throws<ArgumentException>(() => library.AddMember(""));
        using var c = db.Context();
        Assert.Equal(0, c.Books.Count() + c.Members.Count());
    }

    [Fact]
    public void Titles_are_trimmed()
    {
        using var db = new TestDb();
        Assert.Equal("Dune", new LibraryService(db.Context()).AddBook("  Dune ", "Frank Herbert", 1965).Title);
    }
}
