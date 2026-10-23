namespace Reading.Tests;

public class ExampleTests
{
    [Fact]
    public void A_new_book_is_not_read_yet() => Assert.False(new Book("Dune", "Frank Herbert").Done);
}
