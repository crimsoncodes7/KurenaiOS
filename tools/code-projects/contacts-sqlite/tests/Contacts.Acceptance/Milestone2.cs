namespace Contacts.Acceptance;

/// <summary>Milestone 2 · find by name, with parameters: quotes and SQL in the data stay data.</summary>
public class Milestone2
{
    static SqliteContactRepository With(TempDb db, params string[] names)
    {
        var repo = new SqliteContactRepository(db.Path);
        foreach (var n in names) repo.Add(n, null);
        return repo;
    }

    [Fact]
    public void Find_matches_part_of_a_name_in_any_case_A_to_Z()
    {
        using var db = new TempDb();
        var repo = With(db, "Joanne Day", "Bob", "Ann Lee");
        Assert.Equal(new[] { "Ann Lee", "Joanne Day" }, repo.FindByName("ANN").Select(c => c.Name));
    }

    [Fact]
    public void A_name_with_an_apostrophe_is_stored_and_found()
    {
        using var db = new TempDb();
        var repo = With(db, "Bob O'Brien", "Ann Lee");
        Assert.Equal("Bob O'Brien", Assert.Single(repo.FindByName("o'b")).Name);
    }

    [Fact]
    public void Sql_typed_into_a_search_finds_nothing_and_harms_nothing()
    {
        using var db = new TempDb();
        var repo = With(db, "Ann Lee", "Bob");
        Assert.Empty(repo.FindByName("x' OR '1'='1"));
        Assert.Equal(2, repo.All().Count);
    }

    [Fact]
    public void Sql_in_a_name_is_kept_as_a_name()
    {
        using var db = new TempDb();
        var repo = With(db, "Robert'); DROP TABLE contacts; --");
        Assert.Equal("Robert'); DROP TABLE contacts; --", Assert.Single(repo.All()).Name);
    }
}
