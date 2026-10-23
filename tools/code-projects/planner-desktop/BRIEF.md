# The Planner on the desktop — brief

The full brief, the rubric and the write-up are in KurenaiOS (the capstone's
page). In short:

## Milestones

1. **Navigation.** `ShellViewModel` keeps the page showing (`Current`) and a
   way back (`GoTo`, `Back`, `CanGoBack`, `BackCommand`, `ShowTopicsCommand`,
   `ShowNextCommand`); it opens on a `TopicsViewModel`. Every page shown is
   activated (`ActivateAsync`), so it loads what it needs — coming back to a
   page reloads it. `TopicsViewModel` has `Topics`, `Selected`, `Detail`,
   `AddCommand` and `EditCommand` (only with a topic chosen); `NextViewModel`
   has `Lines` (`1. Vectors (maths)`, the five lowest scores today). The
   window has `Button`s `BackButton`, `TopicsTab` and `NextTab` and a
   `ContentControl` named `Page` showing `Current`; `App.axaml` maps each
   page's view model to its view with a `DataTemplate`.
2. **Validation.** `TopicEditorViewModel` validates as it is typed:
   `Name` required (`Give the topic a name.`) and at most 60 characters
   (`At most 60 characters.`); `Subject` required (`Choose a subject.`);
   `Confidence` 1 to 5 (`Confidence is 1 to 5.`). `SaveCommand` runs only
   when the topic is valid and complete; it saves (a new topic gets the next
   id; the subject trimmed and in lower case; an edit keeps its id and the day
   it was last studied) and goes back. `CancelCommand` goes back. The editor
   view has `NameBox`, `SubjectBox`, `ConfidenceBox` (a `NumericUpDown`),
   `SaveButton` and `CancelButton`, and shows each error beside its field.
3. **Accessibility.** Every control on every page has an accessible name (a
   `Label` targeting it, `AutomationProperties.Name`, or text content). In the
   editor, Tab goes Name → Subject → Confidence → Save → Cancel, the cursor
   starts in Name, Enter saves and Escape cancels.
4. **Responsive layout.** The topics page shows its `TopicList` and its
   `TopicDetail` side by side at 800 pixels and wider, and the detail under
   the list (both full width) below 800 — changing as the window is resized.
   `Detail` reads `Big O · cs · confidence 3 · last studied 2026-10-20`
   (`never` if not studied).
5. **Packaged and shipped.** `Planner.Desktop.csproj` has a `<Version>`
   (`1.x.y`) and `<Product>Planner</Product>`; a publish profile
   `Properties/PublishProfiles/release.pubxml` makes a self-contained app for
   your platform (`osx-arm64`, `win-x64`, `linux-x64`…); publish it with
   `dotnet publish src/Planner.Desktop -p:PublishProfile=release`. Eight or more of your own tests, at least one
   an `[AvaloniaFact]`; no compiler warnings; committed.
