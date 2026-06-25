/* Kurenai OS — deep content: AQA 7517 §4.1.1 Programming Fundamentals */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.1.1.1"] = {
  notes: [
    { h: "Data Types" },
    "A **data type** fixes three things about a variable: the **set of values** it may legally hold, the **operations** that may be performed on it, and **how it is stored** in memory. Choosing well trades off *precision/range*, *memory use*, *valid operations* and *readability/safety*.",
    { callout: { t: "def", h: "What a data type determines", body: [
      { kv: [
        ["Set of values", "Which values are legal — an integer cannot hold 3.5; a Boolean holds only true/false."],
        ["Valid operations", "Which operations make sense — arithmetic on numbers, concatenation on strings, AND/OR on Booleans."],
        ["Storage", "How many bits/bytes are used and how the pattern is interpreted (two's complement, mantissa/exponent…)."]
      ]}
    ]}},
    "The spec requires you to **understand and use** each type below *and* choose the right one for given data — and to **define user-defined types built from the language-defined (built-in) types**.",
    { callout: { t: "info", h: "The data types the spec names", body: [
      { kv: [
        ["Primitive", "integer, real/float, Boolean, character"],
        ["Built from primitives", "string (sequence of characters), date/time"],
        ["Memory-address type", "pointer/reference"],
        ["Composite", "record (or equivalent), array (or equivalent)"],
        ["User-defined", "new types based on the built-in ones (e.g. enumerated types)"]
      ]}
    ]}},

    { page: "Numeric types" },
    { h: "Integer" },
    "An **integer** stores whole numbers only — positive, negative or zero — with no fractional part. Used for **counts, array indices, IDs and loop counters**. A fixed bit-width gives a finite range (32-bit signed ≈ ±2.1 billion); exceeding it causes *overflow* (see $4.5.4$).",
    { callout: { t: "info", h: "Integer vs real division", body: "Integer division discards the fraction and can give a remainder: `17 DIV 5 = 3`, `17 MOD 5 = 2`. Real division keeps it: `17 / 5 = 3.4`. Confusing the two is a classic bug — see arithmetic operations ($4.1.1.3$)." }},
    { h: "Real / Float" },
    "A **real (float)** stores numbers with a fractional part. Internally it is a **mantissa × 2^exponent** (see floating point, $4.5.4.5$), so most reals are *approximations* — never test two reals for exact equality. Used for **measurements, averages, scientific values** — anything continuous.",
    { table: { head: ["Numeric type", "Stores", "Example", "Typical use"], rows: [
      ["Integer", "Whole numbers only", "`42`, `-7`", "Counts, indices, IDs"],
      ["Real / Float", "Fractional numbers", "`3.14`, `-0.5`", "Measurements, averages"]
    ]}},
    { callout: { t: "miscon", h: "'Number' is not a data type", body: "AQA wants the **precise** term — *integer* or *real* — never 'number'. And an integer **cannot** store a decimal: if a value may be fractional (height, price, average) it must be **real**, or the fractional part is lost to truncation." }},

    { page: "Text & logical types" },
    { h: "Boolean" },
    "A **Boolean** holds one of two logical values: **true** or **false** (conceptually 1 bit). Ideal for any two-state flag — `isLoggedIn`, `hasPaid` — and for the conditions that drive selection and iteration. Supports the logical operations AND, OR, NOT.",
    { h: "Character" },
    "A **character** is a single symbol — letter, digit, space or punctuation — stored as a numeric **character code** (ASCII or Unicode, see $4.5.5$). Codes are sequential, so `'A'`=65, `'B'`=66, and arithmetic on codes works (sorting, case conversion).",
    { h: "String" },
    "A **string** is a sequence of characters, e.g. `\"Kurenai\"`. It is *built from* the character type, not a primitive. Strings support operations a list of separate characters does not: length, concatenation, substring, search and comparison.",
    { h: "Date/Time" },
    "A **date/time** type stores calendar dates and clock times, usually as an offset (ticks/seconds) from a fixed **epoch**. This lets the computer **compare** times, **sort** chronologically and do **date arithmetic** (days between two dates) reliably — which storing a date as a plain string cannot.",
    { callout: { t: "def", h: "Quick reference", body: [
      { kv: [
        ["Boolean", "true / false — flags and conditions"],
        ["Character", "one symbol, stored as a code (ASCII/Unicode)"],
        ["String", "sequence of characters, with text operations"],
        ["Date/Time", "calendar + clock, stored as an offset for comparison/arithmetic"]
      ]}
    ]}},

    { page: "Pointers & references" },
    { h: "Pointers and references" },
    "A **pointer/reference** stores the **memory address** of a value or object, *not the value itself*. This is how programs use **dynamically allocated** memory — objects created at runtime — and how data structures like linked lists, trees and graphs link their nodes (see $4.2$).",
    { callout: { t: "info", h: "What the spec stresses", body: "A pointer/reference variable is a **store for the memory address of an object created at runtime (dynamically)**. Not all languages expose explicit pointer types, but you must understand the concept. In C#/Java, class instances are handled by reference; in C you manipulate pointers directly." }},
    { code: { lang: "csharp", cap: "A reference holds an address, not the object.", src:
"Customer c = new Customer();   // 'c' stores the ADDRESS of the new object\nCustomer d = c;                // d now refers to the SAME object\nd.Name = \"Sora\";              // c.Name is also \"Sora\" — one object, two references" }},
    { callout: { t: "miscon", h: "A reference is not the object", body: "Assigning one reference to another copies the **address**, not the data — both names then point at the *same* object. Expecting an independent copy is a frequent bug and a lost mark." }},

    { page: "Composite types" },
    { h: "Records vs arrays" },
    "Both group many values under one identifier, but they differ in *what* they group:",
    { table: { head: ["", "Record", "Array"], rows: [
      ["Elements", "Named **fields**", "Indexed elements"],
      ["Types", "**Heterogeneous** — fields may differ", "**Homogeneous** — all one type"],
      ["Access", "By field name (`player.score`)", "By index (`scores[3]`)"],
      ["Models", "One entity with mixed attributes", "Many like values"],
      ["Example", "A patient: ID, name, temperature", "30 exam marks"]
    ]}},
    { code: { lang: "csharp", cap: "A record groups mixed fields; an array groups like values.", src:
"public struct Player {        // RECORD: heterogeneous, named fields\n    public int ID;\n    public string Name;\n    public double Score;\n}\nPlayer p = new Player { ID = 1, Name = \"Sora\", Score = 99.5 };\n\nint[] marks = new int[30];   // ARRAY: homogeneous, indexed\nmarks[0] = 72;" }},
    { callout: { t: "tip", h: "Choosing between them", body: "Use a **record** to model *one thing with several attributes of different types*; use an **array** to hold *many values of the same type* you will index or loop over. Combine them — an *array of records* — to model many entities." }},

    { page: "User-defined types" },
    { h: "User-defined data types" },
    "A **user-defined type** is a new type the programmer builds **from the language-defined (built-in) types**. It restricts a variable to valid, meaningful values and makes code self-documenting.",
    { callout: { t: "def", h: "Common forms", body: [
      { kv: [
        ["Enumerated (enum)", "A fixed set of named constants, e.g. `Day { Mon, Tue, … }` — the variable can only hold one of them."],
        ["Record / composite", "Groups named fields of built-in types into one structured type (as above)."],
        ["Subrange (where supported)", "Restricts a built-in type to a range, e.g. `1..31` for a day number."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "An enumerated type built from the built-in integer type.", src:
"enum Suit { Hearts, Diamonds, Clubs, Spades }\nSuit s = Suit.Hearts;   // can ONLY be one of the four — invalid values are impossible" }},
    { callout: { t: "info", h: "Why bother?", body: "Benefits: only valid values can be stored (fewer bugs); code reads like the problem domain (`Suit.Spades` beats the 'magic number' 3); the compiler can check usage. Limitation: an over-engineered type for trivial data adds needless complexity." }},

    { page: "Choosing a type — exam technique" },
    { callout: { t: "tip", h: "Command words", body: [
      { kv: [
        ["State / Identify", "Give the precise type name (integer, real…) — no justification needed."],
        ["Justify / Explain", "Name the type AND the data feature that demands it ('real, because the value has a fractional part'). The reason earns the mark."]
      ]}
    ]}},
    "**Model structure for a 6-mark 'discuss the factors when selecting data types' answer:** (1) precision/range — the type must hold the values without overflow or loss; (2) memory use — smaller types save space, important at scale; (3) valid operations — the type must support the operations needed; (4) readability/safety — Boolean/enum/record model intent and block invalid values; (5) a worked consequence of a wrong choice (integer truncation losing a decimal); (6) a linked conclusion rather than a list.",
    { callout: { t: "memorise", h: "Every type the spec names", body: "Primitives: **integer, real/float, Boolean, character**. Built from these: **string, date/time**. Address type: **pointer/reference**. Composite: **record, array**. Plus **user-defined** types (e.g. enum) built from the above. Know each one's values, operations and best use." }},
    { callout: { t: "miscon", h: "Integer can't hold a decimal", body: "Storing a fractional value (price, average, height) in an integer silently **truncates** it — `7/2` becomes `3`, not `3.5`. If a value may be fractional, use real. And never answer 'number'." }}
  ],
  flashcards: [
    ["Define 'Data Type'.", "Determines the set of values a variable can store, the operations allowed on it, and how it is stored in memory."],
    ["Difference between Integer and Real?", "Integers are whole numbers; Reals have a fractional part (stored as mantissa × 2^exponent)."],
    ["What does a pointer/reference store?", "The memory address of an object or value, not the value itself."],
    ["What is a 'record'?", "A composite type grouping related named fields, which may be of different data types, under one identifier."],
    ["What is a user-defined data type?", "A new type the programmer builds from existing built-in types (e.g. an enumerated type)."],
    ["Why use a String instead of separate Characters?", "A string is one object supporting text operations — length, concatenation, substring, search — that separate characters don't."],
    ["Difference between an Array and a Record?", "An array is *homogeneous* (all elements one type, accessed by index); a record is *heterogeneous* (named fields of possibly different types)."],
    ["Why does choosing a smaller data type matter?", "It saves memory and can improve performance — important at scale or on constrained devices."],
    ["When is a Boolean the ideal type?", "For any two-state flag — `isLoggedIn`, `hasPaid` — clearer and smaller than a string \"yes\"/\"no\"."],
    ["What is an enumerated (enum) type and why use one?", "A user-defined type listing named constants (e.g. `Day{Mon,Tue,…}`); it restricts a variable to valid options and is self-documenting."],
    ["How is a date/time value stored, and why not as a string?", "As an offset from a fixed epoch, so the computer can compare, sort and do arithmetic on dates — a plain string can't be ordered chronologically."],
    ["What is integer (DIV) division vs real division?", "Integer division discards the fraction (`17 DIV 5 = 3`, remainder 2 via MOD); real division keeps it (`17 / 5 = 3.4`)."]
  ],
  quiz: [
    { q: "Which data type is best for storing a person's height in metres?", opts: ["Integer", "Boolean", "Real", "Character"], ans: 2, why: "Height requires a fractional part (e.g. 1.75m), making Real the correct choice." },
    { q: "What is stored in a pointer variable?", opts: ["The value itself", "A Boolean flag", "A memory address", "A character code"], ans: 2, why: "Pointers 'point' to where the data is in RAM by storing its address." },
    { q: "A data type created by the programmer is called…", opts: ["System type", "User-defined type", "Integer", "Global type"], ans: 1, why: "Programmers define their own types (like Records or Enums) to model complex data." },
    { q: "Which of these is a composite data type holding elements of the SAME type?", opts: ["Record", "Array", "Pointer", "Boolean"], ans: 1, why: "Arrays are homogeneous (all elements share one type); Records are usually heterogeneous (different types allowed)." },
    { q: "A program must store whether a payment has been made. The best data type is:", opts: ["String", "Integer", "Boolean", "Real"], ans: 2, why: "A two-state yes/no value is exactly a Boolean — smaller and clearer than a string." },
    { q: "Why might a programmer choose a 1-byte integer type over a 4-byte one for a value known to be 0–200?", opts: ["It is more accurate", "It saves memory", "It allows decimals", "It runs the loop more times"], ans: 1, why: "Matching the type's size to the value's range saves memory, which matters at scale." },
    { q: "Why store a set of days as an enumerated type rather than the integers 0–6?", opts: ["It uses less memory", "Only valid named values can be stored and the code is self-documenting", "Enums run faster", "Integers cannot be stored"], ans: 1, why: "An enum restricts the variable to valid named constants and reads like the domain, preventing invalid values." }
  ],
  exam: [
    { q: "A hospital system stores the following data for patients: PatientID (e.g. 5021), Name (e.g. 'J. Smith'), and BodyTemperature (e.g. 37.2). State the most appropriate data type for each and justify your choice for BodyTemperature.", marks: 4,
      ms: ["PatientID: Integer (1)", "Name: String (1)", "BodyTemperature: Real / Float (1)", "Justification: Temperature requires a fractional part / decimal precision (1)"] },
    { q: "Explain the difference between a record and an array, and give one situation where each is the more appropriate choice.", marks: 4,
      ms: ["Array: indexed collection of elements all of the SAME type (1); appropriate when storing many like values, e.g. 30 exam marks (1)", "Record: collection of named fields that may be of DIFFERENT types (1); appropriate when modelling one entity with mixed attributes, e.g. a patient's ID, name and temperature (1)"] },
    { q: "Discuss the factors a programmer should consider when selecting data types for a new system, and why these choices matter.", marks: 6,
      ms: ["Precision/range — the type must hold the required values without overflow or loss (e.g. Real for fractional data) (1–2)", "Memory usage — smaller types save space, important at scale or on constrained devices (1–2)", "Valid operations — the type must support the operations needed (arithmetic on numbers, concatenation on strings) (1)", "Readability/safety — using Boolean/enum/record models intent and prevents invalid values (1)", "Consequence — wrong types cause bugs (integer truncation), wasted memory, or rejected valid data (1)", "Coherent discussion linking choice to consequence rather than a list (1)"] }
  ]
};

C["compsci:4.1.1.2"] = {
  notes: [
    { h: "The Three Principles of Imperative Programming" },
    "All imperative programs are built using three combining principles: **Sequence**, **Selection**, and **Iteration**.",
    { callout: { t: "def", h: "Core Constructs", body: [
      { kv: [
        ["Sequence", "Executing instructions one after the other in the order they are written."],
        ["Selection", "Choosing which path to follow based on a condition (IF/ELSE, SWITCH/CASE)."],
        ["Iteration", "Repeating a block of code (Loops)."]
      ]}
    ]}},
    { page: "Iteration & loops" },
    { h: "Iteration: Definite vs Indefinite" },
    { table: { head: ["Feature", "Definite (FOR)", "Indefinite (WHILE / REPEAT)"], rows: [
      ["Knowledge of count", "Known before the loop starts", "Not known; depends on a condition"],
      ["Condition test", "Built-in counter", "Start (while) or End (repeat/until)"],
      ["Use Case", "Iterating through an array", "Reading a file until the end is reached"]
    ]}},
    { callout: { t: "tip", h: "Clean Code Practices", body: [
      { kv: [
        ["Identifiers", "Meaningful names for variables and constants to make code self-documenting and readable."],
        ["Subroutines", "Encapsulating logic into procedures and functions to allow for reuse and easier debugging."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "Selection and Iteration in C#.", src:
"// Selection\nif (score > 50) {\n    Console.WriteLine(\"Pass\");\n} else {\n    Console.WriteLine(\"Fail\");\n}\n\n// Definite Iteration\nfor (int i = 0; i < 10; i++) {\n    Console.WriteLine(i);\n}\n\n// Indefinite Iteration (Test at start)\nwhile (energy > 0) {\n    energy -= 1;\n}\n\n// Indefinite Iteration (Test at end)\ndo {\n    Process();\n} while (keepGoing);" }},
    { page: "Exam technique" },
    { callout: { t: "memorise", h: "3 Constructs + Loop Types", body: "Sequence, Selection, Iteration. For iteration — Definite (FOR): count known before loop starts. Indefinite: WHILE (pre-test, may run 0 times) vs DO-WHILE/REPEAT-UNTIL (post-test, runs at least once)." }},
    { callout: { t: "miscon", h: "WHILE ≠ DO-WHILE", body: "WHILE and DO-WHILE are NOT interchangeable. A WHILE loop may never execute if the condition starts as False. A DO-WHILE always executes at least once. Choosing the wrong one causes a logic error." }}
  ],
  flashcards: [
    ["Name the three basic programming constructs.", "Sequence, Selection, and Iteration."],
    ["What is 'Selection'?", "A construct where a decision is made to follow one of two or more paths based on a condition."],
    ["Difference between 'while' and 'do/while' loops?", "While tests the condition at the start (may run 0 times); do/while tests at the end (runs at least once)."],
    ["What is 'Definite Iteration'?", "A loop that repeats a specific number of times, known before the loop starts."],
    ["Why use meaningful identifier names?", "Improves readability and maintainability, making it easier for others (or your future self) to understand the code."],
    ["What is a 'Constant'?", "A named value that cannot be changed while the program is running."],
    ["What is 'nesting'?", "Placing one construct inside another — e.g. an IF inside a FOR loop — to combine decisions and repetition."],
    ["Which selection construct suits many discrete cases of one variable?", "A SWITCH/CASE statement — cleaner than a long IF/ELSE-IF chain when testing one value against many constants."],
    ["When is a FOR loop preferable to a WHILE loop?", "When the number of repetitions is known in advance (definite iteration) — the counter is built into the FOR construct."],
    ["What logic error results from choosing WHILE instead of DO-WHILE?", "If the condition is False at the start, a WHILE body never runs — but the task may require it to run at least once."]
  ],
  quiz: [
    { q: "Which construct is used to choose between two blocks of code based on a Boolean condition?", opts: ["Sequence", "Iteration", "Selection", "Assignment"], ans: 2, why: "Selection (IF/ELSE) is the decision-making construct." },
    { q: "A loop that repeats until a 'Stop' button is pressed is an example of…", opts: ["Definite iteration", "Indefinite iteration", "Nested sequence", "Constant declaration"], ans: 1, why: "You don't know how many times it will run beforehand; it depends on a condition (the button press)." },
    { q: "A 'while' loop is often called a…", opts: ["Post-condition loop", "Pre-condition loop", "Finite loop", "Subroutine"], ans: 1, why: "It tests the condition AT THE START (pre-condition)." },
    { q: "Which of these always executes at least once?", opts: ["FOR loop", "WHILE loop", "DO...WHILE loop", "IF statement"], ans: 2, why: "DO...WHILE tests at the end, so the body executes before the first check." },
    { q: "A menu that should display, then repeat only while the user keeps choosing options, is best written as a…", opts: ["FOR loop", "DO...WHILE loop", "Single IF statement", "Sequence"], ans: 1, why: "It must run at least once (show the menu) then repeat on a condition — a post-test loop fits." }
  ],
  exam: [
    { q: "Explain the difference between definite and indefinite iteration. Provide an example use case for each.", marks: 4,
      ms: ["Definite: number of iterations is known before the loop starts (1)", "Example: iterating through 10 items in an array (1)", "Indefinite: loop continues until a condition is met / number of iterations unknown (1)", "Example: reading lines from a file until EOF is reached (1)"] },
    { q: "Explain the difference between a WHILE loop and a DO-WHILE (REPEAT-UNTIL) loop, and give a situation where DO-WHILE is the correct choice.", marks: 3,
      ms: ["WHILE tests the condition before the body, so it may execute zero times (1)", "DO-WHILE tests after the body, so it always executes at least once (1)", "Situation: validating input / showing a menu, which must run at least once before re-checking (1)"] },
    { q: "A program must read a list of temperatures from a file, count how many are above 30, and stop at the end of the file. Discuss which programming constructs are needed and why, referring to sequence, selection and iteration.", marks: 6,
      ms: ["Sequence — open file, initialise counter, then process, then output, in order (1–2)", "Iteration — indefinite loop reading lines until EOF because the count of lines is unknown (1–2)", "Selection — an IF inside the loop tests whether each temperature > 30 (1)", "Nesting — selection nested within iteration combines the two (1)", "Justification linking each construct to the specific task rather than listing definitions (1)"] }
  ]
};

C["compsci:4.1.1.3"] = {
  notes: [
    { callout: { t: "tip", h: "Arithmetic Operations", body: "Computers perform arithmetic using standard operators. Pay special attention to the difference between 'normal' division, integer division, and modulo." }},
    { callout: { t: "def", h: "Standard Operators", body: [
      { kv: [
        ["Addition (+)", "Sums two values."],
        ["Subtraction (-)", "Finds the difference between two values."],
        ["Multiplication (*)", "Product of two values."],
        ["Division (/)", "Quotient of two values (often results in a Real)."],
        ["Integer Division (DIV)", "Finds how many whole times a number goes into another (discards the remainder)."],
        ["Modulo (MOD)", "Finds the remainder after integer division."]
      ]}
    ]}},
    { callout: { t: "formula", h: "The DIV/MOD relationship", body: "For any integers A and B: `A = (A DIV B) * B + (A MOD B)`" }},
    { page: "Worked examples & uses" },
    { steps: [
      { h: "Calculating 17 DIV 3", m: "17 / 3 = 5.666...", n: "Discard the decimal: result is 5." },
      { h: "Calculating 17 MOD 3", m: "17 / 3 = 5 remainder 2.", n: "The result is the remainder: 2." },
      { h: "Splitting 200 seconds", m: "200 DIV 60 = 3 (minutes)", n: "200 MOD 60 = 20 (seconds) → 3 min 20 s." },
      { h: "Even/odd check", m: "n MOD 2", n: "Result 0 → even; result 1 → odd." }
    ]},
    { callout: { t: "tip", h: "MOD in the Real World", body: "MOD is incredibly useful for: checking if a number is even (`x MOD 2 == 0`), wrapping indices in a circular queue, or converting total minutes into hours and minutes." }},
    { code: { lang: "csharp", cap: "Arithmetic in C#. Note that `/` between two integers performs DIV.", src:
"int a = 17;\nint b = 3;\n\nint quotient = a / b;      // Result: 5 (Integer Division)\nint remainder = a % b;     // Result: 2 (Modulo)\n\ndouble realDiv = 17.0 / 3; // Result: 5.666... (Real Division)" }},
    { callout: { t: "memorise", h: "DIV, MOD and the Formula", body: "DIV = whole-number quotient (remainder discarded). MOD = remainder. Formula: A = (A DIV B) × B + (A MOD B). Common uses: MOD 2 for even/odd check; DIV 60 + MOD 60 to split minutes from total seconds." }},
    { callout: { t: "miscon", h: "Integer Division in C#", body: "In C#, `/` between two integers performs INTEGER division — `10 / 3` gives 3, NOT 3.333. To force real division, at least one operand must be a Real: `10.0 / 3` gives 3.333. This surprises many students." }}
  ],
  flashcards: [
    ["What does DIV (Integer Division) do?", "Returns the whole number part of a division, discarding the remainder."],
    ["What does MOD (Modulo) do?", "Returns the remainder after an integer division."],
    ["What is 20 DIV 6?", "3 (as 6 goes into 20 three whole times)."],
    ["What is 20 MOD 6?", "2 (as 20 = 6 lots of 3, remainder 2)."],
    ["Result of 7 MOD 10?", "7 (10 goes into 7 zero times, remainder is 7)."],
    ["Common use for MOD operator?", "Checking for even/odd numbers, or wrapping indices in circular structures."],
    ["State the DIV/MOD identity for integers A and B.", "A = (A DIV B) × B + (A MOD B)."],
    ["How do you convert totalSeconds into minutes and seconds?", "minutes = totalSeconds DIV 60; seconds = totalSeconds MOD 60."],
    ["In C#, what does `10 / 3` evaluate to and why?", "3 — `/` between two integers performs integer division, discarding the remainder."],
    ["How would you wrap an index back to 0 in a circular buffer of size n?", "index = (index + 1) MOD n — MOD makes it return to 0 after the last slot."]
  ],
  quiz: [
    { q: "What is the value of 13 DIV 4?", opts: ["3.25", "3", "1", "0"], ans: 1, why: "4 goes into 13 three times (12), with 1 left over. DIV takes the 3." },
    { q: "What is the value of 13 MOD 4?", opts: ["3.25", "3", "1", "0"], ans: 2, why: "MOD takes the remainder. 13 − 12 = 1." },
    { q: "A programmer wants to check if a variable 'n' is even. Which condition works?", opts: ["n DIV 2 == 0", "n MOD 2 == 0", "n / 2 == 0", "n % 2 == 1"], ans: 1, why: "Even numbers have no remainder when divided by 2." },
    { q: "If A = 25 and B = 7, what is (A DIV B) + (A MOD B)?", opts: ["3", "4", "7", "10"], ans: 2, why: "25 DIV 7 = 3. 25 MOD 7 = 4. 3 + 4 = 7." },
    { q: "In C#, `int x = 7 / 2;` stores what value in x?", opts: ["3.5", "3", "4", "Error"], ans: 1, why: "Integer division between two ints truncates toward zero, giving 3." }
  ],
  exam: [
    { q: "A digital clock stores the total time elapsed in seconds as an integer variable `totalSeconds`. Write pseudocode or a C# expression to calculate the `minutes` and `seconds` components of this time.", marks: 2,
      ms: ["minutes = totalSeconds DIV 60 (1)", "seconds = totalSeconds MOD 60 (1)"] },
    { q: "Evaluate each expression: (a) 23 DIV 5, (b) 23 MOD 5, (c) 5 MOD 8, (d) (17 DIV 4) × 4 + (17 MOD 4).", marks: 4,
      ms: ["(a) 4 (1)", "(b) 3 (1)", "(c) 5 (1)", "(d) 17 — by the DIV/MOD identity (1)"] },
    { q: "Explain what integer division (DIV) and modulo (MOD) calculate, state the identity that relates them, and give two distinct real-world uses of MOD.", marks: 6,
      ms: ["DIV returns the whole-number quotient, discarding the remainder (1)", "MOD returns the remainder after integer division (1)", "Identity: A = (A DIV B) × B + (A MOD B) (1)", "Use 1: testing even/odd or divisibility (n MOD k == 0) (1)", "Use 2: wrapping indices in a circular structure / clock arithmetic (1)", "Clear worked example demonstrating either use (1)"] }
  ]
};

C["compsci:4.1.1.4"] = {
  notes: [
    { h: "Relational Operations" },
    "Relational operators compare two values and always return a **Boolean** (True or False).",
    { table: { head: ["Operator", "Meaning", "Example (5 ? 3)"], rows: [
      ["=", "Equal to", "False"],
      ["<> or !=", "Not equal to", "True"],
      ["<", "Less than", "False"],
      [">", "Greater than", "True"],
      ["<=", "Less than or equal to", "False"],
      [">=", "Greater than or equal to", "True"]
    ]}},
    { callout: { t: "warn", body: "In many languages (like C#), assignment is `=` and comparison is `==`. In the AQA pseudocode spec, `=` is used for both comparison and assignment depending on context, though `←` is preferred for assignment." }},
    { code: { lang: "csharp", cap: "Relational operators in C#.", src:
"int x = 10;\nint y = 20;\n\nbool result1 = (x == y);   // False\nbool result2 = (x != y);   // True\nbool result3 = (x < y);    // True\nbool result4 = (x >= 10);  // True" }},
    { callout: { t: "memorise", h: "6 Relational Operators", body: "= (equal), <> or != (not equal), < (less than), > (greater than), <= (less or equal), >= (greater or equal). All return a Boolean. In AQA pseudocode, not-equal is <>. In C#, it is !=." }},
    { callout: { t: "miscon", h: "= vs == in C#", body: "In AQA pseudocode, `=` is used for comparison. In C#, `=` is ASSIGNMENT and `==` is comparison. Writing `if (x = 5)` in C# does not compare — it assigns 5 to x. Always use `==` for comparison in C#." }}
  ],
  flashcards: [
    ["What does a relational operator return?", "A Boolean value (True or False)."],
    ["What is the 'Not Equal' operator in AQA pseudocode?", "<>"],
    ["Evaluate (10 <= 10).", "True."],
    ["Evaluate (7 <> 7).", "False."],
    ["What is the difference between = and == in C#?", "= is for assignment; == is for comparison."],
    ["Evaluate (3 > 5).", "False."],
    ["List the six relational operators.", "= (equal), <> / != (not equal), <, >, <=, >=."],
    ["Why must conditions in selection/iteration use relational operators?", "They produce the Boolean the construct tests to decide which path to take or whether to repeat."],
    ["How are strings compared by relational operators?", "Lexicographically (alphabetical/character-code order), not by length — \"apple\" < \"banana\"."],
    ["What bug does writing `if (x = 5)` cause in C#?", "It assigns 5 to x instead of comparing — a logic error; comparison needs `==`."]
  ],
  quiz: [
    { q: "Which operator means 'Greater than or equal to'?", opts: ["=>", ">=", "=<", "<="], ans: 1, why: ">= is the standard symbol." },
    { q: "What is the result of (5 <> 5) in AQA pseudocode?", opts: ["True", "False", "5", "Error"], ans: 1, why: "5 is equal to 5, so 'not equal' is False." },
    { q: "Which of these comparisons returns True?", opts: ["10 < 5", "10 == 5", "10 >= 10", "10 != 10"], ans: 2, why: "10 is equal to 10, so greater-than-or-equal is satisfied." },
    { q: "Relational operators are most commonly used in which construct?", opts: ["Sequence", "Assignment", "Selection", "Constants"], ans: 2, why: "They provide the conditions for IF statements and loops." },
    { q: "In C#, what does the expression `\"cat\" == \"dog\"` evaluate to?", opts: ["True", "False", "Error", "cat"], ans: 1, why: "The two strings are not identical, so equality is False." }
  ],
  exam: [
    { q: "State the result of the following logical expressions where A=5, B=10 and C=5:\n1) A = C\n2) A <> C\n3) B > A\n4) A >= C", marks: 4,
      ms: ["1) True (1)", "2) False (1)", "3) True (1)", "4) True (1)"] },
    { q: "A login system should allow access only when the entered age is at least 18 AND the password matches. Write the Boolean condition using relational operators and state what type the overall expression evaluates to.", marks: 3,
      ms: ["age >= 18 (1)", "AND password == storedPassword / combined with AND (1)", "The whole expression evaluates to a Boolean (True/False) (1)"] },
    { q: "Discuss the role of relational operators in controlling program flow, and explain the consequences of confusing assignment with comparison in C#. Use examples.", marks: 6,
      ms: ["Relational operators produce a Boolean condition that constructs evaluate (1)", "Selection (IF) uses the Boolean to choose which path to execute (1)", "Iteration (WHILE/FOR) uses it to decide whether to continue repeating (1)", "In C# `=` assigns whereas `==` compares (1)", "Worked example: `if (x = 5)` assigns 5 to x and the condition is then truthy — a logic error not caught at compile time for some types (1)", "Consequence: the wrong branch runs / an unintended infinite loop, producing incorrect results that are hard to trace (1)"] }
  ]
};

C["compsci:4.1.1.5"] = {
  notes: [
    { callout: { t: "def", h: "Boolean Operators", body: [
      { kv: [
        ["NOT", "Inversion: NOT True = False; NOT False = True."],
        ["AND", "Conjunction: True only if BOTH inputs are True."],
        ["OR", "Disjunction: True if AT LEAST ONE input is True."],
        ["XOR", "Exclusive OR: True if EXACTLY ONE input is True (True/False or False/True)."]
      ]}
    ]}},
    { h: "Truth Tables" },
    { table: { head: ["A", "B", "AND", "OR", "XOR"], rows: [
      ["0", "0", "0", "0", "0"],
      ["0", "1", "0", "1", "1"],
      ["1", "0", "0", "1", "1"],
      ["1", "1", "1", "1", "0"]
    ]}},
    { callout: { t: "tip", h: "The XOR Secret", body: "Think of XOR as 'Strictly one or the other'. If they are the same (both 0 or both 1), the result is 0." }},
    { code: { lang: "csharp", cap: "Boolean logic in C#.", src:
"bool a = true;\nbool b = false;\n\nbool resNot = !a;       // False\nbool resAnd = a && b;   // False\nbool resOr  = a || b;   // True\nbool resXor = a ^ b;    // True" }},
    { callout: { t: "memorise", h: "AND / OR / XOR / NOT", body: "AND = True only if BOTH inputs are 1. OR = True if AT LEAST ONE is 1. XOR = True if EXACTLY ONE is 1 — same inputs (both 0 or both 1) gives 0. NOT = inverts the single input." }},
    { callout: { t: "miscon", h: "XOR ≠ OR", body: "XOR is NOT the same as OR. OR(1,1) = 1, but XOR(1,1) = 0. XOR means 'one or the other but NOT both'. This is a common exam trap — always check: are both inputs the same?" }}
  ],
  flashcards: [
    ["When is an AND operation True?", "Only when both inputs are True."],
    ["When is an OR operation True?", "When at least one of the inputs is True."],
    ["Define XOR.", "Exclusive OR: True if and only if exactly one input is True."],
    ["What is NOT False?", "True."],
    ["Truth table result for (1 XOR 1)?", "0 (False)."],
    ["Which operator is known as 'conjunction'?", "AND."],
    ["Which operator is known as 'disjunction'?", "OR."],
    ["Why is XOR useful in simple encryption?", "XOR-ing data twice with the same key returns the original — a reversible bit flip."],
    ["How many rows does a truth table with 3 inputs have?", "2³ = 8 rows (one per combination of the inputs)."],
    ["Evaluate NOT(True OR False).", "False — (True OR False) is True, and NOT True is False."]
  ],
  quiz: [
    { q: "Which operator returns True only if both inputs are different?", opts: ["AND", "OR", "XOR", "NOT"], ans: 2, why: "XOR returns 1 for (0,1) and (1,0), and 0 for (0,0) and (1,1)." },
    { q: "What is the result of (True AND (NOT False))?", opts: ["True", "False", "1", "0"], ans: 0, why: "NOT False is True. True AND True is True." },
    { q: "Which Boolean gate is represented by the symbol '^' in C#?", opts: ["AND", "OR", "XOR", "NOT"], ans: 2, why: "^ is the bitwise/logical XOR operator." },
    { q: "How many inputs are required for a NOT operation?", opts: ["1", "2", "3", "Unlimited"], ans: 0, why: "NOT is a unary operator; it takes one input and flips it." },
    { q: "Evaluate (NOT A) OR B when A = True and B = False.", opts: ["True", "False", "Both", "Undefined"], ans: 1, why: "NOT True is False; False OR False is False." }
  ],
  exam: [
    { q: "Complete the truth table for the expression: `(A AND B) OR (NOT A)`", marks: 4,
      ms: ["A=0, B=0: Result 1 (1)", "A=0, B=1: Result 1 (1)", "A=1, B=0: Result 0 (1)", "A=1, B=1: Result 1 (1)"] },
    { q: "Define the AND, OR and XOR operators, stating for each the condition under which it outputs True.", marks: 3,
      ms: ["AND: True only when both inputs are True (1)", "OR: True when at least one input is True (1)", "XOR: True when exactly one input is True (inputs differ) (1)"] },
    { q: "A door unlocks only when a valid card is present AND (a correct PIN is entered OR a master override is active). Using A = valid card, B = correct PIN, C = master override, write the Boolean expression, evaluate it for A=1, B=0, C=1, and explain how a truth table could be used to verify the logic is correct for all input combinations.", marks: 6,
      ms: ["Expression: A AND (B OR C) (1)", "Inner (B OR C) with B=0, C=1 = 1 (1)", "A AND 1 = 1 → door unlocks (1)", "Brackets force OR to be evaluated before AND (precedence) (1)", "A truth table lists every combination of A, B, C — 2³ = 8 rows (1)", "Checking the output column against the intended behaviour for all 8 rows verifies no unintended unlock case exists (1)"] }
  ]
};

C["compsci:4.1.1.6"] = {
  notes: [
    { callout: { t: "def", h: "Variables vs Constants", body: [
      { kv: [
        ["Variable", "A named memory location whose value **can change** during program execution."],
        ["Constant", "A named memory location whose value **cannot change** once the program has started."]
      ]}
    ]}},
    { callout: { t: "tip", h: "Strategic Use of Constants", body: "Constants aren't just for fixed values like Pi; they are for any value that remains invariant during the program's lifecycle." }},
    { page: "Benefits & exam technique" },
    { callout: { t: "tip", h: "Benefits of Constants", body: [
      { kv: [
        ["Maintainability", "Change the value in one place (the declaration) rather than searching/replacing throughout the code."],
        ["Readability", "Named constants like `TAX_RATE` are easier to understand than 'magic numbers' like `0.2`."],
        ["Safety", "The compiler prevents accidental changes to the value during runtime."],
        ["Optimization", "Some compilers can optimize code better when they know a value won't change."]
      ]}
    ]}},
    { callout: { t: "tip", h: "Naming Convention", body: "It is standard practice to use ALL_CAPS for constants to distinguish them from variables at a glance." }},
    { code: { lang: "csharp", cap: "Constants and variables in C#.", src:
"const double PI = 3.14159;\nconst int MAX_USERS = 100;\n\nint currentUsers = 0; // Variable\ncurrentUsers++;      // Can change\n\n// PI = 3.14;        // Error: cannot assign to a constant" }},
    { callout: { t: "memorise", h: "Variable vs Constant", body: "Variable = named memory location whose value CAN change during execution. Constant = named memory location whose value CANNOT change once set. Constant naming convention: ALL_CAPS (e.g. MAX_SPEED, TAX_RATE, PI)." }},
    { callout: { t: "miscon", h: "Constants Aren't Only for Maths", body: "Constants are NOT just for mathematical values like Pi. Any fixed value (MAX_RETRIES, SCREEN_WIDTH, FILE_PATH) should be a constant for safety and maintainability. 'Magic numbers' like 0.2 scattered in code are a bad practice — name them." }}
  ],
  flashcards: [
    ["Define a 'Variable'.", "A named memory location that stores a value which can change during execution."],
    ["Define a 'Constant'.", "A named memory location that stores a value which cannot be changed once the program starts."],
    ["Give an advantage of using a constant over a 'magic number'.", "Easier to maintain; change once at the top to update everywhere."],
    ["How do constants improve security/safety?", "The compiler prevents accidental overwriting of the value during runtime."],
    ["True or False: A variable's data type can change in C# after declaration.", "False (C# is statically typed)."],
    ["Can the value of a constant be set at runtime?", "No, it must be known at compile time in most languages."],
    ["What is a 'magic number' and why is it bad practice?", "An unexplained literal (e.g. 0.2) scattered in code — unclear in meaning and hard to update; replace it with a named constant."],
    ["Give the four main benefits of using constants.", "Maintainability (change in one place), readability (named meaning), safety (no accidental change), and possible compiler optimisation."],
    ["What naming convention identifies a constant at a glance?", "ALL_CAPS with underscores, e.g. MAX_USERS, TAX_RATE."],
    ["Why does using a constant aid maintainability if a rate changes?", "The value lives in one declaration, so updating it once propagates everywhere it is used."]
  ],
  quiz: [
    { q: "Which statement is true about constants?", opts: ["They take up more memory", "Their value can change once", "They improve code readability", "They are only for numbers"], ans: 2, why: "Using names like MAX_LIMIT instead of '500' makes code self-documenting." },
    { q: "What happens if a program tries to change a constant's value?", opts: ["It works normally", "The value is ignored", "A compiler error occurs", "The computer crashes"], ans: 2, why: "Constants are enforced by the compiler/runtime to prevent mutation." },
    { q: "Why use constants for values like 'VAT_RATE'?", opts: ["To save memory", "To make it harder to change", "To allow for easy global updates if the rate changes", "Because variables are too slow"], ans: 2, why: "If VAT changes from 20% to 21%, you only change one line of code." },
    { q: "In C#, which keyword defines a constant?", opts: ["var", "let", "const", "static"], ans: 2, why: "'const' is the keyword for compile-time constants." },
    { q: "Which of these should be stored as a variable rather than a constant?", opts: ["The speed of light", "A player's current score", "The number of days in a week", "Pi"], ans: 1, why: "A score changes during execution, so it must be a variable; the others are fixed." }
  ],
  exam: [
    { q: "A programmer is writing a game and needs to store the gravity value (9.81) and the player's current score. Identify which should be a constant and which a variable, and justify the use of a constant.", marks: 3,
      ms: ["Gravity: Constant; Score: Variable (1)", "Justification: Gravity does not change during the game (1)", "Using a constant prevents accidental changes / improves readability (1)"] },
    { q: "Explain what is meant by a 'magic number' and describe two benefits of replacing magic numbers with named constants.", marks: 4,
      ms: ["A magic number is an unexplained literal value embedded directly in code (1)", "Its meaning is unclear to a reader (1)", "Benefit: a named constant documents intent / improves readability (1)", "Benefit: changing the value once updates every use, aiding maintenance (1)"] },
    { q: "Discuss why the use of constants is considered good programming practice, referring to maintainability, readability and safety.", marks: 6,
      ms: ["Maintainability — value defined once; a change propagates everywhere, reducing error-prone search/replace (1–2)", "Readability — a name like TAX_RATE conveys meaning that 0.2 does not (1–2)", "Safety — the compiler prevents accidental modification at runtime, eliminating a class of bugs (1–2)", "Coherent argument with an example (e.g. VAT change) rather than a bare list (1)"] }
  ]
};

C["compsci:4.1.1.7"] = {
  notes: [
    { h: "String-Handling Operations" },
    "Strings are more than just text; they are objects or arrays of characters that we can manipulate.",
    { table: { head: ["Operation", "AQA Pseudo", "Effect", "Example (\"KOS\")"], rows: [
      ["Length", "LEN(s)", "Returns number of characters", "3"],
      ["Position", "POSITION(s, c)", "Index of first char 'c' in 's'", "1 (if 0-indexed)"],
      ["Substring", "SUBSTRING(i, j, s)", "Extracts chars from index i to j", "SUB(0,1) → \"KO\""],
      ["Concatenation", "s1 + s2", "Joins two strings", "\"KOS\" + \"!\" → \"KOS!\""]
    ]}},
    { page: "Conversion & exam technique" },
    { callout: { t: "def", h: "Character Conversion", body: [
      { kv: [
        ["CHAR_TO_CODE", "Returns the ASCII/Unicode integer for a character (e.g. 'A' → 65)."],
        ["CODE_TO_CHAR", "Returns the character for a given integer (e.g. 66 → 'B')."]
      ]}
    ]}},
    { callout: { t: "warn", h: "Zero-based vs One-based", body: "Most languages (C#, Python) are 0-indexed. Some pseudocode in exams might use 1-based indexing. **Always check the question's indexing rule.**" }},
    { code: { lang: "csharp", cap: "String manipulation in C#.", src:
"string s = \"KurenaiOS\";\nint len = s.Length;                // 9\nchar first = s[0];                 // 'K'\nstring sub = s.Substring(0, 3);    // \"Kur\" (start, length)\nint pos = s.IndexOf('O');          // 7\nstring combined = s + \" 2.0\";      // Concatenation\n\nint code = (int)'A';               // 65 (CHAR_TO_CODE)\nchar c = (char)66;                 // 'B' (CODE_TO_CHAR)" }},
    { callout: { t: "memorise", h: "String Operations", body: "LEN(s) = number of characters. SUBSTRING(i, j, s) = extract characters. POSITION(s, c) = find character index. s1 + s2 = concatenate. CHAR_TO_CODE('A') = 65. CODE_TO_CHAR(66) = 'B'. Always check: 0-based or 1-based indexing!" }},
    { callout: { t: "miscon", h: "\"12\" + \"34\" = \"1234\", Not 46", body: "When operands are STRINGS, + means concatenation — not arithmetic. \"12\" + \"34\" = \"1234\". Only when both operands are numeric types does + perform addition. A very common beginner mistake." }}
  ],
  flashcards: [
    ["What does LEN(\"Hello\") return?", "5."],
    ["What is string concatenation?", "Joining two or more strings together to form a new string."],
    ["What does SUBSTRING(2, 4, \"COMPUTER\") return? (0-indexed, length 4)", "\"MPUT\" (Note: AQA pseudocode parameters vary; check if 2nd param is length or end index)."],
    ["What is CHAR_TO_CODE('a')?", "97 (Standard ASCII)."],
    ["How do you find the position of a character in a string?", "Using the POSITION(string, char) or IndexOf() function."],
    ["Result of \"12\" + \"34\"?", "\"1234\" (Concatenation, not addition)."],
    ["Why is checking 0-based vs 1-based indexing essential in string questions?", "The same SUBSTRING/POSITION call gives different answers depending on where counting starts; the question states the convention."],
    ["How could you convert a lowercase letter's code to uppercase using CHAR codes?", "Subtract 32 from its ASCII code ('a'=97 → 'A'=65), since lowercase letters sit 32 above their uppercase pair."],
    ["What sequence of operations extracts the file extension from \"photo.png\"?", "Find the position of '.', then take a SUBSTRING from there to the end."],
    ["Why convert characters to codes at all (CHAR_TO_CODE)?", "To do arithmetic/comparison on characters — sorting, ciphers (Caesar shift), and case conversion all rely on the numeric code."]
  ],
  quiz: [
    { q: "Which operation returns the number of characters in a string?", opts: ["SIZE()", "COUNT()", "LEN()", "WIDTH()"], ans: 2, why: "LEN() is the standard pseudocode function for length." },
    { q: "What is the result of CHAR_TO_CODE('A') + 1?", opts: ["'B'", "66", "A1", "Error"], ans: 1, why: "'A' is 65. 65 + 1 = 66." },
    { q: "If s = \"REVISION\", what is SUBSTRING(0, 3, s)? (0-indexed, length 3)", opts: ["\"REV\"", "\"REVI\"", "\"EVI\"", "\"VIS\""], ans: 0, why: "Starts at index 0, takes 3 characters: R, E, V." },
    { q: "What happens during string concatenation?", opts: ["The strings are added numerically", "The strings are compared", "The strings are joined end-to-end", "The first string is deleted"], ans: 2, why: "Concatenation is the 'glue' operation for text." },
    { q: "Applying CODE_TO_CHAR(CHAR_TO_CODE('C') + 2) gives:", opts: ["'A'", "'E'", "'C2'", "67"], ans: 1, why: "'C' is 67; 67 + 2 = 69; CODE_TO_CHAR(69) = 'E' — a Caesar shift of 2." }
  ],
  exam: [
    { q: "A variable `word` contains the string \"ALGORITHM\". Show the output of the following operations:\n1) LEN(word)\n2) SUBSTRING(4, 3, word) [start index 4, length 3, 0-indexed]\n3) CHAR_TO_CODE(word[0]) [Assume A=65]", marks: 3,
      ms: ["1) 9 (1)", "2) \"RIT\" (1)", "3) 65 (1)"] },
    { q: "Describe, using string-handling operations, an algorithm to count how many times the character 'e' appears in a string `s`.", marks: 4,
      ms: ["Initialise a counter to 0 (1)", "Loop from index 0 to LEN(s) − 1 (1)", "Compare each character s[i] with 'e' (1)", "If equal, increment the counter; output the counter after the loop (1)"] },
    { q: "A program must validate that a username is between 5 and 12 characters and contains an '@'. Explain which string-handling operations you would use and how, and state the data type of the result of each check.", marks: 6,
      ms: ["Use LEN(username) to get the length (1)", "Compare LEN >= 5 AND LEN <= 12 — these comparisons return Booleans (1–2)", "Use POSITION(username, '@') (or IndexOf) to test for '@' (1)", "If the position indicates 'not found' the check fails — also a Boolean result (1)", "Combine the Boolean results with AND for the overall valid/invalid decision (1)"] }
  ]
};

C["compsci:4.1.1.8"] = {
  notes: [
    { callout: { t: "tip", h: "Random Number Generation", body: "Computers are deterministic, so 'random' numbers are actually **Pseudo-Random**: generated by a mathematical formula that appears random but eventually repeats." }},
    { callout: { t: "def", h: "Key Concepts", body: [
      { kv: [
        ["Seed", "The starting value for the random algorithm. Using the same seed produces the same sequence, which is essential for debugging."],
        ["Range", "The interval within which the number is generated (e.g., 1 to 100)."]
      ]}
    ]}},
    { callout: { t: "tip", h: "Real Randomness", body: "For true randomness (e.g., for high-security encryption), computers use physical entropy like atmospheric noise or radioactive decay." }},
    { code: { lang: "csharp", cap: "Generating random numbers in C#.", src:
"Random rng = new Random();\n\nint dieRoll = rng.Next(1, 7);     // 1 to 6 (7 is exclusive upper bound)\ndouble probability = rng.NextDouble(); // 0.0 to 1.0" }},
    { callout: { t: "memorise", h: "Pseudo-Random vs True Random", body: "Pseudo-random = deterministic algorithm that appears random but eventually repeats. Seed = starting value; same seed → same sequence (useful for debugging). True randomness needs physical entropy: atmospheric noise, radioactive decay, etc." }},
    { callout: { t: "miscon", h: "Multiple new Random() = Same Sequence", body: "In C#, creating `new Random()` many times quickly gives the SAME sequence because all instances use the system clock as seed — and the clock hasn't changed yet. Create ONE Random instance and reuse it." }}
  ],
  flashcards: [
    ["Why are computer-generated random numbers called 'pseudo-random'?", "They are generated by a deterministic algorithm and will eventually repeat."],
    ["What is a 'seed' in random generation?", "The starting value for the algorithm."],
    ["How do you generate a random integer between 1 and 10 in C#?", "`rng.Next(1, 11);`"],
    ["When might you want to use a fixed seed?", "During debugging, to ensure the 'random' behaviour is reproducible."],
    ["Name a source of 'true' randomness.", "Atmospheric noise, thermal jitter, or radioactive decay."],
    ["What is the standard range of a NextDouble() style function?", "Between 0.0 (inclusive) and 1.0 (exclusive)."],
    ["Why is pseudo-randomness unsuitable for high-security cryptography?", "Its sequence is predictable if the algorithm and seed are known, so keys could be reproduced; true entropy is needed."],
    ["How would you map a 0.0–1.0 real to an integer dice roll 1–6?", "FLOOR(random × 6) + 1 — scale to the range size then offset to the minimum."],
    ["Give one advantage of pseudo-random over true random generation.", "It is fast, requires no special hardware, and is reproducible for testing via a fixed seed."],
    ["What is meant by the 'period' of a pseudo-random generator?", "The number of values it produces before the sequence repeats — a longer period is better."]
  ],
  quiz: [
    { q: "Pseudo-random numbers are generated using…", opts: ["Atmospheric noise", "A deterministic algorithm", "User input speed", "Magic"], ans: 1, why: "Algorithms are used to simulate randomness." },
    { q: "Using the same seed will result in…", opts: ["A different sequence", "The same sequence", "A crash", "Infinite numbers"], ans: 1, why: "The algorithm starts from the same point, so the path is identical." },
    { q: "To get a random number between 1 and 50 inclusive using `RANDOM_INT(min, max)`, you use:", opts: ["(1, 50)", "(0, 50)", "(1, 51)", "(1, 49)"], ans: 0, why: "Standard pseudocode usually includes both bounds." },
    { q: "Which is a common source for a default seed?", opts: ["User's name", "System clock (milliseconds)", "Hard drive size", "Number of files"], ans: 1, why: "The time is always changing, providing a 'fresh' seed each run." },
    { q: "Why is a pseudo-random generator unsuitable for generating an encryption key?", opts: ["It is too slow", "Its output is predictable if seed and algorithm are known", "It cannot produce integers", "It needs special hardware"], ans: 1, why: "Predictable sequences can be reproduced by an attacker; cryptography needs true entropy." }
  ],
  exam: [
    { q: "Explain why a developer might use a fixed seed during the testing phase of a procedurally generated game.", marks: 2,
      ms: ["To ensure the same game world/events are generated every time (1)", "Allows for consistent debugging/reproduction of errors found by testers (1)"] },
    { q: "Explain the difference between pseudo-random and true random number generation, giving one situation where each is appropriate.", marks: 4,
      ms: ["Pseudo-random: produced by a deterministic algorithm from a seed; eventually repeats (1); appropriate for games/simulations where speed and reproducibility matter (1)", "True random: derived from physical entropy (atmospheric/thermal noise) and unpredictable (1); appropriate for cryptographic keys/security (1)"] },
    { q: "A simulation needs random integers 1 to 6 from a function `RAND()` returning a real in [0.0, 1.0). Describe how to transform the output into the required range, and discuss why pseudo-randomness is acceptable for the simulation but unacceptable for generating encryption keys.", marks: 6,
      ms: ["Multiply RAND() by 6 to scale to [0.0, 6.0) (1)", "Apply FLOOR/integer truncation to get 0–5 (1)", "Add 1 to shift the range to 1–6 (1)", "Pseudo-random is fine for simulation: it only needs apparent unpredictability and benefits from reproducibility for testing (1)", "For encryption, the sequence must be unpredictable to an attacker (1)", "A known algorithm + seed makes pseudo-random output reproducible, so keys could be regenerated — true entropy is required instead (1)"] }
  ]
};

C["compsci:4.1.1.9"] = {
  notes: [
    { callout: { t: "tip", h: "Exception Handling", body: "An **exception** is a runtime error that disrupts the normal flow of the program. Handling exceptions allows for graceful recovery instead of a hard crash." }},
    { callout: { t: "def", h: "The Try-Catch Mechanism", body: [
      { kv: [
        ["Try", "The block of code to monitor for potential errors."],
        ["Catch", "The block that executes if an error occurs within the Try block."],
        ["Finally", "A block that runs regardless of whether an exception occurred, used for cleanup (e.g., closing files)."],
        ["Throw", "Manually triggering an exception when a specific error condition is met."]
      ]}
    ]}},
    { callout: { t: "warn", h: "Exception vs Bug", body: "A syntax error is caught by the compiler. An exception is a **runtime** event often caused by external factors like missing files or invalid user input." }},
    { code: { lang: "csharp", cap: "Try-Catch-Finally in C#.", src:
"try {\n    int a = 10;\n    int b = 0;\n    int result = a / b; // Throws DivideByZeroException\n} catch (DivideByZeroException ex) {\n    Console.WriteLine(\"Cannot divide by zero!\");\n} catch (Exception ex) {\n    Console.WriteLine(\"A different error occurred.\");\n} finally {\n    Console.WriteLine(\"Cleanup complete.\");\n}" }},
    { callout: { t: "memorise", h: "Try → Catch → Finally", body: "Try: monitor for errors. Catch: handle error if thrown. Finally: ALWAYS runs (cleanup, close files). Multiple Catch blocks handle different exception types. Throw: manually signal an error condition." }},
    { callout: { t: "miscon", h: "Try-Catch Doesn't Fix All Errors", body: "Exception handling only handles RUNTIME errors gracefully. It cannot catch LOGIC errors (wrong algorithm) or SYNTAX errors (caught at compile time). It is not a substitute for writing correct code — just a safety net." }}
  ],
  flashcards: [
    ["Define an 'Exception'.", "A runtime error that disrupts the normal execution of a program."],
    ["What is the purpose of the 'Try' block?", "To enclose code that might throw an exception so it can be monitored."],
    ["What does the 'Catch' block do?", "Executes code to handle the error if an exception occurs in the Try block."],
    ["When does the 'Finally' block run?", "Always, whether an exception occurred or not."],
    ["Difference between a Syntax Error and an Exception?", "Syntax errors are caught at compile-time; exceptions happen at runtime."],
    ["What does 'Throw' mean?", "To manually signal that an exception has occurred."],
    ["Why have multiple Catch blocks for one Try?", "To handle different exception types differently — e.g. a missing file vs a divide-by-zero need different responses."],
    ["What is meant by 'failing gracefully'?", "Handling an error with a clear message and safe recovery instead of an abrupt crash that loses data."],
    ["Give a typical use of the Finally block.", "Releasing resources — closing files, database connections or network sockets — whether or not an error occurred."],
    ["Why is exception handling NOT a substitute for input validation?", "Validation prevents bad data entering; exceptions only react after a runtime fault. Good code does both."]
  ],
  quiz: [
    { q: "Which block is used to 'clean up' resources like open files?", opts: ["Try", "Catch", "Finally", "Else"], ans: 2, why: "Finally runs no matter what, ensuring resources are released." },
    { q: "What is the benefit of exception handling?", opts: ["Makes code run faster", "Prevents all errors", "Allows programs to handle errors without crashing", "Automatic bug fixing"], ans: 2, why: "It provides a way to 'fail gracefully'." },
    { q: "A 'File Not Found' error is an example of…", opts: ["Syntax error", "Logic error", "Exception", "Constant"], ans: 2, why: "It happens at runtime when the program tries to access a missing file." },
    { q: "Can you have multiple Catch blocks for one Try?", opts: ["Yes", "No", "Only if there is no Finally", "Only in Java"], ans: 0, why: "You can catch specific exception types (e.g. IO vs Math) to handle them differently." },
    { q: "Which type of error can exception handling NOT deal with at runtime?", opts: ["Divide by zero", "File not found", "A syntax error", "Invalid array index"], ans: 2, why: "Syntax errors are caught by the compiler before the program runs, so there is nothing to catch at runtime." }
  ],
  exam: [
    { q: "A program asks a user for a filename and then opens it. Describe how exception handling could be used to make this program more robust.", marks: 3,
      ms: ["Enclose the file-opening code in a 'Try' block (1)", "Use a 'Catch' block to detect if the file does not exist / is locked (1)", "Output a user-friendly error message rather than the program crashing (1)"] },
    { q: "Explain the roles of the Try, Catch and Finally blocks in exception handling.", marks: 3,
      ms: ["Try: encloses code that might raise an exception so it is monitored (1)", "Catch: runs if an exception occurs, handling the error (1)", "Finally: always runs, used to release/clean up resources (1)"] },
    { q: "Discuss why exception handling improves software robustness, and explain its limits — i.e. the kinds of error it cannot address.", marks: 6,
      ms: ["Lets a program detect runtime faults (missing file, bad input, divide-by-zero) and respond rather than crash (1–2)", "Improves user experience and protects data via graceful failure and resource cleanup in Finally (1–2)", "Limit: cannot fix logic errors — the program still runs but produces wrong results (1)", "Limit: cannot catch syntax errors — these are stopped at compile time (1)", "Conclusion: a safety net, not a replacement for correct code and input validation (1)"] }
  ]
};

C["compsci:4.1.1.10"] = {
  notes: [
    { callout: { t: "tip", h: "Modular Programming", body: "A **subroutine** is a named, self-contained block of code that performs a specific task, promoting code reuse and logical decomposition." }},
    { callout: { t: "def", h: "Procedures vs Functions", body: [
      { kv: [
        ["Procedure", "A subroutine that performs a task but does NOT return a value to the calling code."],
        ["Function", "A subroutine that performs a task AND returns a value to the caller."]
      ]}
    ]}},
    { callout: { t: "tip", h: "Benefits of Subroutines", body: [
      { kv: [
        ["Code Reuse", "Write once, call many times — avoids duplication and reduces code volume."],
        ["Maintainability", "Fix a bug in the subroutine, and it's fixed everywhere it's called."],
        ["Readability", "Breaks complex problems into smaller, manageable chunks (Decomposition)."],
        ["Teamwork", "Different programmers can work on different subroutines independently with agreed interfaces."],
        ["Testing", "Subroutines can be tested in isolation to ensure they work correctly before integration."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "A Procedure vs a Function in C#.", src:
"// Procedure (void return type)\npublic void Greet(string name) {\n    Console.WriteLine($\"Hello, {name}!\");\n}\n\n// Function (int return type)\npublic int Square(int number) {\n    return number * number;\n}\n\n// Calling them\nGreet(\"Kurenai\");\nint result = Square(5); // result is 25" }},
    { callout: { t: "tip", h: "Structured Programming", body: "Subroutines are the heart of **structured programming**. Using them allows for top-down design, where a large problem is broken down into sub-problems." }},
    { callout: { t: "memorise", h: "Procedure vs Function", body: "Procedure = subroutine that performs a task, NO return value (void in C#). Function = subroutine that performs a task AND returns a value to the caller. Both reduce code duplication and improve structure." }},
    { callout: { t: "miscon", h: "Subroutines Don't Make Code Faster", body: "Subroutines do NOT improve runtime speed — each call has a small overhead (stack frame push/pop). Their benefit is SOFTWARE QUALITY: readability, maintainability, reuse, and testability. Performance is a separate concern." }}
  ],
  flashcards: [
    ["Define a 'Subroutine'.", "A named, self-contained block of code that performs a specific task and can be called by name."],
    ["Difference between a Procedure and a Function?", "A function returns a value; a procedure does not."],
    ["Three advantages of using subroutines?", "Code reuse, easier maintenance, and improved readability through decomposition."],
    ["What is the 'interface' of a subroutine?", "The method signature: its name, parameters, and return type."],
    ["How do subroutines help with team programming?", "Tasks can be assigned to different developers who write separate subroutines with agreed-upon interfaces."],
    ["Why does a function need a return type?", "To tell the compiler what kind of data the calling code should expect back."],
    ["What is decomposition and how do subroutines support it?", "Breaking a large problem into smaller sub-problems; each sub-problem becomes a subroutine that can be designed and tested separately."],
    ["Do subroutines make a program run faster?", "No — each call has slight overhead. Their benefit is software quality (reuse, readability, maintainability, testability), not speed."],
    ["Why can subroutines be tested in isolation?", "Each has a defined interface (inputs/outputs), so it can be given test inputs and checked independently before integration (unit testing)."],
    ["What is structured (top-down) design?", "Designing a solution by repeatedly breaking the problem into subroutines, refining from the overall task down to detail."]
  ],
  quiz: [
    { q: "Which type of subroutine would you use to just print a message to the screen?", opts: ["Function", "Procedure", "Constant", "Variable"], ans: 1, why: "Printing is a task that doesn't necessarily need to return data to the caller, making it a procedure." },
    { q: "What keyword is used in C# to indicate a procedure (no return value)?", opts: ["null", "static", "void", "empty"], ans: 2, why: "'void' means the method returns nothing." },
    { q: "If you change the logic inside a subroutine, what happens to the code that calls it?", opts: ["It must be rewritten", "It automatically uses the new logic", "It will crash", "Nothing, it uses the old version"], ans: 1, why: "This is a key benefit of maintenance: change the logic in one place, and it updates everywhere." },
    { q: "A 'SquareRoot' subroutine should be implemented as a…", opts: ["Procedure", "Function", "Global variable", "Class"], ans: 1, why: "You need the result of the calculation back, so it must return a value." },
    { q: "Which is NOT a genuine benefit of using subroutines?", opts: ["Code reuse", "Easier testing in isolation", "Faster execution speed", "Improved readability"], ans: 2, why: "Subroutines add a small call overhead; their value is software quality, not raw speed." }
  ],
  exam: [
    { q: "State two advantages of using subroutines when developing a large software project involving multiple programmers.", marks: 2,
      ms: ["Allows for code reuse / avoids duplication (1)", "Enables different programmers to work on separate modules simultaneously (1)", "Easier to test and debug small blocks of code in isolation (max 2)"] },
    { q: "Explain the difference between a procedure and a function, giving an example use of each.", marks: 4,
      ms: ["Procedure: performs a task but returns no value (1); e.g. printing a formatted report to screen (1)", "Function: performs a task and returns a value to the caller (1); e.g. calculating and returning the average of an array (1)"] },
    { q: "Discuss how the use of subroutines improves the development and maintenance of a large software system. Refer to decomposition, reuse, testing and teamwork.", marks: 6,
      ms: ["Decomposition — a large problem is split into smaller, manageable subroutines (top-down design) (1–2)", "Reuse — common logic is written once and called many times, reducing duplication and code size (1–2)", "Testing — each subroutine has a defined interface so can be unit-tested in isolation before integration (1)", "Teamwork — different programmers can develop separate subroutines simultaneously against agreed interfaces (1)", "Maintenance — a fix in one subroutine propagates to every caller (1)", "Coherent discussion rather than a list (1)"] }
  ]
};

C["compsci:4.1.1.11"] = {
  notes: [
    { callout: { t: "tip", h: "Passing Data", body: "Data is passed into subroutines using parameters. The method of passing determines whether the original data can be modified." }},
    { callout: { t: "def", h: "Parameters and Arguments", body: [
      { kv: [
        ["Parameter", "The placeholder defined in the subroutine signature (e.g., `int x`)."],
        ["Argument", "The actual value passed into the subroutine during a call (e.g., `5`)."],
        ["Pass by Value", "A COPY of the data is passed. The original variable is NOT affected by changes within the subroutine."],
        ["Pass by Reference", "A pointer to the original memory location is passed. Changes within the subroutine DO affect the original variable."]
      ]}
    ]}},
    { callout: { t: "warn", h: "Pass by Value vs Reference", body: "In AQA pseudocode, you must specify `ByVal` or `ByRef`. In C#, basic types (int, bool) are passed by value by default, while objects are passed by reference." }},
    { code: { lang: "csharp", cap: "Passing data in C#.", src:
"// Pass by Value (Default for int)\nvoid IncrementVal(int x) {\n    x += 1;\n}\n\n// Pass by Reference (using 'ref' keyword)\nvoid IncrementRef(ref int x) {\n    x += 1;\n}\n\nint a = 10;\nIncrementVal(a); // a is still 10\nIncrementRef(ref a); // a is now 11" }},
    { callout: { t: "memorise", h: "Value vs Reference Passing", body: "Parameter = placeholder in the definition. Argument = actual value in the call. Pass by VALUE = copy is made, original unchanged (default for primitives in C#). Pass by REFERENCE = address passed, original IS modified (use `ref` in C#)." }},
    { callout: { t: "miscon", h: "Pass by Reference Isn't Always Better", body: "Pass by reference is NOT always preferable. Pass by value PROTECTS the original from accidental modification (safer). Only use pass by reference when you deliberately want the subroutine to change the caller's variable." }}
  ],
  flashcards: [
    ["Difference between a parameter and an argument?", "Parameter is the definition (placeholder); Argument is the actual value passed in."],
    ["Explain 'Pass by Value'.", "A copy of the data is passed to the subroutine; the original remains unchanged."],
    ["Explain 'Pass by Reference'.", "The memory address of the original data is passed; changes in the subroutine affect the original variable."],
    ["Which passing method is more memory efficient for large objects?", "Pass by Reference (it avoids copying the whole object)."],
    ["What happens to an original integer if passed ByVal and changed inside the subroutine?", "Nothing; only the copy inside the subroutine changes."],
    ["Keyword for passing by reference in C#?", "`ref` (or `out`)."],
    ["Give one advantage and one risk of pass by reference.", "Advantage: efficient for large data and lets a subroutine update the caller's variable. Risk: unintended side effects if the original is changed by accident."],
    ["Why is pass by value considered the 'safer' default?", "The subroutine works on a copy, so it cannot accidentally corrupt the caller's data."],
    ["When must you use pass by reference?", "When the subroutine is meant to modify the caller's variable, or to return multiple values (e.g. via `out`/`ref`)."],
    ["In C#, how are objects (reference types) passed by default?", "The reference is passed by value — so changes to the object's contents are seen by the caller, but reassigning the parameter is not."]
  ],
  quiz: [
    { q: "Which method passes the address of the variable rather than its contents?", opts: ["Pass by Value", "Pass by Reference", "Pass by Pointer", "Global access"], ans: 1, why: "Reference means 'referring' to the original location in memory." },
    { q: "A subroutine `AddOne(ByVal n)` is called with `x = 5`. After the call, `x` is…", opts: ["4", "5", "6", "Unknown"], ans: 1, why: "ByVal protects the original variable from being changed." },
    { q: "Why might you choose Pass by Value even for a large object?", opts: ["It is faster", "It uses less memory", "It prevents accidental side effects on the original data", "It is easier to code"], ans: 2, why: "ByVal ensures the subroutine cannot 'mess up' the data owned by the caller." },
    { q: "In the signature `void Process(int count)`, 'count' is a…", opts: ["Argument", "Parameter", "Constant", "Global"], ans: 1, why: "It's the name used in the definition." },
    { q: "A subroutine `Double(ByRef n)` is called with `x = 5` and sets n = n × 2. After the call, x is…", opts: ["5", "10", "0", "Unknown"], ans: 1, why: "ByRef passes the address, so doubling n updates the caller's x to 10." }
  ],
  exam: [
    { q: "Describe the difference between passing a parameter by value and passing it by reference. Include the effect on the original variable in your answer.", marks: 4,
      ms: ["Pass by value: a local copy of the data is made (1)", "Original variable is not changed by the subroutine (1)", "Pass by reference: memory address of the original is passed (1)", "Original variable is updated if the parameter is modified (1)"] },
    { q: "Distinguish between a parameter and an argument, using the call `result = Area(5, 3)` to a subroutine `Area(width, height)` as an example.", marks: 2,
      ms: ["Parameters are width and height — the placeholders in the definition (1)", "Arguments are 5 and 3 — the actual values supplied in the call (1)"] },
    { q: "Discuss when a programmer should choose pass by value versus pass by reference. Use the example of a subroutine that must swap two of the caller's variables, and weigh the safety and efficiency trade-offs of each method.", marks: 6,
      ms: ["Pass by value passes a copy; the original is protected from change (1)", "Pass by reference passes the address; changes affect the caller's variable (1)", "A swap must use pass by reference, because it has to alter the caller's actual variables (1)", "Pass by value would only swap local copies, leaving the originals unchanged (1)", "Efficiency: reference avoids copying large objects (1)", "Trade-off/safety: value is safer (no side effects) and should be the default; reference is used only when modification or efficiency demands it (1)"] }
  ]
};

C["compsci:4.1.1.12"] = {
  notes: [
    { callout: { t: "def", h: "The Return Statement", body: [
      { kv: [
        ["Function", "Sends a specific value back to the caller and terminates the subroutine execution."],
        ["Immediate Exit", "Execution stops the moment a return statement is reached; no further code in that subroutine runs."]
      ]}
    ]}},
    { callout: { t: "tip", body: "A function can return simple types (int, string) or complex types (Arrays, Objects). In some languages, you can return multiple values using Tuples or Records." }},
    { code: { lang: "csharp", cap: "Returning data from functions.", src:
"public string GetGrade(int score) {\n    if (score >= 80) return \"A\";\n    if (score >= 70) return \"B\";\n    return \"U\"; // Final return if no others hit\n}\n\nstring myGrade = GetGrade(85); // \"A\"" }},
    { callout: { t: "memorise", h: "return: Value + Immediate Exit", body: "return sends a value to the caller AND immediately exits the function. A function can have multiple return statements (one per branch) but exactly ONE executes per call. In C#, all code paths in a non-void function MUST have a return." }},
    { callout: { t: "miscon", h: "Multiple Returns ≠ Multiple Values", body: "Multiple return statements do NOT mean multiple values are sent back simultaneously — exactly one executes per call. Also: return does not restart the function. It exits completely, passing control back to the caller." }}
  ],
  flashcards: [
    ["What keyword is used to send data back from a function?", "return"],
    ["Can a procedure return a value?", "No, by definition procedures do not return values."],
    ["What happens to a function's execution after a 'return' statement?", "It terminates immediately and returns control to the caller."],
    ["Can a function have multiple return statements?", "Yes (e.g. inside an IF/ELSE), but only one will execute."],
    ["What is the return type of a function that returns True/False?", "Boolean."],
    ["Why is it useful to return a value rather than just printing it?", "Allows the caller to use the result in further calculations or logic."],
    ["How can a function effectively return more than one value?", "By returning a composite type — a record/object, an array, or a tuple — bundling several values together."],
    ["What does it mean that a function call is an 'expression'?", "Because it evaluates to a value, it can appear anywhere a value can — in assignments, conditions, or as an argument."],
    ["Why must every path of a non-void C# function return a value?", "The caller expects a value of the declared type; a path with no return would leave it undefined, so the compiler rejects it."],
    ["Contrast returning a value with using a global variable to pass a result.", "Returning is explicit and side-effect-free (safer/clearer); a global creates hidden coupling and side-effect bugs."]
  ],
  quiz: [
    { q: "What is the return type of `public int Calculate()`?", opts: ["Void", "String", "Int", "Boolean"], ans: 2, why: "The keyword before the name defines the type." },
    { q: "A function reaches a `return` statement inside a loop. What happens?", opts: ["The loop continues", "The loop ends but the function continues", "The function exits immediately", "An error occurs"], ans: 2, why: "Return is an absolute exit for the subroutine." },
    { q: "Which of these is a valid use of a function call?", opts: ["int x = GetValue();", "if (CheckValue()) { ... }", "Console.WriteLine(Calculate());", "All of the above"], ans: 3, why: "Functions return values, so they can be treated like values in expressions." },
    { q: "If a function doesn't hit a return statement but is expected to return an int…", opts: ["It returns 0", "It returns null", "A compiler error occurs", "It crashes at runtime"], ans: 2, why: "In typed languages like C#, all paths must return a value if a return type is specified." },
    { q: "To return both a quotient and a remainder from one function, you would return a…", opts: ["single integer", "void", "record/tuple containing both", "global variable"], ans: 2, why: "Bundling values in a composite type (record/tuple) lets one return carry multiple results." }
  ],
  exam: [
    { q: "Write a function in pseudocode or C# that takes two integers, `a` and `b`, and returns the larger of the two.", marks: 3,
      ms: ["Correct signature (function name and parameters) (1)", "Comparison logic (IF a > b) (1)", "Correct return statements for both cases (1)"] },
    { q: "Explain two reasons why returning a value from a function is generally preferable to writing the result into a global variable.", marks: 4,
      ms: ["Returning makes the data flow explicit — the caller clearly receives the result (1)", "Avoids hidden side effects / coupling that globals introduce (1)", "The function can be reused/tested in isolation because it depends only on its inputs (1)", "Reduces bugs that arise when unrelated code changes a shared global (1)"] },
    { q: "Write a function `Grade(score)` that returns \"A\" for 80+, \"B\" for 70–79, \"C\" for 60–69 and \"U\" otherwise. Explain why only one return executes per call, and discuss why returning the grade is better than printing it inside the function.", marks: 6,
      ms: ["Correct signature and parameter (1)", "Correct threshold comparisons in descending order (1)", "A return for each band including the final \"U\" (1)", "Only one return executes because return immediately exits — the first satisfied branch ends the call before later returns are reached (1)", "Returning lets the caller reuse the result in further logic (store, compare, display) (1)", "Printing inside the function couples it to one output method and prevents reuse/testing — returning keeps it flexible and testable (1)"] }
  ]
};

C["compsci:4.1.1.13"] = {
  notes: [
    { callout: { t: "tip", h: "Local Variables and Scope", body: "**Scope** refers to the region of a program where a variable is accessible. **Local variables** are restricted to the subroutine in which they are declared." }},
    { callout: { t: "def", h: "Key Attributes", body: [
      { kv: [
        ["Local Variable", "Declared inside a subroutine; only accessible within that specific block."],
        ["Lifetime", "Created when the subroutine is called and destroyed when it terminates."]
      ]}
    ]}},
    { callout: { t: "tip", h: "Advantages of Local Scope", body: [
      { kv: [
        ["Encapsulation", "Prevents unintended changes from other parts of the program; only accessible where needed."],
        ["Memory Efficiency", "Memory is allocated on the stack and freed as soon as the subroutine finishes."],
        ["Name Reuse", "You can use common names (like `i` or `count`) in different subroutines without conflict."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "Demonstrating local scope in C#.", src:
"void Calculate() {\n    int tempResult = 100; // Local variable\n    Console.WriteLine(tempResult);\n}\n\n// tempResult is NOT accessible here.\n// It only exists while Calculate() is running." }},
    { callout: { t: "memorise", h: "Local: Private to the Subroutine", body: "Local variable: declared inside a subroutine, accessible ONLY within that block, lifetime = duration of one call, stored on the call stack (freed when the subroutine exits). Two subroutines CAN share the same local variable name — no conflict." }},
    { callout: { t: "miscon", h: "Local Variables Don't Persist Between Calls", body: "A local variable is NOT the same as a private class field. Local variables are created fresh on every call and destroyed on exit — their value does NOT persist between calls. Each invocation gets its own independent copy." }}
  ],
  flashcards: [
    ["Define 'Local Variable'.", "A variable declared inside a subroutine, accessible only within that subroutine."],
    ["What is 'Scope'?", "The part of a program where an identifier (like a variable) is visible and can be used."],
    ["What is the lifetime of a local variable?", "From the moment the subroutine is called until it finishes executing."],
    ["Can two subroutines have local variables with the same name?", "Yes, they occupy different memory locations and do not conflict."],
    ["One benefit of using local variables for memory?", "They are stored on the stack and deleted automatically when the subroutine exits, saving RAM."],
    ["If a local and global variable share a name, which one is used inside the subroutine?", "The local variable (it 'shadows' the global one)."],
    ["Why don't local variables persist their value between calls?", "They are created fresh on the stack each call and destroyed on exit — each invocation gets an independent copy."],
    ["How do local variables support code reuse across a team?", "Because names are private to the subroutine, programmers can reuse common names (i, count, temp) without clashing."],
    ["Define 'side effect' in the context of scope.", "A change to state outside a subroutine's own locals (e.g. a global), which local-only variables avoid."],
    ["What does 'block-level scope' mean?", "A variable is visible only within the { } block where it is declared, e.g. inside a single loop body."]
  ],
  quiz: [
    { q: "Where is a local variable stored?", opts: ["The Heap", "The Call Stack", "Permanent storage", "CPU Registers"], ans: 1, why: "Stack frames hold local data for active subroutines." },
    { q: "A variable declared inside a 'for' loop in C# has its scope…", opts: ["Global", "Limited to the subroutine", "Limited to the loop body", "Infinite"], ans: 2, why: "C# has block-level scope." },
    { q: "Why are local variables 'safer' than globals?", opts: ["They are encrypted", "They cannot be changed", "They cannot be accidentally modified by unrelated code", "They are faster"], ans: 2, why: "Restricting access reduces 'side effects' and bugs." },
    { q: "What happens to a local variable's value after the subroutine returns?", opts: ["It is saved", "It is returned", "It is lost/deleted", "It becomes global"], ans: 2, why: "The stack frame is popped, and the memory is reclaimed." },
    { q: "If a local variable and a global variable share the name `total`, code inside the subroutine refers to…", opts: ["the global", "the local (it shadows the global)", "both at once", "neither — it errors"], ans: 1, why: "The nearer (local) declaration shadows the global within that subroutine." }
  ],
  exam: [
    { q: "Explain the term 'local variable' and give one reason why it is considered good practice to use them.", marks: 3,
      ms: ["Definition: Variable declared within a subroutine / only accessible there (1)", "Reason 1: Avoids naming conflicts with other parts of the program (1)", "Reason 2: Reduces risk of accidental side effects / improves encapsulation (1)", "Reason 3: More memory efficient as space is reclaimed after use (max 3)"] },
    { q: "Explain what is meant by the 'scope' and 'lifetime' of a local variable.", marks: 3,
      ms: ["Scope: the region of code where the variable is visible — only within its subroutine/block (1)", "Lifetime: the period it exists in memory — from the call until the subroutine returns (1)", "On return the stack frame is popped so the variable is destroyed (1)"] },
    { q: "Discuss why favouring local variables over global variables generally produces more reliable and maintainable code.", marks: 6,
      ms: ["Encapsulation — locals restrict access, so unrelated code cannot alter them (fewer side effects) (1–2)", "Easier debugging — a wrong value can only originate within its subroutine, narrowing the search (1–2)", "Name reuse — common names can be reused without conflict, aiding teamwork (1)", "Memory — stack space is reclaimed on exit (1)", "Balanced point: globals are occasionally justified (truly shared state) but should be minimised (1)"] }
  ]
};

C["compsci:4.1.1.14"] = {
  notes: [
    { callout: { t: "def", h: "Global Scope", body: [
      { kv: [
        ["Definition", "Variables declared outside any subroutine, typically at the top of the program."],
        ["Accessibility", "Visible and modifiable from **anywhere** within the code during its entire execution."]
      ]}
    ]}},
    { callout: { t: "warn", h: "The Global Warning", body: "While convenient, global variables are often considered 'bad practice' in large systems. They make debugging difficult because any part of the program could change the value at any time, leading to unintended side effects." }},
    { table: { head: ["Feature", "Local Variable", "Global Variable"], rows: [
      ["Scope", "Subroutine only", "Entire program"],
      ["Lifetime", "During subroutine execution", "During the entire program run"],
      ["Storage", "Call Stack", "Data Segment / Static memory"],
      ["Access", "Safe/Encapsulated", "Risk of side effects"]
    ]}},
    { code: { lang: "csharp", cap: "Local vs Global scope.", src:
"int globalCount = 0; // Global\n\nvoid Task() {\n    int localCount = 5; // Local\n    globalCount += localCount;\n}\n\n// localCount is not accessible here\n// globalCount IS accessible here" }},
    { callout: { t: "memorise", h: "Global: Everywhere, Always", body: "Global variable: declared OUTSIDE all subroutines, accessible from ANYWHERE in the program, lifetime = entire program run, stored in static/data segment (not the call stack). Avoid in large systems — side-effect risk is high." }},
    { callout: { t: "miscon", h: "Global ≠ Safer Because Shared", body: "Global variables are NOT safer because they are accessible everywhere — they are LESS safe. Any subroutine can accidentally overwrite the value, making bugs very hard to trace. Always prefer local variables + parameters." }}
  ],
  flashcards: [
    ["Define 'Global Variable'.", "A variable declared outside any subroutine, accessible from any part of the program."],
    ["What is a 'Side Effect'?", "An unintended change to a global variable caused by a subroutine."],
    ["One advantage of global variables?", "Easy to share data between many subroutines without passing parameters."],
    ["One major disadvantage of global variables?", "Make programs harder to debug and maintain as any code can change them."],
    ["Lifetime of a global variable?", "The entire time the program is running."],
    ["Why avoid global variables in team projects?", "To prevent different developers from accidentally overwriting each other's shared data."],
    ["Where in memory are globals stored (vs locals)?", "In a static/data segment for the whole program run — not on the call stack like locals."],
    ["Give one legitimate use of a global value.", "A genuinely program-wide constant or shared resource (often better as a constant), e.g. a configuration value used everywhere."],
    ["Why do globals make debugging harder than locals?", "Any subroutine could have changed the value, so the search for a faulty write spans the whole program."],
    ["What is the preferred alternative to a global for sharing data?", "Pass the data via parameters and return values, keeping each subroutine's dependencies explicit."]
  ],
  quiz: [
    { q: "Where are global variables typically declared?", opts: ["Inside the Main function", "Inside a loop", "At the top of the program file", "In a Finally block"], ans: 2, why: "Outside of all subroutines so they are in global scope." },
    { q: "Which is true about global variable memory usage?", opts: ["It is more efficient than local", "It is reclaimed after each call", "It stays allocated for the program's duration", "It is stored on the stack"], ans: 2, why: "Globals live as long as the program does." },
    { q: "The ability for any part of a program to access a variable is called…", opts: ["Local scope", "Global scope", "Private access", "Universal constant"], ans: 1, why: "Global scope = universal visibility." },
    { q: "What is the biggest risk of using many global variables?", opts: ["Program runs too fast", "Nesting errors", "Difficult-to-trace bugs/side effects", "Compiler cannot find them"], ans: 2, why: "If a global value is wrong, you have to check *every* subroutine to find the culprit." },
    { q: "Which approach best reduces unwanted side effects while still sharing data between subroutines?", opts: ["Make everything global", "Pass data via parameters and return values", "Use longer variable names", "Avoid subroutines entirely"], ans: 1, why: "Explicit parameters/returns keep each subroutine's data dependencies visible and contained." }
  ],
  exam: [
    { q: "Compare local and global variables in terms of their scope and lifetime.", marks: 4,
      ms: ["Local scope: restricted to the subroutine where declared (1)", "Local lifetime: exists only while subroutine is running (1)", "Global scope: accessible throughout the entire program (1)", "Global lifetime: exists for the duration of the program (1)"] },
    { q: "State one advantage and two disadvantages of using global variables.", marks: 3,
      ms: ["Advantage: data can be shared between many subroutines without passing parameters (1)", "Disadvantage: any code can change them, causing hard-to-trace side effects/bugs (1)", "Disadvantage: they occupy memory for the whole run and create tight coupling, harming maintainability (1)"] },
    { q: "A student has written a large program using many global variables and finds it hard to debug. Explain why global variables make debugging difficult and how using local variables and parameters would improve the situation.", marks: 6,
      ms: ["A global can be modified anywhere, so a wrong value could originate in any subroutine (1–2)", "This creates side effects and tight coupling between unrelated parts (1)", "Locals restrict scope so a faulty value must come from within one subroutine — narrowing the search (1–2)", "Parameters/returns make data flow explicit, so dependencies are visible and testable (1)", "Conclusion: refactoring to locals + parameters improves maintainability and reliability (1)"] }
  ]
};

C["compsci:4.1.1.15"] = {
  notes: [
    { callout: { t: "tip", h: "The Call Stack", body: "When a subroutine is called, the computer uses a **Call Stack** (LIFO structure) to track the active subroutines, their local data, and where to return after completion." }},
    { callout: { t: "def", h: "Stack Frame Components", body: [
      { kv: [
        ["Stack Frame", "A block of data pushed onto the stack for every subroutine call."],
        ["Return Address", "The memory location of the next instruction to execute once the subroutine finishes."],
        ["Parameters", "The values passed into the subroutine by the caller."],
        ["Local Variables", "The data declared within and owned by the subroutine."]
      ]}
    ]}},
    { page: "Push, execute, pop" },
    { steps: [
      { h: "The Call", m: "A new **stack frame** is created and pushed onto the call stack.", n: "It contains the return address, parameters, and space for local variables." },
      { h: "The Execution", m: "The subroutine runs using its local data within the frame.", n: "" },
      { h: "The Return", m: "The subroutine finishes, and the stack frame is **popped**.", n: "The CPU uses the return address to resume the calling code." }
    ]},
    { code: { lang: "csharp", cap: "Implicitly using the call stack via nested calls.", src:
"void Main() {\n    A();\n}\n\nvoid A() {\n    B(); // Pushes frame for B onto the stack\n}\n\nvoid B() {\n    // Stack currently contains: [Main, A, B]\n    Console.WriteLine(\"Executing B\");\n}" }},
    { callout: { t: "warn", h: "Stack Overflow", body: "If you call too many subroutines (usually via infinite recursion), the stack runs out of memory. This is a **Stack Overflow** error." }},
    { callout: { t: "tip", h: "LIFO in Action", body: "The call stack is a Last-In, First-Out (LIFO) structure. The most recently called subroutine is always at the top." }},
    { callout: { t: "memorise", h: "Stack Frame Contents + LIFO", body: "Stack frame holds: (1) return address, (2) parameters, (3) local variables. LIFO: pushed when subroutine is called, popped when it returns. Stack overflow = too many nested calls exhaust stack memory, usually from infinite recursion." }},
    { callout: { t: "miscon", h: "Stack Overflow ≠ Disk Full", body: "Stack overflow is NOT running out of hard drive space. It is RAM (call stack memory) exhaustion from too many nested subroutine calls. Each recursive call that never terminates adds a frame until the stack is full." }}
  ],
  flashcards: [
    ["What is a 'Stack Frame'?", "A collection of data (return address, params, locals) pushed onto the stack for a subroutine call."],
    ["What is the 'Return Address'?", "The location in the code where the CPU should jump back to after a subroutine ends."],
    ["Which data structure manages subroutine calls?", "The Call Stack (a LIFO structure)."],
    ["Three things stored in a stack frame?", "Return address, parameters, and local variables."],
    ["What happens to the stack when a subroutine finishes?", "The top stack frame is 'popped' (removed)."],
    ["What causes a Stack Overflow?", "Too many nested subroutine calls (like infinite recursion) exhausting the stack memory."],
    ["Why is the call stack ideal for nested/recursive calls?", "LIFO order matches call order — the most recent call must finish first, so its frame is on top and popped first."],
    ["How does the stack give each recursive call its own data?", "Each call pushes a separate frame with its own parameters and locals, so values don't overwrite each other."],
    ["What does popping a frame restore?", "Control to the caller via the return address, and the caller's own frame becomes the active top of stack."],
    ["Why must recursion have a base case, in stack terms?", "Without one, frames are pushed endlessly until stack memory is exhausted — a stack overflow."]
  ],
  quiz: [
    { q: "In a stack frame, the 'Return Address' is used to…", opts: ["Find the variable's value", "Know where to resume the calling program", "Jump to the start of the subroutine", "Find the next stack frame"], ans: 1, why: "It tells the CPU where it 'left off'." },
    { q: "The Call Stack is a…", opts: ["FIFO structure", "LIFO structure", "Random access structure", "Linked list"], ans: 1, why: "Last-In (most recent call) is First-Out (first to finish)." },
    { q: "When a subroutine calls another subroutine…", opts: ["The current frame is replaced", "A new frame is pushed on top", "The stack is cleared", "The program ends"], ans: 1, why: "Frames nest: each new call adds a layer to the stack." },
    { q: "Why are parameters stored in the stack frame?", opts: ["To make them global", "To keep them separate from other calls to the same subroutine", "To save hard drive space", "They aren't; they are stored in the heap"], ans: 1, why: "Each call needs its own private set of data, especially for recursion." },
    { q: "A recursive function with no base case will most likely cause a…", opts: ["Syntax error", "Stack overflow", "Logic error only", "Disk-full error"], ans: 1, why: "Endless calls push frames until the call stack memory is exhausted." }
  ],
  exam: [
    { q: "Describe the role of the call stack when a subroutine is called and when it returns. Mention what is stored in a stack frame.", marks: 6,
      ms: ["On call: a new stack frame is pushed onto the stack (1)", "Frame stores return address, parameters and local variables (1)", "Return address ensures program resumes at the correct point (1)", "Recursion/nested calls result in multiple frames being pushed (1)", "On return: the top stack frame is popped (1)", "Local variables are destroyed / memory is reclaimed (1)"] },
    { q: "State the three items stored in a stack frame and explain the purpose of the return address.", marks: 4,
      ms: ["Return address (1)", "Parameters (1)", "Local variables (1)", "Return address tells the CPU where to resume in the calling code after the subroutine finishes (1)"] },
    { q: "Explain why the call stack is a suitable structure for managing recursive subroutine calls, and what causes a stack overflow.", marks: 4,
      ms: ["The stack is LIFO, matching the order recursion must unwind — the most recent call finishes first (1)", "Each call gets its own frame, keeping its parameters/locals separate from other calls (1)", "Frames are popped in reverse order as calls return (1)", "Stack overflow: too many frames (e.g. recursion with no/incorrect base case) exhaust stack memory (1)"] }
  ]
};

C["compsci:4.1.2.3"] = {
  notes: [
    { callout: { t: "tip", h: "Object-Oriented Programming (OOP)", body: "OOP is a paradigm based on the concept of **objects**, which encapsulate data (attributes) and behavior (methods) into modular, reusable units." }},
    { callout: { t: "def", h: "Core Terminology", body: [
      { kv: [
        ["Class", "A blueprint or template for creating objects. Defines attributes and methods."],
        ["Object", "An instance of a class. It has its own state (data)."],
        ["Instantiation", "The process of creating an object from a class (e.g., `new Player()`)."],
        ["Encapsulation", "Hiding the internal state of an object and requiring all interaction to happen through public methods."],
        ["Inheritance", "A mechanism where one class (subclass) acquires the properties and behaviors of another (superclass)."],
        ["Polymorphism", "The ability of different classes to respond to the same method call in their own unique way."],
        ["Overriding", "A subclass providing a specific implementation of a method already defined in its superclass."]
      ]}
    ]}},
    { page: "Design principles" },
    { h: "The Three OOP Design Principles" },
    { callout: { t: "tip", h: "Core Design Principles", body: [
      { kv: [
        ["Encapsulate what varies", "Identify the aspects of your application that vary and separate them from what stays the same."],
        ["Favour composition over inheritance", "Build complex objects by combining simpler ones (has-a) rather than relying solely on a fixed hierarchy (is-a)."],
        ["Program to interfaces, not implementation", "Code should depend on abstract types (interfaces/abstract classes) rather than concrete classes for maximum flexibility."]
      ]}
    ]}},
    { callout: { t: "mnemonic", h: "Composition vs Aggregation", body: "In **Composition** (black diamond), the 'child' cannot exist without the 'parent' (e.g. a Heart in a Human). In **Aggregation** (white diamond), the 'child' can exist independently (e.g. a Player in a Team)." }},
    { code: { lang: "csharp", cap: "OOP in action with C#.", src:
"public abstract class Animal {\n    public string Name { get; set; }\n    public virtual void MakeSound() => Console.WriteLine(\"...\");\n}\n\npublic class Dog : Animal { // Inheritance\n    public override void MakeSound() => Console.WriteLine(\"Woof!\"); // Overriding\n}\n\n// Instantiation\nAnimal myDog = new Dog { Name = \"Rex\" };\nmyDog.MakeSound(); // Polymorphism: calls Dog's version" }},
    { page: "Exam technique" },
    { callout: { t: "memorise", h: "OOP Core Terms", body: "Class = blueprint. Object = instance. Encapsulation = hide state behind methods. Inheritance = subclass IS-A superclass (acquires attributes + methods). Polymorphism = same method name, different behaviour per class. Override = subclass replaces parent method." }},
    { callout: { t: "tip", h: "is-a vs has-a", body: "Decide structure by the sentence test: \"a Dog IS-A Animal\" → inheritance; \"a Car HAS-A Engine\" → composition. Examiners reward identifying the relationship correctly before naming the mechanism." }},
    { callout: { t: "miscon", h: "Inheritance ≠ Composition", body: "Inheritance (is-a): Dog IS AN Animal — subclass extends superclass. Composition (has-a): Car HAS AN Engine — object contains another. OOP best practice favours composition over deep inheritance hierarchies for flexibility and easier change." }}
  ],
  flashcards: [
    ["Define 'Encapsulation'.", "Hiding an object's internal data and only allowing access through public methods."],
    ["What is the difference between a class and an object?", "A class is the blueprint; an object is the instance created from that blueprint."],
    ["Explain 'Inheritance'.", "When a class takes on the attributes and methods of a parent class."],
    ["What is 'Polymorphism'?", "When different objects respond to the same method name in different ways (e.g. Draw() for a Circle vs a Square)."],
    ["Define 'Overriding'.", "When a subclass replaces a method from its parent with its own version."],
    ["Difference between Composition and Aggregation?", "Composition: child dies with parent; Aggregation: child can exist independently."],
    ["What is 'instantiation'?", "Creating an object (instance) from a class, e.g. `new Player()`."],
    ["State one benefit of encapsulation.", "It protects an object's data from invalid external changes and lets the internal implementation change without affecting other code."],
    ["Why is 'favour composition over inheritance' good advice?", "Deep inheritance hierarchies are rigid and hard to change; composing objects is more flexible and avoids fragile base-class problems."],
    ["What does 'program to an interface, not an implementation' mean?", "Depend on abstract types so concrete classes can be swapped without changing the calling code."]
  ],
  quiz: [
    { q: "Which principle is about 'hiding the mess' inside an object?", opts: ["Inheritance", "Encapsulation", "Polymorphism", "Instantiation"], ans: 1, why: "Encapsulation keeps the internals private and safe." },
    { q: "If a `Car` class has an `Engine` object, this is an example of…", opts: ["Inheritance", "Composition", "Polymorphism", "Encapsulation"], ans: 1, why: "A car 'has-a' engine; this is composition." },
    { q: "The arrow in a UML class diagram for inheritance points…", opts: ["From Parent to Child", "From Child to Parent", "Both ways", "To the attributes"], ans: 1, why: "Inheritance arrows point up to the superclass." },
    { q: "Which keyword in C# allows a method to be overridden in a subclass?", opts: ["static", "abstract", "virtual", "new"], ans: 2, why: "A method must be 'virtual' or 'abstract' to be overridden." },
    { q: "A `Shape` reference calls `Draw()` and the correct circle/square version runs at runtime. This is…", opts: ["Encapsulation", "Polymorphism", "Instantiation", "Aggregation"], ans: 1, why: "One method name resolving to different behaviour per object type is polymorphism." }
  ],
  exam: [
    { q: "Explain the benefits of using inheritance and polymorphism in a game with many different types of enemies.", marks: 4,
      ms: ["Inheritance: Common code (health, position) can be written once in a base Enemy class (1)", "Avoids duplication / easier to maintain common features (1)", "Polymorphism: A single 'Update' call can behave differently for each enemy type (1)", "Allows the game loop to handle all enemies uniformly without knowing their specific class (1)"] },
    { q: "Define encapsulation and explain one benefit it provides in object-oriented software.", marks: 3,
      ms: ["Encapsulation: hiding an object's internal data, accessed only via public methods (1)", "Benefit: prevents invalid external modification / protects data integrity (1)", "Benefit: internal implementation can change without affecting code that uses the object (1) (max 3)"] },
    { q: "A media application must store Songs, Podcasts and Audiobooks, all of which can be played but display different information. Discuss how the OOP concepts of inheritance, polymorphism and encapsulation could be used to design this, and one advantage of this design.", marks: 6,
      ms: ["Inheritance: a base class (e.g. MediaItem) holds shared attributes/methods (title, duration, Play) (1–2)", "Each type subclasses it, adding its own attributes (e.g. author for Audiobook) (1)", "Polymorphism: a single DisplayInfo()/Play() call behaves correctly for each subclass (1–2)", "Encapsulation: each object's data is private, accessed via methods (1)", "Advantage: the app can hold a list of MediaItem and process all types uniformly, with new types added easily (1)"] }
  ]
};

C["compsci:4.2.1.3"] = {
  notes: [
    { callout: { t: "tip", h: "File Handling", body: "Programs use file handling to persist data permanently. We distinguish between **Text** files (human-readable characters) and **Binary** files (raw bytes, more compact and efficient)." }},
    { callout: { t: "def", h: "File Operations", body: [
      { kv: [
        ["Open", "Establishes a connection between the physical file on disk and a file handle in the program."],
        ["Read", "Retrieves data from the file into the program's variables."],
        ["Write", "Persists data from variables into the file on disk."],
        ["Close", "Terminates the connection and ensures all buffered data is physically written to disk."],
        ["EOF (End of File)", "A specific marker or condition indicating that no more data is available to read."]
      ]}
    ]}},
    { callout: { t: "warn", h: "Always Close!", body: "Failure to close a file can lead to data loss (unflushed buffers) or the file remaining 'locked', preventing other applications from accessing it." }},
    { code: { lang: "csharp", cap: "Reading and Writing text files in C#.", src:
"using System.IO;\n\n// Writing\nFile.WriteAllText(\"save.txt\", \"KurenaiOS v2.0\");\n\n// Reading line by line\nusing (StreamReader reader = new StreamReader(\"data.txt\")) {\n    while (!reader.EndOfStream) {\n        string line = reader.ReadLine();\n        Console.WriteLine(line);\n    }\n}\n// 'using' block automatically CLOSES the file." }},
    { callout: { t: "memorise", h: "4 File Operations", body: "Open (connect to file) → Read (retrieve data into variables) → Write (persist data from variables) → Close (flush buffer + release lock). Text files store character codes. Binary files store raw bytes (more compact for numbers/images)." }},
    { callout: { t: "miscon", h: "Closing a File Is NOT Optional", body: "Failing to close a file can corrupt data (write buffer not flushed to disk) or leave the file locked, blocking all other processes from accessing it. The `using` block in C# auto-closes the file via the IDisposable pattern." }}
  ],
  flashcards: [
    ["Difference between a text file and a binary file?", "Text files store characters (ASCII/UTF-8); Binary files store raw bytes (like images or compiled code)."],
    ["Why is it important to close a file after writing?", "To flush the buffer and ensure data is actually saved, and to release the file lock."],
    ["What does EOF stand for?", "End Of File."],
    ["Which is more memory efficient for storing large numbers: Text or Binary?", "Binary (stores the number directly in its byte representation, no conversion to characters needed)."],
    ["What happens if you try to read past the EOF?", "An error/exception usually occurs, or the function returns null."],
    ["What is a 'File Handle'?", "A variable or pointer used by the program to keep track of an open file."],
    ["List the four core file operations in order of typical use.", "Open (connect), Read/Write (transfer data), then Close (flush + release)."],
    ["Give one benefit and one drawback of text files vs binary.", "Text: human-readable and portable, but larger and slower to parse. Binary: compact and fast, but not human-readable and less portable."],
    ["Why might EOF detection use indefinite iteration?", "The number of lines/records is usually unknown in advance, so you loop until the EOF condition is met."],
    ["What is the risk of not flushing/closing a written file?", "Buffered data may be lost (not written to disk) and the file may stay locked, blocking other processes."]
  ],
  quiz: [
    { q: "Which operation is used to move data from RAM to secondary storage?", opts: ["Open", "Read", "Write", "Close"], ans: 2, why: "Writing 'outputs' data to the disk." },
    { q: "A text file containing `123` takes how many bytes? (Assuming 1 byte per char)", opts: ["1", "2", "3", "4"], ans: 2, why: "It stores three character codes ('1', '2', '3')." },
    { q: "Which block in C# ensures a file is closed even if an error occurs?", opts: ["try", "catch", "using", "finally"], ans: 2, why: "'using' is syntactic sugar for try-finally with a Close() call." },
    { q: "Binary files are better than text files for…", opts: ["Editing in Notepad", "Saving space and execution speed", "Web pages", "Human readability"], ans: 1, why: "Binary is the 'native' format of the computer, avoiding overhead." },
    { q: "Which loop condition is most appropriate when reading every record from a file of unknown length?", opts: ["A fixed FOR loop of 100", "WHILE NOT EOF", "A single IF", "An infinite loop with no exit"], ans: 1, why: "Read until the end-of-file condition because the record count is unknown." }
  ],
  exam: [
    { q: "A company stores its product catalogue in a text file. Each line contains a product ID, name, and price. Describe the steps a program must take to find the price of a specific product ID.", marks: 4,
      ms: ["Open the file for reading (1)", "Read each line in a loop until EOF is reached (1)", "Split the line and check if the product ID matches (1)", "If matched, output the price and close the file (1)"] },
    { q: "Explain the difference between a text file and a binary file, giving one advantage of each.", marks: 4,
      ms: ["Text file stores character codes (ASCII/Unicode), human-readable (1); advantage: portable / easily edited and inspected (1)", "Binary file stores raw bytes in the computer's native format (1); advantage: more compact and faster to read/write (no parsing) (1)"] },
    { q: "Describe the four standard file operations and explain why failing to close a file correctly can cause problems.", marks: 6,
      ms: ["Open — establishes a connection/handle between the program and the file (1)", "Read — retrieves data from the file into variables (1)", "Write — persists data from variables to the file (1)", "Close — flushes buffered data and releases the file lock (1)", "Not closing risks data loss because the write buffer is not flushed to disk (1)", "The file may remain locked, preventing other programs/processes from accessing it (1)"] }
  ]
};



})(window.KOS_CONTENT);
