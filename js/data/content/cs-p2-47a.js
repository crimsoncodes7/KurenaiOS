/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.7.1–
   4.7.3.2 and 4.7.3.6 (internal hardware and buses, von Neumann and
   Harvard, the stored program concept, the processor and its registers,
   the Fetch-Execute cycle, interrupts) at full A-level depth. Each topic
   REPLACES the short entry the older file carried; every way AQA has
   examined it (7516/2 June 2016–2025, 7517/2 June 2017–2025) is explained,
   worked and answered in the mark scheme's own format. Memory sizes were
   checked by program. The processor's performance factors are 4.7.3.7;
   instruction format and assembly are 4.7.3.3–4.7.3.5. Past-paper banks
   stay in bank-cs-47.js. */
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
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: o.both ? "both" : true, c: o.c || "accent2", w: o.w || 2, dash: o.dash }];
  if (label) it.push({ text: [(x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0)], t: label, size: 10.5, c: o.c || "accent2" });
  return it;
}
function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }

/* the processor, main memory and an I/O controller on the system bus */
function systemFig(cap) {
  var it = [];
  it = it.concat(boxAt(20, 20, 150, 70, "Processor", "accent", "CU · ALU · clock · registers"));
  it = it.concat(boxAt(215, 20, 150, 70, "Main memory", "good", "addressable locations"));
  it = it.concat(boxAt(410, 20, 130, 70, "I/O controller", "accent2", "→ keyboard, printer"));
  [["Address bus", 128, "accent3", false], ["Data bus", 158, "accent", true], ["Control bus", 188, "text2", true]].forEach(function (b) {
    it.push({ line: [[16, b[1]], [548, b[1]]], arrow: "both", c: b[2], w: 2.2 });
    it.push(txt(556, b[1], b[0], { pos: "e", off: 0, c: b[2], b: true }));
  });
  /* processor drives the address bus; memory and I/O only receive it */
  it.push({ line: [[60, 90], [60, 128]], arrow: true, c: "accent3", w: 1.8 });
  it.push({ line: [[255, 128], [255, 90]], arrow: true, c: "accent3", w: 1.8 }, { line: [[450, 128], [450, 90]], arrow: true, c: "accent3", w: 1.8 });
  [95, 290, 475].forEach(function (x) { it.push({ line: [[x, 90], [x, 158]], arrow: "both", c: "accent", w: 1.8 }); });
  [130, 325, 510].forEach(function (x) { it.push({ line: [[x, 90], [x, 188]], arrow: "both", c: "text2", w: 1.8 }); });
  return { fig: { w: 640, h: 204, items: it, cap: cap } };
}

/* inside the processor */
function cpuFig(cap) {
  var it = [];
  it.push({ poly: [[10, 10], [436, 10], [436, 230], [10, 230]], c: "accent", w: 1.8, fill: "accent", alpha: 0.05 });
  it.push(txt(20, 24, "PROCESSOR", { pos: "e", off: 0, b: true, c: "accent" }));
  it = it.concat(boxAt(24, 40, 120, 52, "Control unit", "accent2", "decodes · sequences"));
  it = it.concat(boxAt(24, 104, 120, 52, "ALU", "accent3", "arithmetic · logic"));
  it = it.concat(boxAt(24, 168, 120, 46, "Clock", "muted", "timing pulses"));
  [["PC", "program counter"], ["CIR", "current instruction"], ["MAR", "memory address"], ["MBR", "memory buffer"], ["SR", "status flags"]].forEach(function (r, i) {
    it = it.concat(boxAt(300, 40 + i * 36, 120, 30, r[0], "good", null));
    it.push(txt(360, 40 + i * 36 + 24, r[1], { size: 9.5 }));
  });
  it.push(txt(360, 32, "dedicated registers", { size: 10.5 }));
  ["R0", "R1", "R2", "R3", "…"].forEach(function (r, i) { it = it.concat(boxAt(164, 40 + i * 36, 110, 30, r, "accent", null)); });
  it.push(txt(219, 32, "general-purpose registers", { size: 10.5 }));
  it = it.concat(boxAt(510, 60, 120, 120, "Main memory", "good", "instructions + data"));
  it = it.concat(arrow(420, 127, 510, 100, "address bus", { c: "accent3", dy: -8 }));
  it = it.concat(arrow(420, 163, 510, 150, "data bus", { c: "accent", both: true, dy: 30 }));
  return { fig: { w: 640, h: 240, items: it, cap: cap } };
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **TO.** \"talked out\" — a right point cancelled by a wrong one beside it.",
  "Hardware answers need the **component and what it does**: a bus *carries*, a register *holds*, the control unit *sends signals*. \"The bus sends the address\" is NE. — the processor sends; the bus carries."
] } };

/* =====================================================================
   4.7.1.1  Internal hardware components of a computer
   ===================================================================== */
C["compsci:4.7.1.1"] = {
  notes: [
    { h: "Internal hardware components of a computer — the whole topic on one page" },
    "Spec 4.7.1.1: the role of the **processor, main memory, address bus, data bus, control bus and I/O controllers** and how they relate; the concept of a **bus**; the difference between **von Neumann** and **Harvard** architectures and where each is used; the concept of **addressable memory**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How each bus is used in a memory write / control bus example", "Explain / State", "1–4", "AS 2019 Q07, A-level 2024 Q03.6"],
      ["Why the data bus is bidirectional", "Explain", "2", "AS 2020 Q06.3"],
      ["Bus widths: maximum memory; why a wider data bus is faster", "Calculate / Explain", "1–2", "AS 2022 Q08.4–08.5, A-level 2019 Q12.1–12.2, 2024 Q03.5"],
      ["Label a system diagram", "Complete / State", "1–2", "A-level 2020 Q03.1, 2024 Q03.1"],
      ["Role of an I/O controller; serial vs parallel", "Describe / Explain", "2–3", "A-level 2024 Q03.3–03.4"],
      ["Von Neumann vs Harvard: difference, use, advantages", "Describe / State / Shade", "1–2", "AS 2017 Q06.1–06.2, 2020 Q06.4, A-level 2017 Q01.3, 2020 Q03.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Components and buses**.", "**Addressable memory** — bus widths and capacity.", "**Reading and writing memory**.", "**I/O controllers**.", "**Von Neumann and Harvard**.", "**Exam toolkit**."] },

    { page: "Components and buses" },
    systemFig("The system bus: three buses shared by every component. Only the processor puts addresses on the address bus, so that bus is one-way; data and control signals travel both ways."),
    { kv: [
      ["Processor", "fetches, decodes and executes instructions; performs arithmetic and logic"],
      ["Main memory", "holds the **instructions and data currently in use**, in addressable locations; returns the contents of a location when given its address"],
      ["I/O controller", "an interface between the processor and a peripheral device (4 below)"],
      ["Bus", "a set of **parallel wires (lines)** connecting two or more components, each line carrying one bit"]
    ] },
    { table: { head: ["Bus", "Carries", "Direction", "Width decides"], rows: [
      ["Address bus", "the **address** of the memory location / I/O port to read or write", "**one-way**: processor → memory and I/O", "how many locations can be addressed: 2ⁿ for n lines"],
      ["Data bus", "the **data or instruction** being transferred", "**bidirectional** — read into the processor, write out of it", "how many bits move in one transfer"],
      ["Control bus", "**control signals**: memory read/write, clock, interrupt request, bus request/grant, transfer acknowledge", "bidirectional (individual lines are one-way)", "—"]
    ] } },
    { callout: { t: "miscon", h: "\"The bus sends the address\"", body: "A bus is just wires — it **carries**. The **processor** places the address on the address bus. The mark scheme marks down (NE.) answers that make the bus the actor." } },

    { page: "Addressable memory" },
    { callout: { t: "formula", h: "Capacity from the address bus", body: "n address lines → $2^n$ addressable locations. Capacity = $2^n$ × (bits per location) ÷ 8 bytes. Adding **one** line **doubles** the addressable memory." } },
    { worked: { tag: "exam", title: "32-bit address bus", src: "A-level June 2019 · P2 Q12.1 · 1 mark",
      q: "A computer system uses a 32-bit address bus and a 32-bit data bus. Each addressed memory location can store one byte of data. What is the maximum amount of memory, in bytes, that could be accessed?",
      steps: [{ m: "$2^{32}$ = **4 294 967 296 bytes**", mk: "1 mark", n: "The data bus width is a distractor — it does not change how many locations exist." }], result: "4 294 967 296 bytes (4 GiB)" } },
    { worked: { tag: "exam", title: "36 address lines, 16-bit locations, in GiB", src: "A-level June 2024 · P2 Q03.5 · 2 marks",
      q: "The computer's address bus uses 36 wires and each main memory location can hold a 16-bit data value. In gibibytes, express the maximum amount of main memory that could be installed, assuming the CPU could access all of it using the address bus. Show your working.",
      steps: [
        { m: "$2^{36}$ locations × 16 bits ÷ 8 = $2^{36} \\times 2 = 2^{37}$ bytes", mk: "method" },
        { m: "$2^{37} \\div 2^{30}$ = $2^7$ = **128 GiB**", mk: "2 marks", n: "1 method mark if wrong, for two of: using 2³⁶; ×16; ÷8; ÷1024; ÷1024 again (or one of 2³⁷, ×2, ÷2²⁰, ÷2³⁰)." }
      ], result: "128 GiB" } },
    { worked: { tag: "exam", title: "Double the addressable memory", src: "AS June 2022 · P2 Q08.5 · 2 marks",
      q: "Identify the bus that would need to be changed and state the change needed so that the maximum amount of memory addressable by the processor would be doubled.",
      steps: [{ m: "The **address bus**;", mk: "1 mark" }, { m: "width increased by **1** (one more line);", mk: "1 mark", n: "2ⁿ⁺¹ = 2 × 2ⁿ. Doubling the number of lines would SQUARE the locations." }], result: "Address bus, +1 line" } },
    { worked: { tag: "exam", title: "Why a wider data bus helps", src: "AS June 2022 · P2 Q08.4 · 1 mark",
      q: "Explain why increasing the data bus width can lead to improvements in processor performance.",
      steps: [{ m: "It increases the amount of data that can be transferred over the bus **at once** // fewer transfers are needed to move the same amount of data;", mk: "1 mark", n: "NE. \"data transferred quicker\" / \"more data can be transferred\" without \"at once / per transfer\"." }], result: "More bits per transfer" } },
    { worked: { tag: "exam", title: "Why the wider data bus speeds programs up", src: "A-level June 2019 · P2 Q12.2 · 1 mark",
      q: "A different computer system has a wider data bus; this will speed up the execution of programs. Explain how.",
      steps: [{ m: "It increases the number of bits / amount of data that can be transferred at one time (in one cycle);", mk: "1 mark", n: "NE. increased rate of data transfer." }], result: "More bits each transfer" } },
    { callout: { t: "miscon", h: "Address bus vs data bus width", body: "**Address** bus width → how MUCH memory can be addressed (2ⁿ). **Data** bus width → how many bits move PER TRANSFER (speed). Swapping them is the commonest error in this topic." } },

    { page: "Reading and writing memory" },
    { h: "A memory write (the processor stores data)" },
    { steps: [
      "The processor places the **address** of the location on the **address bus**.",
      "It places the **data** to be written on the **data bus**.",
      "It places a **write** signal on the **control bus** (the control bus also carries the **clock** that synchronises processor and memory).",
      "When memory receives the write signal, the data on the data bus is **stored** in the location identified by the address bus."
    ] },
    { h: "A memory read (the processor fetches)" },
    { steps: [
      "The processor places the address on the address bus and a **read** signal on the control bus.",
      "Memory places the **contents** of that location on the data bus.",
      "The processor copies the value from the data bus into the **MBR** (4.7.3.2)."
    ] },
    { worked: { tag: "exam", title: "Each bus in a memory write", src: "AS June 2019 · P2 Q07 · 4 marks",
      q: "When the processor writes data to the main memory it will make use of the address, control and data buses. Explain how each of these buses will be used during this write process.",
      steps: [
        { h: "Address", m: "The address of the memory location to be written to is placed on the address bus (by the processor);", mk: "1 mark" },
        { h: "Data", m: "The data to be written is placed on the data bus (by the processor);", mk: "1 mark" },
        { h: "Control", m: "The write signal is placed on the control bus // the control bus carries the clock signal to synchronise memory and processor;", mk: "1 mark" },
        { h: "Effect", m: "When memory receives the write signal on the control bus, the data from the data bus is stored into the location identified by the address bus;", mk: "1 mark", n: "MAX 2 per bus; MAX 3 if only two buses referenced. NE. buses \"sending\"." }
      ], result: "Address · data · write signal" } },
    { worked: { tag: "exam", title: "The control bus during a store", src: "A-level June 2024 · P2 Q03.6 · 1 mark",
      q: "State an example of how the control bus is used when the processor stores data into main memory.",
      steps: [{ m: "To indicate that a memory write is occurring // cause the data on the data bus to be written into memory;", mk: "1 mark", n: "Also: carry the clock signal; indicate the number of bits; receive the transfer acknowledgement; bus request / bus grant." }], result: "Carries the write signal" } },
    { worked: { tag: "exam", title: "Why the data bus is bidirectional", src: "AS June 2020 · P2 Q06.3 · 2 marks",
      q: "Some buses in a computer system have to be bidirectional. Explain why the data bus must be bidirectional.",
      steps: [
        { m: "When data / instructions are fetched they must be transferred from memory **to** the processor;", mk: "1 mark" },
        { m: "after execution, results / data may need to be transferred back **to** memory (both on the data bus);", mk: "1 mark", n: "A. I/O controllers instead of memory." }
      ], result: "Reads and writes both use it" } },
    { worked: { tag: "exam", title: "Label the von Neumann diagram", src: "A-level June 2020 · P2 Q03.1 · 2 marks",
      q: "Five boxes are connected by two unlabelled buses (4, a dotted line; 5, a dashed line) and the control bus. Box 2 has an arrow DOWN to bus 4 only; box 1 has an arrow UP from bus 4; boxes 1, 2 and 3 all have two-way arrows to bus 5; box 3 takes inputs from the keyboard and mouse. Number the Address bus, Data bus, Main memory, Processor and USB I/O controller.",
      steps: [
        { m: "Bus 4 is one-way out of box 2 → **Address bus = 4**, so box 2, which drives it, is the **Processor = 2**;" },
        { m: "**Data bus = 5** (two-way); box 1 only receives addresses → **Main memory = 1**; the keyboard and mouse box → **USB I/O controller = 3**.", mk: "2 marks", n: "1 mark: at least three correct; 2 marks: all five." }
      ], result: "Address 4, Data 5, Memory 1, Processor 2, I/O 3" } },

    { page: "I/O controllers" },
    { callout: { t: "def", h: "I/O controller", body: "An electronic circuit that sits between the processor's buses and a peripheral. It lets the processor communicate with a device through an **I/O port**, making the device look like a set of **registers / memory locations**, and **translates** signals and voltages between the two." } },
    { ul: [
      "**Translates** data and signals between the form the device uses and the form the processor uses (including different voltages).",
      "**Buffers** data from a slow peripheral so the processor need not wait.",
      "Lets new peripherals be added **without redesigning** the processor — one common interface standard.",
      "Takes on some I/O processing, **reducing the CPU's workload**; performs **error detection** on received data; implements the **protocol**.",
      "**Generates an interrupt** when data is ready or the device needs attention (4.7.3.6)."
    ] },
    { worked: { tag: "exam", title: "The role of an I/O controller", src: "A-level June 2024 · P2 Q03.4 · 2 marks",
      q: "The USB interface inside the computer is an example of an I/O controller. Describe the role of an I/O controller.",
      steps: [
        { m: "It allows the processor to communicate with / control a peripheral through an I/O port, making the peripheral appear as a set of registers;", mk: "1 mark" },
        { m: "It translates signals / data from the peripheral into a form the computer can process (and vice versa, including converting voltages);", mk: "1 mark", n: "Also: buffering; common interface standard; reduces CPU workload; error checking; protocols; generates interrupts. Max 2." }
      ], result: "Interface + translation" } },
    { worked: { tag: "exam", title: "Serial to peripherals, parallel inside", src: "A-level June 2024 · P2 Q03.3 · 3 marks",
      q: "Peripherals are connected using USB, which uses synchronous serial transmission. Explain why serial transmission has been chosen for peripherals and why parallel transmission is used by the data bus inside the computer.",
      steps: [
        { h: "Difference", m: "Data travels further to a peripheral // internal components are fixed in position while peripherals move // far more data is transmitted between internal components;", mk: "1 mark" },
        { h: "Parallel inside", m: "Parallel sends multiple bits at the same time — the high data rate needed internally;", mk: "1 mark" },
        { h: "Serial outside", m: "Serial avoids data skew and crosstalk over the longer distance (and its cable is cheaper, longer and more flexible);", mk: "1 mark" }
      ], result: "Distance and volume decide" } },
    { callout: { t: "tip", h: "Synoptic: 4.9.1.1", body: "Skew (bits on parallel wires arriving at different times) and crosstalk grow with distance — the same reasons that make serial the norm for networks." } },

    { page: "Von Neumann and Harvard" },
    { fig: { w: 620, h: 190, items: (function () {
      var it = [];
      it.push(txt(140, 14, "von Neumann", { b: true, c: "accent", size: 12 }));
      it = it.concat(boxAt(20, 40, 100, 60, "Processor", "accent"));
      it = it.concat(boxAt(170, 30, 110, 80, "Memory", "good", "instructions AND data"));
      it = it.concat(arrow(120, 70, 170, 70, "one bus", { both: true, dy: -6 }));
      it.push(txt(150, 140, "one memory, one set of buses:", { size: 10.5 }), txt(150, 154, "instruction and data fetches take turns", { size: 10.5 }));
      it.push(txt(450, 14, "Harvard", { b: true, c: "accent2", size: 12 }));
      it = it.concat(boxAt(330, 70, 100, 60, "Processor", "accent"));
      it = it.concat(boxAt(480, 24, 130, 54, "Instruction memory", "accent2", "often ROM"));
      it = it.concat(boxAt(480, 122, 130, 54, "Data memory", "good", "RAM"));
      it = it.concat(arrow(430, 86, 480, 52, "instr. bus", { dy: -4, dx: -8 }));
      it = it.concat(arrow(430, 114, 480, 148, "data bus", { both: true, dy: 24, dx: -8 }));
      return it;
    })(), cap: "Von Neumann: instructions and data share one memory and one bus. Harvard: separate memories and buses, so an instruction and data can be fetched at the same time." } },
    { table: { head: ["", "Von Neumann", "Harvard"], rows: [
      ["Memory", "**one** memory / address space for instructions and data", "**separate** memories / address spaces"],
      ["Buses", "one shared set", "separate instruction and data buses"],
      ["Simultaneous access", "no — the **von Neumann bottleneck**", "**yes** — fetch the next instruction while accessing data"],
      ["Word / bus widths", "the same for both", "can differ (e.g. 14-bit instructions, 8-bit data)"],
      ["Memory technology", "the same", "can differ — instructions in ROM, data in RAM"],
      ["Security", "data could be executed as code", "data cannot be executed; ROM program cannot be overwritten"],
      ["Typical use", "**general-purpose computers** (PCs, servers)", "**embedded systems, digital signal processing (DSP)**, microcontrollers"]
    ] } },
    { callout: { t: "miscon", h: "\"Stored separately IN memory\"", body: "AQA: it must be clear that instructions and data are stored in **separate memories**, not just *separate places in memory* (NE. places, locations, areas). A von Neumann program also keeps code and data in different areas of the same memory." } },
    { callout: { t: "tip", h: "Modern processors are both", body: "A PC is von Neumann overall, but its processor has **separate level-1 instruction and data caches** — a Harvard-style split at the top of the memory hierarchy (\"modified Harvard\")." } },
    { worked: { tag: "exam", title: "One difference", src: "AS June 2017 · P2 Q06.1–06.2 · 3 marks",
      q: "(a) Describe one difference between the way the Harvard and von Neumann architectures operate. (b) Shade the architecture typically used for digital signal processing.",
      steps: [
        { m: "(a) Harvard uses separate memory / buses / address space for instructions and data;", mk: "1 mark" },
        { m: "whereas von Neumann uses a combined memory / bus for both;", mk: "1 mark", n: "NE. places, locations, registers, areas of memory." },
        { m: "(b) **Harvard**;", mk: "1 mark" }
      ], result: "Separate vs shared; DSP → Harvard" } },
    { worked: { tag: "exam", title: "Two differences", src: "AS June 2020 · P2 Q06.4 · 2 marks",
      q: "State two differences between how the Harvard and von Neumann architectures operate.",
      steps: [
        { m: "In Harvard, instructions and data have separate buses // are stored in separate memories;", mk: "1 mark" },
        { m: "In Harvard, instructions and data can be fetched simultaneously // instruction word size can differ from data word size;", mk: "1 mark", n: "A. the reverse, stated for von Neumann." }
      ], result: "Separate memories/buses; simultaneous fetch" } },
    { worked: { tag: "exam", title: "Why Harvard is sometimes preferred", src: "A-level June 2017 · P2 Q01.3 · 2 marks",
      q: "Explain why the Harvard architecture is sometimes used in preference to the von Neumann architecture.",
      steps: [
        { m: "Instructions and data can be accessed simultaneously // avoids the bottleneck of a single data / address bus;", mk: "1 mark" },
        { m: "Data cannot be executed as code (an exploit hackers use) // a program in ROM cannot be modified // instruction and data memory can have different word lengths or technologies;", mk: "1 mark", n: "NE. \"faster\", \"more efficient\" without the reason." }
      ], result: "No bottleneck; security / flexibility" } },
    { worked: { tag: "exam", title: "Harvard in a tablet", src: "A-level June 2020 · P2 Q03.3 · 2 marks",
      q: "A tablet computer uses the Harvard architecture. Describe two advantages compared to the von Neumann architecture.",
      steps: [
        { m: "Avoids the bottleneck of a single bus — no delays waiting for memory fetches, as instruction and data accesses happen simultaneously;", mk: "1 mark" },
        { m: "Program held in ROM cannot be (accidentally) overwritten by data / hacked;", mk: "1 mark", n: "NE. \"instructions and data stored in different memories\" — that is the definition, not an advantage. NE. quicker access without explanation." }
      ], result: "No bottleneck; protected program" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain how each bus is used", "Who places what on which bus, then the effect — MAX 2 per bus."],
      ["Calculate maximum memory", "2ⁿ × bits per location ÷ 8, then convert with powers of 2 (2¹⁰, 2²⁰, 2³⁰)."],
      ["Explain (bus width)", "Address → capacity; data → bits per transfer."],
      ["Describe a difference (architectures)", "Separate memories/buses vs shared — say both sides."],
      ["Describe an advantage", "A consequence: simultaneous access, no bottleneck, ROM protection — not the definition."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"ADC — Address goes one way, Data goes both, Control coordinates\"", body: "And Harvard = \"**H**as **two** memories\"; von Neumann = \"**V**ery **one** memory\". DSP and embedded → Harvard; PCs → von Neumann." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Making the bus the actor (\"the bus sends\").", "Doubling address lines to double memory (it is +1 line).", "Using the data-bus width in a capacity calculation.", "\"Stored in different places in memory\" for Harvard.", "\"Faster\" alone as an advantage."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.2.1 stored program concept; 4.7.3.2 how buses and registers move an instruction; 4.7.3.7 bus widths and performance; 4.5.3.1–4.5.3.2 kibi/mebi/gibi units (powers of 2); 4.9.1.1 serial vs parallel, skew and crosstalk; 4.7.3.6 interrupts from I/O controllers." } }
  ],
  flashcards: [
    ["What does the address bus carry, and which way?", "The address of the location to read/write; one-way from the processor."],
    ["What does the data bus carry?", "The data or instruction being transferred — bidirectional."],
    ["Name three control bus signals.", "e.g. memory read/write, clock, interrupt request, bus request/grant, acknowledge."],
    ["Max memory with n address lines?", "2ⁿ locations."],
    ["How do you double addressable memory?", "Add one line to the address bus."],
    ["Why does a wider data bus help?", "More bits transferred at once — fewer transfers."],
    ["Why must the data bus be bidirectional?", "Data is read into the processor and written back to memory."],
    ["Role of an I/O controller?", "Interface between processor and peripheral: translates signals/voltages, buffers data, implements the protocol."],
    ["Von Neumann vs Harvard?", "One shared memory and bus for instructions and data vs separate memories and buses."],
    ["Where is Harvard used?", "Embedded systems / DSP / microcontrollers."],
    ["Where is von Neumann used?", "General-purpose computers."],
    ["The von Neumann bottleneck?", "Instructions and data share one bus, so they cannot be fetched at the same time."],
    ["32-bit address bus, 1 byte per location → max memory?", "2³² = 4 294 967 296 bytes (4 GiB)."]
  ],
  quiz: [
    { q: "Which bus is one-way?", opts: ["address bus", "data bus", "control bus", "all of them"], ans: 0, why: "Only the processor places addresses." },
    { q: "To double the addressable memory you", opts: ["add one address line", "double the address lines", "widen the data bus", "add a control line"], ans: 0, why: "2ⁿ⁺¹ = 2·2ⁿ." },
    { q: "36 address lines, 16-bit locations is", opts: ["128 GiB", "64 GiB", "8 GiB", "256 GiB"], ans: 0, why: "2³⁶ × 2 bytes = 2³⁷ B." },
    { q: "Digital signal processing usually uses", opts: ["Harvard", "von Neumann", "neither", "both equally"], ans: 0, why: "Simultaneous instruction/data access." },
    { q: "\"The data bus sends the data to memory\" is", opts: ["NE. — the processor places it; the bus carries", "fully correct", "rejected for naming the wrong bus", "BOD"], ans: 0, why: "Buses carry." },
    { q: "An advantage of Harvard is", opts: ["instructions and data can be fetched simultaneously", "a single memory is cheaper", "programs can modify themselves", "it needs fewer buses"], ans: 0, why: "Separate buses." }
  ]
};

/* =====================================================================
   4.7.2.1  The meaning of the stored program concept
   ===================================================================== */
C["compsci:4.7.2.1"] = {
  notes: [
    { h: "The stored program concept — the whole topic on one page" },
    "Spec 4.7.2.1: describe the stored program concept: **machine code instructions stored in main memory are fetched and executed serially by a processor that performs arithmetic and logical operations**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What is / Describe / State the stored program concept", "Describe / State", "2", "AS 2018 Q06.1, 2020 Q06.2, 2024 Q07.2, A-level 2025 Q07.1"],
      ["Which term does this definition define", "Shade", "1", "A-level 2022 Q13.1"],
      ["Which statement is false", "Shade", "1", "A-level 2021 Q14.1"],
      ["Role of main memory in executing programs", "Describe", "2", "AS 2022 Q08.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The definition** — its five key ideas.", "**Why it matters**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The definition" },
    { callout: { t: "def", h: "Learn it word for word", body: "**Machine code instructions** stored in **main memory** are **fetched and executed serially** by a **processor** that performs **arithmetic and logical operations**." } },
    { table: { head: ["Key idea", "Meaning"], rows: [
      ["machine code instructions", "the program is a sequence of binary instructions (4.7.3.3)"],
      ["stored in main memory", "the program sits in memory **alongside its data**, so it can be loaded, replaced and changed like data"],
      ["fetched", "copied one at a time from memory into the processor (4.7.3.2)"],
      ["executed serially", "one after another, in order, unless a branch changes the PC"],
      ["by a processor … arithmetic and logical operations", "the ALU does the work each instruction specifies"]
    ] } },
    { callout: { t: "warn", h: "The A-level 2025 note", body: "\"To achieve this mark a response must include at least four of the five underlined concepts\" — instructions, stored, main memory, fetched-and-executed, serially. Write the full sentence; a paraphrase that drops two of them scores 1 of 2." } },

    { page: "Why it matters" },
    { ul: [
      "Before stored programs, machines such as early ENIAC were **re-wired** (plugboards) to change the task. A stored program machine changes task by **loading a different program** into memory.",
      "Because instructions are just bit patterns in memory, **programs can be moved in and out of main memory** — the OS loads a program from secondary storage when you run it.",
      "A program can treat another program as **data**: compilers, assemblers and loaders all depend on this.",
      "It is the basis of the **Fetch-Execute cycle** and of both architectures in 4.7.1.1 — von Neumann and Harvard machines are both stored-program computers."
    ] },
    { callout: { t: "miscon", h: "Stored program concept ≠ von Neumann architecture", body: "The **concept** says programs are held in memory and fetched and executed. The **von Neumann architecture** adds that instructions and data share **one** memory and bus. Harvard machines also follow the stored program concept — with separate memories. A-level 2022 Q13.1 offers both as options: the definition is the **concept**." } },
    { h: "The role of main memory" },
    { ul: [
      "It stores the **instructions** to be executed and the **data** they need.",
      "It returns the value stored at the location given on the address bus (on the data bus).",
      "The program is copied in from **secondary storage** when execution is requested.",
      "It stores the **results** produced by the program."
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "What is the stored program concept?", src: "AS June 2018 · P2 Q06.1 · 2 marks",
      q: "What is the stored program concept?",
      steps: [
        { m: "(Machine code) instructions are stored in (main) memory;", mk: "1 mark" },
        { m: "Instructions are fetched, (decoded) and executed (serially) by the processor;", mk: "1 mark", n: "A. programs can be moved in and out of main memory. Max 2." }
      ], result: "Stored in memory; fetched and executed serially" } },
    { worked: { tag: "exam", title: "Describe the stored program concept", src: "AS June 2020 · P2 Q06.2 · 2 marks",
      q: "Describe the stored program concept.",
      steps: [{ m: "Instructions are stored in main memory;", mk: "1 mark" }, { m: "they are fetched and executed serially by the processor;", mk: "1 mark" }], result: "Same two points" } },
    { worked: { tag: "exam", title: "Describe it (2024)", src: "AS June 2024 · P2 Q07.2 · 2 marks",
      q: "Describe the stored program concept.",
      steps: [{ m: "Machine code instructions are stored in main memory;", mk: "1 mark" }, { m: "instructions are fetched, decoded and executed serially by the processor // programs can be moved in to and out of main memory;", mk: "1 mark" }], result: "Two points" } },
    { worked: { tag: "exam", title: "State the stored program concept", src: "A-level June 2025 · P2 Q07.1 · 2 marks",
      q: "State the stored program concept.",
      steps: [
        { m: "(Machine code) instructions (A. programs) are stored in (main) memory (A. RAM);", mk: "1 mark" },
        { m: "Instructions (R. programs) are fetched and executed serially / sequentially / in order by a processor;", mk: "1 mark", n: "Needs at least four of the five key concepts across the answer. A. programs can be moved in and out of main memory." }
      ], result: "The definition" } },
    { worked: { tag: "exam", title: "Which term is defined?", src: "A-level June 2022 · P2 Q13.1 · 1 mark",
      q: "\"Machine code instructions stored in main memory are fetched and executed serially by a processor that performs arithmetic and logical operations.\" Which term does this define? A Harvard architecture · B processor instruction set · C stored program concept · D von Neumann architecture.",
      steps: [{ m: "**C** The stored program concept;", mk: "1 mark" }], result: "C" } },
    { worked: { tag: "exam", title: "Which statement is false?", src: "A-level June 2021 · P2 Q14.1 · 1 mark",
      q: "Which statement about a computer that uses the stored program concept is false? A Instructions are fetched and executed in sequence. B The computer can only be used with one program. C The data is stored in the main memory. D The program is stored in the main memory.",
      steps: [{ m: "**B** — the whole point of the concept is that different programs can be loaded into memory.", mk: "1 mark" }], result: "B" } },
    { worked: { tag: "exam", title: "Role of main memory", src: "AS June 2022 · P2 Q08.2 · 2 marks",
      q: "Describe the role of main memory in the execution of computer programs.",
      steps: [
        { m: "Main memory stores the instructions to be executed (and the data they need);", mk: "1 mark" },
        { m: "It returns the instruction / data stored in the location specified on the address bus, using the data bus // the program is transferred into it from secondary storage when execution is requested // it stores results;", mk: "1 mark" }
      ], result: "Holds instructions and data; returns them on request" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State / Describe the concept", "The full definition — at least four of: instructions, stored, main memory, fetched and executed, serially."],
      ["Shade (definition)", "Concept, not architecture."],
      ["Describe the role of main memory", "Holds instructions + data; returns contents of an addressed location; receives programs from secondary storage."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Stored, Fetched, Executed, Serially\"", body: "\"**S**ome **F**ish **E**at **S**ardines\" — stored in main memory, fetched, executed, serially (by a processor doing arithmetic and logic)." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Programs are fetched\" — R.: instructions are fetched.", "Confusing the concept with von Neumann architecture.", "Leaving out \"main memory\" or \"serially\"."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.3.2 the Fetch-Execute cycle carries the concept out; 4.7.1.1 von Neumann and Harvard; 4.6.3.1 translators produce the machine code that is stored; 4.5.6.1 instructions are just bit patterns." } }
  ],
  flashcards: [
    ["State the stored program concept.", "Machine code instructions stored in main memory are fetched and executed serially by a processor that performs arithmetic and logical operations."],
    ["Five key ideas the definition needs?", "Instructions, stored, main memory, fetched and executed, serially."],
    ["Is the stored program concept the same as von Neumann architecture?", "No — von Neumann adds a single shared memory/bus; Harvard machines are stored-program too."],
    ["Can a stored-program computer run only one program?", "No — any program can be loaded into memory."],
    ["Role of main memory?", "Holds the instructions and data in use; returns the contents of addressed locations."],
    ["Where does a program come from when run?", "It is copied from secondary storage into main memory."],
    ["What does \"serially\" mean here?", "One instruction after another, in sequence."],
    ["What changed the task before stored programs?", "Physically re-wiring the machine."]
  ],
  quiz: [
    { q: "The stored program concept says instructions are", opts: ["stored in main memory and fetched and executed serially", "hard-wired into the processor", "kept only in secondary storage", "executed in parallel"], ans: 0, why: "Definition." },
    { q: "Which is FALSE for a stored-program computer?", opts: ["it can only run one program", "the program is in main memory", "data is in main memory", "instructions run in sequence"], ans: 0, why: "Programs can be swapped." },
    { q: "The given definition names", opts: ["the stored program concept", "the Harvard architecture", "the instruction set", "von Neumann architecture"], ans: 0, why: "2022 Q13.1." },
    { q: "Harvard machines", opts: ["also use the stored program concept", "cannot store programs", "store programs on disk only", "have no main memory"], ans: 0, why: "Separate memories, still stored programs." }
  ]
};

/* =====================================================================
   4.7.3.1  The processor and its components
   ===================================================================== */
C["compsci:4.7.3.1"] = {
  notes: [
    { h: "The processor and its components — the whole topic on one page" },
    "Spec 4.7.3.1: the role and operation of a processor and its major components: **arithmetic logic unit, control unit, clock, general-purpose registers** and the dedicated registers **program counter, current instruction register, memory address register, memory buffer register, status register**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What is a register", "Explain / What is", "1", "AS 2016 Q04.5, 2020 Q06.1"],
      ["Name the component for arithmetic", "State", "1", "AS 2022 Q08.3"],
      ["Role of the control unit", "Describe", "3", "A-level 2021 Q14.2"],
      ["Roles of the control unit, general-purpose registers, status register", "Describe", "6", "A-level 2025 Q07.2"],
      ["Role of the status register + an update", "Explain / Describe", "2", "AS 2023 Q08.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The components**.", "**The registers**.", "**The status register and its flags**.", "**In exam questions**.", "**Exam toolkit**."] },
    { diagram: "cpu-fetch-execute" },

    { page: "The components" },
    cpuFig("Inside the processor: the control unit, ALU and clock, the five dedicated registers and the general-purpose registers. MAR drives the address bus; MBR connects to the data bus."),
    { table: { head: ["Component", "Role"], rows: [
      ["Control unit (CU)", "**decodes** instructions; **controls and coordinates** the Fetch-Execute cycle and the other components by sending **control signals**; controls fetching, loading and storing; controls data transfers between registers; handles interrupts"],
      ["Arithmetic logic unit (ALU)", "performs **arithmetic** (add, subtract, multiply, compare) and **logical** operations (AND, OR, NOT, XOR, shifts); sets flags in the status register"],
      ["Clock", "generates a regular sequence of **timing pulses** that **synchronise** every operation; one or more operations per tick (the clock speed, in Hz, is 4.7.3.7)"],
      ["Register", "a small, very fast **memory location inside the processor**"]
    ] } },
    { callout: { t: "miscon", h: "\"A register is a memory location\"", body: "**NE.** — it is a memory / storage location **inside the processor**. That last phrase is the mark (AS 2016, 2020)." } },

    { page: "The registers" },
    { table: { head: ["Register", "Holds", "Used when"], rows: [
      ["Program counter (PC)", "the **address of the next instruction** to be fetched", "copied to the MAR at the start of each fetch, then incremented; a branch overwrites it"],
      ["Current instruction register (CIR)", "the **instruction currently being decoded and executed**, split into opcode and operand", "loaded from the MBR at the end of the fetch"],
      ["Memory address register (MAR)", "the **address** of the memory location about to be read or written", "its contents are placed on the address bus"],
      ["Memory buffer register (MBR)", "the **data or instruction** just read from memory, or about to be written to it", "connected to the data bus (also called the MDR)"],
      ["Status register (SR)", "**flags** describing the result of the last operation and the processor's state", "set by the ALU; tested by conditional branches"],
      ["General-purpose registers (R0, R1 …)", "**values in use** — operands and intermediate results — that the programmer chooses", "named in assembly instructions (`ADD R2, R1, R0`)"]
    ] } },
    { callout: { t: "memorise", h: "Hand-drawn processor diagram must show and label", body: ["Control unit, ALU and clock.", "PC, CIR, MAR, MBR, status register and some general-purpose registers.", "MAR → address bus → main memory; MBR ↔ data bus ↔ main memory."] } },
    { callout: { t: "miscon", h: "\"The PC counts how many instructions have run\"", body: "It holds an **address** — of the next instruction. A branch can load any value into it; it is not a tally." } },

    { page: "The status register and its flags" },
    { table: { head: ["Flag", "Set when"], rows: [
      ["Zero (Z)", "the result of the last operation was zero (a CMP of equal values gives zero)"],
      ["Negative / sign (N)", "the result was negative (MSB = 1)"],
      ["Carry (C)", "an addition carried out of the most significant bit (or a shift moved a 1 out)"],
      ["Overflow (V)", "a signed result did not fit — e.g. two positives summed to a negative (4.5.4.6)"],
      ["Equal", "the last comparison compared two equal values"],
      ["Interrupt enable / supervisor", "interrupts allowed or masked; processor in supervisor or user mode"]
    ] } },
    { code: { lang: "asm", src: "CMP R1, #0      ; ALU subtracts 0 from R1 — sets the Z flag if R1 = 0\nBEQ done        ; the control unit reads Z: branch only if it is set\nSUB R1, R1, #1\ndone:", cap: "Flags are how one instruction (CMP) passes its result to the next (BEQ)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "What is a register?", src: "AS June 2020 · P2 Q06.1 · 1 mark",
      q: "The memory buffer register and the program counter are examples of registers. What is a register?",
      steps: [{ m: "A memory / storage location **inside / on a processor**;", mk: "1 mark", n: "NE. memory / storage location alone. A. CPU for processor. (AS 2016 Q04.5 is identical.)" }], result: "Storage location in the processor" } },
    { worked: { tag: "exam", title: "Which component does arithmetic?", src: "AS June 2022 · P2 Q08.3 · 1 mark",
      q: "State the name of the processor component responsible for performing mathematical operations such as addition and multiplication.",
      steps: [{ m: "Arithmetic logic unit // ALU;", mk: "1 mark" }], result: "ALU" } },
    { worked: { tag: "exam", title: "Role of the control unit", src: "A-level June 2021 · P2 Q14.2 · 3 marks",
      q: "The control unit is an important component of a processor. Describe the role of the control unit.",
      steps: [
        { m: "To marshal / control the operation of the fetch-execute cycle;", mk: "1 mark" },
        { m: "To determine the type of an instruction (decode it);", mk: "1 mark" },
        { m: "To send control signals to other components // control the transfer of data between registers // synchronise the processor // handle interrupts;", mk: "1 mark", n: "NE. \"fetches instructions\" — say it CONTROLS fetching / loading / storing. Max 3." }
      ], result: "Controls the cycle, decodes, signals" } },
    { worked: { tag: "exam", title: "Status register: role and an update", src: "AS June 2023 · P2 Q08.1 · 2 marks",
      q: "Explain the role of the status register in a processor and describe a circumstance that would result in its contents being updated.",
      steps: [
        { m: "It provides information about the result of the last (arithmetic / logical) instruction // it controls conditional branch instructions;", mk: "1 mark" },
        { m: "e.g. when the result of a comparison or arithmetic operation is zero / negative // a carry occurs // overflow occurs // an interrupt occurs;", mk: "1 mark" }
      ], result: "Flags for the last result" } },
    { worked: { tag: "exam", title: "Three components (6 marks)", src: "A-level June 2025 · P2 Q07.2 · 6 marks",
      q: "Describe the roles of the following three components of a processor: control unit; general-purpose registers; status register.",
      steps: [
        { h: "Control unit", m: "Decodes instructions — determines the type of each instruction;", mk: "1 mark" },
        { h: "Control unit", m: "Controls / sequences / synchronises the fetch-execute cycle and sends control signals to other components;", mk: "1 mark", n: "Also: controls fetch/load/store; manages execution; saves the volatile environment on an interrupt. NE. just \"F-E\"." },
        { h: "General-purpose registers", m: "Store values that need to be accessed frequently / quickly;", mk: "1 mark" },
        { h: "General-purpose registers", m: "Store the operands of instructions and the results / intermediate results of calculations — the programmer decides each register's role;", mk: "1 mark", n: "TO. \"store instructions\"; NE. \"store values inside the processor\"." },
        { h: "Status register", m: "Stores information about the result of the last arithmetic / logical instruction, used to control conditional branches;", mk: "1 mark" },
        { h: "Status register", m: "e.g. the Zero flag indicates whether the last result was zero // the Overflow flag whether the last arithmetic operation overflowed;", mk: "1 mark", n: "One mark for the purpose of any specific flag (sign, zero, carry, equal, overflow, interrupt, supervisor). Max 2 per component." }
      ], result: "Two points each" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["What is a register", "Storage location INSIDE the processor."],
      ["Describe the role of (the CU)", "Verbs: decodes, controls / coordinates the F-E cycle, sends control signals, transfers between registers."],
      ["Describe the role of the status register", "Result of the last operation + a named flag or a branch that reads it."],
      ["Full names", "When the question says full names, PC / CIR alone is NE."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"PC → MAR, MBR → CIR\" and \"Please Can Many Mice Squeak\"", body: "The five dedicated registers: **P**rogram counter, **C**urrent instruction register, **M**emory address register, **M**emory buffer register, **S**tatus register. MAR carries ADDRESSES; MBR carries DATA (\"**B**uffer = **B**its of data\")." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Register as just \"a memory location\" (NE.).", "\"The CU fetches instructions\" (NE.) — it controls the fetch.", "GPRs \"store instructions\" (TO.).", "MAR and MBR swapped.", "Abbreviations when full names are demanded."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.3.2 the registers in the F-E cycle; 4.6.4.1 the ALU is built from adders, registers from flip-flops; 4.5.4.6 overflow; 4.7.3.5 CMP and branches read the flags; 4.7.3.7 clock speed; 4.7.3.6 the SR's interrupt flag." } }
  ],
  flashcards: [
    ["What is a register?", "A memory location inside the processor."],
    ["Role of the control unit?", "Decodes instructions; controls the F-E cycle and other components by sending control signals."],
    ["Role of the ALU?", "Performs arithmetic and logical operations."],
    ["Role of the clock?", "Generates timing pulses that synchronise the processor's operations."],
    ["PC holds…", "the address of the next instruction to fetch."],
    ["CIR holds…", "the instruction currently being decoded/executed."],
    ["MAR holds…", "the address of the location to be read or written."],
    ["MBR holds…", "the data/instruction just read from, or to be written to, memory."],
    ["Status register holds…", "flags about the last result (zero, negative, carry, overflow) and processor state."],
    ["General-purpose registers hold…", "operands and intermediate results the programmer chooses."],
    ["Which register connects to the address bus?", "MAR."],
    ["Which register connects to the data bus?", "MBR."]
  ],
  quiz: [
    { q: "The address of the next instruction is in the", opts: ["PC", "CIR", "MBR", "SR"], ans: 0, why: "Program counter." },
    { q: "The component that decodes instructions is the", opts: ["control unit", "ALU", "clock", "MAR"], ans: 0, why: "CU." },
    { q: "A comparison result is recorded in the", opts: ["status register", "MAR", "PC", "CIR"], ans: 0, why: "Flags." },
    { q: "\"A register is a memory location\" scores", opts: ["NE. — needs inside the processor", "1 mark", "2 marks", "R."], ans: 0, why: "Missing \"inside the processor\"." },
    { q: "The MBR is connected to the", opts: ["data bus", "address bus", "clock", "control unit only"], ans: 0, why: "Buffer for data." }
  ]
};

/* =====================================================================
   4.7.3.2  The Fetch-Execute cycle and the role of registers
   ===================================================================== */
function fdeFig(withInterrupt, cap) {
  var it = [];
  var steps = [["MAR ← [PC]", "fetch"], ["PC ← [PC] + 1", "fetch"], ["MBR ← [memory]", "fetch: address bus, read, data bus"], ["CIR ← [MBR]", "fetch"], ["CU decodes CIR", "decode: opcode + operand"], ["Execute", "ALU / load / store / branch"]];
  var pos = [[36, 20], [226, 20], [416, 20], [416, 100], [226, 100], [36, 100]];
  steps.forEach(function (s, i) { it = it.concat(boxAt(pos[i][0], pos[i][1], 170, 46, s[0], i < 4 ? "accent" : i === 4 ? "accent2" : "good", s[1])); });
  it = it.concat(arrow(206, 43, 226, 43), arrow(396, 43, 416, 43), arrow(501, 66, 501, 100), arrow(416, 123, 396, 123), arrow(226, 123, 206, 123));
  /* an open path whose last segment carries the arrowhead */
  function path(pts, o) {
    o = o || {};
    var r = [{ poly: pts.slice(0, -1), close: false, c: o.c || "muted", w: 1.6, dash: o.dash }];
    r.push({ line: [pts[pts.length - 2], pts[pts.length - 1]], arrow: true, c: o.c || "muted", w: 1.6, dash: o.dash });
    return r;
  }
  if (withInterrupt) {
    it = it.concat(boxAt(36, 180, 170, 46, "Interrupt waiting?", "danger", "check after execute"));
    it = it.concat(arrow(121, 146, 121, 180));
    it = it.concat(boxAt(266, 180, 320, 46, "save volatile environment → ISR → restore", "danger", "only if its priority is higher"));
    it = it.concat(arrow(206, 203, 266, 203, "yes"));
    it = it.concat(path([[36, 203], [16, 203], [16, 43], [36, 43]]));
    it.push(txt(22, 160, "no", { pos: "e", off: 0 }));
    it = it.concat(path([[586, 203], [602, 203], [602, 8], [121, 8], [121, 20]], { dash: "4 4" }));
  } else {
    it = it.concat(path([[36, 123], [16, 123], [16, 43], [36, 43]]));
  }
  return { fig: { w: 620, h: withInterrupt ? 240 : 160, items: it, cap: cap } };
}
C["compsci:4.7.3.2"] = {
  sims: ["cpu-fetch-execute"],
  notes: [
    { h: "The Fetch-Execute cycle — the whole topic on one page" },
    "Spec 4.7.3.2: explain how the **Fetch-Execute cycle** is used to execute machine code programs, including the stages **fetch, decode, execute** and the details of the registers used.",
    "The most-asked processor topic — two levels-of-response questions and two 12-mark essays:",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Steps of the whole cycle, by stage", "Describe (full sentences)", "6", "AS 2017 Q06.3"],
      ["Four fetch steps, each with its purpose", "Describe and explain", "8", "AS 2020 Q06.5"],
      ["How an instruction is fetched (registers, buses, memory)", "Describe", "4", "A-level 2017 Q01.1"],
      ["Why not decode from the MBR", "Explain", "2", "A-level 2017 Q01.2"],
      ["Order events / name registers / label a diagram", "Number / State", "2–3", "AS 2022 Q08.1, 2024 Q07.1, A-level 2020 Q03.4"],
      ["Roles of MAR and MBR in the fetch; the decode stage", "Describe", "2–3", "AS 2025 Q09.1–09.2"],
      ["F-E cycle + hardware improvements (essay)", "Describe", "12", "A-level 2023 Q04.1 (and 2019 Q05, see 4.6.3.1)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The cycle step by step**, in register transfer notation.", "**Why each step** — the purposes the 8-mark question wants.", "**A traced example**.", "**In exam questions**, including the 12-mark essay.", "**Exam toolkit**."] },
    { diagram: "cpu-fetch-execute" },

    { page: "The cycle step by step" },
    fdeFig(false, "One cycle: four fetch steps (blue), decode (gold), execute (green), then the next fetch. [x] means \"the contents of x\"."),
    { table: { head: ["Stage", "Step", "Register transfer notation"], rows: [
      ["Fetch", "The contents of the **PC** are copied into the **MAR**", "MAR ← [PC]"],
      ["Fetch", "The MAR's address is placed on the **address bus**; a **read** signal is sent on the **control bus**", ""],
      ["Fetch", "The contents of the addressed memory location travel on the **data bus** into the **MBR**", "MBR ← [Memory]addressed"],
      ["Fetch", "The **PC is incremented** (at the same time) so it points to the next instruction", "PC ← [PC] + 1"],
      ["Fetch", "The contents of the MBR are copied into the **CIR**", "CIR ← [MBR]"],
      ["Decode", "The **control unit decodes** the instruction in the CIR, splitting it into **opcode** and **operand(s)**", ""],
      ["Execute", "The opcode identifies the operation; any data needed is **fetched** (or stored); the operation is performed (the **ALU** for arithmetic and comparisons); the result goes to a register / accumulator / memory; the **status register** is updated; a **branch** loads the PC", ""]
    ] } },
    { callout: { t: "miscon", h: "\"The PC holds the instruction\"", body: "**R.** — the PC holds the **address** of the instruction. The instruction itself arrives in the MBR and is copied to the CIR." } },
    { callout: { t: "warn", h: "Notation alone is NE.", body: "\"MAR ← [PC]\" on its own is **NE.** in AQA's mark schemes — write the sentence (\"the contents of the program counter are copied into the memory address register\") and add the notation if you like." } },

    { page: "Why each step" },
    { table: { head: ["Step (description)", "Purpose (explanation)"], rows: [
      ["PC → MAR", "so the PC can be updated (incremented) // so the address can be put on the address bus to memory"],
      ["MAR contents → address bus", "so the correct location in main memory is accessed"],
      ["Value on data bus → MBR", "not every fetch is an instruction, so it cannot go straight to the CIR // the value is only on the bus transiently, so it must be held in a register // the MBR copes with the speed difference between processor and memory"],
      ["PC incremented", "so the next instruction in sequence will be fetched"],
      ["MBR → CIR", "so data fetched or written during the execute stage does not overwrite the instruction // the control unit decodes from the CIR"]
    ] } },
    { h: "Why not decode straight from the MBR?" },
    { ul: [
      "Executing the instruction may need **further memory fetches** (an LDR loads data), which pass through the MBR and would **overwrite** the instruction.",
      "Writing a result back to memory also uses the MBR.",
      "The MBR is not wired to the components that decode and execute instructions; the CIR is. (**R.** \"the MBR cannot decode\" — no register decodes; the CU does.)"
    ] },

    { page: "A traced example" },
    "Memory holds a program from address 100. Trace the cycle for `LDR R1, 200` at address 100, where location 200 holds 37.",
    { table: { head: ["Step", "PC", "MAR", "MBR", "CIR", "R1"], rows: [
      ["start", "100", "—", "—", "—", "—"],
      ["MAR ← [PC]", "100", "100", "—", "—", "—"],
      ["MBR ← [M100]; PC ← PC + 1", "101", "100", "LDR R1, 200", "—", "—"],
      ["CIR ← [MBR]", "101", "100", "LDR R1, 200", "LDR R1, 200", "—"],
      ["decode: opcode LDR, operands R1 and 200", "101", "100", "LDR R1, 200", "LDR R1, 200", "—"],
      ["execute: MAR ← 200", "101", "200", "LDR R1, 200", "LDR R1, 200", "—"],
      ["execute: MBR ← [M200]", "101", "200", "37", "LDR R1, 200", "—"],
      ["execute: R1 ← [MBR]", "101", "200", "37", "LDR R1, 200", "37"]
    ] } },
    { callout: { t: "tip", h: "See the overwrite happen", body: "In the execute stage the MBR changed from the instruction to 37. Had the processor been decoding from the MBR, the instruction would be gone — the CIR kept it. That is exactly A-level 2017 Q01.2." } },
    { callout: { t: "miscon", h: "Side by side: PC + 1 vs PC + instruction length", body: "AQA's model increments the PC by 1 (one location per instruction). A real processor with 4-byte instructions and byte addressing adds 4. Either way the PC ends pointing at the **next** instruction." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Order the events for an ADD", src: "AS June 2022 · P2 Q08.1 · 3 marks",
      q: "Order these events for an ADD instruction (1 = first): A The contents of the MBR are copied to the CIR. B The contents of the PC are copied to the MAR. C The control unit decodes the contents of the CIR. D The result of the calculation is stored.",
      steps: [{ m: "B = 1, A = 2, C = 3, D = 4", mk: "3 marks", n: "3 for all correct, 2 for two, 1 for one. R. labels used more than once." }], result: "B, A, C, D" } },
    { worked: { tag: "exam", title: "Name the fetch-stage components", src: "AS June 2024 · P2 Q07.1 · 2 marks",
      q: "A diagram shows the processor with two registers (1 at the top, 3 below) joined to main memory by bus 2 (one-way, processor → memory) and bus 4 (two-way). Name components 1 to 4, using full names for registers.",
      steps: [{ m: "1 Memory Address Register · 2 Address Bus · 3 Memory Buffer Register (A. Memory Data Register) · 4 Data Bus", mk: "2 marks", n: "1 mark for two or three correct; 2 for all four." }], result: "MAR, address bus, MBR, data bus" } },
    { worked: { tag: "exam", title: "Name the registers in the fetch diagram", src: "A-level June 2020 · P2 Q03.4 · 2 marks",
      q: "A fetch diagram reads: \"Copy contents of the Program Counter into the ①\" → \"Increment the value in the ②\" and \"Fetch the instruction from main memory and store in the Memory Buffer Register\" → \"Copy contents of the Memory Buffer Register into the ③\". State the full names.",
      steps: [{ m: "① Memory Address Register · ② Program Counter · ③ Current Instruction Register (A. Instruction Register)", mk: "2 marks", n: "1 mark for two; 2 for three. NE. MAR, PC, CIR — but all three correct initialisms earn 1." }], result: "MAR, PC, CIR" } },
    { worked: { tag: "exam", title: "MAR and MBR in the fetch", src: "AS June 2025 · P2 Q09.1 · 2 marks",
      q: "Describe the roles of the memory address register (MAR) and memory buffer register (MBR) in the fetch stage of the Fetch-Execute cycle.",
      steps: [{ h: "MAR", m: "Contains the address of the memory location containing the instruction to be fetched;", mk: "1 mark" }, { h: "MBR", m: "The fetched instruction — the value stored at the address in the MAR — is stored in the MBR;", mk: "1 mark", n: "TO. references to storing into RAM / main memory." }], result: "Address in; instruction out" } },
    { worked: { tag: "exam", title: "The decode stage", src: "AS June 2025 · P2 Q09.2 · 3 marks",
      q: "Describe what happens during the decode stage of the Fetch-Execute cycle, including the role of any dedicated registers.",
      steps: [
        { m: "The current instruction register (CIR) stores the instruction being decoded / executed;", mk: "1 mark" },
        { m: "The instruction is split into opcode and operand;", mk: "1 mark" },
        { m: "The control unit decodes the instruction — determines the type of instruction to carry out;", mk: "1 mark" }
      ], result: "CIR, opcode/operand, CU decodes" } },
    { worked: { tag: "exam", title: "Fetch with registers, buses and memory", src: "A-level June 2017 · P2 Q01.1 · 4 marks",
      q: "Describe how an instruction is fetched from main memory during the fetch stage, covering the use of registers and buses and the role of main memory.",
      steps: [
        { m: "The contents of the Program Counter are transferred to the Memory Address Register;", mk: "indicative" },
        { m: "the address bus is used to transfer this address to main memory;", mk: "indicative" },
        { m: "main memory returns the contents of the addressed location, transferred on the data bus, into the Memory Buffer Register;", mk: "indicative" },
        { m: "the contents of the MBR are transferred to the Current Instruction Register.", mk: "4 marks (level 4)", n: "Levels: 4 = all points in sequence, registers + buses + memory, no misconception; 3 = most points, ≤1 misconception; 2 = two points; 1 = one. I. incrementing the PC. NE. RTN only." }
      ], result: "PC → MAR → address bus → memory → data bus → MBR → CIR" } },
    { worked: { tag: "exam", title: "Why not process from the MBR", src: "A-level June 2017 · P2 Q01.2 · 2 marks",
      q: "During decode and execute the instruction is stored in the CIR. Explain why it could not be processed directly from the MBR.",
      steps: [
        { m: "To execute the instruction other data may need to be fetched from main memory (using the MBR);", mk: "1 mark" },
        { m: "these further fetches — or writing the result back to memory — would overwrite the instruction in the MBR;", mk: "1 mark", n: "A. the MBR is not wired to the components that execute instructions, which the CIR is. R. \"the MBR cannot decode instructions\"." }
      ], result: "The MBR is reused during execute" } },
    { worked: { tag: "exam", title: "The whole cycle (6 marks)", src: "AS June 2017 · P2 Q06.3 · 6 marks",
      q: "Describe, using full sentences, the steps involved in the Fetch-Execute cycle for the von Neumann architecture, covering the fetch, decode and execute stages and stating which stage each step falls in.",
      steps: [
        { h: "Fetch", m: "The contents of the program counter are transferred to the memory address register, and that address is sent to main memory on the address bus." },
        { h: "Fetch", m: "The instruction at that location is transferred on the data bus into the memory buffer register, and the program counter is incremented." },
        { h: "Fetch", m: "The contents of the memory buffer register are copied into the current instruction register." },
        { h: "Decode", m: "The control unit decodes the instruction held in the current instruction register, splitting it into opcode and operand." },
        { h: "Execute", m: "The opcode identifies the operation, which is performed — by the ALU for arithmetic; data is fetched or stored if necessary, the result is stored in a register, the status register is updated, and a branch updates the program counter.", mk: "5–6 marks", n: "5–6: at least five steps in the correct order covering all three stages; 3–4: three steps in order covering two stages; 1–2: one step. A. MDR for MBR. NE. register notation. I. wrong headings." }
      ], result: "≥5 steps, in order, all three stages" } },
    { worked: { tag: "exam", title: "Four fetch steps, each explained (8 marks)", src: "AS June 2020 · P2 Q06.5 · 8 marks",
      q: "Describe four steps that a processor goes through during the fetch stage of the Fetch-Execute cycle. You must explain the purpose of each step.",
      steps: [
        { h: "Step 1", m: "The contents of the PC are transferred to the MAR — **so that** the PC can be updated / the address can be sent along the address bus to memory.", mk: "2 marks" },
        { h: "Step 2", m: "The contents of the addressed location, received on the data bus, are loaded into the MBR — **because** the value is only on the bus transiently and must be held, and not every fetch is an instruction so it cannot go straight to the CIR.", mk: "2 marks" },
        { h: "Step 3", m: "The PC is incremented — **so that** the next instruction in sequence can be fetched.", mk: "2 marks" },
        { h: "Step 4", m: "The contents of the MBR are copied to the CIR — **so that** data fetched or written during the execute stage does not overwrite the instruction.", mk: "2 marks", n: "Max 4 for descriptions, max 4 for explanations. Also creditable: MAR contents placed on the address bus — so the correct location is accessed." }
      ], result: "Each step + its \"so that\"" } },
    { worked: { tag: "exam", title: "F-E cycle and faster hardware (12-mark essay)", src: "A-level June 2023 · P2 Q04.1 · 12 marks",
      q: "Describe how the fetch-execute cycle is used to carry out machine code instructions and how the hardware of a computer could be improved so that programs can be executed more quickly. Include what happens during each stage of the cycle.",
      steps: [
        { h: "Area 1 · Fetch", m: "PC copied to MAR; the address travels on the address bus while a read signal is sent on the control bus; the memory contents return on the data bus into the MBR; the PC is incremented; the MBR is copied to the CIR.", mk: "area 1" },
        { h: "Area 1 · Decode", m: "The instruction in the CIR is decoded by the control unit and split into opcode and operand(s).", mk: "area 1" },
        { h: "Area 1 · Execute", m: "The opcode identifies the operation; data is fetched or stored if necessary; the ALU performs calculations and comparisons; the result goes to a register or memory; the status register is updated; a branch updates the PC; the control bus carries signals that sequence the actions.", mk: "area 1 — all three stages, balanced" },
        { h: "Area 2 · Processor", m: "More cores execute several instructions simultaneously; more cache means fewer slow main-memory fetches; a faster clock completes more cycles per second; a larger word size processes more bits per instruction; pipelining overlaps the fetch of one instruction with the execution of another.", mk: "area 2" },
        { h: "Area 2 · Memory and buses", m: "More RAM reduces paging to disk; faster RAM shortens each fetch; a wider data bus moves more bits per transfer; a faster bus clock; SSDs instead of HDDs; a Harvard architecture lets instruction and data fetches overlap.", mk: "area 2 — a range of components, each explained" },
        { m: "Link each improvement to the stage it speeds up (cache → the fetch; more cores → many cycles at once).", mk: "10–12: both areas at good depth", n: "7–9: good on one, some on the other · 4–6: good on one or some on both · 1–3: a few points." }
      ], result: "Both areas, each explained" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe the steps (by stage)", "Full sentences, correct order, every stage labelled; name registers in full."],
      ["Describe and explain (8)", "Each step paired with a \"so that…\" purpose."],
      ["Explain why (CIR not MBR)", "The MBR is reused during execute → would overwrite."],
      ["State full names", "Memory Address Register, not MAR."],
      ["12-mark describe", "Balanced coverage of all three stages + a range of explained improvements."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"PC → MAR, Memory → MBR, + 1, MBR → CIR\"", body: "Chant: \"**P**lease **M**ake **M**e **I**ncredible **C**offee\" — **P**C to MAR, **M**emory to MBR, **I**ncrement PC, MBR to **C**IR. Then the CU **decodes**, then **execute**." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"The PC holds the instruction\" (R.).", "Register transfer notation alone (NE.).", "Forgetting the buses in a \"registers and buses\" question.", "\"The MBR cannot decode\" (R.) as the reason for the CIR.", "\"Faster processor\" (NE.) in the essay — name the feature and say why."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.3.1 the registers; 4.7.1.1 the buses; 4.7.2.1 the stored program concept; 4.7.3.6 interrupts are checked between cycles; 4.7.3.7 performance factors; 4.6.3.1 translation (the 2019 essay); 4.7.3.3 opcode and operand." } }
  ],
  flashcards: [
    ["Fetch step 1?", "The contents of the PC are copied into the MAR."],
    ["Fetch step 2?", "The address goes on the address bus; memory contents come back on the data bus into the MBR."],
    ["When is the PC incremented?", "During the fetch, after its contents are copied to the MAR (often simultaneously with the memory read)."],
    ["Fetch final step?", "The contents of the MBR are copied into the CIR."],
    ["What happens at decode?", "The control unit decodes the instruction in the CIR, splitting it into opcode and operand."],
    ["What happens at execute?", "The operation is carried out (ALU etc.), data fetched/stored, result written, SR updated, PC changed by a branch."],
    ["Why is PC copied to MAR?", "So the address can be put on the address bus and the PC can be incremented."],
    ["Why use the MBR, not straight into the CIR?", "Not every fetch is an instruction; the value is only on the bus briefly; it buffers the speed difference."],
    ["Why decode from the CIR, not the MBR?", "Execute may fetch/write data through the MBR, overwriting the instruction."],
    ["MAR ← [PC] means…", "the contents of the PC are copied into the MAR."],
    ["What does a branch do to the PC?", "Loads it with the branch target address."]
  ],
  quiz: [
    { q: "The first step of the fetch is", opts: ["PC copied to MAR", "MBR copied to CIR", "CU decodes", "PC incremented"], ans: 0, why: "MAR ← [PC]." },
    { q: "The instruction arrives from memory into the", opts: ["MBR", "MAR", "PC", "status register"], ans: 0, why: "On the data bus." },
    { q: "Which register is decoded?", opts: ["CIR", "MBR", "MAR", "PC"], ans: 0, why: "The CU decodes the CIR." },
    { q: "Order: A MBR→CIR, B PC→MAR, C decode, D store result", opts: ["B, A, C, D", "A, B, C, D", "B, C, A, D", "C, B, A, D"], ans: 0, why: "2022 Q08.1." },
    { q: "Why isn't the instruction executed from the MBR?", opts: ["further memory transfers would overwrite it", "the MBR cannot decode", "the MBR is too small", "the PC points to it"], ans: 0, why: "MBR reused." }
  ]
};

/* =====================================================================
   4.7.3.6  Interrupts
   ===================================================================== */
C["compsci:4.7.3.6"] = {
  notes: [
    { h: "Interrupts — the whole topic on one page" },
    "Spec 4.7.3.6: describe the role of **interrupts** and **interrupt service routines (ISRs)**; their effect on the **Fetch-Execute cycle**; and the need to **save the volatile environment** while the interrupt is being serviced.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Role of interrupts", "Describe", "2", "A-level 2020 Q03.5"],
      ["What an interrupt is and its purpose", "Describe and explain", "2", "A-level 2023 Q04.2"],
      ["Why save the volatile environment", "Explain", "2", "A-level 2020 Q03.6"],
      ["Interrupt handling as an OS function", "Describe", "1", "A-level 2022 Q04.3 — see 4.6.1.4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What an interrupt is**.", "**Interrupts and the Fetch-Execute cycle**.", "**The volatile environment**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What an interrupt is" },
    { callout: { t: "def", h: "Interrupt", body: "A **signal sent to the processor** — from a hardware device or a program — indicating that something needs the processor's **immediate attention**. It lets the currently executing process be **suspended** so the source can be serviced." } },
    { table: { head: ["Source", "Examples"], rows: [
      ["Hardware / I/O", "a key pressed; a printer out of paper; a disk transfer complete; data arrived at a network card"],
      ["Timer", "the OS scheduler's clock — the end of a process's time slice (4.6.1.4)"],
      ["Hardware failure", "power failure; memory parity error"],
      ["Software / exception", "division by zero; an attempt to access protected memory; a program requesting an OS service"]
    ] } },
    { kv: [
      ["Interrupt service routine (ISR)", "the code (often part of the OS or a device driver) that handles one kind of interrupt"],
      ["Interrupt vector", "a table of ISR start addresses, indexed by interrupt type — the processor loads the right one into the PC"],
      ["Priority", "interrupts are prioritised: a higher-priority interrupt can interrupt an ISR; a lower one waits"]
    ] },
    { table: { head: ["", "Polling", "Interrupts"], rows: [
      ["How", "the processor repeatedly **asks** each device whether it needs attention", "the device **tells** the processor when it does"],
      ["Wasted time", "checks even when nothing happened", "none until an event occurs"],
      ["Response", "delayed until the device's turn", "at the end of the current instruction"],
      ["Suits", "simple systems with few devices", "multitasking systems with many devices"]
    ] } },

    { page: "Interrupts and the Fetch-Execute cycle" },
    fdeFig(true, "The F-E cycle with interrupt checking: at the end of every cycle the processor checks for a waiting interrupt of higher priority than the current task."),
    { steps: [
      "At the **end of each Fetch-Execute cycle** (after execute), the processor checks the interrupt lines.",
      "If an interrupt is waiting and its **priority is higher** than the current task, the current instruction is allowed to **complete** first.",
      "The **volatile environment** — the PC, status register and other registers — is **saved** (pushed onto the system **stack**).",
      "The address of the appropriate **ISR** (from the interrupt vector) is loaded into the **PC**.",
      "The ISR executes, through normal Fetch-Execute cycles. Lower-priority interrupts are disabled (masked); a higher one may interrupt it (the stack allows nesting).",
      "When the ISR finishes, the volatile environment is **restored** from the stack, so the PC again holds the address of the next instruction of the interrupted program.",
      "The interrupted program **resumes** exactly where it stopped."
    ] },
    { callout: { t: "miscon", h: "\"An interrupt stops the processor\"", body: "**R.** — it suspends the **current process / program**; the processor keeps running Fetch-Execute cycles, now on the ISR. And it is not acted on mid-instruction: the current instruction finishes first." } },

    { page: "The volatile environment" },
    { callout: { t: "def", h: "Volatile environment", body: "The **contents of the processor's registers** at the moment of the interrupt — PC, status register, general-purpose registers — i.e. everything the interrupted program needs to carry on." } },
    { ul: [
      "The ISR uses the same registers, so it would **change / overwrite** their values.",
      "Saving them lets the interrupted program be **returned to** and continue as if nothing happened — the PC tells it where it was, the SR its last flags, the GPRs its working values.",
      "They are saved on a **stack** because interrupts nest: the most recently interrupted context is the first restored (LIFO, 4.2.3.1)."
    ] },
    { callout: { t: "warn", h: "NE. answers", body: "\"So the content will not be lost\" and \"so the F-E cycle can continue\" are both **NE.** — say the ISR **overwrites the registers** and the saved values let the **interrupted program be returned to**." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "The role of interrupts", src: "A-level June 2020 · P2 Q03.5 · 2 marks",
      q: "Interrupts can be generated by devices connected to the processor during the Fetch-Execute cycle. Describe the role of interrupts.",
      steps: [
        { m: "Allows the currently executing process / program to be suspended;", mk: "1 mark", n: "A. \"stopped\" as BOD. R. stop the F-E cycle / processor. R. \"instruction\" for \"process\"." },
        { m: "so that a device that needs the immediate attention of the processor can be serviced // an urgent error condition can be dealt with;", mk: "1 mark", n: "NE. \"to deal with an error\" unless clearly urgent. NE. \"so a higher-priority task can run\"." }
      ], result: "Suspend the process; service the urgent source" } },
    { worked: { tag: "exam", title: "What an interrupt is and why", src: "A-level June 2023 · P2 Q04.2 · 2 marks",
      q: "An interrupt may occur during the fetch-execute cycle. Describe what an interrupt is and explain the purpose of interrupts.",
      steps: [
        { h: "What (knowledge)", m: "A signal / request sent to the processor (from a hardware device or program);", mk: "1 mark" },
        { h: "Purpose (understanding)", m: "So that a device or source needing the immediate attention of the processor can be serviced // so the currently executing process can be suspended;", mk: "1 mark" }
      ], result: "A signal; immediate attention" } },
    { worked: { tag: "exam", title: "Why save the volatile environment", src: "A-level June 2020 · P2 Q03.6 · 2 marks",
      q: "Explain why the volatile environment (the contents of registers) must be saved before an interrupt is serviced.",
      steps: [
        { m: "The code that deals with the interrupt will change / overwrite / clear the register values;", mk: "1 mark", n: "NE. \"the contents will be lost\"." },
        { m: "so that the currently running process / program can be returned to (and continue correctly);", mk: "1 mark", n: "NE. \"so the F-E cycle can continue\"." }
      ], result: "ISR overwrites registers; resume the process" } },
    { worked: { tag: "variation", title: "Trace an interrupt", q: "A program is executing the instruction at address 500 (PC = 501 after the fetch) when the printer raises an interrupt. Describe what happens, naming the registers involved.",
      steps: [
        { m: "The instruction at 500 completes; at the end of the cycle the processor detects the interrupt and checks its priority.", mk: "1 mark" },
        { m: "PC (501), the status register and the general registers are pushed onto the stack.", mk: "1 mark" },
        { m: "The printer ISR's address is loaded into the PC from the interrupt vector, and the ISR runs.", mk: "1 mark" },
        { m: "The registers are popped back off the stack; the PC is 501 again, so the program continues with the instruction at 501.", mk: "1 mark" }
      ], result: "Resume at 501" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe what an interrupt is", "A signal to the processor from hardware or software."],
      ["Describe the role / purpose", "Suspend the current PROCESS so an urgent source gets immediate attention."],
      ["Explain why save the volatile environment", "The ISR overwrites registers + so the interrupted process can be resumed."],
      ["Effect on the F-E cycle", "Checked at the end of each cycle; current instruction completes; PC loaded with the ISR's address."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Finish, Save, Service, Restore, Resume\"", body: "\"**F**ive **S**mall **S**nakes **R**ode **R**ockets\" — finish the instruction, save the volatile environment, run the ISR, restore registers, resume." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Stops the processor / the F-E cycle\" (R.).", "\"Suspends the instruction\" (R.) — it is the process.", "\"So the data is not lost\" (NE.).", "Servicing the interrupt mid-instruction."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.3.2 the F-E cycle; 4.7.3.1 the status register's interrupt flag; 4.2.3.1 the stack (LIFO) saves nested contexts; 4.6.1.4 the OS handles interrupts and the scheduler's timer interrupt; 4.7.1.1 I/O controllers raise interrupts; 4.2.1.3 subroutine calls also save the PC on a stack." } }
  ],
  flashcards: [
    ["What is an interrupt?", "A signal to the processor from hardware or software that needs immediate attention."],
    ["Purpose of interrupts?", "Suspend the current process so an urgent device/condition can be serviced."],
    ["What is an ISR?", "The routine that handles a particular interrupt."],
    ["When are interrupts checked?", "At the end of each Fetch-Execute cycle."],
    ["What is the volatile environment?", "The contents of the processor's registers (PC, SR, GPRs)."],
    ["Why save it?", "The ISR overwrites registers; saving lets the interrupted process be resumed."],
    ["Where is it saved?", "On the system stack."],
    ["What happens to the PC on an interrupt?", "Saved, then loaded with the ISR's address; restored afterwards."],
    ["Give three interrupt sources.", "e.g. I/O device, timer, power failure, division by zero."],
    ["Polling vs interrupts?", "Processor repeatedly asks devices vs devices signal when they need attention."],
    ["Can an ISR be interrupted?", "Yes, by a higher-priority interrupt."]
  ],
  quiz: [
    { q: "Interrupts are checked", opts: ["at the end of each F-E cycle", "in the middle of decode", "only at power-on", "never"], ans: 0, why: "Between instructions." },
    { q: "The volatile environment is", opts: ["the register contents", "main memory", "the disk cache", "the ISR"], ans: 0, why: "Definition." },
    { q: "An interrupt suspends the current", opts: ["process", "processor", "clock", "instruction set"], ans: 0, why: "R. processor / instruction." },
    { q: "Saved registers are kept on", opts: ["a stack", "a queue", "the MBR", "the hard disk"], ans: 0, why: "LIFO for nesting." },
    { q: "\"So the contents are not lost\" is", opts: ["NE.", "fully correct", "2 marks", "R. outright"], ans: 0, why: "Say they'd be overwritten; resume the process." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
