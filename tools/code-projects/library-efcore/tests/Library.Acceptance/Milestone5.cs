namespace Library.Acceptance;

/// <summary>Milestone 5 · change tracking: reads track nothing, and a change
/// updates only what changed.</summary>
public class Milestone5
{
    static TestDb Library()
    {
        var db = new TestDb();
        db.Seed(c =>
        {
            c.Books.AddRange(new Book { Title = "Dune", Author = "Frank Herbert", Year = 1965 }, new Book { Title = "Emma", Author = "Jane Austen", Year = 1815 });
            c.Members.Add(new Member { Name = "Ann Lee" });
        });
        return db;
    }

    [Fact]
    public void Reading_tracks_nothing()
    {
        using var db = Library();
        using var c = db.Context();
        var library = new LibraryService(c);
        library.Shelf();
        library.ByAuthor("Jane Austen");
        library.Search("e");
        Assert.Empty(c.ChangeTracker.Entries());
    }

    [Fact]
    public void Renaming_changes_only_the_title()
    {
        using var db = Library();
        new LibraryService(db.Context()).Rename(1, "Dune (50th anniversary)");
        var update = Assert.Single(db.Commands, s => s.TrimStart().StartsWith("UPDATE"));
        Assert.Contains("\"Title\"", update);
        Assert.DoesNotContain("\"Author\"", update);
        using var c = db.Context();
        var dune = c.Books.Single(b => b.Id == 1);
        Assert.Equal(("Dune (50th anniversary)", "Frank Herbert", 1965), (dune.Title, dune.Author, dune.Year));
    }

    [Fact]
    public void Renaming_to_a_blank_title_or_a_missing_book_is_refused()
    {
        using var db = Library();
        var library = new LibraryService(db.Context());
        Assert.Throws<ArgumentException>(() => library.Rename(1, " "));
        Assert.Throws<InvalidOperationException>(() => library.Rename(9, "Nine"));
    }

    [Fact]
    public void Returning_saves_one_update_of_one_loan()
    {
        using var db = Library();
        var library = new LibraryService(db.Context());
        var loan = library.Lend(1, 1, new DateOnly(2026, 9, 1));
        db.Commands.Clear();
        new LibraryService(db.Context()).Return(loan.Id, new DateOnly(2026, 9, 4));
        var update = Assert.Single(db.Commands, s => s.TrimStart().StartsWith("UPDATE"));
        Assert.Contains("\"Returned\"", update);
        using var c = db.Context();
        Assert.Equal(new DateOnly(2026, 9, 4), c.Loans.Single().Returned);
    }
}
