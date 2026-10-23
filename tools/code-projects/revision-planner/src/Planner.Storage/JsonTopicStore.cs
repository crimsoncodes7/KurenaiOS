using Planner.Core;

namespace Planner.Storage;

/// <summary>Keeps the topics in one JSON file (milestone 3).</summary>
public class JsonTopicStore : ITopicStore
{
    public JsonTopicStore(string filePath) => FilePath = filePath;

    public string FilePath { get; }

    public Task<List<Topic>> LoadAsync(CancellationToken ct = default) =>
        throw new NotImplementedException("Milestone 3");

    public Task SaveAsync(IReadOnlyList<Topic> topics, CancellationToken ct = default) =>
        throw new NotImplementedException("Milestone 3");
}
