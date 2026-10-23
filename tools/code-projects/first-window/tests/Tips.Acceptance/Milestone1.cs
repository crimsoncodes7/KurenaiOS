using Avalonia.Controls;

namespace Tips.Acceptance;

/// <summary>Milestone 1 · a window with the controls the brief names.</summary>
public class Milestone1
{
    [AvaloniaFact]
    public void The_window_is_called_Tip_calculator()
    {
        Assert.Equal("Tip calculator", Headless.Open().Title);
    }

    [AvaloniaFact]
    public void It_has_a_box_for_the_bill_and_one_for_the_people()
    {
        var w = Headless.Open();
        w.Named<TextBox>("BillBox");
        w.Named<TextBox>("PeopleBox");
    }

    [AvaloniaFact]
    public void It_offers_three_tips_in_one_group_with_15_percent_chosen()
    {
        var w = Headless.Open();
        var tips = new[] { "Tip10", "Tip15", "Tip20" }.Select(n => w.Named<RadioButton>(n)).ToList();
        Assert.Equal(new bool?[] { false, true, false }, tips.Select(t => t.IsChecked));
        tips[2].IsChecked = true;
        Assert.Equal(new bool?[] { false, false, true }, tips.Select(t => t.IsChecked));
    }

    [AvaloniaFact]
    public void It_has_somewhere_to_show_the_tip_the_total_each_share_and_a_message()
    {
        var w = Headless.Open();
        foreach (var n in new[] { "TipText", "TotalText", "EachText", "Message" }) w.Named<TextBlock>(n);
    }
}
