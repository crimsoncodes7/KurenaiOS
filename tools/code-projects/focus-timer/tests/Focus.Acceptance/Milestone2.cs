namespace Focus.Acceptance;

/// <summary>Milestone 2 · async UI: a timer that counts down without ever blocking, paused and resumed.</summary>
public class Milestone2
{
    [AvaloniaFact]
    public void It_starts_at_the_focus_length_not_running()
    {
        var vm = Clock.Vm(Clock.Fake());
        Assert.Equal(("Focus", "25:00", false), (vm.Phase, vm.Remaining, vm.IsRunning));
        Assert.True(vm.StartCommand.CanExecute(null));
        Assert.False(vm.PauseCommand.CanExecute(null));
    }

    [AvaloniaFact]
    public void Started_it_counts_down_by_the_clock()
    {
        var time = Clock.Fake();
        var vm = Clock.Vm(time);
        vm.StartCommand.Execute(null);
        Assert.True(vm.IsRunning);
        Assert.False(vm.StartCommand.CanExecute(null));
        Assert.True(vm.PauseCommand.CanExecute(null));
        time.Tick(1);
        Assert.Equal("24:59", vm.Remaining);
        time.Tick(59 + 60);
        Assert.Equal("23:00", vm.Remaining);
    }

    [AvaloniaFact]
    public void Pausing_holds_the_time_and_Start_carries_on()
    {
        var time = Clock.Fake();
        var vm = Clock.Vm(time);
        vm.StartCommand.Execute(null);
        time.Tick(90);
        vm.PauseCommand.Execute(null);
        Assert.False(vm.IsRunning);
        time.Tick(300);
        Assert.Equal("23:30", vm.Remaining);
        vm.StartCommand.Execute(null);
        time.Tick(30);
        Assert.Equal("23:00", vm.Remaining);
    }

    [AvaloniaFact]
    public void At_zero_it_moves_to_the_break_and_stops()
    {
        var time = Clock.Fake();
        var vm = Clock.Vm(time, new Settings(1, 2));
        vm.StartCommand.Execute(null);
        time.Tick(60);
        Assert.Equal(("Break", "02:00", false), (vm.Phase, vm.Remaining, vm.IsRunning));
        vm.StartCommand.Execute(null);
        time.Tick(120);
        Assert.Equal(("Focus", "01:00", false), (vm.Phase, vm.Remaining, vm.IsRunning));
    }
}
