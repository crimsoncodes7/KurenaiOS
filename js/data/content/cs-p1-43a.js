/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.3.1.1
   (graph traversal), 4.3.2.1 (tree traversal) and 4.3.3.1 (Reverse Polish
   ↔ infix) at full A-level depth, with every program in C#. Each topic
   REPLACES the entry cs-algorithms.js carried and keeps its labs. Every way
   AQA has examined them (7517/1, June 2018–2025) is worked in the mark
   scheme's own format — the traversal type of the cycle finder, in-order
   output, the 2024 seven-mark in-order trace and its reversal, and every
   infix → RPN conversion with the reasons RPN is used. Every C# listing
   (BFS with a queue, DFS recursive and with a stack, the three traversals,
   shunting-yard conversion) was compiled and run under .NET 10. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function node(x, y, label, col, r) {
  return [{ circle: [x, y, r || 17], fill: col || "accent", alpha: 0.18, c: col || "accent", w: 1.6 }, txt(x, y, label, { b: true, size: 11.5, c: "text" })];
}
function link(x1, y1, x2, y2, o) {
  o = o || {};
  var r = o.r || 17, dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy);
  return { line: [[x1 + dx * r / d, y1 + dy * r / d], [x2 - dx * r / d, y2 - dy * r / d]], c: o.c || "text2", w: 1.6, arrow: o.dir ? true : undefined };
}
function badge(x, y, t, col) { return [{ circle: [x, y, 9], fill: col || "accent2", alpha: 0.9, c: col || "accent2", w: 1 }, txt(x, y, t, { b: true, size: 10, c: "text" })]; }

/* =====================================================================
   4.3.1.1  Simple graph-traversal algorithms
   ===================================================================== */
var G25 = { 1: [80, 60], 2: [200, 30], 3: [200, 120], 7: [80, 150], 6: [330, 75], 4: [470, 60], 5: [580, 60] };
function traversalFig() {
  var it = [];
  [[1, 2], [1, 3], [1, 7], [2, 6], [3, 6], [3, 7], [4, 5]].forEach(function (e) { var a = G25[e[0]], b = G25[e[1]]; it.push(link(a[0], a[1], b[0], b[1])); });
  Object.keys(G25).forEach(function (k) { it = it.concat(node(G25[k][0], G25[k][1], k, +k >= 4 && +k <= 5 ? "line" : "accent")); });
  var bfs = { 1: 1, 2: 2, 3: 3, 7: 4, 6: 5 }, dfs = { 1: 1, 2: 2, 6: 3, 3: 4, 7: 5 };
  Object.keys(bfs).forEach(function (k) { it = it.concat(badge(G25[k][0] - 20, G25[k][1] - 20, String(bfs[k]), "good")); });
  Object.keys(dfs).forEach(function (k) { it = it.concat(badge(G25[k][0] + 20, G25[k][1] - 20, String(dfs[k]), "accent2")); });
  it = it.concat(badge(420, 130, "n", "good"));
  it.push(txt(434, 130, "breadth-first order: 1, 2, 3, 7, 6", { size: 10.5, c: "text2", pos: "e" }));
  it = it.concat(badge(420, 154, "n", "accent2"));
  it.push(txt(434, 154, "depth-first order: 1, 2, 6, 3, 7", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(525, 94, "4–5 never reached from 1", { size: 10.5 }));
  return { fig: { w: 640, h: 180, items: it, cap: "A-level 2025's graph traversed from node 1, neighbours taken in list order. Breadth-first spreads out level by level; depth-first runs down one branch (1 → 2 → 6 → 3 → 7) before backtracking." } };
}
C["compsci:4.3.1.1"] = {
  notes: [
    { h: "Graph traversal — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.3.1.1)", body: ["Be able to **trace breadth-first and depth-first search** algorithms and describe **typical applications** of both — breadth-first: **shortest path for an unweighted graph**.", "Depth-first: **navigating a maze**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Name the traversal an algorithm uses", "State", "1", "A-level 2022 Q04.7"],
      ["Trace a recursive depth-first algorithm", "Complete the table", "6", "A-level 2022 Q04.5, 2025 Q03.5 (worked in 4.1.1.16)"],
      ["Purpose of a traversal-based subroutine", "What is the purpose", "1", "A-level 2022 Q04.6 (cycle detection, 4.2.4.1)"],
      ["Applications / comparison of BFS and DFS", "Describe / compare", "1–4", "specification; variations below"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Breadth-first search**.", "**Depth-first search**.", "**Comparing them**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Breadth-first search" },
    traversalFig(),
    { steps: [
      "Mark the start vertex visited and **enqueue** it.",
      "While the queue is not empty: **dequeue** a vertex and process (output) it.",
      "Enqueue each of its neighbours that has not yet been visited, marking each visited as it is enqueued.",
      "Repeat — vertices come out in order of their distance (in edges) from the start."
    ] },
    { code: { lang: "csharp", src: "List<int> Bfs(int start)\n{\n    var order = new List<int>();\n    var visited = new HashSet<int> { start };\n    var q = new Queue<int>();\n    q.Enqueue(start);\n    while (q.Count > 0)\n    {\n        int v = q.Dequeue();\n        order.Add(v);\n        foreach (int n in al[v])\n            if (visited.Add(n)) q.Enqueue(n);     // Add returns false if already visited\n    }\n    return order;\n}\n// al = A-level 2025's adjacency list → Bfs(1) = 1, 2, 3, 7, 6", cap: "Checked by running." } },
    { table: { head: ["Step", "Dequeued (output)", "Neighbours enqueued", "Queue after"], rows: [
      ["0", "—", "1", "[1]"], ["1", "1", "2, 3, 7", "[2, 3, 7]"], ["2", "2", "6 (1 already visited)", "[3, 7, 6]"], ["3", "3", "— (1, 6, 7 visited)", "[7, 6]"], ["4", "7", "—", "[6]"], ["5", "6", "—", "[ ]"]
    ] } },

    { page: "Depth-first search" },
    { code: { lang: "csharp", src: "// recursive: the call stack does the backtracking\nList<int> Dfs(int v, HashSet<int> seen, List<int> order)\n{\n    seen.Add(v);\n    order.Add(v);\n    foreach (int n in al[v])\n        if (!seen.Contains(n)) Dfs(n, seen, order);   // go deep first\n    return order;\n}\n\n// iterative: an explicit stack (neighbours pushed in reverse so they come off in list order)\nList<int> DfsStack(int start)\n{\n    var order = new List<int>(); var seen = new HashSet<int>(); var st = new Stack<int>();\n    st.Push(start);\n    while (st.Count > 0)\n    {\n        int v = st.Pop();\n        if (!seen.Add(v)) continue;\n        order.Add(v);\n        foreach (int n in al[v].Reverse()) if (!seen.Contains(n)) st.Push(n);\n    }\n    return order;\n}\n// both give 1, 2, 6, 3, 7", cap: "Checked by running: the two versions agree." } },
    { worked: { tag: "variation", title: "Trace depth-first from node 1", q: "Trace a recursive depth-first traversal of the 2025 graph (1: 2, 3, 7 · 2: 1, 6 · 3: 1, 6, 7 · 6: 2, 3 · 7: 1, 3) from node 1, taking neighbours in list order. Show the call stack as it backtracks.",
      steps: [
        { m: "Visit 1 → first unvisited neighbour 2 → visit 2 → its first unvisited neighbour is 6 → visit 6.", mk: "1" },
        { m: "From 6: 2 is visited, 3 is not → visit 3. From 3: 1 and 6 visited, 7 not → visit 7.", mk: "1" },
        { m: "7's neighbours 1 and 3 are visited → return to 3 → 6 → 2 → 1; 1's remaining neighbours 3 and 7 are already visited → done.", mk: "1", n: "Stack at the deepest point: 1, 2, 6, 3, 7." }
      ], result: "1, 2, 6, 3, 7" } },
    { diagram: "graph-traversal" },

    { page: "Comparing them" },
    { table: { head: [" ", "Breadth-first (BFS)", "Depth-first (DFS)"], rows: [
      ["Structure", "QUEUE (FIFO)", "STACK (LIFO) — or recursion"],
      ["Order", "all neighbours first, then their neighbours: level by level", "one path as deep as possible, then backtrack"],
      ["Typical use (spec)", "SHORTEST PATH (fewest edges) in an UNWEIGHTED graph", "NAVIGATING A MAZE"],
      ["Other uses", "web crawlers, social-network \"degrees of separation\", broadcasting in a network", "cycle detection (2022's G), path existence (2025's IsPath), topological sort, solving puzzles"],
      ["Memory", "can hold a whole level — large for wide graphs", "holds one path — small for wide, shallow graphs"],
      ["Finds", "the path with fewest edges first", "a path, not necessarily the shortest"]
    ] } },
    { worked: { tag: "variation", title: "Fewest edges by BFS", q: "Using breadth-first search from node 1 in the 2025 graph, find a route to node 6 with the fewest edges, and explain why BFS guarantees it.",
      steps: [
        { m: "Record each vertex's PARENT when it is enqueued: 2, 3 and 7 have parent 1; 6 is first discovered from 2.", mk: "1" },
        { m: "Follow parents back from 6: 6 ← 2 ← 1, so the route is 1 → 2 → 6 (two edges).", mk: "1" },
        { m: "BFS dequeues vertices in order of distance, so the first time a vertex is reached it is by a shortest (fewest-edge) route.", mk: "1", n: "For WEIGHTED graphs use Dijkstra (4.3.6.1) instead." }
      ], result: "1 → 2 → 6" } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"DFS finds the shortest path.\" — it finds A path; only BFS (unweighted) or Dijkstra (weighted) guarantee the shortest.",
      "\"A traversal visits every vertex.\" — only those reachable from the start: 4 and 5 are never reached from 1.",
      "Forgetting to mark vertices visited turns a traversal of a graph with cycles into an infinite loop."
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Which traversal does G use?", src: "A-level June 2022 · P1 Q04.7 · 1 mark",
      q: "FUNCTION G(V, P): Visited[V] ← True; FOR EACH N IN ConnectedNodes[V]: IF Visited[N] = False THEN IF G(N, V) = True THEN RETURN True ENDIF; ELSE IF N ≠ P THEN RETURN True; ENDFOR; RETURN False. State the type of graph traversal used in subroutine G.",
      steps: [{ m: "Depth-first search;", mk: "1", n: "It recurses into the first unvisited neighbour before trying the next one — the call stack is the DFS stack. Its full trace is worked in 4.1.1.16." }],
      result: "Depth-first" } },
    { worked: { tag: "variation", title: "Applications", q: "Describe one typical application of breadth-first search and one of depth-first search, saying why each traversal suits it.",
      steps: [
        { m: "BFS: finding the shortest route (fewest edges) in an unweighted graph, e.g. the fewest connections between two people in a social network — it explores in order of distance from the start.", mk: "2" },
        { m: "DFS: navigating a maze — it follows one corridor to its end, then backtracks to the last junction, exactly like a person exploring with a stack of decisions.", mk: "2" }
      ], result: "BFS → shortest unweighted path; DFS → maze" } },

    { page: "Exam toolkit" },
    { steps: [
      "**BFS = Queue**, level by level; **DFS = Stack/recursion**, deep then back.",
      "**Trace tables**: keep the queue/stack and the visited set as columns; take neighbours in the order given.",
      "**Applications** (spec wording): BFS → shortest path in an unweighted graph; DFS → navigating a maze.",
      "Recognise DFS in code by a recursive call inside a loop over neighbours."
    ] },
    { callout: { t: "mnemonic", h: "\"Queue Breadth, Stack Depth\"", body: "**B**FS waits in a **Q**ueue like people at a bus stop — first come, first served, spreading outward. **D**FS stacks its decisions and **D**ives." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.2.1 queues and 4.2.3.1 stacks; 4.2.4.1 adjacency lists; 4.1.1.16 recursive DFS traces (2022 Q04.5, 2025 Q03.5); 4.3.6.1 Dijkstra for weighted shortest paths; 4.3.2.1 tree traversals are DFS on a tree." } }
  ],
  flashcards: [
    ["BFS uses which data structure?", "A queue."],
    ["DFS uses which data structure?", "A stack (or recursion, using the call stack)."],
    ["BFS typical application?", "Shortest path (fewest edges) in an unweighted graph."],
    ["DFS typical application?", "Navigating a maze."],
    ["BFS order on the 2025 graph from 1?", "1, 2, 3, 7, 6."],
    ["DFS order on the 2025 graph from 1?", "1, 2, 6, 3, 7."],
    ["Traversal used by a recursive cycle finder G(V, P)?", "Depth-first."],
    ["Why mark vertices visited?", "To avoid processing a vertex twice and looping forever round a cycle."],
    ["Does BFS find the shortest path in a weighted graph?", "No — use Dijkstra's algorithm."]
  ],
  quiz: [
    { q: "Which traversal visits all neighbours before going deeper?", opts: ["breadth-first", "depth-first", "in-order", "post-order"], ans: 0, why: "Level by level." },
    { q: "Navigating a maze is the spec's example for", opts: ["depth-first", "breadth-first", "Dijkstra", "binary search"], ans: 0, why: "Follow, then backtrack." },
    { q: "A recursive function calling itself on the first unvisited neighbour is", opts: ["depth-first", "breadth-first", "a binary search", "a bubble sort"], ans: 0, why: "A-level 2022 Q04.7." },
    { q: "BFS from 1 in the 2025 graph never outputs", opts: ["4", "6", "7", "3"], ans: 0, why: "4–5 is a separate component." }
  ],
  sims: ["tl-queue", "tl-stack", "graph-traversal"]
};

/* =====================================================================
   4.3.2.1  Simple tree-traversal algorithms
   ===================================================================== */
function dotsFig() {
  var N = { C: [320, 32], I: [190, 92], B: [450, 92], E: [125, 152], H: [255, 152], Y: [385, 152], Q: [515, 152] };
  var it = [];
  [["C", "I"], ["C", "B"], ["I", "E"], ["I", "H"], ["B", "Y"], ["B", "Q"]].forEach(function (e) { var a = N[e[0]], b = N[e[1]]; it.push(link(a[0], a[1], b[0], b[1])); });
  Object.keys(N).forEach(function (k) {
    it = it.concat(node(N[k][0], N[k][1], k));
    it.push({ circle: [N[k][0] - 21, N[k][1], 3.5], fill: "good", alpha: 1, c: "good", w: 1 });
    it.push({ circle: [N[k][0], N[k][1] + 21, 3.5], fill: "accent2", alpha: 1, c: "accent2", w: 1 });
    it.push({ circle: [N[k][0] + 21, N[k][1], 3.5], fill: "danger", alpha: 1, c: "danger", w: 1 });
  });
  it.push(txt(20, 196, "● left = PRE-order: C I E H B Y Q", { size: 10.5, c: "good", pos: "e" }));
  it.push(txt(230, 196, "● below = IN-order: E I H C Y B Q", { size: 10.5, c: "accent2", pos: "e" }));
  it.push(txt(440, 196, "● right = POST-order: E H I Y Q B C", { size: 10.5, c: "danger", pos: "e" }));
  return { fig: { w: 640, h: 210, items: it, cap: "The dot method: trace a line anticlockwise round the tree starting left of the root; write each node down as the line passes its dot. Pre = left dot, in = bottom dot, post = right dot." } };
}
C["compsci:4.3.2.1"] = {
  notes: [
    { h: "Tree traversal — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.3.2.1)", body: ["Be able to **trace pre-order, post-order and in-order** traversals and describe their uses — pre-order: **copying a tree**.", "In-order: **outputting a binary search tree in ascending order**.", "Post-order: **infix → RPN**, producing a postfix expression from an expression tree, **emptying (deleting) a tree**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Output of a traversal, given another", "State the output", "2", "A-level 2021 Q02.2"],
      ["Trace an iterative traversal with a stack", "Complete the table", "7", "A-level 2024 Q06.2, 2021 Q02.3 (4.2.3.1)"],
      ["Change an algorithm to reverse its output", "Describe the changes", "1", "A-level 2024 Q06.5"],
      ["Uses of each traversal", "Describe", "1–3", "specification"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The three orders**.", "**Recursive traversals in C#**.", "**Iterative traversal with a stack**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The three orders" },
    dotsFig(),
    { table: { head: ["Traversal", "Order at each node", "Use"], rows: [
      ["Pre-order", "NODE, then left subtree, then right subtree", "copying a tree (the root is created before its children); prefix expressions"],
      ["In-order", "left subtree, NODE, right subtree", "outputting a binary search tree in ascending order"],
      ["Post-order", "left subtree, right subtree, NODE", "infix → RPN from an expression tree; emptying/deleting a tree (children before their parent)"]
    ] } },
    { callout: { t: "mnemonic", h: "\"PRE: Parent first. IN: In between. POST: Parent last.\"", body: "The name says where the **node itself** comes relative to its two subtrees — always **left before right**." } },

    { page: "Recursive traversals in C#" },
    { code: { lang: "csharp", src: "string[] data = { \"C\", \"I\", \"E\", \"H\", \"B\", \"Y\", \"Q\" };\nint[] left  = { 1, 2, -1, -1, 5, -1, -1 };\nint[] right = { 4, 3, -1, -1, 6, -1, -1 };\n\nstring Pre(int n)  => n == -1 ? \"\" : data[n] + Pre(left[n]) + Pre(right[n]);\nstring In(int n)   => n == -1 ? \"\" : In(left[n]) + data[n] + In(right[n]);\nstring Post(int n) => n == -1 ? \"\" : Post(left[n]) + Post(right[n]) + data[n];\n\nConsole.WriteLine(Pre(0) + \" \" + In(0) + \" \" + Post(0));   // CIEHBYQ EIHCYBQ EHIYQBC", cap: "The only difference between the three is WHERE the node's own value is added. Checked by running." } },
    { worked: { tag: "variation", title: "Copy, sort, delete", q: "A BST holds 50, 30, 70, 20, 40, 60, 80 (inserted in that order). Give the pre-order, in-order and post-order outputs and say what each is used for here.",
      steps: [
        { m: "Pre-order: 50, 30, 20, 40, 70, 60, 80 — inserting in this order into a new empty BST rebuilds exactly the same shape: a COPY.", mk: "1" },
        { m: "In-order: 20, 30, 40, 50, 60, 70, 80 — ascending: a BST's in-order is always sorted.", mk: "1" },
        { m: "Post-order: 20, 40, 30, 60, 80, 70, 50 — each node comes after its children, so deleting in this order never removes a parent before its children.", mk: "1" }
      ], result: "copy · sorted output · safe deletion" } },
    { diagram: "tl-tree" },

    { page: "Iterative traversal with a stack" },
    { callout: { t: "info", h: "Key idea", body: "Recursion uses the call stack; AQA's 2021 and 2024 algorithms use an explicit array as a stack instead (Pos is the top pointer)." } },
    { code: { lang: "csharp", src: "// A-level 2024 Figure 5: in-order traversal with an explicit stack Temp\nstring[] d = { \"U\", \"K\", \"Y\", \"H\", \"M\" };\nint[] dir1 = { 1, 2, -1, -1, -1 }, dir2 = { 4, 3, -1, -1, -1 };\nvar temp = new int[5]; int pos = -1, current = 0; bool done = false; var output = \"\";\nwhile (!done)\n{\n    while (current != -1) { pos++; temp[pos] = current; current = dir1[current]; }   // go left, pushing\n    if (pos == -1) done = true;\n    else\n    {\n        output += d[temp[pos]];        // visit the node on top\n        current = dir2[temp[pos]];      // then its right subtree\n        pos--;                          // pop\n    }\n}\n// output = YKHUM; swapping dir1 and dir2 gives MUHKY", cap: "Checked by running, including the reversed version for 2024 Q06.5." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "In-order from post-order", src: "A-level June 2021 · P1 Q02.2 · 2 marks",
      q: "A binary tree is stored as Data = [C, I, E, H, B, Y, Q], Dir1 (left) = [1, 2, −1, −1, 5, −1, −1], Dir2 (right) = [4, 3, −1, −1, 6, −1, −1]. The output of a post-order traversal would be E, H, I, Y, Q, B, C. State the output that would be produced by an in-order traversal algorithm.",
      steps: [
        { m: "E, I, H, C, Y, B, Q;", mk: "2", n: "If not fully correct, max 1 for any of: E followed by I then H; Y followed by B then Q; C as the 4th output." }
      ], result: "E I H C Y B Q" } },
    { worked: { tag: "exam", title: "Trace the in-order algorithm", src: "A-level June 2024 · P1 Q06.2 · 7 marks",
      q: "Data = [U, K, Y, H, M], Dir1 = [1, 2, −1, −1, −1], Dir2 = [4, 3, −1, −1, −1]. Done ← False; Pos ← −1; Current ← 0; WHILE Done = False: WHILE Current ≠ −1: Pos ← Pos + 1; Temp[Pos] ← Current; Current ← Dir1[Current]; ENDWHILE; IF Pos = −1 THEN Done ← True ELSE OUTPUT Data[Temp[Pos]]; Current ← Dir2[Temp[Pos]]; Pos ← Pos − 1; ENDIF; ENDWHILE. Complete a table with columns Done, Pos, Temp[0]–[2], Current and OUTPUT.",
      steps: [
        { m: "Done False, Pos −1, Current 0;", mk: "1" },
        { m: "Pos 0, Temp[0] = 0, Current 1;", mk: "1" },
        { m: "Pos 1, Temp[1] = 1, Current 2;", mk: "1" },
        { m: "First output Y (Pos 2 → Temp[2] = 2, Current −1);", mk: "1" },
        { m: "Temp[2] = 2 only; Temp[1] = 1 then 3; Temp[0] = 0 then 4 — no other values;", mk: "1" },
        { m: "Done column correct: False until the end, then True;", mk: "1" },
        { m: "Outputs K, H, U, M follow, with nothing else;", mk: "1", n: "Max 6 if any errors. Output Y K H U M — an IN-ORDER traversal. Checked by running." }
      ], result: "Y K H U M" } },
    { table: { head: ["Done", "Pos", "Temp[0]", "Temp[1]", "Temp[2]", "Current", "OUTPUT"], rows: [
      ["False", "−1", "", "", "", "0", ""], ["", "0", "0", "", "", "1", ""], ["", "1", "", "1", "", "2", ""], ["", "2", "", "", "2", "−1", ""],
      ["", "1", "", "", "", "−1", "Y"], ["", "0", "", "", "", "3", "K"], ["", "1", "", "3", "", "−1", ""], ["", "0", "", "", "", "−1", "H"],
      ["", "−1", "", "", "", "4", "U"], ["", "0", "4", "", "", "−1", ""], ["", "−1", "", "", "", "−1", "M"], ["True", "", "", "", "", "", ""]
    ] } },
    { worked: { tag: "exam", title: "Reverse the output", src: "A-level June 2024 · P1 Q06.5 · 1 mark",
      q: "Describe the changes that need to be made to the algorithm above so that the order that the data values are output in is reversed. You should only describe changes to existing lines; you must not add lines.",
      steps: [{ m: "Change Current ← Dir1[Current] to Current ← Dir2[Current] AND change Current ← Dir2[Temp[Pos]] to Current ← Dir1[Temp[Pos]] // swap Dir1 and Dir2;", mk: "1", n: "Right subtree, node, left subtree = descending: M U H K Y. Both lines must change for the mark." }],
      result: "Swap Dir1 and Dir2" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Pre** = node, left, right · **In** = left, node, right · **Post** = left, right, node.",
      "Use the **dot method** on any drawn tree — fast and reliable.",
      "**Uses**: pre → copy; in → BST in order; post → RPN / delete a tree.",
      "In a trace with an explicit stack, the top pointer (Pos) goes up on every push and down on every pop; a value left above it is dead."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"In-order always gives sorted output.\" — only for a binary SEARCH tree.",
      "\"Post-order is pre-order reversed.\" — for 2021's tree pre-order is CIEHBYQ; reversed, that is QYBHEIC, but post-order is EHIYQBC.",
      "Visiting right before left — every AQA traversal goes LEFT first."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.5.1 trees and BSTs; 4.2.3.1 the explicit stack (2021 Q02.3); 4.1.1.16 recursion; 4.3.3.1 post-order gives RPN; 4.3.1.1 tree traversals are depth-first searches." } }
  ],
  flashcards: [
    ["Pre-order?", "Node, left subtree, right subtree."],
    ["In-order?", "Left subtree, node, right subtree."],
    ["Post-order?", "Left subtree, right subtree, node."],
    ["Use of pre-order?", "Copying a tree."],
    ["Use of in-order?", "Outputting a BST in ascending order."],
    ["Use of post-order?", "Infix → RPN from an expression tree; emptying/deleting a tree."],
    ["In-order of 2021's tree (post-order EHIYQBC)?", "E I H C Y B Q."],
    ["Dot method: in-order dot is…?", "Underneath each node."],
    ["Reverse an in-order output?", "Traverse right before left (swap the left and right pointers)."]
  ],
  quiz: [
    { q: "In-order traversal of a BST outputs", opts: ["the values in ascending order", "the root first", "the leaves first", "level by level"], ans: 0, why: "Left, node, right." },
    { q: "Which traversal is used to empty a tree?", opts: ["post-order", "pre-order", "in-order", "breadth-first"], ans: 0, why: "Children before parents." },
    { q: "For the tree C(I(E, H), B(Y, Q)), pre-order is", opts: ["C I E H B Y Q", "E I H C Y B Q", "E H I Y Q B C", "C B Q Y I H E"], ans: 0, why: "Node first." },
    { q: "2024's algorithm outputs Y K H U M. Swapping Dir1 and Dir2 gives", opts: ["M U H K Y", "U K Y H M", "Y H K M U", "K Y U H M"], ans: 0, why: "Exactly reversed." }
  ],
  sims: ["tl-tree"]
};

/* =====================================================================
   4.3.3.1  Reverse Polish – infix transformations
   ===================================================================== */
function exprTreeFig() {
  var N = { "−": [320, 30], "+": [220, 85], "1": [420, 85], "3": [160, 145], "×": [280, 145], "4": [240, 200], "2": [320, 200] };
  var it = [];
  [["−", "+"], ["−", "1"], ["+", "3"], ["+", "×"], ["×", "4"], ["×", "2"]].forEach(function (e) { var a = N[e[0]], b = N[e[1]]; it.push(link(a[0], a[1], b[0], b[1])); });
  Object.keys(N).forEach(function (k) { it = it.concat(node(N[k][0], N[k][1], k, /[0-9]/.test(k) ? "accent" : "accent2")); });
  it.push(txt(470, 150, "post-order: 3 4 2 × + 1 −", { b: true, size: 11, c: "accent2", pos: "e" }));
  it.push(txt(470, 170, "= the RPN", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(470, 190, "in-order + brackets = infix", { size: 10.5, c: "text2", pos: "e" }));
  return { fig: { w: 640, h: 225, items: it, cap: "The expression tree of 3 + 4 × 2 − 1. Operators are internal nodes, operands are leaves; × is deeper than + because it is done first. A post-order traversal reads off the RPN." } };
}
C["compsci:4.3.3.1"] = {
  notes: [
    { h: "Reverse Polish notation — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.3.3.1)", body: ["Convert simple expressions from **infix to Reverse Polish notation (RPN)** and **vice versa**.", "Be aware of **why and where** RPN is used — it **eliminates brackets**, puts expressions in a form suitable for **evaluation using a stack**, and is used in **stack-based interpreters** such as PostScript and bytecode."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Write an infix expression in RPN", "How would … be represented", "1–2", "A-level 2018 Q02.1–2, 2024 Q05.2"],
      ["Name the notation", "What is the name", "1", "A-level 2024 Q05.1"],
      ["Why RPN is used / its advantages", "Explain / state two", "2", "A-level 2018 Q02.3, 2021 Q05.1"],
      ["How a stack evaluates RPN", "Explain / describe", "3–4", "A-level 2018 Q02.4, 2021 Q05.2 (4.2.3.1)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Infix, prefix, postfix**.", "**Infix → RPN by hand**.", "**RPN → infix and evaluation**.", "**The algorithm in C#**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Infix, prefix, postfix" },
    { table: { head: ["Notation", "Operator goes", "Example", "Brackets needed?"], rows: [
      ["Infix", "BETWEEN its operands", "(3 + 4) × 5", "yes — and precedence rules (BIDMAS)"],
      ["Prefix (Polish)", "BEFORE its operands", "× + 3 4 5", "no"],
      ["Postfix (Reverse Polish)", "AFTER its operands", "3 4 + 5 ×", "no"]
    ] } },
    exprTreeFig(),

    { page: "Infix → RPN by hand" },
    { steps: [
      "Fully bracket the infix expression using the precedence rules: 3 + 4 × 2 − 1 → ((3 + (4 × 2)) − 1).",
      "Working from the innermost brackets, move each operator to just AFTER its two operands: (4 × 2) → 4 2 ×.",
      "Continue outwards: (3 + 4 2 ×) → 3 4 2 × +; then (… − 1) → 3 4 2 × + 1 −.",
      "Check: operands stay in their ORIGINAL left-to-right order — only the operators move."
    ] },
    { table: { head: ["Infix", "RPN"], rows: [
      ["5 − 3", "5 3 −"],
      ["3 + 4 × 2 − 1", "3 4 2 × + 1 −"],
      ["(3 + 4) × 5", "3 4 + 5 ×"],
      ["5 + 2 × 3 + 4", "5 2 3 × + 4 +"],
      ["(6 − 2) × (1 + 3)", "6 2 − 1 3 + ×"],
      ["2 ^ 3 ^ 2 (right-associative)", "2 3 2 ^ ^"]
    ] } },
    { callout: { t: "mnemonic", h: "\"Numbers stay, operators wait\"", body: "Operands keep their order; each operator is written straight after the two things it combines. In RPN the operators appear in the **order they are performed**." } },

    { page: "RPN → infix and evaluation" },
    { steps: [
      "Read left to right. Push each operand.",
      "At an operator, pop the top TWO items — the first popped is the RIGHT operand — and push \"(left op right)\".",
      "At the end the one item left is the infix expression (drop unnecessary brackets)."
    ] },
    { worked: { tag: "variation", title: "Convert and evaluate 6 2 − 1 3 + ×", q: "Convert the RPN expression 6 2 − 1 3 + × to infix and evaluate it.",
      steps: [
        { m: "Push 6, 2; at − pop 2 then 6 → (6 − 2). Push 1, 3; at + → (1 + 3).", mk: "1" },
        { m: "At × pop (1 + 3) then (6 − 2) → (6 − 2) × (1 + 3).", mk: "1" },
        { m: "Evaluate with numbers instead: 6 − 2 = 4; 1 + 3 = 4; 4 × 4 = 16.", mk: "1" }
      ], result: "(6 − 2) × (1 + 3) = 16" } },
    { worked: { tag: "variation", title: "Order matters for − and ÷", q: "Evaluate 8 2 ÷ 3 − and 3 8 2 ÷ −.",
      steps: [
        { m: "8 2 ÷ → pop 2 (right), 8 (left) → 8 ÷ 2 = 4; then 4 3 − = 1.", mk: "1" },
        { m: "3 8 2 ÷ − → 8 ÷ 2 = 4, stack 3 4; − → 3 − 4 = −1.", mk: "1" }
      ], result: "1 and −1" } },
    { diagram: "rpn-eval" },

    { page: "The algorithm in C#" },
    { callout: { t: "info", h: "Key idea", body: "The **shunting-yard** algorithm converts infix to RPN with an operator stack — output operands at once; hold operators on the stack until one of lower precedence (or a closing bracket) arrives." } },
    { code: { lang: "csharp", src: "string ToRpn(string infix)                    // tokens separated by spaces\n{\n    var prec = new Dictionary<string, int> { [\"+\"] = 1, [\"-\"] = 1, [\"*\"] = 2, [\"/\"] = 2, [\"^\"] = 3 };\n    var output = new List<string>();\n    var ops = new Stack<string>();\n    foreach (string t in infix.Split(' '))\n    {\n        if (double.TryParse(t, out _)) output.Add(t);                    // operand → output\n        else if (t == \"(\") ops.Push(t);\n        else if (t == \")\")\n        {\n            while (ops.Peek() != \"(\") output.Add(ops.Pop());             // unwind to the (\n            ops.Pop();\n        }\n        else\n        {\n            while (ops.Count > 0 && ops.Peek() != \"(\" &&\n                   (prec[ops.Peek()] > prec[t] || (prec[ops.Peek()] == prec[t] && t != \"^\")))\n                output.Add(ops.Pop());                                   // higher/equal precedence first\n            ops.Push(t);\n        }\n    }\n    while (ops.Count > 0) output.Add(ops.Pop());\n    return string.Join(\" \", output);\n}\n// \"3 + 4 * 2 - 1\" → \"3 4 2 * + 1 -\" · \"( 6 - 2 ) * ( 1 + 3 )\" → \"6 2 - 1 3 + *\"", cap: "Checked by running on every expression in the table. Evaluation is the stack algorithm in 4.2.3.1." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "5 − 3 in RPN", src: "A-level June 2018 · P1 Q02.1 · 1 mark",
      q: "How would the infix expression 5 − 3 be represented in Reverse Polish notation?",
      steps: [{ m: "5 3 −;", mk: "1" }], result: "5 3 −" } },
    { worked: { tag: "exam", title: "3 + 4 × 2 − 1 in RPN", src: "A-level June 2018 · P1 Q02.2 · 2 marks",
      q: "How would the infix expression 3 + 4 * 2 − 1 be represented in Reverse Polish notation?",
      steps: [
        { m: "Correct order for the values, with + and − either side of the 1;", mk: "1" },
        { m: "* directly after 4 2: 3 4 2 * + 1 −;", mk: "1", n: "Max 1 if any errors." }
      ], result: "3 4 2 * + 1 −" } },
    { worked: { tag: "exam", title: "Why RPN is used", src: "A-level June 2018 · P1 Q02.3 · 2 marks",
      q: "Explain why Reverse Polish notation is sometimes used instead of infix notation.",
      steps: [
        { m: "Simpler for a machine/computer to evaluate // simpler to code the algorithm;", mk: "1", n: "A. easier; R. easier to UNDERSTAND." },
        { m: "Does not need brackets (to show the order of evaluation) // operators appear in the order required for computation // no need for operator precedence // no need to backtrack when evaluating;", mk: "1", n: "Max 2." }
      ], result: "Easier for a machine; no brackets or precedence" } },
    { worked: { tag: "exam", title: "Two advantages of RPN", src: "A-level June 2021 · P1 Q05.1 · 2 marks",
      q: "State two advantages of using Reverse Polish Notation (RPN) instead of infix notation to represent an expression.",
      steps: [
        { m: "Simpler for a machine to evaluate // simpler to code the algorithm;", mk: "1" },
        { m: "No need for brackets // operators appear in the order required for computation // no need for order of precedence // no need to backtrack;", mk: "1", n: "A. RPN expressions cannot be ambiguous (BOD)." }
      ], result: "Machine-friendly; bracket-free" } },
    { worked: { tag: "exam", title: "Name the format", src: "A-level June 2024 · P1 Q05.1 · 1 mark",
      q: "(3 + 4) * 5 is an example of an infix expression. The same expression has been represented as 3 4 + 5 *. What is the name of the expression format used?",
      steps: [{ m: "Reverse Polish (notation) // RPN;", mk: "1", n: "A. postfix." }], result: "Reverse Polish notation" } },
    { worked: { tag: "exam", title: "5 + 2 × 3 + 4 in RPN", src: "A-level June 2024 · P1 Q05.2 · 2 marks",
      q: "Represent the infix expression 5 + 2 * 3 + 4 in the same expression format (Reverse Polish notation).",
      steps: [
        { m: "2 3 * in the expression;", mk: "1" },
        { m: "Correct order of operands, with + symbols either side of the 4: 5 2 3 * + 4 +;", mk: "1", n: "Max 1 if any errors. 5 2 3 * 4 + + has the same value but does not match the scheme: the + signs must sit either side of the 4." }
      ], result: "5 2 3 * + 4 +" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Infix → RPN**: bracket fully, then move each operator after its pair of operands, innermost first.",
      "**RPN → infix**: push operands; at an operator pop right then left and push \"(left op right)\".",
      "**Evaluate**: one stack; push operands; operator → pop two, apply (first pop = right operand), push.",
      "**Why**: easier for machines to evaluate with a stack; no brackets; no precedence; operators in execution order. Used in stack-based interpreters (PostScript, bytecode)."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"RPN is easier for people to read.\" — R. in the mark scheme: it is easier for a MACHINE.",
      "\"RPN reverses the numbers.\" — operands keep their original order; only operators move.",
      "Popping in the wrong order: in 8 2 −, the answer is 8 − 2 = 6, not −6."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.3.1 stacks evaluate RPN; 4.3.2.1 post-order traversal of an expression tree; 4.6.3 interpreters and bytecode; 4.4.2.3 BNF describes infix expression syntax; 4.12 prefix function application in functional languages." } }
  ],
  flashcards: [
    ["RPN of 5 − 3?", "5 3 −."],
    ["RPN of 3 + 4 × 2 − 1?", "3 4 2 × + 1 −."],
    ["RPN of (3 + 4) × 5?", "3 4 + 5 ×."],
    ["RPN of 5 + 2 × 3 + 4?", "5 2 3 × + 4 +."],
    ["Another name for RPN?", "Postfix notation."],
    ["Two advantages of RPN?", "No brackets/precedence needed; simpler for a machine to evaluate with a stack."],
    ["Where is RPN used?", "Stack-based interpreters: PostScript, bytecode (and RPN calculators)."],
    ["Which traversal of an expression tree gives RPN?", "Post-order."],
    ["Infix of 6 2 − 1 3 + ×?", "(6 − 2) × (1 + 3)."],
    ["In RPN evaluation, the first value popped is…?", "The right-hand operand."]
  ],
  quiz: [
    { q: "The RPN of (3 + 4) × 5 is", opts: ["3 4 + 5 ×", "3 4 5 + ×", "× + 3 4 5", "3 + 4 5 ×"], ans: 0, why: "Bracket first." },
    { q: "Evaluate 5 2 3 × + 4 +", opts: ["15", "25", "21", "14"], ans: 0, why: "2×3 = 6, 5+6 = 11, 11+4 = 15." },
    { q: "Which is NOT an accepted reason for using RPN?", opts: ["easier for people to understand", "no brackets needed", "simpler for a machine to evaluate", "operators in the order of computation"], ans: 0, why: "R. easier to understand." },
    { q: "Infix of 8 2 − 3 ×", opts: ["(8 − 2) × 3", "8 − 2 × 3", "8 − (2 × 3)", "(2 − 8) × 3"], ans: 0, why: "− first." }
  ],
  sims: ["rpn-eval"]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
