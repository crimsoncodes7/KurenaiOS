using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Library;

/// <summary>How `dotnet ef` makes a LibraryContext when it adds a migration.</summary>
public class DesignTimeFactory : IDesignTimeDbContextFactory<LibraryContext>
{
    public LibraryContext CreateDbContext(string[] args) =>
        new(new DbContextOptionsBuilder<LibraryContext>().UseSqlite("Data Source=library.db").Options);
}
