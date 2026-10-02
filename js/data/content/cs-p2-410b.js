/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.10.4–
   4.10.5 (SQL: defining tables, inserting, updating, deleting and querying
   several tables; client-server databases and the control of concurrent
   access) at full A-level depth. Each topic REPLACES the short entry the
   older file carried; every way AQA has examined it (7517/2 June 2017–
   2025) is explained, worked and answered in the mark scheme's own format.
   Every model query was run against sample data in SQLite (ISO dates) and
   returned exactly the intended rows. Past-paper banks stay in
   bank-cs-410-413.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 }];
  if (label) it.push(txt(x + w / 2, y + (sub ? h / 2 - 8 : h / 2), label, { b: true, size: 12, c: "text" }));
  if (sub) it.push(txt(x + w / 2, y + h / 2 + 9, sub, { size: 10.5 }));
  return it;
}
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: o.both ? "both" : true, c: o.c || "accent2", w: o.w || 2, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}
/* a horizontal bar on a time axis */
function bar(x1, x2, y, col, label, lx) {
  return [{ poly: [[x1, y], [x2, y], [x2, y + 16], [x1, y + 16]], fill: col, alpha: 0.35, c: col, w: 1.4 }, txt(lx || x2 + 8, y + 8, label, { pos: "e", off: 0, size: 10.5, c: col })];
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA SQL mark scheme", body: [
  "Long queries split into **AO2 (analyse)** marks — right tables and fields, right linking condition(s), right filter conditions joined by the right logical operators — and **AO3 (programming)** marks for clauses of fully correct SQL. AO2 marks are given even if the syntax is wrong.",
  "**A.** table.field, aliases, INNER JOIN or JOIN, ASC, \" ' or # delimiters, any date format with delimiters. **I.** case, unnecessary brackets, spaces in field names. **R.** delimiters round numbers (2024–25), DESC when ascending was asked.",
  "**DPT** (lose it once): a semicolon after every clause (one at the very end is fine); field name before table name (Field.Table)."
] } };

/* =====================================================================
   4.10.4  Structured Query Language (SQL)
   ===================================================================== */
C["compsci:4.10.4"] = {
  notes: [
    { h: "Structured Query Language (SQL) — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.10.4)", body: ["Use SQL to **retrieve, update, insert and delete** data from **multiple tables** of a relational database.", "Use SQL to **define a database table**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Complete a CREATE TABLE statement", "Complete", "3", "A-level 2021 Q05.3, 2022 Q07.3"],
      ["Find the errors in given SQL", "State / Describe", "2", "A-level 2018 Q07.2, 2019 Q06.3, 2023 Q05.2"],
      ["INSERT a new record", "Write", "2", "A-level 2017 Q10.5, 2024 Q08.2, 2025 Q06.3"],
      ["UPDATE a record", "Write", "3", "A-level 2017 Q10.4, 2024 Q08.3"],
      ["Multi-table SELECT with conditions and ORDER BY", "Write", "5–7", "A-level 2017 Q10.6, 2018 Q07.4, 2020 Q04.5, 2021 Q05.4, 2022 Q07.4, 2025 Q06.4"],
      ["REST verbs → SQL statements", "Shade", "1", "A-level 2023 Q05.5 — worked in 4.9.4.10"],
      ["RFID reads → SELECT / UPDATE / INSERT", "Describe", "6", "A-level 2020 Q08.3 — worked in 4.7.4.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Defining a table**: CREATE TABLE and data types.", "**Changing data**: INSERT, UPDATE, DELETE.", "**Querying one table**: SELECT … FROM … WHERE … ORDER BY.", "**Querying several tables**: joins, traced row by row.", "**Ranges and overlaps**: the date and time conditions AQA loves.", "**Finding the errors**.", "**How a long query is marked**.", "**Exam questions — defining and changing data**.", "**Exam questions — queries**.", "**Exam toolkit**."] },
    { diagram: "sql-sandbox" },

    { page: "Defining a table" },
    { code: { lang: "sql", src: "CREATE TABLE Facility (\n  FacilityID   INT          PRIMARY KEY,\n  Description  VARCHAR(100) NOT NULL,\n  MaxPeople    INT,\n  PricePerHour DECIMAL(6,2)\n)", cap: "Field name FIRST, then its data type, then any constraint; a comma after every field except the last." } },
    { code: { lang: "sql", src: "CREATE TABLE Booking (\n  FacilityID  INT,\n  BookingDate DATE,\n  StartTime   TIME,\n  EndTime     TIME,\n  CustomerID  INT,\n  PRIMARY KEY (FacilityID, BookingDate, StartTime),\n  FOREIGN KEY (FacilityID) REFERENCES Facility(FacilityID),\n  FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)\n)", cap: "A composite primary key must be declared as a separate PRIMARY KEY (…) line; foreign keys name the table and field they reference." } },
    { table: { head: ["Data", "Type", "Also accepted by AQA"], rows: [
      ["Whole numbers (IDs, counts)", "INT / INTEGER", "tinyint, smallint, mediumint, number, byte"],
      ["Text of up to n characters", "VARCHAR(n)", "char, nchar, nvarchar, text, string, varchar2…"],
      ["Fixed-length text", "CHAR(n)", "—"],
      ["Money / decimals", "DECIMAL(p,s) / FLOAT / REAL", "money, smallmoney, numeric, currency — **R.** integer-only types for a price"],
      ["Dates", "DATE", "datetime, smalldatetime — **R.** time"],
      ["Times", "TIME", "—"],
      ["True / false", "BOOLEAN", "bit"]
    ] } },
    { kv: [
      ["PRIMARY KEY", "after the field (single key) or as its own line PRIMARY KEY (a, b) (composite)"],
      ["FOREIGN KEY … REFERENCES", "enforces referential integrity (4.10.2)"],
      ["NOT NULL", "the field must always have a value"],
      ["Lengths", "VARCHAR(50) — AQA does not require lengths but they must be sensible if given"]
    ] },

    { page: "Changing data" },
    { code: { lang: "sql", src: "-- INSERT: method 1, every field in table order\nINSERT INTO Student\nVALUES (17423, 'Ethan', 'Smith', 7, 'Hulme')\n\n-- INSERT: method 2, name the fields (any order — VALUES must match it)\nINSERT INTO PartUsedForJob (JobID, PartID, QuantityUsed)\nVALUES (206, 12, 2)", cap: "Text and dates in quotes; numbers bare." } },
    { code: { lang: "sql", src: "UPDATE Product\nSET QuantityInStock = QuantityInStock - 3\nWHERE ProductID = 1\n\nUPDATE Job\nSET JobDuration = '01:30', InGarage = False\nWHERE JobID = 206", cap: "UPDATE table SET field = value [, field = value] WHERE condition. The new value may use the old one." } },
    { code: { lang: "sql", src: "DELETE FROM Showing\nWHERE ShowDate = '29/03/2023'", cap: "DELETE removes whole rows — there is no field list and only ONE table." } },
    { callout: { t: "warn", h: "No WHERE = every row", body: "`UPDATE Product SET QuantityInStock = 0` empties the stock of **every** product; `DELETE FROM Showing` deletes **every** showing. The WHERE clause is what limits the change to the intended record." } },
    { table: { head: ["Statement", "Pattern", "Changes"], rows: [
      ["INSERT", "INSERT INTO t [(fields)] VALUES (values)", "adds one row"],
      ["UPDATE", "UPDATE t SET f = v WHERE cond", "changes fields in existing rows"],
      ["DELETE", "DELETE FROM t WHERE cond", "removes rows"],
      ["SELECT", "SELECT fields FROM t WHERE cond", "nothing — it only reads"]
    ] } },

    { page: "Querying one table" },
    { code: { lang: "sql", src: "SELECT Name, Grade\nFROM Student\nWHERE Subject = 'CompSci' AND Grade >= 70\nORDER BY Grade DESC", cap: "SELECT which fields · FROM which table · WHERE which rows · ORDER BY how sorted (ASC is the default)." } },
    { table: { head: ["Tool", "Example", "Meaning"], rows: [
      ["Comparison", "= <> < > <= >=", "<> is not equal"],
      ["Logic", "AND · OR · NOT, brackets", "AND binds tighter than OR — bracket OR groups"],
      ["Range", "Grade BETWEEN 60 AND 80", "inclusive of both ends"],
      ["Pattern", "Surname LIKE 'Sm%'", "% any run of characters, _ exactly one"],
      ["List", "House IN ('Hulme', 'Kitchener')", "matches any in the list"],
      ["Empty", "DateLeft IS NULL", "no value stored"],
      ["All fields", "SELECT *", "every field"],
      ["Sort", "ORDER BY Surname, Forename", "second key breaks ties"],
      ["Aggregates", "COUNT(*), SUM, AVG, MIN, MAX + GROUP BY", "one result per group"]
    ] } },
    { callout: { t: "tip", h: "Delimiters", body: "Text and dates **must** be delimited: 'Torquay', '17/09/2018' (AQA accepts \" ' or # for dates). Numbers must **not** be: WHERE ProductID = 1, not '1' — rejected in 2024 and 2025. Real DBMSs store dates internally and usually want 'YYYY-MM-DD'; AQA accepts any order with delimiters." } },
    { worked: { tag: "variation", title: "Counting with GROUP BY", q: "Merit(MeritID, StudentID, TeacherID, DateAwarded, Reason). List each StudentID with the number of merits awarded, most merits first.",
      steps: [
        { m: "`SELECT StudentID, COUNT(*) AS Merits`", mk: "1", n: "COUNT(*) counts the rows in each group." },
        { m: "`FROM Merit`", mk: "1" },
        { m: "`GROUP BY StudentID`", mk: "1", n: "One output row per student." },
        { m: "`ORDER BY Merits DESC`", mk: "1" }
      ], result: "One row per student, highest count first" } },

    { page: "Querying several tables" },
    { callout: { t: "info", h: "Key idea", body: "Data about one question is usually spread over tables, so a query must **join** them. Two equivalent ways:" } },
    { code: { lang: "sql", src: "-- 1 · list both tables and LINK them in WHERE\nSELECT Car.CarRegNo, Make, JobDate\nFROM Car, Job\nWHERE Car.CarRegNo = Job.CarRegNo\n  AND Make = 'Ford'\n\n-- 2 · INNER JOIN … ON\nSELECT Car.CarRegNo, Make, JobDate\nFROM Car INNER JOIN Job ON Car.CarRegNo = Job.CarRegNo\nWHERE Make = 'Ford'", cap: "The linking condition equates the primary key in one table with the foreign key in the other. A field name in both tables must be written Table.Field." } },
    { callout: { t: "info", h: "Key idea", body: "**Why the link matters — the trace.** FROM Car, Job pairs **every** Car row with **every** Job row (2 × 3 = 6). The linking condition keeps only the pairs that belong together:" } },
    { table: { head: ["Car.CarRegNo", "Make", "Job.JobID", "Job.CarRegNo", "Car.CarRegNo = Job.CarRegNo?"], rows: [
      ["AB12 CDE", "Ford", "205", "AB12 CDE", "✔ kept"],
      ["AB12 CDE", "Ford", "206", "XY65 ZZZ", "✘"],
      ["AB12 CDE", "Ford", "207", "AB12 CDE", "✔ kept"],
      ["XY65 ZZZ", "Kia", "205", "AB12 CDE", "✘"],
      ["XY65 ZZZ", "Kia", "206", "XY65 ZZZ", "✔ kept"],
      ["XY65 ZZZ", "Kia", "207", "AB12 CDE", "✘"]
    ] } },
    { callout: { t: "info", h: "Key idea", body: "Without the link, the query returns all six rows — Fords with Kia jobs. That is exactly the error in 2019 Q06.3." } },
    { steps: [
      "List the fields wanted → they decide which tables you need.",
      "Add any table needed only for a CONDITION (Fixture for the date; Term for the dates of term).",
      "Walk the foreign keys between them — every table in FROM must be linked into the chain (n tables → at least n − 1 link conditions).",
      "Add the filter conditions; join everything with AND (bracket any OR).",
      "Add ORDER BY if a sequence is asked for. Qualify any field name that is in two tables."
    ] },
    { fig: (function () {
      var it = [];
      it = it.concat(boxAt(20, 30, 140, 46, "Athlete", "accent", "Surname, Forename, DOB"));
      it = it.concat(boxAt(230, 30, 140, 46, "EventEntry", "accent2", "AthleteID, FixtureID"));
      it = it.concat(boxAt(440, 30, 140, 46, "Fixture", "accent", "FixtureDate"));
      it = it.concat(arrow(160, 53, 230, 53, "AthleteID", { both: true, c: "good", dy: -6 }));
      it = it.concat(arrow(370, 53, 440, 53, "FixtureID", { both: true, c: "good", dy: -6 }));
      it.push(txt(90, 100, "SELECT fields", { size: 10.5, c: "accent" }), txt(300, 100, "only a bridge", { size: 10.5, c: "accent2" }), txt(510, 100, "WHERE FixtureDate", { size: 10.5, c: "accent" }));
      return { w: 600, h: 115, items: it, cap: "2018 Q07.4: the wanted fields are in Athlete and the condition is in Fixture; EventEntry is needed only to link them — three tables, two linking conditions." };
    })() },

    { page: "Ranges and overlaps" },
    { callout: { t: "info", h: "Key idea", body: "Several AQA queries ask for records that **overlap a period** — bookings that clash, animals at a zoo between two dates, merits during a term." } },
    { fig: (function () {
      var x0 = 40, sc = 60, it = [];
      function X(h) { return x0 + (h - 12) * sc; }
      it.push({ poly: [[X(14.25), 20], [X(16.25), 20], [X(16.25), 230], [X(14.25), 230]], fill: "accent", alpha: 0.1, c: "accent", w: 1.2, dash: "4 3" });
      it.push(txt((X(14.25) + X(16.25)) / 2, 12, "new booking 14:15–16:15", { b: true, c: "accent" }));
      it = it.concat(bar(X(13), X(15), 34, "danger", "ends during", X(17.8)));
      it = it.concat(bar(X(15), X(17), 64, "danger", "starts during", X(17.8)));
      it = it.concat(bar(X(13), X(17.5), 94, "danger", "encloses it", X(17.8)));
      it = it.concat(bar(X(14.5), X(15.5), 124, "danger", "inside it", X(17.8)));
      it = it.concat(bar(X(12.5), X(14.25), 154, "good", "ends as it starts", X(17.8)));
      it = it.concat(bar(X(16.25), X(17.5), 184, "good", "starts as it ends", X(17.8)));
      for (var h = 12; h <= 18; h++) { it.push({ line: [[X(h), 226], [X(h), 232]], c: "muted", w: 1 }); it.push(txt(X(h), 244, h + ":00", { size: 10 })); }
      it.push({ line: [[X(12), 229], [X(18), 229]], c: "muted", w: 1 });
      return { w: 560, h: 255, items: it, cap: "Red bookings clash; green ones only touch. One rule catches all four clashes: the existing booking STARTS before the new one ENDS, and ENDS after the new one STARTS." };
    })() },
    { callout: { t: "formula", h: "The overlap test", body: "Existing interval [S, E] overlaps new interval [s, e] exactly when $S < e$ **and** $E > s$. AQA also accepts ≤ / ≥ (counting touching bookings) and the longer three-case version." } },
    { steps: [
      "Case list (2021 mark scheme): starts before AND ends after · OR starts during · OR ends during.",
      "Compact form: StartTime < '16:15' AND EndTime > '14:15'.",
      "An \"open\" record (an animal still at the zoo, DateLeft = '01/01/0001') must be added with OR — and that OR must be **bracketed**: DateArrived <= '31/05/2020' AND (DateLeft >= '01/04/2020' OR DateLeft = '01/01/0001').",
      "\"During the term\": DateAwarded >= StartDate AND DateAwarded <= EndDate — or DateAwarded BETWEEN StartDate AND EndDate (accepted)."
    ] },
    { callout: { t: "miscon", h: "The forgotten brackets", body: "A AND B OR C means (A AND B) OR C — every row with C true slips through whatever the zoo or species. Bracket any OR you join to other conditions." } },

    { page: "Finding the errors" },
    { table: { head: ["Check", "Wrong", "Right"], rows: [
      ["Field before type", "VARCHAR(50) Surname", "Surname VARCHAR(50)"],
      ["Key has a type", "PRIMARY KEY AthleteID,", "AthleteID INT PRIMARY KEY,"],
      ["Text / dates delimited", "WHERE Town = Torquay", "WHERE Town = 'Torquay'"],
      ["Tables linked", "FROM Surgery, Vet WHERE Town = 'Torquay'", "… AND Surgery.SurgeryName = Vet.SurgeryName"],
      ["Only needed tables", "DELETE FROM Showing, Film", "DELETE FROM Showing"],
      ["Numbers bare", "WHERE ProductID = '1'", "WHERE ProductID = 1"],
      ["Clause order", "VALUES … INSERT INTO …", "INSERT INTO … VALUES …"],
      ["Ambiguous field", "ORDER BY PartID (in two tables)", "ORDER BY Part.PartID"]
    ] } },
    { callout: { t: "warn", h: "\"Describe\" the error", body: "Say what is wrong AND where: \"There is no linking condition between Surgery and Vet using SurgeryName\" — **NE.** \"the tables have not been linked\". Do not give a missing semicolon if told not to." } },

    { page: "How a long query is marked" },
    { table: { head: ["Mark", "Type", "For"], rows: [
      ["1", "AO2", "the right TABLES and the right FIELDS — and no others (an extra table is accepted only if correctly linked)"],
      ["1", "AO2", "the LINKING condition(s) between the tables"],
      ["1–3", "AO2", "the FILTER conditions (ID, date, species…) and the right logical operators between all conditions — max 2 of 3 if they are not joined by AND"],
      ["1", "AO3", "two (or three) of SELECT / FROM / WHERE / ORDER BY fully correct"],
      ["2", "AO3", "all clauses fully correct"],
      ["cap", "—", "Overall max one below full if the solution does not work"]
    ] } },
    { callout: { t: "tip", h: "What \"fully correct clause\" means", body: "Correct syntax AND the right AO2 decisions for that clause: the SELECT clause must list only the right fields; ORDER BY must be fully correct (DESC where descending was asked, nothing where ascending)." } },

    { page: "Exam questions — defining and changing data" },
    { worked: { tag: "exam", title: "CREATE TABLE Facility", src: "A-level June 2021 · P2 Q05.3 · 3 marks",
      q: "Facility(FacilityID, Description, MaxPeople, PricePerHour) stores a sports centre's facilities: a unique number, a brief description (e.g. 'Outdoor Pitch A'), the maximum number of people and the price for one hour (e.g. £17.50). Complete the SQL statement CREATE TABLE Facility ( … ) including the primary key.",
      steps: [
        { m: "`FacilityID INT PRIMARY KEY,` — or `FacilityID INT,` … `PRIMARY KEY (FacilityID)`;", mk: "1 mark", n: "Sensible type and identified as the key." },
        { m: "`Description VARCHAR(100),` `MaxPeople INT,` — two other fields with sensible types (and lengths if given);", mk: "1 mark" },
        { m: "`PricePerHour DECIMAL(6,2)` — fully correct, commas between lines;", mk: "1 mark", n: "R. an integer-only type for the price." }
      ], result: "FacilityID INT PRIMARY KEY, Description VARCHAR(100), MaxPeople INT, PricePerHour DECIMAL(6,2)" } },
    { worked: { tag: "exam", title: "CREATE TABLE Animal", src: "A-level June 2022 · P2 Q07.3 · 3 marks",
      q: "Complete the SQL statement CREATE TABLE Animal ( … ) for Animal(AnimalID, IndividualName, Species, DateOfBirth, Sex), including the key field. AnimalID is a unique number; Sex is 'Male' or 'Female'.",
      steps: [
        { m: "`AnimalID INT PRIMARY KEY,`", mk: "1 mark" },
        { m: "`IndividualName VARCHAR(50),` `Species VARCHAR(40),`", mk: "1 mark" },
        { m: "`DateOfBirth DATE,` `Sex VARCHAR(6)`", mk: "1 mark", n: "AO3: syntax must be right, commas included. DPT data type before field name. R. TIME for the date." }
      ], result: "Five fields, AnimalID the key" } },
    { worked: { tag: "exam", title: "Two errors in CREATE TABLE Athlete", src: "A-level June 2018 · P2 Q07.2 · 2 marks",
      q: "CREATE TABLE Athlete ( PRIMARY KEY AthleteID, VARCHAR(50) Surname, VARCHAR(30) Forename, DATE DateOfBirth, VARCHAR(6) Gender, VARCHAR(30) TeamName ). The data types and lengths are valid. State two errors.",
      steps: [
        { m: "There is no data type for the primary key, AthleteID;", mk: "1 mark" },
        { m: "The data type is given before the field name (it should follow it) / PRIMARY KEY is before the field name;", mk: "1 mark", n: "Also accepted: the missing semicolon at the end. Max 2." }
      ], result: "No type for AthleteID; type before name" } },
    { worked: { tag: "exam", title: "Record the job's duration", src: "A-level June 2017 · P2 Q10.4 · 3 marks",
      q: "Job(JobID, CarRegNo, JobDate, InGarage, JobDuration). The job with JobID 206 has been completed; it took 1 hour 30 minutes (1:30). Write the SQL commands required to record the amount of time the job took.",
      steps: [
        { m: "Identify the table (Job) and the record (JobID = 206);", mk: "1 mark (AO2)" },
        { m: "`UPDATE Job` `SET JobDuration = '01:30'` `WHERE JobID = 206`", mk: "2 marks (AO3) · 1 for two of the three clauses", n: "A. any delimiter or none for the time; A. 1.5; I. also setting InGarage." }
      ], result: "UPDATE Job SET JobDuration = '01:30' WHERE JobID = 206" } },
    { worked: { tag: "exam", title: "Record the parts used", src: "A-level June 2017 · P2 Q10.5 · 2 marks",
      q: "PartUsedForJob(JobID, PartID, QuantityUsed). Write the SQL commands required to record that job 206 used two of the parts with PartID 12.",
      steps: [
        { m: "`INSERT INTO PartUsedForJob` — or with the field list (JobID, PartID, QuantityUsed);", mk: "1 mark" },
        { m: "`VALUES (206, 12, 2)` — in the order of the field list;", mk: "1 mark", n: "MAX 1 if extra clauses stop it working." }
      ], result: "INSERT INTO PartUsedForJob VALUES (206, 12, 2)" } },
    { worked: { tag: "exam", title: "Create sale 4072", src: "A-level June 2024 · P2 Q08.2 · 2 marks",
      q: "Sale(SaleID, CustomerID, SaleDate). A sale is made on 29/09/2024 to the customer with CustomerID 48 and is given SaleID 4072. Write an SQL query that will create the new record in the Sale table.",
      steps: [
        { m: "`INSERT INTO Sale` (optionally `(SaleID, CustomerID, SaleDate)`);", mk: "1 mark" },
        { m: "`VALUES (4072, 48, '29/09/2024')`;", mk: "1 mark", n: "R. no delimiters round the date; R. delimiters round 4072 or 48. Max 1 if VALUES comes first or it would not work." }
      ], result: "INSERT INTO Sale VALUES (4072, 48, '29/09/2024')" } },
    { worked: { tag: "exam", title: "Reduce the stock", src: "A-level June 2024 · P2 Q08.3 · 3 marks",
      q: "Product(ProductID, Description, QuantityInStock, SupplierID). Write an SQL query that will update the QuantityInStock of the product with ProductID 1 when sale 4072 is made: the value 3 should be subtracted from the current quantity in stock.",
      steps: [
        { m: "`UPDATE Product`", mk: "1 mark" },
        { m: "`SET QuantityInStock = QuantityInStock - 3`", mk: "1 mark", n: "NE. a variable name instead of 3." },
        { m: "`WHERE ProductID = 1`", mk: "1 mark", n: "R. delimiters round 1 or 3. Max 2 if the clauses are out of order." }
      ], result: "UPDATE Product SET QuantityInStock = QuantityInStock - 3 WHERE ProductID = 1" } },
    { worked: { tag: "exam", title: "Add the new student", src: "A-level June 2025 · P2 Q06.3 · 2 marks",
      q: "Student(StudentID, FirstName, LastName, YearGroup, House); StudentID and YearGroup are numeric. Ethan Smith joins year group 7, is placed in Hulme house and given StudentID 17423. Write SQL code to add the student's details to the Student table.",
      steps: [
        { m: "`INSERT INTO Student` (optionally all five fields listed, any order);", mk: "1 mark" },
        { m: "`VALUES (17423, 'Ethan', 'Smith', 7, 'Hulme')`;", mk: "1 mark", n: "R. quotation marks round 17423 and 7." }
      ], result: "INSERT INTO Student VALUES (17423, 'Ethan', 'Smith', 7, 'Hulme')" } },
    { worked: { tag: "exam", title: "Errors in the Torquay query", src: "A-level June 2019 · P2 Q06.3 · 2 marks",
      q: "Surgery(SurgeryName, Town, TelephoneNumber), Vet(VetID, VetForename, VetSurname, SurgeryName). The query SELECT VetForename, VetSurname FROM Surgery, Vet WHERE Town = Torquay is meant to list all vets who work at the surgery in Torquay. Describe two errors (not the missing semicolon).",
      steps: [
        { m: "Torquay / the town name is missing quotation marks;", mk: "1 mark" },
        { m: "There is no linking condition between the two tables using SurgeryName — Surgery.SurgeryName = Vet.SurgeryName is missing;", mk: "1 mark", n: "NE. \"the tables have not been linked\"." }
      ], result: "Quote 'Torquay'; add the SurgeryName link" } },
    { worked: { tag: "exam", title: "Errors in the DELETE", src: "A-level June 2023 · P2 Q05.2 · 2 marks",
      q: "The cinema closed on 29th March 2023. The query DELETE FROM Showing, Film WHERE ShowDate = 29/03/2023 was written to delete all showings on this date. Describe two errors (not semicolons).",
      steps: [
        { m: "The Film table should not be included — only the Showing table;", mk: "1 mark" },
        { m: "The date is missing quotation marks / delimiters;", mk: "1 mark", n: "Also accepted: \"an asterisk / list of attributes is missing after DELETE\". Max 2." }
      ], result: "DELETE FROM Showing WHERE ShowDate = '29/03/2023'" } },

    { page: "Exam questions — queries" },
    { worked: { tag: "exam", title: "Parts used on job 93", src: "A-level June 2017 · P2 Q10.6 · 5 marks",
      q: "Part(PartID, Description, Price, QuantityInStock), PartUsedForJob(JobID, PartID, QuantityUsed). Write an SQL query to list all the parts used on the job with JobID 93: the PartID, Description, Price and QuantityUsed of each part and no other details, ordered by PartID with the lowest PartIDs first.",
      steps: [
        { m: "`SELECT Part.PartID, Description, Price, QuantityUsed` `FROM Part, PartUsedForJob` — the two tables and four fields only;", mk: "AO2 1" },
        { m: "`WHERE PartUsedForJob.PartID = Part.PartID` — the linking condition;", mk: "AO2 1" },
        { m: "`AND JobID = 93` — the filter, joined with AND;", mk: "AO2 1" },
        { m: "`ORDER BY Part.PartID`", mk: "AO3 2 (all four clauses) · 1 for two or three", n: "A. INNER JOIN … ON; A. ASC; overall max 4 if it does not work." }
      ], result: "SELECT Part.PartID, Description, Price, QuantityUsed FROM Part, PartUsedForJob WHERE PartUsedForJob.PartID = Part.PartID AND JobID = 93 ORDER BY Part.PartID" } },
    { worked: { tag: "exam", title: "Athletes at the 17/09/18 fixture", src: "A-level June 2018 · P2 Q07.4 · 5 marks",
      q: "Athlete(AthleteID, Surname, Forename, DateOfBirth, Gender, TeamName), Fixture(FixtureID, FixtureDate, LocationName), EventEntry(FixtureID, EventTypeID, AthleteID). Write an SQL query to list the Surname, Forename and DateOfBirth (and no other details) of all athletes competing in the fixture on 17/09/18, in alphabetical order of Surname.",
      steps: [
        { m: "`SELECT Surname, Forename, DateOfBirth` `FROM Athlete, EventEntry, Fixture` — three tables, three fields;", mk: "AO2 1" },
        { m: "`WHERE Athlete.AthleteID = EventEntry.AthleteID AND EventEntry.FixtureID = Fixture.FixtureID` — both links;", mk: "AO2 1" },
        { m: "`AND FixtureDate = '17/09/2018'`", mk: "AO2 1", n: "Delimiters needed for AO3, not for this AO2 mark." },
        { m: "`ORDER BY Surname`", mk: "AO3 2", n: "A. ASC; R. ASCENDING. EventAtFixture may be included only if correctly linked." }
      ], result: "Three tables, two links, the date, ORDER BY Surname" } },
    { worked: { tag: "exam", title: "Properties for buyer 23", src: "A-level June 2020 · P2 Q04.5 · 5 marks",
      q: "Property(PropertyID, HouseNum, Street, Area, Postcode, Bedrooms, Bathrooms, AskingPrice, SellerID), Buyer(BuyerID, Title, Forename, Surname, Telephone, DesiredArea, MinBedrooms, MaxPrice). Write an SQL query to list every property the buyer with BuyerID 23 might want: in the buyer's desired area, with at least the minimum bedrooms, costing no more than the maximum price. Show only PropertyID, Street, Bedrooms and AskingPrice, most expensive first.",
      steps: [
        { m: "`SELECT PropertyID, Street, Bedrooms, AskingPrice` `FROM Buyer, Property`", mk: "AO2 1" },
        { m: "`WHERE BuyerID = 23` `AND DesiredArea = Area` `AND MinBedrooms <= Bedrooms` `AND MaxPrice >= AskingPrice`", mk: "AO2 2 (all four) · 1 for two", n: "The tables are \"linked\" by comparisons, not by a key — there is no foreign key between them." },
        { m: "`ORDER BY AskingPrice DESC`", mk: "AO3 2" }
      ], result: "Four conditions; ORDER BY AskingPrice DESC" } },
    { worked: { tag: "exam", title: "Clashing basketball bookings", src: "A-level June 2021 · P2 Q05.4 · 7 marks",
      q: "Facility(FacilityID, Description, MaxPeople, PricePerHour), FacilityForSport(Sport, FacilityID), Booking(FacilityID, BookingDate, StartTime, EndTime, CustomerID). A customer wants a facility suitable for basketball on 15/06/2021 between 14:15 and 16:15. Write a query listing all bookings for facilities suitable for basketball that would overlap with this booking, showing only FacilityID, StartTime and EndTime.",
      steps: [
        { m: "`SELECT Booking.FacilityID, StartTime, EndTime` `FROM Booking, FacilityForSport`", mk: "AO2 1" },
        { m: "`WHERE Sport = 'Basketball' AND BookingDate = '15/06/2021'`", mk: "AO2 1" },
        { m: "`AND Booking.FacilityID = FacilityForSport.FacilityID`", mk: "AO2 1" },
        { m: "`AND StartTime < '16:15' AND EndTime > '14:15'` — catches every overlap and nothing else;", mk: "AO2 2", n: "A. <= and >=; the three-case version (starts before & ends after / starts during / ends during, joined by OR) also scores. Max 2 of 3 condition marks without correct logical operators." },
        { m: "Fully correct SELECT / FROM / WHERE;", mk: "AO3 2" }
      ], result: "Link FacilityForSport; StartTime < '16:15' AND EndTime > '14:15'" } },
    { worked: { tag: "exam", title: "Red pandas at Ashdale Park", src: "A-level June 2022 · P2 Q07.4 · 7 marks",
      q: "Animal(AnimalID, IndividualName, Species, DateOfBirth, Sex), AnimalLocation(AnimalID, ZooName, DateArrived, DateLeft); DateLeft = 01/01/0001 means the animal has not left. Write a query listing every red panda present at the zoo 'Ashdale Park' on any day from 01/04/2020 to 31/05/2020 inclusive (it may since have moved). Show only the individual name and the date it arrived at the zoo.",
      steps: [
        { m: "`SELECT IndividualName, DateArrived` `FROM Animal, AnimalLocation`", mk: "AO2 1" },
        { m: "`WHERE Species = 'Red Panda' AND ZooName = 'Ashdale Park'`", mk: "AO2 1" },
        { m: "`AND Animal.AnimalID = AnimalLocation.AnimalID`", mk: "AO2 1", n: "R. links to tables the query does not use." },
        { m: "`AND DateArrived <= '31/05/2020'` `AND (DateLeft >= '01/04/2020' OR DateLeft = '01/01/0001')`", mk: "AO2 2", n: "Arrived before the period ended, and left after it began or never left. 1 mark for the DateArrived condition and one DateLeft condition." },
        { m: "Fully correct clauses — the OR bracketed;", mk: "AO3 2" }
      ], result: "Overlap test plus the 'not left' sentinel, bracketed" } },
    { worked: { tag: "exam", title: "Merits in the Spring 2025 term", src: "A-level June 2025 · P2 Q06.4 · 6 marks",
      q: "Student(StudentID, FirstName, LastName, YearGroup, House), Merit(MeritID, StudentID, TeacherID, DateAwarded, Reason), Term(TermName, TermYear, StartDate, EndDate). Write a query listing all merits awarded during the Spring term of 2025: the first and last name of the student and the reason, in order of StudentID, lowest first.",
      steps: [
        { m: "`SELECT FirstName, LastName, Reason` `FROM Student, Merit, Term`", mk: "AO2 1", n: "Term is needed for its dates even though none of its fields are listed." },
        { m: "`WHERE TermName = 'Spring' AND TermYear = 2025`", mk: "AO2 1" },
        { m: "`AND Student.StudentID = Merit.StudentID`", mk: "AO2 1" },
        { m: "`AND DateAwarded >= StartDate AND DateAwarded <= EndDate`", mk: "AO2 1", n: "A. BETWEEN StartDate AND EndDate. Max 2 of 3 condition marks without AND." },
        { m: "`ORDER BY Student.StudentID`", mk: "AO3 2", n: "R. DESC. Overall max 5 if it does not work." }
      ], result: "Term joined by date range; ORDER BY StudentID" } },
    { worked: { tag: "variation", title: "Delete with a condition from another table", q: "Delete every booking for customers whose EmailAddress ends in '@old.example'. Booking(…, CustomerID), Customer(CustomerID, Forename, Surname, EmailAddress).",
      steps: [
        { m: "DELETE works on ONE table, so find the IDs with a nested query:", mk: "1" },
        { m: "`DELETE FROM Booking WHERE CustomerID IN (SELECT CustomerID FROM Customer WHERE EmailAddress LIKE '%@old.example')`", mk: "2", n: "The inner SELECT returns a list; IN tests membership." }
      ], result: "A subquery supplies the matching keys" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Write an SQL query", "Right tables + fields only; every table linked; filters joined by AND; ORDER BY if asked; delimiters right."],
      ["Complete the CREATE TABLE", "Key field with a type and PRIMARY KEY; sensible types; field before type; commas."],
      ["State / Describe the errors", "Name the error and where it is — quotes, missing link, extra table, type order."],
      ["Write the SQL to insert / update", "INSERT INTO … VALUES (in order) · UPDATE … SET … WHERE key = value."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Some Fine Wines Get Hearty Orders\"", body: "**S**ELECT · **F**ROM · **W**HERE · **G**ROUP BY · **H**AVING · **O**RDER BY — the order the clauses must appear. And: INSERT **INTO** … **VALUES** · UPDATE … **SET** … WHERE · DELETE **FROM** … WHERE." } },
    { callout: { t: "warn", h: "Specific errors", body: ["No linking condition — every row pairs with every row.", "Quotes round numbers (R.) or none round text/dates.", "Listing a field that is in two tables without Table.Field.", "An OR not bracketed against the ANDs.", "DESC when ascending was asked (R.), or no DESC for \"most expensive first\".", "Semicolons after every clause (DPT).", "Data type before field name in CREATE TABLE (DPT).", "UPDATE or DELETE without WHERE."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.10.2 the join condition equates a primary and a foreign key; 4.10.3 normalised tables are why joins are needed; 4.9.4.10 REST maps GET/POST/PUT/DELETE to SELECT/INSERT/UPDATE/DELETE; 4.7.4.1 RFID stock updates use SELECT, UPDATE and INSERT; 4.10.5 two UPDATEs at once cause the lost update; 4.12 SELECT…WHERE is a filter and the field list a map." } }
  ],
  flashcards: [
    ["Order of clauses in a query?", "SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY."],
    ["Insert a record?", "INSERT INTO Table [(fields)] VALUES (values)."],
    ["Change a record?", "UPDATE Table SET Field = value WHERE condition."],
    ["Remove records?", "DELETE FROM Table WHERE condition."],
    ["Define a table field?", "FieldName TYPE [PRIMARY KEY / NOT NULL], — name before type."],
    ["Composite key in CREATE TABLE?", "A separate line PRIMARY KEY (Field1, Field2)."],
    ["Foreign key in CREATE TABLE?", "FOREIGN KEY (Field) REFERENCES OtherTable(Field)."],
    ["Linking condition?", "Table1.PK = Table2.FK in WHERE (or INNER JOIN … ON)."],
    ["Overlap test for [S,E] and [s,e]?", "S < e AND E > s."],
    ["Delimiters?", "Quotes round text and dates; none round numbers."],
    ["Descending sort?", "ORDER BY Field DESC."],
    ["% and _ in LIKE?", "% any run of characters; _ exactly one character."]
  ],
  quiz: [
    { q: "SELECT … FROM Surgery, Vet WHERE Town = 'Torquay' returns wrong rows because", opts: ["the tables are not linked on SurgeryName", "Town needs no quotes", "SELECT needs *", "Vet has no key"], ans: 0, why: "Every surgery pairs with every vet." },
    { q: "Which correctly reduces stock by 3 for product 1?", opts: ["UPDATE Product SET QuantityInStock = QuantityInStock - 3 WHERE ProductID = 1", "UPDATE Product WHERE ProductID = 1 SET QuantityInStock - 3", "INSERT INTO Product VALUES (1, -3)", "SET Product.QuantityInStock = -3"], ans: 0, why: "UPDATE … SET … WHERE." },
    { q: "Existing booking 13:00–14:15; new booking 14:15–16:15. With StartTime < '16:15' AND EndTime > '14:15' it is", opts: ["not listed", "listed", "an error", "listed twice"], ans: 0, why: "It only touches." },
    { q: "In CREATE TABLE, \"VARCHAR(50) Surname\" is wrong because", opts: ["the field name must come before the type", "VARCHAR needs no length", "Surname is reserved", "it needs NOT NULL"], ans: 0, why: "2018 Q07.2." },
    { q: "A AND B OR C is evaluated as", opts: ["(A AND B) OR C", "A AND (B OR C)", "an error", "A OR B OR C"], ans: 0, why: "AND binds tighter." },
    { q: "VALUES ('4072', 48, '29/09/2024') for an integer SaleID", opts: ["loses the mark — no quotes round numbers", "is required", "is ignored", "is preferred"], ans: 0, why: "R. delimiters round SaleID." }
  ]
};

/* a two-client timeline: rows of [time label, client A text, client B text, record value] */
function timeline(rows, cap, o) {
  o = o || {};
  var it = [], y0 = 46, rh = o.rh || 30, W = 600;
  it.push(txt(70, 22, "time", { b: true, c: "muted" }), txt(220, 22, o.a || "Client A", { b: true, c: "accent" }), txt(420, 22, o.b || "Client B", { b: true, c: "accent2" }), txt(560, 22, o.v || "record", { b: true, c: "text2" }));
  it.push({ line: [[30, y0 - 8], [30, y0 + rh * rows.length]], c: "muted", w: 1.4, arrow: true });
  rows.forEach(function (r, i) {
    var y = y0 + rh * i + rh / 2 - 4;
    it.push(txt(70, y, r[0], { size: 10.5 }));
    if (r[1]) it.push(txt(220, y, r[1], { size: 10.5, c: r[4] === "a" ? "danger" : "accent" }));
    if (r[2]) it.push(txt(420, y, r[2], { size: 10.5, c: r[4] === "b" ? "danger" : "accent2" }));
    if (r[3] != null) it.push(txt(560, y, String(r[3]), { size: 11, b: true, c: "text" }));
    if (i) it.push({ line: [[40, y0 + rh * i - 4], [W - 10, y0 + rh * i - 4]], c: "line", w: 0.8 });
  });
  return { w: W, h: y0 + rh * rows.length + 10, items: it, cap: cap };
}

/* =====================================================================
   4.10.5  Client server databases
   ===================================================================== */
C["compsci:4.10.5"] = {
  notes: [
    { h: "Client server databases — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.10.5)", body: ["Know that a **client server database** system provides **simultaneous access** to the database for **multiple clients**.", "Know how **concurrent access** can be controlled to preserve the **integrity** of the database — the **lost update** problem, managed by **record locks**, **serialisation**, **timestamp ordering** and **commitment ordering**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["The problem if concurrent access is not managed", "Describe", "2–3", "A-level 2019 Q06.4, 2025 Q06.5"],
      ["How record locks OR timestamp ordering works", "Describe", "2–3", "A-level 2019 Q06.5, 2024 Q08.4"],
      ["Improve a slow database server (hardware, network, database)", "Explain (12-mark essay)", "12", "A-level 2018 Q04 — worked in 4.7.3.7"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The client-server database**.", "**The lost update problem**, traced.", "**Record locks** — and deadlock.", "**Serialisation**.", "**Timestamp ordering**, traced.", "**Commitment ordering**.", "**Comparing the four**.", "**A faster database server**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The client-server database" },
    { fig: (function () {
      var it = [];
      [30, 95, 160].forEach(function (y, i) { it = it.concat(boxAt(20, y, 120, 44, "Client " + (i + 1), "accent", "sends SQL")); });
      it = it.concat(boxAt(300, 70, 150, 90, "Database server", "accent2", "DBMS: queries, locks"));
      it = it.concat(boxAt(490, 85, 90, 60, "Database", "good", "one copy"));
      [52, 117, 182].forEach(function (y) { it.push({ line: [[140, y], [300, 115]], c: "muted", w: 1.6, arrow: "both" }); });
      it = it.concat(arrow(450, 115, 490, 115, null, { both: true, c: "good" }));
      it.push(txt(220, 222, "requests (queries) in · results out", { size: 10.5 }));
      return { w: 600, h: 236, items: it, cap: "Many clients send requests to ONE server, which runs the DBMS, executes each query against the single shared database and returns the results." };
    })() },
    { kv: [
      ["Client server database", "the database is held on a **server**; client computers send requests (SQL queries / transactions) over a network; the server's DBMS processes them and returns the results"],
      ["Simultaneous access", "many clients can use the database at the same time"],
      ["Concurrent access", "two or more clients accessing — especially updating — the same data at the same time"],
      ["Transaction", "a single logical operation (possibly several SQL statements) that must happen completely or not at all"],
      ["Integrity", "the data is accurate and consistent — no update lost, no record half-changed"]
    ] },
    { table: { head: ["Benefit", "Because"], rows: [
      ["One consistent copy of the data", "every client reads and writes the same database"],
      ["Central security and backups", "access rights and backups managed in one place"],
      ["Less processing at the client", "the server does the searching and returns only results"],
      ["Concurrency can be controlled", "the DBMS sees every request, so it can enforce locks or ordering"]
    ] } },

    { page: "The lost update problem" },
    { callout: { t: "def", h: "Lost update", body: "Two clients read the same record, each changes its copy, and each writes it back. The **second write overwrites the first**, so the first client's update is **lost** — and the stored value is wrong." } },
    { fig: timeline([
      ["t1", "read stock = 10", "", 10],
      ["t2", "", "read stock = 10", 10],
      ["t3", "sell 3 → write 7", "", 7],
      ["t4", "", "sell 2 → write 8", 8, "b"],
      ["result", "", "A's sale lost — should be 5", 8, "b"]
    ], "Each client computed from a value that was out of date by the time it wrote. Correct answer 10 − 3 − 2 = 5; stored 8.") },
    { steps: [
      "Both users **read** (and edit) the same record at the same time.",
      "One user **saves**; then the other user **saves**.",
      "The second save **overwrites** the first, so the first user's update is **lost**."
    ] },
    { callout: { t: "warn", h: "\"Data is lost\" is not enough", body: "Say whose: \"the update made by the user who saved first is lost / overwritten by the user who saved second\". 2025 gave both marks only for that; \"data is lost\" is NE." } },

    { page: "Record locks" },
    { callout: { t: "def", h: "Record locking", body: "When a transaction starts to edit a record, the DBMS places an (exclusive) **lock** on that record. Other transactions **cannot edit (or access)** the record until the lock is **released** when the first transaction finishes." } },
    { fig: timeline([
      ["t1", "lock record; read 10", "", 10],
      ["t2", "", "request lock → WAIT", 10, "b"],
      ["t3", "write 7; release lock", "", 7],
      ["t4", "", "lock granted; read 7", 7],
      ["t5", "", "write 5; release", 5]
    ], "With a lock, B cannot read the record until A has written it back, so B works on the up-to-date value. Final 5 — nothing lost.") },
    { kv: [
      ["Lock granularity", "a lock on the RECORD lets others edit different records; locking a whole table or database is safer but blocks far more users (R. \"database/table\" in the mark scheme for record locks)"],
      ["Deadlock", "A has locked record 1 and waits for record 2; B has locked record 2 and waits for record 1 — neither can ever proceed"],
      ["Handling deadlock", "the DBMS detects the cycle (or a time-out) and aborts one transaction, which rolls back and is restarted; or always locks records in a fixed order"]
    ] },
    { fig: (function () {
      var it = [];
      it = it.concat(boxAt(40, 30, 130, 44, "Transaction A", "accent"));
      it = it.concat(boxAt(400, 30, 130, 44, "Transaction B", "accent2"));
      it = it.concat(boxAt(40, 130, 130, 40, "Record 1", "good"));
      it = it.concat(boxAt(400, 130, 130, 40, "Record 2", "good"));
      it = it.concat(arrow(105, 130, 105, 74, "holds", { c: "accent", dx: 22, dy: 10 }));
      it = it.concat(arrow(465, 130, 465, 74, "holds", { c: "accent2", dx: 22, dy: 10 }));
      it = it.concat(arrow(170, 60, 400, 140, "waits for", { c: "danger", dy: -14 }));
      it = it.concat(arrow(400, 64, 170, 144, "waits for", { c: "danger", dy: 26 }));
      return { w: 580, h: 190, items: it, cap: "Deadlock: each transaction holds the lock the other needs. Locks prevent lost updates but introduce this new problem." };
    })() },

    { page: "Serialisation" },
    { callout: { t: "def", h: "Serialisation", body: "Transactions that touch the same data are made to run **one after another** (or with an effect **equivalent** to running them one at a time, in some order), so no transaction ever works on data another is part-way through changing." } },
    { ul: [
      "A **serial** schedule: A runs completely, then B — no lost update possible.",
      "A **serialisable** schedule: operations interleave for speed, but the final result equals some serial order.",
      "Record locking and timestamp ordering are both ways of **guaranteeing** a serialisable result.",
      "Cost: transactions may wait, so throughput falls when many clients want the same records."
    ] },

    { page: "Timestamp ordering" },
    { callout: { t: "def", h: "Timestamp ordering", body: "Each **transaction** is given a **timestamp** when it starts, giving every transaction an order. For each record the DBMS stores the timestamp of the last transaction to **read** it and the last to **write** it. Before a read or write it applies rules; if processing the transaction would break the timestamp order (and so lose integrity), the transaction is **aborted** (rolled back and restarted with a new timestamp)." } },
    { table: { head: ["Transaction T wants to…", "Abort T if…", "Otherwise"], rows: [
      ["**read** the record", "the record's **write** timestamp > T's timestamp (a younger transaction has already changed it)", "read; set read timestamp = max(read TS, T)"],
      ["**write** the record", "the record's **read OR write** timestamp > T's timestamp (a younger transaction has already used it)", "write; set write timestamp = T"]
    ] } },
    { table: { head: ["Step", "Action", "Record RTS", "Record WTS", "Decision"], rows: [
      ["0", "start: T1 gets TS 10, T2 gets TS 12", "0", "0", "—"],
      ["1", "T1 reads stock (10)", "10", "0", "WTS 0 ≤ 10 → OK"],
      ["2", "T2 reads stock (10)", "12", "0", "WTS 0 ≤ 12 → OK"],
      ["3", "T1 tries to write 7", "12", "0", "RTS 12 > 10 → **abort T1**"],
      ["4", "T2 writes 8", "12", "12", "RTS 12 ≤ 12, WTS 0 ≤ 12 → OK"],
      ["5", "T1 restarts as TS 14, reads 8", "14", "12", "WTS 12 ≤ 14 → OK"],
      ["6", "T1 writes 8 − 3 = 5", "14", "14", "OK — final 5, nothing lost"]
    ] } },
    { callout: { t: "info", h: "Key idea", body: "No transaction ever **waits** for a lock, so there is no deadlock — the price is that some transactions are aborted and redone." } },

    { page: "Commitment ordering" },
    { callout: { t: "def", h: "Commitment ordering", body: "Transactions are allowed to run concurrently, but they are **committed** (their changes made permanent) in an order that is consistent with the order of their conflicting operations — so the result is serialisable. A transaction that would have to commit out of order is aborted. Because transactions are not blocked waiting for locks, it avoids **deadlock**." } },
    { ul: ["**Commit** = the point at which a transaction's changes become permanent.", "The DBMS tracks which transactions depend on (conflict with) which, and only commits a transaction after those it depends on.", "Suited to distributed databases, where many servers must agree on an order."] },

    { page: "Comparing the four" },
    { table: { head: ["Method", "How", "Strength", "Weakness"], rows: [
      ["Record locks", "lock a record while one transaction edits it; others wait", "simple; prevents lost updates", "waiting; **deadlock** possible"],
      ["Serialisation", "run conflicting transactions one after another (or equivalently)", "guarantees correctness", "less concurrency — slower under load"],
      ["Timestamp ordering", "per-transaction timestamps; per-record read/write timestamps; abort rule-breakers", "no waiting, no deadlock", "aborted transactions must be redone"],
      ["Commitment ordering", "commit in an order consistent with conflicts", "no deadlock; works across distributed servers", "more complex to implement; some aborts"]
    ] } },

    { page: "A faster database server" },
    { callout: { t: "info", h: "Key idea", body: "The 2018 12-mark essay asked how to speed up a bank's database server across **hardware**, **network** and **database and software**; it is worked in full in 4.7.3.7. The database-and-software strand belongs here:" } },
    { ul: [
      "Use a more efficient concurrency method — replace record/table locks with serialisation, timestamp or commitment ordering.",
      "**Index** the fields commonly searched on.",
      "Use more efficient algorithms (binary rather than linear search); compiled rather than interpreted code.",
      "Remove inefficiencies in the conceptual model (normalise) — or deliberately **denormalise** to cut joins.",
      "Distribute the data across several servers; consider a non-relational (NoSQL) system.",
      "Reduce other software on the server; run heavy jobs at quiet times; archive unused data."
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Without concurrency control (vets)", src: "A-level June 2019 · P2 Q06.4 · 3 marks",
      q: "A vet practice's database is at head office; staff at the surgeries access it through a client-server database system that manages concurrent access. Describe an example of a problem that could occur if no system were in place to manage concurrent access to the database.",
      steps: [
        { m: "Two users read and edit the same record simultaneously (e.g. two receptionists change one customer's telephone number);", mk: "1 mark", n: "NE. \"access the database simultaneously\" unless they then change it." },
        { m: "One user writes / saves the record back, then the other user saves it;", mk: "1 mark" },
        { m: "So one user's update is lost — the second overwrites the first;", mk: "1 mark", n: "Just \"the lost update problem\" earns 1 if nothing else does. NE. data is lost." }
      ], result: "The lost update problem" } },
    { worked: { tag: "exam", title: "Record locks or timestamp ordering", src: "A-level June 2019 · P2 Q06.5 · 2 marks",
      q: "Two methods that can be used to manage concurrent access are record locks and timestamp ordering. Select one of these methods and describe how it manages concurrent access.",
      steps: [
        { h: "Record locks", m: "When a user starts to edit a record an (exclusive) lock is set on the record;", mk: "1 mark", n: "R. database / file / table for record." },
        { m: "Other users cannot edit (A. access) the record until the lock is released / the first edit is complete;", mk: "1 mark" },
        { h: "OR timestamp ordering", m: "Timestamps are generated for each transaction; the database records the timestamp of the last read/write of each record; the server applies rules and aborts a transaction that would lose integrity — any two;", mk: "2 marks" }
      ], result: "Lock → others wait → release" } },
    { worked: { tag: "exam", title: "Timestamp ordering", src: "A-level June 2024 · P2 Q08.4 · 3 marks",
      q: "The shop's database can be accessed by many users simultaneously. Describe how timestamp ordering can be used to manage concurrent access to a database.",
      steps: [
        { m: "Timestamps are generated for each transaction / indicate the order transactions occurred in;", mk: "1 mark", n: "NE. transactions are processed in time order; R. timestamps for sales." },
        { m: "The database records the timestamp of the last read and/or last write transaction for each record;", mk: "1 mark", n: "R. file." },
        { m: "The server applies rules to decide whether processing a transaction would lose integrity and if so aborts it — e.g. abort a write if the record's read/write timestamp is later than the transaction's start; abort a read if the record's write timestamp is later;", mk: "1 mark" }
      ], result: "Transaction TS + record read/write TS + abort rules" } },
    { worked: { tag: "exam", title: "Two users edit one merit record", src: "A-level June 2025 · P2 Q06.5 · 2 marks",
      q: "The merits database can be accessed on any computer in the school, and two users might try to edit the same record simultaneously. Describe how this could cause a problem if the database system did not implement a method to manage concurrent access.",
      steps: [
        { m: "The update made by the user who saved the record first will be lost — the user who saved second overwrites it;", mk: "2 marks", n: "1 mark only for \"one user's update is lost / only one is kept\" (A. the lost update problem). NE. data is lost; talked out by wrong specifics (\"some of each user's changes are made\")." }
      ], result: "The first save is overwritten" } },
    { worked: { tag: "variation", title: "Trace the clash, then fix it", q: "Account balance £100. Client A deposits £50, client B withdraws £20, both reading before either writes. (a) What is stored without control? (b) What is stored with record locking? (c) Which new problem can locking cause?",
      steps: [
        { m: "(a) A reads 100, B reads 100; A writes 150; B writes 80 → **£80**: the deposit is lost.", mk: "1" },
        { m: "(b) A locks, reads 100, writes 150, releases; B then locks, reads 150, writes 130 → **£130**, the correct total.", mk: "1" },
        { m: "(c) **Deadlock** — if each transaction holds a lock the other needs, neither can finish; the DBMS must abort one.", mk: "1" }
      ], result: "£80, then £130; deadlock" } },
    { worked: { tag: "variation", title: "Apply the timestamp rules", q: "Record X has read timestamp 20 and write timestamp 15. Decide for each: (a) transaction T18 reads X (b) T18 writes X (c) T25 writes X (d) T12 reads X.",
      steps: [
        { m: "(a) WTS 15 ≤ 18 → **allowed**; RTS stays 20 (the max).", mk: "1" },
        { m: "(b) RTS 20 > 18 → **abort** T18 — a younger transaction has already read X.", mk: "1" },
        { m: "(c) RTS 20 ≤ 25 and WTS 15 ≤ 25 → **allowed**; WTS becomes 25.", mk: "1" },
        { m: "(d) WTS 15 > 12 → **abort** T12 — X was changed by a younger transaction.", mk: "1" }
      ], result: "allow, abort, allow, abort" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe a problem (no concurrency control)", "Two users edit the SAME record at once → one saves, then the other → the first's update is lost/overwritten."],
      ["Describe record locks", "Lock the RECORD when editing starts → others cannot edit until it is released."],
      ["Describe timestamp ordering", "Timestamp per transaction; read/write timestamps per record; rules → abort transactions that would lose integrity."],
      ["Explain how to improve performance", "Point + why it helps, across every area the question names (see 4.7.3.7)."]
    ] } },
    { callout: { t: "tip", h: "Reading an AQA mark scheme", body: ["Each creditworthy point ends in a semicolon and earns one mark; **Max n** caps the total.", "**NE.** \"data is lost\", \"accessed at the same time\" without an edit, \"processed in time order\" without timestamps. **R.** a lock on the database / table / file when record locks were asked."] } },
    { callout: { t: "mnemonic", h: "\"Read, Read, Write, Write — one's out of sight\"", body: "The lost update: both READ, both WRITE, the first write disappears. Four fixes — **L**ocks, **S**erialisation, **T**imestamps, **C**ommitment: \"**L**et **S**omeone **T**ake **C**are\"." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Locking the whole database instead of the record.", "Timestamping the DATA or the sale instead of the transaction.", "\"Data is lost\" without saying whose update.", "Describing access without an edit — reading alone loses nothing.", "Forgetting that locks can deadlock."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.10.4 the clashing operations are UPDATE statements; 4.9.4.10 the client-server model and thin clients; 4.7.3.7 and the 2018 essay — server performance; 4.12 and 4.11.1 immutable data in functional programs avoids shared-state races; 4.6.1.4 the OS also schedules competing processes." } }
  ],
  flashcards: [
    ["Client server database?", "The database is on a server; clients send queries over a network and the server's DBMS returns results; many clients have simultaneous access."],
    ["Lost update problem?", "Two users edit the same record; the second save overwrites the first, so the first update is lost."],
    ["Record locking?", "A record is locked while one transaction edits it; others cannot edit it until the lock is released."],
    ["Deadlock?", "Two transactions each hold a lock the other needs, so neither can continue."],
    ["Serialisation?", "Conflicting transactions run one after another (or with an equivalent result)."],
    ["Timestamp ordering?", "Each transaction gets a timestamp; each record stores last read/write timestamps; transactions that would break the order are aborted."],
    ["Timestamp rule for a write?", "Abort if the record's read or write timestamp is later than the transaction's."],
    ["Timestamp rule for a read?", "Abort if the record's write timestamp is later than the transaction's."],
    ["Commitment ordering?", "Transactions commit in an order consistent with their conflicts; avoids deadlock."],
    ["Which method can deadlock?", "Record locking."]
  ],
  quiz: [
    { q: "Stock 10; A sells 3 and B sells 2, both reading before either writes, B writing last. Stored value?", opts: ["8", "5", "7", "10"], ans: 0, why: "B overwrote A's 7 with 10 − 2." },
    { q: "Record locks are set on", opts: ["the record being edited", "the whole database", "the network", "the client"], ans: 0, why: "R. database/table/file." },
    { q: "A record's write TS is 30; transaction T25 wants to read it. Outcome?", opts: ["abort T25", "allow", "wait for a lock", "deadlock"], ans: 0, why: "Write TS later than T's." },
    { q: "Which method never makes a transaction wait for a lock?", opts: ["timestamp ordering", "record locking", "table locking", "manual locking"], ans: 0, why: "It aborts instead of waiting." },
    { q: "\"Data is lost\" as the description of the problem scores", opts: ["NE.", "2 marks", "1 mark", "full marks"], ans: 0, why: "Say whose update is lost." },
    { q: "Deadlock is a risk of", opts: ["record locking", "timestamp ordering", "normalisation", "indexing"], ans: 0, why: "Circular waiting for locks." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
