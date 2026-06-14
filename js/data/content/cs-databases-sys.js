/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.1.2.1"] = {
  "notes": [
    {
      "h": "Procedural Programming Fundamentals"
    },
    {
      "callout": {
        "t": "def",
        "h": "Core Concepts",
        "body": [
          {
            "kv": [
              [
                "Variables & Constants",
                "Variables store data that changes during execution; constants are fixed at compile time, improving readability and safety."
              ],
              [
                "Selection",
                "IF/ELSE or SWITCH constructs branching control flow based on conditions."
              ],
              [
                "Iteration",
                "Looping structures. Definite (FOR) repeats a set number of times. Indefinite (WHILE/REPEAT) relies on a condition."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Process: Defining a Subroutine"
    },
    {
      "steps": [
        {
          "h": "1. Declaration",
          "m": "Define the subroutine name, return type, and parameters."
        },
        {
          "h": "2. Scope Definition",
          "m": "Declare local variables that only exist while the subroutine is executing."
        },
        {
          "h": "3. Implementation",
          "m": "Write the sequence of instructions to perform the task."
        },
        {
          "h": "4. Return/Exit",
          "m": "Return a value (for functions) or simply exit (for procedures)."
        }
      ]
    },
    {
      "callout": {
        "t": "def",
        "h": "Modular Programming",
        "body": [
          {
            "kv": [
              [
                "Subroutines",
                "Procedures and functions that break down complex tasks into manageable, reusable modules."
              ],
              [
                "Parameters",
                "Pass data into subroutines. Passed by value (a copy is passed) or by reference (a pointer to the original memory address is passed)."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Passing by Value vs Reference in C#.",
        "src": "void UpdateScore(int score) { score += 10; } // By Value (copy)\nvoid UpdateScoreRef(ref int score) { score += 10; } // By Reference\n\nint myScore = 50;\nUpdateScore(myScore); // myScore is still 50\nUpdateScoreRef(ref myScore); // myScore is now 60"
      }
    },
    {
      "table": {
        "head": [
          "Comparison",
          "Difference"
        ],
        "rows": [
          [
            "Functions vs Procedures",
            "Functions always return a value; procedures do not."
          ],
          [
            "Local vs Global Variables",
            "Local variables only exist within the subroutine, preventing side-effects. Global variables are visible everywhere, risking unintended modification."
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Scope Rules",
        "body": "AQA expects you to know that local variables overshadow global variables of the same name. Using parameters and local variables makes code 'reusable' and 'self-contained'."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Scope Misconceptions",
        "body": "**Local variables exist throughout the entire program** — No; local variables are created when a function is called and destroyed when it returns. They only exist within their declared scope. **Parameters are the same as arguments** — Parameters are the variables listed in a function definition; arguments are the actual values passed when calling the function. Related but distinct terms."
      }
    }
  ],
  "flashcards": [
    [
      "Definite vs indefinite iteration?",
      "Definite loops a fixed number of times (FOR); indefinite loops based on a condition (WHILE/REPEAT)."
    ],
    [
      "Function vs procedure?",
      "A function returns a value; a procedure does not."
    ],
    [
      "Pass by value vs reference?",
      "Value passes a copy (safe from changes); reference passes a pointer (modifies the original variable)."
    ],
    [
      "Benefit of using local variables?",
      "They are isolated to the subroutine, preventing unintended side-effects and keeping memory usage lean."
    ],
    [
      "Why use constants instead of hard-coding values?",
      "Improves readability (e.g., VAT = 0.2) and safety (prevents accidental modification)."
    ]
  ],
  "quiz": [
    {
      "q": "Which iteration construct is best suited for processing every item in an array?",
      "opts": [
        "WHILE loop",
        "FOR loop",
        "REPEAT UNTIL",
        "IF statement"
      ],
      "ans": 1,
      "why": "FOR loops represent definite iteration, ideal for traversing a known number of elements like array bounds."
    },
    {
      "q": "A variable declared exclusively inside a function is called...",
      "opts": [
        "A global variable",
        "A local variable",
        "A parameter",
        "A constant"
      ],
      "ans": 1,
      "why": "Local variables are created when the function is called and destroyed when it ends."
    },
    {
      "q": "Passing a parameter by reference means...",
      "opts": [
        "A safe copy is sent",
        "The memory address is sent",
        "It cannot be changed",
        "It becomes a constant"
      ],
      "ans": 1,
      "why": "By reference passes a pointer to the original memory location, so changes persist outside the subroutine."
    },
    {
      "q": "What is a defining characteristic of the procedural programming paradigm?",
      "opts": [
        "Objects and classes",
        "Declarative rules",
        "A sequence of instructions and subroutines",
        "Event-driven listeners"
      ],
      "ans": 2,
      "why": "Procedural code executes line-by-line, grouping instructions into reusable subroutines."
    }
  ],
  "exam": [
    {
      "q": "Explain two advantages of using local variables rather than global variables within a subroutine.",
      "marks": 4,
      "ms": [
        "Prevents unintended side-effects by other parts of the program (1) as the variable is only accessible within the subroutine (1).",
        "Allows for re-entrancy / subroutines can be reused in different contexts (1) without naming conflicts (1)."
      ]
    }
  ]
};

C["compsci:4.1.2.2"] = {
  "notes": [
    {
      "h": "Modular Design and Subroutines"
    },
    {
      "callout": {
        "t": "def",
        "h": "Modular Concepts",
        "body": [
          {
            "kv": [
              [
                "Modular Design",
                "The practice of breaking a program into independent, interchangeable modules."
              ],
              [
                "Subroutine",
                "A named block of code that performs a specific task."
              ],
              [
                "Local Scope",
                "Variables declared within a subroutine that cannot be accessed from outside."
              ],
              [
                "Parameters",
                "Variables used to pass data into a subroutine."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "A modular function in C#.",
        "src": "public int AddNumbers(int a, int b) {\n    int sum = a + b; // sum is local to this function\n    return sum;\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Design Tip",
        "body": "Modules should have high cohesion (do one thing well) and low coupling (be independent of other modules)."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "High cohesion, low coupling",
        "body": "**Cohesion** = how well a module's parts belong together. Aim HIGH — one job, one purpose.\n**Coupling** = how much modules depend on each other. Aim LOW — changes in one shouldn't break another.\n\nThink: **tight team, loose handshake.**"
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "\"More modules = better design\"",
        "body": "Over-modularising creates excessive coupling through many small interconnected units. The goal is modules with a **single clear purpose** at the right level of granularity — not maximising module count."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Benefits of modular design",
        "body": [
          {
            "kv": [
              ["Parallel development", "Different programmers can work on different modules simultaneously"],
              ["Easier debugging", "Faults are isolated to the module that fails its unit test"],
              ["Reusability", "A well-designed module can be used in other projects without modification"],
              ["Maintainability", "Changes are localised — fixing one module doesn't break others"]
            ]
          }
        ]
      }
    }
  ],
  "flashcards": [
    [
      "What is a benefit of modular design?",
      "It makes code easier to test, maintain, and reuse — and allows parallel development."
    ],
    [
      "Define Cohesion.",
      "A measure of how closely related the functions within a module are. High cohesion = one clear purpose."
    ],
    [
      "Define Coupling.",
      "A measure of how dependent modules are on one another. Low coupling = changes in one module don't cascade."
    ],
    [
      "What is the ideal combination for well-designed modules?",
      "High cohesion and low coupling."
    ],
    [
      "How does modular design support testing?",
      "Each module can be tested independently (unit testing) before integration."
    ]
  ],
  "quiz": [
    {
      "q": "A variable that only exists within a subroutine is called:",
      "opts": [
        "Global",
        "Local",
        "Static",
        "Public"
      ],
      "ans": 1,
      "why": "Local variables are created and destroyed with the subroutine call."
    },
    {
      "q": "A module that does one specific, well-defined job is said to have:",
      "opts": [
        "Low cohesion",
        "High coupling",
        "High cohesion",
        "Weak encapsulation"
      ],
      "ans": 2,
      "why": "High cohesion means all the code in a module serves a single clear purpose."
    },
    {
      "q": "If changing Module A frequently requires changes to Module B, this indicates:",
      "opts": [
        "High cohesion",
        "Low coupling",
        "High coupling",
        "Good abstraction"
      ],
      "ans": 2,
      "why": "High coupling means modules are tightly interdependent — the opposite of what we want."
    }
  ],
  "exam": [
    {
      "q": "Explain how using subroutines supports modularity in software development.",
      "marks": 3,
      "ms": [
        "Allows complex problems to be broken into smaller, manageable tasks (1)",
        "Tasks can be developed and tested independently (unit testing) (1)",
        "Subroutines can be reused in other parts of the program or other projects (1)"
      ]
    }
  ]
};

C["compsci:4.2.1.2"] = {
  "notes": [
    {
      "h": "Single- and Multi-dimensional Arrays"
    },
    {
      "callout": {
        "t": "def",
        "h": "Array Structures",
        "body": [
          {
            "kv": [
              [
                "1D Array",
                "A finite, indexed set of related elements of the same data type. Elements are stored contiguously in memory."
              ],
              [
                "2D Array",
                "A grid or table structure where elements are accessed via two indices: [row, column]."
              ],
              [
                "3D Array",
                "A 'cube' of data where elements are accessed via three indices: [depth, row, column], often used for spatial data or time-series grids."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Memory Mapping: Row-Major vs Column-Major"
    },
    {
      "callout": {
        "t": "def",
        "h": "Linearisation",
        "body": [
          {
            "kv": [
              [
                "Row-Major Order",
                "Elements of a row are stored in contiguous memory locations. (e.g., Row 0, then Row 1, etc.). Used by C#, C++, Java."
              ],
              [
                "Column-Major Order",
                "Elements of a column are stored contiguously. (e.g., Col 0, then Col 1, etc.). Used by Fortran, MATLAB."
              ],
              [
                "Address Calculation (2D)",
                "Address(A[i,j]) = BaseAddress + (i * NumberOfColumns + j) * ElementSize (for Row-Major)."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Declaring and Iterating Multi-dimensional Arrays in C#.",
        "src": "// 1D Array\nstring[] cars = {\"Volvo\", \"BMW\", \"Ford\"};\n\n// 2D Array (Rectangular)\nint[,] matrix = new int[3, 3];\nmatrix[0, 0] = 1;\n\n// 3D Array (Cube)\nint[,,] cube = new int[2, 2, 2];\ncube[0, 1, 0] = 42;\n\n// Jagged Array (Array of Arrays - rows can have different lengths)\nint[][] jagged = new int[3][];\njagged[0] = new int[4];\njagged[1] = new int[2];"
      }
    },
    {
      "table": {
        "head": [
          "Feature",
          "Static Array",
          "Dynamic Array"
        ],
        "rows": [
          [
            "Size",
            "Fixed at compile time",
            "Can change during execution"
          ],
          [
            "Memory",
            "Allocated on the Stack",
            "Allocated on the Heap"
          ],
          [
            "Performance",
            "Very fast (known location)",
            "Slight overhead due to resizing/pointers"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "AQA Exam Insight",
        "body": "You must be able to calculate the memory address of an element in a 2D array if given the base address and row/column counts. Remember: Rows first, then columns in Row-Major mapping."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Arrays — Key Facts",
        "body": "**1D array**: ordered list of same-type elements under one name, accessed by index. **2D array**: grid/matrix accessed by [row][col]. Arrays are **fixed size** at declaration (in most languages). Indices are **zero-based** in most languages (Python, Java, C#, C++, JavaScript) — first element at index 0, not 1."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Array Misconceptions",
        "body": "**Arrays can hold different data types** — In statically typed languages (Java, C#, C++), arrays are homogeneous — all elements must be the same type. **Array indices start at 1** — In most languages (Python, Java, C#, JavaScript), arrays are zero-indexed; the first element is at index 0. Index 1 is the second element. Forgetting this causes off-by-one errors."
      }
    }
  ],
  "flashcards": [
    [
      "What is a 1D array?",
      "A finite, indexed set of elements of the same data type stored contiguously in memory."
    ],
    [
      "How is a 2D array element accessed in C#?",
      "Using the syntax arrayName[row, column]."
    ],
    [
      "Explain Row-Major Order.",
      "A method of mapping a multi-dimensional array to linear memory where elements of the same row are stored together."
    ],
    [
      "What is a Jagged Array?",
      "An array of arrays where each 'row' can have a different length."
    ],
    [
      "What is the formula for the memory address of A[i,j] in Row-Major order?",
      "BaseAddress + (i * NumCols + j) * SizeOfElement."
    ]
  ],
  "quiz": [
    {
      "q": "Which memory mapping stores all elements of the first row, then the second row, and so on?",
      "opts": [
        "Column-Major",
        "Row-Major",
        "Depth-First",
        "Breadth-First"
      ],
      "ans": 1,
      "why": "Row-Major order linearises the array row-by-row."
    },
    {
      "q": "In C#, what is the correct declaration for a 3D rectangular integer array?",
      "opts": [
        "int[][][] a",
        "int[,,] a",
        "int(,,) a",
        "int[3] a"
      ],
      "ans": 1,
      "why": "C# uses commas within brackets [,,] for multi-dimensional rectangular arrays."
    },
    {
      "q": "What is a key disadvantage of static arrays?",
      "opts": [
        "Slow access speed",
        "Cannot store strings",
        "Fixed size cannot be changed",
        "Incompatible with loops"
      ],
      "ans": 2,
      "why": "Static arrays have a fixed size determined at declaration, which can lead to wasted space or overflow."
    },
    {
      "q": "How many elements are in an array declared as `new int[3, 4, 2]`?",
      "opts": [
        "9",
        "12",
        "24",
        "48"
      ],
      "ans": 2,
      "why": "3 * 4 * 2 = 24 elements."
    }
  ],
  "exam": [
    {
      "q": "A 2D array `Scores` has 10 rows (0-9) and 5 columns (0-4). Each integer takes 4 bytes. If the base address is 1000, calculate the memory address of `Scores[3, 2]` using row-major order.",
      "marks": 3,
      "ms": [
        "Formula: Base + (RowIndex * NumCols + ColIndex) * Size (1)",
        "1000 + (3 * 5 + 2) * 4 (1)",
        "1000 + (17 * 4) = 1068 (1)"
      ]
    }
  ]
};

C["compsci:4.2.1.4"] = {
  "notes": [
    {
      "h": "Abstract Data Types (ADTs)"
    },
    {
      "callout": {
        "t": "def",
        "h": "ADTs vs Data Structures",
        "body": [
          {
            "kv": [
              [
                "ADT",
                "A logical description of data and operations (the 'What'), independent of implementation."
              ],
              [
                "Data Structure",
                "The physical implementation in memory (the 'How') e.g., using an array or linked list."
              ],
              [
                "Encapsulation",
                "Hiding the internal implementation and only providing a public interface."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Common ADTs"
    },
    {
      "callout": {
        "t": "def",
        "h": "Standard Types",
        "body": [
          {
            "kv": [
              [
                "Stack",
                "LIFO (Last In First Out). Ops: Push, Pop, Peek."
              ],
              [
                "Queue",
                "FIFO (First In First Out). Ops: Enqueue, Dequeue."
              ],
              [
                "Graph",
                "A collection of nodes and edges connecting them."
              ],
              [
                "Tree",
                "A connected graph with no cycles."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Implementing a simple Stack ADT.",
        "src": "public class Stack {\n    private int[] items = new int[100];\n    private int top = -1;\n\n    public void Push(int x) { items[++top] = x; }\n    public int Pop() { return items[top--]; }\n}"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Exam Note",
        "body": "An ADT is NOT a physical thing in memory until it is implemented. The ADT is the conceptual model."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "ADT operations at a glance",
        "body": [
          {
            "table": {
              "head": ["ADT", "Behaviour", "Key Operations"],
              "rows": [
                ["Stack", "LIFO", "Push, Pop, Peek, isEmpty"],
                ["Queue", "FIFO", "Enqueue, Dequeue, isEmpty"],
                ["Graph", "Nodes + Edges", "AddVertex, AddEdge, GetNeighbours"],
                ["Tree", "Hierarchical", "Insert, Delete, Traverse"]
              ]
            }
          }
        ]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "\"An ADT tells you how data is stored\"",
        "body": "An ADT specifies **what** operations are available and **what** they do — not **how** they are implemented. A stack is always LIFO whether backed by an array or a linked list."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Why ADTs matter",
        "body": "By programming to an ADT interface (e.g. just Push/Pop/Peek), you can swap the underlying implementation (array → linked list) without changing any code that uses the stack. This is the power of encapsulation."
      }
    }
  ],
  "flashcards": [
    [
      "Define ADT.",
      "A logical description of data and operations, independent of physical implementation."
    ],
    [
      "Stack behaviour?",
      "LIFO (Last In First Out) — Push adds, Pop removes from the same end."
    ],
    [
      "Queue behaviour?",
      "FIFO (First In First Out) — Enqueue adds to rear, Dequeue removes from front."
    ],
    [
      "Why can a stack be implemented as an array OR a linked list?",
      "Because an ADT only defines behaviour (LIFO), not the physical storage structure."
    ],
    [
      "What is encapsulation in the context of ADTs?",
      "Hiding the internal implementation so users interact only through the defined operations."
    ]
  ],
  "quiz": [
    {
      "q": "Which ADT is FIFO?",
      "opts": [
        "Stack",
        "Queue",
        "Tree",
        "Graph"
      ],
      "ans": 1,
      "why": "Queues are First-In-First-Out."
    },
    {
      "q": "An ADT describes…",
      "opts": [
        "how data is stored in memory",
        "the operations available and what they do, not how",
        "the programming language to be used",
        "the exact size of the data structure"
      ],
      "ans": 1,
      "why": "ADTs are logical models — they specify the interface, not the implementation."
    },
    {
      "q": "Which ADT would you use to implement an 'Undo' feature in a text editor?",
      "opts": [
        "Queue",
        "Graph",
        "Stack",
        "1D Array"
      ],
      "ans": 2,
      "why": "Undo reverses the most recent action — LIFO makes Stack the natural choice."
    }
  ],
  "exam": [
    {
      "q": "Explain the difference between an ADT and its implementation, using a stack as an example.",
      "marks": 4,
      "ms": [
        "ADT defines logical properties and operations (what it does) (1)",
        "Implementation is the physical storage/code (how it does it) (1)",
        "Stack ADT: LIFO behaviour with Push, Pop, Peek operations defined (1)",
        "Can be implemented using an array or a linked list — either satisfies the ADT contract (1)"
      ]
    }
  ]
};

C["compsci:4.6.5.1"] = {
  "notes": [
    {
      "h": "Boolean Algebra & De Morgan's Laws"
    },
    {
      "callout": {
        "t": "def",
        "h": "De Morgan's Laws",
        "body": [
          {
            "kv": [
              [
                "Rule 1",
                "¬(A · B) = ¬A + ¬B (NOT AND becomes NOT OR NOT)"
              ],
              [
                "Rule 2",
                "¬(A + B) = ¬A · ¬B (NOT OR becomes NOT AND NOT)"
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Identity & Distribution Laws"
    },
    {
      "callout": {
        "t": "def",
        "h": "Key Identities",
        "body": [
          {
            "kv": [
              [
                "Distribution",
                "A · (B + C) = (A · B) + (A · C)"
              ],
              [
                "Absorption",
                "A + (A · B) = A"
              ],
              [
                "Double Negation",
                "¬¬A = A"
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Boolean logic in C#.",
        "src": "bool A = true, B = false;\n// De Morgan's\nbool result1 = !(A && B); // same as !A || !B\nbool result2 = !(A || B); // same as !A && !B"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Simplification",
        "body": "Always look for double negations to cancel out and absorption opportunities to remove redundant terms."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Boolean laws quick reference",
        "body": [
          {
            "table": {
              "head": ["Law", "AND form", "OR form"],
              "rows": [
                ["Identity", "A · 1 = A", "A + 0 = A"],
                ["Annulment", "A · 0 = 0", "A + 1 = 1"],
                ["Idempotent", "A · A = A", "A + A = A"],
                ["Complement", "A · ¬A = 0", "A + ¬A = 1"],
                ["Double Negation", "¬¬A = A", "—"],
                ["De Morgan's", "¬(A · B) = ¬A + ¬B", "¬(A + B) = ¬A · ¬B"],
                ["Absorption", "A · (A + B) = A", "A + (A · B) = A"],
                ["Distribution", "A · (B + C) = (A·B) + (A·C)", "A + (B·C) = (A+B)·(A+C)"]
              ]
            }
          }
        ]
      }
    },
    {
      "callout": {
        "t": "mnemonic",
        "h": "De Morgan's — Break and Change",
        "body": "**Break** the bar (over one or both), **Change** the sign (· → + or + → ·).\n\n¬(A · B) → break bar, change · to + → ¬A + ¬B\n¬(A + B) → break bar, change + to · → ¬A · ¬B"
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "\"De Morgan's just flips the sign\"",
        "body": "De Morgan's requires two steps: (1) distribute the NOT onto each variable, AND (2) swap the operator. Forgetting step 2 (changing · to + or vice versa) is the most common exam error."
      }
    }
  ],
  "flashcards": [
    [
      "¬(A + B) simplifies to?",
      "¬A · ¬B (De Morgan's Rule 2)"
    ],
    [
      "¬(A · B) simplifies to?",
      "¬A + ¬B (De Morgan's Rule 1)"
    ],
    [
      "What is A + (A · B)?",
      "A (Absorption Law)"
    ],
    [
      "What does the Complement Law state?",
      "A · ¬A = 0 and A + ¬A = 1"
    ],
    [
      "What is the mnemonic for De Morgan's Law?",
      "Break the bar, change the sign."
    ]
  ],
  "quiz": [
    {
      "q": "Applying De Morgan's to ¬(X + Y) gives:",
      "opts": [
        "¬X + ¬Y",
        "X · Y",
        "¬X · ¬Y",
        "X + Y"
      ],
      "ans": 2,
      "why": "Break bar, change sign: NOT OR becomes NOT AND NOT."
    },
    {
      "q": "Simplify: A · 1 + ¬A · 0",
      "opts": [
        "0",
        "1",
        "A",
        "¬A"
      ],
      "ans": 2,
      "why": "A · 1 = A; ¬A · 0 = 0; A + 0 = A (identity laws)."
    },
    {
      "q": "Which law states that A + (A · B) = A?",
      "opts": [
        "Distribution",
        "De Morgan's",
        "Absorption",
        "Complement"
      ],
      "ans": 2,
      "why": "The Absorption Law — A absorbs the redundant A·B term."
    }
  ],
  "exam": [
    {
      "q": "Simplify ¬(A + ¬B) · C, showing each step.",
      "marks": 3,
      "ms": [
        "Apply De Morgan's to ¬(A + ¬B): → ¬A · ¬¬B (1)",
        "Apply double negation: ¬¬B = B → ¬A · B (1)",
        "Multiply out with C: ¬A · B · C (final answer) (1)"
      ]
    }
  ]
};

C["compsci:4.10.1"] = {
  "notes": [
    {
      "h": "Conceptual Data Models and ER Modelling"
    },
    {
      "callout": {
        "t": "def",
        "h": "ERD Fundamentals",
        "body": [
          {
            "kv": [
              [
                "Entity",
                "A person, place, thing, or event about which data is kept (e.g., STUDENT). Represented as a rectangle."
              ],
              [
                "Attribute",
                "A property of an entity (e.g., StudentID). Represented as an oval/ellipse linked to the entity."
              ],
              [
                "Relationship",
                "An association between entities (e.g., Student 'Takes' Course). Represented as a diamond or using Crow's Foot notation."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Relationship Cardinality"
    },
    {
      "callout": {
        "t": "def",
        "h": "Types of Relationships",
        "body": [
          {
            "kv": [
              [
                "1:1 (One-to-One)",
                "e.g., A Husband has one Wife; A Country has one Capital City."
              ],
              [
                "1:M (One-to-Many)",
                "e.g., A Mother has many Children; A Customer places many Orders."
              ],
              [
                "M:M (Many-to-Many)",
                "e.g., Students take many Courses; Courses are taken by many Students."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "The M:M Resolution Process"
    },
    {
      "steps": [
        {
          "h": "1. Detect M:M",
          "m": "Identify that two entities have a many-to-many relationship which cannot be directly implemented."
        },
        {
          "h": "2. Insert Entity",
          "m": "Create an 'Intersection' or 'Linking' entity between them."
        },
        {
          "h": "3. Redirect Links",
          "m": "Replace the M:M link with two 1:M links pointing from the originals to the new entity."
        },
        {
          "h": "4. Primary Keys",
          "m": "The linking entity usually uses a Composite Key made of the Primary Keys of the related entities."
        }
      ]
    },
    {
      "code": {
        "lang": "sql",
        "cap": "Schema showing 1:M and M:M resolution.",
        "src": "-- 1:M Relationship: One Department, Many Employees\nCREATE TABLE Department (\n    DeptID INT PRIMARY KEY,\n    DeptName TEXT\n);\n\nCREATE TABLE Employee (\n    EmpID INT PRIMARY KEY,\n    Name TEXT,\n    DeptID INT, -- Foreign Key\n    FOREIGN KEY (DeptID) REFERENCES Department(DeptID)\n);\n\n-- M:M Resolution: Students and Lessons\nCREATE TABLE Student (StudentID INT PRIMARY KEY, Name TEXT);\nCREATE TABLE Lesson (LessonID INT PRIMARY KEY, Subject TEXT);\n\n-- Intersection Entity\nCREATE TABLE Attendance (\n    StudentID INT,\n    LessonID INT,\n    Attended BOOLEAN,\n    PRIMARY KEY (StudentID, LessonID),\n    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),\n    FOREIGN KEY (LessonID) REFERENCES Lesson(LessonID)\n);"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Drawing Conventions",
        "body": "In AQA exams, you may be asked to draw an ERD. Ensure you use rectangles for entities and label the lines with the relationship type. If using Crow's Foot, 'one' is a straight line and 'many' is a three-pronged fork."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "ER Diagram Essentials",
        "body": "**Entities** (rectangles): real-world objects (Student, Course). **Attributes** (ovals/listed): properties of entities (Name, DOB). **Relationships** (diamonds/lines): how entities connect. **Cardinality**: 1:1 (one-to-one), 1:N (one-to-many), M:N (many-to-many). **M:N** must be decomposed into two 1:N relationships using a junction/link table in relational design."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "ER Modelling Misconceptions",
        "body": "**A many-to-many relationship can be directly implemented in a relational database** — No; relational tables cannot directly represent M:N. You must create a junction/link table (intersection entity) with foreign keys to both entities, turning M:N into two 1:N relationships. **Every attribute must be in the ER diagram** — The ER diagram shows the conceptual model; derived attributes (Age calculated from DOB) and multi-valued attributes are handled differently in implementation."
      }
    }
  ],
  "flashcards": [
    [
      "What is an Entity in a database?",
      "An object or concept about which data can be stored (e.g., Customer, Product)."
    ],
    [
      "Define an Attribute.",
      "A single piece of data or characteristic of an entity (e.g., DateOfBirth)."
    ],
    [
      "What does 1:M represent?",
      "A One-to-Many relationship, where one record in Table A can relate to many in Table B."
    ],
    [
      "How is a Many-to-Many relationship resolved in a relational database?",
      "By creating an intermediate linking table with two 1:M relationships."
    ],
    [
      "What is a Composite Key?",
      "A primary key that consists of more than one attribute to uniquely identify a record."
    ]
  ],
  "quiz": [
    {
      "q": "In an ERD, what shape represents an Entity?",
      "opts": [
        "Diamond",
        "Oval",
        "Rectangle",
        "Circle"
      ],
      "ans": 2,
      "why": "Entities are standard rectangles; diamonds usually represent the relationship 'verb'."
    },
    {
      "q": "A Doctor treats many Patients, and a Patient can be seen by many Doctors. What is this relationship?",
      "opts": [
        "1:1",
        "1:M",
        "M:M",
        "M:1"
      ],
      "ans": 2,
      "why": "This is many-to-many because multiple links exist in both directions."
    },
    {
      "q": "What is the primary reason for resolving M:M relationships?",
      "opts": [
        "To save disk space",
        "Because relational databases cannot implement them directly",
        "To speed up queries",
        "To allow for null values"
      ],
      "ans": 1,
      "why": "Relational theory requires atomic values and unique keys; M:M links break the rule of 'one value per cell' conceptually without a linking table."
    },
    {
      "q": "Which attribute uniquely identifies an entity?",
      "opts": [
        "Foreign Key",
        "Secondary Key",
        "Composite Key",
        "Primary Key"
      ],
      "ans": 3,
      "why": "The Primary Key is the unique identifier for a record."
    }
  ],
  "exam": [
    {
      "q": "Draw an entity-relationship diagram for a system where many Students can enrol on many Courses. You must resolve the relationship and show the entities and their links.",
      "marks": 4,
      "ms": [
        "Student entity and Course entity identified (1)",
        "Linking entity (e.g. Enrolment) created (1)",
        "Two 1:M relationships shown (1)",
        "One-to-many directions correctly pointing TO the linking entity (1)"
      ]
    }
  ]
};

C["compsci:4.10.2"] = {
  "notes": [
    {
      "h": "Relational Database Design"
    },
    {
      "callout": {
        "t": "def",
        "h": "Relational Concepts",
        "body": [
          {
            "kv": [
              [
                "Relation",
                "A table in a database."
              ],
              [
                "Tuple",
                "A row/record in a table."
              ],
              [
                "Attribute",
                "A column/field in a table."
              ],
              [
                "Primary Key",
                "An attribute that uniquely identifies a tuple."
              ],
              [
                "Foreign Key",
                "An attribute in one table that is a primary key in another, used to link them."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Data Integrity"
    },
    {
      "callout": {
        "t": "def",
        "h": "Integrity Rules",
        "body": [
          {
            "kv": [
              [
                "Entity Integrity",
                "No primary key can be null."
              ],
              [
                "Referential Integrity",
                "Foreign keys must point to valid primary keys."
              ],
              [
                "Domain Integrity",
                "All values in a column must be of the same type."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "sql",
        "cap": "Defining a relational schema.",
        "src": "CREATE TABLE Students (\n    StudentID INT PRIMARY KEY,\n    Name VARCHAR(100)\n);\n\nCREATE TABLE Grades (\n    GradeID INT PRIMARY KEY,\n    StudentID INT,\n    Value CHAR(1),\n    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)\n);"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Keys",
        "body": "A composite key uses multiple attributes as a primary key. A secondary key is used for indexing and searching without being unique."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Relational terminology",
        "body": [
          {
            "table": {
              "head": ["Formal term", "Plain English", "Example"],
              "rows": [
                ["Relation", "Table", "Student"],
                ["Tuple", "Row / Record", "One student's data"],
                ["Attribute", "Column / Field", "StudentID, Name"],
                ["Domain", "Allowed data type/values for an attribute", "Age must be integer 0–120"],
                ["Primary Key", "Unique identifier for a tuple", "StudentID"],
                ["Foreign Key", "Attribute referencing another table's PK", "CourseID in Enrolment"]
              ]
            }
          }
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Primary key must be NOT NULL",
        "body": "Entity integrity: a primary key can never be null, because null means 'unknown' — and you cannot uniquely identify a record by an unknown value."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "\"A foreign key must be unique\"",
        "body": "Foreign keys do **not** need to be unique — a CustomerID can appear many times in an Orders table (one customer, many orders). The uniqueness constraint applies to the **primary key** in the referenced table, not the foreign key."
      }
    }
  ],
  "flashcards": [
    [
      "What is a relation?",
      "A table in a relational database."
    ],
    [
      "What is a tuple?",
      "A row (record) in a relational database table."
    ],
    [
      "What is a primary key?",
      "An attribute (or combination) that uniquely identifies each tuple in a relation."
    ],
    [
      "What is referential integrity?",
      "Ensuring every foreign key value matches an existing primary key in the referenced table."
    ],
    [
      "What is entity integrity?",
      "The rule that no primary key attribute may be null."
    ],
    [
      "What is a composite key?",
      "A primary key made of two or more attributes, needed when no single attribute is unique."
    ]
  ],
  "quiz": [
    {
      "q": "What is another name for a row in a relational database?",
      "opts": [
        "Attribute",
        "Relation",
        "Tuple",
        "Domain"
      ],
      "ans": 2,
      "why": "Rows are called tuples in formal relational terminology."
    },
    {
      "q": "Referential integrity is violated when…",
      "opts": [
        "a primary key is duplicated",
        "a foreign key points to a non-existent primary key",
        "an attribute contains null",
        "two tables have the same name"
      ],
      "ans": 1,
      "why": "A dangling foreign key (pointing to nothing) breaks the link between tables — this is a referential integrity violation."
    },
    {
      "q": "Which key is used in a linking table to resolve a Many-to-Many relationship?",
      "opts": [
        "Secondary key",
        "Candidate key",
        "Composite primary key",
        "Domain key"
      ],
      "ans": 2,
      "why": "The linking table's PK is typically composed of the PKs of both related tables — a composite key."
    }
  ],
  "exam": [
    {
      "q": "Explain why referential integrity is important in a relational database and give an example of it being violated.",
      "marks": 4,
      "ms": [
        "Referential integrity ensures every foreign key value matches an existing primary key in the referenced table (1)",
        "Prevents orphaned records — records that reference data which no longer exists (1)",
        "Also prevents inconsistency across tables / incorrect join results (1)",
        "Example: deleting a Customer whose CustomerID still appears as a FK in the Orders table — creates orphaned orders with no customer (1)"
      ]
    }
  ]
};

C["compsci:4.10.5"] = {
  "notes": [
    {
      "h": "Client-Server Databases & Concurrency"
    },
    {
      "callout": {
        "t": "def",
        "h": "Concurrent Access Issues",
        "body": [
          {
            "kv": [
              [
                "Lost Update",
                "Occurs when two transactions read the same data, modify it, and write it back. The second write overwrites the first, losing it."
              ],
              [
                "Inconsistent Retrieval",
                "One transaction reads data while another is halfway through updating it, resulting in incorrect calculations."
              ],
              [
                "Deadlock",
                "Two transactions are stuck waiting for each other to release a lock on a record."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Concurrency Control Techniques"
    },
    {
      "callout": {
        "t": "def",
        "h": "Preserving Integrity",
        "body": [
          {
            "kv": [
              [
                "Record Locking",
                "A process that prevents other users from accessing a record while it is being updated."
              ],
              [
                "Serialisation",
                "Ensuring that transactions are executed in an order that produces the same result as if they were done one by one."
              ],
              [
                "Timestamp Ordering",
                "Every transaction is given a unique timestamp. If a conflict occurs, the older transaction usually takes precedence."
              ],
              [
                "Commitment Ordering",
                "Ordering transactions based on their dependencies to avoid deadlocks and ensure consistency."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Process: Timestamp Ordering Logic"
    },
    {
      "steps": [
        {
          "h": "1. Read/Write Timestamps",
          "m": "Each record stores the timestamp of the last transaction that read it and the last that wrote to it."
        },
        {
          "h": "2. Conflict Check",
          "m": "If Transaction A tries to write to a record, but Transaction B (which is newer) has already read or written to it, Transaction A is aborted."
        },
        {
          "h": "3. Restart",
          "m": "The aborted transaction is given a new timestamp and restarted."
        }
      ]
    },
    {
      "code": {
        "lang": "sql",
        "cap": "Simulating a transaction with locking in SQL.",
        "src": "BEGIN TRANSACTION;\n\n-- Select with an exclusive lock (PostgreSQL/MySQL style)\nSELECT * FROM Accounts \nWHERE AccountID = 101 \nFOR UPDATE;\n\n-- Update the balance\nUPDATE Accounts \nSET Balance = Balance - 100 \nWHERE AccountID = 101;\n\nCOMMIT; -- Lock is released here"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Deadlock Handling",
        "body": "Deadlocks are inevitable in high-concurrency systems. The DBMS handles this by 'Deadlock Detection' (identifying cycles in a Wait-For Graph) and then 'Victim Selection' (killing one of the transactions to free up the resource)."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Concurrency Control",
        "body": "**Lost Update**: two transactions read the same record → both compute a new value based on original → last write overwrites first (first update lost). **Solution: record locking** — a transaction locks the record until it commits; other transactions must wait. ACID properties ensure correctness: **A**tomicity (all-or-nothing), **C**onsistency, **I**solation (transactions don't interfere), **D**urability."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Concurrency Misconceptions",
        "body": "**Concurrent access always causes data loss** — Only without concurrency control. With proper locking or optimistic concurrency (timestamps), concurrent access is safe. **A record lock prevents other users from reading it** — A shared (read) lock allows concurrent reads; only an exclusive (write) lock blocks both reads and writes from others. Shared locks enable read concurrency."
      }
    }
  ],
  "flashcards": [
    [
      "What is a 'Lost Update'?",
      "A problem where one person's changes to a record are overwritten by another person who was editing at the same time."
    ],
    [
      "Define Record Locking.",
      "The technique of preventing multiple users from modifying the same data simultaneously by 'locking' the record."
    ],
    [
      "How does Timestamp Ordering work?",
      "It assigns a unique timestamp to every transaction; if a transaction tries to access a record updated by a 'newer' transaction, it is rolled back."
    ],
    [
      "What is a Deadlock?",
      "A state where two or more transactions are each waiting for the other to release a lock, causing a permanent stall."
    ],
    [
      "What is Serialisation?",
      "The process of ensuring transactions occur in an order that maintains database consistency."
    ]
  ],
  "quiz": [
    {
      "q": "Which problem occurs when two users both read a balance of £100, both add £50, and the final balance becomes £150 instead of £200?",
      "opts": [
        "Deadlock",
        "Lost Update",
        "Inconsistent Retrieval",
        "Referential Failure"
      ],
      "ans": 1,
      "why": "The first update was 'lost' because the second user didn't see the modified value before saving their own."
    },
    {
      "q": "What is the primary purpose of 'FOR UPDATE' in an SQL query?",
      "opts": [
        "To speed up the search",
        "To delete the record",
        "To place a lock on the selected rows",
        "To format the output"
      ],
      "ans": 2,
      "why": "It signals to the database that these records are about to be modified, preventing others from locking them first."
    },
    {
      "q": "A 'Wait-For Graph' is used by a DBMS to detect...",
      "opts": [
        "Slow queries",
        "Network latency",
        "Deadlocks",
        "User logins"
      ],
      "ans": 2,
      "why": "If a cycle exists in the graph, a deadlock has occurred."
    },
    {
      "q": "Which concurrency method does NOT involve locking records but instead aborts conflicting transactions?",
      "opts": [
        "Record Locking",
        "Serialisation",
        "Timestamp Ordering",
        "Commitment Ordering"
      ],
      "ans": 2,
      "why": "Timestamp ordering allows transactions to proceed but kills them if they violate the temporal rules."
    }
  ],
  "exam": [
    {
      "q": "Explain how record locking can lead to a deadlock and how a database management system might resolve it.",
      "marks": 4,
      "ms": [
        "Deadlock occurs when Transaction A locks Record 1 and waits for Record 2, while Transaction B locks Record 2 and waits for Record 1 (1)",
        "Neither can proceed (1)",
        "DBMS detects the deadlock (e.g. using a graph) (1)",
        "DBMS aborts/rolls back one of the transactions to release its locks (1)"
      ]
    }
  ]
};

C["compsci:4.13.1.1"] = {
  "notes": [
    {
      "h": "The Systems Lifecycle: Analysis"
    },
    {
      "callout": {
        "t": "def",
        "h": "Analysis Phase",
        "body": [
          {
            "kv": [
              [
                "Objective",
                "Understanding the problem and gathering requirements."
              ],
              [
                "Fact-Finding",
                "Interviews, Questionnaires, Observation, Document Analysis."
              ],
              [
                "Outcome",
                "The Requirements Specification document."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Fact-Finding Methods"
    },
    {
      "table": {
        "head": [
          "Method",
          "Pros",
          "Cons"
        ],
        "rows": [
          [
            "Interview",
            "Detailed, flexible",
            "Time-consuming"
          ],
          [
            "Questionnaire",
            "Scalable, quantitative",
            "Rigid, low response rate"
          ],
          [
            "Observation",
            "Objective, realistic",
            "Time-consuming, 'Hawthorne effect'"
          ]
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Simulating a requirements object.",
        "src": "public class Requirement {\n    public int ID { get; set; }\n    public string Description { get; set; }\n    public bool IsMandatory { get; set; }\n}"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Analysis vs Design",
        "body": "Analysis is about WHAT the system should do. Design is about HOW it will do it."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Fact-finding methods: pros and cons",
        "body": [
          {
            "table": {
              "head": ["Method", "Strength", "Weakness"],
              "rows": [
                ["Interview", "Rich detail, open-ended follow-ups", "Time-consuming, one person at a time"],
                ["Questionnaire", "Reaches many people, quantifiable", "Rigid — can't follow up, low response rate"],
                ["Observation", "Reveals actual (not reported) behaviour", "Hawthorne effect, time-consuming"],
                ["Document analysis", "Examines existing forms/reports directly", "May be outdated or incomplete"]
              ]
            }
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Hawthorne Effect",
        "body": "People change their behaviour when they know they're being watched. This means observation may not capture typical working patterns — a key limitation examiners like to test."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Requirements Specification contents",
        "body": [
          {
            "kv": [
              ["Functional requirements", "What the system must DO (features, inputs, outputs, processes)"],
              ["Non-functional requirements", "Constraints the system must satisfy (speed, security, usability, reliability)"],
              ["Scope", "Boundaries — what is and is NOT included in the project"]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Analysis Stage Misconceptions",
        "body": "**The Analysis stage is when programming begins** — No; Analysis is the first stage where requirements are gathered and the existing system is studied. Programming happens in Implementation. Analysis produces a requirements specification (what the system must do), not code. **Analysis and Design are the same stage** — Analysis defines WHAT the system must do; Design defines HOW it will be built (data models, algorithms, interfaces)."
      }
    }
  ],
  "flashcards": [
    [
      "Main output of Analysis?",
      "The Requirements Specification document."
    ],
    [
      "Four fact-finding methods?",
      "Interviews, Questionnaires, Observation, Document Analysis."
    ],
    [
      "What is the Hawthorne Effect?",
      "People behave differently when being observed — weakens the objectivity of observation as a fact-finding method."
    ],
    [
      "Difference between functional and non-functional requirements?",
      "Functional: what the system must do. Non-functional: constraints on how it does it (speed, security, reliability)."
    ],
    [
      "Why is Analysis the most critical lifecycle stage?",
      "Errors here propagate through every subsequent stage — a missing requirement costs far more to fix after implementation."
    ]
  ],
  "quiz": [
    {
      "q": "Which method is best for getting feedback from 5,000 users?",
      "opts": [
        "Interviews",
        "Questionnaires",
        "Observation",
        "Shadowing"
      ],
      "ans": 1,
      "why": "Questionnaires scale best — they can be distributed to thousands simultaneously."
    },
    {
      "q": "A requirement that the system must respond in under 2 seconds is an example of…",
      "opts": [
        "A functional requirement",
        "A non-functional requirement",
        "A design specification",
        "A test case"
      ],
      "ans": 1,
      "why": "Performance constraints are non-functional requirements — they describe how the system should behave, not what it should do."
    },
    {
      "q": "The Hawthorne Effect is most likely to affect which fact-finding method?",
      "opts": [
        "Questionnaires",
        "Document analysis",
        "Observation",
        "Interviews"
      ],
      "ans": 2,
      "why": "People change their behaviour when watched — making observation less representative of normal working patterns."
    }
  ],
  "exam": [
    {
      "q": "Describe two fact-finding methods used during the Analysis phase, giving one advantage and one disadvantage of each.",
      "marks": 6,
      "ms": [
        "Interview (1) — allows detailed open-ended questions / follow-ups (1) — time-consuming / only one person at a time (1)",
        "Questionnaire (1) — can reach many users simultaneously / scalable (1) — rigid format, low response rate, can't follow up unclear answers (1)"
      ]
    }
  ]
};

C["compsci:4.13.1.2"] = {
  "notes": [
    {
      "h": "The Design Stage"
    },
    {
      "callout": {
        "t": "def",
        "h": "Design Objectives",
        "body": [
          {
            "kv": [
              [
                "Data Structures",
                "Deciding how data will be stored (e.g., Arrays, Linked Lists, Hash Tables, SQL Tables)."
              ],
              [
                "Algorithms",
                "Designing the logic for processing data (using pseudo-code or flowcharts)."
              ],
              [
                "Modular Design",
                "Breaking the system into subroutines and modules to improve maintainability."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Visualising Design"
    },
    {
      "callout": {
        "t": "def",
        "h": "Design Tools",
        "body": [
          {
            "kv": [
              [
                "Hierarchy Charts",
                "Show the top-down structure of the program and how modules relate."
              ],
              [
                "Structure Charts",
                "Similar to hierarchy charts but also show data flow between modules."
              ],
              [
                "UI Design",
                "Creating wireframes and prototypes for the human-computer interface (HCI)."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Process: Designing a Module"
    },
    {
      "steps": [
        {
          "h": "1. Input/Output Specification",
          "m": "Define exactly what the module receives and what it must return."
        },
        {
          "h": "2. Algorithm Selection",
          "m": "Choose the most efficient algorithm (e.g., Binary Search vs Linear Search)."
        },
        {
          "h": "3. Interface Design",
          "m": "Design the screen layouts and navigation flow."
        },
        {
          "h": "4. Test Plan",
          "m": "Create test cases for normal, boundary, and erroneous data."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Planning a Class Structure (Design phase).",
        "src": "/* \n   DESIGN SPECIFICATION:\n   Class: UserAccount\n   Properties: Username (String), PasswordHash (String), Balance (Decimal)\n   Methods: Deposit(amount), Withdraw(amount), Authenticate(pwd)\n*/\n\npublic class UserAccount {\n    private string username;\n    public void Deposit(decimal amount) { /* Logic */ }\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Hierarchy Charts",
        "body": "In AQA exams, remember that hierarchy charts do NOT show the sequence of execution. They only show which modules are contained within others. Flowcharts or pseudo-code are used for sequence."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Design Stage Outputs",
        "body": "Design produces: **data models** (ER diagrams, normalised tables, data dictionary), **algorithm design** (flowcharts, pseudocode, structure charts), **interface prototypes** (wireframes, screen layouts), **test plans** (what to test and expected outcomes). Must be detailed enough for implementation without further client consultation."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Design Stage Misconceptions",
        "body": "**The Design stage is when you write the actual code** — No; Design produces specifications and blueprints (pseudocode, ER diagrams, interface sketches) for programmers to follow during Implementation. **A prototype in the Design stage is working software** — Prototypes at this stage are mock-ups (wireframes, paper prototypes) to agree on the interface — not functional programs."
      }
    }
  ],
  "flashcards": [
    [
      "What is the purpose of the Design stage?",
      "To plan the technical solution including data structures, algorithms, and UI before coding begins."
    ],
    [
      "What does a Hierarchy Chart show?",
      "The top-down structure of a program, showing how it is broken into sub-modules."
    ],
    [
      "Name three components of a Test Plan.",
      "Test data (Normal, Boundary, Erroneous), Expected Outcome, Actual Outcome."
    ],
    [
      "What is Modular Design?",
      "The technique of breaking a large system into smaller, independent sub-routines."
    ],
    [
      "Difference between Hierarchy Chart and Flowchart?",
      "Hierarchy chart shows structure; Flowchart shows logic/sequence of execution."
    ]
  ],
  "quiz": [
    {
      "q": "Which tool is best for showing the relationship between modules in a large program?",
      "opts": [
        "Flowchart",
        "Hierarchy Chart",
        "Trace Table",
        "Truth Table"
      ],
      "ans": 1,
      "why": "Hierarchy charts represent the modular structure of the system."
    },
    {
      "q": "At what stage should the Test Plan be created?",
      "opts": [
        "Analysis",
        "Design",
        "Implementation",
        "Testing"
      ],
      "ans": 1,
      "why": "Designing the tests before coding ensures the requirements are fully understood."
    },
    {
      "q": "What kind of test data is 0 or 100 in a system that accepts percentages?",
      "opts": [
        "Normal",
        "Erroneous",
        "Boundary",
        "Invalid"
      ],
      "ans": 2,
      "why": "Boundary data is at the very limits of the valid range."
    },
    {
      "q": "What is an HCI?",
      "opts": [
        "High-level Code Interface",
        "Human-Computer Interface",
        "Hierarchical Command Input",
        "Hard-Coded Instance"
      ],
      "ans": 1,
      "why": "HCI refers to the design of the user interface and how humans interact with the software."
    }
  ],
  "exam": [
    {
      "q": "State three items that would be included in the design specification for a new software system.",
      "marks": 3,
      "ms": [
        "Data structures / Database schema (1)",
        "Algorithm designs / Pseudo-code (1)",
        "User Interface designs / Wireframes (1)",
        "Test Plan / Strategy (1)",
        "Hierarchy charts (1)"
      ]
    }
  ]
};

C["compsci:4.13.1.3"] = {
  "notes": [
    {
      "h": "The Implementation Stage"
    },
    {
      "callout": {
        "t": "def",
        "h": "Coding & Development",
        "body": [
          {
            "kv": [
              [
                "Modular Development",
                "Coding each module independently, allowing for parallel work and easier debugging."
              ],
              [
                "Versioning",
                "Using tools like Git to track changes and manage different versions of the code."
              ],
              [
                "Agile Approaches",
                "Iterative development where requirements and solutions evolve through collaboration."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "The Debugging Process"
    },
    {
      "callout": {
        "t": "def",
        "h": "Debugging Tools",
        "body": [
          {
            "kv": [
              [
                "Breakpoints",
                "Pausing execution at a specific line to inspect variables."
              ],
              [
                "Stepping",
                "Executing the code line-by-line (Step Into/Over) to trace logic."
              ],
              [
                "Variable Watch",
                "Monitoring the value of specific variables in real-time as the code runs."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Process: From Code to Executable"
    },
    {
      "steps": [
        {
          "h": "1. Writing Code",
          "m": "Following the design specifications and coding standards."
        },
        {
          "h": "2. Compilation/Interpretation",
          "m": "Translating source code into machine code or intermediate byte-code."
        },
        {
          "h": "3. Unit Testing",
          "m": "Testing individual modules for correctness immediately after coding."
        },
        {
          "h": "4. Integration",
          "m": "Combining modules to ensure they work together correctly."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Clean Implementation: Using comments and meaningful names.",
        "src": "// Method to calculate annual interest\npublic decimal CalculateInterest(decimal balance, decimal rate) \n{\n    if (rate < 0) throw new ArgumentException(\"Rate cannot be negative\");\n    return balance * (rate / 100);\n}"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Agile vs Waterfall",
        "body": "Implementation in Waterfall happens in one big block after Design. In Agile, Implementation is a repeating loop that includes Analysis and Design for small chunks of the project."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Implementation Stage",
        "body": "Implementation: code is written to design specifications, database tables are created, test data is prepared. **Unit testing** occurs alongside (test each module/function independently). **Integration testing**: modules combined and tested together. Documentation written: **technical** (for maintainers — code structure, API) and **user** (for end users — how to operate)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Implementation Misconceptions",
        "body": "**Implementation only means writing code** — Implementation includes writing code, setting up databases, preparing test data, performing unit tests, and writing documentation. **Testing is only done after all code is written** — Unit testing is done during implementation, testing each module as it is built. Full system/integration testing happens after implementation."
      }
    }
  ],
  "flashcards": [
    [
      "What is the primary activity of the Implementation phase?",
      "Writing the actual source code and developing the system."
    ],
    [
      "Define Unit Testing.",
      "Testing individual subroutines or modules in isolation to ensure they work correctly."
    ],
    [
      "What is a Breakpoint?",
      "An intentional stopping point in the code used for debugging and inspecting variables."
    ],
    [
      "What is the benefit of Modular Development?",
      "It allows multiple programmers to work on different parts of the system simultaneously."
    ],
    [
      "Explain 'Dry Run' testing.",
      "Mentally or on paper tracing the execution of an algorithm using a trace table."
    ]
  ],
  "quiz": [
    {
      "q": "Which tool allows a programmer to see the value of a variable changing as they execute the code line-by-line?",
      "opts": [
        "Compiler",
        "Watch Window",
        "Linker",
        "Text Editor"
      ],
      "ans": 1,
      "why": "A watch window monitors specific variables during the debugging process."
    },
    {
      "q": "What is 'Modular Development'?",
      "opts": [
        "Writing the whole program in one file",
        "Breaking the program into smaller, separate components",
        "Using only one data type",
        "Automatic code generation"
      ],
      "ans": 1,
      "why": "Modular development simplifies complex systems by splitting them into manageable units."
    },
    {
      "q": "When does 'Integration Testing' occur?",
      "opts": [
        "Before coding",
        "After individual units are tested and combined",
        "During Analysis",
        "After the product is sold"
      ],
      "ans": 1,
      "why": "Integration testing ensures that separate modules interact correctly once combined."
    },
    {
      "q": "Which development methodology is highly iterative and involves frequent releases?",
      "opts": [
        "Waterfall",
        "Agile",
        "Linear",
        "Structured"
      ],
      "ans": 1,
      "why": "Agile focuses on rapid, iterative cycles and continuous feedback."
    }
  ],
  "exam": [
    {
      "q": "Explain two features of a modern IDE that help a programmer during the implementation stage.",
      "marks": 4,
      "ms": [
        "Syntax Highlighting (1) - makes it easier to spot errors in keywords/brackets (1)",
        "Auto-completion/Intellisense (1) - speeds up coding and prevents typos (1)",
        "Debugger/Breakpoints (1) - allows step-by-step execution to find logical errors (1)"
      ]
    }
  ]
};

C["compsci:4.13.1.4"] = {
  "notes": [
    {
      "h": "Testing"
    },
    "The system must be tested to ensure it is robust, error-free, and efficient. Testing involves both manual tracing and automated execution with diverse data sets.",
    {
      "callout": {
        "t": "def",
        "h": "Types of Test Data",
        "body": [
          {
            "kv": [
              [
                "Normal Data",
                "Typical data the system is expected to handle regularly (e.g. 50 for a 0-100 range)."
              ],
              [
                "Boundary Data",
                "Values at the edge of acceptable ranges (e.g. 0 and 100)."
              ],
              [
                "Erroneous Data",
                "Data that should be rejected by the system (e.g. -5, 'abc', 101)."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Efficiency Testing"
    },
    "Efficiency is tested using logical reasoning and time/space complexity analysis. A program that works correctly but takes 10 minutes to process one item is considered inefficient.",
    {
      "code": {
        "lang": "csharp",
        "cap": "A C# Unit Test example.",
        "src": "[Test]\npublic void TestScoreBoundary() {\n    Assert.IsTrue(System.Validate(100)); // Boundary\n    Assert.IsFalse(System.Validate(101)); // Erroneous\n}"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Test Data Types",
        "body": "Three categories: **Normal** (valid, typical data the system should accept), **Boundary** (data at the exact edge of valid range — just inside and just outside), **Erroneous** (clearly invalid data that must be rejected — wrong type, outside valid range entirely). Test plan specifies: input data, expected output, actual output, pass/fail."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Testing Misconceptions",
        "body": "**Boundary data is the same as erroneous data** — No: boundary data is at the edge of the valid range (if max = 100, test 99, 100 = boundary; 101 = erroneous). **Testing proves a program is correct** — Testing can only reveal bugs; it cannot prove their absence (Dijkstra). Even after extensive testing, undiscovered bugs may exist in untested paths."
      }
    }
  ],
  "flashcards": [
    [
      "Define 'Normal Data' in testing.",
      "Values that are within the expected range and should be processed correctly."
    ],
    [
      "Define 'Boundary Data'.",
      "Values at the extreme limits of the acceptable range (minimum and maximum)."
    ],
    [
      "Define 'Erroneous Data'.",
      "Data that is of the wrong type or outside the allowed range; should be rejected."
    ],
    [
      "Why test for efficiency?",
      "To ensure the system doesn't waste CPU time or memory, especially for large datasets."
    ],
    [
      "What is logic-based testing?",
      "Using reasoning to prove that the code will execute in a certain number of steps (Big O analysis)."
    ]
  ],
  "quiz": [
    {
      "q": "Testing a range of 1 to 10 with the value '11' is an example of...",
      "opts": [
        "Normal data",
        "Boundary data",
        "Erroneous data",
        "Recursive data"
      ],
      "ans": 2,
      "why": "11 is outside the allowed range."
    },
    {
      "q": "Which value is boundary data for a 'percentage' field (0-100)?",
      "opts": [
        "50",
        "0",
        "101",
        "-1"
      ],
      "ans": 1,
      "why": "0 is at the extreme edge of the valid range."
    },
    {
      "q": "Efficiency testing primarily looks at...",
      "opts": [
        "Visual colors",
        "Execution speed and memory usage",
        "Number of comments",
        "Font size"
      ],
      "ans": 1,
      "why": "Efficiency is about resource consumption."
    },
    {
      "q": "Who should perform final testing?",
      "opts": [
        "Only the programmer",
        "A mix of developers and intended users",
        "The computer",
        "The CEO"
      ],
      "ans": 1,
      "why": "User testing (Alpha/Beta) is vital for validation."
    }
  ],
  "exam": [
    {
      "q": "A system accepts integers between 50 and 100 inclusive. Identify one boundary and one erroneous test case for this system.",
      "marks": 2,
      "ms": [
        "Boundary: 50 or 100 (1)",
        "Erroneous: 49, 101, or any non-integer (1)"
      ]
    }
  ]
};

C["compsci:4.13.1.5"] = {
  "notes": [
    {
      "h": "Evaluation"
    },
    "Evaluation is the final stage where the solution is measured against the initial requirements identified in the Analysis phase.",
    {
      "callout": {
        "t": "def",
        "h": "Key Evaluation Criteria",
        "body": [
          {
            "kv": [
              [
                "Effectiveness",
                "Does the system solve the user's problem?"
              ],
              [
                "Efficiency",
                "Does it use minimal resources?"
              ],
              [
                "Usability",
                "How easy and intuitive is the system for the end user?"
              ],
              [
                "Maintainability",
                "How easy is it to update or fix in the future?"
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "Evaluation often leads back to a new cycle of Analysis if the requirements have changed or were not fully met."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Evaluation Criteria",
        "body": "Evaluation assesses: **effectiveness** (does it meet requirements?), **efficiency** (performance), **maintainability** (how easy to update/fix), **usability** (user feedback, ease of use), **fitness for purpose** (comparison to original acceptance criteria). May lead to further development in an iterative lifecycle."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Evaluation Misconceptions",
        "body": "**Evaluation means fixing remaining bugs** — No; bug fixing occurs in Testing/Maintenance. Evaluation judges how well the completed system meets its requirements specification and gathers user feedback. **Evaluation is the final stage — no more changes are made** — Evaluation may reveal the system falls short, leading to further iterations of the entire lifecycle (spiral/iterative model)."
      }
    }
  ],
  "flashcards": [
    [
      "What is the primary goal of Evaluation?",
      "To determine if the system meets the original requirements."
    ],
    [
      "What is Usability?",
      "The ease with which a user can interact with the system to achieve their goals."
    ],
    [
      "Define Effectiveness.",
      "The extent to which the system successfully performs its intended tasks."
    ],
    [
      "What is Maintainability?",
      "How easily a system can be modified to fix bugs or add features."
    ],
    [
      "Where do the evaluation criteria come from?",
      "The requirements documented during the Analysis phase."
    ]
  ],
  "quiz": [
    {
      "q": "Evaluation compares the final system against...",
      "opts": [
        "The code of a competitor",
        "The initial requirements",
        "The price of the hardware",
        "The current date"
      ],
      "ans": 1,
      "why": "Success is measured by requirement fulfillment."
    },
    {
      "q": "If a system is hard to use, it has poor...",
      "opts": [
        "Effectiveness",
        "Maintainability",
        "Usability",
        "Security"
      ],
      "ans": 2,
      "why": "Usability is about the user experience."
    },
    {
      "q": "Evaluation is the...",
      "opts": [
        "First stage",
        "Middle stage",
        "Final stage",
        "Illegal stage"
      ],
      "ans": 2,
      "why": "It concludes the current development cycle."
    },
    {
      "q": "A 'Critical Review' is part of...",
      "opts": [
        "Analysis",
        "Implementation",
        "Evaluation",
        "Coding"
      ],
      "ans": 2,
      "why": "Evaluating the success of the project."
    }
  ],
  "exam": [
    {
      "q": "State three criteria that could be used to evaluate a newly developed software system. (3 marks)",
      "marks": 3,
      "ms": [
        "Fulfillment of requirements (1)",
        "System efficiency/performance (1)",
        "Usability for the end user (1)",
        "Maintainability of the code (max 3)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);