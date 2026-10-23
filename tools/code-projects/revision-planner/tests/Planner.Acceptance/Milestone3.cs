using Planner.Core;
using Planner.Storage;

namespace Planner.Acceptance;

/// <summary>Milestone 3 · JsonTopicStore: a JSON file, async, cancellable.</summary>
public class Milestone3 : IDisposable
{
    readonly string dir = Path.Combine(Path.GetTempPath(), "kurenai-planner-" + Guid.NewGuid().ToString("N"));
    public void Dispose() { if (Directory.Exists(dir)) Directory.Delete(dir, true); }

    static readonly Topic[] Two =
    {
        new(1, "cs", "Big O", 3, new DateOnly(2026, 4, 30)),
        new(2, "maths", "Vectors \"in 3D\"")
    };

    [Fact]
    public async Task A_missing_file_loads_as_no_topics() =>
        Assert.Empty(await new JsonTopicStore(Path.Combine(dir, "none.json")).LoadAsync());

    [Fact]
    public async Task Saved_topics_load_back_the_same_in_a_new_store()
    {
        string file = Path.Combine(dir, "nested", "topics.json");
        await new JsonTopicStore(file).SaveAsync(Two);
        Assert.True(File.Exists(file), "SaveAsync creates the folder and the file");
        Assert.Equal(Two, await new JsonTopicStore(file).LoadAsync());
    }

    [Fact]
    public async Task Saving_replaces_what_was_there()
    {
        string file = Path.Combine(dir, "topics.json");
        var store = new JsonTopicStore(file);
        await store.SaveAsync(Two);
        await store.SaveAsync(new[] { Two[1] });
        Assert.Equal(new[] { Two[1] }, await store.LoadAsync());
    }

    [Fact]
    public async Task A_broken_file_is_an_InvalidDataException()
    {
        Directory.CreateDirectory(dir);
        string file = Path.Combine(dir, "broken.json");
        await File.WriteAllTextAsync(file, "{ this is not json");
        await Assert.ThrowsAsync<InvalidDataException>(() => new JsonTopicStore(file).LoadAsync());
    }

    [Fact]
    public async Task A_cancelled_token_stops_loading()
    {
        string file = Path.Combine(dir, "topics.json");
        await new JsonTopicStore(file).SaveAsync(Two);
        using var cts = new CancellationTokenSource();
        cts.Cancel();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => new JsonTopicStore(file).LoadAsync(cts.Token));
    }
}
