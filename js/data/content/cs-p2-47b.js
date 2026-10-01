/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.7.3.3–
   4.7.3.5 (the processor instruction set, immediate and direct
   addressing, machine-code / assembly language operations) at full
   A-level depth. Each topic REPLACES the short entry the older file
   carried; every way AQA has examined it (7516/2 June 2016–2025, 7517/2
   June 2017–2025) is explained, worked and answered in the mark scheme's
   own format. Every program and trace table here was run on an AQA
   assembly interpreter and checked against all inputs in range. Past-paper
   banks stay in bank-cs-47.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers (pixel coordinates) ---- */
function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 }];
  if (label) it.push({ text: [x + w / 2, y + (sub ? h / 2 - 7 : h / 2)], t: label, b: true, size: 12, c: "text" });
  if (sub) it.push({ text: [x + w / 2, y + h / 2 + 10], t: sub, size: 10.5, c: "muted" });
  return it;
}
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: o.c || "accent2", w: 2 }];
  if (label) it.push({ text: [(x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0)], t: label, size: 10.5, c: o.c || "accent2" });
  return it;
}
/* an instruction as labelled bit fields: fields = [[name, bits, col, value]] */
function fieldsFig(fields, cap, o) {
  o = o || {};
  var it = [], cw = o.cw || 18, x = 16, y = 40, h = 28;
  fields.forEach(function (f) {
    var w = f[1] * cw;
    it = it.concat(boxAt(x, y, w, h, null, f[2]));
    it.push({ text: [x + w / 2, y - 12], t: f[0], b: true, size: 11, c: "text" });
    it.push({ text: [x + w / 2, y + h + 14], t: f[1] + " bit" + (f[1] > 1 ? "s" : ""), size: 10.5, c: "muted" });
    if (f[3]) f[3].split("").forEach(function (b, i) { it.push({ text: [x + i * cw + cw / 2, y + h / 2], t: b, size: 12, c: "text" }); });
    x += w;
  });
  return { fig: { w: Math.max(x + 16, 300), h: 100, items: it, cap: cap } };
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **TO.** \"talked out\".",
  "Programs: **AO2** marks for the idea (a loop, a compare and branch, shifting to halve) even with wrong syntax; **AO3** marks need correct AQA syntax. **DPT** = one dependent penalty, applied once for a repeated error (a missing `#`, a wrong delimiter, `Rd` as a register). \"MAX n−1 if the program does not work in all circumstances.\""
] } };

var ISA = { table: { head: ["Instruction", "Meaning"], rows: [
  ["`LDR Rd, <memory ref>`", "load the value in the memory location into register d"],
  ["`STR Rd, <memory ref>`", "store the value in register d into the memory location"],
  ["`ADD Rd, Rn, <operand2>`", "Rd ← Rn + operand2"],
  ["`SUB Rd, Rn, <operand2>`", "Rd ← Rn − operand2"],
  ["`MOV Rd, <operand2>`", "copy operand2 into Rd"],
  ["`CMP Rn, <operand2>`", "compare Rn with operand2 (sets the flags)"],
  ["`B <label>`", "always branch to the label"],
  ["`B<cond> <label>`", "branch if the last comparison met `EQ` (=), `NE` (≠), `GT` (>), `LT` (<)"],
  ["`AND / ORR / EOR Rd, Rn, <operand2>`", "bitwise AND / OR / XOR of Rn and operand2 into Rd"],
  ["`MVN Rd, <operand2>`", "bitwise NOT of operand2 into Rd"],
  ["`LSL / LSR Rd, Rn, <operand2>`", "logical shift Rn left / right by operand2 bits into Rd"],
  ["`HALT`", "stop the program"]
] } };

/* =====================================================================
   4.7.3.3  The processor instruction set
   ===================================================================== */
C["compsci:4.7.3.3"] = {
  notes: [
    { h: "The processor instruction set — the whole topic on one page" },
    "Spec 4.7.3.3: understand the term **processor instruction set** and know that an instruction set is **processor specific**; know that instructions consist of an **opcode** and one or more **operands** (value, memory address or register). In AQA's model the addressing mode is part of the opcode.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Why an executable will not run on another processor", "Explain", "2", "AS 2018 Q06.2, AS 2023 Q08.3"],
      ["How many opcodes / memory locations / registers a format allows", "How many / Calculate", "1", "AS 2018 Q10.2–10.3, A-level 2020 Q09.1, 2025 Q07.3"],
      ["Types of value an operand can hold", "State", "2", "AS 2024 Q07.3"],
      ["Differences between machine code and assembly language", "Describe", "2", "AS 2019 Q10.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Instruction sets** — why they are processor-specific.", "**Instruction format** — opcode, addressing mode, operand; the bit arithmetic.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Instruction sets" },
    { callout: { t: "def", h: "Processor instruction set", body: "The **set of all the machine code instructions** (operations, with their binary opcodes and formats) that a particular processor can **decode and execute**. It is **processor-specific**: different processor families (x86, ARM) have different instruction sets." } },
    { ul: [
      "A compiled **executable** is machine code in **one** instruction set, so it is **platform dependent**.",
      "Moved to a processor with a different instruction set, its opcodes mean something else (or nothing) — it will not run. Recompile the source for the new processor, or distribute bytecode for a virtual machine (4.6.3.1).",
      "Processors also differ in their **registers** (number and size), addressing modes and word length — all part of the architecture the machine code assumes."
    ] },
    { table: { head: ["", "Machine code", "Assembly language"], rows: [
      ["Form", "binary patterns (opcode + operand bits)", "**mnemonics** (`LDR`, `ADD`) and labels"],
      ["Execution", "executed **directly** by the processor", "must be **translated** by an assembler first"],
      ["Mapping", "—", "**one-to-one** with machine code instructions"],
      ["Readability", "very hard", "easier — names, comments, labels"],
      ["Portability", "processor-specific", "processor-specific"]
    ] } },

    { page: "Instruction format" },
    { callout: { t: "formula", h: "Counting with bits", body: "**opcode bits** k → $2^k$ different opcodes. **operand bits** n → $2^n$ distinct values: $2^n$ addressable locations (direct), $2^n$ registers, or a range of $0 … 2^n − 1$ unsigned / $−2^{n−1} … 2^{n−1} − 1$ two's complement (immediate)." } },
    fieldsFig([["Operation", 3, "accent", "010"], ["Mode", 1, "accent2", "0"], ["Operand", 4, "good", "1101"]], "The spec's model: an 8-bit instruction with a 4-bit opcode (3-bit basic operation + 1-bit addressing mode) and a 4-bit operand — 2⁴ = 16 possible opcodes.", { cw: 28 }),
    { kv: [
      ["Opcode", "identifies the **basic machine operation** (ADD, LDR …) and, in AQA's model, the **addressing mode**"],
      ["Operand(s)", "the **value, memory address or register** the operation uses — how it is read is set by the addressing mode (4.7.3.4)"],
      ["Instruction length", "opcode bits + operand bits; fixed in simple processors, variable in others"]
    ] },
    fieldsFig([["Basic machine operation", 11, "accent", "11100000100"], ["M", 1, "accent2", "1"], ["Op A", 4, "good", "0010"], ["Op B", 4, "good", "0101"], ["Operand C", 12, "accent3", "000000010001"]], "A-level 2025 Figure 3: ADD R2, R5, #17 in 32 bits. Operand A = 0010 (R2), B = 0101 (R5), C = 17 as a 12-bit two's complement value (M = 1: immediate).", { cw: 15 }),
    { callout: { t: "miscon", h: "More bits in the opcode ≠ more memory", body: "Opcode bits decide how many **operations** exist; operand bits decide how many **addresses** (or registers, or values) the operand can name. Read the question for which field it is about." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Why won't the executable run?", src: "AS June 2023 · P2 Q08.3 · 2 marks",
      q: "Alice compiles a program to produce an executable file that runs on her computer. Bob's computer has a different processor. Explain why having a different processor might make it impossible for Alice's executable file to run on Bob's computer.",
      steps: [
        { m: "The executable is platform dependent / machine-specific — it uses the instruction set of the computer that created it;", mk: "1 mark" },
        { m: "different processors may have different instruction sets (e.g. different general-purpose registers);", mk: "1 mark", n: "NE. \"not portable\" alone." }
      ], result: "Different instruction sets" } },
    { worked: { tag: "exam", title: "Ella and Josephine", src: "AS June 2018 · P2 Q06.2 · 2 marks",
      q: "Ella's executable file will not run on Josephine's computer because the two computers have different processors. Explain why having different processors may have caused this problem.",
      steps: [
        { h: "AO2", m: "The different processors have different instruction sets;", mk: "1 mark" },
        { h: "AO1", m: "the program is in machine code that makes use of those instructions (it has been compiled for one processor);", mk: "1 mark" }
      ], result: "Instruction sets differ" } },
    { worked: { tag: "exam", title: "How many opcodes?", src: "AS June 2018 · P2 Q10.2 · 1 mark",
      q: "A processor supports 32 different basic machine code operations, and two addressing modes represented by a single bit. How many different opcodes is the machine potentially capable of supporting?",
      steps: [{ m: "32 operations need 5 bits; + 1 mode bit = 6 bits → $2^6$ = **64**", mk: "1 mark" }], result: "64" } },
    { worked: { tag: "exam", title: "How many memory locations?", src: "AS June 2018 · P2 Q10.3 · 1 mark",
      q: "In the same 16-bit instruction format (5-bit operation, 1-bit mode) the remaining 10 bits are the operand. In direct addressing the operand is the address of the data. How many memory locations could the processor potentially make use of?",
      steps: [{ m: "$2^{10}$ = **1024**", mk: "1 mark", n: "Same arithmetic in A-level 2020 Q09.1 (a 10-bit operand addressing any location): 1024 // 1 KiB." }], result: "1024" } },
    { worked: { tag: "exam", title: "Maximum general-purpose registers", src: "A-level June 2025 · P2 Q07.3 · 1 mark",
      q: "In the 32-bit ADD format above, all of the processor's general-purpose registers can be referenced using each of the operands A, B and C. Calculate the maximum number of general-purpose registers the processor could have.",
      steps: [{ m: "Operands A and B are 4 bits → $2^4$ = **16** registers (operand C's 12 bits could name more, but every register must be reachable from A and B)", mk: "1 mark" }], result: "16" } },
    { worked: { tag: "exam", title: "What else can an operand hold?", src: "AS June 2024 · P2 Q07.3 · 2 marks",
      q: "Each instruction consists of an opcode and an operand. An operand could be an immediate value. State two other types of value that can be stored in an operand.",
      steps: [{ m: "A register (number);", mk: "1 mark" }, { m: "A memory address / location;", mk: "1 mark", n: "A. an offset from a memory location." }], result: "Register; memory address" } },
    { worked: { tag: "exam", title: "Machine code vs assembly language", src: "AS June 2019 · P2 Q10.2 · 2 marks",
      q: "Describe two differences between machine code and assembly language.",
      steps: [
        { m: "Machine code is binary / the actual instruction, whereas assembly language is written using mnemonics;", mk: "1 mark" },
        { m: "Assembly language needs translating before it can run, whereas machine code can be executed without translation;", mk: "1 mark" }
      ], result: "Binary vs mnemonics; translated vs direct" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain (different processor)", "Different instruction sets + the program is machine code for one of them."],
      ["How many (opcodes / locations / registers)", "2^(bits in THAT field)."],
      ["State (operand types)", "Immediate value, register, memory address."],
      ["Describe differences (machine code vs assembly)", "Binary vs mnemonics; direct vs needs an assembler."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Opcode = Operation; Operand = Object\"", body: "The opcode says **what** to do (and how to read the operand); the operand says **what to do it to**. Fields: 2ᵇⁱᵗˢ of each." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Not portable\" alone (NE.) — name the instruction set.", "Using the whole instruction length instead of the one field.", "Forgetting the mode bit when counting opcodes (32 × 2 = 64)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.2.1 machine code vs assembly; 4.6.3.1 assembler (one-to-one), bytecode for portability; 4.7.3.4 addressing modes in the opcode; 4.5.4.5 two's complement ranges for immediate operands; 4.7.3.2 the CU splits opcode from operand at decode." } }
  ],
  flashcards: [
    ["What is a processor instruction set?", "All the machine code instructions a particular processor can decode and execute."],
    ["Why is an instruction set processor-specific?", "Different processors decode different opcodes, registers and formats."],
    ["What is an opcode?", "The part of an instruction giving the operation (and, in AQA's model, the addressing mode)."],
    ["What is an operand?", "The value, register or memory address the operation uses."],
    ["k opcode bits allow…", "2ᵏ opcodes."],
    ["n operand bits in direct addressing address…", "2ⁿ memory locations."],
    ["32 operations + 1 mode bit → opcodes?", "64."],
    ["Machine code vs assembly?", "Binary executed directly vs mnemonics translated one-to-one by an assembler."],
    ["Why won't a compiled program run on a different processor?", "It is machine code for a different instruction set."]
  ],
  quiz: [
    { q: "A 6-bit opcode allows", opts: ["64 opcodes", "32 opcodes", "6 opcodes", "128 opcodes"], ans: 0, why: "2⁶." },
    { q: "An operand can hold", opts: ["a value, register or memory address", "only a register", "only an opcode", "an addressing mode only"], ans: 0, why: "Three kinds." },
    { q: "An executable fails on another processor because", opts: ["the instruction sets differ", "the clock is slower", "the OS is newer", "the file is too big"], ans: 0, why: "Machine code is specific." },
    { q: "A 10-bit direct operand can address", opts: ["1024 locations", "10 locations", "512 locations", "2048 locations"], ans: 0, why: "2¹⁰." }
  ]
};

/* =====================================================================
   4.7.3.4  Addressing modes
   ===================================================================== */
C["compsci:4.7.3.4"] = {
  notes: [
    { h: "Addressing modes — the whole topic on one page" },
    "Spec 4.7.3.4: understand and apply **immediate** and **direct** addressing. Immediate: **the operand is the datum**. Direct: **the operand is the address of the datum** — where the address means main memory **or a register**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Which mode does this instruction / operand use", "Shade / State", "1", "AS 2016 Q04.4, 2022 Q09.1, A-level 2022 Q09.1"],
      ["What is immediate addressing; immediate vs direct", "What is / Explain", "1", "AS 2017 Q07.3, 2020 Q07.2, A-level 2020 Q09.2"],
      ["Purpose of the operand and how the mode relates", "State and explain", "2", "A-level 2017 Q05.1"],
      ["Complete an immediate instruction", "Complete", "1", "AS 2025 Q10.1"],
      ["Range of an immediate two's complement operand", "Calculate", "1", "A-level 2025 Q07.4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The two modes**, with pictures.", "**Reading AQA assembly**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The two modes" },
    { fig: { w: 600, h: 222, items: (function () {
      var it = [];
      it.push({ text: [150, 14], t: "Immediate: MOV R1, #13", b: true, size: 12, c: "accent" });
      it = it.concat(boxAt(30, 36, 80, 34, "MOV R1", "accent"));
      it = it.concat(boxAt(110, 36, 70, 34, "#13", "good"));
      it = it.concat(arrow(145, 70, 145, 120, "the operand IS the value", { dx: 70, dy: 20 }));
      it = it.concat(boxAt(110, 120, 70, 34, "R1 = 13", "good"));
      it.push({ text: [450, 14], t: "Direct: LDR R1, 13", b: true, size: 12, c: "accent2" });
      it = it.concat(boxAt(320, 36, 80, 34, "LDR R1", "accent2"));
      it = it.concat(boxAt(400, 36, 60, 34, "13", "accent3"));
      it = it.concat(arrow(430, 70, 500, 104, "an address", { dx: 30 }));
      [[12, "…"], [13, "250"], [14, "…"]].forEach(function (c, i) {
        it = it.concat(boxAt(500, 96 + i * 30, 80, 30, c[0] + ": " + c[1], i === 1 ? "good" : "muted"));
      });
      it.push({ text: [540, 210], t: "R1 = 250 (the contents)", size: 10.5, c: "muted" });
      return it;
    })(), cap: "Immediate: the operand is used as it is. Direct: the operand says where the datum is — fetch the contents of that location (or register)." } },
    { table: { head: ["", "Immediate", "Direct"], rows: [
      ["The operand is", "**the datum** (the value itself)", "**the address** of the datum (memory location or register number)"],
      ["Extra memory access in execute?", "no — the value is already in the instruction", "yes for a memory address — fetch the contents first"],
      ["Range of values", "limited by the operand's bits (12 bits: −2048 … 2047)", "any value the location holds; operand bits limit how many locations"],
      ["Use", "constants, counters, masks: `#1`, `#10`, `#15`", "variables in memory: `LDR R0, 100`; register operands: `ADD R3, R3, R0`"],
      ["AQA syntax", "`#` before a decimal value", "a bare number (memory) or `Rm` (register)"]
    ] } },
    { callout: { t: "miscon", h: "Register operands are DIRECT", body: "In `ADD R3, R3, R0`, `R0` is the **number of a register** holding the datum — an address of the datum — so AQA calls it **direct** addressing (A-level 2022 Q09.1). Only a `#` operand is immediate." } },
    { callout: { t: "warn", h: "The missing #", body: "`MOV R1, 13` is not \"load 13\" — the AQA set has no MOV from memory, and the mark scheme **R.** \"13\" for `#13` (AS 2025 Q10.1). In programs, a missing `#` costs a **DPT** every time it is the first such error." } },

    { page: "Reading AQA assembly" },
    ISA,
    { table: { head: ["Operand form", "Means", "Mode"], rows: [
      ["`#25`", "the decimal value 25", "immediate"],
      ["`R6`", "the value stored in register 6", "direct (register)"],
      ["`100` (in LDR/STR)", "the value stored in memory location 100", "direct (memory)"]
    ] } },
    { callout: { t: "tip", h: "Registers available", body: "AQA papers say the general-purpose registers are **R0 to R12**. A register called `R13` or `Rd` in your answer is a DPT." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Which mode in MOV R2, #0?", src: "AS June 2016 · P2 Q04.4 · 1 mark",
      q: "Shade one lozenge to indicate which addressing mode is being used with the second operand in MOV R2, #0: Direct / Immediate.",
      steps: [{ m: "**Immediate**;", mk: "1 mark" }], result: "Immediate" } },
    { worked: { tag: "exam", title: "Direct vs immediate", src: "AS June 2017 · P2 Q07.3 · 1 mark",
      q: "Explain the difference between direct addressing and immediate addressing.",
      steps: [{ m: "Direct addressing means the operand is the (memory) address / register number of the datum, whereas immediate addressing means the operand is the datum;", mk: "1 mark", n: "It must be clear that it is the OPERAND being described." }], result: "Address of the datum vs the datum" } },
    { worked: { tag: "exam", title: "What is immediate addressing?", src: "AS June 2020 · P2 Q07.2 · 1 mark",
      q: "An instruction uses immediate addressing. What is immediate addressing?",
      steps: [{ m: "The operand is the datum;", mk: "1 mark", n: "A-level 2020 Q09.2: \"the operand is the value / datum that the instruction should use\"." }], result: "The operand is the datum" } },
    { worked: { tag: "exam", title: "Pick the immediate instruction", src: "AS June 2022 · P2 Q09.1 · 1 mark",
      q: "Which instruction uses immediate addressing? A LDR R3, 42 · B MOV R3, #42 · C STR R3, 101 · D SUB R3, R2, R1.",
      steps: [{ m: "**B** MOV R3, #42;", mk: "1 mark" }], result: "B" } },
    { worked: { tag: "exam", title: "Load 13 into R1", src: "AS June 2025 · P2 Q10.1 · 1 mark",
      q: "An instruction loads the integer value 13 into register R1. Complete: MOV R1, ______",
      steps: [{ m: "**#13**;", mk: "1 mark", n: "R. 13 — that is not the AQA syntax for a value." }], result: "#13" } },
    { worked: { tag: "exam", title: "Mode in ADD R3, R3, R0", src: "A-level June 2022 · P2 Q09.1 · 1 mark",
      q: "State the name of the addressing mode used in the instruction ADD R3, R3, R0.",
      steps: [{ m: "**Direct** (addressing);", mk: "1 mark", n: "R0 is a register — an address of the datum." }], result: "Direct" } },
    { worked: { tag: "exam", title: "Operand and addressing mode", src: "A-level June 2017 · P2 Q05.1 · 2 marks",
      q: "State the purpose of the operand part of an instruction and explain how the addressing mode is related to this.",
      steps: [
        { h: "Knowledge", m: "An operand is a value / data that will be used by an operation;", mk: "1 mark" },
        { h: "Understanding", m: "The addressing mode indicates how the value in the operand should be interpreted — whether it is a memory address / register or a data (immediate) value;", mk: "1 mark", n: "NE. \"indicates if direct or immediate addressing is used\"." }
      ], result: "Operand = data used; mode says how to read it" } },
    { worked: { tag: "exam", title: "Range of a 12-bit immediate", src: "A-level June 2025 · P2 Q07.4 · 1 mark",
      q: "When immediate addressing is used, operand C (12 bits in the 32-bit ADD format) is a numeric value represented as a two's complement binary integer. In decimal, calculate the range of numbers operand C can represent.",
      steps: [{ m: "Most positive $2^{11} − 1$ = **2047**; most negative $−2^{11}$ = **−2048**", mk: "1 mark", n: "Both must be correct." }], result: "−2048 to 2047" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State the mode", "`#` → immediate; anything else (memory number or Rm) → direct."],
      ["Explain the difference", "The OPERAND is the datum vs the OPERAND is the address of the datum."],
      ["Complete the instruction", "`#` + decimal."],
      ["Calculate the range", "n-bit two's complement: −2ⁿ⁻¹ … 2ⁿ⁻¹ − 1."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Hash = Here; no hash = go There\"", body: "With `#` the value is **here** in the instruction (immediate). Without it, **go there** — to the memory location or register named — to find it (direct)." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Calling a register operand immediate.", "Writing 13 for #13.", "\"Immediate addressing is faster\" as the definition.", "Describing the instruction, not the operand."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.3.3 the mode bit in the opcode; 4.7.3.2 a direct memory operand needs an extra fetch in execute; 4.5.4.5 two's complement range; 4.2.1 a pointer / reference is the HLL cousin of direct addressing." } }
  ],
  flashcards: [
    ["Immediate addressing?", "The operand is the datum."],
    ["Direct addressing?", "The operand is the address (memory location or register) of the datum."],
    ["Mode of MOV R2, #0?", "Immediate."],
    ["Mode of ADD R3, R3, R0?", "Direct (register)."],
    ["Mode of LDR R1, 100?", "Direct (memory)."],
    ["AQA syntax for the value 13?", "#13."],
    ["12-bit two's complement immediate range?", "−2048 to 2047."],
    ["How does the addressing mode relate to the operand?", "It says how the operand's value is interpreted — as data or as an address."],
    ["Which mode needs an extra memory access?", "Direct with a memory address."]
  ],
  quiz: [
    { q: "In MOV R3, #42 the operand is", opts: ["the datum (immediate)", "an address (direct)", "a register", "an opcode"], ans: 0, why: "# = value." },
    { q: "In SUB R3, R2, R1 the mode of R1 is", opts: ["direct", "immediate", "indexed", "relative"], ans: 0, why: "A register number." },
    { q: "Which uses immediate addressing?", opts: ["MOV R3, #42", "LDR R3, 42", "STR R3, 101", "ADD R1, R1, R2"], ans: 0, why: "Only # is immediate." },
    { q: "\"MOV R1, 13\" to load 13 is", opts: ["rejected — needs #13", "correct", "direct addressing of 13", "accepted"], ans: 0, why: "AS 2025 Q10.1." }
  ]
};

/* =====================================================================
   4.7.3.5  Machine-code / assembly language operations
   ===================================================================== */
C["compsci:4.7.3.5"] = {
  notes: [
    { h: "Machine-code and assembly language operations — the whole topic on one page" },
    "Spec 4.7.3.5: understand and apply the basic machine-code operations **load, add, subtract, store, branching (conditional and unconditional), compare, logical bitwise operators (AND, OR, NOT, XOR), logical shift right, shift left, halt**, written in mnemonic form (assembly language) with immediate and direct addressing.",
    "Every Paper 2 has an assembly question — 30 sub-questions in the packs, from 1-mark single instructions to an 8-mark and a 10-mark program:",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Complete one instruction; one shift", "Complete / What value", "1", "AS 2016 Q04.2, 2017 Q07.2"],
      ["Translate an IF / loop into assembly", "Write", "4–7", "AS 2016 Q04.3, 2019 Q10.1, 2022 Q09.2, 2023 Q09"],
      ["Complete a partial program", "Complete", "4", "AS 2017 Q07.1, 2018 Q10.1, 2025 Q10.2, A-level 2018 Q12"],
      ["Write a program from a specification", "Write", "3–10", "AS 2020 Q07.1, 2024 Q08, A-level 2019 Q10.1, 2020 Q09.3, 2023 Q07.3"],
      ["Masking: AND / ORR results", "Show", "1", "A-level 2023 Q07.1–07.2"],
      ["Trace a program; state its purpose", "Complete / Explain", "1–6", "A-level 2017 Q05.2–05.3, 2021 Q06, 2022 Q09.2–09.3, 2024 Q10.1–10.2"],
      ["Explain each section of a control program", "Complete", "6", "A-level 2025 Q14"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The AQA instruction set**.", "**Selection and iteration** — templates from C#.", "**Bitwise operations, masking and shifts**.", "**Writing programs: AS**.", "**Writing programs: A-level**.", "**Trace tables**.", "**Exam toolkit**."] },

    { page: "The AQA instruction set" },
    ISA,
    { callout: { t: "def", h: "Syntax rules the mark scheme enforces", body: ["One instruction per line; operands separated by commas.", "A label is an identifier followed by a colon on its own line (or before an instruction): `loop:`. Branches name it without the colon: `B loop`.", "`#` for a decimal value; `Rm` for a register R0–R12; a bare number in LDR/STR is a memory address.", "Arithmetic and logic work on REGISTERS: load from memory first, operate, then store. `ADD 100, 100, #1` is not valid."] } },
    { callout: { t: "miscon", h: "CMP then branch — always", body: "Branches test the **last comparison**. `BEQ` after `ADD` tests whatever was compared before. Every IF and loop condition is a `CMP` immediately followed by a `B<cond>`." } },

    { page: "Selection and iteration" },
    { h: "IF … ELSE" },
    { code: { lang: "csharp", src: "if (x < 50) { y = 1; } else { y = 2; }", cap: "C# — x in R1, y in R2." } },
    { code: { lang: "asm", src: "      CMP R1, #50\n      BLT then        ; condition true → THEN part\n      MOV R2, #2      ; ELSE part (falls through)\n      B endif         ; skip the THEN part\nthen:\n      MOV R2, #1\nendif:", cap: "Pattern: compare, branch to THEN on true, ELSE falls through, unconditional branch over THEN." } },
    { h: "WHILE loop (test first)" },
    { code: { lang: "csharp", src: "while (b > 0) { c = c + a; b = b - 1; }", cap: "C# — a, b, c in R1, R2, R3." } },
    { code: { lang: "asm", src: "start:\n      CMP R2, #0\n      BEQ end         ; exit when the condition fails\n      ADD R3, R3, R1\n      SUB R2, R2, #1\n      B start         ; back to the test\nend:\n      HALT", cap: "Pattern: label, compare, conditional exit, body, unconditional branch back." } },
    { h: "REPEAT … UNTIL / count-controlled (test last)" },
    { code: { lang: "asm", src: "      MOV R0, #1\nloop:\n      ; body\n      ADD R0, R0, #1\n      CMP R0, #11\n      BNE loop        ; repeat until R0 = 11\n      HALT", cap: "Body runs at least once; one conditional branch back." } },
    { table: { head: ["Condition wanted", "Branch to THEN with", "or skip THEN with"], rows: [
      ["a = b", "`BEQ`", "`BNE`"],
      ["a ≠ b", "`BNE`", "`BEQ`"],
      ["a < b", "`BLT`", "`BGT` + `BEQ`"],
      ["a ≥ b", "`BGT` + `BEQ`", "`BLT`"],
      ["a > b", "`BGT`", "`BLT` + `BEQ`"],
      ["a ≤ b", "`BLT` + `BEQ`", "`BGT`"]
    ] } },
    { callout: { t: "tip", h: "No ≤ or ≥ branch", body: "AQA has only EQ, NE, GT, LT. Build ≥ from GT then EQ (two branches to the same label), or shift the constant: \"x ≥ 50\" for integers is \"x > 49\"." } },

    { page: "Bitwise operations, masking and shifts" },
    { table: { head: ["Operation", "Effect", "Typical use"], rows: [
      ["`AND Rd, Rn, #mask`", "keeps bits where the mask is 1, **clears** the rest", "isolate bits: `AND R3, R1, #1` → 1 if odd; `AND R2, R0, #15` → low nibble"],
      ["`ORR Rd, Rn, #mask`", "**sets** bits where the mask is 1, keeps the rest", "set a flag bit: `ORR R1, R1, #128` sets the MSB"],
      ["`EOR Rd, Rn, #mask`", "**toggles** bits where the mask is 1", "flip bits; Vernam encryption (4.5.6.10)"],
      ["`MVN Rd, <operand2>`", "inverts **every** bit", "ones' complement; with ADD #1 → two's complement negation"],
      ["`LSL Rd, Rn, #n`", "shift left n places, 0s in on the right", "multiply by $2^n$ (bits off the left are lost)"],
      ["`LSR Rd, Rn, #n`", "shift right n places, 0s in on the left", "integer-divide by $2^n$ (unsigned); move a high nibble down"]
    ] } },
    { worked: { tag: "exam", title: "Masking with AND", src: "A-level June 2023 · P2 Q07.1 · 1 mark",
      q: "Registers hold 8-bit values. In binary, show the result of AND R0, R1, #15 when R1 contains the decimal value 70 (46 in hexadecimal).",
      steps: [{ m: "R1 = 0100 0110, 15 = 0000 1111 → R0 = **0000 0110**", mk: "1 mark", n: "R. any cell of R0 left empty — write all 8 bits." }], result: "00000110" } },
    { worked: { tag: "exam", title: "Setting bits with ORR", src: "A-level June 2023 · P2 Q07.2 · 1 mark",
      q: "In binary, show the result of ORR R0, R1, #48 when R1 contains the decimal value 6.",
      steps: [{ m: "R1 = 0000 0110, 48 = 0011 0000 → R0 = **0011 0110**", mk: "1 mark", n: "48 = 0x30: this turns the digit 6 into the ASCII code for '6'." }], result: "00110110" } },
    { worked: { tag: "exam", title: "Test for odd", src: "AS June 2016 · P2 Q04.2 · 1 mark",
      q: "All even numbers end in 0 and all odd numbers end in 1. Complete the instruction to help identify whether R1 contains an odd number, storing the result in R3: AND R3, R1, ___",
      steps: [{ m: "**#1**;", mk: "1 mark", n: "R. 1 (without #). R3 = 1 if odd, 0 if even." }], result: "#1" } },
    { worked: { tag: "exam", title: "One logical shift", src: "AS June 2017 · P2 Q07.2 · 1 mark",
      q: "R1 contains the decimal value 7. What value will be contained in R1 after LSL R1, R1, #2 is executed?",
      steps: [{ m: "0111 → 11100 = **28** (7 × 2²)", mk: "1 mark" }], result: "28" } },
    { callout: { t: "miscon", h: "Side by side: logical vs arithmetic shift", body: "AQA's LSR fills with **0**, so it halves only **unsigned** (or positive) values: LSR of 1111 1100 (−4) gives 0111 1110 (126), not −2. An arithmetic shift right would copy the sign bit — not in the AQA set." } },

    { page: "Writing programs: AS" },
    { worked: { tag: "exam", title: "IsEven → 69 or 79", src: "AS June 2016 · P2 Q04.3 · 6 marks",
      q: "IF IsEven(A) THEN B ← 69 ELSE B ← 79. R1 holds A, R2 holds B, R3 is free. Write a sequence of assembly language instructions that performs the same operations.",
      steps: [
        { m: "`AND R3, R1, #1` · `CMP R3, #0` · `BEQ even`", mk: "2 marks", n: "AO3 design: a comparison and branch for the IF (1); labels for branching (1). AO3 programming: compare R3 with 0 or 1 and branch with the right condition (1)." },
        { m: "`MOV R2, #79` · `B end`", mk: "2 marks", n: "79 into R2 in the ELSE part (1); an unconditional branch over the other MOV, or HALT (1)." },
        { m: "`even:` · `MOV R2, #69` · `end:`", mk: "2 marks", n: "69 into R2 in the THEN part (1). MAX 3 programming marks if syntax is wrong or it fails in any case. DPT missing #." }
      ], result: "AND / CMP / BEQ / two MOVs" } },
    { worked: { tag: "exam", title: "Count 1 to 10 into location 17", src: "AS June 2017 · P2 Q07.1 · 4 marks",
      q: "Complete: MOV R0, #1 · startloop: · STR R0, 17 · [up to four lines] · endloop: · HALT — so the code counts from 1 to 10 inclusive, writing each value to memory location 17.",
      steps: [
        { m: "`ADD R0, R0, #1`", mk: "1 mark" },
        { m: "`CMP R0, #11`", mk: "1 mark" },
        { m: "`BNE startloop`", mk: "1 mark", n: "Alternatives: BEQ endloop then B startloop; or CMP R0, #10 / BEQ endloop / ADD / B startloop. Stop marking at the first incorrect command. Running it writes 1, 2 … 10." }
      ], result: "Increment, compare with 11, loop" } },
    { worked: { tag: "exam", title: "Divide by 10 by subtraction", src: "AS June 2018 · P2 Q10.1 · 4 marks",
      q: "Complete: MOV R3, #0 · loopstart: · CMP R1, #10 · [four lines] · end: · HALT — so that R3 counts how many times 10 goes into R1 (R1 already holds the value).",
      steps: [
        { m: "`BLT end`", mk: "1 mark", n: "AO3 design: two branches needed." },
        { m: "`SUB R1, R1, #10`", mk: "1 mark" },
        { m: "`ADD R3, R3, #1`", mk: "1 mark" },
        { m: "`B loopstart`", mk: "1 mark", n: "R3 = R1 DIV 10 and R1 is left holding R1 MOD 10. MAX 2 programming if syntax wrong." }
      ], result: "Quotient in R3, remainder in R1" } },
    { worked: { tag: "exam", title: "Russian peasant multiplication", src: "AS June 2019 · P2 Q10.1 · 7 marks",
      q: "Y ← 0; REPEAT Z ← W AND 1; IF Z = 1 THEN Y ← Y + X; W ← W DIV 2; X ← X × 2 UNTIL W = 0. W, X, Y, Z are R0–R3. Given: MOV R0, #9 · MOV R1, #12 · MOV R2, #0 · startloop: AND R3, R0, #1 · … · jump: · … · B startloop · endloop: — complete it.",
      steps: [
        { m: "Before `jump:` — `CMP R3, #1` · `BNE jump` · `ADD R2, R2, R1`", mk: "3 marks" },
        { m: "After `jump:` — `LSR R0, R0, #1` (W DIV 2) · `LSL R1, R1, #1` (X × 2)", mk: "1 mark", n: "AO2: recognising that shifts do ÷2 and ×2 (1)." },
        { m: "`CMP R0, #0` · `BEQ endloop` before `B startloop`", mk: "1 mark", n: "AO2: two comparisons and two branches needed (1). Result: R2 = 108 = 9 × 12." }
      ], result: "Y = 108" } },
    { worked: { tag: "exam", title: "Caesar cipher, codes 0–25", src: "AS June 2020 · P2 Q07.1 · 4 marks",
      q: "Location 100 holds a character code 0–25; location 101 a key 0–25. Write a program to store the Caesar-encrypted code in location 102.",
      steps: [
        { m: "`LDR R0, 100` · `LDR R1, 101` … `STR R2, 102`", mk: "1 mark" },
        { m: "`ADD R2, R0, R1`", mk: "1 mark" },
        { m: "`CMP R2, #26` · `BLT store` (store: on the STR)", mk: "1 mark" },
        { m: "`SUB R2, R2, #26` · `store:` · `STR R2, 102`", mk: "1 mark", n: "Or CMP R2, #25 / BGT adjust. Checked for all 676 code/key pairs. MAX 3 if any errors." }
      ], result: "(code + key) mod 26" } },
    { worked: { tag: "exam", title: "Double X if below 50", src: "AS June 2022 · P2 Q09.2 · 4 marks",
      q: "IF X < 50 THEN X ← X × 2. X is in memory location 101. Write the program.",
      steps: [
        { m: "`LDR R1, 101`", mk: "1 mark" },
        { m: "`CMP R1, #50`", mk: "1 mark" },
        { m: "`BLT double` · `B endif` (or `BGT end` · `BEQ end`)", mk: "1 mark" },
        { m: "`double:` · `LSL R1, R1, #1` · `STR R1, 101` · `endif:`", mk: "1 mark", n: "5 points, MAX 4: load, compare with 50, branch, shift left to double, store back. A. any register R0–R12, any labels, other doubling (ADD R1, R1, R1)." }
      ], result: "Load, CMP, branch, LSL, store" } },
    { worked: { tag: "exam", title: "Multiply by repeated addition", src: "AS June 2023 · P2 Q09 · 4 marks",
      q: "A ← 4; B ← 3; C ← 0; WHILE B > 0: C ← C + A; B ← B − 1. A, B, C are R1, R2, R3; the three MOVs are given. Write the rest.",
      steps: [
        { m: "`start:` · `CMP R2, #0` · `BEQ end`", mk: "1 mark", n: "Or BGT addone with HALT; or CMP R2, #1 / BLT end." },
        { m: "`ADD R3, R3, R1`", mk: "1 mark" },
        { m: "`SUB R2, R2, #1`", mk: "1 mark" },
        { m: "`B start` · `end:` · `HALT`", mk: "1 mark", n: "R3 = 12." }
      ], result: "C = 12" } },
    { worked: { tag: "exam", title: "Greater into R1; flag into R2", src: "AS June 2024 · P2 Q08 · 4 marks",
      q: "R1 and R3 each store a different positive number. Write a program that stores the greater number in R1, and stores 1 in R2 if the value originally in R1 was greater, 3 otherwise.",
      steps: [
        { m: "`CMP R1, R3` · `BGT r1bigger`", mk: "2 marks", n: "Comparing R1 and R3 (1); branching to different blocks (1)." },
        { m: "`MOV R1, R3` · `MOV R2, #3` · `B end`", mk: "1 mark", n: "Greater number always ends in R1." },
        { m: "`r1bigger:` · `MOV R2, #1` · `end:` · `HALT`", mk: "1 mark", n: "R2 = 1 or 3 correctly. Checked for all pairs 1–8." }
      ], result: "One compare, two blocks" } },
    { worked: { tag: "exam", title: "The nth triangular number", src: "AS June 2025 · P2 Q10.2 · 4 marks",
      q: "n is in R0. Complete a program to calculate the nth triangular number (1, 3, 6, 10, 15 …) into R1.",
      steps: [
        { m: "`MOV R1, #0` · `loop:`", mk: "1 mark", n: "Initialising registers." },
        { m: "`ADD R1, R1, R0`", mk: "1 mark", n: "Correct calculation into R1." },
        { m: "`SUB R0, R0, #1`", mk: "1 mark", n: "Decrement the loop counter." },
        { m: "`CMP R0, #0` · `BNE loop` · `HALT`", mk: "1 mark", n: "Loop runs n times: R1 = n + (n−1) + … + 1. Checked n = 1 … 14. MAX 3 if any errors." }
      ], result: "R1 = n(n+1)/2" } },

    { page: "Writing programs: A-level" },
    { worked: { tag: "exam", title: "Caesar for capitals only", src: "A-level June 2018 · P2 Q12 · 6 marks",
      q: "CMP R1, #65 · BLT doNotEncrypt · CMP R1, #90 · BGT doNotEncrypt · ADD R3, R1, R2 · [position 1] · doNotEncrypt: · [position 2] · finished: · HALT. Capitals are 65–90; non-capitals are copied unchanged. (a) Purpose of R1, R2, R3. (b) The instruction at position 2. (c) The instructions at position 1.",
      steps: [
        { h: "(a)", m: "R1 the plaintext character code; R2 the key (shift); R3 the encrypted character code;", mk: "2 marks", n: "1 mark for one or two; 2 for all three." },
        { h: "(b)", m: "`MOV R3, R1`", mk: "1 mark", n: "A. ORR R3, R1, #0." },
        { h: "(c)", m: "`CMP R3, #91` · `BLT finished` · `SUB R3, R3, #26` · `B finished`", mk: "3 marks", n: "R3 compared with 90 or 91 first (1); 26 subtracted from R3 (1); fully working (1). Checked for every printable code and every key." }
      ], result: "Wrap past Z by −26" } },
    { worked: { tag: "exam", title: "Greatest common divisor (8 marks)", src: "A-level June 2019 · P2 Q10.1 · 8 marks",
      q: "WHILE A ≠ B: IF A > B THEN A ← A − B ELSE B ← B − A. A is in location 102, B in 103; store the gcd in 104. Write the program.",
      steps: [
        { m: "`LDR R1, 102` · `LDR R2, 103`", mk: "1 mark" },
        { m: "`loop:` · `CMP R1, R2` · `BEQ finish`", mk: "2 marks", n: "Comparison (1); exit when equal (1)." },
        { m: "`BGT agreater` · `SUB R2, R2, R1` · `B loop`", mk: "1 mark", n: "B ← B − A when A < B." },
        { m: "`agreater:` · `SUB R1, R1, R2` · `B loop`", mk: "1 mark", n: "A ← A − B when A > B." },
        { m: "`finish:` · `STR R1, 104`", mk: "1 mark" },
        { m: "AO2: a loop back to the comparison after each subtraction; the method followed correctly.", mk: "2 marks", n: "MAX 7 if not fully working. Checked against gcd for all A, B from 1 to 29." }
      ], result: "Euclid by subtraction" } },
    { worked: { tag: "exam", title: "Vernam in assembly", src: "A-level June 2020 · P2 Q09.3 · 3 marks",
      q: "Write a program to encrypt a plaintext character (code in location 101) with the Vernam cipher using the key part in location 102, storing the ciphertext in location 103.",
      steps: [
        { m: "`LDR R1, 101` · `LDR R2, 102`", mk: "1 mark" },
        { m: "`EOR R3, R1, R2`", mk: "1 mark", n: "A. XOR built from two ANDs, two NOTs and an OR." },
        { m: "`STR R3, 103`", mk: "1 mark" }
      ], result: "LDR, LDR, EOR, STR" } },
    { worked: { tag: "exam", title: "Byte → two ASCII hex digits (10 marks)", src: "A-level June 2023 · P2 Q07.3 · 10 marks",
      q: "Load an 8-bit value from location 100; store the ASCII code of its left hexadecimal digit in 101 and of its right digit in 102 (e.g. 1001 1110 = 9E → '9' = 57, 'E' = 69). Use masking and/or shifting. ASCII: '0'–'9' = 48–57, 'A'–'F' = 65–70.",
      steps: [
        { h: "Right digit", m: "`LDR R0, 100` · `AND R2, R0, #15` · `CMP R2, #10` · `BLT isnumber` · `ADD R2, R2, #55` · `B doleft` · `isnumber:` · `ADD R2, R2, #48`", mk: "MP1, MP3, MP7, MP9, MP4, MP10" },
        { h: "Left digit", m: "`doleft:` · `LSR R1, R0, #4` · `CMP R1, #10` · `BLT isnumber2` · `ADD R1, R1, #55` · `B store` · `isnumber2:` · `ADD R1, R1, #48`", mk: "MP8, MP5, MP6" },
        { h: "Store", m: "`store:` · `STR R1, 101` · `STR R2, 102`", mk: "MP2", n: "6 AO3 + 4 AO2 marks; MAX 9 if not fully working. 55 = 'A' − 10. Checked for all 256 bytes (00 → \"00\" … FF → \"FF\")." }
      ], result: "Mask the low nibble, shift the high, add 48 or 55" } },
    { worked: { tag: "exam", title: "The robot control program", src: "A-level June 2025 · P2 Q14 · 6 marks",
      q: "Location 100: B7 left motor, B6 right motor, B5 arm motor (outputs); B4 ultrasonic, B3 light, B2–B0 touch sensors X, Y, Z (inputs). Explain sections 2 to 6: [1] MOV R0, #192 · STR R0, 100 [2] wait: LDR R1, 100 · AND R1, R1, #7 · CMP R1, #0 · BEQ wait [3] MOV R0, #0 · STR R0, 100 [4] MOV R3, #0 · (add each of R1's three low bits into R3 using AND #1 and LSR #1) · CMP R3, #2 · BNE end [5] MOV R0, #32 · STR R0, 100 [6] arm: LDR R1, 100 · AND R1, R1, #8 · CMP R1, #0 · BEQ arm · MOV R0, #0 · STR R0, 100 · end: HALT. (Program reconstructed from the mark scheme; section 1 drives forward.)",
      steps: [
        { h: "Section 2", m: "Keep going forward until at least one of touch sensors X, Y or Z is activated;", mk: "1 mark" },
        { h: "Section 3", m: "Stop the robot moving (both wheel motors off);", mk: "1 mark" },
        { h: "Section 4", m: "Count how many of the touch sensors X, Y, Z are activated;", mk: "1 mark" },
        { h: "Section 4", m: "end the program if that number is not 2;", mk: "1 mark", n: "NE. \"stop the robot\" for ending the program." },
        { h: "Section 5", m: "Turn on the accessory arm;", mk: "1 mark" },
        { h: "Section 6", m: "Keep the arm moving until the light sensor is activated, then stop it;", mk: "1 mark", n: "Describe the EFFECT on the robot — I. line-by-line descriptions (\"add one onto R3\")." }
      ], result: "Purpose, not mechanics" } },
    { callout: { t: "tip", h: "Decode the masks first", body: "192 = 1100 0000 (both wheels), 32 = 0010 0000 (arm), 7 = 0000 0111 (the three touch sensors), 8 = 0000 1000 (light sensor). Translating every `#` constant into binary is how you read any control program." } },

    { page: "Trace tables" },
    { callout: { t: "formula", h: "Method: trace a program", body: ["1. One column per register / memory location; write a new value only when it **changes**, in a new row below the last one in that column.", "2. Follow branches honestly: evaluate each CMP with the CURRENT values.", "3. Write binary beside decimal for shifts and masks — the paper suggests it.", "4. Then read the inputs and outputs to name the PURPOSE (multiply, divide, parity…)."] } },
    { worked: { tag: "exam", title: "Five times? (trace)", src: "A-level June 2017 · P2 Q05.2–05.3 · 5 marks",
      q: "LDR R1, 100 · LSL R2, R1, #2 · ADD R1, R1, R2 · LDR R3, 101 · CMP R3, R1 · BEQ labela · MOV R4, #0 · B labelb · labela: MOV R4, #1 · labelb: STR R4, 102 · HALT. Memory: 100 = 10, 101 = 50, 102 = 80. (a) Trace in decimal. (b) Explain what the program does.",
      steps: [
        { m: "R1: 10 → 50 · R2: 40 · R3: 50 · R4: 1 · location 102: 80 → 1", mk: "4 marks" },
        { m: "It checks whether the value in location 101 is five times the value in 100 (R1 + 4·R1 = 5·R1), storing 1 in 102 if so and 0 if not;", mk: "1 mark" }
      ], result: "50 = 5 × 10 → 1" } },
    { worked: { tag: "exam", title: "Shift-and-add multiplication (trace)", src: "A-level June 2022 · P2 Q09.2–09.3 · 6 marks",
      q: "LDR R0, 120 · LDR R1, 121 · MOV R3, #0 · loop: CMP R1, #0 · BEQ exit · AND R2, R1, #1 · CMP R2, #0 · BEQ skip · ADD R3, R3, R0 · skip: LSL R0, R0, #1 · LSR R1, R1, #1 · B loop · exit: STR R3, 122 · HALT. Location 120 = 23, 121 = 5. (a) Trace. (b) State the purpose.",
      steps: [
        { m: "R0, R1, R3 start 23, 5, 0; R2 = 1 and R3 → 23", mk: "2 marks" },
        { m: "R0 → 46, R1 → 2; R2 → 0", mk: "1 mark" },
        { m: "R0 → 92 → 184, R1 → 1 → 0, R2 → 1, R3 → 115", mk: "1 mark" },
        { m: "location 122 → 115", mk: "1 mark", n: "MAX 4 if any wrong value." },
        { m: "It multiplies the numbers in 120 and 121, storing the product in 122 (23 × 5 = 115);", mk: "1 mark" }
      ], result: "115" } },
    { table: { head: ["R0", "R1", "R2", "R3", "122"], rows: [["23", "5", "", "0", ""], ["", "", "1", "23", ""], ["46", "2", "0", "", ""], ["92", "1", "1", "115", ""], ["184", "0", "", "", "115"]] } },
    { worked: { tag: "exam", title: "Long division in binary (trace, 6 marks)", src: "A-level June 2021 · P2 Q06 · 8 marks",
      q: "The program in Figure 4 (shift R2 and R3 left until R2 ≥ R1, then repeatedly subtract and shift right) takes inputs R1 = 34 and R2 = 6. (a) Complete the trace. (b) Describe the purpose.",
      steps: [
        { m: "R0 = 0, R3 = 1; shifting left: R2 12, 24, 48 and R3 2, 4, 8", mk: "2 marks", n: "Area 1 initial values; area 2 the left shifts." },
        { m: "48 > 34, so shift back: R2 = 24, R3 = 4", mk: "1 mark" },
        { m: "34 ≥ 24: R0 = 4, R1 = 10; R4 = 0 → R2 = 12, R3 = 2; 10 < 12 skip; R2 = 6, R3 = 1", mk: "2 marks" },
        { m: "10 ≥ 6: R0 = 5, R1 = 4; R4 = 1 so R2 stays 6; R3 = 0 → stop", mk: "1 mark", n: "MAX 5 if any wrong value." },
        { m: "It performs integer division: R0 is the quotient (34 DIV 6 = 5) and R1 the remainder (4);", mk: "2 marks", n: "Checked for several dividends and divisors." }
      ], result: "R0 = 5, R1 = 4" } },
    { worked: { tag: "exam", title: "The parity setter (trace, 6 marks)", src: "A-level June 2024 · P2 Q10.1–10.2 · 8 marks",
      q: "LDR R1, 130 · MOV R2, #0 · MOV R4, #0 · repeat: ADD R2, R2, #1 · AND R3, R1, #1 · CMP R3, #0 · BEQ skip · ADD R4, R4, #1 · skip: LSR R1, R1, #1 · CMP R2, #7 · BNE repeat · LDR R1, 130 · AND R4, R4, #1 · CMP R4, #0 · BNE else · ORR R1, R1, #128 · B end · else: AND R1, R1, #127 · end: STR R1, 130 · HALT. Location 130 holds 83 (0101 0011, 'S'). (a) Trace with 8-bit registers. (b) Purpose.",
      steps: [
        { m: "R1: 83, 41, 20, 10, 5, 2, 1, 0 (shifted right 7 times)", mk: "1 mark" },
        { m: "R2: 0 then 1 … 7; R3: 1, 1, 0, 0, 1, 0, 1", mk: "2 marks" },
        { m: "R4: 0, 1, 2, 3, 4 — four 1s counted — then AND #1 → 0", mk: "1 mark" },
        { m: "R4 = 0 (even count) → R1 reloaded 83 → ORR #128 → 211 (1101 0011) → location 130 = 211", mk: "2 marks", n: "Max 5 if any wrong value." },
        { m: "It sets the parity bit (bit 7) of the 7-bit ASCII code using **odd parity**;", mk: "2 marks", n: "Without parity: \"counts the number of 1s\" (1). Checked: every 7-bit code ends with an odd number of 1s." }
      ], result: "Odd parity: 83 → 211" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Write a program / sequence", "Correct AQA syntax; every condition = CMP + B<cond>; labels with colons; # on values; load → operate → store."],
      ["Complete the program", "Fit the given lines; stop marking at the first wrong command — so check each line."],
      ["Complete the trace table", "New value only on change, in sequence per column; binary helps."],
      ["Explain / state the purpose", "What it computes (multiply, divide, parity), not a line-by-line description."],
      ["Show the result in binary", "All 8 bits filled."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Load, Operate, Store\" and \"Compare, then Branch\"", body: "**LOS** for every calculation on memory; **CB** for every decision. Masks: **AND clears, ORR sets, EOR flips**; shifts: **LSL doubles, LSR halves**." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Missing # on a value (DPT).", "Arithmetic directly on memory addresses.", "A branch with no CMP before it, or after the wrong one.", "Labels without colons, or line numbers as labels.", "Registers outside R0–R12 or `Rd` (DPT).", "Describing code line by line when the purpose is asked."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1 selection and iteration in a HLL become CMP/branch patterns; 4.5.4.3 binary multiplication by shifting; 4.5.5.3 parity; 4.5.6.10 Caesar and Vernam ciphers; 4.6.4.1 the gates behind AND/ORR/EOR/MVN; 4.3.1 gcd and division algorithms; 4.7.3.4 # vs direct." } }
  ],
  flashcards: [
    ["How do you write IF a = b in AQA assembly?", "CMP Ra, Rb then BEQ (to THEN) or BNE (to skip it)."],
    ["Which branch conditions exist?", "EQ, NE, GT, LT — plus unconditional B."],
    ["How do you test for odd?", "AND Rd, Rn, #1 → 1 if odd."],
    ["What does AND with a mask do?", "Keeps bits where the mask is 1, clears the rest."],
    ["What does ORR with a mask do?", "Sets bits where the mask is 1."],
    ["What does EOR with a mask do?", "Toggles bits where the mask is 1."],
    ["LSL by n?", "Multiply by 2ⁿ."],
    ["LSR by n?", "Integer divide by 2ⁿ (unsigned)."],
    ["How do you isolate the low nibble?", "AND Rd, Rn, #15."],
    ["How do you get the high nibble of a byte?", "LSR Rd, Rn, #4 (after AND #240 if needed)."],
    ["Can ADD work on a memory address?", "No — LDR into a register, ADD, then STR."],
    ["How to do a ≥ b?", "BGT and BEQ to the same label (or > b−1)."],
    ["Purpose of the shift-and-add loop?", "Multiplication."],
    ["What does MVN do?", "Bitwise NOT of operand2 into Rd."]
  ],
  quiz: [
    { q: "LSL R1, R1, #2 with R1 = 7 gives", opts: ["28", "14", "3", "1"], ans: 0, why: "7 × 4." },
    { q: "AND R0, R1, #15 with R1 = 70 gives", opts: ["6", "70", "15", "64"], ans: 0, why: "0100 0110 AND 0000 1111." },
    { q: "To set bit 7 of R1 use", opts: ["ORR R1, R1, #128", "AND R1, R1, #128", "EOR R1, R1, #127", "LSL R1, R1, #7"], ans: 0, why: "OR sets." },
    { q: "A loop that runs while R2 > 0 begins", opts: ["CMP R2, #0 / BEQ end", "B end", "ADD R2, R2, #1", "BGT end"], ans: 0, why: "Exit when 0 (R2 never negative here)." },
    { q: "EOR R3, R1, R2 implements", opts: ["the Vernam cipher", "the Caesar cipher", "a parity count", "a shift"], ans: 0, why: "XOR with the key." },
    { q: "Which is invalid AQA assembly?", opts: ["ADD 100, 100, #1", "ADD R1, R1, #1", "LDR R1, 100", "STR R1, 100"], ans: 0, why: "Arithmetic needs registers." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
