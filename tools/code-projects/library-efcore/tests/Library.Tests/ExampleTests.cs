namespace Library.Tests;

public class ExampleTests
{
    [Fact]
    public void A_new_book_has_no_loans()
    {
        var b = new Book { Title = "Dune", Author = "Frank Herbert", Year = 1965 };
        Assert.Empty(b.Loans);
    }
}
