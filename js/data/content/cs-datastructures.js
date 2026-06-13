/* Kurenai OS — deep content: AQA 7517 §4.2 Data Structures */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.2.1.1"] = {
  notes: [
    { h: "What a data structure actually is" },
    { callout: { t: "tip", body: "A **data structure** is an organised collection of data values plus the operations defined on them. The structure you pick determines what is fast, what is slow, and what is impossible — which is why every algorithms question is secretly a data structures question." }},
    { callout: { t: "def", h: "Key Terminology", body: [
      { kv: [
        ["Data structure", "A collection of data values, organised so they can be stored and operated on efficiently."],
        ["Static data structure", "Size fixed at compile time; memory allocated once, in a contiguous block (e.g. an array)."],
        ["Dynamic data structure", "Grows and shrinks at run time; memory allocated and freed from the heap as needed (e.g. a linked list)."]
      ]}
    ]}},
    { h: "Process: Choosing the right structure" },
    { steps: [
      { h: "1. Predict Volume", m: "If the number of items is known and fixed, use a **static** structure to save on pointer overhead." },
      { h: "2. Assess Access Patterns", m: "If you need to jump to index i instantly, use an **array**. If you only process sequentially, a **list** is viable." },
      { h: "3. Evaluate Mutability", m: "If you are constantly inserting into the middle, a **dynamic** structure avoids O(n) shuffling costs." }
    ]},
    { h: "Static vs dynamic — the comparison the exam wants" },
    { table: { head: ["Feature", "Static (array)", "Dynamic (linked list)"], rows: [
      ["Size", "Fixed when declared", "Grows/shrinks at run time"],
      ["Memory", "May waste space (over-allocate) or overflow (under-allocate)", "Uses only what it needs (+ pointer overhead per node)"],
      ["Access", "Direct/random — index i in O(1)", "Sequential — traverse from the head, O(n)"],
      ["Insert/delete mid-structure", "Slow — shuffle elements", "Fast — re-link pointers, O(1) once located"],
      ["Memory layout", "Contiguous", "Scattered; nodes linked by pointers"]
    ]}},
    { callout: { t: "tip", h: "How comparison marks are awarded", body: "Give PAIRED points: one advantage tied to its mirror-image disadvantage. \u201CAn array gives O(1) access by index, whereas a linked list must be traversed from the head\u201D is one mark; two unconnected facts may not be." }},
    { callout: { t: "miscon", body: "\u201CStatic structures can't be changed.\u201D Wrong — the **size** is fixed, the **contents** are fully mutable. Equally, \u201Cdynamic\u201D doesn't mean stored on disk; it means heap allocation at run time." }},
    { h: "C# view of the same idea" },
    { code: { lang: "csharp", cap: "Array = static; List<T> wraps a dynamic resizing strategy; LinkedList<T> is the true pointer-based dynamic structure.", src:
"int[] scores = new int[8];          // static: size fixed at 8 forever\nList<int> flexible = new List<int>(); // resizes internally (doubling array)\nLinkedList<int> chain = new LinkedList<int>(); // node + pointer per element\n\nflexible.Add(42);                    // amortised O(1)\nchain.AddFirst(42);                  // true O(1), no shuffling ever" }},
    { callout: { t: "memorise", body: "The 25-mark essay-question phrase: a dynamic structure avoids **overflow** (until system memory is exhausted) and avoids **wasted allocation**, at the cost of **pointer storage overhead** and **no random access**." }}
  ],
  flashcards: [
    ["Define a static data structure.", "A structure whose size is fixed at compile time, with memory allocated once in a contiguous block — e.g. an array."],
    ["Define a dynamic data structure.", "A structure that can grow and shrink at run time, taking memory from and returning it to the heap — e.g. a linked list."],
    ["Why can an array access element i in O(1)?", "Contiguous memory: address = base + i × element size, computed directly with no traversal."],
    ["Two costs of dynamic structures?", "Memory overhead for pointers in every node, and sequential (not random) access."],
    ["What is the heap in this context?", "The pool of memory available to a program at run time from which dynamic structures allocate nodes."],
    ["When does a static structure overflow?", "When you try to add more items than the fixed size allocated at compile time."]
  ],
  quiz: [
    { q: "Which is the defining property of a static data structure?", opts: ["Its contents cannot change", "Its size is fixed at compile time", "It is stored on secondary storage", "It can only hold integers"], ans: 1, why: "Static = fixed SIZE. Contents remain fully mutable." },
    { q: "A program must store an unpredictable number of customer records arriving all day. Best fit?", opts: ["A fixed-size array sized generously", "A dynamic structure such as a linked list", "A constant", "A 2D array"], ans: 1, why: "Unknown, changing volume is exactly the dynamic-structure use case — no overflow, no waste." },
    { q: "Why is inserting into the middle of an array O(n)?", opts: ["Arrays are read-only", "The index must be hashed", "Every later element must shuffle one place along", "Arrays are stored on disk"], ans: 2, why: "Contiguity is the price of O(1) access: making a gap means moving everything after it." },
    { q: "Which is NOT an advantage of a linked list over an array?", opts: ["No fixed capacity", "O(1) insertion once positioned", "Direct access to the nth element", "Memory grows with actual need"], ans: 2, why: "Direct/random access is precisely what linked lists give up — they must traverse." }
  ],
  exam: [
    { q: "A developer must choose between an array and a linked list to hold a print queue whose length varies from 0 to thousands of jobs. Compare the two structures and justify a choice.", marks: 6,
      ms: ["Array: fixed size set at compile time (1)", "→ risk of overflow if undersized / wasted memory if oversized (1)", "Linked list: dynamic, grows/shrinks with demand at run time (1)", "Linked list insertion/removal at known position is O(1) pointer re-linking vs O(n) shuffling (1)", "Cost: linked list stores a pointer per node and has no random access (1)", "Justified choice: linked list, because queue length is highly variable and access is only ever at front/rear (1)"] }
  ],
  sims: ["tl-list"]
};

C["compsci:4.2.2.1"] = {
  notes: [
    { h: "Queues: FIFO and its four faces" },
    { callout: { t: "def", h: "Queue Concepts", body: [
      { kv: [["Queue", "A First-In First-Out (FIFO) abstract data type: items join at the rear and leave from the front."]] }
    ]}},
    { callout: { t: "tip", body: "The exam expects four variants and, crucially, **why each exists**. The linear queue's flaw motivates the circular queue; the need for jumping the line motivates the priority queue." }},
    { table: { head: ["Variant", "Behaviour", "Why it exists"], rows: [
      ["Linear", "front and rear pointers march right; dequeued cells are dead space", "Simplest model — but \u201Cfull\u201D even when mostly empty"],
      ["Circular", "Pointers wrap with MOD; freed cells are reused", "Fixes the linear queue's wasted space"],
      ["Priority", "Items leave by priority, FIFO within equal priority", "OS schedulers, A&E triage, print queues with urgent jobs"],
      ["(Double-ended)", "Add/remove at both ends", "Not core AQA but useful context"]
    ]}},
    { h: "Process: Circular Queue Operations" },
    { steps: [
      { h: "Enqueue(item)", m: "1. Check if (size == maxSize). If true, overflow error.\n2. rear = (rear + 1) MOD maxSize.\n3. q[rear] = item.\n4. size = size + 1." },
      { h: "Dequeue()", m: "1. Check if (size == 0). If true, underflow error.\n2. item = q[front].\n3. front = (front + 1) MOD maxSize.\n4. size = size - 1.\n5. Return item." }
    ]},
    { h: "The pointer arithmetic — the actual marks" },
    { code: { lang: "csharp", cap: "Robust Circular Queue implementation in C#.", src:
"public class CircularQueue<T>\n{\n    private T[] q;\n    private int front = 0, rear = -1, size = 0, maxSize;\n\n    public CircularQueue(int capacity)\n    {\n        maxSize = capacity;\n        q = new T[maxSize];\n    }\n\n    public void Enqueue(T item)\n    {\n        if (size == maxSize) throw new OverflowException();\n        rear = (rear + 1) % maxSize;\n        q[rear] = item;\n        size++;\n    }\n\n    public T Dequeue()\n    {\n        if (size == 0) throw new InvalidOperationException(\"Queue empty\");\n        T item = q[front];\n        front = (front + 1) % maxSize;\n        size--;\n        return item;\n    }\n}" }},
    { callout: { t: "mnemonic", body: "**FERL** — **F**ront **E**xits, **R**ear **L**oads. Items always leave from the front and join at the rear; if you ever write the reverse in a trace, FERL catches it." }},
    { callout: { t: "miscon", body: "In a linear queue dequeue, do NOT shuffle every item forward. The standard model just advances the front pointer — shuffling is exactly the inefficiency the model avoids (and examiners mark the pointer move)." }},
    { callout: { t: "tip", h: "Trace-table technique", body: "Columns: operation, value, front, rear, size, then one column per cell. Update pointers BEFORE writing the value on enqueue. Show \u201C(rear + 1) MOD 8 = 0\u201D explicitly when wrapping — the MOD line is routinely a whole mark." }},
    { h: "Where queues appear in real systems" },
    { callout: { t: "def", h: "Real-world Applications", body: [
      { kv: [
        ["I/O Buffering", "Keyboard buffers and print spooling — first pressed, first processed."],
        ["Algorithms", "Breadth-first search uses a queue of vertices to visit (§4.3.1)."],
        ["OS Scheduling", "Process scheduling — priority queues of ready processes."],
        ["Simulations", "Modeling real-world lines (supermarkets, network packets)."]
      ]}
    ]}}
  ],
  flashcards: [
    ["Define a queue.", "A FIFO abstract data type: items are added at the rear and removed from the front."],
    ["Circular enqueue pointer update?", "rear ← (rear + 1) MOD maxSize"],
    ["Why does a circular queue exist?", "A linear queue reports full even when dequeued cells at the front are free; wrapping with MOD reuses them."],
    ["How does a priority queue dequeue?", "Highest-priority item leaves first; FIFO order applies between items of equal priority."],
    ["Which algorithm from §4.3 depends on a queue?", "Breadth-first search — the queue holds discovered-but-unvisited vertices."],
    ["Tests required before enqueue and dequeue?", "Full test before enqueue, empty test before dequeue — each usually carries a mark."]
  ],
  quiz: [
    { q: "A circular queue has maxSize 6, rear = 5. After one enqueue, rear = ?", opts: ["6", "0", "5", "1"], ans: 1, why: "(5 + 1) MOD 6 = 0 — the pointer wraps to reuse freed cells." },
    { q: "Which structure does breadth-first search rely on?", opts: ["Stack", "Queue", "Hash table", "Binary tree"], ans: 1, why: "BFS explores level by level: discovered vertices wait their turn in a FIFO queue." },
    { q: "In a priority queue, two jobs share the same priority. Which leaves first?", opts: ["The larger one", "Random choice", "The one that arrived first", "The one that arrived last"], ans: 2, why: "Within a priority level, behaviour reverts to FIFO." },
    { q: "The fatal flaw of a linear queue implemented in an array?", opts: ["It cannot hold strings", "Dequeued cells at the front are never reused", "It needs two arrays", "MOD is too slow"], ans: 1, why: "Front marches right leaving dead cells; the queue reports full while mostly empty — hence circular queues." },
    { q: "Peeking the front of a queue…", opts: ["removes and returns it", "returns it without removing", "returns the rear", "resets the pointers"], ans: 1, why: "Peek/inspect never mutates — say \u201Cwithout removing\u201D in written answers." }
  ],
  exam: [
    { q: "A circular queue stored in an array of size 5 currently has front = 3, rear = 1, size = 3. Show the pointer values after the operations: dequeue, enqueue(X), enqueue(Y). State any tests performed.", marks: 5,
      ms: ["Dequeue: empty test passes (size 3 ≠ 0) (1)", "front ← (3+1) MOD 5 = 4, size = 2 (1)", "Enqueue X: full test passes; rear ← (1+1) MOD 5 = 2, size = 3 (1)", "Enqueue Y: rear ← (2+1) MOD 5 = 3, size = 4 (1)", "Final state: front = 4, rear = 3, size = 4 (1)"] },
    { q: "Explain why an operating system's process scheduler might use a priority queue rather than a linear queue.", marks: 3,
      ms: ["Some processes (e.g. interrupt handlers / interactive tasks) must run before background tasks (1)", "Priority queue releases highest-priority process first regardless of arrival order (1)", "FIFO within a priority level still guarantees fairness / prevents starvation among equals (1)"] }
  ],
  sims: ["tl-queue"]
};

C["compsci:4.2.3.1"] = {
  notes: [
    { h: "Stacks: LIFO and the call stack" },
    { callout: { t: "def", h: "Stack Concepts", body: [
      { kv: [["Stack", "A Last-In First-Out (LIFO) abstract data type: items are pushed and popped at the same end, the top."]] }
    ]}},
    { table: { head: ["Operation", "Effect", "Guard test first"], rows: [
      ["push(x)", "SP ← SP + 1; stack[SP] ← x", "Is it full? (overflow)"],
      ["pop()", "item ← stack[SP]; SP ← SP − 1", "Is it empty? (underflow)"],
      ["peek() / top()", "return stack[SP] — WITHOUT removing", "Is it empty?"],
      ["isEmpty / isFull", "SP = −1 / SP = maxSize − 1", "—"]
    ]}},
    { h: "Process: Stack Operations" },
    { steps: [
      { h: "Push(item)", m: "1. Check if stack is full. If so, Stack Overflow.\n2. Increment Stack Pointer (SP).\n3. Store item at stack[SP]." },
      { h: "Pop()", m: "1. Check if stack is empty (SP == -1). If so, Stack Underflow.\n2. Copy item from stack[SP].\n3. Decrement Stack Pointer (SP).\n4. Return the item." }
    ]},
    { callout: { t: "def", h: "The phrase that earns the peek mark", body: "Peek \u201Creturns the value at the top of the stack **without removing it**\u201D. Omit the bold phrase and the mark frequently goes with it." }},
    { h: "Why stacks matter: the four canonical uses" },
    { callout: { t: "def", h: "Key Applications", body: [
      { kv: [
        ["Subroutine calls", "Each call pushes a stack frame (return address, parameters, local variables); each return pops one. This IS how recursion works."],
        ["Reversing", "A sequence can be reversed by pushing everything, then popping everything."],
        ["Undo", "Last-in First-out naturally handles undoing the most recent action first."],
        ["RPN Evaluation", "Evaluating Reverse Polish expressions (§4.3.3) — operands push, operators pop two."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "C#'s built-in Stack<T> — note TryPop avoids the underflow exception.", src:
"Stack<string> history = new Stack<string>();\nhistory.Push(\"typed 'hello'\");\nhistory.Push(\"deleted word\");\n\nstring last = history.Peek();   // \"deleted word\" — still on the stack\nif (history.TryPop(out string undone))\n{\n    Console.WriteLine($\"Undoing: {undone}\");  // LIFO: most recent first\n}" }},
    { callout: { t: "mnemonic", body: "**Stack of plates**: you can only take the top plate, and the last plate washed is the first one used. If a trace answer would require lifting a middle plate, it's wrong." }},
    { callout: { t: "warn", body: "Stack **overflow** = push onto a full stack (infinite recursion is the classic cause). Stack **underflow** = pop from an empty one. Written algorithms must test for both — each test is typically one mark." }}
  ],
  flashcards: [
    ["Define a stack.", "A LIFO abstract data type: items are added (pushed) and removed (popped) at the same end — the top."],
    ["What does peek do?", "Returns the top value WITHOUT removing it."],
    ["What is pushed in a stack frame?", "The return address, parameters and local variables of a subroutine call."],
    ["What causes stack overflow in practice?", "Pushing onto a full stack — classically, recursion with no reachable base case."],
    ["Four canonical stack uses?", "Subroutine call/return addresses, reversing, undo, RPN evaluation."],
    ["Pop on SP = −1 is called…?", "Stack underflow — guard with an isEmpty test first."]
  ],
  quiz: [
    { q: "Values 5, 3, 8 are pushed; then two pops. What is popped, in order?", opts: ["5 then 3", "8 then 3", "3 then 8", "8 then 5"], ans: 1, why: "LIFO: last in (8) leaves first, then 3." },
    { q: "Which is stored on the call stack when a subroutine is invoked?", opts: ["The compiled program", "Return address, parameters, locals", "The heap", "The instruction set"], ans: 1, why: "That bundle is the stack frame; the return address is how execution resumes." },
    { q: "peek() differs from pop() because peek…", opts: ["removes two items", "works on queues", "does not remove the item", "returns the bottom"], ans: 2, why: "\u201CWithout removing\u201D is the defining (and mark-bearing) phrase." },
    { q: "Reversing a string with a stack works because…", opts: ["stacks sort alphabetically", "push then pop emits items in reverse order", "stacks are circular", "peek mutates state"], ans: 1, why: "First character pushed is last popped — exactly a reversal." }
  ],
  exam: [
    { q: "Describe how a stack is used to handle subroutine calls, including what happens on call and on return. Refer to recursion in your answer.", marks: 6,
      ms: ["On call, a stack frame is pushed (1)", "Frame contains return address + parameters + local variables (1)", "On return, top frame is popped (1)", "Return address from the popped frame tells the processor where to resume (1)", "Recursion pushes one frame per call, so frames nest LIFO (1)", "Unwinding pops frames in reverse call order; missing base case → frames accumulate → stack overflow (1)"] }
  ],
  sims: ["tl-stack"]
};

C["compsci:4.2.4.1"] = {
  notes: [
    { h: "Graphs: the vocabulary, then the two representations" },
    { callout: { t: "def", h: "Graph Terminology", body: [
      { kv: [
        ["Graph", "A set of vertices (nodes) connected by edges (arcs)."],
        ["Directed graph (digraph)", "Edges have direction: A → B does not imply B → A."],
        ["Weighted graph", "Each edge carries a value (cost, distance, time)."],
        ["Degree of a vertex", "The number of edges incident to it."]
      ]}
    ]}},
    { h: "Process: Choosing a Representation" },
    { steps: [
      { h: "1. Check Density", m: "If edges ≈ vertices², use an **Adjacency Matrix**. If edges ≪ vertices², use an **Adjacency List**." },
      { h: "2. Consider Operations", m: "If frequently testing 'does edge (u,v) exist?', Matrix is O(1). If iterating over all neighbours, List is faster." },
      { h: "3. Monitor Memory", m: "Matrix uses O(V²) space regardless of edges. List uses O(V + E)." }
    ]},
    { h: "Adjacency matrix vs adjacency list — the eternal 4-marker" },
    { table: { head: ["Feature", "Adjacency matrix", "Adjacency list"], rows: [
      ["What it is", "2D array; cell (i, j) holds 1/weight if edge i→j exists", "Per vertex, a list of its neighbours"],
      ["Edge lookup", "O(1) — read one cell", "O(degree) — scan the vertex's list"],
      ["Memory", "n² cells regardless of edges", "Proportional to edges actually present"],
      ["Best for", "Dense graphs, frequent edge tests, edges changing often", "Sparse graphs (most real networks)"],
      ["Undirected graphs", "Matrix is symmetric about the diagonal", "Each edge appears in two lists"]
    ]}},
    { h: "C# Graph Representation" },
    { code: { lang: "csharp", cap: "Adjacency List using a Dictionary of Lists.", src:
"using System.Collections.Generic;\n\npublic class Graph<T>\n{\n    private Dictionary<T, List<T>> adjList = new Dictionary<T, List<T>>();\n\n    public void AddVertex(T vertex)\n    {\n        if (!adjList.ContainsKey(vertex)) adjList[vertex] = new List<T>();\n    }\n\n    public void AddEdge(T source, T destination, bool bidirectional = true)\n    {\n        AddVertex(source);\n        AddVertex(destination);\n        adjList[source].Add(destination);\n        if (bidirectional) adjList[destination].Add(source);\n    }\n}" }},
    { callout: { t: "tip", h: "How to pick in the exam", body: "Tie the choice to the graph **in the question**: \u201Ca road network where most towns connect to only a few others is sparse, so an adjacency list saves the n² memory of a mostly-zero matrix.\u201D Context = the second mark." }},
    { callout: { t: "miscon", body: "A tree is a graph, but a graph is not (usually) a tree. Graph = may contain cycles; tree = connected AND acyclic. If a question says \u201Cgraph\u201D, do not assume a root or a hierarchy exists." }},
    { h: "Where graphs show up" },
    { callout: { t: "tip", h: "Real-world Graph Applications", body: [
      { kv: [
        ["Transport Networks", "Road, rail, or air networks where weights represent distances, times, or costs (used by Dijkstra §4.3.6)."],
        ["Social Networks", "Vertices represent people and edges represent friendships, follows, or interactions."],
        ["The World Wide Web", "A directed graph where vertices are pages and edges are hyperlinks."],
        ["Resource Dependencies", "Project tasks (PERT charts), compiler dependency graphs, or electrical circuit layouts."]
      ]}
    ]}}
  ],
  flashcards: [
    ["Define a weighted graph.", "A graph in which each edge has an associated value such as distance, cost or time."],
    ["Adjacency matrix cell (i, j) holds…?", "1 (or the weight) if an edge runs from vertex i to vertex j; 0/∞ otherwise."],
    ["When is an adjacency list preferred?", "Sparse graphs — memory grows with edges present rather than n², at the cost of slower edge lookup."],
    ["Property of an adjacency matrix for an UNDIRECTED graph?", "Symmetric about the leading diagonal — fill both (i,j) and (j,i)."],
    ["Tree vs graph in one line?", "A tree is a connected graph with no cycles; general graphs may contain cycles."]
  ],
  quiz: [
    { q: "A graph has 100 vertices and 150 edges. Best representation for memory?", opts: ["Adjacency matrix", "Adjacency list", "2D array of strings", "Stack of edges"], ans: 1, why: "150 edges vs 10,000 matrix cells — sparse graphs want lists." },
    { q: "In a directed graph's matrix, row i shows…", opts: ["edges INTO vertex i", "edges OUT of vertex i", "the weight of vertex i", "nothing useful"], ans: 1, why: "Convention: (i, j) = edge from i to j, so row i lists i's outgoing edges." },
    { q: "Checking \u201Cis there an edge A–B?\u201D fastest in…", opts: ["Adjacency list", "Adjacency matrix", "Linked list of all edges", "Binary tree"], ans: 1, why: "One cell read: O(1). The list must scan A's neighbours." },
    { q: "Which statement is true of every tree?", opts: ["It has a root", "It is connected and has no cycles", "Every vertex has two children", "It is directed"], ans: 1, why: "Connected + acyclic is the graph-theoretic definition; a ROOTED tree additionally designates a root." }
  ],
  exam: [
    { q: "A satnav company stores the UK road network (millions of junctions, each connecting to a handful of roads). Justify a representation and state one operation that would be slower in your choice.", marks: 4,
      ms: ["Network is sparse: edges per vertex tiny compared with vertex count (1)", "Adjacency list: memory proportional to actual roads, matrix would need junctions² cells (1)", "Weights (distances/times) stored alongside each neighbour entry (1)", "Slower: testing whether a specific edge exists requires scanning that junction's list rather than one O(1) cell read (1)"] }
  ]
};

C["compsci:4.2.5.1"] = {
  notes: [
    { h: "Trees, rooted trees and the BST" },
    { callout: { t: "def", h: "Tree Terminology", body: [
      { kv: [
        ["Tree", "A connected, undirected graph with no cycles."],
        ["Rooted tree", "A tree with one vertex designated the root; edges implicitly point away from it."],
        ["Binary tree", "A rooted tree where every node has at most two children."],
        ["Binary search tree (BST)", "A binary tree with the ordering rule: left subtree < node < right subtree."]
      ]}
    ]}},
    { h: "Comparison: Trees vs Graphs" },
    { table: { head: ["Feature", "Tree", "Graph"], rows: [
      ["Cycles", "Forbidden (Acyclic)", "Allowed"],
      ["Connectivity", "Must be connected", "Can be disconnected"],
      ["Hierarchy", "Fixed root (in rooted trees)", "No inherent root or hierarchy"],
      ["Edges", "N nodes ⇒ N-1 edges", "No fixed node-to-edge ratio"]
    ]}},
    { h: "Building a BST — order of insertion is everything" },
    { callout: { t: "tip", body: "Insert items **in the order given**, comparing at each node: smaller → go left, larger → go right, insert at the first empty position. Different input orders give differently-shaped trees holding the same data." }},
    { steps: [
      { h: "Insert 50", m: "Tree empty → 50 becomes the root." },
      { h: "Insert 30", m: "30 < 50 → left child of 50." },
      { h: "Insert 70", m: "70 > 50 → right child of 50." },
      { h: "Insert 60", m: "60 > 50 → right; 60 < 70 → left child of 70.", n: "Two comparisons, two recorded decisions — show every hop in exam working." }
    ]},
    { callout: { t: "tip", h: "Why a BST at all", body: "Searching halves the candidates at every comparison → O(log n) on a balanced tree, and an in-order traversal reads the data back **in sorted order** for free. Quote both when asked for advantages." }},
    { callout: { t: "warn", body: "Insert already-sorted data and the BST degenerates into a one-sided chain — effectively a linked list, and search collapses to O(n). \u201CBalanced\u201D is doing all the work in the O(log n) claim; say so." }},
    { code: { lang: "csharp", cap: "Recursive BST insert — note the base case creating the node.", src:
"class Node\n{\n    public int Value;\n    public Node Left, Right;\n    public Node(int v) { Value = v; }\n}\n\nNode Insert(Node root, int v)\n{\n    if (root == null) return new Node(v);      // base case: empty spot found\n    if (v < root.Value)\n        root.Left = Insert(root.Left, v);       // recurse left\n    else if (v > root.Value)\n        root.Right = Insert(root.Right, v);     // recurse right\n    return root;                                 // duplicates ignored\n}" }},
    { h: "Other tree uses worth quoting" },
    { callout: { t: "tip", h: "Tree-based Data Structures", body: [
      { kv: [
        ["Syntax Trees", "Built by compilers to represent the logical structure of program code (§4.3.2 connects: post-order → RPN)."],
        ["Hierarchies", "File system directories and organizational charts are naturally hierarchical trees."],
        ["Decision Trees", "Used in AI and machine learning to map decisions to possible outcomes."],
        ["Compression", "Huffman coding trees are used to compress data based on character frequency."]
      ]}
    ]}}
  ],
  flashcards: [
    ["Define a tree (graph-theoretically).", "A connected, undirected graph with no cycles."],
    ["The BST ordering rule?", "Everything in the left subtree < node < everything in the right subtree."],
    ["In-order traversal of a BST yields…?", "The values in ascending sorted order."],
    ["BST search complexity, balanced vs degenerate?", "O(log n) balanced; O(n) when the tree degenerates into a chain (e.g. sorted-order insertion)."],
    ["What is a leaf node?", "A node with no children."],
    ["Two non-BST uses of trees?", "Syntax trees in compilers; file-system / organisational hierarchies (also: decision trees, Huffman trees)."]
  ],
  quiz: [
    { q: "Insert 40, 20, 60, 10, 30 into an empty BST. The root's left child is…", opts: ["10", "20", "30", "60"], ans: 1, why: "20 < 40 at the first comparison → left child of root 40." },
    { q: "Which traversal of a BST outputs sorted ascending order?", opts: ["Pre-order", "Post-order", "In-order", "Breadth-first"], ans: 2, why: "Left–Node–Right visits smaller values, then the node, then larger — sorted by construction." },
    { q: "Inserting 1, 2, 3, 4, 5 in that order produces…", opts: ["A perfectly balanced tree", "A right-leaning chain", "A left-leaning chain", "A cycle"], ans: 1, why: "Each value exceeds the last, so every insert goes right — the degenerate case." },
    { q: "A binary tree differs from a general rooted tree because…", opts: ["it has no root", "nodes have at most two children", "it must be balanced", "it stores only numbers"], ans: 1, why: "\u201CAt most two children\u201D is the whole definition — balance is NOT required." }
  ],
  exam: [
    { q: "The values 45, 23, 67, 12, 34, 89 are inserted in that order into an empty binary search tree. Draw the tree and state the output of an in-order traversal.", marks: 4,
      ms: ["Root 45 with 23 left, 67 right (1)", "12 left of 23; 34 right of 23 (1)", "89 right of 67 (1)", "In-order: 12, 23, 34, 45, 67, 89 — ascending (1)"] }
  ],
  sims: ["tl-tree"]
};

C["compsci:4.2.6.1"] = {
  notes: [
    { h: "Hash tables: O(1) lookup and the collision problem" },
    { callout: { t: "def", h: "Hashing Concepts", body: [
      { kv: [
        ["Hash table", "A data structure mapping keys to storage locations by applying a hashing function to each key."],
        ["Hashing function", "A function computing a location (index) from a key — e.g. key MOD tableSize."],
        ["Collision", "Two different keys hashing to the same location."],
        ["Rehashing", "Applying a further process to find an alternative location after a collision."]
      ]}
    ]}},
    { h: "Process: A full worked insert" },
    { steps: [
      { h: "Set-up", m: "Table size 11, hash(key) = key MOD 11.\nInsert keys: 23, 45, 34, 56", n: "MOD table-size is the canonical exam hash." },
      { h: "Hash each key", m: "23 MOD 11 = 1\n45 MOD 11 = 1   ← COLLISION with 23\n34 MOD 11 = 1   ← COLLISION again\n56 MOD 11 = 1   ← and again (pathological on purpose)" },
      { h: "Resolve by linear probing", m: "45: slot 1 taken → try 2 → empty → store at 2\n34: 1 taken, 2 taken → store at 3\n56: 1,2,3 taken → store at 4", n: "Linear probing: step forward one slot at a time, wrapping with MOD." }
    ]},
    { h: "Collision-handling strategies" },
    { table: { head: ["Strategy", "How", "Trade-off"], rows: [
      ["Linear probing", "Try next slot, (i+1) MOD size, until free", "Simple; suffers clustering — full runs of occupied slots"],
      ["Chaining", "Each slot holds a linked list of colliding entries", "No clustering; pointer overhead, lookup degrades with chain length"]
    ]}},
    { h: "C# Hash Table (Linear Probing)" },
    { code: { lang: "csharp", cap: "Simple Hash Table with Linear Probing in C#.", src:
"public class SimpleHashTable\n{\n    private int?[] table = new int?[11];\n\n    public void Insert(int key)\n    {\n        int hash = key % table.Length;\n        while (table[hash] != null)\n        {\n            hash = (hash + 1) % table.Length; // Linear probing\n        }\n        table[hash] = key;\n    }\n}" }},
    { callout: { t: "miscon", body: "\u201CA good hash function never collides.\u201D Impossible in general — more possible keys than slots (pigeonhole principle). Good functions MINIMISE and SPREAD collisions; the handling strategy is part of the design, not a failure of it." }},
    { callout: { t: "tip", body: "Searching mirrors inserting: hash the key, check that slot, and if it holds a different key, probe onward exactly as insertion would have. Stop at an empty slot → not present. Examiners want the search to retrace the probe path." }},
    { h: "Why bother: the use cases" },
    { callout: { t: "tip", h: "Applications of Hashing", body: [
      { kv: [
        ["Dictionaries", "Associative arrays mapping keys to values (§4.2.7)."],
        ["Database Indexing", "Using a hash index for O(1) record retrieval from large tables."],
        ["Caches", "Storing web pages or resources by their URL for rapid access."],
        ["Symbol Tables", "Compilers use hash tables to store identifiers and their associated metadata."]
      ]}
    ]}}
  ],
  flashcards: [
    ["Define a collision.", "Two different keys producing the same hash value / location."],
    ["What is linear probing?", "On collision, step to the next slot — (i + 1) MOD tableSize — repeatedly until a free slot is found."],
    ["What is chaining?", "Each table slot holds a linked list; colliding entries append to the list at their hashed slot."],
    ["Why are collisions unavoidable?", "There are more possible keys than table slots, so some keys must share (pigeonhole principle)."],
    ["How does searching handle collisions?", "Retrace the probe sequence: hash, compare, step onward; an empty slot means the key is absent."],
    ["Why might a table be rehashed to a larger size?", "High load factor causes frequent collisions/clustering, degrading O(1) towards O(n)."]
  ],
  quiz: [
    { q: "hash(k) = k MOD 10, table slots 0–9. Where does 47 go (no collisions yet)?", opts: ["4", "7", "0", "9"], ans: 1, why: "47 MOD 10 = 7." },
    { q: "Slot 7 is occupied; linear probing tries…", opts: ["slot 0 always", "slot 8, then 9, then 0…", "a random slot", "slot 6"], ans: 1, why: "Step forward one at a time, wrapping with MOD at the end." },
    { q: "Chaining handles collisions by…", opts: ["rejecting the new key", "storing a linked list at each slot", "doubling the table instantly", "sorting the table"], ans: 1, why: "Colliding entries simply join the list at their slot." },
    { q: "The main performance risk of linear probing is…", opts: ["clustering", "underflow", "cycles", "loss of FIFO order"], ans: 0, why: "Occupied runs grow and merge, lengthening probe sequences — clustering." }
  ],
  exam: [
    { q: "A hash table of size 7 uses hash(k) = k MOD 7 with linear probing. Show the table after inserting 15, 22, 8, 29 and explain each placement.", marks: 5,
      ms: ["15 MOD 7 = 1 → slot 1 (1)", "22 MOD 7 = 1 → collision at 1 (1)", "probe → slot 2 free → 22 at 2 (1)", "8 MOD 7 = 1 → collision; probe 2 taken → slot 3 (1)", "29 MOD 7 = 1 → probe 2, 3 taken → slot 4 (1)"] }
  ]
};

C["compsci:4.2.7.1"] = {
  notes: [
    { h: "Dictionaries: key → value, abstractly" },
    { callout: { t: "def", h: "Dictionary Concepts", body: [
      { kv: [["Dictionary (associative array)", "An abstract data type of (key, value) pairs in which the key is used to look up its associated value."]] }
    ]}},
    { h: "Comparison: Dictionary vs Array" },
    { table: { head: ["Feature", "Dictionary", "Array"], rows: [
      ["Indexing", "Arbitrary keys (String, Object, etc.)", "Sequential integers (0, 1, 2...)"],
      ["Ordering", "Typically unordered (unless specified)", "Ordered by index"],
      ["Lookup", "O(1) average (via Hashing)", "O(1) (via Index)"],
      ["Use Case", "Mapping IDs to Records", "Storing a simple list of items"]
    ]}},
    { h: "Process: Dictionary Lookup" },
    { steps: [
      { h: "1. Provide Key", m: "The user provides the unique key they wish to look up." },
      { h: "2. Hash Key", m: "The system applies a hash function to the key to find the internal array index." },
      { h: "3. Retrieve Value", m: "The value stored at that index (or resolved via collision handling) is returned." }
    ]},
    { callout: { t: "tip", body: "The dictionary is the **interface** (what you can do); the hash table is the usual **implementation** (how it's fast). Keeping those layers separate is precisely the abstraction §4.4.1 cares about." }},
    { code: { lang: "csharp", cap: "C# Dictionary<TKey, TValue> — hash table underneath.", src:
"var stock = new Dictionary<string, int>\n{\n    [\"Berserk Vol 41\"] = 3,\n    [\"Vagabond Vol 22\"] = 1\n};\n\nstock[\"Vinland Saga Vol 18\"] = 5;        // insert / overwrite by key\n\nif (stock.TryGetValue(\"Berserk Vol 41\", out int copies))\n    Console.WriteLine($\"{copies} in stock\");  // O(1) average lookup" }},
    { callout: { t: "tip", body: "AQA likes dictionaries in two places: (1) as the natural structure for lookups by name/ID, and (2) inside other algorithms — Dijkstra's distances table is conceptually a dictionary vertex → best-known-cost." }},
    { callout: { t: "tip", h: "Dictionary Characteristics", body: [
      { kv: [
        ["Key Uniqueness", "Keys must be unique; values can be duplicated."],
        ["Performance", "Average O(1) time for insert, lookup, and delete operations via hashing."],
        ["Flexibility", "Unlike arrays, keys can be any hashable type (strings, objects, tuples), not just contiguous integers."]
      ]}
    ]}}
  ],
  flashcards: [
    ["Define a dictionary.", "An abstract data type of key–value pairs where values are accessed via their unique keys."],
    ["Usual implementation of a dictionary?", "A hash table — keys are hashed to locate their values in O(1) average time."],
    ["Can two entries share a key? A value?", "Keys must be unique; values may repeat freely."],
    ["Dictionary vs array indexing?", "Array indices are integers 0…n−1; dictionary keys can be any hashable type (strings, tuples…)."]
  ],
  quiz: [
    { q: "A dictionary differs from an array primarily because…", opts: ["it is always sorted", "it is indexed by arbitrary keys, not integer positions", "it cannot be changed", "it stores only strings"], ans: 1, why: "Key-based access is the defining feature; the hash function turns keys into positions internally." },
    { q: "Average time to look up a value by key in a hash-backed dictionary?", opts: ["O(n)", "O(log n)", "O(1)", "O(n²)"], ans: 2, why: "Hash the key, read the slot — constant on average; collisions are the caveat." },
    { q: "Which is a sensible dictionary use?", opts: ["Maintaining strict FIFO order", "Mapping student ID → student record", "Reversing a string", "Depth-first search frontier"], ans: 1, why: "Unique key to record is the textbook fit." }
  ],
  exam: [
    { q: "State what is meant by a dictionary and explain why a hash table is a suitable implementation for one.", marks: 3,
      ms: ["Dictionary: collection of key–value pairs, value retrieved via its unique key (1)", "Hash table computes a location directly from the key via a hash function (1)", "Giving O(1) average insertion and lookup rather than searching the whole collection (1)"] }
  ]
};

C["compsci:4.2.8.1"] = {
  notes: [
    { h: "Vectors: three equivalent views" },
    { callout: { t: "def", h: "Vector Representations", body: [
      { kv: [
        ["List of numbers", "[3.0, 4.0]", "A 2-vector over ℝ — \u201Cmembers of ℝ²\u201D"],
        ["Function (dictionary)", "{0: 3.0, 1: 4.0}", "Maps index → value: f: S → ℝ"],
        ["Geometric (arrow)", "Arrow from origin to point (3, 4)", "Magnitude + direction"]
      ]}
    ]}},
    { h: "Comparison: Vector Views" },
    { table: { head: ["View", "Representation", "Context"], rows: [
      ["Numerical", "[x, y]", "Standard mathematical notation"],
      ["Functional", "{0: x, 1: y}", "Programming / Dictionary representation"],
      ["Geometric", "Line with arrow", "Physics / Graphical simulations"]
    ]}},
    { callout: { t: "def", h: "The four operations and what they mean geometrically", body: [
      { kv: [
        ["Addition u + v", "Add component-wise: [1,2] + [3,1] = [4,3]. Geometrically: translate along u then v (parallelogram)."],
        ["Scalar multiple k·v", "Scale every component: 2·[3,4] = [6,8]. Stretches the arrow (k < 0 reverses it)."],
        ["Convex combination", "αu + βv with α, β ≥ 0 and α + β = 1 — every point on the straight line segment BETWEEN u and v."],
        ["Dot product u·v", "Σ uᵢvᵢ = u₁v₁ + u₂v₂ — a single NUMBER, not a vector."]
      ]}
    ]}},
    { code: { lang: "csharp", cap: "Vector class with Addition and Dot Product in C#.", src:
"public class Vector2D\n{\n    public double X, Y;\n    public Vector2D(double x, double y) { X = x; Y = y; }\n\n    public static Vector2D Add(Vector2D u, Vector2D v)\n    {\n        return new Vector2D(u.X + v.X, u.Y + v.Y);\n    }\n\n    public static double DotProduct(Vector2D u, Vector2D v)\n    {\n        return (u.X * v.X) + (u.Y * v.Y);\n    }\n}" }},
    { h: "Process: Calculating the Dot Product" },
    { steps: [
      { h: "1. Multiply Components", m: "Multiply corresponding elements from both vectors (e.g., x₁*x₂ and y₁*y₂)." },
      { h: "2. Sum Products", m: "Add all the results from Step 1 together to get a single scalar value." },
      { h: "3. Interpret Result", m: "If 0, vectors are perpendicular. If > 0, angle < 90°. If < 0, angle > 90°." }
    ]},
    { callout: { t: "tip", h: "Dot Product & Angle Analysis", body: [
      { kv: [
        ["Dot product, fully shown", "u = [2, 5], v = [4, \u22121]\nu·v = (2)(4) + (5)(\u22121) = 8 \u2212 5 = 3"],
        ["Angle test", "u·v > 0 → angle < 90°\nu·v = 0 → PERPENDICULAR\nu·v < 0 → angle > 90°"]
      ]},
      "**Note:** \u201CDot product zero ⇔ perpendicular\u201D is the most-asked fact in this subtopic."
    ]}},
    { callout: { t: "miscon", body: "The dot product is a **scalar**. Writing it as a vector ([8, −5] instead of 3) is the most common error — the products are SUMMED." }},
    { callout: { t: "tip", body: "This dovetails with Maths 10.1–10.5: same objects, different dress. AQA additionally wants the dictionary representation — be ready to write a vector as {0: x, 1: y}." }}
  ],
  flashcards: [
    ["Three representations of a vector AQA expects?", "List of numbers; function/dictionary mapping index → value; geometric arrow (magnitude + direction)."],
    ["Dot product of [2,5] and [4,−1]?", "(2)(4) + (5)(−1) = 3 — a scalar."],
    ["Geometric meaning of u·v = 0?", "u and v are perpendicular."],
    ["What is a convex combination of u and v?", "αu + βv with α, β ≥ 0, α + β = 1 — the points on the segment between u and v."],
    ["Geometric effect of scalar multiplication?", "Scales the arrow's length by |k|; negative k also reverses its direction."]
  ],
  quiz: [
    { q: "[1, 2] + 3·[2, 0] = ?", opts: ["[7, 2]", "[3, 6]", "[6, 2]", "[7, 6]"], ans: 0, why: "3·[2,0] = [6,0]; add component-wise: [7, 2]." },
    { q: "u·v for u = [3, −2], v = [2, 3]?", opts: ["[6, −6]", "0", "12", "−6"], ans: 1, why: "6 + (−6) = 0 — these vectors are perpendicular." },
    { q: "A vector represented as {0: 5.0, 1: 1.5} is using which view?", opts: ["Geometric", "Function/dictionary", "Matrix", "Polar"], ans: 1, why: "Index → value mapping is the dictionary representation AQA names explicitly." },
    { q: "0.5u + 0.5v is…", opts: ["the dot product", "the midpoint of the segment uv", "perpendicular to u", "twice u"], ans: 1, why: "A convex combination with equal weights lands exactly halfway between the two." }
  ],
  exam: [
    { q: "Given u = [4, 1] and v = [−2, 8], calculate u·v and state what your result tells you about the two vectors.", marks: 3,
      ms: ["u·v = (4)(−2) + (1)(8) (1)", "= −8 + 8 = 0 (1)", "Zero dot product ⇒ the vectors are perpendicular (1)"] }
  ]
};

})(window.KOS_CONTENT);
