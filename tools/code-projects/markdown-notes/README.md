# Markdown notes

The project of T2C, *MVVM*, from KurenaiOS (Code → Track T2). A notes app
built the MVVM way: views that only bind, view models made with
CommunityToolkit.Mvvm, commands that know when they can run, notes saved as
Markdown files, a confirmation dialog behind an interface — and your own
headless UI tests.

- `src/Notes/Views` — `MainWindow.axaml` (yours to bind).
- `src/Notes/ViewModels` — `MainViewModel` and `NoteViewModel` (yours).
- `src/Notes/Services` — `INoteStore` and `FolderNoteStore` (yours), `IDialogs`
  and `WindowDialogs` (written for you). `App.axaml.cs` is the composition
  root that puts them together.
- `tests/Notes.Tests` — YOUR tests; `TestApp.cs` already lets you write
  `[AvaloniaFact]` tests of whole windows.
- `tests/Notes.Acceptance` — Kurenai's tests for milestones 1–3, with a store
  in memory and dialogs that answer as told.

## Work on it

1. Open `MarkdownNotes.sln` in Rider; run `Notes` (your notes go in
   `notes-data/`, which Git ignores) and `dotnet test` as you go.
2. Do the milestones in `BRIEF.md`.
3. Validate (**Kurenai Validate**, or `dotnet run .kurenai/validate.cs`) and
   import the newest report into KurenaiOS (Code → Markdown notes).

`Directory.Build.props`, `tests/Notes.Acceptance/` and `.kurenai/validate.cs`
are protected.
