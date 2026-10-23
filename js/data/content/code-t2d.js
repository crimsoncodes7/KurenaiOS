/* Kurenai OS — data/content/code-t2d.js
   Code · T2 · Part D · Async apps and services (docs/code-plan.md §3.3),
   done in Rider with Avalonia 12, Microsoft.Extensions.DependencyInjection
   10 and a fake TimeProvider for tests.

   Dependency injection (T2.12), async UI that never freezes (T2.13), calling
   an API with errors (T2.14), settings and notifications (T2.15). Rider form
   (smoke75); COMMAND cards. The part's project is "Focus timer"
   (rp-t2d-timer; files from tools/code-projects/focus-timer/). The Pitfalls
   messages come from real runs.                                             */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function sh(cap, src) { return { code: { lang: "shell", src: src, cap: cap } }; }
  function cs(cap, src) { return { code: { lang: "csharp", src: src, cap: cap } }; }
  function xaml(cap, src) { return { code: { lang: "xaml", src: src, cap: cap } }; }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }

  K.add({ concepts: {
    "di": { name: "Dependency injection", lesson: "T2.12", about: "a service collection, lifetimes, the composition root" },
    "async-ui": { name: "Async UI", lesson: "T2.13", about: "the UI thread, await, TimeProvider, cancellation" },
    "api-errors": { name: "APIs and their errors", lesson: "T2.14", about: "HttpClient, timeouts, loading and error states" },
    "settings": { name: "Settings and notifications", lesson: "T2.15", about: "JSON settings with defaults; telling the user" }
  } });

  /* ================================================================
     T2.12 Dependency injection in a desktop app
     ================================================================ */
  lesson("T2.12", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "T2C's composition root created three things by hand. A real app has a dozen services, each needing others: the view model needs settings, quotes, a clock and a notifier; the quotes need an `HttpClient`.",
        "Wiring that by hand in `App` grows into a tangle, and every view model that creates its own services is impossible to test with fakes.",
        "**Dependency injection** (DI): register each service once in a **container**, ask for the top object, and the container builds everything it needs, constructor by constructor."
      ] },
      page("Core idea"),
      sh("the container", "dotnet add src/Focus package Microsoft.Extensions.DependencyInjection"),
      cs("Composition.cs: every service registered in one place", 'public static ServiceProvider Build(string dataFolder)\n{\n    var services = new ServiceCollection();\n    services.AddSingleton(TimeProvider.System);\n    services.AddSingleton<ISettingsStore>(_ => new JsonSettingsStore(Path.Combine(dataFolder, "settings.json")));\n    services.AddSingleton<IQuoteService>(_ => new HttpQuoteService(new HttpClient { BaseAddress = HttpQuoteService.Api }));\n    services.AddSingleton<INotifier, WindowNotifier>();\n    services.AddTransient<MainViewModel>();\n    return services.BuildServiceProvider();\n}'),
      cs("the view model just asks, in its constructor", 'public partial class MainViewModel(TimeProvider time, ISettingsStore settings, IQuoteService quotes, INotifier notifier) : ObservableObject\n{\n    // never: new JsonSettingsStore(…), new HttpClient(), TimeProvider.System, DateTime.Now\n}\n\n// App.axaml.cs\nvar services = Composition.Build(Path.Combine(Environment.CurrentDirectory, "focus-data"));\nvar window = new MainWindow { DataContext = services.GetRequiredService<MainViewModel>() };'),
      { ul: [
        "`AddSingleton<IFoo, Foo>()`: whoever asks for `IFoo` gets the one `Foo`. A factory (`_ => new …`) when the constructor needs values the container cannot know, like a path.",
        "`GetRequiredService<MainViewModel>()` reads `MainViewModel`'s constructor, builds each parameter (and theirs), and hands back the finished object.",
        "Tests skip the container entirely: `new MainViewModel(fakeClock, fakeSettings, fakeQuotes, fakeNotifier)`."
      ] },
      page("Rules"),
      { table: { head: ["Lifetime", "Each request gets", "Use for"], rows: [
        ["`AddSingleton`", "the same instance, for the app's life", "settings, the clock, an `HttpClient`, a notifier"],
        ["`AddTransient`", "a new instance every time", "view models, small stateless helpers"],
        ["`AddScoped`", "one per scope", "web requests (T1F); rare in desktop apps"]
      ] } },
      { ul: [
        "Depend on interfaces and abstractions (`ISettingsStore`, `TimeProvider`), not concrete classes, wherever a test would want a fake.",
        "Only the composition root talks to the container. Passing `IServiceProvider` around and asking it for things (the *service locator*) hides dependencies again.",
        "Constructor injection only: a class says everything it needs in its constructor, so nothing can be forgotten.",
        "`TimeProvider` (built into .NET) is the clock abstraction: `TimeProvider.System` in the app, `FakeTimeProvider` in tests."
      ] },
      page("Variations"),
      { h: "A named HttpClient (with Microsoft.Extensions.Http)" },
      cs("the factory owns the handler's lifetime", 'services.AddHttpClient<IQuoteService, HttpQuoteService>(c => c.BaseAddress = HttpQuoteService.Api);'),
      { h: "Several view models" },
      cs("register each; the shell gets the others through a factory", 'services.AddTransient<TimerViewModel>();\nservices.AddTransient<SettingsViewModel>();\nservices.AddSingleton<Func<SettingsViewModel>>(sp => () => sp.GetRequiredService<SettingsViewModel>());'),
      { h: "A test of the registrations" },
      cs("the real graph builds", 'using var sp = Composition.Build(folder);\nAssert.IsType<JsonSettingsStore>(sp.GetRequiredService<ISettingsStore>());\nAssert.NotSame(sp.GetRequiredService<MainViewModel>(), sp.GetRequiredService<MainViewModel>());'),
      page("Pitfalls"),
      { h: "A service nobody registered" },
      sh("MainViewModel needs ISettingsStore; only TimeProvider was added", "System.InvalidOperationException : Unable to resolve service for type 'Focus.ISettingsStore' while attempting to activate 'Focus.MainViewModel'."),
      { ul: [ "Register it in the composition root — the message names exactly what is missing and who wanted it." ] },
      { h: "A view model that news up its services" },
      "`var store = new JsonSettingsStore(\"settings.json\");` inside the view model works, writes to a real file in every test, and cannot be replaced. Take `ISettingsStore` in the constructor.",
      { h: "A singleton that holds a transient" },
      "A singleton given a transient view model keeps that one instance for ever — the \"new each time\" is lost. Singletons should depend only on singletons.",
      page("Connections"),
      { ul: [ "**Back:** unit 10's dependency inversion and fakes; T2C's composition root by hand.", "**Next:** T2.13's clock comes in as `TimeProvider`; T1F's ASP.NET Core uses the same container.", "**The project:** milestone 1 — `Composition.Build`, and a view model that creates nothing." ] },
      page("Good practice"),
      { ul: [ "One composition root; nobody else touches the container.", "Constructor injection of interfaces; no `new` of services inside view models.", "Choose lifetimes on purpose: singletons for shared state and clients, transients for view models." ] },
      page("Practise"),
      { ul: [ "**Focus timer, milestone 1:** `Composition.Build` with the five registrations and the right lifetimes." ] },
      page("Quick reference"),
      cs("the container", 'var services = new ServiceCollection();\nservices.AddSingleton<IFoo, Foo>();\nservices.AddTransient<MainViewModel>();\nvar sp = services.BuildServiceProvider();\nvar vm = sp.GetRequiredService<MainViewModel>();'),
      { ul: [ "Register once; resolve the top; constructors do the rest.", "Singleton · Transient · (Scoped).", "Tests: `new` with fakes, no container." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["Unable to resolve service for type … while attempting to activate …", "a dependency not registered", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What does a DI container do?", "Builds an object and everything its constructor needs, from registrations."],
      ["AddSingleton or AddTransient for a view model?", "AddTransient — a new one each time."],
      ["What is the composition root?", "The one place that registers services and resolves the first object — here Composition.Build, called from App."],
      ["What is .NET's clock abstraction?", "TimeProvider (TimeProvider.System; FakeTimeProvider in tests)."],
      ["Why not pass IServiceProvider around?", "It hides dependencies — the service-locator anti-pattern."],
      ["How do tests build a view model?", "With new and fakes — no container."]
    ],
    quiz: [
      { q: "`GetRequiredService<MainViewModel>()` throws \"Unable to resolve service for type 'Focus.INotifier'…\". Fix:", opts: ["make MainViewModel a singleton", "register an INotifier", "remove the constructor", "call GetService instead"], ans: 1, why: "Every constructor parameter must be registered." },
      { q: "An HttpClient for the whole app is best registered as…", opts: ["transient", "singleton", "scoped", "not at all"], ans: 1, why: "One client, reused; new clients per call exhaust sockets." },
      { q: "A view model with `var clock = TimeProvider.System;` inside it…", opts: ["is fine", "cannot have its clock faked in tests", "fails to build", "is a singleton"], ans: 1, why: "Take TimeProvider in the constructor instead." }
    ]
  });

  /* ================================================================
     T2.13 Async UI that never freezes
     ================================================================ */
  lesson("T2.13", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "One thread runs the whole window. A handler that waits — a `Thread.Sleep(1000)` loop for a timer, a download, a big file — stops every redraw and click until it returns. The OS calls it \"not responding\".",
        "`async`/`await` gives the thread back while waiting: the method pauses at `await`, the UI keeps running, and the method carries on **on the UI thread** when the wait is over.",
        "Time itself is a dependency: a timer that awaits delays on an injected `TimeProvider` counts down in the app and jumps instantly in a test."
      ] },
      page("Core idea"),
      cs("a countdown that never blocks", '[RelayCommand(CanExecute = nameof(CanStart))]\nvoid Start()\n{\n    running = new CancellationTokenSource();\n    IsRunning = true;\n    _ = CountDown(running.Token);\n}\n\nasync Task CountDown(CancellationToken ct)\n{\n    var end = Time.GetUtcNow() + left;\n    try\n    {\n        while (left > TimeSpan.Zero)\n        {\n            await Task.Delay(TimeSpan.FromSeconds(1), Time, ct);   // the injected clock\n            Show(end - Time.GetUtcNow());                         // back on the UI thread\n        }\n    }\n    catch (OperationCanceledException) { return; }               // paused\n    IsRunning = false;\n}'),
      cs("Pause is a cancellation", '[RelayCommand(CanExecute = nameof(IsRunning))]\nvoid Pause()\n{\n    running?.Cancel();\n    IsRunning = false;\n}'),
      cs("a test moves the clock, not the wall", 'var time = new FakeTimeProvider();\nvar vm = new MainViewModel(time, settings, quotes, notifier);\nvm.StartCommand.Execute(null);\nfor (int i = 0; i < 90; i++) { time.Advance(TimeSpan.FromSeconds(1)); Dispatcher.UIThread.RunJobs(); }\nAssert.Equal("23:30", vm.Remaining);'),
      { ul: [
        "`await` captures the UI thread's *synchronisation context*, so code after it may touch bound properties safely.",
        "Remaining time is computed from the clock (`end - now`), not by counting ticks — a late tick never makes the timer drift.",
        "Cancellation is cooperative: the token makes `Task.Delay` throw `OperationCanceledException`, which the loop treats as \"stop\"."
      ] },
      page("Rules"),
      { table: { head: ["Never on the UI thread", "Instead"], rows: [
        ["`Thread.Sleep(…)`", "`await Task.Delay(…, time, ct)`"],
        ["`task.Result`, `task.Wait()`", "`await task` (they block, and can deadlock)"],
        ["a long CPU loop", "`await Task.Run(() => …)`, then show the result"],
        ["setting a control from `Task.Run`", "return the value; or `Dispatcher.UIThread.Post(…)`"],
        ["`async void` methods", "`async Task` (except event handlers)"]
      ] } },
      { ul: [
        "Async commands (`IAsyncRelayCommand`) disable themselves while running and expose `IsRunning` for a spinner.",
        "Keep a `CancellationTokenSource` per piece of work you might want to stop; cancel it when the user stops or the window closes.",
        "`DispatcherTimer` is the other option for ticks on the UI thread; a `TimeProvider` delay loop is easier to test.",
        "A fire-and-forget `_ = Work()` must catch its own exceptions — nobody awaits it."
      ] },
      page("Variations"),
      { h: "Heavy work off the UI thread" },
      cs("compute elsewhere, show here", 'var words = await Task.Run(() => CountWordsInAllNotes(paths), ct);\nWordTotal = $"{words} words";   // back on the UI thread'),
      { h: "Posting to the UI thread" },
      cs("from a callback that runs elsewhere", 'Dispatcher.UIThread.Post(() => Status = "Synced");'),
      { h: "A DispatcherTimer" },
      cs("ticks on the UI thread", 'var timer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(1) };\ntimer.Tick += (_, _) => Show(end - DateTimeOffset.UtcNow);\ntimer.Start();'),
      page("Pitfalls"),
      { h: "Touching the UI from another thread" },
      sh("setting a bound property or control inside Task.Run", "System.InvalidOperationException : The calling thread cannot access this object because a different thread owns it."),
      { ul: [ "Return the value from `Task.Run` and set it after `await`, or `Dispatcher.UIThread.Post` it." ] },
      { h: "A timer on the wrong clock" },
      "`await Task.Delay(TimeSpan.FromSeconds(1), ct)` (no `Time`) waits a real second: the app works, and a test that advances a fake clock sees nothing happen. Pass the injected `TimeProvider`.",
      { h: ".Result in a handler" },
      "`var quote = quotes.TodayAsync().Result;` blocks the UI thread until the network answers — and if the continuation needs the UI thread, it never comes back. Await it.",
      page("Connections"),
      { ul: [ "**Back:** unit 11's async, await and cancellation; T2.11's `RunJobs` in tests.", "**Next:** T2.14 awaits the network with timeouts; T2.15 tells the user when the timer ends.", "**The project:** milestone 2 — a countdown on the injected clock, paused and resumed." ] },
      page("Good practice"),
      { ul: [ "Await everything that waits; block nothing on the UI thread.", "Inject the clock; compute time from it.", "Every long-running piece of work has a way to be cancelled." ] },
      page("Practise"),
      { ul: [ "**Focus timer, milestone 2:** Start, Pause, the countdown and the switch to a break, with no `Thread.Sleep`, `.Result` or `.Wait()`." ] },
      page("Quick reference"),
      cs("the loop", 'while (left > TimeSpan.Zero) { await Task.Delay(TimeSpan.FromSeconds(1), Time, ct); Show(end - Time.GetUtcNow()); }'),
      { ul: [ "One UI thread: keep it free.", "`await`, cancellation tokens, `Task.Run` for CPU work.", "`TimeProvider` + `FakeTimeProvider.Advance` in tests." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["The calling thread cannot access this object because a different thread owns it", "UI touched off the UI thread", "Pitfalls"]] } }
    ],
    flashcards: [
      ["Why does Thread.Sleep in a handler freeze the window?", "It blocks the one UI thread that draws and handles input."],
      ["Where does code after await run in an Avalonia handler or command?", "Back on the UI thread (the captured synchronisation context)."],
      ["How do you wait a second on an injected clock?", "await Task.Delay(TimeSpan.FromSeconds(1), time, ct)"],
      ["How does a test make a fake clock move?", "FakeTimeProvider.Advance(…), then let the UI thread run its jobs."],
      ["How do you stop an async loop?", "Cancel its CancellationTokenSource; the awaited delay throws OperationCanceledException."],
      ["What is wrong with task.Result on the UI thread?", "It blocks, and can deadlock if the task needs the UI thread to finish."]
    ],
    quiz: [
      { q: "A timer built from `Thread.Sleep(1000)` in a loop on the UI thread…", opts: ["counts fine", "freezes the window", "runs on another thread", "throws"], ans: 1, why: "The UI thread is busy sleeping." },
      { q: "Why compute Remaining as end − now instead of decrementing each tick?", opts: ["it is shorter", "a late tick never makes it drift", "it uses less memory", "TimeProvider requires it"], ans: 1, why: "The clock is the truth; ticks only prompt a redraw." },
      { q: "A test advances a FakeTimeProvider by 60 s, but the view model still shows 25:00. Likely…", opts: ["the delay used the real clock", "the test is too fast", "PropertyChanged is missing", "60 s is too little"], ans: 0, why: "Task.Delay without the TimeProvider waits on real time." }
    ]
  });

  /* ================================================================
     T2.14 Calling an API, with errors
     ================================================================ */
  lesson("T2.14", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "The network is slow, sometimes down, and sometimes answers nonsense. An app that assumes success shows a blank, freezes, or crashes the first time Wi-Fi drops.",
        "A UI that calls an API needs three states besides \"done\": **loading** (show progress), **error** (say what happened, offer a retry) and **empty**.",
        "The service turns every network failure into ONE exception the app understands; the view model turns that into words on the screen."
      ] },
      page("Core idea"),
      cs("the service: one call, every failure named", 'public async Task<Quote> TodayAsync(CancellationToken ct = default)\n{\n    using var limit = CancellationTokenSource.CreateLinkedTokenSource(ct);\n    limit.CancelAfter(Timeout);                                      // 5 s unless told otherwise\n    try\n    {\n        using var response = await Http.GetAsync("quote/today", limit.Token);\n        if (!response.IsSuccessStatusCode) throw new QuoteUnavailableException($"The quotes API answered {(int)response.StatusCode}.");\n        var quote = await response.Content.ReadFromJsonAsync<Quote>(new JsonSerializerOptions(JsonSerializerDefaults.Web), limit.Token);\n        if (quote is null || string.IsNullOrWhiteSpace(quote.Text)) throw new QuoteUnavailableException("No quote in the answer.");\n        return quote;\n    }\n    catch (OperationCanceledException) when (!ct.IsCancellationRequested) { throw new QuoteUnavailableException("The quotes API took too long."); }\n    catch (HttpRequestException e) { throw new QuoteUnavailableException("The quotes API could not be reached.", e); }\n    catch (JsonException e) { throw new QuoteUnavailableException("The answer was not a quote.", e); }\n}'),
      cs("the view model: loading, then the quote or the error", '[RelayCommand]\nasync Task LoadQuote()\n{\n    QuoteError = null;\n    IsLoadingQuote = true;\n    try { Quote = await Quotes.TodayAsync(); }\n    catch (QuoteUnavailableException) { Quote = null; QuoteError = "Couldn\'t load a quote. Try again."; }\n    finally { IsLoadingQuote = false; }\n}'),
      xaml("the view shows whichever state it is in", '<Button Content="A quote to begin" Command="{Binding LoadQuoteCommand}" />\n<ProgressBar IsIndeterminate="True" IsVisible="{Binding IsLoadingQuote}" />\n<TextBlock Text="{Binding Quote.Text, FallbackValue=\'\'}" TextWrapping="Wrap" />\n<TextBlock Text="{Binding QuoteError}" Foreground="OrangeRed" />'),
      { ul: [
        "A **linked** token source cancels when the caller cancels OR when the timeout passes; `when (!ct.IsCancellationRequested)` tells the two apart.",
        "The caller's own cancellation stays an `OperationCanceledException` (nobody shows an error for something the user stopped).",
        "`JsonSerializerDefaults.Web` reads `text` into `Text` (camelCase, case-insensitive)."
      ] },
      page("Rules"),
      { table: { head: ["What went wrong", "You see", "The app shows"], rows: [
        ["no network, DNS failed", "`HttpRequestException`", "error + retry"],
        ["500, 404, 429…", "`IsSuccessStatusCode` false", "error + retry (429: later)"],
        ["not JSON, missing fields", "`JsonException` or nulls", "error"],
        ["too slow", "your timeout's cancellation", "error + retry"],
        ["the user cancelled", "`OperationCanceledException` from their token", "nothing"]
      ] } },
      { ul: [
        "Test the service against a **fake server** — an `HttpMessageHandler` that answers as told — never against the internet.",
        "Never show raw exception text to the user; log it, and show a sentence that says what to do.",
        "A relative path (`quote/today`) needs the client's `BaseAddress` set.",
        "T1D goes further: retries with back-off, rate limits, real REST design."
      ] },
      page("Variations"),
      { h: "A fake server for tests" },
      cs("an HttpMessageHandler that answers as told", 'public sealed class FakeServer(HttpStatusCode code, string body) : HttpMessageHandler\n{\n    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage r, CancellationToken ct) =>\n        Task.FromResult(new HttpResponseMessage(code) { Content = new StringContent(body) });\n}\n\nvar http = new HttpClient(new FakeServer(HttpStatusCode.OK, """{"text":"Begin.","author":"Anon"}""")) { BaseAddress = HttpQuoteService.Api };'),
      { h: "A slow server, to test the timeout" },
      cs("it waits until cancelled", 'var slow = new FakeServerAsync(async (_, ct) => { await Task.Delay(TimeSpan.FromSeconds(30), ct); return new HttpResponseMessage(HttpStatusCode.OK); });\nawait Assert.ThrowsAsync<QuoteUnavailableException>(() => new HttpQuoteService(new HttpClient(slow) { BaseAddress = HttpQuoteService.Api }, TimeSpan.FromMilliseconds(100)).TodayAsync());'),
      { h: "Watching the loading state in a test" },
      cs("a service that waits for the test", 'var held = new TaskCompletionSource<Quote>();\n// quotes.TodayAsync returns held.Task\nvar load = vm.LoadQuoteCommand.ExecuteAsync(null);\nAssert.True(vm.IsLoadingQuote);\nheld.SetResult(new Quote("Begin.", "Anon"));\nawait load;\nAssert.False(vm.IsLoadingQuote);'),
      page("Pitfalls"),
      { h: "A relative URL with no BaseAddress" },
      sh("new HttpClient().GetAsync(\"quote/today\")", "System.InvalidOperationException : An invalid request URI was provided. Either the request URI must be an absolute URI or BaseAddress must be set."),
      { h: "The user's cancel shown as an error" },
      "Catching every `OperationCanceledException` as \"too slow\" puts an error on screen after the user pressed Stop. Filter with `when (!ct.IsCancellationRequested)`.",
      { h: "A spinner that never stops" },
      "Setting `IsLoadingQuote = false` after the `await` but outside a `finally` leaves it spinning for ever when the call throws. Use `try … finally`.",
      page("Connections"),
      { ul: [ "**Back:** unit 11's JSON and cancellation; T2.13's awaits; unit 10's fakes.", "**Next:** T2.15 tells the user; T1D builds and calls real APIs with retries.", "**The project:** milestone 3 — `HttpQuoteService` and the quote's three states." ] },
      page("Good practice"),
      { ul: [ "Every network call has a timeout and a cancellation token.", "Turn transport failures into one domain exception at the service's edge.", "Design loading, error and empty states as carefully as the happy one." ] },
      page("Practise"),
      { ul: [ "**Focus timer, milestone 3:** the service against a fake server (good, bad, broken, slow, cancelled) and `LoadQuoteCommand`'s states." ] },
      page("Quick reference"),
      cs("the edge", 'using var limit = CancellationTokenSource.CreateLinkedTokenSource(ct); limit.CancelAfter(Timeout);\ntry { … await Http.GetAsync(path, limit.Token) … }\ncatch (OperationCanceledException) when (!ct.IsCancellationRequested) { throw new QuoteUnavailableException("Too slow."); }'),
      { ul: [ "Status, body, transport, timeout → one exception; the user's cancel → stays a cancel.", "Loading · error · empty · done.", "Fake servers in tests." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["An invalid request URI was provided … BaseAddress must be set", "a relative path with no BaseAddress", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What three states besides success does an API call need in the UI?", "Loading, error (with retry) and empty."],
      ["How do you add a timeout to one call without losing the caller's token?", "A linked CancellationTokenSource with CancelAfter(timeout)."],
      ["How do you tell a timeout from the user's cancel?", "catch (OperationCanceledException) when (!ct.IsCancellationRequested)"],
      ["How do you test an HTTP service without the internet?", "Give HttpClient a fake HttpMessageHandler that answers as told."],
      ["Why set IsLoading = false in finally?", "So it is cleared even when the call throws."],
      ["Which JSON option reads \"text\" into Text?", "JsonSerializerDefaults.Web (camelCase, case-insensitive)."]
    ],
    quiz: [
      { q: "The API answers 500. HttpClient.GetAsync…", opts: ["throws HttpRequestException", "returns a response with IsSuccessStatusCode false", "returns null", "retries"], ans: 1, why: "Status codes are answers; check IsSuccessStatusCode." },
      { q: "The user presses Stop during a load. The app should…", opts: ["show \"Couldn't load\"", "show nothing and stop", "retry", "crash"], ans: 1, why: "A cancel the user asked for is not an error." },
      { q: "Tests of HttpQuoteService should talk to…", opts: ["the real API", "a fake HttpMessageHandler", "localhost", "a mock of HttpClient.GetAsync"], ans: 1, why: "A fake handler answers exactly as each test needs." }
    ]
  });

  /* ================================================================
     T2.15 Settings and notifications
     ================================================================ */
  lesson("T2.15", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "An app that forgets the user's choices every time it starts feels broken. And a timer that ends silently while you are in another window is no timer at all.",
        "**Settings** are a small file the app reads at start and writes when something changes — and must survive the file being missing or damaged.",
        "**Notifications** tell the user something happened without stopping them: a toast in the window, or the operating system's notification."
      ] },
      page("Core idea"),
      cs("settings as a record, kept in a JSON file", 'public record Settings(int FocusMinutes = 25, int BreakMinutes = 5);\n\npublic class JsonSettingsStore(string path) : ISettingsStore\n{\n    public Settings Load()\n    {\n        try { return File.Exists(path) ? JsonSerializer.Deserialize<Settings>(File.ReadAllText(path)) ?? new Settings() : new Settings(); }\n        catch (JsonException) { return new Settings(); }   // damaged: start from the defaults\n    }\n\n    public void Save(Settings s)\n    {\n        Directory.CreateDirectory(Path.GetDirectoryName(path)!);\n        File.WriteAllText(path, JsonSerializer.Serialize(s));\n    }\n}'),
      cs("the view model saves when a choice changes", 'public int FocusMinutes\n{\n    get => focusMinutes;\n    set\n    {\n        value = Math.Max(1, value);\n        if (!SetProperty(ref focusMinutes, value)) return;\n        Settings.Save(new Settings(value, BreakMinutes));\n        if (!IsRunning && Phase == "Focus") Show(TimeSpan.FromMinutes(value));\n    }\n}'),
      cs("a toast, behind an interface", 'public interface INotifier { void Notify(string title, string message); }\n\n// when a focus session ends\nNotifier.Notify("Focus done", $"Time for a {BreakMinutes}-minute break.");\n\n// the real one (WindowNotifier)\nmanager ??= new WindowNotificationManager(TopLevel.GetTopLevel(Host)) { Position = NotificationPosition.BottomRight, MaxItems = 3 };\nmanager.Show(new Notification(title, message, NotificationType.Information));'),
      { ul: [
        "A record with defaults gives one place for \"what if nothing is saved\": `new Settings()`.",
        "`SetProperty` (the toolkit's) returns false when nothing changed — so a value set to itself saves nothing.",
        "The view model only says *notify*; how (a toast, the OS, a sound) is the notifier's business, and a test's fake just records it."
      ] },
      page("Rules"),
      { table: { head: ["Where", "Holds"], rows: [
        ["`Environment.SpecialFolder.ApplicationData`/your app", "settings and data the user does not manage (real apps)"],
        ["the project folder (`focus-data/`)", "this project's data, so you can see it (Git ignores it)"],
        ["memory only", "window positions you do not mean to keep, caches"],
        ["never in settings", "passwords and API keys — use the OS keychain or user secrets (T1F)"]
      ] } },
      { ul: [
        "A missing file is normal (first run); a damaged one must not crash the app — fall back to defaults.",
        "Save on change (small files), or on close (large ones) — never only on close for things that matter.",
        "A notification is for *something happened*; a dialog is for *answer me*. Never use a modal for news.",
        "Respect quiet: one notification per event, and the user's settings for sound."
      ] },
      page("Variations"),
      { h: "Versioned settings" },
      cs("add a field without breaking old files", 'public record Settings(int FocusMinutes = 25, int BreakMinutes = 5, bool Sound = true);\n// an old file without "Sound" loads with Sound = true'),
      { h: "Write safely" },
      cs("write a temporary file, then replace", 'var tmp = path + ".tmp";\nFile.WriteAllText(tmp, JsonSerializer.Serialize(s));\nFile.Move(tmp, path, overwrite: true);   // never a half-written settings file'),
      { h: "A notification with a type" },
      cs("warning, error, success", 'manager.Show(new Notification("Sync failed", "Your notes are saved locally.", NotificationType.Warning));'),
      page("Pitfalls"),
      { h: "A damaged settings file" },
      sh("JsonSerializer.Deserialize on \"{ focus: forty\" without a catch", "System.Text.Json.JsonException: 'f' is an invalid start of a property name. Expected a '\"'. Path: $ | LineNumber: 0 | BytePositionInLine: 2."),
      { ul: [ "Catch `JsonException` and load the defaults — the app must still start." ] },
      { h: "Saving on every keystroke of a slider" },
      "A `Slider` bound to a setting that saves on each change writes the file dozens of times per drag. For values that change fast, save after a short pause or on release.",
      { h: "A notification for every second" },
      "Notifying from inside the countdown loop (instead of when it ends) buries the user in toasts. Notify once, at the event.",
      page("Connections"),
      { ul: [ "**Back:** unit 11's JSON; records (unit 7); T2.12's services; KurenaiOS's own notification centre and its quiet hours.", "**Next:** T2E validates what the user types into settings; T1F keeps secrets out of settings files.", "**The project:** milestone 4 — settings with defaults, saving on change, and the time-up notification." ] },
      page("Good practice"),
      { ul: [ "Defaults in one place (the record); survive missing and damaged files.", "Save on change for small settings.", "Notify once per event, through an interface the tests can fake." ] },
      page("Practise"),
      { ul: [ "**Focus timer, milestone 4:** `JsonSettingsStore`, `FocusMinutes` saved on change, the notifications. **Milestone 5:** your tests, clean, committed." ] },
      page("Quick reference"),
      cs("the pair", 'try { return JsonSerializer.Deserialize<Settings>(File.ReadAllText(path)) ?? new(); } catch (JsonException) { return new(); }\nNotifier.Notify("Focus done", "Time for a 5-minute break.");'),
      { ul: [ "A record with defaults; JSON on disk; defaults when missing or damaged.", "Save when it changes.", "Notifications for news; dialogs for questions." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["JsonException: … is an invalid start of a property name", "a damaged settings file read without a catch", "Pitfalls"]] } }
    ],
    flashcards: [
      ["Where do a record's default values help with settings?", "new Settings() is the one answer for a missing or damaged file."],
      ["What should Load do with a damaged settings file?", "Catch JsonException and return the defaults."],
      ["What does the toolkit's SetProperty return?", "Whether the value really changed."],
      ["Notification or dialog for \"your timer finished\"?", "A notification — it is news, not a question."],
      ["Which Avalonia class shows toasts in a window?", "WindowNotificationManager."],
      ["Where must API keys never go?", "In a settings file the app writes as plain JSON (or in Git)."]
    ],
    quiz: [
      { q: "On first run there is no settings.json. Load should…", opts: ["throw FileNotFoundException", "return the defaults", "create an empty file and crash", "ask the user"], ans: 1, why: "A missing file is the normal first run." },
      { q: "Where should the timer's \"Focus done\" be raised?", opts: ["every tick", "once, when the focus period ends", "on Start", "on Pause"], ans: 1, why: "One notification per event." },
      { q: "Why does the view model take an INotifier?", opts: ["toasts need DI", "so tests can record notifications without a window", "WindowNotifier is static", "for speed"], ans: 1, why: "The fake records; the real one shows a toast." }
    ]
  });

  /* ================================================================
     command cards
     ================================================================ */
  var short = function (s) { s = String(s).replace(/^(Type the |Name the |Which |Write the )/, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };
  K.add({ cards: {
    "t2d-di": { title: "Dependency injection", lesson: "T2.12", concepts: ["di"], kind: "command",
      vary: function (r) {
        var t = pick(r, ["MainViewModel", "SettingsViewModel", "TimerViewModel"]);
        var q = pick(r, [
          ["Type the line that registers " + t + " on services so each request gets a new one.", "services.AddTransient<" + t + ">();", ["^services\\.AddTransient<" + t + ">\\(\\);?$"]],
          ["Type the line that registers WindowNotifier as the one INotifier for the whole app, on services.", "services.AddSingleton<INotifier, WindowNotifier>();", ["^services\\.AddSingleton<INotifier, ?WindowNotifier>\\(\\);?$"]],
          ["Type the call on sp that builds a " + t + " and everything it needs (throwing if it cannot).", "sp.GetRequiredService<" + t + ">()", ["^sp\\.GetRequiredService<" + t + ">\\(\\);?$"]],
          ["Which built-in .NET class is the clock to inject (the abstraction itself)?", "TimeProvider", ["^(System\\.)?TimeProvider$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(new RegExp(t, "g"), "a view model"), params: [t], answer: q[1], accept: q[2], hint: "AddTransient · AddSingleton<I, C> · GetRequiredService<T>() · TimeProvider." };
      } },
    "t2d-async": { title: "Async UI", lesson: "T2.13", concepts: ["async-ui"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Type the line that waits one second on the injected clock Time, cancellable by ct.", "await Task.Delay(TimeSpan.FromSeconds(1), Time, ct);", ["^await Task\\.Delay\\(TimeSpan\\.FromSeconds\\(1\\), ?Time, ?ct\\);?$"]],
          ["Type the call that moves a FakeTimeProvider called time on by one second.", "time.Advance(TimeSpan.FromSeconds(1));", ["^time\\.Advance\\(TimeSpan\\.FromSeconds\\(1\\)\\);?$"]],
          ["Which exception does an awaited delay throw when its token is cancelled?", "OperationCanceledException", ["^(System\\.)?(Operation|Task)CanceledException$"]],
          ["Type the call that queues an action on Avalonia's UI thread (just the method, with Dispatcher).", "Dispatcher.UIThread.Post", ["^Dispatcher\\.UIThread\\.Post(\\(.*\\))?;?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], hint: "Task.Delay(…, Time, ct) · FakeTimeProvider.Advance · OperationCanceledException · Dispatcher.UIThread.Post." };
      } },
    "t2d-api": { title: "APIs, errors and settings", lesson: "T2.14", concepts: ["api-errors", "settings"], kind: "command",
      vary: function (r) {
        var ms = pick(r, ["5", "10", "30"]);
        var q = pick(r, [
          ["Type the line that makes the linked token source limit cancel after " + ms + " seconds.", "limit.CancelAfter(TimeSpan.FromSeconds(" + ms + "));", ["^limit\\.CancelAfter\\(TimeSpan\\.FromSeconds\\(" + ms + "\\)\\);?$"]],
          ["Which HttpResponseMessage property says whether the status was 2xx?", "IsSuccessStatusCode", ["^(response\\.)?IsSuccessStatusCode$"]],
          ["Which exception does HttpClient throw when the server cannot be reached?", "HttpRequestException", ["^(System\\.Net\\.Http\\.)?HttpRequestException$"]],
          ["Which exception should a settings loader catch for a damaged file (System.Text.Json)?", "JsonException", ["^(System\\.Text\\.Json\\.)?JsonException$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(" after " + ms + " seconds", " after a timeout"), params: [ms], answer: q[1], accept: q[2], hint: "CancelAfter · IsSuccessStatusCode · HttpRequestException · JsonException." };
      } }
  } });

  /* ================================================================
     the part's project: Focus timer
     ================================================================ */
  K.project("rp-t2d-timer", {
    unit: "T2D", title: "Focus timer", folder: "focus-timer", solution: "FocusTimer.sln",
    scaffoldVersion: 1, minValidator: "1.1.1", sdk: ".NET 10 SDK",
    summary: "A focus timer built from services: dependency injection, a countdown that never blocks the UI, a quote with loading and error states, remembered settings and a notification — built in Rider.",
    brief: [
      "`src/Focus`: `Composition.cs` (the composition root), `MainViewModel.cs`, `MainWindow.axaml` and `Services/` (settings, quotes; `WindowNotifier` is written). Kurenai's tests for milestones 1–4 move a fake clock second by second and answer HTTP from a fake server.",
      { ul: [
        "The view model takes every service in its constructor and creates none.",
        "The real app asks `https://quotes.kurenai.invalid/`, which never resolves — so running it shows the quote's error state, as it should.",
        "The names matter: `RemainingText`, `StartButton`, `PauseButton`, `FocusMinutesBox`.",
        "`Directory.Build.props`, `tests/Focus.Acceptance/` and `.kurenai/validate.cs` are **protected**."
      ] }
    ],
    milestones: [
      { id: "m1", title: "Dependency injection", lessons: ["T2.12"], about: "Composition.Build registers the clock, settings, quotes and notifier as singletons and the view model as transient; the view model creates no services.",
        checks: [{ type: "tests", class: "Milestone1" }, { type: "source", path: "src/Focus/MainViewModel.cs", forbids: ["new (JsonSettingsStore|HttpQuoteService|HttpClient|WindowNotifier)\\b", "TimeProvider\\.System", "DateTime\\.(Now|UtcNow)"] }] },
      { id: "m2", title: "Async UI", lessons: ["T2.13"], about: "Start and Pause; a countdown on the injected clock that moves to a break at zero; nothing blocks.",
        checks: [{ type: "tests", class: "Milestone2" }, { type: "source", path: "src/Focus", forbids: ["Thread\\.Sleep", "\\.Result\\b", "\\.Wait\\(\\)"] }] },
      { id: "m3", title: "Calling an API", lessons: ["T2.14"], about: "HttpQuoteService against good, bad, broken, slow and cancelled answers; the quote's loading and error states.", checks: [{ type: "tests", class: "Milestone3" }] },
      { id: "m4", title: "Settings and notifications", lessons: ["T2.15"], about: "Settings with defaults, saved on change; the time-up notification; the window counts down from Start.", checks: [{ type: "tests", class: "Milestone4" }] },
      { id: "m5", title: "Tested, clean and committed", lessons: ["T2.13"], about: "Five or more of your own tests; no warnings; committed.",
        checks: [{ type: "owntests", prefix: "Focus.Tests.", min: 5 }, { type: "warnings", max: 0 }, { type: "git" }] }
    ],
    protected: ["Directory.Build.props", "tests/Focus.Acceptance/Focus.Acceptance.csproj", "tests/Focus.Acceptance/Headless.cs", "tests/Focus.Acceptance/Fakes.cs", "tests/Focus.Acceptance/Milestone1.cs", "tests/Focus.Acceptance/Milestone2.cs", "tests/Focus.Acceptance/Milestone3.cs", "tests/Focus.Acceptance/Milestone4.cs", ".kurenai/validate.cs"],
    reward: { xp: 140, gold: 35, hp: 8 }
  });
})();
