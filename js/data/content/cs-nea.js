/* Kurenai OS — the NEA (AQA 7517 component 3, the computing practical
   project) as a PROJECT COMPANION, not as exam revision. The NEA is not
   examined on paper, so these leaves carry no exam items: each is a guide
   to one report section built from AQA's own documents — the specification
   4.14 marking criteria and Tables 1–2, and the NEA guidance (V3, Nov 2019)
   — with the level ladder decoded, what to include (AQA's core / desirable /
   supplementary lists), how the supplied exemplar (an endless-runner game,
   "Getaway Driver", written in Java) tackled it, C# templates for a
   running example (a revision planner), a hand-in checklist and pitfalls.
   Every C# listing was compiled and run under .NET 10 (the unit tests with
   xUnit, the SQL against SQLite). Two working tools ship with it in
   js/labs/nea-tools.js: the objective checker (NEA.1) and the mark
   estimator (NEA.3). */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

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
/* the five sections as one 75-mark bar, the current one lit */
function marksBar(on) {
  var secs = [["Analysis", 9], ["Design", 12], ["Technical solution", 42], ["Testing", 8], ["Evaluation", 4]];
  var x = 20, sc = 8, it = [];
  secs.forEach(function (s, i) {
    var w = s[1] * sc, lit = s[0] === on;
    it.push({ poly: [[x, 30], [x + w, 30], [x + w, 70], [x, 70]], fill: lit ? "accent2" : "accent", alpha: lit ? 0.45 : 0.14, c: lit ? "accent2" : "accent", w: 1.4 });
    it.push(txt(x + w / 2, 50, String(s[1]), { b: true, size: 12, c: "text" }));
    it.push(txt(x + w / 2, i % 2 ? 100 : 86, s[0], { size: 10.5, c: lit ? "accent2" : "muted" }));
    x += w;
  });
  it.push(txt(320, 16, "75 marks · 20% of the A-level", { b: true, c: "text2" }));
  return { fig: { w: 640, h: 112, items: it, cap: on ? on + " in the whole report — the bar is to scale." : "The 75 marks to scale: the program itself is worth more than all the documentation together." } };
}

var NOT_EXAM = { callout: { t: "tip", h: "How this section works", body: "There is no written exam on the NEA, so there are no past-paper questions here. Instead: what earns the marks, what to include, how the exemplar did it, C# you can adapt, and a hand-in check. The worked cards are judgements you will have to make on your own project." } };

/* =====================================================================
   NEA.0  Choosing and planning the project
   ===================================================================== */
C["compsci:NEA.0"] = {
  notes: [
    { h: "Choosing and planning the project — the project guide" },
    { callout: { t: "info", h: "Key idea", body: "The NEA is a programming project of your choice, written up in five sections and marked by your teacher (moderated by AQA) out of **75 — 20% of the A-level**. AQA recommends about **50 hours** of lesson time." } },
    marksBar(null),
    NOT_EXAM,
    { h: "How this guide is organised" },
    { ol: ["**What makes a good project**: interest, knowledge, A-level standard.", "**Is it of A-level standard?** AQA's own examples.", "**The critical path and an agile plan**.", "**A timeline**.", "**The exemplar's choice**.", "**Decisions you will face**.", "**Before you commit**."] },

    { page: "What makes a good project" },
    { kv: [
      ["Interest", "you will live with it for months — choose something you want to finish"],
      ["Knowledge", "a field you know, or can find out about, with a real user or supervisor you can talk to"],
      ["Technical headroom", "a solution that NEEDS A-level techniques (Table 1 Group A) — not one where they are bolted on"],
      ["Different from your classmates'", "projects in one centre must be sufficiently different so no one's work informs another's"],
      ["Achievable", "the core works by spring; extensions are labelled as extension objectives"]
    ] },
    { table: { head: ["Type", "AQA's examples", "Where the Group A techniques come from"], rows: [
      ["Solution to a problem", "data processing for an organisation, rota / scheduling, route finding, a game, a database-driven website, a mobile app, a control system", "linked tables and cross-table SQL, optimisation algorithms, graphs, complex OOP, client–server"],
      ["Investigation", "machine-learning algorithms, 3-D rendering, live data feeds, neural networks, large public datasets, simulations", "the algorithms and mathematical models themselves; testing becomes experiment"]
    ] } },

    { page: "Is it of A-level standard?" },
    { callout: { t: "info", h: "Key idea", body: "A project that is **not** of A-level standard is marked **two levels down** in every section except the technical solution (two marks down in Evaluation). AQA's guidance gives four examples:" } },
    { table: { head: ["Idea", "Not A-level as it stands", "What makes it A-level", "What reaches higher marks"], rows: [
      ["Noughts and crosses", "validates moves, checks for a winner", "a computer player using a game tree / minimax", "a richer game with advanced AI, graphics or networking"],
      ["Rota system", "the user does the matching", "the program matches staff to shifts", "the algorithm weighs holidays, qualifications, desired hours"],
      ["Encryption", "a Caesar cipher demo", "several ciphers, a graphical cipher wheel, load / save", "code-cracking by frequency analysis or dictionary matching"],
      ["Quiz", "multiple-choice questions in one table, scored", "logins, saved scores, questions edited in the program", "analysing responses to tailor future quizzes; networked play over TCP/IP"]
    ] } },
    { callout: { t: "miscon", h: "Complexity comes from PROCESSING", body: "A login system, colourful screens or lots of menus do not make a project A-level. What does: the program itself making non-trivial decisions — optimising, searching, scheduling, simulating, analysing — over a sensible data model." } },

    { page: "The critical path and an agile plan" },
    { callout: { t: "def", h: "Critical path", body: "The part of the project that everything else depends on for a working system (or a complete investigation result). Tackle it FIRST — prototype it early — and leave ancillary features such as registration and login until it works." } },
    { fig: { w: 640, h: 170, items: [].concat(
      boxAt(20, 20, 140, 50, "Prototype core", "accent2", "the hard algorithm"),
      boxAt(180, 20, 140, 50, "Freeze objectives", "accent", "agreed with teacher"),
      boxAt(340, 20, 140, 50, "Iterate", "accent", "design · code · test"),
      boxAt(500, 20, 120, 50, "Write up", "good", "5 sections"),
      arrow(160, 45, 180, 45, null, { c: "text2" }), arrow(320, 45, 340, 45, null, { c: "text2" }), arrow(480, 45, 500, 45, null, { c: "text2" }),
      [{ poly: [[440, 70], [440, 100], [380, 100], [380, 72]], close: false, c: "good", w: 1.5, dash: "5 4" }, txt(410, 116, "each feature: design → code → test → feedback", { size: 10.5, c: "good" }),
       txt(320, 152, "AQA: designing everything before coding is \"outdated and inappropriate\"", { size: 10.5 })]
    ), cap: "The order of WORK. The report is still presented Analysis → Design → Technical solution → Testing → Evaluation." } },

    { page: "A timeline" },
    { table: { head: ["When", "Work", "Evidence to keep"], rows: [
      ["End of Year 12", "choose the problem; find a user / supervisor; first interview", "interview notes; problem statement"],
      ["Summer", "research existing solutions; prototype the critical path", "screenshots of the prototype; what it proved"],
      ["Early Year 13", "numbered measurable objectives — then FREEZE them with your teacher", "objective list v1; feedback on the prototype"],
      ["Autumn", "iterate: design, code, test one feature at a time", "design diagrams as they settle; test evidence as you go"],
      ["Winter", "complete the core; extension objectives only if time allows", "code listing sections; test table"],
      ["Spring", "final testing; independent feedback; evaluation; assemble the report", "feedback (appendix); evaluation table"],
      ["By 15 May", "teacher marks; sample sent to AQA", "contents page, page numbers, sections in order"]
    ] } },

    { page: "The exemplar's choice" },
    { callout: { t: "info", h: "Key idea", body: "The supplied exemplar is **Getaway Driver**, a Java endless-runner game written for the student and their friends:" } },
    { ul: [
      "**Why it is A-level**: objects generated dynamically from an OOP model (vehicles, police, tanks, helicopters, pick-ups) with inheritance, polymorphism, interfaces and overloading; a difficulty model (a \"Wanted Level\" driven by score); collision and lane-finding algorithms; double buffering.",
      "**A real audience**: a survey of sixty peers, a prototype tested on friends, research into comparable games — so the objectives come from dialogue, not invention.",
      "**Scope control**: an arcade mode first, then a campaign mode of five levels — the critical path (driving, traffic, collisions) before the extras (garage, heists, tutorial)."
    ] },
    { callout: { t: "tip", h: "A game is fine — if the PROCESSING is the point", body: "Graphics alone would not carry it. Getaway Driver's marks come from the object model and the algorithms deciding what spawns, where, and how law enforcement escalates." } },

    { page: "Decisions you will face" },
    { worked: { tag: "example", title: "Make a weak idea A-level", q: "Your first idea: \"a revision app where I type questions and answers and it quizzes me\". Make it A-level standard and say where higher technical marks would come from.",
      steps: [
        { h: "As stated", m: "One table of questions, read in order, scored — AQA's own Quiz example of a project that is not A-level." },
        { h: "A-level", m: "Users log in; every attempt is stored (Student, Topic, Question, Attempt — several linked tables); questions are edited in the program." },
        { h: "Higher marks", m: "The PROGRAM decides what to revise: a spaced-repetition scheduler computes each topic's next review date from past grades; a priority queue (your own heap) orders today's work; prerequisite topics come first by a recursive graph traversal; progress statistics by aggregate SQL." }
      ], result: "The scheduler is the critical path" } },
    { worked: { tag: "example", title: "Problem or investigation?", q: "You want to compare how well three path-finding algorithms (Dijkstra, A*, greedy best-first) cope with mazes of increasing size. Which kind of project is it, and what changes in the write-up?",
      steps: [
        { m: "An investigation — the outcome (which is faster, by how much) is not known in advance." },
        { m: "You need a supervisor with some knowledge of the area instead of an end user; objectives describe the AREAS of investigation and the measurements to take." },
        { m: "Testing becomes experiment: known-answer tests for each algorithm, then runs whose outcomes are reported and explained rather than predicted." }
      ], result: "Investigation" } },

    { page: "Before you commit" },
    { ul: [
      "☐ I can name a real user, client or supervisor and have spoken to them.",
      "☐ The core of the solution is a PROCESS the program performs, not something the user does.",
      "☐ At least one Group A technique is needed by the problem itself.",
      "☐ I can describe the critical path in one sentence — and I have a plan to prototype it first.",
      "☐ It is different from my classmates' projects.",
      "☐ Extensions beyond A-level are labelled as extension objectives."
    ] },
    { callout: { t: "warn", h: "Pitfalls", body: ["Choosing for the graphics and finding no algorithm to write.", "Spending the autumn on login, settings and menus.", "Designing every screen before writing a line of code.", "No real user — so no dialogue, so Analysis caps at level 1–2."] } },
    { callout: { t: "tip", h: "Links", body: "4.13.1 the systematic approach (analysis to evaluation, prototyping, the critical path); NEA.1–NEA.5 each section in depth; the NEA mark estimator lab." } }
  ],
  flashcards: [
    ["NEA marks and weighting?", "75 marks, 20% of the A-level."],
    ["The five sections and their marks?", "Analysis 9, Documented design 12, Technical solution 42, Testing 8, Evaluation 4."],
    ["How are the 42 technical-solution marks split?", "Completeness of solution 15, Techniques used 27."],
    ["Penalty for a project not of A-level standard?", "Two levels down in every section except the technical solution (two marks in Evaluation)."],
    ["Critical path?", "The part everything else depends on for a working system — prototype and build it first."],
    ["Does AQA expect a waterfall life cycle?", "No — the section order is for presentation; development should be iterative/agile."],
    ["What made AQA's quiz example A-level?", "Logins, saved scores and in-program editing; tailoring future quizzes from analysed responses reaches higher marks."],
    ["When are objectives frozen?", "Early, once the critical path is prototyped and judged achievable, by agreement with the teacher."],
    ["Recommended lesson time?", "About 50 hours."]
  ],
  quiz: [
    { q: "Which section carries the most marks?", opts: ["Technical solution (42)", "Design (12)", "Analysis (9)", "Testing (8)"], ans: 0, why: "56% of the NEA." },
    { q: "Noughts and crosses becomes A-level standard by adding", opts: ["a minimax computer player", "colours", "a login", "sound"], ans: 0, why: "AQA guidance, Appendix B." },
    { q: "What should you build first?", opts: ["the critical path", "the login system", "the settings screen", "the help page"], ans: 0, why: "AQA guidance." },
    { q: "A not-A-level project is penalised in", opts: ["every section except the technical solution", "only the technical solution", "nothing", "only evaluation"], ans: 0, why: "Spec 4.14.4." }
  ],
  sims: ["nea-marks"]
};

/* =====================================================================
   NEA.1  Analysis
   ===================================================================== */
C["compsci:NEA.1"] = {
  notes: [
    { h: "Analysis — the project guide" },
    { callout: { t: "info", h: "Key idea", body: "**9 marks (AO2b)**. Analysis is where you understand the problem well enough to write the **objectives** — the yardstick every later section is measured against: Completeness is judged against them, Testing evidences them, Evaluation discusses them." } },
    marksBar("Analysis"),
    NOT_EXAM,
    { h: "How this guide is organised" },
    { ol: ["**The level ladder**.", "**What to include**.", "**Writing objectives**.", "**Modelling the problem**.", "**How the exemplar did it**.", "**Decisions you will face**.", "**Before you hand it in**."] },

    { page: "The level ladder" },
    { table: { head: ["Level", "Marks", "AQA's descriptor", "In practice"], rows: [
      ["3", "7–9", "Fully or nearly fully scoped analysis of a real problem, understandable by a third party; ALL functionality in measurable, appropriate, specific objectives; requirements from DIALOGUE with the intended users; problem well modelled", "A stranger could build it from your objectives; you can show the conversations they came from; there is an E-R / DFD / graph model the design uses"],
      ["2", "4–6", "Well scoped with minor omissions; MOST requirements in mainly measurable objectives; requirements mainly from dialogue; usefully modelled", "A few objectives are vague, or one feature appears only in the background section"],
      ["1", "1–3", "Partly scoped; some objectives, not all measurable or appropriate; some attempt at dialogue; partly modelled", "\"The system should be easy to use\"; no evidence of a user"]
    ] } },
    { callout: { t: "def", h: "\"Appropriate\" objectives", body: "AQA defines it: single-purpose and at a level of detail that is without ambiguity. And they must cover ALL the required functionality — an objective list that leaves out the core processing undermines Completeness later." } },

    { page: "What to include" },
    { table: { head: ["Tier", "Item"], rows: [
      ["**Core**", "Background to the project · evidence of analysis (research, dialogue) · the numbered set of objectives"],
      ["**Desirable**", "Current system (if any) · the end user / supervisor and prospective users · modelling of the problem (initial DFD, data dictionary, E-R model) · research around the investigation area"],
      ["**Supplementary**", "Proposed solution details (hardware / software) · acceptable limitations agreed with the user · data volumes · a log of the research"]
    ] } },
    { kv: [
      ["Problem statement", "the problem area and the SPECIFIC problem being solved"],
      ["How you researched it", "interviews, questionnaires, existing software, books, websites, prototyping — evidence in an appendix, referenced"],
      ["Who it is for", "the end user / client, or the supervisor for an investigation"],
      ["Background", "enough for a third party to understand the problem"],
      ["Objectives", "numbered, measurable, single-purpose; sub-numbered for detail (3, 3.1, 3.2)"],
      ["Modelling", "anything that informs the design: E-R model, graph/network model, DFD, state diagram, formulae"]
    ] },

    { page: "Writing objectives" },
    { callout: { t: "info", h: "Key idea", body: "AQA's guidance contrasts two real objective lists. The weak one (a supermarket recommender):" } },
    { table: { head: ["AQA's weak objective", "Problem", "Rewritten"], rows: [
      ["Users must find it easy to work through the system", "not measurable — and not about the solution's function", "(drop it; usability belongs in evaluation feedback)"],
      ["Secure logging in procedure", "what is secure? what is stored?", "Passwords are stored only as salted SHA-256 hashes; three failed attempts lock the account for 5 minutes"],
      ["The system should show any recommendation of the products, depending on the data produced by the algorithm", "\"the algorithm\" was never defined in the analysis", "When an item is added to the basket, show the 3 products most often bought in the same transactions as it, from the last 90 days of sales"],
      ["Random product ID generator should create a random and unique Product ID", "nearly there", "New products receive a random 6-digit ID not already in the Product table"]
    ] } },
    { callout: { t: "info", h: "Key idea", body: "The strong list (a puzzle quiz) nests detail under each feature: **3** the puzzle; **3.1** the answer is calculated from the random question and shown on a 16-square grid; **3.4** a tile next to the empty square moves when clicked… Every line can be tested." } },
    { steps: [
      "Start from what the program must DO with data — store, calculate, decide, display.",
      "One purpose per objective; put detail in sub-objectives (5, 5.1, 5.2).",
      "Make it checkable: a number, a rule, a range, a named table or field.",
      "Cover the core processing in the most detail — that is where Completeness and Techniques marks are earned.",
      "Label anything beyond A-level as an **extension objective** — missing it then cannot cost Completeness marks."
    ] },
    { diagram: "nea-objectives" },

    { page: "Modelling the problem" },
    { fig: { w: 640, h: 150, items: [].concat(
      boxAt(20, 20, 130, 44, "Student", "accent"), boxAt(255, 20, 130, 44, "Review", "accent2"), boxAt(490, 20, 130, 44, "Topic", "accent"),
      [{ line: [[150, 42], [255, 42]], c: "text2", w: 1.6 }, { line: [[240, 42], [255, 33]], c: "text2", w: 1.6 }, { line: [[240, 42], [255, 51]], c: "text2", w: 1.6 },
       { line: [[385, 42], [490, 42]], c: "text2", w: 1.6 }, { line: [[400, 42], [385, 33]], c: "text2", w: 1.6 }, { line: [[400, 42], [385, 51]], c: "text2", w: 1.6 },
       { poly: [[530, 64], [530, 100], [590, 100], [590, 66]], close: false, c: "text2", w: 1.6 }, { line: [[590, 76], [590, 65]], c: "text2", w: 1.6, arrow: true },
       txt(560, 114, "prerequisite of", { size: 10.5 }),
       txt(300, 136, "Review(ReviewID, StudentID, TopicID, Grade, DueDate) — the scheduler's data", { size: 10.5, c: "accent2" })]
    ), cap: "An analysis-stage E-R model for the revision planner. The topic-to-topic link makes the prerequisites a GRAPH — which tells the design a graph traversal is needed." } },
    { table: { head: ["Problem type", "Model to include"], rows: [
      ["Data processing", "E-R model, data dictionary, DFD of the current system"],
      ["Game / simulation", "state diagram of game states, entity life cycles, the formulae of the model"],
      ["Route finding / networks", "graph model with weights"],
      ["Investigation", "the mathematical model or algorithm family under study"]
    ] } },

    { page: "How the exemplar did it" },
    { table: { head: ["Exemplar section", "What it does", "Credit it earns", "Could be stronger"], rows: [
      ["Research table", "dated activities — a survey of sixty peers, market research, a prototype, research into comparable games — each with its main findings", "evidence of DIALOGUE and research, referenced", "quote the user's words that each objective came from"],
      ["Prospective end users", "the student and their friends; why competitive scoring matters to them", "states who it is for", "a named representative to give feedback at the end"],
      ["Objectives", "five headline objectives, then nested detail: 7 a–c with scores for each Wanted Level (0–999 one star … 4000+ five stars) and what each law-enforcement unit does", "measurable, single-purpose sub-objectives", "a few top-level ones (\"a tutorial to teach the user\") need measurable sub-points"],
      ["Analysis data dictionary and data flow", "variables, types and examples; a data-flow diagram", "problem modelled for design", "—"],
      ["Acceptable limitations", "what will not be built", "scope agreed", "—"]
    ] } },

    { page: "Decisions you will face" },
    { worked: { tag: "example", title: "Rewrite three objectives", q: "Rewrite as measurable, single-purpose objectives: (a) \"The game should get harder\" (b) \"The app should be secure\" (c) \"Users can manage their topics and see their progress\".",
      steps: [
        { m: "(a) The traffic speed increases by 10% each time the score passes a multiple of 1000, up to a maximum of 5 increases.", mk: "measurable" },
        { m: "(b) Passwords must be stored only as salted SHA-256 hashes, never as plain text. (One security property per objective.)", mk: "single purpose" },
        { m: "(c) Split it: 4.1 A user can add, rename and delete their topics. 4.2 The progress screen shows, for each topic, the percentage of reviews graded 3 or above in the last 30 days.", mk: "split" }
      ], result: "Numbers, rules and named data; one job each" } },
    { worked: { tag: "example", title: "Evidence of dialogue", q: "Your client is your revision-club teacher. What evidence of dialogue would support a level-3 Analysis, and where does it go?",
      steps: [
        { m: "Interview notes or a transcript with dated questions and answers — in an appendix, referenced from the analysis." },
        { m: "In the analysis: each objective traceable to the client's words (\"the teacher wants weak topics revisited first → objective 6\")." },
        { m: "Prototype feedback: a screenshot of the first scheduler and the client's comments, which changed objective 6.2." }
      ], result: "Quoted, dated, traceable to objectives" } },

    { page: "Before you hand it in" },
    { ul: [
      "☐ A third party could explain the problem after reading the first page.",
      "☐ I say how I researched it and point to the evidence in an appendix.",
      "☐ The user / client / supervisor is named, and their needs shaped the objectives.",
      "☐ Every objective is numbered, measurable and single-purpose — checked with the objective checker.",
      "☐ The core processing has the most detailed objectives.",
      "☐ Extension objectives are labelled.",
      "☐ There is a model the design will use (E-R, DFD, graph, state diagram, formulae)."
    ] },
    { callout: { t: "warn", h: "Pitfalls", body: ["Objectives about feelings (easy, intuitive, nice).", "The core algorithm mentioned in the background but missing from the objectives.", "Objectives so easy they are trivially met — the assessor will judge against a reasonable set instead.", "Pages of questionnaire results that no objective refers to."] } },
    { callout: { t: "tip", h: "Links", body: "4.13.1.1 analysis; 4.10.1 E-R models; 4.4.1.3 abstraction; NEA.2 design builds on the model; NEA.5 evaluation reuses the objective list word for word." } }
  ],
  flashcards: [
    ["Analysis marks and AO?", "9 marks, AO2b, three levels."],
    ["What does 'appropriate' mean for objectives?", "Single-purpose and detailed enough to be unambiguous."],
    ["Level 3 Analysis needs requirements arrived at by…", "dialogue with the intended users (or recipients of an investigation's outcomes)."],
    ["Core items of an Analysis?", "Background, evidence of analysis, the set of objectives."],
    ["Name four kinds of model for the analysis.", "E-R model, graph/network model, DFD, state diagram (also formulae, data dictionary)."],
    ["What is an extension objective?", "One beyond A-level demands, labelled so that missing it does not cost Completeness marks."],
    ["Where does supporting evidence (survey, interview) go?", "An appendix, referenced from the analysis."],
    ["Why did AQA criticise 'the system should show any recommendation… depending on the algorithm'?", "The algorithm was never defined in the analysis."]
  ],
  quiz: [
    { q: "Which is a well-formed objective?", opts: ["Three failed logins lock the account for 5 minutes", "The login should be secure", "Users should find it easy", "The system should be fast"], ans: 0, why: "Measurable, single purpose." },
    { q: "Requirements for level 3 must come from", opts: ["dialogue with intended users", "the teacher's list", "another student", "the internet"], ans: 0, why: "Descriptor." },
    { q: "An E-R model in the analysis is", opts: ["modelling that informs design", "the design itself", "testing", "not allowed"], ans: 0, why: "Spec 4.14.5.1." },
    { q: "If your objectives are too easy, the assessor", opts: ["judges against a reasonable set instead", "gives full marks", "ignores completeness", "fails the project"], ans: 0, why: "AQA guidance 2.3.1." }
  ]
};

/* =====================================================================
   NEA.2  Documented design
   ===================================================================== */
C["compsci:NEA.2"] = {
  notes: [
    { h: "Documented design — the project guide" },
    { callout: { t: "info", h: "Key idea", body: "**12 marks (AO3a)**. The design must let a third party understand how the **key aspects** of the solution are structured — without reading the code. It is also where you show off the sophistication of the solution." } },
    marksBar("Design"),
    NOT_EXAM,
    { h: "How this guide is organised" },
    { ol: ["**The level ladder**.", "**What to include**.", "**The high-level overview** — a class diagram in C#.", "**Algorithms and data structures**.", "**Database, queries and files**.", "**Interface, security and integrity**.", "**How the exemplar did it**.", "**Before you hand it in**."] },

    { page: "The level ladder" },
    { table: { head: ["Level", "Marks", "AQA's descriptor"], rows: [
      ["4", "10–12", "Fully or nearly fully articulated design for a real problem, describing how ALL or almost all key aspects are structured"],
      ["3", "7–9", "Adequately articulated — how MOST key aspects are structured"],
      ["2", "4–6", "Partially articulated — how SOME aspects are structured"],
      ["1", "1–3", "Inadequate — hard to picture the structure without reading the program"]
    ] } },
    { callout: { t: "warn", h: "\"Key aspects\" means the PROCESSING", body: "AQA's own example: a planetary-orbit simulator whose design shows the screens but not the equations and update algorithm is NOT fully articulated. Design the hard parts in the most detail." } },
    { callout: { t: "tip", h: "Design can be written after coding", body: "AQA accepts design produced before, during or after coding. Plan data structures before you code; document other parts as they settle. The assessor checks the design matches the code (e.g. class methods match the class diagram)." } },

    { page: "What to include" },
    { table: { head: ["Tier", "Item"], rows: [
      ["**Core**", "High-level overview · description of algorithms · description of data structures · database design · design of the user interface"],
      ["**Desirable**", "Hardware design / selection (only if relevant, e.g. Arduino)"],
      ["**Supplementary**", "System security and integrity of data · for an investigation, a log of stages and how they affected the coding"]
    ] } },
    { table: { head: ["Evidence", "Use it for"], rows: [
      ["Hierarchy / structure chart", "how the program decomposes into modules"],
      ["Class diagram (UML)", "an OOP solution: classes, attributes, methods, inheritance, composition, interfaces"],
      ["DFD / system flowchart", "how data moves between processes and stores"],
      ["Pseudo-code / structured English", "each key algorithm"],
      ["Data dictionary", "fields, types, sizes, validation"],
      ["E-R diagram and relations", "the database, with keys"],
      ["SQL samples", "the queries that show sophistication (joins, aggregates, parameters)"],
      ["Explained screenshots", "the interface (real screenshots are acceptable)"]
    ] } },

    { page: "The high-level overview" },
    { fig: (function () {
      var it = [];
      function cls(x, y, w, name, attrs, ops, col) {
        var h = 24 + (attrs.length + ops.length) * 15 + 14;
        it.push({ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.12, c: col || "accent", w: 1.5 });
        it.push(txt(x + w / 2, y + 12, name, { b: true, size: 11.5, c: "text" }));
        it.push({ line: [[x, y + 24], [x + w, y + 24]], c: col || "accent", w: 1 });
        attrs.forEach(function (a, i) { it.push(txt(x + 6, y + 36 + i * 15, a, { size: 10, c: "text2", pos: "e", off: 0 })); });
        var oy = y + 30 + attrs.length * 15;
        it.push({ line: [[x, oy], [x + w, oy]], c: col || "accent", w: 1 });
        ops.forEach(function (o, i) { it.push(txt(x + 6, oy + 12 + i * 15, o, { size: 10, c: "text2", pos: "e", off: 0 })); });
      }
      cls(10, 20, 215, "«interface» IScheduler", [], ["+ NextInterval(last, ease, grade): int"], "accent2");
      cls(10, 125, 215, "SpacedRepetitionScheduler", ["- FirstInterval = 1 (const)", "- PassGrade = 3 (const)"], ["+ NextInterval(…): int"]);
      cls(245, 20, 180, "Topic", ["+ TopicID: int", "+ Title: string", "+ Prerequisites: List<Topic>"], []);
      cls(245, 145, 180, "Review", ["+ Grade: int", "+ DueDate: DateOnly"], ["+ IsDue(today): bool"]);
      cls(445, 20, 185, "MinHeap<T>", ["- items: List<(T, int)>"], ["+ Enqueue(item, priority)", "+ Dequeue(): T"], "good");
      cls(445, 145, 185, "ReviewRepository", ["- connectionString"], ["+ TopicsDue(id, day)", "+ Save(review)"], "accent3");
      it.push({ line: [[117, 125], [117, 72]], c: "text2", w: 1.4, dash: "5 4", arrow: true });
      it.push(txt(160, 100, "implements", { size: 10, c: "muted" }));
      it.push({ line: [[335, 145], [335, 104]], c: "text2", w: 1.4 }, txt(366, 126, "about a", { size: 10, c: "muted" }));
      return { w: 640, h: 235, items: it, cap: "A class diagram for the revision planner: an interface the scheduler implements (so another algorithm can be swapped in), the entities, a generic data structure, and a repository that owns all the SQL." };
    })() },
    { code: { lang: "csharp", src: "public interface IScheduler\n{\n    int NextInterval(int lastInterval, double ease, int grade);\n}\n\npublic sealed class SpacedRepetitionScheduler : IScheduler\n{\n    private const int FirstInterval = 1, SecondInterval = 6, PassGrade = 3;\n\n    public int NextInterval(int lastInterval, double ease, int grade)\n    {\n        if (grade < PassGrade) return FirstInterval;          // forgotten: start again\n        if (lastInterval <= FirstInterval) return SecondInterval;\n        return (int)Math.Round(lastInterval * ease);\n    }\n}", cap: "The design's class diagram becomes code with the same names — which is what the assessor checks." } },

    { page: "Algorithms and data structures" },
    { callout: { t: "info", h: "Key idea", body: "For each KEY algorithm: what it is for, pseudo-code (or structured English), and the data structure it works on. Choose the ones that show sophistication — they are what Techniques marks are for." } },
    { code: { lang: "pseudo", src: "FUNCTION StudyOrder(goal)\n  order <- empty list ; seen <- empty set\n  Visit(goal)\n  RETURN order\n\nPROCEDURE Visit(topic)\n  IF topic IN seen THEN RETURN            # base case\n  ADD topic TO seen\n  FOR EACH need IN Prerequisites(topic)\n    Visit(need)                           # recursive case\n  ENDFOR\n  APPEND topic TO order                   # after everything it needs\nENDPROCEDURE", cap: "A recursive depth-first traversal of the prerequisite graph — Group A (graph traversal, recursion)." } },
    { table: { head: ["Data structure", "Holds", "Why this one"], rows: [
      ["MinHeap<Topic> (own)", "today's due topics keyed by urgency", "O(log n) insert and remove-min; the most urgent topic always first"],
      ["Dictionary<int, List<int>>", "prerequisite adjacency lists", "O(1) look-up of a topic's prerequisites"],
      ["HashSet<int>", "topics already visited", "O(1) membership test stops revisiting"]
    ] } },

    { page: "Database, queries and files" },
    { code: { lang: "sql", src: "CREATE TABLE Student (StudentID INTEGER PRIMARY KEY, Name TEXT NOT NULL);\nCREATE TABLE Topic   (TopicID INTEGER PRIMARY KEY, Title TEXT NOT NULL);\nCREATE TABLE Review  (ReviewID INTEGER PRIMARY KEY,\n  StudentID INTEGER NOT NULL REFERENCES Student(StudentID),\n  TopicID   INTEGER NOT NULL REFERENCES Topic(TopicID),\n  Grade INTEGER NOT NULL CHECK (Grade BETWEEN 0 AND 5),\n  DueDate TEXT NOT NULL);", cap: "A user-written DDL script is itself a Group A item; the CHECK constraint is integrity designed in." } },
    { code: { lang: "sql", src: "-- topics due today for one student (cross-table, parameterised)\nSELECT Topic.Title, Review.DueDate\nFROM Review INNER JOIN Topic ON Review.TopicID = Topic.TopicID\nWHERE Review.StudentID = $student AND Review.DueDate <= $today\nORDER BY Review.DueDate, Topic.Title;\n\n-- weakest topics: an aggregate over all reviews\nSELECT Topic.Title, AVG(Review.Grade) AS MeanGrade, COUNT(*) AS Reviews\nFROM Review INNER JOIN Topic ON Review.TopicID = Topic.TopicID\nWHERE Review.StudentID = $student\nGROUP BY Topic.Title\nORDER BY MeanGrade ASC;", cap: "Show a few queries like these, each explained — cross-table, parameterised and aggregate SQL are all Group A." } },

    { page: "Interface, security and integrity" },
    { kv: [
      ["Interface", "a small number of annotated screenshots or mock-ups: what each control does, what is validated, which objective it serves"],
      ["Navigation", "a screen map / menu hierarchy (the exemplar's menu tree is a good model)"],
      ["Security", "e.g. salted password hashes; parameterised queries against SQL injection"],
      ["Integrity", "e.g. foreign keys with cascading delete so removing a student removes their reviews (referential integrity); CHECK constraints"]
    ] },

    { page: "How the exemplar did it" },
    { table: { head: ["Exemplar section", "What it does", "Credit it earns"], rows: [
      ["Overall system design and modular structure", "the menu system drawn as a hierarchy of real screenshots with arrows between screens", "high-level overview; interface navigation"],
      ["Design data dictionary (22 classes)", "each class's attributes with type, purpose and example value — Main, Game, CampaignGame, Vehicle, PoliceCar, Helicopter, PickUp…", "data structures fully described"],
      ["Class structure diagram", "inheritance between Game / ArcadeGame / CampaignGame and the vehicle hierarchy", "the OOP model articulated"],
      ["Complex code and algorithms", "inheritance and polymorphism, interfaces (Runnable, KeyListener), user-defined data objects, ten user-defined algorithms (collisions, Wanted Level, the next vehicle in a lane, double buffering…) with code and explanation", "key processing articulated — the level-4 evidence"],
      ["Security and integrity of data", "a short section", "supplementary"]
    ] } },
    { callout: { t: "tip", h: "What to copy from it", body: "The exemplar gives EVERY non-trivial algorithm a heading, a paragraph on what it does and why, and the code or pseudo-code. That is what \"describes how all or almost all key aspects are structured\" looks like." } },
    { worked: { tag: "example", title: "Is this design level 4?", q: "A booking system's design has 12 annotated screen mock-ups, a menu tree, a data dictionary and an E-R diagram. The slot-allocation algorithm is described in one sentence. Judge the level and fix it.",
      steps: [
        { m: "Interface and data are well articulated, but the KEY aspect — allocating slots — is not: level 3 at best (\"most key aspects\")." },
        { m: "Fix: pseudo-code for the allocation, the data structure it uses (e.g. a priority queue of requests), a worked trace on sample data, and the SQL it runs." },
        { m: "Trim the mock-ups to the few that matter; explain them." }
      ], result: "Level 3 → 4 by designing the algorithm" } },

    { page: "Before you hand it in" },
    { ul: [
      "☐ A high-level overview (class diagram / hierarchy chart / DFD) of the whole system.",
      "☐ Every key algorithm: purpose, pseudo-code, explanation.",
      "☐ Data structures and why each was chosen.",
      "☐ Database: E-R diagram, relations with keys, sample queries explained.",
      "☐ File formats, if data is stored in files.",
      "☐ Interface: a few explained screenshots and the navigation.",
      "☐ Names in the design match the names in the code.",
      "☐ Libraries and frameworks relied on are stated (e.g. WinForms, Microsoft.Data.Sqlite)."
    ] },
    { callout: { t: "warn", h: "Pitfalls", body: ["All screens, no algorithms.", "A design that no longer matches the code.", "Pseudo-code for trivial things (a login check) and none for the hard part.", "Diagrams with no explanation."] } },
    { callout: { t: "tip", h: "Links", body: "4.13.1.2 design; 4.1.2.3 OOP and class diagrams; 4.10 database design and SQL; 4.2 and 4.3 data structures and algorithms; NEA.3 the code must match." } }
  ],
  flashcards: [
    ["Design marks and AO?", "12 marks, AO3a, four levels."],
    ["Level 4 design?", "Fully or nearly fully articulated — how all or almost all key aspects are structured."],
    ["Core items of a design?", "High-level overview, algorithms, data structures, database design, user interface design."],
    ["Can design be documented after coding?", "Yes — before, during or after."],
    ["Are screenshots acceptable for the interface?", "Yes, explained screenshots of actual screens."],
    ["What made AQA's orbit-simulator design not fully articulated?", "It focused on the interface without the equations and update algorithms."],
    ["Name three Group A SQL items to show in design.", "Cross-table parameterised SQL, aggregate functions, a user-written DDL script."],
    ["What does the assessor compare the design with?", "The code — e.g. class methods matching the class diagram."]
  ],
  quiz: [
    { q: "The most important part of a design to articulate is", opts: ["the key processing algorithms", "the colour scheme", "the login screen", "the help page"], ans: 0, why: "Key aspects." },
    { q: "Design evidence produced after coding is", opts: ["acceptable", "forbidden", "worth no marks", "only for investigations"], ans: 0, why: "AQA guidance 2.2." },
    { q: "Security and integrity of data is", opts: ["supplementary", "core", "required", "not allowed"], ans: 0, why: "Guidance 3.2." },
    { q: "A class diagram is a suitable", opts: ["high-level overview", "test plan", "evaluation", "objective"], ans: 0, why: "Guidance 2.2." }
  ]
};

/* =====================================================================
   NEA.3  Technical solution
   ===================================================================== */
C["compsci:NEA.3"] = {
  notes: [
    { h: "Technical solution — the project guide" },
    { callout: { t: "info", h: "Key idea", body: "**42 marks (AO3b)** — more than all the documentation together: **Completeness of solution (15)** + **Techniques used (27)**. The evidence is your **program listing**, organised so a third party can find and judge the quality." } },
    marksBar("Technical solution"),
    NOT_EXAM,
    { h: "How this guide is organised" },
    { ol: ["**The level ladder**: how the 42 marks are found.", "**Table 1 — the technique groups**.", "**Table 2 — coding style**.", "**Group A in C#**: a heap, recursion, parameterised SQL.", "**Excellent style in C#**: defensive code and exceptions.", "**Presenting the listing**.", "**How the exemplar did it**.", "**Before you hand it in**."] },

    { page: "The level ladder" },
    { fig: { w: 640, h: 165, items: [].concat(
      boxAt(20, 55, 120, 50, "Your program", "accent"),
      boxAt(200, 15, 190, 56, "Completeness · 15", "accent2", "how many objectives met"),
      boxAt(200, 90, 190, 56, "Techniques · 27", "accent2", "Group A / B / C level"),
      boxAt(450, 90, 170, 56, "Mark within level", "good", "style · effectiveness"),
      arrow(140, 70, 200, 43, null, { c: "text2" }), arrow(140, 90, 200, 118, null, { c: "text2" }), arrow(390, 118, 450, 118, null, { c: "text2" }),
      [txt(520, 43, "add the two → /42", { b: true, c: "accent2" })]
    ), cap: "AQA's summary: Completeness picks a level from how many — and how important — objectives are met; Techniques picks a level from the skill demonstrated, then coding style and effectiveness place the mark in it." } },
    { table: { head: ["Strand", "Level 1", "Level 2", "Level 3"], rows: [
      ["Completeness (15)", "1–5: tackles some aspects", "6–10: many requirements, not all (top of band: includes the most important)", "11–15: almost all requirements (ignoring beyond-A-level ones)"],
      ["Techniques (27)", "1–9: Group C skill", "10–18: Group B skill", "19–27: Group A skill"]
    ] } },
    { callout: { t: "warn", h: "Credited for what WORKS", body: "The emphasis is on what you have actually achieved that demonstrates proficiency, not on what you set out to use but failed to demonstrate. A half-working hash table does not earn Group A. Table 1 is indicative, not a shopping list." } },

    { page: "Table 1 — the technique groups" },
    { table: { head: ["Group", "Model (data model / structure)", "Algorithms"], rows: [
      ["**A**", "complex database (several interlinked tables) · hash tables, lists, stacks, queues, graphs, trees · files organised for direct access · complex scientific / mathematical / control / business model · complex OOP (inheritance, composition, polymorphism, interfaces) · complex client–server", "cross-table parameterised SQL · aggregate SQL · user-written DDL · graph / tree traversal · list operations · linked-list maintenance · stack / queue operations · hashing · advanced matrix operations · recursion · complex user-defined algorithms (optimisation, scheduling, pattern matching) · merge sort or similar · dynamic generation of objects from a complex OOP model · server-side scripting · parameterised web APIs with JSON / XML"],
      ["**B**", "simple database (2–3 tables) · multi-dimensional arrays · dictionaries · records · text files · sequential files · simple model · simple OOP · simple client–server", "single-table / non-parameterised SQL · bubble sort · binary search · reading and writing files · simple user-defined algorithms · objects from a simple OOP model · simple web API calls"],
      ["**C**", "1-D arrays · simple data types · single-table database", "linear search · simple calculations · non-SQL table access"]
    ] } },
    { callout: { t: "tip", h: "Using a library still counts — differently", body: "C#'s built-in PriorityQueue or List.Sort are fine tools, but a technique is demonstrated by code YOU wrote. If a Group A structure is central, implement it yourself (as below) and say so in the overview guide." } },

    { page: "Table 2 — coding style" },
    { table: { head: ["Style", "Characteristics (cumulative)"], rows: [
      ["**Excellent**", "subroutines with appropriate interfaces · loosely coupled modules (they interact only through their interfaces) · cohesive modules (each does one thing) · related subroutines grouped into modules / classes · defensive programming · good exception handling"],
      ["**Good**", "well-designed user interface · modularised code · good use of local variables · minimal global variables · managed casting of types · constants · appropriate indentation · self-documenting code · consistent style · file paths parameterised"],
      ["**Basic**", "meaningful identifier names · annotation used effectively where required"]
    ] } },
    { table: { head: ["Level", "Above average", "Average", "Below average"], rows: [
      ["3 (Group A)", "all or almost all excellent characteristics; highly effective", "majority of excellent; effective", "some excellent; less than to fairly effective"],
      ["2 (Group B)", "majority of excellent", "some excellent", "all or almost all good, at most one excellent"],
      ["1 (Group C)", "almost all good", "some good", "basic"]
    ] } },
    { diagram: "nea-marks" },

    { page: "Group A in C#" },
    { code: { lang: "csharp", src: "public sealed class MinHeap<T>\n{\n    private readonly List<(T Item, int Priority)> _items = new();\n    public int Count => _items.Count;\n\n    public void Enqueue(T item, int priority)\n    {\n        _items.Add((item, priority));\n        int child = _items.Count - 1;\n        while (child > 0)                                    // sift up\n        {\n            int parent = (child - 1) / 2;\n            if (_items[parent].Priority <= _items[child].Priority) break;\n            (_items[parent], _items[child]) = (_items[child], _items[parent]);\n            child = parent;\n        }\n    }\n\n    public T Dequeue()\n    {\n        if (_items.Count == 0) throw new InvalidOperationException(\"The queue is empty.\");\n        T top = _items[0].Item;\n        _items[0] = _items[^1];\n        _items.RemoveAt(_items.Count - 1);\n        int parent = 0;\n        while (true)                                         // sift down\n        {\n            int left = 2 * parent + 1, right = left + 1, smallest = parent;\n            if (left < _items.Count && _items[left].Priority < _items[smallest].Priority) smallest = left;\n            if (right < _items.Count && _items[right].Priority < _items[smallest].Priority) smallest = right;\n            if (smallest == parent) break;\n            (_items[parent], _items[smallest]) = (_items[smallest], _items[parent]);\n            parent = smallest;\n        }\n        return top;\n    }\n}", cap: "A hand-written binary min-heap priority queue (Group A: a queue structure and its operations). Enqueuing Hash tables 3, Recursion 1, SQL joins 2, Big-O 5 dequeues Recursion, SQL joins, Hash tables, Big-O." } },
    { code: { lang: "csharp", src: "public static class StudyOrder\n{\n    public static List<string> Of(string goal, IReadOnlyDictionary<string, List<string>> prerequisites)\n    {\n        var order = new List<string>();\n        Visit(goal, prerequisites, new HashSet<string>(), order);\n        return order;\n    }\n\n    private static void Visit(string topic, IReadOnlyDictionary<string, List<string>> prerequisites,\n                              HashSet<string> seen, List<string> order)\n    {\n        if (!seen.Add(topic)) return;                        // base case: already placed\n        if (prerequisites.TryGetValue(topic, out var needs))\n            foreach (string need in needs) Visit(need, prerequisites, seen, order);\n        order.Add(topic);                                    // after everything it depends on\n    }\n}", cap: "Recursion and graph traversal: for Dijkstra ← {Graphs, Priority queues ← {Heaps}} it returns Graphs → Heaps → Priority queues → Dijkstra." } },
    { code: { lang: "csharp", src: "public List<(string Title, string Due)> TopicsDue(int studentId, string today)\n{\n    const string sql = @\"\n        SELECT Topic.Title, Review.DueDate\n        FROM Review INNER JOIN Topic ON Review.TopicID = Topic.TopicID\n        WHERE Review.StudentID = $student AND Review.DueDate <= $today\n        ORDER BY Review.DueDate, Topic.Title\";\n    using var connection = new SqliteConnection(_connectionString);   // Microsoft.Data.Sqlite\n    connection.Open();\n    using var command = connection.CreateCommand();\n    command.CommandText = sql;\n    command.Parameters.AddWithValue(\"$student\", studentId);   // parameters, never string concatenation\n    command.Parameters.AddWithValue(\"$today\", today);\n    var due = new List<(string, string)>();\n    using var reader = command.ExecuteReader();\n    while (reader.Read()) due.Add((reader.GetString(0), reader.GetString(1)));\n    return due;\n}", cap: "Cross-table parameterised SQL (Group A). Install the current Microsoft.Data.Sqlite package; parameters also block SQL injection." } },

    { page: "Excellent style in C#" },
    { table: { head: ["Weak", "Excellent"], rows: [
      ["a global `int grade` read by many methods", "methods take parameters and return results — loosely coupled"],
      ["int.Parse(textBox.Text) crashes on \"seven\"", "int.TryParse plus a range check — defensive programming"],
      ["one 300-line Form1_Load", "small cohesive methods grouped in classes (Scheduler, Repository, UI)"],
      ["a hard-coded C:\\Users\\me\\data.db in the code", "the path passed in from configuration — file paths parameterised"],
      ["magic numbers 3 and 6 scattered", "named constants PassGrade, SecondInterval"],
      ["catch (Exception) { } swallowing errors", "catch the specific exception, tell the user, keep the program running"]
    ] } },
    { code: { lang: "csharp", src: "public static class InputReader\n{\n    private const int MinGrade = 0, MaxGrade = 5;\n\n    public static int? ParseGrade(string text)\n    {\n        if (!int.TryParse(text, out int grade)) return null;                 // erroneous: not a number\n        return grade is >= MinGrade and <= MaxGrade ? grade : null;          // out of range\n    }\n}\n\n// at the boundary with the outside world: specific exceptions, a message, carry on\ntry\n{\n    repository.Save(review);\n}\ncatch (SqliteException ex) when (ex.SqliteErrorCode == 19)              // constraint failed\n{\n    ShowError(\"That review breaks a rule in the database (is the grade 0–5?).\");\n}\ncatch (IOException ex)\n{\n    ShowError(\"Could not reach the database file: \" + ex.Message);\n}", cap: "Defensive input and good exception handling — two of the six excellent characteristics." } },

    { page: "Presenting the listing" },
    { kv: [
      ["Overview guide", "how to run it: executables, data file names, database name, paths; then WHERE the sophisticated parts are (\"the scheduler: Scheduling/SpacedRepetitionScheduler.cs, p. 41\")"],
      ["Labelled sections", "one heading per file / class, in a sensible order, with a contents table of classes and methods"],
      ["Explanations", "short notes before particularly difficult code"],
      ["Self-documenting", "meaningful names and structure first; comments only where they add something"]
    ] },
    { table: { head: ["Objective", "Technique", "Where in the listing"], rows: [
      ["6.1 order today's topics by urgency", "own MinHeap<T> (Group A queue)", "DataStructures/MinHeap.cs, p. 38"],
      ["6.2 prerequisites first", "recursive DFS over the topic graph", "Planning/StudyOrder.cs, p. 40"],
      ["7 topics due today", "cross-table parameterised SQL", "Data/ReviewRepository.cs, p. 44"]
    ] } },

    { page: "How the exemplar did it" },
    { ul: [
      "**Techniques**: inheritance and polymorphism (a Game base class with ArcadeGame and CampaignGame; a Vehicle hierarchy), interfaces (Runnable, KeyListener), overloading, user-defined data objects (Heist, Layout, VehicleDetails), dynamic generation of objects as the difficulty rises, and ten user-defined algorithms — a Group A profile.",
      "**Signposting**: each technique has its own numbered section in the report, so the assessor can find it — then the full code listing follows.",
      "**Honesty**: it states where code was adapted from online sources (a star-drawing class, an explosion animation) and what was changed. Do the same — reference anything you did not write."
    ] },
    { worked: { tag: "example", title: "Which group?", q: "Place each in Table 1: (a) storing scores in a List<int> and finding the maximum (b) a SQL query joining three tables with a parameter for the user (c) a Dictionary<string, int> of word counts (d) your own merge sort of 10 000 records (e) a WinForms app with one Settings class.",
      steps: [{ m: "(a) Group C — a 1-D list and a simple calculation", mk: "C" }, { m: "(b) Group A — cross-table parameterised SQL", mk: "A" }, { m: "(c) Group B — dictionaries", mk: "B" }, { m: "(d) Group A — merge sort or similarly efficient sort", mk: "A" }, { m: "(e) Group B at most — a simple OOP model", mk: "B" }], result: "C, A, B, A, B" } },

    { page: "Before you hand it in" },
    { ul: [
      "☐ It runs; the overview guide says how (files, paths, database, packages).",
      "☐ The core objectives work — Completeness is judged on them.",
      "☐ At least one Group A technique is demonstrated working and signposted.",
      "☐ No global variables you could pass as parameters; constants for fixed values.",
      "☐ Input validated; specific exceptions caught with a message.",
      "☐ The listing is sectioned and indexed; difficult parts explained.",
      "☐ Borrowed code referenced, and what you changed stated.",
      "☐ Self-assessed with the mark estimator — and the gaps fixed."
    ] },
    { callout: { t: "warn", h: "Pitfalls", body: ["A sophisticated feature planned but not finished — no credit.", "Relying entirely on libraries for the clever part.", "One giant form class.", "An unindexed 80-page listing the assessor cannot navigate."] } },
    { callout: { t: "tip", h: "Links", body: "4.1 programming (subroutines, parameters, exceptions); 4.2 data structures; 4.3 algorithms; 4.10.4 SQL; 4.1.2.3 OOP; NEA.4 tests prove completeness." } }
  ],
  flashcards: [
    ["Technical solution marks?", "42: Completeness 15 + Techniques 27."],
    ["Techniques levels and groups?", "Level 1 (1–9) Group C, level 2 (10–18) Group B, level 3 (19–27) Group A."],
    ["What decides the mark within a techniques level?", "Extent the criteria are met, coding style (Table 2) and effectiveness."],
    ["Six excellent coding-style characteristics?", "Good interfaces, loose coupling, cohesion, grouped modules, defensive programming, good exception handling."],
    ["Is Table 2 cumulative?", "Yes — excellent assumes good and basic too."],
    ["Is a planned but broken technique credited?", "No — only what the code demonstrates working."],
    ["Name four Group A algorithms.", "Graph/tree traversal, recursion, hashing, merge sort (also cross-table parameterised SQL, complex user-defined algorithms)."],
    ["What should the overview guide contain?", "How to run it (files, paths, database) and where the sophisticated code and hardest objectives are."],
    ["Why use SQL parameters?", "Correctness and security — they prevent SQL injection; cross-table parameterised SQL is Group A."]
  ],
  quiz: [
    { q: "Completeness is worth", opts: ["15", "27", "42", "12"], ans: 0, why: "Spec 4.14.3.3.1." },
    { q: "A Dictionary<string,int> is in group", opts: ["B", "A", "C", "none"], ans: 0, why: "Table 1." },
    { q: "catch (Exception) { } that silently ignores errors is", opts: ["poor exception handling", "excellent", "defensive", "required"], ans: 0, why: "It swallows faults." },
    { q: "Hard-coding a database path breaks", opts: ["file paths parameterised", "cohesion", "recursion", "normalisation"], ans: 0, why: "Table 2, good." }
  ]
};

/* =====================================================================
   NEA.4  Testing
   ===================================================================== */
C["compsci:NEA.4"] = {
  notes: [
    { h: "Testing — the project guide" },
    { callout: { t: "info", h: "Key idea", body: "**8 marks (AO3c)**. Testing proves which objectives were achieved — it is also what the assessor uses to judge Completeness. Show **carefully selected, representative samples**, not every test you ran." } },
    marksBar("Testing"),
    NOT_EXAM,
    { h: "How this guide is organised" },
    { ol: ["**The level ladder**.", "**What to include**.", "**Choosing the tests**.", "**A test table**.", "**Unit tests in C#**.", "**How the exemplar did it**.", "**Before you hand it in**."] },

    { page: "The level ladder" },
    { table: { head: ["Level", "Marks", "AQA's descriptor"], rows: [
      ["4", "7–8", "Carefully selected representative samples showing THOROUGH testing — the complete or nearly complete solution is ROBUST and the requirements were ACHIEVED"],
      ["3", "5–6", "Extensive testing, but the samples do not make clear ALL the core requirements were achieved (key aspects untested, or evidence unclear)"],
      ["2", "3–4", "Moderately extensive testing, explained, falling short of showing the requirements achieved and the solution robust"],
      ["1", "1–2", "A small number of tests showing some parts work; evidence may be unclear"]
    ] } },
    { callout: { t: "warn", h: "Test the hard parts", body: "AQA's example: a login tested with many usernames shows robustness, but if the project's purpose is scheduling parents' evening slots and the scheduler is not tested, the core requirements have not been shown. Spend your evidence on the technically challenging objectives." } },

    { page: "What to include" },
    { kv: [
      ["Introduction and overview", "what was tested, when (during development and at the end), and how the evidence is organised"],
      ["Each test", "its purpose (if not obvious), the test data, the expected outcome, the actual outcome with sampled evidence"],
      ["Evidence", "before-and-after screenshots, output, or a video with time-stamps for each test"],
      ["Traceability", "the objective number each test proves"],
      ["Development testing", "tests that FAILED during development, the fix and the re-test — evidence of real testing, not a weakness"]
    ] },
    { callout: { t: "tip", h: "Video is allowed", body: "AQA accepts video evidence: keep the test table and give the time-slot in the video for each test; supply a URL, not the file." } },

    { page: "Choosing the tests" },
    { steps: [
      "List the objectives; mark the core ones.",
      "For each core objective: at least one normal test, the boundaries, and the erroneous inputs it must survive.",
      "For each key algorithm: known-answer tests you can work out by hand.",
      "Add robustness tests: wrong types, empty input, missing files, a full database, cancelling mid-way.",
      "Drop duplicates — one representative test per behaviour."
    ] },
    { table: { head: ["Objective 6.1 — order topics by urgency", "Data", "Type"], rows: [
      ["topics with distinct due dates", "due 3 days ago, 1 day ago, today", "normal"],
      ["two topics due the same day", "equal priorities", "boundary"],
      ["no topics due", "empty list", "boundary"],
      ["a topic with an impossible date", "\"31/02\"", "erroneous"]
    ] } },

    { page: "A test table" },
    { table: { head: ["#", "Obj.", "Purpose", "Test data", "Expected", "Actual / evidence", "✓"], rows: [
      ["12", "6.1", "most urgent first", "Recursion −3 d, SQL −1 d, Hash 0 d", "Recursion, SQL, Hash", "as expected — fig. 12a/b", "✓"],
      ["13", "6.1", "ties broken by title", "two topics both due today", "alphabetical", "first run: insertion order → fixed the comparer → re-test, fig. 13", "✓ (2nd)"],
      ["14", "6.3", "grade validation", "\"seven\", 6, −1", "rejected with a message; no crash", "fig. 14", "✓"],
      ["15", "7", "SQL due query", "student 1 on 2026-10-02", "Recursion, SQL joins", "fig. 15 (output)", "✓"],
      ["16", "robust", "database missing", "rename data.db", "message; app stays open", "video 03:12", "✓"]
    ] } },

    { page: "Unit tests in C#" },
    { code: { lang: "csharp", src: "using Xunit;\n\npublic class SchedulerTests\n{\n    [Theory]\n    [InlineData(1, 2.5, 4, 6)]    // normal: second successful review\n    [InlineData(6, 2.5, 5, 15)]   // normal: interval grows by the ease factor\n    [InlineData(15, 2.6, 2, 1)]   // boundary: grade 2 is a fail, so start again\n    [InlineData(15, 2.6, 3, 39)]  // boundary: grade 3 is the lowest pass\n    public void NextInterval_FollowsTheRule(int last, double ease, int grade, int expected)\n        => Assert.Equal(expected, new SpacedRepetitionScheduler().NextInterval(last, ease, grade));\n\n    [Theory]\n    [InlineData(\"6\")] [InlineData(\"-1\")] [InlineData(\"seven\")] [InlineData(\"\")]\n    public void ParseGrade_RejectsInvalidInput(string text) => Assert.Null(InputReader.ParseGrade(text));\n\n    [Fact]\n    public void MinHeap_ReturnsLowestPriorityFirst()\n    {\n        var heap = new MinHeap<string>();\n        heap.Enqueue(\"C\", 3); heap.Enqueue(\"A\", 1); heap.Enqueue(\"B\", 2);\n        Assert.Equal(\"A\", heap.Dequeue());\n        Assert.Equal(\"B\", heap.Dequeue());\n        Assert.Equal(\"C\", heap.Dequeue());\n    }\n\n    [Fact]\n    public void MinHeap_EmptyDequeue_Throws()\n        => Assert.Throws<InvalidOperationException>(() => new MinHeap<int>().Dequeue());\n}", cap: "xUnit tests for the core algorithms (dotnet new xunit) — normal, boundary and erroneous cases. A screenshot of the passing run is evidence; this set ran with 13 passed." } },
    { callout: { t: "tip", h: "Unit tests are not the whole story", body: "Unit tests prove the algorithms; the interface and whole workflows still need before-and-after screenshots or video. Combine both." } },

    { page: "How the exemplar did it" },
    { ul: [
      "**A test strategy** first, then **test tables per screen** (main menu, arcade game, campaign menu, campaign game, heists, garage, driving lessons) and a short **white-box testing** section.",
      "Each row: number, what should happen, test type (typical…), expected outcome, pass, and the **screenshot number** — so evidence is sampled and findable.",
      "The rows follow the objectives closely (lane changes, crashing, health, Wanted Level thresholds, police behaviour) — the core gameplay is what is tested.",
      "Could be stronger: more boundary and erroneous rows (scores of exactly 999 and 1000, key mashing, pausing during an explosion) to prove robustness, not just typical play."
    ] },
    { worked: { tag: "example", title: "Plan tests for an objective", q: "An objective in the exemplar's style: \"The Wanted Level is 1 star for a score of 0–999, 2 for 1000–1999, … 5 for 4000+.\" Choose the representative tests.",
      steps: [
        { m: "Normal: score 500 → 1 star; 2500 → 3 stars." },
        { m: "Boundaries: 999 → 1, 1000 → 2; 3999 → 4, 4000 → 5; a very large score → still 5." },
        { m: "Erroneous: a negative score should never occur — test that the score cannot go below 0 after a penalty." },
        { m: "As a unit test: [InlineData(999, 1)] [InlineData(1000, 2)] … against CalculateWantedLevel(score)." }
      ], result: "About 8 rows prove the whole objective" } },

    { page: "Before you hand it in" },
    { ul: [
      "☐ Every core objective has at least one test with evidence.",
      "☐ The technically challenging parts are tested hardest.",
      "☐ Normal, boundary and erroneous data appear.",
      "☐ Each test: purpose, data, expected, actual + evidence reference, objective number.",
      "☐ Robustness tests: wrong types, empty input, missing files.",
      "☐ Development failures, fixes and re-tests are included.",
      "☐ Evidence is sampled — not 200 screenshots."
    ] },
    { callout: { t: "warn", h: "Pitfalls", body: ["Testing only the login and menus.", "\"Pass\" with no evidence.", "Expected outcome written after seeing the result.", "Hundreds of near-identical tests hiding the important ones."] } },
    { callout: { t: "tip", h: "Links", body: "4.13.1.4 normal, boundary and erroneous data; NEA.1 objectives define what to test; NEA.3 completeness is judged from this evidence; NEA.5 evaluation cites test numbers." } }
  ],
  flashcards: [
    ["Testing marks and AO?", "8 marks, AO3c, four levels."],
    ["Level 4 testing shows…", "thorough testing, robustness and that the requirements were achieved, by representative samples."],
    ["Five parts of a test explanation?", "Purpose, test data, expected outcome, actual outcome, evidence sample."],
    ["Must every test be evidenced?", "No — carefully selected representative samples."],
    ["Can testing evidence come from during development?", "Yes — including failures, fixes and re-tests."],
    ["Is video evidence allowed?", "Yes — with a test table giving time-slots and a URL."],
    ["What should be tested hardest?", "The technically challenging core objectives."],
    ["C# unit-testing frameworks?", "xUnit, NUnit, MSTest."]
  ],
  quiz: [
    { q: "A project that tests only its login screen thoroughly", opts: ["has not shown the core requirements", "gets level 4", "needs no evaluation", "is complete"], ans: 0, why: "AQA guidance 4.4." },
    { q: "A failed test found during development should be", opts: ["reported with the fix and re-test", "hidden", "deleted", "marked pass"], ans: 0, why: "Shows real testing." },
    { q: "Testing evidence should be", opts: ["representative samples", "every test ever run", "only unit tests", "only the final week"], ans: 0, why: "Spec 4.14.5.4." },
    { q: "A score of 1000 against a threshold 'one star 0–999' is", opts: ["boundary data", "normal data", "erroneous data", "not worth testing"], ans: 0, why: "The edge of a range." }
  ]
};

/* =====================================================================
   NEA.5  Evaluation
   ===================================================================== */
C["compsci:NEA.5"] = {
  notes: [
    { h: "Evaluation — the project guide" },
    { callout: { t: "info", h: "Key idea", body: "**4 marks (AO3c)**, one per level. An honest appraisal of how well the outcome meets **each** requirement, **independent feedback** that you analyse, and **realistic improvements** described in detail." } },
    marksBar("Evaluation"),
    NOT_EXAM,
    { h: "How this guide is organised" },
    { ol: ["**The level ladder**.", "**What to include**.", "**An objective-by-objective table**.", "**Using feedback**.", "**How the exemplar did it**.", "**Before you hand it in**."] },

    { page: "The level ladder" },
    { table: { head: ["Mark", "AQA's descriptor"], rows: [
      ["4", "Full consideration of how well the outcome meets ALL its requirements · improvements discussed in DETAIL · independent feedback obtained, EVALUATED and DISCUSSED meaningfully"],
      ["3", "Full or nearly full consideration of all requirements · improvements discussed but limited · feedback obtained but not really discussed"],
      ["2", "Outcome discussed but not all aspects — some requirements omitted or unmet ones ignored · no useful independent feedback"],
      ["1", "Some outcomes assessed superficially · no feedback worth evaluating"]
    ] } },
    { callout: { t: "def", h: "The one-line rule", body: "Feedback pasted in but not discussed caps you at 3. Unmet requirements that are ignored cap you at 2. For 4: every objective, honest verdicts, analysed feedback, detailed improvements." } },

    { page: "What to include" },
    { ol: [
      "A reflection on the overall effectiveness of the outcome against the original problem.",
      "An evaluation against EACH objective — copy them in from the analysis.",
      "Independent feedback from the end user / supervisor / third party (the actual feedback in an appendix).",
      "A discussion of that feedback and how changes could be made.",
      "How the outcome could be improved if the problem were revisited — outlined well enough to show how you would build it."
    ] },
    { callout: { t: "tip", h: "Prototype feedback counts", body: "Feedback gathered during prototyping can be credited here if it is presented and referenced so it can be found, with how and why you acted on it." } },

    { page: "An objective-by-objective table" },
    { table: { head: ["Obj.", "Verdict", "Evidence", "Comment / improvement"], rows: [
      ["6.1 order by urgency", "Met", "tests 12–13", "ties were initially in insertion order; fixed with a comparer"],
      ["6.2 prerequisites first", "Met", "test 17", "a cycle in the prerequisites is survived (the visited set stops it) but not reported — better: detect cycles when topics are entered and warn the teacher"],
      ["8 sync between devices", "Not met (extension)", "—", "needs a server API; outline: an ASP.NET minimal API with the same repository behind it"],
      ["9 statistics screen", "Partly met", "test 21", "shows the mean grade per topic but not the trend; add a 30-day line chart"]
    ] } },
    { steps: [
      "Copy each objective in.",
      "Verdict: met / partly met / not met — honestly.",
      "Evidence: test numbers, screenshots, feedback quotes.",
      "For anything short: why, and how it could be done — specific enough to start building.",
      "Then the overview: effectiveness beyond the objectives (performance, usability, maintainability), and what you would do differently."
    ] },

    { page: "Using feedback" },
    { worked: { tag: "example", title: "Turn feedback into evaluation", q: "Your client writes: \"I like that weak topics come first. The statistics page is confusing and I'd like to set exam dates.\" Write the evaluation paragraph.",
      steps: [
        { m: "Agree and evidence: objective 6.1 is confirmed by the client — weak topics first was their main requirement (interview, appendix B)." },
        { m: "Analyse the criticism: the statistics page shows raw means per topic without context; objective 9 was met as written, but the client's need — seeing progress — was not fully served." },
        { m: "Improvement in detail: replace the table with a per-topic 30-day trend chart; add an ExamDate field to Topic and weight the heap priority by the days to the exam." },
        { m: "Reflect: exam dates were not raised in the analysis — an earlier prototype review would have caught it." }
      ], result: "Feedback discussed, not pasted" } },
    { callout: { t: "warn", h: "Independent means not you", body: "The end user, client or supervisor — someone with a stake who used the system. Your own opinion is the evaluation; theirs is the feedback." } },

    { page: "How the exemplar did it" },
    { ul: [
      "**Evaluating how successfully the project meets the specification**: every objective repeated in bold, followed by a discussion of how it was met.",
      "**Feedback woven in**: peers' reactions to features (the colour-changing health bar was widely praised; the campaign mode was called an enjoyable, addictive feature) with the suggestions they led to (an animated health bar, two-level pick-ups).",
      "**General comments and possible extensions** and a **conclusion** close it.",
      "Could be stronger: name the independent testers and put their feedback in an appendix; give each improvement an outline of HOW it would be built."
    ] },

    { page: "Before you hand it in" },
    { ul: [
      "☐ Every objective is copied in with a verdict.",
      "☐ Each verdict cites evidence (test number, screenshot, quote).",
      "☐ Unmet or partly met objectives are discussed, not hidden.",
      "☐ Independent feedback is in an appendix AND analysed in the text.",
      "☐ Improvements are specific and say how they would be built.",
      "☐ There is an overall reflection beyond the objectives."
    ] },
    { callout: { t: "warn", h: "Pitfalls", body: ["\"All objectives were met\" with no evidence.", "Pasting the client's email with no comment.", "Improvements like \"make it look better\".", "Skipping the objectives you did not finish."] } },
    { callout: { t: "tip", h: "Links", body: "4.13.1.5 evaluation; NEA.1 the objectives; NEA.4 the evidence; the objective checker can re-read your list before you evaluate it." } }
  ],
  flashcards: [
    ["Evaluation marks?", "4, one per level (AO3c)."],
    ["Three things a level-4 evaluation has?", "Full consideration of all requirements, detailed improvements, independent feedback evaluated and discussed."],
    ["What caps an evaluation at 3?", "Feedback obtained but not meaningfully discussed (or limited improvements)."],
    ["What caps an evaluation at 2?", "Requirements omitted or unmet ones ignored; no useful feedback."],
    ["Where does the raw feedback go?", "An appendix — analysed in the evaluation itself."],
    ["Can prototype feedback be credited?", "Yes, if presented, referenced and its effect explained."],
    ["What makes an improvement realistic?", "It is specific and outlines how it would be implemented."],
    ["Why copy the objectives into the evaluation?", "So each can be judged in turn against evidence."]
  ],
  quiz: [
    { q: "Pasting the client's email without comment", opts: ["caps the evaluation at 3", "earns 4", "is required", "is not allowed"], ans: 0, why: "Must be evaluated and discussed." },
    { q: "An unfinished objective should be", opts: ["evaluated honestly", "left out", "renamed", "moved to design"], ans: 0, why: "Ignoring it caps at 2." },
    { q: "Independent feedback comes from", opts: ["the end user / client / supervisor", "you", "the compiler", "a classmate's code"], ans: 0, why: "A third party." },
    { q: "\"Make it look better\" is", opts: ["too vague an improvement", "a detailed improvement", "an objective", "feedback"], ans: 0, why: "Not specific." }
  ],
  sims: ["nea-objectives"]
};

})(window.KOS_CONTENT);
