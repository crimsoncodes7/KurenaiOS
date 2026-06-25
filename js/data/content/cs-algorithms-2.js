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
          "m": "Distances to all nodes = ∞, Source = 0.",
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
    },
    {
      "callout": {
        "t": "tip",
        "h": "Exam trace technique",
        "body": "Draw a table with one column per node. Each row shows the state after settling one node. Show: current tentative distances, which node is settled (mark ✓), and the prev pointer update. Examiners credit each correct relaxation."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Dijkstra's Algorithm — Key Facts",
        "body": "1. Initialise: source = 0, all others = ∞. 2. Greedily pick unvisited node with min distance. 3. Relax all neighbours. 4. Mark visited (distance finalised). Non-negative weights only. Uses a priority queue. Time complexity: O((V + E) log V) with a binary heap."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "\"Dijkstra and BFS solve the same problem\"",
        "body": "BFS finds shortest paths by **edge count** on unweighted graphs. Dijkstra finds shortest paths by **total weight** on weighted graphs. On an unweighted graph, Dijkstra reduces to BFS — but they are not interchangeable when weights differ."
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
      "Infinity (∞)."
    ],
    [
      "What happens during the 'relaxation' step?",
      "If a newly calculated path to a neighbor is shorter than its current known distance, the distance is updated."
    ],
    [
      "Why does Dijkstra use a priority queue (not a regular queue)?",
      "To efficiently extract the unvisited node with the smallest tentative distance at each step."
    ],
    ["What is stored in the 'previous' pointer for each node?", "The predecessor node on the current best path, used to reconstruct the route by tracing back from the target."],
    ["Why does Dijkstra fail with negative edge weights?", "It finalises a node's distance when visited, assuming no later edge can shorten it — a negative edge could, breaking the guarantee."],
    ["State the time complexity of Dijkstra with a binary-heap priority queue.", "O((V + E) log V)."],
    ["On an unweighted graph, Dijkstra behaves like which algorithm?", "Breadth-first search — with equal weights, cheapest-first equals fewest-edges-first."]
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
    },
    {
      "q": "After a node is marked visited in Dijkstra's algorithm, its distance…",
      "opts": [
        "can still decrease if a shorter path is found",
        "is guaranteed to be the shortest possible and will not change",
        "resets to ∞ for the next iteration",
        "is shared with all its neighbours"
      ],
      "ans": 1,
      "why": "Visiting a node finalises its distance — the greedy proof guarantees no shorter path exists."
    },
    { "q": "Dijkstra differs from A* in that Dijkstra…", "opts": ["uses a heuristic estimate to the goal", "uses only the actual distance from the start", "cannot handle weighted edges", "is a depth-first search"], "ans": 1, "why": "Dijkstra ranks nodes purely by g (cost from start); A* adds a heuristic h toward the goal." },
    { "q": "The relaxation condition updates dist[v] when…", "opts": ["dist[u] + weight(u,v) < dist[v]", "dist[v] < dist[u]", "v is the start node", "u has no neighbours"], "ans": 0, "why": "A cheaper route to v via u improves its tentative distance." },
    { "q": "Dijkstra's algorithm is best described as…", "opts": ["divide and conquer", "greedy", "brute force", "dynamic programming only"], "ans": 1, "why": "It greedily settles the closest unvisited node at each step." }
  ],
  "exam": [
    {
      "q": "Describe how Dijkstra's algorithm initializes its data structures before processing the first node.",
      "marks": 3,
      "ms": [
        "Sets the distance to the start node to 0 (1)",
        "Sets the distance to all other nodes to infinity (1)",
        "Marks all nodes as unvisited / adds all to the priority queue (1)"
      ]
    },
    { "q": "Explain what 'relaxation' means in Dijkstra's algorithm and why a priority queue is used.", "marks": 3,
      "ms": ["Relaxation: if dist[u] + weight(u,v) < dist[v], update dist[v] (and prev[v]) to the cheaper route (1-2)", "A priority queue efficiently returns the unvisited node with the smallest tentative distance each step (1)"] },
    { "q": "A network routing system needs least-cost paths from one router to all others, where links have positive latencies. Discuss why Dijkstra's algorithm is appropriate, how it guarantees correctness, and one limitation.", "marks": 6,
      "ms": ["Links have positive weights (latency) and Dijkstra finds minimum-total-weight paths (1)", "It is single-source — computes shortest paths to all routers from the source (1-2)", "Greedily settling the closest unvisited node, with relaxation, guarantees each settled distance is final/optimal for non-negative weights (1-2)", "Priority queue makes node selection efficient (1)", "Limitation: fails if any weight is negative / does not adapt instantly to changing link costs (1)"] }
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "A* = Dijkstra + direction",
        "body": "Dijkstra: $f = g$ (only actual cost).\nA\\*: $f = g + h$ (actual cost + heuristic estimate).\nBoth guarantee the shortest path — A\\* just explores far fewer nodes when $h$ is good."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "\"Any heuristic makes A* faster\"",
        "body": "An **inadmissible** heuristic (one that overestimates) can cause A* to skip the true shortest path, returning a suboptimal result. Only admissible heuristics guarantee correctness."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Common heuristics for grids",
        "body": [
          {
            "kv": [
              ["Manhattan distance", "Sum of |Δx| + |Δy| — correct for 4-way grid movement"],
              ["Euclidean distance", "Straight-line — admissible for any movement direction"],
              ["Chebyshev distance", "max(|Δx|, |Δy|) — correct for 8-way grid movement"]
            ]
          }
        ]
      }
    }
  ],
  "flashcards": [
    [
      "What is the A* cost function?",
      "f(x) = g(x) + h(x) — actual cost from start + estimated cost to goal."
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
    ],
    [
      "What does A* reduce to when h(x) = 0 for all nodes?",
      "Dijkstra's algorithm — it explores in all directions without any goal-directed bias."
    ],
    ["Why does a better (closer) admissible heuristic make A* faster?", "The nearer h is to the true remaining cost, the more the search is steered toward the goal, so fewer nodes are expanded."],
    ["Which heuristic suits 4-way grid movement, and which suits any-direction travel?", "Manhattan distance for 4-way grids; Euclidean (straight-line) distance for any-direction/physical travel."],
    ["What are the 'open set' and 'closed set' in A*?", "Open set: discovered nodes still to be expanded (a priority queue on f). Closed set: nodes already expanded/finalised."],
    ["Does an inadmissible heuristic still guarantee the shortest path?", "No — overestimating can prune the true optimal route, giving a suboptimal (though often faster) result."]
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
    },
    {
      "q": "An inadmissible heuristic (one that overestimates) causes A* to…",
      "opts": [
        "find the shortest path faster",
        "potentially return a path that is NOT the shortest",
        "reduce to BFS",
        "crash with an infinite loop"
      ],
      "ans": 1,
      "why": "Overestimating causes A* to prune nodes on the true shortest path, so the result may be suboptimal."
    },
    { "q": "In A*, a node is prioritised for expansion by the lowest value of…", "opts": ["g(x)", "h(x)", "f(x) = g(x) + h(x)", "the number of neighbours"], "ans": 2, "why": "f combines actual cost so far with the estimate to the goal." },
    { "q": "Setting h(x) = 0 for every node turns A* into…", "opts": ["BFS", "DFS", "Dijkstra's algorithm", "binary search"], "ans": 2, "why": "With no heuristic, f = g, which is exactly Dijkstra." },
    { "q": "Which heuristic is admissible for straight-line travel in any direction?", "opts": ["Manhattan distance", "Euclidean distance", "An overestimate of distance", "Random values"], "ans": 1, "why": "Straight-line (Euclidean) distance never exceeds the true path cost, so it is admissible." }
  ],
  "exam": [
    {
      "q": "Explain the roles of g(x) and h(x) in the A* algorithm and state what admissibility requires.",
      "marks": 4,
      "ms": [
        "g(x): exact cost from start node to current node x (1)",
        "h(x): heuristic estimate of remaining cost from x to goal (1)",
        "f(x) = g(x) + h(x) used to prioritise which node to expand next (1)",
        "Admissibility: h(x) must never overestimate the true remaining cost (1)"
      ]
    },
    { "q": "State one similarity and one difference between A* and Dijkstra's algorithm.", "marks": 2,
      "ms": ["Similarity: both find the shortest path on non-negative weighted graphs / both expand the lowest-priority node from a priority queue (1)", "Difference: A* adds a heuristic estimate h(x) to direct the search toward the goal, whereas Dijkstra uses only g(x) (1)"] },
    { "q": "A game studio uses A* for enemy pathfinding on a tile map. Discuss why A* is preferred over Dijkstra here, the role of the heuristic, and the consequence of choosing an inadmissible heuristic.", "marks": 6,
      "ms": ["A* uses f = g + h to search directionally toward the goal, expanding far fewer tiles than Dijkstra's blind expansion (1-2)", "On a large map this is much faster, important for real-time games (1)", "A suitable admissible heuristic (e.g. Manhattan distance on a 4-way grid) estimates remaining cost without overestimating (1-2)", "An inadmissible (overestimating) heuristic can prune the true shortest path, giving a suboptimal route (1)", "Trade-off noted: a stronger heuristic speeds search but must stay admissible to guarantee optimality (1)"] }
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
    },
    {
      "callout": {
        "t": "warn",
        "h": "Intractable ≠ Impossible",
        "body": "An intractable problem **has** an algorithm — it just runs too slowly for large inputs. This is different from an **uncomputable** problem (like the Halting Problem), for which no algorithm can ever exist."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "\"Faster hardware solves intractable problems\"",
        "body": "Doubling CPU speed only adds one extra item to what an exponential algorithm can handle. Going from n=50 to n=100 doesn't help — the algorithm is still impractical. Heuristics are the only practical escape."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "The Travelling Salesman Problem (TSP)",
        "body": "TSP is the canonical intractable problem: find the shortest route visiting $n$ cities exactly once. The brute-force solution checks all $(n-1)!$ permutations. For $n=20$, that's ~$10^{17}$ routes — impossible even at $10^{10}$ ops/sec."
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
      "A problem that has an algorithm, but takes an unreasonably long (exponential or factorial) time for large inputs."
    ],
    [
      "Give examples of polynomial time complexities.",
      "$O(n)$, $O(n^2)$, $O(n^3)$, $O(\\log n)$, $O(n \\log n)$"
    ],
    [
      "What is the key difference between intractable and uncomputable?",
      "Intractable: an algorithm exists but is too slow. Uncomputable: no algorithm can ever exist (e.g., the Halting Problem)."
    ],
    [
      "Why can't faster hardware solve intractable problems?",
      "Doubling speed only adds one item to what an exponential algorithm can handle — the growth outpaces any hardware improvement."
    ],
    ["What is a heuristic, in the context of intractable problems?", "A technique that finds an approximate 'good enough' solution in reasonable (polynomial) time, trading guaranteed optimality for speed."],
    ["Give the brute-force complexity of the Travelling Salesman Problem.", "O(n!) (checking (n-1)! permutations) — factorial, hence intractable for large n."],
    ["Name a heuristic approach to TSP.", "Nearest Neighbour — repeatedly travel to the closest unvisited city; fast but not guaranteed optimal."],
    ["Order these by growth for large n: O(n^2), O(2^n), O(n!).", "O(n^2) < O(2^n) < O(n!) — polynomial grows slowest, factorial fastest."]
  ],
  "quiz": [
    {
      "q": "A problem with a time complexity of $O(2^n)$ is considered…",
      "opts": [
        "Intractable",
        "Tractable",
        "Uncomputable",
        "Constant time"
      ],
      "ans": 0
    },
    {
      "q": "Which of these is an example of an intractable problem?",
      "opts": [
        "Searching a sorted list",
        "Sorting n items with merge sort",
        "Finding the shortest route visiting all cities exactly once (TSP)",
        "Calculating the sum of n numbers"
      ],
      "ans": 2,
      "why": "TSP is $O(n!)$ brute force — exponential/factorial time makes it intractable for large n."
    },
    { "q": "An intractable problem differs from an uncomputable one because the intractable problem…", "opts": ["has no algorithm at all", "has an algorithm that is just too slow for large inputs", "is solved instantly", "only affects sorting"], "ans": 1, "why": "Intractable = an algorithm exists but is impractically slow; uncomputable = no algorithm can ever exist." },
    { "q": "Which complexity is tractable?", "opts": ["$O(2^n)$", "$O(n!)$", "$O(n \\log n)$", "$O(3^n)$"], "ans": 2, "why": "Polynomial/log-linear time is tractable; exponential and factorial are not." },
    { "q": "A heuristic for an intractable problem trades…", "opts": ["correctness for memory", "guaranteed optimality for speed", "speed for accuracy", "nothing — it is always optimal"], "ans": 1, "why": "Heuristics return a good-enough answer quickly, giving up the guarantee of the exact optimum." }
  ],
  "exam": [
    {
      "q": "Explain the difference between a tractable and an intractable problem, and describe how heuristics address intractable problems.",
      "marks": 5,
      "ms": [
        "Tractable: solvable in polynomial time, e.g. $O(n^2)$ (1)",
        "Intractable: algorithm exists but runs in exponential/factorial time, e.g. $O(2^n)$ (1)",
        "Intractable ≠ unsolvable — an algorithm exists, it is just impractically slow for large n (1)",
        "Heuristic: a technique that finds an approximate (good enough) solution in polynomial time (1)",
        "Example: Nearest Neighbour for TSP gives a near-optimal tour quickly, not guaranteed optimal (1)"
      ]
    },
    { "q": "Explain why simply using faster hardware does not make an intractable problem tractable.", "marks": 3,
      "ms": ["Exponential/factorial growth means each extra input element multiplies the work (1)", "A hardware speed-up of a constant factor only adds a tiny constant to the input size that can be handled (1)", "The growth of the algorithm outpaces any realistic hardware improvement, so it stays impractical (1)"] },
    { "q": "Discuss the limits of computation in terms of tractable, intractable and uncomputable problems, using the Travelling Salesman Problem and the Halting Problem as examples.", "marks": 6,
      "ms": ["Tractable problems run in polynomial time and scale acceptably (1)", "Intractable problems have algorithms but exponential/factorial time, e.g. TSP brute force is O(n!) (1-2)", "Heuristics (e.g. Nearest Neighbour) give good-enough TSP solutions quickly without guaranteeing optimality (1)", "Uncomputable problems have NO possible algorithm, e.g. the Halting Problem (1-2)", "Clear distinction drawn: intractable = too slow, uncomputable = impossible in principle (1)"] }
  ]
};

})(window.KOS_CONTENT);