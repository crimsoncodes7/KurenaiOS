# The Planner on the desktop

The capstone of Track T2, *User interfaces and desktop apps*, from KurenaiOS
(Code → Track T2). The revision planner from capstone 4 becomes a real
desktop app: pages you move between, a form that validates as you type,
every control usable by keyboard and screen reader, a layout that adapts to
the window, and a publish profile that turns it into an app you can hand to
someone.

- `src/Planner.Core` — the topics, the rule and the JSON store: written for
  you (capstone 4's, finished).
- `src/Planner.Desktop` — the app: `ViewModels/` and `Views/` are stubs to
  build; `App.axaml` maps each page's view model to its view.
- `tests/Planner.Tests` — YOUR tests (`[AvaloniaFact]` ready, and a fake
  clock).
- `tests/Planner.Acceptance` — Kurenai's tests for milestones 1–4.

## Work on it

Open `PlannerDesktop.sln` in Rider; run `Planner.Desktop` (topics live in
`planner-data/`) and `dotnet test` as you go. Do the milestones in
`BRIEF.md`, validate (**Kurenai Validate** or `dotnet run
.kurenai/validate.cs`) and import each report into KurenaiOS (Code → Track
T2 → The Planner on the desktop). Its milestones are the capstone's build.

`Directory.Build.props`, `tests/Planner.Acceptance/` and
`.kurenai/validate.cs` are protected.
