namespace Library;

/// <summary>One book or DVD out on loan.</summary>
public record Loan(string Title, string Kind, DateOnly Due, bool Damaged = false, int Renewals = 0)
{
    /// <summary>Renew for 14 more days: at most twice, and never once overdue.</summary>
    public Loan Renew(DateOnly today) => throw new NotImplementedException("Milestone 3: write the tests first, then this.");
}
