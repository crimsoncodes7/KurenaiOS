using CommunityToolkit.Mvvm.Input;
using Planner.Core;

namespace Planner.Desktop;

/// <summary>Adding or editing one topic, validated as it is typed (milestone 2).</summary>
public partial class TopicEditorViewModel(ITopicStore store, INavigator nav, Topic? editing) : ViewModelBase
{
    public ITopicStore Store { get; } = store;
    public INavigator Nav { get; } = nav;
    public Topic? Editing { get; } = editing;

    public string Name { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
    public string Subject { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
    public int Confidence { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public IAsyncRelayCommand SaveCommand => throw new NotImplementedException();
    public IRelayCommand CancelCommand => throw new NotImplementedException();
}
