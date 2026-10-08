/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.6.1–
   4.6.3 (hardware and software, classification of software, system
   software, the role of the operating system, classification of
   programming languages, program translators) at full A-level depth.
   Each topic REPLACES the short entry the older file carried; every way
   AQA has examined it (7516/2 June 2016–2025, 7517/2 June 2017–2025) is
   explained, worked and answered in the mark scheme's own format.
   Thin and thick clients are networking (4.9.4.11); the fetch-execute
   cycle is 4.7.3.2. Past-paper banks stay in bank-cs-46.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers ---- */
function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 },
    { text: [x + w / 2, y + (sub ? h / 2 - 7 : h / 2)], t: label, b: true, size: 12, c: "text" }];
  if (sub) it.push({ text: [x + w / 2, y + h / 2 + 10], t: sub, size: 10.5, c: "muted" });
  return it;
}
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: o.both ? "both" : true, c: o.c || "accent2", w: 2 }];
  if (label) it.push({ text: [(x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0)], t: label, size: 10.5, c: o.c || "accent2" });
  return it;
}
function link(x1, y1, x2, y2) { return { line: [[x1, y1], [x2, y2]], c: "line", w: 1.4 }; }

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **TO.** \"talked out\" — a right point cancelled by a wrong one beside it.",
  "Software questions are **AO1 knowledge**: the mark goes to the defining phrase (\"physical components\", \"programs that are executed\"), not to an example on its own."
] } };

/* the software stack — reused on several pages */
function stackFig(cap) {
  var it = [];
  it = it.concat(boxAt(150, 12, 260, 34, "User", "accent3"));
  it = it.concat(boxAt(150, 60, 260, 40, "Application software", "accent", "word processor, game, browser"));
  it = it.concat(boxAt(150, 114, 260, 40, "Utilities · Libraries · Translators", "accent2", "system software"));
  it = it.concat(boxAt(150, 168, 260, 40, "Operating system", "accent2", "system software — hides the hardware"));
  it = it.concat(boxAt(150, 222, 260, 40, "Hardware", "good", "processor, memory, I/O, storage"));
  it.push({ line: [[440, 248], [440, 26]], arrow: true, c: "muted", w: 1.6 });
  it.push({ text: [452, 140], t: "more abstract", size: 11, c: "muted", pos: "e", off: 0 });
  it.push({ line: [[120, 26], [120, 248]], arrow: true, c: "muted", w: 1.6 });
  it.push({ text: [108, 140], t: "closer to the machine", size: 11, c: "muted", pos: "w", off: 0 });
  return { fig: { w: 560, h: 272, items: it, cap: cap } };
}

/* =====================================================================
   4.6.1.1  Relationship between hardware and software
   ===================================================================== */
C["compsci:4.6.1.1"] = {
  notes: [
    { h: "Relationship between hardware and software — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.6.1.1)", body: "Understand the **relationship between hardware and software** and be able to define the terms **hardware** and **software**." } },
    { callout: { t: "info", h: "Key idea", body: "Short AO1 marks, asked on most AS papers. The definitions are marked on exact words:" } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What is meant by hardware", "What is meant by", "1", "AS 2019 Q05.1"],
      ["What is meant by / define software", "What is meant by / Define", "1", "AS 2019 Q05.2, AS 2022 Q06.1"],
      ["Describe hardware and software", "Describe", "2", "AS 2025 Q06.1"],
      ["Explain the relationship between them", "Explain", "1", "A-level 2020 Q03.7"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Definitions** — the exact phrases that score.", "**The relationship** — each needs the other.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Definitions" },
    { kv: [
      ["Hardware", "the **physical (electronic / electrical / mechanical) components** of a computer system — processor, memory, buses, storage devices, input and output devices"],
      ["Software", "the **programs (code / sequences of instructions) that are executed** on the hardware, together with the data they use"],
      ["Computer system", "hardware and software **working together**"]
    ] },
    { table: { head: ["", "Hardware", "Software"], rows: [
      ["What it is", "physical components", "programs / instructions"],
      ["Can you touch it?", "yes (tangible)", "no — it is stored as bit patterns *on* hardware"],
      ["Wears out?", "yes — components fail physically", "no — but it can contain bugs or become outdated"],
      ["Changed by", "replacing or adding components", "editing and re-translating code, installing updates"],
      ["Examples", "CPU, RAM, SSD, keyboard, monitor", "operating system, compiler, spreadsheet, game"]
    ] } },
    { callout: { t: "miscon", h: "\"Hardware is anything tangible\"", body: "\"Tangible\" on its own is **NE.** — the mark scheme wants *physical / electronic components of the computer system*. Likewise software is **programs that are executed**, not \"things on the computer\" (a photo is data, not software)." } },

    { page: "The relationship" },
    stackFig("Software runs on hardware and controls it; each layer uses the one below it and hides its detail from the one above."),
    { steps: [
      "Hardware **executes** software: the processor fetches each machine code instruction from main memory and executes it (4.7.3.2).",
      "Software **controls** hardware: the instructions tell the processor what to do, and the operating system drives the I/O devices.",
      "Neither is useful alone — hardware without software does nothing; software needs hardware to run on."
    ] },
    { callout: { t: "def", h: "The one-line relationship (A-level 2020 Q03.7)", body: "Software is the programs that execute **on** the hardware // hardware is the physical components that **allow** the software to execute. (A. software controls the operation of the hardware, as BOD.)" } },
    { callout: { t: "tip", h: "Where the boundary blurs", body: "**Firmware** (e.g. the BIOS/UEFI) is software stored permanently in ROM/flash on the hardware. **Microcode** is a layer inside some processors. Neither is on the spec — but if you mention it, still call firmware *software* (it is instructions that execute)." } },
    { callout: { t: "miscon", h: "\"The OS is hardware because it comes with the machine\"", body: "Shipping with the device does not make something hardware. The OS is **system software** — a set of programs." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "What is meant by hardware?", src: "AS June 2019 · P2 Q05.1 · 1 mark",
      q: "A computer system can be defined as hardware and software working together. What is meant by the term hardware?",
      steps: [{ m: "The electronic / electrical / physical / mechanical **components** of the computer system;", mk: "1 mark", n: "NE. \"tangible\" without further explanation." }], result: "Physical components" } },
    { worked: { tag: "exam", title: "What is meant by software?", src: "AS June 2019 · P2 Q05.2 · 1 mark",
      q: "What is meant by the term software?",
      steps: [{ m: "Instructions / code / programs;", mk: "1 mark" }], result: "Programs / instructions" } },
    { worked: { tag: "exam", title: "Define software", src: "AS June 2022 · P2 Q06.1 · 1 mark",
      q: "Define the term 'software'.",
      steps: [{ m: "Software is the name given to programs / code / instructions **that are executed**;", mk: "1 mark" }], result: "Programs that are executed" } },
    { worked: { tag: "exam", title: "Describe hardware and software", src: "AS June 2025 · P2 Q06.1 · 2 marks",
      q: "Describe what is meant by the terms computer hardware and computer software.",
      steps: [
        { h: "Hardware", m: "Hardware is the physical / electronic components (of the system);", mk: "1 mark" },
        { h: "Software", m: "Software is the programs / applications / code / instructions (that are run on the hardware);", mk: "1 mark" }
      ], result: "Physical components; programs run on them" } },
    { worked: { tag: "exam", title: "The relationship between hardware and software", src: "A-level June 2020 · P2 Q03.7 · 1 mark",
      q: "Explain the relationship between hardware and software.",
      steps: [{ m: "Software (is the programs that) execute(s) on the hardware // hardware is the electrical / physical components that allow the software to execute;", mk: "1 mark", n: "A. software controls the operation of the hardware, as BOD." }], result: "Software executes on hardware" } },
    { worked: { tag: "variation", title: "Classify each item", q: "State whether each is hardware or software: (a) a device driver, (b) the data bus, (c) a compiler, (d) an SSD, (e) the BIOS stored in flash memory.",
      steps: [
        { m: "(a) software — a program that lets the OS control a device", mk: "1 mark" },
        { m: "(b) hardware — physical wires / tracks", mk: "1 mark" },
        { m: "(c) software — a translator (system software)", mk: "1 mark" },
        { m: "(d) hardware — a secondary storage device", mk: "1 mark" },
        { m: "(e) software — instructions that execute, even though stored in a chip (firmware)", mk: "1 mark" }
      ], result: "S, H, S, H, S" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["What is meant by / Define", "The defining noun phrase: *physical components*; *programs / instructions that are executed*."],
      ["Describe (2 marks)", "One defining point for each term."],
      ["Explain the relationship", "Software **executes on** hardware // hardware **allows** software to execute."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Hardware you can Hit, Software you can only Start\"", body: "Hardware = physical components; software = programs that are executed." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Tangible\" alone for hardware (NE.).", "Giving only examples (\"a keyboard\") in place of a definition.", "Calling data (a photo, a document) software."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.1.2 system vs application software; 4.7.1.1 the internal hardware components; 4.7.2 the stored program concept — software is held in the same memory as data; 4.7.3.2 how the hardware executes software." } }
  ],
  flashcards: [
    ["Define hardware.", "The physical / electronic components of a computer system."],
    ["Define software.", "Programs / instructions that are executed (on the hardware)."],
    ["What is a computer system?", "Hardware and software working together."],
    ["Relationship between hardware and software?", "Software executes on the hardware; hardware allows software to execute."],
    ["Is \"tangible\" enough for hardware?", "No — NE.; say physical / electronic components."],
    ["Is a device driver hardware or software?", "Software.", 6],
    ["Give two examples of hardware.", "e.g. processor, RAM, SSD, keyboard, monitor, data bus.", 7],
    ["Is a photo stored on disk software?", "No — it is data; software is programs.", 8]
  ],
  quiz: [
    { q: "Which best defines hardware?", opts: ["the physical components of a computer system", "anything you can buy", "programs stored in ROM", "the operating system"], ans: 0, why: "Physical / electronic components." },
    { q: "Software is", opts: ["programs / instructions that are executed", "the processor and memory", "any file on a disk", "only applications"], ans: 0, why: "Definition." },
    { q: "Firmware is", opts: ["software stored on a chip", "hardware", "neither", "a type of bus"], ans: 0, why: "It is instructions that execute." },
    { q: "Which is hardware?", opts: ["the address bus", "a compiler", "a device driver", "a spreadsheet"], ans: 0, why: "Physical wires." },
    { q: "\"Hardware is tangible\" on its own scores", opts: ["NE. — not enough", "the mark", "two marks", "is rejected outright"], ans: 0, why: "Say physical components." }
  ]
};

/* =====================================================================
   4.6.1.2  Classification of software
   ===================================================================== */
C["compsci:4.6.1.2"] = {
  notes: [
    { h: "Classification of software — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.6.1.2)", body: ["Explain what is meant by **system software** and **application software**.", "Understand the need for, and attributes of, different types of software."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Which category is an OS / a virus checker", "Shade one lozenge", "1", "AS 2018 Q05.1, A-level 2019 Q01.1"],
      ["Which of these are system software / which is not", "Shade", "1–2", "AS 2019 Q05.4, AS 2024 Q05.1, A-level 2022 Q04.2"],
      ["Define system software", "Define", "1", "A-level 2022 Q04.1"],
      ["Difference between system and application software", "Explain / Describe", "2", "AS 2019 Q05.3, AS 2025 Q06.2, A-level 2021 Q13.1"],
      ["Label a classification diagram", "Complete", "2", "A-level 2025 Q01.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The classification tree**.", "**System vs application software** — the defining phrases.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The classification tree" },
    { fig: { w: 650, h: 236, items: (function () {
      var it = [];
      it = it.concat(boxAt(265, 8, 120, 30, "Software", "accent3"));
      it = it.concat(boxAt(25, 70, 170, 32, "Application software", "accent"));
      it = it.concat(boxAt(330, 70, 170, 32, "System software", "accent2"));
      it.push(link(325, 38, 110, 70), link(325, 38, 415, 70));
      [["Operating system", 270, 106], ["Utilities", 375, 80], ["Libraries", 465, 80], ["Translators", 570, 92]].forEach(function (b) {
        it = it.concat(boxAt(b[1] - b[2] / 2, 132, b[2], 28, b[0], "accent2"));
        it.push(link(415, 102, b[1], 132));
      });
      [["Compiler", 448], ["Assembler", 530], ["Interpreter", 612]].forEach(function (b) {
        it = it.concat(boxAt(b[1] - 36, 200, 72, 26, b[0], "muted"));
        it.push(link(570, 160, b[1], 200));
      });
      it = it.concat(boxAt(10, 132, 104, 28, "General purpose", "accent"));
      it = it.concat(boxAt(124, 132, 76, 28, "Bespoke", "accent"));
      it.push(link(110, 102, 62, 132), link(110, 102, 162, 132));
      it.push({ text: [62, 176], t: "word processor,", size: 10.5, c: "muted" }, { text: [62, 190], t: "spreadsheet", size: 10.5, c: "muted" });
      it.push({ text: [162, 176], t: "written for one", size: 10.5, c: "muted" }, { text: [162, 190], t: "organisation", size: 10.5, c: "muted" });
      it.push({ text: [375, 176], t: "virus checker,", size: 10.5, c: "muted" }, { text: [375, 190], t: "defragmenter", size: 10.5, c: "muted" });
      return it;
    })(), cap: "The AQA classification. System software has four types: operating systems, utilities, libraries and translators (compiler, assembler, interpreter)." } },
    { callout: { t: "memorise", h: "Hand-drawn version must show", body: ["Software splitting into **system** and **application** software.", "System software splitting into exactly **four**: operating system, utility programs, libraries, translators.", "Translators splitting into **compiler, assembler, interpreter**."] } },

    { page: "System vs application software" },
    { kv: [
      ["System software", "software used in the **management / operation of the computer system** // layers of software that **abstract the user from how the computer works** (hides the complexity of the hardware) // software that provides a **platform** for other software"],
      ["Application software", "software that performs **user-oriented tasks** — tasks the user would still want to do even if they had no computer (write a letter, edit a photo)"]
    ] },
    { table: { head: ["", "System software", "Application software"], rows: [
      ["Purpose", "runs / manages the computer itself", "carries out a task for the user"],
      ["Oriented to", "the machine", "the user"],
      ["Needed to run the computer?", "yes (the OS at least)", "no"],
      ["Interacts with hardware", "directly or nearly (drivers, OS)", "through the OS (system calls)"],
      ["Examples", "Windows, Linux, a compiler, a disk defragmenter, a maths library", "word processor, game, browser, photo editor, video conferencing"]
    ] } },
    { callout: { t: "miscon", h: "\"A compiler is application software — the programmer uses it\"", body: "Every program has a user. AQA classes **translators as system software**: their job is to make other programs runnable on the machine. In every lozenge question the compiler / translator / assembler / interpreter is the system-software answer." } },
    { callout: { t: "miscon", h: "\"A virus checker is an operating system feature\"", body: "It is a **utility**: it helps maintain the computer but the computer runs without it. Do not put it under \"operating system\" in a lozenge question (A-level 2019 Q01.1)." } },
    { h: "Attributes — why different types exist" },
    { ul: [
      "**General-purpose** application software (spreadsheet) serves many users; cheap per copy, well tested, but may not fit an organisation exactly.",
      "**Bespoke** application software is written to one organisation's requirements; exact fit but expensive and slow to produce.",
      "System software is **needed** whatever the user does — without an OS the user would have to drive the hardware directly."
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Which category is an operating system?", src: "AS June 2018 · P2 Q05.1 · 1 mark",
      q: "An operating system is a type of software. Shade one lozenge to indicate which category of software an operating system belongs to: System software / Application software / Translation software.",
      steps: [{ m: "**System software**;", mk: "1 mark", n: "R. more than one lozenge shaded." }], result: "System software" } },
    { worked: { tag: "exam", title: "The key difference", src: "AS June 2019 · P2 Q05.3 · 2 marks",
      q: "Explain the key difference between system software and application software.",
      steps: [
        { h: "System", m: "System software controls / manages the operation of the computer system // is required to operate a computer;", mk: "1 mark" },
        { h: "Application", m: "Application software carries out tasks that are user-oriented / that the user would want to do even if they did not have a computer;", mk: "1 mark" }
      ], result: "Manages the computer vs does the user's task" } },
    { worked: { tag: "exam", title: "Shade the two system software", src: "AS June 2019 · P2 Q05.4 · 2 marks",
      q: "Shade two lozenges to indicate which types of software are system software: Compiler, Photo editor, Spreadsheet, Computer game, Operating system, Word processor.",
      steps: [{ m: "**Compiler**", mk: "1 mark" }, { m: "**Operating system**", mk: "1 mark", n: "R. 0 marks if more than two lozenges shaded." }], result: "Compiler; operating system" } },
    { worked: { tag: "exam", title: "One example of system software", src: "AS June 2024 · P2 Q05.1 · 1 mark",
      q: "Which of the following is an example of system software? A Computer game · B Image editor · C Programming language translator · D Video conferencing software · E Word processor.",
      steps: [{ m: "**C** (Programming language translator);", mk: "1 mark" }], result: "C" } },
    { worked: { tag: "exam", title: "Define system software", src: "A-level June 2022 · P2 Q04.1 · 1 mark",
      q: "Define the term 'system software'.",
      steps: [{ m: "Software used in the management of a computer system // layer(s) of software that abstract the user from how the computer works // software that provides a platform for other software to use;", mk: "1 mark", n: "A. software used to run the computer; A. provides a virtual machine. NE. \"software that maintains a computer\"." }], result: "Manages the system / hides the hardware" } },
    { worked: { tag: "exam", title: "Which is NOT system software?", src: "A-level June 2022 · P2 Q04.2 · 1 mark",
      q: "Four of these are system software. Which is not? A Assemblers · B Bitmap image editors · C Interpreters · D Libraries · E Utility programs.",
      steps: [{ m: "**B** Bitmap image editors;", mk: "1 mark", n: "An image editor does a user-oriented task: application software." }], result: "B" } },
    { worked: { tag: "exam", title: "Describe the difference", src: "A-level June 2021 · P2 Q13.1 · 2 marks",
      q: "Describe the difference between application software and system software.",
      steps: [
        { h: "Application", m: "Performs user-oriented tasks // tasks a user would still want to perform if they did not have a computer;", mk: "1 mark", n: "NE. examples of tasks on their own." },
        { h: "System", m: "Software used in the management of a computer system // layers of software that abstract the user from how the computer works;", mk: "1 mark" }
      ], result: "User tasks vs managing the machine" } },
    { worked: { tag: "exam", title: "Label the classification diagram", src: "A-level June 2025 · P2 Q01.1 · 2 marks",
      q: "A classification diagram splits software into two types; position 1 is the type that is not system software (examples: word processor, game). System software splits into operating systems, 2 (example: virus checker), 3 (example: a maths routine collection) and translators; translators split into compiler, assembler and 4. Name positions 1 to 4.",
      steps: [
        { m: "1 Application (software) · 2 Utilities · 3 Libraries · 4 Interpreter", mk: "2 marks", n: "2 marks for 4 rows correct; 1 mark for 2 or 3 rows; 0 for 1 or fewer. NE. \"apps\". (Diagram reconstructed: the paper's figure is not reproduced.)" }
      ], result: "Application, Utilities, Libraries, Interpreter" } },
    { worked: { tag: "exam", title: "Describe the difference (2025)", src: "AS June 2025 · P2 Q06.2 · 2 marks",
      q: "Describe the difference between system software and application software.",
      steps: [
        { m: "System software controls / manages the system // helps a computer run // performs machine-oriented tasks // abstracts the user from how the computer works;", mk: "1 mark" },
        { m: "Application software performs (specific) tasks for the user / user-oriented tasks;", mk: "1 mark" }
      ], result: "Machine-oriented vs user-oriented" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Shade one / two lozenges", "Exactly the number asked — one extra shaded lozenge scores 0."],
      ["Define system software", "*manages the computer system* // *hides the complexity of the hardware* // *platform for other software*."],
      ["Explain / Describe the difference", "One point about EACH: machine-oriented / management vs user-oriented tasks."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "System software is \"OUTL\" — Operating system, Utilities, Translators, Libraries", body: "\"System software is OUT Loud\" — the four types. Translators = \"CAI\": Compiler, Assembler, Interpreter." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Shading more than the number of lozenges asked.", "Calling a compiler application software.", "Describing only one of the two types in a \"difference\" question.", "\"Software that maintains a computer\" for system software (NE. — that is a utility)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.1.3 the four types of system software; 4.6.1.4 the OS as a virtual machine (abstraction, 4.1.2.2); 4.6.3.1 translators; 4.13 bespoke software and the systems development life cycle." } }
  ],
  flashcards: [
    ["Four types of system software?", "Operating systems, utility programs, libraries, translators.", 2],
    ["Three types of translator?", "Compiler, assembler, interpreter.", 3],
    ["Is a compiler system or application software?", "System software (a translator).", 4],
    ["Category of a virus checker?", "Utility (system software).", 5],
    ["Is a bitmap image editor system software?", "No — application software.", 6],
    ["General-purpose vs bespoke?", "Off-the-shelf for many users vs written for one organisation.", 7],
    ["Application software reaches the hardware through…", "the operating system.", 8]
  ],
  quiz: [
    { q: "Which is NOT system software?", opts: ["a photo editor", "a compiler", "a library", "a utility"], ans: 0, why: "User-oriented task." },
    { q: "A virus checker is", opts: ["a utility", "an operating system", "a translator", "application software"], ans: 0, why: "Maintenance program." },
    { q: "System software is best described as", opts: ["software that manages the computer system", "software for user tasks", "only the operating system", "hardware drivers only"], ans: 0, why: "Definition." },
    { q: "Interpreter belongs under", opts: ["translators", "utilities", "libraries", "applications"], ans: 0, why: "CAI." },
    { q: "A word processor is", opts: ["general-purpose application software", "system software", "bespoke system software", "a utility"], ans: 0, why: "Off-the-shelf user task." }
  ]
};

/* =====================================================================
   4.6.1.3  System software
   ===================================================================== */
C["compsci:4.6.1.3"] = {
  notes: [
    { h: "System software — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.6.1.3)", body: "Understand the need for, and functions of, **operating systems**, **utility programs**, **libraries** and **translators** (compiler, assembler, interpreter)." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Two other types of system software", "Give", "2", "AS 2022 Q06.2"],
      ["What libraries are and why programmers use them", "Describe", "2", "AS 2023 Q06.1"],
      ["What utilities are, with an example", "Describe", "2", "A-level 2021 Q13.2"],
      ["Category of a virus checker", "Shade", "1", "A-level 2019 Q01.1"],
      ["Functions of an operating system", "Describe", "2", "A-level 2022 Q04.3 — see 4.6.1.4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The four types** — need and function of each.", "**Utilities and libraries in depth**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The four types" },
    { table: { head: ["Type", "Function", "Why it is needed", "Examples"], rows: [
      ["Operating system", "manages the hardware resources and hides their complexity; provides a platform (virtual machine) for other programs", "without it every program would have to drive the hardware itself and could not share it", "Windows, macOS, Linux, Android"],
      ["Utility program", "performs a **non-core / ancillary management task** that helps configure, maintain or protect the computer", "keeps the system secure, efficient and recoverable", "virus checker, disk defragmenter, backup, compression, encryption, file manager"],
      ["Library", "a collection of **pre-written, compiled and tested routines** that can be included in / called from a program", "saves development time, improves reliability, provides code the programmer may not know how to write", "maths library, graphics library, DLLs, .NET `System.Linq`"],
      ["Translator", "converts program code into **machine code** (or an intermediate code) the processor can execute", "the processor can only execute machine code (4.6.3.1)", "compiler, assembler, interpreter"]
    ] } },
    stackFig("Where each type sits: the OS on the hardware; utilities, libraries and translators beside it; applications above."),
    { callout: { t: "miscon", h: "\"A translator is a type of utility\"", body: "AQA lists **four separate types**. In \"give two other types\" (translators already given), answer OS, utilities or libraries — **R.** interpreters, compilers, assemblers, which are translators again." } },

    { page: "Utilities and libraries in depth" },
    { h: "Utility programs" },
    { kv: [
      ["Definition", "software that performs a **non-core / ancillary / specific management function** for a computer — helps manage, configure or maintain it, but the computer runs without it"],
      ["Virus checker", "scans files and memory for known malware signatures / behaviour; quarantines or removes"],
      ["Disk defragmenter", "rearranges the blocks of fragmented files on a hard disk so each file is contiguous — fewer head movements, faster reads (pointless on an SSD)"],
      ["Backup", "copies files to another medium so they can be restored after loss"],
      ["Compression", "reduces file size for storage or transmission (4.5.6.9)"],
      ["Encryption", "makes files unreadable without the key (4.5.6.10)"]
    ] },
    { callout: { t: "warn", h: "Example traps (A-level 2021 Q13.2)", body: "**R.** examples that are core OS functions (memory management, scheduling) — those are the OS, not utilities. **R.** application software, or a list where one example is application software." } },
    { h: "Libraries" },
    { kv: [
      ["Definition", "provides **routines that can be included in / used by a program** — pre-written, (usually) pre-compiled and tested"],
      ["Static linking", "the linker copies the library code into the executable — bigger file, no dependency at run time"],
      ["Dynamic linking (DLL / shared library)", "loaded at run time and shared by programs — smaller executables, one update fixes every program, but the library must be present"]
    ] },
    { code: { lang: "csharp", src: "using System;              // the .NET class library\n\ndouble h = Math.Sqrt(3 * 3 + 4 * 4);   // a library routine: no need to code a square root\nConsole.WriteLine(h);                   // another: writes to the screen through the OS", cap: "Calling library routines from C# — tested code the programmer did not have to write." } },
    { table: { head: ["Why use a library?", "Mark-scheme wording"], rows: [
      ["less code to write", "improves the speed of development // reduces workload"],
      ["already tested", "improves reliability"],
      ["specialist routines", "provides operations the programmer may not know how to code themselves"]
    ] } },
    { callout: { t: "miscon", h: "Library ≠ library of programs to run", body: "A library is not run by the user: its routines are **called from another program**. And it is not the same as an *API* — an API is the interface (names, parameters) through which a library or service is used." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Two other types of system software", src: "AS June 2022 · P2 Q06.2 · 2 marks",
      q: "Translators are one type of system software. Give two other types of system software.",
      steps: [{ m: "Operating systems / OS;", mk: "1 mark" }, { m: "Utility programs; (or) Libraries;", mk: "1 mark", n: "A. a specific utility (virus checker, defragmenter) unless \"utilities\" already given. R. interpreters, compilers, assemblers." }], result: "OS; utilities (or libraries)" } },
    { worked: { tag: "exam", title: "Libraries", src: "AS June 2023 · P2 Q06.1 · 2 marks",
      q: "Libraries are a type of system software. Describe what libraries are and why programmers use them.",
      steps: [
        { h: "What (AO1 knowledge)", m: "Provides routines that can be included in / used in a program;", mk: "1 mark" },
        { h: "Why (AO1 understanding)", m: "Improves the speed of development // reduces workload // less code to write // improves reliability // provides operations the programmer may not know how to code;", mk: "1 mark" }
      ], result: "Pre-written routines; faster, more reliable development" } },
    { worked: { tag: "exam", title: "Utilities with an example", src: "A-level June 2021 · P2 Q13.2 · 2 marks",
      q: "Utilities are a type of system software. Describe what utilities are and include an example of a utility in your answer.",
      steps: [
        { h: "Description", m: "(Software that) performs a non-core / ancillary / specific management function for a computer // helps manage, configure or maintain a computer;", mk: "1 mark", n: "NE. \"manages a computer\" — that is the OS." },
        { h: "Example", m: "e.g. virus checker, disk defragmenter, backup, compression, encryption software;", mk: "1 mark", n: "R. core OS functions; R. application software." }
      ], result: "Ancillary maintenance software, e.g. a defragmenter" } },
    { worked: { tag: "exam", title: "Category of a virus checker", src: "A-level June 2019 · P2 Q01.1 · 1 mark",
      q: "Shade one lozenge to indicate to which category of system software a virus checker belongs: Operating systems / Translators / Utilities.",
      steps: [{ m: "**Utilities**", mk: "1 mark" }], result: "Utilities" } },
    { worked: { tag: "variation", title: "Static or dynamic library?", q: "A company ships 40 programs that all use the same encryption library, which must be patched quickly when a flaw is found. Explain whether the library should be statically or dynamically linked.",
      steps: [
        { m: "Dynamically linked (a shared library):", mk: "1 mark" },
        { m: "one copy is loaded at run time and shared, so patching that one file fixes all 40 programs at once;", mk: "1 mark" },
        { m: "static linking would copy the flawed code into every executable, so all 40 would have to be rebuilt and redistributed.", mk: "1 mark" }
      ], result: "Dynamic" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Give two other types", "Choose from OS, utilities, libraries, translators — never two of the same type."],
      ["Describe libraries", "WHAT (routines used in a program) + WHY (faster, reliable, expertise)."],
      ["Describe utilities", "Non-core / ancillary management function + one valid example."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "Utilities: \"Very Diligent Bots Clean Everything\"", body: "**V**irus checker, **D**efragmenter, **B**ackup, **C**ompression, **E**ncryption." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Giving compiler and interpreter as two \"other types\" when translators were given.", "\"Manages the computer\" for a utility (NE.).", "A utility example that is really an OS function (memory management)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.9 compression and 4.5.6.10 encryption — both also utilities; 4.6.3.1 translators; 4.1.2 subroutines and modularity — libraries are reusable subroutines; 4.13.1.3 design for reuse." } }
  ],
  flashcards: [
    ["Define a utility program.", "Software performing a non-core / ancillary management function — helps maintain or configure the computer.", 1],
    ["Three utility examples?", "e.g. virus checker, defragmenter, backup, compression, encryption.", 2],
    ["Define a library.", "A collection of pre-written, tested routines that can be included in / called from a program.", 3],
    ["Two reasons to use a library?", "Faster development (less code); more reliable (already tested); provides routines you could not write.", 4],
    ["Static vs dynamic linking?", "Library code copied into the executable vs loaded and shared at run time.", 5],
    ["What does a defragmenter do?", "Rearranges file blocks so each file is contiguous — faster access on a hard disk.", 6],
    ["Why is an OS needed?", "To manage the hardware resources and hide their complexity from programs and users.", 8]
  ],
  quiz: [
    { q: "Translators given — which is a valid OTHER type of system software?", opts: ["libraries", "compilers", "interpreters", "assemblers"], ans: 0, why: "The others are translators." },
    { q: "A disk defragmenter is", opts: ["a utility", "a library", "a translator", "application software"], ans: 0, why: "Maintenance." },
    { q: "A reason programmers use libraries is", opts: ["improved reliability (tested code)", "programs always run faster", "no translation is needed", "to avoid the OS"], ans: 0, why: "Pre-tested routines." },
    { q: "A DLL is", opts: ["a dynamically linked shared library", "a utility", "a device driver only", "an interpreter"], ans: 0, why: "Loaded at run time." },
    { q: "Which is a CORE OS function, not a utility?", opts: ["allocating memory to processes", "backup", "compression", "virus scanning"], ans: 0, why: "Resource management." }
  ]
};

/* =====================================================================
   4.6.1.4  Role of an operating system
   ===================================================================== */
C["compsci:4.6.1.4"] = {
  notes: [
    { h: "Role of an operating system — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.6.1.4)", body: ["Understand that a role of the operating system is to **hide the complexities of the hardware**.", "Know that the OS handles **resource management**, managing hardware to allocate **processors, memories and I/O devices among competing processes**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["One / another / two resources the OS manages", "State / Name", "1–2", "AS 2018 Q05.2, AS 2023 Q08.2, AS 2024 Q05.2"],
      ["A role other than resource management", "State", "1", "AS 2018 Q05.3"],
      ["Describe two types of resource management", "Describe", "2", "A-level 2019 Q01.2"],
      ["Describe two functions of an OS", "Describe", "2", "A-level 2022 Q04.3, 2025 Q01.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Hiding the hardware** — the virtual machine.", "**Resource management** — described, not named.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Hiding the hardware" },
    { callout: { t: "def", h: "The OS as a virtual machine", body: "The operating system **hides the complexities of the hardware** from the user and from application programs. They see a simpler, idealised machine — files, windows, a `print` call — instead of disk sectors, interrupt lines and device registers." } },
    { ul: [
      "A program saves a **file**; the OS works out which blocks on which device and drives the controller.",
      "A program asks for **memory**; the OS finds free frames and maps them into its address space.",
      "A program prints; the OS passes the request through the right **device driver**.",
      "The **user interface** (GUI / command line) is the user's view of this virtual machine — but naming \"the user interface\" alone is **NE./R.**: describe the *hiding*."
    ] },
    { callout: { t: "tip", h: "This is abstraction", body: "4.1.2.2 abstraction by generalisation / information hiding: the OS is the clearest example in the spec — the details are hidden behind a simpler interface." } },

    { page: "Resource management" },
    { fig: { w: 560, h: 236, items: (function () {
      var it = [];
      ["Process 1", "Process 2", "Process 3"].forEach(function (p, i) { it = it.concat(boxAt(20 + i * 120, 12, 100, 30, p, "accent")); it = it.concat(arrow(70 + i * 120, 42, 280, 92)); });
      it.push({ text: [440, 27], t: "competing processes", size: 11, c: "muted" });
      it = it.concat(boxAt(150, 92, 260, 40, "Operating system", "accent2", "allocates · schedules · protects"));
      [["Processor(s)", "time slices"], ["Main memory", "pages / frames"], ["I/O devices", "drivers, queues"], ["Secondary storage", "files, directories"]].forEach(function (r, i) {
        it = it.concat(boxAt(14 + i * 136, 178, 124, 44, r[0], "good", r[1]));
        it = it.concat(arrow(280, 132, 76 + i * 136, 178));
      });
      return it;
    })(), cap: "Several processes compete for the same hardware; the OS shares it out." } },
    { table: { head: ["Resource", "What the OS does (the DESCRIBED answer)", "NE. on its own"], rows: [
      ["Processor(s) / cores", "allocates processors/cores to processes // schedules processes — decides which process runs when, giving each a time slice", "\"processor management\", \"multitasking\""],
      ["Main memory", "allocates memory to processes // decides which areas of memory are used for what // moves data into and out of RAM to a paging file (virtual memory) // stops a process writing to memory it was not allocated", "\"memory management\""],
      ["I/O devices", "allocates I/O devices to processes // manages communication between processes and devices // installs drivers for new devices", "\"manages I/O devices\""],
      ["Secondary storage", "allocates space on a device to files // organises files into directories // decides where on a device to save a file // recognises devices when connected", "\"file management\", \"saving a file\""]
    ] } },
    { h: "Other OS functions that score" },
    { ul: [
      "**Handles interrupts** — calls the appropriate interrupt service routine when an interrupt occurs (4.7.3.6). (R. for *resource management* questions.)",
      "**Installs / updates software**.",
      "**Manages power** — clock speed, screen brightness, battery use.",
      "**Security** — authenticates users (log-in), manages file permissions, stops processes accessing resources not allocated to them, keeps logs."
    ] },
    { callout: { t: "miscon", h: "Naming is not describing", body: "Every A-level OS question says: *students must describe — phrases such as \"processor management\", \"allocating memory\" etc are not enough.* Write **what is allocated to what, and why**: \"the OS decides which process uses the processor next and for how long\"." } },
    { callout: { t: "miscon", h: "Physical vs software resources", body: "\"State two hardware resources\" wants **processor, memory, I/O devices, secondary storage, cache, power supply**. The scheduler, virtual memory and the file system are **R.** — they are the OS's *software* mechanisms, not resources." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "One resource the OS manages", src: "AS June 2018 · P2 Q05.2 · 1 mark",
      q: "State one resource that the operating system manages.",
      steps: [{ m: "Processors (A. CPU) // memory (A. RAM) // I/O devices;", mk: "1 mark", n: "A. hardware. MAX 1." }], result: "e.g. memory" } },
    { worked: { tag: "exam", title: "A role other than resource management", src: "AS June 2018 · P2 Q05.3 · 1 mark",
      q: "State one role of the operating system, other than resource management.",
      steps: [{ m: "To hide the complexities of the hardware from the user;", mk: "1 mark", n: "A. other reasonable roles that are not resource management (e.g. handling interrupts, security)." }], result: "Hide the hardware's complexity" } },
    { worked: { tag: "exam", title: "Another physical resource", src: "AS June 2023 · P2 Q08.2 · 1 mark",
      q: "One physical resource that the operating system manages is the processor. Name another physical resource that the operating system is responsible for managing.",
      steps: [{ m: "(Main) memory (A. RAM) // secondary storage (A. an example) // I/O devices (A. an example);", mk: "1 mark", n: "R. processors (given). R. file system. R. scheduling." }], result: "e.g. main memory" } },
    { worked: { tag: "exam", title: "Two other hardware resources", src: "AS June 2024 · P2 Q05.2 · 2 marks",
      q: "An operating system manages hardware resources, for example the I/O devices. State two other examples of hardware resources that an operating system is responsible for managing.",
      steps: [{ m: "Processor // CPU;", mk: "1 mark" }, { m: "Main memory // RAM (or secondary storage, cache, power supply unit);", mk: "1 mark", n: "R. software-implemented resources (scheduler, virtual memory, file management). MAX 2." }], result: "Processor; main memory" } },
    { worked: { tag: "exam", title: "Two types of resource management", src: "A-level June 2019 · P2 Q01.2 · 2 marks",
      q: "The operating system is responsible for resource management. Describe two different types of resource management that an operating system is responsible for.",
      steps: [
        { h: "Type 1", m: "Allocates processors / cores to processes // schedules processes — decides which process to carry out when;", mk: "1 mark" },
        { h: "Type 2", m: "Allocates memory to processes // moves data into and out of RAM to a paging file for virtual memory // ensures processes only write to memory they have been allocated;", mk: "1 mark", n: "R. handling interrupts; R. hides complexity — those are not resource management. NE. \"processor management\"." }
      ], result: "Scheduling; memory allocation" } },
    { worked: { tag: "exam", title: "Two functions of an OS", src: "A-level June 2022 · P2 Q04.3 · 2 marks",
      q: "Describe two functions of an operating system.",
      steps: [
        { m: "To hide the complexities of the hardware from the user;", mk: "1 mark", n: "NE. virtual machine without description. R. user interface." },
        { m: "To handle interrupts — to call the appropriate interrupt handler (ISR) when an interrupt occurs;", mk: "1 mark", n: "Any two described functions: scheduling, memory allocation, I/O allocation, file storage, installing software, power management." }
      ], result: "Hide hardware; handle interrupts" } },
    { worked: { tag: "exam", title: "Two OTHER functions", src: "A-level June 2025 · P2 Q01.2 · 2 marks",
      q: "One function of the operating system is to allocate I/O devices to competing processes. Describe two other functions of an operating system.",
      steps: [
        { m: "Allocating time slices of the processor to processes — deciding which process runs when;", mk: "1 mark", n: "NE. multitasking without explanation." },
        { m: "Authenticating users, e.g. log-in with a username and password, and managing file permissions;", mk: "1 mark", n: "NE. \"security management\". R. allocation of I/O devices (given)." }
      ], result: "Scheduling; authentication" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State a resource", "A **physical** resource: processor, memory, I/O device, secondary storage, cache, PSU."],
      ["Describe a function / type of resource management", "Verb + resource + purpose: \"*allocates* areas of *memory* to *each process* and stops it writing outside them\"."],
      ["Other than X", "Never repeat X — the given function or resource scores nothing."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "The OS is \"PMIS\" + \"HIPS\"", body: "Resources: **P**rocessor, **M**emory, **I**/O, **S**torage. Other roles: **H**ide the hardware, **I**nterrupts, **P**ower, **S**ecurity." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Two-word labels (\"memory management\") — NE.", "\"User interface\" as the hiding role — R./NE.", "Software mechanisms (scheduler, virtual memory) when hardware resources are asked.", "Repeating the function given in the stem."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.2.2 abstraction / information hiding; 4.7.3.6 interrupts and the ISR; 4.7.1.1 processor, memory and buses — the resources; 4.9.3.1 network security — authentication; 4.6.1.3 utilities are NOT core OS functions." } }
  ],
  flashcards: [
    ["Main role of the OS besides resource management?", "To hide the complexities of the hardware (provide a virtual machine)."],
    ["Describe processor management.", "The OS schedules processes — decides which process uses the processor/core next and for how long (time slices).", 2],
    ["Describe memory management.", "Allocates areas of memory to processes, moves pages to/from a paging file, and stops a process writing outside its allocation.", 3],
    ["Describe I/O management.", "Allocates devices to processes and manages communication through device drivers.", 4],
    ["Is \"memory management\" enough?", "No — NE.; describe what is allocated and why.", 6],
    ["Is the scheduler a hardware resource?", "No — it is OS software (R.).", 7],
    ["Two OS functions that are not resource management?", "Handling interrupts; hiding hardware complexity (also security, power management).", 8]
  ],
  quiz: [
    { q: "Which is a hardware resource the OS manages?", opts: ["main memory", "the scheduler", "virtual memory", "the file system"], ans: 0, why: "Physical resource." },
    { q: "\"Processor management\" alone in a describe question is", opts: ["NE. — not enough", "1 mark", "2 marks", "accepted as BOD"], ans: 0, why: "Must describe." },
    { q: "The OS hiding the hardware's complexity is an example of", opts: ["abstraction", "recursion", "normalisation", "encapsulation of data only"], ans: 0, why: "Virtual machine." },
    { q: "When an interrupt occurs the OS", opts: ["calls the appropriate interrupt service routine", "restarts the computer", "ignores it", "deletes the process"], ans: 0, why: "Interrupt handling." },
    { q: "Allocating time slices to processes is", opts: ["scheduling", "paging", "defragmenting", "buffering"], ans: 0, why: "Processor allocation." }
  ]
};

/* =====================================================================
   4.6.2.1  Classification of programming languages
   ===================================================================== */
C["compsci:4.6.2.1"] = {
  notes: [
    { h: "Classification of programming languages — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.6.2.1)", body: ["Show awareness of the development of programming languages and their classification into **low-level** (machine code, assembly language) and **high-level** languages (including **imperative** HLLs)", "Describe machine code and assembly language.", "Understand the **advantages and disadvantages** of machine code and assembly language programming compared with HLL programming.", "Explain **imperative high-level language** and its relationship to low-level languages."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["The other low-level language", "Which / State", "1", "AS 2016 Q04.1, AS 2025 Q06.4"],
      ["Imperative (high-level language)", "Explain", "1–2", "AS 2016 Q09.1, AS 2018 Q11.3, A-level 2024 Q10.4"],
      ["HLL vs LLL advantages and disadvantages", "Explain / Discuss", "4–6", "AS 2016 Q09.2, A-level 2017 Q05.4, AS 2023 Q06.2 (6, levels)"],
      ["Advantages of HLLs", "Describe", "4", "A-level 2025 Q01.3"],
      ["Advantages of low-level / why assembly was chosen", "State / Explain", "2–3", "AS 2017 Q04.2, AS 2025 Q06.3, A-level 2022 Q09.4, 2024 Q10.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The generations** — machine code, assembly, imperative HLLs.", "**Imperative high-level languages**.", "**Comparison** — the advantages and disadvantages, both ways round.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The generations" },
    { fig: { w: 560, h: 210, items: (function () {
      var it = [];
      it = it.concat(boxAt(16, 150, 160, 46, "Machine code", "good", "binary opcodes + operands"));
      it = it.concat(boxAt(200, 96, 160, 46, "Assembly language", "accent2", "mnemonics: LDR, ADD, B"));
      it = it.concat(boxAt(384, 42, 160, 46, "Imperative HLL", "accent", "C#, Python, Java"));
      it = it.concat(arrow(176, 162, 200, 126), arrow(360, 108, 384, 72));
      it.push({ text: [96, 128], t: "LOW-LEVEL", b: true, size: 11.5, c: "good" }, { text: [280, 74], t: "LOW-LEVEL", b: true, size: 11.5, c: "accent2" }, { text: [464, 20], t: "HIGH-LEVEL", b: true, size: 11.5, c: "accent" });
      it.push({ line: [[16, 204], [544, 204]], arrow: true, c: "muted", w: 1.4 });
      it.push({ text: [440, 192], t: "abstraction increases →", size: 10.5, c: "muted" });
      return it;
    })(), cap: "Each generation hides more of the processor: machine code is what the processor executes; assembly gives it names; an HLL describes the algorithm independently of any processor." } },
    { kv: [
      ["Machine code", "instructions as **binary patterns** (opcode + operand) that the processor executes **directly**; specific to one processor's instruction set; no translation needed"],
      ["Assembly language", "uses **mnemonics** (LDR, ADD, CMP, B) and labels in place of binary; each assembly instruction maps **one-to-one** onto a machine code instruction; translated by an **assembler**; still processor-specific"],
      ["High-level language", "uses English-like keywords, structured statements (loops, selection), named variables, data structures and subroutines; **one statement → many machine instructions**; **processor-independent**; translated by a compiler or interpreter"]
    ] },
    { table: { head: ["The same task: R3 ← R1 + R2 if R1 = 0", "Code"], rows: [
      ["Machine code (illustrative 16-bit)", "`0110 0001 0000 0000` · `0001 0011 0001 0010` …"],
      ["Assembly (AQA set)", "`CMP R1, #0` · `BNE skip` · `ADD R3, R1, R2` · `skip:`"],
      ["C# (imperative HLL)", "`if (a == 0) c = a + b;`"]
    ] } },
    { callout: { t: "def", h: "Machine code instruction structure", body: "An instruction = **opcode** (the basic machine operation + the addressing mode) followed by **operand(s)** (data, a register or an address). Details in 4.7.3.3 and 4.7.3.4." } },

    { page: "Imperative high-level languages" },
    { callout: { t: "def", h: "Imperative", body: "An imperative program is a **sequence of instructions (commands) that are executed in a programmer-defined order**; each instruction is a step that **changes the state** of the program (the values of variables). It describes **how** to solve the problem." } },
    { code: { lang: "csharp", src: "int total = 0;                    // state: total = 0\nfor (int i = 1; i <= 3; i++)      // commands executed in order\n{\n    total = total + i;            // each step changes the state\n}\nConsole.WriteLine(total);         // 6", cap: "Imperative C#: explicit steps, explicit order, assignments that change state." } },
    { h: "Its relationship to low-level languages" },
    { ul: [
      "Low-level languages are imperative too — a machine program is literally a sequence of instructions changing registers and memory.",
      "An imperative HLL keeps that model (sequence, assignment, state) but **abstracts** it: one HLL statement compiles into **many** machine code instructions.",
      "So imperative HLLs map naturally onto the processor's fetch-execute model, which is why they compile efficiently."
    ] },
    { table: { head: ["", "Imperative", "Declarative (contrast)"], rows: [
      ["Describes", "**how** — the steps", "**what** — the result wanted"],
      ["State", "variables changed by assignment", "no (or hidden) mutable state"],
      ["Examples", "C#, Python, Pascal, assembly", "SQL (4.10), Haskell (functional, 4.12), Prolog"]
    ] } },
    { callout: { t: "miscon", h: "\"Imperative means high-level\"", body: "Imperative describes the **paradigm** (commands that change state), not the level. Machine code is imperative; SQL is high-level but **not** imperative." } },
    { callout: { t: "miscon", h: "\"High-level means closer to English\"", body: "**R.** \"closer to natural language / almost written in English\" (AS 2018). Say **English-like keywords**, structured statements, local variables / parameters / named constants — concrete features." } },

    { page: "Comparison" },
    { table: { head: ["", "High-level language", "Low-level (assembly / machine code)"], rows: [
      ["Readability", "easier to read, write, understand, **debug and maintain**", "harder — terse mnemonics or binary"],
      ["Development time", "faster — one line does the work of many; programmers more productive; supports collaboration", "slower"],
      ["Portability", "**machine-independent** — recompile for another processor", "**processor-specific** — tied to one instruction set"],
      ["Language features", "flow control structures, data structures (arrays, records), subroutines/classes, libraries, paradigms", "only jumps, registers and memory addresses"],
      ["Execution speed", "may be slower — compiler output is less tightly optimised", "may **execute faster** — hand-optimised"],
      ["Memory use", "may use more", "**uses less memory**"],
      ["Hardware access", "indirect, through the OS / libraries", "**direct control** of hardware: chosen registers and memory locations"],
      ["Translation", "always needs a compiler or interpreter", "machine code needs none; assembly needs an assembler (1:1)"]
    ] } },
    { callout: { t: "warn", h: "The trap in every speed answer", body: "\"Low-level is faster **because it does not need translating**\" is **R. / TO.** The speed claim is about the *resulting machine code* running faster (fewer, better-chosen instructions) — not translation time." } },
    { callout: { t: "warn", h: "\"More efficient\" is NE.", body: "Say which resource: **executes more quickly** or **uses less memory**." } },
    { h: "When to choose each" },
    { ul: [
      "**Assembly**: embedded systems on a new or tiny processor (no compiler, little memory), device drivers, OS kernels' lowest layers, time-critical routines.",
      "**HLL**: almost everything else — business software, apps, games, data processing — where development time and portability dominate."
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "The other low-level language", src: "AS June 2016 · P2 Q04.1 · 1 mark",
      q: "Assembly language is considered to be a low-level language. Which other type of language is also considered to be a low-level language?",
      steps: [{ m: "**Machine code**;", mk: "1 mark", n: "A. bytecode, object code; A. machine language as BOD; I. reference to binary." }], result: "Machine code" } },
    { worked: { tag: "exam", title: "Explain imperative", src: "AS June 2016 · P2 Q09.1 · 2 marks",
      q: "Some high-level languages are imperative. Explain the term imperative.",
      steps: [
        { m: "Instructions are executed in a programmer-defined order // programs define sequences of commands for the computer to perform;", mk: "1 mark" },
        { m: "Imperative languages describe **how** to solve a problem (in terms of sequences of actions to be taken);", mk: "1 mark" }
      ], result: "Ordered commands describing how" } },
    { worked: { tag: "exam", title: "Imperative high-level language", src: "AS June 2018 · P2 Q11.3 · 2 marks",
      q: "Explain what is meant by the term imperative high-level language.",
      steps: [
        { h: "Imperative (MAX 1)", m: "Instructions are executed in a programmer-defined order // describe how to solve a problem as a sequence of actions;", mk: "1 mark" },
        { h: "High-level (MAX 1)", m: "Uses English-like keywords // supports structured statements (e.g. WHILE loops) // supports local variables, parameters, named constants, indentation;", mk: "1 mark", n: "R. closer to natural language / almost English. R. machine independent / problem-oriented / top-down." }
      ], result: "One point for each word" } },
    { worked: { tag: "exam", title: "Imperative in one mark", src: "A-level June 2024 · P2 Q10.4 · 1 mark",
      q: "Some high-level languages are described as being imperative. Explain what imperative means in this context.",
      steps: [{ m: "The program is a sequence of instructions that are followed in order // each instruction is a step describing how to carry out a task // instructions can change the state of the program;", mk: "1 mark" }], result: "A sequence of state-changing steps" } },
    { worked: { tag: "exam", title: "HLL vs low-level: advantages and disadvantages", src: "AS June 2016 · P2 Q09.2 · 4 marks",
      q: "Explain the advantages and disadvantages of programming using imperative high-level languages compared with low-level languages.",
      steps: [
        { h: "Advantage", m: "HLL programs are machine independent / portable;", mk: "1 mark" },
        { h: "Advantage", m: "people find HLL code easier to read, write, understand and debug;", mk: "1 mark" },
        { h: "Disadvantage", m: "HLL programs may not make best use of the specific features of a particular processor // may not execute as quickly;", mk: "1 mark" },
        { h: "Disadvantage", m: "HLL programs may use more memory // some programs (parts of an OS) cannot easily be written in an HLL;", mk: "1 mark", n: "MAX 3 if all advantages or all disadvantages." }
      ], result: "Both sides, two each" } },
    { worked: { tag: "exam", title: "Assembly for a new microwave chip", src: "AS June 2017 · P2 Q04.2 · 3 marks",
      q: "A company is using a newly-developed processor in its latest microwave oven. The developer chose assembly language rather than a high-level language to write the control program. Explain why the developer may have made this decision.",
      steps: [
        { h: "Point", m: "There may not be a compiler / interpreter for the chip;", mk: "1 mark" },
        { h: "Expansion", m: "— as it is bespoke / new.", mk: "1 mark" },
        { h: "Point", m: "The chip is probably slow / low-powered / low in memory —", mk: "1 mark" },
        { h: "Expansion", m: "so memory and time must be used efficiently; translated assembly will probably be faster and need less memory.", mk: "1 mark", n: "Also: platform dependence is irrelevant (it only runs on one device); direct control of hardware. MAX 3; a point is needed for its expansion to score." }
      ], result: "No translator; constrained hardware" } },
    { worked: { tag: "exam", title: "Why write this program in assembly?", src: "A-level June 2022 · P2 Q09.4 · 2 marks",
      q: "State two reasons why the programmer may have chosen to write this program in assembly language rather than in a high-level programming language.",
      steps: [
        { m: "So it will execute more quickly;", mk: "1 mark", n: "TO. if the speed is put down to no translation." },
        { m: "So it will use less memory (when translated) // complete control over the final machine code // no HLL translator available;", mk: "1 mark", n: "R. direct access to hardware / registers (2022 only)." }
      ], result: "Faster; less memory" } },
    { worked: { tag: "exam", title: "Two advantages of assembly", src: "A-level June 2024 · P2 Q10.3 · 2 marks",
      q: "Describe two advantages of writing programs in assembly language over writing programs using a high-level language.",
      steps: [
        { m: "Machine code produced by assembling may use less memory // contain fewer instructions than machine code produced by compiling HLL code;", mk: "1 mark", n: "NE. more compact, smaller." },
        { m: "It may execute more quickly than the compiled HLL equivalent // may allow better access to hardware / registers / low-level OS routines;", mk: "1 mark", n: "NE. \"assembly language is faster\". R. faster because no translation." }
      ], result: "Less memory; faster / hardware access" } },
    { worked: { tag: "exam", title: "Two advantages of a low-level language", src: "AS June 2025 · P2 Q06.3 · 2 marks",
      q: "State two advantages of using a low-level language to write software.",
      steps: [
        { m: "Programs (usually) execute faster;", mk: "1 mark", n: "R. faster because of no translation." },
        { m: "Use less memory // allow more direct / precise control of the hardware (e.g. which registers to use) // machine code needs no translation;", mk: "1 mark" }
      ], result: "Faster; less memory" } },
    { worked: { tag: "exam", title: "The other low-level language (2025)", src: "AS June 2025 · P2 Q06.4 · 1 mark",
      q: "State a type of low-level language other than assembly language.",
      steps: [{ m: "Machine code;", mk: "1 mark", n: "A. object code / intermediate code / bytecode." }], result: "Machine code" } },
    { worked: { tag: "exam", title: "Advantages of HLLs (4 marks)", src: "A-level June 2025 · P2 Q01.3 · 4 marks",
      q: "Software can be developed using a low-level language or a high-level language. Describe the advantages of writing programs using a high-level language.",
      steps: [
        { m: "Program code is easier to understand / maintain / debug;", mk: "1 mark" },
        { m: "Faster development time — one line of HLL can do the job of many lines of assembly language;", mk: "1 mark" },
        { m: "Programs are more portable / machine-independent;", mk: "1 mark" },
        { m: "Built-in support for data structures (arrays, records) // flow control structures // modularity (subroutines, classes) // libraries of built-in functions // facilitates collaborative working;", mk: "1 mark", n: "MAX 4. NE. implied modularity just from \"libraries\"." }
      ], result: "Four distinct advantages" } },
    { worked: { tag: "exam", title: "Discuss HLL vs LLL (levels of response)", src: "AS June 2023 · P2 Q06.2 · 6 marks",
      q: "Discuss the advantages and disadvantages of high-level languages compared to low-level languages.",
      steps: [
        { h: "Portability", m: "An HLL may be processor-agnostic — a Python program can be interpreted on many types of processor — whereas a low-level program is specific to one processor family.", mk: "indicative point" },
        { h: "Ease", m: "HLLs use English-like keywords and are more abstracted from the processor, so they are easier to write, debug and maintain, and quicker to develop; more development tools exist for them.", mk: "indicative point" },
        { h: "Features", m: "HLLs offer abstract data types, built-in functions and a wider range of structures (loops); some (SQL) are designed for a specific problem domain.", mk: "indicative point" },
        { h: "Against", m: "However, low-level programs are likely to use less memory and may execute faster, and they can directly interact with and control hardware.", mk: "indicative point" },
        { h: "Translation", m: "Not all low-level languages need translating (machine code), but every HLL does.", mk: "indicative point" },
        { h: "Judgement", m: "So an HLL suits most software; low-level suits code where speed, size or hardware control matter — a device driver, an embedded controller.", mk: "Level 3: 5–6 marks", n: "5–6 needs a broad range with **explicit comparison throughout**; 3–4 a few points with some comparison; 1–2 features stated without comparison." }
      ], result: "Explicit comparison throughout" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Which / State the other low-level language", "Machine code."],
      ["Explain imperative", "Sequence of commands in a programmer-defined order // describes HOW // changes state."],
      ["Explain advantages AND disadvantages", "Both sides — MAX 3 if one side only."],
      ["Discuss (6)", "Every point compared explicitly: \"…whereas a low-level language …\"; end with when each suits."],
      ["Why assembly was chosen (scenario)", "Point + expansion tied to the scenario: no translator for a new chip; little memory / slow chip."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "HLL = \"PREP\", LLL = \"FSD\"", body: "High-level: **P**ortable, **R**eadable, **E**asier to debug / maintain, **P**roductive (faster to write). Low-level: **F**aster execution, **S**maller memory use, **D**irect hardware control." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Low-level is faster \"because no translation is needed\" (R./TO.).", "\"More efficient\" without saying faster or smaller (NE.).", "\"Closer to English\" for high-level (R.).", "Treating imperative as a synonym for high-level.", "Giving only advantages in an advantages-and-disadvantages question."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.3.1 assemblers, compilers and interpreters; 4.7.3.3–4.7.3.5 instruction format, addressing modes and the AQA assembly language; 4.12 functional programming (declarative, no state); 4.10 SQL (declarative); 4.1.2 structured programming — the HLL features." } }
  ],
  flashcards: [
    ["Two low-level languages?", "Machine code and assembly language."],
    ["Describe machine code.", "Binary instructions (opcode + operand) executed directly by the processor; processor-specific."],
    ["Describe assembly language.", "Mnemonics for machine code instructions; one-to-one with machine code; needs an assembler."],
    ["Three advantages of low-level languages.", "Faster execution; less memory; direct control of hardware.", 5],
    ["Why is \"faster because no translation\" wrong?", "The speed advantage is the machine code executing faster, not translation time — R.", 6],
    ["Relationship of imperative HLL to low-level?", "Same sequence/state model, abstracted: one HLL statement becomes many machine instructions.", 7],
    ["Is SQL imperative?", "No — declarative (states what, not how).", 8],
    ["When might assembly be chosen?", "New / embedded processor with no compiler or little memory; device drivers; time-critical code.", 9]
  ],
  quiz: [
    { q: "Which is a low-level language?", opts: ["machine code", "C#", "SQL", "Python"], ans: 0, why: "Plus assembly." },
    { q: "Imperative means", opts: ["a sequence of commands describing how", "describing what is wanted", "no variables", "only high-level"], ans: 0, why: "Definition." },
    { q: "A valid advantage of an HLL is", opts: ["portability across processors", "uses less memory", "direct register control", "no translation needed"], ans: 0, why: "Machine-independent." },
    { q: "\"Assembly is faster because it needs no translation\" is", opts: ["rejected", "credited", "credited as BOD", "two marks"], ans: 0, why: "Speed is about execution." },
    { q: "One assembly instruction corresponds to", opts: ["one machine code instruction", "many machine instructions", "one HLL statement", "a whole subroutine"], ans: 0, why: "One-to-one." }
  ]
};

/* =====================================================================
   4.6.3.1  Types of program translator
   ===================================================================== */
function transFig(cap) {
  var it = [];
  it.push({ text: [10, 14], t: "Compiler", b: true, size: 12, c: "accent", pos: "e", off: 0 });
  it = it.concat(boxAt(10, 24, 110, 34, "Source code", "accent3"));
  it = it.concat(boxAt(160, 24, 100, 34, "Compiler", "accent"));
  it = it.concat(boxAt(296, 24, 110, 34, "Object code", "good", "executable file"));
  it = it.concat(boxAt(440, 24, 112, 34, "Run", "good", "many times"));
  it = it.concat(arrow(120, 41, 160, 41), arrow(260, 41, 296, 41, "once"), arrow(406, 41, 440, 41));
  it.push({ text: [10, 86], t: "Interpreter", b: true, size: 12, c: "accent2", pos: "e", off: 0 });
  it = it.concat(boxAt(10, 96, 110, 34, "Source code", "accent3"));
  it = it.concat(boxAt(160, 96, 200, 34, "Interpreter", "accent2", "analyse a line → execute it → next"));
  it = it.concat(arrow(120, 113, 160, 113));
  it.push({ text: [440, 113], t: "no object code; needs source", size: 10.5, c: "muted" }, { text: [440, 127], t: "+ interpreter every run", size: 10.5, c: "muted" });
  it.push({ text: [10, 158], t: "Bytecode", b: true, size: 12, c: "accent3", pos: "e", off: 0 });
  it = it.concat(boxAt(10, 168, 110, 34, "Source code", "accent3"));
  it = it.concat(boxAt(150, 168, 90, 34, "Compiler", "accent"));
  it = it.concat(boxAt(270, 168, 100, 34, "Bytecode", "accent3", "portable"));
  it = it.concat(boxAt(400, 168, 150, 34, "Virtual machine", "good", "interpret / JIT on each CPU"));
  it = it.concat(arrow(120, 185, 150, 185), arrow(240, 185, 270, 185), arrow(370, 185, 400, 185));
  return { fig: { w: 560, h: 214, items: it, cap: cap } };
}
C["compsci:4.6.3.1"] = {
  notes: [
    { h: "Types of program translator — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.6.3.1)", body: ["Understand the role of an **assembler**, a **compiler** and an **interpreter**.", "Explain the differences between compilation and interpretation and describe situations in which each is appropriate.", "Explain why an **intermediate language such as bytecode** is produced by some compilers and how it is used.", "Understand the difference between **source code** and **object (executable) code**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Differences between a compiler and an interpreter", "Describe / Explain", "2–4", "AS 2016 Q09.3, AS 2017 Q04.1"],
      ["Why bytecode; how it is executed", "Explain / Describe", "1–2", "AS 2018 Q11.1–11.2, AS 2022 Q06.3–06.4"],
      ["Assembler vs compiler: similarity and difference", "Describe", "2", "AS 2019 Q10.3"],
      ["Role of an assembler and why it is needed", "Describe and explain", "2", "AS 2025 Q06.5"],
      ["Assembly ↔ machine code relationship", "Explain", "1", "A-level 2022 Q09.5"],
      ["Translation and the fetch-execute cycle", "Describe (12-mark essay)", "12", "A-level 2019 Q05"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Source code, object code and the three translators**.", "**Compiler vs interpreter**.", "**Bytecode and virtual machines**.", "**In exam questions**, including the 12-mark essay.", "**Exam toolkit**."] },

    { page: "The three translators" },
    { kv: [
      ["Source code", "the program as written by the programmer, in an HLL or assembly language — human-readable"],
      ["Object (executable) code", "the translated program in **machine code** that the processor can execute"],
      ["Why translate?", "the processor can **only execute machine code**; HLL and assembly instructions cannot be executed directly"]
    ] },
    { table: { head: ["Translator", "Input", "Output", "How"], rows: [
      ["Assembler", "assembly language (mnemonics)", "machine / object code", "**one-to-one**: each assembly instruction becomes one machine code instruction"],
      ["Compiler", "HLL source code", "object code (or bytecode)", "analyses and translates the **whole program** before any of it runs; **one-to-many** (one statement → many instructions)"],
      ["Interpreter", "HLL source code", "**no object code**", "analyses **one statement at a time** and executes it by **calling subroutines within its own code**"]
    ] } },
    transFig("Compile once and run the object code; interpret on every run; or compile to bytecode for a virtual machine."),
    { callout: { t: "miscon", h: "\"An interpreter translates each line into machine code and runs it\"", body: "The AQA model: an interpreter **does not produce machine code**. It analyses the statement and **calls its own (already compiled) routines** to carry it out. That is why it must be present every run." } },
    { callout: { t: "miscon", h: "Assembler vs compiler", body: "**Similarity**: both convert source code into object / machine code. **Difference**: an assembler takes simple mnemonics and maps them **one-to-one**; a compiler takes complex HLL statements, each producing **many** machine instructions." } },

    { page: "Compiler vs interpreter" },
    { table: { head: ["", "Compiler", "Interpreter"], rows: [
      ["Translates", "the whole source code at once, before execution", "line by line / statement by statement, during execution"],
      ["Output", "object code / executable file", "none — executes directly"],
      ["Errors", "reports all errors; **no executable** if any error", "runs until the **first error** — the correct parts before it execute"],
      ["Repeat runs", "translated **once**; the executable runs again without translating", "translated **every time** it is run — and a statement in a loop is re-analysed every iteration"],
      ["Execution speed", "**faster** — object code runs directly", "slower — analysis happens at run time"],
      ["Needed at run time", "neither compiler nor source code", "**both** the interpreter and the source code"],
      ["Portability", "executable runs only on the **same processor / instruction set**", "**more portable** — any machine with the interpreter"],
      ["Source code privacy", "distribute only the executable — source hidden", "the source must be distributed"]
    ] } },
    { h: "Situations" },
    { table: { head: ["Choose a compiler when…", "Choose an interpreter when…"], rows: [
      ["the program will be run many times / must run fast", "developing and debugging — test a line at a time, run partial programs"],
      ["selling software without revealing source code", "the same program must run on many platforms"],
      ["the target machine has no translator installed", "learning to program; scripting short tasks"]
    ] } },
    { callout: { t: "warn", h: "One-sided answers", body: "In \"describe two differences\", each mark is a **difference** — say what each translator does: \"a compiler translates the whole program before execution **whereas** an interpreter translates and executes it line by line\". AS 2017: **MAX 3 if all points are about one translator**." } },

    { page: "Bytecode and virtual machines" },
    { callout: { t: "def", h: "Intermediate language / bytecode", body: "Some compilers output an **intermediate language** (Java bytecode, .NET CIL) instead of machine code for one processor. It is **not** directly executable by the hardware." } },
    { steps: [
      "The source code is compiled **once** into bytecode.",
      "The bytecode is distributed to any platform that has the **virtual machine** for its processor.",
      "On each machine, the virtual machine either **interprets** the bytecode an instruction at a time (calling its own routines to perform each command), or a **just-in-time (JIT) compiler** translates it into machine code for that processor as it runs.",
      "Each processor instruction set has its **own** virtual machine — the bytecode is the same everywhere."
    ] },
    { table: { head: ["Why produce bytecode?", "Mark-scheme wording"], rows: [
      ["portability", "processor / platform independence // the target platform may not be known"],
      ["translate once", "the compiler only translates the source once but the bytecode runs on a variety of platforms"],
      ["security", "the virtual machine can check the bytecode before / without executing it"],
      ["size", "(may lead to) smaller files"]
    ] } },
    { callout: { t: "miscon", h: "\"The compiler runs the bytecode\"", body: "**R.** any suggestion that something other than the **virtual machine** (interpreter / JIT compiler) carries out the final translation. Max 1 if your answer shows no concept of translation." } },
    { callout: { t: "tip", h: "Side by side: \"virtual machine\" twice", body: "The **OS as a virtual machine** (4.6.1.4) hides the hardware behind a simpler interface. A **bytecode virtual machine** is a program that executes an intermediate instruction set. Same idea — an imagined machine implemented in software — different jobs." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Two differences", src: "AS June 2016 · P2 Q09.3 · 2 marks",
      q: "A program written in a high-level language needs to be translated using either a compiler or an interpreter before it can be executed. Describe two differences between a compiler and an interpreter.",
      steps: [
        { m: "A compiler produces object / machine code (an executable file) whilst an interpreter does not // compiled code need not be recompiled, whereas an interpreter translates the code every time it is run;", mk: "1 mark" },
        { m: "A compiler translates the whole source code into object code before execution, whilst an interpreter translates and executes it line by line;", mk: "1 mark", n: "Also: compiled object code executes faster; an interpreter can run correct parts while there are syntax errors elsewhere. MAX 2." }
      ], result: "Object code vs none; whole vs line by line" } },
    { worked: { tag: "exam", title: "Explain the differences (4 marks)", src: "AS June 2017 · P2 Q04.1 · 4 marks",
      q: "Explain the differences between an interpreter and a compiler.",
      steps: [
        { m: "A compiler produces object code / an executable file; an interpreter does not produce any object code;", mk: "1 mark" },
        { m: "A compiler translates the whole source code at once; an interpreter analyses the code line by line;", mk: "1 mark" },
        { m: "A compiler will not produce an executable if an error is encountered; an interpreter runs the program up to the first error;", mk: "1 mark" },
        { m: "Interpreted code executes more slowly; when running interpreted code the interpreter (and source) must always be present, whereas a compiled program needs neither;", mk: "1 mark", n: "Also: compiled code only runs on the same processor type; interpreted code is more portable. MAX 3 if all points are about one translator." }
      ], result: "Four contrasted points" } },
    { worked: { tag: "exam", title: "Why output bytecode?", src: "AS June 2018 · P2 Q11.1 · 1 mark",
      q: "Some compilers produce intermediate code such as bytecode as their final output whilst others produce executable code. Explain why some compilers produce bytecode as the final output instead of executable code.",
      steps: [{ m: "The code may need to run on multiple platforms // the target platform may not be known // so it is platform independent;", mk: "1 mark", n: "A. portable with some explanation. A. smaller file sizes." }], result: "Platform independence" } },
    { worked: { tag: "exam", title: "How bytecode is executed", src: "AS June 2018 · P2 Q11.2 · 2 marks",
      q: "Describe how bytecode programs are executed after the bytecode has been produced.",
      steps: [
        { m: "A virtual machine;", mk: "1 mark" },
        { m: "performs just-in-time compilation to convert the bytecode to object code and execute it // interprets the bytecode an instruction at a time, running its own code to carry out each command;", mk: "1 mark", n: "MAX 1 if no concept of translation. R. anything other than the VM doing the translation." }
      ], result: "A VM interprets / JIT-compiles it" } },
    { worked: { tag: "exam", title: "Using intermediate language code", src: "AS June 2022 · P2 Q06.3 · 2 marks",
      q: "Some compilers translate source code into an intermediate language rather than producing an executable file. Explain how intermediate language code is used after it has been generated.",
      steps: [
        { m: "Software must be used to finish the translation on the computer running the program — a virtual machine / JIT compiler;", mk: "1 mark" },
        { m: "which interprets / translates the bytecode into machine code for the processor it is executing on (each architecture has its own virtual machine);", mk: "1 mark" }
      ], result: "Finished by a VM on each machine" } },
    { worked: { tag: "exam", title: "One reason for intermediate language", src: "AS June 2022 · P2 Q06.4 · 1 mark",
      q: "Give one reason why some compilers produce their final output in an intermediate language instead of machine code.",
      steps: [{ m: "Allows processor / platform independence — the source is compiled once but the bytecode runs on a variety of platforms;", mk: "1 mark", n: "A. the VM can perform security checks on the code without executing it." }], result: "Portability" } },
    { worked: { tag: "exam", title: "Assembler vs compiler", src: "AS June 2019 · P2 Q10.3 · 2 marks",
      q: "Assemblers and compilers are two different types of translator. Describe one similarity and one difference between the role of an assembler and the role of a compiler.",
      steps: [
        { h: "Similarity", m: "Both convert source code into object code;", mk: "1 mark" },
        { h: "Difference", m: "An assembler takes assembly code / simple mnemonics as input, while a compiler takes complex instructions / HLL code;", mk: "1 mark" }
      ], result: "Both → object code; mnemonics vs HLL" } },
    { worked: { tag: "exam", title: "Role of an assembler", src: "AS June 2025 · P2 Q06.5 · 2 marks",
      q: "Describe the role of an assembler and explain why an assembler is needed.",
      steps: [
        { h: "Role", m: "Translates assembly code / language into machine / executable code;", mk: "1 mark" },
        { h: "Why", m: "Computers cannot execute assembly language directly // can only execute machine / object code;", mk: "1 mark" }
      ], result: "Assembly → machine code, which is all a CPU runs" } },
    { worked: { tag: "exam", title: "Assembly to machine code", src: "A-level June 2022 · P2 Q09.5 · 1 mark",
      q: "The program will be translated into machine code. Explain the relationship between an assembly language instruction and a machine code instruction.",
      steps: [{ m: "There is a one-to-one mapping // each assembly language instruction translates into one machine code instruction;", mk: "1 mark" }], result: "One-to-one" } },
    { worked: { tag: "exam", title: "Translate and execute (12-mark essay)", src: "A-level June 2019 · P2 Q05 · 12 marks",
      q: "A student has written a program in an imperative high-level language that could be translated by either a compiler or an interpreter. Describe the steps that must be completed to translate and execute the program, including: why translation is necessary; the differences between how a compiler and an interpreter would translate the program; how the machine code instructions are fetched and executed by the processor from main memory.",
      steps: [
        { h: "1 · Why translate", m: "The processor can only execute machine code instructions; HLL instructions are not machine code and cannot be executed directly.", mk: "area 1 — one point = good" },
        { h: "2 · Compiler", m: "A compiler analyses the program as a whole and produces object code (an executable file, or bytecode for a VM). If it finds an error it translates none of the program. An unchanged program run many times is translated only once, and the compiler need not be present to run it — but the object code runs only on one type of processor.", mk: "area 2" },
        { h: "2 · Interpreter", m: "An interpreter analyses the program line by line and executes each line immediately, by calling subroutines within its own code. It runs until the first error, translates the program every time it is executed, may translate the same instruction many times (in a loop), and must always be present.", mk: "area 2 — four points = good" },
        { h: "3 · Fetch", m: "The PC's contents are copied to the MAR; the address bus carries the address to main memory; the instruction travels on the data bus into the MBR; the PC is incremented; the MBR is copied to the CIR.", mk: "area 3" },
        { h: "3 · Decode", m: "The control unit decodes the instruction in the CIR, splitting it into opcode and operand.", mk: "area 3" },
        { h: "3 · Execute", m: "The opcode identifies the operation; data is fetched or stored if needed; the ALU performs the operation; the result goes to a register / accumulator; the status register is updated; a branch updates the PC. (If interpreted, the instructions executed are the interpreter's own.)", mk: "area 3 — five points across ≥2 stages = good" },
        { m: "Organise the essay as three headed paragraphs — the examiner looks for a coherent, logically structured line of reasoning.", mk: "10–12: all three areas, good understanding of all", n: "7–9: good on at least two areas · 4–6: good on one or limited on two · 1–3: a few unstructured points." }
      ], result: "Cover all three areas in depth" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe / explain the differences", "Contrast BOTH translators in every point — \"…whereas…\"."],
      ["Explain why bytecode", "Platform independence (compile once, run on many)."],
      ["Describe how bytecode is executed", "Virtual machine + interprets / JIT-compiles into machine code for this processor."],
      ["Describe similarity and difference", "Similarity: both produce object code. Difference: mnemonics 1:1 vs HLL 1:many."],
      ["12-mark describe", "Three headed areas: why translate; compiler vs interpreter (≥4 points); FDE (≥5 points, ≥2 stages)."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "Compiler = \"WOFF\": Whole, Object code, Faster, Forget the source", body: "Interpreter = \"LINE\": **L**ine by line, **I**nterpreter needed every run, **N**o object code, **E**rrors stop it at the first one." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"An interpreter runs through / reads the code\" — R.; say *analyses / translates*.", "Saying the compiler or CPU executes bytecode directly — R.", "One-sided differences (MAX 3).", "Forgetting that an assembler maps one-to-one."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.2.1 why HLLs need translating; 4.7.3.2 the fetch-execute cycle (the essay's third area); 4.7.3.3 machine code format; 4.6.1.4 the OS virtual machine vs the bytecode VM; 4.4.2 syntax — compilers check source against a grammar (BNF)." } }
  ],
  flashcards: [
    ["Why must programs be translated?", "The processor can only execute machine code."],
    ["Source code vs object code?", "Human-readable program as written vs translated machine code the processor executes."],
    ["How does a compiler translate?", "The whole program at once, producing object code before execution.", 3],
    ["How does an interpreter execute?", "Analyses one statement at a time and calls its own subroutines to carry it out; no object code.", 4],
    ["Compiled vs interpreted on an error?", "Compiler: no executable produced. Interpreter: runs up to the first error.", 5],
    ["Which runs faster once translated?", "Compiled object code.", 6],
    ["Which needs the source and translator at run time?", "Interpreted programs.", 7],
    ["Why do some compilers produce bytecode?", "Platform independence — compile once, run on any machine with a VM.", 8],
    ["How is bytecode executed?", "By a virtual machine: interpreted, or JIT-compiled to machine code for that processor.", 9],
    ["Assembler vs compiler similarity?", "Both convert source into object code.", 10]
  ],
  quiz: [
    { q: "Which produces NO object code?", opts: ["interpreter", "compiler", "assembler", "linker"], ans: 0, why: "Executes directly." },
    { q: "Assembly → machine code mapping is", opts: ["one-to-one", "one-to-many", "many-to-one", "none"], ans: 0, why: "Each mnemonic = one instruction." },
    { q: "Bytecode is executed by", opts: ["a virtual machine", "the compiler", "the assembler", "the CPU directly"], ans: 0, why: "Interpret / JIT." },
    { q: "A reason to choose an interpreter is", opts: ["easier debugging — runs up to the first error", "faster execution", "source code hidden", "no software needed at run time"], ans: 0, why: "Development." },
    { q: "Which translator is needed only once for many runs?", opts: ["compiler", "interpreter", "both", "neither"], ans: 0, why: "Executable reused." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
