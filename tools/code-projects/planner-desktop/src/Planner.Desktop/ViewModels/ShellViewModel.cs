using CommunityToolkit.Mvvm.Input;
using Planner.Core;

namespace Planner.Desktop;

/// <summary>The window's view model: which page is showing, and the way back (milestone 1).</summary>
public partial class ShellViewModel(ITopicStore store, TimeProvider time) : ViewModelBase, INavigator
{
    public ITopicStore Store { get; } = store;
    public TimeProvider Time { get; } = time;

    public ViewModelBase Current => throw new NotImplementedException();
    public bool CanGoBack => throw new NotImplementedException();

    public void GoTo(ViewModelBase page) => throw new NotImplementedException();
    public void Back() => throw new NotImplementedException();

    public IRelayCommand BackCommand => throw new NotImplementedException();
    public IRelayCommand ShowTopicsCommand => throw new NotImplementedException();
    public IRelayCommand ShowNextCommand => throw new NotImplementedException();
}
