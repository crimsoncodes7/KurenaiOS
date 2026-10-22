namespace Library.Acceptance;

/// <summary>Milestone 3 · Loan.Renew, written test-first.</summary>
public class Milestone3
{
    static readonly DateOnly Today = new(2026, 3, 10);

    [Fact]
    public void Renewing_adds_fourteen_days_and_counts_the_renewal()
    {
        var renewed = new Loan("Dune", "book", new DateOnly(2026, 3, 12)).Renew(Today);
        Assert.Equal(new DateOnly(2026, 3, 26), renewed.Due);
        Assert.Equal(1, renewed.Renewals);
    }

    [Fact]
    public void The_original_loan_is_unchanged()
    {
        var loan = new Loan("Dune", "book", new DateOnly(2026, 3, 12));
        loan.Renew(Today);
        Assert.Equal(0, loan.Renewals);
    }

    [Fact]
    public void A_loan_due_today_can_still_be_renewed() =>
        Assert.Equal(Today.AddDays(14), new Loan("Emma", "book", Today).Renew(Today).Due);

    [Fact]
    public void An_overdue_loan_cannot_be_renewed() =>
        Assert.Throws<InvalidOperationException>(() => new Loan("Emma", "book", Today.AddDays(-1)).Renew(Today));

    [Fact]
    public void Two_renewals_is_the_limit() =>
        Assert.Throws<InvalidOperationException>(() => new Loan("Emma", "dvd", Today, Renewals: 2).Renew(Today));
}
