namespace Library.Acceptance;

/// <summary>Milestone 6 · N+1 found and fixed: the member summary is the same,
/// but it no longer costs one query per member.</summary>
public class Milestone6
{
    static TestDb Busy(int members)
    {
        var db = new TestDb();
        db.Seed(c =>
        {
            var books = Enumerable.Range(1, 3).Select(i => new Book { Title = "Book " + i, Author = "Author", Year = 2000 + i }).ToList();
            c.Books.AddRange(books);
            for (int i = 0; i < members; i++)
            {
                var m = new Member { Name = $"Member {i:00}" };
                c.Members.Add(m);
                c.Loans.Add(new Loan { Book = books[i % 3], Member = m, Out = new(2026, 9, 1), Due = new(2026, 9, 15), Returned = new(2026, 9, 2) });
                if (i % 2 == 0) c.Loans.Add(new Loan { Book = books[(i + 1) % 3], Member = m, Out = new(2026, 9, 3), Due = new(2026, 9, 17) });
            }
        });
        return db;
    }

    [Fact]
    public void The_summary_counts_loans_and_what_is_out()
    {
        using var db = Busy(4);
        var rows = new LibraryService(db.Context()).Members();
        Assert.Equal(new[] { new MemberSummary("Member 00", 2, 1), new MemberSummary("Member 01", 1, 0), new MemberSummary("Member 02", 2, 1), new MemberSummary("Member 03", 1, 0) }, rows);
    }

    [Fact]
    public void Twenty_members_take_at_most_two_queries()
    {
        using var db = Busy(20);
        var rows = new LibraryService(db.Context()).Members();
        Assert.Equal(20, rows.Count);
        Assert.True(db.Commands.Count <= 2, $"{db.Commands.Count} queries for 20 members: that is N+1.");
    }

    [Fact]
    public void A_member_with_no_loans_is_still_listed()
    {
        using var db = Busy(1);
        db.Seed(c => c.Members.Add(new Member { Name = "Zed" }));
        Assert.Equal(new MemberSummary("Zed", 0, 0), new LibraryService(db.Context()).Members().Last());
    }
}
