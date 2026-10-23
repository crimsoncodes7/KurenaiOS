using Avalonia.Controls;
using Avalonia.Threading;

namespace Tips.Acceptance;

/// <summary>Milestone 3 · events: the answer follows every change, as the user types.</summary>
public class Milestone3
{
    [AvaloniaFact]
    public void Typing_a_bill_and_the_people_shows_the_split()
    {
        var w = Headless.Open();
        w.Type("BillBox", "42.50");
        w.Type("PeopleBox", "3");
        Assert.Equal(("£6.38", "£48.88", "£16.30"), (w.Shown("TipText"), w.Shown("TotalText"), w.Shown("EachText")));
        Assert.Equal("", w.Shown("Message"));
    }

    [AvaloniaFact]
    public void Choosing_another_tip_updates_at_once()
    {
        var w = Headless.Open();
        w.Type("BillBox", "80");
        w.Type("PeopleBox", "2");
        w.Named<RadioButton>("Tip20").IsChecked = true;
        Dispatcher.UIThread.RunJobs();
        Assert.Equal(("£16.00", "£96.00", "£48.00"), (w.Shown("TipText"), w.Shown("TotalText"), w.Shown("EachText")));
        w.Named<RadioButton>("Tip10").IsChecked = true;
        Dispatcher.UIThread.RunJobs();
        Assert.Equal("£88.00", w.Shown("TotalText"));
    }

    [AvaloniaFact]
    public void One_person_is_the_default()
    {
        var w = Headless.Open();
        w.Type("BillBox", "10");
        Assert.Equal(("£1.50", "£11.50", "£11.50"), (w.Shown("TipText"), w.Shown("TotalText"), w.Shown("EachText")));
    }

    [AvaloniaTheory]
    [InlineData("BillBox", "abc", "Enter the bill as a number, like 42.50.")]
    [InlineData("BillBox", "-5", "Enter the bill as a number, like 42.50.")]
    [InlineData("PeopleBox", "0", "Enter how many people, 1 or more.")]
    [InlineData("PeopleBox", "two", "Enter how many people, 1 or more.")]
    public void Nonsense_clears_the_answer_and_says_why(string box, string text, string message)
    {
        var w = Headless.Open();
        w.Type("BillBox", "42.50");
        w.Type(box, text);
        Assert.Equal(("—", "—", "—"), (w.Shown("TipText"), w.Shown("TotalText"), w.Shown("EachText")));
        Assert.Equal(message, w.Shown("Message"));
    }

    [AvaloniaFact]
    public void Fixing_the_input_brings_the_answer_back()
    {
        var w = Headless.Open();
        w.Type("BillBox", "x");
        w.Type("BillBox", "20");
        Assert.Equal("£23.00", w.Shown("TotalText"));
        Assert.Equal("", w.Shown("Message"));
    }
}
