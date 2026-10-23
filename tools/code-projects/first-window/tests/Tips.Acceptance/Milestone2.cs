using Avalonia;
using Avalonia.Controls;
using Avalonia.Threading;

namespace Tips.Acceptance;

/// <summary>Milestone 2 · laid out: labelled, in the window, nothing on top of anything
/// else, narrow or wide.</summary>
public class Milestone2
{
    static readonly string[] Parts = { "BillBox", "PeopleBox", "Tip10", "Tip15", "Tip20", "TipText", "TotalText", "EachText" };

    static Rect BoundsIn(Window w, Control c) =>
        new(c.TranslatePoint(new Point(0, 0), w) ?? throw new Xunit.Sdk.XunitException(c.Name + " is not in the window"), c.Bounds.Size);

    [AvaloniaFact]
    public void Each_box_has_a_label_that_targets_it()
    {
        var w = Headless.Open();
        var labels = w.GetLogicalDescendants().OfType<Label>().ToList();
        foreach (var box in new[] { "BillBox", "PeopleBox" })
            Assert.Contains(labels, l => ReferenceEquals(l.Target, w.Named<TextBox>(box)));
    }

    [AvaloniaTheory]
    [InlineData(320)]
    [InlineData(420)]
    [InlineData(800)]
    public void Everything_fits_and_nothing_overlaps(double width)
    {
        var w = Headless.Open(width);
        var rects = Parts.Select(n => (n, r: BoundsIn(w, w.Named<Control>(n)))).ToList();
        foreach (var (n, r) in rects)
        {
            Assert.True(r.Width > 0 && r.Height > 0, $"{n} has no size at {width}px");
            Assert.True(r.X >= 0 && r.Right <= width + 0.5, $"{n} runs outside the window at {width}px");
        }
        for (int i = 0; i < rects.Count; i++)
            for (int j = i + 1; j < rects.Count; j++)
                Assert.False(rects[i].r.Intersects(rects[j].r), $"{rects[i].n} and {rects[j].n} overlap at {width}px");
    }

    [AvaloniaFact]
    public void The_boxes_widen_with_the_window()
    {
        var narrow = Headless.Open(320).Named<TextBox>("BillBox").Bounds.Width;
        var wide = Headless.Open(800).Named<TextBox>("BillBox").Bounds.Width;
        Assert.True(wide > narrow + 100, $"the bill box is {narrow:0}px wide at 320 and {wide:0}px at 800: let it stretch");
    }
}
