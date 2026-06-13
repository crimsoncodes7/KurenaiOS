/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.3.1.1"] = {
  "notes": [
    {
      "h": "Graph traversal: one algorithm, two frontiers"
    },
    {
      "callout": {
        "t": "def",
        "h": "Core Terminology",
        "body": [
          {
            "kv": [
              [
                "Traversal",
                "The process of visiting every vertex in a graph systematically."
              ],
              [
                "Frontier",
                "The set of vertices discovered but not yet fully explored."
              ],
              [
                "DFS (Depth-First)",
                "Explores as far as possible along each branch before backtracking."
              ],
              [
                "BFS (Breadth-First)",
                "Explores all neighbor nodes at the present depth before moving to the next level."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "The Skeleton Rule",
        "body": "DFS and BFS are the **same skeleton** — visit, record, explore neighbours — differing only in the structure holding the frontier. That one sentence organises everything else."
      }
    },
    {
      "table": {
        "head": [
          "Feature",
          "Depth-first (DFS)",
          "Breadth-first (BFS)"
        ],
        "rows": [
          [
            "Frontier structure",
            "Stack (or recursion's call stack)",
            "Queue"
          ],
          [
            "Exploration shape",
            "Plunge down one path, backtrack",
            "Expand outward level by level"
          ],
          [
            "Classic applications",
            "Maze navigation, cycle detection, topological-style problems",
            "Shortest path on UNWEIGHTED graphs, nearest-neighbour searches"
          ],
          [
            "Performance fact",
            "Memory-efficient on narrow trees",
            "Guarantees shortest path (unweighted)"
          ]
        ]
      }
    },
    {
      "h": "Trace technique that earns method marks"
    },
    {
      "steps": [
        {
          "h": "Set up columns",
          "m": "visited list | frontier (stack/queue) | current vertex",
          "n": "Tick the question's order rule (usually alphabetical) for neighbours."
        },
        {
          "h": "Iterate",
          "m": "pop/dequeue \rightarrow mark visited \rightarrow push/enqueue unvisited neighbours (in stated order)"
        },
        {
          "h": "Terminate",
          "m": "frontier empty \rightarrow visited list IS the traversal order"
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Graph Traversal in C# using Adjacency List.",
        "src": "public class Graph {\n    public void BFS(int start, List<int>[] adj) {\n        bool[] visited = new bool[adj.Length];\n        Queue<int> queue = new Queue<int>();\n        visited[start] = true;\n        queue.Enqueue(start);\n        while (queue.Count > 0) {\n            int v = queue.Dequeue();\n            Console.Write(v + \" \");\n            foreach (int n in adj[v]) {\n                if (!visited[n]) {\n                    visited[n] = true;\n                    queue.Enqueue(n);\n                }\n            }\n        }\n    }\n\n    public void DFS(int start, List<int>[] adj) {\n        bool[] visited = new bool[adj.Length];\n        Stack<int> stack = new Stack<int>();\n        stack.Push(start);\n        while (stack.Count > 0) {\n            int v = stack.Pop();\n            if (!visited[v]) {\n                visited[v] = true;\n                Console.Write(v + \" \");\n                foreach (int n in adj[v]) {\n                    if (!visited[n]) stack.Push(n);\n                }\n            }\n        }\n    }\n}"
      }
    },
    {
      "callout": {
        "t": "mnemonic",
        "body": "**DFS = Deep, Stack. BFS = Broad, Queue.** Alliteration carries the structural fact — and that fact alone is frequently a full mark."
      }
    }
  ],
  "flashcards": [
    [
      "Which structure drives DFS, and which BFS?",
      "DFS: a stack (or recursion). BFS: a queue."
    ],
    [
      "Why does BFS find shortest paths on unweighted graphs?",
      "It explores in expanding rings: all vertices at distance k are visited before any at distance k+1."
    ],
    [
      "One classic DFS application?",
      "Navigating a maze / checking whether a path exists (also cycle detection)."
    ],
    [
      "When does a traversal terminate?",
      "When the frontier (stack/queue) is empty — every reachable vertex has been visited."
    ]
  ],
  "quiz": [
    {
      "q": "Replacing the queue in BFS with a stack gives you…",
      "opts": [
        "Dijkstra",
        "DFS",
        "a syntax error",
        "merge sort"
      ],
      "ans": 1,
      "why": "Same skeleton, different frontier — the single most quotable fact here."
    },
    {
      "q": "Shortest route in an UNWEIGHTED network is found by…",
      "opts": [
        "DFS",
        "BFS",
        "binary search",
        "bubble sort"
      ],
      "ans": 1,
      "why": "Level-by-level expansion reaches a vertex first via a fewest-edges path."
    },
    {
      "q": "DFS on a deep graph risks…",
      "opts": [
        "queue overflow",
        "stack overflow (deep recursion)",
        "losing FIFO order",
        "hashing collisions"
      ],
      "ans": 1,
      "why": "Each level deeper is another frame on the call stack."
    }
  ],
  "exam": [
    {
      "q": "Explain how a breadth-first search of a graph operates, naming the data structure used and why the algorithm visits vertices in the order it does.",
      "marks": 4,
      "ms": [
        "Start vertex marked visited and enqueued (1)",
        "Repeatedly dequeue a vertex and enqueue its unvisited neighbours, marking them visited (1)",
        "Queue (FIFO) named as the supporting structure (1)",
        "FIFO means vertices discovered earlier are explored earlier \rightarrow level-by-level / increasing distance order (1)"
      ]
    }
  ],
  "sims": [
    "tl-queue",
    "tl-stack"
  ]
};

C["compsci:4.3.2.1"] = {
  "notes": [
    {
      "h": "Tree traversals: Visiting every node"
    },
    {
      "callout": {
        "t": "def",
        "h": "Features",
        "body": [
          {
            "kv": [
              [
                "Pre-order",
                "Node \rightarrow Left Subtree \rightarrow Right Subtree"
              ],
              [
                "In-order",
                "Left Subtree \rightarrow Node \rightarrow Right Subtree"
              ],
              [
                "Post-order",
                "Left Subtree \rightarrow Right Subtree \rightarrow Node"
              ],
              [
                "BST (Binary Search Tree)",
                "A tree where left < node and right > node."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Traversal",
          "Recipe",
          "Signature use"
        ],
        "rows": [
          [
            "Pre-order",
            "NLR",
            "Copying a tree; producing prefix notation"
          ],
          [
            "In-order",
            "LNR",
            "BST \rightarrow outputs values in ascending sorted order"
          ],
          [
            "Post-order",
            "LRN",
            "RPN from syntax trees; safe deletion (children before parent)"
          ]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "The Dot Trick",
          "m": "Draw a path around the tree starting at the root's left.",
          "n": "Pre-order: dot on left. In-order: dot below. Post-order: dot on right."
        },
        {
          "h": "Execution",
          "m": "Traverse the outline anticlockwise.",
          "n": "Read the values as you pass their respective dots."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Recursive Tree Traversals in C#.",
        "src": "public class Node {\n    public int Value; public Node Left, Right;\n    public Node(int v) { Value = v; }\n}\n\npublic class Tree {\n    public void PreOrder(Node n) {\n        if (n == null) return;\n        Console.Write(n.Value + \" \");\n        PreOrder(n.Left);\n        PreOrder(n.Right);\n    }\n    public void InOrder(Node n) {\n        if (n == null) return;\n        InOrder(n.Left);\n        Console.Write(n.Value + \" \");\n        InOrder(n.Right);\n    }\n    public void PostOrder(Node n) {\n        if (n == null) return;\n        PostOrder(n.Left);\n        PostOrder(n.Right);\n        Console.Write(n.Value + \" \");\n    }\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "Syntax-tree questions: **post-order emits RPN**, pre-order emits prefix, in-order (with brackets) emits ordinary infix."
      }
    }
  ],
  "flashcards": [
    [
      "Recipes for pre/in/post-order?",
      "Pre: Node-Left-Right. In: Left-Node-Right. Post: Left-Right-Node."
    ],
    [
      "Why is in-order on a BST special?",
      "It outputs the stored values in ascending sorted order."
    ],
    [
      "Which traversal converts a syntax tree to RPN?",
      "Post-order — operands appear before their operator."
    ],
    [
      "Why is post-order right for deleting a tree?",
      "Children are processed before their parent, so nothing is orphaned mid-deletion."
    ]
  ],
  "quiz": [
    {
      "q": "For root A with children B (left) and C (right), pre-order gives…",
      "opts": [
        "B A C",
        "A B C",
        "B C A",
        "C B A"
      ],
      "ans": 1,
      "why": "Node first: A, then left subtree B, then right C."
    },
    {
      "q": "A traversal of a BST outputs 3, 7, 12, 19, 25. Which was it?",
      "opts": [
        "Pre-order",
        "Post-order",
        "In-order",
        "Breadth-first"
      ],
      "ans": 2,
      "why": "Ascending order is the in-order fingerprint on a BST."
    }
  ],
  "exam": [
    {
      "q": "A binary tree has root 8; 3 (left child of 8) with children 1 and 6; 10 (right child of 8) with right child 14. Give the pre-order and post-order traversals.",
      "marks": 4,
      "ms": [
        "Pre-order: 8, 3, 1, 6, 10, 14 (2)",
        "Post-order: 1, 6, 3, 14, 10, 8 (2)"
      ]
    }
  ],
  "sims": [
    "tl-tree"
  ]
};

C["compsci:4.3.3.1"] = {
  "notes": [
    {
      "h": "Reverse Polish Notation (RPN)"
    },
    {
      "callout": {
        "t": "def",
        "h": "Key Concepts",
        "body": [
          {
            "kv": [
              [
                "Infix",
                "Standard notation: operator between operands (e.g., A + B)."
              ],
              [
                "Postfix (RPN)",
                "Operator follows operands (e.g., A B +)."
              ],
              [
                "Stack",
                "The primary data structure used for RPN evaluation."
              ],
              [
                "Precedence",
                "The order of operations (eliminated in RPN)."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Feature",
          "Infix",
          "RPN (Postfix)"
        ],
        "rows": [
          [
            "Brackets",
            "Required for complex orders",
            "Never required"
          ],
          [
            "Precedence",
            "BODMAS/PEMDAS used",
            "Implicit in position"
          ],
          [
            "Evaluation",
            "Multiple passes often needed",
            "Single left-to-right pass"
          ],
          [
            "Machine use",
            "Needs parsing to trees",
            "Native to stack machines"
          ]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Evaluation Algorithm",
          "m": "Read expression left to right.",
          "n": "Operand: PUSH to stack."
        },
        {
          "h": "Operation",
          "m": "Operator: POP twice, apply (Second OP First), PUSH result.",
          "n": "Crucial: The first value popped is the RIGHT operand."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Simple RPN Evaluator in C#.",
        "src": "int EvaluateRPN(string[] tokens) {\n    Stack<int> s = new Stack<int>();\n    foreach (string t in tokens) {\n        if (int.TryParse(t, out int n)) s.Push(n);\n        else {\n            int op2 = s.Pop();\n            int op1 = s.Pop();\n            if (t == \"+\") s.Push(op1 + op2);\n            else if (t == \"-\") s.Push(op1 - op2);\n            else if (t == \"*\") s.Push(op1 * op2);\n            else if (t == \"/\") s.Push(op1 / op2);\n        }\n    }\n    return s.Pop();\n}"
      }
    },
    {
      "callout": {
        "t": "warn",
        "body": "For − and ÷ the FIRST value popped is the RIGHT-hand operand: a b − means a − b."
      }
    }
  ],
  "flashcards": [
    [
      "Define RPN.",
      "Postfix notation: operators follow their operands, removing any need for brackets or precedence rules."
    ],
    [
      "Stack rules for evaluating RPN?",
      "Operands push; an operator pops two, applies second-popped OP first-popped, pushes the result."
    ],
    [
      "Link between trees and RPN?",
      "Post-order traversal of a syntax tree emits the RPN of the expression."
    ]
  ],
  "quiz": [
    {
      "q": "RPN of (7 − 2) \times 3?",
      "opts": [
        "7 2 3 − \times",
        "7 2 − 3 \times",
        "\times − 7 2 3",
        "7 − 2 \times 3"
      ],
      "ans": 1,
      "why": "((7−2)\times3) \rightarrow operator after each closing bracket."
    }
  ],
  "exam": [
    {
      "q": "Convert (5 + 3) \times (8 − 6) to RPN and evaluate using a stack.",
      "marks": 6,
      "ms": [
        "RPN: 5 3 + 8 6 − \times (2)",
        "Evaluation steps with stack contents shown (4)"
      ]
    }
  ]
};

C["compsci:4.3.4.2"] = {
  "notes": [
    {
      "h": "Binary search: The logarithmic divide"
    },
    {
      "callout": {
        "t": "def",
        "h": "Requirements & Logic",
        "body": [
          {
            "kv": [
              [
                "Precondition",
                "Data must be sorted (ascending or descending)."
              ],
              [
                "Strategy",
                "Divide and conquer: halve the search space each step."
              ],
              [
                "Complexity",
                "O(log n) time - extremely fast for large datasets."
              ],
              [
                "Pointers",
                "low (start), high (end), mid (pivot)."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Comparison",
          "Linear Search",
          "Binary Search"
        ],
        "rows": [
          [
            "Best Case",
            "O(1) - first item",
            "O(1) - middle item"
          ],
          [
            "Worst Case",
            "O(n)",
            "O(log n)"
          ],
          [
            "Data Order",
            "Unsorted or Sorted",
            "Must be Sorted"
          ],
          [
            "Effort",
            "Slow on large lists",
            "Very efficient on large lists"
          ]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Initialise",
          "m": "low = 0, high = list.length - 1",
          "n": "Check if low <= high."
        },
        {
          "h": "Pivot",
          "m": "mid = (low + high) / 2",
          "n": "Compare list[mid] with target."
        },
        {
          "h": "Adjust",
          "m": "If target < mid: high = mid - 1. If target > mid: low = mid + 1.",
          "n": "Repeat until found or range empty."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Iterative Binary Search in C#.",
        "src": "int BinarySearch(int[] arr, int target) {\n    int low = 0, high = arr.Length - 1;\n    while (low <= high) {\n        int mid = (low + high) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "Each comparison halves the remaining search space, so k comparisons handle 2^k items."
      }
    }
  ],
  "flashcards": [
    [
      "Precondition for binary search?",
      "The data must be sorted."
    ],
    [
      "Pointer updates after comparing a[mid]?",
      "Too small: low ← mid + 1. Too big: high ← mid − 1."
    ],
    [
      "Time complexities: linear vs binary?",
      "Linear O(n); binary O(log n)."
    ]
  ],
  "quiz": [
    {
      "q": "Worst-case comparisons for binary search on 1024 sorted items \approx",
      "opts": [
        "1024",
        "512",
        "10",
        "2"
      ],
      "ans": 2,
      "why": "log_2 1024 = 10 halvings."
    }
  ],
  "exam": [
    {
      "q": "Trace a binary search for 18 in [3, 7, 11, 18, 25, 30, 41, 55].",
      "marks": 4,
      "ms": [
        "Detailed trace with low, high, mid updates (4)"
      ]
    }
  ]
};

C["compsci:4.3.5.1"] = {
  "notes": [
    {
      "h": "Sorting: Bubble and Merge"
    },
    {
      "callout": {
        "t": "def",
        "h": "Sorting Features",
        "body": [
          {
            "kv": [
              [
                "Bubble Sort",
                "Comparison-based sort swapping adjacent elements."
              ],
              [
                "Merge Sort",
                "Divide and conquer sort using recursion and merging."
              ],
              [
                "Stable Sort",
                "Maintains relative order of equal elements."
              ],
              [
                "In-place",
                "Uses minimal extra memory (Bubble: Yes, Merge: No)."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Algorithm",
          "Avg Complexity",
          "Worst Complexity",
          "Space"
        ],
        "rows": [
          [
            "Bubble",
            "O(n^2)",
            "O(n^2)",
            "O(1)"
          ],
          [
            "Merge",
            "O(n log n)",
            "O(n log n)",
            "O(n)"
          ]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Bubble Pass",
          "m": "Compare arr[i] and arr[i+1].",
          "n": "Swap if arr[i] > arr[i+1]."
        },
        {
          "h": "Merge Split",
          "m": "Divide list into halves until size 1.",
          "n": "Recursively merge sorted sublists."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Bubble and Merge Sort in C#.",
        "src": "public void BubbleSort(int[] arr) {\n    int n = arr.Length;\n    for (int i = 0; i < n - 1; i++) {\n        bool swapped = false;\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                (arr[j], arr[j+1]) = (arr[j+1], arr[j]);\n                swapped = true;\n            }\n        }\n        if (!swapped) break;\n    }\n}\n\npublic int[] MergeSort(int[] arr) {\n    if (arr.Length <= 1) return arr;\n    int mid = arr.Length / 2;\n    int[] left = MergeSort(arr.Take(mid).ToArray());\n    int[] right = MergeSort(arr.Skip(mid).ToArray());\n    return Merge(left, right);\n}"
      }
    },
    {
      "callout": {
        "t": "mnemonic",
        "body": "**Bubbles rise**: the largest value bubbles to the end of each pass."
      }
    }
  ],
  "flashcards": [
    [
      "Bubble sort mechanism?",
      "Repeated passes swapping adjacent out-of-order pairs."
    ],
    [
      "Merge sort mechanism?",
      "Recursively halve to single items, then merge sorted sublists."
    ]
  ],
  "quiz": [
    {
      "q": "After bubble sort's first full pass, you are guaranteed…",
      "opts": [
        "the list is sorted",
        "the smallest is first",
        "the largest is last",
        "no swaps occurred"
      ],
      "ans": 2
    }
  ],
  "exam": [
    {
      "q": "Show the stages of a merge sort on [8, 3, 5, 1].",
      "marks": 5,
      "ms": [
        "Full split shown (1), correct merges (2), complexities stated (2)"
      ]
    }
  ]
};

C["compsci:4.3.6.1"] = {
  "notes": [
    {
      "h": "Dijkstra: Optimal pathfinding"
    },
    {
      "callout": {
        "t": "def",
        "h": "Dijkstra Features",
        "body": [
          {
            "kv": [
              [
                "Weighted Graph",
                "Edges have values (costs/distances)."
              ],
              [
                "Relaxation",
                "Updating a neighbor's distance if a shorter path is found through the current node."
              ],
              [
                "Priority Queue",
                "Often used to pick the next closest unvisited node."
              ],
              [
                "Greedy",
                "Makes the locally optimal choice at each step."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Algorithm",
          "Weights",
          "Strategy",
          "Result"
        ],
        "rows": [
          [
            "BFS",
            "Unweighted",
            "Level-by-level",
            "Shortest path (edges)"
          ],
          [
            "Dijkstra",
            "Weighted",
            "Cheapest first",
            "Shortest path (cost)"
          ]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Init",
          "m": "Dist[start]=0, others=\infty. Previous=null.",
          "n": "All nodes in unvisited set."
        },
        {
          "h": "Relax",
          "m": "For current node, check all neighbors.",
          "n": "If dist[curr] + weight < dist[neighbor], update dist and prev."
        },
        {
          "h": "Repeat",
          "m": "Mark current visited, pick next unvisited with min distance.",
          "n": "Stop when target reached or set empty."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Dijkstra's Algorithm in C#.",
        "src": "void Dijkstra(int start, int n, List<(int v, int w)>[] adj) {\n    int[] dist = Enumerable.Repeat(int.MaxValue, n).ToArray();\n    int[] prev = new int[n];\n    dist[start] = 0;\n    PriorityQueue<int, int> pq = new PriorityQueue<int, int>();\n    pq.Enqueue(start, 0);\n    while (pq.Count > 0) {\n        int u = pq.Dequeue();\n        foreach (var edge in adj[u]) {\n            int alt = dist[u] + edge.w;\n            if (alt < dist[edge.v]) {\n                dist[edge.v] = alt;\n                prev[edge.v] = u;\n                pq.Enqueue(edge.v, alt);\n            }\n        }\n    }\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "Dijkstra is BFS upgraded for weights. It fails on graphs with negative weights."
      }
    }
  ],
  "flashcards": [
    [
      "What does Dijkstra compute?",
      "The minimum-total-weight path from a start vertex to others."
    ],
    [
      "The relaxation test?",
      "If distance[u] + weight(u,n) < distance[n], update distance[n]."
    ]
  ],
  "quiz": [
    {
      "q": "Initial tentative distances are…",
      "opts": [
        "all 0",
        "start = 0, rest = \infty",
        "all \infty",
        "start = \infty, rest = 0"
      ],
      "ans": 1
    }
  ],
  "exam": [
    {
      "q": "Explain the steps Dijkstra's algorithm takes to find the shortest path.",
      "marks": 6,
      "ms": [
        "Initialization (1), Smallest unvisited choice (1), Relaxation logic (2), Visited status (1), Path recovery (1)"
      ]
    }
  ]
};

C["compsci:4.1.1.16"] = {
  "notes": [
    {
      "h": "Recursion: The Self-Reference"
    },
    {
      "callout": {
        "t": "def",
        "h": "Anatomy",
        "body": [
          {
            "kv": [
              [
                "Base Case",
                "The condition that stops the recursion."
              ],
              [
                "Recursive Case",
                "Where the function calls itself with modified input."
              ],
              [
                "Call Stack",
                "Memory structure storing active subroutine frames."
              ],
              [
                "Stack Overflow",
                "Error when the stack exceeds memory limits."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Feature",
          "Recursion",
          "Iteration"
        ],
        "rows": [
          [
            "Overhead",
            "High (stack frames)",
            "Low (loop counter)"
          ],
          [
            "Elegance",
            "Often more readable for trees",
            "Better for simple lists"
          ],
          [
            "Risk",
            "Stack overflow",
            "Infinite loops"
          ],
          [
            "State",
            "Implicit in call stack",
            "Explicit in variables"
          ]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Descent",
          "m": "Function calls itself, pushing frames onto stack.",
          "n": "Input must move toward base case."
        },
        {
          "h": "Base Reach",
          "m": "The base case condition evaluates true.",
          "n": "Recursion stops, starts returning."
        },
        {
          "h": "Unwind",
          "m": "Frames pop off stack, combining results.",
          "n": "Final result returned to original caller."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Factorial and Fibonacci Recursion in C#.",
        "src": "int Factorial(int n) {\n    if (n <= 1) return 1;\n    return n * Factorial(n - 1);\n}\n\nint Fibonacci(int n) {\n    if (n <= 1) return n;\n    return Fibonacci(n - 1) + Fibonacci(n - 2);\n}"
      }
    },
    {
      "callout": {
        "t": "warn",
        "body": "No reachable base case \rightarrow frames pile up forever \rightarrow **stack overflow**."
      }
    }
  ],
  "flashcards": [
    [
      "Two essential components of recursion?",
      "A base case and a recursive case."
    ],
    [
      "Cause of stack overflow in recursion?",
      "Missing or unreachable base case; too many recursive calls."
    ]
  ],
  "quiz": [
    {
      "q": "The base case of a recursive routine…",
      "opts": [
        "calls itself once more",
        "returns a result without recursing",
        "must be the last line",
        "pushes a frame"
      ],
      "ans": 1
    }
  ],
  "exam": [
    {
      "q": "Trace the call F(4) for F(n) = n + F(n-1) with F(1)=1.",
      "marks": 5,
      "ms": [
        "Trace of calls (1), Base case result (1), Unwinding steps (2), Final result 10 (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);