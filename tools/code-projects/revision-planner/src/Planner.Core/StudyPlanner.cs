namespace Planner.Core;

/// <summary>The service: add topics, rate them, and ask what to study next.
/// Every method loads from the store and saves what it changes.</summary>
public class StudyPlanner
{
    private readonly ITopicStore store;
    private readonly IClock clock;

    public StudyPlanner(ITopicStore store, IClock clock)
    {
        this.store = store;
        this.clock = clock;
    }

    /// <summary>Milestone 2: a new topic with the next id, confidence 1, never studied.</summary>
    public Task<Topic> AddAsync(string subject, string name, CancellationToken ct = default) =>
        throw new NotImplementedException("Milestone 2: write the tests first, then this.");

    /// <summary>Milestone 2: set a topic's confidence (1–5); it was studied today.</summary>
    public Task<Topic> RateAsync(int id, int confidence, CancellationToken ct = default) =>
        throw new NotImplementedException("Milestone 2");

    /// <summary>Milestone 2: the n topics to study next, best first, using a PriorityQueue.</summary>
    public Task<IReadOnlyList<Topic>> NextAsync(int n, CancellationToken ct = default) =>
        throw new NotImplementedException("Milestone 2");
}
