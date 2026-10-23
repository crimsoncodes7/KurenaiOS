namespace Planner.Core;

/// <summary>Somewhere the topics are kept between runs.</summary>
public interface ITopicStore
{
    /// <summary>Every topic saved so far; an empty list when nothing is saved yet.</summary>
    Task<List<Topic>> LoadAsync(CancellationToken ct = default);

    /// <summary>Replace what is saved with these topics.</summary>
    Task SaveAsync(IReadOnlyList<Topic> topics, CancellationToken ct = default);
}
