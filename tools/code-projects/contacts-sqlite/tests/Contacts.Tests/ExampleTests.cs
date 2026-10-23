namespace Contacts.Tests;

public class ExampleTests
{
    [Fact]
    public void A_contact_is_a_value()
    {
        var a = new Contact(1, "Ann Lee", null);
        Assert.Equal(new Contact(1, "Ann Lee", null), a);
    }
}
