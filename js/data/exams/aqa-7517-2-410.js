/* Kurenai OS — js/data/exams/aqa-7517-2-410.js
   AQA 7517 Paper 2, the exhaustive Companion: 4.10 Fundamentals of
   databases, 4.11 Big Data, 4.12 Fundamentals of functional programming,
   and the paper's extended answers. AUTHORED, original (see
   aqa-7517-2-45.js for the shape and the rules). Every SQL statement was
   run against SQLite on the sample tables before it was written; every
   functional result was evaluated.                                       */
(function () {
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var D = X.deep = X.deep || {};
  var P = D["aqa-7517-2"] = D["aqa-7517-2"] || { leaves: {} };
  var L = P.leaves;
  var GYM = "A gym's database: Member(**MemberID**, FirstName, Surname, JoinDate), Trainer(**TrainerID**, Name), Class(**ClassID**, ClassName, TrainerID, ClassDay), Booking(**MemberID**, **ClassID**, **BookingDate**). Primary keys are in bold.";

  /* ================= 4.10 Databases ================= */
  L["4.10.1"] = {
    archetypes: [{
      id: "cs.er-diagram",
      rules: ["Draw each entity as a box, each relationship as a line; the crow's foot is on the MANY end.",
        "Decide the degree from what the data STORES over time, not what is true at one moment.",
        "A many-to-many relationship becomes two one-to-many relationships through a link entity."],
      traps: [{ sitting: "2022-06", q: "Q07.2", text: "One-to-one was drawn because an animal is in one place NOW, but the table kept history: one-to-many. Read what the table stores." }],
      variations: [
        { v: "A", t: "Degree of a relationship", m: 2, q: GYM + " State the degree of the relationships between Trainer and Class, and between Member and Booking.",
          steps: [["Trainer to Class: one-to-many (a trainer takes many classes; each class has one trainer).", "MP1", ""], ["Member to Booking: one-to-many (a member makes many bookings; each booking is for one member).", "MP2", ""]] },
        { v: "B", t: "History changes the degree", m: 2, q: "A library records which locker each student uses. Explain why the relationship between Student and Locker is one-to-many if past allocations are kept, though each student has one locker at a time.",
          steps: [["Kept over time, one locker is used by many students in turn (and a student may have several lockers over the years).", "MP1", ""], ["The stored data has many allocation records per locker, so it cannot be modelled one-to-one.", "MP2", ""]] },
        { v: "C", t: "Resolve many-to-many", m: 3, q: "Members attend many classes and each class has many members. Show how this is represented in a relational design.",
          steps: [["Member and Class have a many-to-many relationship.", "MP1", ""], ["Add a link entity, Booking, with MemberID and ClassID as foreign keys.", "MP2", ""], ["Member–Booking and Class–Booking are both one-to-many.", "MP3", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Which end of a relationship line carries the crow's foot?", ["The 'many' end (1)"]],
      [1, 1, "State the degree of the relationship between Country and Capital City.", ["One-to-one (1)"]],
      [2, 2, "A hospital: each patient is assigned one ward; each ward has many patients. Draw (describe) the relationship and its degree.", ["Ward to Patient (1)", "One-to-many, crow's foot at Patient (1)"]],
      [2, 2, "Explain why a relational database cannot directly implement a many-to-many relationship.", ["A foreign key field holds one value (1)", "So a link table is needed (1)"]],
      [3, 3, "Students take many subjects and each subject has many students; each subject has one teacher who may teach several subjects. Describe the entities and relationships.", ["Student, Subject, Teacher, link entity Enrolment (1)", "Student–Enrolment and Subject–Enrolment one-to-many (1)", "Teacher–Subject one-to-many (1)"]],
      [3, 2, "Explain why entity identifiers are needed on an ER diagram.", ["They uniquely identify each entity occurrence (1)", "So relationships can be implemented with foreign keys (1)"]]
    ]
  };

  L["4.10.2"] = {
    archetypes: [{
      id: "cs.keys",
      rules: ["Primary key: uniquely identifies each record. Composite key: two or more attributes that together do so. Foreign key: an attribute that is the primary key of another table.",
        "A composite key carries an ASSUMPTION: that the combination never repeats — say what it is in context."],
      traps: [],
      variations: [
        { v: "A", t: "The assumption behind a composite key", m: 1, q: GYM + " State the assumption made by Booking's composite primary key.",
          steps: [["A member never books the same class twice on the same date.", "MP1", ""]] },
        { v: "B", t: "An alternative primary key", m: 1, q: "A table Result(StudentID, ExamCode, Mark) uses StudentID and ExamCode as its key. Suggest another way to give each row a primary key.",
          steps: [["Add a single unique identifier such as ResultID.", "MP1", ""]] },
        { v: "C", t: "Primary and foreign keys", m: 2, q: GYM + " Identify a foreign key in Class and explain its purpose.",
          steps: [["TrainerID in Class is a foreign key.", "MP1", ""], ["It links each class to the record of its trainer in Trainer.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Define primary key.", ["An attribute (or set) that uniquely identifies each record (1)"]],
      [1, 1, "Define foreign key.", ["An attribute in one table that is the primary key of another (1)"]],
      [2, 2, "Explain a limitation of using (Surname, DateOfBirth) as a composite key for customers.", ["Two customers can share both (1)", "So records would not be unique / one could not be stored (1)"]],
      [2, 1, "State the primary key of a table Loan(BookID, MemberID, LoanDate, ReturnDate) if a book can be borrowed many times.", ["(BookID, LoanDate) or a new LoanID (1)"]],
      [3, 2, "Explain why a surrogate key such as OrderID is often preferred to a natural composite key.", ["Guaranteed unique, never changes (1)", "Shorter, simpler foreign keys in other tables (1)"]],
      [3, 2, "A design uses Email as the primary key of Customer. Give one advantage and one disadvantage.", ["Advantage: already unique per customer (1)", "Disadvantage: emails change, breaking links / long key (1)"]]
    ]
  };

  L["4.10.3"] = {
    archetypes: [{
      id: "cs.normalise",
      rules: ["1NF: atomic values, no repeating groups. 2NF: no attribute depends on only PART of a composite key. 3NF: no attribute depends on another non-key attribute.",
        "Normalising removes redundancy, so no update anomalies and no inconsistency.",
        "Deleting a parent record still referenced by others breaks REFERENTIAL INTEGRITY — use the term."],
      traps: [{ sitting: "2023-06", q: "Q05.1", text: "Two errors: keeping an attribute that follows from another in the same table (a redundant field derivable via its key), and putting a booking of several seats in one relation — it needs two." },
        { sitting: "2022-06", q: "Q07.5", text: "Adding a redundant attribute: the advantage is a one-table query with no join; the disadvantage is redundancy, so more storage and possible inconsistency when one copy is updated." }],
      variations: [
        { v: "A", t: "Why normalise", m: 2, q: "Explain why database designs are normalised.",
          steps: [["Each fact is stored once, so there is no redundant (duplicated) data.", "MP1", ""], ["So updates happen in one place, with no inconsistency and no update, insertion or deletion anomalies.", "MP2", ""]] },
        { v: "B", t: "Normalise a flat table", m: 4, q: "A flat table stores BookingRef, MemberID, MemberName, ClassID, ClassName, TrainerName for every booking. Produce a set of relations in 3NF.",
          steps: [["Member(**MemberID**, MemberName).", "MP1", ""], ["Trainer(**TrainerID**, TrainerName) — TrainerName depends on the trainer, not the class booking.", "MP2", ""], ["Class(**ClassID**, ClassName, TrainerID).", "MP3", ""], ["Booking(**BookingRef**, MemberID, ClassID), with foreign keys.", "MP4", ""]] },
        { v: "C", t: "A denormalising attribute", m: 2, q: "A designer adds TrainerName to Class to avoid a join. Give one advantage and one disadvantage.",
          steps: [["Advantage: a query for a class and its trainer reads one table, with no join, so faster.", "MP1", ""], ["Disadvantage: the name is stored twice; if it changes in one place the data becomes inconsistent.", "MP2", ""]] },
        { v: "D", t: "Referential integrity", m: 2, q: GYM + " Explain the problem if a Class record is deleted while Booking records refer to it.",
          steps: [["Bookings would have a ClassID that matches no class: referential integrity is broken.", "MP1", ""], ["The DBMS should refuse the delete, or cascade it to the bookings, enforced by the foreign key.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "State the condition a table must meet to be in first normal form.", ["Atomic values / no repeating groups (1)"]],
      [1, 1, "Which normal form removes attributes that depend on part of a composite key?", ["Second normal form (1)"]],
      [2, 2, "Order(OrderID, CustomerID, CustomerTown, OrderDate). Explain why it is not in 3NF and fix it.", ["CustomerTown depends on CustomerID, a non-key attribute (1)", "Customer(CustomerID, CustomerTown); Order(OrderID, CustomerID, OrderDate) (1)"]],
      [2, 2, "Give two problems with a database that is not normalised.", ["Redundant data wastes storage (1)", "Update anomalies / inconsistency (1)"]],
      [3, 3, "Enrolment(StudentID, CourseID, StudentName, CourseTitle, Grade) has key (StudentID, CourseID). Normalise it to 3NF.", ["Student(StudentID, StudentName) (1)", "Course(CourseID, CourseTitle) (1)", "Enrolment(StudentID, CourseID, Grade) (1)"]],
      [3, 2, "Explain why a fully normalised design may be slower for some queries.", ["Data is split across tables (1)", "Queries need joins, which take time (1)"]]
    ]
  };

  L["4.10.4"] = {
    archetypes: [
      { id: "cs.sql-select",
        rules: ["SELECT the fields (table.field when names repeat) FROM the tables WHERE the join conditions AND the filters ORDER BY (ASC is default, DESC to reverse).",
          "One join condition for each pair of linked tables.",
          "Strings and dates in quotes; numbers not.",
          "Overlapping periods: a stay overlaps [X, Y) when it arrives before Y AND leaves after X."],
        traps: [{ sitting: "2022-06", q: "Q07.4", text: "The structure and the join were usually right; the date conditions that catch EVERY overlapping stay were the hard part. Test your condition against stays that start before, end after, and lie inside the range." }],
        variations: [
          { v: "A", t: "One table, a condition and an order", m: 3, q: GYM + " Write SQL to list the first names and surnames of members who joined on or after 1 January 2026, in surname order.",
            steps: [["SELECT FirstName, Surname FROM Member", "MP1", ""], ["WHERE JoinDate >= '2026-01-01'", "MP2", "Date in quotes"], ["ORDER BY Surname", "MP3", ""]] },
          { v: "B", t: "Three tables joined", m: 5, q: GYM + " Write SQL to list the first name and surname of every member booked on a class called Spin, in surname order.",
            steps: [["SELECT Member.FirstName, Member.Surname", "MP1", ""], ["FROM Member, Booking, Class", "MP2", ""], ["WHERE Member.MemberID = Booking.MemberID", "MP3", "First join"], ["AND Booking.ClassID = Class.ClassID AND Class.ClassName = 'Spin'", "MP4", "Second join and the filter"], ["ORDER BY Member.Surname", "MP5", ""]],
            methods: [{ name: "Method 1", rec: true, when: "List the tables in FROM and put every join in WHERE. AQA's own style; each condition earns its mark.", lines: [["SELECT Member.FirstName, Member.Surname FROM Member, Booking, Class", "MP1 MP2"], ["WHERE Member.MemberID = Booking.MemberID AND Booking.ClassID = Class.ClassID", "MP3"], ["AND Class.ClassName = 'Spin' ORDER BY Member.Surname", "MP4 MP5"]] },
              { name: "Method 2", when: "JOIN … ON. Equally accepted; keeps joins apart from filters.", lines: [["SELECT Member.FirstName, Member.Surname FROM Member", "MP1"], ["JOIN Booking ON Member.MemberID = Booking.MemberID", "MP2 MP3"], ["JOIN Class ON Booking.ClassID = Class.ClassID WHERE Class.ClassName = 'Spin'", "MP4"], ["ORDER BY Member.Surname", "MP5"]] }] },
          { v: "C", t: "Overlapping dates", m: 4, q: "A hotel table Stay(**StayID**, RoomNo, Arrive, Leave) records stays (a guest leaves on the morning of Leave). Write SQL to list the RoomNo, Arrive and Leave of every stay that overlaps the nights from 5 July 2026 to 8 July 2026 (arriving 5th, leaving 8th), in room order.",
            steps: [["SELECT RoomNo, Arrive, Leave FROM Stay", "MP1", ""], ["WHERE Arrive < '2026-07-08'", "MP2", "Starts before the period ends"], ["AND Leave > '2026-07-05'", "MP3", "Ends after the period starts"], ["ORDER BY RoomNo", "MP4", ""]],
            trap: "\"Arrive >= '2026-07-05' AND Leave <= '2026-07-08'\" only finds stays INSIDE the period and misses one that started earlier or ends later." },
          { v: "D", t: "Find the errors", m: 2, q: "Find two errors: `SELECT ClassName, ClassDay FROM Class, Trainer WHERE Trainer.Name = Bea ORDER Class.ClassDay`",
            steps: [["The string needs quotes: Trainer.Name = 'Bea' (and the join Class.TrainerID = Trainer.TrainerID is missing).", "MP1", ""], ["ORDER needs BY: ORDER BY Class.ClassDay.", "MP2", ""]] }
        ] },
      { id: "cs.sql-ddl",
        rules: ["CREATE TABLE Name ( field TYPE, field TYPE, …, PRIMARY KEY (field), FOREIGN KEY (field) REFERENCES Other(field) )",
          "The field NAME comes before its TYPE; a comma after every definition but the last.",
          "Types: INT, VARCHAR(n), CHAR(n), DATE, TIME, BOOLEAN, FLOAT/REAL."],
        traps: [{ sitting: "2022-06", q: "Q07.3", text: "Under a quarter got full marks. Traps: the data type written before the field name, and missing commas between definitions. The syntax must be exact." }],
        variations: [
          { v: "A", t: "Complete a CREATE TABLE", m: 3, q: GYM + " Write the SQL to create the Class table.",
            steps: [["CREATE TABLE Class ( ClassID INT, ClassName VARCHAR(20), TrainerID INT, ClassDay VARCHAR(9),", "MP1", "Names then types, commas"], ["PRIMARY KEY (ClassID),", "MP2", ""], ["FOREIGN KEY (TrainerID) REFERENCES Trainer(TrainerID) )", "MP3", ""]] },
          { v: "B", t: "A composite key", m: 2, q: GYM + " Write the key definitions for the Booking table.",
            steps: [["PRIMARY KEY (MemberID, ClassID, BookingDate)", "MP1", ""], ["FOREIGN KEY (MemberID) REFERENCES Member(MemberID), FOREIGN KEY (ClassID) REFERENCES Class(ClassID)", "MP2", ""]] },
          { v: "C", t: "Find the errors", m: 2, q: "Find two errors: `CREATE TABLE Trainer ( INT TrainerID Name VARCHAR(30), PRIMARY KEY TrainerID )`",
            steps: [["The type follows the name, and a comma is needed: TrainerID INT, Name VARCHAR(30).", "MP1", ""], ["The key field must be in brackets: PRIMARY KEY (TrainerID).", "MP2", ""]] }
        ] },
      { id: "cs.sql-dml",
        rules: ["INSERT INTO Table (fields) VALUES (values) — values in the same order.",
          "UPDATE Table SET field = value WHERE condition. DELETE FROM Table WHERE condition.",
          "Without WHERE, UPDATE and DELETE change EVERY row. Use only the tables the statement needs."],
        traps: [{ sitting: "2023-06", q: "Q05.2", text: "The errors were an unneeded extra table in the statement and a date without quotes. Deleting rows still referenced elsewhere breaks referential integrity — use the term." }],
        variations: [
          { v: "A", t: "INSERT a record", m: 2, q: GYM + " Write SQL to record that member 11 has booked class 101 on 13 October 2026.",
            steps: [["INSERT INTO Booking (MemberID, ClassID, BookingDate)", "MP1", ""], ["VALUES (11, 101, '2026-10-13')", "MP2", "Date quoted"]] },
          { v: "B", t: "UPDATE a field", m: 3, q: GYM + " Trainer 1 now takes class 101. Write the SQL.",
            steps: [["UPDATE Class", "MP1", ""], ["SET TrainerID = 1", "MP2", ""], ["WHERE ClassID = 101", "MP3", "Without it every class changes"]] },
          { v: "C", t: "DELETE with a condition", m: 2, q: GYM + " Write SQL to delete all bookings made before 6 October 2026.",
            steps: [["DELETE FROM Booking", "MP1", ""], ["WHERE BookingDate < '2026-10-06'", "MP2", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "Which SQL keyword sorts results?", ["ORDER BY (1)"], { arch: "cs.sql-select" }],
      [1, 1, "Which SQL command adds a new record?", ["INSERT INTO (1)"], { arch: "cs.sql-dml" }],
      [2, 3, GYM + " Write SQL to list the names and days of the classes taken by the trainer called Bea, in day order.", ["SELECT Class.ClassName, Class.ClassDay FROM Class, Trainer (1)", "WHERE Class.TrainerID = Trainer.TrainerID AND Trainer.Name = 'Bea' (1)", "ORDER BY Class.ClassDay (1)"], { arch: "cs.sql-select" }],
      [2, 3, "Write SQL to create Member(MemberID, FirstName, Surname, JoinDate) with MemberID as primary key.", ["CREATE TABLE Member (MemberID INT, FirstName VARCHAR(20), Surname VARCHAR(30), (1)", "JoinDate DATE, (1)", "PRIMARY KEY (MemberID)) (1)"], { arch: "cs.sql-ddl" }],
      [3, 4, GYM + " Write SQL to list, in reverse surname order, the surnames of the members booked on class 101.", ["SELECT Member.Surname FROM Member, Booking (1)", "WHERE Member.MemberID = Booking.MemberID (1)", "AND Booking.ClassID = 101 (1)", "ORDER BY Member.Surname DESC (1)"], { arch: "cs.sql-select" }],
      [3, 2, "Explain what happens if `UPDATE Member SET Surname = 'Hart'` is run without a WHERE clause, and how to prevent it.", ["Every member's surname becomes Hart (1)", "Add WHERE MemberID = … to target one record (1)"], { arch: "cs.sql-dml" }]
    ]
  };

  L["4.10.5"] = {
    archetypes: [{
      id: "cs.concurrency",
      rules: ["The problem: two transactions read the same record, each changes it, and the second write overwrites the first — a LOST UPDATE.",
        "Fixes: record locking; serialisation; timestamp ordering (each transaction and record has timestamps; an older transaction may not overwrite a newer read/write); commitment ordering.",
        "Describe HOW the fix works, not just its name."],
      traps: [],
      variations: [
        { v: "A", t: "The problem", m: 3, q: "Two booking clerks open the record for the last seat on a flight at the same time. Explain the problem if there is no concurrency control.",
          steps: [["Both read the record showing one seat left.", "MP1", ""], ["Each sells the seat and writes the record back.", "MP2", ""], ["The second write overwrites the first: an update is lost and the seat is sold twice.", "MP3", ""]] },
        { v: "B", t: "Record locking", m: 2, q: "Explain how record locking prevents the problem.",
          steps: [["When one transaction accesses the record it is locked.", "MP1", ""], ["Others cannot change (or read) it until the lock is released, so updates happen one at a time.", "MP2", ""]] },
        { v: "C", t: "Timestamp ordering", m: 3, q: "Explain how timestamp ordering manages concurrent access.",
          steps: [["Each transaction is given a timestamp when it starts.", "MP1", ""], ["Each record stores the timestamps of its last read and last write.", "MP2", ""], ["A transaction may not write a record if a newer transaction has already read or written it; it is aborted and restarted.", "MP3", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Name the problem when one transaction's write overwrites another's.", ["Lost update (1)"]],
      [1, 1, "Name one method of concurrency control.", ["Record locking / serialisation / timestamp ordering / commitment ordering (1)"]],
      [2, 2, "Explain one disadvantage of record locking.", ["Other users must wait (1)", "Deadlock can occur when two transactions each hold a lock the other needs (1)"]],
      [2, 2, "Explain what serialisation means in concurrency control.", ["Transactions are run so the effect is as if one ran after another (1)", "So they cannot interleave on the same data (1)"]],
      [3, 3, "Two transactions T1 (timestamp 10) and T2 (timestamp 12) both read a record; T1 then tries to write it. Explain what timestamp ordering does.", ["The record's read timestamp is 12, newer than T1 (1)", "T1's write would conflict with a newer read (1)", "So T1 is aborted and restarted (1)"]],
      [3, 2, "Explain why client–server databases need concurrency control more than a single-user database.", ["Many clients access the shared data at once (1)", "So simultaneous updates to the same record are likely (1)"]]
    ]
  };

  /* ================= 4.11 Big Data ================= */
  L["4.11.1"] = {
    archetypes: [
      { id: "cs.big-data",
        rules: ["Volume: too big for one server. Velocity: arrives and must be processed very fast (often in real time). Variety: structured and unstructured — it does not fit a relational table.",
          "Processing is spread across many servers."],
        traps: [{ sitting: "2023-06", q: "Q08.1", text: "Velocity means data arriving and needing processing VERY fast — beyond what a traditional relational system could keep up with." }],
        variations: [
          { v: "A", t: "The three characteristics", m: 3, q: "Describe the three characteristics that make data Big Data.",
            steps: [["Volume: too much data to fit on or be processed by a single server.", "MP1", ""], ["Velocity: data arrives continuously at high speed and needs processing quickly (often in real time).", "MP2", ""], ["Variety: many types and forms, much of it unstructured (text, images, video), which does not fit relational tables.", "MP3", ""]] },
          { v: "B", t: "Why not a relational database", m: 2, q: "Explain why a relational database is often unsuitable for Big Data.",
            steps: [["Unstructured data does not fit fixed rows and columns.", "MP1", ""], ["It runs on one server, which cannot hold or process the volume quickly enough.", "MP2", ""]] },
          { v: "C", t: "Velocity in context", m: 1, q: "A city's traffic sensors send readings every second. Explain which characteristic of Big Data this shows.",
            steps: [["Velocity: data streams in very fast and must be processed as it arrives.", "MP1", ""]] }
        ] },
      { id: "cs.graph-schema",
        rules: ["A fact-based model stores each fact once as an immutable, timestamped fact.",
          "A graph schema: nodes (entities, ovals) with properties (rectangles), and edges (labelled arrows) for relationships."],
        traps: [],
        variations: [
          { v: "A", t: "Complete a graph schema", m: 3, q: "Draw (describe) a graph schema for: a user follows other users and posts photos; a photo has a caption and a time.",
            steps: [["Nodes: User and Photo.", "MP1", ""], ["Edges: User —follows→ User; User —posts→ Photo.", "MP2", ""], ["Properties: Photo has caption and time (and User a name).", "MP3", ""]] },
          { v: "B", t: "Extend a schema", m: 2, q: "Extend that schema so users can like photos.",
            steps: [["A new edge labelled likes from User to Photo.", "MP1", ""], ["With a property such as when it was liked.", "MP2", ""]] },
          { v: "C", t: "Why fact-based", m: 2, q: "Explain why a fact-based model stores facts as immutable.",
            steps: [["Facts are never updated or deleted, only added, with a timestamp.", "MP1", ""], ["So the full history is kept and the data is easy to distribute and recover.", "MP2", ""]] }
        ] },
      { id: "cs.fp-distribution",
        rules: ["Give the FEATURE with its EFFECT: immutable data and no side effects mean pieces can run on different servers in any order and give the same result.",
          "Higher-order functions (map, filter, fold) split naturally across machines."],
        traps: [{ sitting: "2023-06", q: "Q08.3", text: "A single word (\"immutable\") was not enough. Give the features with their effect: immutable data, no side effects, so parts can run on different servers in any order." }],
        variations: [
          { v: "A", t: "Why functional code distributes", m: 2, q: "Explain two features of functional programming that make it easier to process Big Data across many servers.",
            steps: [["Data is immutable, so no server's computation can change data another server is using.", "MP1", ""], ["Functions have no side effects (stateless), so pieces can run in parallel in any order and give the same result.", "MP2", ""]] },
          { v: "B", t: "Map and fold across servers", m: 2, q: "Explain how map and fold suit counting words in a huge set of documents spread over many servers.",
            steps: [["Each server maps over its own documents independently, producing word counts.", "MP1", ""], ["The partial counts are combined with a fold (reduce) into the total.", "MP2", ""]] },
          { v: "C", t: "Higher-order functions", m: 1, q: "State why higher-order functions help distribute work.",
            steps: [["The same function can be passed to every server and applied to that server's portion of the data.", "MP1", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "Name the characteristic of Big Data that describes its many formats.", ["Variety (1)"], { arch: "cs.big-data" }],
      [1, 1, "In a graph schema, what does an edge represent?", ["A relationship between nodes (1)"], { arch: "cs.graph-schema" }],
      [2, 2, "Explain why a supermarket's loyalty-card data might be Big Data.", ["Millions of transactions (volume) arriving continuously (velocity) (1)", "Mixed data: baskets, times, locations, online activity (variety) (1)"], { arch: "cs.big-data" }],
      [2, 2, "Explain why immutability helps when data is copied to many servers.", ["Copies never become inconsistent, as data is never changed (1)", "No locking needed between servers (1)"], { arch: "cs.fp-distribution" }],
      [3, 3, "Describe a graph schema for films, actors and directors, where actors appear in films and each film has a director.", ["Nodes Film, Actor, Director (1)", "Edges actedIn (Actor→Film), directed (Director→Film) (1)", "Properties, e.g. title/year, name (1)"], { arch: "cs.graph-schema" }],
      [3, 2, "Explain why Big Data processing is split across many machines rather than one powerful server.", ["The data is too large / arrives too fast for one machine (1)", "Many machines work in parallel and storage scales by adding more (1)"], { arch: "cs.big-data" }]
    ]
  };

  /* ================= 4.12 Functional programming ================= */
  var FP_TRAP = { sitting: "2022-06", q: "Q12.3", text: "Write a list result IN BRACKETS. Tracing the recursive functions was the discriminator, and a purpose must be specific (\"the average °C of a list of °F readings\", not \"averages a list\")." };
  L["4.12.1.1"] = {
    archetypes: [{
      id: "cs.fp-type",
      rules: ["A function maps its domain (the set its inputs come from) to its co-domain (the set its outputs are drawn from): $f: A \\to B$.",
        "The co-domain is the set the outputs are TAKEN FROM; not every value in it need be produced.",
        "Name the number set precisely: ℕ, ℤ, ℚ, ℝ."],
      traps: [],
      variations: [
        { v: "A", t: "Domain and co-domain", m: 2, q: "`square :: Int -> Int` returns its argument squared. State the domain and co-domain, and one value in the co-domain it never returns.",
          steps: [["Domain and co-domain: the integers (ℤ).", "MP1", ""], ["It never returns a negative number, e.g. $-1$ (or 2): the co-domain need not all be used.", "MP2", ""]] },
        { v: "B", t: "The type of a function", m: 1, q: "`isEven` takes an integer and returns True or False. Write its function type.",
          steps: [["$isEven: ℤ \\to \\{True, False\\}$ (Int -> Bool).", "MP1", ""]] },
        { v: "C", t: "A list function's co-domain", m: 1, q: "`len` returns the number of items in a list. Describe its co-domain.",
          steps: [["The natural numbers ℕ (0, 1, 2, …): a count is never negative or fractional.", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "What is the domain of a function?", ["The set of values its inputs are drawn from (1)"]],
      [1, 1, "Write the type of a function that takes a real number and returns an integer.", ["ℝ → ℤ / Float -> Int (1)"]],
      [2, 2, "`half` maps integers to reals by dividing by 2. State its domain and co-domain.", ["Domain ℤ (1)", "Co-domain ℝ (or ℚ) (1)"]],
      [2, 1, "Explain why the co-domain of `abs :: Int -> Int` contains values abs never returns.", ["Negative integers are in the co-domain but abs always returns ≥ 0 (1)"]],
      [3, 2, "A function `fibonacci` returns the nth Fibonacci number for n ≥ 0. Give its function type in set notation.", ["Domain ℕ (1)", "fibonacci: ℕ → ℕ (1)"]],
      [3, 2, "Explain the difference between a function's co-domain and its range (image).", ["Co-domain: the set outputs are drawn from (1)", "Range: the outputs actually produced, a subset of it (1)"]]
    ]
  };

  L["4.12.1.2"] = {
    archetypes: [{
      id: "cs.first-class", title: "Functions as first-class objects",
      match: "first-class|higher-order function is|which function uses|how many of the functions",
      rules: ["A first-class object can be passed as an argument, returned from a function, and assigned to a name or stored in a data structure.",
        "In a functional language, functions are first-class: that is what makes higher-order functions possible."],
      traps: [],
      variations: [
        { v: "A", t: "What first-class means", m: 2, q: "Explain what is meant by functions being first-class objects.",
          steps: [["They can be used like any other value: passed as arguments and returned as results.", "MP1", ""], ["They can be assigned to variables / stored in data structures.", "MP2", ""]] },
        { v: "B", t: "Spot a higher-order function", m: 1, q: "Which of these uses a higher-order function: `total xs = fold (+) 0 xs`, `double x = x * 2`, `first (x:xs) = x`?",
          steps: [["`total`: fold takes the function (+) as an argument.", "MP1", ""]] },
        { v: "C", t: "What a higher-order function is", m: 1, q: "Define a higher-order function.",
          steps: [["A function that takes a function as an argument or returns a function as its result (or both).", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Give one thing that can be done with a first-class object.", ["Passed as an argument / returned / assigned (1)"]],
      [1, 1, "Name a higher-order function that applies a function to every item of a list.", ["map (1)"]],
      [2, 2, "Explain why `map` is a higher-order function.", ["It takes a function as its argument (1)", "and applies it to each element of a list (1)"]],
      [2, 1, "How many of these use a higher-order function: `a = map f xs`, `b = filter p xs`, `c = head xs`?", ["Two (a and b) (1)"]],
      [3, 2, "Explain how returning a function from a function allows partial application.", ["A function given some arguments returns a new function (1)", "which waits for the remaining arguments (1)"]],
      [3, 2, "Give an example of storing functions in a list and using them.", ["e.g. fs = [(+1), (*2)] (1)", "map (\\f -> f 3) fs = [4, 6] (1)"]]
    ]
  };

  L["4.12.1.3"] = {
    archetypes: [
      { id: "cs.fp-apply", title: "Function application: evaluate a call",
        match: "evaluate|apply a function|results of",
        rules: ["Function application means giving a function its arguments: `f 3`.",
          "A function of several arguments takes them one at a time: `add 3 4` is `(add 3) 4`.",
          "Evaluate inner calls first and write each intermediate result."],
        traps: [FP_TRAP],
        variations: [
          { v: "A", t: "Evaluate nested calls", m: 2, q: "`f x = x + 4` and `g x = x * 2`. Evaluate `g (f 3)` and `f (g 3)`.",
            steps: [["`g (f 3)` = g 7 = 14.", "MP1", ""], ["`f (g 3)` = f 6 = 10.", "MP2", ""]] },
          { v: "B", t: "A two-argument function", m: 1, q: "`area w h = w * h`. Evaluate `area 6 4` and say how many arguments area takes.",
            steps: [["24; it takes two arguments, one at a time.", "MP1", ""]] },
          { v: "C", t: "A function of a list", m: 2, q: "`celsius f = (f - 32) * 5 / 9`. Evaluate `map celsius [212, 32, 50]` and state what the function does.",
            steps: [["[100, 0, 10] — in brackets.", "MP1", ""], ["Converts a list of Fahrenheit temperatures to Celsius.", "MP2", "Specific purpose"]] }
        ] },
      { id: "cs.recursion-define",
        rules: ["A recursive function calls itself, and has a base case that does not, so it terminates.",
          "Over a list: the base case is usually the empty list."],
        traps: [],
        variations: [
          { v: "A", t: "Which functions are recursive", m: 1, q: "Which is recursive: `len [] = 0; len (x:xs) = 1 + len xs`, or `double x = x * 2`?",
            steps: [["`len`: it calls itself on the tail.", "MP1", ""]] },
          { v: "B", t: "True statements about recursion", m: 2, q: "State two features every correct recursive function has.",
            steps: [["A base case that returns without calling itself.", "MP1", ""], ["A general case that calls itself on a smaller problem, moving towards the base case.", "MP2", ""]] },
          { v: "C", t: "Why naive recursion can be slow", m: 2, q: "`fib 0 = 0; fib 1 = 1; fib n = fib (n-1) + fib (n-2)`. Explain why it is inefficient for large n.",
            steps: [["Each call makes two more calls, so the number of calls grows exponentially.", "MP1", ""], ["The same values (e.g. fib 3) are recalculated many times.", "MP2", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "`inc x = x + 1`. Evaluate `inc (inc 5)`.", ["7 (1)"], { arch: "cs.fp-apply" }],
      [1, 1, "What part of a recursive function stops it calling itself?", ["The base case (1)"], { arch: "cs.recursion-define" }],
      [2, 2, "`h x y = x - 2 * y`. Evaluate `h 10 3` and `h (h 10 3) 1`.", ["4 (1)", "2 (1)"], { arch: "cs.fp-apply" }],
      [2, 2, "Explain what happens when a recursive function has no reachable base case.", ["It keeps calling itself (1)", "Until the stack overflows / it never ends (1)"], { arch: "cs.recursion-define" }],
      [3, 2, "Evaluate `map (\\x -> x * x - 1) [1, 2, 3]`.", ["Applies to each element (1)", "[0, 3, 8] (1)"], { arch: "cs.fp-apply" }],
      [3, 2, "How many calls does `fib 4` make in total, including itself, with the naive definition?", ["9 calls (1)", "fib 4 → fib 3 (5 calls) + fib 2 (3 calls) + 1 (1)"], { arch: "cs.recursion-define" }]
    ]
  };

  L["4.12.1.4"] = {
    archetypes: [{
      id: "cs.fp-partial",
      rules: ["Partial application: give a multi-argument function fewer arguments than it takes; the result is a function waiting for the rest.",
        "Types: `add :: Int -> Int -> Int`, so `add 3 :: Int -> Int`."],
      traps: [],
      variations: [
        { v: "A", t: "What partial application is", m: 2, q: "Explain what is meant by partial function application.",
          steps: [["Applying a function to fewer arguments than it takes.", "MP1", ""], ["Gives a new function that takes the remaining arguments.", "MP2", ""]] },
        { v: "B", t: "Type and result of a partial application", m: 3, q: "`add :: Int -> Int -> Int; add x y = x + y`. Give the type of `add 7`, what it does, and evaluate `(add 7) 5`.",
          steps: [["`add 7 :: Int -> Int`.", "MP1", ""], ["A function that adds 7 to its argument.", "MP2", ""], ["`(add 7) 5` = 12.", "MP3", ""]] },
        { v: "C", t: "Use it with map", m: 2, q: "Using partial application, write an expression that adds 7 to every element of [1, 2, 3], and give its result.",
          steps: [["`map (add 7) [1, 2, 3]`.", "MP1", ""], ["[8, 9, 10].", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "`mult x y = x * y`. What is `(mult 3) 4`?", ["12 (1)"]],
      [1, 1, "Give the type of `mult 3` if `mult :: Int -> Int -> Int`.", ["Int -> Int (1)"]],
      [2, 2, "Use partial application to define `triple` from `mult`.", ["triple = mult 3 (1)", "triple 5 = 15 (1)"]],
      [2, 2, "Evaluate `map (mult 2) [4, 0, 6]`.", ["Doubles each element (1)", "[8, 0, 12] (1)"]],
      [3, 3, "`f :: Int -> Int -> Int -> Int`. Give the types of `f 1` and `f 1 2`, and explain.", ["f 1 :: Int -> Int -> Int (1)", "f 1 2 :: Int -> Int (1)", "Each argument supplied removes one input from the type (1)"]],
      [3, 2, "Explain one benefit of partial application.", ["Builds specialised functions from general ones without rewriting (1)", "e.g. pass (add 7) to map / reuse (1)"]]
    ]
  };

  L["4.12.1.5"] = {
    archetypes: [{
      id: "cs.fp-compose",
      rules: ["$g \\circ f$ means apply f FIRST, then g: $(g \\circ f)(x) = g(f(x))$.",
        "The output type of f must match the input type of g.",
        "The order matters: say which runs first."],
      traps: [{ sitting: "2022-06", q: "Q12.3", to: "Q12.4", text: "State a composed function's purpose specifically (what goes in, what comes out). The order of composition decides which function runs first." }],
      variations: [
        { v: "A", t: "Apply a composition", m: 1, q: "`f x = x + 4`, `g x = x * 2`. Evaluate `(g . f) 3`.",
          steps: [["Apply f first: f 3 = 7, then g 7 = 14.", "MP1", ""]] },
        { v: "B", t: "The order matters", m: 2, q: "Using f and g above, evaluate `(f . g) 3` and explain why it differs from `(g . f) 3`.",
          steps: [["`(f . g) 3` = f (g 3) = f 6 = 10.", "MP1", ""], ["The right-hand function is applied first, so swapping them changes the result (14 against 10).", "MP2", ""]] },
        { v: "C", t: "Purpose of a composition", m: 2, q: "`avg xs = sum xs / len xs` and `toC f = (f - 32) * 5 / 9`. State the purpose of `avg . map toC` and why it might be better than `toC . avg`.",
          steps: [["It converts each Fahrenheit reading to Celsius and returns their average in Celsius.", "MP1", ""], ["`toC . avg` gives the same value with one conversion instead of one per reading, so it does less work.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "In `(g . f) x`, which function is applied first?", ["f (1)"]],
      [1, 1, "`a x = x - 1`, `b x = x * x`. Evaluate `(b . a) 4`.", ["9 (1)"]],
      [2, 2, "Using a and b above, evaluate `(a . b) 4` and `(a . a) 4`.", ["15 (1)", "2 (1)"]],
      [2, 2, "Explain the condition on types for `g . f` to be valid.", ["f's output type (co-domain) (1)", "must match g's input type (domain) (1)"]],
      [3, 2, "Write a composition that doubles every number in a list and then keeps those over 10. Evaluate it on [3, 6, 8].", ["filter (>10) . map (*2) (1)", "[12, 16] (1)"]],
      [3, 2, "Explain one advantage of writing programs by composing small functions.", ["Each small function can be tested on its own (1)", "and reused in other compositions (1)"]]
    ]
  };

  L["4.12.2.1"] = {
    archetypes: [{
      id: "cs.fp-hof",
      rules: ["map f xs: apply f to every element → a list of the same length.",
        "filter p xs: keep the elements for which p is True → a list.",
        "fold (reduce) f acc xs: combine the elements into ONE value, starting from acc.",
        "Show list results in square brackets."],
      traps: [FP_TRAP],
      variations: [
        { v: "A", t: "Evaluate map, filter and fold", m: 3, q: "Evaluate `map (*3) [2, 4, 5]`, `filter even [3, 8, 5, 10, 1]` and `fold (+) 0 [4, 7, 2]`.",
          steps: [["[6, 12, 15].", "MP1", ""], ["[8, 10].", "MP2", ""], ["13 — a single value, not a list.", "MP3", ""]] },
        { v: "B", t: "Fold with a different operator", m: 1, q: "Evaluate `fold (*) 1 [2, 5, 3]`.",
          steps: [["$1 \\times 2 \\times 5 \\times 3 = 30$.", "MP1", ""]] },
        { v: "C", t: "Combine them", m: 2, q: "Evaluate `fold (+) 0 (map (*2) (filter (>3) [1, 5, 2, 7]))`.",
          steps: [["filter (>3) → [5, 7]; map (*2) → [10, 14].", "MP1", ""], ["fold (+) 0 → 24.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Evaluate `map (+1) [0, 9]`.", ["[1, 10] (1)"]],
      [1, 1, "Evaluate `filter (<5) [7, 1, 4, 9]`.", ["[1, 4] (1)"]],
      [2, 2, "Evaluate `fold (-) 20 [3, 4]` folding from the left, and explain.", ["(20 - 3) - 4 (1)", "13 (1)"]],
      [2, 2, "Write an expression using a higher-order function that returns only the odd numbers of a list xs, then the count of them.", ["filter odd xs (1)", "fold (+) 0 (map (\\x -> 1) (filter odd xs)) / length of that list (1)"]],
      [3, 3, "Using map, filter and fold, write an expression for the sum of the squares of the even numbers in [1, 2, 3, 4], and evaluate it.", ["filter even → [2, 4] (1)", "map square → [4, 16] (1)", "fold (+) 0 → 20 (1)"]],
      [3, 2, "Explain why map always returns a list of the same length as its input but filter may not.", ["map transforms every element, one output for each (1)", "filter keeps only those passing the test (1)"]]
    ]
  };

  L["4.12.3.1"] = {
    archetypes: [
      { id: "cs.fp-lists",
        rules: ["A list is a head (the first element) and a tail (the list of the rest). `x:xs` pattern-matches them.",
          "Operations: head, tail, test for empty, length, prepend (`:`), append (`++`).",
          "head returns an ELEMENT; tail returns a LIST (in brackets)."],
        traps: [],
        variations: [
          { v: "A", t: "Head and tail", m: 2, q: "For the list [5, 9, 2], give head and tail.",
            steps: [["head = 5.", "MP1", ""], ["tail = [9, 2] — a list.", "MP2", ""]] },
          { v: "B", t: "Nested head and tail", m: 1, q: "Evaluate `head (tail (tail [1, 4, 6, 8]))`.",
            steps: [["tail → [4, 6, 8]; tail → [6, 8]; head → 6.", "MP1", ""]] },
          { v: "C", t: "Prepend and append", m: 2, q: "Evaluate `3 : [4, 5]` and `[1, 2] ++ [3]`, and say what each does.",
            steps: [["[3, 4, 5]: prepend adds an element at the front.", "MP1", ""], ["[1, 2, 3]: append joins two lists.", "MP2", ""]] }
        ] },
      { id: "cs.recursion-trace",
        rules: ["Write each call on its own line with its argument, going down to the base case.",
          "Then combine the returned values on the way back UP — that is where marks are lost.",
          "A list function's base case is usually `f [] = …`."],
        traps: [{ sitting: "2023-06", q: "Q12.1", text: "The base case and the arguments were fine; combining the returned values on the way back up was where marks went." }, FP_TRAP],
        variations: [
          { v: "A", t: "Trace a recursive sum", m: 3, q: "`total [] = 0; total (x:xs) = x + total xs`. Trace `total [3, 5, 2]`.",
            steps: [["total [3,5,2] = 3 + total [5,2]; total [5,2] = 5 + total [2]; total [2] = 2 + total [].", "MP1", "The calls down"], ["total [] = 0 (base case).", "MP2", ""], ["Back up: 2 + 0 = 2; 5 + 2 = 7; 3 + 7 = 10.", "MP3", "Combining on the way up"]] },
          { v: "B", t: "Trace a recursive count with a condition", m: 3, q: "`count [] = 0; count (x:xs) | x > 5 = 1 + count xs | otherwise = count xs`. Evaluate `count [7, 2, 9, 5]` and state what count does.",
            steps: [["7 > 5 → 1 + count [2,9,5]; 2 → count [9,5]; 9 → 1 + count [5]; 5 → count [].", "MP1", ""], ["Back up: 0, 0, 1, 1, 2 → 2.", "MP2", ""], ["It counts how many elements are greater than 5.", "MP3", ""]] },
          { v: "C", t: "Trace a recursive list builder", m: 2, q: "`rev [] = []; rev (x:xs) = rev xs ++ [x]`. Evaluate `rev [1, 2, 3]`.",
            steps: [["rev [1,2,3] = rev [2,3] ++ [1] = (rev [3] ++ [2]) ++ [1] = ((rev [] ++ [3]) ++ [2]) ++ [1].", "MP1", ""], ["= [3, 2, 1] — it reverses the list.", "MP2", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "Give the tail of [8].", ["[] / the empty list (1)"], { arch: "cs.fp-lists" }],
      [1, 1, "Evaluate `length [4, 4, 4]`.", ["3 (1)"], { arch: "cs.fp-lists" }],
      [2, 2, "`f [] = 1; f (x:xs) = x * f xs`. Evaluate `f [2, 3, 4]` and state what f does.", ["24 (1)", "Multiplies the elements together (product) (1)"], { arch: "cs.recursion-trace" }],
      [2, 2, "`g [] = []; g (x:xs) = (x * 2) : g xs`. Evaluate `g [1, 5]` and name the higher-order function it imitates.", ["[2, 10] (1)", "map (*2) (1)"], { arch: "cs.recursion-trace" }],
      [3, 3, "`m [x] = x; m (x:xs) = if x > m xs then x else m xs`. Trace `m [4, 9, 2]` and state its purpose.", ["m [2] = 2 (base case) (1)", "m [9,2] = 9; m [4,9,2] = 9 (1)", "Returns the largest element (1)"], { arch: "cs.recursion-trace" }],
      [3, 2, "Explain why `head []` is an error but `tail [5]` is not.", ["An empty list has no first element (1)", "tail [5] is the empty list [], a valid list (1)"], { arch: "cs.fp-lists" }]
    ]
  };

  /* ================= the extended answers (levels of response) ================= */
  var LEVELS = [["4", "10–12", "A clear, coherent answer covering all the areas asked for in detail, technical terms used correctly, the points linked to the context."],
    ["3", "7–9", "Most areas covered with some detail and some links to the context; may lack depth in one."],
    ["2", "4–6", "Some relevant points, mostly described rather than explained; one area may be missing."],
    ["1", "1–3", "A few relevant points with little explanation."]];
  P.extended = {
    id: "cs.essay",
    rules: ["Cover EVERY area the question lists: covering two of three caps the level.",
      "Plan for a minute: one paragraph per area, each point explained (what, how, why) and tied to the context.",
      "Use the technical terms exactly (MAR, CIR, NAT table, GDPR); a vague word costs a level.",
      "A 12-mark answer is about 15 minutes; a 6-mark one about 8."],
    traps: [{ sitting: "2022-06", q: "Q06", text: "Covering only two of the three areas capped the level. On ethics: consent, data protection duties, who sees the data and why — don't assume it was taken without consent." },
      { sitting: "2023-06", q: "Q04.1", text: "The execute stage was the weakest part of fetch–execute answers; cover all three stages with their registers. Say how each hardware change helps (more cores: instructions run simultaneously)." }],
    variations: [
      { v: "A", t: "Fetch–execute and processor performance", m: 12, levels: LEVELS,
        q: "Describe the fetch–decode–execute cycle, naming the registers and buses used, and discuss three ways a processor manufacturer could improve the speed at which instructions are executed.",
        steps: [["Fetch: PC → MAR; address bus; memory read on the control bus; instruction on the data bus to MBR; PC incremented; MBR → CIR.", "", "Area 1 — the fetch, every register named"],
          ["Decode: the control unit decodes the opcode in the CIR and identifies the addressing mode and operands.", "", "Area 1 — decode"],
          ["Execute: e.g. LDR — operand address to MAR, data to MBR, to the register; ADD in the ALU, flags in the status register; a branch writes the PC.", "", "Area 1 — execute, the stage most often thin"],
          ["More cores: instructions from different threads run simultaneously.", "", "Area 2 — with the reason"],
          ["Higher clock speed: more cycles per second, limited by heat.", "", "Area 2"],
          ["More/larger cache: frequently used instructions and data fetched without slow main-memory access; a wider data bus or word length moves more per transfer.", "", "Area 2"],
          ["Level 4 needs all of the cycle in sequence AND three explained improvements.", "", "What decides the level"]] },
      { v: "B", t: "Data capture hardware and the ethics of using the data", m: 12, levels: LEVELS,
        q: "A cinema chain scans barcodes on tickets and gives members an RFID card. Describe how each is read, and discuss the legal and ethical issues of using members' viewing data for marketing.",
        steps: [["Barcode: light shone on it, dark bars reflect less, the widths decoded into digits.", "", "Area 1"],
          ["RFID: the reader's radio waves induce a current in the card's coil, powering it to send its ID; no line of sight.", "", "Area 2"],
          ["Legal: UK GDPR / Data Protection Act — a lawful basis or consent, purpose limitation, the right to see, correct and erase data, security.", "", "Area 3 — legal"],
          ["Ethical: profiling people's tastes, sharing with third parties, transparency, whether the benefit (offers) is a fair exchange.", "", "Area 3 — ethical"],
          ["A balanced conclusion: acceptable with informed consent and clear opt-out.", "", "Lifts the answer to Level 4"]] },
      { v: "C", t: "IPv4 exhaustion, NAT, DHCP and IPv6", m: 12, levels: LEVELS,
        q: "Discuss how NAT, private addressing and DHCP have extended the life of IPv4, and why IPv6 is still needed.",
        steps: [["IPv4 is 32 bits: about 4.3 billion addresses, now exhausted.", "", "The problem"],
          ["Private (non-routable) ranges are reused inside every network.", "", "Area 1"],
          ["NAT: the router replaces private source addresses with its public address and a port, recorded in its table, so many devices share one public address.", "", "Area 2"],
          ["DHCP leases addresses only while devices are connected, so a pool is shared and reused.", "", "Area 3"],
          ["IPv6: 128 bits, an address for every device; NAT is no longer needed and end-to-end connections work again; both run side by side during the changeover.", "", "Area 4"]] },
      { v: "D", t: "A six-mark ethics answer", m: 6, levels: [["3", "5–6", "Several issues explained with both sides and a judgement, in context."], ["2", "3–4", "Some issues explained, possibly one-sided."], ["1", "1–2", "Points listed with little explanation."]],
        q: "A hospital uses an AI system to suggest diagnoses from scans. Discuss the ethical issues.",
        steps: [["Accuracy and bias: trained on data that may under-represent some groups, so errors fall unevenly.", "", "Issue 1"],
          ["Accountability: who is responsible when the suggestion is wrong — the doctor, the hospital or the maker?", "", "Issue 2"],
          ["Privacy of the patient data used to train and run it.", "", "Issue 3"],
          ["Benefit: faster diagnosis and fewer missed findings; a judgement that it should support, not replace, a clinician.", "", "The other side and the conclusion"]] }
    ],
    practice: [
      [2, 12, "Describe how a hard disk drive stores and reads data, and explain how the TCP/IP stack is used when a file on it is sent across the Internet.", ["Level 4 (10–12): HDD principles in sequence (platters, tracks/sectors, head, magnetisation) AND all four TCP/IP layers with their roles, linked to the file being sent.", "Level 3 (7–9): both areas covered, one in less detail.", "Level 2 (4–6): some points from each, or one area well.", "Level 1 (1–3): a few relevant points."], { refs: ["4.7.4.2", "4.9.4.1"] }],
      [2, 12, "A city collects data from traffic sensors, phones and cameras. Discuss the characteristics of this data, how it could be processed, and the ethical issues it raises.", ["Level 4: volume, velocity and variety explained in context; distributed/functional processing; privacy, consent and surveillance weighed.", "Level 3: all three areas, one thin.", "Level 2: two areas or descriptive only.", "Level 1: a few points."], { refs: ["4.11.1", "4.8.1"] }],
      [3, 12, "Explain how a packet travels from a laptop on a home network to a web server, covering subnet masks, routing and how errors are detected.", ["Level 4: subnet mask ANDed to decide local or remote; default gateway; hop-by-hop routing with routing tables; checksums recomputed and failed packets resent.", "Level 3: all three areas, one less developed.", "Level 2: two areas.", "Level 1: a few points."], { refs: ["4.9.3.1", "4.9.4.4", "4.5.5.3"] }],
      [3, 6, "A news app chooses which stories each user sees using an algorithm. Discuss the ethical issues.", ["Level 3 (5–6): filter bubbles, manipulation/misinformation, privacy of reading data, transparency — both sides and a judgement.", "Level 2 (3–4): some issues explained.", "Level 1 (1–2): points listed."], { refs: ["4.8.1"] }]
    ]
  };
})();
