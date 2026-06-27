/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.5.4.5"] = {
  "notes": [
    {
      "h": "Floating Point Representation & Errors"
    },
    { "callout": { "t": "info", "body": "Floating point allows representation of fractional values and a huge range of numbers. It is split into a **Mantissa** (fractional part) and an **Exponent** (power of 2)." } },
    {
      "callout": {
        "t": "formula",
        "h": "Value Calculation",
        "body": "Value = $Mantissa \\times 2^{Exponent}$. Both parts are usually stored in Two's Complement."
      }
    },
    {
      "h": "The Floating Point Components"
    },
    {
      "table": {
        "head": [
          "Component",
          "Function",
          "Impact of More Bits"
        ],
        "rows": [
          [
            "Mantissa",
            "Stores the significant digits of the number",
            "Increases **Precision**"
          ],
          [
            "Exponent",
            "Stores the power of 2 (position of radix point)",
            "Increases **Range**"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Key Floating Point Terms",
        "body": [
          {
            "kv": [
              [
                "Normalisation",
                "Adjusting the format to maximize precision. In two's complement, a positive normalised mantissa starts with `0.1` and a negative with `1.0`."
              ],
              [
                "Rounding Errors",
                "Some numbers (like 0.1) cannot be represented exactly in binary, leading to approximation errors."
              ],
              [
                "Absolute Error",
                "$|Actual Value - Recorded Value|$"
              ],
              [
                "Relative Error",
                "$\\frac{Absolute Error}{Actual Value}$"
              ],
              [
                "Underflow",
                "The value is too small (too close to zero) to be represented accurately."
              ],
              [
                "Overflow",
                "The value is too large to be represented with the available bits."
              ]
            ]
          }
        ]
      }
    },
    {
      "page": "Normalisation & Errors"
    },
    {
      "h": "The Normalisation Process"
    },
    {
      "steps": [
        {
          "h": "Check bits",
          "m": "Examine the first two bits of the mantissa."
        },
        {
          "h": "Shift",
          "m": "If bits are 00 (positive) or 11 (negative), shift mantissa left by 1 and decrement the exponent by 1.",
          "n": "This eliminates a redundant sign bit without changing the value."
        },
        {
          "h": "Repeat",
          "m": "Keep shifting until the first two bits are 01 (positive) or 10 (negative)."
        },
        {
          "h": "Finalise",
          "m": "The mantissa is now normalised: sign bit in position 0, most significant fractional bit in position 1."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Floating point error example",
        "src": "x = 0.1 # In binary this is 0.00011001100... (infinite)\nIF (x + x + x) == 0.3 THEN\n  OUTPUT \"Exact match\"\nELSE\n  OUTPUT \"Rounding error detected\"\nENDIF"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Normalisation Rule",
        "body": "Normalisation ensures maximum precision by eliminating leading redundant bits in the mantissa."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Floating Point Structure",
        "body": "Value = **Mantissa × 2^Exponent** (both stored in two's complement). More mantissa bits = greater **precision** (more significant digits). More exponent bits = greater **range** (larger/smaller values). In a fixed bit-width, precision and range are traded off against each other."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Floating Point Misconceptions",
        "body": "**More exponent bits improve precision** — No; more exponent bits extend the RANGE (how large/small the value can be); more mantissa bits improve PRECISION (significant digits). They trade off in a fixed total width. **Floating point can represent all real numbers exactly** — No; most fractional numbers are approximated due to the finite mantissa."
      }
    }
  ],
  "flashcards": [
    [
      "What are the two parts of a floating point number?",
      "Mantissa and Exponent"
    ],
    [
      "What is the purpose of normalising a floating point number?",
      "To maximize precision by utilizing all available bits, and to provide a single, unique representation for any given number."
    ],
    [
      "How can you identify a normalised positive floating point number in Two's complement?",
      "The mantissa starts with 0.1"
    ],
    [
      "What happens if you allocate more bits to the exponent instead of the mantissa?",
      "The range of numbers increases, but the precision decreases."
    ],
    [
      "What is the formula for relative error?",
      "Relative Error = Absolute Error / Actual Value"
    ],
    [
      "Define 'underflow' in floating point calculations.",
      "When a number is too small (too close to zero) to be represented with the given number of bits."
    ],
    [
      "What is stored in the mantissa and what in the exponent?",
      "The mantissa stores the significant digits (precision); the exponent stores the power of 2 that positions the binary point (range)."
    ],
    [
      "Why can 0.1 not be stored exactly in floating point?",
      "In binary 0.1 is a recurring fraction ($0.0\\overline{0011}$), so it must be truncated to the available mantissa bits, leaving a rounding error."
    ]
  ],
  "quiz": [
    {
      "q": "Which part of a floating point number determines its precision?",
      "opts": [
        "Exponent",
        "Mantissa",
        "Sign bit",
        "Radix point"
      ],
      "ans": 1,
      "why": "The mantissa holds the significant digits, determining precision. The exponent determines the range."
    },
    {
      "q": "A positive normalised Two's complement floating point number always begins with which two bits?",
      "opts": [
        "1.0",
        "0.0",
        "0.1",
        "1.1"
      ],
      "ans": 2,
      "why": "It starts with 0.1. If it started with 0.0, the leading 0 would be wasting a bit of precision."
    },
    {
      "q": "A recorded value is 10.5, but the actual value is 10.0. What is the absolute error?",
      "opts": [
        "0.05",
        "0.5",
        "1.05",
        "5.0"
      ],
      "ans": 1,
      "why": "Absolute error is the difference: |10.0 - 10.5| = 0.5."
    },
    {
      "q": "Why might a loop that adds 0.1 ten times in a program not exactly equal 1.0?",
      "opts": [
        "Because 0.1 cannot be represented exactly in binary floating point.",
        "Because adding floats causes an overflow.",
        "Because of underflow in the mantissa.",
        "Because the computer's CPU is faulty."
      ],
      "ans": 0,
      "why": "Fractions like 1/10 have infinite repeating binary representations, so they are truncated/rounded, leading to floating point errors."
    },
    {
      "q": "Keeping total bit-width fixed, increasing the number of mantissa bits will...?",
      "opts": [
        "increase range",
        "increase precision",
        "reduce both",
        "have no effect"
      ],
      "ans": 1,
      "why": "More mantissa bits give more significant digits (higher precision), but leave fewer exponent bits, so range falls."
    }
  ],
  "exam": [
    {
      "q": "Explain the trade-off between range and precision when allocating bits between the mantissa and exponent of a floating point number.",
      "marks": 2,
      "ms": [
        "Increasing the number of bits for the mantissa increases precision but decreases range. (1)",
        "Increasing the number of bits for the exponent increases range but decreases precision. (1)"
      ]
    },
    {
      "q": "A recorded value is 9.8 but the actual value is 9.75. Calculate (a) the absolute error and (b) the relative error.",
      "marks": 3,
      "ms": [
        "(a) Absolute error = |9.75 − 9.8| = 0.05. (1)",
        "(b) Relative error = 0.05 / 9.75. (1)",
        "≈ 0.00513 (≈ 0.51%). (1)"
      ]
    },
    {
      "q": "Discuss how floating point representation allows a wide range of values to be stored and the problems this introduces.",
      "marks": 6,
      "ms": [
        "Value = mantissa × 2^exponent. (1)",
        "The exponent gives a very wide range (very large and very small numbers). (1)",
        "The mantissa gives precision (significant digits). (1)",
        "In a fixed width, range and precision trade off against each other. (1)",
        "Many values (e.g. 0.1) cannot be represented exactly, causing rounding errors. (1)",
        "Errors accumulate over repeated calculations and equality comparisons become unreliable, so a tolerance is used. (1)"
      ]
    }
  ]
};

C["compsci:4.5.4.6"] = {
  "notes": [
    {
      "h": "Range and Precision"
    },
    { "callout": { "t": "info", "body": "In floating point systems, the total number of bits is fixed. Allocating more bits to one part always reduces what the other part can contribute." } },
    {
      "callout": {
        "t": "def",
        "h": "The Trade-off",
        "body": [
          {
            "kv": [
              [
                "More mantissa bits",
                "Increases **precision** (more significant digits, smaller rounding errors)."
              ],
              [
                "More exponent bits",
                "Increases **range** (can represent much larger or much smaller numbers)."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "IEEE 754 Single Precision (32-bit)",
        "body": "1 sign bit + 8 exponent bits + 23 mantissa bits. Gives range ≈ ±3.4 × 10³⁸ with ~7 significant decimal digits of precision."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Memory Aid",
        "body": "**Exponent = Extent** (how far the number stretches). **Mantissa = Magnitude detail** (how accurate the digits are). More exponent → more extent; more mantissa → more detail."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Precision Is Not the Same as Range",
        "body": "A number can be very large in range but imprecise (large gaps between representable values). For example, with a tiny mantissa, even numbers close to 1 may be rounded significantly."
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Bit allocation trade-off with 16 total bits.",
        "src": "# Option A: 12-bit mantissa, 4-bit exponent\n#   Precision: high (~4 decimal digits)\n#   Range: low (exponent range = 2^4 = 16)\n\n# Option B: 8-bit mantissa, 8-bit exponent\n#   Precision: low (~2 decimal digits)\n#   Range: high (exponent range = 2^8 = 256)"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Precision vs Range Trade-off",
        "body": "In a fixed total bit-width, mantissa bits and exponent bits trade off: **more mantissa bits = more precision** (more significant digits, fewer rounding errors); **more exponent bits = greater range** (can represent very large or very small values). Example: 16-bit total — 12-bit mantissa gives high precision; 4-bit exponent gives limited range."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Range and Precision Confusion",
        "body": "**Increasing exponent bits makes the number more accurate** — No; more exponent bits increase the RANGE of representable values but REDUCE precision because fewer bits remain for the mantissa. Accuracy (precision) depends on mantissa length. **A larger floating point number is stored more accurately** — Precision depends on the mantissa, not the magnitude of the value."
      }
    }
  ],
  "flashcards": [
    [
      "What happens if you increase the size of the mantissa in a fixed-width floating point number?",
      "Precision increases (more significant digits), but range decreases (fewer exponent bits)."
    ],
    [
      "What aspect of a floating point number does the exponent control?",
      "The range — how large or small the number can be."
    ],
    [
      "In IEEE 754 single precision (32-bit), how many bits are used for the mantissa?",
      "23 bits (plus 1 sign bit + 8 exponent bits)."
    ],
    [
      "In a fixed-width float, what is the cost of adding more exponent bits?",
      "Range increases, but precision decreases because fewer bits remain for the mantissa."
    ],
    [
      "Define precision in a floating point context.",
      "The number of significant digits a value can be stored to — governed by the mantissa length."
    ],
    [
      "Define range in a floating point context.",
      "How large or small a value can be — governed by the number of exponent bits."
    ],
    [
      "Why does a tiny mantissa cause large gaps between representable numbers?",
      "Few significant digits mean values round to the nearest representable point, and those points are spaced further apart."
    ],
    [
      "Memory aid for which part does what?",
      "Exponent = Extent (how far it reaches / range); Mantissa = detail (how accurate / precision)."
    ]
  ],
  "quiz": [
    {
      "q": "Which part of a floating point number determines its range?",
      "opts": [
        "Mantissa",
        "Exponent",
        "Sign bit",
        "Radix"
      ],
      "ans": 1,
      "why": "The exponent determines the power of 2, which controls how large or small the number can be."
    },
    {
      "q": "A programmer needs to store very precise measurements but does not need large numbers. How should they allocate bits in a custom floating point format?",
      "opts": [
        "More bits to the exponent",
        "More bits to the mantissa",
        "Equal bits to both",
        "Remove the exponent entirely"
      ],
      "ans": 1,
      "why": "More mantissa bits increase precision (more significant digits), which is what the programmer needs."
    },
    {
      "q": "Which change increases the range of a fixed-width float?",
      "opts": [
        "more mantissa bits",
        "more exponent bits",
        "fewer total bits",
        "normalising it"
      ],
      "ans": 1,
      "why": "The exponent controls range; more exponent bits widen it (at the cost of precision)."
    },
    {
      "q": "A 16-bit float with a 12-bit mantissa and 4-bit exponent, compared with an 8/8 split, has...?",
      "opts": [
        "more range, less precision",
        "more precision, less range",
        "both more",
        "both less"
      ],
      "ans": 1,
      "why": "More mantissa bits = more precision; fewer exponent bits = less range."
    },
    {
      "q": "Precision in floating point is determined by...?",
      "opts": [
        "the exponent",
        "the sign bit",
        "the mantissa",
        "the radix"
      ],
      "ans": 2,
      "why": "The mantissa holds the significant digits, so its length sets the precision."
    }
  ],
  "exam": [
    {
      "q": "A system uses 32 bits for floating point. Explain the effect of moving 4 bits from the mantissa to the exponent.",
      "marks": 2,
      "ms": [
        "The range of numbers that can be represented increases (1)",
        "The precision of the numbers decreases (1)"
      ]
    },
    {
      "q": "A custom 16-bit float uses 10 mantissa bits and 6 exponent bits. The designer moves 2 bits from the exponent to the mantissa. State the effect on (a) range (b) precision, and (c) one application this suits.",
      "marks": 3,
      "ms": [
        "(a) Range decreases (fewer exponent bits). (1)",
        "(b) Precision increases (more mantissa bits). (1)",
        "(c) Suits an application needing accurate values over a small range, e.g. precise sensor measurements. (1)"
      ]
    },
    {
      "q": "Discuss the trade-off between range and precision in floating point representation and how a programmer should decide the bit allocation.",
      "marks": 6,
      "ms": [
        "Total bit width is fixed, so mantissa and exponent bits compete. (1)",
        "More mantissa bits give higher precision (more significant digits). (1)",
        "More exponent bits give greater range (larger/smaller magnitudes). (1)",
        "Increasing one necessarily reduces the other. (1)",
        "Choice depends on the data: scientific work with huge/tiny values needs range; measurement/financial work needs precision. (1)",
        "IEEE 754 single precision (8 exponent, 23 mantissa) is a general-purpose compromise; double precision raises both at higher memory cost. (1)"
      ]
    }
  ]
};

C["compsci:4.5.4.7"] = {
  "notes": [
    {
      "h": "Normalisation"
    },
    { "callout": { "t": "info", "body": "Normalisation is the process of adjusting a floating point number so the mantissa uses all its bits as efficiently as possible, removing redundant leading bits." } },
    {
      "callout": {
        "t": "def",
        "h": "What Is Normalisation?",
        "body": "Shifting the mantissa so its most significant bit holds the first meaningful digit — maximising precision and ensuring a unique representation for every value."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Normalised Mantissa Patterns (Two's Complement)",
        "body": [
          {
            "kv": [
              [
                "Positive normalised",
                "Starts with **0.1...** (sign bit 0, next bit 1)"
              ],
              [
                "Negative normalised",
                "Starts with **1.0...** (sign bit 1, next bit 0)"
              ],
              [
                "NOT normalised (positive)",
                "Starts with 0.0... (leading zero wastes a bit)"
              ],
              [
                "NOT normalised (negative)",
                "Starts with 1.1... (leading one duplicates sign)"
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "How Shifting Works",
        "body": "Each left shift of the mantissa moves the binary point one place right. To compensate, the exponent must be decremented by 1 so the overall value stays the same."
      }
    },
    {
      "steps": [
        {
          "h": "Check first two bits",
          "m": "If they are 01 (positive) or 10 (negative), the mantissa is already normalised — stop."
        },
        {
          "h": "Shift left",
          "m": "Shift the mantissa left by 1 bit (discard leading redundant bit) and decrement the exponent by 1."
        },
        {
          "h": "Repeat",
          "m": "Check again; keep shifting until the normalised pattern is achieved."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Normalising a positive mantissa step by step.",
        "src": "# Value: mantissa = 0.0011000, exponent = 5\n# Step 1: 0.0110000, exponent = 4  (not normalised: 0.0)\n# Step 2: 0.1100000, exponent = 3  (normalised: 0.1) ✓"
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Normalisation Misconception",
        "body": "**Normalisation changes the value of the number** — No; normalisation adjusts both the mantissa and the exponent simultaneously so the product (mantissa × 2^exponent) remains identical. Only the internal representation changes — the value does not. Its purpose is to maximise precision by eliminating redundant leading bits."
      }
    }
  ],
  "flashcards": [
    [
      "What bits does a normalised negative mantissa start with in Two's complement?",
      "1.0 — sign bit is 1, next bit is 0."
    ],
    [
      "What bits does a normalised positive mantissa start with in Two's complement?",
      "0.1 — sign bit is 0, next bit is 1."
    ],
    [
      "When normalising by shifting left, what must happen to the exponent?",
      "It must be decremented by 1 for each left shift to preserve the number's value."
    ],
    [
      "What is normalisation?",
      "Shifting a floating point mantissa so its most significant bit holds the first meaningful digit, maximising precision and giving a unique representation."
    ],
    [
      "How do you recognise a normalised positive mantissa?",
      "It begins 0.1 (sign bit 0, next bit 1)."
    ],
    [
      "How do you recognise a normalised negative mantissa?",
      "It begins 1.0 (sign bit 1, next bit 0)."
    ],
    [
      "Why does normalisation not change the value?",
      "Each left shift of the mantissa is compensated by decrementing the exponent, so mantissa × 2^exponent stays the same."
    ],
    [
      "What is wrong with a mantissa that starts 0.0 or 1.1?",
      "It has a redundant leading bit that wastes precision — it is not normalised and should be shifted."
    ]
  ],
  "quiz": [
    {
      "q": "Why do we normalise floating point numbers?",
      "opts": [
        "To make them smaller",
        "To provide maximum precision",
        "To make them easier to add",
        "To save energy"
      ],
      "ans": 1,
      "why": "Normalisation ensures all mantissa bits hold meaningful data — no wasted leading bits."
    },
    {
      "q": "Which mantissa is correctly normalised for a NEGATIVE Two's complement floating point number?",
      "opts": [
        "0.1101",
        "1.0110",
        "1.1010",
        "0.0110"
      ],
      "ans": 1,
      "why": "Negative normalised mantissa starts with 1.0. 1.1 is not normalised (redundant sign bit)."
    },
    {
      "q": "To normalise the positive mantissa 0.0010110 until it starts 0.1, how many left shifts are needed and what happens to the exponent?",
      "opts": [
        "2 shifts, exponent −2",
        "2 shifts, exponent +2",
        "1 shift, exponent −1",
        "3 shifts, exponent −3"
      ],
      "ans": 0,
      "why": "0.0010110 → 0.0101100 → 0.1011000 takes 2 left shifts, so the exponent is decremented by 2."
    },
    {
      "q": "Which mantissa is already normalised (positive)?",
      "opts": [
        "0.0110",
        "0.1011",
        "0.0011",
        "1.1010"
      ],
      "ans": 1,
      "why": "A normalised positive mantissa begins 0.1."
    },
    {
      "q": "What is the main purpose of normalisation?",
      "opts": [
        "reduce file size",
        "maximise precision",
        "increase range",
        "speed up addition"
      ],
      "ans": 1,
      "why": "It uses all mantissa bits for meaningful digits, maximising precision."
    }
  ],
  "exam": [
    {
      "q": "Normalise the following 8-bit mantissa: 0.0001011. Show your working and state the change to the exponent.",
      "marks": 3,
      "ms": [
        "Shift left 3 times to get 0.1011000 (1)",
        "Decrement exponent by 3 (1)",
        "Final result is normalised as it starts with 0.1 (1)"
      ]
    },
    {
      "q": "State the two-bit patterns that begin a correctly normalised mantissa for (a) a positive number (b) a negative number in two's complement.",
      "marks": 2,
      "ms": [
        "(a) 0.1 (1)",
        "(b) 1.0 (1)"
      ]
    },
    {
      "q": "Discuss why floating point numbers are normalised and how the process is carried out without changing the value represented.",
      "marks": 6,
      "ms": [
        "Normalisation maximises precision by removing redundant leading bits. (1)",
        "It gives each value a single, unique representation. (1)",
        "A positive normalised mantissa starts 0.1; a negative one starts 1.0. (1)",
        "The mantissa is shifted left until this pattern is reached. (1)",
        "For each left shift the exponent is decremented by 1. (1)",
        "Because mantissa × 2^exponent is unchanged by the simultaneous shift and exponent adjustment, the value stays the same. (1)"
      ]
    }
  ]
};

C["compsci:4.5.4.8"] = {
  "notes": [
    {
      "h": "Underflow and Overflow"
    },
    { "callout": { "t": "info", "body": "Both overflow and underflow are errors that occur when the exponent field cannot accommodate the required value." } },
    {
      "callout": {
        "t": "def",
        "h": "Overflow",
        "body": "The result of a calculation is **too large** — the exponent required exceeds the maximum value the exponent field can store. Often results in ±∞ in IEEE 754."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Underflow",
        "body": "The result is **too small (too close to zero)** — the negative exponent required exceeds what the exponent field can store. The value collapses to 0, losing all precision."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Which Causes Which?",
        "body": "**Multiplying very large numbers** → overflow. **Dividing a small number by a large number** (or multiplying two very small numbers) → underflow."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Overflow Means the Bits Don't Fit?",
        "body": "Floating point overflow is about the **exponent** exceeding its range, not the mantissa. A number can be very precisely represented but still overflow if it is simply too large."
      }
    },
    {
      "table": {
        "head": ["Error", "Cause", "Typical Result"],
        "rows": [
          ["Overflow", "Exponent too large (positive)", "±∞ or error flag"],
          ["Underflow", "Exponent too large (negative, i.e., too close to 0)", "0 or denormalised number"]
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Detecting overflow in C#.",
        "src": "double large = double.MaxValue * 2;\nif (double.IsInfinity(large))\n    Console.WriteLine(\"Overflow — result is infinity!\");\n\ndouble tiny = double.Epsilon / 2;\nif (tiny == 0.0)\n    Console.WriteLine(\"Underflow — result collapsed to zero!\");"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Underflow vs Overflow",
        "body": "**Overflow**: number too LARGE (exponent exceeds maximum positive range) → result stored as ±∞ or error flag. **Underflow**: number too SMALL (too close to zero — exponent exceeds maximum negative range) → collapses to 0 or a denormalised value. Both are limits of the exponent's range, not the mantissa's precision."
      }
    }
  ],
  "flashcards": [
    [
      "What is floating point underflow?",
      "When a result is too close to zero — the negative exponent required exceeds the exponent field's capacity, so the value collapses to 0."
    ],
    [
      "What is floating point overflow?",
      "When a result is too large — the exponent required exceeds the maximum the exponent field can hold, often producing ±∞."
    ],
    [
      "What arithmetic typically causes underflow?",
      "Dividing a small number by a very large number, or multiplying two very small numbers."
    ],
    [
      "Is floating point overflow about the mantissa or the exponent?",
      "The exponent — overflow happens when the exponent needed exceeds the maximum the exponent field can store."
    ],
    [
      "What value is typically produced by IEEE 754 overflow?",
      "±∞ (infinity), or an error flag."
    ],
    [
      "What happens to a value during underflow?",
      "It collapses to 0 (or a denormalised value), losing all precision."
    ],
    [
      "What arithmetic typically causes overflow?",
      "Multiplying two very large numbers, or adding two large numbers."
    ],
    [
      "Why is underflow described as 'too close to zero'?",
      "The magnitude is so small that the required negative exponent is beyond the exponent field's range, so it cannot be represented."
    ]
  ],
  "quiz": [
    {
      "q": "Which error occurs if you divide a very small number by a very large number?",
      "opts": [
        "Overflow",
        "Underflow",
        "Syntax Error",
        "Logic Error"
      ],
      "ans": 1,
      "why": "The result becomes so small the exponent cannot represent it — it collapses to zero (underflow)."
    },
    {
      "q": "In IEEE 754, what is a common result when floating point overflow occurs?",
      "opts": [
        "The value wraps to the minimum",
        "A syntax error is raised",
        "The result becomes ±infinity",
        "The exponent is set to zero"
      ],
      "ans": 2,
      "why": "IEEE 754 defines ±∞ as the result of overflow — the calculation continues rather than crashing."
    },
    {
      "q": "Multiplying two very large floating point numbers most likely causes...?",
      "opts": [
        "underflow",
        "overflow",
        "a rounding error only",
        "normalisation"
      ],
      "ans": 1,
      "why": "The product's exponent exceeds the maximum, causing overflow."
    },
    {
      "q": "Floating point overflow is caused by a limit on which field?",
      "opts": [
        "mantissa",
        "sign bit",
        "exponent",
        "radix"
      ],
      "ans": 2,
      "why": "Overflow is the exponent exceeding its maximum range."
    },
    {
      "q": "Which statement is true?",
      "opts": [
        "Overflow rounds to the nearest value",
        "Underflow produces ±∞",
        "Underflow collapses a value to 0",
        "Overflow only affects integers"
      ],
      "ans": 2,
      "why": "Underflow makes a too-small value become 0 (or denormalised)."
    }
  ],
  "exam": [
    {
      "q": "Explain how an overflow might occur during floating point addition.",
      "marks": 2,
      "ms": [
        "If two large positive numbers are added (1)",
        "The resulting exponent might exceed the maximum value that can be stored in the exponent field (1)"
      ]
    },
    {
      "q": "Explain the difference between floating point overflow and underflow, giving the typical result of each.",
      "marks": 3,
      "ms": [
        "Overflow: value too large — the exponent exceeds the maximum positive range; result ±∞ / error flag. (1)",
        "Underflow: value too small (near zero) — the exponent exceeds the maximum negative range. (1)",
        "Result of underflow: the value collapses to 0 (or a denormalised value). (1)"
      ]
    },
    {
      "q": "Discuss the causes and consequences of overflow and underflow in floating point arithmetic, and how systems respond to them.",
      "marks": 6,
      "ms": [
        "Both arise from the limited range of the exponent field. (1)",
        "Overflow: magnitude too large (e.g. multiplying large numbers). (1)",
        "Underflow: magnitude too small / too close to zero (e.g. dividing small by large). (1)",
        "IEEE 754 represents overflow as ±∞ so computation can continue. (1)",
        "Underflow collapses to 0 (or a denormalised number), losing precision. (1)",
        "Consequences are incorrect results / loss of accuracy; systems may raise flags or use larger types (double) to reduce the risk. (1)"
      ]
    }
  ]
};

C["compsci:4.5.4.9"] = {
  "notes": [
    {
      "h": "Rounding Errors"
    },
    { "callout": { "t": "info", "body": "Rounding errors occur because many decimal fractions cannot be represented exactly in binary — the mantissa must be truncated to finite bits, leaving a tiny error." } },
    {
      "callout": {
        "t": "def",
        "h": "Absolute Error",
        "body": "$|\\text{Actual Value} - \\text{Recorded Value}|$ — the raw magnitude of the difference."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Relative Error",
        "body": "$\\dfrac{\\text{Absolute Error}}{\\text{Actual Value}}$ — expresses the error as a proportion of the true value. More meaningful for comparing errors across different scales."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Absolute vs Relative — Which Matters?",
        "body": "An absolute error of 0.001 is tiny when the value is 1,000,000 (relative error ≈ 0.000001%), but huge when the value is 0.001 (relative error = 100%). Always consider scale."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "\"0.1 + 0.2 = 0.3\"",
        "body": "In binary floating point, 0.1 is a recurring fraction ($0.0\\overline{0011}$) and cannot be stored exactly. So $0.1 + 0.2 = 0.30000000000000004$ in most languages. **Never compare floating point for exact equality** — use a small tolerance instead."
      }
    },
    {
      "code": {
        "lang": "javascript",
        "cap": "The classic floating point equality trap.",
        "src": "console.log(0.1 + 0.2);           // 0.30000000000000004\nconsole.log(0.1 + 0.2 === 0.3);   // false!\n\n// Correct approach: use an epsilon tolerance\nconst EPSILON = 1e-10;\nconsole.log(Math.abs((0.1 + 0.2) - 0.3) < EPSILON); // true"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Rounding Errors",
        "body": "Some fractions (e.g. 0.1, 1/3) cannot be represented exactly in binary — they become recurring binary fractions, truncated at the available mantissa bits, producing a rounding error. **Never compare floating point values for exact equality** — always use a tolerance (epsilon). Relative error = |actual − stored| / |actual|."
      }
    }
  ],
  "flashcards": [
    [
      "Why does 0.1 cause a rounding error in binary?",
      "0.1 is a recurring (infinite) fraction in binary ($0.0\\overline{0011}\\ldots$), so it must be truncated, leaving a small error."
    ],
    [
      "What is the formula for absolute error?",
      "$|\\text{Actual Value} - \\text{Recorded Value}|$"
    ],
    [
      "What is the formula for relative error?",
      "$\\dfrac{\\text{Absolute Error}}{\\text{Actual Value}}$"
    ],
    [
      "Why should you avoid comparing floating point values with == in programming?",
      "Rounding errors mean two values that should be equal may differ by a tiny amount, causing the equality check to fail unexpectedly."
    ],
    [
      "What causes rounding error in floating point?",
      "Many decimal fractions are recurring in binary and must be truncated to the finite mantissa, leaving a small difference."
    ],
    [
      "Which is more meaningful across different scales: absolute or relative error?",
      "Relative error — it expresses the error as a proportion of the true value, so it is comparable across magnitudes."
    ],
    [
      "What should you use instead of == to compare two floats?",
      "A tolerance (epsilon): check that $|a - b|$ is less than a small threshold."
    ],
    [
      "Give an example value that cannot be stored exactly in binary.",
      "0.1 (also 0.2 or 1/3) — they are recurring binary fractions."
    ]
  ],
  "quiz": [
    {
      "q": "Which error metric is more meaningful when comparing errors at very different scales?",
      "opts": [
        "Absolute Error",
        "Relative Error",
        "Syntax Error",
        "Underflow"
      ],
      "ans": 1,
      "why": "Relative error expresses the error as a proportion of the actual value, making comparisons fair across different magnitudes."
    },
    {
      "q": "Why does `0.1 + 0.2 != 0.3` in most programming languages?",
      "opts": [
        "It is a bug in the language",
        "0.1 cannot be represented exactly in binary floating point",
        "Addition is not commutative in binary",
        "0.3 is stored as an integer"
      ],
      "ans": 1,
      "why": "0.1 and 0.2 are both recurring fractions in binary, so tiny truncation errors accumulate in the sum."
    },
    {
      "q": "Why is 0.5 stored exactly but 0.1 is not?",
      "opts": [
        "0.5 is smaller",
        "0.5 = 1/2 is an exact power-of-two fraction; 0.1 is recurring in binary",
        "0.1 is negative",
        "floats cannot store 0.1 at all"
      ],
      "ans": 1,
      "why": "1/2 is exactly representable as a binary fraction; 1/10 is recurring and must be truncated."
    },
    {
      "q": "An actual value is 200 and it is stored as 200.5. The relative error is...?",
      "opts": [
        "0.5",
        "0.0025",
        "0.25",
        "2.5"
      ],
      "ans": 1,
      "why": "Absolute error 0.5 ÷ 200 = 0.0025 (0.25%)."
    },
    {
      "q": "Why can repeated floating point additions drift from the expected result?",
      "opts": [
        "the CPU overheats",
        "tiny rounding errors accumulate",
        "integers overflow",
        "the mantissa grows"
      ],
      "ans": 1,
      "why": "Each truncation adds a small error that compounds over many operations."
    }
  ],
  "exam": [
    {
      "q": "Calculate the absolute error if 12.5 is represented as 12.48.",
      "marks": 2,
      "ms": [
        "$|12.5 - 12.48| = 0.02$ (1)",
        "Absolute error is 0.02 (1)"
      ]
    },
    {
      "q": "Explain why floating point numbers should not be tested for exact equality in programs.",
      "marks": 2,
      "ms": [
        "Floating point values have rounding errors due to limited binary precision (1)",
        "Two values that should mathematically be equal may differ slightly, causing == to return false (1)"
      ]
    },
    {
      "q": "Discuss why rounding errors occur in floating point arithmetic and the problems they can cause for programmers, with one way to manage them.",
      "marks": 6,
      "ms": [
        "Floating point uses a finite mantissa. (1)",
        "Many fractions (e.g. 0.1, 1/3) are recurring in binary and must be truncated. (1)",
        "This leaves a small rounding error on storage. (1)",
        "Errors accumulate over repeated calculations. (1)",
        "Exact equality comparisons (==) can fail unexpectedly. (1)",
        "Managed by comparing with a tolerance/epsilon, using higher precision (double), or rearranging calculations to reduce error growth. (1)"
      ]
    }
  ]
};

C["compsci:4.5.5.2"] = {
  "notes": [
    {
      "h": "Characters and Error Checking"
    },
    {
      "callout": {
        "t": "def",
        "h": "Character Standards",
        "body": [
          {
            "kv": [
              [
                "ASCII",
                "A 7-bit character set (128 characters) for English text."
              ],
              [
                "Unicode",
                "A modern standard (16-32 bit) representing all human languages and symbols."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Comparing Character Sets"
    },
    {
      "table": {
        "head": [
          "Feature",
          "ASCII",
          "Unicode (UTF-8/16)"
        ],
        "rows": [
          [
            "Bit Width",
            "7 or 8 bits",
            "16 to 32 bits"
          ],
          [
            "Character Count",
            "128 or 256",
            "Over 1.1 million"
          ],
          [
            "Language Support",
            "English/Western only",
            "Global (incl. Emoji)"
          ],
          [
            "Storage Cost",
            "Low (1 byte)",
            "Higher (2-4 bytes)"
          ]
        ]
      }
    },
    {
      "page": "Error Detection"
    },
    {
      "h": "Error Detection & Correction"
    },
    {
      "callout": {
        "t": "def",
        "h": "Detection Methods",
        "body": [
          {
            "kv": [
              [
                "Parity Bit",
                "An extra bit added to detect single-bit flips."
              ],
              [
                "Majority Voting",
                "Sending each bit multiple times to detect and correct errors."
              ],
              [
                "Checksum",
                "A mathematical value calculated from a data block."
              ],
              [
                "Check Digit",
                "A digit added to verify human data entry (e.g., ISBN)."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "The Parity Check Process"
    },
    {
      "steps": [
        {
          "h": "Count",
          "m": "Count the number of 1-bits in the data byte."
        },
        {
          "h": "Evaluate",
          "m": "Set parity bit so total number of 1s (data + parity) matches the agreed parity (even or odd).",
          "n": "Even parity: total 1s must be even. Odd parity: total must be odd."
        },
        {
          "h": "Transmit",
          "m": "Append the parity bit and send the data byte + parity bit together."
        },
        {
          "h": "Verify",
          "m": "Receiver counts 1s in the received data + parity bit; if total doesn't match the agreed parity, an error is flagged.",
          "n": "Limitation: parity can only detect an odd number of bit flips — two simultaneous errors cancel out."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Simple parity generator",
        "src": "count = countOnes(data)\nIF mode == EVEN THEN\n  parity = (count MOD 2 != 0)\nELSE\n  parity = (count MOD 2 == 0)\nENDIF"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Character Encoding & Parity",
        "body": "Characters are stored as binary using character sets. **7-bit ASCII**: 128 characters (English letters, digits, punctuation, control codes). **8-bit extended ASCII**: 256. **Unicode (UTF-8/UTF-16)**: millions of code points, covers all world languages. **Parity bit**: extra bit added so total 1s are even (even parity) or odd (odd parity) — allows detection of a single flipped bit."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "ASCII and Parity Misconceptions",
        "body": "**ASCII can represent all characters used worldwide** — No; standard 7-bit ASCII covers only 128 characters (primarily English). Unicode (UTF-8) was created specifically to represent all world scripts. **A parity bit can correct errors** — A single parity bit can only DETECT a single-bit error (it tells you something is wrong) but cannot identify which bit flipped or correct it."
      }
    }
  ],
  "flashcards": [
    [
      "How many characters can standard 7-bit ASCII represent?",
      "128 ($2^7$)"
    ],
    [
      "Why is Unicode preferred over ASCII in modern systems?",
      "It uses more bits, allowing it to represent characters from multiple languages and global symbols/emojis."
    ],
    [
      "What is a parity bit?",
      "An additional bit attached to binary data to make the total number of 1s either even or odd, used to detect single-bit errors."
    ],
    [
      "How does majority voting correct errors?",
      "Each bit is transmitted multiple times. If an error occurs, the receiver assumes the bit that appears most frequently in the block is the correct one."
    ],
    [
      "What type of error is a check digit primarily designed to catch?",
      "Human data entry errors, such as mistyping a digit or transposing two digits in a barcode or ID number."
    ],
    [
      "How many characters can 8-bit extended ASCII represent?",
      "256 ($2^8$)."
    ],
    [
      "What is a checksum?",
      "A value calculated from a block of data and sent with it; the receiver recalculates and compares to detect errors."
    ],
    [
      "Can a single parity bit correct an error?",
      "No — it can only detect a single-bit (odd number of) error; it cannot identify which bit flipped."
    ]
  ],
  "quiz": [
    {
      "q": "If a system uses EVEN parity, what should the parity bit be for the data 1011001?",
      "opts": [
        "0",
        "1",
        "It could be either",
        "None"
      ],
      "ans": 0,
      "why": "There are four 1s in 1011001 (an even number). So, an even parity bit would be 0 to keep the total even."
    },
    {
      "q": "Which error checking method can CORRECT an error without asking for a retransmission?",
      "opts": [
        "Parity Bit",
        "Checksum",
        "Majority Voting",
        "Check Digit"
      ],
      "ans": 2,
      "why": "Majority voting allows the receiver to deduce the original data if a minority of identical bits flip, effectively correcting the error locally."
    },
    {
      "q": "What is a major disadvantage of majority voting (e.g., sending every bit 3 times)?",
      "opts": [
        "It cannot detect single bit errors",
        "It increases the volume of data transmitted and slows down throughput",
        "It requires complex mathematics to calculate",
        "It is only compatible with ASCII"
      ],
      "ans": 1,
      "why": "Sending each bit multiple times drastically increases bandwidth usage."
    },
    {
      "q": "ASCII value for 'A' is 65. What is the value for 'C'?",
      "opts": [
        "66",
        "67",
        "68",
        "97"
      ],
      "ans": 1,
      "why": "Character sets are sequential. B=66, C=67."
    },
    {
      "q": "Using ODD parity, what parity bit is needed for the data 1100100 (three 1s)?",
      "opts": [
        "0",
        "1",
        "either",
        "none"
      ],
      "ans": 0,
      "why": "Three 1s is already odd, so the parity bit is 0 to keep the total odd."
    }
  ],
  "exam": [
    {
      "q": "Describe how a checksum works for error detection in data transmission.",
      "marks": 3,
      "ms": [
        "A calculation is performed on the data block before transmission to generate a value (the checksum). (1)",
        "The checksum is transmitted along with the data. (1)",
        "The receiver performs the same calculation on the received data and compares the result to the received checksum; if they differ, an error occurred. (1)"
      ]
    },
    {
      "q": "Explain one limitation of using a single parity bit for error detection.",
      "marks": 2,
      "ms": [
        "It only detects an odd number of bit errors. (1)",
        "If two bits flip the parity is unchanged, so the error goes undetected (and it cannot correct errors). (1)"
      ]
    },
    {
      "q": "Compare parity bits, checksums and majority voting as methods of handling transmission errors.",
      "marks": 6,
      "ms": [
        "Parity bit: one extra bit making total 1s even/odd; detects a single-bit error only and cannot correct. (1)",
        "Low overhead but weak. (1)",
        "Checksum: a value computed from the whole data block, recalculated by the receiver. (1)",
        "Detects many errors but some cancel out; still cannot correct. (1)",
        "Majority voting: each bit sent multiple times; receiver takes the most common value. (1)",
        "Can correct errors but greatly increases data volume / reduces throughput. (1)"
      ]
    }
  ]
};

C["compsci:4.5.5.1"] = {
  "notes": [
    {
      "h": "Character Sets: ASCII"
    },
    { "callout": { "t": "info", "body": "ASCII (American Standard Code for Information Interchange) was the original standard for encoding characters as binary numbers." } },
    {
      "callout": {
        "t": "def",
        "h": "ASCII",
        "body": "A 7-bit character encoding standard representing 128 characters: control codes (0–31), digits (48–57), uppercase letters (65–90), lowercase letters (97–122), and punctuation."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Key ASCII Values to Remember",
        "body": [
          {
            "kv": [
              ["'0' (digit zero)", "48"],
              ["'A' (uppercase)", "65"],
              ["'a' (lowercase)", "97"],
              ["Difference A→a", "+32 (just flip bit 5)"]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Arithmetic on Character Codes",
        "body": "Because letters are sequential, 'B' = 66 = 'A' + 1, 'C' = 67, etc. Knowing 'A' = 65 and 'a' = 97 lets you work out any letter's code instantly."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "ASCII's Limitation",
        "body": "Standard 7-bit ASCII only covers English and basic punctuation. For any language outside the Latin alphabet (Arabic, Chinese, Japanese, emojis…) Unicode is required."
      }
    },
    {
      "code": {
        "lang": "python",
        "cap": "Working with ASCII codes.",
        "src": "print(ord('A'))       # 65\nprint(chr(66))        # 'B'\nprint(ord('a') - ord('A'))  # 32 (case offset)\nprint(chr(ord('A') + 2))    # 'C'"
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "ASCII Misconceptions",
        "body": "**ASCII codes are the same as the digit they represent** — No; the character '0' has ASCII code 48, '1' = 49, etc. The digit 0 is not ASCII 0. **Uppercase and lowercase letters have the same ASCII code** — No; 'A' = 65 and 'a' = 97; lowercase letters have codes 32 higher than their uppercase counterparts (bit 5 is different)."
      }
    }
  ],
  "flashcards": [
    [
      "How many characters can 7-bit ASCII represent?",
      "128 ($2^7$)"
    ],
    [
      "What is the ASCII code for uppercase 'A'?",
      "65"
    ],
    [
      "What is the ASCII code for lowercase 'a'?",
      "97 — exactly 32 more than 'A' (65)."
    ],
    [
      "What is one major limitation of ASCII?",
      "It can only represent English and basic Latin characters — no support for non-Latin alphabets, emoji, or most world languages."
    ],
    [
      "What is the ASCII code for the digit character '0'?",
      "48 — note this is not the number 0."
    ],
    [
      "How do you convert an uppercase letter to lowercase using its ASCII code?",
      "Add 32 (e.g. 'A' 65 → 'a' 97); equivalently, set bit 5."
    ],
    [
      "What range of ASCII codes are the control characters?",
      "0–31 (non-printing control codes)."
    ],
    [
      "What does ASCII stand for?",
      "American Standard Code for Information Interchange."
    ]
  ],
  "quiz": [
    {
      "q": "What is the ASCII value of 'A'?",
      "opts": [
        "48",
        "65",
        "97",
        "127"
      ],
      "ans": 1,
      "why": "Uppercase A is 65; lowercase a is 97. Digits start at 48 ('0')."
    },
    {
      "q": "What is the ASCII code for the character 'D'?",
      "opts": [
        "65",
        "67",
        "68",
        "70"
      ],
      "ans": 2,
      "why": "A=65, B=66, C=67, D=68. Each letter increments by 1."
    },
    {
      "q": "The ASCII code for 'a' is 97. What is the code for 'c'?",
      "opts": [
        "98",
        "99",
        "100",
        "65"
      ],
      "ans": 1,
      "why": "a=97, b=98, c=99."
    },
    {
      "q": "The character '7' has which ASCII code?",
      "opts": [
        "7",
        "48",
        "55",
        "63"
      ],
      "ans": 2,
      "why": "'0' is 48, so '7' is 48 + 7 = 55."
    },
    {
      "q": "Why does 'a' − 'A' = 32 in ASCII?",
      "opts": [
        "coincidence",
        "lowercase letters are 32 codes above uppercase",
        "ASCII is 32-bit",
        "there are 32 letters"
      ],
      "ans": 1,
      "why": "Lowercase codes are offset 32 above their uppercase equivalents (bit 5 differs)."
    }
  ],
  "exam": [
    {
      "q": "State one disadvantage of using ASCII in a global software application.",
      "marks": 1,
      "ms": [
        "It cannot represent characters from non-Latin languages like Chinese or Arabic (1)"
      ]
    },
    {
      "q": "The ASCII code for 'A' is 65. State the ASCII codes for (a) 'E' (b) 'a'.",
      "marks": 2,
      "ms": [
        "(a) 69 (65 + 4). (1)",
        "(b) 97 (65 + 32). (1)"
      ]
    },
    {
      "q": "Discuss the advantages and limitations of ASCII and explain why Unicode was developed.",
      "marks": 6,
      "ms": [
        "ASCII is compact — 7 bits, 128 characters, one byte per character. (1)",
        "Sequential codes make character arithmetic (sorting, case conversion) easy. (1)",
        "Limitation: only 128 characters, essentially English/Latin. (1)",
        "Cannot represent non-Latin scripts (Arabic, Chinese) or emoji. (1)",
        "Unicode assigns a unique code point to every character in every language. (1)",
        "Encodings like UTF-8 stay backwards-compatible with ASCII while supporting over a million characters, at the cost of more bytes per character. (1)"
      ]
    }
  ]
};

C["compsci:4.5.5.3"] = {
  "notes": [
    {
      "h": "Error Checking and Correction"
    },
    { "callout": { "t": "info", "body": "Various methods are used to detect and sometimes correct errors that occur during data transmission." } },
    {
      "callout": {
        "t": "def",
        "h": "Methods",
        "body": [
          {
            "kv": [
              [
                "Parity Bits",
                "Extra bit to make the count of 1s even or odd."
              ],
              [
                "Checksum",
                "A value calculated from the data and sent with it."
              ],
              [
                "Check Digit",
                "A digit added to the end of a number (like ISBN) to verify it."
              ],
              [
                "Majority Voting",
                "Sending bits multiple times and taking the most common."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Even parity calculation.",
        "src": "FUNCTION calculateParity(byte)\n    count = countOnes(byte)\n    RETURN (count % 2 == 0) ? 0 : 1\nENDFUNCTION"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Error Detection and Correction",
        "body": "**Parity bit**: adds 1 bit so total 1s are even/odd — detects single-bit errors only. **Checksum**: sum of all data bytes sent alongside; receiver recalculates and compares. **CRC** (Cyclic Redundancy Check): polynomial-based — detects burst errors reliably. **Hamming codes**: multiple check bits at power-of-2 positions — can detect AND correct a single-bit error."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Error Checking Misconceptions",
        "body": "**A checksum detects all errors** — No; certain combinations of errors cancel out (e.g. one byte +1, another −1) leaving the checksum unchanged. CRC is more robust. **Error correction means data is never lost** — Error correction (like Hamming) works for single-bit errors per block but fails for multiple errors in the same block; for burst errors, additional techniques (interleaving, ARQ) are needed."
      }
    }
  ],
  "flashcards": [
    [
      "What is a major limitation of a simple parity bit?",
      "It can only detect an odd number of bit flips; if two bits flip, it fails."
    ],
    [
      "What is a parity bit?",
      "An extra bit added to a unit of data so the total number of 1s is even (even parity) or odd (odd parity), used to detect a single-bit error."
    ],
    [
      "How does a checksum detect errors?",
      "A value is computed from the data and sent with it; the receiver recomputes it and flags an error if the two differ."
    ],
    [
      "What is a check digit and where is it used?",
      "A digit derived from the others and appended to a number (e.g. ISBN, barcode) to catch human entry errors like mistyped or transposed digits."
    ],
    [
      "How does majority voting correct errors?",
      "Each bit is sent several times (e.g. 3×); the receiver assumes the most frequent value is correct."
    ],
    [
      "What is one disadvantage of majority voting?",
      "It greatly increases the amount of data transmitted, reducing effective throughput."
    ],
    [
      "What can a Hamming code do that a parity bit cannot?",
      "Detect and correct a single-bit error, by using multiple check bits to locate the flipped bit."
    ],
    [
      "Why is CRC more reliable than a simple checksum?",
      "It uses polynomial division, detecting burst errors that a simple sum might miss."
    ]
  ],
  "quiz": [
    {
      "q": "Which method can actually CORRECT an error without retransmission?",
      "opts": [
        "Checksum",
        "Check Digit",
        "Majority Voting",
        "Parity Bit"
      ],
      "ans": 2,
      "why": "If you send 111 and receive 110, you assume the 0 was an error."
    },
    {
      "q": "Which method is designed to catch human transcription errors?",
      "opts": [
        "parity bit",
        "check digit",
        "majority voting",
        "CRC"
      ],
      "ans": 1,
      "why": "Check digits (e.g. on ISBNs) catch mistyped or transposed digits entered by people."
    },
    {
      "q": "A single parity bit can...?",
      "opts": [
        "correct one error",
        "detect a single-bit error",
        "detect any number of errors",
        "encrypt data"
      ],
      "ans": 1,
      "why": "It detects a single (odd number of) bit error but cannot correct it."
    },
    {
      "q": "Which error-checking method can correct as well as detect?",
      "opts": [
        "checksum",
        "parity bit",
        "Hamming code",
        "check digit"
      ],
      "ans": 2,
      "why": "Hamming codes locate and correct a single-bit error."
    },
    {
      "q": "Why might two bit-flips defeat a parity check?",
      "opts": [
        "they double the data",
        "they cancel out, leaving parity unchanged",
        "parity only works on text",
        "they cause overflow"
      ],
      "ans": 1,
      "why": "Two flips return the count of 1s to the original parity, so the error is undetected."
    }
  ],
  "exam": [
    {
      "q": "Describe how a checksum is used to detect errors in a transmitted file.",
      "marks": 3,
      "ms": [
        "A value is calculated from the file data at the source (1)",
        "This value is sent along with the file (1)",
        "The receiver recalculates the value; if it doesn't match the sent checksum, an error is flagged (1)"
      ]
    },
    {
      "q": "State one advantage and one disadvantage of majority voting for error correction.",
      "marks": 2,
      "ms": [
        "Advantage: it can correct errors without retransmission. (1)",
        "Disadvantage: it multiplies the volume of data sent (e.g. 3×), reducing throughput. (1)"
      ]
    },
    {
      "q": "Discuss the methods available for detecting and correcting errors in data transmission, evaluating their relative strengths.",
      "marks": 6,
      "ms": [
        "Parity bit: simple, low overhead; detects a single-bit error only, cannot correct. (1)",
        "Checksum: computed over a block, recalculated by receiver; detects many errors but some cancel. (1)",
        "Check digit: catches human entry errors (transposition/mistyping) in numbers like ISBNs. (1)",
        "Majority voting: sends each bit multiple times and can correct errors, but at high bandwidth cost. (1)",
        "Hamming codes / CRC: more sophisticated — Hamming corrects single-bit errors; CRC reliably detects burst errors. (1)",
        "Choice trades off overhead, reliability and whether correction (not just detection) is needed. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.6"] = {
  "notes": [
    {
      "h": "Vector versus Bitmapped Graphics"
    },
    {
      "callout": {
        "t": "info",
        "body": "The two ways of storing a 2-D image — a grid of pixels (bitmap) or a list of geometric objects (vector) — have opposite strengths. The right choice depends on the kind of image and how it will be used."
      }
    },
    {
      "h": "Side-by-side comparison"
    },
    {
      "table": {
        "head": [
          "Feature",
          "Bitmapped",
          "Vector"
        ],
        "rows": [
          [
            "Stored as",
            "Grid of pixels, each a colour value",
            "List of geometric objects (lines, curves, fills) with properties"
          ],
          [
            "Scaling",
            "Pixelates / loses quality when enlarged",
            "Re-rendered at any size — no quality loss"
          ],
          [
            "File size",
            "Resolution × colour depth (large for big images)",
            "Number of objects (small for simple art)"
          ],
          [
            "Editing",
            "Edit individual pixels",
            "Move / edit whole objects independently"
          ],
          [
            "Resolution",
            "Resolution-dependent",
            "Resolution-independent"
          ],
          [
            "Best for",
            "Photographs, continuous-tone images",
            "Logos, icons, diagrams, fonts, technical drawings"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Key idea",
        "body": "A bitmap is resolution-dependent — a fixed pixel grid. A vector is resolution-independent — a mathematical description re-rendered for the target device, so it is sharp at any size."
      }
    },
    {
      "page": "Advantages, disadvantages and uses"
    },
    {
      "callout": {
        "t": "info",
        "h": "Advantages of each approach",
        "body": [
          {
            "kv": [
              [
                "Bitmap",
                "Represents photographic detail / continuous tone; easy to capture (camera, scanner); fast to display with no rendering step."
              ],
              [
                "Vector",
                "Scales without quality loss; small files for simple graphics; objects editable independently; resolution-independent."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Disadvantages of each approach",
        "body": [
          {
            "kv": [
              [
                "Bitmap",
                "Pixelates when enlarged; large files at high resolution / colour depth; fixed resolution."
              ],
              [
                "Vector",
                "Poor for photographs / complex scenes; can be large and slow to render for very complex images; needs rendering software."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Choosing the right approach",
        "body": "Ask: is it a photograph or continuous-tone image? Use a **bitmap**. Is it line art — a logo, icon or diagram — that must scale cleanly? Use a **vector**."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Vector vs Bitmap",
        "body": "**Bitmap** = pixels, resolution-dependent, best for photos, size = W × H × depth. **Vector** = objects/maths, resolution-independent, best for logos & diagrams, size = number of objects. Vectors are usually smaller for simple art but can exceed bitmaps for photographic complexity."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconception",
        "body": "**Vectors are always smaller and always better** — only for geometric art. Photographs are far smaller as compressed bitmaps and cannot be represented well by vector geometry."
      }
    }
  ],
  "flashcards": [
    [
      "Why does a bitmap lose quality when enlarged but a vector does not?",
      "A bitmap is a fixed grid of pixels that get stretched (pixelation); a vector is a mathematical description re-rendered at any size."
    ],
    [
      "Which approach is best for photographs, and why?",
      "Bitmapped — it stores the continuously varying colour of every pixel, which geometry cannot describe efficiently."
    ],
    [
      "Which approach is best for a logo printed at many sizes?",
      "Vector — it scales to any size without quality loss and stays a small file."
    ],
    [
      "What does a vector file's size depend on?",
      "The number and complexity of objects, not the display size."
    ],
    [
      "What does a bitmap file's size depend on?",
      "Resolution (width × height) and colour depth."
    ],
    [
      "Give one disadvantage of vector graphics.",
      "They cannot represent photographs / complex continuous-tone images well (and can be large or slow to render for very complex images)."
    ],
    [
      "Give one disadvantage of bitmapped graphics.",
      "They pixelate when scaled up and have large files at high resolution / colour depth."
    ],
    [
      "Is a vector graphic resolution-dependent or independent?",
      "Resolution-independent — it is re-rendered for the target device."
    ]
  ],
  "quiz": [
    {
      "q": "Which is resolution-independent?",
      "opts": [
        "Bitmap",
        "Vector",
        "Both",
        "Neither"
      ],
      "ans": 1,
      "why": "Vectors are recalculated for any resolution; bitmaps have a fixed pixel grid."
    },
    {
      "q": "For a detailed photograph, which is more appropriate?",
      "opts": [
        "Vector",
        "Bitmap",
        "Either is equally good",
        "MIDI"
      ],
      "ans": 1,
      "why": "Photographs have continuous tone best captured by a pixel grid (bitmap)."
    },
    {
      "q": "A simple two-colour company logo is most compactly stored as a...?",
      "opts": [
        "high-resolution bitmap",
        "vector",
        "lossy JPEG",
        "raw image"
      ],
      "ans": 1,
      "why": "A few geometric objects describe the logo compactly and scale perfectly."
    },
    {
      "q": "Enlarging a bitmap to a billboard would...?",
      "opts": [
        "stay sharp",
        "pixelate",
        "become a vector",
        "lose colour depth"
      ],
      "ans": 1,
      "why": "The fixed pixels are stretched, revealing the grid (pixelation)."
    },
    {
      "q": "When can a vector file be LARGER than a bitmap of the same image?",
      "opts": [
        "Never",
        "For a flat two-colour logo",
        "For a complex photographic image with thousands of shapes",
        "For text"
      ],
      "ans": 2,
      "why": "Describing photographic complexity needs huge numbers of objects, exceeding a compressed bitmap."
    }
  ],
  "exam": [
    {
      "q": "State one situation where a bitmap is the better choice and one where a vector is the better choice.",
      "marks": 2,
      "ms": [
        "Bitmap: storing a photograph / continuous-tone image. (1)",
        "Vector: a logo, icon or diagram that must scale to different sizes. (1)"
      ]
    },
    {
      "q": "Explain why a vector graphic stays sharp when scaled but a bitmap does not.",
      "marks": 3,
      "ms": [
        "A vector stores shapes as mathematical descriptions. (1)",
        "These are re-rendered for the target size, so there are no fixed pixels to stretch. (1)",
        "A bitmap is a fixed grid of pixels, which are stretched/duplicated when enlarged, causing pixelation. (1)"
      ]
    },
    {
      "q": "Compare the vector and bitmapped approaches to representing images, and evaluate when each should be used.",
      "marks": 6,
      "ms": [
        "Bitmaps store a grid of pixel colour values; vectors store mathematical descriptions of objects. (1)",
        "Bitmaps are resolution-dependent and pixelate when enlarged; vectors are resolution-independent and scale without loss. (1)",
        "Bitmap file size depends on resolution × colour depth; vector size depends on the number of objects. (1)",
        "Bitmaps suit photographs and continuous-tone images; vectors suit logos, icons, diagrams and fonts. (1)",
        "Vectors are editable per object and usually smaller for simple art, but poor for photographic detail and can be slow to render when complex. (1)",
        "Therefore choose bitmap for photographic content and vector for scalable line art — the nature of the image and its use dictate the choice. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.4"] = {
  "notes": [
    {
      "h": "Bitmapped Graphics"
    },
    { "callout": { "t": "info", "body": "A bitmapped image is a grid of pixels, each storing its own colour value. The quality of the image depends on how many pixels there are (resolution) and how many colours each can represent (colour depth)." } },
    {
      "callout": {
        "t": "def",
        "h": "Pixel",
        "body": "The smallest addressable element in a digital image. Each pixel stores a colour value as a binary number with `colour depth` bits."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Resolution, Colour Depth and Metadata",
        "body": [
          {
            "kv": [
              ["Resolution", "Pixel dimensions, width × height (e.g. 1920 × 1080); also expressed as dots-per-inch (dpi) where a dot is a pixel."],
              ["Size in pixels", "Width in pixels × height in pixels = total pixel count."],
              ["Colour depth", "Number of bits stored per pixel; $n$ bits → $2^n$ available colours (1-bit = 2, 8-bit = 256, 24-bit ≈ 16.7M 'true colour')."],
              ["Metadata", "Data about the image stored in the file header, e.g. width, height, colour depth, date taken — NOT part of the pixel-data size calculation."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Bitmap File Formats",
        "body": [
          {
            "kv": [
              ["BMP", "Uncompressed — exact pixels stored. Large files."],
              ["PNG", "Lossless compression. Supports transparency (alpha channel)."],
              ["JPEG", "Lossy compression. Small files, but detail is permanently discarded."],
              ["GIF", "Limited to 256 colours; supports simple animation."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Scaling Bitmaps",
        "body": "Zooming in on a bitmap reveals individual pixels — this is called **pixelation**. The image becomes blocky because there is no mathematical description of the shapes, only a fixed grid of colour values."
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Uncompressed File Size",
        "body": "$\\text{File size (bits)} = \\text{Width} \\times \\text{Height} \\times \\text{Colour Depth}$"
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Conceptual 2×2 bitmap (1-bit colour).",
        "src": "IMAGE = [\n  [1, 0],   # row 0: white, black\n  [0, 1]    # row 1: black, white\n]  # diagonal line pattern"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Bitmapped Images",
        "body": "A bitmap stores images as a **grid of pixels**, each pixel encoded as a binary value. File size = width × height × colour depth (bits). The file header stores metadata (width, height, colour depth). Bitmaps are **resolution-dependent**: scaling up duplicates pixels → pixelation (jagged edges). Photos are naturally stored as bitmaps."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Bitmap Misconceptions",
        "body": "**Zooming into a bitmap makes it clearer** — No; bitmaps are resolution-dependent. Zooming in enlarges individual pixels, causing visible squares (pixelation). Vector graphics scale without quality loss because they store geometric descriptions. **A larger bitmap file is always a higher quality image** — File size depends on resolution and colour depth; a large file with low colour depth may look worse than a smaller 24-bit file."
      }
    }
  ],
  "flashcards": [
    [
      "What is a pixel?",
      "The smallest unit of a digital bitmapped image, each storing a colour value as a binary number."
    ],
    [
      "What happens when you zoom in too far on a bitmap?",
      "It becomes pixelated — individual square pixels become visible, making the image look blocky."
    ],
    [
      "Name two bitmapped image formats.",
      "Any two of: BMP, PNG, JPEG, GIF."
    ],
    [
      "What is colour depth?",
      "The number of bits used to store each pixel's colour; n bits gives $2^n$ colours."
    ],
    [
      "Why are photographs stored as bitmaps?",
      "They have continuously varying colour across millions of pixels, which a pixel grid captures naturally but geometry cannot."
    ],
    [
      "What is stored in a bitmap file's header?",
      "Metadata such as width, height and colour depth."
    ],
    [
      "Give the formula for uncompressed bitmap file size.",
      "Width × Height × Colour depth (in bits)."
    ],
    [
      "Are bitmaps resolution-dependent or independent?",
      "Resolution-dependent — enlarging them causes pixelation."
    ]
  ],
  "quiz": [
    {
      "q": "Which of these is a bitmapped format?",
      "opts": [
        "SVG",
        "PDF",
        "PNG",
        "EPS"
      ],
      "ans": 2,
      "why": "PNG stores a grid of pixels (bitmapped). SVG and EPS are vector formats; PDF can contain both."
    },
    {
      "q": "Why do bitmapped images pixelate when enlarged?",
      "opts": [
        "The colour depth decreases during scaling",
        "There is no mathematical description — only fixed-size colour values for each pixel",
        "JPEG compression removes data on zoom",
        "The resolution automatically reduces"
      ],
      "ans": 1,
      "why": "Bitmaps store discrete pixel colours, not equations. Enlarging simply stretches existing pixels, revealing the grid."
    },
    {
      "q": "A bitmap is enlarged 4×. What happens?",
      "opts": [
        "it gains detail",
        "it pixelates / looks blocky",
        "the colour depth rises",
        "the file shrinks"
      ],
      "ans": 1,
      "why": "Existing pixels are stretched; no new detail exists, so the grid becomes visible."
    },
    {
      "q": "Which is a lossy bitmap format?",
      "opts": [
        "BMP",
        "PNG",
        "JPEG",
        "raw"
      ],
      "ans": 2,
      "why": "JPEG permanently discards detail to shrink files; BMP/PNG/raw are not lossy."
    },
    {
      "q": "What does each pixel store in a bitmap?",
      "opts": [
        "a geometric shape",
        "a colour value as a binary number",
        "an instruction",
        "a vector"
      ],
      "ans": 1,
      "why": "Each pixel holds a colour value encoded in colour-depth bits."
    }
  ],
  "exam": [
    {
      "q": "State one advantage and one disadvantage of bitmapped graphics.",
      "marks": 2,
      "ms": [
        "Advantage: Can represent complex, photorealistic images with continuous colour variation (1)",
        "Disadvantage: Large file sizes / quality is lost (pixelation) when scaled up (1)"
      ]
    },
    {
      "q": "A 50 × 40 pixel bitmap uses 4-bit colour. Calculate its uncompressed size in bytes.",
      "marks": 3,
      "ms": [
        "50 × 40 = 2000 pixels. (1)",
        "2000 × 4 = 8000 bits. (1)",
        "8000 ÷ 8 = 1000 bytes. (1)"
      ]
    },
    {
      "q": "Discuss the factors that determine the file size and image quality of a bitmapped image, and the consequences of changing them.",
      "marks": 6,
      "ms": [
        "File size = width × height × colour depth (bits). (1)",
        "Resolution (pixel count) affects detail: more pixels = more detail but larger file. (1)",
        "Colour depth affects the number of colours / smoothness of gradients. (1)",
        "Increasing either increases file size. (1)",
        "Bitmaps are resolution-dependent: scaling up causes pixelation. (1)",
        "A balance is needed — enough resolution and colour depth for quality without excessive file size; compression can reduce size further. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.1"] = {
  "notes": [
    {
      "h": "Representing Data with Bit Patterns"
    },
    {
      "callout": {
        "t": "info",
        "body": "At the lowest level a computer stores everything — numbers, text, images, sound, video — as bit patterns (sequences of 0s and 1s). A bit pattern has no inherent meaning; its meaning comes entirely from how the software chooses to interpret it."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Bit pattern",
        "body": "A sequence of binary digits. The same pattern (e.g. 01000001) can represent the integer 65, the character 'A', a greyscale pixel value, or one audio sample — depending on the context in which it is used."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "How different data is encoded",
        "body": [
          {
            "kv": [
              [
                "Numbers",
                "Unsigned or two's-complement binary, or fixed/floating point for fractions."
              ],
              [
                "Text",
                "Each character is mapped to a code (ASCII, Unicode) — itself a binary number."
              ],
              [
                "Images",
                "A grid of pixels (bitmap), each pixel a binary colour value; or geometric objects (vector)."
              ],
              [
                "Sound",
                "Regular amplitude samples of an analogue wave, each quantised to a binary value."
              ],
              [
                "Instructions",
                "Machine-code op-codes and operands are themselves bit patterns held in memory."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Meaning comes from interpretation",
        "body": "A bit pattern is just bits. Whether 01000001 is the number 65, the letter 'A', or a pixel depends on the data type / file format telling the program how to read it. That is why a file opened in the wrong program shows garbage — the bytes are interpreted with the wrong rules."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconception",
        "body": "**A file 'contains' a picture or a song** — No; it contains bit patterns plus a format that tells software how to turn those bits back into pixels or samples. The same bits could be drawn, played, or printed as numbers."
      }
    }
  ],
  "flashcards": [
    [
      "What is stored at the lowest level for all data types?",
      "Bit patterns — sequences of binary digits (0s and 1s)."
    ],
    [
      "Where does the meaning of a bit pattern come from?",
      "From how the software / data type interprets it, not from the bits themselves."
    ],
    [
      "How are images represented as bit patterns?",
      "As a grid of pixels (bitmap), each pixel a binary colour value, or as geometric objects (vector)."
    ],
    [
      "How is sound represented as bit patterns?",
      "As regular amplitude samples of an analogue wave, each quantised to a binary value."
    ],
    [
      "How is text represented as bit patterns?",
      "Each character is mapped to a binary code using a character set such as ASCII or Unicode."
    ],
    [
      "Can the same bit pattern mean different things?",
      "Yes — e.g. 01000001 could be the integer 65, the character 'A', or a pixel value, depending on context."
    ],
    [
      "Why does a file opened in the wrong program show garbage?",
      "Its bytes are interpreted using the wrong format rules."
    ],
    [
      "Name three kinds of data represented by bit patterns.",
      "Any three of: numbers, text, images, sound, video, machine-code instructions."
    ]
  ],
  "quiz": [
    {
      "q": "What determines what a given bit pattern represents?",
      "opts": [
        "The pattern always means a number",
        "The way the software interprets it (its data type / format)",
        "The length of the pattern only",
        "The colour of the pixels"
      ],
      "ans": 1,
      "why": "Bits carry no inherent meaning; the interpretation rules give them meaning."
    },
    {
      "q": "An image stored as a grid of pixels with binary colour values is a...?",
      "opts": [
        "vector graphic",
        "bitmap",
        "MIDI file",
        "text file"
      ],
      "ans": 1,
      "why": "A grid of pixels each holding a binary colour value is a bitmapped image."
    },
    {
      "q": "Sound is represented digitally by...?",
      "opts": [
        "storing geometric shapes",
        "sampling the amplitude of the wave at intervals",
        "listing musical instructions only",
        "storing one bit per second"
      ],
      "ans": 1,
      "why": "Digital sound samples the analogue wave's amplitude at regular intervals and stores each as binary."
    },
    {
      "q": "The pattern 01000001 could represent...?",
      "opts": [
        "only the number 65",
        "only the letter A",
        "the number 65, the letter A or a pixel value depending on context",
        "nothing meaningful"
      ],
      "ans": 2,
      "why": "The same bits can be interpreted many ways depending on the data type / format."
    },
    {
      "q": "Which statement is TRUE?",
      "opts": [
        "Files store pictures directly",
        "Bit patterns have a fixed meaning",
        "Meaning depends on interpretation",
        "Text cannot be stored in binary"
      ],
      "ans": 2,
      "why": "Meaning is assigned by the interpreting software / format."
    }
  ],
  "exam": [
    {
      "q": "State what is meant by a 'bit pattern'.",
      "marks": 1,
      "ms": [
        "A sequence of binary digits (0s and 1s). (1)"
      ]
    },
    {
      "q": "Explain how the same bit pattern can represent different types of data.",
      "marks": 2,
      "ms": [
        "The bits themselves have no inherent meaning. (1)",
        "The data type / file format tells the software how to interpret them, e.g. as a number, character or pixel. (1)"
      ]
    },
    {
      "q": "Describe how bit patterns can be used to represent (a) an image and (b) sound.",
      "marks": 6,
      "ms": [
        "Image — a bitmap is a grid of pixels. (1)",
        "Each pixel stores a binary colour value; colour depth = bits per pixel. (1)",
        "Alternatively a vector image stores geometric objects as numbers. (1)",
        "Sound — the analogue wave's amplitude is sampled at regular intervals. (1)",
        "Each sample is quantised to the nearest binary value (sample resolution). (1)",
        "The stored sequence of samples (or the pixel grid) is just bit patterns that software interprets to reproduce the image / sound. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.5"] = {
  "notes": [
    {
      "h": "Vector Graphics"
    },
    { "callout": { "t": "info", "body": "Vector graphics store images as mathematical descriptions of shapes — coordinates, colours, and properties — rather than a grid of pixel colours." } },
    {
      "callout": {
        "t": "def",
        "h": "Vector Graphics",
        "body": "Images defined by geometric primitives (points, lines, curves, fills) and their mathematical properties. File formats: SVG, EPS, PDF, AI."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "What Gets Stored",
        "body": [
          {
            "kv": [
              ["Circle", "Centre coordinates $(x, y)$, radius $r$, fill colour, stroke"],
              ["Rectangle", "Top-left $(x, y)$, width, height, fill, border"],
              ["Path", "List of curve/line commands (Bézier control points)"],
              ["Text", "Font, size, string, position — rendered at display time"]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Infinite Scalability",
        "body": "Because shapes are re-calculated mathematically at render time, a vector logo looks equally sharp on a business card (3 cm) and a billboard (10 m). There are no pixels to stretch."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "When NOT to Use Vector",
        "body": "Photographs contain millions of subtle colour variations across complex scenes — these cannot be described efficiently with geometric primitives. Use bitmaps for photos, vectors for logos, icons, and diagrams."
      }
    },
    {
      "code": {
        "lang": "xml",
        "cap": "SVG: a red circle stored as a mathematical instruction.",
        "src": "<svg width=\"100\" height=\"100\">\n  <circle cx=\"50\" cy=\"50\" r=\"40\"\n          fill=\"red\" stroke=\"black\" stroke-width=\"2\" />\n</svg>"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Vector Graphics",
        "body": "Vectors store objects as **mathematical descriptions** (coordinates, shapes, colours, transformations) — not pixel grids. Scale to ANY size without pixelation. Ideal for logos, diagrams, icons, and text. Complex shapes take more memory than simple ones (unlike bitmaps where size = fixed per pixel count). SVG uses XML. Vector files are NOT suitable for photographs."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Vector Graphics Misconceptions",
        "body": "**Vector graphics are better than bitmaps in all situations** — No; vectors excel at geometric shapes (logos, diagrams) but cannot represent photographs or complex textures realistically. **A vector file is always smaller than a bitmap of the same image** — For complex photographic images, a vector representation may be LARGER than a compressed bitmap because storing thousands of geometric shapes is verbose."
      }
    }
  ],
  "flashcards": [
    [
      "Why are vector graphics good for logos?",
      "They are defined mathematically and can be resized to any scale — from a business card to a billboard — without pixelating."
    ],
    [
      "What is a vector graphic primitive?",
      "A basic geometric shape (circle, rectangle, path) defined by coordinates and properties rather than pixel colours."
    ],
    [
      "Give one advantage and one disadvantage of vector graphics vs bitmaps.",
      "Advantage: infinitely scalable, no quality loss. Disadvantage: unsuitable for photographs (complex real-world scenes can't be described with simple geometry)."
    ],
    [
      "How does a vector graphic store an image?",
      "As mathematical descriptions of shapes — coordinates, dimensions, colours and properties — not a pixel grid."
    ],
    [
      "Name two vector file formats.",
      "Any two of SVG, EPS, PDF, AI."
    ],
    [
      "What is stored to represent a circle in a vector image?",
      "Centre coordinates $(x, y)$, radius, fill colour and stroke."
    ],
    [
      "Does a vector graphic pixelate when enlarged?",
      "No — shapes are recalculated mathematically at any size, so there is no quality loss."
    ],
    [
      "When can a vector file be larger than a bitmap?",
      "For complex photographic images, where describing thousands of shapes is more verbose than a compressed pixel grid."
    ]
  ],
  "quiz": [
    {
      "q": "Which file format is common for vector graphics?",
      "opts": [
        "JPEG",
        "SVG",
        "GIF",
        "BMP"
      ],
      "ans": 1,
      "why": "SVG = Scalable Vector Graphics. The others are all bitmapped formats."
    },
    {
      "q": "Why are vector graphics NOT ideal for storing photographs?",
      "opts": [
        "They do not support colour",
        "Photographs have complex continuous colour variation that cannot be efficiently described with geometric primitives",
        "Vector files are too large for photos",
        "They cannot be displayed on screens"
      ],
      "ans": 1,
      "why": "Photographs contain millions of individually varying pixels — far more efficiently stored as a bitmap than as an enormous list of geometric instructions."
    },
    {
      "q": "Vector graphics are ideal for...?",
      "opts": [
        "photographs",
        "logos and diagrams",
        "film footage",
        "scanned documents"
      ],
      "ans": 1,
      "why": "Geometric shapes (logos, icons, diagrams) are described compactly and scale perfectly."
    },
    {
      "q": "What language does SVG use to describe images?",
      "opts": [
        "JSON",
        "XML",
        "CSV",
        "binary pixels"
      ],
      "ans": 1,
      "why": "SVG (Scalable Vector Graphics) is XML-based."
    },
    {
      "q": "Why does a vector logo look sharp at any size?",
      "opts": [
        "it has very high resolution",
        "shapes are recomputed mathematically at render time",
        "it uses 24-bit colour",
        "it is compressed"
      ],
      "ans": 1,
      "why": "There are no fixed pixels to stretch; geometry is re-rendered for the target size."
    }
  ],
  "exam": [
    {
      "q": "Compare vector and bitmapped graphics in terms of file size for a simple company logo.",
      "marks": 2,
      "ms": [
        "Vector would be smaller: only stores a few mathematical shape descriptions (1)",
        "Bitmap would be larger: must store a colour value for every individual pixel, even for flat colours (1)"
      ]
    },
    {
      "q": "Explain why a vector graphic is more suitable than a bitmap for a company logo that will be printed at many sizes.",
      "marks": 3,
      "ms": [
        "A logo is made of simple geometric shapes describable mathematically. (1)",
        "Vectors scale to any size without pixelation / quality loss. (1)",
        "File size stays small and the same file serves all print sizes. (1)"
      ]
    },
    {
      "q": "Compare vector and bitmapped graphics, discussing when each is the appropriate choice.",
      "marks": 6,
      "ms": [
        "Bitmaps store a grid of pixel colour values; vectors store mathematical shape descriptions. (1)",
        "Bitmaps are resolution-dependent and pixelate when enlarged. (1)",
        "Vectors scale to any size without quality loss. (1)",
        "Bitmaps suit photographs / complex continuous-tone images. (1)",
        "Vectors suit logos, icons, diagrams and text. (1)",
        "File size: vectors are small for simple graphics but can exceed bitmaps for photographic complexity, so the content dictates the choice. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.3"] = {
  "notes": [
    {
      "h": "ADC and DAC"
    },
    { "callout": { "t": "info", "body": "Audio must be converted between analogue waves and digital binary for computers to process it." } },
    {
      "callout": {
        "t": "def",
        "h": "Converters",
        "body": [
          {
            "kv": [
              [
                "ADC",
                "Analogue-to-Digital Converter (used for recording)."
              ],
              [
                "DAC",
                "Digital-to-Analogue Converter (used for playback)."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "The sampling process.",
        "src": "WHILE recording:\n    voltage = measure(microphone)\n    binary = quantize(voltage)\n    store(binary)\nENDWHILE"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "ADC and DAC",
        "body": "**ADC** (Analogue-to-Digital Converter): samples the analogue signal at regular intervals (**sample rate**, Hz), and quantises each sample to a binary value (**bit depth/resolution**). **DAC** (Digital-to-Analogue): reverses the process to recreate the analogue signal. Nyquist theorem: sample rate must be ≥ **2 × highest frequency** in the signal to avoid aliasing."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "ADC/DAC Misconceptions",
        "body": "**A higher sample rate always doubles audio quality** — Quality improves only up to 2× the highest frequency (Nyquist limit); beyond that, extra samples add no audible quality. **Only sample rate matters for audio quality** — Bit depth (resolution) matters equally: more bits per sample = more amplitude levels = less quantisation noise. Both sample rate and bit depth must be adequate."
      }
    }
  ],
  "flashcards": [
    [
      "What does an ADC do?",
      "It converts a continuous analogue signal into discrete digital values."
    ],
    [
      "What does a DAC do?",
      "A Digital-to-Analogue Converter turns digital binary values back into a continuous analogue signal (e.g. for speakers)."
    ],
    [
      "Which converter is used for recording sound?",
      "An ADC (Analogue-to-Digital Converter)."
    ],
    [
      "Which converter is used for playback through speakers?",
      "A DAC (Digital-to-Analogue Converter)."
    ],
    [
      "What is the sample rate?",
      "The number of samples taken per second, measured in Hz."
    ],
    [
      "What is sample resolution (bit depth)?",
      "The number of bits used to store each sample's amplitude — more bits give more amplitude levels and less quantisation noise."
    ],
    [
      "State the Nyquist theorem.",
      "The sample rate must be at least twice the highest frequency in the signal to avoid aliasing."
    ],
    [
      "What is quantisation?",
      "Mapping each sampled amplitude to the nearest available discrete (binary) value."
    ]
  ],
  "quiz": [
    {
      "q": "Which device is used when playing music through speakers?",
      "opts": [
        "ADC",
        "DAC",
        "CPU",
        "GPU"
      ],
      "ans": 1,
      "why": "Speakers need an analogue signal, so we convert the digital file using a DAC."
    },
    {
      "q": "An ADC converts...?",
      "opts": [
        "digital to analogue",
        "analogue to digital",
        "binary to hex",
        "text to binary"
      ],
      "ans": 1,
      "why": "An Analogue-to-Digital Converter samples a continuous signal into binary values."
    },
    {
      "q": "To capture audio up to 20 kHz, the minimum sample rate is...?",
      "opts": [
        "10 kHz",
        "20 kHz",
        "40 kHz",
        "80 kHz"
      ],
      "ans": 2,
      "why": "Nyquist: 2 × 20 kHz = 40 kHz."
    },
    {
      "q": "Increasing sample resolution (bit depth) does what?",
      "opts": [
        "captures higher frequencies",
        "reduces quantisation noise",
        "reduces file size",
        "changes the tempo"
      ],
      "ans": 1,
      "why": "More bits per sample give more amplitude levels, reducing quantisation error/noise."
    },
    {
      "q": "What happens if the sample rate is below the Nyquist limit?",
      "opts": [
        "the file is smaller and perfect",
        "aliasing distortion occurs",
        "nothing",
        "the pitch rises"
      ],
      "ans": 1,
      "why": "Under-sampling causes aliasing — frequencies are misrepresented."
    }
  ],
  "exam": [
    {
      "q": "Explain the role of an ADC in a digital voice recorder.",
      "marks": 2,
      "ms": [
        "It takes the continuous electrical signal from the microphone (1)",
        "And samples it at regular intervals to create a sequence of binary numbers (1)"
      ]
    },
    {
      "q": "State the function of (a) an ADC and (b) a DAC.",
      "marks": 2,
      "ms": [
        "(a) ADC converts a continuous analogue signal into discrete digital/binary values. (1)",
        "(b) DAC converts digital values back into a continuous analogue signal. (1)"
      ]
    },
    {
      "q": "Discuss how an ADC converts an analogue sound wave into a digital file and the factors affecting the quality of the result.",
      "marks": 6,
      "ms": [
        "The continuous analogue signal is sampled — its amplitude measured at regular intervals. (1)",
        "Sample rate (Hz) = samples per second. (1)",
        "By Nyquist, the rate must be ≥ 2× the highest frequency to avoid aliasing. (1)",
        "Each sample is quantised to the nearest binary value. (1)",
        "Sample resolution (bit depth) sets the number of amplitude levels — more bits reduce quantisation error. (1)",
        "Higher sample rate and resolution improve fidelity but increase file size; a DAC reverses the process for playback. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.7"] = {
  "notes": [
    {
      "h": "Sound Sampling"
    },
    { "callout": { "t": "info", "body": "Digital sound is created by sampling the amplitude of an analogue wave at regular intervals." } },
    {
      "callout": {
        "t": "def",
        "h": "Sampling Terms",
        "body": [
          {
            "kv": [
              [
                "Sample Rate",
                "The frequency of samples (e.g. 44,100 Hz)."
              ],
              [
                "Sample Resolution",
                "The number of bits per sample (e.g. 16-bit)."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Audio size calculation.",
        "src": "bits = rate * resolution * seconds * channels"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Audio File Size Formula",
        "body": "**File size (bits) = Sample rate × Bit depth × Duration × Channels**. CD quality: 44.1 kHz, 16-bit, 2 channels (stereo). Higher sample rate + bit depth = better quality, larger file. Nyquist: minimum sample rate = 2 × highest frequency in the signal (e.g. 40 kHz to capture up to 20 kHz audio)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Sound Sampling Misconceptions",
        "body": "**Stereo audio is the same file size as mono** — No; stereo has 2 channels so it is double the file size of mono at the same sample rate and bit depth. **The Nyquist theorem says sample at exactly the highest frequency** — No; you must sample at TWICE the highest frequency. Sampling at the exact frequency would cause aliasing (distortion)."
      }
    }
  ],
  "flashcards": [
    [
      "What is the Nyquist Theorem?",
      "The sample rate must be at least twice the highest frequency in the signal."
    ],
    [
      "What is the sample rate?",
      "The number of amplitude samples taken per second, in Hz (e.g. 44,100 Hz for CD)."
    ],
    [
      "What is sample resolution?",
      "The number of bits per sample; more bits give greater dynamic range / amplitude precision."
    ],
    [
      "Give the audio file size formula.",
      "Size (bits) = sample rate × bit depth × duration × channels."
    ],
    [
      "How does stereo affect file size compared to mono?",
      "Stereo has 2 channels, doubling the size at the same sample rate and bit depth."
    ],
    [
      "What are CD-quality audio settings?",
      "44.1 kHz sample rate, 16-bit resolution, 2 channels (stereo)."
    ],
    [
      "What does increasing the sample rate improve?",
      "It captures higher frequencies (up to half the sample rate), improving accuracy of high-frequency sound."
    ],
    [
      "What does increasing sample resolution improve?",
      "Dynamic range / amplitude precision, reducing quantisation noise."
    ]
  ],
  "quiz": [
    {
      "q": "Increasing the sample resolution does what?",
      "opts": [
        "Increases dynamic range",
        "Decreases file size",
        "Slows down the music",
        "Removes high frequencies"
      ],
      "ans": 0,
      "why": "More bits per sample allow for more precise amplitude measurements."
    },
    {
      "q": "A mono 16-bit track at 44,100 Hz lasting 1 second is how many bits?",
      "opts": [
        "44,100",
        "705,600",
        "1,411,200",
        "16"
      ],
      "ans": 1,
      "why": "44,100 × 16 × 1 × 1 = 705,600 bits."
    },
    {
      "q": "Changing a recording from mono to stereo does what to file size?",
      "opts": [
        "halves it",
        "no change",
        "doubles it",
        "quadruples it"
      ],
      "ans": 2,
      "why": "File size is proportional to channel count, and stereo has 2 channels."
    },
    {
      "q": "The Nyquist theorem requires sampling at...?",
      "opts": [
        "the highest frequency",
        "half the highest frequency",
        "twice the highest frequency",
        "any rate"
      ],
      "ans": 2,
      "why": "Sample rate ≥ 2× the highest frequency avoids aliasing."
    },
    {
      "q": "Higher sample resolution mainly increases...?",
      "opts": [
        "frequency range",
        "dynamic range / amplitude precision",
        "tempo",
        "number of channels"
      ],
      "ans": 1,
      "why": "More bits per sample give finer amplitude steps (greater dynamic range)."
    }
  ],
  "exam": [
    {
      "q": "A 1-minute mono track is recorded at 20kHz with 8-bit resolution. Calculate the size in MB (using 1,000,000 bytes per MB).",
      "marks": 3,
      "ms": [
        "20,000 * 8 * 60 = 9,600,000 bits (1)",
        "9,600,000 / 8 = 1,200,000 bytes (1)",
        "1.2 MB (1)"
      ]
    },
    {
      "q": "State two factors that increase the file size of a digital audio recording.",
      "marks": 2,
      "ms": [
        "Higher sample rate. (1)",
        "Higher sample resolution (bit depth) / more channels / longer duration. (1)"
      ]
    },
    {
      "q": "Discuss how sample rate and sample resolution affect the quality and file size of digital audio, referring to the Nyquist theorem.",
      "marks": 6,
      "ms": [
        "Sample rate = samples per second; a higher rate captures higher frequencies. (1)",
        "Nyquist: the rate must be ≥ 2× the highest frequency to reproduce it without aliasing. (1)",
        "Sample resolution = bits per sample; more bits give finer amplitude detail / dynamic range. (1)",
        "More bits reduce quantisation noise. (1)",
        "File size = rate × resolution × duration × channels, so raising quality raises size. (1)",
        "A balance is chosen, e.g. CD quality 44.1 kHz / 16-bit, to give good fidelity at manageable size. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.2"] = {
  "notes": [
    {
      "h": "Analogue and Digital"
    },
    {
      "callout": {
        "t": "info",
        "body": "Real-world quantities such as sound, light and temperature are analogue; computers store and process data digitally. The difference applies to both data and signals, and explains why conversion (ADC/DAC) is needed."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Analogue",
        "body": "Analogue data and signals are continuous — they can take any value within a range and vary smoothly over time (e.g. a sound wave's air pressure, the brightness from a dimmer switch)."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Digital",
        "body": "Digital data and signals are discrete — they take only a finite set of distinct values, represented in binary (e.g. audio samples stored as whole numbers, a signal that is either high or low)."
      }
    },
    {
      "h": "Data versus signals"
    },
    {
      "table": {
        "head": [
          "Term",
          "Analogue",
          "Digital"
        ],
        "rows": [
          [
            "Data",
            "Continuous — any value in a range",
            "Discrete — a fixed set of values, stored in binary"
          ],
          [
            "Signal",
            "A continuously varying physical quantity (e.g. a voltage mirroring a sound wave)",
            "A signal switching between distinct levels (e.g. 0 V / 5 V for 0 and 1)"
          ],
          [
            "Example",
            "Vinyl record groove, mercury thermometer",
            "Audio CD samples, digital thermometer display"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Why computers are digital",
        "body": "Digital signals resist noise: small interference does not change which discrete level is read, so data can be copied and transmitted without degradation. Analogue signals accumulate noise and distortion with every copy or stage of transmission."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Analogue vs Digital",
        "body": "**Analogue = continuous** (any value, smooth). **Digital = discrete** (finite set, binary). The distinction applies to both data and signals. Computers use digital representation because it resists noise and can be processed and copied perfectly."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconception",
        "body": "**Digital always means higher quality than analogue** — Not inherently; a digital recording only approximates the analogue original, limited by sample rate and resolution. Digital's real advantages are noise resistance and easy, lossless processing/copying — not infinite fidelity."
      }
    }
  ],
  "flashcards": [
    [
      "What does 'analogue' mean?",
      "Continuous — able to take any value within a range and vary smoothly over time."
    ],
    [
      "What does 'digital' mean?",
      "Discrete — taking only a finite set of distinct values, represented in binary."
    ],
    [
      "Give an example of analogue data.",
      "A sound wave, a vinyl groove, a mercury thermometer reading (any continuous quantity)."
    ],
    [
      "Give an example of digital data.",
      "Audio CD samples, a digital thermometer reading (any discrete, binary-stored value)."
    ],
    [
      "What is an analogue signal?",
      "A continuously varying physical quantity, e.g. a voltage that mirrors a sound wave."
    ],
    [
      "What is a digital signal?",
      "A signal that switches between distinct levels, e.g. 0 V / 5 V representing 0 and 1."
    ],
    [
      "Why do computers use digital rather than analogue representation?",
      "Digital resists noise and can be processed and copied without degradation; analogue accumulates noise."
    ],
    [
      "Does digital guarantee higher fidelity than analogue?",
      "No — it only approximates the original, limited by sample rate and resolution; its advantage is noise resistance and easy processing."
    ]
  ],
  "quiz": [
    {
      "q": "Which best describes an analogue signal?",
      "opts": [
        "Switches between two fixed levels",
        "Varies continuously and can take any value",
        "Always stored in binary",
        "Has no noise"
      ],
      "ans": 1,
      "why": "Analogue signals are continuous and can take any value in a range."
    },
    {
      "q": "A digital signal is best described as...?",
      "opts": [
        "continuously varying",
        "taking a finite set of discrete values",
        "always analogue first",
        "immune to all error"
      ],
      "ans": 1,
      "why": "Digital signals are discrete, taking distinct values represented in binary."
    },
    {
      "q": "Why is digital data more robust when copied many times?",
      "opts": [
        "It is smaller",
        "Noise does not change which discrete level is read",
        "It is analogue underneath",
        "It uses more bits"
      ],
      "ans": 1,
      "why": "Discrete levels mean small interference is ignored, so copies do not degrade."
    },
    {
      "q": "Which is an example of an analogue quantity?",
      "opts": [
        "A CD audio sample",
        "The air pressure of a sound wave",
        "A pixel's binary colour value",
        "An ASCII code"
      ],
      "ans": 1,
      "why": "Air pressure varies continuously — it is analogue."
    },
    {
      "q": "Converting analogue to digital is necessary because...?",
      "opts": [
        "computers process discrete binary values",
        "analogue is always higher quality",
        "digital cannot be copied",
        "signals never have noise"
      ],
      "ans": 0,
      "why": "Computers store and process discrete binary data, so analogue input must be digitised."
    }
  ],
  "exam": [
    {
      "q": "State the difference between analogue and digital data.",
      "marks": 2,
      "ms": [
        "Analogue data is continuous — it can take any value in a range. (1)",
        "Digital data is discrete — it takes only a finite set of values, stored in binary. (1)"
      ]
    },
    {
      "q": "Give one example each of an analogue signal and a digital signal.",
      "marks": 2,
      "ms": [
        "Analogue: a continuously varying voltage representing a sound wave (or similar). (1)",
        "Digital: a signal switching between two levels such as 0 V and 5 V representing 0 and 1 (or similar). (1)"
      ]
    },
    {
      "q": "Discuss why computer systems represent data digitally rather than in analogue form, including any limitations of doing so.",
      "marks": 6,
      "ms": [
        "Computers store and process discrete binary values, so data must be digital. (1)",
        "Digital signals are resistant to noise — small interference does not change the discrete level read. (1)",
        "Digital data can be copied and transmitted without degradation/loss. (1)",
        "It can be processed, compressed and error-checked easily. (1)",
        "Limitation: digitising an analogue source only approximates it, limited by sample rate and resolution (quantisation error). (1)",
        "Trade-off: higher sample rate/resolution improve fidelity but increase storage; so digital is chosen for robustness and processing despite not being a perfect copy. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.8"] = {
  "notes": [
    {
      "h": "MIDI vs Sampled Audio"
    },
    { "callout": { "t": "info", "body": "MIDI (Musical Instrument Digital Interface) stores instructions for how to play music, not the sound itself." } },
    {
      "callout": {
        "t": "def",
        "h": "Comparison",
        "body": [
          {
            "kv": [
              [
                "Sampled Audio",
                "Recording of actual sound waves. High fidelity, huge size."
              ],
              [
                "MIDI",
                "List of events (Note On, Pitch, Velocity). Tiny size, depends on hardware synth."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "A MIDI message.",
        "src": "EVENT: NoteOn\nCHANNEL: 1\nKEY: 60 (Middle C)\nVELOCITY: 100"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "MIDI vs Sampled — Key Differences",
        "body": "| Feature | MIDI | Sampled Audio | | File size | Tiny | Large | | Contains audio? | No (events) | Yes (waveform) | | Editable? | Very (change any note) | Hard | | Playback quality | Depends on synth | Fixed at recording | | Use | Composition, playback | Realistic audio |"
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "MIDI vs Sampled Misconceptions",
        "body": "**MIDI sounds exactly the same on all devices** — No; MIDI relies on the synthesizer for playback. Different synthesizers produce different-sounding results from the same MIDI file. Sampled audio always sounds identical regardless of the playback device. **A MIDI file is just a compressed audio file** — No; it contains no audio data at all, only performance instructions."
      }
    }
  ],
  "flashcards": [
    [
      "Does a MIDI file contain audio data?",
      "No, it contains musical instructions."
    ],
    [
      "What does MIDI stand for?",
      "Musical Instrument Digital Interface."
    ],
    [
      "Why might a MIDI file sound different on two devices?",
      "Playback depends on each device's synthesizer, which generates the actual sound from the instructions."
    ],
    [
      "Give two advantages of MIDI over sampled audio.",
      "Much smaller file size, and easy editing of individual notes / instruments."
    ],
    [
      "Give one disadvantage of MIDI compared with sampled audio.",
      "Playback quality/timbre depends on the synthesizer, and it cannot capture real recorded sound such as vocals."
    ],
    [
      "What information is in a MIDI Note On message?",
      "The channel, the key/pitch (e.g. 60 = Middle C) and the velocity (how hard the note is played)."
    ],
    [
      "Does sampled audio sound the same on all devices?",
      "Yes — it stores the actual waveform, so it reproduces identically regardless of playback device."
    ],
    [
      "Which is better for storing a live vocal recording: MIDI or sampled audio?",
      "Sampled audio — MIDI cannot represent real recorded sound, only instrument events."
    ]
  ],
  "quiz": [
    {
      "q": "Why is MIDI useful for web background music in the 90s?",
      "opts": [
        "High quality",
        "Small file size",
        "Vocals",
        "Ease of recording"
      ],
      "ans": 1,
      "why": "MIDI files are thousands of times smaller than MP3s."
    },
    {
      "q": "Which statement about MIDI is true?",
      "opts": [
        "It stores a compressed recording of the audio",
        "It stores instructions for playing notes",
        "It always sounds identical on every device",
        "It is a lossy waveform format"
      ],
      "ans": 1,
      "why": "MIDI holds event instructions (note, timing, velocity), not audio data."
    },
    {
      "q": "Which is hardest to edit at the level of a single note?",
      "opts": [
        "MIDI",
        "sampled audio",
        "both equally easy",
        "neither can be edited"
      ],
      "ans": 1,
      "why": "Sampled audio mixes everything into one waveform; MIDI lets you change individual note events."
    },
    {
      "q": "Why is sampled audio more consistent across devices than MIDI?",
      "opts": [
        "it is smaller",
        "it stores the actual waveform rather than relying on a synthesizer",
        "it uses XML",
        "it cannot be edited"
      ],
      "ans": 1,
      "why": "The waveform is fixed at recording time, so playback does not depend on a synthesizer."
    },
    {
      "q": "A composer wants to easily change the instrument of a whole piece later. Which format suits this?",
      "opts": [
        "sampled audio",
        "MIDI",
        "a JPEG",
        "a checksum"
      ],
      "ans": 1,
      "why": "MIDI events can be reassigned to a different synthesized instrument without re-recording."
    }
  ],
  "exam": [
    {
      "q": "State two advantages of MIDI over sampled audio.",
      "marks": 2,
      "ms": [
        "Significantly smaller file size (1)",
        "Easy to edit individual notes or change instruments (1)"
      ]
    },
    {
      "q": "State one situation where sampled audio is preferable to MIDI.",
      "marks": 2,
      "ms": [
        "When recording real-world sound such as vocals or live instruments. (1)",
        "Because MIDI can only store instrument events / cannot capture a real recorded waveform. (1)"
      ]
    },
    {
      "q": "Discuss the differences between MIDI and sampled audio and evaluate when each should be used.",
      "marks": 6,
      "ms": [
        "MIDI stores musical event instructions; sampled audio stores the digitised waveform. (1)",
        "MIDI files are tiny; sampled audio files are large. (1)",
        "MIDI playback depends on the synthesizer, so it can sound different on different devices. (1)",
        "Sampled audio reproduces exactly what was recorded, consistently. (1)",
        "MIDI is easily edited (notes, tempo, instruments); sampled audio is hard to edit. (1)",
        "Use MIDI for composition/arrangement and small files; use sampled audio for realistic recordings such as vocals. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.9"] = {
  "notes": [
    {
      "h": "Data Compression"
    },
    { "callout": { "t": "info", "body": "Compression is used to reduce file sizes, saving storage space and reducing transmission time." } },
    {
      "h": "Comparing Compression Types"
    },
    {
      "table": {
        "head": [
          "Feature",
          "Lossy Compression",
          "Lossless Compression"
        ],
        "rows": [
          [
            "Data Removal",
            "Permanent removal of data",
            "No data removed"
          ],
          [
            "Reconstruction",
            "Approximate",
            "Perfect / Bit-for-bit"
          ],
          [
            "File Size",
            "Significantly reduced",
            "Moderately reduced"
          ],
          [
            "Best Use",
            "Photos, Video, Music",
            "Text, Code, Executables"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Compression Methods",
        "body": [
          {
            "kv": [
              [
                "Run Length Encoding (RLE)",
                "Replaces runs of data with (Value, Count)."
              ],
              [
                "Dictionary Coding",
                "Replaces repeated patterns with short dictionary tokens."
              ]
            ]
          }
        ]
      }
    },
    {
      "page": "RLE Process"
    },
    {
      "h": "The RLE Process"
    },
    {
      "steps": [
        {
          "h": "Scan",
          "n": "Look for consecutive repeated symbols (e.g., `AAAAA`)."
        },
        {
          "h": "Store",
          "n": "Write the symbol and the count (e.g., `A5`)."
        },
        {
          "h": "Advance",
          "n": "Move to the next new symbol and repeat."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Simple RLE implementation",
        "src": "WHILE not_at_end\n  val = current_char\n  count = countRepeats(val)\n  OUTPUT count + val\nENDWHILE"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Lossy vs Lossless Compression",
        "body": "**Lossy**: permanently removes data to achieve smaller files; original CANNOT be fully restored. Examples: JPEG (images), MP3 (audio), H.264 (video). **Lossless**: reduces file size without losing data; original can be fully restored. Examples: PNG, FLAC, ZIP. **RLE** (Run-Length Encoding): lossless — stores (count, value) pairs instead of repeated values. Best for images with large uniform areas."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Compression Misconceptions",
        "body": "**Lossless compression always produces smaller files than lossy** — No; lossy can achieve far higher compression ratios by permanently discarding data. Lossless is limited by the patterns in the data. **Compressing an image twice with lossless compression degrades quality** — No; lossless by definition preserves all data on every cycle. Lossy compression degrades quality each time it is applied."
      }
    }
  ],
  "flashcards": [
    [
      "What is the difference between lossy and lossless compression?",
      "Lossless perfectly reconstructs the original file, while lossy permanently discards some data to achieve a smaller file size."
    ],
    [
      "Give an example of when you MUST use lossless compression.",
      "When compressing text documents, executable software, or code where changing a single bit breaks it."
    ],
    [
      "How does Run Length Encoding (RLE) work?",
      "It compresses data by replacing continuous sequences of the same value with a count and the value itself (e.g., AAA -> 3A)."
    ],
    [
      "What is dictionary coding?",
      "A compression technique that builds a table of frequently occurring patterns and replaces those patterns in the data with shorter index tokens."
    ],
    [
      "Why is lossy compression acceptable for video and audio?",
      "Human eyes and ears cannot detect minor details or frequencies that are discarded, so the quality drop is often imperceptible."
    ],
    [
      "Why is lossless compression required for executables and text?",
      "Any lost bit would corrupt the program or change the meaning, so the original must be restored exactly."
    ],
    [
      "Give one lossy and one lossless image/audio format.",
      "Lossy: JPEG or MP3. Lossless: PNG or FLAC (or ZIP for general files)."
    ],
    [
      "What kind of data does RLE compress well?",
      "Data with long runs of repeated values, e.g. images with large areas of uniform colour."
    ]
  ],
  "quiz": [
    {
      "q": "Compress 'BBBBBAAA' using simple Run Length Encoding.",
      "opts": [
        "B5A3",
        "5B3A",
        "8BA",
        "BA"
      ],
      "ans": 1,
      "why": "There are five Bs followed by three As, represented as 5B3A."
    },
    {
      "q": "Which compression type is most suitable for an executable program (.exe)?",
      "opts": [
        "Lossy",
        "Lossless",
        "Either",
        "None"
      ],
      "ans": 1,
      "why": "Executables must remain completely structurally intact; any lost data (lossy) would corrupt the code."
    },
    {
      "q": "Which of these file formats primarily uses lossy compression?",
      "opts": [
        "PNG",
        "ZIP",
        "MP3",
        "FLAC"
      ],
      "ans": 2,
      "why": "MP3 removes audio frequencies masked by other sounds to reduce size. PNG, ZIP, and FLAC are lossless."
    },
    {
      "q": "If a text file contains the word 'computer' 50 times, which compression method would be highly effective?",
      "opts": [
        "Run Length Encoding",
        "Dictionary Coding",
        "Lossy audio compression",
        "Parity coding"
      ],
      "ans": 1,
      "why": "Dictionary coding assigns a short token to the word 'computer' and replaces all 50 instances with that token."
    },
    {
      "q": "Applying lossless compression to a file twice...?",
      "opts": [
        "degrades it each time",
        "preserves all data both times",
        "makes it lossy",
        "corrupts it"
      ],
      "ans": 1,
      "why": "Lossless preserves all data on every cycle; only lossy compression degrades quality."
    }
  ],
  "exam": [
    {
      "q": "Explain the principles of dictionary coding.",
      "marks": 3,
      "ms": [
        "The algorithm scans the data for repeated patterns/strings. (1)",
        "It creates a dictionary mapping these strings to shorter reference tokens/indexes. (1)",
        "It replaces the original strings in the data with the shorter tokens, saving space. (1)"
      ]
    },
    {
      "q": "State one situation where lossy compression is acceptable and one where it is not.",
      "marks": 2,
      "ms": [
        "Acceptable: photos/music/video where small detail loss is imperceptible. (1)",
        "Not acceptable: text, code or executables where exact data must be preserved. (1)"
      ]
    },
    {
      "q": "Compare lossy and lossless compression, explaining how run-length encoding and dictionary coding work and when each is appropriate.",
      "marks": 6,
      "ms": [
        "Lossy permanently discards data for smaller files; the original cannot be fully restored (JPEG, MP3). (1)",
        "Lossless reduces size with no data loss; the original is restored exactly (PNG, ZIP). (1)",
        "RLE replaces runs of repeated symbols with a (count, value) pair — lossless. (1)",
        "RLE suits data with long uniform runs (simple images). (1)",
        "Dictionary coding replaces repeated patterns/strings with short tokens from a dictionary — lossless. (1)",
        "Lossy suits media where minor loss is imperceptible; lossless is required for text/code or where accuracy is essential. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.10"] = {
  "notes": [
    {
      "h": "Encryption"
    },
    {
      "callout": {
        "t": "def",
        "h": "Encryption Concepts",
        "body": [
          {
            "kv": [
              [
                "Computational Security",
                "Theoretically breakable but takes impractically long."
              ],
              [
                "Perfect Security",
                "Mathematically unbreakable (e.g., Vernam Cipher)."
              ],
              [
                "Plaintext",
                "Unencrypted, readable data."
              ],
              [
                "Ciphertext",
                "Encrypted, unreadable data."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Security Comparison"
    },
    {
      "table": {
        "head": [
          "Feature",
          "Computationally Secure (AES/RSA)",
          "Perfectly Secure (Vernam)"
        ],
        "rows": [
          [
            "Key Length",
            "Short (128-4096 bits)",
            "Must be $\\ge$ Message length"
          ],
          [
            "Key Randomness",
            "Pseudorandom often okay",
            "MUST be truly random"
          ],
          [
            "Vulnerability",
            "Brute force / Quantum computers",
            "Mathematically immune"
          ],
          [
            "Practicality",
            "High (standard for web)",
            "Low (Key distribution is hard)"
          ]
        ]
      }
    },
    {
      "page": "Vernam Cipher"
    },
    {
      "h": "The Vernam Encryption Process"
    },
    {
      "steps": [
        {
          "h": "Prepare Key",
          "m": "Generate a truly random key of the same length as the plaintext message.",
          "n": "Must be truly random — pseudorandom generators are NOT sufficient for perfect security."
        },
        {
          "h": "Align",
          "m": "Express both plaintext and key as binary strings and align them bit by bit."
        },
        {
          "h": "XOR",
          "m": "Apply bitwise XOR to each corresponding bit pair: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0."
        },
        {
          "h": "Result",
          "m": "The resulting bit string is the ciphertext — statistically indistinguishable from random noise.",
          "n": "Decryption: XOR ciphertext with the same key to recover plaintext exactly."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "XOR encryption/decryption",
        "src": "cipher = plaintext XOR key\noriginal = cipher XOR key"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Vernam Key Rules",
        "body": "1. Must be truly random. 2. Must be at least as long as plaintext. 3. Must be used only once."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Encryption Misconceptions",
        "body": "**Any encryption is unbreakable if the key is long enough** — Only the Vernam cipher (one-time pad) with a truly random key used exactly once is theoretically unbreakable. Other ciphers (AES, RSA) are computationally secure (impractical to break) but not theoretically unbreakable. **Encryption and hashing are the same** — Encryption is reversible (given the key); hashing is one-way. A hash cannot be decrypted."
      }
    }
  ],
  "flashcards": [
    [
      "What does it mean for a cipher to be computationally secure?",
      "It can theoretically be broken, but it would take an unreasonable amount of time and resources with current technology."
    ],
    [
      "What is the only cipher proven to have perfect security?",
      "The Vernam cipher."
    ],
    [
      "What logical operation is used to combine the plaintext and key in a Vernam cipher?",
      "XOR (Exclusive OR)"
    ],
    [
      "What are the three strict rules for the key in a Vernam cipher?",
      "Must be truly random, must be equal or longer than the plaintext, and must be used only once (One-Time Pad)."
    ],
    [
      "Why isn't the Vernam cipher used for everyday web traffic?",
      "Distributing and securely storing a truly random key that is as long as every piece of data you want to send is logistically impossible for normal internet use."
    ],
    [
      "What is plaintext and what is ciphertext?",
      "Plaintext is the original readable data; ciphertext is the encrypted, unreadable output."
    ],
    [
      "Difference between computational and perfect security?",
      "Computational security is breakable in principle but takes impractically long; perfect security (Vernam with a true one-time pad) is mathematically unbreakable."
    ],
    [
      "Why is XOR ideal for the Vernam cipher?",
      "It is perfectly reversible (ciphertext XOR key returns the plaintext), and with a truly random key the ciphertext looks like random noise."
    ]
  ],
  "quiz": [
    {
      "q": "In a Vernam cipher, the plaintext bit is 1 and the key bit is 1. What is the ciphertext bit?",
      "opts": [
        "0",
        "1",
        "2",
        "Unknown"
      ],
      "ans": 0,
      "why": "1 XOR 1 = 0."
    },
    {
      "q": "Why is a standard Caesar shift cipher not considered computationally secure?",
      "opts": [
        "It is perfectly secure.",
        "It can easily be broken by brute force (only 25 possibilities) or frequency analysis.",
        "It uses too much computer memory.",
        "It requires a one-time pad."
      ],
      "ans": 1,
      "why": "With trivial effort, a modern computer or even human can break it instantly."
    },
    {
      "q": "Which of the following breaks the requirements for a Vernam cipher's key?",
      "opts": [
        "The key is longer than the message",
        "The key is generated by radioactive decay (truly random)",
        "The key is an algorithmically generated pseudorandom number sequence",
        "The key is destroyed after use"
      ],
      "ans": 2,
      "why": "A pseudorandom number generator is predictable if you know the seed, so it is not truly random, ruining perfect security."
    },
    {
      "q": "If you XOR the ciphertext with the one-time pad key, what do you get?",
      "opts": [
        "The key again",
        "A new ciphertext",
        "The original plaintext",
        "0"
      ],
      "ans": 2,
      "why": "The XOR operation is perfectly reversible with the same key. (Plaintext XOR Key = Cipher) and (Cipher XOR Key = Plaintext)."
    },
    {
      "q": "Plaintext bit 0 XOR key bit 1 gives which ciphertext bit?",
      "opts": [
        "0",
        "1",
        "2",
        "undefined"
      ],
      "ans": 1,
      "why": "0 XOR 1 = 1."
    }
  ],
  "exam": [
    {
      "q": "Describe the requirements for the key used in a Vernam cipher to ensure perfect security.",
      "marks": 3,
      "ms": [
        "The key must be completely/truly random. (1)",
        "The key must be at least as long as the plaintext message. (1)",
        "The key must be used only once / never reused (One-Time Pad). (1)"
      ]
    },
    {
      "q": "Distinguish between computational security and perfect security.",
      "marks": 2,
      "ms": [
        "Computational security: breakable in theory but takes infeasibly long with current resources. (1)",
        "Perfect security: mathematically unbreakable regardless of computing power (e.g. a Vernam one-time pad). (1)"
      ]
    },
    {
      "q": "Discuss why the Vernam cipher offers perfect security and why it is rarely used in practice.",
      "marks": 6,
      "ms": [
        "The plaintext is XORed with a key to give the ciphertext. (1)",
        "The key must be truly random. (1)",
        "at least as long as the message. (1)",
        "and used only once (one-time pad). (1)",
        "Under these conditions every plaintext is equally likely, so the ciphertext reveals nothing — mathematically unbreakable. (1)",
        "It is impractical because distributing and securely storing huge truly-random keys for all data is infeasible, so computationally-secure ciphers (AES/RSA) are used instead. (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);