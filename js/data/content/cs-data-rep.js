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
          "m": "Is it a positive whole number or zero?",
          "n": "Yes → Natural ($\\mathbb{N}$). Remember: $\\mathbb{N}$ does NOT include negatives."
        },
        {
          "h": "Negative Whole?",
          "m": "Is it a whole number but below zero?",
          "n": "Yes → Integer ($\\mathbb{Z}$). Integers include all whole numbers, positive and negative."
        },
        {
          "h": "Fractional?",
          "m": "Can it be written exactly as $\\frac{a}{b}$ where $a, b \\in \\mathbb{Z}$ and $b \\neq 0$?",
          "n": "Yes → Rational ($\\mathbb{Q}$). Includes terminating and recurring decimals."
        },
        {
          "h": "Non-repeating?",
          "m": "Is it an infinite, non-repeating decimal that cannot be written as a fraction?",
          "n": "Yes → Irrational — still part of Real ($\\mathbb{R}$) but outside $\\mathbb{Q}$."
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Number Set Hierarchy",
        "body": "Sets nest inside each other: **ℕ** (natural: 0, 1, 2...) ⊂ **ℤ** (integers: ...-1, 0, 1...) ⊂ **ℚ** (rationals: p/q) ⊂ **ℝ** (reals: all). **Ordinals** express position (1st, 2nd). **Cardinals** express quantity (1, 2, 3). Every natural number is an integer; every integer is rational; every rational is real."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Number System Misconceptions",
        "body": "**All numbers are integers** — No; 0.5, π, √2 are not integers. Integers are whole numbers only (positive, negative, zero). **Natural numbers include negative numbers** — No; natural numbers (ℕ) are {0, 1, 2, 3, ...} — all non-negative. Negative whole numbers require the integer set ℤ."
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
      "$\\pi$ and $\\sqrt{2}$ (non-repeating, infinite decimal expansions)."
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
      "q": "Which type of number is $-\\sqrt{2}$?",
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
    "Integers include all positive and negative whole numbers, including zero. They are used when discrete values below zero are required — such as temperatures, financial balances, or coordinates.",
    {
      "callout": {
        "t": "def",
        "h": "The Integer Set",
        "body": "$\\mathbb{Z}$ (from the German 'Zahlen' meaning 'numbers') = $\\{\\ldots, -3, -2, -1, 0, 1, 2, 3, \\ldots\\}$. Every natural number is also an integer, but integers extend to negative values."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Integer Types in Practice",
        "body": [
          {
            "kv": [
              [
                "int8 / byte",
                "8-bit signed: −128 to 127"
              ],
              [
                "int16 / short",
                "16-bit signed: −32,768 to 32,767"
              ],
              [
                "int32 / int",
                "32-bit signed: −2,147,483,648 to 2,147,483,647"
              ],
              [
                "int64 / long",
                "64-bit signed: approximately ±9.2 × 10¹⁸"
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Integer Overflow",
        "body": "In a computer, integers have a fixed number of bits. If the result of a calculation exceeds the maximum value, **overflow** occurs and the value wraps around (e.g., 127 + 1 = −128 in a signed 8-bit system)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Integers Have Unlimited Range?",
        "body": "In mathematics $\\mathbb{Z}$ is unbounded, but in computing every integer type has a fixed bit width and a finite range. Choosing the wrong type for large values causes overflow bugs."
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Integer types in C#.",
        "src": "int temperature = -5;\nint altitude = 10000;\nint netProfit = -1200;\n\n// Overflow example:\nsbyte x = 127;\nx++;  // x is now -128 (wraps around)"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Integers (ℤ)",
        "body": "ℤ = all whole numbers, positive AND negative AND zero: {..., -2, -1, 0, 1, 2, ...}. Symbol ℤ from German 'Zahlen' (numbers). ℕ ⊂ ℤ — all natural numbers are integers. In computing, integers are stored in fixed-width bits; 8-bit signed: -128 to 127 (two's complement)."
      }
    }
  ],
  "flashcards": [
    [
      "What is the symbol for the set of integers?",
      "$\\mathbb{Z}$ (from the German 'Zahlen')"
    ],
    [
      "What is the range of an 8-bit signed integer?",
      "−128 to 127"
    ],
    [
      "What is integer overflow?",
      "When the result of a calculation exceeds the maximum value for the integer type, causing the value to wrap around to the opposite extreme."
    ]
  ],
  "quiz": [
    {
      "q": "Which of these is NOT an integer?",
      "opts": [
        "−1",
        "0",
        "0.5",
        "100"
      ],
      "ans": 2,
      "why": "Integers must be whole numbers; 0.5 is a fraction and therefore rational, not an integer."
    },
    {
      "q": "In a signed 8-bit integer, what happens when you add 1 to the value 127?",
      "opts": [
        "128",
        "−128",
        "0",
        "An overflow error is silently ignored"
      ],
      "ans": 1,
      "why": "127 is 01111111 in binary. Adding 1 gives 10000000, which is −128 in two's complement — the value wraps around."
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
        "body": "A number $x$ is rational if $x = \\frac{p}{q}$ for some integers $p, q$ with $q \\neq 0$. Symbol: $\\mathbb{Q}$ (from 'Quotient')."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "All These Are Rational",
        "body": [
          {
            "kv": [
              [
                "Whole integers",
                "$5 = \\frac{5}{1}$, $-3 = \\frac{-3}{1}$"
              ],
              [
                "Terminating decimals",
                "$0.75 = \\frac{3}{4}$, $1.5 = \\frac{3}{2}$"
              ],
              [
                "Recurring decimals",
                "$0.\\overline{3} = \\frac{1}{3}$, $0.\\overline{142857} = \\frac{1}{7}$"
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "\"Integers Are Not Rational\"",
        "body": "Every integer IS rational — it can always be written as itself over 1 (e.g., $7 = \\frac{7}{1}$). The number sets are nested: $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Recurring Decimals Are Always Rational",
        "body": "If a decimal repeats a pattern forever (like $0.\\overline{6} = \\frac{2}{3}$), it IS rational. Only decimals that are infinite AND non-repeating are irrational."
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Representing a fraction as a rational type.",
        "src": "RECORD Rational\n    numerator: INTEGER\n    denominator: INTEGER\nENDRECORD\n\n# 0.75 stored exactly as 3/4\nval = Rational(3, 4)"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Rational Numbers (ℚ)",
        "body": "ℚ = all numbers expressible as **p/q** where p, q ∈ ℤ and q ≠ 0. Includes all terminating decimals (0.25 = 1/4) and repeating decimals (0.333... = 1/3). ℤ ⊂ ℚ (every integer n = n/1 is rational). π and √2 are NOT rational — they cannot be expressed as p/q."
      }
    }
  ],
  "flashcards": [
    [
      "Define a rational number.",
      "A number that can be written as $\\frac{p}{q}$ where $p$ and $q$ are integers and $q \\neq 0$."
    ],
    [
      "Is a recurring decimal rational?",
      "Yes — any recurring decimal can be converted to a fraction, making it rational."
    ],
    [
      "Why is every integer also rational?",
      "Any integer $n$ can be written as $\\frac{n}{1}$, satisfying the definition of a rational number."
    ]
  ],
  "quiz": [
    {
      "q": "Is 5 a rational number?",
      "opts": [
        "Yes, it equals $5/1$",
        "No, it is an integer",
        "Only if it is written as 5.0",
        "Never"
      ],
      "ans": 0,
      "why": "All integers are rational because they can be written as themselves over 1."
    },
    {
      "q": "Which of these is NOT a rational number?",
      "opts": [
        "$0.\\overline{3}$",
        "$\\frac{7}{2}$",
        "$\\sqrt{2}$",
        "$-4$"
      ],
      "ans": 2,
      "why": "$\\sqrt{2}$ is irrational — its decimal expansion never repeats. The others can all be expressed as fractions."
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
    "Irrational numbers cannot be expressed as a fraction of two integers. Their decimal expansion is infinite and non-repeating — the digits never settle into a repeating pattern.",
    {
      "callout": {
        "t": "def",
        "h": "Irrational Numbers",
        "body": "A number that cannot be written as $\\frac{p}{q}$ for any integers $p$ and $q$. Its decimal expansion is infinite and non-repeating."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Common Examples",
        "body": [
          {
            "kv": [
              [
                "Mathematical Constants",
                "$\\pi \\approx 3.14159\\ldots$, $e \\approx 2.71828\\ldots$"
              ],
              [
                "Surds",
                "$\\sqrt{2} \\approx 1.41421\\ldots$, $\\sqrt{3} \\approx 1.73205\\ldots$"
              ],
              [
                "Not irrational",
                "$\\sqrt{4} = 2$ (a perfect square — this IS rational/integer)"
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common Misconception",
        "body": "**Surds are always irrational** — but only when the square root of a non-perfect-square is taken. $\\sqrt{4} = 2$ is rational. $\\sqrt{9} = 3$ is rational. Test: if the result is a whole number, it is NOT irrational."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Computers Cannot Represent Irrationals Exactly",
        "body": "Because memory is finite, any irrational number must be truncated or rounded. This introduces a small rounding error every time an irrational is stored or used in a calculation."
      }
    },
    {
      "code": {
        "lang": "python",
        "cap": "Approximating π — notice it is not exact.",
        "src": "import math\nprint(math.pi)       # 3.141592653589793  (truncated)\nprint(math.sqrt(2))  # 1.4142135623730951 (truncated)"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Irrational Numbers",
        "body": "Irrational numbers CANNOT be expressed as p/q; their decimal expansion is **infinite and non-repeating**. Examples: π ≈ 3.14159..., √2 ≈ 1.41421..., e ≈ 2.71828... Together, ℚ ∪ irrationals = ℝ. They fill the 'gaps' between rationals on the real number line."
      }
    }
  ],
  "flashcards": [
    [
      "What characterizes an irrational number's decimal expansion?",
      "It is infinite and non-repeating — the digits never form a recurring pattern."
    ],
    [
      "Is $\\sqrt{4}$ irrational?",
      "No. $\\sqrt{4} = 2$, which is an integer and therefore rational."
    ],
    [
      "Why can computers not store $\\pi$ exactly?",
      "Memory is finite; irrational numbers have infinitely many non-repeating digits, so they must be truncated."
    ]
  ],
  "quiz": [
    {
      "q": "Which of these is irrational?",
      "opts": [
        "$22/7$",
        "$\\sqrt{4}$",
        "$\\sqrt{2}$",
        "$1.5$"
      ],
      "ans": 2,
      "why": "$\\sqrt{2} \\approx 1.41421\\ldots$ cannot be written as a fraction. $\\sqrt{4} = 2$ is an integer, and $22/7$ is a rational approximation of $\\pi$."
    },
    {
      "q": "Which of these IS rational?",
      "opts": [
        "$\\pi$",
        "$\\sqrt{3}$",
        "$\\sqrt{9}$",
        "$e$"
      ],
      "ans": 2,
      "why": "$\\sqrt{9} = 3$, a whole number — therefore rational. The others are irrational."
    }
  ],
  "exam": [
    {
      "q": "Explain why irrational numbers cannot be stored with perfect precision in a standard computer.",
      "marks": 2,
      "ms": [
        "They have infinite non-repeating decimal parts (1)",
        "Computer memory is finite, so the value must be truncated or rounded, introducing a rounding error (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Real Numbers (ℝ)",
        "body": "ℝ = ALL numbers on the continuous number line: rational + irrational. Hierarchy: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Real numbers are used for **measurement** (length, weight, temperature) because measurements are continuous. Computers approximate reals using floating point (mantissa × 2^exponent)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Real Number Misconceptions",
        "body": "**Computers can represent all real numbers** — No; computers use finite-precision floating point which can only approximate most reals. Numbers like π or √2 require infinite digits and are stored as approximations, causing rounding errors. **All decimals are irrational** — No; 0.5 (= 1/2) and 0.333... (= 1/3) are rational. Only non-terminating, non-repeating decimals are irrational."
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
      "q": "Which set contains $\\pi$?",
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Ordinal vs Cardinal Numbers",
        "body": "**Ordinal**: describes position/rank in a sequence — 1st, 2nd, 3rd... (order matters). **Cardinal**: describes quantity — 1, 2, 3... (how many). In computing: array indices are ordinal (position 0, 1, 2...); counting elements is cardinal."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Ordinal Number Misconception",
        "body": "**Ordinal and cardinal numbers are interchangeable** — No: cardinal numbers count quantity ('there are 3 items'); ordinal numbers indicate rank ('this is the 3rd item'). Confusing them leads to off-by-one errors — e.g., the 3rd element in a 0-indexed array is at index 2, not 3."
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Counting vs Measuring",
        "body": "**Counting** uses natural/integer numbers (ℕ/ℤ) — discrete, exact. You cannot have 2.5 people. **Measuring** uses real numbers (ℝ) — continuous. Weight, height, temperature can take any value. In CS: discrete quantities → integer types; continuous quantities → floating point."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Integer Overflow Misconception",
        "body": "**Integer types in programming can store any counting number** — No; integer types have a fixed maximum. 32-bit signed int max = 2,147,483,647. Exceed it and the value wraps around (overflow). Very large counts require 64-bit integers or big integer types. **Floating point is more precise than integers** — Integers are exact within their range; floating point introduces rounding errors."
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
          "m": "Split the binary string into groups of 4 bits (nibbles) from the right; pad with leading zeros if needed.",
          "n": "e.g., 10110111 → 1011 | 0111"
        },
        {
          "h": "Assign Value",
          "m": "Calculate the decimal value of each 4-bit nibble (0–15).",
          "n": "1011 = 8+2+1 = 11, 0111 = 4+2+1 = 7"
        },
        {
          "h": "Convert",
          "m": "Map values 10–15 to hex letters A–F (10=A, 11=B, 12=C, 13=D, 14=E, 15=F)."
        },
        {
          "h": "Combine",
          "m": "Join the hex digits left to right: the result is B7.",
          "n": "Check: 0xB7 = 11×16 + 7 = 176 + 7 = 183 ✓"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Number Bases",
        "body": "**Binary (base 2)**: digits 0-1. **Octal (base 8)**: digits 0-7. **Decimal (base 10)**: digits 0-9. **Hexadecimal (base 16)**: digits 0-9, A-F. Hex in CS: 1 hex digit = 4 bits (nibble); 2 hex digits = 1 byte — compact shorthand for binary. 0xFF = 11111111 = 255."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Number Base Misconceptions",
        "body": "**Hex is harder for computers to process than decimal** — Computers only understand binary (0/1). Hexadecimal is a HUMAN notation that maps cleanly to binary (4 bits per hex digit). Decimal is no more native to computers than hex. **A number changes value when converted between bases** — Only the representation changes; the actual value is identical. 255 in decimal = FF in hex = 11111111 in binary."
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
          "m": "Determine the number of bits $n$ available for the representation."
        },
        {
          "h": "Apply Power",
          "m": "Calculate $2^n$ to find total unique combinations/values."
        },
        {
          "h": "Subtract (if needed)",
          "m": "For the unsigned max value, subtract 1: max $= 2^n - 1$.",
          "n": "e.g., 8-bit: $2^8 - 1 = 255$. The value 0 takes one slot."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Units conversion logic",
        "src": "bits = 32\nbytes = bits / 8\nnibbles = bits / 4\nvalues = 2^bits"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Bits, Nibbles, Bytes",
        "body": "**Bit**: 1 binary digit (0 or 1) — smallest unit. **Nibble**: 4 bits (1 hex digit). **Byte**: 8 bits — 2^8 = 256 possible values (0–255). n bits → 2^n different patterns. Data file sizes measured in bytes; larger units use powers of 2 (KiB, MiB, GiB)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Bits and Bytes Misconceptions",
        "body": "**1 kilobyte = 1000 bytes** — In binary computing, 1 KiB (kibibyte) = 2^10 = 1,024 bytes. Hard drives use SI (KB = 1,000 bytes), which is why a '500 GB' drive appears as ~465 GiB in an OS. **Bits and bytes are the same** — A byte = 8 bits. Data rates (internet speeds) are usually in bits/second (Mbps); storage sizes are in bytes (GB)."
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
          "m": "Decide if you are converting to a smaller unit (multiply) or a larger unit (divide)."
        },
        {
          "h": "Select Factor",
          "m": "Use 1,000 for decimal prefixes (kB/MB/GB) or 1,024 for binary prefixes (KiB/MiB/GiB)."
        },
        {
          "h": "Apply Math",
          "m": "Multiply (or divide) by the factor for each prefix step.",
          "n": "Example: 2 MiB to KiB → $2 \\times 1024 = 2048$ KiB."
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
        "t": "warn",
        "body": "Pay close attention to 'kilo' vs 'kibi'. Storage manufacturers use SI (decimal), while operating systems display IEC (binary) equivalents — a '500 GB' drive shows as ~465 GiB in Windows/macOS."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Storage Prefixes",
        "body": "**Binary (IEC)**: KiB = 2^10 = 1,024 B; MiB = 2^20 ≈ 1.05 MB; GiB = 2^30 ≈ 1.07 GB. **SI (decimal)**: KB = 10^3 = 1,000 B; MB = 10^6; GB = 10^9. OS reports binary (GiB); drive manufacturers advertise decimal (GB) → apparent 'missing' storage. Data transfer rates use bits (Mbps, Gbps)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Prefix Misconceptions",
        "body": "**1 megabyte = exactly 1 million bytes** — Only in SI. In binary computing, 1 MiB = 2^20 = 1,048,576 bytes. Hard drives use SI; OSes report binary, causing the apparent discrepancy. **KB and KiB mean the same thing** — KB (SI) = 1,000 bytes; KiB (binary) = 1,024 bytes. The difference matters for large storage: a 500 GB drive ≈ 465 GiB."
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
          "m": "Above each bit, write the place value (power of 2): 128, 64, 32, 16, 8, 4, 2, 1."
        },
        {
          "h": "Filter",
          "m": "Identify which bit positions are set to 1."
        },
        {
          "h": "Sum",
          "m": "Add the place values for all positions with a 1 to get the decimal result.",
          "n": "e.g., 10010011 → 128 + 16 + 2 + 1 = 147"
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Unsigned range algorithm",
        "src": "FUNCTION maxUnsigned(nBits)\n  RETURN (2^nBits) - 1\nENDFUNCTION"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Unsigned Binary",
        "body": "n bits → values **0 to 2^n − 1**. 8 bits: 0–255. Column values right-to-left: 2^0=1, 2^1=2, 2^2=4, 2^3=8, 2^4=16, 2^5=32, 2^6=64, 2^7=128. To convert decimal→binary: repeatedly subtract the largest fitting power of 2. All n-bit combinations are valid; no sign bit."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Unsigned Binary Misconceptions",
        "body": "**Unsigned binary can represent negative numbers** — No; unsigned binary only represents non-negative integers (0 and above). To represent negatives, use two's complement (signed). **An 8-bit unsigned number stores up to 256** — The maximum is 255 (2^8 − 1); 256 itself requires 9 bits. The range is 0–255 (256 different values)."
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
          "m": "Write the two binary numbers vertically, aligning bit columns right-to-left."
        },
        {
          "h": "Right-to-Left",
          "m": "Start from the Least Significant Bit (LSB) and work left, column by column."
        },
        {
          "h": "Apply Rules",
          "m": "Sum each column including any carry from the right: 0+0=0, 0+1=1, 1+1=10 (sum 0 carry 1), 1+1+1=11 (sum 1 carry 1)."
        },
        {
          "h": "Check Overflow",
          "m": "If a 1 is carried out beyond the MSB, overflow has occurred — the result needs more bits than available.",
          "n": "e.g., adding 11111111 + 00000001 in 8 bits produces carry beyond bit 7."
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Binary Addition Rules",
        "body": "0+0=0; 0+1=1; 1+0=1; **1+1=10** (sum 0, carry 1); **1+1+1=11** (sum 1, carry 1). Carry ripples left. Overflow: result requires more bits than available (carry out of the most significant bit). For subtraction: add the two's complement of the number being subtracted."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Binary Arithmetic Misconceptions",
        "body": "**Binary addition works just like decimal addition** — The method (column-by-column, carry when sum ≥ base) is the same, but in binary the base is 2, so carrying happens immediately at 2. 1+1=2 in decimal, but 1+1=10 in binary. Not applying the correct base is the most common error. **A carry out of the MSB in signed addition means the result is correct** — In signed (two's complement) arithmetic, a carry out does NOT necessarily mean overflow; check if the sign bit of the result is wrong instead."
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
          "m": "Take the positive binary representation (magnitude) of the number."
        },
        {
          "h": "Invert",
          "m": "Flip all bits (0 → 1, 1 → 0) to form the one's complement."
        },
        {
          "h": "Add One",
          "m": "Add binary 1 to the one's complement — the result is the two's complement.",
          "n": "e.g., for -45: 00101101 → invert → 11010010 → +1 → 11010011"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Two's Complement",
        "body": "To negate: **flip all bits, then add 1**. Range for n bits: **-2^(n-1) to 2^(n-1) - 1**. 8-bit: -128 to 127. MSB has weight **-2^(n-1)** (negative). To decode: if MSB=1, subtract 2^n from unsigned value. Advantage: same hardware adder works for both positive and negative numbers."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Two's Complement Misconceptions",
        "body": "**Two's complement just puts a minus sign in front of the binary** — No; it completely restructures the bit pattern. -1 in 8-bit two's complement is 11111111, not 10000001 (which is sign-magnitude). **The MSB is just a sign flag (0 or 1)** — The MSB in two's complement has a negative weight (-2^(n-1)); it contributes -128 to the value in 8-bit. It is NOT just a +/-  indicator."
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