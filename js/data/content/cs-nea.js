/* Kurenai OS — NEA Programming Project guidance (AQA 7517 Component 3) */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:NEA.1"] = {
  notes: [
    { h: "NEA Analysis — what the marks actually want" },
    { callout: { t: "def", h: "Analysis stage goals", body: [
      { kv: [
        ["Problem identification", "A clear, precise description of the problem — what the solution must do, who it is for, and what the current situation is without it."],
        ["Decomposition", "Breaking the problem into manageable sub-problems. Show the structure — not just 'there will be a login system' but what login requires: input validation, password hashing, session management…"],
        ["User/client research", "Evidence of interaction with the intended user(s): interview notes, questionnaire responses, or documented discussion. AQA require this — hearsay doesn't count."],
        ["Measurable objectives", "Success criteria that can be tested with specific data. 'The system should be fast' fails; 'the system should return search results in under 2 seconds for 10,000 records' scores."],
        ["I/P/O analysis", "Identify all inputs, processes, and outputs of the system."]
      ]}
    ]}},
    { callout: { t: "warn", h: "The most common Analysis failure", body: "Writing objectives that cannot be tested. Every objective must end with a measurable condition. Ask yourself: how would I prove in the Testing stage that this criterion is met? If you can't answer, the objective is too vague." }},
    { h: "Decomposition — how to structure it" },
    { steps: [
      { h: "State the problem", m: "One clear paragraph: what is the problem, who is the client/user, why does the current situation fall short?" },
      { h: "Research", m: "Investigate similar systems. What features do they have? What are their limitations? Justify at least two comparisons — citing your research earns marks." },
      { h: "Decompose", m: "Break the solution into sub-systems (e.g. Login, Data Entry, Reporting). For each sub-system, identify its own inputs, processes, and outputs.", n: "A hierarchy chart or numbered list both work; reference it in your text." },
      { h: "User requirements", m: "Document what the client/user told you they need. Quote or paraphrase specifically — 'the client said they want X' is evidence; 'users generally want Y' is not." },
      { h: "Write objectives", m: "Number each objective. Make each one measurable. Cross-reference them to user requirements to show where they came from.", n: "Typical NEA: 8–12 objectives is sufficient. More is not better." }
    ]},
    { callout: { t: "memorise", h: "Objective writing formula", body: "**The system shall [verb] [noun] [measurable condition].**\n\nExamples:\n• The system shall store student records with at least 10 fields per record.\n• The system shall validate date inputs and reject dates before 2000.\n• The system shall display search results in under 3 seconds.\n• The system shall allow the admin to add/edit/delete 5 user account types." }},
    { callout: { t: "tip", h: "I/P/O analysis table", body: [
      { table: {
        head: ["Sub-system", "Inputs", "Processes", "Outputs"],
        rows: [
          ["Login", "Username, Password", "Hash password, query database, compare", "Session token or error message"],
          ["Search", "Search term, filters", "Query database, rank results", "Filtered results list"],
          ["Report", "Date range, category", "Aggregate data, format", "Summary table / export file"]
        ]
      }}
    ]}},
    { callout: { t: "miscon", h: "\"The more objectives the better\"", body: "Quality beats quantity. Five specific, measurable objectives earn more marks than fifteen vague ones. Each objective must be traceable: it should appear in your Design decisions, be tested in your Test Plan, and be evaluated in your Evaluation." }}
  ],
  flashcards: [
    ["What must every NEA objective be?", "Measurable and testable — specific enough that you can prove in the Testing stage whether it is met."],
    ["What counts as evidence of user research?", "Interview notes, questionnaire responses, or documented client discussions — not general assumptions about users."],
    ["What is I/P/O analysis?", "Identifying all Inputs, Processes, and Outputs of the system and its sub-systems."],
    ["Why is decomposition important in Analysis?", "It breaks an overwhelming problem into manageable sub-systems that can be designed and implemented independently."],
    ["How many objectives is typical for the NEA?", "8–12 specific, numbered, measurable objectives is sufficient. Prioritise precision over quantity."]
  ],
  quiz: [
    { q: "Which objective is written to NEA standard?", opts: ["The system should be easy to use.", "The system shall validate all date inputs and reject dates outside 2000–2030.", "There will be a login system.", "The database will store data."], ans: 1, why: "It uses 'shall', specifies what is validated, and gives a testable condition (the date range)." },
    { q: "A student writes: 'users want a fast system'. This fails as an objective because…", opts: ["it doesn't mention a database", "it is not measurable or testable", "it is too long", "it needs to name the programming language"], ans: 1, why: "There is no criterion by which to test whether 'fast' has been achieved." },
    { q: "Which section of Analysis provides evidence of actual client interaction?", opts: ["Decomposition", "I/P/O analysis", "User/client research", "Existing solutions"], ans: 2, why: "AQA specifically require documented evidence of stakeholder interaction — not assumptions." }
  ],
  exam: [
    { q: "A student is developing a library management system for a school. Write three measurable objectives for their NEA Analysis.", marks: 3,
      ms: ["One valid objective with measurable condition, e.g. 'The system shall allow library staff to search for books by title, author, or ISBN and return results in under 2 seconds.' (1)", "Second valid objective, e.g. 'The system shall allow borrowers to be added/removed and store at least: name, student ID, year group, and current loans.' (1)", "Third valid objective, e.g. 'The system shall send an overdue notice (on-screen or printed) for any book not returned within 14 days.' (1)"] }
  ]
};

C["compsci:NEA.2"] = {
  notes: [
    { h: "NEA Design — translating objectives into a blueprint" },
    { callout: { t: "def", h: "What Design must contain", body: [
      { kv: [
        ["Data structures", "The tables, classes, arrays, dictionaries — every structure your solution needs, with field names, data types, and why that structure was chosen."],
        ["Algorithms", "Pseudocode or flowcharts for the non-trivial logic. Not every line — focus on the core algorithms: search, sort, validation, the tricky business logic."],
        ["UI mockups", "Sketched or wireframed screens for every distinct interface the user will see. Labels, button names, and navigation flow."],
        ["Test plan", "A numbered list of test cases, created BEFORE coding. Each test has: test number, objective tested, input data, expected output, type (normal/boundary/erroneous)."],
        ["Justification", "Every design decision must be justified against the Analysis requirements. 'I chose a dictionary because the client needs O(1) look-up for student records by ID.'"]
      ]}
    ]}},
    { callout: { t: "warn", h: "Design done AFTER coding is penalised", body: "The test plan must be created in Design before implementation. If your test plan exactly matches your code's behaviour with no failed tests, moderators may treat it as retrospective — losing marks. Include expected failures." }},
    { h: "Designing data structures" },
    { callout: { t: "tip", h: "How to document a database table", body: [
      { table: {
        head: ["Field", "Data type", "Constraint", "Purpose"],
        rows: [
          ["StudentID", "INTEGER", "PRIMARY KEY, AUTO INCREMENT", "Unique identifier"],
          ["Name", "VARCHAR(100)", "NOT NULL", "Student's full name"],
          ["DOB", "DATE", "NOT NULL", "For age validation"],
          ["YearGroup", "INTEGER", "1–13", "For filtering reports"],
          ["Active", "BOOLEAN", "DEFAULT TRUE", "Soft-delete flag"]
        ]
      }}
    ]}},
    { h: "Designing algorithms — pseudocode standard" },
    { code: { lang: "pseudo", cap: "Login validation algorithm — example pseudocode for NEA Design.", src:
"FUNCTION ValidateLogin(username, passwordInput) RETURNS BOOLEAN\n    record ← Database.Query(\"SELECT * FROM Users WHERE Username = ?\", [username])\n    IF record IS EMPTY THEN\n        RETURN FALSE   // user not found\n    ENDIF\n    hashedInput ← Hash(passwordInput + record.Salt)\n    IF hashedInput = record.PasswordHash THEN\n        Session.CreateToken(record.UserID)\n        RETURN TRUE\n    ELSE\n        RETURN FALSE\n    ENDIF\nENDFUNCTION" }},
    { callout: { t: "memorise", h: "Test plan table columns", body: [
      { table: {
        head: ["#", "Objective", "Input", "Expected output", "Type"],
        rows: [
          ["1", "Obj 3 — date validation", "Date: 15/13/2024", "Error: 'Invalid date'", "Erroneous"],
          ["2", "Obj 3 — date validation", "Date: 31/12/2024", "Accepted", "Boundary"],
          ["3", "Obj 3 — date validation", "Date: 15/06/2025", "Accepted", "Normal"],
          ["4", "Obj 1 — login", "Username: admin, Password: correct", "Login succeeds", "Normal"],
          ["5", "Obj 1 — login", "Username: admin, Password: wrong", "Error: 'Incorrect password'", "Erroneous"]
        ]
      }}
    ]}},
    { callout: { t: "miscon", h: "\"I only need to test what works\"", body: "The test plan must include erroneous and boundary tests. Testing only normal data earns few marks. Moderators look for evidence that you anticipated failure conditions before you wrote the code." }},
    { callout: { t: "info", h: "Hierarchy vs structure chart", body: [
      { kv: [
        ["Hierarchy chart", "Shows the module/function breakdown of your program. Which modules exist and which contain which. Does NOT show sequence or data flow."],
        ["Structure chart", "Like a hierarchy chart but adds data flows (parameters passed between modules) with labelled arrows. Shows what data moves between modules."]
      ]}
    ]}}
  ],
  flashcards: [
    ["When must the test plan be created?", "During Design, BEFORE coding begins — not retrospectively after testing."],
    ["What are the three types of test data that must be included?", "Normal (typical valid input), Boundary (at the edges of validity), and Erroneous (invalid input that should be rejected)."],
    ["What must every design decision include?", "A justification referencing a specific Analysis requirement or objective."],
    ["What does a hierarchy chart show?", "The modular structure of the program — which sub-modules exist and which contain which. Not sequence."],
    ["What fields should a database table design document?", "Field name, data type, constraints (PK/FK/NOT NULL), and purpose/reason for inclusion."]
  ],
  quiz: [
    { q: "A test with input '31/02/2024' checking the system rejects invalid dates is…", opts: ["Normal", "Boundary", "Erroneous", "Integration"], ans: 2, why: "31st February doesn't exist — this is erroneous/invalid data that should be rejected." },
    { q: "The test plan should be created…", opts: ["after all code is written", "before coding begins, during Design", "only when bugs are found", "after evaluation"], ans: 1, why: "Design-first test plans prove the objectives were understood before implementation, not reverse-engineered from the code." },
    { q: "Which design artefact shows what data is passed between modules?", opts: ["Hierarchy chart", "Structure chart", "Flowchart", "Entity-relationship diagram"], ans: 1, why: "Structure charts add data-flow arrows to the module hierarchy." }
  ],
  exam: [
    { q: "Explain why a test plan should be created during the Design stage rather than after implementation.", marks: 3,
      ms: ["A design-stage test plan is based on requirements, not code — it tests what the system SHOULD do, not just what it happens to do (1)", "Ensures all objectives are covered by at least one test case before coding biases the tester (1)", "If written after, tests tend to reflect the implementation and miss scenarios the developer didn't code for (1)"] }
  ]
};

C["compsci:NEA.3"] = {
  notes: [
    { h: "NEA Technical Solution — writing code that earns marks" },
    { callout: { t: "def", h: "What the Technical Solution is assessed on", body: [
      { kv: [
        ["Functionality", "Does the solution actually work? Does it meet the objectives? A working, simpler solution beats an ambitious broken one."],
        ["Complexity", "Does the solution use appropriate algorithms and data structures beyond trivial examples? Shows skill."],
        ["Code quality", "Meaningful identifiers, good structure, decomposition into subroutines/methods, appropriate use of the chosen paradigm."],
        ["Evidence", "Screenshots of the running solution for every objective. Annotated screenshots showing specific features earn more marks than generic ones."]
      ]}
    ]}},
    { callout: { t: "warn", h: "Screenshot every objective", body: "For each numbered objective, you need at least one screenshot clearly demonstrating it is met. Label screenshots with objective numbers. Missing evidence = unawarded marks even if the code is there." }},
    { h: "Code quality — what examiners look for" },
    { callout: { t: "tip", h: "Good vs poor code quality", body: [
      { table: {
        head: ["Poor", "Good"],
        rows: [
          ["x = x + 1", "studentCount += 1"],
          ["if a == 1:", "if loginAttempts >= MAX_ATTEMPTS:"],
          ["def f(x): ...", "def calculateDiscountedPrice(originalPrice, discountPercent): ..."],
          ["One 500-line function", "Many short focused functions, each ≤ 30 lines"],
          ["No comments", "Comment on WHY (not WHAT): # BCrypt used for timing-attack resistance"]
        ]
      }}
    ]}},
    { callout: { t: "memorise", h: "Evidence checklist per objective", body: "For each objective:\n1. Screenshot of the feature working with normal data\n2. Screenshot of validation/error handling for erroneous data (if applicable)\n3. Short annotation: 'This demonstrates Objective 4 — the system validates email format and rejects input without @ symbol.'" }},
    { code: { lang: "csharp", cap: "Example of well-structured, commented C# that demonstrates good NEA code quality.", src:
"// Validates that a student ID is numeric and within the current cohort range.\n// Returns true if valid; sets errorMessage to explain any rejection.\nprivate bool ValidateStudentId(string input, out string errorMessage)\n{\n    errorMessage = string.Empty;\n    if (!int.TryParse(input, out int studentId))\n    {\n        errorMessage = \"Student ID must be a whole number.\";\n        return false;\n    }\n    if (studentId < MIN_STUDENT_ID || studentId > MAX_STUDENT_ID)\n    {\n        errorMessage = $\"Student ID must be between {MIN_STUDENT_ID} and {MAX_STUDENT_ID}.\";\n        return false;\n    }\n    return true;\n}" }},
    { callout: { t: "info", h: "Complexity features that earn marks", body: [
      { kv: [
        ["File I/O", "Reading and writing persistent data (CSV, JSON, database) rather than hard-coded arrays."],
        ["Database queries", "SQL with JOIN, WHERE, ORDER BY — not just SELECT *."],
        ["Searching/sorting", "Implementation of or use of non-trivial algorithms (binary search, merge sort, Dijkstra)."],
        ["Validation", "Multi-layered input validation beyond simple presence checks."],
        ["OOP", "Multiple classes with encapsulation, inheritance, or polymorphism used meaningfully — not just one class with all code."],
        ["Error handling", "Try/catch blocks or equivalent, with meaningful recovery or user feedback."]
      ]}
    ]}},
    { callout: { t: "miscon", h: "\"Comments everywhere = good marks\"", body: "Comments should explain WHY, not WHAT. 'i += 1  # adds one to i' is noise. 'Use index rather than value because we need to track position for the swap.' is meaningful. Examiners want to see understanding, not narration." }}
  ],
  flashcards: [
    ["What is the most important thing to remember about screenshot evidence?", "Label each screenshot with the objective number it demonstrates. Screenshot every objective, including validation/error handling."],
    ["What three dimensions is the technical solution assessed on?", "Functionality (does it work), Complexity (appropriate algorithms/structures), and Code quality (structure, naming, decomposition)."],
    ["What makes a comment valuable in NEA code?", "It explains WHY a decision was made, not WHAT the code does — especially for non-obvious choices."],
    ["Name four complexity features that raise marks.", "File I/O, SQL joins/queries, OOP with multiple classes, and multi-step input validation."],
    ["Why is a working simple solution better than a broken complex one?", "Functionality marks require the solution to work. Complexity marks for unworking features are usually not awarded."]
  ],
  quiz: [
    { q: "A student has written a well-structured program that meets 7 of 10 objectives. Which should they prioritise?", opts: ["Adding more comments", "Making more objectives work before submission", "Adding more classes", "Increasing line count"], ans: 1, why: "Functionality against objectives directly maps to marks. Working code that meets objectives beats elegant code that misses them." },
    { q: "Which comment is most valuable in a NEA submission?", opts: ["# increments the counter", "# BCrypt used instead of MD5: MD5 is broken for password storage", "# this line adds 1 to x", "# end of function"], ans: 1, why: "Explains WHY (security reasoning) not WHAT. Shows understanding of the decision." },
    { q: "Screenshots of the running solution are required…", opts: ["once at the end", "for each objective — demonstrating it is met", "only when the program crashes", "only for the final version"], ans: 1, why: "Each objective needs evidence it is met. Examiners can't award what they can't see demonstrated." }
  ],
  exam: [
    { q: "A student's NEA technical solution uses one long function of 400 lines. Explain how they could improve the code quality, giving two specific improvements.", marks: 4,
      ms: ["Decompose into shorter, single-purpose functions — e.g. separate ValidateInput(), SaveToDatabase(), DisplayResults() (1) — makes code easier to test and maintain (1)", "Use meaningful parameter and variable names that indicate purpose (1) — reduces need for comments and makes logic self-documenting (1)"] }
  ]
};

C["compsci:NEA.4"] = {
  notes: [
    { h: "NEA Testing — evidence that earns marks" },
    { callout: { t: "def", h: "Testing requirements", body: [
      { kv: [
        ["Test plan execution", "Run every test from your Design test plan, recording actual output vs expected. Show pass/fail for each."],
        ["Evidence", "Screenshots annotated to show what input was used and what happened — one per test (or clearly labelled group)."],
        ["Bug fix evidence", "Where a test fails: show the bug (screenshot + code), show the fix (code diff or re-test), show the re-test passing."],
        ["Data coverage", "Normal, boundary, AND erroneous data types must all appear in executed tests."],
        ["Iterative testing", "Evidence of testing during development, not just at the end — show intermediate bugs caught and fixed."]
      ]}
    ]}},
    { callout: { t: "warn", h: "All-pass test tables are suspicious", body: "If every test passes first time with no bugs found, moderators may question whether testing was done honestly. You SHOULD find bugs — show you found them and fixed them. A repaired failed test demonstrates more skill than a perfect run with no failures." }},
    { h: "Test table structure" },
    { callout: { t: "memorise", h: "Completed test table", body: [
      { table: {
        head: ["#", "Obj.", "Input", "Expected", "Actual", "Pass?", "Fix (if fail)"],
        rows: [
          ["1", "3", "Date: 15/06/2025", "Accepted", "Accepted", "✓", "—"],
          ["2", "3", "Date: 31/02/2025", "Error: invalid date", "No error shown", "✗", "Added calendar validation — re-test #2a"],
          ["2a", "3", "Date: 31/02/2025", "Error: invalid date", "Error: 'February has no 31st'", "✓", "—"],
          ["3", "1", "Username: '', Password: test", "Error: required field", "Error shown", "✓", "—"]
        ]
      }}
    ]}},
    { h: "Demonstrating iterative testing" },
    { steps: [
      { h: "During development", m: "Test each module as you build it. Screenshot intermediate states and crashes — these are valuable evidence." },
      { h: "Integration testing", m: "Test modules together. Show tests that only become relevant when two parts are combined (e.g. login feeds into data access).", n: "A brief paragraph explaining what you tested and why is worth marks." },
      { h: "Final testing", m: "Run the full test plan. Record actual vs expected. Annotate screenshots with test numbers.", n: "For failures: show the bug, the fix, and the re-test." },
      { h: "Link to objectives", m: "At the end, map each objective to the test(s) that prove it is met. 'Objective 4 is met — see tests 7, 8, 9.'" }
    ]},
    { callout: { t: "tip", h: "What to annotate on screenshots", body: "Draw arrows or add text boxes to screenshots pointing at: the specific input used, the output shown, and the objective number. An unannotated screenshot of a running program proves nothing." }},
    { callout: { t: "miscon", h: "\"Testing only happens at the end\"", body: "AQA specifically look for iterative testing — evidence of bugs found and fixed during development, not just a final test run. Unit testing individual functions as you write them, then integration testing, then final end-to-end testing earns full marks." }}
  ],
  flashcards: [
    ["What columns must a completed test table include?", "Test number, objective referenced, input, expected output, actual output, pass/fail, and fix applied (if failed)."],
    ["Why should some tests fail in your submission?", "Finding and fixing bugs demonstrates genuine testing skill. All-pass tables suggest tests weren't rigorous or were written after the fact."],
    ["What is iterative testing in the NEA context?", "Testing modules as they are built during development, not just a single end-to-end run at the end."],
    ["What must be shown when a test fails?", "The failing screenshot, the code change that fixed it, and a re-test showing it now passes."],
    ["How should screenshots be annotated?", "Label with test number, point out the specific input used and the output shown, and state which objective is being demonstrated."]
  ],
  quiz: [
    { q: "A student's test table shows every test passing with no failures. This most likely indicates…", opts: ["excellent code quality", "tests may not have been rigorous, or were written after the fact", "the student is very experienced", "testing is complete"], ans: 1, why: "Real testing of a non-trivial solution always finds bugs. All-pass suggests retrospective testing or insufficient coverage." },
    { q: "Which type of test data is the most commonly missed?", opts: ["Normal", "Boundary", "Erroneous", "Integration"], ans: 2, why: "Students often test what works (normal) and forget to test that invalid inputs are correctly rejected." },
    { q: "A test for login with an empty username field belongs to which category?", opts: ["Normal", "Boundary", "Erroneous", "Performance"], ans: 2, why: "Empty input where a value is required is erroneous data — the system should reject it." }
  ],
  exam: [
    { q: "Explain why testing should be carried out iteratively during development rather than only at the end.", marks: 3,
      ms: ["Bugs found early (in a single module) are easier and cheaper to fix than those found after all code is integrated (1)", "Iterative testing produces more targeted evidence — shows which specific unit failed and what fixed it (1)", "End-of-development testing only reveals combined/integration bugs; unit testing catches logic errors before they compound (1)"] }
  ]
};

C["compsci:NEA.5"] = {
  notes: [
    { h: "NEA Evaluation — measuring against your own objectives" },
    { callout: { t: "def", h: "What Evaluation must address", body: [
      { kv: [
        ["Against objectives", "Each numbered objective from Analysis must be explicitly addressed: met, partially met, or not met — with evidence from Testing."],
        ["Effectiveness", "Does the solution actually solve the client's problem? Does it do what was asked?"],
        ["Usability", "Is the interface intuitive? Would a real user be able to use it without a manual?"],
        ["Maintainability", "Is the code structured so that another developer could extend or fix it?"],
        ["Limitations", "What does the solution NOT do, or do poorly? Be honest — identifying real limitations earns marks."],
        ["Improvements", "Realistic extensions or fixes: what would you add or change given more time?"]
      ]}
    ]}},
    { callout: { t: "warn", h: "Generic praise is penalised", body: "'The system works well and is very good.' Earns nothing. Evaluation must be specific, critical, and evidence-linked. Even a good solution has real limitations — finding them demonstrates understanding." }},
    { h: "Structure that earns full marks" },
    { steps: [
      { h: "Objective-by-objective", m: "Work through objectives 1 to n. For each: state the criterion, state whether it is met, cite the test number(s) that prove it.", n: "Example: 'Objective 4 — the system shall validate date inputs. MET — tests 7, 8, 9 demonstrate correct validation of normal, boundary and erroneous dates.'" },
      { h: "Effectiveness", m: "Does the solution solve the client's real-world problem? Quote what the client originally needed (from Analysis) and show whether it is addressed." },
      { h: "Usability", m: "Evaluate the UI against usability principles: is it consistent? Are errors clear? Would a non-technical user cope?", n: "If you have real user feedback, quote it — it earns marks." },
      { h: "Limitations", m: "State what is missing, broken, or inadequate. Be specific: 'The search function does not support partial matches — users must type the exact title.'", n: "One honest limitation is worth more than three vague ones." },
      { h: "Future improvements", m: "For each limitation: describe a realistic extension. Reference the data structures or algorithms you would use.", n: "Example: 'Partial matching could be implemented with a LIKE query in SQL or a trie structure.'" }
    ]},
    { callout: { t: "memorise", h: "Evaluation sentence starters", body: "• **Objective [n] is met** — demonstrated by [test] which shows [behaviour].\n• **Objective [n] is partially met** — [feature] works correctly but [limitation] means [scenario] fails.\n• **Objective [n] is not met** — due to [reason]. This could be addressed by [improvement].\n• **Limitation**: the system does not [X] because [technical reason].\n• **Improvement**: [X] could be added by [specific technical approach]." }},
    { callout: { t: "tip", h: "Getting client/user feedback", body: "If you can, show the finished solution to the original client or a representative user, document their feedback, and quote it in your Evaluation. 'The client commented that the search was intuitive but wanted filtering by date' is concrete evidence that earns marks. Even one sentence of genuine feedback is valuable." }},
    { callout: { t: "miscon", h: "\"Limitations should be hidden\"", body: "Identifying a real limitation and proposing a specific, technically sound improvement earns more marks than claiming the solution is perfect. Evaluators expect honest critical analysis — they know student NEA projects have limitations." }}
  ],
  flashcards: [
    ["How should each objective be addressed in Evaluation?", "State the objective, state whether it is met/partially met/not met, and cite the test number(s) that provide evidence."],
    ["What makes a limitation evaluation earn marks?", "Being specific about what fails, in which scenario, and why — plus a realistic technical improvement."],
    ["Why does 'the system works well' earn no marks?", "It is a general opinion, not a specific evaluation against a measurable criterion with evidence."],
    ["What should a future improvement include?", "A description of the missing/inadequate feature AND a specific technical approach to adding it (data structures, algorithms, or methods)."],
    ["How can user/client feedback be used in Evaluation?", "Quote it directly — it provides external, objective evidence of usability that tests alone cannot demonstrate."]
  ],
  quiz: [
    { q: "Which Evaluation statement earns the most marks?", opts: ["The system works well overall.", "Objective 3 is met — tests 7 and 8 confirm date validation rejects 31/02 and accepts 28/02.", "I think users would like the interface.", "The code is well-structured."], ans: 1, why: "Specific, evidence-linked, objective-referenced — the exact structure examiners reward." },
    { q: "A student's solution doesn't support partial name searches. The best way to address this in Evaluation is…", opts: ["not to mention it", "to say 'search is good enough'", "to identify the limitation specifically and suggest SQL LIKE or a trie as a future improvement", "to apologise for the gap"], ans: 2, why: "Honest limitation + specific technical improvement demonstrates higher-order understanding." },
    { q: "Evaluation marks are awarded for…", opts: ["lines of code written", "specific critical analysis against numbered objectives with evidence", "the number of screenshots", "how long the document is"], ans: 1, why: "AQA Evaluation marks map directly to objective-by-objective analysis with testing evidence." }
  ],
  exam: [
    { q: "Write an evaluation paragraph for Objective 4: 'The system shall validate email addresses and reject inputs without an @ symbol.'", marks: 4,
      ms: ["State whether the objective is met (1)", "Reference specific test evidence, e.g. 'Tests 11 and 12 show the system correctly rejects admin and accepts admin@school.co.uk' (1)", "Identify a remaining limitation or edge case, e.g. 'The validation does not catch addresses with spaces or double @ symbols' (1)", "Suggest a specific improvement, e.g. 'A regex pattern ^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$ would handle these cases.' (1)"] }
  ]
};

})(window.KOS_CONTENT);
