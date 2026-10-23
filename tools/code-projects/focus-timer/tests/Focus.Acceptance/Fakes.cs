using System.Net;
using Avalonia.Threading;
using Microsoft.Extensions.Time.Testing;

namespace Focus.Acceptance;

public sealed class MemorySettings(Settings start) : ISettingsStore
{
    public Settings Current { get; private set; } = start;
    public int Saves { get; private set; }
    public Settings Load() => Current;
    public void Save(Settings settings) { Current = settings; Saves++; }
}

public sealed class Told : INotifier
{
    public List<(string Title, string Message)> Said { get; } = new();
    public void Notify(string title, string message) => Said.Add((title, message));
}

/// <summary>A quote service the test controls: each call waits until the test answers it.</summary>
public sealed class HeldQuotes : IQuoteService
{
    TaskCompletionSource<Quote> next = new(TaskCreationOptions.RunContinuationsAsynchronously);
    public int Calls { get; private set; }
    public Task<Quote> TodayAsync(CancellationToken ct = default) { Calls++; return next.Task; }
    public void Answer(Quote q) { var t = next; next = new(TaskCreationOptions.RunContinuationsAsynchronously); t.SetResult(q); }
    public void Fail() { var t = next; next = new(TaskCreationOptions.RunContinuationsAsynchronously); t.SetException(new QuoteUnavailableException("down")); }
}

/// <summary>A fake HTTP server: answers every request with what the test gives it.</summary>
public sealed class FakeServer(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> answer) : HttpMessageHandler
{
    public List<Uri?> Asked { get; } = new();
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) { Asked.Add(request.RequestUri); return answer(request, ct); }
    public static FakeServer Json(HttpStatusCode code, string body) =>
        new((_, _) => Task.FromResult(new HttpResponseMessage(code) { Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json") }));
    public HttpClient Client() => new(this) { BaseAddress = HttpQuoteService.Api };
}

public static class Clock
{
    /// <summary>A fake clock at a fixed moment.</summary>
    public static FakeTimeProvider Fake() => new(new DateTimeOffset(2026, 10, 23, 9, 0, 0, TimeSpan.Zero));

    /// <summary>Moves the fake clock on one second at a time, letting the UI thread run in between.</summary>
    public static void Tick(this FakeTimeProvider time, int seconds)
    {
        for (int i = 0; i < seconds; i++) { time.Advance(TimeSpan.FromSeconds(1)); Dispatcher.UIThread.RunJobs(); }
    }

    public static MainViewModel Vm(FakeTimeProvider time, Settings? start = null, IQuoteService? quotes = null, INotifier? notifier = null, ISettingsStore? store = null) =>
        new(time, store ?? new MemorySettings(start ?? new Settings()), quotes ?? new HeldQuotes(), notifier ?? new Told());
}
