/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

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
      "page": "Conversion"
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
    ],
    [
      "How many values can an $n$-bit unsigned integer represent?",
      "$2^n$ values, from 0 to $2^n - 1$."
    ],
    [
      "What is the place value of the MSB in an 8-bit unsigned number?",
      "128 ($2^7$)."
    ],
    [
      "Convert the decimal 200 to 8-bit unsigned binary.",
      "11001000 (128 + 64 + 8)."
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
    },
    {
      "q": "What is the maximum value of a 12-bit unsigned integer?",
      "opts": [
        "2048",
        "4095",
        "4096",
        "8191"
      ],
      "ans": 1,
      "why": "$2^{12} - 1 = 4095$."
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
    },
    {
      "q": "Convert the unsigned binary 11001010 to decimal, showing the place values used.",
      "marks": 3,
      "ms": [
        "Place values 128 64 32 16 8 4 2 1. (1)",
        "Set bits contribute 128 + 64 + 8 + 2. (1)",
        "= 202. (1)"
      ]
    },
    {
      "q": "Discuss the advantages and limitations of using unsigned binary representation for integers.",
      "marks": 6,
      "ms": [
        "Advantage: all bit patterns represent non-negative values, doubling the positive range vs signed. (1)",
        "e.g. 8-bit unsigned 0–255 vs signed −128..127. (1)",
        "Simple to convert and to perform arithmetic on. (1)",
        "Limitation: cannot represent negative numbers. (1)",
        "→ unsuitable where negatives are needed (temperatures, balances). (1)",
        "Limitation: fixed width → overflow when exceeding 2^n − 1; suited to data like memory addresses, pixel values and counts that are never negative. (1)"
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
      "page": "Addition Process"
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
    ],
    [
      "When does overflow occur in unsigned binary addition?",
      "When a 1 is carried out beyond the most significant bit — the result needs more bits than available."
    ],
    [
      "Add 0110 + 0011 in binary.",
      "1001 (6 + 3 = 9)."
    ],
    [
      "How is subtraction performed in binary using addition?",
      "Add the two's complement of the number being subtracted."
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
    },
    {
      "q": "What is 1111 + 0001 in a 4-bit register?",
      "opts": [
        "0000 with overflow",
        "1111",
        "10000 with no overflow",
        "0001"
      ],
      "ans": 0,
      "why": "15 + 1 = 16 = 10000; the 5th bit is lost in 4 bits, giving 0000 with overflow."
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
    },
    {
      "q": "Add the 4-bit unsigned numbers 0101 and 0100 and state the decimal result.",
      "marks": 2,
      "ms": [
        "0101 + 0100 = 1001. (1)",
        "= 9 in decimal. (1)"
      ]
    },
    {
      "q": "Discuss what overflow is in binary arithmetic, how it is detected, and how it can be avoided.",
      "marks": 6,
      "ms": [
        "Overflow is when the result of an operation is too large for the fixed number of bits. (1)",
        "In unsigned addition it is detected by a carry out of the MSB. (1)",
        "The stored result wraps around / is incorrect. (1)",
        "e.g. 8-bit 255 + 1 = 0 (carry lost). (1)",
        "Avoided by using a larger word size / data type. (1)",
        "or by checking for carry-out before relying on the result — important in safety-critical and financial systems where wrong values cause failures. (1)"
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
      "page": "Negation & Subtraction"
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
    ],
    [
      "What is the place value (weight) of the MSB in 8-bit Two's complement?",
      "−128 ($-2^7$)."
    ],
    [
      "Convert −5 to 8-bit Two's complement.",
      "11111011 (5 = 00000101 → invert 11111010 → +1 = 11111011)."
    ],
    [
      "How do you decode a negative Two's complement number to decimal?",
      "Either sum the place values with the MSB negative, or invert all bits and add 1 to get the magnitude, then negate it."
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
    },
    {
      "q": "What decimal value is the 8-bit Two's complement number 11111111?",
      "opts": [
        "-1",
        "1",
        "255",
        "-255"
      ],
      "ans": 0,
      "why": "All ones in two's complement is -1 (invert → 00000000, add 1 → 00000001 = 1, then negate → -1)."
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
    },
    {
      "q": "Convert the decimal -20 into 8-bit Two's complement, showing each step.",
      "marks": 3,
      "ms": [
        "20 = 00010100. (1)",
        "Invert the bits: 11101011. (1)",
        "Add 1: 11101100. (1)"
      ]
    },
    {
      "q": "Discuss why Two's complement is the preferred method for representing signed integers in computers, comparing it with sign-and-magnitude.",
      "marks": 6,
      "ms": [
        "Two's complement has a single representation of zero. (1)",
        "Sign-and-magnitude has two zeros (+0 and −0), wasting a pattern and complicating equality tests. (1)",
        "Two's complement lets the same adder hardware perform addition and subtraction. (1)",
        "Subtraction = add the two's complement, so no separate subtractor is needed. (1)",
        "Sign-and-magnitude needs extra logic to handle signs during arithmetic. (1)",
        "Two's complement uses all bit patterns (range −128..127 for 8-bit), giving simpler, cheaper hardware → the industry standard. (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);
