using Microsoft.Extensions.Time.Testing;
using Planner.Core;
using Planner.Desktop;

namespace Planner.Acceptance;

public sealed class MemoryStore(params Topic[] topics) : ITopicStore
{
    public List<Topic> Saved { get; private set; } = topics.ToList();
    public Task<List<Topic>> LoadAsync(CancellationToken ct = default) => Task.FromResult(Saved.ToList());
    public Task SaveAsync(IReadOnlyList<Topic> topics, CancellationToken ct = default) { Saved = topics.ToList(); return Task.CompletedTask; }
}

public static class Make
{
    public static readonly DateOnly Today = new(2026, 10, 23);
    public static FakeTimeProvider Clock() => new(new DateTimeOffset(2026, 10, 23, 9, 0, 0, TimeSpan.Zero));

    public static MemoryStore Three() => new(
        new Topic(1, "cs", "Big O", 3, new DateOnly(2026, 10, 20)),
        new Topic(2, "maths", "Vectors", 1),
        new Topic(3, "cs", "Hash tables", 2, new DateOnly(2026, 10, 1)));

    public static ShellViewModel Shell(MemoryStore? store = null) => new(store ?? Three(), Clock());

    /// <summary>A navigator that only remembers where it was sent.</summary>
    public sealed class Nav : INavigator
    {
        public List<ViewModelBase> Went { get; } = new();
        public int Backs { get; private set; }
        public void GoTo(ViewModelBase page) => Went.Add(page);
        public void Back() => Backs++;
    }
}
