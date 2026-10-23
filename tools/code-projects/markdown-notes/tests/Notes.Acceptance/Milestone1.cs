using System.ComponentModel;

namespace Notes.Acceptance;

/// <summary>Milestone 1 · commands: New, and a Delete that knows when it can run and asks first.</summary>
public class Milestone1
{
    static MainViewModel Vm(bool yes = true) => new(new MemoryStore(), new Answers(yes));

    [Fact]
    public void New_adds_an_empty_note_and_selects_it()
    {
        var vm = Vm();
        vm.NewCommand.Execute(null);
        vm.NewCommand.Execute(null);
        Assert.Equal(2, vm.Notes.Count);
        Assert.Same(vm.Notes[1], vm.Selected);
        Assert.Equal("", vm.Selected!.Text);
    }

    [Fact]
    public void Delete_can_run_only_with_a_note_selected()
    {
        var vm = Vm();
        Assert.False(vm.DeleteCommand.CanExecute(null));
        var changed = 0;
        vm.DeleteCommand.CanExecuteChanged += (_, _) => changed++;
        vm.NewCommand.Execute(null);
        Assert.True(vm.DeleteCommand.CanExecute(null));
        Assert.True(changed > 0, "DeleteCommand should raise CanExecuteChanged when the selection changes");
        vm.Selected = null;
        Assert.False(vm.DeleteCommand.CanExecute(null));
    }

    [Fact]
    public async Task Delete_asks_first_and_keeps_the_note_on_no()
    {
        var answers = new Answers(false);
        var vm = new MainViewModel(new MemoryStore(), answers);
        vm.NewCommand.Execute(null);
        vm.Selected!.Text = "# Shopping\nmilk";
        await vm.DeleteCommand.ExecuteAsync(null);
        Assert.Single(vm.Notes);
        Assert.Equal("Delete “Shopping”?", Assert.Single(answers.Asked));
    }

    [Fact]
    public async Task Delete_on_yes_removes_the_note_and_selects_a_neighbour()
    {
        var vm = Vm();
        for (int i = 0; i < 3; i++) vm.NewCommand.Execute(null);
        vm.Selected = vm.Notes[1];
        var gone = vm.Notes[1];
        await vm.DeleteCommand.ExecuteAsync(null);
        Assert.DoesNotContain(gone, vm.Notes);
        Assert.Same(vm.Notes[1], vm.Selected);
        vm.Selected = vm.Notes[1];
        await vm.DeleteCommand.ExecuteAsync(null);
        Assert.Same(vm.Notes[0], vm.Selected);
        await vm.DeleteCommand.ExecuteAsync(null);
        Assert.Null(vm.Selected);
    }

    [Fact]
    public void The_view_model_announces_the_selection()
    {
        var vm = Vm();
        Assert.IsAssignableFrom<INotifyPropertyChanged>(vm);
        var heard = new List<string?>();
        ((INotifyPropertyChanged)vm).PropertyChanged += (_, e) => heard.Add(e.PropertyName);
        vm.NewCommand.Execute(null);
        Assert.Contains("Selected", heard);
    }
}
