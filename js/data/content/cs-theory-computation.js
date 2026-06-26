/* Kurenai OS — deep content: AQA 7517 §4.4 Theory of Computation (Part 1) */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.4.1.1"] = {
  notes: [
    { h: "The Computational Approach: Problem Solving" },
    { callout: { t: "info", body: "Before code is written, a problem must be formally defined and a data model established. Computational thinking is the process of formulating problems so their solutions can be represented as computational steps." } },
    { callout: { t: "def", h: "Computational Thinking", body: "The process of formulating a problem and expressing its solution in a way that a computer can execute. It involves abstraction, decomposition, pattern recognition, and algorithm design." }},
    { callout: { t: "info", h: "Analysis Stage", body: [
      { kv: [
        ["Problem Definition", "Identifying the inputs, outputs, and constraints of the problem."],
        ["User Interaction", "Clarifying requirements via prototyping or agile feedback loops."],
        ["Data Model", "Creating an abstract structure to represent the data needed for the solution."]
      ]}
    ]}},
    { callout: { t: "tip", h: "Analysis Is the Most Critical Stage", body: "Getting the requirements wrong at Analysis means every subsequent stage builds on faulty foundations. Errors found at analysis cost the least to fix — errors found after deployment cost the most." }},
    { callout: { t: "warn", h: "Gold-Plating and Scope Creep", body: "Adding features not requested by the user ('gold-plating') or letting the project expand beyond its original scope ('scope creep') are common failure modes. Analysis must produce a clear, agreed specification." }},
    { code: { lang: "csharp", cap: "A basic data model for a system.", src: "public class ProblemModel {\n    public List<string> Inputs { get; set; }\n    public Dictionary<string, object> State { get; set; }\n}" }},
    { callout: { t: "memorise", h: "Four Pillars of Computational Thinking", body: "Abstraction — remove irrelevant detail; Decomposition — break into sub-problems; Pattern Recognition — spot repeated structures; Algorithm Design — express steps formally as instructions a computer can execute." }},
    { callout: { t: "miscon", h: "Analysis ≠ Programming", body: "Analysis defines WHAT the system must do (requirements, data model). It is NOT about writing code. Coding happens in Implementation, which comes after Analysis and then Design." }}
  ],
  flashcards: [
    ["What must be created before a problem is solved?", "A problem definition, established requirements, and a data model."],
    ["How are requirements usually established?", "Through interaction with the intended users."],
    ["What is a data model?", "An abstract representation of the data structures and relationships in a problem."],
    ["Role of prototyping in analysis?", "To clarify and refine requirements with user feedback before implementation."],
    ["Define 'Computational Thinking'.", "Formulating problems and solutions in a way that a computer can execute."],
    ["Name the four pillars of computational thinking.", "Abstraction, decomposition, pattern recognition, and algorithm design."],
    ["Why are errors found at the analysis stage the cheapest to fix?", "Later stages build on analysis; a flaw caught before any design/code exists avoids costly rework after deployment."],
    ["What is 'scope creep'?", "The project gradually expanding beyond its originally agreed requirements, threatening time and quality."],
    ["What is 'gold-plating'?", "Adding features the user never requested — wasted effort and added complexity/risk."]
  ],
  quiz: [
    { q: "What is the primary goal of the Analysis phase?", opts: ["Writing the code", "Defining requirements and a data model", "Compiling the program", "Debugging syntax"], ans: 1, why: "Analysis focus is on understanding WHAT the system must do." },
    { q: "Which tool is best for clarifying requirements with a user?", opts: ["A compiler", "An agile prototype", "A text editor", "A logic gate"], ans: 1, why: "Prototypes give users a tangible view of the proposed system." },
    { q: "A 'Data Model' identifies...", opts: ["How fast the CPU runs", "The structures used to represent information", "The physical cabling of the network", "The user's login password"], ans: 1, why: "The data model defines the logical structure of data." },
    { q: "Analysis must be complete before...", opts: ["Design begins", "The user is consulted", "The computer is purchased", "The programmer is hired"], ans: 0, why: "Design follows Analysis in the waterfall model." },
    { q: "Adding unrequested features to a project is called...", opts: ["scope creep", "gold-plating", "decomposition", "prototyping"], ans: 1, why: "Gold-plating is adding features the user did not ask for; scope creep is the project expanding beyond its agreed bounds." }
  ],
  exam: [
    { q: "Explain the importance of interaction with users during the Analysis phase of software development.", marks: 3, ms: ["Ensures the final requirements accurately reflect the user's needs (1)", "Allows for the identification of constraints or edge cases early (1)", "Reduces the risk of building a system that is technically correct but useless to the business (1)"] },
    { q: "State the four pillars of computational thinking.", marks: 4, ms: ["Abstraction (1)", "Decomposition (1)", "Pattern recognition (1)", "Algorithm design (1)"] },
    { q: "Discuss why the analysis stage is considered the most critical stage of software development, referring to the cost of errors and the risks of scope creep and gold-plating.", marks: 6, ms: ["Analysis defines the requirements and data model that every later stage depends on (1-2)", "An error here propagates into design, implementation and testing — far more expensive to fix later/after deployment (1-2)", "A clear agreed specification prevents scope creep (uncontrolled expansion) (1)", "and prevents gold-plating (adding unrequested features that waste effort) (1)", "Conclusion: time invested in accurate analysis reduces overall cost and risk (1)"] }
  ]
};

C["compsci:4.4.1.2"] = {
  notes: [
    { h: "Following and Writing Algorithms" },
    { callout: { t: "info", body: "An **algorithm** is a sequence of steps that can be followed to complete a task and that **always terminates**." } },
    { callout: { t: "def", h: "Algorithm", body: "A sequence of unambiguous, executable steps that solves a problem and is guaranteed to terminate in a finite number of steps." }},
    { callout: { t: "memorise", h: "Four Standard Constructs", body: [
      { kv: [
        ["Sequence", "Steps executed one after another in order."],
        ["Assignment", "Storing a value in a variable (`x ← 5`)."],
        ["Selection", "Branching based on a condition (`IF/ELSE`)."],
        ["Iteration", "Repeating a block of steps (`WHILE`, `FOR`)."]
      ]}
    ]}},
    { callout: { t: "warn", h: "An Infinite Loop is NOT an Algorithm", body: "By definition, an algorithm must terminate. A program that runs forever (e.g., an infinite loop with no exit condition) is not an algorithm — it has no final state." }},
    { callout: { t: "tip", h: "Hand-Tracing with a Trace Table", body: "Work through the algorithm step by step, recording variable values in a table after each change. If the final values match expected output, the logic is correct." }},
    { code: { lang: "csharp", cap: "Standard constructs in C#.", src: "int x = 10; // Assignment\nif (x > 5) { // Selection\n    for (int i = 0; i < x; i++) { // Iteration\n        Console.WriteLine(i); // Sequence\n    }\n}" }},
    { callout: { t: "miscon", h: "Infinite Loop ≠ Algorithm", body: "An algorithm MUST terminate in a finite number of steps. A process that loops forever has no final state and is NOT an algorithm by definition. Separately: a correct algorithm can still be slow — correctness and efficiency are independent properties." }}
  ],
  flashcards: [
    ["Define an 'Algorithm'.", "A sequence of steps to complete a task that always terminates."],
    ["What are the four standard programming constructs?", "Sequence, Assignment, Selection, and Iteration."],
    ["What is hand-tracing?", "Manually stepping through code to track variable values and find logic errors."],
    ["Why must an algorithm terminate?", "An infinite loop is not an algorithm; it must have a finite end state."],
    ["What is used to argue for an algorithm's correctness?", "Logical reasoning and test data results."],
    ["What does 'unambiguous' mean for an algorithm step?", "Each step has exactly one interpretation — there is no choice or vagueness about what to do."],
    ["Are correctness and efficiency the same property?", "No — a correct algorithm produces the right result but may still be slow; efficiency is a separate concern."],
    ["What does a trace table column typically record?", "The value of each variable after each step, plus any output produced."],
    ["What is the assignment construct?", "Storing a value in a variable, e.g. x ← 5."]
  ],
  quiz: [
    { q: "Which construct is used for decision making?", opts: ["Sequence", "Assignment", "Selection", "Iteration"], ans: 2, why: "Selection (IF/ELSE) branches based on a condition." },
    { q: "What must every true algorithm eventually do?", opts: ["Repeat infinitely", "Terminate", "Crash", "Output a string"], ans: 1, why: "Finiteness is a defining characteristic of an algorithm." },
    { q: "A 'Trace Table' is used during...", opts: ["Compilation", "Hand-tracing", "Automation", "Encryption"], ans: 1, why: "It records variable states as a human follows the algorithm." },
    { q: "Converting pseudo-code to C# is part of...", opts: ["Analysis", "Abstraction", "Implementation", "Normalisation"], ans: 2, why: "Moving from design to code is implementation." },
    { q: "An algorithm that gives the right answer but runs very slowly is...", opts: ["not an algorithm", "correct but inefficient", "incorrect", "an infinite loop"], ans: 1, why: "Correctness and efficiency are independent — it is a correct algorithm that simply isn't efficient." }
  ],
  exam: [
    { q: "Define the term 'algorithm' and state why hand-tracing is useful.", marks: 3, ms: ["Algorithm: A sequence of steps to complete a task that always terminates (1)", "Tracing Utility: Allows a programmer to find logic errors (1)", "and verify that variables hold expected values at specific steps (1)"] },
    { q: "Name the four standard algorithmic constructs and give a one-line description of each.", marks: 4, ms: ["Sequence — steps executed one after another (1)", "Assignment — storing a value in a variable (1)", "Selection — branching on a condition, e.g. IF/ELSE (1)", "Iteration — repeating a block, e.g. WHILE/FOR (1)"] },
    { q: "Using a trace table for the algorithm 'total ← 0; FOR i ← 1 TO 3: total ← total + i', show the values of i and total after each iteration and the final output.", marks: 6, ms: ["Initial: total = 0 (1)", "i=1: total = 0 + 1 = 1 (1)", "i=2: total = 1 + 2 = 3 (1)", "i=3: total = 3 + 3 = 6 (1)", "Loop terminates after i=3 (1)", "Final output: total = 6 (1)"] }
  ]
};

C["compsci:4.4.1.3"] = {
  notes: [
    { h: "Representational Abstraction" },
    { callout: { t: "info", body: "Abstraction is the process of removing unnecessary detail to simplify a problem and focus on the essential features." } },
    { callout: { t: "def", h: "Representational Abstraction", body: "Creating a simplified model of a system by removing details that are irrelevant to the problem being solved — keeping only what matters." }},
    { callout: { t: "def", h: "Abstraction by Generalisation", body: "Grouping entities that share common properties into a category, creating a hierarchy. A 'kind-of' relationship (e.g., Dog and Cat are both Animals)." }},
    { callout: { t: "info", h: "Classic Examples", body: [
      { kv: [
        ["London Underground Map", "Ignores geographic distances and surface geography — only topology (station order and connections) is kept."],
        ["OOP Class Hierarchy", "Dog and Cat grouped under Mammal, Mammal under Animal — generalisation at each level."],
        ["Flight Simulator", "Ignores visual scenery, focuses on physics and control surfaces."]
      ]}
    ]}},
    { callout: { t: "tip", body: "Abstraction allows us to manage complex systems at a higher level of logic — you don't need to understand the CPU to write a Python script." }},
    { callout: { t: "warn", h: "Over-abstraction", body: "Removing too much detail produces a model that is inaccurate or unhelpful. The art is knowing which details are truly irrelevant to the problem." }},
    { callout: { t: "memorise", h: "Two Types of Abstraction", body: "Representational: remove irrelevant detail from a single model (e.g. Underground map ignores geography, keeps topology). Generalisation: group entities with shared properties into a kind-of hierarchy (e.g. Dog → Mammal → Animal)." }},
    { callout: { t: "miscon", h: "Generalisation ≠ Representational Abstraction", body: "Generalisation creates a hierarchy by grouping similar things. Representational abstraction removes unnecessary detail from one specific model. They are two distinct types of abstraction — don't conflate them." }}
  ],
  flashcards: [
    ["What is representational abstraction?", "A representation created by removing unnecessary details."],
    ["What is abstraction by generalisation?", "Grouping by common characteristics to form a hierarchy."],
    ["Goal of abstraction?", "To reduce complexity and focus on the core logic/problem."],
    ["Example of representational abstraction?", "A London Underground map (ignores geographic distance, focus on topology)."],
    ["Example of generalisation?", "Creating a 'Vehicle' class to group common traits of 'Car' and 'Bus'."],
    ["What relationship does generalisation create?", "A 'kind-of' (is-a) hierarchy, e.g. a Dog is-a Mammal is-a Animal."],
    ["What is the risk of over-abstraction?", "Removing too much detail produces an inaccurate or unhelpful model that no longer represents the problem faithfully."],
    ["Why does the Underground map keep topology but drop geography?", "Passengers only need station order and connections to plan a journey, not real distances — irrelevant detail is removed."],
    ["How does abstraction let you write a Python script without knowing the CPU?", "Layers of abstraction hide low-level detail, letting you work at a higher logical level."]
  ],
  quiz: [
    { q: "Stripping away the brand and color of a car to focus on its 'engine' and 'wheels' is...", opts: ["Generalisation", "Representational Abstraction", "Automation", "Composition"], ans: 1, why: "Focusing on essential traits by removing specific details." },
    { q: "Grouping 'Integer' and 'Real' under 'Number' is an example of...", opts: ["Information Hiding", "Abstraction by Generalisation", "Iteration", "Decomposition"], ans: 1, why: "Categorising based on shared attributes." },
    { q: "Abstraction is primarily used to...", opts: ["Increase file size", "Manage complexity", "Improve clock speed", "Encrypt data"], ans: 1, why: "Simplicity allows for easier problem-solving." },
    { q: "A 'kind of' relationship indicates...", opts: ["Representational Abstraction", "Generalisation", "Composition", "Selection"], ans: 1, why: "Hierarchies are built via generalisation." },
    { q: "Removing so much detail that the model no longer represents the problem accurately is called...", opts: ["generalisation", "over-abstraction", "decomposition", "automation"], ans: 1, why: "The skill of abstraction is keeping only the detail that is truly relevant." }
  ],
  exam: [
    { q: "Explain the difference between representational abstraction and abstraction by generalisation.", marks: 4, ms: ["Representational: Creating a model by removing specific, irrelevant details (1)", "Example: A flight simulator ignoring scenery and focusing on physics (1)", "Generalisation: Grouping entities based on common properties to form a hierarchy (1)", "Example: Creating a base class for all 'Enemies' in a game (1)"] },
    { q: "A designer models a city's bus network as a diagram showing only stops and the routes between them. Explain how this is an example of representational abstraction.", marks: 3, ms: ["Irrelevant details (real distances, road layout, scenery) are removed (1)", "Only the essential information (stops and connections) is kept (1)", "This simpler model is sufficient for the task of planning a journey (1)"] },
    { q: "Discuss how representational abstraction and abstraction by generalisation are used together when designing the classes for a game with many enemy types, and why each is useful.", marks: 6, ms: ["Representational abstraction: model each enemy by only its relevant attributes (health, position) ignoring irrelevant detail (1-2)", "Generalisation: group shared attributes/behaviour into a base Enemy class (1-2)", "Specific enemies inherit from it as a kind-of hierarchy (1)", "Benefit: less duplication, easier to maintain and extend with new enemy types (1)"] }
  ]
};

C["compsci:4.4.1.4"] = {
  notes: [
    { h: "Information Hiding" },
    { callout: { t: "info", body: "Information hiding is the principle of shielding the internal details of an object from the outside world. Users only interact with a clean interface." } },
    { callout: { t: "def", h: "Encapsulation", body: [
      { kv: [
        ["Hiding Detail", "Removing access to data that does not contribute to essential characteristics."],
        ["Interface", "The provided methods that allow controlled interaction."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "Hiding complexity in C#.", src: "public class Engine {\n    private void InternalCombustion() { /* Hidden Detail */ }\n    public void Start() { InternalCombustion(); } // Public Interface\n}" }},
    { callout: { t: "memorise", h: "Information Hiding: The Core Idea", body: "Internal details of a module are inaccessible to outside code. Users interact only with the public interface (methods/properties). In OOP this is encapsulation: private fields + public methods." }},
    { callout: { t: "miscon", h: "Hidden ≠ Deleted", body: "Information hiding does NOT mean the implementation disappears or doesn't execute. The hidden code still runs. It simply cannot be accessed or accidentally corrupted by code outside the module." }}
  ],
  flashcards: [
    ["Define Information Hiding.", "Hiding details of an object that do not contribute to its essential characteristics."],
    ["Why hide information?", "Prevents accidental corruption of data and simplifies the usage of the component."],
    ["What is an 'interface' in this context?", "The set of methods or properties exposed to the outside for interaction."],
    ["Is Information Hiding part of OOP?", "Yes, it is the core of Encapsulation."],
    ["One benefit of information hiding?", "Code can be changed internally without affecting the parts of the program that use it."],
    ["Does hidden code still execute?", "Yes — hiding restricts access, it does not stop the implementation running."],
    ["How does information hiding reduce bugs?", "External code cannot reach or corrupt the internal state directly, so invalid changes are prevented."],
    ["What does 'programming to an interface' mean here?", "Other code depends only on the public methods, so the hidden implementation can change freely."],
    ["Which access modifier enforces information hiding in C#?", "private — restricting a field or method to its own class."]
  ],
  quiz: [
    { q: "Which OOP concept is most closely related to Information Hiding?", opts: ["Inheritance", "Encapsulation", "Iteration", "Selection"], ans: 1, why: "Encapsulation bundles data and methods while hiding internal state." },
    { q: "A private variable is a tool for...", opts: ["Generalisation", "Information Hiding", "Decomposition", "Automation"], ans: 1, why: "Private scope restricts visibility to the local class." },
    { q: "Information hiding allows developers to...", opts: ["Write faster loops", "Change internal logic without breaking the interface", "Avoid using RAM", "See all variables at once"], ans: 1, why: "Separating 'how' it works from 'what' it does protects the system." },
    { q: "What should be exposed in an interface?", opts: ["Every internal variable", "Only essential characteristics/controls", "The entire source code", "The memory address"], ans: 1, why: "Minimal exposure reduces complexity for the user." },
    { q: "Information hiding means the hidden implementation...", opts: ["is deleted", "never runs", "still runs but cannot be accessed externally", "is slower"], ans: 2, why: "It is shielded from outside access, not removed — it still executes when called via the interface." }
  ],
  exam: [
    { q: "Describe one advantage of information hiding in a large software project.", marks: 2, ms: ["Allows individual modules to be modified internally without requiring changes to other parts of the system (1)", "as long as the public interface remains consistent (1)"] },
    { q: "Explain what is meant by information hiding and how it is achieved in object-oriented programming.", marks: 3, ms: ["Internal details/state of a module are made inaccessible to outside code (1)", "Interaction happens only through a public interface (methods/properties) (1)", "Achieved by making fields private and exposing public methods (encapsulation) (1)"] },
    { q: "Discuss how information hiding improves the maintainability and reliability of a large software system.", marks: 6, ms: ["External code depends only on the public interface, not internal details (1-2)", "So the implementation can be changed/optimised without breaking other modules (maintainability) (1-2)", "Internal state cannot be corrupted by unrelated code, reducing bugs (reliability) (1-2)", "Conclusion: enables independent development and safe modification of modules (1)"] }
  ]
};

C["compsci:4.4.1.5"] = {
  notes: [
    { h: "Procedural Abstraction" },
    { callout: { t: "info", body: "Procedural abstraction represents a computational method. It involves taking the logic of a specific task and making it a general procedure that can accept different inputs." } },
    { callout: { t: "def", h: "Abstraction of Values", body: "The result of abstracting away the actual values used in a calculation is a **procedure**." }},
    { code: { lang: "csharp", cap: "Procedural Abstraction in C#.", src: "// Specific: 5 + 5\n// Abstracted into a procedure:\npublic int Add(int a, int b) {\n    return a + b;\n}" }},
    { callout: { t: "memorise", h: "Procedure = Named Method with Parameters", body: "Procedural abstraction names a reusable method. Specific values are replaced by parameters. The procedure captures HOW a task is done; callers supply the WHAT (the actual values each time it is called)." }},
    { callout: { t: "miscon", h: "Procedure ≠ Function", body: "A procedure represents a computational method and does NOT necessarily return a value. A function is a further abstraction that maps inputs to a defined output. AQA treats these as distinct concepts." }}
  ],
  flashcards: [
    ["What is procedural abstraction?", "Representing a computational method as a named procedure."],
    ["What is abstracted away in a procedure?", "The actual values used in the computation."],
    ["Result of procedural abstraction?", "A reusable procedure or subroutine."],
    ["Does a procedure need a return value?", "No, it represents a method; a function is a further abstraction."],
    ["How does this help reuse?", "One procedure can handle many different sets of data."],
    ["What replaces the specific values in a procedure?", "Parameters — placeholders the caller fills with actual arguments each call."],
    ["Procedural abstraction captures the 'how'; what does the caller supply?", "The 'what' — the specific values (arguments) to operate on each time."],
    ["Give an example of turning a calculation into a procedure.", "Replacing repeated '5 + 5' style code with Add(a, b) that returns a + b for any inputs."],
    ["How does procedural abstraction relate to functional abstraction (4.4.1.6)?", "Procedural names the method; functional goes further and hides the method, exposing only input→output."]
  ],
  quiz: [
    { q: "Procedural abstraction results in...", opts: ["A Variable", "A Procedure", "A List", "A Binary Tree"], ans: 1, why: "It formalises a method into a named procedure." },
    { q: "What is removed when creating a general procedure?", opts: ["The logic", "The specific values", "The variable names", "The return type"], ans: 1, why: "Values are replaced with parameters." },
    { q: "Procedural abstraction is a core part of...", opts: ["Functional programming", "Structured programming", "Logic gates", "SQL"], ans: 1, why: "Structured programming relies on subroutines." },
    { q: "Using `DrawCircle(radius)` instead of writing math 100 times is...", opts: ["Decomposition", "Procedural Abstraction", "Selection", "Assignment"], ans: 1, why: "It encapsulates the 'method' of drawing a circle." },
    { q: "In a procedure, specific values are generalised into...", opts: ["constants", "parameters", "comments", "return types"], ans: 1, why: "Parameters let one procedure work on many different inputs." }
  ],
  exam: [
    { q: "Explain the concept of procedural abstraction.", marks: 2, ms: ["Representing a computational method (1)", "by abstracting away the specific values used in any single instance of that computation (1)"] },
    { q: "A program repeatedly converts temperatures from Celsius to Fahrenheit for different values. Explain how procedural abstraction would improve this code.", marks: 3, ms: ["Wrap the conversion logic in a named procedure/function with a parameter for the temperature (1)", "The specific values are replaced by the parameter, so one routine handles any input (1)", "Reduces duplication and makes the code reusable and easier to maintain (1)"] },
    { q: "Compare procedural and functional abstraction, and discuss why both are useful when building large reusable software libraries.", marks: 6, ms: ["Procedural abstraction names a reusable method, replacing specific values with parameters (1-2)", "Functional abstraction goes further, hiding the method entirely so only input→output matters (black box) (1-2)", "Both let library users reuse logic without rewriting it (1)", "Functional abstraction additionally lets the implementation change without affecting callers (1)"] }
  ]
};

C["compsci:4.4.1.6"] = {
  notes: [
    { h: "Functional Abstraction" },
    { callout: { t: "info", body: "Functional abstraction takes procedural abstraction one step further by hiding the **computational method** entirely. You only care about the mapping between input and output." } },
    { callout: { t: "def", h: "Black Box", body: "To get a function, we disregard the 'how' and focus only on the result. A function maps inputs to unique outputs." }},
    { code: { lang: "csharp", cap: "Treating a method as a black box (Functional).", src: "// We don't care IF it uses Math.Sqrt or an estimate\nint result = CalculateRoot(144);" }},
    { callout: { t: "memorise", h: "Functional = Black Box", body: "Functional abstraction treats a computation as a black box: only the input→output mapping matters. You don't need to know HOW `sqrt(x)` computes its answer — just that it takes a number and returns its square root." }},
    { callout: { t: "miscon", h: "Functional Abstraction ≠ Functional Programming", body: "These share a word but are different concepts. Functional abstraction hides how a computation works (a design principle). Functional programming (Haskell, etc.) is a paradigm that uses functions as first-class values with no side effects." }}
  ],
  flashcards: [
    ["Define functional abstraction.", "Hiding the particular computation method used to get a result."],
    ["Difference between procedural and functional abstraction?", "Procedural identifies the method; Functional hides the method."],
    ["Focus of functional abstraction?", "The mapping of inputs to outputs."],
    ["What is a 'black box'?", "A component where we know the inputs and outputs but not the internal workings."],
    ["Why use functional abstraction?", "To treat complex operations as simple tools."],
    ["How is functional abstraction different from functional programming?", "Functional abstraction is a design principle (hide the method); functional programming is a paradigm using pure functions as first-class values."],
    ["Why is hiding the method useful for maintenance?", "The implementation can be replaced (e.g. a faster sqrt) without changing any code that calls it."],
    ["What is the only thing a caller relies on with functional abstraction?", "That a given input always maps to the correct output — the contract, not the mechanism."],
    ["Give a familiar example of a functional abstraction.", "A library sqrt(x) — you use the result without knowing whether it uses Newton's method or a lookup table."]
  ],
  quiz: [
    { q: "Which abstraction disregards the particular computation method?", opts: ["Procedural", "Functional", "Data", "Representational"], ans: 1, why: "Functional abstraction focuses solely on the input-output mapping." },
    { q: "To a user, a square root function is a...", opts: ["Global variable", "Black box", "Selection block", "Loop"], ans: 1, why: "They know what goes in and out, but not the algorithm inside." },
    { q: "Functional abstraction results in a...", opts: ["Procedure", "Function", "Module", "Class"], ans: 1, why: "It emphasizes the return value for a given input." },
    { q: "Disregarding 'how' a task is done is...", opts: ["Implementation", "Functional Abstraction", "Decomposition", "Assignment"], ans: 1, why: "Focusing on result over mechanism." },
    { q: "Functional abstraction and functional programming are...", opts: ["the same thing", "unrelated but similarly named concepts", "both hardware techniques", "both types of loop"], ans: 1, why: "One is a design principle, the other a programming paradigm — they share a word only." }
  ],
  exam: [
    { q: "Contrast procedural and functional abstraction.", marks: 3, ms: ["Procedural abstraction represents a computational method as a named procedure (1)", "Functional abstraction further hides that method entirely (1)", "focusing only on the mapping of inputs to outputs (1)"] },
    { q: "Explain what is meant by treating a function as a 'black box', and give one benefit of doing so.", marks: 3, ms: ["A black box is used via its inputs and outputs without knowing its internal workings (1)", "The caller relies only on the input→output contract (1)", "Benefit: the implementation can change/improve without affecting code that uses it (1)"] },
    { q: "Discuss how functional abstraction supports the construction of large software systems from reusable components, and one limitation to be aware of.", marks: 6, ms: ["Each component is a black box exposing only its input→output behaviour (1-2)", "Developers can combine many such functions without understanding their internals, managing complexity (1-2)", "Implementations can be optimised/replaced independently (1)", "Limitation: the hidden method may have performance or side-effect characteristics the caller cannot see, so the contract must be well specified (1)"] }
  ]
};

C["compsci:4.4.1.7"] = {
  notes: [
    { h: "Data Abstraction" },
    { callout: { t: "info", body: "Data abstraction isolates **how** a compound data object is used from the details of **how it is constructed**." } },
    { callout: { t: "def", h: "Abstract Data Types (ADTs)", body: [
      { kv: [
        ["Concept", "A collection of data and the operations that can be performed on it."],
        ["Example", "A **Stack** can be implemented as an array or a linked list, but the user only sees Push/Pop."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "Using a Stack ADT without knowing its internal array size.", src: "Stack<int> s = new Stack<int>();\ns.Push(10); // User doesn't see the internal array/pointer" }},
    { callout: { t: "memorise", h: "ADT = Logical Interface, Not Implementation", body: "A Stack is always Push/Pop/Peek regardless of whether it is built from an array or a linked list. Data abstraction separates WHAT operations exist from HOW data is physically stored." }},
    { callout: { t: "miscon", h: "Hidden Implementation ≠ Inaccessible Data", body: "Data abstraction hides the IMPLEMENTATION, not the data itself. You still access data — but only through defined operations (Push, Pop). You cannot directly manipulate the internal representation." }}
  ],
  flashcards: [
    ["Define Data Abstraction.", "Isolating how data is used from how it is physically constructed."],
    ["Example of data abstraction?", "Using a Stack without knowing if it's an array or a linked list."],
    ["What is an ADT?", "Abstract Data Type; a logical description of data and operations."],
    ["Benefit of data abstraction?", "Allows developers to change underlying data structures without breaking existing code."],
    ["Is a variable an abstraction?", "Yes, it abstracts a memory address into a name."],
    ["What does an ADT specify versus leave open?", "It specifies the operations (the interface) but leaves the physical implementation open."],
    ["Does data abstraction make the data inaccessible?", "No — the data is accessed, but only through defined operations, not by direct manipulation of the internal representation."],
    ["Name three common ADTs.", "Stack, queue and list (also tree, dictionary, graph)."],
    ["Why can a Stack's storage change from array to linked list safely?", "Code only uses Push/Pop/Peek; the interface is unchanged, so switching the internal storage breaks nothing."]
  ],
  quiz: [
    { q: "Which abstraction hides the implementation of a data structure?", opts: ["Procedural", "Functional", "Data", "Problem"], ans: 2, why: "Data abstraction separates use from construction." },
    { q: "A 'Stack' is an example of an...", opts: ["Algorithm", "ADT", "Interface", "Selection"], ans: 1, why: "Stack is a logical description of LIFO behaviour." },
    { q: "Data abstraction allows new data objects to be...", opts: ["Deleted", "Built from existing types", "Ignored", "Compiled faster"], ans: 1, why: "We can build complex structures like Trees from simple objects." },
    { q: "Hiding the memory layout of an array is...", opts: ["Generalisation", "Data Abstraction", "Automation", "Iteration"], ans: 1, why: "Hiding the 'how it is constructed' part of data." },
    { q: "An Abstract Data Type defines...", opts: ["only the storage format", "the operations available, not the implementation", "the exact memory addresses", "the CPU instructions used"], ans: 1, why: "An ADT is a logical interface (operations); the implementation is separate and hidden." }
  ],
  exam: [
    { q: "Explain how a Stack can be viewed as an example of data abstraction.", marks: 3, ms: ["A Stack is defined by its operations like Push and Pop (1)", "The user can perform these without knowing the internal representation (1)", "e.g. whether it is built using an array or a linked list (1)"] },
    { q: "State what is meant by an Abstract Data Type (ADT) and give two examples.", marks: 3, ms: ["An ADT is a logical description of data plus the operations on it, independent of implementation (1)", "Example 1: Stack (LIFO) (1)", "Example 2: Queue (FIFO) / dictionary / list (1)"] },
    { q: "Discuss why data abstraction (through ADTs) is valuable in a large software project where the underlying data structures may need to change over time.", marks: 6, ms: ["An ADT exposes only operations (e.g. Push/Pop), hiding the physical representation (1-2)", "Code that uses the ADT depends on the interface, not the storage (1)", "The implementation (array vs linked list) can be swapped/optimised without changing client code (1-2)", "This reduces coupling and the risk of bugs when data structures evolve (1)"] }
  ]
};

C["compsci:4.4.1.8"] = {
  notes: [
    { h: "Problem Abstraction (Reduction)" },
    { callout: { t: "info", body: "Details are removed from a problem until it is represented in a way that is possible to solve, often because it reduces to a problem that has **already been solved**." } },
    { callout: { t: "def", h: "Problem Reduction", body: "Recognising that a new, complex problem shares the same underlying structure as a known problem." }},
    { code: { lang: "pseudo", cap: "Reducing a maze to a graph problem.", src: "MAZE -> NODES and EDGES\nSOLVE -> BFS or Dijkstra" }},
    { callout: { t: "memorise", h: "Reduction Pattern", body: "Strip domain-specific detail until the problem matches a KNOWN solved problem, then reuse its algorithm. Example: Delivery route → ignore street names → nodes + weighted edges → Dijkstra's shortest path." }},
    { callout: { t: "miscon", h: "Reduction ≠ Decomposition", body: "Reduction finds that your problem IS an already-solved problem (equivalence). Decomposition breaks your problem into smaller sub-problems (partitioning). They are opposite strategies and should not be confused." }}
  ],
  flashcards: [
    ["What is problem abstraction?", "Removing details until a problem matches a known solution."],
    ["Another name for problem abstraction?", "Problem reduction."],
    ["Why reduce a problem?", "To reuse existing, proven algorithms."],
    ["Example of problem reduction?", "Realising that finding a route on a map is just a 'shortest path' graph problem."],
    ["Goal of reduction?", "To simplify a messy real-world task into a formal computation."],
    ["How does reduction differ from decomposition?", "Reduction shows your problem IS a known solved problem (equivalence); decomposition splits it into smaller sub-problems (partitioning)."],
    ["What is the benefit of recognising a problem as a known one?", "You can reuse a proven, tested algorithm instead of inventing and verifying a new one."],
    ["What detail is stripped when reducing a delivery-route problem?", "Domain specifics (street names, traffic lights) — leaving locations as nodes and roads as weighted edges."],
    ["Reducing a scheduling problem to graph colouring is an example of...", "Problem reduction — mapping a new problem onto an already-solved one."]
  ],
  quiz: [
    { q: "Removing details until a problem matches a known one is...", opts: ["Automation", "Reduction", "Composition", "Decomposition"], ans: 1, why: "Problem abstraction/reduction simplifies to find existing solutions." },
    { q: "Which process allows algorithm reuse?", opts: ["Selection", "Problem Abstraction", "Information Hiding", "Iteration"], ans: 1, why: "Finding a match to an existing algorithm." },
    { q: "A maze can be abstracted into a...", opts: ["Stack", "Graph", "Boolean Gate", "Variable"], ans: 1, why: "Mazes are just nodes (junctions) and edges (paths)." },
    { q: "The 'Shortest Path' algorithm can solve many different...", opts: ["Abstracted problems", "Syntax errors", "User requirements", "Encryption keys"], ans: 0, why: "Many problems reduce to graph traversal." },
    { q: "Reduction differs from decomposition because reduction...", opts: ["splits a problem into parts", "shows a problem is equivalent to a solved one", "writes the code", "hides the data"], ans: 1, why: "Decomposition partitions; reduction finds equivalence to a known problem." }
  ],
  exam: [
    { q: "Provide an example of how a real-world problem can be abstracted and reduced to a known computational problem.", marks: 3, ms: ["Example: Planning a delivery route for a courier (1)", "Abstraction: Ignore street names and traffic lights, treat locations as nodes and roads as weighted edges (1)", "Reduction: The problem is now a 'Shortest Path' problem solvable by Dijkstra's algorithm (1)"] },
    { q: "Explain the difference between problem reduction and decomposition.", marks: 2, ms: ["Reduction: recognising the problem is equivalent to an already-solved problem so its algorithm can be reused (1)", "Decomposition: breaking the problem into smaller sub-problems to tackle separately (1)"] },
    { q: "Discuss how problem reduction enables a developer to solve a new real-world problem efficiently, using an example, and note one risk of forcing a poor match.", marks: 6, ms: ["Strip domain-specific detail until the problem matches a known abstract problem (1-2)", "Example: a courier route → nodes + weighted edges → shortest-path/Dijkstra (1-2)", "Benefit: reuse of a proven, tested, efficient algorithm instead of inventing one (1)", "Risk: if the real problem doesn't truly fit the known model, the reused algorithm may give a wrong or suboptimal answer (1)"] }
  ]
};

C["compsci:4.4.1.9"] = {
  notes: [
    { h: "Decomposition" },
    { callout: { t: "info", body: "Procedural decomposition means breaking a problem into a number of sub-problems, so that each sub-problem accomplishes an identifiable task, which might itself be further subdivided." } },
    { callout: { t: "def", h: "Top-Down Design", body: "A technique where you start with the overall goal and decompose it into smaller and smaller levels of detail." }},
    { table: { head: ["Stage", "Goal"], rows: [
      ["Level 1", "Root problem (e.g. 'Run Game')"],
      ["Level 2", "Sub-tasks (e.g. 'Setup', 'Loop', 'Cleanup')"],
      ["Level 3", "Atomic tasks (e.g. 'Draw Sprite', 'Check Input')"]
    ]}},
    { callout: { t: "memorise", h: "Top-Down Design Levels", body: "Level 1: root problem → Level 2: major sub-tasks → Level 3: atomic tasks. Stop decomposing when a sub-problem is simple enough to implement directly. Visualised as a hierarchy chart." }},
    { callout: { t: "miscon", h: "Decomposition Doesn't Remove Complexity", body: "Decomposition makes complexity MANAGEABLE, not absent. All the detail still exists in the sub-problems — it is now organised so each piece can be built, assigned, and tested independently." }}
  ],
  flashcards: [
    ["Define Decomposition.", "Breaking a large problem into smaller, manageable sub-problems."],
    ["One advantage of decomposition for teams?", "Different sub-problems can be assigned to different programmers."],
    ["One advantage for testing?", "Individual sub-problems can be tested in isolation."],
    ["What is a sub-problem?", "A component of a larger task that performs an identifiable function."],
    ["Can decomposition be recursive?", "Yes, sub-problems can be further subdivided."],
    ["What is top-down design?", "Starting from the overall goal and repeatedly breaking it into smaller levels of detail."],
    ["When do you stop decomposing a sub-problem?", "When it is simple enough to be implemented directly as a single routine."],
    ["Does decomposition remove complexity?", "No — it makes complexity manageable by organising it; all the detail still exists in the sub-problems."],
    ["What diagram visualises a decomposition?", "A hierarchy (structure) chart showing the breakdown from root task to atomic tasks."]
  ],
  quiz: [
    { q: "Breaking 'Make Coffee' into 'Boil Water' and 'Add Beans' is...", opts: ["Composition", "Decomposition", "Reduction", "Generalisation"], ans: 1, why: "Splitting a task into sub-tasks." },
    { q: "Decomposition improves...", opts: ["Clock speed", "Maintainability", "RAM usage", "Network latency"], ans: 1, why: "Small, modular code is easier to fix and update." },
    { q: "In a team, decomposition allows...", opts: ["Parallel development", "Higher electricity usage", "Fewer computers", "No testing"], ans: 0, why: "Developers can work on different modules simultaneously." },
    { q: "A 'Hierarchy Chart' visualises...", opts: ["Data Types", "Decomposition", "Logic Gates", "Binary Trees"], ans: 1, why: "It shows the breakdown of a problem into modules." },
    { q: "Top-down design means starting with...", opts: ["the smallest detail", "the overall goal and refining downward", "the user interface", "the database"], ans: 1, why: "You begin at the root problem and decompose into progressively finer sub-tasks." }
  ],
  exam: [
    { q: "State two benefits of using decomposition in software development.", marks: 2, ms: ["Allows complex problems to be simplified and managed (1)", "Enables team members to work independently on different sub-tasks (1)"] },
    { q: "Explain what is meant by top-down design and how it relates to decomposition.", marks: 3, ms: ["Top-down design starts with the overall problem/goal (1)", "and repeatedly breaks it into smaller sub-problems / levels of detail (1)", "i.e. it applies decomposition hierarchically until each part is simple enough to code (1)"] },
    { q: "Discuss the benefits of decomposition when a team develops a large application, referring to development, testing and maintenance.", marks: 6, ms: ["Complexity is made manageable by splitting into identifiable sub-tasks (1)", "Development: sub-tasks can be assigned to different programmers in parallel (1-2)", "Testing: each sub-problem can be tested in isolation before integration (1-2)", "Maintenance: a change/bug is localised to one module rather than the whole system (1)"] }
  ]
};

C["compsci:4.4.1.10"] = {
  notes: [
    { h: "Composition" },
    { callout: { t: "info", body: "Composition is the inverse of decomposition. It involves building a larger system by combining smaller, pre-existing procedures or data objects." } },
    { callout: { t: "def", h: "Compound Structures", body: [
      { kv: [
        ["Procedure Composition", "Combining procedures to form compound procedures."],
        ["Data Composition", "Combining data objects to form compound data (e.g., a Tree made of Nodes)."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "Composing a 'Person' from primitive data.", src: "public class Person {\n    public string Name; // Primitive\n    public Address Home; // Composed Object\n}" }},
    { callout: { t: "memorise", h: "Composition = Has-A Relationship", body: "Composition builds complex structures from simpler components. Opposite of decomposition. Person has-an Address; Tree has-many Nodes. Reuse existing components to assemble new, more powerful ones." }},
    { callout: { t: "miscon", h: "Composition ≠ Inheritance", body: "Composition (has-a): an object CONTAINS another object. Inheritance (is-a): an object IS A subtype of another. These are different OOP relationships. Prefer composition over inheritance when the relationship is not truly a subtype." }}
  ],
  flashcards: [
    ["Define Composition.", "Combining simpler components to build a complex system."],
    ["What is data composition?", "Building complex data structures from simpler ones (e.g. a Tree from Nodes)."],
    ["What is procedural composition?", "Combining subroutines to form a more complex routine."],
    ["Example of composition in real life?", "A car is composed of an engine, wheels, and a chassis."],
    ["How does composition relate to decomposition?", "It is the opposite process (Building up vs Breaking down)."],
    ["What relationship does composition model?", "A 'has-a' relationship — an object contains other objects."],
    ["How does composition differ from inheritance?", "Composition is has-a (an object contains another); inheritance is is-a (an object is a subtype of another)."],
    ["Why is composition often preferred over inheritance?", "It is more flexible and avoids rigid, fragile deep inheritance hierarchies when the relationship isn't truly a subtype."],
    ["How does composition support code reuse?", "Existing, tested components are assembled into new structures without rewriting them."]
  ],
  quiz: [
    { q: "Building a 'Tree' from individual 'Node' objects is...", opts: ["Decomposition", "Composition", "Reduction", "Iteration"], ans: 1, why: "Combining components into a larger structure." },
    { q: "Procedural composition involves...", opts: ["Splitting a function", "Calling multiple subroutines in a sequence", "Naming a variable", "Deleting code"], ans: 1, why: "Creating complex behaviour by chaining simple ones." },
    { q: "Composition promotes...", opts: ["Code reuse", "Higher complexity", "Random errors", "Memory leaks"], ans: 0, why: "You can reuse existing components to build new things." },
    { q: "In UML, a 'has-a' relationship is...", opts: ["Inheritance", "Composition", "Selection", "Assignment"], ans: 1, why: "An object contains/is composed of others." },
    { q: "Composition is the inverse of...", opts: ["inheritance", "decomposition", "iteration", "abstraction"], ans: 1, why: "Decomposition breaks down; composition builds up." }
  ],
  exam: [
    { q: "Explain how composition is used to create a complex data structure like a Binary Search Tree.", marks: 2, ms: ["Individual Node objects are created containing data and pointers (1)", "These are combined/composed to form a hierarchical structure (1)"] },
    { q: "Explain the difference between composition and inheritance, giving an example of each.", marks: 4, ms: ["Composition is a has-a relationship — an object contains another (1); e.g. a Car has-an Engine (1)", "Inheritance is an is-a relationship — a subtype of another (1); e.g. a Car is-a Vehicle (1)"] },
    { q: "Discuss how decomposition and composition are complementary techniques in building and maintaining a large software system.", marks: 6, ms: ["Decomposition breaks the overall problem into smaller manageable sub-problems (1-2)", "Composition assembles solved components back into the full working system (1-2)", "Together they enable reuse: components built once can be combined in many ways (1)", "They make the system modular — easier to develop in parallel, test in isolation and maintain (1)"] }
  ]
};

C["compsci:4.4.1.11"] = {
  notes: [
    { h: "Automation" },
    { callout: { t: "info", body: "Automation is the process of putting models into action to solve problems. It is the culmination of all the abstraction techniques — you take a clean model and execute it." } },
    { callout: { t: "def", h: "Automation", body: "Implementing an abstract model as working code so that the computer performs the task automatically, without manual human intervention at each step." }},
    { h: "The Four Steps of Automation" },
    { steps: [
      { h: "Create Algorithms", m: "Design the step-by-step logic that solves the problem formally." },
      { h: "Implement Code", m: "Translate the algorithms into programming language instructions.", n: "The algorithm defines WHAT; the code defines HOW in a specific language." },
      { h: "Implement Data", m: "Represent the data model in appropriate data structures (arrays, objects, databases)." },
      { h: "Execute", m: "Run the program on a processor — the automated system is now active." }
    ]},
    { callout: { t: "tip", h: "Modelling Messy Reality", body: "Real-world data is 'noisy' — full of irrelevant details. Automation requires building clean abstract models where only the essential features are represented. More abstraction ≠ less accuracy, if done correctly." }},
    { callout: { t: "info", h: "Automation and Computational Thinking", body: "Automation is the final stage of computational thinking: Abstraction → Decomposition → Algorithm Design → Automation. Without automation, a model is just theory." }},
    { callout: { t: "memorise", h: "4 Steps of Automation", body: "1. Create algorithms (formal logic). 2. Implement as code (translate to a programming language). 3. Implement data structures (represent the data model). 4. Execute (run the program). Cannot skip step 1 — automation requires a formal model first." }},
    { callout: { t: "miscon", h: "Automation ≠ Just Writing Code", body: "Automation requires a clean abstract model built first. Code written without a formal algorithm and data model is NOT automation — it is ad-hoc programming. The quality of the model determines the reliability of the automated system." }}
  ],
  flashcards: [
    ["Define Automation.", "Putting abstract models into action using algorithms and data structures."],
    ["What are the 4 steps of automation?", "Creating algorithms, implementing code, implementing data, and executing."],
    ["Why must a model be 'clean' for automation?", "Computers need precise, noise-free rules to execute correctly."],
    ["What is 'noise' in a real-world model?", "Irrelevant data or variables that don't affect the problem outcome."],
    ["Goal of computer science in automation?", "To build models that solve problems with required accuracy."],
    ["Where does automation sit in computational thinking?", "It is the final stage: abstraction → decomposition → algorithm design → automation."],
    ["Why can't you skip creating algorithms?", "Automation requires a formal model first; without it you have ad-hoc programming, not automation."],
    ["What determines the reliability of an automated system?", "The quality/accuracy of the abstract model it is built on."],
    ["What does the 'execute' step do?", "Runs the implemented program on a processor so the system performs the task automatically."]
  ],
  quiz: [
    { q: "Which step involves turning logic into computer instructions?", opts: ["Design", "Implementation", "Analysis", "Abstraction"], ans: 1, why: "Implementation is the coding phase." },
    { q: "Automation is the result of...", opts: ["Ignoring the user", "Putting models into action", "Deleting the data model", "Parallel processing"], ans: 1, why: "It is the 'execution' phase of computational thinking." },
    { q: "To automate a process, we must first...", opts: ["Buy a server", "Build a model", "Hire a team", "Reboot the PC"], ans: 1, why: "You can't automate without a formal representation (model)." },
    { q: "What defines the accuracy of an automated system?", opts: ["The color of the UI", "The quality of the abstract model", "The speed of the mouse", "The size of the monitor"], ans: 1, why: "The model determines how well reality is captured." },
    { q: "Which is the correct order of automation steps?", opts: ["Execute → code → algorithm → data", "Algorithm → code → data structures → execute", "Data → execute → algorithm → code", "Code → algorithm → execute → data"], ans: 1, why: "Design algorithms, implement them as code, represent the data, then execute." }
  ],
  exam: [
    { q: "List the four essential steps required to achieve automation.", marks: 4, ms: ["Creating algorithms (1)", "Implementing the algorithms in program code (1)", "Implementing the models in data structures (1)", "Executing the code (1)"] },
    { q: "Explain why building a clean abstract model is essential before automating a real-world process.", marks: 3, ms: ["Real-world data is noisy / full of irrelevant detail (1)", "A computer needs precise, unambiguous rules to execute correctly (1)", "The accuracy and reliability of the automated system depend on the quality of the model (1)"] },
    { q: "Discuss how automation is the culmination of the computational thinking process, referring to the stages that precede it and why each is necessary.", marks: 6, ms: ["Abstraction removes irrelevant detail to form a clean model (1)", "Decomposition breaks the problem into manageable sub-problems (1)", "Algorithm design specifies the precise steps to solve each part (1)", "Automation implements these as code + data structures and executes them (1-2)", "Conclusion: skipping earlier stages yields ad-hoc code; the model's quality determines the automated system's reliability (1)"] }
  ]
};

C["compsci:4.4.3.1"] = {
  notes: [
    { h: "Backus-Naur Form (BNF)" },
    { callout: { t: "info", body: "BNF is a formal notation for expressing the syntax of a programming language. It is more powerful than regular expressions because it supports **recursion**, which allows it to describe nested structures like matching brackets." } },
    { callout: { t: "def", h: "BNF Key Concepts", body: [
      { kv: [
        ["Terminal", "An actual symbol in the language — cannot be broken down further (e.g., `0`, `IF`, `;`)."],
        ["Non-Terminal", "A named placeholder defined by production rules (written `<name>`)."],
        ["::=", "Read as 'is defined as' — separates the left side from its definition."],
        ["|", "Read as 'OR' — separates alternative productions."]
      ]}
    ]}},
    { callout: { t: "memorise", h: "BNF Quick Reference", body: "`<name> ::= option1 | option2 | option3`\n\nRecursion: `<integer> ::= <digit> | <digit><integer>` — an integer is either one digit, or a digit followed by another integer." }},
    { callout: { t: "tip", h: "Why BNF Over Regex?", body: "Regular expressions cannot express **context-free** grammars — they have no memory of what came before. BNF (and its parse trees) can track matching pairs like `()`, `{}`, and `begin...end` blocks." }},
    { callout: { t: "info", h: "Syntax Diagrams", body: "A visual alternative to BNF. Terminals are drawn in **ovals/circles**; non-terminals in **rectangles**. Arrows show the valid paths through the grammar. Both represent the same information." }},
    { code: { lang: "pseudo", cap: "Recursive BNF grammar for unsigned integers.", src: "<digit> ::= \"0\" | \"1\" | \"2\" | \"3\" | \"4\" | \"5\" | \"6\" | \"7\" | \"8\" | \"9\"\n<integer> ::= <digit> | <digit> <integer>\n\n# This means an integer is:\n# - A single digit (base case), OR\n# - A digit followed by another integer (recursive case)\n# So: 123 = <digit>1 followed by <integer>(23 = <digit>2 followed by <integer>(3))" }},
    { callout: { t: "miscon", h: "Non-Terminals Are Not Variables", body: "BNF non-terminals (e.g. `<digit>`) are NOT variables that store values — they are named placeholders that MUST be expanded by applying production rules. Also: BNF is NOT a regular expression; BNF supports recursion and context-free grammars, while regular expressions cannot." }}
  ],
  flashcards: [
    ["What does BNF stand for?", "Backus-Naur Form."],
    ["What is a non-terminal?", "A placeholder in BNF that must be further expanded."],
    ["What is a terminal?", "An actual value or symbol in the language grammar."],
    ["Why is BNF better than RegEx for nested brackets?", "BNF supports recursion, which allows it to track depth."],
    ["What does `::=` mean?", "Is defined as."],
    ["What does the `|` symbol mean in BNF?", "OR — it separates alternative productions for a non-terminal."],
    ["Write a recursive BNF rule for an unsigned integer.", "<integer> ::= <digit> | <digit> <integer> — one digit, or a digit followed by another integer."],
    ["What kind of grammar can BNF express that RegEx cannot?", "Context-free grammars — those needing memory of nesting/matching, e.g. balanced brackets."],
    ["How are terminals and non-terminals drawn in syntax diagrams?", "Terminals in ovals/circles; non-terminals in rectangles, with arrows for valid paths."]
  ],
  quiz: [
    { q: "In the rule `<bit> ::= '0' | '1'`, what is `<bit>`?", opts: ["Terminal", "Non-terminal", "Variable", "Loop"], ans: 1, why: "It is a placeholder defined by other symbols." },
    { q: "Which feature of BNF allows for infinite sequences?", opts: ["Iteration", "Recursion", "Selection", "Assignment"], ans: 1, why: "A rule calling itself allows for arbitrary length." },
    { q: "Terminal symbols in syntax diagrams are...", opts: ["Rectangles", "Ovals/Circles", "Triangles", "Diamonds"], ans: 1, why: "Standard convention for terminal symbols." },
    { q: "Which cannot represent a context-free grammar?", opts: ["BNF", "Regular Expressions", "Syntax Diagrams", "Compilers"], ans: 1, why: "RegEx can only represent regular languages, not context-free ones (no recursion)." },
    { q: "In `<num> ::= <digit> | <digit><num>`, the rule is recursive because...", opts: ["it uses a terminal", "<num> is defined in terms of itself", "it has an OR", "it uses digits"], ans: 1, why: "<num> refers to <num> on the right-hand side, allowing arbitrary length." }
  ],
  exam: [
    { q: "Explain why Backus-Naur Form is required to define the syntax of a high-level programming language, rather than just using regular expressions.", marks: 2, ms: ["High-level languages often have nested structures (like matching parentheses) (1)", "Regular expressions cannot handle recursion/counting, whereas BNF can (1)"] },
    { q: "Define the terms 'terminal' and 'non-terminal' in BNF, and explain the role of the symbols `::=` and `|`.", marks: 4, ms: ["Terminal: an actual symbol of the language that cannot be expanded further (1)", "Non-terminal: a named placeholder, written <name>, defined by production rules (1)", "::= means 'is defined as' (1)", "| separates alternative productions ('OR') (1)"] },
    { q: "Using the grammar `<digit> ::= \"0\"|...|\"9\"` and `<integer> ::= <digit> | <digit><integer>`, explain how it defines the string \"42\" and discuss why recursion makes BNF more powerful than regular expressions.", marks: 6, ms: ["<integer> expands to <digit><integer> with <digit> = 4 (1)", "the inner <integer> expands to <digit> = 2 (base case) (1)", "giving the sequence 4 then 2 = \"42\" (1)", "Recursion lets a non-terminal refer to itself, generating arbitrarily long/nested structures (1-2)", "Regular expressions describe only regular languages and cannot count/match nesting (e.g. balanced brackets), which BNF (context-free) can (1)"] }
  ]
};

})(window.KOS_CONTENT);
