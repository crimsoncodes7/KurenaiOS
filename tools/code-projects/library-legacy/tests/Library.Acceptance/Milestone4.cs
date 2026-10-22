namespace Library.Acceptance;

/// <summary>Milestone 4 · LateFees takes the date from an IClock.</summary>
public class Milestone4
{
    sealed class FixedClock(DateOnly today) : IClock
    {
        public DateOnly Today => today;
    }

    static LateFees FeesOn(DateOnly today)
    {
        var ctor = typeof(LateFees).GetConstructor(new[] { typeof(IClock) });
        Assert.True(ctor is not null, "LateFees needs a constructor that takes an IClock.");
        return (LateFees)ctor.Invoke(new object[] { new FixedClock(today) });
    }

    [Theory]
    [InlineData("book", 1, "0")]
    [InlineData("book", 3, "0.25")]
    [InlineData("book", 10, "2.00")]
    [InlineData("dvd", 3, "3.00")]
    [InlineData("dvd", 40, "10.00")]
    public void Fees_follow_the_clock_they_are_given(string kind, int daysLate, string expected)
    {
        var today = new DateOnly(2026, 3, 10);
        Assert.Equal(decimal.Parse(expected, System.Globalization.CultureInfo.InvariantCulture), FeesOn(today).Calculate(new Loan("X", kind, today.AddDays(-daysLate))));
    }

    [Fact]
    public void The_same_loan_costs_more_a_week_later()
    {
        var loan = new Loan("Dune", "book", new DateOnly(2026, 3, 1));
        Assert.True(FeesOn(new DateOnly(2026, 3, 17)).Calculate(loan) > FeesOn(new DateOnly(2026, 3, 10)).Calculate(loan));
    }
}
