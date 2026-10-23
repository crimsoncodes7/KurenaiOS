using System.Text.Json;

namespace Planner.Core;

/// <summary>The topics as one JSON file.</summary>
public class JsonTopicStore(string path) : ITopicStore
{
    public string FilePath { get; } = path;

    public async Task<List<Topic>> LoadAsync(CancellationToken ct = default)
    {
        if (!File.Exists(FilePath)) return new List<Topic>();
        await using var stream = File.OpenRead(FilePath);
        try { return await JsonSerializer.DeserializeAsync<List<Topic>>(stream, cancellationToken: ct) ?? new List<Topic>(); }
        catch (JsonException e) { throw new InvalidDataException($"{FilePath} is not a topics file.", e); }
    }

    public async Task SaveAsync(IReadOnlyList<Topic> topics, CancellationToken ct = default)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(FilePath))!);
        await using var stream = File.Create(FilePath);
        await JsonSerializer.SerializeAsync(stream, topics, cancellationToken: ct);
    }
}
