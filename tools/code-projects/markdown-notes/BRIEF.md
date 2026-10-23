# Markdown notes — brief

## Milestones

1. **Commands.** Make `MainViewModel` an `ObservableObject` (a `partial`
   class) and replace the four stub commands with `[RelayCommand]` methods:
   - `New` adds an empty note and selects it;
   - `Delete` can run only while a note is selected (its `CanExecute` follows
     `Selected`), asks `Dialogs.ConfirmAsync("Delete “<title>”?")` — curly
     quotes — and on yes removes the note and selects the one now in its
     place (or the last, or nothing);
   - `Save` and `Load` come in milestone 3.

   `Selected` is an `[ObservableProperty]`.
2. **MVVM.** `NoteViewModel` is an `ObservableObject`: `Text` is an
   `[ObservableProperty]` whose changes also announce `Title` (the first line
   with text, without leading `#` and spaces; `Untitled` if none) and `Words`
   (`No words`, `1 word`, `12 words` — a word is a run between spaces or line
   breaks with a letter or digit in it, so a lone `#` is not one). The window
   (`x:DataType="local:MainViewModel"`) only binds: a `ListBox` `NoteList`
   showing each title, a multi-line `TextBox` `Editor` bound to the selected
   note's text, `Button`s `NewButton` and `DeleteButton` bound to the
   commands, Ctrl+N for New, and a `TextBlock` `WordCount`. No `Click=`
   handlers in `MainWindow.axaml`.
3. **Files.** `FolderNoteStore` keeps each note as a `.md` file:
   `FileName(position, text)` is the two-digit position, a dash and the title
   in lower case with every run of other characters as one dash (at most 40,
   `untitled` if the note has no text) — `01-shopping-list.md`.
   `SaveAllAsync` replaces the folder's `.md` files (other files stay) and
   honours the cancellation token; `LoadAllAsync` reads them in file-name
   order, none if the folder is missing. `Save` and `Load` are async
   `[RelayCommand]`s; after loading, the first note is selected.
4. **Your own tests.** At least six of your own tests in `tests/Notes.Tests`,
   at least one an `[AvaloniaFact]` that opens a window; no compiler
   warnings; committed.
