namespace Contacts.Acceptance;

/// <summary>Milestone 1 · connect, create the table, add and read.</summary>
public class Milestone1
{
    [Fact]
    public void A_new_database_has_no_contacts()
    {
        using var db = new TempDb();
        Assert.Empty(new SqliteContactRepository(db.Path).All());
    }

    [Fact]
    public void Adding_numbers_contacts_and_reads_them_back_in_id_order()
    {
        using var db = new TempDb();
        var repo = new SqliteContactRepository(db.Path);
        Assert.Equal(new Contact(1, "Ann Lee", "ann@x.uk"), repo.Add("Ann Lee", "ann@x.uk"));
        Assert.Equal(new Contact(2, "Bob", null), repo.Add("Bob", null));
        Assert.Equal(new[] { new Contact(1, "Ann Lee", "ann@x.uk"), new Contact(2, "Bob", null) }, repo.All());
    }

    [Fact]
    public void The_contacts_are_still_there_for_a_new_repository()
    {
        using var db = new TempDb();
        new SqliteContactRepository(db.Path).Add("Ann Lee", null);
        Assert.Single(new SqliteContactRepository(db.Path).All());
    }

    [Fact]
    public void A_blank_name_is_refused()
    {
        using var db = new TempDb();
        Assert.Throws<ArgumentException>(() => new SqliteContactRepository(db.Path).Add("  ", null));
    }

    [Fact]
    public void The_same_email_twice_is_refused_by_the_database()
    {
        using var db = new TempDb();
        var repo = new SqliteContactRepository(db.Path);
        repo.Add("Ann Lee", "ann@x.uk");
        Assert.ThrowsAny<Exception>(() => repo.Add("Ann Again", "ann@x.uk"));
        Assert.Single(repo.All());
    }
}
