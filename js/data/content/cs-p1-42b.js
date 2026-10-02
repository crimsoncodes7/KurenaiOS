/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.2.2.1
   (queues: linear, circular, priority) and 4.2.3.1 (stacks) at full A-level
   depth, with every program in C#. Each topic REPLACES the entry
   cs-datastructures.js carried and keeps its Trace Lab. Every way AQA has
   examined them (7517/1, June 2017–2024) is worked in the mark scheme's own
   format — the add/remove steps for each kind of queue with every accepted
   alternative, undo/repeat, RPN evaluation, peek and pop, reversing a queue
   and the 2021 seven-mark stack trace. Every C# class (CircularQueue,
   LinearQueue, PriorityQueue, Stack) and every trace was compiled and run
   under .NET 10. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: o.c || "accent2", w: o.w || 1.6, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}
function cells(x, y, vals, o) {
  o = o || {};
  var it = [], w = o.w || 44, h = o.h || 30;
  vals.forEach(function (v, i) {
    var hl = o.hl && o.hl.indexOf(i) >= 0, empty = v === "" || v == null;
    var col = hl ? "accent2" : (empty ? "line" : (o.col || "accent"));
    it.push({ poly: [[x + i * w, y], [x + (i + 1) * w, y], [x + (i + 1) * w, y + h], [x + i * w, y + h]], fill: col, alpha: empty ? 0.05 : (hl ? 0.32 : 0.14), c: empty ? "line" : col, w: 1.3 });
    if (!empty) it.push(txt(x + i * w + w / 2, y + h / 2, String(v), { b: true, size: 11.5, c: "text" }));
    it.push(txt(x + i * w + w / 2, y + h + 11, "[" + i + "]", { size: 10 }));
  });
  return it;
}
/* a pointer label below or above a cell: name ↑ */
function ptr(x, y, name, col, up) {
  return [txt(x, y, (up === false ? "↓ " : "↑ ") + name, { b: true, size: 10.5, c: col || "accent2" })];
}

/* =====================================================================
   4.2.2.1  Queues
   ===================================================================== */
function queueFig() {
  var it = [];
  it.push(txt(10, 22, "Linear, after 2 dequeues", { b: true, size: 11, c: "text", pos: "e" }));
  it = it.concat(cells(190, 8, ["", "", "C", "D", "E"]));
  it = it.concat(ptr(300, 64, "front = 2", "good"), ptr(388, 64, "rear = 4", "accent2"));
  it.push(txt(540, 22, "full — 2 slots wasted", { size: 10.5, c: "danger" }));
  it.push(txt(10, 112, "Circular, after F, G", { b: true, size: 11, c: "text", pos: "e" }));
  it = it.concat(cells(190, 98, ["F", "G", "C", "D", "E"], { hl: [0, 1] }));
  it = it.concat(ptr(256, 154, "rear = 1", "accent2"), ptr(300, 172, "front = 2", "good"));
  it.push(txt(540, 112, "rear wrapped to the start", { size: 10.5, c: "good" }));
  it.push(txt(540, 130, "rear ← (rear + 1) MOD 5", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 190, items: it, cap: "The same 5-slot array as a linear queue (freed slots at the front can never be reused) and as a circular queue (the rear pointer wraps round, so freed slots are reused)." } };
}
C["compsci:4.2.2.1"] = {
  notes: [
    { h: "Queues — the whole topic on one page" },
    "Spec 4.2.2.1: describe and apply **add an item, remove an item, test for empty, test for full** to **linear, circular and priority queues**. A queue is **FIFO**: items join at the **rear** and leave from the **front**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Add to a linear queue (array)", "Describe the steps", "3", "A-level 2020 Q04.2"],
      ["Extra steps to add to a priority queue", "Describe", "3", "A-level 2020 Q04.3"],
      ["Add to a circular queue", "Describe the process", "5", "A-level 2023 Q01"],
      ["Remove from a circular queue", "Describe the method / steps", "4–5", "A-level 2022 Q02.1, 2024 Q02.2"],
      ["Why circular beats linear in a fixed array", "Explain", "2", "A-level 2024 Q02.1"],
      ["Reverse a queue with one stack", "Explain", "2", "A-level 2022 Q02.5"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The queue ADT**.", "**Linear queues**.", "**Circular queues**.", "**Priority queues**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The queue ADT" },
    { kv: [
      ["Enqueue(item)", "add at the rear — first check the queue is not FULL (else overflow)"],
      ["Dequeue()", "remove and return the front item — first check it is not EMPTY (else underflow)"],
      ["IsEmpty() / IsFull()", "compare a size counter with 0 / the maximum, or compare the pointers"],
      ["Uses", "print and job queues, keyboard buffers, simulations of customers, breadth-first search (4.3.1.1), scheduling (round robin)"]
    ] },
    { diagram: "tl-queue" },

    { page: "Linear queues" },
    { code: { lang: "csharp", src: "class LinearQueue\n{\n    private readonly int[] items;\n    private int front = 0, rear = -1;\n    public LinearQueue(int max) { items = new int[max]; }\n\n    public bool IsFull()  => rear == items.Length - 1;\n    public bool IsEmpty() => front > rear;\n\n    public void Enqueue(int x)\n    {\n        if (IsFull()) throw new InvalidOperationException(\"full\");\n        rear++;                     // 1) move the rear pointer on\n        items[rear] = x;            // 2) store at the new rear\n    }\n    public int Dequeue()\n    {\n        if (IsEmpty()) throw new InvalidOperationException(\"empty\");\n        return items[front++];      // read the front, then move front on\n    }\n}\n// size 3: enqueue 1, 2, 3; dequeue → IsFull() is STILL true", cap: "Checked: after one dequeue the 3-slot linear queue still reports full — the freed slot at index 0 can't be reused." } },
    { callout: { t: "warn", h: "The linear queue's problem", body: "As items leave, the front moves along and the space behind it is wasted. The fixes: **shuffle** every item up one place on each dequeue (slow — O(n)), or make the queue **circular**." } },
    queueFig(),

    { page: "Circular queues" },
    { code: { lang: "csharp", src: "class CircularQueue\n{\n    private readonly string[] items;\n    private int front = 0, rear = -1, size = 0;\n    public CircularQueue(int max) { items = new string[max]; }\n\n    public bool IsEmpty() => size == 0;\n    public bool IsFull()  => size == items.Length;\n\n    public void Enqueue(string item)\n    {\n        if (IsFull()) throw new InvalidOperationException(\"Queue full\");\n        rear = (rear + 1) % items.Length;      // wrap from the last index to 0\n        items[rear] = item;\n        size++;\n    }\n    public string Dequeue()\n    {\n        if (IsEmpty()) throw new InvalidOperationException(\"Queue empty (underflow)\");\n        string item = items[front];\n        front = (front + 1) % items.Length;    // wrap the front the same way\n        size--;\n        return item;\n    }\n}", cap: "A size counter makes empty and full unambiguous: with front and rear alone, an empty and a full circular queue can look the same." } },
    { worked: { tag: "variation", title: "Trace the circular queue", q: "A CircularQueue of size 5: enqueue A, B, C, D, E; dequeue twice; enqueue F, G. Give front, rear, size and the array after each stage.",
      steps: [
        { m: "After A–E: front 0, rear 4, size 5 → [A, B, C, D, E]; IsFull() true.", mk: "1" },
        { m: "Dequeue → A, then B: front 2, size 3 (A and B remain in the array but are outside the queue).", mk: "1" },
        { m: "Enqueue F: rear = (4 + 1) MOD 5 = 0 → [F, B, C, D, E]; enqueue G: rear 1 → [F, G, C, D, E]; size 5, full again. Dequeuing everything now gives C, D, E, F, G.", mk: "1", n: "Checked by running; one more dequeue raises the underflow error." }
      ], result: "front 2 · rear 1 · size 5" } },
    { table: { head: ["Pointer update", "1-based array (AQA's wording)", "0-based (C#)"], rows: [
      ["Compare and reset", "IF pointer = max THEN pointer ← 1 ELSE pointer ← pointer + 1", "IF pointer = max − 1 THEN pointer ← 0 ELSE pointer ← pointer + 1"],
      ["Add then compare", "pointer ← pointer + 1; IF pointer = max + 1 THEN pointer ← 1", "pointer ← pointer + 1; IF pointer = max THEN pointer ← 0"],
      ["Modulo", "—", "pointer ← (pointer + 1) MOD max"]
    ] } },

    { page: "Priority queues" },
    "Each item has a **priority**; it is dequeued from the front as usual, but is **inserted ahead of every item with a lower priority** (behind those of the same or higher priority, so equal priorities stay FIFO).",
    { code: { lang: "csharp", src: "class PriorityQueue\n{\n    private readonly (string Item, int Pri)[] items;\n    private int count = 0;                       // items[0] is the front\n    public PriorityQueue(int max) { items = new (string, int)[max]; }\n\n    public void Add(string item, int pri)\n    {\n        if (count == items.Length) throw new InvalidOperationException(\"full\");\n        int i = count - 1;                        // start at the REAR\n        while (i >= 0 && items[i].Pri < pri)      // lower priority? move it back one place\n        {\n            items[i + 1] = items[i];\n            i--;\n        }\n        items[i + 1] = (item, pri);               // insert before the first same/higher priority\n        count++;\n    }\n}\n// Add print:2, save:1, alarm:5, email:2  →  alarm:5 print:2 email:2 save:1", cap: "Checked: email (2) lands behind print (2) — equal priorities keep their arrival order." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Add to a linear queue", src: "A-level June 2020 · P1 Q04.2 · 3 marks",
      q: "Describe the steps involved in adding an item to a linear queue that has been implemented as a static data structure using an array. Your answer should include a description of how any pointers are used and changed.",
      steps: [
        { m: "Check that the queue is not already full;", mk: "1" },
        { m: "(If it isn't) add 1 to the value of the rear pointer;", mk: "1" },
        { m: "Then add the new item to the position indicated by the rear pointer;", mk: "1", n: "Alternative: add the item at the rear pointer, THEN add 1. Max 2 if any errors; max 1 if a CIRCULAR queue is described." }
      ], result: "Full? → rear + 1 → store at rear" } },
    { worked: { tag: "exam", title: "Extra steps for a priority queue", src: "A-level June 2020 · P1 Q04.3 · 3 marks",
      q: "For a priority queue, the process to determine where a new item should be added is more complex than it is with a linear queue. Describe the steps involved when adding an item to a priority queue, implemented as a static data structure using an array, that were not required when adding an item to a linear queue.",
      steps: [
        { m: "Starting with the item at the rear of the queue, move each item back one place in the array;", mk: "1" },
        { m: "Until you reach the start of the queue or find an item with the same or higher priority than the item to add;", mk: "1", n: "NE. \"same priority\" alone; NE. \"higher priority\" alone." },
        { m: "Add the new item in the position before that item (i.e. just behind it);", mk: "1", n: "A. searching from the front for the insertion point, then shuffling from the back." }
      ], result: "Shuffle lower priorities back; insert behind same/higher" } },
    { worked: { tag: "exam", title: "Remove from a circular queue", src: "A-level June 2022 · P1 Q02.1 · 4 marks",
      q: "A queue data structure can be implemented as a static data structure using an array. Describe the method that would need to be followed to attempt to remove an item from a circular queue implemented as a static data structure using an array. Your method should deal appropriately with any issues which could arise.",
      steps: [
        { m: "Check the queue is not already empty;", mk: "1" },
        { m: "Compare the value of the front pointer with the maximum size of the array;", mk: "1" },
        { m: "If equal, the front pointer becomes 1 (the index of the first position);", mk: "1" },
        { m: "Otherwise, add one to the front pointer;", mk: "1", n: "Alternatives: compare with max − 1 and reset to 0; add one then compare with max (reset to 0) or max + 1 (reset to 1); add one and use MOD with the maximum size. Max 3 if any errors." }
      ], result: "Empty? → wrap or increment front" } },
    { worked: { tag: "exam", title: "Add to a circular queue", src: "A-level June 2023 · P1 Q01 · 5 marks",
      q: "Describe the process that should be followed to add an item to a circular queue implemented as a static data structure using an array. Your method should deal appropriately with any issues which could arise.",
      steps: [
        { m: "Check the queue is not already full;", mk: "1" },
        { m: "Compare the value of the rear pointer with the maximum size of the array;", mk: "1" },
        { m: "If equal, the rear pointer becomes zero (the first position);", mk: "1" },
        { m: "Otherwise, add one to the rear pointer;", mk: "1" },
        { m: "Insert the new item in the position indicated by the rear pointer;", mk: "1", n: "Same four alternatives as removal (compare with max − 1 / add then compare / MOD). Max 4 if any errors." }
      ], result: "Full? → wrap or increment rear → store" } },
    { worked: { tag: "exam", title: "Why circular is better", src: "A-level June 2024 · P1 Q02.1 · 2 marks",
      q: "Circular queues and linear queues are examples of data structures that can be implemented using a fixed-length array. Explain why, when implemented using a fixed-length array, a circular queue is usually considered to be a better choice of data structure than a linear queue.",
      steps: [
        { m: "When an item is removed from a linear queue;", mk: "1", n: "A. by implication that the problem arises after deletions." },
        { m: "All the other items need to be shuffled up one // it can result in unusable space in the array // only a limited number of items can ever be added (e.g. only five ever, in an array of size 5);", mk: "1", n: "Alternative: no need to shuffle / no unusable spaces after deleting from a circular queue." }
      ], result: "Linear wastes space or must shuffle; circular reuses it" } },
    { worked: { tag: "exam", title: "Dequeue, five steps", src: "A-level June 2024 · P1 Q02.2 · 5 marks",
      q: "Describe the steps that must be completed to remove (dequeue) an item from a circular queue that has been implemented using a fixed-length array.",
      steps: [
        { m: "Check that the queue is not already empty // the current size is not 0;", mk: "1", n: "R. reference to the ARRAY being empty." },
        { m: "If it is, deal with the underflow error; otherwise process/dequeue the front item;", mk: "1" },
        { m: "Reduce the variable storing the current size by 1;", mk: "1" },
        { m: "Check whether front is in the last position of the array and, if so, set it to the first position (0 or 1);", mk: "1" },
        { m: "Else add 1 to the front pointer;", mk: "1", n: "Alternative to the last two: add 1 then take the remainder on dividing by the maximum size. DPT rear instead of front. Max 4 if any errors." }
      ], result: "Empty? → take front → size − 1 → wrap/increment front" } },
    { worked: { tag: "exam", title: "Reverse a queue with a stack", src: "A-level June 2022 · P1 Q02.5 · 2 marks",
      q: "Explain how a single stack can be used to reverse the order of the items in a queue.",
      steps: [
        { m: "(Until the queue is empty) repeatedly remove the front item from the queue and push it on to the stack;", mk: "1" },
        { m: "(Until the stack is empty) repeatedly pop items from the stack and add them to the rear of the queue;", mk: "1", n: "Checked: 1, 2, 3, 4 becomes 4, 3, 2, 1." }
      ], result: "Dequeue all → push; pop all → enqueue" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Always check first**: add → not FULL (overflow); remove → not EMPTY (underflow). It is a mark every time.",
      "**Name the pointer** you change: rear on add, front on remove — DPT if swapped.",
      "**Circular wrap**: compare with the last index and reset, or MOD the maximum size.",
      "**Priority**: shuffle lower priorities back from the rear; insert behind same/higher.",
      "**Linear vs circular**: linear wastes freed space (or must shuffle); circular reuses it."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"Dequeue moves every item forward.\" — only in a shuffling linear queue; normally the FRONT POINTER moves.", "\"Front = rear means empty.\" — in a circular queue it can also mean ONE item (or full, depending on the convention); a size counter removes the doubt.", "\"A priority queue is sorted by arrival.\" — by priority first; arrival order only breaks ties."] } },
    { callout: { t: "mnemonic", h: "CMS", body: "Every queue answer: **C**heck (full/empty) · **M**ove the pointer (wrap if at the end) · **S**tore or take the item." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.3.1 stacks (LIFO vs FIFO); 4.3.1.1 breadth-first search uses a queue; 4.1.1.3 MOD for the wrap; 4.6.1.4 / OS scheduling with queues; 4.2.1.4 static vs dynamic queues; NEA simulations." } }
  ],
  flashcards: [
    ["Queue order?", "FIFO — first in, first out."],
    ["Where are items added / removed?", "Added at the rear, removed from the front."],
    ["First step to add an item?", "Check the queue is not full."],
    ["First step to remove an item?", "Check the queue is not empty."],
    ["Linear queue problem?", "Freed space at the front cannot be reused (or every item must shuffle up)."],
    ["Circular rear update (0-based)?", "rear ← (rear + 1) MOD maxSize."],
    ["Priority queue insert?", "From the rear, move lower-priority items back one; insert behind the first item of same or higher priority."],
    ["Why a size counter in a circular queue?", "Front and rear alone cannot tell empty from full."],
    ["Reverse a queue with a stack?", "Dequeue everything onto the stack, then pop everything back into the queue."],
    ["Uses of queues?", "Print/job queues, buffers, simulations, BFS, scheduling."]
  ],
  quiz: [
    { q: "A queue is", opts: ["FIFO", "LIFO", "sorted", "random access"], ans: 0, why: "First in, first out." },
    { q: "Circular, size 5, rear = 4: after one enqueue rear is", opts: ["0", "5", "4", "1"], ans: 0, why: "(4 + 1) MOD 5." },
    { q: "Adding to a priority queue where every item has a higher priority puts the new item", opts: ["at the rear", "at the front", "in the middle", "nowhere — it is rejected"], ans: 0, why: "Lower priority waits behind." },
    { q: "Describing a circular queue when asked about a linear one caps the answer at", opts: ["1 mark", "2 marks", "3 marks", "0 marks"], ans: 0, why: "A-level 2020 Q04.2." },
    { q: "Removing from an empty queue is", opts: ["underflow", "overflow", "a collision", "a syntax error"], ans: 0, why: "Underflow." }
  ],
  sims: ["tl-queue"]
};

/* =====================================================================
   4.2.3.1  Stacks
   ===================================================================== */
function stackFig() {
  var it = [], names = ["Harry", "Skye", "Jib"];
  for (var i = 0; i < 6; i++) {
    var y = 170 - i * 28, v = names[i] || "", top = i === 2;
    it.push({ poly: [[60, y], [180, y], [180, y + 28], [60, y + 28]], fill: v ? (top ? "accent2" : "accent") : "line", alpha: v ? (top ? 0.32 : 0.14) : 0.05, c: v ? (top ? "accent2" : "accent") : "line", w: 1.3 });
    if (v) it.push(txt(120, y + 14, v, { b: true, size: 11.5, c: "text" }));
    it.push(txt(50, y + 14, "[" + i + "]", { size: 10, pos: "w" }));
  }
  it = it.concat(arrow(240, 128, 184, 128, null, { c: "accent2" }));
  it.push(txt(246, 128, "Top = 2", { b: true, size: 11, c: "accent2", pos: "e" }));
  it.push(txt(300, 40, "Push(x): full? → Top + 1 → S[Top] ← x", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(300, 64, "Pop(): empty? → x ← S[Top] → Top − 1", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(300, 88, "Peek(): empty? → return S[Top]", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(300, 112, "IsEmpty: Top = −1 · IsFull: Top = max − 1", { size: 10.5, c: "text2", pos: "e" }));
  return { fig: { w: 640, h: 210, items: it, cap: "A-level 2022's stack S in an array of 8: Peek and Pop both return Jib; Pop also moves Top down to 1." } };
}
C["compsci:4.2.3.1"] = {
  notes: [
    { h: "Stacks — the whole topic on one page" },
    "Spec 4.2.3.1: describe and apply **push, pop, peek (top), test for empty, test for full**. A stack is **LIFO**: the last item pushed is the first popped. **Peek** returns the top item **without removing it**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How a stack implements undo/repeat", "Explain", "5 + 1", "A-level 2017 Q06"],
      ["How a stack evaluates RPN", "Explain / describe", "3–4", "A-level 2018 Q02.4, 2021 Q05.2"],
      ["Peek / pop on a given stack", "What value", "1 each", "A-level 2022 Q02.3–4"],
      ["Trace an algorithm that uses a stack", "Complete the table", "7", "A-level 2021 Q02.3"],
      ["Stack frames", "State two components", "2", "A-level 2018 Q02.5, 2021 Q02.6 (4.1.1.15)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The stack ADT**.", "**A stack in C#**.", "**Stacks at work: undo, RPN, traversal**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The stack ADT" },
    stackFig(),
    { kv: [
      ["Push(x)", "check not full (else stack OVERFLOW), add 1 to Top, store x at S[Top]"],
      ["Pop()", "check not empty (else stack UNDERFLOW), return S[Top], subtract 1 from Top"],
      ["Peek() / Top()", "return S[Top] WITHOUT changing Top"],
      ["Uses", "undo, the call stack (4.1.1.15), RPN evaluation (4.3.3.1), depth-first search (4.3.1.1), backtracking, reversing, matching brackets"]
    ] },
    { diagram: "tl-stack" },

    { page: "A stack in C#" },
    { code: { lang: "csharp", src: "class Stack\n{\n    private readonly string[] items;\n    private int top = -1;                      // −1 = empty\n    public Stack(int max) { items = new string[max]; }\n\n    public bool IsEmpty() => top == -1;\n    public bool IsFull()  => top == items.Length - 1;\n\n    public void Push(string x)\n    {\n        if (IsFull()) throw new InvalidOperationException(\"Stack overflow\");\n        top++;\n        items[top] = x;\n    }\n    public string Pop()\n    {\n        if (IsEmpty()) throw new InvalidOperationException(\"Stack underflow\");\n        return items[top--];                   // read, then move Top down\n    }\n    public string Peek()\n    {\n        if (IsEmpty()) throw new InvalidOperationException(\"Stack empty\");\n        return items[top];                     // Top unchanged\n    }\n}\n\nvar st = new Stack(8);\nforeach (var n in new[] { \"Harry\", \"Skye\", \"Jib\" }) st.Push(n);\nConsole.WriteLine(st.Peek() + \" \" + st.Pop() + \" \" + st.Peek());   // Jib Jib Skye", cap: "Checked by running. A popped value stays in the array but is outside the stack; the next push overwrites it." } },

    { page: "Stacks at work: undo, RPN, traversal" },
    { code: { lang: "csharp", src: "static double Rpn(string expr)\n{\n    var s = new Stack<double>();                    // the built-in generic stack\n    foreach (string t in expr.Split(' '))\n    {\n        if (double.TryParse(t, out double v)) { s.Push(v); continue; }   // operand → push\n        double b = s.Pop(), a = s.Pop();           // operator → pop TWO (b is the right operand)\n        s.Push(t switch { \"+\" => a + b, \"-\" => a - b, \"*\" => a * b, \"/\" => a / b,\n                          _ => throw new FormatException(t) });          // push the result\n    }\n    return s.Pop();                                 // the one value left is the answer\n}\n// Rpn(\"5 2 7 + +\") = 14 · Rpn(\"6 2 / 3 - 4 *\") = 0", cap: "Checked by running. The order matters for − and ÷: the FIRST pop is the right-hand operand." } },
    { fig: { w: 640, h: 110, items: (function () {
      var it = [], snaps = [["5"], ["5", "2"], ["5", "2", "7"], ["5", "9"], ["14"]], tok = ["5", "2", "7", "+", "+"];
      snaps.forEach(function (s, k) {
        var x = 30 + k * 122;
        s.forEach(function (v, j) { var y = 70 - j * 22; it.push({ poly: [[x, y], [x + 60, y], [x + 60, y + 22], [x, y + 22]], fill: j === s.length - 1 ? "accent2" : "accent", alpha: 0.18, c: j === s.length - 1 ? "accent2" : "accent", w: 1.3 }); it.push(txt(x + 30, y + 11, v, { b: true, size: 11, c: "text" })); });
        it.push(txt(x + 30, 104, "read " + tok[k], { size: 10.5, c: "text2" }));
      });
      return it;
    })(), cap: "Evaluating 5 2 7 + + : operands are pushed; each + pops two and pushes the result (2 + 7 = 9, then 5 + 9 = 14)." } },
    { worked: { tag: "variation", title: "Bracket matching", q: "Describe how a stack checks whether the brackets in \"(a[b]{c})\" and \"(a[b)]\" are balanced.",
      steps: [
        { m: "Scan left to right: push every opening bracket.", mk: "1" },
        { m: "At a closing bracket: if the stack is empty, or the popped bracket is not its partner, the string is unbalanced.", mk: "1" },
        { m: "At the end the stack must be empty. \"(a[b]{c})\": ( [ ] pop [ { } pop { ) pop ( → empty → balanced. \"(a[b)]\": push ( [, then ) pops [ — mismatch → unbalanced.", mk: "1" }
      ], result: "Balanced · unbalanced" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Undo and repeat with one stack", src: "A-level June 2017 · P1 Q06.1 · 5 marks",
      q: "Software offers undo (return to the state before the user's most recent action, repeatedly) and repeat (apply the most recent action again, repeatedly). Explain how a single stack can be used in the implementation of the repeat action and the undo action.",
      steps: [
        { m: "The stack is used to store the user's actions;", mk: "1" },
        { m: "Each time an action is completed it is pushed onto the top of the stack;", mk: "1" },
        { m: "…unless it is an undo (or repeat) action;", mk: "1" },
        { m: "When repeat is used, the top item is used to indicate the action to complete // the result of peek is used;", mk: "1", n: "R. if the item is popped — unless it is clearly pushed back. A. a copy of the top item is pushed." },
        { m: "When undo is used, the top item is popped/removed from the stack;", mk: "1" }
      ], result: "Push actions; repeat = peek; undo = pop" } },
    { worked: { tag: "exam", title: "Undo before any action", src: "A-level June 2017 · P1 Q06.2 · 1 mark",
      q: "State the type of error that occurs if the user tries to complete an undo action before they have completed any other actions.",
      steps: [{ m: "Stack empty (error) // (stack) underflow;", mk: "1" }],
      result: "Underflow" } },
    { worked: { tag: "exam", title: "A stack evaluates RPN", src: "A-level June 2018 · P1 Q02.4 · 3 marks",
      q: "To evaluate an expression in Reverse Polish notation you look left to right for an operator, apply it to the two values immediately preceding it, and replace the three with the result — 5 2 7 + + becomes 5 9 + after the first replacement. Explain how a stack could be used in the process of evaluating an expression in Reverse Polish notation.",
      steps: [
        { m: "(Starting at the left of the expression) push values/operands onto the stack;", mk: "1", n: "R. if operators are also pushed." },
        { m: "Each time an operator is reached, pop the top two values off the stack (and apply the operator);", mk: "1" },
        { m: "Push the result back onto the stack;", mk: "1", n: "Max 2 if any errors or if more than one stack is used. 0 marks if the description is not LIFO." }
      ], result: "Push operands; operator → pop 2, push result" } },
    { worked: { tag: "exam", title: "A single stack evaluates RPN", src: "A-level June 2021 · P1 Q05.2 · 4 marks",
      q: "Describe how a single stack could be used to evaluate an RPN expression.",
      steps: [
        { m: "Starting at the left, push values/operands onto the stack;", mk: "1" },
        { m: "Each time an operator is reached, pop the top two values (the required number) and apply the operator;", mk: "1" },
        { m: "Push the result onto the stack;", mk: "1" },
        { m: "When the end of the expression is reached, the top item of the stack is the result // pop one value;", mk: "1", n: "Max 3 if any errors or more than one stack." }
      ], result: "Push · pop 2 + apply · push · final pop" } },
    { worked: { tag: "exam", title: "Peek", src: "A-level June 2022 · P1 Q02.3 · 1 mark",
      q: "A stack is implemented using an array S of size 8: S[0] = Harry, S[1] = Skye, S[2] = Jib, Top = 2. What value will be returned by applying the peek operation to S?",
      steps: [{ m: "Jib;", mk: "1" }], result: "Jib" } },
    { worked: { tag: "exam", title: "Pop", src: "A-level June 2022 · P1 Q02.4 · 1 mark",
      q: "For the same stack S (Harry, Skye, Jib with Top = 2), what value will be returned by applying the pop operation to S?",
      steps: [{ m: "Jib;", mk: "1", n: "Same value as peek — but pop also moves Top down to 1." }], result: "Jib" } },
    { worked: { tag: "exam", title: "Trace Traversal with its stack", src: "A-level June 2021 · P1 Q02.3 · 7 marks",
      q: "Arrays: Data = [C, I, E, H, B, Y, Q], Dir1 = [1, 2, −1, −1, 5, −1, −1], Dir2 = [4, 3, −1, −1, 6, −1, −1]. SUBROUTINE Traversal(StartNode): Current ← StartNode; Pos ← 0; Stack[Pos] ← Current; WHILE Pos ≠ −1: Current ← Stack[Pos]; Pos ← Pos − 1; OUTPUT Data[Current]; IF Dir2[Current] ≠ −1 THEN Pos ← Pos + 1; Stack[Pos] ← Dir2[Current]; ENDIF; IF Dir1[Current] ≠ −1 THEN Pos ← Pos + 1; Stack[Pos] ← Dir1[Current]; ENDIF; ENDWHILE. Complete a table with columns Stack[0]–[3], Current, Pos and Output for Traversal(0).",
      steps: [
        { m: "Stack[0] set to 0, Pos 0, Current 0;", mk: "1" },
        { m: "Current 0, Pos −1, output C;", mk: "1" },
        { m: "Stack[0] set to 4 and Pos 0 (Dir2 is pushed FIRST);", mk: "1" },
        { m: "Stack[1] set to 1, then 3, then 5 — nothing after 5;", mk: "1" },
        { m: "Stack[2] set to 2 only; Stack[0]'s third value is 6; Stack[3] never used;", mk: "1" },
        { m: "Pos column correct from its 4th value (1) on; Current takes 1, 2, 3, 4, 5, 6;", mk: "1" },
        { m: "Output order C, I, E, H, B, Y, Q;", mk: "1", n: "Max 6 if any errors. This is a PRE-ORDER traversal — pushing right before left makes left come out first. Checked by running." }
      ], result: "Output C I E H B Y Q" } },
    { table: { head: ["Stack[0]", "Stack[1]", "Stack[2]", "Stack[3]", "Current", "Pos", "Output"], rows: [
      ["0", "", "", "", "0", "0", ""], ["", "", "", "", "0", "−1", "C"], ["4", "", "", "", "", "0", ""], ["", "1", "", "", "", "1", ""],
      ["", "", "", "", "1", "0", "I"], ["", "3", "", "", "", "1", ""], ["", "", "2", "", "", "2", ""], ["", "", "", "", "2", "1", "E"],
      ["", "", "", "", "3", "0", "H"], ["", "", "", "", "4", "−1", "B"], ["6", "", "", "", "", "0", ""], ["", "5", "", "", "", "1", ""],
      ["", "", "", "", "5", "0", "Y"], ["", "", "", "", "6", "−1", "Q"]
    ] } },

    { page: "Exam toolkit" },
    { steps: [
      "**Push**: not full → Top + 1 → store. **Pop**: not empty → read → Top − 1. **Peek**: read only.",
      "**Errors**: push when full = overflow; pop/peek when empty = underflow.",
      "**RPN**: push operands; at an operator pop TWO, apply, push; the last value is the answer — one stack only.",
      "**Undo/repeat**: push each action; undo pops; repeat peeks.",
      "**Traces**: Top/Pos changes on every push and pop; values left above Top are dead."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"Pop deletes the item from the array.\" — the value stays; only Top moves, and the next push overwrites it.", "\"Peek and pop are the same.\" — both return the top value, but only pop changes Top.", "\"In RPN, pop a then b.\" — the FIRST value popped is the RIGHT-hand operand: 6 2 − means 6 − 2."] } },
    { callout: { t: "mnemonic", h: "\"Check, move, store — and back again\"", body: "**Push**: check full → move Top up → store. **Pop**: check empty → read → move Top down. **Peek** only reads." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.15 the call stack and stack frames; 4.1.1.16 recursion; 4.3.3.1 RPN; 4.3.1.1 depth-first search; 4.3.2.1 tree traversal; 4.2.2.1 queues (FIFO vs LIFO); 4.7.3.6 interrupts save registers on a stack." } }
  ],
  flashcards: [
    ["Stack order?", "LIFO — last in, first out."],
    ["Push steps?", "Check not full; add 1 to Top; store the item at S[Top]."],
    ["Pop steps?", "Check not empty; return S[Top]; subtract 1 from Top."],
    ["Peek?", "Returns the top item without removing it."],
    ["Empty test with Top starting at −1?", "Top = −1."],
    ["Full test for an array of size n?", "Top = n − 1."],
    ["Pop on an empty stack?", "Stack underflow."],
    ["Push on a full stack?", "Stack overflow."],
    ["RPN with a stack?", "Push operands; at an operator pop two, apply, push the result; the final value is the answer."],
    ["Undo/repeat with one stack?", "Push each action; undo pops the top; repeat peeks the top."],
    ["5 2 7 + + =", "14."]
  ],
  quiz: [
    { q: "Stack: Harry, Skye, Jib (Top = 2). Pop then Peek returns", opts: ["Skye", "Jib", "Harry", "nothing"], ans: 0, why: "Pop removes Jib." },
    { q: "Evaluating 6 2 / 3 - with a stack gives", opts: ["0", "3", "−3", "1"], ans: 0, why: "6/2 = 3, 3 − 3 = 0." },
    { q: "Which operation does not change Top?", opts: ["Peek", "Push", "Pop", "Clear"], ans: 0, why: "Peek reads only." },
    { q: "A repeat action should use", opts: ["peek", "pop", "a second stack", "a queue"], ans: 0, why: "Popping would lose the action." },
    { q: "Traversal pushing Dir2 before Dir1 gives which order?", opts: ["pre-order", "in-order", "post-order", "breadth-first"], ans: 0, why: "Node first, then left, then right." }
  ],
  sims: ["tl-stack"]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
