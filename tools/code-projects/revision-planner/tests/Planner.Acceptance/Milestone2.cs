using Planner.Core;

namespace Planner.Acceptance;

/// <summary>Milestone 2 · StudyPlanner: add, rate and what to study next.</summary>
public class Milestone2
{
    sealed class FixedClock(DateOnly today) : IClock
    {
        public DateOnly Today => today;
    }

    sealed class MemoryStore : ITopicStore
    {
        public List<Topic> Saved { get; private set; } = new();
        public int Saves { get; private set; }
        public Task<List<Topic>> LoadAsync(CancellationToken ct = default) => Task.FromResult(new List<Topic>(Saved));
        public Task SaveAsync(IReadOnlyList<Topic> topics, CancellationToken ct = default)
        {
            Saved = new List<Topic>(topics);
            Saves++;
            return Task.CompletedTask;
        }
    }

    static readonly DateOnly Today = new(2026, 5, 1);
    static (StudyPlanner Planner, MemoryStore Store) Make() { var s = new MemoryStore(); return (new StudyPlanner(s, new FixedClock(Today)), s); }

    [Fact]
    public async Task Adding_numbers_topics_from_one_and_saves_them()
    {
        var (planner, store) = Make();
        var a = await planner.AddAsync("cs", "Big O");
        var b = await planner.AddAsync(" Maths ", " Vectors ");
        Assert.Equal(new Topic(1, "cs", "Big O"), a);
        Assert.Equal(new Topic(2, "maths", "Vectors"), b);
        Assert.Equal(new[] { a, b }, store.Saved);
    }

    [Fact]
    public async Task A_blank_name_or_a_repeat_in_the_same_subject_is_refused()
    {
        var (planner, store) = Make();
        await planner.AddAsync("cs", "Big O");
        await Assert.ThrowsAsync<ArgumentException>(() => planner.AddAsync("cs", "  "));
        await Assert.ThrowsAsync<InvalidOperationException>(() => planner.AddAsync("CS", "big o"));
        await planner.AddAsync("maths", "Big O");
        Assert.Equal(2, store.Saved.Count);
    }

    [Fact]
    public async Task Rating_sets_the_confidence_and_today_as_last_studied()
    {
        var (planner, store) = Make();
        await planner.AddAsync("cs", "Big O");
        var rated = await planner.RateAsync(1, 4);
        Assert.Equal(new Topic(1, "cs", "Big O", 4, Today), rated);
        Assert.Equal(rated, Assert.Single(store.Saved));
    }

    [Fact]
    public async Task Rating_refuses_a_bad_confidence_or_an_unknown_topic()
    {
        var (planner, _) = Make();
        await planner.AddAsync("cs", "Big O");
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => planner.RateAsync(1, 0));
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => planner.RateAsync(1, 6));
        await Assert.ThrowsAsync<KeyNotFoundException>(() => planner.RateAsync(9, 3));
    }

    [Fact]
    public async Task Next_puts_the_lowest_score_first_and_breaks_ties_by_name()
    {
        var (planner, store) = Make();
        await store.SaveAsync(new[]
        {
            new Topic(1, "cs", "Stacks", 2, Today.AddDays(-3)),     // 197
            new Topic(2, "cs", "Big O", 1, Today),                  // 100
            new Topic(3, "maths", "Vectors", 2),                    // 170
            new Topic(4, "cs", "Hashing", 2, Today.AddDays(-45)),   // 170
            new Topic(5, "maths", "Proof", 5, Today.AddDays(-30))   // 470
        });
        var next = await planner.NextAsync(4);
        Assert.Equal(new[] { 2, 4, 3, 1 }, next.Select(t => t.Id));
        Assert.Equal(5, (await planner.NextAsync(10)).Count);
    }

    [Fact]
    public async Task Next_changes_nothing_and_refuses_less_than_one()
    {
        var (planner, store) = Make();
        await planner.AddAsync("cs", "Big O");
        int saves = store.Saves;
        await planner.NextAsync(3);
        Assert.Equal(saves, store.Saves);
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => planner.NextAsync(0));
    }
}
