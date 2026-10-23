using CommunityToolkit.Mvvm.ComponentModel;

namespace Planner.Desktop;

/// <summary>Every page's view model. ObservableValidator, so a page can validate its fields.</summary>
public abstract class ViewModelBase : ObservableValidator
{
    /// <summary>Called each time the page is shown: load what it needs here.</summary>
    public virtual Task ActivateAsync() => Task.CompletedTask;
}

/// <summary>Moving between pages. The shell implements it; pages ask it to move.</summary>
public interface INavigator
{
    void GoTo(ViewModelBase page);
    void Back();
}
