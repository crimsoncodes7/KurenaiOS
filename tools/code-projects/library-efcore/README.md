# The Lending Library on EF Core

The project of T1C, *Entity Framework Core*, from KurenaiOS (Code → Track
T1). The library from unit 10 again — books, members and loans — this time
kept in a SQLite database through Entity Framework Core: entities, a
`DbContext`, LINQ that becomes SQL, migrations, relationships, change
tracking, and one slow query found and fixed.

- `src/Library.Data` — the entities (`Book`, `Member`, `Loan`), `LibraryContext`
  and `LibraryService` (stubs: yours to build). Uses EF Core 10 on SQLite.
- `src/Library.Cli` — the command line; its data lives in `library-data/`.
- `tests/Library.Tests` — YOUR tests. It starts with one example.
- `tests/Library.Acceptance` — Kurenai's acceptance tests for milestones 1–6.
  They run on SQLite **in memory**, a fresh database for every test.

## Work on it

1. Open `LibraryEf.sln` in JetBrains Rider (or run `dotnet test` here).
2. Restore the EF tool once: `dotnet tool restore` (it is pinned in
   `.config/dotnet-tools.json`).
3. Do the milestones in `BRIEF.md`, in order.
4. Validate: run the **Kurenai Validate** configuration in Rider's toolbar, or
   `dotnet run .kurenai/validate.cs` in a terminal.
5. Import the newest file in `.kurenai/reports/` into KurenaiOS
   (Code → The Lending Library on EF Core → Validation).

`Directory.Build.props`, `tests/Library.Acceptance/` and `.kurenai/validate.cs`
are protected: change them and the report counts as practice only.
