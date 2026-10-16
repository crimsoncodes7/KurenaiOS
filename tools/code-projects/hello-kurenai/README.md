# Hello, Kurenai

The Bridge B checkpoint from KurenaiOS (Code → Bridge B). A small solution of
three projects: a library (`src/Greeter`), a console app that uses it
(`src/Hello`) and Kurenai's acceptance tests (`tests/Hello.Acceptance`).

## Work on it

1. Open `HelloKurenai.sln` in JetBrains Rider (or run `dotnet build` here).
2. Do the milestones in `BRIEF.md`, one at a time.
3. Validate: run the **Kurenai Validate** configuration in Rider's toolbar, or
   `dotnet run .kurenai/validate.cs` in a terminal.
4. Import the newest file in `.kurenai/reports/` into KurenaiOS
   (Code → Hello, Kurenai → Validation).

The files in `tests/`, `Directory.Build.props` and `.kurenai/validate.cs` are
protected: change them and the report counts as practice only.
