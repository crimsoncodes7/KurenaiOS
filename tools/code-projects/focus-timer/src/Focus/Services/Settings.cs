namespace Focus;

/// <summary>What the user chose, remembered between runs.</summary>
public record Settings(int FocusMinutes = 25, int BreakMinutes = 5);

public interface ISettingsStore
{
    Settings Load();
    void Save(Settings settings);
}

/// <summary>Settings as a JSON file (milestone 4). Yours to build.</summary>
public class JsonSettingsStore(string path) : ISettingsStore
{
    public string FilePath { get; } = path;
    public Settings Load() => throw new NotImplementedException();
    public void Save(Settings settings) => throw new NotImplementedException();
}
