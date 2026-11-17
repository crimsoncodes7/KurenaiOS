/* Kurenai OS — js/data/exams/papers/aqa-7517-ppe-1.js
   AQA A-level Computer Science (7517) style: the December 2026 pre-public
   exam, Practice paper 1.

   WRITTEN BY KURENAIOS — NOT AN AQA PAPER. Original questions in AQA's
   style for the school's topic list: logic gates and Boolean algebra
   (4.6.4–4.6.5), input, output and storage devices (4.7.4), OOP (4.1.2.3),
   stacks and queues (4.2.2–4.2.3), recursion (4.1.1.16), graphs and trees
   (4.2.4–4.2.5, 4.3.1, 4.3.2, 4.3.4.3), sorting and searching (4.3.4–4.3.5),
   assembly language (4.7.3.3–4.7.3.5), consequences of computing (4.8) and
   databases (4.10). 2 h 30, 100 marks, written; parts labelled as AQA
   prints them (01.1, 01.2 …); one 9-mark Discuss marked by level.

   HOW IT WAS CHECKED. Every computed answer was produced by a program
   before it was written here, not worked by hand: the truth table and each
   step of the Boolean simplification were checked over every input; the
   stack, circular queue, recursion, BFS/DFS, binary search tree (pointers,
   post-order, the search path), bubble sort passes and binary search
   comparisons were run in Python and copied from its output; the assembly
   programs (the trace and the model answer for 10.4, on five pairs of
   values) were run on a small interpreter for AQA's instruction set; the
   SQL model answers (both join styles and a nested form) were run in
   SQLite on the table shown in 11 and return the rows the scheme gives;
   the 3NF decomposition was checked by testing its functional
   dependencies on the data and that joining the three tables gives the
   original table back exactly.

   Shape (read by KOS.examPaper's authored papers):
     {id, n, title, board, format: "aqa", mins, marks, org, context,
      questions: [{n, title, stem, parts: [{label, q, code?, marks, ref,
        command, ms: [lines], guide?, levels?, indicative?, dependsOn?,
        table?, fill?}]}]}
   A scheme line ending "(n)" is worth n; "Max N" caps a list of points.  */
(function () {
  "use strict";
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var P = X.papers = X.papers || {};
  var CODE_OK = "Answers may be written in C# or in pseudo-code; ignore minor syntax errors that do not change the logic. ";
  var L9 = [
    "Level 3 (7–9 marks): a well-developed discussion. Accurate knowledge of issues from at least two of the moral/ethical, legal and cultural areas, each explained and applied to the scenario; both advantages and concerns are weighed; the response follows a clear, logical line of reasoning and reaches a conclusion that the points made support.",
    "Level 2 (4–6 marks): a reasonable discussion. Several relevant issues are identified and some are explained and linked to the scenario, though one area may be thin or the discussion one-sided; the reasoning is mostly clear but may not reach a supported conclusion.",
    "Level 1 (1–3 marks): a limited response. A few relevant points, mostly stated rather than explained, generic rather than applied to the scenario; little structure or reasoning.",
    "0 marks: no relevant content."
  ];
  (P["aqa-7517-ppe"] = P["aqa-7517-ppe"] || [])[0] = {
    id: "aqa-7517-ppe-1", n: 1, title: "Practice paper 1", board: "AQA", format: "aqa", mins: 150, marks: 100,
    org: "", context: "",
    questions: [
      /* ---------- 1 · logic gates and Boolean algebra (10) ---------- */
      { n: 1, title: "Logic gates and Boolean algebra",
        stem: "A logic circuit has three inputs, A, B and C. Inputs A and B are the inputs to a NAND gate, whose output is P. P and C are the inputs to an XOR gate, whose output is Q.",
        parts: [
          { label: "01.1", command: "Complete", ref: "4.6.4.1", marks: 3,
            q: "Complete the truth table for the circuit described above.",
            fill: { head: ["A", "B", "C", "P", "Q"], rows: [
              ["0", "0", "0", "", ""], ["0", "0", "1", "", ""], ["0", "1", "0", "", ""], ["0", "1", "1", "", ""],
              ["1", "0", "0", "", ""], ["1", "0", "1", "", ""], ["1", "1", "0", "", ""], ["1", "1", "1", "", ""]] },
            ms: ["P column (top to bottom): 1, 1, 1, 1, 1, 1, 0, 0 (1)",
              "Q column, first four rows: 1, 0, 1, 0 (1)",
              "Q column, last four rows: 1, 0, 0, 1 (1)"],
            guide: "Follow through: award the Q marks for a Q column that is correct for the candidate's own P column." },
          { label: "01.2", command: "Simplify", ref: "4.6.5.1", marks: 4,
            q: "Simplify the Boolean expression\n\n$\\overline{\\overline{A} + B} + \\overline{A}\\cdot B + A\\cdot B$\n\nYou must show your working.",
            ms: ["Uses De Morgan's law: $\\overline{\\overline{A} + B} = A\\cdot\\overline{B}$ (1)",
              "Combines $A\\cdot\\overline{B} + A\\cdot B = A\\cdot(\\overline{B} + B) = A$ (1)",
              "Uses $A + \\overline{A}\\cdot B = A + B$ (absorption, or $(A + \\overline{A})\\cdot(A + B)$) (1)",
              "Final answer $A + B$ (1)"],
            guide: "A. working in a different order if every step is valid (e.g. $\\overline{A}\\cdot B + A\\cdot B = B$ first, then $A\\cdot\\overline{B} + B = A + B$). The final mark is for the answer A + B only. R. a truth table on its own: the question asks for algebraic working." },
          { label: "01.3", command: "Write", ref: "4.6.4.1", marks: 2,
            q: "A half-adder adds two bits, A and B, and has two outputs, Sum and Carry. Write a Boolean expression for each output.",
            ms: ["Sum $= A \\oplus B$ (1)", "Carry $= A\\cdot B$ (1)"],
            guide: "A. Sum $= A\\cdot\\overline{B} + \\overline{A}\\cdot B$, or words (A XOR B; A AND B). R. outputs the wrong way round." },
          { label: "01.4", command: "State", ref: "4.6.4.1", marks: 1,
            q: "State the purpose of an edge-triggered D-type flip-flop.",
            ms: ["It stores (remembers) a single bit, its output changing only on the edge of the clock signal (1)"],
            guide: "A. \"acts as a memory unit for one bit\". R. \"stores data\" with no reference to one bit." }
        ] },

      /* ---------- 2 · hardware: input, output and storage (8) ---------- */
      { n: 2, title: "Input, output and storage devices",
        stem: "A town library puts a passive RFID tag inside every book. Staff check the shelves with battery-powered handheld scanners, and the library office prints letters on a laser printer.",
        parts: [
          { label: "02.1", command: "Describe", ref: "4.7.4.1", marks: 3,
            q: "Describe how a scanner reads the data stored on a book's passive RFID tag.",
            ms: ["Max 3 from:",
              "The reader/scanner transmits radio waves / creates an electromagnetic field (1)",
              "The tag's antenna/coil picks up this energy (by induction) (1)",
              "This energy powers the tag's chip, as a passive tag has no battery (1)",
              "The tag sends its data (e.g. the book's ID) back to the reader as a radio signal (1)",
              "The reader must be within a short range of the tag (1)"],
            guide: "R. answers that describe a barcode being scanned by a laser." },
          { label: "02.2", command: "State", ref: "4.7.4.2", marks: 2,
            q: "The handheld scanners use solid-state storage rather than a hard disk drive. State two reasons why solid-state storage is more suitable for the scanners.",
            ms: ["Max 2 from:",
              "No moving parts, so less likely to be damaged if a scanner is dropped (1)",
              "Uses less power, so the battery lasts longer (1)",
              "Smaller / lighter, so the scanner is easier to carry (1)",
              "Faster access to data (no seek time / no wait for a platter to spin) (1)",
              "Silent / produces less heat (1)"],
            guide: "R. \"cheaper\" or \"larger capacity\" (both are usually untrue)." },
          { label: "02.3", command: "Describe", ref: "4.7.4.1", marks: 3,
            q: "Describe how a laser printer prints a page.",
            ms: ["Max 3 from:",
              "A (rotating) drum is given an electrostatic charge (1)",
              "A laser beam draws the image of the page on the drum, changing/removing the charge where it shines (1)",
              "Charged toner is attracted to the areas of the drum that make up the image (1)",
              "The paper is charged and the toner is transferred from the drum to the paper (1)",
              "The fuser (heated rollers) melts the toner onto the paper (1)",
              "The charge is removed from the drum (ready for the next page) (1)"],
            guide: "Points need not be in the exact order, but a description in which the toner is fused before it is transferred cannot get full marks." }
        ] },

      /* ---------- 3 · stacks (6) ---------- */
      { n: 3, title: "Stacks",
        stem: "A stack is implemented with a static array, Stack, of five elements indexed 0 to 4, and an integer Top that holds the index of the item at the top of the stack. Top is -1 when the stack is empty.",
        parts: [
          { label: "03.1", command: "Complete", ref: "4.2.3.1", marks: 3,
            q: "The stack starts empty. The operations in the table are carried out in order.\n\nComplete the table to show the value of Top after each operation and the value returned by each Pop operation.",
            fill: { head: ["Operation", "Top", "Value returned"], rows: [
              ["Push(\"K\")", "", "-"], ["Push(\"M\")", "", "-"], ["Pop()", "", ""], ["Push(\"R\")", "", "-"],
              ["Push(\"T\")", "", "-"], ["Pop()", "", ""], ["Push(\"W\")", "", "-"]] },
            ms: ["Top for the first four operations: 0, 1, 0, 1 (1)",
              "Top for the last three operations: 2, 1, 2 (1)",
              "Values returned: M (first Pop) and T (second Pop) (1)"] },
          { label: "03.2", command: "Write", ref: "4.2.3.1", marks: 3,
            q: "Write an algorithm for the Pop operation. It must check whether the stack is empty and, if it is, display an error message instead of removing an item.",
            ms: ["Checks whether the stack is empty: IF Top = -1 (or Top < 0) and displays an error message (1)",
              "Otherwise retrieves the item Stack[Top] / returns it (1)",
              "Otherwise decrements Top: Top ← Top - 1 (1)"],
            guide: CODE_OK + "The item must be read before Top is decremented (or read from Stack[Top + 1] afterwards). R. an empty test of Top = 0, which would refuse to pop the last item. Deleting the item from the array is not required." }
        ] },

      /* ---------- 4 · queues (6) ---------- */
      { n: 4, title: "Queues",
        stem: "A circular queue is implemented with a static array, Q, of six elements indexed 0 to 5, a FrontPointer, a RearPointer and a Size. At the start, Q[3] = \"P\", Q[4] = \"L\" and Q[5] = \"M\"; FrontPointer is 3, RearPointer is 5 and Size is 3. Enqueue adds an item after the rear of the queue and Dequeue removes the item at the front.",
        parts: [
          { label: "04.1", command: "Complete", ref: "4.2.2.1", marks: 3,
            q: "These operations are carried out in order:\n\nEnqueue(\"S\"), Enqueue(\"D\"), Dequeue(), Enqueue(\"H\"), Dequeue()\n\nComplete the table to show the contents of the array and the values of the two pointers after all five operations.",
            fill: { head: ["Q[0]", "Q[1]", "Q[2]", "Q[3]", "Q[4]", "Q[5]", "FrontPointer", "RearPointer"],
              rows: [["", "", "", "", "", "", "", ""]] },
            ms: ["Q[0] = S, Q[1] = D, Q[2] = H and Q[5] = M (1)",
              "FrontPointer = 5 (1)",
              "RearPointer = 2 (1)"],
            guide: "A. Q[3] and Q[4] shown as P and L (a dequeued item is not normally erased) or left empty. Follow through a pointer value only if it is consistent with an array that wraps around." },
          { label: "04.2", command: "Explain", ref: "4.2.2.1", marks: 2,
            q: "Explain why a circular queue is more efficient than a linear queue when both are implemented with a static array.",
            ms: ["Max 2 from:",
              "In a linear queue, the space freed at the front by Dequeue cannot be reused / the queue can appear full when it is not (1)",
              "In a circular queue the rear pointer wraps round to the start of the array, so freed spaces are reused (1)",
              "A linear queue that shuffles every item forward after each Dequeue avoids this, but takes time proportional to the number of items (1)"] },
          { label: "04.3", command: "Describe", ref: "4.2.2.1", marks: 1,
            q: "Describe how a priority queue differs from an ordinary queue.",
            ms: ["Items are removed in order of priority (an item joins ahead of items with lower priority), not purely in the order they arrived (1)"],
            guide: "A. \"items with the same priority are removed in arrival order\" as part of a correct answer." }
        ] },

      /* ---------- 5 · object-oriented programming (11) ---------- */
      { n: 5, title: "Object-oriented programming",
        stem: "A cinema's booking system is written using object-oriented programming. Part of the definition of the class Ticket is shown below.",
        parts: [
          { label: "05.1", command: "State", ref: "4.1.2.3", marks: 1,
            code: ["CLASS Ticket",
              "  PRIVATE TicketID : Integer",
              "  PRIVATE SeatCode : String",
              "  PROTECTED BasePrice : Real",
              "  PUBLIC PROCEDURE New(ID, Seat, Price)",
              "    TicketID ← ID",
              "    SeatCode ← Seat",
              "    BasePrice ← Price",
              "  ENDPROCEDURE",
              "  PUBLIC FUNCTION GetPrice()",
              "    RETURN BasePrice",
              "  ENDFUNCTION",
              "  PUBLIC FUNCTION GetSeat()",
              "    RETURN SeatCode",
              "  ENDFUNCTION",
              "ENDCLASS"],
            q: "The subroutine New is called automatically when a Ticket object is created. State the name for this type of subroutine.",
            ms: ["Constructor (1)"] },
          { label: "05.2", command: "Explain", ref: "4.1.2.3", marks: 2,
            q: "Explain why the attribute TicketID has been declared as private.",
            ms: ["Encapsulation / information hiding (1)",
              "It can only be accessed or changed through the class's own methods, so other code cannot set it to an invalid value / change it by mistake (1)"],
            guide: "A. \"so it cannot be accessed directly from outside the class\" for the second mark." },
          { label: "05.3", command: "Explain", ref: "4.1.2.3", marks: 2,
            q: "The class VIPTicket is a subclass of Ticket. Explain why BasePrice has been declared as protected rather than private.",
            ms: ["The methods of VIPTicket need to use BasePrice (e.g. to work out a VIP price) (1)",
              "A protected attribute can be accessed by the class and its subclasses, but (unlike a public one) not by other classes (1)"],
            guide: "R. \"protected means it cannot be changed\"." },
          { label: "05.4", command: "Write", ref: "4.1.2.3", marks: 4,
            q: "VIPTicket inherits from Ticket and adds a private Boolean attribute, LoungeAccess.\n\nIts constructor takes four parameters, ID, Seat, Price and Lounge. It calls the constructor of Ticket with the first three and sets LoungeAccess to Lounge.\n\nIts method GetPrice overrides the method in Ticket. It returns BasePrice multiplied by 1.5, plus 12.00 if LoungeAccess is True.\n\nWrite the constructor and the method GetPrice for VIPTicket.",
            ms: ["Constructor with four parameters that calls the base class constructor with ID, Seat, Price (e.g. base(ID, Seat, Price) or Ticket.New(ID, Seat, Price)) (1)",
              "Sets LoungeAccess ← Lounge (1)",
              "GetPrice declared as overriding the parent's method (OVERRIDE / override) (1)",
              "Returns BasePrice * 1.5, adding 12.00 only when LoungeAccess is True (1)"],
            guide: CODE_OK + "In C# accept public VIPTicket(int id, string seat, double price, bool lounge) : base(id, seat, price) and public override double GetPrice(). The override mark needs some indication that the method replaces the parent's; A. a missing virtual on the parent's method." },
          { label: "05.5", command: "Explain", ref: "4.1.2.3", marks: 2,
            q: "A Screening object holds the Ticket objects sold for that showing of a film. When a Screening object is deleted, its Ticket objects are deleted with it.\n\nState the type of association between Screening and Ticket and explain your answer.",
            ms: ["Composition (1)",
              "Because the Ticket objects cannot exist independently of / without the Screening that contains them (1)"],
            guide: "R. aggregation (the contained objects would survive). The explanation mark can be awarded only with composition." }
        ] },

      /* ---------- 6 · recursion (9) ---------- */
      { n: 6, title: "Recursion",
        stem: "The recursive subroutine Pow calculates B to the power E, where E is a whole number.",
        parts: [
          { label: "06.1", command: "State", ref: "4.1.1.16", marks: 1,
            code: ["1   SUBROUTINE Pow(B, E)",
              "2     IF E = 0 THEN",
              "3       RETURN 1",
              "4     ELSE IF E MOD 2 = 0 THEN",
              "5       H ← Pow(B, E DIV 2)",
              "6       RETURN H * H",
              "7     ELSE",
              "8       RETURN B * Pow(B, E - 1)",
              "9     ENDIF",
              "10  ENDSUBROUTINE"],
            q: "State the line numbers of the subroutine above that form the base case.",
            ms: ["Lines 2 and 3 (1)"],
            guide: "A. line 3, or lines 2–3." },
          { label: "06.2", command: "Complete", ref: "4.1.1.16", marks: 4,
            q: "The subroutine is called as Pow(3, 5). Complete the trace table to show the parameters of each call, in the order the calls are made, and the value each call returns.",
            fill: { head: ["Call", "B", "E", "Value returned"], rows: [
              ["1", "3", "5", ""], ["2", "", "", ""], ["3", "", "", ""], ["4", "", "", ""], ["5", "", "", ""]] },
            ms: ["Calls 2–5: B = 3 in each and E = 4, 2, 1, 0 (1)",
              "Call 5 returns 1 and call 4 returns 3 (1)",
              "Call 3 returns 9 and call 2 returns 81 (1)",
              "Call 1 returns 243 (1)"],
            guide: "Follow through the returned values from an incorrect E column." },
          { label: "06.3", command: "Explain", ref: "4.1.1.16", marks: 3,
            q: "Explain what would happen if Pow were called with a negative value of E, such as Pow(2, -1).",
            ms: ["E never reaches 0 (it alternates between -1 and -2), so the base case is never reached (1)",
              "Each call pushes a new stack frame (return address, parameters, local variables) onto the call stack (1)",
              "The call stack runs out of memory / stack overflow, and the program crashes (1)"],
            guide: "A. \"infinite recursion\" for the first mark. Whether -1 MOD 2 gives 1 or -1 does not matter: E DIV 2 or E - 1 never reaches 0 either way." },
          { label: "06.4", command: "State", ref: "4.1.1.16", marks: 1,
            q: "State how many calls of Pow are made in total, including the first, when Pow(2, 16) is evaluated.",
            ms: ["6 (1)"],
            guide: "The values of E are 16, 8, 4, 2, 1, 0." }
        ] },

      /* ---------- 7 · graphs (6) ---------- */
      { n: 7, title: "Graphs",
        stem: "An undirected graph with seven vertices is stored as the adjacency list shown in the table.",
        parts: [
          { label: "07.1", command: "Explain", ref: "4.2.4.1", marks: 1,
            q: "Explain why this graph is not a tree.",
            table: { head: ["Vertex", "Adjacent vertices"], rows: [
              ["A", "B, D"], ["B", "A, E"], ["C", "D, F"], ["D", "A, C, E"], ["E", "B, D, G"], ["F", "C, G"], ["G", "E, F"]] },
            ms: ["It contains a cycle, e.g. A–B–E–D–A (1)"],
            guide: "A. \"it has 8 edges; a tree with 7 vertices has 6\". R. \"it is not a binary tree\"." },
          { label: "07.2", command: "Complete", ref: "4.3.1.1", marks: 3,
            q: "A breadth-first traversal is carried out on the graph, starting at vertex A. A vertex's unvisited neighbours are added to the queue in alphabetical order.\n\nComplete the table to show each vertex as it is removed from the queue and the contents of the queue after its unvisited neighbours have been added. The first row has been completed for you.",
            fill: { head: ["Vertex removed from the queue", "Queue after its neighbours are added (front first)"], rows: [
              ["A", "B, D"], ["", ""], ["", ""], ["", ""], ["", ""], ["", ""], ["", ""]] },
            ms: ["B removed, queue D, E; then D removed, queue E, C (1)",
              "E removed, queue C, G; then C removed, queue G, F (1)",
              "G removed, queue F; then F removed, queue empty (1)"],
            guide: "A vertex already visited or already in the queue is not added again. Follow through for one error in the order removed." },
          { label: "07.3", command: "State", ref: "4.3.1.1", marks: 2,
            q: "A recursive depth-first traversal is carried out on the same graph, starting at vertex A and visiting adjacent vertices in alphabetical order. State the order in which the vertices are visited.",
            ms: ["A, B, E, D (1)", "C, F, G (1)"],
            guide: "The full order is A, B, E, D, C, F, G. The second mark needs the first four correct." }
        ] },

      /* ---------- 8 · trees (6) ---------- */
      { n: 8, title: "Trees",
        stem: "These values are inserted, in this order, into an empty binary search tree: 41, 23, 67, 15, 30, 55, 80, 27. The tree is stored in three arrays, Left, Data and Right. Each value is stored at the next free index, starting at 0, and -1 is a null pointer.",
        parts: [
          { label: "08.1", command: "Complete", ref: "4.2.5.1", marks: 3,
            q: "Complete the table to show the contents of the Left and Right arrays after all eight values have been inserted.",
            fill: { head: ["Index", "Left", "Data", "Right"], rows: [
              ["0", "", "41", ""], ["1", "", "23", ""], ["2", "", "67", ""], ["3", "", "15", ""],
              ["4", "", "30", ""], ["5", "", "55", ""], ["6", "", "80", ""], ["7", "", "27", ""]] },
            ms: ["Index 0: Left 1, Right 2; index 1: Left 3, Right 4 (1)",
              "Index 2: Left 5, Right 6; index 4: Left 7, Right -1 (1)",
              "Indexes 3, 5, 6 and 7: Left -1, Right -1 (1)"] },
          { label: "08.2", command: "State", ref: "4.3.2.1", marks: 2,
            q: "State the order in which the values are output by a post-order traversal of the tree.",
            ms: ["15, 27, 30, 23 (1)", "55, 80, 67, 41 (1)"],
            guide: "The full order is 15, 27, 30, 23, 55, 80, 67, 41." },
          { label: "08.3", command: "State", ref: "4.3.4.3", marks: 1,
            q: "The tree is searched for the value 27. State the values that are compared with 27, in order.",
            ms: ["41, 23, 30, 27 (1)"] }
        ] },

      /* ---------- 9 · sorting and searching (10) ---------- */
      { n: 9, title: "Sorting and searching",
        stem: "A program sorts lists of integers into ascending order and searches them.",
        parts: [
          { label: "09.1", command: "Complete", ref: "4.3.5.1", marks: 2,
            q: "The list below is sorted with a bubble sort. Each pass compares adjacent items from the start of the list and swaps them if they are in the wrong order.\n\nComplete the table to show the list after the first pass and after the second pass.",
            fill: { head: ["Stage", "[0]", "[1]", "[2]", "[3]", "[4]", "[5]"], rows: [
              ["Start", "38", "12", "45", "7", "29", "16"],
              ["After pass 1", "", "", "", "", "", ""],
              ["After pass 2", "", "", "", "", "", ""]] },
            ms: ["After pass 1: 12, 38, 7, 29, 16, 45 (1)", "After pass 2: 12, 7, 29, 16, 38, 45 (1)"],
            guide: "Follow through pass 2 from an incorrect pass 1." },
          { label: "09.2", command: "Describe", ref: "4.3.5.1", marks: 2,
            q: "Describe two changes that would make this bubble sort more efficient.",
            ms: ["Max 2 from:",
              "Use a flag to record whether any swap was made during a pass, and stop when a pass makes no swaps (1)",
              "Reduce the number of comparisons by one on each pass, as the largest remaining item is already in its final place (1)"] },
          { label: "09.3", command: "Complete", ref: "4.3.4.2", marks: 3,
            code: ["Low ← 0",
              "High ← 14",
              "Found ← False",
              "WHILE Found = False AND Low <= High",
              "  Mid ← (Low + High) DIV 2",
              "  IF List[Mid] = Target THEN",
              "    Found ← True",
              "  ELSE IF List[Mid] < Target THEN",
              "    Low ← Mid + 1",
              "  ELSE",
              "    High ← Mid - 1",
              "  ENDIF",
              "ENDWHILE"],
            q: "The binary search algorithm above searches the 15-item sorted list below for Target = 61.\n\n4, 9, 13, 18, 22, 27, 31, 36, 40, 45, 52, 58, 61, 67, 73\n\nThe items are at indexes 0 to 14. Complete the table to show Low, High, Mid and List[Mid] each time Mid is calculated. The first row has been completed for you.",
            fill: { head: ["Low", "High", "Mid", "List[Mid]"], rows: [
              ["0", "14", "7", "36"], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]] },
            ms: ["Row 2: 8, 14, 11, 58 (1)", "Row 3: 12, 14, 13, 67 (1)", "Row 4: 12, 12, 12, 61 (1)"],
            guide: "Follow through for one arithmetic slip." },
          { label: "09.4", command: "State", ref: "4.3.4.2", marks: 2,
            q: "State the time complexity of a binary search and of a linear search.",
            ms: ["Binary search: O(log n) (1)", "Linear search: O(n) (1)"] },
          { label: "09.5", command: "State", ref: "4.3.5.2", marks: 1,
            q: "Merge sort has a better time complexity than bubble sort. State one disadvantage of merge sort compared with bubble sort.",
            ms: ["Max 1 from:",
              "It needs more memory, for the sublists made while splitting and merging (1)",
              "It is more complex to program (recursive) (1)",
              "It is not faster for a list that is already (almost) sorted, where an optimised bubble sort needs only one pass (1)"] }
        ] },

      /* ---------- 10 · assembly language (9) ---------- */
      { n: 10, title: "Assembly language",
        stem: "The program below is written using the AQA assembly language instruction set. Memory location 100 holds a positive integer.",
        parts: [
          { label: "10.1", command: "State", ref: "4.7.3.4", marks: 1,
            code: ["1          LDR R0, 100",
              "2          MOV R1, #0",
              "3  loop:   CMP R0, #0",
              "4          BEQ finish",
              "5          AND R2, R0, #1",
              "6          ADD R1, R1, R2",
              "7          LSR R0, R0, #1",
              "8          B loop",
              "9  finish: STR R1, 101",
              "10         HALT"],
            q: "State the addressing mode used for the operand #1 in line 5 of the program above.",
            ms: ["Immediate (addressing) (1)"] },
          { label: "10.2", command: "Complete", ref: "4.7.3.5", marks: 4,
            q: "Memory location 100 contains the value 13. Complete the trace table to show how the contents of the registers and of memory location 101 change as the program runs. Write a value only when it changes. You may not need all the rows.",
            fill: { head: ["R0", "R1", "R2", "Location 101"], rows: [
              ["13", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]] },
            ms: ["R0: 13, 6, 3, 1, 0 (1)",
              "R1: 0, 1, 2, 3 (1)",
              "R2: 1, 0, 1, 1 (1)",
              "Location 101: 3 (1)"],
            guide: "A. a value repeated in a column (e.g. R2 written on every pass) as long as the sequence of values is right." },
          { label: "10.3", command: "State", ref: "4.7.3.5", marks: 1,
            q: "State the purpose of the program.",
            ms: ["It counts how many bits are 1 in the binary value in location 100 and stores the count in location 101 (1)"],
            guide: "R. \"counts to 3\" or a description of each line." },
          { label: "10.4", command: "Write", ref: "4.7.3.5", marks: 3,
            q: "Memory locations 200 and 201 each hold an integer. Write a program, using the AQA assembly language instruction set, that stores the larger of the two values in memory location 202. If the values are equal, either one may be stored.",
            ms: ["Loads both values into registers: LDR R0, 200 and LDR R1, 201 (1)",
              "Compares them and branches on the result: CMP R0, R1 then BGT (or BLT) to a label (1)",
              "Stores the correct value in 202 on each path (STR R0, 202 / STR R1, 202), with a branch past the other STR, and HALT (1)"],
            guide: "Model answer (run on both orders and on equal values):\nLDR R0, 200\nLDR R1, 201\nCMP R0, R1\nBGT first\nSTR R1, 202\nB done\nfirst: STR R0, 202\ndone: HALT\nA. any register numbers and label names, and other correct structures (e.g. MOV the larger value into one register and store it once). The third mark is lost if both paths can run (a missing B done)." }
        ] },

      /* ---------- 11 · databases (10) ---------- */
      { n: 11, title: "Databases",
        stem: "A music school stores details of its lessons in one table, LessonRecord. Each teacher teaches one instrument. Some of its records are shown in the table.",
        parts: [
          { label: "11.1", command: "Explain", ref: "4.10.3", marks: 2,
            table: { head: ["LessonID", "LessonDate", "LessonTime", "StudentID", "StudentName", "TeacherID", "TeacherName", "Instrument"], rows: [
              ["L101", "2026-11-28", "16:00", "S07", "Maya Chen", "T2", "Okafor", "Violin"],
              ["L102", "2026-12-02", "17:30", "S12", "Tom Reid", "T1", "Haddad", "Piano"],
              ["L103", "2026-12-03", "16:00", "S07", "Maya Chen", "T2", "Okafor", "Violin"],
              ["L104", "2026-12-03", "17:00", "S15", "Ava Patel", "T2", "Okafor", "Violin"],
              ["L105", "2026-12-04", "16:30", "S12", "Tom Reid", "T3", "Brennan", "Guitar"],
              ["L106", "2026-12-09", "16:00", "S15", "Ava Patel", "T2", "Okafor", "Violin"]] },
            q: "The primary key of LessonRecord is LessonID. Explain why LessonRecord is not in third normal form.",
            ms: ["There are non-key (transitive) dependencies: StudentName depends on StudentID (and TeacherName and Instrument on TeacherID), not on the key LessonID (1)",
              "So data is repeated (e.g. Okafor and Violin stored for every lesson), causing redundancy / update anomalies (1)"],
            guide: "A. a correct example of an anomaly (changing a teacher's instrument means changing many records) for the second mark." },
          { label: "11.2", command: "Write", ref: "4.10.3", marks: 3,
            q: "Write the relations, in third normal form, that would store the same data as LessonRecord. Use the format\n\nRelationName(Attribute1, Attribute2, ...)\n\nand identify the primary key and any foreign keys of each relation.",
            dependsOn: "11.1",
            ms: ["Student(StudentID, StudentName) with StudentID as its primary key (1)",
              "Teacher(TeacherID, TeacherName, Instrument) with TeacherID as its primary key (1)",
              "Lesson(LessonID, LessonDate, LessonTime, StudentID, TeacherID) with LessonID as its primary key and StudentID and TeacherID as foreign keys (1)"],
            guide: "A. any sensible relation names and any way of marking keys (underlining, PK/FK, an asterisk). R. a relation that keeps StudentName or TeacherName in Lesson. A. Instrument in its own relation linked to Teacher." },
          { label: "11.3", command: "Write", ref: "4.10.4", marks: 5,
            q: "The data is stored in the three relations from your answer to 11.2, named Student, Teacher and Lesson.\n\nWrite an SQL query that lists the date, time and student's name of every lesson taught by the teacher named Okafor on or after 1 December 2026. The lessons should be listed in order of date and then time. Dates are stored as text in the form YYYY-MM-DD.",
            dependsOn: "11.2",
            ms: ["SELECT LessonDate, LessonTime, StudentName (1)",
              "FROM Lesson, Student, Teacher (or the three tables joined with JOIN) (1)",
              "Lesson.StudentID = Student.StudentID AND Lesson.TeacherID = Teacher.TeacherID (1)",
              "WHERE TeacherName = 'Okafor' AND LessonDate >= '2026-12-01' (1)",
              "ORDER BY LessonDate, LessonTime (1)"],
            guide: "Model answer (run on the data shown; returns 2026-12-03 16:00 Maya Chen, 2026-12-03 17:00 Ava Patel, 2026-12-09 16:00 Ava Patel):\nSELECT LessonDate, LessonTime, StudentName\nFROM Lesson, Student, Teacher\nWHERE Lesson.StudentID = Student.StudentID\nAND Lesson.TeacherID = Teacher.TeacherID\nAND TeacherName = 'Okafor'\nAND LessonDate >= '2026-12-01'\nORDER BY LessonDate, LessonTime;\nA. INNER JOIN … ON …, a nested SELECT for the TeacherID, table-name prefixes, double quotes, a date written #01/12/2026#, > '2026-11-30'. R. TeacherID = 'T2' (the question names the teacher). Ignore a missing semicolon." }
        ] },

      /* ---------- 12 · consequences of computing (9) ---------- */
      { n: 12, title: "Consequences of uses of computing",
        stem: "A large supermarket chain plans to install cameras with automatic facial recognition at the entrance of every store. The system would compare each customer's face with a database of people the chain says have stolen from its stores or been violent to staff, and alert security staff when it finds a match.",
        parts: [
          { label: "12.1", command: "Discuss", ref: "4.8.1", marks: 9,
            q: "Discuss the moral, ethical, legal and cultural issues that the supermarket chain should consider before installing this system.\n\nIn your answer you will be assessed on your ability to follow a line of reasoning to produce a coherent, relevant, substantiated and logically structured response.",
            ms: ["Mark by level (see the level descriptors), using the indicative content.",
              "Level 3: 7–9 marks", "Level 2: 4–6 marks", "Level 1: 1–3 marks"],
            levels: L9,
            indicative: [
              "Moral/ethical — benefits: may reduce theft and protect staff from violence; could keep prices lower for honest customers.",
              "Moral/ethical — accuracy: false positives mean innocent customers may be wrongly accused, embarrassed or refused entry; recognition systems have been less accurate for some ethnic groups, women and older people, so the harm may fall unequally (bias from unrepresentative training data).",
              "Moral/ethical — consent and due process: every customer is scanned without a real choice; people are added to the watchlist by the company, not a court, with no clear way to appeal or be removed.",
              "Legal — biometric data used to identify people is special category data under UK GDPR / the Data Protection Act 2018: the chain needs a lawful basis and a substantial justification, must tell customers (signage, a privacy notice), keep data only as long as necessary and secure it; the ICO can investigate and fine.",
              "Legal — the right to respect for private life (Human Rights Act); discrimination if the system treats groups differently (Equality Act); who is liable when a wrong match leads to someone being detained.",
              "Security — a database of faces is a valuable target; a breach cannot be fixed by changing a password, as a face cannot be changed; sharing data with the police or other retailers widens the risk (function creep).",
              "Cultural — normalises constant surveillance in everyday places; customers may feel watched and lose trust, and some may shop elsewhere; attitudes to surveillance differ between communities and countries.",
              "A conclusion weighing these, e.g. the system should only be used with clear signage, human checking of every match, independent testing for bias, strict retention limits and a way to challenge being on the list — or not at all if the risks to innocent customers outweigh the reduction in theft."] }
        ] }
    ]
  };
})();
