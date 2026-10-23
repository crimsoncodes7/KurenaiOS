using Avalonia.Automation;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.LogicalTree;
using Avalonia.VisualTree;
using Planner.Desktop;

namespace Planner.Acceptance;

/// <summary>Milestone 3 · accessibility: every control named, a sensible Tab order, and the keyboard alone is enough.</summary>
public class Milestone3
{
    static void EveryControlIsNamed(Window w, string page)
    {
        var labelled = w.GetLogicalDescendants().OfType<Label>().Select(l => l.Target).OfType<Control>().ToHashSet();
        var controls = w.Named<ContentControl>("Page").GetVisualDescendants().OfType<Control>()
            .Where(c => c is TextBox or ComboBox or NumericUpDown or ListBox or Button or CheckBox)
            .Where(c => c.IsEffectivelyVisible && c.TemplatedParent is null);
        foreach (var c in controls)
        {
            bool named = !string.IsNullOrWhiteSpace(AutomationProperties.GetName(c)) || labelled.Contains(c)
                || (c is Button { Content: string s } && s.Trim().Length > 0);
            Assert.True(named, $"{page}: the {c.GetType().Name} {c.Name} has no accessible name (a Label targeting it, AutomationProperties.Name, or text content)");
        }
    }

    [AvaloniaFact]
    public void Every_control_on_every_page_has_a_name()
    {
        var shell = Make.Shell();
        var w = Headless.Open(shell);
        EveryControlIsNamed(w, "Topics");
        ((TopicsViewModel)shell.Current).AddCommand.Execute(null);
        Headless.Settle();
        EveryControlIsNamed(w, "Editor");
        shell.ShowNextCommand.Execute(null);
        Headless.Settle();
        EveryControlIsNamed(w, "Next");
    }

    [AvaloniaFact]
    public void Tab_goes_name_subject_confidence_save_cancel()
    {
        var shell = Make.Shell();
        var w = Headless.Open(shell);
        ((TopicsViewModel)shell.Current).AddCommand.Execute(null);
        Headless.Settle();
        w.TypeInPage("NameBox", "Recursion");   // a valid topic, so Save is enabled and takes focus
        w.TypeInPage("SubjectBox", "cs");
        w.InPage<TextBox>("NameBox").Focus();
        // a NumericUpDown is focused through the text box inside its template: name the NumericUpDown
        string? Who(Control? c) => c?.FindAncestorOfType<NumericUpDown>()?.Name ?? c?.Name;
        var order = new List<string?> { Who(w.Focused()) };
        for (int i = 0; i < 4; i++) { w.Press(PhysicalKey.Tab); order.Add(Who(w.Focused())); }
        Assert.Equal(new[] { "NameBox", "SubjectBox", "ConfidenceBox", "SaveButton", "CancelButton" }, order);
    }

    [AvaloniaFact]
    public void Escape_cancels_the_editor()
    {
        var shell = Make.Shell();
        var w = Headless.Open(shell);
        ((TopicsViewModel)shell.Current).AddCommand.Execute(null);
        Headless.Settle();
        w.InPage<TextBox>("NameBox").Focus();
        w.Press(PhysicalKey.Escape);
        Assert.IsType<TopicsViewModel>(shell.Current);
    }

    [AvaloniaFact]
    public void The_editor_puts_the_cursor_in_the_name()
    {
        var shell = Make.Shell();
        var w = Headless.Open(shell);
        ((TopicsViewModel)shell.Current).AddCommand.Execute(null);
        Headless.Settle();
        Assert.Equal("NameBox", w.Focused()?.Name);
    }
}
