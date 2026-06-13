/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.5.1.1"] = {
  "notes": [
    {
      "h": "Number Systems"
    },
    {
      "callout": {
        "t": "def",
        "h": "The Hierarchy of Numbers",
        "body": [
          {
            "kv": [
              [
                "Natural Numbers ($\\mathbb{N}$)",
                "Set of positive integers starting from 0 (or 1 depending on context). Used for counting."
              ],
              [
                "Integer Numbers ($\\mathbb{Z}$)",
                "Set of all positive and negative whole numbers, including zero."
              ],
              [
                "Rational Numbers ($\\mathbb{Q}$)",
                "Numbers that can be expressed as a fraction $\\frac{p}{q}$ where $p$ and $q$ are integers and $q \\neq 0$."
              ],
              [
                "Irrational Numbers",
                "Numbers that cannot be expressed as fractions (e.g., $\\pi$, $\\sqrt{2}$). They have infinite, non-repeating decimal expansions."
              ],
              [
                "Real Numbers ($\\mathbb{R}$)",
                "The set containing all rational and irrational numbers."
              ],
              [
                "Ordinal Numbers",
                "Numbers used to describe the numerical position of objects (e.g., 1st, 2nd, 3rd)."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Comparison of Number Sets"
    },
    {
      "table": {
        "head": [
          "Set",
          "Symbol",
          "Includes Negatives?",
          "Includes Fractions?",
          "Example"
        ],
        "rows": [
          [
            "Natural",
            "$\\mathbb{N}$",
            "No",
            "No",
            "0, 1, 2"
          ],
          [
            "Integer",
            "$\\mathbb{Z}$",
            "Yes",
            "No",
            "-5, 0, 10"
          ],
          [
            "Rational",
            "$\\mathbb{Q}$",
            "Yes",
            "Yes",
            "$\\frac{1}{2}, 0.75, -3$"
          ],
          [
            "Real",
            "$\\mathbb{R}$",
            "Yes",
            "Yes (incl. Irrational)",
            "$\\pi, \\sqrt{2}, 4.5$"
          ]
        ]
      }
    },
    {
      "h": "Classifying a Number"
    },
    {
      "steps": [
        {
          "h": "Whole Number?",
          "n": "If it's a whole number $\\ge 0$, it is Natural ($\\mathbb{N}$)."
        },
        {
          "h": "Negative Whole?",
          "n": "If it's a whole number but negative, it is an Integer ($\\mathbb{Z}$)."
        },
        {
          "h": "Fractional?",
          "n": "If it can be written as $\\frac{a}{b}$, it is Rational ($\\mathbb{Q}$)."
        },
        {
          "h": "Non-repeating?",
          "n": "If it's a non-ending, non-repeating decimal, it is Irrational (and part of Real $\\mathbb{R}$)."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Conceptual set membership",
        "src": "5 IN Natural AND 5 IN Integer\n-3 IN Integer BUT NOT IN Natural\n0.5 IN Rational BUT NOT IN Integer\nPI IN Real BUT NOT IN Rational"
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Counting vs Measurement",
        "body": "Natural numbers are used for counting discrete objects, while real numbers are used for continuous measurement."
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "Remember the symbols: $\\mathbb{N}$ (Natural), $\\mathbb{Z}$ (Integer), $\\mathbb{Q}$ (Rational), $\\mathbb{R}$ (Real)."
      }
    }
  ],
  "flashcards": [
    [
      "What is the symbol for the set of all integers?",
      "$\\mathbb{Z}$"
    ],
    [
      "What defines a rational number?",
      "A number that can be written as a fraction $p/q$, where $p$ and $q$ are integers and $q$ is not 0."
    ],
    [
      "Give two examples of irrational numbers.",
      "$\pi$ and $√()$ (or any other non-repeating, infinite decimals)."
    ],
    [
      "What is an ordinal number?",
      "A number used to indicate position or order, such as 1st, 2nd, or 3rd."
    ],
    [
      "Which set of numbers is used for measuring continuous quantities like length or time?",
      "Real Numbers ($\\mathbb{R}$)"
    ]
  ],
  "quiz": [
    {
      "q": "Which symbol represents the set of Rational Numbers?",
      "opts": [
        "$\\mathbb{N}$",
        "$\\mathbb{Z}$",
        "$\\mathbb{Q}$",
        "$\\mathbb{R}$"
      ],
      "ans": 2,
      "why": "$\\mathbb{Q}$ stands for quotient, representing fractions of integers."
    },
    {
      "q": "Which type of number is $-√()$?",
      "opts": [
        "Rational",
        "Irrational",
        "Integer",
        "Natural"
      ],
      "ans": 1,
      "why": "The square root of a non-perfect square is irrational, even if it is negative."
    },
    {
      "q": "In programming, an array index usually relies on which type of number conceptually?",
      "opts": [
        "Real",
        "Irrational",
        "Rational",
        "Ordinal/Natural"
      ],
      "ans": 3,
      "why": "Array indices describe positions (0th, 1st, 2nd) and use non-negative integers."
    },
    {
      "q": "True or False: Every Integer is also a Real Number.",
      "opts": [
        "True",
        "False",
        "Only positive integers",
        "Only negative integers"
      ],
      "ans": 0,
      "why": "The set of Reals encompasses Rationals, and Integers are Rationals with a denominator of 1."
    }
  ],
  "exam": [
    {
      "q": "Define what is meant by an irrational number and give one example.",
      "marks": 2,
      "ms": [
        "A number that cannot be represented as a fraction/ratio of two integers. (1)",
        "Example: pi / e / square root of 2. (1)"
      ]
    }
  ]
};

C["compsci:4.5.1.2"] = {
  "notes": [
    {
      "h": "Integer Numbers ($\\mathbb{Z}$)"
    },
    "Integers include all positive and negative whole numbers, including zero. They are used when discrete values below zero are required.",
    {
      "callout": {
        "t": "def",
        "h": "The Integer Set",
        "body": [
          {
            "kv": [
              [
                "Symbol",
                "$\\mathbb{Z}$ (from the German word 'Zahlen')"
              ],
              [
                "Members",
                "..., -3, -2, -1, 0, 1, 2, 3, ..."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Integer types in C#.",
        "src": "int temperature = -5;\nint altitude = 10000;\nint netProfit = -1200;"
      }
    }
  ],
  "flashcards": [
    [
      "What is the symbol for the set of integers?",
      "$\\mathbb{Z}$"
    ]
  ],
  "quiz": [
    {
      "q": "Which of these is NOT an integer?",
      "opts": [
        "-1",
        "0",
        "0.5",
        "100"
      ],
      "ans": 2,
      "why": "Integers must be whole numbers."
    }
  ],
  "exam": [
    {
      "q": "Explain why the set of integers is necessary in a bank account system.",
      "marks": 2,
      "ms": [
        "Accounts can have negative balances (overdrafts) (1)",
        "Which cannot be represented using only natural numbers (1)"
      ]
    }
  ]
};

C["compsci:4.5.1.3"] = {
  "notes": [
    {
      "h": "Rational Numbers ($\\mathbb{Q}$)"
    },
    "Rational numbers are those that can be expressed as a ratio (fraction) of two integers, where the denominator is not zero.",
    {
      "callout": {
        "t": "def",
        "h": "Rational Numbers",
        "body": [
          {
            "kv": [
              [
                "Symbol",
                "$\\mathbb{Q}$ (from 'Quotient')"
              ],
              [
                "Format",
                "$p/q$ where $p, q \\in \\mathbb{Z}$ and $q \neq 0$."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Representing a fraction.",
        "src": "RECORD Rational\n    numerator: INTEGER\n    denominator: INTEGER\nENDRECORD\n\n# 0.75 as a rational\nval = Rational(3, 4)"
      }
    }
  ],
  "flashcards": [
    [
      "Define a rational number.",
      "A number that can be written as a fraction $p/q$ where $p$ and $q$ are integers."
    ]
  ],
  "quiz": [
    {
      "q": "Is 5 a rational number?",
      "opts": [
        "Yes, it's 5/1",
        "No, it's an integer",
        "Only if it's 5.0",
        "Never"
      ],
      "ans": 0,
      "why": "All integers are rational because they can be written as themselves over 1."
    }
  ],
  "exam": [
    {
      "q": "State whether 0.333... (recurring) is a rational number and justify your answer.",
      "marks": 2,
      "ms": [
        "Yes (1)",
        "Because it can be written as the fraction 1/3 (1)"
      ]
    }
  ]
};

C["compsci:4.5.1.4"] = {
  "notes": [
    {
      "h": "Irrational Numbers"
    },
    "Irrational numbers cannot be expressed as a simple fraction. Their decimal expansion is infinite and non-repeating.",
    {
      "callout": {
        "t": "def",
        "h": "Irrational Examples",
        "body": [
          {
            "kv": [
              [
                "Mathematical Constants",
                "$\pi$, $e$"
              ],
              [
                "Surds",
                "$√()$, $√()$"
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "python",
        "cap": "Calculating pi.",
        "src": "import math\nprint(math.pi) # 3.141592653589793..."
      }
    }
  ],
  "flashcards": [
    [
      "What characterizes an irrational number's decimal expansion?",
      "It is infinite and non-repeating."
    ]
  ],
  "quiz": [
    {
      "q": "Which of these is irrational?",
      "opts": [
        "22/7",
        "sqrt(4)",
        "sqrt(2)",
        "1.5"
      ],
      "ans": 2,
      "why": "sqrt(2) cannot be written as a fraction, whereas sqrt(4) is 2."
    }
  ],
  "exam": [
    {
      "q": "Explain why irrational numbers cannot be stored with perfect precision in a standard computer.",
      "marks": 2,
      "ms": [
        "They have infinite non-repeating decimal parts (1)",
        "Computer memory is finite, so the value must be truncated or rounded (1)"
      ]
    }
  ]
};

C["compsci:4.5.1.5"] = {
  "notes": [
    {
      "h": "Real Numbers ($\\mathbb{R}$)"
    },
    "The set of real numbers encompasses all rational and irrational numbers. It represents any value along a continuous number line.",
    {
      "callout": {
        "t": "def",
        "h": "Real Numbers",
        "body": [
          {
            "kv": [
              [
                "Symbol",
                "$\\mathbb{R}$"
              ],
              [
                "Usage",
                "Used for measurement of continuous quantities like distance or time."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Floating point types for Real numbers.",
        "src": "double distance = 10.5;\nfloat piApprox = 3.14f;"
      }
    }
  ],
  "flashcards": [
    [
      "What is the symbol for Real numbers?",
      "$\\mathbb{R}$"
    ]
  ],
  "quiz": [
    {
      "q": "Which set contains $\pi$?",
      "opts": [
        "$\\mathbb{N}$",
        "$\\mathbb{Z}$",
        "$\\mathbb{Q}$",
        "$\\mathbb{R}$"
      ],
      "ans": 3,
      "why": "$\\mathbb{R}$ includes both rational and irrational numbers."
    }
  ],
  "exam": [
    {
      "q": "Give an example of a situation where you would use Real numbers instead of Integers.",
      "marks": 2,
      "ms": [
        "Measuring the height of a person (1)",
        "Calculating the precise area of a circle (1)"
      ]
    }
  ]
};

C["compsci:4.5.1.6"] = {
  "notes": [
    {
      "h": "Ordinal Numbers"
    },
    "Ordinal numbers are used to describe the numerical position of objects in a sequence (e.g., 1st, 2nd, 3rd).",
    {
      "callout": {
        "t": "def",
        "h": "Ordinality",
        "body": [
          {
            "kv": [
              [
                "Purpose",
                "To identify position or rank within a set."
              ],
              [
                "Example",
                "Array indices (0th, 1st, 2nd)."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Using ordinals in an array.",
        "src": "array = [\"A\", \"B\", \"C\"]\nOUTPUT array[0] # The 0th (first) element"
      }
    }
  ],
  "flashcards": [
    [
      "What is an ordinal number?",
      "A number that defines the position of an element in a set."
    ]
  ],
  "quiz": [
    {
      "q": "In the sequence [Apple, Banana, Cherry], 'Banana' is at which ordinal position (0-indexed)?",
      "opts": [
        "0th",
        "1st",
        "2nd",
        "3rd"
      ],
      "ans": 1,
      "why": "In 0-indexed systems, the second item is index 1."
    }
  ],
  "exam": [
    {
      "q": "Distinguish between cardinal and ordinal numbers.",
      "marks": 2,
      "ms": [
        "Cardinal numbers represent quantity/size (how many) (1)",
        "Ordinal numbers represent position/rank (what order) (1)"
      ]
    }
  ]
};

C["compsci:4.5.1.7"] = {
  "notes": [
    {
      "h": "Counting vs Measuring"
    },
    "Natural numbers ($\\mathbb{N}$) are used for counting discrete objects, while Real numbers ($\\mathbb{R}$) are used for measuring continuous quantities.",
    {
      "callout": {
        "t": "def",
        "h": "Counting and Measuring",
        "body": [
          {
            "kv": [
              [
                "Counting",
                "Discrete values (e.g. number of students). Uses $\\mathbb{N}$."
              ],
              [
                "Measuring",
                "Continuous values (e.g. weight, volume). Uses $\\mathbb{R}$."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Discrete vs Continuous logic.",
        "src": "count = 5 # Discrete\nweight = 72.45 # Continuous"
      }
    }
  ],
  "flashcards": [
    [
      "Which number set is best for measuring weight?",
      "Real numbers ($\\mathbb{R}$)"
    ]
  ],
  "quiz": [
    {
      "q": "Which of these is a measurement?",
      "opts": [
        "10 apples",
        "5 meters",
        "3 cars",
        "7 goals"
      ],
      "ans": 1,
      "why": "Meters represent a continuous distance that is measured."
    }
  ],
  "exam": [
    {
      "q": "Explain why natural numbers are suitable for counting but not for measuring the length of a desk.",
      "marks": 3,
      "ms": [
        "Counting involves discrete units (1)",
        "Length is a continuous quantity that can have fractional values (1)",
        "Natural numbers only include whole numbers, so they lack the precision needed for measurement (1)"
      ]
    }
  ]
};

C["compsci:4.5.2.1"] = {
  "notes": [
    {
      "h": "Number Bases"
    },
    {
      "callout": {
        "t": "def",
        "h": "Standard Bases",
        "body": [
          {
            "kv": [
              [
                "Decimal (Base 10)",
                "Uses digits 0-9. Positional multipliers are powers of 10."
              ],
              [
                "Binary (Base 2)",
                "Uses digits 0 and 1. Positional multipliers are powers of 2."
              ],
              [
                "Hexadecimal (Base 16)",
                "Uses digits 0-9 and A-F. Positional multipliers are powers of 16."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Base Comparison"
    },
    {
      "table": {
        "head": [
          "Base Name",
          "Radix",
          "Digits",
          "Used for..."
        ],
        "rows": [
          [
            "Binary",
            "2",
            "0, 1",
            "Digital hardware / logic circuits"
          ],
          [
            "Decimal",
            "10",
            "0-9",
            "Human counting and calculation"
          ],
          [
            "Hexadecimal",
            "16",
            "0-9, A-F",
            "Memory addresses / compact binary"
          ]
        ]
      }
    },
    {
      "h": "The Binary-to-Hex Process"
    },
    {
      "steps": [
        {
          "h": "Group",
          "n": "Split the binary string into groups of 4 bits (nibbles) starting from the right."
        },
        {
          "h": "Assign Value",
          "n": "Calculate the decimal value of each 4-bit nibble (0-15)."
        },
        {
          "h": "Convert",
          "n": "Map values 10-15 to letters A-F."
        },
        {
          "h": "Combine",
          "n": "Join the hex digits back together."
        }
      ]
    },
    {
      "callout": {
        "t": "info",
        "h": "Why Hexadecimal?",
        "body": "Hexadecimal is used because it is more compact than binary and very easy to convert to/from binary (1 hex digit = exactly 4 bits / a nibble)."
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Literal syntax in code",
        "src": "int hexValue = 0x2F; // Base 16\nint binValue = 0b00101111; // Base 2\nint decValue = 47; // Base 10"
      }
    }
  ],
  "flashcards": [
    [
      "Why is hexadecimal often used in computer science?",
      "It is more compact for humans to read, less prone to transcription errors, and easily maps to binary (4 bits per hex digit)."
    ],
    [
      "What decimal value does the hex digit 'C' represent?",
      "12"
    ],
    [
      "How many binary digits are represented by exactly one hexadecimal digit?",
      "4 (a nibble)"
    ],
    [
      "Convert the binary number 1010 to hexadecimal.",
      "A"
    ],
    [
      "Convert the hexadecimal number 1F to decimal.",
      "31 (16 * 1 + 15)"
    ]
  ],
  "quiz": [
    {
      "q": "What is the decimal equivalent of hexadecimal 2A?",
      "opts": [
        "42",
        "20",
        "32",
        "40"
      ],
      "ans": 0,
      "why": "2 * 16 + 10 = 32 + 10 = 42."
    },
    {
      "q": "Why do computers process data in binary?",
      "opts": [
        "It is faster for humans to read",
        "Hardware operates using switches with two states (on/off)",
        "It uses less memory than hexadecimal",
        "It is an older, more stable standard"
      ],
      "ans": 1,
      "why": "Binary directly maps to the physical characteristics of digital logic circuits (high/low voltage)."
    },
    {
      "q": "Which of these represents the binary number 1101 in hexadecimal?",
      "opts": [
        "C",
        "D",
        "E",
        "F"
      ],
      "ans": 1,
      "why": "1101 in binary is 8+4+0+1 = 13. In hex, 13 is D."
    },
    {
      "q": "How many distinct values can be represented by 2 hexadecimal digits?",
      "opts": [
        "16",
        "64",
        "256",
        "512"
      ],
      "ans": 2,
      "why": "Two hex digits range from 00 to FF, which is 16^2 = 256 values."
    }
  ],
  "exam": [
    {
      "q": "Explain why hexadecimal notation is often preferred to binary notation by programmers.",
      "marks": 2,
      "ms": [
        "Hex is shorter / more compact / easier to read for humans. (1)",
        "Therefore, it is less prone to transcription errors / easier to remember. (1)"
      ]
    }
  ]
};

C["compsci:4.5.3.1"] = {
  "notes": [
    {
      "h": "Bits and Bytes"
    },
    {
      "callout": {
        "t": "def",
        "h": "Data Units",
        "body": [
          {
            "kv": [
              [
                "Bit (binary digit)",
                "The fundamental unit of information, representing a 0 or 1."
              ],
              [
                "Byte",
                "A group of 8 bits. It can represent 256 distinct values ($2^8$)."
              ],
              [
                "Nibble",
                "4 bits (half a byte)."
              ],
              [
                "Word size",
                "The number of bits a CPU can process simultaneously (e.g., 32-bit or 64-bit words)."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Units Comparison"
    },
    {
      "table": {
        "head": [
          "Unit",
          "Size in Bits",
          "Distinct Values",
          "Purpose"
        ],
        "rows": [
          [
            "Bit",
            "1",
            "2",
            "Single flag / boolean"
          ],
          [
            "Nibble",
            "4",
            "16",
            "Single Hex digit"
          ],
          [
            "Byte",
            "8",
            "256",
            "ASCII Character"
          ],
          [
            "Word (64-bit)",
            "64",
            "$2^{64}$",
            "Address bus / Registers"
          ]
        ]
      }
    },
    {
      "h": "Calculating Capacity"
    },
    {
      "steps": [
        {
          "h": "Identify Bits",
          "n": "Determine the number of bits ($n$) available."
        },
        {
          "h": "Apply Power",
          "n": "Calculate $2^n$ to find total unique combinations."
        },
        {
          "h": "Subtract (if needed)",
          "n": "For range calculations (e.g., unsigned), the max value is $2^n - 1$."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Units conversion logic",
        "src": "bits = 32\nbytes = bits / 8\nnibbles = bits / 4\nvalues = 2^bits"
      }
    }
  ],
  "flashcards": [
    [
      "What is a bit?",
      "A single binary digit, 0 or 1, representing the fundamental unit of information."
    ],
    [
      "How many bits make up a byte?",
      "8"
    ],
    [
      "What is a group of 4 bits called?",
      "A nibble"
    ],
    [
      "How many distinct values can one byte represent?",
      "256 ($2^8$)"
    ],
    [
      "What is a 'word' in computer architecture?",
      "The number of bits the CPU can process in a single operation, typically 32 or 64 bits."
    ]
  ],
  "quiz": [
    {
      "q": "How many bytes are in 24 bits?",
      "opts": [
        "2",
        "3",
        "4",
        "8"
      ],
      "ans": 1,
      "why": "24 / 8 = 3."
    },
    {
      "q": "Which symbol traditionally represents a bit?",
      "opts": [
        "B",
        "b",
        "Bi",
        "bt"
      ],
      "ans": 1,
      "why": "Lowercase 'b' is used for bits (e.g., Mbps), while uppercase 'B' is for bytes (e.g., MBps)."
    },
    {
      "q": "If a computer has a 64-bit word size, how many bytes does one word contain?",
      "opts": [
        "4",
        "8",
        "16",
        "32"
      ],
      "ans": 1,
      "why": "64 / 8 = 8 bytes."
    },
    {
      "q": "How many distinct values can a nibble represent?",
      "opts": [
        "8",
        "16",
        "32",
        "64"
      ],
      "ans": 1,
      "why": "A nibble is 4 bits. $2^4 = 16$."
    }
  ],
  "exam": [
    {
      "q": "State the number of distinct values that can be represented by 3 bytes.",
      "marks": 1,
      "ms": [
        "16777216 OR 2^24. (1)"
      ]
    }
  ]
};

C["compsci:4.5.3.2"] = {
  "notes": [
    {
      "h": "Quantities and Prefixes"
    },
    "There are two systems of prefixes: Decimal (SI) and Binary (IEC).",
    {
      "table": {
        "head": [
          "Prefix Type",
          "Base",
          "Multipliers",
          "Standard Examples"
        ],
        "rows": [
          [
            "Decimal (SI)",
            "Powers of $10^3$",
            "1,000",
            "kilo (k), mega (M), giga (G)"
          ],
          [
            "Binary (IEC)",
            "Powers of $2^{10}$",
            "1,024",
            "kibi (Ki), mebi (Mi), gibi (Gi)"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Common Multipliers",
        "body": [
          {
            "kv": [
              [
                "1 kilobyte (kB)",
                "1,000 bytes ($10^3$)"
              ],
              [
                "1 kibibyte (KiB)",
                "1,024 bytes ($2^{10}$)"
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Converting Between Units"
    },
    {
      "steps": [
        {
          "h": "Identify Target",
          "n": "Decide if you are converting to a smaller unit (multiply) or larger unit (divide)."
        },
        {
          "h": "Select Factor",
          "n": "Use 1,000 for kB/MB/GB or 1,024 for KiB/MiB/GiB."
        },
        {
          "h": "Apply Math",
          "n": "Example: 2 MiB = $2 \times 1024$ KiB = 2048 KiB."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "SI vs IEC conversion",
        "src": "MB_to_B = 1000 * 1000\nMiB_to_B = 1024 * 1024\ndifference = MiB_to_B - MB_to_B # 48,576 bytes"
      }
    },
    {
      "callout": {
        "t": "warning",
        "body": "Pay close attention to 'kilo' vs 'kibi'. Storage manufacturers use SI (decimal), while OS usually display IEC (binary) equivalents, causing apparent discrepancies in drive size!"
      }
    }
  ],
  "flashcards": [
    [
      "How many bytes are in a kibibyte (KiB)?",
      "1,024 bytes ($2^{10}$)"
    ],
    [
      "What is the decimal prefix for $10^6$?",
      "Mega (M)"
    ],
    [
      "What is the binary prefix equivalent to Giga?",
      "Gibi (Gi), which is $2^{30}$"
    ],
    [
      "How many bits are in a kilobyte (kB)?",
      "8,000 bits (1000 bytes * 8)"
    ],
    [
      "Why is there a difference between the advertised size of a hard drive and its size in Windows?",
      "Manufacturers use decimal prefixes (GB, TB) but Windows calculates sizes using binary prefixes (GiB, TiB)."
    ]
  ],
  "quiz": [
    {
      "q": "Which prefix represents exactly 1,048,576 bytes?",
      "opts": [
        "Mega (M)",
        "Mebi (Mi)",
        "Giga (G)",
        "Gibi (Gi)"
      ],
      "ans": 1,
      "why": "1 Mebi = $2^{20} = 1,048,576$."
    },
    {
      "q": "What does 'Tebibyte' (TiB) signify?",
      "opts": [
        "$10^{12}$ bytes",
        "$2^{40}$ bytes",
        "$10^{40}$ bytes",
        "$2^{12}$ bytes"
      ],
      "ans": 1,
      "why": "Tebi is the binary prefix for the 'tera' tier, so it's $2^{40}$."
    },
    {
      "q": "How many kibibytes (KiB) are in one mebibyte (MiB)?",
      "opts": [
        "1000",
        "1024",
        "1048",
        "1000000"
      ],
      "ans": 1,
      "why": "Since binary prefixes step up by powers of $2^{10}$, there are 1024 KiB in a MiB."
    },
    {
      "q": "Calculate the exact number of bytes in 2 kilobytes (kB).",
      "opts": [
        "2000",
        "2048",
        "4000",
        "4096"
      ],
      "ans": 0,
      "why": "kilo (k) is SI decimal prefix for 1000. So 2 * 1000 = 2000 bytes."
    }
  ],
  "exam": [
    {
      "q": "Explain the difference between a kilobyte (kB) and a kibibyte (KiB).",
      "marks": 2,
      "ms": [
        "A kilobyte uses a base-10 prefix and represents 1000 bytes. (1)",
        "A kibibyte uses a base-2 prefix and represents 1024 (2^10) bytes. (1)"
      ]
    }
  ]
};

C["compsci:4.5.4.1"] = {
  "notes": [
    {
      "h": "Unsigned Binary"
    },
    {
      "callout": {
        "t": "def",
        "h": "Unsigned Key Facts",
        "body": [
          {
            "kv": [
              [
                "Unsigned binary",
                "A system representing positive integers or zero only. No sign bit."
              ],
              [
                "Range ($n$ bits)",
                "$0$ to $2^n - 1$"
              ],
              [
                "8-bit Range",
                "0 to 255"
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Representation Comparison"
    },
    {
      "table": {
        "head": [
          "Bits",
          "Max Value (Unsigned)",
          "Max Value (Two's Comp)"
        ],
        "rows": [
          [
            "4",
            "15",
            "7"
          ],
          [
            "8",
            "255",
            "127"
          ],
          [
            "16",
            "65,535",
            "32,767"
          ]
        ]
      }
    },
    {
      "h": "Binary to Decimal Conversion"
    },
    {
      "steps": [
        {
          "h": "Write Places",
          "n": "Write the powers of 2 above the bits (128, 64, 32...)."
        },
        {
          "h": "Filter",
          "n": "Identify which bits are set to 1."
        },
        {
          "h": "Sum",
          "n": "Add the corresponding place values together."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Unsigned range algorithm",
        "src": "FUNCTION maxUnsigned(nBits)\n  RETURN (2^nBits) - 1\nENDFUNCTION"
      }
    }
  ],
  "flashcards": [
    [
      "What is the maximum decimal value that can be represented by 8 unsigned bits?",
      "255"
    ],
    [
      "What is the range of values for an $n$-bit unsigned integer?",
      "0 to $2^n - 1$"
    ],
    [
      "Convert the unsigned binary 10010011 to decimal.",
      "147 (128 + 16 + 2 + 1)"
    ],
    [
      "Convert the decimal 45 to 8-bit unsigned binary.",
      "00101101 (32 + 8 + 4 + 1)"
    ],
    [
      "Does an unsigned binary integer use a bit to represent its sign?",
      "No, all bits are used for magnitude, meaning it can only represent non-negative numbers."
    ]
  ],
  "quiz": [
    {
      "q": "What is the maximum value of a 16-bit unsigned integer?",
      "opts": [
        "32767",
        "32768",
        "65535",
        "65536"
      ],
      "ans": 2,
      "why": "$2^{16} - 1 = 65536 - 1 = 65535$."
    },
    {
      "q": "Convert 01101100 directly to decimal.",
      "opts": [
        "108",
        "106",
        "110",
        "104"
      ],
      "ans": 0,
      "why": "64 + 32 + 8 + 4 = 108."
    },
    {
      "q": "Which of the following numbers CANNOT be represented by a 4-bit unsigned binary number?",
      "opts": [
        "0",
        "15",
        "8",
        "16"
      ],
      "ans": 3,
      "why": "A 4-bit unsigned integer ranges from 0 to 15. It cannot represent 16."
    },
    {
      "q": "What does the most significant bit (MSB) represent in an 8-bit unsigned binary number?",
      "opts": [
        "Sign",
        "128",
        "256",
        "1"
      ],
      "ans": 1,
      "why": "In unsigned binary, all bits represent magnitude. The MSB in 8 bits is $2^7 = 128$."
    }
  ],
  "exam": [
    {
      "q": "Calculate the range of numbers that can be represented by a 10-bit unsigned binary integer.",
      "marks": 2,
      "ms": [
        "Smallest value is 0. (1)",
        "Largest value is 1023 (or 2^10 - 1). (1)"
      ]
    }
  ]
};

C["compsci:4.5.4.2"] = {
  "notes": [
    {
      "h": "Unsigned Binary Arithmetic"
    },
    {
      "callout": {
        "t": "def",
        "h": "Arithmetic Rules",
        "body": [
          {
            "kv": [
              [
                "0 + 0",
                "0 (no carry)"
              ],
              [
                "0 + 1",
                "1 (no carry)"
              ],
              [
                "1 + 1",
                "0 (carry 1)"
              ],
              [
                "1 + 1 + 1",
                "1 (carry 1)"
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Addition Comparison"
    },
    {
      "table": {
        "head": [
          "Input A",
          "Input B",
          "Carry In",
          "Sum",
          "Carry Out"
        ],
        "rows": [
          [
            "1",
            "0",
            "0",
            "1",
            "0"
          ],
          [
            "1",
            "1",
            "0",
            "0",
            "1"
          ],
          [
            "1",
            "1",
            "1",
            "1",
            "1"
          ]
        ]
      }
    },
    {
      "h": "The Addition Process"
    },
    {
      "steps": [
        {
          "h": "Align",
          "n": "Write the two binary numbers one above the other."
        },
        {
          "h": "Right-to-Left",
          "n": "Start from the Least Significant Bit (LSB)."
        },
        {
          "h": "Apply Rules",
          "n": "Sum the bits and any carry from the previous column."
        },
        {
          "h": "Check Overflow",
          "n": "If a 1 is carried out of the Most Significant Bit, overflow has occurred."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Binary overflow check",
        "src": "result = a + b\nIF result >= 2^wordSize THEN\n  RAISE OverflowError\nENDIF"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Overflow",
        "body": "Overflow occurs when the result of a calculation is too large to fit in the allocated number of bits (e.g. adding two 8-bit numbers that produce a 9-bit result)."
      }
    }
  ],
  "flashcards": [
    [
      "What are the rules for binary addition of 1 + 1?",
      "Result is 0, carry 1."
    ],
    [
      "What are the rules for binary addition of 1 + 1 + 1?",
      "Result is 1, carry 1."
    ],
    [
      "What is an overflow error?",
      "When the result of a calculation requires more bits to store than are available."
    ],
    [
      "Add the binary numbers 0101 and 0011.",
      "1000"
    ],
    [
      "What happens in an 8-bit system if you add 11111111 and 00000001?",
      "The result is 100000000, causing an overflow error because it requires 9 bits."
    ]
  ],
  "quiz": [
    {
      "q": "Add unsigned binary numbers 1010 and 0110. What is the 4-bit result, and is there an overflow?",
      "opts": [
        "0000 (with overflow)",
        "1111 (no overflow)",
        "10000 (no overflow)",
        "0000 (no overflow)"
      ],
      "ans": 0,
      "why": "10 + 6 = 16. In 4 bits, 16 is 0000 with a carry bit of 1 that doesn't fit, causing overflow."
    },
    {
      "q": "What is 0111 + 0001 in binary?",
      "opts": [
        "1000",
        "0110",
        "1110",
        "1001"
      ],
      "ans": 0,
      "why": "7 + 1 = 8, which is 1000."
    },
    {
      "q": "When performing 8-bit binary addition, how do you detect an overflow?",
      "opts": [
        "If the result is negative",
        "If there is a carry out of the most significant bit",
        "If there is a carry into the most significant bit",
        "If all bits are 1"
      ],
      "ans": 1,
      "why": "For unsigned numbers, an overflow happens strictly when a 1 is carried out past the MSB."
    },
    {
      "q": "Calculate 00111100 + 00000101.",
      "opts": [
        "01000001",
        "00111111",
        "01000011",
        "10000001"
      ],
      "ans": 0,
      "why": "60 + 5 = 65, which is 64 + 1 = 01000001."
    }
  ],
  "exam": [
    {
      "q": "Add the following two 8-bit unsigned binary numbers: 10110110 and 01001011. State whether an overflow occurs.",
      "marks": 3,
      "ms": [
        "Correct binary addition: 100000001. (1) Note: The final carry forms the 9th bit.",
        "Correctly retaining the 8-bit result: 00000001. (1)",
        "State that overflow HAS occurred because the 9th carry bit cannot be stored in 8 bits. (1)"
      ]
    }
  ]
};

C["compsci:4.5.4.3"] = {
  "notes": [
    {
      "h": "Signed Binary and Two's Complement"
    },
    {
      "callout": {
        "t": "def",
        "h": "Signed Concepts",
        "body": [
          {
            "kv": [
              [
                "Two's Complement",
                "The standard way to represent signed integers in computers."
              ],
              [
                "Most Significant Bit (MSB)",
                "In Two's Complement, the MSB has a negative place value (e.g., -128 for 8-bit)."
              ],
              [
                "Fixed-point",
                "A way to represent fractions by reserving some bits for the fractional part."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Range of n bits"
    },
    {
      "table": {
        "head": [
          "Format",
          "Min Value",
          "Max Value"
        ],
        "rows": [
          [
            "Unsigned",
            "0",
            "$2^n - 1$"
          ],
          [
            "Two's Complement",
            "$-2^{n-1}$",
            "$2^{n-1} - 1$"
          ]
        ]
      }
    },
    {
      "h": "The Negation Process"
    },
    {
      "steps": [
        {
          "h": "Start",
          "n": "Take the positive binary representation of the number."
        },
        {
          "h": "Invert",
          "n": "Flip all bits (0 becomes 1, 1 becomes 0)."
        },
        {
          "h": "Add One",
          "n": "Add 1 to the result using binary addition."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Subtraction via addition",
        "src": "FUNCTION subtract(A, B)\n  negB = twosComplement(B)\n  RETURN A + negB\nENDFUNCTION"
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Two's Complement Range",
        "body": "$-2^{n-1}$ to $2^{n-1} - 1$. (For 8 bits: -128 to 127)"
      }
    }
  ],
  "flashcards": [
    [
      "How do you convert a positive binary number to its negative Two's complement equivalent?",
      "Invert all the bits (0s become 1s, 1s become 0s) and add 1."
    ],
    [
      "What does the Most Significant Bit (MSB) represent in Two's complement?",
      "The negative place value (e.g., -128 in an 8-bit number)."
    ],
    [
      "What is the range of values for an 8-bit Two's complement integer?",
      "-128 to 127"
    ],
    [
      "What is the Two's complement representation of -1 in 8 bits?",
      "11111111"
    ],
    [
      "How does a computer perform subtraction using Two's complement?",
      "It converts the subtrahend (number to subtract) to its negative Two's complement form and adds it to the minuend."
    ]
  ],
  "quiz": [
    {
      "q": "Convert the decimal -45 to 8-bit Two's complement.",
      "opts": [
        "11010011",
        "11010010",
        "10101101",
        "00101101"
      ],
      "ans": 0,
      "why": "45 is 00101101. Invert bits: 11010010. Add 1: 11010011."
    },
    {
      "q": "What is the decimal equivalent of the 8-bit Two's complement number 10000000?",
      "opts": [
        "-1",
        "-127",
        "-128",
        "128"
      ],
      "ans": 2,
      "why": "The MSB is -128. The other bits are 0. So, -128."
    },
    {
      "q": "What is the formula for the range of an $n$-bit Two's complement number?",
      "opts": [
        "0 to $2^n-1$",
        "$-2^n$ to $2^n-1$",
        "$-2^{n-1}$ to $2^{n-1}-1$",
        "$-2^{n-1}-1$ to $2^{n-1}$"
      ],
      "ans": 2,
      "why": "The range spans from the largest negative value ($-2^{n-1}$) to the largest positive value ($2^{n-1}-1$)."
    },
    {
      "q": "Why is Two's complement preferred over Sign and Magnitude representation?",
      "opts": [
        "It avoids the problem of having two representations for zero (+0 and -0) and simplifies addition/subtraction hardware.",
        "It uses less memory.",
        "It is faster for humans to decode.",
        "It allows for floating-point calculations."
      ],
      "ans": 0,
      "why": "Two's complement provides a single zero and allows the same circuitry to be used for both addition and subtraction."
    }
  ],
  "exam": [
    {
      "q": "Show the steps to calculate 15 - 20 using 8-bit Two's complement arithmetic.",
      "marks": 4,
      "ms": [
        "Represent 15 as an 8-bit binary number: 00001111. (1)",
        "Represent 20 as an 8-bit binary number: 00010100. (1)",
        "Convert 20 to its Two's complement (invert and add 1): 11101011 + 1 = 11101100. (1)",
        "Add 15 and -20: 00001111 + 11101100 = 11111011 (which represents -5). (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);