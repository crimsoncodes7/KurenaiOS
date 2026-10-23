using Microsoft.EntityFrameworkCore;

namespace Library.Acceptance;

/// <summary>Milestone 4 · relationships and loading: lend, return, the overdue
/// list with its titles and names, and loans that protect their book and member.</summary>
public class Milestone4
{
    static readonly DateOnly Sept1 = new(2026, 9, 1);

    static TestDb Library()
    {
        var db = new TestDb();
        db.Seed(c =>
        {
            c.Books.AddRange(new Book { Title = "Dune", Author = "Frank Herbert", Year = 1965 }, new Book { Title = "Emma", Author = "Jane Austen", Year = 1815 });
            c.Members.AddRange(new Member { Name = "Ann Lee" }, new Member { Name = "Bob Hart" });
        });
        return db;
    }

    [Fact]
    public void A_loan_is_due_fourteen_days_later()
    {
        using var db = Library();
        var loan = new LibraryService(db.Context()).Lend(1, 2, Sept1);
        Assert.Equal(new DateOnly(2026, 9, 15), loan.Due);
        using var c = db.Context();
        var saved = c.Loans.Single();
        Assert.Equal((1, 2, Sept1, (DateOnly?)null), (saved.BookId, saved.MemberId, saved.Out, saved.Returned));
    }

    [Fact]
    public void A_book_already_out_cannot_be_lent_until_it_is_returned()
    {
        using var db = Library();
        var library = new LibraryService(db.Context());
        var loan = library.Lend(1, 1, Sept1);
        Assert.Throws<InvalidOperationException>(() => library.Lend(1, 2, Sept1));
        library.Return(loan.Id, new DateOnly(2026, 9, 5));
        Assert.Equal(new DateOnly(2026, 9, 15), library.Lend(1, 2, Sept1).Due);
    }

    [Fact]
    public void Lending_a_book_or_member_that_does_not_exist_is_refused()
    {
        using var db = Library();
        var library = new LibraryService(db.Context());
        Assert.Throws<InvalidOperationException>(() => library.Lend(9, 1, Sept1));
        Assert.Throws<InvalidOperationException>(() => library.Lend(1, 9, Sept1));
    }

    [Fact]
    public void The_overdue_list_names_the_book_and_the_member()
    {
        using var db = Library();
        var library = new LibraryService(db.Context());
        library.Lend(2, 1, Sept1);
        var back = library.Lend(1, 2, Sept1.AddDays(2));
        Assert.Empty(new LibraryService(db.Context()).Overdue(new DateOnly(2026, 9, 15)));
        var late = new LibraryService(db.Context()).Overdue(new DateOnly(2026, 9, 20));
        Assert.Equal(new[] { new OverdueLoan("Emma", "Ann Lee", new(2026, 9, 15), 5), new OverdueLoan("Dune", "Bob Hart", new(2026, 9, 17), 3) }, late);
        library.Return(back.Id, new DateOnly(2026, 9, 20));
        Assert.Single(new LibraryService(db.Context()).Overdue(new DateOnly(2026, 9, 20)));
    }

    [Fact]
    public void A_member_with_loans_cannot_be_deleted()
    {
        using var db = Library();
        new LibraryService(db.Context()).Lend(1, 1, Sept1);
        using var c = db.Context();
        c.Members.Remove(c.Members.Single(m => m.Id == 1));
        Assert.ThrowsAny<Exception>(() => c.SaveChanges());
        using var check = db.Context();
        Assert.Equal(1, check.Loans.Count());
    }

    [Fact]
    public void A_book_with_loans_cannot_be_deleted()
    {
        using var db = Library();
        new LibraryService(db.Context()).Lend(1, 1, Sept1);
        using var c = db.Context();
        c.Books.Remove(c.Books.Single(b => b.Id == 1));
        Assert.ThrowsAny<Exception>(() => c.SaveChanges());
    }
}
