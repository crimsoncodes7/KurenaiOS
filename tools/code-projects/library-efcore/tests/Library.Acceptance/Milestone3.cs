using Microsoft.EntityFrameworkCore;

namespace Library.Acceptance;

/// <summary>Milestone 3 · migrations: the database is built by your migrations,
/// and they describe the model as it is now.</summary>
public class Milestone3
{
    [Fact]
    public void There_is_at_least_one_migration()
    {
        using var db = new TestDb(create: false);
        using var c = db.Context();
        Assert.NotEmpty(c.Database.GetMigrations());
    }

    [Fact]
    public void Migrating_an_empty_database_makes_every_table()
    {
        using var db = new TestDb(create: false);
        using (var c = db.Context()) c.Database.Migrate();
        using var check = db.Context();
        Assert.Empty(check.Database.GetPendingMigrations());
        Assert.Equal(0, check.Books.Count() + check.Members.Count() + check.Loans.Count());
    }

    [Fact]
    public void The_migrations_match_the_model()
    {
        using var db = new TestDb(create: false);
        using var c = db.Context();
        Assert.False(c.Database.HasPendingModelChanges(), "The model has changed since the last migration: add one with dotnet ef migrations add.");
    }
}
