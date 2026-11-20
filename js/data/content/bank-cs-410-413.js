/* Kurenai OS — past-paper bank: AQA 7517 §4.10 Databases, §4.11 Big Data,
   §4.12 Functional programming and §4.13 Systematic approach.
   Modelled on AS/A-level Paper 1 Section A and Paper 2, June 2016–2025. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.10.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "ER diagrams — degree, and completing the model" },
    "Two forms: **draw the relationships and their degree** between named entities (1–3 marks — one mark per correct relationship, *max 1 if any incorrect*; a crow's foot is the *many* end), and **modify / extend the model**: a many-to-many relationship (a part fits many models, a model uses many parts) is resolved with a **linking / junction relation** whose entity identifier is the **composite of the two foreign keys** (`PartFitsModel(PartID, Make, Model)`).",
    { callout: { t: "tip", body: "Read the scenario for the words *each* and *many*: \"each pet has one owner, an owner may have many pets\" → one-to-many from Customer to Pet. When a sentence gives *many … many*, you need a new entity in the middle — the examiners award a mark for creating it and one for its attributes/identifier." }}
  ],
  flashcards: [
    ["What is an attribute?", "A property of an entity — a column/field.", 11],
    ["What is an entity identifier?", "The attribute (or combination) that uniquely identifies each instance — the primary key.", 12],
    ["How is a many-to-many relationship implemented?", "With a linking (junction) relation whose primary key is the composite of the two entity identifiers, e.g. PetOwner(CustomerID, PetID).", 14],
    ["A student receives many merits, a teacher awards many merits. What is the relationship between Student and Teacher?", "Many-to-many, resolved by the Merit entity: Student 1–many Merit and Teacher 1–many Merit.", 16],
    ["Entity descriptions: how are they written?", "Entity(Identifier, attribute, attribute…) with the identifier underlined — foreign keys are attributes that are identifiers of other entities.", 17]
  ],
  quiz: [
    { q: "A customer places many orders; each order belongs to one customer. The relationship is:", opts: ["one-to-one", "one-to-many", "many-to-many", "none"], ans: 1, why: "Crow's foot at Order." },
    { q: "A student takes many courses and each course has many students. To model this you need:", opts: ["a one-to-one link between Student and Course", "a linking entity such as Enrolment", "a single table holding every student and course", "a foreign key of CourseID in Student"], ans: 1, why: "Junction relation." },
    { q: "The entity identifier of a linking relation is usually:", opts: ["a new random number made for each row", "the composite of the two foreign keys", "the first attribute listed in the relation", "the date the link between the two was made"], ans: 1, why: "E.g. (StudentID, CourseID)." },
    { q: "A crow's foot represents:", opts: ["the one end", "the many end", "an attribute", "a key"], ans: 1, why: "The crow's foot sits on the 'many' side of a relationship; the single line end is the 'one' side." },
    { q: "Entity(Attr1, Attr2) with Attr1 underlined means Attr1 is:", opts: ["a foreign key to another entity", "the entity identifier", "an optional attribute", "a derived attribute"], ans: 1, why: "An underlined attribute in this notation is the primary key, the identifier of each entity instance." },
    { q: "Which relationship degree cannot be implemented directly in a relational database?", opts: ["one-to-one", "one-to-many", "many-to-many", "all can"], ans: 2, why: "Needs a linking table." }
  ],
  exam: [
    { src: "AQA 2019 P2 Q6.1", ctx: "A veterinary practice has entities `Pet(PetID, Name, Species)`, `Vet(VetID, Name)` and `Surgery(SurgeryName, Address)`. Each pet may be brought by several customers and a customer may own several pets. Appointments are made for a pet at a surgery on a date and time.",
      parts: [
        { q: "Extend the ER diagram by adding entities `Customer`, `PetOwner` and `Appointment` with their relationships and degrees.", marks: 3, ms: ["Appointment added with one-to-many relationships from Pet and from Surgery to Appointment (1)", "Customer added with a one-to-many relationship to PetOwner (1)", "PetOwner added with a one-to-many relationship from Pet (resolving the many-to-many between Customer and Pet) (1)"] },
        { q: "State the degree of the relationship between `Surgery` and `Vet` if each vet works at exactly one surgery.", marks: 1, ms: ["One-to-many (Surgery to Vet) (1)"] }
      ] },
    { src: "AQA 2017 P2 Q10.7", q: "A garage's database has relations `Part(PartID, Description, Price)` and `Car(CarRegNo, Make, Model, OwnerID)`. A part can be fitted to many makes and models of car, and each make and model uses many parts. Describe how the database design should be modified to record which parts fit which makes and models.", marks: 3,
      ms: ["Create a new relation to identify which make/model(s) of car each part can be fitted to, e.g. `PartFitsMakeModel` (1)", "Store the attributes PartID, Make and Model in the new relation (1)", "Make the combination PartID, Make, Model the entity identifier (accept a new identifier with a uniqueness constraint) (1)"] },
    { src: "AQA 2025 P2 Q6.2", q: "A school records merits: a teacher awards a merit to a student on a date. Draw the relationships, with their degrees, between the entities `Student`, `Teacher` and `Merit`.", marks: 1,
      ms: ["Student one-to-many Merit AND Teacher one-to-many Merit; 0 marks if any incorrect relationship is drawn (1)"] }
  ]
});

X("compsci:4.10.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Relational vocabulary and primary keys" },
    { kv: [
      ["Alternative composite primary key (2017, 2021)", "Name the attribute combination that is unique for every row: `CarRegNo + JobDate` — only if the scenario guarantees a car has at most one job per day"],
      ["Assumption behind a composite key (2020, 2024)", "State the uniqueness the key relies on: *a buyer views the same property at most once per day*; *each product is supplied by only one supplier*"],
      ["Limitation of a composite identifier (2025)", "What it cannot record: *the same teacher cannot award the same student two merits on the same day*"],
      ["Referential integrity (2023)", "Deleting a showing that still has bookings would leave **foreign keys referencing records that no longer exist**; the DBMS **refuses the delete** (or the bookings must be deleted first)"]
    ]}
  ],
  flashcards: [
    ["Define a relation.", "A table in a relational database — a set of tuples (rows) with named attributes (columns).", 10],
    ["Define a primary key.", "The attribute or combination of attributes that uniquely identifies each tuple.", 11],
    ["Define a foreign key.", "An attribute in one relation that is the primary key of another, used to link the two.", 12],
    ["Define a composite key.", "A primary key made of two or more attributes together.", 13],
    ["What is referential integrity?", "The rule that a foreign key value must match an existing primary key value in the referenced relation — the DBMS prevents deletes or inserts that would break it.", 14],
    ["What assumption does using (BuyerID, PropertyID, ViewDate) as a key make?", "That a buyer views a given property at most once on a given day.", 15],
    ["Why might deleting a Showing record be refused?", "Bookings still reference that ShowingID as a foreign key — the delete would violate referential integrity.", 16],
    ["What is a tuple?", "One row / record in a relation.", 17]
  ],
  quiz: [
    { q: "In a relational database a relation is a:", opts: ["table", "row", "field", "key"], ans: 0, why: "Rows are tuples; columns are attributes." },
    { q: "(FacilityID, BookingDate, StartTime) as a key assumes:", opts: ["each facility can only ever be booked once on any one date in the year", "a facility has at most one booking starting at a given date and time", "every facility has a unique name and an ID number of its own", "start times repeat, so the date can be left out of the key"], ans: 1, why: "Uniqueness assumption." },
    { q: "Deleting a customer who still has orders is blocked by:", opts: ["normalisation to third normal form", "referential integrity", "a composite primary key", "the SQL syntax rules"], ans: 1, why: "Foreign keys would dangle." },
    { q: "An attribute is:", opts: ["a column — one property of the entity", "a row — one record in the table", "a link between two of the tables", "a key made of two or more fields"], ans: 0, why: "An attribute is one property of an entity, which becomes a column (field) of the table." },
    { q: "A relation's rows are called:", opts: ["attributes", "tuples", "keys", "domains"], ans: 1, why: "Rows of a relation are tuples; the columns are attributes." },
    { q: "A primary key value must be:", opts: ["numeric and in order", "unique and not null", "a foreign key as well", "a string of characters"], ans: 1, why: "Entity integrity." }
  ],
  exam: [
    { src: "AQA 2021 P2 Q5.1", q: "A sports centre's `Booking` relation has attributes BookingID, FacilityID, BookingDate, StartTime, EndTime and CustomerID, with BookingID as primary key. State a valid alternative composite primary key and the assumption on which it relies.", marks: 2,
      ms: ["(FacilityID, BookingDate, StartTime) — accept EndTime in place of StartTime (1)", "Assumes a facility cannot have two bookings starting at the same time on the same date (1)"] },
    { src: "AQA 2023 P2 Q5.3", q: "A cinema database has relations `Showing(ShowingID, FilmID, ShowDate, ShowTime)` and `Booking(BookingID, ShowingID, CustomerID)`. Explain why executing `DELETE FROM Showing WHERE ShowDate = '29/03/2023'` might cause a problem.", marks: 2,
      ms: ["There might already be bookings for showings on that date (1)", "The DBMS would prevent the delete, or the bookings would be left referencing showings that no longer exist — referential integrity would be violated; those bookings would also need deleting (1)"] },
    { src: "AQA 2025 P2 Q6.1", q: "A school's `Merit` relation uses the composite entity identifier (StudentID, TeacherID, MeritDate). State one limitation of this design.", marks: 1,
      ms: ["The same teacher could not award the same student more than one merit on the same day (1)"] }
  ]
});

X("compsci:4.10.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Normalisation — why, and the 4–5 mark design" },
    "**Why normalise** (2018, 2024 — 2 marks): **minimise data duplication / eliminate redundancy** (only one of these two counts) · **eliminate data inconsistency** — two copies of the same item might differ · **eliminate update anomalies** — a change would have to be made in every copy · **insertion anomalies** — cannot store a customer until they book · **deletion anomalies** — deleting all of a customer's bookings deletes the customer. \"Saves space\" and \"easier to query\" are NE.",
    { callout: { t: "tip", h: "Design a normalised set of relations (2019, 2023 — 4–5 marks)", body: "One mark per relation with **the right attributes and no others**, plus marks for **correct entity identifiers** (composite keys underlined). Pattern: an entity for each real thing (Customer, Booking), a **linking relation** for each many-to-many (AssignedSeat(BookingID, SeatNumber)), no repeating groups, every non-key attribute depending on the **whole key and nothing but the key** (3NF)." }},
    { callout: { t: "def", h: "Third normal form", body: "No repeating groups (1NF); every non-key attribute depends on the whole of a composite key (2NF); no non-key attribute depends on another non-key attribute (3NF)." }}
  ],
  flashcards: [
    ["Why are databases normalised? (give three reasons)", "To eliminate data redundancy / duplication; to avoid inconsistency between copies; to eliminate update, insertion and deletion anomalies.", 12],
    ["What is an update anomaly?", "When data stored in several places must be changed in every place, risking inconsistency.", 13],
    ["What is an insertion anomaly?", "When data about one entity cannot be stored until a record for another exists — e.g. a customer with no booking.", 14],
    ["What is a deletion anomaly?", "When deleting a record removes the only copy of data about another entity — e.g. deleting a customer's last booking deletes the customer.", 15],
    ["State the conditions for 1NF, 2NF and 3NF.", "1NF: atomic values, no repeating groups. 2NF: 1NF and every non-key attribute depends on the whole primary key. 3NF: 2NF and no non-key attribute depends on another non-key attribute.", 16],
    ["Which two answers are NE for 'why normalise'?", "Saves storage space; easier/faster to query.", 17],
    ["Give one advantage and one disadvantage of deliberately denormalising (storing CurrentZoo in Animal).", "Advantage: an animal's location is found with a simpler/faster query without searching AnimalLocation. Disadvantage: redundancy — data could become inconsistent and more updates are needed.", 18],
    ["How do you recognise a table that is not in 3NF?", "A non-key attribute (e.g. CustomerName) is determined by another non-key attribute (CustomerID) rather than by the primary key.", 19]
  ],
  quiz: [
    { q: "Storing a customer's address in every booking row causes:", opts: ["faster queries, as fewer joins are needed", "redundancy and possible inconsistency", "referential integrity between the tables", "a composite key made from the address"], ans: 1, why: "Repeating the address in every booking row is redundant, and copies can drift apart, giving inconsistency." },
    { q: "Which is NOT an accepted reason to normalise?", opts: ["Eliminate update anomalies", "Eliminate data inconsistency", "Save storage space", "Eliminate insertion anomalies"], ans: 2, why: "NE in the mark scheme." },
    { q: "A relation with a repeating group violates:", opts: ["1NF", "2NF", "3NF", "none"], ans: 0, why: "1NF needs every attribute to hold a single atomic value, so a repeating group breaks it." },
    { q: "In 3NF a non-key attribute may depend on:", opts: ["another non-key attribute", "only the primary key", "a foreign key only", "nothing"], ans: 1, why: "'Nothing but the key'." },
    { q: "Resolving 'a booking has many seats' needs:", opts: ["a Seat1, Seat2, Seat3 set of columns in Booking", "a separate AssignedSeat(BookingID, SeatNumber) relation", "a longer string holding every seat number in one field", "a composite key made of every seat in the booking"], ans: 1, why: "Repeating group removed." },
    { q: "Denormalising to speed up lookups costs:", opts: ["nothing, since the data is identical", "redundancy and extra updates", "fewer tables to join in queries", "the loss of every foreign key"], ans: 1, why: "Denormalising duplicates data, so lookups are faster but every update must change several copies." }
  ],
  exam: [
    { src: "AQA 2023 P2 Q5.1", q: "A cinema stores, for each booking, the customer's first name, last name and telephone number, the ShowingID, and the seat numbers booked (a booking may cover several seats). Design a fully normalised set of relations for this data, showing the entity identifier of each.", marks: 5,
      ms: ["`Customer(CustomerID, FirstName, LastName, TelephoneNumber)` — correct attributes and no others (1)", "`Booking(BookingID, ShowingID, CustomerID)` (accept a NumberOfSeats attribute) (1)", "`AssignedSeat(BookingID, SeatNumber)` containing the Booking identifier and the seat number (1)", "Correct entity identifiers: CustomerID; BookingID (or ShowingID + CustomerID) (1)", "Composite identifier (BookingID, SeatNumber) for AssignedSeat — all three identifiers correct for the second mark (1)"] },
    { src: "AQA 2024 P2 Q8.5", q: "Describe two problems that can arise when a database is not normalised.", marks: 2,
      ms: ["Data stored more than once could become inconsistent — two copies of the same item hold different values (1)", "Every copy must be updated when the data changes / data about one entity cannot be stored without a record of another (insertion anomaly) / deleting one record may delete data about another entity (deletion anomaly) (1)", "'Data redundancy' or 'wastes space' alone is not enough. Max 2"] },
    { src: "AQA 2021 P2 Q5.2", q: "A first design stored the customer's name and telephone number in every `Booking` record. Explain why this design was rejected.", marks: 2,
      ms: ["The design is not normalised — a customer with several bookings has their details stored more than once (1)", "The copies could become inconsistent / updates must be made to every record / deleting a customer's bookings deletes the customer / customer details cannot be stored before a booking / two customers with the same name cannot be distinguished (1)"] },
    { src: "AQA 2022 P2 Q7.5", q: "A zoo database has `Animal(AnimalID, Name, Species)` and `AnimalLocation(AnimalID, ZooID, DateMoved)`. A designer proposes adding a `CurrentZooID` attribute to `Animal`. Give one advantage and one disadvantage of this change.", marks: 2,
      ms: ["Advantage: an animal's current location can be found with a simpler / quicker query without searching AnimalLocation (1)", "Disadvantage: introduces redundancy — the value could become inconsistent with AnimalLocation and must be updated whenever an animal moves; extra storage (1)"] }
  ]
});

X("compsci:4.10.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "SQL — 5 to 7 marks every Paper 2" },
    "Marks split **AO2** (choosing the right tables, fields, join conditions and WHERE conditions — awarded even with syntax errors) and **AO3** (correct syntax in each clause: SELECT, FROM, WHERE, ORDER BY). *Max n − 1 if the query does not work fully.* A **linking condition** between every pair of tables used is essential (`Athlete.AthleteID = EventEntry.AthleteID`), and `INNER JOIN … ON` is accepted equally.",
    { table: { head: ["Statement", "Shape that scores"], rows: [
      ["SELECT", "`SELECT Surname, Forename FROM Athlete, EventEntry, Fixture WHERE FixtureDate = '17/09/2018' AND Athlete.AthleteID = EventEntry.AthleteID AND EventEntry.FixtureID = Fixture.FixtureID ORDER BY Surname`"],
      ["INSERT", "`INSERT INTO PartUsedForJob (JobID, PartID, QuantityUsed) VALUES (206, 12, 2)` — field list order must match values"],
      ["UPDATE", "`UPDATE Job SET JobDuration = '01:30' WHERE JobID = 206` — the WHERE is what earns the AO2 mark"],
      ["DELETE", "`DELETE FROM Booking WHERE BookingID = 17`"],
      ["CREATE TABLE", "`CREATE TABLE Athlete (AthleteID INTEGER PRIMARY KEY, Surname VARCHAR(30), DateOfBirth DATE, FOREIGN KEY (ClubID) REFERENCES Club(ClubID))` — field name **before** type; every field needs a type"],
      ["Find the errors (2018, 2019, 2023)", "Missing quotation marks round a string; missing linking condition/join; data type before field name; missing type on the key; wrong table"]
    ]}},
    { callout: { t: "warn", body: "Semicolons at the end of **each clause** are penalised; one at the very end is fine. Never put the field name after the table name (`Surname.Athlete`)." }}
  ],
  flashcards: [
    ["Write the general form of a SELECT with a join and ordering.", "SELECT fields FROM TableA, TableB WHERE TableA.Key = TableB.Key AND condition ORDER BY field [DESC]"],
    ["What is the alternative join syntax?", "FROM TableA INNER JOIN TableB ON TableA.Key = TableB.Key"],
    ["Write an INSERT that adds student 1042, 'Kai Sato' to Student(StudentID, Name).", "INSERT INTO Student (StudentID, Name) VALUES (1042, 'Kai Sato')"],
    ["Write an UPDATE that reduces QuantityInStock by 3 for ProductID 77.", "UPDATE Product SET QuantityInStock = QuantityInStock − 3 WHERE ProductID = 77"],
    ["Write a DELETE removing bookings dated 29/03/2023.", "DELETE FROM Booking WHERE BookingDate = '29/03/2023'"],
    ["Write a CREATE TABLE for Merit(MeritID, StudentID, TeacherID, MeritDate).", "CREATE TABLE Merit (MeritID INTEGER PRIMARY KEY, StudentID INTEGER, TeacherID INTEGER, MeritDate DATE, FOREIGN KEY (StudentID) REFERENCES Student(StudentID), FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID))"],
    ["What must every pair of tables in a FROM clause have?", "A linking condition (or JOIN … ON) between their key fields."],
    ["Which three errors are commonly planted in an SQL question?", "Missing quotes around a string, missing join condition, type before field name / missing type in CREATE TABLE."],
    ["How do you express a date range?", "WHERE ShowDate >= '01/06/2025' AND ShowDate <= '30/06/2025' (or BETWEEN)."],
    ["What does ORDER BY … DESC do?", "Sorts the results in descending order of the field."]
  ],
  quiz: [
    { q: "`SELECT Name FROM Student, Merit WHERE MeritDate = '01/05/2025'` is missing:", opts: ["an ORDER BY clause to sort the names into order", "a linking condition Student.StudentID = Merit.StudentID", "a semicolon at the end of the whole SELECT statement", "DISTINCT, so that each student's name is shown only once"], ans: 1, why: "Cartesian product otherwise." },
    { q: "In INSERT INTO T (A, B) VALUES (…), the values must:", opts: ["all be strings in quotation marks", "match the order of the field list", "be sorted into ascending order", "include the primary key last"], ans: 1, why: "The values are matched to the fields by position, so their order must follow the field list." },
    { q: "`CREATE TABLE Athlete (INTEGER AthleteID PRIMARY KEY …)` is wrong because:", opts: ["INTEGER is not a valid SQL data type", "the type is before the field name", "PRIMARY KEY must be on its own line", "nothing — the statement is valid"], ans: 1, why: "Field name first." },
    { q: "`WHERE Town = Torquay` fails because:", opts: ["Town is a reserved word in SQL", "Torquay needs quotation marks", "= should be == for comparison", "WHERE must come before FROM"], ans: 1, why: "A text value in SQL must be in quotation marks, otherwise Torquay is read as a field name." },
    { q: "To decrease stock by the quantity sold you write:", opts: ["SET QuantityInStock = 3", "SET QuantityInStock = QuantityInStock − 3", "SET QuantityInStock = 3 − QuantityInStock", "SET QuantityInStock − 3 = QuantityInStock"], ans: 1, why: "Relative update." },
    { q: "A semicolon after every clause:", opts: ["is required", "is penalised", "is ignored", "adds marks"], ans: 1, why: "A semicolon ends a whole SQL statement, not each clause, so one after every clause is wrong." }
  ],
  exam: [
    { src: "AQA 2025 P2 Q6", ctx: "Relations: `Student(StudentID, Forename, Surname, TutorGroup)`, `Teacher(TeacherID, TeacherName)`, `Merit(MeritID, StudentID, TeacherID, MeritDate, Reason)`.",
      parts: [
        { q: "Write an SQL statement to add a new student with ID 2081, forename Aiko, surname Tanaka, tutor group 12B.", marks: 2, ms: ["`INSERT INTO Student (StudentID, Forename, Surname, TutorGroup)` (1)", "`VALUES (2081, 'Aiko', 'Tanaka', '12B')` (1)"] },
        { q: "Write an SQL query to list the forename and surname of every student, and the name of the teacher, for merits awarded between 01/03/2025 and 31/03/2025, sorted by surname.", marks: 6, ms: ["AO2: correct tables (Student, Teacher, Merit) and fields (Forename, Surname, TeacherName) and no others (1)", "AO2: both linking conditions Student.StudentID = Merit.StudentID AND Teacher.TeacherID = Merit.TeacherID (1)", "AO2: date range MeritDate >= '01/03/2025' AND MeritDate <= '31/03/2025' with correct AND operators (1)", "AO3: correct syntax in two or three of SELECT, FROM, WHERE, ORDER BY (1)", "AO3: fully correct syntax in all four clauses (1)", "`ORDER BY Surname` present; Max 5 if the query does not work fully (1)"] }
      ] },
    { src: "AQA 2024 P2 Q8", ctx: "A shop's database has `Product(ProductID, Description, Price, QuantityInStock)` and `Sale(SaleID, ProductID, QuantitySold, SaleDate)`.",
      parts: [
        { q: "Write an SQL statement to record a sale (SaleID 5120) of 3 units of product 77 on 14/06/2024.", marks: 2, ms: ["`INSERT INTO Sale (SaleID, ProductID, QuantitySold, SaleDate)` (1)", "`VALUES (5120, 77, 3, '14/06/2024')` (1)"] },
        { q: "Write an SQL statement to reduce the quantity in stock of product 77 by 3.", marks: 3, ms: ["AO2: correct table (Product) and condition WHERE ProductID = 77 (1)", "`UPDATE Product SET QuantityInStock = QuantityInStock − 3` (1)", "Fully correct syntax in UPDATE, SET and WHERE clauses (1)"] }
      ] },
    { src: "AQA 2018 P2 Q7.2", q: "Identify two errors in the statement: `CREATE TABLE Athlete (AthleteID PRIMARY KEY, VARCHAR(20) Surname, DateOfBirth DATE)`", marks: 2,
      ms: ["AthleteID has no data type (1)", "The data type VARCHAR(20) is written before the field name Surname — the field name must come first (1)"] },
    { src: "AQA 2019 P2 Q6.3", q: "Identify two errors in the query: `SELECT Name FROM Vet, Surgery WHERE Town = Torquay`", marks: 2,
      ms: ["Torquay needs quotation marks as it is a string (1)", "There is no linking condition / join between Vet and Surgery, e.g. Vet.SurgeryName = Surgery.SurgeryName (1)"] },
    { src: "AQA 2021 P2 Q5.3", q: "Complete a CREATE TABLE statement for `Booking(BookingID, FacilityID, BookingDate, StartTime, EndTime, CustomerID)` with BookingID as primary key and FacilityID and CustomerID as foreign keys.", marks: 3,
      ms: ["`CREATE TABLE Booking (BookingID INTEGER PRIMARY KEY,` with sensible types for the other fields (1)", "`FOREIGN KEY (FacilityID) REFERENCES Facility(FacilityID)` (1)", "`FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID))` (1)"] }
  ]
});

X("compsci:4.10.5", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Concurrent access — the lost update and its cures" },
    "**The problem** (2019, 2025 — 2–3 marks): two users **read and edit the same record simultaneously**; one **saves**, then the other **saves**; the **first user's update is lost** / overwritten — the *lost update problem*. **Record locking**: when a transaction starts editing a record an **exclusive lock** is placed on that **record** (not the table or database); other users **cannot edit it until the lock is released**. **Timestamp ordering** (2024 — 3 marks): every transaction is given a **timestamp**; each record stores the **timestamps of its last read and last write**; the server applies **rules** — a transaction is **aborted** if it tries to write a record whose read/write timestamp is later than the transaction's own start.",
    { callout: { t: "memorise", body: "Other methods: **serialisation** (transactions executed one after another, never overlapping) and **commitment ordering** (order the commits so conflicting ones cannot interleave). The client–server DBMS also gives **one point of control for security, backup and integrity**." }}
  ],
  flashcards: [
    ["What is a client–server database?", "A DBMS running on a server that many clients access over a network, with the server managing the data, integrity, security and concurrent access.", 10],
    ["Describe the lost update problem.", "Two users read and edit the same record at the same time; one saves, then the other saves — the second save overwrites the first, so the first update is lost.", 11],
    ["Describe record locking.", "When a transaction begins to edit a record, an exclusive lock is set on that record; other transactions cannot edit it until the lock is released when the first edit is completed.", 12],
    ["Describe timestamp ordering.", "Each transaction is given a timestamp; every record stores the timestamps of its last read and write; the DBMS aborts any transaction that would read or write a record already read or written by a later transaction.", 13],
    ["Give one disadvantage of record locking.", "A record can be locked for a long time, blocking other users; deadlock can occur if two transactions each wait for the other's lock.", 16],
    ["Give one advantage of a client–server DBMS over shared files.", "Central control of integrity, security and concurrent access; consistent data for all clients.", 17]
  ],
  quiz: [
    { q: "Two users save edits to the same record in turn without concurrency control. The result:", opts: ["both updates merge", "the first update is lost", "the record is deleted", "an error always occurs"], ans: 1, why: "Both users read the original, so the second save overwrites the first and the first update is lost." },
    { q: "Record locking places a lock on:", opts: ["the whole database being used", "the table holding the record", "the record being edited", "the user editing the record"], ans: 2, why: "Record locking stops other transactions using the record while it is being edited, avoiding the lost update." },
    { q: "In timestamp ordering a transaction is aborted when:", opts: ["it takes too long to finish and the server times it out", "it tries to write a record already accessed by a later transaction", "it reads any record that another transaction has already locked", "the server's clock changes while the transaction is still running"], ans: 1, why: "If a later transaction has already accessed the record, an older transaction writing to it would break the timestamp order, so it is aborted." },
    { q: "Executing transactions strictly one after another is:", opts: ["locking", "serialisation", "timestamp ordering", "normalisation"], ans: 1, why: "Running transactions strictly one after another, with no overlap, is serialisation, so they cannot interfere." },
    { q: "A risk of record locking:", opts: ["lost updates when two users save at once", "deadlock between waiting transactions", "duplicate primary keys in a table", "no security on the locked records"], ans: 1, why: "If two transactions each hold a lock the other needs, both wait for ever: deadlock." },
    { q: "Which does the server store for timestamp ordering?", opts: ["one lock for each user who is connected", "last read and write timestamps per record", "a copy of every record before it changes", "the time each user logged in to the server"], ans: 1, why: "Needed for the rules." }
  ],
  exam: [
    { src: "AQA 2019 P2 Q6.4", q: "Two receptionists using a client–server database can access the same appointment record at the same time. Describe a problem that could occur if the DBMS did not manage concurrent access, and explain how record locking would prevent it.", marks: 5,
      ms: ["Both receptionists read and edit the same record simultaneously (1)", "One saves the record, then the other saves it (1)", "The first receptionist's update is lost / overwritten — the lost update problem (1)", "Record locking: when a transaction starts editing the record an exclusive lock is set on it (1)", "Other users cannot edit the record until the lock is released when the first edit is complete (1)"] },
    { src: "AQA 2024 P2 Q8.4", q: "Describe how timestamp ordering can be used to manage concurrent access to a database.", marks: 3,
      ms: ["A timestamp is generated for each transaction, indicating the order in which transactions started (1)", "The database records, for each record / data item, the timestamps of the last read and the last write (1)", "The server applies rules to decide whether a transaction would cause inconsistency and aborts it if so — e.g. a write is aborted if the record's read or write timestamp is later than the transaction's start (1)"] },
    { src: "AQA 2025 P2 Q6.5", q: "Two teachers edit the same student's record at the same time. Explain what would happen if the DBMS provided no concurrency control.", marks: 2,
      ms: ["The update made by the teacher who saved first would be lost (1)", "because the teacher who saved second overwrites it — only the second update is kept (1)"] }
  ]
});

X("compsci:4.11.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Big Data — three Vs, graph schema, functional fit" },
    { kv: [
      ["Characteristics (2018, 2023)", "**Volume** — too much data to fit / be processed on one server (\"volume\" alone is NE); **Velocity** — data generated and *must be processed* very quickly; **Variety** — many forms, often unstructured, cannot be represented in a relational table (emails, video, images, web pages)"],
      ["Fact-based graph schema (2018, 2023 — 3 marks)", "**Ovals** for entities (nodes) joined by **solid, labelled lines** for relationships (`Delivered_To`, `Sells`, `Makes`); **rectangles** of data (properties) joined to their node by **dashed lines**; one fact per rectangle; each dashed line unlabelled"],
      ["Why functional programming suits Big Data (2023, 2024 — 2 marks)", "**Immutable data structures** — state cannot change; **statelessness / no side-effects** — pure functions; so functions can be **distributed to many servers**, run on parts of the data and the results **combined (map-reduce)**; **higher-order functions** compose results across cores; **order of execution is not fixed by the program** — \"suitable for parallel processing\" alone is NE"]
    ]}
  ],
  flashcards: [
    ["Define Big Data.", "Data that cannot be processed or analysed using traditional database tools because of its volume, velocity and variety.", 12],
    ["State the three characteristics of Big Data.", "Volume (too much for one server), velocity (must be processed at high speed), variety (many forms, often unstructured).", 13],
    ["Why can Big Data often not be stored in a relational database?", "It is unstructured or semi-structured — video, images, text, sensor streams — which cannot be represented as rows in tables.", 14],
    ["What is a fact-based model?", "A model in which each immutable fact is stored separately — atomic, timestamped and never updated — suited to append-only distributed storage.", 15],
    ["Describe the graph schema notation.", "Nodes (entities) as ovals; relationships as solid labelled lines between nodes; properties as rectangles joined to their node by dashed lines.", 16],
    ["Why are functional languages suited to Big Data processing?", "Immutable data and pure functions without side-effects mean functions can be distributed across many machines and their results combined safely — map-reduce.", 17],
    ["What is map-reduce?", "A pattern where a function is mapped over pieces of a dataset on many machines and the partial results are reduced (combined) into a final answer.", 18],
    ["Why does statelessness help distribution?", "A function's output depends only on its inputs, so it can run on any server with no shared state to synchronise.", 19]
  ],
  quiz: [
    { q: "'Velocity' as a Big Data characteristic means:", opts: ["data is too large to store on one machine", "data is generated and must be processed very quickly", "data comes in many varied, unstructured forms", "data is collected over a very long time span"], ans: 1, why: "Must include processing." },
    { q: "In a graph schema, a property such as 'Employees: 75' is drawn as:", opts: ["an oval with the value written inside", "a rectangle joined by a dashed line", "a labelled solid line between ovals", "a diamond joined to the entity"], ans: 1, why: "A property is shown as a rectangle linked to its node by a dashed line." },
    { q: "A relationship such as 'Sells' is drawn as:", opts: ["a dashed line to a rectangle", "a solid labelled line between ovals", "a rectangle with the name inside", "a diamond between two ovals"], ans: 1, why: "A relationship is a labelled solid line joining the two ovals (nodes) it connects." },
    { q: "Which functional feature makes distribution easy?", opts: ["shared mutable global variables", "immutability and no side-effects", "GOTO jumps between functions", "loops that update a counter"], ans: 1, why: "No shared state." },
    { q: "'Suitable for parallel processing' as an answer scores:", opts: ["1 — names a valid benefit", "0 — not enough (NE)", "2 — it is the key point", "half — it needs a reason"], ans: 1, why: "The mark scheme gives no credit for a bare statement; you must say why, such as tasks running on several processors at once." },
    { q: "Video files, emails and web pages illustrate which characteristic?", opts: ["volume", "velocity", "variety", "veracity"], ans: 2, why: "Unstructured forms." }
  ],
  exam: [
    { src: "AQA 2023 P2 Q8", ctx: "A biscuit manufacturer analyses sales data from thousands of shops using a Big Data system based on a fact-based graph model.",
      parts: [
        { q: "Two characteristics of Big Data are volume and variety. State the third characteristic and explain what it means.", marks: 1, ms: ["Velocity — the data is generated / received and must be processed very quickly (1)"] },
        { q: "Extend the graph schema to show that: the Bath store sells chocolate biscuits; a packet of iced biscuits contains 20 biscuits and costs £1.50; both products are made by Delicious Snacks, which has 75 employees and also makes cake bars.", marks: 3, ms: ["Solid line labelled 'Sells' between the Bath store oval and the chocolate biscuits oval (1)", "Two rectangles ('20 biscuits', '£1.50') joined to iced biscuits by dashed lines (1)", "Oval for Delicious Snacks with a dashed-line rectangle '75 employees', a new oval for cake bars, and solid 'Makes' lines to all three products (1)"] },
        { q: "Explain two features of functional programming that make it suitable for processing Big Data across many servers.", marks: 2, ms: ["Immutable data structures / statelessness — functions have no side-effects, so their output depends only on their inputs (1)", "So functions can be distributed to many servers, executed on parts of the data and the results combined (map-reduce); higher-order functions compose the results / the order of execution is not fixed (1)"] }
      ] },
    { src: "AQA 2018 P2 Q14.1", q: "Describe two characteristics of Big Data.", marks: 2,
      ms: ["Volume — there is so much data that it will not fit / cannot be processed on one server (1)", "Velocity — the data is generated and must be processed at high speed / Variety — the data comes in many forms, often unstructured, and cannot be represented in a relational table (1)"] },
    { src: "AQA 2021 P2 Q9", q: "Discuss what Big Data is, the challenges of storing and processing it, and the ethical issues raised by its use.", marks: 12,
      ms: ["What it is: data that cannot be handled by traditional tools — volume (does not fit one machine), velocity (must be processed as it arrives), variety (unstructured: text, video, sensor data) (1–3)", "Challenges: distributed storage across many servers; fact-based, immutable models that are append-only; processing with map-reduce and functional techniques; hardware failure and consistency across nodes; data quality and cleaning (1–4)", "Ethical: profiling and privacy — combining datasets reveals more than any one did; consent and purpose limitation under data protection law; bias in analyses; surveillance; security of very large personal datasets; transparency about automated decisions (1–4)", "Level 4 (10–12): all three areas with a reasoned line and examples; Level 3 (7–9): two areas well; Level 2 (4–6); Level 1 (1–3)"] }
  ]
});

X("compsci:4.12.1.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Function types — domain, co-domain, notation" },
    "A function `f: A → B` maps values of the **domain** A to values of the **co-domain** B. Questions give a function definition and ask for its **co-domain** (2019, 2023, 2024 — 1 mark: name the set, *the set of integers / ℤ / the set of real numbers — all real-world quantities*; the symbol ℝ alone is NE) or its **type** (2025: `fibonacci: ℕ → ℕ`). 2025 also asked which statements about a recursive function are true: *the function has one argument* and *the function is a first-class object*.",
    { callout: { t: "memorise", body: "`f: X → Y` is read *f is a function from X to Y*. The **argument type** is X, the **result type** Y. A function of two arguments is written `add: ℤ × ℤ → ℤ`. The **range** is the subset of the co-domain actually produced." }}
  ],
  flashcards: [
    ["What is a function type?", "The specification of a function's argument set (domain) and result set (co-domain), written f: A → B.", 9],
    ["State the type of the function that maps an integer to its square.", "square: ℤ → ℤ (or ℤ → ℕ).", 12],
    ["State the type of fibonacci, which maps a position to a Fibonacci number.", "fibonacci: ℕ → ℕ.", 13],
    ["State the type of a function that halves a real number.", "half: ℝ → ℝ.", 14],
    ["How is a two-argument function's type written?", "add: ℤ × ℤ → ℤ — the domain is the Cartesian product.", 15],
    ["Difference between co-domain and range?", "The co-domain is the declared result set; the range is the subset of values actually produced.", 16]
  ],
  quiz: [
    { q: "In `f: ℕ → ℝ` the co-domain is:", opts: ["ℕ", "ℝ", "f", "the range"], ans: 1, why: "Right of the arrow." },
    { q: "A function that counts the words in a string has type:", opts: ["ℕ → String", "String → ℕ", "ℝ → ℕ", "String → String"], ans: 1, why: "String in, natural number out." },
    { q: "Writing 'ℝ' alone as the co-domain of a real-valued function scores:", opts: ["1 — ℝ is the right set", "0 — describe the set", "2 — it is fully correct", "half — it needs ℤ too"], ans: 1, why: "NE per mark scheme." },
    { q: "`add: ℤ × ℤ → ℤ` takes:", opts: ["one integer", "two integers", "a list", "no arguments"], ans: 1, why: "Cartesian product domain." },
    { q: "The range of `square: ℤ → ℤ` is:", opts: ["all integers, positive and negative", "the non-negative perfect squares", "every real number, ℝ", "every positive integer"], ans: 1, why: "Values actually produced." },
    { q: "A recursive one-argument function that is a first-class object:", opts: ["cannot be passed to another function as an argument", "can be passed as an argument and has one parameter", "has no type, as it calls itself recursively", "is imperative, since it repeats like a loop"], ans: 1, why: "2025 true statements." }
  ],
  exam: [
    { src: "AQA 2024 P2 Q11.1", q: "A function `area` takes the radius of a circle and returns its area. Describe the co-domain of the function.", marks: 1,
      ms: ["The set of real numbers — all possible real-world quantities / the rational and irrational numbers (not just the symbol ℝ) (1)"] },
    { src: "AQA 2025 P2 Q11.2", q: "A recursive function `fibonacci` takes a position in the Fibonacci sequence and returns the value at that position. State the function type of `fibonacci`.", marks: 1,
      ms: ["fibonacci: ℕ → ℕ (1)"] },
    { src: "AQA 2019 P2 Q7.1", q: "The function `double` is defined by `double(x) = 2x` for integer x. State the co-domain of `double`.", marks: 1,
      ms: ["The set of integers / ℤ (the same set as the domain) (1)"] }
  ]
});

X("compsci:4.12.1.2", {
  flashcards: [
    ["What does it mean for a function to be a first-class object?", "It can be treated like any other value: assigned to a variable, passed as an argument, returned as a result, stored in a data structure.", 8],
    ["Why is first-class status essential for higher-order functions?", "map, filter and fold take a function as an argument — impossible unless functions are values.", 9],
    ["Give an example of a function returned as a result.", "Partial application: add 4 returns a new function that adds 4.", 10],
    ["Give an example of a function passed as an argument.", "map square [1, 3, 5] — square is passed to map.", 11],
    ["Can a function be stored in a list?", "Yes — a list of functions is a legitimate value in a functional language.", 12],
    ["What other objects are first-class?", "Numbers, strings, lists — anything that can be passed, returned and assigned.", 13],
    ["What is a function literal / lambda?", "An anonymous function written in place, e.g. λx. x + 1, passed without being named.", 14],
    ["True or false: in a functional language every function is a first-class object?", "Yes — in a functional language every function is a first-class object.", 15]
  ],
  quiz: [
    { q: "A first-class object can be:", opts: ["only called, never stored in a variable", "passed as an argument and returned as a result", "only stored on disk, not in memory", "only compiled, and never passed to a function"], ans: 1, why: "A first-class object is treated like any other value, so it can be passed in and returned from functions." },
    { q: "`map square list` works because square is:", opts: ["a keyword built into the language", "a first-class object passed to map", "a variable holding a single number", "a list of values to be squared"], ans: 1, why: "Function as argument." },
    { q: "Which returns a function?", opts: ["add 3 4", "add 3", "3 + 4", "head [3]"], ans: 1, why: "Partial application." },
    { q: "A lambda is:", opts: ["a list of functions", "an anonymous function", "a type of variable", "a recursive variable"], ans: 1, why: "Function literal." },
    { q: "Storing functions in a list is:", opts: ["impossible in a functional language", "allowed — functions are values", "only possible in C, using pointers", "an error, as lists hold data only"], ans: 1, why: "Functions are first-class values, so they can be stored in a list like numbers or strings." },
    { q: "Higher-order functions depend on:", opts: ["loops that repeat a function", "functions being first-class objects", "global state shared between functions", "mutable data passed between functions"], ans: 1, why: "A function can only take or return another function if functions are first-class objects." }
  ],
  exam: [
    { src: "AQA 2025 P2 Q11.1", q: "The recursive function `fibonacci` is defined in a functional language. State which of the following are true: (A) the function has one argument; (B) the function is a first-class object; (C) the function modifies a global variable; (D) the function must be called with a list.", marks: 1,
      ms: ["A and B (1)"] },
    { src: "AQA 2020 P2 Q11.3", q: "Explain what is meant by a function being a first-class object and why this matters in functional programming.", marks: 2,
      ms: ["A function can be used like any other value — assigned, passed as an argument, returned as a result, stored in a structure (1)", "This allows higher-order functions such as map, filter and reduce, and partial application, which are central to the paradigm (1)"] }
  ]
});

X("compsci:4.12.1.3", {
  flashcards: [
    ["What is function application?", "Applying a function to its argument(s) to obtain a result, e.g. add 3 4 = 7.", 8],
    ["How is application written in a functional language?", "Function name followed by arguments separated by spaces, without brackets: f x y.", 9],
    ["What is a curried function?", "A multi-argument function treated as a chain of single-argument functions: add 3 4 = (add 3) 4.", 13],
    ["Evaluate `map (+1) [1, 2, 3]`.", "[2, 3, 4].", 14],
    ["What happens when a function is applied to fewer arguments than it takes?", "Partial application — a new function awaiting the remaining arguments is returned.", 15]
  ],
  quiz: [
    { q: "`add 3 4` where add x y = x + y evaluates to:", opts: ["34", "7", "a function", "error"], ans: 1, why: "Full application." },
    { q: "`(add 3) 4` evaluates to:", opts: ["7", "3", "a function", "error"], ans: 0, why: "Curried application." },
    { q: "`fold (*) 1 [2, 3, 2]` =", opts: ["7", "12", "6", "14"], ans: 1, why: "fold (*) 1 [2, 3, 2] multiplies from the start value 1: 1 × 2 × 3 × 2 = 12." },
    { q: "`head (tail [5, 6, 7])` =", opts: ["5", "6", "7", "[6, 7]"], ans: 1, why: "tail gives [6, 7]." },
    { q: "In `f x y`, the arguments are:", opts: ["f and x", "x and y", "only y", "none"], ans: 1, why: "Space-separated." },
    { q: "Applying a two-argument function to one argument gives:", opts: ["an error, as one argument is missing", "a new one-argument function", "zero, as the second argument is 0", "a list of the possible results"], ans: 1, why: "Partial application." }
  ],
  exam: [
    { src: "AQA 2020 P2 Q11.4", q: "Using the definitions `square x = x * x` and the built-in functions head, tail and fold, evaluate: (i) `head (tail [6, 2, 9])` (ii) `square (head [3, 5])` (iii) `fold (*) 1 [2, 3, 2]`.", marks: 3,
      ms: ["(i) 2 (1)", "(ii) 9 (1)", "(iii) 12 (1)"] },
    { src: "AQA 2019 P2 Q7.2", q: "The functions `double x = 2x` and `inc x = x + 1` are defined for integers. Evaluate `double (inc 5)` and `inc (double 5)`.", marks: 1,
      ms: ["12 and 11 (1)"] }
  ]
});

X("compsci:4.12.1.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Partial application — 2019 (3 marks), 2025 (2 marks)" },
    "The three points: the function is **applied to one (some) of its arguments** — that argument is **fixed / bound**; the result is a **new function**; which **takes fewer arguments** (the remaining ones). The AO2 mark: say what the new function does — `add 6` is a function that **adds 6 to its argument** (`add6(x) = 6 + x`). Answers by example alone cap at 2." ],
  flashcards: [
    ["Define partial function application.", "Applying a function to only some of its arguments, fixing them, to produce a new function that takes the remaining arguments.", 8],
    ["What does `add 6` produce, where add x y = x + y?", "A new one-argument function that adds 6 to its argument: add6(x) = 6 + x.", 9],
    ["What is the type of `add 6` if add: ℤ × ℤ → ℤ?", "ℤ → ℤ.", 10],
    ["Why is partial application useful?", "Specialised functions can be built from general ones and passed to map/filter, e.g. map (add 6) list.", 11],
    ["What does `multiply 2` give?", "A doubling function.", 12],
    ["Evaluate `(add 6) 10`.", "16.", 13],
    ["How does currying enable partial application?", "A curried function takes its arguments one at a time, so supplying one returns a function waiting for the next.", 14],
    ["What does `map (multiply 3) [1, 2, 3]` give?", "[3, 6, 9].", 15]
  ],
  quiz: [
    { q: "Partial application of a 3-argument function to one argument gives a function of:", opts: ["3 arguments", "2 arguments", "1 argument", "0 arguments"], ans: 1, why: "Remaining arguments." },
    { q: "If add :: Integer -> Integer -> Integer, then add 4 has type:", opts: ["Integer -> Integer", "Integer", "Integer -> Integer -> Integer", "(Integer, Integer)"], ans: 0, why: "One argument supplied, one still to come." },
    { q: "`(add 4) 9` =", opts: ["49", "13", "a function", "4"], ans: 1, why: "Apply the new function." },
    { q: "Partial application relies on:", opts: ["loops that repeat the function", "currying / functions being first-class", "global variables holding the arguments", "side-effects that store the first argument"], ans: 1, why: "Currying and partial application need functions to be values that can be returned, so first-class functions are required." },
    { q: "`map (add 10) [1, 2]` =", opts: ["[11, 12]", "[1, 2, 10]", "[10]", "error"], ans: 0, why: "Specialised function mapped." },
    { q: "An answer by example only, for 'explain partial application', is capped at:", opts: ["1", "2", "3", "0"], ans: 1, why: "Mark scheme note." }
  ],
  exam: [
    { src: "AQA 2019 P2 Q7.3", q: "The function `add` is defined by `add x y = x + y`. Explain what happens when `add` is partially applied as `add 6`, and describe the function that results.", marks: 3,
      ms: ["The function is applied to only one of its arguments — the value 6 is fixed / bound (1)", "The output of this application is a new function that takes one (fewer) argument (1)", "The new function adds 6 to its single argument: add6(x) = 6 + x (1)"] },
    { src: "AQA 2025 P2 Q11.4", q: "Explain what is meant by partial function application.", marks: 2,
      ms: ["One or more of the arguments to a function are fixed — the function is applied to some of its arguments (1)", "Creating a new function with fewer arguments, which takes the remaining arguments (1)"] }
  ]
});

X("compsci:4.12.1.5", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Composition — 2018, 2022" },
    "`(f ∘ g)(x) = f(g(x))` — **g is applied first**. Questions give small functions (convert Fahrenheit to Celsius, average a list, total sales) and ask what a **composed** function computes (*the average temperature in Celsius*, *one day's total sales revenue*) and why one ordering is **better**: composing the average first means **only one conversion** is performed instead of one per element.",
    { callout: { t: "warn", body: "Types must line up: the co-domain of g must be the domain of f. `average ∘ map toCelsius` is legal; `toCelsius ∘ average` needs average to produce a number." }}
  ],
  flashcards: [
    ["Define function composition.", "Combining two functions f and g into a new function f ∘ g such that (f ∘ g)(x) = f(g(x)) — g is applied first, then f.", 8],
    ["What condition must hold to compose f ∘ g?", "The co-domain of g must match (be a subset of) the domain of f.", 9],
    ["If g doubles and f adds 1, what is (f ∘ g)(5)?", "f(g(5)) = f(10) = 11.", 10],
    ["If g doubles and f adds 1, what is (g ∘ f)(5)?", "g(f(5)) = g(6) = 12.", 11],
    ["fv converts a list of Fahrenheit to Celsius and fw averages a list. What does fw ∘ fv compute?", "The average temperature in Celsius.", 12],
    ["Why is `toCelsius ∘ average` better than `average ∘ map toCelsius`?", "Only one conversion is done instead of one per element — fewer function calls.", 13],
    ["What does `total ∘ map price` compute over a list of items sold?", "One day's total sales revenue.", 15]
  ],
  quiz: [
    { q: "(f ∘ g)(x) means:", opts: ["g(f(x))", "f(g(x))", "f(x) × g(x)", "f(x) + g(x)"], ans: 1, why: "Composition applies g first, then f to the result, so (f ∘ g)(x) = f(g(x))." },
    { q: "g(x) = x + 3, f(x) = x². (f ∘ g)(2) =", opts: ["7", "25", "13", "10"], ans: 1, why: "g(2) = 2 + 3 = 5, then f(5) = 5² = 25." },
    { q: "To compose f ∘ g, g's co-domain must match:", opts: ["f's co-domain", "f's domain", "g's domain", "nothing"], ans: 1, why: "g's output feeds into f, so g's co-domain must fit f's domain." },
    { q: "Composing 'convert each element' after 'average' rather than before:", opts: ["is impossible, as map must come first", "does one conversion instead of many", "changes the answer the program gives", "adds a loop that makes it slower"], ans: 1, why: "Converting after averaging converts one value instead of every element, so there are fewer conversions." },
    { q: "If g: ℕ → String and f: String → ℕ, then f ∘ g has type:", opts: ["String → String", "ℕ → ℕ", "ℕ → String", "String → ℕ"], ans: 1, why: "Domain of g to co-domain of f." },
    { q: "Composition produces:", opts: ["a value", "a new function", "a list of results", "a type"], ans: 1, why: "Function-level operation." }
  ],
  exam: [
    { src: "AQA 2022 P2 Q12", ctx: "Functions are defined as: `fu` converts a single temperature from Fahrenheit to Celsius; `fv = map fu` converts a whole list; `fw` calculates the average of a list of numbers; `fx = fw ∘ fv`; `fy = fu ∘ fw`.",
      parts: [
        { q: "State the purpose of the function `fx`.", marks: 1, ms: ["Calculates the average temperature in Celsius of a list of Fahrenheit temperatures (1)"] },
        { q: "`fy` produces the same result as `fx`. Explain why `fy` is the better definition.", marks: 1, ms: ["Only one conversion from Fahrenheit to Celsius is performed (after averaging) instead of one per element — fewer function calls; `fv` is no longer needed (1)"] },
        { q: "Given `temps = [50, 68, 95, 86]`, state the value of `fx temps`.", marks: 1, ms: ["(10 + 20 + 35 + 30) / 4 = 23.75 (1)"] }
      ] },
    { src: "AQA 2018 P2 Q15.3", q: "A shop defines `price` (item → its price), `sold` (the day's list of items sold) and `total = fold (+) 0`. State what the function `total ∘ map price` applied to `sold` computes.", marks: 1,
      ms: ["The day's total sales value / revenue (1)"] }
  ]
});

X("compsci:4.12.2.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Higher-order functions — map, filter, fold" },
    "**Definition** (1–2 marks): a function that **takes a function as an argument** and/or **returns a function as a result** — describing map specifically is rejected. **Evaluate** (3–4 marks, one per row): `map square [1, 3, 5]` → **[1, 9, 25]**; `filter (< 10) [1, 15, 5]` → **[1, 5]**; `fold (+) 0 [2, 4, 6]` → **12**; `fold (*) 1 [2, 3, 2]` → **12**. Brackets missing or wrong style are ignored; each element in a separate list is rejected.",
    { callout: { t: "memorise", body: "**map** applies a function to every element, returning a list of the same length. **filter** keeps the elements for which a predicate is true. **fold (reduce)** combines the elements into one value using a binary function and a starting value." }}
  ],
  flashcards: [
    ["Define a higher-order function.", "A function that takes a function as an argument, or returns a function as its result, or both.", 12],
    ["What does filter do?", "Returns the list of elements for which a given predicate (Boolean function) is true.", 14],
    ["What does fold (reduce) do?", "Combines all the elements of a list into a single value using a two-argument function and an initial value.", 15],
    ["Evaluate `fold (+) 0 [2, 4, 6]`.", "12.", 18],
    ["Which built-ins are higher-order: map, filter, fold, head?", "map, filter and fold (they take a function); head is not.", 20],
    ["Write 'the sum of the squares of the even numbers in xs' with higher-order functions.", "fold (+) 0 (map square (filter even xs)).", 21]
  ],
  quiz: [
    { q: "A higher-order function:", opts: ["is very long, with many lines", "takes or returns a function", "always uses recursion", "has no arguments at all"], ans: 1, why: "A higher-order function either takes a function as an argument or returns one as its result." },
    { q: "`map (*2) [1, 2, 3]` =", opts: ["[2, 4, 6]", "6", "[1, 2, 3, 2]", "12"], ans: 0, why: "map applies the function to each element in turn, so doubling gives [2, 4, 6]." },
    { q: "`filter odd [1, 2, 3, 4, 5]` =", opts: ["[2, 4]", "[1, 3, 5]", "9", "[1, 2, 3, 4, 5]"], ans: 1, why: "filter keeps only the elements for which the predicate is true, which here is the odd numbers." },
    { q: "`fold (+) 0 [3, 8, 1]` =", opts: ["[3, 8, 1]", "12", "24", "0"], ans: 1, why: "fold (+) 0 [3, 8, 1] adds each element to a running total: 0 + 3 + 8 + 1 = 12." },
    { q: "The list returned by map has:", opts: ["fewer elements, as some are removed", "the same number of elements", "one element, the combined total", "more elements, one per result"], ans: 1, why: "map turns each element into exactly one result, so the output list is the same length as the input." },
    { q: "'A function that applies another function to each list element' as a definition of higher-order function is:", opts: ["accepted — it is the textbook definition", "rejected — that describes map only", "half marks — it needs an example", "accepted, as a bonus mark"], ans: 1, why: "R. explanations specific to map." },
    { q: "`fold (*) 1 [4, 5]` =", opts: ["9", "20", "1", "[20]"], ans: 1, why: "fold (*) 1 [4, 5] multiplies the elements into the start value: 1 × 4 × 5 = 20." }
  ],
  exam: [
    { src: "AQA 2017 P2 Q6", ctx: "Lists are defined: `a = [1, 3, 5]`, `b = [12, 1, 5, 20]`, `c = [2, 4, 6]`; `square x = x * x`.",
      parts: [
        { q: "State the result of each: `map square a`, `filter (< 10) b`, `fold (+) 0 c`.", marks: 3, ms: ["[1, 9, 25] (1)", "[1, 5] (1)", "12 (1)"] },
        { q: "Explain what is meant by a higher-order function.", marks: 1, ms: ["A function that takes a function as an argument and/or returns a function as a result (1)"] }
      ] },
    { src: "AQA 2018 P2 Q15", ctx: "A shop records `sales = [4, 10, 8]` (items sold per product) and defines `fw = map (*5)`, `fx = fold (+) 0`, `fy = filter (> 5)` and `fz = fx ∘ fw`.",
      parts: [
        { q: "State how many of the functions fw, fx, fy, fz are defined using a higher-order function.", marks: 1, ms: ["4 (all of them — fz composes two) (1)"] },
        { q: "Evaluate `fw sales`, `fy sales` and `fz sales`.", marks: 3, ms: ["[20, 50, 40] (1)", "[10, 8] (1)", "110 (1)"] }
      ] }
  ]
});

X("compsci:4.12.3.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "List processing — head, tail, and the recursive trace" },
    "`head` is the first element; `tail` is the list without its first element; `[]` is the empty list; `x:xs` builds (or pattern-matches) a list from a head and a tail. The 2020 and 2023 traces: `total [] = 0`, `total (x:xs) = x + total xs` — *it is recursive; it splits the list into head and tail; calls itself on the tail; adds the head to the total of the tail; terminates on the empty list*.",
    { callout: { t: "tip", body: "`head []` is an error — the empty list has no head. `tail [7]` is `[]`, not an error. When asked to evaluate `head (tail (tail b))`, peel one call at a time from the inside." }}
  ],
  flashcards: [
    ["What does head return?", "The first element of a non-empty list.", 11],
    ["What does tail return?", "The list with its first element removed (possibly empty).", 12],
    ["What is `[]`?", "The empty list.", 13],
    ["What does `x:xs` mean?", "The list whose head is x and tail is xs — prepending x to xs; also used as a pattern to split a list.", 14],
    ["Evaluate `head [4, 2, 5]` and `tail [4, 2, 5]`.", "4 and [2, 5].", 15],
    ["Evaluate `head (tail (tail [12, 1, 5, 20]))`.", "5.", 16],
    ["Define a recursive `total` for a list of numbers.", "total [] = 0; total (x:xs) = x + total xs.", 17],
    ["Define a recursive `length`.", "length [] = 0; length (x:xs) = 1 + length xs.", 18],
    ["What is the base case of most list recursions?", "The empty list [].", 19],
    ["Evaluate `3 : [7, 9]`.", "[3, 7, 9].", 20]
  ],
  quiz: [
    { q: "`tail [1, 2, 3]` =", opts: ["3", "[2, 3]", "[1, 2]", "1"], ans: 1, why: "tail returns the list without its head, so removing 1 leaves [2, 3]." },
    { q: "`head (tail [8, 6, 4])` =", opts: ["8", "6", "4", "[6, 4]"], ans: 1, why: "tail = [6, 4]; head = 6." },
    { q: "`total (x:xs) = x + total xs` terminates because:", opts: ["x becomes 0 after enough calls", "the list eventually becomes [] (base case)", "xs grows until it reaches the recursion limit", "the + operator works like a loop"], ans: 1, why: "Each call shortens the list." },
    { q: "`5 : []` =", opts: ["5", "[5]", "[]", "error"], ans: 1, why: "Prepending 5 to the empty list gives a list with the single element 5." },
    { q: "`head []` is:", opts: ["0", "[]", "an error", "Nothing"], ans: 2, why: "No first element." },
    { q: "`length (x:xs) = 1 + length xs` on [a, b, c] makes how many calls including the initial one?", opts: ["3", "4", "1", "2"], ans: 1, why: "[a,b,c], [b,c], [c], []." }
  ],
  exam: [
    { src: "AQA 2020 P2 Q11", ctx: "A function is defined: `total [] = 0` and `total (x:xs) = x + total xs`.",
      parts: [
        { q: "State the head and tail of the list `[6, 2, 9, 4]`.", marks: 1, ms: ["head 6, tail [2, 9, 4] (1)"] },
        { q: "Explain how the function `total` calculates the sum of a list.", marks: 3, ms: ["The function is recursive — it splits the list into its head and tail (1)", "It calls itself with the tail as the argument and adds the head to the result (1)", "The recursion terminates when the list is empty, returning 0 (1)"] }
      ] },
    { src: "AQA 2023 P2 Q12", ctx: "A function `count` is defined: `count [] = 0` and `count (x:xs) = 1 + count xs`.",
      parts: [
        { q: "Complete a trace showing each call, its argument and the value returned for `count [7, 3, 9]`.", marks: 3, ms: ["Arguments in order: [7, 3, 9], [3, 9], [9], [] (1)", "Bottom row: [] returns 0 (1)", "Values returned 3, 2, 1, 0 in order (1)"] },
        { q: "State the co-domain of `count`.", marks: 1, ms: ["The set of natural numbers / ℕ (1)"] }
      ] },
    { src: "AQA 2017 P2 Q6.1", q: "Given `b = [12, 1, 5, 20]`, state the value of `head (tail (tail b))`.", marks: 1,
      ms: ["5 (1)"] }
  ]
});

X("compsci:4.13.1.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Analysis (AS 2020 — 2 marks)" },
    "Work done during analysis: **identify the problem** and its **scope**; establish **requirements** (what the system must do) by **interviewing / observing / questionnaires**; **investigate the current system**; produce a **data-flow / description** and **acceptance criteria**; consider **feasibility** (technical, economic, time). The output is a **specification** the design must meet.",
    { callout: { t: "tip", body: "For any *life-cycle* question, name the stage and give a **concrete activity** — \"talk to the users\" scores when it says *to determine the requirements*." }}
  ],
  flashcards: [
    ["What is the purpose of the analysis stage?", "To understand and define the problem: gather requirements, study the current system and produce a specification of what the new system must do."],
    ["Name three methods of gathering requirements.", "Interviews, questionnaires, observation of the current system, examining existing documents."],
    ["What is a requirements specification?", "A document listing what the system must do (functional) and the constraints it must meet (non-functional), agreed with the client."],
    ["What is a feasibility study?", "An assessment of whether the project is achievable — technically, economically, legally and within the time available."],
    ["Difference between functional and non-functional requirements?", "Functional: what it does (calculate, store, display). Non-functional: qualities — speed, security, usability, reliability."],
    ["What is problem definition?", "A clear statement of the problem to be solved and its scope, agreed with the client."],
    ["What are acceptance criteria?", "Measurable conditions the finished system must meet to be accepted by the client."],
    ["Why is analysis done before design?", "The design must satisfy the requirements; without them the wrong system is built."]
  ],
  quiz: [
    { q: "Interviewing users to discover what the system must do belongs to:", opts: ["design", "analysis", "implementation", "testing"], ans: 1, why: "Requirements gathering." },
    { q: "'The system must respond within 2 seconds' is a:", opts: ["functional requirement", "non-functional requirement", "test case", "design decision"], ans: 1, why: "Quality constraint." },
    { q: "A feasibility study checks:", opts: ["that the program's code compiles and runs without any errors", "whether the project can be done technically, economically and in time", "the results of each test against the expected results in the plan", "the colours, fonts and layout of the user interface screens"], ans: 1, why: "A feasibility study asks whether the project is possible technically, economically and in the time available." },
    { q: "The output of analysis is:", opts: ["a working, tested program", "a requirements specification", "a set of test data for the system", "the user manual for the system"], ans: 1, why: "Analysis produces the requirements specification, which the design stage then works from." },
    { q: "Observing the current manual system is a method of:", opts: ["testing the new system", "requirements gathering", "coding the solution", "evaluating the system"], ans: 1, why: "Analysis technique." },
    { q: "Acceptance criteria are used to:", opts: ["write the code for each module of the system", "judge whether the finished system meets its requirements", "choose the programming language the team will use", "draw the structure diagrams for the system's design"], ans: 1, why: "Evaluation basis." }
  ],
  exam: [
    { level: "AS", src: "AS 2020 P1 Q1", q: "Describe two pieces of work that would be undertaken during the analysis stage of developing a program.", marks: 2,
      ms: ["Establishing the requirements of the system by interviewing / questioning / observing the users (1)", "Investigating the current system / defining the scope of the problem / producing a specification and acceptance criteria / carrying out a feasibility study (1)"] },
    { src: "AQA 2019 P2 Q1", q: "Explain the difference between functional and non-functional requirements, giving an example of each for an online booking system.", marks: 2,
      ms: ["Functional: what the system must do, e.g. allow a customer to book a seat for a showing (1)", "Non-functional: the qualities it must have, e.g. respond within two seconds / encrypt customer data (1)"] }
  ]
});

X("compsci:4.13.1.2", {
  flashcards: [
    ["What is produced during the design stage?", "Data structures, algorithms (pseudo-code / flowcharts), the user interface, the modular structure (hierarchy chart), file/database design and a test plan.", 8],
    ["What is prototyping?", "Building a simplified working model of part of the system (often the interface) to get user feedback early.", 10],
    ["Why design the test plan before coding?", "Tests are derived from the requirements, not the code, so they check what was asked for.", 11],
    ["What is a data dictionary?", "A description of every data item: name, type, size, validation, purpose.", 12],
    ["What is the purpose of designing algorithms in pseudo-code first?", "Logic can be checked and traced independently of language syntax.", 13],
    ["What does UI design consider?", "Layout, input methods, validation feedback, accessibility, consistency.", 14],
    ["What is modular design?", "Splitting the program into self-contained modules with defined interfaces so they can be developed and tested separately.", 15]
  ],
  quiz: [
    { q: "Deciding to store records in a hash table happens in:", opts: ["analysis", "design", "testing", "evaluation"], ans: 1, why: "Data structure design." },
    { q: "Which is decided during design, not analysis?", opts: ["the algorithms each module will use", "what the client needs the system to do", "who the users of the system will be", "the problems with the current system"], ans: 0, why: "Analysis says what; design says how." },
    { q: "A prototype is used to:", opts: ["replace the testing of the final system entirely", "get early user feedback on part of the design", "make the final program compile faster", "document the code for later maintenance"], ans: 1, why: "Iterative refinement." },
    { q: "The test plan is written:", opts: ["after coding only, from the finished code", "during design, from the requirements", "never, as testing needs no plan", "by the compiler as the code is built"], ans: 1, why: "Requirement-driven." },
    { q: "Pseudo-code is used in design because:", opts: ["it runs faster than code in a real language", "logic can be checked before committing to syntax", "it is compiled into a design document", "it is required by law for every software project"], ans: 1, why: "Language-independent." },
    { q: "A data dictionary records:", opts: ["the test data for each module", "each data item's name, type and validation", "the users' complaints about the system", "the layout of each screen in the user interface"], ans: 1, why: "A data dictionary lists each data item with its name, type and validation rules." }
  ],
  exam: [
    { src: "AQA 2021 P2 Q3", q: "Describe three activities that take place during the design stage of a software project.", marks: 3,
      ms: ["Designing the data structures / database (e.g. relations and keys) to be used (1)", "Designing the algorithms — pseudo-code or flowcharts — and the modular structure (hierarchy chart) (1)", "Designing the user interface / producing a test plan from the requirements / prototyping (1)"] }
  ]
});

X("compsci:4.13.1.3", {
  flashcards: [
    ["What happens during implementation?", "The design is turned into code in a chosen language, module by module, following the design; each module is tested as it is written."],
    ["Why implement modules separately?", "Each can be written and tested independently, errors are localised, and team members can work in parallel."],
    ["What is a prototype in implementation?", "An early partial version used to check feasibility and gather feedback before full development."],
    ["What are code annotations (comments) for?", "To explain purpose and design decisions so the code can be understood and maintained."],
    ["What is version control?", "Tracking changes to source files so earlier versions can be recovered and team edits merged."],
    ["Why follow coding standards?", "Consistent naming, layout and structure make code easier to read, test and maintain."],
    ["What is meant by structured programming in implementation?", "Using only sequence, selection and iteration with subroutines — no unstructured jumps."],
    ["What is integration?", "Combining separately implemented modules and testing that they work together."]
  ],
  quiz: [
    { q: "Turning pseudo-code into a working program is:", opts: ["analysis of the problem", "design of the solution", "implementation", "evaluation"], ans: 2, why: "Implementation is the stage where the design (such as pseudo-code) is written as a working program." },
    { q: "Writing and testing one module at a time:", opts: ["slows development, as more is written", "localises errors and allows parallel work", "is forbidden in most methodologies", "removes the need for a design stage"], ans: 1, why: "Modular implementation." },
    { q: "Meaningful identifiers and comments aid:", opts: ["the speed the program runs at", "maintainability and understanding", "how quickly the program compiles", "how little memory the program uses"], ans: 1, why: "Clear names and comments make the code easier to read, so it is easier to maintain." },
    { q: "Combining tested modules is called:", opts: ["analysis", "integration", "prototyping", "evaluation"], ans: 1, why: "Integration joins separately tested modules together and checks that they work as one system." },
    { q: "Version control lets a team:", opts: ["skip the testing of each change that is made", "recover earlier versions and merge changes", "avoid the design stage of the project", "compile the program faster each time"], ans: 1, why: "Version control stores each version, so a team can go back to an earlier one and merge changes." },
    { q: "A prototype in implementation is:", opts: ["the final product handed to the client", "an early partial version for feedback", "a test plan for the final system", "a data dictionary for each table"], ans: 1, why: "A prototype is an early, partial version that users can try, so feedback can improve the design." }
  ],
  exam: [
    { src: "AQA 2020 P2 Q12", q: "A team of programmers is implementing a large system designed as a set of modules. Explain two practices they should follow during implementation and why.", marks: 4,
      ms: ["Implement and test each module separately (1) — so errors are localised and members can work in parallel on different modules (1)", "Use meaningful identifiers, comments and consistent coding standards (1) — so the code can be understood, tested and maintained by others (1)", "Accept: use version control so changes can be merged and earlier versions recovered (1 + 1)", "Max 4"] }
  ]
});

X("compsci:4.13.1.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Testing — the AS Section A follow-up every year" },
    "After every AS programming task: *\"Test your program with the input X. Provide screen capture(s) of the test(s).\"* — 1 mark per described test, awarded only if the screenshot shows **the input and the resulting output** matching what the question asked. AS 2016 asked for the **three types of test data**: **normal / typical**, **boundary / extreme** (values at the edges of the valid range) and **erroneous / invalid** (values that should be rejected).",
    { callout: { t: "memorise", body: "**Black-box** testing checks outputs against the specification without looking at the code; **white-box** testing examines every path through the code. **Unit** → **integration** → **system** → **acceptance** (by the client). A **test plan** lists each test's purpose, input, expected and actual result." }}
  ],
  flashcards: [
    ["Name the three types of test data.", "Normal (typical valid values), boundary (values at the limits of the valid range, and just outside), erroneous (invalid values that should be rejected).", 9],
    ["Give normal, boundary and erroneous data for a percentage mark 0–100.", "Normal 57; boundary 0, 100, −1, 101; erroneous 'fifty', 250.", 10],
    ["What is black-box testing?", "Testing against the specification by checking outputs for given inputs, without knowledge of the code.", 11],
    ["What is white-box testing?", "Testing that examines the code's internal logic to ensure every path and branch is exercised.", 12],
    ["What is unit testing?", "Testing an individual module / subroutine in isolation.", 13],
    ["What is integration testing?", "Testing that modules work correctly together once combined.", 14],
    ["What is acceptance testing?", "Testing by the client against the agreed requirements to decide whether to accept the system.", 15],
    ["What must a screenshot of a test show to score?", "The input entered and the output produced for the specific test the question described.", 17],
    ["What is regression testing?", "Re-running earlier tests after a change to make sure nothing that worked has broken.", 18]
  ],
  quiz: [
    { q: "For a valid range 1–10, which is normal (typical) data?", opts: ["5", "0", "11", "'five'"], ans: 0, why: "Inside the range, away from its edges." },
    { q: "Entering 'abc' where a number is required tests:", opts: ["normal data", "boundary data", "erroneous data", "nothing"], ans: 2, why: "Should be rejected." },
    { q: "Testing every branch of the code is:", opts: ["black-box", "white-box", "acceptance", "beta"], ans: 1, why: "White-box testing uses knowledge of the code's inner structure to exercise every branch." },
    { q: "The client testing against the requirements is:", opts: ["unit testing", "acceptance testing", "regression testing", "alpha testing"], ans: 1, why: "Acceptance testing is when the client checks the system against the agreed requirements before signing it off." },
    { q: "A screen capture of a test scores only if it shows:", opts: ["the code that was run for the test", "the specified input and its output", "the version of the compiler used", "the date and time of the test"], ans: 1, why: "Evidence of the described test." },
    { q: "Re-running old tests after a fix is:", opts: ["regression testing", "integration testing", "prototype testing", "analysis"], ans: 0, why: "Regression testing re-runs earlier tests after a change to confirm that nothing that worked has broken." }
  ],
  exam: [
    { level: "AS", src: "AS 2016 P1 Q3", q: "A program checks that an entered age is between 16 and 18 inclusive. Name the three types of test data that should be used and give one example of each for this program.", marks: 3,
      ms: ["Normal / typical — e.g. 17 (1)", "Boundary / extreme — e.g. 16, 18 (and 15, 19) (1)", "Erroneous / invalid — e.g. 'seventeen' or 40 (1)"] },
    { src: "AQA 2022 P2 Q13", q: "Explain the difference between black-box and white-box testing, and state at which stage acceptance testing takes place and who carries it out.", marks: 3,
      ms: ["Black-box: tests outputs against the specification without considering the code (1)", "White-box: tests the internal logic so every path / branch is exercised (1)", "Acceptance testing is carried out at the end, by the client / users, against the agreed requirements (1)"] }
  ]
});

X("compsci:4.13.1.5", {
  flashcards: [
    ["What is the purpose of evaluation?", "To judge whether the finished system meets the requirements and acceptance criteria, and how well, identifying improvements."],
    ["Against what is a system evaluated?", "The requirements specification and acceptance criteria agreed during analysis."],
    ["Name three evaluation criteria.", "Correctness (meets requirements), usability, performance/efficiency, reliability, maintainability, cost/time."],
    ["Why obtain user feedback in evaluation?", "The client judges fitness for purpose; developers may not see usability problems."],
    ["What is the difference between testing and evaluation?", "Testing finds errors; evaluation judges the whole system against its objectives."],
    ["What might an evaluation recommend?", "Improvements, further development, changes to the process for future projects."],
    ["What is maintenance?", "Ongoing changes after delivery — fixing bugs, adapting to new requirements, improving performance."],
    ["Why is evaluation done against criteria fixed earlier?", "So the judgement is objective — success is measured against what was agreed, not what was built."],
    ["Why can \"the system must be fast\" not be evaluated?", "It sets no measure: rewrite it with a number and a condition, e.g. a record found within 2 s with 10 000 stored.", 100],
    ["What should an evaluation say about an objective that was not met?", "State it honestly, give the reason, and describe a specific change that would meet it.", 101]
  ],
  quiz: [
    { q: "Evaluation criteria should be:", opts: ["measurable and set before development", "chosen after testing to fit the results", "written by the developer alone at the end", "based on how long the project took"], ans: 0, why: "Otherwise the judgement proves nothing." },
    { q: "Which is an evaluation criterion?", opts: ["Variable names", "Usability", "Line count", "Compiler version"], ans: 1, why: "Usability is a quality of the finished system that can be judged against the requirements; the others are not criteria." },
    { q: "Testing versus evaluation:", opts: ["the same thing, under two different names for each stage", "testing finds errors; evaluation judges fitness for purpose", "evaluation is done first, then the system is tested", "neither is needed once the code compiles without errors"], ans: 1, why: "Distinct stages." },
    { q: "User feedback is gathered because:", opts: ["it is optional, but looks good", "users judge usability and fitness for purpose", "developers are not able to test their own code", "it is free, unlike professional testing"], ans: 1, why: "Client perspective." },
    { q: "An evaluation may lead to:", opts: ["nothing, once the system is live", "recommended improvements and maintenance", "deleting the system and starting again", "a return to analysis, and nothing else"], ans: 1, why: "Evaluation finds weaknesses, which lead to recommended improvements and further maintenance." },
    { q: "Adapting a delivered system to new requirements is:", opts: ["analysis", "maintenance", "testing", "prototyping"], ans: 1, why: "Maintenance is changing a system after delivery, for example to meet new requirements." },
    { qk: "100", q: "Which objective can be evaluated as met or not met?", opts: ["The menus must be clear and friendly", "The program should run quickly enough", "A search returns within 2 s for 10 000 records", "Staff should find the system easy to use"], ans: 2, why: "Only this one sets a measure and the conditions to test it under." },
    { qk: "101", q: "A required feature was never built. In the evaluation it should be", opts: ["left out, as nothing was made to judge", "marked partly met, as other parts work", "marked met if the user did not complain", "marked not met, with the reason and a fix"], ans: 3, why: "An honest verdict with the reason and a specific next step is what earns credit." }
  ],
  exam: [
    { src: "AQA 2018 P2 Q11", q: "Describe what is done during the evaluation stage of a software project and explain why the evaluation should be made against criteria set during analysis.", marks: 3,
      ms: ["The completed system is judged against the requirements / acceptance criteria to see how well it meets them — correctness, usability, performance (1)", "User feedback is gathered and improvements / further development recommended (1)", "Using criteria agreed earlier keeps the judgement objective — success is measured against what the client asked for, not what happened to be built (1)"] }
  ]
});

/* The NEA entries that used to follow were removed: the NEA is not examined on
   paper, and its project guide lives in cs-nea.js. */

})(KOS.content.extend);
