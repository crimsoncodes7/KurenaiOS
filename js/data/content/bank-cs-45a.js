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
    ["Convert 10110111 to hexadecimal.", "1011 = B, 0111 = 7 → B7."],
    ["Convert 193 to hexadecimal.", "193 = 12 × 16 + 1 → C1."],
    ["Convert 3E hex to denary.", "3 × 16 + 14 = 62."],
    ["Why do programmers use hexadecimal rather than binary?", "It is easier for humans to read, write and remember and less error-prone, because each hex digit represents four bits so numbers are much shorter, and conversion to binary is straightforward."],
    ["How many bits does one hex digit represent?", "Four (a nibble)."],
    ["How many hex digits represent one byte?", "Two."],
    ["Convert 2A hex to binary.", "0010 1010."],
    ["Which is largest: 1011010 (binary), 5A (hex), 91 (denary)?", "1011010₂ = 90; 5A₁₆ = 90; 91 is largest."]
  ],
  quiz: [
    { q: "11111111 in hexadecimal is:", opts: ["FF", "F0", "255", "EE"], ans: 0, why: "Two nibbles of 1111." },
    { q: "Hex 7C in denary is:", opts: ["124", "112", "120", "76"], ans: 0, why: "7 × 16 + 12." },
    { q: "Why is hex used in memory dumps rather than binary?", opts: ["It uses less memory", "It is shorter and easier for humans to read, converting simply to binary", "Computers store hex", "It is faster to process"], ans: 1, why: "Memory use is unchanged." },
    { q: "Denary 45 in hex:", opts: ["2D", "45", "3C", "2F"], ans: 0, why: "2 × 16 + 13." },
    { q: "Binary 1010 0011 in hex:", opts: ["A3", "AC", "93", "A5"], ans: 0, why: "1010 = A, 0011 = 3." },
    { q: "How many bits are needed to store two hex digits?", opts: ["4", "8", "16", "2"], ans: 1, why: "4 bits per digit." }
  ],
  exam: [
    { level: "AS", src: "AS 2019 P2 Q2", ctx: "A memory location holds the bit pattern `1101 0110`.",
      parts: [
        { q: "Write the bit pattern as a hexadecimal number.", marks: 1, ms: ["D6 (1)"] },
        { q: "Explain why programmers often use hexadecimal rather than binary when writing down bit patterns.", marks: 2, ms: ["Hexadecimal is shorter / easier for humans to read, write and remember and less prone to error (1)", "Because each hex digit corresponds to exactly four bits, conversion between the two is simple (1)"] }
      ] },
    { src: "AQA 2022 P2 Q1.1", q: "Convert the binary number `1 0111 1010` to hexadecimal, showing your method.", marks: 2,
      ms: ["Grouped into nibbles from the right: 0001 0111 1010 (1)", "17A (1)"] },
    { level: "AS", src: "AS 2018 P2 Q2.2", q: "Add the hexadecimal numbers `2B` and `19`, showing your working in binary, and give the answer in hexadecimal.", marks: 2,
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
    ["Most negative 12-bit two's complement value?", "−2048 (100000000000).", 11],
    ["Convert 11001010 (two's complement) to denary.", "−128 + 64 + 8 + 2 = −54.", 12],
    ["Convert −72 to 8-bit two's complement.", "72 = 01001000; flip → 10110111; +1 → 10111000.", 13],
    ["How do you negate a two's complement number?", "Invert every bit and add 1 (or copy from the right up to and including the first 1, then invert the rest).", 14],
    ["Compute 18 − 72 in 8-bit two's complement.", "00010010 + 10111000 = 11001010 = −54.", 15],
    ["Why is two's complement preferred to sign-and-magnitude?", "One representation of zero, and addition/subtraction use the same adder circuit with no special sign handling.", 16]
  ],
  quiz: [
    { q: "10000000 in 8-bit two's complement is:", opts: ["128", "−128", "−0", "0"], ans: 1, why: "MSB = −128." },
    { q: "The two's complement of 00010110 (22) is:", opts: ["11101001", "11101010", "10010110", "01101010"], ans: 1, why: "Flip → 11101001, +1 → 11101010 (−22)." },
    { q: "Range of 6-bit two's complement:", opts: ["−32 to 31", "−31 to 32", "0 to 63", "−64 to 63"], ans: 0, why: "−2⁵ to 2⁵ − 1." },
    { q: "01111111 + 00000001 in 8-bit two's complement gives:", opts: ["128", "−128 (overflow)", "0", "127"], ans: 1, why: "10000000 = −128 — signed overflow." },
    { q: "11111111 represents:", opts: ["255", "−1", "−127", "127"], ans: 1, why: "−128 + 127." },
    { q: "To compute 12 − 5 in 8-bit two's complement you add 00001100 to:", opts: ["00000101", "11111011", "11111010", "10000101"], ans: 1, why: "−5 = flip 00000101 → 11111010, +1 → 11111011; the sum 100000111 drops the carry → 00000111 = 7." }
  ],
  exam: [
    { level: "AS", src: "AS 2025 P2 Q2.5", q: "Using 8-bit two's complement, calculate `00101101 − 01001100` (45 − 76). Show the two's complement of the subtrahend, the addition, and the result in denary.", marks: 3,
      ms: ["Two's complement of 01001100 is 10110100 (1)", "00101101 + 10110100 = 11100001 (carry ignored) (1)", "= −31 (1)"] },
    { level: "AS", src: "AS 2023 P2 Q3.4", q: "State the range of denary values that can be represented by an 8-bit two's complement integer.", marks: 1,
      ms: ["−128 to +127 (1)"] },
    { src: "AQA 2022 P2 Q5.1", q: "Convert the two's complement value `11001101` to denary, showing your method.", marks: 2,
      ms: ["−128 + 64 + 8 + 4 + 1 (or flip and add 1 to get 00110011 = 51, so negative) (1)", "−51 (1)"] },
    { level: "AS", src: "AS 2018 P2 Q2.3", q: "State, in denary, the most negative value that can be represented using 12-bit two's complement, and give its bit pattern.", marks: 2,
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
    ["Convert mantissa 0.1010000, exponent 0011 to denary.", "Mantissa 0.625, exponent 3 → 0.625 × 8 = 5.", 11],
    ["Convert mantissa 1.0110000, exponent 0011 to denary.", "Mantissa −0.625, exponent 3 → −5.", 12],
    ["Represent 58.5 as a normalised floating point number (8-bit mantissa, 4-bit exponent).", "58.5 = 111010.1 → 0.1110101 × 2⁶ → mantissa 01110101, exponent 0110.", 13],
    ["Represent −23.25 (8-bit mantissa, 4-bit exponent).", "23.25 = 10111.01 → −23.25 = 101000.11 (two's complement) → 1.0100011 × 2⁵ → mantissa 10100011, exponent 0101.", 14],
    ["Represent 0.15625 (8-bit mantissa, 4-bit exponent).", "0.15625 = 0.00101 → 0.101 × 2⁻² → mantissa 01010000, exponent 1110.", 15],
    ["Convert the fixed point two's complement pattern 101100.1011 to denary.", "−32 + 8 + 4 + 0.5 + 0.125 + 0.0625 = −19.3125.", 16],
    ["Represent 6.34375 in fixed point binary with 5 fraction bits.", "110.01011.", 17],
    ["Advantages of floating point over fixed point?", "Greater range in the same number of bits; can represent numbers much closer to zero and much larger.", 18],
    ["Advantages of fixed point over floating point?", "Faster/simpler arithmetic; some numbers represented more precisely; constant (guaranteed) absolute precision.", 19]
  ],
  quiz: [
    { q: "Which mantissa is normalised?", opts: ["00110000", "01100000", "11100000", "00000000"], ans: 1, why: "Starts 01 (positive) — 10 would be negative normalised." },
    { q: "Mantissa 0.1101000, exponent 0100 equals:", opts: ["13", "6.5", "26", "3.25"], ans: 0, why: "0.8125 × 16 = 13." },
    { q: "Exponent 1101 (4-bit two's complement) is:", opts: ["13", "−3", "−5", "5"], ans: 1, why: "−8 + 4 + 1." },
    { q: "The largest positive value with 8-bit mantissa and 4-bit exponent:", opts: ["0.1111111 × 2⁷", "0.1111111 × 2⁸", "1.0000000 × 2⁷", "0.1000000 × 2⁻⁸"], ans: 0, why: "Max mantissa, max exponent (0111 = 7)." },
    { q: "Fixed point beats floating point on:", opts: ["range", "speed of arithmetic and constant precision", "values near zero", "storing large numbers"], ans: 1, why: "2020/2024 mark scheme." },
    { q: "Unsigned fixed point 10011.011 is:", opts: ["19.375", "19.75", "19.125", "35.375"], ans: 0, why: "16 + 2 + 1 + 0.25 + 0.125." },
    { q: "Why normalise floating point numbers?", opts: ["To make them smaller", "To maximise precision for a given number of bits and give a unique representation", "To avoid negatives", "To speed up storage"], ans: 1, why: "2022/2025 mark scheme." }
  ],
  exam: [
    { src: "AQA 2023 P2 Q6", ctx: "A floating point system uses an 8-bit two's complement mantissa and a 4-bit two's complement exponent.",
      parts: [
        { q: "Calculate the denary value of mantissa `01101000`, exponent `1101`. Show your working.", marks: 2, ms: ["Mantissa = 0.8125 (13/16), exponent = −3 / binary point shifted 3 places left (1)", "0.1015625 (13/128) (1)"] },
        { q: "Represent −23.25 in this format, normalised. Show your working.", marks: 3, ms: ["23.25 = 10111.01 in fixed point binary (1)", "−23.25 = 101000.11 in two's complement / exponent is 5 (0101) as the point moves 5 places (1)", "Mantissa 10100011, exponent 0101 (1)"] },
        { q: "Name the type of error in each case: (i) a result so close to zero that it is stored as zero; (ii) a result too large to fit the available bits; (iii) a denary value that cannot be represented exactly.", marks: 2, ms: ["(i) underflow, (ii) overflow (1)", "(iii) rounding (accept truncation) — all three correct for 2 marks (1)"] },
        { q: "The 12 bits are to be reallocated to improve precision. Describe one way this could be done.", marks: 1, ms: ["Move one or more bits from the exponent to the mantissa (e.g. 9-bit mantissa, 3-bit exponent) / use an implicit bit in the mantissa (1)"] }
      ] },
    { src: "AQA 2024 P2 Q4", ctx: "Same format: 8-bit mantissa, 4-bit exponent, both two's complement.",
      parts: [
        { q: "State the closest representation of 12.765625 in this system, showing your working.", marks: 3, ms: ["12.765625 = 1100.110001 in binary (1)", "Rounded/truncated to 7 significant bits: 1100.110; exponent 4 (0100) (1)", "Mantissa 01100110, exponent 0100 (1)"] },
        { q: "State how many additional mantissa bits would be needed to represent 12.765625 exactly.", marks: 1, ms: ["3 (1)"] },
        { q: "Calculate the most negative number the system can represent.", marks: 2, ms: ["Mantissa 10000000 (−1) with exponent 0111 (7) (1)", "−2⁷ = −128 (1)"] },
        { q: "State which of the following are true: (A) fixed point arithmetic is usually faster; (B) fixed point uses a mantissa and exponent; (C) in a given number of bits fixed point can represent positive numbers closer to zero than floating point; (D) fixed point can represent some numbers more precisely; (E) floating point has a bigger range in the same bits.", marks: 2, ms: ["A, D, E true (1)", "B, C false — all five correct for 2 marks (1)"] }
      ] },
    { src: "AQA 2020 P2 Q2.4", q: "A floating point system has a 7-bit two's complement mantissa and a 5-bit two's complement exponent. Calculate the highest and lowest values it can represent, showing your working.", marks: 3,
      ms: ["Highest: mantissa 0.111111 (63/64) with exponent 01111 (15) (1)", "= 0.984375 × 2¹⁵ = 32 256 (1)", "Lowest: mantissa 1.000000 (−1) with exponent 01111 = −2¹⁵ = −32 768 (1)"] },
    { src: "AQA 2019 P2 Q11.4", q: "A program multiplies two large floating point numbers and the result cannot be stored. Name the problem and describe how the number format could be changed to avoid it.", marks: 3,
      ms: ["Overflow — the exponent needed is larger than the available exponent bits can hold (1)", "Increase the number of bits allocated to the exponent (1)", "e.g. by reallocating bits from the mantissa to the exponent (at the cost of precision) (1)"] },
    { level: "AS", src: "AS 2020 P2 Q2.2", q: "Represent 6.34375 in fixed point binary using 3 bits for the integer part and 5 bits for the fractional part.", marks: 2,
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
    { q: "To increase range without adding bits you:", opts: ["add mantissa bits", "move bits from mantissa to exponent", "normalise", "use fixed point"], ans: 1, why: "Exponent controls range." },
    { q: "Precision is governed by:", opts: ["exponent bits", "mantissa bits", "the sign bit", "the base"], ans: 1, why: "Significant figures." },
    { q: "With 4-bit two's complement exponent the maximum exponent is:", opts: ["15", "8", "7", "16"], ans: 2, why: "0111." },
    { q: "Smallest positive normalised mantissa is:", opts: ["0.0000001", "0.1000000", "0.1111111", "1.0000000"], ans: 1, why: "Normalised positive starts 01." },
    { q: "Doubling the exponent bits roughly:", opts: ["doubles the range", "squares the range", "halves precision", "changes nothing"], ans: 1, why: "2^(2ⁿ) grows enormously." },
    { q: "Fixed point with 4 fraction bits has absolute precision:", opts: ["1/16 everywhere", "varying with magnitude", "1/4", "unlimited"], ans: 0, why: "Constant absolute precision." }
  ],
  exam: [
    { src: "AQA 2019 P2 Q11.1", q: "A floating point system uses an 8-bit two's complement mantissa and a 4-bit two's complement exponent. Calculate the smallest positive number it can represent, showing your working.", marks: 2,
      ms: ["Mantissa 01000000 (0.5) with exponent 1000 (−8) (1)", "0.5 × 2⁻⁸ = 1/512 = 0.001953125 (1)"] },
    { src: "AQA 2023 P2 Q6.4", q: "A 12-bit floating point format is changed so that the exponent has 2 bits fewer and the mantissa 2 bits more. Describe the effect on the numbers that can be represented.", marks: 2,
      ms: ["The range of numbers is reduced (largest magnitude smaller; cannot get as close to zero) (1)", "The precision is increased — more significant bits, so values are represented more accurately (1)"] }
  ]
});

X("compsci:4.5.4.8", {
  flashcards: [
    ["What does normalised mean for a two's complement mantissa?", "It begins 01 (positive) or 10 (negative) — the first two bits differ.", 9],
    ["Why are floating point numbers normalised? (give two reasons)", "It maximises precision for a given number of bits (no leading redundant bits), and gives each number a unique representation, making equality tests simpler.", 10],
    ["Normalise 0.0011 × 2⁵.", "0.11 × 2³ — shift the point right 2 places, subtract 2 from the exponent.", 11],
    ["Is 00110000 a normalised mantissa?", "No — it starts 00; shift left once to 01100000 and reduce the exponent by 1.", 12],
    ["Is 11000000 normalised?", "No — a negative normalised mantissa starts 10.", 13],
    ["Which is the smallest positive normalised mantissa?", "0.1000000 = 0.5.", 14],
    ["Which mantissa represents the most negative normalised value?", "1.0000000 = −1.", 15],
    ["What happens to precision if a number is stored un-normalised?", "Leading bits carry no information, so fewer significant bits remain — precision is lost.", 16]
  ],
  quiz: [
    { q: "Which is a negative normalised mantissa?", opts: ["11010000", "10110000", "01010000", "00110000"], ans: 1, why: "Starts 10." },
    { q: "Normalising 00010100 × 2⁴ gives:", opts: ["01010000 × 2²", "01010000 × 2⁶", "00010100 × 2²", "10100000 × 2²"], ans: 0, why: "Shift left 2, exponent 4 − 2." },
    { q: "Why does normalisation aid equality testing?", opts: ["values become integers", "each value has one unique representation", "it removes the sign", "it rounds"], ans: 1, why: "No alternative encodings." },
    { q: "Un-normalised storage wastes:", opts: ["exponent bits", "mantissa precision", "the sign bit", "nothing"], ans: 1, why: "Leading redundant bits." },
    { q: "A mantissa of 0.1111111 is:", opts: ["un-normalised", "normalised, the largest positive", "negative", "zero"], ans: 1, why: "Starts 01." },
    { q: "Normalised negative mantissas begin with:", opts: ["11", "10", "01", "00"], ans: 1, why: "1 sign, then 0." }
  ],
  exam: [
    { src: "AQA 2025 P2 Q12", ctx: "Four bit patterns in an 8-bit mantissa / 4-bit exponent system: A = 01101000 0011, B = 00110100 0100, C = 10000000 0111, D = 10110000 0010.",
      parts: [
        { q: "State which pattern is not normalised.", marks: 1, ms: ["B — the mantissa begins 00 (1)"] },
        { q: "State which pattern represents the most negative normalised value.", marks: 1, ms: ["C (1)"] },
        { q: "Explain why floating point numbers are stored in normalised form.", marks: 1, ms: ["It maximises precision for a given number of bits / gives each number a unique representation (1)"] }
      ] },
    { src: "AQA 2022 P2 Q5.2", q: "Explain two reasons why floating point numbers are stored in normalised form.", marks: 2,
      ms: ["Maximises the precision / accuracy available for a given number of bits (must reference the number of bits) (1)", "Each number has a unique representation, so testing two numbers for equality is simpler (1)"] }
  ]
});

})(KOS.content.extend);
