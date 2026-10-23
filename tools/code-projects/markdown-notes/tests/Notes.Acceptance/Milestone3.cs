namespace Notes.Acceptance;

/// <summary>Milestone 3 · files: the notes as .md files in a folder, saved and loaded through the view model.</summary>
public class Milestone3 : IDisposable
{
    readonly string folder = Path.Combine(Path.GetTempPath(), "kurenai-notes-" + Guid.NewGuid().ToString("N"));
    public void Dispose() { if (Directory.Exists(folder)) Directory.Delete(folder, true); }

    [Theory]
    [InlineData(1, "# Shopping list\nmilk", "01-shopping-list.md")]
    [InlineData(12, "Ideas: C# & Avalonia!", "12-ideas-c-avalonia.md")]
    [InlineData(3, "", "03-untitled.md")]
    [InlineData(2, "   ###   ", "02-untitled.md")]
    public void File_names_are_the_position_and_the_title(int position, string text, string name) =>
        Assert.Equal(name, FolderNoteStore.FileName(position, text));

    [Fact]
    public void A_long_title_is_cut_to_forty_characters()
    {
        string name = FolderNoteStore.FileName(1, new string('a', 60));
        Assert.Equal("01-" + new string('a', 40) + ".md", name);
    }

    [Fact]
    public async Task Saved_notes_load_back_in_order()
    {
        var store = new FolderNoteStore(folder);
        await store.SaveAllAsync(new[] { "# One\nfirst", "# Two", "plain" });
        Assert.Equal(new[] { "01-one.md", "02-two.md", "03-plain.md" }, Directory.GetFiles(folder).Select(Path.GetFileName).Order());
        Assert.Equal(new[] { "# One\nfirst", "# Two", "plain" }, await new FolderNoteStore(folder).LoadAllAsync());
    }

    [Fact]
    public async Task Saving_replaces_the_old_notes_but_leaves_other_files()
    {
        var store = new FolderNoteStore(folder);
        await store.SaveAllAsync(new[] { "a", "b", "c" });
        File.WriteAllText(Path.Combine(folder, "keep.txt"), "not a note");
        await store.SaveAllAsync(new[] { "only" });
        Assert.Equal(new[] { "only" }, await store.LoadAllAsync());
        Assert.True(File.Exists(Path.Combine(folder, "keep.txt")));
    }

    [Fact]
    public async Task A_missing_folder_has_no_notes() =>
        Assert.Empty(await new FolderNoteStore(folder).LoadAllAsync());

    [Fact]
    public async Task A_cancelled_save_throws()
    {
        using var cts = new CancellationTokenSource();
        cts.Cancel();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => new FolderNoteStore(folder).SaveAllAsync(new[] { "a" }, cts.Token));
    }

    [Fact]
    public async Task The_view_model_saves_every_note_and_loads_them_back()
    {
        var store = new MemoryStore();
        var vm = new MainViewModel(store, new Answers(true));
        vm.NewCommand.Execute(null); vm.Selected!.Text = "# A";
        vm.NewCommand.Execute(null); vm.Selected!.Text = "# B";
        await vm.SaveCommand.ExecuteAsync(null);
        Assert.Equal(new[] { "# A", "# B" }, store.Saved);

        var again = new MainViewModel(store, new Answers(true));
        await again.LoadCommand.ExecuteAsync(null);
        Assert.Equal(new[] { "A", "B" }, again.Notes.Select(n => n.Title));
        Assert.Same(again.Notes[0], again.Selected);
    }
}
