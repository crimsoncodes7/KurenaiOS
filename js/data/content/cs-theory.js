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
    ]
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
      "h": "Boolean algebra: the identities, then the method"
    },
    {
      "diagram": "logic-lab"
    },
    {
      "table": {
        "head": [
          "Law",
          "AND form",
          "OR form"
        ],
        "rows": [
          [
            "Identity",
            "X · 1 = X",
            "X + 0 = X"
          ],
          [
            "Null/annihilation",
            "X · 0 = 0",
            "X + 1 = 1"
          ],
          [
            "Idempotent",
            "X · X = X",
            "X + X = X"
          ],
          [
            "Complement",
            "X · X̄ = 0",
            "X + X̄ = 1"
          ],
          [
            "Commutative",
            "X·Y = Y·X",
            "X+Y = Y+X"
          ],
          [
            "Distributive",
            "X·(Y+Z) = X·Y + X·Z",
            "X+(Y·Z) = (X+Y)·(X+Z)"
          ],
          [
            "Absorption",
            "X·(X+Y) = X",
            "X + X·Y = X"
          ],
          [
            "De Morgan's",
            "¬(X·Y) = X̄ + Ȳ",
            "¬(X+Y) = X̄ · Ȳ"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "mnemonic",
        "body": "**De Morgan's = \"break the bar, change the sign\"**: split the negation over each term AND flip the operator between them. Apply it twice and you're back where you started — a free self-check."
      }
    },
    {
      "h": "Simplification — worked to mark-scheme standard"
    },
    {
      "steps": [
        {
          "h": "Simplify  A·B + A·B̄ + Ā·B",
          "m": "A·B + A·B̄ = A·(B + B̄)          [distributive]"
        },
        {
          "h": "Complement law",
          "m": "= A·1 = A                        [B + B̄ = 1]"
        },
        {
          "h": "Substitute back",
          "m": "A + Ā·B"
        },
        {
          "h": "Absorption variant",
          "m": "A + Ā·B = A + B                  [since A + Ā·B = (A+Ā)·(A+B) = A + B]",
          "n": "Quote the law at every line — unjustified jumps lose the method marks even when the destination is right."
        }
      ]
    },
    {
      "callout": {
        "t": "miscon",
        "body": "De Morgan's does NOT mean ¬(X·Y) = X̄·Ȳ. The operator must flip: AND becomes OR under the broken bar. Half-applying it is the most common simplification error in scripts."
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "Stuck mid-simplification? Hunt for: (1) a common factor to pull out, (2) any P + P̄ or P·P̄ pair, (3) an absorption shape X + X·Y. Those three patterns finish nearly every AQA expression."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Boolean Laws Cheat Sheet",
        "body": "De Morgan's: ¬(X·Y) = X̄+Ȳ; ¬(X+Y) = X̄·Ȳ (break bar, flip op). Absorption: X+X·Y = X; X·(X+Y) = X. Complement: X·X̄ = 0; X+X̄ = 1. Idempotent: X·X = X; X+X = X. Null: X·0 = 0; X+1 = 1. Identity: X·1 = X; X+0 = X. Quote the law name at every step."
      }
    }
  ],
  "flashcards": [
    [
      "State De Morgan's laws.",
      "¬(X·Y) = X̄ + Ȳ and ¬(X+Y) = X̄ · Ȳ — break the bar, change the sign."
    ],
    [
      "Absorption law (both forms)?",
      "X + X·Y = X and X·(X + Y) = X."
    ],
    [
      "X + X̄ and X·X̄ equal…?",
      "1 and 0 respectively — the complement laws."
    ],
    [
      "Simplify A·(Ā + B).",
      "A·Ā + A·B = 0 + A·B = A·B."
    ],
    [
      "Why quote the law used on each line?",
      "Method marks attach to justified steps; a correct answer with unexplained jumps can still drop marks."
    ]
  ],
  "quiz": [
    {
      "q": "¬(A + B) ≡",
      "opts": [
        "Ā + B̄",
        "Ā · B̄",
        "A · B",
        "¬A + B"
      ],
      "ans": 1,
      "why": "De Morgan's: bar breaks, OR flips to AND."
    },
    {
      "q": "X + X·Y simplifies to…",
      "opts": [
        "X·Y",
        "Y",
        "X",
        "X + Y"
      ],
      "ans": 2,
      "why": "Absorption — if X is true the whole thing is true; if X is false both terms die."
    },
    {
      "q": "A·B + A·B̄ = ?",
      "opts": [
        "A",
        "B",
        "A·B",
        "1"
      ],
      "ans": 0,
      "why": "Factor A·(B + B̄) = A·1 = A."
    },
    {
      "q": "Which is the distributive law's OR-over-AND form?",
      "opts": [
        "X+(Y·Z) = (X+Y)·(X+Z)",
        "X·(Y+Z) = X·Y + X·Z",
        "X+X = X",
        "X·1 = X"
      ],
      "ans": 0,
      "why": "Both distributive forms hold in Boolean algebra — this one has no ordinary-algebra analogue, so it's the one examiners test."
    }
  ],
  "exam": [
    {
      "q": "Simplify ¬(A · ¬B) · B as far as possible, quoting the identity used at each step.",
      "marks": 4,
      "ms": [
        "De Morgan's: ¬(A·¬B) = Ā + B (1)",
        "Expression becomes (Ā + B)·B (1)",
        "Distribute: Ā·B + B·B = Ā·B + B (1)",
        "Absorption: B + B·Ā = B (1)"
      ]
    }
  ],
  "sims": [
    "logic-lab"
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
    ]
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
    ]
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
    ]
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
    }
  ]
};

C["compsci:4.10.4"] = {
  "notes": [
    {
      "h": "SQL: the clauses, in marking order"
    },
    "AQA marks SQL **clause by clause** — a right skeleton with one wrong condition still scores most of the marks. Build in this order, every time:",
    {
      "code": {
        "lang": "sql",
        "cap": "The retrieval skeleton.",
        "src": "SELECT Title, Price              -- which fields\nFROM Manga                       -- which table(s)\nWHERE Price < 10                 -- which rows  (strings need 'quotes')\nORDER BY Price DESC;             -- presentation (ASC default)"
      }
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
    ]
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
    ]
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
    }
  ]
};

})(window.KOS_CONTENT);