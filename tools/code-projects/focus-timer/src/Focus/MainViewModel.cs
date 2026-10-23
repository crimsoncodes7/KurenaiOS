using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Focus;

/// <summary>The timer, its settings and the quote (milestones 2–4). Yours to build; keep the
/// constructor's services — never create them here.</summary>
public partial class MainViewModel(TimeProvider time, ISettingsStore settings, IQuoteService quotes, INotifier notifier) : ObservableObject
{
    public TimeProvider Time { get; } = time;
    public ISettingsStore Settings { get; } = settings;
    public IQuoteService Quotes { get; } = quotes;
    public INotifier Notifier { get; } = notifier;

    public string Phase => throw new NotImplementedException();
    public string Remaining => throw new NotImplementedException();
    public bool IsRunning => throw new NotImplementedException();
    public int FocusMinutes { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public Quote? Quote => throw new NotImplementedException();
    public string? QuoteError => throw new NotImplementedException();
    public bool IsLoadingQuote => throw new NotImplementedException();

    public IRelayCommand StartCommand => throw new NotImplementedException();
    public IRelayCommand PauseCommand => throw new NotImplementedException();
    public IAsyncRelayCommand LoadQuoteCommand => throw new NotImplementedException();
}
