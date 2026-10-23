# Contacts on SQLite

T1's taster and the project of T1B, *SQL from C#*, from KurenaiOS (Code →
Track T1). A small contacts app: a repository over a SQLite file, a command
line on top, and your tests.

- `src/Contacts` — `Contact`, `IContactRepository` and
  `SqliteContactRepository` (a stub: yours to build). Uses Microsoft.Data.Sqlite.
- `src/Contacts.Cli` — the command line; its data lives in `contacts-data/`.
- `tests/Contacts.Tests` — YOUR tests. It starts with one example.
- `tests/Contacts.Acceptance` — Kurenai's acceptance tests for milestones 1–3.

## Work on it

1. Open `ContactsSqlite.sln` in JetBrains Rider (or run `dotnet test` here).
2. Do the milestones in `BRIEF.md`, in order.
3. Validate: run the **Kurenai Validate** configuration in Rider's toolbar, or
   `dotnet run .kurenai/validate.cs` in a terminal.
4. Import the newest file in `.kurenai/reports/` into KurenaiOS
   (Code → Contacts on SQLite → Validation).

`Directory.Build.props`, `tests/Contacts.Acceptance/` and `.kurenai/validate.cs`
are protected: change them and the report counts as practice only.
