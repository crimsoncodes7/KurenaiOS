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
        "body": "Value = $Mantissa \times 2^{Exponent}$. Both parts are usually stored in Two's Complement."
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
          "n": "Check the first two bits of the mantissa."
        },
        {
          "h": "Shift",
          "n": "If bits are 00 (positive) or 11 (negative), shift the mantissa left and decrement the exponent."
        },
        {
          "h": "Repeat",
          "n": "Repeat until bits are 01 (positive) or 10 (negative)."
        },
        {
          "h": "Finalise",
          "n": "The first bit now correctly represents the sign and the second bit the first fractional place."
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
    "In floating point systems, there is a trade-off between the range of numbers that can be represented and the precision of those numbers.",
    {
      "callout": {
        "t": "def",
        "h": "The Trade-off",
        "body": [
          {
            "kv": [
              [
                "Mantissa Bits",
                "More bits here increase **precision** (number of significant digits)."
              ],
              [
                "Exponent Bits",
                "More bits here increase **range** (how large or small the number can be)."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Allocation of 16 bits.",
        "src": "# Option A: 12-bit mantissa, 4-bit exponent (High precision, Low range)\n# Option B: 8-bit mantissa, 8-bit exponent (Low precision, High range)"
      }
    }
  ],
  "flashcards": [
    [
      "What happens if you increase the size of the mantissa?",
      "Precision increases, but range decreases (if total bits are fixed)."
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
      "why": "The exponent determines the power of 2, thus the range."
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
    "Normalisation is the process of moving the binary point so that the mantissa starts with a specific pattern (01 for positive, 10 for negative).",
    {
      "callout": {
        "t": "def",
        "h": "Normalisation Purpose",
        "body": [
          {
            "kv": [
              [
                "Maximise Precision",
                "Ensures no leading bits are wasted."
              ],
              [
                "Unique Representation",
                "Ensures every number has exactly one bit pattern."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Normalising 0.0011 x 2^5.",
        "src": "# Positive number: Shift left until it starts with 0.1\n# 0.0110 x 2^4\n# 0.1100 x 2^3 (Normalised)"
      }
    }
  ],
  "flashcards": [
    [
      "What bits does a normalised negative mantissa start with in Two's complement?",
      "10"
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
      "why": "Normalisation ensures we use as many bits as possible for the significant digits."
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
    "Overflow occurs when a number is too large to be represented. Underflow occurs when a number is too small (too close to zero).",
    {
      "callout": {
        "t": "def",
        "h": "Flow Errors",
        "body": [
          {
            "kv": [
              [
                "Overflow",
                "Result exceeds the maximum possible value."
              ],
              [
                "Underflow",
                "Result is smaller than the minimum non-zero value representable."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "csharp",
        "cap": "Detecting infinity in C#.",
        "src": "double large = double.MaxValue * 2;\nif (double.IsInfinity(large)) Console.WriteLine(\"Overflow!\");"
      }
    }
  ],
  "flashcards": [
    [
      "What is floating point underflow?",
      "When a result is too small to be represented by the available bits in the exponent."
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
      "why": "The result might become so small it drops to zero."
    }
  ],
  "exam": [
    {
      "q": "Explain how an overflow might occur during floating point addition.",
      "marks": 2,
      "ms": [
        "If two large numbers are added (1)",
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
    "Rounding errors occur because some decimal numbers (like 0.1) cannot be represented exactly in binary, leading to small inaccuracies.",
    {
      "callout": {
        "t": "def",
        "h": "Error Measurement",
        "body": [
          {
            "kv": [
              [
                "Absolute Error",
                "The difference between the actual and represented value."
              ],
              [
                "Relative Error",
                "The absolute error divided by the actual value."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "javascript",
        "cap": "The classic 0.1 + 0.2 error.",
        "src": "console.log(0.1 + 0.2); // 0.30000000000000004"
      }
    }
  ],
  "flashcards": [
    [
      "Why does 0.1 cause a rounding error in binary?",
      "Because it is a recurring fraction in binary ($0.000110011...$)."
    ]
  ],
  "quiz": [
    {
      "q": "Which error is more significant for very large numbers?",
      "opts": [
        "Absolute Error",
        "Relative Error",
        "Syntax Error",
        "Underflow"
      ],
      "ans": 1,
      "why": "Relative error shows the error as a percentage of the total."
    }
  ],
  "exam": [
    {
      "q": "Calculate the absolute error if 12.5 is represented as 12.48.",
      "marks": 2,
      "ms": [
        "12.5 - 12.48 = 0.02 (1)",
        "Absolute error is 0.02 (1)"
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
          "n": "Count the number of 1s in the data byte."
        },
        {
          "h": "Evaluate",
          "n": "If using even parity and count is odd, set parity bit to 1."
        },
        {
          "h": "Transmit",
          "n": "Send the 8-bit byte + parity bit."
        },
        {
          "h": "Verify",
          "n": "Receiver re-counts; if parity doesn't match the standard, an error occurred."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Simple parity generator",
        "src": "count = countOnes(data)\nIF mode == EVEN THEN\n  parity = (count MOD 2 != 0)\nELSE\n  parity = (count MOD 2 == 0)\nENDIF"
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
    "ASCII (American Standard Code for Information Interchange) was the original standard for character encoding.",
    {
      "callout": {
        "t": "def",
        "h": "ASCII Facts",
        "body": [
          {
            "kv": [
              [
                "Bit depth",
                "7 bits (128 characters) or 8 bits (Extended ASCII, 256 characters)."
              ],
              [
                "Limitation",
                "Only supports English and some Western European characters."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "python",
        "cap": "Converting char to ASCII.",
        "src": "print(ord('A')) # 65\nprint(chr(66)) # 'B'"
      }
    }
  ],
  "flashcards": [
    [
      "How many characters can 7-bit ASCII represent?",
      "128"
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
      "why": "Uppercase A is 65, lowercase a is 97."
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
                "Expressed as Width \times Height in pixels."
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
          "n": "Analogue sensor (e.g., mic) receives continuous physical waves."
        },
        {
          "h": "Sample",
          "n": "Take amplitude measurements at regular time intervals."
        },
        {
          "h": "Quantize",
          "n": "Map each amplitude to the nearest discrete binary value."
        },
        {
          "h": "Encode",
          "n": "Store the sequence of binary values as a digital file."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Image size calculation",
        "src": "pixels = width * height\nbits = pixels * colourDepth\nbytes = bits / 8"
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
      "Width \times Height \times Colour Depth"
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
    "A bitmapped image is composed of a grid of individual pixels, each assigned a specific color.",
    {
      "callout": {
        "t": "def",
        "h": "Bitmap Characteristics",
        "body": [
          {
            "kv": [
              [
                "Pixel",
                "The smallest unit of a digital image."
              ],
              [
                "File Formats",
                "JPEG, PNG, BMP, GIF."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Conceptual 2x2 bitmap (1-bit).",
        "src": "IMAGE = [\n  [1, 0],\n  [0, 1]\n] # A diagonal line"
      }
    }
  ],
  "flashcards": [
    [
      "What happens when you zoom in too far on a bitmap?",
      "It becomes pixelated."
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
      "why": "PNG stores a grid of pixels."
    }
  ],
  "exam": [
    {
      "q": "State one advantage and one disadvantage of bitmapped graphics.",
      "marks": 2,
      "ms": [
        "Advantage: Can represent complex, photorealistic images (1)",
        "Disadvantage: Large file sizes / Quality lost when scaled (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.2"] = {
  "notes": [
    {
      "h": "Resolution and Colour Depth"
    },
    "The quality and file size of a bitmap are determined by its resolution and its colour depth.",
    {
      "callout": {
        "t": "def",
        "h": "Key Factors",
        "body": [
          {
            "kv": [
              [
                "Resolution",
                "The number of pixels (e.g. 1920 x 1080)."
              ],
              [
                "Colour Depth",
                "The number of bits used per pixel (e.g. 24-bit)."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Calculating size in bits.",
        "src": "bits = width * height * colourDepth"
      }
    }
  ],
  "flashcards": [
    [
      "How many colours can an 8-bit colour depth represent?",
      "256 ($2^8$)"
    ]
  ],
  "quiz": [
    {
      "q": "If resolution doubles in both dimensions, what happens to the number of pixels?",
      "opts": [
        "Doubles",
        "Triples",
        "Quadruples",
        "Stays same"
      ],
      "ans": 2,
      "why": "2x * 2y = 4xy."
    }
  ],
  "exam": [
    {
      "q": "Calculate the file size in KiB of a 100x100 image with 8-bit colour depth.",
      "marks": 3,
      "ms": [
        "100 * 100 * 8 = 80,000 bits (1)",
        "80,000 / 8 = 10,000 bytes (1)",
        "10,000 / 1024 = 9.77 KiB (1)"
      ]
    }
  ]
};

C["compsci:4.5.6.3"] = {
  "notes": [
    {
      "h": "Vector Graphics"
    },
    "Vector graphics use mathematical formulas to define shapes, lines, and curves rather than a grid of pixels.",
    {
      "callout": {
        "t": "def",
        "h": "Vector Properties",
        "body": [
          {
            "kv": [
              [
                "Scalability",
                "Can be scaled infinitely without loss of quality."
              ],
              [
                "Primitives",
                "Shapes like rectangles, circles, and paths."
              ]
            ]
          }
        ]
      }
    },
    {
      "code": {
        "lang": "xml",
        "cap": "An SVG circle.",
        "src": "<svg>\n  <circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"red\" />\n</svg>"
      }
    }
  ],
  "flashcards": [
    [
      "Why are vector graphics good for logos?",
      "They can be resized for a business card or a billboard without pixelating."
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
      "why": "SVG stands for Scalable Vector Graphics."
    }
  ],
  "exam": [
    {
      "q": "Compare vector and bitmapped graphics in terms of file size for a simple company logo.",
      "marks": 2,
      "ms": [
        "Vector graphics would be smaller as they only store mathematical rules (1)",
        "Bitmap would be larger as it must store every pixel even for flat colors (1)"
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
                "Sample rate must be $2 \times$ highest signal frequency."
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
          "n": "Measure amplitude of analogue wave at $X$ times per second."
        },
        {
          "h": "Convert",
          "n": "Pass measurements through an ADC."
        },
        {
          "h": "Storage",
          "n": "Store resulting binary values."
        },
        {
          "h": "Output",
          "n": "Pass back through a DAC and amplifier for playback."
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
      "why": "Nyquist dictates $2 \times$ highest frequency, so $2 \times 20,000 = 40,000$ Hz."
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
            "Must be $\ge$ Message length"
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
          "n": "Ensure key is truly random and same length as message."
        },
        {
          "h": "Align",
          "n": "Align plaintext binary with key binary."
        },
        {
          "h": "XOR",
          "n": "Perform bitwise XOR on each pair."
        },
        {
          "h": "Result",
          "n": "The resulting bits are the secure ciphertext."
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