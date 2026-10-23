using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.Input;

namespace Notes;

/// <summary>The window's view model. Yours to build: make it an ObservableObject and replace
/// the four stubs below with [RelayCommand] methods (New, Delete, Save, Load).</summary>
public class MainViewModel(INoteStore store, IDialogs dialogs)
{
    public INoteStore Store { get; } = store;
    public IDialogs Dialogs { get; } = dialogs;

    public ObservableCollection<NoteViewModel> Notes { get; } = new();
    public NoteViewModel? Selected { get; set; }

    public IRelayCommand NewCommand => throw new NotImplementedException();
    public IAsyncRelayCommand DeleteCommand => throw new NotImplementedException();
    public IAsyncRelayCommand SaveCommand => throw new NotImplementedException();
    public IAsyncRelayCommand LoadCommand => throw new NotImplementedException();
}
