namespace Contacts.Acceptance;

/// <summary>Milestone 3 · Import is all or nothing: one transaction.</summary>
public class Milestone3
{
    [Fact]
    public void Importing_good_contacts_adds_them_all()
    {
        using var db = new TempDb();
        var repo = new SqliteContactRepository(db.Path);
        Assert.Equal(3, repo.Import(new (string, string?)[] { ("Ann", "a@x.uk"), ("Bob", null), ("Cy", "c@x.uk") }));
        Assert.Equal(new[] { "Ann", "Bob", "Cy" }, repo.All().Select(c => c.Name));
    }

    [Fact]
    public void One_bad_contact_means_none_are_kept()
    {
        using var db = new TempDb();
        var repo = new SqliteContactRepository(db.Path);
        repo.Add("Zed", "z@x.uk");
        Assert.ThrowsAny<Exception>(() => repo.Import(new (string, string?)[] { ("Ann", "a@x.uk"), ("Bob", null), ("Cy", "z@x.uk") }));
        Assert.Equal(new[] { "Zed" }, repo.All().Select(c => c.Name));
    }

    [Fact]
    public void Importing_nothing_adds_nothing()
    {
        using var db = new TempDb();
        Assert.Equal(0, new SqliteContactRepository(db.Path).Import(Array.Empty<(string, string?)>()));
    }
}
