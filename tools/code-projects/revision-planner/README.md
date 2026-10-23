# The Revision Planner

Capstone 4 from KurenaiOS (Code → stage 4, Professional practice). A small
service in four projects: a planner that decides what to revise next, JSON
storage, a command line on top, and your tests around all of it.

- `src/Planner.Core` — topics, the priority rule (`Priority.cs`, protected)
  and `StudyPlanner` (a stub: yours to build).
- `src/Planner.Storage` — `JsonTopicStore` (a stub: yours to build).
- `src/Planner.Cli` — the command line.
- `tests/Planner.Tests` — YOUR tests. It starts with one example.
- `tests/Planner.Acceptance` — Kurenai's acceptance tests for milestones 2–3.

## Work on it

1. Open `RevisionPlanner.sln` in JetBrains Rider (or run `dotnet test` here).
2. Do the milestones in `BRIEF.md`, in order.
3. Validate: run the **Kurenai Validate** configuration in Rider's toolbar, or
   `dotnet run .kurenai/validate.cs` in a terminal. Milestone 1 plants bugs
   in a throw-away copy of the project and runs your tests against each, so
   it takes a minute.
4. Import the newest file in `.kurenai/reports/` into KurenaiOS
   (Code → Capstone 4 → Brief & build, or the project's Validation tab).

Pushed to a GitHub repository of your own, `.github/workflows/kurenai.yml`
runs the same validator on every push and keeps the report as an artifact.

`Directory.Build.props`, `src/Planner.Core/Priority.cs`,
`tests/Planner.Acceptance/` and `.kurenai/validate.cs` are protected: change
them and the report counts as practice only.
