/* Kurenai OS — js/data/exams/aqa-7517-1-ppe-a.js
   AQA 7517 Paper 1, a PARTIAL full Companion (the Exams & Papers rework
   §9.2; invariant 130): the December pre-public exam's Paper 1 topics, part
   A — 4.1.2.3 object-oriented programming, 4.2.2.1 queues, 4.2.3.1 stacks
   and 4.1.1.16 recursive techniques. AUTHORED, original (see
   aqa-7517-2-45.js for the shape and the rules): every question and worked
   answer is written by KurenaiOS in the board's style; real questions are
   referenced by series and number only (from the index), and every trap
   that cites a series paraphrases our own examiner's-report notes
   (tools/exam-index/reports/aqa-7517-1.md). Every queue and stack state,
   every recursive call sequence, return value and output here was produced
   by running the code before it was written.                              */
(function () {
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var D = X.deep = X.deep || {};
  var P = D["aqa-7517-1"] = D["aqa-7517-1"] || { leaves: {} };
  P.leaves = P.leaves || {};
  P.partial = true;
  var L = P.leaves;

  var Q_REMOVE = { sitting: "2022-06", q: "Q02.1", text: "Removing from a circular queue went badly. Answers took the item from the rear, or shuffled every item up one place (that is a linear queue), or never checked whether the queue was empty. The marks are: check empty, take the item at the front, move the front pointer on one with a wrap (MOD), and reduce the count." };
  var Q_REVERSE = { sitting: "2022-06", q: "Q02.5", text: "Reversing a queue with a stack: many emptied the queue onto the stack and popped the items off, but never put them BACK into the queue. The second half of the method is half the marks." };

  /* ================= 4.1.2.3 Object-oriented programming ================= */
  L["4.1.2.3"] = {
    archetypes: [
      { id: "cs.oop-classes", title: "Classes, objects and encapsulation",
        match: "class|object|instantiat|encapsulat|constructor|private|public|protected|getter|setter",
        rules: ["A class is the blueprint (attributes and methods); an object is one instance of it, made by instantiation (the constructor runs).",
          "Encapsulation: attributes are private and reached only through the class's public methods, so the object controls its own data.",
          "Access: private = this class only; protected = this class AND its subclasses; public = any code.",
          "Writing a class definition: name, the private attributes with their types, then the public methods; a getter returns an attribute, a setter checks and changes it."],
        traps: [{ sitting: "2022-06", q: "Q06.3", text: "Protected was often described as if it were private. Protected means visible in the class and in every subclass of it. It has nothing to do with which programmer may edit the code." }],
        variations: [
          { v: "A", t: "Encapsulation and why attributes are private", m: 3,
            q: "A class `BankAccount` has a private attribute `Balance` and public methods `Deposit(Amount)` and `GetBalance()`. Explain how this design shows encapsulation and why `Balance` is private.",
            steps: [["Encapsulation bundles the data (`Balance`) together with the methods that work on it inside one class.", "MP1", "What encapsulation is"],
              ["Because `Balance` is private, code outside the class cannot read or change it directly; it must call `Deposit` or `GetBalance`.", "MP2", "Private → only through methods"],
              ["So `Deposit` can validate every change (for example refuse a negative amount), and the balance can never be set to an invalid value from outside.", "MP3", "Why it helps: the object protects its own state"]] },
          { v: "B", t: "Private, protected and public", m: 2,
            q: "The class `Employee` has an attribute `Salary` declared as protected. `Manager` is a subclass of `Employee`. Explain which classes can access `Salary` directly, and how this differs from declaring it private.",
            steps: [["Protected: `Salary` can be accessed directly by methods of `Employee` and of its subclasses, such as `Manager`.", "MP1", "The class and its subclasses"],
              ["If it were private, only methods of `Employee` itself could use it; `Manager` would have to use an inherited public (or protected) method.", "MP2", "Private excludes subclasses"]],
            trap: "Saying \"protected means other programmers cannot change it\" scores nothing: access modifiers are about which CODE can see the member." },
          { v: "C", t: "Write a class definition", m: 4,
            q: "A gym's system needs a class `Member` with private attributes `MemberID` (string), `Name` (string) and `Visits` (integer); a constructor that sets the ID and name and sets `Visits` to 0; a public procedure `RecordVisit` that adds one to `Visits`; and a public function `GetVisits`. Write the class definition. (Pseudo-code or C# is accepted.)",
            code: ["Member = Class", "    Public", "        Procedure New(ID, MemberName)", "        Procedure RecordVisit", "        Function GetVisits", "    Private", "        MemberID: String", "        Name: String", "        Visits: Integer", "End", "", "Procedure Member.New(ID, MemberName)", "    MemberID ← ID", "    Name ← MemberName", "    Visits ← 0", "End Procedure", "", "Procedure Member.RecordVisit", "    Visits ← Visits + 1", "End Procedure", "", "Function Member.GetVisits", "    RETURN Visits", "End Function"],
            steps: [["The class is named `Member` and the three attributes are declared private with their types.", "MP1", "Attributes private, types given"],
              ["The constructor, `RecordVisit` and `GetVisits` are public; the constructor sets the ID and name and sets `Visits` to 0.", "MP2", "Methods public; constructor initialises all three"],
              ["`RecordVisit` adds one to `Visits`.", "MP3", "The procedure changes the object's own attribute"],
              ["`GetVisits` returns the value of `Visits`.", "MP4", "A getter returns, it does not output"]],
            trap: "Making the attributes public loses the first mark even if every method is right: the question says private." },
          { v: "D", t: "Instantiation and the constructor", m: 2,
            q: "Explain what happens when the statement `NewMember ← Member(\"M104\", \"Asha\")` is executed.",
            steps: [["A new object (an instance) of the class `Member` is created in memory and `NewMember` refers to it: instantiation.", "MP1", "An object is made from the class"],
              ["The constructor runs with the arguments \"M104\" and \"Asha\", setting the new object's attributes to their starting values.", "MP2", "The constructor initialises the attributes"]] }
        ] },
      { id: "cs.oop-inheritance", title: "Inheritance, overriding and polymorphism",
        match: "inherit|subclass|superclass|overrid|polymorph|abstract|virtual|static",
        rules: ["Inheritance: a subclass takes every attribute and method of its superclass and adds or changes some; it is an \"is a\" relationship.",
          "Overriding: the subclass redefines an INHERITED method with the same name and parameters; tie the answer to inheritance.",
          "Polymorphism: one method call works on objects of different classes, each running its own version.",
          "Abstract: no body in the base class, every concrete subclass must override it, and the base class cannot be instantiated. Virtual: has a body, may be overridden. Static: belongs to the class, called without an object."],
        traps: [{ sitting: "2022-06", q: "Q06.4", text: "Vague definitions of overriding lost the mark. Link it to inheritance: a subclass gives its own version of a method it inherited, keeping the same name and parameters." }],
        variations: [
          { v: "A", t: "Define overriding", m: 2,
            q: "`Square` is a subclass of `Shape`. Both classes have a method `GetArea`. Explain what is meant by method overriding, using this example.",
            steps: [["`Square` inherits `GetArea` from `Shape` but defines its own method with the same name and parameters.", "MP1", "Same signature in the subclass, inherited from the superclass"],
              ["When `GetArea` is called on a `Square` object, the subclass's version runs instead of the inherited one.", "MP2", "Which version runs"]] },
          { v: "B", t: "Explain polymorphism", m: 3,
            q: "A drawing program stores a list `Shapes` of objects of the classes `Circle` and `Rectangle`, both subclasses of `Shape`. It totals the area with `FOR EACH S IN Shapes: Total ← Total + S.GetArea()`. Explain how polymorphism is used.",
            steps: [["Polymorphism: objects of different classes respond to the same method call, each in its own way.", "MP1", "What it is"],
              ["`Circle` and `Rectangle` each override `GetArea` inherited from `Shape` with their own formula.", "MP2", "The overriding that makes it work"],
              ["So the loop calls `S.GetArea()` on every object without checking its type, and the right version runs for each one.", "MP3", "Apply it to the loop"]] },
          { v: "C", t: "Abstract, virtual and static methods", m: 3,
            q: "Explain the difference between an abstract method, a virtual method and a static method.",
            steps: [["Abstract: declared in the base class with no implementation; every (concrete) subclass must override it, and the base class cannot be instantiated.", "MP1", "No body; must be overridden"],
              ["Virtual: has an implementation in the base class which a subclass MAY override.", "MP2", "A body; optional override"],
              ["Static: belongs to the class rather than to any object, so it can be called without creating an instance (it cannot use an object's attributes).", "MP3", "Class-level, no object needed"]] },
          { v: "D", t: "Write a subclass", m: 4,
            q: "The class `Vehicle` has a protected attribute `Registration`, a constructor `New(Reg)` and a virtual function `GetDescription` that returns the registration. Write the definition of a subclass `Van` with a private integer attribute `MaxLoad`, a constructor taking the registration and the load, and its own `GetDescription` that returns the registration followed by the load. (Pseudo-code or C# is accepted.)",
            code: ["Van = Class (Vehicle)", "    Public", "        Procedure New(Reg, Load)", "        Override Function GetDescription", "    Private", "        MaxLoad: Integer", "End", "", "Procedure Van.New(Reg, Load)", "    Vehicle.New(Reg)", "    MaxLoad ← Load", "End Procedure", "", "Function Van.GetDescription", "    RETURN Registration + \" max load \" + INT_TO_STRING(MaxLoad)", "End Function"],
            steps: [["The header shows that `Van` inherits from `Vehicle`.", "MP1", "Inheritance declared (C#: class Van : Vehicle)"],
              ["`MaxLoad` is declared as a private integer attribute.", "MP2", "Only the NEW attribute is declared; Registration is inherited"],
              ["The constructor passes the registration to the base class's constructor and sets `MaxLoad`.", "MP3", "C#: public Van(string reg, int load) : base(reg)"],
              ["`GetDescription` is overridden, returning `Registration` (reachable because it is protected) with the load.", "MP4", "Override keyword / same signature"]],
            trap: "Re-declaring `Registration` in `Van` is wrong: it is inherited, and because it is protected `Van` can use it directly." }
        ] },
      { id: "cs.oop-relationships", title: "Aggregation, composition and the design principles",
        match: "aggregat|composit|association|class diagram|interface|design principle|encapsulate what varies",
        rules: ["Composition: the contained object is created and destroyed WITH its container and cannot exist alone (a House and its Rooms). Class diagram: filled diamond at the container end.",
          "Aggregation: the contained object can exist independently of the container (a Team and its Players). Class diagram: hollow diamond at the container end.",
          "Inheritance in a class diagram: a line with a hollow triangle pointing at the superclass.",
          "The three principles: encapsulate what varies; favour composition over inheritance; program to interfaces, not implementations. Apply each to the scenario you are given."],
        traps: [],
        variations: [
          { v: "A", t: "Aggregation or composition", m: 2,
            q: "A `Library` object holds a list of `Member` objects; members can move to another library. A `Book` object is made up of `Page` objects that are created with the book. Identify the type of association in each case and justify it.",
            steps: [["Library–Member is aggregation: a member still exists if the library object is deleted.", "MP1", "Independent lifetime → aggregation"],
              ["Book–Page is composition: the pages are created with the book and destroyed with it; a page cannot exist on its own.", "MP2", "Shared lifetime → composition"]] },
          { v: "B", t: "Read a class diagram described in words", m: 3,
            q: "A class diagram has: a line from `School` to `Classroom` with a filled diamond at the `School` end; a line from `School` to `Teacher` with a hollow diamond at the `School` end; and a line from `Teacher` to `StaffMember` with a hollow triangle at the `StaffMember` end. Describe the relationship each line shows.",
            steps: [["School–Classroom: composition; the classrooms belong to the school and are destroyed with it.", "MP1", "Filled diamond"],
              ["School–Teacher: aggregation; a teacher exists independently and could move to another school.", "MP2", "Hollow diamond"],
              ["Teacher–StaffMember: inheritance; `Teacher` is a subclass of `StaffMember` (a teacher IS a staff member).", "MP3", "Hollow triangle points at the superclass"]] },
          { v: "C", t: "Favour composition over inheritance", m: 2,
            q: "A game has a class `Character` with subclasses `FlyingCharacter`, `SwimmingCharacter` and `FlyingSwimmingCharacter`. Explain how the principle \"favour composition over inheritance\" could improve this design.",
            steps: [["Inheritance fixes each combination of abilities in a separate subclass, so every new ability multiplies the classes, and a change to a base class affects them all.", "MP1", "The problem with the hierarchy"],
              ["Instead, `Character` could CONTAIN movement objects (for example a list of `Movement` objects such as `Fly` and `Swim`), so abilities are combined, and even swapped at run time, without new subclasses.", "MP2", "Composition: has-a, flexible"]] },
          { v: "D", t: "Program to interfaces", m: 2,
            q: "A payment module calls `Processor.Pay(Amount)`, where `Processor` is declared as the interface `IPaymentMethod`, implemented by `CardPayment` and `VoucherPayment`. Explain how this follows the principle \"program to interfaces, not implementations\".",
            steps: [["The calling code depends only on the methods the interface `IPaymentMethod` promises, not on any one concrete class.", "MP1", "Code refers to the interface"],
              ["So any class that implements the interface (a new `WalletPayment`, say) can be used without changing the calling code.", "MP2", "Substitutable without edits"]] }
        ] }
    ],
    practice: [
      [1, 1, "State what is meant by an object in object-oriented programming.", ["An instance of a class (1)"], { arch: "cs.oop-classes" }],
      [1, 1, "State the access modifier that makes an attribute visible only inside its own class.", ["Private (1)"], { arch: "cs.oop-classes" }],
      [1, 1, "In a class diagram, what does a hollow diamond at one end of a line show?", ["Aggregation (the class at the diamond end holds the other) (1)"], { arch: "cs.oop-relationships" }],
      [2, 2, "Explain what is meant by a protected attribute.", ["It can be accessed by the methods of its own class (1)", "and by the methods of any subclass of that class (1)"], { arch: "cs.oop-classes" }],
      [2, 2, "A `Car` object contains an `Engine` object that is created in the car's constructor and destroyed with it. A `Car` also refers to a `Driver` object. Identify the association between Car and Engine and between Car and Driver.", ["Car–Engine: composition (the engine cannot exist without the car) (1)", "Car–Driver: aggregation (the driver exists independently) (1)"], { arch: "cs.oop-relationships" }],
      [2, 3, "`Dog` and `Cat` are subclasses of `Animal`, which has a method `Speak`. Explain how polymorphism lets a program make every animal in a list speak.", ["Each subclass overrides `Speak` with its own version (1)", "The program calls `Speak` on each object in the list without checking its class (1)", "The version for that object's own class runs / same call, different behaviour (1)"], { arch: "cs.oop-inheritance" }],
      [3, 4, "The class `Account` has a protected attribute `Balance` and a virtual procedure `Withdraw(Amount)` that refuses to take the balance below 0. Write the definition of a subclass `SavingsAccount` with a private real attribute `Rate`, a public procedure `AddInterest` that adds `Balance × Rate` to the balance, and an overridden `Withdraw` that also refuses any withdrawal over 500. Pseudo-code or C# is accepted.", ["Header shows SavingsAccount inherits from Account (1)", "Private attribute Rate declared (1)", "AddInterest sets Balance ← Balance + Balance × Rate (1)", "Withdraw overridden: refuses amounts over 500 or below the balance limit, otherwise subtracts (1)"], { arch: "cs.oop-inheritance" }],
      [3, 2, "Explain why a base class `Shape` might declare `GetArea` as an abstract method rather than a virtual one.", ["There is no sensible area for a general shape, so no implementation can be written (1)", "Abstract forces every subclass to provide its own GetArea / Shape cannot be instantiated by mistake (1)"], { arch: "cs.oop-inheritance" }],
      [3, 3, "A music app has a class `Player` that inherits from `MP3Decoder` so that it can play MP3 files. The developers now need it to play FLAC files too. Explain how the principles \"favour composition over inheritance\" and \"program to interfaces\" could be applied.", ["Player should contain a decoder object (has-a) rather than inherit from one decoder (1)", "Define an interface (e.g. IDecoder) that MP3Decoder and FlacDecoder implement (1)", "Player calls the interface, so a decoder can be swapped / a new format added without changing Player (1)"], { arch: "cs.oop-relationships" }]
    ]
  };

  /* ================= 4.2.2.1 Queues ================= */
  L["4.2.2.1"] = {
    archetypes: [{
      id: "cs.queues",
      rules: ["A queue is FIFO: add at the REAR, remove from the FRONT.",
        "Every add checks FULL first and every remove checks EMPTY first; the error is reported, not ignored.",
        "Circular wrap: Pointer ← (Pointer + 1) MOD MaxSize (or compare with the last index and reset to 0). Then update the count (Size).",
        "Linear queue in an array: removed spaces at the front are never reused (unless every item is shuffled up, which is slow). A circular queue reuses them.",
        "Priority queue: an item joins behind every item of the same or higher priority, so equal priorities stay first in, first out."],
      traps: [Q_REMOVE, Q_REVERSE],
      variations: [
        { v: "A", t: "Describe adding to a circular queue", m: 4,
          q: "A circular queue is stored in an array `Queue` of `MaxSize` elements, indexed from 0, with pointers `Front` and `Rear` and a variable `Size` holding the number of items. Describe the steps needed to add a new item to the queue.",
          steps: [["Check whether the queue is full (`Size = MaxSize`); if it is, report an error and add nothing.", "MP1", "Full check FIRST"],
            ["Otherwise move the rear pointer on one place, wrapping round: `Rear ← (Rear + 1) MOD MaxSize`.", "MP2", "Rear moves before the store; the wrap is needed"],
            ["Store the new item at `Queue[Rear]`.", "MP3", "At the rear, never the front"],
            ["Add one to `Size`.", "MP4", "The count is updated"]] },
        { v: "B", t: "Describe removing from a circular queue", m: 4,
          q: "Using the same circular queue (`Queue`, `MaxSize`, `Front`, `Rear`, `Size`), describe the steps needed to remove an item from the queue.",
          steps: [["Check whether the queue is empty (`Size = 0`); if it is, report an error and remove nothing.", "MP1", "Empty check FIRST"],
            ["Otherwise take the item stored at `Queue[Front]` (to be returned).", "MP2", "From the front, never the rear"],
            ["Move the front pointer on one place, wrapping round: `Front ← (Front + 1) MOD MaxSize`.", "MP3", "No items are moved"],
            ["Subtract one from `Size`.", "MP4", "The count is updated"]],
          trap: "Shuffling every item one place towards the start describes a LINEAR queue and scores nothing here." },
        { v: "C", t: "Trace a sequence of operations", m: 3,
          try: [{ "grid": { "cols": ["After", "Front", "Rear", "Size", "Queue[0..4]"], "rows": [["Start", "2", "4", "3", "_ _ K L M"], ["Add(P)", "2", "0", "4", "P _ K L M"], ["Add(Q)", "2", "1", "5", "P Q K L M"], ["Remove()", "3", "1", "4", "P Q K L M"], ["Add(R)", "3", "2", "5", "P Q R L M"]], "given": [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [2, 0], [3, 0], [4, 0]], "cap": "Removing moves Front only: K stays in the array until it is overwritten." } }],
          q: "A circular queue uses an array of five elements, indices 0 to 4. Currently `Front = 2`, `Rear = 4`, `Size = 3` and the queue holds K, L, M in elements 2, 3 and 4. The operations `Add(P)`, `Add(Q)`, `Remove()`, `Add(R)` are carried out in order. State the item returned by `Remove()`, the final values of `Front`, `Rear` and `Size`, and the contents of elements 0 to 4.",
          steps: [["`Add(P)`: Rear wraps to (4 + 1) MOD 5 = 0; `Add(Q)`: Rear = 1, Size = 5 (full). `Remove()` returns K, the item at Front (index 2).", "MP1", "The removed item is the OLDEST, K"],
            ["Front moves to 3 and Size falls to 4; `Add(R)` stores R at index 2, so finally Front = 3, Rear = 2, Size = 5.", "MP2", "All three final values"],
            ["Elements 0 to 4: P, Q, R, L, M.", "MP3", "R overwrites K's old element"]] },
        { v: "D", t: "Why a circular queue", m: 2,
          q: "A queue is implemented in a fixed-size array. Explain why a circular queue is a better choice than a linear queue.",
          steps: [["In a linear queue the front pointer moves up as items are removed, so the elements at the start of the array can never be reused; the queue reports full while there is free space (unless every item is shuffled up, which is slow for a long queue).", "MP1", "The wasted space in a linear queue"],
            ["In a circular queue the rear pointer wraps round to the start of the array, so the freed elements are reused and no items need to be moved.", "MP2", "Wrap reuses the space, no shuffling"]] },
        { v: "E", t: "Adding to a priority queue", m: 3,
          q: "A hospital's queue for treatment is a priority queue held in order in an array, highest priority at the front. Describe the extra steps needed when a patient is added, compared with adding to an ordinary queue.",
          steps: [["Compare the new item's priority with the items already in the queue, starting from the rear.", "MP1", "A search for its place"],
            ["Move each item with a LOWER priority back one place to make a space.", "MP2", "Items are shifted to make room"],
            ["Insert the new item behind the last item of the same or higher priority, so items of equal priority stay in arrival order.", "MP3", "FIFO within a priority"]] }
      ]
    }],
    practice: [
      [1, 1, "State the principle by which items are removed from a queue.", ["First in, first out / FIFO (1)"], { arch: "cs.queues" }],
      [1, 1, "Which pointer is changed when an item is removed from a queue?", ["The front pointer (1)"], { arch: "cs.queues" }],
      [2, 2, "A circular queue has `MaxSize = 6`, indices 0 to 5, and `Rear = 5`. State the value of `Rear` after one item is added, showing how it is calculated.", ["(5 + 1) MOD 6 (1)", "Rear = 0 (1)"], { arch: "cs.queues" }],
      [2, 3, "A linear queue uses an array of 5 elements, indices 0 to 4, with `Front = 0` and `Rear = -1` when empty. The operations Add(A), Add(B), Add(C), Remove(), Remove(), Add(D) are carried out. State the final values of `Front` and `Rear` and which item is now at the front.", ["Front = 2 (1)", "Rear = 3 (1)", "C is at the front (followed by D) (1)"], { arch: "cs.queues" }],
      [2, 2, "A circular queue uses an array of 4 elements, indices 0 to 3, holding X, Y, (empty), W, with `Front = 3`, `Rear = 1` and `Size = 3`. Two items are removed. State the items removed, in order, and the new value of `Front`.", ["W then X (1)", "Front = 1 (1)"], { arch: "cs.queues" }],
      [3, 4, "Write an algorithm, in pseudo-code or C#, to remove and return an item from a circular queue stored in the array `Queue` with `Front`, `Size` and `MaxSize`.", ["Checks for empty (Size = 0) and reports an error / returns without removing (1)", "Item ← Queue[Front] (1)", "Front ← (Front + 1) MOD MaxSize, or compare with MaxSize − 1 and reset to 0 (1)", "Size ← Size − 1 and the item is returned (1)"], { arch: "cs.queues" }],
      [3, 3, "A school's print server sends jobs to one printer in the order they arrive. Explain why a priority queue might be used instead, and one problem that it could cause.", ["Urgent jobs (e.g. from staff) are printed before earlier, less urgent jobs (1)", "Jobs of equal priority are still printed in arrival order (1)", "Low-priority jobs could wait indefinitely if higher-priority jobs keep arriving (starvation) (1)"], { arch: "cs.queues" }]
    ]
  };

  /* ================= 4.2.3.1 Stacks ================= */
  var FRAME_CODE = ["SUBROUTINE CalculateTotal(Prices, Count)", "    Total ← 0", "    FOR Index ← 0 TO Count - 1", "        Total ← Total + Prices[Index]", "    ENDFOR", "    RETURN Total", "ENDSUBROUTINE"];
  L["4.2.3.1"] = {
    archetypes: [
      { id: "cs.stacks",
        rules: ["A stack is LIFO: push and pop both work at the TOP; one pointer (Top) is enough.",
          "Push checks FULL first (overflow); pop and peek check EMPTY first (underflow).",
          "Pop removes and returns the top item; peek (top) returns it and leaves the stack unchanged.",
          "Array stack indexed from 0: empty when Top = −1, full when Top = MaxSize − 1.",
          "Uses: undo, backtracking, reversing, evaluating RPN, the call stack."],
        traps: [Q_REVERSE],
        variations: [
          { v: "A", t: "Results of push, pop and peek", m: 2,
            try: [{ "grid": { "cols": ["Operation", "Returned", "Stack (bottom → top)"], "rows": [["Push(7)", "-", "7"], ["Push(3)", "-", "7 3"], ["Push(9)", "-", "7 3 9"], ["Pop()", "9", "7 3"], ["Push(4)", "-", "7 3 4"], ["Peek()", "4", "7 3 4"]], "given": [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [0, 1], [1, 1], [2, 1], [4, 1]], "cap": "Peek returns the top item and leaves it there." } }],
            q: "An empty stack has these operations carried out in order: Push(7), Push(3), Push(9), Pop(), Push(4), Peek(). State the values returned by `Pop()` and `Peek()`, and the contents of the stack at the end.",
            steps: [["`Pop()` returns 9 (the last item pushed) and `Peek()` returns 4.", "MP1", "Both returned values"],
              ["The stack ends holding 7, 3, 4 (4 at the top): peek did not remove anything.", "MP2", "Three items; peek leaves the stack unchanged"]] },
          { v: "B", t: "Reverse a queue using a stack", m: 2,
            q: "Describe how a stack can be used to reverse the order of the items in a queue.",
            steps: [["Remove each item from the front of the queue and push it onto the stack, until the queue is empty.", "MP1", "Queue → stack"],
              ["Then pop each item off the stack and add it to the rear of the queue, until the stack is empty.", "MP2", "Stack → BACK INTO the queue"]],
            trap: "Stopping once the items are on the stack (or just outputting them) loses the second mark: the queue itself must end up reversed." },
          { v: "C", t: "A stack for undo", m: 4,
            q: "A drawing app stores the user's actions on a stack so that they can be undone. Explain how the stack is used when actions are performed and undone, and what the program must do if the user selects undo when nothing can be undone.",
            steps: [["Each action is pushed onto the stack as it is performed, so the most recent action is always on top.", "MP1", "Push on every action"],
              ["When undo is selected, the top action is popped from the stack.", "MP2", "Pop the most recent"],
              ["The opposite of that action is carried out to restore the drawing (e.g. a line drawn is removed).", "MP3", "Reverse the effect"],
              ["Before popping, check that the stack is not empty; if it is, display a message such as \"Nothing to undo\" instead of popping (avoid underflow).", "MP4", "Empty check, handled"]] },
          { v: "D", t: "Describe the push operation", m: 3,
            q: "A stack is stored in an array `Stack` of `MaxSize` elements, indexed from 0, with a pointer `Top` that is −1 when the stack is empty. Describe how an item is pushed onto the stack.",
            steps: [["Check whether the stack is full (`Top = MaxSize − 1`); if it is, report a stack overflow and push nothing.", "MP1", "Full check first"],
              ["Otherwise add one to `Top`.", "MP2", "Increment BEFORE storing"],
              ["Store the item at `Stack[Top]`.", "MP3", "At the new top"]] },
          { v: "E", t: "Identify the structure", m: 1,
            q: "Identify the data structure that the array `Data` and the pointer `P` implement in the subroutines below.",
            code: ["SUBROUTINE Store(Item)", "    IF P < 9 THEN", "        P ← P + 1", "        Data[P] ← Item", "    ENDIF", "ENDSUBROUTINE", "", "SUBROUTINE Take()", "    IF P > -1 THEN", "        Item ← Data[P]", "        P ← P - 1", "        RETURN Item", "    ENDIF", "ENDSUBROUTINE"],
            steps: [["A stack: items are added and removed at the same end, using one pointer, so the last item stored is the first taken.", "MP1", "One pointer, one end → LIFO"]] }
        ] },
      { id: "cs.stack-frame",
        rules: ["A stack frame holds: the RETURN ADDRESS, the PARAMETERS and the LOCAL VARIABLES of one call.",
          "A frame is pushed when a subroutine is called and popped when it returns; the return address says where to carry on in the caller.",
          "Calls return in the reverse order they were made, which is why a stack (LIFO) is used.",
          "Asked about a given subroutine? Name ITS parameters and ITS local variables, not the generic list.",
          "Recursion that never reaches its base case keeps pushing frames until the stack runs out: stack overflow."],
        traps: [{ sitting: "2022-06", q: "Q08.2", text: "On a question about the stack frame of one subroutine in the Skeleton Program, the generic list (return address, parameters, local variables) was not enough: the answer had to name what THAT subroutine's frame holds." }],
        variations: [
          { v: "A", t: "Components of a stack frame", m: 3,
            q: "State three items stored in a stack frame when a subroutine is called.",
            steps: [["The return address: where execution continues in the calling code once the subroutine ends.", "MP1", ""],
              ["The values (or references) of the subroutine's parameters.", "MP2", ""],
              ["The subroutine's local variables.", "MP3", ""]] },
          { v: "B", t: "Why a stack for subroutine calls", m: 2,
            q: "Explain why a stack is a suitable data structure for storing the return addresses of subroutine calls.",
            steps: [["Subroutines can call other subroutines, and the calls finish in the reverse order to that in which they were made (last called, first to return).", "MP1", "Nesting → LIFO"],
              ["So the frame on the top of the stack always belongs to the subroutine running now; popping it on return gives the address in the caller to go back to.", "MP2", "Top frame = current call"]] },
          { v: "C", t: "This subroutine's stack frame", m: 3,
            q: "The subroutine below is called by the main program. State what will be stored in its stack frame.",
            code: FRAME_CODE,
            steps: [["The return address: the address of the instruction in the main program after the call to `CalculateTotal`.", "MP1", "Return address, in context"],
              ["The parameters `Prices` and `Count`.", "MP2", "Named, not \"the parameters\""],
              ["The local variables `Total` and `Index`.", "MP3", "Both locals named"]] },
          { v: "D", t: "Stack overflow from recursion", m: 2,
            q: "A recursive subroutine is called with a very large argument and the program crashes with a stack overflow. Explain why.",
            steps: [["Each recursive call pushes a new stack frame, and no frame is popped until the base case is reached and the calls start to return.", "MP1", "Frames build up"],
              ["With very deep recursion (or a base case that is never reached), the frames fill the memory allocated to the stack, so it overflows.", "MP2", "The stack's memory is finite"]] }
        ] }
    ],
    practice: [
      [1, 1, "State the principle by which a stack operates.", ["Last in, first out / LIFO (1)"], { arch: "cs.stacks" }],
      [1, 1, "Explain the difference between the pop and peek operations on a stack.", ["Pop removes the top item and returns it; peek returns it without removing it (1)"], { arch: "cs.stacks" }],
      [1, 1, "State one item, other than the return address, that is stored in a stack frame.", ["Parameters / local variables (1)"], { arch: "cs.stack-frame" }],
      [2, 2, "An empty stack has these operations carried out in order: Push(\"A\"), Push(\"B\"), Pop(), Push(\"C\"), Push(\"D\"), Pop(), Pop(). State the values returned by the pops, in order, and what is left on the stack.", ["B, D, C in that order (1)", "Only A is left on the stack (1)"], { arch: "cs.stacks" }],
      [2, 2, "A stack is stored in an array of 8 elements, indexed 0 to 7, with a pointer `Top` that is −1 when the stack is empty. State the conditions that the functions `IsEmpty` and `IsFull` test.", ["IsEmpty: Top = −1 (1)", "IsFull: Top = 7 (1)"], { arch: "cs.stacks" }],
      [2, 2, "A queue holds T, U, V, W with T at the front. A stack is used to reverse it. State the order of the items in the queue afterwards and explain why the stack reverses them.", ["W, V, U, T with W at the front (1)", "The last item pushed (W) is the first popped and added back / LIFO (1)"], { arch: "cs.stacks" }],
      [3, 3, "Write an algorithm, in pseudo-code or C#, to pop an item from a stack stored in the array `Stack` with pointer `Top` (−1 when empty).", ["Checks for empty (Top = −1) and reports underflow / returns without popping (1)", "Item ← Stack[Top] (1)", "Top ← Top − 1 and the item is returned (1)"], { arch: "cs.stacks" }],
      [3, 2, "Explain how a stack can be used to check that the brackets in an expression such as (a[b+c]) are correctly matched.", ["Push each opening bracket; on a closing bracket, pop and check it is the matching type (1)", "Unmatched if the stack is empty when a pop is needed or not empty at the end (1)"], { arch: "cs.stacks" }],
      [3, 3, "The subroutine below is called from the main program. State what its stack frame will hold and explain when the frame is removed from the stack.", ["The return address of the instruction after the call in the main program (1)", "Parameters Prices and Count, and local variables Total and Index (1)", "Popped when the subroutine returns (after RETURN Total), and execution continues at the return address (1)"], { arch: "cs.stack-frame", code: FRAME_CODE }]
    ]
  };

  /* ================= 4.1.1.16 Recursive techniques ================= */
  var SUMDIGITS = ["SUBROUTINE SumDigits(N)", "    IF N < 10 THEN", "        RETURN N", "    ELSE", "        RETURN (N MOD 10) + SumDigits(N DIV 10)", "    ENDIF", "ENDSUBROUTINE"];
  var FIND = ["SUBROUTINE Find(Items, Target, Low, High)", "    IF Low > High THEN", "        RETURN -1", "    ENDIF", "    Mid ← (Low + High) DIV 2", "    IF Items[Mid] = Target THEN", "        RETURN Mid", "    ELSE IF Items[Mid] < Target THEN", "        RETURN Find(Items, Target, Mid + 1, High)", "    ELSE", "        RETURN Find(Items, Target, Low, Mid - 1)", "    ENDIF", "ENDSUBROUTINE"];
  L["4.1.1.16"] = {
    archetypes: [
      { id: "cs.recursion-basics", title: "Recursion: what it is, the base case, recursion or iteration",
        match: "recursive subroutine|base case|recursion",
        rules: ["A recursive subroutine is one that calls itself (is defined in terms of itself).",
          "Base case: the condition under which it returns WITHOUT calling itself. General case: the call to itself, on a smaller problem that moves towards the base case.",
          "Recursion vs iteration: recursion can be shorter and clearer for naturally recursive problems (trees, divide and conquer); it uses a stack frame per call, so more memory, overhead and a risk of stack overflow.",
          "When a recursive call returns a value, the caller must USE that value."],
        traps: [{ sitting: "2022-06", q: "Q11", text: "In the programming task, recursive retries of an input often ignored the value the recursive call returned, which broke the program afterwards. If a recursive call returns something, return or store it." }],
        variations: [
          { v: "A", t: "What a recursive subroutine is", m: 1,
            q: "State what is meant by a recursive subroutine.",
            steps: [["A subroutine that calls itself (from within its own definition).", "MP1", "Calls itself"]] },
          { v: "B", t: "Identify the base case", m: 1,
            q: "State the base case of the subroutine `SumDigits` below.",
            code: SUMDIGITS,
            steps: [["When `N < 10`: it returns `N` without calling itself again.", "MP1", "The condition AND that there is no further call"]] },
          { v: "C", t: "Why a base case is needed", m: 2,
            q: "Explain why every recursive subroutine must have a base case, and why the general case must move towards it.",
            steps: [["The base case is where the subroutine returns without calling itself, so the recursion stops and the calls can return (unwind).", "MP1", "It ends the recursion"],
              ["If it is missing or never reached, the subroutine keeps calling itself, a stack frame is pushed for every call and the stack overflows.", "MP2", "What goes wrong without it"]] },
          { v: "D", t: "Recursion or iteration", m: 3,
            q: "A programmer could write a subroutine to traverse a binary tree either recursively or iteratively. Discuss one advantage of the recursive version and two disadvantages.",
            steps: [["Advantage: the recursive code is shorter and closer to the definition of the problem (each subtree is a smaller tree), so it is easier to write and check.", "MP1", "Natural fit for a recursive structure"],
              ["Disadvantage: each call pushes a stack frame, so it uses more memory than a loop.", "MP2", "Memory"],
              ["Disadvantage: a very deep tree could cause a stack overflow, and the call overhead makes it slower.", "MP3", "Overflow / speed"]] }
        ] },
      { id: "cs.recursion-tracing", title: "Trace or critique a recursive subroutine",
        match: "trace a recursive|fibonacci|inefficient",
        rules: ["Write the call stack as you go: one line per call with its arguments, indented, and the value it returns when it ends.",
          "Code BEFORE the recursive call runs on the way down; code AFTER it runs as the calls unwind, in reverse order.",
          "A returned value is passed back to the line of the caller that made the call, and that line then finishes its own calculation.",
          "Check the base case on EVERY call, including the one that reaches it with no work to do (e.g. Low > High).",
          "Naive double recursion (Fibonacci) repeats the same calls: count them, then say \"the same values are recalculated\"."],
        traps: [{ sitting: "2022-06", q: "Q04.5", text: "Very few earned all six marks for tracing a recursive traversal, although the first rows earned something. Keep the call stack written down beside the trace so you know where each call returns to." }],
        variations: [
          { v: "A", t: "Trace calls and returned values", m: 3,
            q: "Trace the call `SumDigits(4072)`, showing each call made and the value each call returns. State the final result.",
            code: SUMDIGITS,
            steps: [["Calls: SumDigits(4072) → SumDigits(407) → SumDigits(40) → SumDigits(4).", "MP1", "N DIV 10 each time"],
              ["SumDigits(4) is the base case and returns 4; SumDigits(40) returns 0 + 4 = 4; SumDigits(407) returns 7 + 4 = 11.", "MP2", "Returns, from the base case up"],
              ["SumDigits(4072) returns 2 + 11 = 13.", "MP3", "Final result"]] },
          { v: "B", t: "Output before and after the call", m: 3,
            q: "State the output when `Show(5)` is called, and explain the order of the last values output.",
            code: ["SUBROUTINE Show(N)", "    IF N > 0 THEN", "        OUTPUT N", "        Show(N - 2)", "        OUTPUT N * 10", "    ENDIF", "ENDSUBROUTINE"],
            steps: [["On the way down: 5, 3, 1 (Show(-1) outputs nothing).", "MP1", "Before the call"],
              ["Then 10, 30, 50, so the whole output is 5, 3, 1, 10, 30, 50.", "MP2", "After the call"],
              ["The second OUTPUT runs only as each call returns, so the most recent call (N = 1) finishes first: the calls unwind in reverse order.", "MP3", "Unwinding explained"]] },
          { v: "C", t: "Trace a recursive binary search", m: 4,
            try: [{ "grid": { "cols": ["Call", "Low", "High", "Mid", "Items[Mid]"], "rows": [["1", "0", "7", "3", "15"], ["2", "0", "2", "1", "8"], ["3", "2", "2", "2", "11"], ["4", "2", "1", "-", "-"]], "given": [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [0, 2], [3, 3], [3, 4]], "cap": "Call 4 has Low > High: it returns −1 before Mid is worked out." } }],
            q: "`Items` holds 3, 8, 11, 15, 19, 24, 30, 37 in elements 0 to 7. Trace the call `Find(Items, 9, 0, 7)`, giving `Low`, `High` and `Mid` for each call, and state the value finally returned.",
            code: FIND,
            steps: [["Call 1: Low 0, High 7, Mid 3; Items[3] = 15 > 9, so Find(Items, 9, 0, 2) is called.", "MP1", ""],
              ["Call 2: Low 0, High 2, Mid 1; Items[1] = 8 < 9, so Find(Items, 9, 2, 2) is called.", "MP2", ""],
              ["Call 3: Low 2, High 2, Mid 2; Items[2] = 11 > 9, so Find(Items, 9, 2, 1) is called.", "MP3", ""],
              ["Call 4: Low 2 > High 1, so it returns −1, which every earlier call returns unchanged: the final result is −1 (9 is not in the list).", "MP4", "The base case, then passed back up"]] },
          { v: "D", t: "Inefficient recursion", m: 2,
            q: "The function `Fib(N)` returns N if N ≤ 1 and `Fib(N - 1) + Fib(N - 2)` otherwise. State how many times `Fib` is called in total when `Fib(5)` is called, and explain why this recursive version is inefficient.",
            steps: [["15 calls in total (Fib(2) alone is called 3 times and Fib(1) 5 times).", "MP1", "Counted from the call tree"],
              ["The same values are recalculated many times, so the number of calls grows exponentially with N; storing results already found, or a loop, avoids it.", "MP2", "Repeated work"]] },
          { v: "E", t: "Trace a recursive graph traversal", m: 4,
            q: "A graph has these adjacency lists: A: B, C; B: A, D, E; C: A, F; D: B; E: B, F; F: C, E. Every node starts unvisited. For the call `Visit(\"A\")`, state (i) the order in which the nodes are output, (ii) which call is the first to return, and (iii) the calls on the stack when C is output.",
            code: ["SUBROUTINE Visit(Node)", "    Visited[Node] ← True", "    OUTPUT Node", "    FOR EACH Neighbour IN Adjacent[Node]", "        IF Visited[Neighbour] = False THEN", "            Visit(Neighbour)", "        ENDIF", "    ENDFOR", "ENDSUBROUTINE"],
            steps: [["(i) A, B, D first: from B the first unvisited neighbour is D.", "MP1", "The descent"],
              ["…then E, F, C: D has no unvisited neighbour, so the call returns to B, which carries on with E; E goes to F and F to C. Output A, B, D, E, F, C.", "MP2", "The rest of the order"],
              ["(ii) Visit(\"D\") is the first to return.", "MP3", "First unwinding"],
              ["(iii) Visit(\"A\"), Visit(\"B\"), Visit(\"E\"), Visit(\"F\"), Visit(\"C\"): five calls.", "MP4", "D's frame has already gone"]],
            trap: "D's call has already returned by the time C is visited: listing it on the stack loses the last mark." }
        ] }
    ],
    practice: [
      [1, 1, "State what is meant by the base case of a recursive subroutine.", ["The case in which the subroutine returns / ends without calling itself (1)"], { arch: "cs.recursion-basics" }],
      [1, 1, "Name the error that occurs when a recursive subroutine never reaches its base case.", ["Stack overflow (1)"], { arch: "cs.recursion-basics" }],
      [2, 3, "The function `Power(B, E)` returns 1 if E = 0 and `B * Power(B, E - 1)` otherwise. For the call `Power(2, 5)`, state how many times `Power` is called in total, the value returned by the base case and the final result.", ["6 calls (E = 5 down to 0) (1)", "The base case returns 1 (1)", "Final result 32 (1)"], { arch: "cs.recursion-tracing" }],
      [2, 2, "State the output when `Count(3)` is called, and explain why the values appear in that order.", ["1, 2, 3 (1)", "OUTPUT comes after the recursive call, so nothing is output until the base case is reached and the calls return / unwind (1)"], { arch: "cs.recursion-tracing", code: ["SUBROUTINE Count(N)", "    IF N > 0 THEN", "        Count(N - 1)", "        OUTPUT N", "    ENDIF", "ENDSUBROUTINE"] }],
      [3, 3, "Rewrite the recursive subroutine `SumDigits` below as an iterative subroutine with the same result for every N ≥ 0. Pseudo-code or C# is accepted.", ["A running total set to 0 (1)", "A loop while N > 0 adds N MOD 10 to the total (1)", "N ← N DIV 10 inside the loop and the total returned after it (1)"], { arch: "cs.recursion-basics", code: SUMDIGITS }],
      [3, 2, "Explain why a recursive subroutine may crash for a large input when an iterative version of it does not.", ["Every recursive call adds a stack frame that is not removed until the calls return (1)", "Deep recursion uses up the stack's memory (stack overflow); a loop reuses the same variables (1)"], { arch: "cs.recursion-basics" }],
      [3, 4, "Write a recursive function `Factorial(N)` for N ≥ 0, in pseudo-code or C#, where Factorial(0) = 1 and Factorial(N) = N × Factorial(N − 1).", ["A base case: when N = 0 (or N ≤ 1) (1)", "returns 1 without a recursive call (1)", "The general case calls Factorial(N − 1) (1)", "and returns N multiplied by the value the call returns (1)"], { arch: "cs.recursion-basics" }],
      [3, 2, "For the binary search `Find(Items, Target, Low, High)` on the list 3, 8, 11, 15, 19, 24, 30, 37 (elements 0 to 7), state the values of `Mid` in each call for `Find(Items, 30, 0, 7)` and the value returned.", ["Mid = 3, then 5, then 6 (1)", "Returns 6 (1)"], { arch: "cs.recursion-tracing", code: FIND }]
    ]
  };
})();
