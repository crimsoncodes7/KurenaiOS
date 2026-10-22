namespace Library.Tests;

public class ExampleTests
{
    [Fact]
    public void A_loan_not_yet_due_costs_nothing()
    {
        // Arrange
        var loan = new Loan("Dune", "book", DateOnly.FromDateTime(DateTime.Today).AddDays(7));
        // Act
        decimal fee = new LateFees().Calculate(loan);
        // Assert
        Assert.Equal(0m, fee);
    }
}
