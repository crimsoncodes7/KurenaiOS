# Focus timer

The project of T2D, *Async apps and services*, from KurenaiOS (Code → Track
T2). A Pomodoro-style timer built from services: put together with
dependency injection, counting down with `async`/`await` so the window never
freezes, remembering your focus length, telling you when time is up, and
fetching a quote — with a loading state and an error state.

- `src/Focus` — `Composition.cs` (the composition root), `MainViewModel.cs`,
  `MainWindow.axaml` and `Services/` (settings, quotes, the notifier). The
  stubs are yours; `WindowNotifier` is written for you.
- `tests/Focus.Tests` — YOUR tests (a fake clock is referenced:
  `Microsoft.Extensions.Time.Testing.FakeTimeProvider`).
- `tests/Focus.Acceptance` — Kurenai's tests for milestones 1–4. They move a
  fake clock on second by second, and answer HTTP from a fake server.

The real app asks `https://quotes.kurenai.invalid/` — a name that never
resolves — so running it shows the quote's error state, as it should.

## Work on it

Open `FocusTimer.sln` in Rider, do the milestones in `BRIEF.md`, run
`dotnet test` as you go, validate (**Kurenai Validate** or
`dotnet run .kurenai/validate.cs`) and import the report into KurenaiOS.
`Directory.Build.props`, `tests/Focus.Acceptance/` and `.kurenai/validate.cs`
are protected.
