/* Kurenai OS — deep content: AQA 7517 §4.4 Theory of Computation (Part 2) */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.4.2.4"] = {
  "notes": [
    {
      "h": "Regular Languages"
    },
    {
      "callout": {
        "t": "info",
        "body": "A regular language is the class of language that both regular expressions and finite state machines can handle — they are the simplest languages in the computational hierarchy."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Regular language",
        "body": "A language is called regular if it can be represented by a regular expression. Equivalently, a regular language is any language that a finite state machine (FSM) will accept."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Two equivalent definitions",
        "body": [
          {
            "kv": [
              [
                "By regex",
                "If you can write a regular expression that exactly describes the set of valid strings, the language is regular."
              ],
              [
                "By FSM",
                "If you can build an FSM that accepts exactly the valid strings (and rejects the rest), the language is regular."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Limits of regular languages",
        "body": "Some languages are NOT regular. For example {0ⁿ1ⁿ | n ≥ 1} (equal numbers of 0s then 1s) cannot be recognised by any FSM, because an FSM has only finite memory and cannot count an unbounded n. Such languages need a more powerful machine (e.g. a pushdown automaton)."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Regular language essentials",
        "body": "A language is **regular** if a **regular expression** can describe it, equivalently if an **FSM** can accept it. Regex ↔ FSM equivalence defines the class. Languages that require counting (like 0ⁿ1ⁿ) are NOT regular."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconception",
        "body": "**All languages are regular** — No; only those describable by a regex / acceptable by an FSM. Languages needing unbounded memory to count, such as matched-pair patterns, lie outside the regular class."
      }
    }
  ],
  "flashcards": [
    [
      "When is a language called regular?",
      "When it can be represented by a regular expression (equivalently, accepted by an FSM)."
    ],
    [
      "Give the FSM-based definition of a regular language.",
      "Any language that a finite state machine will accept."
    ],
    [
      "Are regular expressions and FSMs equivalent for defining regular languages?",
      "Yes — both define exactly the class of regular languages."
    ],
    [
      "Give an example of a language that is NOT regular.",
      "{0ⁿ1ⁿ | n ≥ 1} — equal numbers of 0s then 1s; an FSM cannot count n."
    ],
    [
      "Why can't an FSM recognise 0ⁿ1ⁿ?",
      "It has only finite memory (states) and cannot count an unbounded number of 0s to match against the 1s."
    ],
    [
      "What kind of machine is needed for languages beyond regular?",
      "A more powerful machine such as a pushdown automaton (an FSM plus a stack)."
    ],
    [
      "If you can write a regex for a language, what does that tell you?",
      "That the language is regular."
    ],
    [
      "What is the simplest class of language in the hierarchy?",
      "Regular languages (handled by regex and FSMs)."
    ]
  ],
  "quiz": [
    {
      "q": "A language is regular if...?",
      "opts": [
        "it needs a Turing machine",
        "it can be represented by a regular expression / accepted by an FSM",
        "it contains only one string",
        "it is infinite"
      ],
      "ans": 1,
      "why": "Regular = describable by regex, equivalently acceptable by an FSM."
    },
    {
      "q": "Which language is NOT regular?",
      "opts": [
        "a*",
        "(a|b)+",
        "{0ⁿ1ⁿ | n ≥ 1}",
        "ab"
      ],
      "ans": 2,
      "why": "Matching equal counts requires counting, which an FSM cannot do."
    },
    {
      "q": "Regular expressions and FSMs, with respect to regular languages, are...?",
      "opts": [
        "different in power",
        "equivalent",
        "regex weaker",
        "FSM weaker"
      ],
      "ans": 1,
      "why": "They define exactly the same class of languages."
    },
    {
      "q": "An FSM cannot recognise 0ⁿ1ⁿ because it...?",
      "opts": [
        "is too fast",
        "has only finite memory and cannot count n",
        "has no start state",
        "uses a stack"
      ],
      "ans": 1,
      "why": "Unbounded counting exceeds finite-state memory."
    },
    {
      "q": "Being able to write an FSM that accepts exactly a language's strings shows the language is...?",
      "opts": [
        "context-free only",
        "regular",
        "non-computable",
        "intractable"
      ],
      "ans": 1,
      "why": "FSM-acceptable languages are exactly the regular languages."
    }
  ],
  "exam": [
    {
      "q": "Define a regular language.",
      "marks": 1,
      "ms": [
        "A language that can be represented by a regular expression (equivalently, accepted by a finite state machine). (1)"
      ]
    },
    {
      "q": "Explain why {0ⁿ1ⁿ | n ≥ 1} is not a regular language.",
      "marks": 2,
      "ms": [
        "Recognising it requires counting the 0s and matching the count of 1s. (1)",
        "An FSM has only finite memory (states) and cannot count an unbounded n, so no FSM accepts it. (1)"
      ]
    },
    {
      "q": "Discuss what it means for a language to be regular and how regular expressions and finite state machines relate to this idea, with examples of regular and non-regular languages.",
      "marks": 6,
      "ms": [
        "A language is regular if a regular expression can describe it. (1)",
        "Equivalently, if an FSM can accept exactly its strings. (1)",
        "Regular expressions and FSMs are equivalent in power. (1)",
        "Example regular language: a(a|b)* (describable by regex and an FSM). (1)",
        "Example non-regular language: 0ⁿ1ⁿ, which needs unbounded counting. (1)",
        "Such languages require a more powerful model (e.g. a pushdown automaton), placing them outside the regular class. (1)"
      ]
    }
  ]
};

C["compsci:4.4.2.2"] = {
  "notes": [
    {
      "h": "Maths for Regular Expressions: Sets"
    },
    {
      "callout": {
        "t": "info",
        "body": "Regular expressions describe sets of strings, so the underlying maths is set theory. A set is an unordered collection of values in which each value occurs at most once."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Specifying a set",
        "body": [
          {
            "kv": [
              [
                "List (roster)",
                "A = {1, 2, 3, 4, 5} — list the elements explicitly."
              ],
              [
                "Set comprehension",
                "A = {x | x ∈ ℕ ∧ x ≥ 1} — 'the set of x such that x is a natural number and x ≥ 1'. Here | means 'such that' and ∧ means AND."
              ],
              [
                "Empty set",
                "{} (also written Ø) is the set with no elements."
              ],
              [
                "Compact form",
                "{0ⁿ1ⁿ | n ≥ 1} is all strings of n zeros followed by n ones: {01, 0011, 000111, ...}."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Types and sizes of sets"
    },
    {
      "callout": {
        "t": "def",
        "h": "Finite, infinite, countable",
        "body": [
          {
            "kv": [
              [
                "Finite set",
                "Its elements can be counted off by the natural numbers up to a final number (e.g. a 20-element set)."
              ],
              [
                "Infinite set",
                "Has no final element, e.g. ℕ (naturals) or ℝ (reals)."
              ],
              [
                "Countably infinite",
                "An infinite set that can still be counted off by the natural numbers (e.g. ℕ). ℝ is NOT countable."
              ],
              [
                "Countable set",
                "A set with the same cardinality as some subset of the natural numbers."
              ],
              [
                "Cardinality",
                "The number of elements in a finite set."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Cartesian product",
        "body": "The Cartesian product X × Y ('X cross Y') is the set of all ordered pairs (a, b) where a ∈ X and b ∈ Y. For example {1,2} × {3,4} = {(1,3),(1,4),(2,3),(2,4)}."
      }
    },
    {
      "page": "Subsets and set operations"
    },
    {
      "callout": {
        "t": "def",
        "h": "Subset and proper subset",
        "body": [
          {
            "kv": [
              [
                "Subset ⊆",
                "{0,1,2} ⊆ {0,1,2,3}: every element of the first is in the second; ⊆ also allows equality, so {0,1,2,3} ⊆ {0,1,2,3} is true."
              ],
              [
                "Proper subset ⊂",
                "{0,1,2} ⊂ ℕ: every element is in ℕ AND ℕ has at least one element not in {0,1,2} (so they are not equal)."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Set operations",
        "body": [
          {
            "kv": [
              [
                "Membership ∈",
                "x ∈ A means x is an element of A."
              ],
              [
                "Union ∪",
                "A ∪ B = everything in A or B (or both)."
              ],
              [
                "Intersection ∩",
                "A ∩ B = everything in both A and B."
              ],
              [
                "Difference \\",
                "A \\ B = {x | x ∈ A and x ∉ B} — elements of A that are not in B."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Set essentials",
        "body": "A **set** is unordered with no duplicates. Specify by list or comprehension {x | condition}. **⊆** subset (allows equality), **⊂** proper subset (strict). Operations: **∈** membership, **∪** union, **∩** intersection, **\\** difference. **ℕ** is countably infinite; **ℝ** is uncountable. Cartesian product gives ordered pairs."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconceptions",
        "body": "**A set can contain duplicates / is ordered** — No; sets are unordered and each value appears at most once. **All infinite sets are the same size** — No; ℕ is countably infinite but ℝ is uncountable (strictly larger)."
      }
    }
  ],
  "flashcards": [
    [
      "What is a set?",
      "An unordered collection of values in which each value occurs at most once."
    ],
    [
      "What does the set comprehension {x | x ∈ ℕ ∧ x ≥ 1} mean?",
      "The set of all x such that x is a natural number and x ≥ 1."
    ],
    [
      "What is the empty set and its alternative symbol?",
      "The set with no elements, written {} or Ø."
    ],
    [
      "What is the cardinality of a finite set?",
      "The number of elements it contains."
    ],
    [
      "What is a countably infinite set?",
      "An infinite set that can be counted off by the natural numbers (e.g. ℕ); ℝ is not countable."
    ],
    [
      "What is the Cartesian product X × Y?",
      "The set of all ordered pairs (a, b) with a ∈ X and b ∈ Y."
    ],
    [
      "What is the difference between ⊆ and ⊂?",
      "⊆ (subset) allows the sets to be equal; ⊂ (proper subset) requires the larger set to have at least one extra element."
    ],
    [
      "Define the set difference A \\ B.",
      "{x | x ∈ A and x ∉ B} — the elements of A that are not in B."
    ]
  ],
  "quiz": [
    {
      "q": "Which is TRUE of a set?",
      "opts": [
        "It is ordered",
        "It may contain duplicates",
        "It is unordered with no duplicates",
        "It must be finite"
      ],
      "ans": 2,
      "why": "Sets are unordered collections with each value at most once."
    },
    {
      "q": "{0,1,2} ⊂ ℕ means...?",
      "opts": [
        "they are equal",
        "{0,1,2} is a proper subset of ℕ",
        "ℕ is a subset of {0,1,2}",
        "they are disjoint"
      ],
      "ans": 1,
      "why": "⊂ means proper subset: ℕ contains all of {0,1,2} plus more."
    },
    {
      "q": "A ∩ B is...?",
      "opts": [
        "everything in A or B",
        "elements in both A and B",
        "elements of A not in B",
        "ordered pairs"
      ],
      "ans": 1,
      "why": "Intersection keeps elements common to both sets."
    },
    {
      "q": "Which set is uncountable?",
      "opts": [
        "ℕ (naturals)",
        "ℝ (reals)",
        "{0ⁿ1ⁿ | n ≥ 1}",
        "a finite set"
      ],
      "ans": 1,
      "why": "The reals cannot be counted off by the naturals."
    },
    {
      "q": "{1,2} × {3} equals...?",
      "opts": [
        "{1,2,3}",
        "{(1,3),(2,3)}",
        "{3,3}",
        "{}"
      ],
      "ans": 1,
      "why": "The Cartesian product gives ordered pairs (a,b) with a in the first set, b in the second."
    }
  ],
  "exam": [
    {
      "q": "State what is meant by the cardinality of a set, and give the cardinality of {2, 4, 6, 8}.",
      "marks": 2,
      "ms": [
        "Cardinality is the number of elements in a (finite) set. (1)",
        "The cardinality of {2,4,6,8} is 4. (1)"
      ]
    },
    {
      "q": "Explain the difference between a subset (⊆) and a proper subset (⊂).",
      "marks": 2,
      "ms": [
        "A ⊆ B means every element of A is in B, and A may equal B. (1)",
        "A ⊂ B means every element of A is in B AND B has at least one element not in A (they are not equal). (1)"
      ]
    },
    {
      "q": "Describe the set notations and operations a student needs in order to understand regular expressions, giving an example of each operation.",
      "marks": 6,
      "ms": [
        "A set can be given by listing, e.g. {1,2,3}, or by comprehension {x | condition}. (1)",
        "Membership: x ∈ A means x is in A. (1)",
        "Union A ∪ B contains elements in either set, e.g. {1,2} ∪ {2,3} = {1,2,3}. (1)",
        "Intersection A ∩ B contains common elements, e.g. {1,2} ∩ {2,3} = {2}. (1)",
        "Difference A \\ B = elements of A not in B, e.g. {1,2} \\ {2,3} = {1}. (1)",
        "Subset/proper subset and the Cartesian product (ordered pairs) describe relationships between sets, e.g. {1} ⊂ {1,2}. (1)"
      ]
    }
  ]
};

C["compsci:4.4.2.3"] = {
  "notes": [
    {
      "h": "Regular Expressions"
    },
    {
      "callout": {
        "t": "info",
        "body": "A regular expression (regex) is a shorthand notation for describing a set of strings (a language). It lets particular types of language be described compactly, and is equivalent in power to a finite state machine."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Metacharacters",
        "body": [
          {
            "kv": [
              [
                "*",
                "0 or more repetitions of the preceding item."
              ],
              [
                "+",
                "1 or more repetitions."
              ],
              [
                "?",
                "0 or 1 repetition (optional)."
              ],
              [
                "|",
                "Alternation — 'or' (a|b matches a or b)."
              ],
              [
                "( )",
                "Grouping of sub-expressions."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Worked examples",
        "body": [
          {
            "kv": [
              [
                "a(a|b)*",
                "Strings starting with a, then any sequence of a's and b's: {a, aa, ab, aaa, aab, aba, ...}."
              ],
              [
                "ab+",
                "An a followed by one or more b's: {ab, abb, abbb, ...}."
              ],
              [
                "colou?r",
                "Matches both 'color' and 'colour' (the u is optional)."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Regex and FSMs",
        "body": "Regular expressions and finite state machines are equivalent: any language described by a regex can be recognised by an FSM, and any FSM's language can be written as a regex. You may be asked to convert a simple FSM to a regex or vice versa."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Regular expression essentials",
        "body": "A regex describes a **set of strings**. Metacharacters: **\\*** (0+), **+** (1+), **?** (0 or 1), **|** (or), **( )** (group). Regex and FSMs are **equivalent** ways to define a regular language — each can be converted to the other."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconceptions",
        "body": "**\\* means 'exactly one'** — No; * means zero or more. **+ allows zero matches** — No; + needs at least one. **Regex is more powerful than an FSM** — No; they describe exactly the same class (regular languages)."
      }
    }
  ],
  "flashcards": [
    [
      "What is a regular expression?",
      "A shorthand notation describing a set of strings (a language)."
    ],
    [
      "What does * mean in a regular expression?",
      "Zero or more repetitions of the preceding item."
    ],
    [
      "What does + mean?",
      "One or more repetitions."
    ],
    [
      "What does ? mean?",
      "Zero or one repetition (the item is optional)."
    ],
    [
      "What does | mean?",
      "Alternation — 'or' (matches either side)."
    ],
    [
      "What set does a(a|b)* describe?",
      "Strings starting with a followed by any sequence of a's and b's: {a, aa, ab, aaa, ...}."
    ],
    [
      "What is the relationship between regular expressions and FSMs?",
      "They are equivalent — each can be converted to the other and they define the same regular languages."
    ],
    [
      "Write a regex matching one or more b's preceded by an a.",
      "ab+"
    ]
  ],
  "quiz": [
    {
      "q": "The regex a* matches...?",
      "opts": [
        "exactly one a",
        "one or more a's",
        "zero or more a's",
        "no a's only"
      ],
      "ans": 2,
      "why": "* means zero or more repetitions."
    },
    {
      "q": "Which metacharacter means 'optional'?",
      "opts": [
        "*",
        "+",
        "?",
        "|"
      ],
      "ans": 2,
      "why": "? means zero or one occurrence."
    },
    {
      "q": "The regex (a|b)+ matches...?",
      "opts": [
        "only 'ab'",
        "one or more characters, each a or b",
        "zero a's and b's",
        "the literal text (a|b)"
      ],
      "ans": 1,
      "why": "| chooses a or b; + requires at least one."
    },
    {
      "q": "Regular expressions and FSMs are...?",
      "opts": [
        "unrelated",
        "equivalent in power",
        "regex is stronger",
        "FSM is stronger"
      ],
      "ans": 1,
      "why": "They describe exactly the same class of languages (regular)."
    },
    {
      "q": "Which string does NOT match ab+?",
      "opts": [
        "ab",
        "abb",
        "a",
        "abbb"
      ],
      "ans": 2,
      "why": "+ needs at least one b, so 'a' alone fails."
    }
  ],
  "exam": [
    {
      "q": "State what the metacharacters * and + mean in a regular expression.",
      "marks": 2,
      "ms": [
        "* means zero or more repetitions of the preceding item. (1)",
        "+ means one or more repetitions. (1)"
      ]
    },
    {
      "q": "Write a regular expression for all strings of one or more digits, given that d represents a single digit, and give one matching string.",
      "marks": 2,
      "ms": [
        "d+ (one or more digits). (1)",
        "A matching string, e.g. '507'. (1)"
      ]
    },
    {
      "q": "Explain what a regular expression is and discuss its relationship with finite state machines, using an example.",
      "marks": 6,
      "ms": [
        "A regular expression is a shorthand notation describing a set of strings (a language). (1)",
        "It uses metacharacters such as * (0+), + (1+), ? (optional), | (or) and ( ) (grouping). (1)",
        "Example: a(a|b)* describes strings starting with a followed by any a's and b's. (1)",
        "Regular expressions and FSMs are equivalent in power. (1)",
        "Any regex can be turned into an FSM that accepts the same language, and vice versa. (1)",
        "Both define exactly the class of regular languages. (1)"
      ]
    }
  ]
};

C["compsci:4.4.5.1"] = {
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
    ["What is a heuristic approach?", "A technique used to find an approximate, 'good enough' solution to an intractable problem in a reasonable amount of time."],
    ["What three actions can a Turing machine's head perform?", "Read the current cell, write (overwrite) a symbol, and move left or right."],
    ["What makes a Turing machine more powerful than an FSA or PDA?", "Its unbounded read/write tape — it can store and revisit unlimited information, not just a fixed state or a single stack."],
    ["What form does a Turing machine's transition rule take?", "(current state, read symbol) → (new state, write symbol, move direction)."],
    ["Must a Turing machine always halt?", "No — it may loop forever; whether a given TM halts on given input is the (undecidable) Halting Problem."]
  ],
  quiz: [
    { q: "A Turing machine tape is...", opts: ["Finite", "Infinite", "Read-only", "Circular"], ans: 1, why: "The tape in a Turing machine is theoretically infinite in both directions to provide unbounded memory." },
    { q: "The concept that a single machine can execute any program is formalized by...", opts: ["The Halting Problem", "Tractability", "Universal Turing Machine", "Mealy Machine"], ans: 2, why: "A UTM reads the description of a specific machine from its tape and simulates it." },
    { q: "If an algorithm has a time complexity of $O(2^n)$, the problem it solves is generally considered:", opts: ["Tractable", "Intractable", "Unsolvable", "Heuristic"], ans: 1, why: "Exponential time complexities are intractable because the time required grows too fast to be practical for large inputs." },
    { q: "Why is the Halting problem significant?", opts: ["It proves that some problems cannot be solved by any computer", "It shows how to stop infinite loops", "It proves all programs halt eventually", "It makes programs run faster"], ans: 0, why: "It provides a mathematically proven example of a non-computable problem." },
    { q: "What gives a Turing machine more power than a pushdown automaton?", opts: ["More states", "An unbounded read/write tape instead of a single stack", "Faster transitions", "Multiple start states"], ans: 1, why: "The rewritable, randomly-repositionable tape provides unbounded general-purpose memory." }
  ],
  exam: [
    { q: "Describe the structure of a Turing Machine and explain why a Universal Turing Machine is considered a model for modern stored-program computers.", marks: 4,
      ms: ["Structure: Contains a finite state machine, an infinite tape, and a read/write head (1)", "Tape is divided into cells containing symbols from a defined alphabet (1)", "A UTM can simulate any other TM by reading its description (program) from the tape (1)", "This models the stored-program concept where both instructions (the machine description) and data are stored in the same memory space (1)"] },
    { q: "Explain what happens in a single step of a Turing machine, referring to a transition rule.", marks: 3, ms: ["The head reads the symbol in the current cell (1)", "The (state, symbol) pair is looked up to find the rule (1)", "The machine writes a symbol, moves the head left/right, and changes state — all in one step (1)"] },
    { q: "Discuss the significance of the Turing machine as a model of computation, referring to its capabilities and its limits.", marks: 6, ms: ["A TM is a formal model: finite state machine + infinite read/write tape + head (1)", "Its rewritable unbounded tape lets it compute anything that is computable (the Turing-complete idea) (1-2)", "A Universal TM can simulate any TM, underpinning the stored-program computer (1-2)", "Limit: some problems are non-computable — e.g. no TM can solve the Halting Problem for all inputs (1)"] }
  ]
};

C["compsci:4.4.4.2"] = {
  "notes": [
    {
      "h": "Maths for Big-O Notation"
    },
    {
      "callout": {
        "t": "info",
        "body": "Big-O describes how an algorithm's running time grows as a mathematical function of the problem size. To read and compare these, you need the idea of a function and the common growth shapes."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Function as a mapping",
        "body": "A function maps each value from one set (the domain) to a value in another set (the co-domain), for example ℕ → ℕ. For an algorithm, the function maps the input size n to the number of operations performed."
      }
    },
    {
      "h": "Common function shapes"
    },
    {
      "table": {
        "head": [
          "Type",
          "Example",
          "Growth as n rises"
        ],
        "rows": [
          [
            "Logarithmic",
            "y = log x",
            "Grows very slowly"
          ],
          [
            "Linear",
            "y = 2x",
            "Grows in proportion to x"
          ],
          [
            "Polynomial",
            "y = 2x²",
            "Grows with a fixed power of x"
          ],
          [
            "Exponential",
            "y = 2ˣ",
            "Grows extremely fast"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Permutations and factorial",
        "body": "A permutation is an arrangement of objects in order. The number of permutations of n distinct objects is n factorial: n! = n × (n−1) × ... × 2 × 1 (the product of all positive integers up to n). For example 4! = 24. Factorial growth appears in brute-force problems like the Travelling Salesman Problem."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Growth ranking",
        "body": "From slowest- to fastest-growing: **logarithmic < linear < polynomial < exponential < factorial**. A function maps domain → co-domain; for algorithms, input size → operation count. **n!** = product of all integers up to n and grows faster than any exponential."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconceptions",
        "body": "**A polynomial and an exponential are similar** — No; 2x² (polynomial, x is the base) grows far slower than 2ˣ (exponential, x is the exponent). **n! is the same as 2ⁿ** — No; factorial grows even faster than exponential."
      }
    }
  ],
  "flashcards": [
    [
      "What is a function, mathematically?",
      "A mapping from each value in a domain to a value in a co-domain, e.g. ℕ → ℕ."
    ],
    [
      "Give an example of a linear function.",
      "y = 2x."
    ],
    [
      "Give an example of a polynomial function.",
      "y = 2x²."
    ],
    [
      "Give an example of an exponential function.",
      "y = 2ˣ."
    ],
    [
      "Give an example of a logarithmic function.",
      "y = log x."
    ],
    [
      "What does n! (n factorial) mean?",
      "The product of all positive integers up to n, e.g. 4! = 4×3×2×1 = 24."
    ],
    [
      "How many permutations of n distinct objects are there?",
      "n! (n factorial)."
    ],
    [
      "Order log x, 2ˣ, 2x and 2x² by growth rate (slowest first).",
      "log x < 2x < 2x² < 2ˣ."
    ]
  ],
  "quiz": [
    {
      "q": "Which function grows fastest as x increases?",
      "opts": [
        "log x",
        "2x",
        "2x²",
        "2ˣ"
      ],
      "ans": 3,
      "why": "Exponential growth (variable in the exponent) outpaces logarithmic, linear and polynomial."
    },
    {
      "q": "y = 2x is a...?",
      "opts": [
        "logarithmic function",
        "linear function",
        "polynomial of degree 2",
        "exponential function"
      ],
      "ans": 1,
      "why": "A constant times x is linear."
    },
    {
      "q": "How many permutations of 4 distinct objects are there?",
      "opts": [
        "16",
        "24",
        "12",
        "8"
      ],
      "ans": 1,
      "why": "4! = 4×3×2×1 = 24."
    },
    {
      "q": "A function maps values from the domain to the...?",
      "opts": [
        "range only",
        "co-domain",
        "exponent",
        "stack"
      ],
      "ans": 1,
      "why": "A function maps each domain value to a co-domain value."
    },
    {
      "q": "Which grows slowest as n increases?",
      "opts": [
        "linear",
        "logarithmic",
        "polynomial",
        "exponential"
      ],
      "ans": 1,
      "why": "Logarithmic growth is the slowest of these."
    }
  ],
  "exam": [
    {
      "q": "State the number of permutations of n distinct objects and give the value for n = 5.",
      "marks": 2,
      "ms": [
        "n! (n factorial). (1)",
        "5! = 120. (1)"
      ]
    },
    {
      "q": "Identify the type of each function: (a) y = log x (b) y = 2ˣ.",
      "marks": 2,
      "ms": [
        "(a) Logarithmic. (1)",
        "(b) Exponential. (1)"
      ]
    },
    {
      "q": "Explain the mathematical ideas needed to understand Big-O notation, referring to functions and the common growth shapes.",
      "marks": 6,
      "ms": [
        "A function maps each input value (domain) to an output (co-domain); for algorithms it maps input size n to the number of operations. (1)",
        "Logarithmic functions (y = log x) grow very slowly. (1)",
        "Linear functions (y = 2x) grow in proportion to n. (1)",
        "Polynomial functions (y = 2x²) grow with a fixed power of n. (1)",
        "Exponential functions (y = 2ˣ) grow extremely fast. (1)",
        "Factorial growth (n! permutations) grows faster still and appears in brute-force problems. (1)"
      ]
    }
  ]
};

C["compsci:4.4.4.7"] = {
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
    ["What is the difference between undecidable and intractable?", "Undecidable: no algorithm can ever exist. Intractable: an algorithm exists but is too slow to be practical."],
    ["Can we ever tell whether a specific program halts?", "Yes, often by inspection for individual programs — the result only forbids ONE algorithm that works for ALL programs."],
    ["Define a decidable problem.", "One for which an algorithm always gives the correct yes/no answer in finite time."],
    ["Why does the Halting decider H lead to a contradiction?", "A program that does the opposite of H's verdict on itself can neither halt nor loop consistently — so H cannot exist."]
  ],
  quiz: [
    { q: "Who proved the Halting problem is undecidable?", opts: ["Von Neumann", "Alan Turing", "Ada Lovelace", "Claude Shannon"], ans: 1, why: "Turing proved it in 1936 using self-referential paradox and Turing machine theory." },
    { q: "The Halting problem is best described as…", opts: ["intractable — solvable but too slow", "undecidable — no algorithm can solve it for all inputs", "NP-complete — verifiable in polynomial time", "decidable with the right hardware"], ans: 1, why: "Undecidable means no algorithm exists at all, not just that it's slow." },
    { q: "Turing's proof that H cannot exist relies on…", opts: ["measuring execution time", "a self-referential program that creates a logical paradox", "exhaustive testing of all programs", "quantum computing"], ans: 1, why: "Paradox(Paradox) creates a contradiction under either assumption about H's output." },
    { q: "Which statement about the Halting Problem is correct?", opts: ["We can never tell if any program halts", "No single algorithm can decide halting for all programs", "It is solvable with enough memory", "It only applies to infinite loops"], ans: 1, why: "Specific cases can be analysed; the impossibility is of a fully general decider." },
    { q: "A problem with no possible algorithm is called…", opts: ["intractable", "undecidable / non-computable", "NP-hard", "polynomial"], ans: 1, why: "Undecidable/non-computable means no algorithm can ever solve it." }
  ],
  exam: [
    { q: "Explain the significance of the Halting problem in computer science.", marks: 3, ms: ["It proves there are problems that cannot be solved by any computer, regardless of speed or memory (1)", "It establishes a theoretical limit to computation — some questions are undecidable (1)", "Proved by Turing in 1936 using proof by contradiction: any hypothetical decider H leads to a self-referential paradox (1)"] },
    { q: "Distinguish between an undecidable problem and an intractable problem.", marks: 2, ms: ["Undecidable: no algorithm can ever solve it (e.g. the Halting Problem) (1)", "Intractable: an algorithm exists but runs too slowly (exponential/factorial) for large inputs (1)"] },
    { q: "Outline Turing's proof that the Halting Problem is undecidable, and discuss what this tells us about the limits of computation.", marks: 6, ms: ["Assume a decider H(program, input) exists that always says whether it halts (1)", "Construct Paradox(x): if H says x(x) halts, Paradox loops; if H says it loops, Paradox halts (1-2)", "Run Paradox on itself — both outcomes contradict H, so H cannot exist (1-2)", "Conclusion: some well-defined problems are non-computable — no amount of hardware/time can solve them (1)"] }
  ]
};

C["compsci:4.4.4.3"] = {
  notes: [
    { h: "Classification of Algorithmic Complexity" },
    { callout: { t: "info", body: "Algorithms are classified by how their resource usage (time or space) grows as the input size ($n$) increases." } },
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
    ["What is the Big O complexity of a binary search?", "$O(\\log n)$"],
    ["What does Big O actually describe?", "How an algorithm's time or space requirement SCALES with input size n — its asymptotic growth, not absolute time."],
    ["Give the complexity of bubble sort.", "$O(n^2)$ — polynomial (tractable but slow for large n)."],
    ["Give the complexity of linear search.", "$O(n)$ — linear time."],
    ["What does $O(1)$ mean?", "Constant time — the work done does not depend on the input size n."],
    ["Order these growth rates slowest-to-fastest: O(n²), O(log n), O(2^n), O(n).", "O(log n) < O(n) < O(n²) < O(2^n)."],
    ["Which complexity classes are tractable?", "Polynomial or better — O(1), O(log n), O(n), O(n log n), O(n^k)."],
    ["Why can O(n²) beat O(n log n) for small n?", "Big O ignores constant factors; for small inputs lower constants can dominate, so the 'slower' class may run faster."],
    ["Does Big O depend on the hardware used?", "No — it describes scaling behaviour; the same O(n²) algorithm takes different absolute times on different machines."]
  ],
  quiz: [
    { q: "Which of these is considered a 'tractable' complexity?", opts: ["$O(2^n)$", "$O(n!)$", "$O(n^3)$", "$O(n^n)$"], ans: 2, why: "Polynomial time algorithms are generally considered tractable — they scale reasonably as $n$ grows." },
    { q: "Binary search runs in…", opts: ["$O(1)$", "$O(\\log n)$", "$O(n)$", "$O(n^2)$"], ans: 1, why: "Each comparison halves the search space — logarithmic growth." },
    { q: "Which is the fastest-growing (worst-scaling) complexity?", opts: ["$O(n)$", "$O(n^2)$", "$O(2^n)$", "$O(\\log n)$"], ans: 2, why: "Exponential growth outpaces any polynomial as n increases." },
    { q: "Big O notation primarily describes…", opts: ["exact runtime in seconds", "how runtime scales with input size", "memory addresses", "the programming language used"], ans: 1, why: "It captures asymptotic growth, not absolute, hardware-specific times." },
    { q: "An algorithm whose time is unaffected by input size is…", opts: ["$O(n)$", "$O(1)$", "$O(\\log n)$", "$O(n!)$"], ans: 1, why: "Constant time O(1) does the same work regardless of n." }
  ],
  exam: [
    { q: "Explain why $O(2^n)$ is considered intractable.", marks: 2, ms: ["As $n$ increases, the time taken grows so rapidly that it becomes impossible to solve for even moderate $n$ (1)", "Adding one to $n$ doubles the time required (1)"] },
    { q: "Place these complexities in order from best- to worst-scaling and classify each as tractable or intractable: $O(n^2)$, $O(1)$, $O(2^n)$, $O(\\log n)$.", marks: 4, ms: ["Order: O(1), O(log n), O(n²), O(2^n) (1-2)", "O(1), O(log n), O(n²) are tractable (polynomial or better) (1)", "O(2^n) is intractable (exponential) (1)"] },
    { q: "Explain what Big O notation measures and discuss why an O(n log n) algorithm is generally preferred over an O(n²) one for large datasets, noting any caveat.", marks: 6, ms: ["Big O describes how time/space scales with input size n (asymptotic growth) (1-2)", "It ignores hardware and constant factors (1)", "For large n, n log n grows far slower than n², so it is much faster (1-2)", "Caveat: for small n the O(n²) algorithm may be faster due to lower constant overheads (1)"] }
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
    ["Why can't faster hardware solve intractable problems?", "Doubling speed only adds one extra city to what's feasible — the factorial/exponential growth overwhelms any hardware improvement."],
    ["How does a heuristic differ from an approximation algorithm?", "A heuristic gives a 'good enough' answer with no guarantee; an approximation algorithm guarantees a result within a known factor of optimal."],
    ["What time complexity makes a problem intractable?", "Super-polynomial — exponential O(2^n) or factorial O(n!) — growth."],
    ["Name two strategies for coping with intractable problems.", "Heuristics (fast good-enough), and probabilistic or approximation algorithms (near-optimal/bounded)."]
  ],
  quiz: [
    { q: "Which problem is a classic example of intractability?", opts: ["Sorting a list", "Finding a name in a phone book", "The Travelling Salesman Problem", "Calculating an average"], ans: 2, why: "TSP requires checking $(n-1)!/2$ paths for an exact solution — factorial time." },
    { q: "An intractable problem differs from an uncomputable one because…", opts: ["intractable problems have no algorithm", "intractable problems have an algorithm but it is too slow for large n", "uncomputable problems are just slow", "they are the same"], ans: 1, why: "Intractable = algorithm exists, just impractical. Uncomputable = no algorithm possible at all." },
    { q: "A heuristic approach to an intractable problem guarantees…", opts: ["the optimal solution", "a fast, approximately good solution", "a provably bounded approximation", "no solution in polynomial time"], ans: 1, why: "Heuristics trade optimality for speed — 'good enough, fast' not 'best, slow'." },
    { q: "Which guarantees a result within a known factor of the optimal answer?", opts: ["a heuristic", "an approximation algorithm", "brute force", "a Mealy machine"], ans: 1, why: "Approximation algorithms come with a provable quality bound; heuristics do not." },
    { q: "The Nearest Neighbour TSP heuristic runs in roughly…", opts: ["$O(n!)$", "$O(2^n)$", "$O(n^2)$", "$O(\\log n)$"], ans: 2, why: "Repeatedly scanning remaining cities for the nearest gives polynomial (n²) time." }
  ],
  exam: [
    { q: "Explain the role of a heuristic in solving intractable problems. Use the Travelling Salesman Problem as an example.", marks: 4, ms: ["An intractable problem has a solution but it requires exponential/factorial time — not practical for large inputs (1)", "A heuristic provides a fast, approximate solution in polynomial time (1)", "Example: TSP — exact brute force is O((n-1)!/2), impractical for large n (1)", "Nearest Neighbour heuristic: always go to the closest unvisited city — runs in O(n²) but result may not be optimal (1)"] },
    { q: "Explain why an intractable problem is not the same as an impossible (uncomputable) one.", marks: 2, ms: ["An intractable problem HAS an algorithm — it is just too slow (exponential/factorial) for large inputs (1)", "An uncomputable problem has NO algorithm at all, e.g. the Halting Problem — a strictly stronger limitation (1)"] },
    { q: "A logistics firm must route a vehicle through 30 cities. Discuss why an exact optimal solution is infeasible and how the firm could still obtain a usable route, noting the trade-off.", marks: 6, ms: ["TSP exact solution checks ~(n-1)!/2 routes — astronomically large for n=30 (1-2)", "No computer can evaluate that many routes in reasonable time — intractable (1)", "Use a heuristic (e.g. Nearest Neighbour) to get a good route quickly in polynomial time (1-2)", "Trade-off: the route may not be optimal, but it is found fast and is usually good enough (1)"] }
  ]
};

C["compsci:4.4.4.1"] = {
  "notes": [
    {
      "h": "Comparing Algorithms"
    },
    {
      "callout": {
        "t": "info",
        "body": "Two algorithms that solve the same problem can differ enormously in efficiency. We compare them by expressing how their resource use grows as a function of the problem size, rather than by timing them on one machine."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Why complexity, not stopwatch",
        "body": "Actual run time depends on the hardware, language and input. Expressing complexity as a function of the problem size n gives a hardware-independent comparison — the size of the problem is the key issue, because differences only matter as n grows large."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Two kinds of efficiency",
        "body": [
          {
            "kv": [
              [
                "Time efficiency",
                "How the number of operations grows with n (time complexity)."
              ],
              [
                "Space efficiency",
                "How the memory used grows with n (space complexity)."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Trade-offs",
        "body": "An algorithm can be faster but use more memory, or slower but leaner — e.g. merge sort is O(n log n) time but needs O(n) extra space, while bubble sort is O(n²) time but O(1) space. The 'better' algorithm depends on which resource is scarce."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Comparing algorithms",
        "body": "Compare algorithms by expressing **complexity as a function of problem size n** (hardware-independent). The **size of the problem** is the key issue. Two dimensions: **time** efficiency (operations) and **space** efficiency (memory). They often trade off against each other."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconceptions",
        "body": "**The faster algorithm is the one that finished first on my PC** — No; absolute timing depends on hardware/input. Compare scaling with n. **Time is all that matters** — No; space (memory) efficiency can be the deciding factor on constrained systems."
      }
    }
  ],
  "flashcards": [
    [
      "How are algorithms compared independently of hardware?",
      "By expressing their complexity as a function of the problem size (time/space complexity)."
    ],
    [
      "Why is the size of the problem the key issue when comparing algorithms?",
      "Differences in efficiency only become significant as the input size n grows large."
    ],
    [
      "What are the two main kinds of algorithmic efficiency?",
      "Time efficiency (operations) and space efficiency (memory)."
    ],
    [
      "Give an example of a time/space trade-off.",
      "Merge sort: O(n log n) time but O(n) space; bubble sort: O(n²) time but O(1) space."
    ],
    [
      "Why not just time algorithms with a stopwatch?",
      "Absolute time depends on hardware, language and input; complexity gives a fair, general comparison."
    ],
    [
      "What does time complexity describe?",
      "How the number of operations grows as the input size increases."
    ],
    [
      "What does space complexity describe?",
      "How the memory used grows as the input size increases."
    ],
    [
      "When might a slower algorithm be preferred?",
      "When it uses much less memory and memory is the limiting resource."
    ]
  ],
  "quiz": [
    {
      "q": "Algorithms are best compared by...?",
      "opts": [
        "timing them once each",
        "complexity as a function of problem size",
        "counting their lines of code",
        "the language used"
      ],
      "ans": 1,
      "why": "Complexity gives a hardware-independent comparison that reflects scaling."
    },
    {
      "q": "The 'size of the problem' matters because...?",
      "opts": [
        "small inputs reveal differences",
        "efficiency differences grow significant as n grows",
        "it sets the language",
        "it fixes the hardware"
      ],
      "ans": 1,
      "why": "Asymptotic differences dominate for large n."
    },
    {
      "q": "Space efficiency refers to...?",
      "opts": [
        "operations performed",
        "memory used as n grows",
        "screen size",
        "cache speed"
      ],
      "ans": 1,
      "why": "Space complexity is about memory usage scaling."
    },
    {
      "q": "Merge sort vs bubble sort illustrates...?",
      "opts": [
        "no difference",
        "a time/space trade-off",
        "that timing is enough",
        "that both are O(1)"
      ],
      "ans": 1,
      "why": "Merge sort trades extra memory for far better time."
    },
    {
      "q": "Why is a stopwatch a poor way to compare two algorithms?",
      "opts": [
        "it is inaccurate",
        "absolute time depends on hardware/input, not just the algorithm",
        "it cannot measure seconds",
        "algorithms have no time"
      ],
      "ans": 1,
      "why": "Only complexity isolates the algorithm's scaling behaviour."
    }
  ],
  "exam": [
    {
      "q": "State the two kinds of efficiency used to compare algorithms.",
      "marks": 2,
      "ms": [
        "Time efficiency (time complexity). (1)",
        "Space efficiency (space complexity). (1)"
      ]
    },
    {
      "q": "Explain why algorithm complexity is expressed as a function of the problem size rather than as a measured time.",
      "marks": 2,
      "ms": [
        "Measured time depends on hardware, language and the particular input. (1)",
        "Expressing complexity as a function of n gives a hardware-independent comparison of how the algorithm scales. (1)"
      ]
    },
    {
      "q": "Discuss how two algorithms that solve the same problem can be compared, including any trade-offs, with an example.",
      "marks": 6,
      "ms": [
        "Compare by complexity expressed as a function of problem size n. (1)",
        "The size of the problem is the key issue because differences matter as n grows. (1)",
        "Time efficiency measures how operations grow with n. (1)",
        "Space efficiency measures how memory grows with n. (1)",
        "They can trade off, e.g. merge sort O(n log n) time but O(n) space vs bubble sort O(n²) time but O(1) space. (1)",
        "The better choice depends on whether time or memory is the limiting resource. (1)"
      ]
    }
  ]
};

C["compsci:4.4.4.6"] = {
  "notes": [
    {
      "h": "Computable and Non-Computable Problems"
    },
    {
      "callout": {
        "t": "info",
        "body": "A problem is computable if there is an algorithm (a Turing machine) that solves it. Crucially, some well-defined problems are non-computable: no algorithm can ever solve them."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Computable vs non-computable",
        "body": [
          {
            "kv": [
              [
                "Computable problem",
                "There exists an algorithm that produces the correct answer in a finite number of steps for every input (e.g. sorting, searching, addition)."
              ],
              [
                "Non-computable problem",
                "No algorithm can ever solve it for all inputs — it is impossible in principle, not merely slow."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "The Halting problem as the key example",
        "body": "The Halting problem — deciding whether an arbitrary program will eventually stop on a given input — is provably non-computable. It shows that the existence of non-computable problems is a real, demonstrated fact, not just a theoretical worry."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Non-computable is not the same as intractable",
        "body": "An intractable problem HAS an algorithm but it is too slow. A non-computable problem has NO algorithm at all. Non-computability is the stronger, absolute limit."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Computability",
        "body": "A problem is **computable** if some algorithm always solves it in finite steps. Some problems are **non-computable** — no algorithm can solve them, the **Halting problem** being the classic example. This is distinct from (and stronger than) intractability."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconceptions",
        "body": "**Every well-defined problem can be solved with the right program** — No; some are provably non-computable. **Non-computable means we just haven't found the algorithm yet** — No; it is proven that no algorithm can exist."
      }
    }
  ],
  "flashcards": [
    [
      "What makes a problem computable?",
      "There is an algorithm that gives the correct answer in finite steps for every input."
    ],
    [
      "What is a non-computable problem?",
      "A problem that no algorithm can ever solve for all inputs."
    ],
    [
      "Give the classic example of a non-computable problem.",
      "The Halting problem."
    ],
    [
      "Is a non-computable problem just very slow to solve?",
      "No — it cannot be solved by any algorithm at all; that is stronger than being slow."
    ],
    [
      "Difference between non-computable and intractable?",
      "Non-computable: no algorithm exists; intractable: an algorithm exists but is too slow."
    ],
    [
      "Does non-computable mean 'not yet discovered'?",
      "No — it is proven that no algorithm can exist, not that one is undiscovered."
    ],
    [
      "Are most everyday problems computable?",
      "Yes — sorting, searching, arithmetic and the like all have algorithms."
    ],
    [
      "What field studies which problems can be solved by algorithms?",
      "Computability (theory of computation)."
    ]
  ],
  "quiz": [
    {
      "q": "A computable problem is one that...?",
      "opts": [
        "has no algorithm",
        "some algorithm can solve in finite steps",
        "is always fast",
        "needs no input"
      ],
      "ans": 1,
      "why": "Computable means an algorithm exists that always terminates with the answer."
    },
    {
      "q": "A non-computable problem...?",
      "opts": [
        "is just slow",
        "cannot be solved by any algorithm",
        "needs more memory",
        "is solved by faster hardware"
      ],
      "ans": 1,
      "why": "No algorithm can solve it for all inputs."
    },
    {
      "q": "The standard example of a non-computable problem is the...?",
      "opts": [
        "Travelling Salesman Problem",
        "Halting problem",
        "sorting problem",
        "shortest path problem"
      ],
      "ans": 1,
      "why": "The Halting problem is provably non-computable."
    },
    {
      "q": "Non-computable differs from intractable because...?",
      "opts": [
        "both have no algorithm",
        "non-computable has no algorithm; intractable has a slow one",
        "intractable has no algorithm",
        "they are identical"
      ],
      "ans": 1,
      "why": "Intractable problems do have (slow) algorithms; non-computable ones do not."
    },
    {
      "q": "'Non-computable' means...?",
      "opts": [
        "no algorithm has been found yet",
        "no algorithm can ever exist",
        "the computer is broken",
        "it needs a quantum computer"
      ],
      "ans": 1,
      "why": "It is proven that no algorithm can exist."
    }
  ],
  "exam": [
    {
      "q": "State what is meant by a non-computable problem.",
      "marks": 1,
      "ms": [
        "A problem that cannot be solved by any algorithm for all inputs. (1)"
      ]
    },
    {
      "q": "Give an example of a non-computable problem and explain why it is significant.",
      "marks": 2,
      "ms": [
        "The Halting problem. (1)",
        "It proves that some well-defined problems cannot be solved by any computer, establishing a fundamental limit of computation. (1)"
      ]
    },
    {
      "q": "Explain the difference between computable, intractable and non-computable problems, with an example of each.",
      "marks": 6,
      "ms": [
        "A computable problem has an algorithm that always finishes with the correct answer (e.g. sorting). (1)",
        "An intractable problem has an algorithm, but it runs in exponential/factorial time (e.g. exact Travelling Salesman). (1)",
        "So an intractable problem is computable but impractical for large inputs. (1)",
        "A non-computable problem has no algorithm at all (e.g. the Halting problem). (1)",
        "Non-computability is an absolute limit, stronger than intractability. (1)",
        "Together these show some problems are merely slow while others are impossible in principle. (1)"
      ]
    }
  ]
};

C["compsci:4.4.4.4"] = {
  "notes": [
    {
      "h": "Limits of Computation"
    },
    {
      "callout": {
        "t": "info",
        "body": "Not everything can be computed in practice, or even in principle. Two distinct kinds of limit apply: limits from algorithmic complexity, and limits from the hardware available."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Two sources of limits",
        "body": [
          {
            "kv": [
              [
                "Algorithmic complexity",
                "Some problems have only intractable (exponential/factorial) algorithms, so they cannot be solved exactly for large inputs in any reasonable time."
              ],
              [
                "Hardware limits",
                "Real machines have finite memory and speed and finite time, so even tractable problems may exceed the resources actually available."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Beyond practical limits: the non-computable",
        "body": "Some problems cannot be solved by ANY algorithm at all, regardless of complexity or hardware — for example the Halting problem. This is a stronger limit than intractability: not 'too slow' but 'impossible'."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Limits of computation",
        "body": "Two practical limits: **algorithmic complexity** (intractable problems are too slow for large n) and **hardware** (finite memory, speed and time). A deeper limit also exists: some problems are **non-computable** — no algorithm can ever solve them (e.g. the Halting problem)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconceptions",
        "body": "**A faster computer can solve any problem** — No; exponential growth defeats any hardware gain, and non-computable problems can never be solved. **Intractable and non-computable are the same** — No; intractable has a (too-slow) algorithm, non-computable has none at all."
      }
    }
  ],
  "flashcards": [
    [
      "What two practical things impose limits on what can be computed?",
      "Algorithmic complexity (intractable problems) and hardware limits (finite memory, speed, time)."
    ],
    [
      "How does algorithmic complexity limit computation?",
      "Some problems only have exponential/factorial algorithms, so they cannot be solved for large inputs in reasonable time."
    ],
    [
      "How does hardware limit computation?",
      "Real machines have finite memory, speed and time, so some computations exceed available resources."
    ],
    [
      "What is a stronger limit than intractability?",
      "Non-computability — some problems cannot be solved by any algorithm at all (e.g. the Halting problem)."
    ],
    [
      "Can a faster computer overcome an intractable problem?",
      "Not really — exponential/factorial growth quickly overwhelms any speed increase."
    ],
    [
      "Give an example of a non-computable problem.",
      "The Halting problem."
    ],
    [
      "Difference between intractable and non-computable?",
      "Intractable: an algorithm exists but is too slow; non-computable: no algorithm can ever exist."
    ],
    [
      "Are limits of computation only about speed?",
      "No — they include memory/hardware limits and the deeper limit that some problems have no algorithm at all."
    ]
  ],
  "quiz": [
    {
      "q": "Which imposes a limit on what can be computed?",
      "opts": [
        "only the language used",
        "algorithmic complexity and hardware",
        "the screen resolution",
        "the number of variables"
      ],
      "ans": 1,
      "why": "Both complexity (too slow) and hardware (finite resources) limit computation."
    },
    {
      "q": "An intractable problem is limited because...?",
      "opts": [
        "it has no algorithm",
        "its only algorithms take exponential/factorial time",
        "it needs no memory",
        "it is non-computable"
      ],
      "ans": 1,
      "why": "It is solvable in principle but too slow for large inputs."
    },
    {
      "q": "A stronger limit than intractability is...?",
      "opts": [
        "slow hardware",
        "non-computability (no algorithm exists)",
        "a small screen",
        "high memory use"
      ],
      "ans": 1,
      "why": "Non-computable problems cannot be solved by any algorithm."
    },
    {
      "q": "Can buying a faster computer make an exponential-time problem tractable for large n?",
      "opts": [
        "yes, always",
        "no — the growth outpaces any speed gain",
        "only with more RAM",
        "only on weekends"
      ],
      "ans": 1,
      "why": "Exponential growth quickly dwarfs any constant speed-up."
    },
    {
      "q": "Hardware limits on computation come from...?",
      "opts": [
        "finite memory, speed and time",
        "the choice of editor",
        "infinite resources",
        "the operating system only"
      ],
      "ans": 0,
      "why": "Real machines have bounded resources."
    }
  ],
  "exam": [
    {
      "q": "State two things that impose limits on what can be computed.",
      "marks": 2,
      "ms": [
        "Algorithmic complexity (intractable problems). (1)",
        "Hardware limits (finite memory, processing speed and time). (1)"
      ]
    },
    {
      "q": "Explain the difference between an intractable problem and a non-computable problem.",
      "marks": 2,
      "ms": [
        "Intractable: an algorithm exists but takes exponential/factorial time, so it is impractical for large inputs. (1)",
        "Non-computable: no algorithm can ever solve it, regardless of time or hardware (e.g. the Halting problem). (1)"
      ]
    },
    {
      "q": "Discuss the limits on what can be computed, distinguishing practical limits from absolute limits.",
      "marks": 6,
      "ms": [
        "Algorithmic complexity limits computation: intractable problems have only exponential/factorial algorithms. (1)",
        "These cannot be solved exactly for large inputs in reasonable time. (1)",
        "Hardware imposes further practical limits: finite memory, speed and time. (1)",
        "Faster hardware cannot overcome exponential growth. (1)",
        "An absolute limit also exists: some problems are non-computable. (1)",
        "No algorithm can solve a non-computable problem (e.g. the Halting problem), regardless of resources. (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);
