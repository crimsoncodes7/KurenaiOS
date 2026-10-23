namespace Library;

/// <summary>A book on the shelf. Its loans are a navigation: EF fills it when asked.</summary>
public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public int Year { get; set; }
    public List<Loan> Loans { get; set; } = new();
}

/// <summary>A member who borrows books.</summary>
public class Member
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Loan> Loans { get; set; } = new();
}

/// <summary>One book lent to one member; Returned stays null while it is out.</summary>
public class Loan
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public Book Book { get; set; } = null!;
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    public DateOnly Out { get; set; }
    public DateOnly Due { get; set; }
    public DateOnly? Returned { get; set; }
}

/// <summary>A loan past its due date, as the overdue list shows it.</summary>
public record OverdueLoan(string Title, string Member, DateOnly Due, int DaysLate);

/// <summary>A member with how many loans they have had and how many are out now.</summary>
public record MemberSummary(string Name, int Loans, int Out);
