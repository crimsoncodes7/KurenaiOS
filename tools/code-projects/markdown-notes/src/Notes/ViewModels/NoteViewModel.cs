namespace Notes;

/// <summary>One note. Milestone 2: an ObservableObject whose Title and Words follow Text.</summary>
public class NoteViewModel(string text = "")
{
    public string Text { get; set; } = text;

    /// <summary>The first line with text, without leading '#' marks and spaces; "Untitled" if none.</summary>
    public string Title => throw new NotImplementedException();

    /// <summary>"No words", "1 word", "12 words".</summary>
    public string Words => throw new NotImplementedException();
}
