/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.2.4.1
   (graphs) and 4.2.5.1 (trees, including binary trees) at full A-level
   depth, with every program in C#. Each topic REPLACES the entry
   cs-datastructures.js carried and keeps its labs. Every way AQA has
   examined them (7517/1, June 2018–2025) is worked in the mark scheme's own
   format — adjacency matrices from given graphs, matrix vs list, weighted
   and directed graphs, what makes a graph a tree, the binary-tree search
   with its gaps, and the tree that needs the deepest stack. Every C#
   listing (both representations of the 2018 warehouse graph, the 2025
   matrix, the 2023 array-of-records search, BST insertion) was compiled
   and run under .NET 10. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function node(x, y, label, col, r) {
  return [{ circle: [x, y, r || 17], fill: col || "accent", alpha: 0.18, c: col || "accent", w: 1.6 }, txt(x, y, label, { b: true, size: 11.5, c: "text" })];
}
/* an edge between node centres, trimmed to the rims; w = weight label; dir = arrowhead */
function link(x1, y1, x2, y2, o) {
  o = o || {};
  var r = o.r || 17, dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy);
  var a = [x1 + dx * r / d, y1 + dy * r / d], b = [x2 - dx * r / d, y2 - dy * r / d];
  var it = [{ line: [a, b], c: o.c || "text2", w: 1.6, arrow: o.dir ? true : undefined }];
  if (o.w != null) {
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, nx = -dy / d, ny = dx / d, off = o.off || 11;
    it.push(txt(mx + nx * off, my + ny * off, String(o.w), { b: true, size: 11, c: "accent2" }));
  }
  return it;
}

/* =====================================================================
   4.2.4.1  Graphs
   ===================================================================== */
var WH = { 1: [60, 110], 2: [180, 40], 3: [300, 70], 4: [180, 180], 5: [300, 200], 6: [420, 140] };
var WH_E = [[1, 2, 2], [1, 3, 5], [1, 4, 3], [1, 6, 8], [2, 3, 1], [3, 6, 4], [4, 5, 1], [5, 6, 5]];
function warehouseFig() {
  var it = [];
  WH_E.forEach(function (e) { var a = WH[e[0]], b = WH[e[1]]; it = it.concat(link(a[0], a[1], b[0], b[1], { w: e[2], off: e[0] === 1 && e[1] === 6 ? -11 : 11 })); });
  Object.keys(WH).forEach(function (k) { it = it.concat(node(WH[k][0], WH[k][1], k, "accent")); });
  it.push(txt(470, 40, "weighted, undirected", { b: true, size: 11, c: "text", pos: "e" }));
  it.push(txt(470, 60, "6 vertices · 8 edges", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(470, 80, "weights = minutes", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(470, 100, "cycle: 1–2–3–1", { size: 10.5, c: "danger", pos: "e" }));
  return { fig: { w: 640, h: 225, items: it, cap: "A-level 2018's warehouse graph: six locations, each edge weighted with the travel time in minutes. The cycle 1–2–3–1 is why it is not a tree." } };
}
C["compsci:4.2.4.1"] = {
  notes: [
    { h: "Graphs — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.2.4.1)", body: ["A **graph** represents complex relationships.", "Know typical uses.", "Explain **graph, weighted graph, vertex/node, edge/arc, undirected graph, directed graph**.", "Know how an **adjacency matrix** and an **adjacency list** represent a graph, and **compare** them."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Write the adjacency matrix for a drawn graph", "Complete the table", "1–2", "A-level 2018 Q03.1, 2022 Q04.4, 2025 Q03.3"],
      ["When a list / a matrix is more appropriate", "Explain the circumstances", "2", "A-level 2018 Q03.2, 2019 Q03.5"],
      ["Weighted graph", "Explain", "1", "A-level 2018 Q03.4"],
      ["Which graph uses the whole matrix", "For which type", "1", "A-level 2019 Q03.6"],
      ["Trace / purpose of an algorithm over ConnectedNodes", "Complete / what is the purpose", "1–6", "A-level 2022 Q04"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Vocabulary**.", "**Adjacency matrix**.", "**Adjacency list**.", "**Matrix vs list**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Vocabulary" },
    warehouseFig(),
    { kv: [
      ["Graph", "a set of vertices (nodes) connected by edges (arcs) — models relationships between things"],
      ["Vertex / node", "an object in the graph (a location, a person, a web page)"],
      ["Edge / arc", "a connection between two vertices"],
      ["Weighted graph", "each edge has a weight/value (distance, time, cost)"],
      ["Undirected graph", "edges can be traversed both ways (a two-way road)"],
      ["Directed graph (digraph)", "each edge has a direction, shown by an arrow (a one-way street, \"follows\" on social media)"],
      ["Typical uses", "road and rail maps (shortest routes), computer networks, social networks, web links, project dependencies, state machines (4.4.2.1), puzzles (2019's grid)"]
    ] },
    { fig: { w: 640, h: 120, items: [].concat(
      [txt(160, 14, "undirected", { b: true, size: 11, c: "text" }), txt(480, 14, "directed", { b: true, size: 11, c: "text" })],
      link(80, 60, 240, 60), link(80, 60, 160, 100), node(80, 60, "A"), node(240, 60, "B"), node(160, 100, "C"),
      link(400, 60, 560, 60, { dir: true }), link(560, 60, 480, 100, { dir: true }), link(480, 100, 400, 60, { dir: true }),
      node(400, 60, "A", "good"), node(560, 60, "B", "good"), node(480, 100, "C", "good")
    ), cap: "Undirected: A–B means you can go either way, so the matrix is symmetric. Directed: A→B does not give B→A, so the whole matrix is needed." } },
    { diagram: "dijkstra" },

    { page: "Adjacency matrix" },
    { callout: { t: "info", h: "Key idea", body: "A 2-D array with a row and a column for every vertex: cell [i, j] holds the **weight** of edge i–j (or 1 for an unweighted edge), and **0** (or ∞ / blank) where there is no edge." } },
    { table: { head: ["", "1", "2", "3", "4", "5", "6"], rows: [
      ["1", "0", "2", "5", "3", "0", "8"], ["2", "2", "0", "1", "0", "0", "0"], ["3", "5", "1", "0", "0", "0", "4"],
      ["4", "3", "0", "0", "0", "1", "0"], ["5", "0", "0", "0", "1", "0", "5"], ["6", "8", "0", "4", "0", "5", "0"]
    ] } },
    { kv: [
      ["Undirected", "symmetric about the leading diagonal: [i, j] = [j, i], so only one half is needed"],
      ["Directed", "row = from, column = to; not symmetric — both halves are needed"],
      ["Size", "n × n cells whatever the number of edges — 36 here for 8 edges"],
      ["Edge test", "\"is there an edge i–j?\" is ONE array look-up"]
    ] },
    { code: { lang: "csharp", src: "int[,] am = { {0,2,5,3,0,8}, {2,0,1,0,0,0}, {5,1,0,0,0,4},\n              {3,0,0,0,1,0}, {0,0,0,1,0,5}, {8,0,4,0,5,0} };\n\nbool sym = true;\nfor (int i = 0; i < 6; i++)\n    for (int j = 0; j < 6; j++)\n        if (am[i, j] != am[j, i]) sym = false;\nConsole.WriteLine(sym);            // True — undirected\nConsole.WriteLine(am[2, 5]);       // 4 — the edge 3–6 (C# rows and columns count from 0)", cap: "Checked by running." } },

    { page: "Adjacency list" },
    { callout: { t: "info", h: "Key idea", body: "For each vertex, a list of its **neighbours** (with weights if weighted) — only edges that EXIST are stored." } },
    { table: { head: ["Vertex", "Adjacent (weight)"], rows: [
      ["1", "2 (2), 3 (5), 4 (3), 6 (8)"], ["2", "1 (2), 3 (1)"], ["3", "1 (5), 2 (1), 6 (4)"], ["4", "1 (3), 5 (1)"], ["5", "4 (1), 6 (5)"], ["6", "1 (8), 3 (4), 5 (5)"]
    ] } },
    { code: { lang: "csharp", src: "var al = new Dictionary<int, List<(int To, int W)>>();\nfor (int i = 0; i < 6; i++)\n{\n    al[i + 1] = new();\n    for (int j = 0; j < 6; j++)\n        if (am[i, j] > 0) al[i + 1].Add((j + 1, am[i, j]));   // keep existing edges only\n}\nConsole.WriteLine(string.Join(\" \", al[3].Select(e => e.To + \"(\" + e.W + \")\")));   // 1(5) 2(1) 6(4)\nConsole.WriteLine(al.Values.Sum(l => l.Count));   // 16 entries (each undirected edge twice) vs 36 matrix cells", cap: "Checked by running. AQA's ConnectedNodes[V] (2022) and AL[i] (2025) are adjacency lists." } },

    { page: "Matrix vs list" },
    { table: { head: [" ", "Adjacency matrix", "Adjacency list"], rows: [
      ["Memory", "n² cells always — wasteful for a sparse graph", "proportional to the number of edges — efficient when sparse"],
      ["Is there an edge i–j?", "one look-up — fast", "search i's list — slower"],
      ["List i's neighbours", "scan a whole row (n cells)", "read the list directly"],
      ["Adding/removing edges", "change one cell — easy when edges change often", "edit a list"],
      ["Best when", "the graph is DENSE (many edges), edges change frequently, or edge presence is tested frequently", "the graph is SPARSE (few edges), edges rarely change, presence of specific edges is not tested often"]
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"An adjacency list always uses less memory.\" — for a dense graph the matrix can be smaller: a list stores a vertex id (and a pointer) for every edge, twice for undirected edges.", "\"Weighted means directed.\" — they are independent: the warehouse graph is weighted AND undirected.", "\"A graph must be connected.\" — that is a requirement of a TREE, not of a graph."] } },
    { callout: { t: "mnemonic", h: "Dense → Matrix, Sparse → liSt", body: "**M**any edges → **M**atrix. **S**parse → li**S**t." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Adjacency matrix of the warehouse", src: "A-level June 2018 · P1 Q03.1 · 2 marks",
      q: "A graph shows travel times (minutes) between six warehouse locations 1–6, with edges 1–2 (2), 1–3 (5), 1–4 (3), 1–6 (8), 2–3 (1), 3–6 (4), 4–5 (1) and 5–6 (5). It is represented using an adjacency matrix, with 0 indicating no edge; a value should be written in every cell. Complete the adjacency matrix.",
      steps: [
        { m: "0s in the correct places — every diagonal cell and every pair with no edge;", mk: "1" },
        { m: "All other values correct and symmetric: row 1 = 0 2 5 3 0 8, row 2 = 2 0 1 0 0 0, row 3 = 5 1 0 0 0 4, row 4 = 3 0 0 0 1 0, row 5 = 0 0 0 1 0 5, row 6 = 8 0 4 0 5 0;", mk: "1", n: "An alternative filling only one half was also accepted. I. a non-zero symbol only for a node to itself." }
      ], result: "Symmetric matrix of the weights" } },
    { worked: { tag: "exam", title: "When a list is better", src: "A-level June 2018 · P1 Q03.2 · 2 marks",
      q: "Instead of using an adjacency matrix, an adjacency list could be used to represent the graph. Explain the circumstances in which it would be more appropriate to use an adjacency list instead of an adjacency matrix.",
      steps: [
        { m: "When there are few edges between vertices // the graph/matrix is sparse;", mk: "1", n: "NE. \"few edges\" alone — relate it to the vertices / sparseness." },
        { m: "When edges are rarely changed // when the presence/absence of specific edges does not need to be tested frequently;", mk: "1" }
      ], result: "Sparse; edges rarely changed or tested" } },
    { worked: { tag: "exam", title: "Weighted graph", src: "A-level June 2018 · P1 Q03.4 · 1 mark",
      q: "The warehouse graph is a weighted graph. Explain what is meant by a weighted graph.",
      steps: [{ m: "A graph where each edge has a weight/value associated with it;", mk: "1" }], result: "Every edge carries a value" } },
    { worked: { tag: "exam", title: "When a matrix is better", src: "A-level June 2019 · P1 Q03.5 · 2 marks",
      q: "A graph can be represented using an adjacency list or as an adjacency matrix. Explain the circumstances when it would be more appropriate to use an adjacency matrix instead of an adjacency list.",
      steps: [
        { m: "When there are many edges between vertices // the graph/matrix is not sparse;", mk: "1" },
        { m: "When edges are frequently changed // when the presence/absence of specific edges needs to be tested frequently;", mk: "1" }
      ], result: "Dense; edges change or are tested often" } },
    { worked: { tag: "exam", title: "Using the whole matrix", src: "A-level June 2019 · P1 Q03.6 · 1 mark",
      q: "Only the top half of an adjacency matrix was needed to represent a puzzle graph. For which type of graph would the bottom half of the matrix also need to be used?",
      steps: [{ m: "A directed graph // digraph;", mk: "1", n: "An undirected graph's matrix is symmetric, so half of it repeats the other." }],
      result: "Directed" } },
    { worked: { tag: "exam", title: "Matrix from ConnectedNodes", src: "A-level June 2022 · P1 Q04.4 · 1 mark",
      q: "A graph of four nodes is stored as an adjacency list: ConnectedNodes[0] = [1, 2, 3], [1] = [0, 3], [2] = [0], [3] = [0, 1]. Complete the adjacency matrix (rows and columns 0–3).",
      steps: [{ m: "Row 0: 0 1 1 1 · row 1: 1 0 0 1 · row 2: 1 0 0 0 · row 3: 1 1 0 0;", mk: "1", n: "A. any suitable indicators instead of 0 and 1; A. blank for 0 if consistent." }],
      result: "Symmetric 0/1 matrix" } },
    { worked: { tag: "exam", title: "Matrix for the 2025 graph", src: "A-level June 2025 · P1 Q03.3 · 2 marks",
      q: "A graph has seven nodes and the edges 1–2, 1–3, 1–7, 2–6, 3–6, 3–7 and 4–5. Complete an adjacency matrix (rows and columns 1–7) to represent it.",
      steps: [
        { m: "Any three rows correct;", mk: "1", n: "I. missing values for a node to itself." },
        { m: "Whole table correct: 1: 0110001 · 2: 1000010 · 3: 1000011 · 4: 0000100 · 5: 0001000 · 6: 0110000 · 7: 1010000;", mk: "1", n: "Max 1 if more than two symbols are used. Checked by building it in C#." }
      ], result: "Symmetric, rows as listed" } },
    { worked: { tag: "exam", title: "Check every node was visited", src: "A-level June 2022 · P1 Q04.3 · 2 marks",
      q: "FUNCTION F(): FOR Count ← 0 TO LENGTH(Visited) − 1: IF Visited[Count] = False THEN RETURN False; ENDFOR; RETURN True. For a three-node graph, after the call G(0, −1) Visited[0] is True and Visited[1] is False. Complete a table with columns Count and Value returned for the call F().",
      steps: [
        { m: "Count column: 0, 1;", mk: "1", n: "I. repeated consecutive values." },
        { m: "Value returned: False;", mk: "1", n: "It stops at the first unvisited node — the graph is not connected. Max 1 if any errors." }
      ], result: "Count 0, 1 → False" } },
    { worked: { tag: "exam", title: "Purpose of G", src: "A-level June 2022 · P1 Q04.6 · 1 mark",
      q: "FUNCTION G(V, P) marks V visited, then for each neighbour N: if N is unvisited and G(N, V) returns True, return True; else if N is visited and N ≠ P, return True; finally return False. What is the purpose of the subroutine G?",
      steps: [{ m: "To determine whether a graph contains a cycle or not;", mk: "1", n: "Meeting an already-visited node that is not the one we came from means there are two routes to it — a cycle (traced in 4.1.1.16)." }],
      result: "Cycle detection" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Build a matrix**: one row and column per vertex; weight (or 1) for an edge, 0 otherwise; undirected → symmetric.",
      "**Directed**: row = from, column = to. Only arrows count.",
      "**Matrix vs list**: dense / frequent edge tests / changing edges → matrix; sparse / rarely changed → list. Give the CIRCUMSTANCE, not just \"fewer edges\".",
      "**Definitions**: weighted = values on edges; directed = one-way edges."
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.5.1 a tree is a special graph; 4.3.1.1 breadth- and depth-first traversal; 4.3.6.1 Dijkstra's shortest path on a weighted graph; 4.2.1.2 the matrix is a 2-D array; 4.4.1 representational abstraction (2019's puzzle as a graph); 4.4.2.1 state transition diagrams are directed graphs." } }
  ],
  flashcards: [
    ["Graph?", "A set of vertices/nodes connected by edges/arcs."],
    ["Weighted graph?", "A graph whose edges each have a weight/value."],
    ["Directed graph?", "A graph whose edges have a direction (one-way)."],
    ["Adjacency matrix?", "A 2-D array: cell [i, j] holds the edge weight (or 1) if i and j are joined, else 0."],
    ["Adjacency list?", "For each vertex, a list of its adjacent vertices (and weights)."],
    ["Why is an undirected matrix symmetric?", "Edge i–j is also edge j–i, so [i, j] = [j, i].", 7],
    ["Which graph needs both halves of the matrix?", "A directed graph.", 8],
    ["Memory of a matrix for n vertices?", "n² cells, whatever the number of edges.", 9]
  ],
  quiz: [
    { q: "A sparse graph is best stored as", opts: ["an adjacency list", "an adjacency matrix", "a stack", "a hash table of weights"], ans: 0, why: "Only existing edges are stored." },
    { q: "In an undirected graph's matrix, [3, 6] = 4 means [6, 3] is", opts: ["4", "0", "−4", "unknown"], ans: 0, why: "Symmetric." },
    { q: "Testing whether edge i–j exists is fastest with", opts: ["a matrix", "a list", "a queue", "a linked list"], ans: 0, why: "One look-up." },
    { q: "A one-way street network is a", opts: ["directed graph", "undirected graph", "tree", "binary tree"], ans: 0, why: "Edges have direction." }
  ],
  sims: ["dijkstra"]
};

/* =====================================================================
   4.2.5.1  Trees (including binary trees)
   ===================================================================== */
function treeTermsFig() {
  var N = { C: [320, 28], I: [200, 88], B: [440, 88], E: [140, 150], H: [260, 150], Y: [380, 150], Q: [500, 150] };
  var it = [];
  [["C", "I"], ["C", "B"], ["I", "E"], ["I", "H"], ["B", "Y"], ["B", "Q"]].forEach(function (e) { var a = N[e[0]], b = N[e[1]]; it = it.concat(link(a[0], a[1], b[0], b[1])); });
  Object.keys(N).forEach(function (k) { it = it.concat(node(N[k][0], N[k][1], k, k === "C" ? "accent2" : (k === "I" || k === "B" ? "accent" : "good"))); });
  it.push(txt(360, 28, "root — the only node with no parent", { size: 10.5, c: "accent2", pos: "e" }));
  it.push(txt(56, 88, "I: parent of E and H", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(482, 88, "B and its descendants:", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(482, 104, "a subtree", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(320, 190, "leaves (no children): E, H, Y, Q · height 2 · each node ≤ 2 children → a binary tree", { size: 10.5, c: "good" }));
  return { fig: { w: 640, h: 205, items: it, cap: "A-level 2021's binary tree. A rooted tree has parent–child relationships; every node except the root has exactly one parent." } };
}
function btsFig() {
  var N = { 0: [320, 26, "6"], 1: [220, 86, "3"], 4: [420, 86, "9"], 2: [160, 146, "1"], 3: [280, 146, "4"] };
  var it = [].concat(link(320, 26, 220, 86), link(320, 26, 420, 86), link(220, 86, 160, 146), link(220, 86, 280, 146));
  Object.keys(N).forEach(function (k) { it = it.concat(node(N[k][0], N[k][1], N[k][2], k === "0" || k === "1" || k === "3" ? "accent2" : "accent")); it.push(txt(N[k][0] + 24, N[k][1] - 14, "[" + k + "]", { size: 10, pos: "e" })); });
  it.push(txt(500, 130, "BTS(4): 6 → left → 3 → right → 4 ✓", { size: 10.5, c: "accent2" }));
  it.push(txt(500, 150, "BTS(5): 6 → 3 → 4 → right = −1 → False", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 175, items: it, cap: "A-level 2023's binary search tree stored as an array of records Tree[i] = (Data, Left, Right); −1 means no child." } };
}
C["compsci:4.2.5.1"] = {
  notes: [
    { h: "Trees — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.2.5.1)", body: ["A **tree** is a **connected, undirected graph with no cycles**.", "A **rooted tree** has one vertex designated the **root**, with parent–child relationships (the root is the only node with no parent; all others are its descendants)", "A **binary tree** is a rooted tree in which each node has **at most two children**.", "Know typical uses — commonly a **binary search tree**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Define binary tree / its characteristics", "Define / state", "2", "A-level 2021 Q02.1, 2023 Q03.1"],
      ["The properties that make a graph a tree", "State", "2", "A-level 2024 Q06.1"],
      ["Why a given graph is not a tree", "State", "1–2", "A-level 2018 Q03.3, 2025 Q03.2"],
      ["What a cycle-finder returning True/False tells you", "What can you determine", "1", "A-level 2022 Q04.8"],
      ["Fill the gaps in a binary tree search", "Complete the table", "4", "A-level 2023 Q03.2 (worked in 4.3.4.3)"],
      ["Shape of a tree that needs the deepest stack", "Describe", "2", "A-level 2024 Q06.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Tree, rooted tree, binary tree**.", "**Representing a binary tree**.", "**Binary search trees**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Tree, rooted tree, binary tree" },
    treeTermsFig(),
    { kv: [
      ["Tree", "connected (a path between every pair of vertices) + undirected + no cycles. n vertices → exactly n − 1 edges"],
      ["Rooted tree", "one vertex is the root; parent–child relationships follow"],
      ["Binary tree", "a rooted tree where each node has AT MOST two children (0, 1 or 2 — not exactly 2)"],
      ["Leaf", "a node with no children"],
      ["Subtree", "a node together with all its descendants"],
      ["Uses", "binary search trees (fast search, sorted output), expression trees, file-system directories, decision trees, Huffman coding, syntax (parse) trees"]
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Each node has two children.\" — R. in every mark scheme: it is AT MOST two.",
      "\"A tree must have a root.\" — a tree needn't; a ROOTED tree has one.",
      "\"A graph with no cycles is a tree.\" — it must also be CONNECTED (otherwise it is a forest)."
    ] } },

    { page: "Representing a binary tree" },
    { table: { head: ["Index", "Data", "Left (Dir1)", "Right (Dir2)"], rows: [
      ["[0]", "C", "1", "4"], ["[1]", "I", "2", "3"], ["[2]", "E", "−1", "−1"], ["[3]", "H", "−1", "−1"], ["[4]", "B", "5", "6"], ["[5]", "Y", "−1", "−1"], ["[6]", "Q", "−1", "−1"]
    ] } },
    { code: { lang: "csharp", src: "// 1) parallel arrays / an array of records — AQA's usual representation\nvar tree = new (int Data, int Left, int Right)[]\n{\n    (6, 1, 4), (3, 2, 3), (1, -1, -1), (4, -1, -1), (9, -1, -1)\n};\n\n// 2) objects with references (dynamic)\nclass TreeNode\n{\n    public string Value;\n    public TreeNode Left, Right;   // null = no child\n}", cap: "−1 in an array (or null as a reference) marks a missing child." } },

    { page: "Binary search trees" },
    { callout: { t: "info", h: "Key idea", body: "In a **binary search tree** every value in a node's LEFT subtree is smaller than the node and every value in its RIGHT subtree is larger — so a search discards one subtree at every step." } },
    btsFig(),
    { code: { lang: "csharp", src: "bool BTS(int k)\n{\n    int current = 0;                                        // start at the root\n    while (current > -1)                                    // −1: fell off the tree\n    {\n        if (tree[current].Data == k) return true;\n        else if (tree[current].Data < k) current = tree[current].Right;   // bigger → go right\n        else current = tree[current].Left;                                // smaller → go left\n    }\n    return false;\n}\n// BTS(4) True · BTS(5) False · BTS(9) True", cap: "A-level 2023's search in C#, checked by running." } },
    { code: { lang: "csharp", src: "class Bst\n{\n    class N { public string V; public N L, R; }\n    N root;\n    public void Insert(string v)\n    {\n        if (root == null) { root = new N { V = v }; return; }\n        var c = root;\n        while (true)\n        {\n            if (string.CompareOrdinal(v, c.V) < 0) { if (c.L == null) { c.L = new N { V = v }; return; } c = c.L; }\n            else                                   { if (c.R == null) { c.R = new N { V = v }; return; } c = c.R; }\n        }\n    }\n}\n// insert Norbert, Phil, Judith, Mary, Caspar, Tahir → in-order: Caspar Judith Mary Norbert Phil Tahir", cap: "Insertion follows the same path as a search and adds a leaf where it falls off. Checked: in-order output is sorted." } },
    { worked: { tag: "variation", title: "Insertion order decides the shape", q: "Insert 1, 2, 3, 4, 5 into an empty BST, then 3, 1, 4, 2, 5. Compare the shapes and the worst-case search.",
      steps: [
        { m: "1, 2, 3, 4, 5: each value is larger than all before it, so each becomes a RIGHT child — a chain of height 4.", mk: "1" },
        { m: "3, 1, 4, 2, 5: root 3; 1 and 4 its children; 2 right of 1; 5 right of 4 — height 2.", mk: "1" },
        { m: "Search cost follows the height: the chain needs up to 5 comparisons (O(n)); the balanced tree up to 3 (O(log n)).", mk: "1" }
      ], result: "Sorted input degenerates into a list" } },
    { diagram: "tl-tree" },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Define binary tree", src: "A-level June 2021 · P1 Q02.1 · 2 marks",
      q: "Define the term binary tree.",
      steps: [{ m: "A rooted tree;", mk: "1" }, { m: "Where each node has at most two child nodes;", mk: "1", n: "R. \"each node has two child nodes\"." }],
      result: "Rooted; at most two children" } },
    { worked: { tag: "exam", title: "Two characteristics of a binary tree", src: "A-level June 2023 · P1 Q03.1 · 2 marks",
      q: "A binary tree is a type of data structure. State two characteristics that make a tree a binary tree.",
      steps: [{ m: "A root (start) node // there is a parent–child relationship between nodes;", mk: "1" }, { m: "Each node has no more than two child nodes;", mk: "1", n: "R. has two child nodes." }],
      result: "Root; ≤ 2 children" } },
    { worked: { tag: "exam", title: "The other two tree properties", src: "A-level June 2024 · P1 Q06.1 · 2 marks",
      q: "A binary tree is a rooted tree where each node has at most two child nodes. There are three properties that a graph needs to have for it to be a tree. One of those properties is that it contains no cycles. State the other two properties of this graph that make it a tree.",
      steps: [{ m: "Connected;", mk: "1" }, { m: "Undirected;", mk: "1", n: "A. explanations of connected/undirected." }],
      result: "Connected and undirected" } },
    { worked: { tag: "exam", title: "Why the 2025 graph is not a tree", src: "A-level June 2025 · P1 Q03.2 · 2 marks",
      q: "A graph has seven nodes and the edges 1–2, 1–3, 1–7, 2–6, 3–6, 3–7 and 4–5. State both the reasons why the graph is not a tree.",
      steps: [{ m: "It is not connected (4–5 is separate from the rest);", mk: "1" }, { m: "It has cycles (e.g. 1–3–7–1, 1–2–6–3–1);", mk: "1", n: "Max 1 if an incorrect extra reason is given, e.g. \"directed\"." }],
      result: "Not connected; has cycles" } },
    { worked: { tag: "exam", title: "Why the warehouse graph is not a tree", src: "A-level June 2018 · P1 Q03.3 · 1 mark",
      q: "State one reason why the warehouse graph (edges 1–2, 1–3, 1–4, 1–6, 2–3, 3–6, 4–5, 5–6) is not a tree.",
      steps: [{ m: "It contains a cycle / cycles;", mk: "1", n: "Quick check: 6 vertices but 8 edges — a tree would have exactly 5." }],
      result: "It has a cycle" } },
    { worked: { tag: "exam", title: "When E returns True", src: "A-level June 2022 · P1 Q04.8 · 1 mark",
      q: "FUNCTION E(): set all of Visited to False; IF G(0, −1) = True THEN RETURN False ELSE RETURN F(). G returns True if the graph contains a cycle; F returns True only if every node was visited. If the graph represented by ConnectedNodes is undirected, what can you determine about the graph when a value of True is returned by subroutine E?",
      steps: [{ m: "The graph is a tree;", mk: "1", n: "No cycle (G False) AND every node reached (connected) AND undirected — exactly the three tree properties." }],
      result: "It is a tree" } },
    { callout: { t: "info", h: "See also", body: "The four-mark gap-fill of this search (A-level 2023 Q03.2) is worked in full under 4.3.4.3 Binary tree search." } },
    { worked: { tag: "exam", title: "The tree that fills the stack", src: "A-level June 2024 · P1 Q06.3 · 2 marks",
      q: "An in-order traversal pushes each node onto an array Temp as it follows Left pointers down from the current node, and pops to output. For a five-node tree whose root has a left child with two children of its own and a right child, Temp needs three values. For some five-node binary trees Temp would need five. Describe the structure of a five-node binary tree that would require Temp to store five values.",
      steps: [
        { m: "There is no child node to the right of any node;", mk: "1" },
        { m: "// each child node is to the left of its parent (a chain of left children of depth five);", mk: "1", n: "If not fully correct, max 1 for: each node has at most one child; no node has two children; depth five." }
      ], result: "A chain of left children" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Tree** = connected + undirected + no cycles. **Rooted** = one root, parent–child. **Binary** = at most two children.",
      "**Not a tree?** look for a cycle (edges ≥ vertices) and for a disconnected part.",
      "**BST search**: equal → found; smaller → left; bigger → right; −1/null → not found.",
      "**Array trees**: −1 = no child; trace pointers exactly as given (Dir1/Dir2 may not be called Left/Right)."
    ] },
    { callout: { t: "mnemonic", h: "\"CUNC: Connected, Undirected, No Cycles\"", body: "A **tree** is **C**onnected and **U**ndirected with **N**o **C**ycles. A **rooted** tree adds a root; a **binary** tree adds \"at most two children\"." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.4.1 a tree is a graph; 4.3.2.1 pre-, in- and post-order traversal; 4.3.4.3 binary tree search; 4.3.3.1 expression trees and RPN; 4.1.1.16 recursive tree algorithms; 4.5.6.9 Huffman trees in compression." } }
  ],
  flashcards: [
    ["Tree?", "A connected, undirected graph with no cycles."],
    ["Edges in a tree of n vertices?", "n − 1.", 4],
    ["Binary search tree rule?", "Left subtree smaller, right subtree larger than each node.", 5],
    ["Two reasons a graph may not be a tree?", "It has a cycle; it is not connected (or it is directed).", 6],
    ["−1 in a Left/Right array?", "No child in that direction.", 7],
    ["Worst-case BST shape?", "A chain (sorted insertion order) — search becomes O(n).", 8],
    ["Uses of rooted trees?", "BSTs, expression/syntax trees, file systems, Huffman coding, decision trees.", 9]
  ],
  quiz: [
    { q: "Which is NOT required for a tree?", opts: ["a root", "connected", "undirected", "no cycles"], ans: 0, why: "Only ROOTED trees need one." },
    { q: "A binary tree's nodes have", opts: ["at most two children", "exactly two children", "at least two children", "one child"], ans: 0, why: "R. exactly two." },
    { q: "BTS(5) on 6(3(1, 4), 9) visits", opts: ["6, 3, 4", "6, 9", "6, 3, 1", "every node"], ans: 0, why: "5 < 6 left, 5 > 3 right, 5 > 4 right → none." },
    { q: "A graph with 6 vertices and 8 edges", opts: ["cannot be a tree", "is a binary tree", "must be directed", "is a tree if connected"], ans: 0, why: "A tree has n − 1 = 5 edges." }
  ],
  sims: ["tl-tree"]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
