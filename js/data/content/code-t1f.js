/* Kurenai OS — data/content/code-t1f.js
   Code · T1 · Part F · Building an API (docs/code-plan.md §3.3, the
   web-API elective), done in Rider with ASP.NET Core 10 minimal APIs, EF
   Core 10 on SQLite and Microsoft.AspNetCore.Mvc.Testing.

   Minimal APIs (T1.26), persistence, configuration and secrets (T1.27),
   testing an API end to end with WebApplicationFactory (T1.28). Rider form
   (smoke75); COMMAND cards. The part's project is Track T1's capstone,
   CT1, The Planner goes online (rp-ct1-planner; files from
   tools/code-projects/planner-api/): the capstone pays, the project does
   not. The Pitfalls messages come from real runs.                         */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  var C = String.raw;
  function sh(cap, src) { return { code: { lang: "shell", src: src, cap: cap } }; }
  function cs(cap, src) { return { code: { lang: "csharp", src: src, cap: cap } }; }
  function txt(cap, src) { return { code: { lang: "text", src: src, cap: cap } }; }
  function json(cap, src) { return { code: { lang: "json", src: src, cap: cap } }; }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  function call(t, h, body) { return { callout: { t: t, h: h, body: body } }; }
  var short = function (s) { s = String(s).replace(/^(Type the |Name the |Which |Write the )/, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };

  K.add({ concepts: {
    "minimal-api": { name: "Minimal APIs", lesson: "T1.26", about: "MapGet and friends, route groups, binding, Results" },
    "api-persistence": { name: "An API's data and settings", lesson: "T1.27", about: "a DbContext per request, migrations at start-up, configuration in layers, user secrets" },
    "api-testing": { name: "Testing an API", lesson: "T1.28", about: "WebApplicationFactory: the whole app in memory, its settings, a database per test" }
  } });

  /* ================================================================
     T1.26 ASP.NET Core minimal APIs
     ================================================================ */
  lesson("T1.26", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "T1D called APIs; T1.21 designed one, inside a fake server. T1E's chat server showed what serving really takes: an accept loop, a task per client, parsing every line by hand.",
        "**ASP.NET Core** is that loop done properly: HTTP parsing, routing, JSON, errors, logging, all built in. With **minimal APIs** an endpoint is one line: a method, a route and a function.",
        "This part builds the revision planner's API, which is also Track T1's capstone."
      ] },
      page("Core idea"),
      sh("a new web project", "dotnet new web -o src/Planner.Api"),
      cs("Program.cs: a working API", C`var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var topics = new List<Topic> { new(1, "cs", "Big O", 3) };

app.MapGet("/topics", () => topics);
app.MapGet("/topics/{id:int}", (int id) =>
    topics.FirstOrDefault(t => t.Id == id) is { } t ? Results.Ok(t) : Results.NotFound());
app.MapPost("/topics", (TopicIn input) =>
{
    var t = new Topic(topics.Count + 1, input.Subject, input.Title, input.Confidence);
    topics.Add(t);
    return Results.Created($"/topics/{t.Id}", t);
});

app.Run();

record Topic(int Id, string Subject, string Title, int Confidence);
record TopicIn(string Subject, string Title, int Confidence);`),
      sh("run it, then ask it", "dotnet run --project src/Planner.Api\ncurl http://localhost:5080/topics\n# [{\"id\":1,\"subject\":\"cs\",\"title\":\"Big O\",\"confidence\":3}]"),
      { ul: [
        "`MapGet(route, handler)`: when a GET matches the route, the handler runs. A returned object is written as JSON (camelCase, the web defaults).",
        "Handler parameters **bind** themselves: `{id:int}` from the route, a complex type (`TopicIn`) from the JSON body, a simple one not in the route from the query string (`?subject=cs`), a registered service from DI.",
        "`Results.Ok`, `Results.NotFound`, `Results.Created(location, value)`, `Results.NoContent`, `Results.ValidationProblem(errors)`: T1.21's status codes, one call each."
      ] },
      page("Rules"),
      { table: { head: ["Method", "Route", "Handler gets", "Returns"], rows: [
        ["`MapGet`", "`/topics`", "`string? subject` (the query)", "`Results.Ok(list)`"],
        ["`MapGet`", "`/topics/{id:int}`", "`int id` (the route)", "`Ok` or `NotFound`"],
        ["`MapPost`", "`/topics`", "`TopicIn input` (the body)", "`Created($\"/topics/{id}\", t)` or `ValidationProblem`"],
        ["`MapPut`", "`/topics/{id:int}`", "`int id, TopicIn input`", "`NoContent`, `NotFound`, `ValidationProblem`"],
        ["`MapDelete`", "`/topics/{id:int}`", "`int id`", "`NoContent` or `NotFound`"]
      ] } },
      { ul: [
        "**Route groups** share a prefix and behaviour: `var topics = app.MapGroup(\"/topics\");` then `topics.MapGet(\"{id:int}\", …)`. A filter on the group (`AddEndpointFilter`) runs before every endpoint in it.",
        "Route **constraints** (`{id:int}`) make a route match only the right shape: `/topics/abc` is then simply not a route (404).",
        "Handlers are `async` whenever they touch a database: `async (int id, PlannerDb db) => …`.",
        "Return **records made for the API** (`TopicOut`), not your database entities: the JSON is then a contract you chose, not whatever the entity holds today.",
        "`Results.ValidationProblem(new Dictionary<string, string[]> { [\"title\"] = new[] { \"Give the topic a title.\" } })` writes T1.21's problem details with an `errors` entry per field."
      ] },
      page("Variations"),
      { h: "A group, a filter and services" },
      cs("one prefix, one check for every route in it", C`builder.Services.AddDbContext<PlannerDb>(o => o.UseSqlite(builder.Configuration.GetConnectionString("Planner")));
var app = builder.Build();

var topics = app.MapGroup("/topics").AddEndpointFilter(async (context, next) =>
    context.HttpContext.Request.Headers.ContainsKey("X-Api-Key") ? await next(context) : Results.Unauthorized());

topics.MapGet("", async (PlannerDb db) => await db.Topics.OrderBy(t => t.Id).ToListAsync());
topics.MapDelete("{id:int}", async (int id, PlannerDb db) =>
    await db.Topics.Where(t => t.Id == id).ExecuteDeleteAsync() == 1 ? Results.NoContent() : Results.NotFound());`),
      { h: "Trying it from Rider" },
      txt("Planner.Api.http: Rider sends each request and shows the response", "GET http://localhost:5080/topics\nX-Api-Key: {{key}}\n\n###\nPOST http://localhost:5080/topics\nX-Api-Key: {{key}}\nContent-Type: application/json\n\n{ \"subject\": \"cs\", \"title\": \"Big O\", \"confidence\": 3 }"),
      { h: "A sub-resource" },
      cs("sessions belong to a topic", C`topics.MapPost("{id:int}/sessions", async (int id, SessionIn input, PlannerDb db) =>
{
    if (await db.Topics.FindAsync(id) is not { } topic) return Results.NotFound();
    var s = new StudySession { TopicId = id, Date = input.Date, Minutes = input.Minutes };
    db.Sessions.Add(s);
    await db.SaveChangesAsync();
    return Results.Created($"/topics/{id}/sessions/{s.Id}", SessionOut.Of(s));
});`),
      page("Pitfalls"),
      { h: "An int route without its constraint" },
      txt("GET /topics/abc against MapGet(\"/topics/{id}\", (int id) => …), in Development", "Microsoft.AspNetCore.Http.BadHttpRequestException: Failed to bind parameter \"int id\" from \"abc\"."),
      "A 400 that blames the client for asking for a page that does not exist. `{id:int}` makes it a 404.",
      { h: "JSON that does not parse" },
      txt("POST /topics with a cut-off body", "Microsoft.AspNetCore.Http.BadHttpRequestException: Failed to read parameter \"TopicIn input\" from the request body as JSON."),
      "ASP.NET answers 400 by itself before your handler runs: your handler only ever sees a `TopicIn`. Validate what is inside it.",
      { h: "Validation by exception" },
      "Throwing `ArgumentException` for a blank title gives the client a 500 — *your* fault, it says, and no clue which field. Check the input, and answer `ValidationProblem` with each field's message.",
      page("Connections"),
      { ul: [ "**Back:** T1.21 resources and status codes; T1.25 the accept loop ASP.NET runs for you; T1C's DbContext.", "**Next:** T1.27 the data and the settings behind it; T1.28 testing it end to end.", "**Capstone:** *The Planner goes online*, milestones 1–2." ] },
      page("Good practice"),
      { ul: [ "One route group per resource; constraints on every id.", "API records in and out, never the entities.", "Every failure has its status and, for a 400, a problem-details body." ] },
      page("Practise"),
      { ul: [ "**Capstone:** *The Planner goes online* — milestone 1 (the endpoints) and milestone 2 (validation and the right codes)." ] },
      page("Quick reference"),
      cs("the shapes", C`var g = app.MapGroup("/topics");
g.MapGet("", (string? subject) => …);
g.MapGet("{id:int}", (int id) => … ? Results.Ok(t) : Results.NotFound());
g.MapPost("", (TopicIn input) => Results.Created($"/topics/{t.Id}", t));
g.MapPut("{id:int}", (int id, TopicIn input) => Results.NoContent());
g.MapDelete("{id:int}", (int id) => Results.NoContent());`),
      { ul: [ "Binding: route, query, JSON body, services.", "`Results.Ok · Created · NoContent · NotFound · Unauthorized · ValidationProblem`.", "`MapGroup(prefix).AddEndpointFilter(…)` for what every route shares." ] }
    ],
    flashcards: [
      ["What does app.MapGet(\"/topics/{id:int}\", (int id) => …) do?", "Runs the handler for a GET whose path matches, with id bound from the route; /topics/abc does not match."],
      ["Where does a minimal API take a complex parameter like TopicIn from?", "The JSON body of the request."],
      ["Which Results method makes a 201 with a Location header?", "Results.Created(location, value)."],
      ["What is a route group for?", "A shared prefix and shared behaviour (filters, auth) for the routes in it."],
      ["Why return API records rather than entities?", "The JSON stays a contract you chose; no hidden fields, no cycles, no accidental changes."],
      ["What does Results.ValidationProblem(errors) send?", "400 with application/problem+json and an errors entry per field."]
    ],
    quiz: [
      { q: "MapGet(\"/topics/{id}\", (int id) => …) receives /topics/abc. The client gets…", opts: ["404", "400: the parameter could not be bound", "500", "200 with id 0"], ans: 1, why: "Without :int the route matches and binding fails; with {id:int} it is a 404." },
      { q: "A POST handler's TopicIn has a blank title. It should return…", opts: ["Results.Ok()", "throw ArgumentException", "Results.ValidationProblem with a title error", "Results.NotFound()"], ans: 2, why: "Invalid input is the client's to fix, and the body says how." },
      { q: "Where should an API-key check for every /topics route go?", opts: ["copied into each handler", "an endpoint filter on the /topics group (or middleware)", "the client", "appsettings.json"], ans: 1, why: "One check, applied to every route in the group, so a new route cannot forget it." }
    ]
  });

  /* ================================================================
     T1.27 Persistence, configuration and secrets
     ================================================================ */
  lesson("T1.27", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A list in memory forgets everything when the server restarts. The API needs T1C's EF Core: a database, changed by migrations.",
        "It also needs **settings** that differ between your laptop, the tests and the real server — the connection string, the API key — without changing the code.",
        "And the secret ones (the key) must never be in the repository: in development they live in **user secrets**, outside the project folder."
      ] },
      page("Core idea"),
      cs("the context, registered once: a new one for every request", C`builder.Services.AddDbContext<PlannerDb>(o =>
    o.UseSqlite(builder.Configuration.GetConnectionString("Planner")));

var app = builder.Build();
using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<PlannerDb>().Database.Migrate();   // apply any missing migrations`),
      json("appsettings.json: settings that are safe to commit", "{\n  \"ConnectionStrings\": { \"Planner\": \"Data Source=planner.db\" },\n  \"Logging\": { \"LogLevel\": { \"Default\": \"Information\" } }\n}"),
      sh("the secret: user secrets, kept outside the repository", "cd src/Planner.Api\ndotnet user-secrets set \"Planner:ApiKey\" \"a-long-random-key-of-your-own\"\ndotnet user-secrets list"),
      cs("read where it is needed, by name", C`string key = app.Configuration["Planner:ApiKey"] ?? "";   // "" when nothing set it: refuse everything`),
      { ul: [
        "`AddDbContext` registers the context as **scoped**: each request gets its own and it is disposed afterwards — just right for T1C's short-lived contexts.",
        "`Database.Migrate()` at start-up brings the database up to the latest migration (`dotnet ef migrations add …` makes them, T1.14).",
        "**Configuration** is layered: `appsettings.json`, then `appsettings.{Environment}.json`, then user secrets (Development only), then environment variables (`Planner__ApiKey`), then the command line. A later layer wins."
      ] },
      page("Rules"),
      { table: { head: ["Setting", "Where it lives"], rows: [
        ["defaults, safe for anyone to see", "`appsettings.json` (committed)"],
        ["differences per environment", "`appsettings.Development.json`, `appsettings.Production.json`"],
        ["**secrets in development**", "user secrets (`dotnet user-secrets`), in your user folder"],
        ["secrets on a server", "environment variables or a secret store, set by whoever runs it"],
        ["a test's settings", "`WebApplicationFactory`'s `UseSetting` (T1.28)"]
      ] } },
      { ul: [
        "The environment is `ASPNETCORE_ENVIRONMENT`: `Development` on your machine (launchSettings.json), `Production` by default, anything you like in tests (`Testing`).",
        "A **missing secret means refuse**, never \"open\": an API that lets everyone in when the key is unset will one day be deployed without it.",
        "Compare keys with `CryptographicOperations.FixedTimeEquals`, so the time taken does not leak how much of a guess was right.",
        "Persistence design: one entity per table, the API's records separate from them, relationships with an explicit delete rule (`OnDelete(DeleteBehavior.Cascade)` for sessions that mean nothing without their topic)."
      ] },
      page("Variations"),
      { h: "The model behind the planner" },
      cs("a topic and its study sessions", C`public class Topic
{
    public int Id { get; set; }
    public string Subject { get; set; } = "";
    public string Title { get; set; } = "";
    public int Confidence { get; set; }
    public DateOnly? LastStudied { get; set; }
    public List<StudySession> Sessions { get; } = new();
}

protected override void OnModelCreating(ModelBuilder model) =>
    model.Entity<Topic>().HasMany(t => t.Sessions).WithOne().HasForeignKey(s => s.TopicId).OnDelete(DeleteBehavior.Cascade);`),
      { h: "The first migration" },
      sh("the tool is pinned in .config/dotnet-tools.json", "dotnet tool restore\ndotnet ef migrations add Initial --project src/Planner.Api"),
      { h: "An environment variable instead" },
      sh("two underscores stand for the colon", "export Planner__ApiKey=a-long-random-key-of-your-own\ndotnet run --project src/Planner.Api"),
      page("Pitfalls"),
      { h: "No migrations applied" },
      txt("the first POST, when nothing created the tables", "Microsoft.Data.Sqlite.SqliteException : SQLite Error 1: 'no such table: Topics'."),
      "Call `Database.Migrate()` at start-up (after `dotnet ef migrations add`). `EnsureCreated()` makes tables once and can never change them again.",
      { h: "Returning entities: a cycle" },
      txt("GET /topics/1 returning a Topic whose sessions point back at it", "System.Text.Json.JsonException : A possible object cycle was detected. This can either be due to a cycle or if the object depth is larger than the maximum allowed depth of 64. Consider using ReferenceHandler.Preserve on JsonSerializerOptions to support cycles. Path: $.Sessions.Topic.Sessions.Topic…"),
      "Map to an API record (`TopicOut.Of(t)`) with only the fields the client gets.",
      { h: "The key in appsettings.json" },
      "It works, and it is committed, pushed and public. Keys go in user secrets; `appsettings.json` holds only what anyone may read. If one slipped in: revoke it, make a new one — the old one is in Git's history for good.",
      page("Connections"),
      { ul: [ "**Back:** T1C EF Core and migrations; 11.3 configuration in layers; T1.22 keys and secrets.", "**Next:** T1.28 a fresh database and a test key for every test.", "**Capstone:** milestone 3 (persisted, with sessions) and milestone 4 (locked with a key)." ] },
      page("Good practice"),
      { ul: [ "Migrate at start-up; never EnsureCreated outside throw-away tests.", "Committed settings are public settings; secrets live in user secrets or the environment.", "Unset secret, closed door." ] },
      page("Practise"),
      { ul: [ "**Capstone:** *The Planner goes online* — milestones 3 and 4." ] },
      page("Quick reference"),
      cs("the pieces", C`builder.Services.AddDbContext<PlannerDb>(o => o.UseSqlite(builder.Configuration.GetConnectionString("Planner")));
scope.ServiceProvider.GetRequiredService<PlannerDb>().Database.Migrate();
string key = app.Configuration["Planner:ApiKey"] ?? "";
bool ok = key.Length > 0 && CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(given), Encoding.UTF8.GetBytes(key));`),
      { ul: [ "`dotnet user-secrets set \"Planner:ApiKey\" …` · `dotnet ef migrations add Initial`.", "Layers: appsettings → appsettings.{Env} → user secrets (Development) → environment → command line.", "`Planner__ApiKey` is `Planner:ApiKey` in an environment variable." ] }
    ],
    flashcards: [
      ["What lifetime does AddDbContext give the context?", "Scoped: one per request, disposed after it."],
      ["Where do secrets live in development?", "User secrets (dotnet user-secrets), stored in your user folder, outside the repository."],
      ["Which configuration layer wins: appsettings.json or an environment variable?", "The environment variable (later layers override earlier ones)."],
      ["How is Planner:ApiKey written as an environment variable?", "Planner__ApiKey — two underscores for the colon."],
      ["Why Migrate() rather than EnsureCreated() in an app?", "Migrate applies each migration, so the schema can change later; EnsureCreated can only create once."],
      ["What should an API do when its key is not configured?", "Refuse every protected request — never fall open."]
    ],
    quiz: [
      { q: "The API works on your laptop but the tests read your real key. Why?", opts: ["tests always read user secrets", "the tests run in Development, which loads user secrets — run them as Testing", "the key is in Git", "EF Core"], ans: 1, why: "User secrets load only in Development; give the tests their own environment and key." },
      { q: "GET /topics/1 throws \"A possible object cycle was detected\". The best fix…", opts: ["ReferenceHandler.IgnoreCycles", "return a TopicOut record", "delete the sessions", "use XML"], ans: 1, why: "An API record holds exactly what the client gets." },
      { q: "A teammate's run fails with \"no such table: Topics\". Most likely…", opts: ["SQLite is not installed", "the migrations were never applied", "the key is wrong", "the route is wrong"], ans: 1, why: "Nothing created the tables: migrate at start-up." }
    ]
  });

  /* ================================================================
     T1.28 Testing an API with WebApplicationFactory
     ================================================================ */
  lesson("T1.28", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Unit tests check a method. An API's bugs live between the pieces: a route that does not match, a filter that lets a request through, a status that is 200 where it should be 201, JSON with the wrong names.",
        "**WebApplicationFactory** (Microsoft.AspNetCore.Mvc.Testing) starts your whole app — `Program.cs`, DI, routing, filters, EF Core — in memory, and hands you an `HttpClient` that talks to it with no network.",
        "So a test is T1D's client code against your own server: send a request, check the status, the headers and the JSON."
      ] },
      page("Core idea"),
      sh("the package, in the test project", "dotnet add tests/Planner.Tests package Microsoft.AspNetCore.Mvc.Testing"),
      cs("a factory with the test's own settings", C`public sealed class App : WebApplicationFactory<Program>
{
    public string DbFile { get; } = Path.Combine(Path.GetTempPath(), $"planner-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");                                   // no user secrets
        builder.UseSetting("ConnectionStrings:Planner", $"Data Source={DbFile}");
        builder.UseSetting("Planner:ApiKey", "test-key");
    }
}`),
      cs("a test: request in, status and JSON out", C`[Fact]
public async Task Creating_a_topic_answers_201_with_its_location()
{
    await using var app = new App();
    var client = app.CreateClient();
    client.DefaultRequestHeaders.Add("X-Api-Key", "test-key");

    var response = await client.PostAsJsonAsync("/topics", new { subject = "cs", title = "Big O", confidence = 3 });

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    Assert.Equal("/topics/1", response.Headers.Location!.OriginalString);
    var topic = await response.Content.ReadFromJsonAsync<TopicOut>();
    Assert.Equal("Big O", topic!.Title);
}`),
      { ul: [
        "`WebApplicationFactory<Program>` finds your app through its `Program` class. .NET 10 makes the top-level `Program` public for you; older versions needed a `public partial class Program;` line at the end of Program.cs.",
        "`ConfigureWebHost` changes the app for the test: its environment, its settings (`UseSetting`), even its services (`ConfigureTestServices`).",
        "Each test gets a fresh database file, so no test sees another's topics; delete it afterwards."
      ] },
      page("Rules"),
      { table: { head: ["Test", "Checks"], rows: [
        ["the happy path", "status, `Location`, the JSON's fields"],
        ["each validation rule", "400, `application/problem+json`, the field's message — and that nothing was saved"],
        ["not found", "404 for a missing id, on every route that takes one"],
        ["security", "401 with no key, a wrong key, and no key configured; open routes stay open"],
        ["persistence", "a second app on the same database still sees the data"],
        ["edges", "60 characters allowed, 61 not; confidence 1 and 5 allowed, 0 and 6 not"]
      ] } },
      { ul: [
        "Test through HTTP, as a client would: the routes, the status codes and the JSON are the API's contract.",
        "One database per test (or per class with an `IClassFixture`, reset between tests): shared state makes tests pass or fail by order.",
        "Name tests by behaviour (`A_wrong_key_is_401_and_changes_nothing`) and check one behaviour each.",
        "A test environment of its own (`Testing`) keeps your user secrets and your development database out of the tests."
      ] },
      page("Variations"),
      { h: "One app for a whole class" },
      cs("IClassFixture: started once, shared by the class's tests", C`public class TopicsTests(App app) : IClassFixture<App>
{
    [Fact]
    public async Task Health_needs_no_key() =>
        Assert.Equal(HttpStatusCode.OK, (await app.CreateClient().GetAsync("/health")).StatusCode);
}`),
      { h: "Replacing a service" },
      cs("ConfigureTestServices swaps a real service for a fake one", C`builder.ConfigureTestServices(services =>
{
    services.RemoveAll<TimeProvider>();
    services.AddSingleton<TimeProvider>(new FakeTimeProvider(new DateTimeOffset(2026, 10, 20, 9, 0, 0, TimeSpan.Zero)));
});`),
      { h: "Looking at the database directly" },
      cs("a test may read the SQLite file the app wrote", C`using var db = new SqliteConnection($"Data Source={app.DbFile}");
db.Open();
using var cmd = db.CreateCommand();
cmd.CommandText = "SELECT COUNT(*) FROM __EFMigrationsHistory";
Assert.True((long)cmd.ExecuteScalar()! >= 1);`),
      page("Pitfalls"),
      { h: "Tests that share a database" },
      txt("a list test that ran after a create test, on the same file", "Assert.Empty() Failure: Collection was not empty\nCollection: [TopicOut { Id = 1, Subject = \"cs\", Title = \"Big O\", … }]"),
      "It passed alone and fails in the full run. A database per test — or reset it in the fixture before each one.",
      { h: "The header the test forgot" },
      txt("a happy-path test without X-Api-Key", "Assert.Equal() Failure: Values differ\nExpected: Created\nActual:   Unauthorized"),
      "The key check works — the test was wrong. Make the client with the key in one helper, and test the missing key on purpose, once.",
      { h: "Tests that read your secrets" },
      "Without `UseEnvironment(\"Testing\")` the app starts as Development and loads your user secrets: the tests pass on your machine with your real key and fail everywhere else. Give the tests their own environment and settings.",
      page("Connections"),
      { ul: [ "**Back:** 10.x xUnit; T1D's HttpClient and JSON; T1.26–T1.27 what is being tested.", "**Next:** T6 security in depth; T5's pipelines run these tests on every push.", "**Capstone:** milestone 5 — six or more of your own end-to-end tests." ] },
      page("Good practice"),
      { ul: [ "Every rule in the brief has a test, success and failure.", "Fresh database, own environment, own key — every test.", "Check status, headers and JSON; never just \"it did not throw\"." ] },
      page("Practise"),
      { ul: [ "**Capstone:** *The Planner goes online* — milestone 5, your own tests through WebApplicationFactory." ] },
      page("Quick reference"),
      cs("the pieces", C`class App : WebApplicationFactory<Program> { protected override void ConfigureWebHost(IWebHostBuilder b) { b.UseEnvironment("Testing"); b.UseSetting("Planner:ApiKey", "k"); } }
await using var app = new App();
var client = app.CreateClient();
var r = await client.PostAsJsonAsync("/topics", new { … });
Assert.Equal(HttpStatusCode.Created, r.StatusCode);`),
      { ul: [ "`WebApplicationFactory<Program>`, `CreateClient()`, `ConfigureWebHost`.", "`UseEnvironment` · `UseSetting` · `ConfigureTestServices`.", "`IClassFixture<App>` to share one app across a class." ] }
    ],
    flashcards: [
      ["What does WebApplicationFactory<Program> do?", "Starts the whole app in memory and gives HttpClients that talk to it without a network."],
      ["How does a test give the app its own settings?", "ConfigureWebHost: UseSetting(key, value), UseEnvironment, ConfigureTestServices."],
      ["Why UseEnvironment(\"Testing\") in API tests?", "So the app does not load Development's user secrets or settings."],
      ["Why a database per test?", "So no test depends on another's data or on the order they run."],
      ["What replaces a registered service in a test?", "ConfigureTestServices(services => { … }) — remove the real one, add a fake."],
      ["What did older .NET versions need for WebApplicationFactory<Program> with top-level statements?", "public partial class Program; at the end of Program.cs (.NET 10 generates it)."]
    ],
    quiz: [
      { q: "A test passes alone and fails in the full run. Most likely…", opts: ["a slow machine", "tests share a database or other state", "xUnit is broken", "the route is wrong"], ans: 1, why: "Order-dependent results mean shared state." },
      { q: "Which is the end-to-end check that a wrong key changes nothing?", opts: ["call the handler directly", "POST with a wrong key, expect 401, then GET with the right key and see no new topic", "read appsettings.json", "check the filter's code"], ans: 1, why: "Through HTTP, the status, and the state afterwards." },
      { q: "UseSetting(\"Planner:ApiKey\", \"k\") in ConfigureWebHost…", opts: ["writes appsettings.json", "gives this test's app that setting, above the files", "sets an environment variable for the machine", "needs user secrets"], ans: 1, why: "It is one more configuration layer, for this app only." }
    ]
  });

  /* ================================================================
     retrieval cards (command cards) for T1F
     ================================================================ */
  K.add({ cards: {
    "t1f-minimal": { title: "Minimal APIs", lesson: "T1.26", concepts: ["minimal-api"], kind: "command",
      vary: function (r) {
        var res = pick(r, ["topics", "books", "notes"]);
        var q = pick(r, [
          ["Type the route pattern for one of the " + res + " by an id that must be a number.", "/" + res + "/{id:int}", ["^\"?/?" + res + "/\\{id:int\\}\"?$"]],
          ["Type the line that makes a route group for /" + res + " called g on app.", "var g = app.MapGroup(\"/" + res + "\");", ["^var g = app\\.MapGroup\\(\"/" + res + "\"\\);?$"]],
          ["Which Results method answers 201 with a Location header (just the method)?", "Results.Created", ["^Results\\.Created(\\(.*\\))?;?$"]],
          ["Which Results method answers 400 with an error per field (just the method)?", "Results.ValidationProblem", ["^Results\\.ValidationProblem(\\(.*\\))?;?$"]],
          ["Type the command that makes an empty ASP.NET Core project in src/Planner.Api.", "dotnet new web -o src/Planner.Api", ["^dotnet new web (-o|--output) (\\./)?src/Planner\\.Api$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(new RegExp("/?" + res, "g"), "a resource"), params: [res], answer: q[1], accept: q[2], hint: "{id:int} · MapGroup · Results.Created · Results.ValidationProblem · dotnet new web." };
      } },
    "t1f-config": { title: "Data and settings", lesson: "T1.27", concepts: ["api-persistence"], kind: "command",
      vary: function (r) {
        var key = pick(r, ["Planner:ApiKey", "Weather:ApiKey", "Mail:Password"]);
        var q = pick(r, [
          ["Type the command that stores " + key + " in user secrets with the value s3cret.", "dotnet user-secrets set \"" + key + "\" \"s3cret\"", ["^dotnet user-secrets set \"?" + key.replace(":", "\\:") + "\"? \"?s3cret\"?$"]],
          ["Type the environment variable name that sets " + key + ".", key.replace(":", "__"), ["^" + key.replace(":", "__") + "$"]],
          ["Which DatabaseFacade method applies the missing migrations at start-up?", "Migrate", ["^(db\\.)?(Database\\.)?Migrate(\\(\\))?;?$"]],
          ["Which environment loads user secrets automatically?", "Development", ["^Development$"]],
          ["Which method compares two byte arrays in constant time (class and method)?", "CryptographicOperations.FixedTimeEquals", ["^(System\\.Security\\.Cryptography\\.)?CryptographicOperations\\.FixedTimeEquals(\\(.*\\))?;?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(key, "a setting"), params: [key], answer: q[1], accept: q[2], hint: "dotnet user-secrets set · A__B · Migrate · Development · FixedTimeEquals." };
      } },
    "t1f-testing": { title: "Testing an API", lesson: "T1.28", concepts: ["api-testing"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Type the command that adds the package for WebApplicationFactory to tests/Planner.Tests.", "dotnet add tests/Planner.Tests package Microsoft.AspNetCore.Mvc.Testing", ["^dotnet add (\\./)?tests/Planner\\.Tests(/Planner\\.Tests\\.csproj)? package Microsoft\\.AspNetCore\\.Mvc\\.Testing( (-v|--version) \\S+)?$"]],
          ["Which WebApplicationFactory method gives an HttpClient to the app in memory?", "CreateClient", ["^(app\\.|factory\\.)?CreateClient(\\(\\))?;?$"]],
          ["Type the line in ConfigureWebHost that sets the environment to Testing, on builder.", "builder.UseEnvironment(\"Testing\");", ["^builder\\.UseEnvironment\\(\"Testing\"\\);?$"]],
          ["Type the line in ConfigureWebHost that sets Planner:ApiKey to k, on builder.", "builder.UseSetting(\"Planner:ApiKey\", \"k\");", ["^builder\\.UseSetting\\(\"Planner:ApiKey\", ?\"k\"\\);?$"]],
          ["Which xUnit interface shares one app across a test class (without its type argument)?", "IClassFixture", ["^IClassFixture(<\\w*>)?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], hint: "Microsoft.AspNetCore.Mvc.Testing · CreateClient · UseEnvironment · UseSetting · IClassFixture." };
      } }
  } });

  /* ================================================================
     the part's project: Track T1's capstone, The Planner goes online;
     its files are generated into code-projects-files.js
     ================================================================ */
  K.project("rp-ct1-planner", {
    unit: "T1F", capstone: "CT1", title: "The Planner goes online", folder: "planner-api", solution: "PlannerApi.sln",
    scaffoldVersion: 1, minValidator: "1.1.0", sdk: ".NET 10 SDK",
    summary: "Track T1's capstone: the revision planner as a web API — minimal APIs, validation as problem details, EF Core with migrations, an API key from configuration and end-to-end tests — built and proven in Rider.",
    brief: [
      "The Track T1 capstone's project. Its milestones are the capstone's build: an accepted report passes them, and the capstone pays when it is submitted.",
      { ul: [
        "`src/Planner.Api` starts as a health check: the endpoints, the data and the key are yours. `dotnet-ef` is pinned in the tool manifest.",
        "Kurenai's tests start the app with `WebApplicationFactory` on their own SQLite file, in a `Testing` environment, with their own key.",
        "`Directory.Build.props`, `tests/Planner.Acceptance/` and `.kurenai/validate.cs` are **protected**."
      ] }
    ],
    milestones: [
      { id: "m1", title: "The endpoints", lessons: ["T1.26"], about: "Health, list, read, create (201 and its Location), replace and delete, with 404s.", checks: [{ type: "tests", class: "Milestone1" }] },
      { id: "m2", title: "Validation and the right codes", lessons: ["T1.26", "T1.21"], about: "Problem details with a message per field; trimmed input; the subject filter; {id:int} routes.", checks: [{ type: "tests", class: "Milestone2" }] },
      { id: "m3", title: "Persisted, with sessions", lessons: ["T1.27"], about: "EF Core on SQLite, made by migrations at start-up; topics survive a restart; the sessions sub-resource; a cascade delete.", checks: [{ type: "tests", class: "Milestone3" }, { type: "source", path: "src/Planner.Api", contains: ["Migrate\\s*\\("], forbids: ["EnsureCreated"] }] },
      { id: "m4", title: "Locked with a key", lessons: ["T1.27", "T1.22"], about: "X-Api-Key on every /topics route, read from Planner:ApiKey; closed when no key is set; /health open.", checks: [{ type: "tests", class: "Milestone4" }, { type: "source", path: "src/Planner.Api", contains: ["Planner:ApiKey"] }] },
      { id: "m5", title: "Tested end to end and committed", lessons: ["T1.28"], about: "Six or more of your own tests through WebApplicationFactory; no warnings; committed.",
        checks: [{ type: "source", path: "tests/Planner.Tests", contains: ["WebApplicationFactory"] }, { type: "owntests", prefix: "Planner.Tests.", min: 6 }, { type: "warnings", max: 0 }, { type: "git" }] }
    ],
    protected: ["Directory.Build.props", "tests/Planner.Acceptance/Planner.Acceptance.csproj", "tests/Planner.Acceptance/Api.cs", "tests/Planner.Acceptance/Milestone1.cs", "tests/Planner.Acceptance/Milestone2.cs", "tests/Planner.Acceptance/Milestone3.cs", "tests/Planner.Acceptance/Milestone4.cs", ".kurenai/validate.cs"],
    reward: null
  });

  /* ================================================================
     Track T1's capstone (frame 26l, in Rider): The Planner goes online
     ================================================================ */
  K.capstone("CT1", {
    track: "T1",
    minutes: 420,
    project: "rp-ct1-planner",
    summary: "The revision planner as a web API — REST routes, validation as problem details, EF Core with migrations, an API key from configuration and user secrets, and end-to-end tests — made in Rider and proven by validation reports.",
    quiz: [
      { q: "POST /topics succeeds. Which answer is right?", opts: ["200 and the topic", "201, Location: /topics/7, and the topic", "204", "302 to /topics/7"], ans: 1, lesson: "T1.21", why: "Created, and where the new resource lives." },
      { q: "GET /topics/abc against MapGet(\"/topics/{id:int}\", …) answers…", opts: ["400", "404: no route matches", "500", "200 with an empty topic"], ans: 1, lesson: "T1.26", why: "The constraint keeps abc from matching at all." },
      { q: "Where does the API key live while you develop?", opts: ["appsettings.json", "a const in Program.cs", "user secrets, outside the repository", "the .http file, committed"], ans: 2, lesson: "T1.27", why: "Nothing in the folder may hold a secret." },
      { q: "A request carries no X-Api-Key. The API should answer…", opts: ["403", "401", "404", "200, because the key is optional"], ans: 1, lesson: "T1.22", why: "No credentials: unauthenticated." },
      { q: "How do the tests keep your user secrets and development database out?", opts: ["they cannot", "UseEnvironment(\"Testing\") and UseSetting for the connection string and key", "by deleting the secrets first", "by running in Production"], ans: 1, lesson: "T1.28", why: "Their own environment and settings, layered over the files." }
    ],
    brief: [
      "Build **the Planner goes online**: capstone 4's revision planner — topics with a confidence from 1 to 5, and the study sessions that move their last-studied day — as a web API other programs can use. You build it in **Rider** with ASP.NET Core minimal APIs and EF Core, test it end to end, and bring each milestone back as a validation report.",
      { h: "The solution" },
      { table: { head: ["Project", "What it holds"], rows: [
        ["`src/Planner.Api`", "`Program.cs` (a health check to start from), `appsettings.json` (the connection string, no secrets), `Planner.Api.http` to try it from Rider"],
        ["`tests/Planner.Tests`", "**your** end-to-end tests; an example shows the factory"],
        ["`tests/Planner.Acceptance`", "Kurenai's tests for milestones 1–4 (**protected**)"]
      ] } },
      { h: "The routes" },
      { table: { head: ["Request", "Answer"], rows: [
        ["`GET /health`", "200 — no key needed"],
        ["`GET /topics` (`?subject=cs`)", "200, the topics in id order"],
        ["`GET /topics/{id}`", "200 or 404"],
        ["`POST /topics`", "201 + `Location: /topics/{id}`; 400 invalid"],
        ["`PUT /topics/{id}`", "204 (last-studied day kept); 404; 400"],
        ["`DELETE /topics/{id}`", "204 (its sessions too); 404"],
        ["`GET` / `POST /topics/{id}/sessions`", "200 by date / 201 + `Location: /topics/{id}/sessions/{sid}`; 404; 400"]
      ] } },
      { h: "The rules" },
      { ul: [
        "A topic is `{\"id\",\"subject\",\"title\",\"confidence\",\"lastStudied\"}`; a session `{\"id\",\"topicId\",\"date\",\"minutes\"}`. Subject and title trimmed, the subject in lower case.",
        "Validation answers 400 problem details, one `errors` entry per field: `Choose a subject.` · `Give the topic a title.` · `At most 60 characters.` · `Confidence is 1 to 5.` · `Minutes are 1 to 600.`",
        "Every `/topics` route needs `X-Api-Key` equal to `Planner:ApiKey` from configuration (user secrets in development); with no key set, nothing is open.",
        "The database is SQLite through EF Core, made by migrations applied at start-up; the connection string is `ConnectionStrings:Planner`."
      ] },
      call("tip", "Track T1", ["Each milestone leans on a part you have done: T1.21's status codes, T1C's EF Core and migrations, T1.22's keys, T1D's HttpClient and JSON in every test. Build the routes first against a list in memory, then move them onto EF Core, running Kurenai's tests as you go."]),
      { h: "Useful pieces" },
      { code: { lang: "csharp", src: 'var topics = app.MapGroup("/topics").AddEndpointFilter(async (context, next) => …);\ntopics.MapPost("", async (TopicIn input, PlannerDb db) => …);\nreturn Results.ValidationProblem(new Dictionary<string, string[]> { ["title"] = new[] { "Give the topic a title." } });\nscope.ServiceProvider.GetRequiredService<PlannerDb>().Database.Migrate();' } }
    ],
    rubric: [
      { id: "correct", title: "Correctness · validation milestones", auto: true, max: 12 },
      { id: "rest", title: "REST and API design", max: 4, guide: ["Verbs in URLs, 200 for everything", "Resources, but codes and bodies uneven", "Every route's status and body as the brief says", "Problem details everywhere; entities never leak", "A stranger could use it from the routes alone"] },
      { id: "security", title: "Security and configuration", max: 4, guide: ["A key in the code", "A key in a committed file", "User secrets; the check on every route", "Closed when unset; constant-time compare", "Nothing in the repository a stranger could use"] },
      { id: "tests", title: "Tests", max: 4, guide: ["Happy paths only", "Some failures tested", "Every rule, success and failure", "Edges (60/61, 1/5) and persistence", "A failing test names the broken rule"] }
    ],
    writeupMin: 100,
    writeupPrompts: ["Which status code or validation rule took the most thought, and why that answer?", "Where does the API key live in each place the API runs — your machine, the tests, a server — and what happens when it is missing?", "Which of your own tests caught a real mistake, and what would you test next?"],
    reward: { xp: 250, gold: 60, hp: 10 }
  });
})();
