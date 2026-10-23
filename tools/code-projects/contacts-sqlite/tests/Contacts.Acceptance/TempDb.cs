namespace Contacts.Acceptance;

/// <summary>A database file of its own for each test, deleted afterwards.</summary>
public sealed class TempDb : IDisposable
{
    public string Path { get; } = System.IO.Path.Combine(System.IO.Path.GetTempPath(), "kurenai-contacts-" + Guid.NewGuid().ToString("N") + ".db");
    public void Dispose() { if (File.Exists(Path)) File.Delete(Path); }
}
