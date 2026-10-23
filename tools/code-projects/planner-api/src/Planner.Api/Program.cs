// The Planner goes online (BRIEF.md): the endpoints, validation, EF Core
// and the API key are yours to add, milestone by milestone.
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
