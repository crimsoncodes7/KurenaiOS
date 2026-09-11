/* Kurenai OS — past-paper bank: AQA 7517 §4.2 Fundamentals of data structures
   Modelled on A-level Paper 1 Section A, June 2017–2025. See bank-cs-41.js
   for the conventions. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.2.1.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Static vs dynamic — 2017, 2020, 2022" },
    "Asked three times in nine papers, always as *describe the differences* (2–3 marks) or *advantages and disadvantages of dynamic structures* (4 marks: max 2 each way). The examiners pair each point — a static fact with its dynamic mirror — and \"dynamic structures use pointers\" on its own is **NE** (not enough): say *memory is needed to store pointers to the next item*.",
    { table: { head: ["Static", "Dynamic"], rows: [
      ["Size fixed at compile time / before the program runs", "Can grow and shrink at run time"],
      ["Wastes memory when few items are stored relative to the size", "Takes only the storage the actual data needs"],
      ["No pointer overhead", "Extra memory for pointers to the next item(s)"],
      ["Data in consecutive memory locations (direct access)", "Nodes scattered; accessing an item directly can take longer"],
      ["Resources allocated at creation even if unused until later", "Allocated as needed — but a memory leak results if unused memory is not returned to the heap"]
    ]}}
  ],
  flashcards: [
    ["State two advantages of a dynamic data structure over a static one.", "No wasted memory — only what the data needs; it can grow as more items are added, with no fixed limit except hardware."],
    ["State two disadvantages of a dynamic data structure.", "Extra memory for pointers; risk of memory leaks if freed memory is not returned to the heap; direct access to an item can take longer."],
    ["When is a static structure's size decided?", "At compile time / before the program runs / when the code is translated."],
    ["Why can a static structure waste memory?", "If the number of items stored is small relative to the declared size, the unused slots are still allocated."],
    ["What is a memory leak?", "Memory allocated dynamically that is no longer needed but never returned to the heap, so it cannot be reused."],
    ["Where in memory do dynamic structures get their nodes?", "The heap, allocated at run time as items are added."],
    ["Why is direct access slower in a dynamic structure?", "Nodes are not in consecutive locations, so the structure must be traversed via pointers to reach an item."],
    ["Which structures does the specification list as abstract data types?", "Queue, stack, graph, tree, hash table, dictionary, vector (plus arrays, records and files as concrete structures)."]
  ],
  quiz: [
    { q: "Which statement about a static data structure is correct?", opts: ["Its size can change at run time", "Its size is fixed before the program runs", "It always uses pointers", "It is stored on the heap"], ans: 1, why: "Static = size fixed at compile time; storage is usually a contiguous block." },
    { q: "A disadvantage of dynamic structures accepted by examiners is:", opts: ["they cannot store strings", "extra memory is needed for pointers", "they are always slower to insert into", "they cannot be searched"], ans: 1, why: "Each node carries pointer(s) — real overhead." },
    { q: "'Dynamic structures use pointers' scores nothing because:", opts: ["it is false", "it does not say what the pointers cost — memory to store them", "pointers are static", "the examiners dislike the word"], ans: 1, why: "The mark scheme marks it NE — not enough — without the memory cost." },
    { q: "A structure that allocates all its storage at creation even if unused until later is:", opts: ["dynamic", "static", "recursive", "hashed"], ans: 1, why: "Static allocation happens up front." },
    { q: "Memory leaks are a risk in:", opts: ["static arrays", "dynamic structures whose freed nodes are not returned to the heap", "constants", "registers"], ans: 1, why: "Un-returned heap memory accumulates." },
    { q: "Which is typically stored in consecutive memory locations?", opts: ["A linked list", "A static array", "A binary tree of nodes", "A hash chain"], ans: 1, why: "Contiguity is what gives arrays O(1) indexed access." }
  ],
  exam: [
    { src: "AQA 2022 P1 Q2.2", q: "Describe three differences between static and dynamic data structures.", marks: 3,
      ms: ["Static: size fixed at compile time / before the program runs; dynamic: can grow or shrink at run time (1)", "Static can waste memory when few items are stored relative to its size; dynamic uses only the space the data needs (1)", "Dynamic needs memory to store pointers to the next item(s); static does not (1)", "Static typically stores data in consecutive memory locations; dynamic does not (1)", "Max 3"] },
    { src: "AQA 2020 P1 Q4.1", q: "A programmer is deciding whether to implement a queue of print jobs using a dynamic data structure. Describe two advantages and two disadvantages of using a dynamic data structure.", marks: 4,
      ms: ["Advantage: no wasted memory — resources are allocated only as needed (1)", "Advantage: can grow as jobs are added; no limit on the number of items other than hardware (1)", "Disadvantage: additional memory needed for pointers (1)", "Disadvantage: possible memory leak if memory no longer needed is not returned to the heap / direct access to an item takes longer (1)", "Max 2 advantages, max 2 disadvantages"] },
    { src: "AQA 2017 P1 Q5.5", q: "Explain what is meant by a *memory leak* and why it is a risk specific to dynamic data structures.", marks: 2,
      ms: ["Memory that is allocated but no longer needed is not returned to the heap / freed, so it cannot be reused (1)", "Only dynamic structures allocate and release memory at run time — static allocation is fixed and released when the program ends (1)"] }
  ]
});

X("compsci:4.2.1.2", {
  flashcards: [
    ["How is a 2D array element addressed?", "By two indices — row then column, e.g. Grid[2][5]."],
    ["What is the maximum index of a 1D array of size N indexed from 0?", "N − 1."],
    ["How many elements does an array declared [0..9][0..4] hold?", "10 × 5 = 50."],
    ["What use might ordinal numbers have with arrays?", "They give the position/index of each value in the array."],
    ["Write a nested loop to visit every element of a 3 × 4 array.", "FOR r ← 0 TO 2: FOR c ← 0 TO 3: process A[r][c]"],
    ["Why must all elements of an array be the same type?", "So each element occupies the same size, allowing the address of element i to be computed directly."],
    ["What happens when you access index 10 of a 10-element array?", "An out-of-bounds error / exception (indices run 0–9)."],
    ["What is a trace table used for with arrays?", "Recording the value of each element and variable after every statement to follow the algorithm's effect."]
  ],
  quiz: [
    { q: "An array `Marks[0..29]` has how many elements?", opts: ["29", "30", "31", "28"], ans: 1, why: "0 to 29 inclusive is 30 values." },
    { q: "`Board[3][0]` in a row-major 2D array refers to:", opts: ["row 0, column 3", "row 3, column 0", "the 30th element", "an error"], ans: 1, why: "First index is the row." },
    { q: "To swap `A[i]` and `A[j]` you need:", opts: ["one assignment", "two assignments", "three assignments using a temporary", "a loop"], ans: 2, why: "temp ← A[i]; A[i] ← A[j]; A[j] ← temp." },
    { q: "In a trace table a column per array element is used so that:", opts: ["the array looks nicer", "each element's changes are recorded separately", "loops can be skipped", "no variables are needed"], ans: 1, why: "Element values change independently." },
    { q: "Ordinal numbers relate to arrays because they:", opts: ["count the elements", "give the position/index of each value", "are always stored in arrays", "are floating point"], ans: 1, why: "Ordinal = order/position — the 2018 P2 question." },
    { q: "A loop `FOR i ← 1 TO 10` over `A[0..9]` will:", opts: ["work correctly", "miss A[0] and go out of bounds at A[10]", "process each element twice", "process only A[1]"], ans: 1, why: "Off-by-one on both ends." }
  ],
  exam: [
    { src: "AQA 2018 P2 Q9.2", q: "State what is meant by an ordinal number and explain how ordinal numbers are used with an array.", marks: 2,
      ms: ["An ordinal number shows the order / position / rank of an item (1)", "Ordinal numbers represent the position / index of the values in the array (1)"] },
    { level: "AS", src: "AS 2016 P1 Q4.1", ctx: "The algorithm below removes duplicates from `Items[0..3] = [12, 25, 12, 53]` into `NewItems`, initially all 0.",
      code: { lang: "pseudo", src: "NewCount ← 0\nFOR a ← 0 TO 3\n   Done ← FALSE\n   FOR b ← 0 TO NewCount − 1\n      IF NewItems[b] = Items[a] THEN Done ← TRUE ENDIF\n   ENDFOR\n   IF Done = FALSE THEN\n      NewItems[NewCount] ← Items[a]\n      NewCount ← NewCount + 1\n   ENDIF\nENDFOR" },
      parts: [
        { q: "Complete a trace table with columns `a`, `b`, `Done`, `NewCount` and `NewItems[0..3]`.", marks: 5, ms: ["a runs 0, 1, 2, 3 and stops (1)", "Done is set FALSE at the start of each outer pass and becomes TRUE only when a = 2 (1)", "NewItems becomes [12, 0, 0, 0] then [12, 25, 0, 0] after a = 1 (1)", "NewItems unchanged during a = 2 (1)", "Final NewItems = [12, 25, 53, 0] and NewCount = 3 (1)"] },
        { q: "State the purpose of the variable `Done`.", marks: 1, ms: ["A flag recording whether the current item has already been copied / is a duplicate (1)"] }
      ] },
    { src: "AQA 2023 P1 Q3", q: "A game stores its 8 × 8 board in a two-dimensional array `Board`. Write pseudo-code that counts how many cells contain the value `\"X\"`.", marks: 4,
      ms: ["Counter initialised to 0 (1)", "Nested loops over rows 0–7 and columns 0–7 (1)", "Selection testing Board[r][c] = \"X\" (1)", "Counter incremented inside the selection; count available after the loops (1)"] }
  ]
});

X("compsci:4.2.1.3", {
  flashcards: [
    ["What is a record?", "A data structure holding a fixed number of fields, possibly of different types, describing one entity — e.g. a Student with Name, DOB and Grade."],
    ["What is a field?", "One named item of data within a record."],
    ["Why is a record preferred to parallel arrays?", "All data about one entity is kept together under one identifier, so it cannot get out of step and can be passed around as a unit."],
    ["What is a text file?", "A file of human-readable characters organised in lines; read and written as strings."],
    ["What is a binary file?", "A file storing data in its internal binary representation (records, images); not readable as text but compact and faster to load."],
    ["Name the four basic file operations.", "Open (in a mode), read, write/append, close."],
    ["What does EOF mean?", "End of file — a test that returns TRUE when no more data remains to be read."],
    ["Why must a file be closed after use?", "To flush buffered writes to disk and release the file handle/lock so other programs can use it."]
  ],
  quiz: [
    { q: "A record differs from an array because:", opts: ["it holds fields of different types", "it must be sorted", "it cannot be stored in a file", "it is always dynamic"], ans: 0, why: "Arrays are homogeneous; records are heterogeneous, named fields." },
    { q: "`Student.Name` uses which notation?", opts: ["index", "dot / field access", "pointer", "hash"], ans: 1, why: "Record.field." },
    { q: "Which file type is directly readable in a text editor?", opts: ["Binary", "Text", "Both", "Neither"], ans: 1, why: "Text files hold character codes; binary files hold raw representations." },
    { q: "A loop reading a text file should stop when:", opts: ["a blank line is read", "EOF is reached", "the file is 1 MB", "the tenth line is read"], ans: 1, why: "End-of-file test." },
    { q: "Storing an array of Student records to disk in one write is easiest with a:", opts: ["text file", "binary file", "constant", "stack"], ans: 1, why: "Binary files store the internal representation of records directly." },
    { q: "Opening a file for writing when it already exists typically:", opts: ["appends", "overwrites it", "raises an exception", "reads it"], ans: 1, why: "Write mode truncates; append mode adds to the end." }
  ],
  exam: [
    { level: "AS", src: "AS 2020 P1 Q4", q: "A program stores details of library books: title, ISBN, year of publication and whether the book is on loan. Define a suitable record structure for one book, stating the data type of each field.", marks: 3,
      ms: ["Record type named (e.g. `Book`) with the four fields (1)", "Title: String; ISBN: String (contains hyphens / leading digits) (1)", "Year: Integer; OnLoan: Boolean (1)"] },
    { src: "AQA 2019 P2 Q3", q: "Describe two differences between a text file and a binary file.", marks: 2,
      ms: ["A text file stores data as (human-readable) characters, line by line; a binary file stores the internal representation of the data (1)", "Text files can be read/edited with a text editor; binary files need the program that understands the format, but are more compact / faster to load (1)"] },
    { src: "AQA 2024 P2 Q4", q: "Write pseudo-code that opens a text file `scores.txt`, reads every line, counts how many lines contain the word `PASS`, and closes the file.", marks: 4,
      ms: ["File opened for reading (1)", "Loop that continues until end of file (1)", "Each line read and tested for containing `PASS`, counter incremented (1)", "File closed after the loop and count output (1)"] }
  ]
});

X("compsci:4.2.1.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "\"What is an abstract data type?\" — AS 2025" },
    "One mark for any of: *the detail of how the data are actually represented is hidden*; *new kinds of data object can be constructed from previously defined types*; or by example — *a stack, queue or tree implemented using an array*. The distinction the examiners want is **logical behaviour** (push/pop, enqueue/dequeue) versus **physical implementation** (an array with pointers, a linked list).",
    { callout: { t: "tip", body: "When an algorithm question says \"the queue is implemented as a circular array\", every step you describe must be at the **array** level (pointer arithmetic, MOD) — but when it says \"describe how a queue works\", stay at the **ADT** level (front, rear, FIFO)." }}
  ],
  flashcards: [
    ["What is an abstract data type (ADT)?", "A data type defined by the operations on it and their behaviour, hiding the detail of how the data are actually represented."],
    ["Give an example of an ADT and one possible implementation.", "A stack, implemented with an array and a top pointer, or with a linked list."],
    ["Why are ADTs useful?", "Code using the ADT depends only on its operations, so the implementation can change without affecting that code; new types can be built from existing ones."],
    ["What is the difference between a linked list and an array as implementations of a list?", "Linked list: dynamic nodes with pointers, O(n) access, O(1) insert once positioned. Array: static contiguous, O(1) access, O(n) insert."],
    ["What are the operations of a linked list?", "Traverse, insert (after a node / at head), delete, search — all by following the next pointers."],
    ["How is an item inserted in the middle of a linked list?", "Create the new node; set its pointer to the next node; set the previous node's pointer to the new node."],
    ["What is the 'interface' of an ADT?", "The set of operations it exposes, e.g. push, pop, peek, isEmpty, isFull."],
    ["How do you delete a node from a linked list?", "Point the previous node's pointer to the deleted node's next node; return the node's memory to the heap."]
  ],
  quiz: [
    { q: "An ADT is defined by:", opts: ["its memory layout", "the operations it supports and their behaviour", "its programming language", "its size"], ans: 1, why: "Behaviour, not representation." },
    { q: "Which statement about a stack ADT is correct?", opts: ["It must be an array", "It must be a linked list", "It can be implemented with either", "It cannot be implemented"], ans: 2, why: "Implementation is hidden behind push/pop." },
    { q: "In a linked list, inserting after a known node is:", opts: ["O(n) — shuffle", "O(1) — re-link two pointers", "O(log n)", "impossible"], ans: 1, why: "Set new.next ← prev.next; prev.next ← new." },
    { q: "Deleting a node from a linked list requires:", opts: ["shuffling all later nodes", "re-pointing the previous node past it", "rebuilding the list", "a stack"], ans: 1, why: "Unlink and free." },
    { q: "'The representation is hidden' is a mark for:", opts: ["arrays", "ADTs", "text files", "constants"], ans: 1, why: "Data abstraction is the essence of an ADT." },
    { q: "Finding the 50th item of a singly linked list requires:", opts: ["one pointer calculation", "traversing 50 nodes from the head", "a hash", "sorting first"], ans: 1, why: "No random access." }
  ],
  exam: [
    { level: "AS", src: "AS 2025 P1 Q5", q: "Explain what is meant by an *abstract data type*.", marks: 1,
      ms: ["A data type where the detail of how the data are actually represented is hidden / defined by its operations (1)", "Accept: new data structures constructed from previously defined types; accept by example, e.g. a stack implemented as an array (1)", "Max 1"] },
    { src: "AQA 2019 P1 Q4", ctx: "A linked list of integers is stored in an array of records `Node[1..6]` with fields `Data` and `Next`, plus a variable `Start`. `Start = 3`, and the records are: 1:(19, 5), 2:(7, 0), 3:(2, 6), 4:(41, 2), 5:(30, 4), 6:(11, 1). A `Next` of 0 marks the end.",
      parts: [
        { q: "List the data items in the order they appear in the linked list.", marks: 2, ms: ["2, 11, 19 (1)", "30, 41, 7 (1)"] },
        { q: "Describe the steps needed to insert the value 25 between 19 and 30, using an unused record 7.", marks: 3, ms: ["Store 25 in Node[7].Data (1)", "Set Node[7].Next to 5 (the record holding 30) (1)", "Set Node[1].Next (the record holding 19) to 7 (1)"] },
        { q: "Explain why the list would still be intact if the array records were physically reordered but the `Next` values updated accordingly.", marks: 1, ms: ["The order of the list is defined by the pointers, not by the physical positions in the array (1)"] }
      ] },
    { src: "AQA 2016 P1 Q3", q: "Explain one benefit of a programmer using the stack ADT provided by a library rather than manipulating an array and pointer directly.", marks: 2,
      ms: ["The implementation detail is hidden, so the programmer only needs the operations push/pop/peek (1)", "The implementation can be changed (e.g. array to linked list) without altering the code that uses it / less chance of pointer errors (1)"] }
  ]
});

X("compsci:4.2.2.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "The queue algorithm descriptions — nearly every year" },
    "Since 2020 an A-level Paper 1 question has asked you to **describe the steps** to add to or remove from a queue stored in an array: linear (2020), circular remove (2022, 2024), circular add (2023), priority insert (2020). The mark schemes are numbered step lists and cap at *Max n − 1 if any errors*, so order and completeness matter:",
    { ol: [
      "**Test** first — not full (enqueue) / not empty (dequeue), reporting overflow/underflow",
      "**Move the pointer** — rear for enqueue, front for dequeue",
      "**Wrap** — compare with the maximum size and reset to the first position, *or* use MOD with the array size",
      "**Store / read** the item at the position the pointer now indicates",
      "**Update the size** counter (if the implementation keeps one)"
    ]},
    { callout: { t: "warn", body: "Describing a *circular* queue when the question says *linear* caps the answer at 1 mark (2020). And the 2024 two-marker \"why circular beats linear in a fixed array\" wants: *in a linear queue, after removals the other items must shuffle up / unusable space is left at the front / only a limited number of items can ever be added* — versus *no shuffling and no unusable space* for circular." }},
    { callout: { t: "tip", h: "Priority queue insert (2020)", body: "Starting from the rear, move each item back one place **until an item with the same or higher priority is found**, then insert the new item in the position after it. \"Same or higher\" is the wording — *higher* alone was NE." }}
  ],
  flashcards: [
    ["Describe the steps to add an item to a linear queue in an array.", "Check the queue is not full; add 1 to the rear pointer; store the item at the position the rear pointer indicates."],
    ["Describe the steps to remove an item from a circular queue.", "Check the queue is not empty; read the item at front; add 1 to front, and if it has passed the last position set it to the first (or front ← (front+1) MOD size); reduce the size counter."],
    ["Why does a circular queue beat a linear one in a fixed array?", "A linear queue leaves unusable space at the front after removals (or must shuffle every item up); a circular queue reuses the freed cells."],
    ["How is an item added to a priority queue stored in an array?", "From the rear, move each item back one place until one with the same or higher priority is found, then insert after it."],
    ["How can a stack be used to reverse a queue?", "Dequeue every item, pushing each onto the stack, until the queue is empty; then pop every item and enqueue it until the stack is empty."],
    ["What error occurs when dequeuing from an empty queue?", "Underflow."],
    ["What does a MOD operation achieve in a circular queue?", "Wraps a pointer that passes the last index back to 0 in one step: rear ← (rear + 1) MOD size."],
    ["How do you tell whether a circular queue is full if front = rear could mean full or empty?", "Keep a separate size counter (full when size = maxSize, empty when size = 0)."]
  ],
  quiz: [
    { q: "First step when adding to any array-based queue:", opts: ["Increment rear", "Check the queue is not full", "Store the item", "Set front to 0"], ans: 1, why: "Overflow test before any pointer moves." },
    { q: "A circular queue in Q[0..4] has rear = 4. After an enqueue, rear becomes:", opts: ["5", "0", "4", "−1"], ans: 1, why: "(4 + 1) MOD 5 = 0." },
    { q: "Why can a linear queue in a 5-cell array report 'full' with only one item?", opts: ["It sorts items", "Front has advanced and the cells behind it are unusable", "MOD fails", "Items are lost"], ans: 1, why: "Dead space at the front is never reused." },
    { q: "Inserting into an array-based priority queue involves:", opts: ["always inserting at rear", "shifting items back until one of same or higher priority is found", "hashing the priority", "using a second array"], ans: 1, why: "The 2020 mark-scheme steps." },
    { q: "To reverse a queue using one stack you:", opts: ["dequeue all onto the stack, then pop all back", "pop all then push all", "enqueue the stack", "sort the queue"], ans: 0, why: "LIFO after FIFO reverses the order." },
    { q: "Dequeuing from a queue with size = 0 causes:", opts: ["overflow", "underflow", "a wrap-around", "nothing"], ans: 1, why: "The empty test guards against underflow." }
  ],
  exam: [
    { src: "AQA 2023 P1 Q1", q: "A queue is implemented as a circular queue in an array indexed from 0, with variables `Front`, `Rear` and `Size`. Describe the steps involved in adding a new item to the queue.", marks: 5,
      ms: ["Check the queue is not already full (Size < maximum) (1)", "Compare the value of Rear with the maximum index of the array (1)", "If equal set Rear to 0, otherwise add 1 to Rear (accept Rear ← (Rear + 1) MOD array size) (1)", "Insert the new item at the position indicated by Rear (1)", "Add 1 to Size (1)", "Max 4 if any errors"] },
    { src: "AQA 2024 P1 Q2.2", q: "Describe the steps involved in removing an item from a circular queue stored in an array, where the implementation keeps a count of the current number of items.", marks: 5,
      ms: ["Check the queue is not empty (current size is not 0), otherwise report an underflow error (1)", "Process / return the item at the position indicated by the front pointer (1)", "Reduce the current-size variable by 1 (1)", "If the front pointer is at the last position of the array set it to the first position (1)", "Otherwise add 1 to the front pointer (accept front ← (front + 1) MOD size for the last two points) (1)", "Max 4 if any errors"] },
    { src: "AQA 2024 P1 Q2.1", q: "Explain why a circular queue is a more suitable choice than a linear queue when the queue is stored in an array of fixed size.", marks: 2,
      ms: ["In a linear queue, after items are removed, either every other item must be shuffled up one place, or the space at the front becomes unusable / only a limited number of items can ever be added (1)", "A circular queue reuses the space at the front so no shuffling is needed and no space is wasted (1)"] },
    { src: "AQA 2020 P1 Q4.3", q: "A priority queue is stored in an array with the highest-priority item at the front. Describe the additional steps, compared with a linear queue, needed when a new item is added.", marks: 3,
      ms: ["Starting with the item at the rear, move each item back one place in the array (1)", "Until an item with the same or higher priority than the new item is found (or the front is reached) (1)", "Insert the new item in the position after that item (1)"] },
    { src: "AQA 2022 P1 Q2.5", q: "Describe how a stack could be used to reverse the order of the items in a queue.", marks: 2,
      ms: ["Repeatedly dequeue the front item and push it onto the stack until the queue is empty (1)", "Repeatedly pop the top item and enqueue it (at the rear) until the stack is empty (1)"] }
  ]
});

X("compsci:4.2.3.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Stacks in the papers" },
    "Beyond the stack-frame two-marker (see 4.1.1.15), the recurring stack items are: **trace tables** of an algorithm that uses an array as a stack (2021, 2024 — 6–7 marks, awarded per column), **peek vs pop** one-markers (2022), *what error occurs when undoing with an empty stack* (**underflow**), the **undo/repeat** design (2017, 5 marks) and *identify the structure the array implements* (2024: **stack / LIFO**).",
    { callout: { t: "tip", h: "Undo / repeat with one stack (2017)", body: "Each completed action is pushed; *repeat* uses **peek** (the top item is read, not removed — or a copy is pushed back); *undo* **pops** the top action. Saying repeat *pops* the item loses the mark unless you push it straight back." }},
    { callout: { t: "memorise", h: "RPN evaluation with a stack (2018, 2021)", body: "Read left to right; **push operands**; when an **operator** is reached **pop two**, apply, **push the result**; at the end the top of the stack is the answer. Pushing operators onto the stack scores 0 — the note for examiners is explicit." }}
  ],
  flashcards: [
    ["What is the difference between peek and pop?", "Peek returns the top item without removing it; pop removes and returns it."],
    ["What error occurs when popping an empty stack?", "Underflow (stack empty error)."],
    ["Describe how a stack evaluates an RPN expression.", "Scan left to right; push operands; on an operator pop two operands, apply it, push the result; the final top item is the answer."],
    ["How can one stack implement undo and repeat?", "Push each completed action; repeat peeks the top item and performs it again; undo pops the top item."],
    ["What are the two tests before push and pop?", "Full test before push (overflow); empty test before pop (underflow)."],
    ["How is a stack implemented in an array?", "An array plus a top pointer (−1 when empty); push increments top then stores; pop reads then decrements."],
    ["Give three uses of stacks.", "Subroutine calls (stack frames), reversing sequences, RPN evaluation, undo, depth-first search / backtracking."],
    ["An array is filled and emptied from the same end. Which ADT is it?", "A stack — LIFO."]
  ],
  quiz: [
    { q: "After pushing 4, 7, 9, a peek returns:", opts: ["4", "7", "9", "nothing"], ans: 2, why: "Top of stack is the last pushed." },
    { q: "Undo in a text editor pops actions from a stack because:", opts: ["the oldest action must be undone first", "the most recent action must be undone first", "stacks are sorted", "queues are slower"], ans: 1, why: "LIFO matches 'most recent first'." },
    { q: "Evaluating `5 3 + 2 *` with a stack gives:", opts: ["11", "16", "10", "13"], ans: 1, why: "5 3 + → 8; 8 2 * → 16." },
    { q: "Which action on a stack is invalid when top = −1?", opts: ["push", "pop", "isEmpty", "reset"], ans: 1, why: "Empty stack — underflow." },
    { q: "Repeat implemented with a stack should use:", opts: ["pop", "peek (or pop then push back)", "enqueue", "dequeue"], ans: 1, why: "The action must remain on the stack." },
    { q: "Pushing operators as well as operands during RPN evaluation:", opts: ["is correct", "scores zero — only operands are pushed", "is faster", "is needed for brackets"], ans: 1, why: "Operators are applied immediately." }
  ],
  exam: [
    { src: "AQA 2017 P1 Q6.1", ctx: "A drawing application lets the user *undo* the last action and *repeat* the last action. A single stack is used to support both.",
      parts: [
        { q: "Describe how the stack is used to implement undo and repeat.", marks: 5, ms: ["A stack stores the user's completed actions (1)", "Each time an action is completed it is pushed onto the top of the stack (1)", "Unless the action is itself an undo or repeat (1)", "Repeat: the top item is peeked (read without removal, or popped and pushed back) and that action is performed again (1)", "Undo: the top item is popped from the stack and reversed (1)"] },
        { q: "State the error that occurs if undo is selected when no actions have been performed.", marks: 1, ms: ["Stack empty / underflow (1)"] }
      ] },
    { src: "AQA 2021 P1 Q5.2", q: "Describe how a stack is used to evaluate the Reverse Polish expression `6 2 3 + −`.", marks: 4,
      ms: ["Starting at the left, push the operands 6, 2 and 3 onto the stack (1)", "When an operator is reached pop the top two values and apply the operator to them (3 + 2 = 5) (1)", "Push the result onto the stack; repeat for − : pop 5 and 6, compute 6 − 5 = 1 and push (1)", "At the end of the expression the top of the stack (1) is the result (1)", "Max 3 if any errors; 0 marks if the description is not of a LIFO structure"] },
    { src: "AQA 2022 P1 Q2.3", q: "A stack contains, from bottom to top, the values 12, 8, 21. State the value returned by (i) a peek operation, (ii) a pop operation followed by a peek.", marks: 2,
      ms: ["(i) 21 (1)", "(ii) 8 (1)"] },
    { src: "AQA 2024 P1 Q6.2", ctx: "The procedure below uses an array `T[0..3]` and a variable `Pos`, initially −1, while processing the characters of `Word = \"YKHUM\"`: for each character, if it is a vowel it is output at once; otherwise `Pos` is incremented and the character stored in `T[Pos]`. After the loop, while `Pos ≥ 0` the character `T[Pos]` is output and `Pos` decremented.",
      parts: [
        { q: "State the output of the procedure.", marks: 2, ms: ["U first (the vowel is output immediately) (1)", "then M, H, K, Y (1)"] },
        { q: "State the name of the data structure that `T` and `Pos` implement, and justify your answer.", marks: 2, ms: ["A stack / LIFO structure (1)", "Items are added and removed from the same end, indicated by Pos, so the last stored is the first output (1)"] }
      ] }
  ]
});

X("compsci:4.2.4.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Graphs — 2018, 2019, 2022, 2024, 2025" },
    "Three reliable items: **complete an adjacency matrix** (1–2 marks: one for the zeros / no-edge cells, one for the weights; a *directed* graph needs the full matrix, an undirected one is symmetric), **when to use a list vs a matrix** (2 marks each way), and **why the graph is / is not a tree** (2 marks).",
    { table: { head: ["Adjacency list when…", "Adjacency matrix when…"], rows: [
      ["few edges between vertices — the graph is **sparse** (\"few edges\" alone is NE: say *relative to the number of vertices*)", "many edges — the graph is **dense** / not sparse"],
      ["edges are rarely changed", "edges are frequently added or removed"],
      ["the presence of a specific edge does not need testing often", "the presence of a specific edge is tested frequently (O(1) lookup)"]
    ]}},
    { callout: { t: "memorise", h: "Tree = connected, undirected, no cycles", body: "\"Not a tree because it contains a cycle\" (2018, 2025) · \"Not a tree because it is not connected\" (2025) · \"A tree is a connected, undirected graph with no cycles\" (2024). A **rooted** tree adds a designated root and parent–child relationships." }}
  ],
  flashcards: [
    ["Define a weighted graph.", "A graph in which each edge has a value (weight/cost) associated with it."],
    ["Define a directed graph.", "A graph whose edges have a direction — an edge from A to B does not imply one from B to A."],
    ["When is an adjacency list better than an adjacency matrix?", "When the graph is sparse (few edges relative to vertices), edges rarely change and specific edges are seldom tested for."],
    ["When is an adjacency matrix better?", "When the graph is dense, edges change frequently, or the presence of a specific edge must be tested often."],
    ["Why is a tree a special kind of graph?", "It is a connected, undirected graph with no cycles."],
    ["How does an undirected graph's adjacency matrix look?", "Symmetric about the leading diagonal — cell [i][j] equals cell [j][i]."],
    ["What does a 0 (or blank) in an adjacency matrix mean?", "No edge between those two vertices (for a weighted graph, a non-zero entry is the weight)."],
    ["What information does an adjacency matrix lose about a Sudoku-style constraint graph?", "Why the two cells are linked (same row/column/box) — only that they are linked."]
  ],
  quiz: [
    { q: "A graph with 200 vertices and 210 edges is best stored as:", opts: ["an adjacency matrix", "an adjacency list", "a stack", "a hash table"], ans: 1, why: "Very sparse — a 200×200 matrix would be almost all zeros." },
    { q: "Testing whether an edge exists between two given vertices is O(1) with:", opts: ["an adjacency list", "an adjacency matrix", "a linked list", "a queue"], ans: 1, why: "Direct index [i][j]." },
    { q: "An adjacency matrix that is NOT symmetric represents:", opts: ["an undirected graph", "a directed graph", "a tree", "an invalid graph"], ans: 1, why: "Asymmetry means edges have direction." },
    { q: "A connected undirected graph with a cycle is:", opts: ["a tree", "not a tree", "a rooted tree", "a binary tree"], ans: 1, why: "Trees have no cycles." },
    { q: "In a weighted graph's matrix, the entry for an edge is:", opts: ["1", "its weight", "0", "the vertex name"], ans: 1, why: "Weight; 0 or ∞ marks no edge." },
    { q: "A graph with 6 vertices where every vertex connects to every other has how many undirected edges?", opts: ["15", "30", "36", "6"], ans: 0, why: "6 × 5 / 2 = 15 — dense, so use a matrix." }
  ],
  exam: [
    { src: "AQA 2025 P1 Q3.3", ctx: "An undirected, unweighted graph has vertices 1–5 and edges 1–2, 1–3, 2–4, 3–4, 4–5.",
      parts: [
        { q: "Complete the adjacency matrix for the graph, using 1 for an edge and 0 for no edge.", marks: 2, ms: ["Correct 1s: (1,2),(1,3),(2,4),(3,4),(4,5) and their mirror cells (1)", "All other cells 0, including the leading diagonal (1)"] },
        { q: "Explain why this graph is not a tree.", marks: 1, ms: ["It contains a cycle (1–2–4–3–1) (1)"] },
        { q: "Represent the same graph as an adjacency list.", marks: 1, ms: ["1: 2, 3 · 2: 1, 4 · 3: 1, 4 · 4: 2, 3, 5 · 5: 4 (1)"] }
      ] },
    { src: "AQA 2019 P1 Q3.5", q: "Explain two circumstances in which an adjacency matrix is a more appropriate representation of a graph than an adjacency list.", marks: 2,
      ms: ["When there are many edges between vertices / the graph is dense (1)", "When edges are frequently changed (1)", "When the presence or absence of a specific edge must be tested frequently (1)", "Max 2"] },
    { src: "AQA 2018 P1 Q3.2", q: "Explain when an adjacency list is a more appropriate representation than an adjacency matrix.", marks: 2,
      ms: ["When there are few edges relative to the number of vertices / the graph is sparse (1)", "When edges are rarely changed / when specific edges do not need to be tested for frequently (1)"] },
    { src: "AQA 2024 P1 Q6.1", q: "State two properties a graph must have to be a tree.", marks: 2,
      ms: ["Connected (1)", "Undirected / no cycles (1)"] },
    { src: "AQA 2019 P1 Q3.6", q: "A graph is stored as an adjacency matrix in which only the cells above the leading diagonal are used. State the type of graph for which the whole matrix would be needed instead, and explain why.", marks: 2,
      ms: ["A directed graph (digraph) (1)", "An edge from A to B does not imply an edge from B to A, so cell [A][B] and cell [B][A] can differ / the matrix is not symmetric (1)"] }
  ]
});

X("compsci:4.2.5.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Trees — definitions and structure questions" },
    "\"Define binary tree\" (2021, 2023, 2 marks): a **rooted** tree / one with a root node, in which **each node has at most two children** — *\"has two child nodes\"* is rejected. Structure questions (2024) ask what a five-node tree must look like to need the deepest stack in a traversal: *every node has at most one child / no node has a right child* — a degenerate chain of depth five. Traces of a recursive tree search (2017) award marks per call and output line.",
    { callout: { t: "warn", body: "A tree question that shows a *graph* first asks whether it is a tree at all — check **connected**, **no cycles** before anything else." }}
  ],
  flashcards: [
    ["Define a binary tree.", "A rooted tree in which each node has at most two child nodes."],
    ["What is a rooted tree?", "A tree with one node designated as the root, giving every other node a parent."],
    ["What is a leaf node?", "A node with no children."],
    ["What is the depth/height of a tree?", "The number of edges on the longest path from the root to a leaf."],
    ["Describe the shape of a five-node binary tree with the greatest depth.", "A chain — each node has exactly one child (e.g. every child on the left), depth 4 with five levels."],
    ["How is a binary tree stored in an array of records?", "Each record holds the data plus Left and Right indices (pointers), with −1 / 0 for no child."],
    ["How do you find the smallest value in a BST?", "Follow left pointers from the root until there is no left child."],
    ["What makes a tree a binary *search* tree?", "For every node, all values in the left subtree are smaller and all in the right subtree are larger."]
  ],
  quiz: [
    { q: "'Each node has two child nodes' as a definition of binary tree is:", opts: ["correct", "rejected — it must be at most two", "correct for BSTs only", "correct for rooted trees"], ans: 1, why: "Leaves have none; some nodes have one." },
    { q: "A tree with 7 nodes has how many edges?", opts: ["6", "7", "8", "12"], ans: 0, why: "A tree always has n − 1 edges." },
    { q: "In a BST, values greater than the root are in the:", opts: ["left subtree", "right subtree", "root", "leaves only"], ans: 1, why: "Ordering property." },
    { q: "The maximum number of nodes at depth 3 of a binary tree is:", opts: ["3", "6", "8", "16"], ans: 2, why: "2^3 = 8." },
    { q: "A node stored as (Data, Left = −1, Right = −1) is:", opts: ["the root", "a leaf", "an internal node", "invalid"], ans: 1, why: "No children." },
    { q: "Which traversal of a BST outputs values in ascending order?", opts: ["Pre-order", "In-order", "Post-order", "Breadth-first"], ans: 1, why: "Left, node, right." }
  ],
  exam: [
    { src: "AQA 2023 P1 Q3.1", q: "State two characteristics of a binary tree.", marks: 2,
      ms: ["It has a root node / there is a parent–child relationship between nodes (1)", "Each node has no more than two child nodes (1)"] },
    { src: "AQA 2023 P1 Q3.2", ctx: "A binary search tree is stored in an array of records `Tree` with fields `Value`, `Left` and `Right` (−1 for no child), and `Root` holds the index of the root. The incomplete algorithm below searches for `Target`.",
      code: { lang: "pseudo", src: "Current ← Root\nFound ← FALSE\nWHILE Current ≠ −1 AND Found = FALSE\n   IF Tree[Current].Value = Target THEN\n      Found ← ......(1)......\n   ELSE\n      IF Target < Tree[Current].Value THEN\n         Current ← ......(2)......\n      ELSE\n         Current ← ......(3)......\n      ENDIF\n   ENDIF\nENDWHILE\nOUTPUT ......(4)......" },
      parts: [
        { q: "Complete the four gaps.", marks: 4, ms: ["(1) TRUE (1)", "(2) Tree[Current].Left (1)", "(3) Tree[Current].Right (1)", "(4) Found (1)"] },
        { q: "State the value of `Current` when the loop ends without finding `Target`.", marks: 1, ms: ["−1 (1)"] }
      ] },
    { src: "AQA 2024 P1 Q6.3", q: "A recursive traversal of a five-node binary tree uses a stack. Describe the structure of a five-node tree for which the stack would need to reach its greatest depth.", marks: 2,
      ms: ["Every node has at most one child — the tree is a chain / no node has two children (1)", "e.g. each child is to the left of its parent, giving a depth of five (1)"] },
    { src: "AQA 2017 P1 Q4.3", ctx: "A recursive function `Find(Target, Node)` outputs the name at `Node`, returns if it equals `Target`, and otherwise calls itself on the left child if `Target` comes alphabetically before the node's name, else on the right child. A binary search tree has root `Molly`, left child `Dev`, right child `Rosa`; `Rosa` has left child `Omar`.",
      parts: [
        { q: "List the function calls and outputs produced by `Find(Omar, Molly)`.", marks: 3, ms: ["Find(Omar, Molly) → outputs Molly (1)", "Find(Omar, Rosa) → outputs Rosa (1)", "Find(Omar, Omar) → outputs Omar and stops (1)", "Max 2 if any additional calls or outputs after Omar"] },
        { q: "State the base case of `Find`.", marks: 1, ms: ["The node's name equals Target (or the node is a leaf / has no child in the required direction) (1)"] }
      ] }
  ]
});

X("compsci:4.2.6.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Hash tables — 2021, 2025" },
    "\"Describe the steps to add a record\" (4–5 marks) has a fixed sequence: **apply the hashing algorithm to the key** (\"to the data\" is NE — say *key* or *primary key*) → **the result is the location/index** → **store the record there** → **if the location is not empty use a collision-resolution method** (next free location / a linked list at that position). The 2025 one-markers: *why a hash lookup beats searching a sorted list* — the hash gives the location directly, so no search through records is needed; *why collisions slow a nearly-full table* — more collisions mean more items are **not at their calculated index**, so direct access happens less often and a search from the calculated position is needed.",
    { callout: { t: "tip", body: "Rehashing / linear probing / chaining are all accepted as *a suitable method for collision handling* — name one and say what it does." }}
  ],
  flashcards: [
    ["Describe the steps to insert a record into a hash table.", "Apply the hash function to the record's key; the result is the index where it should be stored; store it there; if that slot is occupied, use a collision-resolution method such as the next free slot."],
    ["Why is a hash table lookup faster than searching a sorted list?", "The hash function gives the location directly, so no search through the records is needed — O(1) on average."],
    ["What is a collision?", "Two different keys hashing to the same index."],
    ["Name two collision-resolution methods.", "Linear probing (next free location, wrapping); chaining (a linked list at each index)."],
    ["Why do collisions slow a nearly full hash table?", "More items end up away from their calculated index, so direct access happens less often and a search from the calculated position is needed."],
    ["What is the load factor?", "Number of items ÷ number of slots; performance degrades as it approaches 1, so tables are resized/rehashed."],
    ["How is a record found in a hash table?", "Hash its key to get the index; check that slot; if it holds a different key, follow the collision method until found or an empty slot is reached."],
    ["What makes a good hash function?", "Fast to compute, spreads keys uniformly across the table, deterministic (same key → same index)."]
  ],
  quiz: [
    { q: "The hash function is applied to:", opts: ["the whole record", "the key field", "the table size", "the previous record"], ans: 1, why: "Key → index. 'Data' is marked NE." },
    { q: "Two keys hash to index 7. This is:", opts: ["a clash", "a collision", "an overflow", "a rehash"], ans: 1, why: "Standard term." },
    { q: "Linear probing on a collision stores the item:", opts: ["in a linked list", "at the next free location", "at index 0", "nowhere"], ans: 1, why: "Probe forward (wrapping) until a free slot." },
    { q: "Average-case lookup in a hash table with few collisions is:", opts: ["O(n)", "O(log n)", "O(1)", "O(n²)"], ans: 2, why: "Direct computation of the location." },
    { q: "As a hash table fills, lookups slow because:", opts: ["hashing gets slower", "more items are not at their calculated index", "keys get longer", "the table shrinks"], ans: 1, why: "Collisions force probing/search." },
    { q: "Keys 15 and 25 with hash `key MOD 10` collide because:", opts: ["both are odd", "both give remainder 5", "25 > 15", "MOD is slow"], ans: 1, why: "15 MOD 10 = 25 MOD 10 = 5." }
  ],
  exam: [
    { src: "AQA 2025 P1 Q1.2", q: "A membership system stores records in a hash table using the membership number as the key. Describe the steps involved in adding a new record to the hash table.", marks: 4,
      ms: ["Apply the hashing algorithm / function (1)", "to the (unique / primary) key — the membership number (1)", "Insert the record at the index / address obtained (1)", "If there is already a record there, use a suitable collision-handling method, e.g. the next free location (1)"] },
    { src: "AQA 2025 P1 Q1.1", q: "Explain why finding a record in a hash table is usually faster than finding it in a list sorted by key.", marks: 1,
      ms: ["The hashing function determines the location directly, so there is no need to search through records (1)"] },
    { src: "AQA 2025 P1 Q1.3", q: "Explain why, as the hash table becomes nearly full, finding a record becomes slower.", marks: 1,
      ms: ["More collisions occur, so more items are not stored at their calculated index and direct access happens less often — a search from the calculated position is needed (1)"] },
    { src: "AQA 2021 P1 Q4", ctx: "A hash table of size 11 uses the hash function `key MOD 11` and linear probing. The keys 23, 45, 34 and 56 are inserted in that order into an empty table.",
      parts: [
        { q: "State the index at which each key is stored.", marks: 3, ms: ["23 → 1; 45 → 1 collides, probes to 2 (1)", "34 → 1 collides, probes to 3 (1)", "56 → 1 collides, probes to 4 (1)"] },
        { q: "Explain why `key MOD 11` is a poor hash function for these keys and suggest a property of a better one.", marks: 2, ms: ["All four keys hash to the same index, causing repeated collisions / clustering (1)", "A better function spreads the expected keys uniformly across the table (1)"] }
      ] }
  ]
});

X("compsci:4.2.7.1", {
  flashcards: [
    ["What is a dictionary?", "An abstract data type holding key–value pairs, where each key is unique and maps to one value; values are looked up by key."],
    ["How is a dictionary typically implemented?", "As a hash table, giving O(1) average lookup by key."],
    ["Give three dictionary operations.", "Insert/update a pair, look up the value for a key, delete a key, test whether a key exists."],
    ["How would a dictionary store a word count?", "Key = the word, value = its count; each occurrence increments the value for that key."],
    ["Why must keys be unique?", "The dictionary returns one value per key; a repeated key overwrites the previous value."],
    ["Why is a dictionary more suitable than a 2D array for a phone book?", "Names are not integers, so they cannot index an array; a dictionary maps any key type to a value directly."],
    ["What does looking up a missing key do?", "Raises an error / returns a null or default value, depending on the language."],
    ["How does a dictionary differ from a list of pairs?", "Lookup is by key in O(1) rather than a linear search through the pairs."]
  ],
  quiz: [
    { q: "In `{\"ASCII\": 128, \"Unicode\": 143859}` the keys are:", opts: ["128 and 143859", "\"ASCII\" and \"Unicode\"", "both", "neither"], ans: 1, why: "Keys map to values." },
    { q: "Inserting an existing key with a new value:", opts: ["adds a second pair", "overwrites the value", "raises an error always", "deletes the key"], ans: 1, why: "Keys are unique." },
    { q: "A dictionary is usually implemented with:", opts: ["a stack", "a hash table", "a queue", "a binary file"], ans: 1, why: "Hashing gives fast key lookup." },
    { q: "Best structure for mapping student ID strings to records:", opts: ["1D array", "dictionary", "stack", "linked list"], ans: 1, why: "Non-integer keys, direct lookup." },
    { q: "Counting word frequencies uses the word as the:", opts: ["value", "key", "index of an array", "hash table size"], ans: 1, why: "Word → count." },
    { q: "Average lookup time in a dictionary backed by a hash table is:", opts: ["O(n)", "O(1)", "O(log n)", "O(n log n)"], ans: 1, why: "Hash the key, go to the slot." }
  ],
  exam: [
    { src: "AQA 2021 P2 Q5", q: "A program must record, for each postcode area, the number of orders delivered there. Explain why a dictionary is an appropriate data structure and describe how it would be used.", marks: 3,
      ms: ["Postcode areas are strings, so cannot be used directly as array indices — a dictionary maps any key to a value (1)", "Key = postcode area, value = count of orders (1)", "For each order, look up the key and increment its value (adding the key with value 1 if absent) (1)"] },
    { src: "AQA 2018 P1 Q5", q: "State two operations that a dictionary abstract data type must provide, and state the property that keys in a dictionary must have.", marks: 3,
      ms: ["Insert / add a key–value pair (1)", "Look up (retrieve) the value associated with a key / delete a key (1)", "Keys must be unique (1)"] }
  ]
});

X("compsci:4.2.8.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Vectors — 2017, 2020" },
    "Short numeric items: **dot product** (2 marks — 1 for the products, 1 for the sum), **magnitude** (`√(x² + y²)`), **vector addition** to move a position, and the **effect of scalar multiplication**: multiplying by 2 keeps the angle and doubles the magnitude; multiplying by −1 keeps the magnitude and reverses the direction (angle becomes 180° − c / the opposite direction). The 2017 trace used the sign of a dot product as a *visibility* test (facing direction · direction-to-target > 0).",
    { callout: { t: "memorise", body: "Dot product `a·b = a₁b₁ + a₂b₂`; convex combination `αa + βb` with α + β = 1, α, β ≥ 0 gives a point on the line segment between them. A vector can be represented as a list `[3, 4]`, a dictionary `{0: 3, 1: 4}`, or a function from index to value." }}
  ],
  flashcards: [
    ["Calculate [4, 3] · [2, 5].", "4×2 + 3×5 = 8 + 15 = 23."],
    ["What is the magnitude of [6, 8]?", "√(6² + 8²) = √100 = 10."],
    ["A position [3, −1] is moved by velocity [2, 4]. New position?", "[5, 3] — vector addition, component by component."],
    ["Effect of multiplying a vector by 2?", "Direction/angle unchanged; magnitude doubled."],
    ["Effect of multiplying a vector by −1?", "Magnitude unchanged; direction reversed (angle 180° from the original)."],
    ["What does a dot product of 0 tell you?", "The vectors are perpendicular."],
    ["What is a convex combination of vectors u and v?", "αu + βv where α + β = 1 and α, β ≥ 0 — a point on the segment joining them."],
    ["Three ways to represent a vector in a program?", "A list/array of components, a dictionary index→value, or a function mapping index to value."]
  ],
  quiz: [
    { q: "[1, 2] · [3, −1] =", opts: ["1", "5", "−1", "7"], ans: 0, why: "1×3 + 2×(−1) = 3 − 2 = 1." },
    { q: "|[5, 12]| =", opts: ["17", "13", "60", "7"], ans: 1, why: "√(25 + 144) = √169 = 13." },
    { q: "Multiplying [3, 4] by 3 gives a vector of magnitude:", opts: ["5", "15", "25", "7"], ans: 1, why: "Scalar 3 × magnitude 5." },
    { q: "Which represents the vector [7, 0, 2] as a dictionary?", opts: ["{7, 0, 2}", "{0: 7, 1: 0, 2: 2}", "{7: 0, 0: 2}", "[0, 1, 2]"], ans: 1, why: "Index → component." },
    { q: "An enemy faces direction f and the hero is in direction d from it. The hero is 'in front' when:", opts: ["f · d < 0", "f · d > 0", "|f| > |d|", "f = d"], ans: 1, why: "Positive dot product means the angle between them is under 90°." },
    { q: "0.25·[4, 8] + 0.75·[8, 0] is:", opts: ["[7, 2]", "[12, 8]", "[3, 6]", "[6, 2]"], ans: 0, why: "[1, 2] + [6, 0] = [7, 2] — a convex combination." }
  ],
  exam: [
    { src: "AQA 2020 P1 Q1", ctx: "Two vectors are `a = [3, 4]` and `b = [2, −1]`.",
      parts: [
        { q: "Calculate the magnitude of `a`.", marks: 1, ms: ["√(3² + 4²) = 5 (1)"] },
        { q: "Calculate the dot product `a · b`.", marks: 2, ms: ["3×2 = 6 and 4×(−1) = −4 (1)", "Sum = 2 (1)"] },
        { q: "State the effect on the magnitude and direction of `a` of multiplying it by the scalar 2.", marks: 2, ms: ["The direction / angle is unchanged (1)", "The magnitude is doubled (becomes 10) (1)"] },
        { q: "State the effect on the magnitude and direction of `a` of multiplying it by the scalar −1.", marks: 2, ms: ["The magnitude is unchanged (1)", "The direction is reversed / the angle changes by 180° (1)"] }
      ] },
    { src: "AQA 2017 P1 Q5", ctx: "In a game, a guard at position `G = [2, 6]` faces in direction `F = [1, 0]`. The player is at `P = [8, 2]`. The guard can see the player when the dot product of `F` and the vector from `G` to `P` is greater than 0.",
      parts: [
        { q: "Calculate the vector from `G` to `P`.", marks: 1, ms: ["P − G = [6, −4] (1)"] },
        { q: "Determine, showing your working, whether the guard can see the player.", marks: 2, ms: ["[1, 0] · [6, −4] = 6 + 0 = 6 (1)", "6 > 0 so the guard can see the player (1)"] },
        { q: "The player moves by the velocity vector `[−7, 1]`. State the player's new position.", marks: 1, ms: ["[1, 3] (1)"] }
      ] },
    { src: "AQA 2023 P1 Q2", q: "Describe two ways in which a 3-dimensional vector could be represented in a program.", marks: 2,
      ms: ["As a list / one-dimensional array of three components, e.g. [2, 5, 1] (1)", "As a dictionary mapping index to component, e.g. {0: 2, 1: 5, 2: 1} / as a function from index to value (1)"] }
  ]
});

})(KOS.content.extend);
