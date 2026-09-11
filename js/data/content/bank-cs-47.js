/* Kurenai OS — past-paper bank: AQA 7517 §4.7 Computer organisation and
   architecture. Modelled on AS/A-level Paper 2, June 2016–2025. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.7.1.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Buses, memory and I/O controllers" },
    { table: { head: ["Item", "Points"], rows: [
      ["Addressable memory from an n-bit address bus", "2ⁿ locations; × word/byte size for bytes; 32 lines → 2³² = 4 294 967 296 bytes; 36 lines with 16-bit words → 2³⁶ × 16 / 8 / 1024² = 128 GiB"],
      ["Why the data bus is bidirectional", "Data travels **to** memory on a write and **from** memory on a read; the address bus only ever carries addresses from the processor"],
      ["Which bus to widen to double addressable memory", "The **address bus** — one more line doubles the number of addresses"],
      ["Why a wider data bus improves performance", "More bits are transferred **at one time / in one cycle**, so fewer transfers are needed — \"data transferred faster\" is NE"],
      ["Control bus during a write", "Carries the **write** signal (and clock) so memory knows to store what is on the data bus"],
      ["Role of main memory (AS 2022)", "Stores the instructions (and data) of the running program; returns the contents of the location on the address bus via the data bus; the program is loaded from secondary storage into it"],
      ["Role of an I/O controller (2024, 2 marks)", "Lets the processor communicate with a peripheral through a port; makes the peripheral appear as registers/memory locations; translates signals / voltages between processor and device; buffers data; lets new peripherals be added without redesigning the processor; generates interrupts"],
      ["Why internal buses are parallel but peripherals use serial (2024)", "Internal: short fixed distances, high volume — parallel moves many bits at once. Peripherals: longer, movable cables — serial avoids skew and crosstalk, is cheaper and allows higher speed on one wire"]
    ]}}
  ],
  flashcards: [
    ["Name the three buses of the system bus and what each carries.", "Address bus — the address the processor wants to access (one-way); data bus — the data being transferred (two-way); control bus — control signals such as read, write, clock, interrupt request."],
    ["How many locations can a 32-line address bus address?", "2³² = 4 294 967 296."],
    ["Why is the data bus bidirectional?", "Data must travel to memory on a write and from memory on a read."],
    ["Which bus determines the maximum amount of addressable memory?", "The address bus — n lines give 2ⁿ addresses."],
    ["Why does a wider data bus improve performance?", "More bits are transferred in one operation, so fewer transfers are needed to move the same data."],
    ["What is the role of an I/O controller?", "It interfaces a peripheral to the processor: presents the device as ports/registers, translates and buffers data, converts voltages, and raises interrupts."],
    ["Why are internal buses parallel but USB serial?", "Inside the computer distances are short and fixed so many bits can travel at once; peripherals need longer, flexible cables where serial avoids data skew and crosstalk and is cheaper."],
    ["What does main memory do during execution?", "Holds the instructions and data of the running program, returning the contents of the addressed location on the data bus and storing results."]
  ],
  quiz: [
    { q: "A 20-line address bus can address:", opts: ["20 locations", "2²⁰ = 1 048 576 locations", "20 KiB", "2¹⁰ locations"], ans: 1, why: "2ⁿ." },
    { q: "Doubling addressable memory requires:", opts: ["a wider data bus", "one more address-bus line", "a faster clock", "more cache"], ans: 1, why: "2ⁿ⁺¹." },
    { q: "The data bus is bidirectional because:", opts: ["addresses go both ways", "data is read from and written to memory", "it carries control signals", "it is wider"], ans: 1, why: "Read and write." },
    { q: "The write signal travels on the:", opts: ["address bus", "data bus", "control bus", "I/O bus"], ans: 2, why: "Control signals." },
    { q: "An I/O controller makes a peripheral appear to the processor as:", opts: ["a file", "a set of registers / memory locations", "a bus", "a program"], ans: 1, why: "Ports." },
    { q: "'A wider data bus transfers data faster' scores:", opts: ["1", "0 — say more bits per transfer", "2", "half"], ans: 1, why: "NE per mark scheme." }
  ],
  exam: [
    { src: "AQA 2024 P2 Q3", ctx: "A computer has a 36-bit address bus, a 16-bit data bus and 16-bit memory words.",
      parts: [
        { q: "Calculate the maximum amount of memory, in gibibytes, that can be directly addressed.", marks: 2, ms: ["2³⁶ words × 16 bits ÷ 8 = 2³⁷ bytes (1)", "÷ 1024³ = 128 GiB (1)"] },
        { q: "State how the control bus is used when the processor writes a value to main memory.", marks: 1, ms: ["It carries the write signal telling memory to store the value on the data bus at the address on the address bus (1)"] },
        { q: "Describe two roles of an I/O controller.", marks: 2, ms: ["Allows the processor to communicate with a peripheral through a port / makes the peripheral appear as registers or memory locations (1)", "Translates signals or voltages between processor and device / buffers data / allows new peripherals without redesigning the processor / generates an interrupt when data is ready (1)"] },
        { q: "Explain why buses inside the computer are parallel while peripherals are usually connected serially.", marks: 3, ms: ["Internal components are close together at fixed positions and exchange large volumes of data, whereas peripherals are further away and may be moved (1)", "Parallel buses transmit many bits simultaneously (1)", "Serial connections avoid data skew and crosstalk, allow a higher clock rate on one wire, and cheaper, longer, more flexible cables (1)"] }
      ] },
    { level: "AS", src: "AS 2019 P2 Q7", q: "Describe how the address bus, data bus and control bus are used when the processor writes a value to a main memory location.", marks: 4,
      ms: ["The address of the location is placed on the address bus (1)", "The value to be stored is placed on the data bus (1)", "A write signal is sent along the control bus (1)", "Memory stores the value from the data bus at the addressed location; the data bus is bidirectional so it can also carry values back on a read (1)"] },
    { level: "AS", src: "AS 2022 P2 Q8.5", q: "A computer can address 4 GiB of memory. State which bus would need to be widened, and by how many lines, to allow 16 GiB to be addressed.", marks: 2,
      ms: ["The address bus (1)", "By 2 lines (each extra line doubles the addressable memory) (1)"] }
  ]
});

X("compsci:4.7.2.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Stored program concept — 2 marks, most years" },
    "The examiners underline five concepts and want at least four: **(machine code) instructions** are **stored in main memory**, and are **fetched** and **executed** **serially / in order** by a **processor** that performs arithmetic and logical operations. Accepted extras: programs can be moved into and out of main memory. Saying \"programs\" instead of \"instructions\" in the fetch/execute clause is rejected.",
    { callout: { t: "warn", body: "The 2021 false statement: *the computer can only be used with one program* — the whole point of the stored program concept is that a new program can be loaded into memory." }}
  ],
  flashcards: [
    ["State the stored program concept.", "Machine code instructions are stored in main memory and are fetched and executed serially / in order by a processor that performs arithmetic and logical operations."],
    ["What does the stored program concept allow?", "Programs can be loaded into and out of main memory, so the same hardware runs different programs."],
    ["Where are instructions held while a program runs?", "In main memory (RAM), alongside the data."],
    ["Who is credited with the stored program concept?", "John von Neumann (1945)."],
    ["Why must instructions and data both be in memory?", "The processor fetches instructions from memory in sequence and the instructions operate on data also held in memory."],
    ["Role of main memory in program execution?", "Stores the program's instructions and data; returns the contents of the location on the address bus; stores results; the program is loaded into it from secondary storage."],
    ["What happens before a program on disk can run?", "It is transferred from secondary storage into main memory."],
    ["Which statement about stored programs is false: (a) instructions in memory, (b) one program only, (c) fetched serially?", "(b) — different programs can be loaded."]
  ],
  quiz: [
    { q: "The stored program concept says instructions are:", opts: ["hard-wired", "stored in main memory and fetched and executed in sequence", "kept on disk only", "executed in parallel"], ans: 1, why: "Definition." },
    { q: "Which is NOT part of the concept?", opts: ["Instructions in main memory", "Serial fetch and execute", "The computer runs only one fixed program", "Processor does arithmetic and logic"], ans: 2, why: "2021 false statement." },
    { q: "Before execution a program stored on an SSD is:", opts: ["executed directly", "loaded into main memory", "compiled again", "sent to cache only"], ans: 1, why: "Main memory role." },
    { q: "In the phrase 'fetched and executed', the accepted subject is:", opts: ["programs", "instructions", "files", "data"], ans: 1, why: "R. programs." },
    { q: "Main memory during execution:", opts: ["stores only data", "stores instructions and data and returns addressed contents", "is read-only", "stores the compiler"], ans: 1, why: "AS 2022 P2 Q8.2." },
    { q: "The stored program concept is associated with:", opts: ["Turing", "von Neumann", "Boole", "Dijkstra"], ans: 1, why: "1945 report." }
  ],
  exam: [
    { src: "AQA 2025 P2 Q7.1", q: "State what is meant by the stored program concept.", marks: 2,
      ms: ["Machine code instructions are stored in main memory (1)", "Instructions are fetched and executed serially / in order by a processor that performs arithmetic and logical operations (1)"] },
    { level: "AS", src: "AS 2022 P2 Q8.2", q: "Describe the role of main memory when a program is executed.", marks: 2,
      ms: ["Stores the instructions to be executed and the data they use; the program is transferred into it from secondary storage (1)", "Returns the instruction / data held at the location specified on the address bus via the data bus, and stores results (1)"] }
  ]
});

X("compsci:4.7.3.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Registers and the control unit" },
    { kv: [
      ["Register (AS 2016, 2020)", "A **memory / storage location inside the processor** — \"memory location\" alone is NE"],
      ["Control unit (2021, 2025 — max 2–3)", "Controls fetch/load/store operations · **decodes** instructions · manages their execution · **sequences / synchronises** the fetch–execute cycle · sends **control signals** to other components · handles interrupts"],
      ["General-purpose registers", "Store values that are accessed frequently — operands and results of instructions; the programmer decides each one's role"],
      ["Status register (AS 2023, 2025)", "Stores information about the **result of the last instruction** — used to control **conditional branches**; flags: zero, sign/negative, carry, overflow, equal, interrupt enable, supervisor mode"],
      ["Why the CIR rather than the MBR (2017)", "Further memory fetches during execution (or storing the result) would **overwrite the MBR**; the CIR is wired to the control unit"],
      ["Why the volatile environment is saved on an interrupt (2020)", "So the running process can be **returned to** afterwards, because the interrupt handler will **overwrite register values**"],
      ["Registers addressable by an n-bit operand field (2025)", "2ⁿ"]
    ]}
  ],
  flashcards: [
    ["What is a register?", "A small, very fast memory location inside the processor."],
    ["Name the special-purpose registers in the fetch–execute cycle.", "Program counter (PC), memory address register (MAR), memory buffer/data register (MBR), current instruction register (CIR), status register, accumulator."],
    ["What does the program counter hold?", "The address of the next instruction to be fetched."],
    ["What does the MAR hold?", "The address of the memory location currently being read from or written to."],
    ["What does the MBR hold?", "The data just read from, or about to be written to, memory — including a fetched instruction before it moves to the CIR."],
    ["Why is the fetched instruction copied from the MBR to the CIR?", "So that data fetched or stored during execution does not overwrite the instruction; the control unit decodes from the CIR."],
    ["What is the role of the control unit?", "Controls fetching, decodes instructions, sequences and synchronises the fetch–execute cycle, and sends control signals to the other components."],
    ["What is the status register for?", "Holds flags describing the result of the last operation (zero, negative, carry, overflow) used to decide conditional branches."],
    ["What does the ALU do?", "Performs arithmetic (add, subtract…) and logical (AND, OR, comparisons, shifts) operations."],
    ["What is the clock's role?", "Emits regular pulses that synchronise the processor's operations; clock speed = pulses per second."]
  ],
  quiz: [
    { q: "The register holding the address of the next instruction is the:", opts: ["MAR", "PC", "CIR", "MBR"], ans: 1, why: "Program counter." },
    { q: "'A memory location' as the definition of a register scores:", opts: ["1", "0 — must say inside the processor", "2", "half"], ans: 1, why: "NE per mark scheme." },
    { q: "Which unit decodes instructions?", opts: ["ALU", "Control unit", "MBR", "Cache"], ans: 1, why: "CU role." },
    { q: "A conditional branch consults the:", opts: ["MAR", "status register", "data bus", "clock"], ans: 1, why: "Flags from the last operation." },
    { q: "With a 4-bit register-number field an instruction can address:", opts: ["4 registers", "8 registers", "16 registers", "32 registers"], ans: 2, why: "2⁴." },
    { q: "The volatile environment is saved on an interrupt so that:", opts: ["memory is freed", "the interrupted process can be resumed after the handler overwrites registers", "the clock stops", "cache is cleared"], ans: 1, why: "2020 P2 Q3.6." },
    { q: "The ALU performs:", opts: ["fetching", "decoding", "arithmetic and logical operations", "storage"], ans: 2, why: "Definition." }
  ],
  exam: [
    { src: "AQA 2025 P2 Q7.2", q: "Describe the roles of the control unit, the general-purpose registers and the status register in a processor.", marks: 6,
      ms: ["Control unit: controls fetch/load/store operations and decodes instructions (1)", "Control unit: sequences / synchronises the fetch–execute cycle and sends control signals to other components (1)", "General-purpose registers: store values that need to be accessed frequently / quickly (1)", "General-purpose registers: hold operands used by instructions and the results of executing them; the programmer decides each register's role (1)", "Status register: stores information about the result of the last arithmetic / logical instruction (1)", "Status register: its flags (zero, sign, carry, overflow…) control conditional branch instructions (1)"] },
    { src: "AQA 2017 P2 Q1.2", q: "Explain why the instruction is copied into the current instruction register rather than being decoded directly from the memory buffer register.", marks: 2,
      ms: ["Executing the instruction may require further data to be fetched from (or written to) memory (1)", "Those transfers would overwrite the contents of the MBR / the CIR is wired to the control unit that decodes it (1)"] },
    { src: "AQA 2020 P2 Q3.6", q: "When an interrupt is serviced, the processor first saves the contents of its registers (the volatile environment). Explain why.", marks: 2,
      ms: ["So that the currently running process can be returned to / resumed afterwards (1)", "Because the code that deals with the interrupt will change / overwrite the register values (1)"] },
    { level: "AS", src: "AS 2023 P2 Q8.1", q: "Explain the role of the status register, giving an example of when a flag in it would be set.", marks: 2,
      ms: ["Provides information about the result of the last arithmetic / logical instruction, used to control conditional branches (1)", "e.g. the zero flag is set when the result of a comparison / operation is zero; the carry flag when a carry occurs; the overflow flag on overflow (1)"] },
    { level: "AS", src: "AS 2020 P2 Q6.1", q: "State what is meant by a register.", marks: 1,
      ms: ["A memory / storage location inside the processor (1)"] }
  ]
});

X("compsci:4.7.3.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "The fetch–execute cycle — 4 to 12 marks, most papers" },
    "Whether it is the 4-mark *describe the fetch stage* (2017), the 8-mark *describe and explain each step* (AS 2020), the 6-mark *steps of the whole cycle* (AS 2017) or an area of a 12-mark essay (2019, 2023), the indicative content is the same ordered list. Use the **full register names** at least once (initials alone drop a mark in some schemes), name the **buses**, and say **why** each step happens when asked to explain.",
    { ol: [
      "**Fetch**: contents of the **PC** are copied to the **MAR** — so the address can be sent to memory",
      "The address is sent along the **address bus**; a **read** signal goes on the **control bus**",
      "The contents of the addressed location are returned on the **data bus** and loaded into the **MBR** — the value is only briefly on the bus, and not every fetch is an instruction",
      "The **PC is incremented** — so the next instruction in sequence can be fetched",
      "The contents of the **MBR** are copied to the **CIR** — so later data fetches do not overwrite the instruction",
      "**Decode**: the **control unit** decodes the instruction in the CIR, splitting it into **opcode and operand(s)**",
      "**Execute**: data fetched/stored if needed; the opcode identifies the operation; the **ALU** performs arithmetic/comparison; the result is stored in a register/accumulator or memory; the **status register** is updated; a **jump/branch** updates the PC"
    ]},
    { callout: { t: "memorise", h: "Interrupts (2020, 2023)", body: "An **interrupt** is a **signal from a device or program** telling the processor it needs attention. At the end of each cycle the processor **checks for interrupts**; if one of higher priority is pending it **saves the volatile environment** (registers) on the stack, runs the **interrupt service routine**, then **restores** the registers and resumes." }}
  ],
  flashcards: [
    ["Describe the fetch stage in five steps.", "PC → MAR; address on address bus with read signal; contents into MBR via data bus; PC incremented; MBR → CIR."],
    ["What happens in the decode stage?", "The control unit decodes the instruction held in the CIR, splitting it into opcode and operand(s) and determining what operation to perform."],
    ["What happens in the execute stage?", "Data is fetched or stored if needed; the ALU performs the operation identified by the opcode; the result is stored; the status register is updated; a branch changes the PC."],
    ["Why is the PC incremented during the fetch?", "So that the next instruction in sequence is fetched next time (unless a branch changes it)."],
    ["Why does the fetched value go into the MBR before the CIR?", "Not every fetch is an instruction; the value is only transiently on the bus; the MBR buffers the speed difference with memory."],
    ["What is an interrupt?", "A signal sent to the processor by a hardware device or a program indicating that it needs attention / an event has occurred."],
    ["Give three sources of interrupts.", "A key press or mouse click (I/O), a printer running out of paper, a timer, a hardware fault, a software error such as division by zero."],
    ["When does the processor check for interrupts?", "At the end of each fetch–execute cycle, before fetching the next instruction."],
    ["What happens when an interrupt is serviced?", "The current register contents (volatile environment) are saved to the stack, the interrupt service routine runs, then the registers are restored and the interrupted program continues."],
    ["What is the order: 'MBR → CIR', 'PC → MAR', 'CU decodes CIR', 'result stored'?", "PC → MAR; MBR → CIR; CU decodes CIR; result stored."]
  ],
  quiz: [
    { q: "The first step of the fetch stage is:", opts: ["MBR → CIR", "PC → MAR", "decode", "increment PC"], ans: 1, why: "The address must reach memory first." },
    { q: "The instruction reaches the processor from memory on the:", opts: ["address bus", "data bus", "control bus", "PC"], ans: 1, why: "Data bus carries contents." },
    { q: "The register that is incremented during fetch is the:", opts: ["MAR", "CIR", "PC", "MBR"], ans: 2, why: "Points to the next instruction." },
    { q: "Splitting an instruction into opcode and operand happens in:", opts: ["fetch", "decode", "execute", "store"], ans: 1, why: "Decode stage." },
    { q: "A conditional branch that is taken:", opts: ["changes the MAR", "updates the PC", "clears the CIR", "halts"], ans: 1, why: "New instruction address." },
    { q: "An interrupt is:", opts: ["a bus", "a signal from a device or program needing the processor's attention", "a register", "a jump instruction"], ans: 1, why: "Definition." },
    { q: "Interrupts are checked:", opts: ["every clock pulse", "at the end of each fetch–execute cycle", "only at boot", "never"], ans: 1, why: "Standard timing." }
  ],
  exam: [
    { level: "AS", src: "AS 2020 P2 Q6.5", q: "Describe the four steps of the fetch stage of the fetch–execute cycle and, for each, explain why it is carried out.", marks: 8,
      ms: ["The contents of the PC are transferred to the MAR (1) — so the address can be sent along the address bus to memory / so the PC can then be updated (1)", "The address in the MAR is placed on the address bus with a read signal, and the contents of that location are loaded via the data bus into the MBR (1) — because not every fetch is an instruction / the value is only transiently on the bus / the MBR copes with the speed difference between processor and memory (1)", "The PC is incremented (1) — so the next instruction in sequence can be fetched (1)", "The contents of the MBR are copied to the CIR (1) — so that data fetched during execution does not overwrite the instruction / because the control unit decodes from the CIR (1)", "Max 4 descriptions, max 4 explanations"] },
    { src: "AQA 2017 P2 Q1.1", q: "Describe how an instruction is fetched from main memory, with reference to the registers and buses involved.", marks: 4,
      ms: ["Contents of the program counter transferred to the memory address register (1)", "Address bus used to transfer this address to main memory (with a read signal on the control bus) (1)", "The instruction is transferred using the data bus into the memory buffer register (1)", "Contents of the MBR transferred to the current instruction register; PC incremented (1)"] },
    { level: "AS", src: "AS 2025 P2 Q9.2", q: "Describe what happens during the decode stage of the fetch–execute cycle.", marks: 3,
      ms: ["The instruction held in the current instruction register is decoded (1)", "By the control unit, which determines the type of instruction to carry out (1)", "The instruction is split into opcode and operand(s) (1)"] },
    { src: "AQA 2023 P2 Q4.2", q: "Explain what an interrupt is and describe what the processor does when it detects one.", marks: 4,
      ms: ["A signal sent to the processor by a hardware device or program indicating that it requires attention / an event has occurred (1)", "At the end of the current fetch–execute cycle the processor checks for interrupts and compares priority (1)", "It saves the contents of its registers (the volatile environment) onto the stack (1)", "Executes the interrupt service routine, then restores the registers and resumes the interrupted program (1)"] },
    { level: "AS", src: "AS 2022 P2 Q8.1", q: "Place the following events of the fetch–execute cycle in the order they occur: (A) the contents of the MBR are copied to the CIR; (B) the contents of the PC are copied to the MAR; (C) the control unit decodes the contents of the CIR; (D) the result of the calculation is stored.", marks: 3,
      ms: ["B first (1)", "A second, C third (1)", "D last — all correct for 3 marks (1)"] }
  ]
});

X("compsci:4.7.3.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Instruction format — opcode, operand, addressing bits" },
    "Questions give a format such as *16-bit instruction: 6-bit opcode (4 bits operation + 2 bits addressing mode), 10-bit operand* and ask: **how many different opcodes / operations** (2⁴ = 16), **how many memory locations can be addressed directly** (2¹⁰ = 1024), **how many registers** an n-bit register field can name (2ⁿ), or the **range of an immediate two's complement operand** (12 bits → −2048 to 2047). Then: **why is an executable processor-specific?** — it is machine code using the **instruction set of the processor it was compiled for**; **different processors have different instruction sets**.",
    { callout: { t: "def", h: "Operand (2017)", body: "The **value / data** the instruction uses. The **addressing mode** tells the processor **how to interpret** the operand — as the datum itself (immediate) or as the address / register that holds it (direct)." }}
  ],
  flashcards: [
    ["What is the instruction set of a processor?", "The complete set of machine-code operations the processor can carry out — specific to that processor family."],
    ["What are the two parts of a machine code instruction?", "The opcode (the operation to perform, including addressing-mode bits) and the operand(s) (the data, register number or address to use)."],
    ["A 6-bit opcode field supports how many operations?", "2⁶ = 64."],
    ["A 10-bit operand with direct addressing can address how many locations?", "2¹⁰ = 1024."],
    ["Range of a 12-bit two's complement immediate operand?", "−2048 to +2047."],
    ["Why is a compiled executable processor-specific?", "It is machine code using the instruction set of the processor it was compiled for, and different processors have different instruction sets."],
    ["What is the operand?", "The value / data that the instruction operates on (or its address)."],
    ["How does the processor know whether an operand is data or an address?", "From the addressing-mode bits in the opcode."]
  ],
  quiz: [
    { q: "An instruction format has a 4-bit operation code. Maximum number of operations:", opts: ["4", "8", "16", "32"], ans: 2, why: "2⁴." },
    { q: "With a 3-bit register field, how many registers can be named?", opts: ["3", "6", "8", "16"], ans: 2, why: "2³." },
    { q: "A compiled program will not run on a different processor family because:", opts: ["it is too large", "it uses the instruction set of the original processor", "it is interpreted", "of copyright"], ans: 1, why: "Machine code is processor-specific." },
    { q: "The opcode specifies:", opts: ["the data value", "the operation (and addressing mode)", "the memory size", "the clock speed"], ans: 1, why: "Definition." },
    { q: "An 8-bit two's complement immediate operand has range:", opts: ["0–255", "−128 to 127", "−127 to 128", "−256 to 255"], ans: 1, why: "−2⁷ to 2⁷ − 1." },
    { q: "In `ADD R1, R2, #5` the `#5` is:", opts: ["an opcode", "an immediate operand", "an address", "a register"], ans: 1, why: "# means immediate value." }
  ],
  exam: [
    { level: "AS", src: "AS 2018 P2 Q10", ctx: "A processor uses 16-bit instructions: bits 15–12 hold the basic operation code, bits 11–10 the addressing mode, and bits 9–0 the operand.",
      parts: [
        { q: "State the maximum number of different basic operations the processor can support.", marks: 1, ms: ["16 (1)"] },
        { q: "State the number of memory locations that can be addressed using direct addressing.", marks: 1, ms: ["1024 (2¹⁰) (1)"] },
        { q: "State the range of values that can be used as an immediate operand if it is interpreted as a two's complement integer.", marks: 1, ms: ["−512 to 511 (1)"] }
      ] },
    { level: "AS", src: "AS 2023 P2 Q8.3", q: "A program compiled for one computer will not run on a computer with a different type of processor. Explain why.", marks: 2,
      ms: ["The executable is machine code using the instruction set of the processor it was compiled for (1)", "Different processors have different instruction sets / architectures (1)"] },
    { src: "AQA 2017 P2 Q5.1", q: "Explain the purpose of the operand in a machine code instruction and the role of the addressing mode.", marks: 2,
      ms: ["The operand is the value / data that the operation will use (1)", "The addressing mode indicates how the operand should be interpreted — whether it is the datum itself or a memory address / register number holding the datum (1)"] }
  ]
});

X("compsci:4.7.3.4", {
  flashcards: [
    ["What is immediate addressing?", "The operand is the actual value to be used, e.g. `MOV R1, #42`."],
    ["What is direct addressing?", "The operand is the memory address (or register number) where the value is stored, e.g. `LDR R1, 200`."],
    ["Difference between direct and immediate addressing?", "Direct: the operand is the address of the datum. Immediate: the operand is the datum."],
    ["Which AQA instruction uses immediate addressing: `LDR R2, 105` or `MOV R2, #105`?", "`MOV R2, #105` — the # marks an immediate value."],
    ["What other types of value can an operand hold besides an immediate value?", "A register number; a memory address (or an offset from one)."],
    ["Complete `MOV R3, ___` to load the value 7 immediately.", "`MOV R3, #7`."],
    ["Why is immediate addressing faster?", "No extra memory access is needed — the value is in the instruction."],
    ["In `ADD R0, R1, R2` how are the operands addressed?", "By register — each operand is a register number."]
  ],
  quiz: [
    { q: "`LDR R1, 50` loads R1 with:", opts: ["the value 50", "the contents of memory location 50", "register 50", "nothing"], ans: 1, why: "Direct addressing." },
    { q: "`MOV R1, #50` loads R1 with:", opts: ["the contents of location 50", "the value 50", "register 50", "an address"], ans: 1, why: "Immediate." },
    { q: "The addressing mode that needs no extra memory access is:", opts: ["direct", "immediate", "indirect", "indexed"], ans: 1, why: "Value in the instruction." },
    { q: "Which is NOT a type of value an operand can hold in the AQA instruction set?", opts: ["a register number", "a memory address", "an immediate value", "a file name"], ans: 3, why: "Operands are numbers." },
    { q: "`CMP R1, #0` compares R1 with:", opts: ["memory location 0", "the value zero", "register 0", "the PC"], ans: 1, why: "# = immediate." },
    { q: "To load the value stored at address 300 into R4:", opts: ["MOV R4, #300", "LDR R4, 300", "STR R4, 300", "ADD R4, 300"], ans: 1, why: "LDR with a direct address." }
  ],
  exam: [
    { level: "AS", src: "AS 2017 P2 Q7.3", q: "Explain the difference between direct addressing and immediate addressing.", marks: 1,
      ms: ["In direct addressing the operand is the memory address (or register number) of the datum, whereas in immediate addressing the operand is the datum itself (1)"] },
    { level: "AS", src: "AS 2024 P2 Q7.3", q: "Other than an immediate value, state two types of value that the operand of an instruction can hold.", marks: 2,
      ms: ["A register number (1)", "A memory address / location (accept an offset from a memory location) (1)"] },
    { src: "AQA 2025 P2 Q7.4", q: "An immediate operand occupies 10 bits and is interpreted as a two's complement integer. State the most positive and most negative values it can hold.", marks: 1,
      ms: ["Most positive 511 (2⁹ − 1); most negative −512 (−2⁹) — both required (1)"] },
    { level: "AS", src: "AS 2022 P2 Q9.1", q: "State which of the following instructions uses immediate addressing: (A) `LDR R3, 42` (B) `MOV R3, #42` (C) `STR R3, 42` (D) `ADD R3, R1, R2`.", marks: 1,
      ms: ["B (1)"] }
  ]
});

X("compsci:4.7.3.5", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "AQA assembly — the 4 to 10 mark programming items" },
    "Every Paper 2 has an assembly task using the AQA instruction set: **LDR/STR** (memory ↔ register), **MOV**, **ADD/SUB**, **CMP** followed by **B / BEQ / BNE / BGT / BLT** with labels, the bitwise **AND / ORR / EOR / MVN**, shifts **LSL / LSR**, and **HALT**. Recurring tasks: a **counting loop** (AS 2017), **division by repeated subtraction** (AS 2018), **multiplication by repeated addition** (AS 2023) or by **shift-and-add** (AS 2019, 2022), **triangular numbers** (AS 2025), an **IF statement** translated to CMP + branch (AS 2016, 2022), the **Caesar cipher** (ADD then wrap) and **Vernam** (EOR), a **parity bit** by shifting and ANDing with #1 (2024), **masking** sensor bits with AND/ORR (2025).",
    { callout: { t: "tip", h: "How traces are marked", body: "One mark per register/memory column with correct values in sequence, one for the output/final value; *repeated consecutive values ignored*. Write a column for **every** register the program touches, including the comparison flags if a CMP is involved." }},
    { callout: { t: "memorise", body: "**Masks**: AND with a mask to **clear / test** bits (`AND R1, R1, #1` isolates the LSB → odd/even). OR to **set** bits. EOR to **toggle** bits or implement Vernam. **LSL n** multiplies by 2ⁿ; **LSR n** divides by 2ⁿ (logical shift fills with zeros)." }}
  ],
  flashcards: [
    ["What does `LDR R1, 100` do?", "Loads register R1 with the contents of memory location 100."],
    ["What does `STR R1, 100` do?", "Stores the contents of R1 into memory location 100."],
    ["What does `CMP R1, #10` followed by `BGT loop` do?", "Compares R1 with 10 and branches to label `loop` if R1 > 10."],
    ["How do you test whether R1 is odd in assembly?", "`AND R2, R1, #1` — R2 is 1 if odd, 0 if even (mask the least significant bit)."],
    ["What does `LSL R2, R1, #3` do?", "Logical shift left by 3: R2 = R1 × 8."],
    ["What does `LSR R2, R1, #1` do?", "Logical shift right by 1: R2 = R1 DIV 2 (zero fills the MSB)."],
    ["Write assembly to multiply R1 by 3 using ADD only.", "`ADD R2, R1, R1` then `ADD R2, R2, R1`."],
    ["How is a Vernam cipher implemented in assembly?", "Load plaintext and key into registers, `EOR R3, R1, R2`, store the result."],
    ["What does `MVN R1, R2` do?", "Loads R1 with the bitwise NOT of R2."],
    ["What does `EOR R3, R1, R2` do?", "R3 = R1 XOR R2, bit by bit."],
    ["Write a loop that counts down from R1 to 0.", "loop: SUB R1, R1, #1 / CMP R1, #0 / BNE loop / HALT"],
    ["What does `ORR R1, R1, #4` do?", "Sets bit 2 of R1 (mask 00000100) leaving the other bits unchanged."]
  ],
  quiz: [
    { q: "`AND R2, R1, #1` sets R2 to 1 when R1 is:", opts: ["even", "odd", "negative", "zero"], ans: 1, why: "LSB isolated." },
    { q: "`LSL R1, R1, #2` is equivalent to:", opts: ["R1 + 2", "R1 × 4", "R1 ÷ 4", "R1 − 2"], ans: 1, why: "Shift left 2 = × 2²." },
    { q: "After `CMP R1, R2`, `BEQ done` branches when:", opts: ["R1 > R2", "R1 = R2", "R1 < R2", "always"], ans: 1, why: "Equal flag." },
    { q: "To toggle bit 0 of R1 you use:", opts: ["AND R1, R1, #1", "ORR R1, R1, #1", "EOR R1, R1, #1", "MVN R1, R1"], ans: 2, why: "XOR flips." },
    { q: "Shift-and-add multiplication tests each bit of the multiplier with:", opts: ["ORR", "AND with #1 then LSR", "MVN", "STR"], ans: 1, why: "Mask then shift." },
    { q: "`SUB R1, R1, #26` after `CMP R1, #90` / `BLE skip` implements:", opts: ["Vernam", "Caesar wrap-around past 'Z'", "parity", "division"], ans: 1, why: "Wrap back into A–Z." },
    { q: "Which instruction stores a register to memory?", opts: ["LDR", "STR", "MOV", "CMP"], ans: 1, why: "Store." }
  ],
  exam: [
    { level: "AS", src: "AS 2023 P2 Q9", q: "Write an assembly language program, using the AQA instruction set, that multiplies the values in memory locations 100 and 101 by repeated addition and stores the result in location 102. Assume both values are positive integers.", marks: 4,
      ms: ["Values loaded into registers and a result register initialised to 0: `LDR R1, 100` / `LDR R2, 101` / `MOV R3, #0` (1)", "Loop that adds R1 to the result: `loop: ADD R3, R3, R1` (1)", "Counter decremented and tested: `SUB R2, R2, #1` / `CMP R2, #0` / `BNE loop` (1)", "Result stored and program halted: `STR R3, 102` / `HALT` (1)"] },
    { src: "AQA 2024 P2 Q10.1", ctx: "The program below is run with memory location 200 containing `01011010`.",
      code: { lang: "pseudo", src: "LDR R1, 200\nMOV R2, #0\nMOV R3, #8\nloop:\nAND R4, R1, #1\nADD R2, R2, R4\nLSR R1, R1, #1\nSUB R3, R3, #1\nCMP R3, #0\nBNE loop\nAND R2, R2, #1\nSTR R2, 201\nHALT" },
      parts: [
        { q: "Complete a trace table showing the values of R1, R2, R3 and R4 for the first three iterations, and state the final value stored in location 201.", marks: 4, ms: ["R4: 0, 1, 0 and R2: 0, 1, 1 for the first three iterations (1)", "R1: 00101101, 00010110, 00001011 (1)", "R3: 7, 6, 5 (1)", "Final R2 = 4 AND 1 = 0 → location 201 holds 0 (1)"] },
        { q: "Describe the purpose of the program.", marks: 2, ms: ["Counts the number of 1s in the byte (1)", "and stores the (even) parity bit — 1 if the count is odd, 0 if even (1)"] }
      ] },
    { level: "AS", src: "AS 2022 P2 Q9.2", q: "Translate the following pseudo-code into AQA assembly language, where `x` is in memory location 50 and `y` in location 51: `IF x > y THEN z ← x − y ELSE z ← 0 ENDIF`; store `z` in location 52.", marks: 4,
      ms: ["`LDR R1, 50` / `LDR R2, 51` (1)", "`CMP R1, R2` / `BGT bigger` (1)", "Else path: `MOV R3, #0` / `B store`; `bigger: SUB R3, R1, R2` (1)", "`store: STR R3, 52` / `HALT` (1)"] },
    { src: "AQA 2020 P2 Q9.3", q: "Memory location 101 holds a plaintext character code and location 102 holds a key. Write assembly language instructions that store the Vernam-encrypted value in location 103.", marks: 3,
      ms: ["Values loaded into two registers: `LDR R1, 101` / `LDR R2, 102` (1)", "Registers exclusive-ORed: `EOR R3, R1, R2` (1)", "Result stored: `STR R3, 103` (1)"] },
    { level: "AS", src: "AS 2016 P2 Q4.2", q: "Complete the instruction `AND R2, R1, #___` so that R2 becomes 1 if the value in R1 is odd and 0 if it is even.", marks: 1,
      ms: ["#1 (1)"] },
    { level: "AS", src: "AS 2025 P2 Q10.2", q: "Write an AQA assembly language program that calculates the nth triangular number (1 + 2 + … + n), where n is stored in memory location 60, and stores the result in location 61.", marks: 4,
      ms: ["`LDR R1, 60` and result register set to 0 (1)", "Loop adding the counter to the total: `loop: ADD R2, R2, R1` (1)", "Counter decremented and loop repeated while it is not zero: `SUB R1, R1, #1` / `CMP R1, #0` / `BNE loop` (1)", "`STR R2, 61` / `HALT` (1)"] }
  ]
});

X("compsci:4.7.3.6", {
  flashcards: [
    ["Define an interrupt.", "A signal sent to the processor by a hardware device or software indicating that it needs attention."],
    ["Give three sources of interrupt.", "I/O device ready (key press, printer), timer, hardware fault (power failure), software (division by zero, system call)."],
    ["When is an interrupt detected?", "At the end of each fetch–execute cycle the processor checks the interrupt register / line."],
    ["What is the volatile environment?", "The contents of the processor's registers (PC, accumulator, status…) for the running program."],
    ["Why is the volatile environment saved before servicing an interrupt?", "So the interrupted program can be resumed afterwards, because the interrupt handler overwrites the registers."],
    ["What is an interrupt service routine (ISR)?", "The code that handles a particular interrupt."],
    ["What happens after the ISR finishes?", "The saved registers are restored and the interrupted program continues from where it stopped."],
    ["What if a higher-priority interrupt arrives during an ISR?", "The ISR itself is interrupted (its state saved) and the higher-priority one is serviced first."],
    ["Why are interrupts better than polling?", "The processor does useful work instead of repeatedly checking devices; devices get attention promptly."]
  ],
  quiz: [
    { q: "An interrupt is checked for:", opts: ["during decode", "at the end of each fetch–execute cycle", "only when idle", "at boot"], ans: 1, why: "Before the next fetch." },
    { q: "The volatile environment is:", opts: ["RAM contents", "the processor's register contents", "the hard disk", "the cache"], ans: 1, why: "Saved on interrupt." },
    { q: "The code run in response to an interrupt is the:", opts: ["bootloader", "interrupt service routine", "scheduler", "compiler"], ans: 1, why: "ISR." },
    { q: "A division-by-zero error raises a:", opts: ["hardware interrupt", "software interrupt", "timer interrupt", "bus error"], ans: 1, why: "Software-generated." },
    { q: "Registers are saved to the:", opts: ["heap", "stack", "cache", "ROM"], ans: 1, why: "LIFO handles nested interrupts." },
    { q: "Interrupt priority decides:", opts: ["which device is fastest", "whether the current ISR is itself interrupted", "clock speed", "bus width"], ans: 1, why: "Higher priority pre-empts." }
  ],
  exam: [
    { src: "AQA 2020 P2 Q3.5", q: "Explain the role of interrupts in a computer system.", marks: 2,
      ms: ["A signal from a device or program that alerts the processor that it needs attention / an event has occurred (1)", "The processor suspends the current program (saving its state), runs the interrupt service routine, then resumes — so devices are dealt with promptly without polling (1)"] },
    { src: "AQA 2018 P2 Q7", q: "Describe what happens when the processor receives an interrupt from a keyboard while executing a program.", marks: 4,
      ms: ["At the end of the current fetch–execute cycle the processor detects the interrupt and checks its priority (1)", "The contents of the registers (volatile environment, including the PC) are saved onto the stack (1)", "The PC is loaded with the address of the keyboard's interrupt service routine, which executes (reads the key) (1)", "The registers are restored from the stack and the original program resumes from the next instruction (1)"] }
  ]
});

X("compsci:4.7.3.7", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Processor performance — factor + how it helps" },
    "AS 2016 (6 marks) and the 2023 essay both award one mark for **the factor** and one for **how it improves performance** — \"program runs faster\" is NE:",
    { table: { head: ["Factor", "How it improves performance"], rows: [
      ["Clock speed", "More instructions executed per second / each instruction completes sooner — but only helps **sequential** work (AS 2018: a 3.2 GHz core beats a 2.8 GHz core when parallel processing is not possible)"],
      ["Number of cores", "Several instructions / processes executed **simultaneously** — helps only if the software can be parallelised"],
      ["Cache size / type", "Cache is **faster than main memory**; more cache raises the **probability of a cache hit**, so fewer slow fetches from RAM"],
      ["Word length", "More bits processed / transferred **in one operation**"],
      ["Data bus width", "More bits transferred between memory and processor **at one time** — fewer transfers"],
      ["Address bus width", "More main memory can be addressed / installed, so less use of virtual memory"],
      ["More general-purpose registers", "More intermediate results kept in the processor rather than main memory"],
      ["Pipelining / Harvard architecture", "Overlap fetch, decode and execute of successive instructions / fetch instruction and data simultaneously"]
    ]}},
    { callout: { t: "def", h: "Cache (2021, 4 marks)", body: "Memory that can be **accessed very quickly**, located **on or close to the processor**, storing the **most frequently / recently used** instructions and data (or pre-fetched ones). More cache → more items held → higher chance the item needed is in cache → fewer main-memory fetches." }}
  ],
  flashcards: [
    ["How does a higher clock speed improve performance?", "More instructions can be executed per second — each instruction completes sooner."],
    ["When does a higher clock speed NOT help much?", "When the task can be parallelised and a processor with more cores could split it — or when the bottleneck is memory/disk."],
    ["How do more cores improve performance?", "Multiple instructions / processes execute simultaneously — provided the software is written to use parallel processing."],
    ["What is cache memory?", "Very fast memory on or close to the processor storing the most frequently or recently used instructions and data."],
    ["How does more cache improve performance?", "More items fit, so the probability of a cache hit rises and fewer slow fetches from main memory are needed."],
    ["How does word length affect performance?", "A larger word means more bits are processed or transferred in a single operation."],
    ["How does data bus width affect performance?", "More bits move between memory and processor per transfer, so fewer transfers are needed."],
    ["How does address bus width affect performance?", "More memory can be addressed / installed, reducing reliance on slower virtual memory."],
    ["What is pipelining?", "Overlapping the fetch, decode and execute stages of successive instructions so the processor does not idle between stages."],
    ["Why do more general-purpose registers help?", "Intermediate values stay inside the processor instead of being written to and read from main memory."]
  ],
  quiz: [
    { q: "Which change most helps a program that cannot be parallelised?", opts: ["More cores", "Higher clock speed", "More cores and lower clock", "Wider address bus"], ans: 1, why: "Sequential work depends on per-core speed." },
    { q: "Cache improves performance because:", opts: ["it is larger than RAM", "it is faster than RAM and holds frequently used items", "it replaces the disk", "it is non-volatile"], ans: 1, why: "Higher hit rate." },
    { q: "Doubling the word length lets the processor:", opts: ["address more memory only", "process more bits in one operation", "run at higher clock speed", "use less cache"], ans: 1, why: "Wider operations." },
    { q: "A wider address bus improves performance by:", opts: ["faster transfers", "allowing more main memory, reducing virtual memory use", "more cores", "faster clock"], ans: 1, why: "Less paging." },
    { q: "'The program will run faster' as an explanation scores:", opts: ["1", "0 — NE", "2", "bonus"], ans: 1, why: "Must say how." },
    { q: "Pipelining improves performance by:", opts: ["adding cache", "overlapping stages of successive instructions", "widening buses", "raising voltage"], ans: 1, why: "Stage overlap." }
  ],
  exam: [
    { level: "AS", src: "AS 2016 P2 Q5.6", q: "Describe three factors that affect processor performance and, for each, explain how changing it would improve performance.", marks: 6,
      ms: ["Clock speed (1) — more instructions executed per second / each instruction executed sooner (1)", "Number of cores (1) — instructions / processes can be executed simultaneously (1)", "Amount of cache (1) — cache is faster than main memory so the more that is held there the less often main memory is accessed (1)", "Word length (1) — more bits processed in one go (1)", "Data bus width (1) — more bits transferred at one time (1)", "Address bus width (1) — more memory can be addressed so less virtual memory is used (1)", "Number of general-purpose registers (1) — more intermediate results kept in the processor (1)", "Max 6: factor + relevant explanation"] },
    { src: "AQA 2021 P2 Q14.3", q: "Explain what cache memory is and how increasing the amount of cache would improve the performance of a computer.", marks: 4,
      ms: ["Memory that can be accessed very quickly, located on or close to the processor (1)", "Used to store the most frequently / recently used (or pre-fetched) instructions and data (1)", "More cache means more instructions and data can be held there (1)", "Increasing the probability of a cache hit, so fewer fetches from slower main memory are needed (1)"] },
    { level: "AS", src: "AS 2018 P2 Q6.3", q: "Josephine's computer has a 3.2 GHz processor and Ella's has a 2.8 GHz processor with more cores. Explain when Josephine's computer would complete a task sooner.", marks: 2,
      ms: ["The 3.2 GHz processor executes sequential instructions more quickly (1)", "So where the task cannot be parallelised across cores, the higher clock speed finishes sooner (1)"] },
    { level: "AS", src: "AS 2024 P2 Q7.4", q: "Explain how (i) increasing the cache size and (ii) increasing the word length would each improve processor performance.", marks: 2,
      ms: ["(i) Increases the likelihood that the required instructions / data are found in cache, which is faster than main memory (1)", "(ii) More bits can be processed / transferred simultaneously in a single instruction (1)"] }
  ]
});

X("compsci:4.7.4.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Principles of operation — barcode, RFID, camera, laser printer" },
    { kv: [
      ["RFID (3 marks)", "The reader **emits radio waves**; the waves **induce a current** that powers (a passive) tag / activate it; the tag's chip holds the data; the tag **transmits its data by radio** back to the reader, which converts it to binary"],
      ["Passive vs active tags (AS 2024)", "Passive: no battery — smaller, cheaper, only readable at short range (harder to intercept), never needs charging. Active: battery-powered, longer range"],
      ["RFID vs barcode (2020, 2022)", "RFID: read without line of sight / while items stay on a pallet, at a distance, many at once, quickly, not easily damaged. Barcode: far cheaper, less e-waste, existing scanners, human-readable digits as backup, no radio interference"],
      ["Barcode reader (reflected light)", "Light/laser directed at the code; moved across it by a rotating mirror or the user; black bars reflect less, white more; a **photodiode / CCD measures the reflected light**; the pattern is decoded to digits"],
      ["Digital camera (AS 2025)", "Light through the lens onto an array of **photosensors (CCD / CMOS)**; each produces a **voltage proportional to brightness**; **RGB filters** give colour components; an **ADC** converts the voltages to binary pixel values; stored as a bitmap with metadata"],
      ["Laser printer (6 marks)", "Bitmap of the page built in memory; the **drum is given a charge**; a **laser** (via a rotating mirror) draws on the drum, **neutralising the charge** where the image is dark; **toner** is charged and **sticks to the discharged areas**; **paper** passes over the drum and toner transfers (helped by a charged transfer roller); the **fuser** heats to bond toner to paper; colour uses four toners/drums"]
    ]}
  ],
  flashcards: [
    ["Describe how data is read from an RFID tag.", "The reader emits radio waves; these induce a current in the tag's antenna, powering it; the tag transmits the data stored on its chip back by radio; the reader converts the signal to binary."],
    ["Why are passive RFID tags used in passports?", "No battery to replace; smaller and cheaper; readable only at very short range, so harder to intercept."],
    ["Give two advantages of RFID over barcodes for a warehouse.", "Tags can be read without line of sight / while items stay on the pallet; many tags read at a distance and quickly without manual scanning; tags are less easily damaged."],
    ["Give two advantages of barcodes over RFID.", "Much cheaper per item; readable with existing checkout scanners; human-readable digits as a backup; no radio interference."],
    ["Describe how a barcode reader works.", "A laser or LED illuminates the code; a mirror sweeps the beam (or the user moves the reader); black bars reflect less light than white spaces; a photodiode measures the reflections and the pattern is decoded to digits, often with a check digit."],
    ["Describe how a digital camera captures an image.", "Light passes through the lens onto a CCD/CMOS sensor array; each photosensor outputs a voltage proportional to the light; RGB filters separate colour; an ADC converts each voltage to a binary pixel value; the pixels are stored as a bitmap."],
    ["Describe how a laser printer prints.", "A bitmap of the page is built; the drum is charged; a laser via a rotating mirror discharges the drum where the image is; charged toner sticks to those areas; paper passes over the drum and toner transfers; a heated fuser bonds the toner; colour printers repeat with four toners."],
    ["Why might a laser printer suit a small office?", "Low cost per page, fast printing, toner does not dry out, high-resolution text; with a wireless adapter it is easily shared by all devices."]
  ],
  quiz: [
    { q: "A passive RFID tag is powered by:", opts: ["a battery", "current induced by the reader's radio waves", "solar cells", "the barcode"], ans: 1, why: "Induction." },
    { q: "In a barcode reader, the component measuring reflected light is a:", opts: ["laser", "photodiode / light sensor", "mirror", "DAC"], ans: 1, why: "Detector." },
    { q: "Each photosensor in a camera produces:", opts: ["a binary pixel", "an analogue voltage proportional to light", "a colour name", "a MIDI event"], ans: 1, why: "Converted later by the ADC." },
    { q: "In a laser printer the laser:", opts: ["heats the paper", "discharges the drum where the image is", "melts the toner", "scans the page"], ans: 1, why: "Charge pattern." },
    { q: "Toner is bonded to the paper by:", opts: ["the laser", "the drum", "a heated fuser", "the mirror"], ans: 2, why: "Heat and pressure." },
    { q: "RFID beats barcodes for reading a whole pallet because:", opts: ["tags are cheaper", "no line of sight is needed and many tags are read at once", "barcodes cannot be printed", "RFID uses light"], ans: 1, why: "2020 P2 Q8.1." }
  ],
  exam: [
    { level: "AS", src: "AS 2024 P2 Q9", ctx: "A passport contains a passive RFID tag storing the holder's details.",
      parts: [
        { q: "Describe how data is read from the RFID tag.", marks: 3, ms: ["The RFID reader emits radio waves (1)", "The waves induce sufficient power in the tag's antenna to activate the tag / the data is stored on the tag's chip (1)", "The tag transmits its data back to the reader by radio waves, which the reader converts to binary (1)"] },
        { q: "Explain why passive tags rather than active tags are used in passports.", marks: 2, ms: ["Passive tags are smaller / cheaper / have no battery to charge or replace during the passport's ten-year life (1)", "They can only be read close to the reader, so the data is harder to intercept — a security benefit (1)"] }
      ] },
    { src: "AQA 2021 P2 Q7.2", q: "Describe the principles of operation of a laser printer.", marks: 6,
      ms: ["A bitmap of the page is built in the printer's memory from the page description (1)", "The photosensitive drum is given a (negative) charge (1)", "A laser, directed by a rotating mirror, is switched on and off across the drum, neutralising the charge where the image should be dark (1)", "Toner is charged and sticks to the drum only where the laser has struck (1)", "Paper passes over the drum and the toner transfers to it, helped by a charged transfer roller (1)", "A heated fuser bonds the toner to the paper; colour printing repeats the process with four toners / drums (1)"] },
    { level: "AS", src: "AS 2025 P2 Q11.1", q: "Describe the principles of operation of a digital camera.", marks: 3,
      ms: ["Light passes through the lens onto an array of photosensors (CCD / CMOS) (1)", "Each sensor outputs an analogue voltage proportional to the brightness of the light falling on it; red, green and blue filters give the colour components (1)", "An analogue-to-digital converter converts each voltage to a binary value, forming the pixels of a bitmap (1)"] },
    { src: "AQA 2020 P2 Q8", ctx: "A supermarket chain uses RFID tags in its warehouses but barcodes on products in its stores.",
      parts: [
        { q: "Explain why RFID is more suitable than barcodes for identifying stock arriving at a warehouse.", marks: 2, ms: ["Many products arrive together on pallets and must be identified quickly (1)", "RFID tags can be read without removing products from the pallet / without line of sight / at a distance / many at once / without manual scanning / are less easily damaged (1)"] },
        { q: "Explain why barcodes remain more suitable for products in the store.", marks: 2, ms: ["Barcodes are far cheaper than tags / produce no electronic waste / can be read by existing checkout scanners / include human-readable digits as a backup (1)", "The extra cost of tagging every item would be passed on in prices / a nearby product cannot be scanned accidentally (1)"] }
      ] }
  ]
});

X("compsci:4.7.4.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Secondary storage — the 6-mark 'principles of operation'" },
    { kv: [
      ["Why have secondary storage (2022)", "To store programs and data **while the computer is off** because **RAM is volatile**; to hold data sets too large for RAM; to transfer data between computers"],
      ["Hard disk (2024 essay)", "Platters coated in magnetisable material; **tracks** and **sectors**; the disk **spins**; the **read/write head moves radially** to the track and waits for the sector; magnetising a spot one way = 1, the other = 0; the head **senses the magnetic field** and converts it to bits; whole blocks read into a buffer"],
      ["Optical disk (2018, 2025 — 6 marks)", "Data on a **single spiral track** as **pits and lands**; a **low-power laser** is focused on the track; **light is reflected** (lands / continuation) or **scattered** (transition pit↔land); a **photodiode measures** the reflected light; a **transition = 1**, no transition = 0; the disk spins at **constant linear velocity**"],
      ["SSD (2022, AS 2025)", "No moving parts; data stored in **floating-gate transistors** (NAND flash) that keep their charge without power; **trapped charge = one bit value**, none = the other; organised in **pages and blocks**; a **block must be erased before it is rewritten**; a **controller** manages reading and writing"],
      ["SSD vs HDD (2024)", "SSD: faster access, lower power, no moving parts so more robust, smaller, silent, less heat. HDD: cheaper per GB, higher capacities, SSD cells wear out with writes"],
      ["Why optical drives are disappearing (2025)", "Other devices have more capacity and speed, are more compact, integrate drive and medium, are more robust; content is downloaded / streamed / backed up to the cloud"]
    ]}
  ],
  flashcards: [
    ["Why does a computer need secondary storage?", "To keep programs and data when the power is off (RAM is volatile), to hold data too large for RAM, and to transfer data between machines."],
    ["Describe how a hard disk stores and reads data.", "Platters coated in magnetisable material are divided into tracks and sectors; the disk spins and the read/write head moves to the track; spots are magnetised in one of two directions to represent 0/1; the head senses the field and converts it to bits."],
    ["Describe how an optical disk is read.", "A low-power laser is focused on a spiral track of pits and lands; reflected light is measured by a photodiode; a transition between pit and land scatters the light and represents a 1, continuation represents 0."],
    ["Describe how an SSD stores data.", "In floating-gate transistors (NAND flash) with no moving parts; trapped electrons represent one bit value, their absence the other; data is organised in pages and blocks; a block must be erased before rewriting; a controller manages the process."],
    ["Give two advantages of SSDs over hard disks.", "Faster access / transfer; lower power; more robust (no moving parts); smaller; quieter; less heat."],
    ["Give two disadvantages of SSDs.", "Higher cost per gigabyte; cells degrade after many write cycles (rising error rate)."],
    ["Why might a laptop have both an SSD and a hard disk?", "SSD for the OS and programs that need speed; hard disk for large files because it is cheaper per gigabyte."],
    ["Why are optical drives disappearing?", "Flash storage and SSDs have greater capacity and speed and are more compact and robust; content is downloaded, streamed or stored in the cloud."],
    ["Why are flash drives preferred to CD-Rs?", "Higher capacity, faster access, rewritable, no separate drive needed, not damaged by scratches."],
    ["What does 'constant linear velocity' mean for an optical disk?", "The disk speeds up as the head moves inward so the track passes the laser at a constant rate."]
  ],
  quiz: [
    { q: "Secondary storage is needed because:", opts: ["RAM is too fast", "RAM loses its contents when power is off", "the CPU has no registers", "cache is small"], ans: 1, why: "Volatility." },
    { q: "On an optical disk a 1 is represented by:", opts: ["a pit", "a land", "a transition between pit and land", "a scratch"], ans: 2, why: "Change in reflection." },
    { q: "An SSD stores a bit as:", opts: ["a magnetised spot", "trapped charge in a floating-gate transistor", "a pit", "a capacitor that must be refreshed"], ans: 1, why: "NAND flash." },
    { q: "Before a block of an SSD can be rewritten it must be:", opts: ["magnetised", "erased", "compressed", "encrypted"], ans: 1, why: "Flash constraint." },
    { q: "A hard disk's read/write head moves:", opts: ["along the spiral track", "radially in and out to the track", "vertically only", "not at all"], ans: 1, why: "Tracks are concentric rings." },
    { q: "Which is an advantage of hard disks over SSDs?", opts: ["Faster access", "Lower cost per gigabyte", "No moving parts", "Lower power"], ans: 1, why: "Price/capacity." },
    { q: "Optical disks spin at:", opts: ["constant angular velocity", "constant linear velocity", "random speed", "the clock speed"], ans: 1, why: "Track passes the laser at a constant rate." }
  ],
  exam: [
    { src: "AQA 2025 P2 Q3", ctx: "Optical disks were once the main way of distributing software and video.",
      parts: [
        { q: "Describe the principles of operation of an optical disk drive, including how data is represented and how it is read.", marks: 6, ms: ["Data is stored on a single spiral track as pits and lands (1)", "A low-power laser beam is shone at and focused on a spot on the track (1)", "Light is reflected back from the disk and its intensity measured by a light sensor / photodiode (1)", "A continuation of pit or land reflects light whereas a transition between them scatters it (1)", "A transition represents a 1 and a continuation a 0 (accept land = 1, pit = 0 or vice versa) (1)", "The disk spins at constant linear velocity and the head moves in/out along the track (1)"] },
        { q: "Explain two reasons why optical disk drives are no longer fitted to most computers.", marks: 2, ms: ["Other devices (SSDs, flash drives) have higher capacity, faster access, are more compact and robust, and integrate drive and medium (1)", "Software and video are now downloaded or streamed and backups made to the cloud, so less content is available on optical disk (1)"] }
      ] },
    { src: "AQA 2022 P2 Q13", ctx: "A desktop computer is fitted with a solid-state drive.",
      parts: [
        { q: "Explain why the computer needs secondary storage at all.", marks: 2, ms: ["To store programs and data while the computer is turned off (1)", "Because the contents of RAM are lost when the power is off / to hold data sets too large for RAM (1)"] },
        { q: "Describe the principles of operation of a solid-state drive.", marks: 4, ms: ["Data is stored electronically with no moving parts, in floating-gate transistors (NAND flash) that keep their state without power (1)", "The presence or absence of trapped charge / electrons represents a 1 or a 0 (1)", "Data is organised into pages and blocks; a whole block must be erased before it can be rewritten (1)", "A controller manages the organisation, reading and writing of the data (1)"] }
      ] },
    { src: "AQA 2024 P2 Q5.2", q: "State one advantage and one disadvantage of using an SSD rather than a hard disk drive.", marks: 2,
      ms: ["Advantage: faster access / transfer times; lower power consumption; smaller; no moving parts so more robust and less heat (1)", "Disadvantage: higher cost per gigabyte; cells wear out — higher error rate over time (1)"] },
    { level: "AS", src: "AS 2019 P2 Q8.1", q: "Explain why a computer might be fitted with both a hard disk drive and a solid-state drive.", marks: 2,
      ms: ["The SSD gives fast access for the operating system and frequently used programs (1)", "The hard disk is cheaper per unit of storage, so large files are stored there (1)"] }
  ]
});

})(KOS.content.extend);
