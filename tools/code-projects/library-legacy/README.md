# The Lending Library

The unit 10 project from KurenaiOS (Code → Testing and design). A small,
untested, slightly legacy library module: you pin its behaviour down with
tests, then improve its design without breaking anything.

- `src/Library` — the code (yours to change).
- `tests/Library.Tests` — YOUR tests. It starts with one example.
- `tests/Library.Acceptance` — Kurenai's acceptance tests for milestones 3–5.

## Work on it

1. Open `LendingLibrary.sln` in JetBrains Rider (or run `dotnet test` here).
2. Do the milestones in `BRIEF.md`, one at a time, in order.
3. Validate: run the **Kurenai Validate** configuration in Rider's toolbar, or
   `dotnet run .kurenai/validate.cs` in a terminal. Milestone 2 plants bugs
   in a throw-away copy of the project and runs your tests against each, so
   it takes a minute.
4. Import the newest file in `.kurenai/reports/` into KurenaiOS
   (Code → The Lending Library → Validation).

`Directory.Build.props`, `tests/Library.Acceptance/` and `.kurenai/validate.cs`
are protected: change them and the report counts as practice only.
