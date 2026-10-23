using System.Data.Common;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Library.Acceptance;

/// <summary>A SQLite database in memory for one test: it lives as long as the
/// connection stays open. Every SQL command EF sends is recorded in Commands.</summary>
public sealed class TestDb : IDisposable
{
    readonly SqliteConnection connection = new("Data Source=:memory:");
    readonly DbContextOptions<LibraryContext> options;
    public List<string> Commands { get; } = new();

    public TestDb(bool create = true)
    {
        connection.Open();
        options = new DbContextOptionsBuilder<LibraryContext>().UseSqlite(connection).AddInterceptors(new Recorder(Commands)).Options;
        if (create) { using var c = Context(); c.Database.EnsureCreated(); }
        Commands.Clear();
    }

    /// <summary>A new context over the same database (a new unit of work).</summary>
    public LibraryContext Context() => new(options);

    /// <summary>Books, members and loans put straight in, for a test to start from.</summary>
    public void Seed(Action<LibraryContext> add)
    {
        using var c = Context();
        add(c);
        c.SaveChanges();
        Commands.Clear();
    }

    public void Dispose() => connection.Dispose();

    sealed class Recorder(List<string> log) : DbCommandInterceptor
    {
        public override InterceptionResult<DbDataReader> ReaderExecuting(DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result) { log.Add(command.CommandText); return result; }
        public override InterceptionResult<int> NonQueryExecuting(DbCommand command, CommandEventData eventData, InterceptionResult<int> result) { log.Add(command.CommandText); return result; }
        public override InterceptionResult<object> ScalarExecuting(DbCommand command, CommandEventData eventData, InterceptionResult<object> result) { log.Add(command.CommandText); return result; }
    }
}
