using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.Input;
using Planner.Core;

namespace Planner.Desktop;

/// <summary>The list of topics, the chosen one's details, and the ways to add and edit.</summary>
public partial class TopicsViewModel(ITopicStore store, INavigator nav) : ViewModelBase
{
    public ITopicStore Store { get; } = store;
    public INavigator Nav { get; } = nav;

    public ObservableCollection<Topic> Topics { get; } = new();
    public Topic? Selected { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    /// <summary>"Big O · cs · confidence 3 · last studied 2026-10-20" ("never" if not studied); "" with none chosen.</summary>
    public string Detail => throw new NotImplementedException();

    public IRelayCommand AddCommand => throw new NotImplementedException();
    public IRelayCommand EditCommand => throw new NotImplementedException();
}
