# Brief

1. **It builds.** Open the solution and build it (Rider: Build, or `dotnet build`).
2. **Greetings by the hour.** Write `Greetings.For(name, hour)` in
   `src/Greeter/Greetings.cs`: "Good morning, Ada!" before 12, "Good
   afternoon, …" before 18, then "Good evening, …". The tests in
   `tests/Hello.Acceptance/Milestone2.cs` say exactly what is wanted.
3. **Fix the bug with the debugger.** Run `src/Hello` with the name Ada and
   the hour 20: it greets the wrong part of the day. Set a breakpoint, step,
   watch the variables, and fix the one wrong line in `Program.cs`.
4. **A package.** Add the NuGet package `Humanizer.Core` (version 3.0.10 —
   3.0.8 is broken) to `src/Greeter`, then write `Greetings.Describe(hour)`
   with its `ToWords()`: 3 → "three o'clock", 15 → "three o'clock", 0 →
   "twelve o'clock".
5. **Committed with Git.** Make the folder a Git repository and commit your
   work, so the working tree is clean.
