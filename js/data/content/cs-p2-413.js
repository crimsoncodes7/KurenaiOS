/* Kurenai OS — deep content: AQA Computer Science, spec 4.13.1.1–4.13.1.5
   (aspects of software development: analysis, design, implementation,
   testing and evaluation, with prototyping / agile iteration) at full
   A-level depth. Each topic REPLACES the short entry cs-databases-sys.js
   carried. AQA examines this mostly through the on-screen "test your
   program" tasks of AS Paper 1 (2016–2025) and the NEA; every one of those
   algorithms was implemented and run with the exam's own test data
   (Python, and C# under .NET 10) so every expected output below is
   checked. Past-paper banks stay in bank-cs-410-413.js. */
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
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: o.c || "accent2", w: o.w || 1.8, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}
/* the five stages with feedback loops; `on` names the stage to highlight */
function cycleFig(on, cap) {
  var st = [["Analysis", "requirements"], ["Design", "algorithms · UI"], ["Implementation", "code · debug"], ["Testing", "test data · plan"], ["Evaluation", "vs requirements"]];
  var it = [];
  st.forEach(function (s, i) {
    var x = 10 + i * 128;
    it = it.concat(boxAt(x, 40, 112, 54, s[0], s[0] === on ? "accent2" : "accent", s[1]));
    if (i) it = it.concat(arrow(x - 16, 67, x, 67, null, { c: "text2", w: 1.4 }));
  });
  it.push({ poly: [[586, 94], [586, 130], [66, 130], [66, 96]], close: false, c: "good", w: 1.5, dash: "5 4" });
  it.push({ line: [[66, 106], [66, 96]], c: "good", w: 1.5, arrow: true });
  it.push(txt(326, 144, "prototyping / agile: feedback from users loops back — design and implementation repeat in iterations", { size: 10.5, c: "good" }));
  return { fig: { w: 650, h: 160, items: it, cap: cap } };
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **Max n** caps the total. **A.** accept · **R.** reject · **I.** ignore.",
  "Screen-capture tasks (Paper 1 Section A): **one** mark, and only if the capture shows EVERY requested test, the prompts match your code, and the code for the previous part is sensible. One wrong output = 0.",
  "Test-data tables: 1 mark for one row right, 2 for all three — the three types are normal (valid/typical), boundary (extreme) and erroneous (invalid)."
] } };

/* =====================================================================
   4.13.1.1  Analysis
   ===================================================================== */
C["compsci:4.13.1.1"] = {
  notes: [
    { h: "Analysis — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.13.1.1)", body: ["Before a problem can be solved it must be **defined**, the **requirements** of the system must be **established** and a **data model** created.", "Requirements are established by **interaction with the intended users**, and clarifying them may involve **prototyping / an agile approach**. Students use **abstraction** to model aspects of the external world."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Examples of work in the analysis stage", "State", "2", "AS 2020 P1 Q01"],
      ["Analysis section of the NEA", "—", "9 (NEA)", "your project: problem, users, objectives, data model"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What analysis produces**.", "**Finding out what users need**.", "**Writing requirements**.", "**Abstraction and the data model**.", "**Prototyping and agile vs waterfall**.", "**In exam questions**.", "**Exam toolkit**."] },
    cycleFig("Analysis", "Analysis is the first stage; with prototyping/agile, its requirements are revisited as users give feedback."),

    { page: "What analysis produces" },
    { kv: [
      ["Problem definition", "a clear statement of the problem, its background and who has it"],
      ["Requirements specification", "a numbered list of **measurable objectives** the solution must meet — the yardstick for testing and evaluation"],
      ["Data model", "the entities, attributes and relationships the system must store (ER diagram, data dictionary — 4.10.1)"],
      ["Acceptable limitations / constraints", "what the solution will NOT do; hardware, time, budget, legal limits"],
      ["Research", "existing solutions studied for features to adopt or avoid"]
    ] },
    { callout: { t: "miscon", h: "Analysis is not designing", body: "Analysis decides WHAT the system must do. HOW it will do it — data structures, algorithms, screens — is design (4.13.1.2)." } },

    { page: "Finding out what users need" },
    { table: { head: ["Method", "Good for", "Limitation"], rows: [
      ["Interview", "detail, follow-up questions, one key client", "time-consuming; one viewpoint"],
      ["Questionnaire", "many users, quantifiable answers", "low response; no follow-up; leading questions"],
      ["Observation", "how the work is REALLY done", "people behave differently when watched"],
      ["Examining documents", "existing forms, data volumes, rules", "may be out of date"],
      ["Researching existing solutions", "features, interfaces, pitfalls", "may not fit this user's needs"],
      ["Prototype + feedback", "users react to something concrete", "risk of treating the prototype as the product"]
    ] } },
    { callout: { t: "tip", h: "Requirements come from the USERS", body: "The spec stresses interaction with the intended users. An objective you invented without asking them is a guess — in the NEA, evidence the dialogue (interview notes, feedback on a prototype)." } },

    { page: "Writing requirements" },
    { table: { head: ["Weak", "Why weak", "Measurable"], rows: [
      ["The program should be fast", "untestable", "Search results appear within 1 second for 10 000 records"],
      ["It should be easy to use", "subjective", "A new user can book a lesson in under 5 clicks without help"],
      ["Store student details", "which details?", "Store forename, surname, date of birth and form for each student"],
      ["Validate input", "which input, how?", "Reject a mark outside 0–100 with an error message and re-prompt"]
    ] } },
    { callout: { t: "mnemonic", h: "SMART objectives", body: "**S**pecific · **M**easurable · **A**chievable · **R**elevant · **T**estable (time-bound in project management). If you cannot write a test for an objective, rewrite it." } },

    { page: "Abstraction and the data model" },
    { callout: { t: "info", h: "Key idea", body: "Modelling the external world means **abstraction**: keep only the details relevant to the problem and discard the rest." } },
    { table: { head: ["Real world", "Kept in the model", "Discarded"], rows: [
      ["A driving-school pupil", "name, licence number, lessons booked, test date", "hair colour, favourite music"],
      ["A lesson", "date, time, instructor, pupil, duration", "the weather that day"],
      ["The car", "registration, gearbox type", "colour of the seats"]
    ] } },
    { fig: { w: 600, h: 90, items: [].concat(
      boxAt(20, 20, 130, 44, "Pupil", "accent"), boxAt(235, 20, 130, 44, "Lesson", "accent"), boxAt(450, 20, 130, 44, "Instructor", "accent"),
      [{ line: [[150, 42], [235, 42]], c: "text2", w: 1.6 }, { line: [[220, 42], [235, 33]], c: "text2", w: 1.6 }, { line: [[220, 42], [235, 51]], c: "text2", w: 1.6 },
       { line: [[365, 42], [450, 42]], c: "text2", w: 1.6 }, { line: [[380, 42], [365, 33]], c: "text2", w: 1.6 }, { line: [[380, 42], [365, 51]], c: "text2", w: 1.6 },
       txt(300, 80, "the analysis-stage data model: each pupil and each instructor has many lessons", { size: 10.5 })]
    ), cap: "An analysis data model as an ER diagram (4.10.1)." } },

    { page: "Prototyping and agile vs waterfall" },
    { table: { head: [" ", "Waterfall (linear)", "Prototyping / agile (iterative)"], rows: [
      ["Order", "each stage finished and signed off before the next", "short cycles; analysis, design, code and test repeat"],
      ["Requirements", "fixed at the start", "clarified as users see working prototypes"],
      ["User involvement", "start and end", "throughout — feedback each iteration"],
      ["Risk", "a misunderstanding found only at the end is costly", "problems found early; scope can creep"],
      ["Suits", "well-understood, fixed requirements", "unclear or changing requirements — most NEAs"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Work in the analysis stage", src: "AS June 2020 · P1 Q01 · 2 marks",
      q: "State two examples of work that you would expect to undertake during the analysis stage of software development.",
      steps: [
        { m: "Producing a problem definition / interviewing the users;", mk: "1 mark" },
        { m: "Writing a requirements specification (list of objectives) / creating a data model or ER diagram;", mk: "1 mark", n: "Also: feedback on the requirements from the end user; analysis data dictionary; questionnaires; observation; examining documents; researching existing solutions; acceptable limitations. Max 2." }
      ], result: "Two of: problem definition, requirements, data model, interviews…" } },
    { worked: { tag: "variation", title: "Rewrite as measurable objectives", q: "A gym owner says: \"I want an app that's quick, records members' visits and stops people booking classes that are full.\" Write three measurable objectives.",
      steps: [
        { m: "1. A member's visit is recorded (member ID, date, time in) within 2 seconds of scanning their card.", mk: "1" },
        { m: "2. The system stores for each class: name, date, start time, capacity and the members booked.", mk: "1" },
        { m: "3. A booking is refused with the message \"Class full\" when the number booked equals the capacity.", mk: "1" }
      ], result: "Each objective can be tested" } },
    { worked: { tag: "variation", title: "Choose the method", q: "Which requirement-gathering method suits each, and why? (a) how 400 members use the current paper booking system (b) the head of IT's security rules (c) how receptionists actually handle a full class.",
      steps: [{ m: "(a) questionnaire — many users, quick to analyse", mk: "1" }, { m: "(b) interview / examining documents — one expert, detailed rules", mk: "1" }, { m: "(c) observation — shows the real process, not the described one", mk: "1" }], result: "Questionnaire, interview/documents, observation" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State examples of analysis work", "Concrete activities: interviews, problem definition, requirements specification, data model."],
      ["Explain why requirements matter", "They are what the design follows and what testing and evaluation measure against."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Define, Discover, Document, Model\"", body: "**Define** the problem · **Discover** requirements from users · **Document** measurable objectives · **Model** the data." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Giving design work (drawing screens, writing algorithms) as analysis.", "Unmeasurable objectives (\"user-friendly\").", "Requirements with no evidence of the user."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.10.1 the data model; 4.1.1 abstraction in programs; 4.4.1.1 abstraction (representational, by generalisation); 4.13.1.5 evaluation measures against these requirements; NEA.1 analysis." } }
  ],
  flashcards: [
    ["Three outputs of analysis?", "Problem definition, requirements specification, data model."],
    ["How are requirements established?", "By interaction with the intended users."],
    ["Five ways to gather requirements?", "Interviews, questionnaires, observation, examining documents, researching existing solutions."],
    ["Why must objectives be measurable?", "So testing and evaluation can show whether each was met."],
    ["How is abstraction used in analysis?", "Keeping only the details relevant to the problem when modelling the real world."],
    ["Prototyping's role in analysis?", "Users react to a working model, clarifying the requirements."],
    ["How does waterfall differ from agile?", "Waterfall: stages in sequence, fixed requirements. Agile: short iterations with user feedback."],
    ["Give two tasks carried out during analysis.", "e.g. problem definition; requirements specification (also data model, interviews…)."]
  ],
  quiz: [
    { q: "Which is analysis work?", opts: ["interviewing the client", "writing pseudo-code", "drawing screen layouts", "choosing test data"], ans: 0, why: "Gathering requirements." },
    { q: "\"The program must be user-friendly\" is", opts: ["not measurable", "a SMART objective", "a data model", "a test plan"], ans: 0, why: "Cannot be tested." },
    { q: "Observation is best for", opts: ["how work is really done", "surveying hundreds", "finding out the legal rules", "testing the finished code"], ans: 0, why: "Sees actual practice." },
    { q: "The data model is created in", opts: ["analysis", "testing", "evaluation", "implementation only"], ans: 0, why: "The data model is created in the analysis stage, before design begins." }
  ]
};

/* =====================================================================
   4.13.1.2  Design
   ===================================================================== */
C["compsci:4.13.1.2"] = {
  notes: [
    { h: "Design — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.13.1.2)", body: ["Before constructing a solution it should be **designed and specified**: planning **data structures** for the data model, designing **algorithms**, an appropriate **modular structure**, and the **human user interface**.", "Design can be **iterative** (prototyping / agile). Students structure programs into **modular parts with clear, documented interfaces**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Implement and test a given pseudo-code design", "Write / Test", "1 per test", "AS P1 Section A every year — e.g. 2017 Q03.2, 2022 Q03.2"],
      ["Design section of the NEA", "—", "12 (NEA)", "your project: hierarchy chart, algorithms, data structures, UI"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The four things designed**.", "**Modular structure**: the hierarchy chart.", "**Designing and desk-checking algorithms**.", "**Designing the interface**.", "**In exam questions**.", "**Exam toolkit**."] },
    cycleFig("Design", "Design turns the requirements into a plan the programmer can follow — and in an agile project it is revisited each iteration."),

    { page: "The four things designed" },
    { table: { head: ["Design element", "What it specifies", "Typical evidence"], rows: [
      ["Data structures", "how the data model will be held: records, arrays, files, tables, classes", "data dictionary; class diagram; table definitions"],
      ["Algorithms", "the steps of each process", "pseudo-code; flowcharts; trace tables"],
      ["Modular structure", "how the solution splits into subroutines / classes with defined interfaces", "hierarchy (structure) chart; interface table"],
      ["Human user interface", "screens, inputs, outputs, navigation", "annotated screen mock-ups; menu maps"]
    ] } },

    { page: "Modular structure" },
    { fig: (function () {
      var it = [];
      it = it.concat(boxAt(240, 10, 140, 40, "Quiz program", "accent2"));
      var kids = [["Login", 20], ["Ask questions", 175], ["Mark answers", 330], ["Show results", 485]];
      kids.forEach(function (k) { it = it.concat(boxAt(k[1], 90, 130, 40, k[0], "accent")); it.push({ line: [[310, 50], [k[1] + 65, 90]], c: "text2", w: 1.4 }); });
      it = it.concat(boxAt(110, 170, 120, 36, "Load question", "good"), boxAt(250, 170, 120, 36, "Read answer", "good"));
      it.push({ line: [[240, 130], [170, 170]], c: "text2", w: 1.4 }, { line: [[240, 130], [310, 170]], c: "text2", w: 1.4 });
      it.push(txt(330, 220, "each box: one subroutine with documented parameters and return value", { size: 10.5 }));
      return { w: 640, h: 235, items: it, cap: "A hierarchy chart: the problem decomposed top-down into modules; lower boxes are called by the box above." };
    })() },
    { kv: [
      ["Interface", "a module's name, parameters (with types), return value and purpose — documented so it can be written and tested alone"],
      ["Cohesion", "each module does ONE well-defined job — high cohesion is good"],
      ["Coupling", "how much modules depend on each other — low coupling (data passed only through parameters, no globals) is good"],
      ["Benefits", "modules can be developed by different people, tested independently, reused, and changed without breaking others"]
    ] },

    { page: "Designing and desk-checking algorithms" },
    { callout: { t: "info", h: "Key idea", body: "An algorithm design is checked BEFORE coding by a **dry run** (trace table). The 2017 GCF design:" } },
    { code: { lang: "pseudo", src: "Temp1 <- Number1\nTemp2 <- Number2\nWHILE Temp1 != Temp2\n  IF Temp1 > Temp2 THEN Temp1 <- Temp1 - Temp2\n  ELSE Temp2 <- Temp2 - Temp1\n  ENDIF\nENDWHILE\nResult <- Temp1", cap: "Greatest common factor by repeated subtraction." } },
    { table: { head: ["Pass", "Temp1", "Temp2", "Temp1 ≠ Temp2?"], rows: [
      ["start", "12", "39", "yes"], ["1", "12", "27", "yes"], ["2", "12", "15", "yes"], ["3", "12", "3", "yes"],
      ["4", "9", "3", "yes"], ["5", "6", "3", "yes"], ["6", "3", "3", "no → Result = 3"]
    ] } },
    { callout: { t: "tip", h: "Design for correctness AND efficiency", body: "The trace shows the design is correct for 12, 39 — but 1 and 1 000 000 would take 999 999 passes. A better design uses MOD (Euclid): 39 MOD 12 = 3, 12 MOD 3 = 0 → 3 in two steps. Spotting this before coding is the point of design." } },

    { page: "Designing the interface" },
    { table: { head: ["Principle", "Example"], rows: [
      ["Consistency", "the same button positions and wording on every screen"],
      ["Feedback", "a confirmation or clear error message after every action"],
      ["Validation at entry", "drop-downs and ranges so invalid data cannot be typed"],
      ["Suitability for the users", "font size, language and accessibility needs established in analysis"],
      ["Minimal steps", "the common task reachable in few actions"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Test the GCF design", src: "AS June 2017 · P1 Q03.2 · 1 mark",
      q: "A pseudo-code design finds the greatest common factor (GCF) of two whole numbers: it copies Number1 and Number2 into Temp1 and Temp2, and while Temp1 ≠ Temp2 subtracts the smaller from the larger, then outputs Temp1, \" is GCF of \", Number1, \" and \", Number2. Having implemented it, test the program by entering 12 and then 39. What must the screen capture show?",
      steps: [
        { m: "Trace: (12, 39) → (12, 27) → (12, 15) → (12, 3) → (9, 3) → (6, 3) → (3, 3)." },
        { m: "The prompts, 12 and 39 being entered, and the output \"3 is GCF of 12 and 39\";", mk: "1 mark", n: "Must match your own code's prompts; the code for 03.1 must be sensible." }
      ], result: "3 is GCF of 12 and 39", try: [{ notesOnly: true, trace: { code: "Temp1 <- Number1\nTemp2 <- Number2\nWHILE Temp1 != Temp2\n  IF Temp1 > Temp2 THEN Temp1 <- Temp1 - Temp2\n  ELSE Temp2 <- Temp2 - Temp1\n  ENDIF\nENDWHILE\nResult <- Temp1", lang: "pseudo", cols: ["Temp1", "Temp2"], rows: [["18", "30"], ["18", "12"], ["6", "12"], ["6", "6"]], cap: "**Your turn.** Trace it with Number1 = 18 and Number2 = 30: one row per pass, both values each time. The GCF is the last Temp1." } }] } },
    { worked: { tag: "exam", title: "Test the dice design", src: "AS June 2022 · P1 Q03.2 · 1 mark",
      q: "A design repeatedly generates two random integers N1 and N2 from 1 to 6, outputting them, adding them to S and counting turns T; C counts turns with at least one 6 and D counts doubles; it stops when C = 3 or D = 3, then outputs C, D and A = S DIV (T * 2). What must the screen capture of one run show to earn the mark?",
      steps: [
        { m: "Each line except the last shows two digits from 1 to 6;" },
        { m: "The last line shows C, D and A — with C or D (or both) equal to 3, and both counts matching the pairs shown;", mk: "1 mark", n: "Random output, so the values differ from the mark scheme's sample (which ended 3 2 3). I. missing spaces; A. each digit on a new line." }
      ], result: "Pairs 1–6; final line with a 3 and a whole-number average" } },
    { worked: { tag: "variation", title: "Design a module interface", q: "Design the interface of a subroutine that checks whether a class can take another booking.",
      steps: [
        { m: "Name: CanBook", mk: "1" },
        { m: "Parameters: booked (integer, ≥ 0), capacity (integer, > 0)", mk: "1" },
        { m: "Returns: Boolean — True when booked < capacity", mk: "1" },
        { m: "No global variables used; it can be tested alone with normal (3, 10), boundary (9, 10 / 10, 10) and erroneous (−1, 10) data." }
      ], result: "CanBook(booked, capacity) → Boolean" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe the design work", "Data structures, algorithms, modular structure, user interface — each planned before coding."],
      ["Test the design (screen capture)", "Dry-run it first so you know the right output; every requested test shown."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"DAMI\" — what gets designed", body: "**D**ata structures · **A**lgorithms · **M**odular structure · **I**nterface." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Starting to code before a dry run — the trace finds logic errors cheaply.", "Modules sharing global variables (high coupling).", "A capture that shows only some of the requested tests."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1 subroutines, parameters and local variables; 4.1.2 structured and object-oriented design; 4.3 algorithms and trace tables; 4.10.1 data model to data structures; 4.13.1.4 the design is what the tests check." } }
  ],
  flashcards: [
    ["Name the four things that are designed.", "Data structures, algorithms, modular structure, human user interface."],
    ["What does a hierarchy chart show?", "A top-down diagram of a solution's modules and which calls which."],
    ["What does a module's interface document?", "Its name, parameters, return value and purpose, documented."],
    ["What does high cohesion mean?", "Each module does one well-defined job."],
    ["What does low coupling mean?", "Modules depend on each other only through parameters — no shared globals."],
    ["Why dry-run a design?", "To find logic errors before coding."],
    ["Can design be iterative?", "Yes — in prototyping and agile methods the design is revisited every cycle as feedback arrives.", 7]
  ],
  quiz: [
    { q: "A hierarchy chart shows", opts: ["modules and how they decompose", "test results for each module", "user requirements and their priority", "database keys and how tables link"], ans: 0, why: "Modular structure." },
    { q: "Low coupling means", opts: ["modules interact only through parameters", "one module does everything the program needs", "modules share data through many global variables", "the program has no subroutines at all"], ans: 0, why: "Low coupling means a module depends on others only through its parameters, so changing one has little effect on the rest." },
    { q: "A dry run of the GCF design with 12 and 39 ends with", opts: ["3", "1", "12", "27"], ans: 0, why: "The greatest common factor of 12 and 39 is 3, and a dry run through the design ends with that value." },
    { q: "Screen mock-ups belong to", opts: ["design", "analysis", "evaluation", "testing"], ans: 0, why: "User interface design." }
  ]
};

/* =====================================================================
   4.13.1.3  Implementation
   ===================================================================== */
C["compsci:4.13.1.3"] = {
  notes: [
    { h: "Implementation — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.13.1.3)", body: ["The models and algorithms must be implemented as **data structures and code** a computer can understand.", "The final solution may be reached **iteratively** (prototyping / agile) with a focus on **solving the critical path first**. Students practise writing, **debugging** and testing, and **argue for correctness and efficiency** using logical reasoning, test data and user feedback."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Write a program for a pseudo-code algorithm", "Write", "4–8", "AS P1 Section A every year"],
      ["Show it running with given data", "Test (screen capture)", "1", "AS 2016 Q05.2, 2019 Q03.2, 2024 Q04.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**From design to code**.", "**The critical path and iteration**.", "**Debugging**.", "**Arguing correctness and efficiency**.", "**In exam questions**.", "**Exam toolkit**."] },
    cycleFig("Implementation", "Implementation builds the design; each agile iteration implements the next most critical part."),

    { page: "From design to code" },
    { table: { head: ["Pseudo-code", "C#", "Python", "VB.NET"], rows: [
      ["x MOD y", "x % y", "x % y", "x Mod y"],
      ["x DIV y", "x / y (both int)", "x // y", "x \\ y"],
      ["a ← b", "a = b;", "a = b", "a = b"],
      ["a ≠ b", "a != b", "a != b", "a <> b"],
      ["FOR i ← 1 TO n", "for (int i = 1; i <= n; i++)", "for i in range(1, n + 1):", "For i = 1 To n"],
      ["OUTPUT / INPUT", "Console.WriteLine / Console.ReadLine", "print / input", "Console.WriteLine / Console.ReadLine"]
    ] } },
    { code: { lang: "csharp", src: "Console.Write(\"Enter a positive whole number: \");\nint numberIn = int.Parse(Console.ReadLine());\nint numberOut = 0, count = 0;\nwhile (numberIn > 0)\n{\n    count++;\n    int partValue = numberIn % 2;      // MOD\n    numberIn = numberIn / 2;           // DIV: integer division\n    for (int i = 1; i <= count - 1; i++) partValue *= 10;\n    numberOut += partValue;\n}\nConsole.WriteLine(\"The result is: \" + numberOut);", cap: "AS 2019's design in C#, run with 22, 29 and −1 → 10110, 11101, 0 (it writes the binary digits as a denary-looking number)." } },
    { callout: { t: "warn", h: "FOR … TO is inclusive", body: "FOR i ← 1 TO Count − 1 runs Count − 1 times. Python's range(1, Count) stops BEFORE Count — so range(1, Count) is right here, but FOR k ← 0 TO Number − 1 is range(0, Number). Off-by-one errors here change every output." } },

    { page: "The critical path and iteration" },
    { kv: [
      ["Critical path", "the sequence of dependent tasks that determines the minimum time to finish — the core functionality everything else relies on"],
      ["Solve it first", "build the parts other features depend on (data storage, the main process) before extras (themes, reports)"],
      ["Iteration", "each cycle delivers a working, testable increment; users' feedback shapes the next"],
      ["Prototype", "an early working model — possibly thrown away — used to check understanding with the user"]
    ] },

    { page: "Debugging" },
    { table: { head: ["Error type", "When found", "Example", "Found by"], rows: [
      ["Syntax", "translation", "missing bracket; misspelt keyword", "the compiler / interpreter's message"],
      ["Run-time", "execution — program crashes", "division by zero; index out of range; int.Parse(\"abc\")", "exception message and line"],
      ["Logic", "execution — wrong output, no crash", "< instead of <=; DIV where / was meant", "testing with expected results; trace"]
    ] } },
    { ul: ["**Breakpoints** pause execution at a line.", "**Stepping** runs one statement at a time.", "**Watches** show variables' values as they change.", "**Trace output** — temporary print statements.", "Compare with a **hand trace table** of the design."] },

    { page: "Arguing correctness and efficiency" },
    { table: { head: ["Evidence", "Shows", "Example"], rows: [
      ["Logical reasoning", "why the algorithm always works / how its time grows", "the loop halves NumberIn each pass, so it ends after about log₂ n passes"],
      ["Test data", "it works for the cases tried, including boundaries and errors", "22 → 10110, 29 → 11101, −1 → 0"],
      ["User feedback", "it does what the users actually need", "the client confirms the output format"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Persistence tests", src: "AS June 2016 · P1 Q05.2 · 1 mark",
      q: "A program implements this design:\n\n```pseudo\nINPUT Value (0–99) and Operation ('a' or 'm')\nCount ← 0\nWHILE Value > 9\n  IF Operation = 'a' THEN\n    Value ← (Value DIV 10) + (Value MOD 10)\n  ELSE\n    Value ← (Value DIV 10) * (Value MOD 10)\n  ENDIF\n  Count ← Count + 1\nENDWHILE\nOUTPUT \"The persistence is: \", Count\n```\n\nTest it by entering 47 followed by `m`, and 77 followed by `a`. What must the screen captures show?",
      steps: [
        { m: "47, m: 4 × 7 = 28 → 2 × 8 = 16 → 1 × 6 = 6 — three steps → \"The persistence is: 3\"." },
        { m: "77, a: 7 + 7 = 14 → 1 + 4 = 5 — two steps → \"The persistence is: 2\"." },
        { m: "Both tests showing the data entered, the right choice (m / a) and the correct persistence;", mk: "1 mark" }
      ], result: "3 and 2" } },
    { worked: { tag: "exam", title: "Binary-looking output", src: "AS June 2019 · P1 Q03.2 · 1 mark",
      q: "A program implements this design:\n\n```pseudo\nINPUT NumberIn\nNumberOut ← 0\nCount ← 0\nWHILE NumberIn > 0\n  Count ← Count + 1\n  PartValue ← NumberIn MOD 2\n  NumberIn ← NumberIn DIV 2\n  multiply PartValue by 10 (Count − 1) times\n  NumberOut ← NumberOut + PartValue\nENDWHILE\nOUTPUT \"The result is: \", NumberOut\n```\n\nTest it by entering 22, then 29, then −1 (separate runs). What must the screen capture show?",
      steps: [
        { m: "22 → \"The result is: 10110\"; 29 → \"The result is: 11101\" — each number's binary digits, built as a denary number." },
        { m: "−1 → the loop never runs → \"The result is: 0\";", mk: "1 mark", n: "All three tests must be shown." }
      ], result: "10110 · 11101 · 0", try: [{ notesOnly: true, predict: { code: "int numberIn = 19;\nint numberOut = 0, count = 0;\nwhile (numberIn > 0)\n{\n    count++;\n    int partValue = numberIn % 2;\n    numberIn = numberIn / 2;\n    for (int i = 1; i < count; i++)\n    {\n        partValue = partValue * 10;\n    }\n    numberOut = numberOut + partValue;\n}\nConsole.WriteLine(\"The result is: \" + numberOut);", expect: "The result is: 10011", cap: "**Your turn.** The 2019 program in C#, with 19 typed in. What does the screen show?" } }] } },
    { worked: { tag: "exam", title: "Tally marks", src: "AS June 2024 · P1 Q04.2 · 1 mark",
      q: "A program implements this design:\n\n```pseudo\nINPUT Number1, Number2\nNumber ← larger DIV smaller\nFOR Count ← 1 TO Number\n  IF Count MOD 10 = 0 THEN OUTPUT \"X\"\n  ELSE IF Count MOD 5 = 0 THEN OUTPUT \"V\"\n  ELSE OUTPUT \"/\"\n  ENDIF  // without new lines\nENDFOR\n```\n\nTest it by entering 4 then 99. What must the screen capture show?",
      steps: [
        { m: "99 DIV 4 = 24, so 24 symbols: positions 5 and 15 are V; 10 and 20 are X." },
        { m: "////V////X////V////X////;", mk: "1 mark" }
      ], result: "////V////X////V////X////", try: [{ notesOnly: true, predict: { code: "int number1 = 8, number2 = 99;\nint number = Math.Max(number1, number2) / Math.Min(number1, number2);\nfor (int count = 1; count <= number; count++)\n{\n    if (count % 10 == 0) Console.Write(\"X\");\n    else if (count % 5 == 0) Console.Write(\"V\");\n    else Console.Write(\"/\");\n}\nConsole.WriteLine();", expect: "////V////X//", cap: "**Your turn.** The tally program with 8 and 99. What is printed?" } }] } },
    { worked: { tag: "variation", title: "Find the logic error", q: "A student's Python for the 2019 design prints 'The result is: 1011' for 22. Their loop is: for i in range(1, count - 1): part_value *= 10. Explain the error and fix it.",
      steps: [
        { m: "FOR i ← 1 TO Count − 1 runs Count − 1 times; range(1, count - 1) runs only Count − 2 times — off by one.", mk: "1" },
        { m: "Each digit is shifted one place too few, so digits overlap and the total is wrong.", mk: "1" },
        { m: "Fix: range(1, count) — or range(count - 1).", mk: "1" }
      ], result: "range(1, count)" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Write a program for the algorithm", "Follow the design exactly — same prompts, same order, the language's own MOD / DIV."],
      ["Show the tests", "Every requested input and its output in one capture; trace it by hand first."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Syntax Stops, Run-time Crashes, Logic Lies\"", body: "A syntax error stops translation; a run-time error crashes the run; a logic error runs and lies — only testing against expected results finds it." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Using / for DIV in Python (gives a float).", "Changing the prompts from the design.", "Off-by-one loop bounds.", "Showing one test when three were asked for."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1 programming constructs; 4.6.2 translators and syntax errors; 4.3 algorithm efficiency; 4.13.1.4 the tests; 4.5.2 binary — what the 2019 program prints." } }
  ],
  flashcards: [
    ["Implementation turns models and algorithms into…", "data structures and code a computer can understand."],
    ["What is the critical path in development?", "The sequence of dependent tasks determining the minimum completion time — the core features to build first."],
    ["Name the three types of error.", "Syntax, run-time, logic."],
    ["Which error gives wrong output without crashing?", "A logic error."],
    ["Which Python operators do DIV and MOD?", "// and %."],
    ["Name four debugging tools.", "Breakpoints, stepping, watches, trace output."],
    ["Three kinds of evidence for correctness?", "Logical reasoning, test data, user feedback."],
    ["Persistence of 47 (m) and 77 (a)?", "3 and 2."],
    ["What does the tally program output for 99 DIV 4?", "////V////X////V////X//// (24 symbols)."]
  ],
  quiz: [
    { q: "int.Parse(\"abc\") failing during a run is", opts: ["a run-time error", "a syntax error", "a logic error", "not an error"], ans: 0, why: "Crashes at execution." },
    { q: "The 2019 program with input 29 outputs", opts: ["11101", "10110", "29", "0"], ans: 0, why: "29 = 16 + 8 + 4 + 1, which is 11101 in binary." },
    { q: "\"Solve the critical path first\" means", opts: ["build the core features others depend on first", "fix the slowest code first so the program runs fast", "test the boundary values before any other data", "write all the documentation before any code"], ans: 0, why: "Building the core features that others depend on first means the essential parts are working early." },
    { q: "Python for pseudo-code DIV is", opts: ["//", "/", "%", "div"], ans: 0, why: "Integer division." }
  ]
};

/* =====================================================================
   4.13.1.4  Testing
   ===================================================================== */
C["compsci:4.13.1.4"] = {
  notes: [
    { h: "Testing — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.13.1.4)", body: "The solution must be **tested for errors** using appropriate test data — **normal, boundary and erroneous** — and **tested for efficiency** using logical reasoning." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Name the type of each test value", "Complete the table", "2", "AS 2016 P1 Q03"],
      ["Show the program running with given test data", "Test (screen capture)", "1", "AS 2018 Q03.2, 2020 Q03.2, 2023 Q05.2"],
      ["Testing section of the NEA", "—", "8 (NEA)", "test plan, evidence, boundary and erroneous cases"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The three kinds of test data**.", "**Test plans**.", "**Testing for efficiency**.", "**In exam questions**.", "**Exam toolkit**."] },
    cycleFig("Testing", "Testing checks the implementation against the design and the requirements; failures loop back to implementation."),

    { page: "The three kinds of test data" },
    { table: { head: ["Type", "Meaning", "For an input that must be 1–10"], rows: [
      ["**Normal** (valid, typical)", "data the program should accept and process", "5"],
      ["**Boundary** (extreme)", "values at the limits of the valid range — and just outside them", "1 and 10 (accepted); 0 and 11 (rejected)"],
      ["**Erroneous** (invalid)", "data that should be rejected — wrong range or wrong type", "−3, 25, \"abc\""]
    ] } },
    { fig: (function () {
      var it = [], x0 = 40, sc = 44;
      function X(v) { return x0 + (v + 3) * sc; }
      it.push({ line: [[X(-3), 60], [X(13), 60]], c: "muted", w: 1.4, arrow: true });
      for (var v = -2; v <= 12; v += 2) { it.push({ line: [[X(v), 55], [X(v), 65]], c: "muted", w: 1 }); it.push(txt(X(v), 80, String(v), { size: 10 })); }
      it.push({ poly: [[X(1), 45], [X(10), 45], [X(10), 75], [X(1), 75]], fill: "good", alpha: 0.12, c: "good", w: 1.2 });
      [[5, "good", "normal", 30], [1, "accent2", "boundary", 30], [10, "accent2", "boundary", 30], [0, "danger", "just out", 106], [11, "danger", "just out", 106], [-3, "danger", "erroneous", 106]].forEach(function (p) {
        it.push({ circle: [X(p[0]), 60, 5], fill: p[1], alpha: 0.9, c: p[1] });
        it.push(txt(X(p[0]), p[3], p[2], { size: 10.5, c: p[1] }));
      });
      return { w: 760, h: 120, items: it, cap: "Valid range 1–10 shaded. Boundary tests sit on the edges (and just beyond); normal tests well inside; erroneous tests outside or of the wrong type." };
    })() },
    { callout: { t: "miscon", h: "Boundary is not \"a big number\"", body: "Boundary data is at the EDGE of what is valid, chosen because off-by-one errors live there (< written for <=). A huge number is erroneous (or normal, if valid) — not boundary." } },

    { page: "Test plans" },
    { table: { head: ["Test", "Purpose", "Data", "Type", "Expected", "Actual", "✓/✗"], rows: [
      ["1", "reject below range", "−3", "erroneous", "\"Not a positive number.\" and re-prompt", "as expected", "✓"],
      ["2", "reject above range", "11", "boundary (just out)", "\"Number too large.\" and re-prompt", "as expected", "✓"],
      ["3", "accept top of range", "10", "boundary", "1 9 36 84 126 126 84 36 9 1", "as expected", "✓"],
      ["4", "accept bottom of range", "1", "boundary", "1", "as expected", "✓"],
      ["5", "typical value", "4", "normal", "1 3 3 1", "as expected", "✓"]
    ] } },
    { callout: { t: "info", h: "Key idea", body: "That plan tests the AS 2018 validation loop (accept 1–10) and series. Every row has an **expected** result written BEFORE running; evidence (screenshots) shows the **actual** result." } },

    { page: "Testing for efficiency" },
    { callout: { t: "info", h: "Key idea", body: "\"Tested for efficiency using logical reasoning\": argue how the work grows with the input instead of only timing it." } },
    { table: { head: ["Algorithm", "Reasoning", "Growth"], rows: [
      ["GCF by subtraction (2017)", "worst case subtracts the small number repeatedly: GCF(1, n) takes n − 1 passes", "O(n)"],
      ["GCF by MOD (Euclid)", "the remainder at least halves every two steps", "O(log n)"],
      ["Binary digits (2019)", "NumberIn halves each pass, with an inner loop of Count passes", "O(log² n)"],
      ["Prime factors by trial division (2023)", "tries divisors up to n in the worst case (n prime)", "O(n)"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Test data for sqrt(x)", src: "AS June 2016 · P1 Q03 · 2 marks",
      q: "A new function sqrt(x) returns the square root of a positive integer x. There are three different types of test data. State the type of test data that each value of x would be when testing sqrt: 25, 1, −8.",
      steps: [
        { m: "25 — normal / valid / typical;" },
        { m: "1 — boundary / extreme (the smallest positive integer);" },
        { m: "−8 — erroneous / invalid;", mk: "1 mark one row · 2 marks all three" }
      ], result: "normal, boundary, erroneous", try: [{ notesOnly: true, grid: { cols: ["Value (a mark from 1 to 100 is accepted)", "Type of test data"], rows: [["37", "normal"], ["1", "boundary"], ["100", "boundary"], ["250", "erroneous"], ["seven", "erroneous"]], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], cap: "**Your turn.** Type **normal**, **boundary** or **erroneous** for each." } }] } },
    { worked: { tag: "exam", title: "Validation-loop tests", src: "AS June 2018 · P1 Q03.2 · 1 mark",
      q: "A program repeatedly asks \"Enter a positive whole number: \" until the number is from 1 to 10, outputting \"Number too large.\" above 10 and \"Not a positive number.\" below 1; it then outputs c for k from 0 to Number − 1, starting c ← 1 and updating c ← (c * (Number − 1 − k)) DIV (k + 1). Test it by entering −3, then 11, then 10. What must the screen capture show?",
      steps: [
        { m: "−3 → \"Not a positive number.\" (erroneous); 11 → \"Number too large.\" (just over the boundary)." },
        { m: "10 → 1 9 36 84 126 126 84 36 9 1 (row 9 of Pascal's triangle) — all three in the capture;", mk: "1 mark", n: "A. the numbers on separate lines; A. input on a new line." }
      ], result: "two messages, then 1 9 36 84 126 126 84 36 9 1" } },
    { worked: { tag: "exam", title: "Factorial test", src: "AS June 2020 · P1 Q03.2 · 1 mark",
      q: "A program implements this design (with X > 1):\n\n```pseudo\nINPUT X\nProduct ← 1\nFactor ← 0\nWHILE Product < X\n  Factor ← Factor + 1\n  Product ← Product * Factor\nENDWHILE\nIF X = Product THEN\n  OUTPUT 1 TO Factor\nELSE\n  OUTPUT \"No result\"\nENDIF\n```\n\nTest it by entering 720, then 600. What must the screen capture show?",
      steps: [
        { m: "720: products 1, 2, 6, 24, 120, 720 → equal at Factor 6 → outputs 1 2 3 4 5 6 (720 = 6!)." },
        { m: "600: products reach 720 > 600 without equalling it → \"No result\";", mk: "1 mark", n: "A. same or separate lines." }
      ], result: "1 2 3 4 5 6 · No result", try: [{ notesOnly: true, predict: { code: "foreach (int x in new[] { 120, 100 })\n{\n    int product = 1, factor = 0;\n    while (product < x)\n    {\n        factor++;\n        product = product * factor;\n    }\n    if (x == product)\n    {\n        string line = \"1\";\n        for (int i = 2; i <= factor; i++) line = line + \" \" + i;\n        Console.WriteLine(line);\n    }\n    else Console.WriteLine(\"No result\");\n}", expect: "1 2 3 4 5\nNo result", cap: "**Your turn.** The same test with 120, then 100. What are the two lines?" } }] } },
    { worked: { tag: "exam", title: "Prime-factor tests", src: "AS June 2023 · P1 Q05.2 · 1 mark",
      q: "A program inputs Number (> 1) and, trying X from 2 upwards, outputs each distinct prime factor once while dividing it out and counting every division in Count; it finally outputs Count. Test it by entering 23, then 25, then 1260. What must the screen capture show?",
      steps: [
        { m: "23 (prime): 23 then 1." },
        { m: "25 = 5²: 5 then 2." },
        { m: "1260 = 2² × 3² × 5 × 7: 2 3 5 7 then 6;", mk: "1 mark" }
      ], result: "23,1 · 5,2 · 2 3 5 7,6", try: [{ notesOnly: true, predict: { code: "int number = 84, x = 2, count = 0;\nwhile (number > 1)\n{\n    if (number % x == 0)\n    {\n        Console.WriteLine(x);\n        while (number % x == 0)\n        {\n            number = number / x;\n            count++;\n        }\n    }\n    x++;\n}\nConsole.WriteLine(count);", expect: "2\n3\n7\n4", cap: "**Your turn.** The prime-factor program with 84 (= 2² × 3 × 7). What does it print?" } }] } },
    { worked: { tag: "variation", title: "Choose the test data", q: "A function accepts an exam mark, an integer from 0 to 80. Give two normal, four boundary and two erroneous values, with the expected outcome of each.",
      steps: [
        { m: "Normal: 37, 64 — accepted.", mk: "1" },
        { m: "Boundary: 0 and 80 — accepted; −1 and 81 — rejected.", mk: "1" },
        { m: "Erroneous: \"forty\" (wrong type), 200 (out of range) — rejected with a message.", mk: "1" }
      ], result: "8 tests with expected results" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Name the type of test data", "normal / boundary / erroneous (or valid / extreme / invalid)."],
      ["Show the tests (capture)", "All the requested inputs with the correct outputs — dry-run first."],
      ["Justify test data", "Say what each value checks: inside, edge, just outside, wrong type."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Normal, Nudge, Nonsense\"", body: "**Normal** — typical valid data. **Nudge** — boundary, at and just past the edge. **Nonsense** — erroneous data that must be rejected." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Calling a very large valid value \"boundary\".", "Testing only valid data.", "No expected result written before the test.", "A capture missing one of the requested runs."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.13.1.3 debugging when a test fails; 4.4.4.3 order of complexity for efficiency; 4.1.1 validation and loops; 4.13.1.5 evaluation uses the test evidence; NEA testing section." } }
  ],
  flashcards: [
    ["What is normal test data?", "Typical valid data the program should accept.", 1],
    ["What is boundary test data?", "Values at the limits of the valid range (and just beyond).", 2],
    ["What is erroneous test data?", "Invalid data that should be rejected.", 3],
    ["For a square-root program, which kind of test data is each of 25, 1 and −8?", "Normal, boundary, erroneous.", 4],
    ["Testing for efficiency means…", "using logical reasoning about how the work grows with the input.", 5],
    ["Columns of a test plan?", "Test number, purpose, data, type, expected result, actual result, pass/fail.", 6],
  ],
  quiz: [
    { q: "For a valid range 1–10, which is boundary data?", opts: ["10", "5", "−3", "\"ten\""], ans: 0, why: "Boundary data sits on the edge of the valid range, and 10 is the largest valid value." },
    { q: "−8 for sqrt of a positive integer is", opts: ["erroneous", "normal", "boundary", "extreme"], ans: 0, why: "A negative number is not valid input for the square root of a positive integer, so it is erroneous data." },
    { q: "The 2018 program given 11 should output", opts: ["Number too large.", "Not a positive number.", "1 10 45…", "nothing"], ans: 0, why: "Above the range." },
    { q: "Efficiency testing by logical reasoning means", opts: ["arguing how the work grows with n", "timing one run on a fast computer", "asking users if it feels quick", "checking the syntax line by line"], ans: 0, why: "You argue from the algorithm's structure how the work grows as n grows, without timing it." }
  ]
};

/* =====================================================================
   4.13.1.5  Evaluation
   ===================================================================== */
C["compsci:4.13.1.5"] = {
  notes: [
    { h: "Evaluation — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.13.1.5)", body: "The solution needs to be **evaluated against the initial requirements**." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Judge a program's test output against what was required", "Evaluate / Test", "1", "AS 2025 P1 Q03.2 (the capture), and Section B questions on the Skeleton Program"],
      ["Evaluation section of the NEA", "—", "4 (NEA)", "each objective met / partly / not, with evidence; independent feedback; improvements"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Evaluating against requirements**.", "**Feedback and improvements**.", "**Criteria you can measure**: kinds of criterion, and how a requirement is traced to its verdict.", "**Writing the evaluation**: worked entries and the mistakes that cost marks.", "**In exam questions**.", "**Exam toolkit**."] },
    cycleFig("Evaluation", "Evaluation closes the loop: it compares the finished solution with the requirements set in analysis."),

    { page: "Evaluating against requirements" },
    { steps: [
      "Take each objective from the requirements specification, in turn.",
      "State whether it is **met**, **partly met** or **not met**.",
      "Give **evidence**: the test number, screenshot or user comment that proves it.",
      "For anything not fully met, explain **why** and how it could be achieved.",
      "Summarise how well the solution solves the original problem."
    ] },
    { table: { head: ["Objective", "Verdict", "Evidence", "Comment"], rows: [
      ["Refuse a booking when a class is full", "Met", "tests 14–16", "boundary (capacity reached) refused with 'Class full'"],
      ["Record a visit within 2 s", "Partly met", "test 22: 3.1 s with 10 000 records", "add an index on MemberID"],
      ["Email a weekly report", "Not met", "—", "the school's mail server blocks the app; export to PDF instead"]
    ] } },
    { callout: { t: "miscon", h: "Evaluation is not testing again", body: "Testing asks \"does each part work?\" Evaluation asks \"does the whole solution meet the requirements and solve the user's problem?\" — using the test results as evidence." } },

    { page: "Feedback and improvements" },
    { kv: [
      ["User feedback", "the client or end users try the solution and comment on each objective — independent evidence"],
      ["Limitations", "what it cannot do or does poorly, honestly stated"],
      ["Improvements", "specific extensions: what, why it would help, how it could be built"],
      ["Maintainability", "how easily it could be changed — modular structure, comments, meaningful names"]
    ] },
    { h: "Ways to gather feedback" },
    { table: { head: ["Method", "What it gives", "Watch out for"], rows: [
      ["Observation", "the user doing real tasks while you note where they hesitate or go wrong", "people act differently when watched"],
      ["Questionnaire", "ratings from several users that can be counted and compared", "leading questions; few replies"],
      ["Interview", "the client's own words on each objective, with reasons", "time; the client may be too polite to criticise"]
    ] } },
    { callout: { t: "tip", h: "Quote the user, then judge", body: ["Feedback is evidence, not a verdict. \"It's quicker than the paper register\" supports an objective on speed; the evaluation still says which objective it supports and how far."] } },

    { page: "Criteria you can measure" },
    { callout: { t: "info", h: "An objective decides whether it can be evaluated", body: ["An evaluation can only be as precise as the objectives written in analysis.", "\"The system must be fast\" cannot be met or missed. \"A member's record is found within 2 seconds with 10 000 members stored\" can."] } },
    { table: { head: ["Kind of criterion", "Measured by", "Example evidence"], rows: [
      ["Functional: does it do the job?", "a test for each required feature", "test 14: a booking for a full class refused"],
      ["Performance", "timing with realistic volumes of data", "search of 10 000 records: 0.4 s"],
      ["Usability", "users completing set tasks; errors made; feedback", "4 of 5 staff booked a class unaided first time"],
      ["Robustness", "erroneous and boundary test data", "letters typed into the age field rejected, no crash"],
      ["Maintainability", "a review of the code's structure", "one subroutine per task, named constants, comments"]
    ] } },
    { fig: { w: 650, h: 176, items: [].concat(
      boxAt(10, 30, 140, 58, "Objective 3", "accent", "set in analysis"),
      boxAt(176, 30, 140, 58, "Tests 14–16", "accent", "planned in design"),
      boxAt(342, 30, 140, 58, "Results", "accent", "from testing"),
      boxAt(508, 30, 132, 58, "Verdict", "accent2", "in evaluation"),
      arrow(150, 59, 176, 59, null, { c: "text2", w: 1.4 }), arrow(316, 59, 342, 59, null, { c: "text2", w: 1.4 }), arrow(482, 59, 508, 59, null, { c: "text2", w: 1.4 }),
      [{ poly: [[574, 88], [574, 130], [80, 130], [80, 90]], close: false, c: "good", w: 1.5, dash: "5 4" },
        { line: [[80, 100], [80, 90]], c: "good", w: 1.5, arrow: true },
        txt(327, 146, "a partly met or unmet objective becomes an improvement: the next iteration, or maintenance", { size: 10.5, c: "good" }),
        txt(80, 16, "refuse a booking when a class is full", { size: 10, c: "text2" }),
        txt(246, 16, "normal · boundary · erroneous", { size: 10, c: "text2" }),
        txt(412, 16, "all three passed", { size: 10, c: "text2" }),
        txt(574, 16, "met, with evidence", { size: 10, c: "accent2" })]
    ), cap: "Tracing one requirement to its verdict. Every objective should be followed the same way, so that each verdict points at the tests that prove it." } },
    { callout: { t: "key", h: "Verdict, evidence, reason", body: ["Every line of an evaluation names the objective, says met, partly met or not met, and points at the evidence.", "Where it falls short, it says why and what would close the gap."] } },

    { page: "Writing the evaluation" },
    { worked: { tag: "variation", title: "Make an objective measurable", q: "A client asks for a booking system that is \"easy to use and quick\". Rewrite this as two objectives that could be evaluated, and state the evidence that would show each one is met.",
      steps: [
        { m: "Usability: a new member of staff can book a member onto a class, without help, in under one minute;", mk: "1" },
        { m: "evidence: observe five staff doing the task and record their times and any errors;", mk: "1" },
        { m: "Performance: the class list for any day is shown within 2 seconds with a year of bookings stored;", mk: "1" },
        { m: "evidence: a timed test on a copy of the database filled with a year of realistic data.", mk: "1" }
      ], result: "Two objectives, each with a number to measure against" } },
    { worked: { tag: "variation", title: "Evaluate a solution from its evidence", q: "A school library system had three objectives: (1) a book is issued by scanning its barcode and a pupil card; (2) the overdue list is produced in under 5 seconds; (3) pupils can reserve a book online. Testing showed (1) passed every test; (2) took 9 seconds with 20 000 loans stored; (3) was not built. The librarian said issuing was \"much faster than before\". Evaluate the solution.",
      steps: [
        { m: "Objective 1 met: every issue test passed, and the librarian's comment confirms it is faster in real use;", mk: "1" },
        { m: "Objective 2 partly met: the list is produced and correct, but 9 s is outside the 5 s target at a realistic volume;", mk: "1" },
        { m: "improvement: index the loans table on its due date, so the query does not read every loan;", mk: "1" },
        { m: "Objective 3 not met: there was no time to build it; it could be added as a web page that writes to the same reservations table;", mk: "1" },
        { m: "Overall: the core problem, slow issuing, is solved; the system is usable now, with two clear next steps.", mk: "1" }
      ], result: "Met · partly met · not met, each with evidence and a next step" } },
    { callout: { t: "warn", h: "Mistakes that cost marks", body: ["Judging objectives that were never set: praise for a feature nobody asked for earns nothing.", "Hiding an objective that was not met. An honest \"not met\" with the reason and a fix earns credit; leaving it out does not.", "Evidence that is only the developer's opinion. Point at a test number, a measurement or the user's words.", "Improvements that are wishes (\"add more features\") rather than a named change and how it would be made."] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "The palindrome program's output", src: "AS June 2025 · P1 Q03.2 · 1 mark",
      q: "A program repeatedly asks \"Enter a word or phrase: \" until S = \"x\"; for each S it compares S[i] with S[Max − i] for i from 0 to Max and outputs \"Palindrome\" if all matched, else \"Not a palindrome\". Test it by entering madam, maam, adam, aam, then x. What must the screen capture show — and what does it reveal when the program is evaluated?",
      steps: [
        { m: "madam → Palindrome; maam → Palindrome; adam → Not a palindrome; aam → Not a palindrome;" },
        { m: "x → Palindrome (the check runs before the loop condition is re-tested) — all in the capture;", mk: "1 mark" },
        { h: "Evaluation", m: "Against the requirement \"x ends the program\", the final output is unwanted: the sentinel is processed as data. It is partly met — fix by testing S = \"x\" before the check (or reading before the loop and at its end)." }
      ], result: "P, P, N, N, then P for x", try: [{ notesOnly: true, predict: { code: "foreach (string s in new[] { \"level\", \"noon\", \"ab\", \"x\" })\n{\n    int max = s.Length - 1;\n    bool same = true;\n    for (int i = 0; i <= max; i++)\n    {\n        if (s[i] != s[max - i]) same = false;\n    }\n    Console.WriteLine(same ? \"Palindrome\" : \"Not a palindrome\");\n}", expect: "Palindrome\nPalindrome\nNot a palindrome\nPalindrome", cap: "**Your turn.** The check on level, noon, ab and the sentinel x. What are the four lines — and which one should not be there?" } }] } },
    { worked: { tag: "variation", title: "Evaluate one objective", q: "Objective: \"Accept a whole number from 1 to 10, rejecting others with a message.\" The 2018 test plan's evidence: −3 and 11 rejected with messages; 10 and 1 accepted. Write the evaluation entry.",
      steps: [
        { m: "Verdict: met.", mk: "1" },
        { m: "Evidence: tests 1–4 — erroneous (−3), just-out boundary (11) and both valid boundaries (1, 10).", mk: "1" },
        { m: "Limitation: a non-integer such as \"abc\" was not tested and would crash a program using int.Parse — add a type check.", mk: "1" }
      ], result: "Met, with evidence and a limitation" } },
    { worked: { tag: "variation", title: "Suggest an improvement", q: "The GCF program (repeated subtraction) meets its requirements but a user reports it 'hangs' for 1 and 1 000 000. Evaluate and suggest an improvement.",
      steps: [
        { m: "Requirement met for correctness, not for responsiveness: GCF(1, n) needs n − 1 subtractions.", mk: "1" },
        { m: "Improve with Euclid's algorithm using MOD — O(log n) steps.", mk: "1" },
        { m: "Re-test with the same data plus the large case, and confirm with the user.", mk: "1" }
      ], result: "Replace subtraction with MOD" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Evaluate the solution", "Each requirement → verdict → evidence → improvement."],
      ["Suggest improvements", "Specific: what, why it helps, how."],
      ["Why measurable objectives?", "So each can be judged met or not met against a number set in analysis."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"VEIL\"", body: "For every objective: **V**erdict · **E**vidence · **I**mprovement · **L**imitation." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Evaluating without referring to the original requirements.", "\"It works well\" with no evidence.", "Vague improvements (\"make it better\")."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.13.1.1 the requirements are the yardstick; 4.13.1.4 test evidence; 4.8.1 evaluating wider impacts; NEA evaluation section." } }
  ],
  flashcards: [
    ["What is a solution evaluated against?", "The initial requirements."],
    ["Three verdicts for an objective?", "Met, partly met, not met."],
    ["What must back each verdict?", "Evidence — test results, screenshots, user feedback."],
    ["How does evaluation differ from testing?", "Testing checks parts work; evaluation judges whether the whole meets the requirements."],
    ["Why get user feedback?", "Independent evidence that the solution meets their needs."],
    ["Palindrome program with 'x'?", "Outputs 'Palindrome' — the sentinel is processed as data."],
    ["What three things does a good improvement state?", "What it is, why it helps and how it could be done."],
    ["What does the VEIL mnemonic for an evaluation stand for?", "Verdict, Evidence, Improvement, Limitation."]
  ],
  quiz: [
    { q: "Evaluation compares the solution with", opts: ["the initial requirements", "the source code length", "other students' work", "the test data types"], ans: 0, why: "An evaluation judges how well the finished solution meets the original requirements." },
    { q: "\"It works well\" as an evaluation is weak because", opts: ["it gives no evidence", "it is too long", "it uses jargon", "it names a requirement"], ans: 0, why: "A claim like that gives no evidence; a good evaluation points to tests, measures or user feedback." },
    { q: "The 2025 program prints 'Palindrome' for x because", opts: ["it checks the input before re-testing the loop condition", "x is a palindrome by design, so the output is right", "of a syntax error in the loop's condition", "the loop never runs, so the default message is printed"], ans: 0, why: "Sentinel processed." },
    { q: "Which belongs in an evaluation?", opts: ["objectives not met and why", "a transcript of the first interview", "the hierarchy chart for the design", "a list of every variable name"], ans: 0, why: "Honest verdicts." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
