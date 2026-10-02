/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

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