/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.5.4
   (the binary number system: unsigned binary and its arithmetic, two's
   complement, fixed and floating point, rounding, absolute and relative
   error, range and precision, normalisation, underflow and overflow) at
   full A-level depth. Each topic REPLACES the short entry the older files
   carried; every way AQA has examined it (7516/2 June 2016–2025, 7517/2
   June 2017–2025) is explained, worked step by step and answered in the
   mark scheme's own format. Every bit pattern was checked by program.
   Past-paper banks stay in bank-cs-45a.js / bank-cs-45b.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers ---- */

/* a row of bit cells with place values above; o.point draws a binary point
   before cell o.point; o.groups underlines ranges with a label */
function bitsFig(bits, weights, o) {
  o = o || {};
  var n = bits.length, cw = o.cw || 46, x0 = o.x0 || 20, it = [];
  for (var i = 0; i < n; i++) {
    var x = x0 + i * cw, on = bits[i] === "1";
    if (weights) it.push({ text: [x + cw / 2, 18], t: String(weights[i]), size: o.ws || 11.5, c: (o.neg === i) ? "accent2" : "muted" });
    it.push({ poly: [[x, 30], [x + cw, 30], [x + cw, 70], [x, 70]], fill: on ? "accent" : null, alpha: on ? 0.28 : 0, c: "line", w: 1.4 });
    it.push({ text: [x + cw / 2, 50], t: bits[i], b: true, size: 15, c: on ? "text" : "muted" });
  }
  if (o.point != null) it.push({ circle: [x0 + o.point * cw, 70, 3.5], fill: "accent2", alpha: 1, c: "accent2", w: 1 });
  (o.groups || []).forEach(function (g) {
    var gx0 = x0 + g[0] * cw, gx1 = x0 + (g[1] + 1) * cw;
    it.push({ line: [[gx0 + 4, 80], [gx1 - 4, 80]], c: g[3] || "accent2", w: 2 }, { text: [(gx0 + gx1) / 2, 96], t: g[2], b: true, c: g[3] || "accent2", size: 13 });
  });
  return { w: o.w || x0 * 2 + n * cw, h: o.h || (o.groups ? 106 : 80), items: it.concat(o.extra || []), cap: o.cap };
}
/* a floating point number: mantissa cells (binary point after the sign
   bit) and exponent cells, each labelled */
function fpFig(m, e, cap, o) {
  o = o || {};
  var cw = 38, it = [], x0 = 16, gap = 30;
  function cells(bits, x, label, col) {
    bits.split("").forEach(function (b, i) {
      var xx = x + i * cw, on = b === "1";
      it.push({ poly: [[xx, 34], [xx + cw, 34], [xx + cw, 72], [xx, 72]], fill: on ? col : null, alpha: on ? 0.28 : 0, c: "line", w: 1.4 });
      it.push({ text: [xx + cw / 2, 53], t: b, b: true, size: 15, c: on ? "text" : "muted" });
    });
    it.push({ text: [x + bits.length * cw / 2, 18], t: label, b: true, c: col, size: 12 });
  }
  cells(m, x0, "Mantissa (two's complement)", "accent");
  it.push({ circle: [x0 + cw, 72, 3.5], fill: "accent2", alpha: 1, c: "accent2", w: 1 });
  var ex = x0 + m.length * cw + gap;
  cells(e, ex, "Exponent (two's complement)", "accent3");
  if (o.notes) o.notes.forEach(function (t, i) { it.push({ text: [x0, 92 + i * 16], t: t, pos: "e", size: 12, c: "text2", off: 0 }); });
  return { w: ex + e.length * cw + x0, h: o.notes ? 96 + o.notes.length * 16 : 84, items: it, cap: cap };
}
/* a column addition laid out as AQA prints it: two numbers, the result
   and the carry row (the carry each column produces, as the mark scheme
   writes it) */
function addFig(a, b, res, carry, cap) {
  var cw = 40, x0 = 120, it = [], rows = [["Number 1", a, "text"], ["Number 2", b, "text"], ["Result", res, "accent"], ["Carry", carry, "accent2"]];
  rows.forEach(function (r, ri) {
    var y = 14 + ri * 36;
    it.push({ text: [x0 - 12, y + 16], t: r[0], pos: "w", b: true, size: 12, c: r[2], off: 0 });
    r[1].split("").forEach(function (bit, i) {
      var x = x0 + i * cw;
      it.push({ poly: [[x, y], [x + cw, y], [x + cw, y + 32], [x, y + 32]], fill: ri === 2 ? "accent" : (ri === 3 && bit === "1" ? "accent2" : null), alpha: ri === 2 ? 0.16 : 0.25, c: "line", w: 1.2 });
      it.push({ text: [x + cw / 2, y + 16], t: bit, b: ri >= 2, size: 14, c: ri === 3 && bit !== "1" ? "muted" : r[2] });
    });
  });
  it.push({ line: [[x0, 86], [x0 + a.length * cw, 86]], c: "text2", w: 2 });
  return { w: x0 + a.length * cw + 16, h: 160, items: it, cap: cap };
}
function pow2(n) { return n < 0 ? "1/" + Math.pow(2, -n) : String(Math.pow(2, n)); }
function weights(intBits, fracBits, signed) {
  var w = [];
  for (var i = intBits - 1; i >= -fracBits; i--) w.push(i < 0 ? pow2(i) : String(Math.pow(2, i)));
  if (signed) w[0] = "−" + w[0];
  return w;
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **BOD** benefit of the doubt · **//** alternative wordings of one point.",
  "Calculation questions give **method marks** for listed working when the final answer is wrong — so always show the working, even when it is not demanded."
] } };

/* =====================================================================
   4.5.4.1  Unsigned binary
   ===================================================================== */
C["compsci:4.5.4.1"] = {
  notes: [
    { h: "Unsigned binary — the whole topic on one page" },
    "Spec 4.5.4.1: know the difference between **unsigned binary** and **signed binary**; know that in unsigned binary the minimum and maximum values for a given number of bits, n, are **0** and **2ⁿ − 1**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Decimal → 8-bit unsigned binary", "Convert / Represent", "1", "AS 2022 Q02.1 (177), AS 2024 Q02.2 (139)"],
      ["Unsigned binary → decimal", "Convert", "1", "AS 2025 Q02.2"],
      ["Lowest and highest values in n bits", "State", "2", "AS 2022 Q03.1 (16 bits)"],
      ["Unsigned vs signed: why both exist", "Explain / Compare", "1–2", "variation"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Unsigned and signed**.", "**Converting** — both directions, step by step.", "**Exam toolkit**."] },

    { page: "Unsigned and signed" },
    { callout: { t: "def", h: "Unsigned binary", body: "An **unsigned binary** integer represents only **non-negative** values (natural numbers): every bit has a **positive** place value (2ⁿ⁻¹ … 2¹, 2⁰). With n bits the range is **0 to 2ⁿ − 1**." } },
    { callout: { t: "def", h: "Signed binary", body: "A **signed binary** integer can represent **negative and positive** values. AQA uses **two's complement** (4.5.4.3), in which the most significant bit has a **negative** place value." } },
    { fig: bitsFig("10110001".split(""), ["128", "64", "32", "16", "8", "4", "2", "1"], { cap: "177 as 8-bit unsigned binary: 128 + 32 + 16 + 1 = 177." }) },
    { table: { head: ["n bits", "Unsigned range", "Two's complement range"], rows: [
      ["4", "0 to 15", "−8 to 7"], ["8", "0 to 255", "−128 to 127"], ["12", "0 to 4095", "−2048 to 2047"], ["16", "0 to 65 535", "−32 768 to 32 767"], ["n", "0 to 2ⁿ − 1", "−2ⁿ⁻¹ to 2ⁿ⁻¹ − 1"]
    ] } },
    { h: "Comparison: unsigned vs two's complement" },
    { table: { head: ["", "Unsigned", "Two's complement (signed)"], rows: [
      ["Values", "0 and positive only", "negative, zero and positive"],
      ["Most significant bit", "+2ⁿ⁻¹", "−2ⁿ⁻¹ (a sign weight)"],
      ["Largest value (8 bits)", "255", "127 — half the positive range"],
      ["Same number of patterns", "2ⁿ", "2ⁿ"],
      ["Use", "counts, memory addresses, colour values, ASCII codes", "temperatures, account balances, offsets, any value that can be negative"]
    ] } },
    { callout: { t: "miscon", h: "\"10110001 is 177\" — always?", body: "Only if it is **unsigned**. The same bit pattern in two's complement is −128 + 32 + 16 + 1 = **−79**. A bit pattern has no value until you know its representation." } },

    { page: "Converting" },
    { h: "Decimal → unsigned binary (subtract place values)" },
    { steps: [
      { h: "1. Write the place values", m: "128, 64, 32, 16, 8, 4, 2, 1 for 8 bits." },
      { h: "2. From the left", m: "If the place value fits into what is left, write 1 and subtract it; otherwise write 0." },
      { h: "3. Continue", m: "until the remainder is 0; pad to the required number of bits." }
    ] },
    { worked: { tag: "exam", title: "177 in 8-bit unsigned binary", src: "AS June 2022 · P2 Q02.1 · 1 mark",
      q: "Convert the decimal number 177 to unsigned binary using 8 bits.",
      steps: [
        { m: "177 − 128 = 49 → 1; 64 too big → 0; 49 − 32 = 17 → 1; 17 − 16 = 1 → 1; 8, 4, 2 → 0 0 0; 1 − 1 = 0 → 1" },
        { m: "**1011 0001**", mk: "1 mark" }
      ], result: "10110001" } },
    { worked: { tag: "exam", title: "139 as an 8-bit unsigned integer", src: "AS June 2024 · P2 Q02.2 · 1 mark",
      q: "Represent the decimal number 139 as an 8-bit unsigned binary integer.",
      steps: [{ m: "139 = 128 + 8 + 2 + 1" }, { m: "**1000 1011**", mk: "1 mark" }], result: "10001011" } },
    { worked: { tag: "exam", title: "Unsigned binary → decimal", src: "AS June 2025 · P2 Q02.2 · 1 mark",
      q: "The bit pattern 0 1 0 0 0 0 1 1 represents an 8-bit unsigned binary integer. Convert it to decimal.",
      steps: [{ m: "64 + 2 + 1" }, { m: "**67**", mk: "1 mark" }], result: "67" } },
    { worked: { tag: "exam", title: "The range of 16-bit unsigned binary", src: "AS June 2022 · P2 Q03.1 · 2 marks",
      q: "State, in decimal, the lowest and highest values that could be represented in unsigned binary when using 16 bits.",
      steps: [{ m: "Lowest: **0**", mk: "1 mark" }, { m: "Highest: 2¹⁶ − 1 = **65 535**", mk: "1 mark", n: "A. 2¹⁶ − 1. Not 65 536 — that is the number of values." }], result: "0 and 65 535" } },
    { worked: { tag: "variation", title: "Decimal → binary by repeated division", q: "Convert 45 to 8-bit unsigned binary by repeated division by 2.",
      steps: [
        { m: "45 ÷ 2 = 22 r **1** → 22 ÷ 2 = 11 r **0** → 11 ÷ 2 = 5 r **1** → 5 ÷ 2 = 2 r **1** → 2 ÷ 2 = 1 r **0** → 1 ÷ 2 = 0 r **1**" },
        { m: "Remainders read upwards: 101101 → padded: **0010 1101**", n: "The same method as the AS 2019 Paper 1 program in 4.5.2.1." }
      ], result: "00101101" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Convert / Represent", "The exact bit count asked for (pad with leading 0s)."],
      ["State the lowest and highest", "0 and 2ⁿ − 1 — both needed."],
      ["Explain the difference (unsigned/signed)", "Unsigned holds only non-negative values; signed (two's complement) also holds negatives, using a negative MSB weight."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"n bits: zero to two-to-the-n minus one\"", body: "Unsigned range = 0 … 2ⁿ − 1." } },
    { callout: { t: "warn", h: "Specific errors", body: ["65 536 for the highest 16-bit value.", "Dropping leading zeros when 8 bits are required.", "Reading a pattern as unsigned when the question says two's complement."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.3.1 (2ⁿ values); 4.5.4.3 (two's complement); 4.7.1.1 (addresses are unsigned); 4.5.5.2 (ASCII codes are unsigned 7-bit values)." } }
  ],
  flashcards: [
    ["Range of n-bit unsigned binary?", "0 to 2ⁿ − 1."],
    ["Highest 8-bit unsigned value?", "255."],
    ["177 in binary?", "10110001."],
    ["Unsigned vs signed?", "Unsigned: non-negative only; signed (two's complement) also negative."],
    ["Highest 16-bit unsigned value?", "65 535."],
    ["01000011₂ unsigned?", "67."],
    ["Same pattern 10110001 in two's complement?", "−79."],
    ["What is unsigned binary used for?", "Counts, addresses, colour values, character codes."]
  ],
  quiz: [
    { q: "The largest 12-bit unsigned value is", opts: ["4095", "4096", "2047", "2048"], ans: 0, why: "2¹² − 1." },
    { q: "139 in 8-bit binary is", opts: ["10001011", "10001101", "11001011", "10010011"], ans: 0, why: "128 + 8 + 2 + 1." },
    { q: "Unsigned binary cannot represent", opts: ["negative numbers", "zero", "odd numbers", "large numbers"], ans: 0, why: "Every place value is positive." },
    { q: "11111111 unsigned is", opts: ["255", "−1", "256", "127"], ans: 0, why: "Sum of all place values." }
  ]
};

/* =====================================================================
   4.5.4.2  Unsigned binary arithmetic
   ===================================================================== */
C["compsci:4.5.4.2"] = {
  notes: [
    { h: "Unsigned binary arithmetic — the whole topic on one page" },
    "Spec 4.5.4.2: be able to **add** two and **multiply** two unsigned binary integers.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Add two unsigned integers, showing the carry row", "Show / Complete", "1–2", "AS 2017 Q02.2, AS 2023 Q03.2, AS 2024 Q02.3, AS 2025 Q02.3"],
      ["Multiply two unsigned integers, showing working", "Calculate", "2", "AS 2017 Q02.3, AS 2020 Q02.1, AS 2022 Q03.2"],
      ["Find the mistake in a student's addition", "Explain", "1", "A-level 2019 Q04"],
      ["Add after converting from hex", "Convert / add", "2", "AS 2018 Q02.2 (4.5.2.1)"],
      ["What happens when a result needs a ninth bit (overflow)", "Explain", "1–2", "variation"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Binary addition** — the four rules and the carry row.", "**Binary multiplication** — shift and add.", "**Overflow**.", "**Exam toolkit**."] },

    { page: "Binary addition" },
    { table: { head: ["Column sum (bits + carry in)", "Result bit", "Carry out"], rows: [
      ["0 + 0", "0", "0"], ["0 + 1 or 1 + 0", "1", "0"], ["1 + 1", "0", "1"], ["1 + 1 + 1 (with a carry in)", "1", "1"]
    ] } },
    { steps: [
      { h: "1. Line the numbers up", m: "right-aligned, same number of bits." },
      { h: "2. Work right to left", m: "add the two bits and any carry from the previous column." },
      { h: "3. Write the result bit and the carry", m: "AQA's carry row records the carry **produced by** each column (0010 0011 in the June 2024 answer); writing it under the next column instead is accepted if every 1 is in the right sequence." },
      { h: "4. Final carry", m: "a carry out of the leftmost column means the result does not fit (overflow)." }
    ] },
    { fig: addFig("00100011", "00101011", "01001110", "00100011", "AS June 2024: 00100011 + 00101011 = 01001110 (35 + 43 = 78). The carry row records the carry PRODUCED by each column, as in the mark scheme (0010 0011).") },
    { worked: { tag: "exam", title: "Add, showing all working", src: "AS June 2024 · P2 Q02.3 · 2 marks",
      q: "Show how the unsigned binary number 00100011 can be added to the unsigned binary number 00101011 without converting the numbers into decimal. You must show all your working in binary.",
      steps: [
        { h: "Column by column from the right", m: "1+1 = 0 carry 1; 1+1+1 = 1 carry 1; 0+0+1 = 1; 0+1 = 1; 0+0 = 0; 1+1 = 0 carry 1; 0+0+1 = 1; 0+0 = 0" },
        { m: "Answer **0100 1110**", mk: "1 mark" },
        { m: "Carry row **0010 0011** (the 1s in the correct columns)", mk: "1 mark", n: "0 carry bits may be omitted, but every 1 carry must be in its column." }
      ], result: "01001110" } },
    { worked: { tag: "exam", title: "Another addition with carries", src: "AS June 2025 · P2 Q02.3 · 2 marks",
      q: "Show how the 8-bit unsigned binary number 01001111 can be added to the 8-bit unsigned binary number 00001011 without converting the numbers into decimal. Show all your working in binary.",
      steps: [{ m: "Answer **0101 1010** (79 + 11 = 90)", mk: "1 mark" }, { m: "Carry row 000 1111 — four consecutive carries from the right", mk: "1 mark", n: "Some working must be shown for any marks." }], result: "01011010" } },
    { worked: { tag: "exam", title: "Find the student's mistake", src: "A-level June 2019 · P2 Q04 · 1 mark",
      q: "A student added 00110011 and 10110110 (columns labelled A to H from the left) and wrote the carry row 0110110 and the result 11001001. Explain what mistake the student has made.",
      steps: [
        { h: "Redo it", m: "00110011 + 10110110 = 11101001; the student's result differs in column C" },
        { m: "In column C the carry has not been included: the result in column C should be 1 (1 + 1 + carry 1 = 11).", mk: "1 mark", n: "NE. \"column C is wrong\" — say what is wrong with it." }
      ], result: "Column C: carry ignored" } },

    { page: "Binary multiplication" },
    "Multiplying by a binary digit gives either 0 or the number itself, so long multiplication becomes **shift and add**: for every 1 in the multiplier, write the multiplicand shifted left by that bit's position, then add the shifted copies.",
    { steps: [
      { h: "1.", m: "For each 1 bit in the multiplier (from the right, position k = 0, 1, 2 …), write the multiplicand shifted **left k places** (append k zeros)." },
      { h: "2.", m: "Ignore the 0 bits — they contribute nothing." },
      { h: "3.", m: "Add the partial products in binary." }
    ] },
    { worked: { tag: "exam", title: "Multiply 00101101 by 00000101", src: "AS June 2020 · P2 Q02.1 · 2 marks",
      q: "Figure 2 shows two unsigned binary integers, 00101101 and 00000101. What is the result in binary of multiplying the two numbers? You must show all your working in binary.",
      steps: [
        { h: "Multiplier 101 has 1s at positions 0 and 2", m: "101101 shifted 0: 00101101; $\\;$ shifted 2: 10110100", mk: "1 mark", n: "1 mark for relevant working: the bitwise products or their sum." },
        { h: "Add", m: "00101101 + 10110100 = **1110 0001** (45 × 5 = 225)", mk: "1 mark" }
      ], result: "11100001" } },
    { worked: { tag: "exam", title: "Multiply 00010101 by 00000111", src: "AS June 2022 · P2 Q03.2 · 2 marks",
      q: "Calculate the result of multiplying the unsigned binary integers 00010101 and 00000111 using binary multiplication. You must show your working in binary.",
      steps: [
        { h: "Three partial products (multiplier 111)", m: "00010101, 00101010, 01010100", mk: "1 mark", n: "Or the other way round: 00000111, 00011100, 01110000." },
        { h: "Add", m: "**1001 0011** (21 × 7 = 147)", mk: "1 mark" }
      ], result: "10010011" } },
    { worked: { tag: "exam", title: "Add and multiply the same pair", src: "AS June 2017 · P2 Q02.2–02.3 · 3 marks",
      q: "Two unsigned binary integers are 00010111 and 00000110. (a) What is the binary result of adding them? (b) What is the binary result of multiplying them? Show your working.",
      steps: [
        { h: "(a)", m: "**00011101** (23 + 6 = 29)", mk: "1 mark" },
        { h: "(b) multiplier 110: shifts of 1 and 2", m: "000101110 and 0001011100", mk: "1 mark" },
        { m: "sum **1000 1010** (23 × 6 = 138)", mk: "1 mark" }
      ], result: "(a) 00011101 (b) 10001010" } },

    { page: "Overflow" },
    { callout: { t: "def", h: "Overflow (integer)", body: "**Overflow** occurs when the result of a calculation is **too large to be stored in the available number of bits**. In unsigned addition it shows as a **carry out of the most significant bit**: the stored result is wrong (it has wrapped round)." } },
    { worked: { tag: "variation", title: "An 8-bit sum that overflows", q: "Add 11001000 and 01010000 in 8-bit unsigned binary and explain the result.",
      steps: [
        { m: "200 + 80 = 280, but the 8-bit result is 00011000 (24) with a carry of 1 out of the leftmost column." },
        { m: "280 > 255, the largest 8-bit value, so **overflow** has occurred; the processor sets its **overflow/carry flag** in the status register (4.7.3.1)." }
      ], result: "Overflow — stored 24, true 280" } },
    { callout: { t: "tip", h: "Multiplication doubles the width", body: "An n-bit × n-bit product can need **2n bits** (255 × 255 = 65 025, a 16-bit value). Processors keep a double-width result or flag overflow." } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Show how … can be added", "The answer AND the carry row, in binary; no decimal."],
      ["Calculate the product, show working", "The partial products (shifted copies) then their sum."],
      ["Explain the mistake", "Name the column and what was missed (the carry)."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"One plus one is zero, carry one\"", body: "And 1 + 1 + 1 is one, carry one." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Omitting the carry row when the question asks for it.", "Shifting partial products the wrong way (multiplication shifts LEFT).", "Converting to decimal — no credit when working in binary is required."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.4.1 half and full adders implement exactly these column rules; 4.5.4.3 subtraction is addition of a two's complement; 4.7.3.5 logical shift left multiplies by 2." } }
  ],
  flashcards: [
    ["1 + 1 in binary?", "0 carry 1 (10₂)."],
    ["1 + 1 + 1 in binary?", "1 carry 1 (11₂)."],
    ["How is binary multiplication done?", "Shift-and-add: a shifted copy of the multiplicand for every 1 in the multiplier."],
    ["00100011 + 00101011?", "01001110."],
    ["00101101 × 101?", "11100001."],
    ["What is overflow?", "A result too large for the available bits."],
    ["Sign of overflow in unsigned addition?", "A carry out of the most significant bit."],
    ["Bits needed for an n-bit × n-bit product?", "Up to 2n."]
  ],
  quiz: [
    { q: "0111 + 0011 =", opts: ["1010", "1000", "1110", "0110"], ans: 0, why: "7 + 3 = 10." },
    { q: "Multiplying by 100₂ is the same as", opts: ["shifting left 2 places", "shifting right 2", "adding 4", "shifting left 4"], ans: 0, why: "× 4." },
    { q: "11111111 + 00000001 in 8 bits gives", opts: ["00000000 with a carry (overflow)", "11111110", "100000000 stored", "00000001"], ans: 0, why: "Wraps round." },
    { q: "A carry row must show", opts: ["every 1 carry in its column", "only the final carry", "decimal values", "nothing"], ans: 0, why: "Mark scheme." }
  ]
};

/* =====================================================================
   4.5.4.3  Signed binary using two's complement
   ===================================================================== */
C["compsci:4.5.4.3"] = {
  notes: [
    { h: "Two's complement — the whole topic on one page" },
    "Spec 4.5.4.3: know that **signed binary** can be used to represent negative integers and that one possible coding scheme is **two's complement**; know how to represent negative and positive integers in two's complement; perform **subtraction** using two's complement; calculate the **range** of a given number of bits, n.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Two's complement pattern → decimal", "What is the decimal equivalent", "1", "AS 2016 Q02.4"],
      ["Range of n-bit two's complement", "State / In decimal", "1–2", "AS 2018 Q02.3 (12-bit), AS 2023 Q03.4 (8-bit), AS 2025 Q02.4 (4-bit), A-level 2025 Q07.4"],
      ["Subtract by adding the two's complement", "Show / Explain", "2–3", "AS 2019 Q02.4, AS 2023 Q03.3, AS 2024 Q02.4, AS 2025 Q02.5, A-level 2021 Q08"],
      ["Use a two's complement circuit to subtract", "Explain", "1", "AS 2016 Q05.5"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The representation** — the negative MSB.", "**Negating a number** — two methods.", "**Subtraction**.", "**Range**.", "**Exam toolkit**."] },

    { page: "The representation" },
    { callout: { t: "def", h: "Two's complement", body: "A signed binary representation in which the **most significant bit has a negative place value** (−2ⁿ⁻¹) and every other bit is positive. A pattern starting 0 is positive (read it like unsigned); a pattern starting 1 is negative." } },
    { fig: bitsFig("10110001".split(""), ["−128", "64", "32", "16", "8", "4", "2", "1"], { neg: 0, cap: "10110001 in two's complement: −128 + 32 + 16 + 1 = −79. Only the MSB's weight is negative." }) },
    { worked: { tag: "exam", title: "A two's complement pattern in decimal", src: "AS June 2016 · P2 Q02.4 · 1 mark",
      q: "What is the decimal equivalent of the bit pattern 00111001 if it represents a two's complement binary integer?",
      steps: [{ m: "MSB 0 → positive: 32 + 16 + 8 + 1" }, { m: "**57**", mk: "1 mark" }], result: "57" } },

    { page: "Negating a number" },
    { h: "Method 1 — flip the bits, add 1" },
    { steps: [
      { h: "1.", m: "Write the positive value in n bits: 36 = 00100100" },
      { h: "2.", m: "Invert every bit (one's complement): 11011011" },
      { h: "3.", m: "Add 1: 11011100 = −36" }
    ] },
    { h: "Method 2 — copy up to the first 1, flip the rest" },
    { steps: [
      { h: "1.", m: "From the right, copy bits up to and including the first 1: …100" },
      { h: "2.", m: "Invert every bit to its left: 11011 → **11011100**" }
    ] },
    "Check: −128 + 64 + 16 + 8 + 4 = −36 ✓. Either method works both ways (negating a negative gives the positive back).",
    { callout: { t: "miscon", h: "\"Put a 1 at the front for negative\"", body: "That is **sign and magnitude**, not two's complement. In two's complement −36 is 11011100, not 10100100. Two's complement is used because ordinary binary **addition** then works for negative numbers, so the processor needs no separate subtractor." } },

    { page: "Subtraction" },
    { callout: { t: "memorise", h: "A − B = A + (−B)", body: [
      "1. Write both numbers in n-bit two's complement.",
      "2. Find the two's complement of the number being **subtracted** (B → −B).",
      "3. **Add** it to the other number.",
      "4. **Discard any carry out** of the most significant bit; keep n bits."
    ] } },
    { worked: { tag: "exam", title: "Subtract 00100100 from 00011011", src: "AS June 2023 · P2 Q03.3 · 2 marks",
      q: "What is the result of subtracting the two's complement binary number 00100100 from the two's complement binary number 00011011? Give your answer in two's complement binary and show all your working in binary.",
      steps: [
        { h: "Negate the number being subtracted", m: "00100100 (36) → **11011100** (−36)", mk: "1 mark" },
        { h: "Add", m: "00011011 + 11011100 = **11110111** (27 − 36 = −9)", mk: "1 mark", n: "Follow-through allowed from a wrong −36. R. both marks if only decimal subtraction is used." }
      ], result: "11110111" } },
    { worked: { tag: "exam", title: "Subtract 00011100 from 00111011", src: "AS June 2024 · P2 Q02.4 · 2 marks",
      q: "Show how the 8-bit two's complement binary integer 00011100 can be subtracted from the 8-bit two's complement binary integer 00111011 without converting the numbers to decimal. Show all your working in binary.",
      steps: [
        { m: "00011100 (28) → **11100100** (−28)", mk: "1 mark" },
        { m: "00111011 + 11100100 = 1 00011111 → discard the carry → **00011111** (59 − 28 = 31)", mk: "1 mark" }
      ], result: "00011111" } },
    { worked: { tag: "exam", title: "A 3-mark subtraction: discard the extra bit", src: "AS June 2025 · P2 Q02.5 · 3 marks",
      q: "Using 8-bit two's complement binary, what is the result of subtracting 00110100 from 01101101? Give your answer in 8-bit two's complement binary and show all your working in binary.",
      steps: [
        { m: "00110100 (52) → **11001100** (−52)", mk: "1 mark" },
        { m: "01101101 + 11001100 = **100111001** (9 bits)", mk: "1 mark" },
        { m: "Discard the additional ninth bit: **00111001** (109 − 52 = 57)", mk: "1 mark", n: "The third mark is specifically for discarding the carry." }
      ], result: "00111001" } },
    { worked: { tag: "exam", title: "18 − 72 in 8-bit two's complement", src: "A-level June 2021 · P2 Q08 · 2 marks",
      q: "Use binary addition in 8-bit two's complement to perform the subtraction 18 − 72. Show both your working and your final answer in binary.",
      steps: [
        { m: "18 = 00010010; $\\;$ −72 = **10111000** (72 = 01001000, flip and add 1)", mk: "1 mark" },
        { m: "00010010 + 10111000 = **11001010** (= −54 ✓)", mk: "1 mark", n: "No carry out here: the answer is negative." }
      ], result: "11001010" } },
    { worked: { tag: "exam", title: "Explain the subtraction method", src: "AS June 2019 · P2 Q02.4 · 2 marks",
      q: "Explain how the two's complement binary integer 00100111 can be subtracted from the two's complement binary integer 01001001 without converting the numbers into decimal.",
      steps: [
        { m: "The (positive) number 00100111 must be converted to its negative equivalent, 11011001;", mk: "1 mark" },
        { m: "this negative number is then added to 01001001 (giving 00100010, discarding the carry);", mk: "1 mark", n: "\"Explain\": both the conversion and the addition must be described; working alone with no explanation earns only 1." }
      ], result: "Negate 00100111 → 11011001, then add" } },
    { worked: { tag: "exam", title: "Using a two's complement circuit to subtract", src: "AS June 2016 · P2 Q05.5 · 1 mark",
      q: "A logic circuit obtains the two's complement of a 3-bit binary number. Explain how this circuit could be used by a processor when subtracting one 3-bit binary number from another.",
      steps: [{ m: "Use the circuit on the number to be subtracted, then add the result to the other number.", mk: "1 mark", n: "R. \"the number to be added is negative\" — it is the circuit's output that is added." }], result: "Negate the subtrahend, then add" } },

    { page: "Range" },
    { callout: { t: "formula", h: "Range of n-bit two's complement", body: "Most negative **−2ⁿ⁻¹** (pattern 1000…0); most positive **2ⁿ⁻¹ − 1** (pattern 0111…1). Same 2ⁿ patterns as unsigned, shifted so half are negative." } },
    { worked: { tag: "exam", title: "8-bit range", src: "AS June 2023 · P2 Q03.4 · 1 mark",
      q: "In decimal, what are the lowest and highest values that can be represented by an 8-bit two's complement binary integer?",
      steps: [{ m: "Lowest **−128**; highest **+127**", mk: "1 mark", n: "Both must be correct for the mark." }], result: "−128 and 127" } },
    { worked: { tag: "exam", title: "4-bit range", src: "AS June 2025 · P2 Q02.4 · 2 marks",
      q: "What are the lowest and highest values that can be represented by a 4-bit two's complement binary integer? Give your answers in decimal.",
      steps: [{ m: "Lowest −2³ = **−8**", mk: "1 mark" }, { m: "Highest 2³ − 1 = **7**", mk: "1 mark" }], result: "−8 and 7" } },
    { worked: { tag: "exam", title: "Most negative in 12 bits", src: "AS June 2018 · P2 Q02.3 · 1 mark",
      q: "In decimal, what is the most negative number that can be represented using a 12-bit two's complement binary integer?",
      steps: [{ m: "−2¹¹ = **−2048**", mk: "1 mark" }], result: "−2048" } },
    { worked: { tag: "exam", title: "The range of an immediate operand", src: "A-level June 2025 · P2 Q07.4 · 1 mark",
      q: "In a 32-bit machine code instruction, Operand C is 12 bits. When immediate addressing is used, Operand C is a numeric value stored as a two's complement binary integer. In decimal, calculate the range of numbers that Operand C can represent (most positive and most negative).",
      steps: [{ m: "Most positive 2¹¹ − 1 = **2047**; most negative −2¹¹ = **−2048**", mk: "1 mark", n: "Both needed. Synoptic: 4.7.3.4 immediate addressing." }], result: "2047 and −2048" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Show how / Calculate (subtraction)", "Negate the subtrahend in binary; add; discard the carry. All in binary — decimal working scores 0."],
      ["Explain how (subtraction)", "Describe both steps in words: convert to the negative equivalent, then add."],
      ["State the range", "−2ⁿ⁻¹ and 2ⁿ⁻¹ − 1 — both."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Flip and add one\"", body: "Or: \"copy to the first 1, flip the rest\"." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Negating the wrong number (always negate the one being subtracted).", "Keeping the ninth bit.", "Sign-and-magnitude instead of two's complement.", "Range 128 instead of 127 for the top."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4.4 two's complement fixed point; 4.5.4.8 floating point mantissas and exponents are two's complement; 4.6.4.1 adders do the addition; 4.7.3.1 the status register's negative flag is the MSB." } }
  ],
  flashcards: [
    ["Place value of the MSB in 8-bit two's complement?", "−128."],
    ["How do you negate a two's complement number?", "Invert all the bits and add 1."],
    ["8-bit two's complement range?", "−128 to 127."],
    ["n-bit two's complement range?", "−2ⁿ⁻¹ to 2ⁿ⁻¹ − 1."],
    ["How is A − B done in binary?", "Add A to the two's complement of B; discard any carry."],
    ["−36 in 8-bit two's complement?", "11011100."],
    ["Why use two's complement?", "Addition works unchanged for negatives, so subtraction needs no extra circuit."],
    ["Most negative 12-bit value?", "−2048."],
    ["What is done with the carry out of the MSB?", "It is discarded."]
  ],
  quiz: [
    { q: "11111111 in 8-bit two's complement is", opts: ["−1", "255", "−127", "−128"], ans: 0, why: "−128 + 127." },
    { q: "−72 in 8-bit two's complement is", opts: ["10111000", "11001000", "01001000", "10110111"], ans: 0, why: "Flip 01001000 and add 1." },
    { q: "The 4-bit two's complement range is", opts: ["−8 to 7", "−7 to 7", "0 to 15", "−8 to 8"], ans: 0, why: "−2³ to 2³ − 1." },
    { q: "In A − B, which number is negated?", opts: ["B", "A", "both", "neither"], ans: 0, why: "The subtrahend." }
  ]
};

/* =====================================================================
   4.5.4.4  Numbers with a fractional part
   ===================================================================== */
C["compsci:4.5.4.4"] = {
  notes: [
    { h: "Numbers with a fractional part — the whole topic on one page" },
    "Spec 4.5.4.4: know how numbers with a fractional part can be represented in **fixed point** form and in **floating point** form in binary in a given number of bits; be able to **convert** for each representation from decimal to binary and from binary to decimal.",
    "AS papers ask fixed point every year; A-level Paper 2 has asked floating point every year since 2017:",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Unsigned fixed point → decimal", "Convert / What is the decimal equivalent", "2", "AS 2016 Q02.3, 2019 Q02.3, 2023 Q03.5, 2024 Q02.5"],
      ["Decimal → unsigned fixed point", "Convert / Represent", "2", "AS 2020 Q02.2, 2025 Q02.6"],
      ["Place the binary point to give a value", "Indicate", "1", "AS 2017 Q02.4"],
      ["Two's complement fixed point → decimal", "Convert, show working", "2", "A-level 2022 Q05.1"],
      ["Floating point → decimal", "Calculate, show working", "2", "A-level 2017–2025, every year"],
      ["Decimal → normalised floating point", "Write, show working", "3", "A-level 2017–2023 (see 4.5.4.8)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Fixed point**, unsigned.", "**Fixed point**, two's complement.", "**Floating point** — mantissa and exponent.", "**Floating point → decimal**, every A-level question.", "**Exam toolkit**."] },
    { diagram: "binary-number" },

    { page: "Fixed point, unsigned" },
    { callout: { t: "def", h: "Fixed point", body: "A **fixed point** binary number has its binary point in a **fixed, agreed position**: a set number of bits before it (place values 2ⁿ … 2⁰) and after it (place values ½, ¼, ⅛, …). The point itself is **not stored** — the format says where it is." } },
    { fig: bitsFig("00111001".split(""), weights(4, 4), { point: 4, cap: "AS June 2016: 0011.1001 with four bits each side = 2 + 1 + ½ + 1/16 = 3 9/16 = 3.5625." }) },
    { steps: [
      { h: "Binary → decimal", m: "1. Write the place values, the point in its agreed place. 2. Add the place values of the 1 bits: whole part + fractional part." },
      { h: "Decimal → binary", m: "1. Convert the whole part as usual. 2. For the fraction, subtract ½, ¼, ⅛ … in turn (or double the fraction repeatedly: each time it reaches 1 write 1 and subtract 1). 3. Fill exactly the bits asked for." }
    ] },
    { worked: { tag: "exam", title: "Four bits each side", src: "AS June 2016 · P2 Q02.3 · 2 marks",
      q: "What is the decimal equivalent of the bit pattern 00111001 if it represents an unsigned fixed-point binary value with four bits before and four bits after the binary point?",
      steps: [{ m: "Whole part 0011 = **3**", mk: "1 mark" }, { m: "Fraction .1001 = ½ + 1/16 = **9/16** (.5625) → 3 9/16 = 3.5625", mk: "1 mark", n: "Alternative: 57/16 for both marks (00111001 = 57, ÷ 2⁴)." }], result: "3.5625" } },
    { worked: { tag: "exam", title: "Five bits each side", src: "AS June 2019 · P2 Q02.3 · 2 marks",
      q: "The bit pattern 1001110001 represents an unsigned fixed-point binary number with five bits before and five bits after the binary point. Convert it into decimal.",
      steps: [{ m: "10011 = **19**", mk: "1 mark" }, { m: ".10001 = ½ + 1/32 = **17/32** (.53125) → 19.53125", mk: "1 mark" }], result: "19.53125" } },
    { worked: { tag: "exam", title: "Two bits before, six after", src: "AS June 2023 · P2 Q03.5 · 2 marks",
      q: "What is the decimal equivalent of the bit pattern 11011101 if it represents an unsigned fixed-point binary value with two bits before and six bits after the binary point?",
      steps: [{ m: "11 = **3**", mk: "1 mark" }, { m: ".011101 = ¼ + ⅛ + 1/16 + 1/64 = **29/64** (.453125) → 3.453125", mk: "1 mark", n: "Or 221/64 for 2 marks." }], result: "3.453125" } },
    { worked: { tag: "exam", title: "Four bits before, six after", src: "AS June 2024 · P2 Q02.5 · 2 marks",
      q: "The bit pattern 0111010110 represents a 10-bit unsigned fixed point binary number with four bits before and six bits after the binary point. Convert it to decimal.",
      steps: [{ m: "0111 = **7**", mk: "1 mark" }, { m: ".010110 = ¼ + 1/16 + 1/32 = **11/32** (.34375) → 7.34375", mk: "1 mark" }], result: "7.34375" } },
    { worked: { tag: "exam", title: "Decimal → fixed point with 5 bits after the point", src: "AS June 2020 · P2 Q02.2 · 2 marks",
      q: "Convert the decimal number 6.34375 into an unsigned fixed point binary number using 8 bits with 5 bits after the binary point.",
      steps: [
        { h: "Whole part in 3 bits", m: "6 = **110**", mk: "1 mark" },
        { h: "Fraction in 5 bits", m: ".34375 = ¼ + 1/16 + 1/32 → **.01011**", mk: "1 mark", n: "Doubling: .34375 → .6875 (0) → 1.375 (1) → .75 (0) … reading 0 1 0 1 1." }
      ], result: "110.01011" } },
    { worked: { tag: "exam", title: "Decimal → fixed point, four and four", src: "AS June 2025 · P2 Q02.6 · 2 marks",
      q: "Represent 5.75 as an 8-bit unsigned fixed point binary number with four bits before and four bits after the binary point.",
      steps: [{ m: "5 → **0101**", mk: "1 mark" }, { m: ".75 = ½ + ¼ → **.1100**", mk: "1 mark", n: "Max 1 if not in the correct format — all eight bits, four each side." }], result: "0101.1100" } },
    { worked: { tag: "exam", title: "Where does the point go?", src: "AS June 2017 · P2 Q02.4 · 1 mark",
      q: "Figure 2 shows the bit pattern 10011011. Indicate clearly where the binary point must be placed so that the value 19.375 is represented.",
      steps: [{ h: "19 = 10011; .375 = ¼ + ⅛ = .011", m: "**10011.011** — the point between the 5th and 6th bits", mk: "1 mark" }], result: "10011.011" } },

    { page: "Fixed point, two's complement" },
    "In **two's complement fixed point**, the leftmost bit's place value is **negative**; everything else is as before.",
    { fig: bitsFig("1011001011".split(""), weights(6, 4, true), { point: 6, neg: 0, cw: 44, cap: "A-level June 2022: −32 + 8 + 4 + ½ + ⅛ + 1/16 = −19.3125." }) },
    { worked: { tag: "exam", title: "Two's complement fixed point → decimal", src: "A-level June 2022 · P2 Q05.1 · 2 marks",
      q: "A number is stored using a fixed point representation and two's complement, with six bits before and four bits after the binary point: 1 0 1 1 0 0 1 0 1 1. Convert it to decimal, showing your working.",
      steps: [
        { h: "Method A — place values", m: "−32 + 8 + 4 = **−20**; $\\;$ + ½ + ⅛ + 1/16 = **+11/16** → −20 + 0.6875", mk: "1 mark", n: "Method marks for: −32; 8 + 4; ½ + ⅛ + 1/16 = 11/16." },
        { h: "Method B — negate", m: "two's complement of 101100.1011 is 010011.0101 = 19 5/16, so the value is −19 5/16" },
        { m: "**−19.3125** (−19 5/16, −309/16)", mk: "1 mark" }
      ], result: "−19.3125" } },

    { page: "Floating point" },
    { callout: { t: "def", h: "Floating point", body: "A **floating point** number is stored as a **mantissa** and an **exponent**: value = **mantissa × 2^exponent**. At AQA both are **two's complement**; the mantissa has its binary point **after its first (sign) bit**, so it lies between −1 and 1. The exponent says how many places the point really \"floats\": right if positive, left if negative." } },
    { fig: fpFig("01101000", "1101", "A-level June 2023: mantissa 0.1101000 = 13/16, exponent 1101 = −3, value 13/16 × 2⁻³ = 13/128.", { notes: ["mantissa place values: −1 . ½ ¼ ⅛ 1/16 1/32 1/64 1/128", "exponent place values: −8 4 2 1"] }) },
    { table: { head: ["Part", "Holds", "Bits decide"], rows: [
      ["Mantissa", "the significant digits, with the sign", "**precision** — more bits, more significant figures"],
      ["Exponent", "the power of 2 (where the point goes)", "**range** — more bits, larger and smaller magnitudes"]
    ] } },

    { page: "Floating point → decimal" },
    { callout: { t: "memorise", h: "Decoding, step by step", body: [
      "1. **Exponent** → decimal (two's complement): e.g. 1101 = −8 + 4 + 1 = −3.",
      "2. **Mantissa** → decimal (two's complement, point after the first bit): e.g. 0.1101000 = ½ + ¼ + 1/16 = 13/16.",
      "3. **Value = mantissa × 2^exponent** — or move the binary point: right for a positive exponent, left for a negative one (extend with the sign bit when moving left).",
      "Show working: the mark scheme's method mark is for the mantissa and exponent in decimal, or the moved point, or writing mantissa × 2^exponent."
    ] } },
    { worked: { tag: "exam", title: "A negative mantissa, positive exponent", src: "A-level June 2017 · P2 Q11.3 · 2 marks",
      q: "A computer uses a normalised floating point representation with an 8-bit mantissa and a 4-bit exponent, both two's complement. Calculate the decimal equivalent of mantissa 10110000, exponent 0011. Show your working.",
      steps: [
        { m: "Mantissa 1.0110000 = −1 + ¼ + ⅛ = **−5/8**; exponent 0011 = **3** // point moved 3 right: 1011.0000", mk: "1 mark" },
        { m: "−5/8 × 2³ = **−5**", mk: "1 mark" }
      ], result: "−5" } },
    { worked: { tag: "exam", title: "A negative exponent", src: "A-level June 2018 · P2 Q01.2 · 2 marks",
      q: "Using a normalised floating point representation (7-bit mantissa, 5-bit exponent, both two's complement), calculate the decimal equivalent of the number whose mantissa is 0.1011 (value 11/16) with exponent −3. Show your working.",
      steps: [{ m: "Mantissa 0.6875 (11/16), exponent −3 // point moved 3 places left", mk: "1 mark" }, { m: "11/16 × 2⁻³ = **11/128 = 0.0859375**", mk: "1 mark" }], result: "0.0859375" } },
    { worked: { tag: "exam", title: "Negative mantissa, small positive exponent", src: "A-level June 2019 · P2 Q11.2 · 2 marks",
      q: "8-bit mantissa, 4-bit exponent, both two's complement. Calculate the decimal equivalent of mantissa 10110010, exponent 0010. Show your working.",
      steps: [
        { m: "Mantissa 1.0110010 = −1 + ¼ + ⅛ + 1/64 = **−39/64** (−0.609375); exponent **2**", mk: "1 mark" },
        { m: "−39/64 × 4 = **−39/16 = −2.4375**", mk: "1 mark" }
      ], result: "−2.4375" } },
    { worked: { tag: "exam", title: "Both negative (7-bit mantissa, 5-bit exponent)", src: "A-level June 2020 · P2 Q02.2 · 2 marks",
      q: "7-bit mantissa, 5-bit exponent, both two's complement. Calculate the decimal equivalent of mantissa 1010100, exponent 11101. Express your answer to at least four decimal places or as a fraction.",
      steps: [
        { m: "Mantissa 1.010100 = −1 + ¼ + 1/16 = **−11/16**; exponent 11101 = −16 + 8 + 4 + 1 = **−3**", mk: "1 mark" },
        { m: "−11/16 × 2⁻³ = **−11/128 = −0.0859375**", mk: "1 mark" }
      ], result: "−0.0859375" } },
    { worked: { tag: "exam", title: "A whole-number result", src: "A-level June 2021 · P2 Q10.2 · 2 marks",
      q: "8-bit mantissa, 4-bit exponent, both two's complement. Calculate the decimal equivalent of mantissa 01101000, exponent 0110. Show your working.",
      steps: [{ m: "Mantissa 13/16 (0.8125), exponent 6 // point moved 6 right: 0110100.0", mk: "1 mark" }, { m: "13/16 × 64 = **52**", mk: "1 mark" }], result: "52" } },
    { worked: { tag: "exam", title: "A very small positive value", src: "A-level June 2022 · P2 Q05.3 · 2 marks",
      q: "8-bit mantissa, 4-bit exponent, both two's complement. Calculate the decimal equivalent of mantissa 01101100, exponent 1001, as a fraction or to 4 decimal places.",
      steps: [{ m: "Mantissa 0.1101100 = **27/32** (0.84375); exponent 1001 = −8 + 1 = **−7**", mk: "1 mark" }, { m: "27/32 × 2⁻⁷ = **27/4096 ≈ 0.0066**", mk: "1 mark" }], result: "27/4096" } },
    { worked: { tag: "exam", title: "Moving the point left", src: "A-level June 2023 · P2 Q06.1 · 2 marks",
      q: "8-bit mantissa, 4-bit exponent, both two's complement. Calculate the decimal equivalent of mantissa 01101000, exponent 1101.",
      steps: [{ m: "Mantissa **13/16**, exponent **−3** // point moved 3 left: 0.0001101", mk: "1 mark" }, { m: "**13/128 = 0.1015625**", mk: "1 mark" }], result: "0.1015625" } },
    { worked: { tag: "exam", title: "Negative mantissa, negative exponent", src: "A-level June 2024 · P2 Q04.2 · 2 marks",
      q: "8-bit mantissa, 4-bit exponent, both two's complement. Calculate the decimal equivalent of mantissa 10111000, exponent 1011.",
      steps: [{ m: "Mantissa 1.0111000 = −1 + ¼ + ⅛ + 1/16 = **−9/16**; exponent 1011 = **−5**", mk: "1 mark" }, { m: "−9/16 × 2⁻⁵ = **−9/512 ≈ −0.0176**", mk: "1 mark" }], result: "−9/512" } },
    { worked: { tag: "exam", title: "A 6-bit exponent", src: "A-level June 2025 · P2 Q12.4 · 2 marks",
      q: "8-bit mantissa, 6-bit exponent, both two's complement. Calculate the decimal equivalent of mantissa 10101000, exponent 111100, to at least four decimal places or as a fraction.",
      steps: [{ m: "Mantissa 1.0101000 = −1 + ¼ + 1/16 = **−11/16**; exponent 111100 = **−4**", mk: "1 mark" }, { m: "−11/16 × 2⁻⁴ = **−11/256 = −0.0430**", mk: "1 mark" }], result: "−0.0430" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Convert (fixed point)", "1 mark whole part, 1 mark fractional part; an improper fraction (57/16) earns both."],
      ["Calculate the decimal equivalent (floating)", "Method: mantissa and exponent in decimal, or the moved point. Answer: exact fraction or the decimal places asked for."],
      ["Represent / Convert to binary", "Exactly the bits asked for, point in the agreed place."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Mantissa matters, exponent explores\"", body: "The **mantissa** holds the digits (precision); the **exponent** decides how far the point moves (range)." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Reading the mantissa as unsigned (forgetting its −1 sign bit).", "Moving the point the wrong way for a negative exponent.", "Dropping the sign extension when moving left (1.011 × 2⁻² = 1.11011, not 0.01011).", "Rounding when an exact fraction was available."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4.3 two's complement in both fields; 4.5.4.5–4.5.4.7 rounding, errors and range; 4.5.4.8 normalisation; 4.6.4 the floating point unit is extra hardware — 4.5.4.7 fixed point is faster." } }
  ],
  flashcards: [
    ["What is fixed point?", "Binary with the point in a fixed, agreed (unstored) position."],
    ["Place values after the point?", "½, ¼, ⅛, 1/16 …"],
    ["0011.1001 unsigned?", "3.5625."],
    ["5.75 in 4.4 fixed point?", "0101.1100."],
    ["Floating point value?", "mantissa × 2^exponent."],
    ["Where is the mantissa's binary point (AQA)?", "After the first (sign) bit."],
    ["What does the exponent decide?", "Range."],
    ["What does the mantissa decide?", "Precision."],
    ["01101000 / 0110 (8,4)?", "52."],
    ["10110000 / 0011 (8,4)?", "−5."]
  ],
  quiz: [
    { q: "11011101 with 2 bits before the point is", opts: ["3.453125", "221", "3.5", "13.8125"], ans: 0, why: "221/64." },
    { q: "Mantissa 01000000 means", opts: ["+½", "+64", "−½", "1"], ans: 0, why: "0.1000000." },
    { q: "A negative exponent moves the point", opts: ["left", "right", "nowhere", "to the end"], ans: 0, why: "Divides by a power of 2." },
    { q: "10111000 / 1011 (8,4) equals", opts: ["−9/512", "9/512", "−9/16", "−0.5625 × 32"], ans: 0, why: "−9/16 × 2⁻⁵." }
  ],
  sims: ["binary-number"], gens: ["float", "bin"]
};

/* =====================================================================
   4.5.4.5  Rounding errors
   ===================================================================== */
C["compsci:4.5.4.5"] = {
  notes: [
    { h: "Rounding errors — the whole topic on one page" },
    "Spec 4.5.4.5: know and be able to explain why both fixed point and floating point representation of decimal numbers may be **inaccurate**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Why a rounding error occurs; what the system might do", "Explain", "2", "A-level 2020 Q02.5"],
      ["Closest possible normalised representation", "Write, show working", "3", "A-level 2024 Q04.3, 2025 Q12.5"],
      ["Bits to add to represent a value exactly", "What is the smallest number", "1", "A-level 2024 Q04.4"],
      ["Name the error: rounding / overflow / underflow", "State", "2", "A-level 2023 Q06.3 (4.5.4.9)"],
      ["Why can't 0.1 be stored exactly?", "Explain", "1–2", "variation"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Why binary rounds**.", "**Closest representations**.", "**Exam toolkit**."] },

    { page: "Why binary rounds" },
    { callout: { t: "memorise", h: "Two reasons a decimal cannot be stored exactly", body: [
      "1. **Not enough bits**: the binary form has **more significant digits than there are bits** (in the mantissa / after the point) — 28.25 = 11100.01 needs 7 significant bits plus a sign.",
      "2. **It never ends in binary**: a fraction whose denominator is not a power of 2 recurs forever — 0.1 = 0.000110011001100…₂ — so any finite number of bits must cut it short."
    ] } },
    { fig: { x: [0, 11], y: [0.06, 0.104], w: 500, h: 220, axes: { x: "fractional bits used", y: "stored value", xt: [2, 4, 6, 8, 10], yt: [{ v: 0.0625, label: "0.0625" }, { v: 0.1, label: "0.1" }] },
      items: [
        { hline: 0.1, c: "accent2", label: "true value 0.1" },
        { line: [[4, 0.0625], [5, 0.09375]], c: "accent", w: 2.2 }, { line: [[5, 0.09375], [8, 0.09765625]], c: "accent", w: 2.2 }, { line: [[8, 0.09765625], [9, 0.099609375]], c: "accent", w: 2.2 }, { line: [[9, 0.099609375], [10, 0.099609375]], c: "accent", w: 2.2 },
        { pt: [4, 0.0625], r: 3 }, { pt: [5, 0.09375], r: 3 }, { pt: [8, 0.09765625], r: 3 }, { pt: [9, 0.099609375], r: 3 }
      ], cap: "Truncating 0.1 = 0.0001100110011…₂ after more and more bits: closer and closer, never equal." } },
    { worked: { tag: "variation", title: "Why 0.1 + 0.2 ≠ 0.3 in a program", q: "In C#, `Console.WriteLine(0.1 + 0.2 == 0.3);` prints False. Explain.",
      steps: [
        { m: "0.1, 0.2 and 0.3 all recur in binary, so each `double` stores the nearest representable value, not the exact decimal;" },
        { m: "the rounding errors in 0.1 and 0.2 add up to a sum (0.30000000000000004) that differs from the stored 0.3, so the test for equality fails." },
        { m: "Fix: compare with a tolerance, `Math.Abs(a - b) < 1e-9`, or use `decimal` for money." }
      ], result: "Accumulated rounding error" } },
    { worked: { tag: "exam", title: "28.25 in a 7-bit mantissa", src: "A-level June 2020 · P2 Q02.5 · 2 marks",
      q: "A normalised floating point representation has a 7-bit mantissa and a 5-bit exponent, both two's complement. When 28.25 is converted into binary in this system, a rounding error occurs. Explain why it occurs and what the system might do when 28.25 is converted.",
      steps: [
        { h: "Why", m: "28.25 = 11100.01₂ has 7 significant digits, so with the sign bit it needs 8 mantissa bits — there are not enough bits in the mantissa to represent it exactly;", mk: "1 mark", n: "R. \"28.25 can never be represented exactly in binary\" — it can, with more bits." },
        { h: "What the system does", m: "it rounds to the nearest representable value (28 or 28.5), or truncates it (28);", mk: "1 mark", n: "R. \"an error would be generated\"." }
      ], result: "Too few mantissa bits; rounded/truncated to 28 or 28.5" } },

    { page: "Closest representations" },
    { steps: [
      { h: "1.", m: "Write the value in fixed point binary, in full." },
      { h: "2.", m: "Normalise: point after the leading 0 (positive) or 1 (negative); the number of places moved is the exponent." },
      { h: "3.", m: "Keep as many mantissa bits as the format allows and **round** the next bit (round to nearest)." },
      { h: "4.", m: "Write mantissa and exponent in two's complement; the stored value is the closest representable value." }
    ] },
    { worked: { tag: "exam", title: "The closest representation of 12.765625", src: "A-level June 2024 · P2 Q04.3 · 3 marks",
      q: "A normalised floating point representation has an 8-bit mantissa and a 4-bit exponent, both two's complement. The decimal number 12.765625 (817/64) cannot be represented exactly. Write the closest possible normalised representation, showing your working.",
      steps: [
        { m: "12.765625 = **1100.110001₂**", mk: "1 mark" },
        { m: "7 significant bits available after the sign: 1100.110|001 → rounds to **1100.110** (the next bit is 0)" },
        { m: "Mantissa **0.1100110**, exponent **4** (0100) — point moved 4 places left", mk: "1 mark" },
        { m: "**01100110 0100** (= 12.75)", mk: "1 mark" }
      ], result: "01100110 0100" } },
    { worked: { tag: "exam", title: "How many more mantissa bits?", src: "A-level June 2024 · P2 Q04.4 · 1 mark",
      q: "What is the smallest number of bits that would need to be added to the 8-bit mantissa so that 12.765625 could be represented exactly?",
      steps: [{ m: "1100.110001 has 10 significant bits; with the sign bit the mantissa needs 11 bits → add **3**", mk: "1 mark" }], result: "3" } },
    { worked: { tag: "exam", title: "A large integer that cannot be stored exactly", src: "A-level June 2025 · P2 Q12.5 · 3 marks",
      q: "A normalised floating point representation has an 8-bit mantissa and a 6-bit exponent, both two's complement. The value 43 057 152 cannot be represented exactly. Write the closest possible normalised representation, showing your working.",
      steps: [
        { m: "43 057 152 = **10 1001 0001 0000 0000 0000 0000₂** (26 bits) = 2²⁵ + 2²³ + 2²⁰ + 2¹⁶", mk: "1 mark" },
        { m: "Only 7 significant bits fit: 2²⁵ + 2²³ + 2²⁰ = 42 991 616 (the 2¹⁶ bit is lost)", mk: "1 mark" },
        { m: "Mantissa **01010010**, exponent 26 = **011010**", mk: "1 mark" }
      ], result: "01010010 011010" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain why a rounding error occurs", "Not enough bits (of precision) for the significant digits — say *mantissa* for floating point."],
      ["Explain what the system does", "Rounds to the nearest representable value, or truncates."],
      ["Write the closest representation", "Fixed point form, the rounded mantissa, the exponent — each is a method mark."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Too many digits, too few bits\"", body: "The whole cause of rounding error in one line." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Saying the number can \"never\" be represented in binary (R.).", "Forgetting the sign bit when counting mantissa bits needed.", "Truncating when the question says closest (round)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.1.3 rationals with non-power-of-2 denominators; 4.5.4.6 measuring the error; 4.5.4.7 precision; 4.1 programming — never test floats for exact equality." } }
  ],
  flashcards: [
    ["Why may a fixed or floating point value be inaccurate?", "Not enough bits for its significant digits, or its binary form recurs."],
    ["Can 0.1 be stored exactly in binary?", "No — it recurs (0.000110011…)."],
    ["What might the system do with 28.25 in a 7-bit mantissa?", "Round to 28 or 28.5, or truncate to 28."],
    ["Closest (8,4) representation of 12.765625?", "01100110 0100 = 12.75."],
    ["Why does 0.1 + 0.2 ≠ 0.3 in code?", "Each is stored rounded; the errors accumulate."],
    ["How should floats be compared?", "Within a tolerance, not with ==."],
    ["Which fractions are exact in binary?", "Those whose denominator is a power of 2."],
    ["Rounding vs truncation?", "Rounding picks the nearest value; truncation drops the extra bits."]
  ],
  quiz: [
    { q: "Which can be stored exactly in binary?", opts: ["0.375", "0.1", "0.2", "1/3"], ans: 0, why: "3/8." },
    { q: "A rounding error occurs because", opts: ["there are too few bits for the significant digits", "binary is inaccurate", "the exponent is negative", "of overflow"], ans: 0, why: "Precision." },
    { q: "43 057 152 in (8,6) floating point is stored as", opts: ["42 991 616", "43 057 152", "43 000 000", "0"], ans: 0, why: "Only 7 significant bits." },
    { q: "To compare two doubles safely use", opts: ["a tolerance", "==", "!=", "a cast to int"], ans: 0, why: "Rounding." }
  ]
};

/* =====================================================================
   4.5.4.6  Absolute and relative errors
   ===================================================================== */
C["compsci:4.5.4.6"] = {
  notes: [
    { h: "Absolute and relative errors — the whole topic on one page" },
    "Spec 4.5.4.6: be able to calculate the **absolute error** of numerical data stored and processed in computer systems; calculate the **relative error**; compare absolute and relative errors for large and small magnitude numbers, and numbers close to one.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Absolute error", "Calculate", "1", "A-level 2017 Q11.5, 2021 Q10.3"],
      ["Relative error as a percentage", "Calculate", "1–2", "A-level 2017 Q11.6, 2021 Q10.4, 2022 Q05.5, 2025 Q12.6"],
      ["Why relative error matters more", "Explain", "1", "A-level 2021 Q10.5"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The two errors**.", "**Errors in exam questions**.", "**Exam toolkit**."] },

    { page: "The two errors" },
    { callout: { t: "formula", h: "Definitions", body: [
      "**Absolute error** = | value intended − value stored | — the size of the difference, always positive, in the units of the value.",
      "**Relative error** = absolute error ÷ | value intended | — the error as a **proportion of the value**, often × 100 for a percentage."
    ] } },
    { table: { head: ["Intended", "Stored", "Absolute error", "Relative error"], rows: [
      ["0.5", "0.4", "0.1", "20%"], ["1000.5", "1000.4", "0.1", "0.01%"], ["13.8", "13.75", "0.05", "0.36%"], ["104.7", "105", "0.3", "0.29%"]
    ] } },
    "The first two rows share an absolute error but differ by a factor of 2000 in relative error: the same slip matters far more to a small number.",
    { callout: { t: "miscon", h: "Absolute error is never negative", body: "Write 0.05, not −0.05 — the mark scheme **rejects** a negative absolute error unless the method is shown, and **rejects −0.43%** as a relative error." } },

    { page: "Errors in exam questions" },
    { worked: { tag: "exam", title: "13.8 stored as 13.75: both errors", src: "A-level June 2017 · P2 Q11.5–11.6 · 2 marks",
      q: "The closest possible floating point representation of 13.8 is stored; converting it back gives 13.75. (a) Calculate the absolute error. (b) Calculate the relative error as a percentage to two decimal places.",
      steps: [
        { h: "(a)", m: "13.8 − 13.75 = **0.05**", mk: "1 mark", n: "R. −0.05." },
        { h: "(b)", m: "0.05 ÷ 13.8 = 0.00362… = **0.36%**", mk: "1 mark", n: "A. 0.0036; follow-through from (a)." }
      ], result: "0.05; 0.36%" } },
    { worked: { tag: "exam", title: "104.7 stored as 105", src: "A-level June 2021 · P2 Q10.3–10.4 · 2 marks",
      q: "In a floating point system the closest representation of 104.7 is 105. Calculate (a) the absolute error, (b) the relative error as a percentage to two decimal places.",
      steps: [{ h: "(a)", m: "| 104.7 − 105 | = **0.3**", mk: "1 mark" }, { h: "(b)", m: "0.3 ÷ 104.7 = **0.29%**", mk: "1 mark" }], result: "0.3; 0.29%" } },
    { worked: { tag: "exam", title: "Why relative error matters more", src: "A-level June 2021 · P2 Q10.5 · 1 mark",
      q: "Explain why the relative error is usually considered to be a more important measure of error than the absolute error.",
      steps: [{ m: "The effect of an error depends on its size **relative to the number being represented**: a particular absolute error is more significant for a small number and less significant for a large one.", mk: "1 mark", n: "NE. \"relative error shows the significance of the error\" — say *relative to what*." }], result: "Error must be judged against the value's size" } },
    { worked: { tag: "exam", title: "A negative value's relative error", src: "A-level June 2022 · P2 Q05.5 · 2 marks",
      q: "The closest representation of −0.22558594 in a floating point system is −0.2265625. Calculate the relative error as a percentage to 2 decimal places, showing your working.",
      steps: [
        { m: "Absolute error | −0.22558594 − (−0.2265625) | = **0.00097656**", mk: "1 mark" },
        { m: "0.00097656 ÷ 0.22558594 = 0.004329 → **0.43%**", mk: "1 mark", n: "R. 0.0043% (the percentage applied twice) and R. −0.43%." }
      ], result: "0.43%" } },
    { worked: { tag: "exam", title: "Relative error to four decimal places", src: "A-level June 2025 · P2 Q12.6 · 1 mark",
      q: "43 057 152 was represented as closely as possible as 42 991 616. Calculate the relative error as a percentage to at least four decimal places, showing your working.",
      steps: [{ m: "(43 057 152 − 42 991 616) ÷ 43 057 152 = 65 536 ÷ 43 057 152 = **0.1522%**", mk: "1 mark" }], result: "0.1522%" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Calculate the absolute error", "A positive difference."],
      ["Calculate the relative error (%)", "Absolute ÷ intended × 100, to the decimal places asked."],
      ["Explain why relative error matters", "The error's effect depends on its size relative to the value."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Absolute: how far. Relative: how far for its size.\"", body: "Divide by the **intended** value, not the stored one." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Dividing by the stored value.", "Negative errors.", "Forgetting × 100, or multiplying by 100 twice.", "Rounding before dividing."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4.5 where errors come from; 4.5.4.7 precision decides how large they can be; 4.5.6.3 quantisation error in ADC is an absolute error." } }
  ],
  flashcards: [
    ["Absolute error?", "| intended − stored |."],
    ["Relative error?", "Absolute error ÷ | intended |."],
    ["13.8 stored as 13.75 — absolute error?", "0.05."],
    ["… relative error?", "0.36%."],
    ["Why is relative error more useful?", "An error's significance depends on the size of the value."],
    ["Can an absolute error be negative?", "No."],
    ["Relative error of 0.3 on 104.7?", "0.29%."],
    ["Same absolute error, which value suffers more?", "The smaller one."]
  ],
  quiz: [
    { q: "2.5 stored as 2.4375 has absolute error", opts: ["0.0625", "−0.0625", "2.5%", "0.025"], ans: 0, why: "Difference." },
    { q: "Its relative error is", opts: ["2.5%", "0.0625%", "25%", "0.25%"], ans: 0, why: "0.0625/2.5." },
    { q: "Relative error divides by", opts: ["the intended value", "the stored value", "the absolute error", "100"], ans: 0, why: "Definition." },
    { q: "An absolute error of 1 matters most for", opts: ["the value 2", "the value 2000", "the value 200", "all equally"], ans: 0, why: "50% vs tiny." }
  ]
};

/* =====================================================================
   4.5.4.7  Range and precision
   ===================================================================== */
C["compsci:4.5.4.7"] = {
  notes: [
    { h: "Range and precision — the whole topic on one page" },
    "Spec 4.5.4.7: compare the advantages and disadvantages of **fixed point and floating point** forms in terms of **range, precision and speed of calculation**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["One advantage of each form", "State", "2", "A-level 2020 Q02.1"],
      ["Which statements about fixed/floating are true", "Shade", "2", "A-level 2024 Q04.1"],
      ["Highest and lowest representable values", "State, show working", "2–3", "A-level 2020 Q02.4, 2024 Q04.5"],
      ["Smallest positive normalised value", "Write", "2", "A-level 2019 Q11.1"],
      ["Increase precision without more bits", "Explain", "1", "A-level 2023 Q06.4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Fixed vs floating point**.", "**Extreme values**.", "**Trading range for precision**.", "**Exam toolkit**."] },

    { page: "Fixed vs floating point" },
    { callout: { t: "def", h: "Range and precision", body: "**Range**: the span from the most negative to the most positive value (and how close to zero) a representation can reach. **Precision**: how many significant digits it keeps — how finely it separates neighbouring values." } },
    { table: { head: ["In the same number of bits", "Fixed point", "Floating point"], rows: [
      ["Range", "small — set by the bits before the point", "**much larger**, and much closer to zero"],
      ["Precision", "constant: every value to the same absolute precision; can be **more precise** for some numbers", "varies with the exponent: precise near 0, coarse for huge values"],
      ["Speed", "**faster** — ordinary integer arithmetic", "slower — exponents must be aligned and results normalised (often a separate FPU)"],
      ["Simplicity", "simpler evaluation", "needs normalisation rules"],
      ["Typical use", "money (whole pence), DSP, embedded systems", "scientific values, graphics, any data with huge magnitude spread"]
    ] } },
    { worked: { tag: "exam", title: "One advantage of each", src: "A-level June 2020 · P2 Q02.1 · 2 marks",
      q: "Non-integer values can be represented using a fixed point or a floating point system. State one advantage of using a floating point system over a fixed point system and one advantage of a fixed point system over a floating point system, assuming both use the same number of bits.",
      steps: [
        { h: "Floating point", m: "It can represent numbers with a greater **range** (much larger, or much closer to zero);", mk: "1 mark" },
        { h: "Fixed point", m: "Calculations can be performed more **quickly** // it can represent some numbers more **precisely** // every number has a constant level of precision;", mk: "1 mark", n: "NE. \"time efficient\"; NE. \"easier to understand\"." }
      ], result: "Float: range. Fixed: speed or precision." } },
    { worked: { tag: "exam", title: "True statements about the two forms", src: "A-level June 2024 · P2 Q04.1 · 2 marks",
      q: "Shade all the true statements: A A processor can usually carry out calculations on fixed point numbers more quickly than on floating point numbers. B Fixed point numbers represent data using a mantissa and an exponent. C In a given number of bits, a fixed point system can represent positive numbers closer to zero than a floating point system can. D In a given number of bits, a fixed point system can represent some numbers more precisely than a floating point system. E In a given number of bits, a floating point system can represent a bigger range of numbers.",
      steps: [{ m: "True: **A, D, E**. False: B (that is floating point), C (floating point gets closer to zero).", mk: "2 marks", n: "2 marks for all five rows right; 1 mark for three or four." }], result: "A, D, E" } },

    { page: "Extreme values" },
    { callout: { t: "memorise", h: "Finding the extremes (normalised, two's complement)", body: [
      "**Largest positive**: largest mantissa 0.111…1, largest exponent 011…1.",
      "**Most negative**: mantissa 1.000…0 (= −1), largest exponent 011…1 → −1 × 2^(max exponent).",
      "**Smallest positive**: smallest normalised mantissa 0.100…0 (= ½), most negative exponent 100…0."
    ] } },
    { worked: { tag: "exam", title: "Highest and lowest in a 7/5 system", src: "A-level June 2020 · P2 Q02.4 · 3 marks",
      q: "A normalised floating point representation has a 7-bit mantissa and a 5-bit exponent, both two's complement. State, in decimal, the highest (most positive) and lowest (most negative) values, showing your working.",
      steps: [
        { m: "Highest: mantissa 0.111111 = 63/64, exponent 01111 = 15 → 63/64 × 2¹⁵ = **32 256**", mk: "1 mark" },
        { m: "Lowest: mantissa 1.000000 = −1, exponent 15 → **−32 768**", mk: "1 mark" },
        { m: "both correct", mk: "1 mark", n: "Working marks: 111111000000000 for the highest; 1000000000000000 for the lowest; multiplying by 2¹⁵." }
      ], result: "32 256 and −32 768" } },
    { worked: { tag: "exam", title: "Most negative in a 10/6 system", src: "A-level June 2024 · P2 Q04.5 · 2 marks",
      q: "A system uses a normalised floating point representation with a 10-bit mantissa and a 6-bit exponent, both two's complement. In decimal, what is the most negative number it could represent? Show your working.",
      steps: [{ m: "Mantissa 1.000000000 = −1; exponent 011111 = 31", mk: "1 mark" }, { m: "−1 × 2³¹ = **−2 147 483 648**", mk: "1 mark" }], result: "−2³¹" } },
    { worked: { tag: "exam", title: "The smallest positive value (8/4)", src: "A-level June 2019 · P2 Q11.1 · 2 marks",
      q: "Using a normalised floating point representation with an 8-bit mantissa and a 4-bit exponent, both two's complement, write the smallest positive number that can be represented.",
      steps: [{ m: "Mantissa **01000000** (½ — the smallest normalised positive mantissa)", mk: "1 mark" }, { m: "Exponent **1000** (−8)", mk: "1 mark", n: "Value ½ × 2⁻⁸ = 1/512." }], result: "01000000 1000" } },

    { page: "Trading range for precision" },
    { fig: { w: 520, h: 150, items: [
      { poly: [[20, 30], [340, 30], [340, 70], [20, 70]], fill: "accent", alpha: 0.18, c: "accent", w: 1.4 }, { text: [180, 50], t: "mantissa: 8 bits → precision", b: true, c: "text" },
      { poly: [[340, 30], [500, 30], [500, 70], [340, 70]], fill: "accent3", alpha: 0.18, c: "accent3", w: 1.4 }, { text: [420, 50], t: "exponent: 4 bits → range", b: true, c: "text" },
      { line: [[300, 100], [380, 100]], arrow: "both", c: "accent2", w: 2 }, { text: [340, 122], t: "move the boundary: more precision ⇄ more range", c: "accent2", b: true, size: 12 }
    ], cap: "Within a fixed 12 bits, every bit given to the mantissa is taken from the exponent." } },
    { worked: { tag: "exam", title: "More precision in the same 12 bits", src: "A-level June 2023 · P2 Q06.4 · 1 mark",
      q: "Explain how the 8-bit mantissa, 4-bit exponent floating point representation could be modified to represent numbers more precisely, without changing the total number of bits.",
      steps: [{ m: "Move some bits from the exponent to the mantissa (e.g. 9-bit mantissa, 3-bit exponent) // use an implicit bit in the mantissa, since in a normalised number the bit after the point is always the opposite of the sign bit.", mk: "1 mark", n: "NE. \"add more bits to the mantissa\" — the total is fixed. R. use fixed point." }], result: "Reallocate exponent bits to the mantissa" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State an advantage", "Name the property: range (floating); speed or precision (fixed)."],
      ["Compare", "\"In the same number of bits, floating point has a greater range, whereas fixed point …\" — a linked comparative."],
      ["State the extremes", "The mantissa and exponent chosen, then the value."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Fixed is Fast; Floating Flies further\"", body: "Fixed: speed and constant precision. Floating: range." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Saying floating point is \"more accurate\" in general.", "Using mantissa 0.1111111 for the most negative value (it is 1.0000000).", "Answering \"add bits\" when the total is fixed."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.3.7 processor performance: floating point arithmetic is slower and may need an FPU; 4.5.1.7 measurement uses ℝ approximated by floating point." } }
  ],
  flashcards: [
    ["Advantage of floating point over fixed?", "Greater range in the same number of bits."],
    ["Advantages of fixed point over floating?", "Faster calculation; constant precision; some numbers more precise."],
    ["Most negative normalised mantissa?", "1.000…0 (−1)."],
    ["Smallest positive normalised mantissa?", "0.100…0 (½)."],
    ["Smallest positive (8,4)?", "01000000 1000 = 1/512."],
    ["Highest value in (7,5)?", "32 256."],
    ["How to get more precision without more bits?", "Move bits from the exponent to the mantissa."],
    ["Which field controls range?", "The exponent."]
  ],
  quiz: [
    { q: "In the same bits, floating point offers", opts: ["a greater range", "faster arithmetic", "constant precision", "no rounding"], ans: 0, why: "Range." },
    { q: "Most negative (8,4) value", opts: ["−128", "−127", "−1", "−256"], ans: 0, why: "−1 × 2⁷." },
    { q: "Moving a bit from exponent to mantissa", opts: ["raises precision, cuts range", "raises range", "changes nothing", "raises both"], ans: 0, why: "Trade-off." },
    { q: "Which is generally faster to process?", opts: ["fixed point", "floating point", "they are equal", "neither"], ans: 0, why: "Integer arithmetic." }
  ]
};

/* =====================================================================
   4.5.4.8  Normalisation of floating point form
   ===================================================================== */
C["compsci:4.5.4.8"] = {
  notes: [
    { h: "Normalisation of floating point form — the whole topic on one page" },
    "Spec 4.5.4.8: know why floating point numbers are **normalised** and be able to **normalise un-normalised** floating point numbers with positive or negative mantissas.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Why are floating point numbers normalised?", "State", "1–2", "A-level 2022 Q05.2, 2025 Q12.3"],
      ["Which bit pattern is (not) normalised / most negative / largest", "Shade / Complete the table", "1–3", "A-level 2017 Q11.1–2, 2021 Q10.1, 2025 Q12.1–2"],
      ["Write the normalised representation of a decimal", "Write, show working", "3", "A-level 2017 Q11.4, 2018 Q01.3, 2019 Q11.3, 2020 Q02.3, 2022 Q05.4, 2023 Q06.2"],
      ["Normalise an un-normalised number", "Normalise", "2", "variation"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What normalised means**.", "**Recognising normalised patterns**.", "**Writing a decimal in normalised form**.", "**Normalising an un-normalised number**.", "**Exam toolkit**."] },

    { page: "What normalised means" },
    { callout: { t: "def", h: "Normalised (two's complement mantissa)", body: "A floating point number is **normalised** when the first two bits of its mantissa are **different**: **0.1…** for a positive number, **1.0…** for a negative one. The sign bit is followed immediately by the first significant bit — no wasted leading 0s (or 1s)." } },
    { callout: { t: "memorise", h: "Why normalise (any one per mark)", body: [
      "**Maximises the precision / accuracy for a given number of bits** — no mantissa bits are wasted on leading 0s or 1s (the answer must mention the fixed number of bits);",
      "**Unique representation** of each number — so it is **simpler to test for equality** of numbers."
    ] } },
    { worked: { tag: "exam", title: "Two reasons to normalise", src: "A-level June 2022 · P2 Q05.2 · 2 marks",
      q: "State two reasons why values stored using a floating point representation are usually stored in normalised form.",
      steps: [{ m: "It maximises the precision of the number for a given number of bits;", mk: "1 mark" }, { m: "each number has a unique representation, so it is simpler to test numbers for equality;", mk: "1 mark" }], result: "Precision; uniqueness" } },

    { page: "Recognising normalised patterns" },
    { table: { head: ["Mantissa starts", "Sign", "Normalised?"], rows: [["01…", "positive", "✓"], ["10…", "negative", "✓"], ["00…", "positive", "✗ — shift left"], ["11…", "negative", "✗ — shift left"]] } },
    { fig: fpFig("00110000", "0011", "Not normalised: the mantissa starts 00, so one bit is wasted. Shifting it left one place and reducing the exponent by one gives 01100000 0010 — the same value, 3.") },
    { worked: { tag: "exam", title: "Negative, smallest positive", src: "A-level June 2017 · P2 Q11.1–11.2 · 2 marks",
      q: "A computer uses a normalised floating point representation with an 8-bit mantissa and 4-bit exponent, both two's complement. Four stored bit patterns are: A 00110000 0011; B 01000000 1000; C 10010000 0010; D 01111111 0111. Shade one lozenge for (i) the pattern that represents a negative normalised value, (ii) the pattern that represents the smallest positive normalised value.",
      steps: [
        { h: "(i)", m: "C — mantissa 10…: negative and normalised (−3.5)", mk: "1 mark" },
        { h: "(ii)", m: "B — mantissa 0.1000000 (smallest normalised) with exponent −8 (most negative): 1/512", mk: "1 mark", n: "A is not normalised (00…), so it cannot be \"the smallest positive normalised value\"." }
      ], result: "C; B" } },
    { worked: { tag: "exam", title: "Complete the table of descriptions", src: "A-level June 2021 · P2 Q10.1 · 3 marks",
      q: "8-bit mantissa, 4-bit exponent, both two's complement. Patterns: A 10110000 0001; B 01000000 0000; C 11000000 0011; D 01111111 0111. Write the letter for (i) a negative value that is valid in the representation; (ii) the largest positive value that can be represented; (iii) a value that is not valid because it is not normalised. Do not use a letter more than once.",
      steps: [
        { m: "(i) **A** — 10… normalised negative (−1.25)", mk: "1 mark" },
        { m: "(ii) **D** — largest mantissa and largest exponent (127)", mk: "1 mark" },
        { m: "(iii) **C** — mantissa 11…: two equal leading bits", mk: "1 mark", n: "A letter reused is credited only the first time." }
      ], result: "A, D, C" } },
    { worked: { tag: "exam", title: "Five patterns with a 6-bit exponent", src: "A-level June 2025 · P2 Q12.1–12.2 · 2 marks",
      q: "8-bit mantissa, 6-bit exponent, both two's complement. Patterns: A 01011000 000101; B 10011000 111110; C 00101000 000011; D 10000000 011111; E 01111111 011111. Shade (i) the pattern that does not represent a normalised value, (ii) the most negative normalised value that can be represented.",
      steps: [{ m: "(i) **C** — mantissa starts 00", mk: "1 mark" }, { m: "(ii) **D** — mantissa −1, largest exponent 31: −2³¹", mk: "1 mark" }], result: "C; D" } },

    { page: "Writing a decimal in normalised form" },
    { callout: { t: "memorise", h: "Decimal → normalised floating point", body: [
      "1. Write |value| in fixed point binary.",
      "2. **Negative?** Write it with a leading 0 sign bit, then take the two's complement (flip, add 1 at the last place).",
      "3. **Move the point** to just after the sign bit (0.1… or 1.0…); count the places: moved **left** → positive exponent, moved **right** → negative exponent.",
      "4. Pad (or round) the mantissa to its bit length; write the exponent in two's complement."
    ] } },
    { worked: { tag: "exam", title: "58.5 in an 8/4 system", src: "A-level June 2017 · P2 Q11.4 · 3 marks",
      q: "Write the normalised floating point representation (8-bit mantissa, 4-bit exponent, both two's complement) of 58.5. Show your working.",
      steps: [
        { m: "58.5 = **111010.1₂**", mk: "1 mark" },
        { m: "0.1110101 × 2⁶: the point moves 6 left → exponent **6 (0110)**", mk: "1 mark" },
        { m: "**01110101 0110**", mk: "1 mark", n: "Working marks can be seen in the final answer (e.g. a correct exponent)." }
      ], result: "01110101 0110" } },
    { worked: { tag: "exam", title: "−608 in a 7/5 system", src: "A-level June 2018 · P2 Q01.3 · 3 marks",
      q: "Write the normalised floating point representation (7-bit mantissa, 5-bit exponent, both two's complement) of −608. Show your working.",
      steps: [
        { m: "608 = 1001100000₂; −608 in two's complement = **10110100000** (0 1001100000 → flip, add 1)", mk: "1 mark" },
        { m: "1.0110100000 × 2¹⁰: exponent **10 (01010)**", mk: "1 mark" },
        { m: "Mantissa 1011010 → **1011010 01010**", mk: "1 mark" }
      ], result: "1011010 01010" } },
    { worked: { tag: "exam", title: "0.15625 — a negative exponent", src: "A-level June 2019 · P2 Q11.3 · 3 marks",
      q: "Write the normalised floating point representation (8-bit mantissa, 4-bit exponent) of 0.15625 (5/32). Show your working.",
      steps: [
        { m: "0.15625 = **0.00101₂**", mk: "1 mark" },
        { m: "0.101 × 2⁻²: the point moves 2 **right** → exponent **−2 (1110)**", mk: "1 mark" },
        { m: "**01010000 1110**", mk: "1 mark" }
      ], result: "01010000 1110" } },
    { worked: { tag: "exam", title: "1632 in a 7/5 system", src: "A-level June 2020 · P2 Q02.3 · 3 marks",
      q: "Write the normalised floating point representation (7-bit mantissa, 5-bit exponent, both two's complement) of 1632. Show your working.",
      steps: [
        { m: "1632 = **11001100000₂**", mk: "1 mark" },
        { m: "0.11001100000 × 2¹¹ → exponent **11 (01011)**; mantissa **0.110011**", mk: "1 mark" },
        { m: "**0110011 01011**", mk: "1 mark" }
      ], result: "0110011 01011" } },
    { worked: { tag: "exam", title: "−23.25 in an 8/4 system", src: "A-level June 2022 · P2 Q05.4 · 3 marks",
      q: "Write the normalised floating point representation (8-bit mantissa, 4-bit exponent, both two's complement) of −23.25. Show your working.",
      steps: [
        { m: "23.25 = **10111.01₂**; −23.25 = **101000.11** (two's complement of 010111.01)", mk: "1 mark" },
        { m: "1.0100011 × 2⁵ → exponent **5 (0101)**", mk: "1 mark" },
        { m: "**10100011 0101**", mk: "1 mark", n: "Check: (−1 + ¼ + 1/64 + 1/128) × 32 = −23.25 ✓." }
      ], result: "10100011 0101" } },

    { page: "Normalising an un-normalised number" },
    { callout: { t: "memorise", h: "Normalising", body: [
      "1. Shift the mantissa **left** until its first two bits differ (fill with 0s on the right).",
      "2. **Subtract** from the exponent the number of places shifted — the value is unchanged.",
      "Positive: remove leading 0s after the sign. Negative: remove leading 1s after the sign."
    ] } },
    { worked: { tag: "variation", title: "Normalise a positive and a negative number", q: "Normalise (8-bit mantissa, 4-bit exponent): (a) 00011010 0011; (b) 11100100 0010.",
      steps: [
        { h: "(a)", m: "0.0011010 → shift left 2: 0.1101000; exponent 3 − 2 = 1 → **01101000 0001** (value 1.625 both times)" },
        { h: "(b)", m: "1.1100100 → shift left 2: 1.0010000; exponent 2 − 2 = 0 → **10010000 0000** (value −0.875 both times)" }
      ], result: "01101000 0001; 10010000 0000" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State why", "Precision for a given number of bits; unique representation / simpler equality tests."],
      ["Write the normalised representation", "Fixed point form (and its negative), the exponent, the mantissa — method marks for each."],
      ["Identify (shade)", "Check the first two mantissa bits; then compare mantissa and exponent sizes."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"First two differ\"", body: "Normalised = **01** or **10** at the front of the mantissa." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Negating 23.25 without a leading sign bit first (gives the wrong pattern).", "Adding to the exponent when shifting left.", "Precision answer without \"for a given number of bits\" (NE.)."] } },
    { callout: { t: "tip", h: "Confusion alert — two meanings of \"normalisation\"", body: "**Normalisation in floating point** (here) removes wasted leading bits from a mantissa. **Normalisation in databases** (4.10.3) removes redundancy from tables (1NF → 2NF → 3NF). Same word, entirely different ideas." } }
  ],
  flashcards: [
    ["When is a two's complement mantissa normalised?", "When its first two bits differ (01… or 10…)."],
    ["Two reasons to normalise?", "Maximum precision for the bits available; unique representation (simple equality tests)."],
    ["Normalise 00011010 0011.", "01101000 0001."],
    ["Shift the mantissa left n places — what happens to the exponent?", "Subtract n."],
    ["58.5 in (8,4)?", "01110101 0110."],
    ["0.15625 in (8,4)?", "01010000 1110."],
    ["−23.25 in (8,4)?", "10100011 0101."],
    ["Is 11000000 a normalised mantissa?", "No — it starts 11."],
    ["Database normalisation vs floating point normalisation?", "Different: tables without redundancy vs mantissas without wasted bits."]
  ],
  quiz: [
    { q: "Which mantissa is normalised?", opts: ["10110000", "11011000", "00101000", "00000000"], ans: 0, why: "Starts 10." },
    { q: "Normalising 00101000 0011 gives", opts: ["01010000 0010", "01010000 0100", "10100000 0010", "00101000 0011"], ans: 0, why: "Shift left 1, exponent − 1." },
    { q: "A reason for normalisation is", opts: ["maximum precision for the bits", "faster arithmetic", "a larger exponent", "removing redundancy in tables"], ans: 0, why: "No wasted bits." },
    { q: "1632 in (7,5) has exponent", opts: ["01011", "01010", "01100", "10101"], ans: 0, why: "11." }
  ]
};

/* =====================================================================
   4.5.4.9  Underflow and overflow
   ===================================================================== */
C["compsci:4.5.4.9"] = {
  notes: [
    { h: "Underflow and overflow — the whole topic on one page" },
    "Spec 4.5.4.9: explain **underflow** and **overflow** and describe the circumstances in which they occur.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Name the error: underflow / overflow / rounding", "State (table)", "2", "A-level 2023 Q06.3"],
      ["A product overflows: explain the problem and redesign", "Explain", "3", "A-level 2019 Q11.4"],
      ["Describe when underflow occurs", "Describe", "1–2", "variation"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Overflow and underflow**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Overflow and underflow" },
    { kv: [
      ["Overflow", "the result of a calculation is **too large** (in magnitude) to be represented in the available number of bits — for floating point, the exponent needed is bigger than the largest exponent"],
      ["Underflow", "the result is **too small** (too close to zero) to be represented — it is stored as **zero**, because the exponent needed is more negative than the most negative exponent"],
      ["Rounding (error)", "a value cannot be represented **exactly** in the available bits, so the nearest representable value is stored"]
    ] },
    { fig: { x: [-5, 5], y: [0, 1], w: 520, h: 140, axes: false, items: [
      { line: [[-4.6, 0.45], [4.6, 0.45]], c: "line", w: 2 },
      { poly: [[-4.6, 0.3], [-3.2, 0.3], [-3.2, 0.6], [-4.6, 0.6]], fill: "accent2", alpha: 0.25, c: "accent2", w: 1 }, { text: [-3.9, 0.82], t: "overflow", b: true, c: "accent2", size: 12 },
      { poly: [[3.2, 0.3], [4.6, 0.3], [4.6, 0.6], [3.2, 0.6]], fill: "accent2", alpha: 0.25, c: "accent2", w: 1 }, { text: [3.9, 0.82], t: "overflow", b: true, c: "accent2", size: 12 },
      { poly: [[-0.35, 0.3], [0.35, 0.3], [0.35, 0.6], [-0.35, 0.6]], fill: "accent3", alpha: 0.3, c: "accent3", w: 1 }, { text: [0, 0.82], t: "underflow → 0", b: true, c: "accent3", size: 12 },
      { text: [-1.8, 0.12], t: "representable negatives", c: "text2", size: 11.5 }, { text: [1.8, 0.12], t: "representable positives", c: "text2", size: 11.5 }
    ], cap: "Overflow lies beyond the largest magnitudes; underflow is the gap around zero that no normalised value reaches." } },
    { worked: { tag: "variation", title: "An underflow", q: "In an 8-bit mantissa, 4-bit exponent system the smallest positive value is 1/512. Explain what happens when 1/512 is multiplied by itself.",
      steps: [{ m: "The true result, 1/262 144, would need an exponent of −17, below the most negative exponent (−8); it is too close to zero to represent, so **underflow** occurs and the result is stored as **0**." }], result: "Underflow → 0" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Name each type of error", src: "A-level June 2023 · P2 Q06.3 · 2 marks",
      q: "State the type of error in each situation: (a) a calculation's result is so close to zero that the number stored is zero; (b) a calculation's result is too large to fit in the available number of bits; (c) a decimal value converted to floating point cannot be represented exactly in the available number of bits.",
      steps: [
        { m: "(a) **Underflow**; (b) **Overflow** (R. stack overflow); (c) **Rounding** (A. truncation)" },
        { m: "all three correct", mk: "2 marks", n: "1 mark for two correct." }
      ], result: "Underflow; overflow; rounding" } },
    { worked: { tag: "exam", title: "A product that overflows", src: "A-level June 2019 · P2 Q11.4 · 3 marks",
      q: "In an 8-bit mantissa, 4-bit exponent system, 01010000 0111 (80) is multiplied by 01100100 0011 (6.25). A problem occurs as a result of the multiplication. Explain the problem and how the representation could be redesigned to avoid it.",
      steps: [
        { h: "Problem (AO2)", m: "**Overflow**: the result, 500, is too large to store — it needs an exponent of 9 but the largest is 7;", mk: "1 mark" },
        { h: "Solution (AO1)", m: "more bits should be added; $\\;$ to the **exponent**;", mk: "2 marks", n: "Or (2 marks): reallocate bits from the mantissa to the exponent. NE. \"make it bigger\" — mention bits." }
      ], result: "Overflow; more exponent bits" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State the type of error", "Underflow (too close to zero), overflow (too large), rounding (not exact)."],
      ["Explain the problem", "Name it and give the reason (the exponent needed exceeds the range)."],
      ["Explain the redesign", "More exponent bits — added, or moved from the mantissa."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Over the top, under the floor\"", body: "Overflow: too big. Underflow: too small to tell from zero." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Calling underflow \"a negative overflow\" — underflow is about tiny magnitudes, positive or negative.", "\"Stack overflow\" (R.) — a different concept (4.2.3 stacks).", "Fixing overflow with more mantissa bits — range needs exponent bits."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4.2 integer overflow (carry out); 4.2.3 stack overflow is unrelated (a full stack); 4.7.3.1 the status register's overflow flag." } }
  ],
  flashcards: [
    ["What is overflow?", "A result too large to be represented in the available bits."],
    ["What is underflow?", "A result too close to zero to be represented — stored as 0."],
    ["Fix floating point overflow?", "More exponent bits (added or moved from the mantissa)."],
    ["Error when a decimal cannot be stored exactly?", "Rounding (or truncation)."],
    ["80 × 6.25 in (8,4)?", "Overflow — 500 > 127."],
    ["Is stack overflow the same?", "No — it is a full stack (data structures)."],
    ["Underflow happens because the exponent needed is…?", "More negative than the most negative exponent."],
    ["Overflow happens because the exponent needed is…?", "Larger than the largest exponent."]
  ],
  quiz: [
    { q: "A result too close to zero to represent is", opts: ["underflow", "overflow", "rounding", "truncation"], ans: 0, why: "Stored as 0." },
    { q: "To reduce floating point overflow", opts: ["give the exponent more bits", "give the mantissa more bits", "use fixed point", "normalise"], ans: 0, why: "Range." },
    { q: "The largest (8,4) value is", opts: ["127", "255", "128", "7"], ans: 0, why: "0.1111111 × 2⁷." },
    { q: "\"Too large for the available bits\" is", opts: ["overflow", "underflow", "rounding", "normalisation"], ans: 0, why: "Definition." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
