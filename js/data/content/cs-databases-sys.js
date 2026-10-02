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
    ],
    [
      "What is a programming paradigm?",
      "A style/approach to structuring programs — e.g. procedural (sequenced subroutines acting on data) or object-oriented (objects bundling data + methods)."
    ],
    [
      "Key feature of the procedural paradigm?",
      "Programs are built from procedures/subroutines executed in sequence, operating on separate data."
    ],
    [
      "Key feature of the object-oriented paradigm?",
      "Data and the methods that act on it are bundled into objects (encapsulation), supporting inheritance and polymorphism."
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
    },
    {
      "q": "Which paradigm bundles data and behaviour together into objects?",
      "opts": ["procedural", "object-oriented", "declarative", "assembly"],
      "ans": 1,
      "why": "OOP encapsulates data with the methods that operate on it inside objects."
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
    },
    {
      "q": "State two differences between the procedural and object-oriented paradigms.",
      "marks": 3,
      "ms": [
        "Procedural separates data from the procedures that act on it; OOP bundles them in objects (1)",
        "OOP supports inheritance and polymorphism; procedural does not (1)",
        "OOP models real-world entities; procedural is task/sequence focused (1) (max 3)"
      ]
    },
    {
      "q": "Discuss the procedural and object-oriented paradigms, and recommend which suits a large team building a complex, evolving system.",
      "marks": 6,
      "ms": [
        "Procedural: programs as sequences of subroutines acting on shared data (1)",
        "Simple and efficient for small, well-defined tasks (1)",
        "OOP: data + methods bundled into objects (encapsulation) (1)",
        "Inheritance/polymorphism aid reuse and extension (1)",
        "OOP's modularity/encapsulation suits large teams and changing requirements (1)",
        "Recommend OOP for a large, evolving system; procedural for small scripts (1)"
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
    ],
    [
      "What is a hierarchy chart?",
      "A top-down diagram breaking a problem into modules/subroutines, showing which calls which."
    ],
    [
      "What does the 'structured approach' mean?",
      "Designing top-down by decomposing a problem into modules using only sequence, selection and iteration."
    ],
    [
      "Difference between coupling and cohesion?",
      "Coupling = interdependence between modules (want LOW); cohesion = how focused a module is on one task (want HIGH)."
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
    },
    {
      "q": "A hierarchy chart is read...?",
      "opts": ["bottom-up", "top-down (general task down to detailed sub-tasks)", "left to right only", "in execution order"],
      "ans": 1,
      "why": "Hierarchy charts decompose the overall task downward into sub-tasks/modules."
    },
    {
      "q": "Good modular design aims for...?",
      "opts": ["high coupling, low cohesion", "low coupling, high cohesion", "high coupling, high cohesion", "low coupling, low cohesion"],
      "ans": 1,
      "why": "Modules should be independent (low coupling) and each focused on one task (high cohesion)."
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
    },
    {
      "q": "Explain two advantages of a modular, structured approach to program design.",
      "marks": 3,
      "ms": [
        "Modules can be developed and tested independently (1)",
        "Code is reusable across the program / other projects (1)",
        "Easier to maintain and understand (decomposition) (1) (max 3)"
      ]
    },
    {
      "q": "Discuss how a structured, modular approach using hierarchy charts benefits the development of a large program.",
      "marks": 6,
      "ms": [
        "A hierarchy chart decomposes the problem top-down into modules (1)",
        "Each module performs one identifiable task (high cohesion) (1)",
        "Modules can be assigned to different developers and built in parallel (1)",
        "and tested independently before integration (1)",
        "Reuse: common modules called from many places reduce duplication (1)",
        "Maintenance: a change is localised to one module (low coupling) (1)"
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
    ],
    [
      "What is a 1-D array?",
      "An ordered, indexed collection of elements of the same type, accessed by a single index."
    ],
    [
      "What is a 2-D array?",
      "A table of elements accessed by two indices (row, column) — conceptually an array of arrays."
    ],
    [
      "One advantage and one limitation of arrays?",
      "Advantage: O(1) direct access by index. Limitation: fixed size and a single (homogeneous) element type."
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
    },
    {
      "q": "A 5×3 array is stored row-major (1-byte elements). Where is element [2][1] relative to the base?",
      "opts": ["+5", "+6", "+7", "+11"],
      "ans": 2,
      "why": "Offset = (row × cols + col) = (2 × 3 + 1) = 7, so base + 7."
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
    },
    {
      "q": "An array Temps[1..7] holds a week's temperatures. Write pseudocode to total them.",
      "marks": 3,
      "ms": [
        "total ← 0 (1)",
        "FOR i ← 1 TO 7: total ← total + Temps[i] (1)",
        "ENDFOR; OUTPUT total (1)"
      ]
    },
    {
      "q": "Explain how a 2-D array represents a grid, how its elements are addressed, and give one advantage and one limitation of arrays.",
      "marks": 6,
      "ms": [
        "A 2-D array is indexed by [row][column] (1)",
        "Stored contiguously, e.g. row-major (1)",
        "Element address = base + (row × cols + col) × elementSize (1)",
        "Advantage: O(1) direct access by index (1)",
        "Advantage: simple, predictable memory layout (1)",
        "Limitation: fixed size / homogeneous type — can't grow or mix types (1)"
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
    ],
    [
      "What is an abstract data type (ADT)?",
      "A logical description of data and the operations on it, independent of the underlying implementation."
    ],
    [
      "Difference between a static and a dynamic data structure?",
      "Static: fixed size set in advance (e.g. an array). Dynamic: grows/shrinks at runtime (e.g. a linked list)."
    ],
    [
      "Which ADT is FIFO and which is LIFO?",
      "A queue is FIFO (first in, first out); a stack is LIFO (last in, first out)."
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
    },
    {
      "q": "A static data structure...?",
      "opts": ["grows and shrinks at runtime", "has a fixed size set in advance", "always uses pointers", "cannot be an array"],
      "ans": 1,
      "why": "Static structures (e.g. arrays) have a fixed size; dynamic ones resize at runtime."
    },
    {
      "q": "Which ADT best models a print queue?",
      "opts": ["stack", "queue", "tree", "hash table"],
      "ans": 1,
      "why": "Print jobs are served first-come-first-served — FIFO, a queue."
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
    },
    {
      "q": "Define 'abstract data type' and state one benefit of programming to an ADT rather than a concrete structure.",
      "marks": 3,
      "ms": [
        "An ADT defines the data and its operations independently of implementation (1)",
        "Benefit: the implementation (array vs linked list) can change without affecting code that uses it (1)",
        "Benefit: simpler reasoning via a defined interface (1) (max 3)"
      ]
    },
    {
      "q": "Compare static and dynamic data structures, giving an example of each and discussing the memory and flexibility trade-offs.",
      "marks": 6,
      "ms": [
        "Static: fixed size decided in advance (1); e.g. an array (1)",
        "Dynamic: size changes at runtime (1); e.g. a linked list (1)",
        "Static uses contiguous memory with fast indexed access but wastes/overflows if mis-sized (1)",
        "Dynamic uses pointers — flexible but more memory per element and no O(1) indexing (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);