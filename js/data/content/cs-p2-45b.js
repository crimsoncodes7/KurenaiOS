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
   4.5.4.3  Signed binary using two's complement
   ===================================================================== */
C["compsci:4.5.4.3"] = {
  notes: [
    { h: "Two's complement — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.5.4.3)", body: ["Know that **signed binary** can be used to represent negative integers and that one possible coding scheme is **two's complement**.", "Know how to represent negative and positive integers in two's complement.", "Perform **subtraction** using two's complement.", "Calculate the **range** of a given number of bits, n."] } },
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
    { callout: { t: "info", h: "Key idea", body: "Check: −128 + 64 + 16 + 8 + 4 = −36 ✓. Either method works both ways (negating a negative gives the positive back)." } },
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
    ["8-bit two's complement range?", "−128 to 127.", 2],
    ["n-bit two's complement range?", "−2ⁿ⁻¹ to 2ⁿ⁻¹ − 1.", 3],
    ["How is A − B done in binary?", "Add A to the two's complement of B; discard any carry.", 4],
    ["−36 in 8-bit two's complement?", "11011100.", 5],
    ["Why use two's complement?", "Addition works unchanged for negatives, so subtraction needs no extra circuit.", 6],
    ["Most negative 12-bit value?", "−2048.", 7],
    ["What is done with the carry out of the MSB?", "It is discarded.", 8]
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
    { callout: { t: "info", h: "What the specification asks (4.5.4.4)", body: ["Know how numbers with a fractional part can be represented in **fixed point** form and in **floating point** form in binary in a given number of bits.", "Be able to **convert** for each representation from decimal to binary and from binary to decimal."] } },
    { callout: { t: "info", h: "Key idea", body: "AS papers ask fixed point every year; A-level Paper 2 has asked floating point every year since 2017:" } },
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
    { callout: { t: "info", h: "Key idea", body: "In **two's complement fixed point**, the leftmost bit's place value is **negative**; everything else is as before." } },
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
    ["What does the exponent decide?", "Range.", 6],
    ["What does the mantissa decide?", "Precision.", 7],
    ["01101000 / 0110 (8,4)?", "52.", 8],
    ["10110000 / 0011 (8,4)?", "−5.", 9]
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
   4.5.4.7  Range and precision
   ===================================================================== */
C["compsci:4.5.4.7"] = {
  notes: [
    { h: "Range and precision — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.5.4.7)", body: "Compare the advantages and disadvantages of **fixed point and floating point** forms in terms of **range, precision and speed of calculation**." } },
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
    { callout: { t: "info", h: "What the specification asks (4.5.4.8)", body: "Know why floating point numbers are **normalised** and be able to **normalise un-normalised** floating point numbers with positive or negative mantissas." } },
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
    ["Two reasons to normalise?", "Maximum precision for the bits available; unique representation (simple equality tests).", 1],
    ["Normalise 00011010 0011.", "01101000 0001.", 2],
    ["Shift the mantissa left n places — what happens to the exponent?", "Subtract n.", 3],
    ["58.5 in (8,4)?", "01110101 0110.", 4],
    ["0.15625 in (8,4)?", "01010000 1110.", 5],
    ["−23.25 in (8,4)?", "10100011 0101.", 6],
    ["Database normalisation vs floating point normalisation?", "Different: tables without redundancy vs mantissas without wasted bits.", 8]
  ],
  quiz: [
    { q: "Which mantissa is normalised?", opts: ["10110000", "11011000", "00101000", "00000000"], ans: 0, why: "Starts 10." },
    { q: "Normalising 00101000 0011 gives", opts: ["01010000 0010", "01010000 0100", "10100000 0010", "00101000 0011"], ans: 0, why: "Shift left 1, exponent − 1." },
    { q: "A reason for normalisation is", opts: ["maximum precision for the bits", "faster arithmetic", "a larger exponent", "removing redundancy in tables"], ans: 0, why: "No wasted bits." },
    { q: "1632 in (7,5) has exponent", opts: ["01011", "01010", "01100", "10101"], ans: 0, why: "11." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
