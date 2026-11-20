/* Kurenai OS — past-paper bank: AQA 7517 §4.5 Data representation (part A:
   number systems, bases, units, binary arithmetic, fixed and floating point,
   errors). Modelled on AS/A-level Paper 2, June 2016–2025. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.5.2.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Number bases — the AS Q2 warm-up" },
    "One-mark conversions (bit pattern → hex, 193 → hex, hex → denary), and the reliable one-marker **why programmers use hexadecimal rather than binary**: *it is **easier for humans to read / write / remember** and **less prone to error**, because **one hex digit represents four bits** so numbers are shorter — while converting between hex and binary is simple*. Saying \"it uses less memory\" is **wrong** — the computer still stores binary.",
    { callout: { t: "tip", body: "Binary → hex: split into groups of **four from the right**, pad the left with zeros, convert each nibble. Hex → binary: four bits per digit. Two hex digits = one byte — which is why colours, MAC addresses and memory dumps use it." }}
  ],
  flashcards: [
    ["Why do programmers use hexadecimal rather than binary?", "It is easier for humans to read, write and remember and less error-prone, because each hex digit represents four bits so numbers are much shorter, and conversion to binary is straightforward.", 13],
    ["How many bits does one hex digit represent?", "Four (a nibble).", 14],
    ["How many hex digits represent one byte?", "Two.", 15],
    ["Which is largest: 1011010 (binary), 5A (hex), 91 (denary)?", "1011010₂ = 90; 5A₁₆ = 90; 91 is largest.", 17]
  ],
  quiz: [
    { q: "11111111 in hexadecimal is:", opts: ["FF", "F0", "255", "EE"], ans: 0, why: "Two nibbles of 1111." },
    { q: "Hex 7C in denary is:", opts: ["124", "112", "120", "76"], ans: 0, why: "7C is 7 × 16 + 12 (C = 12) = 112 + 12 = 124." },
    { q: "Why is hex used in memory dumps rather than binary?", opts: ["It takes up less memory than the same values in binary", "It is shorter for humans to read and converts simply to binary", "The computer stores memory contents as hex, not binary", "The processor can handle hex values faster than it handles binary"], ans: 1, why: "Memory use is unchanged." },
    { q: "Denary 45 in hex:", opts: ["2D", "45", "3C", "2F"], ans: 0, why: "45 = 2 × 16 + 13, and 13 is D, so the hex value is 2D." },
    { q: "Binary 1010 0011 in hex:", opts: ["A3", "AC", "93", "A5"], ans: 0, why: "1010 = A, 0011 = 3." },
    { q: "How many bits are needed to store two hex digits?", opts: ["4", "8", "16", "2"], ans: 1, why: "4 bits per digit." },
    { qk: "150", q: "00111001 in hexadecimal is:", opts: ["57", "39", "93", "3A"], ans: 1, why: "Split into nibbles: 0011 = 3 and 1001 = 9, giving 39. (57 is its denary value.)" },
    { qk: "151", q: "Hex C57 in denary is:", opts: ["3087", "1287", "3159", "3165"], ans: 2, why: "C × 256 + 5 × 16 + 7 = 3072 + 80 + 7 = 3159." },
    { qk: "152", q: "Denary 193 in hexadecimal is:", opts: ["C1", "1C", "B1", "C3"], ans: 0, why: "193 = 12 × 16 + 1, and 12 is C, so 193 is C1." },
    { qk: "153", q: "11010110 in hexadecimal is:", opts: ["6D", "D6", "C6", "D7"], ans: 1, why: "1101 = D (13) and 0110 = 6, so the byte is D6." },
    { qk: "154", q: "Denary 238 in hexadecimal is:", opts: ["E8", "EE", "DE", "FE"], ans: 1, why: "238 = 14 × 16 + 14, and 14 is E, so 238 is EE." },
    { qk: "155", q: "Hex 3E in denary is:", opts: ["62", "56", "314", "60"], ans: 0, why: "3 × 16 + 14 (E = 14) = 48 + 14 = 62." },
    { qk: "156", q: "Hex 2A in binary is:", opts: ["0010 1011", "1010 0010", "0010 1010", "0010 0110"], ans: 2, why: "Each hex digit is one nibble: 2 = 0010 and A (10) = 1010." }
  ],
  exam: [
    { level: "AS", src: "AQA 2019 · P2 Q02", ctx: "A memory location holds the bit pattern `1101 0110`.",
      parts: [
        { q: "Write the bit pattern as a hexadecimal number.", marks: 1, ms: ["D6 (1)"] },
        { q: "Explain why programmers often use hexadecimal rather than binary when writing down bit patterns.", marks: 2, ms: ["Hexadecimal is shorter / easier for humans to read, write and remember and less prone to error (1)", "Because each hex digit corresponds to exactly four bits, conversion between the two is simple (1)"] }
      ] },
    { src: "AQA 2022 · P2 Q01.1", q: "Convert the binary number `1 0111 1010` to hexadecimal, showing your method.", marks: 2,
      ms: ["Grouped into nibbles from the right: 0001 0111 1010 (1)", "17A (1)"] },
    { level: "AS", src: "AQA 2018 · P2 Q02.2", q: "Add the hexadecimal numbers `2B` and `19`, showing your working in binary, and give the answer in hexadecimal.", marks: 2,
      ms: ["0010 1011 + 0001 1001 = 0100 0100 (1)", "44 (1)"] }
  ]
});

X("compsci:4.5.4.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Two's complement — ranges and subtraction" },
    "**Range** of n-bit two's complement: **−2ⁿ⁻¹ to 2ⁿ⁻¹ − 1** — 8-bit: −128 to 127 (AS 2023); 4-bit: −8 to 7 (AS 2025); *most negative 12-bit value* −2048 (AS 2018). **Subtraction** (2–3 marks): negate the subtrahend by flipping the bits and adding 1 (or copy up to and including the first 1, then flip), add, ignore the carry-out. 18 − 72 (2021) → 00010010 + 10111000 = 11001010 = −54.",
    { callout: { t: "warn", body: "The MSB has place value **−128**, not 128 with a sign. Converting 11001010: −128 + 64 + 8 + 2 = −54. A pattern starting with 1 is negative; do not \"read it as unsigned then negate\"." }}
  ],
  flashcards: [
    ["Range of 4-bit two's complement?", "−8 to +7.", 10],
    ["What is the most negative 12-bit two's complement value, as bits?", "−2048 (100000000000).", 11],
    ["How do you negate a two's complement number?", "Invert every bit and add 1 (or copy from the right up to and including the first 1, then invert the rest).", 14],
    ["Why is two's complement preferred to sign-and-magnitude?", "One representation of zero, and addition/subtraction use the same adder circuit with no special sign handling.", 16]
  ],
  quiz: [
    { q: "10000000 in 8-bit two's complement is:", opts: ["128", "−128", "−0", "−127"], ans: 1, why: "In two's complement the most significant bit has weight −128 in 8 bits, so 10000000 is −128." },
    { q: "The two's complement of 00010110 (22) is:", opts: ["11101001", "11101010", "10010110", "01101010"], ans: 1, why: "Flip → 11101001, +1 → 11101010 (−22)." },
    { q: "Range of 6-bit two's complement:", opts: ["−32 to 31", "−31 to 32", "0 to 63", "−64 to 63"], ans: 0, why: "With 6 bits the top bit is worth −2⁵ = −32, so the range is −32 to 2⁵ − 1 = 31." },
    { q: "01111111 + 00000001 in 8-bit two's complement gives:", opts: ["128 (no overflow)", "−128 (overflow)", "0 (carry out)", "−1 (overflow)"], ans: 1, why: "10000000 = −128 — signed overflow." },
    { q: "11111111 represents:", opts: ["255", "−1", "−127", "127"], ans: 1, why: "The top bit is −128 and the other seven bits add 127, so all ones is −128 + 127 = −1." },
    { q: "To compute 12 − 5 in 8-bit two's complement you add 00001100 to:", opts: ["00000101", "11111011", "11111010", "10000101"], ans: 1, why: "−5 = flip 00000101 → 11111010, +1 → 11111011; the sum 100000111 drops the carry → 00000111 = 7." },
    { qk: "150", q: "−36 in 8-bit two's complement is:", opts: ["10100100", "11011100", "11011011", "00100100"], ans: 1, why: "36 = 00100100; invert to 11011011, then add 1: 11011100. (10100100 is sign and magnitude.)" },
    { qk: "151", q: "The two's complement byte 11001010 in denary is:", opts: ["202", "−74", "−54", "−53"], ans: 2, why: "−128 + 64 + 8 + 2 = −54. 202 reads it as unsigned, −74 as sign and magnitude." },
    { qk: "152", q: "−100 in 8-bit two's complement is:", opts: ["11100100", "10011100", "10011011", "01100100"], ans: 1, why: "100 = 01100100; invert to 10011011, then add 1: 10011100. (11100100 is sign and magnitude.)" },
    { qk: "153", q: "18 − 72 worked in 8-bit two's complement (00010010 + 10111000) gives:", opts: ["00110110", "11001010", "10110110", "11011010"], ans: 1, why: "Add 18 to −72: 00010010 + 10111000 = 11001010, which is −54. (00110110 is +54.)" }
  ],
  exam: [
    { level: "AS", src: "AQA 2025 · P2 Q02.5", q: "Using 8-bit two's complement, calculate `00101101 − 01001100` (45 − 76). Show the two's complement of the subtrahend, the addition, and the result in denary.", marks: 3,
      ms: ["Two's complement of 01001100 is 10110100 (1)", "00101101 + 10110100 = 11100001 (carry ignored) (1)", "= −31 (1)"] },
    { level: "AS", src: "AQA 2023 · P2 Q03.4", q: "State the range of denary values that can be represented by an 8-bit two's complement integer.", marks: 1,
      ms: ["−128 to +127 (1)"] },
    { src: "AQA 2022 · P2 Q05.1", q: "Convert the two's complement value `11001101` to denary, showing your method.", marks: 2,
      ms: ["−128 + 64 + 8 + 4 + 1 (or flip and add 1 to get 00110011 = 51, so negative) (1)", "−51 (1)"] },
    { level: "AS", src: "AQA 2018 · P2 Q02.3", q: "State, in denary, the most negative value that can be represented using 12-bit two's complement, and give its bit pattern.", marks: 2,
      ms: ["−2048 (1)", "100000000000 (1)"] }
  ]
});

X("compsci:4.5.4.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Fixed point and floating point — the 12-mark Paper 2 question" },
    "Every A-level Paper 2 has a floating-point question of 8–12 marks. In the AQA format the **mantissa and exponent are both two's complement**, the binary point sits after the mantissa's first (sign) bit, and the value is **mantissa × 2^exponent**. The parts are predictable:",
    { table: { head: ["Part", "Tariff", "Method that earns the working marks"], rows: [
      ["Which pattern is normalised / negative / smallest positive / most negative", "1 each", "Normalised: mantissa begins **01** (positive) or **10** (negative). Smallest positive: 0.1000… with the most negative exponent. Most negative: 1.0000… with the largest positive exponent"],
      ["Convert pattern → denary", "2", "State mantissa and exponent in denary (−0.625, 3), or show the point shifted; then value = mantissa × 2^exponent"],
      ["Convert denary → normalised pattern", "3", "1: fixed-point binary of the magnitude (58.5 = 111010.1). 2: two's complement it if negative. 3: exponent = places the point moved (6 → 0110). Then mantissa 0.1110101, exponent 0110"],
      ["Closest representable value (2024, 2025)", "3", "Write the exact binary, then **round or truncate to the mantissa width** — say which; state how many extra mantissa bits an exact representation would need"],
      ["Highest / lowest representable value", "3", "Highest: 0.111111 × 2^(max exp). Lowest: 1.000000 × 2^(max exp) = −2^max"],
      ["Absolute / relative error", "1 + 1", "Absolute = |stored − intended| (positive). Relative = absolute ÷ intended, as % if asked"],
      ["Why store normalised", "1–2", "Maximises precision for a given number of bits; gives each number a unique representation (easier equality tests)"],
      ["Fixed vs floating (2020, 2024)", "2", "Floating: greater **range** in the same bits / values closer to zero. Fixed: **faster** arithmetic, some values **more precisely**, constant absolute precision"]
    ]}},
    { callout: { t: "warn", body: "Working earns marks even when the answer is wrong — always write the mantissa and exponent in denary, and the shift direction. A **positive** exponent shifts the point **right**." }}
  ],
  flashcards: [
    ["In AQA floating point, where is the binary point?", "Immediately after the first (sign) bit of the mantissa; value = mantissa × 2^exponent, both two's complement.", 10],
    ["Advantages of floating point over fixed point?", "Greater range in the same number of bits; can represent numbers much closer to zero and much larger.", 18],
    ["Advantages of fixed point over floating point?", "Faster/simpler arithmetic; some numbers represented more precisely; constant (guaranteed) absolute precision.", 19]
  ],
  quiz: [
    { q: "Which mantissa is normalised?", opts: ["00110000", "01100000", "11100000", "00000000"], ans: 1, why: "Starts 01 (positive) — 10 would be negative normalised." },
    { q: "Mantissa 0.1101000, exponent 0100 equals:", opts: ["13", "6.5", "26", "3.25"], ans: 0, why: "0.8125 × 16 = 13." },
    { q: "Exponent 1101 (4-bit two's complement) is:", opts: ["13", "−3", "−5", "5"], ans: 1, why: "1101 is −8 + 4 + 1 = −3, as the top bit is worth −8." },
    { q: "The largest positive value with 8-bit mantissa and 4-bit exponent:", opts: ["0.1111111 × 2⁷", "0.1111111 × 2⁸", "1.0000000 × 2⁷", "0.1000000 × 2⁻⁸"], ans: 0, why: "Max mantissa, max exponent (0111 = 7)." },
    { q: "Fixed point beats floating point on:", opts: ["range of values for the same number of bits", "speed of arithmetic and constant precision", "precision for values very close to zero", "storing very large and very small numbers"], ans: 1, why: "2020/2024 mark scheme." },
    { q: "Unsigned fixed point 10011.011 is:", opts: ["19.375", "19.75", "19.125", "35.375"], ans: 0, why: "16 + 2 + 1 + 0.25 + 0.125." },
    { q: "Why normalise floating point numbers?", opts: ["To make the exponent small so numbers take less memory", "To maximise precision in the bits available and make each value unique", "To remove negative values so no sign bit is needed", "To increase the range by moving more of the number's digits into the exponent"], ans: 1, why: "2022/2025 mark scheme." },
    { qk: "150", q: "0011.1001 as unsigned fixed point binary is:", opts: ["3.0625", "3.5625", "3.1875", "57"], ans: 1, why: "0011 = 3; after the point 1001 = ½ + 1/16 = 0.5625, so 3.5625. 57 reads all eight bits as one integer." },
    { qk: "151", q: "5.75 in 4.4 fixed point binary is:", opts: ["0101.0111", "0101.1010", "0110.1100", "0101.1100"], ans: 3, why: "5 = 0101 and 0.75 = ½ + ¼ = .1100, so 0101.1100." },
    { qk: "152", q: "Mantissa 01101000, exponent 0110 (8-bit mantissa, 4-bit exponent) is:", opts: ["52", "26", "104", "0.8125"], ans: 0, why: "0.1101000 × 2⁶: move the point 6 places right to get 110100 = 52." },
    { qk: "153", q: "Mantissa 10110000, exponent 0011 (8-bit mantissa, 4-bit exponent) is:", opts: ["5", "−3", "−5", "−0.625"], ans: 2, why: "Mantissa 1.0110000 = −1 + ¼ + ⅛ = −0.625; × 2³ = −5." },
    { qk: "154", q: "Mantissa 0.1010000, exponent 0011 in denary is:", opts: ["0.625", "5", "2.5", "10"], ans: 1, why: "The mantissa is ½ + ⅛ = 0.625, and the exponent 3 multiplies it by 8: 5." },
    { qk: "155", q: "Mantissa 1.1010000, exponent 0010 in denary is:", opts: ["−6.5", "1.5", "−0.375", "−1.5"], ans: 3, why: "The mantissa is −1 + ½ + ⅛ = −0.375, and the exponent 2 multiplies it by 4: −1.5." },
    { qk: "156", q: "58.5 as a normalised floating point number (8-bit mantissa, 4-bit exponent) is:", opts: ["01110101 0101", "01110101 0110", "11101010 0110", "00111010 0111"], ans: 1, why: "58.5 = 111010.1 = 0.1110101 × 2⁶, so mantissa 01110101 and exponent 0110." },
    { qk: "157", q: "−23.25 as a normalised floating point number (8-bit mantissa, 4-bit exponent) is:", opts: ["11011101 0101", "01011101 0101", "10100011 0101", "10100011 0100"], ans: 2, why: "23.25 = 0.1011101 × 2⁵; negate the mantissa 01011101 to 10100011 (it starts 10, so it is normalised); the exponent is 5 = 0101." },
    { qk: "158", q: "0.15625 as a normalised floating point number (8-bit mantissa, 4-bit exponent) is:", opts: ["01010000 1110", "01010000 0010", "00101000 1111", "01010000 1101"], ans: 0, why: "0.15625 = 0.00101 = 0.101 × 2⁻², so mantissa 01010000 and exponent −2 = 1110. 00101000 1111 has the right value but is not normalised." },
    { qk: "159", q: "The two's complement fixed point pattern 101100.1011 in denary is:", opts: ["44.6875", "−19.3125", "−12.6875", "−19.6875"], ans: 1, why: "−32 + 8 + 4 + 0.5 + 0.125 + 0.0625 = −19.3125. 44.6875 reads the pattern as unsigned." },
    { qk: "160", q: "6.34375 in fixed point binary with 5 fraction bits is:", opts: ["110.01101", "110.10110", "110.01011", "101.01011"], ans: 2, why: "6 = 110 and 0.34375 = ¼ + 1/16 + 1/32 = .01011, so 110.01011." }
  ],
  exam: [
    { src: "AQA 2023 · P2 Q06", ctx: "A floating point system uses an 8-bit two's complement mantissa and a 4-bit two's complement exponent.",
      parts: [
        { q: "Calculate the denary value of mantissa `01101000`, exponent `1101`. Show your working.", marks: 2, ms: ["Mantissa = 0.8125 (13/16), exponent = −3 / binary point shifted 3 places left (1)", "0.1015625 (13/128) (1)"] },
        { q: "Represent −23.25 in this format, normalised. Show your working.", marks: 3, ms: ["23.25 = 10111.01 in fixed point binary (1)", "−23.25 = 101000.11 in two's complement / exponent is 5 (0101) as the point moves 5 places (1)", "Mantissa 10100011, exponent 0101 (1)"] },
        { q: "Name the type of error in each case: (i) a result so close to zero that it is stored as zero; (ii) a result too large to fit the available bits; (iii) a denary value that cannot be represented exactly.", marks: 2, ms: ["(i) underflow, (ii) overflow (1)", "(iii) rounding (accept truncation) — all three correct for 2 marks (1)"] },
        { q: "The 12 bits are to be reallocated to improve precision. Describe one way this could be done.", marks: 1, ms: ["Move one or more bits from the exponent to the mantissa (e.g. 9-bit mantissa, 3-bit exponent) / use an implicit bit in the mantissa (1)"] }
      ] },
    { src: "AQA 2024 · P2 Q04", ctx: "Same format: 8-bit mantissa, 4-bit exponent, both two's complement.",
      parts: [
        { q: "State the closest representation of 12.765625 in this system, showing your working.", marks: 3, ms: ["12.765625 = 1100.110001 in binary (1)", "Rounded/truncated to 7 significant bits: 1100.110; exponent 4 (0100) (1)", "Mantissa 01100110, exponent 0100 (1)"] },
        { q: "State how many additional mantissa bits would be needed to represent 12.765625 exactly.", marks: 1, ms: ["3 (1)"] },
        { q: "Calculate the most negative number the system can represent.", marks: 2, ms: ["Mantissa 10000000 (−1) with exponent 0111 (7) (1)", "−2⁷ = −128 (1)"] },
        { q: "State which of the following are true: (A) fixed point arithmetic is usually faster; (B) fixed point uses a mantissa and exponent; (C) in a given number of bits fixed point can represent positive numbers closer to zero than floating point; (D) fixed point can represent some numbers more precisely; (E) floating point has a bigger range in the same bits.", marks: 2, ms: ["A, D, E true (1)", "B, C false — all five correct for 2 marks (1)"] }
      ] },
    { src: "AQA 2020 · P2 Q02.4", q: "A floating point system has a 7-bit two's complement mantissa and a 5-bit two's complement exponent. Calculate the highest and lowest values it can represent, showing your working.", marks: 3,
      ms: ["Highest: mantissa 0.111111 (63/64) with exponent 01111 (15) (1)", "= 0.984375 × 2¹⁵ = 32 256 (1)", "Lowest: mantissa 1.000000 (−1) with exponent 01111 = −2¹⁵ = −32 768 (1)"] },
    { src: "AQA 2019 · P2 Q11.4", q: "A program multiplies two large floating point numbers and the result cannot be stored. Name the problem and describe how the number format could be changed to avoid it.", marks: 3,
      ms: ["Overflow — the exponent needed is larger than the available exponent bits can hold (1)", "Increase the number of bits allocated to the exponent (1)", "e.g. by reallocating bits from the mantissa to the exponent (at the cost of precision) (1)"] },
    { level: "AS", src: "AQA 2020 · P2 Q02.2", q: "Represent 6.34375 in fixed point binary using 3 bits for the integer part and 5 bits for the fractional part.", marks: 2,
      ms: ["Integer part 110 (1)", "Fractional part .01011 (0.25 + 0.0625 + 0.03125) (1)"] }
  ]
});

X("compsci:4.5.4.7", {
  flashcards: [
    ["What determines the range of a floating point number?", "The number of bits in the exponent."],
    ["What determines the precision?", "The number of bits in the mantissa."],
    ["Effect of moving a bit from mantissa to exponent?", "Range increases, precision decreases."],
    ["Largest positive value with 8-bit mantissa and 4-bit exponent?", "0.1111111 × 2⁷ = 127/128 × 128 = 127."],
    ["Smallest positive normalised value with an 8-bit mantissa and 4-bit exponent?", "0.1000000 × 2⁻⁸ = 0.5 × 1/256 = 1/512."],
    ["Why can a floating point system represent values closer to zero than fixed point?", "A negative exponent shifts the point left as far as the exponent allows; fixed point has a fixed number of fraction bits."],
    ["What is the trade-off in a fixed total number of bits?", "Range (exponent) versus precision (mantissa)."],
    ["How many bits does IEEE single precision use for mantissa and exponent?", "23 (plus implicit 1) and 8, with a sign bit — 32 in total."]
  ],
  quiz: [
    { q: "To increase range without adding bits you:", opts: ["move bits from exponent to mantissa", "move bits from mantissa to exponent", "normalise the mantissa and exponent", "switch to a fixed point representation"], ans: 1, why: "Exponent controls range." },
    { q: "Precision is governed by:", opts: ["exponent bits", "mantissa bits", "the sign bit", "the base"], ans: 1, why: "Significant figures." },
    { q: "With 4-bit two's complement exponent the maximum exponent is:", opts: ["15", "8", "7", "16"], ans: 2, why: "The largest 4-bit two's complement value is 0111 = 7, the most a positive exponent can be." },
    { q: "Smallest positive normalised mantissa is:", opts: ["0.0000001", "0.1000000", "0.1111111", "1.0000000"], ans: 1, why: "Normalised positive starts 01." },
    { q: "Doubling the exponent bits roughly:", opts: ["doubles the range", "squares the range", "halves precision", "changes nothing"], ans: 1, why: "2^(2ⁿ) grows enormously." },
    { q: "Fixed point with 4 fraction bits has absolute precision:", opts: ["1/16 everywhere", "varying with magnitude", "1/4", "unlimited"], ans: 0, why: "Constant absolute precision." }
  ],
  exam: [
    { src: "AQA 2019 · P2 Q11.1", q: "A floating point system uses an 8-bit two's complement mantissa and a 4-bit two's complement exponent. Calculate the smallest positive number it can represent, showing your working.", marks: 2,
      ms: ["Mantissa 01000000 (0.5) with exponent 1000 (−8) (1)", "0.5 × 2⁻⁸ = 1/512 = 0.001953125 (1)"] },
    { src: "AQA 2023 · P2 Q06.4", q: "A 12-bit floating point format is changed so that the exponent has 2 bits fewer and the mantissa 2 bits more. Describe the effect on the numbers that can be represented.", marks: 2,
      ms: ["The range of numbers is reduced (largest magnitude smaller; cannot get as close to zero) (1)", "The precision is increased — more significant bits, so values are represented more accurately (1)"] }
  ]
});

X("compsci:4.5.4.8", {
  flashcards: [
    ["What does normalised mean for a two's complement mantissa?", "It begins 01 (positive) or 10 (negative) — the first two bits differ.", 9],
    ["Why are floating point numbers normalised? (give two reasons)", "It maximises precision for a given number of bits (no leading redundant bits), and gives each number a unique representation, making equality tests simpler.", 10],
    ["Is 00110000 a normalised mantissa?", "No — it starts 00; shift left once to 01100000 and reduce the exponent by 1.", 12],
    ["Is 11000000 normalised?", "No — a negative normalised mantissa starts 10.", 13],
    ["Which is the smallest positive normalised mantissa?", "0.1000000 = 0.5.", 14],
    ["Which mantissa represents the most negative normalised value?", "1.0000000 = −1.", 15],
    ["What happens to precision if a number is stored un-normalised?", "Leading bits carry no information, so fewer significant bits remain — precision is lost.", 16]
  ],
  quiz: [
    { q: "Which is a negative normalised mantissa?", opts: ["11010000", "10110000", "01010000", "00110000"], ans: 1, why: "A normalised negative mantissa starts 10, so the sign bit is 1 and the next bit is 0." },
    { q: "Normalising 00010100 × 2⁴ gives:", opts: ["01010000 × 2²", "01010000 × 2⁶", "00010100 × 2²", "10100000 × 2²"], ans: 0, why: "Shift left 2, exponent 4 − 2." },
    { q: "Why does normalisation aid equality testing?", opts: ["values are converted to whole integers", "each value has one unique representation", "the sign bit is removed from every stored value", "values are rounded to the nearest bit"], ans: 1, why: "No alternative encodings." },
    { q: "Un-normalised storage wastes:", opts: ["exponent range", "mantissa precision", "space for the sign bit", "nothing at all"], ans: 1, why: "Leading redundant bits." },
    { q: "A mantissa of 0.1111111 is:", opts: ["un-normalised, since it starts 0.1", "normalised, the largest positive", "negative, since the bits are all ones", "normalised, the smallest positive"], ans: 1, why: "A positive normalised mantissa starts 01, and 0.1111111 is the largest such value." },
    { q: "Normalised negative mantissas begin with:", opts: ["11", "10", "01", "00"], ans: 1, why: "Normalised negative mantissas start 10: a sign bit of 1, then 0, which is what makes them normalised." },
    { qk: "150", q: "Normalising mantissa 00011010, exponent 0011 gives:", opts: ["01101000 0101", "00110100 0010", "01101000 0001", "11010000 0000"], ans: 2, why: "Shift the mantissa left 2 places to start 01 (01101000) and subtract 2 from the exponent: 3 − 2 = 1 (0001)." },
    { qk: "151", q: "13.5 as a normalised floating point number (8-bit mantissa, 4-bit exponent) is:", opts: ["01101100 0100", "01101100 0011", "00110110 0101", "11011000 0011"], ans: 0, why: "13.5 = 1101.1 = 0.11011 × 2⁴, so mantissa 01101100 and exponent 0100." },
    { qk: "152", q: "0.375 as a normalised floating point number (8-bit mantissa, 4-bit exponent) is:", opts: ["01100000 0001", "00110000 0000", "01100000 1110", "01100000 1111"], ans: 3, why: "0.375 = 0.011 = 0.11 × 2⁻¹, so mantissa 01100000 and exponent −1 = 1111." },
    { qk: "153", q: "−6.5 as a normalised floating point number (8-bit mantissa, 4-bit exponent) is:", opts: ["11101000 0011", "10011000 0011", "10011000 0100", "01101000 0011"], ans: 1, why: "6.5 = 0.1101 × 2³; negate the mantissa 01101000 to 10011000 (it starts 10, so it is normalised); the exponent is 3 = 0011." },
    { qk: "154", q: "0.0011 × 2⁵ normalised is:", opts: ["0.11 × 2⁷", "0.0011 × 2³", "0.11 × 2³", "1.1 × 2²"], ans: 2, why: "Shift the point right 2 places so the mantissa starts 0.1, and subtract 2 from the exponent: 0.11 × 2³." }
  ],
  exam: [
    { src: "AQA 2025 · P2 Q12", ctx: "Four bit patterns in an 8-bit mantissa / 4-bit exponent system: A = 01101000 0011, B = 00110100 0100, C = 10000000 0111, D = 10110000 0010.",
      parts: [
        { q: "State which pattern is not normalised.", marks: 1, ms: ["B — the mantissa begins 00 (1)"] },
        { q: "State which pattern represents the most negative normalised value.", marks: 1, ms: ["C (1)"] },
        { q: "Explain why floating point numbers are stored in normalised form.", marks: 1, ms: ["It maximises precision for a given number of bits / gives each number a unique representation (1)"] }
      ] },
    { src: "AQA 2022 · P2 Q05.2", q: "Explain two reasons why floating point numbers are stored in normalised form.", marks: 2,
      ms: ["Maximises the precision / accuracy available for a given number of bits (must reference the number of bits) (1)", "Each number has a unique representation, so testing two numbers for equality is simpler (1)"] }
  ]
});

})(KOS.content.extend);
