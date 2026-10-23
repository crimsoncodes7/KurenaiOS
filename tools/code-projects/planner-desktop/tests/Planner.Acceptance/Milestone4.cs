using Avalonia;
using Avalonia.Controls;
using Planner.Desktop;

namespace Planner.Acceptance;

/// <summary>Milestone 4 · responsive layout: the topics page side by side when wide, stacked when narrow.</summary>
public class Milestone4
{
    static (Rect List, Rect Detail) Parts(Window w)
    {
        Rect At(string n) { var c = w.InPage<Control>(n); return new Rect(c.TranslatePoint(new Point(0, 0), w)!.Value, c.Bounds.Size); }
        return (At("TopicList"), At("TopicDetail"));
    }

    static Window Showing(double width)
    {
        var shell = Make.Shell();
        var w = Headless.Open(shell, width);
        ((TopicsViewModel)shell.Current).Selected = ((TopicsViewModel)shell.Current).Topics[0];
        Headless.Settle();
        return w;
    }

    [AvaloniaFact]
    public void Wide_the_detail_sits_beside_the_list()
    {
        var (list, detail) = Parts(Showing(1000));
        Assert.True(detail.X >= list.Right, $"at 1000px the detail ({detail}) should be right of the list ({list})");
        Assert.True(Math.Abs(detail.Y - list.Y) < 40, "and level with it");
    }

    [AvaloniaFact]
    public void Narrow_the_detail_sits_under_the_list_at_full_width()
    {
        var w = Showing(600);
        var (list, detail) = Parts(w);
        Assert.True(detail.Y >= list.Bottom, $"at 600px the detail ({detail}) should be below the list ({list})");
        Assert.True(list.Width > 400 && detail.Width > 400, "both use the window's width");
    }

    [AvaloniaFact]
    public void It_changes_as_the_window_is_resized()
    {
        var w = Showing(1000);
        w.Width = 600;
        Headless.Settle();
        var (list, detail) = Parts(w);
        Assert.True(detail.Y >= list.Bottom, "narrowing the window stacks them");
        w.Width = 1000;
        Headless.Settle();
        (list, detail) = Parts(w);
        Assert.True(detail.X >= list.Right, "widening puts them side by side again");
    }

    [AvaloniaFact]
    public void The_detail_describes_the_chosen_topic()
    {
        var shell = Make.Shell();
        var topics = (TopicsViewModel)shell.Current;
        Assert.Equal("", topics.Detail);
        topics.Selected = topics.Topics[0];
        Assert.Equal("Big O · cs · confidence 3 · last studied 2026-10-20", topics.Detail);
        topics.Selected = topics.Topics[1];
        Assert.Equal("Vectors · maths · confidence 1 · last studied never", topics.Detail);
    }
}
