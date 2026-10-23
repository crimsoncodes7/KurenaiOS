using System.ComponentModel;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Input;

namespace Notes.Acceptance;

/// <summary>Milestone 2 · MVVM: a note's title and words follow its text, and the window is
/// nothing but bindings to the view model.</summary>
public class Milestone2
{
    [Theory]
    [InlineData("# Shopping list\nmilk", "Shopping list", "3 words")]
    [InlineData("\n\n  ## Ideas  \n", "Ideas", "1 word")]
    [InlineData("plain first line", "plain first line", "3 words")]
    [InlineData("", "Untitled", "No words")]
    [InlineData("one", "one", "1 word")]
    public void Title_and_words_come_from_the_text(string text, string title, string words)
    {
        var note = new NoteViewModel(text);
        Assert.Equal((title, words), (note.Title, note.Words));
    }

    [Fact]
    public void Changing_the_text_announces_the_title_and_words()
    {
        var note = new NoteViewModel();
        var heard = new List<string?>();
        ((INotifyPropertyChanged)note).PropertyChanged += (_, e) => heard.Add(e.PropertyName);
        note.Text = "# Hello";
        Assert.Contains("Text", heard);
        Assert.Contains("Title", heard);
        Assert.Contains("Words", heard);
    }

    [AvaloniaFact]
    public void Clicking_New_then_typing_shows_the_title_in_the_list()
    {
        var vm = new MainViewModel(new MemoryStore(), new Answers(true));
        var w = Headless.Open(vm);
        w.Click("NewButton");
        Assert.Single(vm.Notes);
        w.Type("Editor", "# Shopping\nmilk and eggs");
        Assert.Equal("# Shopping\nmilk and eggs", vm.Notes[0].Text);
        Assert.Contains("Shopping", w.ItemTexts("NoteList", 0));
        Assert.Equal("4 words", w.Shown("WordCount"));
    }

    [AvaloniaFact]
    public void Ctrl_N_makes_a_note_too()
    {
        var vm = new MainViewModel(new MemoryStore(), new Answers(true));
        var w = Headless.Open(vm);
        w.KeyPressQwerty(PhysicalKey.N, RawInputModifiers.Control);
        Headless.Settle();
        Assert.Single(vm.Notes);
    }

    [AvaloniaFact]
    public void The_delete_button_follows_the_command()
    {
        var vm = new MainViewModel(new MemoryStore(), new Answers(true));
        var w = Headless.Open(vm);
        Assert.False(w.Named<Button>("DeleteButton").IsEffectivelyEnabled);
        w.Click("NewButton");
        Assert.True(w.Named<Button>("DeleteButton").IsEffectivelyEnabled);
        w.Click("DeleteButton");
        Assert.Empty(vm.Notes);
        Assert.False(w.Named<Button>("DeleteButton").IsEffectivelyEnabled);
    }

    [AvaloniaFact]
    public void Choosing_a_note_in_the_list_opens_it_in_the_editor()
    {
        var vm = new MainViewModel(new MemoryStore(), new Answers(true));
        var w = Headless.Open(vm);
        w.Click("NewButton"); w.Type("Editor", "first");
        w.Click("NewButton"); w.Type("Editor", "second");
        w.Named<ListBox>("NoteList").SelectedIndex = 0;
        Headless.Settle();
        Assert.Same(vm.Notes[0], vm.Selected);
        Assert.Equal("first", w.Named<TextBox>("Editor").Text);
    }
}
