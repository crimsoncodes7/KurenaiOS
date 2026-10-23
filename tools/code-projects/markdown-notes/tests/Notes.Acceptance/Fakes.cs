namespace Notes.Acceptance;

/// <summary>A store in memory: what was saved, and what to load.</summary>
public sealed class MemoryStore : INoteStore
{
    public List<string> Saved { get; private set; } = new();
    public int Saves { get; private set; }
    public Task<IReadOnlyList<string>> LoadAllAsync(CancellationToken ct = default) => Task.FromResult<IReadOnlyList<string>>(Saved.ToList());
    public Task SaveAllAsync(IReadOnlyList<string> notes, CancellationToken ct = default) { Saved = notes.ToList(); Saves++; return Task.CompletedTask; }
}

/// <summary>Dialogs that answer as told, and remember the questions.</summary>
public sealed class Answers(bool yes) : IDialogs
{
    public List<string> Asked { get; } = new();
    public Task<bool> ConfirmAsync(string question) { Asked.Add(question); return Task.FromResult(yes); }
}
