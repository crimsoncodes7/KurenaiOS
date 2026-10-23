/* Kurenai OS — data/content/code-t1b.js
   Code · T1 · Part B · SQL from C# (docs/code-plan.md §3.3), done in Rider.

   Microsoft.Data.Sqlite: connections, commands and readers (T1.9),
   parameters and SQL injection (T1.10), transactions and a repository
   (T1.11). The lessons hold the Rider form of the notes contract (smoke75):
   the same pages, commands and files as blocks, a Pitfalls page, flashcards
   and a quiz; their retrieval cards are COMMAND cards. Their work is the
   part's project and T1's taster, "Contacts on SQLite" (rp-t1b-contacts;
   files generated into code-projects-files.js from
   tools/code-projects/contacts-sqlite/), proven by the validator.         */
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
    "ado-sqlite": { name: "Microsoft.Data.Sqlite", lesson: "T1.9", about: "connections, commands, readers" },
    "sql-params": { name: "Parameters", lesson: "T1.10", about: "values as parameters; injection stopped" },
    "ado-txn": { name: "Transactions from C#", lesson: "T1.11", about: "BeginTransaction, Commit, rollback on failure" },
    "repository": { name: "A repository", lesson: "T1.11", about: "the SQL behind one interface" }
  } });

  /* ================================================================
     T1.9 Microsoft.Data.Sqlite: connections and readers
     ================================================================ */
  lesson("T1.9", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "T1A wrote SQL in a sandbox. A real program sends SQL from its own code and turns the rows that come back into its own objects.",
        "In .NET that is **ADO.NET**: a connection, a command, a reader. `Microsoft.Data.Sqlite` is its SQLite provider — the same pattern works for SQL Server or PostgreSQL with another package.",
        "A SQLite database is one file; the program opens it, creates its tables if they are missing, and keeps the data between runs."
      ] },
      page("Core idea"),
      sh("add the package to a project", "dotnet add src/Contacts package Microsoft.Data.Sqlite"),
      cs("open, create the table, insert, read", 'using Microsoft.Data.Sqlite;\n\nusing var connection = new SqliteConnection("Data Source=contacts.db");\nconnection.Open();\n\nvar create = connection.CreateCommand();\ncreate.CommandText = "CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY, name TEXT NOT NULL)";\ncreate.ExecuteNonQuery();\n\nvar insert = connection.CreateCommand();\ninsert.CommandText = "INSERT INTO contacts (name) VALUES ($name)";\ninsert.Parameters.AddWithValue("$name", "Ann Lee");\ninsert.ExecuteNonQuery();\n\nvar query = connection.CreateCommand();\nquery.CommandText = "SELECT id, name FROM contacts ORDER BY id";\nusing var reader = query.ExecuteReader();\nwhile (reader.Read())\n    Console.WriteLine($"#{reader.GetInt64(0)} {reader.GetString(1)}");'),
      { ul: [
        "`SqliteConnection` names the file in its connection string; `Open()` creates the file if it is missing.",
        "A **command** holds one statement. `ExecuteNonQuery()` runs a change and returns the rows changed; `ExecuteReader()` returns rows; `ExecuteScalar()` returns the first column of the first row.",
        "`reader.Read()` moves to the next row and returns false at the end; `GetInt64(0)` and `GetString(1)` read columns by position. `using` closes the reader and the connection."
      ] },
      page("Rules"),
      { table: { head: ["Call", "Returns", "Use for"], rows: [
        ["`ExecuteNonQuery()`", "rows changed (int)", "CREATE, INSERT, UPDATE, DELETE"],
        ["`ExecuteReader()`", "a `SqliteDataReader`", "SELECT with many rows"],
        ["`ExecuteScalar()`", "one value (object?)", "`SELECT count(*)`, `last_insert_rowid()`"],
        ["`reader.GetInt64(i)` / `GetString(i)` / `GetDouble(i)`", "the column's value", "a column that is never NULL"],
        ["`reader.IsDBNull(i)`", "true for NULL", "before reading a column that may be NULL"]
      ] } },
      { ul: [
        "SQLite's INTEGER is a 64-bit `long`: read ids with `GetInt64`.",
        "A NULL column throws on `GetString`; test `IsDBNull(i)` first, or read `reader.IsDBNull(2) ? null : reader.GetString(2)`.",
        "Open a connection, use it, dispose it — `using var` at the top of a method is enough. Turn pooling off (`Pooling = false`) when tests delete the file afterwards.",
        "In Rider, the **Database** tool window opens the same `.db` file so you can see the rows your code wrote."
      ] },
      page("Variations"),
      { h: "The id of the row just inserted" },
      cs("RETURNING (or last_insert_rowid())", 'var add = connection.CreateCommand();\nadd.CommandText = "INSERT INTO contacts (name, email) VALUES ($name, $email) RETURNING id";\nadd.Parameters.AddWithValue("$name", name);\nadd.Parameters.AddWithValue("$email", (object?)email ?? DBNull.Value);\nlong id = (long)add.ExecuteScalar()!;'),
      { h: "Rows into records" },
      cs("a reader loop that builds objects", 'var list = new List<Contact>();\nusing var r = query.ExecuteReader();\nwhile (r.Read())\n    list.Add(new Contact(r.GetInt64(0), r.GetString(1), r.IsDBNull(2) ? null : r.GetString(2)));\nreturn list;'),
      { h: "A connection string, built safely" },
      cs("SqliteConnectionStringBuilder", 'var cs = new SqliteConnectionStringBuilder { DataSource = path, Pooling = false }.ToString();\nusing var connection = new SqliteConnection(cs);'),
      page("Pitfalls"),
      { h: "Reading NULL as a string" },
      sh("what the program says", "System.InvalidOperationException: The data is NULL at ordinal 2. This method can't be called on NULL values. Check using IsDBNull before calling."),
      { h: "C# null is not SQL NULL" },
      sh("a parameter set to null", "System.InvalidOperationException: Value must be set. Use DBNull.Value for a NULL."),
      { ul: [ "Pass `(object?)email ?? DBNull.Value` for a value that may be missing." ] },
      { h: "A file still in use" },
      "Deleting the database file while a pooled connection still holds it fails on Windows and confuses tests. Dispose every connection and reader (`using`), and set `Pooling = false` for throw-away files.",
      page("Connections"),
      { ul: [ "**Back:** T1A's SQL; unit 6's files and `using`; unit 7's records for the rows.", "**Next:** T1.10 puts every value in as a parameter; T1.11 wraps changes in a transaction.", "**The project:** milestone 1 is exactly this: create the table, `Add` and `All`." ] },
      page("Good practice"),
      { ul: [ "Create tables with `CREATE TABLE IF NOT EXISTS` when the program starts.", "Select the columns you read, by name, in the order your reader expects.", "Keep each command's SQL in one string you can read aloud." ] },
      page("Practise"),
      { ul: [ "**Contacts on SQLite, milestone 1:** `Add` and `All` over a table you create." ] },
      page("Quick reference"),
      cs("the four calls", 'using var c = new SqliteConnection("Data Source=app.db"); c.Open();\nvar cmd = c.CreateCommand(); cmd.CommandText = "SELECT count(*) FROM contacts";\nlong n = (long)cmd.ExecuteScalar()!;'),
      { ul: [ "`dotnet add package Microsoft.Data.Sqlite`.", "`ExecuteNonQuery` changes · `ExecuteReader` rows · `ExecuteScalar` one value.", "`IsDBNull` before reading what may be NULL; `DBNull.Value` to write one." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["The data is NULL at ordinal n", "GetString on a NULL column", "Pitfalls"], ["Value must be set", "a parameter left as C# null", "Pitfalls"]] } }
    ],
    flashcards: [
      ["Which call runs an INSERT and returns the rows changed?", "ExecuteNonQuery()"],
      ["Which call returns one value, like count(*)?", "ExecuteScalar()"],
      ["What does reader.Read() return?", "true while there is another row; false at the end."],
      ["How do you read a column that may be NULL?", "Check reader.IsDBNull(i) before GetString(i)."],
      ["How do you write a SQL NULL from C#?", "Pass DBNull.Value, not null."],
      ["What C# type holds an SQLite INTEGER?", "long (GetInt64)."]
    ],
    quiz: [
      { q: "`SELECT id, name FROM contacts` is best run with…", opts: ["ExecuteNonQuery", "ExecuteReader", "ExecuteScalar", "Open"], ans: 1, why: "Many rows come back: read them with a reader." },
      { q: "`reader.GetString(2)` on a NULL email…", opts: ["returns \"\"", "returns null", "throws InvalidOperationException", "returns \"NULL\""], ans: 2, why: "Check IsDBNull first." },
      { q: "`new SqliteConnection(\"Data Source=x.db\").Open()` when x.db does not exist…", opts: ["throws", "creates an empty database file", "uses memory", "asks for a password"], ans: 1, why: "SQLite creates the file." }
    ]
  });

  /* ================================================================
     T1.10 Parameters, never concatenation
     ================================================================ */
  lesson("T1.10", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "The quickest way to put a user's text into SQL is to glue it in: `\"SELECT … WHERE name = '\" + name + \"'\"`.",
        "Then someone types `O'Brien` and the query breaks — or types `x' OR '1'='1` and it returns every row. That is **SQL injection**, still one of the most common security holes on the web.",
        "**Parameters** send the SQL and the values separately. The database never reads a value as SQL, so the hole cannot open."
      ] },
      page("Core idea"),
      cs("glued in: the text becomes SQL", 'string name = "x\' OR \'1\'=\'1";\ncmd.CommandText = "SELECT id, name FROM contacts WHERE name = \'" + name + "\'";\n// SELECT id, name FROM contacts WHERE name = \'x\' OR \'1\'=\'1\'   — every row'),
      cs("a parameter: the text stays text", 'cmd.CommandText = "SELECT id, name FROM contacts WHERE name = $name";\ncmd.Parameters.AddWithValue("$name", name);\n// looks for a contact literally called  x\' OR \'1\'=\'1  — none'),
      { ul: [
        "`$name` is a **placeholder** in the SQL; `AddWithValue(\"$name\", name)` supplies its value. SQLite also accepts `@name` and `:name`.",
        "The value travels apart from the statement, so quotes, semicolons and SQL keywords inside it are just characters.",
        "Placeholders stand for **values** only — never for table or column names, which you choose from a fixed list in code."
      ] },
      sql("what the injected text did to the glued query", "SELECT id, name FROM contacts WHERE name = 'x' OR '1'='1';"),
      page("Rules"),
      { table: { head: ["Do", "Never"], rows: [
        ["`WHERE name = $name` + `AddWithValue`", "`\"… '\" + name + \"'\"`"],
        ["`LIKE '%' || $text || '%'`", "`$\"… LIKE '%{text}%'\"`"],
        ["`(object?)x ?? DBNull.Value` for a missing value", "`\"NULL\"` as text"],
        ["a column name chosen by a `switch` from fixed names", "a column name from the user"]
      ] } },
      { ul: [
        "String interpolation (`$\"…{x}…\"`) is concatenation in disguise: it has the same hole.",
        "Parameters also let the database reuse its plan for the statement, and keep dates and numbers in their own types.",
        "Searching ignoring case: SQLite's `LIKE` already ignores ASCII case; `lower(name) LIKE lower($pat)` makes it explicit."
      ] },
      page("Variations"),
      { h: "A search with LIKE" },
      cs("the pattern built in SQL, the value a parameter", 'cmd.CommandText = "SELECT id, name, email FROM contacts WHERE name LIKE \'%\' || $text || \'%\' ORDER BY name";\ncmd.Parameters.AddWithValue("$text", text);'),
      { h: "One command, many values" },
      cs("prepare once, change the value each time", 'var cmd = connection.CreateCommand();\ncmd.CommandText = "INSERT INTO contacts (name) VALUES ($name)";\nvar p = cmd.Parameters.Add("$name", SqliteType.Text);\nforeach (string n in names) { p.Value = n; cmd.ExecuteNonQuery(); }'),
      { h: "A column chosen safely" },
      cs("a fixed list, never the user's text", 'string column = sort switch { "email" => "email", _ => "name" };\ncmd.CommandText = $"SELECT id, name FROM contacts ORDER BY {column}";  // safe: column is one of two constants'),
      page("Pitfalls"),
      { h: "An apostrophe in a name" },
      sh("the glued query breaks", "Microsoft.Data.Sqlite.SqliteException (0x80004005): SQLite Error 1: 'near \"Brien\": syntax error'."),
      { h: "A placeholder with no value" },
      sh("AddWithValue forgotten", "System.InvalidOperationException: Must add values for the following parameters: $name"),
      { h: "Quoting a placeholder" },
      "`WHERE name = '$name'` compares with the text \"$name\" — the quotes make it a string, not a placeholder. Write `$name` bare.",
      page("Connections"),
      { ul: [ "**Back:** T1.9's commands; T1.3's `||`.", "**Next:** T1.11; T6 (Security) returns to injection with the OWASP list; T1C's Entity Framework writes parameters for you.", "**AQA:** 4.10 and 4.11 — SQL injection appears in questions about database security." ] },
      page("Good practice"),
      { ul: [ "Every value from outside the code is a parameter — names, searches, ids, dates.", "Search your code for `+` and `$\"` next to SQL keywords before you commit.", "Validate as well (a blank name is refused) — but validation never replaces parameters." ] },
      page("Practise"),
      { ul: [ "**Contacts on SQLite, milestone 2:** `FindByName` with a parameter; the validator also checks that no SQL is glued together in `src/Contacts`." ] },
      page("Quick reference"),
      cs("the pattern", 'cmd.CommandText = "SELECT … WHERE name = $name";\ncmd.Parameters.AddWithValue("$name", name);'),
      { ul: [ "`$name` (or `@name`) in the SQL; `Parameters.AddWithValue(\"$name\", value)`.", "Values only — never table or column names.", "`DBNull.Value` for NULL." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["syntax error near …", "a quote in glued-in text", "Pitfalls"], ["Must add values for the following parameters", "a placeholder without a value", "Pitfalls"]] } }
    ],
    flashcards: [
      ["What is SQL injection?", "Text from a user read as SQL because it was glued into the statement."],
      ["How do parameters stop it?", "The value travels apart from the SQL, so it is never parsed as SQL."],
      ["Can a parameter stand for a column name?", "No — values only. Choose names from a fixed list in code."],
      ["Is $\"…{x}…\" safe in SQL?", "No: interpolation is concatenation."],
      ["How do you search with LIKE and a parameter?", "LIKE '%' || $text || '%' with $text added as a parameter."],
      ["Which placeholder prefixes does SQLite accept?", "$name, @name and :name."]
    ],
    quiz: [
      { q: "`\"WHERE name = '\" + name + \"'\"` with name `x' OR '1'='1` returns…", opts: ["nothing", "every row", "an error always", "one row"], ans: 1, why: "The text closes the quote and adds OR true." },
      { q: "Which is safe?", opts: ["$\"WHERE id = {id}\"", "\"WHERE id = \" + id", "\"WHERE id = $id\" with AddWithValue", "\"WHERE id = '\" + id + \"'\""], ans: 2, why: "Only the parameter keeps the value out of the SQL." },
      { q: "`WHERE name = '$name'` finds…", opts: ["the parameter's value", "rows whose name is the text $name", "an error", "every row"], ans: 1, why: "Quoted, it is a string, not a placeholder." }
    ]
  });

  /* ================================================================
     T1.11 Transactions and a small repository
     ================================================================ */
  lesson("T1.11", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Importing fifty contacts is fifty INSERTs. If the thirtieth fails, the first twenty-nine are already saved — half an import, and running it again duplicates them.",
        "T1.8's transaction fixes that in SQL: all or nothing. From C# it is one call to start and one to commit.",
        "And the rest of the program should not care that SQL is involved at all: a **repository** hides it behind an interface the program and the tests talk to."
      ] },
      page("Core idea"),
      cs("all or nothing from C#", 'using var connection = Open();\nusing var tx = connection.BeginTransaction();\nvar cmd = connection.CreateCommand();\ncmd.Transaction = tx;\ncmd.CommandText = "INSERT INTO contacts (name, email) VALUES ($name, $email)";\nvar pName = cmd.Parameters.Add("$name", SqliteType.Text);\nvar pEmail = cmd.Parameters.Add("$email", SqliteType.Text);\nint added = 0;\nforeach (var (name, email) in contacts)\n{\n    pName.Value = name;\n    pEmail.Value = (object?)email ?? DBNull.Value;\n    added += cmd.ExecuteNonQuery();\n}\ntx.Commit();\nreturn added;'),
      { ul: [
        "`BeginTransaction()` starts it; every command in it sets `Transaction = tx`.",
        "`Commit()` keeps everything. If an exception leaves the method first, `using` disposes the transaction **without** committing — which rolls it back.",
        "So the failure path needs no code at all: throw (or let SQLite throw), and nothing is kept."
      ] },
      cs("the repository: one interface, one SQLite class", 'public interface IContactRepository\n{\n    Contact Add(string name, string? email);\n    IReadOnlyList<Contact> All();\n    IReadOnlyList<Contact> FindByName(string text);\n    int Import(IEnumerable<(string Name, string? Email)> contacts);\n    void Clear();\n}\n\npublic class SqliteContactRepository : IContactRepository { /* the SQL lives here, and only here */ }'),
      page("Rules"),
      { table: { head: ["Step", "Code"], rows: [
        ["start", "`using var tx = connection.BeginTransaction();`"],
        ["each command joins it", "`cmd.Transaction = tx;`"],
        ["keep the changes", "`tx.Commit();`"],
        ["undo them", "`tx.Rollback();` — or just leave the `using` without committing"]
      ] } },
      { ul: [
        "One action, one transaction: an import, a sale with its lines, a transfer between two rows.",
        "Inside a transaction, many INSERTs are also much faster: SQLite writes the file once instead of once per row.",
        "The repository's interface uses the program's types (`Contact`), never SQL types; unit 10's test doubles can stand in for it (a fake repository in memory)."
      ] },
      page("Variations"),
      { h: "Rolling back on purpose" },
      cs("validate inside the transaction", 'using var tx = connection.BeginTransaction();\nforeach (var c in contacts)\n{\n    if (string.IsNullOrWhiteSpace(c.Name)) { tx.Rollback(); throw new ArgumentException("Every contact needs a name."); }\n    /* insert */\n}\ntx.Commit();'),
      { h: "A fake for the program's tests" },
      cs("the same interface, in memory", 'class MemoryContacts : IContactRepository\n{\n    readonly List<Contact> rows = new();\n    public Contact Add(string name, string? email) { var c = new Contact(rows.Count + 1, name, email); rows.Add(c); return c; }\n    public IReadOnlyList<Contact> All() => rows;\n    /* … */\n}'),
      { h: "Dependency inversion again" },
      cs("the command line asks for the interface", 'IContactRepository contacts = new SqliteContactRepository(Path.Combine("contacts-data", "contacts.db"));\n// everything below uses contacts.Add / All / FindByName — never SQL'),
      page("Pitfalls"),
      { h: "A command outside its transaction" },
      sh("forgetting cmd.Transaction = tx", "System.InvalidOperationException: Execute requires the command to have a transaction object when the connection assigned to the command is in a pending local transaction."),
      { h: "Committing in a finally block" },
      "`finally { tx.Commit(); }` commits even when an insert failed — the opposite of all or nothing. Commit as the last line of the `try`, and let the `using` roll back otherwise.",
      { h: "A transaction per row" },
      "Starting and committing inside the loop makes fifty tiny transactions: no atomicity and much slower. One transaction around the whole loop.",
      page("Connections"),
      { ul: [ "**Back:** T1.8's BEGIN/COMMIT/ROLLBACK and ACID; unit 10's dependency inversion and fakes.", "**Next:** T1C's Entity Framework (`SaveChanges` is one transaction); T1F serves this repository over HTTP.", "**AQA:** 4.10.5 transactions and commitment ordering." ] },
      page("Good practice"),
      { ul: [ "Put all the SQL in the repository class; nothing else names a table.", "Keep each repository method one clear action, and one transaction when it changes several rows.", "Test the repository against a real SQLite file, and the rest of the program against a fake." ] },
      page("Practise"),
      { ul: [ "**Contacts on SQLite, milestone 3:** `Import` all or nothing. **Milestone 4:** the command line, your own tests, a clean build and a commit." ] },
      page("Quick reference"),
      cs("the shape", 'using var tx = connection.BeginTransaction();\ncmd.Transaction = tx;\n/* … every change … */\ntx.Commit();   // leaving without Commit rolls back'),
      { ul: [ "`BeginTransaction` · `cmd.Transaction = tx` · `Commit` · `Rollback` (or dispose without committing).", "One action, one transaction — and faster bulk inserts.", "A repository: the program's interface, the SQL behind it." ] },
      { table: { head: ["Message", "Means", "Page"], rows: [["Execute requires the command to have a transaction object", "a command not joined to the open transaction", "Pitfalls"]] } }
    ],
    flashcards: [
      ["How do you start a transaction from C#?", "connection.BeginTransaction()"],
      ["What must every command inside it set?", "cmd.Transaction = tx"],
      ["What happens if the using block ends without Commit?", "The transaction is rolled back."],
      ["Why are bulk inserts faster in a transaction?", "SQLite writes the file once at Commit instead of once per row."],
      ["What does a repository do?", "Hides the SQL behind an interface in the program's own types."],
      ["How do you test code that uses a repository without a database?", "Give it a fake repository that keeps rows in memory."]
    ],
    quiz: [
      { q: "An Import inserts 50 rows in one transaction; row 30 breaks a UNIQUE constraint and throws. Saved afterwards:", opts: ["29 rows", "50 rows", "0 rows", "30 rows"], ans: 2, why: "No Commit was reached, so the using rolls everything back." },
      { q: "`finally { tx.Commit(); }`…", opts: ["is the right pattern", "commits even after a failure", "rolls back", "does not compile"], ans: 1, why: "Commit belongs at the end of the successful path only." },
      { q: "Why does the command line take an IContactRepository?", opts: ["interfaces are faster", "so it never depends on SQL and a fake can stand in", "SQLite requires it", "to avoid using"], ans: 1, why: "Dependency inversion (10.9)." }
    ]
  });

  /* ================================================================
     command cards: typed, checked against anchored patterns
     ================================================================ */
  var short = function (s) { s = String(s).replace(/^(Type the |Name the |Which )/, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };
  K.add({ cards: {
    "t1b-ado": { title: "Commands and readers", lesson: "T1.9", concepts: ["ado-sqlite"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Type the command that adds SQLite's ADO.NET provider package to the project in src/Contacts.", "dotnet add src/Contacts package Microsoft.Data.Sqlite", ["^dotnet add (\\./)?src/Contacts(/Contacts\\.csproj)? package Microsoft\\.Data\\.Sqlite( (-v|--version) \\S+)?$"]],
          ["Which method runs an INSERT and returns how many rows changed?", "ExecuteNonQuery", ["^(cmd\\.|command\\.)?ExecuteNonQuery(\\(\\))?;?$"]],
          ["Which method runs a SELECT and gives back a reader over its rows?", "ExecuteReader", ["^(cmd\\.|command\\.)?ExecuteReader(\\(\\))?;?$"]],
          ["Which method returns just the first column of the first row, such as count(*)?", "ExecuteScalar", ["^(cmd\\.|command\\.)?ExecuteScalar(\\(\\))?;?$"]],
          ["Which reader method tells you a column holds NULL?", "IsDBNull", ["^(reader\\.|r\\.)?IsDBNull(\\(\\w*\\))?;?$"]],
          ["What do you pass as a parameter's value to store SQL NULL?", "DBNull.Value", ["^(System\\.)?DBNull\\.Value;?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], ci: true, hint: "ExecuteNonQuery · ExecuteReader · ExecuteScalar · IsDBNull · DBNull.Value." };
      } },
    "t1b-params": { title: "Parameters", lesson: "T1.10", concepts: ["sql-params"], kind: "command",
      vary: function (r) {
        var v = pick(r, ["name", "email", "city", "text"]);
        var q = pick(r, [
          ["Type the C# line that gives the placeholder $" + v + " in cmd the value of the variable " + v + ".", "cmd.Parameters.AddWithValue(\"$" + v + "\", " + v + ");", ["^cmd\\.Parameters\\.AddWithValue\\(\\s*\"[$@:]" + v + "\"\\s*,\\s*" + v + "\\s*\\);?$"]],
          ["Write the WHERE clause that matches the column " + v + " against a placeholder of the same name (SQLite's $ style).", "WHERE " + v + " = $" + v, ["^WHERE " + v + "\\s*=\\s*\\$" + v + ";?$"]],
          ["Name the attack that parameters prevent (three words).", "SQL injection", ["^(an? )?SQL[- ]injection( attack)?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(/the value of the variable \w+/, "a variable's value"), params: [v], answer: q[1], accept: q[2], ci: true, hint: "A placeholder in the SQL, its value through cmd.Parameters.AddWithValue." };
      } },
    "t1b-txn": { title: "Transactions from C#", lesson: "T1.11", concepts: ["ado-txn", "repository"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Type the line that starts a transaction on connection and keeps it in tx with a using declaration.", "using var tx = connection.BeginTransaction();", ["^using var tx = connection\\.BeginTransaction\\(\\);?$"]],
          ["Type the line that makes cmd part of the transaction tx.", "cmd.Transaction = tx;", ["^cmd\\.Transaction\\s*=\\s*tx;?$"]],
          ["Type the call that keeps every change made in the transaction tx.", "tx.Commit();", ["^tx\\.Commit\\(\\);?$"]],
          ["Type the call that undoes every change made in the transaction tx.", "tx.Rollback();", ["^tx\\.Rollback\\(\\);?$"]]
        ]);
        return { prompt: q[0], label: ["start a transaction", "join a command to it", "keep the changes", "undo the changes"][["using var tx = connection.BeginTransaction();", "cmd.Transaction = tx;", "tx.Commit();", "tx.Rollback();"].indexOf(q[1])], params: [], answer: q[1], accept: q[2], hint: "BeginTransaction · cmd.Transaction = tx · Commit · Rollback." };
      } }
  } });

  /* ================================================================
     the part's project and T1's taster: Contacts on SQLite; its files
     are generated into code-projects-files.js
     ================================================================ */
  var RUN = "src/Contacts.Cli/Contacts.Cli.csproj";
  K.project("rp-t1b-contacts", {
    unit: "T1B", title: "Contacts on SQLite", folder: "contacts-sqlite", solution: "ContactsSqlite.sln",
    scaffoldVersion: 1, minValidator: "1.1.0", sdk: ".NET 10 SDK",
    summary: "T1's taster: a contacts app over a SQLite file — a repository with parameters and a transaction, a command line, and your tests — built in Rider.",
    brief: [
      "A small contacts app: `src/Contacts` (a repository over SQLite — yours to build), `src/Contacts.Cli` (the command line), `tests/Contacts.Tests` (your tests) and Kurenai's acceptance tests for milestones 1–3 (`tests/Contacts.Acceptance`).",
      { ul: [
        "The table: `contacts (id INTEGER PRIMARY KEY, name TEXT NOT NULL CHECK (name <> ''), email TEXT UNIQUE)`, created when it is missing.",
        "Every value goes into SQL as a **parameter**; the validator refuses SQL glued together with `+` or `$\"…\"` in `src/Contacts`.",
        "`Directory.Build.props`, `tests/Contacts.Acceptance/` and `.kurenai/validate.cs` are **protected**.",
        "Microsoft.Data.Sqlite 10.0.5 is referenced, with the native SQLite pinned to a patched build."
      ] }
    ],
    milestones: [
      { id: "m1", title: "Connect and read", lessons: ["T1.9"], about: "Create the table when it is missing; Add (a blank name refused) and All in id order.", checks: [{ type: "tests", class: "Milestone1" }] },
      { id: "m2", title: "Parameters, never concatenation", lessons: ["T1.10"], about: "FindByName with a parameter: apostrophes work, SQL typed in stays text, and no SQL is glued together.",
        checks: [{ type: "tests", class: "Milestone2" }, { type: "source", path: "src/Contacts", contains: ["Parameters\\.Add"], forbids: ["\\$@?\"[^\"\\n]*\\b(SELECT|INSERT|UPDATE|DELETE)\\b", "\\b(SELECT|INSERT|UPDATE|DELETE)\\b[^\"\\n]*\"\\s*\\+"] }] },
      { id: "m3", title: "All or nothing", lessons: ["T1.11"], about: "Import every contact in one transaction, or none.", checks: [{ type: "tests", class: "Milestone3" }, { type: "source", path: "src/Contacts", contains: ["BeginTransaction"] }] },
      { id: "m4", title: "The command line, tested and committed", lessons: ["T1.9", "T1.10", "T1.11"], about: "src/Contacts.Cli answers every command and remembers between runs; five or more of your own tests; no warnings; committed.",
        checks: [
          { type: "run", project: RUN, stdin: "clear\nadd ann@x.uk Ann Lee\nadd - Bob O'Brien\nfind o'b\nfind zzz\nquit\n", contains: ["Cleared.", "Added #1 Ann Lee", "Added #2 Bob O'Brien", "#2 Bob O'Brien", "No match.", "Bye."] },
          { type: "run", project: RUN, stdin: "list\nquit\n", contains: ["#1 Ann Lee <ann@x.uk>", "#2 Bob O'Brien"] },
          { type: "owntests", prefix: "Contacts.Tests.", min: 5 }, { type: "warnings", max: 0 }, { type: "git" }
        ] }
    ],
    protected: ["Directory.Build.props", "tests/Contacts.Acceptance/Contacts.Acceptance.csproj", "tests/Contacts.Acceptance/TempDb.cs", "tests/Contacts.Acceptance/Milestone1.cs", "tests/Contacts.Acceptance/Milestone2.cs", "tests/Contacts.Acceptance/Milestone3.cs", ".kurenai/validate.cs"],
    reward: { xp: 120, gold: 30, hp: 8 }
  });
})();
