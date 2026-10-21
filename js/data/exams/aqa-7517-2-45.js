/* Kurenai OS — js/data/exams/aqa-7517-2-45.js
   AQA 7517 Paper 2, the exhaustive Companion (roadmap 5.8 phase 6,
   docs/exams-plan.md §13.2; invariant 130): 4.5 Fundamentals of data
   representation. AUTHORED. Every question and worked answer here is
   original, written by KurenaiOS in the board's style; real questions are
   referenced by series and number only (from the index), and every trap
   that cites a series paraphrases our own examiner's-report notes
   (tools/exam-index/reports/aqa-7517-2.md). Every number was checked by
   program before it was written.

   Shape (read by KOS.examDeep, js/core/examdeep.js):
     leaves[ref] = { archetypes: [{ id, title?, match?, rules, traps,
       variations: [{ v, t, m, q, code?, steps: [[text, marks, why]], trap?, methods? }] }],
       practice: [[difficulty 1–3, marks, question, [scheme lines "… (n)"], {code?, arch?}]] }
   A step's marks are AQA mark points, MP1 MP2 …, one mark each.        */
(function () {
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var D = X.deep = X.deep || {};
  var P = D["aqa-7517-2"] = D["aqa-7517-2"] || { leaves: {} };
  var L = P.leaves;

  /* ================= 4.5.1 Number systems ================= */
  L["4.5.1.1"] = {
    archetypes: [{
      id: "cs.number-sets",
      rules: ["Name the set exactly: natural (ℕ), integer (ℤ), rational (ℚ), irrational, real (ℝ).",
        "AQA's natural numbers start at 0: ℕ = {0, 1, 2, 3, …}.",
        "Every number you are given in this paper is real; say why it is NOT in the smaller set.",
        "Counting uses natural numbers, measuring uses reals, ordering uses ordinals."],
      traps: [],
      variations: [
        { v: "A", t: "Tick every set a number is in", m: 2,
          q: "Copy and complete the table: tick every set each number belongs to. Numbers: $-6$, $0.4$, $\\sqrt{3}$, $12$. Sets: natural, integer, rational, irrational, real.",
          steps: [["$12$: natural, integer, rational, real. $-6$: integer, rational, real (not natural: it is negative).", "MP1", "Both whole numbers correct across the row"],
            ["$0.4 = \\frac{2}{5}$: rational, real. $\\sqrt{3}$: irrational, real (it cannot be written as a fraction of integers).", "MP2", "Both non-integers correct, real ticked for both"]],
          trap: "Every one of the four is real. Leaving the real column blank for $\\sqrt{3}$ loses the second mark." },
        { v: "B", t: "Give a number in one set but not another", m: 1,
          q: "Give an example of a number that is an integer and rational, but is not a natural number.",
          steps: [["Any negative whole number, for example $-3$: it is $\\frac{-3}{1}$ so rational, but natural numbers are never negative.", "MP1", "A negative integer; 0 is natural in AQA's definition so it does not score"]] },
        { v: "C", t: "Choose the set for a use", m: 2,
          q: "State the most appropriate number set for (i) the number of seats booked on a train, (ii) the length of a train in metres.",
          steps: [["(i) Natural numbers: seats are counted, never negative or fractional.", "MP1", "Counting → natural"],
            ["(ii) Real numbers: a length is measured and can take any value, including irrational ones.", "MP2", "Measuring → real; rational is not accepted"]] },
        { v: "D", t: "Ordinal numbers in context", m: 2,
          q: "An array `scores` has its first element at index 0. Explain what is meant by an ordinal number, using `scores[2]` as an example.",
          steps: [["An ordinal number describes a position in an ordered list (first, second, third…).", "MP1", "Position, not quantity"],
            ["`scores[2]` is the element in the third position, because counting starts at index 0.", "MP2", "Applies it to the array with the zero start"]] }
      ]
    }],
    practice: [
      [1, 1, "State the symbol used for the set of integers.", ["ℤ (1)"]],
      [1, 1, "Give a real number that is not rational.", ["Any irrational, e.g. $\\pi$ or $\\sqrt{2}$ (1)"]],
      [2, 2, "Explain why $0.\\overline{3}$ (0.333… recurring) is a rational number.", ["It can be written as a fraction of two integers (1)", "$\\frac{1}{3}$ (1)"]],
      [2, 2, "State the most appropriate number set for (i) the number of goals scored in a match, (ii) the mass of a parcel in kg.", ["(i) natural (1)", "(ii) real (1)"]],
      [3, 3, "Explain the difference between an ordinal number and a natural number used for counting, with an example of each from a list of 10 names.", ["Ordinal: describes position in an order (1)", "Counting: how many items there are (1)", "e.g. the 3rd name vs there are 10 names (1)"]],
      [3, 2, "A program stores a distance as a whole number of millimetres instead of a real number of metres. Give one advantage and one disadvantage.", ["Advantage: exact storage / integer arithmetic has no rounding error / faster (1)", "Disadvantage: cannot store parts of a millimetre / range limited for very long distances (1)"]]
    ]
  };

  /* ================= 4.5.2 Number base ================= */
  L["4.5.2.1"] = {
    archetypes: [{
      id: "cs.hex",
      rules: ["\"Describe\" the conversion means words, not a worked example.",
        "Group binary into nibbles FROM THE RIGHT; pad the left group with zeros.",
        "Hex is a shorthand for people. The computer always stores binary.",
        "Show each base with a subscript when comparing: $9C_{16}$, $10011101_2$."],
      traps: [{ sitting: "2022-06", q: "Q01.1", text: "Asked to describe how to convert binary to hex, most did the conversion and scored nothing. Say: split into 4-bit groups from the right; turn each group into one hex digit." },
        { sitting: "2022-06", q: "Q01.2", text: "\"Hex uses fewer digits to store\" scores nothing: it is stored in binary. Hex is shorter and less error-prone for a person to read, write and remember." }],
      variations: [
        { v: "A", t: "Convert binary to hex", m: 1,
          q: "Convert the unsigned binary number $101101101110_2$ to hexadecimal.",
          steps: [["Split from the right into nibbles: 1011 0110 1110.", "", "The method; no mark on its own here"],
            ["1011 = 11 = B, 0110 = 6, 1110 = 14 = E, so $B6E_{16}$.", "MP1", "All three digits in order"]] },
        { v: "B", t: "Describe the method", m: 2,
          q: "Describe how an unsigned binary number can be converted directly to hexadecimal, without converting to decimal first.",
          steps: [["Split the binary number into groups of 4 bits, starting from the right (padding the leftmost group with 0s).", "MP1", "Nibbles, from the right"],
            ["Replace each group with the hex digit with the same value (0000 → 0 … 1111 → F).", "MP2", "Each group becomes ONE hex digit"]] },
        { v: "C", t: "Why hex, not binary", m: 1,
          q: "State one reason why hexadecimal is often used instead of binary to display memory contents.",
          steps: [["It is shorter, so it is easier for a person to read and remember, and fewer mistakes are made copying it.", "MP1", "A human reason; not \"saves storage\""]] },
        { v: "D", t: "Compare values across bases", m: 1,
          q: "Which is the largest value: $9C_{16}$, $10011101_2$ or $155_{10}$?",
          steps: [["$9C_{16} = 9 \\times 16 + 12 = 156$; $10011101_2 = 128 + 16 + 8 + 4 + 1 = 157$.", "", "Convert all to one base"],
            ["So $10011101_2$ is largest.", "MP1", "The binary value"]] }
      ]
    }],
    practice: [
      [1, 1, "Convert $3F_{16}$ to decimal.", ["$63$ (1)"]],
      [1, 1, "Convert $11010111_2$ to hexadecimal.", ["$D7$ (1)"]],
      [2, 2, "Convert $200_{10}$ to hexadecimal, showing your method.", ["$200 = 12 \\times 16 + 8$ or $11001000_2$ (1)", "$C8$ (1)"]],
      [2, 1, "Explain why hexadecimal is used for colour codes such as #FF8000 in web pages.", ["Each pair is one byte, so it is a short, readable way to write 24 bits (1)"]],
      [3, 2, "A 16-bit pattern is shown as $A0F3_{16}$. Write it in binary and state how many of its bits are 1.", ["1010 0000 1111 0011 (1)", "8 ones (1)"]],
      [3, 2, "Describe how to convert a hexadecimal number directly to binary.", ["Replace each hex digit with its 4-bit binary equivalent (1)", "Keep the groups in the same order / leading zeros of each group kept (1)"]]
    ]
  };

  /* ================= 4.5.3 Units ================= */
  L["4.5.3.1"] = {
    archetypes: [{
      id: "cs.units",
      rules: ["Kibi, mebi, gibi, tebi are powers of 2: $2^{10}$, $2^{20}$, $2^{30}$, $2^{40}$.",
        "Kilo, mega, giga, tera are powers of 10: $10^3$, $10^6$, $10^9$, $10^{12}$.",
        "$n$ bits give $2^n$ different values; to store $k$ values you need $\\lceil \\log_2 k \\rceil$ bits.",
        "Write the unit on every figure; a bare number may not score."],
      traps: [],
      variations: [
        { v: "A", t: "Convert between binary prefixes", m: 1,
          q: "How many kibibytes are there in 3 gibibytes? You may leave your answer as a power of 2 multiple.",
          steps: [["1 GiB = $2^{30}$ bytes and 1 KiB = $2^{10}$ bytes, so 1 GiB = $2^{20}$ KiB.", "", "One step between the prefixes is ×1024"],
            ["3 GiB = $3 \\times 2^{20}$ = 3,145,728 KiB.", "MP1", "Either form"]] },
        { v: "B", t: "How many values n bits can hold", m: 2,
          q: "(a) How many different values can be represented with 12 bits? (b) What is the minimum number of bits needed to give each of 300 products a unique code?",
          steps: [["(a) $2^{12} = 4096$.", "MP1", "Not 4095: that is the largest unsigned value"],
            ["(b) $2^8 = 256 < 300 \\le 512 = 2^9$, so 9 bits.", "MP2", "Smallest n with $2^n \\ge 300$"]] },
        { v: "C", t: "Decimal against binary prefixes", m: 2,
          q: "A drive is sold as 500 GB. Explain why the operating system may report it as about 465 GiB.",
          steps: [["The maker uses decimal prefixes: 500 GB = $500 \\times 10^9$ bytes.", "MP1", "GB is powers of 10"],
            ["The OS divides by $2^{30}$ = 1,073,741,824: $500 \\times 10^9 \\div 2^{30} \\approx 465.7$ GiB.", "MP2", "GiB is powers of 2, and a gibibyte is larger than a gigabyte"]] }
      ]
    }],
    practice: [
      [1, 1, "State how many bytes are in a mebibyte, as a power of 2.", ["$2^{20}$ (1)"]],
      [1, 1, "State how many different values can be represented by one byte.", ["256 (1)"]],
      [2, 1, "Convert 6 MiB to KiB.", ["6144 KiB (1)"]],
      [2, 2, "A school has 1,800 students. State the minimum number of bits for a unique student number, and explain.", ["11 bits (1)", "$2^{10} = 1024$ is too few; $2^{11} = 2048 \\ge 1800$ (1)"]],
      [3, 2, "Explain the difference between a kilobyte and a kibibyte.", ["Kilobyte = 1000 bytes / $10^3$ (1)", "Kibibyte = 1024 bytes / $2^{10}$ (1)"]],
      [3, 2, "A file is 2,097,152 bytes. Express its size in MiB and in MB.", ["2 MiB (1)", "about 2.10 MB (1)"]]
    ]
  };

  /* ================= 4.5.4 Unsigned binary ================= */
  L["4.5.4.1"] = {
    archetypes: [
      { id: "cs.unsigned",
        rules: ["Write the place values over the bits before adding them.",
          "The range of $n$ unsigned bits is $0$ to $2^n - 1$.",
          "Show the working: a wrong total with correct place values can still earn the method mark."],
        traps: [],
        variations: [
          { v: "A", t: "Binary to decimal", m: 1, q: "Convert the unsigned binary number $10110110_2$ to decimal.",
            steps: [["$128 + 32 + 16 + 4 + 2 = 182$.", "MP1", "Place values of the 1 bits added"]] },
          { v: "B", t: "Decimal to binary", m: 1, q: "Represent $203_{10}$ as an 8-bit unsigned binary number.",
            steps: [["$203 = 128 + 64 + 8 + 2 + 1$, so 11001011.", "MP1", "All eight bits"]] },
          { v: "C", t: "Range of n bits", m: 2, q: "State the range of values that can be represented in 10-bit unsigned binary, and the number of values.",
            steps: [["0 to $2^{10} - 1 = 1023$.", "MP1", "Both ends"], ["$2^{10} = 1024$ values.", "MP2", "Count includes zero"]] }
        ] },
      { id: "cs.binary-arith",
        rules: ["Show the carries above the sum; a carry out of the leftmost column is overflow in a fixed width.",
          "Multiply by shifting and adding the partial products, as in long multiplication.",
          "Check by converting to decimal, but the mark is for the binary."],
        traps: [],
        variations: [
          { v: "A", t: "Add two 8-bit numbers", m: 2, q: "Add the unsigned binary numbers 01101011 and 00111110. Show your working.",
            steps: [["Carries shown column by column from the right.", "MP1", "Working with carries"], ["10101001 (107 + 62 = 169).", "MP2", "Correct 8-bit result"]] },
          { v: "B", t: "Overflow on addition", m: 2, q: "Add 11001000 and 01000001 in 8-bit unsigned binary and explain the result.",
            steps: [["The sum is 1 00001001: a carry out of the eighth bit.", "MP1", "Result and the ninth bit"], ["Overflow: 200 + 65 = 265 is larger than 255, the largest 8-bit value, so the stored result 00001001 (9) is wrong.", "MP2", "Names overflow and why"]] },
          { v: "C", t: "Binary multiplication", m: 2, q: "Multiply the unsigned binary numbers 1011 and 101.",
            steps: [["Partial products: 1011 (for the 1), 0000 shifted one, 1011 shifted two: 1011 + 101100.", "MP1", "Shifted partial products"], ["110111 (11 × 5 = 55).", "MP2", "Correct result"]] },
          { v: "D", t: "Find the mistake", m: 1, q: "A student adds 0111 + 0011 and writes 1000. Identify the mistake.",
            steps: [["The carry into the second column was dropped: the correct answer is 1010 (7 + 3 = 10).", "MP1", "Names the column / the carry and the right answer"]] }
        ] }
    ],
    practice: [
      [1, 1, "Convert $01011101_2$ to decimal.", ["93 (1)"], { arch: "cs.unsigned" }],
      [1, 1, "What is the largest number that can be stored in 6-bit unsigned binary?", ["63 (1)"], { arch: "cs.unsigned" }],
      [2, 2, "Add 10011011 and 00110110 in 8-bit unsigned binary.", ["Carries shown (1)", "11010001 (1)"], { arch: "cs.binary-arith" }],
      [2, 2, "Multiply 1101 by 11 in binary.", ["Partial products 1101 and 11010 (1)", "100111 (1)"], { arch: "cs.binary-arith" }],
      [3, 2, "Explain what happens when 11110000 is added to 00100000 in an 8-bit register.", ["Result needs 9 bits / carry out of the MSB (1)", "Overflow: 240 + 32 = 272 > 255 so the register holds 00010000 / 16 (1)"], { arch: "cs.binary-arith" }],
      [3, 2, "State the minimum number of bits needed to store the unsigned value 1000, and the largest value those bits can store.", ["10 bits (1)", "1023 (1)"], { arch: "cs.unsigned" }]
    ]
  };

  /* ================= 4.5.4.3 Two's complement ================= */
  L["4.5.4.3"] = {
    archetypes: [{
      id: "cs.twos-complement",
      rules: ["The most significant bit has a NEGATIVE place value ($-128$ in 8 bits).",
        "To negate: invert every bit, then add 1 (or copy up to the first 1 from the right and invert the rest).",
        "Subtract by adding the two's complement of the second number; discard the carry out.",
        "Range of $n$ bits: $-2^{n-1}$ to $2^{n-1} - 1$."],
      traps: [],
      variations: [
        { v: "A", t: "Two's complement to decimal", m: 1, q: "The 8-bit two's complement number 11010110 is stored. What is its decimal value?",
          steps: [["$-128 + 64 + 16 + 4 + 2 = -42$.", "MP1", "MSB taken as −128"]] },
        { v: "B", t: "Decimal to two's complement", m: 2, q: "Represent $-77$ in 8-bit two's complement. Show your working.",
          steps: [["$+77$ = 01001101.", "MP1", "The positive first"], ["Invert → 10110010, add 1 → 10110011.", "MP2", "Check: $-128 + 32 + 16 + 2 + 1 = -77$"]] },
        { v: "C", t: "Subtraction by addition", m: 2, q: "Using 8-bit two's complement, calculate $25 - 60$. Show your working.",
          steps: [["$25$ = 00011001; $-60$: 00111100 → 11000011 + 1 = 11000100.", "MP1", "Both operands, the second negated"],
            ["00011001 + 11000100 = 11011101 = $-35$.", "MP2", "Sum in binary; decimal check optional"]],
          trap: "Subtracting in binary column by column is not what is asked: the method is ADD the two's complement." },
        { v: "D", t: "Range", m: 2, q: "State the most negative and the largest positive number that can be represented in 8-bit two's complement.",
          steps: [["Most negative: 10000000 = $-128$.", "MP1", ""], ["Largest: 01111111 = $127$.", "MP2", "The range is not symmetric"]] }
      ]
    }],
    practice: [
      [1, 1, "Convert the 8-bit two's complement number 10000101 to decimal.", ["$-123$ (1)"]],
      [1, 1, "Represent $-1$ in 8-bit two's complement.", ["11111111 (1)"]],
      [2, 2, "Represent $-100$ in 8-bit two's complement, showing your method.", ["$+100$ = 01100100 and invert/add 1 (1)", "10011100 (1)"]],
      [2, 2, "Using 8-bit two's complement, calculate $43 - 19$, showing the binary.", ["$-19$ = 11101101 (1)", "00101011 + 11101101 = 00011000 = 24, carry discarded (1)"]],
      [3, 2, "State the range of a 12-bit two's complement integer.", ["$-2048$ (1)", "to $2047$ (1)"]],
      [3, 2, "Two 8-bit two's complement numbers 01100100 and 00110010 are added. Explain why the result is wrong.", ["Sum 10010110 has MSB 1 so reads as negative ($-106$) (1)", "Overflow: $100 + 50 = 150 > 127$ (1)"]]
    ]
  };

  /* ================= 4.5.4.4 Fixed and floating point ================= */
  var FMT = "Use an 8-bit mantissa and a 4-bit exponent, both in two's complement; the binary point sits between the first and second bits of the mantissa.";
  L["4.5.4.4"] = {
    archetypes: [
      { id: "cs.fixed-point",
        rules: ["Write the place values over the bits first: in two's complement the leftmost is negative.",
          "The integer and fraction parts are ONE number: $-20 + 0.6875 = -19.3125$, not $-20.6875$.",
          "For a negative value: write the positive in fixed point, then take the two's complement of the whole pattern."],
        traps: [{ sitting: "2022-06", q: "Q05.1", text: "Two slips cost the marks: treating the top place as +32 instead of −32, and writing the negative integer part and the positive fraction side by side (−20.6875) instead of adding them (−19.3125)." }],
        variations: [
          { v: "A", t: "Unsigned fixed point to decimal", m: 1, q: "An unsigned fixed point number has 4 bits before and 4 bits after the binary point: 0101.1010. What is its decimal value?",
            steps: [["$4 + 1 + 0.5 + 0.125 = 5.625$.", "MP1", "Fraction places 0.5, 0.25, 0.125, 0.0625"]] },
          { v: "B", t: "Two's complement fixed point to decimal", m: 2, q: "A two's complement fixed point number has 5 bits before and 3 bits after the binary point: 10110.101. What is its decimal value?",
            steps: [["Place values $-16, 8, 4, 2, 1 . 0.5, 0.25, 0.125$.", "MP1", "MSB negative"],
              ["$-16 + 4 + 2 + 0.5 + 0.125 = -9.375$.", "MP2", "Integer and fraction added as one number"]] },
          { v: "C", t: "Negative decimal to fixed point", m: 2, q: "Represent $-5.75$ as an 8-bit two's complement fixed point number with 4 bits after the binary point.",
            steps: [["$+5.75$ = 0101.1100.", "MP1", "Positive first"], ["Invert and add 1 to the whole pattern: 1010.0011 + 0.0001 = 1010.0100.", "MP2", "Check: $-8 + 2 + 0.25 = -5.75$"]] },
          { v: "D", t: "Closest representation", m: 2, q: "Unsigned fixed point, 4 bits before and 4 after the point. Give the closest representation of 6.3 and its value.",
            steps: [["$6 = 0110$; the fraction 0.3 lies between 0.25 (.0100) and 0.3125 (.0101).", "MP1", "Brackets the fraction"],
              ["0.3125 is closer (0.0125 away against 0.05): 0110.0101 = 6.3125.", "MP2", "Pattern and its value"]] }
        ] },
      { id: "cs.float-to-dec",
        rules: [FMT, "Method: evaluate the exponent; move the point that many places (right if positive, left if negative); read the result as two's complement.",
          "When the point moves left past a negative mantissa, extend the sign with 1s.",
          "Show the shifted pattern: it earns the method mark if the arithmetic slips."],
        traps: [{ sitting: "2022-06", q: "Q05.3", text: "The point is moved the wrong way, or the exponent's sign is misread (+9 for 1001, which is −7). Shift right for a positive exponent, left for a negative one, and show the working." }],
        variations: [
          { v: "A", t: "Positive mantissa, positive exponent", m: 2, q: "Mantissa 0.1101000, exponent 0011. " + "Convert this floating point number to decimal.",
            steps: [["Exponent 0011 = $+3$: move the point 3 places right → 0110.1000.", "MP1", "Exponent and shift"], ["$4 + 2 + 0.5 = 6.5$.", "MP2", ""]] },
          { v: "B", t: "Negative exponent", m: 2, q: "Mantissa 0.1100000, exponent 1110. Convert to decimal.",
            steps: [["Exponent 1110 = $-2$: move the point 2 places left → 0.0011.", "MP1", "Negative exponent read correctly"], ["$0.125 + 0.0625 = 0.1875$.", "MP2", ""]] },
          { v: "C", t: "Negative mantissa", m: 2, q: "Mantissa 1.0110000, exponent 0100. Convert to decimal.",
            steps: [["Exponent $+4$: 1.0110000 → 10110.000.", "MP1", "Shift with the sign bit kept"], ["$-16 + 4 + 2 = -10$.", "MP2", ""]],
            methods: [{ name: "Method 1", rec: true, when: "Shift the point, then read two's complement. Fewest steps.", lines: [["Exponent $+4$ → 10110.000", "MP1"], ["$-16 + 4 + 2 = -10$", "MP2"]], slip: "Forgetting the leftmost place is negative gives $+22$." },
              { name: "Method 2", when: "Value the mantissa, then scale. Good as a check.", lines: [["Mantissa $= -1 + 0.25 + 0.125 = -0.625$", "MP1"], ["$-0.625 \\times 2^4 = -10$", "MP2"]] }] },
          { v: "D", t: "Negative mantissa, negative exponent", m: 2, q: "Mantissa 1.0100000, exponent 1111. Convert to decimal.",
            steps: [["Exponent $-1$: move left one place, extending the sign: 1.10100000.", "MP1", "Sign extension with a 1"], ["$-1 + 0.5 + 0.125 = -0.375$.", "MP2", ""]] }
        ] },
      { id: "cs.dec-to-float",
        rules: [FMT, "Write the number in fixed point first (for a negative, the two's complement of the positive).",
          "Normalise: move the point until the first two mantissa bits differ (01… or 10…); the exponent is how far it moved (left = positive).",
          "Pad the mantissa on the right with 0s to its full width; write the exponent in two's complement."],
        traps: [{ sitting: "2022-06", q: "Q05.3", to: "Q05.4", text: "For a negative value, write the POSITIVE in fixed point first and then take the two's complement. Writing −23 then appending .25 gives −22.75." },
          { sitting: "2023-06", q: "Q06.1", to: "Q06.2", text: "The same two traps a year later: the point moved the wrong way, and the negative built from a negative integer part plus a positive fraction. Convert the positive, then negate." }],
        variations: [
          { v: "A", t: "A positive whole number", m: 3, q: "Represent 13 as a normalised floating point number. " + FMT,
            steps: [["$13$ = 01101.0 in fixed point.", "MP1", "Fixed point form"], ["Normalise: 0.1101000 (the point moved 4 places left).", "MP2", "Mantissa starts 01"], ["Exponent $+4$ = 0100.", "MP3", ""]] },
          { v: "B", t: "A positive fraction", m: 3, q: "Represent 0.15625 as a normalised floating point number. " + FMT,
            steps: [["$0.15625 = 0.00101$ in binary.", "MP1", ""], ["Normalise: 0.1010000 (the point moved 2 places right).", "MP2", ""], ["Exponent $-2$ = 1110.", "MP3", "Negative exponent in two's complement"]] },
          { v: "C", t: "A negative number", m: 3, q: "Represent $-13.5$ as a normalised floating point number. " + FMT,
            steps: [["$+13.5$ = 01101.1; two's complement: 10010.1.", "MP1", "Negate the whole positive pattern"], ["Normalise to 1.0010100 (point moved 4 places left; starts 10).", "MP2", ""], ["Exponent $+4$ = 0100.", "MP3", "Check: $(-1 + 0.125 + 0.03125) \\times 16 = -13.5$"]] },
          { v: "D", t: "Closest representation", m: 3, q: "Give the closest normalised floating point representation of 9.3. " + FMT,
            steps: [["$9.3 = 1001.0100110…$; the exponent is $+4$ = 0100.", "MP1", "Fixed point form and exponent"], ["Seven bits after the point: 0.1001010 (= 9.25) or 0.1001011 (= 9.375).", "MP2", "Both neighbours"], ["9.25 is closer (0.05 away against 0.075): mantissa 0.1001010.", "MP3", "Chooses by distance"]] }
        ] }
    ],
    practice: [
      [1, 2, "Mantissa 0.1010000, exponent 0010 (" + "8-bit mantissa and 4-bit exponent, two's complement). Convert to decimal.", ["Exponent $+2$, point moved right: 010.10000 (1)", "2.5 (1)"], { arch: "cs.float-to-dec" }],
      [1, 1, "Convert the unsigned fixed point number 1001.0110 (4 bits after the point) to decimal.", ["9.375 (1)"], { arch: "cs.fixed-point" }],
      [2, 3, "Represent 27.5 as a normalised floating point number with an 8-bit mantissa and 4-bit exponent, both two's complement.", ["011011.1 / 11011.1 (1)", "Mantissa 0.1101110 (1)", "Exponent 0101 (1)"], { arch: "cs.dec-to-float" }],
      [2, 2, "Mantissa 1.0010000, exponent 1110 (8-bit and 4-bit, two's complement). Convert to decimal.", ["Point moved 2 left with sign extension: 1.1100100 (1)", "$-0.21875$ (1)"], { arch: "cs.float-to-dec" }],
      [2, 2, "Represent $-3.25$ as 8-bit two's complement fixed point with 4 bits after the point.", ["$+3.25$ = 0011.0100 (1)", "1100.1100 (1)"], { arch: "cs.fixed-point" }],
      [3, 3, "Represent $-48$ as a normalised floating point number with an 8-bit mantissa and 4-bit exponent, both two's complement.", ["$+48$ = 0110000 and two's complement 1010000 (1)", "Mantissa 1.0100000 (1)", "Exponent 0110 (1)"], { arch: "cs.dec-to-float" }],
      [3, 3, "Give the closest normalised floating point representation of 7.2 (8-bit mantissa, 4-bit exponent, two's complement), and its decimal value.", ["Exponent 0011 (1)", "Mantissa 0.1110011 (1)", "7.1875 (1)"], { arch: "cs.dec-to-float" }]
    ]
  };

  /* ================= 4.5.4.5 Errors ================= */
  L["4.5.4.5"] = {
    archetypes: [{
      id: "cs.errors",
      rules: ["Absolute error = |true value − stored value|: never negative.",
        "Relative error = absolute error ÷ TRUE value (× 100 for a percentage).",
        "Overflow: too large for the format. Underflow: too close to zero (smaller than the smallest positive). Rounding: no exact pattern exists.",
        "Give the units of the original value with an absolute error."],
      traps: [{ sitting: "2022-06", q: "Q05.5", text: "Three common slips: a negative absolute error, dividing by the stored value instead of the true one, and plain arithmetic errors. Write the formula first." },
        { sitting: "2023-06", q: "Q06.3", text: "Most could not name the errors. Overflow here is a number too big for the format, not a stack overflow." }],
      variations: [
        { v: "A", t: "Absolute error", m: 1, q: "The value 9.3 is stored as 9.25. Calculate the absolute error.",
          steps: [["$|9.3 - 9.25| = 0.05$.", "MP1", "Positive, from the true value"]] },
        { v: "B", t: "Relative error as a percentage", m: 2, q: "The value 9.3 is stored as 9.25. Calculate the relative error as a percentage, to three significant figures.",
          steps: [["$0.05 \\div 9.3$", "MP1", "Divides by the TRUE value"], ["$\\approx 0.00538 = 0.538\\%$.", "MP2", ""]] },
        { v: "C", t: "Name the error", m: 3, q: "A floating point system can store values from about $-128$ to $127$, and its smallest positive normalised value is $\\frac{1}{512}$. Name the error when it stores (i) 300, (ii) 0.0001, (iii) 0.1.",
          steps: [["(i) Overflow: larger than the largest value.", "MP1", ""], ["(ii) Underflow: closer to zero than the smallest positive value.", "MP2", ""], ["(iii) Rounding error: 0.1 has no exact binary representation (it recurs).", "MP3", ""]] },
        { v: "D", t: "Why relative error matters", m: 1, q: "Explain why relative error is often more useful than absolute error.",
          steps: [["It shows the error in proportion to the size of the value: 0.5 is large for a value of 1 but tiny for 10,000.", "MP1", "Proportion / compares across magnitudes"]] }
      ]
    }],
    practice: [
      [1, 1, "The value 45.7 is stored as 45.75. State the absolute error.", ["0.05 (1)"]],
      [1, 1, "Name the error that occurs when a calculation's result is too large to be represented.", ["Overflow (1)"]],
      [2, 2, "The value 12.6 is stored as 12.5. Calculate the relative error as a percentage to 3 s.f.", ["$0.1 \\div 12.6$ (1)", "0.794% (1)"]],
      [2, 2, "Explain why 0.2 cannot be represented exactly in binary floating point.", ["$\\frac{1}{5}$ is not a sum of powers of 2 / its binary recurs (0.0011…) (1)", "The mantissa has finitely many bits so it must be rounded (1)"]],
      [3, 2, "Explain what underflow is and when it can happen.", ["The result is too small (close to zero) to be represented (1)", "e.g. dividing a very small number by a large one / multiplying two very small numbers (1)"]],
      [3, 2, "Two measurements have absolute errors of 0.5 cm: one of a pencil (15 cm) and one of a room (500 cm). Compare their relative errors.", ["Pencil 3.3%, room 0.1% (1)", "The room's measurement is relatively far more accurate (1)"]]
    ]
  };

  /* ================= 4.5.4.7 Range and precision ================= */
  L["4.5.4.7"] = {
    archetypes: [{
      id: "cs.range-precision", title: "Range against precision: trade bits, fixed or floating",
      match: "trade|versus|fixed|extra mantissa|highest|lowest|smallest|most negative|true statements",
      rules: ["More mantissa bits → more precision; more exponent bits → more range.",
        "Floating point gives a far greater range for the same number of bits; fixed point gives the same absolute precision everywhere and faster, simpler arithmetic.",
        "Largest positive: mantissa 0.111…1 with the largest exponent. Most negative: 1.000…0 with the largest exponent."],
      traps: [{ sitting: "2023-06", q: "Q06.4", text: "To gain precision without more bits, take bits from the exponent for the mantissa, or don't store the bit after the sign: in a normalised number it is always the opposite of the sign bit." }],
      variations: [
        { v: "A", t: "Move bits between mantissa and exponent", m: 2, q: "A 16-bit floating point format changes from a 10-bit mantissa and 6-bit exponent to a 12-bit mantissa and 4-bit exponent. Explain the effect.",
          steps: [["Precision increases: more bits after the binary point.", "MP1", ""], ["Range decreases: the largest exponent drops from 31 to 7.", "MP2", ""]] },
        { v: "B", t: "Fixed against floating point", m: 2, q: "Give one advantage of floating point and one advantage of fixed point, for the same number of bits.",
          steps: [["Floating point: a much greater range of values.", "MP1", ""], ["Fixed point: arithmetic is simpler and faster / precision is the same across its range.", "MP2", ""]] },
        { v: "C", t: "Largest and most negative values", m: 2, q: "A format has a 6-bit mantissa and a 4-bit exponent, both two's complement. Give the largest positive and the most negative values it can store.",
          steps: [["Largest: 0.11111 × $2^7$ = $\\frac{31}{32} \\times 128 = 124$.", "MP1", "Largest mantissa, largest exponent"], ["Most negative: 1.00000 × $2^7$ = $-128$.", "MP2", ""]] },
        { v: "D", t: "Bits needed for an exact value", m: 1, q: "With a 4-bit exponent, how many mantissa bits are needed to store 5.828125 exactly?",
          steps: [["$5.828125 = 101.110101$ → 0.101110101 × $2^3$: a sign bit and 9 more, so 10 bits.", "MP1", "Counts the sign bit too"]] }
      ]
    }],
    practice: [
      [1, 1, "State the effect on precision of increasing the number of bits in the mantissa.", ["Precision increases (1)"]],
      [1, 1, "State the effect on range of increasing the number of bits in the exponent.", ["Range increases (1)"]],
      [2, 2, "An 8-bit mantissa and 4-bit exponent, both two's complement. State the largest positive value and the smallest positive normalised value.", ["127 (1)", "$\\frac{1}{512}$ (0.1 × $2^{-8}$) (1)"]],
      [2, 2, "Explain why a system storing money might use fixed point rather than floating point.", ["Pennies need a fixed number of decimal places / constant precision (1)", "Fixed point arithmetic is exact for these values and faster (1)"]],
      [3, 2, "Explain how a normalised format can gain one bit of precision without using more bits.", ["The bit after the sign bit is always the opposite of the sign bit (1)", "So it need not be stored / it is implied, freeing a bit for the mantissa (1)"]],
      [3, 3, "Compare floating point with fixed point for storing results of a physics simulation, giving three points.", ["Floating: very large and very small values both representable (1)", "Floating: precision relative to size of value (1)", "Fixed: faster but would overflow or lose small values (1)"]]
    ]
  };

  /* ================= 4.5.4.8 Normalisation ================= */
  L["4.5.4.8"] = {
    archetypes: [{
      id: "cs.float-theory",
      rules: ["Normalised: the first two mantissa bits differ — 01… for positive, 10… for negative.",
        "To normalise, shift the mantissa left and subtract 1 from the exponent for each place.",
        "Why normalise: the most precision for the bits available, and one unique representation per value."],
      traps: [{ sitting: "2022-06", q: "Q05.2", text: "\"More accurate\" or \"easier to read\" score nothing. The marks are for maximum precision for the bits available, and a unique representation (so equality tests are simple)." },
        { sitting: "2023-06", q: "Q06.4", text: "A normalised mantissa always has its second bit opposite to the sign bit, so it can be implied instead of stored." }],
      variations: [
        { v: "A", t: "Is it normalised? Normalise it", m: 2, q: "Mantissa 0.0110000, exponent 0011 (8-bit and 4-bit, two's complement). Explain why it is not normalised and normalise it.",
          steps: [["The first two bits are both 0, so it is not normalised.", "MP1", ""], ["Shift left once: mantissa 0.1100000, exponent 0010 (value 3 both ways).", "MP2", "Exponent reduced by 1"]] },
        { v: "B", t: "Normalise a negative", m: 2, q: "Mantissa 1.1101000, exponent 0101. Normalise it.",
          steps: [["Shift left until it starts 10: two places → 1.0100000.", "MP1", ""], ["Exponent $5 - 2 = 3$ = 0011 (value $-6$ both ways).", "MP2", ""]] },
        { v: "C", t: "Why normalise", m: 2, q: "Explain why floating point numbers are normally stored in normalised form.",
          steps: [["It gives the maximum precision for the number of bits in the mantissa (no wasted leading bits).", "MP1", ""], ["Each value has only one representation, so comparisons are simple.", "MP2", ""]] },
        { v: "D", t: "Spot the normalised pattern", m: 1, q: "Which of these mantissas is normalised: 0.0101, 1.1011, 1.0110, 0.0011?",
          steps: [["1.0110: its first two bits differ.", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "State the first two bits of a normalised negative mantissa.", ["10 (1)"]],
      [1, 1, "Which pattern is not normalised: 0.1011 or 0.0101?", ["0.0101 (1)"]],
      [2, 2, "Normalise mantissa 0.0011010, exponent 0100.", ["Mantissa 0.1101000 (1)", "Exponent 0010 (1)"]],
      [2, 2, "Normalise mantissa 1.1110100, exponent 0011.", ["Mantissa 1.0100000 (1)", "Exponent 0000 (1)"]],
      [3, 2, "Give two reasons for storing floating point numbers normalised.", ["Maximum precision for the bits (1)", "Unique representation / simpler comparison (1)"]],
      [3, 2, "State the smallest positive normalised value with an 8-bit mantissa and 4-bit exponent, both two's complement, and show its pattern.", ["0.1000000 with exponent 1000 (1)", "$0.5 \\times 2^{-8} = \\frac{1}{512}$ (1)"]]
    ]
  };

  /* ================= 4.5.5 Character codes ================= */
  L["4.5.5.1"] = {
    archetypes: [{
      id: "cs.char-codes",
      rules: ["ASCII is 7-bit (128 codes); extended ASCII 8-bit. Unicode covers every writing system and symbols.",
        "Character codes for '0'–'9' run 48–57: the code of a digit is NOT its value (subtract 48).",
        "Letters are in order: 'A' = 65 … 'Z' = 90, 'a' = 97, so a case change is ±32."],
      traps: [],
      variations: [
        { v: "A", t: "Why Unicode", m: 2, q: "Explain why Unicode was introduced as an alternative to ASCII.",
          steps: [["ASCII's 7 bits give only 128 codes: not enough for other alphabets, symbols and emoji.", "MP1", ""], ["Unicode gives every character in every language a unique code, so text is shared correctly between systems worldwide.", "MP2", ""]] },
        { v: "B", t: "Character code against value", m: 2, q: "The character '7' is stored using ASCII. Explain why its code is not 7, and how a program gets the value 7 from it.",
          steps: [["Its code is 55: digits are characters, coded from 48 for '0'.", "MP1", ""], ["Subtract the code of '0' (48): $55 - 48 = 7$.", "MP2", ""]] },
        { v: "C", t: "Code arithmetic", m: 1, q: "The ASCII code for 'C' is 67. What is the code for 'h'?",
          steps: [["'c' is $67 + 32 = 99$; 'h' is 5 letters later: 104.", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "How many different characters can 7-bit ASCII represent?", ["128 (1)"]],
      [1, 1, "The code for 'A' is 65. What is the code for 'D'?", ["68 (1)"]],
      [2, 2, "Give one advantage and one disadvantage of Unicode compared with ASCII.", ["Advantage: many more characters / all languages (1)", "Disadvantage: may need more bits per character / larger files (1)"]],
      [2, 1, "The ASCII code of 'a' is 97. Write it in 8-bit binary.", ["01100001 (1)"]],
      [3, 2, "Explain how converting a lower-case letter's ASCII code to upper case can be done with a single bit operation.", ["Upper and lower case differ by 32 / bit 5 (1)", "AND with 11011111 (or subtract 32) clears that bit (1)"]],
      [3, 2, "A program reads the digits \"42\" as two characters. Explain how it computes the number 42.", ["Each code minus 48 gives 4 and 2 (1)", "$4 \\times 10 + 2 = 42$ (1)"]]
    ]
  };

  /* ================= 4.5.5.3 Error checking ================= */
  L["4.5.5.3"] = {
    archetypes: [{
      id: "cs.error-check",
      rules: ["Even parity: the parity bit makes the number of 1s even (odd parity: odd).",
        "Parity detects any odd number of flipped bits; it never corrects and misses an even number.",
        "Majority voting sends each bit three (or an odd number of) times and takes the most common.",
        "A checksum or check digit is calculated from the data by an agreed algorithm; the receiver recalculates and compares."],
      traps: [{ sitting: "2023-06", q: "Q02.2", text: "\"Checks the data is correct\" is too vague. Say it detects data changed in transit, calculated from the payload by an algorithm the receiver repeats and compares." },
        { sitting: "2023-06", q: "Q10.3", text: "Parity's limit is an EVEN number of flipped bits going undetected (and it cannot correct). \"Multi-bit errors\" is wrong: three flips are caught." }],
      variations: [
        { v: "A", t: "Add a parity bit", m: 1, q: "The 7-bit ASCII code 1001101 is to be sent with an even parity bit as the most significant bit. Write the 8 bits sent.",
          steps: [["There are four 1s, already even, so the parity bit is 0: 01001101.", "MP1", ""]] },
        { v: "B", t: "Which frames are valid", m: 1, q: "Even parity is used. Which of these bytes contain an error: 10110100, 11100011, 01111110?",
          steps: [["Count the 1s: 4 (even), 5 (odd), 6 (even). Only 11100011 has an error.", "MP1", ""]] },
        { v: "C", t: "Majority voting", m: 2, q: "Majority voting sends each bit three times. The receiver gets 111 010 001 110. What data is accepted, and why is this better than parity?",
          steps: [["Majority of each group: 1, 0, 0, 1 → 1001.", "MP1", ""], ["Single-bit errors in a group are corrected, not just detected.", "MP2", "Trade-off: three times the data sent"]] },
        { v: "D", t: "Check digits and checksums", m: 2, q: "Explain how a checksum is used to detect errors in a transmitted packet.",
          steps: [["The sender calculates a value from the data with an agreed algorithm and sends it with the data.", "MP1", ""], ["The receiver recalculates from the received data; if the values differ, the data changed in transit (and is requested again).", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Add an odd parity bit (as MSB) to the 7-bit code 1010101.", ["11010101 (1)"]],
      [1, 1, "State one limitation of a single parity bit.", ["An even number of errors is not detected / it cannot correct (1)"]],
      [2, 2, "Majority voting: the receiver gets 101 111 000 100. State the data accepted.", ["Groups → 1, 1, 0, 0 (1)", "1100 (1)"]],
      [2, 2, "A check digit is the sum of the digits of 4721 mod 10. Calculate it and explain how a typed 4712 would be detected.", ["$4 + 7 + 2 + 1 = 14$ → 4 (1)", "4712 also sums to 14 so a swap is NOT detected; a weighted sum is needed (1)"]],
      [3, 2, "Give one advantage and one disadvantage of majority voting compared with a parity bit.", ["Advantage: corrects errors (1)", "Disadvantage: three times as much data sent (1)"]],
      [3, 2, "Explain why a checksum cannot show that data was correct when it was first sent.", ["It is calculated from whatever the sender had (1)", "So it only shows whether the data changed between sending and receiving (1)"]]
    ]
  };

  /* ================= 4.5.6 Sound, images, compression, encryption ================= */
  L["4.5.6.1"] = {
    archetypes: [{
      id: "cs.sampling",
      rules: ["An ADC samples the analogue signal's amplitude at regular intervals and quantises each sample to the nearest level, stored as binary.",
        "Recording uses an ADC; playback uses a DAC.",
        "Sampling rate: samples per second (Hz). Sample resolution: bits per sample."],
      traps: [{ sitting: "2023-06", q: "Q01.3", text: "About half wrote ADC. Turning the binary back into a waveform for the speaker is a DAC." }],
      variations: [
        { v: "A", t: "How an ADC works", m: 2, q: "Describe the principles of operation of an analogue to digital converter (ADC).",
          steps: [["The analogue signal's amplitude is measured (sampled) at regular time intervals.", "MP1", ""], ["Each sample is quantised to the nearest of the available levels and stored as a binary number.", "MP2", ""]] },
        { v: "B", t: "Quantisation error and the fix", m: 2, q: "Explain what is meant by quantisation error and one way to reduce it.",
          steps: [["The difference between a sample's true amplitude and the level it is rounded to.", "MP1", ""], ["Increase the sample resolution (more bits, more levels, smaller steps).", "MP2", "Not \"sample more often\": that is the rate"]] },
        { v: "C", t: "Why the file misrepresents the sound", m: 2, q: "Explain why a sampled sound file cannot exactly represent the original analogue sound.",
          steps: [["Only the amplitude at each sample time is kept; changes between samples are lost.", "MP1", ""], ["Each sample is rounded to a level (quantisation), so amplitudes are approximate.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Name the component that converts digital sound data into an analogue signal for a speaker.", ["DAC / digital to analogue converter (1)"]],
      [1, 1, "Define sample resolution.", ["The number of bits used to store each sample (1)"]],
      [2, 2, "Explain the effect on sound quality and file size of increasing the sampling rate.", ["More samples a second so the waveform is followed more closely (1)", "File size increases (1)"]],
      [2, 2, "Describe what happens to each sample in an ADC after it is measured.", ["Rounded/quantised to the nearest level (1)", "Stored as the binary code of that level (1)"]],
      [3, 3, "Explain why digital data is said to be discrete while analogue data is continuous, using sound as the example.", ["Analogue: amplitude can take any value at any time (1)", "Digital: values only at sample times (1)", "and only from a fixed set of levels (1)"]],
      [3, 2, "A recording sounds noisy at low volume. Explain how sample resolution could cause this.", ["Few levels so quiet sounds are rounded to only a few values (1)", "Large quantisation error relative to the signal (1)"]]
    ]
  };

  L["4.5.6.7"] = {
    archetypes: [{
      id: "cs.sound-calc",
      rules: ["Size (bits) = sampling rate × sample resolution × seconds (× channels).",
        "Then ÷ 8 for bytes, ÷ 1024 for KiB, ÷ 1024 again for MiB (or ÷ 1000 steps for kB, MB).",
        "Nyquist: sample at least twice the highest frequency in the sound.",
        "Write the formula with the numbers in it: it earns the method mark."],
      traps: [{ sitting: "2023-06", q: "Q01.1", text: "Usually 1 of 2: dividing by 1000 instead of 1024 for mebibytes, or forgetting ÷ 8 to go from bits to bytes." },
        { sitting: "2022-06", q: "Q10.1", text: "Working back from a file size, MB → bytes is × 1,000,000 (not × 1,000)." }],
      variations: [
        { v: "A", t: "File size in MiB", m: 2, q: "A mono recording lasts 30 seconds at 48,000 samples per second and 16 bits per sample. Calculate its size in MiB, to 2 decimal places.",
          steps: [["$48000 \\times 16 \\times 30 = 23{,}040{,}000$ bits = 2,880,000 bytes.", "MP1", "Formula and ÷ 8"], ["$2880000 \\div 1024 \\div 1024 \\approx 2.75$ MiB.", "MP2", "Two divisions by 1024"]] },
        { v: "B", t: "Duration from a file size", m: 3, q: "A stereo file is 10.5 MB. It was sampled at 44,100 Hz with 16-bit samples. Calculate its duration to the nearest second.",
          steps: [["$10.5 \\times 1{,}000{,}000 \\times 8 = 84{,}000{,}000$ bits.", "MP1", "MB → bits"], ["Bits a second: $44100 \\times 16 \\times 2 = 1{,}411{,}200$.", "MP2", "Two channels"], ["$84000000 \\div 1411200 \\approx 59.5$, so 60 seconds (about 1 minute).", "MP3", ""]] },
        { v: "C", t: "Nyquist", m: 1, q: "A sound contains frequencies up to 9 kHz. State the minimum sampling rate to record it faithfully.",
          steps: [["$2 \\times 9000 = 18{,}000$ Hz.", "MP1", "Twice the highest frequency"]] },
        { v: "D", t: "Resolution from levels or size", m: 2, q: "(a) An ADC divides the amplitude into 64 levels. State the sample resolution. (b) A 10-second mono clip at 8000 Hz is 120,000 bytes. Find its sample resolution.",
          steps: [["(a) $2^6 = 64$, so 6 bits.", "MP1", ""], ["(b) $120000 \\times 8 \\div (8000 \\times 10) = 12$ bits.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "State the minimum sampling rate for a sound whose highest frequency is 4 kHz.", ["8 kHz / 8000 Hz (1)"]],
      [1, 1, "How many levels can a 12-bit sample resolution distinguish?", ["4096 (1)"]],
      [2, 2, "Calculate the size in KiB of 5 seconds of mono sound at 8000 Hz and 8 bits per sample.", ["$8000 \\times 8 \\times 5 \\div 8 = 40000$ bytes (1)", "$\\approx 39.06$ KiB (1)"]],
      [2, 2, "A stereo track: 3 minutes, 44.1 kHz, 16-bit. Calculate its size in MB to 1 d.p.", ["$44100 \\times 16 \\times 2 \\times 180 \\div 8$ (1)", "31.8 MB (1)"]],
      [3, 3, "A 4 MiB budget holds a mono recording at 22,050 Hz with 16-bit samples. Calculate the maximum length in seconds to the nearest second.", ["$4 \\times 1024 \\times 1024 \\times 8 = 33{,}554{,}432$ bits (1)", "Bits per second $22050 \\times 16 = 352{,}800$ (1)", "95 seconds (1)"]],
      [3, 2, "Explain why sampling a 15 kHz tone at 20 kHz gives a poor recording.", ["Below the Nyquist rate of 30 kHz (1)", "Too few samples per cycle, so the tone is misrepresented / aliased (1)"]]
    ]
  };

  L["4.5.6.8"] = {
    archetypes: [{
      id: "cs.midi",
      rules: ["MIDI stores event MESSAGES, not sound: note on/off, the note (pitch), velocity (how hard), the instrument or channel, and timing.",
        "Advantages: much smaller files; easy to edit (change a note, the tempo or the instrument); no loss of quality from editing.",
        "Disadvantage: it cannot store real recorded sound such as a voice."],
      traps: [],
      variations: [
        { v: "A", t: "How MIDI represents music", m: 3, q: "Describe how MIDI represents a piece of music.",
          steps: [["As a sequence of event messages, e.g. note on and note off.", "MP1", ""], ["Each message gives data such as the note's pitch and its velocity/volume.", "MP2", ""], ["Messages carry the instrument/channel and timing, so the device synthesises the sound when played.", "MP3", ""]] },
        { v: "B", t: "Why MIDI is smaller", m: 2, q: "Explain why a MIDI file is usually much smaller than a sampled recording of the same music.",
          steps: [["MIDI stores only the instructions to play each note.", "MP1", ""], ["A sampled file stores thousands of amplitude samples every second whether or not anything changes.", "MP2", ""]] },
        { v: "C", t: "Advantages for a composer", m: 3, q: "Give three advantages to a composer of using MIDI rather than sampled sound.",
          steps: [["Individual notes can be edited without re-recording.", "MP1", ""], ["The instrument can be changed for a part.", "MP2", ""], ["The tempo can be changed without changing the pitch / files are small to share.", "MP3", ""]] }
      ]
    }],
    practice: [
      [1, 1, "State one item of data in a MIDI note-on message.", ["Pitch / note number / velocity / channel (1)"]],
      [1, 1, "Give one type of sound MIDI cannot store.", ["Real recorded sound, e.g. speech or a singer (1)"]],
      [2, 2, "Explain what the velocity value in a MIDI message represents and why it is useful.", ["How hard/fast the key was pressed (1)", "Controls loudness/expression of the note (1)"]],
      [2, 2, "Give two disadvantages of MIDI compared with sampled sound.", ["Cannot store vocals/real sounds (1)", "Sound depends on the playback device's synthesiser (1)"]],
      [3, 3, "A band wants to send a draft song to a producer by email. Compare sending MIDI and sending a sampled recording.", ["MIDI much smaller so quick to send (1)", "MIDI can be edited note by note by the producer (1)", "Sampled keeps the real performance/vocals and sounds the same on any device (1)"]],
      [3, 2, "Explain how a MIDI file can be played at a slower tempo without changing the pitch.", ["Timing data in the messages is scaled (1)", "The notes' pitch values are unchanged (1)"]]
    ]
  };

  L["4.5.6.4"] = {
    archetypes: [
      { id: "cs.bitmap",
        rules: ["Bitmap size (bits) = width × height × colour depth; metadata is extra.",
          "Colour depth $n$ bits → $2^n$ colours; $k$ colours need $\\lceil \\log_2 k \\rceil$ bits.",
          "Resolution is the number of pixels (width × height), or pixels per inch for a display."],
        traps: [],
        variations: [
          { v: "A", t: "File size of a bitmap", m: 2, q: "Calculate the size in bytes of a 40 × 30 pixel bitmap using 8 colours, ignoring metadata.",
            steps: [["8 colours need 3 bits.", "MP1", ""], ["$40 \\times 30 \\times 3 = 3600$ bits = 450 bytes.", "MP2", ""]] },
          { v: "B", t: "Colour depth from the file size", m: 3, q: "A 200 × 100 bitmap is 15,000 bytes, ignoring metadata. Calculate its colour depth and the number of colours.",
            steps: [["$15000 \\times 8 = 120{,}000$ bits.", "MP1", ""], ["$120000 \\div (200 \\times 100) = 6$ bits per pixel.", "MP2", ""], ["$2^6 = 64$ colours.", "MP3", ""]] },
          { v: "C", t: "How many images fit", m: 2, q: "Each photo is 5000 × 4000 pixels with 24-bit colour. How many fit on a 32 GB card (1 GB = $10^9$ bytes), ignoring metadata?",
            steps: [["One photo: $5000 \\times 4000 \\times 3 = 60{,}000{,}000$ bytes.", "MP1", ""], ["$32 \\times 10^9 \\div 6 \\times 10^7 = 533.3$ → 533 photos.", "MP2", "Round DOWN: a part photo does not fit"]] },
          { v: "D", t: "Metadata", m: 2, q: "Give two items of metadata stored with a bitmap and why it is needed.",
            steps: [["e.g. width, height, colour depth (also date, camera).", "MP1", "Two items"], ["Without them the bits could not be decoded into rows of pixels.", "MP2", ""]] }
        ] },
      { id: "cs.vector-graphics",
        rules: ["A vector image is a list of objects, each with properties: type (circle, line…), coordinates, size, line colour, line width, fill colour.",
          "Vector: scales without losing quality; often smaller for simple drawings; objects editable separately.",
          "Bitmap: suits photographs and complex natural images."],
        traps: [],
        variations: [
          { v: "A", t: "How a vector graphic is stored", m: 3, q: "Describe how a vector graphic of a red circle with a black outline is represented.",
            steps: [["As an object (a circle) in a list of drawing objects.", "MP1", ""], ["With properties: centre coordinates and radius.", "MP2", ""], ["And its fill colour (red), line colour (black) and line thickness.", "MP3", ""]] },
          { v: "B", t: "Why the vector file is smaller", m: 2, q: "A company logo is a few simple shapes. Explain why its vector file is much smaller than its bitmap.",
            steps: [["The vector stores only a few objects with a few properties each.", "MP1", ""], ["The bitmap stores the colour of every pixel, however simple the image.", "MP2", ""]] },
          { v: "C", t: "Choose and justify", m: 2, q: "Give two advantages of vector graphics over bitmaps for a logo printed on business cards and on a billboard.",
            steps: [["Scales to any size with no pixelation/loss of quality.", "MP1", ""], ["Each shape can be edited separately / small file.", "MP2", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "State the number of colours available with a colour depth of 5 bits.", ["32 (1)"], { arch: "cs.bitmap" }],
      [1, 1, "Name two properties stored for a line in a vector graphic.", ["Two of: start/end coordinates, colour, thickness (1)"], { arch: "cs.vector-graphics" }],
      [2, 2, "Calculate the size in KiB of a 64 × 64 bitmap with 256 colours.", ["$64 \\times 64 \\times 8 \\div 8 = 4096$ bytes (1)", "4 KiB (1)"], { arch: "cs.bitmap" }],
      [2, 2, "Explain why a photograph is usually stored as a bitmap rather than a vector graphic.", ["Photos have complex continuously varying colour (1)", "Would need very many objects / not practical as shapes (1)"], { arch: "cs.vector-graphics" }],
      [3, 3, "A 1920 × 1080 image is 2,073,600 bytes without metadata. Find its colour depth and explain whether it can show 1,000 colours.", ["$2073600 \\times 8 \\div (1920 \\times 1080) = 8$ bits (1)", "$2^8 = 256$ colours (1)", "No: 1000 colours need 10 bits (1)"], { arch: "cs.bitmap" }],
      [3, 2, "Explain what happens when a bitmap is enlarged and why a vector graphic behaves differently.", ["Bitmap: pixels get bigger, so it looks blocky/pixelated (1)", "Vector: shapes are redrawn from their properties at the new size (1)"], { arch: "cs.vector-graphics" }]
    ]
  };

  L["4.5.6.9"] = {
    archetypes: [
      { id: "cs.rle",
        rules: ["RLE stores each run as a (count, value) pair.",
          "It works when long runs of the same value repeat (simple graphics); a photo has few runs, so it can get LARGER.",
          "Count the bytes before and after: each pair is usually two bytes."],
        traps: [],
        variations: [
          { v: "A", t: "Encode a row", m: 2, q: "A row of pixels is W W W W W B B W W W W W W W W (W white, B black). Write it in run length encoding.",
            steps: [["Runs: 5 W, 2 B, 8 W.", "MP1", "Counts"], ["(5, W) (2, B) (8, W).", "MP2", "Pairs in order"]] },
          { v: "B", t: "Bytes before and after", m: 1, q: "The row above stores one byte per pixel; RLE stores a byte for each count and each value. How many bytes are saved?",
            steps: [["15 bytes before; 3 pairs × 2 = 6 bytes after; 9 bytes saved.", "MP1", ""]] },
          { v: "C", t: "Why RLE fails on a photograph", m: 2, q: "Explain why RLE gives poor compression for a photograph.",
            steps: [["Neighbouring pixels in a photo are rarely exactly the same colour, so runs are very short.", "MP1", ""], ["Each run of 1 becomes a pair, so the file can get bigger.", "MP2", ""]] }
        ] },
      { id: "cs.dictionary",
        rules: ["A dictionary method stores each repeated word (or pattern) once and replaces every occurrence with its shorter index.",
          "The dictionary itself is stored with the file, so it pays off only for large texts with much repetition."],
        traps: [],
        variations: [
          { v: "A", t: "Compress a sentence", m: 2, q: "Show how dictionary-based compression could compress \"to be or not to be\".",
            steps: [["Dictionary: 1 = to, 2 = be, 3 = or, 4 = not.", "MP1", "Each word stored once"], ["The text becomes 1 2 3 4 1 2.", "MP2", ""]] },
          { v: "B", t: "Why only large texts", m: 1, q: "Explain why dictionary compression may not reduce the size of a short message.",
            steps: [["The dictionary must be stored too, and with little repetition it can be as large as the saving.", "MP1", ""]] },
          { v: "C", t: "RLE or dictionary?", m: 2, q: "Explain why RLE suits simple images but a dictionary method suits text.",
            steps: [["Simple images have long runs of identical pixels, which RLE stores as one pair.", "MP1", ""], ["Text rarely has runs of the same character but repeats whole words, which a dictionary stores once.", "MP2", ""]] }
        ] },
      { id: "cs.compression",
        rules: ["Lossless: the original is recovered exactly (text, programs). Lossy: some data is discarded permanently (photos, music, video).",
          "Reasons to compress: less storage; faster transmission / less bandwidth; less data use."],
        traps: [],
        variations: [
          { v: "A", t: "Lossless or lossy", m: 1, q: "Explain the difference between lossless and lossy compression.",
            steps: [["Lossless allows the exact original to be reconstructed; lossy removes some data permanently so only an approximation is restored.", "MP1", ""]] },
          { v: "B", t: "Reasons to compress", m: 2, q: "Give two reasons why data is compressed before it is sent over the Internet.",
            steps: [["It takes less time to transmit.", "MP1", ""], ["It uses less bandwidth / less of a data allowance.", "MP2", ""]] },
          { v: "C", t: "Choose for a file type", m: 2, q: "State which type of compression should be used for (i) a program's source code, (ii) a holiday video, with a reason each.",
            steps: [["(i) Lossless: a single changed character would break the program.", "MP1", ""], ["(ii) Lossy: much smaller and the lost detail is hardly noticed.", "MP2", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "State the RLE for the run A A A A A A A.", ["(7, A) (1)"], { arch: "cs.rle" }],
      [1, 1, "Name the type of compression where data is permanently removed.", ["Lossy (1)"], { arch: "cs.compression" }],
      [2, 2, "Encode the row R R G G G G B R R R in RLE and state the bytes saved (one byte per pixel; two bytes a pair).", ["(2,R)(4,G)(1,B)(3,R) (1)", "10 → 8 bytes: 2 saved (1)"], { arch: "cs.rle" }],
      [2, 2, "Explain how dictionary compression would compress a novel.", ["Each word stored once in a dictionary with an index (1)", "Text replaced by the indexes / references, shorter than the words (1)"], { arch: "cs.dictionary" }],
      [3, 2, "Explain why a compressed text file cannot use lossy compression.", ["Lost data would change the text (1)", "Lossless gives back exactly the original characters (1)"], { arch: "cs.compression" }],
      [3, 3, "A black-and-white scanned page and a colour photograph are both compressed with RLE. Explain the likely outcomes.", ["Scan: long runs of white, so good compression (1)", "Photo: very short runs (1)", "So little or negative saving / file may grow (1)"], { arch: "cs.rle" }]
    ]
  };

  L["4.5.6.10"] = {
    archetypes: [
      { id: "cs.caesar",
        rules: ["Caesar: every letter shifts by the same key; wrap round from Z to A.",
          "A general substitution cipher maps each letter to another with no pattern: 26! keys, not 25.",
          "Both are broken by frequency analysis: a letter always encrypts to the same letter."],
        traps: [{ sitting: "2023-06", q: "Q03.1", to: "Q03.3", text: "The Caesar slip was the last letter not wrapping round past Z. The weakness both ciphers share is frequency analysis (each letter always maps to the same letter); \"few keys\" only applies to Caesar." }],
        variations: [
          { v: "A", t: "Encrypt with wrap-round", m: 1, q: "Encrypt the word ZEBRA with a Caesar cipher, key 3.",
            steps: [["Z → C (wraps round), E → H, B → E, R → U, A → D: CHEUD.", "MP1", "All five letters"]] },
          { v: "B", t: "Decrypt", m: 1, q: "The ciphertext KHOOR was made with a Caesar cipher, key 3. Decrypt it.",
            steps: [["Shift each letter back 3: HELLO.", "MP1", ""]] },
          { v: "C", t: "Why it is weak", m: 2, q: "Explain why a Caesar cipher is easy to break, and why a general substitution cipher is harder to brute force but still weak.",
            steps: [["Caesar has only 25 useful keys, so trying every one is quick.", "MP1", ""], ["Substitution has $26!$ keys, but each letter still always encrypts to the same letter, so frequency analysis breaks it.", "MP2", ""]] }
        ] },
      { id: "cs.vernam",
        rules: ["Vernam: ciphertext = plaintext XOR key, bit by bit; decryption is the same XOR with the same key.",
          "Perfect security needs a key that is truly random, at least as long as the message, used once only, and kept secret.",
          "Name \"the key\" in each condition, not \"it\"."],
        traps: [{ sitting: "2023-06", q: "Q03.4", text: "Say \"the key\" is used once, truly random, as long as the message. Answers that said \"it\" did not show what had to be random." }],
        variations: [
          { v: "A", t: "Encrypt with XOR", m: 2, q: "Encrypt the 5-bit code 10110 with the Vernam key 01100.",
            steps: [["XOR bit by bit: 1⊕0, 0⊕1, 1⊕1, 1⊕0, 0⊕0.", "MP1", "XOR named or shown"], ["11010.", "MP2", ""]] },
          { v: "B", t: "Decrypt with the same key", m: 1, q: "Show that XOR-ing the ciphertext 11010 with the key 01100 recovers the plaintext.",
            steps: [["$11010 \\oplus 01100 = 10110$, the original.", "MP1", ""]] },
          { v: "C", t: "The conditions for perfect security", m: 3, q: "State three conditions that make the Vernam cipher perfectly secure.",
            steps: [["The key is truly random.", "MP1", ""], ["The key is at least as long as the message.", "MP2", ""], ["The key is used only once (and kept secret).", "MP3", ""]] },
          { v: "D", t: "Computational against perfect security", m: 2, q: "Explain the difference between perfect security and computational security.",
            steps: [["Perfect (Vernam): the ciphertext gives no information about the plaintext however much computing power is used.", "MP1", ""], ["Computational: it could be broken in principle, but not in a practical amount of time with current computers.", "MP2", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "Encrypt the word CAT with a Caesar cipher, key 5.", ["HFY (1)"], { arch: "cs.caesar" }],
      [1, 1, "State the logical operation used by the Vernam cipher.", ["XOR (1)"], { arch: "cs.vernam" }],
      [2, 2, "Encrypt 1101 0011 with the key 1010 1010 using the Vernam cipher.", ["XOR shown (1)", "0111 1001 (1)"], { arch: "cs.vernam" }],
      [2, 2, "Explain how frequency analysis can break a substitution cipher.", ["Count how often each ciphertext letter appears (1)", "Match the most common to the most common letters in the language (e.g. E) (1)"], { arch: "cs.caesar" }],
      [3, 2, "A user reuses one Vernam key for two messages. Explain why this breaks perfect security.", ["XOR of the two ciphertexts cancels the key (1)", "Leaving the XOR of two plaintexts, which can be analysed (1)"], { arch: "cs.vernam" }],
      [3, 2, "Decrypt YLFWRUB, made with a Caesar cipher, and state the key.", ["VICTORY (1)", "Key 3 (1)"], { arch: "cs.caesar" }]
    ]
  };
})();
