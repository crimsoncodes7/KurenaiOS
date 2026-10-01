/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.7.1.1"] = {
  "notes": [
    { "h": "Internal Hardware Components" },
    {
      "callout": {
        "t": "def",
        "h": "Address Bus",
        "body": "Carries **memory addresses** from the CPU to RAM/I/O devices. **Unidirectional** (CPU → Memory only). Width determines the maximum addressable memory: a 32-bit address bus can address $2^{32}$ = 4 GB."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Data Bus",
        "body": "Carries **data and instructions** between the CPU, memory, and I/O devices. **Bidirectional** (reads and writes). Width (e.g. 64-bit) determines how much data can be transferred per cycle."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Control Bus",
        "body": "Carries **control signals** to coordinate the system: clock pulses, read/write signals, interrupt requests, memory enable. **Bidirectional** — signals go both to and from the CPU."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Bus Width Affects Performance",
        "body": "Wider buses = more data transferred per cycle = faster system. A 64-bit data bus transfers twice as much per cycle as a 32-bit bus. Similarly, a wider address bus = access to more RAM."
      }
    },
    { "h": "Bus Comparison" },
    {
      "table": {
        "head": [
          "Bus Name",
          "Direction",
          "Content"
        ],
        "rows": [
          [
            "Address",
            "Unidirectional (CPU -> RAM)",
            "Memory Locations"
          ],
          [
            "Data",
            "Bi-directional",
            "Actual Instructions / Values"
          ],
          [
            "Control",
            "Bi-directional",
            "Commands and Synchronization"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "The Stored Program Concept",
        "body": "Machine code instructions and data are stored together in the **same memory (RAM)**. The CPU fetches instructions one at a time and executes them serially. A new program can be loaded into the same memory space to give the computer new behaviour — no hardware rewiring needed."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "The Von Neumann Bottleneck",
        "body": "Because instructions and data share the **same bus**, the CPU must alternate between fetching instructions and fetching data — it cannot do both simultaneously. This limits throughput. Harvard architecture solves this with separate buses."
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Register Transfer Notation (Overview)",
        "src": "[MAR] <- [PC]\n[PC] <- [PC] + 1\n[MBR] <- [Memory]addr"
      }
    },
    {
      "h": "Harvard vs Von Neumann"
    },
    {
      "table": {
        "head": [
          "Feature",
          "Von Neumann",
          "Harvard"
        ],
        "rows": [
          [
            "Architecture",
            "Shared memory/bus for data & code",
            "Separate memories/buses for data & code"
          ],
          [
            "Efficiency",
            "Simpler, but leads to 'Bottleneck'",
            "Faster due to parallel fetching"
          ],
          [
            "Common Use",
            "Desktop PCs / Laptops",
            "Embedded Systems (DSPs)"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "The Three Buses",
        "body": "**Address bus**: unidirectional (CPU→memory only), carries memory addresses; wider = more addressable RAM. **Data bus**: bidirectional, carries data and instructions; wider = more data per cycle. **Control bus**: bidirectional, carries control signals (clock, read/write, interrupt request). Von Neumann **bottleneck**: instructions and data share the same bus, so they cannot be fetched simultaneously."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Bus Misconceptions",
        "body": "**The address bus and data bus carry the same information** — No: the address bus carries memory locations (where to look) and is unidirectional; the data bus carries actual data/instructions (what was found) and is bidirectional. **A wider address bus increases data transfer speed** — No, it increases how much RAM can be addressed; data transfer speed depends on the data bus width and clock speed."
      }
    }
  ],
  "flashcards": [
    [
      "What does the address bus do?",
      "Carries memory addresses from the CPU to memory or I/O. It is unidirectional."
    ],
    [
      "What is the data bus?",
      "A bi-directional bus that carries data and instructions between CPU, memory, and I/O."
    ],
    [
      "What is the Stored Program Concept?",
      "Instructions are stored in main memory and executed serially by the processor."
    ],
    [
      "What is a key feature of Von Neumann architecture?",
      "Data and instructions share the same memory space and buses."
    ],
    [
      "What is a key feature of Harvard architecture?",
      "Data and instructions are stored in separate memory units with separate buses."
    ],
    [
      "What is carried on the address bus, and in which direction?",
      "The memory address the CPU wants to access; unidirectional (CPU → memory)."
    ],
    [
      "What is carried on the data bus?",
      "The actual data/instructions transferred between CPU and memory (bidirectional)."
    ],
    [
      "What does the control bus carry?",
      "Control and timing signals (read/write, clock, interrupt) that coordinate the components."
    ]
  ],
  "quiz": [
    {
      "q": "Which bus is unidirectional?",
      "opts": [
        "Data Bus",
        "Control Bus",
        "Address Bus",
        "System Bus"
      ],
      "ans": 2,
      "why": "Addresses are only sent from the CPU to memory/IO, not the other way."
    },
    {
      "q": "Which architecture separates data memory and instruction memory?",
      "opts": [
        "Von Neumann",
        "Harvard",
        "Stored Program",
        "Turing"
      ],
      "ans": 1,
      "why": "Harvard architecture uses separate buses and memory for data and instructions."
    },
    {
      "q": "What does the control bus do?",
      "opts": [
        "Carries actual data",
        "Carries memory addresses",
        "Transmits control signals like read/write and clock pulses",
        "Connects peripheral devices only"
      ],
      "ans": 2,
      "why": "The control bus manages access to and use of the data and address lines."
    },
    {
      "q": "What characterizes the stored program concept?",
      "opts": [
        "Hardware must be rewired for new tasks",
        "Programs are stored in memory and executed serially",
        "Uses only ROM",
        "Instructions are stored on hard drives during execution"
      ],
      "ans": 1,
      "why": "Programs reside in main memory alongside data and are fetched/executed sequentially."
    },
    {
      "q": "Widening the address bus directly increases...?",
      "opts": ["clock speed", "the amount of memory that can be addressed", "the data transfer width", "the cache size"],
      "ans": 1,
      "why": "More address lines means more unique addresses, so more memory can be addressed (2^width locations)."
    }
  ],
  "exam": [
    {
      "q": "State two differences between Harvard and Von Neumann architectures.",
      "marks": 2,
      "ms": [
        "Harvard has separate memories for data and instructions, Von Neumann uses the same memory (1)",
        "Harvard has separate buses for data and instructions, Von Neumann uses the same buses (1)"
      ]
    },
    {
      "q": "State the function of the address bus, the data bus and the control bus.",
      "marks": 3,
      "ms": [
        "Address bus: carries the address of the memory location to access (1)",
        "Data bus: carries the data/instructions to and from memory (1)",
        "Control bus: carries control and timing signals (read/write, clock, interrupt) (1)"
      ]
    },
    {
      "q": "Explain how the processor, main memory and the three buses work together to fetch and execute an instruction.",
      "marks": 6,
      "ms": [
        "The processor places the required address on the ADDRESS bus (1)",
        "A read signal on the CONTROL bus tells memory to fetch (1)",
        "Main memory returns the instruction on the DATA bus to the processor (1)",
        "The control unit decodes the instruction (1)",
        "Any data operands are fetched the same way (address → control → data bus) (1)",
        "The cycle repeats serially under the clock — the von Neumann stored-program model (1)"
      ]
    }
  ]
};

C["compsci:4.7.2.1"] = {
  "notes": [
    {
      "h": "The Stored Program Concept"
    },
    {
      "callout": {
        "t": "def",
        "h": "Core Principle",
        "body": "The stored program concept states that machine code instructions and data are stored together in the same main memory (RAM). The processor then fetches these instructions serially (one after another) to execute them."
      }
    },
    {
      "h": "Von Neumann Architecture"
    },
    {
      "callout": {
        "t": "info",
        "h": "The Foundation",
        "body": [
          {
            "kv": [
              [
                "Shared Memory",
                "A single memory space for both instructions and data."
              ],
              [
                "Shared Bus",
                "A single control, address, and data bus system for all access."
              ],
              [
                "Serial Execution",
                "Instructions are processed one at a time in a linear sequence."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "The Von Neumann Bottleneck"
    },
    {
      "callout": {
        "t": "warn",
        "h": "Performance Limit",
        "body": "Because instructions and data share the same bus, the CPU often has to wait for one to finish being fetched before it can fetch the other. This 'bottleneck' limits the overall speed of the system."
      }
    },
    {
      "h": "How it Works in Practice"
    },
    {
      "steps": [
        {
          "h": "Loading",
          "m": "The operating system copies the program's machine code and data from secondary storage (HDD/SSD) into RAM, where the CPU can access it at speed.",
          "n": "The program (set of instructions) is loaded from secondary storage into RAM."
        },
        {
          "h": "Pointing",
          "m": "The OS sets the Program Counter to hold the memory address of the first instruction of the loaded program.",
          "n": "The Program Counter (PC) is set to the address of the first instruction."
        },
        {
          "h": "Cycling",
          "m": "The CPU repeatedly fetches the instruction at the address in the PC, decodes it, and executes it — incrementing the PC each cycle — until a halt or end condition is reached.",
          "n": "The CPU begins the Fetch-Execute cycle, repeating it until the program ends."
        }
      ]
    },
    {
      "code": {
        "lang": "asm",
        "cap": "Data and Instructions in Memory",
        "src": "; Address | Content | Interpretation\n; 0001    | 011010 | Instruction (LDR R0, 10)\n; 0002    | 011111 | Instruction (ADD R0, #5)\n; ...     | ...    | ...\n; 0010    | 000011 | Data (The value 3)"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Stored Program Concept",
        "body": "Machine code **instructions and data are stored together in the same RAM**. The CPU fetches and executes instructions **serially** (one at a time) via the fetch-execute cycle. The **Program Counter (PC)** holds the address of the next instruction. Von Neumann **bottleneck**: instructions and data share the same bus, so they cannot be fetched simultaneously — Harvard architecture solves this with separate buses."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Stored Program Misconceptions",
        "body": "**The CPU can tell the difference between data and instructions by looking at the bits** — In Von Neumann architecture the CPU cannot distinguish; it treats whatever the PC points to as an instruction. **Instructions are stored in ROM** — User program instructions are loaded into RAM; ROM holds firmware/BIOS. The stored program concept specifically requires RAM (which is rewritable, so any program can be loaded)."
      }
    }
  ],
  "flashcards": [
    [
      "What is the stored program concept?",
      "Instructions and data are stored in the same main memory and executed serially."
    ],
    [
      "Who is the architecture named after?",
      "John von Neumann."
    ],
    [
      "What is a major disadvantage of Von Neumann architecture?",
      "The Von Neumann bottleneck (shared bus for data and instructions)."
    ],
    [
      "In this concept, where are instructions fetched from?",
      "Main memory (RAM)."
    ],
    [
      "How does the CPU distinguish between data and instructions?",
      "It doesn't inherently; it treats whatever the Program Counter points to as an instruction."
    ],
    [
      "State the stored program concept.",
      "Both program instructions AND data are held in main memory; the processor fetches and executes the instructions serially."
    ],
    [
      "Why was the stored program concept revolutionary?",
      "The same machine can run any program by loading different instructions into memory — no rewiring needed."
    ],
    [
      "In what order are instructions executed by default?",
      "Serially / sequentially, one at a time in memory order, unless a branch changes the flow."
    ]
  ],
  "quiz": [
    {
      "q": "Where are instructions stored in a Von Neumann machine?",
      "opts": [
        "In a separate instruction ROM",
        "In the same RAM as data",
        "In the CPU registers only",
        "On the hard drive"
      ],
      "ans": 1,
      "why": "Shared memory is the defining feature."
    },
    {
      "q": "What is the 'Von Neumann Bottleneck'?",
      "opts": [
        "The CPU is too small",
        "The data bus is faster than the CPU",
        "Instructions and data must share the same bus",
        "The hard drive is too slow"
      ],
      "ans": 2,
      "why": "Sharing the bus creates a queue for access."
    },
    {
      "q": "Which component holds the address of the next instruction in this concept?",
      "opts": [
        "Program Counter",
        "Accumulator",
        "Instruction Register",
        "ALU"
      ],
      "ans": 0,
      "why": "The PC tracks the execution flow."
    },
    {
      "q": "True or False: In the stored program concept, instructions are executed in parallel.",
      "opts": [
        "True",
        "False"
      ],
      "ans": 1,
      "why": "Instructions are executed serially (one at a time)."
    },
    {
      "q": "In the stored program concept, where are machine-code instructions held before execution?",
      "opts": ["on the hard disk only", "in main memory (RAM)", "in the ALU", "on the data bus"],
      "ans": 1,
      "why": "Instructions are stored in main memory and fetched from there by the processor."
    }
  ],
  "exam": [
    {
      "q": "Explain the meaning of the stored program concept.",
      "marks": 3,
      "ms": [
        "Instructions and data are stored in the same main memory (1)",
        "Instructions are fetched and executed serially (1)",
        "By the processor/CPU (1)"
      ]
    },
    {
      "q": "Describe the stored program concept.",
      "marks": 3,
      "ms": [
        "Machine-code instructions are stored in main memory (1)",
        "They are fetched and executed serially / one at a time by the processor (1)",
        "The processor performs the arithmetic and logical operations they specify (1)"
      ]
    },
    {
      "q": "Discuss the significance of the stored program concept for the design and flexibility of modern computers.",
      "marks": 6,
      "ms": [
        "Instructions and data are both held in main memory (1)",
        "The processor fetches and executes instructions in sequence (1)",
        "A computer can run ANY program simply by loading different instructions — no rewiring (1)",
        "This makes general-purpose computers possible (1)",
        "It underpins the fetch-execute cycle and the von Neumann architecture (1)",
        "Limitation: the shared bus (von Neumann bottleneck) limits the rate of fetching (1)"
      ]
    }
  ]
};

C["compsci:4.7.3.1"] = {
  "sims": [
    "cpu-fetch-execute"
  ],
  "notes": [
    {
      "h": "Processor Components"
    },
    {
      "callout": {
        "t": "def",
        "h": "Internal Units",
        "body": [
          {
            "kv": [
              [
                "ALU",
                "Performs math and logic operations."
              ],
              [
                "Control Unit",
                "Decodes instructions and synchronizes hardware."
              ],
              [
                "Registers",
                "Small, fast internal storage locations."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Dedicated Registers"
    },
    {
      "callout": {
        "t": "def",
        "h": "Register Roles",
        "body": [
          {
            "kv": [
              [
                "PC",
                "Holds address of NEXT instruction."
              ],
              [
                "CIR",
                "Holds CURRENT instruction."
              ],
              [
                "MAR",
                "Holds address to be accessed in RAM."
              ],
              [
                "MBR (MDR)",
                "Holds data traveling to/from RAM."
              ],
              [
                "Status Register",
                "Holds flags (Carry, Overflow, Zero)."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Comparing Register Functions"
    },
    {
      "table": {
        "head": [
          "Register",
          "Primary Content",
          "Direction"
        ],
        "rows": [
          [
            "MAR",
            "Memory Address",
            "Into the Address Bus"
          ],
          [
            "MBR",
            "Data / Instruction",
            "To/From Data Bus"
          ],
          [
            "PC",
            "Memory Address",
            "Increments each cycle"
          ]
        ]
      }
    },
    {
      "h": "The Fetch-Execute Cycle"
    },
    {
      "diagram": "cpu-fetch-execute"
    },
    {
      "steps": [
        {
          "h": "Fetch",
          "m": "The PC's address is copied to the MAR; the instruction at that memory location travels via the data bus into the MBR, then into the CIR. The PC is incremented to point to the next instruction.",
          "n": "Copy PC to MAR. Fetch instruction via MBR. Load into CIR. Increment PC."
        },
        {
          "h": "Decode",
          "m": "The Control Unit interprets the instruction in the CIR, identifying the opcode (the operation to perform) and the operand (the data or memory address to use).",
          "n": "Control Unit splits CIR content into Opcode and Operand."
        },
        {
          "h": "Execute",
          "m": "The ALU performs the arithmetic or logic operation, or data is transferred between registers, or the PC is set to a new address for a branch/jump instruction.",
          "n": "ALU performs operation or data is moved as requested."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Fetch Step Register Notation",
        "src": "MAR <- [PC]\nMBR <- [Memory]MAR\nCIR <- [MBR]\nPC  <- [PC] + 1"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Register Roles — One-Line Each",
        "body": [{"kv": [
          ["PC", "Address of the **next** instruction to fetch."],
          ["MAR", "Address placed on the **address bus** for the current memory access."],
          ["MBR/MDR", "Data travelling **to or from** RAM via the data bus."],
          ["CIR", "The instruction currently being **decoded and executed**."],
          ["Status Reg", "Flags (Zero, Carry, Overflow) set by the **ALU** after each operation."]
        ]}]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common Misconceptions",
        "body": "The PC does **not** hold the current instruction — that is the CIR. The PC always holds the address of the **next** instruction. Also: PC increments **during** Fetch (before Execute), not after."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Exam Technique: Register Transfer Questions",
        "body": "Always name the **source**, the **bus used**, and the **destination**. E.g. 'Contents of PC copied to MAR; address placed on address bus; instruction fetched via data bus into MBR; MBR copied to CIR; PC incremented.' Each of these sub-steps is a separate mark point."
      }
    }
  ],
  "flashcards": [
    [
      "What does the ALU do?",
      "Performs arithmetic (math) and logical (comparisons, AND/OR) operations."
    ],
    [
      "What is the purpose of the Program Counter (PC)?",
      "Holds the memory address of the next instruction to be fetched."
    ],
    [
      "What does the MAR hold?",
      "The memory address from which data is to be fetched, or to which data is to be written."
    ],
    [
      "What happens during the decode phase?",
      "The Control Unit decodes the instruction in the CIR into an opcode and operand."
    ],
    [
      "How are interrupts handled?",
      "At the end of the F-E cycle, registers are pushed to the stack, and the PC is set to the ISR address."
    ],
    [
      "What is the Status Register?",
      "Holds flags indicating the outcome of the last ALU operation (e.g., carry, zero, overflow)."
    ],
    [
      "What is the purpose of the system clock?",
      "To generate regular electrical pulses that synchronize the components of the computer."
    ],
    [
      "What is the difference between the MAR and the MBR?",
      "MAR holds a memory address (goes on the address bus); MBR holds actual data or instructions (goes on the data bus)."
    ],
    [
      "When exactly does the PC increment during the F-E cycle?",
      "During the Fetch stage, immediately after the instruction address is copied to the MAR — before Execute."
    ]
  ],
  "quiz": [
    {
      "q": "Which register holds the current instruction being executed?",
      "opts": [
        "PC",
        "MAR",
        "CIR",
        "MBR"
      ],
      "ans": 2,
      "why": "CIR stands for Current Instruction Register."
    },
    {
      "q": "What is checked at the very end of the Fetch-Execute cycle?",
      "opts": [
        "PC value",
        "Interrupts",
        "Memory capacity",
        "Clock speed"
      ],
      "ans": 1,
      "why": "Before starting a new cycle, the CPU checks if any interrupts are pending."
    },
    {
      "q": "Which component decodes instructions?",
      "opts": [
        "ALU",
        "Control Unit",
        "Buses",
        "Registers"
      ],
      "ans": 1,
      "why": "The CU interprets the opcode to determine what actions to take."
    },
    {
      "q": "Where is the data stored immediately after being fetched from memory?",
      "opts": [
        "MAR",
        "PC",
        "MBR (MDR)",
        "CIR"
      ],
      "ans": 2,
      "why": "Data travels from memory across the data bus into the Memory Buffer Register."
    },
    {
      "q": "What happens to register contents when an interrupt is serviced?",
      "opts": [
        "They are deleted",
        "They are pushed onto the system stack",
        "They are moved to secondary storage",
        "They remain in the CPU"
      ],
      "ans": 1,
      "why": "The context must be saved on the stack so the program can resume later."
    },
    {
      "q": "What is an opcode?",
      "opts": [
        "The data to be operated on",
        "The part of the instruction that specifies the operation to perform",
        "A memory address",
        "An interrupt signal"
      ],
      "ans": 1,
      "why": "Opcode = operation code."
    }
  ],
  "exam": [
    {
      "q": "Describe the Fetch stage of the Fetch-Execute cycle using register notation.",
      "marks": 4,
      "ms": [
        "Contents of PC copied to MAR (1)",
        "Address bus used to locate memory address, read signal sent on control bus (1)",
        "Contents of memory location copied to MBR via data bus (1)",
        "Contents of MBR copied to CIR AND PC is incremented (1)"
      ]
    },
    {
      "q": "Explain the role of the stack when an interrupt occurs.",
      "marks": 2,
      "ms": [
        "The current volatile environment (registers/PC) is pushed onto the stack (1)",
        "So that the interrupted program can be resumed later after the ISR finishes (1)"
      ]
    },
    {
      "q": "Explain the roles of the ALU, the control unit, the clock and the registers in the operation of a processor.",
      "marks": 6,
      "ms": [
        "ALU: performs arithmetic and logical/bitwise operations (1)",
        "Control unit: decodes instructions and coordinates/sequences the other components (1)",
        "Clock: generates regular pulses that synchronise operations (1)",
        "Program Counter holds the address of the next instruction (1)",
        "Current Instruction Register holds the instruction being decoded/executed (1)",
        "MAR/MBR hold the address/data for memory transfers (1)"
      ]
    }
  ]
};

C["compsci:4.7.3.2"] = {
  "sims": [
    "cpu-fetch-execute"
  ],
  "notes": [
    {
      "h": "Detailed Fetch-Execute Cycle"
    },
    {
      "callout": {
        "t": "def",
        "h": "The Heartbeat of the CPU",
        "body": "The Fetch-Execute cycle is the continuous process by which the CPU retrieves, interprets, and carries out instructions. Each stage involves precise movements between internal registers."
      }
    },
    {
      "h": "The 3 Main Stages"
    },
    {
      "callout": {
        "t": "info",
        "h": "Register-by-Register Breakdown",
        "body": [
          {
            "kv": [
              [
                "Fetch",
                "Getting the instruction from RAM into the CPU."
              ],
              [
                "Decode",
                "The Control Unit figuring out what the instruction means."
              ],
              [
                "Execute",
                "Carrying out the instruction using the ALU or data paths."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Step-by-Step Register Movements"
    },
    {
      "steps": [
        {
          "h": "MAR <- [PC]",
          "m": "The address currently held in the Program Counter is copied into the Memory Address Register, targeting the correct memory location to fetch from.",
          "n": "The address of the next instruction is copied from the Program Counter to the Memory Address Register."
        },
        {
          "h": "PC <- [PC] + 1",
          "m": "The Program Counter is immediately incremented so it already points to the next sequential instruction — ready for the following cycle.",
          "n": "The Program Counter is incremented to point to the address of the next sequential instruction."
        },
        {
          "h": "MBR <- [Memory]MAR",
          "m": "The address in MAR is placed on the address bus; a read signal is sent on the control bus; the instruction at that RAM location travels via the data bus into the MBR.",
          "n": "The instruction at the address in MAR is fetched from RAM and placed in the Memory Buffer Register."
        },
        {
          "h": "CIR <- [MBR]",
          "m": "The instruction is copied from the MBR into the Current Instruction Register, freeing the MBR for any data operands that follow.",
          "n": "The instruction is copied from the MBR to the Current Instruction Register for decoding."
        },
        {
          "h": "Decode",
          "m": "The Control Unit examines the opcode portion of the CIR to determine what operation is required and whether a further memory access is needed for the operand.",
          "n": "The Control Unit splits the instruction in CIR into Opcode and Operand."
        },
        {
          "h": "Execute",
          "m": "The instruction is carried out: the ALU computes a result, a value is moved between registers or memory, or the PC is overwritten with a branch target address.",
          "n": "The CPU performs the operation (e.g., ALU calculation, data move, or branch)."
        }
      ]
    },
    {
      "diagram": "cpu-fetch-execute"
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Register Transfer Notation (RTN)",
        "src": "FETCH:\n  MAR ← [PC]\n  PC ← [PC] + 1\n  MBR ← [Memory]addr\n  CIR ← [MBR]\n\nDECODE:\n  CU ← [CIR] (Opcode)\n\nEXECUTE:\n  IF Opcode == 'ADD' THEN ALU ← [Reg] + [Operand]"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Fetch-Execute Steps in Order",
        "body": "**Fetch**: (1) MAR ← [PC]; (2) PC ← PC+1; (3) MBR ← Memory[MAR] via address bus + data bus; (4) CIR ← [MBR]. **Decode**: Control Unit extracts opcode + operand from CIR. **Execute**: ALU performs operation, data is moved, or PC is overwritten for a branch. The PC increments during Fetch (step 2) — NOT at the end of Execute."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "F-E Cycle Misconceptions",
        "body": "**The PC is incremented at the end of the Execute stage** — No; the PC is incremented immediately after MAR is loaded (step 2 of Fetch), before decoding or executing. **The MBR holds the address of the instruction** — No; the MAR holds the address (it goes on the address bus); the MBR holds the actual instruction (or data) fetched from that address (it travels on the data bus)."
      }
    }
  ],
  "flashcards": [
    [
      "Which register holds the current instruction being decoded?",
      "The Current Instruction Register (CIR)."
    ],
    [
      "What happens to the PC immediately after MAR is loaded?",
      "It is incremented (PC <- PC + 1)."
    ],
    [
      "Which bus carries the address from MAR to memory?",
      "The Address Bus."
    ],
    [
      "Which bus carries the instruction from memory to MBR?",
      "The Data Bus."
    ],
    [
      "What does the Control Unit do during the Decode phase?",
      "It splits the instruction into its opcode (operation) and operand (data/address)."
    ],
    [
      "What happens in the Fetch stage?",
      "The PC's address is copied to the MAR; the instruction is read from memory via the data bus into the MBR/CIR; the PC is incremented."
    ],
    [
      "What happens in the Decode stage?",
      "The control unit splits the instruction in the CIR into its opcode and operand(s)."
    ],
    [
      "What happens in the Execute stage?",
      "The decoded instruction is carried out — an ALU operation, a memory transfer, or a branch that changes the PC."
    ]
  ],
  "quiz": [
    {
      "q": "What is the first step of the Fetch stage?",
      "opts": [
        "PC <- PC + 1",
        "MBR <- [Memory]",
        "MAR <- [PC]",
        "CIR <- [MBR]"
      ],
      "ans": 2,
      "why": "The CPU must first know WHERE to look by loading the PC into MAR."
    },
    {
      "q": "Where does the instruction go after the MBR?",
      "opts": [
        "ALU",
        "PC",
        "CIR",
        "Control Unit"
      ],
      "ans": 2,
      "why": "It moves to the CIR to be held for decoding."
    },
    {
      "q": "Which register is used to store data being written TO memory?",
      "opts": [
        "MAR",
        "MBR",
        "PC",
        "Status Register"
      ],
      "ans": 1,
      "why": "MBR (or MDR) is the gateway for all data entering or leaving the CPU."
    },
    {
      "q": "True or False: The Program Counter always increments by 1.",
      "opts": [
        "True",
        "False"
      ],
      "ans": 1,
      "why": "It increments by 1 during Fetch, but a Jump or Branch instruction can change it to a completely different value during Execute."
    },
    {
      "q": "During Fetch, the address of the next instruction is copied from the PC into which register?",
      "opts": ["ALU", "MAR", "CIR", "Accumulator"],
      "ans": 1,
      "why": "The Memory Address Register receives the address so it can be placed on the address bus."
    }
  ],
  "exam": [
    {
      "q": "Describe the role of the Program Counter and the Memory Address Register during the Fetch stage.",
      "marks": 4,
      "ms": [
        "PC holds the address of the next instruction (1)",
        "This address is copied from the PC to the MAR (1)",
        "PC is then incremented to point to the following instruction (1)",
        "MAR is used to place the address on the address bus to locate the instruction in RAM (1)"
      ]
    },
    {
      "q": "Describe the three stages of the Fetch-Execute cycle.",
      "marks": 4,
      "ms": [
        "Fetch: the instruction at the PC's address is loaded from memory into the CIR; the PC is incremented (1-2)",
        "Decode: the control unit splits the instruction into opcode and operand (1)",
        "Execute: the instruction is performed (ALU operation, memory transfer or branch) (1)"
      ]
    },
    {
      "q": "Explain how the registers (PC, MAR, MBR/MDR, CIR) are used during one pass of the Fetch-Execute cycle.",
      "marks": 6,
      "ms": [
        "PC holds the address of the next instruction (1)",
        "Its value is copied to the MAR (1)",
        "The address is placed on the address bus and the instruction returned via the data bus into the MBR (1)",
        "The instruction is copied to the CIR and the PC is incremented (1)",
        "The control unit decodes the CIR into opcode + operand (1)",
        "Execute is carried out (ALU/memory/branch); a branch overwrites the PC (1)"
      ]
    }
  ]
};

C["compsci:4.7.3.6"] = {
  "notes": [
    {
      "h": "Interrupts and ISRs"
    },
    {
      "callout": {
        "t": "def",
        "h": "Interrupt Definition",
        "body": "An interrupt is a signal sent to the processor by hardware or software indicating an event that needs immediate attention. It suspends the current program execution."
      }
    },
    {
      "h": "How the CPU Handles Interrupts"
    },
    {
      "callout": {
        "t": "info",
        "h": "The Check Phase",
        "body": "The CPU checks for interrupt signals at the end of every Fetch-Execute cycle. It does NOT stop in the middle of an instruction."
      }
    },
    {
      "h": "The Interrupt Service Routine (ISR)"
    },
    {
      "callout": {
        "t": "def",
        "h": "Context Switching",
        "body": "To handle an interrupt, the CPU must save its current state so it can return to it later. This is called context switching."
      }
    },
    {
      "steps": [
        {
          "h": "Save State",
          "m": "The CPU performs a context switch, pushing the current values of the PC and all general-purpose registers onto the system stack to preserve the interrupted program's exact state.",
          "n": "The current values of the Program Counter and all registers are pushed onto the System Stack."
        },
        {
          "h": "Identify",
          "m": "The CPU determines which device or event raised the interrupt, then consults the Interrupt Vector Table to find the starting memory address of the appropriate ISR.",
          "n": "The CPU determines the source of the interrupt and looks up the address of the appropriate ISR in the Interrupt Vector Table."
        },
        {
          "h": "Execute ISR",
          "m": "The PC is loaded with the ISR's start address; execution transfers to the ISR which handles the event (e.g. reading a keyboard buffer, saving data, recovering from an error).",
          "n": "The PC is loaded with the ISR address, and the CPU runs the service code."
        },
        {
          "h": "Restore State",
          "m": "The IRET instruction signals the end of the ISR; the saved registers and PC are popped back from the stack and execution resumes in the original program exactly where it was interrupted.",
          "n": "Once the ISR finishes, the saved register values are popped from the stack back into the CPU, and the PC is restored."
        }
      ]
    },
    {
      "h": "Interrupt Priorities"
    },
    {
      "table": {
        "head": [
          "Priority",
          "Source",
          "Example"
        ],
        "rows": [
          [
            "1 (Highest)",
            "Hardware Failure",
            "Power failure / Memory error"
          ],
          [
            "2",
            "Clock",
            "Time-slice for multitasking"
          ],
          [
            "3",
            "I/O Device",
            "Keyboard press / Data arrival"
          ],
          [
            "4 (Lowest)",
            "Software",
            "System call / Error"
          ]
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Generic ISR Structure",
        "src": "ISR_KEYBOARD:\n  PUSH ALL_REGISTERS  # Save context\n  READ_KEY_BUFFER     # Process event\n  CLEAR_INTERRUPT_FLAG\n  POP ALL_REGISTERS   # Restore context\n  IRET                # Interrupt Return"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Interrupt Handling — 4-Step Checklist",
        "body": "**1. Check** — CPU checks interrupt line at end of F-E cycle. **2. Save** — all registers + PC pushed to system stack (context switch). **3. Service** — PC set to ISR address via Interrupt Vector Table; ISR runs. **4. Restore** — registers and PC popped back; program resumes. Exam answers that miss 'save to stack' lose a mark."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "The CPU Does NOT Stop Mid-Instruction",
        "body": "Interrupts are checked **between** F-E cycles, not in the middle of one. The current instruction always completes before any interrupt is serviced. Writing 'the CPU stops immediately' is incorrect."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Interrupt Priority",
        "body": "If multiple interrupts arrive simultaneously, the CPU services the **highest priority** one first. Lower-priority interrupts remain pending. A higher-priority interrupt arriving during an ISR can itself interrupt the ISR — called **nested interrupts**."
      }
    }
  ],
  "flashcards": [
    [
      "When does the CPU check for interrupts?",
      "At the end of every Fetch-Execute cycle."
    ],
    [
      "Where are register values saved when an interrupt occurs?",
      "On the system stack."
    ],
    [
      "What does ISR stand for?",
      "Interrupt Service Routine."
    ],
    [
      "What determines which interrupt is handled first?",
      "The interrupt's priority level."
    ],
    [
      "What is the Interrupt Vector Table?",
      "A table in memory containing the starting addresses of all ISRs."
    ],
    [
      "Why must the PC be saved to the stack before running an ISR?",
      "So that execution can resume at the correct instruction in the original program after the ISR finishes."
    ],
    [
      "What is a context switch?",
      "Saving all CPU registers (including the PC) to the stack so a different routine can run, then restoring them afterwards."
    ],
    [
      "What is an interrupt service routine (ISR)?",
      "The block of code the processor runs to handle a specific interrupt before resuming the original task."
    ]
  ],
  "quiz": [
    {
      "q": "Why must registers be saved to a stack during an interrupt?",
      "opts": [
        "To clear memory",
        "To allow the CPU to resume the original task later",
        "To speed up the ISR",
        "To prevent the CPU from overheating"
      ],
      "ans": 1,
      "why": "This preserves the 'state' or 'context' of the interrupted program."
    },
    {
      "q": "Which of these has the highest interrupt priority?",
      "opts": [
        "User input",
        "Timer interrupt",
        "Hardware failure",
        "Software error"
      ],
      "ans": 2,
      "why": "Critical hardware issues require immediate response to prevent damage or data loss."
    },
    {
      "q": "What happens if a higher priority interrupt occurs during an ISR?",
      "opts": [
        "It is ignored",
        "The current ISR is suspended and the new one starts",
        "The computer crashes",
        "The new interrupt waits for the current one to finish"
      ],
      "ans": 1,
      "why": "Higher priority interrupts can 'interrupt the interrupter'."
    },
    {
      "q": "What is the very last step of an ISR?",
      "opts": [
        "Saving registers",
        "Checking priority",
        "Restoring registers and returning (IRET)",
        "Clearing the PC"
      ],
      "ans": 2,
      "why": "The CPU must restore the previous state to continue."
    },
    {
      "q": "When does the processor check for pending interrupts?",
      "opts": ["never", "at the end of each Fetch-Execute cycle", "only at startup", "during decode only"],
      "ans": 1,
      "why": "The processor checks the interrupt register/queue at the end of each Fetch-Execute cycle."
    }
  ],
  "exam": [
    {
      "q": "Explain the steps the processor takes when an interrupt occurs.",
      "marks": 4,
      "ms": [
        "Completes the current F-E cycle (1)",
        "Saves current registers/PC to the stack (1)",
        "Loads the PC with the address of the ISR (1)",
        "After ISR, pops the saved values from the stack to resume original task (1)"
      ]
    },
    {
      "q": "Explain why the volatile environment must be saved when an interrupt is serviced.",
      "marks": 3,
      "ms": [
        "The current register contents (including the PC) are needed to resume the interrupted program (1)",
        "They are saved (pushed onto the stack) before the ISR runs (1)",
        "and restored afterwards so execution continues correctly (1)"
      ]
    },
    {
      "q": "Describe how the processor handles an interrupt, from detection to resuming the original program.",
      "marks": 6,
      "ms": [
        "At the end of a Fetch-Execute cycle the processor checks for interrupts (1)",
        "If one is present (and higher priority), the current registers/PC are saved to the stack — the volatile environment (1)",
        "The PC is set to the address of the appropriate ISR (1)",
        "The ISR runs to service the interrupt (1)",
        "On completion the saved registers/PC are popped from the stack (1)",
        "Execution of the original program resumes where it left off (1)"
      ]
    }
  ]
};

C["compsci:4.7.3.3"] = {
  "notes": [
    { "h": "Instruction Set" },
    {
      "callout": {
        "t": "def",
        "h": "Machine Code Instruction Format",
        "body": "Each instruction has two parts: the **opcode** (what to do) and the **operand** (what to do it to). E.g. `ADD R0, #5` — opcode `ADD`, operands `R0` and `#5`."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Addressing Modes",
        "body": [
          {"kv": [
            ["Immediate", "The operand **is** the actual data value. E.g. `ADD R0, #10` — adds literal 10. Fast, but value is fixed."],
            ["Direct", "The operand is the **memory address** of the data. E.g. `ADD R0, 100` — reads value at address 100."],
            ["Indirect", "The operand is the address of an **address** that holds the data. Adds one extra memory lookup. Used for pointers."],
            ["Indexed", "The effective address = operand (base address) + value in **index register**. Used to iterate through arrays."]
          ]}
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Why Different Addressing Modes?",
        "body": "**Immediate** = fastest (value in instruction, no memory lookup). **Direct** = one lookup. **Indirect** = two lookups (slower, but flexible for pointers). **Indexed** = enables array access by incrementing the index register."
      }
    },
    { "h": "Addressing Modes Comparison" },
    {
      "table": {
        "head": ["Mode", "Operand Meaning", "Effective Address", "Use Case"],
        "rows": [
          ["Immediate", "The actual data value", "None (value is in the instruction)", "Constants, quick arithmetic"],
          ["Direct", "Address of the data", "Operand itself", "Single variable access"],
          ["Indirect", "Address of the address of the data", "[Operand] (pointer dereference)", "Pointers, dynamic data"],
          ["Indexed", "Base address", "Operand + Index Register value", "Array/table access"]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Instruction Set Architecture (ISA)",
        "body": "The **instruction set** is the complete set of machine code instructions a CPU can execute. Different processor families (x86, ARM, RISC-V) have different ISAs — assembly code is NOT portable between them."
      }
    },
    { "h": "Calculating an Indexed Address" },
    {
      "steps": [
        {
          "h": "Read Base",
          "m": "The instruction's operand contains the base address (e.g. 200).",
          "n": "This is the starting address of an array or table in memory."
        },
        {
          "h": "Read Offset",
          "m": "Fetch the current value from the Index Register (e.g. IX = 3).",
          "n": "The index register is incremented each loop iteration to move through the array."
        },
        {
          "h": "Add",
          "m": "Effective address = base + offset = 200 + 3 = 203. Read/write memory at address 203.",
          "n": "This accesses element 3 of an array starting at address 200."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Immediate vs Direct vs Indexed",
        "src": "ADD R0, #10   # Immediate (literal 10)\nADD R0, 100   # Direct (value at RAM 100)\nADD R0, [100, R1] # Indexed (RAM 100 + R1)"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Instruction Format & Addressing Modes",
        "body": "Every instruction = **opcode** (operation) + **operand** (data or address). 4 modes ranked fastest→slowest: **Immediate** = data IS the operand, 0 memory lookups, for constants. **Direct** = operand IS the data's address, 1 lookup. **Indirect** = operand points to address of address, 2 lookups, for pointers. **Indexed** = effective address = operand + index register, 1 lookup + add, for arrays."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Addressing Mode Misconceptions",
        "body": "**Immediate addressing requires a memory lookup to get the data** — No; immediate is the FASTEST mode precisely because the data is embedded in the instruction itself — zero memory lookups required. **Indexed addressing is used for single variables** — Indexed is designed for arrays and loop iteration; you increment the index register each iteration to access the next element. Direct addressing is more natural for simple variables."
      }
    }
  ],
  "flashcards": [
    [
      "What does an instruction typically consist of?",
      "An opcode and one or more operands."
    ],
    [
      "What is immediate addressing?",
      "The operand is the actual data value to be used."
    ],
    [
      "What is direct addressing?",
      "The operand is the memory address of the data to be used."
    ],
    [
      "How does indexed addressing work?",
      "The operand is added to the value in the index register to determine the final memory address."
    ],
    [
      "What is indirect addressing used for?",
      "The operand points to a memory location, which in turn contains the actual memory location of the data (useful for large address spaces)."
    ],
    [
      "What does the assembly instruction CMP do?",
      "Compares two values, updating the status register flags."
    ],
    [
      "What is a processor instruction set?",
      "The complete set of machine-code instructions a particular processor can execute."
    ],
    [
      "Why is an instruction set processor-specific?",
      "Each processor design defines its own opcodes/encoding, so machine code for one will not run on a different architecture."
    ]
  ],
  "quiz": [
    {
      "q": "Which addressing mode uses the operand as the actual data?",
      "opts": [
        "Direct",
        "Indirect",
        "Immediate",
        "Indexed"
      ],
      "ans": 2,
      "why": "Immediate addressing provides the data directly in the instruction."
    },
    {
      "q": "If the operand is an address that points to another address containing the data, what mode is this?",
      "opts": [
        "Direct",
        "Indirect",
        "Immediate",
        "Indexed"
      ],
      "ans": 1,
      "why": "Indirect addressing uses a pointer."
    },
    {
      "q": "What does the LDR instruction typically do?",
      "opts": [
        "Logical right shift",
        "Loads data from memory into a register",
        "Loops down repeatedly",
        "Links dynamic registries"
      ],
      "ans": 1,
      "why": "LDR stands for Load Register."
    },
    {
      "q": "Which addressing mode is particularly useful for iterating through arrays?",
      "opts": [
        "Immediate",
        "Direct",
        "Indirect",
        "Indexed"
      ],
      "ans": 3,
      "why": "Indexed addressing allows the index register to be incremented to access consecutive array elements."
    },
    {
      "q": "A machine-code instruction is made up of...?",
      "opts": ["only an opcode", "an opcode and one or more operands", "two operands only", "a label and a comment"],
      "ans": 1,
      "why": "An instruction has an opcode (the operation) plus one or more operands (value, address or register)."
    }
  ],
  "exam": [
    {
      "q": "Explain the difference between direct and immediate addressing.",
      "marks": 2,
      "ms": [
        "Direct addressing: the operand is the memory address where the data is stored (1)",
        "Immediate addressing: the operand is the actual data value itself (1)"
      ]
    },
    {
      "q": "Explain what is meant by a processor instruction set and why machine code is not portable between different processors.",
      "marks": 3,
      "ms": [
        "The instruction set is all the machine-code instructions a processor can execute (1)",
        "It is processor-specific — opcodes/encoding differ between architectures (1)",
        "so machine code written for one processor will not run on a different one (1)"
      ]
    },
    {
      "q": "Describe the structure of a machine-code instruction and explain the role of the opcode and operand(s), using an example.",
      "marks": 6,
      "ms": [
        "An instruction consists of an opcode and one or more operands (1)",
        "The opcode specifies the operation to perform (e.g. ADD, LOAD) (1)",
        "The operand is the data the operation acts on: a value, a memory address or a register (1)",
        "Example: ADD #5 — opcode ADD, immediate operand 5 (1)",
        "The opcode is decoded by the control unit (1)",
        "The addressing mode determines how the operand is interpreted (1)"
      ]
    }
  ]
};

C["compsci:4.7.3.4"] = {
  "notes": [
    {
      "h": "Processor Addressing Modes"
    },
    {
      "callout": {
        "t": "def",
        "h": "Addressing Mode",
        "body": "Defines how the operand part of an instruction is interpreted by the CPU to find the actual data (effective address) required."
      }
    },
    {
      "h": "1. Immediate Addressing"
    },
    {
      "callout": {
        "t": "info",
        "h": "Constant Values",
        "body": "The operand IS the actual data value to be used. No memory access is required to find the data. Fastest mode."
      }
    },
    {
      "h": "2. Direct (Absolute) Addressing"
    },
    {
      "callout": {
        "t": "info",
        "h": "Memory Locations",
        "body": "The operand is the memory address where the data is stored. Simple and common."
      }
    },
    {
      "h": "3. Indirect Addressing"
    },
    {
      "callout": {
        "t": "info",
        "h": "Pointers",
        "body": "The operand is an address that points to another memory location, which contains the actual data. Useful for large address spaces or pointers."
      }
    },
    {
      "h": "4. Indexed Addressing"
    },
    {
      "callout": {
        "t": "info",
        "h": "Arrays and Iteration",
        "body": "The effective address is calculated by adding the operand (base address) to the value currently held in the Index Register (IR)."
      }
    },
    {
      "table": {
        "head": [
          "Mode",
          "Operand",
          "Effective Address (EA)",
          "Data Location"
        ],
        "rows": [
          [
            "Immediate",
            "10",
            "N/A",
            "The value 10 itself"
          ],
          [
            "Direct",
            "100",
            "100",
            "Content of RAM address 100"
          ],
          [
            "Indirect",
            "100",
            "[100]",
            "RAM address pointed to by address 100"
          ],
          [
            "Indexed",
            "100",
            "100 + [IR]",
            "RAM address 100 plus offset in IR"
          ]
        ]
      }
    },
    {
      "code": {
        "lang": "asm",
        "cap": "Addressing Modes in Assembly",
        "src": "MOV R0, #42     ; Immediate (R0 = 42)\nMOV R1, 100     ; Direct (R1 = value at RAM 100)\nMOV R2, [100]   ; Indirect (R2 = value at address stored in 100)\nMOV R3, (100,R4); Indexed (R3 = value at RAM 100 + R4)"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Addressing Mode Summary",
        "body": "**Immediate**: data IS the operand (0 lookups) — fastest, for constants. **Direct**: operand is the data's address (1 lookup) — for single variables. **Indirect**: operand is address of another address (2 lookups) — for pointers, slowest. **Indexed**: effective address = operand + index register value (1 lookup + addition) — for iterating through arrays."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Addressing Mode Confusion",
        "body": "**Indirect and direct addressing are the same thing** — No: direct uses the operand as the data's address (one memory lookup); indirect uses the operand as the address OF another address (two lookups — like dereferencing a pointer). **Indexed addressing only works with large arrays** — Indexed works with any contiguous block of data; the index register simply holds an offset added to the base address."
      }
    }
  ],
  "flashcards": [
    [
      "What is the effective address in immediate addressing?",
      "There is none; the data is in the instruction itself."
    ],
    [
      "How is an indexed address calculated?",
      "Effective Address = Operand + Index Register."
    ],
    [
      "Which addressing mode is used for following pointers?",
      "Indirect addressing."
    ],
    [
      "Which mode is fastest and why?",
      "Immediate addressing, because it requires no memory fetches for data."
    ],
    [
      "Why is indexed addressing useful for arrays?",
      "The base address stays the same while the Index Register is incremented to access each element."
    ],
    [
      "What is immediate addressing?",
      "The operand IS the actual data value to use (e.g. ADD #5 adds the literal 5)."
    ],
    [
      "What is direct addressing?",
      "The operand is the memory ADDRESS where the data is stored; the CPU fetches the value from there."
    ],
    [
      "Which is faster, immediate or direct addressing, and why?",
      "Immediate — the value is in the instruction itself, so no extra memory access is needed."
    ]
  ],
  "quiz": [
    {
      "q": "If the operand is 50 and the Index Register is 10, what is the effective address in indexed mode?",
      "opts": [
        "50",
        "10",
        "60",
        "40"
      ],
      "ans": 2,
      "why": "50 + 10 = 60."
    },
    {
      "q": "Which mode uses the operand as a memory address pointing to the data?",
      "opts": [
        "Immediate",
        "Direct",
        "Indirect",
        "Indexed"
      ],
      "ans": 1,
      "why": "Direct addressing points directly to the data location."
    },
    {
      "q": "What is a disadvantage of indirect addressing?",
      "opts": [
        "It is too fast",
        "It requires two memory accesses to get the data",
        "It can only store small numbers",
        "It uses the ALU too much"
      ],
      "ans": 1,
      "why": "Fetch 1: Get address from RAM. Fetch 2: Get data from that address."
    },
    {
      "q": "Which symbol often denotes immediate addressing in assembly?",
      "opts": [
        "@",
        "$",
        "#",
        "&"
      ],
      "ans": 2,
      "why": "The hash (#) symbol usually indicates a literal value."
    },
    {
      "q": "In `LDA 100` using direct addressing, what is loaded?",
      "opts": ["the value 100", "the contents of memory location 100", "register 100", "100 added to the accumulator"],
      "ans": 1,
      "why": "Direct addressing treats the operand as the address, so the value AT location 100 is loaded."
    }
  ],
  "exam": [
    {
      "q": "Compare direct and indirect addressing.",
      "marks": 3,
      "ms": [
        "Direct: operand is the address of the data (1)",
        "Indirect: operand is the address of the address of the data (1)",
        "Indirect allows for a larger range of addresses than direct (1)"
      ]
    },
    {
      "q": "Explain the difference between immediate and direct addressing, using an example.",
      "marks": 3,
      "ms": [
        "Immediate: the operand is the actual data value (1); e.g. ADD #5 adds the literal 5 (1)",
        "Direct: the operand is a memory address; the value stored there is used (1)"
      ]
    },
    {
      "q": "Compare immediate and direct addressing modes, discussing their effect on speed and on the range of values available.",
      "marks": 6,
      "ms": [
        "Immediate: operand is the data itself (1); fastest — no extra memory fetch (1)",
        "but the value size is limited by the operand field (1)",
        "Direct: operand is a memory address (1); requires an extra memory access so slower (1)",
        "but can access a full word of data at any addressable location (1)"
      ]
    }
  ]
};

C["compsci:4.7.3.5"] = {
  "notes": [
    {
      "h": "Assembly Language Operations"
    },
    {
      "callout": {
        "t": "def",
        "h": "Mnemonic Instructions",
        "body": "Assembly is a low-level language that uses mnemonics (like ADD or LDR) to represent machine code instructions. Each mnemonic corresponds 1-to-1 with a binary opcode."
      }
    },
    {
      "h": "Data Transfer Operations"
    },
    {
      "callout": {
        "t": "info",
        "h": "Moving Data",
        "body": [
          {
            "kv": [
              [
                "LDR",
                "Load: Move data from memory into a register."
              ],
              [
                "STR",
                "Store: Move data from a register into memory."
              ],
              [
                "MOV",
                "Move: Copy a value from one register to another."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Arithmetic & Logic Operations"
    },
    {
      "callout": {
        "t": "info",
        "h": "Calculating",
        "body": [
          {
            "kv": [
              [
                "ADD / SUB",
                "Addition and Subtraction."
              ],
              [
                "AND / OR / XOR",
                "Bitwise logic operations."
              ],
              [
                "LSL / LSR",
                "Logical Shift Left/Right (Multiplication/Division by 2)."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Branching & Control Flow"
    },
    {
      "callout": {
        "t": "info",
        "h": "Changing Execution Path",
        "body": [
          {
            "kv": [
              [
                "CMP",
                "Compare two values and update status flags."
              ],
              [
                "B / BRA",
                "Branch (Unconditional jump)."
              ],
              [
                "BEQ / BNE",
                "Branch if Equal / Not Equal (Conditional jump)."
              ],
              [
                "BL",
                "Branch with Link (Function call)."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "asm",
        "cap": "Sample Assembly Program: Totaling an Array",
        "src": "      MOV R1, #0      ; R1 = Total\n      MOV R2, #0      ; R2 = Index\nLOOP: LDR R3, (ARR, R2); Load ARR[Index] into R3\n      ADD R1, R1, R3  ; Total = Total + R3\n      ADD R2, R2, #1  ; Index = Index + 1\n      CMP R2, #10     ; Compare Index with 10\n      BNE LOOP        ; If Index != 10, jump to LOOP\n      STR R1, RESULT  ; Store final total in memory"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Key Assembly Mnemonics",
        "body": "**Data**: LDR = memory→register; STR = register→memory; MOV = register→register. **Arithmetic**: ADD, SUB. **Logic**: AND, OR, XOR (bitwise). **Shifts**: LSL #n = ×2ⁿ; LSR #n = ÷2ⁿ. **Control flow**: CMP (subtract and set flags, no result stored); B (unconditional branch); BEQ/BNE (branch if zero/not-zero flag); BL (branch with link = subroutine call)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Assembly Misconceptions",
        "body": "**LSL #2 multiplies by 2** — No; LSL #n multiplies by 2ⁿ. LSL #1 = ×2, LSL #2 = ×4, LSL #3 = ×8. Each bit shifted left doubles the value. **CMP stores the subtraction result in a register** — No; CMP sets the status flags (Zero, Negative, Carry) but discards the numeric result. The flags are then read by a conditional branch instruction (BEQ, BNE, etc.)."
      }
    }
  ],
  "flashcards": [
    [
      "What does LDR R0, 100 do?",
      "Loads the value stored at memory address 100 into register R0."
    ],
    [
      "What is the difference between B and BEQ?",
      "B is an unconditional branch; BEQ only branches if the Zero flag is set (result of comparison was equal)."
    ],
    [
      "Which instruction is used to perform a bitwise 'exclusive or'?",
      "XOR."
    ],
    [
      "How can you double a number using a shift?",
      "Use LSL (Logical Shift Left) by 1 bit."
    ],
    [
      "What does the CMP instruction actually do?",
      "It subtracts the second operand from the first and sets status flags (Zero, Negative, Carry) without saving the result."
    ],
    [
      "What does a LOAD (LDA) instruction do?",
      "Copies a value from memory (or an immediate value) into a register/accumulator."
    ],
    [
      "Difference between an unconditional and a conditional branch?",
      "Unconditional always jumps; conditional jumps only if a status flag condition is met (e.g. BNE on the Zero flag)."
    ],
    [
      "What do logical shift left and shift right do?",
      "Move all bits left/right by n places, filling with 0s — a left shift ×2ⁿ, a right shift ÷2ⁿ (for unsigned values)."
    ]
  ],
  "quiz": [
    {
      "q": "Which instruction saves data back to RAM?",
      "opts": [
        "LDR",
        "STR",
        "MOV",
        "PUSH"
      ],
      "ans": 1,
      "why": "STR stands for Store Register to memory."
    },
    {
      "q": "What happens during a LSL #1 operation?",
      "opts": [
        "Value is divided by 2",
        "Value is multiplied by 2",
        "Value becomes zero",
        "Value is inverted"
      ],
      "ans": 1,
      "why": "Moving bits left adds a zero at the end, doubling the value."
    },
    {
      "q": "Which register is typically used as a 'target' in an instruction like ADD R1, R2, R3?",
      "opts": [
        "R1",
        "R2",
        "R3",
        "None"
      ],
      "ans": 0,
      "why": "The first register is usually the destination where the result is stored."
    },
    {
      "q": "What does BNE stand for?",
      "opts": [
        "Branch Near End",
        "Branch Never Execute",
        "Branch if Not Equal",
        "Binary Not Equivalent"
      ],
      "ans": 2,
      "why": "It is a conditional branch based on the Zero flag being 0."
    },
    {
      "q": "Which operation sets the status flags by subtracting but does NOT store the result?",
      "opts": ["ADD", "STORE", "COMPARE", "HALT"],
      "ans": 2,
      "why": "COMPARE subtracts the operands to set the flags (Zero/Negative/Carry) but discards the result."
    }
  ],
  "exam": [
    {
      "q": "Explain the purpose of the CMP and BNE instructions when used together.",
      "marks": 3,
      "ms": [
        "CMP compares two values by subtracting them (1)",
        "It sets flags in the status register (1)",
        "BNE checks the zero flag and branches to a label if the values were not equal (1)"
      ]
    },
    {
      "q": "State what each of these machine operations does: LOAD, STORE, COMPARE, and an unconditional branch.",
      "marks": 4,
      "ms": [
        "LOAD: copy a value into a register/accumulator (1)",
        "STORE: copy a register's value into a memory location (1)",
        "COMPARE: subtract operands to set status flags without saving the result (1)",
        "Unconditional branch: always jump to the given address/label (1)"
      ]
    },
    {
      "q": "Explain how COMPARE together with conditional branching is used to implement an IF statement in machine code.",
      "marks": 6,
      "ms": [
        "COMPARE subtracts the two values, setting the status flags (e.g. the Zero flag) (1)",
        "A conditional branch tests a flag (e.g. branch if equal / not equal) (1)",
        "If the condition is met, the PC is changed to the branch target (1)",
        "otherwise execution falls through to the next instruction (1)",
        "This realises the IF's two paths (true/false) (1)",
        "Example: CMP A,B then BNE skip — skips the 'then' block when A ≠ B (1)"
      ]
    }
  ]
};

C["compsci:4.7.3.7"] = {
  "notes": [
    {
      "h": "Processor Performance and Pipelining"
    },
    {
      "callout": {
        "t": "def",
        "h": "Optimization Terms",
        "body": [
          {
            "kv": [
              [
                "Clock Speed",
                "Cycles per second (Hz)."
              ],
              [
                "Core count",
                "Number of independent processors."
              ],
              [
                "Cache",
                "Internal CPU memory (L1/L2/L3)."
              ],
              [
                "Pipelining",
                "Parallelizing F-E cycle stages."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Memory Hierarchy Comparison"
    },
    {
      "table": {
        "head": [
          "Level",
          "Speed",
          "Capacity",
          "Distance from CPU"
        ],
        "rows": [
          [
            "Registers",
            "Instant",
            "Tiny (bits)",
            "Inside core"
          ],
          [
            "L1 Cache",
            "Very Fast",
            "Small (KB)",
            "On chip"
          ],
          [
            "RAM",
            "Slow",
            "Large (GB)",
            "Motherboard slot"
          ],
          [
            "SSD",
            "Very Slow",
            "Massive (TB)",
            "SATA / NVMe bus"
          ]
        ]
      }
    },
    {
      "h": "The Pipelining Process"
    },
    {
      "steps": [
        {
          "h": "Cycle 1",
          "m": "During the first clock cycle, the CPU fetches Instruction A from memory — only one stage of the pipeline is active.",
          "n": "Fetch Instruction A."
        },
        {
          "h": "Cycle 2",
          "m": "Instruction A moves to the Decode stage while the CPU simultaneously fetches Instruction B — two instructions are now in flight at once.",
          "n": "Decode A; Fetch B."
        },
        {
          "h": "Cycle 3",
          "m": "Instruction A executes, B decodes, and C is fetched simultaneously — the pipeline is now running at full throughput, completing one instruction per clock cycle.",
          "n": "Execute A; Decode B; Fetch C."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Pipeline Throughput Example",
        "src": "# Without Pipelining: 3 instructions take 9 clock steps\n# With Pipelining: 3 instructions take 5 clock steps"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Pipeline Hazards",
        "body": "Pipelining can be disrupted by branches (jumps) in the code, requiring the pipeline to be flushed."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Four Ways to Improve Processor Performance",
        "body": [{"kv": [
          ["Clock speed", "More cycles per second — directly speeds up each F-E cycle."],
          ["Core count", "Multiple cores can execute different threads in parallel."],
          ["Cache size", "Larger cache reduces RAM accesses (cache hits serve data faster)."],
          ["Pipelining", "Overlaps Fetch/Decode/Execute of different instructions simultaneously."]
        ]}]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "More Cores ≠ Always Faster",
        "body": "If a program is **single-threaded** (not written for parallelism), adding cores gives no benefit — only one core runs at a time. Similarly, doubling clock speed is not possible without limit; heat and power dissipation constrain it. The exam expects you to acknowledge these limitations."
      }
    }
  ],
  "flashcards": [
    [
      "How does clock speed affect CPU performance?",
      "A higher clock speed allows more fetch-execute cycles per second, increasing execution speed."
    ],
    [
      "What is cache memory?",
      "Extremely fast memory on the CPU that stores frequently used data and instructions to avoid slower RAM access."
    ],
    [
      "Why does doubling the number of cores not always double performance?",
      "Some programs cannot be parallelized, and there is overhead in managing multiple cores."
    ],
    [
      "What is pipelining?",
      "Executing different stages of the F-E cycle (Fetch, Decode, Execute) simultaneously for different instructions."
    ],
    [
      "What is a pipeline hazard (flush)?",
      "When a branch instruction alters the flow of control, making the pre-fetched instructions in the pipeline invalid, so they must be discarded."
    ],
    [
      "Name four factors that influence processor performance.",
      "Clock speed, number of cores, cache size, and pipelining."
    ],
    [
      "Why does a larger cache improve performance?",
      "More data can be served from fast on-chip cache instead of slower main memory, reducing wait cycles."
    ],
    [
      "How does a wider data bus improve performance?",
      "More bits are transferred per memory access, so more data moves per cycle."
    ]
  ],
  "quiz": [
    {
      "q": "Which of the following is the fastest type of memory?",
      "opts": [
        "L1 Cache",
        "Main Memory (RAM)",
        "Solid State Drive",
        "Registers"
      ],
      "ans": 3,
      "why": "Registers are inside the CPU core and are the absolute fastest, followed by L1 Cache."
    },
    {
      "q": "What is a disadvantage of pipelining?",
      "opts": [
        "It is too slow for modern computers",
        "Branch instructions can cause the pipeline to be flushed, wasting cycles",
        "It requires excessive cache memory",
        "It cannot be used with a clock"
      ],
      "ans": 1,
      "why": "Branches break the sequential prediction, requiring a pipeline flush."
    },
    {
      "q": "Why might a quad-core processor not be exactly twice as fast as a dual-core?",
      "opts": [
        "Cores interfere with each other's data",
        "Software may not be written to utilize multiple cores efficiently",
        "The clock speed automatically halves",
        "Cores share the same ALU"
      ],
      "ans": 1,
      "why": "Parallel processing requires software designed for concurrency."
    },
    {
      "q": "What is the primary benefit of a larger CPU cache?",
      "opts": [
        "Can store larger hard drive files",
        "Reduces the number of times the CPU has to wait for data from slower main memory",
        "Increases the clock speed",
        "Allows more cores to be added"
      ],
      "ans": 1,
      "why": "Cache hits save significant time compared to RAM access."
    },
    {
      "q": "Doubling the clock speed (other factors equal) tends to...?",
      "opts": ["halve instructions per second", "roughly double instructions per second", "reduce the cache size", "widen the address bus"],
      "ans": 1,
      "why": "More clock pulses per second means more fetch-execute cycles, hence more instructions per second."
    }
  ],
  "exam": [
    {
      "q": "Explain how pipelining improves processor performance.",
      "marks": 2,
      "ms": [
        "Allows different stages of the fetch-execute cycle for different instructions to overlap/occur simultaneously (1)",
        "This increases the overall throughput of instructions completed per clock cycle (1)"
      ]
    },
    {
      "q": "Explain how cache memory improves processor performance.",
      "marks": 3,
      "ms": [
        "Cache is small, fast memory on or near the CPU (1)",
        "Frequently used instructions/data are held there (1)",
        "so the CPU avoids slower main-memory accesses — cache hits reduce wait time (1)"
      ]
    },
    {
      "q": "Discuss how clock speed, number of cores and cache memory each affect processor performance, and why simply increasing one may not help.",
      "marks": 6,
      "ms": [
        "Clock speed: more cycles per second → more instructions per second (1)",
        "but raises heat/power and has practical limits (1)",
        "Multiple cores: execute several threads in parallel (1)",
        "but only help if the software is parallelised; some tasks are inherently serial (1)",
        "Cache: faster access to frequent data reduces memory-wait stalls (1)",
        "Conclusion: performance depends on the balance of factors, not one alone (1)"
      ]
    }
  ]
};

C["compsci:4.7.4.1"] = {
  "notes": [
    { "h": "Input/Output and Storage" },
    {
      "callout": {
        "t": "def",
        "h": "Magnetic Storage (HDD)",
        "body": "Uses **spinning magnetic platters** and a read/write head. Stores bits as magnetic polarity. **Benefit**: very high capacity, low cost per GB. **Limitation**: slow (mechanical movement), fragile (moving parts), noisy."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Optical Storage (CD/DVD/Blu-ray)",
        "body": "Uses a **laser** to read/write **pits and lands** on a reflective disc surface. **Benefit**: portable, cheap to replicate, durable if not scratched. **Limitation**: very slow, low capacity, easily scratched, needs a drive."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Solid-State Storage (SSD/Flash)",
        "body": "Uses **NAND flash memory** — electrons trapped in **floating-gate transistors**. No moving parts. **Benefit**: very fast, durable, silent, low power. **Limitation**: more expensive per GB than HDD, limited write cycles."
      }
    },
    { "h": "Storage Comparison" },
    {
      "table": {
        "head": ["Medium", "Mechanism", "Speed", "Durability", "Capacity/Cost", "Use Case"],
        "rows": [
          ["Magnetic (HDD)", "Spinning platters + read/write head", "Medium", "Low (moving parts)", "Highest capacity, cheapest per GB", "Bulk data storage, servers"],
          ["Optical (CD/DVD)", "Laser reading pits and lands", "Slow", "Medium (scratch-sensitive)", "Low capacity", "Distribution, archiving"],
          ["Solid State (SSD)", "Floating-gate NAND flash cells", "Very fast", "High (no moving parts)", "Moderate — getting cheaper", "OS drives, mobile devices"]
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Primary vs Secondary vs Cache Memory",
        "body": "**Cache**: fastest, smallest, most expensive — sits inside/near CPU. **Primary (RAM)**: fast, volatile, holds running programs. **Secondary (HDD/SSD)**: slow, non-volatile, permanent storage. The memory hierarchy trades speed for cost and capacity."
      }
    },
    { "h": "Reading from an SSD (Flash Memory)" },
    {
      "steps": [
        {
          "h": "Address",
          "m": "The CPU sends the target memory address to the SSD controller via the address bus.",
          "n": "The controller maps this logical address to a physical flash block/page."
        },
        {
          "h": "Activate",
          "m": "The controller applies voltage to the relevant row (word line) and column (bit line) of flash cells.",
          "n": "NAND cells are organised in pages within blocks — the smallest readable unit is a page."
        },
        {
          "h": "Read",
          "m": "Sensors measure the charge on each floating-gate transistor: trapped electrons = 0, no charge = 1 (or multi-bit for MLC/TLC NAND).",
          "n": "SSDs read entire pages at once — typically 4KB or 8KB per read operation."
        },
        {
          "h": "Transmit",
          "m": "The data is loaded into a buffer and sent back to the CPU via the data bus.",
          "n": "Modern SSDs use NVMe (PCIe) instead of SATA for much higher bandwidth."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Storage selection logic",
        "src": "IF mobility_required == TRUE OR durability_required == TRUE THEN\n  USE Solid_State_Drive\nELSE IF capacity_required == MASSIVE THEN\n  USE Magnetic_HDD\nENDIF"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Storage Technologies — Quick Comparison",
        "body": "**Magnetic (HDD)**: spinning platters + read/write head; cheapest per GB, highest capacity; slow, fragile, moving parts. **Optical (CD/DVD/Blu-ray)**: laser + pits/lands on reflective disc; portable, cheap to distribute; very slow, low capacity, scratch-prone. **SSD**: NAND floating-gate transistors, no moving parts; very fast, durable, silent; most expensive per GB, finite write cycles. Memory hierarchy: Registers → Cache → RAM (primary) → SSD/HDD (secondary)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Storage Misconceptions",
        "body": "**SSDs work like HDDs but faster** — No; completely different mechanisms: HDDs use spinning magnetic platters with a mechanical read/write head; SSDs use NAND flash memory (floating-gate transistors) with no moving parts at all. **RAM is secondary storage** — RAM is primary storage (volatile, fast, directly addressable by the CPU); secondary storage (HDD/SSD) is non-volatile and retains data when powered off."
      }
    }
  ],
  "flashcards": [
    [
      "Why is secondary storage necessary?",
      "Because RAM is volatile; secondary storage is needed for long-term, non-volatile data retention."
    ],
    [
      "How does magnetic storage work?",
      "It uses spinning disks (platters) coated with magnetic material, read by a moving head."
    ],
    [
      "What is a major advantage of Solid State Drives (SSDs)?",
      "Extremely fast read/write speeds and high durability due to no moving parts."
    ],
    [
      "How does optical storage work?",
      "A laser reads light reflected off pits and lands on the surface of a spinning disc."
    ],
    [
      "Give an example of an input device used in automated systems.",
      "A sensor (e.g., temperature, pressure, light sensor)."
    ],
    [
      "What is an input device? Give an example.",
      "A device that sends data INTO the computer — e.g. keyboard, mouse, scanner, sensor or microphone."
    ],
    [
      "What is an output device? Give an example.",
      "A device that presents data FROM the computer — e.g. monitor, printer, speaker or actuator."
    ],
    [
      "What does an actuator do in a control system?",
      "Outputs a physical action (e.g. opens a valve, turns a motor) based on the computer's decision."
    ]
  ],
  "quiz": [
    {
      "q": "Which storage medium typically has the lowest cost per gigabyte?",
      "opts": [
        "Solid State Drive",
        "Magnetic Hard Drive",
        "Flash USB Drive",
        "Registers"
      ],
      "ans": 1,
      "why": "Magnetic HDDs are mature technology offering massive capacity very cheaply."
    },
    {
      "q": "Which technology uses pits and lands read by a laser?",
      "opts": [
        "Optical",
        "Magnetic",
        "Solid State",
        "Cloud"
      ],
      "ans": 0,
      "why": "Optical media like CDs and DVDs use lasers to read physical deformations."
    },
    {
      "q": "Why are SSDs more durable than HDDs when dropped?",
      "opts": [
        "They have stronger metal casings",
        "They use heavier components",
        "They have no moving parts",
        "They use magnetic fields to cushion blows"
      ],
      "ans": 2,
      "why": "No spinning platters or read heads means less risk of mechanical failure."
    },
    {
      "q": "Which of the following is considered non-volatile?",
      "opts": [
        "RAM",
        "Cache",
        "Registers",
        "ROM"
      ],
      "ans": 3,
      "why": "ROM retains its data when power is lost."
    },
    {
      "q": "Which of these is BOTH an input and an output device?",
      "opts": ["keyboard", "printer", "touchscreen", "microphone"],
      "ans": 2,
      "why": "A touchscreen displays output AND accepts touch input."
    }
  ],
  "exam": [
    {
      "q": "Compare solid-state storage and magnetic storage for use in a laptop.",
      "marks": 3,
      "ms": [
        "Solid-state has no moving parts so is more durable for a portable device than magnetic (1)",
        "Solid-state has faster read/write speeds leading to quicker boot times (1)",
        "Magnetic storage generally offers higher capacity for a lower cost than solid state (1)"
      ]
    },
    {
      "q": "Explain how a sensor and an actuator are used together in an embedded control system.",
      "marks": 3,
      "ms": [
        "A sensor inputs a physical quantity (e.g. temperature) as data (1)",
        "The processor compares it with a target and decides an action (1)",
        "An actuator outputs a physical action (e.g. opens a valve / turns a motor) (1)"
      ]
    },
    {
      "q": "Discuss how you would choose appropriate input and output devices for a self-service supermarket checkout, justifying each choice.",
      "marks": 6,
      "ms": [
        "Barcode scanner: fast, accurate input of product codes (1)",
        "Touchscreen: inputs selections AND outputs prompts (dual purpose) (1)",
        "Weighing scale (sensor): verifies an item was placed in the bagging area (1)",
        "Receipt printer: outputs a record for the customer (1)",
        "Card reader: secure payment input (1)",
        "Justification links each device's characteristics to its suitability for the task (1)"
      ]
    }
  ]
};

C["compsci:4.7.4.2"] = {
  "notes": [
    {
      "h": "Secondary Storage Technologies"
    },
    {
      "callout": {
        "t": "def",
        "h": "Secondary Storage",
        "body": "Non-volatile storage used to keep data and programs long-term. Unlike RAM, data is not lost when power is removed."
      }
    },
    {
      "h": "1. Magnetic Storage (e.g., HDD)"
    },
    {
      "callout": {
        "t": "info",
        "h": "Mechanism",
        "body": "Uses magnetizable material on spinning platters. A read/write head moves across the surface to detect or change the magnetic polarity (0 or 1)."
      }
    },
    {
      "table": {
        "head": [
          "Pro",
          "Con"
        ],
        "rows": [
          [
            "Cheap per GB of storage",
            "Mechanical moving parts can fail"
          ],
          [
            "Huge capacities (up to 20TB+)",
            "Slow read/write speeds compared to SSD"
          ],
          [
            "Proven, reliable technology",
            "Fragile if dropped (head crash)"
          ]
        ]
      }
    },
    {
      "h": "2. Optical Storage (e.g., CD, DVD, Blu-Ray)"
    },
    {
      "callout": {
        "t": "info",
        "h": "Mechanism",
        "body": "A laser is shone onto the surface of a spinning disc. 'Pits' (dips) and 'lands' (flat areas) reflect light differently, representing binary data."
      }
    },
    {
      "table": {
        "head": [
          "Pro",
          "Con"
        ],
        "rows": [
          [
            "Very cheap for distribution",
            "Low capacity (700MB to 50GB)"
          ],
          [
            "Highly portable",
            "Slow access speeds"
          ],
          [
            "Immune to magnetic fields",
            "Easily scratched or damaged"
          ]
        ]
      }
    },
    {
      "h": "3. Solid State Storage (e.g., SSD, Flash)"
    },
    {
      "callout": {
        "t": "info",
        "h": "Mechanism",
        "body": "Uses 'floating gate' transistors to trap electrons. No moving parts. The state of the gate (charged or not) represents binary 0 or 1."
      }
    },
    {
      "table": {
        "head": [
          "Pro",
          "Con"
        ],
        "rows": [
          [
            "Extremely fast access (no seek time)",
            "Expensive per GB"
          ],
          [
            "Durable (no moving parts)",
            "Limited write cycles (wear out)"
          ],
          [
            "Silent and low power",
            "Data can degrade if left unpowered for years"
          ]
        ]
      }
    },
    {
      "h": "Storage Comparison Overview"
    },
    {
      "table": {
        "head": [
          "Feature",
          "Magnetic (HDD)",
          "Optical (DVD)",
          "Solid State (SSD)"
        ],
        "rows": [
          [
            "Capacity",
            "Very High",
            "Low",
            "High"
          ],
          [
            "Speed",
            "Medium",
            "Slow",
            "Very Fast"
          ],
          [
            "Portability",
            "Low",
            "High",
            "High"
          ],
          [
            "Durability",
            "Medium",
            "Low",
            "High"
          ],
          [
            "Cost",
            "Low",
            "Very Low",
            "High"
          ]
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Storage selection algorithm",
        "src": "PROCEDURE ChooseStorage(size, speed_needed, portable):\n  IF speed_needed == HIGH THEN RETURN 'SSD'\n  ELSE IF portable == TRUE AND size < 50GB THEN RETURN 'Optical'\n  ELSE IF size > 2TB THEN RETURN 'HDD'\n  ELSE RETURN 'SSD'\nENDPROCEDURE"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Secondary Storage — Key Facts",
        "body": "**HDD**: magnetic polarity on spinning platters, mechanical read/write head; largest capacity, lowest cost per GB; slow, fragile. **Optical (CD/DVD/Blu-ray)**: laser reads pits (dips) and lands (flat areas); very cheap to replicate, portable; but low capacity (700 MB–50 GB) and scratch-prone. **SSD**: electrons trapped in floating-gate NAND flash transistors; no seek time, durable, silent; expensive per GB, finite write cycles — wear-levelling extends lifespan."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Storage Technology Misconceptions",
        "body": "**Optical storage is immune to all forms of damage** — Optical discs are immune to magnetic fields but are easily scratched and cracked; they are not indestructible. **SSD cells can be written to indefinitely** — NAND flash cells have a finite number of program/erase cycles before they wear out; SSDs use wear-levelling algorithms to spread writes evenly across all cells and extend lifespan."
      }
    }
  ],
  "flashcards": [
    [
      "How does an SSD store data without moving parts?",
      "Using floating gate transistors that trap electrons in a non-volatile state."
    ],
    [
      "Why is an HDD slower than an SSD?",
      "An HDD must physically move a read/write head and wait for a platter to spin (latency)."
    ],
    [
      "What are 'pits' and 'lands' used for?",
      "They are the physical markers on optical media read by a laser to represent 0s and 1s."
    ],
    [
      "Which storage is best for a server that needs 100TB of backup?",
      "Magnetic (HDD or Tape) due to low cost per GB."
    ],
    [
      "Name one disadvantage of flash memory.",
      "It has a finite number of write cycles before the cells wear out."
    ],
    [
      "Why is secondary storage needed?",
      "It is non-volatile, so data/programs persist without power (unlike RAM), and it offers far greater capacity at lower cost per byte."
    ],
    [
      "How does a hard disk drive (HDD) store data?",
      "Magnetically, on spinning platters read/written by a moving head."
    ],
    [
      "How does an SSD store data, and what is a key limitation?",
      "In flash memory cells with no moving parts — fast and robust, but cells have a finite number of write cycles."
    ]
  ],
  "quiz": [
    {
      "q": "Which of the following uses a laser to read data?",
      "opts": [
        "Hard Drive",
        "SSD",
        "Blu-Ray",
        "USB Stick"
      ],
      "ans": 2,
      "why": "Blu-Ray is an optical format."
    },
    {
      "q": "What is a 'head crash'?",
      "opts": [
        "Software error",
        "Read head touching the platter of an HDD",
        "Laser burning through a CD",
        "SSD overheating"
      ],
      "ans": 1,
      "why": "Mechanical failure in an HDD usually caused by physical impact."
    },
    {
      "q": "Why are SSDs used in smartphones?",
      "opts": [
        "They are cheaper",
        "They use lasers",
        "They are durable and fast",
        "They have infinite capacity"
      ],
      "ans": 2,
      "why": "Durability and speed are essential for mobile devices."
    },
    {
      "q": "Which storage has the highest typical capacity today?",
      "opts": [
        "CD",
        "DVD",
        "HDD",
        "SSD"
      ],
      "ans": 2,
      "why": "Magnetic HDDs currently offer the highest individual capacities for consumers (up to 20TB+)."
    },
    {
      "q": "Which storage type has no moving parts and the fastest access?",
      "opts": ["HDD", "optical disk", "SSD", "magnetic tape"],
      "ans": 2,
      "why": "An SSD uses flash memory with no mechanical parts, giving fast access."
    }
  ],
  "exam": [
    {
      "q": "A photographer needs to store thousands of high-resolution images. Compare the use of an SSD and an HDD for this purpose.",
      "marks": 4,
      "ms": [
        "SSD provides much faster access to files (1)",
        "SSD is more durable for travel (1)",
        "HDD is much cheaper for large amounts of data (1)",
        "HDD can offer larger total capacity for the same price (1)"
      ]
    },
    {
      "q": "Explain why a computer needs secondary storage in addition to main memory (RAM).",
      "marks": 3,
      "ms": [
        "RAM is volatile — it loses its contents when power is off (1)",
        "Secondary storage is non-volatile, so data and programs persist (1)",
        "and it provides much greater capacity at a lower cost per byte (1)"
      ]
    },
    {
      "q": "Compare HDDs and SSDs for use in a laptop, discussing speed, durability, capacity and cost.",
      "marks": 6,
      "ms": [
        "SSD: much faster read/write — no seek time (1)",
        "SSD: more durable / shock-resistant (no moving parts) (1)",
        "SSD: lower power and silent — good for laptops (1)",
        "HDD: larger capacity for the same price (lower cost per GB) (1)",
        "SSD limitation: finite write cycles / higher cost per GB (1)",
        "Justified recommendation, e.g. SSD for speed/durability in a laptop; HDD where bulk cheap storage matters (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);