/* Kurenai OS — data/content/code-t2a.js
   Code · T2 · Part A · Your first window (docs/code-plan.md §3.3), done in
   Rider with Avalonia 12.

   GUI fundamentals: the event loop, windows and controls (T2.1); layout
   with panels and grids (T2.2); events and code-behind (T2.3). The lessons
   hold the Rider form of the notes contract (smoke75); their retrieval cards
   are COMMAND cards. Their work is T2's taster, "Your first window"
   (rp-t2a-window; files generated into code-projects-files.js from
   tools/code-projects/first-window/), proven by the validator: acceptance
   tests that open the window on Avalonia's headless platform, type into it
   and read what it shows.                                                   */
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
    "gui-loop": { name: "The event loop", lesson: "T2.1", about: "an app that waits for events; windows and controls" },
    "gui-layout": { name: "Layout", lesson: "T2.2", about: "StackPanel, Grid, DockPanel; sizing and alignment" },
    "gui-events": { name: "Events and code-behind", lesson: "T2.3", about: "handlers for clicks, typing and choices" }
  } });

  /* ================================================================
     T2.1 GUI fundamentals: the event loop, windows and controls
     ================================================================ */
  lesson("T2.1", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Every program so far ran top to bottom: read a line, print a line, finish. A desktop app cannot work like that — the user might click anything, in any order, or nothing for an hour.",
        "So a GUI program turns inside out. It builds a window, then **waits** in an *event loop*: a key, a click, a resize, a timer — each becomes an event, and your code runs only in answer to one.",
        "**Avalonia** is a cross-platform UI framework for .NET: one project draws the same window on macOS, Windows and Linux. You describe the window in **XAML** and write its behaviour in C#."
      ] },
      page("Core idea"),
      sh("install the templates once, then make an app", "dotnet new install Avalonia.Templates\ndotnet new avalonia.app -n Tips\ncd Tips && dotnet run"),
      cs("Program.cs: start Avalonia, then the loop takes over", 'class Program\n{\n    [STAThread]\n    public static void Main(string[] args) =>\n        BuildAvaloniaApp().StartWithClassicDesktopLifetime(args);   // returns when the last window closes\n\n    public static AppBuilder BuildAvaloniaApp() =>\n        AppBuilder.Configure<App>().UsePlatformDetect().WithInterFont().LogToTrace();\n}'),
      xaml("MainWindow.axaml: the window and its controls", '<Window xmlns="https://github.com/avaloniaui"\n        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"\n        x:Class="Tips.MainWindow"\n        Title="Tip calculator" Width="420" Height="360">\n    <StackPanel Margin="16" Spacing="8">\n        <TextBlock Text="How much was the bill?" />\n        <TextBox x:Name="BillBox" PlaceholderText="42.50" />\n        <Button Content="Work it out" />\n    </StackPanel>\n</Window>'),
      { ul: [
        "`StartWithClassicDesktopLifetime` opens `App`'s main window and runs the event loop until the window closes. `Main` never \"gets to the end\" while the app is open.",
        "Each XAML element is an object: `<TextBox>` is `new TextBox()`, and its attributes set properties. `x:Name=\"BillBox\"` gives the code-behind a field called `BillBox`.",
        "A window holds ONE child; a panel (here `StackPanel`) holds many and arranges them. T2.2 is all about panels."
      ] },
      page("Rules"),
      { table: { head: ["Control", "Shows or takes", "Key property"], rows: [
        ["`TextBlock`", "text to read", "`Text`"],
        ["`TextBox`", "text to type", "`Text`, `PlaceholderText`"],
        ["`Button`", "a click", "`Content`, the `Click` event"],
        ["`CheckBox` / `RadioButton`", "on or off; one of a group", "`IsChecked`, `GroupName`"],
        ["`Label`", "a caption for another control", "`Content`, `Target`"],
        ["`ComboBox` / `Slider`", "a choice from a list; a number in a range", "`SelectedItem`; `Value`"]
      ] } },
      { ul: [
        "All drawing and all changes to controls happen on ONE thread, the **UI thread**. A handler that takes ten seconds freezes the whole window for ten seconds (T2D's async lessons fix that).",
        "Radio buttons with the same `GroupName` (or in the same parent) are one group: checking one unchecks the others.",
        "The app's look comes from a **theme** — `<FluentTheme />` in `App.axaml` — so controls look native without any styling of your own.",
        "Rider's Avalonia previewer (the **AvaloniaRider** plugin) draws the XAML as you type; the real test is still running the app."
      ] },
      page("Variations"),
      { h: "A control built in C# instead" },
      cs("the same objects XAML makes", 'var panel = new StackPanel { Margin = new Thickness(16), Spacing = 8 };\npanel.Children.Add(new TextBlock { Text = "How much was the bill?" });\npanel.Children.Add(new TextBox { Name = "BillBox", PlaceholderText = "42.50" });\nContent = panel;   // inside the window\'s constructor'),
      { h: "Three choices, one group" },
      xaml("radio buttons", '<StackPanel Orientation="Horizontal" Spacing="12">\n    <RadioButton x:Name="Tip10" GroupName="Tip" Content="10%" />\n    <RadioButton x:Name="Tip15" GroupName="Tip" Content="15%" IsChecked="True" />\n    <RadioButton x:Name="Tip20" GroupName="Tip" Content="20%" />\n</StackPanel>'),
      { h: "Light, dark or the system's" },
      xaml("App.axaml", '<Application xmlns="https://github.com/avaloniaui"\n             x:Class="Tips.App" RequestedThemeVariant="Default">\n    <Application.Styles>\n        <FluentTheme />\n    </Application.Styles>\n</Application>'),
      page("Pitfalls"),
      { h: "A setting Avalonia 12 renamed" },
      sh("the build's warning", "MainWindow.axaml(8,10): Avalonia warning AVLN5001: 'TextBox.Watermark' is obsolete: Use PlaceholderText instead."),
      { ul: [ "Older tutorials use `Watermark`; in Avalonia 12 the hint text is `PlaceholderText`." ] },
      { h: "A control used before it exists" },
      cs("touching a named control before InitializeComponent", 'public MainWindow()\n{\n    BillBox.Text = "0";        // System.NullReferenceException: BillBox is still null\n    InitializeComponent();     // this is what builds the controls from the XAML\n}'),
      { h: "Two windows, two copies" },
      "`new MainWindow()` makes a second, separate window with its own controls. To change what the user sees, change the window that is open — usually from inside its own code-behind.",
      page("Connections"),
      { ul: [ "**Back:** unit 7's objects and properties (every control is one); unit 9's events — a GUI is made of them; Bridge B's Rider workflow.", "**Next:** T2.2 arranges the controls; T2.3 answers their events; T2B moves the wiring into XAML with binding.", "**The project:** milestone 1 is exactly this: the window and every control the brief names." ] },
      page("Good practice"),
      { ul: [ "Name (`x:Name`) only the controls your code or your tests need.", "Keep the window's XAML about what is shown; keep sums and rules in plain C# classes.", "Run the app after every few changes — a window is easier to judge than to imagine." ] },
      page("Practise"),
      { ul: [ "**Your first window, milestone 1:** the title, the two boxes, three tips in one group and the four results." ] },
      page("Quick reference"),
      sh("make and run", "dotnet new avalonia.app -n MyApp && cd MyApp && dotnet run"),
      { ul: [ "`Main` starts Avalonia; the event loop runs until the window closes.", "XAML elements are objects; attributes are properties; `x:Name` makes a field.", "One UI thread: keep handlers quick." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["AVLN5001: 'TextBox.Watermark' is obsolete", "use PlaceholderText", "Pitfalls"], ["NullReferenceException in the constructor", "a control used before InitializeComponent", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What does a GUI program do between events?", "Waits in the event loop; your code runs only in answer to an event."],
      ["Which call starts Avalonia's event loop for a desktop app?", "StartWithClassicDesktopLifetime(args)"],
      ["What is one XAML element?", "An object; its attributes set the object's properties."],
      ["What does x:Name=\"BillBox\" give the code-behind?", "A field called BillBox referring to that control."],
      ["How many children can a Window hold directly?", "One — put a panel inside to hold many."],
      ["What is Avalonia 12's name for a TextBox's hint text?", "PlaceholderText (Watermark is obsolete)."],
      ["Why does a slow handler freeze the window?", "All drawing and input run on the one UI thread it is blocking."]
    ],
    quiz: [
      { q: "When does a GUI program's `Main` finish?", opts: ["after the window is drawn", "when the last window closes", "after the first click", "straight away"], ans: 1, why: "The event loop runs inside StartWithClassicDesktopLifetime until the app shuts down." },
      { q: "`<TextBox x:Name=\"BillBox\" />` lets the code-behind…", opts: ["style it", "use a field BillBox", "bind it automatically", "test it"], ans: 1, why: "x:Name generates a field for the control." },
      { q: "Three RadioButtons share GroupName=\"Tip\". Checking one…", opts: ["checks all three", "unchecks the other two", "does nothing to the others", "throws"], ans: 1, why: "A group allows one choice." }
    ]
  });

  /* ================================================================
     T2.2 Layout: panels, grids and sizing
     ================================================================ */
  lesson("T2.2", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Placing controls at fixed positions works until the window is resized, the text is translated, or the user has larger fonts — then things overlap or fall off the edge.",
        "Avalonia lays controls out instead: **panels** measure their children and arrange them by rules you choose — a stack, a grid, docked edges.",
        "Get the panels right and the window works at 320 pixels wide and at 1,600, without a line of sizing code."
      ] },
      page("Core idea"),
      xaml("a form: a Grid with a label column and a stretching column", '<Grid Margin="16" ColumnDefinitions="Auto,*" RowDefinitions="Auto,Auto,Auto"\n      ColumnSpacing="12" RowSpacing="8">\n    <Label   Grid.Row="0" Content="_Bill (£)" Target="{Binding #BillBox}" />\n    <TextBox Grid.Row="0" Grid.Column="1" x:Name="BillBox" />\n\n    <Label   Grid.Row="1" Content="_People" Target="{Binding #PeopleBox}" />\n    <TextBox Grid.Row="1" Grid.Column="1" x:Name="PeopleBox" Text="1" />\n\n    <TextBlock Grid.Row="2" Grid.ColumnSpan="2" x:Name="TotalText" />\n</Grid>'),
      { ul: [
        "`ColumnDefinitions=\"Auto,*\"`: the first column is as wide as its widest label; the second takes **all the rest**, so the boxes stretch with the window.",
        "`Grid.Row` and `Grid.Column` (attached properties) put each child in a cell; `Grid.ColumnSpan` lets one cross several.",
        "A `Label` with a `Target` names the box it captions: `_B` makes Alt+B jump to the box, and screen readers read the label with it (T2.18)."
      ] },
      page("Rules"),
      { table: { head: ["Panel", "Arranges children", "Use for"], rows: [
        ["`StackPanel`", "one after another, vertically or `Orientation=\"Horizontal\"`; `Spacing` between", "a short list of things"],
        ["`Grid`", "in rows and columns: `Auto` (fit), `*` (share the rest), `2*`, or pixels", "forms, anything aligned"],
        ["`DockPanel`", "against the edges (`DockPanel.Dock`), the last child fills the middle", "a toolbar, a status bar and the content"],
        ["`WrapPanel`", "in a line that wraps when it runs out of room", "chips, buttons, tips"],
        ["`ScrollViewer`", "its one child, scrolling when it does not fit", "a long form or list"]
      ] } },
      { ul: [
        "`Margin` is space outside a control; `Padding` is space inside it. `Spacing` on a panel saves a margin on every child.",
        "`HorizontalAlignment=\"Stretch\"` (the default for most controls) fills the space given; `Left`, `Center`, `Right` take only what they need.",
        "Prefer `MinWidth`/`MaxWidth` to a fixed `Width`: a fixed width is wrong at some window size.",
        "A `StackPanel` gives its children infinite room in its direction — a horizontal stack never wraps, it runs off the edge. Use a `WrapPanel` or a `Grid` instead."
      ] },
      page("Variations"),
      { h: "Toolbar, content, status bar" },
      xaml("DockPanel", '<DockPanel>\n    <StackPanel DockPanel.Dock="Top" Orientation="Horizontal" Spacing="8" Margin="8">\n        <Button Content="New" /> <Button Content="Open" />\n    </StackPanel>\n    <TextBlock DockPanel.Dock="Bottom" Margin="8" Text="Ready" />\n    <TextBox AcceptsReturn="True" />   <!-- the last child fills the middle -->\n</DockPanel>'),
      { h: "Columns that share the width" },
      xaml("2* is twice as wide as *", '<Grid ColumnDefinitions="*,2*">\n    <ListBox Grid.Column="0" />\n    <TextBox Grid.Column="1" AcceptsReturn="True" />\n</Grid>'),
      { h: "Room to scroll" },
      xaml("a form that may be taller than the window", '<ScrollViewer>\n    <StackPanel Margin="16" Spacing="8">\n        <!-- … many fields … -->\n    </StackPanel>\n</ScrollViewer>'),
      page("Pitfalls"),
      { h: "A cell with two controls in it" },
      "Two children with the same `Grid.Row` and `Grid.Column` are drawn on top of each other. Every child needs its own cell — forgetting `Grid.Row` puts it in row 0.",
      { h: "An attached property misspelt" },
      sh("Grid.Colum=\"1\" on a TextBox", "Avalonia error AVLN2000: Unable to resolve suitable regular or attached property Colum on type Avalonia.Controls:Avalonia.Controls.Grid Line 8, position 10."),
      { ul: [ "The XAML compiler checks every property name, attached ones included: read the name it quotes, and the line and position." ] },
      { h: "A horizontal StackPanel that never wraps" },
      "Three radio buttons in a horizontal `StackPanel` run past the right edge of a narrow window. A `WrapPanel` moves the third to the next line.",
      page("Connections"),
      { ul: [ "**Back:** T2.1's controls; KurenaiOS itself — its layout rule is \"no empty gaps\", and a `*` column is how a desktop app keeps it.", "**Next:** T2.3 makes the laid-out window do something; T2.19 adapts the layout to the window's size.", "**The project:** milestone 2's tests open the window at 320, 420 and 800 pixels and check that nothing overlaps or leaves it." ] },
      page("Good practice"),
      { ul: [ "Start a form with a `Grid` of `Auto,*`; reach for fixed sizes last.", "Label every input with a `Label` and its `Target`.", "Resize the window to its narrowest and widest while you work." ] },
      page("Practise"),
      { ul: [ "**Your first window, milestone 2:** labels that target their boxes; nothing overlapping or cut off at any of three widths; boxes that stretch." ] },
      page("Quick reference"),
      xaml("the form grid", '<Grid ColumnDefinitions="Auto,*" RowDefinitions="Auto,Auto" ColumnSpacing="12" RowSpacing="8">\n    <Label Content="_Name" Target="{Binding #NameBox}" />\n    <TextBox Grid.Column="1" x:Name="NameBox" />\n</Grid>'),
      { ul: [ "`StackPanel` · `Grid` · `DockPanel` · `WrapPanel` · `ScrollViewer`.", "`Auto` fits, `*` shares the rest; `Margin` outside, `Padding` inside.", "Every Grid child in its own cell." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["AVLN2000: Unable to resolve suitable regular or attached property …", "a property name misspelt", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What does ColumnDefinitions=\"Auto,*\" do?", "First column fits its content; the second takes all the remaining width."],
      ["How do you put a control in a Grid cell?", "Grid.Row and Grid.Column on the control (attached properties)."],
      ["Margin or Padding: which is outside the control?", "Margin."],
      ["Which panel docks children to its edges and fills the middle with the last one?", "DockPanel."],
      ["Why can a horizontal StackPanel run off the edge?", "It never wraps — it gives children unlimited room; use a WrapPanel or Grid."],
      ["What does Target on a Label do?", "Links the caption to its control: an access key and a name for screen readers."]
    ],
    quiz: [
      { q: "A window 800px wide holds `Grid ColumnDefinitions=\"200,*\"`. The second column is…", opts: ["200px", "600px (less margins)", "400px", "as wide as its content"], ans: 1, why: "* takes everything left after the fixed 200." },
      { q: "Two TextBoxes, both Grid.Row=\"1\" Grid.Column=\"1\"…", opts: ["stack vertically", "overlap", "wrap", "fail to build"], ans: 1, why: "A cell has no layout of its own: both fill it." },
      { q: "Best panel for a row of tag chips that should wrap?", opts: ["StackPanel", "WrapPanel", "DockPanel", "Canvas"], ans: 1, why: "It moves what does not fit to the next line." }
    ]
  });

  /* ================================================================
     T2.3 Events and code-behind
     ================================================================ */
  lesson("T2.3", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A window that never changes is a picture. The app needs to *answer*: the user types, picks, clicks — and the window shows the result.",
        "Each control raises **events** (unit 9): `Click`, `TextChanged`, `IsCheckedChanged`. The **code-behind** — `MainWindow.axaml.cs`, the C# half of the window — subscribes handlers to them.",
        "Keep the handlers thin: read the controls, call a plain C# method that does the sums, show the answer. That method you can test without a window at all."
      ] },
      page("Core idea"),
      cs("the code-behind: subscribe, read, compute, show", 'public partial class MainWindow : Window\n{\n    public MainWindow()\n    {\n        InitializeComponent();                          // the controls exist from here\n        BillBox.TextChanged += (_, _) => Update();\n        PeopleBox.TextChanged += (_, _) => Update();\n        foreach (var tip in new[] { Tip10, Tip15, Tip20 })\n            tip.IsCheckedChanged += (_, _) => Update();\n    }\n\n    int Percent => Tip10.IsChecked == true ? 10 : Tip20.IsChecked == true ? 20 : 15;\n\n    void Update()\n    {\n        if (!decimal.TryParse(BillBox.Text, out var bill) || !int.TryParse(PeopleBox.Text, out var people) || people < 1)\n        { TotalText.Text = "—"; return; }\n        var (tip, total, each) = TipMath.Split(bill, Percent, people);\n        TotalText.Text = $"£{total:0.00}";\n    }\n}'),
      cs("the sums, apart from the window", 'public static class TipMath\n{\n    public static (decimal Tip, decimal Total, decimal Each) Split(decimal bill, int percent, int people)\n    {\n        decimal tip = Math.Round(bill * percent / 100m, 2, MidpointRounding.AwayFromZero);\n        decimal total = bill + tip;\n        return (tip, total, Math.Ceiling(total * 100m / people) / 100m);\n    }\n}'),
      { ul: [
        "`partial class MainWindow`: Avalonia generates the other half from the XAML — `InitializeComponent()` and a field for every `x:Name`.",
        "`(_, _) => Update()` is a handler that ignores the sender and the event arguments; one method answers every change.",
        "`IsChecked` is a `bool?` (a check box can be undetermined), so compare with `== true`."
      ] },
      page("Rules"),
      { table: { head: ["Event", "Raised when", "Hook it up"], rows: [
        ["`Click` (Button)", "the button is pressed (mouse, Enter, Space)", "`Click=\"OnAdd\"` in XAML, or `AddButton.Click += …`"],
        ["`TextChanged` (TextBox)", "the text changes — each keystroke, or set from code", "`BillBox.TextChanged += …`"],
        ["`IsCheckedChanged` (CheckBox, RadioButton)", "it is checked or unchecked", "`Tip15.IsCheckedChanged += …`"],
        ["`SelectionChanged` (ComboBox, ListBox)", "the chosen item changes", "`Kind.SelectionChanged += …`"]
      ] } },
      { ul: [
        "A handler named in XAML (`Click=\"OnAdd\"`) must exist in the code-behind with the right signature: `void OnAdd(object? sender, RoutedEventArgs e)`.",
        "Validate input in the handler (`TryParse`) and say what is wrong in the window, never with an exception the user cannot see.",
        "Update on every change rather than behind a \"Calculate\" button when the work is instant: the user sees the effect of each keystroke.",
        "Everything the handler touches is on the UI thread — quick work only (T2.13 moves slow work off it)."
      ] },
      page("Variations"),
      { h: "A handler named in XAML" },
      xaml("the button", '<Button Content="Clear" Click="OnClear" />'),
      cs("its handler in the code-behind", 'void OnClear(object? sender, RoutedEventArgs e)\n{\n    BillBox.Text = "";\n    PeopleBox.Text = "1";\n    BillBox.Focus();\n}'),
      { h: "One handler, several senders" },
      cs("which button was it?", 'void OnTip(object? sender, RoutedEventArgs e)\n{\n    if (sender is RadioButton { Tag: string pct }) percent = int.Parse(pct);   // a field\n    Update();\n}'),
      { h: "A message instead of a crash" },
      cs("say what is wrong, beside the input", 'Message.Text = decimal.TryParse(BillBox.Text, out _) ? "" : "Enter the bill as a number, like 42.50.";'),
      page("Pitfalls"),
      { h: "A handler name that does not match" },
      sh("TextChanged=\"OnBillChnaged\" with no such method", "Avalonia error AVLN3000: Unable to find suitable setter or adder for property TextChanged of type Avalonia.Controls:Avalonia.Controls.TextBox for argument System.Runtime:System.String, …"),
      { ul: [ "The XAML compiler could not find a method with that name and the right parameters. Check the spelling, and that it takes `(object? sender, TextChangedEventArgs e)`." ] },
      { h: "Subscribing before the controls exist" },
      sh("BillBox.TextChanged += … above InitializeComponent()", "System.NullReferenceException: Object reference not set to an instance of an object."),
      { h: "All the logic in the handler" },
      "Sums, rounding and rules written inside `Update()` can only be tested by driving the window. Move them into a class like `TipMath`, and the handler shrinks to read → call → show.",
      page("Connections"),
      { ul: [ "**Back:** unit 9's events and lambdas; unit 3's `TryParse`; unit 10's tests — `TipMath` gets its own.", "**Next:** T2B's data binding replaces most of this wiring; T2C's commands replace `Click` handlers.", "**The project:** milestone 3's tests type into your boxes and read the answers; milestone 4 is your tests of `TipMath`." ] },
      page("Good practice"),
      { ul: [ "Handlers read, call, show — nothing more.", "Keep calculations in plain classes and test them.", "Show problems in the window, next to the input that caused them." ] },
      page("Practise"),
      { ul: [ "**Your first window, milestone 3:** live updates on every keystroke and choice, with clear messages; **milestone 4:** your tests of `TipMath`, no warnings, committed." ] },
      page("Quick reference"),
      cs("the wiring", 'InitializeComponent();\nBillBox.TextChanged += (_, _) => Update();\nTip15.IsCheckedChanged += (_, _) => Update();\nvoid OnClear(object? sender, RoutedEventArgs e) { /* … */ }'),
      { ul: [ "`Click`, `TextChanged`, `IsCheckedChanged`, `SelectionChanged`.", "Subscribe after `InitializeComponent()`.", "Read → call plain C# → show; test the plain C#." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["AVLN3000: Unable to find suitable setter or adder for property TextChanged", "a handler named in XAML that does not exist", "Pitfalls"], ["NullReferenceException in the constructor", "subscribed before InitializeComponent", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What is the code-behind?", "The C# half of a window (MainWindow.axaml.cs) that handles its events."],
      ["Which event does a TextBox raise on every keystroke?", "TextChanged."],
      ["Which event tells you a RadioButton was checked or unchecked?", "IsCheckedChanged."],
      ["What signature does a Click handler named in XAML need?", "void OnX(object? sender, RoutedEventArgs e)"],
      ["Why compare IsChecked with == true?", "It is a bool? — it can be null (undetermined)."],
      ["Why keep the sums out of the handler?", "So they can be tested without opening a window."]
    ],
    quiz: [
      { q: "`BillBox.TextChanged += …` placed before `InitializeComponent()`…", opts: ["works", "throws NullReferenceException", "subscribes twice", "does not compile"], ans: 1, why: "The controls are created by InitializeComponent." },
      { q: "Setting `BillBox.Text = \"5\"` from code…", opts: ["raises TextChanged", "raises Click", "raises nothing", "throws"], ans: 0, why: "TextChanged fires for any change of the text." },
      { q: "Where should the rounding rule for each person's share live?", opts: ["in the XAML", "in the TextChanged handler", "in a plain class like TipMath", "in App.axaml.cs"], ans: 2, why: "Plain C# can be tested on its own; the handler just calls it." }
    ]
  });

  /* ================================================================
     command cards: typed, checked against anchored patterns
     ================================================================ */
  var short = function (s) { s = String(s).replace(/^(Type the |Name the |Which |Write the )/, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };
  K.add({ cards: {
    "t2a-app": { title: "Windows and controls", lesson: "T2.1", concepts: ["gui-loop"], kind: "command",
      vary: function (r) {
        var n = pick(r, ["Tips", "Notes", "Timer", "Planner"]);
        var q = pick(r, [
          ["Type the command that installs the Avalonia project templates.", "dotnet new install Avalonia.Templates", ["^dotnet new install Avalonia\\.Templates(::\\S+)?$"]],
          ["Type the command that makes a new Avalonia app called " + n + ".", "dotnet new avalonia.app -n " + n, ["^dotnet new avalonia\\.app (-n|--name) " + n + "( (-o|--output) \\S+)?$"]],
          ["Which XAML attribute gives a control a field of that name in the code-behind (with its prefix)?", "x:Name", ["^x:Name$"]],
          ["Which TextBox property shows a faint hint while it is empty, in Avalonia 12?", "PlaceholderText", ["^PlaceholderText$"]],
          ["Which method, called in a window's constructor, builds its controls from the XAML?", "InitializeComponent", ["^InitializeComponent(\\(\\))?;?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(/ called \w+/, ""), params: [n], answer: q[1], accept: q[2], hint: "dotnet new install · dotnet new avalonia.app · x:Name · PlaceholderText · InitializeComponent." };
      } },
    "t2a-layout": { title: "Layout", lesson: "T2.2", concepts: ["gui-layout"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Write the Grid attribute for two columns: the first as wide as its content, the second taking the rest.", "ColumnDefinitions=\"Auto,*\"", ["^ColumnDefinitions=\"Auto, ?\\*\"$"]],
          ["Write the attribute that puts a control in the second row of a Grid.", "Grid.Row=\"1\"", ["^Grid\\.Row=\"1\"$"]],
          ["Write the attribute that docks a child of a DockPanel to the bottom edge.", "DockPanel.Dock=\"Bottom\"", ["^DockPanel\\.Dock=\"Bottom\"$"]],
          ["Which panel moves children that do not fit onto the next line?", "WrapPanel", ["^WrapPanel$"]],
          ["Which property sets the space OUTSIDE a control, between it and its neighbours?", "Margin", ["^Margin$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], hint: "ColumnDefinitions · Grid.Row · DockPanel.Dock · WrapPanel · Margin." };
      } },
    "t2a-events": { title: "Events and code-behind", lesson: "T2.3", concepts: ["gui-events"], kind: "command",
      vary: function (r) {
        var box = pick(r, ["BillBox", "PeopleBox", "NameBox"]);
        var q = pick(r, [
          ["Type the line that makes every change to the text of " + box + " call Update(), with a lambda that ignores its arguments.", box + ".TextChanged += (_, _) => Update();", ["^" + box + "\\.TextChanged \\+= \\((_|s|sender), ?(_|e|args)\\) => Update\\(\\);?$"]],
          ["Write the XAML attribute that makes a Button call OnClear when pressed.", "Click=\"OnClear\"", ["^Click=\"OnClear\"$"]],
          ["Which event does a RadioButton raise when it is checked or unchecked?", "IsCheckedChanged", ["^IsCheckedChanged$"]],
          ["Write the parameter list a Click handler needs (sender first).", "(object? sender, RoutedEventArgs e)", ["^\\(object\\?? \\w+, ?RoutedEventArgs \\w+\\)$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(/ of \w+Box/, " of a box"), params: [box], answer: q[1], accept: q[2], hint: "TextChanged += · Click=\"…\" · IsCheckedChanged · (object? sender, RoutedEventArgs e)." };
      } }
  } });

  /* ================================================================
     T2's taster and T2A's project: Your first window; its files are
     generated into code-projects-files.js
     ================================================================ */
  K.project("rp-t2a-window", {
    unit: "T2A", title: "Your first window", folder: "first-window", solution: "FirstWindow.sln",
    scaffoldVersion: 1, minValidator: "1.1.0", sdk: ".NET 10 SDK",
    summary: "T2's taster: a desktop tip calculator in Avalonia — a window laid out in XAML, live answers from its code-behind, and tests that drive it headless — built in Rider.",
    brief: [
      "One Avalonia app, `src/Tips`: `MainWindow.axaml` (lay it out), `MainWindow.axaml.cs` (wire it up) and `TipMath.cs` (the sums). Your tests go in `tests/Tips.Tests`; Kurenai's acceptance tests for milestones 1–3 (`tests/Tips.Acceptance`) open your window on Avalonia's **headless** platform, find the controls by name, type into them and read what they show.",
      { ul: [
        "Install the **AvaloniaRider** plugin for the XAML previewer.",
        "The names matter: the tests look for `BillBox`, `PeopleBox`, `Tip10`/`Tip15`/`Tip20`, `TipText`, `TotalText`, `EachText` and `Message`.",
        "`Directory.Build.props`, `tests/Tips.Acceptance/` and `.kurenai/validate.cs` are **protected**.",
        "Avalonia 12.1.4; the tests use Avalonia.Headless.XUnit on xunit v3."
      ] }
    ],
    milestones: [
      { id: "m1", title: "A window with controls", lessons: ["T2.1"], about: "Titled Tip calculator; the two boxes, three tips in one group (15% chosen) and four result blocks, each named.", checks: [{ type: "tests", class: "Milestone1" }] },
      { id: "m2", title: "Laid out", lessons: ["T2.2"], about: "Every box labelled by a Label that targets it; nothing overlapping or outside the window at 320, 420 or 800 pixels; the boxes stretch.", checks: [{ type: "tests", class: "Milestone2" }] },
      { id: "m3", title: "Events", lessons: ["T2.3"], about: "The tip, total and each share follow every keystroke and choice; nonsense shows — and says why.", checks: [{ type: "tests", class: "Milestone3" }] },
      { id: "m4", title: "Tested, clean and committed", lessons: ["T2.3"], about: "Four or more of your own tests of TipMath; no warnings; committed.",
        checks: [{ type: "owntests", prefix: "Tips.Tests.", min: 4 }, { type: "source", path: "src/Tips/TipMath.cs", forbids: ["NotImplementedException"] }, { type: "warnings", max: 0 }, { type: "git" }] }
    ],
    protected: ["Directory.Build.props", "tests/Tips.Acceptance/Tips.Acceptance.csproj", "tests/Tips.Acceptance/Headless.cs", "tests/Tips.Acceptance/Milestone1.cs", "tests/Tips.Acceptance/Milestone2.cs", "tests/Tips.Acceptance/Milestone3.cs", ".kurenai/validate.cs"],
    reward: { xp: 100, gold: 25, hp: 6 }
  });
})();
