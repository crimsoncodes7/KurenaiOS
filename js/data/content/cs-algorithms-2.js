/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.3.4.1"] = {
  "notes": [
    {
      "h": "Dijkstra's Algorithm: Finding the Shortest Path"
    },
    {
      "callout": {
        "t": "def",
        "h": "Algorithm Components",
        "body": [
          {
            "kv": [
              [
                "Shortest Path",
                "The path between two nodes such that the sum of the weights of its constituent edges is minimized."
              ],
              [
                "Relaxation",
                "The process of updating the shortest distance to a node when a better path is found."
              ],
              [
                "Priority Queue",
                "Data structure used to efficiently find the node with the smallest tentative distance."
              ],
              [
                "Visited Set",
                "A collection of nodes for which the shortest path from the source has been finalized."
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
          "Dijkstra's Algorithm",
          "A* Search"
        ],
        "rows": [
          [
            "Information Used",
            "Actual distance from start (g)",
            "Distance from start (g) + Estimate to goal (h)"
          ],
          [
            "Efficiency",
            "Explores in all directions (blind)",
            "Directed towards goal (informed)"
          ],
          [
            "Optimality",
            "Guarantees shortest path",
            "Guarantees shortest path if h is admissible"
          ],
          [
            "Weights",
            "Non-negative only",
            "Non-negative only"
          ]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Initialize",
          "m": "Distances to all nodes = \infty, Source = 0.",
          "n": "Add all nodes to a priority queue."
        },
        {
          "h": "Select & Explore",
          "m": "Extract node $u$ with min distance.",
          "n": "For each neighbor $v$, calculate tentative distance: $dist[u] + weight(u, v)$."
        },
        {
          "h": "Relax",
          "m": "If new distance < $dist[v]$, update $dist[v]$ and $prev[v]$.",
          "n": "Mark $u$ as visited when all neighbors are checked."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Dijkstra's Algorithm implementation using PriorityQueue.",
        "src": "public void Dijkstra(Graph g, Node start) {\n    var dist = new Dictionary<Node, int>();\n    var pq = new PriorityQueue<Node, int>();\n    foreach (var node in g.Nodes) dist[node] = int.MaxValue;\n    \n    dist[start] = 0;\n    pq.Enqueue(start, 0);\n\n    while (pq.Count > 0) {\n        var u = pq.Dequeue();\n        foreach (var edge in u.Edges) {\n            int alt = dist[u] + edge.Weight;\n            if (alt < dist[edge.Target]) {\n                dist[edge.Target] = alt;\n                pq.Enqueue(edge.Target, alt);\n            }\n        }\n    }\n}"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Negative Edge Weights",
        "body": "Dijkstra's algorithm fails if there are negative edge weights. It assumes that adding an edge will never make a path shorter."
      }
    }
  ],
  "flashcards": [
    [
      "What does Dijkstra's algorithm find?",
      "The shortest path from a starting node to all other reachable nodes in a graph."
    ],
    [
      "What is the initial distance value given to the start node?",
      "0."
    ],
    [
      "What is the initial distance value given to all other nodes?",
      "Infinity (\infty)."
    ],
    [
      "What happens during the 'relaxation' step?",
      "If a newly calculated path to a neighbor is shorter than its current known distance, the distance is updated."
    ]
  ],
  "quiz": [
    {
      "q": "In Dijkstra's algorithm, which node is selected to process next?",
      "opts": [
        "The unvisited node with the smallest tentative distance",
        "The last visited node",
        "A random unvisited neighbor",
        "The destination node"
      ],
      "ans": 0,
      "why": "Dijkstra always greedily expands the frontier using the node with the lowest current distance."
    }
  ],
  "exam": [
    {
      "q": "Describe how Dijkstra's algorithm initializes its data structures before processing the first node.",
      "marks": 3,
      "ms": [
        "Sets the distance to the start node to 0 (1)",
        "Sets the distance to all other nodes to infinity (1)",
        "Marks all nodes as unvisited (1)"
      ]
    }
  ]
};

C["compsci:4.3.4.3"] = {
  "notes": [
    {
      "h": "A* Algorithm: Directed Search with Heuristics"
    },
    {
      "callout": {
        "t": "def",
        "h": "A* Terminology",
        "body": [
          {
            "kv": [
              [
                "Heuristic (h)",
                "An estimate of the cost from the current node to the goal."
              ],
              [
                "Actual Cost (g)",
                "The exact cost from the start node to the current node."
              ],
              [
                "Total Cost (f)",
                "The sum of g and h: $f(n) = g(n) + h(n)$."
              ],
              [
                "Admissibility",
                "The property that a heuristic never overestimates the true cost."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Heuristic Type",
          "Description",
          "Admissibility"
        ],
        "rows": [
          [
            "Manhattan",
            "Sum of absolute differences of coordinates",
            "Admissible for grid movement (4-way)"
          ],
          [
            "Euclidean",
            "Straight-line distance",
            "Always admissible for physical distance"
          ],
          [
            "Zero (h=0)",
            "No heuristic used",
            "Trivial; reduces A* to Dijkstra"
          ],
          [
            "Overestimating",
            "Estimated cost > Actual cost",
            "Not admissible; may miss shortest path"
          ]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Calculate F-Score",
          "m": "$f(n) = g(n) + h(n)$",
          "n": "Determine the priority of the node."
        },
        {
          "h": "Expand Node",
          "m": "Pick node with lowest $f(n)$ from the open set.",
          "n": "Move it to the closed set after checking neighbors."
        },
        {
          "h": "Pathfinding",
          "m": "Continue until the goal node is the lowest $f(n)$ node.",
          "n": "Reconstruct path using parent pointers."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "A* Search Algorithm Core Logic.",
        "src": "public void AStar(Node start, Node goal) {\n    var openSet = new PriorityQueue<Node, int>();\n    var gScore = new Dictionary<Node, int>();\n    var fScore = new Dictionary<Node, int>();\n\n    gScore[start] = 0;\n    fScore[start] = Heuristic(start, goal);\n    openSet.Enqueue(start, fScore[start]);\n\n    while (openSet.Count > 0) {\n        var current = openSet.Dequeue();\n        if (current == goal) return; // Path found\n\n        foreach (var neighbor in current.Neighbors) {\n            int tentativeG = gScore[current] + Weight(current, neighbor);\n            if (tentativeG < gScore.GetValueOrDefault(neighbor, int.MaxValue)) {\n                gScore[neighbor] = tentativeG;\n                fScore[neighbor] = tentativeG + Heuristic(neighbor, goal);\n                openSet.Enqueue(neighbor, fScore[neighbor]);\n            }\n        }\n    }\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Heuristic Effectiveness",
        "body": "The closer $h(x)$ is to the actual cost, the fewer nodes A* explores. If $h(x)=0$, it is Dijkstra."
      }
    }
  ],
  "flashcards": [
    [
      "What is the A* cost function?",
      "f(x) = g(x) + h(x)"
    ],
    [
      "In A*, what does g(x) represent?",
      "The exact known cost from the start node to the current node x."
    ],
    [
      "In A*, what does h(x) represent?",
      "The heuristic estimate of the cost from node x to the goal."
    ],
    [
      "What does it mean for a heuristic to be 'admissible'?",
      "It must never overestimate the actual cost to reach the goal."
    ]
  ],
  "quiz": [
    {
      "q": "Why is A* often preferred over Dijkstra for game pathfinding?",
      "opts": [
        "It uses heuristics to search directionally towards the goal",
        "It ignores edge weights completely",
        "It is a depth-first search",
        "It can handle negative edge weights safely"
      ],
      "ans": 0
    }
  ],
  "exam": [
    {
      "q": "Explain the roles of g(x) and h(x) in the A* algorithm.",
      "marks": 3,
      "ms": [
        "g(x) is actual cost (1), h(x) is estimate (1), admissibility requirement (1)"
      ]
    }
  ]
};

C["compsci:4.3.5.2"] = {
  "notes": [
    {
      "h": "Limits of Computation and Tractability"
    },
    {
      "callout": {
        "t": "def",
        "h": "Complexity Concepts",
        "body": [
          {
            "kv": [
              [
                "Tractable",
                "Problems solvable in polynomial time (e.g., $O(n^2)$)."
              ],
              [
                "Intractable",
                "Problems that take exponential or factorial time (e.g., $O(2^n)$)."
              ],
              [
                "Heuristic",
                "A technique designed for solving a problem more quickly when classic methods are too slow."
              ],
              [
                "TSP",
                "Travelling Salesman Problem: Find the shortest route visiting all cities once."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Complexity Class",
          "Time Complexity",
          "Scalability"
        ],
        "rows": [
          [
            "Polynomial (Tractable)",
            "$O(n)$, $O(n log n)$, $O(n^2)$",
            "High - scales with Moore's Law"
          ],
          [
            "Exponential (Intractable)",
            "$O(2^n)$",
            "Very Low - small increases in $n$ crash systems"
          ],
          [
            "Factorial (Intractable)",
            "$O(n!)$",
            "Extremely Low - unusable for $n > 20$"
          ]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Classifying Problems",
          "m": "Identify the worst-case Big-O complexity.",
          "n": "Polynomial = Tractable; else = Intractable."
        },
        {
          "h": "Applying Heuristics",
          "m": "For $O(2^n)$ problems, use a heuristic (e.g., Nearest Neighbor for TSP).",
          "n": "Trade accuracy for a 'good enough' solution in polynomial time."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Simple Heuristic for TSP (Nearest Neighbor).",
        "src": "public List<City> NearestNeighborTSP(List<City> cities) {\n    var tour = new List<City>();\n    var current = cities[0];\n    cities.RemoveAt(0);\n    tour.Add(current);\n\n    while (cities.Count > 0) {\n        var next = cities.OrderBy(c => Distance(current, c)).First();\n        tour.Add(next);\n        cities.Remove(next);\n        current = next;\n    }\n    return tour;\n}"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Time Complexities",
        "body": "Tractable = Polynomial time (manageable). Intractable = Exponential/Factorial time (blows up quickly)."
      }
    }
  ],
  "flashcards": [
    [
      "Define a tractable problem.",
      "A problem that can be solved in a reasonable (polynomial) amount of time."
    ],
    [
      "Define an intractable problem.",
      "A problem that has an algorithm, but takes an unreasonably long (exponential or factorial) time."
    ],
    [
      "Give examples of polynomial time complexities.",
      "O(n), O(n^2), O(n^3), O(log n), O(n log n)"
    ]
  ],
  "quiz": [
    {
      "q": "A problem with a time complexity of O(2^n) is considered...",
      "opts": [
        "Intractable",
        "Tractable",
        "Uncomputable",
        "Constant time"
      ],
      "ans": 0
    }
  ],
  "exam": [
    {
      "q": "Explain the difference between a tractable and an intractable problem.",
      "marks": 4,
      "ms": [
        "Tractable = polynomial time (1), example $O(n^2)$ (1), Intractable = exponential/factorial (1), example $O(2^n)$ (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);