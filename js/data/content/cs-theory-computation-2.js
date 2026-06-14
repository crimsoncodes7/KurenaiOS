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
      { h: "Define States", m: "Identify all possible internal states of the system (e.g., idle, processing, error)." },
      { h: "Identify Inputs", m: "Determine the alphabet of symbols the machine will receive as input." },
      { h: "Map Transitions", m: "For every (state, input) pair, define the next state AND the output to produce.", n: "Label each arrow: input / output" },
      { h: "Draw Diagram", m: "Represent states as circles and transitions as labelled arrows with `input/output` format." }
    ]},
    { h: "Sets and Regular Expressions" },
    { callout: { t: "def", h: "Set and Regex Symbols", body: [
      { kv: [
        ["Set", "An unordered collection of unique elements. Operations include union ($\\cup$), intersection ($\\cap$), difference ($\\setminus$), and subset ($\\subset$)."],
        ["Regular Expressions (Regex)", "Define strings that belong to a regular language."],
        ["* (Asterisk)", "Zero or more occurrences of the preceding element."],
        ["+ (Plus)", "One or more occurrences of the preceding element."],
        ["? (Question mark)", "Zero or one occurrence of the preceding element."],
        ["| (Pipe)", "OR (e.g., `a|b` matches 'a' or 'b')."],
        ["( ) (Parentheses)", "Used for grouping elements together."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "Regex matching example", src:
"# Pattern: a(b|c)+d\n# Matches: 'abd', 'acd', 'abbcd'\n# Fails: 'ad' (needs at least one b or c)" }},
    { callout: { t: "memorise", h: "Mealy Machine — Key Rules", body: "Mealy machine = FSM that **produces output**. Output depends on BOTH the current state AND the current input (not just the state). Transitions labelled `input/output`. No accepting states — it is a **transducer** (transforms input to output), not a language recogniser. Used for data conversion and control systems." }},
    { callout: { t: "miscon", h: "Mealy Machine Misconceptions", body: "**Mealy machines can recognise languages like FSAs** — No; Mealy machines are transducers that produce output strings. They have no accepting states and do not accept/reject input. FSAs without output are language recognisers. **The output of a Mealy machine depends only on the current state** — No; it depends on BOTH the current state and the current input. A machine that outputs based on state alone is called a Moore machine (not required by AQA)." }}
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
    { callout: { t: "def", h: "FSM Components", body: [
      { kv: [
        ["State", "A condition or status of the system (represented as a circle)."],
        ["Start State", "The state the machine begins in (marked with an incoming unattached arrow)."],
        ["Accept State", "A state indicating the input is valid (represented as a double circle)."],
        ["Transition", "A change from one state to another based on an input symbol (represented as a labelled arrow)."]
      ]}
    ]}},
    { callout: { t: "tip", h: "Diagram vs Table — both are examined", body: "State transition diagrams show the same information as transition tables, just visually. The table has rows for each state and columns for each input — each cell is the next state." }},
    { code: { lang: "pseudo", cap: "Transition table for FSM accepting even number of 1s (input alphabet {0,1}).", src:
"# Current State | Input 0 | Input 1\n# S0 (start, ✓) | S0      | S1\n# S1             | S1      | S0\n#\n# S0 = even count of 1s seen (accept)\n# S1 = odd count of 1s seen" }},
    { callout: { t: "memorise", h: "Exam checklist for FSM diagrams", body: "1. Every state has a circle.\n2. Start state has an incoming arrow from nowhere.\n3. Accepting state(s) have double circles.\n4. Every (state, input) pair has exactly one arrow (determinism).\n5. All transitions are labelled." }},
    { callout: { t: "miscon", h: "\"Accept state = final state reached\"", body: "A machine only accepts if it ends in an accepting state after ALL input is consumed. Passing through an accepting state mid-string does not count as acceptance." }}
  ],
  flashcards: [
    ["How is an accept state represented in a state transition diagram?", "By a double circle."],
    ["How is the start state marked?", "By an incoming arrow that has no source state."],
    ["When is a string accepted by an FSM?", "When ALL input is consumed and the machine is in an accepting state."],
    ["What information does a transition table encode?", "For every (current state, input) pair, the next state the machine moves to."],
    ["What does determinism mean for an FSM?", "Exactly one transition exists for every (state, input) pair — no ambiguity."]
  ],
  quiz: [
    { q: "What does an arrow between two states represent?", opts: ["A data store", "A transition on a given input", "An accept condition", "A halt"], ans: 1, why: "Arrows show how the machine moves between states based on input." },
    { q: "An FSM accepts input '101'. It must be in an accepting state…", opts: ["after reading '1'", "after reading '10'", "after reading '101' — when all input is consumed", "whenever it enters an accepting state"], ans: 2, why: "Acceptance requires ALL input consumed AND current state is accepting." },
    { q: "A transition table with 3 states and alphabet {a, b} has how many cells (excluding headers)?", opts: ["3", "6", "9", "12"], ans: 1, why: "3 states × 2 input symbols = 6 (state, input) pairs." }
  ],
  exam: [
    { q: "Draw a state transition table for an FSM that accepts binary strings containing an even number of 1s.", marks: 4, ms: ["States S0 (even count, start, accept) and S1 (odd count) identified (1)", "Input 0 leaves both states unchanged: S0→S0, S1→S1 (1)", "Input 1 toggles: S0→S1, S1→S0 (1)", "S0 correctly marked as start and only accept state (1)"] }
  ]
};

C["compsci:4.4.2.3"] = {
  notes: [
    { h: "Mealy Machines as Transducers" },
    { callout: { t: "def", h: "Mealy Machine vs FSA", body: [
      { kv: [
        ["FSA (acceptor)", "Reads input, ends in accept/reject. No output produced during computation."],
        ["Mealy machine (transducer)", "Reads input AND produces an output string. Output on each transition, labelled input/output."],
        ["Use cases", "Binary inverter, simple cipher, traffic light controller, protocol encoder."]
      ]}
    ]}},
    { callout: { t: "tip", h: "Reading transition labels", body: "An arrow labelled `0/1` means: **if the current input is 0**, produce output **1** and move to the next state. The slash separates input from output." }},
    { code: { lang: "pseudo", cap: "Mealy machine logic for a binary inverter (single state S0).", src:
"# State S0 (only state)\n# Transition: 0/1  (input 0 → output 1)\n# Transition: 1/0  (input 1 → output 0)\n#\n# Input:  0 1 1 0 1\n# Output: 1 0 0 1 0" }},
    { callout: { t: "memorise", h: "Mealy vs Moore (for context)", body: "AQA only requires Mealy machines. In a **Mealy** machine output depends on the transition (state + input). In a **Moore** machine output depends only on the state. Mealy machines typically need fewer states." }},
    { callout: { t: "miscon", h: "\"Mealy machines accept/reject strings\"", body: "Mealy machines are **transducers**, not acceptors. They don't have accepting states — they simply produce an output symbol for every input symbol they read." }}
  ],
  flashcards: [
    ["What defines the output of a Mealy machine?", "Both the current state and the current input (the transition)."],
    ["How are Mealy machine transitions labelled?", "input/output — e.g. '0/1' means input 0, produce output 1."],
    ["What is the key difference between a Mealy machine and an FSA?", "An FSA accepts or rejects; a Mealy machine produces an output string (it's a transducer, not an acceptor)."],
    ["Give a real-world example of a Mealy machine.", "A binary inverter, a simple cipher, or a traffic light controller."]
  ],
  quiz: [
    { q: "In a Mealy machine diagram, what does '0/1' on a transition arrow mean?", opts: ["Input 0 OR 1", "Input 0, Output 1", "State 0 to 1", "Divide 0 by 1"], ans: 1, why: "The format is 'input / output'." },
    { q: "A Mealy machine processes input '110'. How many output symbols does it produce?", opts: ["0", "1", "3", "Depends on the number of states"], ans: 2, why: "One output per input symbol — 3 inputs → 3 outputs, regardless of state count." },
    { q: "Which of these CANNOT be modelled by a Mealy machine?", opts: ["A binary inverter", "A toll gate controller", "Recognising if a string has equal 0s and 1s", "A traffic light sequence"], ans: 2, why: "Equal count requires unbounded memory — no finite state machine (Mealy or otherwise) can do this." }
  ],
  exam: [
    { q: "Explain the difference between a Finite State Automaton and a Mealy Machine.", marks: 3, ms: ["An FSA (acceptor) reads input and ends in an accept or reject state (1)", "A Mealy machine (transducer) produces an output symbol for each input symbol consumed (1)", "Mealy transition labels show both input AND output (e.g. 0/1); FSA labels show only input (1)"] }
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
      { h: "Read Symbol", m: "The read/write head reads the symbol from the current cell on the tape." },
      { h: "Check Rules", m: "The FSM looks up the (current state, read symbol) pair in the transition table to find the applicable rule." },
      { h: "Write & Move", m: "The machine writes a new symbol to the current cell, moves the head Left or Right (or stays), and transitions to a new state.", n: "All three actions happen atomically in one step." },
      { h: "Halt", m: "The machine repeats until it enters a defined Halt state — either accept or reject." }
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
    ]}},
    { callout: { t: "miscon", h: "Turing Machine Misconceptions", body: "**A Turing machine can only READ its tape** — No; a Turing machine can READ, WRITE (overwrite symbols), and MOVE the head (left or right) on the tape. The write ability is what makes TMs more powerful than FSAs or PDAs. **A Turing machine must always halt** — No; TMs may loop forever. Whether a given TM halts on a given input is the Halting Problem — proved undecidable by Turing." }}
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
    { callout: { t: "def", h: "The UTM Concept", body: [
      { kv: [
        ["UTM", "A Turing machine that can simulate any other Turing machine by reading its description (transition rules) and input data from its own tape."],
        ["Stored-Program Computer", "The UTM is the theoretical basis for modern computers — both the program (rules) and data are stored in the same memory (the tape)."],
        ["Interpreter analogy", "A UTM acts like an interpreter: it reads instructions (the encoded machine) and executes them step by step."]
      ]}
    ]}},
    { callout: { t: "tip", h: "UTM and the stored-program concept", body: "Von Neumann architecture stores both program instructions and data in the same memory — exactly how a UTM's tape holds both the machine's transition table and the data it operates on. Turing's theoretical model predates the physical computer." }},
    { code: { lang: "pseudo", cap: "Conceptual UTM 'Fetch-Execute' loop.", src:
"WHILE machine_not_halted:\n    symbol = readDataSection(tape)\n    rule = findRule(tape_program, current_state, symbol)\n    writeToDataSection(tape, rule.write_symbol)\n    moveHead(rule.direction)\n    current_state = rule.next_state\nENDWHILE" }},
    { callout: { t: "memorise", h: "What the UTM tape holds", body: "**Program section**: the encoded transition rules of the Turing machine being simulated.\n**Data section**: the actual input that the simulated machine would process.\n\nThe UTM reads a rule from the program section and applies it to the data section." }},
    { callout: { t: "miscon", h: "\"A UTM is more powerful than other Turing machines\"", body: "A UTM is NOT computationally more powerful — it cannot solve problems that are uncomputable. Its significance is **universality**: one machine that can behave like any other, making general-purpose computing possible." }}
  ],
  flashcards: [
    ["What is a Universal Turing Machine?", "A Turing machine that can simulate any other Turing machine given its encoded description and input on its tape."],
    ["What does a UTM's tape contain?", "The encoded transition rules of the machine to be simulated (program section) and the input data (data section)."],
    ["Which modern concept does the UTM underpin?", "The stored-program computer — programs and data stored in the same memory."],
    ["Is a UTM more computationally powerful than other Turing machines?", "No — it can simulate any TM, but cannot solve problems that are uncomputable. Power is in universality, not capability."]
  ],
  quiz: [
    { q: "The UTM is the theoretical model for which modern concept?", opts: ["Object-oriented programming", "Stored-program computers", "Networking", "Artificial Intelligence"], ans: 1, why: "Programs and data on the same tape maps directly to programs and data in the same memory." },
    { q: "A UTM simulates machine M by reading M's…", opts: ["output", "encoded transition rules and input data from its own tape", "RAM contents", "operating system"], ans: 1, why: "The UTM tape contains both M's description (rules) and M's data." },
    { q: "Which statement about a UTM's power is correct?", opts: ["It can solve all problems, including the Halting problem", "It cannot solve problems that are uncomputable by any Turing machine", "It is slower than specific TMs", "It requires more tape than other TMs"], ans: 1, why: "Universality means 'simulate anything'; it does NOT mean 'compute everything'." }
  ],
  exam: [
    { q: "Describe how a UTM simulates another Turing machine, and explain why this is significant for modern computing.", marks: 4, ms: ["The UTM tape contains the encoded transition rules (description) of the machine to be simulated (1)", "It also contains the initial input data for that machine (1)", "The UTM reads a rule from the description, applies it to the data section (write symbol, move head, change state) (1)", "Significance: models the stored-program concept — one physical computer can run any program by loading different instructions into memory (1)"] }
  ]
};

C["compsci:4.4.4.3"] = {
  notes: [
    { h: "The Halting Problem" },
    { callout: { t: "def", h: "The Halting Problem", body: [
      { kv: [
        ["The question", "Can we write a program H(program, input) that correctly determines, for any program and input, whether it will eventually halt or loop forever?"],
        ["Turing's answer (1936)", "No. The Halting Problem is **undecidable** — no such algorithm can exist for all possible (program, input) pairs."],
        ["Significance", "Proves there are inherent limits to what any computer can compute, regardless of hardware or time."]
      ]}
    ]}},
    { callout: { t: "tip", h: "The proof by contradiction", body: "Assume H exists. Build Paradox(x): if H says x(x) halts, Paradox loops; if H says x(x) loops, Paradox halts. Feed Paradox to itself — both outcomes are contradictions. So H cannot exist." }},
    { code: { lang: "python", cap: "The self-referential paradox (illustrative — H cannot actually be written).", src:
"def H(program, input): # Theoretical decider — assumed to exist\n    pass \n\ndef Paradox(x):\n    if H(x, x) == 'halts':\n        while True: pass  # Loop forever — contradiction!\n    else:\n        return           # Halt — contradiction!\n\n# Paradox(Paradox) creates an irresolvable self-reference" }},
    { callout: { t: "memorise", h: "Key vocabulary", body: [
      { kv: [
        ["Decidable", "A problem is decidable if an algorithm always gives the correct yes/no answer in finite time."],
        ["Undecidable", "A problem for which no such algorithm can exist — the Halting Problem is the classic example."],
        ["Non-computable", "A problem that cannot be solved by any Turing machine / any computer ever."]
      ]}
    ]}},
    { callout: { t: "warn", h: "Scope of the result", body: "The Halting Problem result does NOT say that we can't tell if some specific programs halt — we can. It says we can't build one algorithm that works correctly for ALL programs. Specific programs can be individually analysed." }},
    { callout: { t: "miscon", h: "Halting Problem Misconceptions", body: "**We cannot tell if any specific program will halt** — We can and often do for specific programs by inspection. The undecidability result means we cannot build ONE algorithm that correctly determines halting for ALL programs. **The Halting Problem is just a difficult but solvable problem** — It is provably UNCOMPUTABLE (non-decidable) — no Turing machine (or computer program) can ever solve it in general, not merely difficult." }}
  ],
  flashcards: [
    ["Is the Halting problem decidable?", "No — it is undecidable. No algorithm can correctly decide for ALL (program, input) pairs."],
    ["Who proved the Halting problem is undecidable, and when?", "Alan Turing, in 1936."],
    ["What does the Halting Problem prove about computation?", "That there are inherent limits — some problems cannot be solved by any algorithm on any computer."],
    ["What technique does Turing's proof use?", "Proof by contradiction — assuming the halting decider exists and constructing a program that paradoxically contradicts it."],
    ["What is the difference between undecidable and intractable?", "Undecidable: no algorithm can ever exist. Intractable: an algorithm exists but is too slow to be practical."]
  ],
  quiz: [
    { q: "Who proved the Halting problem is undecidable?", opts: ["Von Neumann", "Alan Turing", "Ada Lovelace", "Claude Shannon"], ans: 1, why: "Turing proved it in 1936 using self-referential paradox and Turing machine theory." },
    { q: "The Halting problem is best described as…", opts: ["intractable — solvable but too slow", "undecidable — no algorithm can solve it for all inputs", "NP-complete — verifiable in polynomial time", "decidable with the right hardware"], ans: 1, why: "Undecidable means no algorithm exists at all, not just that it's slow." },
    { q: "Turing's proof that H cannot exist relies on…", opts: ["measuring execution time", "a self-referential program that creates a logical paradox", "exhaustive testing of all programs", "quantum computing"], ans: 1, why: "Paradox(Paradox) creates a contradiction under either assumption about H's output." }
  ],
  exam: [
    { q: "Explain the significance of the Halting problem in computer science.", marks: 3, ms: ["It proves there are problems that cannot be solved by any computer, regardless of speed or memory (1)", "It establishes a theoretical limit to computation — some questions are undecidable (1)", "Proved by Turing in 1936 using proof by contradiction: any hypothetical decider H leads to a self-referential paradox (1)"] }
  ]
};

C["compsci:4.4.4.4"] = {
  notes: [
    { h: "Classification of Algorithmic Complexity" },
    "Algorithms are classified by how their resource usage (time or space) grows as the input size ($n$) increases.",
    { callout: { t: "def", h: "Complexity Classes", body: [
      { kv: [
        ["Constant", "$O(1)$ — Time does not change with $n$."],
        ["Logarithmic", "$O(\\log n)$ — Time increases slowly (e.g. Binary Search)."],
        ["Polynomial", "$O(n^k)$ — Tractable (e.g. $O(n^2)$ Bubble Sort)."],
        ["Exponential", "$O(k^n)$ — Intractable. Doubles with each step increase."]
      ]}
    ]}},
    { code: { lang: "pseudo", cap: "Growth rates comparison.", src:
"# For n=100:\n# O(n)   = 100 operations\n# $O(n^2)$ = 10,000 operations\n# $O(2^n)$ = 1.26 x 10^30 operations (Impossible)" }},
    { callout: { t: "memorise", h: "Big O Complexity Classes", body: "**O(1)** constant — same time regardless of n. **O(log n)** logarithmic — binary search. **O(n)** linear — linear search. **O(n²)** polynomial — bubble sort, insertion sort. **O(2^n)** exponential — brute-force subset enumeration. **Tractable**: O(n^k) polynomial (manageable). **Intractable**: O(2^n) or worse (impractical for large n)." }},
    { callout: { t: "miscon", h: "Big O Misconceptions", body: "**Big O measures actual execution time** — No; Big O describes how the time SCALES with input size n, not the absolute duration. The same O(n²) algorithm runs in completely different actual times on different hardware. **O(n²) is always slower than O(n log n)** — For very small n, O(n²) may be faster due to lower constants. Big O describes asymptotic (large n) behaviour." }}
  ],
  flashcards: [
    ["What is the Big O complexity of a binary search?", "$O(\\log n)$"]
  ],
  quiz: [
    { q: "Which of these is considered a 'tractable' complexity?", opts: ["$O(2^n)$", "$O(n!)$", "$O(n^3)$", "$O(n^n)$"], ans: 2, why: "Polynomial time algorithms are generally considered tractable — they scale reasonably as $n$ grows." }
  ],
  exam: [
    { q: "Explain why $O(2^n)$ is considered intractable.", marks: 2, ms: ["As $n$ increases, the time taken grows so rapidly that it becomes impossible to solve for even moderate $n$ (1)", "Adding one to $n$ doubles the time required (1)"] }
  ]
};

C["compsci:4.4.4.5"] = {
  notes: [
    { h: "Intractable Problems" },
    { callout: { t: "def", h: "Key Definitions", body: [
      { kv: [
        ["Intractable problem", "A problem for which an algorithm exists, but it runs in super-polynomial (exponential or factorial) time — impractical for large inputs."],
        ["Heuristic", "A practical rule-of-thumb technique that finds a 'good enough' approximate solution in polynomial time, when an exact solution is too slow."],
        ["Approximation algorithm", "Finds a solution provably within a known factor of the optimal answer (e.g., within 10%)."]
      ]}
    ]}},
    { callout: { t: "warn", h: "Intractable ≠ Impossible", body: "An intractable problem HAS an algorithm — it's just too slow for large $n$. A problem with NO algorithm at all (like the Halting Problem) is **uncomputable**, which is a strictly stronger statement." }},
    { code: { lang: "pseudo", cap: "Nearest Neighbour heuristic for Travelling Salesman Problem.", src:
"currentCity = startCity\nvisited = {startCity}\nWHILE unvisitedCities NOT empty:\n    next = nearestUnvisited(currentCity)\n    addToTour(next)\n    visited.add(next)\n    currentCity = next\nENDWHILE\nreturnToStart()\n# Runs in O(n^2) — fast, but NOT guaranteed optimal" }},
    { callout: { t: "tip", h: "TSP — why it's intractable", body: "The Travelling Salesman Problem has $(n-1)!/2$ possible routes. For $n=20$: ~60 trillion routes. Even at $10^{10}$ checks/second that's over 6,000 seconds. Adding one city doubles-plus the problem." }},
    { callout: { t: "miscon", h: "\"Heuristics always find a nearly-optimal solution\"", body: "A heuristic can sometimes find the optimal solution and sometimes produce a very poor one. Its advantage is **speed and predictability of time**, not guaranteed quality. It's 'good enough' in practice, not theoretically bounded like an approximation algorithm." }},
    { callout: { t: "memorise", h: "Dealing with Intractable Problems", body: "Intractable problems have solutions but are impractical for large n (exponential or factorial time). Practical approaches: **Heuristics** — fast algorithms that find a good (not necessarily optimal) solution. **Probabilistic algorithms** — near-optimal with high probability. **Approximation algorithms** — guaranteed within a factor of optimal. Classic example: Travelling Salesman Problem (TSP) = O((n−1)!) brute force." }}
  ],
  flashcards: [
    ["How do we solve intractable problems in practice?", "Using heuristics that find approximate solutions in polynomial time."],
    ["What is the key difference between intractable and uncomputable?", "Intractable: an algorithm exists but is too slow. Uncomputable: no algorithm can ever exist."],
    ["Give an example of an intractable problem.", "The Travelling Salesman Problem (TSP) — exact solution is O((n-1)!/2)."],
    ["What does a Nearest Neighbour heuristic for TSP do?", "At each step, moves to the closest unvisited city — fast but not guaranteed optimal."],
    ["Why can't faster hardware solve intractable problems?", "Doubling speed only adds one extra city to what's feasible — the factorial/exponential growth overwhelms any hardware improvement."]
  ],
  quiz: [
    { q: "Which problem is a classic example of intractability?", opts: ["Sorting a list", "Finding a name in a phone book", "The Travelling Salesman Problem", "Calculating an average"], ans: 2, why: "TSP requires checking $(n-1)!/2$ paths for an exact solution — factorial time." },
    { q: "An intractable problem differs from an uncomputable one because…", opts: ["intractable problems have no algorithm", "intractable problems have an algorithm but it is too slow for large n", "uncomputable problems are just slow", "they are the same"], ans: 1, why: "Intractable = algorithm exists, just impractical. Uncomputable = no algorithm possible at all." },
    { q: "A heuristic approach to an intractable problem guarantees…", opts: ["the optimal solution", "a fast, approximately good solution", "a provably bounded approximation", "no solution in polynomial time"], ans: 1, why: "Heuristics trade optimality for speed — 'good enough, fast' not 'best, slow'." }
  ],
  exam: [
    { q: "Explain the role of a heuristic in solving intractable problems. Use the Travelling Salesman Problem as an example.", marks: 4, ms: ["An intractable problem has a solution but it requires exponential/factorial time — not practical for large inputs (1)", "A heuristic provides a fast, approximate solution in polynomial time (1)", "Example: TSP — exact brute force is O((n-1)!/2), impractical for large n (1)", "Nearest Neighbour heuristic: always go to the closest unvisited city — runs in O(n²) but result may not be optimal (1)"] }
  ]
};

C["compsci:4.4.4.6"] = {
  notes: [
    { h: "P and NP Problems" },
    { callout: { t: "def", h: "P vs NP", body: [
      { kv: [
        ["P", "Class of problems that can be **solved** in polynomial time. E.g. sorting, searching, shortest path."],
        ["NP", "Class of problems whose solutions can be **verified** in polynomial time, even if finding them may take exponential time. E.g. Travelling Salesman, Sudoku, factoring."],
        ["NP-complete", "The hardest problems in NP — if ANY NP-complete problem has a polynomial solution, ALL of NP does."],
        ["P = NP?", "The million-dollar open question. Most researchers believe P ≠ NP."]
      ]}
    ]}},
    { callout: { t: "tip", h: "Solving vs Verifying", body: "For NP problems: **verifying** a given solution is easy (polynomial); **finding** a solution from scratch is hard (potentially exponential). Think Sudoku: checking a completed grid is fast; filling a blank grid is slow." }},
    { code: { lang: "pseudo", cap: "Verification vs solving — RSA factoring example.", src:
"# Solving: Find p, q such that p * q = N\n# (Hard for large N — NP difficulty)\n#\n# Verifying: Check if p * q == N\n# (Easy — one multiplication, O(1))\n#\n# This asymmetry is the basis of RSA encryption" }},
    { callout: { t: "memorise", h: "P ⊆ NP", body: "Every problem in P is also in NP — if you can solve it in polynomial time, you can verify it in polynomial time too. P is a subset of NP. The question is whether NP contains problems outside P." }},
    { callout: { t: "warn", h: "Cryptographic importance", body: "If P = NP were proved, most public-key encryption (RSA, ECC) would collapse overnight — the hardness of factoring and discrete logarithms would evaporate. This is why the question matters beyond pure theory." }},
    { callout: { t: "miscon", h: "P vs NP Misconceptions", body: "**P and NP are known to be different classes** — No; P vs NP is one of the greatest unsolved problems in mathematics. It is not proven whether P = NP or P ≠ NP. Most computer scientists believe P ≠ NP. **NP stands for 'non-polynomial'** — No; NP stands for 'Nondeterministic Polynomial time' — problems where a PROPOSED SOLUTION can be verified in polynomial time, even if finding the solution may not be." }}
  ],
  flashcards: [
    ["What does P stand for?", "Polynomial time — problems solvable in polynomial time."],
    ["What does NP stand for?", "Nondeterministic Polynomial time — problems verifiable in polynomial time."],
    ["Is P a subset of NP?", "Yes — every problem solvable in polynomial time can also be verified in polynomial time."],
    ["What would P = NP imply?", "All NP problems (including currently hard ones) could be solved in polynomial time — encryption would break."],
    ["Give an example that illustrates the P vs NP distinction.", "Sudoku: verifying a solution is fast; finding one from scratch is slow (NP-complete)."]
  ],
  quiz: [
    { q: "If P = NP, what would that imply?", opts: ["Verification is hard", "Finding solutions is as easy as verifying them", "Computers are broken", "Encryption is safer"], ans: 1, why: "It would mean all NP problems have polynomial time solutions — a dramatic result." },
    { q: "A problem is in NP if…", opts: ["it can be solved in polynomial time", "a solution can be verified in polynomial time", "it has no algorithm", "it requires exponential time to verify"], ans: 1, why: "NP = verifiable in polynomial time. NP doesn't say solving is hard — just that verifying is fast." },
    { q: "RSA encryption relies on the fact that factoring large numbers is…", opts: ["in P", "believed to be NP but not in P", "uncomputable", "O(log n)"], ans: 1, why: "Factoring is believed to be hard to solve but easy to verify — a classic NP characteristic." }
  ],
  exam: [
    { q: "Define the complexity classes P and NP, and explain what the relationship P ⊆ NP means.", marks: 4, ms: ["P: problems solvable in polynomial time (1)", "NP: problems whose solutions can be verified in polynomial time (1)", "P ⊆ NP: every P problem is also NP — if you can solve in poly time, you can verify in poly time (1)", "The open question is whether NP contains problems that are NOT in P (i.e. whether P = NP) (1)"] }
  ]
};

C["compsci:4.4.4.7"] = {
  notes: [
    { h: "Limits of Computation and Regular Languages" },
    { callout: { t: "def", h: "Hierarchy of computational power", body: [
      { kv: [
        ["FSA (Finite State Automaton)", "Weakest — no memory beyond the current state. Recognises **regular languages** only (describable by regex)."],
        ["PDA (Pushdown Automaton)", "FSA + a stack. Recognises **context-free languages** (e.g. matched parentheses, aⁿbⁿ)."],
        ["Turing Machine", "Most powerful. Recognises any **computable language**. Theoretical model of universal computation."],
        ["Regular ⊂ Context-free ⊂ Computable", "Each class strictly contains the previous — a proper hierarchy."]
      ]}
    ]}},
    { callout: { t: "memorise", h: "What each machine CANNOT do", body: [
      { table: {
        head: ["Machine", "Cannot recognise"],
        rows: [
          ["FSA", "aⁿbⁿ (must count n — needs unbounded memory)"],
          ["PDA", "aⁿbⁿcⁿ (needs two independent counters — one stack isn't enough)"],
          ["Turing Machine", "Non-computable languages (e.g. the set of programs that halt)"]
        ]
      }}
    ]}},
    { code: { lang: "pseudo", cap: "Language recognition limits in practice.", src:
"# REGULAR (FSA can do):\n#   'a', 'aa', 'aaa', ...  = a+\n#   binary strings with even 1s\n#\n# CONTEXT-FREE (needs PDA):\n#   a^n b^n  e.g. ab, aabb, aaabbb\n#   Matched parentheses: ((()))\n#\n# COMPUTABLE (needs TM, no FSA/PDA):\n#   a^n b^n c^n  e.g. abc, aabbcc\n#   Any program that halts on input X" }},
    { callout: { t: "tip", h: "Why FSAs can't count", body: "An FSA has a fixed finite number of states — it cannot track an unbounded count. To match n 'a's against n 'b's, you'd need a different state for each possible n — requiring infinitely many states. That's not finite." }},
    { callout: { t: "miscon", h: "\"More states = more power\"", body: "You can add as many states as you like to an FSA — it is still a finite automaton and can still only recognise regular languages. The class of FSAs is defined by the model (finite states, no stack, no tape), not the count of states." }}
  ],
  flashcards: [
    ["Which machine is more powerful: an FSA or a Turing Machine?", "A Turing Machine — it can recognise any computable language, while FSAs are limited to regular languages."],
    ["What additional memory does a PDA have compared to an FSA?", "A stack — allowing it to recognise context-free languages like aⁿbⁿ."],
    ["Why can't an FSA recognise aⁿbⁿ?", "Recognising aⁿbⁿ requires counting n — an FSA has finite states and no memory, so it can't count unboundedly."],
    ["State the Chomsky hierarchy from weakest to strongest.", "Regular (FSA) → Context-free (PDA) → Computable (Turing Machine)."],
    ["Can a PDA recognise aⁿbⁿcⁿ?", "No — matching three equal counts needs two independent counters; a single stack can't do both simultaneously."]
  ],
  quiz: [
    { q: "Which machine can recognise a language requiring a stack?", opts: ["FSA", "Mealy Machine", "Pushdown Automaton", "Logic Gate"], ans: 2, why: "PDAs include a stack for memory — essential for context-free languages like aⁿbⁿ." },
    { q: "The language L = {aⁿbⁿ | n ≥ 0} belongs to which class?", opts: ["Regular", "Context-free", "Computable only", "Uncomputable"], ans: 1, why: "aⁿbⁿ requires counting — regular FSAs can't do it; PDAs can via the stack." },
    { q: "Adding more states to an FSA…", opts: ["makes it recognise context-free languages", "makes it equivalent to a Turing Machine", "still leaves it recognising only regular languages", "eliminates the need for a stack"], ans: 2, why: "FSA power is defined by the model (no stack/tape), not the number of states." }
  ],
  exam: [
    { q: "Explain why an FSA cannot recognise the language L = {aⁿbⁿ | n ≥ 0}, and name a machine that can.", marks: 3, ms: ["An FSA has a finite number of states and no memory beyond the current state (1)", "It cannot count an arbitrary n — recognising aⁿbⁿ requires comparing two unbounded counts (1)", "A Pushdown Automaton (PDA) can do it: push an 'a' for each 'a' read, pop one for each 'b' — the stack is empty iff the counts match (1)"] }
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
      { h: "Read Symbol", m: "Read the expression left to right, one token at a time." },
      { h: "Number Found", m: "Push the number onto the stack.", n: "Stack grows with each operand." },
      { h: "Operator Found", m: "Pop the top two numbers, apply the operator (second-popped OP first-popped), push the result.", n: "First popped = right operand. Second popped = left operand." },
      { h: "Result", m: "When the expression is exhausted, the single remaining value on the stack is the answer." }
    ]},
    { code: { lang: "pseudo", cap: "Stack evaluation logic", src:
"FOR EACH token IN expression\n  IF token IS number THEN\n    stack.PUSH(token)\n  ELSE IF token IS operator THEN\n    b = stack.POP()\n    a = stack.POP()\n    stack.PUSH(evaluate(a, token, b))\n  ENDIF\nENDFOR" }},
    { callout: { t: "memorise", h: "RPN Evaluation", body: "RPN (Reverse Polish Notation) = operators AFTER operands. Also called **postfix notation**. Evaluation uses a **stack**: push operands; on operator, pop two operands, evaluate, push result. Example: `3 4 + 5 ×` = (3+4)×5 = 35. No brackets needed — operator position makes precedence explicit." }},
    { callout: { t: "miscon", h: "RPN Misconceptions", body: "**RPN requires brackets like infix notation** — No; RPN is bracket-free by design. Operator position and the stack make precedence completely unambiguous. **RPN is harder to evaluate than infix** — For computers (and calculators), RPN is EASIER: a simple stack-based loop handles it without complex precedence rules or bracket parsing." }}
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
