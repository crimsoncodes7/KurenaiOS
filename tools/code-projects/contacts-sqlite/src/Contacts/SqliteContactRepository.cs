using Microsoft.Data.Sqlite;

namespace Contacts;

/// <summary>The contacts in one SQLite file. Milestone 1 creates the table when it is missing:
/// contacts (id INTEGER PRIMARY KEY, name TEXT NOT NULL CHECK (name &lt;&gt; ''), email TEXT UNIQUE).</summary>
public class SqliteContactRepository : IContactRepository
{
    private readonly string connectionString;

    public SqliteContactRepository(string databasePath)
    {
        connectionString = new SqliteConnectionStringBuilder { DataSource = databasePath, Pooling = false }.ToString();
        // Milestone 1: open a connection and create the table if it does not exist.
    }

    public Contact Add(string name, string? email) => throw new NotImplementedException("Milestone 1");

    public IReadOnlyList<Contact> All() => throw new NotImplementedException("Milestone 1");

    public IReadOnlyList<Contact> FindByName(string text) => throw new NotImplementedException("Milestone 2: with a parameter");

    public int Import(IEnumerable<(string Name, string? Email)> contacts) => throw new NotImplementedException("Milestone 3: in a transaction");

    public void Clear() => throw new NotImplementedException("Milestone 4");

    /// <summary>A fresh, open connection; dispose it when you are done (a using declaration).</summary>
    private SqliteConnection Open()
    {
        var connection = new SqliteConnection(connectionString);
        connection.Open();
        return connection;
    }
}
