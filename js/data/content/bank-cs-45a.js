/* Kurenai OS — past-paper bank: AQA 7517 §4.5 Data representation (part A:
   number systems, bases, units, binary arithmetic, fixed and floating point,
   errors). Modelled on AS/A-level Paper 2, June 2016–2025. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.5.1.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Number systems — Question 1 of every AS Paper 2" },
    "The AS paper opens with three or four one-mark *shade the lozenge* items: **which is a natural number** (a non-negative whole number — 0 counts), **which is irrational** (√2, π, e), **which is an integer but not natural** (a negative whole number), **which symbol denotes the rationals** (ℚ), **which set suits counting** (ℕ) and **measuring** (ℝ). Then a one/two-mark **describe**: *the set of real numbers* = **all possible real-world quantities** / the rationals and irrationals together / any point on the number line. Shading more than one lozenge scores zero.",
    { callout: { t: "memorise", body: "ℕ natural {0, 1, 2, …} · ℤ integers {…, −1, 0, 1, …} · ℚ rationals (any fraction of integers) · irrationals (cannot be written as a fraction: √2, π, e) · ℝ reals (all of the above). **Ordinal** numbers give **position** (1st, 2nd, 3rd) — used as array indices." }}
  ],
  flashcards: [
    ["Define the set of natural numbers.", "The positive whole numbers including zero: 0, 1, 2, 3, … — used for counting."],
    ["What symbol denotes the natural numbers?", "ℕ."],
    ["Is 0 a natural number in the AQA specification?", "Yes."],
    ["Which numbers are integers but not natural?", "Negative whole numbers, e.g. −7."],
    ["Which set is appropriate for counting?", "The natural numbers ℕ."],
    ["Which set is appropriate for measurement?", "The real numbers ℝ — quantities are not necessarily whole or positive."],
    ["Why can natural numbers not represent a measured length?", "They have no fractional part and cannot be negative; real-world quantities are continuous."],
    ["Name the five number sets in the spec.", "Natural, integer, rational, irrational, real (plus ordinal numbers for position)."]
  ],
  quiz: [
    { q: "Which is a natural number?", opts: ["−4", "0", "2.5", "√3"], ans: 1, why: "Zero is included in ℕ for AQA." },
    { q: "Which set would you use to count the number of files in a folder?", opts: ["ℝ", "ℚ", "ℕ", "irrationals"], ans: 2, why: "Counting → natural numbers." },
    { q: "Which is an integer but not a natural number?", opts: ["7", "0", "−12", "0.5"], ans: 2, why: "Negative whole number." },
    { q: "The set of real numbers is best described as:", opts: ["whole numbers only", "all possible real-world quantities", "fractions only", "numbers greater than zero"], ans: 1, why: "Mark-scheme phrasing." },
    { q: "Shading two lozenges on a one-mark question scores:", opts: ["1", "0.5", "0", "2"], ans: 2, why: "R. more than one lozenge shaded." },
    { q: "Which symbol denotes the natural numbers?", opts: ["ℤ", "ℕ", "ℚ", "ℝ"], ans: 1, why: "ℕ." }
  ],
  exam: [
    { level: "AS", src: "AS 2023 P2 Q1", ctx: "Consider the values: A = −3, B = √2, C = 73, D = 4.5, E = π.",
      parts: [
        { q: "State which value is a natural number.", marks: 1, ms: ["C (73) (1)"] },
        { q: "State which values are irrational.", marks: 1, ms: ["B and E (√2 and π) (1)"] },
        { q: "State which value is an integer but not a natural number.", marks: 1, ms: ["A (−3) (1)"] },
        { q: "Describe the set of real numbers.", marks: 1, ms: ["The set of all possible real-world quantities / the rational and irrational numbers together / any value along the number line (1)"] }
      ] },
    { level: "AS", src: "AS 2025 P2 Q1.3", q: "Explain why the set of real numbers is more suitable than the set of natural numbers for representing the weight of a parcel.", marks: 1,
      ms: ["Real-world quantities are not necessarily whole numbers — natural numbers have no fractional part (1)"] },
    { level: "AS", src: "AS 2022 P2 Q1.3", q: "State which number set is most appropriate for (i) counting the passengers on a bus, (ii) recording the temperature of a room in °C.", marks: 2,
      ms: ["(i) Natural numbers (1)", "(ii) Real numbers — may be negative and fractional (1)"] }
  ]
});

X("compsci:4.5.1.2", {
  flashcards: [
    ["Define the set of integers.", "All whole numbers, positive, negative and zero: …, −2, −1, 0, 1, 2, …"],
    ["What symbol denotes the integers?", "ℤ."],
    ["State one difference between the integers and the natural numbers.", "The integers include negative whole numbers; the natural numbers do not."],
    ["Is every natural number an integer?", "Yes — ℕ is a subset of ℤ."],
    ["Give an example of a value in ℤ but not in ℕ.", "−999 (any negative whole number)."],
    ["Which computer data type corresponds to ℤ?", "The (signed) integer type — represented with two's complement."],
    ["Which set would a bank balance that can go overdrawn belong to (in whole pence)?", "Integers — it can be negative."],
    ["Is 3.0 an integer?", "Mathematically 3.0 = 3 is an integer; as a stored real it is not an integer type."]
  ],
  quiz: [
    { q: "Which set contains −8, 0 and 15 but not 2.5?", opts: ["ℕ", "ℤ", "ℝ", "irrationals"], ans: 1, why: "Whole numbers including negatives." },
    { q: "ℕ ⊂ ℤ means:", opts: ["every integer is natural", "every natural number is an integer", "the sets are equal", "neither contains 0"], ans: 1, why: "Subset relation." },
    { q: "A temperature stored in whole degrees that may be below zero needs:", opts: ["ℕ", "ℤ", "irrationals", "ordinals"], ans: 1, why: "Negative whole values." },
    { q: "Which is NOT an integer?", opts: ["−1", "0", "1/2", "1000"], ans: 2, why: "Fractional." },
    { q: "The difference between ℤ and ℕ is:", opts: ["ℤ has fractions", "ℤ includes negatives", "ℕ includes negatives", "no difference"], ans: 1, why: "Mark-scheme point." },
    { q: "Which symbol denotes the integers?", opts: ["ℤ", "ℕ", "ℚ", "ℝ"], ans: 0, why: "ℤ from German Zahlen." }
  ],
  exam: [
    { level: "AS", src: "AS 2022 P2 Q1.1", q: "Describe one difference between the set of natural numbers and the set of integers, and give an example of a number that is in one set but not the other.", marks: 2,
      ms: ["The integers include negative whole numbers; the natural numbers do not (natural numbers are positive whole numbers including zero) (1)", "e.g. −2 is an integer but not a natural number (1)"] },
    { level: "AS", src: "AS 2025 P2 Q1.1", q: "From the list −6, 0.25, 0, √9, 998, π, state which values belong to the set of integers.", marks: 2,
      ms: ["−6, 0 (1)", "√9 (= 3), 998 — and no others (1)"] }
  ]
});

X("compsci:4.5.1.3", {
  flashcards: [
    ["Define a rational number.", "A number that can be expressed as a fraction — one integer divided by another (non-zero) integer."],
    ["What symbol denotes the rationals?", "ℚ."],
    ["Is 0.75 rational?", "Yes — 3/4."],
    ["Is every integer rational?", "Yes — n = n/1."],
    ["Is 0.333… (recurring) rational?", "Yes — 1/3. Any recurring or terminating decimal is rational."],
    ["Give a rational number that is not an integer.", "15/23, 2.5, −0.1."],
    ["Which is larger as a set, ℤ or ℚ?", "ℚ contains ℤ and much more (all fractions)."],
    ["Why can a computer represent every rational number exactly in principle?", "Store numerator and denominator as integers; floating point cannot, but a fraction type can."]
  ],
  quiz: [
    { q: "Which is rational?", opts: ["π", "√2", "0.125", "e"], ans: 2, why: "1/8." },
    { q: "108 belongs to which sets?", opts: ["ℕ only", "ℕ, ℤ, ℚ, ℝ", "ℤ and ℚ only", "ℝ only"], ans: 1, why: "A natural number is in every larger set." },
    { q: "15/23 belongs to:", opts: ["ℕ and ℤ", "ℚ and ℝ", "irrationals", "ℤ only"], ans: 1, why: "A fraction — rational and therefore real." },
    { q: "0.1 recurring (0.111…) is:", opts: ["irrational", "rational (1/9)", "an integer", "natural"], ans: 1, why: "Recurring decimals are rational." },
    { q: "Which symbol denotes the rationals?", opts: ["ℚ", "ℝ", "ℤ", "ℕ"], ans: 0, why: "Q for quotient." },
    { q: "A number that is rational but not a natural number:", opts: ["7", "−3", "0", "12"], ans: 1, why: "−3 = −3/1 is rational; negative so not natural." }
  ],
  exam: [
    { src: "AQA 2018 P2 Q9.1", q: "For each of the numbers 15/23 and 108, state every set from natural, integer, rational, irrational, real to which it belongs.", marks: 2,
      ms: ["15/23: rational, real (1)", "108: natural, integer, rational, real (1)", "Reject if additional sets are given"] },
    { src: "AQA 2020 P2 Q7.1", q: "Give an example of a number that is rational but not a natural number, and explain why it is rational.", marks: 2,
      ms: ["e.g. −5 or 0.5 (1)", "It can be written as one integer divided by another, e.g. −5/1 or 1/2 (1)"] }
  ]
});

X("compsci:4.5.1.4", {
  flashcards: [
    ["Define an irrational number.", "A number that cannot be expressed as a fraction of two integers; its decimal expansion never terminates or recurs."],
    ["Give three irrational numbers.", "√2, π, e."],
    ["Is 3.14159 irrational?", "No — any value written to a fixed number of decimal places is rational; π itself is irrational."],
    ["Why can a computer never store π exactly?", "Its expansion is infinite and non-recurring; any finite representation is an approximation."],
    ["Is √9 irrational?", "No — √9 = 3, an integer."],
    ["Do the irrationals and rationals overlap?", "No — together they make up the reals with no overlap."],
    ["Which set suits the circumference of a circle of radius 1?", "The reals — 2π is irrational."],
    ["Is 22/7 irrational?", "No — it is a rational approximation of π."]
  ],
  quiz: [
    { q: "Which is irrational?", opts: ["22/7", "√16", "√2", "0.5"], ans: 2, why: "√2 cannot be written as a fraction." },
    { q: "A number written to 6 decimal places is:", opts: ["irrational", "rational", "natural", "an integer"], ans: 1, why: "Terminating decimal = fraction." },
    { q: "The rationals and irrationals together form:", opts: ["ℤ", "ℕ", "ℝ", "ℚ"], ans: 2, why: "The reals." },
    { q: "Which cannot be stored exactly by any finite binary representation?", opts: ["1/2", "π", "3", "0.25"], ans: 1, why: "Infinite non-recurring." },
    { q: "e (≈2.718) is:", opts: ["rational", "irrational", "an integer", "natural"], ans: 1, why: "Transcendental, irrational." },
    { q: "Which set suits measuring a circle's circumference?", opts: ["ℕ", "ℤ", "ℝ", "ordinals"], ans: 2, why: "Involves π." }
  ],
  exam: [
    { level: "AS", src: "AS 2022 P2 Q1.2", q: "Explain what it means for a number to be irrational and give an example.", marks: 2,
      ms: ["It cannot be written as a fraction / ratio of two integers (its decimal expansion neither terminates nor recurs) (1)", "e.g. √2, π, e — reject any value written to a fixed number of decimal places (1)"] },
    { level: "AS", src: "AS 2019 P2 Q1.2", q: "State the difference between a rational and an irrational number.", marks: 1,
      ms: ["A rational number can be expressed as one integer divided by another; an irrational number cannot (1)"] }
  ]
});

X("compsci:4.5.1.5", {
  flashcards: [
    ["Define the set of real numbers.", "All possible real-world quantities — the rational and irrational numbers together; any point on the number line."],
    ["What symbol denotes the reals?", "ℝ."],
    ["Which numbers are excluded from ℝ?", "Imaginary/complex numbers."],
    ["Which computer data type approximates ℝ?", "Real / float (floating point) — an approximation, not exact."],
    ["Why are reals appropriate for measurement?", "Measured quantities are continuous — fractional and possibly negative."],
    ["Is every rational number real?", "Yes; ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ."],
    ["Give a quantity that needs ℝ.", "A temperature, a length, a weight, a time interval."],
    ["Why is 'ℝ' alone not an accepted description of the reals?", "The examiners want the description — all real-world quantities / rationals and irrationals — not just the symbol."]
  ],
  quiz: [
    { q: "The set of real numbers includes:", opts: ["only fractions", "rationals and irrationals", "complex numbers", "only positives"], ans: 1, why: "Everything on the number line." },
    { q: "Which is NOT a real number?", opts: ["−2.5", "π", "√−1", "0"], ans: 2, why: "Imaginary." },
    { q: "ℝ is the appropriate set for:", opts: ["counting people", "measuring length", "array indices", "ranking"], ans: 1, why: "Continuous quantity." },
    { q: "Which chain is correct?", opts: ["ℝ ⊂ ℚ ⊂ ℤ", "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ", "ℤ ⊂ ℕ", "ℚ ⊂ ℕ"], ans: 1, why: "Each set contains the previous." },
    { q: "In a program, a real number is usually stored as:", opts: ["an exact fraction", "a floating point approximation", "a string", "an integer"], ans: 1, why: "Float/double." },
    { q: "'The set of all possible real-world quantities' describes:", opts: ["ℕ", "ℤ", "ℚ", "ℝ"], ans: 3, why: "AS mark-scheme phrase." }
  ],
  exam: [
    { level: "AS", src: "AS 2024 P2 Q1.1", q: "Describe the set of real numbers.", marks: 1,
      ms: ["All possible real-world quantities / includes the rational and irrational numbers / any value along the number line (excluding imaginary numbers) (1)"] },
    { src: "AQA 2020 P2 Q7.2", q: "A program stores the length of a piece of timber in metres. State, with a reason, the most appropriate number set for this value.", marks: 2,
      ms: ["Real numbers (1)", "A measured length may have a fractional part / is a continuous quantity (1)"] }
  ]
});

X("compsci:4.5.1.6", {
  flashcards: [
    ["Define an ordinal number.", "A number that represents the position / rank / order of an item in a sequence — 1st, 2nd, 3rd…"],
    ["How are ordinal numbers used with arrays?", "They give the position (index) of each value in the array."],
    ["Difference between cardinal and ordinal?", "Cardinal says how many (3 apples); ordinal says which position (the 3rd apple)."],
    ["What is the ordinal number of the first element in a 0-indexed array?", "0 (the index) — position rather than count."],
    ["Give a real-world use of ordinals.", "Race finishing positions, page numbers, list rankings."],
    ["Why are natural numbers used as ordinals in computing?", "Positions are non-negative whole numbers that can be computed and compared."],
    ["Is an ordinal number ever fractional?", "No — a position in an order is always whole."],
    ["How many ordinals do you need to give as an example to score?", "At least three, e.g. 1st, 2nd, 3rd."]
  ],
  quiz: [
    { q: "An ordinal number represents:", opts: ["a quantity", "a position in an ordered sequence", "a fraction", "a measurement"], ans: 1, why: "Order/rank." },
    { q: "In `Scores[4]` the 4 is acting as:", opts: ["a cardinal", "an ordinal (position)", "a real", "an irrational"], ans: 1, why: "Index = position." },
    { q: "'She finished 2nd' uses:", opts: ["a cardinal number", "an ordinal number", "a rational", "a real"], ans: 1, why: "Position." },
    { q: "'There were 12 runners' uses:", opts: ["an ordinal", "a cardinal", "an irrational", "a negative"], ans: 1, why: "Count." },
    { q: "Which is a valid example set of ordinals?", opts: ["1, 2, 3", "1st, 2nd, 3rd", "½, ¼", "π, e"], ans: 1, why: "Positions." },
    { q: "Ordinals are drawn from which set?", opts: ["ℝ", "irrationals", "ℕ", "ℚ \\ ℤ"], ans: 2, why: "Whole positions." }
  ],
  exam: [
    { src: "AQA 2018 P2 Q9.2", q: "State what is meant by an ordinal number and explain how ordinal numbers are used with an array.", marks: 2,
      ms: ["A number that shows the order / position / rank of an item (1)", "They represent the index / position of the values in the array (1)"] },
    { level: "AS", src: "AS 2025 P2 Q1.2", q: "State what is meant by an ordinal number.", marks: 1,
      ms: ["A number used to describe the position of an item in an ordered sequence (accept by example: 1st, 2nd, 3rd) (1)"] }
  ]
});

X("compsci:4.5.1.7", {
  flashcards: [
    ["Which number set is used for counting?", "The natural numbers ℕ."],
    ["Which number set is used for measurement?", "The real numbers ℝ."],
    ["Why not use ℕ for measurement?", "Measured quantities can be fractional or negative; ℕ has neither."],
    ["Why not use ℝ for counting?", "Counts are whole and non-negative; a real type wastes storage and risks rounding error."],
    ["Give a counting example and a measuring example.", "Number of emails received (count, ℕ); mass of a letter in grams (measure, ℝ)."],
    ["What is the computing consequence of the counting/measuring distinction?", "Choose integer vs real data types accordingly."],
    ["Is a shoe size 'measuring' or 'counting'?", "It is a label from a scale — usually treated as measuring (may be 7.5)."],
    ["Which set for the number of pixels in an image?", "ℕ — a count."]
  ],
  quiz: [
    { q: "Counting the cars in a car park uses:", opts: ["ℝ", "ℕ", "irrationals", "ℚ \\ ℤ"], ans: 1, why: "Whole, non-negative." },
    { q: "Measuring the length of a road uses:", opts: ["ℕ", "ℤ", "ℝ", "ordinals"], ans: 2, why: "Continuous." },
    { q: "Storing a count in a real variable risks:", opts: ["overflow only", "rounding errors and wasted space", "nothing", "negative values"], ans: 1, why: "Floats approximate." },
    { q: "Which quantity is a measurement?", opts: ["Number of students", "Body temperature", "Number of pages", "Number of goals"], ans: 1, why: "Continuous value." },
    { q: "Natural numbers cannot represent a measurement because they:", opts: ["are too large", "lack fractional parts and negatives", "are irrational", "are ordinals"], ans: 1, why: "AS 2025 P2 Q1.3." },
    { q: "Best data type for 'number of attempts':", opts: ["Real", "Integer (natural)", "String", "Boolean"], ans: 1, why: "A count." }
  ],
  exam: [
    { level: "AS", src: "AS 2017 P2 Q1.3", q: "State which set of numbers is most appropriate for representing (i) the number of tickets sold for a concert and (ii) the circumference of a wheel, giving a reason in each case.", marks: 2,
      ms: ["(i) Natural numbers — it is a count, whole and non-negative (1)", "(ii) Real numbers — a measurement that may be fractional / involves π (1)"] }
  ]
});

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

X("compsci:4.5.3.1", {
  flashcards: [
    ["What is a bit?", "The fundamental unit of information: a single binary digit, 0 or 1."],
    ["What is a byte?", "A group of 8 bits — the unit in which memory is usually addressed."],
    ["What is a nibble?", "4 bits — one hexadecimal digit."],
    ["How many distinct values can one byte represent?", "2⁸ = 256."],
    ["How many distinct values can 10 bits represent?", "2¹⁰ = 1024."],
    ["How many values can two bytes represent?", "2¹⁶ = 65 536."],
    ["How many bits are needed to represent 18 different values?", "5 — 2⁴ = 16 is too few, 2⁵ = 32 suffices."],
    ["Why is the byte the standard unit rather than the bit?", "Memory is addressed byte by byte; a byte holds one character in ASCII."]
  ],
  quiz: [
    { q: "Number of values representable in 3 bytes:", opts: ["24", "2²⁴", "768", "3 × 256"], ans: 1, why: "24 bits → 2²⁴ ≈ 16.7 million." },
    { q: "Minimum bits to represent 100 different values:", opts: ["6", "7", "8", "100"], ans: 1, why: "2⁶ = 64 < 100 ≤ 128 = 2⁷." },
    { q: "A nibble holds how many hex digits?", opts: ["1", "2", "4", "8"], ans: 0, why: "4 bits = 1 hex digit." },
    { q: "One byte represents:", opts: ["255 values", "256 values", "8 values", "100 values"], ans: 1, why: "0–255." },
    { q: "How many bits in 4 bytes?", opts: ["4", "16", "32", "64"], ans: 2, why: "8 per byte." },
    { q: "Adding one bit to a field does what to the number of values?", opts: ["adds 1", "doubles it", "adds 8", "squares it"], ans: 1, why: "2ⁿ⁺¹ = 2 × 2ⁿ." }
  ],
  exam: [
    { level: "AS", src: "AS 2023 P2 Q2.2", q: "A field is 10 bits wide. State the number of different values it can represent.", marks: 1,
      ms: ["1024 (2¹⁰) (1)"] },
    { level: "AS", src: "AS 2018 P2 Q12.2", q: "An image uses 18 different colours. State the minimum number of bits needed to represent one pixel, and justify your answer.", marks: 2,
      ms: ["5 bits (1)", "4 bits give only 16 values; 5 bits give 32, enough for 18 (1)"] }
  ]
});

X("compsci:4.5.3.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Units — the calculation questions" },
    "Units rarely appear alone; they carry the **file-size calculations** in the sound and image questions (3 marks: the multiplication, the ÷8 to bytes, the conversion to the unit asked). The dedicated items are: *which prefix is a power of ten* (kilo, mega, giga — 10³, 10⁶, 10⁹) versus *binary prefixes* (kibi 2¹⁰, mebi 2²⁰, gibi 2³⁰, tebi 2⁴⁰); *order quantities by size*; *convert GiB to KiB* (× 2²⁰).",
    { callout: { t: "warn", body: "A question that says **mebibytes** expects ÷ 1 048 576 (2²⁰), not ÷ 1 000 000. The mark schemes accept the answer *to at least 4 significant figures*, so keep the exact value until the end." }}
  ],
  flashcards: [
    ["What is 1 kilobyte in bytes?", "1000 bytes (10³)."],
    ["What is 1 kibibyte in bytes?", "1024 bytes (2¹⁰)."],
    ["List the binary prefixes and their powers.", "kibi 2¹⁰, mebi 2²⁰, gibi 2³⁰, tebi 2⁴⁰."],
    ["List the decimal prefixes.", "kilo 10³, mega 10⁶, giga 10⁹, tera 10¹²."],
    ["How many KiB in 1 GiB?", "2²⁰ = 1 048 576."],
    ["Why were binary prefixes introduced?", "To remove the ambiguity of 'kilobyte' meaning 1000 or 1024 bytes."],
    ["Convert 3 MiB to bytes.", "3 × 2²⁰ = 3 145 728 bytes."],
    ["Order: 2 GiB, 2500 MiB, 2 × 10⁹ bytes.", "2 × 10⁹ B (1.86 GiB) < 2 GiB (2048 MiB) < 2500 MiB."]
  ],
  quiz: [
    { q: "1 MiB =", opts: ["1 000 000 bytes", "1 048 576 bytes", "1024 bytes", "1 000 000 bits"], ans: 1, why: "2²⁰." },
    { q: "Which prefix is a power of ten?", opts: ["kibi", "mebi", "giga", "tebi"], ans: 2, why: "10⁹." },
    { q: "5 GiB in KiB:", opts: ["5 × 2¹⁰", "5 × 2²⁰", "5 × 2³⁰", "5 × 10⁶"], ans: 1, why: "GiB → KiB is two steps of 2¹⁰." },
    { q: "A 4.7 GB DVD holds how many bytes (decimal prefix)?", opts: ["4.7 × 2³⁰", "4.7 × 10⁹", "4.7 × 10⁶", "4.7 × 2²⁰"], ans: 1, why: "Giga = 10⁹." },
    { q: "Largest of: 1 TiB, 1000 GiB, 10¹² bytes:", opts: ["1 TiB", "1000 GiB", "10¹² bytes", "all equal"], ans: 0, why: "1 TiB = 1024 GiB ≈ 1.1 × 10¹² bytes." },
    { q: "Bits → bytes requires:", opts: ["× 8", "÷ 8", "÷ 1024", "× 1024"], ans: 1, why: "8 bits per byte." }
  ],
  exam: [
    { level: "AS", src: "AS 2018 P2 Q2.1", q: "Arrange the following in order of size, smallest first: 3000 KiB, 2 MiB, 2 × 10⁶ bytes, 25 000 000 bits.", marks: 2,
      ms: ["Values: 3000 KiB = 3 072 000 B; 2 MiB = 2 097 152 B; 2 × 10⁶ B; 25 000 000 bits = 3 125 000 B (1)", "Order: 2 × 10⁶ bytes, 2 MiB, 3000 KiB, 25 000 000 bits (1)"] },
    { src: "AQA 2020 P2 Q3.2", q: "A hard disk has a capacity of 2 GiB. Express this capacity in kibibytes.", marks: 1,
      ms: ["2 × 2²⁰ = 2 097 152 KiB (1)"] },
    { level: "AS", src: "AS 2023 P2 Q3.1", q: "State which of the prefixes kibi, mega, gibi and tebi represents a power of ten, and give its value.", marks: 1,
      ms: ["mega — 10⁶ (1)"] }
  ]
});

X("compsci:4.5.4.1", {
  flashcards: [
    ["Convert 177 to 8-bit unsigned binary.", "10110001 (128 + 32 + 16 + 1)."],
    ["Convert 139 to 8-bit unsigned binary.", "10001011 (128 + 8 + 2 + 1)."],
    ["Convert 01101101 to denary.", "64 + 32 + 8 + 4 + 1 = 109."],
    ["Range of an 8-bit unsigned integer?", "0 to 255."],
    ["Range of a 16-bit unsigned integer?", "0 to 65 535 (2¹⁶ − 1)."],
    ["Largest unsigned value in n bits?", "2ⁿ − 1."],
    ["Method for denary → binary?", "Subtract the largest power of two that fits, repeat; or repeatedly divide by 2 reading remainders upwards."],
    ["Place values of an 8-bit unsigned integer?", "128 64 32 16 8 4 2 1."]
  ],
  quiz: [
    { q: "200 in 8-bit binary:", opts: ["11001000", "11010000", "10101000", "11000100"], ans: 0, why: "128 + 64 + 8." },
    { q: "10011110 in denary:", opts: ["158", "142", "174", "126"], ans: 0, why: "128 + 16 + 8 + 4 + 2." },
    { q: "The largest 12-bit unsigned value:", opts: ["4095", "4096", "2048", "1023"], ans: 0, why: "2¹² − 1." },
    { q: "Number of values in a 16-bit unsigned integer:", opts: ["65 535", "65 536", "32 768", "16"], ans: 1, why: "2¹⁶ values, 0–65 535." },
    { q: "Which 8-bit pattern is 255?", opts: ["10000000", "11111111", "01111111", "11111110"], ans: 1, why: "All ones." },
    { q: "If 8 bits store 0–255, how many bits store 0–1023?", opts: ["9", "10", "11", "16"], ans: 1, why: "2¹⁰ = 1024." }
  ],
  exam: [
    { level: "AS", src: "AS 2022 P2 Q3.1", q: "State the range of values that can be represented by a 16-bit unsigned binary integer, showing how you obtained the upper limit.", marks: 2,
      ms: ["0 to 65 535 (1)", "Upper limit 2¹⁶ − 1 (1)"] },
    { level: "AS", src: "AS 2024 P2 Q2.2", q: "Represent the denary number 139 as an 8-bit unsigned binary integer.", marks: 1,
      ms: ["10001011 (1)"] },
    { level: "AS", src: "AS 2025 P2 Q2.2", q: "Convert the unsigned binary integer `01011011` to denary.", marks: 1,
      ms: ["91 (1)"] }
  ]
});

X("compsci:4.5.4.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Binary arithmetic — every AS paper" },
    "**Addition** (1–2 marks): show the carries; the 2019 A-level item gave a wrong addition and asked *where the mistake is* (a carry dropped). **Multiplication** (2 marks, AS 2017/2020/2022): long multiplication — one mark for the partial products shifted correctly, one for the sum. **Subtraction** is done by **adding the two's complement** (see 4.5.4.3) — 2–3 marks: one for negating the subtrahend, one for the addition, one for the answer (ignoring the final carry-out).",
    { callout: { t: "tip", body: "Multiply in binary by writing one shifted copy of the multiplicand per 1-bit of the multiplier, then add. 1011 × 101 = 1011 + 101100 = 110111 (11 × 5 = 55 ✓). Always sanity-check in denary." }}
  ],
  flashcards: [
    ["Add 01101011 + 00110110.", "10100001 (107 + 54 = 161)."],
    ["Multiply 1101 × 11.", "1101 + 11010 = 100111 (13 × 3 = 39)."],
    ["Rule for binary addition of 1 + 1 + 1?", "1 carry 1 (three ones = 11₂)."],
    ["How is subtraction performed in a two's complement system?", "Add the two's complement of the subtrahend; discard any carry out of the most significant bit."],
    ["What does a carry out of the MSB mean in unsigned addition?", "Overflow — the result needs more bits than are available."],
    ["Multiply 10110 by 10 (binary).", "101100 — multiplying by 2 shifts left one place."],
    ["Add 1111 + 0001 in 4 bits.", "0000 with carry 1 — overflow."],
    ["Check 1011 + 0110 = 10001 in denary.", "11 + 6 = 17 ✓."]
  ],
  quiz: [
    { q: "10110 + 01011 =", opts: ["100001", "11101", "100011", "11111"], ans: 0, why: "22 + 11 = 33 = 100001." },
    { q: "1010 × 110 =", opts: ["111100", "110100", "101010", "111000"], ans: 0, why: "10 × 6 = 60 = 111100." },
    { q: "In a binary addition column, 1 + 1 + carry 1 gives:", opts: ["0 carry 0", "1 carry 1", "0 carry 1", "1 carry 0"], ans: 1, why: "Three = 11₂." },
    { q: "Multiplying a binary number by 100₂ is equivalent to:", opts: ["adding 4", "shifting left 2 places", "shifting right 2", "squaring"], ans: 1, why: "× 4." },
    { q: "An 8-bit unsigned addition producing a 9th bit indicates:", opts: ["negative result", "overflow", "underflow", "rounding"], ans: 1, why: "Result too large." },
    { q: "How does a processor subtract using only an adder?", opts: ["It cannot", "Adds the two's complement of the subtrahend", "Uses division", "Uses a lookup table"], ans: 1, why: "AS 2016 P2 Q5.5." }
  ],
  exam: [
    { level: "AS", src: "AS 2025 P2 Q2.3", q: "Add the unsigned binary integers `01011101` and `00110111`, showing the carries.", marks: 2,
      ms: ["Carries shown correctly (1)", "10010100 (93 + 55 = 148) (1)"] },
    { level: "AS", src: "AS 2022 P2 Q3.2", q: "Multiply the unsigned binary integers `1101` and `101`, showing your working.", marks: 2,
      ms: ["Partial products 1101 and 110100 (shifted two places) (1)", "Sum 1000001 (13 × 5 = 65) (1)"] },
    { src: "AQA 2019 P2 Q4", q: "A student adds `00111011` and `01001101` and obtains `01111000`. Identify the mistake.", marks: 1,
      ms: ["A carry was dropped — the correct answer is 10001000 (59 + 77 = 136); the student failed to carry from bit 3 / bit 7 (1)"] },
    { level: "AS", src: "AS 2016 P2 Q5.5", q: "A processor contains circuitry that produces the two's complement of a number. Explain how this allows subtraction to be carried out using only an addition circuit.", marks: 1,
      ms: ["A − B is computed as A + (two's complement of B), so the same adder performs subtraction (1)"] }
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
    ["Range of 8-bit two's complement?", "−128 to +127."],
    ["Range of 4-bit two's complement?", "−8 to +7."],
    ["Most negative 12-bit two's complement value?", "−2048 (100000000000)."],
    ["Convert 11001010 (two's complement) to denary.", "−128 + 64 + 8 + 2 = −54."],
    ["Convert −72 to 8-bit two's complement.", "72 = 01001000; flip → 10110111; +1 → 10111000."],
    ["How do you negate a two's complement number?", "Invert every bit and add 1 (or copy from the right up to and including the first 1, then invert the rest)."],
    ["Compute 18 − 72 in 8-bit two's complement.", "00010010 + 10111000 = 11001010 = −54."],
    ["Why is two's complement preferred to sign-and-magnitude?", "One representation of zero, and addition/subtraction use the same adder circuit with no special sign handling."]
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
    ["In AQA floating point, where is the binary point?", "Immediately after the first (sign) bit of the mantissa; value = mantissa × 2^exponent, both two's complement."],
    ["Convert mantissa 0.1010000, exponent 0011 to denary.", "Mantissa 0.625, exponent 3 → 0.625 × 8 = 5."],
    ["Convert mantissa 1.0110000, exponent 0011 to denary.", "Mantissa −0.625, exponent 3 → −5."],
    ["Represent 58.5 as a normalised floating point number (8-bit mantissa, 4-bit exponent).", "58.5 = 111010.1 → 0.1110101 × 2⁶ → mantissa 01110101, exponent 0110."],
    ["Represent −23.25 (8-bit mantissa, 4-bit exponent).", "23.25 = 10111.01 → −23.25 = 101000.11 (two's complement) → 1.0100011 × 2⁵ → mantissa 10100011, exponent 0101."],
    ["Represent 0.15625 (8-bit mantissa, 4-bit exponent).", "0.15625 = 0.00101 → 0.101 × 2⁻² → mantissa 01010000, exponent 1110."],
    ["Convert the fixed point two's complement pattern 101100.1011 to denary.", "−32 + 8 + 4 + 0.5 + 0.125 + 0.0625 = −19.3125."],
    ["Represent 6.34375 in fixed point binary with 5 fraction bits.", "110.01011."],
    ["Advantages of floating point over fixed point?", "Greater range in the same number of bits; can represent numbers much closer to zero and much larger."],
    ["Advantages of fixed point over floating point?", "Faster/simpler arithmetic; some numbers represented more precisely; constant (guaranteed) absolute precision."]
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

X("compsci:4.5.4.5", {
  flashcards: [
    ["What is a rounding error in floating point?", "The difference between a value and its stored representation when it cannot be represented exactly in the available bits."],
    ["Why does 28.25 cause a rounding error in a 7-bit mantissa?", "28.25 = 11100.01 has 7 significant bits — more than the mantissa can hold after the sign bit, so it must be rounded or truncated."],
    ["What are the two ways of shortening a value that does not fit?", "Rounding to the nearest representable value, or truncating (dropping the extra bits)."],
    ["Why can 0.1 not be stored exactly in binary?", "Its binary expansion 0.000110011… recurs; any finite mantissa truncates it."],
    ["How can rounding errors accumulate?", "Each arithmetic operation may round; repeated operations compound the error."],
    ["Name the three error types in the 2023 question.", "Underflow (too close to zero → stored as 0), overflow (too large for the bits), rounding (cannot be represented exactly)."],
    ["Does a larger mantissa reduce rounding error?", "Yes — more significant bits means the stored value is closer to the true one."],
    ["Why is testing floats for equality dangerous?", "Rounding errors mean two mathematically equal results may differ in their last bits."]
  ],
  quiz: [
    { q: "A value is stored as 28.5 instead of 28.25 because:", opts: ["overflow", "the mantissa has too few bits, so it was rounded", "underflow", "the exponent was negative"], ans: 1, why: "Insufficient precision." },
    { q: "Rounding error is reduced by:", opts: ["more exponent bits", "more mantissa bits", "fewer bits", "normalisation only"], ans: 1, why: "Precision lives in the mantissa." },
    { q: "0.1 + 0.2 ≠ 0.3 in floating point because:", opts: ["a bug", "0.1 and 0.2 have recurring binary expansions that are rounded", "addition is wrong", "0.3 is irrational"], ans: 1, why: "Representation error." },
    { q: "'28.25 can never be represented in binary' is:", opts: ["accepted", "rejected — it can, given enough bits", "true", "a rounding error"], ans: 1, why: "2020 mark scheme R." },
    { q: "Truncation differs from rounding because it:", opts: ["rounds up", "drops extra bits regardless of their value", "adds bits", "is exact"], ans: 1, why: "Always towards zero." },
    { q: "Rounding errors in a long loop of additions:", opts: ["cancel out", "may accumulate", "never occur", "cause overflow"], ans: 1, why: "Compounding." }
  ],
  exam: [
    { src: "AQA 2020 P2 Q2.5", q: "A floating point system has a 7-bit mantissa. Explain why a rounding error occurs when 28.25 is stored, and state what value might be stored instead.", marks: 2,
      ms: ["28.25 = 11100.01 needs 8 significant bits (including the sign bit) — more than the 7-bit mantissa provides, so insufficient precision is available (1)", "It is rounded to the nearest representable value or truncated, e.g. stored as 28 or 28.5 (1)"] },
    { src: "AQA 2018 P2 Q6", q: "Explain why repeatedly adding 0.1 to a floating point total one hundred times may not give exactly 10.", marks: 2,
      ms: ["0.1 cannot be represented exactly in binary (recurring expansion), so each stored value has a small rounding error (1)", "The errors accumulate over the repeated additions so the total differs slightly from 10 (1)"] }
  ]
});

X("compsci:4.5.4.6", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Absolute and relative error — 2017, 2021, 2022, 2025" },
    "**Absolute error** = |stored − intended|, always positive (−0.05 is rejected unless the method is shown). **Relative error** = absolute error ÷ intended value, given as a percentage when asked (0.05 ÷ 13.8 = 0.36%). Follow-through from a wrong absolute error is allowed. The 2021 one-marker: *why relative error matters more* — **the effect of an error depends on its size relative to the number represented**; the same absolute error is more significant for a small number.",
    { callout: { t: "tip", body: "Keep at least four decimal places in the intermediate values; the schemes accept answers to higher precision but not to fewer significant figures than the true value shows." }}
  ],
  flashcards: [
    ["Define absolute error.", "The magnitude of the difference between the stored (represented) value and the intended value: |stored − intended|."],
    ["Define relative error.", "Absolute error divided by the intended value — often expressed as a percentage."],
    ["13.8 is stored as 13.75. Absolute and relative error?", "Absolute 0.05; relative 0.05 ÷ 13.8 = 0.0036 = 0.36%."],
    ["104.7 is stored as 105. Absolute and relative error?", "Absolute 0.3; relative 0.3 ÷ 104.7 = 0.29%."],
    ["Why is relative error more useful than absolute error?", "The impact of an error depends on its size relative to the value: 0.1 is huge for 0.2 but negligible for 10 000."],
    ["Is absolute error ever negative?", "No — it is a magnitude."],
    ["Which value is the denominator in relative error?", "The intended (true) value."],
    ["Store 0.2265625 as 0.22558594: relative error?", "0.00097656 ÷ 0.2265625 = 0.43%."]
  ],
  quiz: [
    { q: "True value 50, stored 49.5. Absolute error:", opts: ["0.5", "−0.5", "1%", "0.01"], ans: 0, why: "|49.5 − 50|." },
    { q: "Relative error for the same case:", opts: ["0.5", "1%", "2%", "0.5%"], ans: 1, why: "0.5 ÷ 50 = 0.01." },
    { q: "An absolute error of 1 is worse for:", opts: ["a value of 1000", "a value of 3", "both equally", "neither"], ans: 1, why: "Relative error 33% vs 0.1%." },
    { q: "Relative error is calculated as:", opts: ["stored ÷ absolute", "absolute ÷ intended value", "intended − stored", "stored × intended"], ans: 1, why: "Definition." },
    { q: "A stored value of −0.0430 for a true −0.04296875: absolute error ≈", opts: ["0.00003", "0.0430", "0.00296", "0"], ans: 0, why: "|−0.0430 − (−0.04296875)| = 0.00003125." },
    { q: "A negative relative error answer is:", opts: ["fine", "rejected — errors are magnitudes", "correct if stored < true", "bonus"], ans: 1, why: "Mark-scheme R." }
  ],
  exam: [
    { src: "AQA 2021 P2 Q10", ctx: "A sensor reading of 104.7 is stored in a floating point format as 105.",
      parts: [
        { q: "Calculate the absolute error.", marks: 1, ms: ["0.3 (accept |104.7 − 105|) (1)"] },
        { q: "Calculate the relative error as a percentage.", marks: 1, ms: ["0.3 ÷ 104.7 = 0.29% (accept 0.0029; follow-through) (1)"] },
        { q: "Explain why relative error is often a more useful measure than absolute error.", marks: 1, ms: ["The effect of an error depends on its size relative to the number represented — the same absolute error is more significant for a smaller number (1)"] }
      ] },
    { src: "AQA 2025 P2 Q12.6", q: "The value 43 057 152 is stored as 42 991 616. Calculate the relative error as a percentage to 4 decimal places.", marks: 1,
      ms: ["(43 057 152 − 42 991 616) ÷ 43 057 152 = 65 536 ÷ 43 057 152 = 0.1522% (1)"] }
  ]
});

X("compsci:4.5.4.7", {
  flashcards: [
    ["What determines the range of a floating point number?", "The number of bits in the exponent."],
    ["What determines the precision?", "The number of bits in the mantissa."],
    ["Effect of moving a bit from mantissa to exponent?", "Range increases, precision decreases."],
    ["Largest positive value with 8-bit mantissa and 4-bit exponent?", "0.1111111 × 2⁷ = 127/128 × 128 = 127."],
    ["Smallest positive normalised value with the same format?", "0.1000000 × 2⁻⁸ = 0.5 × 1/256 = 1/512."],
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
    ["What does normalised mean for a two's complement mantissa?", "It begins 01 (positive) or 10 (negative) — the first two bits differ."],
    ["Why are floating point numbers normalised? (give two reasons)", "It maximises precision for a given number of bits (no leading redundant bits), and gives each number a unique representation, making equality tests simpler."],
    ["Normalise 0.0011 × 2⁵.", "0.11 × 2³ — shift the point right 2 places, subtract 2 from the exponent."],
    ["Is 00110000 a normalised mantissa?", "No — it starts 00; shift left once to 01100000 and reduce the exponent by 1."],
    ["Is 11000000 normalised?", "No — a negative normalised mantissa starts 10."],
    ["Which is the smallest positive normalised mantissa?", "0.1000000 = 0.5."],
    ["Which mantissa represents the most negative normalised value?", "1.0000000 = −1."],
    ["What happens to precision if a number is stored un-normalised?", "Leading bits carry no information, so fewer significant bits remain — precision is lost."]
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

X("compsci:4.5.4.9", {
  flashcards: [
    ["Define overflow.", "The result of a calculation is too large (in magnitude) to be represented in the available number of bits."],
    ["Define underflow.", "The result of a calculation is so close to zero that it cannot be represented and is stored as zero."],
    ["When does overflow occur in floating point?", "When the required exponent exceeds the largest exponent the bits can hold."],
    ["When does underflow occur in floating point?", "When the required exponent is more negative than the smallest exponent available."],
    ["How can overflow be avoided?", "Allocate more bits to the exponent (possibly reallocating from the mantissa)."],
    ["Give an integer overflow example.", "127 + 1 in 8-bit two's complement gives 10000000 = −128."],
    ["Is 'stack overflow' the same thing?", "No — that is exhausting the call stack; the examiners reject it here."],
    ["What might a program do on overflow?", "Raise an exception, wrap around silently, or saturate — depending on the language/hardware."]
  ],
  quiz: [
    { q: "Multiplying two large floating point numbers so the exponent no longer fits causes:", opts: ["underflow", "overflow", "rounding", "normalisation"], ans: 1, why: "Too large." },
    { q: "Dividing a tiny number by a huge one so the result is stored as 0 is:", opts: ["overflow", "underflow", "truncation", "a syntax error"], ans: 1, why: "Too close to zero." },
    { q: "Overflow in 8-bit unsigned addition is signalled by:", opts: ["a negative result", "a carry out of the MSB", "a zero", "underflow"], ans: 1, why: "9th bit." },
    { q: "To reduce the risk of overflow:", opts: ["add mantissa bits", "add exponent bits", "normalise", "truncate"], ans: 1, why: "Range." },
    { q: "'Stack overflow' as an answer to a floating point overflow question is:", opts: ["accepted", "rejected", "worth half", "correct"], ans: 1, why: "Different concept." },
    { q: "The smallest positive value being stored as 0 is a symptom of:", opts: ["overflow", "underflow", "rounding up", "normalisation"], ans: 1, why: "Underflow." }
  ],
  exam: [
    { src: "AQA 2023 P2 Q6.3", q: "Distinguish between overflow and underflow in a floating point system.", marks: 2,
      ms: ["Overflow: the result of a calculation is too large to fit in the available number of bits / exponent (1)", "Underflow: the result is so close to zero that it cannot be represented and is stored as zero (1)"] },
    { src: "AQA 2016 P2 Q3", q: "A program repeatedly halves a small positive floating point value. Explain what will eventually happen and why.", marks: 2,
      ms: ["Underflow — the value becomes so close to zero that it cannot be represented (1)", "Because the exponent needed is more negative than the smallest the exponent bits can hold, so the value is stored as zero (1)"] }
  ]
});

})(KOS.content.extend);
