/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.6.1.1"] = {
  "notes": [
    {
      "h": "Hardware vs Software"
    },
    {
      "callout": {
        "t": "def",
        "h": "Core Definitions",
        "body": [
          {
            "kv": [
              [
                "Hardware",
                "Physical components of a computer system."
              ],
              [
                "Software",
                "Programs and data that run on hardware."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Classification of Software"
    },
    {
      "callout": {
        "t": "def",
        "h": "Software Types",
        "body": [
          {
            "kv": [
              [
                "System software",
                "Manages resources and provides a platform (OS, Utilities, Translators)."
              ],
              [
                "Application software",
                "User-facing programs for specific tasks (Word, Web, Games)."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Comparing Software Classes"
    },
    {
      "table": {
        "head": [
          "Feature",
          "System Software",
          "Application Software"
        ],
        "rows": [
          [
            "Purpose",
            "Manage hardware / Support app execution",
            "End-user productivity / Entertainment"
          ],
          [
            "User Interaction",
            "Low (often background)",
            "High (foreground)"
          ],
          [
            "Examples",
            "Operating Systems, Device Drivers",
            "Web Browser, Video Editor"
          ]
        ]
      }
    },
    {
      "h": "Software Classification Process"
    },
    {
      "steps": [
        {
          "h": "Identify Purpose",
          "m": "Ask whether the program manages hardware resources or provides a platform for other software to run on.",
          "n": "Does it help the hardware run better, or does it enable application software to work?"
        },
        {
          "h": "Check Scope",
          "m": "If it performs general resource management (scheduling, memory allocation, device control), classify it as System software.",
          "n": "If it's for general resource management, it's System software."
        },
        {
          "h": "Check Task",
          "m": "If it performs a specific task directly for the end-user (writing a letter, editing photos, playing a game), classify it as Application software.",
          "n": "If it's for a specific user goal (e.g., writing a letter), it's Application software."
        }
      ]
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Using a System Library (DLL) in Application code",
        "src": "using System.IO; // System software library\n\n// Application code\nFile.WriteAllText(\"test.txt\", \"Hello World\");"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Software Classification",
        "body": "**System software** manages hardware resources and provides a platform for applications — 4 types: OS (resource management), Utilities (maintenance: defrag/antivirus/backup), Libraries (shared reusable code), Translators (compiler/interpreter). **Application software** performs specific end-user tasks (word processor, web browser, game)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Software Classification Misconceptions",
        "body": "**A web browser is system software** — No; browsers are application software (they perform a specific user task: accessing the web). System software manages the computer itself, not user tasks. **Antivirus software is application software** — No; antivirus is a utility program (system software) that maintains and protects the computer system."
      }
    }
  ],
  "flashcards": [
    [
      "What is the difference between hardware and software?",
      "Hardware is physical; software is virtual programs/data."
    ],
    [
      "Define system software.",
      "Software designed to manage computer hardware and provide a platform for running application software."
    ],
    [
      "What is a utility program?",
      "System software designed to optimize, maintain, or configure a computer (e.g., disk defragmenter, antivirus)."
    ],
    [
      "What are library programs?",
      "Pre-compiled routines that can be used by other programs, saving programmers from rewriting code."
    ],
    [
      "Give an example of application software.",
      "Word processor, web browser, video game, etc."
    ],
    [
      "Why can't software run without hardware?",
      "Software is just instructions and data; it needs physical hardware (CPU, memory) to execute and store it."
    ],
    [
      "Give an example of system software.",
      "An operating system, device driver, utility program or translator."
    ],
    [
      "Is firmware hardware or software?",
      "Software — program code stored on a hardware chip (e.g. ROM); the chip itself is the hardware."
    ]
  ],
  "quiz": [
    {
      "q": "Which of the following is an example of system software?",
      "opts": [
        "Word Processor",
        "Web Browser",
        "Operating System",
        "Spreadsheet"
      ],
      "ans": 2,
      "why": "An OS manages hardware and provides a platform for applications."
    },
    {
      "q": "What is the primary purpose of a library program?",
      "opts": [
        "To protect against viruses",
        "To provide reusable, pre-compiled code",
        "To manage hardware resources",
        "To browse the internet"
      ],
      "ans": 1,
      "why": "Libraries provide routines that can be linked to other programs."
    },
    {
      "q": "Which software classification does a disk defragmenter fall under?",
      "opts": [
        "Application software",
        "Operating System",
        "Utility program",
        "Library"
      ],
      "ans": 2,
      "why": "Utilities perform maintenance and optimization tasks."
    },
    {
      "q": "Which of the following best describes hardware?",
      "opts": [
        "The physical components of a system",
        "The programs running on a system",
        "The data stored in memory",
        "The rules for data communication"
      ],
      "ans": 0,
      "why": "Hardware is physical."
    },
    {
      "q": "Which statement is correct?",
      "opts": ["Software is physical and hardware is logical", "Hardware executes the instructions that software provides", "Hardware cannot exist without software", "An operating system is hardware"],
      "ans": 1,
      "why": "Hardware is the physical machine that runs the instructions supplied by software."
    }
  ],
  "exam": [
    {
      "q": "State two differences between system software and application software.",
      "marks": 2,
      "ms": [
        "System software manages the computer hardware/resources (1)",
        "Application software performs specific tasks for the user (1)"
      ]
    },
    {
      "q": "Define the terms hardware and software, and explain how they depend on each other.",
      "marks": 3,
      "ms": [
        "Hardware: the physical components of a computer system (1)",
        "Software: the programs/instructions (and data) that run on the hardware (1)",
        "Interdependent: hardware needs software to know what to do; software needs hardware to execute on (1)"
      ]
    },
    {
      "q": "Discuss the relationship between hardware and software in a modern computer system, referring to how the operating system and applications use the hardware.",
      "marks": 6,
      "ms": [
        "Hardware = physical components (CPU, memory, I/O); software = the instructions that run on it (1)",
        "Neither is useful alone — hardware without software does nothing; software needs hardware to execute (1)",
        "The OS (system software) controls and abstracts the hardware, managing CPU, memory and I/O (1)",
        "Applications run on top of the OS rather than accessing hardware directly (1)",
        "This layering (hardware → OS → application) hides complexity from the user/programmer (1)",
        "Example linking the layers, e.g. a game calls the OS which drives the GPU (1)"
      ]
    }
  ]
};

C["compsci:4.6.1.2"] = {
  "notes": [
    {
      "h": "Classification of Software"
    },
    {
      "callout": {
        "t": "def",
        "h": "The Two Main Pillars",
        "body": [
          {
            "kv": [
              [
                "System Software",
                "Software that manages the computer's resources and provides a platform for applications to run on. It is essential for the operation of the hardware."
              ],
              [
                "Application Software",
                "Software designed to perform specific tasks for the user, such as word processing, browsing the web, or editing photos."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "The Software Hierarchy"
    },
    {
      "callout": {
        "t": "info",
        "h": "Layers of Abstraction",
        "body": "Users interact with Application software, which communicates with the Operating System (System Software), which in turn controls the Hardware. This layered approach allows developers to write apps without knowing the specific details of the hardware."
      }
    },
    {
      "h": "Categorizing System Software"
    },
    {
      "callout": {
        "t": "def",
        "h": "Four Key Categories",
        "body": [
          {
            "kv": [
              [
                "Operating Systems",
                "The core software that manages processor, memory, and devices."
              ],
              [
                "Utility Programs",
                "Maintenance and optimization tools (e.g., encryption, defragmentation)."
              ],
              [
                "Library Programs",
                "Shared code resources that applications can 'call' to perform common tasks."
              ],
              [
                "Translators",
                "Programs that convert source code into machine-readable instructions."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Application Software Examples"
    },
    {
      "table": {
        "head": [
          "Type",
          "Example",
          "Specific Purpose"
        ],
        "rows": [
          [
            "Word Processing",
            "Microsoft Word / Google Docs",
            "Creating and formatting text documents"
          ],
          [
            "Spreadsheet",
            "Excel / Sheets",
            "Numerical data analysis and calculation"
          ],
          [
            "Database",
            "MySQL / Access",
            "Structured data storage and retrieval"
          ],
          [
            "Web Browser",
            "Firefox / Chrome",
            "Accessing and rendering web pages"
          ]
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Logic for Software Classification",
        "src": "IF software.purpose == 'Manage Hardware' THEN\n    classification = 'System'\nELSE IF software.purpose == 'Maintenance' THEN\n    classification = 'System (Utility)'\nELSE IF software.purpose == 'User Task' THEN\n    classification = 'Application'\nENDIF"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "System Software — 4 Categories",
        "body": "System software sits between hardware and applications. 4 types: **OS** (manages processor/memory/I-O/files), **Utilities** (maintenance: defrag, antivirus, backup, compression), **Libraries** (pre-written shared code for common tasks), **Translators** (convert source code to machine code: assembler/compiler/interpreter). Application software sits on top and performs specific user tasks."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "System vs Application Confusion",
        "body": "**A device driver is application software** — No; device drivers are system software that allow the OS to communicate with hardware peripherals. **Spreadsheet software is system software** — No; it performs a specific user task (numerical analysis) so it is application software. The test: does it manage the computer (system) or do something FOR the user (application)?"
      }
    }
  ],
  "flashcards": [
    [
      "Define Application Software.",
      "Software designed to perform specific tasks for the user, rather than managing the computer itself."
    ],
    [
      "What is the primary role of System Software?",
      "To manage the hardware resources and provide a platform for application software to run."
    ],
    [
      "Give three examples of Application Software.",
      "Word processors, Web browsers, Video editors."
    ],
    [
      "Is a device driver System or Application software?",
      "System software (it allows the OS to communicate with hardware)."
    ],
    [
      "Why is the distinction between System and Application software important?",
      "It helps in understanding the level of abstraction and the software's relationship with the hardware."
    ],
    [
      "Define system software.",
      "Software that manages/controls the hardware and provides a platform for applications (OS, utilities, drivers, translators)."
    ],
    [
      "Give two attributes that distinguish system from application software.",
      "System software runs in the background managing the machine; application software is user-facing and performs specific user tasks."
    ],
    [
      "Is a compiler system or application software?",
      "System software — it is a translator that supports developing and running other programs."
    ]
  ],
  "quiz": [
    {
      "q": "Which software category does a video game belong to?",
      "opts": [
        "System Software",
        "Application Software",
        "Utility Program",
        "Translator"
      ],
      "ans": 1,
      "why": "A game is a specific task for the user (entertainment)."
    },
    {
      "q": "What is the main goal of Application Software?",
      "opts": [
        "To optimize the CPU",
        "To provide a user interface for hardware",
        "To perform a specific task for an end-user",
        "To translate high-level code"
      ],
      "ans": 2,
      "why": "Apps are user-focused."
    },
    {
      "q": "Which of these is NOT application software?",
      "opts": [
        "Photo editor",
        "Disk cleaner",
        "Presentation software",
        "Music player"
      ],
      "ans": 1,
      "why": "A disk cleaner is a utility program (System Software)."
    },
    {
      "q": "Which layer sits directly above the Operating System?",
      "opts": [
        "Hardware",
        "User",
        "Application Software",
        "Firmware"
      ],
      "ans": 2,
      "why": "Applications run on top of the platform provided by the OS."
    },
    {
      "q": "Which of these is application software?",
      "opts": ["Device driver", "Disk defragmenter", "Spreadsheet program", "Operating system"],
      "ans": 2,
      "why": "A spreadsheet performs a specific task for the user; the others manage or maintain the system."
    }
  ],
  "exam": [
    {
      "q": "A user downloads a program to help them organize their music collection. State which classification of software this belongs to and justify your answer.",
      "marks": 2,
      "ms": [
        "Application software (1)",
        "Because it performs a specific task for the user (organizing music) (1)"
      ]
    },
    {
      "q": "Explain the difference between system software and application software, giving one example of each.",
      "marks": 3,
      "ms": [
        "System software manages the hardware / provides a platform for other software (1); e.g. operating system / utility / driver (1)",
        "Application software performs specific tasks for the end user (1); e.g. word processor / browser (accept any) (max 3)"
      ]
    },
    {
      "q": "Discuss the need for both system software and application software in a computer system.",
      "marks": 6,
      "ms": [
        "Application software does the user's actual tasks (word processing, browsing, games) (1)",
        "but cannot run without an underlying platform (1)",
        "System software (the OS) manages hardware resources — CPU, memory, I/O (1)",
        "and provides services/abstraction so applications need not control hardware directly (1)",
        "Utilities/drivers maintain and extend the system (1)",
        "Conclusion: the two layers are complementary — applications deliver function, system software makes them runnable (1)"
      ]
    }
  ]
};

C["compsci:4.6.1.3"] = {
  "notes": [
    {
      "h": "Deep Dive into System Software"
    },
    {
      "callout": {
        "t": "def",
        "h": "Definition",
        "body": "System software is a collection of programs that govern the computer system's operation and make it easier for people to use the computer."
      }
    },
    {
      "h": "1. The Operating System (OS)"
    },
    {
      "callout": {
        "t": "info",
        "h": "Core Functions",
        "body": [
          {
            "kv": [
              [
                "Resource Management",
                "Scheduling tasks and managing CPU time."
              ],
              [
                "Memory Management",
                "Allocating RAM to processes and managing virtual memory."
              ],
              [
                "I/O Management",
                "Handling communication with keyboards, mice, and printers."
              ],
              [
                "Security",
                "Managing user accounts, permissions, and firewalls."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "2. Utility Programs"
    },
    {
      "callout": {
        "t": "def",
        "h": "Maintenance Specialists",
        "body": [
          {
            "kv": [
              [
                "Compression",
                "Reducing file size for storage or transmission (e.g., WinZip, gzip)."
              ],
              [
                "Disk Defragmentation",
                "Reorganizing files on a magnetic disk to speed up access."
              ],
              [
                "Antivirus",
                "Detecting and removing malicious software."
              ],
              [
                "Backup",
                "Creating copies of data to prevent loss."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "3. Library Programs"
    },
    {
      "callout": {
        "t": "info",
        "h": "Reusable Code",
        "body": "Libraries are pre-written collections of code (routines) that can be utilized by multiple programs. This reduces development time and ensures consistency."
      }
    },
    {
      "table": {
        "head": [
          "Type",
          "Mechanism",
          "Advantage"
        ],
        "rows": [
          [
            "Static Library",
            "Linked at compile time into the executable.",
            "Self-contained; no external dependencies."
          ],
          [
            "Dynamic (DLL)",
            "Loaded at runtime when needed.",
            "Saves memory; multiple apps share one copy."
          ]
        ]
      }
    },
    {
      "h": "4. Translators"
    },
    {
      "callout": {
        "t": "def",
        "h": "Language Bridges",
        "body": "Translators convert human-readable source code into machine code that the CPU can execute."
      }
    },
    {
      "steps": [
        {
          "h": "Assemblers",
          "m": "Convert assembly language mnemonics (e.g. `MOV R0, #5`) to binary machine code, almost one-to-one per instruction. Output is platform-specific.",
          "n": "Translate Assembly (Mnemonic) code into machine code."
        },
        {
          "h": "Compilers",
          "m": "Translate the entire high-level source program in one pass, producing a standalone executable. The source code and compiler are not needed on the target machine at runtime.",
          "n": "Translate high-level code all at once into an executable file."
        },
        {
          "h": "Interpreters",
          "m": "Translate and immediately execute each source statement one at a time. No output file is produced; the interpreter must be present every time the program is run.",
          "n": "Translate and execute high-level code line-by-line."
        }
      ]
    },
    {
      "code": {
        "lang": "python",
        "cap": "Using a System Library in Python",
        "src": "import os  # Importing a system software library\nimport shutil # Utility library\n\n# Using OS library to get current directory\npath = os.getcwd()\nprint(f\"Current working directory: {path}\")\n\n# Using utility library to copy a file\nshutil.copy('source.txt', 'dest.txt')"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Translators — Key Distinctions",
        "body": "**Assembler**: assembly mnemonics → machine code, near 1:1, platform-specific. **Compiler**: entire high-level source → standalone executable before runtime; source not needed on target machine; reports all errors after full translation. **Interpreter**: translates one statement at a time, no output file produced, source + interpreter needed every run; stops at first error. Java uses both: compiles to bytecode → JVM interprets."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Translator Misconceptions",
        "body": "**An interpreter creates an executable file** — No; interpreters produce no output file. The source code and interpreter must be present every time the program runs. **An assembler is a type of compiler** — No; an assembler converts assembly mnemonics (low-level, near machine code) almost 1:1; a compiler converts high-level language code. They are distinct translator types."
      }
    }
  ],
  "flashcards": [
    [
      "Name four types of system software.",
      "Operating Systems, Utilities, Libraries, Translators."
    ],
    [
      "What is a DLL?",
      "Dynamic Link Library - a shared library file that is loaded only when needed at runtime."
    ],
    [
      "What is the purpose of a disk defragmenter?",
      "To reorganize files on a disk so that parts of the same file are stored in contiguous blocks, speeding up read times."
    ],
    [
      "What does a translator do?",
      "Converts source code from a programming language into machine code."
    ],
    [
      "Explain why a compiler might be preferred over an interpreter.",
      "It produces a standalone executable that runs faster as it doesn't need translation at runtime."
    ],
    [
      "What is the role of an operating system as system software?",
      "To manage hardware resources and provide a platform/services for application software."
    ],
    [
      "What is a library (library program)?",
      "A collection of pre-written, tested, reusable code (functions/classes) that programs can call."
    ],
    [
      "Name the three types of translator.",
      "Compiler, assembler and interpreter."
    ]
  ],
  "quiz": [
    {
      "q": "Which of these is a function of an operating system?",
      "opts": [
        "Compiling C++ code",
        "Editing a spreadsheet",
        "Memory management",
        "Compressing a folder"
      ],
      "ans": 2,
      "why": "Memory management is a core OS responsibility."
    },
    {
      "q": "What type of system software is a backup tool?",
      "opts": [
        "Operating System",
        "Utility Program",
        "Library Program",
        "Translator"
      ],
      "ans": 1,
      "why": "Backup tools are utilities for system maintenance."
    },
    {
      "q": "Which translator is used for assembly language?",
      "opts": [
        "Compiler",
        "Interpreter",
        "Assembler",
        "Linker"
      ],
      "ans": 2,
      "why": "Assemblers are specifically for mnemonics to machine code."
    },
    {
      "q": "Why are library programs useful to developers?",
      "opts": [
        "They speed up the CPU",
        "They provide pre-written code for common tasks",
        "They protect against viruses",
        "They manage the hard drive"
      ],
      "ans": 1,
      "why": "Libraries save time by allowing the reuse of proven code."
    },
    {
      "q": "Which of these is NOT system software?",
      "opts": ["Operating system", "Compiler", "Photo-editing app", "Disk defragmenter"],
      "ans": 2,
      "why": "A photo editor is an application; the others manage or support the system."
    }
  ],
  "exam": [
    {
      "q": "Define the term 'utility program' and give two examples.",
      "marks": 3,
      "ms": [
        "Software designed for maintenance/optimization/configuration of the system (1)",
        "Examples: Antivirus, Defragmenter, Compression, Backup (Any two: 1, 1)"
      ]
    },
    {
      "q": "Describe the functions of two different types of utility program.",
      "marks": 4,
      "ms": [
        "Disk defragmenter: rearranges fragmented files into contiguous blocks to speed up access (1-2)",
        "Compression utility: reduces file size to save storage / aid transfer (1-2)",
        "(accept antivirus, backup, etc. — function must be described; max 4)"
      ]
    },
    {
      "q": "Discuss the need for the different categories of system software (operating systems, utilities, libraries, translators) on a typical computer.",
      "marks": 6,
      "ms": [
        "OS: manages hardware resources and provides a platform for everything else (1)",
        "Utilities: maintain/optimise the system — defragmenter, antivirus, backup (1)",
        "Libraries: provide reusable, tested code so programmers don't re-implement common tasks (1)",
        "Translators: convert source code into executable machine code (compiler/assembler/interpreter) (1)",
        "Together they make the hardware usable and support developing/running applications (1)",
        "Example tying a category to a need (1)"
      ]
    }
  ]
};

C["compsci:4.6.1.4"] = {
  "notes": [
    {
      "h": "Role of an Operating System"
    },
    {
      "callout": {
        "t": "def",
        "h": "Virtual Machine",
        "body": "An OS hides the complexities of the hardware from the user, acting as a virtual machine. It manages hardware and software resources."
      }
    },
    {
      "h": "Key Management Roles"
    },
    {
      "callout": {
        "t": "def",
        "h": "OS Responsibilities",
        "body": [
          {
            "kv": [
              [
                "Processor management",
                "Allocates CPU time to processes (scheduling)."
              ],
              [
                "Memory management",
                "Allocates RAM and manages virtual memory."
              ],
              [
                "I/O management",
                "Communicates via device drivers."
              ],
              [
                "File management",
                "Organizes secondary storage structures."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Comparing Interface Types"
    },
    {
      "table": {
        "head": [
          "Feature",
          "CLI (Command Line)",
          "GUI (Graphical)"
        ],
        "rows": [
          [
            "Ease of Use",
            "Steep learning curve",
            "Intuitive / User friendly"
          ],
          [
            "Resources",
            "Low overhead",
            "High memory/CPU usage"
          ],
          [
            "Speed",
            "Very fast for experts",
            "Slower (multiple clicks)"
          ],
          [
            "Flexibility",
            "Powerful automation / scripts",
            "Limited to provided buttons"
          ]
        ]
      }
    },
    {
      "h": "The Interrupt Handling Process"
    },
    {
      "steps": [
        {
          "h": "Detect",
          "m": "At the end of the current F-E cycle, the CPU checks the interrupt line on the control bus for any pending interrupt signal.",
          "n": "CPU checks for interrupt line signal at the end of each cycle."
        },
        {
          "h": "Save State",
          "m": "The CPU performs a context switch: contents of all registers including the PC are pushed onto the system stack, preserving the current program's state.",
          "n": "CPU pushes current PC and registers onto the stack."
        },
        {
          "h": "Execute ISR",
          "m": "The PC is loaded with the start address of the appropriate Interrupt Service Routine, found via the Interrupt Vector Table; execution transfers to the ISR.",
          "n": "CPU loads the address of the Interrupt Service Routine (ISR) into the PC."
        },
        {
          "h": "Restore",
          "m": "Once the ISR finishes, the saved register values are popped from the stack back into the CPU and the PC is restored, resuming the original program.",
          "n": "Once finished, the saved values are popped from the stack to resume."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Operating System System Call",
        "src": "# Application requesting a resource\nCALL open_file(\"data.csv\")\n# OS takes control, validates permissions, and accesses hardware"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "OS Functions — 4 Management Areas",
        "body": "An OS acts as a **virtual machine** hiding hardware complexity. It manages: **Processor** (scheduling — allocates CPU time to processes), **Memory** (allocates RAM, manages virtual memory/paging), **I/O** (device drivers handle communication with peripherals), **Files** (directory structure, access permissions, physical location tracking)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "OS Misconceptions",
        "body": "**The OS compiles programs** — No; compilation is done by a translator (compiler). The OS provides the execution environment but does not translate code. **A GUI is always faster to use than a CLI** — For expert users, a CLI is often faster (direct commands, no navigation); GUIs use significantly more CPU and memory than a CLI for the same task."
      }
    }
  ],
  "flashcards": [
    [
      "What is the role of an OS?",
      "To manage computer resources and provide a virtual machine hiding hardware complexities."
    ],
    [
      "How does an OS manage memory?",
      "Allocates space in RAM for running programs and manages virtual memory using paging or segmentation."
    ],
    [
      "What is a device driver?",
      "A program that allows the OS to communicate with a specific piece of hardware."
    ],
    [
      "Why is processor scheduling necessary?",
      "To multitask by allocating CPU time slices to active processes, ensuring fairness and efficiency."
    ],
    [
      "What does the OS file management do?",
      "Organizes files in directories, manages access rights, and keeps track of where data is physically stored."
    ],
    [
      "How does an OS hide the complexity of hardware?",
      "It provides abstractions/services (files, processes, drivers) so programs and users don't deal with raw hardware."
    ],
    [
      "Name three resources the OS manages.",
      "Processor (CPU) time, memory, and I/O devices (also files/storage)."
    ],
    [
      "What is a device driver?",
      "Software that lets the OS communicate with and control a specific hardware device."
    ]
  ],
  "quiz": [
    {
      "q": "Which OS function hides the complexity of hardware?",
      "opts": [
        "Memory Management",
        "Virtual Machine",
        "File Management",
        "Interrupt Handling"
      ],
      "ans": 1,
      "why": "The OS acts as a virtual machine, providing a layer of abstraction over hardware."
    },
    {
      "q": "What software allows the OS to interact with a printer?",
      "opts": [
        "Compiler",
        "Interrupt",
        "Device Driver",
        "Library"
      ],
      "ans": 2,
      "why": "Device drivers are required to operate and communicate with peripherals."
    },
    {
      "q": "Which of the following is NOT a role of the OS?",
      "opts": [
        "Translating high-level code to machine code",
        "Managing memory",
        "Scheduling processor time",
        "Providing a user interface"
      ],
      "ans": 0,
      "why": "Translating code is the job of a compiler or interpreter, not the OS."
    },
    {
      "q": "What does processor scheduling achieve?",
      "opts": [
        "Increases hard drive space",
        "Allows multitasking by switching between processes",
        "Translates assembly code",
        "Manages file permissions"
      ],
      "ans": 1,
      "why": "Scheduling shares CPU time among processes, giving the illusion of multitasking."
    },
    {
      "q": "A key role of the operating system is to...?",
      "opts": ["compile programs", "manage hardware resources among competing processes", "store the BIOS", "render web pages"],
      "ans": 1,
      "why": "Resource management — allocating CPU, memory and I/O among processes — is a core OS role."
    }
  ],
  "exam": [
    {
      "q": "Describe the role of the operating system in memory management.",
      "marks": 3,
      "ms": [
        "Allocates memory (RAM) to programs when they load (1)",
        "Deallocates memory when programs close (1)",
        "Uses virtual memory (paging/segmentation) when RAM is full (1)"
      ]
    },
    {
      "q": "State three resources an operating system manages and give one reason management is needed.",
      "marks": 3,
      "ms": [
        "Any three of: processor/CPU time, memory, I/O devices, files/storage (1 per resource, max 2)",
        "Reason: multiple processes compete for limited resources, so the OS must allocate them fairly/efficiently (1)"
      ]
    },
    {
      "q": "Discuss how an operating system manages resources to allow several programs to run apparently at the same time.",
      "marks": 6,
      "ms": [
        "The OS schedules CPU time, switching rapidly between processes (1)",
        "giving the illusion of simultaneous execution (multitasking) (1)",
        "It manages memory, allocating space to each process and using virtual memory when RAM is full (1)",
        "It manages I/O devices via drivers, queuing/arbitrating access (1)",
        "It isolates processes so one cannot corrupt another's memory (1)",
        "Net effect: limited hardware is shared safely and efficiently among competing processes (1)"
      ]
    }
  ]
};

C["compsci:4.6.3.1"] = {
  "notes": [
    { "h": "Types of Program Translators" },
    {
      "callout": {
        "t": "def",
        "h": "Assembler",
        "body": "Translates **assembly language** (mnemonics like `MOV`, `ADD`) into **machine code** (binary). Almost a 1-to-1 mapping. Platform-specific — assembly for one CPU architecture won't work on another."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Compiler",
        "body": "Translates the **entire** high-level source code into machine code **before** execution. Produces a standalone executable. The source code is not needed on the target machine at runtime."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Interpreter",
        "body": "Translates and executes high-level code **one statement at a time**. No executable is produced. The source code and interpreter must be present on the target machine every time the program is run."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Bytecode / Virtual Machine",
        "body": "Some compilers (e.g. Java) produce **intermediate bytecode** rather than machine code. A **Virtual Machine (JVM)** then interprets the bytecode at runtime. Advantage: **platform independence** — the same bytecode runs on any machine with the VM installed."
      }
    },
    {
      "table": {
        "head": ["Feature", "Compiler", "Interpreter"],
        "rows": [
          ["Output", "Standalone executable (.exe)", "No output file produced"],
          ["Execution speed", "Fast — code already translated", "Slow — translates each line at runtime"],
          ["Source code needed to run?", "No — just the executable", "Yes — must be present every time"],
          ["Error reporting", "Reports all errors after full translation", "Stops at the first error encountered"],
          ["Debugging", "Harder — errors shown after full compile", "Easier — see exactly which line failed"],
          ["Distribution", "Easy — share the .exe", "Must share source code (or encrypt it)"]
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Which to Use?",
        "body": "**Interpreter**: better for development/debugging. **Compiler**: better for distribution and performance. Java uses both: compiles to bytecode (portability), then JVM interprets bytecode (platform independence)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common Misconceptions About Translators",
        "body": "An **interpreter does not produce an executable** — writing 'the interpreter outputs machine code' is wrong. Also, an assembler is **not** a compiler; it translates assembly (near machine-level), not a high-level language. Bytecode is **not** machine code — it still needs the JVM to run."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Compiler vs Interpreter — Key Comparison",
        "body": [{"table": {"head": ["Feature", "Compiler", "Interpreter"], "rows": [
          ["Translation", "Whole program at once", "Line by line"],
          ["Output", "Standalone executable", "No output file"],
          ["Source needed at runtime?", "No", "Yes"],
          ["Speed of execution", "Fast", "Slower"],
          ["Error reporting", "All errors after full translation", "Stops at first error"],
          ["Debugging", "Harder", "Easier"]
        ]}}]
      }
    },
    { "h": "The Compilation Process (Stages)" },
    {
      "steps": [
        {
          "h": "Lexical Analysis",
          "m": "Source code is scanned and broken into **tokens** (keywords, identifiers, operators, literals). Whitespace and comments are removed. Output: a flat list of tokens.",
          "n": "A token for `x = x + 1` might be: `[IDENTIFIER:x] [ASSIGN] [IDENTIFIER:x] [PLUS] [NUMBER:1]`."
        },
        {
          "h": "Syntax Analysis (Parsing)",
          "m": "Tokens are checked against the language's **grammar rules**. A **parse tree** (or abstract syntax tree) is produced. Reports syntax errors if the structure violates the grammar.",
          "n": "E.g. `x = + 1` would fail syntax analysis — missing left operand."
        },
        {
          "h": "Semantic Analysis",
          "m": "Checks for **logical errors** that are syntactically valid but meaningless — e.g. using an undeclared variable, type mismatches, or calling a function with wrong arguments.",
          "n": "E.g. `int x = \"hello\"` passes syntax but fails semantic analysis."
        },
        {
          "h": "Code Generation & Optimisation",
          "m": "The compiler generates **machine code** from the AST. The optimiser removes redundant instructions, reorganises for speed, and reduces memory use.",
          "n": "Output is the object code / executable binary."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Same operation at three levels: high-level → assembly → binary.",
        "src": "HL:  x = x + 1\nASM: ADD R0, R0, #1\nBIN: 01011100 00000001"
      }
    }
  ],
  "flashcards": [
    [
      "What does an assembler do?",
      "Translates assembly language into machine code."
    ],
    [
      "How does a compiler work?",
      "Translates the entire high-level source code into an executable machine code file before execution."
    ],
    [
      "What is an advantage of an interpreter?",
      "Finds errors line-by-line, making debugging easier, and is highly portable."
    ],
    [
      "What is an advantage of a compiler?",
      "Produces an executable that runs quickly and doesn't require the source code or compiler to be present on the target machine."
    ],
    [
      "What is bytecode?",
      "An intermediate instruction set produced by some compilers, which is then executed by a virtual machine."
    ],
    [
      "What does a compiler produce?",
      "Machine code / an executable, after translating the whole program at once; it then runs without the source."
    ],
    [
      "When is an interpreter most appropriate?",
      "During development/debugging, or for scripting and cross-platform use — it runs source directly, line by line."
    ],
    [
      "What does an assembler translate, and into what?",
      "Assembly language (low-level mnemonics) into machine code."
    ]
  ],
  "quiz": [
    {
      "q": "Which translator translates code line-by-line?",
      "opts": [
        "Compiler",
        "Assembler",
        "Interpreter",
        "Linker"
      ],
      "ans": 2,
      "why": "Interpreters translate and execute one statement at a time."
    },
    {
      "q": "Which translator creates a standalone executable?",
      "opts": [
        "Compiler",
        "Interpreter",
        "Assembler",
        "Virtual Machine"
      ],
      "ans": 0,
      "why": "Compilers translate the entire source code to object code, which can be run independently."
    },
    {
      "q": "What translates assembly language into machine code?",
      "opts": [
        "Compiler",
        "Interpreter",
        "Assembler",
        "Linker"
      ],
      "ans": 2,
      "why": "Assemblers are specifically for assembly language."
    },
    {
      "q": "What is an advantage of intermediate bytecode?",
      "opts": [
        "It runs faster than machine code",
        "It is platform-independent",
        "It doesn't need to be translated",
        "It is easier for humans to read"
      ],
      "ans": 1,
      "why": "Bytecode can run on any system that has the appropriate Virtual Machine."
    },
    {
      "q": "Which translator converts assembly language into machine code?",
      "opts": ["Compiler", "Interpreter", "Assembler", "Linker"],
      "ans": 2,
      "why": "An assembler translates low-level assembly mnemonics into machine code."
    }
  ],
  "exam": [
    {
      "q": "Discuss one advantage and one disadvantage of using an interpreter compared to a compiler.",
      "marks": 2,
      "ms": [
        "Advantage: Easier to debug as it stops at the line of the error (1)",
        "Disadvantage: Slower execution as each line must be translated at runtime (1)"
      ]
    },
    {
      "q": "Compare compilation and interpretation, giving one situation where each is appropriate.",
      "marks": 4,
      "ms": [
        "Compiler translates the whole program once into machine code → fast execution, standalone exe (1); appropriate for distributing finished software (1)",
        "Interpreter translates and executes line by line → slower but no separate compile step (1); appropriate for development/debugging or scripting (1)"
      ]
    },
    {
      "q": "Discuss the roles of assemblers, compilers and interpreters, and explain why an intermediate language such as bytecode is used.",
      "marks": 6,
      "ms": [
        "Assembler: translates assembly language into machine code (1)",
        "Compiler: translates a whole high-level program into machine code before execution (1)",
        "Interpreter: translates and runs high-level code line by line at runtime (1)",
        "Compiled code is fast but platform-specific; interpreted code is portable but slower (1)",
        "Bytecode is a platform-independent intermediate output run by a virtual machine (1)",
        "so the same bytecode runs anywhere a VM exists (write once, run anywhere) (1)"
      ]
    }
  ]
};

C["compsci:4.6.4.1"] = {
  "notes": [
    { "h": "Logic Gates" },
    {
      "callout": {
        "t": "def",
        "h": "Gate Definitions & Boolean Notation",
        "body": [
          {"kv": [
            ["AND (A · B)", "Output is 1 **only if ALL inputs are 1**. Symbol: · or ∧."],
            ["OR (A + B)", "Output is 1 **if ANY input is 1**. Symbol: + or ∨."],
            ["NOT (¬A)", "**Inverts** the input. 0→1, 1→0. Also written Ā (A-bar)."],
            ["XOR (A ⊕ B)", "Output is 1 **only if inputs are DIFFERENT**. (Exclusive OR)"],
            ["NAND (¬(A·B))", "AND then inverted. Universal gate — can build any circuit."],
            ["NOR (¬(A+B))", "OR then inverted. Also universal."]
          ]}
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "NAND and NOR are Universal Gates",
        "body": "Any logic circuit (AND, OR, NOT, XOR...) can be **built entirely from NAND gates** (or entirely from NOR gates). This is why processors use NAND gates extensively — they're cheaper to fabricate in silicon."
      }
    },
    { "h": "Standard Truth Table" },
    {
      "table": {
        "head": ["A", "B", "A AND B", "A OR B", "A XOR B", "A NAND B", "NOT A"],
        "rows": [
          ["0", "0", "0", "0", "0", "1", "1"],
          ["0", "1", "0", "1", "1", "1", "1"],
          ["1", "0", "0", "1", "1", "1", "0"],
          ["1", "1", "1", "1", "0", "0", "0"]
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "XOR Key Pattern",
        "body": "XOR = 1 when inputs **differ**. The only row XOR = 0 is 0,0 and 1,1. Remember: XOR is used in encryption (one-time pad), half-adder circuits, and parity checking."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Building Truth Tables — Row Count",
        "body": "For $n$ inputs, there are $2^n$ rows in the truth table. 2 inputs → 4 rows. 3 inputs → 8 rows. 4 inputs → 16 rows. Always list inputs in binary counting order: 00, 01, 10, 11."
      }
    },
    { "h": "Evaluating Boolean Circuits" },
    {
      "steps": [
        {
          "h": "Label intermediate outputs",
          "m": "Assign letters (P, Q, R...) to every gate output in the circuit. Work left-to-right from the inputs.",
          "n": "Never try to evaluate the whole circuit at once — label each gate."
        },
        {
          "h": "Fill in the truth table row by row",
          "m": "For each input combination, evaluate each gate in order, using the labelled intermediate values.",
          "n": "Check: does each intermediate column make sense before moving to the next?"
        },
        {
          "h": "Write the Boolean expression",
          "m": "Combine gate outputs using Boolean notation. E.g. if P = A · B and the final gate is P + C, write Q = (A · B) + C.",
          "n": "Brackets matter — use them liberally to avoid ambiguity."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Boolean expression from a circuit with two gates.",
        "src": "# Input: A, B, C\nP = A AND B        # P = A . B\nQ = P OR (NOT C)   # Q = (A . B) + ¬C\n\n# Truth table: enumerate all 8 combinations of A,B,C"
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Logic Gate Misconceptions",
        "body": "**XOR is the same as OR** — No: XOR outputs 0 when BOTH inputs are 1 (it is exclusive — exactly one input must be 1). OR outputs 1 whenever ANY input is 1. For inputs 1,1: OR = 1, XOR = 0. **NAND and NOR cannot do anything AND/OR/NOT cannot** — NAND and NOR are actually more powerful: they are universal gates, meaning any logic circuit can be built entirely from NAND (or entirely from NOR) gates alone."
      }
    }
  ],
  "flashcards": [
    [
      "What is the output of an AND gate if inputs are 1 and 0?",
      "0"
    ],
    [
      "What is the output of an XOR gate if both inputs are 1?",
      "0"
    ],
    [
      "Which gate gives an output of 1 only when both inputs are 0?",
      "NOR gate"
    ],
    [
      "What is the Boolean notation for A XOR B?",
      "A ⊕ B"
    ],
    [
      "Why are NAND gates called universal gates?",
      "Because any logic circuit can be constructed entirely out of NAND gates."
    ],
    [
      "When does an AND gate output 1?",
      "Only when BOTH inputs are 1."
    ],
    [
      "When does an OR gate output 1?",
      "When AT LEAST ONE input is 1."
    ],
    [
      "How many rows does a truth table with 3 inputs have?",
      "2³ = 8 rows (one per input combination)."
    ]
  ],
  "quiz": [
    {
      "q": "Which gate outputs 1 if and only if its inputs are different?",
      "opts": [
        "AND",
        "OR",
        "XOR",
        "NAND"
      ],
      "ans": 2,
      "why": "XOR (Exclusive OR) requires exactly one input to be true."
    },
    {
      "q": "What is the Boolean expression for an OR gate with inputs A and B?",
      "opts": [
        "A . B",
        "A + B",
        "A ⊕ B",
        "NOT A"
      ],
      "ans": 1,
      "why": "Addition symbol (+) represents OR."
    },
    {
      "q": "If A=1 and B=1, what is A NAND B?",
      "opts": [
        "0",
        "1",
        "Null",
        "Error"
      ],
      "ans": 0,
      "why": "A AND B is 1, so NOT(1) is 0."
    },
    {
      "q": "Which gate simply inverts its input?",
      "opts": [
        "NAND",
        "XOR",
        "NOT",
        "NOR"
      ],
      "ans": 2,
      "why": "The NOT gate (inverter) flips 0 to 1 and 1 to 0."
    },
    {
      "q": "A gate outputs 1 only when its single input is 0. Which gate is it?",
      "opts": ["AND", "OR", "NOT", "XOR"],
      "ans": 2,
      "why": "A NOT gate (inverter) outputs the opposite of its single input."
    }
  ],
  "exam": [
    {
      "q": "Complete the truth table for an XOR gate.",
      "marks": 2,
      "ms": [
        "Inputs 0,0 -> 0; 1,1 -> 0 (1)",
        "Inputs 0,1 -> 1; 1,0 -> 1 (1)"
      ]
    },
    {
      "q": "Complete the truth tables for a 2-input AND gate and a 2-input OR gate.",
      "marks": 3,
      "ms": [
        "AND: 00→0, 01→0, 10→0, 11→1 (1)",
        "OR: 00→0, 01→1, 10→1 (1)",
        "OR: 11→1 (1)"
      ]
    },
    {
      "q": "Explain how NAND is a universal gate, and discuss why this is useful in hardware design.",
      "marks": 6,
      "ms": [
        "A universal gate can build any other logic function (1)",
        "NOT from NAND: tie both inputs together (1)",
        "AND from NAND: a NAND followed by a NAND used as an inverter (1)",
        "OR from NAND: invert both inputs then NAND them (De Morgan's) (1)",
        "Useful: a chip can be built from one repeated gate type (1)",
        "simplifying/cheapening manufacture and design consistency (1)"
      ]
    }
  ]
};

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
    }
  ]
};

})(window.KOS_CONTENT);