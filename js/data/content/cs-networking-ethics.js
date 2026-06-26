/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.8.1"] = {
  "notes": [
    { "h": "Consequences of Uses of Computing" },
    {
      "callout": {
        "t": "info",
        "h": "Impact Categories",
        "body": "Computing has far-reaching consequences across five areas: **economic**, **social**, **legal**, **ethical**, and **cultural**. Exam questions often ask you to evaluate an impact across two or more of these dimensions."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Key Legislation",
        "body": [
          {
            "kv": [
              ["Data Protection Act (2018 / GDPR)", "Regulates how personal data is collected, stored, and processed. Data must be fair, lawful, accurate, limited, secure, and not kept longer than needed."],
              ["Computer Misuse Act (1990)", "Criminalises: (1) unauthorised access, (2) unauthorised access with intent to commit further offences, (3) unauthorised modification of data."],
              ["Copyright Designs & Patents Act (1988)", "Protects intellectual property — software, music, literature. Copying without a licence is an offence."],
              ["Regulation of Investigatory Powers Act (RIPA, 2000)", "Governs interception of communications by public authorities (police, intelligence). Controls lawful surveillance."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Economic Impact — Both Sides",
        "body": "Computing **creates** jobs (software development, data analytics, cybersecurity) but **destroys** others through automation (assembly lines, customer service bots, self-checkouts). Exam questions expect you to discuss both."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Digital Divide",
        "body": "The gap between those **with** and **without** access to technology and the Internet. Causes: income inequality, rural infrastructure, age, disability. Perpetuates social inequality — those without access are excluded from services, education, and employment."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Ethical Issues in Computing",
        "body": [
          {"kv": [
            ["Privacy", "Mass surveillance, data collection by tech giants, CCTV, cookies."],
            ["AI bias", "ML models trained on biased data perpetuate discrimination (e.g. facial recognition, hiring algorithms)."],
            ["Environmental", "Data centres consume vast energy; e-waste from disposed devices."],
            ["Accessibility", "Software must be usable by people with disabilities (e.g. screen readers, colour contrast)."]
          ]}
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "DPA compliance check — data not kept longer than needed and must be encrypted.",
        "src": "public class DataPolicy\n{\n    public bool IsCompliant(UserRecord record)\n    {\n        // DPA principle: kept no longer than necessary\n        if (record.AgeInYears > 7) return false;\n\n        // DPA principle: appropriate security (encrypted)\n        if (!record.IsEncrypted) return false;\n\n        return true;\n    }\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Exam Technique",
        "body": "Always name the **specific act** and **specific principle** breached. Don't just write 'illegal' — write 'this breaches the Computer Misuse Act 1990, specifically the offence of unauthorised modification of data'."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "UK Computing Legislation — Quick Reference",
        "body": [{"kv": [
          ["Data Protection Act 2018 (GDPR)", "Personal data must be **fair, lawful, accurate, minimal, secure, purposeful**, and not kept longer than needed."],
          ["Computer Misuse Act 1990", "Three offences: (1) unauthorised access, (2) unauthorised access with intent to commit further offences, (3) unauthorised **modification** of data."],
          ["Copyright, Designs & Patents Act 1988", "Protects **intellectual property** — copying software/music/literature without a licence is a criminal offence."],
          ["RIPA 2000", "Regulates **lawful interception** of communications by authorities (police, GCHQ) — governs surveillance."]
        ]}]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "CMA Offence 1 Does Not Require Intent to Harm",
        "body": "The **first offence** under the CMA 1990 — 'unauthorised access' — does not require any intent to cause damage or commit further crime. Simply accessing a system or data without permission is sufficient for a prosecution. Students often think only 'hacking to steal data' qualifies — even nosing around someone else's files counts."
      }
    }
  ],
  "flashcards": [
    [
      "What does the Data Protection Act ensure?",
      "Personal data must be kept secure and used fairly."
    ],
    [
      "What does the Computer Misuse Act cover?",
      "Unauthorised access to computer systems and data."
    ],
    [
      "What is a cultural issue in computing?",
      "The digital divide, where some groups have less access to technology."
    ],
    [
      "What does the Copyright Designs and Patents Act protect?",
      "Intellectual property such as software, music, and literature."
    ],
    [
      "What is the RIPA?",
      "Regulation of Investigatory Powers Act, covering interception of communications."
    ],
    [
      "Name the four lenses AQA uses for issues of computing.",
      "Moral (individual), ethical (social), legal and cultural."
    ],
    [
      "What does the Data Protection Act / GDPR require?",
      "Personal data must be processed fairly, lawfully and securely, kept accurate, and used only for stated purposes."
    ],
    [
      "What does the Computer Misuse Act make illegal?",
      "Unauthorised access to computer material, unauthorised access with intent, and unauthorised modification of data."
    ]
  ],
  "quiz": [
    {
      "q": "Which act criminalises unauthorised access to computer material?",
      "opts": [
        "Data Protection Act",
        "Computer Misuse Act",
        "Copyright Act",
        "RIPA"
      ],
      "ans": 1,
      "why": "CMA covers unauthorised access."
    },
    {
      "q": "What refers to the gap between those with and without access to technology?",
      "opts": [
        "Digital Divide",
        "Net Neutrality",
        "Open Source",
        "Cultural Lag"
      ],
      "ans": 0,
      "why": "Digital divide is the socioeconomic gap in technology access."
    },
    {
      "q": "Which act governs the interception of digital communications by authorities?",
      "opts": [
        "DPA",
        "CMA",
        "RIPA",
        "CDPA"
      ],
      "ans": 2,
      "why": "RIPA allows authorities to monitor communications."
    },
    {
      "q": "If a company sells user data without permission, which act is breached?",
      "opts": [
        "Data Protection Act",
        "Computer Misuse Act",
        "Copyright Act",
        "Freedom of Information Act"
      ],
      "ans": 0,
      "why": "DPA requires fair and lawful processing of data."
    },
    {
      "q": "Hacking into a system you have no permission to access breaches which law?",
      "opts": ["Data Protection Act", "Computer Misuse Act", "Copyright, Designs and Patents Act", "Regulation of Investigatory Powers Act"],
      "ans": 1,
      "why": "Unauthorised access to computer material is the primary offence under the Computer Misuse Act."
    }
  ],
  "exam": [
    {
      "q": "Discuss two legal issues a company must consider when storing customer data online. (4 marks)",
      "marks": 4,
      "ms": [
        "Must comply with the Data Protection Act (1), ensuring data is secure and kept only as long as necessary (1).",
        "Must protect against unauthorised access under the Computer Misuse Act (1), e.g., by implementing firewalls and encryption (1)."
      ]
    },
    {
      "q": "State three pieces of UK legislation relevant to computing and what each protects against.",
      "marks": 3,
      "ms": [
        "Data Protection Act / GDPR — protects personal data / privacy (1)",
        "Computer Misuse Act — unauthorised access/modification of computer material (1)",
        "Copyright, Designs and Patents Act — protects intellectual property / unlicensed copying (1)"
      ]
    },
    {
      "q": "Discuss the social and ethical impacts — both opportunities and risks — of a new technology such as automation or AI.",
      "marks": 6,
      "ms": [
        "Opportunity: increased efficiency/productivity and new services (1)",
        "Opportunity: improved accessibility / quality of life (1)",
        "Risk: job displacement / deskilling (1)",
        "Risk: privacy, bias or surveillance concerns (1)",
        "Cultural/legal dimension: digital divide, accountability, the need for regulation (1)",
        "Balanced conclusion weighing benefits against risks (1)"
      ]
    }
  ]
};

C["compsci:4.9.1.1"] = {
  "notes": [
    { "h": "Communication Methods" },
    {
      "callout": {
        "t": "def",
        "h": "Serial Transmission",
        "body": "Bits are sent **one at a time** over a single wire (or channel), in sequence. Used for long-distance communication — e.g. USB, SATA, internet connections."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Parallel Transmission",
        "body": "Multiple bits are sent **simultaneously** over multiple wires. Higher throughput over short distances, but suffers from **skew** and **crosstalk** over longer distances. Used internally (e.g. data buses inside a computer)."
      }
    },
    {
      "table": {
        "head": ["Feature", "Serial", "Parallel"],
        "rows": [
          ["Wires", "1 (data wire)", "Multiple (one per bit)"],
          ["Distance", "Long-distance (less degradation)", "Short-distance only"],
          ["Skew risk", "None", "High — bits may arrive at different times"],
          ["Crosstalk risk", "Minimal", "High — adjacent wires interfere"],
          ["Speed", "Lower per cycle", "Higher per cycle (but limited by skew)"],
          ["Examples", "USB, SATA, serial port", "Internal CPU bus, old IDE drives"]
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Synchronous vs Asynchronous",
        "body": [
          {"kv": [
            ["Synchronous", "Sender and receiver share a **clock signal**. Data is sent in timed bursts. More efficient but requires synchronisation hardware. Used in high-speed networks."],
            ["Asynchronous", "No shared clock. Each byte is framed by a **start bit** and one or two **stop bits**. Simpler and flexible, but overhead from framing bits. Used in serial ports, UART."]
          ]}
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Data Skew — Why Parallel Fails at Distance",
        "body": "In parallel transmission, each wire has slightly different resistance/capacitance. At long distances, bits from the same byte arrive at different times (skew), causing data corruption. Serial avoids this entirely."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Serial vs Parallel — Key Distinctions",
        "body": [{"kv": [
          ["Serial", "One wire, **one bit at a time**. Used for long-distance (USB, SATA, internet). No skew or crosstalk."],
          ["Parallel", "Multiple wires, **multiple bits simultaneously**. Short-distance only (internal buses). Suffers from **skew** (bits arrive at different times) and **crosstalk** (interference)."],
          ["Synchronous", "Sender and receiver share a **clock signal** — timed, efficient, needs sync hardware."],
          ["Asynchronous", "No shared clock — each byte framed by **start bit** and **stop bit**. Simpler but overhead from extra bits."]
        ]}]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Parallel Is Not Always Faster Than Serial",
        "body": "In practice, **serial is often faster** than parallel over long distances. Modern USB 3.0 and PCIe use serial at very high speeds. Parallel fails at speed over distance because of skew — bits arrive out of sync, causing errors. 'Parallel means faster' is a common misconception."
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Asynchronous serial port config — 8 data bits, 1 stop bit, no parity.",
        "src": "using System.IO.Ports;\n\nSerialPort port = new SerialPort(\"COM3\", 9600, Parity.None, 8, StopBits.One);\nport.Open();\nport.WriteLine(\"Bits sent one at a time, framed by start/stop bits\");\nport.Close();"
      }
    }
  ],
  "flashcards": [
    [
      "What is serial transmission?",
      "Data is sent one bit at a time over a single wire."
    ],
    [
      "What is parallel transmission?",
      "Multiple bits are sent simultaneously over multiple wires."
    ],
    [
      "Why is serial preferred for long distances?",
      "It avoids data skew and crosstalk that occurs in parallel wires."
    ],
    [
      "What is synchronous transmission?",
      "Data transmission is synchronised by a shared clock signal."
    ],
    [
      "What is asynchronous transmission?",
      "Data is sent with start and stop bits to indicate the beginning and end of a byte, without a shared clock."
    ],
    [
      "What is serial transmission?",
      "Sending data one bit at a time down a single wire/channel."
    ],
    [
      "Why is serial preferred over parallel for long distances?",
      "It avoids skew between wires and reduces crosstalk, so it stays reliable at high speeds; parallel suffers skew over distance."
    ],
    [
      "Difference between synchronous and asynchronous transmission?",
      "Synchronous: sender and receiver share a clock and send a continuous stream; asynchronous: data is framed with start/stop bits and there is no shared clock."
    ]
  ],
  "quiz": [
    {
      "q": "Which transmission type uses a single wire to send bits one after another?",
      "opts": [
        "Serial",
        "Parallel",
        "Synchronous",
        "Asynchronous"
      ],
      "ans": 0,
      "why": "Serial sends bits sequentially on one line."
    },
    {
      "q": "What is data skew?",
      "opts": [
        "Bits arriving out of order in parallel transmission",
        "Interference between wires",
        "Data loss over distance",
        "Incorrect start bits"
      ],
      "ans": 0,
      "why": "Skew happens when parallel signals travel at slightly different speeds."
    },
    {
      "q": "Which transmission type relies on start and stop bits?",
      "opts": [
        "Synchronous",
        "Asynchronous",
        "Parallel",
        "Serial"
      ],
      "ans": 1,
      "why": "Asynchronous uses start/stop bits instead of a clock."
    },
    {
      "q": "What causes crosstalk?",
      "opts": [
        "Electromagnetic interference between adjacent wires",
        "Bits arriving at different times",
        "Clock desynchronisation",
        "Using too few wires"
      ],
      "ans": 0,
      "why": "Crosstalk is interference between parallel wires."
    },
    {
      "q": "Skew (bits arriving at different times) is a problem with which method?",
      "opts": ["serial transmission", "parallel transmission", "synchronous transmission", "asynchronous transmission"],
      "ans": 1,
      "why": "Parallel wires can differ slightly, so bits arrive out of step over distance — skew."
    }
  ],
  "exam": [
    {
      "q": "Explain why serial transmission is generally preferred over parallel transmission for long-distance communication. (3 marks)",
      "marks": 3,
      "ms": [
        "Parallel transmission is susceptible to data skew (1) and crosstalk (1) over long distances.",
        "Serial transmission uses a single wire, eliminating skew and reducing crosstalk, making it more reliable (1)."
      ]
    },
    {
      "q": "Explain what start and stop bits are used for in asynchronous transmission.",
      "marks": 3,
      "ms": [
        "Asynchronous transmission has no shared clock (1)",
        "A start bit marks the beginning of a byte/frame and a stop bit marks the end (1)",
        "so the receiver can correctly identify each unit of data (1)"
      ]
    },
    {
      "q": "Compare serial and parallel transmission, explaining why serial is now preferred even for high-speed links.",
      "marks": 6,
      "ms": [
        "Serial sends one bit at a time on one channel; parallel sends multiple bits at once on many wires (1)",
        "Parallel can be faster over very short distances (1)",
        "but parallel suffers skew — bits arriving out of step over distance (1)",
        "and crosstalk/interference between adjacent wires (1)",
        "Serial avoids skew and crosstalk, so it can be clocked much higher and stays reliable (1)",
        "Hence modern high-speed links (USB, SATA) are serial (1)"
      ]
    }
  ]
};

C["compsci:4.9.1.2"] = {
  "notes": [
    {
      "h": "Communication Basics"
    },
    {
      "callout": {
        "t": "def",
        "h": "Key Metrics",
        "body": [
          {
            "kv": [
              [
                "Baud rate",
                "Number of signal changes per second."
              ],
              [
                "Bit rate",
                "Number of bits transmitted per second."
              ],
              [
                "Bandwidth",
                "Range of frequencies a transmission medium can carry."
              ],
              [
                "Latency",
                "Time delay between a transmission starting and being received."
              ],
              [
                "Protocol",
                "A set of rules governing the exchange of data."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Bit Rate Calculation",
        "body": "$\\text{Bit rate (bps)} = \\text{Baud rate} \\times \\text{bits per signal change}$"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Baud Rate vs Bit Rate",
        "body": "If each signal change encodes only 1 bit, baud rate = bit rate. But modern systems encode multiple bits per signal (e.g. 4 bits → bit rate = 4 × baud rate). Confusing them is a common exam mistake."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Bandwidth Ambiguity",
        "body": "In networking, **bandwidth** can mean: (1) the range of frequencies a medium supports (Hz), or (2) the maximum data transfer rate (bps). In exam questions, context determines which meaning applies."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Baud Rate vs Bit Rate — Key Formula",
        "body": "**Bit rate (bps) = Baud rate × bits per signal change**. If each signal carries 1 bit: baud rate = bit rate. If each signal carries 4 bits: bit rate = 4 × baud rate. Baud rate is never higher than bit rate (when you're encoding ≥1 bit per symbol)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Baud Rate and Bit Rate Are NOT Always Equal",
        "body": "Students often assume baud rate = bit rate. This is only true when each signal change represents exactly **1 bit**. Modern modems and Wi-Fi use multi-level encoding (e.g. QAM-256 encodes 8 bits per symbol), so bit rate >> baud rate. The exam may give you baud rate and bits per signal change and ask you to calculate bit rate."
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Calculating Bit Rate in C#.",
        "src": "int baudRate = 2400;\nint bitsPerSignal = 4;\nint bitRate = baudRate * bitsPerSignal; // 9600 bps"
      }
    }
  ],
  "flashcards": [
    [
      "What is baud rate?",
      "The number of signal changes per second."
    ],
    [
      "What is bit rate?",
      "The number of bits transmitted per second."
    ],
    [
      "How do you calculate bit rate from baud rate?",
      "Bit rate = Baud rate × bits per signal change."
    ],
    [
      "What is latency?",
      "The time delay before data is received."
    ],
    [
      "What is a protocol?",
      "A set of rules governing data exchange."
    ],
    [
      "Define bit rate.",
      "The number of bits transmitted per second (bps)."
    ],
    [
      "Difference between baud rate and bit rate?",
      "Baud rate = signal changes per second; bit rate = bits per second. Bit rate = baud × bits per signal change."
    ],
    [
      "Define latency.",
      "The time delay between data being sent and it being received/acted upon."
    ]
  ],
  "quiz": [
    {
      "q": "If a system has a baud rate of 1000 and 4 bits per signal change, what is the bit rate?",
      "opts": [
        "1000 bps",
        "4000 bps",
        "250 bps",
        "8000 bps"
      ],
      "ans": 1,
      "why": "1000 * 4 = 4000."
    },
    {
      "q": "Which term describes the number of signal state changes per second?",
      "opts": [
        "Bit rate",
        "Baud rate",
        "Bandwidth",
        "Latency"
      ],
      "ans": 1,
      "why": "Baud rate is signal changes per second."
    },
    {
      "q": "What is defined as the set of rules for communication?",
      "opts": [
        "Protocol",
        "Bandwidth",
        "Latency",
        "Topology"
      ],
      "ans": 0,
      "why": "A protocol defines the rules."
    },
    {
      "q": "Which factor does NOT directly affect the speed of file download?",
      "opts": [
        "Bandwidth",
        "Latency",
        "Bit rate",
        "Storage format of the file on disk"
      ],
      "ans": 3,
      "why": "Storage format doesn't affect network transfer speed."
    },
    {
      "q": "If each signal change encodes 2 bits and the baud rate is 4000, the bit rate is...?",
      "opts": ["2000 bps", "4000 bps", "8000 bps", "16000 bps"],
      "ans": 2,
      "why": "Bit rate = baud × bits per change = 4000 × 2 = 8000 bps."
    }
  ],
  "exam": [
    {
      "q": "Define Baud rate and Bit rate, and explain the relationship between them. (3 marks)",
      "marks": 3,
      "ms": [
        "Baud rate is the number of signal changes per second (1).",
        "Bit rate is the number of bits transmitted per second (1).",
        "Bit rate = Baud rate × number of bits represented by each signal change (1)."
      ]
    },
    {
      "q": "Define bandwidth and state its relationship to bit rate.",
      "marks": 2,
      "ms": [
        "Bandwidth: the range of frequencies a channel can carry / its capacity (1)",
        "Higher bandwidth allows a higher bit rate (they are proportional) (1)"
      ]
    },
    {
      "q": "Define baud rate, bit rate, bandwidth and latency, and explain how baud rate and bit rate are related.",
      "marks": 6,
      "ms": [
        "Baud rate: number of signal changes per second (1)",
        "Bit rate: number of bits per second (1)",
        "Bandwidth: the capacity / frequency range of the channel (1)",
        "Latency: the delay between sending and receiving data (1)",
        "Bit rate = baud rate × bits per signal change (1)",
        "so encoding multiple bits per change makes bit rate exceed baud rate (1)"
      ]
    }
  ]
};

C["compsci:4.9.2.1"] = {
  "notes": [
    { "h": "Network Topology" },
    {
      "callout": {
        "t": "def",
        "h": "Star Topology",
        "body": "All devices connect to a **central switch or hub**. Each device has its own dedicated cable to the switch. Used in most modern LANs."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Bus Topology",
        "body": "All devices share a **single backbone cable** (terminated at both ends). Data travels in both directions and is broadcast to all nodes."
      }
    },
    {
      "table": {
        "head": ["Topology", "Benefits", "Limitations"],
        "rows": [
          ["Star", "Fault tolerant — one cable failure only affects that device. Easy to add new devices. Better performance (no collisions via switch).", "More expensive — requires a central switch and more cabling. If the switch fails, the whole network fails."],
          ["Bus", "Cheap — less cabling, no central device needed. Easy to set up for small networks.", "Single point of failure — backbone failure kills the whole network. Collisions increase with load. Difficult to troubleshoot."]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Single Point of Failure",
        "body": "In a **Star** topology, the switch is a single point of failure — if it breaks, all devices lose connectivity. In a **Bus** topology, the backbone cable is that point — and it's harder to diagnose."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Which to Choose?",
        "body": "Star is used in almost all modern networks for reliability and performance. Bus is largely obsolete but appears in exam questions — know its weaknesses."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Star vs Bus — Quick Comparison",
        "body": [{"kv": [
          ["Star failure", "One cable fails → **one device** offline. Switch fails → **whole network** offline."],
          ["Bus failure", "Backbone fails → **whole network** offline immediately."],
          ["Star cost", "**More** expensive — dedicated cable per device + central switch."],
          ["Bus cost", "**Cheaper** — one backbone cable, no central device."],
          ["Collisions", "Star with **switch** = no collisions. Bus = collisions increase with load."]
        ]}]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Star Topology Is Not Immune to Full Failure",
        "body": "A common error is saying 'Star topology never goes fully down'. This is wrong — if the **central switch** fails, the **entire network loses connectivity**. Only individual device cable failures are isolated. The switch is the star's single point of failure."
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Star topology: one cable failure doesn't affect other nodes.",
        "src": "public class NetworkNode\n{\n    public string DeviceID { get; set; }\n    public bool IsConnected { get; set; } = true;\n\n    // In a Star topology, only this node goes offline if its cable breaks.\n    public void SendData(string data) { /* Routed via central switch */ }\n}"
      }
    }
  ],
  "flashcards": [
    [
      "What is a star topology?",
      "All nodes are connected to a central switch or hub."
    ],
    [
      "What is an advantage of a star topology?",
      "If one cable fails, other devices are unaffected."
    ],
    [
      "What is a bus topology?",
      "All nodes are connected to a single central backbone cable."
    ],
    [
      "What is a disadvantage of a bus topology?",
      "If the main cable fails, the entire network goes down."
    ],
    [
      "Which topology suffers more from data collisions?",
      "Bus topology."
    ],
    [
      "Describe a physical star topology.",
      "Every device connects to a central node (switch/hub) by its own dedicated cable."
    ],
    [
      "Describe a logical bus.",
      "All devices share a single communication channel; data is seen by all, and accepted only by the addressee."
    ],
    [
      "Give one advantage of star over bus.",
      "A single cable failure affects only one device; it is easier to add devices and there are fewer collisions."
    ]
  ],
  "quiz": [
    {
      "q": "Which topology relies on a central switch?",
      "opts": [
        "Star",
        "Bus",
        "Ring",
        "Mesh"
      ],
      "ans": 0,
      "why": "Star topology uses a central node."
    },
    {
      "q": "In a bus topology, what happens if the main cable breaks?",
      "opts": [
        "Only one node goes down",
        "The whole network fails",
        "Performance slightly degrades",
        "Data is rerouted"
      ],
      "ans": 1,
      "why": "The backbone cable is a single point of failure."
    },
    {
      "q": "Which is generally more expensive to cable?",
      "opts": [
        "Star",
        "Bus",
        "Peer-to-peer",
        "Client-server"
      ],
      "ans": 0,
      "why": "Star requires a dedicated cable for every device back to the switch."
    },
    {
      "q": "Which topology is most susceptible to collisions as network traffic increases?",
      "opts": [
        "Star",
        "Bus",
        "Mesh",
        "Ring"
      ],
      "ans": 1,
      "why": "Bus shares a single medium, leading to more collisions."
    },
    {
      "q": "In a physical star, if one peripheral's cable breaks...?",
      "opts": ["the whole network fails", "only that one device loses connection", "data collides for everyone", "the switch reboots"],
      "ans": 1,
      "why": "Each device has its own link to the central switch, so the others are unaffected."
    }
  ],
  "exam": [
    {
      "q": "Compare Star and Bus topologies in terms of reliability and cost. (4 marks)",
      "marks": 4,
      "ms": [
        "Star is more reliable because one cable failure only affects one node (1), whereas in Bus, a backbone failure brings down the whole network (1).",
        "Bus is cheaper to install as it requires less cabling (1), whereas Star requires more cabling and a central switch, making it more expensive (1)."
      ]
    },
    {
      "q": "State one advantage and one disadvantage of a physical star topology.",
      "marks": 2,
      "ms": [
        "Advantage: a single device/cable failure doesn't bring down the network / easy to add devices (1)",
        "Disadvantage: more cabling cost, and the central switch is a single point of failure (1)"
      ]
    },
    {
      "q": "Compare physical star and logical bus topologies, explaining their operation and the trade-offs of each.",
      "marks": 6,
      "ms": [
        "Star: each device has its own cable to a central switch (1)",
        "Bus: all devices share one channel/backbone (1)",
        "Star is resilient — one cable fault affects only one device (1)",
        "but needs more cabling and the central switch is a single point of failure (1)",
        "Bus uses little cabling so is cheap (1)",
        "but the shared medium causes collisions and one break can disrupt the network (1)"
      ]
    }
  ]
};

C["compsci:4.9.2.2"] = {
  "notes": [
    { "h": "Peer-to-Peer vs Client-Server" },
    {
      "callout": {
        "t": "def",
        "h": "Client-Server Model",
        "body": "A **dedicated server** manages resources, files, and security for multiple client machines. Clients request services; the server provides them. Used in businesses, schools, and the Internet."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Peer-to-Peer (P2P) Model",
        "body": "All nodes have **equal status** — each can be both a client and a server. Resources are shared directly between peers. No central controlling machine."
      }
    },
    {
      "table": {
        "head": ["Feature", "Client-Server", "Peer-to-Peer"],
        "rows": [
          ["Cost", "High — needs server hardware", "Low — no dedicated server"],
          ["Security", "Centralised, easier to manage", "Hard to control — each node manages itself"],
          ["Backups", "Centralised backups — easy", "Each user responsible for own backups"],
          ["Scalability", "Scales well to large networks", "Degrades with more peers"],
          ["Performance", "Server can become bottleneck", "Distributed — no bottleneck"],
          ["Use case", "Schools, businesses, internet services", "Small home networks, file-sharing apps"]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "P2P Security Risk",
        "body": "In P2P, each device manages its own security. There is no central administrator to enforce policies, patch devices, or revoke access — making P2P networks much more vulnerable."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Exam Technique — 'Justify Your Choice'",
        "body": "If asked which model to use for a school/business, always pick **client-server** and explain: centralised backups, centralised security management, and better scalability. P2P suits only small/home setups."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Client-Server vs P2P — Comparison",
        "body": [{"kv": [
          ["Client-Server cost", "**High** — needs dedicated server hardware."],
          ["P2P cost", "**Low** — no dedicated server; peers share equally."],
          ["Client-Server security", "**Centralised** — admin controls permissions and policies."],
          ["P2P security", "**Decentralised** — each peer manages itself; harder to enforce."],
          ["Client-Server backups", "**Centralised** — easy to automate."],
          ["P2P backups", "**Each user** is responsible for their own."]
        ]}]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "P2P Is Not Inherently Illegal",
        "body": "Peer-to-peer networking is a legitimate architecture used in file-sharing, VoIP, and blockchain. It is only illegal when used to share **copyright-protected** material without permission. The architecture itself is neutral."
      }
    }
  ],
  "flashcards": [
    [
      "What is a client-server network?",
      "A network where clients request resources from a central server."
    ],
    [
      "What is a peer-to-peer network?",
      "A network where all nodes have equal status and share resources directly."
    ],
    [
      "Which network model is easier to back up centrally?",
      "Client-server."
    ],
    [
      "Which network model is cheaper to set up?",
      "Peer-to-peer, as it requires no expensive server hardware."
    ],
    [
      "In which model are security and access rights managed centrally?",
      "Client-server."
    ],
    [
      "Describe peer-to-peer networking.",
      "All hosts are equal — each can act as both client and server, sharing resources directly without a central server."
    ],
    [
      "Describe client-server networking.",
      "Clients request services/resources from one or more central servers that manage them."
    ],
    [
      "When is peer-to-peer appropriate?",
      "Small/home networks or simple file-sharing where central management isn't needed and cost must be low."
    ]
  ],
  "quiz": [
    {
      "q": "Which model uses a central computer to store files and manage access?",
      "opts": [
        "Client-Server",
        "Peer-to-Peer",
        "Bus",
        "Star"
      ],
      "ans": 0,
      "why": "Client-server centralises management."
    },
    {
      "q": "What is a main advantage of Peer-to-Peer?",
      "opts": [
        "Centralised backups",
        "High security",
        "No expensive server needed",
        "Better performance under high load"
      ],
      "ans": 2,
      "why": "P2P avoids server costs."
    },
    {
      "q": "In which network do all computers have equal status?",
      "opts": [
        "Client-Server",
        "Peer-to-Peer",
        "Domain",
        "Active Directory"
      ],
      "ans": 1,
      "why": "P2P nodes are equals."
    },
    {
      "q": "Which model is most suitable for a large corporation?",
      "opts": [
        "Peer-to-Peer",
        "Client-Server",
        "Ad-hoc",
        "Bus"
      ],
      "ans": 1,
      "why": "Client-server scales better for management and security."
    },
    {
      "q": "Central control of security and backups is a strength of which model?",
      "opts": ["peer-to-peer", "client-server", "bus topology", "NAT"],
      "ans": 1,
      "why": "A central server lets administrators manage security, accounts and backups centrally."
    }
  ],
  "exam": [
    {
      "q": "State two advantages of using a client-server network over a peer-to-peer network for a school. (2 marks)",
      "marks": 2,
      "ms": [
        "Centralised backups are easier to manage (1).",
        "Security and user permissions can be centrally controlled (1)."
      ]
    },
    {
      "q": "State two advantages of client-server over peer-to-peer networking.",
      "marks": 2,
      "ms": [
        "Centralised security / user accounts and permissions (1)",
        "Centralised backup and data management (also accept: easier to maintain/scale) (1)"
      ]
    },
    {
      "q": "Compare peer-to-peer and client-server models, and recommend one for (a) a home of three PCs and (b) a 200-user company, justifying each.",
      "marks": 6,
      "ms": [
        "P2P: all hosts equal, share directly, no central server (1)",
        "Client-server: clients request from central servers (1)",
        "P2P is cheaper/simpler but has no central security/backup and degrades at scale (1)",
        "Client-server gives central security/backup but needs server hardware/admin (1)",
        "(a) Home: P2P — cheap, few devices, no admin needed (1)",
        "(b) Company: client-server — central management, security and scalability (1)"
      ]
    }
  ]
};

C["compsci:4.9.2.3"] = {
  "notes": [
    {
      "h": "Wireless Networking"
    },
    {
      "callout": {
        "t": "def",
        "h": "Key Wireless Terms",
        "body": [
          {
            "kv": [
              [
                "Wi-Fi",
                "Uses radio waves to transmit data."
              ],
              [
                "SSID",
                "Service Set Identifier; the network name."
              ],
              [
                "Security",
                "Includes WPA2/WPA3 encryption and MAC address filtering."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Checking for a hidden SSID in C#.",
        "src": "bool IsNetworkVisible(string ssid)\n{\n    var visibleNetworks = GetAvailableNetworks();\n    return visibleNetworks.Contains(ssid);\n    // If hidden, SSID broadcast is disabled.\n}"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "CSMA/CA vs CSMA/CD — Key Distinction",
        "body": [{"kv": [
          ["CSMA/CA", "**Collision Avoidance** — used in **Wi-Fi** (wireless). Devices request permission before transmitting (RTS/CTS). Cannot detect collisions while transmitting."],
          ["CSMA/CD", "**Collision Detection** — used in **Ethernet** (wired). Devices detect a collision after it happens and back off for a random period before retrying."],
          ["Why CA not CD?", "Wireless radios cannot transmit and listen simultaneously — so they avoid collisions rather than detect them."]
        ]}]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "CSMA/CA Does Not Eliminate Collisions",
        "body": "CSMA/CA **reduces** the probability of collisions — it does not prevent them entirely. Collisions can still occur (e.g. two devices both sense the channel as idle at the same moment). Writing 'CSMA/CA prevents all collisions' is wrong."
      }
    },
    {
      "h": "CSMA/CA Process"
    },
    {
      "steps": [
        {
          "h": "Sense",
          "m": "The device listens to the channel to determine whether the transmission medium is currently idle or busy (Carrier Sense).",
          "n": "Device listens to the channel to see if it is idle."
        },
        {
          "h": "Wait",
          "m": "If the channel is busy, the device waits for a random backoff period before sensing again — randomness reduces simultaneous retries.",
          "n": "If busy, wait a random amount of time and try again."
        },
        {
          "h": "Request",
          "m": "Once the channel appears idle, the device sends a Request to Send (RTS) control frame to the wireless access point to reserve the medium.",
          "n": "If idle, send a 'Request to Send' (RTS) to the access point."
        },
        {
          "h": "Confirm",
          "m": "The access point responds with a Clear to Send (CTS) frame, granting exclusive permission to transmit and informing other devices to wait.",
          "n": "Wait for 'Clear to Send' (CTS) before transmitting data."
        },
        {
          "h": "ACK",
          "m": "After the data frame is received successfully, the receiver sends an Acknowledgement (ACK) frame; if the sender receives no ACK, it assumes a collision and will retry after a random backoff.",
          "n": "Receiver sends an ACK; if not received, assume collision."
        }
      ]
    }
  ],
  "flashcards": [
    [
      "What does CSMA/CA stand for?",
      "Carrier Sense Multiple Access with Collision Avoidance."
    ],
    [
      "What is the purpose of CSMA/CA?",
      "To reduce the chance of data collisions on a wireless network."
    ],
    [
      "What is an SSID?",
      "Service Set Identifier, the name of a wireless network."
    ],
    [
      "How can you secure a wireless network?",
      "Using WPA2/WPA3 encryption, MAC filtering, or hiding the SSID."
    ],
    [
      "What medium does Wi-Fi use to transmit data?",
      "Radio waves."
    ],
    [
      "What components are needed for a wireless network?",
      "A wireless access point (WAP)/router and devices with wireless network interface cards (NICs)."
    ],
    [
      "How are wireless networks secured?",
      "WPA2/WPA3 encryption with a pre-shared key/password, optionally MAC-address filtering or a hidden SSID."
    ],
    [
      "What does CSMA/CA do?",
      "Carrier Sense Multiple Access with Collision Avoidance — a device checks the channel is free, and uses back-off and acknowledgements to avoid collisions."
    ]
  ],
  "quiz": [
    {
      "q": "Which protocol is used in Wi-Fi to avoid collisions?",
      "opts": [
        "CSMA/CD",
        "CSMA/CA",
        "TCP",
        "UDP"
      ],
      "ans": 1,
      "why": "CA (Collision Avoidance) is used in wireless."
    },
    {
      "q": "What does an SSID identify?",
      "opts": [
        "A specific device's hardware address",
        "The wireless network's name",
        "The encryption key",
        "The router's IP address"
      ],
      "ans": 1,
      "why": "SSID is the network name."
    },
    {
      "q": "Why is CSMA/CA used instead of CSMA/CD in wireless networks?",
      "opts": [
        "Wireless devices cannot transmit and receive simultaneously to detect collisions",
        "It is faster",
        "It uses less power",
        "It encrypts data"
      ],
      "ans": 0,
      "why": "Wireless radios usually can't listen while transmitting, so they must avoid collisions rather than detect them."
    },
    {
      "q": "Which of the following secures a wireless network?",
      "opts": [
        "CSMA/CA",
        "WPA3",
        "SSID broadcast",
        "DHCP"
      ],
      "ans": 1,
      "why": "WPA3 is a security protocol."
    },
    {
      "q": "Which protocol governs how wireless devices avoid transmitting at the same time?",
      "opts": ["CSMA/CD", "CSMA/CA", "TCP", "DHCP"],
      "ans": 1,
      "why": "Wireless uses CSMA/CA (Collision Avoidance) because it can't reliably detect collisions like wired CSMA/CD."
    }
  ],
  "exam": [
    {
      "q": "Explain how CSMA/CA operates to transmit data on a wireless network. (4 marks)",
      "marks": 4,
      "ms": [
        "Device listens to the channel to see if it's idle (1).",
        "If busy, it waits a random amount of time (1).",
        "If idle, it transmits an RTS (Request to Send) or begins transmission (1).",
        "Waits for an ACK (Acknowledgement); if none received, assumes collision and retries (1)."
      ]
    },
    {
      "q": "Explain two ways a wireless network can be made secure.",
      "marks": 3,
      "ms": [
        "Encryption (WPA2/WPA3) so intercepted traffic is unreadable (1)",
        "A strong pre-shared key/password controls who can join (1)",
        "MAC-address whitelisting / disabling SSID broadcast (1) (max 3)"
      ]
    },
    {
      "q": "Explain how CSMA/CA lets multiple wireless devices share a channel, and why CSMA/CD (used on wired networks) is unsuitable for wireless.",
      "marks": 6,
      "ms": [
        "A device listens to check the channel is idle before transmitting (carrier sense) (1)",
        "If busy, it waits a random back-off time then re-checks (1)",
        "It may use RTS/CTS to reserve the channel (1)",
        "The receiver returns an ACK; no ACK implies a collision, so the sender retries (1)",
        "CSMA/CD detects collisions by sensing the wire, but wireless devices often can't hear each other (hidden node) (1)",
        "so collisions can't be reliably detected — avoidance (CA) is used instead of detection (CD) (1)"
      ]
    }
  ]
};

C["compsci:4.9.3.1"] = {
  "notes": [
    { "h": "Internet & Packet Switching" },
    {
      "callout": {
        "t": "def",
        "h": "The Internet",
        "body": "A global network of interconnected networks using the TCP/IP protocol suite. Distinct from the World Wide Web (which is a service running on top of the Internet)."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Router",
        "body": "A device that **connects networks** and forwards data packets between them using IP addresses. Routers use routing tables to determine the best path for each packet."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "DNS — Domain Name System",
        "body": "Translates **human-readable domain names** (e.g. `bbc.co.uk`) into **IP addresses** (e.g. `151.101.0.81`). Works hierarchically: local cache → ISP DNS → root servers."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Packet Switching",
        "body": "Data is broken into **packets**, each with a header (source IP, destination IP, sequence number, checksum). Packets travel independently across the network and are reassembled at the destination."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Benefits of Packet Switching",
        "body": "Efficient use of network bandwidth (no dedicated line needed). Fault tolerant — if one route is blocked, packets re-route automatically. Packets from different sources can share the same links."
      }
    },
    { "h": "Packet Switching Process" },
    {
      "steps": [
        {
          "h": "Splitting",
          "m": "Data is broken into small, fixed-size chunks called packets.",
          "n": "Smaller packets are easier to re-route and retransmit on error."
        },
        {
          "h": "Addressing",
          "m": "Each packet is given a header: source IP, destination IP, sequence number, checksum.",
          "n": "The sequence number allows reassembly in the correct order."
        },
        {
          "h": "Routing",
          "m": "Routers forward each packet independently using its destination IP. Different packets may take different routes.",
          "n": "The path chosen depends on current network traffic — dynamic routing."
        },
        {
          "h": "Reassembly",
          "m": "At the destination, packets are reordered by sequence number and reassembled into the original data.",
          "n": "If a packet is missing or corrupt (checksum mismatch), it is requested again."
        }
      ]
    },
    {
      "callout": {
        "t": "warn",
        "h": "Internet ≠ World Wide Web",
        "body": "The **Internet** is the underlying network infrastructure (physical cables, routers, etc.). The **WWW** is a service that runs on the Internet, consisting of web pages accessed via HTTP/HTTPS. Email, FTP, and DNS are also Internet services — not part of the WWW."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Packet Header Contents",
        "body": "Every packet carries: **Source IP** (where it came from), **Destination IP** (where it is going), **Sequence number** (for reassembly order), **Checksum** (for error detection), and **TTL** (Time to Live — max hops before the packet is discarded to prevent infinite loops)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Packets Do NOT Always Arrive In Order",
        "body": "Because each packet can take a different route, they often arrive **out of order** at the destination. The sequence number in the header is used to **reassemble them correctly**. Saying 'packet switching ensures packets arrive in order' is incorrect."
      }
    }
  ],
  "flashcards": [
    [
      "What is packet switching?",
      "Breaking data into packets which take independent routes to their destination."
    ],
    [
      "What is the role of a router?",
      "To connect networks and forward data packets to their destination using IP addresses."
    ],
    [
      "What does DNS stand for?",
      "Domain Name System."
    ],
    [
      "What is the function of DNS?",
      "To translate domain names into IP addresses."
    ],
    [
      "What information is typically in a packet header?",
      "Source IP, destination IP, sequence number, and checksum."
    ],
    [
      "What is packet switching?",
      "Data is split into packets that are routed independently across the network and reassembled at the destination."
    ],
    [
      "What is a router's job?",
      "To forward packets between networks toward their destination, using the destination IP and a routing table."
    ],
    [
      "Difference between a router and a gateway?",
      "A router connects networks using the same protocol; a gateway also translates between networks using different protocols."
    ]
  ],
  "quiz": [
    {
      "q": "What translates a URL into an IP address?",
      "opts": [
        "DHCP",
        "DNS",
        "NAT",
        "Router"
      ],
      "ans": 1,
      "why": "DNS handles name resolution."
    },
    {
      "q": "In packet switching, do packets always take the same route?",
      "opts": [
        "Yes",
        "No"
      ],
      "ans": 1,
      "why": "Packets can take different routes based on network traffic."
    },
    {
      "q": "Which device is primarily responsible for routing packets between different networks?",
      "opts": [
        "Switch",
        "Hub",
        "Router",
        "Modem"
      ],
      "ans": 2,
      "why": "Routers forward packets between networks."
    },
    {
      "q": "Which part of a packet ensures it can be put back in order?",
      "opts": [
        "Payload",
        "Checksum",
        "Sequence number",
        "Source IP"
      ],
      "ans": 2,
      "why": "Sequence numbers allow reassembly in the correct order."
    },
    {
      "q": "Packets of one message may take different routes and arrive out of order. What lets them be reassembled correctly?",
      "opts": ["the checksum", "the sequence number", "the TTL", "the MAC address"],
      "ans": 1,
      "why": "Sequence numbers record each packet's order so the destination can reassemble them."
    }
  ],
  "exam": [
    {
      "q": "Describe the process of packet switching. (4 marks)",
      "marks": 4,
      "ms": [
        "Data is broken down into smaller packets (1).",
        "Each packet is given a header with sequence number and IP addresses (1).",
        "Packets travel independently across the network taking the best available route (1).",
        "Packets are reassembled in the correct order at the destination (1)."
      ]
    },
    {
      "q": "State three components contained in a packet header.",
      "marks": 3,
      "ms": [
        "Source IP address (1)",
        "Destination IP address (1)",
        "Sequence number / packet number (also accept TTL, checksum) (1)"
      ]
    },
    {
      "q": "Explain how packet switching delivers a message across the Internet, referring to packets, routers and reassembly.",
      "marks": 6,
      "ms": [
        "The message is split into packets, each with a header (source/dest IP, sequence number) (1)",
        "Each packet is routed independently across the network (1)",
        "Routers forward packets toward the destination using routing tables (1)",
        "Packets may take different routes and arrive out of order (1)",
        "The TTL stops packets circulating forever / the checksum detects corruption (1)",
        "At the destination, sequence numbers are used to reassemble the message in order (1)"
      ]
    }
  ]
};

C["compsci:4.9.3.2"] = {
  "notes": [
    { "h": "Internet Security" },
    {
      "callout": {
        "t": "def",
        "h": "Firewall",
        "body": "Hardware or software that **monitors and filters** incoming and outgoing network traffic based on a set of security rules. Can block ports, IP ranges, or specific protocols."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Encryption",
        "body": "The process of converting plaintext into ciphertext so only authorised parties can read it. Two main types: **symmetric** (one shared key) and **asymmetric** (public/private key pair)."
      }
    },
    {
      "table": {
        "head": ["Encryption Type", "Key Structure", "Use Case", "Speed"],
        "rows": [
          ["Symmetric", "Same key encrypts and decrypts", "Bulk data (e.g. AES for files)", "Fast"],
          ["Asymmetric", "Public key encrypts; private key decrypts", "Key exchange, digital signatures, HTTPS", "Slower"]
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Digital Certificate",
        "body": "An electronic document that binds a **public key** to an organisation/website, issued by a trusted **Certificate Authority (CA)**. Used in HTTPS to verify you're connecting to the genuine server."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Malware Types",
        "body": [
          {"kv": [
            ["Virus", "Attaches to files; spreads when the file is run. Requires user action to propagate."],
            ["Worm", "Self-replicates across a network without user action. No host file needed."],
            ["Trojan", "Disguised as legitimate software. Does not self-replicate but creates a backdoor."],
            ["Ransomware", "Encrypts victim's files and demands payment for the decryption key."],
            ["Spyware", "Secretly monitors user activity and sends data to an attacker."]
          ]}
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Symmetric vs Asymmetric — Exam Trick",
        "body": "In HTTPS, **asymmetric encryption** is used first to securely exchange a **symmetric session key**, then **symmetric encryption** handles the bulk of the data transfer (much faster). This is called a 'hybrid' approach."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Worm vs Virus",
        "body": "A **worm** spreads independently across a network — no user interaction needed. A **virus** needs a host file and user action (opening the file) to spread. This distinction is commonly examined."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Firewall ≠ Antivirus",
        "body": "A firewall controls **network traffic** (blocks/allows connections). Antivirus software detects **malware already on the device**. They are complementary, not the same thing. A firewall does not scan files."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Malware Quick Reference",
        "body": [{"kv": [
          ["Virus", "Attaches to a **host file**; spreads when that file is **run** by the user."],
          ["Worm", "**Self-replicates** across a network with **no user action** needed. No host file."],
          ["Trojan", "Disguised as legitimate software; creates a **backdoor** but does not self-replicate."],
          ["Ransomware", "**Encrypts** victim files and demands a ransom for the decryption key."],
          ["Spyware", "Secretly **monitors** activity and sends data to the attacker."]
        ]}]
      }
    }
  ],
  "flashcards": [
    [
      "What is a firewall?",
      "Hardware or software that monitors and controls incoming and outgoing network traffic based on security rules."
    ],
    [
      "What is symmetric encryption?",
      "Encryption where the same key is used to encrypt and decrypt data."
    ],
    [
      "What is asymmetric encryption?",
      "Encryption using a public key to encrypt and a private key to decrypt."
    ],
    [
      "What is a digital certificate?",
      "An electronic document used to prove the ownership of a public key, issued by a CA."
    ],
    [
      "Name three types of malware.",
      "Viruses, worms, trojans (or ransomware, spyware)."
    ],
    [
      "How does a packet-filtering firewall work?",
      "It inspects each packet's headers (IP/port) against rules and allows or blocks the packet accordingly."
    ],
    [
      "Difference between symmetric and asymmetric encryption?",
      "Symmetric: one shared key for both encrypt and decrypt. Asymmetric: a public key encrypts and the matching private key decrypts (a key pair)."
    ],
    [
      "What is a digital certificate?",
      "A trusted-authority-signed document binding a public key to an identity, so you can verify who you're communicating with."
    ]
  ],
  "quiz": [
    {
      "q": "Which encryption type uses a public and a private key pair?",
      "opts": [
        "Symmetric",
        "Asymmetric",
        "Hashing",
        "Caesar Cipher"
      ],
      "ans": 1,
      "why": "Asymmetric uses two different keys."
    },
    {
      "q": "What does a firewall primarily do?",
      "opts": [
        "Encrypts data",
        "Blocks unauthorised network traffic",
        "Detects viruses on the hard drive",
        "Translates IP addresses"
      ],
      "ans": 1,
      "why": "Firewalls filter traffic based on rules."
    },
    {
      "q": "Who issues a digital certificate?",
      "opts": [
        "ISP",
        "Router",
        "Certificate Authority (CA)",
        "DNS server"
      ],
      "ans": 2,
      "why": "CAs issue digital certificates."
    },
    {
      "q": "Which malware self-replicates across networks without user action?",
      "opts": [
        "Virus",
        "Trojan",
        "Worm",
        "Spyware"
      ],
      "ans": 2,
      "why": "Worms replicate independently across networks."
    },
    {
      "q": "In asymmetric encryption, a message encrypted with someone's PUBLIC key can be decrypted with...?",
      "opts": ["the same public key", "their private key", "any private key", "a shared symmetric key"],
      "ans": 1,
      "why": "Only the matching private key can decrypt what its public key encrypted."
    }
  ],
  "exam": [
    {
      "q": "Explain how asymmetric encryption works when sending a secure message. (3 marks)",
      "marks": 3,
      "ms": [
        "The sender uses the receiver's public key to encrypt the message (1).",
        "The ciphertext is transmitted over the network (1).",
        "The receiver uses their own private key to decrypt the message (1)."
      ]
    },
    {
      "q": "Describe how a firewall using stateful inspection protects a network.",
      "marks": 3,
      "ms": [
        "It tracks the state of active connections (1)",
        "and checks that incoming packets belong to a legitimate, established connection (1)",
        "blocking unsolicited/unexpected packets that don't match a known connection (1)"
      ]
    },
    {
      "q": "Explain how asymmetric encryption and digital signatures together provide confidentiality and authentication for a message.",
      "marks": 6,
      "ms": [
        "Asymmetric encryption uses a public/private key pair (1)",
        "Confidentiality: the sender encrypts with the recipient's PUBLIC key (1)",
        "so only the recipient's PRIVATE key can decrypt it (1)",
        "Authentication: the sender signs a hash of the message with their OWN private key (1)",
        "The recipient verifies the signature using the sender's public key (1)",
        "confirming the sender's identity and that the message is unaltered (integrity) (1)"
      ]
    }
  ]
};

C["compsci:4.9.4.1"] = {
  "notes": [
    {
      "h": "The TCP/IP Protocol Stack"
    },
    {
      "callout": {
        "t": "def",
        "h": "Architectural Overview",
        "body": [
          {
            "kv": [
              [
                "Definition",
                "A set of networking protocols that allow computers to communicate across networks."
              ],
              [
                "Layering",
                "The stack is divided into four conceptual layers, each providing services to the layer above it."
              ],
              [
                "Encapsulation",
                "The process of adding headers (and sometimes footers) to data as it moves down the stack."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "The Four Layers",
        "body": [
          {
            "table": {
              "head": [
                "Layer",
                "Role",
                "Typical Protocols"
              ],
              "rows": [
                [
                  "Application",
                  "Interfaces with software applications; formats data.",
                  "HTTP, HTTPS, FTP, SMTP, SSH"
                ],
                [
                  "Transport",
                  "Handles end-to-end communication, reliability, and flow control. Splits data into segments.",
                  "TCP, UDP"
                ],
                [
                  "Network",
                  "Routes packets across different networks using logical addresses.",
                  "IP, ICMP"
                ],
                [
                  "Link",
                  "Handles physical transmission of data frames across a local medium.",
                  "Ethernet, Wi-Fi (802.11)"
                ]
              ]
            }
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Sockets",
        "body": [
          {
            "kv": [
              [
                "Definition",
                "An endpoint of a two-way communication link between two programs running on the network."
              ],
              [
                "Composition",
                "Socket = IP Address + Port Number (e.g., 192.168.1.1:80)."
              ],
              [
                "Function",
                "Ensures that data arriving at a machine is directed to the correct application process."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Conceptual C# Socket Connection.",
        "src": "using System.Net;\nusing System.Net.Sockets;\n\n// Create a socket endpoint\nIPAddress ip = IPAddress.Parse(\"192.168.1.10\");\nIPEndPoint remoteEP = new IPEndPoint(ip, 80);\n\n// Create a TCP/IP socket\nSocket sender = new Socket(ip.AddressFamily, SocketType.Stream, ProtocolType.Tcp);\n\ntry {\n    sender.Connect(remoteEP);\n    byte[] msg = System.Text.Encoding.ASCII.GetBytes(\"GET / HTTP/1.1\\r\\n\\r\\n\");\n    int bytesSent = sender.Send(msg);\n} finally {\n    sender.Shutdown(SocketShutdown.Both);\n    sender.Close();\n}"
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Data Units by Layer",
        "body": [
          {
            "kv": [
              [
                "Application",
                "Data / Message"
              ],
              [
                "Transport",
                "Segment (TCP) / Datagram (UDP)"
              ],
              [
                "Network",
                "Packet"
              ],
              [
                "Link",
                "Frame"
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "TCP/IP Layers — Mnemonic: 'All Tigers Need Love'",
        "body": [{"table": {"head": ["Layer (top→bottom)", "Mnemonic", "Protocols", "Data Unit"], "rows": [
          ["Application", "**A**ll", "HTTP, HTTPS, FTP, SMTP, DNS", "Message"],
          ["Transport", "**T**igers", "TCP (reliable), UDP (fast, unreliable)", "Segment / Datagram"],
          ["Network", "**N**eed", "IP, ICMP", "Packet"],
          ["Link", "**L**ove", "Ethernet, Wi-Fi (802.11)", "Frame"]
        ]}}]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Encapsulation Adds Headers Going DOWN, Not Up",
        "body": "Headers are **added** as data travels **down** the stack (encapsulation) and **stripped** as data travels **up** the stack at the receiving end (decapsulation). A common error is saying headers are added going up — this is backwards."
      }
    }
  ],
  "flashcards": [
    [
      "Name the 4 layers of the TCP/IP stack in order (top-down).",
      "Application, Transport, Network, Link."
    ],
    [
      "What is encapsulation in the TCP/IP stack?",
      "Adding protocol headers to data as it passes down through the layers."
    ],
    [
      "What constitutes a network socket?",
      "An IP address combined with a port number."
    ],
    [
      "What is the primary role of the Network layer?",
      "Routing packets across different networks using IP addresses."
    ],
    [
      "Which layer is responsible for flow control and error checking?",
      "Transport layer (specifically TCP)."
    ],
    [
      "Name the four TCP/IP layers.",
      "Application, Transport, Network (Internet), and Link (Network access)."
    ],
    [
      "What does the Transport layer (TCP) do?",
      "Splits data into segments and manages reliable delivery — error checking, retransmission and ordering — using port numbers."
    ],
    [
      "What is a socket?",
      "A communication endpoint = an IP address combined with a port number."
    ]
  ],
  "quiz": [
    {
      "q": "Which layer of the TCP/IP stack is responsible for adding MAC addresses?",
      "opts": [
        "Application",
        "Transport",
        "Network",
        "Link"
      ],
      "ans": 3,
      "why": "The Link layer handles physical addressing via MAC addresses."
    },
    {
      "q": "What is the result of IP Address + Port Number?",
      "opts": [
        "Packet",
        "Frame",
        "Socket",
        "Segment"
      ],
      "ans": 2,
      "why": "A socket is the combination of an IP and a port."
    },
    {
      "q": "At which layer do HTTP and SMTP operate?",
      "opts": [
        "Application",
        "Transport",
        "Network",
        "Link"
      ],
      "ans": 0,
      "why": "They are high-level protocols interfacing with software."
    },
    {
      "q": "Which process describes removing headers as data moves up the stack?",
      "opts": [
        "Encapsulation",
        "Decapsulation",
        "Routing",
        "Switching"
      ],
      "ans": 1,
      "why": "Decapsulation is the reverse of encapsulation."
    },
    {
      "q": "Adding headers as data passes DOWN the TCP/IP stack is called...?",
      "opts": ["decapsulation", "encapsulation", "routing", "handshaking"],
      "ans": 1,
      "why": "Each layer wraps the data with its own header — encapsulation; the reverse on receipt is decapsulation."
    }
  ],
  "exam": [
    {
      "q": "Explain the role of the Transport layer when a file is being sent over a network. (4 marks)",
      "marks": 4,
      "ms": [
        "Receives data from the application layer and splits it into segments (1).",
        "Adds port numbers to specify the source and destination applications (1).",
        "Assigns sequence numbers to segments to ensure they can be reassembled in order (1).",
        "Manages error checking/retransmission to ensure reliable delivery (1)."
      ]
    },
    {
      "q": "State the role of the Network (Internet) layer and the Link layer in the TCP/IP stack.",
      "marks": 3,
      "ms": [
        "Network layer: adds source/destination IP addresses and routes packets across networks (1)",
        "Link layer: handles local/physical transmission, adding MAC addresses (1)",
        "and putting frames onto the physical medium (1)"
      ]
    },
    {
      "q": "Describe how data is encapsulated as it passes down the four layers of the TCP/IP stack when sending a web request.",
      "marks": 6,
      "ms": [
        "Application layer: forms the request using an application protocol (e.g. HTTP) (1)",
        "Transport layer: splits it into segments and adds port numbers (TCP) for reliable delivery (1)",
        "Network layer: adds source and destination IP addresses → packets (1)",
        "Link layer: adds MAC addresses → frames for the local link (1)",
        "Each layer adds its own header (encapsulation) (1)",
        "The receiver reverses this (decapsulation) up the stack (1)"
      ]
    }
  ]
};

C["compsci:4.9.4.3"] = {
  "notes": [
    {
      "h": "IP Address Structure & Addressing"
    },
    {
      "callout": {
        "t": "def",
        "h": "Core Components",
        "body": [
          {
            "kv": [
              [
                "IP Address",
                "A logical numeric identifier assigned to every device on a network using the Internet Protocol."
              ],
              [
                "Dotted-Decimal",
                "IPv4 addresses are 32-bit values often written as four 8-bit octets (0-255) separated by dots."
              ],
              [
                "Network ID",
                "The portion of the address that identifies the specific network (subnet) the device belongs to."
              ],
              [
                "Host ID",
                "The portion of the address that identifies the specific device within that network."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Address Breakdown Example",
        "body": [
          {
            "table": {
              "head": [
                "Address",
                "Binary Representation",
                "Classification"
              ],
              "rows": [
                [
                  "192.168.1.50",
                  "11000000.10101000.00000001.00110010",
                  "Class C (Private)"
                ],
                [
                  "10.0.0.1",
                  "00001010.00000000.00000000.00000001",
                  "Class A (Private)"
                ],
                [
                  "8.8.8.8",
                  "00001000.00001000.00001000.00001000",
                  "Public (Google DNS)"
                ]
              ]
            }
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Parsing and analyzing an IP address.",
        "src": "using System.Net;\n\nIPAddress ip = IPAddress.Parse(\"192.168.1.50\");\nbyte[] bytes = ip.GetAddressBytes();\n\n// Display octets\nforeach (byte b in bytes) {\n    Console.WriteLine($\"Octet: {b} (Binary: {Convert.ToString(b, 2).PadLeft(8, '0')})\");\n}\n\n// Check if it's on a Class C private range\nif (bytes[0] == 192 && bytes[1] == 168) {\n    Console.WriteLine(\"Private Network detected.\");\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Hierarchical Routing",
        "body": "Routers use the Network ID to get packets to the correct LAN, and only then is the Host ID used to find the specific machine. This prevents routers from needing to know every single device's location on earth."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "IPv4 Address Structure",
        "body": "IPv4 = **32 bits**, written as **4 octets** in dotted-decimal (each 0–255). Split into: **Network ID** (identifies the network) + **Host ID** (identifies the device within that network). Routers forward packets using the Network ID; only the final router on the destination LAN uses the Host ID to deliver to the specific machine."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common IP Addressing Mistakes",
        "body": "**All four octets identify the device** — only the Host ID octets do; the Network ID octets identify the network, not individual machines. **The Network ID is always the first three octets** — the split depends on the class or CIDR prefix: Class A uses 8 bits for Network ID, Class B uses 16, Class C uses 24; CIDR allows any prefix length."
      }
    }
  ],
  "flashcards": [
    [
      "What are the two logical parts of an IPv4 address?",
      "The Network Identifier and the Host Identifier."
    ],
    [
      "How many bits are in a single octet of an IPv4 address?",
      "8 bits (values range from 0 to 255)."
    ],
    [
      "What is the total size of an IPv4 address?",
      "32 bits (4 octets)."
    ],
    [
      "Why is hierarchical addressing used (Network ID vs Host ID)?",
      "To simplify routing; routers only need to know the path to a network, not every individual host."
    ],
    [
      "What notation is commonly used to represent IPv4 addresses?",
      "Dotted-decimal notation."
    ],
    [
      "What two parts make up an IP address?",
      "A network identifier (which network) and a host identifier (which device on it)."
    ],
    [
      "What is dotted-decimal notation?",
      "An IPv4 address written as four decimal octets 0–255 separated by dots, e.g. 192.168.0.1."
    ],
    [
      "What determines how many bits are the network part?",
      "The subnet mask — its 1-bits mark the network portion of the address."
    ]
  ],
  "quiz": [
    {
      "q": "If a network uses the first 24 bits for the Network ID, how many octets are used for the Host ID?",
      "opts": [
        "1",
        "2",
        "3",
        "4"
      ],
      "ans": 0,
      "why": "24 bits = 3 octets for Network, leaving 8 bits = 1 octet for Host."
    },
    {
      "q": "Which part of the IP address does a router look at first?",
      "opts": [
        "MAC Address",
        "Host ID",
        "Network ID",
        "Port Number"
      ],
      "ans": 2,
      "why": "Routers route based on the Network ID."
    },
    {
      "q": "What is the maximum value of a single octet in an IPv4 address?",
      "opts": [
        "128",
        "255",
        "256",
        "1024"
      ],
      "ans": 1,
      "why": "An 8-bit number maxes out at 2^8 - 1 = 255."
    },
    {
      "q": "Which of these is a valid IPv4 address?",
      "opts": [
        "192.168.1",
        "192.168.1.256",
        "172.16.254.1",
        "G1.22.33.44"
      ],
      "ans": 2,
      "why": "Octets must be 0-255 and there must be four of them."
    },
    {
      "q": "In 192.168.1.1 with mask 255.255.255.0, which part is the host ID?",
      "opts": ["192", "192.168", "the last octet (the final 1)", "all four octets"],
      "ans": 2,
      "why": "The mask's 0 octet marks the host portion — here the final octet."
    }
  ],
  "exam": [
    {
      "q": "Explain why an IP address is split into a network identifier and a host identifier. (2 marks)",
      "marks": 2,
      "ms": [
        "The network ID allows routers to direct data to the correct subnet across the internet (1).",
        "The host ID identifies the specific device within that subnet, reducing the complexity of global routing tables (1)."
      ]
    },
    {
      "q": "Explain why an IP address is split into a network part and a host part.",
      "marks": 2,
      "ms": [
        "The network part identifies which network the device is on, so routers can forward to the right network (1)",
        "The host part identifies the specific device within that network (1)"
      ]
    },
    {
      "q": "Explain the structure of an IPv4 address and how the split into network and host identifiers helps routing and network management.",
      "marks": 6,
      "ms": [
        "An IPv4 address is 32 bits, written as four octets (0–255) in dotted decimal (1)",
        "It is split into a network identifier and a host identifier (1)",
        "The split is defined by the subnet mask (1)",
        "Routers compare the network part to forward packets toward the correct network (1)",
        "needing host detail only on the destination network (1)",
        "This keeps routing tables smaller/efficient and lets networks be organised into subnets (1)"
      ]
    }
  ]
};

C["compsci:4.9.4.4"] = {
  "notes": [
    {
      "h": "Subnet Masking & Local Routing"
    },
    {
      "callout": {
        "t": "def",
        "h": "The Subnet Mask",
        "body": [
          {
            "kv": [
              [
                "Definition",
                "A 32-bit value that distinguishes the network part of an IP address from the host part."
              ],
              [
                "Mechanism",
                "A '1' in the mask indicates the corresponding bit in the IP is part of the Network ID; a '0' indicates it is part of the Host ID."
              ],
              [
                "Common Mask",
                "255.255.255.0 (Binary: 24 ones followed by 8 zeros) defines a network with 254 usable hosts."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "The Bitwise AND Operation",
        "body": [
          {
            "steps": [
              {
                "h": "Step 1",
                "m": "The host applies a bitwise AND operation between its own IP address and its subnet mask to calculate its Network ID.",
                "n": "The host performs a bitwise AND between its own IP and its subnet mask to find its Network ID."
              },
              {
                "h": "Step 2",
                "m": "The host applies the same subnet mask AND operation to the destination IP address to find the destination's Network ID.",
                "n": "The host performs a bitwise AND between the destination IP and its own subnet mask."
              },
              {
                "h": "Step 3",
                "m": "If both Network IDs match, the destination is on the same local subnet and can be reached directly. If they differ, the packet is forwarded to the Default Gateway (router) for onward routing.",
                "n": "If the results match, the destination is on the same local network. If they differ, the packet is sent to the Default Gateway (router)."
              }
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Calculation Example",
        "body": [
          {
            "table": {
              "head": [
                "Item",
                "Decimal",
                "Binary"
              ],
              "rows": [
                [
                  "IP Address",
                  "192.168.1.50",
                  "11000000.10101000.00000001.00110010"
                ],
                [
                  "Subnet Mask",
                  "255.255.255.0",
                  "11111111.11111111.11111111.00000000"
                ],
                [
                  "Network ID",
                  "192.168.1.0",
                  "11000000.10101000.00000001.00000000"
                ]
              ]
            }
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Simulating Subnet Mask logic in C#.",
        "src": "uint ip = 0xC0A80132;   // 192.168.1.50\nuint mask = 0xFFFFFF00; // 255.255.255.0\nuint dest = 0xC0A80140; // 192.168.1.64\n\nuint networkID = ip & mask;\nuint destNetworkID = dest & mask;\n\nif (networkID == destNetworkID) {\n    Console.WriteLine(\"Destination is local. Send via Link Layer (ARP).\");\n} else {\n    Console.WriteLine(\"Destination is remote. Forward to Router.\");\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Usable Hosts",
        "body": "In a subnet, two addresses are reserved: the Network Address (all host bits 0) and the Broadcast Address (all host bits 1). For a /24 mask, there are 2^8 - 2 = 254 usable host addresses."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Subnet Masking — Three-Step Method",
        "body": "1. **AND** your IP with the mask → your **Network ID**. 2. **AND** the destination IP with the mask → destination **Network ID**. 3. If they **match** → same subnet, deliver directly. If they **differ** → different subnet, send to **Default Gateway**. Common mask: `255.255.255.0` = 24 ones followed by 8 zeros = **/24**."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "The Subnet Mask Is NOT Part of the IP Address",
        "body": "The subnet mask is a **separate** 32-bit value used alongside the IP address — it is not stored within the IP address itself. Also: the network address (all host bits = 0) and broadcast address (all host bits = 1) are **not usable** by hosts."
      }
    }
  ],
  "flashcards": [
    [
      "What bitwise operation is used with a subnet mask?",
      "Bitwise AND."
    ],
    [
      "What does a '1' in a subnet mask represent?",
      "That the corresponding bit in the IP address is part of the Network ID."
    ],
    [
      "How does a computer know if a destination is on its local network?",
      "It compares the Network ID of its own IP and the destination IP (using its mask)."
    ],
    [
      "What is the purpose of the 'Default Gateway'?",
      "It is the router's IP address where packets are sent if the destination is not local."
    ],
    [
      "How many usable hosts are in a subnet with mask 255.255.255.0?",
      "254 (256 minus network and broadcast addresses)."
    ],
    [
      "What is a subnet mask used for?",
      "To identify which part of an IP address is the network ID — its 1-bits mark the network portion."
    ],
    [
      "How do you find the network address from an IP and mask?",
      "Bitwise AND the IP address with the subnet mask."
    ],
    [
      "How many usable hosts does a /24 (255.255.255.0) subnet provide?",
      "254 — 256 addresses minus the network and broadcast addresses."
    ]
  ],
  "quiz": [
    {
      "q": "What is the Network ID for 10.5.50.100 with mask 255.255.0.0?",
      "opts": [
        "10.5.50.0",
        "10.5.0.0",
        "10.0.0.0",
        "10.5.50.100"
      ],
      "ans": 1,
      "why": "255.255.0.0 keeps the first two octets and zeros the rest."
    },
    {
      "q": "Which address is reserved for broadcasting to all hosts on a 192.168.1.0/24 subnet?",
      "opts": [
        "192.168.1.0",
        "192.168.1.1",
        "192.168.1.254",
        "192.168.1.255"
      ],
      "ans": 3,
      "why": "Broadcast address has all 1s in the host portion."
    },
    {
      "q": "If the AND results for the local IP and destination IP do NOT match, where is the packet sent?",
      "opts": [
        "DNS Server",
        "DHCP Server",
        "Default Gateway",
        "Switch"
      ],
      "ans": 2,
      "why": "Packets for other networks go to the gateway (router)."
    },
    {
      "q": "What is 192 AND 255?",
      "opts": [
        "0",
        "192",
        "255",
        "1"
      ],
      "ans": 1,
      "why": "Anything ANDed with 255 (all 1s) remains itself."
    },
    {
      "q": "IP 192.168.5.130 AND mask 255.255.255.0 gives which network address?",
      "opts": ["192.168.5.130", "192.168.5.0", "192.168.0.0", "255.255.255.0"],
      "ans": 1,
      "why": "ANDing zeroes the host octet, leaving the network address 192.168.5.0."
    }
  ],
  "exam": [
    {
      "q": "A computer with IP 192.168.1.15 and mask 255.255.255.0 wants to send data to 192.168.2.20. Show the calculation it performs and state where the packet is sent. (4 marks)",
      "marks": 4,
      "ms": [
        "Performs bitwise AND on its own IP: 192.168.1.15 AND 255.255.255.0 = 192.168.1.0 (1).",
        "Performs bitwise AND on dest IP: 192.168.2.20 AND 255.255.255.0 = 192.168.2.0 (1).",
        "Compares the two: 192.168.1.0 != 192.168.2.0 (1).",
        "Since they differ, the packet is sent to the default gateway / router (1)."
      ]
    },
    {
      "q": "Explain how a host uses a subnet mask to decide whether a destination is on its own network.",
      "marks": 3,
      "ms": [
        "It ANDs its own IP with the mask to get its network address (1)",
        "and ANDs the destination IP with the mask to get the destination network (1)",
        "If they match, the destination is local; if not, it sends to the default gateway (1)"
      ]
    },
    {
      "q": "Explain what subnetting is and discuss why an organisation would divide its network into subnets.",
      "marks": 6,
      "ms": [
        "Subnetting divides a network into smaller logical sub-networks (1)",
        "The subnet mask marks which IP bits are the (sub)network ID (1)",
        "found by a bitwise AND of the IP and the mask (1)",
        "Benefit: reduces broadcast traffic / collision domains, improving performance (1)",
        "Benefit: improves security/management by isolating departments (1)",
        "Benefit: more efficient use of address space and easier routing (1)"
      ]
    }
  ]
};

C["compsci:4.9.4.5"] = {
  "notes": [
    {
      "h": "IP Versions: IPv4 vs IPv6"
    },
    {
      "callout": {
        "t": "def",
        "h": "Evolution of Addressing",
        "body": [
          {
            "kv": [
              [
                "IPv4",
                "The legacy standard using 32-bit addresses. Provides ~4.3 billion unique addresses."
              ],
              [
                "IPv6",
                "The modern standard using 128-bit addresses. Provides ~340 undecillion addresses."
              ],
              [
                "The Problem",
                "IPv4 address exhaustion due to the explosion of internet-connected devices (IoT)."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Technical Comparison",
        "body": [
          {
            "table": {
              "head": [
                "Feature",
                "IPv4",
                "IPv6"
              ],
              "rows": [
                [
                  "Address Size",
                  "32-bit",
                  "128-bit"
                ],
                [
                  "Representation",
                  "Dotted-decimal (192.168.1.1)",
                  "Hexadecimal (2001:0db8::8a2e:0370:7334)"
                ],
                [
                  "Header Complexity",
                  "Complex, variable length (20-60 bytes)",
                  "Fixed length (40 bytes), simplified for faster routing"
                ],
                [
                  "Security",
                  "IPsec is optional",
                  "IPsec support is mandatory/built-in"
                ],
                [
                  "Configuration",
                  "Manual or DHCP",
                  "Stateless Address Autoconfiguration (SLAAC)"
                ]
              ]
            }
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "IPv6 Compression Rules",
        "body": [
          {
            "steps": [
              {
                "h": "Rule 1",
                "m": "Within each 16-bit hextet, leading zeros can be dropped — e.g. `:0db8:` becomes `:db8:`.",
                "n": "Leading zeros in a group can be omitted (e.g., :0db8: becomes :db8:)."
              },
              {
                "h": "Rule 2",
                "m": "One or more consecutive all-zero hextets can be replaced with `::`, but this shorthand may only be used **once** per address to prevent ambiguity.",
                "n": "Consecutive groups of zeros can be replaced with '::' (once per address)."
              }
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "json",
        "cap": "Conceptual representation of IP objects.",
        "src": "{\n  \"ipv4\": {\n    \"address\": \"172.16.254.1\",\n    \"bits\": 32,\n    \"octets\": 4\n  },\n  \"ipv6\": {\n    \"full\": \"2001:0db8:0000:0000:0000:8a2e:0370:7334\",\n    \"compressed\": \"2001:db8::8a2e:370:7334\",\n    \"bits\": 128,\n    \"hextets\": 8\n  }\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "The Transition",
        "body": "Because IPv4 and IPv6 are not directly compatible, technologies like Dual Stack (running both), Tunneling (encapsulating IPv6 in IPv4), and Translation (NAT64) are used during the transition phase."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "IPv4 vs IPv6 — Key Facts",
        "body": [{"kv": [
          ["IPv4 size", "**32 bits** — 4 dotted-decimal octets (e.g. 192.168.1.1). ~4.3 billion addresses."],
          ["IPv6 size", "**128 bits** — 8 colon-separated hex hextets (e.g. 2001:db8::1). ~3.4×10³⁸ addresses."],
          ["Why IPv6?", "IPv4 address **exhaustion** — not enough addresses for all internet-connected devices."],
          ["IPv6 header", "**Fixed** 40 bytes — faster routing than IPv4's variable-length header."],
          ["IPv6 security", "**Built-in IPsec** (mandatory) vs IPv4 where it is optional."]
        ]}]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "IPv6 Does Not Make IPv4 Immediately Obsolete",
        "body": "IPv4 and IPv6 coexist during the transition period. Dual Stack allows a device to run both simultaneously. `::` in an IPv6 address can only appear **once** — using it twice makes the address ambiguous and invalid."
      }
    }
  ],
  "flashcards": [
    [
      "How many bits are in an IPv6 address?",
      "128 bits."
    ],
    [
      "Why is IPv6 needed?",
      "To overcome IPv4 address exhaustion."
    ],
    [
      "How is an IPv6 address represented?",
      "As 8 groups of 4 hexadecimal digits, separated by colons."
    ],
    [
      "What does '::' represent in an IPv6 address?",
      "One or more consecutive groups of zero value."
    ],
    [
      "Which IP version has a fixed-length header?",
      "IPv6 (40 bytes)."
    ],
    [
      "How many bits are an IPv4 vs an IPv6 address?",
      "IPv4 = 32 bits; IPv6 = 128 bits."
    ],
    [
      "Why was IPv6 introduced?",
      "IPv4's ~4.3 billion addresses are exhausted; IPv6's 128-bit space provides a vastly larger supply."
    ],
    [
      "How is an IPv6 address written?",
      "As eight groups of four hexadecimal digits separated by colons, with :: allowed to compress consecutive zero groups."
    ]
  ],
  "quiz": [
    {
      "q": "What is the total number of bits in an IPv4 address?",
      "opts": [
        "32",
        "64",
        "128",
        "256"
      ],
      "ans": 0,
      "why": "IPv4 uses 32 bits (4 octets)."
    },
    {
      "q": "Which of these is a valid IPv6 address?",
      "opts": [
        "192.168.1.1",
        "2001:db8::1",
        "FE80:G001::1",
        "127.0.0.1"
      ],
      "ans": 1,
      "why": "IPv6 uses hex and colons; '::' is valid compression."
    },
    {
      "q": "How many hexadecimal characters are in a full IPv6 address?",
      "opts": [
        "8",
        "16",
        "32",
        "64"
      ],
      "ans": 2,
      "why": "128 bits / 4 bits per hex digit = 32 digits."
    },
    {
      "q": "What is the primary reason for switching to IPv6?",
      "opts": [
        "Faster routing",
        "Better encryption",
        "Address exhaustion",
        "Smaller packets"
      ],
      "ans": 2,
      "why": "We ran out of IPv4 addresses."
    },
    {
      "q": "Roughly how many addresses does IPv6 provide compared with IPv4?",
      "opts": ["double", "ten times", "a vastly larger (2^128) number", "the same"],
      "ans": 2,
      "why": "128 bits gives 2^128 addresses — astronomically more than IPv4's 2^32."
    }
  ],
  "exam": [
    {
      "q": "Explain two reasons why the internet is migrating from IPv4 to IPv6. (4 marks)",
      "marks": 4,
      "ms": [
        "IPv4 only supports ~4.3 billion addresses (1), which have been exhausted due to the increase in internet-connected devices (1).",
        "IPv6 uses 128-bit addresses, providing a near-infinite supply of addresses (1), and includes built-in features for better security and simplified routing (1)."
      ]
    },
    {
      "q": "State one reason IPv6 was needed and one feature it adds besides more addresses.",
      "marks": 2,
      "ms": [
        "IPv4 address exhaustion (1)",
        "IPv6 adds e.g. built-in security (IPsec) / simpler headers / auto-configuration (1)"
      ]
    },
    {
      "q": "Compare IPv4 and IPv6 and explain why the transition to IPv6 was necessary.",
      "marks": 6,
      "ms": [
        "IPv4 is 32-bit (~4.3 billion addresses); IPv6 is 128-bit (2^128) (1-2)",
        "IPv4 addresses have effectively run out due to Internet/IoT growth (1)",
        "Stop-gaps (NAT, private addressing) extended IPv4 but don't fully solve it (1)",
        "IPv6 provides a near-unlimited supply (1)",
        "plus benefits like simpler headers, auto-config and built-in IPsec (1)",
        "Transition is gradual (dual stack) because the two aren't directly interoperable (1)"
      ]
    }
  ]
};

C["compsci:4.9.4.6"] = {
  "notes": [
    {
      "h": "Public vs Private IP Addressing"
    },
    {
      "callout": {
        "t": "def",
        "h": "Public IP Addresses",
        "body": [
          {
            "kv": [
              [
                "Definition",
                "Globally unique addresses assigned by ICANN/ISPs. Reachable from anywhere on the internet."
              ],
              [
                "Requirement",
                "Essential for any device that needs to host a service accessible from the outside world."
              ],
              [
                "Cost",
                "Often limited and sometimes come with a subscription cost from ISPs."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Private IP Addresses",
        "body": [
          {
            "kv": [
              [
                "Definition",
                "Non-routable addresses used within a Local Area Network (LAN)."
              ],
              [
                "Advantage",
                "Allows billions of devices to share a single Public IP (via NAT) and provides basic security by 'hiding' the device from the internet."
              ],
              [
                "Conflict",
                "Private IPs only need to be unique within their own local network."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Reserved Private Ranges (RFC 1918)",
        "body": [
          {
            "table": {
              "head": [
                "Class",
                "Range Start",
                "Range End",
                "Total Addresses"
              ],
              "rows": [
                [
                  "Class A",
                  "10.0.0.0",
                  "10.255.255.255",
                  "16.7 Million"
                ],
                [
                  "Class B",
                  "172.16.0.0",
                  "172.31.255.255",
                  "1 Million"
                ],
                [
                  "Class C",
                  "192.168.0.0",
                  "192.168.255.255",
                  "65,536"
                ]
              ]
            }
          }
        ]
      }
    },
    {
      "code": {
        "lang": "bash",
        "cap": "Checking local (private) and external (public) IPs.",
        "src": "# Get internal/private IP (Linux/macOS)\nhostname -I\n# or\nip addr show | grep 'inet '\n\n# Get external/public IP\ncurl ifconfig.me\n# or\ncurl icanhazip.com"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Loopback Address",
        "body": "The IP 127.0.0.1 is a special reserved address called 'localhost'. It is used by a computer to send data to itself for testing and internal communication."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Private IP Ranges — RFC 1918",
        "body": "There are three reserved private ranges: **10.0.0.0 – 10.255.255.255** (Class A — 16.7 million hosts), **172.16.0.0 – 172.31.255.255** (Class B), **192.168.0.0 – 192.168.255.255** (Class C — most home routers use this). Private IPs are **not routable** on the public internet."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Private IPs Are Not Globally Unique",
        "body": "Multiple different LANs worldwide can use the same private IP addresses (e.g. every home network can have a device at 192.168.1.1). This is fine because private IPs never appear on the public internet — **NAT** translates them at the router boundary."
      }
    }
  ],
  "flashcards": [
    [
      "What is a public IP address?",
      "A globally unique IP address routable on the public internet."
    ],
    [
      "What is a private IP address?",
      "An IP address used only within a local network, not routable on the internet."
    ],
    [
      "Name one common private IP range.",
      "192.168.x.x (Class C) or 10.x.x.x (Class A)."
    ],
    [
      "Can two different LANs use the same private IP addresses?",
      "Yes, because they are not visible to each other over the internet."
    ],
    [
      "What special IP is used for the loopback interface?",
      "127.0.0.1 (localhost)."
    ],
    [
      "Difference between a public and a private IP address?",
      "Public (routable) addresses are unique on the Internet; private (non-routable) addresses are reused within local networks and not routed on the Internet."
    ],
    [
      "Give a private IPv4 range.",
      "10.0.0.0/8, 172.16.0.0/12 or 192.168.0.0/16."
    ],
    [
      "How do many private-IP devices share one public IP?",
      "Via NAT on the router, which translates between the private addresses and the single public address."
    ]
  ],
  "quiz": [
    {
      "q": "Which of these is a valid private IP address?",
      "opts": [
        "8.8.8.8",
        "192.168.1.50",
        "216.58.213.174",
        "1.1.1.1"
      ],
      "ans": 1,
      "why": "192.168.x.x is a reserved private range."
    },
    {
      "q": "What happens if a packet with a private source IP is sent onto the public internet?",
      "opts": [
        "It is delivered normally",
        "It is encrypted",
        "It is dropped by the first router it hits",
        "It is converted to IPv6"
      ],
      "ans": 2,
      "why": "Private IPs are non-routable on the public internet."
    },
    {
      "q": "Who assigns public IP addresses to home networks?",
      "opts": [
        "The user",
        "The router",
        "The Internet Service Provider (ISP)",
        "Microsoft/Apple"
      ],
      "ans": 2,
      "why": "ISPs manage the pool of public IPs for their customers."
    },
    {
      "q": "What is the primary benefit of using private IP addresses?",
      "opts": [
        "Faster speeds",
        "Encryption",
        "Conservation of public IP addresses",
        "Easier hardware setup"
      ],
      "ans": 2,
      "why": "Private IPs allow many devices to share one public IP."
    },
    {
      "q": "Which of these is a private (non-routable) address?",
      "opts": ["8.8.8.8", "192.168.0.10", "203.0.113.5", "172.0.0.1"],
      "ans": 1,
      "why": "192.168.x.x is a reserved private range, not routed on the public Internet."
    }
  ],
  "exam": [
    {
      "q": "Explain why a company would use private IP addresses for its internal workstations. (3 marks)",
      "marks": 3,
      "ms": [
        "Conserves public IP addresses as many workstations can share a single public IP (1).",
        "Increases security as internal machines are not directly addressable from the public internet (1).",
        "Reduces costs as the company doesn't need to purchase a public IP for every device (1)."
      ]
    },
    {
      "q": "Explain why private IP addresses are described as non-routable.",
      "marks": 2,
      "ms": [
        "They are not unique globally / are reused on many local networks (1)",
        "so Internet routers do not forward them — they only work within a local network (1)"
      ]
    },
    {
      "q": "Explain the difference between public and private IP addresses and discuss how their use, together with NAT, helps conserve IPv4 addresses.",
      "marks": 6,
      "ms": [
        "Public addresses are globally unique and routable on the Internet (1)",
        "Private addresses are reused within local networks and non-routable (1)",
        "Many devices on a LAN use private addresses (1)",
        "A router with NAT maps them to one shared public address (1)",
        "so a whole network needs only one (or a few) public IPs (1)",
        "This conserves the limited IPv4 address space (1)"
      ]
    }
  ]
};

C["compsci:4.9.4.7"] = {
  "notes": [
    {
      "h": "DHCP: Dynamic Host Configuration Protocol"
    },
    {
      "callout": {
        "t": "def",
        "h": "The Purpose of DHCP",
        "body": [
          {
            "kv": [
              [
                "Automation",
                "Eliminates the need for manual IP configuration on every device."
              ],
              [
                "Centralisation",
                "A DHCP server manages a pool of IP addresses (a scope) and leases them to clients."
              ],
              [
                "Configuration",
                "Besides an IP, DHCP provides the Subnet Mask, Default Gateway, and DNS Server addresses."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "The DORA Process",
        "body": [
          {
            "steps": [
              {
                "h": "Discovery",
                "m": "The client has no IP address yet, so it broadcasts a DHCPDISCOVER message across the local network hoping a DHCP server hears it.",
                "n": "The client broadcasts a DHCPDISCOVER message to find a DHCP server on the local network."
              },
              {
                "h": "Offer",
                "m": "One or more DHCP servers respond with a DHCPOFFER, proposing an available IP address and configuration (subnet mask, default gateway, DNS server, lease time).",
                "n": "The server responds with a DHCPOFFER message containing an available IP and configuration."
              },
              {
                "h": "Request",
                "m": "The client selects one offer and broadcasts a DHCPREQUEST to formally request it, simultaneously informing other servers that their offers were declined.",
                "n": "The client sends a DHCPREQUEST message to accept the offered IP address."
              },
              {
                "h": "Acknowledgement",
                "m": "The chosen server sends a DHCPACK confirming the IP lease; the client can now configure its network interface and begin using the address for the duration of the lease.",
                "n": "The server sends a DHCPACK message to confirm the lease and finalise the settings."
              }
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "bash",
        "cap": "Renewing a DHCP lease via CLI.",
        "src": "# On Windows\nipconfig /release\nipconfig /renew\n\n# On Linux\nsudo dhclient -r  # Release\nsudo dhclient     # Request new lease"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Lease Time",
        "body": "IP addresses are not assigned forever; they are leased for a specific period (e.g., 24 hours). Clients must request a renewal halfway through the lease to keep the same address."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "DHCP DORA — What Each Step Means",
        "body": "**D**iscover — client broadcasts, no IP yet. **O**ffer — server proposes IP + config. **R**equest — client accepts (broadcast, politely declines others). **A**cknowledgement — server confirms the **lease**. DHCP provides: IP address, subnet mask, default gateway, DNS server address, lease duration."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "DHCP Does Not Assign Permanent Addresses",
        "body": "IP addresses assigned by DHCP are **leased** for a limited time. When the lease expires, the device may get a **different** IP. Only **static** (manually configured) IPs are permanent. Servers and printers typically use static IPs for consistency."
      }
    }
  ],
  "flashcards": [
    [
      "What does DORA stand for in DHCP?",
      "Discovery, Offer, Request, Acknowledgement."
    ],
    [
      "What is the main benefit of DHCP?",
      "Automatic assignment of IP addresses, reducing administrative overhead and errors."
    ],
    [
      "What four things does a DHCP server typically provide?",
      "IP Address, Subnet Mask, Default Gateway, and DNS Server addresses."
    ],
    [
      "What happens when a DHCP lease expires?",
      "The device loses its IP address and must request a new one (unless renewed)."
    ],
    [
      "What is a 'Static IP' in the context of DHCP?",
      "A reserved IP address in the DHCP pool that is always assigned to the same MAC address."
    ],
    [
      "What is the purpose of DHCP?",
      "To automatically assign IP addresses (and other settings) to devices joining a network, so they need no manual configuration."
    ],
    [
      "Outline the DHCP process.",
      "Discover (client) → Offer (server) → Request (client) → Acknowledge (server) — 'DORA'."
    ],
    [
      "What is a DHCP lease?",
      "A time-limited allocation of an IP address; the client must renew it before it expires."
    ]
  ],
  "quiz": [
    {
      "q": "Which message is sent by the client to find a DHCP server?",
      "opts": [
        "DHCPREQUEST",
        "DHCPDISCOVER",
        "DHCPOFFER",
        "DHCPACK"
      ],
      "ans": 1,
      "why": "Discovery is the first step."
    },
    {
      "q": "What does the 'A' in DORA stand for?",
      "opts": [
        "Address",
        "Allocation",
        "Acknowledgement",
        "Assignment"
      ],
      "ans": 2,
      "why": "Acknowledgement confirms the lease."
    },
    {
      "q": "Why is a lease time used in DHCP?",
      "opts": [
        "To save electricity",
        "To ensure IP addresses are returned to the pool if a device leaves",
        "To encrypt the connection",
        "To speed up the network"
      ],
      "ans": 1,
      "why": "Leases prevent the pool from being exhausted by inactive devices."
    },
    {
      "q": "Which of these is NOT provided by DHCP?",
      "opts": [
        "Subnet Mask",
        "Default Gateway",
        "MAC Address",
        "DNS Server"
      ],
      "ans": 2,
      "why": "MAC address is fixed on the hardware NIC."
    },
    {
      "q": "DHCP saves administrators from having to...?",
      "opts": ["install network cards", "manually configure each device's IP settings", "encrypt traffic", "forward ports"],
      "ans": 1,
      "why": "DHCP automates IP/config assignment, avoiding manual setup per device."
    }
  ],
  "exam": [
    {
      "q": "Explain the four steps of the DHCP process when a new laptop joins a school Wi-Fi network. (4 marks)",
      "marks": 4,
      "ms": [
        "Discovery: Laptop broadcasts a message to find a DHCP server (1).",
        "Offer: Server responds with an available IP address and settings (1).",
        "Request: Laptop sends a message back to the server to accept the specific IP offered (1).",
        "Acknowledgement: Server confirms the lease and the laptop applies the settings (1)."
      ]
    },
    {
      "q": "State two benefits of using DHCP on a large network.",
      "marks": 2,
      "ms": [
        "No manual IP configuration — saves admin time and avoids errors (1)",
        "Prevents duplicate-address conflicts / reuses addresses efficiently via leases (1)"
      ]
    },
    {
      "q": "Describe the steps by which a device obtains an IP address using DHCP, and explain the advantages over static configuration.",
      "marks": 6,
      "ms": [
        "The client broadcasts a DHCP DISCOVER to find a server (1)",
        "A DHCP server replies with an OFFER of an address (1)",
        "The client sends a REQUEST for that address (1)",
        "The server ACKNOWLEDGES, leasing the address; the client applies the settings (1)",
        "Advantage: no manual configuration, fewer errors / no duplicate addresses (1)",
        "Advantage: addresses are reused via leases — efficient on large/changing networks (1)"
      ]
    }
  ]
};

C["compsci:4.9.4.8"] = {
  "notes": [
    {
      "h": "NAT: Network Address Translation"
    },
    {
      "callout": {
        "t": "def",
        "h": "The Core Concept",
        "body": [
          {
            "kv": [
              [
                "Definition",
                "A method of remapping one IP address space into another by modifying network address information in the IP header of packets."
              ],
              [
                "Primary Use",
                "Allows a whole LAN of devices with Private IPs to share a single Public IP assigned to the router."
              ],
              [
                "Conservation",
                "Critical for delaying the exhaustion of IPv4 addresses."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "PAT (Port Address Translation)",
        "body": [
          {
            "kv": [
              [
                "Mechanism",
                "The router uses a translation table to track which internal Private IP and Port is associated with which external session."
              ],
              [
                "Identification",
                "Outgoing packets have their source IP replaced with the router's Public IP and their source port replaced with a unique tracking port."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "NAT Translation Table Example",
        "body": [
          {
            "table": {
              "head": [
                "Internal IP:Port",
                "External IP:Port (Router)",
                "Destination IP:Port"
              ],
              "rows": [
                [
                  "192.168.1.10:5001",
                  "82.10.20.30:10001",
                  "172.217.16.14:443 (Google)"
                ],
                [
                  "192.168.1.12:5001",
                  "82.10.20.30:10002",
                  "31.13.72.36:443 (Facebook)"
                ]
              ]
            }
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Conceptual logic of a NAT mapping.",
        "src": "public class NatEntry {\n    public string InternalIP { get; set; }\n    public int InternalPort { get; set; }\n    public int ExternalPort { get; set; } // Tracking port\n}\n\n// When a packet returns on ExternalPort 10001, \n// the router looks up the entry and forwards to 192.168.1.10:5001."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Security Benefit",
        "body": "NAT provides a basic level of security because external hosts cannot initiate a connection to an internal machine; the router only allows incoming traffic if it matches an entry in its translation table."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "How NAT Works — Step by Step",
        "body": "**Outgoing:** device (192.168.1.10:5001) sends packet → router replaces source with its public IP + tracking port (82.x.x.x:10001) → logs this mapping in the NAT table → packet sent to internet. **Incoming:** response arrives at port 10001 → router looks up mapping → replaces destination with 192.168.1.10:5001 → delivers to correct device."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "NAT Is Not True Security — It Is Address Translation",
        "body": "NAT provides **incidental** security (unsolicited inbound packets are dropped), but it is not a firewall. It does not inspect packet content, block malware, or filter by rule. A separate **firewall** is still needed for proper security. NAT's purpose is **address sharing**, not protection."
      }
    }
  ],
  "flashcards": [
    [
      "What is the main purpose of NAT?",
      "To allow multiple devices on a private network to share a single public IP address."
    ],
    [
      "What is PAT (Port Address Translation)?",
      "A form of NAT that uses port numbers to distinguish between different internal hosts."
    ],
    [
      "Where does NAT usually occur?",
      "On the perimeter router of a network."
    ],
    [
      "How does a router know where to send returning data in NAT?",
      "It looks up the destination port in its NAT translation table."
    ],
    [
      "Does NAT work with IPv6?",
      "While possible (NAT64), IPv6 is designed so every device can have its own global public IP, making NAT largely unnecessary."
    ],
    [
      "What does NAT do?",
      "Translates between private internal IP addresses and a public external IP address at the router."
    ],
    [
      "Why is NAT used?",
      "To let many private-IP devices share a single public IP (conserving IPv4) and to hide the internal network."
    ],
    [
      "How does NAT route a reply back to the right device?",
      "It keeps a translation table mapping internal IP:port to the public IP:port used, and reverses the lookup for incoming replies."
    ]
  ],
  "quiz": [
    {
      "q": "What does NAT stand for?",
      "opts": [
        "Network Access Table",
        "Network Address Translation",
        "Network Allocation Type",
        "Node Address Timing"
      ],
      "ans": 1,
      "why": "Network Address Translation."
    },
    {
      "q": "How does NAT help solve IPv4 address exhaustion?",
      "opts": [
        "It makes IPs longer",
        "It allows multiple devices to share one public IP",
        "It encrypts data",
        "It switches to IPv6 automatically"
      ],
      "ans": 1,
      "why": "One public IP can serve hundreds of internal devices."
    },
    {
      "q": "What is used in PAT to differentiate between internal connections?",
      "opts": [
        "MAC Addresses",
        "Hostnames",
        "Port Numbers",
        "Subnet Masks"
      ],
      "ans": 2,
      "why": "Port numbers create unique mappings."
    },
    {
      "q": "If an external attacker tries to send a packet to a private IP behind a NAT router, what happens?",
      "opts": [
        "It is delivered normally",
        "The router drops it (as there is no entry in the table)",
        "The router forwards it to everyone",
        "The router converts it to a public IP"
      ],
      "ans": 1,
      "why": "Unsolicited incoming traffic is dropped by NAT."
    },
    {
      "q": "A side benefit of NAT for security is that...?",
      "opts": ["it encrypts traffic", "unsolicited inbound traffic is dropped (no mapping exists)", "it speeds up the link", "it assigns IP addresses"],
      "ans": 1,
      "why": "Incoming traffic with no matching table entry is discarded, hiding internal hosts."
    }
  ],
  "exam": [
    {
      "q": "Explain how a router uses a translation table to manage NAT for multiple devices. (4 marks)",
      "marks": 4,
      "ms": [
        "When a device sends data, the router replaces the private source IP with its own public IP (1).",
        "The router assigns a unique port number to the connection and records this in the translation table alongside the device's private IP (1).",
        "When data returns from the internet, the router looks at the destination port (1).",
        "It finds the matching entry in the table and forwards the data to the correct internal private IP (1)."
      ]
    },
    {
      "q": "State the main purpose of NAT.",
      "marks": 2,
      "ms": [
        "To allow multiple devices with private IPs to share a single public IP address (1)",
        "conserving public IPv4 addresses (1)"
      ]
    },
    {
      "q": "Explain how NAT allows a home network of several devices to access the Internet through one public IP address.",
      "marks": 6,
      "ms": [
        "Each device has a private (non-routable) IP (1)",
        "The router has one public IP from the ISP (1)",
        "Outgoing packets have their source private IP:port replaced with the public IP:port (1)",
        "The router records this mapping in a translation table (1)",
        "Replies arrive at the public IP:port; the router looks up the table (1)",
        "and forwards them to the correct internal device/port (1)"
      ]
    }
  ]
};

C["compsci:4.9.4.9"] = {
  "notes": [
    {
      "h": "Port Forwarding"
    },
    {
      "callout": {
        "t": "def",
        "h": "Overcoming NAT Limitations",
        "body": [
          {
            "kv": [
              [
                "The Problem",
                "NAT blocks all unsolicited incoming traffic. If an external user tries to connect to a web server inside your LAN, the router doesn't know which internal IP to send the request to."
              ],
              [
                "The Solution",
                "Port Forwarding tells the router: 'Any traffic arriving on Port X should be sent directly to Internal IP Y on Port Z.'"
              ],
              [
                "Static IP",
                "The target internal device must have a static private IP so the rule always points to the correct machine."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Port Forwarding Configuration",
        "body": [
          {
            "table": {
              "head": [
                "Service",
                "External Port",
                "Internal IP",
                "Internal Port",
                "Protocol"
              ],
              "rows": [
                [
                  "Web Server",
                  "80",
                  "192.168.1.100",
                  "80",
                  "TCP"
                ],
                [
                  "Game Server",
                  "25565",
                  "192.168.1.101",
                  "25565",
                  "TCP/UDP"
                ],
                [
                  "SSH Access",
                  "2222",
                  "192.168.1.10",
                  "22",
                  "TCP"
                ]
              ]
            }
          }
        ]
      }
    },
    {
      "code": {
        "lang": "json",
        "cap": "Conceptual router config for port forwarding.",
        "src": "{\n  \"port_forwarding_rules\": [\n    {\n      \"name\": \"Minecraft Server\",\n      \"external_port\": 25565,\n      \"internal_ip\": \"192.168.1.101\",\n      \"internal_port\": 25565,\n      \"protocol\": \"BOTH\"\n    },\n    {\n      \"name\": \"Web UI\",\n      \"external_port\": 8080,\n      \"internal_ip\": \"192.168.1.50\",\n      \"internal_port\": 80,\n      \"protocol\": \"TCP\"\n    }\n  ]\n}"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Security Risks",
        "body": "Opening ports via port forwarding bypasses the NAT firewall. Any vulnerability in the internal application (e.g., the web server) can now be exploited by anyone on the public internet. Use with caution!"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Port Forwarding — When and Why",
        "body": "**Problem:** NAT drops all unsolicited incoming traffic — external users can't reach your internal server. **Solution:** Create a rule in the router: 'traffic arriving on external port X → forward to internal IP:port Y'. **Requirement:** The internal device must have a **static** (fixed) private IP, otherwise the rule breaks when DHCP reassigns addresses."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Port Forwarding Misconceptions",
        "body": "**Port forwarding makes a server more secure** — it does the opposite: it punches a hole through the NAT firewall, directly exposing an internal machine to the public internet on that port. NAT normally drops all unsolicited traffic; forwarding removes that protection. **One external port can serve multiple internal devices** — each external port maps to exactly one internal IP:port; to run multiple services, different external ports must be used."
      }
    }
  ],
  "flashcards": [
    [
      "What is port forwarding?",
      "Instructing a router to send all traffic on a specific port to a specific internal IP address."
    ],
    [
      "Why is port forwarding necessary for hosting a server at home?",
      "Because NAT usually blocks unsolicited incoming connections from the internet."
    ],
    [
      "What must be true about the internal device's IP for port forwarding to work reliably?",
      "It must be a Static Private IP (manually set or DHCP reservation)."
    ],
    [
      "Which port would you forward for a standard web server?",
      "Port 80 (HTTP) or 443 (HTTPS)."
    ],
    [
      "What is a major downside of port forwarding?",
      "It reduces security by opening a direct path into the local network."
    ],
    [
      "What is port forwarding?",
      "A NAT rule that sends inbound traffic on a specific public port to a fixed internal device/port."
    ],
    [
      "Why use port forwarding?",
      "To make an internal service (game/web/remote-desktop server) reachable from the Internet despite NAT."
    ],
    [
      "Where is port forwarding configured?",
      "On the router/NAT, which maps an external port to an internal host:port."
    ]
  ],
  "quiz": [
    {
      "q": "A user wants to host a game server. Which technique allows friends to join via the user's public IP?",
      "opts": [
        "Subnetting",
        "Port Forwarding",
        "DHCP",
        "DNS"
      ],
      "ans": 1,
      "why": "Port forwarding maps the public port to the internal server."
    },
    {
      "q": "Why is a static IP important for the internal server?",
      "opts": [
        "It makes the server faster",
        "To ensure the router's rule always points to the right machine",
        "To encrypt the traffic",
        "To bypass the ISP's limits"
      ],
      "ans": 1,
      "why": "If the IP changes via DHCP, the forwarding rule will break."
    },
    {
      "q": "Does port forwarding increase or decrease network security?",
      "opts": [
        "Increase",
        "Decrease",
        "No effect",
        "Depends on the ISP"
      ],
      "ans": 1,
      "why": "It opens a hole in the firewall."
    },
    {
      "q": "What does the router do with an incoming packet on port 80 if no port forwarding rule exists?",
      "opts": [
        "Broadcasts it to everyone",
        "Forwards it to the first device it finds",
        "Drops it",
        "Sends it to the ISP"
      ],
      "ans": 2,
      "why": "NAT drops unsolicited traffic by default."
    },
    {
      "q": "A security risk of port forwarding is that it...?",
      "opts": ["encrypts the wrong data", "opens a permanent inbound path that could be exploited if the service is insecure", "blocks all outbound traffic", "disables NAT entirely"],
      "ans": 1,
      "why": "It bypasses NAT's default protection for that port, exposing the internal service to attack."
    }
  ],
  "exam": [
    {
      "q": "A homeowner has a security camera with an internal IP of 192.168.1.50. Explain the steps they must take to view this camera while away from home. (4 marks)",
      "marks": 4,
      "ms": [
        "Assign the camera a static private IP address (1).",
        "Access the router's configuration page (1).",
        "Create a port forwarding rule mapping a specific external port to 192.168.1.50 (1).",
        "The user then connects to their home's public IP address and the specified port (1)."
      ]
    },
    {
      "q": "Explain why port forwarding is needed to host a game server behind a home router.",
      "marks": 2,
      "ms": [
        "By default NAT drops unsolicited inbound traffic (1)",
        "Port forwarding maps the chosen public port to the server's internal IP:port so external players can connect (1)"
      ]
    },
    {
      "q": "Explain how port forwarding works and discuss its benefits and security risks.",
      "marks": 6,
      "ms": [
        "A rule on the router maps a public port to a specific internal IP:port (1)",
        "Inbound traffic to that port is forwarded to the internal device (1)",
        "Benefit: makes an internal service reachable from the Internet despite NAT (1)",
        "Users connect to the public IP and the forwarded port (1)",
        "Risk: it opens a permanent inbound path bypassing NAT's default protection (1)",
        "If the exposed service is vulnerable, attackers can exploit it — so it must be secured/limited (1)"
      ]
    }
  ]
};

C["compsci:4.9.4.10"] = {
  "notes": [
    {
      "h": "Modern Web APIs & Data Exchange"
    },
    {
      "callout": {
        "t": "def",
        "h": "API Architectures",
        "body": [
          {
            "table": {
              "head": [
                "Architecture",
                "Communication Model",
                "State",
                "Use Case"
              ],
              "rows": [
                [
                  "REST",
                  "Request-Response (HTTP)",
                  "Stateless (each request is independent)",
                  "Standard CRUD operations, mobile app backends"
                ],
                [
                  "WebSocket",
                  "Full-Duplex (Persistent)",
                  "Stateful (connection remains open)",
                  "Real-time chat, live sports updates, trading platforms"
                ]
              ]
            }
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Data Interchange Formats",
        "body": [
          {
            "kv": [
              [
                "JSON",
                "JavaScript Object Notation. Lightweight, easy for humans to read/write, and easy for machines to parse. Native to JavaScript."
              ],
              [
                "XML",
                "eXtensible Markup Language. Verbose, using tags like HTML. Highly structured and supports complex schemas but slower to parse."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Comparison: JSON vs XML",
        "body": [
          {
            "table": {
              "head": [
                "Feature",
                "JSON",
                "XML"
              ],
              "rows": [
                [
                  "Verbosity",
                  "Low (Compact)",
                  "High (Verbose)"
                ],
                [
                  "Parsing Speed",
                  "Fast",
                  "Slower"
                ],
                [
                  "Readability",
                  "Very High",
                  "Moderate"
                ],
                [
                  "Data Types",
                  "Supports arrays, numbers, booleans",
                  "Everything is a string"
                ]
              ]
            }
          }
        ]
      }
    },
    {
      "code": {
        "lang": "javascript",
        "cap": "Comparing JSON and XML representations.",
        "src": "// JSON Representation\nconst jsonUser = {\n  \"name\": \"Alice\",\n  \"roles\": [\"admin\", \"user\"],\n  \"active\": true\n};\n\n/* XML Representation\n<user active=\"true\">\n  <name>Alice</name>\n  <roles>\n    <role>admin</role>\n    <role>user</role>\n  </roles>\n</user>\n*/"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "RESTful Principles",
        "body": "REST (Representational State Transfer) uses standard HTTP methods: GET (Retrieve), POST (Create), PUT (Update), and DELETE (Remove). It treats everything as a 'Resource' identified by a URL."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "REST vs WebSocket & JSON vs XML",
        "body": "**REST**: stateless HTTP request-response; methods = GET (read), POST (create), PUT (update), DELETE (remove); each request is self-contained. **WebSocket**: stateful, persistent full-duplex connection for real-time apps (live chat, scores, trading). **JSON**: lightweight key-value + array format, fast to parse, natively JavaScript. **XML**: verbose tag-based, everything stored as strings, slower but supports strict schemas."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common Web API Misconceptions",
        "body": "**REST maintains session state on the server** — REST is stateless by design; every request must carry all needed information (credentials, parameters); the server stores nothing about past requests. **WebSocket is just an HTTP method like GET or POST** — WebSocket starts with an HTTP upgrade handshake, then becomes a completely separate persistent bidirectional protocol; it is not an HTTP method."
      }
    }
  ],
  "flashcards": [
    [
      "What does REST stand for?",
      "Representational State Transfer."
    ],
    [
      "Which protocol provides a persistent full-duplex connection?",
      "WebSocket."
    ],
    [
      "Why is JSON preferred over XML for web APIs?",
      "It is less verbose, faster to parse, and easier to read."
    ],
    [
      "What HTTP method is used to create a new resource in REST?",
      "POST."
    ],
    [
      "What does it mean that REST is 'stateless'?",
      "Each request from a client to a server must contain all the information needed to understand and process the request."
    ],
    [
      "What is the WebSocket protocol and why is it used?",
      "A protocol giving a persistent, two-way connection between client and server, used for real-time updates (chat, live data) without repeated polling."
    ],
    [
      "What does CRUD stand for?",
      "Create, Read, Update, Delete — the four basic operations on stored data."
    ],
    [
      "What is a key principle of REST?",
      "It is stateless — each request contains all the information needed; it uses HTTP methods on resources (often returning JSON/XML)."
    ]
  ],
  "quiz": [
    {
      "q": "Which of these is a full-duplex protocol?",
      "opts": [
        "HTTP",
        "REST",
        "WebSocket",
        "JSON"
      ],
      "ans": 2,
      "why": "WebSockets allow simultaneous two-way communication."
    },
    {
      "q": "Which data format is most compact?",
      "opts": [
        "XML",
        "HTML",
        "JSON",
        "CSV"
      ],
      "ans": 2,
      "why": "JSON has less overhead than XML or HTML."
    },
    {
      "q": "In a REST API, what would 'DELETE /users/1' likely do?",
      "opts": [
        "Create user 1",
        "Update user 1",
        "Remove user 1",
        "Fetch user 1"
      ],
      "ans": 2,
      "why": "DELETE is the standard method for removal."
    },
    {
      "q": "Which format uses tags similar to HTML?",
      "opts": [
        "JSON",
        "YAML",
        "XML",
        "Markdown"
      ],
      "ans": 2,
      "why": "XML (eXtensible Markup Language) uses tags."
    },
    {
      "q": "Which is best for pushing live updates from server to client without polling?",
      "opts": ["REST", "WebSocket", "CRUD", "DHCP"],
      "ans": 1,
      "why": "WebSocket keeps a persistent two-way channel, so the server can push updates instantly."
    }
  ],
  "exam": [
    {
      "q": "Discuss the advantages of using WebSockets instead of a RESTful API for a real-time stock trading application. (4 marks)",
      "marks": 4,
      "ms": [
        "WebSockets provide a persistent connection, avoiding the overhead of repeated HTTP handshakes (1).",
        "They support full-duplex communication, allowing the server to push updates to the client instantly (1).",
        "This reduces latency, which is critical for trading where prices change millisecond-to-millisecond (1).",
        "REST would require 'polling' (repeatedly asking for updates), which is inefficient and creates high network traffic (1)."
      ]
    },
    {
      "q": "Explain what is meant by REST being 'stateless' and give one consequence.",
      "marks": 3,
      "ms": [
        "Each request must contain all the information needed to process it (1)",
        "The server keeps no client session state between requests (1)",
        "Consequence: it scales easily, but data such as authentication must be resent each time (1)"
      ]
    },
    {
      "q": "Compare a REST (request-response) approach with WebSockets for a live sports-score web app, recommending one.",
      "marks": 6,
      "ms": [
        "REST: client sends HTTP requests; server responds; stateless (1)",
        "To get updates the client must POLL repeatedly (1)",
        "which is inefficient and adds latency/load (1)",
        "WebSocket: a persistent two-way connection (1)",
        "lets the server PUSH score updates instantly as they happen (1)",
        "Recommend WebSocket for real-time scores; REST for ordinary CRUD requests (1)"
      ]
    }
  ]
};

C["compsci:4.9.4.11"] = {
  "notes": [
    {
      "h": "Thin vs Thick Client Architectures"
    },
    {
      "callout": {
        "t": "def",
        "h": "Thick (Rich) Clients",
        "body": [
          {
            "kv": [
              [
                "Definition",
                "A client that performs the majority of its data processing locally on the device."
              ],
              [
                "Advantage",
                "Can work offline or with intermittent connectivity; provides high performance for complex tasks (e.g., IDEs, Video Editors)."
              ],
              [
                "Disadvantage",
                "Higher hardware costs per user; complex to manage and update across multiple machines."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Thin Clients",
        "body": [
          {
            "kv": [
              [
                "Definition",
                "A client that relies heavily on a central server for processing and storage."
              ],
              [
                "Advantage",
                "Centralised management (one update on server affects all); cheaper, lower-spec local hardware; better security as data stays on the server."
              ],
              [
                "Disadvantage",
                "Useless without a stable high-bandwidth network connection; server failure brings down all clients."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Comparison Table",
        "body": [
          {
            "table": {
              "head": [
                "Feature",
                "Thin Client",
                "Thick Client"
              ],
              "rows": [
                [
                  "Processing",
                  "Mostly on Server",
                  "Mostly on Client"
                ],
                [
                  "Storage",
                  "Centralised (Server)",
                  "Local (Disk)"
                ],
                [
                  "Network Load",
                  "Constant/High",
                  "Low (Synchronisation only)"
                ],
                [
                  "Initial Cost",
                  "Low (Dumb Terminals)",
                  "High (Powerful PCs)"
                ],
                [
                  "Management",
                  "Easy (Centralised)",
                  "Hard (Individual)"
                ]
              ]
            }
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Conceptual logic: Thick vs Thin data handling.",
        "src": "// Thick Client: Process locally then save\nvoid SaveDataLocally(Data d) {\n    var result = ComplexLocalAlgorithm(d);\n    Disk.Write(\"cache.dat\", result);\n}\n\n// Thin Client: Send everything to server\nasync Task SaveDataToServer(Data d) {\n    await Api.PostAsync(\"/process\", d);\n    // UI just waits for server result\n}"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Cloud Computing",
        "body": "Modern web applications (like Google Docs) are often a hybrid. They use the browser (Thin) but perform complex JavaScript processing locally (Thick-like) while storing everything in the cloud."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Thin vs Thick — Decision Framework",
        "body": "**Use thin client when:** many users, centralised control is important, hardware budget is low, network is reliable. **Use thick client when:** high processing power is needed (graphics, video, games), users work offline, or the network is unreliable. Thin = server does the work. Thick = client does the work."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Thin Clients Are Not 'Cheaper' to Run Overall",
        "body": "While thin clients have lower per-device hardware costs, the **server** must be powerful enough to handle all users simultaneously — and server infrastructure is expensive. The cost saving is in **per-device** hardware, not total infrastructure."
      }
    }
  ],
  "flashcards": [
    [
      "What is a thin client?",
      "A device that relies on a central server for processing and storage."
    ],
    [
      "What is a thick client?",
      "A device that performs most of its processing and storage locally."
    ],
    [
      "Give one advantage of a thin client setup.",
      "Centralised management and lower hardware costs per workstation."
    ],
    [
      "Give one disadvantage of a thick client setup.",
      "Harder to maintain and update individually; higher hardware costs."
    ],
    [
      "Which client type is best for video editing?",
      "Thick client (needs high local processing power)."
    ],
    [
      "What is a thin client?",
      "A device that relies on a powerful central server for processing and storage, doing minimal work locally."
    ],
    [
      "What is a thick (fat) client?",
      "A device that does most processing/storage locally and depends little on the server."
    ],
    [
      "One advantage of thin clients for an organisation?",
      "Cheaper, low-spec devices that are easier to manage, secure and update centrally."
    ]
  ],
  "quiz": [
    {
      "q": "Which client type requires a constant, high-speed connection to function?",
      "opts": [
        "Thick Client",
        "Thin Client",
        "Dumb Terminal",
        "Mobile Client"
      ],
      "ans": 1,
      "why": "Thin clients rely on the server for almost everything."
    },
    {
      "q": "Where is data typically stored in a thick client architecture?",
      "opts": [
        "Central Server",
        "Cloud Storage",
        "Local Hard Drive",
        "RAM only"
      ],
      "ans": 2,
      "why": "Thick clients handle their own storage."
    },
    {
      "q": "In which architecture is security and backup easiest to manage?",
      "opts": [
        "Thick Client",
        "Thin Client",
        "Peer-to-Peer",
        "Hybrid"
      ],
      "ans": 1,
      "why": "Centralised storage on the server makes backups simpler."
    },
    {
      "q": "What is a major risk of a thin client setup?",
      "opts": [
        "High power consumption",
        "Server being a single point of failure",
        "Hard to install software",
        "Expensive local CPUs"
      ],
      "ans": 1,
      "why": "If the server goes down, no one can work."
    },
    {
      "q": "A key DISADVANTAGE of thin-client computing is that...?",
      "opts": ["devices are expensive", "it depends heavily on the server and network (a single point of failure)", "software can't be updated centrally", "each device needs a powerful CPU"],
      "ans": 1,
      "why": "If the server or network fails, thin clients can't work — central dependence is the main weakness."
    }
  ],
  "exam": [
    {
      "q": "A large company is deciding between a thin client or a thick client infrastructure for its 500 office workers. Evaluate both options. (6 marks)",
      "marks": 6,
      "ms": [
        "Thin clients would reduce hardware costs and simplify maintenance as software only needs updating on the server (1).",
        "They also improve security by keeping data off local devices (1).",
        "However, they require a very reliable network; a server or network failure would stop all 500 workers (1).",
        "Thick clients allow for offline work and provide better performance for demanding applications (1).",
        "But they are more expensive to purchase for 500 workers (1).",
        "And they require more administrative effort to secure and update each individual machine (1)."
      ]
    },
    {
      "q": "State one advantage and one disadvantage of thin-client computing.",
      "marks": 2,
      "ms": [
        "Advantage: cheaper, centrally managed/secured low-spec clients (1)",
        "Disadvantage: heavy reliance on the server/network — a single point of failure (1)"
      ]
    },
    {
      "q": "Give three characteristics of a thick client compared with a thin client.",
      "marks": 3,
      "ms": [
        "Performs most processing locally (1)",
        "Stores data/applications locally and can work offline (1)",
        "Needs more powerful hardware and per-device maintenance (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);