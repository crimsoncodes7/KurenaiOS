/* Kurenai OS — data/content/code-t1c.js
   Code · T1 · Part C · Entity Framework Core (docs/code-plan.md §3.3), done
   in Rider.

   Entities and DbContext (T1.12), LINQ that becomes SQL (T1.13),
   migrations (T1.14), relationships and loading (T1.15), change tracking
   (T1.16), and N+1 (T1.17). The lessons hold the Rider form of the notes
   contract (smoke75); their retrieval cards are COMMAND cards. The SQL shown
   in the notes is what EF Core 10 generates for SQLite (printed with
   ToQueryString). Their work is the part's project, "The Lending Library on
   EF Core" (rp-t1c-library; files generated into code-projects-files.js
   from tools/code-projects/library-efcore/), proven by the validator, its
   acceptance tests on SQLite in memory.                                     */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function sh(cap, src) { return { code: { lang: "shell", src: src, cap: cap } }; }
  function cs(cap, src) { return { code: { lang: "csharp", src: src, cap: cap } }; }
  function sql(cap, src) { return { code: { lang: "sql", src: src, cap: cap } }; }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }

  K.add({ concepts: {
    "ef-context": { name: "Entities and DbContext", lesson: "T1.12", about: "classes as tables, a DbSet per table, SaveChanges" },
    "ef-linq": { name: "LINQ to SQL", lesson: "T1.13", about: "what EF translates, and where it stops" },
    "ef-migrations": { name: "Migrations", lesson: "T1.14", about: "the model's changes as versioned steps" },
    "ef-relations": { name: "Relationships and loading", lesson: "T1.15", about: "navigations, Include, projections, delete behaviour" },
    "ef-tracking": { name: "Change tracking", lesson: "T1.16", about: "what SaveChanges writes, and AsNoTracking" },
    "ef-nplus1": { name: "N+1 and performance", lesson: "T1.17", about: "one query per row, found in the log and fixed" }
  } });

  /* ================================================================
     T1.12 Entities and DbContext
     ================================================================ */
  lesson("T1.12", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "T1B wrote every SQL statement by hand and copied each row into a record, column by column. It works, and it is a lot of the same code.",
        "An **ORM** (object–relational mapper) does that copying for you: you write classes, it makes the tables, writes the SQL and fills the objects. **Entity Framework Core** (EF Core) is .NET's.",
        "You still need T1A's SQL — to read what EF sends, and to spot when it sends something slow. EF is a power tool, not a way to avoid knowing databases."
      ] },
      page("Core idea"),
      sh("add EF Core for SQLite to a project", "dotnet add src/Library.Data package Microsoft.EntityFrameworkCore.Sqlite"),
      cs("entities: plain classes", 'public class Book\n{\n    public int Id { get; set; }            // the key: named Id, so EF knows\n    public string Title { get; set; } = "";\n    public string Author { get; set; } = "";\n    public int Year { get; set; }\n}'),
      cs("the context: one DbSet per table", 'using Microsoft.EntityFrameworkCore;\n\npublic class LibraryContext(DbContextOptions<LibraryContext> options) : DbContext(options)\n{\n    public DbSet<Book> Books => Set<Book>();\n\n    protected override void OnModelCreating(ModelBuilder model)\n    {\n        model.Entity<Book>().Property(b => b.Title).IsRequired().HasMaxLength(200);\n    }\n}'),
      cs("save and read without writing SQL", 'var options = new DbContextOptionsBuilder<LibraryContext>()\n    .UseSqlite("Data Source=library.db").Options;\nusing var db = new LibraryContext(options);\ndb.Database.EnsureCreated();          // tables from the model (migrations come in T1.14)\n\nvar dune = new Book { Title = "Dune", Author = "Frank Herbert", Year = 1965 };\ndb.Books.Add(dune);\ndb.SaveChanges();                     // INSERT … RETURNING "Id"\nConsole.WriteLine(dune.Id);           // 1: filled in from the database\n\nforeach (var b in db.Books.OrderBy(b => b.Title))\n    Console.WriteLine($"{b.Title} ({b.Year})");'),
      { ul: [
        "An **entity** is a class EF maps to a table: each property a column, `Id` (or `BookId`) the primary key.",
        "The **context** is one session with the database: it knows the model, sends the SQL and remembers the objects it handed out.",
        "`Add` only marks the object as new; `SaveChanges()` sends the INSERT and copies the generated key back into `Id`."
      ] },
      page("Rules"),
      { table: { head: ["You write", "EF makes"], rows: [
        ["`class Book` + `DbSet<Book> Books`", "a table `Books`"],
        ["`public int Id`", "`\"Id\" INTEGER NOT NULL … PRIMARY KEY AUTOINCREMENT`"],
        ["`string Title` (nullable reference types on)", "`\"Title\" TEXT NOT NULL`"],
        ["`string? Note` / `DateOnly? Returned`", "a column that allows NULL"],
        ["`.HasMaxLength(200)`", "a length EF validates for; SQLite stores TEXT of any length"]
      ] } },
      { ul: [
        "Configure the model in `OnModelCreating` (the **fluent API**), or with attributes such as `[MaxLength(200)]` on the property. One place per project keeps it findable.",
        "Pass the options in through the constructor, so tests can hand the same context an in-memory SQLite database.",
        "A context is short-lived: one per unit of work (a request, a command, a test). Dispose it with `using`.",
        "`EnsureCreated()` is for tests and throw-away databases only — it cannot change a database later. Real programs use migrations (T1.14)."
      ] },
      page("Variations"),
      { h: "The SQL EF wrote for the table" },
      sql("from db.Database.GenerateCreateScript()", 'CREATE TABLE "Books" (\n    "Id" INTEGER NOT NULL CONSTRAINT "PK_Books" PRIMARY KEY AUTOINCREMENT,\n    "Title" TEXT NOT NULL,\n    "Author" TEXT NOT NULL,\n    "Year" INTEGER NOT NULL\n);'),
      { h: "SQLite in memory, for tests" },
      cs("the database lives as long as the connection stays open", 'using var connection = new SqliteConnection("Data Source=:memory:");\nconnection.Open();\nvar options = new DbContextOptionsBuilder<LibraryContext>().UseSqlite(connection).Options;\nusing (var setup = new LibraryContext(options)) setup.Database.EnsureCreated();\nusing var db = new LibraryContext(options);   // a second context, the same database'),
      { h: "Find by key" },
      cs("Find looks in the context first, then the database", 'Book? b = db.Books.Find(1);   // null when there is no book 1\nBook one = db.Books.Single(b => b.Id == 1);   // throws when there is none'),
      page("Pitfalls"),
      { h: "No provider configured" },
      sh("a context built without options", "System.InvalidOperationException: No database provider has been configured for this DbContext. A provider can be configured by overriding the 'DbContext.OnConfiguring' method or by using 'AddDbContext' on the application service provider. …"),
      { ul: [ "Build the options with `UseSqlite(…)` and pass them to the constructor, which passes them to `DbContext(options)`." ] },
      { h: "The table was never made" },
      sh("SaveChanges against an empty database file", "Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while saving the entity changes. See the inner exception for details.\n ---> Microsoft.Data.Sqlite.SqliteException (0x80004005): SQLite Error 1: 'no such table: Books'."),
      { ul: [ "Call `EnsureCreated()` (tests) or `Migrate()` (the program) before the first query." ] },
      { h: "Add without SaveChanges" },
      "`db.Books.Add(b)` with no `SaveChanges()` writes nothing, and `b.Id` stays 0. Nothing fails — the book simply is not there next time.",
      page("Connections"),
      { ul: [ "**Back:** T1A's tables and keys; T1B's connection strings and `IsDBNull` — EF does that mapping now; unit 8's LINQ.", "**Next:** T1.13 reads the SQL behind each LINQ query; T1.14 replaces `EnsureCreated` with migrations.", "**The project:** milestone 1 is exactly this: configure `Title`, then `AddBook`, `AddMember` and `Shelf`." ] },
      page("Good practice"),
      { ul: [ "Keep entities plain: properties, no database code inside them.", "Configure the model in one place, and keep the context's options coming in through its constructor.", "Validate before `Add` (a blank title is refused) — the database's NOT NULL is the last line of defence, not the first." ] },
      page("Practise"),
      { ul: [ "**The Lending Library on EF Core, milestone 1:** configure `Book.Title`; write `AddBook`, `AddMember` and `Shelf`." ] },
      page("Quick reference"),
      cs("the shape", 'public class LibraryContext(DbContextOptions<LibraryContext> o) : DbContext(o)\n{ public DbSet<Book> Books => Set<Book>(); }\n\ndb.Books.Add(book); db.SaveChanges();\nvar list = db.Books.OrderBy(b => b.Title).ToList();'),
      { ul: [ "`dotnet add package Microsoft.EntityFrameworkCore.Sqlite`.", "An entity per table, `Id` the key, a `DbSet<T>` per table.", "`Add` marks, `SaveChanges` writes; one short-lived context per unit of work." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["No database provider has been configured", "the context has no options", "Pitfalls"], ["no such table: Books", "EnsureCreated or Migrate never ran", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What is an ORM?", "A library that maps classes to tables, writes the SQL and fills objects from rows."],
      ["Which property does EF use as the key by convention?", "Id (or <Class>Id)."],
      ["What does db.Books.Add(book) do on its own?", "Marks the book as new; nothing is written until SaveChanges."],
      ["Where does a new book's Id come from?", "SaveChanges copies the database's generated key back into the object."],
      ["Where is the model configured with the fluent API?", "OnModelCreating(ModelBuilder)."],
      ["How long should a DbContext live?", "One unit of work — a command, a request or a test — then dispose it."],
      ["How do tests get a real database without a file?", "SQLite in memory: \"Data Source=:memory:\" on a connection kept open."]
    ],
    quiz: [
      { q: "After `db.Books.Add(b);` and before `SaveChanges()`, `b.Id` is…", opts: ["the next free id", "0", "null", "-1"], ans: 1, why: "Nothing has been written yet; the key arrives with SaveChanges." },
      { q: "`string Title` with nullable reference types on becomes…", opts: ["TEXT NULL", "TEXT NOT NULL", "VARCHAR(255)", "no column"], ans: 1, why: "A non-nullable reference type is a required column." },
      { q: "`EnsureCreated()` is right for…", opts: ["a production database that will change", "tests and throw-away databases", "adding a column later", "nothing — it is obsolete"], ans: 1, why: "It creates the schema once and never changes it; migrations do that." }
    ]
  });

  /* ================================================================
     T1.13 LINQ to SQL: what gets translated
     ================================================================ */
  lesson("T1.13", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Unit 8's LINQ ran over lists in memory. On a `DbSet` the same `Where` and `OrderBy` do not run in C# at all: EF **translates** them into one SQL statement and the database does the work.",
        "That is fast — until a query asks for something SQL cannot do, or you accidentally pull every row back first and filter in C#.",
        "So you need to know which side of the line each part of a query runs on, and how to see the SQL."
      ] },
      page("Core idea"),
      cs("a query is built, then run", 'IQueryable<Book> query = db.Books\n    .Where(b => b.Author == author)\n    .OrderBy(b => b.Year);           // nothing sent yet: still a description\n\nConsole.WriteLine(query.ToQueryString());   // the SQL it will send\nList<Book> books = query.ToList();          // now it runs, once'),
      sql("what ToQueryString printed", 'SELECT "b"."Id", "b"."Author", "b"."Title", "b"."Year"\nFROM "Books" AS "b"\nWHERE "b"."Author" = @author\nORDER BY "b"."Year"'),
      { ul: [
        "On a `DbSet`, LINQ builds an `IQueryable`: an expression EF turns into SQL. It runs when you ask for results — `ToList()`, `First()`, `Count()`, `Any()`, or a `foreach`.",
        "The variable `author` became the parameter `@author` — EF parameterises for you, so T1.10's injection cannot happen here.",
        "`ToQueryString()` shows the SQL without running it; logging (T1.17) shows every statement as it is sent."
      ] },
      page("Rules"),
      { table: { head: ["LINQ", "SQL (SQLite)"], rows: [
        ["`Where(b => b.Year < 1900)`", "`WHERE \"b\".\"Year\" < 1900`"],
        ["`OrderBy` / `ThenByDescending`", "`ORDER BY … , … DESC`"],
        ["`Skip(10).Take(5)`", "`LIMIT @p1 OFFSET @p`"],
        ["`Count()` / `Any()` / `Sum(…)`", "`COUNT(*)` / `EXISTS` / `SUM(…)`"],
        ["`GroupBy(b => b.Author).Select(g => new { g.Key, N = g.Count() })`", "`GROUP BY \"b\".\"Author\"`"],
        ["`b.Title.Contains(text)`", "`instr(\"b\".\"Title\", @text) > 0` (case matters)"],
        ["`EF.Functions.Like(b.Title, \"%\" + text + \"%\")`", "`\"b\".\"Title\" LIKE @p` (ignores ASCII case)"]
      ] } },
      { ul: [
        "Filter, sort, count and group **before** `ToList()`. After it, you are in C# with every row already fetched.",
        "Your own C# methods cannot be translated inside a `Where`: EF refuses rather than guess (see Pitfalls).",
        "The final `Select` is allowed to call C# — EF runs the SQL, then your code on the few rows it returned.",
        "Ignoring case is the database's business: SQLite's `LIKE` ignores ASCII case, `instr` and `=` do not."
      ] },
      page("Variations"),
      { h: "Grouping in SQL" },
      cs("books per author, biggest first", 'var rows = db.Books\n    .GroupBy(b => b.Author)\n    .Select(g => new { Author = g.Key, Books = g.Count() })\n    .OrderByDescending(r => r.Books).ThenBy(r => r.Author)\n    .ToList();'),
      sql("one statement", 'SELECT "b"."Author" AS "Key", COUNT(*) AS "N"\nFROM "Books" AS "b"\nGROUP BY "b"."Author"\nORDER BY COUNT(*) DESC'),
      { h: "C# at the end, on purpose" },
      cs("the SQL filters; C# formats the few rows left", 'var labels = db.Books\n    .Where(b => b.Year < 1900)\n    .Select(b => new { b.Title, b.Year })\n    .ToList()                                          // SQL ends here\n    .Select(b => $"{b.Title} — {Century(b.Year)}")      // C# from here\n    .ToList();'),
      { h: "A count is a count" },
      cs("one COUNT(*), not a list of rows", 'int onLoan = db.Loans.Count(l => l.Returned == null);   // SELECT COUNT(*) … WHERE "Returned" IS NULL'),
      page("Pitfalls"),
      { h: "A method SQL has never heard of" },
      sh("a Where that calls your own C#", "System.InvalidOperationException: The LINQ expression 'DbSet<Book>()\n    .Where(b => Shorten(b.Title) == \"Dune\")' could not be translated. Either rewrite the query in a form that can be translated, or switch to client evaluation explicitly by inserting a call to 'AsEnumerable', 'AsAsyncEnumerable', 'ToList', or 'ToListAsync'."),
      { ul: [ "Rewrite with what SQL has (`StartsWith`, `Contains`, `EF.Functions.Like`), or filter in C# only after SQL has cut the rows down." ] },
      { h: "ToList too early" },
      cs("every book comes back, then C# filters", 'var old = db.Books.ToList().Where(b => b.Year < 1900).ToList();   // SELECT * FROM Books — all of them'),
      { ul: [ "It gives the right answer and fetches the whole table to do it. Move the `Where` before the `ToList()`." ] },
      { h: "Contains that cares about case" },
      "`b.Title.Contains(\"dune\")` becomes `instr(…) > 0`, which does not find \"Dune\". Use `EF.Functions.Like(b.Title, \"%dune%\")` or compare `ToLower()` on both sides.",
      page("Connections"),
      { ul: [ "**Back:** unit 8's LINQ (`Where`, `Select`, `GroupBy`) and deferred execution; T1A.4's GROUP BY; T1.10's parameters.", "**Next:** T1.15's `Include` and projections across relationships; T1.17 counts the statements a page sends.", "**The project:** milestone 2's tests read the SQL your queries send." ] },
      page("Good practice"),
      { ul: [ "Print `ToQueryString()` while you write a query; read the WHERE, ORDER BY and GROUP BY.", "Ask for what you need: `Count()` not `ToList().Count`, `Any()` not `Count() > 0`.", "Select only the columns a screen shows — a projection is cheaper than whole entities." ] },
      page("Practise"),
      { ul: [ "**The Lending Library on EF Core, milestone 2:** `ByAuthor`, `Search`, `CountOnLoan` and `BooksPerAuthor`, all done in SQL." ] },
      page("Quick reference"),
      cs("see it, then run it", 'var q = db.Books.Where(b => b.Year < 1900).OrderBy(b => b.Title);\nConsole.WriteLine(q.ToQueryString());\nvar list = q.ToList();'),
      { ul: [ "A `DbSet` query is SQL until `ToList`/`First`/`Count`/`foreach`.", "Filter, sort, count and group before `ToList`; format after.", "`EF.Functions.Like` for a search that ignores case on SQLite." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["The LINQ expression … could not be translated", "a C# method inside the SQL part", "Pitfalls"]] } }
    ],
    flashcards: [
      ["When does a LINQ query on a DbSet run?", "When results are asked for: ToList, First, Count, Any or a foreach."],
      ["How do you see the SQL a query will send?", "query.ToQueryString()"],
      ["What happens to a C# variable used in a Where?", "EF sends it as a parameter (@name)."],
      ["Why is db.Books.ToList().Where(…) slow?", "Every row is fetched, then filtered in C#."],
      ["How do you search ignoring case on SQLite?", "EF.Functions.Like(b.Title, \"%\" + text + \"%\")"],
      ["Can a Where call your own C# method?", "No — EF cannot translate it and throws; filter in SQL, format afterwards."]
    ],
    quiz: [
      { q: "`db.Books.Where(b => b.Year < 1900)` on its own sends…", opts: ["SELECT … WHERE Year < 1900", "nothing yet", "every row", "an error"], ans: 1, why: "It is an IQueryable: nothing runs until results are asked for." },
      { q: "On SQLite, `b.Title.Contains(\"dune\")` finds \"Dune\"?", opts: ["yes", "no — instr is case-sensitive", "only with an index", "it does not translate"], ans: 1, why: "Contains becomes instr(…) > 0, which compares exactly." },
      { q: "Which runs the count in the database?", opts: ["db.Loans.ToList().Count", "db.Loans.Count()", "db.Loans.AsEnumerable().Count()", "all three"], ans: 1, why: "Count() on the DbSet becomes COUNT(*); the others fetch every row first." }
    ]
  });

  /* ================================================================
     T1.14 Migrations
     ================================================================ */
  lesson("T1.14", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "`EnsureCreated()` builds the tables once. The day you add a property, the database still has the old table — and the program fails on a column that is not there.",
        "Deleting the database to rebuild it throws the users' data away.",
        "A **migration** records one change to the model as a step that can be applied to any copy of the database, in order, keeping the data: version control for the schema."
      ] },
      page("Core idea"),
      sh("install the tool (pinned per project) and add the first migration", "dotnet tool restore\ndotnet ef migrations add Initial --project src/Library.Data"),
      cs("what it wrote: Migrations/<time>_Initial.cs (part)", 'public partial class Initial : Migration\n{\n    protected override void Up(MigrationBuilder migrationBuilder)\n    {\n        migrationBuilder.CreateTable(\n            name: "Books",\n            columns: table => new\n            {\n                Id = table.Column<int>(type: "INTEGER", nullable: false)\n                    .Annotation("Sqlite:Autoincrement", true),\n                Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),\n                Author = table.Column<string>(type: "TEXT", nullable: false),\n                Year = table.Column<int>(type: "INTEGER", nullable: false)\n            },\n            constraints: table => table.PrimaryKey("PK_Books", x => x.Id));\n    }\n\n    protected override void Down(MigrationBuilder migrationBuilder) =>\n        migrationBuilder.DropTable(name: "Books");\n}'),
      cs("the program applies whatever is missing at start-up", 'using var db = new LibraryContext(options);\ndb.Database.Migrate();   // runs every migration this database has not had yet'),
      { ul: [
        "`migrations add` compares the model with the last **snapshot** (`LibraryContextModelSnapshot.cs`) and writes the difference as `Up` (apply) and `Down` (undo).",
        "The database keeps a table `__EFMigrationsHistory` listing the migrations it has had; `Migrate()` runs only the rest.",
        "Migrations are source code: read them, commit them with the model change that caused them."
      ] },
      page("Rules"),
      { table: { head: ["Command", "Does"], rows: [
        ["`dotnet ef migrations add <Name>`", "writes a migration for the model's changes since the last one"],
        ["`dotnet ef database update`", "applies the missing migrations to the design-time database"],
        ["`dotnet ef migrations remove`", "deletes the last migration, if no database has had it"],
        ["`dotnet ef migrations script`", "prints the SQL the migrations would run"],
        ["`db.Database.Migrate()`", "applies the missing migrations from inside the program"],
        ["`db.Database.HasPendingModelChanges()`", "true when the model has changed since the last migration"]
      ] } },
      { ul: [
        "One migration per model change, named for what changed (`AddLoanReturned`, `RestrictDeletes`).",
        "Never edit a migration a database has already had; add a new one that changes it.",
        "`dotnet ef` needs to make a context at design time: the project's `IDesignTimeDbContextFactory<LibraryContext>` does that.",
        "Use migrations or `EnsureCreated` on a database — never both: `EnsureCreated` writes no history, so `Migrate` later tries to create the tables again."
      ] },
      page("Variations"),
      { h: "A second migration" },
      sh("a property added to Book, then", "dotnet ef migrations add AddBookIsbn --project src/Library.Data"),
      cs("Up adds the column; Down removes it", 'migrationBuilder.AddColumn<string>(\n    name: "Isbn", table: "Books", type: "TEXT", nullable: true);'),
      { h: "The SQL, to review or hand to someone" },
      sh("every migration as one script", "dotnet ef migrations script --project src/Library.Data --output migrate.sql"),
      { h: "A test that the migrations are up to date" },
      cs("fails the build the day someone forgets", '[Fact]\npublic void The_migrations_match_the_model()\n{\n    using var db = new TestDb(create: false);\n    using var c = db.Context();\n    Assert.False(c.Database.HasPendingModelChanges());\n}'),
      page("Pitfalls"),
      { h: "Migrate with a change not yet migrated" },
      sh("Migrate() after editing the model, before adding a migration", "System.InvalidOperationException: An error was generated for warning 'Microsoft.EntityFrameworkCore.Migrations.PendingModelChangesWarning': The model for context 'LibraryContext' has pending changes. Add a new migration before updating the database. …"),
      { ul: [ "`dotnet ef migrations add <Name>`, then run again." ] },
      { h: "The tool is not installed" },
      sh("dotnet ef with no tool", "Could not execute because the specified command or file was not found.\nPossible reasons for this include:\n  * You misspelled a built-in dotnet command.\n  * You intended to execute a .NET program, but dotnet-ef does not exist."),
      { ul: [ "`dotnet tool restore` installs the version pinned in `.config/dotnet-tools.json`." ] },
      { h: "EnsureCreated, then Migrate" },
      sh("a database made by EnsureCreated has no history table", "Microsoft.Data.Sqlite.SqliteException (0x80004005): SQLite Error 1: 'table \"Books\" already exists'."),
      page("Connections"),
      { ul: [ "**Back:** T1A.7's CREATE TABLE and constraints; T1.12's model; Bridge B's Git — a migration is committed with the change that caused it.", "**Next:** T1.15 changes the relationships and needs a migration for it; T1F migrates a server's database.", "**The project:** milestone 3 is your first migration — and every later milestone must keep them up to date." ] },
      page("Good practice"),
      { ul: [ "Add the migration in the same commit as the model change.", "Read `Up` before you run it: a rename that came out as drop-and-add would lose a column's data.", "Keep a test that `HasPendingModelChanges()` is false." ] },
      page("Practise"),
      { ul: [ "**The Lending Library on EF Core, milestone 3:** `dotnet ef migrations add Initial` — and another whenever the model changes." ] },
      page("Quick reference"),
      sh("the loop", "# change the model, then\ndotnet ef migrations add <WhatChanged> --project src/Library.Data\n# the program runs db.Database.Migrate() at start-up"),
      { ul: [ "`migrations add` · `migrations remove` · `migrations script` · `database update`.", "`Up` applies, `Down` undoes; `__EFMigrationsHistory` remembers.", "Never edit an applied migration; never mix with `EnsureCreated`." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["has pending changes. Add a new migration", "the model changed; no migration yet", "Pitfalls"], ["Could not execute … dotnet-ef does not exist", "the tool is not restored", "Pitfalls"], ["table \"Books\" already exists", "EnsureCreated made it; Migrate tried again", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What is a migration?", "One model change as a step (Up and Down) that updates any copy of the database, keeping its data."],
      ["Which command writes a migration?", "dotnet ef migrations add <Name>"],
      ["How does a database know which migrations it has had?", "The __EFMigrationsHistory table."],
      ["What does db.Database.Migrate() do?", "Applies every migration this database has not had yet."],
      ["Why not edit a migration that has been applied?", "Databases that had it will never run it again; add a new migration instead."],
      ["Why not use EnsureCreated and Migrate on one database?", "EnsureCreated writes no history, so Migrate tries to create the tables again."]
    ],
    quiz: [
      { q: "You add `string? Isbn` to Book and run the program, which calls Migrate(). EF 10…", opts: ["adds the column", "throws: the model has pending changes", "ignores the property", "deletes the database"], ans: 1, why: "A changed model needs a migration first: dotnet ef migrations add." },
      { q: "`dotnet ef migrations remove` is safe when…", opts: ["always", "no database has had that migration yet", "after Migrate()", "the snapshot is deleted"], ans: 1, why: "Removing one a database has had leaves that database out of step." },
      { q: "Which file does `migrations add` compare the model with?", opts: ["the database", "the model snapshot", "the last Up method", "appsettings.json"], ans: 1, why: "The snapshot is the model as of the last migration." }
    ]
  });

  /* ================================================================
     T1.15 Relationships and loading
     ================================================================ */
  lesson("T1.15", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A loan belongs to one book and one member; a book has many loans. T1A.5 joined those tables by hand.",
        "In EF the link is a **navigation property**: `loan.Book`, `member.Loans`. But EF does not fetch related rows unless you ask — so `loan.Book` can be null in a query that never loaded it.",
        "This lesson models the relationships, chooses what a delete may do, and loads related data on purpose."
      ] },
      page("Core idea"),
      cs("one-to-many: a foreign key and navigations on both ends", 'public class Loan\n{\n    public int Id { get; set; }\n    public int BookId { get; set; }           // the foreign key\n    public Book Book { get; set; } = null!;   // the navigation to it\n    public int MemberId { get; set; }\n    public Member Member { get; set; } = null!;\n    public DateOnly Due { get; set; }\n    public DateOnly? Returned { get; set; }\n}\n\npublic class Book { public int Id { get; set; } /* … */ public List<Loan> Loans { get; set; } = new(); }'),
      cs("say what a delete may do", 'model.Entity<Loan>()\n    .HasOne(l => l.Book).WithMany(b => b.Loans)\n    .HasForeignKey(l => l.BookId)\n    .OnDelete(DeleteBehavior.Restrict);   // a book with loans cannot be deleted'),
      cs("load related data: Include, or project what you need", '// whole entities, joined\nvar open = db.Loans.Include(l => l.Book).Include(l => l.Member)\n    .Where(l => l.Returned == null).ToList();\n\n// just the columns a screen shows — usually better\nvar rows = db.Loans.Where(l => l.Returned == null)\n    .Select(l => new { l.Book.Title, l.Member.Name, l.Due })\n    .ToList();'),
      sql("the projection: one join, three columns", 'SELECT "b"."Title", "m"."Name", "l"."Due"\nFROM "Loans" AS "l"\nINNER JOIN "Books" AS "b" ON "l"."BookId" = "b"."Id"\nINNER JOIN "Members" AS "m" ON "l"."MemberId" = "m"."Id"\nWHERE "l"."Returned" IS NULL'),
      { ul: [
        "`BookId` + `Book` + `Book.Loans` is enough for EF to find the relationship by convention; the fluent API makes it explicit and sets the delete rule.",
        "A navigation used inside a query (`l.Book.Title` in a `Select` or `Where`) becomes a JOIN — no `Include` needed.",
        "`Include` is for when you want the related **entities** back, filled in."
      ] },
      page("Rules"),
      { table: { head: ["DeleteBehavior", "Deleting the book with loans…"], rows: [
        ["`Cascade` (the default for a required key)", "deletes its loans too"],
        ["`Restrict` / `NoAction`", "is refused: FOREIGN KEY constraint failed"],
        ["`SetNull` (key must be nullable)", "keeps the loans with BookId NULL"]
      ] } },
      { ul: [
        "Pick deliberately: cascading away a library's loan history because a book was withdrawn is a bug.",
        "**Many-to-many** (books and genres): give both ends a collection, `List<Genre> Genres` and `List<Book> Books`, and EF makes the link table (T1A.5's) for you — or model the link as its own entity when it carries data, as `Loan` does between books and members.",
        "Loading is explicit: `Include` (eager), a projection, or `db.Entry(book).Collection(b => b.Loans).Load()` (explicit). Lazy loading exists but hides queries; T1.17 shows why that matters.",
        "Changing a relationship is a model change: add a migration."
      ] },
      page("Variations"),
      { h: "Include more than one level" },
      cs("ThenInclude walks on", 'var members = db.Members\n    .Include(m => m.Loans).ThenInclude(l => l.Book)\n    .ToList();'),
      { h: "Filter by a related row" },
      cs("Any becomes EXISTS", 'var borrowers = db.Members.Where(m => m.Loans.Any(l => l.Returned == null)).ToList();'),
      { h: "Add through a navigation" },
      cs("EF sets the foreign key for you", 'var ann = db.Members.Single(m => m.Name == "Ann Lee");\nann.Loans.Add(new Loan { BookId = 1, Out = today, Due = today.AddDays(14) });\ndb.SaveChanges();   // INSERT INTO "Loans" … with MemberId = Ann\'s id'),
      page("Pitfalls"),
      { h: "A navigation that was never loaded" },
      sh("loan.Book.Title on a loan read without Include", "System.NullReferenceException: Object reference not set to an instance of an object."),
      { ul: [ "Include it, or project `l.Book.Title` inside the query." ] },
      { h: "A delete the relationship refuses" },
      sh("removing a member who has loans (Restrict)", "Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while saving the entity changes. See the inner exception for details.\n ---> Microsoft.Data.Sqlite.SqliteException (0x80004005): SQLite Error 19: 'FOREIGN KEY constraint failed'."),
      { ul: [ "That is the rule working. Return or archive the loans first — or decide the rule should be different, and migrate." ] },
      { h: "Including everything" },
      "`Include` on every navigation \"just in case\" drags whole tables of columns back for a screen that shows three of them. Project instead.",
      page("Connections"),
      { ul: [ "**Back:** T1A.5's joins and link tables; T1A.7's foreign keys; T1.14's migrations.", "**Next:** T1.16 tracks the entities `Include` brought back; T1.17 is what happens when loading is left to chance.", "**The project:** milestone 4 — `Lend`, `Return`, `Overdue` and the delete rules." ] },
      page("Good practice"),
      { ul: [ "Set every relationship's delete behaviour on purpose, in `OnModelCreating`.", "Prefer a projection to `Include` for lists; use `Include` when you will change the entities.", "Keep the foreign-key property (`BookId`) as well as the navigation: you can set it without loading the book." ] },
      page("Practise"),
      { ul: [ "**The Lending Library on EF Core, milestone 4:** `Lend`, `Return`, `Overdue` with titles and names, and `Restrict` on both relationships — then a migration." ] },
      page("Quick reference"),
      cs("the pieces", 'model.Entity<Loan>().HasOne(l => l.Book).WithMany(b => b.Loans)\n    .HasForeignKey(l => l.BookId).OnDelete(DeleteBehavior.Restrict);\ndb.Loans.Include(l => l.Book).ToList();\ndb.Loans.Select(l => new { l.Book.Title, l.Due }).ToList();'),
      { ul: [ "Foreign key + navigation; `HasOne/WithMany` to be explicit.", "`Include`/`ThenInclude` for entities; a `Select` for columns.", "`Cascade`, `Restrict`, `SetNull` — choose, then migrate." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["Object reference not set to an instance of an object", "a navigation not loaded", "Pitfalls"], ["FOREIGN KEY constraint failed", "Restrict refused a delete", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What is a navigation property?", "A property that points to a related entity (loan.Book) or entities (book.Loans)."],
      ["Does EF load loan.Book automatically?", "No — use Include, a projection, or explicit loading."],
      ["What does a navigation inside a Select become?", "A JOIN in the SQL."],
      ["What does DeleteBehavior.Restrict do?", "Refuses to delete a row that others still point to."],
      ["What is the default delete behaviour for a required relationship?", "Cascade: the dependants are deleted too."],
      ["How does EF model many-to-many?", "A collection on both ends; EF makes the link table (or you model the link as an entity)."]
    ],
    quiz: [
      { q: "`db.Loans.ToList()[0].Book` is…", opts: ["the book", "null — it was not loaded", "an exception", "a proxy that loads it"], ans: 1, why: "Without Include (or lazy loading) related entities are not fetched." },
      { q: "Which sends one query with two joins?", opts: ["a Select of l.Book.Title and l.Member.Name", "a loop calling db.Books.Find for each loan", "ToList then Select", "Load() per loan"], ans: 0, why: "Navigations used in the query become joins." },
      { q: "A required Loan→Member relationship with default settings: deleting a member…", opts: ["is refused", "deletes their loans", "sets MemberId to NULL", "does nothing"], ans: 1, why: "A required relationship cascades by default — say Restrict if that is wrong." }
    ]
  });

  /* ================================================================
     T1.16 Change tracking
     ================================================================ */
  lesson("T1.16", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "`book.Title = \"…\"; db.SaveChanges();` updates the row — but you never wrote an UPDATE. How did EF know?",
        "The context keeps a **change tracker**: every entity a query hands out is remembered with its original values, and `SaveChanges` sends exactly what changed.",
        "Knowing what is tracked explains surprising saves, the error about \"already being tracked\", and why read-only pages should switch tracking off."
      ] },
      page("Core idea"),
      cs("load, change, save: one UPDATE of one column", 'var book = db.Books.Single(b => b.Id == 1);   // tracked: Unchanged\nbook.Title = "Dune (50th anniversary)";        // now Modified: Title\nConsole.WriteLine(db.Entry(book).State);       // Modified\ndb.SaveChanges();   // UPDATE "Books" SET "Title" = @p0 WHERE "Id" = @p1 RETURNING 1;'),
      cs("read-only: track nothing", 'var shelf = db.Books.AsNoTracking().OrderBy(b => b.Title).ToList();\nConsole.WriteLine(db.ChangeTracker.Entries().Count());   // 0'),
      { ul: [
        "Each tracked entity has a **state**: `Added`, `Unchanged`, `Modified`, `Deleted` (and `Detached` when not tracked).",
        "`SaveChanges` turns them into INSERT, UPDATE (only the changed columns) and DELETE — all in **one transaction**, as T1.11 did by hand.",
        "`AsNoTracking()` skips the bookkeeping: faster, less memory, and nothing a later `SaveChanges` could write by surprise."
      ] },
      page("Rules"),
      { table: { head: ["You do", "State", "SaveChanges sends"], rows: [
        ["`db.Add(x)`", "Added", "INSERT"],
        ["load, then change a property", "Modified (those properties)", "UPDATE of those columns"],
        ["`db.Remove(x)`", "Deleted", "DELETE"],
        ["load and change nothing", "Unchanged", "nothing"],
        ["`AsNoTracking()` query", "Detached", "nothing, ever"]
      ] } },
      { ul: [
        "Track what you will change; read everything else with `AsNoTracking()` (or a projection, which is never tracked).",
        "`db.Update(entity)` marks **every** property modified — the UPDATE rewrites all columns from that object, so stale or blank values overwrite real ones.",
        "`ExecuteUpdate`/`ExecuteDelete` change many rows in one statement and bypass the tracker entirely.",
        "One context, one unit of work: a long-lived context tracks more and more and goes stale."
      ] },
      page("Variations"),
      { h: "One statement for many rows" },
      cs("no loading, no tracking", 'int n = db.Loans\n    .Where(l => l.Returned == null && l.Due < cutoff)\n    .ExecuteUpdate(s => s.SetProperty(l => l.Returned, cutoff));'),
      { h: "See what will be saved" },
      cs("the tracker, read aloud", 'foreach (var e in db.ChangeTracker.Entries())\n    Console.WriteLine($"{e.Entity.GetType().Name} {e.State}");'),
      { h: "Start again" },
      cs("forget everything tracked", 'db.ChangeTracker.Clear();'),
      page("Pitfalls"),
      { h: "Two objects for one row" },
      sh("attaching a second Book with an Id already tracked", "System.InvalidOperationException: The instance of entity type 'Book' cannot be tracked because another instance with the key value '{Id: 1}' is already being tracked. When attaching existing entities, ensure that only one entity instance with a given key value is attached."),
      { ul: [ "Change the tracked instance instead of making a new one — or use a fresh context." ] },
      { h: "Update overwrites what you did not send" },
      cs("a new object with only the title set", 'db.Update(new Book { Id = 1, Title = "Dune" });\ndb.SaveChanges();   // Author becomes "" and Year 0 — every column was written'),
      { h: "A change made through a no-tracking read" },
      "`var b = db.Books.AsNoTracking().First(); b.Title = \"x\"; db.SaveChanges();` saves nothing: the context never knew about `b`.",
      page("Connections"),
      { ul: [ "**Back:** T1.11's one transaction per action; T1.12's `Add`/`SaveChanges`; unit 6's references — two variables, one object.", "**Next:** T1.17 — the tracker also explains why loading in a loop is slow.", "**The project:** milestone 5 — reads track nothing, `Rename` updates one column, `Return` one row." ] },
      page("Good practice"),
      { ul: [ "Lists and reports: `AsNoTracking()` or a projection.", "Changes: load the entity, change the properties, `SaveChanges()` once.", "Prefer loading and changing to `db.Update(new …)`." ] },
      page("Practise"),
      { ul: [ "**The Lending Library on EF Core, milestone 5:** no tracking on reads; `Rename` and `Return` send one small UPDATE each." ] },
      page("Quick reference"),
      cs("the moves", 'var b = db.Books.Find(1)!; b.Title = "x"; db.SaveChanges();   // one column\ndb.Books.AsNoTracking().ToList();                            // read-only\ndb.Entry(b).State;                                           // what EF thinks'),
      { ul: [ "Added · Unchanged · Modified · Deleted · Detached.", "`SaveChanges` = one transaction of only what changed.", "`AsNoTracking` to read; `ExecuteUpdate`/`ExecuteDelete` for bulk." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["cannot be tracked because another instance with the key value … is already being tracked", "two objects for one row in one context", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What does the change tracker remember?", "Each entity a query returned, with its original values and state."],
      ["Which columns does an UPDATE from SaveChanges set?", "Only the properties that changed."],
      ["What does AsNoTracking() do?", "Returns entities the context does not remember: faster, and never saved by accident."],
      ["How many transactions does one SaveChanges use?", "One: every change succeeds or none does."],
      ["Why is db.Update(new Book { Id = 1, Title = … }) risky?", "It marks every property modified, overwriting the other columns."],
      ["Which call changes many rows in one statement without tracking?", "ExecuteUpdate (or ExecuteDelete)."]
    ],
    quiz: [
      { q: "You load a book, change nothing and call SaveChanges(). EF sends…", opts: ["an UPDATE of every column", "nothing", "a SELECT", "an error"], ans: 1, why: "Unchanged entities produce no SQL." },
      { q: "`db.Books.AsNoTracking().First()`, then change its Title and SaveChanges()…", opts: ["updates the title", "saves nothing", "throws", "inserts a copy"], ans: 1, why: "An untracked entity is invisible to SaveChanges." },
      { q: "Three changes, one SaveChanges(), the third violates a constraint. Saved:", opts: ["the first two", "none", "all three", "the third"], ans: 1, why: "SaveChanges wraps its changes in one transaction." }
    ]
  });

  /* ================================================================
     T1.17 N+1 and performance
     ================================================================ */
  lesson("T1.17", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "A member list with each member's loan count works on your laptop with five members. In a real library with two thousand it takes seconds.",
        "The cause is usually **N+1**: one query for the list, then one more for every row in it. Each query is fast; two thousand and one of them are not.",
        "The fix is almost always to ask the database one better question — and the first step is to *see* the queries."
      ] },
      page("Core idea"),
      cs("N+1: correct, and one query per member", 'var result = new List<MemberSummary>();\nforeach (var m in db.Members.OrderBy(m => m.Name).ToList())              // 1 query\n{\n    var loans = db.Loans.Where(l => l.MemberId == m.Id).ToList();         // + 1 per member\n    result.Add(new MemberSummary(m.Name, loans.Count, loans.Count(l => l.Returned == null)));\n}'),
      cs("see every statement EF sends", 'var options = new DbContextOptionsBuilder<LibraryContext>()\n    .UseSqlite("Data Source=library.db")\n    .LogTo(Console.WriteLine, LogLevel.Information)   // one "Executed DbCommand" per query\n    .Options;'),
      cs("fixed: one query does the counting", 'var result = db.Members\n    .OrderBy(m => m.Name)\n    .Select(m => new MemberSummary(\n        m.Name,\n        m.Loans.Count,\n        m.Loans.Count(l => l.Returned == null)))\n    .ToList();'),
      sql("the single statement", 'SELECT "m"."Name", (\n    SELECT COUNT(*)\n    FROM "Loans" AS "l"\n    WHERE "m"."Id" = "l"."MemberId"), (\n    SELECT COUNT(*)\n    FROM "Loans" AS "l0"\n    WHERE "m"."Id" = "l0"."MemberId" AND "l0"."Returned" IS NULL)\nFROM "Members" AS "m"\nORDER BY "m"."Name"'),
      { ul: [
        "N+1 hides in loops that query, in a navigation read inside a loop (with lazy loading on, `m.Loans` is a query each time), and in a method that queries being called per row.",
        "The cure: move the loop **into** the query — a projection, an `Include`, or a `GroupBy` — so the database answers once.",
        "Measure before and after: count the statements in the log, or time it with a `Stopwatch`."
      ] },
      page("Rules"),
      { table: { head: ["Symptom", "Fix"], rows: [
        ["a query inside a `foreach`", "one query with a projection or `Include`"],
        ["`Count`/`Sum` per row", "a correlated count in the projection, or `GroupBy`"],
        ["a list then `Find` for each id", "`Where(x => ids.Contains(x.Id))` once"],
        ["`Include` of two collections: rows multiply", "`AsSplitQuery()` — one query per collection"],
        ["a slow `WHERE` on a big table", "an index (T1A.8) — `HasIndex(…)`, then a migration"]
      ] } },
      { ul: [
        "Fewer round trips beat cleverer C#: a database can count a million rows faster than your program can receive a thousand.",
        "Read-only and many rows: `AsNoTracking()` (T1.16) saves time and memory too.",
        "A test can count the queries (an interceptor) so the N+1 cannot come back unnoticed."
      ] },
      page("Variations"),
      { h: "Many ids, one query" },
      cs("instead of Find in a loop", 'var books = db.Books.Where(b => ids.Contains(b.Id)).ToList();   // WHERE "b"."Id" IN (…)'),
      { h: "Two collections without the cartesian explosion" },
      cs("split into one query per collection", 'var members = db.Members\n    .Include(m => m.Loans)\n    .Include(m => m.Reviews)\n    .AsSplitQuery()\n    .ToList();'),
      { h: "An index for a frequent filter" },
      cs("then add a migration", 'model.Entity<Loan>().HasIndex(l => l.Due);'),
      page("Pitfalls"),
      { h: "The log shows the same query again and again" },
      sh("LogTo output for the N+1 loop (shortened)", "info: Executed DbCommand (0ms) [Parameters=[@m_Id='1'], CommandType='Text', CommandTimeout='30']\n      SELECT … FROM \"Loans\" AS \"l\" WHERE \"l\".\"MemberId\" = @m_Id\ninfo: Executed DbCommand (0ms) [Parameters=[@m_Id='2'], CommandType='Text', CommandTimeout='30']\n      SELECT … FROM \"Loans\" AS \"l\" WHERE \"l\".\"MemberId\" = @m_Id\n…"),
      { ul: [ "The same statement with a different parameter each time: that is N+1. Fold the loop into one query." ] },
      { h: "Two collections in one Include" },
      sh("EF's warning when a query loads two collections at once", "warn: Compiling a query which loads related collections for more than one collection navigation, either via 'Include' or through projection, but no 'QuerySplittingBehavior' has been configured. By default, Entity Framework will use 'QuerySplittingBehavior.SingleQuery', which can potentially result in slow query performance."),
      { ul: [ "One member with 20 loans and 10 reviews comes back as 200 joined rows. `AsSplitQuery()` sends one query per collection instead." ] },
      { h: "Fixing what was never slow" },
      "Optimise with numbers. Count the queries and time the page first; a query that runs once in a while on fifty rows is fine as it is.",
      page("Connections"),
      { ul: [ "**Back:** T1A.8's indexes and query plans; T1.15's projections; T1.16's no-tracking reads; unit 10's tests — a test that counts queries.", "**Next:** T1D calls APIs, where every extra round trip costs far more; T1F serves this data over HTTP.", "**The project:** milestone 6 — `Members()` works and is N+1; make twenty members take at most two queries." ] },
      page("Good practice"),
      { ul: [ "Turn on `LogTo` while you develop and read what each page sends.", "No query inside a loop over query results.", "Keep a test that counts queries for anything that lists." ] },
      page("Practise"),
      { ul: [ "**The Lending Library on EF Core, milestone 6:** find the N+1 in `Members()` and fix it; then milestone 7, the command line, your tests and a commit." ] },
      page("Quick reference"),
      cs("one question, one answer", 'db.Members.Select(m => new { m.Name, Out = m.Loans.Count(l => l.Returned == null) }).ToList();\n// not: foreach (var m in members) db.Loans.Count(l => l.MemberId == m.Id);'),
      { ul: [ "N+1 = one query, then one per row. See it with `LogTo`.", "Fix with a projection, `Include`, `GroupBy` or `Contains`.", "`AsSplitQuery` for several collections; an index for a frequent filter." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["the same Executed DbCommand per row", "N+1", "Pitfalls"], ["loads related collections for more than one collection navigation", "a cartesian explosion; consider AsSplitQuery", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What is the N+1 problem?", "One query for a list, then one more query for each row in it."],
      ["How do you see every query EF sends?", "LogTo(Console.WriteLine, LogLevel.Information) on the options."],
      ["How do you fix N+1 for a count per member?", "Project the count in the query: Select(m => new { m.Name, N = m.Loans.Count }).ToList()."],
      ["What replaces Find for each id in a list?", "One query: Where(b => ids.Contains(b.Id))."],
      ["What does AsSplitQuery() do?", "Loads each included collection with its own query, avoiding multiplied rows."],
      ["How can a test stop N+1 coming back?", "Count the commands with an interceptor and assert a maximum."]
    ],
    quiz: [
      { q: "100 members, a loop that queries each member's loans. How many queries?", opts: ["1", "2", "100", "101"], ans: 3, why: "One for the members plus one per member: N+1." },
      { q: "The best fix for a per-member loan count is…", opts: ["caching each count", "a projection with m.Loans.Count", "AsNoTracking", "a bigger connection pool"], ans: 1, why: "The database counts for every member in one statement." },
      { q: "`Include` of two collections can be slow because…", opts: ["Include is always slow", "the joined rows multiply (a cartesian product)", "it disables tracking", "SQLite cannot join"], ans: 1, why: "AsSplitQuery() sends one query per collection instead." }
    ]
  });

  /* ================================================================
     command cards: typed, checked against anchored patterns
     ================================================================ */
  var short = function (s) { s = String(s).replace(/^(Type the |Name the |Which )/, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };
  K.add({ cards: {
    "t1c-ef": { title: "Entities and queries", lesson: "T1.12", concepts: ["ef-context", "ef-linq"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Type the command that adds EF Core's SQLite provider package to the project in src/Library.Data.", "dotnet add src/Library.Data package Microsoft.EntityFrameworkCore.Sqlite", ["^dotnet add (\\./)?src/Library\\.Data(/Library\\.Data\\.csproj)? package Microsoft\\.EntityFrameworkCore\\.Sqlite( (-v|--version) \\S+)?$"]],
          ["Which context method writes every pending change to the database?", "SaveChanges", ["^(db\\.|context\\.)?SaveChanges(\\(\\))?;?$"]],
          ["Which method shows the SQL a LINQ query on a DbSet will send, without running it?", "ToQueryString", ["^(query\\.|q\\.)?ToQueryString(\\(\\))?;?$"]],
          ["Which ModelBuilder method do you override to configure the model with the fluent API?", "OnModelCreating", ["^(protected override void )?OnModelCreating(\\(.*\\))?;?$"]],
          ["Which EF function makes a LIKE pattern match in a query (EF dot Functions dot …)?", "EF.Functions.Like", ["^EF\\.Functions\\.Like(\\(.*\\))?;?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], ci: true, hint: "SaveChanges · ToQueryString · OnModelCreating · EF.Functions.Like." };
      } },
    "t1c-migrate": { title: "Migrations", lesson: "T1.14", concepts: ["ef-migrations"], kind: "command",
      vary: function (r) {
        var n = pick(r, ["Initial", "AddBookIsbn", "RestrictDeletes", "AddLoanIndex"]);
        var q = pick(r, [
          ["Type the dotnet ef command that adds a migration called " + n + " to the project in src/Library.Data.", "dotnet ef migrations add " + n + " --project src/Library.Data", ["^dotnet ef migrations add " + n + " (--project|-p) (\\./)?src/Library\\.Data(/Library\\.Data\\.csproj)?$"]],
          ["Type the dotnet ef command that deletes the last migration (no project option needed).", "dotnet ef migrations remove", ["^dotnet ef migrations remove( (--project|-p) \\S+)?$"]],
          ["Type the dotnet ef command that applies the missing migrations to the database (no project option needed).", "dotnet ef database update", ["^dotnet ef database update( (--project|-p) \\S+)?$"]],
          ["Type the command that installs the tools pinned in the repository's tool manifest.", "dotnet tool restore", ["^dotnet tool restore$"]],
          ["Which DatabaseFacade method applies the missing migrations from inside the program?", "Migrate", ["^(db\\.)?(Database\\.)?Migrate(\\(\\))?;?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(/ called \w+/, ""), params: [n], answer: q[1], accept: q[2], hint: "dotnet ef migrations add · migrations remove · database update · Migrate()." };
      } },
    "t1c-load": { title: "Loading and tracking", lesson: "T1.15", concepts: ["ef-relations", "ef-tracking"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Type the query that reads every loan from db.Loans with its Book filled in, as a list.", "db.Loans.Include(l => l.Book).ToList();", ["^(var \\w+ = )?db\\.Loans\\.Include\\((\\w+) => \\2\\.Book\\)\\.ToList\\(\\);?$"]],
          ["Which query method reads entities the context will not track?", "AsNoTracking", ["^(\\.)?AsNoTracking(\\(\\))?;?$"]],
          ["Which DeleteBehavior refuses to delete a row that others still point to?", "DeleteBehavior.Restrict", ["^(DeleteBehavior\\.)?Restrict$"]],
          ["Which method, after Include, loads the next level of related data?", "ThenInclude", ["^(\\.)?ThenInclude(\\(.*\\))?;?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], ci: true, hint: "Include · ThenInclude · AsNoTracking · DeleteBehavior.Restrict." };
      } },
    "t1c-perf": { title: "N+1 and performance", lesson: "T1.17", concepts: ["ef-nplus1"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Name the problem: one query for a list, then one more query for each row (three characters).", "N+1", ["^(the )?N ?\\+ ?1( problem)?$"]],
          ["Which options-builder method sends EF's log, including every SQL command, to a writer such as Console.WriteLine?", "LogTo", ["^(\\.)?LogTo(\\(.*\\))?;?$"]],
          ["Which query method loads each included collection with a query of its own?", "AsSplitQuery", ["^(\\.)?AsSplitQuery(\\(\\))?;?$"]],
          ["Which method changes many rows in one UPDATE statement without loading them?", "ExecuteUpdate", ["^(\\.)?ExecuteUpdate(Async)?(\\(.*\\))?;?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(/ \(three characters\)/, ""), params: [], answer: q[1], accept: q[2], ci: true, hint: "N+1 · LogTo · AsSplitQuery · ExecuteUpdate." };
      } }
  } });

  /* ================================================================
     the part's project: The Lending Library on EF Core; its files are
     generated into code-projects-files.js
     ================================================================ */
  var RUN = "src/Library.Cli/Library.Cli.csproj";
  K.project("rp-t1c-library", {
    unit: "T1C", title: "The Lending Library on EF Core", folder: "library-efcore", solution: "LibraryEf.sln",
    scaffoldVersion: 1, minValidator: "1.1.0", sdk: ".NET 10 SDK",
    summary: "Unit 10's library again, on Entity Framework Core and SQLite: entities, LINQ that becomes SQL, migrations, relationships, change tracking, and one N+1 found and fixed — built in Rider.",
    brief: [
      "Books, members and loans in a SQLite database through EF Core: `src/Library.Data` (the entities, `LibraryContext` and `LibraryService` — yours to build), `src/Library.Cli` (the command line, written for you), `tests/Library.Tests` (your tests) and Kurenai's acceptance tests for milestones 1–6 (`tests/Library.Acceptance`), which run on SQLite in memory and read the SQL your code sends.",
      { ul: [
        "Run `dotnet tool restore` once for `dotnet ef` (pinned in `.config/dotnet-tools.json`).",
        "Filtering, counting and grouping happen in SQL; `Members()` ships working and slow — milestone 6 makes it fast.",
        "`Directory.Build.props`, `tests/Library.Acceptance/` and `.kurenai/validate.cs` are **protected**.",
        "EF Core 10.0.11 on SQLite is referenced, with the native SQLite pinned to a patched build."
      ] }
    ],
    milestones: [
      { id: "m1", title: "Entities and a context", lessons: ["T1.12"], about: "Title required and at most 200 characters; AddBook and AddMember (blank refused, trimmed, ids from the database); Shelf in title order.", checks: [{ type: "tests", class: "Milestone1" }] },
      { id: "m2", title: "Queries that translate", lessons: ["T1.13"], about: "ByAuthor, Search ignoring case, CountOnLoan and BooksPerAuthor — the WHERE, COUNT and GROUP BY in SQL, nothing filtered after ToList.",
        checks: [{ type: "tests", class: "Milestone2" }, { type: "source", path: "src/Library.Data/LibraryService.cs", forbids: ["AsEnumerable\\(", "\\.ToList\\(\\)\\s*\\.\\s*(Where|OrderBy|OrderByDescending|GroupBy|Count)\\("] }] },
      { id: "m3", title: "Migrations", lessons: ["T1.14"], about: "Your migrations build the database and still describe the model as it is.", checks: [{ type: "tests", class: "Milestone3" }, { type: "source", path: "src/Library.Data/Migrations", contains: ["MigrationBuilder"] }] },
      { id: "m4", title: "Relationships and loading", lessons: ["T1.15"], about: "Lend (14 days; a book already out refused), Return, Overdue with titles and names; a book or member with loans cannot be deleted.", checks: [{ type: "tests", class: "Milestone4" }] },
      { id: "m5", title: "Change tracking", lessons: ["T1.16"], about: "Reads track nothing; Rename updates only the title; Return sends one UPDATE.", checks: [{ type: "tests", class: "Milestone5" }] },
      { id: "m6", title: "N+1, found and fixed", lessons: ["T1.17"], about: "The member summary is the same, in at most two queries for twenty members.", checks: [{ type: "tests", class: "Milestone6" }] },
      { id: "m7", title: "The command line, tested and committed", lessons: ["T1.12", "T1.14", "T1.15", "T1.17"], about: "src/Library.Cli answers every command and remembers between runs; five or more of your own tests; no warnings; committed.",
        checks: [
          { type: "run", project: RUN, stdin: "clear\nbook 1965 Dune | Frank Herbert\nbook 1815 Emma | Jane Austen\nmember Ann Lee\nlend 1 1 2026-09-01\nlend 2 1 2026-09-10\nreturn 2 2026-09-12\noverdue 2026-09-20\nmembers\nquit\n",
            contains: ["Cleared.", "Added book #1 Dune (Frank Herbert, 1965)", "Added book #2 Emma (Jane Austen, 1815)", "Added member #1 Ann Lee", "Lent book #1 to member #1, due 2026-09-15.", "Returned loan #2.", "Dune · Ann Lee · due 2026-09-15 · 5 days late", "Ann Lee · 2 loan(s) · 1 out", "Bye."] },
          { type: "run", project: RUN, stdin: "shelf\nquit\n", contains: ["#1 Dune — Frank Herbert (1965)", "#2 Emma — Jane Austen (1815)"] },
          { type: "owntests", prefix: "Library.Tests.", min: 5 }, { type: "warnings", max: 0 }, { type: "git" }
        ] }
    ],
    protected: ["Directory.Build.props", "tests/Library.Acceptance/Library.Acceptance.csproj", "tests/Library.Acceptance/TestDb.cs", "tests/Library.Acceptance/Milestone1.cs", "tests/Library.Acceptance/Milestone2.cs", "tests/Library.Acceptance/Milestone3.cs", "tests/Library.Acceptance/Milestone4.cs", "tests/Library.Acceptance/Milestone5.cs", "tests/Library.Acceptance/Milestone6.cs", ".kurenai/validate.cs"],
    reward: { xp: 150, gold: 40, hp: 8 }
  });
})();
