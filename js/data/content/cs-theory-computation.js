/* Kurenai OS — deep content: AQA 7517 §4.4 Theory of Computation (Part 1) */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.4.1.1"] = {
  notes: [
    { h: "The Computational Approach: Problem Solving" },
    "Before code is written, a problem must be formally defined and a data model established. Computational thinking is the process of formulating problems so their solutions can be represented as computational steps.",
    { callout: { t: "def", h: "Analysis", body: [
      { kv: [
        ["Problem Definition", "Identifying the inputs, outputs, and constraints of the problem."],
        ["User Interaction", "Clarifying requirements via prototyping or agile feedback loops."],
        ["Data Model", "Creating an abstract structure to represent the data needed for the solution."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "A basic data model for a system.", src: "public class ProblemModel {\n    public List<string> Inputs { get; set; }\n    public Dictionary<string, object> State { get; set; }\n}" }}
  ],
  flashcards: [
    ["What must be created before a problem is solved?", "A problem definition, established requirements, and a data model."],
    ["How are requirements usually established?", "Through interaction with the intended users."],
    ["What is a data model?", "An abstract representation of the data structures and relationships in a problem."],
    ["Role of prototyping in analysis?", "To clarify and refine requirements with user feedback before implementation."],
    ["Define 'Computational Thinking'.", "Formulating problems and solutions in a way that a computer can execute."]
  ],
  quiz: [
    { q: "What is the primary goal of the Analysis phase?", opts: ["Writing the code", "Defining requirements and a data model", "Compiling the program", "Debugging syntax"], ans: 1, why: "Analysis focus is on understanding WHAT the system must do." },
    { q: "Which tool is best for clarifying requirements with a user?", opts: ["A compiler", "An agile prototype", "A text editor", "A logic gate"], ans: 1, why: "Prototypes give users a tangible view of the proposed system." },
    { q: "A 'Data Model' identifies...", opts: ["How fast the CPU runs", "The structures used to represent information", "The physical cabling of the network", "The user's login password"], ans: 1, why: "The data model defines the logical structure of data." },
    { q: "Analysis must be complete before...", opts: ["Design begins", "The user is consulted", "The computer is purchased", "The programmer is hired"], ans: 0, why: "Design follows Analysis in the waterfall model." }
  ],
  exam: [
    { q: "Explain the importance of interaction with users during the Analysis phase of software development. (3 marks)", marks: 3, ms: ["Ensures the final requirements accurately reflect the user's needs (1)", "Allows for the identification of constraints or edge cases early (1)", "Reduces the risk of building a system that is technically correct but useless to the business (1)"] }
  ]
};

C["compsci:4.4.1.2"] = {
  notes: [
    { h: "Following and Writing Algorithms" },
    "An **algorithm** is a sequence of steps that can be followed to complete a task and that **always terminates**.",
    { callout: { t: "def", h: "Algorithm Fundamentals", body: [
      { kv: [
        ["Standard Constructs", "Sequence, Assignment, Selection, Iteration."],
        ["Hand-Tracing", "Manually following an algorithm to verify its logic (often using a trace table)."],
        ["Logic/Reasoning", "Articulating why a program works and arguing for its efficiency."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "Standard constructs in C#.", src: "int x = 10; // Assignment\nif (x > 5) { // Selection\n    for (int i = 0; i < x; i++) { // Iteration\n        Console.WriteLine(i); // Sequence\n    }\n}" }}
  ],
  flashcards: [
    ["Define an 'Algorithm'.", "A sequence of steps to complete a task that always terminates."],
    ["What are the four standard programming constructs?", "Sequence, Assignment, Selection, and Iteration."],
    ["What is hand-tracing?", "Manually stepping through code to track variable values and find logic errors."],
    ["Why must an algorithm terminate?", "An infinite loop is not an algorithm; it must have a finite end state."],
    ["What is used to argue for an algorithm's correctness?", "Logical reasoning and test data results."]
  ],
  quiz: [
    { q: "Which construct is used for decision making?", opts: ["Sequence", "Assignment", "Selection", "Iteration"], ans: 2, why: "Selection (IF/ELSE) branches based on a condition." },
    { q: "What must every true algorithm eventually do?", opts: ["Repeat infinitely", "Terminate", "Crash", "Output a string"], ans: 1, why: "Finiteness is a defining characteristic of an algorithm." },
    { q: "A 'Trace Table' is used during...", opts: ["Compilation", "Hand-tracing", "Automation", "Encryption"], ans: 1, why: "It records variable states as a human follows the algorithm." },
    { q: "Converting pseudo-code to C# is part of...", opts: ["Analysis", "Abstraction", "Implementation", "Normalisation"], ans: 2, why: "Moving from design to code is implementation." }
  ],
  exam: [
    { q: "Define the term 'algorithm' and state why hand-tracing is useful. (3 marks)", marks: 3, ms: ["Algorithm: A sequence of steps to complete a task that always terminates (1)", "Tracing Utility: Allows a programmer to find logic errors (1)", "and verify that variables hold expected values at specific steps (1)"] }
  ]
};

C["compsci:4.4.1.3"] = {
  notes: [
    { h: "Representational Abstraction" },
    "Abstraction is the process of removing unnecessary detail to simplify a problem and focus on the essential features.",
    { callout: { t: "def", h: "Types of Abstraction", body: [
      { kv: [
        ["Representational", "Arrived at by removing details that don't contribute to the goal (e.g., a map ignoring trees)."],
        ["Generalisation", "Grouping things by common characteristics (e.g., Dog and Cat are 'Mammals')."]
      ]}
    ]}},
    { callout: { t: "tip", body: "Abstraction allows us to handle complex systems by managing them at a higher level of logic." }}
  ],
  flashcards: [
    ["What is representational abstraction?", "A representation created by removing unnecessary details."],
    ["What is abstraction by generalisation?", "Grouping by common characteristics to form a hierarchy."],
    ["Goal of abstraction?", "To reduce complexity and focus on the core logic/problem."],
    ["Example of representational abstraction?", "A London Underground map (ignores geographic distance, focus on topology)."],
    ["Example of generalisation?", "Creating a 'Vehicle' class to group common traits of 'Car' and 'Bus'."]
  ],
  quiz: [
    { q: "Stripping away the brand and color of a car to focus on its 'engine' and 'wheels' is...", opts: ["Generalisation", "Representational Abstraction", "Automation", "Composition"], ans: 1, why: "Focusing on essential traits by removing specific details." },
    { q: "Grouping 'Integer' and 'Real' under 'Number' is an example of...", opts: ["Information Hiding", "Abstraction by Generalisation", "Iteration", "Decomposition"], ans: 1, why: "Categorising based on shared attributes." },
    { q: "Abstraction is primarily used to...", opts: ["Increase file size", "Manage complexity", "Improve clock speed", "Encrypt data"], ans: 1, why: "Simplicity allows for easier problem-solving." },
    { q: "A 'kind of' relationship indicates...", opts: ["Representational Abstraction", "Generalisation", "Composition", "Selection"], ans: 1, why: "Hierarchies are built via generalisation." }
  ],
  exam: [
    { q: "Explain the difference between representational abstraction and abstraction by generalisation. (4 marks)", marks: 4, ms: ["Representational: Creating a model by removing specific, irrelevant details (1)", "Example: A flight simulator ignoring scenery and focusing on physics (1)", "Generalisation: Grouping entities based on common properties to form a hierarchy (1)", "Example: Creating a base class for all 'Enemies' in a game (1)"] }
  ]
};

C["compsci:4.4.1.4"] = {
  notes: [
    { h: "Information Hiding" },
    "Information hiding is the principle of shielding the internal details of an object from the outside world. Users only interact with a clean interface.",
    { callout: { t: "def", h: "Encapsulation", body: [
      { kv: [
        ["Hiding Detail", "Removing access to data that does not contribute to essential characteristics."],
        ["Interface", "The provided methods that allow controlled interaction."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "Hiding complexity in C#.", src: "public class Engine {\n    private void InternalCombustion() { /* Hidden Detail */ }\n    public void Start() { InternalCombustion(); } // Public Interface\n}" }}
  ],
  flashcards: [
    ["Define Information Hiding.", "Hiding details of an object that do not contribute to its essential characteristics."],
    ["Why hide information?", "Prevents accidental corruption of data and simplifies the usage of the component."],
    ["What is an 'interface' in this context?", "The set of methods or properties exposed to the outside for interaction."],
    ["Is Information Hiding part of OOP?", "Yes, it is the core of Encapsulation."],
    ["One benefit of information hiding?", "Code can be changed internally without affecting the parts of the program that use it."]
  ],
  quiz: [
    { q: "Which OOP concept is most closely related to Information Hiding?", opts: ["Inheritance", "Encapsulation", "Iteration", "Selection"], ans: 1, why: "Encapsulation bundles data and methods while hiding internal state." },
    { q: "A private variable is a tool for...", opts: ["Generalisation", "Information Hiding", "Decomposition", "Automation"], ans: 1, why: "Private scope restricts visibility to the local class." },
    { q: "Information hiding allows developers to...", opts: ["Write faster loops", "Change internal logic without breaking the interface", "Avoid using RAM", "See all variables at once"], ans: 1, why: "Separating 'how' it works from 'what' it does protects the system." },
    { q: "What should be exposed in an interface?", opts: ["Every internal variable", "Only essential characteristics/controls", "The entire source code", "The memory address"], ans: 1, why: "Minimal exposure reduces complexity for the user." }
  ],
  exam: [
    { q: "Describe one advantage of information hiding in a large software project. (2 marks)", marks: 2, ms: ["Allows individual modules to be modified internally without requiring changes to other parts of the system (1)", "as long as the public interface remains consistent (1)"] }
  ]
};

C["compsci:4.4.1.5"] = {
  notes: [
    { h: "Procedural Abstraction" },
    "Procedural abstraction represents a computational method. It involves taking the logic of a specific task and making it a general procedure that can accept different inputs.",
    { callout: { t: "def", h: "Abstraction of Values", body: "The result of abstracting away the actual values used in a calculation is a **procedure**." }},
    { code: { lang: "csharp", cap: "Procedural Abstraction in C#.", src: "// Specific: 5 + 5\n// Abstracted into a procedure:\npublic int Add(int a, int b) {\n    return a + b;\n}" }}
  ],
  flashcards: [
    ["What is procedural abstraction?", "Representing a computational method as a named procedure."],
    ["What is abstracted away in a procedure?", "The actual values used in the computation."],
    ["Result of procedural abstraction?", "A reusable procedure or subroutine."],
    ["Does a procedure need a return value?", "No, it represents a method; a function is a further abstraction."],
    ["How does this help reuse?", "One procedure can handle many different sets of data."]
  ],
  quiz: [
    { q: "Procedural abstraction results in...", opts: ["A Variable", "A Procedure", "A List", "A Binary Tree"], ans: 1, why: "It formalises a method into a named procedure." },
    { q: "What is removed when creating a general procedure?", opts: ["The logic", "The specific values", "The variable names", "The return type"], ans: 1, why: "Values are replaced with parameters." },
    { q: "Procedural abstraction is a core part of...", opts: ["Functional programming", "Structured programming", "Logic gates", "SQL"], ans: 1, why: "Structured programming relies on subroutines." },
    { q: "Using `DrawCircle(radius)` instead of writing math 100 times is...", opts: ["Decomposition", "Procedural Abstraction", "Selection", "Assignment"], ans: 1, why: "It encapsulates the 'method' of drawing a circle." }
  ],
  exam: [
    { q: "Explain the concept of procedural abstraction. (2 marks)", marks: 2, ms: ["Representing a computational method (1)", "by abstracting away the specific values used in any single instance of that computation (1)"] }
  ]
};

C["compsci:4.4.1.6"] = {
  notes: [
    { h: "Functional Abstraction" },
    "Functional abstraction takes procedural abstraction one step further by hiding the **computational method** entirely. You only care about the mapping between input and output.",
    { callout: { t: "def", h: "Black Box", body: "To get a function, we disregard the 'how' and focus only on the result. A function maps inputs to unique outputs." }},
    { code: { lang: "csharp", cap: "Treating a method as a black box (Functional).", src: "// We don't care IF it uses Math.Sqrt or an estimate\nint result = CalculateRoot(144);" }}
  ],
  flashcards: [
    ["Define functional abstraction.", "Hiding the particular computation method used to get a result."],
    ["Difference between procedural and functional abstraction?", "Procedural identifies the method; Functional hides the method."],
    ["Focus of functional abstraction?", "The mapping of inputs to outputs."],
    ["What is a 'black box'?", "A component where we know the inputs and outputs but not the internal workings."],
    ["Why use functional abstraction?", "To treat complex operations as simple tools."]
  ],
  quiz: [
    { q: "Which abstraction disregards the particular computation method?", opts: ["Procedural", "Functional", "Data", "Representational"], ans: 1, why: "Functional abstraction focuses solely on the input-output mapping." },
    { q: "To a user, a square root function is a...", opts: ["Global variable", "Black box", "Selection block", "Loop"], ans: 1, why: "They know what goes in and out, but not the algorithm inside." },
    { q: "Functional abstraction results in a...", opts: ["Procedure", "Function", "Module", "Class"], ans: 1, why: "It emphasizes the return value for a given input." },
    { q: "Disregarding 'how' a task is done is...", opts: ["Implementation", "Functional Abstraction", "Decomposition", "Assignment"], ans: 1, why: "Focusing on result over mechanism." }
  ],
  exam: [
    { q: "Contrast procedural and functional abstraction. (3 marks)", marks: 3, ms: ["Procedural abstraction represents a computational method as a named procedure (1)", "Functional abstraction further hides that method entirely (1)", "focusing only on the mapping of inputs to outputs (1)"] }
  ]
};

C["compsci:4.4.1.7"] = {
  notes: [
    { h: "Data Abstraction" },
    "Data abstraction isolates **how** a compound data object is used from the details of **how it is constructed**.",
    { callout: { t: "def", h: "Abstract Data Types (ADTs)", body: [
      { kv: [
        ["Concept", "A collection of data and the operations that can be performed on it."],
        ["Example", "A **Stack** can be implemented as an array or a linked list, but the user only sees Push/Pop."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "Using a Stack ADT without knowing its internal array size.", src: "Stack<int> s = new Stack<int>();\ns.Push(10); // User doesn't see the internal array/pointer" }}
  ],
  flashcards: [
    ["Define Data Abstraction.", "Isolating how data is used from how it is physically constructed."],
    ["Example of data abstraction?", "Using a Stack without knowing if it's an array or a linked list."],
    ["What is an ADT?", "Abstract Data Type; a logical description of data and operations."],
    ["Benefit of data abstraction?", "Allows developers to change underlying data structures without breaking existing code."],
    ["Is a variable an abstraction?", "Yes, it abstracts a memory address into a name."]
  ],
  quiz: [
    { q: "Which abstraction hides the implementation of a data structure?", opts: ["Procedural", "Functional", "Data", "Problem"], ans: 2, why: "Data abstraction separates use from construction." },
    { q: "A 'Stack' is an example of an...", opts: ["Algorithm", "ADT", "Interface", "Selection"], ans: 1, why: "Stack is a logical description of LIFO behaviour." },
    { q: "Data abstraction allows new data objects to be...", opts: ["Deleted", "Built from existing types", "Ignored", "Compiled faster"], ans: 1, why: "We can build complex structures like Trees from simple objects." },
    { q: "Hiding the memory layout of an array is...", opts: ["Generalisation", "Data Abstraction", "Automation", "Iteration"], ans: 1, why: "Hiding the 'how it is constructed' part of data." }
  ],
  exam: [
    { q: "Explain how a Stack can be viewed as an example of data abstraction. (3 marks)", marks: 3, ms: ["A Stack is defined by its operations like Push and Pop (1)", "The user can perform these without knowing the internal representation (1)", "e.g. whether it is built using an array or a linked list (1)"] }
  ]
};

C["compsci:4.4.1.8"] = {
  notes: [
    { h: "Problem Abstraction (Reduction)" },
    "Details are removed from a problem until it is represented in a way that is possible to solve, often because it reduces to a problem that has **already been solved**.",
    { callout: { t: "def", h: "Problem Reduction", body: "Recognising that a new, complex problem shares the same underlying structure as a known problem." }},
    { code: { lang: "pseudo", cap: "Reducing a maze to a graph problem.", src: "MAZE -> NODES and EDGES\nSOLVE -> BFS or Dijkstra" }}
  ],
  flashcards: [
    ["What is problem abstraction?", "Removing details until a problem matches a known solution."],
    ["Another name for problem abstraction?", "Problem reduction."],
    ["Why reduce a problem?", "To reuse existing, proven algorithms."],
    ["Example of problem reduction?", "Realising that finding a route on a map is just a 'shortest path' graph problem."],
    ["Goal of reduction?", "To simplify a messy real-world task into a formal computation."]
  ],
  quiz: [
    { q: "Removing details until a problem matches a known one is...", opts: ["Automation", "Reduction", "Composition", "Decomposition"], ans: 1, why: "Problem abstraction/reduction simplifies to find existing solutions." },
    { q: "Which process allows algorithm reuse?", opts: ["Selection", "Problem Abstraction", "Information Hiding", "Iteration"], ans: 1, why: "Finding a match to an existing algorithm." },
    { q: "A maze can be abstracted into a...", opts: ["Stack", "Graph", "Boolean Gate", "Variable"], ans: 1, why: "Mazes are just nodes (junctions) and edges (paths)." },
    { q: "The 'Shortest Path' algorithm can solve many different...", opts: ["Abstracted problems", "Syntax errors", "User requirements", "Encryption keys"], ans: 0, why: "Many problems reduce to graph traversal." }
  ],
  exam: [
    { q: "Provide an example of how a real-world problem can be abstracted and reduced to a known computational problem. (3 marks)", marks: 3, ms: ["Example: Planning a delivery route for a courier (1)", "Abstraction: Ignore street names and traffic lights, treat locations as nodes and roads as weighted edges (1)", "Reduction: The problem is now a 'Shortest Path' problem solvable by Dijkstra's algorithm (1)"] }
  ]
};

C["compsci:4.4.1.9"] = {
  notes: [
    { h: "Decomposition" },
    "Procedural decomposition means breaking a problem into a number of sub-problems, so that each sub-problem accomplishes an identifiable task, which might itself be further subdivided.",
    { callout: { t: "def", h: "Top-Down Design", body: "A technique where you start with the overall goal and decompose it into smaller and smaller levels of detail." }},
    { table: { head: ["Stage", "Goal"], rows: [
      ["Level 1", "Root problem (e.g. 'Run Game')"],
      ["Level 2", "Sub-tasks (e.g. 'Setup', 'Loop', 'Cleanup')"],
      ["Level 3", "Atomic tasks (e.g. 'Draw Sprite', 'Check Input')"]
    ]}}
  ],
  flashcards: [
    ["Define Decomposition.", "Breaking a large problem into smaller, manageable sub-problems."],
    ["One advantage of decomposition for teams?", "Different sub-problems can be assigned to different programmers."],
    ["One advantage for testing?", "Individual sub-problems can be tested in isolation."],
    ["What is a sub-problem?", "A component of a larger task that performs an identifiable function."],
    ["Can decomposition be recursive?", "Yes, sub-problems can be further subdivided."]
  ],
  quiz: [
    { q: "Breaking 'Make Coffee' into 'Boil Water' and 'Add Beans' is...", opts: ["Composition", "Decomposition", "Reduction", "Generalisation"], ans: 1, why: "Splitting a task into sub-tasks." },
    { q: "Decomposition improves...", opts: ["Clock speed", "Maintainability", "RAM usage", "Network latency"], ans: 1, why: "Small, modular code is easier to fix and update." },
    { q: "In a team, decomposition allows...", opts: ["Parallel development", "Higher electricity usage", "Fewer computers", "No testing"], ans: 0, why: "Developers can work on different modules simultaneously." },
    { q: "A 'Hierarchy Chart' visualises...", opts: ["Data Types", "Decomposition", "Logic Gates", "Binary Trees"], ans: 1, why: "It shows the breakdown of a problem into modules." }
  ],
  exam: [
    { q: "State two benefits of using decomposition in software development. (2 marks)", marks: 2, ms: ["Allows complex problems to be simplified and managed (1)", "Enables team members to work independently on different sub-tasks (1)"] }
  ]
};

C["compsci:4.4.1.10"] = {
  notes: [
    { h: "Composition" },
    "Composition is the inverse of decomposition. It involves building a larger system by combining smaller, pre-existing procedures or data objects.",
    { callout: { t: "def", h: "Compound Structures", body: [
      { kv: [
        ["Procedure Composition", "Combining procedures to form compound procedures."],
        ["Data Composition", "Combining data objects to form compound data (e.g., a Tree made of Nodes)."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "Composing a 'Person' from primitive data.", src: "public class Person {\n    public string Name; // Primitive\n    public Address Home; // Composed Object\n}" }}
  ],
  flashcards: [
    ["Define Composition.", "Combining simpler components to build a complex system."],
    ["What is data composition?", "Building complex data structures from simpler ones (e.g. a Tree from Nodes)."],
    ["What is procedural composition?", "Combining subroutines to form a more complex routine."],
    ["Example of composition in real life?", "A car is composed of an engine, wheels, and a chassis."],
    ["How does composition relate to decomposition?", "It is the opposite process (Building up vs Breaking down)."]
  ],
  quiz: [
    { q: "Building a 'Tree' from individual 'Node' objects is...", opts: ["Decomposition", "Composition", "Reduction", "Iteration"], ans: 1, why: "Combining components into a larger structure." },
    { q: "Procedural composition involves...", opts: ["Splitting a function", "Calling multiple subroutines in a sequence", "Naming a variable", "Deleting code"], ans: 1, why: "Creating complex behaviour by chaining simple ones." },
    { q: "Composition promotes...", opts: ["Code reuse", "Higher complexity", "Random errors", "Memory leaks"], ans: 0, why: "You can reuse existing components to build new things." },
    { q: "In UML, a 'has-a' relationship is...", opts: ["Inheritance", "Composition", "Selection", "Assignment"], ans: 1, why: "An object contains/is composed of others." }
  ],
  exam: [
    { q: "Explain how composition is used to create a complex data structure like a Binary Search Tree. (2 marks)", marks: 2, ms: ["Individual Node objects are created containing data and pointers (1)", "These are combined/composed to form a hierarchical structure (1)"] }
  ]
};

C["compsci:4.4.1.11"] = {
  notes: [
    { h: "Automation" },
    "Automation is the process of putting models into action to solve problems. This is achieved by executing code that implements the abstract model.",
    { callout: { t: "steps", h: "The Automation Process", body: [
      { steps: [
        { h: "Creating Algorithms", n: "Defining the step-by-step logic." },
        { h: "Implementing Code", n: "Translating algorithms into instructions." },
        { h: "Implementing Data", n: "Representing the model in data structures." },
        { h: "Executing", n: "Running the code on a processor." }
      ]}
    ]}},
    { callout: { t: "tip", h: "Modeling messy reality", body: "Automation requires building clean abstract models of 'noisy' real-world objects. You must determine the minimum detail needed to achieve the required accuracy." }}
  ],
  flashcards: [
    ["Define Automation.", "Putting abstract models into action using algorithms and data structures."],
    ["What are the 4 steps of automation?", "Creating algorithms, implementing code, implementing data, and executing."],
    ["Why must a model be 'clean' for automation?", "Computers need precise, noise-free rules to execute correctly."],
    ["What is 'noise' in a real-world model?", "Irrelevant data or variables that don't affect the problem outcome."],
    ["Goal of computer science in automation?", "To build models that solve problems with required accuracy."]
  ],
  quiz: [
    { q: "Which step involves turning logic into computer instructions?", opts: ["Design", "Implementation", "Analysis", "Abstraction"], ans: 1, why: "Implementation is the coding phase." },
    { q: "Automation is the result of...", opts: ["Ignoring the user", "Putting models into action", "Deleting the data model", "Parallel processing"], ans: 1, why: "It is the 'execution' phase of computational thinking." },
    { q: "To automate a process, we must first...", opts: ["Buy a server", "Build a model", "Hire a team", "Reboot the PC"], ans: 1, why: "You can't automate without a formal representation (model)." },
    { q: "What defines the accuracy of an automated system?", opts: ["The color of the UI", "The quality of the abstract model", "The speed of the mouse", "The size of the monitor"], ans: 1, why: "The model determines how well reality is captured." }
  ],
  exam: [
    { q: "List the four essential steps required to achieve automation. (4 marks)", marks: 4, ms: ["Creating algorithms (1)", "Implementing the algorithms in program code (1)", "Implementing the models in data structures (1)", "Executing the code (1)"] }
  ]
};

C["compsci:4.4.3.1"] = {
  notes: [
    { h: "Backus-Naur Form (BNF)" },
    "BNF is a notation for expressing the syntax of a context-free language. It is more powerful than regular expressions because it supports **recursion**.",
    { callout: { t: "def", h: "BNF Syntax", body: [
      { kv: [
        ["Terminal", "A symbol that cannot be further broken down (e.g., 'a', 'IF')."],
        ["Non-Terminal", "A symbol that is defined by production rules (e.g., <digit>)."],
        ["::=", "The 'is defined as' operator."],
        ["|", "The 'OR' operator for alternatives."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "Recursive BNF for an integer.", src: "<digit> ::= \"0\" | \"1\" | \"2\" | \"3\" | \"4\" | \"5\" | \"6\" | \"7\" | \"8\" | \"9\"\n<integer> ::= <digit> | <digit> <integer>" }},
    { h: "Syntax Diagrams" },
    "Syntax diagrams are a visual alternative to BNF. Terminals are shown in ovals/circles, while non-terminals are in rectangles. Arrows indicate the flow of the grammar."
  ],
  flashcards: [
    ["What does BNF stand for?", "Backus-Naur Form."],
    ["What is a non-terminal?", "A placeholder in BNF that must be further expanded."],
    ["What is a terminal?", "An actual value or symbol in the language grammar."],
    ["Why is BNF better than RegEx for nested brackets?", "BNF supports recursion, which allows it to track depth."],
    ["What does `::=` mean?", "Is defined as."]
  ],
  quiz: [
    { q: "In the rule `<bit> ::= '0' | '1'`, what is `<bit>`?", opts: ["Terminal", "Non-terminal", "Variable", "Loop"], ans: 1, why: "It is a placeholder defined by other symbols." },
    { q: "Which feature of BNF allows for infinite sequences?", opts: ["Iteration", "Recursion", "Selection", "Assignment"], ans: 1, why: "A rule calling itself allows for arbitrary length." },
    { q: "Terminal symbols in syntax diagrams are...", opts: ["Rectangles", "Ovals/Circles", "Triangles", "Diamonds"], ans: 1, why: "Standard convention for terminal symbols." },
    { q: "Which cannot represent a context-free grammar?", opts: ["BNF", "Regular Expressions", "Syntax Diagrams", "Compilers"], ans: 1, why: "RegEx can only represent regular languages, not context-free ones (no recursion)." }
  ],
  exam: [
    { q: "Explain why Backus-Naur Form is required to define the syntax of a high-level programming language, rather than just using regular expressions. (2 marks)", marks: 2, ms: ["High-level languages often have nested structures (like matching parentheses) (1)", "Regular expressions cannot handle recursion/counting, whereas BNF can (1)"] }
  ]
};

})(window.KOS_CONTENT);
