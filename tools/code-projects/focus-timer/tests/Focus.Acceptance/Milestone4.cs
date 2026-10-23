using Avalonia.Controls;

namespace Focus.Acceptance;

/// <summary>Milestone 4 · settings and notifications: remembered choices, and a word when time is up.</summary>
public class Milestone4 : IDisposable
{
    readonly string folder = Path.Combine(Path.GetTempPath(), "kurenai-focus-" + Guid.NewGuid().ToString("N"));
    string File_ => Path.Combine(folder, "settings.json");
    public void Dispose() { if (Directory.Exists(folder)) Directory.Delete(folder, true); }

    [Fact]
    public void No_file_means_the_defaults() => Assert.Equal(new Settings(25, 5), new JsonSettingsStore(File_).Load());

    [Fact]
    public void Saved_settings_load_back_and_the_folder_is_made()
    {
        new JsonSettingsStore(File_).Save(new Settings(40, 10));
        Assert.Equal(new Settings(40, 10), new JsonSettingsStore(File_).Load());
    }

    [Fact]
    public void A_damaged_file_means_the_defaults()
    {
        Directory.CreateDirectory(folder);
        File.WriteAllText(File_, "{ focus: forty");
        Assert.Equal(new Settings(25, 5), new JsonSettingsStore(File_).Load());
    }

    [AvaloniaFact]
    public void The_timer_starts_from_the_saved_length_and_saves_a_new_one()
    {
        var store = new MemorySettings(new Settings(50, 10));
        var vm = Clock.Vm(Clock.Fake(), store: store);
        Assert.Equal(("50:00", 50), (vm.Remaining, vm.FocusMinutes));
        vm.FocusMinutes = 30;
        Assert.Equal(new Settings(30, 10), store.Current);
        Assert.Equal("30:00", vm.Remaining);
    }

    [AvaloniaFact]
    public void Time_up_is_announced_once()
    {
        var told = new Told();
        var time = Clock.Fake();
        var vm = Clock.Vm(time, new Settings(1, 5), notifier: told);
        vm.StartCommand.Execute(null);
        time.Tick(120);
        Assert.Equal(("Focus done", "Time for a 5-minute break."), Assert.Single(told.Said));
    }

    [AvaloniaFact]
    public void The_window_counts_down_from_Start()
    {
        var time = Clock.Fake();
        var vm = Clock.Vm(time);
        var w = Headless.Open(vm);
        Assert.Equal("25:00", w.Shown("RemainingText"));
        w.Click("StartButton");
        time.Tick(5);
        Assert.Equal("24:55", w.Shown("RemainingText"));
        Assert.False(w.Named<Button>("StartButton").IsEffectivelyEnabled);
        w.Click("PauseButton");
        Assert.True(w.Named<Button>("StartButton").IsEffectivelyEnabled);
        Assert.Equal(25, (int)(w.Named<NumericUpDown>("FocusMinutesBox").Value ?? 0));
    }
}
