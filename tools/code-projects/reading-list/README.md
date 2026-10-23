# The Reading List

The project of T2B, *XAML, styles and binding*, from KurenaiOS (Code → Track
T2). A list of books to read: a data template draws each one, styles fade
the ones you have finished, a switch turns the app dark, and binding — not
hand-copying — keeps the window and the data in step.

- `src/Reading` — the app: `MainWindow.axaml` (yours), `Book.cs` and
  `ReadingList.cs` (the data the window binds to — yours to finish).
- `tests/Reading.Tests` — YOUR tests. It starts with one example.
- `tests/Reading.Acceptance` — Kurenai's acceptance tests for milestones 1–4,
  run on Avalonia's headless platform: they type, click and read the window.

## Work on it

1. Open `ReadingList.sln` in JetBrains Rider (the AvaloniaRider plugin draws
   the XAML as you type).
2. Do the milestones in `BRIEF.md`, in order; run `dotnet test` as you go.
3. Validate: the **Kurenai Validate** configuration, or
   `dotnet run .kurenai/validate.cs`.
4. Import the newest file in `.kurenai/reports/` into KurenaiOS
   (Code → The Reading List → Validation).

`Directory.Build.props`, `tests/Reading.Acceptance/` and `.kurenai/validate.cs`
are protected: change them and the report counts as practice only.
