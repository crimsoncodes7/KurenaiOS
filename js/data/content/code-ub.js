/* Kurenai OS — data/content/code-ub.js
   Code · Bridge B · Your real toolkit (roadmap 5.3; docs/code-plan.md
   §3.1, §9). Between stage 2 and stage 3: the .NET SDK and JetBrains
   Rider, the dotnet command line, solutions and NuGet, the debugger, Git
   and GitHub, documentation, and the Kurenai validation workflow.

   These lessons are done in Rider, not in the in-app runner, so they hold
   the Rider form of the notes contract (smoke75): the same pages in order,
   commands and files as blocks rather than runnable listings (where C#
   does run in-app it is a listing, held to .NET by tools/cs_diff.mjs), a
   Pitfalls page, flashcards and a quiz. Their work is the Bridge project,
   "Hello, Kurenai" (rp-bridge-hello; its files are generated into
   code-projects-files.js from tools/code-projects/hello-kurenai/): exported
   as a zip, built in Rider, validated by assets/code/validator/validate.cs
   and brought back as a report — its milestones are each lesson's task
   check. Their retrieval cards are COMMAND cards: the answer is the
   command, checked against the forms it may take, never self-marked.     */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function run(id, cap, src, stdin) { return { run: { id: id, cap: cap, src: src, stdin: stdin || "" } }; }
  function runFails(id, cap, src) { return { run: { id: id, cap: cap, src: src, stdin: "", fails: true } }; }
  function sh(cap, src) { return { code: { lang: "shell", src: src, cap: cap } }; }
  function file(cap, lang, src) { return { code: { lang: lang, src: src, cap: cap } }; }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }

  K.add({ concepts: {
    "sdk": { name: "The .NET SDK", lesson: "B.1", about: "dotnet, SDKs and runtimes" },
    "dotnet-cli": { name: "The dotnet CLI", lesson: "B.2", about: "new, build, run" },
    "solutions": { name: "Solutions", lesson: "B.3", about: "projects together" },
    "nuget": { name: "NuGet packages", lesson: "B.3", about: "other people's code" },
    "debugger": { name: "The debugger", lesson: "B.4", about: "breakpoints and stepping" },
    "git": { name: "Git", lesson: "B.5", about: "commits and branches" },
    "github": { name: "GitHub remotes", lesson: "B.6", about: "push, pull, clone" },
    "docs": { name: "Reading docs", lesson: "B.7", about: "Microsoft Learn and Quick Documentation" },
    "validation": { name: "Validation reports", lesson: "B.8", about: "build, test, import" }
  } });

  /* ================================================================
     B.1 Installing .NET and Rider
     ================================================================ */
  lesson("B.1", {
    notes: [
      page("The problem it solves"),
      { ul: [ "The in-app runner is a teaching tool: one file, a few hundred lines, no packages, no real disk.", "Real programs are projects: several files, libraries from NuGet, tests, a debugger and version control.", "Two installs give you the real thing: the **.NET SDK** (the compiler and the `dotnet` command) and **JetBrains Rider** (the IDE). Both are free for learning." ] },
      page("Core idea"),
      sh("is it installed? (any terminal)", "dotnet --version\ndotnet --list-sdks"),
      { ol: [ "Install the **.NET 10 SDK** from dot.net (the SDK, not just the runtime).", "Open a NEW terminal and run `dotnet --version`: you should see `10.0.…`.", "Install **Rider** with the JetBrains Toolbox app; choose the free non-commercial licence.", "In Rider: **New Solution → Console**, name it `Hello`, press **Run** (▶)." ] },
      { table: { head: ["Piece", "What it is", "You need it for"], rows: [["SDK", "compiler, `dotnet` command, templates", "building anything"], ["Runtime", "what runs a built program", "running only (the SDK includes one)"], ["Rider", "editor, debugger, test runner, Git", "working comfortably"], ["global.json", "a file that pins the SDK version", "projects that must agree"]] } },
      page("Rules"),
      { ul: [
        "Install the **SDK**; a runtime alone cannot build.",
        "Several SDKs can sit side by side; `dotnet` picks the newest unless a `global.json` asks for another.",
        "After an install, open a new terminal so the new `PATH` is read.",
        "Rider uses the SDK it finds on the `PATH` (Settings → Build, Execution, Deployment → Toolset)."
      ] },
      page("Variations"),
      { h: "Installing from a package manager" },
      sh("macOS (Homebrew)", "brew install --cask dotnet-sdk"),
      sh("Windows (winget)", "winget install Microsoft.DotNet.SDK.10"),
      sh("Linux (Ubuntu)", "sudo apt-get update && sudo apt-get install -y dotnet-sdk-10.0"),
      { h: "Everything the SDK knows about itself" },
      sh("the SDK, the runtimes and where they live", "dotnet --info\ndotnet --list-runtimes"),
      { h: "Pinning a version" },
      file("global.json at the top of a project", "json", "{\n  \"sdk\": { \"version\": \"10.0.100\", \"rollForward\": \"latestFeature\" }\n}"),
      "`latestFeature` accepts any newer 10.0.x feature band, so a machine with 10.0.302 still builds a project that asks for 10.0.100.",
      page("Pitfalls"),
      { h: "\"dotnet: command not found\"" },
      "The terminal was opened before the install, or the SDK folder is not on the `PATH`. Open a new terminal; on macOS check `/usr/local/share/dotnet` is on it.",
      { h: "\"No .NET SDKs were found\"" },
      "Only a runtime is installed. Install the SDK.",
      { h: "\"A compatible .NET SDK was not found\"" },
      sh("a global.json asks for an SDK you do not have", "Requested SDK version: 11.0.100\nglobal.json file: /Users/ada/project/global.json"),
      "Install that SDK, or (if the project allows it) change `rollForward` or the version in `global.json`.",
      page("Connections"),
      { ul: [ "**Next:** B.2 drives the same SDK from the terminal.", "**Later:** every Rider project from here on has a `global.json`, and the validator (B.8) records the SDK it ran with." ] },
      page("Good practice"),
      { ul: [ "Keep one current SDK and update it; uninstall ones nothing uses.", "Pin the SDK with `global.json` in shared projects, with `rollForward: latestFeature`.", "Learn Rider's search: Shift twice (Search Everywhere) finds any file, class or action." ] },
      page("Practise"),
      { ul: [ "**The Bridge project, milestone 1:** open *Hello, Kurenai* in Rider and build it (this lesson's Tasks tab opens the project)." ] },
      page("Quick reference"),
      sh("the four commands", "dotnet --version      # the SDK in use\ndotnet --list-sdks    # every SDK installed\ndotnet --list-runtimes\ndotnet --info         # everything, for a bug report"),
      { ul: [ "SDK to build, runtime to run; the SDK includes a runtime.", "New terminal after installing.", "`global.json` pins the SDK; `rollForward` decides how strictly." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["dotnet: command not found", "not on the PATH yet", "Pitfalls"], ["No .NET SDKs were found", "only a runtime", "Pitfalls"], ["A compatible .NET SDK was not found", "global.json wants another SDK", "Pitfalls"]] } }
    ],
    flashcards: [
      ["SDK or runtime: which one builds a program?", "The SDK (it includes a runtime too)."],
      ["Which command prints the SDK version in use?", "`dotnet --version`."],
      ["What does `global.json` do?", "Pins the SDK version a project builds with."],
      ["`rollForward: latestFeature` means…", "Any newer feature band of the same major version is accepted."],
      ["After installing the SDK, `dotnet` is not found. First thing to try?", "Open a new terminal (the PATH is read when it starts)."]
    ],
    quiz: [
      { q: "To build C# projects you must install…", opts: ["the .NET SDK", "the .NET runtime only", "Rider only", "NuGet"], ans: 0, why: "The SDK holds the compiler and the dotnet command." },
      { q: "`dotnet --list-sdks` shows…", opts: ["every SDK installed", "the packages in a project", "the running programs", "the runtimes only"], ans: 0, why: "One line per SDK, with its folder." },
      { q: "A project's global.json asks for 11.0.100 and you have 10.0.302. dotnet…", opts: ["stops: a compatible SDK was not found", "builds with 10.0.302 anyway", "downloads 11", "ignores global.json"], ans: 0, why: "It refuses unless rollForward allows the SDK you have." }
    ]
  });

  /* ================================================================
     B.2 The dotnet command line
     ================================================================ */
  lesson("B.2", {
    notes: [
      page("The problem it solves"),
      { ul: [ "Rider's buttons are the `dotnet` command underneath. Knowing the command means you can build anywhere: a terminal, a server, GitHub Actions.", "Four verbs do most of it: `new`, `build`, `run`, `test`." ] },
      page("Core idea"),
      sh("a new console app, built and run", "dotnet new console -o Grades\ncd Grades\ndotnet run"),
      file("what `dotnet new console` made: Grades/Grades.csproj", "xml", "<Project Sdk=\"Microsoft.NET.Sdk\">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net10.0</TargetFramework>\n    <ImplicitUsings>enable</ImplicitUsings>\n    <Nullable>enable</Nullable>\n  </PropertyGroup>\n</Project>"),
      { table: { head: ["Command", "Does"], rows: [["`dotnet new console -o Name`", "a project from a template, in folder Name"], ["`dotnet build`", "compile into `bin/`"], ["`dotnet run`", "build if needed, then run"], ["`dotnet test`", "build and run the tests"], ["`dotnet new list`", "every template"]] } },
      page("Rules"),
      { ul: [
        "A command works on the project (or solution) in the current folder, or the path you give it.",
        "`bin/` and `obj/` are made by the build: never edit them, never commit them.",
        "`dotnet run -- a b` passes `a b` to your program as `args`.",
        "`-c Release` builds the optimised configuration; the default is Debug.",
        "A compiler error prints as `File.cs(line,col): error CSxxxx: message` — the same codes as the in-app runner."
      ] },
      page("Variations"),
      { h: "One file, no project (.NET 10)" },
      sh("a single .cs file runs as it is", "dotnet run hello.cs"),
      "This is how the Kurenai validator runs (B.8): `dotnet run .kurenai/validate.cs`.",
      { h: "Rebuild on every save" },
      sh("watch", "dotnet watch run"),
      { h: "Arguments and configurations" },
      sh("pass arguments; build for release", "dotnet run -- --verbose marks.csv\ndotnet build -c Release"),
      run("args", "a program reads its arguments as args", 'Console.WriteLine($"{args.Length} argument(s)");\nforeach (string a in args) Console.WriteLine("- " + a);'),
      "In the app there are no arguments, so this prints `0 argument(s)`; with `dotnet run -- a b` it lists them.",
      page("Pitfalls"),
      { h: "Running in the wrong folder — MSB1003" },
      sh("no project here", "MSBUILD : error MSB1003: Specify a project or solution file. The current working directory does not contain a project or solution file."),
      "`cd` into the project's folder, or give the path: `dotnet run --project src/Hello`.",
      { h: "Two projects in one folder — MSB1011" },
      sh("which one?", "MSBUILD : error MSB1011: Specify which project or solution file to use because this folder contains more than one project or solution file."),
      { h: "Reading a compile error in the terminal" },
      sh("file, line, column, code, message", "Program.cs(3,19): error CS0103: The name 'nmae' does not exist in the current context"),
      page("Connections"),
      { ul: [ "**Back:** B.1 installed the SDK; the CS codes are the ones the in-app error decoder explains.", "**Next:** B.3 puts several projects in a solution." ] },
      page("Good practice"),
      { ul: [ "Create projects with `-o` so each has its own folder.", "Run `dotnet build` before you commit: a broken build is the one thing a commit must not be.", "Learn to read `File(line,col)`: it is the fastest way to the bug." ] },
      page("Practise"),
      { ul: [ "**The Bridge project, milestone 1:** build *Hello, Kurenai* from a terminal with `dotnet build`." ] },
      page("Quick reference"),
      sh("the everyday commands", "dotnet new console -o Name\ndotnet build [-c Release]\ndotnet run [--project path] [-- args]\ndotnet test\ndotnet run file.cs"),
      { ul: [ "Templates: `console`, `classlib`, `xunit`, `sln` (`dotnet new list`).", "`bin/` and `obj/` are build output.", "Errors: `File(line,col): error CS…`." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["MSB1003", "no project in this folder", "Pitfalls"], ["MSB1011", "more than one project here", "Pitfalls"], ["error CS0103", "a compile error, as in the app", "Pitfalls"]] } }
    ],
    flashcards: [
      ["Create a console app in a new folder called Grades?", "`dotnet new console -o Grades`."],
      ["Build in the Release configuration?", "`dotnet build -c Release`."],
      ["Pass the arguments `a b` to your program?", "`dotnet run -- a b`."],
      ["What are `bin/` and `obj/`?", "Build output: never edited, never committed."],
      ["MSB1003 means…", "There is no project or solution in the current folder."],
      ["Run a single .cs file with no project?", "`dotnet run file.cs` (.NET 10)."]
    ],
    quiz: [
      { q: "`dotnet run` in a folder with a project…", opts: ["builds if needed, then runs it", "only runs an old build", "only builds", "creates a project"], ans: 0, why: "It builds first when anything changed." },
      { q: "`Program.cs(3,19): error CS0103` points at…", opts: ["line 3, column 19 of Program.cs", "line 19, column 3", "the 3rd error", "a runtime crash"], ans: 0, why: "File(line,column)." },
      { q: "Which belongs in Git?", opts: ["Grades.csproj", "bin/Debug/", "obj/", "all of them"], ans: 0, why: "The project file is source; bin and obj are rebuilt." }
    ]
  });

  /* ================================================================
     B.3 Solutions, projects and NuGet
     ================================================================ */
  lesson("B.3", {
    notes: [
      page("The problem it solves"),
      { ul: [ "One project soon gets crowded: the logic, the console app and the tests want to be apart, so each can be tested and reused.", "A **solution** groups projects; a **project reference** lets one use another; a **NuGet package** brings in someone else's library." ] },
      page("Core idea"),
      sh("a solution with a library and an app that uses it", "dotnet new sln -n Shop\ndotnet new classlib -o src/Shop.Core\ndotnet new console -o src/Shop.App\ndotnet sln add src/Shop.Core src/Shop.App\ndotnet add src/Shop.App reference src/Shop.Core"),
      sh("a package from NuGet", "dotnet add src/Shop.Core package Humanizer.Core --version 3.0.10"),
      file("src/Shop.App/Shop.App.csproj after both", "xml", "<Project Sdk=\"Microsoft.NET.Sdk\">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net10.0</TargetFramework>\n  </PropertyGroup>\n  <ItemGroup>\n    <ProjectReference Include=\"..\\Shop.Core\\Shop.Core.csproj\" />\n  </ItemGroup>\n</Project>"),
      page("Rules"),
      { ul: [
        "A solution (`.sln`, or `.slnx` from .NET 10) only lists projects; the projects hold the code.",
        "References go one way: the app references the library, never back (a cycle will not build).",
        "A library's types are used through its namespace: `using Shop.Core;`.",
        "A package is a `<PackageReference>` with an exact version; `dotnet restore` (or any build) downloads it.",
        "Only `public` types and members can be used from another project."
      ] },
      page("Variations"),
      { h: "The same in Rider" },
      { ul: [ "Solution Explorer → right-click the solution → **Add → New Project…**.", "Right-click a project → **Add → Reference…** for another project.", "**Tools → NuGet → Manage NuGet Packages** to search, add and update packages." ] },
      { h: "Seeing and updating packages" },
      sh("what a solution uses, and what is out of date", "dotnet list package\ndotnet list package --outdated"),
      { h: "Tests are a project too" },
      sh("an xUnit test project that references the library", "dotnet new xunit -o tests/Shop.Tests\ndotnet sln add tests/Shop.Tests\ndotnet add tests/Shop.Tests reference src/Shop.Core\ndotnet test"),
      page("Pitfalls"),
      { h: "A package that does not exist — NU1101" },
      sh("a typo in the name", "error NU1101: Unable to find package Humaniser.Core. No packages exist with this id in source(s): nuget.org"),
      { h: "A broken package version" },
      sh("Humanizer.Core 3.0.8 breaks dotnet run", "error MSB4190: The reference to the built-in metadata \"FileName\" at position 1 is not allowed in this condition …"),
      "Not your code: that version's build files are broken. Pin a version you know works (3.0.10) — one reason versions are exact.",
      { h: "The library is referenced but its type is not found — CS0246" },
      "Add `using Shop.Core;` (the library's namespace), and check the type is `public`.",
      { h: "A reference in both directions" },
      "`A` references `B` and `B` references `A`: the build reports a circular dependency. Move the shared part into a third project both use.",
      page("Connections"),
      { ul: [ "**Back:** B.2's commands, now with `sln`, `reference` and `package`.", "**Later:** unit 10 tests a library from its own project; capstone 4 is a multi-project solution." ] },
      page("Good practice"),
      { ul: [ "Keep logic in a library and the console app thin: the library is what the tests use.", "Use `src/` and `tests/` folders.", "Pin exact package versions and update deliberately, one at a time, with the tests run after." ] },
      page("Practise"),
      { ul: [ "**The Bridge project, milestones 2 and 4:** the library's `Greetings`, then `Humanizer.Core` in `src/Greeter`." ] },
      page("Quick reference"),
      sh("solutions, references and packages", "dotnet new sln -n Name\ndotnet sln add path/to/Project\ndotnet add App reference Lib\ndotnet add Lib package Name --version 1.2.3\ndotnet list package --outdated"),
      { ul: [ "Solution lists projects; references one way; `public` crosses projects.", "Packages: exact versions in `<PackageReference>`." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["NU1101", "no package with that name", "Pitfalls"], ["MSB4190", "a broken package version's build files", "Pitfalls"], ["CS0246", "a type from another project, without its using", "Pitfalls"]] } }
    ],
    flashcards: [
      ["Add the project src/App to the solution?", "`dotnet sln add src/App`."],
      ["Let App use the library Lib?", "`dotnet add App reference Lib`."],
      ["Add version 3.0.10 of Humanizer.Core to Lib?", "`dotnet add Lib package Humanizer.Core --version 3.0.10`."],
      ["Why can't the library reference the app back?", "References are one way; a cycle will not build."],
      ["NU1101 means…", "No package with that id was found (often a typo)."],
      ["Which members can another project use?", "`public` ones."]
    ],
    quiz: [
      { q: "A solution file holds…", opts: ["the list of projects", "the code", "the packages", "the build output"], ans: 0, why: "Projects hold everything else." },
      { q: "The app uses `Greeter.Greetings` but says CS0246. Most likely…", opts: ["`using Greeter;` is missing", "the package is too new", "the SDK is too old", "bin/ was deleted"], ans: 0, why: "The type lives in the library's namespace." },
      { q: "Why give a package an exact version?", opts: ["so every machine builds the same thing", "it is faster", "NuGet requires it", "to avoid restore"], ans: 0, why: "A new version can change or break the build." }
    ]
  });

  /* ================================================================
     B.4 The Rider debugger
     ================================================================ */
  lesson("B.4", {
    notes: [
      page("The problem it solves"),
      { ul: [ "6.7's method — guess, test, narrow — is slow with `Console.WriteLine`.", "A **debugger** stops your program on any line and lets you look at every variable, step one line at a time and watch values change." ] },
      page("Core idea"),
      { ol: [ "Click in the gutter beside a line: a red dot, a **breakpoint**.", "Press **Debug** (the bug icon) instead of Run.", "The program stops on that line before running it. The **Variables** pane shows every local.", "**Step Over** runs the line and stops at the next; **Step Into** goes inside a method it calls; **Step Out** finishes the method; **Resume** runs to the next breakpoint." ] },
      run("target", "a bug to find: the average is a whole number", 'int[] marks = { 91, 74, 88 };\nint total = 0;\nforeach (int m in marks) total += m;\ndouble average = total / marks.Length;\nConsole.WriteLine($"Average {average:F2}");'),
      "Put a breakpoint on the `average` line and step over it: Variables shows `total = 253` and `average = 84` — the division was done in `int` before the `double` was made.",
      { table: { head: ["Action", "Rider keymap", "Visual Studio keymap"], rows: [["Step Over", "F8", "F10"], ["Step Into", "F7", "F11"], ["Step Out", "Shift+F8", "Shift+F11"], ["Resume", "F9", "F5"], ["Toggle breakpoint", "Ctrl+F8 / ⌘F8", "F9"]] } },
      page("Rules"),
      { ul: [
        "A breakpoint stops BEFORE its line runs.",
        "Debug builds keep every variable visible; Release builds may optimise some away.",
        "Step Over for lines you trust, Step Into for the method you suspect.",
        "The **Frames** (call stack) pane is 6.8's stack trace, live: click a frame to see its variables.",
        "Input typed for `Console.ReadLine` goes into the Debug tool window's console."
      ] },
      page("Variations"),
      { h: "Watches and Evaluate Expression" },
      "Add `total / (double)marks.Length` as a **watch** to see the fix before you make it; **Evaluate Expression** (Alt+F8) runs any expression at the stopped line.",
      { h: "A conditional breakpoint" },
      run("loop", "stop only when it matters", 'int found = -1;\nint[] xs = { 4, 8, 15, 16, 23, 42 };\nfor (int i = 0; i < xs.Length; i++)\n{\n    if (xs[i] % 2 == 1) found = i;\n}\nConsole.WriteLine($"last odd at index {found}");'),
      "Right-click the breakpoint on the `if` → Condition `i == 4`: the loop runs freely until the fifth turn.",
      { h: "Stopping on an exception" },
      runFails("throws", "the debugger stops where it is thrown", 'string[] rows = { "Ada,91", "Kai", "Lin,88" };\nint total = 0;\nforeach (string r in rows) total += int.Parse(r.Split(\',\')[1]);\nConsole.WriteLine(total);'),
      "Under Debug, Rider stops on the throwing line with the exception shown; Variables says `r = \"Kai\"` — the damaged row.",
      page("Pitfalls"),
      { h: "The breakpoint is never hit" },
      { ul: [ "The line never runs (look at the branch it is in).", "Another project was started: check the run configuration's name in the toolbar.", "The build failed and an old build ran: watch the Build tool window." ] },
      { h: "Stepping into framework code" },
      "Step Into on `Console.WriteLine` opens .NET's source. Step Out (Shift+F8) comes back; Step Over is the habit for lines you did not write.",
      { h: "Changing code while stopped" },
      "Edits do not change the running program. Stop, then debug again.",
      page("Connections"),
      { ul: [ "**Back:** 6.7's debugging method and 6.8's stack traces.", "**Practise:** the Bridge project's milestone 3 is a bug found with the debugger." ] },
      page("Good practice"),
      { ul: [ "Form a hypothesis first, then put the breakpoint where it would be proved wrong.", "Prefer one breakpoint and stepping to many WriteLines.", "When you find the bug, write a test that would have caught it (unit 10)." ] },
      page("Practise"),
      { ul: [ "**The Bridge project, milestone 3:** run `src/Hello` with Ada and 20 under the debugger and fix the wrong line." ] },
      page("Quick reference"),
      run("qr", "a line to stop on", 'int a = 7, b = 2;\ndouble q = a / b;\nConsole.WriteLine(q);   // breakpoint here: q is 3'),
      { ul: [ "Gutter click: breakpoint · Debug (bug icon) · Variables, Watches, Frames.", "Step Over F8 · Into F7 · Out Shift+F8 · Resume F9 (Rider keymap).", "Conditional breakpoints; exceptions stop where thrown." ] },
      { table: { head: ["Symptom", "Usually", "Page"], rows: [["breakpoint never hit", "the line never runs, or another project started", "Pitfalls"], ["you are inside .NET's code", "Step Into on a library call", "Pitfalls"], ["an edit has no effect", "the running program is the old build", "Pitfalls"]] } }
    ],
    flashcards: [
      ["Does a breakpoint stop before or after its line?", "Before it runs."],
      ["Step Over or Step Into a line you trust?", "Step Over."],
      ["Leave a method you stepped into by mistake?", "Step Out (Shift+F8 in the Rider keymap)."],
      ["What is the Frames pane?", "The call stack, live — 6.8's stack trace while the program is stopped."],
      ["Stop in a loop only on its fifth turn?", "A conditional breakpoint: `i == 4`."]
    ],
    quiz: [
      { q: "Stopped on `double average = total / marks.Length;` with total 253 and 3 marks. After Step Over, average is…", opts: ["84", "84.33", "253", "0"], ans: 0, why: "int / int is 84 before it becomes a double." },
      { q: "Which action runs the current line and stops at the next one in the same method?", opts: ["Step Over", "Step Into", "Step Out", "Resume"], ans: 0, why: "Step Into would enter a method the line calls." },
      { q: "A breakpoint is never hit. Check first…", opts: ["that the line actually runs", "the SDK version", "the NuGet cache", "the screen resolution"], ans: 0, why: "A breakpoint in a branch that never runs never stops." }
    ]
  });

  /* ================================================================
     B.5 Git basics
     ================================================================ */
  lesson("B.5", {
    notes: [
      page("The problem it solves"),
      { ul: [ "\"It worked yesterday\": without history you cannot see what changed, or go back.", "**Git** keeps snapshots (**commits**) of your project, lets you compare them, and lets you try things on a **branch** without breaking the main line." ] },
      page("Core idea"),
      sh("a repository, a first commit, and the history", "git init\ngit add .\ngit commit -m \"First version\"\ngit log --oneline"),
      file(".gitignore — what Git leaves out", "text", "bin/\nobj/\n.idea/\n*.user"),
      { table: { head: ["Command", "Does"], rows: [["`git status`", "what changed since the last commit"], ["`git add <file>` / `git add .`", "stage changes for the next commit"], ["`git commit -m \"…\"`", "save the staged snapshot"], ["`git log --oneline`", "the history, one line each"], ["`git diff`", "the changes not yet staged"]] } },
      page("Rules"),
      { ul: [
        "A commit saves what is STAGED; `git add` stages.",
        "Commit small, working steps, each with a message saying what and why.",
        "`.gitignore` keeps build output (`bin/`, `obj/`) and editor files out.",
        "A branch is a movable name for a line of commits: `git switch -c try-idea` makes one and moves to it.",
        "Set your name and email once: `git config --global user.name \"Ada\"` and `user.email`."
      ] },
      page("Variations"),
      { h: "In Rider" },
      { ul: [ "**Commit** tool window (Ctrl+K / ⌘K): tick files, write the message, Commit.", "**Git → Log** draws the history; **Compare with…** shows any two versions.", "The gutter marks changed lines; click a mark to see or roll back that change." ] },
      { h: "Branches and merging" },
      sh("try an idea on a branch, then bring it back", "git switch -c faster-search\n# … commits …\ngit switch main\ngit merge faster-search"),
      { h: "Undoing safely" },
      sh("throw away an uncommitted change; undo a commit with a new one", "git restore Program.cs\ngit revert HEAD"),
      page("Pitfalls"),
      { h: "\"Author identity unknown\"" },
      sh("the first commit on a new machine", "*** Please tell me who you are.\n\n  git config --global user.email \"you@example.com\"\n  git config --global user.name \"Your Name\""),
      { h: "bin/ and obj/ were committed" },
      sh("stop tracking them (they stay on disk)", "git rm -r --cached bin obj\ngit commit -m \"Stop tracking build output\""),
      "Add them to `.gitignore` first, or they come straight back.",
      { h: "A merge conflict" },
      file("Git marks both versions in the file", "text", "<<<<<<< HEAD\nConsole.WriteLine(\"Hello\");\n=======\nConsole.WriteLine(\"Hi\");\n>>>>>>> faster-search"),
      "Edit the file to the version you want, delete the markers, then `git add` and `git commit`. Rider's merge tool shows the two sides and the result.",
      page("Connections"),
      { ul: [ "**Next:** B.6 sends the history to GitHub.", "**Practise:** the Bridge project's milestone 5 checks for a commit and a clean working tree." ] },
      page("Good practice"),
      { ul: [ "Commit when the build passes, with a message like \"Greet by the hour\".", "Look at `git status` and the diff before every commit.", "Never commit passwords, tokens or keys — history keeps them for ever." ] },
      page("Practise"),
      { ul: [ "**The Bridge project, milestone 5:** `git init`, commit your work, and validate with a clean working tree." ] },
      page("Quick reference"),
      sh("the daily loop", "git status\ngit add .\ngit commit -m \"What and why\"\ngit log --oneline\ngit switch -c name     # a new branch\ngit merge name"),
      { ul: [ "Stage with add, save with commit.", "`.gitignore`: bin/, obj/.", "Branches for experiments; merge when they work." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["Author identity unknown", "set user.name and user.email", "Pitfalls"], ["<<<<<<< HEAD", "a merge conflict to resolve", "Pitfalls"], ["bin/ in the history", "build output was committed", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What does `git add` do?", "Stages changes for the next commit."],
      ["Show the history one line per commit?", "`git log --oneline`."],
      ["Create a branch called try-idea and switch to it?", "`git switch -c try-idea`."],
      ["What belongs in a C# project's .gitignore?", "`bin/` and `obj/` (and editor files)."],
      ["Undo a pushed commit without rewriting history?", "`git revert <commit>` makes a new commit that undoes it."]
    ],
    quiz: [
      { q: "You changed two files, ran `git add a.cs`, then `git commit`. The commit holds…", opts: ["a.cs only", "both files", "nothing", "every file"], ans: 0, why: "Only staged changes are committed." },
      { q: "`<<<<<<< HEAD` in a file means…", opts: ["a merge conflict", "a compile error", "a broken repository", "an old commit"], ans: 0, why: "Git shows both versions for you to choose." },
      { q: "Which should NOT be committed?", opts: ["obj/", "Program.cs", ".gitignore", "the .csproj"], ans: 0, why: "Build output is recreated by every build." }
    ]
  });

  /* ================================================================
     B.6 GitHub and remote repositories
     ================================================================ */
  lesson("B.6", {
    notes: [
      page("The problem it solves"),
      { ul: [ "A repository on one laptop is one spilt coffee from gone.", "A **remote** — a copy on GitHub — is a backup, a way to work on two machines, and where others (and GitHub Actions) can see your code.", "You create the repository on GitHub yourself; KurenaiOS never creates one." ] },
      page("Core idea"),
      { ol: [ "On github.com: **New repository**, private, with no README (yours already has history).", "Connect your local repository to it and send your commits." ] },
      sh("connect, push, and from then on", "git remote add origin git@github.com:you/hello-kurenai.git\ngit push -u origin main\n# later: send new commits, fetch others'\ngit push\ngit pull"),
      sh("another machine: a full copy", "git clone git@github.com:you/hello-kurenai.git"),
      { table: { head: ["Command", "Does"], rows: [["`git remote add origin URL`", "name the remote \"origin\""], ["`git push -u origin main`", "send main and remember where it goes"], ["`git pull`", "fetch and merge the remote's new commits"], ["`git clone URL`", "copy a repository and its whole history"]] } },
      page("Rules"),
      { ul: [
        "Push sends commits, never uncommitted changes.",
        "Pull before you push when another machine (or person) may have pushed.",
        "GitHub does not take passwords for Git: sign in with an SSH key or a personal access token (Rider and the GitHub CLI can do it for you).",
        "Private repositories are private to you and whoever you invite.",
        "A secret pushed once stays in the history: revoke it, then remove it."
      ] },
      page("Variations"),
      { h: "In Rider" },
      { ul: [ "**Git → GitHub → Share Project on GitHub** creates and pushes in one step (you choose the name and that it is private).", "**Git → Push** (Ctrl+Shift+K / ⌘⇧K) and **Git → Pull**.", "**Get from VCS** on the welcome screen clones." ] },
      { h: "An SSH key, once per machine" },
      sh("make a key and copy its public half to GitHub (Settings → SSH keys)", "ssh-keygen -t ed25519 -C \"you@example.com\"\ncat ~/.ssh/id_ed25519.pub"),
      { h: "Pull requests" },
      "Push a branch, then open a **pull request** on GitHub to review it before merging into main — the habit every team uses, even a team of one.",
      page("Pitfalls"),
      { h: "Push rejected — someone else pushed first" },
      sh("non-fast-forward", " ! [rejected]        main -> main (fetch first)\nerror: failed to push some refs to 'github.com:you/hello-kurenai.git'"),
      "`git pull`, resolve any conflict (B.5), then push again. Never force-push a shared branch.",
      { h: "Authentication failed" },
      "Password sign-in for Git was removed. Use an SSH key, or a token through Rider or `gh auth login`.",
      { h: "A secret in a commit" },
      "Revoke the key or password at once (it is already exposed to anyone with access), then remove the file and keep secrets out: user secrets (unit 11) or environment variables.",
      page("Connections"),
      { ul: [ "**Back:** B.5's commits are what is pushed.", "**Later:** a GitHub Actions run of the validator gives the **CI-verified** evidence level (B.8)." ] },
      page("Good practice"),
      { ul: [ "Push at the end of every session: it is your backup.", "Keep repositories private unless you mean to publish.", "Write a README that says how to build and run it." ] },
      page("Practise"),
      { ul: [ "**Optional, the Bridge project:** push *Hello, Kurenai* to a private repository of your own." ] },
      page("Quick reference"),
      sh("remotes", "git remote add origin URL\ngit push -u origin main\ngit push\ngit pull\ngit clone URL"),
      { ul: [ "Push commits; pull before pushing.", "SSH key or token, never a password.", "A pushed secret: revoke first." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["rejected (fetch first)", "the remote has commits you do not", "Pitfalls"], ["Authentication failed", "use SSH or a token", "Pitfalls"], ["a secret in history", "revoke it now", "Pitfalls"]] } }
    ],
    flashcards: [
      ["Connect a repository to a remote called origin?", "`git remote add origin URL`."],
      ["Send main and remember the upstream?", "`git push -u origin main`."],
      ["Copy a repository with its history?", "`git clone URL`."],
      ["Push rejected with \"fetch first\". Next step?", "`git pull`, resolve, push again."],
      ["You pushed a password. First thing to do?", "Revoke or change it — it is already exposed."]
    ],
    quiz: [
      { q: "`git push` sends…", opts: ["your commits", "every changed file", "the working folder", "only staged changes"], ans: 0, why: "Commit first; push sends commits." },
      { q: "Signing in to GitHub from Git uses…", opts: ["an SSH key or a token", "your GitHub password", "nothing", "your email"], ans: 0, why: "Password sign-in for Git was removed." },
      { q: "Who creates the repository on GitHub?", opts: ["you", "KurenaiOS", "Rider, without asking", "GitHub, by itself"], ans: 0, why: "KurenaiOS never creates repositories." }
    ]
  });

  /* ================================================================
     B.7 Reading documentation
     ================================================================ */
  lesson("B.7", {
    notes: [
      page("The problem it solves"),
      { ul: [ "No one remembers every method. Professionals look things up all day — quickly, in the right place.", "Microsoft Learn documents every .NET type and method the same way, and Rider shows the same text beside your code." ] },
      page("Core idea"),
      { ul: [ "Search `learn.microsoft.com` for the type and member, e.g. *List<T>.BinarySearch*.", "Read in this order: the **signature**, the **Returns**, the **Exceptions**, then **Remarks** and an **Example**.", "In Rider, **Quick Documentation** (Ctrl+Q / F1) shows it for the symbol under the cursor; **Go to Declaration** (Ctrl+B / ⌘B) shows its source." ] },
      run("remarks", "the docs' Remarks explain this", 'Console.WriteLine(Math.Round(2.5));\nConsole.WriteLine(Math.Round(3.5));\nConsole.WriteLine(Math.Round(2.5, MidpointRounding.AwayFromZero));'),
      "Surprised by `2`? `Math.Round`'s page says it rounds a midpoint to the EVEN number unless you pass `MidpointRounding`.",
      run("returns", "Returns: the index, or a negative number", 'var xs = new List<int> { 2, 5, 9, 14 };\nConsole.WriteLine(xs.BinarySearch(9));\nConsole.WriteLine(xs.BinarySearch(10));\nConsole.WriteLine(~xs.BinarySearch(10));'),
      "The Returns section: a negative result is the bitwise complement of where the item would go — so `~` gives the insertion point, 3.",
      page("Rules"),
      { ul: [
        "Check the page is for .NET (not .NET Framework) and your version — the selector is at the top.",
        "The **Exceptions** section is the list of what can go wrong: read it before you call a method on input.",
        "Overloads are listed together; pick by parameters.",
        "Error codes have pages too: search `CS0103` or `NU1101`.",
        "A package documents itself on nuget.org and in its repository's README."
      ] },
      page("Variations"),
      { h: "Exceptions, from the docs" },
      runFails("exceptions", "int.Parse's Exceptions section lists these", 'string[] inputs = { "42", " 7 ", "3.5" };\nforeach (string s in inputs) Console.WriteLine(int.Parse(s));'),
      "Its page lists `ArgumentNullException`, `FormatException` and `OverflowException` — and points to `TryParse` (5.4) for input that may be wrong.",
      { h: "Overloads" },
      run("overloads", "one name, many signatures", 'Console.WriteLine(string.Join(", ", "a b  c".Split(\' \')));\nConsole.WriteLine(string.Join(", ", "a b  c".Split(\' \', StringSplitOptions.RemoveEmptyEntries)));\nConsole.WriteLine(string.Join(", ", "a,b;c".Split(new[] { \',\', \';\' })));'),
      { h: "In Rider" },
      { ul: [ "Ctrl+Q / F1: Quick Documentation; press again for the full page.", "Ctrl+P / ⌘P: parameter info while typing a call.", "Alt+Enter on an error: the fixes Rider knows." ] },
      page("Pitfalls"),
      { h: "Docs for a different .NET" },
      "A .NET Framework page can show APIs your project does not have. Check the version selector.",
      { h: "Old answers from the web" },
      "Forum answers age: code from 2012 may use APIs replaced since. Prefer the official page, then check the date.",
      { h: "Skipping Remarks" },
      run("remarks2", "Remarks: Sort is not stable", 'var people = new List<(string name, int age)> { ("Ada", 30), ("Kai", 30), ("Lin", 25) };\npeople.Sort((x, y) => x.age.CompareTo(y.age));\nConsole.WriteLine(people[0].name);'),
      "`List<T>.Sort` says it may not keep equal items in order (it is unstable). If order among ties matters, compare a second key too.",
      page("Connections"),
      { ul: [ "**Back:** 5.4 TryParse, 4.8 BinarySearch and sorting — each has a page that explains its surprises.", "**Practise:** the Bridge project's milestone 4 needs Humanizer's `ToWords` — find it in its README." ] },
      page("Good practice"),
      { ul: [ "Read the Exceptions section before calling a method on outside data.", "Keep learn.microsoft.com open; search `.NET <type> <member>`.", "When a result surprises you, read Remarks before you change code." ] },
      page("Practise"),
      { ul: [ "**The Bridge project, milestone 4:** use Humanizer's documentation to write `Greetings.Describe`." ] },
      page("Quick reference"),
      run("qr", "three facts the docs told us", 'Console.WriteLine($"{Math.Round(0.5)} {~new List<int> { 1, 3 }.BinarySearch(2)} {int.TryParse("x", out int n)} {n}");'),
      { ul: [ "Signature → Returns → Exceptions → Remarks → Example.", "Rider: Ctrl+Q (docs), Ctrl+B (declaration), Ctrl+P (parameters), Alt+Enter (fixes).", "Check the .NET version on the page." ] },
      { table: { head: ["Surprise", "Where the docs explain it", "Page"], rows: [["Math.Round(2.5) is 2", "Remarks: midpoints to even", "Core idea"], ["BinarySearch is negative", "Returns: the complement of the insertion point", "Core idea"], ["Sort reorders ties", "Remarks: unstable sort", "Pitfalls"]] } }
    ],
    flashcards: [
      ["Which section of a method's page lists what it can throw?", "Exceptions."],
      ["`Math.Round(2.5)` is 2 because…", "Midpoints round to even by default (Remarks)."],
      ["Rider: documentation for the symbol under the cursor?", "Quick Documentation (Ctrl+Q / F1)."],
      ["`BinarySearch` returned -4. The item would go at…", "Index 3: `~(-4)`."],
      ["Before trusting a docs page, check…", "That it is for .NET (not Framework) and your version."]
    ],
    quiz: [
      { q: "You call int.Parse on user input. Which section tells you what can go wrong?", opts: ["Exceptions", "Remarks", "Applies to", "See also"], ans: 0, why: "It lists each exception and when." },
      { q: "`Math.Round(3.5)` prints…", opts: ["4", "3", "3.5", "an error"], ans: 0, why: "To even: 4 is even." },
      { q: "An answer online uses an API your project does not have. Likely…", opts: ["it is for an older .NET Framework", "your SDK is broken", "Rider hides it", "it needs NuGet"], ans: 0, why: "Check the version the page or answer is for." }
    ]
  });

  /* ================================================================
     B.8 The Kurenai validation workflow
     ================================================================ */
  lesson("B.8", {
    notes: [
      page("The problem it solves"),
      { ul: [ "Work done in Rider happens outside KurenaiOS. Ticking \"done\" by hand would prove nothing.", "The **validator** — a small C# program that ships inside every project — builds and tests your project for real on your machine, and writes a **report** you bring back. KurenaiOS checks the report, then updates the milestones." ] },
      page("Core idea"),
      { ol: [ "**Export** the project from its page in KurenaiOS (the project → Setup): a zip made on this device.", "Unzip it and open the `.sln` in Rider.", "Work on a milestone, then run **Kurenai Validate** (the run configuration in Rider's toolbar), or the command below in a terminal.", "**Import** the newest file from `.kurenai/reports/` (the project → Validation). A preview shows what will change; nothing changes until you press Import." ] },
      sh("validate from a terminal, in the project folder", "dotnet run .kurenai/validate.cs"),
      sh("what it prints", "✓ .NET SDK 10.0.302\n✓ shipped tests unchanged\n✓ restore\n✓ build · 0 errors, 0 warnings\n✓ tests · 11 passed, 0 failed\n✓ m1 · It builds\n✗ m3 · Fix the bug with the debugger\n4 of 5 milestones pass. Report: .kurenai/reports/20261016-110550.json"),
      page("Rules"),
      { ul: [
        "The validator never fakes a result: each step records whether it ran, its exit code and its time; a step that did not run counts as a failure.",
        "Compiler errors come from the build's SARIF log, test results from the TRX file — never from screen text.",
        "The shipped tests and settings are **protected**: their hashes are checked. Change one and the report counts as **practice only**.",
        "A report is checked on import: one of your projects, a known scaffold version, a validator new enough, a sensible date — and the same report twice changes nothing.",
        "A milestone once passed stays passed; the project's reward is paid once, when every milestone has passed."
      ] },
      page("Variations"),
      { h: "Evidence levels" },
      { table: { head: ["Badge", "Where it ran", "Trust"], rows: [["✓ In-app", "this device's runner", "checked here"], ["◐ Self-run", "your machine, by the validator", "tamper-evident (hashes), honest self-report"], ["◆ CI-verified", "GitHub Actions on a pushed commit", "stronger: arrives with the GitHub link"]] } },
      { h: "The report, in outline" },
      file("a report (shortened)", "json", "{\n  \"schema\": \"kurenai.validation/1\",\n  \"project\": { \"id\": \"rp-bridge-hello\", \"scaffoldVersion\": 1 },\n  \"validator\": { \"version\": \"1.0.0\" },\n  \"protected\": { \"ok\": true, \"mismatched\": [] },\n  \"steps\": [ { \"id\": \"build\", \"ran\": true, \"exit\": 0, \"errors\": 0 }, { \"id\": \"test\", \"ran\": true, \"passed\": 11, \"failed\": 0 } ],\n  \"milestones\": [ { \"id\": \"m1\", \"ok\": true }, { \"id\": \"m2\", \"ok\": true } ]\n}"),
      { h: "What the checks are" },
      { ul: [ "**build** — the solution builds with no errors.", "**tests** — every test in a milestone's class (`Milestone2`) passes.", "**run** — your program, given input, prints the lines expected.", "**package** — a project references a NuGet package.", "**git** — the folder has a commit and nothing uncommitted." ] },
      page("Pitfalls"),
      { h: "\"Practice only\"" },
      "A protected file changed — often a test edited to make it pass. Undo it (`git restore tests/`), validate again, import the new report.",
      { h: "\"Already imported\"" },
      "That exact report is in. Validate again after your next change; each run writes a new file.",
      { h: "\"Not one of your projects\" or \"validator too old\"" },
      "The report came from another project, or from an old export. Export the project again and copy your code across.",
      { h: "\"tests not run\"" },
      "An earlier step failed — usually the build. Fix the first ✗ the validator printed; the rest follow.",
      page("Connections"),
      { ul: [ "**Back:** every Bridge lesson: the SDK, the CLI, the solution, the debugger, Git.", "**Later:** units 10–12's Rider projects and capstone 4 use the same workflow." ] },
      page("Good practice"),
      { ul: [ "Validate after each milestone, not only at the end.", "Commit before you validate, so the report records the commit.", "Read the first ✗ first." ] },
      page("Practise"),
      { ul: [ "**The Bridge project:** all five milestones of *Hello, Kurenai*, each proven by a report." ] },
      page("Quick reference"),
      sh("the loop", "# work on a milestone, then\ndotnet run .kurenai/validate.cs\n# import .kurenai/reports/<newest>.json in KurenaiOS"),
      { ul: [ "Export → open in Rider → Kurenai Validate → import.", "Protected files changed: practice only.", "Same report twice: nothing changes. A pass stays passed." ] },
      { table: { head: ["Outcome", "Means", "Page"], rows: [["Practice only", "a protected file changed", "Pitfalls"], ["Already imported", "that report is in", "Pitfalls"], ["tests not run", "an earlier step failed", "Pitfalls"]] } }
    ],
    flashcards: [
      ["Run the Kurenai validator from a terminal?", "`dotnet run .kurenai/validate.cs` in the project folder."],
      ["Where does it write its reports?", "`.kurenai/reports/`."],
      ["A report says the shipped tests changed. It counts as…", "Practice only: milestones are not marked."],
      ["Where do the validator's build errors come from?", "The build's SARIF log, never console text."],
      ["Import the same report twice. What changes?", "Nothing."],
      ["◐ Self-run means…", "The validator ran on your own machine."]
    ],
    quiz: [
      { q: "A step the validator could not run counts as…", opts: ["a failure", "a pass", "skipped and ignored", "a warning"], ans: 0, why: "It never reports success for something that did not run." },
      { q: "You changed Milestone2.cs so its tests pass. The import says…", opts: ["practice only", "accepted", "already imported", "rejected: future date"], ans: 0, why: "Milestone2.cs is protected." },
      { q: "When does the Bridge project pay its reward?", opts: ["once, when every milestone has passed", "for every report", "for each milestone", "never"], ans: 0, why: "Pay once, at any evidence level." }
    ]
  });

  /* ================================================================
     retrieval: COMMAND cards — the answer is the command, checked against
     the forms it may take (accept: anchored patterns), never self-marked
     ================================================================ */
  /* a variation's label names the question, never the answer (the list of
     next reviews shows it) */
  var short = function (s) { s = String(s).replace(/^Type the (Git )?command that will /, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };
  K.add({ cards: {
    "ub-sdk": { title: "Asking the SDK", lesson: "B.1", concepts: ["sdk"], kind: "command",
      vary: function (r) {
        var q = pick(r, [["print the version of the .NET SDK in use", "dotnet --version"], ["list every .NET SDK installed", "dotnet --list-sdks"], ["list every .NET runtime installed", "dotnet --list-runtimes"]]);
        return { prompt: "Type the command that will " + q[0] + ".", label: short(q[0]), params: [], answer: q[1], accept: ["^" + esc(q[1]) + "$"], hint: "dotnet, then a double-dash option." };
      } },
    "ub-cli": { title: "The dotnet verbs", lesson: "B.2", concepts: ["dotnet-cli"], kind: "command",
      vary: function (r) {
        var n = pick(r, ["Grades", "Library", "Inventory", "Shapes", "Weather"]);
        var q = pick(r, [
          ["create a console app called " + n + " in a new folder of the same name", "dotnet new console -o " + n, ["^dotnet new console (-o|--output) " + n + "( (-n|--name) " + n + ")?$", "^dotnet new console (-n|--name) " + n + " (-o|--output) " + n + "$"]],
          ["build the project in this folder in the Release configuration", "dotnet build -c Release", ["^dotnet build (-c|--configuration) Release$"]],
          ["run the project in src/" + n, "dotnet run --project src/" + n, ["^dotnet run --project (\\./)?src/" + n + "/?$"]]]);
        return { prompt: "Type the command that will " + q[0] + ".", label: short(q[0]), params: [n], answer: q[1], accept: q[2], hint: "dotnet new · dotnet build · dotnet run, with an option." };
      } },
    "ub-sln": { title: "Solutions and packages", lesson: "B.3", concepts: ["solutions", "nuget"], kind: "command",
      vary: function (r) {
        var p = pick(r, ["Shop.Core", "Greeter", "Bank.Core"]), v = pick(r, ["3.0.10", "13.0.3", "2.1.0"]), pkg = pick(r, ["Humanizer.Core", "Newtonsoft.Json", "Spectre.Console"]);
        var P = esc(p), proj = "(\\./)?src/" + P + "(/" + P + "\\.csproj)?";
        var q = pick(r, [
          ["add version " + v + " of the package " + pkg + " to the project src/" + p, "dotnet add src/" + p + " package " + pkg + " --version " + v, ["^dotnet add " + proj + " package " + esc(pkg) + " (-v|--version) " + esc(v) + "$"]],
          ["add the project src/" + p + " to the solution in this folder", "dotnet sln add src/" + p, ["^dotnet sln( \\S+\\.slnx?)? add " + proj + "/?$"]],
          ["let the project src/App use the library src/" + p, "dotnet add src/App reference src/" + p, ["^dotnet add (\\./)?src/App(/App\\.csproj)? reference " + proj + "$"]]]);
        return { prompt: "Type the command that will " + q[0] + ".", label: short(q[0]), params: [p], answer: q[1], accept: q[2], hint: "dotnet sln add · dotnet add … reference · dotnet add … package." };
      } },
    "ub-debug": { title: "Stepping", lesson: "B.4", concepts: ["debugger"], kind: "command",
      vary: function (r) {
        var q = pick(r, [["Stopped on a line that calls a method you trust: run the line and stop at the next one.", "Step Over", ["^step over$"]], ["Stopped on a line that calls the method you suspect: go inside it.", "Step Into", ["^step into$"]], ["You stepped into a method by mistake: finish it and stop back in the caller.", "Step Out", ["^step out$"]], ["Run on to the next breakpoint.", "Resume", ["^resume( program)?$", "^continue$"]]]);
        return { prompt: q[0] + " Name the debugger action.", label: short(q[0]), params: [], answer: q[1], accept: q[2], ci: true, hint: "Step Over · Step Into · Step Out · Resume." };
      } },
    "ub-git": { title: "Git, every day", lesson: "B.5", concepts: ["git"], kind: "command",
      vary: function (r) {
        var b = pick(r, ["faster-search", "try-idea", "fix-totals"]);
        var q = pick(r, [["show the history, one line per commit", "git log --oneline", ["^git log --oneline$"]], ["create a branch called " + b + " and switch to it", "git switch -c " + b, ["^git switch (-c|--create) " + b + "$", "^git checkout -b " + b + "$"]], ["stage every change in this folder", "git add .", ["^git add (\\.|-A|--all)$"]]]);
        return { prompt: "Type the Git command that will " + q[0] + ".", label: short(q[0]), params: [b], answer: q[1], accept: q[2], hint: "git log · git switch · git add." };
      } },
    "ub-remote": { title: "Remotes", lesson: "B.6", concepts: ["github"], kind: "command",
      vary: function (r) {
        var u = "git@github.com:you/" + pick(r, ["hello-kurenai", "grades", "inventory"]) + ".git";
        var q = pick(r, [["connect this repository to " + u + ", naming the remote origin", "git remote add origin " + u], ["send main to origin for the first time and remember it as the upstream", "git push -u origin main"], ["copy the repository " + u + " to this machine", "git clone " + u]]);
        var acc = q[1] === "git push -u origin main" ? ["^git push (-u|--set-upstream) origin main$"] : ["^" + esc(q[1]) + "$"];
        return { prompt: "Type the Git command that will " + q[0] + ".", label: short(q[0]), params: [], answer: q[1], accept: acc, hint: "git remote add · git push -u · git clone." };
      } },
    "ub-docs": { title: "Where the docs say it", lesson: "B.7", concepts: ["docs"], kind: "command",
      vary: function (r) {
        var q = pick(r, [["Which section of a method's page on Microsoft Learn lists what it can throw?", "Exceptions", ["^exceptions?( section)?$"]], ["Which section explains surprises such as Math.Round(2.5) giving 2?", "Remarks", ["^remarks$"]], ["Rider: which action shows the documentation for the symbol under the cursor?", "Quick Documentation", ["^quick doc(umentation)?$"]]]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], ci: true, hint: "Signature · Returns · Exceptions · Remarks · Example; Rider's Ctrl+Q." };
      } },
    "ub-validate": { title: "The validation loop", lesson: "B.8", concepts: ["validation"], kind: "command",
      vary: function (r) {
        var q = pick(r, [["Type the command that runs the Kurenai validator, from the project folder.", "dotnet run .kurenai/validate.cs", ["^dotnet run (\\./)?\\.kurenai/validate\\.cs$"]], ["Which folder does the validator write its reports to?", ".kurenai/reports", ["^(\\./)?\\.kurenai/reports/?$"]], ["A report says a shipped test file changed. It counts as…", "practice only", ["^practice( only)?$"]]]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], ci: true, hint: "dotnet run the validator; reports under .kurenai; protected files." };
      } }
  } });

  /* ================================================================
     the Bridge project: Hello, Kurenai (frames 26m–26o); its files are
     generated into code-projects-files.js
     ================================================================ */
  K.project("rp-bridge-hello", {
    unit: "B", title: "Hello, Kurenai", folder: "hello-kurenai", solution: "HelloKurenai.sln",
    scaffoldVersion: 1, minValidator: "1.0.0", sdk: ".NET 10 SDK",
    summary: "Three projects in a solution — a library, a console app and Kurenai's tests — built in Rider: every Bridge skill once, proven by a validation report.",
    brief: [
      "A small solution: a library (`src/Greeter`) that makes greetings, a console app (`src/Hello`) that uses it, and Kurenai's acceptance tests (`tests/Hello.Acceptance`). You build it in Rider and bring each step back as a validation report.",
      { ul: [ "The tests, `Directory.Build.props` and `.kurenai/validate.cs` are **protected**: change them and a report counts as practice only.", "Nullable reference types are off, as in the lessons until unit 7." ] }
    ],
    milestones: [
      { id: "m1", title: "It builds", lessons: ["B.1", "B.2"], about: "Open the solution in Rider and build it.", checks: [{ type: "build" }] },
      { id: "m2", title: "Greetings by the hour", lessons: ["B.3"], about: "Write Greetings.For: “Good morning, Ada!” before 12, afternoon before 18, then evening.", checks: [{ type: "tests", class: "Milestone2" }] },
      { id: "m3", title: "Fix the bug with the debugger", lessons: ["B.4"], about: "Run src/Hello with Ada and 20: it greets the wrong part of the day. Find the wrong line with the debugger.", checks: [{ type: "run", project: "src/Hello/Hello.csproj", stdin: "Ada\n20\n", contains: ["Good evening, Ada!"] }, { type: "run", project: "src/Hello/Hello.csproj", stdin: "Kai\n9\n", contains: ["Good morning, Kai!"] }] },
      { id: "m4", title: "A package: the hour in words", lessons: ["B.3", "B.7"], about: "Add Humanizer.Core 3.0.10 to src/Greeter and write Greetings.Describe with its ToWords().", checks: [{ type: "package", project: "src/Greeter/Greeter.csproj", package: "Humanizer.Core" }, { type: "tests", class: "Milestone4" }] },
      { id: "m5", title: "Committed with Git", lessons: ["B.5", "B.6", "B.8"], about: "Make the folder a Git repository and commit your work; validate with a clean working tree.", checks: [{ type: "git" }] }
    ],
    protected: ["Directory.Build.props", "tests/Hello.Acceptance/Hello.Acceptance.csproj", "tests/Hello.Acceptance/Milestone2.cs", "tests/Hello.Acceptance/Milestone4.cs", ".kurenai/validate.cs"],
    reward: { xp: 120, gold: 30, hp: 8 }
  });
})();
