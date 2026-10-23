using Avalonia.Controls;
using Avalonia.VisualTree;
using Planner.Desktop;

namespace Planner.Acceptance;

/// <summary>Milestone 1 · navigation: one window, pages that come and go, and a way back.</summary>
public class Milestone1
{
    [AvaloniaFact]
    public void It_opens_on_the_topics_page_with_the_topics_loaded()
    {
        var shell = Make.Shell();
        var topics = Assert.IsType<TopicsViewModel>(shell.Current);
        Assert.Equal(new[] { "Big O", "Vectors", "Hash tables" }, topics.Topics.Select(t => t.Name));
        Assert.False(shell.CanGoBack);
        Assert.False(shell.BackCommand.CanExecute(null));
    }

    [AvaloniaFact]
    public void Next_then_Back_returns_to_the_topics()
    {
        var shell = Make.Shell();
        var topics = shell.Current;
        shell.ShowNextCommand.Execute(null);
        Assert.IsType<NextViewModel>(shell.Current);
        Assert.True(shell.BackCommand.CanExecute(null));
        shell.BackCommand.Execute(null);
        Assert.Same(topics, shell.Current);
    }

    [AvaloniaFact]
    public void Add_opens_an_empty_editor_and_Cancel_comes_back()
    {
        var shell = Make.Shell();
        var topics = (TopicsViewModel)shell.Current;
        topics.AddCommand.Execute(null);
        var editor = Assert.IsType<TopicEditorViewModel>(shell.Current);
        Assert.Null(editor.Editing);
        editor.CancelCommand.Execute(null);
        Assert.Same(topics, shell.Current);
    }

    [AvaloniaFact]
    public void Edit_opens_the_editor_on_the_chosen_topic()
    {
        var shell = Make.Shell();
        var topics = (TopicsViewModel)shell.Current;
        Assert.False(topics.EditCommand.CanExecute(null));
        topics.Selected = topics.Topics[2];
        Assert.True(topics.EditCommand.CanExecute(null));
        topics.EditCommand.Execute(null);
        var editor = Assert.IsType<TopicEditorViewModel>(shell.Current);
        Assert.Equal(("Hash tables", "cs", 2), (editor.Name, editor.Subject, editor.Confidence));
    }

    [AvaloniaFact]
    public void The_window_shows_the_view_for_each_page()
    {
        var shell = Make.Shell();
        var w = Headless.Open(shell);
        var page = w.Named<ContentControl>("Page");
        Assert.NotEmpty(page.GetVisualDescendants().OfType<TopicsView>());
        w.Click("NextTab");
        Assert.NotEmpty(page.GetVisualDescendants().OfType<NextView>());
        Assert.Contains("1. Vectors (maths)", ((NextViewModel)shell.Current).Lines);
        w.Click("BackButton");
        Assert.NotEmpty(page.GetVisualDescendants().OfType<TopicsView>());
    }

    [AvaloniaFact]
    public void Next_lists_the_five_lowest_scores()
    {
        var shell = Make.Shell();
        shell.ShowNextCommand.Execute(null);
        Assert.Equal(new[] { "1. Vectors (maths)", "2. Hash tables (cs)", "3. Big O (cs)" }, ((NextViewModel)shell.Current).Lines);
    }
}
