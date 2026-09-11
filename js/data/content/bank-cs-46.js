/* Kurenai OS — past-paper bank: AQA 7517 §4.6 Fundamentals of computer
   systems. Modelled on AS/A-level Paper 2, June 2016–2025. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.6.1.1", {
  flashcards: [
    ["Define hardware.", "The physical / electrical components of a computer system."],
    ["Define software.", "The programs (sequences of instructions) that execute on the hardware."],
    ["State the relationship between hardware and software.", "Software executes on the hardware; the hardware provides the physical resources the software controls — neither is useful without the other."],
    ["Which is the CPU: hardware or software?", "Hardware."],
    ["Is firmware hardware or software?", "Software — programs stored in ROM/flash, controlling hardware directly."],
    ["Give an example of software controlling hardware.", "A device driver sending commands to a printer; the OS scheduling the processor."],
    ["Can hardware run without software?", "No — a processor with no instructions does nothing useful."],
    ["Why must software be stored as bit patterns?", "The hardware can only fetch and execute binary instructions."]
  ],
  quiz: [
    { q: "Hardware is:", opts: ["the programs", "the physical components", "the operating system", "data"], ans: 1, why: "Physical." },
    { q: "Software is:", opts: ["the electrical components", "the programs that execute on the hardware", "the keyboard", "the CPU"], ans: 1, why: "Programs." },
    { q: "The relationship between them is that:", opts: ["they are independent", "software executes on and controls the hardware", "hardware is written in software", "neither is needed"], ans: 1, why: "2020 P2 Q3.7." },
    { q: "Which is hardware?", opts: ["Compiler", "Device driver", "Graphics card", "Spreadsheet"], ans: 2, why: "Physical component." },
    { q: "Firmware is best described as:", opts: ["hardware", "software stored in non-volatile memory that controls hardware", "an application", "a network"], ans: 1, why: "Programs in ROM/flash." },
    { q: "A processor without any program loaded will:", opts: ["run the OS", "do nothing useful", "compile code", "boot"], ans: 1, why: "Needs instructions." }
  ],
  exam: [
    { level: "AS", src: "AS 2025 P2 Q6.1", q: "Explain what is meant by the terms *hardware* and *software*.", marks: 2,
      ms: ["Hardware: the physical / electrical components of the computer system (1)", "Software: the programs / sequences of instructions that execute on the hardware (1)"] },
    { src: "AQA 2020 P2 Q3.7", q: "Describe the relationship between hardware and software.", marks: 1,
      ms: ["Software is the programs that execute on the hardware / hardware is the physical components that allow the software to execute (1)"] }
  ]
});

X("compsci:4.6.1.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Classifying software — asked every year" },
    { kv: [
      ["Application software", "Performs **user-oriented tasks** — tasks the user would still want to do without a computer (word processing, image editing, games). Examples alone are NE"],
      ["System software", "Software used in the **management of the computer system** / layers that **abstract the user from how the hardware works** / provides a platform for other software — \"maintains the computer\" is NE"],
      ["Utility programs", "System software performing a **non-core / ancillary** management function: virus checker, disk defragmenter, backup, compression, encryption"],
      ["Libraries", "Collections of **pre-written, tested subroutines** that programs can call, so code is not rewritten"],
      ["Translators", "Compiler, interpreter, assembler — convert source code into executable form"],
      ["Operating system", "Core system software that manages resources and hides hardware complexity"]
    ]},
    { callout: { t: "warn", body: "A bitmap image editor is **application** software (2022); a virus checker is a **utility**, i.e. system software (2019); an interpreter is a **translator** (2025). Classify by *purpose*, not by who wrote it." }}
  ],
  flashcards: [
    ["Define application software.", "Software that performs user-oriented tasks — tasks a user would want to do even without a computer, e.g. writing a letter."],
    ["Define system software.", "Software used in the management of the computer system, providing a platform for other software and hiding the hardware's complexity from the user."],
    ["Name the four categories of system software.", "Operating systems, utility programs, libraries, translators (compilers, interpreters, assemblers)."],
    ["What is a utility program?", "System software that performs a non-core management task — virus checking, defragmentation, backup, compression."],
    ["Classify a spreadsheet, a compiler, a defragmenter and a games program.", "Application; system (translator); system (utility); application."],
    ["Is a web browser system or application software?", "Application — browsing is a user task."],
    ["What are libraries?", "Collections of pre-written, tested subroutines that programs can call rather than rewriting the code."],
    ["Give two examples of utility software.", "Virus checker, disk defragmenter, backup tool, file compression, encryption tool."]
  ],
  quiz: [
    { q: "A virus checker is:", opts: ["application software", "a utility (system software)", "a translator", "a library"], ans: 1, why: "Ancillary management task." },
    { q: "A bitmap image editor is:", opts: ["system software", "application software", "a utility", "an OS component"], ans: 1, why: "User-oriented task." },
    { q: "System software is best defined as software that:", opts: ["maintains the computer", "manages the computer system and hides hardware complexity", "the user buys", "runs games"], ans: 1, why: "'Maintains' is NE." },
    { q: "An interpreter belongs to which category?", opts: ["Application", "Utility", "Translator", "Library"], ans: 2, why: "Converts source code." },
    { q: "'Performs a task the user would want even without a computer' describes:", opts: ["system software", "application software", "utilities", "drivers"], ans: 1, why: "Mark-scheme phrase." },
    { q: "A collection of pre-written subroutines called by many programs is a:", opts: ["utility", "library", "compiler", "kernel"], ans: 1, why: "Definition." }
  ],
  exam: [
    { level: "AS", src: "AS 2025 P2 Q6.2", q: "Explain the difference between system software and application software.", marks: 2,
      ms: ["Application software performs user-oriented tasks — tasks the user would want to perform even if they did not have a computer (1)", "System software is used in the management of the computer system / abstracts the user from how the hardware works / provides a platform for other software (1)"] },
    { src: "AQA 2021 P2 Q13.2", q: "Explain what utility programs are and give one example.", marks: 2,
      ms: ["Software that performs a non-core / ancillary management function for the computer (1)", "e.g. virus checker, disk defragmenter, backup, compression, encryption software (1)"] },
    { src: "AQA 2025 P2 Q1.1", q: "Classify each of the following as application software, utility software, a library or a translator: (i) a program that converts Python source code into actions line by line; (ii) a collection of pre-written maths subroutines; (iii) a backup program; (iv) a video-editing program.", marks: 2,
      ms: ["(i) translator (interpreter); (ii) library (1)", "(iii) utility; (iv) application — all four correct for 2 marks (1)"] },
    { level: "AS", src: "AS 2019 P2 Q5.4", q: "From the list — operating system, word processor, compiler, disk defragmenter, web browser — identify the items that are system software.", marks: 2,
      ms: ["Operating system, compiler (1)", "Disk defragmenter — and neither of the other two (1)"] }
  ]
});

X("compsci:4.6.1.3", {
  flashcards: [
    ["What are the four types of system software?", "Operating system, utility programs, libraries, translators (compiler, interpreter, assembler)."],
    ["Why use library programs?", "Pre-written, already tested code saves development time and reduces errors; programs share one copy."],
    ["What is a translator?", "System software that converts source code into a form the processor can execute: assembler, compiler or interpreter."],
    ["What is a device driver?", "System software that lets the OS communicate with a specific piece of hardware."],
    ["Give three utility programs.", "Disk defragmenter, virus scanner, backup software (also compression and encryption tools)."],
    ["Is a device driver application software?", "No — it is system software controlling hardware."],
    ["How does system software 'provide a virtual machine'?", "It presents a simplified interface so programs and users need not deal with raw hardware."],
    ["Which system software runs first when a computer boots?", "The BIOS/firmware loader, then the operating system."]
  ],
  quiz: [
    { q: "Which is NOT system software?", opts: ["Assembler", "Disk defragmenter", "Graphics library", "Spreadsheet"], ans: 3, why: "Application." },
    { q: "Libraries are used because:", opts: ["they are compulsory", "tested code can be reused, saving time and reducing errors", "they run faster", "they replace the OS"], ans: 1, why: "AS 2023 P2 Q6.1." },
    { q: "A compiler is classified as:", opts: ["a utility", "a translator", "an application", "a driver"], ans: 1, why: "Converts source code." },
    { q: "Software that lets the OS talk to a specific printer is:", opts: ["a library", "a device driver", "an application", "an interpreter"], ans: 1, why: "Hardware-specific system software." },
    { q: "'Provides a platform for other software' describes:", opts: ["application software", "system software", "games", "data"], ans: 1, why: "System software definition." },
    { q: "A backup program is:", opts: ["application", "utility", "translator", "library"], ans: 1, why: "Ancillary management." }
  ],
  exam: [
    { level: "AS", src: "AS 2023 P2 Q6.1", q: "Explain what program libraries are and why programmers use them.", marks: 2,
      ms: ["Collections of pre-written (compiled), tested subroutines / code that programs can call (1)", "Saves development time / avoids rewriting and re-testing code / reduces errors (1)"] },
    { level: "AS", src: "AS 2022 P2 Q6.2", q: "Apart from the operating system, describe two other types of system software.", marks: 2,
      ms: ["Utility programs — perform ancillary management tasks such as virus checking or defragmentation (1)", "Translators (compilers, interpreters, assemblers) — convert source code into executable code / libraries — collections of reusable subroutines (1)"] }
  ]
});

X("compsci:4.6.1.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Role of the OS — the 2-mark 'describe two functions'" },
    "Phrases such as *memory management* or *processor management* score **nothing** — each function must be **described**:",
    { ul: [
      "**Processor**: allocates processors/cores to processes · schedules processes / decides which runs when · allocates time slices",
      "**Memory**: allocates memory to processes · moves data in and out of RAM / paging file for virtual memory · ensures processes write only to memory they were allocated",
      "**I/O devices**: allocates devices to processes · manages communication between processes and devices · installs drivers for new devices",
      "**Storage / files**: allocates space on a storage device · organises files into directories · recognises devices when connected",
      "**Hides the complexity of the hardware** from the user (provides a virtual machine) — \"user interface\" alone is NE",
      "**Handles interrupts** — calls the appropriate interrupt handler",
      "Installs and updates software · manages power/battery"
    ]},
    { callout: { t: "tip", body: "*A resource the OS manages* (AS 2018, 2023, 2024): processor time, main memory, secondary storage, I/O devices, network access — name the resource **and** the management action." }}
  ],
  flashcards: [
    ["Describe the OS's processor-management role.", "It allocates processor time / cores to processes, scheduling which runs when and for how long (time slices)."],
    ["Describe the OS's memory-management role.", "It allocates RAM to processes, moves data between RAM and the paging file (virtual memory), and prevents processes writing outside their allocation."],
    ["Describe the OS's I/O-management role.", "It allocates I/O devices to processes, manages communication with them via drivers, and installs drivers for new devices."],
    ["Describe the OS's file-management role.", "It allocates space on storage devices, decides where files are saved, and organises them into directories."],
    ["What does 'the OS hides the complexity of the hardware' mean?", "It provides a virtual machine — a simplified interface so users and programs need not deal with the raw hardware."],
    ["How does the OS handle interrupts?", "When an interrupt occurs it saves the current state and calls the appropriate interrupt service routine."],
    ["Name four resources the OS manages.", "Processor, main memory, secondary storage, I/O devices (also network, power)."],
    ["Why is 'memory management' alone not an answer?", "The examiners require a description of what the management involves."]
  ],
  quiz: [
    { q: "Deciding which process runs next on the CPU is:", opts: ["memory management", "processor scheduling", "file management", "interrupt handling"], ans: 1, why: "Processor management described." },
    { q: "Moving data between RAM and a paging file is part of:", opts: ["file management", "memory management (virtual memory)", "I/O", "scheduling"], ans: 1, why: "Virtual memory." },
    { q: "'Provides a virtual machine' means the OS:", opts: ["runs emulators", "hides the complexity of the hardware from the user", "is virtual", "uses the cloud"], ans: 1, why: "Abstraction layer." },
    { q: "Which answer scores for 'describe an OS function'?", opts: ["Memory management", "Allocates RAM to processes and ensures each writes only to its own area", "Manages the computer", "Runs programs"], ans: 1, why: "Described, not named." },
    { q: "Organising files into directories is:", opts: ["processor management", "storage/file management", "interrupt handling", "networking"], ans: 1, why: "File system role." },
    { q: "When an interrupt occurs the OS:", opts: ["ignores it", "calls the appropriate interrupt handler", "reboots", "compiles"], ans: 1, why: "ISR dispatch." }
  ],
  exam: [
    { src: "AQA 2022 P2 Q4.3", q: "Describe two functions of an operating system.", marks: 2,
      ms: ["Allocates processors/cores to processes — schedules which process runs when (1)", "Allocates memory to processes / moves data in and out of RAM for virtual memory / ensures processes only write to their own memory (1)", "Allocates I/O devices to processes and manages communication with them / installs drivers (1)", "Allocates space on storage devices and organises files into directories (1)", "Hides the complexity of the hardware from the user / handles interrupts by calling the handler (1)", "Phrases such as 'memory management' alone are not enough. Max 2"] },
    { src: "AQA 2019 P2 Q1.2", q: "An operating system is responsible for resource management. Describe two types of resource management it carries out.", marks: 2,
      ms: ["Processor: allocating cores / time slices to processes and scheduling them (1)", "Memory: allocating RAM to processes / paging to virtual memory (1)", "I/O: allocating devices to processes / managing communication via drivers (1)", "Storage: allocating space to files / organising directories (1)", "Max 2"] },
    { level: "AS", src: "AS 2024 P2 Q5.2", q: "State two hardware resources that the operating system manages, and for each describe one way in which it manages that resource.", marks: 2,
      ms: ["Processor — decides which process runs and for how long (1)", "Main memory — allocates areas of RAM to processes / secondary storage — decides where on the device a file is stored / I/O devices — communicates through drivers (1)"] }
  ]
});

X("compsci:4.6.2.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "High-level vs low-level — 2 to 6 marks, most years" },
    { table: { head: ["High-level language advantages", "Low-level (assembly) advantages"], rows: [
      ["Easier to understand / read / write / **maintain / debug** (English-like keywords)", "Translated code may **execute more quickly** — but NOT \"because no translation is needed\""],
      ["**Faster development** — one HLL line does the work of many assembly lines", "May **use less memory** / fewer instructions"],
      ["**Portable** / machine-independent — runs on other hardware after recompilation", "**Direct control of hardware** / registers / memory (\"direct access to hardware\" alone was rejected in 2022 — say *the programmer controls the exact machine code produced*)"],
      ["Flow-control structures, built-in data structures, modularity (subroutines, classes), libraries of built-in functions", "Machine code needs no translation at all"],
      ["Problem-oriented; supports different paradigms", "A translator for the HLL may not exist for a new / bespoke chip (embedded controllers)"]
    ]}},
    { callout: { t: "memorise", h: "Imperative (AS 2016, 2018; A-level 2024)", body: "Instructions are executed in a **programmer-defined order** / the program is a **sequence of commands** that **describe how** to solve the problem, changing the program's state. An imperative *high-level* language adds: English-like keywords, structured statements, local variables, parameters, named constants." }}
  ],
  flashcards: [
    ["What is a low-level language?", "One close to the processor's instruction set — machine code (binary) or assembly language (mnemonics with a one-to-one mapping to machine code)."],
    ["What is a high-level language?", "One with English-like keywords and structured statements, independent of any processor, that must be translated before execution."],
    ["Give three advantages of a high-level language.", "Easier to read, write, maintain and debug; faster development; portable across hardware; built-in structures, data types and libraries."],
    ["Give three advantages of assembly language.", "Translated code may run faster and use less memory; the programmer controls the exact machine code; direct manipulation of registers/hardware; no HLL translator needed for a bespoke chip."],
    ["What does imperative mean?", "The program is a sequence of instructions executed in a programmer-defined order that describe how to solve the problem, changing the program's state."],
    ["Why might assembly be chosen for an embedded controller?", "No compiler may exist for the bespoke chip; memory is limited so code must be compact; timing must be precise; direct hardware control is needed."],
    ["Name the low-level language other than assembly.", "Machine code."],
    ["What makes an imperative language high-level?", "English-like keywords, structured statements (loops, selection), support for local variables, parameters and named constants."]
  ],
  quiz: [
    { q: "'Assembly runs faster because it needs no translation' is:", opts: ["accepted", "rejected — speed comes from tighter code, not from skipping translation", "true for compilers", "worth 2 marks"], ans: 1, why: "Mark-scheme TO/R." },
    { q: "Which is an advantage of high-level languages?", opts: ["Direct register access", "Portability across processors", "Smaller machine code", "No translation needed"], ans: 1, why: "Machine-independent." },
    { q: "Imperative means:", opts: ["describes what, not how", "sequence of commands in programmer-defined order describing how", "purely functional", "declarative"], ans: 1, why: "Definition." },
    { q: "Assembly language instructions map to machine code:", opts: ["one-to-many", "one-to-one", "many-to-one", "randomly"], ans: 1, why: "Mnemonics = opcodes." },
    { q: "Best reason to write an embedded washing-machine controller in assembly:", opts: ["easier to read", "compact code and direct hardware control on a small bespoke chip", "portability", "team working"], ans: 1, why: "AS 2017 P2 Q4.2." },
    { q: "Which is NOT a feature of high-level languages?", opts: ["English-like keywords", "Built-in data structures", "One-to-one mapping to machine code", "Support for paradigms"], ans: 2, why: "That is assembly." }
  ],
  exam: [
    { src: "AQA 2025 P2 Q1.3", q: "Explain four advantages of writing a program in a high-level language rather than in assembly language.", marks: 4,
      ms: ["Code is easier to understand / maintain / debug because it uses English-like keywords (1)", "Faster development — one HLL statement does the work of many assembly instructions (1)", "Programs are portable / machine-independent — can run on other hardware (1)", "Availability of flow-control structures, built-in data structures, subroutines/classes for modularity, libraries of built-in functions; can be problem-oriented; supports different paradigms (1 each)", "Max 4"] },
    { src: "AQA 2024 P2 Q10.3", q: "Give two reasons why a programmer might choose to write part of a program in assembly language rather than a high-level language.", marks: 2,
      ms: ["The machine code produced may execute more quickly (not because translation is avoided) (1)", "The machine code may use less memory / fewer instructions (1)", "Better access to hardware / registers / low-level operating system routines (1)", "Max 2"] },
    { level: "AS", src: "AS 2017 P2 Q4.2", q: "A company develops a controller for a new washing machine using a bespoke, low-powered chip with little memory. Explain why assembly language was chosen rather than a high-level language.", marks: 3,
      ms: ["There is probably no compiler / interpreter available for a new bespoke chip (1)", "Memory is limited, so the compact machine code produced from assembly is needed; an interpreter would itself take memory (1)", "Assembly gives direct control of the hardware and faster execution; portability is irrelevant as the code runs on one device (1)", "Max 3 — a point and its expansion"] },
    { src: "AQA 2024 P2 Q10.4", q: "Explain what is meant by an *imperative* programming language.", marks: 1,
      ms: ["The program is a sequence of instructions followed in a programmer-defined order that describe how to carry out the task / change the program's state (1)"] },
    { level: "AS", src: "AS 2023 P2 Q6.2", q: "Discuss the advantages and disadvantages of high-level languages compared with low-level languages.", marks: 6,
      ms: ["High-level: processor-independent / portable, whereas low-level is processor-specific (1)", "High-level: easier for humans to read, write, debug and maintain; quicker to develop (1)", "High-level: extra features — data types, built-in functions, wider range of control structures; more development tools; domain-specific languages such as SQL (1)", "Low-level: translated code likely uses less memory and may execute faster (1)", "Low-level: direct control of hardware; machine code needs no translation (1)", "Explicit comparison throughout with examples — level of response 5–6 (1)"] }
  ]
});

X("compsci:4.6.3.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Translators — compiler vs interpreter, bytecode, assembler" },
    { table: { head: ["Compiler", "Interpreter"], rows: [
      ["Translates the **whole** source code before execution", "Translates and executes **line by line**"],
      ["Produces **object code / an executable**", "Produces **no** object code; calls its own subroutines to carry out each command"],
      ["**No executable if any error** is found", "Runs the program **until the first error**"],
      ["Once compiled the compiler and source are **not needed** to run it; translation happens **once**", "The interpreter (and source) must be **present every run**; a loop's instructions are translated **repeatedly**"],
      ["Compiled code runs **faster**", "Slower execution"],
      ["Object code runs only on the **same processor type**", "Source is **more portable**"]
    ]}},
    { kv: [
      ["Assembler (AS 2019, 2025)", "Converts assembly language (mnemonics) into machine code — one-to-one; a compiler takes complex HLL statements and produces many machine instructions"],
      ["Why emit bytecode / intermediate code (AS 2018, 2022)", "The target platform is unknown / code must run on many platforms — portability; compile once, run anywhere a **virtual machine** exists"],
      ["How bytecode runs", "A **virtual machine** on the target either **interprets** the bytecode instruction by instruction or **just-in-time compiles** it to native machine code; each processor architecture has its own VM"]
    ]}
  ],
  flashcards: [
    ["State three differences between a compiler and an interpreter.", "Compiler translates the whole program and produces object code; interpreter translates and executes line by line producing none. A compiler produces no executable on error; an interpreter runs until the first error. Compiled code runs faster and needs no translator afterwards; interpreted code needs the interpreter every run."],
    ["What does an assembler do?", "Translates assembly language mnemonics into machine code, one instruction to one instruction."],
    ["Difference between an assembler and a compiler?", "Both produce object code, but an assembler takes simple mnemonics (one-to-one) while a compiler takes complex HLL statements each producing many machine instructions."],
    ["Why do some compilers produce bytecode rather than machine code?", "So the program is platform-independent — it can run on any machine with the appropriate virtual machine."],
    ["How is bytecode executed?", "A virtual machine interprets it instruction by instruction, or just-in-time compiles it to native machine code before running it."],
    ["Advantage of interpreters during development?", "Errors are reported as they are reached and code can be tested immediately without a full compile; partially correct programs run."],
    ["Why must a processor's instructions be translated at all?", "A processor can execute only machine code; high-level instructions are not machine code."],
    ["Which translator is needed to run a compiled program on a customer's machine?", "None — the executable runs directly (given the same processor type)."]
  ],
  quiz: [
    { q: "A compiler that finds a syntax error will:", opts: ["run up to the error", "produce no executable", "fix it", "ignore it"], ans: 1, why: "Whole-program translation." },
    { q: "An interpreter inside a loop:", opts: ["translates the loop once", "translates the same instructions each iteration", "compiles the loop", "skips the loop"], ans: 1, why: "Line-by-line every run." },
    { q: "Bytecode is used so that:", opts: ["code runs faster than machine code", "the program can run on any platform with a virtual machine", "no translation is needed", "errors are fewer"], ans: 1, why: "Portability." },
    { q: "Just-in-time compilation:", opts: ["compiles source to bytecode", "compiles bytecode to native code at run time", "interprets source", "assembles mnemonics"], ans: 1, why: "VM strategy." },
    { q: "An assembler differs from a compiler because it:", opts: ["produces no object code", "translates mnemonics one-to-one", "runs the program", "is slower"], ans: 1, why: "Simple mapping." },
    { q: "To run an interpreted program on a customer's machine you need:", opts: ["only the executable", "the interpreter and the source code", "an assembler", "bytecode"], ans: 1, why: "Interpreter always present." }
  ],
  exam: [
    { level: "AS", src: "AS 2017 P2 Q4.1", q: "Describe four differences between a compiler and an interpreter.", marks: 4,
      ms: ["A compiler translates the whole source code at once; an interpreter analyses it line by line (1)", "A compiler produces object / machine code; an interpreter produces none, executing each line as it goes (1)", "A compiler produces no executable if an error is found; an interpreter runs the program up to the first error (1)", "Compiled code runs faster and does not need the compiler or source afterwards; interpreted code needs the interpreter and source every run / is more portable (1)", "Max 3 if all points concern only one translator"] },
    { level: "AS", src: "AS 2018 P2 Q11", ctx: "Some compilers produce bytecode rather than machine code.",
      parts: [
        { q: "Explain why a compiler might produce bytecode.", marks: 1, ms: ["The code may need to run on multiple platforms / the target platform is not known — platform independence (1)"] },
        { q: "Describe how a bytecode program is executed.", marks: 2, ms: ["A virtual machine on the target computer (1)", "either interprets the bytecode one instruction at a time, or just-in-time compiles it into machine code for that processor (1)"] }
      ] },
    { level: "AS", src: "AS 2025 P2 Q6.5", q: "Describe the role of an assembler and state how it differs from a compiler.", marks: 2,
      ms: ["Translates assembly language mnemonics into machine code, one assembly instruction to one machine instruction (1)", "A compiler translates complex high-level statements, each into many machine code instructions (1)"] },
    { src: "AQA 2019 P2 Q5", q: "A high-level language program can be compiled or interpreted. Explain why translation is necessary, and describe the differences between compilation and interpretation.", marks: 6,
      ms: ["The processor can only execute machine code; high-level instructions are not machine code (1)", "Compiler translates the whole program and produces an executable; interpreter translates line by line producing none (1)", "Compiler produces nothing if there is an error; interpreter runs until the first error (1)", "A compiled program is translated once; an interpreter translates every run and may translate a loop's instructions repeatedly (1)", "Compiled code needs no translator to run but is tied to one processor type; interpreted source needs the interpreter present but is portable (1)", "Compiled code executes faster; a compiler may instead emit bytecode for a virtual machine (1)"] }
  ]
});

X("compsci:4.6.4.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Logic gates — circuits, truth tables, adders, flip-flops" },
    { table: { head: ["Item", "Points"], rows: [
      ["Name the gate from a truth table / symbol", "NAND: output 0 only when both 1 · NOR: 1 only when both 0 · XOR: 1 when inputs differ. A symbol with a small circle on the output is the NOT-ed gate"],
      ["Draw a circuit from an expression (3–4)", "One mark per correctly wired stage; **Max n − 1 if any error**; a NOR may replace OR + NOT; draw the NOT gate with its circle"],
      ["Circuit from a scenario", "Translate each *and / or / not* in the sentence to a gate; write the expression first, then draw it"],
      ["Purpose of the circuit (1)", "*Half adder*: adds two bits, giving sum (XOR) and carry (AND). *Full adder*: adds three bits including a carry-in. Say which — \"adder\" alone is NE"],
      ["D-type flip-flop (2017, 2024)", "Stores the state of its D input — a **one-bit memory**. The **clock** input synchronises it: on the clock pulse (rising edge) **Q takes the value of D**; at other times Q holds"],
      ["Build XOR from AND/OR/NOT (AS 2020)", "A⊕B = A.¬B + ¬A.B"]
    ]}}
  ],
  flashcards: [
    ["Give the truth table of NAND.", "Output 0 only when both inputs are 1; otherwise 1."],
    ["Give the truth table of NOR.", "Output 1 only when both inputs are 0."],
    ["Give the truth table of XOR.", "Output 1 when the inputs are different."],
    ["What does a half adder do and how is it built?", "Adds two bits: Sum = A XOR B, Carry = A AND B."],
    ["What does a full adder do?", "Adds three bits (A, B and carry-in), producing a sum and carry-out — built from two half adders and an OR."],
    ["What is a D-type flip-flop?", "A one-bit memory: on the clock pulse the output Q takes the value of the D input and holds it until the next pulse."],
    ["What is the clock input for?", "It triggers the flip-flop to store the current D value, synchronising groups of flip-flops."],
    ["Express XOR using AND, OR and NOT.", "A.¬B + ¬A.B."],
    ["What is edge-triggering?", "The flip-flop responds only at the rising (or falling) edge of the clock, not while the clock is simply high."],
    ["Why are flip-flops important?", "They are the building blocks of registers and memory in a processor."]
  ],
  quiz: [
    { q: "Truth table: 00→1, 01→1, 10→1, 11→0. The gate is:", opts: ["AND", "NAND", "OR", "NOR"], ans: 1, why: "NOT AND." },
    { q: "Truth table: 00→1, 01→0, 10→0, 11→0:", opts: ["NOR", "NAND", "XOR", "AND"], ans: 0, why: "NOT OR." },
    { q: "A half adder's carry output is produced by:", opts: ["XOR", "OR", "AND", "NOT"], ans: 2, why: "Carry = A.B." },
    { q: "A half adder's sum output is produced by:", opts: ["AND", "XOR", "OR", "NAND"], ans: 1, why: "Sum = A⊕B." },
    { q: "On a clock pulse a D-type flip-flop:", opts: ["resets to 0", "sets Q to the value of D", "inverts Q", "does nothing"], ans: 1, why: "2024 P2 Q6.2." },
    { q: "A D-type flip-flop is used as:", opts: ["an adder", "a one-bit memory / to store state", "a decoder", "a multiplier"], ans: 1, why: "Stores the D input." },
    { q: "A full adder differs from a half adder because it:", opts: ["has no carry", "adds a carry-in as a third input", "uses only NOT gates", "is slower"], ans: 1, why: "Three inputs." }
  ],
  exam: [
    { src: "AQA 2023 P2 Q9", ctx: "A circuit has inputs A and B and outputs S and C. Its truth table is: A=0,B=0 → S=0,C=0; 0,1 → 1,0; 1,0 → 1,0; 1,1 → 0,1.",
      parts: [
        { q: "Draw a circuit that produces these outputs using two gates.", marks: 3, ms: ["A and B connected to an XOR gate whose output is S (1)", "A and B connected to an AND gate whose output is C (1)", "Both gates share the same two inputs; no other gates (1)"] },
        { q: "State the purpose of the circuit.", marks: 1, ms: ["It adds two bits together — it is a half adder (1)"] }
      ] },
    { src: "AQA 2024 P2 Q6", ctx: "A circuit implements Q = (A . ¬B) + ¬(C + D).",
      parts: [
        { q: "Draw the logic circuit, using AND, OR, NOT and NOR gates as appropriate.", marks: 4, ms: ["B connected to a NOT gate (1)", "A and the output of the NOT gate connected to an AND gate (1)", "C and D connected to a NOR gate (accept OR followed by NOT) (1)", "Outputs of the AND and NOR gates connected to an OR gate whose output is Q (1)", "Max 3 if the logic is not fully correct"] },
        { q: "The output Q is connected to the D input of a D-type flip-flop. Describe what happens to the flip-flop's output when a clock pulse arrives.", marks: 1, ms: ["The output Q of the flip-flop changes to the current value of D (1)"] }
      ] },
    { src: "AQA 2017 P2 Q4.4", q: "State the general purpose of a D-type flip-flop and explain the role of its clock input.", marks: 3,
      ms: ["To store the state of its data input — it acts as a one-bit memory (1)", "The clock input triggers the flip-flop so that, on the pulse, the stored state is updated to the current value of D (1)", "It also synchronises the operation of a group of flip-flops (1)"] },
    { level: "AS", src: "AS 2020 P2 Q5.2", q: "Draw a circuit that produces the XOR of inputs A and B using only AND, OR and NOT gates, and write the Boolean expression it implements.", marks: 3,
      ms: ["Expression A.¬B + ¬A.B (1)", "Two NOT gates (one per input) feeding two AND gates paired with the other input (1)", "AND outputs combined by an OR gate (1)"] },
    { level: "AS", src: "AS 2019 P2 Q6.2", q: "A conveyor belt motor must run when the start button is pressed and the guard is closed, or when the manual override is on and the guard is closed. Write a Boolean expression for the motor output M and draw the logic circuit.", marks: 3,
      ms: ["M = (S + O) . G (accept S.G + O.G) (1)", "S and O into an OR gate (1)", "OR output and G into an AND gate whose output is M (1)"] }
  ]
});

X("compsci:4.6.5.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Simplify a Boolean expression — 4 marks every paper" },
    "One mark for the **final answer** and up to three for working: a successful **De Morgan** application (with the NOT cancellations), an **identity** that produces a simpler expression (fewer operators), and **expanding brackets**. The distribution law earns one mark however many times it is applied. Marking stops at the first incorrect step, so **write every step and name the law** beside it.",
    { kv: [
      ["De Morgan", "¬(A + B) = ¬A . ¬B · ¬(A . B) = ¬A + ¬B"],
      ["Identities", "A + 0 = A · A . 1 = A · A + 1 = 1 · A . 0 = 0 · A + A = A · A . A = A · A + ¬A = 1 · A . ¬A = 0 · ¬¬A = A"],
      ["Absorption / redundancy", "A + A.B = A · A . (A + B) = A · A + ¬A.B = A + B"],
      ["Distribution", "A . (B + C) = A.B + A.C · A + B.C = (A + B) . (A + C)"],
      ["Justify A . ¬A = 0 (2019)", "If A is 0 then ¬A is 1 and vice versa, so one input to the AND is always 0; an AND outputs 1 only when both inputs are 1"]
    ]},
    { callout: { t: "tip", body: "Push NOT bars inwards with De Morgan **first**, cancel double NOTs, expand, then look for X + X.Y and X + ¬X patterns. Check the answer against a truth table row if time allows." }}
  ],
  flashcards: [
    ["State De Morgan's laws.", "¬(A + B) = ¬A . ¬B and ¬(A . B) = ¬A + ¬B."],
    ["Simplify A + A.B.", "A (absorption)."],
    ["Simplify A . (A + B).", "A (absorption)."],
    ["Simplify A + ¬A.B.", "A + B."],
    ["Simplify (A + B) . (B + C.(D + ¬D)).", "= (A + B).(B + C) = A.B + A.C + B + B.C = B + A.C."],
    ["Simplify ¬(¬(¬B . A) . ¬B) + A.B.", "De Morgan: ¬B.A + B; then + A.B is absorbed into B; ¬B.A + B = A + B by the redundancy theorem."],
    ["Why does A . ¬A = 0?", "One of A and ¬A is always 0, and an AND gate outputs 1 only when both inputs are 1."],
    ["What is the distributive law?", "A . (B + C) = A.B + A.C, and dually A + B.C = (A + B).(A + C)."],
    ["Simplify A.B + A.¬B.", "A (factor A out: A.(B + ¬B) = A.1)."],
    ["Simplify ¬(A + B) . ¬(C.D).", "¬A . ¬B . (¬C + ¬D)."]
  ],
  quiz: [
    { q: "¬(A . B) equals:", opts: ["¬A . ¬B", "¬A + ¬B", "A + B", "¬A"], ans: 1, why: "De Morgan." },
    { q: "A + A.B simplifies to:", opts: ["A.B", "A", "B", "1"], ans: 1, why: "Absorption." },
    { q: "A + ¬A.B simplifies to:", opts: ["A", "B", "A + B", "A.B"], ans: 2, why: "Redundancy theorem." },
    { q: "A . (A + B) simplifies to:", opts: ["A", "B", "A + B", "A.B"], ans: 0, why: "Absorption." },
    { q: "(A + B) . (A + C) equals:", opts: ["A + B.C", "A.B.C", "A + B + C", "A.(B + C)"], ans: 0, why: "Distributive law (OR over AND)." },
    { q: "A.¬B + A.B simplifies to:", opts: ["A", "B", "A.B", "0"], ans: 0, why: "Factor A: A.(¬B + B) = A." },
    { q: "In the mark scheme, a step that makes the expression more complex earns:", opts: ["1 mark", "nothing", "2 marks", "a bonus"], ans: 1, why: "Simpler = fewer operators." }
  ],
  exam: [
    { src: "AQA 2018 P2 Q10", q: "Simplify the Boolean expression `(A + B) . (B + C . (D + ¬D))`, showing each step and the law used.", marks: 4,
      ms: ["D + ¬D = 1 so C.(D + ¬D) = C: (A + B).(B + C) (1)", "Expand: A.B + A.C + B.B + B.C = A.B + A.C + B + B.C (distribution; B.B = B) (1)", "Absorption B + A.B = B and B + B.C = B: A.C + B (1)", "Final answer B + A.C (1)"] },
    { src: "AQA 2019 P2 Q8", ctx: "A circuit is described by the expression `¬(¬(¬B . A) . ¬B) + A . B`.",
      parts: [
        { q: "Simplify the expression, stating the law used at each step.", marks: 4, ms: ["De Morgan on the outer bar: ¬(¬(¬B.A)) + ¬(¬B) = ¬B.A + B (double NOTs cancel) (1)", "So the expression is ¬B.A + B + A.B; absorption B + A.B = B gives ¬B.A + B (1)", "Redundancy theorem X + ¬X.Y = X + Y with X = B, Y = A (1)", "Final answer A + B (1)"] },
        { q: "Explain why `A . ¬A = 0` for every value of A.", marks: 2, ms: ["If A is 0 then ¬A is 1, and if A is 1 then ¬A is 0 — one input to the AND is always 0 (1)", "An AND outputs 1 only when both inputs are 1, so the output is always 0 (1)"] }
      ] },
    { src: "AQA 2025 P2 Q13", q: "Simplify `¬(A . ¬(A + B)) + ¬(¬C + D)`, showing your working.", marks: 4,
      ms: ["De Morgan: ¬(A + B) = ¬A.¬B, so A . ¬A . ¬B = 0 (identity X.¬X = 0) (1)", "¬0 = 1, so the first term is 1 (1)", "De Morgan on the second term: ¬(¬C + D) = C . ¬D (1)", "1 + C.¬D = 1 — final answer 1 (identity 1 + X = 1) (1)"] },
    { src: "AQA 2022 P2 Q3", ctx: "Two expressions are claimed to be equivalent: `¬(A + B)` and `¬A . ¬B`.",
      parts: [
        { q: "Complete a truth table to demonstrate that the two expressions are equivalent.", marks: 1, ms: ["Both columns: 1, 0, 0, 0 for AB = 00, 01, 10, 11 (1)"] },
        { q: "State the name of the law demonstrated.", marks: 1, ms: ["De Morgan's law (1)"] },
        { q: "Simplify `¬(¬A . ¬(B + C)) . (A + B)`.", marks: 4, ms: ["De Morgan: ¬(¬A . ¬(B + C)) = A + (B + C) (1)", "= (A + B + C) . (A + B) (1)", "Expand / absorption: (A + B) . (A + B + C) = A + B (X . (X + Y) = X with X = A + B) (1)", "Final answer A + B (1)"] }
      ] }
  ]
});

})(KOS.content.extend);
