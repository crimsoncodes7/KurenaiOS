/* Kurenai OS — data/content/code-u10.js
   Code · Unit 10 · Testing and design (roadmap 5.3), stage 4.

   Done in Rider, like Bridge B: why and how to test with xUnit, arrange-
   act-assert, test-driven development, test doubles, refactoring under
   tests, naming and clean code, and SOLID. The lessons hold the Rider form
   of the notes contract (smoke75): the same pages, commands and files as
   blocks (xUnit cannot run in the browser), a Pitfalls page, flashcards
   and a quiz. Their work is the unit 10 project, "The Lending Library"
   (rp-u10-library; files generated into code-projects-files.js from
   tools/code-projects/library-legacy/): a small legacy module the learner
   pins down with their OWN tests — proven by the validator 1.1.0 checks
   (owntests, planted bugs, source and warnings) — then refactors. Its
   retrieval cards are COMMAND cards: the answer is typed, never chosen.   */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function sh(cap, src) { return { code: { lang: "shell", src: src, cap: cap } }; }
  function file(cap, lang, src) { return { code: { lang: lang, src: src, cap: cap } }; }
  function cs(cap, src) { return file(cap, "csharp", src); }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }

  K.add({ concepts: {
    "why-test": { name: "Why test", lesson: "10.1", about: "a safety net and a specification" },
    "xunit": { name: "xUnit", lesson: "10.2", about: "[Fact], [Theory], dotnet test" },
    "aaa": { name: "Arrange, act, assert", lesson: "10.3", about: "one behaviour, said clearly" },
    "tdd": { name: "Test-driven development", lesson: "10.4", about: "red, green, refactor" },
    "test-doubles": { name: "Test doubles", lesson: "10.5", about: "fakes, stubs, mocks, a clock you control" },
    "refactoring": { name: "Refactoring", lesson: "10.6", about: "structure changes, behaviour stays" },
    "clean-code": { name: "Naming and clean code", lesson: "10.7", about: "code that explains itself" },
    "solid-so": { name: "SOLID: S and O", lesson: "10.8", about: "one reason to change; open to extension" },
    "solid-lid": { name: "SOLID: L, I and D", lesson: "10.9", about: "substitution, small interfaces, abstractions" },
    "legacy-tests": { name: "Testing legacy code", lesson: "10.10", about: "pin it down, then change it" }
  } });

  /* ================================================================
     10.1 Why test
     ================================================================ */
  lesson("10.1", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Every change risks breaking something that used to work. Checking by hand — run it, type some input, look — is slow, and nobody re-checks everything after every change.",
        "An **automated test** is a small program that runs your code with known inputs and checks the outputs. A thousand of them run in seconds, every time.",
        "Tests are a **safety net** (you can change code without fear) and a **specification** (they say, exactly, what the code must do)."
      ] },
      page("Core idea"),
      cs("a test: run the code, check the answer", 'public class LateFeesTests\n{\n    [Fact]\n    public void A_book_three_days_late_costs_25p()\n    {\n        var loan = new Loan("Dune", "book", Today.AddDays(-3));\n        decimal fee = new LateFees().Calculate(loan);\n        Assert.Equal(0.25m, fee);\n    }\n}'),
      sh("run every test in the solution", "dotnet test\n\nPassed!  - Failed: 0, Passed: 12, Skipped: 0, Total: 12, Duration: 41 ms"),
      { ul: [
        "A test is an ordinary method marked `[Fact]`, in a separate **test project** that references the code.",
        "`Assert.Equal(expected, actual)` passes quietly or fails with both values shown.",
        "`dotnet test` (or Rider's Unit Tests window) runs them all and reports."
      ] },
      page("Rules"),
      { table: { head: ["Kind", "Tests", "Speed", "Here"], rows: [["unit", "one class or method, alone", "milliseconds", "most of your tests"], ["integration", "several parts together (a real file, a database)", "seconds", "fewer"], ["end-to-end", "the whole program as a user would", "slow", "a handful"]] } },
      { ul: [
        "Test **behaviour** (what comes out for what goes in), not how the code does it, so tests survive refactoring.",
        "A good test is fast, repeatable (same result every run), independent (any order) and can fail — a test that cannot fail proves nothing.",
        "Write a test when you fix a bug: it proves the fix and stops the bug coming back (a **regression** test).",
        "Tests are code: name them well and keep them tidy."
      ] },
      page("Variations"),
      { h: "A test that documents an odd rule" },
      cs("the name says what the code really does", '[Fact]\npublic void A_damaged_book_inside_its_grace_days_is_still_free()\n{\n    var loan = new Loan("Emma", "book", Today.AddDays(-1), Damaged: true);\n    Assert.Equal(0m, new LateFees().Calculate(loan));\n}'),
      { h: "A failing test, as Rider shows it" },
      sh("expected and actual side by side", "Failed LateFeesTests.A_dvd_two_days_late_costs_2_pounds\n  Assert.Equal() Failure: Values differ\n  Expected: 2.00\n  Actual:   1.50\n  at LateFeesTests.cs:line 27"),
      page("Pitfalls"),
      { h: "A test that cannot fail" },
      cs("it asserts nothing about the result", '[Fact]\npublic void Calculates_a_fee()\n{\n    var fee = new LateFees().Calculate(loan);\n    Assert.True(fee >= 0);   // true for almost any bug\n}'),
      { h: "Testing how instead of what" },
      "A test that checks a private field or counts calls to a helper breaks when you tidy the code, even though nothing a user sees changed. Check the result.",
      { h: "A test that depends on today" },
      "`DateTime.Today` makes a test pass this week and fail next month. 10.5 hands the code a clock the test controls.",
      page("Connections"),
      { ul: [ "**Back:** every task in units 1–9 was checked by tests — Kurenai's. Now you write them.", "**Next:** 10.2 xUnit in detail; 10.3 the shape of a good test.", "**The project:** milestone 1 of *The Lending Library*." ] },
      page("Good practice"),
      { ul: [ "Run the tests before and after every change.", "Fix a failing test before writing new code.", "A bug report becomes a failing test first." ] },
      page("Practise"),
      { ul: [ "**The Lending Library, milestone 1:** your first five tests of `LateFees`." ] },
      page("Quick reference"),
      sh("the loop", "dotnet test              # everything\ndotnet test --filter Fee # names containing Fee"),
      { ul: [ "Unit tests: fast, repeatable, independent, able to fail.", "Test behaviour, not implementation.", "A bug fix starts with a failing test." ] },
      { table: { head: ["Outcome", "Means"], rows: [["Passed", "the check held"], ["Failed", "expected and actual differ (both shown)"], ["Skipped", "marked to skip — say why"]] } }
    ],
    flashcards: [
      ["What is an automated test?", "Code that runs your code with known inputs and checks the outputs."],
      ["Two jobs tests do", "A safety net for change, and a precise specification."],
      ["What makes a test good?", "Fast, repeatable, independent, and able to fail."],
      ["What is a regression test?", "A test added with a bug fix, so the bug cannot return unnoticed."],
      ["Test behaviour or implementation?", "Behaviour — what comes out for what goes in."],
      ["Unit vs integration test?", "Unit: one part alone, fast. Integration: parts together, slower."]
    ],
    quiz: [
      { q: "`Assert.True(fee >= 0)` as the only check…", opts: ["is a strong test", "almost never fails, so proves little", "is a compile error", "tests the clock"], ans: 1, why: "Nearly any wrong fee is still ≥ 0." },
      { q: "You fix a bug. First…", opts: ["delete the old tests", "write a test that fails because of the bug", "refactor everything", "ship it"], ans: 1, why: "It proves the fix and guards against regression." },
      { q: "Most tests in a healthy project are…", opts: ["end-to-end", "unit tests", "manual", "integration"], ans: 1, why: "Fast and precise, they form the base." }
    ]
  });

  /* ================================================================
     10.2 xUnit: Fact and Theory
     ================================================================ */
  lesson("10.2", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Tests need a framework: something to find the test methods, run them, collect results and report.",
        "**xUnit** is the common choice for .NET (NUnit and MSTest are the others). It needs a test project, two attributes and the `Assert` class.",
        "`[Fact]` is one test. `[Theory]` is one test method run once per row of data — ten cases without ten copies."
      ] },
      page("Core idea"),
      sh("create a test project and wire it up", "dotnet new xunit -o tests/Library.Tests\ndotnet sln add tests/Library.Tests\ndotnet add tests/Library.Tests reference src/Library\ndotnet test"),
      cs("a Fact and a Theory", 'public class LateFeesTests\n{\n    [Fact]\n    public void A_loan_not_yet_due_costs_nothing() =>\n        Assert.Equal(0m, Fees.Calculate(new Loan("Dune", "book", Today.AddDays(7))));\n\n    [Theory]\n    [InlineData(3, "0.25")]\n    [InlineData(6, "1.00")]\n    [InlineData(50, "10.00")]\n    public void Late_books_cost_25p_a_day_after_two_days_grace(int daysLate, string expected) =>\n        Assert.Equal(decimal.Parse(expected), Fees.Calculate(new Loan("Dune", "book", Today.AddDays(-daysLate))));\n}'),
      { ul: [
        "Each `[InlineData(…)]` row becomes a separate test with its own name and result.",
        "The row's values fill the method's parameters in order; their types must match.",
        "Attribute arguments must be constants, so a decimal travels as a string or a double."
      ] },
      page("Rules"),
      { table: { head: ["xUnit", "Means"], rows: [["`[Fact]`", "a test with no parameters"], ["`[Theory]` + `[InlineData(…)]`", "one run per row"], ["`[MemberData(nameof(Rows))]`", "rows from a static property (any types)"], ["`Assert.Equal(e, a)`", "equal, showing both"], ["`Assert.True/False(c, msg)`", "a condition, with a message"], ["`Assert.Throws<T>(() => …)`", "the code throws exactly T"], ["`Assert.Single`, `Assert.Empty`, `Assert.Contains`", "about a collection"]] } },
      { ul: [
        "Test classes and methods are `public`; a test class gets a **new instance for every test**, so tests never share fields by accident.",
        "Setup code shared by every test goes in the constructor; cleanup in `Dispose` (IDisposable).",
        "Test projects reference the code they test; the code never references its tests.",
        "In Rider: the gutter's ▶ runs one test; the Unit Tests window runs, filters and re-runs the failed ones."
      ] },
      page("Variations"),
      { h: "Rows of any type" },
      cs("MemberData for values attributes cannot hold", 'public static TheoryData<Loan, decimal> Damaged => new()\n{\n    { new Loan("Dune", "book", Today.AddDays(-3), Damaged: true), 5.25m },\n    { new Loan("Heat", "dvd", Today.AddDays(-1), Damaged: true), 6.00m }\n};\n\n[Theory]\n[MemberData(nameof(Damaged))]\npublic void Damage_adds_five_pounds_to_a_late_fee(Loan loan, decimal expected) =>\n    Assert.Equal(expected, Fees.Calculate(loan));'),
      { h: "Running some of them" },
      sh("filter by name", "dotnet test --filter Renew\ndotnet test --filter \"FullyQualifiedName~LateFeesTests\"\ndotnet test --filter \"DisplayName~dvd\""),
      { h: "Expected exceptions" },
      cs("Assert.Throws returns the exception to inspect", '[Fact]\npublic void Renewing_an_overdue_loan_is_refused()\n{\n    var loan = new Loan("Dune", "book", Today.AddDays(-1));\n    var e = Assert.Throws<InvalidOperationException>(() => loan.Renew(Today));\n    Assert.Contains("overdue", e.Message);\n}'),
      page("Pitfalls"),
      { h: "A Theory with no data" },
      sh("xUnit refuses it", "error xUnit1003: Theory methods must have test data. Use [InlineData], [MemberData], or [ClassData]."),
      { h: "Data that does not fit the parameters" },
      sh("a string where an int goes", "error xUnit1010: The value is not convertible to the method parameter 'daysLate' of type 'int'."),
      { h: "A private test method" },
      "A `[Fact]` on a private method is not found and never runs — the run looks green with one test fewer. xUnit warns (xUnit1031-style analyzers); keep test methods public.",
      page("Connections"),
      { ul: [ "**Back:** 10.1 why test; 8.x attributes and records; B.2 the dotnet verbs.", "**Next:** 10.3 shapes each test; 10.4 writes them first.", "**The project:** milestone 1 asks for a `[Theory]`." ] },
      page("Good practice"),
      { ul: [ "One `[Theory]` for one rule with many cases; a `[Fact]` for a single situation.", "Keep each row readable: a few simple values.", "Run tests from Rider's gutter while you work and `dotnet test` before you commit." ] },
      page("Practise"),
      { ul: [ "**The Lending Library, milestone 1:** at least five tests, one of them a `[Theory]`." ] },
      page("Quick reference"),
      cs("the attributes", '[Fact] public void One_case() { }\n[Theory, InlineData(1), InlineData(2)] public void Many(int x) { }'),
      { ul: [ "`dotnet new xunit`, `dotnet add … reference …`, `dotnet test`.", "`[Fact]`, `[Theory]` + `[InlineData]` / `[MemberData]`.", "`Assert.Equal`, `Throws<T>`, `Single`, `Contains`." ] },
      { table: { head: ["Code", "Means", "Page"], rows: [["xUnit1003", "a Theory with no data", "Pitfalls"], ["xUnit1010", "data of the wrong type", "Pitfalls"]] } }
    ],
    flashcards: [
      ["[Fact] or [Theory]?", "Fact: one case, no parameters. Theory: one method run for each row of data."],
      ["How does a Theory get its rows?", "[InlineData(…)] attributes, or [MemberData] from a static property."],
      ["Does each test get a fresh test-class instance?", "Yes — tests do not share fields."],
      ["How do you assert an exception?", "Assert.Throws<T>(() => code); it returns the exception."],
      ["How do you run only some tests?", "dotnet test --filter Name (or Rider's Unit Tests window)."],
      ["Which references which: tests or code?", "The test project references the code, never the other way."]
    ],
    quiz: [
      { q: "A [Theory] with four [InlineData] rows reports…", opts: ["one test", "four tests", "an error", "eight tests"], ans: 1, why: "One per row." },
      { q: "Where does setup shared by every test in a class go?", opts: ["a static field", "the test class constructor", "Main", "an attribute"], ans: 1, why: "xUnit makes a new instance per test." },
      { q: "A decimal in [InlineData]…", opts: ["works directly", "must travel as a string or double, since attribute values are constants", "is a runtime error", "needs MemberData only"], ans: 1, why: "decimal is not an attribute constant type." }
    ]
  });

  /* ================================================================
     10.3 Arrange, act, assert
     ================================================================ */
  lesson("10.3", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A failing test should say, in its name and its three or four lines, exactly what broke. A long test that sets up five things, calls three methods and checks nine values says only \"something\".",
        "**Arrange, act, assert** (AAA) gives every test the same shape: set up, do one thing, check the result.",
        "One behaviour per test, named for that behaviour."
      ] },
      page("Core idea"),
      cs("the three parts, one blank line apart", '[Fact]\npublic void A_dvd_costs_a_pound_for_each_day_late()\n{\n    // Arrange\n    var fees = new LateFees(new FixedClock(new DateOnly(2026, 3, 10)));\n    var loan = new Loan("Heat", "dvd", new DateOnly(2026, 3, 7));\n\n    // Act\n    decimal fee = fees.Calculate(loan);\n\n    // Assert\n    Assert.Equal(3.00m, fee);\n}'),
      { ul: [
        "**Arrange**: build the objects and inputs this case needs — nothing more.",
        "**Act**: one call, the behaviour under test.",
        "**Assert**: check the outcome. Several asserts are fine when they describe one outcome."
      ] },
      page("Rules"),
      { ul: [
        "Name the test as a sentence about behaviour: `Method_situation_result` or plain words: `A_dvd_costs_a_pound_for_each_day_late`.",
        "No `if` or loops in a test: logic in a test can hide a bug as well as code can.",
        "Make the numbers obvious: `today.AddDays(-3)` says \"three days late\" better than a calendar date does.",
        "A helper that builds the common case (`LoanDaysLate(3)`) keeps Arrange short; a test should still read on its own.",
        "Check exact values. Doubles need a precision: `Assert.Equal(0.3, x, precision: 10)`; decimals compare exactly."
      ] },
      { table: { head: ["Weak", "Strong"], rows: [["`Test1`", "`Book_inside_grace_days_is_free`"], ["asserts the fee is positive", "asserts it is 0.25"], ["three behaviours in one test", "three tests"], ["a loop over cases", "a [Theory]"]] } },
      page("Variations"),
      { h: "A builder for the common case" },
      cs("helpers keep Arrange to one line", 'static readonly DateOnly Today = new(2026, 3, 10);\nstatic LateFees Fees => new(new FixedClock(Today));\nstatic Loan BookLate(int days, bool damaged = false) => new("Dune", "book", Today.AddDays(-days), damaged);\n\n[Fact]\npublic void A_book_six_days_late_costs_a_pound() => Assert.Equal(1.00m, Fees.Calculate(BookLate(6)));'),
      { h: "One outcome, two asserts" },
      cs("both lines describe the renewed loan", '[Fact]\npublic void Renewing_adds_fourteen_days_and_counts_it()\n{\n    var loan = new Loan("Dune", "book", Today.AddDays(2));\n\n    var renewed = loan.Renew(Today);\n\n    Assert.Equal(Today.AddDays(16), renewed.Due);\n    Assert.Equal(1, renewed.Renewals);\n}'),
      { h: "Boundaries" },
      sh("the cases that find bugs sit at the edges", "0 days late   → free (the edge of \"due\")\n2 days late   → free (the last grace day)\n3 days late   → 0.25 (the first paid day)\n42 days late  → 10.00 (just past the cap)"),
      page("Pitfalls"),
      { h: "Several acts in one test" },
      cs("which call broke it?", '[Fact]\npublic void Fees_work()\n{\n    Assert.Equal(0m, Fees.Calculate(BookLate(1)));\n    Assert.Equal(0.25m, Fees.Calculate(BookLate(3)));\n    Assert.Equal(3m, Fees.Calculate(DvdLate(3)));\n}   // split into three tests, or one [Theory]'),
      { h: "Logic in the test" },
      cs("the test repeats the code's formula — and its bug", '[Fact]\npublic void Book_fee()\n{\n    int days = 5;\n    Assert.Equal((days - 2) * 0.25m, Fees.Calculate(BookLate(days)));\n}   // write 0.75m'),
      { h: "Expected and actual swapped" },
      "`Assert.Equal(fee, 0.25m)` passes and fails exactly as well, but its failure message calls your wrong answer \"Expected\". Expected first.",
      page("Connections"),
      { ul: [ "**Back:** 10.2 xUnit; 6.x boundary values in validation.", "**Next:** 10.4 writes the test before the code; 10.7 naming in general.", "**The project:** milestones 1 and 2 — tests that would catch a planted bug." ] },
      page("Good practice"),
      { ul: [ "Arrange, act, assert, with blank lines between.", "Test the boundaries: just inside, on, and just past every limit.", "If the name needs \"and\", it is two tests." ] },
      page("Practise"),
      { ul: [ "**The Lending Library, milestone 2:** tests sharp enough to catch at least four of five planted bugs." ] },
      page("Quick reference"),
      cs("the shape", '[Fact]\npublic void Situation_gives_result()\n{\n    var x = Arrange();\n    var r = x.Act();\n    Assert.Equal(expected, r);\n}'),
      { ul: [ "Arrange · act · assert; one behaviour.", "Names are sentences; numbers are obvious.", "Boundaries; no logic; expected first." ] },
      { table: { head: ["Smell", "Fix"], rows: [["several acts", "split, or a [Theory]"], ["a formula in the assert", "a literal expected value"]] } }
    ],
    flashcards: [
      ["What are the three parts of a test?", "Arrange (set up), act (one call), assert (check)."],
      ["How many behaviours per test?", "One."],
      ["Why no if or loops in tests?", "Logic in a test can hide bugs too; use a [Theory] for many cases."],
      ["Which order: expected or actual first?", "Expected first: Assert.Equal(expected, actual)."],
      ["Where do bugs hide?", "At boundaries: just inside, on, and just past each limit."],
      ["A good test name…", "Says the situation and the result, like a sentence."]
    ],
    quiz: [
      { q: "A test named Fees_work with three calls and three asserts should become…", opts: ["one bigger test", "three tests or one Theory", "a loop", "a comment"], ans: 1, why: "One behaviour each, so a failure says which." },
      { q: "`Assert.Equal((days - 2) * 0.25m, fee)` is weak because…", opts: ["it is slow", "it repeats the formula, so it shares the code's bugs", "decimals cannot be compared", "it has no name"], ans: 1, why: "Assert a known value: 0.75m." },
      { q: "For a two-day grace period, the most useful cases are…", opts: ["1 and 100", "2 and 3 days late", "only 0", "random days"], ans: 1, why: "The boundary: last free day and first paid day." }
    ]
  });

  /* ================================================================
     10.4 Test-driven development
     ================================================================ */
  lesson("10.4", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Tests written after the code tend to test what the code happens to do, and some code never gets a test at all.",
        "**Test-driven development** (TDD) turns it round: write a small test for behaviour that does not exist yet, watch it fail, write just enough code to pass it, then tidy up.",
        "**Red → green → refactor**, in steps of a few minutes. The tests come first, so every line of code has a reason."
      ] },
      page("Core idea"),
      cs("① red: a test for Renew, which does not work yet", '[Fact]\npublic void Renewing_adds_fourteen_days()\n{\n    var loan = new Loan("Dune", "book", Today.AddDays(2));\n    Assert.Equal(Today.AddDays(16), loan.Renew(Today).Due);\n}\n// dotnet test → Failed: NotImplementedException'),
      cs("② green: the simplest code that passes", 'public Loan Renew(DateOnly today) => this with { Due = Due.AddDays(14), Renewals = Renewals + 1 };'),
      cs("③ the next test, red again — then green", '[Fact]\npublic void An_overdue_loan_cannot_be_renewed() =>\n    Assert.Throws<InvalidOperationException>(() => new Loan("Dune", "book", Today.AddDays(-1)).Renew(Today));\n\n// green:\npublic Loan Renew(DateOnly today)\n{\n    if (Due < today) throw new InvalidOperationException("An overdue loan cannot be renewed.");\n    return this with { Due = Due.AddDays(14), Renewals = Renewals + 1 };\n}'),
      page("Rules"),
      { ol: [ "**Red**: write one small failing test. Run it and **see it fail** — for the right reason.", "**Green**: write the least code that makes every test pass. Shortcuts are allowed.", "**Refactor**: improve names and structure with all tests green. Then the next test." ] },
      { ul: [
        "Steps are small: one rule, one test, a few minutes.",
        "Seeing red proves the test can fail; a test that passes at once may test nothing.",
        "The list of tests to write next is your plan; tick them off.",
        "TDD shapes design too: code that is hard to test (it reads the clock, sends email) shows you where a seam is needed (10.5)."
      ] },
      page("Variations"),
      { h: "The test list" },
      sh("written before the first test", "Renew:\n  [x] adds 14 days\n  [x] counts the renewal\n  [ ] original loan unchanged\n  [ ] due today: still allowed\n  [ ] overdue: refused\n  [ ] third renewal: refused"),
      { h: "Running the loop in Rider" },
      sh("keyboard, not mouse", "⌃⇧R / Ctrl+Shift+R   run the test under the cursor\n⌥⇧R / Alt+Shift+R    re-run the last run\nUnit Tests window    show only failed · continuous testing"),
      { h: "Fake it, then make it" },
      cs("the first green can be a constant; the next test forces the real code", '// test 1: 3 days late → 0.25\npublic decimal Calculate(Loan l) => 0.25m;          // green, and silly\n// test 2: 6 days late → 1.00 forces the formula\npublic decimal Calculate(Loan l) => (DaysLate(l) - 2) * 0.25m;'),
      page("Pitfalls"),
      { h: "Skipping red" },
      "Writing the test after the code and seeing it pass first time proves nothing about the test. Break the code briefly, or write the test first.",
      { h: "Too big a step" },
      "A test that needs fifty lines of new code to pass gives a long red phase and a vague failure. Split it into smaller behaviours.",
      { h: "Never refactoring" },
      "Green is not done: fake-it code and duplication pile up. Refactor with the tests' protection, every cycle.",
      page("Connections"),
      { ul: [ "**Back:** 10.2–10.3 xUnit and AAA.", "**Next:** 10.5 doubles for what is hard to test; 10.6 refactoring, the third step.", "**The project:** milestone 3, Loan.Renew test-first." ] },
      page("Good practice"),
      { ul: [ "Keep a test list; one item at a time.", "Commit on green.", "Let a hard-to-write test tell you the design needs changing." ] },
      page("Practise"),
      { ul: [ "**The Lending Library, milestone 3:** Loan.Renew, test-first." ] },
      page("Quick reference"),
      sh("the cycle", "RED      write a failing test, run it, see it fail\nGREEN    the simplest code that passes\nREFACTOR tidy with every test green\n→ next test"),
      { ul: [ "Red → green → refactor.", "Small steps; see it fail.", "A test list is the plan." ] },
      { table: { head: ["Step", "Ends when"], rows: [["red", "the new test fails for the right reason"], ["green", "every test passes"], ["refactor", "the code is clean and still green"]] } }
    ],
    flashcards: [
      ["The three steps of TDD?", "Red (a failing test), green (simplest code to pass), refactor (tidy, still green)."],
      ["Why watch the test fail first?", "It proves the test can fail and checks the right thing."],
      ["How much code in the green step?", "The least that makes every test pass."],
      ["What is a test list?", "The behaviours still to test, written before starting, ticked off one by one."],
      ["What does a test that is hard to write tell you?", "The design needs a seam (e.g. an interface for the clock)."],
      ["When do you commit in TDD?", "On green."]
    ],
    quiz: [
      { q: "In TDD the code for a new rule is written…", opts: ["before its test", "after a failing test for it", "never", "by the test"], ans: 1, why: "Red first." },
      { q: "During refactor you may…", opts: ["add new behaviour", "change structure while tests stay green", "delete failing tests", "skip running tests"], ans: 1, why: "Behaviour is fixed; structure improves." },
      { q: "A new test passes the first time you run it. You should…", opts: ["celebrate", "check it can fail", "delete it", "refactor"], ans: 1, why: "It may not test anything." }
    ]
  });

  /* ================================================================
     10.5 Test doubles
     ================================================================ */
  lesson("10.5", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "`LateFees` reads `DateTime.Today`; `Reminders` sends real email. A test of either depends on the calendar, or spams someone.",
        "A **test double** stands in for a real dependency during a test, as a stunt double does for an actor: a clock stuck on 10 March, a notifier that only writes down what it was asked to send.",
        "To swap one in, the code must receive its dependency (through the constructor, as an interface) instead of creating or reaching for it."
      ] },
      page("Core idea"),
      cs("the seam: depend on IClock, receive it", 'public interface IClock { DateOnly Today { get; } }\n\npublic class LateFees\n{\n    private readonly IClock clock;\n    public LateFees(IClock clock) => this.clock = clock;\n    public LateFees() : this(new SystemClock()) { }\n\n    public decimal Calculate(Loan loan)\n    {\n        int daysLate = clock.Today.DayNumber - loan.Due.DayNumber;\n        …\n    }\n}'),
      cs("the double: a fixed clock, written in the test project", 'sealed class FixedClock(DateOnly today) : IClock\n{\n    public DateOnly Today => today;\n}\n\n[Fact]\npublic void Ten_days_late_book_costs_two_pounds()\n{\n    var fees = new LateFees(new FixedClock(new DateOnly(2026, 3, 10)));\n    Assert.Equal(2.00m, fees.Calculate(new Loan("Dune", "book", new DateOnly(2026, 2, 28))));\n}'),
      page("Rules"),
      { table: { head: ["Double", "Does", "Example"], rows: [["dummy", "fills a parameter, never used", "`null!` or an empty object"], ["stub", "returns canned answers", "FixedClock"], ["fake", "a working, simplified version", "an in-memory repository"], ["spy", "records how it was used, for asserts", "a notifier that keeps a list"], ["mock", "a spy built by a library that verifies calls", "Moq, NSubstitute"]] } },
      { ul: [
        "A double needs a **seam**: an interface the code depends on, passed in (dependency injection). `new SmtpSender()` inside a method has no seam.",
        "Keep a constructor that supplies the real thing, so ordinary callers do not change.",
        "Hand-written doubles are short and clear; a mocking library helps when an interface is large.",
        "Assert on outcomes where you can; check calls (spies, mocks) only when the call **is** the outcome — like sending a reminder."
      ] },
      page("Variations"),
      { h: "A spy for notifications" },
      cs("it records; the test reads the record", 'sealed class SpyNotifier : INotifier\n{\n    public List<(string To, string Text)> Sent { get; } = new();\n    public void Send(string to, string text) => Sent.Add((to, text));\n}\n\n[Fact]\npublic void An_overdue_loan_gets_one_reminder()\n{\n    var spy = new SpyNotifier();\n    new Reminders(spy).SendOverdue(new[] { ("ada@school.test", BookDue(Today.AddDays(-9))) }, Today);\n    Assert.Equal("ada@school.test", Assert.Single(spy.Sent).To);\n}'),
      { h: "The same with a mocking library" },
      cs("NSubstitute builds the double", 'var notifier = Substitute.For<INotifier>();\nnew Reminders(notifier).SendOverdue(loans, Today);\nnotifier.Received(1).Send("ada@school.test", Arg.Any<string>());'),
      sh("add it to your test project", "dotnet add tests/Library.Tests package NSubstitute"),
      { h: "A fake repository" },
      cs("an in-memory stand-in for a database", 'public interface ILoanStore { IEnumerable<Loan> All(); void Save(Loan loan); }\n\nsealed class InMemoryStore : ILoanStore\n{\n    private readonly List<Loan> loans = new();\n    public IEnumerable<Loan> All() => loans;\n    public void Save(Loan loan) => loans.Add(loan);\n}'),
      page("Pitfalls"),
      { h: "Mocking everything" },
      "A test that doubles every collaborator only checks that the code calls what it calls — it fails on every refactor and passes on real bugs. Double what is slow, random or outside (clock, network, email, disk); use real objects for the rest.",
      { h: "Testing the double" },
      cs("this proves FixedClock works, not LateFees", '[Fact]\npublic void Clock_is_fixed() => Assert.Equal(new DateOnly(2026, 3, 10), new FixedClock(new DateOnly(2026, 3, 10)).Today);'),
      { h: "A static dependency with no seam" },
      "`DateTime.Now`, `File.ReadAllText` and `Console` called directly inside a method cannot be replaced in a test. Wrap them behind an interface and pass it in.",
      page("Connections"),
      { ul: [ "**Back:** 8.4 interfaces; 8.12 composition and injected parts; 11.9's fake server was a double.", "**Next:** 10.9 dependency inversion is the design principle behind the seam.", "**The project:** milestone 4 (a clock you control) and milestone 5 (a notifier)." ] },
      page("Good practice"),
      { ul: [ "Inject dependencies through the constructor as interfaces.", "Double only the awkward edges; keep the rest real.", "Prefer asserting results to verifying calls." ] },
      page("Practise"),
      { ul: [ "**The Lending Library, milestone 4:** LateFees takes an IClock; your tests use a fixed one." ] },
      page("Quick reference"),
      cs("stub and spy", 'sealed class FixedClock(DateOnly d) : IClock { public DateOnly Today => d; }\nsealed class Spy : INotifier { public int Calls; public void Send(string t, string x) => Calls++; }'),
      { ul: [ "dummy · stub · fake · spy · mock.", "A seam: an interface, passed in.", "Double the clock, the network, the email; not your own logic." ] },
      { table: { head: ["Smell", "Fix"], rows: [["DateTime.Today inside the code", "inject an IClock"], ["new SmtpSender() inside a method", "inject an INotifier"]] } }
    ],
    flashcards: [
      ["What is a test double?", "A stand-in for a real dependency during a test."],
      ["Stub or spy: returns canned answers?", "Stub."],
      ["Stub or spy: records calls for asserts?", "Spy (a mock is a library-built spy that verifies)."],
      ["What is a fake?", "A working, simplified implementation, like an in-memory store."],
      ["What does code need before a double can be swapped in?", "A seam: it depends on an interface passed in, not one it creates."],
      ["What should you double?", "What is slow, random or outside: clock, network, email, disk."]
    ],
    quiz: [
      { q: "FixedClock that always returns 10 March is a…", opts: ["mock", "stub", "dummy", "integration test"], ans: 1, why: "It returns a canned answer." },
      { q: "`var smtp = new SmtpSender();` inside Reminders makes testing hard because…", opts: ["it is slow to type", "there is no seam to swap in a double", "SmtpSender is sealed", "it is static"], ans: 1, why: "Pass an INotifier in instead." },
      { q: "A test that mocks every collaborator tends to…", opts: ["catch more bugs", "break on refactors and miss real bugs", "run slower but be stronger", "need no asserts"], ans: 1, why: "It tests calls, not behaviour." }
    ]
  });

  /* ================================================================
     10.6 Refactoring safely
     ================================================================ */
  lesson("10.6", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Code that works but is hard to read or change gets harder every time someone adds to it.",
        "**Refactoring** changes the structure of code **without changing what it does**: rename, extract a method, introduce a constant, move a responsibility.",
        "Done safely: tests first (so you know behaviour did not move), tiny steps, tests after each, and the IDE's automated refactorings wherever they exist."
      ] },
      page("Core idea"),
      cs("before: one dense method", 'public decimal Calculate(Loan loan)\n{\n    var today = DateOnly.FromDateTime(DateTime.Today);\n    int d = today.DayNumber - loan.Due.DayNumber;\n    if (d <= 0) return 0;\n    decimal f;\n    if (loan.Kind == "dvd") { f = d * 1.00m; }\n    else { if (d <= 2) return 0; f = (d - 2) * 0.25m; }\n    if (f > 10m) f = 10m;\n    if (loan.Damaged) f += 5m;\n    return f;\n}'),
      cs("after: the same behaviour, named", 'const decimal BookRate = 0.25m, DvdRate = 1.00m, Cap = 10m, DamageCharge = 5m;\nconst int BookGraceDays = 2;\n\npublic decimal Calculate(Loan loan)\n{\n    int daysLate = clock.Today.DayNumber - loan.Due.DayNumber;\n    if (daysLate <= 0) return 0;\n    if (loan.Kind != "dvd" && daysLate <= BookGraceDays) return 0;\n    decimal fee = Math.Min(Cap, BaseFee(loan, daysLate));\n    return loan.Damaged ? fee + DamageCharge : fee;\n}\n\nstatic decimal BaseFee(Loan loan, int daysLate) =>\n    loan.Kind == "dvd" ? daysLate * DvdRate : (daysLate - BookGraceDays) * BookRate;'),
      page("Rules"),
      { ol: [ "Green tests that cover the code you will change (write them first if missing — 10.10).", "One small refactoring.", "Run the tests. Green: commit or carry on. Red: undo, take a smaller step.", "Never change behaviour and structure in the same step." ] },
      { table: { head: ["Rider refactoring", "macOS", "Windows/Linux"], rows: [["Rename", "⇧F6", "Shift+F6"], ["Extract Method", "⌥⌘M", "Ctrl+Alt+M"], ["Introduce Variable", "⌥⌘V", "Ctrl+Alt+V"], ["Introduce Constant", "⌥⌘C", "Ctrl+Alt+C"], ["Inline", "⌥⌘N", "Ctrl+Alt+N"], ["Change Signature", "⌘F6", "Ctrl+F6"], ["Refactor This (menu)", "⌃T", "Ctrl+Shift+R"]] } },
      { ul: [ "Automated refactorings update every use correctly; hand edits miss some.", "Small steps make a mistake obvious and cheap to undo." ] },
      page("Variations"),
      { h: "Commit after each green step" },
      sh("a history of small, safe changes", "git commit -am \"Rename d to daysLate\"\ngit commit -am \"Introduce constants for rates and cap\"\ngit commit -am \"Extract BaseFee\"\ngit commit -am \"Inject IClock into LateFees\""),
      { h: "Undo a step that went red" },
      sh("back to the last green commit", "git restore src/Library/LateFees.cs"),
      { h: "Smells that ask for a refactoring" },
      { table: { head: ["Smell", "Refactoring"], rows: [["long method", "Extract Method"], ["unclear name", "Rename"], ["magic number", "Introduce Constant"], ["duplicated code", "Extract Method, then call it twice"], ["a long parameter list", "Introduce Parameter Object (a record)"], ["switch on a type code", "polymorphism (8.6) or a strategy (8.12)"]] } },
      page("Pitfalls"),
      { h: "Refactoring and fixing at once" },
      "\"While I'm here, the grace rule looks wrong\" — now a red test could be your refactor or your fix. Note it, finish the refactor, then fix it in its own step with its own test.",
      { h: "A big-bang rewrite" },
      "Rewriting the whole class at once leaves hours of red with no idea which change broke it. Small steps, green between each.",
      { h: "Refactoring without tests" },
      "Without tests, \"same behaviour\" is a hope. Pin the behaviour down first (10.10).",
      page("Connections"),
      { ul: [ "**Back:** 10.4 refactor is TDD's third step; B.5 Git.", "**Next:** 10.7 what clean code looks like; 10.8–10.9 where the design should go.", "**The project:** milestones 4 and 5 are refactorings under your tests." ] },
      page("Good practice"),
      { ul: [ "Green → one step → green → commit.", "Use the IDE's refactorings rather than typing the change.", "Keep a note of bugs you spot and fix them separately." ] },
      page("Practise"),
      { ul: [ "**The Lending Library, milestones 4–5:** change the design, keep every test green." ] },
      page("Quick reference"),
      sh("the loop", "tests green → one refactoring → tests green → commit\nred? git restore, smaller step"),
      { ul: [ "Structure changes; behaviour stays.", "Rename · Extract · Introduce · Inline · Change Signature.", "Never with a behaviour change in the same step." ] },
      { table: { head: ["When", "Do"], rows: [["tests go red", "undo the step"], ["no tests", "write characterisation tests first"]] } }
    ],
    flashcards: [
      ["What is refactoring?", "Changing code's structure without changing its behaviour."],
      ["What must exist before refactoring?", "Green tests covering the code."],
      ["What if a refactoring step turns tests red?", "Undo it and take a smaller step."],
      ["Rider: rename everywhere?", "Rename (Shift+F6 / ⇧F6)."],
      ["Rider: turn selected lines into a method?", "Extract Method (Ctrl+Alt+M / ⌥⌘M)."],
      ["Why never fix a bug inside a refactor step?", "A red test could then be either; do them separately."]
    ],
    quiz: [
      { q: "Replacing 0.25m with BookRate is…", opts: ["a behaviour change", "a refactoring (Introduce Constant)", "a test", "a bug fix"], ans: 1, why: "Same behaviour, clearer structure." },
      { q: "Tests go red after Extract Method. You…", opts: ["fix the tests", "undo and try a smaller step", "carry on", "delete the method"], ans: 1, why: "Back to green first." },
      { q: "Automated refactorings are safer than editing by hand because…", opts: ["they are faster to type", "they update every use correctly", "they write tests", "they skip compiling"], ans: 1, why: "The IDE knows every reference." }
    ]
  });

  /* ================================================================
     10.7 Naming and clean code
     ================================================================ */
  lesson("10.7", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Code is read far more often than it is written — by you next month, by teammates, by an examiner.",
        "`int d; decimal f;` makes every reader work out what d and f are. `int daysLate; decimal fee;` does not.",
        "**Clean code** is code whose names, sizes and shapes explain it, so comments only need to say **why**."
      ] },
      page("Core idea"),
      cs("the same rule, before and after", '// before\nif (l.K == "dvd" && d > 0 && !x) f = d * 1.00m;\n\n// after\nbool isLate = daysLate > 0;\nif (loan.Kind == "dvd" && isLate && !waived) fee = daysLate * DvdRate;'),
      cs("guard clauses: deal with the special cases first, then the main path", 'public Loan Renew(DateOnly today)\n{\n    if (Due < today) throw new InvalidOperationException("An overdue loan cannot be renewed.");\n    if (Renewals >= MaxRenewals) throw new InvalidOperationException("Two renewals is the limit.");\n\n    return this with { Due = Due.AddDays(RenewalDays), Renewals = Renewals + 1 };\n}'),
      page("Rules"),
      { ul: [
        "Names say what a thing **is** (nouns: `fee`, `LateFees`) or **does** (verbs: `Calculate`, `SendOverdue`); booleans read as questions (`isLate`, `HasGrace`).",
        "No cryptic abbreviations or single letters, except tiny scopes (`i` in a short loop, `x` in a lambda).",
        "C# casing: `PascalCase` for types, methods and properties; `camelCase` for locals and parameters; `_camelCase` or `camelCase` for private fields — whichever the project uses, consistently.",
        "Methods small and doing one thing; few parameters (three is a lot); no boolean flag parameters that switch behaviour.",
        "Named constants instead of **magic numbers**.",
        "Comments explain **why** (a rule's source, a trade-off), never restate **what** the code says.",
        "Zero compiler warnings: each one is a possible bug the compiler already found."
      ] },
      page("Variations"),
      { h: "A flag parameter split in two" },
      cs("Calculate(loan, true) says nothing at the call", '// before\npublic decimal Calculate(Loan loan, bool ignoreDamage) { … }\nfees.Calculate(loan, true);\n\n// after\npublic decimal Calculate(Loan loan) { … }\npublic decimal LateFeeOnly(Loan loan) { … }'),
      { h: "A comment that earns its place" },
      cs("why, not what", '// The library board set two days\' grace for books in 2019 (minutes, item 4);\n// DVDs have none because they are hired for a week, not lent.\nconst int BookGraceDays = 2;'),
      { h: "Rider helps" },
      sh("inspections and clean-up", "Alt+Enter / ⌥↩   quick fix for the highlighted issue\nCode → Reformat and Cleanup   formatting and style in one go\nSolution-wide analysis   every warning in the solution"),
      page("Pitfalls"),
      { h: "Comments that lie" },
      cs("the comment and the code disagree — which is right?", '// 50p a day\nf = (d - 2) * 0.25m;'),
      { h: "Names that mislead" },
      "`loanList` that is a dictionary, `GetFee` that also sends an email, `isValid` that returns the error text. A wrong name is worse than a vague one.",
      { h: "Ignoring warnings" },
      "A warning ignored becomes fifty, and the one that mattered (a possible null, an unused result) is lost among them. Keep the count at zero.",
      page("Connections"),
      { ul: [ "**Back:** 1.3 naming; 7.x small classes; 10.6 Rename and Extract Method.", "**Next:** 10.8 one reason to change, for classes.", "**The project:** milestone 6 — no warnings." ] },
      page("Good practice"),
      { ul: [ "Rename the moment a better name occurs to you.", "If a block needs a comment to explain what it does, extract it into a well-named method instead.", "Treat warnings as errors in your own code." ] },
      page("Practise"),
      { ul: [ "**The Lending Library, milestone 6:** a build with no warnings, committed." ] },
      page("Quick reference"),
      cs("names and constants", 'const int BookGraceDays = 2;\nbool isLate = daysLate > 0;\ndecimal fee = BaseFee(loan, daysLate);'),
      { ul: [ "Nouns for things, verbs for actions, questions for booleans.", "Small methods; no flag parameters; no magic numbers.", "Comments say why; warnings at zero." ] },
      { table: { head: ["Smell", "Fix"], rows: [["d, f, x2", "Rename"], ["0.25m in a formula", "Introduce Constant"], ["// what the next line does", "Extract Method with that name"]] } }
    ],
    flashcards: [
      ["How should a boolean be named?", "As a question: isLate, hasGrace, canRenew."],
      ["What is a magic number?", "A literal with an unexplained meaning; name it as a constant."],
      ["What should a comment explain?", "Why — not what the code already says."],
      ["What is a guard clause?", "An early return or throw for a special case, before the main path."],
      ["Why avoid boolean flag parameters?", "The call site (Calculate(loan, true)) does not say what true means; split the method."],
      ["Why keep compiler warnings at zero?", "Each is a possible bug; among many, the important one is missed."]
    ],
    quiz: [
      { q: "The best name for an int holding how many days a loan is overdue:", opts: ["d", "x", "daysLate", "Days_late_int"], ans: 2, why: "Says what it is, in camelCase." },
      { q: "`// add one to i` above `i++;` is…", opts: ["a good comment", "noise that restates the code", "required", "a warning"], ans: 1, why: "Comment why, not what." },
      { q: "Guard clauses make a method…", opts: ["slower", "flatter: special cases leave early", "longer", "static"], ans: 1, why: "The main path is no longer nested in ifs." }
    ]
  });

  /* ================================================================
     10.8 SOLID: single responsibility and open/closed
     ================================================================ */
  lesson("10.8", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A class that calculates fees, formats letters, sends email and writes to a database changes whenever any of those changes — and every change risks the others.",
        "**SOLID** is five design principles for classes that stay easy to change. This lesson: the first two.",
        "**S**ingle responsibility: a class has one reason to change. **O**pen/closed: add new behaviour by adding code, not by editing what already works."
      ] },
      page("Core idea"),
      cs("one class, three reasons to change", 'public class Reminders\n{\n    public int SendOverdue(IEnumerable<(string Email, Loan Loan)> loans, DateOnly today)\n    {\n        var smtp = new SmtpSender();                                  // how to send\n        int sent = 0;\n        foreach (var x in loans)\n            if (x.Loan.Due < today)                                    // who is overdue\n            {\n                smtp.Send(x.Email, $"\\"{x.Loan.Title}\\" was due on {x.Loan.Due:yyyy-MM-dd}.");  // the wording\n                sent++;\n            }\n        return sent;\n    }\n}'),
      cs("split by reason: each part changes for one reason", 'public class Reminders(INotifier notifier, IReminderText text)\n{\n    public int SendOverdue(IEnumerable<(string Email, Loan Loan)> loans, DateOnly today)\n    {\n        var overdue = loans.Where(x => x.Loan.Due < today).ToList();\n        foreach (var (email, loan) in overdue) notifier.Send(email, text.For(loan));\n        return overdue.Count;\n    }\n}'),
      page("Rules"),
      { ul: [
        "**SRP**: gather together what changes for the same reason; separate what changes for different reasons (the wording, the transport, the rule).",
        "Signs of too many responsibilities: \"and\" in the class's description, a long list of fields, unrelated methods, many reasons in its Git history.",
        "**OCP**: a module is open for extension, closed for modification. When a new kind arrives (an e-book, an SMS), you add a class; existing, tested code is untouched.",
        "The usual tools: an interface with one class per variant (8.6, 8.12), or a dictionary of strategies.",
        "Apply them where change actually happens; do not build extension points nobody needs."
      ] },
      page("Variations"),
      { h: "Open for a new kind of item" },
      cs("each kind is a class; a new kind is a new class", 'public interface IFeeRule { decimal Fee(int daysLate); }\npublic sealed class BookRule : IFeeRule { public decimal Fee(int d) => d <= 2 ? 0 : (d - 2) * 0.25m; }\npublic sealed class DvdRule : IFeeRule { public decimal Fee(int d) => d * 1.00m; }\npublic sealed class EbookRule : IFeeRule { public decimal Fee(int d) => 0; }   // added, nothing edited\n\nvar rules = new Dictionary<string, IFeeRule> { ["book"] = new BookRule(), ["dvd"] = new DvdRule(), ["ebook"] = new EbookRule() };'),
      { h: "Closed: the switch that grows" },
      cs("every new kind edits this method — and every other switch like it", 'decimal f = loan.Kind switch\n{\n    "dvd" => d * 1.00m,\n    "book" => (d - 2) * 0.25m,\n    "magazine" => d * 0.10m,   // edited in\n    _ => 0\n};'),
      { h: "SRP in the Git log" },
      sh("one file, unrelated reasons", "git log --oneline -- src/Library/Reminders.cs\n\n9f2c1aa New wording for reminder emails\n4b7e0d3 Switch mail server to port 587\nc81e5f2 Overdue means past due, not on due date"),
      page("Pitfalls"),
      { h: "The god class" },
      "`LibraryManager` with forty methods — loans, fines, members, emails, reports — is the opposite of SRP. Split by what changes together.",
      { h: "Splitting too far" },
      "A class per line of code is not SRP; it is noise. One reason to change, not one method per class.",
      { h: "Extension points for imagined needs" },
      "An interface with one implementation \"in case\" adds a layer to read and nothing to gain. Introduce the abstraction when the second variant arrives.",
      page("Connections"),
      { ul: [ "**Back:** 8.6 polymorphism and 8.12 strategies are how OCP is done.", "**Next:** 10.9 the other three principles.", "**The project:** milestone 5 takes sending out of Reminders." ] },
      page("Good practice"),
      { ul: [ "Describe each class in one sentence without \"and\".", "When the same switch appears twice, reach for polymorphism.", "Refactor towards SOLID under tests, a step at a time." ] },
      page("Practise"),
      { ul: [ "**The Lending Library, milestone 5:** Reminders gets one responsibility fewer." ] },
      page("Quick reference"),
      cs("one reason; extend by adding", 'interface IFeeRule { decimal Fee(int daysLate); }\nclass DvdRule : IFeeRule { public decimal Fee(int d) => d * 1.00m; }'),
      { ul: [ "S: one reason to change.", "O: add classes, do not edit working ones.", "Only where change really happens." ] },
      { table: { head: ["Smell", "Principle"], rows: [["\"and\" in the description", "SRP"], ["a switch on kind edited for each new kind", "OCP"]] } }
    ],
    flashcards: [
      ["What does the S in SOLID say?", "Single responsibility: a class has one reason to change."],
      ["What does the O say?", "Open/closed: extend behaviour by adding code, not modifying working code."],
      ["A sign a class has too many responsibilities?", "Its one-sentence description needs \"and\"; unrelated changes in its history."],
      ["How is OCP usually achieved?", "An interface with one class per variant (polymorphism, strategies)."],
      ["What is a god class?", "One class that does everything — the opposite of SRP."],
      ["When should you add an abstraction?", "When a real second variant arrives, not in case."]
    ],
    quiz: [
      { q: "Reminders chooses who is overdue, words the message and sends email. SRP suggests…", opts: ["leave it", "separating sending (and wording) from choosing", "merging it into LateFees", "making it static"], ans: 1, why: "Three reasons to change." },
      { q: "Adding e-books by writing an EbookRule class, editing nothing else, follows…", opts: ["SRP", "OCP", "LSP", "DIP"], ans: 1, why: "Open for extension, closed for modification." },
      { q: "An interface with exactly one implementation, added for a future that never came…", opts: ["is required by SOLID", "adds indirection for no gain", "speeds the code", "is OCP"], ans: 1, why: "Abstract when the variation is real." }
    ]
  });

  /* ================================================================
     10.9 SOLID: the rest
     ================================================================ */
  lesson("10.9", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Inheritance and interfaces (unit 8) can make code flexible — or brittle, if a subclass breaks its parent's promises, interfaces grow huge, or high-level code is welded to low-level details.",
        "**L**iskov substitution: a subtype must work wherever its base type is expected. **I**nterface segregation: small interfaces, so no class implements what it cannot do. **D**ependency inversion: high-level code depends on abstractions, and the details implement them.",
        "Together with S and O, they keep a design easy to test and to change."
      ] },
      page("Core idea"),
      cs("D: Reminders depends on INotifier; SmtpSender is a detail that implements it", 'public interface INotifier { void Send(string to, string text); }\n\npublic class SmtpSender : INotifier { public void Send(string to, string text) { /* SMTP */ } }\npublic class SmsSender : INotifier { public void Send(string to, string text) { /* SMS */ } }\n\npublic class Reminders\n{\n    private readonly INotifier notifier;\n    public Reminders(INotifier notifier) => this.notifier = notifier;\n    …\n}'),
      cs("L: a subclass that breaks its parent's promise", 'public class Rectangle { public virtual int W { get; set; } public virtual int H { get; set; } public int Area => W * H; }\npublic class Square : Rectangle\n{\n    public override int W { get => base.W; set { base.W = value; base.H = value; } }\n    public override int H { get => base.H; set { base.W = value; base.H = value; } }\n}\n// code written for Rectangle: r.W = 5; r.H = 4; expects Area 20 — a Square gives 16'),
      page("Rules"),
      { table: { head: ["Principle", "Says", "Broken when"], rows: [["L — Liskov substitution", "a subtype can stand in for its base without surprises", "an override throws NotSupportedException, ignores a setter or tightens what it accepts"], ["I — interface segregation", "clients should not depend on methods they do not use", "an IDevice with Print, Scan, Fax forces a printer to fake Fax"], ["D — dependency inversion", "high-level policy depends on abstractions; details implement them", "business code does `new SqlConnection(…)` or `new SmtpSender()`"]] } },
      { ul: [
        "LSP is about **behaviour**, not syntax: the compiler accepts a Square as a Rectangle; the caller's expectations decide.",
        "ISP: split a fat interface into role interfaces (`IPrinter`, `IScanner`); a class implements the roles it really has.",
        "DIP is what creates the seam for test doubles (10.5) and lets details change (email to SMS) without touching the policy.",
        "Dependency injection (passing the abstraction in, usually by constructor) is how DIP is wired up; a DI container (D4) automates it."
      ] },
      page("Variations"),
      { h: "I: role interfaces" },
      cs("each class implements only what it can do", 'public interface IPrinter { void Print(string doc); }\npublic interface IScanner { string Scan(); }\npublic class OfficeMachine : IPrinter, IScanner { … }\npublic class CheapPrinter : IPrinter { … }   // no fake Scan'),
      { h: "L, kept: a read-only view" },
      cs("prefer composition when the subtype cannot keep the promise", 'public record Size(int W, int H) { public int Area => W * H; }\npublic static Size Square(int side) => new(side, side);   // no subclass, no broken setter'),
      { h: "D, wired at the top" },
      cs("the program's entry point chooses the details once", 'INotifier notifier = useSms ? new SmsSender() : new SmtpSender();\nvar reminders = new Reminders(notifier);\nreminders.SendOverdue(loans, DateOnly.FromDateTime(DateTime.Today));'),
      page("Pitfalls"),
      { h: "NotSupportedException in an override" },
      cs("a subtype that cannot do what its base promises breaks LSP", 'public class ReadOnlyLoanStore : LoanStore\n{\n    public override void Save(Loan loan) => throw new NotSupportedException();\n}'),
      { h: "Depending on the concrete class anyway" },
      "A constructor that takes `SmtpSender` instead of `INotifier` has the shape of injection but not its benefit: the test still cannot pass a fake.",
      { h: "SOLID as a goal" },
      "The principles serve code that changes. A ten-line script needs none of them; apply them where the pain of change is real.",
      page("Connections"),
      { ul: [ "**Back:** 8.1–8.6 inheritance, interfaces, polymorphism; 8.12 composition; 10.5 seams.", "**Next:** 10.10 puts testing and design together on legacy code; D4 design patterns and DI containers.", "**The project:** milestone 5 is dependency inversion." ] },
      page("Good practice"),
      { ul: [ "Ask \"can every subtype honour the base's promises?\" before inheriting.", "Many small interfaces beat one big one.", "Choose the concrete details in one place, at the top; pass abstractions down." ] },
      page("Practise"),
      { ul: [ "**The Lending Library, milestone 5:** Reminders takes an INotifier." ] },
      page("Quick reference"),
      cs("L, I, D in one glance", 'interface INotifier { void Send(string to, string text); }        // I: small\nclass Reminders(INotifier n) { }                                // D: depends on it\nclass SmsSender : INotifier { public void Send(string t, string x) { } }  // L: keeps its promise'),
      { ul: [ "L: subtypes keep the base's promises.", "I: role interfaces, not fat ones.", "D: depend on abstractions; inject the details." ] },
      { table: { head: ["Smell", "Principle"], rows: [["override throws NotSupportedException", "LSP"], ["a class implements methods it cannot do", "ISP"], ["new ConcreteThing() inside business logic", "DIP"]] } }
    ],
    flashcards: [
      ["What does Liskov substitution require?", "A subtype can be used wherever its base is expected, with no surprises."],
      ["What does interface segregation say?", "Clients should not depend on methods they do not use: small role interfaces."],
      ["What does dependency inversion say?", "High-level code depends on abstractions; details implement them."],
      ["Why is Square : Rectangle a classic LSP problem?", "Setting W then H on a Square does not give W × H, breaking Rectangle's promise."],
      ["How is DIP usually wired?", "Constructor injection of an interface, with the concrete choice made at the top."],
      ["What do the five SOLID letters stand for?", "Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion."]
    ],
    quiz: [
      { q: "An override that throws NotSupportedException usually breaks…", opts: ["SRP", "OCP", "LSP", "ISP"], ans: 2, why: "The subtype cannot stand in for its base." },
      { q: "A printer class forced to implement Fax() points to a violation of…", opts: ["ISP", "DIP", "OCP", "LSP"], ans: 0, why: "The interface is too fat." },
      { q: "Reminders(INotifier n) instead of new SmtpSender() inside applies…", opts: ["SRP", "DIP", "LSP", "none"], ans: 1, why: "It depends on the abstraction; the detail is injected." }
    ]
  });

  /* ================================================================
     10.10 Practise: test a legacy module
     ================================================================ */
  lesson("10.10", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "**Legacy code** is code without tests: it works, people rely on it, and nobody knows exactly what it does. Changing it is a gamble.",
        "The way in: first pin down what it does **now** with **characterisation tests** — even the odd bits — then make the changes the tests protect.",
        "This is the whole unit in one workflow, and it is what *The Lending Library* asks for."
      ] },
      page("Core idea"),
      sh("the workflow", "1. read the code; list what it seems to do\n2. write a test for each thing, with the value the code gives NOW\n3. check the tests are sharp: break the code on purpose, see them fail\n4. find a seam (the clock, the email) and inject it\n5. refactor in small steps, tests green after each\n6. only then change behaviour — test first"),
      cs("a characterisation test: the current answer, even if it looks wrong", '[Fact]\npublic void A_damaged_book_inside_its_grace_days_is_still_free()\n{\n    // Found while pinning the code down. Odd, but it is what the library charges today.\n    var fees = new LateFees(new FixedClock(Today));\n    Assert.Equal(0m, fees.Calculate(new Loan("Emma", "book", Today.AddDays(-1), Damaged: true)));\n}'),
      page("Rules"),
      { ul: [
        "Characterisation tests record behaviour, not intent: if the code gives 0, the test expects 0. A behaviour you think is a bug becomes a separate, later change — with the people who own the rule.",
        "**Mutation testing** checks the tests themselves: plant a small bug (change `0.25m` to `0.20m`, `<=` to `<`), run the tests, and see them fail. A planted bug the tests miss marks a gap. (The validator does exactly this for milestone 2.)",
        "Cover every branch: each `if`, each side of each comparison, each boundary.",
        "Break dependencies at **seams**: an interface for the clock, the email, the disk.",
        "Keep each change small, tested and committed."
      ] },
      { table: { head: ["Planted bug", "Catches it"], rows: [["grace 2 → 1 day", "a book exactly 2 days late"], ["25p → 20p", "any book past its grace"], ["£1 → £1.50 a day", "any late DVD"], ["cap £10 → £12", "a fee past the cap"], ["damage £5 → £2.50", "a damaged, late item"]] } },
      page("Variations"),
      { h: "Finding the cases from the code" },
      sh("one test per path through Calculate", "d <= 0               → not late: 0\ndvd                  → d × 1.00\nbook, d <= 2         → grace: 0\nbook, d > 2          → (d − 2) × 0.25\nf > 10               → capped at 10\ndamaged              → + 5 (only once late and past grace)"),
      { h: "Running the validator" },
      sh("milestone 2 plants the bugs in a throw-away copy", "dotnet run .kurenai/validate.cs\n\n✓ tests · 14 passed, 0 failed\n✓ m1 · Your first tests\n✓ m2 · Tests that catch bugs   (your tests caught 5 of 5 planted bugs)"),
      { h: "Commit the safety net before the refactor" },
      sh("the tests are a checkpoint of their own", "git add tests/Library.Tests\ngit commit -m \"Characterisation tests for LateFees\""),
      page("Pitfalls"),
      { h: "Fixing while pinning" },
      "Writing the test to expect what the rule \"should\" be makes it red, and now you are changing behaviour without knowing who relies on it. Pin what it does; change later, on purpose.",
      { h: "Deleting a test that fails" },
      "A red test after a refactor is the safety net working. Undo the step; never delete the test to get green.",
      { h: "Tests that only cover the happy path" },
      "Five tests of books three to eight days late catch none of the planted bugs at the boundaries, the cap or damage. Aim for each path and each edge.",
      page("Connections"),
      { ul: [ "**Back:** 10.1–10.9, all of them.", "**Next:** capstone 4 builds a small service with tests from the start; D5 goes further (property-based and mutation testing tools).", "**The project:** every milestone of *The Lending Library*." ] },
      page("Good practice"),
      { ul: [ "Pin first, change second.", "Check your tests by breaking the code.", "Small steps, each tested and committed." ] },
      page("Practise"),
      { ul: [ "**The Lending Library:** all six milestones." ] },
      page("Quick reference"),
      sh("legacy in six steps", "read → characterise → check the tests (plant bugs) → seam → refactor → change behaviour, test-first"),
      { ul: [ "Characterisation tests record what is, not what should be.", "Planted bugs measure your tests.", "Seams, then small refactors." ] },
      { table: { head: ["Smell", "Do"], rows: [["no tests", "characterise first"], ["a test fails after a refactor", "undo the step"]] } }
    ],
    flashcards: [
      ["What is legacy code (in this sense)?", "Code without tests."],
      ["What is a characterisation test?", "A test that records what the code does now, odd parts included."],
      ["What is mutation testing?", "Planting small bugs and checking the tests catch them."],
      ["A planted bug survives. What does that tell you?", "A gap in the tests: no test exercises that behaviour or boundary."],
      ["Order of work on legacy code?", "Characterise, check the tests, find seams, refactor in small steps, then change behaviour test-first."],
      ["A test goes red after a refactor. Delete it?", "No — undo the step; the test is doing its job."]
    ],
    quiz: [
      { q: "Pinning down legacy code, the code gives 0 where you expected 0.25. The test should expect…", opts: ["0.25", "0 (what it does now)", "nothing", "an exception"], ans: 1, why: "Characterise first; change later, on purpose." },
      { q: "Changing `<= 2` to `<= 1` and the tests still pass means…", opts: ["the change is fine", "no test checks the last grace day", "the tests are too strict", "mutation testing is broken"], ans: 1, why: "A boundary is untested." },
      { q: "Before refactoring LateFees to take an IClock you should have…", opts: ["deleted the old tests", "green tests covering Calculate", "rewritten Reminders", "nothing"], ans: 1, why: "The tests are what make the refactor safe." }
    ]
  });

  /* ================================================================
     retrieval: COMMAND cards — typed, checked against the forms the
     answer may take, never self-marked; labels never give it away
     ================================================================ */
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };
  var short = function (s) { s = String(s).replace(/^(Type the command that will |Name the |Which )/, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };
  K.add({ cards: {
    "u10-cli": { title: "Testing from the terminal", lesson: "10.2", concepts: ["xunit"], kind: "command",
      vary: function (r) {
        var n = pick(r, ["Shop", "Library", "Grades", "Bank"]), w = pick(r, ["Renew", "Fee", "Overdue", "Total"]);
        var q = pick(r, [
          ["run every test in the solution in this folder", "dotnet test", ["^dotnet test( \\S+\\.slnx?)?$"]],
          ["run only the tests whose names contain " + w, "dotnet test --filter " + w, ["^dotnet test --filter \"?((FullyQualifiedName|Name|DisplayName)~)?" + w + "\"?$"]],
          ["create an xUnit test project in tests/" + n + ".Tests", "dotnet new xunit -o tests/" + n + ".Tests", ["^dotnet new xunit (-o|--output) (\\./)?tests/" + esc(n) + "\\.Tests/?( (-n|--name) " + esc(n) + "\\.Tests)?$"]],
          ["let tests/" + n + ".Tests use the project src/" + n, "dotnet add tests/" + n + ".Tests reference src/" + n, ["^dotnet add (\\./)?tests/" + esc(n) + "\\.Tests(/" + esc(n) + "\\.Tests\\.csproj)? reference (\\./)?src/" + esc(n) + "(/" + esc(n) + "\\.csproj)?$"]]
        ]);
        return { prompt: "Type the command that will " + q[0] + ".", label: short(q[0]).replace(/xUnit /, ""), params: [n, w], answer: q[1], accept: q[2], hint: "dotnet test · dotnet new xunit · dotnet add … reference." };
      } },
    "u10-xunit": { title: "xUnit's attributes and asserts", lesson: "10.3", concepts: ["xunit", "aaa"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Which attribute marks a test with no parameters?", "[Fact]", ["^\\[?Fact\\]?$"]],
          ["Which attribute marks a test run once per row of data?", "[Theory]", ["^\\[?Theory\\]?$"]],
          ["Which attribute supplies one row of constant data?", "[InlineData]", ["^\\[?InlineData(\\(.*\\))?\\]?$"]],
          ["Which Assert method checks that code throws an exception of type T?", "Assert.Throws", ["^(Assert\\.)?Throws(<T>)?$"]],
          ["Which Assert method checks a collection has exactly one item?", "Assert.Single", ["^(Assert\\.)?Single$"]],
          ["Which Assert method checks two values are equal?", "Assert.Equal", ["^(Assert\\.)?Equal$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], ci: true, hint: "[Fact] · [Theory] · [InlineData] · Assert.Equal / Throws / Single." };
      } },
    "u10-tdd": { title: "Red, green, refactor", lesson: "10.4", concepts: ["tdd"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["You have written a new test and watched it fail. Name the TDD step you just finished.", "red", ["^red$"]],
          ["You wrote the simplest code that makes every test pass. Name the step.", "green", ["^green$"]],
          ["You are improving names and structure while every test stays green. Name the step.", "refactor", ["^refactor(ing)?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], ci: true, hint: "Red → green → refactor." };
      } },
    "u10-doubles": { title: "Name the double", lesson: "10.5", concepts: ["test-doubles"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["A clock that always returns 10 March. Name the kind of test double.", "stub", ["^stub$"]],
          ["A notifier that keeps a list of every message it was asked to send, for the test to check. Name the kind of test double.", "spy", ["^spy$"]],
          ["An in-memory list standing in for a real database, with working add and find. Name the kind of test double.", "fake", ["^fake$"]],
          ["An object passed only to fill a parameter, never used. Name the kind of test double.", "dummy", ["^dummy$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(/\. Name the kind of test double$/, ""), params: [], answer: q[1], accept: q[2], ci: true, hint: "dummy · stub · fake · spy · mock." };
      } },
    "u10-rider": { title: "Rider's refactorings", lesson: "10.6", concepts: ["refactoring"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Which refactoring changes a name everywhere it is used?", "Rename", ["^rename$"]],
          ["Which refactoring turns selected lines into a new method?", "Extract Method", ["^extract method$"]],
          ["Which refactoring replaces a magic number with a named constant?", "Introduce Constant", ["^introduce (a )?constant$"]],
          ["Which refactoring adds, removes or reorders a method's parameters at every call?", "Change Signature", ["^change signature$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], ci: true, hint: "Rename · Extract Method · Introduce Constant · Change Signature." };
      } },
    "u10-solid": { title: "Name the principle", lesson: "10.9", concepts: ["solid-so", "solid-lid"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["A class should have one reason to change. Name the SOLID principle.", "single responsibility", ["^(single[ -]responsibility|srp|s)( principle)?$"]],
          ["Add new behaviour by adding code, not by editing code that works. Name the SOLID principle.", "open/closed", ["^(open[/ -]closed|ocp|o)( principle)?$"]],
          ["A subtype must work wherever its base type is expected. Name the SOLID principle.", "Liskov substitution", ["^(liskov( substitution)?|lsp|l)( principle)?$"]],
          ["Clients should not depend on methods they do not use. Name the SOLID principle.", "interface segregation", ["^(interface segregation|isp|i)( principle)?$"]],
          ["High-level code depends on abstractions, not details. Name the SOLID principle.", "dependency inversion", ["^(dependency inversion|dip|d)( principle)?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(/\. Name the SOLID principle$/, ""), params: [], answer: q[1], accept: q[2], ci: true, hint: "Single responsibility · open/closed · Liskov · interface segregation · dependency inversion." };
      } }
  } });

  /* ================================================================
     the unit 10 project: The Lending Library; its files are generated
     into code-projects-files.js from tools/code-projects/library-legacy/
     ================================================================ */
  var MUTANTS = [
    { id: "grace", find: "d <= 2", replace: "d <= 1" },
    { id: "book-rate", find: "0.25m", replace: "0.20m" },
    { id: "dvd-rate", find: "d * 1.00m", replace: "d * 1.50m" },
    { id: "cap", find: "f = 10m;", replace: "f = 12m;" },
    { id: "damage", find: "f += 5m", replace: "f += 2.5m" }
  ];
  K.project("rp-u10-library", {
    unit: "U10", title: "The Lending Library", folder: "library-legacy", solution: "LendingLibrary.sln",
    scaffoldVersion: 1, minValidator: "1.1.0", sdk: ".NET 10 SDK",
    summary: "A small legacy module with no tests: pin it down with your own, prove they catch bugs, then change its design under their protection.",
    brief: [
      "A lending library's late-fee code, written in a hurry and never tested: `src/Library` (yours to change), `tests/Library.Tests` (your tests — it starts with one example) and Kurenai's acceptance tests for milestones 3–5 (`tests/Library.Acceptance`).",
      { ul: [
        "The rules live only in the code: a book has two days' grace and then costs 25p a day, a DVD £1 a day, the fee stops at £10, and damage adds £5 to a late fee.",
        "`Directory.Build.props`, `tests/Library.Acceptance/` and `.kurenai/validate.cs` are **protected**: change them and a report counts as practice only.",
        "Milestone 2 plants five small bugs in a throw-away copy of `LateFees.cs` and runs YOUR tests against each — do it before you refactor that file.",
        "Nullable reference types are on, as in the lessons since unit 7."
      ] }
    ],
    milestones: [
      { id: "m1", title: "Your first tests", lessons: ["10.1", "10.2"], about: "In tests/Library.Tests, write at least five passing tests of LateFees, at least one a [Theory].", checks: [{ type: "owntests", prefix: "Library.Tests.", min: 5 }, { type: "source", path: "tests/Library.Tests", contains: ["\\[Theory\\]"] }] },
      { id: "m2", title: "Tests that catch bugs", lessons: ["10.3", "10.10"], about: "Your tests must catch at least four of five bugs planted, one at a time, in LateFees.cs.", checks: [{ type: "mutants", file: "src/Library/LateFees.cs", tests: "tests/Library.Tests/Library.Tests.csproj", min: 4, mutants: MUTANTS }] },
      { id: "m3", title: "Test-first: renewals", lessons: ["10.4"], about: "Write tests for Loan.Renew first, then make them and Kurenai's Milestone3 pass: +14 days, at most two renewals, never once overdue.", checks: [{ type: "tests", class: "Milestone3" }, { type: "source", path: "tests/Library.Tests", contains: ["Renew\\("] }] },
      { id: "m4", title: "A clock you control", lessons: ["10.5"], about: "Give LateFees a constructor that takes an IClock and use it instead of DateTime.Today; your tests use a fixed clock.", checks: [{ type: "tests", class: "Milestone4" }, { type: "source", path: "src/Library/LateFees.cs", forbids: ["DateTime\\.(Today|Now)"] }, { type: "owntests", prefix: "Library.Tests.", min: 5 }] },
      { id: "m5", title: "Depend on an abstraction", lessons: ["10.6", "10.8", "10.9"], about: "Reminders takes an INotifier and no longer mentions SmtpSender; your tests stay green.", checks: [{ type: "tests", class: "Milestone5" }, { type: "source", path: "src/Library/Reminders.cs", forbids: ["SmtpSender"] }, { type: "owntests", prefix: "Library.Tests.", min: 5 }] },
      { id: "m6", title: "Clean and committed", lessons: ["10.7", "10.10"], about: "A build with no warnings, and your work committed with Git and a clean working tree.", checks: [{ type: "warnings", max: 0 }, { type: "git" }] }
    ],
    protected: ["Directory.Build.props", "tests/Library.Acceptance/Library.Acceptance.csproj", "tests/Library.Acceptance/Milestone3.cs", "tests/Library.Acceptance/Milestone4.cs", "tests/Library.Acceptance/Milestone5.cs", ".kurenai/validate.cs"],
    reward: { xp: 150, gold: 40, hp: 8 }
  });
})();
