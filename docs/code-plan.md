# Code — implementation plan (roadmap 5.3), revision 2

This plan covers the C# study space described in [roadmap 5.3](ROADMAP.md).
The roadmap says **what** it is. This plan covers:
- how its content is made, chosen and checked;
- how the code area works, and where it stops;
- how it grows from a C# course into a wider programming and computer science
  space;
- how it hands work to JetBrains Rider and to a GitHub repository;
- the order it is built in, with release gates.

The Claude Design prompt for the interface is [prompt 10 in
design-prompts.md](design-prompts.md#10--code-a-c-study-space). It is a
separate document, ready to paste.

**Revision 2 (13 October 2026)** follows your review:
- **The notes** are now a long-term reference (§4).
- **The curriculum** is a core path plus deepening modules and optional tracks
  (§3).
- **Real-IDE projects** have a Rider validation workflow (§9).
- **The GitHub repository "Kurenai Programming"** is designed here (§10).
- **The phone** gets small coding tasks up to unit 3 (§8).
- **Releases** are split into the initial release and later expansions, with
  gates (§12).

**The prototype.** A throwaway prototype is in `prototypes/code-space/`; open
it at `http://localhost:8123/prototypes/code-space/` with the dev server
running. It shows the first revision:
- its notes are thinner than the contract in §4;
- its phone form predates §8.

What it proved still holds:
- the interpreter's output matched .NET 10 byte for byte on 36 of 36
  programs;
- 98 of 98 content checks pass;
- the checker, the mutation-based "write the tests" kata and the multi-file
  projects all work.

---

## 1. Decisions

| # | Question | Decision (13 October 2026) |
|---|---|---|
| A | The runner | A C#-subset **interpreter in a worker for units 1–6**. The **.NET WebAssembly runtime from unit 7** if Spike W shows it works well enough there (compatibility, cold start, phone memory); **otherwise from unit 8**. Reliable execution decides the line, not architectural convenience. |
| B | Rewards | A task pays on its **first pass only**. A re-run, a seen answer or a repeat retrieval pays nothing. Retrieval pay has a daily cap (10). |
| HP | Health | A first-pass task gives **+3 HP**, like a quiz. HP gates nothing (invariant 2). |
| Q2 | Nullable reference types | **Off in units 1–6** (in exported projects, the validator and the differential). Unit 7 has a full lesson on **why** they exist, not just a compiler switch: the billion-dollar mistake, flow analysis, `?`, `!`, `??`, and the warnings as a design tool. |
| Q3 | Phone | Phones get **small coding tasks in units 1–3 only**, at a **reduced reward clearly marked as such**. From unit 4, a phone offers notes, retrieval, predict, fill-the-gap, flashcards, quizzes and read-and-explain. Full tasks show "Best on a computer" and can be saved to a synced "For the computer" list (§8). |
| Q4 | Electives, and anything that cannot run in the browser | **No server runner.** These subjects are taught properly, as full modules (§3). Their projects use the **Rider workflow**: a brief, a scaffold, acceptance tests, a validation script, an imported JSON report (§9). |
| C | Content source | **Authored and validated, never generated live.** The reasons are in §6. |

---

## 2. Three strands, kept distinct

You asked for a clear difference between learning C#, learning to engineer
software, and learning computer science. Every unit, module and track is
tagged with one or more strands, and the skill map can filter by strand.

| Strand | Question it answers | Examples |
|---|---|---|
| **L · C# and .NET** | "How do I say this in C#, and what does the runtime do with it?" | types, collections, LINQ, generics, `async`, records, memory, reflection |
| **E · Software engineering** | "How do I build something that lasts, with other people?" | tests, refactoring, SOLID, patterns, architecture, Git, CI, security practice |
| **S · Computer science** | "What is true about computation, whatever the language?" | complexity, data structures, algorithms, systems, networks, databases theory, ML theory, automata |

They overlap. Unit 12 (data structures in C#) is both L and S, and a capstone
is all three.

---

## 3. The curriculum: a core path, deepening modules, optional tracks

Nothing is locked anywhere (invariant 2). "Prerequisites" are concept sets on
the concept graph. Content whose prerequisites you have not covered is shown
as **recommended later**, and it is still open.

### 3.1 The core path, about 121 lessons (the initial release covers it in stages)

| Stage | Units | Strands | Checkpoint |
|---|---|---|---|
| **1 · Foundations** | **1** How programs run; values and types · **2** Decisions and loops · **3** Methods, scope and decomposition | L S | Capstone 1 (in-app): text adventure engine |
| **2 · Working with data** | **4** Collections: arrays, `List<T>`, `Dictionary`, sets, queues, tuples · **5** Text: strings, parsing, formatting, culture, Unicode, regular expressions (intro) · **6** Errors, exceptions and a debugging method | L E | Capstone 2 (in-app): gradebook CLI |
| **Bridge B · Your real toolkit** | about 6 lessons: Rider and its debugger · the `dotnet` CLI · solutions, projects, NuGet · Git and GitHub basics · reading documentation · **the Kurenai validation workflow** (§9) | E | A Rider "hello project" validated end to end |
| **3 · Object-oriented C#** | **7** Classes, encapsulation, namespaces and files, **nullable reference types** · **8** Inheritance, interfaces, polymorphism, records, structs and value vs reference, pattern matching · **9** Generics, delegates, events, lambdas, LINQ | L E | Capstone 3: a shop with plugins and LINQ reports, with **a console OR an Avalonia front end** over the same services (§3.3) |
| **4 · Professional practice** | **10** Testing and clean code: xUnit, arrange-act-assert, TDD, test doubles, refactoring, SOLID · **11** I/O and async: files, streams, JSON, configuration, `async`/`await`, cancellation · **12** Data structures and algorithms in C#: complexity, search, sort, recursion, trees, graphs, hashing | L E S | Capstone 4 (Rider): a tested multi-project app with JSON storage, CI-verified |

These "craft" threads run through every core unit rather than forming a track
of their own:
- problem decomposition;
- reading error messages and documentation;
- using the debugger;
- naming;
- explaining code.

### 3.2 Deepening modules (optional, recommended after the core)

| Module | Lessons (approx.) | Strands | Prerequisites | Where it runs |
|---|---|---|---|---|
| **D1 Advanced C# and the runtime**: iterators and `yield`, deferred execution, advanced patterns, structs, `ref struct`, `Span<T>`, memory (stack, heap, GC, `IDisposable`), reflection and attributes, source generators (taste), extension methods, operators and indexers, generic constraints and variance, expression trees (taste), immutability | 14 | L | Stage 3 | WebAssembly in-app; reflection-heavy parts in Rider |
| **D2 Concurrency and parallelism**: threads, `Task`, async internals (the state machine, the context), cancellation, races, locks, deadlocks, concurrent collections, channels, `Parallel` and PLINQ, async streams | 10 | L S | U11 | WebAssembly (single-threaded, so concepts and `async` only); real parallelism in Rider |
| **D3 Algorithms and problem solving**: heaps and priority queues, tries, union-find, Dijkstra, topological sort, MST, DP patterns, greedy, backtracking, two pointers and sliding window, bit manipulation, string algorithms, an interview ladder | 16 | S | U12 | In-app, and the Trace Lab |
| **D4 Software design and architecture**: essential GoF patterns (strategy, observer, factory, adapter, decorator, command, repository), DI containers, layered and clean architecture, domain modelling, error strategies (exceptions vs results), logging with `ILogger`, the options pattern, documentation | 12 | E | U10 | In-app for patterns; DI, logging and options in Rider |
| **D5 Testing in depth**: unit vs integration vs end-to-end, mocking (NSubstitute), property-based testing (taste), `WebApplicationFactory`, Testcontainers, Avalonia headless, coverage, mutation testing (Stryker.NET), debugging and profiling (Rider, BenchmarkDotNet) | 10 | E | U10 | Mostly Rider |
| **D6 Tooling, Git and collaboration**: rebase and conflicts, GitHub flow (PRs, reviews, issues), CI with GitHub Actions, NuGet packaging, build configurations, analyzers, `.editorconfig`, `dotnet format`, semantic versioning, licences and open source | 10 | E | Bridge B | Rider and GitHub |

### 3.3 Specialisation tracks (optional; each has a taster project that opens early)

Each track has its own capstone. Each states, lesson by lesson, **where it
runs**:
- **in-app** (the interpreter or WebAssembly);
- **in-app sandbox** (SQL or a web page; spikes S and H);
- **Rider**;
- **external tooling** (Python, Docker, a GPU, an API key).

**T1 · Connectivity and persistence** (about 28 lessons; E S; after stage 3
and U11). Taster: "a contacts app on SQLite" after Bridge B.

| Part | Lessons | Where it runs |
|---|---|---|
| Databases 101: relational model, `SELECT`…`JOIN`, `GROUP BY`, keys, relationships, normalisation (1NF–3NF), transactions and ACID, indexes and query plans | 8 | **In-app SQL sandbox** on SQLite in WebAssembly (Spike S; the current regex `SELECT` sandbox is not enough) |
| SQL from C#: `Microsoft.Data.Sqlite`, parameterised queries, transactions | 3 | Rider (in-app with a simulated provider for reading) |
| Entity Framework Core: entities, `DbContext`, LINQ to SQL translation, migrations, relationships, change tracking, N+1 and performance | 6 | Rider; tests on SQLite in-memory |
| HTTP and REST: methods, status codes, headers, JSON (de)serialisation, `HttpClient`, retries and timeouts, authentication basics (API keys, OAuth, JWT) | 5 | In-app with a **fake server** (a shipped `HttpMessageHandler` in WebAssembly, no network); real APIs in Rider |
| Networking fundamentals: IP, DNS, ports, TCP and UDP, sockets, client–server (a `TcpListener` chat) | 3 | Concepts in-app (links to AQA Paper 2); sockets in Rider over loopback |
| Building an API with ASP.NET Core minimal APIs (**the web-API elective**), persistence design, configuration, environment variables, user secrets | 3 | Rider; checked with `WebApplicationFactory` |
| Security fundamentals: validation, injection, parameterisation, secrets management, OWASP top 10 in .NET | inside the parts above, plus T6 | — |

**T2 · User interfaces and desktop apps with Avalonia** (about 20 lessons; L E;
after stage 3, since it needs events and delegates from U9). Taster: "your
first window", a GUI tip calculator in code-behind with no MVVM. It is
**available after stage 2 plus Bridge B**, so a GUI arrives early, and
capstone 3 offers an Avalonia front end.
- **Lessons:** GUI fundamentals (the event loop, events, controls, layout) ·
  XAML · styles and themes · data binding and `INotifyPropertyChanged` ·
  commands · MVVM with CommunityToolkit.Mvvm · DI in a desktop app ·
  navigation · async UI without blocking the UI thread · calling an API from
  the app, with errors · validation · accessibility · responsive layouts ·
  testing with **Avalonia.Headless** (bindings, commands, focus, even rendered
  frames) · packaging and publishing.
- **Runs in:** Rider with the Avalonia previewer.
- **Checked by:** headless xUnit tests in the validator. Look and feel is a
  rubric item, marked by hand.

**T3 · AI, machine learning and LLMs** (about 26 lessons; S E). Four layers,
each marked with where it runs:

| Layer | Topics | Where it runs |
|---|---|---|
| **A · Foundations** | What AI, ML and deep learning are and how they differ · datasets, features, labels, training/validation/test splits · supervised, unsupervised and reinforcement learning · **linear regression and gradient descent written from scratch in C#** · k-NN, k-means, decision trees, naive Bayes · evaluation (confusion matrix, precision/recall, ROC as an idea) · over- and underfitting, regularisation, data leakage · the perceptron and **a small neural network with backpropagation in C#** · the maths (vectors, matrices, derivatives, probability), cross-linked to the Maths subject | **In-app** (WebAssembly for the network); charts through the lab system's plots |
| **B · Language and LLMs** | Tokenisation (**a toy BPE in C#**) · embeddings and cosine similarity (shipped small vectors) · attention and transformers at a high level (**a toy attention matrix**) · how LLMs are trained and served · prompting · structured outputs · tool calling · RAG (chunking, embedding, retrieval, grounding) · **a case study: KurenaiOS's own Assistant** (its tools, approval cards, "What is sent") | Concepts and toys **in-app**. Calling a real model needs a key, so it is **Rider**, through `Microsoft.Extensions.AI` or a provider's C# SDK; the key stays in user secrets and never enters a repository. |
| **C · Practice and responsibility** | Local models (Ollama, ONNX Runtime) · evaluating LLM apps · cost and latency · privacy · hallucination · bias · safety · responsible deployment | Concepts in-app; local models in Rider plus external installs |
| **D · The Python bridge (optional)** | NumPy, pandas, scikit-learn, PyTorch; real datasets; GPUs | **External**: notes in-app; projects in Jupyter (PyCharm or VS Code), with GPUs on a hosted notebook. A pytest-based validator writes the **same report format** (§9). |

**Other tracks, in a suggested order after T1–T3:**

| Track | Lessons | Strands | Where it runs |
|---|---|---|---|
| **T4 Web development**: HTML, CSS, JS, TypeScript, the DOM and events, `fetch`, frontend architecture, accessibility, backend with ASP.NET Core (shared with T1), full-stack, deployment. **A case study: how KurenaiOS itself is built.** | 22 | E | HTML/CSS/JS **in-app** in a sandboxed iframe with no network (Spike H); TypeScript and full-stack in Rider |
| **T5 Computer systems**: data representation, CPU and memory hierarchy, how C# runs (IL, JIT, GC), operating systems (processes, threads, scheduling, memory, file systems), low-level C# (`unsafe`, pointers, `stackalloc`) | 14 | S | Mostly in-app; low-level in Rider. Heavy cross-links to AQA Paper 2. |
| **T6 Security**: threat modelling, the OWASP top 10 in .NET, authentication and authorisation, hashing vs encryption, secrets, secure coding, vulnerable dependencies | 10 | E S | Concepts in-app; labs in Rider |
| **T7 Cloud, DevOps and deployment**: containers, CI/CD with GitHub Actions, deploying ASP.NET Core, configuration and secrets in the cloud, monitoring, cost | 10 | E | External (Docker, a cloud account) |
| **T8 Game development and graphics**: the game loop, vectors and the maths of motion (links to Maths Mechanics), collisions, MonoGame (C#-first; Godot .NET as the alternative) | 14 | L S | Loop and physics toys in-app on the lab stage; games in Rider |
| **T9 Theory of computation**: discrete maths, automata and regular languages, grammars and parsing, **building an interpreter for a small language in C#**, computability and complexity (links to AQA 4.4) | 12 | S | In-app |

### 3.4 Size, honestly

| Part | Lessons | Initial release? |
|---|---|---|
| Core path (stages 1–4 plus Bridge B) | ~121 | **Yes, released in four stages (§12)** |
| Deepening D1–D6 | ~72 | No: after the core |
| Tracks T1–T9 | ~156 | No: one track per release, in an order you choose |
| **Total** | **~350** | |

With the notes contract in §4, a core lesson is roughly 3,000–6,000 words,
with 10–20 runnable examples. **Content is the long pole, not code.** Spike N
measures the real cost of one lesson before any schedule is promised.

---

## 4. The notes: a comprehensive, layered reference

The notes must work twice: once as a lesson, and months later as the
reference you come back to. Every lesson has one content source and two ways
to read it.

### 4.1 The layers

| # | Section | What it holds | Always present? |
|---|---|---|---|
| — | **Quick reference card** (top) | Syntax at a glance, "the five things to remember", the errors you will meet, with jump links | Yes |
| 1 | **The problem it solves** | Why the concept exists, and what code looks like without it | Yes |
| 2 | **Core idea and syntax** | The minimum to start, with runnable examples | Yes |
| 3 | **Rules and semantics** | Precise rules, constraints, what the compiler checks and what the runtime does | Yes |
| 4 | **Variations and patterns** | Many ways to use it, each runnable and editable | Yes (≥ 4 examples) |
| 5 | **Under the hood** | The mechanics: e.g. hashing for `Dictionary`, the stack and heap for value types | Where meaningful |
| 6 | **Pitfalls** | Compiler errors (by code), runtime exceptions, edge cases and misconceptions, each with a broken example you can run | Yes (≥ 4; ≥ 1 compiler and ≥ 1 runtime where they exist) |
| 7 | **Choosing** | Comparisons with related concepts and a decision table: when to use which | When the concept graph lists alternatives |
| 8 | **Performance and complexity** | Big-O, allocation, the costs that matter | Where relevant |
| 9 | **Connections** | What it builds on (back links), where it is used later (forward links), AQA cross-links | Yes |
| 10 | **Good practice and real-world use** | Idioms, naming, design considerations, a case study | Yes |
| 11 | **Advanced notes** | Deeper material, collapsed, marked "recommended after unit X". When you reach unit X, the lesson offers a **revisit**. | Optional |
| 12 | **Practise** | This lesson's tasks, skill cards, katas and projects, with your status on each | Yes |

The predict, fill-the-gap, find-the-bug, flashcard and quiz tabs stay as they
are in the prototype.

**Two reading modes over the same content:**
- **Learn mode** pages through the layers in order.
- **Reference mode** shows every section expanded, with a sticky table of
  contents, in-lesson search, the quick reference card pinned, and all
  practice links.

Notes keep the house style (short lines, bullets, annotated diagrams where a
picture helps), so depth never becomes a wall of text.

**Spiral revisits.** A concept is taught at the right depth for its unit, and
returned to later:
- `Dictionary` in unit 4 (counting, grouping);
- again in U9 (`GroupBy`, `ToDictionary`, `ToLookup`);
- again in U12 (hash tables from scratch);
- again in D2 (`ConcurrentDictionary`).

Each visit links both ways, so the unit 4 lesson stays the reference entry
point.

### 4.2 The depth reference: 4.3 Dictionary, outlined

Spike N writes this lesson in full first; it plays the part `cs-p1-42b.js`
plays for the A-level content. The outline:
1. **Problem:** finding by key in a list is a scan; a dictionary makes it a
   lookup.
2. **Core:** create, add, read, the indexer vs `Add`, count.
3. **Rules:**
   - keys are unique;
   - `Add` on a duplicate key throws `ArgumentException`;
   - writing through the indexer adds or replaces;
   - reading a missing key throws `KeyNotFoundException`;
   - null keys throw;
   - enumeration order is not a contract.
4. **Variations:**
   - `TryGetValue`, `ContainsKey`, `TryAdd`, `GetValueOrDefault`;
   - updating values; removing (`Remove` and its `out` overload); iteration
     with deconstruction;
   - frequency counting, grouping (`Dictionary<K, List<V>>`), lookup tables,
     memoisation;
   - composite keys (tuples, records); `StringComparer.OrdinalIgnoreCase`;
   - `ToDictionary` and `GroupBy` in a forward link to U9.
5. **Under the hood:** hashing, buckets, `GetHashCode`/`Equals`, collisions,
   resizing, why a key that is changed after insertion is lost.
6. **Pitfalls:**
   - CS1061 on `.Length`;
   - `KeyNotFoundException`;
   - modifying while enumerating (`InvalidOperationException`);
   - the double lookup of `ContainsKey` followed by the indexer;
   - mutable keys;
   - culture and case in string keys.
7. **Choosing:** `Dictionary` vs `List` vs `HashSet` vs `SortedDictionary` vs
   `SortedList` vs an array indexed by number; `ConcurrentDictionary` as a
   forward link.
8. **Performance:**
   - O(1) on average and O(n) at worst;
   - capacity, memory overhead;
   - `CollectionsMarshal` (advanced).
9. **Connections:** back to arrays and `foreach`; forward to LINQ, hash tables
   in U12, caching; AQA 4.2.1 and hashing in 4.2.6.
10. **Practice:** a word-frequency report, an inventory, anagram groups,
    two-sum.
11. **Advanced:** custom `IEqualityComparer<T>`, `FrozenDictionary`,
    `ImmutableDictionary`, `ConcurrentDictionary`.

### 4.3 The depth contract (enforced by a smoke, like smoke65/66)

Every core lesson must have:
- sections 1–4, 6, 9, 10 and 12 non-empty;
- at least 6 runnable examples;
- at least 4 pitfalls, of which at least 1 is a compiler error with its code
  and at least 1 a runtime exception where one exists;
- a comparison table when the concept graph lists alternatives;
- every listing passing the .NET differential;
- every back link, forward link and practice link resolving;
- a quick reference card no longer than one screen.

Track lessons take the same contract, scaled.

---

## 5. How practice is chosen (unchanged from revision 1; running in the prototype)

Nothing is random. The rules:

**The frontier.** Concepts you have studied but not yet proven by passing
code.

**Eligible tasks.** A task is eligible only when all three hold:
- it REQUIRES only concepts you have covered;
- it PRACTISES a frontier concept;
- you have never passed it.

**Difficulty.** The tier follows your last three tasks.

**Score.** Each eligible task scores:
- 3 per frontier concept it practises;
- +2 for the wanted tier;
- +2 when it also mixes in an earlier unit's concept (interleaving).

**The daily retrieval.** It comes from covered concepts **outside** the
frontier, ordered by days since proven × lapses × units ago.

**The week.**
- Mon–Thu: Daily 20, with a kata on Wednesday.
- Friday: a debugging drill.
- The weekend: a project, or a capstone at a checkpoint.
- Every 4th week: review.

**Weekend projects.** The newest one whose units are all finished.

**Determinism.** The plan is seeded by the date and the learner, computed and
never stored. Only what you did is stored and synced.

**Tracks join the pool once started.** Starting T2 adds its tasks and cards to
the pool, and the weekend may offer a T2 project. You choose how much: in
"Practice focus", a slider runs from core-only to a 50/50 mix.

---

## 6. The bank, and why it is authored

**Core bank sizes** (tracks add their own):
- Lessons: about 121.
- Daily tasks: about 400, on 3–4 per lesson.
- Skill cards: about 700, each one a **variation generator**.
- Katas and drills: about 100.
- Weekend projects: about 30.
- Capstones: 4.
- Error-decoder entries: about 150.

**Why nothing is generated live.** A task is only as good as its hidden tests,
and a test that is wrong teaches the wrong thing. Kurenai's jobs stay bounded
and happen only on request, with "What is sent" shown:
- feedback on an explanation;
- capstone reviews;
- a hint at the current rung.

**The validation gate.** Every item passes it before it ships:
1. The reference solution passes **under the interpreter and real .NET**, with
   identical output.
2. The starter does not pass.
3. The hidden cases kill plausible wrong answers (a mutation pass).
4. The constructs the reference uses are covered by its `requires`.
5. Variations are solvable for 50 seeds.
6. Projects: the scaffold compiles and fails; the reference passes milestone
   by milestone.
7. Notes meet the §4.3 contract.

`prototypes/code-space/validate.mjs` is this gate in miniature.

---

## 7. The code area: what works and where it stops

**What works in-app** (units 1–6 on the interpreter; 7 or 8 onward on
WebAssembly):
- the editor (Esc then Tab leaves it, Ctrl/⌘+Enter runs);
- the three check modes (program, method, tests), with diffs and hidden
  cases;
- compiler-style errors, explained in plain words;
- multi-file projects with milestone tests;
- the four kata kinds.

**The sandbox.**
- A worker with no network, DOM or app data.
- A step budget, and a 4-second watchdog.
- Learner code never leaves the device on its own.

**What goes to Rider, honestly labelled.** A clearly supported real-IDE
workflow beats a misleading simulation.
- NuGet packages, GUI apps, databases beyond the SQL sandbox, servers, real
  network calls, model APIs, Docker, GPUs.

---

## 8. The phone

| Content | Phone |
|---|---|
| Notes (both modes), the quick reference card, the skill map, the curriculum map | Full |
| Retrieval | Full for predict and fill cards. Write-from-memory cards from **units 1–3** as phone tasks; later write cards are offered as their predict or fill variant. |
| Predict, fill-the-gap, flashcards, quiz, read-and-explain | Full |
| **Phone tasks (units 1–3)** | Small programs (about 15 lines or fewer) with a **symbol key bar** (`{ } ( ) ; " = < >` and Tab). Marked **"Phone task · reduced reward"**: half the XP and gold, +1 HP. Passing still proves the concepts. The full desktop task stays open and pays the difference when you pass it there. Nothing is paid twice in total. |
| Tasks from unit 4 on, projects, katas that need editing | **"Best on a computer"**: shown read-only, with **Save for the computer**, a synced list Home shows on the desktop |
| Rider projects | Read-only status: milestones, the last report, its evidence level |
| GitHub | Status only |

---

## 9. The Rider workflow: teach in KurenaiOS, build in Rider, validate, record

### 9.1 The loop

1. **KurenaiOS teaches and briefs.** A Rider project page holds:
   - the brief and the requirements;
   - the milestones, with their checks marked "automated" or "manual";
   - setup instructions;
   - the validation command;
   - every previous report.

   All of it is stored with the project in the app, offline.
2. **Export or clone.** Download a zip made on the device, or, with GitHub
   connected (§10), the project appears in the Kurenai Programming repository
   to clone in Rider.
3. **Build in Rider.** The scaffold includes a **shared Rider run
   configuration** (`.run/Kurenai Validate.run.xml`), so validating is one
   click in Rider's toolbar. From a terminal it is
   `dotnet run .kurenai/validate.cs`.
4. **The validator** runs the real build and tests and writes a JSON report.
   It prints a readable summary, and its exit code is non-zero if any check
   fails.
5. **Record it.** Bring the report into KurenaiOS in one of two ways:
   - **Drop or pick the file.** This works offline.
   - **Read it automatically from the repository** (`.kurenai/reports/`) or
     from the CI run, when GitHub is connected.

   KurenaiOS checks it (§9.4), shows a preview, and on confirmation updates
   the milestones, skill evidence and portfolio.

### 9.2 The project package

```
library-fines/
  kurenai.project.json      id, scaffold version, milestones and their checks, validator version,
                            SHA-256 of every PROTECTED file (shipped tests, specs, checks)
  global.json               the SDK (rollForward: latestFeature)
  LibraryFines.sln
  src/LibraryFines/…        yours
  tests/LibraryFines.Acceptance/…   shipped, PROTECTED ([Trait("Milestone","2")] on each test)
  tests/LibraryFines.Tests/…        yours
  .kurenai/validate.cs      the validator: a .NET 10 single-file app, no PowerShell needed
  .kurenai/checks/*.json    custom checks (scripted runs, required files, forbidden references)
  .kurenai/reports/         reports (committed when GitHub is used)
  .run/Kurenai Validate.run.xml
  .github/workflows/kurenai-validate.yml   optional CI (§9.5)
  .gitignore  README.md  BRIEF.md
```

### 9.3 What the validator does (and never fakes)

**1. Preflight.**
- `dotnet --version` against `global.json`.
- The validator's own version.
- A hash of every protected file, compared with `kurenai.project.json`. A
  modified acceptance test is reported, never hidden.

**2. Restore and build.**
- `dotnet restore`, then `dotnet build --no-restore -c Release
  -p:ErrorLog=…sarif`.
- Compiler diagnostics are read from the **SARIF log**, not scraped from
  console text.

**3. Test.**
- `dotnet test --no-build --logger "trx;LogFileName=…"`, then the **TRX file
  is parsed**: per-test outcome, duration and message (truncated), and counts
  by milestone trait.

**4. Custom checks** (each is data in `.kurenai/checks/`):
- scripted console runs, with stdin, a timeout and an output diff;
- required files;
- forbidden project references (e.g. Models → a UI package);
- architecture rules, through a shipped NetArchTest suite;
- an optional format check.

**5. The report.**
- Every step records its **exit code, its duration, and whether it ran**.
- A step that did not run is `not-run` and **counts as a failure**. The
  validator never reports success just because it ran.
- The exit code is 0 only if every requested check passed.

**Portability.**
- Processes are started with argument lists, never a shell string.
- `Path.Combine`, invariant culture, UTF-8 and normalised line endings.
- The validator itself is tested in CI on Windows, macOS and Linux.

A report, in outline:

```json
{
  "schema": "kurenai.validation/1",
  "project": { "id": "wp-u4-library", "scaffoldVersion": 1 },
  "validator": { "version": "1.0.0", "sha256": "…" },
  "env": { "sdk": "10.0.302", "os": "macOS 27.0", "arch": "arm64" },
  "source": { "treeSha256": "…", "gitCommit": "abc123…", "dirty": false },
  "protected": { "ok": true, "mismatched": [] },
  "steps": [
    { "id": "build", "ran": true, "exit": 0, "ms": 8121, "errors": 0, "warnings": 2 },
    { "id": "test", "ran": true, "exit": 1, "ms": 2210, "passed": 9, "failed": 1, "skipped": 0 }
  ],
  "milestones": [ { "id": "m2", "tests": { "passed": 3, "failed": 1 }, "checks": [], "ok": false } ],
  "failures": [ { "test": "Milestone2.CappedAtFivePounds", "message": "Assert.Equal() Failure…" } ],
  "startedAt": "2026-10-18T10:02:11Z", "finishedAt": "2026-10-18T10:02:33Z",
  "reportSha256": "…"
}
```

### 9.4 Importing without trusting blindly

The app runs every report through these checks, in order:

| # | Check | If it fails |
|---|---|---|
| 1 | **Size and shape**: at most 256 KB, valid JSON, a known `schema`, strict types and ranges; unknown fields are dropped and strings capped | Rejected, with the reason |
| 2 | **Identity**: the project id is one of *your* projects; the scaffold version is known; the validator version is supported | Rejected ("this report is for another project", "the validator is too old") |
| 3 | **Protected files** match that version's hashes | Recorded as **practice only**: "the shipped tests were changed, so milestones are not marked" |
| 4 | **Sane time**: not in the future, not before the project was created | Rejected |
| 5 | **Idempotent**: the same `reportSha256` imported twice changes nothing | — |
| 6 | **Through the owner's gate**: the report becomes an *evidence* record via `KOS.code.normaliseEvidence`. It **never writes progress directly**. It can propose "milestone 2 passed"; the model applies first-pass rules (pay once) and history (a passed milestone stays passed). | — |
| 7 | **Preview first**: a dialog shows what will change before anything is applied | — |

**Evidence levels, stated plainly.**

| Level | Where the run happened | How far it can be trusted |
|---|---|---|
| **In-app** | The app's own runner | Verified |
| **Self-run** | Your machine | Tamper-evident (hashes), but not tamper-proof. You control your machine, so this is honest self-reporting with guard rails. A secret key in the script would not change that; anyone can read the script. |
| **CI-verified** | A GitHub Actions runner, on a push to the repository | Stronger. The app reads the check run's conclusion and its report artifact through the API. |

The portfolio shows each milestone's level. Rewards pay once at any level.

**When a project changes after it was validated:**
- Each report records the source tree hash and, when there is one, the commit.
- If a later report (or, with GitHub, a newer commit) differs, the project
  shows **"changed since validation"**.
- History is kept: a milestone once passed stays passed, like the session
  ledger. The *current* status reflects the latest report.

**Versions.** A curriculum update ships scaffold v2 with migration notes:
- v1 reports stay valid for v1;
- upgrading is offered as new files in a zip, or a branch and PR with GitHub.

### 9.5 What can be automated, and what needs a person

| Kind of project | Automated | Manual (rubric, optional Kurenai review) |
|---|---|---|
| Console or library | Build, tests, scripted runs, architecture rules | Readability, naming |
| Avalonia GUI | **Avalonia.Headless** tests: bindings, commands, view-model logic, focus, accessible names, rendered-frame snapshots | Look and feel, UX, real-device accessibility |
| EF Core and databases | Migrations apply, CRUD and relationships on SQLite in-memory; Testcontainers against a real server (**optional, needs Docker**) | Schema design quality |
| ASP.NET Core APIs | `WebApplicationFactory` integration tests: routes, status codes, validation, authentication | API design taste |
| HTTP clients and external APIs | Tests against a fake handler | A live call (key in user secrets, never committed) |
| Sockets | Loopback tests | — |
| AI and LLM apps | Logic tested against a fake chat client; a recorded-fixture evaluation | Answer quality, cost, safety review |
| Python projects (T3-D) | A pytest-based validator that writes the same report schema | Notebook narrative |

---

## 10. GitHub: the "Kurenai Programming" repository

### 10.1 What lives where

| Repository | Holds | Why |
|---|---|---|
| **KurenaiOS (this app)** | The **curriculum source of truth**: lessons, banks, scaffolds, the validator, the concept graph | It ships with the app, works offline and passes the content gate. One source avoids drift. |
| **Kurenai Programming** (yours; **private by default**) | **Your work**: exercise solutions, katas, projects, capstones, validation reports, write-ups, a generated progress README. Plus a **generated, read-only copy** of the brief and spec of everything you started (marked "generated, do not edit"). The full notes can be exported there too, as an option. | Your history, browsable on GitHub and cloneable into Rider |

```
kurenai-programming/
  README.md                 generated: progress, portfolio, links
  .gitignore                bin/ obj/ .idea/ *.user secrets.json appsettings.*.local.json *.db .env
  .kurenai/manifest.json    schema, app version, path ownership
  exercises/unit-04/word-frequency/Program.cs + README.md   (statement summary, result, attempts, hints, "seen the answer")
  katas/write-the-tests/discount/…
  projects/library-fines/   a full Rider solution (§9.2)
  capstones/gradebook/      a solution plus write-up
  portfolio/                write-ups
  curriculum/               GENERATED briefs and specs (optional notes export)
```

### 10.2 Two writers, one repository: path ownership

- **The app** writes through the **GitHub REST API**. It builds commits with
  the Git Data API (blobs, a tree, a commit, a ref update), so a multi-file
  change is one atomic commit. The browser cannot run Git, and Git-over-HTTP
  to GitHub has no CORS.
- **Rider** writes through **local Git**, which you run.
- **Ownership rules:**
  - The app owns `exercises/`, `katas/`, `curriculum/`, `README.md` and
    `.kurenai/manifest.json`.
  - You own `projects/` and `capstones/` **after the app creates them** (the
    app never rewrites your source).
  - Reports in `.kurenai/reports/` are written by the validator and committed
    by you or by CI.
- **Pushing safely:** the app's push is a compare-and-set (`PATCH` the ref
  with the expected SHA, never `force`). If the head moved because you pushed
  from Rider:
  - the app re-reads the head and rebuilds its commit on top, which is safe
    because the paths do not overlap;
  - if an app-owned path was changed remotely, the app **does not
    overwrite**. It commits to `kurenai/conflict-YYYYMMDD`, raises a
    notification, and you resolve it in Rider.

### 10.3 Commit boundaries

| Event | Commit |
|---|---|
| A task's first pass, and a finished kata | **Queued, then batched**: one "Practice 13 Oct: 2 tasks, 1 kata" commit, when you leave the Code space, after 30 idle minutes, or at day's end |
| An in-app project milestone passes | One commit per milestone |
| A capstone is submitted | One commit and a tag (`capstone-2`) |
| **Checkpoint** (an explicit button) | One commit with your message |
| A validation report is imported (if not already in the repository) | Added to the next batch |
| **Never committed** | Keystrokes, failed runs, retrieval cards (they are scheduling, not work), drafts |

**Modes:**
- **Off** (the default) · **Checkpoints only** · **Batched automatic**.
- The mode is chosen after a **first-time consent** screen that shows the
  exact paths and a sample commit.

### 10.4 Authentication and secrets

**Recommended: a GitHub App you register.**
- It is installed on **only** the Kurenai Programming repository.
- Permissions: **Contents** read/write, **Metadata** read, **Actions** and
  **Checks** read (for CI evidence).
- User tokens come from the web flow with **PKCE**. GitHub added PKCE in July
  2025, but its token endpoint still has **no CORS** and still requires the
  client secret. So the exchange and the refresh run through a new
  **`github-token` Supabase Edge Function**, the same pattern as `vndb-ulist`.
- User tokens are short-lived, with a refresh token.

**Fallback (no cloud account, or for the spike).** A **fine-grained personal
access token** limited to that one repository, with an expiry. You paste it
into the app yourself.

**Where the token lives, and where it never goes.**
- It lives in the per-device **credentials kv** (the media DB's kv store).
- It is **never** in source code, the synced state document, backups or any
  repository file (invariants 7 and 35).
- It is never logged.

**The repository itself.**
- **You create it** on GitHub, and install the app on it. The app never
  assumes the repository exists or that it may create one.
- Setup checks that it exists, that it is **private** (a public one gets a
  warning and an explicit choice), and that it is empty or already carries a
  Kurenai manifest.
- Visibility is checked again before every push batch.

**Accidental uploads.** The app pushes only files it generated. Every push
also passes:
- an **allowlist** of paths and extensions;
- size caps (1 MB per file, 5 MB per commit);
- a **secret scan** (GitHub, Anthropic, OpenAI and AWS keys, private keys,
  passwords in connection strings, `.env`). A hit **blocks** the push and
  explains why.

**Identity.** Commits use your GitHub no-reply email. No personal data goes in
the generated README unless you add it.

**Teaching it.** Rider projects keep secrets in `dotnet user-secrets`, taught
in Bridge B and T1. If push protection is available for the repository, the
setup recommends turning it on.

### 10.5 Offline-first and backups

- **Local first.** Everything is recorded locally first (`state.code`,
  `kurenai-os-code`). GitHub is a replication and export target, **never the
  only successful write path** (invariant 31).
- **The outbox.** Pushes queue in a per-device outbox in `kurenai-os-code`.
  It drains when the device is online and the token is valid, with backoff. A
  failure never blocks progress.
- **Status.** Shown as "3 commits waiting", "Reconnect GitHub", "Pushed
  12:04".
- **What syncs.** The repository link and mode (`state.code.github = {repo,
  branch, mode}`) sync between devices. Tokens and the outbox are per device.
- **Backups.** The full backup includes the code store and excludes tokens.
- **Rewards.** Zero Governor traffic from GitHub.

---

## 11. Architecture in the app (additions to revision 1)

| Piece | File | Contract |
|---|---|---|
| The subject registry and the fourth hue | `spec.js`, `tokens.css` and every theme | The one subject list; the ~25 hard-coded lists read it |
| The concept graph, with strands, prerequisites, alternatives and tracks | `js/data/code.js` | Authored and validated |
| The interpreter and its worker | `js/labs/cs-interp.js`, `cs-worker.js` | Pure; precached through `EXTRA_PRECACHE` |
| The WebAssembly runtime adapter | `js/labs/cs-wasm.js` | Lazy; the same protocol |
| SQL sandbox v2 (SQLite in WebAssembly) and web sandbox (iframe) | `js/labs/sql-wasm.js`, `web-sandbox.js` | For T1 and T4 only (spikes S and H) |
| The checker | `js/core/codecheck.js` | Pure |
| The model: attempts, evidence, projects, the day's plan, the outbox | `js/core/code.js` | `normalise` and `normaliseEvidence` are the gates |
| The store | `js/core/codestore.js` (`kurenai-os-code`, `kos_code`) | Local first; in backups (and `kurenai-os-reports` joins backups too) |
| Project packages, the validator and the report schema | `assets/code/validator/validate.cs`, `js/data/code-projects.js` | The validator is versioned and tested on 3 operating systems |
| GitHub | `js/core/codegit.js` (`KOS.codeGit`), Edge Function `github-token` | API-only, the outbox, ownership rules, the secret scan |
| Views | `js/modules/code*.js`, `css/views/code.css` | From frames 26a–26x |

---

## 12. Releases, spikes and gates

### 12.1 Spikes (nothing ships; each one decides something)

| Spike | Question | Exit criterion | Needed by |
|---|---|---|---|
| **A · Interpreter** | Does it cover stages 1–2 exactly? | A 200-program differential against .NET, 100% identical; the published supported-subset list | R1 |
| **W · WebAssembly runtime** | Size, cold start (desktop and phone), memory, offline cache, compiling in the browser | A written verdict: **unit 7 or unit 8** becomes the boundary | R3 |
| **N · Notes depth** | What does one full-contract lesson cost? | **4.3 Dictionary written in full**, approved by you as the depth reference; hours per lesson measured, and the schedule set from it | R1 |
| **V · Rider validator** | Can `validate.cs` produce a trustworthy report? | One project end to end on macOS and Windows: SARIF and TRX parsed, protected-file hashes, an import with every rejection case, a CI run | R2 |
| **G · GitHub** | App or PAT, the token Edge Function, atomic commits, conflicts | An end-to-end test repository: consent, batched commit, a Rider push in between, the conflict branch, the secret-scan block, offline replay | R3 |
| **S · SQL sandbox** | SQLite in WebAssembly in a worker: size and offline | `JOIN`, `GROUP BY` and transactions in-app | T1 |
| **H · Web sandbox** | A sandboxed iframe with no network (CSP) for HTML/CSS/JS | Isolation proven | T4 |

### 12.2 The initial release: the core path, in four releases

| Release | Contents | Gate to ship |
|---|---|---|
| **R1 · Foundations** | Registry and hue · model and store · interpreter · lesson reader (Learn and Reference) · task editor · Daily 20 · retrieval · skill map · **stage 1 (units 1–3) at full depth** · capstone 1 · phone, including phone tasks · Governor · Home ladder | Spikes A and N done; frames 26 delivered; every smoke green; the content gate (§6) green for stage 1; 100% differential; responsive and accessibility audit in Graphite and Dawn; **two weeks of your own use** before deploying |
| **R2 · Working with data and the toolkit** | Units 4–6 · weekend projects (the in-app workspace) · katas · capstone 2 · zip export · **Bridge B** · **Rider workflow v1** (validator, local import, report history) · the T2 taster (first Avalonia window) | Spike V done; validator tested on 3 operating systems; the import rejection matrix fully covered by a smoke |
| **R3 · Object-oriented C# and the full runtime** | WebAssembly runtime · units 7–9 (with the nullable lesson) · capstone 3 (console or Avalonia) · reference in search · Assistant read tools · Reports section · `kos_code` replication · **GitHub integration v1** | Spikes W and G done; the full-runtime download tested offline and on a phone; the GitHub threat checklist (§10.4) reviewed |
| **R4 · Professional practice** | Units 10–12 · capstone 4 (Rider, CI-verified) · portfolio page · CI evidence | The core path complete; a cross-device sync and outbox test |

### 12.3 Later expansions (each its own release, in the order you choose)

Suggested order:
1. **T1** Connectivity and persistence (with Spike S);
2. **T2** UI and desktop (its taster is already in R2);
3. **T3** AI, ML and LLMs;
4. **D1–D2** Advanced C# and concurrency;
5. **D3** Algorithms;
6. **D4–D6** Engineering;
7. **T4** Web (with Spike H);
8. **T5** Systems;
9. **T6** Security;
10. **T7** Cloud;
11. **T8** Games;
12. **T9** Theory.

**Gate for every track:**
- its notes meet the depth contract;
- its in-app items pass the content gate;
- its Rider projects pass the validator matrix;
- its "where it runs" labels are accurate.

---

## 13. Tests

**Revision 1's smokes**, which cover:
- the registry;
- the interpreter;
- the checker;
- the planner's fixtures;
- payout once, HP and the cap;
- the store and backup;
- the content validator;
- render purity.

**Added:**
- the notes depth contract;
- phone-task pay (reduced, then topped up, never doubled);
- the evidence import matrix, every row of §9.4;
- the GitHub outbox:
  - batching;
  - compare-and-set retry;
  - the conflict branch;
  - the secret-scan block;
  - offline replay;
  - a token never in state or backups.

**Outside the jsdom gate:**
- the validator's own tests on Windows, macOS and Linux (GitHub Actions in the
  validator's repository);
- `tools/cs_diff.mjs` locally against `dotnet`.

## 14. Invariants this adds or moves

- **24:** an authored, validated spine, concept graph and depth contract.
- **26:** the subject registry and a fourth hue.
- **2:** task HP (+3; +1 for a phone task), which gates nothing.
- **7, 35, 36:** `kurenai-os-code`, its backup, `kos_code`; GitHub tokens
  only in the per-device credentials kv.
- **New, the sandbox:** learner code runs in a worker with no network, DOM or
  app data.
- **New, pay once:** first pass only. A phone task pays part, and the desktop
  pass pays the rest; never more than one full reward.
- **New, derived grades:** retrieval grades come from the check.
- **New, the computed plan:** the day's plan is computed, never stored.
- **New, evidence:** imported or CI reports become evidence through
  `normaliseEvidence`. They never write progress directly, and they are
  idempotent by report hash.
- **New, GitHub:** GitHub is a replication target and never the only write
  path. The app writes only the paths it owns, never force-pushes, and never
  pushes a file that fails the allowlist or the secret scan.
- **71a:** the Assistant's Code tools. **95 and 102:** a `code` notification
  kind (failed push, conflict, report imported) and a Reports section.

## 15. Risks

| Risk | Mitigation |
|---|---|
| **The volume of content** (~121 core lessons at full depth) | Spike N measures it; one stage per release; the per-section pipeline that shipped CS Papers 1 and 2 |
| The WebAssembly runtime is heavy on phones | Spike W; phones lead with notes and retrieval after unit 3 anyway |
| .NET, Avalonia and EF versions churn | `global.json` pins; project scaffold versions; the validator matrix in CI |
| Imported evidence is gamed | It is your own progress: hashes make tampering visible, and CI-verified is offered as the stronger level |
| A GitHub token leaks | Least privilege (one repository), short-lived tokens, only in the credentials kv, never synced or backed up, revocable in GitHub |
| Scope creep from tracks | Tracks never block the core; one track per release; each has its own gate |
