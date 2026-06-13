/* Kurenai OS — deep content: AQA 7517 §4.4 Theory of Computation (Part 2) */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.4.2.4"] = {
  notes: [
    { h: "Mealy Machines" },
    { callout: { t: "def", h: "Mealy Machine Concepts", body: [
      { kv: [
        ["Mealy Machine", "A type of Finite State Machine (FSM) that produces an output. Crucially, the output is determined by both the **current state** and the **current input**."]
      ]}
    ]}},
    { h: "Comparing FSM Types" },
    { table: {
      head: ["Feature", "Finite State Automaton (FSA)", "Mealy Machine"],
      rows: [
        ["Output", "None (Accept/Reject only)", "Produces an output string"],
        ["Transition", "Input only", "Input and Output (`in/out`)"],
        ["Purpose", "Language recognition", "Data transformation / Control systems"]
      ]
    }},
    { callout: { t: "tip", h: "State Transition Diagrams", body: "Transitions are typically labelled in the format `input / output`." }},
    { h: "Mealy Machine Design Process" },
    { steps: [
      { h: "Define States", n: "Identify all possible internal states of the system." },
      { h: "Identify Inputs", n: "Determine the alphabet of symbols the machine will receive." },
      { h: "Map Transitions", n: "For every state-input pair, decide the next state and the output." },
      { h: "Draw Diagram", n: "Represent states as circles and transitions as arrows with `in/out` labels." }
    ]},
    { h: "Sets and Regular Expressions" },
    { callout: { t: "def", h: "Set and Regex Symbols", body: [
      { kv: [
        ["Set", "An unordered collection of unique elements. Operations include union ($\$\cup$$), intersection ($\$\cap$$), difference ($\$\setminus$$), and subset ($\$\subset$$)."],
        ["Regular Expressions (Regex)", "Define strings that belong to a regular language."],
        ["* (Asterisk)", "Zero or more occurrences of the preceding element."],
        ["+ (Plus)", "One or more occurrences of the preceding element."],
        ["? (Question mark)", "Zero or one occurrence of the preceding element."],
        ["| (Pipe)", "OR (e.g., `a|b` matches 'a' or 'b')."],
        ["( ) (Parentheses)", "Used for grouping elements together."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "Regex matching example", src:
"# Pattern: a(b|c)+d\n# Matches: 'abd', 'acd', 'abbcd'\n# Fails: 'ad' (needs at least one b or c)" }}
  ],
  flashcards: [
    ["What is a Mealy machine?", "An FSM where the output is determined by both the current state and the current input."],
    ["How are transitions typically labelled on a Mealy machine diagram?", "With the input and the corresponding output, separated by a slash (e.g., `0 / 1`)."],
    ["What does the `*` symbol mean in a regular expression?", "Zero or more occurrences of the preceding element."],
    ["What does the `+` symbol mean in a regular expression?", "One or more occurrences of the preceding element."],
    ["What does the `?` symbol mean in a regular expression?", "Zero or one occurrence of the preceding element."],
    ["What is the difference between a Mealy machine and an FSM without output?", "A Mealy machine produces an output string based on inputs and states, while an FSM without output only accepts or rejects an input string."]
  ],
  quiz: [
    { q: "In a Mealy machine, what determines the output?", opts: ["Current state only", "Current input only", "Current state and current input", "The final state"], ans: 2, why: "Outputs in a Mealy machine depend on the transition, meaning both the state you are in and the input you receive." },
    { q: "Which regular expression matches 'ab', 'abb', 'abbb' but NOT 'a'?", opts: ["ab*", "ab+", "a+b", "ab?"], ans: 1, why: "The '+' means one or more 'b's must follow the 'a'." },
    { q: "What is the set operation that contains elements in set A but not in set B?", opts: ["Union", "Intersection", "Difference", "Subset"], ans: 2, why: "Difference (A \\ B) removes any elements from A that are also found in B." },
    { q: "If a regular expression is `a(b|c)*`, which string is invalid?", opts: ["a", "ab", "acbc", "bac"], ans: 3, why: "The string must start with 'a'. 'bac' starts with 'b', so it fails to match." }
  ],
  exam: [
    { q: "Explain the difference between a Mealy machine and an FSM without output. Give an example of a use case for a Mealy machine.", marks: 3,
      ms: ["A Mealy machine produces an output for each state transition (1)", "An FSM without output only accepts or rejects an input string by reaching an accepting state (1)", "Example use case: Simple cipher machine, traffic light controller, or parsing text (1)"] }
  ]
};

C["compsci:4.4.2.2"] = {
  notes: [
    { h: "State Transition Diagrams and Tables" },
    "Finite State Machines (FSMs) are modeled using diagrams (circles for states, arrows for transitions) and tables (showing next state based on current state and input).",
    { callout: { t: "def", h: "FSM Components", body: [
      { kv: [
        ["State", "A condition or status of the system (represented as a circle)."],
        ["Transition", "A change from one state to another (represented as an arrow)."],
        ["Accept State", "A state indicating the input is valid (represented as a double circle)."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "A transition table representation.", src:
"# Current State | Input | Next State\n# S0            | 0     | S0\n# S0            | 1     | S1\n# S1            | 0     | S1\n# S1            | 1     | S0" }}
  ],
  flashcards: [
    ["How is an accept state represented in a state transition diagram?", "By a double circle."]
  ],
  quiz: [
    { q: "What does an arrow between two states represent?", opts: ["A data store", "A transition", "An accept condition", "A halt"], ans: 1, why: "Arrows show how the machine moves between states based on input." }
  ],
  exam: [
    { q: "Draw a state transition table for an FSM that accepts strings with an even number of '1's.", marks: 4, ms: ["Correct states S0 (Even) and S1 (Odd) (1)", "Input 0 stays in current state (1)", "Input 1 toggles between S0 and S1 (1)", "S0 marked as start and accept state (1)"] }
  ]
};

C["compsci:4.4.2.3"] = {
  notes: [
    { h: "Mealy Machines" },
    "A Mealy machine is an FSM where the output is determined by both the current state and the current input. This makes them useful for mapping inputs to outputs.",
    { callout: { t: "def", h: "Mealy Machine", body: [
      { kv: [
        ["Output", "Generated during the transition (represented as input/output on the arrow)."],
        ["Use Case", "Controllers, encoders, and simple translators."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "Mealy machine logic for a binary inverter.", src:
"IF state == S0 AND input == '1' THEN\n    output = '0'\n    nextState = S0\nELSE IF state == S0 AND input == '0' THEN\n    output = '1'\n    nextState = S0\nENDIF" }}
  ],
  flashcards: [
    ["What defines the output of a Mealy machine?", "Both the current state and the current input."]
  ],
  quiz: [
    { q: "In a Mealy machine diagram, what does '0/1' on a transition arrow mean?", opts: ["Input 0 OR 1", "Input 0, Output 1", "State 0 to 1", "Divide 0 by 1"], ans: 1, why: "The format is 'input / output'." }
  ],
  exam: [
    { q: "Explain the difference between a Finite State Automaton and a Mealy Machine.", marks: 2, ms: ["FSA only accepts or rejects strings (1)", "Mealy Machine generates an output for every transition (1)"] }
  ]
};

C["compsci:4.4.4.1"] = {
  notes: [
    { h: "Turing Machines" },
    { callout: { t: "def", h: "Turing Machine Components", body: [
      { kv: [
        ["Turing Machine", "A formal, theoretical model of computation. It consists of a finite state machine, an infinitely long tape divided into cells, and a read/write head."],
        ["Universal Turing Machine (UTM)", "Can simulate the behaviour of any other Turing machine by reading its description (its rules) and its data from the tape. This is the theoretical foundation of the **stored-program computer**."]
      ]}
    ]}},
    { h: "Turing Machine vs Universal Turing Machine" },
    { table: {
      head: ["Machine Type", "Capability", "Modern Analogy"],
      rows: [
        ["Standard TM", "Solves one specific problem/algorithm", "A single-purpose logic circuit"],
        ["Universal TM", "Executes any algorithm by reading its description", "A general-purpose CPU / Computer"]
      ]
    }},
    { h: "The Turing Machine Operation" },
    { steps: [
      { h: "Read Symbol", n: "The head reads the symbol from the current cell on the tape." },
      { h: "Check Rules", n: "The FSM looks up the current state and the read symbol in the transition table." },
      { h: "Write & Move", n: "The machine writes a new symbol, moves the head (Left, Right, or Stay), and enters a new state." },
      { h: "Halt", n: "The process repeats until the machine enters a defined 'Halt' state." }
    ]},
    { code: { lang: "pseudo", cap: "A transition rule entry: (Current State, Symbol) -> (New State, Write Symbol, Direction)", src:
"(S0, '1') -> (S1, '0', R)\n# If in state S0 and see a '1', change to S1, write '0', move head Right." }},
    { h: "The Halting Problem" },
    { callout: { t: "memorise", h: "The Halting Problem", body: "It is impossible to write a general program that can determine whether *any* given program will eventually halt (stop) or run forever." }},
    { h: "Tractability" },
    { callout: { t: "def", h: "Computational Complexity", body: [
      { kv: [
        ["Tractable Problem", "A problem that can be solved in a reasonable (polynomial) amount of time, e.g., $O(n^2)$ or $O(n^k)$."],
        ["Intractable Problem", "A problem that has a theoretical solution, but takes an unreasonable (exponential or factorial) amount of time to solve for large inputs, e.g., $O(2^n)$ or $O(n!)$."],
        ["Heuristic", "An approach to problem-solving that uses a practical method to find a 'good enough' approximate solution in a reasonable time, often used for intractable problems."]
      ]}
    ]}}
  ],
  flashcards: [
    ["What are the components of a Turing Machine?", "A finite state machine, an infinitely long tape divided into cells, and a read/write head."],
    ["What is a Universal Turing Machine?", "A Turing machine that can simulate the behavior of any other Turing machine by reading its description and input from the tape."],
    ["What is the Halting Problem?", "The provable impossibility of writing a program that can determine if any arbitrary program will eventually halt or run forever."],
    ["What defines an intractable problem?", "A problem that has a theoretical solution, but the time to solve it grows exponentially or factorially, making it impossible to solve exactly for large inputs."],
    ["What is a heuristic approach?", "A technique used to find an approximate, 'good enough' solution to an intractable problem in a reasonable amount of time."]
  ],
  quiz: [
    { q: "A Turing machine tape is...", opts: ["Finite", "Infinite", "Read-only", "Circular"], ans: 1, why: "The tape in a Turing machine is theoretically infinite in both directions to provide unbounded memory." },
    { q: "The concept that a single machine can execute any program is formalized by...", opts: ["The Halting Problem", "Tractability", "Universal Turing Machine", "Mealy Machine"], ans: 2, why: "A UTM reads the description of a specific machine from its tape and simulates it." },
    { q: "If an algorithm has a time complexity of $O(2^n)$, the problem it solves is generally considered:", opts: ["Tractable", "Intractable", "Unsolvable", "Heuristic"], ans: 1, why: "Exponential time complexities are intractable because the time required grows too fast to be practical for large inputs." },
    { q: "Why is the Halting problem significant?", opts: ["It proves that some problems cannot be solved by any computer", "It shows how to stop infinite loops", "It proves all programs halt eventually", "It makes programs run faster"], ans: 0, why: "It provides a mathematically proven example of a non-computable problem." }
  ],
  exam: [
    { q: "Describe the structure of a Turing Machine and explain why a Universal Turing Machine is considered a model for modern stored-program computers.", marks: 4,
      ms: ["Structure: Contains a finite state machine, an infinite tape, and a read/write head (1)", "Tape is divided into cells containing symbols from a defined alphabet (1)", "A UTM can simulate any other TM by reading its description (program) from the tape (1)", "This models the stored-program concept where both instructions (the machine description) and data are stored in the same memory space (1)"] }
  ]
};

C["compsci:4.4.4.2"] = {
  notes: [
    { h: "Universal Turing Machines (UTM)" },
    "A UTM is a Turing machine that can simulate any other Turing machine. It reads the description of the machine to be simulated (the program) and the input data from its own tape.",
    { callout: { t: "def", h: "The UTM Concept", body: [
      { kv: [
        ["Stored-Program Computer", "The UTM is the theoretical basis for modern computers where programs and data are stored in the same memory."],
        ["Interpreter", "A UTM acts like an interpreter, executing the rules defined on its tape."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "Conceptual UTM 'Fetch-Execute' loop.", src:
"WHILE machine_not_halted:\n    rule = findRule(tape_program, current_state, tape_data_symbol)\n    execute(rule)\nENDWHILE" }}
  ],
  flashcards: [
    ["What is a Universal Turing Machine?", "A Turing machine that can simulate any other Turing machine given its description."]
  ],
  quiz: [
    { q: "The UTM is the theoretical model for which modern concept?", opts: ["Object-oriented programming", "Stored-program computers", "Networking", "Artificial Intelligence"], ans: 1, why: "It treats programs as data on the tape." }
  ],
  exam: [
    { q: "Describe how a UTM simulates another Turing machine.", marks: 3, ms: ["The UTM tape contains the transition rules of the machine to be simulated (1)", "It also contains the initial data for that machine (1)", "The UTM reads a rule, performs the action on the data section of its tape, and updates its simulated state (1)"] }
  ]
};

C["compsci:4.4.4.3"] = {
  notes: [
    { h: "The Halting Problem" },
    "The Halting problem asks: 'Can we write a program that can determine, for any given program and input, whether it will eventually stop or run forever?' Alan Turing proved this is impossible.",
    { callout: { t: "def", h: "The Halting Problem", body: [
      { kv: [
        ["Computability", "It defines the limits of what can be computed."],
        ["Undecidable", "There is no algorithm that can solve the halting problem for all possible inputs."]
      ]}
    ]}},
    { code: { lang: "python", cap: "The logic of the proof (Self-reference).", src:
"def H(program, input): # Theoretical decider\n    pass \n\ndef Paradox(x):\n    if H(x, x) == 'halts':\n        while True: pass # Loop forever\n    else:\n        return # Halt" }}
  ],
  flashcards: [
    ["Is the Halting problem decidable?", "No, it is undecidable."]
  ],
  quiz: [
    { q: "Who proved the Halting problem is undecidable?", opts: ["Von Neumann", "Alan Turing", "Ada Lovelace", "Claude Shannon"], ans: 1, why: "Turing proved it in 1936 using the concept of a Turing Machine." }
  ],
  exam: [
    { q: "Explain the significance of the Halting problem in computer science.", marks: 2, ms: ["It proves that there are some problems that cannot be solved by any computer (1)", "It establishes a theoretical limit to computation (1)"] }
  ]
};

C["compsci:4.4.4.4"] = {
  notes: [
    { h: "Classification of Algorithmic Complexity" },
    "Algorithms are classified by how their resource usage (time or space) grows as the input size ($n$) increases.",
    { callout: { t: "def", h: "Complexity Classes", body: [
      { kv: [
        ["Constant", "$$O(1)$$ - Time does not change with $n$."],
        ["Logarithmic", "$O(\\log n)$ - Time increases slowly (e.g. Binary Search)."],
        ["Polynomial", "$$O(n^k)$$ - Tractable (e.g. $$O(n^2)$$ Bubble Sort)."],
        ["Exponential", "$O(k^n)$ - Intractable."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "Growth rates comparison.", src:
"# For n=100:\n# O(n)   = 100 operations\n# $O(n^2)$ = 10,000 operations\n# $O(2^n)$ = 1.26 x 10^30 operations (Impossible)" }}
  ],
  flashcards: [
    ["What is the Big O complexity of a binary search?", "$O(\\log n)$"]
  ],
  quiz: [
    { q: "Which of these is considered a 'tractable' complexity?", opts: ["$$O(2^n)$$", "$$O(n!)$$", "$$O(n^3)$$", "$O(n^n)$"], ans: 2, why: "Polynomial time algorithms are generally considered tractable." }
  ],
  exam: [
    { q: "Explain why $$O(2^n)$$ is considered intractable.", marks: 2, ms: ["As $n$ increases, the time taken grows so rapidly that it becomes impossible to solve for even moderate $n$ (1)", "Adding one to $n$ doubles the time required (1)"] }
  ]
};

C["compsci:4.4.4.5"] = {
  notes: [
    { h: "Intractable Problems" },
    "An intractable problem is one for which no polynomial-time algorithm exists to find an exact solution. They require exponential or factorial time.",
    { callout: { t: "def", h: "Handling Intractability", body: [
      { kv: [
        ["Heuristics", "Using 'rules of thumb' to find a 'good enough' solution quickly."],
        ["Approximation", "Algorithms that find a solution within a certain range of the optimal."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "A heuristic for Traveling Salesman (Nearest Neighbor).", src:
"currentCity = startCity\nWHILE unvisitedCities:\n    next = findClosest(currentCity)\n    moveTo(next)\nENDWHILE" }}
  ],
  flashcards: [
    ["How do we solve intractable problems in practice?", "Using heuristics to find approximate solutions."]
  ],
  quiz: [
    { q: "Which problem is a classic example of intractability?", opts: ["Sorting a list", "Finding a name in a phone book", "The Traveling Salesman Problem", "Calculating average"], ans: 2, why: "TSP requires checking $(n-1)!/2$ paths for an exact solution." }
  ],
  exam: [
    { q: "Explain the role of a heuristic in solving intractable problems.", marks: 2, ms: ["It provides a fast, approximate solution (1)", "Where an exact solution would take too long to compute (1)"] }
  ]
};

C["compsci:4.4.4.6"] = {
  notes: [
    { h: "P and NP Problems" },
    "Problems are categorized based on the difficulty of finding vs. verifying a solution.",
    { callout: { t: "def", h: "P vs NP", body: [
      { kv: [
        ["P", "Problems that can be **solved** in polynomial time."],
        ["NP", "Problems whose solutions can be **verified** in polynomial time, even if finding them takes longer."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "Verification is easier than solving.", src:
"# Finding factors of a huge number (Hard - NP)\n# Verifying if X * Y == Target (Easy - P)" }}
  ],
  flashcards: [
    ["What does P stand for?", "Polynomial time."],
    ["What does NP stand for?", "Nondeterministic Polynomial time."]
  ],
  quiz: [
    { q: "If P = NP, what would that imply?", opts: ["Verification is hard", "Finding solutions is as easy as verifying them", "Computers are broken", "Encryption is safer"], ans: 1, why: "It would mean all NP problems have polynomial time solutions." }
  ],
  exam: [
    { q: "Define the complexity class NP.", marks: 2, ms: ["The class of problems where a proposed solution (1)", "Can be verified in polynomial time (1)"] }
  ]
};

C["compsci:4.4.4.7"] = {
  notes: [
    { h: "Limits of Computation and Regular Languages" },
    "Not all problems can be solved by every model. This hierarchy shows the power of different computational machines.",
    { callout: { t: "def", h: "Hierarchy of Power", body: [
      { kv: [
        ["FSA", "Lowest power. Can only recognize regular languages (no memory)."],
        ["PDA", "Adds a stack. Can recognize context-free languages."],
        ["Turing Machine", "Most powerful. Can recognize any computable language."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "Language recognition limits.", src:
"# a^n b^n (e.g. aaabbb)\n# FSA cannot do this (needs to count n).\n# PDA can do this (pushes 'a's to stack, pops for 'b's)." }}
  ],
  flashcards: [
    ["Which machine is more powerful: an FSA or a Turing Machine?", "A Turing Machine."]
  ],
  quiz: [
    { q: "Which machine can recognize a language requiring a stack?", opts: ["FSA", "Mealy Machine", "Pushdown Automaton", "Logic Gate"], ans: 2, why: "PDAs include a stack for memory." }
  ],
  exam: [
    { q: "Explain why an FSA cannot recognize the language L = {a^n b^n | n >= 0}.", marks: 2, ms: ["An FSA has a finite number of states / no memory (1)", "It cannot count an arbitrary number of 'a's to match with 'b's (1)"] }
  ]
};

C["compsci:4.4.5.1"] = {
  notes: [
    { h: "Reverse Polish Notation (RPN)" },
    { callout: { t: "def", h: "RPN Concepts", body: [
      { kv: [
        ["Reverse Polish Notation (RPN)", "Also known as postfix notation, it is a way of writing mathematical expressions where the operator follows its operands (e.g., `3 4 +` instead of `3 + 4`)."]
      ]}
    ]}},
    { h: "Comparing Infix and RPN" },
    { table: {
      head: ["Infix (Standard)", "RPN (Postfix)"],
      rows: [
        ["`3 + 4`", "`3 4 +`"],
        ["`5 * (2 + 1)`", "`5 2 1 + *`"],
        ["Requires brackets", "No brackets needed"],
        ["Requires precedence (BODMAS)", "Strictly linear execution"]
      ]
    }},
    { h: "Advantages of RPN" },
    { kv: [
      ["No brackets", "RPN eliminates the need for parentheses to dictate the order of operations."],
      ["No precedence rules", "Operators are executed strictly in the order they appear from left to right."],
      ["Easy machine evaluation", "RPN is trivial to evaluate using a Stack data structure."]
    ]},
    { h: "Evaluation using a Stack" },
    { steps: [
      { h: "Read Symbol", n: "Read the expression from left to right." },
      { h: "Number Found", n: "If you see a number, Push it onto the stack." },
      { h: "Operator Found", n: "If you see an operator, Pop the top two numbers, apply the operator, and Push the result back." },
      { h: "Result", n: "The final remaining number on the stack is the result." }
    ]},
    { code: { lang: "pseudo", cap: "Stack evaluation logic", src:
"FOR EACH token IN expression\n  IF token IS number THEN\n    stack.PUSH(token)\n  ELSE IF token IS operator THEN\n    b = stack.POP()\n    a = stack.POP()\n    stack.PUSH(evaluate(a, token, b))\n  ENDIF\nENDFOR" }}
  ],
  flashcards: [
    ["What is another name for Reverse Polish Notation?", "Postfix notation."],
    ["Why is Reverse Polish Notation useful for computers?", "It removes the need for brackets and precedence rules, and can be evaluated linearly using a simple stack."],
    ["How is the infix expression `A + B` written in RPN?", "`A B +`"],
    ["What data structure is ideal for evaluating an RPN expression?", "A Stack."],
    ["Convert the infix expression `A * (B + C)` to RPN.", "`A B C + *`"],
    ["Convert the RPN expression `X Y + Z *` to infix.", "`(X + Y) * Z`"]
  ],
  quiz: [
    { q: "Evaluate the RPN expression: `5 3 + 2 *`", opts: ["10", "16", "11", "25"], ans: 1, why: "5 + 3 = 8. Then 8 * 2 = 16." },
    { q: "Convert `A + B * C` to RPN.", opts: ["A B C * +", "A B + C *", "+ A * B C", "A B C + *"], ans: 0, why: "Multiplication happens first (`B C *`), then addition to A (`A B C * +`)." },
    { q: "Which data structure is primarily used to evaluate RPN?", opts: ["Queue", "Tree", "Stack", "Linked List"], ans: 2, why: "A stack is used because operations are performed on the most recently seen operands." },
    { q: "What is a key advantage of RPN over infix notation?", opts: ["It uses fewer variables", "It doesn't require parentheses to define the order of operations", "It works with strings instead of numbers", "It is easier for humans to read"], ans: 1, why: "RPN is unambiguous and doesn't need brackets or complex BODMAS/PEMDAS logic." }
  ],
  exam: [
    { q: "Show the steps a stack would take to evaluate the RPN expression `8 4 2 / -`.", marks: 3,
      ms: ["Push 8, Push 4, Push 2 (Stack is [8, 4, 2]) (1)", "Encounter '/', pop 2 and 4, calculate 4 / 2 = 2, push 2 (Stack is now [8, 2]) (1)", "Encounter '-', pop 2 and 8, calculate 8 - 2 = 6, push 6. Final result is 6 (1)"] }
  ]
};

})(window.KOS_CONTENT);
