/* Kurenai OS — js/data/exams/aqa-7517-2-47.js
   AQA 7517 Paper 2, the exhaustive Companion: 4.7 Fundamentals of
   computer organisation and architecture. AUTHORED, original (see
   aqa-7517-2-45.js for the shape and the rules). Every assembly program
   here was run on an interpreter of AQA's instruction set before it was
   written, and its trace taken from that run.                           */
(function () {
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var D = X.deep = X.deep || {};
  var P = D["aqa-7517-2"] = D["aqa-7517-2"] || { leaves: {} };
  var L = P.leaves;
  var ASM = "AQA's instruction set: LDR, STR, ADD, SUB, MOV, CMP, B, BEQ, BNE, BGT, BLT, AND, ORR, EOR, MVN, LSL, LSR, HALT. `#n` is an immediate value; a bare number is a memory address.";
  var INT_TRAP = { sitting: "2023-06", q: "Q04.2", text: "Define an interrupt as a signal from a device or program asking for the processor's urgent attention. It does not stop the fetch–execute cycle (it is checked at the end of each cycle) and it is not about instruction priority." };

  /* ================= 4.7.1 Internal hardware ================= */
  L["4.7.1.1"] = {
    archetypes: [
      { id: "cs.harvard",
        rules: ["Von Neumann: one memory and one set of buses for instructions and data. Harvard: separate memories and buses.",
          "Harvard's gain: an instruction and data can be fetched at the same time, and each memory can suit its use (e.g. ROM for instructions).",
          "Harvard suits embedded systems and DSPs; von Neumann general-purpose computers."],
        traps: [],
        variations: [
          { v: "A", t: "Why choose Harvard", m: 2, q: "A digital signal processor uses the Harvard architecture. Explain why.",
            steps: [["Instructions and data are in separate memories with separate buses.", "MP1", ""], ["So an instruction can be fetched while data is read or written: faster for repeated processing of a stream of data.", "MP2", ""]] },
          { v: "B", t: "Name the parts of a von Neumann diagram", m: 2, q: "A diagram shows a processor connected to main memory and I/O controllers by three buses. Name the buses and say which is bidirectional.",
            steps: [["Address bus, data bus and control bus.", "MP1", ""], ["The data bus (and control bus) are bidirectional; the address bus is one-way from the processor.", "MP2", ""]] },
          { v: "C", t: "Compare the two", m: 2, q: "Give one advantage of the von Neumann architecture over Harvard and one of Harvard over von Neumann.",
            steps: [["Von Neumann: simpler and cheaper; memory is shared flexibly between program and data.", "MP1", ""], ["Harvard: instruction and data fetched at the same time, so faster; a program cannot overwrite itself.", "MP2", ""]] }
        ] },
      { id: "cs.buses",
        rules: ["An address bus of $n$ lines addresses $2^n$ locations.",
          "The data bus carries the word; a wider data bus moves more bits in one transfer.",
          "The control bus carries signals: memory read/write, bus request, clock, interrupt."],
        traps: [],
        variations: [
          { v: "A", t: "Addressable memory", m: 2, q: "A processor has a 24-bit address bus and each location holds one byte. How much memory can it address?",
            steps: [["$2^{24}$ locations.", "MP1", ""], ["= 16,777,216 bytes = 16 MiB.", "MP2", ""]] },
          { v: "B", t: "The control bus in a memory write", m: 1, q: "Describe the role of the control bus when the processor writes a value to memory.",
            steps: [["It carries the memory write signal, telling memory to store the value on the data bus at the address on the address bus.", "MP1", ""]] },
          { v: "C", t: "Name the bus", m: 1, q: "Which bus carries the location in memory that is to be read?",
            steps: [["The address bus.", "MP1", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "Name the bus that carries data between the processor and memory.", ["Data bus (1)"], { arch: "cs.buses" }],
      [1, 1, "State how many locations a 16-bit address bus can address.", ["65,536 / $2^{16}$ (1)"], { arch: "cs.buses" }],
      [2, 2, "Explain why the address bus is unidirectional.", ["Only the processor puts addresses on it (1)", "Memory/I/O only read the address (1)"], { arch: "cs.buses" }],
      [2, 2, "Describe the Harvard architecture.", ["Separate memories for instructions and data (1)", "With separate buses to each (1)"], { arch: "cs.harvard" }],
      [3, 2, "A processor's address bus grows from 32 to 36 bits. By what factor does addressable memory grow, and how much is 36 bits in GiB?", ["16 times (1)", "64 GiB (1)"], { arch: "cs.buses" }],
      [3, 2, "Explain why most PCs use von Neumann architecture while microcontrollers often use Harvard.", ["PCs run many different programs: shared memory is flexible (1)", "Microcontrollers run one fixed program from ROM, and parallel fetch is faster (1)"], { arch: "cs.harvard" }]
    ]
  };

  /* ================= 4.7.2 The stored program concept ================= */
  L["4.7.2.1"] = {
    archetypes: [{
      id: "cs.stored-program",
      rules: ["State it in full: machine code instructions are stored in main memory alongside data, and are fetched and executed serially by a processor that performs arithmetic and logic.",
        "Two parts: (1) stored in memory; (2) fetched and executed one at a time."],
      traps: [],
      variations: [
        { v: "A", t: "State the concept", m: 2, q: "State what is meant by the stored program concept.",
          steps: [["A program's machine code instructions are stored in main memory (with the data).", "MP1", ""], ["They are fetched and executed serially (one after another) by the processor.", "MP2", ""]] },
        { v: "B", t: "The false statement", m: 1, q: "Which statement about the stored program concept is false? (1) Instructions are held in main memory. (2) Instructions are executed serially. (3) Instructions are stored in secondary storage while running. (4) Data can be in the same memory as instructions.",
          steps: [["Statement 3: a running program's instructions are in main memory, not secondary storage.", "MP1", ""]] },
        { v: "C", t: "Why it matters", m: 2, q: "Explain one benefit of the stored program concept compared with a machine whose program is set by wiring.",
          steps: [["A different program can be loaded into memory to change what the computer does.", "MP1", ""], ["No physical rewiring is needed, so one general-purpose machine runs any program.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Where are a running program's instructions held under the stored program concept?", ["Main memory (1)"]],
      [1, 1, "State the order in which stored instructions are executed.", ["Serially / one after another (1)"]],
      [2, 2, "Explain why a stored program computer can be called general purpose.", ["Its behaviour is set by the program in memory (1)", "Loading another program changes its task (1)"]],
      [2, 2, "Explain why instructions and data being in the same memory can be a risk.", ["A program could overwrite its own instructions (1)", "e.g. a buffer overflow lets data be executed as code (1)"]],
      [3, 2, "Explain how the fetch–execute cycle puts the stored program concept into practice.", ["The PC holds the address of the next instruction in memory (1)", "Each is fetched, decoded and executed in turn (1)"]],
      [3, 2, "A smart kettle runs one program from ROM. Explain whether it still follows the stored program concept.", ["Yes: its instructions are stored in memory (ROM) (1)", "and fetched and executed serially (1)"]]
    ]
  };

  /* ================= 4.7.3 The processor ================= */
  L["4.7.3.1"] = {
    archetypes: [{
      id: "cs.registers",
      rules: ["PC: address of the next instruction. MAR: the address being read or written. MBR (MDR): data just read or to be written. CIR: the instruction being decoded and executed. SR: flags (carry, zero, negative, overflow). General-purpose registers: working values.",
        "Control unit: decodes instructions and sends control signals; coordinates the clock-driven cycle. ALU: arithmetic and logic.",
        "Say what the register HOLDS and WHEN it is used."],
      traps: [],
      variations: [
        { v: "A", t: "Why the CIR, not the MBR", m: 2, q: "Explain why the instruction is copied from the MBR into the CIR before it is decoded.",
          steps: [["The MBR is needed again during execution, for example to hold data read from memory.", "MP1", ""], ["The CIR keeps the instruction unchanged while it is decoded and executed.", "MP2", ""]] },
        { v: "B", t: "The control unit", m: 3, q: "Describe the role of the control unit.",
          steps: [["It decodes the instruction held in the CIR.", "MP1", ""], ["It sends control signals to the other components (ALU, registers, memory) to carry it out.", "MP2", ""], ["It controls the timing of operations, driven by the clock, and the movement of data on the buses.", "MP3", ""]] },
        { v: "C", t: "Roles of several registers", m: 4, q: "Describe the purpose of the PC, MAR, MBR and status register.",
          steps: [["PC: holds the address of the next instruction to fetch.", "MP1", ""], ["MAR: holds the address of the memory location to read or write.", "MP2", ""], ["MBR: holds data or an instruction just read from, or about to be written to, memory.", "MP3", ""], ["Status register: holds flags about the last result (zero, negative, carry, overflow) used by conditional branches.", "MP4", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Which register holds the address of the next instruction?", ["Program counter (1)"]],
      [1, 1, "State the job of the ALU.", ["Carries out arithmetic and logical operations (1)"]],
      [2, 2, "Explain what the status register is used for in a conditional branch.", ["It holds flags from the last comparison/result (1)", "The branch tests a flag (e.g. zero) to decide whether to jump (1)"]],
      [2, 2, "Describe the purpose of general-purpose registers.", ["Hold data/intermediate results being processed (1)", "Faster to access than main memory (1)"]],
      [3, 3, "Explain how the MAR and MBR are used when the value in memory location 200 is loaded into a register.", ["200 placed in the MAR (1)", "Memory read: contents of 200 copied to the MBR via the data bus (1)", "MBR copied to the register (1)"]],
      [3, 2, "Explain why the PC is incremented during the fetch stage rather than at the end of execution.", ["So it points to the next instruction as soon as possible / ready (1)", "A branch during execution can then overwrite it with the target address (1)"]]
    ]
  };

  L["4.7.3.2"] = {
    archetypes: [{
      id: "cs.fde",
      rules: ["Fetch: PC → MAR (address bus); PC incremented; memory read: contents → MBR (data bus); MBR → CIR.",
        "Decode: the control unit decodes the opcode in the CIR (and the addressing mode).",
        "Execute: operand fetched if needed; the operation carried out (ALU, memory, or a branch writing the PC).",
        "Name the register AND the bus at each step: a step without them often scores nothing."],
      traps: [INT_TRAP],
      variations: [
        { v: "A", t: "Describe the fetch stage", m: 4, q: "Describe how an instruction is fetched from main memory, naming the registers and buses used.",
          steps: [["The address in the PC is copied to the MAR.", "MP1", ""], ["The address is sent on the address bus and a memory read signal on the control bus.", "MP2", ""], ["The instruction at that address is sent on the data bus into the MBR; the PC is incremented.", "MP3", ""], ["The contents of the MBR are copied to the CIR.", "MP4", ""]] },
        { v: "B", t: "Name the registers in order", m: 2, q: "Name, in order, the registers an instruction's address and then the instruction itself pass through during the fetch stage.",
          steps: [["Address: PC → MAR.", "MP1", ""], ["Instruction: MBR → CIR.", "MP2", ""]] },
        { v: "C", t: "Why save the volatile environment", m: 2, q: "Explain why the processor saves the volatile environment before running an interrupt service routine.",
          steps: [["The ISR will use the registers (PC, status register, general-purpose registers).", "MP1", ""], ["Saving them (on the stack) lets the interrupted program resume exactly where it stopped, with its values unchanged.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Name the register that holds the instruction being decoded.", ["CIR / current instruction register (1)"]],
      [1, 1, "Which unit decodes an instruction?", ["The control unit (1)"]],
      [2, 3, "Describe the decode and execute stages for the instruction ADD R1, R1, #4.", ["CU decodes the opcode (ADD) and identifies the operands/immediate mode (1)", "R1's value and 4 passed to the ALU (1)", "Result written back to R1 (and flags set) (1)"]],
      [2, 2, "Explain how a branch instruction changes the flow of a program during execution.", ["The target address is copied into the PC (1)", "So the next fetch is from that address instead of the next in sequence (1)"]],
      [3, 4, "Describe the full fetch–execute cycle for LDR R2, 300.", ["PC → MAR, fetch to MBR, → CIR, PC incremented (1)", "Decoded by the CU: load, direct address 300 (1)", "300 → MAR; memory read; contents → MBR (1)", "MBR → R2 (1)"]],
      [3, 2, "Explain when the processor checks for interrupts, and why then.", ["At the end of each fetch–execute cycle (1)", "So the current instruction is completed and the state is consistent before switching (1)"]]
    ]
  };

  L["4.7.3.3"] = {
    archetypes: [
      { id: "cs.asm-trace",
        rules: [ASM, "Trace one instruction per row; only write a value where it changes.",
          "LSR moves bits RIGHT (÷ 2 per place, remainder lost); LSL moves LEFT (× 2).",
          "Don't forget the final STR: the memory column changes too."],
        traps: [{ sitting: "2022-06", q: "Q09.2", text: "Under a quarter got full marks. Traps: LSR treated as a shift left; a fractional value after a right shift (the bit just falls off); forgetting the final STR to memory." }],
        variations: [
          { v: "A", t: "A counting loop", m: 4,
            code: ["      MOV R0, #0", "      MOV R1, #1", "loop: ADD R0, R0, R1", "      ADD R1, R1, #1", "      CMP R1, #5", "      BLT loop", "      STR R0, 100", "      HALT"],
            q: "Trace the program, showing R0, R1 and memory location 100.",
            steps: [["R1 takes 1, 2, 3, 4, 5.", "MP1", "The counter, and the exit at 5"], ["R0 takes 0, 1, 3, 6, 10.", "MP2", "The running total"], ["The loop exits when R1 = 5 (not less than 5).", "MP3", ""], ["Location 100 = 10.", "MP4", "The final STR"]] },
          { v: "B", t: "A loop with masks and shifts", m: 5,
            code: ["      LDR R0, 50", "      MOV R2, #0", "loop: AND R1, R0, #1", "      ADD R2, R2, R1", "      LSR R0, R0, #1", "      CMP R0, #0", "      BNE loop", "      STR R2, 51", "      HALT"],
            q: "Location 50 holds 13. Trace the program, showing R0, R1, R2 and location 51.",
            steps: [["R0: 13, 6, 3, 1, 0.", "MP1", "Each LSR halves it, dropping the remainder"], ["R1: 1, 0, 1, 1 (the bit that is about to be shifted out).", "MP2", ""], ["R2: 0, 1, 1, 2, 3.", "MP3", ""], ["The loop stops when R0 is 0.", "MP4", ""], ["Location 51 = 3.", "MP5", ""]] },
          { v: "C", t: "A branch on a comparison", m: 3,
            code: ["      LDR R0, 20", "      LDR R1, 21", "      CMP R0, R1", "      BGT first", "      STR R1, 22", "      B done", "first: STR R0, 22", "done: HALT"],
            q: "Location 20 holds 7 and location 21 holds 12. Trace the program and give location 22.",
            steps: [["R0 = 7, R1 = 12.", "MP1", ""], ["7 is not greater than 12, so BGT does not branch.", "MP2", ""], ["STR R1, 22 runs, then B done: location 22 = 12.", "MP3", ""]] }
        ] },
      { id: "cs.asm-explain",
        rules: ["Say what the program computes in terms of its INPUTS and OUTPUT (\"stores the number of 1 bits in the value at 50 into 51\"), not instruction by instruction.",
          "Trace it with one example first if it is not obvious."],
        traps: [],
        variations: [
          { v: "A", t: "Purpose of a bit-counting loop", m: 2, q: "State the purpose of the program in Variation B of the trace shape (the AND/LSR loop).",
            steps: [["It counts how many bits of the value in location 50 are 1.", "MP1", ""], ["And stores the count in location 51.", "MP2", ""]] },
          { v: "B", t: "Purpose of a comparison", m: 1, q: "State the purpose of the program in Variation C of the trace shape (LDR, LDR, CMP, BGT).",
            steps: [["It stores the larger of the values in locations 20 and 21 into location 22.", "MP1", ""]] },
          { v: "C", t: "Purpose of a shift-and-add", m: 2,
            code: ["LDR R0, 30", "LSL R1, R0, #2", "ADD R1, R1, R0", "STR R1, 31", "HALT"],
            q: "Describe the purpose of this program.",
            steps: [["LSL by 2 multiplies by 4; adding the original gives 5 times the value.", "MP1", ""], ["It multiplies the value in location 30 by 5 and stores it in 31.", "MP2", ""]] }
        ] },
      { id: "cs.asm-format",
        rules: ["An instruction is an opcode (what to do; with the addressing mode) and operand(s) (what to do it to).",
          "$n$ opcode bits → $2^n$ different instructions; $n$ operand bits → $2^n$ addresses or registers."],
        traps: [],
        variations: [
          { v: "A", t: "Instruction set size", m: 1, q: "An instruction format uses 6 bits for the opcode. How many different instructions can it have?",
            steps: [["$2^6 = 64$.", "MP1", ""]] },
          { v: "B", t: "Addressable locations from an operand", m: 1, q: "A 16-bit instruction has a 6-bit opcode and the rest is a memory address. How many locations can it address directly?",
            steps: [["$16 - 6 = 10$ bits: $2^{10} = 1024$ locations.", "MP1", ""]] },
          { v: "C", t: "Registers from a field", m: 1, q: "The register field of an instruction is 4 bits. What is the most registers it can refer to?",
            steps: [["$2^4 = 16$.", "MP1", ""]] }
        ] },
      { id: "cs.asm-write",
        rules: [ASM, "Immediate values need `#`: `ADD R1, R1, #1`, not `ADD R1, R1, 1` (that is memory location 1).",
          "Write operands in denary, not binary.",
          "After AND with a mask for the top bits, shift right to bring them down.",
          "A label is not a stop: code after it runs on into the next block. Branch round code that must not run."],
        traps: [{ sitting: "2023-06", q: "Q07.3", text: "The hardest assembly task so far. Traps: operands written in binary; a missing # on immediate values; AND with 240 but no LSR #4 after; code running on past a branch target into the next label, adding a second constant by accident." }],
        variations: [
          { v: "A", t: "Add two values", m: 3, q: "Write AQA assembly to add the values in locations 100 and 101 and store the result in 102.",
            steps: [["LDR R0, 100 and LDR R1, 101.", "MP1", "Both loaded"], ["ADD R2, R0, R1.", "MP2", ""], ["STR R2, 102.", "MP3", ""]] },
          { v: "B", t: "A division loop", m: 4, q: "Location 40 holds a positive number. Write a program that stores the number divided by 10 (whole number) in 41 and the remainder in 42, by repeated subtraction.",
            code: ["      LDR R0, 40", "      MOV R1, #0", "loop: CMP R0, #10", "      BLT done", "      SUB R0, R0, #10", "      ADD R1, R1, #1", "      B loop", "done: STR R1, 41", "      STR R0, 42", "      HALT"],
            steps: [["Load the value and set a counter to 0.", "MP1", ""], ["Compare with 10 and leave the loop when less (BLT).", "MP2", ""], ["Subtract 10 and add 1 to the counter, then branch back.", "MP3", ""], ["Store the counter (quotient) and what is left (remainder). For 47: 4 and 7.", "MP4", ""]] },
          { v: "C", t: "Set and test a bit", m: 3, q: "Write instructions that set bit 3 (value 8) of R0 to 1, then branch to `alarm` if bit 0 of R1 is 1.",
            steps: [["ORR R0, R0, #8.", "MP1", "OR sets a bit"], ["AND R2, R1, #1.", "MP2", "AND isolates a bit"], ["CMP R2, #1 then BEQ alarm.", "MP3", ""]] },
          { v: "D", t: "Extract the top nibble", m: 2, q: "R0 holds a byte. Write two instructions that leave the value of its top four bits (0–15) in R1.",
            steps: [["AND R1, R0, #240 (keep the top four bits).", "MP1", ""], ["LSR R1, R1, #4 (move them down).", "MP2", "The step the report says is often missing"]] }
        ] }
    ],
    practice: [
      [1, 1, "Write one AQA instruction that copies the value 25 into R3.", ["MOV R3, #25 (1)"], { arch: "cs.asm-write" }],
      [1, 1, "State the difference between `ADD R1, R1, #5` and `ADD R1, R1, 5`.", ["The first adds the value 5; the second is not valid / would refer to location 5 (register or memory, not immediate) (1)"], { arch: "cs.asm-write" }],
      [2, 2, "Trace: MOV R0, #3; LSL R1, R0, #3; SUB R1, R1, R0; HALT. Give R1 and the effect.", ["R1 = 21 (1)", "Multiplies R0 by 7 (×8 − 1) (1)"], { arch: "cs.asm-trace", code: ["MOV R0, #3", "LSL R1, R0, #3", "SUB R1, R1, R0", "HALT"] }],
      [2, 1, "An instruction has an 8-bit opcode field. How many opcodes can the processor have?", ["256 (1)"], { arch: "cs.asm-format" }],
      [3, 4, "Write a program that stores the larger of the values in locations 60 and 61 into location 62.", ["Load both values (1)", "CMP and a conditional branch (BGT/BLT) (1)", "Store the right one on each path (1)", "Branch round the other store / HALT (1)"], { arch: "cs.asm-write" }],
      [3, 3, "Explain why the program in Variation B of the trace shape always stops.", ["Each LSR halves R0, rounding down (1)", "A positive number reaches 0 after at most 8 shifts in a byte (1)", "BNE only loops while R0 is not 0 (1)"], { arch: "cs.asm-explain" }]
    ]
  };

  L["4.7.3.4"] = {
    archetypes: [{
      id: "cs.addressing",
      rules: ["Immediate (`#5`): the operand IS the value. Direct (`5`): the operand is the memory address of the value.",
        "The addressing mode is part of the opcode field: it tells the CU how to interpret the operand.",
        "An $n$-bit two's complement immediate ranges from $-2^{n-1}$ to $2^{n-1} - 1$."],
      traps: [],
      variations: [
        { v: "A", t: "Immediate against direct", m: 2, q: "Explain the difference between immediate and direct addressing.",
          steps: [["Immediate: the operand is the actual value to use.", "MP1", ""], ["Direct: the operand is the address in memory where the value is held.", "MP2", ""]] },
        { v: "B", t: "Name the mode", m: 1, q: "Name the addressing mode used for the second operand in `LDR R2, 150`.",
          steps: [["Direct addressing (150 is a memory address).", "MP1", ""]] },
        { v: "C", t: "Range of an immediate", m: 1, q: "An instruction's immediate operand is 8 bits in two's complement. State its range.",
          steps: [["$-128$ to $127$.", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "State the addressing mode used in `MOV R1, #12`.", ["Immediate (1)"]],
      [1, 1, "What does the operand 75 refer to in `STR R0, 75`?", ["The memory address/location 75 (1)"]],
      [2, 2, "Explain why the opcode must include the addressing mode.", ["The same operand bits can mean a value or an address (1)", "The CU needs to know which to decode/execute correctly (1)"]],
      [2, 1, "An unsigned immediate operand is 6 bits. State the largest value it can hold.", ["63 (1)"]],
      [3, 2, "Give one advantage of immediate addressing and one of direct addressing.", ["Immediate: no extra memory access, so faster (1)", "Direct: can use a value that changes / larger values held in memory (1)"]],
      [3, 2, "A program must add 300 to R0 but immediate operands are 8-bit unsigned. Explain how to do it.", ["300 is too large for 8 bits (max 255) (1)", "Store 300 in memory and use direct addressing / add 255 then 45 (1)"]]
    ]
  };

  L["4.7.3.5"] = {
    archetypes: [{
      id: "cs.shifts-masks",
      rules: ["AND with a mask CLEARS the bits that are 0 in the mask (keeps the rest): use it to test or extract.",
        "ORR with a mask SETS the bits that are 1 in the mask. EOR TOGGLES them.",
        "LSL by $n$ multiplies by $2^n$ (bits off the left are lost); LSR by $n$ divides by $2^n$, rounding down."],
      traps: [{ sitting: "2022-06", q: "Q09.2", text: "A logical shift right divides and DROPS the bits that fall off: there is no fractional value. Check the direction before tracing." },
        { sitting: "2023-06", q: "Q07.3", text: "Masking the top four bits with AND 240 leaves them in place: LSR #4 is needed to make them a value from 0 to 15." }],
      variations: [
        { v: "A", t: "Result of an AND mask", m: 1, q: "Give the result of 10110110 AND 00001111.",
          steps: [["00000110: only the bottom four bits survive.", "MP1", ""]] },
        { v: "B", t: "Result of an OR mask", m: 1, q: "Give the result of 10100000 OR 00000101.",
          steps: [["10100101.", "MP1", ""]] },
        { v: "C", t: "Choose the operation and mask", m: 2, q: "State the instruction and mask to (i) toggle the bottom two bits of R0, (ii) clear the top bit of R0 (8-bit).",
          steps: [["(i) EOR R0, R0, #3.", "MP1", ""], ["(ii) AND R0, R0, #127.", "MP2", ""]] },
        { v: "D", t: "Shift arithmetic", m: 2, q: "R0 holds 01101000. Give R0 after LSR R0, R0, #3, and explain the effect in denary.",
          steps: [["00001101.", "MP1", ""], ["104 divided by 8 = 13.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Give 11001100 EOR 11111111.", ["00110011 (1)"]],
      [1, 1, "What is the effect of LSL by 1 on an unsigned number?", ["Multiplies it by 2 (1)"]],
      [2, 2, "Write one instruction to test whether R1 is odd, and say how the result shows it.", ["AND R2, R1, #1 (1)", "R2 = 1 if odd, 0 if even (1)"]],
      [2, 2, "R0 = 10010011. Give R0 after LSL R0, R0, #2 (8-bit) and explain what happened to the top bits.", ["01001100 (1)", "The two leftmost bits are lost / overflow (1)"]],
      [3, 3, "A robot's byte has motor bits in bits 0–3 and sensor bits in 4–7. Write instructions that turn on motor bit 2 and read sensor bit 6 into R2 as 0 or 1.", ["ORR R0, R0, #4 (1)", "AND R2, R0, #64 (1)", "LSR R2, R2, #6 (1)"]],
      [3, 2, "Explain why LSR does not give the correct result for dividing a negative two's complement number.", ["LSR fills the left with 0s (1)", "So the sign bit is lost and the result becomes positive (1)"]]
    ]
  };

  L["4.7.3.6"] = {
    archetypes: [{
      id: "cs.interrupts", title: "Interrupts and the interrupt service routine",
      match: "interrupt|volatile",
      rules: ["An interrupt is a signal to the processor that a device or program needs attention.",
        "It is checked at the END of each fetch–execute cycle; the current instruction finishes.",
        "The volatile environment (PC, status register, registers) is pushed on the stack; the ISR runs; the state is restored and the program resumes.",
        "Priorities decide whether an interrupt can interrupt an ISR."],
      traps: [INT_TRAP],
      variations: [
        { v: "A", t: "What an interrupt is for", m: 2, q: "Explain what an interrupt is and give an example of its use.",
          steps: [["A signal from a device or program asking for the processor's attention.", "MP1", ""], ["e.g. a printer out of paper, a key pressed, a timer for scheduling — the processor need not keep polling.", "MP2", ""]] },
        { v: "B", t: "How an interrupt is handled", m: 4, q: "Describe how the processor handles an interrupt.",
          steps: [["At the end of the current fetch–execute cycle it checks for interrupts.", "MP1", ""], ["If one is waiting (and of high enough priority), the volatile environment is saved on the stack.", "MP2", ""], ["The PC is loaded with the address of the interrupt service routine, which runs.", "MP3", ""], ["Afterwards the saved values are restored and the original program continues.", "MP4", ""]] },
        { v: "C", t: "Priorities", m: 2, q: "Explain why interrupts are given priorities.",
          steps: [["Some events are more urgent (e.g. a power failure over a key press).", "MP1", ""], ["A higher priority interrupt can interrupt a lower one's ISR; lower ones wait.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "What does ISR stand for?", ["Interrupt service routine (1)"]],
      [1, 1, "Where is the volatile environment saved when an interrupt is serviced?", ["On the stack (1)"]],
      [2, 2, "Give two sources of interrupts.", ["Hardware, e.g. I/O device/keyboard (1)", "Software/timer/error, e.g. divide by zero (1)"]],
      [2, 2, "Explain why interrupts are more efficient than polling.", ["Polling wastes processor time checking devices that need nothing (1)", "With interrupts the processor works until a device signals (1)"]],
      [3, 3, "Explain what would go wrong if the status register were not saved before an ISR.", ["The ISR changes the flags (1)", "The interrupted program may be resuming just before a conditional branch (1)", "So it would branch the wrong way (1)"]],
      [3, 2, "Explain how timer interrupts let an operating system share the processor between processes.", ["A timer interrupts at regular intervals (1)", "The scheduler's ISR saves one process's state and switches to another (1)"]]
    ]
  };

  L["4.7.3.7"] = {
    archetypes: [{
      id: "cs.performance",
      rules: ["Factors: number of cores, clock speed, cache size and levels, word length, address and data bus widths.",
        "For each: say WHY it helps (e.g. more cores: instructions from different threads run simultaneously).",
        "More cores only help if the software is written to use them."],
      traps: [{ sitting: "2023-06", q: "Q04.1", text: "Be precise on improvements: more cores means instructions run simultaneously, not just \"more per second\"." }],
      variations: [
        { v: "A", t: "Cache", m: 4, q: "Explain what cache memory is and how it improves performance.",
          steps: [["Small, very fast memory on or near the processor.", "MP1", ""], ["It holds copies of frequently used instructions and data.", "MP2", ""], ["The processor checks the cache first; a hit avoids a slower trip to main memory.", "MP3", ""], ["Levels (L1, L2, L3) trade speed for size.", "MP4", ""]] },
        { v: "B", t: "A wider data bus", m: 1, q: "Explain why a wider data bus can speed up execution.",
          steps: [["More bits are moved in each transfer, so fewer transfers are needed to fetch instructions and data.", "MP1", ""]] },
        { v: "C", t: "Cores and clock speed", m: 2, q: "Explain how increasing (i) the clock speed, (ii) the number of cores can improve performance.",
          steps: [["(i) More fetch–execute cycles per second.", "MP1", ""], ["(ii) Several instructions (from different threads/processes) executed simultaneously.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "State one factor that affects processor performance.", ["Cores / clock speed / cache / word length / bus width (1)"]],
      [1, 1, "Define word length.", ["The number of bits the processor can process as one unit (1)"]],
      [2, 2, "Explain why doubling the number of cores may not halve a program's run time.", ["The program may not be written to run in parallel (1)", "Some tasks depend on earlier results / overheads of coordinating cores (1)"]],
      [2, 2, "Explain why a larger address bus can improve performance.", ["More memory can be addressed (1)", "So less use of slower virtual memory on disk (1)"]],
      [3, 3, "Explain why increasing clock speed is limited in practice.", ["More heat produced (1)", "Needs more cooling / power (1)", "Signals need time to propagate / components cannot switch faster (1)"]],
      [3, 2, "Explain why cache improves performance even though it is small.", ["Programs reuse recent instructions/data (loops) (1)", "So many accesses are hits in the cache (1)"]]
    ]
  };

  /* ================= 4.7.4 External hardware ================= */
  L["4.7.4.1"] = {
    archetypes: [
      { id: "cs.rfid",
        rules: ["Barcode: light (laser or LED) shone on the bars; dark bars reflect less; a sensor converts reflections into the bar WIDTHS, decoded to digits.",
          "Passive RFID: the reader's radio waves induce a current in the tag's coil, powering it to transmit its ID back. Active tags have a battery and longer range.",
          "RFID needs no line of sight and reads many tags at once; barcodes are cheap to print."],
        traps: [{ sitting: "2022-06", q: "Q06", text: "A bar's colour is not a bit: bars differ in WIDTH, and the pattern of widths encodes the digits." }],
        variations: [
          { v: "A", t: "How passive RFID is read", m: 4, q: "Describe how a passive RFID tag on a parcel is read.",
            steps: [["The reader transmits radio waves.", "MP1", ""], ["They induce a current in the tag's antenna coil, powering its chip.", "MP2", ""], ["The tag transmits its stored data (ID) back by radio.", "MP3", ""], ["The reader receives it and passes it to the computer system.", "MP4", ""]] },
          { v: "B", t: "Why RFID suits a warehouse", m: 2, q: "Give two reasons why RFID is better than barcodes for tracking pallets in a warehouse.",
            steps: [["No line of sight needed: tags read through packaging or from a distance.", "MP1", ""], ["Many tags read at once, quickly, as a pallet passes the reader.", "MP2", ""]] },
          { v: "C", t: "Why barcodes suit a manufacturer", m: 2, q: "Explain why a manufacturer of cheap items prints barcodes rather than fitting RFID tags.",
            steps: [["A printed barcode costs almost nothing; an RFID tag costs much more per item.", "MP1", ""], ["Barcode readers are standard at every shop till.", "MP2", ""]] }
        ] },
      { id: "cs.laser-printer",
        rules: ["Order: drum charged; laser discharges the image areas; charged toner sticks to them; paper given an opposite charge picks up the toner; the fuser melts it on with heat and pressure; the drum is discharged and cleaned.",
          "Six-mark questions: one point per stage, in order."],
        traps: [],
        variations: [
          { v: "A", t: "Principles of operation", m: 6, q: "Describe the principles of operation of a laser printer.",
            steps: [["The drum is given an electrostatic charge.", "MP1", ""], ["A laser, controlled by the page data, discharges areas of the drum to form the image.", "MP2", ""], ["Toner (charged) is attracted to the image areas on the drum.", "MP3", ""], ["Paper is charged so toner transfers from the drum to the paper.", "MP4", ""], ["A fuser unit uses heat and pressure to melt the toner onto the paper.", "MP5", ""], ["The drum's charge is removed and leftover toner cleaned ready for the next page.", "MP6", ""]] },
          { v: "B", t: "Why a laser printer suits an office", m: 2, q: "Give two reasons a networked laser printer suits a small office.",
            steps: [["Fast printing of large volumes of text.", "MP1", ""], ["Low cost per page, and shared over the network by everyone.", "MP2", ""]] },
          { v: "C", t: "Colour", m: 1, q: "Explain how a colour laser printer differs from a mono one.",
            steps: [["It uses four toners (cyan, magenta, yellow, black), applying each colour's image in turn.", "MP1", ""]] }
        ] },
      { id: "cs.camera",
        rules: ["A sensor (CCD or CMOS) is a grid of photosites; light makes a charge proportional to its intensity.",
          "Colour: a filter over each photosite (red, green or blue).",
          "The voltage of each is measured, converted by an ADC into a number, and stored as a pixel."],
        traps: [],
        variations: [
          { v: "A", t: "How a digital camera captures an image", m: 4, q: "Describe how a digital camera captures an image.",
            steps: [["Light passes through the lens onto a sensor made of a grid of photosites (CCD/CMOS).", "MP1", ""], ["Each photosite produces a charge/voltage proportional to the light falling on it.", "MP2", ""], ["Colour filters make each photosite record red, green or blue.", "MP3", ""], ["The voltages are converted by an ADC to binary values stored as pixels.", "MP4", ""]] },
          { v: "B", t: "Analogue to digital", m: 2, q: "Explain why the photosensor's output is analogue but the stored pixel is digital.",
            steps: [["The voltage varies continuously with the amount of light.", "MP1", ""], ["An ADC samples it and converts it to one of a fixed set of binary values.", "MP2", ""]] },
          { v: "C", t: "The I/O controller", m: 2, q: "Explain the role of the I/O controller between a camera's sensor and its processor.",
            steps: [["It is the interface that connects the device to the processor's buses.", "MP1", ""], ["It converts the device's signals into a form the processor can use (and buffers the data).", "MP2", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "State one advantage of RFID over a barcode.", ["No line of sight / many read at once / data can be rewritten (1)"], { arch: "cs.rfid" }],
      [1, 1, "Name the part of a laser printer that makes toner stick permanently to the paper.", ["The fuser (1)"], { arch: "cs.laser-printer" }],
      [2, 2, "Explain how a barcode reader gets data from a barcode.", ["Light shone on the code; sensor detects the reflection (1)", "Dark bars reflect less, so the widths are measured and decoded (1)"], { arch: "cs.rfid" }],
      [2, 2, "Explain what a CMOS or CCD sensor is made of.", ["A grid of photosites/light-sensitive cells (1)", "Each gives a charge proportional to light intensity (1)"], { arch: "cs.camera" }],
      [3, 3, "A library tags books with RFID. Explain how a self-service desk checks out a stack of books at once and one risk.", ["Reader energises all tags in range (1)", "Each tag sends its ID; system records the loans (1)", "Risk: tags could be read/cloned without the user knowing / privacy (1)"], { arch: "cs.rfid" }],
      [3, 3, "Explain why a laser printer has a high start-up cost but low running cost per page compared with an inkjet.", ["Printer itself more expensive (1)", "Toner prints many pages (1)", "So cost per page is lower at high volumes (1)"], { arch: "cs.laser-printer" }]
    ]
  };

  L["4.7.4.2"] = {
    archetypes: [
      { id: "cs.optical",
        rules: ["Data is a spiral track of pits and lands; a laser reflects off it.",
          "A land reflects the light to the sensor; a pit scatters it. A CHANGE between pit and land is a 1, no change a 0.",
          "Recordable discs: a laser changes a dye layer's reflectivity."],
        traps: [],
        variations: [
          { v: "A", t: "Principles of operation", m: 6, q: "Describe the principles of operation of an optical disk drive reading a CD.",
            steps: [["The disc spins; data is on one spiral track.", "MP1", ""], ["A laser beam is focused on the track by a lens.", "MP2", ""], ["The surface has pits and lands.", "MP3", ""], ["Lands reflect light back to a sensor; pits scatter it, so less returns.", "MP4", ""], ["A transition between pit and land is read as a 1; no transition as 0.", "MP5", ""], ["The laser/sensor moves across the disc to follow the track.", "MP6", ""]] },
          { v: "B", t: "Why optical drives are disappearing", m: 2, q: "Explain why few new laptops include an optical drive.",
            steps: [["Software, films and music are now downloaded or streamed.", "MP1", ""], ["Flash storage is smaller, faster and holds more; dropping the drive makes laptops thinner and lighter.", "MP2", ""]] },
          { v: "C", t: "Optical against flash", m: 1, q: "Give one reason a flash drive is preferred to a CD-R for moving files between computers.",
            steps: [["It can be rewritten many times / holds far more / is faster.", "MP1", ""]] }
        ] },
      { id: "cs.ssd",
        rules: ["SSD: NAND flash; each cell traps electrons in a floating gate (charge = state), so data stays without power.",
          "A controller manages blocks and pages; a block must be erased before rewriting; wear levelling spreads writes.",
          "Compared with HDD: faster access (no moving parts), robust, quiet, low power; more expensive per GB, finite write cycles."],
        traps: [],
        variations: [
          { v: "A", t: "Principles of operation", m: 4, q: "Describe the principles of operation of a solid-state drive.",
            steps: [["It uses NAND flash memory made of cells (floating-gate transistors).", "MP1", ""], ["A cell's state is set by trapping (or removing) electrons, which stays without power.", "MP2", ""], ["Cells are grouped into pages and blocks; a block is erased before its pages are rewritten.", "MP3", ""], ["A controller manages reads, writes and wear levelling.", "MP4", ""]] },
          { v: "B", t: "SSD against HDD", m: 2, q: "Give one advantage and one disadvantage of an SSD compared with a hard disk.",
            steps: [["Advantage: faster access (no moving heads) / more robust / less power.", "MP1", ""], ["Disadvantage: more expensive per GB / limited number of write cycles.", "MP2", ""]] },
          { v: "C", t: "The hard disk", m: 4, q: "Describe how a hard disk drive stores and reads data.",
            steps: [["Platters coated with magnetic material spin at high speed.", "MP1", ""], ["Data is stored as magnetised regions in concentric tracks divided into sectors.", "MP2", ""], ["A read/write head on an actuator arm moves to the track.", "MP3", ""], ["The head changes (writes) or senses (reads) the direction of magnetisation.", "MP4", ""]] }
        ] },
      { id: "cs.secondary",
        rules: ["Secondary storage is non-volatile and holds programs and data that are not in use, permanently.",
          "Main memory (RAM) is volatile; ROM is not. Secondary storage is not \"a backup of RAM\"."],
        traps: [{ sitting: "2022-06", q: "Q13.2", text: "\"Non-volatile\" alone or \"more storage\" alone scored nothing: explain. Main memory (RAM) is volatile — ROM isn't — and secondary storage is not a backup of RAM." }],
        variations: [
          { v: "A", t: "Why a computer needs secondary storage", m: 2, q: "Explain why a desktop computer needs secondary storage as well as main memory.",
            steps: [["Main memory (RAM) is volatile: its contents are lost when the power goes off.", "MP1", ""], ["Secondary storage keeps programs and files permanently, and holds far more data than RAM for the cost.", "MP2", ""]] },
          { v: "B", t: "Choose a medium", m: 2, q: "A photographer wants to archive 10 TB of photos cheaply, and keep an editing library fast. Recommend storage for each.",
            steps: [["Archive: magnetic hard disks (cheapest per GB for large capacity).", "MP1", ""], ["Editing: SSD (fast random access).", "MP2", ""]] },
          { v: "C", t: "Main memory against secondary", m: 2, q: "Give two differences between main memory and secondary storage.",
            steps: [["Main memory is directly accessed by the processor; secondary storage is accessed through I/O.", "MP1", ""], ["Main memory is much faster but smaller and (RAM) volatile; secondary is slower, larger and non-volatile.", "MP2", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "State what happens to the data in RAM when the power is switched off.", ["It is lost (1)"], { arch: "cs.secondary" }],
      [1, 1, "Name the two kinds of surface on an optical disc.", ["Pits and lands (1)"], { arch: "cs.optical" }],
      [2, 2, "Explain why an SSD gives faster boot times than a hard disk.", ["No moving parts / no seek time or rotational delay (1)", "Random access to many small files is fast (1)"], { arch: "cs.ssd" }],
      [2, 2, "Explain what wear levelling does in an SSD.", ["Spreads writes evenly across blocks (1)", "So no block wears out early (1)"], { arch: "cs.ssd" }],
      [3, 3, "Compare magnetic, optical and solid-state storage for a laptop's main drive.", ["Magnetic: cheap, large, but slow and fragile with moving parts (1)", "Optical: low capacity, slow, not suitable as a main drive (1)", "Solid-state: fast, robust, light — the best choice despite cost (1)"], { arch: "cs.ssd" }],
      [3, 2, "Explain how a CD-R is written.", ["A high-power laser heats spots of the dye layer (1)", "Changing their reflectivity to act like pits (1)"], { arch: "cs.optical" }]
    ]
  };
})();
