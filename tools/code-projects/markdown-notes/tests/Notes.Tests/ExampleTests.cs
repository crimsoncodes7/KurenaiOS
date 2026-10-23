namespace Notes.Tests;

public class ExampleTests
{
    [Fact]
    public void A_note_keeps_its_text() => Assert.Equal("# Hi", new NoteViewModel("# Hi").Text);
}
