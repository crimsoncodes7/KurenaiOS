namespace Notes;

/// <summary>The notes as .md files in one folder (milestone 3). Yours to build.</summary>
public class FolderNoteStore(string folder) : INoteStore
{
    public string Folder { get; } = folder;

    /// <summary>The file name for the note at a position: "01-shopping-list.md".</summary>
    public static string FileName(int position, string text) => throw new NotImplementedException();

    public Task<IReadOnlyList<string>> LoadAllAsync(CancellationToken ct = default) => throw new NotImplementedException();

    public Task SaveAllAsync(IReadOnlyList<string> notes, CancellationToken ct = default) => throw new NotImplementedException();
}
