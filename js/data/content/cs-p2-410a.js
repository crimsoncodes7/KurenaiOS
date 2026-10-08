/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.10.1–
   4.10.3 (conceptual data models and entity-relationship modelling,
   relational databases and keys, normalisation to third normal form) at
   full A-level depth. Each topic REPLACES the short entry the older files
   carried; every way AQA has examined it (7517/2 June 2017–2025) is
   explained, worked and answered in the mark scheme's own format, and every
   ER diagram is drawn the way the mark scheme draws it (crow's foot at the
   many end). Past-paper banks stay in bank-cs-410-413.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---------- drawing helpers ---------- */
function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function exitPt(B, p, q) {
  var dx = q[0] - p[0], dy = q[1] - p[1], t = Infinity;
  if (dx > 0) t = Math.min(t, (B.x + B.w - p[0]) / dx);
  if (dx < 0) t = Math.min(t, (B.x - p[0]) / dx);
  if (dy > 0) t = Math.min(t, (B.y + B.h - p[1]) / dy);
  if (dy < 0) t = Math.min(t, (B.y - p[1]) / dy);
  return [p[0] + t * dx, p[1] + t * dy];
}
/* a crow's foot on the box edge point p, the line running towards q */
function foot(p, q, col) {
  var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
  var T = [p[0] + 15 * ux, p[1] + 15 * uy], nx = -uy * 9, ny = ux * 9;
  return [{ line: [T, [p[0] + nx, p[1] + ny]], c: col, w: 1.7 }, { line: [T, [p[0] - nx, p[1] - ny]], c: col, w: 1.7 }];
}
/* An entity-relationship diagram. ents: [{id, x, y, w?, label?, col?, ghost?}];
   rels: [a, b, endA, endB, {label, c, dash, ax, ay, bx, by, lx, ly}] where an
   end is "1" or "M" (crow's foot). Returns the figure SPEC (wrap in {fig:…}
   for a block; a worked step takes it as `fig` directly). */
function er(ents, rels, cap, o) {
  o = o || {};
  var it = [], E = {};
  ents.forEach(function (e) {
    var w = e.w || 130, h = e.h || 36, col = e.col || "accent";
    E[e.id] = { x: e.x, y: e.y, w: w, h: h };
    it.push({ poly: [[e.x, e.y], [e.x + w, e.y], [e.x + w, e.y + h], [e.x, e.y + h]], fill: col, alpha: e.ghost ? 0.04 : 0.14, c: col, w: 1.6, dash: e.ghost ? "4 3" : undefined });
    it.push(txt(e.x + w / 2, e.y + h / 2, e.label || e.id, { b: true, size: 12, c: "text" }));
  });
  rels.forEach(function (r) {
    var A = E[r[0]], B = E[r[1]], ro = r[4] || {}, col = ro.c || "text2";
    var a = [A.x + A.w / 2 + (ro.ax || 0), A.y + A.h / 2 + (ro.ay || 0)];
    var b = [B.x + B.w / 2 + (ro.bx || 0), B.y + B.h / 2 + (ro.by || 0)];
    var pa = exitPt(A, a, b), pb = exitPt(B, b, a);
    it.push({ line: [pa, pb], c: col, w: 1.7, dash: ro.dash });
    if (r[2] === "M") it = it.concat(foot(pa, pb, col));
    if (r[3] === "M") it = it.concat(foot(pb, pa, col));
    if (ro.label) it.push(txt((pa[0] + pb[0]) / 2 + (ro.lx || 0), (pa[1] + pb[1]) / 2 + (ro.ly == null ? -10 : ro.ly), ro.label, { size: 10.5, c: ro.lc || "muted" }));
  });
  (o.extra || []).forEach(function (x) { it.push(x); });
  return { w: o.w || 600, h: o.h || 200, items: it, cap: cap };
}
/* a small table drawn as a grid; keys: {colIndex: "PK"|"FK"|"PK FK"} */
function grid(x, y, name, cols, rows, o) {
  o = o || {};
  var cw = o.cw || cols.map(function () { return 86; }), rh = 21, it = [], W = 0, i;
  cw.forEach(function (w) { W += w; });
  var H = rh * (rows.length + 1);
  it.push(txt(x, y - 22, name, { b: true, size: 12, c: o.col || "accent", pos: "e", off: 0 }));
  it.push({ poly: [[x, y], [x + W, y], [x + W, y + rh], [x, y + rh]], fill: o.col || "accent", alpha: 0.16, c: o.col || "accent", w: 1.2 });
  it.push({ poly: [[x, y], [x + W, y], [x + W, y + H], [x, y + H]], c: o.col || "accent", w: 1.4 });
  for (i = 1; i <= rows.length; i++) it.push({ line: [[x, y + rh * i], [x + W, y + rh * i]], c: "line", w: 1 });
  var cx = x;
  cols.forEach(function (c, j) {
    if (j) it.push({ line: [[cx, y], [cx, y + H]], c: "line", w: 1 });
    it.push(txt(cx + cw[j] / 2, y + rh / 2, c, { b: true, size: 10.5, c: "text" }));
    var k = (o.keys || {})[j];
    if (k) it.push(txt(cx + cw[j] / 2, y - 8, k, { b: true, size: 9.5, c: k.indexOf("PK") >= 0 ? "accent" : "accent2" }));
    rows.forEach(function (r, ri) { it.push(txt(cx + cw[j] / 2, y + rh * (ri + 1) + rh / 2, String(r[j]), { size: 10.5, c: (o.hl && o.hl[ri] && o.hl[ri].indexOf(j) >= 0) ? "danger" : "text2" })); });
    cx += cw[j];
  });
  return { items: it, w: W, h: H };
}
/* an underlined identifier, in KaTeX */
function U(n) { return "$\\underline{\\textsf{" + n + "}}$"; }
/* Relation(keys underlined, other attributes) as one line of text */
function R(name, keys, rest) { return name + "(" + keys.map(U).concat(rest || []).join(", ") + ")"; }

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **DPT** dependent penalty (lose it once, not every time).",
  "Database answers: **A.** table / entity for relation, field for attribute, primary key for entity identifier, spaces in names, your own names for NEW relations. **R.** a different name for an attribute the question already named."
] } };

/* =====================================================================
   4.10.1  Conceptual data models and entity relationship modelling
   ===================================================================== */
C["compsci:4.10.1"] = {
  notes: [
    { h: "Conceptual data models and entity relationship modelling — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.10.1)", body: ["Produce a **data model** from given data requirements for a simple scenario involving **multiple entities**.", "Produce **entity relationship diagrams** and **entity descriptions** in the form Entity1(Attribute1, Attribute2, …), underlining the attribute(s) that form the **entity identifier**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Draw the degree of the relationships between given entities", "Draw / Show", "1–2", "A-level 2017 Q10.3, 2018 Q07.1, 2022 Q07.2, 2025 Q06.2"],
      ["Complete an ER diagram by adding the missing entities", "Complete", "3", "A-level 2019 Q06.1"],
      ["Change the model for a new requirement", "Explain", "3", "A-level 2017 Q10.7"],
      ["Write the relations for a scenario (entity descriptions)", "Develop", "4–5", "worked in 4.10.3 (2019 Q06.2, 2023 Q05.1)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Entities, attributes and relationships**: the vocabulary and the entity-description format.", "**Degree and crow's-foot notation**: drawing 1:1, 1:M and M:M.", "**Resolving many-to-many**: the linking entity.", "**From relations to a diagram**: the foreign key tells you where the foot goes.", "**Building a model from a scenario**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Entities, attributes and relationships" },
    { kv: [
      ["Data model", "an abstract description of the data an organisation needs to store and how the items relate to each other"],
      ["Conceptual data model", "a model of the **things** (entities) and the **relationships** between them, independent of how they will be stored"],
      ["Entity", "a category of object, person, event or thing of interest to the organisation about which data is recorded (Customer, Pet, Appointment)"],
      ["Attribute", "a property or characteristic of an entity (a Pet's name, type and date of birth)"],
      ["Entity identifier", "an attribute, or set of attributes, whose value is **unique** for every instance of the entity, so it identifies exactly one instance (becomes the **primary key**)"],
      ["Relationship", "an association between two entities (a Customer **owns** a Pet)"],
      ["Degree of a relationship", "how many instances of one entity can be linked to one instance of the other: **one-to-one**, **one-to-many** or **many-to-many**"]
    ] },
    { callout: { t: "info", h: "Key idea", body: "An **entity description** lists the entity's name then its attributes in brackets, with the identifier **underlined** (composite identifiers: every part underlined):" } },
    { ul: [R("Pet", ["PetID"], ["PetName", "Type", "DateOfBirth"]), R("Surgery", ["SurgeryName"], ["Town", "TelephoneNumber"]), R("PetOwner", ["CustomerID", "PetID"]) + " — a composite identifier"] },
    { callout: { t: "miscon", h: "An entity is a TYPE, not one thing", body: "\"Customer\" is an entity; \"Sophie Latham\" is an **instance** (one row). Name entities in the singular — Customer, not Customers." } },

    { page: "Degree and crow's-foot notation" },
    { fig: er([
      { id: "Head", x: 20, y: 20, label: "Headteacher" }, { id: "School", x: 230, y: 20 },
      { id: "Customer", x: 20, y: 90 }, { id: "Order", x: 230, y: 90 },
      { id: "Student", x: 20, y: 160 }, { id: "Course", x: 230, y: 160 }
    ], [
      ["Head", "School", "1", "1"], ["Customer", "Order", "1", "M"], ["Student", "Course", "M", "M"]
    ], "Crow's-foot notation: a plain end means **one**, a crow's foot means **many**. Read each line both ways.", { w: 560, h: 210, extra: [
      txt(400, 38, "one-to-one (1:1)", { pos: "e", off: 0, c: "text2" }), txt(400, 108, "one-to-many (1:M)", { pos: "e", off: 0, c: "text2" }), txt(400, 178, "many-to-many (M:M)", { pos: "e", off: 0, c: "text2" })
    ] }) },
    { table: { head: ["Ask both ways…", "Answers", "Degree", "Draw"], rows: [
      ["How many schools can one head lead? How many heads does one school have?", "one · one", "1:1", "plain line"],
      ["How many orders can one customer place? How many customers place one order?", "many · one", "1:M", "foot at **Order**"],
      ["How many courses can one student take? How many students take one course?", "many · many", "M:M", "foot at **both** ends"]
    ] } },
    { steps: [
      "Fix one instance of entity A. Ask: how many B can it be linked to — **one** or **many**?",
      "Fix one instance of B. Ask the same question back.",
      "Put a crow's foot at **each end whose answer was \"many\"** — the foot sits on the entity there are many **of**.",
      "Check against the relations: the entity holding the **foreign key** is the many end of a 1:M."
    ] },
    { callout: { t: "warn", h: "Where the foot goes", body: "\"One customer places many orders\" → the foot is at **Order**, the end there are many of. Students often put it at Customer because \"customer\" came first in the sentence." } },

    { page: "Resolving many-to-many" },
    { fig: er([
      { id: "Student", x: 20, y: 25 }, { id: "Course", x: 420, y: 25 },
      { id: "Student2", x: 20, y: 120, label: "Student" }, { id: "Enrolment", x: 220, y: 120, col: "accent2" }, { id: "Course2", x: 420, y: 120, label: "Course" }
    ], [
      ["Student", "Course", "M", "M", { label: "conceptual: M:M", lc: "danger" }],
      ["Student2", "Enrolment", "1", "M"], ["Course2", "Enrolment", "1", "M"]
    ], "A many-to-many relationship cannot be stored directly in relational tables, so it is replaced by a **linking (junction) entity** with two one-to-many relationships.", { w: 570, h: 175, extra: [txt(285, 170, "Enrolment(StudentID, CourseID, DateEnrolled) — identifier = both foreign keys", { size: 10.5, c: "accent2" })] }) },
    { kv: [
      ["Why it is needed", "a row holds ONE value per attribute; storing \"all the courses\" in a Student row would be a **repeating group** (not 1NF), and storing every student in a Course row would be the same problem the other way"],
      ["Linking entity", "a new entity whose instances are the **pairings**: one row per student-on-a-course"],
      ["Its identifier", "usually the **composite** of the two foreign keys (StudentID, CourseID); add a date/time to the key when the same pair can occur more than once"],
      ["Its attributes", "facts about the **pairing** itself — DateEnrolled, Grade, QuantityUsed — which belong to neither entity alone"]
    ] },
    { callout: { t: "info", h: "Key idea", body: "Past-paper linking entities: **PartUsedForJob**(JobID, PartID, QuantityUsed), **PetOwner**(CustomerID, PetID), **EventAtFixture**(FixtureID, EventTypeID), **FacilityForSport**(Sport, FacilityID), **SaleLine**(SaleID, ProductID, QuantitySold)." } },
    { callout: { t: "miscon", h: "AQA accepts the M:M — sometimes", body: "In 2018 the mark scheme **accepted** a M:M line between EventType and Fixture \"as this is modelled by a linking relation\"; in 2019 a M:M between Pet and Customer earned the mark only **if PetOwner was not drawn**. When the linking entity is on the diagram, draw the two 1:M relationships through it." } },

    { page: "From relations to a diagram" },
    { callout: { t: "info", h: "Key idea", body: "Most AQA ER questions give the **relations** and ask for the relationships. The rule:" } },
    { callout: { t: "def", h: "The foot goes where the foreign key is", body: "If relation B contains an attribute that is the identifier of relation A, then A–B is **one-to-many** with the crow's foot at **B**. One A row's key value can appear in many B rows; each B row holds exactly one A key." } },
    { steps: [
      "List each relation's identifier.",
      "Scan every OTHER relation for those attribute names (sometimes renamed: Match.AnimalFemaleID refers to Animal.AnimalID).",
      "Each hit is a 1:M line, foot at the relation holding the copy.",
      "A **composite** foreign key (EventEntry holds both FixtureID and EventTypeID) can point at the relation whose composite identifier it matches — EventAtFixture.",
      "Draw **only** relationships that exist: an extra wrong line costs marks (\"MAX 1 if more than three drawn and any are incorrect\")."
    ] },
    { fig: er([{ id: "Zoo", x: 20, y: 30 }, { id: "AnimalLocation", x: 220, y: 30, w: 150 }, { id: "Animal", x: 440, y: 30 }],
      [["Zoo", "AnimalLocation", "1", "M"], ["Animal", "AnimalLocation", "1", "M"]],
      "AnimalLocation(AnimalID, ZooName, DateArrived, DateLeft) holds BOTH foreign keys, so both feet are on it — it is the linking entity of an Animal–Zoo many-to-many.", { w: 600, h: 110, extra: [txt(140, 90, "ZooName copied in", { size: 10.5 }), txt(470, 90, "AnimalID copied in", { size: 10.5 })] }) },

    { page: "Building a model from a scenario" },
    { steps: [
      "**Nouns** the organisation stores facts about → candidate entities (Customer, Pet, Surgery, Vet, Appointment).",
      "**Facts** about each noun → attributes. Give each entity an identifier (an ID number if nothing natural is unique).",
      "**Verbs / rules** linking nouns → relationships. Decide each degree by asking both ways.",
      "Replace every M:M with a linking entity.",
      "Put each 1:M's foreign key in the **many** entity.",
      "Write the entity descriptions; check every attribute appears in exactly one place (apart from foreign keys)."
    ] },
    { worked: { tag: "variation", title: "A library from scratch", q: "A library records members (member number, name, email), books (ISBN, title, author) and copies (each physical copy has a copy number; a book can have many copies). A member borrows copies; each loan records the date out and the date due. Produce entity descriptions and the ER relationships.",
      steps: [
        { h: "Entities", m: "Member, Book, Copy, Loan." },
        { h: "Descriptions", m: R("Member", ["MemberID"], ["Name", "Email"]) + "\n" + R("Book", ["ISBN"], ["Title", "Author"]) + "\n" + R("Copy", ["CopyID"], ["ISBN"]) + "\n" + R("Loan", ["CopyID", "DateOut"], ["MemberID", "DateDue"]), n: "A copy can be lent many times, so CopyID alone cannot identify a loan — add DateOut." },
        { h: "Relationships", m: "Book 1:M Copy · Copy 1:M Loan · Member 1:M Loan (Member–Copy is M:M, resolved by Loan).", fig: er([{ id: "Book", x: 20, y: 20 }, { id: "Copy", x: 220, y: 20 }, { id: "Loan", x: 220, y: 100 }, { id: "Member", x: 420, y: 100 }], [["Book", "Copy", "1", "M"], ["Copy", "Loan", "1", "M"], ["Member", "Loan", "1", "M"]], null, { w: 570, h: 150 }) }
      ], result: "Four entities; Loan links Member and Copy" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Garage: three relationships", src: "A-level June 2017 · P2 Q10.3 · 2 marks",
      q: "A garage database uses Job(JobID, CarRegNo, JobDate, InGarage, JobDuration), Car(CarRegNo, Make, Model, OwnerName, OwnerEmail, OwnerTelNo), Part(PartID, Description, Price, QuantityInStock) and PartUsedForJob(JobID, PartID, QuantityUsed). On an ER diagram of the four entities, show the degree of any three relationships that exist between them.",
      steps: [
        { m: "Car one-to-many Job (Job holds CarRegNo);" },
        { m: "Job one-to-many PartUsedForJob (PartUsedForJob holds JobID);" },
        { m: "Part one-to-many PartUsedForJob (PartUsedForJob holds PartID);", mk: "1 mark any one · 2 marks all three",
          fig: er([{ id: "Job", x: 20, y: 20 }, { id: "Car", x: 330, y: 20 }, { id: "Part", x: 20, y: 110 }, { id: "PartUsedForJob", x: 330, y: 110, w: 150 }],
            [["Car", "Job", "1", "M"], ["Job", "PartUsedForJob", "1", "M"], ["Part", "PartUsedForJob", "1", "M"]], null, { w: 500, h: 160 }) },
        { m: "Do not draw a fourth line (e.g. Car–Part): MAX 1 if more than three are drawn and any is incorrect." }
      ], result: "Car 1:M Job; Job 1:M PartUsedForJob; Part 1:M PartUsedForJob" } },
    { worked: { tag: "exam", title: "Athletics: three of the relationships", src: "A-level June 2018 · P2 Q07.1 · 2 marks",
      q: "Athlete(AthleteID, Surname, Forename, DateOfBirth, Gender, TeamName), EventType(EventTypeID, Gender, Distance, AgeGroup), Fixture(FixtureID, FixtureDate, LocationName), EventAtFixture(FixtureID, EventTypeID), EventEntry(FixtureID, EventTypeID, AthleteID). Draw lines on an ER diagram of EventType, Fixture, EventEntry and EventAtFixture to show the degree of any three relationships that exist between the four entities.",
      steps: [
        { m: "EventType one-to-many EventAtFixture;" },
        { m: "Fixture one-to-many EventAtFixture;" },
        { m: "EventAtFixture one-to-many EventEntry (EventEntry's FixtureID + EventTypeID match EventAtFixture's composite identifier);", mk: "1 mark any one · 2 marks three",
          fig: er([{ id: "EventType", x: 20, y: 20 }, { id: "Fixture", x: 330, y: 20 }, { id: "EventEntry", x: 20, y: 120 }, { id: "EventAtFixture", x: 330, y: 120, w: 140 }],
            [["EventType", "EventAtFixture", "1", "M"], ["Fixture", "EventAtFixture", "1", "M"], ["EventAtFixture", "EventEntry", "1", "M"],
             ["EventType", "EventEntry", "1", "M", { dash: "4 3", c: "muted" }], ["Fixture", "EventEntry", "1", "M", { dash: "4 3", c: "muted" }]], "Solid: the three intended. Dashed: also correct (EventEntry holds both keys), so any three of the five score.", { w: 500, h: 170 }) },
        { m: "Also accepted: a many-to-many line between EventType and Fixture, \"as this is modelled by a linking relation\"." }
      ], result: "Any three correct relationships" } },
    { worked: { tag: "exam", title: "Vets: complete the diagram", src: "A-level June 2019 · P2 Q06.1 · 3 marks",
      q: "A vet practice: each customer and each pet has a unique ID; a pet is owned by one or more customers and a customer may own any number of pets; pets attend many appointments, each for one pet on a date and time at one surgery; each vet works at one surgery, which has several vets. Pet, Surgery and Vet (Surgery 1:M Vet) are drawn. Draw the remaining three entities and the relationships with their degree for a fully normalised database.",
      steps: [
        { m: "Appointment entity added: Pet one-to-many Appointment and Surgery one-to-many Appointment;", mk: "1 mark" },
        { m: "Customer entity added, joined one-to-many to PetOwner;", mk: "1 mark", n: "If no PetOwner, a M:M between Pet and Customer earns this mark (though not normalised)." },
        { m: "PetOwner entity added, Pet one-to-many PetOwner;", mk: "1 mark",
          fig: er([{ id: "PetOwner", x: 20, y: 20 }, { id: "Customer", x: 220, y: 20 }, { id: "Vet", x: 420, y: 20, ghost: true }, { id: "Pet", x: 20, y: 100, ghost: true }, { id: "Surgery", x: 420, y: 100, ghost: true }, { id: "Appointment", x: 220, y: 170 }],
            [["Customer", "PetOwner", "1", "M"], ["Pet", "PetOwner", "1", "M"], ["Pet", "Appointment", "1", "M"], ["Surgery", "Appointment", "1", "M"], ["Surgery", "Vet", "1", "M", { c: "muted" }]], "Dashed boxes were given; the three solid boxes and their lines earn the marks.", { w: 570, h: 220 }) }
      ], result: "Customer, PetOwner, Appointment with 1:M lines" } },
    { worked: { tag: "exam", title: "Zoos: two relationships", src: "A-level June 2022 · P2 Q07.2 · 2 marks",
      q: "Zoo(ZooName, Town, Country), AnimalLocation(AnimalID, ZooName, DateArrived, DateLeft), Animal(AnimalID, IndividualName, Species, DateOfBirth, Sex). Draw lines on an ER diagram of the three entities to indicate the degree of the two relationships between them.",
      steps: [
        { m: "Animal one-to-many AnimalLocation;", mk: "1 mark" },
        { m: "Zoo one-to-many AnimalLocation;", mk: "1 mark" },
        { m: "If neither: 1 mark for a many-to-many between Animal and Zoo. MAX 1 if any incorrect relationship is drawn." }
      ], result: "Both feet on AnimalLocation" } },
    { worked: { tag: "exam", title: "Merits: the relationships", src: "A-level June 2025 · P2 Q06.2 · 1 mark",
      q: "Student(StudentID, FirstName, LastName, YearGroup, House), Teacher(TeacherID, FirstName, LastName), Merit(MeritID, StudentID, TeacherID, DateAwarded, Reason). Draw the relationships that exist between the three entities, clearly showing the degree of each.",
      steps: [
        { m: "Student one-to-many Merit AND Teacher one-to-many Merit;", mk: "1 mark",
          fig: er([{ id: "Student", x: 20, y: 30 }, { id: "Merit", x: 220, y: 30 }, { id: "Teacher", x: 420, y: 30 }], [["Student", "Merit", "1", "M"], ["Teacher", "Merit", "1", "M"]], null, { w: 570, h: 95 }) },
        { m: "0 marks if any incorrect relationship is drawn (a Student–Teacher many-to-many is ignored)." }
      ], result: "Both feet at Merit" } },
    { worked: { tag: "exam", title: "Which parts fit which cars", src: "A-level June 2017 · P2 Q10.7 · 3 marks",
      q: "In the garage database, a type of car is identified by its Make and Model together; a part may fit one model, every model of one make, or many makes and models. Explain how the database design could be modified to represent which makes and models of car a part can be fitted to.",
      steps: [
        { m: "Create a new relation to record which make/model(s) each part can be fitted to;", mk: "1 mark", n: "NE. \"a relation to link Part and Car\" — Car is one vehicle, not a type." },
        { m: "Store the attributes PartID, Make and Model in it;", mk: "1 mark" },
        { m: "Make PartID, Make and Model together the (composite) entity identifier: " + R("PartToFitMakeModel", ["PartID", "Make", "Model"]) + ";", mk: "1 mark" },
        { h: "Alternative", m: R("MakeModel", ["MakeModelID"], ["Make", "Model"]) + " and " + R("PartFitsModel", ["PartID", "MakeModelID"]) + " — also 3 marks. A new surrogate key is accepted only if you add a constraint stopping the same part–model pair being stored twice." }
      ], result: "A linking relation keyed on PartID + Make + Model" } },
    { worked: { tag: "variation", title: "Sentence to degree", q: "Give the degree and where the crow's foot goes: (a) a hospital ward has many beds; each bed is in one ward (b) a passport belongs to one person; a person holds one passport (c) a band plays at many festivals; a festival has many bands (d) a customer can make many bookings; a booking is for one customer.",
      steps: [{ m: "(a) Ward 1:M Bed — foot at Bed", mk: "1" }, { m: "(b) 1:1 — no foot; put the foreign key in either (usually Passport)", mk: "1" }, { m: "(c) M:M — resolve with Performance(BandID, FestivalID)", mk: "1" }, { m: "(d) Customer 1:M Booking — foot at Booking", mk: "1" }], result: "1:M, 1:1, M:M, 1:M" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Draw / Show the degree", "A line for each relationship that EXISTS; a crow's foot at every many end; nothing extra."],
      ["Complete the ER diagram", "Each missing entity named sensibly AND joined with the right degree — one mark per entity."],
      ["Explain how the design could be modified", "Say WHAT new relation, WHICH attributes, and WHICH form the identifier."],
      ["Develop / list the relations", "Format Entity(attributes) with the identifier underlined — see 4.10.3."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Feet follow foreign keys\"", body: "The crow's foot lands on the table that holds the **foreign** key. Two foreign keys in one table = two feet on it = it is a linking table." } },
    { callout: { t: "warn", h: "Specific errors", body: ["The crow's foot at the \"one\" end.", "Drawing an extra relationship that is wrong — MAX 1 or even 0.", "A many-to-many line when the linking entity is on the diagram (2019 only credits it if PetOwner is missing).", "Joining two entities that share no key.", "Plural entity names, or giving an instance instead of an entity."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.10.2 keys turn relationships into foreign keys; 4.10.3 normalisation removes the repeating groups an unresolved M:M would cause; 4.10.4 every join condition follows a relationship line; 4.11.1 a graph schema's nodes and edges play the role of entities and relationships; 4.13.1.2 the data model is part of design; your NEA documents one." } }
  ],
  flashcards: [
    ["Entity?", "A category of object, person, event or thing about which data is recorded."],
    ["Attribute?", "A property or characteristic of an entity."],
    ["Entity description format?", "Entity(Attribute1, Attribute2, …) with the identifier underlined.", 3],
    ["What does a crow's foot mean?", "The many end of a relationship.", 4],
    ["Three degrees of relationship?", "One-to-one, one-to-many, many-to-many.", 5],
    ["How is a many-to-many implemented?", "A linking entity with two one-to-many relationships; its identifier is usually the two foreign keys together.", 6],
    ["Which end of a 1:M holds the foreign key?", "The many end (where the crow's foot is).", 7],
    ["Linking relation in the vets question?", "PetOwner(CustomerID, PetID).", 8],
    ["Penalty for drawing extra wrong relationships?", "MAX 1 (or 0 in 2025's one-mark question).", 9]
  ],
  quiz: [
    { q: "One customer places many orders. The crow's foot goes at", opts: ["Order", "Customer", "both ends", "neither end"], ans: 0, why: "There are many orders." },
    { q: "Enrolment(StudentID, CourseID, DateEnrolled) is", opts: ["a linking entity resolving a M:M", "a 1:1 relationship", "an attribute", "a repeating group"], ans: 0, why: "Two foreign keys forming the identifier." },
    { q: "AnimalLocation holds AnimalID and ZooName. The relationships are", opts: ["Animal 1:M AnimalLocation and Zoo 1:M AnimalLocation", "Animal M:1 AnimalLocation", "Zoo 1:1 Animal", "AnimalLocation 1:M Zoo"], ans: 0, why: "Feet follow foreign keys." },
    { q: "Each vet works at one surgery; each surgery has several vets:", opts: ["Surgery 1:M Vet", "Vet 1:M Surgery", "M:M", "1:1"], ans: 0, why: "Vet holds SurgeryName." },
    { q: "In an entity description the identifier is", opts: ["underlined", "in capitals", "listed last", "in italics"], ans: 0, why: "Spec convention." },
    { q: "A many-to-many relationship cannot be stored directly because", opts: ["it would need a repeating group", "SQL forbids two tables", "keys must be numeric", "it needs a 1:1"], ans: 0, why: "One value per attribute per row." }
  ]
};

/* =====================================================================
   4.10.2  Relational databases
   ===================================================================== */
C["compsci:4.10.2"] = {
  notes: [
    { h: "Relational databases — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.10.2)", body: ["Explain the concept of a **relational database**.", "Define **attribute**, **primary key**, **composite primary key** and **foreign key**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Which other attributes could be the key?", "State / Shade", "1", "A-level 2017 Q10.1, 2021 Q05.1"],
      ["What assumption does this key / design make?", "State / Shade", "1", "A-level 2020 Q04.4, 2024 Q08.1"],
      ["Limitation of a composite key", "Describe", "1", "A-level 2025 Q06.1"],
      ["Deleting rows that others refer to (referential integrity)", "Describe", "2", "A-level 2023 Q05.3"],
      ["Define the four terms; explain a relational database", "Define / Explain", "1–3", "spec bullets — expected"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What a relational database is**.", "**The four keys and terms**.", "**Choosing a key — and the assumption it makes**.", "**Referential integrity**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What a relational database is" },
    { callout: { t: "def", h: "Relational database", body: "A database that stores data in **several tables (relations)**, each about **one entity**. Each row (record / tuple) is one instance; each column is one attribute. Tables are **linked** by storing the primary key of one table as a **foreign key** in another, so related data can be combined by queries without being stored twice." } },
    { fig: (function () {
      var a = grid(20, 40, "Car", ["CarRegNo", "Make", "Model"], [["AB12 CDE", "Ford", "Fiesta"], ["XY65 ZZZ", "Kia", "Ceed"]], { cw: [90, 70, 70], keys: { 0: "PK" } });
      var b = grid(320, 40, "Job", ["CarRegNo", "JobID", "JobDate"], [["AB12 CDE", "205", "03/10"], ["XY65 ZZZ", "206", "04/10"], ["AB12 CDE", "207", "09/10"]], { cw: [90, 60, 80], keys: { 0: "FK", 1: "PK" }, col: "accent2" });
      var it = a.items.concat(b.items);
      it.push({ line: [[252, 71.5], [318, 71.5]], c: "good", w: 1.4, dash: "4 3", arrow: true });
      it.push({ line: [[252, 71.5], [318, 113.5]], c: "good", w: 1.4, dash: "4 3", arrow: true });
      it.push({ line: [[252, 92.5], [318, 92.5]], c: "muted", w: 1.2, dash: "4 3", arrow: true });
      it.push(txt(275, 142, "the same key value appears in many Job rows → Car 1:M Job", { size: 10.5, c: "good" }));
      return { w: 560, h: 160, items: it, cap: "Car's primary key is copied into Job as a foreign key. A query joins the two on CarRegNo, so the make and model are stored once however many jobs a car has." };
    })() },
    { kv: [
      ["Relation", "a table: a named set of tuples that all have the same attributes"],
      ["Tuple / record", "one row — one instance of the entity"],
      ["Attribute / field", "one column — one property of the entity; each cell holds a single (atomic) value"],
      ["Why relational", "each fact stored once → less redundancy and no inconsistent copies; data combined on demand by joining tables in queries (4.10.4)"]
    ] },
    { callout: { t: "miscon", h: "\"Relational\" is not about the relationships", body: "The name comes from the mathematical **relation** (a set of tuples) — i.e. the table. The links between tables are relationships; the tables themselves are relations." } },

    { page: "The four keys and terms" },
    { kv: [
      ["Attribute", "a property / characteristic of an entity — a column (field) in a relation"],
      ["Primary key", "an attribute that **uniquely identifies** each record (tuple) in a relation — no two rows may share its value, and it is never empty"],
      ["Composite primary key", "a primary key made of **two or more attributes** whose combination is unique, when no single attribute is (FacilityID, BookingDate, StartTime)"],
      ["Foreign key", "an attribute in one relation that is the **primary key of another** relation, used to link (create a relationship between) the two tables"]
    ] },
    { table: { head: [" ", "Primary key", "Foreign key"], rows: [
      ["Unique in its own table?", "**Yes** — always", "**No** — the same value repeats (many jobs for one car)"],
      ["Can be empty (null)?", "No", "Possibly, if the link is optional"],
      ["Purpose", "identify a row", "link to a row in another table"],
      ["How many per table", "exactly one (possibly composite)", "zero or more"],
      ["Can it also be part of the primary key?", "—", "Yes: in a linking table both foreign keys form the composite key (PetOwner)"]
    ] } },
    { kv: [
      ["Candidate key", "(beyond the spec) any attribute set that could serve as the primary key — e.g. CarRegNo + JobDate in the garage's Job relation"],
      ["Surrogate key", "an invented ID number (JobID, MeritID) used when no natural key is reliable or short"],
      ["Secondary key / index", "a non-key attribute indexed so searches on it are fast (4.10.5 performance)"]
    ] },
    { callout: { t: "warn", h: "Define precisely", body: "\"A key that identifies a record\" is not enough for primary key — it must be **unique**. \"A key from another table\" is not enough for foreign key — it is that table's **primary** key, used to **link** the tables." } },

    { page: "Choosing a key — and the assumption it makes" },
    { callout: { t: "info", h: "Key idea", body: "A set of attributes can be the key only if the scenario guarantees **no two rows could ever share those values**. So every key states an **assumption** about the real world." } },
    { steps: [
      "Read the rules in the scenario (\"each facility can only be booked by one customer at any one time\").",
      "Ask: could two different rows ever have the same values in these attributes?",
      "If yes, the key is invalid — or it **forbids** something real (the limitation).",
      "If no, the key is valid, and its **assumption** is \"this combination happens at most once\"."
    ] },
    { table: { head: ["Key", "Assumption it builds in", "Limitation if the assumption is false"], rows: [
      ["Viewing(**BuyerID, PropertyID, ViewingDate**)", "a buyer views the same property at most once a day", "a second viewing that day cannot be stored"],
      ["Merit(**StudentID, TeacherID, DateAwarded**)", "a teacher gives a student at most one merit a day", "a second merit from that teacher that day cannot be recorded"],
      ["Product(…, **SupplierID**) as one attribute", "each product has one supplier", "a product from two suppliers needs a linking table"],
      ["Job(**CarRegNo, JobDate**)", "one job per car per day", "a car booked twice in a day breaks it"]
    ] } },
    { worked: { tag: "variation", title: "Keys in a booking table", q: "Booking(FacilityID, BookingDate, StartTime, EndTime, CustomerID). A customer can book several facilities for the same time; a facility can only be booked by one customer at a time. Bookings do not overlap. Is (CustomerID, BookingDate, StartTime) a valid key?",
      steps: [
        { m: "Could two rows share CustomerID, BookingDate and StartTime? **Yes** — the secretary books both sports halls at 14:00.", mk: "1" },
        { m: "So it is **not** a valid key. (FacilityID, BookingDate, StartTime) is — or (FacilityID, BookingDate, EndTime), since one facility's bookings cannot share an end time either.", mk: "1" }
      ], result: "Not valid" } },

    { page: "Referential integrity" },
    { callout: { t: "def", h: "Referential integrity", body: "Every **foreign key value must match an existing primary key value** in the table it refers to (or be null). A record must never refer to a record that does not exist." } },
    { table: { head: ["Action", "Could break integrity when…", "DBMS response"], rows: [
      ["INSERT into the many table", "the foreign key value has no matching parent (a Job for a car not in Car)", "reject the insert"],
      ["DELETE from the one table", "child rows still refer to it (Showings with Bookings)", "**restrict**: refuse the delete; or **cascade**: delete the children too"],
      ["UPDATE a primary key", "children hold the old value", "refuse, or cascade the new value"]
    ] } },
    { fig: (function () {
      var a = grid(20, 40, "Showing", ["ShowingID", "ShowDate"], [["88", "29/03/2023"], ["89", "30/03/2023"]], { cw: [80, 90], keys: { 0: "PK" }, hl: { 0: [0, 1] } });
      var b = grid(300, 40, "Booking", ["BookingID", "ShowingID", "CustomerID"], [["501", "88", "12"], ["502", "88", "40"], ["503", "89", "12"]], { cw: [80, 80, 80], keys: { 0: "PK", 1: "FK" }, col: "accent2", hl: { 0: [1], 1: [1] } });
      var it = a.items.concat(b.items);
      it.push(txt(105, 135, "DELETE showing 88…", { size: 10.5, c: "danger" }));
      it.push(txt(420, 145, "…bookings 501 and 502 now point at nothing", { size: 10.5, c: "danger" }));
      return { w: 580, h: 160, items: it, cap: "Deleting a parent row that children still reference: the DBMS refuses (restrict) or must delete the bookings as well (cascade)." };
    })() },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "An alternative identifier for Job", src: "A-level June 2017 · P2 Q10.1 · 1 mark",
      q: "Job(JobID, CarRegNo, JobDate, InGarage, JobDuration). A booking made for a car on a particular date counts as one job. If JobID were not included, which other attribute or attributes could probably be used as the entity identifier instead?",
      steps: [{ m: "CarRegNo and JobDate (together);", mk: "1 mark", n: "R. \"CarRegNo or JobDate\" — neither is unique alone." }], result: "CarRegNo + JobDate" } },
    { worked: { tag: "exam", title: "The viewing assumption", src: "A-level June 2020 · P2 Q04.4 · 1 mark",
      q: "An estate agent's Viewing(BuyerID, PropertyID, ViewingDate, ViewingTime) relation has the composite primary key BuyerID, PropertyID and ViewingDate. In selecting these attributes, what assumption has the designer made about the behaviour of buyers?",
      steps: [{ m: "That a buyer will only view the same property once on a particular day;", mk: "1 mark", n: "R. \"each visit made by only one buyer\"." }], result: "At most one viewing per buyer per property per day" } },
    { worked: { tag: "exam", title: "A valid alternative key", src: "A-level June 2021 · P2 Q05.1 · 1 mark",
      q: "Booking(FacilityID, BookingDate, StartTime, EndTime, CustomerID) has the composite identifier FacilityID, BookingDate, StartTime. A customer may book several facilities at the same time; each facility can only be booked by one customer at any one time. Which would be a valid alternative identifier? A BookingDate, StartTime, EndTime · B FacilityID, BookingDate, EndTime · C FacilityID, StartTime, CustomerID · D FacilityID, BookingDate, EndTime, Sport",
      steps: [
        { m: "A fails: two facilities can be booked for the same times. C fails: no date — the same facility, time and customer recur on other days. D fails: Sport is not in Booking." },
        { m: "B; — one facility on one date cannot have two bookings ending at the same time.", mk: "1 mark" }
      ], result: "B" } },
    { worked: { tag: "exam", title: "Which assumption was made?", src: "A-level June 2024 · P2 Q08.1 · 1 mark",
      q: "Product(ProductID, Description, QuantityInStock, SupplierID), Sale(SaleID, CustomerID, SaleDate), SaleLine(SaleID, ProductID, QuantitySold), Customer(CustomerID, Forename, Surname, EmailAddress), Supplier(SupplierID, SupplierName, SupplierEmail). Which assumption was made? A a customer cannot be added until a sale is made to them · B each product is only supplied by one supplier · C each supplier only supplies one product · D only one sale can be made to a customer on a date · E two different products cannot be bought in the same sale",
      steps: [
        { m: "SupplierID is a single attribute in Product, so each product row names one supplier." },
        { m: "B;", mk: "1 mark", n: "C is false (SupplierID can repeat across products); E is false (SaleLine allows many products per sale)." }
      ], result: "B" } },
    { worked: { tag: "exam", title: "The old Merit key", src: "A-level June 2025 · P2 Q06.1 · 1 mark",
      q: "Merit(MeritID, StudentID, TeacherID, DateAwarded, Reason). Originally there was no MeritID and StudentID, TeacherID and DateAwarded together formed a composite entity identifier. Describe the limitation this would have caused.",
      steps: [{ m: "It would not be possible for the same teacher to award the same student more than one merit on the same day;", mk: "1 mark" }], result: "Max one merit per teacher per student per day" } },
    { worked: { tag: "exam", title: "Deleting the showings", src: "A-level June 2023 · P2 Q05.3 · 2 marks",
      q: "A cinema database has Showing(ShowingID, ScreenNumber, FilmID, ShowTime, ShowDate) and Booking(BookingID, ShowingID, CustomerID). Describe an issue that could arise if a query to delete all of the showings scheduled for 29th March 2023 was executed.",
      steps: [
        { m: "There might already be bookings for showings on this date;", mk: "1 mark (AO2)", n: "Must refer to the date — R. \"bookings for a showing\" alone." },
        { m: "The database would prevent the query from running / the query could leave bookings that reference showings that no longer exist — referential integrity (foreign key rules) violated;", mk: "1 mark (AO1)", n: "Both marks for stating that all bookings for 29th March would also need deleting." }
      ], result: "Orphaned bookings — referential integrity" } },
    { worked: { tag: "variation", title: "Explain a relational database (3 marks)", q: "Explain what is meant by a relational database, using the garage's Car and Job tables.",
      steps: [
        { m: "Data is stored in several tables/relations, each about one entity (Car, Job);", mk: "1" },
        { m: "Each table has a primary key that uniquely identifies each record (CarRegNo, JobID);", mk: "1" },
        { m: "Tables are linked by foreign keys — Job holds CarRegNo, Car's primary key — so related records can be combined in queries without duplicating car details;", mk: "1" }
      ], result: "Tables + primary keys + foreign-key links" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Define (primary / composite / foreign key)", "**Unique** for primary; **two or more attributes** for composite; **primary key of another table, used to link** for foreign."],
      ["State / shade an alternative key", "Test each option: could two rows share it? Reject any with an attribute not in the relation."],
      ["What assumption…", "\"Only one … per … per …\" — read the key as a sentence."],
      ["Describe an issue (delete / insert)", "Name the referencing records AND the integrity consequence."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"PUCK\"", body: "**P**rimary = **U**nique · **C**omposite = **C**ombination · **K**ey from elsewhere = foreign (lin**K**)." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Primary key identifies a record\" without **unique**.", "Saying a foreign key must be unique.", "Choosing a key that includes an attribute from another relation (2021 option D).", "Writing \"or\" between parts of a composite key.", "Stating a limitation without the condition (\"same teacher, same student, same day\")."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.10.1 identifiers and relationships; 4.10.3 normal forms are stated in terms of the primary key; 4.10.4 PRIMARY KEY / FOREIGN KEY in CREATE TABLE and every join condition; 4.10.5 locks work on records; 4.2.6 hashing — a primary key is what a hash index is built on." } }
  ],
  flashcards: [
    ["Relational database?", "Data in several tables (relations), each about one entity, linked by foreign keys."],
    ["Primary key?", "An attribute that uniquely identifies each record in a relation.", 2],
    ["Is a foreign key unique in its own table?", "No — the same value can appear in many rows.", 5],
    ["Cascade delete?", "Deleting a parent row also deletes the child rows that reference it.", 9]
  ],
  quiz: [
    { q: "A foreign key is", opts: ["the primary key of another relation, used to link tables", "a unique row identifier", "any indexed field", "a composite key"], ans: 0, why: "Definition." },
    { q: "Merit keyed on (StudentID, TeacherID, DateAwarded) prevents", opts: ["two merits from one teacher to one student on one day", "two merits on one day", "a student having two teachers", "deleting merits"], ans: 0, why: "Uniqueness of that combination." },
    { q: "Deleting a Showing that has Bookings breaks", opts: ["referential integrity", "1NF", "the primary key", "atomicity of attributes"], ans: 0, why: "Bookings would reference nothing." },
    { q: "A composite primary key has", opts: ["two or more attributes", "exactly one attribute", "no foreign keys", "only numbers"], ans: 0, why: "Definition." },
    { q: "Product holds one SupplierID. The design assumes", opts: ["each product has one supplier", "each supplier supplies one product", "suppliers have no email", "each sale has one product"], ans: 0, why: "2024 Q08.1." },
    { q: "In a linking table PetOwner(CustomerID, PetID) the attributes are", opts: ["both foreign keys and together the primary key", "both primary keys of PetOwner separately", "attributes only", "secondary keys"], ans: 0, why: "Composite of the foreign keys." }
  ]
};

/* =====================================================================
   4.10.3  Database design and normalisation techniques
   ===================================================================== */
C["compsci:4.10.3"] = {
  notes: [
    { h: "Database design and normalisation techniques — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.10.3)", body: ["**Normalise relations to third normal form**.", "Understand **why databases are normalised**.", "Know the properties of a relation in **third normal form**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Why normalise / problems if not normalised", "State / Describe", "2", "A-level 2017 Q10.2, 2018 Q07.3, 2024 Q08.5"],
      ["Why an un-normalised alternative design was rejected", "Explain", "2", "A-level 2021 Q05.2"],
      ["Which property is NOT needed for 3NF", "Shade", "1", "A-level 2022 Q07.1"],
      ["Advantage and disadvantage of adding a redundant attribute", "Describe", "2", "A-level 2022 Q07.5"],
      ["Develop a fully normalised design for a scenario", "Develop", "4–5", "A-level 2019 Q06.2, 2023 Q05.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Why normalise — the anomalies**.", "**Dependencies**: full, partial and transitive.", "**1NF, 2NF and 3NF**.", "**Normalising step by step**: UNF to 3NF on one example.", "**Designing relations from a scenario**.", "**Normalisation versus speed**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Why normalise — the anomalies" },
    { callout: { t: "def", h: "Normalisation", body: "The process of organising the attributes of a database into relations so that **each fact is stored once**: no repeating groups, every non-key attribute depends on the **whole** primary key and on **nothing but** the key. It removes **redundancy** and the **anomalies** redundancy causes." } },
    { fig: (function () {
      var g = grid(20, 40, "Booking (not normalised)", ["FacilityID", "BookingDate", "StartTime", "Forename", "Surname", "Email"],
        [["1", "15/06", "14:15", "Ana", "Shah", "ana@x"], ["3", "15/06", "16:00", "Ana", "Shah", "ana@x"], ["2", "16/06", "09:00", "Ana", "Shaw", "ana@y"]],
        { cw: [70, 85, 70, 70, 70, 70], keys: { 0: "PK", 1: "PK", 2: "PK" }, hl: { 0: [3, 4, 5], 1: [3, 4, 5], 2: [4, 5] } });
      var it = g.items;
      it.push(txt(237, 145, "the same customer stored three times — and one copy disagrees", { size: 10.5, c: "danger" }));
      return { w: 475, h: 160, items: it, cap: "The 2021 rejected design: customer details repeat in every booking (redundancy), so they can disagree (inconsistency)." };
    })() },
    { table: { head: ["Problem", "Meaning", "In the booking table above"], rows: [
      ["Redundancy", "the same data stored more than once — wastes storage", "Ana's details on every booking"],
      ["Inconsistency", "two copies of the 'same' item hold different values", "Shah vs Shaw; two emails"],
      ["Update anomaly", "a change must be made in many rows; missing one leaves inconsistent data", "Ana changes email → edit every booking"],
      ["Insertion anomaly", "cannot store data about one entity without a record of another", "cannot store a new customer until they book"],
      ["Deletion anomaly", "deleting one entity's record loses data about another", "cancel Ana's last booking → her details vanish"],
      ["Non-atomic data", "repeating groups / lists in a cell make selecting and editing hard", "a \"Sports\" cell holding \"football, rugby, hockey\""]
    ] } },
    { callout: { t: "warn", h: "What does NOT score", body: "\"Saves space\", \"easier to query\", \"fewer errors\" alone are **NE.** — say WHICH problem and, ideally, give the example in context. In 2018, only one mark could come from duplication/redundancy (they count as one idea)." } },

    { page: "Dependencies" },
    { kv: [
      ["Functional dependency", "A → B: each value of A determines exactly one value of B (CustomerID → Surname)"],
      ["Full dependency", "a non-key attribute depends on the **whole** primary key (QuantityUsed depends on JobID **and** PartID)"],
      ["Partial dependency", "a non-key attribute depends on **only part** of a composite key (Description depends on PartID alone) — breaks 2NF"],
      ["Transitive dependency", "a non-key attribute depends on **another non-key attribute** (Key → CustomerID → CustomerName) — breaks 3NF"]
    ] },
    { fig: (function () {
      var it = [], xs = [20, 110, 200, 290, 380, 470], names = ["OrderID", "ProductID", "Quantity", "Description", "CustomerID", "CustName"];
      names.forEach(function (n, i) {
        var key = i < 2;
        it.push({ poly: [[xs[i], 60], [xs[i] + 85, 60], [xs[i] + 85, 88], [xs[i], 88]], fill: key ? "accent" : "line", alpha: key ? 0.2 : 0.12, c: key ? "accent" : "muted", w: 1.4 });
        it.push(txt(xs[i] + 42, 74, n, { b: key, size: 10.5, c: "text" }));
      });
      function arc(x1, x2, y, col, lab, ly) {
        it.push({ poly: [[x1, y === "up" ? 60 : 88], [x1, y === "up" ? 34 : 114], [x2, y === "up" ? 34 : 114]], close: false, c: col, w: 1.5 });
        it.push({ line: [[x2, y === "up" ? 34 : 114], [x2, y === "up" ? 58 : 90]], c: col, w: 1.5, arrow: true });
        it.push(txt((x1 + x2) / 2, ly, lab, { size: 10.5, c: col }));
      }
      it.push({ line: [[65, 60], [65, 45]], c: "good", w: 1.5 }, { line: [[152, 60], [152, 45]], c: "good", w: 1.5 }, { line: [[65, 45], [152, 45]], c: "good", w: 1.5 });
      it.push({ line: [[108, 45], [108, 26]], c: "good", w: 1.5 }, { line: [[108, 26], [242, 26]], c: "good", w: 1.5 }, { line: [[242, 26], [242, 58]], c: "good", w: 1.5, arrow: true });
      it.push(txt(175, 16, "full: needs both key parts", { size: 10.5, c: "good" }));
      arc(152, 332, "down", "danger", "partial: ProductID alone", 128);
      it.push({ line: [[65, 88], [65, 150]], c: "accent2", w: 1.5 }, { line: [[65, 150], [422, 150]], c: "accent2", w: 1.5 }, { line: [[422, 150], [422, 90]], c: "accent2", w: 1.5, arrow: true });
      it.push(txt(240, 162, "OrderID → CustomerID", { size: 10.5, c: "accent2" }));
      it.push({ line: [[452, 60], [452, 40]], c: "danger", w: 1.5 }, { line: [[452, 40], [512, 40]], c: "danger", w: 1.5 }, { line: [[512, 40], [512, 58]], c: "danger", w: 1.5, arrow: true });
      it.push(txt(482, 28, "transitive", { size: 10.5, c: "danger" }));
      return { w: 580, h: 175, items: it, cap: "A dependency diagram for OrderItem(OrderID, ProductID, Quantity, Description, CustomerID, CustName). Only Quantity depends on the whole key; Description is a partial dependency; CustName depends on CustomerID, a non-key — transitive." };
    })() },

    { page: "1NF, 2NF and 3NF" },
    { table: { head: ["Normal form", "Properties (each includes the one before)", "Fix if broken"], rows: [
      ["**First (1NF)**", "no repeating groups of attributes; every attribute **atomic** (one value per cell); a primary key exists", "move the repeating group to a new relation with the original key + its own key"],
      ["**Second (2NF)**", "1NF **and** no **partial** dependencies: every non-key attribute depends on the **whole** key", "move the part-dependent attributes out with the part of the key they depend on"],
      ["**Third (3NF)**", "2NF **and** no **transitive** (non-key) dependencies: every non-key attribute depends on **nothing but** the key", "move the dependent attributes out with the non-key attribute they depend on — which stays behind as a foreign key"]
    ] } },
    { callout: { t: "memorise", h: "Third normal form in one line", body: "Every non-key attribute depends on **the key, the whole key, and nothing but the key**. 1NF = \"the key\" (atomic, keyed); 2NF = \"the whole key\"; 3NF = \"nothing but the key\"." } },
    { callout: { t: "miscon", h: "A single-attribute key is automatically 2NF", body: "Partial dependency needs a composite key to be \"part\" of. A 1NF relation whose key is one attribute is already in 2NF — check it straight for 3NF. And 3NF does **not** require single-attribute keys (2022 Q07.1)." } },

    { page: "Normalising step by step" },
    { callout: { t: "info", h: "Key idea", body: "An online shop's order form, as an **un-normalised** relation (the braces mark the repeating group — one set per product on the order):" } },
    { ul: ["UNF: Order(OrderID, OrderDate, CustomerID, CustName, CustTown, {ProductID, Description, UnitPrice, Quantity})"] },
    { steps: [
      { h: "1NF — remove the repeating group", m: "One row per product per order; the key becomes (OrderID, ProductID):\n" + R("OrderItem", ["OrderID", "ProductID"], ["OrderDate", "CustomerID", "CustName", "CustTown", "Description", "UnitPrice", "Quantity"]) },
      { h: "2NF — remove partial dependencies", m: "OrderDate, CustomerID, CustName, CustTown depend on OrderID alone; Description, UnitPrice on ProductID alone; only Quantity needs both:\n" + R("Order", ["OrderID"], ["OrderDate", "CustomerID", "CustName", "CustTown"]) + "\n" + R("Product", ["ProductID"], ["Description", "UnitPrice"]) + "\n" + R("OrderLine", ["OrderID", "ProductID"], ["Quantity"]) },
      { h: "3NF — remove transitive dependencies", m: "In Order, CustName and CustTown depend on CustomerID (non-key). Move them out; CustomerID stays as a foreign key:\n" + R("Customer", ["CustomerID"], ["CustName", "CustTown"]) + "\n" + R("Order", ["OrderID"], ["OrderDate", "CustomerID"]) },
      { h: "Check", m: "Four relations — Customer, Order, Product, OrderLine. Every fact is stored once; each non-key attribute depends on the key, the whole key and nothing but the key." }
    ] },
    { fig: er([{ id: "Customer", x: 20, y: 20 }, { id: "Order", x: 220, y: 20 }, { id: "OrderLine", x: 220, y: 100 }, { id: "Product", x: 420, y: 100 }],
      [["Customer", "Order", "1", "M"], ["Order", "OrderLine", "1", "M"], ["Product", "OrderLine", "1", "M"]], "The 3NF result as an ER diagram — OrderLine resolves the Order–Product many-to-many.", { w: 570, h: 150 }) },
    { worked: { tag: "variation", title: "What normal form is it in?", q: "State the highest normal form of each and why: (a) Enrolment(StudentID, CourseID, StudentName, Grade) (b) Booking(BookingID, CustomerID, CustomerEmail, BookingDate) (c) Team(TeamID, Players) where Players holds \"Ali, Bea, Cy\" (d) Loan(CopyID, DateOut, MemberID, DateDue).",
      steps: [
        { m: "(a) **1NF** — StudentName depends on StudentID only: partial dependency.", mk: "1" },
        { m: "(b) **2NF** — single key, but CustomerEmail depends on CustomerID: transitive.", mk: "1" },
        { m: "(c) **not 1NF** — Players is not atomic (a repeating group).", mk: "1" },
        { m: "(d) **3NF** — MemberID and DateDue each depend on the whole key (this copy on this date) and on nothing else.", mk: "1" }
      ], result: "1NF, 2NF, UNF, 3NF" } },

    { page: "Designing relations from a scenario" },
    { callout: { t: "info", h: "Key idea", body: "AQA's 4–5 mark design questions give some relations and ask for the rest. The marks go to **each relation with the right attributes and no others**, plus **correct identifiers**." } },
    { steps: [
      "List what the scenario says is recorded. Every fact must land in exactly one relation.",
      "Give each real thing (customer, booking) a relation and an identifier — reuse the attribute names the question already used (R. renamed ones).",
      "For each \"one … many\" rule, put the one side's key in the many side's relation.",
      "For each \"many … many\" rule, create a linking relation keyed on both keys (add a date/time if a pairing can repeat).",
      "Underline the identifier; check there is no repeating group (a list of seats → one row per seat)."
    ] },
    { callout: { t: "tip", h: "Foreign keys are not marked", body: "\"I. any representation for foreign keys\" — you may mark them (dotted underline, asterisk) or not. SQL answers are accepted too, ignoring syntax and data-type errors." } },

    { page: "Normalisation versus speed" },
    { callout: { t: "info", h: "Key idea", body: "A fully normalised design can need **more joins** to answer a query. Sometimes designers **denormalise** deliberately — store a derivable fact again — to make a frequent query quicker." } },
    { table: { head: [" ", "Fully normalised", "Denormalised (redundant attribute added)"], rows: [
      ["Storage", "each fact once — least space", "extra copies — more space"],
      ["Consistency", "cannot disagree with itself", "copies can disagree (inconsistency)"],
      ["Updates", "one place to change", "every copy must be changed — more updates"],
      ["Queries", "may need joins across several tables", "a common lookup reads one table — quicker, simpler"],
      ["Typical use", "transaction systems with frequent updates", "reporting / read-heavy systems"]
    ] } },
    { callout: { t: "tip", h: "Evaluate in both directions", body: "A 2-mark \"one advantage and one disadvantage\" wants a **speed/simplicity** gain AND a **redundancy/inconsistency/extra-update** cost — R. \"it will be possible to\" (it already was)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Separate the owner details", src: "A-level June 2017 · P2 Q10.2 · 2 marks",
      q: "Car(CarRegNo, Make, Model, OwnerName, OwnerEmail, OwnerTelNo). It has been suggested that owner details should be stored in a new relation, separately from car details. Explain why storing the owner details separately would improve the design of the database.",
      steps: [
        { m: "A person may own more than one car / bring different cars to the garage;", mk: "1 mark (AO2)", n: "A. it might be desired to store an owner before their car is known; A. easier to transfer a car between owners." },
        { m: "So owner details would not be stored (or input) once for each car they own — less duplication/redundancy, no inconsistency, no update/insertion anomalies;", mk: "1 mark (AO1)", n: "NE. saving space; NE. easier to query; NE. fewer errors without an example." }
      ], result: "Owner details stored once" } },
    { worked: { tag: "exam", title: "Two reasons to normalise", src: "A-level June 2018 · P2 Q07.3 · 2 marks",
      q: "State two reasons why database designs, such as the athletics database, are usually normalised.",
      steps: [
        { m: "To minimise data duplication / eliminate data redundancy;", mk: "1 mark", n: "Only ONE mark from duplication and redundancy together." },
        { m: "To eliminate data inconsistency / update anomalies (updates in one place) / insertion anomalies / deletion anomalies;", mk: "1 mark" }
      ], result: "Less redundancy; no anomalies" } },
    { worked: { tag: "exam", title: "Why the design without Customer was rejected", src: "A-level June 2021 · P2 Q05.2 · 2 marks",
      q: "A different design had no Customer relation, and Booking(FacilityID, BookingDate, StartTime, EndTime, Forename, Surname, EmailAddress). Explain why this alternative design would have been rejected in favour of the design with Customer(CustomerID, Forename, Surname, EmailAddress) and Booking(FacilityID, BookingDate, StartTime, EndTime, CustomerID).",
      steps: [
        { m: "The design is not normalised / customer attributes are determined by attributes that are not part of the primary key;", mk: "1 mark" },
        { m: "If a customer made more than one booking their details would be entered more than once, so they could be inconsistent / updates would be needed in several records;", mk: "1 mark", n: "Also creditworthy: deleting all a customer's bookings deletes the customer; cannot store a customer before they book; customers with the same name cannot be told apart. Each must say it is the CUSTOMER data. Max 2." }
      ], result: "Customer data duplicated → inconsistency and anomalies" } },
    { worked: { tag: "exam", title: "Not required for full normalisation", src: "A-level June 2022 · P2 Q07.1 · 1 mark",
      q: "Which of these does NOT have to be true for a fully normalised database? A each attribute in a relation is dependent on the primary key · B each attribute is dependent only on the primary key, not also on any other attribute · C the primary key in each relation consists of only one attribute · D there are no repeating groups (each attribute is atomic)",
      steps: [{ m: "A, B and D are the 2NF/3NF/1NF properties. Composite keys are allowed." }, { m: "C;", mk: "1 mark" }], result: "C" } },
    { worked: { tag: "exam", title: "Add ZooName to Animal?", src: "A-level June 2022 · P2 Q07.5 · 2 marks",
      q: "It is proposed to add ZooName to the Animal relation to store the zoo that currently has the animal (AnimalLocation already records each animal's zoos, with DateLeft = 01/01/0001 for the current one). Describe one advantage and one disadvantage of adding this attribute.",
      steps: [
        { h: "Advantage", m: "It will be quicker to look up an animal's current location — only the Animal relation needs searching / a less complex query;", mk: "1 mark", n: "NE. easier; R. \"it will be possible to identify\" — it already is." },
        { h: "Disadvantage", m: "It introduces data redundancy (the zoo is already in AnimalLocation), so data inconsistency could occur / more updates when an animal moves / more storage;", mk: "1 mark", n: "A. the database is no longer normalised." }
      ], result: "Faster lookup vs redundancy" } },
    { worked: { tag: "exam", title: "Problems without full normalisation", src: "A-level June 2024 · P2 Q08.5 · 2 marks",
      q: "The shop database is fully normalised. Describe two problems that can occur with databases that are not fully normalised.",
      steps: [
        { m: "If data is stored more than once, the copies could be inconsistent / two copies of the 'same' item could hold different values;", mk: "1 mark" },
        { m: "It might not be possible to store data about one type of entity without creating a record for another / deleting one entity's record could delete another's data / each copy must be updated if it changes / redundant data wastes storage / non-atomic data is hard to select;", mk: "1 mark", n: "Describe — NE. the bare terms \"redundancy\", \"update anomaly\", \"insertion anomaly\"." }
      ], result: "Two described problems" } },
    { worked: { tag: "exam", title: "Vets: the other relations", src: "A-level June 2019 · P2 Q06.2 · 4 marks",
      q: "Given Pet(PetID, PetName, Type, DateOfBirth), Surgery(SurgeryName, Town, TelephoneNumber) and Vet(VetID, VetForename, VetSurname, SurgeryName), list all the other relations for a fully normalised design, with their attributes, underlining each entity identifier. Each customer has an ID, forename, surname and telephone number; a pet is owned by one or more customers and a customer may own any number of pets; an appointment is for a pet on a date and time at a surgery.",
      steps: [
        { m: R("Customer", ["CustomerID"], ["Forename", "Surname", "TelephoneNumber"]) + ";", mk: "1 mark", n: "R. PetID in Customer when PetOwner exists." },
        { m: "Appointment(PetID, Date, Time, SurgeryName) with the correct attributes;", mk: "1 mark", n: "I. extra reasonable attributes such as VetID." },
        { m: "Its composite identifier " + U("PetID") + ", " + U("Date") + ", " + U("Time") + ";", mk: "1 mark", n: "A. a new AppointmentID." },
        { m: R("PetOwner", ["CustomerID", "PetID"]) + " — those two attributes only, both in the identifier;", mk: "1 mark", n: "R. only one of them as the identifier." }
      ], result: "Customer, Appointment, PetOwner" } },
    { worked: { tag: "exam", title: "Cinema: the other three relations", src: "A-level June 2023 · P2 Q05.1 · 5 marks",
      q: "Given Screen(ScreenNumber, Capacity), Seat(SeatNumber, ScreenNumber, SeatType), Film(FilmID, FilmName, Duration, Certificate) and Showing(ShowingID, ScreenNumber, FilmID, ShowTime, ShowDate), list the other three relations needed for a fully normalised design, underlining the identifiers. Each booking is for one showing and one or more chosen seats; only the booker's first name, last name and telephone number are stored, and are re-used for later bookings.",
      steps: [
        { m: "Customer(CustomerID, FirstName, LastName, TelephoneNumber) — those attributes and no others;", mk: "1 mark" },
        { m: "Booking(BookingID, ShowingID, CustomerID);", mk: "1 mark", n: "A. a NumberOfSeats count." },
        { m: "AssignedSeat(BookingID, SeatNumber) — one row per seat removes the repeating group;", mk: "1 mark" },
        { m: "Identifiers: " + U("CustomerID") + "; " + U("BookingID") + " (or ShowingID + CustomerID); " + U("BookingID") + " + " + U("SeatNumber") + " (or ShowingID + SeatNumber);", mk: "1 mark one or two · 2 marks all three", n: "R. FirstName + LastName or TelephoneNumber as the customer key." }
      ], result: "Customer, Booking, AssignedSeat" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State reasons to normalise", "Two DIFFERENT problems avoided — duplication/redundancy count once."],
      ["Describe problems", "Say what goes wrong: copies disagree; must update every copy; cannot add X without Y; deleting X loses Y."],
      ["Explain why rejected", "Not normalised + the specific repeated data (the customer's) and its consequence."],
      ["Develop a normalised design", "Each relation: right attributes, no others, existing names reused; identifiers underlined; linking relations for M:M."],
      ["Advantage and disadvantage", "Speed/simplicity vs redundancy/inconsistency."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"The key, the whole key, and nothing but the key\"", body: "1NF: atomic values and **a key**. 2NF: depend on the **whole** key (no partials). 3NF: **nothing but** the key (no transitives). Anomalies to name: **I U D** — Insertion, Update, Deletion." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Saying normalisation \"saves space\" or makes queries \"easier\" (NE.).", "Two marks for redundancy AND duplication — they are one idea.", "Thinking 3NF needs single-attribute keys.", "Leaving a list of seats in one attribute (repeating group).", "Renaming an attribute the question already named.", "Forgetting the foreign key that stays behind when a transitive dependency moves out."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.10.1 the 3NF relations ARE the ER diagram; 4.10.2 dependencies are stated against the primary key; 4.10.4 normalised tables need joins in SQL; 4.10.5 and 4.7.3.7 denormalising is one way to speed up a database server; 4.11.1 Big Data's unstructured data does not fit rows and columns at all." } }
  ],
  flashcards: [
    ["Normalisation?", "Organising attributes into relations so each fact is stored once, removing redundancy and anomalies."],
    ["1NF?", "No repeating groups; every attribute atomic; has a primary key."],
    ["2NF?", "1NF and no partial dependencies — every non-key attribute depends on the whole key."],
    ["3NF?", "2NF and no transitive dependencies — every non-key attribute depends on nothing but the key."],
    ["Partial dependency?", "A non-key attribute depending on only part of a composite key."],
    ["Transitive dependency?", "A non-key attribute depending on another non-key attribute."],
    ["Update anomaly?", "A change must be made in many rows; missing one leaves inconsistent data."],
    ["Is a 1NF relation with a single-attribute key in 2NF?", "Yes — there is no part of the key to depend on.", 9],
    ["Denormalising: one gain, one cost?", "Quicker/simpler lookup; redundancy → possible inconsistency and extra updates.", 11]
  ],
  quiz: [
    { q: "Which does NOT have to hold for full normalisation?", opts: ["every primary key is one attribute", "no repeating groups", "attributes depend on the whole key", "no transitive dependencies"], ans: 0, why: "2022 Q07.1." },
    { q: "Enrolment(StudentID, CourseID, StudentName, Grade) is in", opts: ["1NF only", "2NF", "3NF", "not 1NF"], ans: 0, why: "StudentName is a partial dependency." },
    { q: "Booking(BookingID, CustomerID, CustomerEmail) breaks", opts: ["3NF", "1NF", "2NF", "nothing"], ans: 0, why: "Transitive dependency via CustomerID." },
    { q: "\"Normalising saves memory\" alone scores", opts: ["NE.", "1 mark", "2 marks", "R. always"], ans: 0, why: "Name the specific problem." },
    { q: "A cell holding \"football, rugby, hockey\" breaks", opts: ["1NF", "2NF", "3NF", "referential integrity"], ans: 0, why: "Not atomic." },
    { q: "Adding a redundant ZooName to Animal makes", opts: ["current-location lookups quicker but risks inconsistency", "the database more normalised", "AnimalLocation unnecessary", "no difference"], ans: 0, why: "Denormalisation trade-off." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
