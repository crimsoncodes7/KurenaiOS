/* Kurenai OS — js/data/exams/aqa-7517-2-46.js
   AQA 7517 Paper 2, the exhaustive Companion: 4.6 Fundamentals of
   computer systems. AUTHORED, original (see aqa-7517-2-45.js for the
   shape and the rules). Every Boolean simplification was checked by truth
   table before it was written.                                           */
(function () {
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var D = X.deep = X.deep || {};
  var P = D["aqa-7517-2"] = D["aqa-7517-2"] || { leaves: {} };
  var L = P.leaves;
  var OS_TRAP = { sitting: "2022-06", q: "Q04.3", text: "Naming a function (\"memory management\") scored nothing, even in a sentence. Describe what it does: regions of memory are allocated to processes. \"Provides a user interface\" needs developing: the OS hides the hardware's complexity." };

  /* ================= 4.6.1 Software ================= */
  L["4.6.1.1"] = {
    archetypes: [{
      id: "cs.software",
      rules: ["Hardware: the physical components. Software: the programs (instructions and data) that run on it.",
        "The relationship: software tells the hardware what to do; hardware carries out the instructions. Neither is useful alone.",
        "\"Describe\" a function means what it does, with its effect: a name alone scores nothing."],
      traps: [OS_TRAP],
      variations: [
        { v: "A", t: "The relationship between hardware and software", m: 2, q: "Explain the relationship between hardware and software.",
          steps: [["Hardware is the physical parts of the computer; software is the programs that run on it.", "MP1", "Both defined"], ["Software is a set of instructions that the hardware executes: hardware needs software to do anything useful, and software needs hardware to run on.", "MP2", "The dependency both ways"]] },
        { v: "B", t: "Why the operating system sits between them", m: 2, q: "Explain why application software does not usually control hardware directly.",
          steps: [["The operating system hides the complexity of the hardware behind a simpler interface (a virtual machine).", "MP1", ""], ["Applications ask the OS (through system calls and device drivers), so they work on different hardware and cannot interfere with each other.", "MP2", ""]] },
        { v: "C", t: "Firmware", m: 2, q: "A washing machine's control program is stored in ROM. Explain why it is described as firmware, not just software.",
          steps: [["It is software stored permanently in non-volatile memory on the hardware itself.", "MP1", ""], ["It is rarely changed and controls that specific hardware directly from power-on.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Define the term software.", ["Programs / sets of instructions (and data) run by a computer (1)"]],
      [1, 1, "Give an example of hardware that is an input device.", ["Keyboard / mouse / microphone / sensor (1)"]],
      [2, 2, "Explain why a computer cannot do useful work with hardware alone.", ["Hardware only executes instructions (1)", "It needs software to supply them / tell it what to do (1)"]],
      [2, 2, "Explain what is meant by the operating system providing a virtual machine.", ["It hides the hardware's complexity (1)", "Programs and users see a simpler interface instead of the real hardware (1)"]],
      [3, 2, "Explain why a program written for one operating system may not run on another, even on the same hardware.", ["It uses that OS's system calls/libraries/interface (1)", "The other OS provides different ones / a different executable format (1)"]],
      [3, 2, "Explain why updating firmware carries a risk not present when updating an application.", ["Firmware controls the device's hardware from start-up (1)", "A failed update can leave the device unable to start / 'bricked' (1)"]]
    ]
  };

  L["4.6.1.2"] = {
    archetypes: [{
      id: "cs.software-classify", title: "Classify software: system or application",
      match: "categorise|classify|application software|define system|not system",
      rules: ["System software runs and manages the computer: the OS, utilities, libraries and translators.",
        "Application software does a task for the user: a word processor, a browser, a game.",
        "Classify by PURPOSE, not by who wrote it or whether it came with the computer."],
      traps: [],
      variations: [
        { v: "A", t: "Sort a list into the two classes", m: 2, q: "Classify each as system or application software: a spreadsheet, a compiler, a disk defragmenter, a web browser.",
          steps: [["System: the compiler (a translator) and the disk defragmenter (a utility).", "MP1", ""], ["Application: the spreadsheet and the web browser.", "MP2", ""]] },
        { v: "B", t: "Define system software", m: 1, q: "Define the term system software.",
          steps: [["Software that manages and runs the computer's hardware and provides a platform for application software.", "MP1", ""]] },
        { v: "C", t: "Application against system", m: 2, q: "Explain the difference between application software and system software.",
          steps: [["Application software lets the user carry out a task they want to do (e.g. write a letter).", "MP1", ""], ["System software controls the computer itself and supports the applications (e.g. the OS, utilities).", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "State whether a photo editor is system or application software.", ["Application (1)"]],
      [1, 1, "Give one example of system software that is not an operating system.", ["Utility / library / compiler / assembler / interpreter (1)"]],
      [2, 2, "Classify: a virus checker, a video game, an assembler, a music player.", ["System: virus checker, assembler (1)", "Application: game, music player (1)"]],
      [2, 2, "A school installs a timetable program. Explain whether it is system or application software.", ["Application (1)", "It performs a user task, not managing the computer (1)"]],
      [3, 2, "Explain why a library program is classed as system software even though applications call it.", ["It provides common routines that support programs (1)", "It is not a user task in itself / supports software development (1)"]],
      [3, 3, "Describe the four kinds of system software.", ["Operating system (1)", "Utility programs (1)", "Libraries and translators — compilers, interpreters, assemblers (1)"]]
    ]
  };

  L["4.6.1.3"] = {
    archetypes: [{
      id: "cs.system-software", title: "Utilities, libraries and translators",
      match: "utility|system software|virus|libraries",
      rules: ["Utilities do one maintenance job: virus checking, defragmenting, backup, compression, encryption.",
        "Libraries are pre-written, tested routines that programs call.",
        "Translators turn source code into machine code: compiler, interpreter, assembler."],
      traps: [],
      variations: [
        { v: "A", t: "What utilities are", m: 2, q: "Explain what is meant by a utility program and give an example.",
          steps: [["A program that performs a specific task to maintain or optimise the computer, rather than a user task.", "MP1", ""], ["e.g. a virus checker scans files for known malware signatures.", "MP2", "An example with what it does"]] },
        { v: "B", t: "Library programs", m: 2, q: "Explain two benefits to a programmer of using library programs.",
          steps: [["Saves time: the routines are already written.", "MP1", ""], ["They are already tested and debugged, so they are reliable.", "MP2", ""]] },
        { v: "C", t: "Which class is a virus checker", m: 1, q: "State which type of system software a virus checker is.",
          steps: [["A utility program.", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Name a utility that reduces the size of files.", ["Compression utility (1)"]],
      [1, 1, "State what a disk defragmenter does.", ["Moves parts of files so each is stored contiguously (1)"]],
      [2, 2, "Explain why a backup utility is useful even with a reliable hard disk.", ["Data can be lost through deletion, malware, theft or fire (1)", "A copy kept elsewhere allows recovery (1)"]],
      [2, 2, "Give two examples of library routines a game programmer might use.", ["e.g. maths/random numbers (1)", "e.g. graphics/sound/file handling (1)"]],
      [3, 2, "Explain why a library is usually distributed compiled rather than as source code.", ["Ready to link and use without compiling (1)", "Protects the writer's code/intellectual property (1)"]],
      [3, 2, "Explain why defragmenting a solid-state drive is not useful.", ["SSD access time does not depend on where data is stored (1)", "Extra writes wear the flash cells (1)"]]
    ]
  };

  L["4.6.1.4"] = {
    archetypes: [{
      id: "cs.os-functions", title: "The operating system: hide the hardware, manage the resources",
      match: "resource|functions of an operating|operating system",
      rules: ["The OS hides the complexity of the hardware from users and programs.",
        "It manages resources: the processor (scheduling), memory (allocating regions to processes), I/O devices (drivers), and storage (the file system).",
        "Describe each function with its effect; a list of names scores nothing."],
      traps: [OS_TRAP],
      variations: [
        { v: "A", t: "Describe two functions", m: 2, q: "Describe two functions of an operating system.",
          steps: [["Memory management: allocates regions of main memory to processes and stops them using each other's.", "MP1", "What it does, not just its name"], ["Processor scheduling: decides which process uses the processor and for how long, so several appear to run at once.", "MP2", ""]] },
        { v: "B", t: "Resource management", m: 2, q: "Explain what is meant by an operating system's role in resource management.",
          steps: [["The hardware resources (processor time, memory, I/O devices, storage) are limited and shared by many processes.", "MP1", ""], ["The OS allocates them between processes fairly and efficiently and resolves conflicts.", "MP2", ""]] },
        { v: "C", t: "Hiding the hardware", m: 2, q: "Explain how an operating system hides the complexity of the hardware from the user.",
          steps: [["It provides an interface (e.g. a GUI) so the user need not know how the hardware works.", "MP1", ""], ["Device drivers and system calls let programs use hardware through simple requests.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Name the part of the OS that lets it communicate with a printer.", ["Device driver (1)"]],
      [1, 1, "State one resource managed by an operating system.", ["Processor / memory / I/O devices / storage (1)"]],
      [2, 2, "Describe how an operating system manages files.", ["Organises files in a directory structure / file system (1)", "Controls creation, access and permissions / tracks where files are stored (1)"]],
      [2, 2, "Explain why processor scheduling is needed on a computer with one core.", ["Many processes want the processor (1)", "The OS switches between them so they appear to run at once / fairly (1)"]],
      [3, 3, "Explain three ways the OS stops one program from harming another.", ["Separate memory regions per process (1)", "Controlled access to devices via the OS (1)", "File permissions / user accounts (1)"]],
      [3, 2, "Explain what virtual memory is and why the OS uses it.", ["Part of secondary storage used as if it were RAM (1)", "Lets more/larger programs run than fit in RAM (1)"]]
    ]
  };

  /* ================= 4.6.2 Programming languages ================= */
  L["4.6.2.1"] = {
    archetypes: [{
      id: "cs.languages",
      rules: ["Low level: machine code (binary) and assembly (mnemonics, one instruction each). High level: problem-oriented, many machine instructions a statement.",
        "Imperative: a sequence of commands that change the program's state.",
        "Assembly's benefits are speed, small size and direct control of the hardware — not that it needs no translating."],
      traps: [{ sitting: "2022-06", q: "Q09.4", text: "Good reasons: faster or smaller code. Wrong ones: \"it doesn't need translating\" (an assembler translates it), or hardware access when the task doesn't need it." }],
      variations: [
        { v: "A", t: "Why write in assembly", m: 2, q: "A routine in a car's engine controller is written in assembly language. Give two reasons why.",
          steps: [["It can run faster, because the programmer chooses exactly which instructions run.", "MP1", ""], ["It can be smaller (less memory), and gives direct control of the processor's registers and hardware.", "MP2", ""]] },
        { v: "B", t: "Why use a high-level language", m: 4, q: "Explain four advantages of writing a program in a high-level language rather than assembly language.",
          steps: [["Easier to read and understand, so easier to maintain.", "MP1", ""], ["Quicker to write: one statement does what many assembly instructions do.", "MP2", ""], ["Portable: the same source can be compiled for different processors.", "MP3", ""], ["Has built-in data structures, functions and libraries, so fewer errors.", "MP4", ""]] },
        { v: "C", t: "What imperative means", m: 1, q: "Explain what is meant by an imperative high-level language.",
          steps: [["The program is a sequence of commands/statements, executed in order, that change the program's state.", "MP1", ""]] },
        { v: "D", t: "Machine code against assembly", m: 2, q: "Describe the relationship between assembly language and machine code.",
          steps: [["Each assembly instruction corresponds to exactly one machine code instruction (one-to-one).", "MP1", ""], ["Assembly uses mnemonics and labels instead of binary opcodes, so it is easier for people to read.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Give an example of a high-level language.", ["e.g. C#, Python, Java (1)"]],
      [1, 1, "State what a mnemonic is in assembly language.", ["A short code standing for an instruction/opcode, e.g. ADD (1)"]],
      [2, 2, "Explain why assembly language is described as processor-specific.", ["Its instructions are those of one processor's instruction set (1)", "So it will not run on a processor with a different instruction set (1)"]],
      [2, 2, "Give one disadvantage of machine code for a programmer and explain it.", ["Written in binary (1)", "So very hard to read, write and debug (1)"]],
      [3, 3, "A team must write a device driver that runs very fast. Discuss whether to use assembly or a high-level language.", ["Assembly: fastest/smallest, direct hardware control (1)", "High level: quicker to write, easier to maintain, portable (1)", "Justified choice, e.g. high level with assembly for critical parts (1)"]],
      [3, 2, "Explain why one line of a high-level language may become several machine code instructions.", ["High-level statements are more abstract (1)", "e.g. x = a + b needs load, add and store (1)"]]
    ]
  };

  /* ================= 4.6.3 Translators ================= */
  L["4.6.3.1"] = {
    archetypes: [{
      id: "cs.translators",
      rules: ["Compiler: translates the whole source to object code once; the result runs without the compiler.",
        "Interpreter: translates and runs one statement at a time, every run; stops at the first error.",
        "Assembler: assembly → machine code, one-to-one.",
        "Bytecode: compiled to an intermediate code that a virtual machine runs, for portability."],
      traps: [],
      variations: [
        { v: "A", t: "Compiler against interpreter", m: 4, q: "Compare compilers and interpreters, giving two differences and when each is preferred.",
          steps: [["A compiler translates the whole program into object code before it runs; an interpreter translates and executes it line by line.", "MP1", ""], ["Compiled code runs faster and needs no translator to run; interpreted code must be translated every run.", "MP2", ""], ["Compilers report all errors after translation; interpreters stop at the first error, which helps debugging.", "MP3", ""], ["Compile to distribute finished software (and hide the source); interpret while developing.", "MP4", ""]] },
        { v: "B", t: "Bytecode and virtual machines", m: 2, q: "Some languages compile to bytecode. Explain why.",
          steps: [["Bytecode is an intermediate code run by a virtual machine (interpreter) on each platform.", "MP1", ""], ["So the same compiled program runs on any processor with that virtual machine: portability.", "MP2", ""]] },
        { v: "C", t: "The assembler", m: 1, q: "State the purpose of an assembler.",
          steps: [["It translates assembly language into machine code.", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Name the translator that converts assembly language into machine code.", ["Assembler (1)"]],
      [1, 1, "State one advantage of an interpreter during development.", ["Errors found/run immediately line by line / no compile wait (1)"]],
      [2, 2, "Explain why a software company distributes its game compiled.", ["Users do not need a translator / it runs faster (1)", "The source code stays hidden (1)"]],
      [2, 2, "Explain what object code is.", ["The machine code output of a compiler (1)", "Not yet linked / ready to be executed after linking (1)"]],
      [3, 2, "Explain why an interpreted program usually runs more slowly than the same program compiled.", ["Each statement is translated every time it runs (1)", "Including inside loops, so repeated translation work (1)"]],
      [3, 3, "Describe how a program written in a bytecode language runs on a phone and a laptop with different processors.", ["Source compiled once to bytecode (1)", "Each device has its own virtual machine (1)", "Which interprets/JIT-compiles the bytecode for its processor (1)"]]
    ]
  };

  /* ================= 4.6.4 Logic gates ================= */
  L["4.6.4.1"] = {
    archetypes: [
      { id: "cs.truth-tables",
        rules: ["List inputs in binary counting order (000, 001, … 111) so no row is missed.",
          "Add a column for each intermediate gate output; it earns the method marks.",
          "XOR is 1 when the inputs differ; NAND and NOR are the inverted AND and OR."],
        traps: [],
        variations: [
          { v: "A", t: "Truth tables of single gates", m: 2, q: "Complete the truth tables of XOR and NOR for two inputs A and B.",
            steps: [["XOR: 00→0, 01→1, 10→1, 11→0.", "MP1", ""], ["NOR: 00→1, 01→0, 10→0, 11→0.", "MP2", ""]] },
          { v: "B", t: "Truth table of a small circuit", m: 3, q: "A circuit has inputs A, B and C. P = A AND B; Q = NOT P OR C. Complete a truth table for P and Q.",
            steps: [["Eight rows in order 000 to 111.", "", "Order"], ["P is 1 only for A = 1, B = 1 (rows 110, 111).", "MP1", "Intermediate column"], ["Q is 1 except when P = 1 and C = 0.", "MP2", ""], ["So Q = 0 only in row 110.", "MP3", ""]] },
          { v: "C", t: "Name the gate from its table", m: 1, q: "A gate outputs 1 for inputs 00, 01 and 10 and 0 for 11. Name it.",
            steps: [["NAND.", "MP1", ""]] }
        ] },
      { id: "cs.draw-circuit",
        rules: ["Use the standard gate shapes; label every input and the output.",
          "Draw straight from the expression: innermost brackets first.",
          "A NOT on one input is a NOT gate before the main gate — not a bubble on the wrong wire."],
        traps: [],
        variations: [
          { v: "A", t: "Draw from an expression", m: 3, q: "Draw a logic circuit for $Q = (A + B)\\cdot\\overline{C}$.",
            steps: [["An OR gate with inputs A and B.", "MP1", ""], ["A NOT gate on C.", "MP2", ""], ["An AND gate taking the OR output and NOT C, giving Q.", "MP3", ""]] },
          { v: "B", t: "Draw from a description", m: 3, q: "A greenhouse fan F turns on when it is hot (H) and the door is closed (D), or when the humidity is high (W). Draw a circuit.",
            steps: [["$F = H\\cdot D + W$.", "MP1", "The expression"], ["An AND gate for H and D.", "MP2", ""], ["An OR gate taking the AND output and W, giving F.", "MP3", ""]] },
          { v: "C", t: "Two gates from a truth table", m: 3, q: "Outputs S and C of a circuit are: inputs 00 → S0 C0, 01 → S1 C0, 10 → S1 C0, 11 → S0 C1. Draw the circuit.",
            steps: [["S matches XOR.", "MP1", ""], ["C matches AND.", "MP2", ""], ["Both gates take A and B as inputs (a half adder).", "MP3", ""]] }
        ] },
      { id: "cs.circuit-purpose",
        rules: ["Work out the truth table first, then recognise it: a half adder (S = XOR, C = AND), a full adder, a decoder (one output on per input pattern).",
          "\"State the purpose\" wants the name and what it does, e.g. \"adds two bits, giving a sum and a carry\"."],
        traps: [],
        variations: [
          { v: "A", t: "Recognise a half adder", m: 1, q: "A circuit has an XOR gate and an AND gate, both fed by inputs A and B. State its purpose.",
            steps: [["A half adder: it adds two bits, giving a sum (XOR) and a carry (AND).", "MP1", ""]] },
          { v: "B", t: "A full adder", m: 2, q: "Explain how a full adder differs from a half adder, and why it is needed.",
            steps: [["A full adder adds three bits: A, B and the carry in from the previous column.", "MP1", ""], ["Chained full adders add multi-bit numbers, passing each carry to the next column.", "MP2", ""]] },
          { v: "C", t: "A decoder", m: 2, q: "A circuit has inputs A, B and outputs W, X, Y, Z: exactly one output is 1 for each input pattern. State its purpose and give the expression for W, which is 1 only for input 00.",
            steps: [["A 2-to-4 decoder: selects one of four outputs (e.g. a memory chip or display segment).", "MP1", ""], ["$W = \\overline{A}\\cdot\\overline{B}$.", "MP2", ""]] }
        ] },
      { id: "cs.flip-flop",
        rules: ["A D-type flip-flop stores one bit.",
          "On the rising edge of the clock the output Q takes the value of D, and holds it until the next rising edge.",
          "Registers and memory are built from flip-flops."],
        traps: [],
        variations: [
          { v: "A", t: "General purpose", m: 1, q: "State the general purpose of a D-type flip-flop.",
            steps: [["It stores (remembers) a single bit: it is a memory unit.", "MP1", ""]] },
          { v: "B", t: "The clock input", m: 2, q: "Explain the role of the clock input in a D-type flip-flop.",
            steps: [["The output only changes on the rising edge of the clock signal.", "MP1", ""], ["Then Q takes the value of D; between edges Q holds its value whatever D does.", "MP2", ""]] },
          { v: "C", t: "Trace a sequence", m: 2, q: "D is 1, 1, 0, 0, 1 at five successive rising edges, and Q starts at 0. Give Q after each edge, and Q if D changes to 0 between edges 5 and 6.",
            steps: [["Q: 1, 1, 0, 0, 1.", "MP1", ""], ["Still 1: a change between edges has no effect until the next rising edge.", "MP2", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "Give the output of a NAND gate when both inputs are 1.", ["0 (1)"], { arch: "cs.truth-tables" }],
      [1, 1, "State when the output of an XOR gate is 1.", ["When the inputs are different (1)"], { arch: "cs.truth-tables" }],
      [2, 3, "Draw a circuit for $Q = \\overline{A\\cdot B} + C$.", ["AND of A and B (1)", "NOT of its output / a NAND (1)", "OR with C (1)"], { arch: "cs.draw-circuit" }],
      [2, 2, "Explain what happens to Q in a D-type flip-flop when D changes while the clock stays low.", ["Nothing / Q keeps its value (1)", "It only updates on a rising edge (1)"], { arch: "cs.flip-flop" }],
      [3, 2, "Explain how full adders are combined to add two 4-bit numbers.", ["Four full adders, one per bit (1)", "The carry out of each feeds the carry in of the next (1)"], { arch: "cs.circuit-purpose" }],
      [3, 3, "An alarm sounds (S) if a sensor (P) is triggered while the system is armed (R), unless the override (O) is on. Write the expression and draw the circuit.", ["$S = P\\cdot R\\cdot\\overline{O}$ (1)", "NOT gate on O (1)", "Three-input AND (or two ANDs) of P, R and NOT O (1)"], { arch: "cs.draw-circuit" }]
    ]
  };

  /* ================= 4.6.5 Boolean algebra ================= */
  L["4.6.5.1"] = {
    archetypes: [
      { id: "cs.boolean-simplify",
        rules: ["AND binds tighter than OR: expand or deal with each AND term before combining with OR.",
          "Name each law as you use it on its own line: a step with its reason earns the method marks.",
          "De Morgan across several operators at once only when they are all the same operator.",
          "Useful identities: $A\\cdot\\overline{A} = 0$, $A + \\overline{A} = 1$, $A + 1 = 1$, $A\\cdot A = A$, $A + A\\cdot B = A$, $A + \\overline{A}\\cdot B = A + B$."],
        traps: [{ sitting: "2022-06", q: "Q03.3", text: "Only about a quarter got full marks. Trap 1: turning A + Ā into 1 when the A was ANDed with something — AND binds tighter than OR. Trap 2: De Morgan applied across mixed operators in one step." },
          { sitting: "2023-06", q: "Q09.3", text: "The same two traps again: B̄ + B made 1 too early, and NOTs cancelled over different parts of the expression instead of applying De Morgan." }],
        variations: [
          { v: "A", t: "Expand, then collect", m: 4, q: "Simplify $(A + B)\\cdot(A + \\overline{B})$.",
            steps: [["Expand: $A\\cdot A + A\\cdot\\overline{B} + B\\cdot A + B\\cdot\\overline{B}$.", "MP1", "Every pair multiplied"], ["$A\\cdot A = A$ and $B\\cdot\\overline{B} = 0$: $A + A\\cdot\\overline{B} + A\\cdot B$.", "MP2", "Two identities"], ["Factor: $A\\cdot(1 + \\overline{B} + B)$.", "MP3", ""], ["$= A$.", "MP4", "Since $1 + X = 1$"]],
            methods: [{ name: "Method 1", rec: true, when: "Expand every term, then simplify. Always works; one more line.", lines: [["$AA + A\\overline{B} + BA + B\\overline{B}$", "MP1"], ["$A + A\\overline{B} + AB + 0$", "MP2"], ["$A(1 + \\overline{B} + B)$", "MP3"], ["$A$", "MP4"]] },
              { name: "Method 2", when: "Spot the distributive law in reverse: $(A + X)(A + Y) = A + XY$. Faster when you see it.", lines: [["$A + B\\cdot\\overline{B}$", "MP1 MP2"], ["$A + 0$", "MP3"], ["$A$", "MP4"]], slip: "If you use it, write the law's name: an unexplained jump may lose the method marks." }] },
          { v: "B", t: "De Morgan first", m: 4, q: "Simplify $\\overline{A\\cdot\\overline{B}}\\cdot(A + B)$.",
            steps: [["De Morgan: $\\overline{A\\cdot\\overline{B}} = \\overline{A} + B$.", "MP1", "The NOT splits and the AND becomes OR"], ["Expand: $\\overline{A}\\cdot A + \\overline{A}\\cdot B + B\\cdot A + B\\cdot B$.", "MP2", ""], ["$= 0 + B\\cdot(\\overline{A} + A) + B$.", "MP3", ""], ["$= B + B = B$.", "MP4", ""]] },
          { v: "C", t: "The precedence trap", m: 4, q: "Simplify $A\\cdot(B + 1) + \\overline{A}\\cdot C + C\\cdot\\overline{C}$.",
            steps: [["$B + 1 = 1$, so $A\\cdot 1 = A$.", "MP1", "Inside the bracket first"], ["$C\\cdot\\overline{C} = 0$: $A + \\overline{A}\\cdot C$.", "MP2", ""], ["Distributive law: $(A + \\overline{A})\\cdot(A + C)$.", "MP3", ""], ["$= A + C$.", "MP4", ""]],
            trap: "Do not turn $A + \\overline{A}\\cdot C$ into $1\\cdot C$: the $\\overline{A}$ is ANDed with C, so $A + \\overline{A}$ is not a term here." },
          { v: "D", t: "Double negation", m: 4, q: "Simplify $\\overline{\\overline{A} + \\overline{B}} + \\overline{A}\\cdot B$.",
            steps: [["De Morgan: $\\overline{\\overline{A} + \\overline{B}} = \\overline{\\overline{A}}\\cdot\\overline{\\overline{B}}$.", "MP1", ""], ["Double negation: $= A\\cdot B$, giving $A\\cdot B + \\overline{A}\\cdot B$.", "MP2", ""], ["Factor: $B\\cdot(A + \\overline{A})$.", "MP3", ""], ["$= B$.", "MP4", ""]] }
        ] },
      { id: "cs.boolean-laws",
        rules: ["Justify an identity by cases (A = 0 and A = 1) or a truth table.",
          "De Morgan: $\\overline{A\\cdot B} = \\overline{A} + \\overline{B}$ and $\\overline{A + B} = \\overline{A}\\cdot\\overline{B}$."],
        traps: [],
        variations: [
          { v: "A", t: "Justify an identity", m: 2, q: "Explain why $A\\cdot\\overline{A} = 0$.",
            steps: [["A is either 0 or 1, and $\\overline{A}$ is always the opposite value.", "MP1", ""], ["So one input of the AND is always 0, and the output is always 0.", "MP2", ""]] },
          { v: "B", t: "Name the law shown", m: 1, q: "A truth table shows that $\\overline{A + B}$ and $\\overline{A}\\cdot\\overline{B}$ have the same output in every row. Name the law.",
            steps: [["De Morgan's law.", "MP1", ""]] },
          { v: "C", t: "Show a law with a truth table", m: 2, q: "Use a truth table to show that $A + A\\cdot B = A$.",
            steps: [["Rows 00, 01, 10, 11: $A\\cdot B$ = 0, 0, 0, 1; $A + A\\cdot B$ = 0, 0, 1, 1.", "MP1", ""], ["The output column equals the A column in every row.", "MP2", ""]] }
        ] },
      { id: "cs.boolean-expr",
        rules: ["Write the expression gate by gate from the inputs to the output, bracketing each gate's result.",
          "Read a description: \"and\" → ·, \"or\" → +, \"not / unless\" → a bar."],
        traps: [],
        variations: [
          { v: "A", t: "Expression from a circuit", m: 2, q: "A circuit: an OR gate takes B and C; an AND gate takes A and the OR's output; a NOT gate inverts the AND's output to give Q. Write the expression for Q.",
            steps: [["The AND gives $A\\cdot(B + C)$.", "MP1", ""], ["$Q = \\overline{A\\cdot(B + C)}$.", "MP2", ""]] },
          { v: "B", t: "Expression from a description", m: 2, q: "A lift moves (M) when the doors are closed (D) and a floor is selected (F), unless it is overloaded (O). Write the expression.",
            steps: [["$D\\cdot F$ for the two conditions.", "MP1", ""], ["$M = D\\cdot F\\cdot\\overline{O}$.", "MP2", ""]] },
          { v: "C", t: "Match an equation to a table", m: 1, q: "An output is 1 only when exactly one of A and B is 1. Which equation is it: $A\\cdot B$, $A\\cdot\\overline{B} + \\overline{A}\\cdot B$, $\\overline{A + B}$?",
            steps: [["$A\\cdot\\overline{B} + \\overline{A}\\cdot B$ (XOR).", "MP1", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "Simplify $A + 1$.", ["1 (1)"], { arch: "cs.boolean-simplify" }],
      [1, 1, "Write the result of applying De Morgan's law to $\\overline{A\\cdot B}$.", ["$\\overline{A} + \\overline{B}$ (1)"], { arch: "cs.boolean-laws" }],
      [2, 3, "Simplify $A\\cdot\\overline{B} + A\\cdot B + \\overline{A}\\cdot B$, showing each step.", ["$A\\cdot(\\overline{B} + B) = A$ (1)", "$A + \\overline{A}\\cdot B$ (1)", "$A + B$ (1)"], { arch: "cs.boolean-simplify" }],
      [2, 3, "Simplify $\\overline{A + B} + \\overline{A}\\cdot B$.", ["De Morgan: $\\overline{A}\\cdot\\overline{B}$ (1)", "Factor $\\overline{A}\\cdot(\\overline{B} + B)$ (1)", "$\\overline{A}$ (1)"], { arch: "cs.boolean-simplify" }],
      [3, 4, "Simplify $\\overline{\\overline{A}\\cdot B}\\cdot B$.", ["De Morgan: $(A + \\overline{B})$ (1)", "Expand: $A\\cdot B + \\overline{B}\\cdot B$ (1)", "$\\overline{B}\\cdot B = 0$ (1)", "$A\\cdot B$ (1)"], { arch: "cs.boolean-simplify" }],
      [3, 2, "A heater (H) is on when it is cold (C) and someone is home (P), or when frost protection (F) is on and it is cold. Write and simplify the expression.", ["$H = C\\cdot P + C\\cdot F$ (1)", "$C\\cdot(P + F)$ (1)"], { arch: "cs.boolean-expr" }]
    ]
  };
})();
