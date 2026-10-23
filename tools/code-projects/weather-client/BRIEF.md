# Weather client — brief

`WeatherClient.GetAsync(city, token)` returns the city's `Forecast`, or
`null` when the API does not know it. Everything it cannot do becomes a
`WeatherException` whose message a user can read. It is given an
`HttpClient` with its `BaseAddress` set, and a `WeatherOptions`.

## Milestones

1. **Fetch and read.** GET `forecast/<city>`: the city in lower case and
   escaped for a URL (`Uri.EscapeDataString`; `St Ives` is `st%20ives`),
   asking for JSON (`Accept: application/json`). A success is read as a
   `Forecast` (JSON names in camelCase; fields you do not use are ignored).
   A 404 is `null`.
2. **Errors and retries.** Try at most `options.Attempts` times in all.
   Retry only what may work later — 408, 429, any 5xx, and an
   `HttpRequestException` (no answer at all) — waiting `options.Backoff`
   after the first failure and twice as long after each one after that.
   Anything else (400, 403, …) fails at once. When the attempts run out,
   the `WeatherException` says what happened last (`… 500 …`).
3. **Timeouts and cancellation.** Each attempt has its own deadline,
   `options.Timeout` (a linked token, not `HttpClient.Timeout`, which is
   fixed once the client is used); an attempt past it counts as a failure
   to retry, and if every attempt times out the message says `timed out`.
   The caller's token is obeyed at once: an `OperationCanceledException`,
   never retried.
4. **The key, kept secret.** Every request, retries included, carries
   `X-Api-Key: <options.ApiKey>` — a header, never the URL. A 401 is
   `WeatherException("… API key …")`, not retried. With no key (null,
   empty or blank) nothing is sent: `WeatherException("No API key …")`.
   No key is written in any `.cs` file under `src/`.
5. **The command line, tested and committed.** `src/Weather.Cli` reads its
   settings from `appsettings.json`, then user secrets (`AddUserSecrets`),
   then environment variables (`AddEnvironmentVariables`), binds the
   `Weather` section to `WeatherOptions`, and uses `DemoServer` when
   `BaseUrl` is `demo`. It reads one city a line:

   | Input | Answer |
   |---|---|
   | a city it knows | `Leeds: 11.5 C, rain` (the temperature in the invariant culture) |
   | a city it does not | `atlantis: not found` (as typed) |
   | a failure | `Error: ` and the message |
   | `quit` | `Bye.` |

   Also: at least five of your own tests, no compiler warnings, and the work
   committed with Git.
