using Avalonia.Controls;
using Planner.Core;
using Planner.Desktop;

namespace Planner.Acceptance;

/// <summary>Milestone 2 · validation: errors as they are typed, beside the field, and no saving until it is right.</summary>
public class Milestone2
{
    static TopicEditorViewModel New(MemoryStore? store = null, Make.Nav? nav = null) => new(store ?? Make.Three(), nav ?? new Make.Nav(), null);

    static string[] Errors(TopicEditorViewModel vm, string property) => vm.GetErrors(property).Select(e => e.ErrorMessage ?? "").ToArray();

    [AvaloniaFact]
    public void A_new_topic_cannot_be_saved_until_it_has_a_name_and_subject()
    {
        var vm = New();
        Assert.Equal(1, vm.Confidence);
        Assert.False(vm.SaveCommand.CanExecute(null));
        vm.Name = "Recursion";
        vm.Subject = "cs";
        Assert.True(vm.SaveCommand.CanExecute(null));
    }

    [AvaloniaTheory]
    [InlineData("Name", "", "Give the topic a name.")]
    [InlineData("Name", "   ", "Give the topic a name.")]
    [InlineData("Subject", "", "Choose a subject.")]
    public void Blank_fields_say_what_is_wanted(string field, string value, string message)
    {
        var vm = New();
        vm.Name = "x"; vm.Subject = "cs";
        if (field == "Name") vm.Name = value; else vm.Subject = value;
        Assert.True(vm.HasErrors);
        Assert.Contains(message, Errors(vm, field));
        Assert.False(vm.SaveCommand.CanExecute(null));
    }

    [AvaloniaFact]
    public void Names_are_at_most_sixty_characters_and_confidence_is_one_to_five()
    {
        var vm = New();
        vm.Subject = "cs";
        vm.Name = new string('a', 61);
        Assert.Contains("At most 60 characters.", Errors(vm, nameof(vm.Name)));
        vm.Name = new string('a', 60);
        Assert.Empty(Errors(vm, nameof(vm.Name)));
        vm.Confidence = 6;
        Assert.Contains("Confidence is 1 to 5.", Errors(vm, nameof(vm.Confidence)));
        Assert.False(vm.SaveCommand.CanExecute(null));
    }

    [AvaloniaFact]
    public async Task Saving_a_new_topic_adds_it_and_goes_back()
    {
        var store = Make.Three();
        var nav = new Make.Nav();
        var vm = New(store, nav);
        vm.Name = "  Recursion "; vm.Subject = " CS "; vm.Confidence = 2;
        await vm.SaveCommand.ExecuteAsync(null);
        Assert.Equal(new Topic(4, "cs", "Recursion", 2, null), store.Saved[^1]);
        Assert.Equal(1, nav.Backs);
    }

    [AvaloniaFact]
    public async Task Saving_an_edit_keeps_its_id_and_last_studied()
    {
        var store = Make.Three();
        var vm = new TopicEditorViewModel(store, new Make.Nav(), store.Saved[0]);
        vm.Name = "Big O notation"; vm.Confidence = 4;
        await vm.SaveCommand.ExecuteAsync(null);
        Assert.Equal(new Topic(1, "cs", "Big O notation", 4, new DateOnly(2026, 10, 20)), store.Saved[0]);
        Assert.Equal(3, store.Saved.Count);
    }

    [AvaloniaFact]
    public void The_editor_shows_errors_beside_the_name_and_disables_Save()
    {
        var shell = Make.Shell();
        var w = Headless.Open(shell);
        ((TopicsViewModel)shell.Current).AddCommand.Execute(null);
        Headless.Settle();
        w.TypeInPage("SubjectBox", "cs");
        w.TypeInPage("NameBox", "Recursion");
        Assert.True(w.InPage<Button>("SaveButton").IsEffectivelyEnabled);
        w.TypeInPage("NameBox", "");
        Assert.True(DataValidationErrors.GetHasErrors(w.InPage<TextBox>("NameBox")));
        Assert.False(w.InPage<Button>("SaveButton").IsEffectivelyEnabled);
    }
}
