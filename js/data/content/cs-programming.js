/* Kurenai OS — deep content: AQA 7517 §4.1.1 Programming Fundamentals */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

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
