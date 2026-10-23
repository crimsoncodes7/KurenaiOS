# The Planner goes online

Track T1's capstone, from KurenaiOS (Code → Track T1 → T1F). The revision
planner as a web API: ASP.NET Core minimal APIs over EF Core and SQLite,
validation as problem details, an API key from configuration, and tests
that start the whole app with `WebApplicationFactory`.

- `src/Planner.Api` — the API: `Program.cs` (yours to build), its settings
  (`appsettings.json`), `Planner.Api.http` to try it from Rider.
- `tests/Planner.Tests` — YOUR end-to-end tests. It starts with one example.
- `tests/Planner.Acceptance` — Kurenai's acceptance tests for milestones 1–4
  (`Api.cs` starts the app on its own SQLite file with a test key).
- `.config/dotnet-tools.json` — `dotnet-ef`, pinned: `dotnet tool restore` once.

## Work on it

1. Open `PlannerApi.sln` in JetBrains Rider (or run `dotnet test` here).
2. Do the milestones in `BRIEF.md`, in order.
3. Validate: run the **Kurenai Validate** configuration in Rider's toolbar, or
   `dotnet run .kurenai/validate.cs` in a terminal.
4. Import the newest file in `.kurenai/reports/` into KurenaiOS
   (Code → The Planner goes online → Validation), then submit the capstone.

## Running it yourself

The API refuses every request until it has a key, and the key never goes in
a file in this folder:

```sh
cd src/Planner.Api
dotnet user-secrets set "Planner:ApiKey" "a-long-random-key-of-your-own"
dotnet run
```

Then send requests from `Planner.Api.http` (put your key in its `@key` line,
and do not commit that change).

`Directory.Build.props`, `tests/Planner.Acceptance/` and `.kurenai/validate.cs`
are protected: change them and the report counts as practice only.
