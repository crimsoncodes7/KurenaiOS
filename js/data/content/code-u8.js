/* Kurenai OS — data/content/code-u8.js
   Code · Unit 8 · Interfaces and inheritance (roadmap 5.3), stage 3.

   On the FULL runtime like unit 7 (invariant 105): inheritance, virtual and
   override, abstract classes, interfaces with IComparable, records, structs
   and the stack and the heap, operator overloading, pattern matching, and
   building from parts. Nullable reference types stay on. Same contract as
   units 1–7 (docs/code-plan.md §4); every program agrees with .NET
   (tools/cs_diff.mjs, the full-runtime half).                            */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  function run(id, cap, src, o) {
    o = typeof o === "string" ? { stdin: o } : (o || {});
    var r = { id: id, cap: cap, src: src, stdin: o.stdin || "" };
    if (o.fails) r.fails = true;
    return { run: r };
  }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  function uses(re, msg, id) { return { id: id || "uses", test: function (s) { return re.test(s); }, msg: msg }; }

  K.add({ concepts: {
    "inheritance": { name: "Inheritance", lesson: "8.1", about: "a class built on another: is-a" },
    "base-ctor": { name: "Base constructors", lesson: "8.1", about: ": base(...) builds the inherited part first" },
    "virtual-override": { name: "virtual and override", lesson: "8.2", about: "a derived class replaces a method" },
    "abstract-class": { name: "Abstract classes", lesson: "8.3", about: "a base that cannot be created on its own" },
    "interfaces": { name: "Interfaces", lesson: "8.4", about: "what a type can do, not how" },
    "icomparable": { name: "IComparable", lesson: "8.4", about: "CompareTo makes a type sortable" },
    "iface-choice": { name: "Interface or abstract class", lesson: "8.5", about: "a capability or a shared base" },
    "polymorphism": { name: "Polymorphism", lesson: "8.6", about: "one call, the right method for each type" },
    "records": { name: "Records", lesson: "8.7", about: "data with value equality and with" },
    "value-reference": { name: "Value and reference types", lesson: "8.8", about: "copied or shared; the stack and the heap" },
    "structs": { name: "Structs", lesson: "8.8", about: "small value types" },
    "operators": { name: "Operator overloading", lesson: "8.9", about: "+, - and * on your own type" },
    "patterns": { name: "Pattern matching", lesson: "8.10", about: "is, switch and the shape of a value" },
    "has-a": { name: "Aggregation and composition", lesson: "8.11", about: "a part owned or a part borrowed" },
    "composition": { name: "Composition over inheritance", lesson: "8.12", about: "behaviour from parts" },
    "library-design": { name: "Designing a small library", lesson: "8.13", about: "an interface and its implementations" }
  } });

  /* ================================================================
     8.1 Inheritance
     ================================================================ */
  lesson("8.1", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A `Dog` and a `Cat` both have a name, an age and a way to describe themselves. Writing that twice means fixing every bug twice.",
        "**Inheritance** lets a class start from another one: `class Dog : Animal` gets everything `Animal` has, then adds its own.",
        "It models an **is-a** relation: a dog *is an* animal, so a `Dog` can go anywhere an `Animal` is expected."
      ] },
      page("Core idea"),
      run("first", "Dog inherits Name and Describe from Animal", 'var d = new Dog("Rex");\nConsole.WriteLine(d.Describe());\nConsole.WriteLine(d.Fetch());\n\nclass Animal\n{\n    public string Name { get; }\n    public Animal(string name) => Name = name;\n    public string Describe() => $"{Name} is an animal";\n}\n\nclass Dog : Animal\n{\n    public Dog(string name) : base(name) { }\n    public string Fetch() => $"{Name} fetches the ball";\n}'),
      { ul: [
        "`class Dog : Animal` — Animal is the **base** class, Dog the **derived** class.",
        "Dog never declares `Name` or `Describe`, yet has both.",
        "`: base(name)` runs Animal's constructor first, so the inherited part starts valid too."
      ] },
      run("isa", "a Dog can stand where an Animal is expected", 'Animal a = new Dog("Rex");\nConsole.WriteLine(a.Describe());\nConsole.WriteLine(a is Dog);\nConsole.WriteLine(a is Animal);\n\nclass Animal\n{\n    public string Name { get; }\n    public Animal(string name) => Name = name;\n    public string Describe() => $"{Name} is an animal";\n}\n\nclass Dog : Animal\n{\n    public Dog(string name) : base(name) { }\n}'),
      page("Rules"),
      { ul: [
        "A class has exactly **one** base class. With none written, it is `object`.",
        "The derived class inherits every public and protected member; private members exist inside the object but only the base class's code can touch them.",
        "Constructors are not inherited. A derived constructor calls one with `: base(...)`; with nothing written it calls the base's parameterless one.",
        "Construction runs base first, then derived; that way a derived constructor can rely on the base part.",
        "`protected` means: this class and classes derived from it.",
        "`sealed class T` cannot be inherited from."
      ] },
      { table: { head: ["Access", "Inside the class", "Derived classes", "Everyone else"], rows: [["private", "✓", "—", "—"], ["protected", "✓", "✓", "—"], ["public", "✓", "✓", "✓"]] } },
      page("Variations"),
      { h: "Base first, then derived" },
      run("order", "constructors run from the top of the family down", 'var p = new Puppy();\n\nclass Animal { public Animal() => Console.WriteLine("Animal built"); }\nclass Dog : Animal { public Dog() => Console.WriteLine("Dog built"); }\nclass Puppy : Dog { public Puppy() => Console.WriteLine("Puppy built"); }'),
      { h: "protected: shared with the family only" },
      run("protected", "a derived class reads a protected field", 'var s = new Savings(100m);\ns.AddInterest();\nConsole.WriteLine(s.Show());\n\nclass Account\n{\n    protected decimal balance;\n    public Account(decimal b) => balance = b;\n    public string Show() => $"{balance:F2}";\n}\n\nclass Savings : Account\n{\n    public Savings(decimal b) : base(b) { }\n    public void AddInterest() => balance *= 1.05m;\n}'),
      { h: "Everything is an object" },
      run("object", "even without a base, a class inherits from object", 'var d = new Dog();\nobject o = d;\nConsole.WriteLine(o.ToString());\nConsole.WriteLine(o.GetType().Name);\nConsole.WriteLine(d.Equals(o));\n\nclass Dog { }'),
      page("Pitfalls"),
      { h: "Forgetting : base(...) — CS7036" },
      run("pit-base", "Animal has no empty constructor to call", 'var d = new Dog("Rex");\n\nclass Animal\n{\n    public string Name { get; }\n    public Animal(string name) => Name = name;\n}\n\nclass Dog : Animal\n{\n    public Dog(string name) { }\n}'),
      { h: "Private means private, even to children — CS0122" },
      run("pit-private", "Savings cannot touch Account's private field", 'var s = new Savings();\n\nclass Account { private decimal balance; }\n\nclass Savings : Account\n{\n    public void Add() => balance += 1;\n}'),
      { h: "Inheriting from a sealed class — CS0509" },
      run("pit-sealed", "string is sealed, like many library types", 'Console.WriteLine(new Name());\n\nclass Name : string { }'),
      page("Connections"),
      { ul: [ "**Back:** 7.2 constructors and 7.3 properties — the base class is just a class.", "**Next:** 8.2 lets the derived class change a method; 8.12 asks when not to inherit at all.", "**AQA:** 4.1.2.3 inheritance, and drawing it in a class diagram (an open arrow from derived to base)." ] },
      page("Good practice"),
      { ul: [ "Inherit only for a true is-a: a `Square` is a `Shape`, but a `Car` is not an `Engine`.", "Keep hierarchies shallow: one or two levels.", "Prefer `protected` properties over `protected` fields, so the base keeps its rules." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Wheels* and *Staff and managers*." ] },
      page("Quick reference"),
      run("qr", "inheritance at a glance", 'Shape s = new Square(3);\nConsole.WriteLine($"{s.Name} {((Square)s).Side}");\n\nclass Shape\n{\n    public string Name { get; }\n    protected Shape(string name) => Name = name;\n}\n\nclass Square : Shape\n{\n    public int Side { get; }\n    public Square(int side) : base("square") => Side = side;\n}'),
      { ul: [ "`class D : B` — one base class.", "`public D(...) : base(...)` — base constructor first.", "`protected` — the family; `sealed` — no children." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS7036", "the base constructor needs arguments", "Pitfalls"], ["CS0122", "a private member of the base", "Pitfalls"], ["CS0509", "the base class is sealed", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var c = new Cat("Tom");\nConsole.WriteLine(c.Describe() + " " + c.Lives);\n\nclass Animal\n{\n    public string Name { get; }\n    public Animal(string n) => Name = n;\n    public string Describe() => Name.ToUpper();\n}\n\nclass Cat : Animal\n{\n    public int Lives { get; } = 9;\n    public Cat(string n) : base(n) { }\n}', why: "Describe comes from Animal (TOM); Lives from Cat.", concepts: ["inheritance"] },
        { id: "p2", src: 'new C();\n\nclass A { public A() => Console.Write("A"); }\nclass B : A { public B() => Console.Write("B"); }\nclass C : B { public C() => Console.WriteLine("C"); }', why: "Base constructors run first: A, then B, then C.", concepts: ["base-ctor"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Bike passes 2 wheels to Vehicle's constructor.", src: 'var b = new Bike();\nConsole.WriteLine(b.Wheels);\n\nclass Vehicle\n{\n    public int Wheels { get; }\n    public Vehicle(int w) => Wheels = w;\n}\n\nclass Bike : Vehicle\n{\n    public Bike() : @@ { }\n}', out: "2", concepts: ["base-ctor"] }
      ],
      bug: [
        { id: "b1", q: "A Robot should be named by Machine's constructor: it should print R2.", src: 'var r = new Robot("R2");\nConsole.WriteLine(r.Name);\n\nclass Machine\n{\n    public string Name { get; protected set; } = "";\n    public Machine() { }\n    public Machine(string name) => Name = name;\n}\n\nclass Robot : Machine\n{\n    public Robot(string name) { }\n}', out: "R2", fixedText: "prints R2", why: "With no `: base(name)` the empty base constructor ran, so the name was never stored.", concepts: ["base-ctor"] }
      ]
    },
    flashcards: [
      ["What does `class Dog : Animal` mean?", "Dog inherits from Animal: it gets Animal's members and may add its own."],
      ["How many base classes can a C# class have?", "One. With none written, it is object."],
      ["Are constructors inherited?", "No. A derived constructor calls one with `: base(...)`."],
      ["Which constructor runs first?", "The base class's, then the derived class's."],
      ["What does protected mean?", "Visible to the class and the classes derived from it."],
      ["What relation should inheritance model?", "is-a: a Dog is an Animal."]
    ],
    quiz: [
      { q: "`Animal a = new Dog(\"Rex\");` is…", opts: ["a compile error", "fine: a Dog is an Animal", "fine only with a cast", "a runtime error"], ans: 1, why: "A derived object can be used wherever its base type is expected." },
      { q: "A derived class can read the base's…", opts: ["private fields", "public and protected members", "only public members", "nothing"], ans: 1, why: "private stays inside the base class's own code." },
      { q: "Which is a good use of inheritance?", opts: ["Car : Engine", "Square : Shape", "Order : List", "Student : Database"], ans: 1, why: "A square is a shape; a car has an engine." }
    ]
  });
  K.add({ tasks: {
    "8.1-wheels": { lesson: "8.1", title: "Wheels", tier: "warm-up", minutes: 10, concepts: ["inheritance", "base-ctor"],
      statement: ["Write a base class `Vehicle` whose constructor takes the number of wheels (a get-only `Wheels`), and derived classes `Bike` (2) and `Car` (4) that pass it with `: base(...)`.", "Read one line of words `bike` and `car` separated by spaces. Print the total number of wheels."],
      starter: 'string[] words = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\n\nclass Vehicle\n{\n}',
      examples: [{ stdin: "bike car car", out: "10" }],
      hidden: [{ stdin: "", out: "0" }, { stdin: "bike bike bike", out: "6" }],
      rules: [uses(/class\s+Bike\s*:\s*Vehicle/, "Bike inherits from Vehicle."), uses(/class\s+Car\s*:\s*Vehicle/, "Car inherits from Vehicle.", "car"), uses(/:\s*base\s*\(/, "Pass the wheels with : base(...).", "base")],
      hints: ["class Vehicle { public int Wheels { get; } public Vehicle(int w) => Wheels = w; }", "class Bike : Vehicle { public Bike() : base(2) { } }", "Vehicle v = w == \"bike\" ? new Bike() : new Car(); total += v.Wheels;"],
      answer: 'string[] words = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nint total = 0;\nforeach (string w in words)\n{\n    Vehicle v = w == "bike" ? new Bike() : new Car();\n    total += v.Wheels;\n}\nConsole.WriteLine(total);\n\nclass Vehicle\n{\n    public int Wheels { get; }\n    public Vehicle(int wheels) => Wheels = wheels;\n}\n\nclass Bike : Vehicle\n{\n    public Bike() : base(2) { }\n}\n\nclass Car : Vehicle\n{\n    public Car() : base(4) { }\n}' },
    "8.1-staff": { lesson: "8.1", title: "Staff and managers", tier: "core", minutes: 20, concepts: ["inheritance", "base-ctor"],
      statement: ["Write `Employee` (a `Name` and a `Salary`, set by its constructor) and `Manager : Employee`, which adds a `Bonus`. Both have a `Pay()` method: an employee's pay is the salary; a manager's is salary plus bonus — write Manager's as a new method `TotalPay()` and keep `Pay()` from the base.", "Read lines `e NAME SALARY` or `m NAME SALARY BONUS` until the end. Print `NAME PAY` for each (a manager's PAY is the total), then `total T`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "e Ada 30000\nm Kai 40000 5000", out: "Ada 30000\nKai 45000\ntotal 75000" }],
      hidden: [{ stdin: "", out: "total 0" }, { stdin: "m Lin 50000 0\ne Sam 1", out: "Lin 50000\nSam 1\ntotal 50001" }],
      rules: [uses(/class\s+Manager\s*:\s*Employee/, "Manager inherits from Employee."), uses(/:\s*base\s*\(/, "Manager's constructor calls : base(...).", "base")],
      hints: ["class Employee { public string Name { get; } public int Salary { get; } public Employee(string n, int s) { Name = n; Salary = s; } public int Pay() => Salary; }", "class Manager : Employee { public int Bonus { get; } public Manager(string n, int s, int b) : base(n, s) => Bonus = b; public int TotalPay() => Pay() + Bonus; }", "int pay = p[0] == \"m\" ? new Manager(…).TotalPay() : new Employee(…).Pay();"],
      answer: 'int total = 0;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    int pay;\n    if (p[0] == "m")\n    {\n        var m = new Manager(p[1], int.Parse(p[2]), int.Parse(p[3]));\n        pay = m.TotalPay();\n    }\n    else pay = new Employee(p[1], int.Parse(p[2])).Pay();\n    Console.WriteLine($"{p[1]} {pay}");\n    total += pay;\n}\nConsole.WriteLine($"total {total}");\n\nclass Employee\n{\n    public string Name { get; }\n    public int Salary { get; }\n    public Employee(string name, int salary) { Name = name; Salary = salary; }\n    public int Pay() => Salary;\n}\n\nclass Manager : Employee\n{\n    public int Bonus { get; }\n    public Manager(string name, int salary, int bonus) : base(name, salary) => Bonus = bonus;\n    public int TotalPay() => Pay() + Bonus;\n}' }
  } });

  /* ================================================================
     8.2 virtual and override
     ================================================================ */
  lesson("8.2", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Every animal can speak, but a dog says Woof and a cat says Miaow.",
        "Inheritance alone gives every derived class the **same** method. 8.1's Manager had to invent `TotalPay()` because it could not change `Pay()`.",
        "A **virtual** method is one the base class allows a derived class to **override**: same name, same signature, new body. The object's real type decides which body runs."
      ] },
      page("Core idea"),
      run("speak", "each animal answers Speak in its own way", 'Animal[] zoo = { new Dog(), new Cat(), new Animal() };\nforeach (Animal a in zoo)\n    Console.WriteLine(a.Speak());\n\nclass Animal\n{\n    public virtual string Speak() => "...";\n}\n\nclass Dog : Animal\n{\n    public override string Speak() => "Woof";\n}\n\nclass Cat : Animal\n{\n    public override string Speak() => "Miaow";\n}'),
      { ul: [
        "`virtual` in the base: \"derived classes may replace this\".",
        "`override` in the derived class: \"this replaces it\".",
        "The array's type is `Animal[]`, yet each element runs its own `Speak` — the decision is made while the program runs, from the object, not the variable."
      ] },
      run("base", "base.Method() runs the version being replaced", 'var m = new Manager("Kai", 40000, 5000);\nConsole.WriteLine(m.Pay());\nConsole.WriteLine(m.Describe());\n\nclass Employee\n{\n    public string Name { get; }\n    public int Salary { get; }\n    public Employee(string n, int s) { Name = n; Salary = s; }\n    public virtual int Pay() => Salary;\n    public virtual string Describe() => $"{Name} earns {Pay()}";\n}\n\nclass Manager : Employee\n{\n    public int Bonus { get; }\n    public Manager(string n, int s, int b) : base(n, s) => Bonus = b;\n    public override int Pay() => base.Pay() + Bonus;\n    public override string Describe() => base.Describe() + " (manager)";\n}'),
      page("Rules"),
      { ul: [
        "Only a `virtual`, `abstract` (8.3) or `override` method can be overridden.",
        "An override keeps the exact name, parameters and return type, and the same access.",
        "`base.M()` inside an override calls the base version: extend instead of rewrite.",
        "Which body runs is decided by the object's **runtime type** — this is called dynamic dispatch.",
        "`sealed override` stops classes further down from overriding again.",
        "`ToString`, `Equals` and `GetHashCode` are virtual on `object`, so every class may override them."
      ] },
      page("Variations"),
      { h: "Overriding ToString" },
      run("tostring", "printing an object calls its ToString", 'var p = new Point(3, 4);\nConsole.WriteLine(p);\nConsole.WriteLine($"at {p}");\n\nclass Point\n{\n    public int X { get; }\n    public int Y { get; }\n    public Point(int x, int y) { X = x; Y = y; }\n    public override string ToString() => $"({X}, {Y})";\n}'),
      { h: "new hides — it does not override" },
      run("hide", "through a base variable, a hidden method is skipped", 'Animal a = new Dog();\nDog d = new Dog();\nConsole.WriteLine(a.Speak());\nConsole.WriteLine(d.Speak());\nConsole.WriteLine(a.Move());\n\nclass Animal\n{\n    public string Speak() => "...";\n    public virtual string Move() => "walks";\n}\n\nclass Dog : Animal\n{\n    public new string Speak() => "Woof";\n    public override string Move() => "runs";\n}'),
      { ul: [ "`new` declares an unrelated method that happens to share the name. Which one runs depends on the **variable's** type — almost never what you want." ] },
      { h: "sealed override" },
      run("sealed", "Puppy cannot change Speak again", 'Animal a = new Puppy();\nConsole.WriteLine(a.Speak());\n\nclass Animal { public virtual string Speak() => "..."; }\nclass Dog : Animal { public sealed override string Speak() => "Woof"; }\nclass Puppy : Dog { }'),
      page("Pitfalls"),
      { h: "Overriding a method that is not virtual — CS0506" },
      run("pit-nonvirtual", "Speak in Animal is not virtual", 'Console.WriteLine(new Dog().Speak());\n\nclass Animal { public string Speak() => "..."; }\nclass Dog : Animal { public override string Speak() => "Woof"; }'),
      { h: "A different signature is not an override — CS0115" },
      run("pit-sig", "Speak(int) does not match Speak()", 'Console.WriteLine(new Dog().Speak());\n\nclass Animal { public virtual string Speak() => "..."; }\nclass Dog : Animal { public override string Speak(int times) => "Woof"; }'),
      { h: "Forgetting override: a warning, then the wrong method" },
      run("pit-forgot", "CS0114 warns; through Animal the old Speak runs", 'Animal a = new Dog();\nConsole.WriteLine(a.Speak());\n\nclass Animal { public virtual string Speak() => "..."; }\nclass Dog : Animal { public string Speak() => "Woof"; }'),
      page("Connections"),
      { ul: [ "**Back:** 8.1 inheritance; 3.x overloads (same name, different parameters — chosen at compile time).", "**Next:** 8.3 abstract methods have no body at all; 8.6 builds whole programs on dispatch.", "**AQA:** 4.1.2.3 overriding and polymorphism." ] },
      page("Good practice"),
      { ul: [ "Mark a method virtual only when a derived class genuinely needs to change it.", "Call `base.M()` when the derived class adds to the behaviour rather than replacing it.", "Treat the CS0114 warning as an error: write `override` or rename." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Instruments* and *Overtime*." ] },
      page("Quick reference"),
      run("qr", "virtual, override, base", 'Base b = new Derived();\nConsole.WriteLine(b.Name());\n\nclass Base { public virtual string Name() => "base"; }\nclass Derived : Base { public override string Name() => "derived after " + base.Name(); }'),
      { ul: [ "`public virtual T M()` in the base; `public override T M()` in the derived class.", "`base.M()` — the replaced version.", "Runtime type decides; `new` only hides." ] },
      { table: { head: ["Code", "Means", "Page"], rows: [["CS0506", "the base method is not virtual", "Pitfalls"], ["CS0115", "no method with this signature to override", "Pitfalls"], ["CS0114 (warning)", "hides a virtual method — add override", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Shape s = new Circle();\nConsole.WriteLine(s.Name() + " " + s.Sides());\n\nclass Shape\n{\n    public virtual string Name() => "shape";\n    public int Sides() => 0;\n}\n\nclass Circle : Shape\n{\n    public override string Name() => "circle";\n    public new int Sides() => 1;\n}', why: "Name is overridden (circle); Sides is only hidden, and s is a Shape variable, so 0.", concepts: ["virtual-override"] },
        { id: "p2", src: 'var t = new Loud();\nConsole.WriteLine(t.Say());\n\nclass Talker { public virtual string Say() => "hi"; }\nclass Loud : Talker { public override string Say() => base.Say().ToUpper() + "!"; }', why: "base.Say() is \"hi\"; upper-cased with ! appended.", concepts: ["virtual-override"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Bell replaces Instrument's Play.", src: 'Instrument i = new Bell();\nConsole.WriteLine(i.Play());\n\nclass Instrument { public virtual string Play() => "..."; }\nclass Bell : Instrument { public @@ string Play() => "ding"; }', out: "ding", concepts: ["virtual-override"] }
      ],
      bug: [
        { id: "b1", q: "Through an Animal variable a Cow should say Moo.", src: 'Animal a = new Cow();\nConsole.WriteLine(a.Speak());\n\nclass Animal { public virtual string Speak() => "..."; }\nclass Cow : Animal { public new string Speak() => "Moo"; }', out: "Moo", fixedText: "prints Moo", why: "`new` hides instead of overriding; write `override`.", concepts: ["virtual-override"] }
      ]
    },
    flashcards: [
      ["What does virtual allow?", "A derived class may override the method."],
      ["What decides which override runs?", "The object's runtime type, not the variable's type."],
      ["How does an override call the version it replaces?", "`base.Method()`."],
      ["Override or new?", "override replaces for every caller; new only hides, and a base variable still calls the old one."],
      ["Which object methods are virtual?", "ToString, Equals and GetHashCode."],
      ["What does sealed override do?", "Stops further overriding further down the hierarchy."]
    ],
    quiz: [
      { q: "`Animal a = new Dog(); a.Speak();` with Speak virtual and overridden in Dog runs…", opts: ["Animal's Speak", "Dog's Speak", "both", "a compile error"], ans: 1, why: "Dynamic dispatch uses the object's type." },
      { q: "An override must keep…", opts: ["only the name", "the name, parameters and return type", "only the return type", "nothing in particular"], ans: 1, why: "A different signature is a different method (CS0115)." },
      { q: "`public new string Speak()` in a derived class…", opts: ["overrides Speak", "hides Speak; a base variable still calls the old one", "is a compile error", "deletes Speak"], ans: 1, why: "new hides; only override replaces." }
    ]
  });
  K.add({ tasks: {
    "8.2-sound": { lesson: "8.2", title: "Instruments", tier: "warm-up", minutes: 10, concepts: ["virtual-override"],
      statement: ["Write `Instrument` with a virtual `Play()` returning `...`, and `Drum` (`boom`) and `Bell` (`ding`) that override it.", "Read one line of instrument names. Keep them in a `List<Instrument>` (any word other than drum or bell is a plain Instrument), then print each one's `Play()` on its own line."],
      starter: 'string[] names = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\n',
      examples: [{ stdin: "drum bell kazoo", out: "boom\nding\n..." }],
      hidden: [{ stdin: "bell bell", out: "ding\nding" }, { stdin: "", out: "" }],
      rules: [uses(/virtual\s+string\s+Play/, "Make Play virtual in Instrument."), uses(/override\s+string\s+Play/, "Override Play.", "over"), uses(/List<\s*Instrument\s*>/, "Keep them in a List<Instrument>.", "list")],
      hints: ["class Instrument { public virtual string Play() => \"...\"; }", "class Drum : Instrument { public override string Play() => \"boom\"; }", "list.Add(n == \"drum\" ? new Drum() : n == \"bell\" ? new Bell() : new Instrument());"],
      answer: 'string[] names = (Console.ReadLine() ?? "").Split(\' \', StringSplitOptions.RemoveEmptyEntries);\nvar band = new List<Instrument>();\nforeach (string n in names)\n    band.Add(n == "drum" ? new Drum() : n == "bell" ? new Bell() : new Instrument());\nforeach (Instrument i in band)\n    Console.WriteLine(i.Play());\n\nclass Instrument { public virtual string Play() => "..."; }\nclass Drum : Instrument { public override string Play() => "boom"; }\nclass Bell : Instrument { public override string Play() => "ding"; }' },
    "8.2-pay": { lesson: "8.2", title: "Overtime", tier: "core", minutes: 20, concepts: ["virtual-override", "base-ctor"],
      statement: ["Write `Worker` with a `Name`, an hourly `Rate` and a virtual `Pay(int hours)` = hours × rate.", "Write `ShiftWorker : Worker` that overrides `Pay`: the first 40 hours as normal (call `base.Pay`), each hour past 40 at 1.5 × the rate.", "Read lines `w NAME RATE HOURS` or `s NAME RATE HOURS` (decimals allowed in RATE). Print `NAME PAY` with 2 decimals."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "w Ada 10 45\ns Kai 10 45", out: "Ada 450.00\nKai 475.00" }],
      hidden: [{ stdin: "s Lin 12.5 40", out: "Lin 500.00" }, { stdin: "s Sam 8 50\nw Bo 9 0", out: "Sam 440.00\nBo 0.00" }],
      rules: [uses(/virtual\s+decimal\s+Pay/, "Make Pay virtual (decimal)."), uses(/override\s+decimal\s+Pay/, "Override Pay in ShiftWorker.", "over"), uses(/base\.Pay\s*\(/, "Call base.Pay for the first 40 hours.", "base")],
      hints: ["public virtual decimal Pay(int hours) => hours * Rate;", "public override decimal Pay(int hours) => hours <= 40 ? base.Pay(hours) : base.Pay(40) + (hours - 40) * Rate * 1.5m;", "Worker w = p[0] == \"s\" ? new ShiftWorker(…) : new Worker(…); Console.WriteLine($\"{w.Name} {w.Pay(h):F2}\");"],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    decimal rate = decimal.Parse(p[2]);\n    Worker w = p[0] == "s" ? new ShiftWorker(p[1], rate) : new Worker(p[1], rate);\n    Console.WriteLine($"{w.Name} {w.Pay(int.Parse(p[3])):F2}");\n}\n\nclass Worker\n{\n    public string Name { get; }\n    public decimal Rate { get; }\n    public Worker(string name, decimal rate) { Name = name; Rate = rate; }\n    public virtual decimal Pay(int hours) => hours * Rate;\n}\n\nclass ShiftWorker : Worker\n{\n    public ShiftWorker(string name, decimal rate) : base(name, rate) { }\n    public override decimal Pay(int hours) =>\n        hours <= 40 ? base.Pay(hours) : base.Pay(40) + (hours - 40) * Rate * 1.5m;\n}' }
  } });

  /* ================================================================
     8.3 Abstract classes
     ================================================================ */
  lesson("8.3", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "8.2's `Animal.Speak()` returned \"...\" — a made-up answer, because there is no such thing as a plain animal.",
        "Some base classes are only ideas: every shape has an area, but you cannot work out the area of \"a shape\".",
        "An **abstract class** cannot be created with `new`. It can declare **abstract** methods with no body, and every concrete class derived from it **must** supply them."
      ] },
      page("Core idea"),
      run("shape", "Area is promised by Shape and written by each shape", 'Shape[] all = { new Circle(1), new Square(2) };\nforeach (Shape s in all)\n    Console.WriteLine(s.Describe());\n\nabstract class Shape\n{\n    public abstract string Name { get; }\n    public abstract double Area();\n    public string Describe() => $"{Name}: {Area():F2}";\n}\n\nclass Circle : Shape\n{\n    private readonly double r;\n    public Circle(double r) => this.r = r;\n    public override string Name => "circle";\n    public override double Area() => Math.PI * r * r;\n}\n\nclass Square : Shape\n{\n    private readonly double side;\n    public Square(double side) => this.side = side;\n    public override string Name => "square";\n    public override double Area() => side * side;\n}'),
      { ul: [
        "`abstract double Area();` — a signature with `;` instead of a body.",
        "`Describe()` is ordinary code in the abstract class, written once and shared, and it may call the abstract `Area()`.",
        "Abstract members are implicitly virtual: the derived class writes `override`."
      ] },
      run("ctor", "an abstract class can still have fields and a constructor", 'Pet p = new Dog("Rex");\nConsole.WriteLine(p.Intro());\n\nabstract class Pet\n{\n    public string Name { get; }\n    protected Pet(string name) => Name = name;\n    public abstract string Sound();\n    public string Intro() => $"{Name} says {Sound()}";\n}\n\nclass Dog : Pet\n{\n    public Dog(string name) : base(name) { }\n    public override string Sound() => "Woof";\n}'),
      page("Rules"),
      { ul: [
        "`abstract class T` cannot be instantiated; a variable of type T can still hold any derived object.",
        "An abstract member has no body and is implicitly virtual.",
        "A non-abstract (concrete) derived class must override every abstract member it inherits.",
        "A derived class that does not implement them must itself be declared abstract.",
        "An abstract class may hold fields, constructors (make them `protected`), and ordinary methods.",
        "Only an abstract class may declare abstract members."
      ] },
      page("Variations"),
      { h: "The template method" },
      run("template", "the base fixes the steps; each kind fills one in", 'Drink[] order = { new Tea(), new Coffee() };\nforeach (Drink d in order) d.Make();\n\nabstract class Drink\n{\n    public void Make()\n    {\n        Console.WriteLine("boil water");\n        Console.WriteLine(Brew());\n        Console.WriteLine("pour");\n    }\n    protected abstract string Brew();\n}\n\nclass Tea : Drink { protected override string Brew() => "steep the tea"; }\nclass Coffee : Drink { protected override string Brew() => "drip the coffee"; }'),
      { h: "abstract and virtual together" },
      run("hooks", "an optional step has a default; a required one does not", 'Report r = new Sales();\nConsole.WriteLine(r.Print());\n\nabstract class Report\n{\n    public string Print() => Header() + "\\n" + Body();\n    protected virtual string Header() => "== Report ==";\n    protected abstract string Body();\n}\n\nclass Sales : Report\n{\n    protected override string Body() => "12 orders";\n}'),
      { h: "An abstract middle class" },
      run("middle", "Polygon adds Sides but still leaves Area abstract", 'Shape s = new Triangle(3, 4);\nConsole.WriteLine($"{s.Area()} {((Polygon)s).Sides}");\n\nabstract class Shape { public abstract double Area(); }\nabstract class Polygon : Shape { public abstract int Sides { get; } }\nclass Triangle : Polygon\n{\n    private readonly double b, h;\n    public Triangle(double b, double h) { this.b = b; this.h = h; }\n    public override int Sides => 3;\n    public override double Area() => b * h / 2;\n}'),
      page("Pitfalls"),
      { h: "new on an abstract class — CS0144" },
      run("pit-new", "there is no plain Shape to make", 'var s = new Shape();\n\nabstract class Shape { public abstract double Area(); }'),
      { h: "Forgetting to implement — CS0534" },
      run("pit-missing", "Square promises Area but never writes it", 'Shape s = new Square();\nConsole.WriteLine(s.Area());\n\nabstract class Shape { public abstract double Area(); }\nclass Square : Shape { }'),
      { h: "A body on an abstract method — CS0500" },
      run("pit-body", "abstract means no body", 'Console.WriteLine("shapes");\n\nabstract class Shape\n{\n    public abstract double Area() { return 0; }\n}'),
      page("Connections"),
      { ul: [ "**Back:** 8.2 virtual and override — abstract is virtual with no default.", "**Next:** 8.4 interfaces go further: no fields, no code, any class may sign up.", "**AQA:** 4.1.2.3 abstract methods and classes; in a class diagram the name is written in italics." ] },
      page("Good practice"),
      { ul: [ "Make a base abstract whenever a plain instance would be meaningless.", "Put the shared steps in the abstract class and leave only the varying step abstract (the template method).", "Give abstract classes `protected` constructors: only derived classes call them." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Area and perimeter* and *A drinks machine*." ] },
      page("Quick reference"),
      run("qr", "abstract at a glance", 'Unit u = new Metre();\nConsole.WriteLine(u.Show(2.5));\n\nabstract class Unit\n{\n    public abstract string Symbol { get; }\n    public string Show(double v) => $"{v} {Symbol}";\n}\n\nclass Metre : Unit { public override string Symbol => "m"; }'),
      { ul: [ "`abstract class T` — no `new T()`.", "`public abstract R M();` — no body; derived classes `override`.", "Ordinary members are shared as usual." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0144", "an abstract class cannot be created", "Pitfalls"], ["CS0534", "an abstract member is not implemented", "Pitfalls"], ["CS0500", "an abstract member cannot have a body", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Greeter g = new Polite();\nConsole.WriteLine(g.Greet("Ada"));\n\nabstract class Greeter\n{\n    public string Greet(string n) => Open() + ", " + n + Close();\n    protected abstract string Open();\n    protected virtual string Close() => ".";\n}\n\nclass Polite : Greeter { protected override string Open() => "Good morning"; }', why: "Open comes from Polite; Close keeps its default \".\".", concepts: ["abstract-class"] },
        { id: "p2", src: 'Shape[] s = { new Sq(2), new Sq(3) };\ndouble t = 0;\nforeach (var x in s) t += x.Area();\nConsole.WriteLine(t);\n\nabstract class Shape { public abstract double Area(); }\nclass Sq : Shape { private readonly double a; public Sq(double a) => this.a = a; public override double Area() => a * a; }', why: "4 + 9 = 13.", concepts: ["abstract-class"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Shape cannot be created on its own.", src: 'Shape s = new Dot();\nConsole.WriteLine(s.Area());\n\n@@ class Shape { public abstract double Area(); }\nclass Dot : Shape { public override double Area() => 0; }', out: "0", concepts: ["abstract-class"] }
      ],
      bug: [
        { id: "b1", q: "A Cat should introduce itself as `Tom says Miaow`.", src: 'Pet p = new Cat("Tom");\nConsole.WriteLine(p.Intro());\n\nabstract class Pet\n{\n    public string Name { get; }\n    protected Pet(string n) => Name = n;\n    public virtual string Sound() => "...";\n    public string Intro() => $"{Name} says {Sound()}";\n}\n\nclass Cat : Pet\n{\n    public Cat(string n) : base(n) { }\n    public string Sound() => "Miaow";\n}', out: "Tom says Miaow", fixedText: "prints Tom says Miaow", why: "Cat's Sound hides instead of overriding; write `public override string Sound()` (better: make the base Sound abstract).", concepts: ["abstract-class", "virtual-override"] }
      ]
    },
    flashcards: [
      ["Can you write `new Shape()` when Shape is abstract?", "No — CS0144. Only derived, concrete classes can be created."],
      ["What does an abstract method look like?", "A signature ending in `;`, no body: `public abstract double Area();`"],
      ["What must a concrete derived class do?", "Override every abstract member it inherits."],
      ["Can an abstract class have fields and constructors?", "Yes — and ordinary methods that call the abstract ones."],
      ["What is the template method pattern?", "The base fixes the steps in one method; derived classes supply the abstract steps."],
      ["Abstract or virtual?", "abstract: no default, must override. virtual: a default that may be overridden."]
    ],
    quiz: [
      { q: "Why make Shape abstract?", opts: ["to make it faster", "a plain shape has no meaningful area", "so it can have fields", "so it cannot be inherited"], ans: 1, why: "Abstract marks a base that is only an idea." },
      { q: "A class derived from an abstract class that does not implement its abstract method must be…", opts: ["sealed", "abstract", "static", "public"], ans: 1, why: "Otherwise CS0534." },
      { q: "`Shape s = new Circle(1);` with Shape abstract is…", opts: ["an error", "fine", "fine only with a cast", "a warning"], ans: 1, why: "A variable of an abstract type can hold a concrete derived object." }
    ]
  });
  K.add({ tasks: {
    "8.3-shapes": { lesson: "8.3", title: "Area and perimeter", tier: "core", minutes: 20, concepts: ["abstract-class"],
      statement: ["Write an abstract class `Shape` with abstract `Area()` and `Perimeter()` and an ordinary `Line()` that returns `area A, perimeter P` (2 decimals).", "Write `Rect` and `Circle` (π × r², 2πr). Read lines `r W H` or `c R` until the end and print each shape's `Line()`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "r 3 4\nc 1", out: "area 12.00, perimeter 14.00\narea 3.14, perimeter 6.28" }],
      hidden: [{ stdin: "c 2.5", out: "area 19.63, perimeter 15.71" }, { stdin: "r 1 1\nr 0.5 2", out: "area 1.00, perimeter 4.00\narea 1.00, perimeter 5.00" }],
      rules: [uses(/abstract\s+class\s+Shape/, "Make Shape abstract."), uses(/abstract\s+double\s+Area/, "Declare Area abstract.", "area"), uses(/override\s+double\s+Perimeter/, "Override Perimeter in each shape.", "per")],
      hints: ["abstract class Shape { public abstract double Area(); public abstract double Perimeter(); public string Line() => $\"area {Area():F2}, perimeter {Perimeter():F2}\"; }", "class Circle : Shape { … public override double Area() => Math.PI * r * r; … }", "Shape s = p[0] == \"r\" ? new Rect(double.Parse(p[1]), double.Parse(p[2])) : new Circle(double.Parse(p[1]));"],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    Shape s = p[0] == "r" ? new Rect(double.Parse(p[1]), double.Parse(p[2])) : new Circle(double.Parse(p[1]));\n    Console.WriteLine(s.Line());\n}\n\nabstract class Shape\n{\n    public abstract double Area();\n    public abstract double Perimeter();\n    public string Line() => $"area {Area():F2}, perimeter {Perimeter():F2}";\n}\n\nclass Rect : Shape\n{\n    private readonly double w, h;\n    public Rect(double w, double h) { this.w = w; this.h = h; }\n    public override double Area() => w * h;\n    public override double Perimeter() => 2 * (w + h);\n}\n\nclass Circle : Shape\n{\n    private readonly double r;\n    public Circle(double r) => this.r = r;\n    public override double Area() => Math.PI * r * r;\n    public override double Perimeter() => 2 * Math.PI * r;\n}' },
    "8.3-drinks": { lesson: "8.3", title: "A drinks machine", tier: "stretch", minutes: 25, concepts: ["abstract-class", "virtual-override"],
      statement: ["Write an abstract `Drink` with one ordinary method `Make()` that returns the steps joined by `, `: `boil`, then the abstract `Brew()`, then the virtual `Extras()` (default: nothing — leave it out of the list when empty), then `serve`.", "`Tea`: brew `steep`; `Coffee`: brew `drip`, extras `milk`; `Cocoa`: brew `stir`, extras `cream`.", "Read drink names, one per line, until the end and print each `Make()`. An unknown name prints `unknown NAME`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "tea\ncoffee", out: "boil, steep, serve\nboil, drip, milk, serve" }],
      hidden: [{ stdin: "cocoa\njuice", out: "boil, stir, cream, serve\nunknown juice" }, { stdin: "tea", out: "boil, steep, serve" }],
      rules: [uses(/abstract\s+class\s+Drink/, "Make Drink abstract."), uses(/abstract\s+string\s+Brew/, "Brew is abstract.", "brew"), uses(/virtual\s+string\s+Extras/, "Extras is virtual with a default.", "extras")],
      hints: ["protected abstract string Brew(); protected virtual string Extras() => \"\";", "public string Make() { var steps = new List<string> { \"boil\", Brew() }; if (Extras() != \"\") steps.Add(Extras()); steps.Add(\"serve\"); return string.Join(\", \", steps); }", "Drink? d = line switch { \"tea\" => new Tea(), \"coffee\" => new Coffee(), \"cocoa\" => new Cocoa(), _ => null };"],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    Drink? d = line switch { "tea" => new Tea(), "coffee" => new Coffee(), "cocoa" => new Cocoa(), _ => null };\n    Console.WriteLine(d is null ? $"unknown {line}" : d.Make());\n}\n\nabstract class Drink\n{\n    public string Make()\n    {\n        var steps = new List<string> { "boil", Brew() };\n        if (Extras() != "") steps.Add(Extras());\n        steps.Add("serve");\n        return string.Join(", ", steps);\n    }\n    protected abstract string Brew();\n    protected virtual string Extras() => "";\n}\n\nclass Tea : Drink { protected override string Brew() => "steep"; }\nclass Coffee : Drink\n{\n    protected override string Brew() => "drip";\n    protected override string Extras() => "milk";\n}\nclass Cocoa : Drink\n{\n    protected override string Brew() => "stir";\n    protected override string Extras() => "cream";\n}' }
  } });

  /* ================================================================
     8.4 Interfaces
     ================================================================ */
  lesson("8.4", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A printer, a PDF and a log file can all *save text*, but they have nothing else in common — no sensible base class joins them.",
        "And a class has only one base class: a `Duck` cannot inherit from both `Bird` and `Swimmer`.",
        "An **interface** is a contract: a list of members with no data. Any class can promise to fulfil it (*implement* it), whatever its base class, and a class may implement many."
      ] },
      page("Core idea"),
      run("first", "two unrelated classes keep one promise", 'IShape[] shapes = { new Circle(1), new Rect(2, 3) };\nforeach (IShape s in shapes)\n    Console.WriteLine($"{s.Name}: {s.Area():F2}");\n\ninterface IShape\n{\n    string Name { get; }\n    double Area();\n}\n\nclass Circle : IShape\n{\n    private readonly double r;\n    public Circle(double r) => this.r = r;\n    public string Name => "circle";\n    public double Area() => Math.PI * r * r;\n}\n\nclass Rect : IShape\n{\n    private readonly double w, h;\n    public Rect(double w, double h) { this.w = w; this.h = h; }\n    public string Name => "rect";\n    public double Area() => w * h;\n}'),
      { ul: [
        "`interface IShape { … }` — members without bodies and without `public` (they are public by nature).",
        "`class Circle : IShape` — Circle **implements** IShape: it must write every member, as `public`, with no `override`.",
        "Interface names start with **I** by convention: `IShape`, `IComparable`, `IEnumerable`."
      ] },
      { h: "IComparable: teach your type to sort" },
      run("comparable", "List.Sort uses CompareTo", 'var team = new List<Player> { new("Kai", 74), new("Ada", 91), new("Lin", 58) };\nteam.Sort();\nforeach (var p in team) Console.WriteLine(p);\n\nclass Player : IComparable<Player>\n{\n    public string Name { get; }\n    public int Score { get; }\n    public Player(string name, int score) { Name = name; Score = score; }\n    public int CompareTo(Player? other) => other is null ? 1 : other.Score.CompareTo(Score);\n    public override string ToString() => $"{Name} {Score}";\n}'),
      { ul: [
        "`CompareTo` returns a negative number if this comes **first**, 0 if equal, positive if this comes after.",
        "`other.Score.CompareTo(Score)` swaps the order on purpose: highest score first.",
        "`new(\"Kai\", 74)` — the type is known from the list, so `new` needs no name (target-typed new)."
      ] },
      page("Rules"),
      { ul: [
        "An interface declares methods, properties, events and indexers — never instance fields.",
        "A class or struct implements an interface with `: IName`, after its base class if it has one: `class Duck : Bird, ISwimmer, IFlyer`.",
        "Every member must be implemented, `public`, with matching signature.",
        "You cannot `new` an interface, but a variable of interface type can hold any object that implements it.",
        "`x is IShape` tests whether an object keeps the contract.",
        "Since C# 8 an interface member may carry a **default** body; implementers may leave it out."
      ] },
      page("Variations"),
      { h: "One class, several interfaces" },
      run("many", "a Duck can both swim and fly", 'var d = new Duck();\nISwimmer s = d;\nIFlyer f = d;\nConsole.WriteLine(s.Swim());\nConsole.WriteLine(f.Fly());\nConsole.WriteLine(d is IFlyer);\n\ninterface ISwimmer { string Swim(); }\ninterface IFlyer { string Fly(); }\n\nclass Duck : ISwimmer, IFlyer\n{\n    public string Swim() => "paddles";\n    public string Fly() => "flaps";\n}'),
      { h: "A method that asks only for the contract" },
      run("param", "Total works for any IPriced, now and later", 'var basket = new List<IPriced> { new Book(12.99m), new Ticket(30m), new Book(4.50m) };\nConsole.WriteLine($"{Total(basket):F2}");\n\nstatic decimal Total(List<IPriced> items)\n{\n    decimal t = 0;\n    foreach (var i in items) t += i.Price;\n    return t;\n}\n\ninterface IPriced { decimal Price { get; } }\nclass Book : IPriced\n{\n    public decimal Price { get; }\n    public Book(decimal price) => Price = price;\n}\nclass Ticket : IPriced\n{\n    public decimal Price { get; }\n    public Ticket(decimal price) => Price = price;\n}'),
      { h: "A default method" },
      run("default", "Describe has a body in the interface", 'IGreeter g = new English();\nConsole.WriteLine(g.Greet("Ada"));\nConsole.WriteLine(g.Describe());\n\ninterface IGreeter\n{\n    string Greet(string name);\n    string Describe() => "a greeter";\n}\n\nclass English : IGreeter\n{\n    public string Greet(string name) => $"Hello, {name}";\n}'),
      page("Pitfalls"),
      { h: "A promise not kept — CS0535" },
      run("pit-missing", "Rect forgot Area", 'IShape s = new Rect();\nConsole.WriteLine(s.Area());\n\ninterface IShape { double Area(); }\nclass Rect : IShape { }'),
      { h: "new on an interface — CS0144" },
      run("pit-new", "there is no plain IShape", 'IShape s = new IShape();\n\ninterface IShape { double Area(); }'),
      { h: "Sorting a type with no CompareTo" },
      run("pit-sort", "Sort cannot compare two Players", 'var team = new List<Player> { new Player(), new Player() };\nteam.Sort();\n\nclass Player { }'),
      page("Connections"),
      { ul: [ "**Back:** 8.3 abstract classes — an interface is like one with no data and no code.", "**Next:** 8.5 chooses between them; 9.11 `IEnumerable<T>` is the interface behind every foreach.", "**AQA:** 4.1.2.3 interfaces." ] },
      page("Good practice"),
      { ul: [ "Name the capability: `IComparable`, `IPrintable`, `IShape`.", "Keep interfaces small: a class can implement several small ones.", "Ask for the interface in parameters (`List<IPriced>`), not a concrete class, so new types fit without changes." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Two greeters* and *A leaderboard*." ] },
      page("Quick reference"),
      run("qr", "interface at a glance", 'ISpeaker s = new Robot();\nConsole.WriteLine(s.Say());\n\ninterface ISpeaker { string Say(); }\nclass Robot : ISpeaker { public string Say() => "beep"; }'),
      { ul: [ "`interface IName { members }` — no fields, no `public`.", "`class C : Base, IName` — implement every member, public.", "`IComparable<T>.CompareTo`: negative = this first." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0535", "an interface member is not implemented", "Pitfalls"], ["CS0144", "an interface cannot be created", "Pitfalls"], ["InvalidOperationException", "Sort found no way to compare", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var xs = new List<Age> { new(30), new(7), new(18) };\nxs.Sort();\nConsole.WriteLine(string.Join(" ", xs));\n\nclass Age : IComparable<Age>\n{\n    public int Years { get; }\n    public Age(int y) => Years = y;\n    public int CompareTo(Age? o) => Years.CompareTo(o?.Years ?? 0);\n    public override string ToString() => Years.ToString();\n}', why: "Years.CompareTo(o.Years) sorts youngest first.", concepts: ["icomparable"] },
        { id: "p2", src: 'object o = new Fish();\nConsole.WriteLine(o is ISwimmer);\nConsole.WriteLine(o is IFlyer);\n\ninterface ISwimmer { }\ninterface IFlyer { }\nclass Fish : ISwimmer { }', why: "Fish implements ISwimmer only.", concepts: ["interfaces"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Lamp keeps the ISwitch contract.", src: 'ISwitch s = new Lamp();\nConsole.WriteLine(s.Toggle());\n\ninterface ISwitch { string Toggle(); }\nclass Lamp @@\n{\n    public string Toggle() => "on";\n}', out: "on", concepts: ["interfaces"] }
      ],
      bug: [
        { id: "b1", q: "Players should sort highest score first: Ada 91, then Kai 74.", src: 'var t = new List<Player> { new("Kai", 74), new("Ada", 91) };\nt.Sort();\nforeach (var p in t) Console.WriteLine($"{p.Name} {p.Score}");\n\nclass Player : IComparable<Player>\n{\n    public string Name { get; }\n    public int Score { get; }\n    public Player(string n, int s) { Name = n; Score = s; }\n    public int CompareTo(Player? o) => Score.CompareTo(o?.Score ?? 0);\n}', out: "Ada 91\nKai 74", fixedText: "prints Ada 91 then Kai 74", why: "Score.CompareTo(o.Score) sorts lowest first; swap them: o.Score.CompareTo(Score).", concepts: ["icomparable"] }
      ]
    },
    flashcards: [
      ["What is an interface?", "A contract of members with no data; any class may implement it."],
      ["How many interfaces can a class implement?", "Any number (but only one base class)."],
      ["Can an interface hold instance fields?", "No — methods, properties, events and indexers only."],
      ["What does CompareTo's result mean?", "Negative: this comes first; 0: equal; positive: this comes after."],
      ["Do implementing methods use override?", "No — they are written as ordinary public members."],
      ["Why ask for an interface as a parameter?", "Any present or future type that keeps the contract fits."]
    ],
    quiz: [
      { q: "`class Duck : Bird, ISwimmer, IFlyer` means Duck…", opts: ["has three base classes", "inherits Bird and implements two interfaces", "is an error", "is an interface"], ans: 1, why: "One base class, any number of interfaces." },
      { q: "`List<Player>.Sort()` throws when Player…", opts: ["has no ToString", "implements no IComparable", "is sealed", "has a constructor"], ans: 1, why: "Sort needs a way to compare two items." },
      { q: "An interface member is implemented as…", opts: ["private", "public, matching the signature", "override", "static"], ans: 1, why: "Implicit implementations are public members." }
    ]
  });
  K.add({ tasks: {
    "8.4-greet": { lesson: "8.4", title: "Two greeters", tier: "warm-up", minutes: 10, concepts: ["interfaces"],
      statement: ["Write `interface IGreeter { string Greet(string name); }` and two classes: `English` (`Hello, NAME!`) and `French` (`Bonjour, NAME !`).", "Read a language (`en` or `fr`) and then a name. Hold the greeter in an `IGreeter` variable and print its greeting."],
      starter: 'string lang = Console.ReadLine() ?? "";\nstring name = Console.ReadLine() ?? "";\n',
      examples: [{ stdin: "en\nAda", out: "Hello, Ada!" }],
      hidden: [{ stdin: "fr\nKai", out: "Bonjour, Kai !" }, { stdin: "en\nLin", out: "Hello, Lin!" }],
      rules: [uses(/interface\s+IGreeter/, "Declare IGreeter."), uses(/IGreeter\s+\w+\s*=/, "Hold the greeter in an IGreeter variable.", "var")],
      hints: ["class English : IGreeter { public string Greet(string n) => $\"Hello, {n}!\"; }", "IGreeter g = lang == \"fr\" ? new French() : new English();", "Console.WriteLine(g.Greet(name));"],
      answer: 'string lang = Console.ReadLine() ?? "";\nstring name = Console.ReadLine() ?? "";\nIGreeter g = lang == "fr" ? new French() : new English();\nConsole.WriteLine(g.Greet(name));\n\ninterface IGreeter { string Greet(string name); }\nclass English : IGreeter { public string Greet(string name) => $"Hello, {name}!"; }\nclass French : IGreeter { public string Greet(string name) => $"Bonjour, {name} !"; }' },
    "8.4-rank": { lesson: "8.4", title: "A leaderboard", tier: "core", minutes: 20, concepts: ["icomparable", "interfaces"],
      statement: ["Write `Player : IComparable<Player>` with `Name` and `Score`. Its `CompareTo` puts the higher score first, and on a tie the name in alphabetical order (`string.Compare(a, b, StringComparison.Ordinal)`).", "Read lines `NAME SCORE` until the end, sort the list with `Sort()`, and print `1. NAME SCORE`, `2. …`."],
      starter: 'var players = new List<Player>();\n\nclass Player\n{\n}',
      examples: [{ stdin: "Kai 74\nAda 91\nLin 74", out: "1. Ada 91\n2. Kai 74\n3. Lin 74" }],
      hidden: [{ stdin: "Zed 5", out: "1. Zed 5" }, { stdin: "Bo 10\nAl 10\nCy 20", out: "1. Cy 20\n2. Al 10\n3. Bo 10" }],
      rules: [uses(/IComparable<\s*Player\s*>/, "Implement IComparable<Player>."), uses(/CompareTo\s*\(\s*Player\?/, "Write CompareTo(Player? other).", "cmp"), uses(/\.Sort\s*\(\s*\)/, "Sort with Sort().", "sort")],
      hints: ["public int CompareTo(Player? o) { if (o is null) return -1; … }", "int byScore = o.Score.CompareTo(Score); return byScore != 0 ? byScore : string.Compare(Name, o.Name, StringComparison.Ordinal);", "for (int i = 0; i < players.Count; i++) Console.WriteLine($\"{i + 1}. {players[i].Name} {players[i].Score}\");"],
      answer: 'var players = new List<Player>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    players.Add(new Player(p[0], int.Parse(p[1])));\n}\nplayers.Sort();\nfor (int i = 0; i < players.Count; i++)\n    Console.WriteLine($"{i + 1}. {players[i].Name} {players[i].Score}");\n\nclass Player : IComparable<Player>\n{\n    public string Name { get; }\n    public int Score { get; }\n    public Player(string name, int score) { Name = name; Score = score; }\n    public int CompareTo(Player? o)\n    {\n        if (o is null) return -1;\n        int byScore = o.Score.CompareTo(Score);\n        return byScore != 0 ? byScore : string.Compare(Name, o.Name, StringComparison.Ordinal);\n    }\n}' }
  } });

  /* ================================================================
     8.5 Interface or abstract class?
     ================================================================ */
  lesson("8.5", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "8.3 and 8.4 both let several types share one shape. Pick wrongly and the design fights you later.",
        "An **abstract class** says what a family *is* and shares code and data with it.",
        "An **interface** says what something *can do* — a capability any type may add, whatever its family."
      ] },
      page("Core idea"),
      run("both", "a family (Animal) and capabilities (ISwimmer, IFlyer)", 'var duck = new Duck("Donald");\nvar fish = new Fish("Nemo");\nConsole.WriteLine(duck.Intro());\nvar swimmers = new List<ISwimmer> { duck, fish, new Submarine() };\nforeach (var s in swimmers) Console.WriteLine(s.Swim());\n\nabstract class Animal\n{\n    public string Name { get; }\n    protected Animal(string name) => Name = name;\n    public string Intro() => $"I am {Name}";\n}\n\ninterface ISwimmer { string Swim(); }\ninterface IFlyer { string Fly(); }\n\nclass Duck : Animal, ISwimmer, IFlyer\n{\n    public Duck(string name) : base(name) { }\n    public string Swim() => $"{Name} paddles";\n    public string Fly() => $"{Name} flaps";\n}\n\nclass Fish : Animal, ISwimmer\n{\n    public Fish(string name) : base(name) { }\n    public string Swim() => $"{Name} wiggles";\n}\n\nclass Submarine : ISwimmer\n{\n    public string Swim() => "the submarine dives";\n}'),
      { ul: [
        "`Animal` holds what every animal **has** (a name) and **does the same way** (Intro).",
        "`ISwimmer` joins types that share nothing else: a duck, a fish and a submarine.",
        "A Submarine is not an animal — inheritance could never have put it in that list."
      ] },
      page("Rules"),
      { table: { head: ["", "Abstract class", "Interface"], rows: [
        ["Says", "what it **is** (is-a)", "what it **can do**"],
        ["How many per class", "one", "any number"],
        ["Fields and state", "yes", "no"],
        ["Constructors", "yes", "no"],
        ["Code", "ordinary, virtual and abstract members", "signatures; default bodies only (C# 8+)"],
        ["Access", "any (protected helpers)", "public"],
        ["Structs can use it", "no", "yes"]
      ] } },
      { ul: [
        "Shared state or shared code for a family → abstract class.",
        "A capability that unrelated types should share → interface.",
        "Both are common together: a family base class plus several small interfaces.",
        "When in doubt, start with an interface: it costs a class nothing, since the class keeps its one base for something else."
      ] },
      page("Variations"),
      { h: "An abstract class that implements an interface" },
      run("bridge", "ShapeBase gives every shape a ToString; IShape is the contract", 'IShape[] all = { new Square(2), new Circle(1) };\nforeach (var s in all) Console.WriteLine(s);\n\ninterface IShape { string Name { get; } double Area(); }\n\nabstract class ShapeBase : IShape\n{\n    public abstract string Name { get; }\n    public abstract double Area();\n    public override string ToString() => $"{Name} {Area():F1}";\n}\n\nclass Square : ShapeBase\n{\n    private readonly double a;\n    public Square(double a) => this.a = a;\n    public override string Name => "square";\n    public override double Area() => a * a;\n}\n\nclass Circle : ShapeBase\n{\n    private readonly double r;\n    public Circle(double r) => this.r = r;\n    public override string Name => "circle";\n    public override double Area() => Math.PI * r * r;\n}'),
      { h: "Structs implement interfaces too" },
      run("struct", "a struct cannot inherit, but it can keep a contract", 'IPriced p = new Coin(50);\nConsole.WriteLine(p.Pence);\n\ninterface IPriced { int Pence { get; } }\nstruct Coin : IPriced\n{\n    public int Pence { get; }\n    public Coin(int pence) => Pence = pence;\n}'),
      { h: "Two interfaces, one name: explicit implementation" },
      run("explicit", "each interface sees its own Describe", 'var p = new Pen();\nConsole.WriteLine(((IShop)p).Describe());\nConsole.WriteLine(((IStock)p).Describe());\n\ninterface IShop { string Describe(); }\ninterface IStock { string Describe(); }\n\nclass Pen : IShop, IStock\n{\n    string IShop.Describe() => "a blue pen, 1.20";\n    string IStock.Describe() => "pens: 40 in stock";\n}'),
      page("Pitfalls"),
      { h: "A field in an interface — CS0525" },
      run("pit-field", "interfaces hold no data", 'Console.WriteLine("shop");\n\ninterface IPriced { decimal price; }'),
      { h: "Two base classes — CS1721" },
      run("pit-two", "a class gets one base class; the rest must be interfaces", 'Console.WriteLine(new Duck());\n\nclass Bird { }\nclass Swimmer { }\nclass Duck : Bird, Swimmer { }'),
      { h: "An interface that grows too big" },
      "An `IAnimal` with Swim, Fly, Bark and Lay forces a dog to write a Fly it cannot do. Split it: several small interfaces (10.9, interface segregation).",
      page("Connections"),
      { ul: [ "**Back:** 8.3 abstract classes, 8.4 interfaces.", "**Next:** 8.6 polymorphism works through either; 8.12 builds behaviour from interfaces; 10.9 SOLID's interface segregation.", "**AQA:** 4.1.2.3 abstract classes and interfaces." ] },
      page("Good practice"),
      { ul: [ "Is-a with shared code → abstract class; can-do → interface.", "Several small interfaces beat one big one.", "Keep the base class for a real family; do not spend it on a capability." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Pets and tricks* and *Charge everything*." ] },
      page("Quick reference"),
      run("qr", "the two together", 'var h = new Heater("hall");\nConsole.WriteLine(h.Label() + " " + h.TurnOn());\n\nabstract class Device\n{\n    public string Room { get; }\n    protected Device(string room) => Room = room;\n    public string Label() => $"[{Room}]";\n}\ninterface ISwitchable { string TurnOn(); }\nclass Heater : Device, ISwitchable\n{\n    public Heater(string room) : base(room) { }\n    public string TurnOn() => "warming";\n}'),
      { ul: [ "`class C : Base, IOne, ITwo` — the base first.", "Abstract class: state, constructors, shared code.", "Interface: a capability, many per type, structs too." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0525", "an interface cannot hold fields", "Pitfalls"], ["CS1721", "only one base class", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var things = new List<object> { new Kettle(), new Cat(), new Phone() };\nint n = 0;\nforeach (var t in things) if (t is IPlugIn) n++;\nConsole.WriteLine(n);\n\ninterface IPlugIn { }\nclass Kettle : IPlugIn { }\nclass Phone : IPlugIn { }\nclass Cat { }', why: "Kettle and Phone implement IPlugIn; the cat does not.", concepts: ["iface-choice"] },
        { id: "p2", src: 'var b = new Robin();\nConsole.WriteLine(b.Legs + " " + b.Fly());\n\nabstract class Bird { public int Legs => 2; }\ninterface IFlyer { string Fly(); }\nclass Robin : Bird, IFlyer { public string Fly() => "up"; }', why: "Legs comes from the base class, Fly from the interface.", concepts: ["iface-choice"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap: Car is a Vehicle and can be charged.", src: 'var c = new Car();\nConsole.WriteLine(c.Wheels + " " + c.Charge());\n\nabstract class Vehicle { public int Wheels => 4; }\ninterface IChargeable { string Charge(); }\nclass Car : @@\n{\n    public string Charge() => "charging";\n}', out: "4 charging", concepts: ["iface-choice"] }
      ],
      bug: [
        { id: "b1", q: "A Robot is not an animal, but it can swim: it should print `beeps underwater`.", src: 'ISwimmer s = new Robot();\nConsole.WriteLine(s.Swim());\n\ninterface ISwimmer { string Swim(); }\nclass Robot : ISwimmer\n{\n    public string Swim() => "";\n    public string Beep() => "beeps underwater";\n}', out: "beeps underwater", fixedText: "prints beeps underwater", why: "Swim returned an empty string; it should return Beep() (or the text itself).", concepts: ["interfaces"] }
      ]
    },
    flashcards: [
      ["Abstract class or interface for shared fields?", "Abstract class — interfaces hold no state."],
      ["Abstract class or interface for a capability unrelated types share?", "Interface."],
      ["Can a struct inherit from a class?", "No, but it can implement interfaces."],
      ["What order in `class C : …`?", "The base class first, then the interfaces."],
      ["What is explicit interface implementation?", "`string IShop.Describe()` — a member seen only through that interface."],
      ["Why prefer small interfaces?", "No class has to write members it cannot honour."]
    ],
    quiz: [
      { q: "Duck, Fish and Submarine can all swim. Best design?", opts: ["Submarine : Animal", "an ISwimmer interface", "one big Swimmer base class", "copy the method three times"], ans: 1, why: "A capability shared by unrelated types is an interface." },
      { q: "Every account has a balance and the same Deposit code. Best design?", opts: ["an interface", "an abstract class Account", "a struct", "a static class"], ans: 1, why: "Shared state and code for one family." },
      { q: "Which can an interface NOT contain?", opts: ["a method signature", "a property", "an instance field", "a default method"], ans: 2, why: "No state in interfaces." }
    ]
  });
  K.add({ tasks: {
    "8.5-pets": { lesson: "8.5", title: "Pets and tricks", tier: "core", minutes: 20, concepts: ["iface-choice", "abstract-class", "interfaces"],
      statement: ["Write an abstract class `Pet` with a `Name` (from its constructor) and an abstract `Sound()`, and an interface `ITrick` with `string Trick()`.", "`Dog : Pet, ITrick` — sound `Woof`, trick `rolls over`; `Cat : Pet` — sound `Miaow`, no trick.", "Read lines `dog NAME` or `cat NAME`. For each print `NAME: SOUND`, and if the pet is an `ITrick`, add ` and TRICK`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "dog Rex\ncat Tom", out: "Rex: Woof and rolls over\nTom: Miaow" }],
      hidden: [{ stdin: "cat Kit", out: "Kit: Miaow" }, { stdin: "dog A\ndog B", out: "A: Woof and rolls over\nB: Woof and rolls over" }],
      rules: [uses(/abstract\s+class\s+Pet/, "Make Pet abstract."), uses(/interface\s+ITrick/, "Declare ITrick.", "trick"), uses(/is\s+ITrick/, "Ask `is ITrick` to find the tricks.", "is")],
      hints: ["abstract class Pet { public string Name { get; } protected Pet(string n) => Name = n; public abstract string Sound(); }", "class Dog : Pet, ITrick { public Dog(string n) : base(n) { } public override string Sound() => \"Woof\"; public string Trick() => \"rolls over\"; }", "string s = $\"{p.Name}: {p.Sound()}\"; if (p is ITrick t) s += $\" and {t.Trick()}\";"],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] w = line.Split(\' \');\n    Pet p = w[0] == "dog" ? new Dog(w[1]) : new Cat(w[1]);\n    string s = $"{p.Name}: {p.Sound()}";\n    if (p is ITrick t) s += $" and {t.Trick()}";\n    Console.WriteLine(s);\n}\n\nabstract class Pet\n{\n    public string Name { get; }\n    protected Pet(string name) => Name = name;\n    public abstract string Sound();\n}\n\ninterface ITrick { string Trick(); }\n\nclass Dog : Pet, ITrick\n{\n    public Dog(string name) : base(name) { }\n    public override string Sound() => "Woof";\n    public string Trick() => "rolls over";\n}\n\nclass Cat : Pet\n{\n    public Cat(string name) : base(name) { }\n    public override string Sound() => "Miaow";\n}' },
    "8.5-charge": { lesson: "8.5", title: "Charge everything", tier: "stretch", minutes: 25, concepts: ["iface-choice", "interfaces"],
      statement: ["Write `interface IChargeable { string Name { get; } int Battery { get; } void Charge(int minutes); }`.", "`Phone` (an ordinary class) gains 2% a minute; `EBike : Vehicle` (an abstract `Vehicle` with `Wheels`) gains 1% a minute. Neither goes past 100; both start at the battery given.", "Read lines `phone NAME BATTERY` or `ebike NAME BATTERY`, then a final line `charge MINUTES`. Charge every device in one `List<IChargeable>` and print `NAME BATTERY%` for each, in the order read."],
      starter: 'var all = new List<IChargeable>();\n\ninterface IChargeable { }',
      examples: [{ stdin: "phone Pixel 50\nebike Volt 10\ncharge 30", out: "Pixel 100%\nVolt 40%" }],
      hidden: [{ stdin: "ebike Zip 95\ncharge 3", out: "Zip 98%" }, { stdin: "phone A 0\nphone B 99\ncharge 1", out: "A 2%\nB 100%" }],
      rules: [uses(/interface\s+IChargeable/, "Declare IChargeable."), uses(/class\s+EBike\s*:\s*Vehicle\s*,\s*IChargeable/, "EBike is a Vehicle and IChargeable.", "ebike"), uses(/List<\s*IChargeable\s*>/, "Hold them in a List<IChargeable>.", "list")],
      hints: ["interface IChargeable { string Name { get; } int Battery { get; } void Charge(int minutes); }", "public void Charge(int m) => Battery = Math.Min(100, Battery + 2 * m);", "if (w[0] == \"charge\") { foreach (var d in all) d.Charge(int.Parse(w[1])); }"],
      answer: 'var all = new List<IChargeable>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] w = line.Split(\' \');\n    if (w[0] == "charge")\n    {\n        foreach (var d in all) d.Charge(int.Parse(w[1]));\n        break;\n    }\n    all.Add(w[0] == "phone" ? new Phone(w[1], int.Parse(w[2])) : new EBike(w[1], int.Parse(w[2])));\n}\nforeach (var d in all) Console.WriteLine($"{d.Name} {d.Battery}%");\n\ninterface IChargeable\n{\n    string Name { get; }\n    int Battery { get; }\n    void Charge(int minutes);\n}\n\nclass Phone : IChargeable\n{\n    public string Name { get; }\n    public int Battery { get; private set; }\n    public Phone(string name, int battery) { Name = name; Battery = battery; }\n    public void Charge(int minutes) => Battery = Math.Min(100, Battery + 2 * minutes);\n}\n\nabstract class Vehicle\n{\n    public int Wheels { get; }\n    protected Vehicle(int wheels) => Wheels = wheels;\n}\n\nclass EBike : Vehicle, IChargeable\n{\n    public string Name { get; }\n    public int Battery { get; private set; }\n    public EBike(string name, int battery) : base(2) { Name = name; Battery = battery; }\n    public void Charge(int minutes) => Battery = Math.Min(100, Battery + minutes);\n}' }
  } });

  /* ================================================================
     8.6 Polymorphism
     ================================================================ */
  lesson("8.6", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A drawing program with circles, squares and triangles could ask `if (kind == \"circle\") … else if …` everywhere it needs an area. Add a hexagon and every one of those chains must change.",
        "**Polymorphism** (\"many forms\") turns the chain inside out: each type carries its own version, and the caller just calls `s.Area()`.",
        "New types join without the calling code changing at all."
      ] },
      page("Core idea"),
      run("loop", "one loop, the right Area for each shape", 'var shapes = new List<Shape> { new Circle(1), new Square(2), new Triangle(3, 4) };\ndouble total = 0;\nforeach (Shape s in shapes)\n{\n    Console.WriteLine($"{s.GetType().Name,-8} {s.Area():F2}");\n    total += s.Area();\n}\nConsole.WriteLine($"total    {total:F2}");\n\nabstract class Shape { public abstract double Area(); }\nclass Circle : Shape { private readonly double r; public Circle(double r) => this.r = r; public override double Area() => Math.PI * r * r; }\nclass Square : Shape { private readonly double a; public Square(double a) => this.a = a; public override double Area() => a * a; }\nclass Triangle : Shape { private readonly double b, h; public Triangle(double b, double h) { this.b = b; this.h = h; } public override double Area() => b * h / 2; }'),
      { ul: [
        "The list is of the **base** type; each element is a different **derived** type.",
        "`s.Area()` is written once. At run time each call goes to the object's own override.",
        "`{…,-8}` pads the name to 8 characters, left-aligned."
      ] },
      run("param", "a method written once for every shape, present and future", 'Console.WriteLine(Bigger(new Circle(2), new Square(3)).GetType().Name);\n\nstatic Shape Bigger(Shape a, Shape b) => a.Area() >= b.Area() ? a : b;\n\nabstract class Shape { public abstract double Area(); }\nclass Circle : Shape { private readonly double r; public Circle(double r) => this.r = r; public override double Area() => Math.PI * r * r; }\nclass Square : Shape { private readonly double a; public Square(double a) => this.a = a; public override double Area() => a * a; }'),
      page("Rules"),
      { ul: [
        "**Subtype polymorphism**: a variable of a base type (or interface) may refer to an object of any derived type.",
        "Calls to virtual, abstract and interface members are **dispatched** on the object's runtime type.",
        "The variable's **declared** type decides which members you may call; the object's **runtime** type decides which body runs.",
        "To reach a member only the derived type has, test and convert: `if (s is Circle c) … c.Radius`.",
        "Overloading (same name, different parameters) is chosen at compile time — sometimes called static polymorphism."
      ] },
      page("Variations"),
      { h: "Through an interface" },
      run("iface", "the same idea with an interface", 'var alarms = new List<INotifier> { new Email("ada@school"), new Text("07700"), new Email("kai@school") };\nforeach (var a in alarms) Console.WriteLine(a.Send("Fire drill at 10"));\n\ninterface INotifier { string Send(string msg); }\nclass Email : INotifier\n{\n    private readonly string to;\n    public Email(string to) => this.to = to;\n    public string Send(string msg) => $"email {to}: {msg}";\n}\nclass Text : INotifier\n{\n    private readonly string to;\n    public Text(string to) => this.to = to;\n    public string Send(string msg) => $"text {to}: {msg[..Math.Min(10, msg.Length)]}…";\n}'),
      { h: "Replacing a switch with a dictionary of objects" },
      run("table", "each operation is an object; looking one up replaces the if-chain", 'var ops = new Dictionary<string, Op> { ["+"] = new Add(), ["*"] = new Mul(), ["-"] = new Sub() };\nforeach (string sym in new[] { "+", "*", "-" })\n    Console.WriteLine($"6 {sym} 3 = {ops[sym].Apply(6, 3)}");\n\nabstract class Op { public abstract int Apply(int a, int b); }\nclass Add : Op { public override int Apply(int a, int b) => a + b; }\nclass Mul : Op { public override int Apply(int a, int b) => a * b; }\nclass Sub : Op { public override int Apply(int a, int b) => a - b; }'),
      { h: "When you do need the derived type" },
      run("downcast", "is with a name tests and converts in one step", 'Shape[] all = { new Circle(2), new Square(3) };\nforeach (Shape s in all)\n{\n    if (s is Circle c) Console.WriteLine($"circle of radius {c.Radius}");\n    else Console.WriteLine($"area {s.Area()}");\n}\n\nabstract class Shape { public abstract double Area(); }\nclass Circle : Shape { public double Radius { get; } public Circle(double r) => Radius = r; public override double Area() => Math.PI * Radius * Radius; }\nclass Square : Shape { private readonly double a; public Square(double a) => this.a = a; public override double Area() => a * a; }'),
      page("Pitfalls"),
      { h: "Calling a member the declared type does not have — CS1061" },
      run("pit-member", "a Shape variable does not know about Radius", 'Shape s = new Circle(2);\nConsole.WriteLine(s.Radius);\n\nabstract class Shape { }\nclass Circle : Shape { public double Radius { get; } public Circle(double r) => Radius = r; }'),
      { h: "A wrong cast — InvalidCastException" },
      run("pit-cast", "(Circle) on a Square fails at run time", 'Shape s = new Square();\nvar c = (Circle)s;\nConsole.WriteLine("never printed");\n\nabstract class Shape { }\nclass Circle : Shape { }\nclass Square : Shape { }'),
      { h: "Type checks instead of dispatch" },
      "A chain of `if (s is Circle) … else if (s is Square) …` for behaviour every shape has is the old switch in disguise: put the behaviour in the classes.",
      page("Connections"),
      { ul: [ "**Back:** 8.2 dispatch, 8.3 abstract members, 8.4 interfaces.", "**Next:** 8.10 pattern matching for the cases where testing the type is right; 8.12 composition.", "**AQA:** 4.1.2.3 polymorphism and overriding." ] },
      page("Good practice"),
      { ul: [ "Program to the base type or interface; let objects decide.", "When adding a type forces edits in many if-chains, the behaviour belongs in the types.", "Use `is T name` rather than an unchecked cast." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A calculator of objects* and *Payroll*." ] },
      page("Quick reference"),
      run("qr", "polymorphism at a glance", 'foreach (Animal a in new Animal[] { new Dog(), new Cow() }) Console.WriteLine(a.Speak());\n\nabstract class Animal { public abstract string Speak(); }\nclass Dog : Animal { public override string Speak() => "Woof"; }\nclass Cow : Animal { public override string Speak() => "Moo"; }'),
      { ul: [ "Base-typed variable, derived object.", "Declared type → what you may call; runtime type → which body runs.", "`if (x is T t)` to reach derived-only members." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1061", "the declared type has no such member", "Pitfalls"], ["InvalidCastException", "the object is not of that type", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'Animal[] a = { new Dog(), new Cat(), new Dog() };\nstring s = "";\nforeach (var x in a) s += x.Speak()[0];\nConsole.WriteLine(s);\n\nabstract class Animal { public abstract string Speak(); }\nclass Dog : Animal { public override string Speak() => "Woof"; }\nclass Cat : Animal { public override string Speak() => "Miaow"; }', why: "First letters of Woof, Miaow, Woof.", concepts: ["polymorphism"] },
        { id: "p2", src: 'object[] xs = { new Sq(2), "hi", new Sq(3) };\nint t = 0;\nforeach (var x in xs) if (x is Sq s) t += s.Side;\nConsole.WriteLine(t);\n\nclass Sq { public int Side { get; } public Sq(int s) => Side = s; }', why: "Only the two Sq objects count: 2 + 3.", concepts: ["polymorphism"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the loop works for every Animal.", src: 'var zoo = new List<@@> { new Dog(), new Cow() };\nforeach (var a in zoo) Console.Write(a.Speak() + " ");\nConsole.WriteLine();\n\nabstract class Animal { public abstract string Speak(); }\nclass Dog : Animal { public override string Speak() => "Woof"; }\nclass Cow : Animal { public override string Speak() => "Moo"; }', out: "Woof Moo", concepts: ["polymorphism"] }
      ],
      bug: [
        { id: "b1", q: "It should print the total area, 13.", src: 'var shapes = new List<Shape> { new Sq(2), new Sq(3) };\ndouble t = 0;\nforeach (var s in shapes) t += s.Area();\nConsole.WriteLine(t);\n\nclass Shape { public virtual double Area() => 0; }\nclass Sq : Shape\n{\n    private readonly double a;\n    public Sq(double a) => this.a = a;\n    public new double Area() => a * a;\n}', out: "13", fixedText: "prints 13", why: "`new` hides; through a Shape variable the base Area (0) runs. Use override.", concepts: ["polymorphism", "virtual-override"] }
      ]
    },
    flashcards: [
      ["What is polymorphism?", "One call (s.Area()) that runs the right method for each object's type."],
      ["Which type decides the members you may call?", "The variable's declared type."],
      ["Which type decides which body runs?", "The object's runtime type (for virtual, abstract and interface members)."],
      ["How do you safely reach a derived-only member?", "`if (s is Circle c) … c.Radius`."],
      ["What happens on `(Circle)s` when s is a Square?", "InvalidCastException at run time."],
      ["What design smell does polymorphism remove?", "if/switch chains on a type code, repeated around the program."]
    ],
    quiz: [
      { q: "`Shape s = new Circle(2); s.Radius` gives…", opts: ["2", "CS1061: Shape has no Radius", "0", "an exception"], ans: 1, why: "The declared type limits what you may call." },
      { q: "Adding a Hexagon : Shape to a polymorphic program means changing…", opts: ["every loop over shapes", "nothing but the new class", "the base class only", "Main"], ans: 1, why: "Callers only use Shape's members." },
      { q: "Choosing between overloads by parameter types happens…", opts: ["at run time", "at compile time", "never", "only for interfaces"], ans: 1, why: "Overloads are resolved by the compiler; overrides at run time." }
    ]
  });
  K.add({ tasks: {
    "8.6-calc": { lesson: "8.6", title: "A calculator of objects", tier: "core", minutes: 20, concepts: ["polymorphism", "abstract-class"],
      statement: ["Write an abstract class `Op` with an abstract `long Apply(long a, long b)`, and `Add`, `Sub`, `Mul` and `Pow` (a to the power b).", "Put them in a `Dictionary<string, Op>` keyed `+`, `-`, `*`, `^`. Read lines `A SYMBOL B` until the end and print the result, or `unknown SYMBOL` — no if-chain or switch on the symbol."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "6 + 3\n6 * 3\n2 ^ 10", out: "9\n18\n1024" }],
      hidden: [{ stdin: "1 - 5\n7 / 2", out: "-4\nunknown /" }, { stdin: "3 ^ 0", out: "1" }],
      rules: [uses(/abstract\s+class\s+Op/, "Make Op abstract."), uses(/Dictionary<\s*string\s*,\s*Op\s*>/, "Keep the operations in a Dictionary<string, Op>.", "dict"), { id: "noswitch", test: function (s) { return !/switch|==\s*"[-+*^]"/.test(s); }, msg: "Look the operation up — no switch or == on the symbol." }],
      hints: ["abstract class Op { public abstract long Apply(long a, long b); }", "class Pow : Op { public override long Apply(long a, long b) { long r = 1; for (long i = 0; i < b; i++) r *= a; return r; } }", "if (ops.TryGetValue(p[1], out Op? op)) Console.WriteLine(op.Apply(…)); else Console.WriteLine($\"unknown {p[1]}\");"],
      answer: 'var ops = new Dictionary<string, Op> { ["+"] = new Add(), ["-"] = new Sub(), ["*"] = new Mul(), ["^"] = new Pow() };\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    if (ops.TryGetValue(p[1], out Op? op)) Console.WriteLine(op.Apply(long.Parse(p[0]), long.Parse(p[2])));\n    else Console.WriteLine($"unknown {p[1]}");\n}\n\nabstract class Op { public abstract long Apply(long a, long b); }\nclass Add : Op { public override long Apply(long a, long b) => a + b; }\nclass Sub : Op { public override long Apply(long a, long b) => a - b; }\nclass Mul : Op { public override long Apply(long a, long b) => a * b; }\nclass Pow : Op\n{\n    public override long Apply(long a, long b)\n    {\n        long r = 1;\n        for (long i = 0; i < b; i++) r *= a;\n        return r;\n    }\n}' },
    "8.6-payroll": { lesson: "8.6", title: "Payroll", tier: "stretch", minutes: 25, concepts: ["polymorphism", "virtual-override"],
      statement: ["Write an abstract `Staff` with a `Name` and an abstract `decimal MonthlyPay()`, and a virtual `string Line()` returning `NAME PAY` (2 decimals).", "`Salaried` (annual salary ÷ 12), `Hourly` (rate × hours), `Contractor` (a fixed fee; its `Line()` adds ` (contract)`).", "Read lines `s NAME SALARY`, `h NAME RATE HOURS` or `c NAME FEE`. Print each `Line()`, then `total T` (2 decimals). One loop over a `List<Staff>` does the printing."],
      starter: 'var staff = new List<Staff>();\n\nabstract class Staff { }',
      examples: [{ stdin: "s Ada 36000\nh Kai 12.50 80\nc Lin 900", out: "Ada 3000.00\nKai 1000.00\nLin 900.00 (contract)\ntotal 4900.00" }],
      hidden: [{ stdin: "", out: "total 0.00" }, { stdin: "s Bo 10000", out: "Bo 833.33\ntotal 833.33" }],
      rules: [uses(/abstract\s+decimal\s+MonthlyPay/, "MonthlyPay is abstract."), uses(/override\s+string\s+Line/, "Contractor overrides Line.", "line"), uses(/List<\s*Staff\s*>/, "Keep them in a List<Staff>.", "list")],
      hints: ["abstract class Staff { public string Name { get; } protected Staff(string n) => Name = n; public abstract decimal MonthlyPay(); public virtual string Line() => $\"{Name} {MonthlyPay():F2}\"; }", "class Contractor : Staff { … public override string Line() => base.Line() + \" (contract)\"; }", "Round only when printing; sum the unrounded pays then print the total with :F2."],
      answer: 'var staff = new List<Staff>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    staff.Add(p[0] switch\n    {\n        "s" => new Salaried(p[1], decimal.Parse(p[2])),\n        "h" => new Hourly(p[1], decimal.Parse(p[2]), decimal.Parse(p[3])),\n        _ => new Contractor(p[1], decimal.Parse(p[2]))\n    });\n}\ndecimal total = 0;\nforeach (Staff s in staff)\n{\n    Console.WriteLine(s.Line());\n    total += s.MonthlyPay();\n}\nConsole.WriteLine($"total {total:F2}");\n\nabstract class Staff\n{\n    public string Name { get; }\n    protected Staff(string name) => Name = name;\n    public abstract decimal MonthlyPay();\n    public virtual string Line() => $"{Name} {MonthlyPay():F2}";\n}\nclass Salaried : Staff\n{\n    private readonly decimal salary;\n    public Salaried(string n, decimal salary) : base(n) => this.salary = salary;\n    public override decimal MonthlyPay() => salary / 12;\n}\nclass Hourly : Staff\n{\n    private readonly decimal rate, hours;\n    public Hourly(string n, decimal rate, decimal hours) : base(n) { this.rate = rate; this.hours = hours; }\n    public override decimal MonthlyPay() => rate * hours;\n}\nclass Contractor : Staff\n{\n    private readonly decimal fee;\n    public Contractor(string n, decimal fee) : base(n) => this.fee = fee;\n    public override decimal MonthlyPay() => fee;\n    public override string Line() => base.Line() + " (contract)";\n}' }
  } });

  /* ================================================================
     8.7 Records
     ================================================================ */
  lesson("8.7", {
    aqa: "4.2.1.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Many types are just data: a point, a date range, a row from a file. As classes they need a constructor, properties, Equals, GetHashCode and ToString — twenty lines of boilerplate.",
        "And two class objects with the same values are still **not equal** (7.6): `==` asks \"same object?\".",
        "A **record** is a type for data: one line declares it, equality compares **values**, and it prints itself."
      ] },
      page("Core idea"),
      run("first", "a record in one line", 'var a = new Point(3, 4);\nvar b = new Point(3, 4);\nConsole.WriteLine(a);\nConsole.WriteLine(a == b);\nConsole.WriteLine(a.X + a.Y);\n\nrecord Point(int X, int Y);'),
      { ul: [
        "`record Point(int X, int Y);` — the **positional** form: a constructor and get-only (init) properties X and Y.",
        "`a == b` is **True**: records compare every property's value.",
        "`Console.WriteLine(a)` prints `Point { X = 3, Y = 4 }`."
      ] },
      run("with", "with copies and changes — the original is untouched", 'var p = new Person("Ada", 16);\nvar older = p with { Age = 17 };\nConsole.WriteLine(p);\nConsole.WriteLine(older);\nConsole.WriteLine(ReferenceEquals(p, older));\n\nrecord Person(string Name, int Age);'),
      page("Rules"),
      { ul: [
        "`record` is a class with value equality (`record class` says the same thing); `record struct` is a struct version.",
        "Positional properties are **init-only**: set when created, then read-only. A record is meant to be immutable.",
        "`with { P = v }` makes a **new** record, copying every value and changing the ones listed.",
        "`==`, `Equals` and `GetHashCode` compare every property, so records work as Dictionary keys and in a HashSet.",
        "A positional record can be **deconstructed**: `var (x, y) = point;`.",
        "A record may add members and validation in a body, like any class, and may inherit from another record."
      ] },
      page("Variations"),
      { h: "Records in a HashSet" },
      run("set", "duplicates by value disappear", 'var visited = new HashSet<Point> { new(0, 0), new(1, 2), new(0, 0), new(1, 2), new(5, 5) };\nConsole.WriteLine(visited.Count);\nConsole.WriteLine(visited.Contains(new Point(5, 5)));\n\nrecord Point(int X, int Y);'),
      { h: "Deconstruction" },
      run("deconstruct", "take a record apart into variables", 'var r = new Range(3, 9);\nvar (lo, hi) = r;\nConsole.WriteLine($"{lo}..{hi}, width {hi - lo}");\n\nrecord Range(int Low, int High);'),
      { h: "A body with validation and extra members" },
      run("body", "a record can still keep its rules", 'var t = new Temp(21.5);\nConsole.WriteLine($"{t.Celsius} C = {t.Fahrenheit} F");\ntry { var bad = new Temp(-300); }\ncatch (ArgumentOutOfRangeException) { Console.WriteLine("below absolute zero"); }\n\nrecord Temp(double Celsius)\n{\n    public double Celsius { get; } = Celsius >= -273.15 ? Celsius : throw new ArgumentOutOfRangeException(nameof(Celsius));\n    public double Fahrenheit => Celsius * 9 / 5 + 32;\n}'),
      { h: "Class or record?" },
      run("compare", "the same data, two kinds of equality", 'var c1 = new CPoint { X = 1 };\nvar c2 = new CPoint { X = 1 };\nvar r1 = new RPoint(1);\nvar r2 = new RPoint(1);\nConsole.WriteLine($"class {c1 == c2}, record {r1 == r2}");\n\nclass CPoint { public int X { get; init; } }\nrecord RPoint(int X);'),
      page("Pitfalls"),
      { h: "Assigning a positional property — CS8852" },
      run("pit-init", "init-only: use with instead", 'var p = new Point(1, 2);\np.X = 5;\n\nrecord Point(int X, int Y);'),
      { h: "A list inside a record compares by reference" },
      run("pit-list", "two equal-looking records are not equal", 'var a = new Order("Ada", new List<string> { "tea" });\nvar b = new Order("Ada", new List<string> { "tea" });\nConsole.WriteLine(a == b);\n\nrecord Order(string Who, List<string> Items);'),
      { h: "with is shallow" },
      "`with` copies the reference to a list, not the list: change `copy.Items` and the original changes too. Keep records' members immutable (strings, numbers, other records, `IReadOnlyList`).",
      page("Connections"),
      { ul: [ "**Back:** 7.6 references and equality; 5.x tuples did a similar job without names.", "**Next:** 8.8 records and structs as value types; 8.10 patterns take records apart; 11.2 JSON reads and writes records directly.", "**AQA:** 4.2.1.3 records and fields." ] },
      page("Good practice"),
      { ul: [ "Data that is compared by value and does not change → record.", "Something with an identity and a life (an account, a game) → class.", "Keep record members immutable; use with for changes." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Next year's edition* and *Unique points*." ] },
      page("Quick reference"),
      run("qr", "records at a glance", 'var b = new Book("Dune", 1965);\nvar c = b with { Year = 2021 };\nvar (title, year) = c;\nConsole.WriteLine($"{b == c} {title} {year}");\n\nrecord Book(string Title, int Year);'),
      { ul: [ "`record T(A a, B b);` — properties, constructor, equality, ToString.", "`x with { B = v }` — a changed copy.", "`var (a, b) = x;` — deconstruct." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS8852", "an init-only property set after creation", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var a = new Card("hearts", 5);\nvar b = a with { Rank = 6 };\nvar c = b with { Rank = 5 };\nConsole.WriteLine($"{a == b} {a == c}");\n\nrecord Card(string Suit, int Rank);', why: "b differs in Rank; c has the same values as a.", concepts: ["records"] },
        { id: "p2", src: 'var d = new Dictionary<Pt, string> { [new Pt(1, 1)] = "home" };\nConsole.WriteLine(d[new Pt(1, 1)]);\n\nrecord Pt(int X, int Y);', why: "Equal records hash alike, so a new Pt(1, 1) finds the key.", concepts: ["records"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap to make a copy of p with Age 30.", src: 'var p = new Person("Kai", 29);\nvar q = @@;\nConsole.WriteLine(q.Age);\n\nrecord Person(string Name, int Age);', out: "30", concepts: ["records"] }
      ],
      bug: [
        { id: "b1", q: "Two points with the same coordinates should count once: it should print 2.", src: 'var set = new HashSet<Point> { new Point { X = 1, Y = 1 }, new Point { X = 1, Y = 1 }, new Point { X = 2, Y = 0 } };\nConsole.WriteLine(set.Count);\n\nclass Point\n{\n    public int X { get; init; }\n    public int Y { get; init; }\n}', out: "2", fixedText: "prints 2", why: "A class compares by reference, so all three are different. Declare `record Point(int X, int Y);` (and create with new Point(1, 1)).", concepts: ["records"] }
      ]
    },
    flashcards: [
      ["What does `==` compare for records?", "Every property's value."],
      ["What does `x with { A = 1 }` do?", "Makes a new record copying x, with A changed."],
      ["What does a positional record give you?", "A constructor, init-only properties, equality, deconstruction and ToString."],
      ["Can you set a positional property after creation?", "No — it is init-only (CS8852)."],
      ["When to choose a record over a class?", "For data compared by value that does not change."],
      ["Why can records be Dictionary keys?", "Equal values give equal hash codes."]
    ],
    quiz: [
      { q: "`new P(1,2) == new P(1,2)` with `record P(int X, int Y)` is…", opts: ["False", "True", "an error", "it depends"], ans: 1, why: "Records compare values." },
      { q: "After `var b = a with { X = 5 };`, a.X is…", opts: ["5", "unchanged", "0", "an error"], ans: 1, why: "with makes a copy; the original stays." },
      { q: "Which suits a record best?", opts: ["a bank account", "a game session", "a 2D point", "a logger"], ans: 2, why: "Pure data, compared by value." }
    ]
  });
  K.add({ tasks: {
    "8.7-edition": { lesson: "8.7", title: "Next year's edition", tier: "warm-up", minutes: 10, concepts: ["records"],
      statement: ["Declare `record Book(string Title, string Author, int Year);`.", "Read a title, an author and a year (three lines). Print the book, then a copy made with `with` whose year is one later, then whether the two are equal."],
      starter: 'string title = Console.ReadLine() ?? "";\nstring author = Console.ReadLine() ?? "";\nint year = int.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "Dune\nHerbert\n1965", out: "Book { Title = Dune, Author = Herbert, Year = 1965 }\nBook { Title = Dune, Author = Herbert, Year = 1966 }\nFalse" }],
      hidden: [{ stdin: "Emma\nAusten\n1815", out: "Book { Title = Emma, Author = Austen, Year = 1815 }\nBook { Title = Emma, Author = Austen, Year = 1816 }\nFalse" }],
      rules: [uses(/record\s+Book\s*\(/, "Declare the record Book."), uses(/\bwith\s*\{/, "Make the copy with `with`.", "with")],
      hints: ["record Book(string Title, string Author, int Year);", "var b = new Book(title, author, year);", "var next = b with { Year = b.Year + 1 }; Console.WriteLine(b == next);"],
      answer: 'string title = Console.ReadLine() ?? "";\nstring author = Console.ReadLine() ?? "";\nint year = int.Parse(Console.ReadLine() ?? "0");\nvar b = new Book(title, author, year);\nvar next = b with { Year = b.Year + 1 };\nConsole.WriteLine(b);\nConsole.WriteLine(next);\nConsole.WriteLine(b == next);\n\nrecord Book(string Title, string Author, int Year);' },
    "8.7-unique": { lesson: "8.7", title: "Unique points", tier: "core", minutes: 15, concepts: ["records"],
      statement: ["Declare `record Point(int X, int Y)`. Read lines `X Y` until the end.", "Print how many **different** points there were, then the first point that appeared twice (as the record prints itself), or `no repeats`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "0 0\n1 2\n0 0\n1 2", out: "2\nPoint { X = 0, Y = 0 }" }],
      hidden: [{ stdin: "3 3\n4 4", out: "2\nno repeats" }, { stdin: "1 1\n2 2\n2 2\n1 1", out: "2\nPoint { X = 2, Y = 2 }" }],
      rules: [uses(/record\s+Point\s*\(/, "Declare the record Point."), uses(/HashSet<\s*Point\s*>/, "Use a HashSet<Point>.", "set")],
      hints: ["var seen = new HashSet<Point>(); Point? repeat = null;", "if (!seen.Add(p) && repeat is null) repeat = p;", "Console.WriteLine(seen.Count); Console.WriteLine(repeat?.ToString() ?? \"no repeats\");"],
      answer: 'var seen = new HashSet<Point>();\nPoint? repeat = null;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    var pt = new Point(int.Parse(p[0]), int.Parse(p[1]));\n    if (!seen.Add(pt) && repeat is null) repeat = pt;\n}\nConsole.WriteLine(seen.Count);\nConsole.WriteLine(repeat?.ToString() ?? "no repeats");\n\nrecord Point(int X, int Y);' }
  } });

  /* ================================================================
     8.8 Value and reference types: the stack and the heap
     ================================================================ */
  lesson("8.8", {
    aqa: "4.1.1.15",
    notes: [
      page("The problem it solves"),
      { ul: [
        "`int b = a; b++;` leaves `a` alone, but `var y = x; y.N++;` on an object changed `x` too (7.6). Why the difference?",
        "C# has two kinds of type. A **value type** variable holds the value itself; a **reference type** variable holds a reference to an object that lives elsewhere.",
        "Knowing which is which explains copying, method arguments, equality and much of performance."
      ] },
      page("Core idea"),
      run("copy", "a struct is copied; a class is shared", 'var s1 = new PointS { X = 1 };\nvar s2 = s1;\ns2.X = 99;\nvar c1 = new PointC { X = 1 };\nvar c2 = c1;\nc2.X = 99;\nConsole.WriteLine($"struct: {s1.X}, class: {c1.X}");\n\nstruct PointS { public int X; }\nclass PointC { public int X; }'),
      { ul: [
        "`struct` declares a **value type**: `s2 = s1` copies every field.",
        "`class` declares a **reference type**: `c2 = c1` copies the reference; both name one object.",
        "Value types: int, double, bool, char, decimal, enums, structs, tuples, `record struct`. Reference types: classes, records, strings, arrays, lists, interfaces, delegates."
      ] },
      run("method", "arguments are copied in too", 'var s = new Box { N = 1 };\nvar c = new Bag { N = 1 };\nBumpBox(s);\nBumpBag(c);\nConsole.WriteLine($"{s.N} {c.N}");\n\nstatic void BumpBox(Box b) => b.N++;\nstatic void BumpBag(Bag b) => b.N++;\n\nstruct Box { public int N; }\nclass Bag { public int N; }'),
      page("Rules"),
      { ul: [
        "**The stack**: each method call gets a frame for its parameters and local variables; it is freed the moment the method returns (4.1.1.15). Locals of value types live there.",
        "**The heap**: every object made with `new` from a class (and every array and string) lives on the heap; a variable holds only its reference.",
        "A value type stored **inside** an object (a field, an array element) lives inside that object, on the heap.",
        "The **garbage collector** frees heap objects no live reference can reach; you never free memory yourself. That is why a stack frame can vanish safely while the objects it created live on.",
        "A struct is copied on assignment, on passing and on returning; keep structs small (a few fields) and immutable.",
        "`ref` passes the variable itself instead of a copy; `out` is a `ref` the method must assign."
      ] },
      { table: { head: ["", "Value type", "Reference type"], rows: [["Variable holds", "the value", "a reference to an object"], ["`b = a`", "copies the value", "copies the reference"], ["Default", "zeros (0, false)", "null"], ["Declared with", "struct, enum, record struct", "class, record, interface, delegate"], ["`==` by default", "compares values (built-in types)", "same object (except string and records)"]] } },
      page("Variations"),
      { h: "ref: pass the variable itself" },
      run("ref", "Swap needs the caller's variables, not copies", 'int a = 3, b = 8;\nSwap(ref a, ref b);\nConsole.WriteLine($"{a} {b}");\n\nstatic void Swap(ref int x, ref int y) => (x, y) = (y, x);'),
      { h: "Arrays are reference types — even of ints" },
      run("array", "the method changes the caller\'s array", 'int[] scores = { 1, 2, 3 };\nDouble(scores);\nConsole.WriteLine(string.Join(" ", scores));\n\nstatic void Double(int[] xs)\n{\n    for (int i = 0; i < xs.Length; i++) xs[i] *= 2;\n}'),
      { h: "Strings: a reference type that behaves like a value" },
      run("string", "every change makes a new string", 'string a = "cat";\nstring b = a;\nb += "s";\nConsole.WriteLine($"{a} {b}");\nConsole.WriteLine("ca" + "t" == a);'),
      { h: "Boxing" },
      run("boxing", "putting a value into object copies it into a box on the heap", 'int n = 5;\nobject box = n;\nn = 6;\nConsole.WriteLine($"{n} {box}");\nConsole.WriteLine((int)box + 1);'),
      page("Pitfalls"),
      { h: "Changing a struct inside a List — CS1612" },
      run("pit-list", "list[0] returns a copy, so the change would be lost", 'var pts = new List<Pos> { new Pos { X = 1 } };\npts[0].X = 5;\n\nstruct Pos { public int X; }'),
      { h: "Changing the foreach variable of a struct — CS1654" },
      run("pit-foreach", "the loop variable is a read-only copy", 'var pts = new[] { new Pos(), new Pos() };\nforeach (var p in pts) p.X = 1;\n\nstruct Pos { public int X; }'),
      { h: "A struct method that changes a copy" },
      run("pit-copy", "Move ran on a copy returned by the property", 'var robot = new Robot();\nrobot.At.Move();\nConsole.WriteLine(robot.At.X);\n\nclass Robot { public Pos At { get; set; } }\nstruct Pos { public int X; public void Move() => X++; }'),
      page("Connections"),
      { ul: [ "**Back:** 7.6 references and equality; 3.x parameters (value, ref, out); 4.1.1.15 stack frames.", "**Next:** 8.9 a Vector struct; 12.6 stack frames in recursion; D1 memory and the garbage collector.", "**AQA:** 4.1.1.15 the role of stack frames; 4.1.1.11 parameters by value and by reference." ] },
      page("Good practice"),
      { ul: [ "Struct only for small, immutable values (a point, a money amount): `readonly struct` or `readonly record struct`.", "Everything else a class (or record).", "Prefer returning a new value to `ref` parameters; use `ref` when the method genuinely exchanges values." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Copied or shared?* and *Swap and sort three*." ] },
      page("Quick reference"),
      run("qr", "value and reference side by side", 'var v = new V(1);\nvar w = v with { N = 2 };\nint[] arr = { 1 };\nint[] same = arr;\nsame[0] = 2;\nConsole.WriteLine($"{v.N} {w.N} {arr[0]}");\n\nreadonly record struct V(int N);'),
      { ul: [ "struct / record struct / built-ins → copied.", "class / record / array / string → reference.", "`ref` to pass the variable; the stack for frames, the heap for objects." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1612", "a struct returned by an indexer or property cannot be changed in place", "Pitfalls"], ["CS1654", "a foreach variable is read-only", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var a = new S { N = 1 };\nvar arr = new[] { a, a };\narr[0].N = 7;\nConsole.WriteLine($"{a.N} {arr[0].N} {arr[1].N}");\n\nstruct S { public int N; }', why: "Each array slot holds its own copy; changing slot 0 touches nothing else.", concepts: ["value-reference", "structs"] },
        { id: "p2", src: 'int x = 1;\nAdd(x);\nAddRef(ref x);\nConsole.WriteLine(x);\n\nstatic void Add(int n) => n += 10;\nstatic void AddRef(ref int n) => n += 100;', why: "Add changes a copy; AddRef changes x itself: 101.", concepts: ["value-reference"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so Reset sets the caller's variable to 0.", src: 'int score = 42;\nReset(ref score);\nConsole.WriteLine(score);\n\nstatic void Reset(@@ n) => n = 0;', out: "0", concepts: ["value-reference"] }
      ],
      bug: [
        { id: "b1", q: "Each tick should move the robot: after two ticks it should print 2.", src: 'var r = new Robot();\nr.Tick();\nr.Tick();\nConsole.WriteLine(r.Place.X);\n\nclass Robot\n{\n    public Pos Place;\n    public void Tick() { var p = Place; p.X++; }\n}\nstruct Pos { public int X; }', out: "2", fixedText: "prints 2", why: "`var p = Place;` copied the struct; change the field itself: Place.X++;", concepts: ["structs"] }
      ]
    },
    flashcards: [
      ["What does a value-type variable hold?", "The value itself."],
      ["What does a reference-type variable hold?", "A reference to an object on the heap."],
      ["Where do a method's local value-type variables live?", "In its stack frame, freed when the method returns."],
      ["Who frees heap objects?", "The garbage collector, once nothing can reach them."],
      ["What does `ref` do to an argument?", "Passes the caller's variable itself, not a copy."],
      ["What is boxing?", "Copying a value type into an object on the heap (`object o = 5;`)."]
    ],
    quiz: [
      { q: "`var b = a;` with a struct, then `b.X = 9;` — a.X…", opts: ["becomes 9", "is unchanged", "becomes 0", "is an error"], ans: 1, why: "Structs are copied on assignment." },
      { q: "An int[] passed to a method that doubles each element…", opts: ["changes the caller's array", "changes a copy", "is an error", "boxes"], ans: 0, why: "Arrays are reference types." },
      { q: "Which is a value type?", opts: ["string", "List<int>", "decimal", "int[]"], ans: 2, why: "decimal is a struct." }
    ]
  });
  K.add({ tasks: {
    "8.8-copy": { lesson: "8.8", title: "Copied or shared?", tier: "warm-up", minutes: 10, concepts: ["value-reference", "structs"],
      statement: ["Write `struct Tally { public int N; }` and `class Counter { public int N; }`.", "Read a number K. Make one of each starting at 0, copy each into a second variable, add K to the **copies** only, and print `struct A B` and `class C D` (original then copy)."],
      starter: 'int k = int.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "5", out: "struct 0 5\nclass 5 5" }],
      hidden: [{ stdin: "0", out: "struct 0 0\nclass 0 0" }, { stdin: "12", out: "struct 0 12\nclass 12 12" }],
      rules: [uses(/struct\s+Tally/, "Declare the struct Tally."), uses(/class\s+Counter/, "Declare the class Counter.", "class")],
      hints: ["var t1 = new Tally(); var t2 = t1; t2.N += k;", "var c1 = new Counter(); var c2 = c1; c2.N += k;", "Console.WriteLine($\"struct {t1.N} {t2.N}\");"],
      answer: 'int k = int.Parse(Console.ReadLine() ?? "0");\nvar t1 = new Tally();\nvar t2 = t1;\nt2.N += k;\nvar c1 = new Counter();\nvar c2 = c1;\nc2.N += k;\nConsole.WriteLine($"struct {t1.N} {t2.N}");\nConsole.WriteLine($"class {c1.N} {c2.N}");\n\nstruct Tally { public int N; }\nclass Counter { public int N; }' },
    "8.8-swap": { lesson: "8.8", title: "Swap and sort three", tier: "core", minutes: 15, concepts: ["value-reference"],
      statement: ["Write `static void Swap(ref int a, ref int b)`.", "Read three whole numbers on one line. Using only comparisons and `Swap`, put them in order in the variables `a`, `b`, `c`, and print them smallest first."],
      starter: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\nint a = int.Parse(p[0]), b = int.Parse(p[1]), c = int.Parse(p[2]);\n',
      examples: [{ stdin: "3 1 2", out: "1 2 3" }],
      hidden: [{ stdin: "9 8 7", out: "7 8 9" }, { stdin: "1 1 0", out: "0 1 1" }, { stdin: "-2 5 -9", out: "-9 -2 5" }],
      rules: [uses(/void\s+Swap\s*\(\s*ref\s+int/, "Write Swap(ref int a, ref int b)."), uses(/Swap\s*\(\s*ref\s+\w+\s*,\s*ref/, "Call Swap with ref.", "call"), { id: "nosort", test: function (s) { return !/Sort|OrderBy|Math\.(Min|Max)/.test(s); }, msg: "Order them with Swap, not Sort or Min/Max." }],
      hints: ["static void Swap(ref int x, ref int y) => (x, y) = (y, x);", "if (a > b) Swap(ref a, ref b); if (b > c) Swap(ref b, ref c);", "…then compare a and b once more."],
      answer: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\nint a = int.Parse(p[0]), b = int.Parse(p[1]), c = int.Parse(p[2]);\nif (a > b) Swap(ref a, ref b);\nif (b > c) Swap(ref b, ref c);\nif (a > b) Swap(ref a, ref b);\nConsole.WriteLine($"{a} {b} {c}");\n\nstatic void Swap(ref int x, ref int y) => (x, y) = (y, x);' }
  } });

  /* ================================================================
     8.9 Operator overloading: a vector type
     ================================================================ */
  lesson("8.9", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "A game moves things with vectors: position plus velocity, velocity times time. With methods it reads `pos.Add(vel.Scale(dt))`.",
        "Maths writes `pos + vel * dt`. **Operator overloading** lets your own type use `+`, `-`, `*` and `==` with the meaning it has in maths.",
        "A vector is also a perfect small value: a **struct**."
      ] },
      page("Core idea"),
      run("vector", "a Vector struct with + and -", 'var a = new Vector(1, 2);\nvar b = new Vector(3, -1);\nConsole.WriteLine(a + b);\nConsole.WriteLine(a - b);\n\nreadonly struct Vector\n{\n    public double X { get; }\n    public double Y { get; }\n    public Vector(double x, double y) { X = x; Y = y; }\n    public static Vector operator +(Vector a, Vector b) => new(a.X + b.X, a.Y + b.Y);\n    public static Vector operator -(Vector a, Vector b) => new(a.X - b.X, a.Y - b.Y);\n    public override string ToString() => $"({X}, {Y})";\n}'),
      { ul: [
        "`public static Vector operator +(Vector a, Vector b)` — an operator is a **public static** method named `operator` + the symbol.",
        "It returns a **new** vector; neither operand changes. `readonly struct` makes that a rule.",
        "At least one parameter must be the type being declared."
      ] },
      run("scale", "scalar * in both orders, length and the dot product", 'var v = new Vector(3, 4);\nConsole.WriteLine(v * 2);\nConsole.WriteLine(0.5 * v);\nConsole.WriteLine(v.Length);\nConsole.WriteLine(Vector.Dot(v, new Vector(1, 0)));\n\nreadonly struct Vector\n{\n    public double X { get; }\n    public double Y { get; }\n    public Vector(double x, double y) { X = x; Y = y; }\n    public static Vector operator *(Vector v, double k) => new(v.X * k, v.Y * k);\n    public static Vector operator *(double k, Vector v) => v * k;\n    public double Length => Math.Sqrt(X * X + Y * Y);\n    public static double Dot(Vector a, Vector b) => a.X * b.X + a.Y * b.Y;\n    public override string ToString() => $"({X}, {Y})";\n}'),
      page("Rules"),
      { ul: [
        "Overloadable: `+ - * / %`, unary `- ! ~ ++ --`, comparisons `== != < > <= >=`, and `true`/`false`. Not: `=`, `&&`, `||`, `?:`, `.`.",
        "Operators are `public static`; a binary one takes two parameters, a unary one one.",
        "`v * 2` and `2 * v` are different overloads: write both if both should work.",
        "`==` and `!=` come in pairs, as do `<` and `>`, `<=` and `>=`. Overloading `==` means overriding `Equals` and `GetHashCode` too.",
        "A `record struct` already has `==` by value: add only the arithmetic.",
        "`+=` comes free once `+` exists."
      ] },
      { table: { head: ["Maths", "C#"], rows: [["a + b", "(a.X + b.X, a.Y + b.Y)"], ["k a", "(k·a.X, k·a.Y)"], ["|a|", "√(X² + Y²)"], ["a · b", "a.X·b.X + a.Y·b.Y"]] } },
      page("Variations"),
      { h: "A record struct: equality free" },
      run("record", "== compares X and Y without writing it", 'var a = new Vec(1, 2);\nvar b = new Vec(0, 1) + new Vec(1, 1);\nConsole.WriteLine(a == b);\nConsole.WriteLine(-a);\n\nreadonly record struct Vec(int X, int Y)\n{\n    public static Vec operator +(Vec a, Vec b) => new(a.X + b.X, a.Y + b.Y);\n    public static Vec operator -(Vec v) => new(-v.X, -v.Y);\n}'),
      { h: "Movement with +=" },
      run("move", "position += velocity, five times", 'var pos = new Vec(0, 0);\nvar vel = new Vec(2, 1);\nfor (int t = 0; t < 5; t++) pos += vel;\nConsole.WriteLine(pos);\n\nreadonly record struct Vec(int X, int Y)\n{\n    public static Vec operator +(Vec a, Vec b) => new(a.X + b.X, a.Y + b.Y);\n}'),
      { h: "Comparison operators: money" },
      run("money", "< and > for a Money type, held in pence", 'var a = new Money(250);\nvar b = new Money(199);\nConsole.WriteLine(a + b);\nConsole.WriteLine(a > b);\n\nreadonly record struct Money(int Pence)\n{\n    public static Money operator +(Money a, Money b) => new(a.Pence + b.Pence);\n    public static bool operator >(Money a, Money b) => a.Pence > b.Pence;\n    public static bool operator <(Money a, Money b) => a.Pence < b.Pence;\n    public override string ToString() => $"£{Pence / 100}.{Pence % 100:D2}";\n}'),
      page("Pitfalls"),
      { h: "An operator that is not public static — CS0558" },
      run("pit-static", "operators belong to the type", 'Console.WriteLine("vectors");\n\nstruct V\n{\n    public int X;\n    public V operator +(V a, V b) => new V { X = a.X + b.X };\n}'),
      { h: "== on a struct that has none — CS0019" },
      run("pit-eq", "a plain struct has no ==", 'var a = new V { X = 1 };\nvar b = new V { X = 1 };\nConsole.WriteLine(a == b);\n\nstruct V { public int X; }'),
      { h: "== without != — CS0216" },
      run("pit-pair", "the pair must come together", 'Console.WriteLine("money");\n\nstruct M\n{\n    public int P;\n    public static bool operator ==(M a, M b) => a.P == b.P;\n    public override bool Equals(object? o) => o is M m && m.P == P;\n    public override int GetHashCode() => P;\n}'),
      page("Connections"),
      { ul: [ "**Back:** 8.8 structs and value semantics; Maths: vectors (P10 in your Maths spec).", "**Next:** T8 game development uses vectors for motion; 12.13 A* uses distances.", "**AQA:** 4.1.2.3 objects with their own operations; vectors appear in 4.3.4.x." ] },
      page("Good practice"),
      { ul: [ "Overload an operator only when its meaning is obvious (vector +, money +). Never make + do something surprising.", "Small mathematical values: `readonly record struct` plus the operators.", "Keep operators pure: return a new value, change nothing." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Vector arithmetic* and *A till in pence*." ] },
      page("Quick reference"),
      run("qr", "an operator at a glance", 'var a = new P(1, 1);\nConsole.WriteLine(a + a == new P(2, 2));\n\nreadonly record struct P(int X, int Y)\n{\n    public static P operator +(P a, P b) => new(a.X + b.X, a.Y + b.Y);\n}'),
      { ul: [ "`public static T operator +(T a, T b) => …;`", "Write `T * double` and `double * T` separately.", "`record struct` gives == and !=." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0558", "an operator must be public and static", "Pitfalls"], ["CS0019", "no operator defined for these types", "Pitfalls"], ["CS0216", "== needs a matching !=", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var a = new V(1, 2);\nvar b = new V(2, 3);\nConsole.WriteLine(2 * a + b);\n\nreadonly record struct V(int X, int Y)\n{\n    public static V operator +(V a, V b) => new(a.X + b.X, a.Y + b.Y);\n    public static V operator *(int k, V v) => new(k * v.X, k * v.Y);\n}', why: "2a = (2, 4); plus b = (4, 7); a record struct prints as V { X = 4, Y = 7 }.", concepts: ["operators"] },
        { id: "p2", src: 'var v = new V(6, 8);\nConsole.WriteLine(v.Len);\n\nreadonly record struct V(double X, double Y) { public double Len => Math.Sqrt(X * X + Y * Y); }', why: "√(36 + 64) = 10.", concepts: ["operators"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so two Coins can be added.", src: 'var t = new Coin(20) + new Coin(5);\nConsole.WriteLine(t.Pence);\n\nreadonly record struct Coin(int Pence)\n{\n    public static Coin @@(Coin a, Coin b) => new(a.Pence + b.Pence);\n}', out: "25", concepts: ["operators"] }
      ],
      bug: [
        { id: "b1", q: "a - b should be (−2, 3): it should print V { X = -2, Y = 3 }.", src: 'var a = new V(1, 4);\nvar b = new V(3, 1);\nConsole.WriteLine(a - b);\n\nreadonly record struct V(int X, int Y)\n{\n    public static V operator -(V a, V b) => new(b.X - a.X, b.Y - a.Y);\n}', out: "V { X = -2, Y = 3 }", fixedText: "prints V { X = -2, Y = 3 }", why: "The operands are the wrong way round: a.X - b.X, a.Y - b.Y.", concepts: ["operators"] }
      ]
    },
    flashcards: [
      ["How is an operator declared?", "`public static T operator +(T a, T b) => …;`"],
      ["Why write both `T * double` and `double * T`?", "They are separate overloads; each order needs its own."],
      ["What must accompany an overloaded ==?", "!= , plus Equals and GetHashCode overrides."],
      ["Which operators cannot be overloaded?", "=, &&, ||, ?: and member access ."],
      ["Why make a vector a readonly struct?", "A small immutable value: copies are cheap and nothing changes underneath you."],
      ["What does a record struct give a Vector for free?", "Value equality (== and !=), ToString and deconstruction."]
    ],
    quiz: [
      { q: "An overloaded operator must be…", opts: ["private", "public static", "virtual", "abstract"], ans: 1, why: "Operators belong to the type." },
      { q: "Once + is defined, `a += b`…", opts: ["needs its own overload", "works automatically", "is an error", "changes b"], ans: 1, why: "+= is rewritten as a = a + b." },
      { q: "The dot product of (3, 4) and (1, 0) is…", opts: ["5", "3", "7", "(3, 0)"], ans: 1, why: "3·1 + 4·0 = 3." }
    ]
  });
  K.add({ tasks: {
    "8.9-vector": { lesson: "8.9", title: "Vector arithmetic", tier: "core", minutes: 20, concepts: ["operators", "structs"],
      statement: ["Write `readonly struct Vector` with `X`, `Y`, operators `+`, `-`, `Vector * double` and `double * Vector`, a `Length` property and a static `Dot`.", "Read two vectors (`X Y`, two lines) and a number k. Print `a+b`, `a-b`, `k*a`, the dot product and `|a|` — each vector as `(X, Y)` and every number with 2 decimals."],
      starter: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\nstring[] q = (Console.ReadLine() ?? "").Split(\' \');\ndouble k = double.Parse(Console.ReadLine() ?? "1");\n',
      examples: [{ stdin: "3 4\n1 -2\n2", out: "(4.00, 2.00)\n(2.00, 6.00)\n(6.00, 8.00)\n-5.00\n5.00" }],
      hidden: [{ stdin: "0 0\n0 0\n10", out: "(0.00, 0.00)\n(0.00, 0.00)\n(0.00, 0.00)\n0.00\n0.00" }, { stdin: "1.5 2\n-1 0.5\n-1", out: "(0.50, 2.50)\n(2.50, 1.50)\n(-1.50, -2.00)\n-0.50\n2.50" }],
      rules: [uses(/struct\s+Vector/, "Declare the struct Vector."), uses(/operator\s*\+/, "Overload +.", "plus"), uses(/operator\s*\*\s*\(\s*double/, "Overload double * Vector.", "scale"), uses(/\d\s*\*\s*a\b|k\s*\*\s*a\b/, "Print k * a with the scalar first.", "use")],
      hints: ["public static Vector operator +(Vector a, Vector b) => new(a.X + b.X, a.Y + b.Y);", "public static Vector operator *(double k, Vector v) => new(k * v.X, k * v.Y);", "public override string ToString() => $\"({X:F2}, {Y:F2})\";"],
      answer: 'string[] p = (Console.ReadLine() ?? "").Split(\' \');\nstring[] q = (Console.ReadLine() ?? "").Split(\' \');\ndouble k = double.Parse(Console.ReadLine() ?? "1");\nvar a = new Vector(double.Parse(p[0]), double.Parse(p[1]));\nvar b = new Vector(double.Parse(q[0]), double.Parse(q[1]));\nConsole.WriteLine(a + b);\nConsole.WriteLine(a - b);\nConsole.WriteLine(k * a);\nConsole.WriteLine($"{Vector.Dot(a, b):F2}");\nConsole.WriteLine($"{a.Length:F2}");\n\nreadonly struct Vector\n{\n    public double X { get; }\n    public double Y { get; }\n    public Vector(double x, double y) { X = x; Y = y; }\n    public static Vector operator +(Vector a, Vector b) => new(a.X + b.X, a.Y + b.Y);\n    public static Vector operator -(Vector a, Vector b) => new(a.X - b.X, a.Y - b.Y);\n    public static Vector operator *(Vector v, double k) => new(v.X * k, v.Y * k);\n    public static Vector operator *(double k, Vector v) => v * k;\n    public double Length => Math.Sqrt(X * X + Y * Y);\n    public static double Dot(Vector a, Vector b) => a.X * b.X + a.Y * b.Y;\n    public override string ToString() => $"({X:F2}, {Y:F2})";\n}' },
    "8.9-till": { lesson: "8.9", title: "A till in pence", tier: "stretch", minutes: 25, concepts: ["operators", "structs"],
      statement: ["Write `readonly record struct Money(int Pence)` with `+`, `-`, `*` by a whole number, `>` and `<`, and a `ToString()` that prints `£P.pp` (negative amounts as `-£P.pp`).", "Read prices as `P.pp` with a quantity (`2.50 x3`) one per line until a line `paid P.pp`. Print the total, then the change (paid − total) — or `short by £…` when the payment is less."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "2.50 x3\n0.99 x1\npaid 10.00", out: "total £8.49\nchange £1.51" }],
      hidden: [{ stdin: "4.00 x2\npaid 5.00", out: "total £8.00\nshort by £3.00" }, { stdin: "0.05 x10\npaid 0.50", out: "total £0.50\nchange £0.00" }],
      rules: [uses(/record\s+struct\s+Money/, "Declare Money as a record struct."), uses(/operator\s*\*/, "Overload * for quantities.", "mul"), uses(/operator\s*</, "Overload < (and >).", "lt")],
      hints: ["static Money Parse(string s) { var p = s.Split('.'); return new Money(int.Parse(p[0]) * 100 + int.Parse(p[1])); }", "public override string ToString() => (Pence < 0 ? \"-\" : \"\") + $\"£{Math.Abs(Pence) / 100}.{Math.Abs(Pence) % 100:D2}\";", "if (paid < total) Console.WriteLine($\"short by {total - paid}\"); else Console.WriteLine($\"change {paid - total}\");"],
      answer: 'var total = new Money(0);\nvar paid = new Money(0);\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] w = line.Split(\' \');\n    if (w[0] == "paid") { paid = Money.Parse(w[1]); break; }\n    total += Money.Parse(w[0]) * int.Parse(w[1].TrimStart(\'x\'));\n}\nConsole.WriteLine($"total {total}");\nConsole.WriteLine(paid < total ? $"short by {total - paid}" : $"change {paid - total}");\n\nreadonly record struct Money(int Pence)\n{\n    public static Money Parse(string s)\n    {\n        string[] p = s.Split(\'.\');\n        return new Money(int.Parse(p[0]) * 100 + int.Parse(p[1]));\n    }\n    public static Money operator +(Money a, Money b) => new(a.Pence + b.Pence);\n    public static Money operator -(Money a, Money b) => new(a.Pence - b.Pence);\n    public static Money operator *(Money a, int n) => new(a.Pence * n);\n    public static bool operator >(Money a, Money b) => a.Pence > b.Pence;\n    public static bool operator <(Money a, Money b) => a.Pence < b.Pence;\n    public override string ToString() => (Pence < 0 ? "-" : "") + $"£{Math.Abs(Pence) / 100}.{Math.Abs(Pence) % 100:D2}";\n}' }
  } });

  /* ================================================================
     8.10 Pattern matching
     ================================================================ */
  lesson("8.10", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Grading a score, naming a shape or deciding rock-paper-scissors used long if-else chains with casts and `&&` everywhere.",
        "A **pattern** describes the shape a value must have: a type, a range, some property values, a list. `is` tests one pattern; a **switch expression** picks the first that matches.",
        "The test, the cast and the naming happen in one step — and the compiler warns when a case is missing."
      ] },
      page("Core idea"),
      run("grade", "relational patterns in a switch expression", 'foreach (int score in new[] { 95, 72, 61, 30 })\n    Console.WriteLine($"{score} {Grade(score)}");\n\nstatic string Grade(int s) => s switch\n{\n    >= 90 => "A*",\n    >= 70 => "A",\n    >= 60 => "B",\n    _ => "retake"\n};'),
      { ul: [
        "`value switch { pattern => result, … }` is an **expression**: it produces a value.",
        "Arms are tried top to bottom; the first match wins.",
        "`_` is the **discard**: it matches anything, so it goes last."
      ] },
      run("types", "type patterns name the value as they test it", 'object[] things = { 3, "hello", 2.5, true, new Circle(1) };\nforeach (var t in things)\n    Console.WriteLine(Describe(t));\n\nstatic string Describe(object o) => o switch\n{\n    int n when n < 0 => "a negative int",\n    int n => $"the int {n}",\n    string s => $"text of length {s.Length}",\n    double d => $"the double {d}",\n    Circle c => $"a circle of radius {c.R}",\n    _ => $"something else: {o}"\n};\n\nrecord Circle(double R);'),
      page("Rules"),
      { table: { head: ["Pattern", "Example", "Matches"], rows: [
        ["constant", "`0`, `\"yes\"`, `null`", "that exact value"],
        ["type", "`string s`", "a string, named s"],
        ["relational", "`>= 90`, `< 0`", "a comparison with a constant"],
        ["and / or / not", "`>= 0 and < 10`, `not null`", "combinations"],
        ["property", "`{ Age: >= 18, Name: \"Ada\" }`", "properties that match their own patterns"],
        ["positional", "`(0, 0)`, `Point(var x, 0)`", "a tuple or deconstructable record"],
        ["list", "`[1, .., 9]`, `[var first, ..]`", "arrays and lists by their elements"],
        ["discard / var", "`_`, `var x`", "anything"]
      ] } },
      { ul: [
        "`x is pattern` gives a bool; `x is string s` also declares `s` where the test is true.",
        "`when condition` adds a guard to an arm.",
        "A switch expression that can miss a value gets warning CS8509, and throws SwitchExpressionException if it does miss.",
        "An arm that can never be reached is an error (CS8510)."
      ] },
      page("Variations"),
      { h: "Property patterns" },
      run("property", "ask about several properties at once", 'var orders = new[] { new Order("UK", 120m), new Order("UK", 30m), new Order("FR", 200m) };\nforeach (var o in orders)\n    Console.WriteLine(o switch\n    {\n        { Country: "UK", Total: >= 100 } => "free UK delivery",\n        { Country: "UK" } => "UK delivery £3.99",\n        _ => "international delivery"\n    });\n\nrecord Order(string Country, decimal Total);'),
      { h: "Tuple patterns: rock, paper, scissors" },
      run("tuple", "switch on two values at once", 'Console.WriteLine(Play("rock", "scissors"));\nConsole.WriteLine(Play("rock", "paper"));\nConsole.WriteLine(Play("paper", "paper"));\n\nstatic string Play(string a, string b) => (a, b) switch\n{\n    var (x, y) when x == y => "draw",\n    ("rock", "scissors") or ("scissors", "paper") or ("paper", "rock") => "first wins",\n    _ => "second wins"\n};'),
      { h: "and, or, not and is" },
      run("logic", "classify characters without && chains", 'foreach (char c in "aZ7 !")\n    Console.WriteLine($"[{c}] {Kind(c)}");\n\nstatic string Kind(char c) => c switch\n{\n    >= \'a\' and <= \'z\' or >= \'A\' and <= \'Z\' => "letter",\n    >= \'0\' and <= \'9\' => "digit",\n    \' \' => "space",\n    _ => "other"\n};'),
      { h: "List patterns" },
      run("list", "match on the first, last and length", 'foreach (var xs in new[] { new int[0], new[] { 4 }, new[] { 1, 2, 3 }, new[] { 1, 5 } })\n    Console.WriteLine(xs switch\n    {\n        [] => "empty",\n        [var only] => $"just {only}",\n        [1, .., 3] => "starts 1, ends 3",\n        [var first, .., var last] => $"{first} to {last}"\n    });'),
      page("Pitfalls"),
      { h: "An arm that can never match — CS8510" },
      run("pit-order", "`>= 50` already caught everything `>= 70` would", 'Console.WriteLine(Band(80));\n\nstatic string Band(int s) => s switch\n{\n    >= 50 => "pass",\n    >= 70 => "merit",\n    _ => "fail"\n};'),
      { h: "A switch that misses a case — SwitchExpressionException" },
      run("pit-missing", "warning CS8509, then a crash on 0", 'foreach (int n in new[] { 3, -1, 0 })\n    Console.WriteLine(n switch { > 0 => "positive", < 0 => "negative" });'),
      { h: "is with the wrong type name" },
      "`if (o is String s)` and `if (o is string s)` are the same (String is the class's full name), but `if (o is Int s)` is CS0246: the type is `int` (System.Int32).",
      page("Connections"),
      { ul: [ "**Back:** 2.x if and switch statements; 8.6 testing a type with is; 8.7 records deconstruct.", "**Next:** 9.x LINQ filters with lambdas; 11.2 JSON values are matched by shape.", "**AQA:** 4.1.2.3 and functional-style selection (4.12)." ] },
      page("Good practice"),
      { ul: [ "Order arms from most specific to most general; let `_` catch the rest.", "Read CS8509 as \"you forgot a case\" and fix it.", "Use patterns to *ask about* data; use polymorphism (8.6) when each type should *do* something different." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Wind speeds* and *Rock, paper, scissors*." ] },
      page("Quick reference"),
      run("qr", "patterns at a glance", 'object o = 42;\nif (o is int n and > 40) Console.WriteLine($"big int {n}");\nConsole.WriteLine((3, 0) switch { (0, 0) => "origin", (_, 0) => "on the x-axis", _ => "elsewhere" });'),
      { ul: [ "`x switch { p => v, …, _ => d }`", "`is T name`, `>= 10 and < 20`, `{ Prop: p }`, `(a, b)`, `[first, ..]`.", "`when` adds a condition." ] },
      { table: { head: ["Code", "Means", "Page"], rows: [["CS8510", "an arm is already handled above it", "Pitfalls"], ["CS8509 (warning)", "not every value is covered", "Pitfalls"], ["SwitchExpressionException", "a value matched no arm", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'int[] xs = { 7, 15, -2 };\nforeach (int x in xs)\n    Console.Write(x switch { < 0 => "n", < 10 => "s", _ => "b" });\nConsole.WriteLine();', why: "7 → s, 15 → b, −2 → n.", concepts: ["patterns"] },
        { id: "p2", src: 'var p = new Pet("cat", 3);\nConsole.WriteLine(p is { Kind: "cat", Age: < 5 });\nConsole.WriteLine(p is { Kind: "dog" } or { Age: > 10 });\n\nrecord Pet(string Kind, int Age);', why: "A young cat matches the first; neither alternative in the second.", concepts: ["patterns"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so any other value gives \"?\".", src: 'int d = 9;\nConsole.WriteLine(d switch { 1 => "one", 2 => "two", @@ => "?" });', out: "?", concepts: ["patterns"] }
      ],
      bug: [
        { id: "b1", q: "100 and above should be \"full marks or more\": it should print it for 100.", src: 'Console.WriteLine(Say(100));\n\nstatic string Say(int s) => s switch\n{\n    > 100 => "full marks or more",\n    >= 50 => "pass",\n    _ => "fail"\n};', out: "full marks or more", fixedText: "prints full marks or more", why: "> 100 misses 100 itself; use >= 100.", concepts: ["patterns"] }
      ]
    },
    flashcards: [
      ["What does a switch expression return?", "The value of the first arm whose pattern matches."],
      ["What does `_` match?", "Anything; put it last."],
      ["How do you test and name a type in one step?", "`if (o is string s)`."],
      ["What does `when` add to an arm?", "An extra condition (a guard)."],
      ["Write a pattern for 10 to 19.", "`>= 10 and < 20`."],
      ["What does CS8509 warn about?", "The switch expression does not cover every value."]
    ],
    quiz: [
      { q: "`s switch { >= 50 => \"p\", >= 70 => \"m\", _ => \"f\" }` is…", opts: ["fine", "CS8510: the >= 70 arm can never match", "a warning only", "SwitchExpressionException"], ans: 1, why: "Arms are tried in order; >= 50 catches every value >= 70." },
      { q: "`o is { Age: >= 18 }` tests…", opts: ["the type", "a property's value", "a list", "a constant"], ans: 1, why: "A property pattern." },
      { q: "`[var first, .., var last]` matches…", opts: ["any list", "lists with at least two elements", "empty lists", "exactly three elements"], ans: 1, why: "first and last must be different positions." }
    ]
  });
  K.add({ tasks: {
    "8.10-wind": { lesson: "8.10", title: "Wind speeds", tier: "warm-up", minutes: 10, concepts: ["patterns"],
      statement: ["Read wind speeds in mph, one per line, until the end.", "With one switch expression print `calm` (under 1), `breeze` (1–24), `gale` (25–54), `storm` (55–72) or `hurricane` (73 and over)."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "0\n10\n40\n80", out: "calm\nbreeze\ngale\nhurricane" }],
      hidden: [{ stdin: "24\n25\n54\n55\n72\n73", out: "breeze\ngale\ngale\nstorm\nstorm\nhurricane" }, { stdin: "1", out: "breeze" }],
      rules: [uses(/switch\s*\{/, "Use a switch expression."), { id: "noif", test: function (s) { return !/\bif\s*\(/.test(s); }, msg: "No if-chain: let the patterns decide." }],
      hints: ["int v = int.Parse(line);", "v switch { < 1 => \"calm\", < 25 => \"breeze\", … }", "Order the arms from lowest to highest so each one only needs <."],
      answer: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    int v = int.Parse(line);\n    Console.WriteLine(v switch\n    {\n        < 1 => "calm",\n        < 25 => "breeze",\n        < 55 => "gale",\n        < 73 => "storm",\n        _ => "hurricane"\n    });\n}' },
    "8.10-rps": { lesson: "8.10", title: "Rock, paper, scissors", tier: "core", minutes: 20, concepts: ["patterns"],
      statement: ["Read rounds `A B` (each `rock`, `paper` or `scissors`) until the end. Decide each with ONE tuple switch expression: `draw`, `first` or `second`.", "Print each result, then the score line `first F, second S, draws D`."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "rock scissors\npaper scissors\nrock rock", out: "first\nsecond\ndraw\nfirst 1, second 1, draws 1" }],
      hidden: [{ stdin: "", out: "first 0, second 0, draws 0" }, { stdin: "scissors paper\npaper rock\nscissors rock", out: "first\nfirst\nsecond\nfirst 2, second 1, draws 0" }],
      rules: [uses(/\(\s*[\w\[\]]+\s*,\s*[\w\[\]]+\s*\)\s*switch/, "Switch on a tuple: (a, b) switch { … }."), uses(/\bor\b/, "Combine the winning pairs with or.", "or")],
      hints: ["string r = (p[0], p[1]) switch { … };", "var (x, y) when x == y => \"draw\",", "(\"rock\", \"scissors\") or (\"scissors\", \"paper\") or (\"paper\", \"rock\") => \"first\", _ => \"second\""],
      answer: 'int f = 0, s = 0, d = 0;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    string r = (p[0], p[1]) switch\n    {\n        var (x, y) when x == y => "draw",\n        ("rock", "scissors") or ("scissors", "paper") or ("paper", "rock") => "first",\n        _ => "second"\n    };\n    Console.WriteLine(r);\n    if (r == "first") f++; else if (r == "second") s++; else d++;\n}\nConsole.WriteLine($"first {f}, second {s}, draws {d}");' }
  } });

  /* ================================================================
     8.11 Has-a: aggregation and composition
     ================================================================ */
  lesson("8.11", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Inheritance models **is-a**. Most relations between objects are **has-a**: a car has an engine, a team has players, a house has rooms.",
        "Has-a comes in two strengths, and AQA asks you to tell them apart and draw them.",
        "**Composition**: the part belongs to the whole and dies with it (a house and its rooms). **Aggregation**: the whole only uses parts that live on their own (a team and its players)."
      ] },
      page("Core idea"),
      run("composition", "Car makes its own Engine; nobody else holds it", 'var car = new Car("Mini");\nConsole.WriteLine(car.Start());\nConsole.WriteLine(car.Start());\n\nclass Engine\n{\n    public bool Running { get; private set; }\n    public string Start()\n    {\n        if (Running) return "already running";\n        Running = true;\n        return "vroom";\n    }\n}\n\nclass Car\n{\n    private readonly Engine engine = new();\n    public string Model { get; }\n    public Car(string model) => Model = model;\n    public string Start() => $"{Model}: {engine.Start()}";\n}'),
      { ul: [
        "The Car **creates** its Engine and keeps it **private**: no Engine exists without its Car.",
        "When the car is no longer referenced, its engine goes with it (the garbage collector frees both, 8.8).",
        "In a class diagram: a line with a **filled** diamond at the whole's end (Car ◆— Engine)."
      ] },
      run("aggregation", "Team uses players that exist before and after it", 'var ada = new Player("Ada");\nvar kai = new Player("Kai");\nvar red = new Team("Red");\nvar blue = new Team("Blue");\nred.Add(ada);\nred.Add(kai);\nblue.Add(ada);\nConsole.WriteLine(red.Roster());\nConsole.WriteLine(blue.Roster());\nred = null;\nConsole.WriteLine($"{ada.Name} still plays for {blue.Name}");\n\nclass Player\n{\n    public string Name { get; }\n    public Player(string name) => Name = name;\n}\n\nclass Team\n{\n    private readonly List<Player> players = new();\n    public string Name { get; }\n    public Team(string name) => Name = name;\n    public void Add(Player p) => players.Add(p);\n    public string Roster() => $"{Name}: " + string.Join(", ", players.ConvertAll(p => p.Name));\n}'),
      { ul: [
        "Players are created **outside** and handed in; one player can be in two teams.",
        "Dropping the team does not drop Ada.",
        "In a class diagram: a **hollow** diamond at the whole's end (Team ◇— Player)."
      ] },
      page("Rules"),
      { table: { head: ["", "Composition", "Aggregation", "Inheritance"], rows: [
        ["Relation", "has-a, owns", "has-a, uses", "is-a"],
        ["Part created by", "the whole", "someone else", "—"],
        ["Part shared?", "no", "may be", "—"],
        ["Lifetime", "dies with the whole", "independent", "—"],
        ["Diagram", "filled diamond ◆ at the whole", "hollow diamond ◇ at the whole", "hollow triangle ▷ at the base"]
      ] } },
      { ul: [
        "Composition: create the part in the constructor or field initialiser and keep it private.",
        "Aggregation: take the part as a parameter and keep a reference.",
        "Multiplicity labels the line: `1`, `0..1`, `*` (many), `1..*`.",
        "If unsure, ask: \"can the part exist, meaningfully, without this whole?\" Yes → aggregation."
      ] },
      page("Variations"),
      { h: "A house composed of rooms" },
      run("house", "rooms are made inside the house and never leave it", 'var h = new House(new[] { ("kitchen", 12.5), ("lounge", 20.0), ("bedroom", 11.0) });\nConsole.WriteLine($"{h.RoomCount} rooms, {h.Area} m²");\n\nclass Room\n{\n    public string Name { get; }\n    public double Area { get; }\n    public Room(string name, double area) { Name = name; Area = area; }\n}\n\nclass House\n{\n    private readonly List<Room> rooms = new();\n    public House((string name, double area)[] plan)\n    {\n        foreach (var (name, area) in plan) rooms.Add(new Room(name, area));\n    }\n    public int RoomCount => rooms.Count;\n    public double Area\n    {\n        get { double a = 0; foreach (var r in rooms) a += r.Area; return a; }\n    }\n}'),
      { h: "Owning a copy" },
      run("copy", "the house copies the list it was given, so the caller cannot change it later", 'var names = new List<string> { "Ada", "Kai" };\nvar c = new Class(names);\nnames.Add("Intruder");\nConsole.WriteLine(c.Count);\n\nclass Class\n{\n    private readonly List<string> pupils;\n    public Class(List<string> start) => pupils = new List<string>(start);\n    public int Count => pupils.Count;\n}'),
      { h: "Text diagrams" },
      { table: { head: ["Sentence", "Diagram"], rows: [["A Car has exactly one Engine it owns", "Car ◆—— 1 Engine"], ["A Team has many Players it uses", "Team ◇—— * Player"], ["A Square is a Shape", "Square ——▷ Shape"]] } },
      page("Pitfalls"),
      { h: "Reaching into a private part — CS0122" },
      run("pit-private", "only the Car talks to its engine", 'var c = new Car();\nc.engine.Start();\n\nclass Engine { public void Start() { } }\nclass Car { private readonly Engine engine = new(); }'),
      { h: "A composed part leaking out" },
      run("pit-leak", "returning the private list lets anyone change it", 'var h = new Hand();\nh.Cards.Clear();\nConsole.WriteLine(h.Cards.Count);\n\nclass Hand\n{\n    private readonly List<string> cards = new() { "A", "K" };\n    public List<string> Cards => cards;\n}'),
      { h: "Inheriting for has-a" },
      "`class Car : Engine` gives a car `Start()` and a `Running` property, but also says a car *is an* engine — every engine method, forever. Hold the engine instead.",
      page("Connections"),
      { ul: [ "**Back:** 7.3 encapsulation and IReadOnlyList; 8.1 inheritance (is-a).", "**Next:** 8.12 composition over inheritance; capstone 3's shop is composed of baskets and products.", "**AQA:** 4.1.2.3 aggregation, composition and class diagrams." ] },
      page("Good practice"),
      { ul: [ "Say the sentence: is-a → inheritance, owns → composition, uses → aggregation.", "Composed parts are private and created inside.", "Expose a part read-only (IReadOnlyList) or through methods, never the part itself." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *A car and its engine* and *Clubs and members*." ] },
      page("Quick reference"),
      run("qr", "both strengths at a glance", 'var w = new Wheel();\nvar b = new Bike(w);\nConsole.WriteLine($"{b.Ride()} {w.Turns}");\n\nclass Bell { public string Ring() => "ding"; }\nclass Wheel { public int Turns; }\nclass Bike\n{\n    private readonly Bell bell = new();\n    private readonly Wheel wheel;\n    public Bike(Wheel w) => wheel = w;\n    public string Ride() { wheel.Turns++; return bell.Ring(); }\n}'),
      { ul: [ "Composition: `private readonly Part p = new();` — ◆.", "Aggregation: `Whole(Part p) => this.p = p;` — ◇.", "Inheritance: `class D : B` — ▷." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0122", "a private part reached from outside", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var p = new Player("Lin");\nvar a = new Team();\nvar b = new Team();\na.Add(p);\nb.Add(p);\np.Goals = 3;\nConsole.WriteLine(a.Goals() + b.Goals());\n\nclass Player { public string Name; public int Goals; public Player(string n) => Name = n; }\nclass Team\n{\n    private readonly List<Player> ps = new();\n    public void Add(Player p) => ps.Add(p);\n    public int Goals() { int g = 0; foreach (var p in ps) g += p.Goals; return g; }\n}', why: "One shared player (aggregation): both teams see her 3 goals, 3 + 3.", concepts: ["has-a"] },
        { id: "p2", src: 'var x = new Box();\nvar y = new Box();\nx.Lid.Open = true;\nConsole.WriteLine($"{x.Lid.Open} {y.Lid.Open}");\n\nclass Lid { public bool Open; }\nclass Box { public Lid Lid { get; } = new Lid(); }', why: "Each Box composes its own Lid.", concepts: ["has-a"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so each Phone creates and owns its Battery.", src: 'var p = new Phone();\nConsole.WriteLine(p.Charge());\n\nclass Battery { public int Level = 50; }\nclass Phone\n{\n    private readonly Battery battery = @@;\n    public int Charge() => battery.Level += 10;\n}', out: "60", concepts: ["has-a"] }
      ],
      bug: [
        { id: "b1", q: "The library should own its own list: adding to `start` afterwards must not change it, so it should print 1.", src: 'var start = new List<string> { "Dune" };\nvar lib = new Library(start);\nstart.Add("Emma");\nConsole.WriteLine(lib.Count);\n\nclass Library\n{\n    private readonly List<string> books;\n    public Library(List<string> b) => books = b;\n    public int Count => books.Count;\n}', out: "1", fixedText: "prints 1", why: "It kept the caller's list (aggregation). Copy it to own it: books = new List<string>(b);", concepts: ["has-a"] }
      ]
    },
    flashcards: [
      ["Composition or aggregation: a house and its rooms?", "Composition — the rooms do not exist without the house."],
      ["Composition or aggregation: a team and its players?", "Aggregation — players exist on their own and may join other teams."],
      ["How is composition drawn?", "A filled diamond at the whole's end."],
      ["How is aggregation drawn?", "A hollow diamond at the whole's end."],
      ["How does a class compose a part in code?", "Creates it itself and keeps it private."],
      ["Why not `class Car : Engine`?", "A car has an engine; it is not one."]
    ],
    quiz: [
      { q: "A Course holds Students who also take other courses. That is…", opts: ["composition", "aggregation", "inheritance", "polymorphism"], ans: 1, why: "Shared parts with their own lives." },
      { q: "A filled diamond on a class diagram means…", opts: ["inheritance", "aggregation", "composition", "an interface"], ans: 2, why: "Filled = owned, same lifetime." },
      { q: "Which code shows aggregation?", opts: ["private Engine e = new();", "public Team(List<Player> ps) => players = ps;", "class Dog : Animal", "static int count;"], ans: 1, why: "The parts are made elsewhere and handed in." }
    ]
  });
  K.add({ tasks: {
    "8.11-car": { lesson: "8.11", title: "A car and its engine", tier: "core", minutes: 20, concepts: ["has-a"],
      statement: ["Write `Engine` with `Start()`, `Stop()` and a read-only `Running`, and `Car`, which **composes** a private Engine (made inside Car) and a `Fuel` level given to its constructor.", "Car's `Drive(int miles)` returns `drove N` (using 1 fuel a mile; it drives as far as the fuel lasts and then stops the engine, `drove N, out of fuel`), or `engine off` when not started.", "Read the fuel, then commands `start`, `stop` or `drive N` until the end and print what each returns (`start` → `started`, `stop` → `stopped`)."],
      starter: 'int fuel = int.Parse(Console.ReadLine() ?? "0");\n',
      examples: [{ stdin: "10\ndrive 3\nstart\ndrive 4\ndrive 9", out: "engine off\nstarted\ndrove 4\ndrove 6, out of fuel" }],
      hidden: [{ stdin: "5\nstart\nstop\ndrive 1", out: "started\nstopped\nengine off" }, { stdin: "0\nstart\ndrive 2", out: "started\ndrove 0, out of fuel" }],
      rules: [uses(/class\s+Engine/, "Write the class Engine."), uses(/private\s+readonly\s+Engine\s+\w+\s*=\s*new/, "Car creates its own private Engine.", "comp")],
      hints: ["class Engine { public bool Running { get; private set; } public void Start() => Running = true; public void Stop() => Running = false; }", "class Car { private readonly Engine engine = new(); private int fuel; public Car(int f) => fuel = f; … }", "Drive: if (!engine.Running) return \"engine off\"; int d = Math.Min(miles, fuel); fuel -= d; if (fuel == 0) { engine.Stop(); return $\"drove {d}, out of fuel\"; } return $\"drove {d}\";"],
      answer: 'int fuel = int.Parse(Console.ReadLine() ?? "0");\nvar car = new Car(fuel);\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    Console.WriteLine(p[0] switch\n    {\n        "start" => car.Start(),\n        "stop" => car.Stop(),\n        _ => car.Drive(int.Parse(p[1]))\n    });\n}\n\nclass Engine\n{\n    public bool Running { get; private set; }\n    public void Start() => Running = true;\n    public void Stop() => Running = false;\n}\n\nclass Car\n{\n    private readonly Engine engine = new();\n    private int fuel;\n    public Car(int fuel) => this.fuel = fuel;\n    public string Start() { engine.Start(); return "started"; }\n    public string Stop() { engine.Stop(); return "stopped"; }\n    public string Drive(int miles)\n    {\n        if (!engine.Running) return "engine off";\n        int d = Math.Min(miles, fuel);\n        fuel -= d;\n        if (fuel == 0)\n        {\n            engine.Stop();\n            return $"drove {d}, out of fuel";\n        }\n        return $"drove {d}";\n    }\n}' },
    "8.11-clubs": { lesson: "8.11", title: "Clubs and members", tier: "core", minutes: 20, concepts: ["has-a"],
      statement: ["Write `Member` (a `Name`) and `Club` (a `Name` and an **aggregated** list of members handed in by `Join(Member m)`). One Member object is shared by every club they join.", "Read lines `club NAME` (create a club), `member NAME` (create a member) and `join MEMBER CLUB` until the end. Then print each club in the order created as `CLUB: a, b` (or `CLUB: none`), then each member as `NAME n` with the number of clubs they are in."],
      starter: 'var clubs = new List<Club>();\nvar members = new List<Member>();\n\nclass Member { }\nclass Club { }',
      examples: [{ stdin: "club Chess\nclub Drama\nmember Ada\nmember Kai\njoin Ada Chess\njoin Ada Drama\njoin Kai Chess", out: "Chess: Ada, Kai\nDrama: Ada\nAda 2\nKai 1" }],
      hidden: [{ stdin: "club Choir\nmember Lin", out: "Choir: none\nLin 0" }],
      rules: [uses(/void\s+Join\s*\(\s*Member/, "Club.Join(Member m) takes the member in."), { id: "noNewInJoin", test: function (s) { var m = /void\s+Join\s*\([^)]*\)\s*(=>[^;]*;|\{[^}]*\})/.exec(s); return !!m && !/new\s+Member/.test(m[0]); }, msg: "Join must use the member it is given, not make a new one." }],
      hints: ["class Club { private readonly List<Member> members = new(); public string Name { get; } … public void Join(Member m) => members.Add(m); public bool Has(Member m) => members.Contains(m); }", "Find objects by name: clubs.Find(c => c.Name == p[2])!", "A member's count: int n = 0; foreach (var c in clubs) if (c.Has(m)) n++;"],
      answer: 'var clubs = new List<Club>();\nvar members = new List<Member>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    if (p[0] == "club") clubs.Add(new Club(p[1]));\n    else if (p[0] == "member") members.Add(new Member(p[1]));\n    else clubs.Find(c => c.Name == p[2])!.Join(members.Find(m => m.Name == p[1])!);\n}\nforeach (var c in clubs) Console.WriteLine(c.Line());\nforeach (var m in members)\n{\n    int n = 0;\n    foreach (var c in clubs) if (c.Has(m)) n++;\n    Console.WriteLine($"{m.Name} {n}");\n}\n\nclass Member\n{\n    public string Name { get; }\n    public Member(string name) => Name = name;\n}\n\nclass Club\n{\n    private readonly List<Member> members = new();\n    public string Name { get; }\n    public Club(string name) => Name = name;\n    public void Join(Member m) => members.Add(m);\n    public bool Has(Member m) => members.Contains(m);\n    public string Line() => $"{Name}: " + (members.Count == 0 ? "none" : string.Join(", ", members.ConvertAll(m => m.Name)));\n}' }
  } });

  /* ================================================================
     8.12 Composition over inheritance
     ================================================================ */
  lesson("8.12", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Robots can walk or roll, and beep or speak. With inheritance that is `WalkingBeepingRobot`, `RollingSpeakingRobot`… — every combination a class, and a new movement doubles them.",
        "A robot that changes how it moves while running is impossible: an object's class never changes.",
        "**Composition over inheritance**: give the robot *parts* — a mover and a voice — chosen when it is built and swappable later."
      ] },
      page("Core idea"),
      run("robot", "behaviour is a part the robot holds", 'var r = new Robot("R1", new Walk(), new Beep());\nConsole.WriteLine(r.Act());\nr.Mover = new Roll();\nConsole.WriteLine(r.Act());\n\ninterface IMover { string Move(); }\ninterface IVoice { string Say(); }\nclass Walk : IMover { public string Move() => "walks"; }\nclass Roll : IMover { public string Move() => "rolls"; }\nclass Beep : IVoice { public string Say() => "beep"; }\nclass Speak : IVoice { public string Say() => "hello"; }\n\nclass Robot\n{\n    public string Name { get; }\n    public IMover Mover { get; set; }\n    public IVoice Voice { get; set; }\n    public Robot(string name, IMover mover, IVoice voice) { Name = name; Mover = mover; Voice = voice; }\n    public string Act() => $"{Name} {Mover.Move()} and says {Voice.Say()}";\n}'),
      { ul: [
        "2 movers × 2 voices = 4 robots from **4 small classes**, not 4 subclasses — and 3 × 3 would need 6, not 9.",
        "`r.Mover = new Roll();` changes behaviour at run time.",
        "Robot **delegates** to its parts: it asks them rather than doing the work itself."
      ] },
      page("Rules"),
      { ul: [
        "Inherit for a true, stable is-a with shared code (a Square is a Shape).",
        "Compose for behaviour that varies, combines or changes: hold an interface-typed part and call it.",
        "A part chosen by the caller and passed in (`new Robot(new Walk(), …)`) is **dependency injection** — it makes the class easy to test (10.5).",
        "Swapping one algorithm for another behind an interface is the **strategy** pattern.",
        "Deep hierarchies are fragile: a change to a base class ripples into every descendant."
      ] },
      { table: { head: ["", "Inheritance", "Composition"], rows: [["Relation", "is-a", "has-a"], ["Decided", "when compiled", "when built, changeable later"], ["Combining behaviours", "a class per combination", "one part per behaviour"], ["Coupling", "tight: sees protected internals", "loose: only the interface"]] } },
      page("Variations"),
      { h: "A pricing strategy" },
      run("strategy", "the checkout does not know which discount it has", 'var items = new decimal[] { 20m, 15m, 5m };\nforeach (IDiscount d in new IDiscount[] { new NoDiscount(), new PercentOff(10), new OverAmount(30m, 5m) })\n    Console.WriteLine($"{d.Name,-14} {new Checkout(d).Total(items):F2}");\n\ninterface IDiscount { string Name { get; } decimal Apply(decimal total); }\nclass NoDiscount : IDiscount { public string Name => "none"; public decimal Apply(decimal t) => t; }\nclass PercentOff : IDiscount\n{\n    private readonly int pct;\n    public PercentOff(int pct) => this.pct = pct;\n    public string Name => $"{pct}% off";\n    public decimal Apply(decimal t) => t * (100 - pct) / 100;\n}\nclass OverAmount : IDiscount\n{\n    private readonly decimal over, off;\n    public OverAmount(decimal over, decimal off) { this.over = over; this.off = off; }\n    public string Name => $"{off} off {over}+";\n    public decimal Apply(decimal t) => t >= over ? t - off : t;\n}\nclass Checkout\n{\n    private readonly IDiscount discount;\n    public Checkout(IDiscount discount) => this.discount = discount;\n    public decimal Total(decimal[] prices)\n    {\n        decimal t = 0;\n        foreach (var p in prices) t += p;\n        return discount.Apply(t);\n    }\n}'),
      { h: "Wrapping a part to add behaviour" },
      run("wrap", "a logger that adds timestamps by holding another logger", 'ILog log = new Numbered(new ConsoleLog());\nlog.Write("start");\nlog.Write("done");\n\ninterface ILog { void Write(string msg); }\nclass ConsoleLog : ILog { public void Write(string msg) => Console.WriteLine(msg); }\nclass Numbered : ILog\n{\n    private readonly ILog inner;\n    private int n;\n    public Numbered(ILog inner) => this.inner = inner;\n    public void Write(string msg) => inner.Write($"{++n}: {msg}");\n}'),
      { h: "The fragile base class" },
      run("fragile", "a harmless-looking base change double-counts in the derived class", 'var s = new CountingSet();\ns.AddAll(new[] { "a", "b" });\nConsole.WriteLine(s.Added);\n\nclass Set\n{\n    protected readonly List<string> items = new();\n    public virtual void Add(string x) => items.Add(x);\n    public virtual void AddAll(string[] xs) { foreach (var x in xs) Add(x); }\n}\nclass CountingSet : Set\n{\n    public int Added;\n    public override void Add(string x) { Added++; base.Add(x); }\n    public override void AddAll(string[] xs) { Added += xs.Length; base.AddAll(xs); }\n}'),
      { ul: [ "CountingSet assumed AddAll did not call Add; it does, so 2 items count as 4. Composition would only see the public behaviour." ] },
      page("Pitfalls"),
      { h: "Inheriting from a type you do not own — CS0509" },
      run("pit-sealed", "many library types are sealed; hold one instead", 'Console.WriteLine(new Tag("x"));\n\nclass Tag : string\n{\n    public Tag(string s) { }\n}'),
      { h: "A part that is never given" },
      run("pit-null", "CS8618 warns; then NullReferenceException", 'var r = new Robot();\nConsole.WriteLine(r.Act());\n\ninterface IMover { string Move(); }\nclass Robot\n{\n    public IMover Mover { get; set; }\n    public string Act() => Mover.Move();\n}'),
      { h: "Composition everywhere" },
      "Wrapping a single method in three interfaces and two factories to avoid one honest `: Shape` is its own mistake. Compose what varies; inherit what is truly shared.",
      page("Connections"),
      { ul: [ "**Back:** 8.4 interfaces, 8.11 has-a.", "**Next:** 9.3 delegates pass behaviour without a class at all; 10.5 test doubles inject fake parts; 10.9 dependency inversion; D4 design patterns.", "**AQA:** 4.1.2.3 \"favour composition over inheritance\" and \"encapsulate what varies\" are named design principles." ] },
      page("Good practice"),
      { ul: [ "Encapsulate what varies: put each changing behaviour behind an interface.", "Pass parts in through the constructor.", "Keep inheritance for stable, shallow is-a families." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Robot moves* and *Choose a shipping rule*." ] },
      page("Quick reference"),
      run("qr", "a part behind an interface", 'var lamp = new Lamp(new Warm());\nConsole.WriteLine(lamp.Shine());\nlamp.Bulb = new Cool();\nConsole.WriteLine(lamp.Shine());\n\ninterface IBulb { string Colour(); }\nclass Warm : IBulb { public string Colour() => "amber"; }\nclass Cool : IBulb { public string Colour() => "blue"; }\nclass Lamp\n{\n    public IBulb Bulb { get; set; }\n    public Lamp(IBulb b) => Bulb = b;\n    public string Shine() => Bulb.Colour();\n}'),
      { ul: [ "Hold `IPart part;`, pass it to the constructor, call it.", "Swap it to change behaviour.", "Strategy = one interface, several interchangeable classes." ] },
      { table: { head: ["Code", "Means", "Page"], rows: [["CS0509", "the base type is sealed", "Pitfalls"], ["CS8618 (warning)", "a non-nullable part may never be set", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var t = new Timer(new Slow());\nConsole.Write(t.Tick() + " ");\nt.Speed = new Fast();\nConsole.WriteLine(t.Tick());\n\ninterface ISpeed { int Step(); }\nclass Slow : ISpeed { public int Step() => 1; }\nclass Fast : ISpeed { public int Step() => 5; }\nclass Timer\n{\n    private int at;\n    public ISpeed Speed { get; set; }\n    public Timer(ISpeed s) => Speed = s;\n    public int Tick() => at += Speed.Step();\n}', why: "1 with Slow; then 1 + 5 = 6 with Fast.", concepts: ["composition"] },
        { id: "p2", src: 'IText t = new Shout(new Shout(new Plain()));\nConsole.WriteLine(t.Get("hi"));\n\ninterface IText { string Get(string s); }\nclass Plain : IText { public string Get(string s) => s; }\nclass Shout : IText\n{\n    private readonly IText inner;\n    public Shout(IText inner) => this.inner = inner;\n    public string Get(string s) => inner.Get(s).ToUpper() + "!";\n}', why: "Each Shout wraps the next: HI! then HI!!.", concepts: ["composition"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the duck quacks through its voice part.", src: 'var d = new Duck(new Quack());\nConsole.WriteLine(d.Speak());\n\ninterface IVoice { string Sound(); }\nclass Quack : IVoice { public string Sound() => "quack"; }\nclass Duck\n{\n    private readonly IVoice voice;\n    public Duck(IVoice v) => voice = v;\n    public string Speak() => @@;\n}', out: "quack", concepts: ["composition"] }
      ],
      bug: [
        { id: "b1", q: "Changing the strategy should change the price: it should print 10 then 8.", src: 'var shop = new Shop(new Full());\nConsole.WriteLine(shop.Price(10));\nshop.Rule = new Sale();\nConsole.WriteLine(shop.Price(10));\n\ninterface IRule { int Apply(int p); }\nclass Full : IRule { public int Apply(int p) => p; }\nclass Sale : IRule { public int Apply(int p) => p * 8 / 10; }\nclass Shop\n{\n    private readonly IRule first;\n    public IRule Rule { get; set; }\n    public Shop(IRule r) { first = r; Rule = r; }\n    public int Price(int p) => first.Apply(p);\n}', out: "10\n8", fixedText: "prints 10 then 8", why: "Price used the rule from the constructor; it must use the current Rule.", concepts: ["composition"] }
      ]
    },
    flashcards: [
      ["What does composition over inheritance mean?", "Build behaviour from parts the object holds, rather than from deep class hierarchies."],
      ["Why does inheritance explode with combinations?", "Each combination of behaviours needs its own subclass."],
      ["How can a composed object change behaviour at run time?", "Swap the part: `robot.Mover = new Roll();`."],
      ["What is the strategy pattern?", "One interface, several interchangeable implementations, chosen by the caller."],
      ["What is the fragile base class problem?", "A change inside a base class silently breaks derived classes."],
      ["When is inheritance still right?", "A stable, shallow is-a family with shared code."]
    ],
    quiz: [
      { q: "Robots with 3 movers and 4 voices by inheritance need about…", opts: ["7 classes", "12 subclasses", "1 class", "4 classes"], ans: 1, why: "One per combination: 3 × 4." },
      { q: "`public Checkout(IDiscount d)` is an example of…", opts: ["inheritance", "dependency injection of a strategy", "boxing", "an abstract class"], ans: 1, why: "The caller hands in the behaviour." },
      { q: "Which favours composition?", opts: ["class Robot : Walker", "class Robot { IMover mover; }", "sealed class Robot", "abstract class Robot"], ans: 1, why: "The robot holds a part." }
    ]
  });
  K.add({ tasks: {
    "8.12-robot": { lesson: "8.12", title: "Robot moves", tier: "core", minutes: 20, concepts: ["composition", "interfaces"],
      statement: ["Write `interface IMover { int Step(); string Name { get; } }` with `Walk` (1, `walk`), `Run` (3, `run`) and `Hop` (2, `hop`).", "`Robot` holds an `IMover` (start: Walk) and a position. Read commands until the end: `move` (step forward with the current mover), or `walk`, `run`, `hop` (swap the mover). After each `move` print `NAME to POSITION`. No subclasses of Robot."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "move\nrun\nmove\nmove\nhop\nmove", out: "walk to 1\nrun to 4\nrun to 7\nhop to 9" }],
      hidden: [{ stdin: "run\nwalk\nmove", out: "walk to 1" }, { stdin: "hop\nmove\nmove\nmove", out: "hop to 2\nhop to 4\nhop to 6" }],
      rules: [uses(/interface\s+IMover/, "Declare IMover."), uses(/IMover\s+Mover\s*\{\s*get;\s*set;/, "Robot holds a swappable IMover Mover { get; set; }.", "part"), { id: "nosub", test: function (s) { return !/:\s*Robot\b/.test(s); }, msg: "No subclasses of Robot: swap the part." }],
      hints: ["class Run : IMover { public int Step() => 3; public string Name => \"run\"; }", "class Robot { public IMover Mover { get; set; } = new Walk(); public int At { get; private set; } public string Move() { At += Mover.Step(); return $\"{Mover.Name} to {At}\"; } }", "line switch { \"move\" => print r.Move(), \"run\" => r.Mover = new Run(), … }"],
      answer: 'var r = new Robot();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    if (line == "move") Console.WriteLine(r.Move());\n    else r.Mover = line == "run" ? new Run() : line == "hop" ? new Hop() : new Walk();\n}\n\ninterface IMover { int Step(); string Name { get; } }\nclass Walk : IMover { public int Step() => 1; public string Name => "walk"; }\nclass Run : IMover { public int Step() => 3; public string Name => "run"; }\nclass Hop : IMover { public int Step() => 2; public string Name => "hop"; }\n\nclass Robot\n{\n    public IMover Mover { get; set; } = new Walk();\n    public int At { get; private set; }\n    public string Move()\n    {\n        At += Mover.Step();\n        return $"{Mover.Name} to {At}";\n    }\n}' },
    "8.12-ship": { lesson: "8.12", title: "Choose a shipping rule", tier: "stretch", minutes: 25, concepts: ["composition", "interfaces"],
      statement: ["Write `interface IShipping { decimal Cost(decimal weightKg, decimal total); }` and three strategies: `Flat` (£4.99), `ByWeight` (£1.50 a kg, at least £2.00) and `FreeOver` (free when the total is £50 or more, otherwise it asks another IShipping it holds).", "Read the rule (`flat`, `weight` or `free-flat`, `free-weight`), then orders `WEIGHT TOTAL` until the end. A `Checkout` holding the IShipping prints `£COST` for each (2 decimals)."],
      starter: 'string rule = Console.ReadLine() ?? "";\n',
      examples: [{ stdin: "free-weight\n2 60\n2 30\n1 10", out: "£0.00\n£3.00\n£2.00" }],
      hidden: [{ stdin: "flat\n10 100", out: "£4.99" }, { stdin: "weight\n0.5 5\n4 99", out: "£2.00\n£6.00" }, { stdin: "free-flat\n1 49.99\n1 50", out: "£4.99\n£0.00" }],
      rules: [uses(/interface\s+IShipping/, "Declare IShipping."), uses(/class\s+FreeOver\s*:\s*IShipping/, "FreeOver implements IShipping.", "free"), uses(/IShipping\s+\w+\s*[;)=,]/, "FreeOver holds another IShipping (and Checkout holds one).", "hold")],
      hints: ["class FreeOver : IShipping { private readonly IShipping otherwise; public FreeOver(IShipping o) => otherwise = o; public decimal Cost(decimal w, decimal t) => t >= 50 ? 0 : otherwise.Cost(w, t); }", "IShipping s = rule switch { \"flat\" => new Flat(), \"weight\" => new ByWeight(), \"free-flat\" => new FreeOver(new Flat()), _ => new FreeOver(new ByWeight()) };", "Math.Max(2.00m, w * 1.50m)"],
      answer: 'string rule = Console.ReadLine() ?? "";\nIShipping s = rule switch\n{\n    "flat" => new Flat(),\n    "weight" => new ByWeight(),\n    "free-flat" => new FreeOver(new Flat()),\n    _ => new FreeOver(new ByWeight())\n};\nvar checkout = new Checkout(s);\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    Console.WriteLine($"£{checkout.Shipping(decimal.Parse(p[0]), decimal.Parse(p[1])):F2}");\n}\n\ninterface IShipping { decimal Cost(decimal weightKg, decimal total); }\nclass Flat : IShipping { public decimal Cost(decimal w, decimal t) => 4.99m; }\nclass ByWeight : IShipping { public decimal Cost(decimal w, decimal t) => Math.Max(2.00m, w * 1.50m); }\nclass FreeOver : IShipping\n{\n    private readonly IShipping otherwise;\n    public FreeOver(IShipping otherwise) => this.otherwise = otherwise;\n    public decimal Cost(decimal w, decimal t) => t >= 50 ? 0 : otherwise.Cost(w, t);\n}\nclass Checkout\n{\n    private readonly IShipping shipping;\n    public Checkout(IShipping shipping) => this.shipping = shipping;\n    public decimal Shipping(decimal w, decimal t) => shipping.Cost(w, t);\n}' }
  } });

  /* ================================================================
     8.13 Practise: a shapes library
     ================================================================ */
  lesson("8.13", {
    aqa: "4.1.2.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "This unit's ideas pay off together. The brief: a small **shapes library** that other code can use without knowing which shapes exist.",
        "It needs a contract (an interface), several implementations that refuse impossible shapes, a collection that adds them up, and sorting.",
        "Built in five steps, each a listing you can run."
      ] },
      page("Core idea"),
      { h: "Step 1 · the contract" },
      run("contract", "IShape says what every shape offers", 'IShape s = new Circle(1);\nConsole.WriteLine($"{s.Name} {s.Area():F2} {s.Perimeter():F2}");\n\ninterface IShape\n{\n    string Name { get; }\n    double Area();\n    double Perimeter();\n}\n\nclass Circle : IShape\n{\n    public double R { get; }\n    public Circle(double r) => R = r > 0 ? r : throw new ArgumentOutOfRangeException(nameof(r));\n    public string Name => "circle";\n    public double Area() => Math.PI * R * R;\n    public double Perimeter() => 2 * Math.PI * R;\n}'),
      { h: "Step 2 · an abstract base for the shared parts" },
      run("base", "Shape implements the contract\'s common code once", 'Shape[] all = { new Rect(3, 4), new Triangle(3, 4, 5) };\nforeach (var s in all) Console.WriteLine(s);\n\ninterface IShape { string Name { get; } double Area(); double Perimeter(); }\n\nabstract class Shape : IShape\n{\n    public abstract string Name { get; }\n    public abstract double Area();\n    public abstract double Perimeter();\n    public override string ToString() => $"{Name,-9} area {Area(),6:F2}  perimeter {Perimeter(),6:F2}";\n}\n\nclass Rect : Shape\n{\n    private readonly double w, h;\n    public Rect(double w, double h) { if (w <= 0 || h <= 0) throw new ArgumentOutOfRangeException(); this.w = w; this.h = h; }\n    public override string Name => "rect";\n    public override double Area() => w * h;\n    public override double Perimeter() => 2 * (w + h);\n}\n\nclass Triangle : Shape\n{\n    private readonly double a, b, c;\n    public Triangle(double a, double b, double c)\n    {\n        if (a + b <= c || a + c <= b || b + c <= a) throw new ArgumentException("Those sides cannot make a triangle.");\n        this.a = a; this.b = b; this.c = c;\n    }\n    public override string Name => "triangle";\n    public override double Perimeter() => a + b + c;\n    public override double Area()\n    {\n        double s = Perimeter() / 2;\n        return Math.Sqrt(s * (s - a) * (s - b) * (s - c));\n    }\n}'),
      page("Rules"),
      { ul: [
        "**Contract first**: callers depend on `IShape`, never on Circle or Rect.",
        "**Valid from birth** (7.2): each constructor refuses a shape that cannot exist.",
        "**Shared code once**: the abstract base writes ToString and comparison for everyone.",
        "**Aggregate**: a `Drawing` holds shapes made elsewhere and answers questions about them.",
        "**Sortable**: `IComparable<Shape>` orders by area."
      ] },
      { table: { head: ["Idea", "Lesson", "Where in the library"], rows: [["interface", "8.4", "IShape"], ["abstract class", "8.3", "Shape"], ["override", "8.2", "Area, Perimeter, ToString"], ["IComparable", "8.4", "Shape.CompareTo"], ["aggregation", "8.11", "Drawing"], ["polymorphism", "8.6", "Drawing.TotalArea"], ["patterns", "8.10", "Describe"]] } },
      page("Variations"),
      { h: "Step 3 · a drawing that aggregates shapes" },
      run("drawing", "TotalArea works for any shape, present or future", 'var d = new Drawing();\nd.Add(new Square(2));\nd.Add(new Square(3));\nConsole.WriteLine($"{d.Count} shapes, {d.TotalArea():F1}");\n\ninterface IShape { double Area(); }\nclass Square : IShape { private readonly double a; public Square(double a) => this.a = a; public double Area() => a * a; }\n\nclass Drawing\n{\n    private readonly List<IShape> shapes = new();\n    public int Count => shapes.Count;\n    public void Add(IShape s) => shapes.Add(s);\n    public double TotalArea()\n    {\n        double t = 0;\n        foreach (var s in shapes) t += s.Area();\n        return t;\n    }\n}'),
      { h: "Step 4 · sorting by area" },
      run("sort", "CompareTo in the base class sorts every shape", 'var list = new List<Shape> { new Sq(3), new Sq(1), new Sq(2) };\nlist.Sort();\nforeach (var s in list) Console.Write(s.Area() + " ");\nConsole.WriteLine();\n\nabstract class Shape : IComparable<Shape>\n{\n    public abstract double Area();\n    public int CompareTo(Shape? other) => Area().CompareTo(other?.Area() ?? 0);\n}\nclass Sq : Shape { private readonly double a; public Sq(double a) => this.a = a; public override double Area() => a * a; }'),
      { h: "Step 5 · describing with patterns" },
      run("describe", "a property pattern names special cases", 'foreach (var r in new[] { new Rect(2, 2), new Rect(1, 5), new Rect(4, 2) })\n    Console.WriteLine(r switch\n    {\n        { W: var w, H: var h } when w == h => "a square",\n        { H: > 4 } => "tall and thin",\n        _ => "a rectangle"\n    });\n\nrecord Rect(double W, double H);'),
      page("Pitfalls"),
      { h: "A new shape that forgets part of the contract — CS0535" },
      run("pit-contract", "Hexagon promises IShape but has no Perimeter", 'IShape h = new Hexagon();\nConsole.WriteLine(h.Area());\n\ninterface IShape { double Area(); double Perimeter(); }\nclass Hexagon : IShape { public double Area() => 0; }'),
      { h: "Impossible shapes" },
      run("pit-tri", "the constructor refuses sides 1, 2, 10", 'try\n{\n    var t = new Triangle(1, 2, 10);\n}\ncatch (ArgumentException e)\n{\n    Console.WriteLine(e.Message);\n}\n\nclass Triangle\n{\n    public Triangle(double a, double b, double c)\n    {\n        if (a + b <= c || a + c <= b || b + c <= a) throw new ArgumentException("Those sides cannot make a triangle.");\n    }\n}'),
      { h: "Comparing doubles for equality" },
      "Two areas worked out differently (π × 2² and a sum of slices) may differ in the 15th digit. Compare with a tolerance — `Math.Abs(a - b) < 1e-9` — or round before printing.",
      page("Connections"),
      { ul: [ "**Back:** the whole of unit 8, and 7.2's valid-from-birth constructors.", "**Next:** 9.x LINQ sorts and sums the drawing in one line each; capstone 3 is a shop built the same way with plugins.", "**AQA:** 4.1.2.3 — the NEA rewards exactly this structure in its technical solution." ] },
      page("Good practice"),
      { ul: [ "Write the interface first, then one implementation, then a second — the second tests the contract.", "Keep every shape immutable.", "Test the edges: zero sides, degenerate triangles, a single shape, an empty drawing." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *The library* and *Biggest first*." ] },
      page("Quick reference"),
      run("qr", "the library in miniature", 'var d = new List<IShape> { new C(1), new R(2, 3) };\ndouble t = 0;\nforeach (var s in d) t += s.Area();\nConsole.WriteLine($"{t:F2}");\n\ninterface IShape { double Area(); }\nrecord C(double Rad) : IShape { public double Area() => Math.PI * Rad * Rad; }\nrecord R(double W, double H) : IShape { public double Area() => W * H; }'),
      { ul: [ "Interface → abstract base → concrete shapes.", "A collection typed by the interface.", "Validate in constructors; sort with IComparable." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0535", "a contract member is missing", "Pitfalls"], ["ArgumentException", "an impossible shape refused", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: 'var shapes = new List<IShape> { new Sq(1), new Sq(2), new Sq(3) };\ndouble big = 0;\nforeach (var s in shapes) if (s.Area() > big) big = s.Area();\nConsole.WriteLine(big);\n\ninterface IShape { double Area(); }\nclass Sq : IShape { private readonly double a; public Sq(double a) => this.a = a; public double Area() => a * a; }', why: "The largest of 1, 4, 9.", concepts: ["library-design"] },
        { id: "p2", src: 'var xs = new List<S> { new(5), new(2), new(9) };\nxs.Sort();\nConsole.WriteLine(xs[0].N + "," + xs[^1].N);\n\nclass S : IComparable<S>\n{\n    public int N { get; }\n    public S(int n) => N = n;\n    public int CompareTo(S? o) => N.CompareTo(o?.N ?? 0);\n}', why: "Sorted ascending: first 2, last 9.", concepts: ["icomparable", "library-design"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the drawing accepts any shape.", src: 'var d = new List<@@> { new Sq(2), new Ci(1) };\nConsole.WriteLine(d.Count);\n\ninterface IShape { double Area(); }\nclass Sq : IShape { private readonly double a; public Sq(double a) => this.a = a; public double Area() => a * a; }\nclass Ci : IShape { private readonly double r; public Ci(double r) => this.r = r; public double Area() => Math.PI * r * r; }', out: "2", concepts: ["library-design"] }
      ],
      bug: [
        { id: "b1", q: "Sides 3, 4 and 8 cannot make a triangle: it should print `refused`.", src: 'try\n{\n    var t = new Tri(3, 4, 8);\n    Console.WriteLine("made");\n}\ncatch (ArgumentException) { Console.WriteLine("refused"); }\n\nclass Tri\n{\n    public Tri(double a, double b, double c)\n    {\n        if (a + b < 0) throw new ArgumentException("bad");\n    }\n}', out: "refused", fixedText: "prints refused", why: "Check the triangle inequality: a + b <= c (and the other two pairs) is impossible.", concepts: ["library-design"] }
      ]
    },
    flashcards: [
      ["What do callers of a shapes library depend on?", "The interface (IShape), never a concrete class."],
      ["Where does a shape's validation go?", "Its constructor — an impossible shape is never created."],
      ["What does the abstract base add over the interface?", "Shared code: ToString, CompareTo, helpers."],
      ["Which relation is a Drawing holding shapes?", "Aggregation."],
      ["What is the triangle inequality?", "Any two sides must add to more than the third."],
      ["How do you compare two doubles safely?", "Within a tolerance: Math.Abs(a - b) < 1e-9."]
    ],
    quiz: [
      { q: "Adding a Hexagon to the library needs changes to…", opts: ["Drawing", "every caller", "only the new class", "IShape"], ans: 2, why: "Everything else depends on the contract." },
      { q: "`List<Shape>.Sort()` needs…", opts: ["Shape to implement IComparable<Shape>", "a static Sort method", "records", "a struct"], ans: 0, why: "Sort compares items with CompareTo." },
      { q: "Heron's formula needs…", opts: ["the three sides", "a base and a height", "two angles", "the radius"], ans: 0, why: "s = perimeter / 2; area = √(s(s−a)(s−b)(s−c))." }
    ]
  });
  K.add({ tasks: {
    "8.13-lib": { lesson: "8.13", title: "The library", tier: "core", minutes: 30, concepts: ["library-design", "interfaces", "abstract-class"],
      statement: ["Build `IShape` (Name, Area, Perimeter), an abstract `Shape : IShape` with ToString `NAME A P` (2 decimals), and `Circle`, `Rect` and `Triangle` (Heron's formula) whose constructors throw `ArgumentException` for impossible shapes (any size ≤ 0; a triangle breaking the triangle inequality).", "Read lines `circle R`, `rect W H` or `triangle A B C` until the end. Print each shape, or `invalid` for one refused. Finally print `total A` with the total area of the valid shapes (2 decimals)."],
      starter: 'string? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n}\n',
      examples: [{ stdin: "rect 3 4\ntriangle 3 4 5\ncircle 1\ntriangle 1 2 10", out: "rect 12.00 14.00\ntriangle 6.00 12.00\ncircle 3.14 6.28\ninvalid\ntotal 21.14" }],
      hidden: [{ stdin: "rect 0 2\ncircle -1", out: "invalid\ninvalid\ntotal 0.00" }, { stdin: "triangle 2 2 2", out: "triangle 1.73 6.00\ntotal 1.73" }],
      rules: [uses(/interface\s+IShape/, "Declare IShape."), uses(/abstract\s+class\s+Shape\s*:\s*IShape/, "Shape is abstract and implements IShape.", "base"), uses(/throw\s+new\s+ArgumentException/, "Constructors throw ArgumentException.", "throw")],
      hints: ["ArgumentOutOfRangeException is an ArgumentException, so catch (ArgumentException) catches both.", "Heron: double s = (a + b + c) / 2; Math.Sqrt(s * (s - a) * (s - b) * (s - c)).", "Shape s = p[0] switch { \"circle\" => new Circle(…), \"rect\" => new Rect(…), _ => new Triangle(…) }; inside try."],
      answer: 'double total = 0;\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    double N(int i) => double.Parse(p[i]);\n    try\n    {\n        Shape s = p[0] switch\n        {\n            "circle" => new Circle(N(1)),\n            "rect" => new Rect(N(1), N(2)),\n            _ => new Triangle(N(1), N(2), N(3))\n        };\n        Console.WriteLine(s);\n        total += s.Area();\n    }\n    catch (ArgumentException) { Console.WriteLine("invalid"); }\n}\nConsole.WriteLine($"total {total:F2}");\n\ninterface IShape { string Name { get; } double Area(); double Perimeter(); }\n\nabstract class Shape : IShape\n{\n    public abstract string Name { get; }\n    public abstract double Area();\n    public abstract double Perimeter();\n    public override string ToString() => $"{Name} {Area():F2} {Perimeter():F2}";\n}\n\nclass Circle : Shape\n{\n    private readonly double r;\n    public Circle(double r) { if (r <= 0) throw new ArgumentException("radius"); this.r = r; }\n    public override string Name => "circle";\n    public override double Area() => Math.PI * r * r;\n    public override double Perimeter() => 2 * Math.PI * r;\n}\n\nclass Rect : Shape\n{\n    private readonly double w, h;\n    public Rect(double w, double h) { if (w <= 0 || h <= 0) throw new ArgumentException("sides"); this.w = w; this.h = h; }\n    public override string Name => "rect";\n    public override double Area() => w * h;\n    public override double Perimeter() => 2 * (w + h);\n}\n\nclass Triangle : Shape\n{\n    private readonly double a, b, c;\n    public Triangle(double a, double b, double c)\n    {\n        if (a <= 0 || b <= 0 || c <= 0 || a + b <= c || a + c <= b || b + c <= a) throw new ArgumentException("sides");\n        this.a = a; this.b = b; this.c = c;\n    }\n    public override string Name => "triangle";\n    public override double Perimeter() => a + b + c;\n    public override double Area()\n    {\n        double s = Perimeter() / 2;\n        return Math.Sqrt(s * (s - a) * (s - b) * (s - c));\n    }\n}' },
    "8.13-biggest": { lesson: "8.13", title: "Biggest first", tier: "stretch", minutes: 25, concepts: ["library-design", "icomparable", "polymorphism"],
      statement: ["Reuse the idea of an abstract `Shape : IComparable<Shape>` whose `CompareTo` puts the **larger** area first (ties: by name, alphabetically). Shapes: `square S` and `circle R`, named by their line (`square 2`).", "Read lines until the end, sort with `Sort()` and print each shape's line and area (2 decimals): `circle 1 3.14`."],
      starter: 'var shapes = new List<Shape>();\n\nabstract class Shape { }',
      examples: [{ stdin: "square 2\ncircle 1\nsquare 1", out: "square 2 4.00\ncircle 1 3.14\nsquare 1 1.00" }],
      hidden: [{ stdin: "circle 2\nsquare 4", out: "square 4 16.00\ncircle 2 12.57" }, { stdin: "square 3\nsquare 3", out: "square 3 9.00\nsquare 3 9.00" }],
      rules: [uses(/IComparable<\s*Shape\s*>/, "Shape implements IComparable<Shape>."), uses(/\.Sort\s*\(\s*\)/, "Sort with Sort().", "sort"), uses(/abstract\s+double\s+Area/, "Area is abstract.", "abs")],
      hints: ["abstract class Shape : IComparable<Shape> { public string Label { get; } protected Shape(string l) => Label = l; public abstract double Area(); … }", "public int CompareTo(Shape? o) { if (o is null) return -1; int c = o.Area().CompareTo(Area()); return c != 0 ? c : string.Compare(Label, o.Label, StringComparison.Ordinal); }", "Console.WriteLine($\"{s.Label} {s.Area():F2}\");"],
      answer: 'var shapes = new List<Shape>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != "")\n{\n    string[] p = line.Split(\' \');\n    double v = double.Parse(p[1]);\n    shapes.Add(p[0] == "square" ? new Square(line, v) : new Circle(line, v));\n}\nshapes.Sort();\nforeach (var s in shapes) Console.WriteLine($"{s.Label} {s.Area():F2}");\n\nabstract class Shape : IComparable<Shape>\n{\n    public string Label { get; }\n    protected Shape(string label) => Label = label;\n    public abstract double Area();\n    public int CompareTo(Shape? o)\n    {\n        if (o is null) return -1;\n        int c = o.Area().CompareTo(Area());\n        return c != 0 ? c : string.Compare(Label, o.Label, StringComparison.Ordinal);\n    }\n}\nclass Square : Shape\n{\n    private readonly double a;\n    public Square(string label, double a) : base(label) => this.a = a;\n    public override double Area() => a * a;\n}\nclass Circle : Shape\n{\n    private readonly double r;\n    public Circle(string label, double r) : base(label) => this.r = r;\n    public override double Area() => Math.PI * r * r;\n}' }
  } });

  /* ================================================================
     retrieval cards (skill cards) for unit 8
     ================================================================ */
  K.add({ cards: {
    "u8-virtual": { title: "Which method runs?", lesson: "8.2", concepts: ["virtual-override", "polymorphism"], kind: "predict",
      vary: function (r, n) {
        var a = pick(r, ["Dog", "Fox", "Owl"]), s1 = pick(r, ["Woof", "Yip", "Hoot"]), s2 = pick(r, ["walks", "runs", "flies"]);
        var how = ["override", "new"][n % 2];
        return { prompt: "What does this print?", label: how === "override" ? "an override through a base variable" : "a hidden method through a base variable", params: [],
          src: "Animal x = new " + a + "();\nConsole.WriteLine(x.Speak());\nConsole.WriteLine(x.Move());\n\nclass Animal\n{\n    public virtual string Speak() => \"...\";\n    public virtual string Move() => \"stands\";\n}\n\nclass " + a + " : Animal\n{\n    public " + how + " string Speak() => \"" + s1 + "\";\n    public override string Move() => \"" + s2 + "\";\n}",
          hint: "override replaces for every caller; new only hides, so a base variable still calls the base version." };
      } },
    "u8-record": { title: "Records and with", lesson: "8.7", concepts: ["records"], kind: "predict",
      vary: function (r, n) {
        var x = 1 + r(5), y = 1 + r(5), d = 1 + r(3);
        var srcs = [
          "var a = new P(" + x + ", " + y + ");\nvar b = a with { X = " + (x + d) + " };\nvar c = b with { X = " + x + " };\nConsole.WriteLine(a == b);\nConsole.WriteLine(a == c);\n\nrecord P(int X, int Y);",
          "var a = new P(" + x + ", " + y + ");\nvar b = a with { Y = a.Y + " + d + " };\nvar (p, q) = b;\nConsole.WriteLine(p + q);\nConsole.WriteLine(a);\n\nrecord P(int X, int Y);",
          "var set = new HashSet<P> { new(" + x + ", " + y + "), new(" + y + ", " + x + "), new(" + x + ", " + y + ") };\nConsole.WriteLine(set.Count);\n\nrecord P(int X, int Y);"
        ];
        return { prompt: "What does this print?", label: ["with and equality", "with and deconstruction", "records in a set"][n % 3], params: [], src: srcs[n % 3],
          hint: "Records compare values; with copies and changes; a set keeps one of each value." };
      } },
    "u8-struct": { title: "Copied or shared?", lesson: "8.8", concepts: ["value-reference", "structs"], kind: "predict",
      vary: function (r, n) {
        var a = 1 + r(9), b = 10 + r(9), kinds = ["struct", "class"];
        var k = kinds[n % 2];
        return { prompt: "What does this print?", label: "a " + k + " assigned and passed", params: [],
          src: "var x = new T { N = " + a + " };\nvar y = x;\ny.N = " + b + ";\nAdd(x);\nConsole.WriteLine($\"{x.N} {y.N}\");\n\nstatic void Add(T t) => t.N += 100;\n\n" + k + " T { public int N; }",
          hint: "A struct is copied on assignment and when passed; a class variable shares one object." };
      } },
    "u8-pattern": { title: "Switch on patterns", lesson: "8.10", concepts: ["patterns"], kind: "predict",
      vary: function (r) {
        var vals = [r(120) - 10, r(120) - 10, r(120) - 10];
        return { prompt: "What does this print?", label: "relational patterns", params: [],
          src: "foreach (int v in new[] { " + vals.join(", ") + " })\n    Console.WriteLine(v switch\n    {\n        < 0 => \"below\",\n        0 => \"zero\",\n        >= 1 and <= 49 => \"low\",\n        >= 50 and < 100 => \"high\",\n        _ => \"top\"\n    });",
          hint: "Arms are tried in order; the first match wins; _ catches the rest." };
      } },
    "u8-shape": { title: "Implement a contract", lesson: "8.4", concepts: ["interfaces", "abstract-class"], kind: "write",
      vary: function (r, n) {
        var shapes = [["Square", "side", "s * s", function (v) { return v * v; }], ["Cube", "side", "s * s * s", function (v) { return v * v * v; }], ["Triangle", "side", "s * s * Math.Sqrt(3) / 4", function (v) { return v * v * Math.sqrt(3) / 4; }]];
        var s = shapes[n % 3];
        var ins = [1 + r(5), 6 + r(5), 2];
        return { prompt: "Write `interface ISized { double Size(); }` and a class `" + s[0] + "` that implements it (its " + s[1] + " given to the constructor; Size = " + s[2] + " with s the " + s[1] + "). Read numbers one per line to the end and print each Size with 2 decimals, through an `ISized` variable.",
          label: s[0] + " implements ISized", params: [s[0]], starter: "",
          cases: ins.map(function (v) { return { stdin: String(v), out: s[3](v).toFixed(2) }; }),
          rules: [{ id: "impl", test: function (src) { return /interface\s+ISized/.test(src) && new RegExp("class\\s+" + s[0] + "\\s*:\\s*ISized").test(src) && /ISized\s+\w+\s*=/.test(src); }, msg: "Declare ISized, implement it in " + s[0] + ", and use an ISized variable." }],
          hint: "public double Size() => …; ISized x = new " + s[0] + "(v);",
          answer: "string? line;\nwhile ((line = Console.ReadLine()) is not null && line != \"\")\n{\n    ISized x = new " + s[0] + "(double.Parse(line));\n    Console.WriteLine($\"{x.Size():F2}\");\n}\n\ninterface ISized { double Size(); }\n\nclass " + s[0] + " : ISized\n{\n    private readonly double s;\n    public " + s[0] + "(double s) => this.s = s;\n    public double Size() => " + s[2] + ";\n}" };
      } },
    "u8-compare": { title: "Make it sortable", lesson: "8.4", concepts: ["icomparable"], kind: "write",
      vary: function (r, n) {
        var desc = n % 2 === 0;
        var names = ["Ada", "Kai", "Lin", "Bo", "Sam", "Zed"];
        var mk = function () { var xs = []; for (var i = 0; i < 3; i++) xs.push([names[r(6)] + i, r(50)]); return xs; };
        var cases = [mk(), mk(), [["Al", 5], ["Cy", 5]]];
        var sortRows = function (xs) { return xs.slice().sort(function (a, b) { return a[1] !== b[1] ? (desc ? b[1] - a[1] : a[1] - b[1]) : (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0); }); };
        return { prompt: "Write `Item : IComparable<Item>` with `Name` and `Value`, sorting by Value " + (desc ? "highest" : "lowest") + " first, ties by Name (ordinal). Read `NAME VALUE` lines to the end, `Sort()` them and print `NAME VALUE` lines.",
          label: (desc ? "highest" : "lowest") + " first", params: [desc ? "desc" : "asc"], starter: "",
          cases: cases.map(function (xs) { return { stdin: xs.map(function (x) { return x[0] + " " + x[1]; }).join("\n"), out: sortRows(xs).map(function (x) { return x[0] + " " + x[1]; }).join("\n") }; }),
          rules: [{ id: "cmp", test: function (src) { return /IComparable<\s*Item\s*>/.test(src) && /\.Sort\s*\(\s*\)/.test(src); }, msg: "Implement IComparable<Item> and call Sort()." }],
          hint: desc ? "int c = o.Value.CompareTo(Value); — the other way round for highest first." : "int c = Value.CompareTo(o.Value);",
          answer: "var items = new List<Item>();\nstring? line;\nwhile ((line = Console.ReadLine()) is not null && line != \"\")\n{\n    string[] p = line.Split(' ');\n    items.Add(new Item(p[0], int.Parse(p[1])));\n}\nitems.Sort();\nforeach (var i in items) Console.WriteLine($\"{i.Name} {i.Value}\");\n\nclass Item : IComparable<Item>\n{\n    public string Name { get; }\n    public int Value { get; }\n    public Item(string name, int value) { Name = name; Value = value; }\n    public int CompareTo(Item? o)\n    {\n        if (o is null) return -1;\n        int c = " + (desc ? "o.Value.CompareTo(Value)" : "Value.CompareTo(o.Value)") + ";\n        return c != 0 ? c : string.Compare(Name, o.Name, StringComparison.Ordinal);\n    }\n}" };
      } }
  } });
})();
