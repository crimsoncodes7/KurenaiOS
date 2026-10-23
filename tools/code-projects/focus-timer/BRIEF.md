# Focus timer — brief

`MainViewModel` takes every service in its constructor and never creates
one: no `new JsonSettingsStore`, `new HttpClient`, `TimeProvider.System` or
`DateTime.Now` inside it.

## Milestones

1. **Dependency injection.** `Composition.Build(dataFolder)` registers:
   `TimeProvider.System` (singleton); a `JsonSettingsStore` at
   `dataFolder/settings.json` as the `ISettingsStore` (singleton); an
   `HttpQuoteService` whose `HttpClient` has `BaseAddress =
   HttpQuoteService.Api` as the `IQuoteService`; `WindowNotifier` as the
   `INotifier` (singleton); `MainViewModel` as transient (a new one each
   time).
2. **Async UI.** `Phase` is `Focus` or `Break`, `Remaining` is `mm:ss`,
   `IsRunning` says whether it counts. `StartCommand` (only when not running)
   counts down by the injected `TimeProvider` — `await Task.Delay(…, Time,
   token)` in a loop, never `Thread.Sleep` — and `PauseCommand` (only when
   running) stops it keeping the time left; Start carries on from there. At
   zero a Focus becomes a Break of `BreakMinutes` (and a Break a Focus), not
   running.
3. **Calling an API.** `HttpQuoteService.TodayAsync` GETs `quote/today` and
   reads `{"text": …, "author": …}`. A failed status, a body that is not a
   quote (or has no text), no connection, or no answer within `Timeout` is a
   `QuoteUnavailableException`; the caller's own cancellation stays an
   `OperationCanceledException`. `LoadQuoteCommand` sets `IsLoadingQuote`
   while it waits, then `Quote` — or, on failure, `QuoteError =
   "Couldn't load a quote. Try again."` (cleared when it tries again).
4. **Settings and notifications.** `JsonSettingsStore` loads the defaults
   (25 and 5) when the file is missing or damaged, and creates the folder
   when saving. The view model starts from the saved focus length;
   `FocusMinutes` (at least 1) saves when changed and resets the display if
   the timer is idle in Focus. When a Focus ends it notifies once:
   `("Focus done", "Time for a 5-minute break.")` (with the real break
   length); a Break ending says `("Break over", "Ready when you are.")`. The
   window has a `TextBlock` `RemainingText`, `Button`s `StartButton` and
   `PauseButton`, and a `NumericUpDown` `FocusMinutesBox`.
5. **Tested, clean and committed.** Five or more of your own tests, no
   compiler warnings, no `Thread.Sleep`, `.Result` or `.Wait()` in `src`,
   committed.
