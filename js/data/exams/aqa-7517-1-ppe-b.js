/* Kurenai OS — js/data/exams/aqa-7517-1-ppe-b.js
   AQA 7517 Paper 1, the full Companion (PARTIAL: the leaves of the
   December pre-public exam): 4.2.4 graphs, 4.2.5 trees, 4.3.1 graph
   traversal, 4.3.2 tree traversal, 4.3.4 searching and 4.3.5 sorting.
   AUTHORED, original (see aqa-7517-2-45.js for the shape and the rules).
   Real questions are referenced by series and number only, and every trap
   that cites a series paraphrases our own examiner's-report notes
   (tools/exam-index/reports/aqa-7517-1.md). Every traversal order, queue
   and stack state, tree built from a sequence, search trace, sort pass
   and merge step here was produced by running it in Python first.
   Graphs and trees are given as edge lists, adjacency lists or tables and
   pointer tables (Data, Left, Right; −1 is a null pointer).             */
(function () {
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var D = X.deep = X.deep || {};
  var P = D["aqa-7517-1"] = D["aqa-7517-1"] || { leaves: {} };
  P.partial = true;
  var L = P.leaves;

  /* shared figures, as text */
  var FRUIT = ["Index  Data   Left  Right",
    "0      Mango   1     2",
    "1      Fig     3     4",
    "2      Pear   -1     5",
    "3      Apple  -1    -1",
    "4      Kiwi    6    -1",
    "5      Plum   -1    -1",
    "6      Grape  -1    -1",
    "Root = 0"];
  var NUMS = ["Index  Data  Left  Right",
    "0      40     1     2",
    "1      25     3     4",
    "2      60     5     6",
    "3      10    -1    -1",
    "4      30    -1     7",
    "5      55    -1    -1",
    "6      70    -1    -1",
    "7      35    -1    -1",
    "Root = 0"];
  var NINE = ["Index  Data  Left  Right",
    "0      50     1     2",
    "1      30     3     4",
    "2      70     5     6",
    "3      20    -1    -1",
    "4      40    -1     7",
    "5      60    -1     8",
    "6      80    -1    -1",
    "7      45    -1    -1",
    "8      65    -1    -1",
    "Root = 0"];
  var GRAPH7 = ["A: B, C", "B: A, D, E", "C: A, F", "D: B", "E: B, F, G", "F: C, E", "G: E"];
  var EXPLORE = ["SUBROUTINE Explore(V)",
    "  Visited[V] <- True",
    "  OUTPUT V",
    "  FOR N <- 0 TO 5",
    "    IF Graph[V][N] = 1 AND Visited[N] = False THEN",
    "      Explore(N)",
    "    ENDIF",
    "  ENDFOR",
    "ENDSUBROUTINE"];
  var MATRIX6 = ["     0  1  2  3  4  5",
    "0    0  1  0  0  1  0",
    "1    1  0  0  1  0  0",
    "2    0  0  0  1  0  1",
    "3    0  1  1  0  1  0",
    "4    1  0  0  1  0  0",
    "5    0  0  1  0  0  0"];
  var SORTED15 = ["Index  0  1   2   3   4   5   6   7   8   9   10  11  12  13  14",
    "A      3  8   11  15  19  24  27  31  36  42  45  51  58  63  70"];

  var Q043 = { sitting: "2022-06", q: "Q04.3", text: "Only about a fifth traced the short subroutine over the Visited array correctly. Wrong answers returned several values where the code returns one, or wrote counter values the loop never reaches. Follow the code exactly, one line at a time." };
  var Q045 = { sitting: "2022-06", q: "Q04.5", text: "Very few scored all six on the recursive traversal trace, although the first rows earned marks. Keep the call stack written down as you go, so you know which call you return to." };
  var Q046 = { sitting: "2022-06", q: "Q04.6", text: "Naming the traversal as depth-first was the easier mark; saying what the subroutine is FOR (and what its True result means about the graph) was answered worse. Some managed these without a correct trace, so attempt them anyway." };

  /* ================= 4.2.4 Graphs ================= */
  L["4.2.4.1"] = {
    archetypes: [
      { id: "cs.adjacency",
        rules: ["Adjacency matrix: one row and one column per vertex; the cell [row][column] holds 1 (or the weight) where an edge exists, and is left empty (or 0) where none does.",
          "Undirected graph: fill BOTH [A][B] and [B][A], so the matrix is symmetric about the leading diagonal.",
          "Adjacency list: each vertex followed by the vertices it connects to (with each weight for a weighted graph). A vertex with no edges is still listed.",
          "A list suits a SPARSE graph (few edges): it stores only the edges that exist. A matrix suits a DENSE graph, or one where edges are tested often: one lookup says whether an edge exists.",
          "Tie the reason to the scenario: 'uses less memory' scores when you say it is because there are few edges."],
        traps: [{ text: "A matrix for an undirected graph with only the top half filled in is incomplete: an edge between A and B goes in row A AND row B." }],
        variations: [
          { v: "A", t: "Complete the matrix for a weighted graph", m: 2,
            ctx: "A delivery firm models five depots as an undirected weighted graph. Each weight is the driving time in minutes.",
            code: ["Edges: A-B 4, A-C 7, B-C 2, B-D 5, C-E 3, D-E 6"],
            q: "Complete the adjacency matrix for the graph, with rows and columns A to E.",
            steps: [["Row A: B = 4, C = 7. Row B: A = 4, C = 2, D = 5.", "MP1", "The first two rows, each edge with its weight"],
              ["Row C: A = 7, B = 2, E = 3. Row D: B = 5, E = 6. Row E: C = 3, D = 6. Every other cell empty; the matrix is symmetric.", "MP2", "The rest, mirrored across the diagonal"]],
            trap: "Writing 1 instead of the weight scores nothing for a weighted graph: the matrix must carry the times." },
          { v: "B", t: "Write the adjacency list of a directed graph", m: 2,
            code: ["Edges (from -> to): P->Q, P->R, Q->S, R->Q, S->P, S->T"],
            q: "Write the adjacency list for this directed graph.",
            steps: [["P: Q, R. Q: S. R: Q.", "MP1", "Only the edges that LEAVE each vertex"],
              ["S: P, T. T: (none) — T is listed with an empty list.", "MP2", "Every vertex appears, even one with no outgoing edges"]] },
          { v: "C", t: "When a list beats a matrix", m: 2,
            ctx: "A social network has 50,000 members. Each member follows about 100 others.",
            q: "Explain why an adjacency list is more suitable than an adjacency matrix for storing who follows whom.",
            steps: [["The graph is sparse: each member is connected to only a tiny fraction of the 50,000 others.", "MP1", "Sparse, said about THIS graph"],
              ["A list stores only the edges that exist (about 5,000,000), while a matrix would need 50,000 × 50,000 = 2,500,000,000 cells, almost all empty, so the list uses far less memory.", "MP2", "The memory reason, tied to the few edges"]] },
          { v: "D", t: "When a matrix beats a list", m: 2,
            ctx: "A booking system holds 30 airports. Most pairs have a direct flight, and the program checks thousands of times a second whether a direct flight exists between two airports.",
            q: "Explain why an adjacency matrix is more suitable than an adjacency list here.",
            steps: [["The graph is dense (most pairs are joined), so few cells of the matrix are wasted.", "MP1", "Dense: the matrix's memory cost is not wasted"],
              ["Whether an edge exists is found with ONE lookup, Graph[i][j], whereas a list has to be searched; this matters when it is tested so often.", "MP2", "Fast edge test, tied to the frequent checks"]] },
          { v: "E", t: "Which graph needs the whole matrix", m: 1,
            q: "The adjacency matrix of an undirected graph can be stored using only the cells on one side of the leading diagonal. State which type of graph needs the full matrix, and why.",
            steps: [["A directed graph: an edge from i to j does not mean there is an edge from j to i, so the matrix is not symmetric.", "MP1", "Directed, with the reason"]] }
        ] },
      { id: "cs.graph-props",
        rules: ["Graph: vertices (nodes) joined by edges (arcs). Directed: each edge goes one way. Weighted: each edge carries a value such as a distance, cost or time.",
          "A tree is a connected, undirected graph with no cycles. With n vertices it has exactly n − 1 edges.",
          "To show a graph is NOT a tree, name the cycle by its vertices (1–2–4–3–1), or a vertex that cannot be reached.",
          "Trace a subroutine over a Visited array line by line: write each value the variables take, and give back exactly what the code returns.",
          "If a traversal from one vertex leaves every Visited entry True, every vertex can be reached: the graph is connected."],
        traps: [Q043, Q046],
        variations: [
          { v: "A", t: "What a weighted graph is", m: 1,
            q: "Explain what is meant by a weighted graph.",
            steps: [["A graph in which each edge has a value (weight) attached, for example the distance, time or cost of travelling along it.", "MP1", "A value on each EDGE, not on each vertex"]] },
          { v: "B", t: "Why this graph is not a tree", m: 2,
            code: ["Vertices: 1, 2, 3, 4, 5", "Edges: 1-2, 1-3, 2-4, 3-4, 4-5"],
            q: "Explain why the undirected graph described is not a tree.",
            steps: [["It contains a cycle: 1–2–4–3–1.", "MP1", "Name the cycle"],
              ["A tree must have no cycles (5 vertices would need exactly 4 edges; this graph has 5).", "MP2", "The property a tree must have"]],
            trap: "\"It has a loop\" with no vertices named is too vague to earn the first mark." },
          { v: "C", t: "Trace a subroutine over the Visited array", m: 2,
            ctx: "After a traversal, Visited = [True, False, True, True, False].",
            code: ["FUNCTION AllVisited(Visited)",
              "  Count <- 0",
              "  FOR i <- 0 TO LEN(Visited) - 1",
              "    IF Visited[i] = False THEN",
              "      Count <- Count + 1",
              "    ENDIF",
              "  ENDFOR",
              "  RETURN Count = 0",
              "ENDFUNCTION"],
            q: "State the final value of Count and the value returned by AllVisited.",
            steps: [["Count is incremented only at i = 1 and i = 4, so it ends as 2.", "MP1", "One final value; it never takes any other"],
              ["Count = 0 is false, so the function returns False (one Boolean value).", "MP2", "The single returned value"]],
            trap: "Listing 0, 1, 2 as 'the value returned' is the 2022 mistake: the function returns one value, once." },
          { v: "D", t: "What a True result says", m: 1,
            q: "A program calls a depth-first traversal from vertex 0 that sets Visited[V] to True for each vertex it reaches, then calls AllVisited. State what a True result tells you about the graph.",
            steps: [["Every vertex was reached from vertex 0, so the graph is connected.", "MP1", "Connected, not just 'it worked'"]] }
        ] }
    ],
    practice: [
      [1, 1, "State what is meant by a directed graph.", ["Each edge has a direction / can only be followed one way (1)"], { arch: "cs.graph-props" }],
      [1, 1, "A tree has 6 vertices. State how many edges it has.", ["5 (1)"], { arch: "cs.graph-props" }],
      [2, 2, "An undirected, unweighted graph has the edges A–B, A–D, B–C, C–D and D–E. Write its adjacency list, with each list in alphabetical order.", ["A: B, D and B: A, C (1)", "C: B, D and D: A, C, E and E: D (1)"], { arch: "cs.adjacency" }],
      [2, 2, "A satnav stores a road map of 40,000 junctions as a graph. Most junctions join three or four roads. Explain whether an adjacency matrix or an adjacency list is more suitable.", ["Adjacency list (1)", "The graph is sparse, so a 40,000 × 40,000 matrix would be almost all empty; the list stores only the edges that exist and uses far less memory (1)"], { arch: "cs.adjacency" }],
      [2, 2, "An undirected graph with 7 vertices and 9 edges is stored as an adjacency matrix, using 1 for an edge and 0 for none. State how many cells hold 1 and explain why.", ["18 (1)", "Each edge is stored twice, at [i][j] and at [j][i], because the matrix is symmetric (1)"], { arch: "cs.adjacency" }],
      [3, 3, "The matrix below is the adjacency matrix of an undirected graph. It has 5 vertices and 4 edges. Explain whether the graph is a tree.", ["It is not a tree (1)", "It contains a cycle, 0–1–2–0 (1)", "It is not connected: vertices 3 and 4 cannot be reached from 0, so having n − 1 edges is not enough on its own (1)"],
        { arch: "cs.graph-props", code: ["     0  1  2  3  4", "0    0  1  1  0  0", "1    1  0  1  0  0", "2    1  1  0  0  0", "3    0  0  0  0  1", "4    0  0  0  1  0"] }],
      [3, 3, "Explain why the adjacency matrix of an undirected graph can be stored in about half the memory of the full matrix, and state when this cannot be done.", ["The matrix is symmetric: [i][j] always equals [j][i] (1)", "So only the cells on one side of the leading diagonal need storing (1)", "It cannot be done for a directed graph, where an edge one way does not imply one the other way (1)"], { arch: "cs.adjacency" }]
    ]
  };

  /* ================= 4.2.5 Trees ================= */
  L["4.2.5.1"] = {
    archetypes: [{
      id: "cs.binary-tree",
      rules: ["Tree: a connected, undirected graph with no cycles. Rooted tree: one vertex is the root, and every other vertex has exactly one parent; a vertex with no children is a leaf.",
        "Binary tree: a rooted tree in which every node has AT MOST two children.",
        "Binary search tree: every value in a node's left subtree is less than it, every value in its right subtree is greater.",
        "Building from a sequence: each new item starts at the root and goes left if smaller, right if not, until it reaches an empty pointer.",
        "In a pointer table, Left and Right hold the INDEX of the child; a null value (here −1) means no child."],
      traps: [{ text: "\"Each node has two children\" loses the definition mark: it is AT MOST two, and leaves have none." },
        { text: "Following the pointer from the wrong node: a new item is compared all the way down from the root, not just with the last item added." }],
      variations: [
        { v: "A", t: "Define a binary tree", m: 2,
          q: "Define the term binary tree.",
          steps: [["A rooted tree (one node is the root; the tree is connected with no cycles)…", "MP1", "Rooted tree"],
            ["…in which each node has at most two children.", "MP2", "At most two"]] },
        { v: "B", t: "What makes a graph a tree", m: 2,
          q: "State two properties an undirected graph must have to be a tree.",
          steps: [["It is connected: there is a path between every pair of vertices.", "MP1", "Connected"],
            ["It has no cycles.", "MP2", "Acyclic"]] },
        { v: "C", t: "Build a binary search tree as a pointer table", m: 4,
          ctx: "These fruit names are inserted, in this order, into an empty binary search tree held in the arrays Data, Left and Right. The first item goes at index 0, the next at index 1, and so on; −1 is a null pointer.",
          code: ["Mango, Fig, Pear, Apple, Kiwi, Plum, Grape"],
          q: "Complete the Left and Right arrays.",
          steps: [["Index 0, Mango (the root): Left 1 (Fig), Right 2 (Pear).", "MP1", "Root's two children"],
            ["Index 1, Fig: Left 3 (Apple), Right 4 (Kiwi).", "MP2", "Apple < Mango and < Fig; Kiwi < Mango but > Fig"],
            ["Index 2, Pear: Left −1, Right 5 (Plum).", "MP3", "Plum > Mango, > Pear"],
            ["Index 4, Kiwi: Left 6 (Grape), Right −1. Apple (3), Plum (5) and Grape (6) are leaves: −1, −1.", "MP4", "Grape < Mango, > Fig, < Kiwi; every leaf has two nulls"]] },
        { v: "D", t: "Trace a recursive binary tree search", m: 3,
          ctx: "The tree is held in the pointer table below.",
          code: FRUIT.concat(["", "FUNCTION Search(Node, Target)",
            "  IF Node = -1 THEN",
            "    RETURN False",
            "  ELSE IF Data[Node] = Target THEN",
            "    RETURN True",
            "  ELSE IF Target < Data[Node] THEN",
            "    RETURN Search(Left[Node], Target)",
            "  ELSE",
            "    RETURN Search(Right[Node], Target)",
            "  ENDIF",
            "ENDFUNCTION"]),
          q: "Trace the call Search(0, \"Lemon\"). Show each call made and the value finally returned.",
          steps: [["Search(0): Lemon < Mango, so Search(1, \"Lemon\").", "MP1", "First recursive call goes left"],
            ["Search(1): Lemon > Fig, so Search(4, \"Lemon\"). Search(4): Lemon > Kiwi, so Search(−1, \"Lemon\").", "MP2", "Right twice, the last pointer null"],
            ["Search(−1) is the base case and returns False; False is passed back through every call, so the result is False after 4 calls.", "MP3", "Base case, and the value returned up the stack"]] },
        { v: "E", t: "The tree that is as deep as it is long", m: 2,
          q: "Five different numbers are inserted into an empty binary search tree. Describe an insertion order that gives the tree the greatest possible height, and the shape that results.",
          steps: [["Insert them in ascending (or descending) order, for example 10, 15, 20, 25, 30.", "MP1", "Sorted order"],
            ["Each new number becomes the only child of the one before, so the tree is a single chain of 5 levels, like a linked list.", "MP2", "One child each: height 5"]] }
      ]
    }],
    practice: [
      [1, 1, "State the name given to a node in a tree that has no children.", ["Leaf (node) (1)"]],
      [1, 1, "In a pointer table for a binary tree, state what the value −1 in the Left array means.", ["The node has no left child / it is a null pointer (1)"]],
      [2, 2, "The values 50, 30, 70, 20, 40, 60, 80 are inserted, in that order, into an empty binary search tree. Describe the tree.", ["50 is the root, with 30 on its left and 70 on its right (1)", "30 has children 20 (left) and 40 (right); 70 has children 60 (left) and 80 (right) (1)"]],
      [2, 3, "The values 50, 30, 70, 20, 40, 60, 80, 45, 65 are inserted, in that order, into an empty binary search tree held in arrays Data, Left and Right (first item at index 0, −1 for no child). Give the Left and Right values at indexes 0, 4 and 5.", ["Index 0 (50): Left 1, Right 2 (1)", "Index 4 (40): Left −1, Right 7 (1)", "Index 5 (60): Left −1, Right 8 (1)"]],
      [2, 2, "Explain why the order in which values are inserted affects how quickly a binary search tree can be searched.", ["Sorted input gives a chain whose height is n, so a search may visit every node (1)", "A balanced tree's height is about log2 n, so far fewer nodes are visited (1)"]],
      [3, 3, "Explain why every binary tree is a rooted tree but not every rooted tree is a binary tree. Give an example.", ["A binary tree has a root from which every other node descends (1)", "But a binary tree also limits each node to at most two children (1)", "e.g. a folder holding three sub-folders is a rooted tree that is not binary (1)"]],
      [3, 2, "Give an order in which 1, 2, 3, 4, 5, 6, 7 could be inserted into an empty binary search tree so that it has the smallest possible height, and state that height.", ["e.g. 4, 2, 6, 1, 3, 5, 7: the middle value first, then the middle of each half (1)", "3 levels (1)"]]
    ]
  };

  /* ================= 4.3.1 Graph traversal ================= */
  L["4.3.1.1"] = {
    archetypes: [{
      id: "cs.graph-traversal",
      rules: ["Breadth-first: visit a vertex, then ALL its neighbours, then theirs. A QUEUE holds the vertices waiting: add at the rear, take from the front.",
        "Depth-first: follow one path as far as it goes, then backtrack. It uses a STACK, or recursion (the call stack is the stack).",
        "Mark a vertex visited as you meet it, and take neighbours in the order the question says (alphabetical, or by index).",
        "In a recursive trace, write the call stack down as you go: when a call ends you return to the loop in the call below it.",
        "Uses: breadth-first finds a shortest path (fewest edges) in an unweighted graph; depth-first navigates a maze and checks what can be reached."],
      traps: [Q045, Q046],
      variations: [
        { v: "A", t: "Breadth-first, showing the queue", m: 4,
          ctx: "An undirected graph is given by its adjacency list. Neighbours are taken in the order listed.",
          code: GRAPH7,
          q: "Show the contents of the queue after each vertex is visited, and the order in which the vertices are visited, in a breadth-first traversal starting at A.",
          steps: [["Visit A; B and C join the queue: [B, C].", "MP1", "Neighbours of A queued in order"],
            ["Visit B; D and E join the rear: [C, D, E].", "MP2", "A is already discovered and is not queued again"],
            ["Visit C; F joins: [D, E, F]. Visit D; nothing new: [E, F]. Visit E; G joins: [F, G]. Then F, then G: the queue is empty.", "MP3", "Only undiscovered vertices join"],
            ["Order: A, B, C, D, E, F, G.", "MP4", "The visiting order"]] },
        { v: "B", t: "Depth-first, by recursion", m: 3,
          code: GRAPH7,
          q: "Give the order in which the vertices are visited in a recursive depth-first traversal starting at A, taking neighbours in the order listed. State the largest number of calls on the call stack at any time.",
          steps: [["A, then B, then D. D has no unvisited neighbour, so back to B.", "MP1", "Deep first, then backtrack"],
            ["B → E → F → C. C's neighbours A and F are visited, so back to F, then E; E → G. Order: A, B, D, E, F, C, G.", "MP2", "The full order"],
            ["The stack is deepest at A, B, E, F, C: 5 calls.", "MP3", "Count the open calls, not the vertices visited"]] },
        { v: "C", t: "Trace a recursive traversal over an adjacency matrix", m: 6,
          ctx: "Graph is the adjacency matrix below (1 = an edge). Every element of Visited starts False.",
          code: MATRIX6.concat([""]).concat(EXPLORE),
          q: "Trace the call Explore(0). Show each call to Explore in order and the output.",
          steps: [["Explore(0) outputs 0. N = 1 is an unvisited neighbour, so it calls Explore(1).", "MP1", "First call made at N = 1"],
            ["Explore(1) outputs 1. N = 0 is visited; N = 3 is not, so it calls Explore(3).", "MP2", "The visited check skips 0"],
            ["Explore(3) outputs 3. N = 1 is visited; N = 2 is not, so it calls Explore(2) BEFORE reaching 4.", "MP3", "The loop's order decides the next call"],
            ["Explore(2) outputs 2 and calls Explore(5), which outputs 5. 5 has no unvisited neighbour, so Explore(5) and then Explore(2) end.", "MP4", "Two returns"],
            ["Back in Explore(3) the loop carries on to N = 4: Explore(4) outputs 4. 4's neighbours 0 and 3 are visited.", "MP5", "Resume the caller's loop where it stopped"],
            ["Explore(4), (3), (1) and (0) end with no more calls. Output: 0, 1, 3, 2, 5, 4.", "MP6", "The full output, no extra calls"]],
          trap: "Restarting the loop at N = 0 after a call returns is the usual slip: the caller carries on from the next N." },
        { v: "D", t: "Name the traversal and its purpose", m: 2,
          q: "Explore is called once, Explore(0), and then the program checks whether every element of Visited is True. State which type of traversal Explore performs and the purpose of the program.",
          steps: [["Depth-first: it calls itself on the first unvisited neighbour before trying the others, and backtracks when a call ends.", "MP1", "Depth-first, with the reason"],
            ["To find whether every vertex can be reached from vertex 0, that is, whether the graph is connected.", "MP2", "What the result tells you"]] },
        { v: "E", t: "Choose the traversal for the job", m: 2,
          q: "A puzzle game needs the fewest moves between two squares of a board, where every move costs the same. State which traversal should be used, and explain why.",
          steps: [["Breadth-first.", "MP1", ""],
            ["It visits vertices in order of their number of edges from the start, so the first time the target is reached is by a path with the fewest moves.", "MP2", "Level by level gives the shortest path when every edge costs the same"]] }
      ]
    }],
    practice: [
      [1, 1, "State the data structure that holds the vertices waiting to be visited in a breadth-first traversal.", ["Queue (1)"]],
      [1, 1, "State one application of a depth-first traversal.", ["Navigating / solving a maze, or finding whether a route between two vertices exists (1)"]],
      [2, 3, "A graph has the adjacency list S: A, B; A: S, C, D; B: S, D; C: A, E; D: A, B, E; E: C, D. Give the order in which the vertices are visited by a breadth-first traversal from S, taking neighbours in the order listed.", ["S, A, B (1)", "then C, D (1)", "then E (1)"]],
      [2, 3, "For the same graph (S: A, B; A: S, C, D; B: S, D; C: A, E; D: A, B, E; E: C, D), give the order of a recursive depth-first traversal from S, taking neighbours in the order listed.", ["S, A, C (1)", "then E, D (1)", "B last (1)"]],
      [2, 2, "Explain why a recursive depth-first traversal must check whether a vertex has been visited before calling itself on it.", ["Otherwise it would follow an edge back to a vertex it came from / round a cycle (1)", "and keep calling itself for ever, until the stack overflows (1)"]],
      [3, 3, "Explain why a breadth-first traversal finds a shortest path in an unweighted graph but not necessarily in a weighted graph.", ["It reaches vertices in order of how many edges they are from the start (1)", "So the first path found to a vertex uses the fewest edges (1)", "With weights, a path with more edges can have a smaller total weight, so an algorithm such as Dijkstra's is needed (1)"]],
      [3, 4, "Describe how a breadth-first traversal of a graph works, including how it avoids visiting a vertex twice.", ["The start vertex is added to a queue and marked as discovered (1)", "The vertex at the front of the queue is removed and visited (1)", "Each of its neighbours not yet discovered is marked and added to the rear of the queue (1)", "This repeats until the queue is empty (1)"]]
    ]
  };

  /* ================= 4.3.2 Tree traversal ================= */
  L["4.3.2.1"] = {
    archetypes: [{
      id: "cs.tree-traversal",
      rules: ["Pre-order: node, left, right. In-order: left, node, right. Post-order: left, right, node.",
        "Check by hand: put a dot on each node's left side (pre), underneath (in) or right side (post), and trace round the outside of the tree anticlockwise from the root.",
        "In-order on a binary search tree outputs the values in ascending order; visit right before left for descending order.",
        "Uses: pre-order copies a tree (and gives prefix); in-order gives sorted output; post-order deletes a tree (children before parent) and turns an expression tree into Reverse Polish.",
        "In a stack-based trace, write the stack after every push and every pop; a value is output when it is popped, never when it is pushed."],
      traps: [{ text: "Outputting a node as it is pushed turns an in-order trace into a pre-order one. In the stack version, output happens on the pop." }],
      variations: [
        { v: "A", t: "In-order output from a pointer table", m: 2,
          code: NUMS,
          q: "Give the output of an in-order traversal of the tree.",
          steps: [["The left subtree of 40 first: 10, 25, 30, 35.", "MP1", "Left subtree, itself in order"],
            ["Then 40, then the right subtree: 55, 60, 70.", "MP2", "Root, then right subtree"]],
          trap: "An in-order traversal of a binary search tree must come out sorted. If yours does not, look again." },
        { v: "B", t: "Pre-order and post-order", m: 2,
          code: NUMS,
          q: "Give the output of (i) a pre-order and (ii) a post-order traversal of the tree.",
          steps: [["(i) Pre-order: 40, 25, 10, 30, 35, 60, 55, 70.", "MP1", "Node before its subtrees"],
            ["(ii) Post-order: 10, 35, 30, 25, 55, 70, 60, 40.", "MP2", "Node after its subtrees: the root is last"]] },
        { v: "C", t: "Trace a stack-based in-order traversal", m: 5,
          ctx: "The tree is held in the pointer table below.",
          code: NUMS.concat(["", "Current <- Root",
            "Done <- False",
            "WHILE Done = False",
            "  IF Current <> -1 THEN",
            "    Push(Current)",
            "    Current <- Left[Current]",
            "  ELSE IF StackIsEmpty() THEN",
            "    Done <- True",
            "  ELSE",
            "    Current <- Pop()",
            "    OUTPUT Data[Current]",
            "    Current <- Right[Current]",
            "  ENDIF",
            "ENDWHILE"]),
          q: "Trace the algorithm. Show the data values on the stack after each push and pop, and the output.",
          steps: [["40, 25 and 10 are pushed (stack 40, 25, 10). Left[10] is −1, so 10 is popped and output; stack 40, 25.", "MP1", "Down the left edge, then the first pop"],
            ["Right[10] is −1, so 25 is popped and output (stack 40); then 30 is pushed (stack 40, 30).", "MP2", "Pop, then follow Right"],
            ["30 is popped and output; 35 is pushed, then popped and output. The stack is back to 40.", "MP3", "35 is 30's right child"],
            ["40 is popped and output (stack empty); 60 and 55 are pushed, then 55 and 60 are popped and output.", "MP4", "The right subtree, its left edge first"],
            ["70 is pushed and popped and output; Current is −1 and the stack is empty, so Done. Output: 10, 25, 30, 35, 40, 55, 60, 70.", "MP5", "The end condition and the full output"]] },
        { v: "D", t: "Reverse the order of the output", m: 1,
          q: "Describe how the stack-based algorithm could be changed so that the values are output in descending order.",
          steps: [["Swap Left and Right: follow Right pointers where it follows Left, and Left where it follows Right.", "MP1", "Right subtree first gives descending order"]] },
        { v: "E", t: "An expression tree and Reverse Polish", m: 3,
          ctx: "An expression tree has * at its root. The root's left child is + with children 5 and 3; its right child is − with children 9 and 4.",
          q: "Give the post-order traversal of the tree, explain why it is useful, and state the value of the expression.",
          steps: [["Post-order: 5 3 + 9 4 − *", "MP1", "Operands before their operator"],
            ["It is the expression in Reverse Polish notation, which a stack can evaluate without brackets or precedence rules.", "MP2", "Why post-order"],
            ["(5 + 3) × (9 − 4) = 8 × 5 = 40.", "MP3", ""]] }
      ]
    }],
    practice: [
      [1, 1, "State which traversal of a binary search tree outputs its values in ascending order.", ["In-order (1)"]],
      [1, 2, "State which traversal should be used to delete every node of a tree, and why.", ["Post-order (1)", "A node's children are deleted before the node itself, so no pointer to a node not yet deleted is lost (1)"]],
      [2, 2, "Give the pre-order traversal of the tree in the pointer table.", ["Mango, Fig, Apple (1)", "Kiwi, Grape, Pear, Plum (1)"], { code: FRUIT }],
      [2, 2, "Give the post-order traversal of the tree in the pointer table.", ["Apple, Grape, Kiwi, Fig (1)", "Plum, Pear, Mango (1)"], { code: FRUIT }],
      [2, 2, "State one use of a pre-order traversal and explain why the order suits it.", ["Copying a tree (1)", "Each node is visited before its children, so it exists before they are attached to it (1)"]],
      [3, 3, "An expression tree has − at its root. Its left child is * with children 4 and 6; its right child is / with children 8 and 2. Give the post-order traversal and evaluate it.", ["4 6 * first (1)", "then 8 2 / − (1)", "24 − 4 = 20 (1)"]],
      [3, 3, "Values are inserted in descending order into an empty binary search tree, which is then traversed by the stack-based in-order algorithm. Explain the largest number of items the stack holds.", ["Each new value becomes the left child of the one before / every node has only a left child (1)", "The algorithm pushes every node while following Left pointers, before it pops any (1)", "So the stack holds all n items at once (1)"]]
    ]
  };

  /* ================= 4.3.4 Searching ================= */
  L["4.3.4.1"] = {
    archetypes: [{
      id: "cs.search",
      rules: ["Linear search: compare each item in turn from the start until the target is found or the list ends. It works on unsorted data.",
        "Binary search needs SORTED data; each comparison halves the part still to be searched.",
        "Linear search is O(n): in the worst case all n items are compared, so the time grows in direct proportion to n.",
        "Binary search is O(log n): doubling n adds only one comparison.",
        "Worst-case comparisons: linear n; binary ⌊log2 n⌋ + 1, which is 10 for 1,000 items and 20 for 1,000,000."],
      traps: [{ text: "\"Linear search is slow\" is not a reason for O(n). Say the worst case compares every one of the n items." }],
      variations: [
        { v: "A", t: "Count the comparisons", m: 2,
          code: ["Readings = [42, 17, 8, 63, 25, 91, 30, 56]"],
          q: "A linear search starts at the first item. State how many comparisons it makes when searching for (i) 25, (ii) 50.",
          steps: [["(i) 5: 42, 17, 8, 63, then 25 is found at index 4.", "MP1", "Stops as soon as it is found"],
            ["(ii) 8: every item is compared before the search reports not found.", "MP2", "An unsuccessful search is the worst case"]] },
        { v: "B", t: "The complexity of linear search, and why", m: 2,
          q: "State the time complexity of a linear search and explain why it has that complexity.",
          steps: [["O(n).", "MP1", ""],
            ["In the worst case (the item is last, or absent) every one of the n items is compared, so the number of comparisons grows linearly with n.", "MP2", "Worst case, every item"]] },
        { v: "C", t: "Why choose linear search", m: 1,
          q: "Give one advantage of a linear search over a binary search.",
          steps: [["It works on data that is not sorted (so no time is spent sorting it first).", "MP1", "Unsorted data"]] },
        { v: "D", t: "Linear and binary on a big list", m: 3,
          q: "A sorted file holds 1,000,000 customer records. Compare the worst-case number of comparisons for a linear and a binary search, and state when the linear search could still be the better choice.",
          steps: [["Linear search: 1,000,000 comparisons.", "MP1", ""],
            ["Binary search: 20 comparisons (each halves the records left).", "MP2", "⌊log2 1,000,000⌋ + 1"],
            ["If the records were not kept sorted (for example new ones are added at the end), the time to sort them first could outweigh the saving.", "MP3", "Binary search's precondition has a cost"]] }
      ]
    }],
    practice: [
      [1, 1, "State the time complexity of a linear search.", ["O(n) (1)"]],
      [1, 1, "State the condition a list must meet before a binary search can be used on it.", ["It must be sorted (1)"]],
      [2, 2, "A linear search looks for 63 in [42, 17, 8, 63, 25, 91, 30, 56]. State how many comparisons are made, and how many would be made when searching for 99.", ["4 (1)", "8 (1)"]],
      [2, 4, "Write a linear search in pseudo-code that returns the index of Target in the array A of length N, or −1 if it is not there.", ["A loop over the indexes 0 to N − 1 (1)", "Compares A[i] with Target (1)", "Returns i when they match (1)", "Returns −1 only after the loop has finished (1)"]],
      [3, 2, "A list of 50 names is searched once a day, and new names are added to its end at any time. Explain why a linear search may be the better choice.", ["New names make the list unsorted, so it would need sorting before every binary search (1)", "For a short list searched rarely, sorting costs more time than the binary search saves (1)"]],
      [3, 2, "Explain why doubling the length of a list doubles the worst-case time of a linear search but adds only one comparison to a binary search.", ["Linear: the worst case compares every item, so comparisons = n (1)", "Binary: each comparison halves the list, so twice as many items need only one more halving (1)"]]
    ]
  };

  L["4.3.4.2"] = {
    archetypes: [{
      id: "cs.binary-search-trace",
      title: "Trace or explain a binary search",
      match: "binary search",
      rules: ["Keep three values: Low, High and Mid ← (Low + High) DIV 2 (integer division, rounding down).",
        "Target greater than A[Mid]: Low ← Mid + 1. Smaller: High ← Mid − 1. Equal: found.",
        "Not found when Low passes High: write that final row too.",
        "One row of the trace per comparison, so the rows count the comparisons.",
        "O(log n): each comparison halves the items left, so n items need about log2 n comparisons."],
      traps: [{ text: "Setting Low ← Mid (not Mid + 1) can loop for ever on two items. The item at Mid has been checked: leave it out." }],
      variations: [
        { v: "A", t: "Trace a successful search", m: 4,
          code: SORTED15,
          q: "A binary search looks for 45 in the array A. Mid ← (Low + High) DIV 2. Give Low, High, Mid and A[Mid] for each comparison.",
          steps: [["Low 0, High 14, Mid 7, A[7] = 31: 45 > 31, so Low ← 8.", "MP1", ""],
            ["Low 8, High 14, Mid 11, A[11] = 51: 45 < 51, so High ← 10.", "MP2", ""],
            ["Low 8, High 10, Mid 9, A[9] = 42: 45 > 42, so Low ← 10.", "MP3", ""],
            ["Low 10, High 10, Mid 10, A[10] = 45: found after 4 comparisons.", "MP4", ""]] },
        { v: "B", t: "Trace an unsuccessful search", m: 3,
          code: SORTED15,
          q: "Trace a binary search for 20 in the same array, and state how the search ends.",
          steps: [["Mid 7 (31): 20 < 31, High ← 6. Mid 3 (15): 20 > 15, Low ← 4.", "MP1", "The first two halvings"],
            ["Mid 5 (24): 20 < 24, High ← 4. Mid 4 (19): 20 > 19, Low ← 5.", "MP2", "Down to one item, which does not match"],
            ["Now Low (5) > High (4), so the loop stops: 20 is not found, after 4 comparisons.", "MP3", "The end condition"]] },
        { v: "C", t: "The complexity of binary search, and why", m: 2,
          q: "State the time complexity of a binary search and explain why it has that complexity.",
          steps: [["O(log n).", "MP1", ""],
            ["Each comparison halves the number of items still to search, so the number of comparisons grows with the logarithm of n (doubling n adds one).", "MP2", "Halving"]] },
        { v: "D", t: "Complete the algorithm", m: 3,
          code: ["Low <- 0",
            "High <- N - 1",
            "Found <- False",
            "WHILE Found = False AND [gap 1]",
            "  Mid <- (Low + High) DIV 2",
            "  IF A[Mid] = Target THEN",
            "    Found <- True",
            "  ELSE IF A[Mid] < Target THEN",
            "    [gap 2]",
            "  ELSE",
            "    [gap 3]",
            "  ENDIF",
            "ENDWHILE"],
          q: "Complete the binary search algorithm by filling gaps 1 to 3.",
          steps: [["Gap 1: Low <= High.", "MP1", "Stops when the range is empty"],
            ["Gap 2: Low <- Mid + 1.", "MP2", "Target is in the upper half"],
            ["Gap 3: High <- Mid - 1.", "MP3", "Target is in the lower half"]] }
      ]
    }],
    practice: [
      [1, 1, "State the time complexity of a binary search.", ["O(log n) (1)"], { arch: "cs.binary-search-trace" }],
      [1, 1, "State the largest number of comparisons a binary search makes on a sorted list of 1,000 items.", ["10 (1)"], { arch: "cs.binary-search-trace" }],
      [2, 2, "The sorted array Trees holds Ash, Birch, Cedar, Elm, Fir, Hazel, Larch, Maple, Oak, Pine, Rowan, Willow, Yew at indexes 0 to 12. Using Mid ← (Low + High) DIV 2, trace a binary search for Pine.", ["Mid 6 (Larch): Pine > Larch, so Low ← 7 (1)", "Mid 9 (Pine): found after 2 comparisons (1)"], { arch: "cs.binary-search-trace" }],
      [2, 4, "Using the same array Trees, give the indexes examined by a binary search for Beech, and how it ends.", ["Mid 6 (Larch), then Mid 2 (Cedar) (1)", "then Mid 0 (Ash), then Mid 1 (Birch) (1)", "High becomes 0, below Low (1)", "so Beech is not found, after 4 comparisons (1)"], { arch: "cs.binary-search-trace" }],
      [3, 2, "Explain why a binary search on a linked list is not as efficient as one on an array.", ["Binary search jumps straight to the middle item, which needs direct (random) access by index (1)", "A linked list must be followed from its head to reach the middle, so each step costs time in proportion to n (1)"], { arch: "cs.binary-search-trace" }],
      [3, 3, "A sorted list grows from 1,000 to 1,000,000 items. Compare how the worst-case number of comparisons changes for a linear search and a binary search.", ["Linear: from 1,000 to 1,000,000, a thousand times as many (1)", "Binary: from 10 to 20 (1)", "Binary search grows logarithmically: each doubling of n adds one comparison (1)"], { arch: "cs.binary-search-trace" }]
    ]
  };

  L["4.3.4.3"] = {
    archetypes: [{
      id: "cs.bst-search",
      title: "Search a binary search tree",
      match: "binary tree search|search a binary (search )?tree",
      rules: ["Start at the root. Equal: found. Smaller: follow Left. Larger: follow Right.",
        "Stop with 'not found' when the pointer you need to follow is null (−1).",
        "List every node VISITED, including the last one before the null pointer.",
        "A balanced tree takes O(log n) comparisons. Built from sorted data it is a chain, O(n), no better than a linear search.",
        "A recursive version calls itself on ONE subtree; its base cases are a null pointer and a match."],
      traps: [{ text: "Searching both subtrees (as a traversal does) throws away the point of the ordering: a search goes down ONE path." }],
      variations: [
        { v: "A", t: "The nodes visited", m: 2,
          code: NINE,
          q: "List the nodes visited when the tree is searched for 65, and state the result.",
          steps: [["50, then 70 (65 > 50), then 60 (65 < 70), then 65 (65 > 60).", "MP1", "The path from the root"],
            ["Found, after 4 comparisons.", "MP2", ""]] },
        { v: "B", t: "Complete a tree search algorithm", m: 4,
          ctx: "The tree is held in the arrays Data, Left and Right, with −1 as a null pointer.",
          code: ["Current <- Root",
            "Found <- False",
            "WHILE Current <> -1 AND Found = False",
            "  IF Data[Current] = Target THEN",
            "    [gap 1]",
            "  ELSE IF Target < Data[Current] THEN",
            "    [gap 2]",
            "  ELSE",
            "    [gap 3]",
            "  ENDIF",
            "ENDWHILE",
            "[gap 4]"],
          q: "Complete the algorithm so that it outputs whether Target is in the tree.",
          steps: [["Gap 1: Found <- True.", "MP1", ""],
            ["Gap 2: Current <- Left[Current].", "MP2", "Smaller goes left"],
            ["Gap 3: Current <- Right[Current].", "MP3", "Larger goes right"],
            ["Gap 4: OUTPUT Found.", "MP4", "After the loop, not inside it"]] },
        { v: "C", t: "Best and worst trees", m: 3,
          q: "Explain how the shape of a binary search tree affects the time complexity of searching it.",
          steps: [["In a balanced tree each comparison discards about half of the remaining nodes, so a search is O(log n).", "MP1", ""],
            ["If the values were inserted in sorted order, every node has only one child and the tree is a chain.", "MP2", "How a tree becomes unbalanced"],
            ["Then a search may visit all n nodes: O(n), the same as a linear search.", "MP3", ""]] },
        { v: "D", t: "An unsuccessful search", m: 2,
          code: NINE,
          q: "List the nodes visited when the tree is searched for 42, and explain how the search ends.",
          steps: [["50, then 30 (42 < 50), then 40 (42 > 30), then 45 (42 > 40).", "MP1", ""],
            ["42 < 45 but Left[7] is −1, so the search stops: not found, after 4 comparisons.", "MP2", "The null pointer ends it"]] }
      ]
    }],
    practice: [
      [1, 1, "State the time complexity of searching a balanced binary search tree.", ["O(log n) (1)"], { arch: "cs.bst-search" }],
      [1, 1, "In a search of a binary search tree, state what happens when the target is greater than the value at the current node.", ["The search moves to / follows the right child pointer (1)"], { arch: "cs.bst-search" }],
      [2, 2, "The tree in the pointer table is searched for Plum. List the nodes visited and the number of comparisons.", ["Mango, Pear, Plum (1)", "Found after 3 comparisons (1)"], { arch: "cs.bst-search", code: FRUIT }],
      [2, 2, "The same tree is searched for Banana. List the nodes visited and explain how the search ends.", ["Mango, Fig, Apple (1)", "Banana > Apple but Right[3] is −1, so it is not found (1)"], { arch: "cs.bst-search", code: FRUIT }],
      [3, 3, "Compare searching a binary search tree with a binary search of a sorted array.", ["Both discard about half the remaining items at each comparison: O(log n) when the tree is balanced (1)", "A tree can become unbalanced and degrade to O(n), while the array search is always O(log n) (1)", "An item can be inserted into a tree without moving the others; a sorted array must shift items to stay sorted (1)"], { arch: "cs.bst-search" }],
      [3, 2, "A perfectly balanced binary search tree holds 1,023 values. State the largest number of comparisons a search makes, and explain why.", ["10 (1)", "A perfect tree of 1,023 nodes has 10 levels (2^10 − 1 = 1,023), and a search makes at most one comparison per level (1)"], { arch: "cs.bst-search" }]
    ]
  };

  /* ================= 4.3.5 Sorting ================= */
  L["4.3.5.1"] = {
    archetypes: [{
      id: "cs.bubble-sort",
      rules: ["One pass compares each adjacent pair from the start and swaps them when they are out of order; the largest value 'bubbles' to the end.",
        "When asked for passes, write the WHOLE list after each pass, not after each swap.",
        "n items need at most n − 1 passes; with the early exit, a pass with no swaps proves the list sorted.",
        "Improvements: stop when a pass makes no swaps (a flag), and make each pass one comparison shorter because the end is already sorted.",
        "O(n²): up to n − 1 passes of up to n − 1 comparisons."],
      traps: [{ text: "Showing the list after each SWAP when the question asks for each PASS wastes time and often costs the mark." }],
      variations: [
        { v: "A", t: "Three passes", m: 3,
          code: ["Scores = [27, 9, 41, 16, 3, 35, 22]"],
          q: "A bubble sort puts Scores into ascending order. Show the contents of Scores after each of the first three passes.",
          steps: [["After pass 1: [9, 27, 16, 3, 35, 22, 41].", "MP1", "41 has bubbled to the end"],
            ["After pass 2: [9, 16, 3, 27, 22, 35, 41].", "MP2", "35 in place"],
            ["After pass 3: [9, 3, 16, 22, 27, 35, 41].", "MP3", "27 in place; one more pass with swaps is still needed"]] },
        { v: "B", t: "Make it do fewer comparisons", m: 4,
          code: ["FOR Pass <- 1 TO N - 1",
            "  FOR i <- 0 TO N - 2",
            "    IF A[i] > A[i + 1] THEN",
            "      Temp <- A[i]",
            "      A[i] <- A[i + 1]",
            "      A[i + 1] <- Temp",
            "    ENDIF",
            "  ENDFOR",
            "ENDFOR"],
          q: "Describe two changes that would reduce the number of comparisons this bubble sort makes, and explain why each works.",
          steps: [["Add a flag, Swapped, set False at the start of each pass and True whenever a swap is made.", "MP1", "The flag"],
            ["Replace the outer FOR with a loop that stops after a pass in which Swapped stays False, because a pass with no swaps means the list is sorted.", "MP2", "The early exit, with why"],
            ["Make the inner loop one shorter each pass: FOR i <- 0 TO N - 1 - Pass.", "MP3", "The shrinking pass"],
            ["After pass k the largest k items are already in their final places, so comparing them again is wasted.", "MP4", "Why it is safe"]],
          trap: "For [27, 9, 41, 16, 3, 35, 22] the version above makes 36 comparisons; with both changes it makes 20." },
        { v: "C", t: "Complexity and why", m: 3,
          q: "State the time complexity of a bubble sort and explain why it has that complexity.",
          steps: [["O(n²).", "MP1", ""],
            ["In the worst case it needs n − 1 passes…", "MP2", ""],
            ["…and each pass makes up to n − 1 comparisons, so about n × n comparisons in total: quadratic.", "MP3", "Passes × comparisons"]] },
        { v: "D", t: "Passes to guarantee a sorted list", m: 1,
          q: "State how many passes a bubble sort with no early exit must make to be sure that a list of 8 items is sorted.",
          steps: [["7 (n − 1): each pass fixes at least one more item at the end, and the last item is then in place too.", "MP1", "n − 1"]] },
        { v: "E", t: "Count the comparisons and swaps", m: 2,
          code: ["A = [5, 12, 18, 9, 25, 30]"],
          q: "A bubble sort with both improvements (the early exit and a pass one shorter each time) sorts A. State how many passes it makes and how many comparisons and swaps in total.",
          steps: [["3 passes: pass 2 leaves it sorted, and pass 3 makes no swaps, which stops the sort.", "MP1", "The confirming pass counts"],
            ["5 + 4 + 3 = 12 comparisons and 2 swaps (18 with 9, then 12 with 9).", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "State the time complexity of a bubble sort.", ["O(n²) (1)"]],
      [1, 1, "State the largest number of passes a bubble sort needs to sort 10 items.", ["9 (1)"]],
      [2, 2, "Show the list [Leo, Ava, Max, Ben, Zoe, Kai] after the first and after the second pass of a bubble sort into alphabetical order.", ["After pass 1: Ava, Leo, Ben, Max, Kai, Zoe (1)", "After pass 2: Ava, Ben, Leo, Kai, Max, Zoe (1)"]],
      [2, 2, "Explain why the largest item is in its final position after the first pass of a bubble sort.", ["Each comparison moves the larger of the pair to the right (1)", "So the largest item is carried all the way to the end, and nothing larger can move it (1)"]],
      [2, 2, "A bubble sort compares every adjacent pair of a 7-item list on every one of its 6 passes. State how many comparisons it makes, and how many if each pass is one comparison shorter than the one before.", ["36 (1)", "21 (1)"]],
      [3, 3, "Explain why a bubble sort with an early exit is a reasonable choice for a list that is nearly sorted, but not for a large unsorted list.", ["A nearly sorted list needs few passes before one makes no swaps; a sorted list needs one pass, O(n) (1)", "A large unsorted list needs about n passes of about n comparisons: O(n²) (1)", "An O(n log n) sort such as merge sort is much faster for large n (1)"]],
      [3, 2, "Explain why a bubble sort is described as a tractable algorithm.", ["It runs in polynomial time, O(n²) (1)", "So it finishes in a reasonable time even for large inputs, unlike an exponential algorithm (1)"]]
    ]
  };

  L["4.3.5.2"] = {
    archetypes: [{
      id: "cs.merge-sort",
      title: "Merge sort: split, merge and its efficiency",
      match: "merge|n log n",
      rules: ["Split: halve the list again and again until every sub-list holds one item (one item is already sorted).",
        "Merge: compare the FRONT items of two sorted lists and move the smaller to the new list; when one list runs out, copy the rest of the other with no more comparisons.",
        "With an odd length, put the extra item in one half consistently (here: the right half).",
        "O(n log n): about log2 n levels of splitting, and the merges at each level handle all n items.",
        "Faster than bubble sort for large n, but it needs extra memory for the merged lists; bubble sort sorts in place."],
      traps: [{ text: "Merging by putting the two lists side by side and re-sorting them misses the point: a merge only ever compares the two front items." }],
      variations: [
        { v: "A", t: "Show the stages for 8 items", m: 4,
          code: ["[38, 12, 45, 7, 29, 3, 18, 50]"],
          q: "Show the stages of a merge sort on the list, splitting it down and merging it back into ascending order.",
          steps: [["Split down to single items: 38 | 12 | 45 | 7 | 29 | 3 | 18 | 50.", "MP1", "Halves, then quarters, then ones"],
            ["Merge pairs: [12, 38] [7, 45] [3, 29] [18, 50].", "MP2", ""],
            ["Merge to fours: [7, 12, 38, 45] [3, 18, 29, 50].", "MP3", ""],
            ["Merge to one list: [3, 7, 12, 18, 29, 38, 45, 50].", "MP4", ""]] },
        { v: "B", t: "Merge two sorted lists", m: 3,
          code: ["Left = [7, 12, 38, 45]", "Right = [3, 18, 29, 50]"],
          q: "Describe how Left and Right are merged into one sorted list, and state how many comparisons are made.",
          steps: [["Compare the front items: 7 v 3 takes 3; 7 v 18 takes 7; 12 v 18 takes 12.", "MP1", "Smaller front item moves each time"],
            ["38 v 18 takes 18; 38 v 29 takes 29; 38 v 50 takes 38; 45 v 50 takes 45.", "MP2", ""],
            ["Left is now empty, so 50 is copied across with no comparison: 7 comparisons, giving [3, 7, 12, 18, 29, 38, 45, 50].", "MP3", "The leftover needs no comparison"]] },
        { v: "C", t: "Complexity and why", m: 3,
          q: "State the time complexity of a merge sort and explain why it has that complexity.",
          steps: [["O(n log n).", "MP1", ""],
            ["The list is halved repeatedly, so there are about log2 n levels of splitting and merging.", "MP2", "Where log n comes from"],
            ["At each level the merges together compare or copy all n items, so the total is about n × log n.", "MP3", "Where n comes from"]] },
        { v: "D", t: "Compare with bubble sort", m: 2,
          q: "Give one advantage and one disadvantage of a merge sort compared with a bubble sort.",
          steps: [["Advantage: much faster on large lists, O(n log n) rather than O(n²).", "MP1", ""],
            ["Disadvantage: it needs extra memory to hold the sub-lists as they are merged, while bubble sort sorts in place with one temporary variable.", "MP2", "Memory, said precisely"]] },
        { v: "E", t: "An odd-length list", m: 3,
          code: ["[14, 6, 23, 9, 31, 2, 17]"],
          q: "Show the stages of a merge sort on this list. When a list has an odd number of items, the extra item goes in the right half.",
          steps: [["Split: [14, 6, 23] and [9, 31, 2, 17]; then [14] [6, 23] and [9, 31] [2, 17], down to single items.", "MP1", "The extra item on the right each time"],
            ["Merge: [6, 23], then [6, 14, 23]; [9, 31] and [2, 17], then [2, 9, 17, 31].", "MP2", ""],
            ["Final merge: [2, 6, 9, 14, 17, 23, 31].", "MP3", ""]] }
      ]
    }],
    practice: [
      [1, 1, "State the time complexity of a merge sort.", ["O(n log n) (1)"]],
      [1, 1, "Which of bubble sort, merge sort, linear search and binary search has time complexity O(n log n)?", ["Merge sort (1)"]],
      [2, 2, "Merge the sorted lists [4, 15, 22] and [9, 11, 30] into one sorted list, and state how many comparisons are made.", ["4, 9, 11, 15, 22, 30 (1)", "5 comparisons (1)"]],
      [2, 3, "Show the stages of a merge sort on [8, 3, 5, 1].", ["Split to [8] [3] [5] [1] (1)", "Merge to [3, 8] and [1, 5] (1)", "Merge to [1, 3, 5, 8] (1)"]],
      [2, 2, "Give one advantage and one disadvantage of a merge sort compared with a bubble sort.", ["Advantage: faster on large lists, O(n log n) rather than O(n²) (1)", "Disadvantage: needs extra memory for the sub-lists / is harder to write (1)"]],
      [3, 3, "Explain why a merge sort is usually written as a recursive subroutine, and identify its base case.", ["Each half is sorted by the same method, so the subroutine calls itself on each half (1)", "Base case: a list of one item (or none) is already sorted and is returned as it is (1)", "When both calls return, the two sorted halves are merged (1)"]],
      [3, 2, "A list of 1,024 items is merge sorted. State how many levels of splitting there are, and roughly how many item moves the merging makes in total.", ["10 levels (1)", "About 1,024 × 10 = 10,240 (1)"]]
    ]
  };
})();
