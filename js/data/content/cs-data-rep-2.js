/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.5.4.5"] = {
  "notes": [
    {
      "h": "Floating Point Representation & Errors"
    },
    "Floating point allows representation of fractional values and a huge range of numbers. It is split into a **Mantissa** (fractional part) and an **Exponent** (power of 2).",
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
    }
  ]
};

C["compsci:4.5.4.6"] = {
  "notes": [
    {
      "h": "Range and Precision"
    },
    "In floating point systems, the total number of bits is fixed. Allocating more bits to one part always reduces what the other part can contribute.",
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
    }
  ]
};

C["compsci:4.5.4.7"] = {
  "notes": [
    {
      "h": "Normalisation"
    },
    "Normalisation is the process of adjusting a floating point number so the mantissa uses all its bits as efficiently as possible, removing redundant leading bits.",
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
    }
  ]
};

C["compsci:4.5.4.8"] = {
  "notes": [
    {
      "h": "Underflow and Overflow"
    },
    "Both overflow and underflow are errors that occur when the exponent field cannot accommodate the required value.",
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
    }
  ]
};

C["compsci:4.5.4.9"] = {
  "notes": [
    {
      "h": "Rounding Errors"
    },
    "Rounding errors occur because many decimal fractions cannot be represented exactly in binary — the mantissa must be truncated to finite bits, leaving a tiny error.",
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
    }
  ]
};

C["compsci:4.5.5.1"] = {
  "notes": [
    {
      "h": "Character Sets: ASCII"
    },
    "ASCII (American Standard Code for Information Interchange) was the original standard for encoding characters as binary numbers.",
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
    }
  ],
  "exam": [
    {
      "q": "State one disadvantage of using ASCII in a global software application.",
      "marks": 1,
      "ms": [
        "It cannot represent characters from non-Latin languages like Chinese or Arabic (1)"
      ]
    }
  ]
};

C["compsci:4.5.5.3"] = {
  "notes": [
    {
      "h": "Error Checking and Correction"
    },
    "Various methods are used to detect and sometimes correct errors that occur during data transmission.",
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
    }
  ]
};

C["compsci:4.5.6.4"] = {
  "notes": [
    {
      "h": "Graphics and Data Conversion"
    },
    {
      "h": "Comparing Graphic Types"
    },
    {
      "table": {
        "head": [
          "Feature",
          "Bitmapped Graphics",
          "Vector Graphics"
        ],
        "rows": [
          [
            "Composition",
            "Grid of pixels",
            "Geometric primitives (math)"
          ],
          [
            "Scaling",
            "Pixelates / Loses quality",
            "Perfect scaling (no loss)"
          ],
          [
            "File Size",
            "Large (depends on resolution)",
            "Small (depends on complexity)"
          ],
          [
            "Suitability",
            "Photorealistic photos",
            "Logos / Diagrams"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Imaging Terms",
        "body": [
          {
            "kv": [
              [
                "Resolution",
                "Expressed as Width × Height in pixels (e.g., 1920 × 1080)."
              ],
              [
                "Colour Depth",
                "Number of bits per pixel (e.g., 24-bit)."
              ],
              [
                "Metadata",
                "Data about data (e.g., image dimensions, date taken)."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "The ADC (Analogue to Digital) Process"
    },
    {
      "steps": [
        {
          "h": "Receive Signal",
          "m": "An analogue sensor (e.g., microphone) detects continuous physical waves and produces a varying electrical signal."
        },
        {
          "h": "Sample",
          "m": "Measure the amplitude of the signal at regular time intervals (the sample rate).",
          "n": "Higher sample rate → more samples per second → better reproduction of high-frequency detail."
        },
        {
          "h": "Quantize",
          "m": "Map each sampled amplitude to the nearest discrete binary value (limited by the sample resolution / bit depth).",
          "n": "Higher resolution → smaller quantisation error per step."
        },
        {
          "h": "Encode",
          "m": "Store the sequence of binary values as a digital file."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Image size calculation",
        "src": "pixels = width * height\nbits = pixels * colourDepth\nbytes = bits / 8"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Image File Size Formula",
        "body": "**File size (bits) = Width × Height × Colour depth**. Colour depth (n bits) → 2ⁿ colours available. Resolution = pixel count (or pixels per inch). Metadata (dimensions, colour depth) is stored in the file header and is NOT part of the pixel data formula."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Image Quality Misconceptions",
        "body": "**Higher resolution always means a higher quality image** — Resolution determines pixel count; quality also depends on colour depth. A 1-bit (black/white) image at 4K resolution looks worse than a 24-bit colour image at lower resolution. **Colour depth and resolution are the same thing** — Resolution = how many pixels; colour depth = how many bits per pixel (colours available). They are independent."
      }
    }
  ],
  "flashcards": [
    [
      "What determines the number of colors available in a bitmapped image?",
      "Colour depth (bits per pixel)."
    ],
    [
      "What is a major advantage of vector graphics over bitmapped graphics?",
      "They can be scaled infinitely without losing quality or becoming pixelated, and often have a smaller file size for simple drawings."
    ],
    [
      "How do you calculate the estimated file size of a bitmapped image in bits?",
      "Width × Height × Colour Depth (in bits)"
    ],
    [
      "What does an Analogue to Digital Converter (ADC) do?",
      "It converts continuous analogue signals into discrete digital (binary) values by sampling at regular intervals."
    ],
    [
      "Why can't vector graphics be easily used for photographs?",
      "Photographs have complex, continuously varying color patterns that cannot be efficiently described by simple geometric math equations."
    ]
  ],
  "quiz": [
    {
      "q": "A 100x100 pixel image has a colour depth of 8 bits. What is its uncompressed file size in bytes?",
      "opts": [
        "10,000 bytes",
        "80,000 bytes",
        "1,250 bytes",
        "800 bytes"
      ],
      "ans": 0,
      "why": "100 * 100 = 10,000 pixels. 8 bits per pixel = 1 byte per pixel. So, 10,000 bytes."
    },
    {
      "q": "Which of these is stored as a list of mathematical instructions rather than a grid of pixels?",
      "opts": [
        "JPEG",
        "Bitmapped graphic",
        "Vector graphic",
        "GIF"
      ],
      "ans": 2,
      "why": "Vector graphics store properties like shape, stroke, fill, and coordinates instead of pixel arrays."
    },
    {
      "q": "What is the role of a DAC in audio playback?",
      "opts": [
        "To convert continuous sound waves into binary files",
        "To convert binary audio data into varying electrical voltages for a speaker",
        "To compress the audio file",
        "To increase the sampling rate"
      ],
      "ans": 1,
      "why": "Digital-to-Analogue Converters turn digital data back into an analogue signal that physical speakers can output."
    },
    {
      "q": "How many colours can be represented with a 4-bit colour depth?",
      "opts": [
        "4",
        "8",
        "16",
        "256"
      ],
      "ans": 2,
      "why": "$2^4 = 16$ colours."
    }
  ],
  "exam": [
    {
      "q": "Explain why bitmapped graphics are better suited for photographs than vector graphics.",
      "marks": 2,
      "ms": [
        "Photographs contain continuously varying colors and tiny details that do not fit into simple geometric shapes. (1)",
        "Bitmapped graphics can store the exact color of every single pixel independently, allowing for photorealism. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.1"] = {
  "notes": [
    {
      "h": "Bitmapped Graphics"
    },
    "A bitmapped image is a grid of pixels, each storing its own colour value. The quality of the image depends on how many pixels there are and how many colours each can represent.",
    {
      "callout": {
        "t": "def",
        "h": "Pixel",
        "body": "The smallest addressable element in a digital image. Each pixel stores a colour value as a binary number with `colour depth` bits."
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
    }
  ]
};

C["compsci:4.5.6.2"] = {
  "notes": [
    {
      "h": "Resolution and Colour Depth"
    },
    "Two factors determine both the visual quality and the file size of a bitmapped image: resolution and colour depth.",
    {
      "callout": {
        "t": "def",
        "h": "Resolution",
        "body": "The number of pixels in an image, expressed as Width × Height (e.g., 1920 × 1080). Higher resolution = more pixels = more detail = larger file."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Colour Depth",
        "body": "The number of bits used to represent each pixel's colour. More bits = more possible colours = smoother gradients = larger file."
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Image File Size",
        "body": "$\\text{Size (bits)} = \\text{Width} \\times \\text{Height} \\times \\text{Colour Depth}$. Divide by 8 for bytes, by 8192 for KiB, by 8,388,608 for MiB."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Colour Depth → Colour Count",
        "body": [
          {
            "kv": [
              ["1-bit", "2 colours (monochrome)"],
              ["8-bit", "256 colours"],
              ["16-bit", "65,536 colours"],
              ["24-bit", "16.7 million colours (\"true colour\")"]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Calculating image file size.",
        "src": "# 1920x1080 image, 24-bit colour\nwidth = 1920\nheight = 1080\ncolourDepth = 24\n\nbits = width * height * colourDepth  # 49,766,400 bits\nbytes = bits / 8                     # 6,220,800 bytes\nMiB = bytes / (1024 * 1024)          # ≈ 5.93 MiB"
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Resolution vs Colour Depth Confusion",
        "body": "**Resolution and colour depth are the same thing** — No: resolution = the number of pixels (or pixels per unit length); colour depth = the number of bits per pixel, determining how many colours are available. Both independently affect image quality and file size. **More resolution always means better quality** — A 4K image with 1-bit colour (black/white) looks far worse than a 1080p image with 24-bit true colour."
      }
    }
  ],
  "flashcards": [
    [
      "How many colours can an 8-bit colour depth represent?",
      "256 ($2^8$)"
    ],
    [
      "What does increasing colour depth do to file size?",
      "Increases it — more bits per pixel means more data to store."
    ],
    [
      "What is 'true colour' and how many bits does it use?",
      "24-bit colour — 8 bits each for red, green, and blue, giving ~16.7 million possible colours."
    ]
  ],
  "quiz": [
    {
      "q": "If resolution doubles in both dimensions, what happens to the number of pixels?",
      "opts": [
        "Doubles",
        "Triples",
        "Quadruples",
        "Stays the same"
      ],
      "ans": 2,
      "why": "Doubling width AND height: $2W \\times 2H = 4 \\times (W \\times H)$."
    },
    {
      "q": "An image is 200 × 100 pixels with a 4-bit colour depth. What is its uncompressed size in bytes?",
      "opts": [
        "80,000 bytes",
        "10,000 bytes",
        "20,000 bytes",
        "40,000 bytes"
      ],
      "ans": 1,
      "why": "200 × 100 × 4 = 80,000 bits. 80,000 ÷ 8 = 10,000 bytes."
    }
  ],
  "exam": [
    {
      "q": "Calculate the file size in KiB of a 100×100 image with 8-bit colour depth.",
      "marks": 3,
      "ms": [
        "$100 \\times 100 \\times 8 = 80{,}000$ bits (1)",
        "$80{,}000 \\div 8 = 10{,}000$ bytes (1)",
        "$10{,}000 \\div 1024 \\approx 9.77$ KiB (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.3"] = {
  "notes": [
    {
      "h": "Vector Graphics"
    },
    "Vector graphics store images as mathematical descriptions of shapes — coordinates, colours, and properties — rather than a grid of pixel colours.",
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
    }
  ]
};

C["compsci:4.5.6.5"] = {
  "notes": [
    {
      "h": "ADC and DAC"
    },
    "Audio must be converted between analogue waves and digital binary for computers to process it.",
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
    }
  ]
};

C["compsci:4.5.6.6"] = {
  "notes": [
    {
      "h": "Sound Sampling"
    },
    "Digital sound is created by sampling the amplitude of an analogue wave at regular intervals.",
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
    }
  ]
};

C["compsci:4.5.6.7"] = {
  "notes": [
    {
      "h": "Sound and MIDI"
    },
    "Digital sound is recorded by sampling an analogue wave at set intervals.",
    {
      "callout": {
        "t": "def",
        "h": "Acoustic Terms",
        "body": [
          {
            "kv": [
              [
                "Sample Rate",
                "Samples taken per second (Hz)."
              ],
              [
                "Sample Resolution",
                "Bits per sample (determines dynamic range)."
              ],
              [
                "Nyquist Theorem",
                "Sample rate must be $2 \\times$ highest signal frequency."
              ],
              [
                "MIDI",
                "Protocol for storing musical event instructions, not audio."
              ]
            ]
          }
        ]
      }
    },
    {
      "h": "Comparing Audio Formats"
    },
    {
      "table": {
        "head": [
          "Feature",
          "Sampled Digital Audio",
          "MIDI"
        ],
        "rows": [
          [
            "Storage",
            "Actual sound pressure waves",
            "Musical instructions (events)"
          ],
          [
            "File Size",
            "Very Large",
            "Very Small"
          ],
          [
            "Editing",
            "Hard to isolate instruments",
            "Easy to change notes/instruments"
          ],
          [
            "Fidelity",
            "Records exactly what was heard",
            "Depends on playback device synth"
          ]
        ]
      }
    },
    {
      "h": "The Digital Audio Process"
    },
    {
      "steps": [
        {
          "h": "Sample",
          "m": "Measure the amplitude of the analogue wave at the sample rate (e.g., 44,100 times per second).",
          "n": "Nyquist: rate must be ≥ 2× the highest frequency to avoid aliasing."
        },
        {
          "h": "Convert",
          "m": "Pass each amplitude measurement through an ADC to produce a binary value."
        },
        {
          "h": "Storage",
          "m": "Store the resulting sequence of binary values as a digital audio file."
        },
        {
          "h": "Output",
          "m": "During playback, pass the binary data through a DAC and amplifier to drive the speaker."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Audio bit rate calculation",
        "src": "bitRate = sampleRate * sampleResolution * channels\nfileSize = bitRate * seconds"
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Advantages of MIDI",
        "body": "Very small file size, easily editable (you can change a single note's pitch without affecting others), easily change instruments."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "MIDI vs Sampled Audio",
        "body": "**MIDI**: stores musical events (NoteOn, NoteOff, velocity, channel, timing) — NOT audio waveforms. Very small files. Easily editable (change pitch, tempo, instrument). Requires a synthesizer. **Sampled audio**: stores actual digitised waveform. Large files. Realistic playback. Hard to edit individual notes. Quality fixed at recording time."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "MIDI Misconceptions",
        "body": "**A MIDI file contains recorded audio** — No; MIDI stores musical instructions (which notes, when, how hard) like sheet music — not waveform data. Playback depends on the synthesizer. **MIDI always sounds the same on all devices** — No; MIDI output quality depends on the synthesizer used; different synths produce different timbres from the same MIDI events."
      }
    }
  ],
  "flashcards": [
    [
      "What two factors primarily determine the quality and file size of digital audio?",
      "Sample rate and sample resolution."
    ],
    [
      "What is the Nyquist Theorem?",
      "The sample rate must be at least twice the highest frequency of the original signal to accurately reconstruct it."
    ],
    [
      "What does MIDI stand for?",
      "Musical Instrument Digital Interface"
    ],
    [
      "Does a MIDI file contain actual digital audio waves?",
      "No, it contains event messages/instructions (like sheet music) detailing how to play the sound."
    ],
    [
      "What is an advantage of MIDI over sampled digital audio?",
      "Much smaller file size and absolute control to edit individual notes or change instruments after recording."
    ]
  ],
  "quiz": [
    {
      "q": "If human hearing goes up to 20,000 Hz, what is the minimum sample rate required according to the Nyquist theorem?",
      "opts": [
        "10,000 Hz",
        "20,000 Hz",
        "40,000 Hz",
        "44,100 Hz"
      ],
      "ans": 2,
      "why": "Nyquist dictates $2 \\times$ highest frequency, so $2 \\times 20,000 = 40,000$ Hz."
    },
    {
      "q": "A 10-second mono audio track is recorded at 1000 Hz with an 8-bit resolution. What is the uncompressed file size?",
      "opts": [
        "80,000 bits",
        "8,000 bits",
        "10,000 bytes",
        "Both A and C"
      ],
      "ans": 3,
      "why": "1000 * 8 * 10 * 1 = 80,000 bits. 80,000 / 8 = 10,000 bytes. So both A and C are correct."
    },
    {
      "q": "Which of the following is NOT typically a MIDI event parameter?",
      "opts": [
        "Velocity (Volume)",
        "Pitch",
        "Sample Rate",
        "Note On / Note Off"
      ],
      "ans": 2,
      "why": "Sample rate applies to digitized audio waveforms, not MIDI event instructions."
    },
    {
      "q": "Why might a MIDI file sound different on two different computers?",
      "opts": [
        "Because MIDI files degrade over time",
        "Because they use different hardware sound cards/synths to interpret the instructions",
        "Because the sample rate conversion fails",
        "Because MIDI files are lossy"
      ],
      "ans": 1,
      "why": "MIDI only sends instructions. The computer's local synthesizer generates the actual sound based on its built-in instrument samples."
    }
  ],
  "exam": [
    {
      "q": "State two advantages of using MIDI instead of sampled digital audio to store a piece of music.",
      "marks": 2,
      "ms": [
        "Requires much less storage space. (1)",
        "Individual notes can be edited/changed easily without affecting the rest of the recording. (1)",
        "Instruments can be easily swapped out. (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.8"] = {
  "notes": [
    {
      "h": "MIDI vs Sampled Audio"
    },
    "MIDI (Musical Instrument Digital Interface) stores instructions for how to play music, not the sound itself.",
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
    }
  ]
};

C["compsci:4.5.6.9"] = {
  "notes": [
    {
      "h": "Data Compression"
    },
    "Compression is used to reduce file sizes, saving storage space and reducing transmission time.",
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
    }
  ]
};

})(window.KOS_CONTENT);