/* Kurenai OS — data/content/code-t2e.js
   Code · T2 · Part E · A complete app (docs/code-plan.md §3.3), done in
   Rider with Avalonia 12 — and the track's capstone, The Planner on the
   desktop (CT2).

   Navigation (T2.16), validation (T2.17), accessibility (T2.18), responsive
   layouts (T2.19), packaging and publishing (T2.20). Rider form (smoke75);
   COMMAND cards. The capstone's build is a Rider project (rp-ct2-planner,
   scaffold in tools/code-projects/planner-desktop/): an accepted report
   passes its milestones, and the capstone pays, not the project (invariant
   106). tools/validator_check.mjs runs it fresh, solved and broken.        */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function sh(cap, src) { return { code: { lang: "shell", src: src, cap: cap } }; }
  function cs(cap, src) { return { code: { lang: "csharp", src: src, cap: cap } }; }
  function xaml(cap, src) { return { code: { lang: "xaml", src: src, cap: cap } }; }
  function xml(cap, src) { return { code: { lang: "xml", src: src, cap: cap } }; }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  function call(t, h, body) { return { callout: { t: t, h: h, body: body } }; }

  K.add({ concepts: {
    "navigation": { name: "Navigation", lesson: "T2.16", about: "a shell, pages as view models, a back stack" },
    "validation": { name: "Validation", lesson: "T2.17", about: "ObservableValidator, data annotations, errors beside fields" },
    "a11y-desktop": { name: "Accessibility", lesson: "T2.18", about: "names, labels, Tab order, keyboard-only use" },
    "responsive": { name: "Responsive layouts", lesson: "T2.19", about: "one layout that adapts to the window's width" },
    "publish": { name: "Packaging and publishing", lesson: "T2.20", about: "versions, publish profiles, self-contained apps" }
  } });

  /* ================================================================
     T2.16 Navigation
     ================================================================ */
  lesson("T2.16", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A real app has more than one screen: a list, an editor, a summary. Opening a new window for each is clumsy; swapping controls in code-behind tangles every screen with every other.",
        "In MVVM a **page is a view model**. The shell's view model holds the page showing now (`Current`) and a **back stack**; a `ContentControl` shows whatever `Current` is, and a `DataTemplate` per page type picks its view.",
        "Pages ask a navigator to move — so they never know about each other's views, and a test can check where the app went without a window."
      ] },
      page("Core idea"),
      cs("the shell: the page showing, and the way back", 'public partial class ShellViewModel : ViewModelBase, INavigator\n{\n    readonly Stack<ViewModelBase> history = new();\n\n    [ObservableProperty]\n    [NotifyPropertyChangedFor(nameof(CanGoBack))]\n    [NotifyCanExecuteChangedFor(nameof(BackCommand))]\n    public partial ViewModelBase Current { get; private set; }\n\n    public bool CanGoBack => history.Count > 0;\n\n    public void GoTo(ViewModelBase page) { history.Push(Current); Current = page; _ = page.ActivateAsync(); }\n\n    [RelayCommand(CanExecute = nameof(CanGoBack))]\n    public void Back() { if (history.Count == 0) return; Current = history.Pop(); _ = Current.ActivateAsync(); }\n}'),
      xaml("App.axaml: each page's view model has a view", '<Application.DataTemplates>\n    <DataTemplate DataType="local:TopicsViewModel"><local:TopicsView /></DataTemplate>\n    <DataTemplate DataType="local:TopicEditorViewModel"><local:TopicEditorView /></DataTemplate>\n    <DataTemplate DataType="local:NextViewModel"><local:NextView /></DataTemplate>\n</Application.DataTemplates>'),
      xaml("MainWindow.axaml: a bar and one slot for the page", '<DockPanel>\n    <StackPanel DockPanel.Dock="Top" Orientation="Horizontal" Spacing="8" Margin="12">\n        <Button x:Name="BackButton" Content="‹ Back" AutomationProperties.Name="Back" Command="{Binding BackCommand}" />\n        <Button x:Name="TopicsTab" Content="Topics" Command="{Binding ShowTopicsCommand}" />\n        <Button x:Name="NextTab" Content="Next" Command="{Binding ShowNextCommand}" />\n    </StackPanel>\n    <ContentControl x:Name="Page" Content="{Binding Current}" />\n</DockPanel>'),
      { ul: [
        "`ContentControl` with a view-model `Content` looks for a matching `DataTemplate` — this is the *view locator*, in four lines of XAML.",
        "`ActivateAsync()` runs each time a page is shown, so a page reloads its data when you come back to it (after an edit, say).",
        "Pages get an `INavigator` (the shell, behind an interface): `Nav.GoTo(new TopicEditorViewModel(…))`, `Nav.Back()`."
      ] },
      page("Rules"),
      { table: { head: ["Piece", "Job"], rows: [
        ["shell view model", "`Current`, the back stack, the top-level commands"],
        ["page view model", "its own state and commands; asks the navigator to move"],
        ["`DataTemplate` per page type", "which view draws which page"],
        ["`ContentControl Content=\"{Binding Current}\"`", "the slot the page appears in"],
        ["`ActivateAsync`", "load what the page needs, each time it shows"]
      ] } },
      { ul: [
        "Back is a command with a `CanExecute` — the button greys out on the first page by itself.",
        "Top-level destinations (tabs) and drill-down (list → editor) can share one stack; decide whether a tab resets it.",
        "Pass what a page needs in its constructor (the topic to edit), not through global state.",
        "A modal (T2.10) is for a question; a page is for a place."
      ] },
      page("Variations"),
      { h: "A page asks to move" },
      cs("the topics page opens the editor", '[RelayCommand(CanExecute = nameof(HasSelection))]\nvoid Edit() => Nav.GoTo(new TopicEditorViewModel(Store, Nav, Selected));'),
      { h: "A page that loads when shown" },
      cs("ActivateAsync", 'public override async Task ActivateAsync()\n{\n    var all = await Store.LoadAsync();\n    Topics.Clear();\n    foreach (var t in all) Topics.Add(t);\n}'),
      { h: "A test of where the app went" },
      cs("no window needed", 'var shell = new ShellViewModel(store, clock);\nshell.ShowNextCommand.Execute(null);\nAssert.IsType<NextViewModel>(shell.Current);\nshell.BackCommand.Execute(null);\nAssert.IsType<TopicsViewModel>(shell.Current);'),
      page("Pitfalls"),
      { h: "A page with no template" },
      "The window shows `Planner.Desktop.NextViewModel` as plain text: there is no `DataTemplate` for that type. Add one to `Application.DataTemplates`.",
      { h: "Stale data after Back" },
      "Back to the list after saving an edit, and the old name is still there: the page loaded once, in its constructor. Load in `ActivateAsync`, which runs on every return.",
      { h: "Pages that create each other's views" },
      "`new TopicEditorView()` inside a view model ties it to a control and to one window. Make the view model; let the template make the view.",
      page("Connections"),
      { ul: [ "**Back:** T2C's view models and commands; T2.4's data templates.", "**Next:** T2.17 validates the editor page; T2.18 makes every page usable from the keyboard.", "**The capstone:** milestone 1 — the shell, three pages and the way back." ] },
      page("Good practice"),
      { ul: [ "Pages are view models; views come from templates.", "Navigation through one interface; nobody else touches `Current`.", "Reload in `ActivateAsync`, not the constructor." ] },
      page("Practise"),
      { ul: [ "**The Planner on the desktop, milestone 1:** `ShellViewModel`, `TopicsViewModel`, `NextViewModel`, the templates and the bar." ] },
      page("Quick reference"),
      xaml("the slot and a template", '<ContentControl x:Name="Page" Content="{Binding Current}" />\n<DataTemplate DataType="local:NextViewModel"><local:NextView /></DataTemplate>'),
      { ul: [ "`Current` + a back stack in the shell.", "`GoTo` pushes, `Back` pops; each shows calls `ActivateAsync`.", "One `DataTemplate` per page type." ] },
      { table: { head: ["Symptom", "Cause", "Page"], rows: [["a page shows its type name", "no DataTemplate for it", "Pitfalls"], ["old data after Back", "loaded once in the constructor", "Pitfalls"]] } }
    ],
    flashcards: [
      ["In MVVM navigation, what is a page?", "A view model; a DataTemplate picks its view."],
      ["What shows the current page in the window?", "A ContentControl whose Content is bound to the shell's Current."],
      ["How does Back know when it cannot run?", "Its CanExecute is CanGoBack — whether the back stack has anything."],
      ["Why load a page's data in ActivateAsync rather than its constructor?", "ActivateAsync runs each time the page is shown, so it reloads after Back."],
      ["How do pages move without knowing each other's views?", "Through an INavigator: GoTo(new PageViewModel(…)), Back()."],
      ["What does a ContentControl show for a view model with no matching template?", "Its ToString() — usually the type name."]
    ],
    quiz: [
      { q: "The window shows \"Planner.Desktop.NextViewModel\" instead of the Next page. Fix:", opts: ["override ToString", "add a DataTemplate for NextViewModel", "set Content in code-behind", "make it a UserControl"], ans: 1, why: "The ContentControl draws a view model through its template." },
      { q: "After editing a topic and going Back, the list shows the old name. Most likely…", opts: ["the store failed", "the list loads only in its constructor", "Back is broken", "PropertyChanged is missing on Topic"], ans: 1, why: "Load in ActivateAsync, which runs on each return." },
      { q: "Which should a page view model call to open the editor?", opts: ["new TopicEditorView()", "Nav.GoTo(new TopicEditorViewModel(…))", "Window.Show()", "Current = …"], ans: 1, why: "Pages ask the navigator; only the shell sets Current." }
    ]
  });

  /* ================================================================
     T2.17 Validation
     ================================================================ */
  lesson("T2.17", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Users type blanks, 61-character names and confidence 9. Checking only when Save is pressed, and answering with one message box, makes them hunt for what was wrong.",
        "Good validation is **live** and **local**: the error appears as the field changes, beside that field, in words that say what is wanted — and Save stays disabled until everything is right.",
        "The toolkit's **ObservableValidator** checks properties against **data annotations** (`[Required]`, `[MaxLength]`, `[Range]`) and reports errors through `INotifyDataErrorInfo`, which Avalonia draws beside the bound control."
      ] },
      page("Core idea"),
      cs("rules as attributes; validate on every set", 'public partial class TopicEditorViewModel : ViewModelBase   // ViewModelBase : ObservableValidator\n{\n    string name = "";\n\n    [Required(ErrorMessage = "Give the topic a name.")]\n    [MaxLength(60, ErrorMessage = "At most 60 characters.")]\n    public string Name\n    {\n        get => name;\n        set { SetProperty(ref name, value, validate: true); SaveCommand.NotifyCanExecuteChanged(); }\n    }\n\n    [Range(1, 5, ErrorMessage = "Confidence is 1 to 5.")]\n    public int Confidence { get => confidence; set { SetProperty(ref confidence, value, true); SaveCommand.NotifyCanExecuteChanged(); } }\n\n    bool CanSave => !HasErrors && !string.IsNullOrWhiteSpace(Name) && !string.IsNullOrWhiteSpace(Subject);\n\n    [RelayCommand(CanExecute = nameof(CanSave))]\n    async Task Save() { /* … */ }\n}'),
      xaml("the view just binds: errors appear beside the box", '<Label Content="_Name" Target="{Binding #NameBox}" />\n<TextBox x:Name="NameBox" Text="{Binding Name}" />\n<Button x:Name="SaveButton" Content="Save" IsDefault="True" Command="{Binding SaveCommand}" />'),
      { ul: [
        "`SetProperty(ref field, value, validate: true)` sets, notifies, and runs that property's attributes.",
        "`HasErrors` and `GetErrors(nameof(Name))` say what is wrong; `ErrorsChanged` fires when that changes.",
        "Avalonia's `DataValidationErrors` shows a bound control's errors (a red border and the message) with no code in the view."
      ] },
      page("Rules"),
      { table: { head: ["Attribute", "Checks"], rows: [
        ["`[Required]`", "not null, and for strings not blank (spaces count as blank)"],
        ["`[MaxLength(60)]` / `[MinLength(n)]`", "string or collection length"],
        ["`[Range(1, 5)]`", "a number between the two, inclusive"],
        ["`[RegularExpression(\"…\")]`", "a pattern, such as a code format"],
        ["`[CustomValidation(typeof(T), nameof(M))]`", "your own rule in a static method"]
      ] } },
      { ul: [
        "Do not shout before the user has typed: validate on change, not on load — but keep Save disabled while required fields are empty.",
        "Every message says what to do (\"Give the topic a name.\"), not just what is wrong (\"Invalid\").",
        "Validate again on the way in (the store, the model): a view model's checks are for the user, not a security boundary.",
        "Trim and normalise when saving (`\" CS \"` → `\"cs\"`), not while the user is typing."
      ] },
      page("Variations"),
      { h: "Validate everything at once" },
      cs("before a save that might bypass the fields", 'ValidateAllProperties();\nif (HasErrors) return;'),
      { h: "A rule of your own" },
      cs("CustomValidation", '[CustomValidation(typeof(TopicEditorViewModel), nameof(NotAllDigits))]\npublic string Name { … }\n\npublic static ValidationResult? NotAllDigits(string name, ValidationContext _) =>\n    name.Trim().All(char.IsDigit) && name.Trim().Length > 0 ? new("A name needs a letter.") : ValidationResult.Success;'),
      { h: "Reading errors in a test" },
      cs("GetErrors", 'vm.Name = "";\nAssert.True(vm.HasErrors);\nAssert.Contains("Give the topic a name.", vm.GetErrors(nameof(vm.Name)).Select(e => e.ErrorMessage));\nAssert.False(vm.SaveCommand.CanExecute(null));'),
      page("Pitfalls"),
      { h: "Errors that never show" },
      "`SetProperty(ref name, value)` without `validate: true` (or a plain setter) never runs the attributes: `HasErrors` stays false. Pass `true`, or call `ValidateProperty(value)`.",
      { h: "A Save button that stays enabled" },
      "`CanSave` depends on `HasErrors`, but nothing asks again when the errors change. Call `SaveCommand.NotifyCanExecuteChanged()` in the setters (or on `ErrorsChanged`).",
      { h: "A missing using" },
      sh("[Required] without its namespace", "error CS0246: The type or namespace name 'RequiredAttribute' could not be found (are you missing a using directive or an assembly reference?)"),
      { ul: [ "`using System.ComponentModel.DataAnnotations;`" ] },
      page("Connections"),
      { ul: [ "**Back:** T2.8's CanExecute; T2.9's toolkit; unit 6's exceptions — validation catches problems before they become them.", "**Next:** T2.18 makes the errors reachable for screen readers too; T1F validates the same rules on a server.", "**The capstone:** milestone 2 — the editor's rules, live errors and a Save that waits." ] },
      page("Good practice"),
      { ul: [ "Rules as attributes, messages that say what to do.", "Errors beside the field, as the user types.", "Commands that cannot run stay disabled — no \"you can't do that\" boxes." ] },
      page("Practise"),
      { ul: [ "**The Planner on the desktop, milestone 2:** `TopicEditorViewModel`'s rules, `SaveCommand` and `CancelCommand`, and the editor view." ] },
      page("Quick reference"),
      cs("the validator", '[Required(ErrorMessage = "…")] [MaxLength(60)] [Range(1, 5)]\nSetProperty(ref field, value, validate: true);\nHasErrors · GetErrors(name) · ValidateAllProperties()'),
      { ul: [ "`ObservableValidator` + data annotations.", "`validate: true` on set; `NotifyCanExecuteChanged` after.", "`DataValidationErrors` draws them; no view code." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["CS0246: The type or namespace name 'RequiredAttribute' could not be found", "using System.ComponentModel.DataAnnotations missing", "Pitfalls"]] } }
    ],
    flashcards: [
      ["Which toolkit base class validates properties?", "ObservableValidator."],
      ["How do you validate a property each time it is set?", "SetProperty(ref field, value, validate: true)"],
      ["Does [Required] accept a string of spaces?", "No — whitespace counts as blank."],
      ["Which properties tell you a view model's errors?", "HasErrors, and GetErrors(propertyName)."],
      ["What draws a bound control's errors in Avalonia?", "DataValidationErrors — automatically, from INotifyDataErrorInfo."],
      ["What should an error message say?", "What to do — \"Give the topic a name.\" — not just \"Invalid\"."]
    ],
    quiz: [
      { q: "`[Range(1, 5)] int Confidence`, set to 6 through SetProperty(…, true). HasErrors is…", opts: ["false", "true", "only after Save", "an exception"], ans: 1, why: "validate: true runs the attributes on set." },
      { q: "Save stays enabled after the name is cleared. Most likely…", opts: ["Required is wrong", "nobody called SaveCommand.NotifyCanExecuteChanged()", "the TextBox is one-way", "HasErrors is broken"], ans: 1, why: "The command must be asked again when the errors change." },
      { q: "Where should trimming \" CS \" to \"cs\" happen?", opts: ["on every keystroke", "when saving", "in the XAML", "never"], ans: 1, why: "Normalise on the way out; let the user type freely." }
    ]
  });

  /* ================================================================
     T2.18 Accessibility
     ================================================================ */
  lesson("T2.18", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Some people never touch a mouse; some hear the screen through a screen reader; some need larger text or higher contrast. An app that works only for a mouse and good eyes shuts them out — and annoys everyone else who prefers the keyboard.",
        "Accessibility is mostly three things: every control has a **name** a screen reader can say, everything works from the **keyboard** in a sensible **order**, and nothing depends on colour alone.",
        "Avalonia exposes controls to VoiceOver, Narrator and Orca through **automation properties**; the rest is how you lay out and wire the window."
      ] },
      page("Core idea"),
      xaml("names: a Label that targets its control, or AutomationProperties.Name", '<Label Content="_Name" Target="{Binding #NameBox}" />\n<TextBox x:Name="NameBox" Text="{Binding Name}" />\n\n<Button x:Name="BackButton" Content="‹" AutomationProperties.Name="Back" Command="{Binding BackCommand}" />\n<ListBox x:Name="TopicList" AutomationProperties.Name="Topics" ItemsSource="{Binding Topics}" />'),
      xaml("the keyboard: Enter saves, Escape cancels, Tab follows the form", '<Button x:Name="SaveButton" Content="Save" IsDefault="True" Command="{Binding SaveCommand}" />\n<Button x:Name="CancelButton" Content="Cancel" IsCancel="True" Command="{Binding CancelCommand}" />'),
      cs("the cursor starts where the user will type", 'public TopicEditorView()\n{\n    InitializeComponent();\n    Loaded += (_, _) => NameBox.Focus();\n}'),
      { ul: [
        "A `Label` with `Target` gives the box its spoken name *and* an access key (`_N` → Alt+N).",
        "A button whose content is only an icon or a symbol needs `AutomationProperties.Name`; text content is its name already.",
        "`IsDefault` makes Enter press that button; `IsCancel` makes Escape press it — keyboard users get Save and Cancel for free."
      ] },
      page("Rules"),
      { table: { head: ["Check", "How"], rows: [
        ["every control has a name", "a `Label` targeting it, text content, or `AutomationProperties.Name`"],
        ["Tab visits controls in reading order", "lay out in order; `TabIndex` only to fix an exception"],
        ["every action works without a mouse", "commands, `IsDefault`/`IsCancel`, `KeyBinding`s"],
        ["focus is visible and starts somewhere useful", "the theme's focus ring; `Focus()` on open"],
        ["colour is never the only signal", "an error has words as well as red; read is struck through as well as faded"],
        ["text can grow", "no fixed heights that clip larger fonts"]
      ] } },
      { ul: [
        "A disabled control is skipped by Tab — so fill a form before testing that Tab reaches Save.",
        "`AutomationProperties.HelpText` adds a hint (\"1 is shaky, 5 is solid\"); keep names short and hints for detail.",
        "Test with the real thing: VoiceOver (⌘F5 on macOS) or Narrator (Ctrl+Win+Enter) for five minutes finds more than any checklist.",
        "A headless test can walk the visual tree and fail when any input has no name — the capstone's milestone 3 does."
      ] },
      page("Variations"),
      { h: "A hint for a screen reader" },
      xaml("HelpText", '<NumericUpDown x:Name="ConfidenceBox" Minimum="1" Maximum="5"\n               AutomationProperties.HelpText="1 is shaky, 5 is solid" />'),
      { h: "Testing Tab order headless" },
      cs("press Tab and record who has focus", 'w.FindControl<TextBox>("NameBox")!.Focus();\nvar order = new List<string?>();\nfor (int i = 0; i < 4; i++)\n{\n    w.KeyPressQwerty(PhysicalKey.Tab, RawInputModifiers.None);\n    Dispatcher.UIThread.RunJobs();\n    var c = TopLevel.GetTopLevel(w)!.FocusManager!.GetFocusedElement() as Control;\n    order.Add(c?.FindAncestorOfType<NumericUpDown>()?.Name ?? c?.Name);\n}'),
      { h: "Checking every control has a name" },
      cs("walk the page", 'foreach (var c in page.GetVisualDescendants().OfType<Control>().Where(c => c is TextBox or Button or ListBox))\n    Assert.True(!string.IsNullOrWhiteSpace(AutomationProperties.GetName(c)) || labelled.Contains(c) || c is Button { Content: string },\n        $"{c.Name} has no accessible name");'),
      page("Pitfalls"),
      { h: "A focused NumericUpDown is a TextBox" },
      "Focus inside a `NumericUpDown` is on the text box in its template (`PART_TextBox`). When checking focus, look for the `NumericUpDown` ancestor.",
      { h: "Icon-only buttons" },
      "`<Button Content=\"‹\" />` is announced as \"less-than button\". Give it `AutomationProperties.Name=\"Back\"`.",
      { h: "Tab order fixed with TabIndex everywhere" },
      "Numbering every control's `TabIndex` breaks as soon as the form changes. Lay the form out in reading order and the natural order is right.",
      page("Connections"),
      { ul: [ "**Back:** T2.2's labels; T2.17's errors — words, not just red; KurenaiOS's own rules (invariants 66–69).", "**Next:** T2.19 keeps it usable at every width; T4's web track has the same rules for HTML.", "**The capstone:** milestone 3 — names, Tab order, Enter and Escape, focus on open." ] },
      page("Good practice"),
      { ul: [ "Label every input; name every icon.", "Use the app for five minutes with only the keyboard.", "Never signal with colour alone." ] },
      page("Practise"),
      { ul: [ "**The Planner on the desktop, milestone 3:** every control named on every page; the editor's Tab order, Enter, Escape and starting focus." ] },
      page("Quick reference"),
      xaml("the essentials", '<Label Content="_Name" Target="{Binding #NameBox}" />\n<Button Content="‹" AutomationProperties.Name="Back" />\n<Button Content="Save" IsDefault="True" /> <Button Content="Cancel" IsCancel="True" />'),
      { ul: [ "Name · keyboard · order · not colour alone.", "`Label Target`, `AutomationProperties.Name`, `IsDefault`, `IsCancel`, `Focus()`.", "Disabled controls are skipped by Tab." ] },
      { table: { head: ["Symptom", "Cause", "Page"], rows: [["focus reported as PART_TextBox", "a NumericUpDown's inner box", "Pitfalls"], ["\"less-than button\"", "an icon-only button with no name", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What gives a TextBox a name a screen reader can say?", "A Label whose Target is the box (or AutomationProperties.Name)."],
      ["Which button property makes Enter press it?", "IsDefault=\"True\"."],
      ["Which button property makes Escape press it?", "IsCancel=\"True\"."],
      ["Does Tab stop on a disabled button?", "No — disabled controls are skipped."],
      ["What does an icon-only button need?", "AutomationProperties.Name."],
      ["Why not signal an error by colour alone?", "Some users cannot see the colour; say it in words as well."]
    ],
    quiz: [
      { q: "A Back button shows only \"‹\". A screen reader says…", opts: ["\"Back\"", "something like \"less-than button\" unless it is named", "nothing", "the command name"], ans: 1, why: "Give it AutomationProperties.Name=\"Back\"." },
      { q: "In an empty editor, Tab from Confidence goes straight to Cancel. Why?", opts: ["Tab order is broken", "Save is disabled, so Tab skips it", "IsDefault blocks focus", "Cancel has TabIndex 0"], ans: 1, why: "Disabled controls are not tab stops." },
      { q: "The best way to get a sensible Tab order is…", opts: ["TabIndex on every control", "lay the form out in reading order", "KeyboardNavigation.TabNavigation=Cycle", "focus in code-behind"], ans: 1, why: "The natural order follows the visual tree." }
    ]
  });

  /* ================================================================
     T2.19 Responsive layouts
     ================================================================ */
  lesson("T2.19", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Desktop windows are any size: a half-screen beside a browser, a full 4K monitor, a laptop at 1280. A layout designed for one width either wastes space or crushes everything at another.",
        "**Responsive** means one UI that rearranges itself: side by side when there is room, stacked when there is not — without a second copy of the view.",
        "Most of it is T2.2's panels used well (`*` columns, `WrapPanel`, `MinWidth`); the rest is a *breakpoint*: below a width, change the arrangement."
      ] },
      page("Core idea"),
      xaml("the topics page: list and detail in one grid", '<Grid x:Name="Layout" ColumnDefinitions="*,*" RowDefinitions="*" ColumnSpacing="16" RowSpacing="12">\n    <ListBox x:Name="TopicList" ItemsSource="{Binding Topics}" SelectedItem="{Binding Selected}" />\n    <StackPanel x:Name="TopicDetail" Grid.Column="1" Spacing="12">\n        <TextBlock Text="{Binding Detail}" TextWrapping="Wrap" />\n    </StackPanel>\n</Grid>'),
      cs("one breakpoint: under 800 px the detail moves under the list", 'public TopicsView()\n{\n    InitializeComponent();\n    SizeChanged += (_, e) => Arrange(e.NewSize.Width < 800);\n}\n\nvoid Arrange(bool narrow)\n{\n    Layout.ColumnDefinitions = new ColumnDefinitions(narrow ? "*" : "*,*");\n    Layout.RowDefinitions = new RowDefinitions(narrow ? "*,Auto" : "*");\n    Grid.SetColumn(TopicDetail, narrow ? 0 : 1);\n    Grid.SetRow(TopicDetail, narrow ? 1 : 0);\n}'),
      { ul: [
        "`SizeChanged` fires whenever the view's size changes — on opening, and on every resize.",
        "The breakpoint is the view's own width, not the screen's: the same view works in a window or in a pane.",
        "Rearranging is a view concern, so it lives in the view's code-behind; the view model never hears about pixels."
      ] },
      page("Rules"),
      { table: { head: ["Need", "Reach for"], rows: [
        ["fill the width", "`*` columns, `HorizontalAlignment=\"Stretch\"`"],
        ["a row of things that may not fit", "`WrapPanel`"],
        ["keep text readable when very wide", "`MaxWidth` on the text block, centred or beside a second column"],
        ["never too narrow to use", "`MinWidth` on the window"],
        ["change arrangement below a width", "a breakpoint (`SizeChanged` → new rows and columns, or a class and styles)"],
        ["very long content", "`ScrollViewer` around it"]
      ] } },
      { ul: [
        "Pick few breakpoints (one or two) at the widths where the layout actually breaks — try it, don't guess.",
        "Keep the same controls in both arrangements: the user's selection and focus survive a resize.",
        "Test both sides of each breakpoint, and the resize between them (headless tests can set `Width`).",
        "No empty half-window: if the detail has nothing to show, say so, or let the list take the room."
      ] },
      page("Variations"),
      { h: "A class instead of code" },
      cs("toggle a class; let styles do the rest", 'SizeChanged += (_, e) => Classes.Set("narrow", e.NewSize.Width < 800);'),
      xaml("a style that hides a column's extras when narrow", '<Style Selector="local|TopicsView.narrow TextBlock.extra">\n    <Setter Property="IsVisible" Value="False" />\n</Style>'),
      { h: "Readable at any width" },
      xaml("cap the reading width", '<TextBlock Text="{Binding Notes}" TextWrapping="Wrap" MaxWidth="680" HorizontalAlignment="Left" />'),
      { h: "Testing a breakpoint headless" },
      cs("resize and measure", 'w.Width = 600; Dispatcher.UIThread.RunJobs();\nvar list = w.FindControl<ListBox>("TopicList")!; var detail = /* … */;\nAssert.True(detail.TranslatePoint(new(0, 0), w)!.Value.Y >= list.Bounds.Bottom);'),
      page("Pitfalls"),
      { h: "Fixed sizes" },
      "`Width=\"500\"` on a box runs off a 420-pixel window and wastes space on a 1,600-pixel one. Let `*` and `MinWidth` decide.",
      { h: "A breakpoint read once" },
      "Arranging in the constructor (`if (Bounds.Width < 800)`) reads a width of 0 — nothing is measured yet — and never again. React to `SizeChanged`.",
      { h: "Two copies of the view" },
      "A `NarrowTopicsView` and a `WideTopicsView` swapped by width double every future change and lose the selection on resize. Rearrange one view.",
      page("Connections"),
      { ul: [ "**Back:** T2.2's panels; T2.5's classes and styles; KurenaiOS's own five breakpoints (invariant 47) and its no-dead-space rule.", "**Next:** T2.20 ships it; T4's web track does the same with CSS media and container queries.", "**The capstone:** milestone 4 — the topics page side by side at 800 px and over, stacked below." ] },
      page("Good practice"),
      { ul: [ "Stretch first; breakpoints only where it breaks.", "One view that rearranges — never two.", "Test both sides of every breakpoint, and the resize." ] },
      page("Practise"),
      { ul: [ "**The Planner on the desktop, milestone 4:** the topics page's two arrangements, changing as the window is resized; `Detail` describes the chosen topic." ] },
      page("Quick reference"),
      cs("the breakpoint", 'SizeChanged += (_, e) => Arrange(e.NewSize.Width < 800);'),
      { ul: [ "`*`, `WrapPanel`, `MinWidth`, `MaxWidth`, `ScrollViewer`.", "Breakpoints from the view's own width, on `SizeChanged`.", "Same controls, new arrangement." ] },
      { table: { head: ["Symptom", "Cause", "Page"], rows: [["runs off a narrow window", "a fixed Width", "Pitfalls"], ["layout never changes", "the width read once, before measuring", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What does responsive mean for a desktop window?", "One UI that rearranges itself for the window's width."],
      ["Which event tells a view its size changed?", "SizeChanged."],
      ["Why use the view's width rather than the screen's?", "The same view may sit in a window or a pane of any size."],
      ["Why not read Bounds.Width in the constructor?", "Nothing is measured yet — it is 0 — and it never updates."],
      ["Why rearrange one view rather than swap two?", "One place to change, and selection and focus survive a resize."],
      ["What keeps very wide text readable?", "A MaxWidth on the text block."]
    ],
    quiz: [
      { q: "A breakpoint chosen in the constructor from Bounds.Width…", opts: ["works", "always sees 0 and never updates", "needs a ScrollViewer", "throws"], ans: 1, why: "Measure happens later; react to SizeChanged." },
      { q: "Where does the code that rearranges the grid belong?", opts: ["the view model", "the view's code-behind (or styles)", "the model", "App.axaml.cs"], ans: 1, why: "Pixels are the view's business." },
      { q: "How many breakpoints should a view have?", opts: ["one per common screen size", "as few as needed, where the layout actually breaks", "five, like the web", "none"], ans: 1, why: "Try it, find where it breaks, fix there." }
    ]
  });

  /* ================================================================
     T2.20 Packaging and publishing
     ================================================================ */
  lesson("T2.20", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "`dotnet run` works on your machine, with the SDK installed. Nobody else has it — and nobody else should need it to use your app.",
        "**Publishing** builds the app for one operating system and processor (a **runtime identifier**, RID), optionally **self-contained** (the .NET runtime inside) and as a **single file**.",
        "A **publish profile** records those choices in the project, and the project file carries the app's **version** and **product name** — so every build is reproducible and says what it is."
      ] },
      page("Core idea"),
      xml("Planner.Desktop.csproj: what the app is", '<PropertyGroup>\n  <OutputType>WinExe</OutputType>\n  <Product>Planner</Product>\n  <Version>1.0.0</Version>\n</PropertyGroup>'),
      xml("Properties/PublishProfiles/release.pubxml: how it ships", '<Project>\n  <PropertyGroup>\n    <Configuration>Release</Configuration>\n    <RuntimeIdentifier>osx-arm64</RuntimeIdentifier>\n    <SelfContained>true</SelfContained>\n    <PublishSingleFile>true</PublishSingleFile>\n    <IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>\n    <PublishDir>../../publish/osx-arm64/</PublishDir>\n  </PropertyGroup>\n</Project>'),
      sh("publish with the profile", "dotnet publish src/Planner.Desktop -p:PublishProfile=release"),
      { ul: [
        "`osx-arm64` is an Apple-silicon Mac; `osx-x64` an Intel Mac; `win-x64` 64-bit Windows; `linux-x64` most Linux PCs.",
        "Self-contained: about 90 MB, but runs on a machine with no .NET at all. Framework-dependent: small, but needs the runtime installed.",
        "Avalonia draws with native libraries (Skia, HarfBuzz). Without `IncludeNativeLibrariesForSelfExtract` they sit beside the single file as `.dylib`/`.dll` files — ship the whole folder."
      ] },
      page("Rules"),
      { table: { head: ["Property", "Effect"], rows: [
        ["`<Version>1.2.0</Version>`", "the app's version (major.minor.patch) in the binary and its metadata"],
        ["`<Product>`, `<Company>`, `<Copyright>`", "what Windows' Properties and macOS's Get Info show"],
        ["`<RuntimeIdentifier>`", "which OS and processor it is built for"],
        ["`<SelfContained>true</SelfContained>`", "the runtime travels with the app"],
        ["`<PublishSingleFile>true</PublishSingleFile>`", "one executable instead of a folder of DLLs"],
        ["`<PublishTrimmed>` / `<PublishAot>`", "smaller, faster start — test carefully: reflection may break"]
      ] } },
      { ul: [
        "Bump the version for every release you hand out: patch for fixes, minor for features, major for breaking changes.",
        "Publish one profile per platform; publish on (or for) each platform you support, and try the result on a clean machine.",
        "A macOS app users double-click is an `.app` bundle (a folder with an `Info.plist` and an icon); outside the App Store it must be signed and notarised to open without warnings. Windows wants an `.ico` (`<ApplicationIcon>`) and, for trust, a signed installer.",
        "Never publish with secrets in settings files; the publish folder is everything a user gets."
      ] },
      page("Variations"),
      { h: "Windows from the command line" },
      sh("one-off, without a profile", "dotnet publish src/Planner.Desktop -c Release -r win-x64 --self-contained -p:PublishSingleFile=true"),
      { h: "An icon for Windows" },
      xml("in the project file", '<PropertyGroup>\n  <ApplicationIcon>Assets/planner.ico</ApplicationIcon>\n</PropertyGroup>'),
      { h: "The version in the app" },
      cs("show it in an About line", 'string version = typeof(App).Assembly.GetName().Version?.ToString(3) ?? "?";\nTitle = $"Planner {version}";'),
      page("Pitfalls"),
      { h: "Native libraries left behind" },
      sh("a single-file publish without IncludeNativeLibrariesForSelfExtract", "publish/osx-arm64/\n  Planner.Desktop          (91 MB)\n  libAvaloniaNative.dylib\n  libHarfBuzzSharp.dylib\n  libSkiaSharp.dylib"),
      { ul: [ "Copy only `Planner.Desktop` to another Mac and it fails to start. Ship the folder, or bundle the libraries into the file." ] },
      { h: "A framework-dependent build on a clean machine" },
      "Without `SelfContained`, the app asks the user to install the .NET runtime first — fine for developers, a dead end for everyone else.",
      { h: "Trimming that breaks reflection" },
      "`PublishTrimmed` removes code it thinks is unused; something found only by reflection (a view located by name) can vanish. Compiled bindings and the toolkit's generators are trim-safe; test the trimmed build anyway.",
      page("Connections"),
      { ul: [ "**Back:** Bridge B's projects and NuGet; unit 10's build without warnings.", "**Next:** D6 publishes a NuGet package with CI; T7 ships in containers and pipelines.", "**The capstone:** milestone 5 — a version, the product name, a publish profile, your tests, no warnings, committed." ] },
      page("Good practice"),
      { ul: [ "Version and product name in the project, bumped every release.", "A publish profile per platform, committed.", "Try the published app on a machine that never had your SDK." ] },
      page("Practise"),
      { ul: [ "**The Planner on the desktop, milestone 5:** `<Version>` and `<Product>`, `release.pubxml`, eight of your own tests, no warnings, committed — then publish it and open the result." ] },
      page("Quick reference"),
      sh("ship it", "dotnet publish src/Planner.Desktop -p:PublishProfile=release"),
      { ul: [ "RID · self-contained · single file · native libraries.", "`<Version>`, `<Product>` in the csproj; choices in a `.pubxml`.", "Sign and notarise (macOS) or sign (Windows) for real users." ] },
      { table: { head: ["Symptom", "Cause", "Page"], rows: [[".dylib files beside the single file", "native libraries not bundled", "Pitfalls"], ["\"install .NET\" on a user's machine", "not self-contained", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What is a runtime identifier (RID)?", "The OS and processor a build targets, such as osx-arm64 or win-x64."],
      ["What does self-contained mean?", "The .NET runtime is published with the app, so the machine needs no .NET."],
      ["Where do a publish's choices live?", "A publish profile, Properties/PublishProfiles/<name>.pubxml."],
      ["Which property bundles Avalonia's native libraries into a single file?", "IncludeNativeLibrariesForSelfExtract."],
      ["How do you publish with a profile called release?", "dotnet publish <project> -p:PublishProfile=release"],
      ["When should the version change?", "Every release: patch for fixes, minor for features, major for breaking changes."]
    ],
    quiz: [
      { q: "An Apple-silicon Mac's RID is…", opts: ["mac-arm", "osx-arm64", "darwin-x64", "macos"], ans: 1, why: "osx-arm64 (osx-x64 for Intel Macs)." },
      { q: "A friend without .NET can run your app only if it was published…", opts: ["in Debug", "self-contained", "trimmed", "framework-dependent"], ans: 1, why: "Self-contained carries the runtime." },
      { q: "After a single-file publish, three .dylib files sit beside the app. You should…", opts: ["delete them", "ship them with it, or bundle them with IncludeNativeLibrariesForSelfExtract", "rename them", "ignore them — they are logs"], ans: 1, why: "Avalonia needs its native libraries to draw." }
    ]
  });

  /* ================================================================
     command cards
     ================================================================ */
  var short = function (s) { s = String(s).replace(/^(Type the |Name the |Which |Write the )/, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };
  K.add({ cards: {
    "t2e-nav": { title: "Navigation and validation", lesson: "T2.16", concepts: ["navigation", "validation"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Write the binding that shows the shell's current page in a ContentControl (the Content attribute).", "Content=\"{Binding Current}\"", ["^Content=\"\\{Binding Current\\}\"$"]],
          ["Which toolkit base class adds validation to a view model?", "ObservableValidator", ["^ObservableValidator$"]],
          ["Write the attribute that requires a value, with the message Give the topic a name.", "[Required(ErrorMessage = \"Give the topic a name.\")]", ["^\\[Required\\(ErrorMessage ?= ?\"Give the topic a name\\.\"\\)\\]$"]],
          ["Write the attribute that allows only the numbers 1 to 5 (no message).", "[Range(1, 5)]", ["^\\[Range\\(1, ?5\\)\\]$"]],
          ["Which view-model property says whether any field is invalid?", "HasErrors", ["^HasErrors$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(/, with the message .*$/, ", with a message"), params: [], answer: q[1], accept: q[2], hint: "Content=\"{Binding Current}\" · ObservableValidator · [Required(…)] · [Range(1, 5)] · HasErrors." };
      } },
    "t2e-a11y": { title: "Accessibility and layout", lesson: "T2.18", concepts: ["a11y-desktop", "responsive"], kind: "command",
      vary: function (r) {
        var n = pick(r, ["Back", "Close", "Menu"]);
        var q = pick(r, [
          ["Write the attribute that names an icon-only button " + n + " for a screen reader.", "AutomationProperties.Name=\"" + n + "\"", ["^AutomationProperties\\.Name=\"" + n + "\"$"]],
          ["Which Button property makes Enter press it?", "IsDefault", ["^IsDefault(=\"True\")?$"]],
          ["Which Button property makes Escape press it?", "IsCancel", ["^IsCancel(=\"True\")?$"]],
          ["Which event tells a view its size changed, for a breakpoint?", "SizeChanged", ["^SizeChanged$"]],
          ["Write the Label attribute that links it to the box named NameBox.", "Target=\"{Binding #NameBox}\"", ["^Target=\"\\{Binding #NameBox\\}\"$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(" " + n + " for", " for"), params: [n], answer: q[1], accept: q[2], hint: "AutomationProperties.Name · IsDefault · IsCancel · SizeChanged · Target=\"{Binding #…}\"." };
      } },
    "t2e-publish": { title: "Publishing", lesson: "T2.20", concepts: ["publish"], kind: "command",
      vary: function (r) {
        var rid = pick(r, ["osx-arm64", "win-x64", "linux-x64"]);
        var q = pick(r, [
          ["Type the command that publishes src/Planner.Desktop with the publish profile called release.", "dotnet publish src/Planner.Desktop -p:PublishProfile=release", ["^dotnet publish (\\./)?src/Planner\\.Desktop(/Planner\\.Desktop\\.csproj)? (-p|/p):PublishProfile=release$"]],
          ["Write the project property that targets " + rid + ".", "<RuntimeIdentifier>" + rid + "</RuntimeIdentifier>", ["^<RuntimeIdentifier>" + rid + "</RuntimeIdentifier>$"]],
          ["Write the project property that publishes the .NET runtime with the app.", "<SelfContained>true</SelfContained>", ["^<SelfContained>true</SelfContained>$"]],
          ["Write the project property that sets the version to 1.0.0.", "<Version>1.0.0</Version>", ["^<Version>1\\.0\\.0</Version>$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(" " + rid, " a platform").replace(" to 1.0.0", ""), params: [rid], answer: q[1], accept: q[2], hint: "dotnet publish -p:PublishProfile=… · <RuntimeIdentifier> · <SelfContained> · <Version>." };
      } }
  } });

  /* ================================================================
     the capstone's project (its build); the capstone pays, not it
     ================================================================ */
  K.project("rp-ct2-planner", {
    unit: "T2E", capstone: "CT2", title: "The Planner on the desktop", folder: "planner-desktop", solution: "PlannerDesktop.sln",
    scaffoldVersion: 1, minValidator: "1.1.1", sdk: ".NET 10 SDK",
    summary: "Track T2's capstone: the revision planner as a desktop app — navigation, live validation, accessibility, a responsive layout and a publish profile — built and proven in Rider.",
    brief: [
      "The Track T2 capstone's project. Its milestones are the capstone's build: an accepted report passes them, and the capstone pays when it is submitted.",
      { ul: [
        "`src/Planner.Core` (topics, the rule, the JSON store) is written for you; `src/Planner.Desktop`'s view models and views are yours.",
        "The names matter: `Page`, `BackButton`, `TopicsTab`, `NextTab`, `TopicList`, `TopicDetail`, `NameBox`, `SubjectBox`, `ConfidenceBox`, `SaveButton`, `CancelButton`.",
        "`Directory.Build.props`, `tests/Planner.Acceptance/` and `.kurenai/validate.cs` are **protected**."
      ] }
    ],
    milestones: [
      { id: "m1", title: "Navigation", lessons: ["T2.16"], about: "A shell with Current and a back stack; the topics, editor and next pages, each drawn through its template.", checks: [{ type: "tests", class: "Milestone1" }] },
      { id: "m2", title: "Validation", lessons: ["T2.17"], about: "The editor's rules as data annotations, errors beside the fields as you type, Save only when valid.",
        checks: [{ type: "tests", class: "Milestone2" }, { type: "source", path: "src/Planner.Desktop/ViewModels/TopicEditorViewModel.cs", contains: ["\\[Required", "\\[Range"] }] },
      { id: "m3", title: "Accessibility", lessons: ["T2.18"], about: "Every control named on every page; the editor's Tab order, Enter, Escape and starting focus.", checks: [{ type: "tests", class: "Milestone3" }] },
      { id: "m4", title: "Responsive layout", lessons: ["T2.19"], about: "The topics page side by side at 800 px and over, stacked below, changing as the window is resized.", checks: [{ type: "tests", class: "Milestone4" }] },
      { id: "m5", title: "Packaged and shipped", lessons: ["T2.20"], about: "A version and product name, a self-contained publish profile, eight or more of your tests (one an [AvaloniaFact]), no warnings, committed.",
        checks: [
          { type: "source", path: "src/Planner.Desktop/Planner.Desktop.csproj", contains: ["<Version>1\\.\\d+\\.\\d+</Version>", "<Product>Planner</Product>"] },
          { type: "source", path: "src/Planner.Desktop/Properties/PublishProfiles/release.pubxml", contains: ["<RuntimeIdentifier>(osx|win|linux)-(arm64|x64)</RuntimeIdentifier>", "<SelfContained>true</SelfContained>"] },
          { type: "owntests", prefix: "Planner.Tests.", min: 8 }, { type: "source", path: "tests/Planner.Tests", contains: ["\\[AvaloniaFact\\]"] }, { type: "warnings", max: 0 }, { type: "git" }
        ] }
    ],
    protected: ["Directory.Build.props", "tests/Planner.Acceptance/Planner.Acceptance.csproj", "tests/Planner.Acceptance/Headless.cs", "tests/Planner.Acceptance/Fakes.cs", "tests/Planner.Acceptance/Milestone1.cs", "tests/Planner.Acceptance/Milestone2.cs", "tests/Planner.Acceptance/Milestone3.cs", "tests/Planner.Acceptance/Milestone4.cs", ".kurenai/validate.cs"],
    /* the capstone pays, once (invariant 106) */
    reward: null
  });

  K.capstone("CT2", {
    track: "T2",
    minutes: 420,
    project: "rp-ct2-planner",
    summary: "The revision planner as a real desktop app — pages and a way back, a form that validates as you type, every control usable by keyboard and screen reader, a layout that adapts, and a published build — made in Rider and proven by validation reports.",
    quiz: [
      { q: "The window shows \"Planner.Desktop.NextViewModel\" as text instead of the Next page. What is missing?", opts: ["a ToString override", "a DataTemplate mapping NextViewModel to NextView", "a second window", "a navigation command"], ans: 1, lesson: "T2.16", why: "A ContentControl draws a view model through the template for its type." },
      { q: "Save stays enabled after the user clears the name. The rules are right. What is missing?", opts: ["[Required]", "SaveCommand.NotifyCanExecuteChanged() when the errors change", "a message box", "a one-way binding"], ans: 1, lesson: "T2.17", why: "A command's CanExecute is asked again only when it is told the answer may have changed." },
      { q: "A Back button shows only \"‹\". What does it need for a screen reader?", opts: ["a tooltip", "AutomationProperties.Name=\"Back\"", "IsDefault", "a larger font"], ans: 1, lesson: "T2.18", why: "Text content is a name; a symbol is not." },
      { q: "The topics page decides its layout in the constructor from Bounds.Width. What happens?", opts: ["it works", "it sees 0 and never changes", "it throws", "it uses the screen's width"], ans: 1, lesson: "T2.19", why: "Nothing is measured yet; react to SizeChanged instead." },
      { q: "A friend without .NET installed must run the app. How should it be published?", opts: ["Debug", "framework-dependent", "self-contained for their platform's RID", "as source"], ans: 2, lesson: "T2.20", why: "Self-contained carries the runtime; the RID picks their OS and processor." }
    ],
    brief: [
      "Build **the Planner on the desktop**: capstone 4's revision planner — topics with a confidence from 1 to 5, and *what should I study next?* — as an Avalonia app with three pages. You build it in **Rider** in MVVM, with your own headless tests, and bring each milestone back as a validation report.",
      { h: "The solution" },
      { table: { head: ["Project", "What it holds"], rows: [
        ["`src/Planner.Core`", "`Topic`, `ITopicStore`, the rule (`Priority.Score`, `Priority.Next`) and `JsonTopicStore` — **written for you**"],
        ["`src/Planner.Desktop`", "`ViewModels/` (`ShellViewModel`, `TopicsViewModel`, `TopicEditorViewModel`, `NextViewModel` — stubs to build), `Views/` (the window and three page views), `App.axaml` (the templates)"],
        ["`tests/Planner.Tests`", "**your** tests; `[AvaloniaFact]` is ready, and a fake clock"],
        ["`tests/Planner.Acceptance`", "Kurenai's tests for milestones 1–4 (**protected**)"]
      ] } },
      { h: "The pages" },
      { ul: [
        "**Topics:** the list (`TopicList`) and the chosen topic's `Detail` — `Big O · cs · confidence 3 · last studied 2026-10-20` (`never` if not studied) — with *Add topic* and *Edit* (only with a topic chosen).",
        "**Editor:** `NameBox`, `SubjectBox`, `ConfidenceBox` (a `NumericUpDown`), `SaveButton`, `CancelButton`. Name required (`Give the topic a name.`), at most 60 characters (`At most 60 characters.`); subject required (`Choose a subject.`); confidence 1–5 (`Confidence is 1 to 5.`). Save only when valid; a new topic gets the next id, the subject trimmed and in lower case; an edit keeps its id and last-studied day.",
        "**Next:** `1. Vectors (maths)`, one line each — the five lowest scores today, from the injected clock."
      ] },
      { h: "Navigation" },
      { ul: [ "`ShellViewModel` holds `Current` and a back stack (`GoTo`, `Back`, `CanGoBack`, `BackCommand`, `ShowTopicsCommand`, `ShowNextCommand`), opens on the topics page, and activates each page it shows (`ActivateAsync`) so it reloads when you come back. The window: `BackButton`, `TopicsTab`, `NextTab`, and a `ContentControl` named `Page`." ] },
      { h: "Accessibility and layout" },
      { ul: [
        "Every control on every page has an accessible name. In the editor, Tab goes Name → Subject → Confidence → Save → Cancel; the cursor starts in Name; Enter saves; Escape cancels.",
        "The topics page shows list and detail side by side at 800 px and wider, the detail under the list (both full width) below — changing as the window is resized."
      ] },
      { h: "Shipping" },
      { ul: [ "`<Version>1.x.y</Version>` and `<Product>Planner</Product>` in `Planner.Desktop.csproj`; a self-contained publish profile `Properties/PublishProfiles/release.pubxml` for your platform; eight or more of your own tests (one an `[AvaloniaFact]`); no compiler warnings; committed. Then `dotnet publish src/Planner.Desktop -p:PublishProfile=release` and open the result." ] },
      call("tip", "Track T2", ["Each milestone is one lesson of T2E, and each leans on the parts before it: T2C's MVVM (T2.9) and headless tests (T2.11), T2D's async loading (T2.13). Build the shell first, then one page at a time, running Kurenai's tests as you go."]),
      { h: "Useful pieces" },
      { code: { lang: "csharp", src: '[ObservableProperty]\n[NotifyPropertyChangedFor(nameof(CanGoBack))]\n[NotifyCanExecuteChangedFor(nameof(BackCommand))]\npublic partial ViewModelBase Current { get; private set; }\n\n[Required(ErrorMessage = "Give the topic a name.")]\npublic string Name { get => name; set { SetProperty(ref name, value, true); SaveCommand.NotifyCanExecuteChanged(); } }\n\nSizeChanged += (_, e) => Arrange(e.NewSize.Width < 800);' } }
    ],
    rubric: [
      { id: "correct", title: "Correctness · validation milestones", auto: true, max: 12 },
      { id: "mvvm", title: "MVVM and design", max: 4, guide: ["Logic in code-behind", "View models, but they reach into views", "Pages are view models; views only bind", "Services by interface, navigation through one navigator", "A new page would be one view model, one view and one template"] },
      { id: "a11y", title: "Accessibility", max: 4, guide: ["Mouse only", "Some labels", "Every control named; Tab order right", "Keyboard-only use is comfortable; errors in words", "Tried with a real screen reader, and it shows"] },
      { id: "look", title: "Look and feel (marked by hand)", max: 4, guide: ["Unstyled and cramped", "Tidy at one size", "Tidy at every size, light and dark", "Consistent spacing, type and states", "A desktop app you would use every day"] }
    ],
    writeupMin: 100,
    writeupPrompts: ["How does a page move to another without knowing its view — and what would adding a fourth page take?", "Which validation rule or accessibility check was hardest to get right, and how did a test help?", "What did you change in the layout so it works at 600 and 1,000 pixels, and what did publishing teach you about what a user actually receives?"],
    reward: { xp: 250, gold: 60, hp: 10 }
  });
})();
