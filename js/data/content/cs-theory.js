/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.5.4.4"] = {
  "notes": [
    {
      "h": "Fixed point vs floating point"
    },
    {
      "diagram": "binary-number"
    },
    {
      "table": {
        "head": [
          "",
          "Fixed point",
          "Floating point"
        ],
        "rows": [
          [
            "Point position",
            "Fixed, agreed in advance",
            "Floats — encoded by the exponent"
          ],
          [
            "Form",
            "Ordinary binary with an implied point",
            "mantissa × 2^exponent (both two's complement at AQA)"
          ],
          [
            "Range",
            "Narrow",
            "Huge for the same bits"
          ],
          [
            "Precision",
            "Uniform across the range",
            "Concentrated near zero; gaps widen as magnitude grows"
          ],
          [
            "Speed",
            "Faster arithmetic",
            "Slower; needs alignment of exponents"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "body": "**Normalised test**: mantissa begins **0 1** for positive numbers, **1 0** for negative. That exact phrasing is the mark. Normalisation maximises precision by removing leading redundant bits and gives every value one unique representation."
      }
    },
    {
      "page": "Decode & encode"
    },
    {
      "h": "Decode a floating point number — the safe routine"
    },
    {
      "steps": [
        {
          "h": "Given",
          "m": "mantissa 0.1011000 (8 bits), exponent 0011 (4 bits), both two's complement"
        },
        {
          "h": "Exponent first",
          "m": "0011 = +3 → move the point 3 places RIGHT"
        },
        {
          "h": "Move the point",
          "m": "0.1011000 → 0101.1000"
        },
        {
          "h": "Convert",
          "m": "0101.1 = 4 + 1 + 0.5 = 5.5",
          "n": "Negative exponent moves the point LEFT instead. Negative mantissa (starts 1): two's complement it first, convert, re-apply the sign."
        }
      ]
    },
    {
      "h": "Encode — finding mantissa and exponent"
    },
    {
      "steps": [
        {
          "h": "Target: 5.5",
          "m": "5.5 in fixed point = 101.1"
        },
        {
          "h": "Normalise",
          "m": "101.1 = 0.1011 × 2³   (point moved 3 left → exponent +3)"
        },
        {
          "h": "Pad to the bit widths",
          "m": "mantissa 0.1011000, exponent 0011"
        }
      ]
    },
    {
      "callout": {
        "t": "warn",
        "body": "Moving the point left INCREASES the exponent; right DECREASES it (think: you owe back what you took). Getting this backwards flips the answer by orders of magnitude and is the single most common error in the topic."
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "Rounding/representation errors: some values (0.1!) cannot be represented exactly in binary, causing rounding error; subtracting nearly-equal values causes cancellation error. \"Absolute error\" = |actual − stored|; \"relative error\" = absolute ÷ actual. Each definition is a sentence worth a mark."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "More Exponent Bits = More Precision",
        "body": "More exponent bits increases RANGE (how large or small numbers can be), NOT precision. More MANTISSA bits increase precision (significant figures). Spending bits on the exponent costs precision — it's a fixed-sum trade-off. Also: normalised negative mantissa starts 10, NOT 11."
      }
    }
  ],
  "flashcards": [
    [
      "Normalised mantissa patterns?",
      "Begins 01 for positive numbers, 10 for negative — point sits after the sign bit."
    ],
    [
      "Two benefits of normalisation?",
      "Maximum precision from the available mantissa bits, and a unique representation per value."
    ],
    [
      "Positive exponent moves the point…?",
      "Right by that many places (negative exponent: left)."
    ],
    [
      "Range vs precision trade-off in the format?",
      "More exponent bits → bigger range; more mantissa bits → finer precision. Fixed total forces a trade."
    ],
    [
      "Why can't 0.1 (denary) be stored exactly?",
      "Its binary expansion is infinite (0.000110011…), so any finite mantissa truncates it — rounding error."
    ],
    [
      "Absolute vs relative error?",
      "Absolute = |actual − stored|; relative = absolute ÷ actual (often as a percentage)."
    ],
    ["Do more exponent bits improve precision?", "No — they increase RANGE. Precision (significant figures) comes from more MANTISSA bits; the bit budget is a trade-off."],
    ["Why does normalisation give a unique representation?", "It fixes the leading bits (0.1 / 1.0), so each value has exactly one normalised mantissa-and-exponent form."],
    ["What causes cancellation error?", "Subtracting two nearly-equal floating-point values: matching leading digits cancel, leaving few significant bits."]
  ],
  "quiz": [
    {
      "q": "Which 8-bit mantissa is normalised and positive?",
      "opts": [
        "0.0110000",
        "0.1010000",
        "1.1010000",
        "1.0010000"
      ],
      "ans": 1,
      "why": "Positive normalised = starts 0.1; option D is a normalised NEGATIVE."
    },
    {
      "q": "Mantissa 0.1100000, exponent 0010 represents…",
      "opts": [
        "1.5",
        "3",
        "6",
        "0.75"
      ],
      "ans": 1,
      "why": "Exponent +2: 0.11 → 011. = 3."
    },
    {
      "q": "Increasing mantissa bits at the cost of exponent bits gives…",
      "opts": [
        "more range, less precision",
        "more precision, less range",
        "both increase",
        "no change"
      ],
      "ans": 1,
      "why": "Mantissa carries significant figures; exponent carries scale."
    },
    {
      "q": "Subtracting two nearly equal floats chiefly risks…",
      "opts": [
        "overflow",
        "cancellation error",
        "underflow of the exponent",
        "a parity error"
      ],
      "ans": 1,
      "why": "Leading matching digits cancel, leaving few significant bits — a hallmark exam point."
    },
    {
      "q": "Spending more bits on the exponent (fewer on the mantissa) gives…",
      "opts": ["finer precision", "a larger representable range", "faster arithmetic", "a unique representation"],
      "ans": 1,
      "why": "Exponent bits scale magnitude (range); mantissa bits carry precision."
    }
  ],
  "exam": [
    {
      "q": "A floating point system uses an 8-bit two's complement mantissa and a 4-bit two's complement exponent. Express 6.5 in normalised form, showing your working.",
      "marks": 4,
      "ms": [
        "6.5 = 110.1 in fixed-point binary (1)",
        "Normalise: 0.1101 × 2³ (1)",
        "Mantissa padded: 0.1101000 (1)",
        "Exponent 3 = 0011 (1)"
      ]
    },
    {
      "q": "Explain the difference between fixed-point and floating-point representation, and state one advantage of each.",
      "marks": 4,
      "ms": ["Fixed point: the binary point is in a fixed, pre-agreed position (1); advantage: faster/simpler arithmetic and uniform precision (1)", "Floating point: the point's position is encoded by an exponent (mantissa × 2^exp) (1); advantage: much greater range for the same number of bits (1)"]
    },
    {
      "q": "Discuss the trade-off between range and precision in a fixed-width floating-point format, and explain why some decimal values cannot be stored exactly.",
      "marks": 6,
      "ms": ["The total bits are split between mantissa and exponent (1)", "More mantissa bits → more precision (significant figures); more exponent bits → more range (1-2)", "With fixed total width, increasing one decreases the other — a direct trade-off (1)", "Some values (e.g. 0.1) have an infinite recurring binary expansion (1)", "A finite mantissa must truncate/round them, causing representation/rounding error (1)"]
    }
  ],
  "gens": [
    "float",
    "bin"
  ],
  "sims": [
    "binary-number"
  ]
};

C["compsci:4.6.2.1"] = {
  "notes": [
    {
      "h": "Classification of Programming Languages"
    },
    {
      "callout": {
        "t": "info",
        "body": "Programming languages developed from low-level languages tied directly to the hardware towards high-level languages closer to human thought. They are classified into low-level and high-level languages."
      }
    },
    {
      "h": "Low-level languages"
    },
    {
      "callout": {
        "t": "def",
        "h": "Machine code",
        "body": "Binary instructions executed directly by the CPU — the only language a processor truly understands. Each instruction is specific to that processor's instruction set."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Assembly language",
        "body": "A human-readable form of machine code using mnemonics (e.g. LDA, ADD, STA), with one statement per machine instruction. It is translated to machine code by an assembler and is still processor-specific."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Characteristics of low-level languages",
        "body": "Give precise, direct control of the hardware and run very fast in little memory, but are hard to write and debug, require detailed knowledge of the processor, and are not portable between different processors."
      }
    },
    {
      "h": "High-level languages"
    },
    {
      "callout": {
        "t": "def",
        "h": "High-level language",
        "body": "A language closer to natural language and mathematics and largely independent of the hardware (portable). One statement typically maps to many machine instructions, and the code is translated by a compiler or interpreter. Examples: Python, Java, C#."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Imperative high-level language",
        "body": "A high-level language in which a program is a sequence of commands (statements) that change the program's state — specifying HOW to carry out a task step by step (e.g. Python, C, Java). Like assembly and machine code it gives an explicit ordered sequence of operations, but at a hardware-independent, abstracted level — which is its relationship to low-level languages."
      }
    },
    {
      "page": "Comparison and trade-offs"
    },
    {
      "table": {
        "head": [
          "Feature",
          "Low-level (machine code / assembly)",
          "High-level"
        ],
        "rows": [
          [
            "Statement to instruction",
            "1 : 1 with machine instructions",
            "1 : many machine instructions"
          ],
          [
            "Execution",
            "Direct (machine code) / after assembling",
            "Needs a compiler or interpreter"
          ],
          [
            "Portability",
            "Processor-specific",
            "Portable across machines"
          ],
          [
            "Ease of writing",
            "Hard, error-prone",
            "Easier, readable, maintainable"
          ],
          [
            "Hardware control",
            "Full, precise",
            "Limited / abstracted"
          ],
          [
            "Speed and size",
            "Very fast, compact",
            "Some translation overhead"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Advantages and disadvantages",
        "body": [
          {
            "kv": [
              [
                "Low-level advantages",
                "Fast execution, memory-efficient, full control of hardware — suits device drivers and embedded systems."
              ],
              [
                "Low-level disadvantages",
                "Hard to write/debug, processor-specific (not portable), needs detailed hardware knowledge."
              ],
              [
                "High-level advantages",
                "Faster development, portable, easier to read, debug and maintain."
              ],
              [
                "High-level disadvantages",
                "Less direct hardware control and some performance overhead from translation."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Language classification",
        "body": "**Low-level** = machine code (binary, runs directly on the CPU) + assembly (mnemonics, assembled, 1:1). Processor-specific, fast, hard to write. **High-level** = portable, readable, 1 statement → many instructions, needs a compiler/interpreter. **Imperative high-level** = a sequence of state-changing commands (specifies HOW), the abstracted relative of low-level languages."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconceptions",
        "body": "**Assembly is a high-level language** — No; it is low-level: one mnemonic per machine instruction and processor-specific. **High-level code runs directly on the CPU** — No; it must be translated (compiled or interpreted) into machine code first."
      }
    }
  ],
  "flashcards": [
    [
      "What are the two low-level languages?",
      "Machine code and assembly language."
    ],
    [
      "What is machine code?",
      "Binary instructions executed directly by the CPU, specific to its instruction set."
    ],
    [
      "What is assembly language?",
      "A human-readable form of machine code using mnemonics, translated to machine code by an assembler; one statement per machine instruction."
    ],
    [
      "What is a high-level language?",
      "A hardware-independent, portable language closer to human language, where one statement maps to many machine instructions and needs a compiler/interpreter."
    ],
    [
      "What is an imperative high-level language?",
      "A high-level language where a program is a sequence of commands that change state, specifying HOW to do a task (e.g. Python, Java, C)."
    ],
    [
      "Give one advantage of low-level over high-level programming.",
      "Faster execution, smaller memory use, or precise/direct control of the hardware."
    ],
    [
      "Give one advantage of high-level over low-level programming.",
      "Faster development, portability, or easier reading/debugging/maintenance."
    ],
    [
      "Why is assembly language not portable?",
      "Its mnemonics map to a specific processor's instruction set, so it must be rewritten for a different processor."
    ]
  ],
  "quiz": [
    {
      "q": "Which is a low-level language?",
      "opts": [
        "Python",
        "Assembly language",
        "Java",
        "SQL"
      ],
      "ans": 1,
      "why": "Assembly is low-level — mnemonics mapping 1:1 to machine instructions."
    },
    {
      "q": "Machine code is...?",
      "opts": [
        "written in English keywords",
        "binary instructions run directly by the CPU",
        "always portable",
        "translated by an interpreter"
      ],
      "ans": 1,
      "why": "Machine code is the CPU's native binary instruction set."
    },
    {
      "q": "A key advantage of high-level languages is...?",
      "opts": [
        "direct hardware control",
        "portability across machines",
        "no translation needed",
        "1:1 mapping to instructions"
      ],
      "ans": 1,
      "why": "High-level languages are hardware-independent and portable."
    },
    {
      "q": "In a high-level language, one statement typically corresponds to...?",
      "opts": [
        "one machine instruction",
        "many machine instructions",
        "no instructions",
        "one assembly mnemonic"
      ],
      "ans": 1,
      "why": "High-level statements expand into many machine instructions."
    },
    {
      "q": "An imperative high-level language program is essentially...?",
      "opts": [
        "a set of facts",
        "a sequence of commands that change state",
        "a circuit diagram",
        "binary only"
      ],
      "ans": 1,
      "why": "Imperative programs specify an ordered sequence of state-changing commands (HOW)."
    }
  ],
  "exam": [
    {
      "q": "State the two types of low-level language.",
      "marks": 2,
      "ms": [
        "Machine code. (1)",
        "Assembly language. (1)"
      ]
    },
    {
      "q": "Explain what is meant by an 'imperative high-level language' and its relationship to low-level languages.",
      "marks": 3,
      "ms": [
        "An imperative language expresses a program as a sequence of commands/statements that change the program's state. (1)",
        "It specifies HOW a task is performed step by step (e.g. Python, Java, C). (1)",
        "Like low-level languages it gives an explicit ordered sequence of operations, but at a hardware-independent, abstracted level. (1)"
      ]
    },
    {
      "q": "Discuss the advantages and disadvantages of programming in machine code or assembly compared with a high-level language.",
      "marks": 6,
      "ms": [
        "Machine code/assembly run very fast and use little memory. (1)",
        "They give full, precise control of the hardware (useful for drivers/embedded systems). (1)",
        "But they are hard to write and debug and need detailed processor knowledge. (1)",
        "They are processor-specific, so not portable. (1)",
        "High-level languages are portable, faster to develop and easier to read/maintain. (1)",
        "Their drawback is less direct hardware control and some performance overhead from translation, so the choice depends on whether control/speed or productivity/portability matters most. (1)"
      ]
    }
  ]
};

C["compsci:4.4.2.1"] = {
  "notes": [
    {
      "h": "Finite state machines"
    },
    {
      "diagram": "fsm-lab"
    },
    {
      "kv": [
        [
          "Finite state machine",
          "A model of computation with a finite set of states, an input alphabet, a transition function, a start state and — for an acceptor — a set of accepting (goal) states."
        ]
      ]
    },
    {
      "h": "Reading the diagrams"
    },
    {
      "callout": {
        "t": "tip",
        "h": "FSM Visual Conventions",
        "body": [
          {
            "kv": [
              [
                "Start state",
                "Marked by an unattached incoming arrow."
              ],
              [
                "Accepting state",
                "Indicated by a double circle (in acceptors)."
              ],
              [
                "Transition",
                "A labelled edge showing the input that triggers a state change."
              ],
              [
                "Mealy machine",
                "Labels in 'input/output' format (e.g. 1/0) — it produces an output on transition."
              ],
              [
                "Determinism",
                "Exactly one transition exists for every possible (state, input) pair."
              ]
            ]
          }
        ]
      }
    },
    {
      "page": "Tracing & method"
    },
    {
      "h": "\"What does this FSM accept?\" — the method"
    },
    {
      "steps": [
        {
          "h": "Probe systematically",
          "m": "Test ε (empty), 0, 1, 00, 01, 10, 11…\nrecord accept/reject for each"
        },
        {
          "h": "Name the states",
          "m": "Ask what each state REMEMBERS.\nE.g. S0 = \"seen an even number of 1s so far\", S1 = \"odd so far\"",
          "n": "Once states have meanings, the language usually announces itself."
        },
        {
          "h": "State the pattern, not examples",
          "m": "\"The FSM accepts strings containing an even number of 1s\" — a general description, in a sentence."
        }
      ]
    },
    {
      "callout": {
        "t": "miscon",
        "body": "An FSM has **no memory beyond its current state** — it cannot count unboundedly. That's exactly why no FSM accepts \"equal numbers of 0s and 1s\", and why BNF/context-free grammars (4.4.3) exist for what FSMs can't do."
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "Construction questions: draw a transition for EVERY symbol from EVERY state (determinism), mark the start arrow and double-circle the accepts before tracing anything. Missing transitions are the classic dropped mark."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "FSM Essentials",
        "body": "Five components: finite set of STATES, INPUT ALPHABET, TRANSITION FUNCTION (state × input → next state), START STATE, ACCEPTING STATES. Deterministic: exactly one transition per (state, input) pair. Mealy: output on each transition (input/output label). A string is accepted when ALL input is consumed AND the machine is in an accepting state."
      }
    }
  ],
  "flashcards": [
    [
      "Components of an FSM acceptor?",
      "Finite states, input alphabet, transition function, one start state, set of accepting states."
    ],
    [
      "Visual conventions for start and accept?",
      "Start: incoming unattached arrow. Accepting: double circle."
    ],
    [
      "What makes an FSM deterministic?",
      "Exactly one transition defined for every (state, input symbol) pair."
    ],
    [
      "What is a Mealy machine?",
      "An FSM producing outputs on its transitions (input/output labels) — a transducer, not an acceptor."
    ],
    [
      "Why can't an FSM match brackets/count equal 0s and 1s?",
      "Finite states = bounded memory; unbounded counting needs more powerful models (e.g. grammars in BNF)."
    ],
    ["List the five components of an FSM acceptor.", "A finite set of states, an input alphabet, a transition function, a start state, and a set of accepting states."],
    ["How do you work out what an FSM accepts?", "Test short strings recording accept/reject, give each state a meaning (what it remembers), then state the general pattern in a sentence."],
    ["In a deterministic FSM, how many transitions leave each state?", "Exactly one per input symbol — so states × alphabet-size transitions in total."]
  ],
  "quiz": [
    {
      "q": "A string is accepted when…",
      "opts": [
        "any state is reached",
        "the machine halts in an accepting state after consuming ALL input",
        "the start state is revisited",
        "an output is produced"
      ],
      "ans": 1,
      "why": "Both conditions: input exhausted AND current state accepting."
    },
    {
      "q": "Edge label \"1/0\" on a state diagram indicates…",
      "opts": [
        "a syntax error",
        "a Mealy machine: input 1 produces output 0",
        "division",
        "a probability"
      ],
      "ans": 1,
      "why": "Input/output transition labels are the Mealy signature."
    },
    {
      "q": "An FSM for \"binary strings divisible by 3\" needs how many states?",
      "opts": [
        "1",
        "2",
        "3",
        "infinitely many"
      ],
      "ans": 2,
      "why": "Track the remainder mod 3 — three possible remainders, three states."
    },
    {
      "q": "Deterministic FSM, alphabet {0,1}, 4 states: total transitions required?",
      "opts": [
        "4",
        "6",
        "8",
        "16"
      ],
      "ans": 2,
      "why": "One per symbol per state: 4 × 2 = 8."
    },
    {
      "q": "Why can no FSM accept the language of strings with equal numbers of 0s and 1s?",
      "opts": ["it has too few states", "it has no memory to count unboundedly", "it is non-deterministic", "0s and 1s are not in its alphabet"],
      "ans": 1,
      "why": "Equal-count requires tracking an unbounded difference; finite states can't store an unbounded count."
    }
  ],
  "exam": [
    {
      "q": "An FSM has states S0 (start, accepting) and S1. On input 1 each state moves to the other; input 0 leaves the state unchanged. Describe the set of strings this FSM accepts, justifying your answer.",
      "marks": 3,
      "ms": [
        "1s toggle the state; 0s are ignored (1)",
        "Machine is in S0 exactly when an even number of 1s has been read (1)",
        "Accepts all binary strings containing an even number of 1s (including none) (1)"
      ]
    },
    {
      "q": "State the five components of a finite state machine acceptor.",
      "marks": 3,
      "ms": ["Finite set of states; input alphabet (1)", "Transition function (state × input → next state); start state (1)", "Set of accepting (goal) states (1)"]
    },
    {
      "q": "Design a deterministic FSM that accepts binary strings divisible by 3 (value mod 3). Describe the states and transitions, and explain why three states suffice.",
      "marks": 6,
      "ms": ["Three states for remainders 0, 1, 2; start and accept = remainder-0 state (1-2)", "Reading a bit b updates value to 2×value + b, so remainder r → (2r + b) mod 3 (1-2)", "Transitions: r0 on 0→r0, on 1→r1; r1 on 0→r2, on 1→r0; r2 on 0→r1, on 1→r2 (1)", "Three states suffice because only the remainder mod 3 (not the whole value) needs to be remembered (1)"]
    }
  ],
  "sims": [
    "fsm-lab"
  ]
};

C["compsci:4.1.2.3"] = {
  "notes": [
    {
      "h": "The four pillars of OOP — with the wording that scores"
    },
    {
      "callout": {
        "t": "def",
        "h": "Core OOP Definitions",
        "body": [
          {
            "kv": [
              [
                "Class",
                "A blueprint/template defining the attributes (data) and methods (behaviour) of a type of object."
              ],
              [
                "Object",
                "An instance of a class. Instantiation is the act of creating an object from a class."
              ],
              [
                "Encapsulation",
                "Bundling data and the methods that operate on it into one unit, hiding internal data from direct external access (private fields, public methods)."
              ],
              [
                "Inheritance",
                "A subclass derives the attributes and methods of a superclass, and can add to or override them — models an 'is-a' relationship."
              ],
              [
                "Polymorphism",
                "Objects of different classes respond to the SAME method call with behaviour appropriate to their own class — achieved via method overriding."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "All four pillars in twenty lines — keep this skeleton in your head for 9-markers.",
        "src": "public abstract class GameEntity              // abstraction: common contract\n{\n    private int health = 100;                  // encapsulated: no direct access\n    public void TakeDamage(int amount)         // controlled access via method\n    {\n        health -= amount;\n    }\n    public abstract string Describe();         // forces subclasses to implement\n}\n\npublic class Suspect : GameEntity              // inheritance: 'is-a'\n{\n    public override string Describe()          // polymorphism: same call,\n        => \"A nervous suspect.\";               // class-specific behaviour\n}\n\npublic class Detective : GameEntity\n{\n    public override string Describe() => \"Sharp-eyed and patient.\";\n}\n// foreach (GameEntity e in cast) Console.WriteLine(e.Describe());\n// one method call — each object answers as its own class: polymorphism."
      }
    },
    {
      "page": "Class diagrams"
    },
    {
      "h": "Class diagram conventions"
    },
    {
      "callout": {
        "t": "tip",
        "h": "UML Visual Notations",
        "body": [
          {
            "kv": [
              [
                "Inheritance",
                "Arrow points from subclass to superclass (child → parent)."
              ],
              [
                "Access Modifiers",
                "`+` denotes public, `−` denotes private, `#` denotes protected."
              ],
              [
                "Association",
                "A basic line representing a 'uses-a' relationship."
              ],
              [
                "Aggregation",
                "Hollow diamond on the 'whole' side; parts can exist independently of the whole."
              ],
              [
                "Composition",
                "Filled diamond on the 'whole' side; parts are destroyed with the whole."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "body": "The three design principles by name: **encapsulate what varies**, **favour composition over inheritance**, **program to interfaces, not implementation**. AQA asks for these verbatim."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "'Polymorphism = many forms' is not enough",
        "body": "The phrase 'many forms' by itself scores zero. Examiners want the mechanism: **the same method call is made on objects of different classes**, and each class executes its own **overriding** version. Without naming the method call and the class-specific response, you're just quoting the etymology."
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "Override vs overload: overriding REPLACES an inherited method (same signature, subclass); overloading provides same-name methods with DIFFERENT parameter lists in one class. Exams love the distinction."
      }
    }
  ],
  "flashcards": [
    [
      "Define encapsulation.",
      "Combining data and its methods in one unit, with data hidden from direct external access (private fields, public methods)."
    ],
    [
      "Define polymorphism creditably.",
      "Objects of different classes respond to the same method call with behaviour appropriate to their class."
    ],
    [
      "Which way does the inheritance arrow point?",
      "From the subclass to the superclass."
    ],
    [
      "Aggregation vs composition?",
      "Both 'has-a'; aggregation's parts outlive the whole (hollow diamond), composition's parts are destroyed with it (filled diamond)."
    ],
    [
      "The three named design principles?",
      "Encapsulate what varies; favour composition over inheritance; program to interfaces, not implementation."
    ],
    [
      "Override vs overload?",
      "Override: subclass replaces an inherited method (same signature). Overload: same name, different parameter lists, same class."
    ],
    ["What is instantiation?", "Creating an object (instance) from a class, e.g. `new Player()`."],
    ["Why can an abstract class not be instantiated?", "It is an incomplete blueprint (may have unimplemented abstract members) existing only to be subclassed."]
  ],
  "quiz": [
    {
      "q": "Making fields private and exposing public methods demonstrates…",
      "opts": [
        "inheritance",
        "encapsulation / information hiding",
        "overloading",
        "instantiation"
      ],
      "ans": 1,
      "why": "Data hidden behind a controlled interface — the definition of encapsulation."
    },
    {
      "q": "Virtual in a base class + override in a subclass enables…",
      "opts": [
        "encapsulation",
        "polymorphism",
        "aggregation",
        "static binding"
      ],
      "ans": 1,
      "why": "The same call resolves to the subclass's behaviour at run time."
    },
    {
      "q": "\"A Library has Books which continue to exist if the Library closes\" models…",
      "opts": [
        "composition",
        "aggregation",
        "inheritance",
        "polymorphism"
      ],
      "ans": 1,
      "why": "Has-a with independently surviving parts = aggregation (hollow diamond on Library)."
    },
    {
      "q": "An abstract class…",
      "opts": [
        "cannot have any methods",
        "cannot be instantiated directly",
        "cannot be inherited",
        "must be sealed"
      ],
      "ans": 1,
      "why": "It exists to be subclassed; abstract members force implementations."
    },
    {
      "q": "Overriding differs from overloading because overriding…",
      "opts": ["uses a different parameter list in one class", "replaces an inherited method with the same signature in a subclass", "is the same as instantiation", "only applies to private fields"],
      "ans": 1,
      "why": "Override = subclass redefines an inherited method (same signature); overload = same name, different parameters, one class."
    }
  ],
  "exam": [
    {
      "q": "A game has classes Player and Enemy, both needing position data and a Move() method, with Enemy moving differently. Design an object-oriented solution, naming the OOP features you use.",
      "marks": 6,
      "ms": [
        "Base class (e.g. Character/GameEntity) holding shared position attributes (1)",
        "Position encapsulated: private/protected with accessor methods (1)",
        "Player and Enemy inherit from the base class (1)",
        "Move() declared virtual (or abstract) in the base (1)",
        "Enemy overrides Move() with its own behaviour (1)",
        "Polymorphism named: same Move() call, class-appropriate behaviour at run time (1)"
      ]
    },
    {
      "q": "Define encapsulation and explain one benefit it gives in object-oriented software.",
      "marks": 3,
      "ms": ["Encapsulation bundles data with the methods that operate on it, hiding internal data (private fields, public methods) (1)", "Benefit: prevents invalid external modification / protects data integrity (1)", "or: the implementation can change without affecting code that uses the object (1) (max 3)"]
    },
    {
      "q": "Explain the difference between aggregation and composition, giving an example of each and stating how they are drawn in a UML class diagram.",
      "marks": 4,
      "ms": ["Aggregation: a has-a where the parts can exist independently of the whole (1); e.g. a Team has Players who survive the team — hollow diamond (1)", "Composition: a has-a where the parts are destroyed with the whole (1); e.g. a House has Rooms that cease to exist with it — filled diamond (1)"]
    }
  ],
  "sims": []
};

C["compsci:4.10.3"] = {
  "notes": [
    {
      "h": "Normalisation to 3NF"
    },
    {
      "kv": [
        [
          "Normalisation",
          "Organising the attributes of a relational database to eliminate data redundancy and the update/insert/delete anomalies it causes."
        ]
      ]
    },
    {
      "table": {
        "head": [
          "Form",
          "Rule",
          "Kill-test"
        ],
        "rows": [
          [
            "1NF",
            "Atomic values only; no repeating groups; rows uniquely identified",
            "Any cell holding a list? Any repeated column groups (Item1, Item2…)?"
          ],
          [
            "2NF",
            "1NF + no PARTIAL dependency: every non-key attribute depends on the WHOLE composite key",
            "Composite key? Check each attribute against each key part."
          ],
          [
            "3NF",
            "2NF + no TRANSITIVE dependency: no non-key attribute depends on another non-key attribute",
            "Does X → Y where neither is the key? Extract it."
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "body": "The 3NF sentence examiners reward verbatim: **\"every non-key attribute depends on the key, the whole key and nothing but the key.\"** (…so help me Codd.)"
      }
    },
    {
      "page": "Worked decomposition"
    },
    {
      "h": "Worked decomposition"
    },
    {
      "steps": [
        {
          "h": "Unnormalised",
          "m": "Order(OrderID, Date, CustName, CustAddress,\n      {ProductID, ProductName, Qty})",
          "n": "Braces = repeating group → fails 1NF."
        },
        {
          "h": "→ 1NF",
          "m": "Order(OrderID, Date, CustName, CustAddress)\nOrderLine(OrderID, ProductID, Qty, ProductName)",
          "n": "Repeating group extracted; OrderLine keyed on (OrderID, ProductID)."
        },
        {
          "h": "→ 2NF",
          "m": "ProductName depends only on ProductID (part of the key) → partial dependency\nProduct(ProductID, ProductName)\nOrderLine(OrderID, ProductID, Qty)"
        },
        {
          "h": "→ 3NF",
          "m": "CustAddress depends on CustName (non-key → non-key) → transitive\nCustomer(CustID, CustName, CustAddress)\nOrder(OrderID, Date, CustID)",
          "n": "Underline primary keys; asterisk/overline foreign keys in your final answer."
        }
      ]
    },
    {
      "callout": {
        "t": "tip",
        "body": "Benefits paragraph that scores fully: eliminates redundant duplication → less storage AND no inconsistent copies; prevents update, insertion and deletion anomalies; maintains data integrity. Name the anomalies."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "body": "Normalisation is not \"splitting tables until it feels tidy\". Each step targets ONE specific dependency type — name which (repeating group / partial / transitive) you are removing as you do it."
      }
    }
  ],
  "flashcards": [
    [
      "Requirements for 1NF?",
      "Atomic attribute values, no repeating groups, rows uniquely identifiable (a primary key)."
    ],
    [
      "What does 2NF eliminate?",
      "Partial dependency — a non-key attribute depending on only PART of a composite key."
    ],
    [
      "What does 3NF eliminate?",
      "Transitive dependency — a non-key attribute depending on another non-key attribute."
    ],
    [
      "The 3NF mantra?",
      "Every non-key attribute depends on the key, the whole key and nothing but the key."
    ],
    [
      "Three anomaly types normalisation prevents?",
      "Update, insertion and deletion anomalies."
    ],
    ["What is a partial dependency?", "A non-key attribute that depends on only PART of a composite primary key — removed at 2NF."],
    ["What is a transitive dependency?", "A non-key attribute that depends on another non-key attribute — removed at 3NF."],
    ["Give one benefit of normalising to 3NF.", "Eliminates redundant duplication, saving storage and preventing inconsistent copies / update anomalies (maintains data integrity)."]
  ],
  "quiz": [
    {
      "q": "A table stores \"Subjects: Maths, CS, IT\" in one cell. Which form does it fail?",
      "opts": [
        "1NF",
        "2NF",
        "3NF",
        "None"
      ],
      "ans": 0,
      "why": "Non-atomic value (a list in a cell) is a 1NF violation."
    },
    {
      "q": "Key (StudentID, CourseID); attribute CourseName depends only on CourseID. This violates…",
      "opts": [
        "1NF",
        "2NF",
        "3NF",
        "referential integrity"
      ],
      "ans": 1,
      "why": "Dependence on part of a composite key = partial dependency = 2NF failure."
    },
    {
      "q": "Non-key DeptName depends on non-key DeptCode. This violates…",
      "opts": [
        "1NF",
        "2NF",
        "3NF",
        "nothing"
      ],
      "ans": 2,
      "why": "Non-key → non-key is transitive dependency, removed at 3NF."
    },
    {
      "q": "Storing a customer's address once (not per order) chiefly prevents…",
      "opts": [
        "deadlock",
        "update anomalies / inconsistency",
        "slow queries",
        "SQL injection"
      ],
      "ans": 1,
      "why": "One copy to change — duplicates can't drift out of sync."
    },
    {
      "q": "The phrase 'depends on the key, the whole key and nothing but the key' describes…",
      "opts": ["1NF", "2NF", "3NF", "a foreign key"],
      "ans": 2,
      "why": "'whole key' rules out partial dependency (2NF) and 'nothing but the key' rules out transitive dependency, giving 3NF."
    }
  ],
  "exam": [
    {
      "q": "Explain what is meant by a transitive dependency and why removing them (3NF) improves a database. Use an example.",
      "marks": 4,
      "ms": [
        "Transitive: non-key attribute determined by another non-key attribute (1)",
        "Valid example, e.g. DeptName depends on DeptCode in an Employee table (1)",
        "Causes redundancy: DeptName repeated for every employee in that dept (1)",
        "Risk of update anomaly/inconsistency removed by extracting Dept(DeptCode, DeptName) (1)"
      ]
    },
    {
      "q": "State the three rules that define first, second and third normal form.",
      "marks": 3,
      "ms": ["1NF: atomic values only, no repeating groups, rows uniquely identified (1)", "2NF: 1NF and no partial dependency on a composite key (1)", "3NF: 2NF and no transitive dependency between non-key attributes (1)"]
    },
    {
      "q": "An Orders table repeats the customer's name and address on every order line. Discuss the problems this causes and how normalising to 3NF resolves them.",
      "marks": 6,
      "ms": ["Redundancy: the same customer details are duplicated across many rows, wasting storage (1)", "Update anomaly: changing an address means updating many rows, risking inconsistency (1)", "Insertion anomaly: can't store a customer without an order; deletion anomaly: removing the last order loses the customer (1)", "Normalise: extract Customer(CustID, Name, Address) and reference it by CustID foreign key (1-2)", "Result: each fact stored once — integrity maintained and anomalies removed (1)"]
    }
  ]
};

C["compsci:4.10.4"] = {
  "notes": [
    {
      "h": "SQL: the clauses, in marking order"
    },
    { callout: { t: "tip", body: "AQA marks SQL **clause by clause** — a right skeleton with one wrong condition still scores most of the marks. Build in this order, every time:" } },
    {
      "code": {
        "lang": "sql",
        "cap": "The retrieval skeleton.",
        "src": "SELECT Title, Price              -- which fields\nFROM Manga                       -- which table(s)\nWHERE Price < 10                 -- which rows  (strings need 'quotes')\nORDER BY Price DESC;             -- presentation (ASC default)"
      }
    },
    {
      "page": "Joins & data changes"
    },
    {
      "h": "Joins — linking tables on keys"
    },
    {
      "code": {
        "lang": "sql",
        "cap": "Either join style is accepted; the JOIN…ON form reads cleaner. Use Table.Field when names clash.",
        "src": "SELECT Customer.Name, Orders.OrderDate\nFROM Customer\nINNER JOIN Orders ON Customer.CustID = Orders.CustID\nWHERE Orders.Total > 50;\n\n-- equivalent WHERE-join:\n-- FROM Customer, Orders\n-- WHERE Customer.CustID = Orders.CustID AND Orders.Total > 50;"
      }
    },
    {
      "h": "The data-changing trio + table definition"
    },
    {
      "code": {
        "lang": "sql",
        "src": "INSERT INTO Manga (Title, Price) VALUES ('Berserk Vol 42', 9.99);\n\nUPDATE Manga SET Price = 8.49 WHERE Title = 'Berserk Vol 42';\n\nDELETE FROM Manga WHERE Title = 'Berserk Vol 42';\n\nCREATE TABLE Manga (\n    MangaID   INTEGER PRIMARY KEY,\n    Title     VARCHAR(80),\n    Price     DECIMAL(5,2),\n    PubID     INTEGER,\n    FOREIGN KEY (PubID) REFERENCES Publisher(PubID)\n);"
      }
    },
    {
      "callout": {
        "t": "warn",
        "body": "An UPDATE or DELETE with **no WHERE clause hits every row**. In an exam it's a lost mark; in production it's a career event. Write the WHERE first."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "body": "Forgetting the join condition doesn't error — it produces a cartesian product (every row paired with every row) and silently wrong answers. Two tables in FROM ⇒ a linking condition, no exceptions."
      }
    },
    {
      "callout": {
        "t": "mnemonic",
        "body": "**SFWO** — \"**S**ome **F**ields **W**ant **O**rdering\": SELECT, FROM, WHERE, ORDER BY. Clause order is fixed and itself mark-bearing."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "SQL Key Rules",
        "body": "SELECT fields FROM table WHERE condition ORDER BY field ASC/DESC. Strings in WHERE need 'single quotes'. JOIN requires an ON condition linking keys. UPDATE/DELETE without WHERE affects EVERY row. INNER JOIN … ON PK = FK syntax. * selects all fields."
      }
    }
  ],
  "flashcards": [
    [
      "The four retrieval clauses, in order?",
      "SELECT (fields), FROM (tables), WHERE (row filter), ORDER BY (sorting)."
    ],
    [
      "How are text values written in conditions?",
      "In quotes: WHERE Name = 'Crimson'. Unquoted strings are a classic lost mark."
    ],
    [
      "What happens with two tables and no join condition?",
      "A cartesian product — every row of one paired with every row of the other."
    ],
    [
      "UPDATE without WHERE does what?",
      "Updates EVERY row in the table."
    ],
    [
      "How is a foreign key declared in CREATE TABLE?",
      "FOREIGN KEY (field) REFERENCES OtherTable(field)."
    ],
    ["Which keyword sorts results, and what is the default direction?", "ORDER BY; ascending (ASC) is the default, DESC for descending."],
    ["What does SELECT * return?", "All columns (fields) of the matching rows."],
    ["Write SQL to add a row to Manga(Title, Price).", "INSERT INTO Manga (Title, Price) VALUES ('...', 9.99);"]
  ],
  "quiz": [
    {
      "q": "Return surnames of students older than 17, alphabetically:",
      "opts": [
        "SELECT Surname FROM Student WHERE Age > 17 ORDER BY Surname;",
        "SELECT * WHERE Age > 17;",
        "FROM Student SELECT Surname ORDER Age;",
        "SELECT Surname ORDER BY Surname WHERE Age > 17 FROM Student;"
      ],
      "ans": 0,
      "why": "SFWO order with the right field, table, condition and sort."
    },
    {
      "q": "Which condition matches the surname Smith?",
      "opts": [
        "WHERE Surname = Smith",
        "WHERE Surname = 'Smith'",
        "WHERE 'Surname' = Smith",
        "WHERE Surname == \"Smith\""
      ],
      "ans": 1,
      "why": "String literals take single quotes; the field name takes none."
    },
    {
      "q": "INNER JOIN … ON exists to…",
      "opts": [
        "sort the output",
        "match rows across tables via key fields",
        "delete duplicates",
        "create indexes"
      ],
      "ans": 1,
      "why": "Joins pair rows where primary key = foreign key."
    },
    {
      "q": "DELETE FROM Orders; (no WHERE) will…",
      "opts": [
        "error",
        "delete one row",
        "delete every row in Orders",
        "drop the table"
      ],
      "ans": 2,
      "why": "No filter = all rows. (DROP TABLE removes the table itself — different statement.)"
    },
    {
      "q": "Two tables listed in FROM with no linking condition produce…",
      "opts": ["a syntax error", "a cartesian product of every row pair", "only matching rows", "an empty result"],
      "ans": 1,
      "why": "Without a join/WHERE condition every row of one table pairs with every row of the other."
    }
  ],
  "exam": [
    {
      "q": "Tables: Book(BookID, Title, AuthorID), Author(AuthorID, Name). Write SQL to list the titles of all books by the author named 'Yukimura', in alphabetical order of title.",
      "marks": 4,
      "ms": [
        "SELECT Book.Title (1)",
        "FROM Book INNER JOIN Author ON Book.AuthorID = Author.AuthorID — or WHERE-join equivalent (1)",
        "WHERE Author.Name = 'Yukimura' — quoted string (1)",
        "ORDER BY Book.Title (ASC) (1)"
      ]
    },
    {
      "q": "Write an SQL statement to increase the Price of the book titled 'Berserk Vol 42' to 11.99.",
      "marks": 3,
      "ms": ["UPDATE Manga (1)", "SET Price = 11.99 (1)", "WHERE Title = 'Berserk Vol 42' — quoted string and present WHERE (1)"]
    },
    {
      "q": "Explain, with reference to SQL clause order and the WHERE clause, how to safely retrieve and how to safely update specific rows, and why omitting WHERE on an UPDATE/DELETE is dangerous.",
      "marks": 6,
      "ms": ["Retrieval clause order: SELECT fields, FROM table, WHERE condition, ORDER BY field (1-2)", "WHERE filters to the intended rows; string literals need single quotes (1)", "UPDATE table SET field = value WHERE condition targets only matching rows (1)", "An UPDATE/DELETE with no WHERE applies to EVERY row in the table (1)", "This silently corrupts/erases all data — write the WHERE first (1)"]
    }
  ]
};

C["compsci:4.9.4.2"] = {
  "notes": [
    {
      "h": "Application-layer protocols: the table to own"
    },
    {
      "table": {
        "head": [
          "Protocol",
          "Port(s)",
          "One-line job"
        ],
        "rows": [
          [
            "FTP",
            "20 (data), 21 (control)",
            "Transfer files between hosts; anonymous mode allows public access without an account"
          ],
          [
            "SSH",
            "22",
            "Encrypted remote login / command execution — also tunnels other protocols securely"
          ],
          [
            "SMTP",
            "25",
            "SENDS email between mail servers (and client → server)"
          ],
          [
            "HTTP",
            "80",
            "Requests and delivers web resources"
          ],
          [
            "POP3",
            "110",
            "RETRIEVES email from server to client (typically downloading and removing it)"
          ],
          [
            "HTTPS",
            "443",
            "HTTP encrypted via TLS — confidentiality + integrity for web traffic"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "mnemonic",
        "body": "Port ladder, low to high: **F**ile **S**ervers **S**end **H**undreds **P**ost **H**aste → FTP 20/21, SSH 22, SMTP 25, HTTP 80, POP3 110, HTTPS 443."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "body": "SMTP vs POP3 is a direction question: SMTP **pushes mail toward** its destination server; POP3 **pulls it down** to the client. \"SMTP receives email\" is the classic wrong answer."
      }
    },
    {
      "kv": [
        [
          "Port number",
          "A 16-bit number identifying which process/service on a host network traffic is intended for."
        ],
        [
          "Socket",
          "An endpoint of communication: IP address + port number combined (e.g. 192.168.1.10:443)."
        ]
      ]
    },
    {
      "callout": {
        "t": "tip",
        "body": "Describing HTTPS: say it encrypts requests and responses (via TLS), protecting the data from interception and tampering — \"HTTP but safe\" is not creditworthy. SSH earns its mark with \"encrypted\" + \"remote login/management\" together."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Port Numbers — The Six to Know",
        "body": "FTP 20 (data) / 21 (control). SSH 22. SMTP 25. HTTP 80. POP3 110. HTTPS 443. SMTP SENDS mail to server; POP3 PULLS mail to client. Socket = IP address + port number."
      }
    }
  ],
  "flashcards": [
    [
      "Ports for FTP, SSH, SMTP?",
      "FTP 20/21, SSH 22, SMTP 25."
    ],
    [
      "Ports for HTTP, POP3, HTTPS?",
      "HTTP 80, POP3 110, HTTPS 443."
    ],
    [
      "SMTP vs POP3 in one line each?",
      "SMTP sends/relays mail toward its destination server; POP3 retrieves mail from server to client."
    ],
    [
      "What is a socket?",
      "An IP address combined with a port number — one endpoint of a network conversation."
    ],
    [
      "What does SSH provide?",
      "An encrypted channel for remote login and command execution (and secure tunnelling of other protocols)."
    ],
    ["What does HTTPS add over HTTP?", "TLS encryption of requests and responses — confidentiality and integrity, protecting against interception/tampering."],
    ["What does a port number identify?", "Which process/service on a host the network traffic is intended for (a 16-bit number)."],
    ["Why does FTP use two ports?", "Port 21 carries control commands and port 20 carries the actual file data."]
  ],
  "quiz": [
    {
      "q": "A mail client downloading messages from its server uses…",
      "opts": [
        "SMTP",
        "POP3",
        "FTP",
        "SSH"
      ],
      "ans": 1,
      "why": "Retrieval = POP3 (port 110); SMTP handles the sending leg."
    },
    {
      "q": "Port 443 carries…",
      "opts": [
        "HTTP",
        "HTTPS",
        "SSH",
        "FTP control"
      ],
      "ans": 1,
      "why": "443 = TLS-encrypted web traffic."
    },
    {
      "q": "An administrator securely runs commands on a remote server via…",
      "opts": [
        "HTTP",
        "POP3",
        "SSH",
        "SMTP"
      ],
      "ans": 2,
      "why": "SSH: encrypted remote login, port 22."
    },
    {
      "q": "The port number's role is to identify…",
      "opts": [
        "the network card",
        "the destination PROCESS/service on the host",
        "the router",
        "the MAC address"
      ],
      "ans": 1,
      "why": "IP finds the host; the port finds the service on it."
    },
    {
      "q": "Which two protocols (and ports) are used to retrieve and to send email respectively?",
      "opts": ["SMTP 25 retrieve, POP3 110 send", "POP3 110 retrieve, SMTP 25 send", "HTTP 80 retrieve, FTP 21 send", "SSH 22 retrieve, HTTPS 443 send"],
      "ans": 1,
      "why": "POP3 (110) pulls mail to the client; SMTP (25) sends/relays it toward the destination server."
    }
  ],
  "exam": [
    {
      "q": "Describe the roles of SMTP and POP3 in delivering an email from Alice to Bob, naming the port each uses.",
      "marks": 4,
      "ms": [
        "Alice's client sends via SMTP to her mail server (1)",
        "SMTP (port 25) relays the message between mail servers to Bob's server (1)",
        "Bob's client retrieves the message using POP3 (1)",
        "POP3 uses port 110 / typically downloads (and removes) mail to the client (1)"
      ]
    },
    {
      "q": "State the port numbers used by HTTP, HTTPS and SSH, and explain what HTTPS provides that HTTP does not.",
      "marks": 4,
      "ms": ["HTTP port 80 (1)", "HTTPS port 443; SSH port 22 (1)", "HTTPS encrypts requests and responses using TLS (1)", "giving confidentiality and integrity, protecting data from interception/tampering (1)"]
    },
    {
      "q": "Explain what a socket is and discuss why port numbers are necessary for a host that runs several network services at once.",
      "marks": 6,
      "ms": ["A socket is a communication endpoint = IP address + port number (e.g. 192.168.1.10:443) (1-2)", "The IP address identifies the host on the network (1)", "A single host may run many services (web, mail, SSH) simultaneously (1)", "The port number identifies WHICH process/service incoming traffic is for (1)", "Without ports the host could not direct packets to the correct application (1)"]
    }
  ]
};

})(window.KOS_CONTENT);