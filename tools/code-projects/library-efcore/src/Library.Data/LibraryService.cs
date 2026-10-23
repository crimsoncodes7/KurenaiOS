namespace Library;

/// <summary>Everything the library does, over one LibraryContext. Yours to build.</summary>
public class LibraryService(LibraryContext db)
{
    // ── milestone 1 · entities and a context ──
    public Book AddBook(string title, string author, int year) => throw new NotImplementedException();
    public Member AddMember(string name) => throw new NotImplementedException();
    public IReadOnlyList<Book> Shelf() => throw new NotImplementedException();

    // ── milestone 2 · queries that translate ──
    public IReadOnlyList<Book> ByAuthor(string author) => throw new NotImplementedException();
    public IReadOnlyList<Book> Search(string text) => throw new NotImplementedException();
    public int CountOnLoan() => throw new NotImplementedException();
    public IReadOnlyList<(string Author, int Books)> BooksPerAuthor() => throw new NotImplementedException();

    // ── milestone 4 · relationships and loading ──
    public Loan Lend(int bookId, int memberId, DateOnly today) => throw new NotImplementedException();
    public void Return(int loanId, DateOnly today) => throw new NotImplementedException();
    public IReadOnlyList<OverdueLoan> Overdue(DateOnly today) => throw new NotImplementedException();

    // ── milestone 5 · change tracking ──
    public void Rename(int bookId, string title) => throw new NotImplementedException();

    // ── milestone 6 · it works, but it is slow ──
    public IReadOnlyList<MemberSummary> Members()
    {
        var result = new List<MemberSummary>();
        foreach (var m in db.Members.OrderBy(m => m.Name).ToList())
        {
            var loans = db.Loans.Where(l => l.MemberId == m.Id).ToList();
            result.Add(new MemberSummary(m.Name, loans.Count, loans.Count(l => l.Returned == null)));
        }
        return result;
    }
}
