/* Kurenai OS — data/code.js
   The Code curriculum (roadmap 5.3, docs/code-plan.md §3): AUTHORED, not
   generated (invariant 24's authored clause). Two shapes:

   KOS_DATA.code   the spine every Study surface already reads — sections
                   are the core units and Bridge B, leaves are lessons. A
                   leaf's `content` is the lesson's one-line aim (what the
                   spine, search and the topic picker show).
   KOS_CODE        what only Code needs: the stages and capstones, the
                   strands of each unit, where it runs, the deepening
                   modules and the tracks, and the registries that the
                   lesson files (js/data/content/code-u*.js) fill in —
                   CONCEPTS, TASKS, CARDS and the error decoder.

   Nothing here is written at runtime. The order is a recommendation:
   nothing is locked (invariant 2); later units read "Recommended later".
   Lesson content arrives one unit at a time; a lesson without it says so. */
(function () {
  "use strict";
  window.KOS_DATA = window.KOS_DATA || {};

  /* [ref, title, aim] per lesson; units carry stage, strands and where
     they run ("app" in-app runner, "sandbox" the full .NET runtime,
     "rider" JetBrains Rider) */
  var UNITS = [
    { ref: "U1", title: "Values, types and variables", stage: 1, strands: ["L"], where: "app", lessons: [
      ["1.1", "Your first program", "Write, run and read a complete C# program: statements, Console.WriteLine and what happens between pressing Run and seeing output."],
      ["1.2", "Values and types", "Tell int, double, bool, char and string apart, write their literals, and predict which type an expression has."],
      ["1.3", "Variables, assignment and const", "Declare, assign and update variables, use var and const, and name things so the code reads itself."],
      ["1.4", "Arithmetic and operators", "Use + - * / % with integer and real division, precedence, compound assignment and ++/--."],
      ["1.5", "Strings and interpolation", "Build text with concatenation and $\"…\" interpolation, escape characters, and format numbers inside a string."],
      ["1.6", "Reading input and converting types", "Read a line with Console.ReadLine, parse it into a number, and convert between types with casts and Convert."],
      ["1.7", "Limits: overflow, precision and decimal", "Know where int overflows, why 0.1 + 0.2 is not 0.3 in a double, and when money needs decimal."],
      ["1.8", "Practise: a receipt calculator", "Combine input, arithmetic, conversion and formatting into one small, complete program."]
    ] },
    { ref: "U2", title: "Decisions and loops", stage: 1, strands: ["L", "S"], where: "app", lessons: [
      ["2.1", "Booleans and comparison", "Write comparisons that produce bool values and read them as questions the program asks."],
      ["2.2", "if, else if and else", "Choose between paths with if, chain conditions, and avoid unreachable branches."],
      ["2.3", "Logical operators", "Combine conditions with &&, || and !, and use short-circuiting on purpose."],
      ["2.4", "switch statements and expressions", "Pick one case from many with switch, and return a value with a switch expression."],
      ["2.5", "while and do…while", "Repeat while a condition holds, and make sure the loop always moves towards its end."],
      ["2.6", "for and foreach", "Count with for, walk every item with foreach, and choose between them."],
      ["2.7", "break, continue and nested loops", "Leave or skip an iteration deliberately, and reason about a loop inside a loop."],
      ["2.8", "The ternary operator and guards", "Write small decisions as expressions with ?: and keep the main path unindented."],
      ["2.9", "Practise: a number-guessing game", "Combine input, decisions and a loop into a small interactive program."]
    ] },
    { ref: "U3", title: "Methods and scope", stage: 1, strands: ["L", "E"], where: "app", lessons: [
      ["3.1", "Why methods", "Name a piece of behaviour, call it from several places, and read a program as a set of steps."],
      ["3.2", "Parameters and return values", "Pass values in, return one out, and tell void methods from methods that compute."],
      ["3.3", "Scope and lifetime", "Know where a variable can be used and how long it lives, and why a name declared in a block disappears."],
      ["3.4", "Overloads, optional and named arguments", "Offer one name with several signatures, and give parameters sensible defaults."],
      ["3.5", "out and ref", "Return more than one value with out, and change a caller's variable with ref when you mean to."],
      ["3.6", "Guard clauses and validation", "Reject bad input at the top of a method so the rest can trust it."],
      ["3.7", "Recursion: a first look", "Solve a problem in terms of a smaller copy of itself, with a base case that always ends it."],
      ["3.8", "Practise: decomposing a problem", "Break a task into methods before writing any of them, then build it one tested piece at a time."]
    ] },
    { ref: "U4", title: "Collections: arrays, List, Dictionary", stage: 2, strands: ["L", "S"], where: "app", lessons: [
      ["4.1", "Arrays", "Store a fixed number of values, index them from 0, and walk them safely."],
      ["4.2", "List<T>", "Grow and shrink a list, insert and remove, and know what Count means."],
      ["4.3", "Counting with Dictionary", "Look values up by key, count things, and read a key that might be missing without throwing."],
      ["4.4", "HashSet and uniqueness", "Keep each item once and ask \"have I seen it?\" in one step."],
      ["4.5", "Queues and stacks", "Process items first-in first-out or last-in first-out."],
      ["4.6", "Multi-dimensional arrays", "Model grids with [,] and jagged arrays, and loop over rows and columns."],
      ["4.7", "Tuples and deconstruction", "Return and pass small groups of values without a class."],
      ["4.8", "Sorting and searching a collection", "Sort with a key, search for an item, and know what each costs."],
      ["4.9", "Choosing a collection", "Pick the collection from how the data will be used."],
      ["4.10", "Collections and methods", "Pass collections to methods and know when a change is seen by the caller."],
      ["4.11", "Practise: an inventory", "Keep stock levels in collections and report on them."]
    ] },
    { ref: "U5", title: "Text: strings, parsing, formatting", stage: 2, strands: ["L"], where: "app", lessons: [
      ["5.1", "Strings are immutable", "Know that every string operation makes a new string, and what that costs."],
      ["5.2", "Split and Join", "Break text into parts and put parts back together."],
      ["5.3", "Formatting numbers", "Format numbers, money and percentages with format strings."],
      ["5.4", "Parsing safely with TryParse", "Turn text that may be wrong or blank into a number without crashing."],
      ["5.5", "StringBuilder", "Build long text efficiently in a loop."],
      ["5.6", "Culture, case and comparison", "Compare text correctly whatever the case or the machine's culture."],
      ["5.7", "Characters and Unicode", "Work with char values, char methods and text beyond plain English."],
      ["5.8", "Regular expressions: a first look", "Match and extract simple patterns from text."]
    ] },
    { ref: "U6", title: "Files, exceptions and debugging", stage: 2, strands: ["L", "E"], where: "app", lessons: [
      ["6.1", "Exceptions: when it goes wrong", "Read what an exception is, where it came from and what stopped."],
      ["6.2", "Reading a file line by line", "Read text files and process them a line at a time."],
      ["6.3", "Writing files", "Write and append text safely."],
      ["6.4", "try, catch and finally", "Handle the exceptions you can recover from and let the rest through."],
      ["6.5", "Throwing your own exceptions", "Signal a broken rule with the right exception type and message."],
      ["6.6", "Validating input", "Decide what to do with bad data before it spreads."],
      ["6.7", "A debugging method", "Find a bug by forming and testing hypotheses rather than guessing."],
      ["6.8", "Reading stack traces and errors", "Follow a stack trace back to the line that caused it."],
      ["6.9", "Practise: a log analyser", "Read a log file, survive its bad lines and report on it."]
    ] },
    { ref: "B", title: "Your real toolkit", stage: "B", strands: ["E"], where: "rider", lessons: [
      ["B.1", "Installing .NET and Rider", "Install the .NET SDK and JetBrains Rider and run a first console project."],
      ["B.2", "The dotnet command line", "Create, build, run and test projects from the terminal."],
      ["B.3", "Solutions, projects and NuGet", "Organise code into projects in a solution and add packages."],
      ["B.4", "The Rider debugger", "Step through code, watch values and stop where it matters."],
      ["B.5", "Git basics", "Commit, branch and read history on your own machine."],
      ["B.6", "GitHub and remote repositories", "Push to and pull from a private repository."],
      ["B.7", "Reading documentation", "Find answers in Microsoft Learn and API references quickly."],
      ["B.8", "The Kurenai validation workflow", "Export a project, build it in Rider, validate it and bring the report back."]
    ] },
    { ref: "U7", title: "Classes and objects", stage: 3, strands: ["L"], where: "sandbox", lessons: [
      ["7.1", "Why classes", "Group data with the behaviour that belongs to it."],
      ["7.2", "Fields, constructors and methods", "Write a class that starts valid and stays valid."],
      ["7.3", "Properties and encapsulation", "Expose what callers need and hide how it is stored."],
      ["7.4", "Static members", "Tell what belongs to the type from what belongs to each object."],
      ["7.5", "Namespaces and files", "Organise classes into files and namespaces."],
      ["7.6", "References and equality", "Know when two variables point at one object, and what == compares."],
      ["7.7", "Nullable reference types: why", "Understand the billion-dollar mistake and how flow analysis helps."],
      ["7.8", "Nullable in practice: ?, ! and ??", "Use nullable annotations and warnings as a design tool."],
      ["7.9", "Enums", "Name a fixed set of options."],
      ["7.10", "Practise: a bank account", "Model an account that cannot reach an invalid state."]
    ] },
    { ref: "U8", title: "Interfaces and inheritance", stage: 3, strands: ["L", "E"], where: "sandbox", lessons: [
      ["8.1", "Inheritance", "Share behaviour through a base class."],
      ["8.2", "virtual and override", "Let a derived class change what a method does."],
      ["8.3", "Abstract classes", "Define a template that cannot be created on its own."],
      ["8.4", "Interfaces", "Describe what something can do without saying how."],
      ["8.5", "Polymorphism", "Treat different types the same way through a shared contract."],
      ["8.6", "Records", "Model data with value equality and immutability."],
      ["8.7", "Structs, values and references", "Know when a type is copied and when it is shared."],
      ["8.8", "Pattern matching", "Ask what shape a value has and take it apart in one step."],
      ["8.9", "Composition over inheritance", "Build behaviour from parts instead of deep hierarchies."],
      ["8.10", "Practise: a shapes library", "Design a small library around an interface."]
    ] },
    { ref: "U9", title: "LINQ and generics", stage: 3, strands: ["L", "S"], where: "sandbox", lessons: [
      ["9.1", "Generic types", "Write one type that works for many element types."],
      ["9.2", "Generic methods and constraints", "Write methods over T and say what T must support."],
      ["9.3", "Delegates, Func and Action", "Pass behaviour around as a value."],
      ["9.4", "Lambdas", "Write small functions inline."],
      ["9.5", "Events", "Let one object announce changes to others."],
      ["9.6", "LINQ: Where, Select and OrderBy", "Filter, project and sort sequences."],
      ["9.7", "LINQ: GroupBy, ToDictionary and aggregates", "Group and summarise data."],
      ["9.8", "Deferred execution", "Know when a query actually runs."],
      ["9.9", "IEnumerable and yield", "Produce sequences lazily."],
      ["9.10", "Practise: a report generator", "Turn raw records into a report with LINQ."]
    ] },
    { ref: "U10", title: "Testing and design", stage: 4, strands: ["E"], where: "rider", lessons: [
      ["10.1", "Why test", "Use tests as a safety net and as a specification."],
      ["10.2", "xUnit: Fact and Theory", "Write and run unit tests."],
      ["10.3", "Arrange, act, assert", "Structure a test so it says one thing clearly."],
      ["10.4", "Test-driven development", "Let a failing test lead each small step."],
      ["10.5", "Test doubles", "Replace slow or unpredictable parts in a test."],
      ["10.6", "Refactoring safely", "Change structure without changing behaviour."],
      ["10.7", "Naming and clean code", "Write code that explains itself."],
      ["10.8", "SOLID: single responsibility and open/closed", "Give each part one reason to change."],
      ["10.9", "SOLID: the rest", "Substitution, interface segregation and dependency inversion."],
      ["10.10", "Practise: test a legacy module", "Pin down old code with tests, then improve it."]
    ] },
    { ref: "U11", title: "Async, events and I/O", stage: 4, strands: ["L", "S"], where: "sandbox", lessons: [
      ["11.1", "Streams and files in depth", "Read and write data through streams."],
      ["11.2", "JSON serialisation", "Save and load objects as JSON."],
      ["11.3", "Configuration", "Read settings without hard-coding them."],
      ["11.4", "Why async", "Know what waiting costs and why a thread should not block."],
      ["11.5", "async and await", "Write asynchronous methods that read like ordinary ones."],
      ["11.6", "Tasks and Task.WhenAll", "Run independent work at the same time."],
      ["11.7", "Cancellation", "Stop long work cleanly when asked."],
      ["11.8", "Async pitfalls", "Avoid deadlocks, async void and fire-and-forget bugs."],
      ["11.9", "Practise: an async downloader", "Fetch several resources concurrently from a fake server."]
    ] },
    { ref: "U12", title: "Data structures from scratch", stage: 4, strands: ["S"], where: "app", lessons: [
      ["12.1", "Complexity and Big O", "Estimate how running time grows with input size."],
      ["12.2", "Linear and binary search", "Search unsorted and sorted data, and compare the cost."],
      ["12.3", "Simple sorts", "Write bubble and insertion sort and trace them."],
      ["12.4", "Merge sort and quicksort", "Divide and conquer, and why it is faster."],
      ["12.5", "Recursion in depth", "Trace the call stack and turn recursion into iteration."],
      ["12.6", "A linked list", "Build a list from nodes and references."],
      ["12.7", "Stacks and queues from scratch", "Implement both on an array and on nodes."],
      ["12.8", "Hash tables from scratch", "Build a dictionary with buckets and hashing."],
      ["12.9", "Binary search trees", "Insert, search and walk a tree."],
      ["12.10", "Graphs and traversal", "Represent a graph and explore it breadth- and depth-first."],
      ["12.11", "Practise: a route planner", "Find shortest routes on a small map."]
    ] }
  ];

  window.KOS_DATA.code = {
    id: "code",
    name: "Code",
    board: "C# and .NET",
    labelL: "What this lesson covers",
    labelR: "Where it leads",
    sections: UNITS.map(function (u) {
      return {
        ref: u.ref, title: u.title, stage: u.stage, strands: u.strands, where: u.where,
        children: u.lessons.map(function (l) { return { ref: l[0], title: l[1], content: [l[2]] }; })
      };
    })
  };

  /* ---------------- what only Code needs ---------------- */
  window.KOS_CODE = {
    STRANDS: {
      L: { name: "C# and .NET", short: "L" },
      E: { name: "Software engineering", short: "E" },
      S: { name: "Computer science", short: "S" }
    },
    WHERE: {
      app: { label: "In-app", mark: "▸", hint: "Runs on this device with the in-app runner." },
      sandbox: { label: "In-app sandbox", mark: "▹", hint: "Needs the full .NET runtime, offered from unit 7." },
      rider: { label: "Rider", mark: "⌘", hint: "Built in JetBrains Rider and brought back as a validation report." },
      external: { label: "External tools", mark: "⇱", hint: "Needs tools outside KurenaiOS, such as Python, Docker or a GPU." }
    },
    /* the core path: four stages and the bridge between stages 2 and 3 */
    STAGES: [
      { id: 1, title: "Foundations", units: ["U1", "U2", "U3"], capstone: "C1" },
      { id: 2, title: "Working with data", units: ["U4", "U5", "U6"], capstone: "C2" },
      { id: "B", title: "Your real toolkit", units: ["B"], bridge: true },
      { id: 3, title: "Object-oriented C#", units: ["U7", "U8", "U9"], capstone: "C3" },
      { id: 4, title: "Professional practice", units: ["U10", "U11", "U12"], capstone: "C4" }
    ],
    CAPSTONES: {
      C1: { title: "Text adventure engine", where: "app" },
      C2: { title: "Gradebook from a CSV", where: "app" },
      C3: { title: "A shop with plugins and LINQ reports", where: "sandbox" },
      C4: { title: "A small service, tested", where: "rider" }
    },
    /* optional modules that go further into a core unit (plan §3.2) */
    DEEPENING: [
      { id: "D1", title: "Advanced C# and the runtime", lessons: 14, strands: ["L"], where: "sandbox", needs: ["U7", "U8", "U9"],
        about: "Iterators and yield, Span<T>, memory and the garbage collector, reflection, generic variance and immutability." },
      { id: "D2", title: "Concurrency and parallelism", lessons: 10, strands: ["L", "S"], where: "rider", needs: ["U11"],
        about: "Threads, tasks, races and locks, concurrent collections, channels and PLINQ." },
      { id: "D3", title: "Algorithms and problem solving", lessons: 16, strands: ["S"], where: "app", needs: ["U12"],
        about: "Heaps, tries, union-find, Dijkstra, dynamic programming, greedy and backtracking." },
      { id: "D4", title: "Software design and architecture", lessons: 12, strands: ["E"], where: "rider", needs: ["U10"],
        about: "Patterns, dependency injection, layered and clean architecture, logging and options." },
      { id: "D5", title: "Testing in depth", lessons: 10, strands: ["E"], where: "rider", needs: ["U10"],
        about: "Integration tests, mocking, property-based tests, coverage, mutation testing and profiling." },
      { id: "D6", title: "Tooling, Git and collaboration", lessons: 10, strands: ["E"], where: "rider", needs: ["B"],
        about: "Rebase and conflicts, pull requests, GitHub Actions, packaging, analyzers and versioning." }
    ],
    /* whole areas of programming (plan §3.3); each has a taster and a capstone */
    TRACKS: [
      { id: "T1", title: "Connectivity and persistence", lessons: 28, strands: ["E", "S"], where: "rider", needs: ["U7", "U11"],
        taster: "Contacts on SQLite", about: "Databases and SQL, Entity Framework Core, HTTP and REST, networking and a web API." },
      { id: "T2", title: "User interfaces and desktop apps (Avalonia)", lessons: 20, strands: ["L", "E"], where: "rider", needs: ["U7", "U9"],
        taster: "Your first window", about: "Windows, layout, events, XAML, data binding, MVVM and headless UI tests." },
      { id: "T3", title: "AI, machine learning and LLMs", lessons: 26, strands: ["S", "E"], where: "app", needs: ["U9", "U12"],
        taster: "Linear regression from scratch", about: "Models written from scratch in C#, then tokens, embeddings, RAG and responsible use; a Python bridge for real datasets." },
      { id: "T4", title: "Web development", lessons: 22, strands: ["E"], where: "external", needs: ["U9"],
        taster: "A page in a sandbox", about: "HTML, CSS, JavaScript and TypeScript, the DOM, fetch and full-stack with ASP.NET Core." },
      { id: "T5", title: "Computer systems", lessons: 14, strands: ["S"], where: "app", needs: ["U12"],
        taster: "How C# runs", about: "Data representation, the CPU and memory, IL and the JIT, operating systems and low-level C#." },
      { id: "T6", title: "Security", lessons: 10, strands: ["E", "S"], where: "rider", needs: ["U10"],
        taster: "Threat-model a login", about: "Threat modelling, the OWASP top 10 in .NET, authentication, hashing and secrets." },
      { id: "T7", title: "Cloud, DevOps and deployment", lessons: 10, strands: ["E"], where: "external", needs: ["U10", "U11"],
        taster: "A first GitHub Action", about: "Containers, CI/CD with GitHub Actions, deployment, monitoring and cost." },
      { id: "T8", title: "Game development and graphics", lessons: 14, strands: ["L", "S"], where: "rider", needs: ["U7"],
        taster: "Bouncing ball", about: "The game loop, vectors and motion, collisions and MonoGame." },
      { id: "T9", title: "Theory of computation", lessons: 12, strands: ["S"], where: "app", needs: ["U12"],
        taster: "A tiny calculator language", about: "Automata, grammars and parsing, an interpreter in C#, computability and complexity." }
    ],
    /* filled by the lesson files (code-u*.js) through KOS_CODE.add() */
    CONCEPTS: {},
    TASKS: {},
    CARDS: {},
    /* the error decoder (frame 26f2): the compiler's or runtime's words, one
       plain sentence, and what usually causes it */
    ERRORS: {
      CS0103: { plain: "You used a name C# has never seen at this point.", usually: "a typo, or a variable declared inside a block and used outside it." },
      CS0029: { plain: "A value of one type was put where another type is needed.", usually: "a string where a number is expected — parse it first." },
      CS0266: { plain: "This conversion can lose information, so C# wants you to say so with a cast.", usually: "a double stored in an int. Write (int) in front, or keep it a double." },
      CS0019: { plain: "This operator does not work between these two types.", usually: "comparing or adding a string and a number." },
      CS0165: { plain: "The variable is read before it has been given a value.", usually: "a variable declared without a value and only set inside an if." },
      CS0128: { plain: "The same name is declared twice in one scope.", usually: "writing int or var again when you meant to update the variable." },
      CS0136: { plain: "A name inside a block clashes with one outside it.", usually: "reusing an outer variable's name in a loop or lambda." },
      CS0161: { plain: "Not every path through the method returns a value.", usually: "an if without an else, or a loop with no return after it." },
      CS1002: { plain: "C# expected a semicolon to end the statement.", usually: "a missing ; at the end of the line above." },
      CS1010: { plain: "A string or character literal was not closed.", usually: "a missing closing quote." },
      CS1061: { plain: "That type has no member with this name.", usually: "Length on a List or Dictionary (they use Count), or a typo in a method name." },
      CS1501: { plain: "No version of this method takes that many arguments.", usually: "an extra or missing argument." },
      CS1503: { plain: "An argument has the wrong type for this parameter.", usually: "passing a string where the method wants a number." },
      CS7036: { plain: "A required argument is missing from the call.", usually: "calling a method with fewer arguments than it declares." },
      CS0220: { plain: "This constant arithmetic overflows its type at compile time.", usually: "int.MaxValue + 1 written out as constants." },
      CS0428: { plain: "A method was used as if it were a value.", usually: "forgetting the () on a method call, such as Count instead of Count()." },
      CS0021: { plain: "This value cannot be indexed with [ ].", usually: "indexing a sequence; call ToList() or ElementAt first." },
      FormatException: { plain: "The text could not be read as a number.", usually: "parsing input that is empty or contains letters. TryParse avoids the crash." },
      OverflowException: { plain: "The value is too big or too small for its type.", usually: "parsing or converting a number outside the type's range in a checked context." },
      DivideByZeroException: { plain: "An integer was divided by zero.", usually: "a count or divisor that can be 0 — check it first." },
      IndexOutOfRangeException: { plain: "The code asked for an item past the end of the array.", usually: "a loop with <= Length. Use < Length." },
      ArgumentOutOfRangeException: { plain: "An index or argument is outside the allowed range.", usually: "an index of Count or more on a List, or a negative length." },
      NullReferenceException: { plain: "Something was null when the code used it.", usually: "a value that was never set, such as Console.ReadLine at the end of input." },
      KeyNotFoundException: { plain: "The code read a key the Dictionary does not have.", usually: "reading with [ ] instead of TryGetValue or GetValueOrDefault." },
      InvalidOperationException: { plain: "The operation is not allowed in the object's current state.", usually: "changing a collection inside its own foreach." },
      StackOverflow: { plain: "A method called itself too deeply.", usually: "a recursive method whose base case is never reached." },
      TIMEOUT: { plain: "The program did not finish in time.", usually: "a loop whose condition never becomes false." }
    },
    /* lesson files register their concepts, tasks and retrieval cards here */
    add: function (o) {
      var K = window.KOS_CODE;
      ["CONCEPTS", "TASKS", "CARDS"].forEach(function (k) {
        var src = o[k.toLowerCase()];
        if (!src) return;
        Object.keys(src).forEach(function (id) { K[k][id] = Object.assign({ id: id }, src[id]); });
      });
    }
  };
})();
