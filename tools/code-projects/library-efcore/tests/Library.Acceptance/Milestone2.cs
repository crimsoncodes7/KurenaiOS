namespace Library.Acceptance;

/// <summary>Milestone 2 · queries that translate: the filtering, counting and
/// grouping happen in SQL, not in C# after every row came back.</summary>
public class Milestone2
{
    static TestDb Shelf()
    {
        var db = new TestDb();
        db.Seed(c =>
        {
            c.Books.AddRange(
                new Book { Title = "Emma", Author = "Jane Austen", Year = 1815 },
                new Book { Title = "Dune", Author = "Frank Herbert", Year = 1965 },
                new Book { Title = "Persuasion", Author = "Jane Austen", Year = 1817 },
                new Book { Title = "Pride and Prejudice", Author = "Jane Austen", Year = 1813 },
                new Book { Title = "Children of Dune", Author = "Frank Herbert", Year = 1976 },
                new Book { Title = "The Dispossessed", Author = "Ursula K. Le Guin", Year = 1974 });
            var ann = new Member { Name = "Ann Lee" };
            c.Members.Add(ann);
            c.Loans.Add(new Loan { Book = c.Books.Local.First(b => b.Title == "Dune"), Member = ann, Out = new(2026, 9, 1), Due = new(2026, 9, 15) });
            c.Loans.Add(new Loan { Book = c.Books.Local.First(b => b.Title == "Emma"), Member = ann, Out = new(2026, 9, 1), Due = new(2026, 9, 15), Returned = new(2026, 9, 3) });
        });
        return db;
    }

    [Fact]
    public void By_author_is_oldest_first_and_filtered_in_sql()
    {
        using var db = Shelf();
        var books = new LibraryService(db.Context()).ByAuthor("Jane Austen");
        Assert.Equal(new[] { "Pride and Prejudice", "Emma", "Persuasion" }, books.Select(b => b.Title));
        Assert.Contains(db.Commands, s => s.Contains("WHERE"));
    }

    [Fact]
    public void Search_ignores_case_and_runs_in_sql()
    {
        using var db = Shelf();
        var found = new LibraryService(db.Context()).Search("dUNE");
        Assert.Equal(new[] { "Children of Dune", "Dune" }, found.Select(b => b.Title));
        Assert.Contains(db.Commands, s => s.Contains("WHERE"));
        Assert.Empty(new LibraryService(db.Context()).Search("zzz"));
    }

    [Fact]
    public void Counting_the_loans_out_is_one_count_in_sql()
    {
        using var db = Shelf();
        Assert.Equal(1, new LibraryService(db.Context()).CountOnLoan());
        Assert.Single(db.Commands);
        Assert.Contains("COUNT", db.Commands[0]);
    }

    [Fact]
    public void Books_per_author_is_grouped_in_sql()
    {
        using var db = Shelf();
        var rows = new LibraryService(db.Context()).BooksPerAuthor();
        Assert.Equal(new[] { ("Jane Austen", 3), ("Frank Herbert", 2), ("Ursula K. Le Guin", 1) }, rows);
        Assert.Contains(db.Commands, s => s.Contains("GROUP BY"));
    }
}
