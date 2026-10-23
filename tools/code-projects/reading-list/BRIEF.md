# The Reading List — brief

The window's `DataContext` is a `ReadingList` (set in `MainWindow.axaml.cs`).
Set `x:DataType="local:ReadingList"` on the window so bindings are compiled
and checked.

## Milestones

1. **XAML: templates and resources.** Title the window `The Reading List`. A
   `ListBox` named `BookList` shows `Books` through a `DataTemplate` (each
   item shows its title and its author). Put a `SolidColorBrush` with
   `x:Key="Accent"` in the window's (or the app's) resources and use it.
2. **Styles and themes.** In the template, the title's `TextBlock` has the
   class `done` while the book is read (`Classes.done="{Binding Done}"`), and
   a style for `TextBlock.done` fades it (`Opacity` below 1). A
   `ToggleSwitch` named `DarkToggle` sets
   `Application.Current.RequestedThemeVariant` to `Dark` when on and `Light`
   when off.
3. **Binding.** `TextBox`es `TitleBox` and `AuthorBox` bind to `NewTitle`
   and `NewAuthor`; a `Button` named `AddButton` is enabled only while
   `CanAdd` and calls `Add()`, which adds the trimmed title (author `Unknown`
   if blank), clears both boxes and selects the new book. `BookList`'s
   `SelectedItem` binds to `Selected`, and a `TextBox` named `EditTitle`
   edits the selected book's title.
4. **Change notification and lists.** `Book` and `ReadingList` implement
   `INotifyPropertyChanged` (raised only when a value really changes);
   `Books` is an `ObservableCollection<Book>`. A `TextBlock` named
   `SummaryText` binds to `Summary` — `No books yet`, `1 book · 0 read`,
   `3 books · 1 read` — and keeps up with adding, removing and reading. A
   `Button` named `RemoveButton` calls `RemoveSelected()`.
5. **Tested, clean and committed.** At least four of your own tests of
   `ReadingList`, no compiler warnings, the work committed.
