/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.5.1–4.5.3
   (number systems, number bases, units of information) at full A-level
   depth. Each topic here REPLACES the short entry the older file carried:
   every way AQA has asked about it (7516/2 June 2016–2025, 7517/2 June
   2017–2025) is explained, then answered in the mark scheme's own format
   — one creditworthy point per mark, with what is accepted, rejected or
   "not enough" — and the precise AQA vocabulary modelled throughout.
   Past-paper item banks stay in bank-cs-45a.js / bank-cs-45b.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers ---- */

/* the nested number sets N ⊂ Z ⊂ Q ⊂ R, irrationals as R outside Q;
   hl names the set to highlight ("N", "Z", "Q", "I", "R") */
function setsFig(hl, cap) {
  function on(k) { return hl === k; }
  var it = [
    { poly: [[10, 10], [510, 10], [510, 230], [10, 230]], fill: on("R") ? "accent2" : "muted", alpha: on("R") ? 0.18 : 0.05, c: on("R") ? "accent2" : "line", w: 1.6 },
    { text: [30, 28], t: "ℝ real", pos: "e", b: true, c: on("R") ? "accent2" : "text2", off: 0 },
    { poly: [[24, 40], [352, 40], [352, 218], [24, 218]], fill: on("Q") ? "accent2" : "muted", alpha: on("Q") ? 0.2 : 0.05, c: on("Q") ? "accent2" : "line", w: 1.6 },
    { text: [36, 56], t: "ℚ rational", pos: "e", b: true, c: on("Q") ? "accent2" : "text2", off: 0 },
    { poly: [[38, 70], [262, 70], [262, 206], [38, 206]], fill: on("Z") ? "accent2" : "muted", alpha: on("Z") ? 0.22 : 0.05, c: on("Z") ? "accent2" : "line", w: 1.6 },
    { text: [50, 86], t: "ℤ integer", pos: "e", b: true, c: on("Z") ? "accent2" : "text2", off: 0 },
    { poly: [[52, 100], [176, 100], [176, 194], [52, 194]], fill: on("N") ? "accent2" : "accent", alpha: on("N") ? 0.3 : 0.1, c: on("N") ? "accent2" : "accent", w: 1.6 },
    { text: [62, 116], t: "ℕ natural", pos: "e", b: true, c: on("N") ? "accent2" : "accent", off: 0 },
    { text: [114, 146], t: "0  1  2  998", c: "text" },
    { text: [114, 172], t: "(counting)", size: 11, c: "muted" },
    { text: [220, 136], t: "−4", c: "text" }, { text: [220, 166], t: "−19", c: "text" },
    { text: [306, 120], t: "0.5", c: "text" }, { text: [306, 150], t: "15/23", c: "text" }, { text: [306, 180], t: "−0.75", c: "text" },
    { poly: [[362, 40], [500, 40], [500, 218], [362, 218]], fill: on("I") ? "accent2" : "muted", alpha: on("I") ? 0.22 : 0.05, c: on("I") ? "accent2" : "line", w: 1.6, dash: true },
    { text: [374, 56], t: "irrational", pos: "e", b: true, c: on("I") ? "accent2" : "text2", off: 0 },
    { text: [431, 110], t: "√2", c: "text" }, { text: [431, 140], t: "π", c: "text" }, { text: [431, 170], t: "e", c: "text" },
    { text: [431, 200], t: "(not ℚ)", size: 11, c: "muted" }
  ];
  return { w: 520, h: 240, items: it, cap: cap };
}
/* a row of bit cells with place values above */
function bitsFig(bits, weights, o) {
  o = o || {};
  var n = bits.length, cw = o.cw || 52, x0 = o.x0 || 20, it = [];
  for (var i = 0; i < n; i++) {
    var x = x0 + i * cw, on = bits[i] === "1" || bits[i] === 1;
    if (weights) it.push({ text: [x + cw / 2, 18], t: String(weights[i]), size: 11.5, c: "muted" });
    it.push({ poly: [[x, 30], [x + cw, 30], [x + cw, 70], [x, 70]], fill: on ? "accent" : null, alpha: on ? 0.28 : 0, c: "line", w: 1.4 });
    it.push({ text: [x + cw / 2, 50], t: String(bits[i]), b: true, size: 15, c: on ? "text" : "muted" });
  }
  (o.groups || []).forEach(function (g) {
    var gx0 = x0 + g[0] * cw, gx1 = x0 + (g[1] + 1) * cw;
    it.push({ line: [[gx0 + 4, 80], [gx1 - 4, 80]], c: "accent2", w: 2 });
    it.push({ text: [(gx0 + gx1) / 2, 96], t: g[2], b: true, c: "accent2", size: 14 });
  });
  if (o.point != null) it.push({ line: [[x0 + o.point * cw, 26], [x0 + o.point * cw, 74]], c: "accent2", w: 3 });
  return { w: o.w || x0 * 2 + n * cw, h: o.h || (o.groups ? 106 : 80), items: it.concat(o.extra || []), cap: o.cap };
}

/* the AQA marking conventions, shown once per leaf where they matter */
var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the marks however many points you make.",
  "**A.** accept · **R.** reject · **NE.** not enough (true, but too vague for the mark) · **I.** ignore · **BOD** benefit of the doubt · **//** separates alternative wordings of the same point.",
  "A lozenge question is rejected outright if more lozenges are shaded than asked for."
] } };

/* =====================================================================
   4.5.2.1  Number base
   ===================================================================== */
C["compsci:4.5.2.1"] = {
  notes: [
    { h: "Number bases — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.5.2.1)", body: ["Be familiar with the concept of a **number base**, in particular **decimal (base 10)**, **binary (base 2)** and **hexadecimal (base 16)**.", "Convert between them.", "Know that computers use **binary** to represent all data and instructions.", "Explain the use of **hexadecimal as a shorthand for binary** and understand why it is used in this way."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Binary → hexadecimal", "Convert / What is", "1", "AS 2016 Q02.1, AS 2019 Q02.1, AS 2024 Q02.1"],
      ["Hexadecimal → decimal", "State", "1", "AS 2020 Q01.1"],
      ["Decimal → hexadecimal", "Convert", "1", "AS 2022 Q02.2"],
      ["Describe the binary → hex method (no decimal)", "Describe / Explain", "2", "AS 2017 Q02.1, A-level 2022 Q01.1"],
      ["Why programmers use hexadecimal", "Explain / State", "1", "AS 2016 Q02.2, AS 2019 Q02.2, AS 2023 Q02.1, A-level 2022 Q01.2"],
      ["Which of three bases holds the largest value?", "Shade", "1", "A-level 2018 Q01.1"],
      ["Hex → binary, add, back to hex", "Convert, show working", "2", "AS 2018 Q02.2"],
      ["Trace a base-conversion algorithm", "Complete the trace table", "5", "AS 2017 P1 Q02.1"],
      ["Program a decimal → binary algorithm; state its purpose", "Write / What is the purpose", "11 + 1", "AS 2019 P1 Q03"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Place value in any base**.", "**Conversions** — every direction, step by step.", "**Why hexadecimal?**", "**Algorithms that convert** — trace tables and code.", "**Exam toolkit**."] },

    { page: "Place value in any base" },
    { callout: { t: "def", h: "Number base", body: "The **base** (radix) of a number system is the **number of distinct digits** it uses; each column's place value is a **power of the base**. Decimal: 10 digits, columns 10⁰, 10¹, …; binary: 2 digits (0, 1), columns 2⁰, 2¹, …; hexadecimal: 16 digits (0–9, A–F), columns 16⁰, 16¹, …" } },
    { table: { head: ["Decimal", "Binary", "Hex", "", "Decimal", "Binary", "Hex"], rows: [
      ["0", "0000", "0", "", "8", "1000", "8"], ["1", "0001", "1", "", "9", "1001", "9"], ["2", "0010", "2", "", "10", "1010", "A"], ["3", "0011", "3", "", "11", "1011", "B"],
      ["4", "0100", "4", "", "12", "1100", "C"], ["5", "0101", "5", "", "13", "1101", "D"], ["6", "0110", "6", "", "14", "1110", "E"], ["7", "0111", "7", "", "15", "1111", "F"]
    ] } },
    { callout: { t: "memorise", h: "Notation", body: "A subscript names the base: 39₁₆, 00111001₂, 57₁₀. Mark schemes accept \"#39\" for hexadecimal. Computers use **binary** because their circuits have two stable states (on/off, high/low voltage)." } },

    { page: "Conversions" },
    { h: "2.1  Binary → hexadecimal (directly, never via decimal)" },
    { ol: ["Split the bit pattern into **groups of four bits (nibbles), starting from the right** (pad the left group with 0s).", "Convert **each nibble to one hexadecimal digit** (0–9, then A–F for 10–15).", "Write the digits in the same order."] },
    { fig: bitsFig("010010101110".split(""), [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1], { cw: 40, groups: [[0, 3, "0100 → 4"], [4, 7, "1010 → A"], [8, 11, "1110 → E"]], cap: "A-level 2022: 010010101110₂ = 4AE₁₆ — nibbles from the right, one hex digit each." }) },
    { h: "2.2  Hexadecimal → binary" },
    { callout: { t: "info", h: "Key idea", body: "Replace each hex digit by its 4-bit pattern: C9₁₆ → 1100 1001₂." } },
    { h: "2.3  Binary or hex → decimal" },
    { callout: { t: "info", h: "Key idea", body: "Multiply each digit by its place value and add: C57₁₆ = 12×256 + 5×16 + 7 = 3072 + 80 + 7 = **3159**." } },
    { h: "2.4  Decimal → binary or hex: repeated division" },
    { steps: [
      { h: "1.", m: "Divide by the base; record the **remainder** (MOD) — it is the next digit, from the **right**." },
      { h: "2.", m: "Replace the number by the **quotient** (DIV)." },
      { h: "3.", m: "Repeat until the quotient is 0; read the remainders bottom-to-top." }
    ] },
    { table: { head: ["193 DIV 16", "remainder (MOD 16)", "digit"], rows: [["193 ÷ 16 = 12", "1", "1 (rightmost)"], ["12 ÷ 16 = 0", "12", "C"]] } },
    { callout: { t: "info", h: "Key idea", body: "So 193₁₀ = **C1₁₆**. (Or subtract place values: 193 = 128 + 64 + 1 = 1100 0001₂ = C1₁₆.)" } },
    { worked: { tag: "exam", title: "Binary → hexadecimal", src: "AS June 2016 · P2 Q02.1 · 1 mark",
      q: "Figure 1 contains the bit pattern 0 0 1 1 1 0 0 1. What is the hexadecimal equivalent of the bit pattern?",
      steps: [{ h: "Nibbles", m: "0011 | 1001 → 3 | 9" }, { m: "**39**", mk: "1 mark", n: "A. #39." }], result: "39₁₆" } },
    { worked: { tag: "exam", title: "Another conversion to hexadecimal", src: "AS June 2024 · P2 Q02.1 · 1 mark",
      q: "Convert the bit pattern 10001010 to hexadecimal.",
      steps: [{ m: "1000 | 1010 → 8 | A" }, { m: "**8A**", mk: "1 mark" }], result: "8A" } },
    { worked: { tag: "exam", title: "Hexadecimal → decimal", src: "AS June 2020 · P2 Q01.1 · 1 mark",
      q: "State the decimal equivalent of the hexadecimal number C57.",
      steps: [{ h: "Place values 256, 16, 1", m: "12 × 256 + 5 × 16 + 7 × 1 = 3072 + 80 + 7" }, { m: "**3159**", mk: "1 mark" }], result: "3159" } },
    { worked: { tag: "exam", title: "Decimal → hexadecimal", src: "AS June 2022 · P2 Q02.2 · 1 mark",
      q: "Convert the decimal number 193 to hexadecimal.",
      steps: [{ m: "193 = 12 × 16 + 1 → digits C, 1" }, { m: "**C1**", mk: "1 mark" }], result: "C1" } },
    { worked: { tag: "exam", title: "Describe the direct method", src: "A-level June 2022 · P2 Q01.1 · 2 marks",
      q: "Describe how a 12-bit unsigned binary integer such as 010010101110 can be converted directly into hexadecimal. The method you describe must not involve converting into decimal.",
      steps: [
        { m: "Put the bits into groups of four / nibbles (starting at the right);", mk: "1 mark" },
        { m: "Convert each group of bits / nibble into a hexadecimal digit;", mk: "1 mark", n: "Doing the conversion (4AE) without describing it earns nothing — \"describe\" means the method." }
      ], result: "Group into nibbles; each nibble → one hex digit" } },
    { worked: { tag: "exam", title: "Explain the method, illustrated", src: "AS June 2017 · P2 Q02.1 · 2 marks",
      q: "Explain how unsigned binary integers can be converted to hexadecimal. Illustrate your explanation with the bit pattern 00010111.",
      steps: [
        { h: "AO1 understanding", m: "The bit pattern is split into 4-bit sections; each section is converted to a hexadecimal digit, with values above 9 written as A–F;", mk: "1 mark", n: "NE. \"4 bits are converted to hexadecimal\"." },
        { h: "AO2 apply", m: "00010111 → 0001 and 0111 → 1 and 7 → **17₁₆**;", mk: "1 mark" }
      ], result: "17₁₆" } },
    { worked: { tag: "exam", title: "Which value is largest?", src: "A-level June 2018 · P2 Q01.1 · 1 mark",
      q: "Shade one lozenge to indicate which of these unsigned numbers has the largest value: binary 101101001; hexadecimal 30A; decimal 396.",
      steps: [
        { h: "Put all three in decimal", m: "101101001₂ = 256 + 64 + 32 + 8 + 1 = 361; $\\;$ 30A₁₆ = 3×256 + 0×16 + 10 = 778; $\\;$ 396" },
        { m: "**30A (hexadecimal)**", mk: "1 mark" }
      ], result: "30A₁₆" } },
    { worked: { tag: "exam", title: "Convert, add in binary, convert back", src: "AS June 2018 · P2 Q02.2 · 2 marks",
      q: "Convert the hexadecimal numbers 27 and C9 into binary. Then, in binary, add them together to work out the total. Finally, convert the total back into hexadecimal. You must show your working.",
      steps: [
        { h: "Hex → binary, digit by digit", m: "27₁₆ = 0010 0111₂; $\\;$ C9₁₆ = 1100 1001₂", mk: "1 mark", n: "This mark covers correct conversions both ways, follow-through allowed for the final hex." },
        { h: "Add (carries shown)", m: "0010 0111 + 1100 1001 = **1111 0000₂**", mk: "1 mark" },
        { h: "Back to hex", m: "1111 | 0000 → **F0₁₆**" }
      ], result: "F0₁₆" } },

    { page: "Why hexadecimal?" },
    { callout: { t: "memorise", h: "Why programmers use hexadecimal (any one point, MAX 1)", body: [
      "**More compact** when displayed — fewer digits (one hex digit per 4 bits);",
      "**Easier for people to understand / remember / read / write**;",
      "**Lower likelihood of an error** when typing in data;",
      "**Saves the programmer time** writing / typing in data;",
      "**NE.** \"takes up less space\" · **R.** \"uses less memory / storage\" — the computer still stores binary."
    ] } },
    { callout: { t: "miscon", h: "Hexadecimal does not save memory", body: "Hex is a **human** shorthand. The bit pattern in memory is identical whether you write 39₁₆ or 00111001₂. Any answer implying the computer stores or processes hex, or that it is \"easier for computers\", is **rejected**." } },
    { table: { head: ["Base", "Advantages", "Disadvantages"], rows: [
      ["Binary", "exactly what the hardware stores; bit-level detail visible (flags, masks)", "long, error-prone for people to read and type"],
      ["Hexadecimal", "4× shorter; maps directly onto nibbles and bytes; used for colours (#FF8800), MAC addresses, memory dumps", "needs converting to see individual bits; not used in arithmetic by the machine"],
      ["Decimal", "familiar for quantities", "does not map onto bit boundaries — conversion needs division"]
    ] } },
    { worked: { tag: "exam", title: "Why use hexadecimal?", src: "AS June 2023 · P2 Q02.1 · 1 mark",
      q: "Assembly language programmers can use hexadecimal to represent bit patterns instead of binary. Explain why assembly language programmers will often choose to use hexadecimal in preference to binary.",
      steps: [{ m: "Hexadecimal is more compact when displayed (fewer digits), so it is easier for people to read and remember and there is less chance of an error when typing it in.", mk: "1 mark", n: "MAX 1 — one well-stated point is enough. R. \"uses less memory\"." }],
      result: "More compact / easier for people / fewer typing errors" } },

    { page: "Algorithms that convert" },
    { h: "5.1  Hexadecimal string → decimal" },
    { code: { lang: "text", src: "FOR Count ← 1 TO 2\n  INPUT HexString\n  Number ← 0\n  FOR EACH HexDigit IN HexString     // left to right\n    Value ← ToDecimal(HexDigit)        // A→10 … F→15, '0'–'9' → ASCII − 48, else −1\n    Number ← Number * 16 + Value\n  ENDFOR\n  OUTPUT Number\nENDFOR", cap: "AS June 2017 Paper 1, Figures 3–4 (ToDecimal shown as a comment)." } },
    { callout: { t: "info", h: "Key idea", body: "The key line is **Number ← Number × 16 + Value** (Horner's method): each new digit shifts the running total one hexadecimal column left, then adds the digit. Left to right, it rebuilds the place values without powers." } },
    { worked: { tag: "exam", title: "Hand-trace the hex → decimal algorithm", src: "AS June 2017 · P1 Q02.1 · 5 marks",
      q: "Complete a trace table (Count, HexString, Number, HexDigit, Value, Output) by hand-tracing the algorithm above with the input strings \"A2\" and \"1G\".",
      steps: [
        { m: "Count 1, HexString \"A2\": Number 0 → HexDigit \"A\", Value 10, Number 0×16+10 = 10 → HexDigit \"2\", Value 2, Number 10×16+2 = 162 → Output **162**" },
        { m: "Count 2, HexString \"1G\": Number 0 → HexDigit \"1\", Value 1, Number 1 → HexDigit \"G\", Value **−1** (not a hex digit), Number 1×16 − 1 = 15 → Output **15**" },
        { m: "Count runs 1, 2 with HexString \"A2\", \"1G\" in sequence;", mk: "1 mark" },
        { m: "Number: 0, 10, 162, 0, 1, 15;", mk: "1 mark" },
        { m: "HexDigit: \"A\", \"2\", \"1\", \"G\";", mk: "1 mark" },
        { m: "Value: 10, 2, 1, −1;", mk: "1 mark" },
        { m: "Output: 162, 15;", mk: "1 mark", n: "The algorithm does not validate: \"G\" gives −1 and the program still prints a number — a good \"what is the flaw?\" follow-up." }
      ], result: "Outputs 162 and 15" } },
    { table: { head: ["Count", "HexString", "Number", "HexDigit", "Value", "Output"], rows: [
      ["1", "\"A2\"", "0", "", "", ""], ["", "", "10", "\"A\"", "10", ""], ["", "", "162", "\"2\"", "2", "162"],
      ["2", "\"1G\"", "0", "", "", ""], ["", "", "1", "\"1\"", "1", ""], ["", "", "15", "\"G\"", "−1", "15"]
    ] } },
    { h: "5.2  Decimal → binary by repeated division" },
    { code: { lang: "csharp", src: "int count = 0, partValue, numberIn, numberOut = 0;\nConsole.Write(\"Enter a positive whole number: \");\nnumberIn = Convert.ToInt32(Console.ReadLine());\nwhile (numberIn > 0)\n{\n    count++;\n    partValue = numberIn % 2;          // next binary digit (MOD)\n    numberIn = numberIn / 2;           // integer division (DIV)\n    for (int i = 1; i < count; i++)\n    {\n        partValue = partValue * 10;    // move the digit to its column\n    }\n    numberOut = numberOut + partValue;\n}\nConsole.WriteLine(\"The result is: \" + numberOut);", cap: "AS June 2019 Paper 1 Q03: the mark scheme's C# answer." } },
    { worked: { tag: "exam", title: "What is the purpose of this algorithm?", src: "AS June 2019 · P1 Q03.3 · 1 mark",
      q: "The algorithm repeatedly takes NumberIn MOD 2, halves NumberIn with DIV, multiplies the digit by 10 for each earlier pass and adds it to NumberOut. What is the purpose of this algorithm?",
      steps: [{ m: "It converts a (positive) decimal / denary number to binary.", mk: "1 mark", n: "Input 22 → 10110; 29 → 11101; −1 → 0 (the WHILE condition is false at once, so the result is 0 — no validation)." }],
      result: "Converts decimal to binary" } },
    { table: { head: ["Pass", "Count", "PartValue (MOD 2)", "NumberIn (DIV 2)", "×10 Count−1 times", "NumberOut"], rows: [
      ["start", "0", "", "22", "", "0"], ["1", "1", "0", "11", "0", "0"], ["2", "2", "1", "5", "10", "10"], ["3", "3", "1", "2", "100", "110"], ["4", "4", "0", "1", "0", "110"], ["5", "5", "1", "0", "10000", "10110"]
    ] } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Convert / What is the hex equivalent", "The answer; working helps only where marks say \"show your working\"."],
      ["Describe the method", "Two steps: group into nibbles from the right; convert each nibble to one hex digit. Describe — do not just do it."],
      ["Explain why hex", "One human benefit (compact, easier to read, fewer errors, quicker). Never memory."],
      ["Complete the trace table", "Every change of every variable, in order; the mark scheme marks each column's sequence."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Four bits, one hex\"", body: "Every hex digit is exactly one nibble — group from the **right**." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Grouping from the left (010010101110 → 0100 1010 1110 is fine because 12 is a multiple of 4; 10110 must be 0001 0110).", "Writing 10–15 as two digits instead of A–F.", "\"Hex uses less memory\" (R.).", "Losing the −1 from ToDecimal(\"G\") in the trace."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4 binary arithmetic; 4.7.3.5 assembly language uses hex for addresses and immediates; 4.9.4.3 IPv6 addresses are written in hex; 4.5.6.4 colours (#RRGGBB)." } }
  ],
  flashcards: [
    ["What is a number base?", "The number of distinct digits a system uses; place values are powers of the base."],
    ["Why do computers use binary?", "Their circuits have two states (on/off)."],
    ["Binary → hex method?", "Group into nibbles from the right; convert each nibble to a hex digit."],
    ["00111001₂ in hex?", "39."],
    ["C57₁₆ in decimal?", "3159."],
    ["193₁₀ in hex?", "C1."],
    ["Why do programmers use hex? (one)", "More compact / easier for people to read / fewer typing errors."],
    ["Does hex save memory?", "No — the computer stores the same bits (R. in mark schemes)."],
    ["Decimal → binary algorithm?", "Repeated division by 2, reading the remainders from last to first."],
    ["Hex digit for 13?", "D."]
  ],
  quiz: [
    { q: "10110111₂ in hexadecimal is", opts: ["B7", "7B", "183", "B11"], ans: 0, why: "1011 | 0111." },
    { q: "30A₁₆ in decimal is", opts: ["778", "396", "361", "30"], ans: 0, why: "3×256 + 10." },
    { q: "A valid reason for using hex is", opts: ["it is easier for people to read", "it uses less memory", "computers process hex faster", "it is more accurate"], ans: 0, why: "A human shorthand." },
    { q: "27₁₆ + C9₁₆ =", opts: ["F0₁₆", "E0₁₆", "100₁₆", "FE₁₆"], ans: 0, why: "39 + 201 = 240." },
    { q: "Number ← Number × 16 + Value builds a value from hex digits read", opts: ["left to right", "right to left", "in any order", "as nibbles"], ans: 0, why: "Each step shifts one column." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
