/* Kurenai OS — data/content/code-t2b.js
   Code · T2 · Part B · XAML, styles and binding (docs/code-plan.md §3.3),
   done in Rider with Avalonia 12.

   XAML in depth (T2.4), styles and themes (T2.5), data binding (T2.6),
   change notification and lists (T2.7). Rider form (smoke75); COMMAND cards.
   The part's project is "The Reading List" (rp-t2b-reading; files from
   tools/code-projects/reading-list/), proven headless by the validator. The
   build messages quoted on the Pitfalls pages come from real builds.      */
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
    "xaml": { name: "XAML, resources and templates", lesson: "T2.4", about: "markup as objects; resources by key; data templates" },
    "styles": { name: "Styles and themes", lesson: "T2.5", about: "selectors, classes, setters; light and dark" },
    "binding": { name: "Data binding", lesson: "T2.6", about: "DataContext, {Binding}, modes, compiled bindings" },
    "inpc": { name: "Change notification", lesson: "T2.7", about: "INotifyPropertyChanged, ObservableCollection" }
  } });

  /* ================================================================
     T2.4 XAML in depth: markup, resources and templates
     ================================================================ */
  lesson("T2.4", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "T2A used XAML as a list of controls. It is more than that: a precise way to build a tree of objects, set their properties, share values between them and say how *data* should look.",
        "Without **resources**, the same colour or margin is typed in twenty places; without **templates**, a list of books shows `Reading.Book` twenty times, because that is what `ToString()` says.",
        "This lesson reads XAML the way the compiler does, then uses resources and data templates to describe a list once."
      ] },
      page("Core idea"),
      xaml("a resource, used by key; a list drawn through a data template", '<Window xmlns="https://github.com/avaloniaui"\n        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"\n        xmlns:local="using:Reading"\n        x:Class="Reading.MainWindow" x:DataType="local:ReadingList">\n    <Window.Resources>\n        <SolidColorBrush x:Key="Accent" Color="#C2410C" />\n    </Window.Resources>\n    <StackPanel Margin="16" Spacing="8">\n        <TextBlock Text="The Reading List" Foreground="{StaticResource Accent}" />\n        <ListBox x:Name="BookList" ItemsSource="{Binding Books}">\n            <ListBox.ItemTemplate>\n                <DataTemplate x:DataType="local:Book">\n                    <StackPanel>\n                        <TextBlock Text="{Binding Title}" FontWeight="SemiBold" />\n                        <TextBlock Text="{Binding Author}" Opacity="0.7" />\n                    </StackPanel>\n                </DataTemplate>\n            </ListBox.ItemTemplate>\n        </ListBox>\n    </StackPanel>\n</Window>'),
      { ul: [
        "`xmlns:local=\"using:Reading\"` lets XAML name your own C# types (`local:Book`).",
        "`x:Key` names a resource; `{StaticResource Accent}` looks it up — in the element, then its parents, then the app.",
        "A **data template** says how ONE item looks. The `ListBox` makes one copy per book, each with that book as its data."
      ] },
      page("Rules"),
      { table: { head: ["You write", "It means"], rows: [
        ["`<TextBlock Text=\"Hi\" />`", "`new TextBlock { Text = \"Hi\" }`"],
        ["`<ListBox.ItemTemplate>…</ListBox.ItemTemplate>`", "a *property element*: a property too rich for an attribute"],
        ["`{StaticResource Accent}`", "a *markup extension*: work out the value when the XAML loads"],
        ["`{DynamicResource Accent}`", "look it up now and again whenever it changes (themes)"],
        ["`x:Key`, `x:Name`, `x:DataType`, `x:Class`", "XAML's own directives (the `x:` namespace)"]
      ] } },
      { ul: [
        "Resources can be brushes, numbers, `Thickness`es, styles or templates — anything with a key.",
        "Put a value used by one window in `Window.Resources`; one used everywhere in `App.axaml`'s `Application.Resources`.",
        "A `DataTemplate` with `x:DataType` is checked when the app builds: a misspelt property is a build error, not a blank screen.",
        "`ItemsControl` draws a list; `ListBox` adds selection; both take `ItemsSource` and `ItemTemplate`."
      ] },
      page("Variations"),
      { h: "Resources for the whole app" },
      xaml("App.axaml", '<Application.Resources>\n    <Thickness x:Key="Gap">16</Thickness>\n    <SolidColorBrush x:Key="Accent" Color="#C2410C" />\n</Application.Resources>'),
      { h: "A template chosen by type" },
      xaml("App.axaml: any Book, anywhere, looks like this", '<Application.DataTemplates>\n    <DataTemplate DataType="local:Book">\n        <TextBlock Text="{Binding Title}" />\n    </DataTemplate>\n</Application.DataTemplates>'),
      { h: "A lookup from code" },
      cs("find a resource in C#", 'if (this.TryFindResource("Accent", ActualThemeVariant, out var accent) && accent is ISolidColorBrush brush)\n    Title = $"Accent is {brush.Color}";'),
      page("Pitfalls"),
      { h: "A resource key that does not exist" },
      sh("the app stops when the window loads (it builds fine)", "System.Collections.Generic.KeyNotFoundException : Static resource 'Acent' not found."),
      { ul: [ "Keys are only checked when the XAML loads. Spell them once, and use them often." ] },
      { h: "A list that shows type names" },
      "Without an `ItemTemplate`, each item is drawn with `ToString()`: `Reading.Book`, over and over. Give the list a `DataTemplate` (or the type a template in `DataTemplates`).",
      { h: "A template property that does not exist" },
      sh("{Binding Titel} inside a DataTemplate x:DataType=\"local:Book\"", "Avalonia error AVLN2000: Unable to resolve property or method of name 'Titel' on type 'Reading.Book'."),
      page("Connections"),
      { ul: [ "**Back:** T2A's XAML; unit 7's object initialisers — XAML is one big one.", "**Next:** T2.5 styles controls from resources; T2.6 explains `{Binding}`; T2E maps whole pages with templates.", "**The project:** milestone 1 — the list's template and the Accent resource." ] },
      page("Good practice"),
      { ul: [ "Name every repeated value as a resource.", "Give every list a template with `x:DataType`.", "Keep templates small; a template that grows is a user control waiting to be made." ] },
      page("Practise"),
      { ul: [ "**The Reading List, milestone 1:** `BookList` with a data template showing title and author; an `Accent` brush used in the window." ] },
      page("Quick reference"),
      xaml("the pieces", '<Window.Resources><SolidColorBrush x:Key="Accent" Color="#C2410C" /></Window.Resources>\n<TextBlock Foreground="{StaticResource Accent}" />\n<ListBox ItemsSource="{Binding Books}"><ListBox.ItemTemplate><DataTemplate x:DataType="local:Book">…</DataTemplate></ListBox.ItemTemplate></ListBox>'),
      { ul: [ "Elements are objects; attributes and property elements set properties.", "`x:Key` + `{StaticResource}`; `{DynamicResource}` for values that change.", "`DataTemplate` + `x:DataType`: one item's look, checked at build time." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["Static resource '…' not found", "a resource key misspelt", "Pitfalls"], ["AVLN2000: Unable to resolve property or method of name …", "a binding to a property the type lacks", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What does xmlns:local=\"using:Reading\" do?", "Lets the XAML use your own types from the Reading namespace (local:Book)."],
      ["How do you name a resource?", "With x:Key."],
      ["What does {StaticResource Accent} do?", "Looks up the resource keyed Accent when the XAML loads."],
      ["When do you need {DynamicResource} instead?", "When the value can change while the app runs, such as with themes."],
      ["What is a DataTemplate?", "A description of how one item of data is drawn."],
      ["What does a ListBox show for items with no template?", "Each item's ToString() — usually its type name."]
    ],
    quiz: [
      { q: "`<ListBox.ItemTemplate>` inside a `<ListBox>` is…", opts: ["a child control", "a property element setting ItemTemplate", "a resource", "a style"], ans: 1, why: "Type.Property elements set properties too rich for an attribute." },
      { q: "A misspelt `{StaticResource}` key shows up…", opts: ["as a build error", "when the XAML loads, as KeyNotFoundException", "never", "as a blank colour"], ans: 1, why: "Resource keys are resolved at load time." },
      { q: "Where should a brush every window uses live?", opts: ["each Window.Resources", "Application.Resources", "a C# constant", "the theme"], ans: 1, why: "App-level resources are found from every window." }
    ]
  });

  /* ================================================================
     T2.5 Styles and themes
     ================================================================ */
  lesson("T2.5", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Setting `FontWeight=\"SemiBold\"` and a colour on every heading works until the design changes — then it is twenty edits.",
        "**Styles** set properties on every control a **selector** matches, like CSS. A **class** lets one control opt in (`done`, `heading`), and a binding can switch the class on and off.",
        "**Themes** go further: the Fluent theme draws every control, and its **variants** — Light and Dark — swap the colours of the whole app at once."
      ] },
      page("Core idea"),
      xaml("styles by selector and class; a class switched by data", '<Window.Styles>\n    <Style Selector="TextBlock.heading">\n        <Setter Property="FontSize" Value="20" />\n        <Setter Property="Foreground" Value="{StaticResource Accent}" />\n    </Style>\n    <Style Selector="TextBlock.done">\n        <Setter Property="Opacity" Value="0.55" />\n        <Setter Property="TextDecorations" Value="Strikethrough" />\n    </Style>\n</Window.Styles>\n\n<TextBlock Classes="heading" Text="The Reading List" />\n<TextBlock Text="{Binding Title}" Classes.done="{Binding Done}" />'),
      cs("Light or Dark for the whole app", 'DarkToggle.IsCheckedChanged += (_, _) =>\n    Application.Current!.RequestedThemeVariant =\n        DarkToggle.IsChecked == true ? ThemeVariant.Dark : ThemeVariant.Light;'),
      { ul: [
        "`Selector=\"TextBlock.done\"`: every `TextBlock` with the class `done`. Each `Setter` sets one property.",
        "`Classes.done=\"{Binding Done}\"` adds the class while `Done` is true and removes it when false — the style follows the data.",
        "`RequestedThemeVariant` is `Default` (follow the system), `Light` or `Dark`; every control drawn by the theme changes at once."
      ] },
      page("Rules"),
      { table: { head: ["Selector", "Matches"], rows: [
        ["`Button`", "every Button"],
        ["`Button.primary`", "Buttons with the class primary"],
        ["`#AddButton`", "the control named AddButton"],
        ["`StackPanel > TextBlock`", "TextBlocks directly inside a StackPanel"],
        ["`Button:pointerover`", "a Button while the pointer is over it (a pseudo-class)"],
        ["`ListBoxItem:selected TextBlock`", "TextBlocks anywhere inside a selected item"]
      ] } },
      { ul: [
        "A value set on the control itself (`Opacity=\"1\"`) beats any style — set looks in styles, not on controls.",
        "Later styles win over earlier ones for the same property and the same strength of selector.",
        "Colours that should change with the theme are `{DynamicResource …}` theme resources, not fixed hex values.",
        "`ThemeVariant.Default` follows the operating system; offer Light and Dark as a choice on top of it."
      ] },
      page("Variations"),
      { h: "A style for every button of a kind" },
      xaml("with a hover state", '<Style Selector="Button.primary">\n    <Setter Property="Background" Value="{StaticResource Accent}" />\n    <Setter Property="Foreground" Value="White" />\n</Style>\n<Style Selector="Button.primary:pointerover /template/ ContentPresenter">\n    <Setter Property="Opacity" Value="0.9" />\n</Style>'),
      { h: "Colours per theme" },
      xaml("a brush with a Light and a Dark value", '<Application.Resources>\n    <ResourceDictionary>\n        <ResourceDictionary.ThemeDictionaries>\n            <ResourceDictionary x:Key="Light"><SolidColorBrush x:Key="Muted" Color="#57534E" /></ResourceDictionary>\n            <ResourceDictionary x:Key="Dark"><SolidColorBrush x:Key="Muted" Color="#A8A29E" /></ResourceDictionary>\n        </ResourceDictionary.ThemeDictionaries>\n    </ResourceDictionary>\n</Application.Resources>\n<TextBlock Foreground="{DynamicResource Muted}" />'),
      { h: "A class from code" },
      cs("Classes is a list you can change", 'TitleText.Classes.Set("done", book.Done);   // adds or removes'),
      page("Pitfalls"),
      { h: "A style that does nothing" },
      "`<TextBlock Opacity=\"1\" Classes=\"done\" />` stays fully visible: the value on the control beats the style's setter. Remove the local value.",
      { h: "A colour fixed in the dark" },
      "A brush typed as `#222222` stays dark grey on a dark background. Use a theme resource (`{DynamicResource}`) so Light and Dark each get their own.",
      { h: "A misspelt property in a setter" },
      sh("<Setter Property=\"Opactiy\" …>", "Avalonia error AVLN2000: Unable to resolve suitable regular or attached property Opactiy on type Avalonia.Controls:Avalonia.Controls.TextBlock"),
      page("Connections"),
      { ul: [ "**Back:** T2.4's resources; CSS selectors if you have met them; KurenaiOS's own Dawn and Graphite themes are this idea.", "**Next:** T2.6's bindings drive `Classes.done`; T2.18 checks the colours still read for everyone.", "**The project:** milestone 2 — the done class and the dark switch." ] },
      page("Good practice"),
      { ul: [ "Style by class (`heading`, `done`) rather than by setting the same properties again and again.", "Let the data switch classes; keep logic out of styles.", "Test both Light and Dark before calling a window done." ] },
      page("Practise"),
      { ul: [ "**The Reading List, milestone 2:** read books faded by a style for `TextBlock.done`; the `DarkToggle` switch." ] },
      page("Quick reference"),
      xaml("a style and a class", '<Style Selector="TextBlock.done"><Setter Property="Opacity" Value="0.55" /></Style>\n<TextBlock Classes.done="{Binding Done}" />'),
      { ul: [ "Selector · Setter · Classes · pseudo-classes like `:pointerover`.", "A local value beats a style.", "`Application.Current.RequestedThemeVariant` = Default · Light · Dark." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["AVLN2000: Unable to resolve suitable regular or attached property …", "a setter's property misspelt", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What does Selector=\"TextBlock.done\" match?", "Every TextBlock that has the class done."],
      ["How does data switch a class on and off?", "Classes.done=\"{Binding Done}\" on the control."],
      ["Which wins: a value set on the control or a style's setter?", "The value on the control."],
      ["How do you make the whole app dark?", "Application.Current.RequestedThemeVariant = ThemeVariant.Dark"],
      ["What does ThemeVariant.Default do?", "Follows the operating system's light or dark setting."],
      ["Which pseudo-class matches a button under the mouse?", ":pointerover"]
    ],
    quiz: [
      { q: "`<TextBlock Classes=\"done\" Opacity=\"1\" />` with a style setting Opacity 0.5 for `.done` shows at…", opts: ["0.5", "1", "0.75", "it fails to build"], ans: 1, why: "A local value beats a style." },
      { q: "Which selector matches the control named AddButton?", opts: [".AddButton", "#AddButton", "Button:AddButton", "AddButton"], ans: 1, why: "# selects by name, . by class." },
      { q: "A brush that should differ in Light and Dark is used with…", opts: ["StaticResource", "DynamicResource and theme dictionaries", "a fixed hex colour", "a style class"], ans: 1, why: "Dynamic lookups follow the theme variant." }
    ]
  });

  /* ================================================================
     T2.6 Data binding
     ================================================================ */
  lesson("T2.6", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "T2A copied values by hand: read `BillBox.Text` in a handler, write `TotalText.Text` back. With ten fields that is twenty lines of plumbing and twenty places to forget one.",
        "**Data binding** connects a control's property to a property of an object — the window's **DataContext** — and keeps them in step.",
        "The window stops knowing *how* values move; it only says *which* control shows *which* value."
      ] },
      page("Core idea"),
      cs("the data: a plain class with properties", 'public class ReadingList\n{\n    public ObservableCollection<Book> Books { get; } = new();\n    public string NewTitle { get; set; } = "";\n    public Book? Selected { get; set; }\n}\n\n// MainWindow.axaml.cs\npublic MainWindow()\n{\n    InitializeComponent();\n    DataContext = new ReadingList();\n}'),
      xaml("the window: bindings instead of handlers", '<Window … x:DataType="local:ReadingList">\n    <StackPanel Spacing="8">\n        <TextBox x:Name="TitleBox" Text="{Binding NewTitle}" />\n        <ListBox x:Name="BookList" ItemsSource="{Binding Books}" SelectedItem="{Binding Selected}" />\n        <TextBox x:Name="EditTitle" Text="{Binding Selected.Title}" />\n    </StackPanel>\n</Window>'),
      { ul: [
        "`DataContext` flows down: every control in the window binds against the same `ReadingList` unless it is given another.",
        "`{Binding NewTitle}` on a `TextBox.Text` is **two-way**: typing sets `NewTitle`; changing `NewTitle` (with notification, T2.7) updates the box.",
        "`x:DataType` makes the bindings **compiled**: checked at build time and faster at run time. Inside a template, the item becomes the data (`local:Book`)."
      ] },
      page("Rules"),
      { table: { head: ["Mode", "Direction", "Default for"], rows: [
        ["`OneWay`", "data → control", "most properties (`TextBlock.Text`, `IsEnabled`)"],
        ["`TwoWay`", "both ways", "inputs: `TextBox.Text`, `IsChecked`, `SelectedItem`, `Value`"],
        ["`OneTime`", "once, when bound", "values that never change"],
        ["`OneWayToSource`", "control → data", "rare: reading a control's state into the data"]
      ] } },
      { ul: [
        "A path can walk properties: `Selected.Title`. While `Selected` is null the binding has no value — give it a `FallbackValue` if it matters.",
        "`{Binding #TitleBox.Text}` binds to another control by name; `{Binding $parent[Window].Title}` to an ancestor.",
        "Converters change a value on its way: `{Binding Selected, Converter={x:Static ObjectConverters.IsNotNull}}` turns \"something chosen\" into `true`.",
        "Button clicks are still handlers in this part; T2C replaces them with commands bound like everything else."
      ] },
      page("Variations"),
      { h: "Enable a button from the data" },
      xaml("only while there is a title", '<Button x:Name="AddButton" Content="Add" IsEnabled="{Binding CanAdd}" Click="OnAdd" />'),
      { h: "A converter for null" },
      xaml("disabled until a book is chosen", '<Button Content="Remove" IsEnabled="{Binding Selected, Converter={x:Static ObjectConverters.IsNotNull}}" />'),
      { h: "Formatting in the binding" },
      xaml("StringFormat", '<TextBlock Text="{Binding Books.Count, StringFormat=\'{}{0} books\'}" />'),
      page("Pitfalls"),
      { h: "Compiled bindings with no starting type" },
      sh("bindings on a window without x:DataType (compiled bindings are on by default)", "Avalonia error AVLN2100: Cannot parse a compiled binding without an explicit x:DataType directive to give a starting data type for bindings. Line 25, position 65."),
      { ul: [ "Add `x:DataType=\"local:ReadingList\"` to the window (and `xmlns:local`)." ] },
      { h: "A misspelt binding path" },
      sh("{Binding Summery}", "Avalonia error AVLN2000: Unable to resolve property or method of name 'Summery' on type 'Reading.ReadingList'. Line 25, position 65."),
      { h: "The box updates the data, but not the other way" },
      "Setting `NewTitle = \"\"` in code leaves the old text in the box: a plain property gives the binding no way to know it changed. That is exactly what T2.7's `INotifyPropertyChanged` is for.",
      page("Connections"),
      { ul: [ "**Back:** T2A's code-behind copying (now gone); unit 7's properties.", "**Next:** T2.7 makes the data announce its changes; T2C's view models are the DataContext done properly.", "**The project:** milestone 3 — the boxes, Add, the selection and the rename box, all bound." ] },
      page("Good practice"),
      { ul: [ "Always set `x:DataType`: a typo becomes a build error.", "Bind; do not copy values by hand.", "Keep the DataContext's properties about what the window shows (`CanAdd`, `Summary`), not about controls." ] },
      page("Practise"),
      { ul: [ "**The Reading List, milestone 3:** `TitleBox`, `AuthorBox`, `AddButton` (enabled by `CanAdd`), the bound selection and `EditTitle`." ] },
      page("Quick reference"),
      xaml("the essentials", '<Window x:DataType="local:ReadingList">\n<TextBox Text="{Binding NewTitle}" />\n<ListBox ItemsSource="{Binding Books}" SelectedItem="{Binding Selected}" />'),
      { ul: [ "`DataContext` = the object; `{Binding Path}` = one of its properties.", "Inputs bind two-way; displays one-way.", "`x:DataType` for compiled, checked bindings." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["AVLN2100: Cannot parse a compiled binding without an explicit x:DataType", "no x:DataType on the window or template", "Pitfalls"], ["AVLN2000: Unable to resolve property or method of name …", "a misspelt binding path", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What is the DataContext?", "The object a control's bindings read from; it flows down to child controls."],
      ["Is {Binding NewTitle} on a TextBox.Text one-way or two-way?", "Two-way by default."],
      ["What does x:DataType give you?", "Compiled bindings, checked when the app builds."],
      ["How do you bind to a property of the selected item?", "A path: {Binding Selected.Title}."],
      ["How do you bind one control to another by name?", "{Binding #TitleBox.Text}"],
      ["Why does setting a plain property in code not update the box?", "Nothing tells the binding it changed — it needs INotifyPropertyChanged."]
    ],
    quiz: [
      { q: "`TextBlock.Text=\"{Binding Summary}\"` is by default…", opts: ["TwoWay", "OneWay", "OneTime", "OneWayToSource"], ans: 1, why: "Displays bind one way; inputs two way." },
      { q: "A window with compiled bindings and no x:DataType…", opts: ["runs with blank values", "fails to build with AVLN2100", "uses reflection", "binds to itself"], ans: 1, why: "Compiled bindings need a starting type." },
      { q: "Where does a control inside a DataTemplate get its data?", opts: ["the window's DataContext", "the item it draws", "App.Current", "nowhere"], ans: 1, why: "Each templated item's DataContext is that item." }
    ]
  });

  /* ================================================================
     T2.7 Change notification and lists
     ================================================================ */
  lesson("T2.7", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A binding reads a property once, then waits to be told it changed. A plain C# property never says anything — so code that sets `NewTitle = \"\"` or `book.Done = true` leaves the window out of date.",
        "**INotifyPropertyChanged** is the telling: one event, `PropertyChanged`, raised with the property's name. A list needs the same for items added and removed: **ObservableCollection<T>** raises `CollectionChanged`.",
        "With both in place the window keeps up with the data by itself — whoever changes it, from wherever."
      ] },
      page("Core idea"),
      cs("a class that announces its changes", 'using System.ComponentModel;\nusing System.Runtime.CompilerServices;\n\npublic class Book(string title, string author) : INotifyPropertyChanged\n{\n    string title = title;\n    bool done;\n\n    public event PropertyChangedEventHandler? PropertyChanged;\n\n    public string Title { get => title; set => Set(ref title, value); }\n    public string Author { get; } = author;\n    public bool Done { get => done; set => Set(ref done, value); }\n\n    void Set<T>(ref T field, T value, [CallerMemberName] string? name = null)\n    {\n        if (EqualityComparer<T>.Default.Equals(field, value)) return;   // no change, no event\n        field = value;\n        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));\n    }\n}'),
      cs("a list the UI can watch, and a summary that follows it", 'public ObservableCollection<Book> Books { get; } = new();\n\npublic ReadingList()\n{\n    Books.CollectionChanged += (_, e) =>\n    {\n        foreach (Book b in e.NewItems ?? Array.Empty<Book>()) b.PropertyChanged += BookChanged;\n        foreach (Book b in e.OldItems ?? Array.Empty<Book>()) b.PropertyChanged -= BookChanged;\n        Changed(nameof(Summary));\n    };\n}\n\nvoid BookChanged(object? s, PropertyChangedEventArgs e) { if (e.PropertyName == nameof(Book.Done)) Changed(nameof(Summary)); }'),
      { ul: [
        "`[CallerMemberName]` fills in the property's name, so `Set(ref title, value)` inside `Title` raises \"Title\".",
        "A **computed** property (`Summary`) has no setter to raise from — raise its name whenever anything it depends on changes.",
        "`ObservableCollection` tells the `ListBox` about each `Add`/`Remove`, so it adds or removes one row instead of redrawing everything."
      ] },
      page("Rules"),
      { table: { head: ["Change", "Who must say so", "How"], rows: [
        ["a property's value", "its class", "`PropertyChanged(\"Title\")`"],
        ["a computed property's inputs", "the class, for the computed name too", "`Changed(nameof(Summary))`"],
        ["items added, removed, moved", "the collection", "`ObservableCollection<T>`"],
        ["a property of an item in the list", "the item", "the item's own `PropertyChanged`"],
        ["the whole list replaced", "the owner of the list property", "`PropertyChanged(\"Books\")`"]
      ] } },
      { ul: [
        "Raise only when the value really changes; raising on every set causes needless redraws (and loops between two bound properties).",
        "`List<T>` gives no notification: a `ListBox` bound to it shows what was there when it was bound, and never more.",
        "Change bound data on the UI thread (T2.13 explains how when work happens elsewhere).",
        "T2C's CommunityToolkit.Mvvm writes all of this for you with `[ObservableProperty]` — write it by hand once so you know what it does."
      ] },
      page("Variations"),
      { h: "A computed property that follows its input" },
      cs("CanAdd follows NewTitle", 'public string NewTitle\n{\n    get => newTitle;\n    set { if (newTitle == value) return; newTitle = value; Changed(); Changed(nameof(CanAdd)); }\n}\npublic bool CanAdd => !string.IsNullOrWhiteSpace(NewTitle);'),
      { h: "Listening to a change in a test" },
      cs("prove the event fires, and fires once", 'var heard = new List<string?>();\nbook.PropertyChanged += (_, e) => heard.Add(e.PropertyName);\nbook.Done = true;\nbook.Done = true;\nAssert.Equal(new[] { "Done" }, heard);'),
      { h: "A sorted view without a second list" },
      cs("re-sort by moving, so the ListBox animates nothing away", 'int to = Books.Count(b => string.CompareOrdinal(b.Title, book.Title) < 0);\nBooks.Move(Books.IndexOf(book), to);'),
      page("Pitfalls"),
      { h: "A List<T> behind a ListBox" },
      "Books added to a `List<Book>` after the window opened never appear. Make it an `ObservableCollection<Book>`.",
      { h: "Raising the wrong name" },
      cs("a string typed by hand drifts from the property", 'PropertyChanged?.Invoke(this, new PropertyChangedEventArgs("Tittle"));   // nothing updates\nPropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Title)));   // checked by the compiler'),
      { h: "Forgetting the computed property" },
      "`Done` raises its change, but the summary still says \"0 read\": `Summary` depends on every book's `Done`, so its change must be raised too.",
      page("Connections"),
      { ul: [ "**Back:** unit 9's events — `PropertyChanged` is one; T2.6's bindings, which listen to it.", "**Next:** T2C's `ObservableObject` and `[ObservableProperty]` generate this code; T2.11 tests it.", "**The project:** milestone 4 — notifications, the observable list and the live summary." ] },
      page("Good practice"),
      { ul: [ "Use `nameof` (or `[CallerMemberName]`), never a typed string.", "Raise only on a real change.", "Expose lists as `ObservableCollection<T>` with a getter only, and change their contents rather than replacing them." ] },
      page("Practise"),
      { ul: [ "**The Reading List, milestone 4:** `Book` and `ReadingList` notify; `Books` is observable; `SummaryText` keeps up; Remove works. **Milestone 5:** your tests, no warnings, committed." ] },
      page("Quick reference"),
      cs("the pattern", 'public event PropertyChangedEventHandler? PropertyChanged;\nvoid Changed([CallerMemberName] string? n = null) => PropertyChanged?.Invoke(this, new(n));\npublic ObservableCollection<Book> Books { get; } = new();'),
      { ul: [ "`INotifyPropertyChanged` for values; `ObservableCollection<T>` for lists.", "Raise computed names when their inputs change.", "Only on real changes; always with `nameof`." ] },
      { table: { head: ["Symptom", "Cause", "Page"], rows: [["items added in code never show", "a List<T> instead of ObservableCollection<T>", "Pitfalls"], ["a value changes but the window does not", "no PropertyChanged, or the wrong name", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What does INotifyPropertyChanged add to a class?", "One event, PropertyChanged, raised with the name of the property that changed."],
      ["What does [CallerMemberName] fill in?", "The name of the calling member — the property whose setter called."],
      ["Why use ObservableCollection<T> rather than List<T> for a bound list?", "It raises CollectionChanged when items are added or removed, so the list updates."],
      ["How does a computed property like Summary update?", "Raise PropertyChanged for it whenever something it depends on changes."],
      ["Why raise only when the value really changed?", "To avoid needless redraws and loops between bound properties."],
      ["Does ObservableCollection tell you when an item's own property changes?", "No — the item must raise its own PropertyChanged."]
    ],
    quiz: [
      { q: "A ListBox is bound to a List<Book>. A book added later…", opts: ["appears at once", "never appears", "appears after a resize", "throws"], ans: 1, why: "List<T> raises no CollectionChanged." },
      { q: "`book.Done = true` raises PropertyChanged(\"Done\"). The summary \"1 book · 0 read\"…", opts: ["updates by itself", "updates only if Summary's change is raised too", "throws", "updates after a click"], ans: 1, why: "Summary is computed: someone must announce it." },
      { q: "Setting Title to the value it already has should…", opts: ["raise PropertyChanged", "raise nothing", "throw", "raise CollectionChanged"], ans: 1, why: "No change, no event." }
    ]
  });

  /* ================================================================
     command cards
     ================================================================ */
  var short = function (s) { s = String(s).replace(/^(Type the |Name the |Which |Write the )/, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };
  K.add({ cards: {
    "t2b-xaml": { title: "Resources and templates", lesson: "T2.4", concepts: ["xaml"], kind: "command",
      vary: function (r) {
        var key = pick(r, ["Accent", "Gap", "Muted"]);
        var q = pick(r, [
          ["Write the markup extension that looks up the resource keyed " + key + " once, when the XAML loads.", "{StaticResource " + key + "}", ["^\\{StaticResource " + key + "\\}$"]],
          ["Write the markup extension that looks up the resource keyed " + key + " and follows it when the theme changes.", "{DynamicResource " + key + "}", ["^\\{DynamicResource " + key + "\\}$"]],
          ["Which XAML directive (with its prefix) names a resource?", "x:Key", ["^x:Key$"]],
          ["Which XAML element describes how ONE item of data is drawn?", "DataTemplate", ["^<?DataTemplate>?$"]],
          ["Which ListBox property holds the template for its items?", "ItemTemplate", ["^(ListBox\\.)?ItemTemplate$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(new RegExp(" keyed " + key), " by key"), params: [key], answer: q[1], accept: q[2], hint: "{StaticResource …} · {DynamicResource …} · x:Key · DataTemplate · ItemTemplate." };
      } },
    "t2b-styles": { title: "Styles and themes", lesson: "T2.5", concepts: ["styles"], kind: "command",
      vary: function (r) {
        var c = pick(r, ["done", "heading", "primary"]);
        var q = pick(r, [
          ["Write the Selector value that matches every TextBlock with the class " + c + ".", "TextBlock." + c, ["^\"?TextBlock\\." + c + "\"?$"]],
          ["Write the attribute that gives a TextBlock the class " + c + " while the bound property Done is true.", "Classes." + c + "=\"{Binding Done}\"", ["^Classes\\." + c + "=\"\\{Binding Done\\}\"$"]],
          ["Type the line that makes the whole app dark.", "Application.Current!.RequestedThemeVariant = ThemeVariant.Dark;", ["^Application\\.Current!?\\.RequestedThemeVariant = ThemeVariant\\.Dark;?$"]],
          ["Which pseudo-class matches a control while the mouse is over it?", ":pointerover", ["^:pointerover$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(new RegExp(" the class " + c), " a class"), params: [c], answer: q[1], accept: q[2], hint: "Type.class selectors · Classes.x=\"{Binding}\" · RequestedThemeVariant · :pointerover." };
      } },
    "t2b-binding": { title: "Binding and notification", lesson: "T2.6", concepts: ["binding", "inpc"], kind: "command",
      vary: function (r) {
        var p = pick(r, ["NewTitle", "NewAuthor", "Summary"]);
        var q = pick(r, [
          ["Write the binding markup for the property " + p + " of the DataContext.", "{Binding " + p + "}", ["^\\{Binding (Path=)?" + p + "\\}$"]],
          ["Which XAML directive (with its prefix) gives bindings their starting type, so they are compiled?", "x:DataType", ["^x:DataType$"]],
          ["Which interface lets a class tell bindings that a property changed?", "INotifyPropertyChanged", ["^(System\\.ComponentModel\\.)?INotifyPropertyChanged$"]],
          ["Which collection type tells a bound list when items are added or removed (without the <T>)?", "ObservableCollection", ["^ObservableCollection(<\\w*>)?$"]],
          ["Which attribute fills in the calling property's name for you?", "[CallerMemberName]", ["^\\[?CallerMemberName(Attribute)?\\]?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(new RegExp(" the property " + p), " a property"), params: [p], answer: q[1], accept: q[2], hint: "{Binding …} · x:DataType · INotifyPropertyChanged · ObservableCollection · [CallerMemberName]." };
      } }
  } });

  /* ================================================================
     the part's project: The Reading List
     ================================================================ */
  K.project("rp-t2b-reading", {
    unit: "T2B", title: "The Reading List", folder: "reading-list", solution: "ReadingList.sln",
    scaffoldVersion: 1, minValidator: "1.1.0", sdk: ".NET 10 SDK",
    summary: "A reading list in Avalonia: a data template, styles that fade what you have read, a dark switch, and bindings that keep window and data in step — built in Rider.",
    brief: [
      "One Avalonia app, `src/Reading`: `MainWindow.axaml` (yours), `Book.cs` and `ReadingList.cs` (the data the window binds to — yours to finish). Kurenai's acceptance tests for milestones 1–4 (`tests/Reading.Acceptance`) open the window headless, type and click, and read what it shows.",
      { ul: [
        "The names matter: `BookList`, `DarkToggle`, `TitleBox`, `AuthorBox`, `AddButton`, `EditTitle`, `RemoveButton`, `SummaryText`, and a resource keyed `Accent`.",
        "Set `x:DataType=\"local:ReadingList\"` on the window: the bindings are compiled and checked.",
        "`Directory.Build.props`, `tests/Reading.Acceptance/` and `.kurenai/validate.cs` are **protected**."
      ] }
    ],
    milestones: [
      { id: "m1", title: "XAML: templates and resources", lessons: ["T2.4"], about: "BookList drawn through a data template (title and author); an Accent brush resource.", checks: [{ type: "tests", class: "Milestone1" }] },
      { id: "m2", title: "Styles and themes", lessons: ["T2.5"], about: "Read books' titles carry the class done and a style fades them; DarkToggle switches the app between Dark and Light.", checks: [{ type: "tests", class: "Milestone2" }] },
      { id: "m3", title: "Binding", lessons: ["T2.6"], about: "The boxes, Add (enabled by CanAdd), the selection and the rename box — all bound, none copied by hand.", checks: [{ type: "tests", class: "Milestone3" }] },
      { id: "m4", title: "Change notification and lists", lessons: ["T2.7"], about: "Book and ReadingList notify; Books is an ObservableCollection; the summary keeps up with adding, removing and reading.", checks: [{ type: "tests", class: "Milestone4" }] },
      { id: "m5", title: "Tested, clean and committed", lessons: ["T2.7"], about: "Four or more of your own tests of ReadingList; no warnings; committed.",
        checks: [{ type: "owntests", prefix: "Reading.Tests.", min: 4 }, { type: "warnings", max: 0 }, { type: "git" }] }
    ],
    protected: ["Directory.Build.props", "tests/Reading.Acceptance/Reading.Acceptance.csproj", "tests/Reading.Acceptance/Headless.cs", "tests/Reading.Acceptance/Milestone1.cs", "tests/Reading.Acceptance/Milestone2.cs", "tests/Reading.Acceptance/Milestone3.cs", "tests/Reading.Acceptance/Milestone4.cs", ".kurenai/validate.cs"],
    reward: { xp: 120, gold: 30, hp: 8 }
  });
})();
