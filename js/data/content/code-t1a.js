/* Kurenai OS — data/content/code-t1a.js
   Code · T1 · Part A · Databases (docs/code-plan.md §3.3), the first part
   of track T1, Connectivity and persistence.

   SQL in the SQL sandbox: SQLite in WebAssembly in a sealed worker (Spike
   S; js/labs/sql-run.js), one fresh database a run, loaded with the
   lesson's dataset (`db`; js/data/content/code-t1-data.js: the café, its
   twin for hidden test cases (cafe2), and the Missing Mug). A run's output is its
   result tables as text, so tasks are checked like any program and a
   predicted answer may give just the values. Same contract as the core
   lessons (docs/code-plan.md §4); every program agrees with native SQLite
   (tools/sql_diff.mjs). The part ends in its project, The Case of the
   Missing Mug: five clue tasks on T1.8.                                  */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function run(id, cap, src, o) {
    o = o || {};
    var r = { id: id, cap: cap, src: src, lang: "sql" };
    if (o.db) r.db = o.db;
    if (o.fails) r.fails = true;
    return { run: r };
  }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  function uses(re, msg, id) { return { id: id || "uses", test: function (s) { return re.test(s); }, msg: msg }; }
  function noUse(re, msg, id) { return { id: id || "avoid", test: function (s) { return !re.test(s); }, msg: msg }; }
  var STARTER = "-- Write your query below.\n";

  K.add({ concepts: {
    "sql-tables": { name: "Tables, rows and keys", lesson: "T1.1", about: "rows of named columns; primary and foreign keys" },
    "sql-select": { name: "SELECT and WHERE", lesson: "T1.2", about: "choose columns, filter rows" },
    "sql-order": { name: "ORDER BY and LIMIT", lesson: "T1.2", about: "sort, then cut to size" },
    "sql-expr": { name: "Expressions and functions", lesson: "T1.3", about: "computed columns, CASE, text and date functions" },
    "sql-null": { name: "NULL", lesson: "T1.3", about: "unknown: IS NULL, coalesce, three-valued logic" },
    "sql-aggregate": { name: "Aggregates", lesson: "T1.4", about: "count, sum, avg, min, max" },
    "sql-group": { name: "GROUP BY and HAVING", lesson: "T1.4", about: "one row per group, groups filtered" },
    "sql-join": { name: "Inner joins", lesson: "T1.5", about: "rows matched through keys" },
    "sql-outer": { name: "Left joins", lesson: "T1.5", about: "keep the rows with no partner" },
    "sql-subquery": { name: "Subqueries and sets", lesson: "T1.6", about: "a query inside a query; UNION, EXCEPT" },
    "sql-cte-window": { name: "CTEs and window functions", lesson: "T1.6", about: "WITH, and rank or running totals over rows" },
    "sql-normal": { name: "Normalisation", lesson: "T1.7", about: "1NF, 2NF, 3NF: one fact in one place" },
    "sql-constraints": { name: "Constraints", lesson: "T1.7", about: "NOT NULL, UNIQUE, CHECK, foreign keys" },
    "sql-dml": { name: "Changing data", lesson: "T1.8", about: "INSERT, UPDATE, DELETE, an upsert" },
    "sql-transaction": { name: "Transactions", lesson: "T1.8", about: "all or nothing: BEGIN, COMMIT, ROLLBACK, ACID" },
    "sql-index": { name: "Indexes and query plans", lesson: "T1.8", about: "a lookup instead of a scan" }
  } });

  /* ================================================================
     T1.1 Tables, rows and keys
     ================================================================ */
  lesson("T1.1", {
    aqa: "4.10.2",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Unit 6 kept data in files: a CSV of marks, a JSON of settings. That works until two programs write at once, a line goes half-written, or you need \"every order by customers in Leeds\" from three files.",
        "A **database** keeps data in **tables** with fixed columns, checks every change against rules, answers questions in one language — **SQL** — and survives crashes.",
        "This part uses **SQLite**: a whole database in one file (here, in memory), the most used database engine in the world — it is inside every phone and browser."
      ] },
      page("Core idea"),
      run("look", "a table is rows of named columns", "SELECT * FROM customers;"),
      { ul: [
        "A **table** has a name (`customers`) and **columns** (`id`, `name`, `city`, `joined`); each **row** is one customer.",
        "`SELECT * FROM customers;` asks for every column (`*`) of every row. The `;` ends the statement.",
        "SQL keywords are not case-sensitive (`select` works); writing them in capitals is a convention that makes queries easy to read."
      ] },
      run("tables", "every table in the café's database", "SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name;"),
      run("columns", "a table's columns, types and key", "PRAGMA table_info(products);"),
      { ul: [
        "The café has four tables: `customers`, `products`, `orders` and `order_items`.",
        "`PRAGMA table_info` lists a table's columns: `type` is the declared type, `notnull` is 1 when a value is required, `pk` marks the **primary key**."
      ] },
      page("Rules"),
      { table: { head: ["Term", "Means", "In the café"], rows: [
        ["table (relation)", "a set of rows with the same columns", "`products`"],
        ["row (record, tuple)", "one thing the table is about", "Tea, drinks, 1.5, 40"],
        ["column (field, attribute)", "one property, with a type", "`price REAL`"],
        ["primary key", "a column (or columns) whose value picks out exactly one row", "`products.id`"],
        ["foreign key", "a column holding another table's primary key: a link", "`orders.customer_id` → `customers.id`"],
        ["composite key", "a primary key of two or more columns", "`order_items (order_id, product_id)`"]
      ] } },
      run("pk", "a primary key finds exactly one row", "SELECT * FROM products WHERE id = 3;"),
      run("fk", "a foreign key points at a row in another table", "SELECT * FROM orders WHERE customer_id = 1;"),
      { ul: [
        "A primary key is **unique** and **never NULL**; an `INTEGER PRIMARY KEY` in SQLite is numbered for you when you leave it out.",
        "A foreign key stores the *id* of a row elsewhere — `orders` does not copy Ada's name, it stores `customer_id = 1`. T1.5 joins them back together.",
        "A link table (`order_items`) turns a many-to-many relationship (an order has many products; a product is in many orders) into two one-to-many ones."
      ] },
      page("Variations"),
      { h: "A composite key" },
      run("composite", "order_items' key is two columns together", "PRAGMA table_info(order_items);"),
      { h: "Making your own table" },
      run("create", "CREATE TABLE, two INSERTs and a look", "CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT NOT NULL, kind TEXT);\nINSERT INTO pets (name, kind) VALUES ('Rex', 'dog');\nINSERT INTO pets (name, kind) VALUES ('Tom', 'cat');\nSELECT * FROM pets;"),
      { ul: [ "The ids were filled in for you: 1, then 2.", "Every run starts from the café's data again, so `pets` is gone the next time you run anything." ] },
      { h: "What type is a value?" },
      run("types", "SQLite stores INTEGER, REAL, TEXT, BLOB or NULL", "SELECT name, typeof(id), typeof(price), typeof(stock), typeof(name) FROM products WHERE id = 1;"),
      page("Pitfalls"),
      { h: "Two rows with the same primary key" },
      run("pit-dup", "the key must be unique, so SQLite refuses", "INSERT INTO customers VALUES (1, 'Ada again', 'Hull', '2026-10-01');"),
      { h: "A table name that does not exist" },
      run("pit-name", "customer, not customers", "SELECT * FROM customer;"),
      { h: "`SELECT *` in a program" },
      "Fine for a look around; in a program name the columns you need. A column added later would change the result's shape, and you would fetch data you never use.",
      page("Connections"),
      { ul: [ "**Back:** unit 6's CSV files — a table is a CSV with types, rules and a language.", "**Next:** T1.2 asks a table questions with `WHERE` and `ORDER BY`; T1.5 follows foreign keys with joins; T1.7 designs the tables.", "**AQA:** 4.10.2 relational databases (entity, attribute, primary, composite and foreign keys)." ] },
      page("Good practice"),
      { ul: [ "Name tables as plural nouns (`customers`) and columns as singular ones (`name`), lower case with underscores.", "Give every table a primary key, even when nothing seems to need it yet.", "Store the link (`customer_id`), never a copy of what it links to." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Columns, not stars* and *A table of your own*." ] },
      page("Quick reference"),
      run("qr", "look, find by key", "SELECT name, price FROM products WHERE id = 2;"),
      { ul: [ "`SELECT * FROM t;` every row and column · `PRAGMA table_info(t);` its columns.", "Primary key: unique, not NULL, one row. Foreign key: another table's primary key.", "`CREATE TABLE t (id INTEGER PRIMARY KEY, …);` then `INSERT INTO t (cols) VALUES (…);`" ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["UNIQUE constraint failed", "a second row with the same key", "Pitfalls"], ["no such table", "a misspelt (or missing) table name", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "SELECT count(*) FROM orders WHERE customer_id = 2;", why: "Kai (customer 2) placed orders 3 and 6.", concepts: ["sql-tables"] },
        { id: "p2", src: "SELECT name FROM products WHERE id = 6;", why: "The primary key 6 picks out exactly one row: the Mug.", concepts: ["sql-tables"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the query finds the product whose key is 4.", src: "SELECT name, price FROM products WHERE @@ = 4;", answer: "id", out: "name    | price\n--------+------\nBrownie | 2.5", concepts: ["sql-tables"] }
      ],
      bug: [
        { id: "b1", q: "It should list every customer's name and city.", src: "SELECT name, city FROM customer;", fix: "SELECT name, city FROM customers;", out: "name | city\n-----+------\nAda  | Leeds\nKai  | York\nMei  | Leeds\nSam  | NULL\nZoe  | Hull", fixedText: "five customers", why: "The table is customers — plural.", concepts: ["sql-tables"] }
      ]
    },
    flashcards: [
      ["What is a primary key?", "A column (or columns) whose value picks out exactly one row: unique and never NULL."],
      ["What is a foreign key?", "A column that holds another table's primary key — a link to a row there."],
      ["What is a composite key?", "A primary key made of two or more columns together, like order_items (order_id, product_id)."],
      ["How do you see a SQLite table's columns?", "PRAGMA table_info(table);"],
      ["Why store customer_id in orders, not the customer's name?", "One fact in one place: the name lives in customers; a change there is seen everywhere."],
      ["What does SELECT * mean?", "Every column, in table order."]
    ],
    quiz: [
      { q: "Which column is a foreign key?", opts: ["customers.id", "orders.customer_id", "products.name", "products.price"], ans: 1, why: "It holds a customers.id: a link to another table's row." },
      { q: "What does SQLite say to a second row with id 1 in customers?", opts: ["it replaces the first", "it adds both", "UNIQUE constraint failed: customers.id", "nothing until you SELECT"], ans: 2, why: "A primary key must be unique, so the INSERT is refused." },
      { q: "order_items has the key (order_id, product_id). Which can be stored?", opts: ["the same order twice with the same product", "one order with two different products", "an order_id that is NULL", "nothing without an id column"], ans: 1, why: "Only the pair must be unique; an order may have many products." }
    ]
  });
  K.add({ tasks: {
    "T1.1-cols": Object.assign({ lesson: "T1.1", title: "Columns, not stars", tier: "warm-up", minutes: 8, concepts: ["sql-tables"],
      statement: ["Show each product's `name`, `category` and `price` — those three columns, in that order — in id order (end with `ORDER BY id`; T1.2 explains it)."],
      starter: STARTER,
      rules: [noUse(/select\s+\*/i, "Name the three columns instead of *.", "nostar")],
      hints: ["SELECT name, category, price", "FROM products", "ORDER BY id;"],
      answer: "SELECT name, category, price FROM products ORDER BY id;" }, { examples: [{ db: "cafe", out: "name    | category | price\n--------+----------+------\nTea     | drinks   | 1.5\nCoffee  | drinks   | 2.2\nJuice   | drinks   | 1.8\nBrownie | bakery   | 2.5\nScone   | bakery   | 1.9\nMug     | gifts    | 8" }], hidden: [{ db: "cafe2", out: "name     | category | price\n---------+----------+------\nLatte    | drinks   | 2.6\nCocoa    | drinks   | 2.4\nMuffin   | bakery   | 2\nFlapjack | bakery   | 1.7\nTote     | gifts    | 6.5\nTea      | drinks   | 1.4\nCookie   | bakery   | 1.2" }] }),
    "T1.1-make": { lesson: "T1.1", title: "A table of your own", tier: "core", minutes: 12, concepts: ["sql-tables"],
      statement: ["Create a table `pets` with `id INTEGER PRIMARY KEY`, `name TEXT NOT NULL` and `kind TEXT`.", "Insert Rex (dog), Tom (cat) and Kiwi (bird) — one INSERT each, letting SQLite number them — then show every row with `SELECT * FROM pets;`."],
      starter: STARTER,
      examples: [{ db: "cafe", out: "1 row changed.\n1 row changed.\n1 row changed.\nid | name | kind\n---+------+-----\n1  | Rex  | dog\n2  | Tom  | cat\n3  | Kiwi | bird" }],
      rules: [uses(/create\s+table\s+pets/i, "Create the table pets.", "create"), uses(/integer\s+primary\s+key/i, "Make id an INTEGER PRIMARY KEY.", "pk")],
      hints: ["CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT NOT NULL, kind TEXT);", "INSERT INTO pets (name, kind) VALUES ('Rex', 'dog');", "Two more INSERTs, then SELECT * FROM pets;"],
      answer: "CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT NOT NULL, kind TEXT);\nINSERT INTO pets (name, kind) VALUES ('Rex', 'dog');\nINSERT INTO pets (name, kind) VALUES ('Tom', 'cat');\nINSERT INTO pets (name, kind) VALUES ('Kiwi', 'bird');\nSELECT * FROM pets;" }
  } });

  /* ================================================================
     T1.2 Reading: SELECT, WHERE, ORDER BY, LIMIT
     ================================================================ */
  lesson("T1.2", {
    aqa: "4.10.4",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A real table has thousands of rows. You want *some* columns of *some* rows, in an order you choose — \"the five cheapest drinks\", \"customers who joined this year\".",
        "In C# that is a loop with an `if` and a sort. In SQL you **describe the result** and the database works out how to get it.",
        "The skeleton every query in this part grows from: `SELECT columns FROM table WHERE condition ORDER BY columns LIMIT n;`"
      ] },
      page("Core idea"),
      run("where", "WHERE keeps the rows whose condition is true", "SELECT name, price FROM products WHERE price < 2;"),
      run("order", "ORDER BY sorts; DESC reverses", "SELECT name, price FROM products ORDER BY price DESC;"),
      { ul: [
        "`WHERE` is tested **once per row**: true keeps it, false (or unknown, T1.3) drops it.",
        "Comparisons: `=`, `<>` (or `!=`), `<`, `<=`, `>`, `>=`. Text goes in **single quotes**: `'drinks'`.",
        "`ORDER BY price` sorts ascending; add `DESC` for descending. **Without ORDER BY the order is not promised** — today's order may change when the table does."
      ] },
      run("limit", "LIMIT cuts the sorted result to size", "SELECT name, price FROM products ORDER BY price LIMIT 3;"),
      page("Rules"),
      { table: { head: ["Want", "Write"], rows: [
        ["both conditions", "`WHERE category = 'drinks' AND price < 2`"],
        ["either", "`WHERE category = 'gifts' OR stock < 5`"],
        ["one of a list", "`WHERE city IN ('Leeds', 'Hull')`"],
        ["a range (both ends included)", "`WHERE price BETWEEN 1.8 AND 2.5`"],
        ["a pattern", "`WHERE name LIKE 'C%'` — `%` any run of characters, `_` exactly one"],
        ["sort by two things", "`ORDER BY category, price DESC`"],
        ["skip, then take", "`LIMIT 2 OFFSET 2` — rows 3 and 4"],
        ["each value once", "`SELECT DISTINCT city FROM customers`"]
      ] } },
      { ul: [
        "The clauses always come in this order: `SELECT … FROM … WHERE … ORDER BY … LIMIT …`.",
        "`AND` binds tighter than `OR`: `a AND b OR c` means `(a AND b) OR c`. Use brackets whenever you mix them.",
        "`LIKE` ignores the case of ASCII letters in SQLite: `'c%'` matches Coffee."
      ] },
      run("and-or", "brackets decide what OR applies to", "SELECT name, category, price FROM products\nWHERE category = 'drinks' AND (price < 1.6 OR stock < 5)\nORDER BY name;"),
      page("Variations"),
      { h: "IN, BETWEEN and LIKE" },
      run("in", "three ways to describe which rows", "SELECT name FROM customers WHERE city IN ('Leeds', 'Hull') ORDER BY name;\nSELECT name FROM products WHERE price BETWEEN 1.8 AND 2.5 ORDER BY price;\nSELECT name FROM products WHERE name LIKE '%e%' ORDER BY name;"),
      { h: "Two sort keys" },
      run("two-keys", "category A–Z, then the dearest first within each", "SELECT category, name, price FROM products ORDER BY category, price DESC;"),
      { h: "A page at a time" },
      run("page", "page 2 of a list shown two at a time", "SELECT name FROM products ORDER BY name LIMIT 2 OFFSET 2;"),
      { h: "Each value once" },
      run("distinct", "DISTINCT removes repeated rows from the result", "SELECT DISTINCT category FROM products ORDER BY category;"),
      page("Pitfalls"),
      { h: "LIMIT before ORDER BY" },
      run("pit-orderlimit", "the clauses have a fixed order", "SELECT name FROM products LIMIT 2 ORDER BY price;"),
      { h: "A missing comma renames a column" },
      run("pit-comma", "`name price` means \"name, called price\" — no error, wrong result", "SELECT name price FROM products WHERE id = 1;"),
      { h: "AND and OR without brackets" },
      run("pit-andor", "meant: drinks that are cheap or nearly gone; got every product low on stock too", "SELECT name FROM products\nWHERE category = 'drinks' AND price < 1.6 OR stock < 5\nORDER BY name;"),
      page("Connections"),
      { ul: [ "**Back:** unit 9's LINQ — `Where`, `OrderBy`, `Take` and `Select` are the same ideas; LINQ even borrowed the words.", "**Next:** T1.3 computes new columns and meets NULL; T1.4 summarises with GROUP BY.", "**AQA:** 4.10.4 SQL: `SELECT`, `FROM`, `WHERE`, `ORDER BY`." ] },
      page("Good practice"),
      { ul: [ "Put each clause on its own line once a query is longer than one line.", "Always `ORDER BY` when the order matters to anyone.", "Bracket every mix of AND and OR." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Under two pounds* and *The newest customers*." ] },
      page("Quick reference"),
      run("qr", "the whole skeleton", "SELECT name, price FROM products WHERE category = 'drinks' ORDER BY price DESC LIMIT 2;"),
      { ul: [ "`SELECT cols FROM t WHERE cond ORDER BY cols [DESC] LIMIT n [OFFSET m];`", "`= <> < <= > >=`, `AND OR NOT`, `IN (…)`, `BETWEEN a AND b`, `LIKE 'pat%'`.", "`DISTINCT` drops repeated rows from the result." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["near \"ORDER\": syntax error", "a clause in the wrong place", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "SELECT name FROM products WHERE price BETWEEN 1.8 AND 2.2 ORDER BY price;", why: "BETWEEN includes both ends: Juice 1.8, Scone 1.9, Coffee 2.2.", concepts: ["sql-select", "sql-order"] },
        { id: "p2", src: "SELECT DISTINCT category FROM products ORDER BY category DESC;", why: "Three categories, Z–A: gifts, drinks, bakery.", concepts: ["sql-select", "sql-order"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so it shows the two customers who joined most recently, newest first.", src: "SELECT name FROM customers ORDER BY @@ LIMIT 2;", answer: "joined DESC", out: "name\n----\nZoe\nSam", concepts: ["sql-order"] }
      ],
      bug: [
        { id: "b1", q: "It should list the drinks that cost under £2 or over £2.40, A–Z.", src: "SELECT name FROM products\nWHERE category = 'drinks' AND price < 2 OR price > 2.4\nORDER BY name;", fix: "SELECT name FROM products\nWHERE category = 'drinks' AND (price < 2 OR price > 2.4)\nORDER BY name;", out: "name\n-----\nJuice\nTea", fixedText: "Juice and Tea only", why: "AND binds tighter than OR, so the Brownie and the Mug got in through the OR. Bracket the OR.", concepts: ["sql-select"] }
      ]
    },
    flashcards: [
      ["The order of a query's clauses?", "SELECT … FROM … WHERE … ORDER BY … LIMIT …"],
      ["Is a query's row order promised without ORDER BY?", "No — it may change when the table changes."],
      ["What does BETWEEN 2 AND 5 include?", "Both ends: 2 ≤ x ≤ 5."],
      ["In LIKE, what do % and _ match?", "% any run of characters (even none); _ exactly one."],
      ["`a AND b OR c` means…", "(a AND b) OR c — AND binds tighter. Use brackets."],
      ["How do you get rows 3 and 4 of a sorted list?", "ORDER BY … LIMIT 2 OFFSET 2"]
    ],
    quiz: [
      { q: "Which query lists the three dearest products?", opts: ["SELECT name FROM products LIMIT 3 ORDER BY price DESC;", "SELECT name FROM products ORDER BY price DESC LIMIT 3;", "SELECT TOP 3 name FROM products;", "SELECT name FROM products ORDER BY price LIMIT 3;"], ans: 1, why: "Sort descending, then LIMIT; LIMIT always comes last." },
      { q: "`WHERE name LIKE 'T%'` keeps…", opts: ["names exactly 'T%'", "names starting with T (or t)", "names ending with T", "names containing a %"], ans: 1, why: "% stands for any run of characters; LIKE ignores ASCII case in SQLite." },
      { q: "`SELECT name price FROM products;` gives…", opts: ["a syntax error", "two columns", "one column called price holding the names", "the prices only"], ans: 2, why: "Without the comma, price becomes an alias for name." }
    ]
  });
  K.add({ tasks: {
    "T1.2-cheap": Object.assign({ lesson: "T1.2", title: "Under two pounds", tier: "warm-up", minutes: 8, concepts: ["sql-select", "sql-order"],
      statement: ["List the products that cost **less than £2.00**: `name` and `price`, cheapest first (ties A–Z by name)."],
      starter: STARTER,
      rules: [uses(/where[\s\S]*price\s*</i, "Filter with WHERE price < …", "where"), uses(/order\s+by/i, "Sort with ORDER BY.", "order")],
      hints: ["SELECT name, price FROM products", "WHERE price < 2", "ORDER BY price, name;"],
      answer: "SELECT name, price FROM products WHERE price < 2 ORDER BY price, name;" }, { examples: [{ db: "cafe", out: "name  | price\n------+------\nTea   | 1.5\nJuice | 1.8\nScone | 1.9" }], hidden: [{ db: "cafe2", out: "name     | price\n---------+------\nCookie   | 1.2\nTea      | 1.4\nFlapjack | 1.7" }] }),
    "T1.2-recent": Object.assign({ lesson: "T1.2", title: "The newest customers", tier: "core", minutes: 10, concepts: ["sql-order"],
      statement: ["Show the **three** customers who joined most recently: `name` and `joined`, newest first (ties A–Z by name)."],
      starter: STARTER,
      rules: [uses(/order\s+by\s+joined\s+desc/i, "Sort by joined, newest first.", "desc"), uses(/limit\s+3/i, "Keep three rows with LIMIT.", "limit")],
      hints: ["Newest first is ORDER BY joined DESC.", "Break ties with a second key: , name", "LIMIT 3 comes last."],
      answer: "SELECT name, joined FROM customers ORDER BY joined DESC, name LIMIT 3;" }, { examples: [{ db: "cafe", out: "name | joined\n-----+-----------\nZoe  | 2026-04-01\nSam  | 2026-03-20\nMei  | 2026-03-02" }], hidden: [{ db: "cafe2", out: "name | joined\n-----+-----------\nUna  | 2026-06-30\nRay  | 2026-05-09\nIvy  | 2026-02-14" }] })
  } });

  /* ================================================================
     T1.3 Expressions, NULL and three-valued logic
     ================================================================ */
  lesson("T1.3", {
    aqa: "4.10.4",
    notes: [
      page("The problem it solves"),
      { ul: [
        "The data holds prices; you want prices with VAT. It holds names; you want them in capitals, or their first three letters. It holds stock counts; you want \"low\" or \"ok\".",
        "SQL computes new columns with **expressions**, just as C# does — operators, functions and a `CASE` that works like `switch`.",
        "And some values are **missing**: Sam has no city. SQL's `NULL` means *unknown*, and unknown changes how every comparison behaves."
      ] },
      page("Core idea"),
      run("computed", "a new column from an expression, named with AS", "SELECT name, price, round(price * 1.2, 2) AS with_vat FROM products ORDER BY id;"),
      run("text", "text functions and || to join text", "SELECT upper(name), length(name), substr(name, 1, 3), name || ' (' || category || ')' AS label\nFROM products ORDER BY id LIMIT 3;"),
      { ul: [
        "`AS with_vat` names the column; without it the column is called by its expression.",
        "Text: `upper`, `lower`, `length`, `substr(text, start, length)` (counting from 1), `replace`, `trim`, and `||` to join.",
        "Numbers: `+ - * / %`, `round(x, places)`, `abs`. Integer `/` integer is **integer division**, as in C#: `7 / 2` is 3."
      ] },
      run("null", "Sam's city is NULL: = NULL finds nothing, IS NULL finds him", "SELECT name FROM customers WHERE city = NULL;\nSELECT name FROM customers WHERE city IS NULL;"),
      page("Rules"),
      { table: { head: ["Expression", "Result when x is NULL"], rows: [
        ["`x = 1`, `x <> 1`, `x > 1`", "NULL (unknown) — WHERE drops the row"],
        ["`x IS NULL` / `x IS NOT NULL`", "true / false"],
        ["`x + 1`, `x || 'a'`", "NULL — unknown in, unknown out"],
        ["`coalesce(x, 'none')`", "'none' — the first value that is not NULL"],
        ["`count(*)` / `count(x)`", "counts every row / only rows where x is not NULL (T1.4)"]
      ] } },
      { ul: [
        "SQL has **three** truth values: true, false and unknown. `WHERE` keeps only **true** rows.",
        "`NOT unknown` is still unknown, so `WHERE NOT (city = 'Leeds')` drops Sam too.",
        "`CASE WHEN cond THEN a WHEN cond2 THEN b ELSE c END` picks the first true branch; with no ELSE and no match it gives NULL."
      ] },
      run("case", "CASE turns numbers into words", "SELECT name, stock,\n  CASE WHEN stock = 0 THEN 'out' WHEN stock <= 3 THEN 'low' ELSE 'ok' END AS level\nFROM products ORDER BY id;"),
      page("Variations"),
      { h: "Defaults for missing values" },
      run("coalesce", "coalesce and ifnull give NULL a stand-in", "SELECT name, coalesce(city, 'unknown') AS city FROM customers ORDER BY id;"),
      { h: "Integer and real division" },
      run("divide", "one REAL operand makes the division real", "SELECT 7 / 2, 7 / 2.0, 7 % 2, CAST(7 AS REAL) / 2;"),
      { h: "Dates are text in SQLite" },
      run("dates", "date functions read and write 'YYYY-MM-DD'", "SELECT name, joined, date(joined, '+30 days') AS trial_ends, strftime('%m', joined) AS month\nFROM customers ORDER BY joined LIMIT 3;"),
      { ul: [ "Stored as `'YYYY-MM-DD'` text, dates sort correctly as text and compare with `<` and `>`." ] },
      page("Pitfalls"),
      { h: "A misspelt function" },
      run("pit-func", "uper is not a function", "SELECT uper(name) FROM customers;"),
      { h: "<> drops the NULLs too" },
      run("pit-ne", "\"everyone not in Leeds\" forgets Sam", "SELECT name FROM customers WHERE city <> 'Leeds' ORDER BY name;"),
      { h: "Comparing with NULL" },
      "`= NULL` is never true. Use `IS NULL`, `IS NOT NULL`, or `IS` / `IS NOT` to compare two values that may be NULL: `city IS NOT 'Leeds'` keeps Sam.",
      page("Connections"),
      { ul: [ "**Back:** unit 7's nullable reference types — C# made you say when a value may be missing; SQL's NULL is that idea at the database's heart.", "**Next:** T1.4's aggregates skip NULLs; T1.5's left joins create them.", "**AQA:** 4.10.4 SQL." ] },
      page("Good practice"),
      { ul: [ "Name every computed column with AS.", "Decide what NULL means for each column — unknown, not applicable, not yet — and write it down.", "Store dates as 'YYYY-MM-DD' text (or numbers), never as '14/9/26'." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *With VAT* and *Stock levels*." ] },
      page("Quick reference"),
      run("qr", "a computed column, a CASE, a default", "SELECT name, price * 2 AS two, CASE WHEN price > 2 THEN 'dear' ELSE 'cheap' END AS feel FROM products WHERE id <= 2;"),
      { ul: [ "`expr AS name` · `||` joins text · `round(x, n)` · `7 / 2` is 3.", "`IS NULL`, `IS NOT NULL`, `coalesce(x, d)` — never `= NULL`.", "`CASE WHEN … THEN … ELSE … END`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["no such function", "a misspelt function name", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "SELECT 7 / 2, 7 / 2.0;", why: "Two integers divide as integers (3); one real makes it real (3.5).", concepts: ["sql-expr"] },
        { id: "p2", src: "SELECT count(*), count(city) FROM customers;", why: "count(*) counts all 5 rows; count(city) skips Sam's NULL: 4.", concepts: ["sql-null"] },
        { id: "p3", src: "SELECT name FROM customers WHERE city <> 'Leeds' ORDER BY name;", why: "Sam's city is NULL, so `<> 'Leeds'` is unknown for him and he is dropped: Kai and Zoe.", concepts: ["sql-null"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Sam's missing city shows as unknown.", src: "SELECT name, @@(city, 'unknown') AS city FROM customers WHERE id = 4;", answer: "coalesce", out: "name | city\n-----+--------\nSam  | unknown", concepts: ["sql-null"] }
      ],
      bug: [
        { id: "b1", q: "It should list everyone NOT in Leeds — including anyone whose city is unknown — A–Z.", src: "SELECT name FROM customers WHERE city <> 'Leeds' ORDER BY name;", fix: "SELECT name FROM customers WHERE city IS NOT 'Leeds' ORDER BY name;", out: "name\n----\nKai\nSam\nZoe", fixedText: "Kai, Sam and Zoe", why: "`<>` is unknown for a NULL city; `IS NOT` treats NULL as a value (or add OR city IS NULL).", concepts: ["sql-null"] }
      ]
    },
    flashcards: [
      ["What does NULL mean in SQL?", "Unknown (or missing) — not zero, not empty text."],
      ["What is `NULL = NULL`?", "NULL (unknown), so WHERE drops the row. Use IS NULL."],
      ["What does coalesce(a, b, c) return?", "The first of its arguments that is not NULL."],
      ["What is 7 / 2 in SQLite?", "3 — integer division; 7 / 2.0 is 3.5."],
      ["Which values of a WHERE condition keep a row?", "Only true; false and unknown both drop it."],
      ["How do you join two pieces of text in SQL?", "With ||, as in first || ' ' || last."]
    ],
    quiz: [
      { q: "Sam's city is NULL. Which query finds him?", opts: ["WHERE city = NULL", "WHERE city IS NULL", "WHERE city = ''", "WHERE NOT city"], ans: 1, why: "Only IS NULL is true for a NULL." },
      { q: "`SELECT 1 + NULL;` gives…", opts: ["1", "0", "NULL", "an error"], ans: 2, why: "Unknown in, unknown out." },
      { q: "A CASE with no ELSE and no matching WHEN gives…", opts: ["0", "an error", "NULL", "the first THEN"], ans: 2, why: "It falls through to NULL." }
    ]
  });
  K.add({ tasks: {
    "T1.3-vat": Object.assign({ lesson: "T1.3", title: "With VAT", tier: "warm-up", minutes: 8, concepts: ["sql-expr"],
      statement: ["For every product show `name`, `price` and `with_vat` — the price plus 20% VAT, **rounded to 2 places** — in id order."],
      starter: STARTER,
      rules: [uses(/round\s*\(/i, "Round with round(…, 2).", "round"), uses(/as\s+with_vat/i, "Name the column with_vat.", "alias")],
      hints: ["price * 1.2 adds 20%.", "round(price * 1.2, 2) AS with_vat", "ORDER BY id"],
      answer: "SELECT name, price, round(price * 1.2, 2) AS with_vat FROM products ORDER BY id;" }, { examples: [{ db: "cafe", out: "name    | price | with_vat\n--------+-------+---------\nTea     | 1.5   | 1.8\nCoffee  | 2.2   | 2.64\nJuice   | 1.8   | 2.16\nBrownie | 2.5   | 3\nScone   | 1.9   | 2.28\nMug     | 8     | 9.6" }], hidden: [{ db: "cafe2", out: "name     | price | with_vat\n---------+-------+---------\nLatte    | 2.6   | 3.12\nCocoa    | 2.4   | 2.88\nMuffin   | 2     | 2.4\nFlapjack | 1.7   | 2.04\nTote     | 6.5   | 7.8\nTea      | 1.4   | 1.68\nCookie   | 1.2   | 1.44" }] }),
    "T1.3-level": Object.assign({ lesson: "T1.3", title: "Stock levels", tier: "core", minutes: 12, concepts: ["sql-expr"],
      statement: ["Show every product's `name` and `level`: `out` when its stock is 0, `low` when it is 1 to 3, otherwise `ok`. In id order."],
      starter: STARTER,
      rules: [uses(/case[\s\S]*when[\s\S]*end/i, "Use CASE WHEN … END.", "case")],
      hints: ["CASE WHEN stock = 0 THEN 'out'", "WHEN stock <= 3 THEN 'low' ELSE 'ok' END AS level", "The first true WHEN wins, so test 0 before ≤ 3."],
      answer: "SELECT name, CASE WHEN stock = 0 THEN 'out' WHEN stock <= 3 THEN 'low' ELSE 'ok' END AS level FROM products ORDER BY id;" }, { examples: [{ db: "cafe", out: "name    | level\n--------+------\nTea     | ok\nCoffee  | ok\nJuice   | ok\nBrownie | ok\nScone   | low\nMug     | low" }], hidden: [{ db: "cafe2", out: "name     | level\n---------+------\nLatte    | ok\nCocoa    | low\nMuffin   | ok\nFlapjack | out\nTote     | ok\nTea      | ok\nCookie   | low" }] })
  } });

  /* ================================================================
     T1.4 Aggregates: GROUP BY and HAVING
     ================================================================ */
  lesson("T1.4", {
    aqa: "4.10.4",
    notes: [
      page("The problem it solves"),
      { ul: [
        "\"How many products do we sell?\" \"What is our average price — per category?\" \"Which categories hold more than ten in stock?\"",
        "Those questions want **one answer per table** or **one row per group**, not a row per product.",
        "**Aggregate functions** fold many rows into one value; **GROUP BY** makes one row per group; **HAVING** filters the groups."
      ] },
      page("Core idea"),
      run("whole", "five aggregates over the whole table", "SELECT count(*) AS products, sum(stock) AS units, min(price) AS cheapest, max(price) AS dearest, round(avg(price), 2) AS average\nFROM products;"),
      run("group", "GROUP BY: one row per category", "SELECT category, count(*) AS products, sum(stock) AS units\nFROM products\nGROUP BY category\nORDER BY category;"),
      { ul: [
        "`count(*)` counts rows; `count(col)`, `sum`, `avg`, `min` and `max` **skip NULLs**.",
        "With `GROUP BY category`, the rows are put into piles by category and each aggregate runs **once per pile**.",
        "Every column you SELECT must be either in the GROUP BY or inside an aggregate — a pile has one category but many prices."
      ] },
      run("having", "HAVING filters the groups after they are made", "SELECT category, sum(stock) AS units\nFROM products\nGROUP BY category\nHAVING sum(stock) > 10\nORDER BY units DESC;"),
      page("Rules"),
      { table: { head: ["Step", "Clause", "Works on"], rows: [
        ["1", "`FROM`", "the table's rows"],
        ["2", "`WHERE`", "each row — before grouping"],
        ["3", "`GROUP BY`", "makes the piles"],
        ["4", "`HAVING`", "each pile — after grouping, can use aggregates"],
        ["5", "`SELECT`", "one output row per pile"],
        ["6", "`ORDER BY`, `LIMIT`", "the output rows"]
      ] } },
      { ul: [
        "So `WHERE` cannot use `count(*)` (no piles exist yet) and `HAVING` can.",
        "Filter rows with WHERE when you can: fewer rows go into the piles.",
        "`avg` of whole numbers gives a REAL; `round(avg(x), 2)` tidies it."
      ] },
      run("where-having", "WHERE drops rows, then HAVING drops piles", "SELECT category, count(*) AS cheap_items\nFROM products\nWHERE price < 2.4\nGROUP BY category\nHAVING count(*) >= 2;"),
      page("Variations"),
      { h: "Counting distinct values" },
      run("distinct", "how many cities, not how many customers", "SELECT count(city) AS with_city, count(DISTINCT city) AS cities FROM customers;"),
      { h: "Grouping by an expression" },
      run("month", "orders per month of the year", "SELECT strftime('%Y-%m', placed) AS month, count(*) AS orders\nFROM orders GROUP BY month ORDER BY month;"),
      { h: "An aggregate of an expression" },
      run("value", "the stock's value per category", "SELECT category, round(sum(price * stock), 2) AS stock_value\nFROM products GROUP BY category ORDER BY stock_value DESC;"),
      page("Pitfalls"),
      { h: "An aggregate in WHERE" },
      run("pit-where", "WHERE runs before there are groups to count", "SELECT category FROM products WHERE count(*) > 1 GROUP BY category;"),
      { h: "A bare column beside an aggregate" },
      run("pit-bare", "SQLite allows it and picks a row; most databases refuse", "SELECT name, max(price) FROM products;"),
      { ul: [ "SQLite gives the Mug because it came from the row that had the max — a SQLite rule. PostgreSQL and SQL Server reject the query; T1.6 shows the portable way." ] },
      { h: "count(col) is not count(*)" },
      "`count(city)` skips the NULLs; when you mean \"how many rows\", write `count(*)`.",
      page("Connections"),
      { ul: [ "**Back:** unit 9's LINQ `GroupBy`, `Count`, `Sum` and `Average`.", "**Next:** T1.5 groups across joined tables — totals per customer, sales per product.", "**AQA:** 4.10.4 SQL." ] },
      page("Good practice"),
      { ul: [ "Name every aggregate column with AS so ORDER BY and HAVING can read it.", "Put each GROUP BY column in the SELECT too — a group you cannot see is a puzzle.", "Read a grouped query in its running order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Per category* and *Regulars*." ] },
      page("Quick reference"),
      run("qr", "group, filter the groups, sort", "SELECT category, count(*) AS n FROM products GROUP BY category HAVING n > 1 ORDER BY n DESC;"),
      { ul: [ "`count(*) count(x) sum avg min max` — all but count(*) skip NULLs.", "`GROUP BY cols` → one row per group; `HAVING cond` filters groups.", "Order of work: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["misuse of aggregate", "an aggregate where no groups exist yet (WHERE)", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "SELECT category, count(*) FROM products GROUP BY category ORDER BY category;", why: "Two bakery items, three drinks, one gift.", concepts: ["sql-group"] },
        { id: "p2", src: "SELECT sum(qty) FROM order_items WHERE product_id = 2;", why: "Coffee was ordered 1 + 3 + 2 = 6 times.", concepts: ["sql-aggregate"] }
      ],
      fill: [
        { id: "f1", q: "Fill both gaps (the same thing twice) so it shows the categories holding more than 10 units.", src: "SELECT category, @@ AS units FROM products GROUP BY category HAVING @@ > 10 ORDER BY category;", answer: ["sum(stock)", "sum(stock)"], out: "category | units\n---------+------\nbakery   | 15\ndrinks   | 69", concepts: ["sql-group"] }
      ],
      bug: [
        { id: "b1", q: "It should list the categories with at least two products, A–Z.", src: "SELECT category FROM products GROUP BY category HAVING count(*) > 2 ORDER BY category;", fix: "SELECT category FROM products GROUP BY category HAVING count(*) >= 2 ORDER BY category;", out: "category\n--------\nbakery\ndrinks", fixedText: "bakery and drinks", why: "\"At least two\" is >= 2; > 2 lost the bakery with exactly two.", concepts: ["sql-group"] }
      ]
    },
    flashcards: [
      ["Which aggregates skip NULL?", "All of them except count(*): count(x), sum, avg, min, max."],
      ["WHERE or HAVING to filter by count(*)?", "HAVING — WHERE runs before the groups exist."],
      ["What may you SELECT in a grouped query?", "The GROUP BY columns and aggregates."],
      ["The order a grouped query runs in?", "FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT."],
      ["How do you count different cities?", "count(DISTINCT city)"],
      ["What type does avg of integers give?", "REAL — round it with round(avg(x), 2)."]
    ],
    quiz: [
      { q: "Which filters categories whose average price is over £2?", opts: ["WHERE avg(price) > 2", "HAVING avg(price) > 2", "GROUP BY avg(price) > 2", "ORDER BY avg(price) > 2"], ans: 1, why: "A condition on an aggregate belongs in HAVING." },
      { q: "`SELECT category, name FROM products GROUP BY category;` is a problem because…", opts: ["GROUP BY needs ORDER BY", "a category has many names", "category is text", "nothing"], ans: 1, why: "name is neither grouped nor aggregated; SQLite picks one, other databases refuse." },
      { q: "count(*) and count(city) differ when…", opts: ["some cities repeat", "some cities are NULL", "the table is sorted", "never"], ans: 1, why: "count(city) skips NULLs." }
    ]
  });
  K.add({ tasks: {
    "T1.4-cats": Object.assign({ lesson: "T1.4", title: "Per category", tier: "warm-up", minutes: 10, concepts: ["sql-aggregate", "sql-group"],
      statement: ["One row per category: `category`, `products` (how many) and `avg_price` (the average price rounded to 2 places), A–Z by category."],
      starter: STARTER,
      rules: [uses(/group\s+by\s+category/i, "Group by category.", "group")],
      hints: ["GROUP BY category", "count(*) AS products, round(avg(price), 2) AS avg_price", "ORDER BY category"],
      answer: "SELECT category, count(*) AS products, round(avg(price), 2) AS avg_price FROM products GROUP BY category ORDER BY category;" }, { examples: [{ db: "cafe", out: "category | products | avg_price\n---------+----------+----------\nbakery   | 2        | 2.2\ndrinks   | 3        | 1.83\ngifts    | 1        | 8" }], hidden: [{ db: "cafe2", out: "category | products | avg_price\n---------+----------+----------\nbakery   | 3        | 1.63\ndrinks   | 3        | 2.13\ngifts    | 1        | 6.5" }] }),
    "T1.4-busy": Object.assign({ lesson: "T1.4", title: "Regulars", tier: "core", minutes: 12, concepts: ["sql-group"],
      statement: ["From `orders` alone, find the customers with **two or more** orders: `customer_id` and `orders`, most orders first, ties by customer_id. Orders with no customer don't count."],
      starter: STARTER,
      rules: [uses(/having/i, "Filter the groups with HAVING.", "having"), uses(/is\s+not\s+null/i, "Leave out orders whose customer_id IS NULL.", "notnull")],
      hints: ["WHERE customer_id IS NOT NULL drops the anonymous order.", "GROUP BY customer_id, count(*) AS orders", "HAVING count(*) >= 2 ORDER BY orders DESC, customer_id"],
      answer: "SELECT customer_id, count(*) AS orders FROM orders WHERE customer_id IS NOT NULL GROUP BY customer_id HAVING count(*) >= 2 ORDER BY orders DESC, customer_id;" }, { examples: [{ db: "cafe", out: "customer_id | orders\n------------+-------\n1           | 2\n2           | 2" }], hidden: [{ db: "cafe2", out: "customer_id | orders\n------------+-------\n3           | 2" }] })
  } });

  /* ================================================================
     T1.5 Joins: inner, left, self and many-to-many
     ================================================================ */
  lesson("T1.5", {
    aqa: "4.10.4",
    notes: [
      page("The problem it solves"),
      { ul: [
        "T1.1 split the café into tables so each fact lives in one place: an order stores `customer_id = 1`, not \"Ada, Leeds\".",
        "So \"who placed order 3, and what did they buy?\" needs rows from three tables at once.",
        "A **join** puts rows side by side wherever their keys match — the foreign key meets the primary key it points at."
      ] },
      page("Core idea"),
      run("inner", "each order beside the customer it points at", "SELECT o.id, c.name, o.placed\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.id;"),
      { ul: [
        "`FROM orders o JOIN customers c ON c.id = o.customer_id` pairs each order with the customer whose id matches. `o` and `c` are **aliases** — short names for the tables.",
        "An **inner join** keeps only rows that found a partner: order 5 has no customer, so it is missing.",
        "Write `table.column` (`c.name`) whenever two tables share a column name."
      ] },
      run("lines", "order lines with each product's name and the line total", "SELECT i.order_id, p.name, i.qty, round(p.price * i.qty, 2) AS line_total\nFROM order_items i\nJOIN products p ON p.id = i.product_id\nORDER BY i.order_id, p.name;"),
      run("three", "three tables: who bought what in order 3", "SELECT c.name AS customer, p.name AS product, i.qty\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON p.id = i.product_id\nWHERE o.id = 3\nORDER BY p.name;"),
      page("Rules"),
      { table: { head: ["Join", "Keeps"], rows: [
        ["`JOIN` (inner)", "only rows with a match on both sides"],
        ["`LEFT JOIN`", "every row of the left table; NULLs where the right had no match"],
        ["`CROSS JOIN` (or `FROM a, b`)", "every row with every row — rarely what you want"],
        ["a self join", "a table joined to itself under two aliases"]
      ] } },
      { ul: [
        "A many-to-many relationship (orders ↔ products) needs a **link table** (`order_items`) and two joins.",
        "A `LEFT JOIN` followed by `WHERE right.id IS NULL` finds rows with **no** partner — an anti-join.",
        "Count a LEFT JOIN's right side with `count(right.column)`: `count(*)` would count the NULL row as one."
      ] },
      run("left", "every customer, with or without orders", "SELECT c.name, count(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY c.name;"),
      page("Variations"),
      { h: "Who has never ordered?" },
      run("anti", "LEFT JOIN, then keep the rows with no partner", "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL\nORDER BY c.name;"),
      { h: "A self join" },
      run("self", "pairs of customers from the same city", "SELECT a.name, b.name, a.city\nFROM customers a\nJOIN customers b ON a.city = b.city AND a.id < b.id;"),
      { ul: [ "`a.id < b.id` keeps each pair once and never pairs someone with themself." ] },
      { h: "Totals across a join" },
      run("totals", "each order's total, dearest first", "SELECT o.id, round(sum(p.price * i.qty), 2) AS total\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON p.id = i.product_id\nGROUP BY o.id\nORDER BY total DESC;"),
      page("Pitfalls"),
      { h: "An ambiguous column" },
      run("pit-ambiguous", "both tables have an id", "SELECT id, name\nFROM orders\nJOIN customers ON customers.id = orders.customer_id;"),
      { h: "A join with no ON" },
      run("pit-cross", "6 orders × 5 customers: every pairing", "SELECT count(*) FROM orders, customers;"),
      { h: "A WHERE that undoes a LEFT JOIN" },
      "`LEFT JOIN orders o … WHERE o.placed > '2026-09-05'` drops the customers with no orders again — their `o.placed` is NULL. Put such a condition in the `ON` instead.",
      page("Connections"),
      { ul: [ "**Back:** unit 9's LINQ `Join` and `GroupJoin`.", "**Next:** T1.6 uses joins inside subqueries and CTEs; T1.7 explains why the tables were split.", "**AQA:** 4.10.4 SQL: retrieving data from multiple tables." ] },
      page("Good practice"),
      { ul: [ "Alias every table in a join and prefix every column.", "Join on keys: a foreign key to the primary key it names.", "Ask \"should rows with no match stay?\" — then choose JOIN or LEFT JOIN on purpose." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Order lines* and *Who spent what*." ] },
      page("Quick reference"),
      run("qr", "inner and left side by side", "SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE c.id IN (1, 4) ORDER BY c.name, o.id;"),
      { ul: [ "`FROM a JOIN b ON b.key = a.fk` — matches only.", "`FROM a LEFT JOIN b ON …` — every a; NULL where no b. `WHERE b.id IS NULL` keeps the unmatched.", "Many-to-many: through the link table, two joins." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["ambiguous column name", "a column in both tables, written without its table", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "SELECT count(*) FROM orders o JOIN customers c ON c.id = o.customer_id;", why: "Six orders, but order 5 has no customer, so the inner join keeps 5.", concepts: ["sql-join"] },
        { id: "p2", src: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL ORDER BY c.name;", why: "Sam and Zoe have no orders; the anti-join keeps exactly them.", concepts: ["sql-outer"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so each line of order 3 shows its product's name.", src: "SELECT p.name, i.qty FROM order_items i JOIN products p ON p.id = @@ WHERE i.order_id = 3 ORDER BY p.name;", answer: "i.product_id", out: "name  | qty\n------+----\nMug   | 1\nScone | 2\nTea   | 1", concepts: ["sql-join"] }
      ],
      bug: [
        { id: "b1", q: "It should list EVERY customer with their number of orders — 0 for those with none — A–Z.", src: "SELECT c.name, count(o.id) AS orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY c.name;", fix: "SELECT c.name, count(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY c.name;", out: "name | orders\n-----+-------\nAda  | 2\nKai  | 2\nMei  | 1\nSam  | 0\nZoe  | 0", fixedText: "Sam and Zoe with 0", why: "An inner join drops customers with no orders; LEFT JOIN keeps them, and count(o.id) counts their NULL as 0.", concepts: ["sql-outer"] }
      ]
    },
    flashcards: [
      ["What does an inner join keep?", "Only rows that found a match on both sides."],
      ["What does a LEFT JOIN keep?", "Every row of the left table, with NULLs where the right had no match."],
      ["How do you find customers with no orders?", "LEFT JOIN orders … WHERE o.id IS NULL — an anti-join."],
      ["Why count(o.id), not count(*), after a LEFT JOIN?", "count(*) counts the unmatched NULL row as 1; count(o.id) counts it as 0."],
      ["How is many-to-many stored?", "In a link table holding both foreign keys (order_items)."],
      ["What does FROM a, b with no condition give?", "Every row of a with every row of b — a cross join."]
    ],
    quiz: [
      { q: "Orders has 6 rows, one with customer_id NULL. `orders JOIN customers` gives…", opts: ["6 rows", "5 rows", "30 rows", "an error"], ans: 1, why: "The order with no customer has no match." },
      { q: "`ambiguous column name: id` means…", opts: ["id is misspelt", "both joined tables have an id; prefix it", "id is NULL", "the join has no ON"], ans: 1, why: "Write o.id or c.id." },
      { q: "`LEFT JOIN orders o ON … WHERE o.placed > '2026-09-05'` loses the customers with no orders because…", opts: ["LEFT JOIN never keeps them", "their o.placed is NULL, so WHERE drops them", "dates cannot be compared", "it needs GROUP BY"], ans: 1, why: "Move the condition into ON to keep them." }
    ]
  });
  K.add({ tasks: {
    "T1.5-lines": Object.assign({ lesson: "T1.5", title: "Order lines", tier: "warm-up", minutes: 10, concepts: ["sql-join"],
      statement: ["Every order line: `order_id`, `product` (the product's name), `qty` and `line_total` (price × qty, rounded to 2), by order_id and then product A–Z."],
      starter: STARTER,
      rules: [uses(/join\s+products/i, "Join order_items to products.", "join")],
      hints: ["FROM order_items i JOIN products p ON p.id = i.product_id", "p.name AS product, round(p.price * i.qty, 2) AS line_total", "ORDER BY i.order_id, product"],
      answer: "SELECT i.order_id, p.name AS product, i.qty, round(p.price * i.qty, 2) AS line_total FROM order_items i JOIN products p ON p.id = i.product_id ORDER BY i.order_id, product;" }, { examples: [{ db: "cafe", out: "order_id | product | qty | line_total\n---------+---------+-----+-----------\n1        | Brownie | 1   | 2.5\n1        | Tea     | 2   | 3\n2        | Coffee  | 1   | 2.2\n3        | Mug     | 1   | 8\n3        | Scone   | 2   | 3.8\n3        | Tea     | 1   | 1.5\n4        | Coffee  | 3   | 6.6\n5        | Juice   | 1   | 1.8\n6        | Brownie | 2   | 5\n6        | Coffee  | 2   | 4.4" }], hidden: [{ db: "cafe2", out: "order_id | product | qty | line_total\n---------+---------+-----+-----------\n1        | Latte   | 1   | 2.6\n1        | Muffin  | 2   | 4\n2        | Tea     | 4   | 5.6\n3        | Cookie  | 3   | 3.6\n3        | Tote    | 1   | 6.5\n4        | Cocoa   | 1   | 2.4\n5        | Latte   | 2   | 5.2\n5        | Muffin  | 1   | 2" }] }),
    "T1.5-spend": Object.assign({ lesson: "T1.5", title: "Who spent what", tier: "core", minutes: 15, concepts: ["sql-join", "sql-outer"],
      statement: ["Every customer's `name` and `spent`: the total of price × qty over all their orders, rounded to 2. Customers who never ordered show **0**. Most spent first, ties A–Z."],
      starter: STARTER,
      rules: [uses(/left\s+join/i, "Keep customers with no orders: LEFT JOIN.", "left"), uses(/coalesce|ifnull/i, "Turn a missing total into 0 with coalesce.", "zero")],
      hints: ["customers c LEFT JOIN orders o … LEFT JOIN order_items i … LEFT JOIN products p …", "GROUP BY c.id; sum(p.price * i.qty) is NULL for someone with no orders.", "coalesce(round(sum(p.price * i.qty), 2), 0) AS spent"],
      answer: "SELECT c.name, coalesce(round(sum(p.price * i.qty), 2), 0) AS spent\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nLEFT JOIN order_items i ON i.order_id = o.id\nLEFT JOIN products p ON p.id = i.product_id\nGROUP BY c.id\nORDER BY spent DESC, c.name;" }, { examples: [{ db: "cafe", out: "name | spent\n-----+------\nKai  | 22.7\nAda  | 7.7\nMei  | 6.6\nSam  | 0\nZoe  | 0" }], hidden: [{ db: "cafe2", out: "name | spent\n-----+------\nRay  | 12.2\nBo   | 10.1\nUna  | 7.2\nIvy  | 0" }] })
  } });

  /* ================================================================
     T1.6 Subqueries, sets, CTEs and windows
     ================================================================ */
  lesson("T1.6", {
    aqa: "4.10.4",
    notes: [
      page("The problem it solves"),
      { ul: [
        "\"Products dearer than average\" needs the average first, then a comparison. \"Customers who never ordered\" needs a list to check against.",
        "SQL nests: a **subquery** is a query inside another. **WITH** (a CTE) names a step so a long query reads top to bottom.",
        "**Window functions** rank and total across rows *without* folding them into groups — the dearest product in each category, a running total."
      ] },
      page("Core idea"),
      run("scalar", "a subquery that gives one value", "SELECT name, price FROM products\nWHERE price > (SELECT avg(price) FROM products);"),
      run("in", "a subquery that gives a list", "SELECT name FROM customers\nWHERE id IN (SELECT customer_id FROM orders WHERE placed >= '2026-09-10')\nORDER BY name;"),
      { ul: [
        "A subquery in brackets runs and hands its result to the outer query: one value for `>`, a list for `IN`.",
        "`EXISTS (subquery)` is true when the subquery returns any row — often clearer than `IN` and safe with NULLs.",
        "A **correlated** subquery mentions the outer row (`o.customer_id = c.id`) and runs once per row."
      ] },
      run("cte", "WITH names a step; the query reads in order", "WITH totals AS (\n  SELECT order_id, sum(qty) AS items FROM order_items GROUP BY order_id\n)\nSELECT order_id, items FROM totals WHERE items >= 3 ORDER BY order_id;"),
      page("Rules"),
      { table: { head: ["Tool", "Gives", "Example"], rows: [
        ["scalar subquery", "one value", "`price > (SELECT avg(price) FROM products)`"],
        ["`IN (subquery)`", "membership of a list", "`id IN (SELECT customer_id FROM orders)`"],
        ["`EXISTS (subquery)`", "true if any row", "`WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`"],
        ["`UNION` / `UNION ALL`", "rows of both (without / with repeats)", "two lists of names in one"],
        ["`INTERSECT` / `EXCEPT`", "rows in both / in the first only", "ids ordered EXCEPT ids delivered"],
        ["`WITH name AS (…)`", "a named step (CTE)", "build totals, then filter them"],
        ["`f() OVER (PARTITION BY … ORDER BY …)`", "a value per row from its window", "`rank() OVER (PARTITION BY category ORDER BY price DESC)`"]
      ] } },
      { ul: [
        "Set operators need the same number of columns on both sides; `ORDER BY` goes once, at the very end.",
        "A window function keeps every row: `rank()`, `row_number()`, `sum(x) OVER (ORDER BY …)` for a running total.",
        "Windows are computed after WHERE and GROUP BY, so to filter on a rank, put it in a CTE and filter outside."
      ] },
      run("rank", "the price rank inside each category", "SELECT category, name, price,\n  rank() OVER (PARTITION BY category ORDER BY price DESC) AS r\nFROM products\nORDER BY category, r;"),
      page("Variations"),
      { h: "The portable way to get the dearest product" },
      run("dearest", "compare with the max instead of a bare column (T1.4's pitfall)", "SELECT name, price FROM products WHERE price = (SELECT max(price) FROM products);"),
      { h: "A correlated subquery as a column" },
      run("correlated", "each customer's order count, without GROUP BY", "SELECT name, (SELECT count(*) FROM orders o WHERE o.customer_id = c.id) AS orders\nFROM customers c ORDER BY c.id;"),
      { h: "UNION and EXCEPT" },
      run("sets", "two lists made one; one list minus another", "SELECT name FROM customers WHERE city = 'Leeds'\nUNION\nSELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.placed >= '2026-09-10'\nORDER BY name;\nSELECT id FROM customers EXCEPT SELECT customer_id FROM orders;"),
      { h: "A running total" },
      run("running", "sum OVER an order: each row adds to the last", "SELECT order_id, product_id, qty,\n  sum(qty) OVER (ORDER BY order_id, product_id) AS running\nFROM order_items\nORDER BY order_id, product_id;"),
      { h: "The best in each group" },
      run("best", "filter on a rank in the step after it", "WITH ranked AS (\n  SELECT category, name, price, rank() OVER (PARTITION BY category ORDER BY price DESC) AS r FROM products\n)\nSELECT category, name, price FROM ranked WHERE r = 1 ORDER BY category;"),
      page("Pitfalls"),
      { h: "A window function in WHERE" },
      run("pit-window", "the ranks do not exist yet when WHERE runs", "SELECT name FROM products WHERE rank() OVER (ORDER BY price) = 1;"),
      { h: "NOT IN and a NULL" },
      run("pit-notin", "order 5's customer_id is NULL, so NOT IN is never true", "SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);"),
      { ul: [ "`x NOT IN (1, 2, NULL)` means x <> 1 AND x <> 2 AND x <> NULL — and the last is unknown. Use `NOT EXISTS`, or filter the NULLs out of the subquery." ] },
      { h: "A scalar subquery with many rows" },
      "SQLite quietly takes the first row; most databases raise an error. Make sure a scalar subquery can only return one value (an aggregate, or a key).",
      page("Connections"),
      { ul: [ "**Back:** T1.4's grouping — windows are aggregates that keep the rows.", "**Next:** T1.8 uses subqueries to choose which rows to change; The Missing Mug's last clue needs one.", "**AQA:** 4.10.4 SQL (nested queries)." ] },
      page("Good practice"),
      { ul: [ "Prefer a CTE to a subquery nested three deep: name each step.", "Use NOT EXISTS, not NOT IN, when the list could hold a NULL.", "Give a window an ORDER BY whenever the order matters to its answer." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Above their own average* and *Rank within category*." ] },
      page("Quick reference"),
      run("qr", "a CTE, a rank, a filter", "WITH r AS (SELECT name, rank() OVER (ORDER BY price) AS n FROM products) SELECT name FROM r WHERE n <= 2 ORDER BY n;"),
      { ul: [ "Subquery: one value, a list (IN) or a test (EXISTS).", "`UNION` `UNION ALL` `INTERSECT` `EXCEPT` — same columns, one ORDER BY at the end.", "`WITH s AS (…) SELECT … FROM s` · `rank() OVER (PARTITION BY g ORDER BY x)`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["misuse of window function", "a window function in WHERE (or GROUP BY)", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "SELECT name FROM products WHERE price > (SELECT avg(price) FROM products) ORDER BY name;", why: "The average is 17.9 / 6 ≈ 2.98, and only the Mug costs more.", concepts: ["sql-subquery"] },
        { id: "p2", src: "WITH n AS (SELECT customer_id, count(*) AS c FROM orders GROUP BY customer_id)\nSELECT max(c) FROM n;", why: "Ada and Kai have two orders each; nobody has more.", concepts: ["sql-cte-window"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so rank 1 is the dearest product.", src: "SELECT name, price, rank() OVER (ORDER BY price @@) AS r FROM products ORDER BY r LIMIT 3;", answer: "DESC", out: "name    | price | r\n--------+-------+--\nMug     | 8     | 1\nBrownie | 2.5   | 2\nCoffee  | 2.2   | 3", concepts: ["sql-cte-window"] }
      ],
      bug: [
        { id: "b1", q: "It should list the customers who never placed an order, A–Z.", src: "SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders) ORDER BY name;", fix: "SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY name;", out: "name\n----\nSam\nZoe", fixedText: "Sam and Zoe", why: "The NULL in orders.customer_id makes NOT IN unknown for everyone; NOT EXISTS (or WHERE customer_id IS NOT NULL in the subquery) fixes it.", concepts: ["sql-subquery"] }
      ]
    },
    flashcards: [
      ["What is a scalar subquery?", "A subquery that returns one value, used where a value is expected."],
      ["Why can NOT IN return nothing?", "If the list contains NULL, x NOT IN (…) is never true. Use NOT EXISTS."],
      ["What does WITH … AS (…) do?", "Names a step (a CTE) that the rest of the query can use like a table."],
      ["UNION vs UNION ALL?", "UNION removes repeated rows; UNION ALL keeps them."],
      ["What does a window function keep that GROUP BY does not?", "Every row: it adds a value per row from its window."],
      ["How do you keep only rank 1?", "Compute the rank in a CTE, then filter WHERE r = 1 outside it."]
    ],
    quiz: [
      { q: "`rank() OVER (PARTITION BY category ORDER BY price DESC)` ranks…", opts: ["all products together", "within each category, dearest first", "categories by price", "cheapest first"], ans: 1, why: "PARTITION BY restarts the ranking per category." },
      { q: "Where can a window function NOT go?", opts: ["SELECT", "ORDER BY", "WHERE", "a CTE's SELECT"], ans: 2, why: "WHERE runs before windows are computed." },
      { q: "`SELECT a FROM t1 UNION SELECT b, c FROM t2;` fails because…", opts: ["UNION needs ALL", "the two sides have different numbers of columns", "ORDER BY is missing", "b and c are text"], ans: 1, why: "Both sides must have the same number of columns." }
    ]
  });
  K.add({ tasks: {
    "T1.6-above": Object.assign({ lesson: "T1.6", title: "Above their own average", tier: "core", minutes: 15, concepts: ["sql-subquery"],
      statement: ["List the products that cost **more than the average price of their own category**: `name`, `category` and `price`, A–Z by name."],
      starter: STARTER,
      rules: [uses(/\(\s*select[\s\S]*avg\s*\(/i, "Compare with a subquery that takes the average.", "sub")],
      hints: ["A correlated subquery: (SELECT avg(price) FROM products q WHERE q.category = p.category)", "WHERE p.price > that subquery", "ORDER BY p.name"],
      answer: "SELECT p.name, p.category, p.price FROM products p\nWHERE p.price > (SELECT avg(q.price) FROM products q WHERE q.category = p.category)\nORDER BY p.name;" }, { examples: [{ db: "cafe", out: "name    | category | price\n--------+----------+------\nBrownie | bakery   | 2.5\nCoffee  | drinks   | 2.2" }], hidden: [{ db: "cafe2", out: "name     | category | price\n---------+----------+------\nCocoa    | drinks   | 2.4\nFlapjack | bakery   | 1.7\nLatte    | drinks   | 2.6\nMuffin   | bakery   | 2" }] }),
    "T1.6-rank": Object.assign({ lesson: "T1.6", title: "Rank within category", tier: "stretch", minutes: 15, concepts: ["sql-cte-window"],
      statement: ["Rank the products by price **within each category**, dearest 1, with `rank()`: `category`, `name`, `price`, `rank`. Order by category, then rank, then name."],
      starter: STARTER,
      rules: [uses(/over\s*\(\s*partition\s+by/i, "Use rank() OVER (PARTITION BY …).", "window")],
      hints: ["rank() OVER (PARTITION BY category ORDER BY price DESC)", "Name it: AS rank", "ORDER BY category, rank, name"],
      answer: "SELECT category, name, price, rank() OVER (PARTITION BY category ORDER BY price DESC) AS rank FROM products ORDER BY category, rank, name;" }, { examples: [{ db: "cafe", out: "category | name    | price | rank\n---------+---------+-------+-----\nbakery   | Brownie | 2.5   | 1\nbakery   | Scone   | 1.9   | 2\ndrinks   | Coffee  | 2.2   | 1\ndrinks   | Juice   | 1.8   | 2\ndrinks   | Tea     | 1.5   | 3\ngifts    | Mug     | 8     | 1" }], hidden: [{ db: "cafe2", out: "category | name     | price | rank\n---------+----------+-------+-----\nbakery   | Muffin   | 2     | 1\nbakery   | Flapjack | 1.7   | 2\nbakery   | Cookie   | 1.2   | 3\ndrinks   | Latte    | 2.6   | 1\ndrinks   | Cocoa    | 2.4   | 2\ndrinks   | Tea      | 1.4   | 3\ngifts    | Tote     | 6.5   | 1" }] })
  } });

  /* ================================================================
     T1.7 Designing tables: relationships and normalisation
     ================================================================ */
  lesson("T1.7", {
    aqa: "4.10.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A spreadsheet of sales repeats the customer's city on every row and lists two products in one cell. It works — until Ada moves and only some rows are updated.",
        "**Normalisation** is the design that stops this: every fact stored **once**, in the table it belongs to, linked by keys.",
        "**Constraints** then make the database refuse data that breaks the rules — the last line of defence after your C#."
      ] },
      page("Core idea"),
      run("flat", "one wide table: facts repeated on every row", "CREATE TABLE sales_flat (sale INTEGER, customer TEXT, city TEXT, product TEXT, price REAL);\nINSERT INTO sales_flat VALUES (1, 'Ada', 'Leeds', 'Tea', 1.5), (2, 'Ada', 'Leeds', 'Mug', 8), (3, 'Kai', 'York', 'Tea', 1.5);\nSELECT * FROM sales_flat;"),
      run("anomaly", "an update anomaly: Ada moves, one row is missed", "CREATE TABLE sales_flat (sale INTEGER, customer TEXT, city TEXT, product TEXT, price REAL);\nINSERT INTO sales_flat VALUES (1, 'Ada', 'Leeds', 'Tea', 1.5), (2, 'Ada', 'Leeds', 'Mug', 8), (3, 'Kai', 'York', 'Tea', 1.5);\nUPDATE sales_flat SET city = 'Hull' WHERE sale = 1;\nSELECT DISTINCT customer, city FROM sales_flat ORDER BY customer;"),
      { ul: [
        "**Update anomaly**: a fact stored twice can disagree with itself — Ada now lives in two cities.",
        "**Insert anomaly**: you cannot record a new customer until they buy something. **Delete anomaly**: deleting Kai's only sale forgets Kai.",
        "The cure: a `customers` table, a `products` table, and sales that point at both."
      ] },
      run("split", "split it: each fact once, linked by keys", "CREATE TABLE people (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, city TEXT);\nCREATE TABLE goods (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, price REAL NOT NULL);\nCREATE TABLE sales (id INTEGER PRIMARY KEY, person_id INTEGER NOT NULL REFERENCES people(id), goods_id INTEGER NOT NULL REFERENCES goods(id));\nINSERT INTO people (name, city) VALUES ('Ada', 'Leeds'), ('Kai', 'York');\nINSERT INTO goods (name, price) VALUES ('Tea', 1.5), ('Mug', 8);\nINSERT INTO sales (person_id, goods_id) VALUES (1, 1), (1, 2), (2, 1);\nUPDATE people SET city = 'Hull' WHERE name = 'Ada';\nSELECT s.id, p.name, p.city, g.name AS product FROM sales s JOIN people p ON p.id = s.person_id JOIN goods g ON g.id = s.goods_id ORDER BY s.id;"),
      page("Rules"),
      { table: { head: ["Form", "Rule", "Broken by"], rows: [
        ["1NF", "every cell holds ONE value; rows are unique (a key)", "a cell 'Tea, Scone'; repeating columns product1, product2"],
        ["2NF", "1NF, and every non-key column depends on the WHOLE key", "order_items (order_id, product_id, product_name) — the name depends on product_id alone"],
        ["3NF", "2NF, and no non-key column depends on another non-key column", "customers (id, postcode, town) — town depends on postcode"]
      ] } },
      { ul: [
        "The short version: every non-key column depends on **the key, the whole key, and nothing but the key**.",
        "Relationships: **one-to-many** — a foreign key on the \"many\" side (orders.customer_id); **many-to-many** — a link table; **one-to-one** — rare, a shared key.",
        "An **entity–relationship (ER) diagram** draws the tables as boxes and the relationships as lines with crow's feet on the many side."
      ] },
      { table: { head: ["Constraint", "Refuses"], rows: [
        ["`NOT NULL`", "a missing value"],
        ["`UNIQUE`", "a repeat in that column"],
        ["`CHECK (cond)`", "a row where cond is false"],
        ["`DEFAULT v`", "(fills in v when a value is left out)"],
        ["`REFERENCES t(id)`", "a link to a row that does not exist — once `PRAGMA foreign_keys = ON`"]
      ] } },
      run("constraints", "a table that checks its own data", "CREATE TABLE ratings (\n  id INTEGER PRIMARY KEY,\n  product_id INTEGER NOT NULL REFERENCES products(id),\n  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),\n  said TEXT DEFAULT ''\n);\nINSERT INTO ratings (product_id, stars) VALUES (1, 5), (6, 4);\nSELECT * FROM ratings;"),
      page("Variations"),
      { h: "Fixing 1NF: one value per cell" },
      run("1nf", "a list in a cell, then one row per value", "CREATE TABLE baskets (id INTEGER PRIMARY KEY, items TEXT);\nINSERT INTO baskets VALUES (1, 'Tea,Scone');\nCREATE TABLE basket_items (basket_id INTEGER, item TEXT, PRIMARY KEY (basket_id, item));\nINSERT INTO basket_items VALUES (1, 'Tea'), (1, 'Scone');\nSELECT * FROM basket_items;"),
      { h: "Foreign keys, switched on" },
      run("fk-on", "SQLite checks REFERENCES only when asked", "PRAGMA foreign_keys = ON;\nINSERT INTO orders (customer_id, placed) VALUES (2, '2026-09-20');\nSELECT id, customer_id FROM orders WHERE placed = '2026-09-20';"),
      { h: "Splitting rows out of a flat table" },
      run("from-flat", "INSERT … SELECT DISTINCT builds the new table from the old", "CREATE TABLE sales_flat (customer TEXT, city TEXT, product TEXT);\nINSERT INTO sales_flat VALUES ('Ada', 'Leeds', 'Tea'), ('Ada', 'Leeds', 'Mug'), ('Kai', 'York', 'Tea');\nCREATE TABLE people (id INTEGER PRIMARY KEY, name TEXT UNIQUE, city TEXT);\nINSERT INTO people (name, city) SELECT DISTINCT customer, city FROM sales_flat;\nSELECT * FROM people;"),
      page("Pitfalls"),
      { h: "A CHECK the data breaks" },
      run("pit-check", "six stars is refused", "CREATE TABLE ratings (stars INTEGER CHECK (stars BETWEEN 1 AND 5));\nINSERT INTO ratings VALUES (6);"),
      { h: "Foreign keys are off by default" },
      run("pit-fk", "without the PRAGMA, a link to nowhere is accepted", "INSERT INTO orders (customer_id, placed) VALUES (99, '2026-09-20');\nSELECT count(*) AS orphans FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE o.customer_id IS NOT NULL AND c.id IS NULL;"),
      { ul: [ "Run `PRAGMA foreign_keys = ON;` on every connection (T1.9 does it in C#)." ] },
      { h: "Storing what can be computed" },
      "An `order_total` column next to the order's lines is a second copy of a fact — and the two drift apart. Compute totals with SUM when you read them, unless measurement says otherwise.",
      page("Connections"),
      { ul: [ "**Back:** unit 7's classes — a table is close to a class with only data; a foreign key is a reference.", "**Next:** T1.8 changes data under these constraints; T1C's Entity Framework turns classes into such tables for you.", "**AQA:** 4.10.1 entity relationship modelling and 4.10.3 normalisation (to third normal form)." ] },
      page("Good practice"),
      { ul: [ "Design in an ER sketch first: entities, keys, the many side of each line.", "Add NOT NULL to every column that must have a value, and a CHECK for every rule you can state.", "Normalise to 3NF; break it only on purpose, with a comment saying why." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Only one to five stars* and *Authors and books*." ] },
      page("Quick reference"),
      run("qr", "a key, a link, a rule", "CREATE TABLE t (id INTEGER PRIMARY KEY, p INTEGER REFERENCES products(id), n INTEGER NOT NULL CHECK (n > 0));\nINSERT INTO t (p, n) VALUES (1, 2);\nSELECT * FROM t;"),
      { ul: [ "1NF one value a cell · 2NF the whole key · 3NF nothing but the key.", "`NOT NULL`, `UNIQUE`, `CHECK (…)`, `DEFAULT`, `REFERENCES t(id)`.", "`PRAGMA foreign_keys = ON;` before relying on REFERENCES." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CHECK constraint failed", "a value the rule forbids", "Pitfalls"], ["FOREIGN KEY constraint failed", "a link to a row that does not exist (with foreign keys on)", "Variations"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "SELECT count(DISTINCT category), count(*) FROM products;", why: "Six products in three categories: each category is one fact, repeated per product — a sign it could be its own table.", concepts: ["sql-normal"] },
        { id: "p2", src: "PRAGMA foreign_keys;", why: "Off (0) until a connection switches it on.", concepts: ["sql-constraints"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the same email can only be stored once (the second INSERT is then ignored).", src: "CREATE TABLE members (id INTEGER PRIMARY KEY, email TEXT NOT NULL @@);\nINSERT OR IGNORE INTO members (email) VALUES ('a@x.uk');\nINSERT OR IGNORE INTO members (email) VALUES ('a@x.uk');\nSELECT count(*) AS members FROM members;", answer: "UNIQUE", out: "1 row changed.\n0 rows changed.\nmembers\n-------\n1", concepts: ["sql-constraints"] }
      ],
      bug: [
        { id: "b1", q: "The table should refuse a negative price, so only Tea is kept.", src: "CREATE TABLE items (name TEXT NOT NULL, price REAL NOT NULL);\nINSERT OR IGNORE INTO items VALUES ('Tea', 1.5), ('Oops', -2);\nSELECT count(*) AS items FROM items;", fix: "CREATE TABLE items (name TEXT NOT NULL, price REAL NOT NULL CHECK (price >= 0));\nINSERT OR IGNORE INTO items VALUES ('Tea', 1.5), ('Oops', -2);\nSELECT count(*) AS items FROM items;", out: "1 row changed.\nitems\n-----\n1", fixedText: "one item kept", why: "Without a CHECK the database accepts anything of the right type. CHECK (price >= 0) makes it refuse; OR IGNORE skips the refused row.", concepts: ["sql-constraints"] }
      ]
    },
    flashcards: [
      ["What is an update anomaly?", "A fact stored twice is changed in one place only, so the data disagrees with itself."],
      ["1NF?", "Every cell holds one value, and every row is unique."],
      ["2NF?", "1NF, and every non-key column depends on the whole key (matters for composite keys)."],
      ["3NF?", "2NF, and no non-key column depends on another non-key column."],
      ["Where does the foreign key go in a one-to-many?", "On the many side: orders.customer_id."],
      ["Are SQLite foreign keys checked by default?", "No — PRAGMA foreign_keys = ON on each connection."]
    ],
    quiz: [
      { q: "customers (id, postcode, town) breaks 3NF because…", opts: ["it has no key", "town depends on postcode, not on id", "postcode is text", "it should be 2 tables of 1 column"], ans: 1, why: "A non-key column depending on another non-key column breaks 3NF." },
      { q: "A many-to-many relationship is stored with…", opts: ["a foreign key on both tables", "a link table holding both keys", "a comma list in a cell", "a UNIQUE constraint"], ans: 1, why: "Like order_items between orders and products." },
      { q: "Which stops `stars = 6`?", opts: ["NOT NULL", "UNIQUE", "CHECK (stars BETWEEN 1 AND 5)", "DEFAULT 5"], ans: 2, why: "A CHECK states the rule, and SQLite refuses rows that break it." }
    ]
  });
  K.add({ tasks: {
    "T1.7-stars": Object.assign({ lesson: "T1.7", title: "Only one to five stars", tier: "warm-up", minutes: 10, concepts: ["sql-constraints"],
      statement: ["Switch foreign keys on, then create `ratings` with `product_id INTEGER NOT NULL REFERENCES products(id)` and `stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5)`.", "Add (1, 5), (2, 0), (3, 4) and (4, 6) — each with its own `INSERT OR IGNORE`, so rows the CHECK refuses are skipped — then `SELECT count(*) AS kept FROM ratings;`."],
      starter: STARTER,
      rules: [uses(/check\s*\(/i, "Add the CHECK.", "check"), uses(/references\s+products/i, "Link product_id to products.", "fk"), uses(/foreign_keys\s*=\s*on/i, "Switch foreign keys on first.", "pragma")],
      hints: ["PRAGMA foreign_keys = ON;", "CREATE TABLE ratings (product_id INTEGER NOT NULL REFERENCES products(id), stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5));", "Four INSERT OR IGNORE INTO ratings VALUES (…); then the count."],
      answer: "PRAGMA foreign_keys = ON;\nCREATE TABLE ratings (product_id INTEGER NOT NULL REFERENCES products(id), stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5));\nINSERT OR IGNORE INTO ratings VALUES (1, 5);\nINSERT OR IGNORE INTO ratings VALUES (2, 0);\nINSERT OR IGNORE INTO ratings VALUES (3, 4);\nINSERT OR IGNORE INTO ratings VALUES (4, 6);\nSELECT count(*) AS kept FROM ratings;" }, { examples: [{ db: "cafe", out: "1 row changed.\n0 rows changed.\n1 row changed.\n0 rows changed.\nkept\n----\n2" }], hidden: [{ db: "cafe2", out: "1 row changed.\n0 rows changed.\n1 row changed.\n0 rows changed.\nkept\n----\n2" }] }),
    "T1.7-books": { lesson: "T1.7", title: "Authors and books", tier: "core", minutes: 15, concepts: ["sql-normal", "sql-constraints"],
      statement: ["A flat list repeats each author on every book. Design it properly: `authors (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)` and `books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author_id INTEGER NOT NULL REFERENCES authors(id))`.", "Add the authors Le Guin and Pratchett, then the books *Earthsea* (Le Guin), *Mort* (Pratchett) and *The Dispossessed* (Le Guin) — find each author's id with a subquery, not a typed number.", "Finally list `title` and `author` (the name), A–Z by title."],
      starter: STARTER,
      examples: [{ db: "cafe", out: "2 rows changed.\n1 row changed.\n1 row changed.\n1 row changed.\ntitle            | author\n-----------------+----------\nEarthsea         | Le Guin\nMort             | Pratchett\nThe Dispossessed | Le Guin" }],
      rules: [uses(/references\s+authors/i, "books.author_id must reference authors.", "fk"), uses(/\(\s*select\s+id\s+from\s+authors/i, "Look the author's id up with (SELECT id FROM authors WHERE name = …).", "lookup"), uses(/join/i, "List them with a JOIN.", "join")],
      hints: ["Two CREATE TABLEs; books has the foreign key.", "INSERT INTO books (title, author_id) VALUES ('Mort', (SELECT id FROM authors WHERE name = 'Pratchett'));", "SELECT b.title, a.name AS author FROM books b JOIN authors a ON a.id = b.author_id ORDER BY b.title;"],
      answer: "CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);\nCREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author_id INTEGER NOT NULL REFERENCES authors(id));\nINSERT INTO authors (name) VALUES ('Le Guin'), ('Pratchett');\nINSERT INTO books (title, author_id) VALUES ('Earthsea', (SELECT id FROM authors WHERE name = 'Le Guin'));\nINSERT INTO books (title, author_id) VALUES ('Mort', (SELECT id FROM authors WHERE name = 'Pratchett'));\nINSERT INTO books (title, author_id) VALUES ('The Dispossessed', (SELECT id FROM authors WHERE name = 'Le Guin'));\nSELECT b.title, a.name AS author FROM books b JOIN authors a ON a.id = b.author_id ORDER BY b.title;" }
  } });

  /* ================================================================
     T1.8 Changing data safely: transactions and indexes
     ================================================================ */
  lesson("T1.8", {
    aqa: "4.10.5",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Reading never hurts the data; changing it can. An UPDATE without its WHERE reprices the whole shop.",
        "A sale is several changes — take stock, record the order, record its lines. If the power fails half-way, a database must not keep half a sale.",
        "And when the table has a million rows, finding one must not mean reading them all."
      ] },
      page("Core idea"),
      run("insert", "INSERT: name the columns, then the values", "INSERT INTO customers (name, city, joined) VALUES ('Lin', 'Hull', '2026-09-20');\nSELECT id, name, city FROM customers WHERE name = 'Lin';"),
      run("update", "UPDATE changes the rows WHERE picks — and only those", "UPDATE products SET price = round(price * 1.1, 2) WHERE category = 'drinks';\nSELECT name, price FROM products WHERE category = 'drinks' ORDER BY id;"),
      run("delete", "DELETE removes rows; a link table's rows go first", "DELETE FROM order_items WHERE order_id = 5;\nDELETE FROM orders WHERE id = 5;\nSELECT count(*) AS orders FROM orders;"),
      { ul: [
        "Each change says how many rows it touched — read it: \"0 rows changed.\" usually means a wrong WHERE.",
        "Before an UPDATE or DELETE, run the same WHERE as a SELECT and check the rows.",
        "Delete the rows that point at a row before the row itself (or declare `ON DELETE CASCADE`)."
      ] },
      run("txn", "a transaction: everything inside, or nothing", "BEGIN;\nUPDATE products SET stock = stock - 2 WHERE id = 6;\nINSERT INTO orders (customer_id, placed) VALUES (5, '2026-09-21');\nROLLBACK;\nSELECT stock FROM products WHERE id = 6;\nSELECT count(*) AS orders FROM orders;"),
      page("Rules"),
      { table: { head: ["Statement", "Does"], rows: [
        ["`INSERT INTO t (cols) VALUES (…), (…);`", "adds rows; an INTEGER PRIMARY KEY left out is numbered for you"],
        ["`INSERT INTO t (cols) SELECT …;`", "adds the rows a query returns"],
        ["`UPDATE t SET col = expr WHERE …;`", "changes the rows WHERE picks — all of them without it"],
        ["`DELETE FROM t WHERE …;`", "removes the rows WHERE picks — all of them without it"],
        ["`… ON CONFLICT(col) DO UPDATE SET …`", "an upsert: insert, or update the row that is already there"],
        ["`BEGIN; … COMMIT;` / `ROLLBACK;`", "keep every change inside / undo every one"],
        ["`CREATE INDEX name ON t(col);`", "a sorted lookup on col"]
      ] } },
      { ul: [
        "**ACID**: a transaction is **A**tomic (all or nothing), keeps the database **C**onsistent (constraints hold), **I**solated (others never see it half-done) and **D**urable (once committed, it survives a crash).",
        "Outside BEGIN … COMMIT, every statement is its own small transaction.",
        "An **index** is a sorted copy of a column with pointers back to the rows: a lookup becomes a search instead of a scan. Primary keys are indexed already."
      ] },
      run("plan", "the query plan before and after an index", "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 2;\nCREATE INDEX idx_orders_customer ON orders(customer_id);\nEXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 2;"),
      page("Variations"),
      { h: "An upsert" },
      run("upsert", "Tea is there already: update it instead of failing", "INSERT INTO products (name, category, price, stock) VALUES ('Tea', 'drinks', 1.6, 30), ('Chai', 'drinks', 2.0, 15)\nON CONFLICT(name) DO UPDATE SET price = excluded.price, stock = stock + excluded.stock;\nSELECT name, price, stock FROM products WHERE category = 'drinks' ORDER BY name;"),
      { ul: [ "`excluded` is the row that tried to go in; `stock` alone is the row already there." ] },
      { h: "RETURNING: see what changed" },
      run("returning", "the changed rows come back like a query", "UPDATE products SET stock = stock + 10 WHERE stock < 5 RETURNING name, stock;"),
      { h: "A savepoint" },
      run("savepoint", "undo part of a transaction", "BEGIN;\nINSERT INTO customers (name) VALUES ('Lin');\nSAVEPOINT before_mo;\nINSERT INTO customers (name) VALUES ('Mo');\nROLLBACK TO before_mo;\nCOMMIT;\nSELECT name FROM customers WHERE id > 5 ORDER BY id;"),
      page("Pitfalls"),
      { h: "A value a NOT NULL column needs" },
      run("pit-notnull", "a product with no price is refused", "INSERT INTO products (name, category) VALUES ('Air', 'gifts');"),
      { h: "UPDATE without WHERE" },
      run("pit-nowhere", "meant one product; changed all six (rolled back here)", "BEGIN;\nUPDATE products SET price = 0.01;\nSELECT count(*) AS repriced FROM products WHERE price = 0.01;\nROLLBACK;"),
      { h: "A transaction left open" },
      "BEGIN with no COMMIT keeps every change invisible to others and holds a lock; when the connection closes, SQLite rolls it back. Always end a transaction — in C# a `using` block does it (T1.11).",
      page("Connections"),
      { ul: [ "**Back:** unit 11's \"all or nothing\" file save (write a temporary file, then move it) is the same idea a transaction gives you for free.", "**Next:** T1.10 sends these statements from C# with parameters; T1.11 wraps them in a C# transaction.", "**AQA:** 4.10.5 client–server databases: concurrent access, record locks, serialisation, timestamp ordering and commitment ordering." ] },
      page("Good practice"),
      { ul: [ "Run the WHERE as a SELECT before you UPDATE or DELETE with it.", "Group the changes of one action in one transaction.", "Index the columns you search and join by often — not every column: each index slows every write." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Restock* and *A delivery, upserted*.", "**Project:** *The Case of the Missing Mug* — five clue tasks below this lesson's own." ] },
      page("Quick reference"),
      run("qr", "change, check, undo", "BEGIN;\nUPDATE products SET stock = 0 WHERE id = 1;\nSELECT name, stock FROM products WHERE id = 1;\nROLLBACK;"),
      { ul: [ "`INSERT … VALUES` · `UPDATE … SET … WHERE` · `DELETE FROM … WHERE` · `ON CONFLICT … DO UPDATE` · `RETURNING`.", "`BEGIN; … COMMIT;` or `ROLLBACK;` — ACID.", "`CREATE INDEX i ON t(col);` and `EXPLAIN QUERY PLAN` — SEARCH beats SCAN." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["NOT NULL constraint failed", "a required column left out", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: "SELECT count(*) FROM products WHERE stock < 5;", why: "Juice (4), Scone (3) and the Mug (2): an UPDATE with this WHERE would change 3 rows.", concepts: ["sql-dml"] },
        { id: "p2", src: "SELECT max(id) + 1 FROM customers;", why: "Five customers: the next INSERT without an id gets 6.", concepts: ["sql-dml"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so only the drinks are repriced.", src: "UPDATE products SET price = round(price * 1.1, 2) @@ category = 'drinks';\nSELECT name, price FROM products ORDER BY id;", answer: "WHERE", out: "3 rows changed.\nname    | price\n--------+------\nTea     | 1.65\nCoffee  | 2.42\nJuice   | 1.98\nBrownie | 2.5\nScone   | 1.9\nMug     | 8", concepts: ["sql-dml"] }
      ],
      bug: [
        { id: "b1", q: "It should delete the order with no customer and its lines, in one transaction, leaving 5 orders.", src: "BEGIN;\nDELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = NULL);\nDELETE FROM orders WHERE customer_id = NULL;\nCOMMIT;\nSELECT count(*) AS orders FROM orders;", fix: "BEGIN;\nDELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id IS NULL);\nDELETE FROM orders WHERE customer_id IS NULL;\nCOMMIT;\nSELECT count(*) AS orders FROM orders;", out: "1 row changed.\n1 row changed.\norders\n------\n5", fixedText: "5 orders left", why: "= NULL is never true, so nothing was deleted (\"0 rows changed.\"). IS NULL finds it.", concepts: ["sql-dml", "sql-null"] }
      ]
    },
    flashcards: [
      ["What does ACID stand for?", "Atomic, Consistent, Isolated, Durable."],
      ["What happens to an UPDATE with no WHERE?", "It changes every row of the table."],
      ["How do you undo the changes since BEGIN?", "ROLLBACK;"],
      ["What is an upsert?", "INSERT … ON CONFLICT(col) DO UPDATE SET … — insert, or update the row already there."],
      ["What does an index change in a query plan?", "A SCAN of every row becomes a SEARCH using the index."],
      ["The cost of an index?", "Every INSERT, UPDATE and DELETE must update it too, and it takes space."]
    ],
    quiz: [
      { q: "BEGIN; UPDATE…; INSERT…; and the power fails before COMMIT. Afterwards…", opts: ["the UPDATE is kept", "both are kept", "neither is kept", "the INSERT is kept"], ans: 2, why: "Atomic: an uncommitted transaction is rolled back." },
      { q: "\"0 rows changed.\" after `DELETE … WHERE customer_id = NULL` means…", opts: ["the table is empty", "= NULL is never true; use IS NULL", "DELETE needs BEGIN", "foreign keys are off"], ans: 1, why: "Comparing with = NULL is unknown for every row." },
      { q: "Which column most deserves an index?", opts: ["one you never search by", "orders.customer_id, searched and joined on often", "every column", "a column with one value"], ans: 1, why: "Index what you search and join by; each index costs writes." }
    ]
  });
  K.add({ tasks: {
    "T1.8-restock": Object.assign({ lesson: "T1.8", title: "Restock", tier: "warm-up", minutes: 10, concepts: ["sql-dml", "sql-transaction"],
      statement: ["In one transaction, add 20 to the stock of every product with **3 or fewer** in stock, and commit.", "Then show every product's `name` and `stock` in id order."],
      starter: STARTER,
      rules: [uses(/begin/i, "Start a transaction with BEGIN.", "begin"), uses(/commit/i, "End it with COMMIT.", "commit"), uses(/update[\s\S]*where/i, "Restock only the low ones: UPDATE … WHERE.", "where")],
      hints: ["BEGIN;", "UPDATE products SET stock = stock + 20 WHERE stock <= 3;", "COMMIT; then SELECT name, stock FROM products ORDER BY id;"],
      answer: "BEGIN;\nUPDATE products SET stock = stock + 20 WHERE stock <= 3;\nCOMMIT;\nSELECT name, stock FROM products ORDER BY id;" }, { examples: [{ db: "cafe", out: "2 rows changed.\nname    | stock\n--------+------\nTea     | 40\nCoffee  | 25\nJuice   | 4\nBrownie | 12\nScone   | 23\nMug     | 22" }], hidden: [{ db: "cafe2", out: "3 rows changed.\nname     | stock\n---------+------\nLatte    | 30\nCocoa    | 21\nMuffin   | 9\nFlapjack | 20\nTote     | 5\nTea      | 50\nCookie   | 22" }] }),
    "T1.8-upsert": Object.assign({ lesson: "T1.8", title: "A delivery, upserted", tier: "core", minutes: 15, concepts: ["sql-dml"],
      statement: ["A delivery brings ('Tea', 'drinks', 1.6, 30) and ('Chai', 'drinks', 2.0, 15) as (name, category, price, stock).", "Insert both in ONE statement; when the name is already there, take the new price and **add** the delivered stock. Then list the drinks' `name`, `price` and `stock`, A–Z."],
      starter: STARTER,
      rules: [uses(/on\s+conflict\s*\(\s*name\s*\)\s*do\s+update/i, "Use ON CONFLICT(name) DO UPDATE.", "upsert"), uses(/excluded\./i, "Read the delivered values from excluded.", "excluded")],
      hints: ["INSERT INTO products (name, category, price, stock) VALUES (…), (…)", "ON CONFLICT(name) DO UPDATE SET price = excluded.price, stock = stock + excluded.stock;", "SELECT name, price, stock FROM products WHERE category = 'drinks' ORDER BY name;"],
      answer: "INSERT INTO products (name, category, price, stock) VALUES ('Tea', 'drinks', 1.6, 30), ('Chai', 'drinks', 2.0, 15)\nON CONFLICT(name) DO UPDATE SET price = excluded.price, stock = stock + excluded.stock;\nSELECT name, price, stock FROM products WHERE category = 'drinks' ORDER BY name;" }, { examples: [{ db: "cafe", out: "2 rows changed.\nname   | price | stock\n-------+-------+------\nChai   | 2     | 15\nCoffee | 2.2   | 25\nJuice  | 1.8   | 4\nTea    | 1.6   | 70" }], hidden: [{ db: "cafe2", out: "2 rows changed.\nname  | price | stock\n------+-------+------\nChai  | 2     | 15\nCocoa | 2.4   | 1\nLatte | 2.6   | 30\nTea   | 1.6   | 80" }] }),

    /* ---------------- T1's project: The Case of the Missing Mug ----------------
       Five clues, one query each, on the `mug` dataset: the café's Golden
       Mug vanished; the staff rota, stock checks, badges, the door log and
       the visitors' book say who took it. Each clue uses the part's skills;
       the answer is never typed in, always asked for. */
    "T1.8-mug1": { lesson: "T1.8", db: "mug", title: "The Missing Mug · 1 When did it go?", tier: "stretch", minutes: 10, concepts: ["sql-select", "sql-aggregate"],
      statement: ["**The Case of the Missing Mug.** The café's Golden Mug has gone from its shelf. The stock is checked every evening (`stock_checks: day, item, count`).", "Clue 1: show the **first** `day` on which the Golden Mug's count was 0 — one row, one column called `day`."],
      starter: STARTER,
      examples: [{ db: "mug", out: "day\n----------\n2026-09-14" }],
      rules: [noUse(/'2026-09-1\d'/, "Ask the data for the day; don't type it.", "nodate"), uses(/stock_checks/i, "Read stock_checks.", "table")],
      hints: ["WHERE item = 'Golden Mug' AND count = 0", "The first day is the smallest: min(day) — or ORDER BY day LIMIT 1.", "Name the column: AS day"],
      answer: "SELECT min(day) AS day FROM stock_checks WHERE item = 'Golden Mug' AND count = 0;" },
    "T1.8-mug2": { lesson: "T1.8", db: "mug", title: "The Missing Mug · 2 Who was working?", tier: "stretch", minutes: 12, concepts: ["sql-join"],
      statement: ["Clue 2: who was on shift on the day the mug went (clue 1)? Show `name`, `role`, `start` and `finish` from `staff` and `shifts`, earliest start first."],
      starter: STARTER,
      examples: [{ db: "mug", out: "name | role    | start | finish\n-----+---------+-------+-------\nCleo | baker   | 06:00 | 14:00\nBen  | manager | 07:00 | 15:00\nFay  | barista | 08:00 | 16:00\nDev  | barista | 12:00 | 20:00" }],
      rules: [uses(/join/i, "Join shifts to staff.", "join")],
      hints: ["FROM shifts sh JOIN staff s ON s.id = sh.staff_id", "WHERE sh.day = (the day from clue 1)", "ORDER BY sh.start"],
      answer: "SELECT s.name, s.role, sh.start, sh.finish FROM shifts sh JOIN staff s ON s.id = sh.staff_id WHERE sh.day = '2026-09-14' ORDER BY sh.start;" },
    "T1.8-mug3": { lesson: "T1.8", db: "mug", title: "The Missing Mug · 3 After hours", tier: "stretch", minutes: 15, concepts: ["sql-join", "sql-outer"],
      statement: ["Clue 3: the café closes at 18:00. Show every door entry from 18:00 that day until midnight: `at`, `door`, `badge`, and `name` — the name of the staff member the badge belongs to (`badges.staff_id`). Earliest first."],
      starter: STARTER,
      examples: [{ db: "mug", out: "at               | door  | badge | name\n-----------------+-------+-------+-----\n2026-09-14 19:42 | front | B4    | Dev\n2026-09-14 21:17 | back  | B5    | Eli\n2026-09-14 21:31 | back  | B5    | Eli" }],
      rules: [uses(/join\s+badges/i, "Go from door_log through badges to staff.", "badges"), noUse(/'(Dev|Eli)'/i, "Let the join find the names.", "nonames")],
      hints: ["door_log d LEFT JOIN badges b ON b.badge = d.badge LEFT JOIN staff s ON s.id = b.staff_id", "Times are text: d.at >= '2026-09-14 18:00' AND d.at < '2026-09-15'", "Who of these was on shift that evening (clue 2)?"],
      answer: "SELECT d.at, d.door, d.badge, s.name FROM door_log d LEFT JOIN badges b ON b.badge = d.badge LEFT JOIN staff s ON s.id = b.staff_id WHERE d.at >= '2026-09-14 18:00' AND d.at < '2026-09-15' ORDER BY d.at;" },
    "T1.8-mug4": { lesson: "T1.8", db: "mug", title: "The Missing Mug · 4 A lost badge", tier: "stretch", minutes: 15, concepts: ["sql-outer", "sql-group"],
      statement: ["Clue 4: Eli wasn't on shift — and his badge was reported lost. For every badge with a `lost_on` time, show `badge`, `owner` (the staff name), `lost_on` and `uses_after`: how many door entries used it **after** it was lost."],
      starter: STARTER,
      examples: [{ db: "mug", out: "badge | owner | lost_on          | uses_after\n------+-------+------------------+-----------\nB5    | Eli   | 2026-09-13 18:30 | 2" }],
      rules: [uses(/group\s+by/i, "Count per badge with GROUP BY.", "group"), uses(/left\s+join\s+door_log/i, "LEFT JOIN door_log, so a badge with no uses would still show 0.", "left")],
      hints: ["FROM badges b JOIN staff s ON s.id = b.staff_id WHERE b.lost_on IS NOT NULL", "LEFT JOIN door_log d ON d.badge = b.badge AND d.at > b.lost_on", "count(d.id) AS uses_after … GROUP BY b.badge"],
      answer: "SELECT b.badge, s.name AS owner, b.lost_on, count(d.id) AS uses_after\nFROM badges b\nJOIN staff s ON s.id = b.staff_id\nLEFT JOIN door_log d ON d.badge = b.badge AND d.at > b.lost_on\nWHERE b.lost_on IS NOT NULL\nGROUP BY b.badge;" },
    "T1.8-mug5": { lesson: "T1.8", db: "mug", title: "The Missing Mug · 5 Who had the badge?", tier: "stretch", minutes: 20, concepts: ["sql-subquery"],
      statement: ["Clue 5: someone picked up Eli's badge (B5) when it went missing. Which **visitor** was in the café at that moment — signed in at or before `lost_on`, and not signed out before it (or never)? Show `name`, `company` and `signed_in`.", "Read B5's `lost_on` with a subquery; don't type the time."],
      starter: STARTER,
      examples: [{ db: "mug", out: "name | company       | signed_in\n-----+---------------+-----------------\nGus  | Shine Windows | 2026-09-13 17:45" }],
      rules: [uses(/\(\s*select\s+lost_on\s+from\s+badges/i, "Read the time with (SELECT lost_on FROM badges WHERE badge = 'B5').", "sub"), noUse(/'Gus'|18:30/i, "Let the query find them.", "notyped"), uses(/is\s+null/i, "A visitor who never signed out has signed_out IS NULL.", "null")],
      hints: ["The moment: (SELECT lost_on FROM badges WHERE badge = 'B5')", "signed_in <= that moment AND (signed_out IS NULL OR signed_out >= that moment)", "Case closed: who never signed out?"],
      answer: "SELECT v.name, v.company, v.signed_in FROM visitors v\nWHERE v.signed_in <= (SELECT lost_on FROM badges WHERE badge = 'B5')\n  AND (v.signed_out IS NULL OR v.signed_out >= (SELECT lost_on FROM badges WHERE badge = 'B5'));" }
  } });

  /* ================================================================
     retrieval cards: SQL written or predicted, varied each review;
     a written query is checked on both cafés against what the card's
     own answer returns there (KOS.codeRun.check)
     ================================================================ */
  var CATS = ["drinks", "bakery"];
  K.add({ cards: {
    "t1-select": { title: "Filter and sort", lesson: "T1.2", concepts: ["sql-select", "sql-order"], kind: "write",
      vary: function (r, n) {
        var cat = CATS[n % 2], under = [2, 2.3, 2.5][r(3)], desc = r(2) === 1;
        return { prompt: "List the " + cat + " that cost less than £" + under.toFixed(2) + ": name and price, " + (desc ? "dearest" : "cheapest") + " first (ties A–Z by name).",
          label: cat + " under £" + under.toFixed(2), params: [cat, String(under)], starter: STARTER,
          cases: [{ db: "cafe" }, { db: "cafe2" }],
          hint: "SELECT … FROM products WHERE category = … AND price < … ORDER BY price" + (desc ? " DESC" : "") + ", name;",
          answer: "SELECT name, price FROM products WHERE category = '" + cat + "' AND price < " + under + " ORDER BY price" + (desc ? " DESC" : "") + ", name;" };
      } },
    "t1-null": { title: "NULL and three values", lesson: "T1.3", concepts: ["sql-null"], kind: "predict",
      vary: function (r, n) {
        var city = pick(r, ["Leeds", "York", "Hull"]);
        var srcs = [
          "SELECT count(*), count(city) FROM customers WHERE id >= " + (1 + r(3)) + ";",
          "SELECT name FROM customers WHERE city <> '" + city + "' ORDER BY name;",
          "SELECT name, coalesce(city, '?') FROM customers WHERE id >= " + (3 + r(2)) + " ORDER BY id;",
          "SELECT count(*) FROM customers WHERE city IS NOT '" + city + "';"
        ];
        return { prompt: "What does this return? Type the values, one row a line.", label: ["count(*) and count(col)", "<> and a NULL", "coalesce", "IS NOT"][n % 4], params: [], src: srcs[n % 4],
          hint: "Sam's city is NULL: = and <> are unknown for him, IS and IS NOT are not, count(city) skips him." };
      } },
    "t1-group": { title: "Group and filter the groups", lesson: "T1.4", concepts: ["sql-group", "sql-aggregate"], kind: "write",
      vary: function (r, n) {
        var agg = [["count(*)", "products", "how many products"], ["sum(stock)", "units", "the total stock"], ["round(avg(price), 2)", "avg_price", "the average price rounded to 2"]][n % 3];
        var min = agg[1] === "products" ? 2 : agg[1] === "units" ? 5 + r(10) : 2;
        return { prompt: "One row per category with " + agg[2] + " (as `" + agg[1] + "`), keeping only categories where it is at least " + min + ". A–Z by category.",
          label: agg[1] + " ≥ " + min, params: [agg[1], String(min)], starter: STARTER,
          cases: [{ db: "cafe" }, { db: "cafe2" }],
          hint: "GROUP BY category, then HAVING " + agg[0] + " >= " + min + ".",
          answer: "SELECT category, " + agg[0] + " AS " + agg[1] + " FROM products GROUP BY category HAVING " + agg[0] + " >= " + min + " ORDER BY category;" };
      } },
    "t1-join": { title: "Join through the keys", lesson: "T1.5", concepts: ["sql-join", "sql-outer"], kind: "write",
      vary: function (r, n) {
        var left = n % 2 === 0;
        return left
          ? { prompt: "Every customer's name and how many orders they placed (`orders`), including those with none. A–Z by name.", label: "orders per customer, none included", params: ["left"], starter: STARTER,
              cases: [{ db: "cafe" }, { db: "cafe2" }], hint: "customers LEFT JOIN orders, GROUP BY the customer, count(o.id).",
              answer: "SELECT c.name, count(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY c.name;" }
          : { prompt: "Every order line's order id, product name and quantity: `order_id`, `product`, `qty`, by order id then product A–Z.", label: "order lines with names", params: ["inner"], starter: STARTER,
              cases: [{ db: "cafe" }, { db: "cafe2" }], hint: "order_items JOIN products ON products.id = order_items.product_id.",
              answer: "SELECT i.order_id, p.name AS product, i.qty FROM order_items i JOIN products p ON p.id = i.product_id ORDER BY i.order_id, product;" };
      } },
    "t1-sub": { title: "Subqueries and ranks", lesson: "T1.6", concepts: ["sql-subquery", "sql-cte-window"], kind: "predict",
      vary: function (r, n) {
        var k = 1 + r(3);
        var srcs = [
          "SELECT name FROM products WHERE price > (SELECT avg(price) FROM products WHERE category = '" + CATS[r(2)] + "') ORDER BY name;",
          "SELECT name FROM (SELECT name, rank() OVER (ORDER BY price DESC) AS r FROM products) WHERE r <= " + k + " ORDER BY r;",
          "SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY name;"
        ];
        return { prompt: "What does this return? Type the values, one row a line.", label: ["above a category's average", "the top ranks", "NOT EXISTS"][n % 3], params: [], src: srcs[n % 3],
          hint: "Work out the inner query first, then the outer one." };
      } },
    "t1-txn": { title: "Changes and transactions", lesson: "T1.8", concepts: ["sql-transaction", "sql-dml"], kind: "predict",
      vary: function (r, n) {
        var d = 1 + r(5), end = n % 2 === 0 ? "ROLLBACK" : "COMMIT";
        return { prompt: "What does this return? Type the values, one row a line — a change prints its own line, like \"3 rows changed.\"", label: "BEGIN … " + end, params: [end],
          src: "BEGIN;\nUPDATE products SET stock = stock - " + d + " WHERE category = 'bakery';\n" + end + ";\nSELECT sum(stock) FROM products WHERE category = 'bakery';",
          hint: "The bakery has two products with 12 and 3 in stock. ROLLBACK undoes the UPDATE; COMMIT keeps it." };
      } }
  } });
})();
