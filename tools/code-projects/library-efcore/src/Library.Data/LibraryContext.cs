using Microsoft.EntityFrameworkCore;

namespace Library;

/// <summary>The session with the database: one DbSet per table.</summary>
public class LibraryContext(DbContextOptions<LibraryContext> options) : DbContext(options)
{
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Loan> Loans => Set<Loan>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        // Milestone 1: configure Book.Title here.
        // Milestone 4: configure what happens to loans when a book or member is deleted.
    }
}
