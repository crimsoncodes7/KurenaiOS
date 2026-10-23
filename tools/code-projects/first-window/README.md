# Your first window

T2's taster and the project of T2A, *Your first window*, from KurenaiOS
(Code → Track T2). A desktop tip calculator in Avalonia: one window, its
controls laid out in XAML, and C# in the code-behind that answers every
keystroke.

- `src/Tips` — the app: `App.axaml`, `MainWindow.axaml` (yours to lay out),
  `MainWindow.axaml.cs` (yours to wire up) and `TipMath.cs` (the sums).
- `tests/Tips.Tests` — YOUR tests. It starts with one example.
- `tests/Tips.Acceptance` — Kurenai's acceptance tests for milestones 1–3.
  They open your window on Avalonia's **headless** platform — no screen —
  find the controls by name, type into them and read what they show.

## Work on it

1. Open `FirstWindow.sln` in JetBrains Rider. Install the **AvaloniaRider**
   plugin for the XAML previewer (Settings → Plugins).
2. Run `Tips` to see the window; run the tests with `dotnet test`.
3. Do the milestones in `BRIEF.md`, in order.
4. Validate: run the **Kurenai Validate** configuration in Rider's toolbar, or
   `dotnet run .kurenai/validate.cs` in a terminal.
5. Import the newest file in `.kurenai/reports/` into KurenaiOS
   (Code → Your first window → Validation).

`Directory.Build.props`, `tests/Tips.Acceptance/` and `.kurenai/validate.cs`
are protected: change them and the report counts as practice only.
