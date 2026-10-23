using Planner.Core;

namespace Planner.Desktop;

/// <summary>What to study next: the five lowest scores today.</summary>
public partial class NextViewModel(ITopicStore store, TimeProvider time) : ViewModelBase
{
    public ITopicStore Store { get; } = store;
    public TimeProvider Time { get; } = time;

    /// <summary>"1. Big O (cs)", one line each; empty with no topics.</summary>
    public IReadOnlyList<string> Lines => throw new NotImplementedException();
}
