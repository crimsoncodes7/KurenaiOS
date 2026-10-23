namespace Notes;

/// <summary>Where the notes live between runs: each note is the text of one Markdown file.</summary>
public interface INoteStore
{
    Task<IReadOnlyList<string>> LoadAllAsync(CancellationToken ct = default);
    Task SaveAllAsync(IReadOnlyList<string> notes, CancellationToken ct = default);
}
