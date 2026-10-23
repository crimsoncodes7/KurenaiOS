/* Kurenai OS — data/content/code-c4.js
   Code · Capstone 4 · The Revision Planner (roadmap 5.3, frame 26l).

   The end of stage 4 and of the core path, built in Rider (where: "rider"):
   a small service in four projects — a planner over an ITopicStore and an
   IClock (unit 10's design), JSON storage that is async and cancellable
   (unit 11), a PriorityQueue for what comes next (unit 12), a command line
   on top — and the learner's own tests, proven by planted bugs. Its build
   is a Rider project (rp-c4-planner, scaffold in tools/code-projects/
   revision-planner/): the validator's milestones are the capstone's, an
   accepted report passes them (KOS.code.buildView reads them) and the
   capstone pays, not the project. tools/validator_check.mjs runs it end to
   end before a release.                                                  */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  var MUTANTS = [
    { id: "weight", find: "topic.Confidence * 100", replace: "topic.Confidence * 10" },
    { id: "never", find: "last.DayNumber : 30;", replace: "last.DayNumber : 0;" },
    { id: "cap", find: "if (days > 30) days = 30;", replace: "if (days > 60) days = 60;" },
    { id: "sign", find: "* 100 - days", replace: "* 100 + days" }
  ];
  var RUN = "src/Planner.Cli/Planner.Cli.csproj";

  K.project("rp-c4-planner", {
    unit: "C4", capstone: "C4", title: "The Revision Planner", folder: "revision-planner", solution: "RevisionPlanner.sln",
    scaffoldVersion: 1, minValidator: "1.1.0", sdk: ".NET 10 SDK",
    summary: "Capstone 4: a small service in four projects — a planner, JSON storage, a command line and your tests — built and proven in Rider.",
    brief: [
      "Capstone 4's project. Its milestones are the capstone's build: an accepted report passes them, and the capstone pays when it is submitted.",
      { ul: [
        "`Directory.Build.props`, `src/Planner.Core/Priority.cs`, `tests/Planner.Acceptance/` and `.kurenai/validate.cs` are **protected**.",
        "Milestone 1 plants four bugs in a copy of `Priority.cs` and runs YOUR tests against each.",
        "Nullable reference types are on."
      ] }
    ],
    milestones: [
      { id: "m1", title: "Pin down the rule", lessons: [], about: "Six or more of your own tests, one a [Theory]; they catch at least three of four bugs planted in Priority.cs.",
        checks: [{ type: "owntests", prefix: "Planner.Tests.", min: 6 }, { type: "source", path: "tests/Planner.Tests", contains: ["\\[Theory\\]"] }, { type: "mutants", file: "src/Planner.Core/Priority.cs", tests: "tests/Planner.Tests/Planner.Tests.csproj", min: 3, mutants: MUTANTS }] },
      { id: "m2", title: "The planner, test-first", lessons: [], about: "StudyPlanner: AddAsync, RateAsync and NextAsync with a PriorityQueue; Kurenai's Milestone2 passes.",
        checks: [{ type: "tests", class: "Milestone2" }, { type: "source", path: "src/Planner.Core/StudyPlanner.cs", contains: ["PriorityQueue<"] }] },
      { id: "m3", title: "JSON storage, async", lessons: [], about: "JsonTopicStore loads and saves JSON, async and cancellable; no .Result or .Wait() in src.",
        checks: [{ type: "tests", class: "Milestone3" }, { type: "source", path: "src", forbids: ["\\.Result\\b", "\\.Wait\\(\\)"] }] },
      { id: "m4", title: "The command line", lessons: [], about: "src/Planner.Cli answers every command, and the topics are still there on the next run.",
        checks: [
          { type: "run", project: RUN, stdin: "clear\nadd cs Big O\nadd maths Vectors\nadd cs Hash tables\nrate 1 4\nnext 2\nfly\nquit\n",
            contains: ["Cleared.", "Added #1 cs: Big O", "Added #3 cs: Hash tables", "Rated #1: 4", "1. #3 cs: Hash tables (confidence 1)", "2. #2 maths: Vectors (confidence 1)", "Unknown command: fly", "Bye."] },
          { type: "run", project: RUN, stdin: "list\nquit\n", contains: ["#1 cs: Big O (confidence 4)", "#2 maths: Vectors (confidence 1)", "#3 cs: Hash tables (confidence 1)"] }
        ] },
      { id: "m5", title: "Shipped", lessons: [], about: "Ten or more of your own tests, no compiler warnings, committed with a clean working tree.",
        checks: [{ type: "owntests", prefix: "Planner.Tests.", min: 10 }, { type: "warnings", max: 0 }, { type: "git" }] }
    ],
    protected: ["Directory.Build.props", "src/Planner.Core/Priority.cs", "tests/Planner.Acceptance/Planner.Acceptance.csproj", "tests/Planner.Acceptance/Milestone2.cs", "tests/Planner.Acceptance/Milestone3.cs", ".kurenai/validate.cs"],
    /* the capstone pays, once (invariant 106) */
    reward: null
  });

  K.capstone("C4", {
    stage: 4,
    minutes: 360,
    project: "rp-c4-planner",
    summary: "A revision planner as a small, tested service — a planner over interfaces, async JSON storage, a priority queue and a command line — built in Rider and proven by validation reports.",
    quiz: [
      { q: "Your tests catch 3 of 4 bugs planted in Priority.cs. What does the one they missed tell you?", opts: ["the bug was harmless", "no test checks the behaviour that bug changed", "the tests are too slow", "Priority.cs needs refactoring"], ans: 1, lesson: "10.3", why: "A surviving mutant points at behaviour nothing pins down: write the test that would have failed." },
      { q: "StudyPlanner takes an ITopicStore and an IClock in its constructor. Why?", opts: ["constructors must take interfaces", "tests can hand it a fake store and a fixed date, and the real ones plug in unchanged", "it makes the planner faster", "so it can create them itself"], ans: 1, lesson: "10.9", why: "Dependency inversion: the planner depends on abstractions, so a test double stands in for the file and the clock." },
      { q: "Which is the right way to load inside an async method?", opts: ["var list = store.LoadAsync().Result;", "store.LoadAsync().Wait();", "var list = await store.LoadAsync(ct);", "Task.Run(() => store.LoadAsync());"], ans: 2, lesson: "11.8", why: "Await it, and pass the token on: .Result and .Wait() block a thread and can deadlock." },
      { q: "JsonSerializer.DeserializeAsync meets `{ this is not json`. What should JsonTopicStore throw?", opts: ["nothing: return an empty list", "the JsonException as it is", "an InvalidDataException, so callers need not know the file is JSON", "a NullReferenceException"], ans: 2, lesson: "11.2", why: "Catch the format's own exception and throw one that describes the problem at the store's level." },
      { q: "NextAsync(n) with a PriorityQueue<Topic, (int, string)> over all t topics costs about…", opts: ["O(1)", "O(n)", "O(t log t)", "O(t²)"], ans: 2, lesson: "12.1", why: "Each of t enqueues is O(log t); taking n back adds O(n log t)." }
    ],
    brief: [
      "Build a **revision planner** as a small service: it keeps topics with a confidence from 1 to 5 and the day each was last studied, and answers one question — *what should I study next?* — from a fixed rule. You build it in **Rider**, in four projects, with your own tests around it, and bring each milestone back as a validation report.",
      { h: "The solution" },
      { table: { head: ["Project", "What it holds"], rows: [
        ["`src/Planner.Core`", "`Topic` (a record), `IClock`, `ITopicStore`, the rule `Priority.Score` (**protected**: test it, don't change it) and `StudyPlanner` — a stub you build"],
        ["`src/Planner.Storage`", "`JsonTopicStore` — a stub you build"],
        ["`src/Planner.Cli`", "the command line; the topics live in `planner-data/topics.json`"],
        ["`tests/Planner.Tests`", "**your** tests; it starts with one example"],
        ["`tests/Planner.Acceptance`", "Kurenai's tests for milestones 2 and 3 (**protected**)"]
      ] } },
      { h: "The rule" },
      { ul: [
        "`Priority.Score(topic, today)` = `confidence × 100 − days since last studied`; never studied counts as 30 days, and no topic counts more than 30. **Lower scores are studied first.**"
      ] },
      { h: "The planner" },
      { ul: [
        "`AddAsync(subject, name)`: trims both and stores the subject in lower case; the next id (one more than the highest), confidence 1, never studied. A blank name is an `ArgumentException`; the same name again in the same subject, in any case, an `InvalidOperationException`.",
        "`RateAsync(id, confidence)`: 1–5, else `ArgumentOutOfRangeException`; an unknown id is a `KeyNotFoundException`. It sets the confidence and makes today (from the `IClock`) the day it was last studied.",
        "`NextAsync(n)`: the n lowest scores, ties by name (ordinal), with a `PriorityQueue`; it saves nothing. n below 1 is an `ArgumentOutOfRangeException`.",
        "Every method loads from the store and saves what it changes."
      ] },
      { h: "Storage" },
      { ul: [
        "`JsonTopicStore(path)`: a missing file loads as no topics; `SaveAsync` creates the folder and replaces the file; a file that is not valid JSON is an `InvalidDataException`; both methods honour the `CancellationToken`.",
        "No `.Result` and no `.Wait()` anywhere in `src`: await all the way down."
      ] },
      { h: "The command line" },
      { table: { head: ["Command", "Answer"], rows: [
        ["`clear`", "`Cleared.` — no topics saved"],
        ["`add <subject> <name…>`", "`Added #1 cs: Big O`"],
        ["`rate <id> <1-5>`", "`Rated #1: 4`"],
        ["`next <n>`", "`1. #3 cs: Hash tables (confidence 1)`, one line each; or `Nothing to study.`"],
        ["`list`", "`#1 cs: Big O (confidence 4)` by id; or `No topics yet.`"],
        ["`help` · `quit`", "the commands · `Bye.`"],
        ["anything else", "`Unknown command: fly`"]
      ] } },
      { ul: [ "A refusal prints `Error: ` and the exception's message. The topics persist between runs." ] },
      call("tip", "Stage 4", ["Work test-first: a test for each rule in this brief before the code that makes it pass. Lessons 10.4 (TDD), 10.5 (test doubles), 11.2 (JSON), 11.7 (cancellation) and 12.8 (queues) are the closest; 10.10 and 11.9 are small versions of the same work."]),
      { h: "Useful pieces" },
      { code: { lang: "csharp", src: 'var queue = new PriorityQueue<Topic, (int Score, string Name)>(\n    Comparer<(int Score, string Name)>.Create((a, b) =>\n        a.Score != b.Score ? a.Score.CompareTo(b.Score) : string.CompareOrdinal(a.Name, b.Name)));\nforeach (var t in topics) queue.Enqueue(t, (Priority.Score(t, clock.Today), t.Name));\n\nawait using var stream = File.OpenRead(FilePath);\nvar list = await JsonSerializer.DeserializeAsync<List<Topic>>(stream, cancellationToken: ct);' } }
    ],
    rubric: [
      { id: "correct", title: "Correctness · validation milestones", auto: true, max: 12 },
      { id: "tests", title: "Your tests", max: 4, guide: ["The example only", "A few tests of the happy path", "Each rule in the brief has a test", "Edge cases and refusals, with Theories where cases repeat", "Tests that read as the specification, and catch every planted bug"] },
      { id: "design", title: "Design and dependencies", max: 4, guide: ["Everything in Program.cs", "Classes, but each creates what it needs", "The planner depends on ITopicStore and IClock", "Each class has one job; the command line only parses and prints", "A new store (a database, say) would be one new class"] },
      { id: "async", title: "Async and storage", max: 4, guide: ["Blocking calls", "async methods, some awaited", "Awaited all the way, tokens passed on", "Errors turned into InvalidDataException at the store's edge", "Cancellation tested, and the file never half-written"] }
    ],
    writeupMin: 100,
    writeupPrompts: ["Which test did you write first, and which planted bug was hardest to catch?", "How do StudyPlanner, JsonTopicStore and the command line depend on each other — and what would you change to keep the topics in a database instead?", "What did async change in how you wrote the storage, and where did cancellation matter?"],
    reward: { xp: 300, gold: 75, hp: 10 }
  });
  function call(t, h, body) { return { callout: { t: t, h: h, body: body } }; }
})();
