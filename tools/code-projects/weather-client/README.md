# Weather client

The project of T1D, *HTTP and REST*, from KurenaiOS (Code → Track T1). A
weather client on `HttpClient`: JSON, retries with backoff, timeouts and
cancellation, an API key kept out of the code — tested against a fake
server, and a command line that runs against a demo server built into it.

- `src/Weather` — `Forecast`, `WeatherOptions`, `WeatherException` and
  `WeatherClient` (a stub: yours to build).
- `src/Weather.Cli` — the command line. `DemoServer.cs` is a weather API
  inside the program, so it runs with no network and no account.
- `tests/Weather.Tests` — YOUR tests. It starts with one example.
- `tests/Weather.Acceptance` — Kurenai's acceptance tests for milestones 1–4,
  against a fake server (`FakeServer.cs`).

## Work on it

1. Open `WeatherClient.sln` in JetBrains Rider (or run `dotnet test` here).
2. Do the milestones in `BRIEF.md`, in order.
3. Validate: run the **Kurenai Validate** configuration in Rider's toolbar, or
   `dotnet run .kurenai/validate.cs` in a terminal.
4. Import the newest file in `.kurenai/reports/` into KurenaiOS
   (Code → Weather client → Validation).

## A real weather API

The demo server's key, `demo-key-public`, is public, so it may sit in
`appsettings.json`. A real key never does. Keep it in user secrets, which
live outside this folder and override the file:

```sh
cd src/Weather.Cli
dotnet user-secrets set "Weather:BaseUrl" "https://your-weather-api.example/v1/"
dotnet user-secrets set "Weather:ApiKey" "…"
```

(or the environment variables `Weather__BaseUrl` and `Weather__ApiKey`).

`Directory.Build.props`, `tests/Weather.Acceptance/` and `.kurenai/validate.cs`
are protected: change them and the report counts as practice only.
