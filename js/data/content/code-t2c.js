/* Kurenai OS — data/content/code-t2c.js
   Code · T2 · Part C · MVVM (docs/code-plan.md §3.3), done in Rider with
   Avalonia 12 and CommunityToolkit.Mvvm 8.4.2.

   Commands (T2.8), MVVM with CommunityToolkit.Mvvm (T2.9), files and dialogs
   (T2.10), testing the UI headless (T2.11). Rider form (smoke75); COMMAND
   cards. The part's project is "Markdown notes" (rp-t2c-notes; files from
   tools/code-projects/markdown-notes/). Every listing's API was compiled
   against Avalonia 12 and the toolkit; the Pitfalls messages are real.     */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function sh(cap, src) { return { code: { lang: "shell", src: src, cap: cap } }; }
  function cs(cap, src) { return { code: { lang: "csharp", src: src, cap: cap } }; }
  function xaml(cap, src) { return { code: { lang: "xaml", src: src, cap: cap } }; }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }

  K.add({ concepts: {
    "commands": { name: "Commands", lesson: "T2.8", about: "ICommand, CanExecute, key bindings" },
    "mvvm": { name: "MVVM", lesson: "T2.9", about: "views, view models, models; the toolkit's generators" },
    "files-dialogs": { name: "Files and dialogs", lesson: "T2.10", about: "the storage provider; dialogs behind an interface" },
    "ui-tests": { name: "Headless UI tests", lesson: "T2.11", about: "view-model tests and [AvaloniaFact] window tests" }
  } });

  /* ================================================================
     T2.8 Commands
     ================================================================ */
  lesson("T2.8", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A `Click` handler lives in the code-behind, so the action can only be reached from that button, and only tested by clicking it. Enabling the button at the right times is more code again.",
        "A **command** is an object for an action: `Execute` does it, `CanExecute` says whether it can be done now, and `CanExecuteChanged` says when that answer may have changed.",
        "A button, a menu item and a key gesture can all bind to the same command — and every one of them greys out by itself when it cannot run."
      ] },
      page("Core idea"),
      cs("a command in a view model (CommunityToolkit.Mvvm's RelayCommand)", 'using CommunityToolkit.Mvvm.Input;\n\npublic partial class MainViewModel : ObservableObject\n{\n    [ObservableProperty]\n    [NotifyCanExecuteChangedFor(nameof(DeleteCommand))]\n    public partial NoteViewModel? Selected { get; set; }\n\n    bool HasSelection => Selected is not null;\n\n    [RelayCommand]\n    void New() { var note = new NoteViewModel(); Notes.Add(note); Selected = note; }\n\n    [RelayCommand(CanExecute = nameof(HasSelection))]\n    async Task Delete() { /* ask, then remove */ }\n}'),
      xaml("bound by buttons and a key gesture", '<Window.KeyBindings>\n    <KeyBinding Gesture="Ctrl+N" Command="{Binding NewCommand}" />\n</Window.KeyBindings>\n<Button x:Name="NewButton" Content="New" Command="{Binding NewCommand}" />\n<Button x:Name="DeleteButton" Content="Delete" Command="{Binding DeleteCommand}" />'),
      { ul: [
        "`[RelayCommand]` on `New()` generates a property `NewCommand` (an `IRelayCommand`); on `async Task Delete()` an `IAsyncRelayCommand DeleteCommand`.",
        "`CanExecute = nameof(HasSelection)` ties the command's answer to a property; `[NotifyCanExecuteChangedFor]` asks again whenever `Selected` changes.",
        "A button bound to a command is enabled exactly when `CanExecute` is true — no `IsEnabled` binding needed."
      ] },
      page("Rules"),
      { table: { head: ["Member", "Means"], rows: [
        ["`Execute(parameter)`", "do it"],
        ["`CanExecute(parameter)`", "may it be done now?"],
        ["`CanExecuteChanged`", "the answer may have changed: ask again"],
        ["`NotifyCanExecuteChanged()` (toolkit)", "raise CanExecuteChanged yourself"],
        ["`ExecuteAsync(parameter)` (async command)", "do it and await it — what tests use"]
      ] } },
      { ul: [
        "Commands belong to the view model; the view only binds. The code-behind keeps view-only work (focus, scrolling, animations).",
        "`CommandParameter=\"{Binding}\"` passes something to the command, such as the item a row's button belongs to.",
        "An async command is not re-entrant by default: while it runs, `CanExecute` is false, so a double click cannot start it twice.",
        "Key gestures: `Ctrl+N` is ⌘N's twin on macOS when written `Cmd+N`; bind both if you ship for both."
      ] },
      page("Variations"),
      { h: "A command with a parameter" },
      cs("which note to pin", '[RelayCommand]\nvoid Pin(NoteViewModel note) => note.Pinned = true;'),
      xaml("each row's button passes its own note", '<Button Content="Pin" Command="{Binding $parent[ListBox].((local:MainViewModel)DataContext).PinCommand}" CommandParameter="{Binding}" />'),
      { h: "Ask again by hand" },
      cs("when CanExecute depends on something the attributes cannot see", 'Notes.CollectionChanged += (_, _) => SaveCommand.NotifyCanExecuteChanged();'),
      { h: "Running a command in a test" },
      cs("no window needed", 'var vm = new MainViewModel(new MemoryStore(), new Answers(yes: true));\nvm.NewCommand.Execute(null);\nawait vm.DeleteCommand.ExecuteAsync(null);\nAssert.Empty(vm.Notes);'),
      page("Pitfalls"),
      { h: "A CanExecute name that matches nothing" },
      sh("[RelayCommand(CanExecute = \"CanBegin\")] with no CanBegin member", "error MVVMTK0009: The CanExecute name must refer to a valid member, but \"CanBegin\" has no matches in type Focus.MainViewModel"),
      { ul: [ "Use `nameof(…)`: a typo is then a compile error at the attribute itself." ] },
      { h: "A button that never re-enables" },
      "`CanExecute` changed (a note was selected) but nothing raised `CanExecuteChanged`, so the button still asks the old answer. Add `[NotifyCanExecuteChangedFor(nameof(DeleteCommand))]` to `Selected`.",
      { h: "Both Click and Command" },
      "A button with a `Click` handler and a `Command` does the work twice. Pick the command.",
      page("Connections"),
      { ul: [ "**Back:** T2.3's `Click` handlers (now replaced); unit 9's delegates — a command wraps one.", "**Next:** T2.9 puts commands in view models; T2.11 runs them in tests.", "**The project:** milestone 1 — New, and a Delete that knows when it can run and asks first." ] },
      page("Good practice"),
      { ul: [ "Every user action is a command on the view model.", "Name the method for the action (`Delete`), and let the toolkit name the command (`DeleteCommand`).", "Give frequent commands a key gesture." ] },
      page("Practise"),
      { ul: [ "**Markdown notes, milestone 1:** `NewCommand` and `DeleteCommand` with its `CanExecute` and confirmation." ] },
      page("Quick reference"),
      cs("the attributes", '[RelayCommand] void New() { … }                               // NewCommand\n[RelayCommand(CanExecute = nameof(HasSelection))] async Task Delete() { … }   // DeleteCommand\n[NotifyCanExecuteChangedFor(nameof(DeleteCommand))]          // on what it depends on'),
      { ul: [ "`Execute` · `CanExecute` · `CanExecuteChanged`.", "`Command=\"{Binding NewCommand}\"` on buttons, menu items and `KeyBinding`s.", "Async commands: `ExecuteAsync`, and no double runs." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["MVVMTK0009: The CanExecute name must refer to a valid member", "CanExecute names nothing", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What three members does ICommand have?", "Execute, CanExecute and the CanExecuteChanged event."],
      ["What does [RelayCommand] on void New() generate?", "A NewCommand property (IRelayCommand)."],
      ["What does [RelayCommand] on async Task Delete() generate?", "An IAsyncRelayCommand called DeleteCommand."],
      ["How does a bound button know to grey out?", "It is enabled exactly while the command's CanExecute is true."],
      ["What does [NotifyCanExecuteChangedFor(nameof(DeleteCommand))] do?", "Raises DeleteCommand's CanExecuteChanged whenever that property changes."],
      ["How do you bind Ctrl+N to a command?", "<KeyBinding Gesture=\"Ctrl+N\" Command=\"{Binding NewCommand}\" /> in Window.KeyBindings."]
    ],
    quiz: [
      { q: "A Delete button bound to DeleteCommand stays grey after a note is selected. Most likely…", opts: ["the binding is one-way", "CanExecuteChanged was never raised", "Delete is async", "the button has no Click"], ans: 1, why: "The button asks again only when told the answer may have changed." },
      { q: "`[RelayCommand] async Task Save()` gives…", opts: ["SaveAsyncCommand", "SaveCommand (IAsyncRelayCommand)", "SaveCommand (ICommand only)", "nothing until registered"], ans: 1, why: "The toolkit names it after the method, async-aware." },
      { q: "Where should the command live?", opts: ["the code-behind", "the view model", "App.axaml", "the model"], ans: 1, why: "The view binds; the view model acts." }
    ]
  });

  /* ================================================================
     T2.9 MVVM with CommunityToolkit.Mvvm
     ================================================================ */
  lesson("T2.9", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "T2B's window bound to a class it also created, and T2.7's notification code was long. As apps grow, the window, its state and the app's data tangle together.",
        "**MVVM** splits them: the **Model** (notes, files — no UI), the **View** (XAML that only binds) and the **View Model** (what the view shows and can do, as properties and commands).",
        "**CommunityToolkit.Mvvm** writes the repetitive part with source generators: `ObservableObject`, `[ObservableProperty]`, `[RelayCommand]`."
      ] },
      page("Core idea"),
      sh("add the toolkit", "dotnet add src/Notes package CommunityToolkit.Mvvm"),
      cs("a view model in a few lines", 'using CommunityToolkit.Mvvm.ComponentModel;\n\npublic partial class NoteViewModel(string text = "") : ObservableObject\n{\n    [ObservableProperty]\n    [NotifyPropertyChangedFor(nameof(Title), nameof(Words))]\n    public partial string Text { get; set; } = text;\n\n    public string Title => FirstLine(Text) ?? "Untitled";\n    public string Words => CountWords(Text) switch { 0 => "No words", 1 => "1 word", int n => $"{n} words" };\n}'),
      xaml("the view only binds", '<Window x:DataType="local:MainViewModel">\n    <ListBox x:Name="NoteList" ItemsSource="{Binding Notes}" SelectedItem="{Binding Selected}">\n        <ListBox.ItemTemplate><DataTemplate x:DataType="local:NoteViewModel"><TextBlock Text="{Binding Title}" /></DataTemplate></ListBox.ItemTemplate>\n    </ListBox>\n    <TextBox x:Name="Editor" AcceptsReturn="True" Text="{Binding Selected.Text, FallbackValue=\'\'}" />\n</Window>'),
      { ul: [
        "`partial` matters: the generator writes the other half of the class (the property's body, the event, the command).",
        "`[ObservableProperty] public partial string Text` (toolkit 8.4, C# 14) generates a property that raises `PropertyChanged` only on a real change; `[NotifyPropertyChangedFor]` raises `Title` and `Words` too.",
        "Nothing in `NoteViewModel` knows about controls — so it can be tested with a plain `[Fact]`."
      ] },
      page("Rules"),
      { table: { head: ["Layer", "Holds", "Knows about"], rows: [
        ["Model", "notes, the store, rules", "nothing above it"],
        ["View model", "state to show, commands", "the model and services (by interface)"],
        ["View", "XAML, view-only code-behind", "its view model, through bindings"]
      ] } },
      { ul: [
        "The view model never touches a control, a window or `TopLevel`; anything it needs from the outside (files, dialogs, the clock) comes in as an interface.",
        "One view model per view (per page, per dialog, per list item when items have state).",
        "The composition root — `App.OnFrameworkInitializationCompleted` — creates the real services and the first view model.",
        "Older toolkit code writes `[ObservableProperty] private string text;` (a field); the partial-property form is the current one and works with trimming."
      ] },
      page("Variations"),
      { h: "React when a property changes" },
      cs("a partial method the generator calls", 'partial void OnTextChanged(string value) => IsDirty = true;'),
      { h: "A list item with its own view model" },
      cs("each row is a NoteViewModel", 'public ObservableCollection<NoteViewModel> Notes { get; } = new();'),
      { h: "The composition root" },
      cs("App.axaml.cs picks the real services", 'var window = new MainWindow();\nvar store = new FolderNoteStore(Path.Combine(Environment.CurrentDirectory, "notes-data"));\nwindow.DataContext = new MainViewModel(store, new WindowDialogs(window));\ndesktop.MainWindow = window;'),
      page("Pitfalls"),
      { h: "A view model that is not partial" },
      sh("[ObservableProperty] in a class declared without partial", "error CS0260: Missing partial modifier on declaration of type 'NoteViewModel'; another partial declaration of this type exists"),
      { h: "A view model that reaches into the view" },
      "`((MainWindow)App.Current…).Editor.Text = …` in a view model makes it untestable and couples it to one window. Expose a property; let the view bind it.",
      { h: "Click handlers sneaking back" },
      "A `Click=\"OnSave\"` that calls the view model works, but it is a second way in that tests cannot reach. Bind `Command=\"{Binding SaveCommand}\"` instead.",
      page("Connections"),
      { ul: [ "**Back:** T2.7's notification (now generated); T2.8's commands; unit 10's dependency inversion — services by interface.", "**Next:** T2.10's services for files and dialogs; T2.12 builds the services with dependency injection.", "**The project:** milestone 2 — `NoteViewModel` with the toolkit, and a window that only binds." ] },
      page("Good practice"),
      { ul: [ "Views bind; view models decide; models know nothing of either.", "Keep code-behind for things only a view can do (focus, scroll).", "Make every view model constructible in a test with fakes." ] },
      page("Practise"),
      { ul: [ "**Markdown notes, milestone 2:** `NoteViewModel`'s `Text`, `Title`, `Words`; the list, editor, buttons, Ctrl+N and word count — bindings only." ] },
      page("Quick reference"),
      cs("the toolkit", 'public partial class VM : ObservableObject\n{\n    [ObservableProperty] public partial string Text { get; set; } = "";\n    [RelayCommand] void Save() { }\n}'),
      { ul: [ "Model · View · View model.", "`ObservableObject`, `[ObservableProperty]`, `[NotifyPropertyChangedFor]`, `[RelayCommand]`.", "Classes are `partial`; services come in by interface." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["CS0260: Missing partial modifier on declaration of type", "the view model is not partial", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What are the three parts of MVVM?", "Model (data and rules), View (XAML), View model (state and commands for the view)."],
      ["Why must a toolkit view model be partial?", "The source generator writes the other half of the class."],
      ["What does [ObservableProperty] public partial string Text generate?", "A property that raises PropertyChanged when its value really changes."],
      ["What does [NotifyPropertyChangedFor(nameof(Title))] add?", "Raises Title's change whenever this property changes."],
      ["Where are the real services created?", "In the composition root — App.OnFrameworkInitializationCompleted."],
      ["What may a view model never touch?", "Controls, windows and other view types."]
    ],
    quiz: [
      { q: "A view model needs to save files. It should…", opts: ["new up a FolderNoteStore", "take an INoteStore in its constructor", "call the window", "use a static class"], ans: 1, why: "Services by interface, so tests can pass a fake." },
      { q: "`partial void OnTextChanged(string value)` is called…", opts: ["never", "by the generated Text setter after a change", "by the view", "on every get"], ans: 1, why: "The toolkit generates hooks for each observable property." },
      { q: "Which belongs in the code-behind?", opts: ["saving a note", "deciding if Delete can run", "focusing the editor when it opens", "the word count"], ans: 2, why: "Only view-only work stays in the view." }
    ]
  });

  /* ================================================================
     T2.10 Files and dialogs
     ================================================================ */
  lesson("T2.10", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A notes app must keep notes between runs and let the user open and save files where they like — and ask \"are you sure?\" before deleting.",
        "Desktop apps ask the operating system for files through the **storage provider** (the native Open and Save dialogs, sandbox-friendly), and keep their own data in a folder they own.",
        "Both are the outside world. The view model reaches them through **interfaces** — `INoteStore`, `IDialogs` — so tests can stand in for the disk and the user."
      ] },
      page("Core idea"),
      cs("a folder of Markdown files behind an interface", 'public interface INoteStore\n{\n    Task<IReadOnlyList<string>> LoadAllAsync(CancellationToken ct = default);\n    Task SaveAllAsync(IReadOnlyList<string> notes, CancellationToken ct = default);\n}\n\npublic async Task SaveAllAsync(IReadOnlyList<string> notes, CancellationToken ct = default)\n{\n    ct.ThrowIfCancellationRequested();\n    Directory.CreateDirectory(Folder);\n    foreach (var old in Directory.GetFiles(Folder, "*.md")) File.Delete(old);\n    for (int i = 0; i < notes.Count; i++)\n        await File.WriteAllTextAsync(Path.Combine(Folder, FileName(i + 1, notes[i])), notes[i], ct);\n}'),
      cs("a question behind an interface", 'public interface IDialogs { Task<bool> ConfirmAsync(string question); }\n\n[RelayCommand(CanExecute = nameof(HasSelection))]\nasync Task Delete()\n{\n    if (Selected is not { } note) return;\n    if (!await Dialogs.ConfirmAsync($"Delete “{note.Title}”?")) return;\n    Notes.Remove(note);\n}'),
      cs("the native Save dialog, from the view (compiled against Avalonia 12)", 'var file = await TopLevel.GetTopLevel(this)!.StorageProvider.SaveFilePickerAsync(new FilePickerSaveOptions\n{\n    Title = "Export note",\n    SuggestedFileName = "note.md",\n    FileTypeChoices = new[] { new FilePickerFileType("Markdown") { Patterns = new[] { "*.md" } } }\n});\nif (file is null) return;                       // the user cancelled\nawait using var stream = await file.OpenWriteAsync();\nawait using var writer = new StreamWriter(stream);\nawait writer.WriteAsync(text);'),
      { ul: [
        "The store owns its folder: it replaces the `.md` files it wrote and leaves everything else alone.",
        "`IDialogs` lets the view model *ask*; the real `WindowDialogs` shows a modal window with `ShowDialog<bool>(owner)`, and a test's fake answers yes or no at once.",
        "The storage provider hands back an `IStorageFile` (not a path): open it as a stream. A null result means the user cancelled."
      ] },
      page("Rules"),
      { table: { head: ["Need", "Use"], rows: [
        ["the app's own data", "a folder you choose (`Environment.GetFolderPath(SpecialFolder.ApplicationData)` in a real app)"],
        ["a file the user picks", "`StorageProvider.OpenFilePickerAsync` / `SaveFilePickerAsync`"],
        ["a folder the user picks", "`StorageProvider.OpenFolderPickerAsync`"],
        ["a yes/no question", "an `IDialogs` service; a modal window behind it"],
        ["a message only", "a notification (T2.15), not a modal"]
      ] } },
      { ul: [
        "File work is I/O: make it async and pass the `CancellationToken` through.",
        "Ask before anything destructive, and say what will be lost (`Delete “Shopping”?`).",
        "Name files from content safely: letters and digits only, runs of anything else as one dash, a length limit.",
        "Put the storage provider calls in the view (or a service that is given the `TopLevel`), never in a view model directly."
      ] },
      page("Variations"),
      { h: "Open a file the user chooses" },
      cs("OpenFilePickerAsync returns a list", 'var files = await StorageProvider.OpenFilePickerAsync(new FilePickerOpenOptions\n{\n    Title = "Open a note", AllowMultiple = false,\n    FileTypeFilter = new[] { new FilePickerFileType("Markdown") { Patterns = new[] { "*.md", "*.txt" } } }\n});\nif (files.Count == 0) return null;\nawait using var stream = await files[0].OpenReadAsync();\nreturn await new StreamReader(stream).ReadToEndAsync();'),
      { h: "A modal confirmation window" },
      cs("WindowDialogs.ConfirmAsync (in the project)", 'var dialog = new Window { Title = "Markdown notes", Width = 360, SizeToContent = SizeToContent.Height, Content = panel };\nyes.Click += (_, _) => dialog.Close(true);\nno.Click += (_, _) => dialog.Close(false);\nreturn await dialog.ShowDialog<bool>(owner);'),
      { h: "A fake for tests" },
      cs("answers as told, remembers the question", 'public sealed class Answers(bool yes) : IDialogs\n{\n    public List<string> Asked { get; } = new();\n    public Task<bool> ConfirmAsync(string q) { Asked.Add(q); return Task.FromResult(yes); }\n}'),
      page("Pitfalls"),
      { h: "Old files left behind" },
      "Saving three notes, then one, without removing the first save's files loads four notes next time. Replace what you wrote — only the `.md` files, never the whole folder.",
      { h: "A cancelled token ignored" },
      sh("a test that cancels first, against a store that never checks", "Assert.ThrowsAny() Failure: No exception was thrown\nExpected: typeof(System.OperationCanceledException)"),
      { ul: [ "Call `ct.ThrowIfCancellationRequested()` and pass `ct` to every async file call." ] },
      { h: "A dialog from inside the view model" },
      "`new Window().ShowDialog(…)` in a view model needs a real window and a screen — and hangs a headless test. Ask through `IDialogs`.",
      page("Connections"),
      { ul: [ "**Back:** unit 6's files; unit 11's async and cancellation; capstone 4's store interface.", "**Next:** T2.11 tests all of this with fakes; T2.15 keeps settings the same way.", "**The project:** milestone 3 — `FolderNoteStore`, and Save and Load as async commands." ] },
      page("Good practice"),
      { ul: [ "Every outside dependency behind an interface the view model is given.", "Async all the way, with the token.", "Confirm destructive actions in words the user recognises." ] },
      page("Practise"),
      { ul: [ "**Markdown notes, milestone 3:** `FileName`, `SaveAllAsync`, `LoadAllAsync`; `SaveCommand` and `LoadCommand`." ] },
      page("Quick reference"),
      cs("the pieces", 'await File.WriteAllTextAsync(path, text, ct);\nvar file = await StorageProvider.SaveFilePickerAsync(new FilePickerSaveOptions { SuggestedFileName = "note.md" });\nif (!await Dialogs.ConfirmAsync("Delete?")) return;'),
      { ul: [ "Own data in your folder; user files through the storage provider.", "Questions through `IDialogs`; modals with `ShowDialog<T>`.", "Fakes for the disk and the user in tests." ] },
      { table: { head: ["Symptom", "Cause", "Page"], rows: [["more notes load than were saved", "old files not removed", "Pitfalls"], ["a cancelled save carries on", "the token is never checked", "Pitfalls"]] } }
    ],
    flashcards: [
      ["How does an Avalonia app ask the user for a file to save?", "TopLevel.GetTopLevel(view).StorageProvider.SaveFilePickerAsync(…)"],
      ["What does the storage provider return for a chosen file?", "An IStorageFile — open it with OpenReadAsync / OpenWriteAsync."],
      ["What does a null (or empty) picker result mean?", "The user cancelled."],
      ["Why put confirmation behind IDialogs?", "So the view model can ask, and a test's fake can answer without a screen."],
      ["How does a modal window return a value?", "await dialog.ShowDialog<bool>(owner); the dialog calls Close(true/false)."],
      ["Why must SaveAllAsync remove the old .md files?", "Otherwise notes deleted since the last save come back."]
    ],
    quiz: [
      { q: "Where should SaveFilePickerAsync be called from?", opts: ["the view model", "the view (or a service given the TopLevel)", "the model", "App.axaml"], ans: 1, why: "It needs a TopLevel; view models stay UI-free." },
      { q: "A test of Delete with the real WindowDialogs…", opts: ["passes", "needs a window and a screen, and hangs headless", "is fine with [Fact]", "skips the dialog"], ans: 1, why: "Use a fake IDialogs." },
      { q: "A file name from the title \"Ideas: C# & Avalonia!\" in this project is…", opts: ["01-Ideas: C# & Avalonia!.md", "01-ideas-c-avalonia.md", "ideas.md", "01-ideas-c#-avalonia.md"], ans: 1, why: "Lower case; each run of other characters becomes one dash." }
    ]
  });

  /* ================================================================
     T2.11 Testing the UI headless
     ================================================================ */
  lesson("T2.11", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Clicking through the app after every change is slow, and it misses things. Desktop UIs have a reputation for being hard to test — mostly because their logic hides in code-behind.",
        "MVVM fixes most of it: a view model is a plain object, tested with a plain `[Fact]`.",
        "For the rest — does the window bind what it should, does the button enable, does Ctrl+N work — **Avalonia.Headless** runs real windows with no screen, and `[AvaloniaFact]` tests drive them: type, click, read."
      ] },
      page("Core idea"),
      sh("the test project's packages (xunit v3)", "dotnet add tests/Notes.Tests package xunit.v3\ndotnet add tests/Notes.Tests package Avalonia.Headless.XUnit"),
      cs("TestApp.cs: start your App headless for the whole test assembly", 'using Avalonia;\nusing Avalonia.Headless;\n\n[assembly: AvaloniaTestApplication(typeof(Notes.Tests.TestApp))]\n\nnamespace Notes.Tests;\n\npublic static class TestApp\n{\n    public static AppBuilder BuildAvaloniaApp() =>\n        AppBuilder.Configure<App>().UseHeadless(new AvaloniaHeadlessPlatformOptions());\n}'),
      cs("a view-model test and a window test", 'public class NoteTests\n{\n    [Fact]\n    public void A_heading_is_the_title() => Assert.Equal("Plans", new NoteViewModel("### Plans").Title);\n\n    [AvaloniaFact]\n    public void Clicking_New_then_typing_shows_the_title()\n    {\n        var vm = new MainViewModel(new MemoryStore(), new Answers(true));\n        var w = new MainWindow { DataContext = vm };\n        w.Show();\n        var button = w.FindControl<Button>("NewButton")!;\n        var middle = button.TranslatePoint(new Point(button.Bounds.Width / 2, button.Bounds.Height / 2), w)!.Value;\n        w.MouseDown(middle, MouseButton.Left);\n        w.MouseUp(middle, MouseButton.Left);\n        w.FindControl<TextBox>("Editor")!.Focus();\n        w.KeyTextInput("# Shopping");\n        Dispatcher.UIThread.RunJobs();\n        Assert.Equal("Shopping", vm.Notes[0].Title);\n    }\n}'),
      { ul: [
        "`[AvaloniaFact]` runs the test on Avalonia's UI thread, inside the headless app `TestApp` started.",
        "`MouseDown`/`MouseUp`, `KeyTextInput` and `KeyPressQwerty` send real input events — the same path a user's input takes.",
        "`Dispatcher.UIThread.RunJobs()` lets queued work (bindings, layout, continuations) finish before you assert."
      ] },
      page("Rules"),
      { table: { head: ["Test", "Kind", "Checks"], rows: [
        ["rules and state", "`[Fact]` on the view model", "commands, CanExecute, notifications, the store's calls"],
        ["bindings and wiring", "`[AvaloniaFact]` on a window", "typing reaches the view model; buttons follow commands"],
        ["keyboard", "`[AvaloniaFact]` + `KeyPressQwerty`", "gestures, Tab order (T2.18)"],
        ["layout", "`[AvaloniaFact]` + `Bounds`", "nothing overlaps; it adapts (T2.19)"],
        ["the disk, the network, the user", "fakes passed in", "never the real thing"]
      ] } },
      { ul: [
        "Most tests should be view-model tests: fast and exact. A few window tests prove the bindings.",
        "Find controls by `x:Name` — tests are one more reason to name the controls that matter.",
        "`IsEffectivelyEnabled` is what the user sees (a disabled parent disables its children); `IsEnabled` is only the control's own setting.",
        "Headless can also render frames (`CaptureRenderedFrame`) for screenshot tests; this track checks behaviour instead."
      ] },
      page("Variations"),
      { h: "A key gesture" },
      cs("Ctrl+N makes a note", '[AvaloniaFact]\npublic void Ctrl_N_makes_a_note()\n{\n    var vm = new MainViewModel(new MemoryStore(), new Answers(true));\n    var w = new MainWindow { DataContext = vm };\n    w.Show();\n    w.KeyPressQwerty(PhysicalKey.N, RawInputModifiers.Control);\n    Dispatcher.UIThread.RunJobs();\n    Assert.Single(vm.Notes);\n}'),
      { h: "A helper for the repeated part" },
      cs("one place to type into a box", 'static void Type(Window w, string box, string text)\n{\n    var t = w.FindControl<TextBox>(box)!;\n    t.Focus(); t.SelectAll();\n    w.KeyTextInput(text);\n    Dispatcher.UIThread.RunJobs();\n}'),
      { h: "A store test with a real folder" },
      cs("a temporary folder per test, deleted after", 'public class StoreTests : IDisposable\n{\n    readonly string folder = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N"));\n    public void Dispose() { if (Directory.Exists(folder)) Directory.Delete(folder, true); }\n}'),
      page("Pitfalls"),
      { h: "A window test as a plain [Fact]" },
      "`new MainWindow()` in a `[Fact]` fails: there is no Avalonia app on that thread. Use `[AvaloniaFact]` (and keep `TestApp.cs`'s assembly attribute).",
      { h: "Asserting before the UI caught up" },
      "A binding or a continuation that has not run yet makes a test fail one time in five. Call `Dispatcher.UIThread.RunJobs()` after each action.",
      { h: "Touching a control from another thread" },
      sh("setting TextBlock.Text inside Task.Run", "System.InvalidOperationException : The calling thread cannot access this object because a different thread owns it."),
      page("Connections"),
      { ul: [ "**Back:** unit 10's tests and doubles; T2.9's view models — the reason they are testable.", "**Next:** T2D's async view models are tested with a fake clock; the capstone's milestones are window tests.", "**The project:** milestone 4 — six of your own tests, at least one `[AvaloniaFact]`." ] },
      page("Good practice"),
      { ul: [ "Test view models first; window tests only for what needs a window.", "Drive windows as a user would: input events, not setting properties behind the controls.", "Fakes for everything outside: disk, network, clock, user." ] },
      page("Practise"),
      { ul: [ "**Markdown notes, milestone 4:** your own tests, one of them an `[AvaloniaFact]`; no warnings; committed." ] },
      page("Quick reference"),
      cs("the headless kit", '[assembly: AvaloniaTestApplication(typeof(TestApp))]\n[AvaloniaFact] public void T() { var w = new MainWindow(); w.Show(); w.KeyTextInput("x"); Dispatcher.UIThread.RunJobs(); }'),
      { ul: [ "`[Fact]` for view models; `[AvaloniaFact]` for windows.", "`MouseDown`/`MouseUp`, `KeyTextInput`, `KeyPressQwerty`, then `RunJobs()`.", "`FindControl<T>(name)`; `IsEffectivelyEnabled`." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["The calling thread cannot access this object because a different thread owns it", "UI touched off the UI thread", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What runs Avalonia windows in tests with no screen?", "Avalonia.Headless (with Avalonia.Headless.XUnit)."],
      ["Which attribute marks a test that needs the Avalonia UI thread?", "[AvaloniaFact]"],
      ["What tells the test assembly which app to start headless?", "[assembly: AvaloniaTestApplication(typeof(TestApp))] with BuildAvaloniaApp using UseHeadless."],
      ["How do you type into the focused box in a headless test?", "window.KeyTextInput(\"text\")"],
      ["What does Dispatcher.UIThread.RunJobs() do in a test?", "Runs queued UI work — bindings, layout, continuations — before you assert."],
      ["Most of a UI's tests should be of what?", "The view models — plain [Fact]s."]
    ],
    quiz: [
      { q: "`new MainWindow()` inside a plain [Fact]…", opts: ["works", "fails: no Avalonia app on that thread", "opens a real window", "is skipped"], ans: 1, why: "[AvaloniaFact] provides the headless app and its thread." },
      { q: "Which proves a button follows its command's CanExecute?", opts: ["IsEnabled", "IsEffectivelyEnabled", "IsVisible", "Command != null"], ans: 1, why: "IsEffectivelyEnabled is what the user can actually press." },
      { q: "Why send input events rather than set TextBox.Text in a window test?", opts: ["it is faster", "it goes through the same path as a user's typing", "Text is read-only", "bindings ignore Text"], ans: 1, why: "Input events exercise focus, routing and binding together." }
    ]
  });

  /* ================================================================
     command cards
     ================================================================ */
  var short = function (s) { s = String(s).replace(/^(Type the |Name the |Which |Write the )/, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };
  K.add({ cards: {
    "t2c-commands": { title: "Commands", lesson: "T2.8", concepts: ["commands"], kind: "command",
      vary: function (r) {
        var m = pick(r, ["Save", "Delete", "Load", "Export"]);
        var q = pick(r, [
          ["Write the binding that makes a Button run the command generated from a method called " + m + ".", "Command=\"{Binding " + m + "Command}\"", ["^Command=\"\\{Binding " + m + "Command\\}\"$"]],
          ["Which attribute turns a view-model method into a command?", "[RelayCommand]", ["^\\[?RelayCommand(Attribute)?(\\(.*\\))?\\]?$"]],
          ["Which ICommand method answers \"may it run now?\"", "CanExecute", ["^CanExecute(\\(.*\\))?$"]],
          ["Which attribute re-asks a command's CanExecute when a property changes?", "[NotifyCanExecuteChangedFor]", ["^\\[?NotifyCanExecuteChangedFor(Attribute)?(\\(.*\\))?\\]?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(" called " + m, ""), params: [m], answer: q[1], accept: q[2], hint: "Command=\"{Binding XCommand}\" · [RelayCommand] · CanExecute · [NotifyCanExecuteChangedFor]." };
      } },
    "t2c-mvvm": { title: "MVVM with the toolkit", lesson: "T2.9", concepts: ["mvvm"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Type the command that adds the MVVM toolkit's package to the project in src/Notes.", "dotnet add src/Notes package CommunityToolkit.Mvvm", ["^dotnet add (\\./)?src/Notes(/Notes\\.csproj)? package CommunityToolkit\\.Mvvm( (-v|--version) \\S+)?$"]],
          ["Which toolkit base class gives a view model PropertyChanged?", "ObservableObject", ["^ObservableObject$"]],
          ["Which attribute generates an observable property?", "[ObservableProperty]", ["^\\[?ObservableProperty(Attribute)?\\]?$"]],
          ["Which keyword must a toolkit view-model class carry so the generator can add to it?", "partial", ["^partial$"]],
          ["Which attribute raises another property's change too, such as Title when Text changes?", "[NotifyPropertyChangedFor]", ["^\\[?NotifyPropertyChangedFor(Attribute)?(\\(.*\\))?\\]?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], hint: "CommunityToolkit.Mvvm · ObservableObject · [ObservableProperty] · partial · [NotifyPropertyChangedFor]." };
      } },
    "t2c-files": { title: "Files, dialogs and tests", lesson: "T2.10", concepts: ["files-dialogs", "ui-tests"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Which StorageProvider method shows the native Save dialog?", "SaveFilePickerAsync", ["^(StorageProvider\\.)?SaveFilePickerAsync(\\(.*\\))?$"]],
          ["Which StorageProvider method shows the native Open dialog?", "OpenFilePickerAsync", ["^(StorageProvider\\.)?OpenFilePickerAsync(\\(.*\\))?$"]],
          ["Which attribute marks a test that runs on Avalonia's headless UI thread?", "[AvaloniaFact]", ["^\\[?AvaloniaFact(Attribute)?\\]?$"]],
          ["Type the call that runs the UI thread's queued work in a headless test.", "Dispatcher.UIThread.RunJobs();", ["^Dispatcher\\.UIThread\\.RunJobs\\(\\);?$"]],
          ["Which Window method shows it as a modal that returns a value (without the type argument)?", "ShowDialog", ["^ShowDialog(<\\w+>)?(\\(.*\\))?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], ci: true, hint: "SaveFilePickerAsync · OpenFilePickerAsync · [AvaloniaFact] · RunJobs · ShowDialog." };
      } }
  } });

  /* ================================================================
     the part's project: Markdown notes
     ================================================================ */
  K.project("rp-t2c-notes", {
    unit: "T2C", title: "Markdown notes", folder: "markdown-notes", solution: "MarkdownNotes.sln",
    scaffoldVersion: 1, minValidator: "1.1.1", sdk: ".NET 10 SDK",
    summary: "A notes app built the MVVM way: view models from CommunityToolkit.Mvvm, commands that know when they can run, notes as Markdown files, a confirmation behind an interface — and your own headless UI tests.",
    brief: [
      "`src/Notes` in three folders: `Views/` (bind only), `ViewModels/` (`MainViewModel`, `NoteViewModel` — yours) and `Services/` (`FolderNoteStore` is yours; `IDialogs` and `WindowDialogs` are written). Kurenai's tests for milestones 1–3 use a store in memory and dialogs that answer as told; your own tests can open windows (`TestApp.cs` is ready).",
      { ul: [
        "Replace the four stub commands with `[RelayCommand]` methods; make the view models `partial` `ObservableObject`s.",
        "The names matter: `NoteList`, `Editor`, `NewButton`, `DeleteButton`, `WordCount`.",
        "No `Click=` handlers in `Views/MainWindow.axaml`.",
        "`Directory.Build.props`, `tests/Notes.Acceptance/` and `.kurenai/validate.cs` are **protected**."
      ] }
    ],
    milestones: [
      { id: "m1", title: "Commands", lessons: ["T2.8"], about: "New adds and selects; Delete runs only with a selection, asks first, and selects a neighbour.",
        checks: [{ type: "tests", class: "Milestone1" }, { type: "source", path: "src/Notes/ViewModels", contains: ["\\[RelayCommand"] }] },
      { id: "m2", title: "MVVM", lessons: ["T2.9"], about: "NoteViewModel's Title and Words follow Text through the toolkit; the window only binds, with Ctrl+N.",
        checks: [{ type: "tests", class: "Milestone2" }, { type: "source", path: "src/Notes/ViewModels", contains: ["\\[ObservableProperty\\]"] }, { type: "source", path: "src/Notes/Views/MainWindow.axaml", forbids: ["Click="] }] },
      { id: "m3", title: "Files", lessons: ["T2.10"], about: "FolderNoteStore names, saves and loads .md files; Save and Load are async commands.", checks: [{ type: "tests", class: "Milestone3" }] },
      { id: "m4", title: "Your own tests", lessons: ["T2.11"], about: "Six or more of your own tests, at least one an [AvaloniaFact]; no warnings; committed.",
        checks: [{ type: "owntests", prefix: "Notes.Tests.", min: 6 }, { type: "source", path: "tests/Notes.Tests", contains: ["\\[AvaloniaFact\\]"] }, { type: "warnings", max: 0 }, { type: "git" }] }
    ],
    protected: ["Directory.Build.props", "tests/Notes.Acceptance/Notes.Acceptance.csproj", "tests/Notes.Acceptance/Headless.cs", "tests/Notes.Acceptance/Fakes.cs", "tests/Notes.Acceptance/Milestone1.cs", "tests/Notes.Acceptance/Milestone2.cs", "tests/Notes.Acceptance/Milestone3.cs", ".kurenai/validate.cs"],
    reward: { xp: 140, gold: 35, hp: 8 }
  });
})();
